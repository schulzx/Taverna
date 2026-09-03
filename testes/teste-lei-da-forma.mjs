/* A LEI DA FORMA (v9.165) — o porteiro do molde

   A Torre prometia desde a v9.40: "só se sobe pelo portal, e o portal
   só abre de baixo para cima". A frase morava no prompt e em lugar
   nenhum do código — regra escrita sem código atrás, a mesma classe de
   defeito que custou a missão dos três lobos. O jogador dizia "subo ao
   andar 40" e nada no sistema tinha como discordar.

   O QUE ESTA SUÍTE PROTEGE, em ordem de estrago:

   1. A TRAVA MORDE SÓ O QUE CONHECE. Um destino que o mapa não tem, um
      molde sem lei, um save antigo — tudo passa. Jogador preso numa
      cidade por bug é pior que qualquer incoerência que a trava evita.
   2. A CHAVE É FATO, NÃO OPINIÃO. A morte do guardião abre a passagem
      no registro de mortes, com a MESMA régua de nome do chefePorNome:
      réguas diferentes deixariam o registro dizer "morto" e o portal
      dizer "vivo" sobre o mesmo corpo.
   3. DETERMINISMO. O mesmo mundo dá sempre o mesmo guardião — um
      guardião que muda entre duas aberturas é um save em que ninguém
      confia.
   4. TODAS AS QUATRO FORMAS TÊM LEI DECLARADA — inclusive a das Terras
      Abertas, cuja lei é não ter trava. Declarada, não esquecida. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const LEI = await import(S + "lei-da-forma.js");
const { MOLDES, moldePorId } = await import(S + "moldes.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { SISTEMAS, sistemaPorId } = await import(S + "lexico.js");
const APP = readFileSync(S + "App.jsx", "utf8");
const PROMPT = readFileSync(S + "prompt.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const SEMENTE = "a-torre-do-teste|Fantasia medieval|42";
const torre = moldePorId("torre");
const mapaTorre = gerarGeografia(SEMENTE, torre);
const pisos = mapaTorre.cidades.slice().sort((a, b) => a.z - b.z);

sec("1. AS QUATRO FORMAS DECLARAM A PRÓPRIA LEI");
{
  t("a Torre tem a lei do guardião", (LEI.leiDe(torre) || {}).id === "guardiao");
  t("o Arquipélago tem a lei da maré", (LEI.leiDe(moldePorId("arquipelago")) || {}).id === "mare");
  t("o Braço Estelar tem a lei da rota", (LEI.leiDe(moldePorId("estelar")) || {}).id === "rota");
  /* a lei das Terras Abertas é NÃO TER TRAVA — declarada, não esquecida:
     o campo existe no molde, com null dentro */
  const sobre = moldePorId("sobremundo");
  t("as Terras Abertas declaram lei nula", LEI.leiDe(sobre) === null && "lei" in sobre);
  t("nenhum molde ficou sem o campo", MOLDES.every((m) => "lei" in m));
}

sec("2. O GUARDIÃO É DETERMINÍSTICO E CRESCE COM A ALTURA");
{
  const g1 = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", pisos[0].nome);
  const g2 = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", pisos[0].nome);
  t("o mesmo andar dá sempre o mesmo guardião", JSON.stringify(g1) === JSON.stringify(g2));
  t("e ele tem nome, espécie e nível", !!g1.nome && !!g1.especie && g1.nivel >= 2);
  const base = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", pisos[0].nome);
  const topo = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", pisos[pisos.length - 1].nome);
  t(`o do topo é mais forte que o do sopé (${base.nivel} → ${topo.nivel})`, topo.nivel > base.nivel);
  t("o do topo é lendário e tem grau divino", topo.ameaca === "lendario" && topo.gd >= 3);
  t("o do sopé não é", base.ameaca !== "lendario" && base.gd === 0);
  /* a ficha pelo nome, para a reconciliação do combate */
  const ach = LEI.guardiaoPorNome(SEMENTE, mapaTorre, "Fantasia medieval", `ataco ${g1.nomeCurto} agora`, null, torre);
  t("guardiaoPorNome acha pela mesma régua do chefePorNome", !!ach && ach.andar === pisos[0].nome);
  t("e devolve nada num molde sem essa lei", LEI.guardiaoPorNome(SEMENTE, mapaTorre, "Fantasia medieval", g1.nomeCurto, null, moldePorId("sobremundo")) === null);
  t("andar que não existe não quebra", LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", "Andar Inventado 999") === null);
}

sec("3. A TORRE TRAVA A SUBIDA — E SÓ A SUBIDA");
{
  const forma = LEI.garantirForma(null);
  const ctx = { molde: torre, semente: SEMENTE, mapa: mapaTorre, forma, genero: "Fantasia medieval", dia: 3 };
  const tv = LEI.travaDaPartida({ ...ctx, de: pisos[0].nome, para: pisos[1].nome });
  t("subir com o guardião vivo é negado", !!tv && tv.lei === "guardiao");
  t("e a recusa nomeia quem falta matar", tv.motivo.includes(tv.guardiao.nomeCurto) || tv.motivo.includes(tv.guardiao.nome));
  const pulo = LEI.travaDaPartida({ ...ctx, de: pisos[0].nome, para: pisos[3].nome });
  t("pular andar é negado mesmo sem guardião no meio", !!pulo && /andar seguinte|caminho direto/.test(pulo.motivo));
  t("e a dica aponta o próximo degrau", pulo.dica.includes(pisos[1].nome));
  t("descer é sempre livre", LEI.travaDaPartida({ ...ctx, de: pisos[2].nome, para: pisos[0].nome }) === null);
  /* o porteiro morde só o que conhece */
  t("destino que o mapa não tem passa", LEI.travaDaPartida({ ...ctx, de: pisos[0].nome, para: "Lugar Nenhum" }) === null);
  t("lixo não quebra nem morde", LEI.travaDaPartida(null) === null && LEI.travaDaPartida({}) === null);
  t("nas Terras Abertas tudo passa", LEI.travaDaPartida({ ...ctx, molde: moldePorId("sobremundo"), de: pisos[0].nome, para: pisos[3].nome }) === null);
}

sec("4. A CHAVE: A MORTE DO GUARDIÃO ABRE A PASSAGEM");
{
  const g = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", pisos[0].nome);
  const ctx = { molde: torre, semente: SEMENTE, mapa: mapaTorre, forma: LEI.garantirForma(null), genero: "Fantasia medieval", cidadeAtual: pisos[0].nome };
  t("um morto qualquer não vira chave", LEI.chaveDaMorte(ctx, "um lobo da estrada") === null);
  const abriu = LEI.chaveDaMorte(ctx, `${g.nomeCurto}, ferido, tomba diante do grupo`);
  t("a morte do guardião vira", !!abriu && abriu.para === pisos[1].nome);
  t("e marca o andar vencido na forma", !!abriu && abriu.forma.vencidos[pisos[0].nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")]);
  const dep = { ...ctx, forma: abriu.forma };
  t("a chave não vira duas vezes", LEI.chaveDaMorte(dep, g.nomeCurto) === null);
  t("e com o andar vencido a subida passa", LEI.travaDaPartida({ ...dep, de: pisos[0].nome, para: pisos[1].nome, dia: 0 }) === null);
  t("mas pular continua negado", LEI.travaDaPartida({ ...dep, de: pisos[0].nome, para: pisos[2].nome, dia: 0 }) !== null);
  /* a cena é do sistema, vestida pelo léxico quando o mundo respondeu */
  const envGen = LEI.envelopeDaPassagem(null, torre, abriu);
  t("o envelope da passagem existe e não move o herói", /A PASSAGEM ABRE/.test(envGen) && /NÃO mova o herói/.test(envGen));
  const lexCom = { gerado: true, chamado: {}, funciona: { passagem: "Um anel de runas acende no chão e o ar dentro dele vira porta." }, povos: ["a", "b"], oficios: ["a", "b", "c", "d"], criaturas: [], lugares: [], aLei: "x" };
  t("e veste a carne do léxico quando há", LEI.envelopeDaPassagem(lexCom, torre, abriu).includes("anel de runas"));
  /* o topo: vencer o último guardião é a coroa, não um erro de índice */
  const ult = pisos[pisos.length - 1];
  const gTopo = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", ult.nome);
  const coroa = LEI.chaveDaMorte({ ...ctx, cidadeAtual: ult.nome }, gTopo.nomeCurto);
  t("no último andar a chave vira sem destino", !!coroa && coroa.para === "");
  t("e o envelope é o da coroa", /A COROA/.test(LEI.envelopeDaPassagem(null, torre, coroa)));
}

sec("5. A MARÉ É FUNÇÃO DO DIA — NADA A GRAVAR, NADA A DESSINCRONIZAR");
{
  const arq = moldePorId("arquipelago");
  const lei = LEI.leiDe(arq);
  const mapaMar = gerarGeografia("mar-do-teste|77", arq);
  const rotas = mapaMar.rotas || [];
  t(`o mar tem rotas para testar (${rotas.length})`, rotas.length >= 3);
  /* determinismo e proporção: uma minoria fecha e abre com os dias */
  let presas = 0, firme = true;
  for (const r of rotas) {
    const a = LEI.mareDaRota("mar-do-teste|77", lei, r.de, r.para, 5);
    const b = LEI.mareDaRota("mar-do-teste|77", lei, r.de, r.para, 5);
    if (JSON.stringify(a) !== JSON.stringify(b)) firme = false;
    if (a.presa) presas++;
  }
  t("a maré é determinística", firme);
  t(`uma minoria das rotas é de maré (${presas}/${rotas.length})`, presas < rotas.length);
  /* toda rota presa abre dentro do ciclo — maré que nunca abre é muro */
  let semJanela = 0;
  for (const r of rotas) {
    let abriu = false;
    for (let d = 0; d < lei.periodo; d++) if (LEI.mareDaRota("mar-do-teste|77", lei, r.de, r.para, d).aberta) { abriu = true; break; }
    if (!abriu) semJanela++;
  }
  t("toda rota abre em algum dia do ciclo", semJanela === 0);
  /* e a trava lê a maré: fechada nega com prazo, aberta passa */
  const presa = rotas.find((r) => LEI.mareDaRota("mar-do-teste|77", lei, r.de, r.para, 0).presa);
  if (presa) {
    let diaFechado = -1, diaAberto = -1;
    for (let d = 0; d < lei.periodo; d++) {
      const m = LEI.mareDaRota("mar-do-teste|77", lei, presa.de, presa.para, d);
      if (!m.aberta && diaFechado < 0) diaFechado = d;
      if (m.aberta && diaAberto < 0) diaAberto = d;
    }
    const ctxM = { molde: arq, semente: "mar-do-teste|77", mapa: mapaMar, forma: null, de: presa.de, para: presa.para };
    const tv = LEI.travaDaPartida({ ...ctxM, dia: diaFechado });
    t("no dia fechado a partida é negada com prazo", !!tv && tv.abreEm >= 1 && /abre em \d/.test(tv.dica));
    t("no dia aberto ela passa", LEI.travaDaPartida({ ...ctxM, dia: diaAberto }) === null);
  } else {
    t("há pelo menos uma rota de maré neste mar (semente escolhida para ter)", false);
  }
  t("travessia sem rota registrada é mar franco", LEI.travaDaPartida({ molde: arq, semente: "s", mapa: mapaMar, de: (mapaMar.cidades[0] || {}).nome, para: "Ilha Sem Rota", dia: 0 }) === null);
}

sec("6. O BRAÇO ESTELAR SÓ SALTA POR ROTA REGISTRADA");
{
  const est = moldePorId("estelar");
  const mapaEst = gerarGeografia("braco-do-teste|9", est);
  const rota = (mapaEst.rotas || [])[0];
  t("há rotas de salto no grafo", !!rota);
  const ctxE = { molde: est, semente: "braco-do-teste|9", mapa: mapaEst, dia: 0 };
  t("salto por rota registrada passa", LEI.travaDaPartida({ ...ctxE, de: rota.de, para: rota.para }) === null);
  /* um par de sistemas SEM rota direta: existe em qualquer grafo de 2
     vizinhos com 6+ nós */
  const nomes = mapaEst.cidades.map((c) => c.nome);
  const ligados = new Set((mapaEst.rotas || []).flatMap((r) => [`${r.de}|${r.para}`, `${r.para}|${r.de}`]));
  let par = null;
  for (const a of nomes) { for (const b of nomes) { if (a !== b && !ligados.has(`${a}|${b}`)) { par = [a, b]; break; } } if (par) break; }
  if (par) {
    const tv = LEI.travaDaPartida({ ...ctxE, de: par[0], para: par[1] });
    t("salto sem rota é negado", !!tv && tv.lei === "rota");
    t("e a dica lista para onde dá para saltar", /daqui se salta para: /.test(tv.dica || "") || tv.dica === "");
  } else {
    t("o grafo de teste tem algum par sem rota direta", false);
  }
  t("destino fora do mapa passa (o porteiro não morde o que não conhece)", LEI.travaDaPartida({ ...ctxE, de: nomes[0], para: "Sistema Fantasma" }) === null);
}

sec("7. O QUE SOBE À PAUTA");
{
  const ctx = { molde: torre, semente: SEMENTE, mapa: mapaTorre, forma: LEI.garantirForma(null), genero: "Fantasia medieval", cidadeAtual: pisos[0].nome, dia: 1 };
  const p1 = LEI.leiParaPauta(ctx);
  const g = LEI.guardiaoDoAndar(SEMENTE, mapaTorre, "Fantasia medieval", pisos[0].nome);
  t("com o guardião vivo, o ONDE o nomeia", p1.onde.some((l) => l.includes(g.nomeCurto)));
  t("e o NÃO PODE fecha a subida", p1.naoPode.some((l) => /subir de andar/.test(l)));
  const vencida = LEI.chaveDaMorte(ctx, g.nomeCurto);
  const p2 = LEI.leiParaPauta({ ...ctx, forma: vencida.forma });
  t("com o andar vencido, o ONDE anuncia a passagem aberta", p2.onde.some((l) => l.includes(pisos[1].nome)));
  t("e o NÃO PODE se cala", p2.naoPode.length === 0);
  t("molde sem lei não põe linha nenhuma", LEI.leiParaPauta({ ...ctx, molde: moldePorId("sobremundo") }).onde.length === 0);
}

sec("8. A LIGAÇÃO — QUATRO BOCAS, UMA CHAVE, UM SAVE");
{
  /* as quatro bocas de partida passam pelo porteiro: o rastro, o resolver,
     a resposta à escolha e o botão/sinal em viajar() */
  t("o porteiro existe no App", /const travaDaFormaDaqui = \(destino\) =>/.test(APP));
  t("a boca do rastro confere", /const tvLei = travaDaFormaDaqui\(part\.destino\);/.test(APP));
  t("a boca do resolver confere", /const tvLei = travaDaFormaDaqui\(nome\);/.test(APP));
  t("a boca da escolha confere", /const tvLei = travaDaFormaDaqui\(escolhida\.nome\);/.test(APP));
  t("e viajar() é o pega-tudo dos botões", /const tvLei = alvoLei \? travaDaFormaDaqui\(alvoLei\) : null;/.test(APP));
  /* a chave mora no registro de mortes — o único lugar por onde toda
     morte passa */
  t("a chave vira em registrarMorte", /const abriu = chaveDaMorte\(\{/.test(APP));
  t("e grava a forma no save na hora", /salvar\(\{ forma: formaRef\.current \}\)/.test(APP));
  t("a forma viaja no save", /chao: chaoRef\.current, forma: formaRef\.current,/.test(APP));
  t("e volta do save", /formaRef\.current = garantirForma\(sv\.forma\);/.test(APP));
  /* o guardião entra na reconciliação de combate ANTES da criatura
     genérica — senão "Ogro, o Sino" lutaria com o nível do ogro comum */
  const iChefe = APP.indexOf("|| guardiaoPorNome(");
  const iCriatura = APP.indexOf("|| criaturaPorNome(");
  t("o guardião reconcilia antes da criatura genérica", iChefe > 0 && iCriatura > 0 && iChefe < iCriatura);
  t("a Pauta recebe a lei da cena", /leiParaPauta\(\{/.test(APP));
  t("o prompt fixo apresenta a lei", /LEI_DA_FORMA_PROMPT/.test(PROMPT));
  /* e o léxico pergunta pela carne da passagem na criação */
  const s = sistemaPorId("passagem");
  t("o léxico pergunta como a passagem se mostra", !!s && s.porta === "viagem");
}

console.log(`\nlei da forma v9.165: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
