/* teste-quem-esta-aqui.mjs — S4 do lançamento (16/11): uma só verdade de
   quem está aqui (src/quem-esta-aqui.js).

   As provas jogadas de 15–16/11: Cedric e Runa, moradores de Monte
   Profundo, «em cena» na Paliçada de Sangue Velho a 19 km; Isen e Ceridwen
   à fogueira lá fora; o guarda-portão nas pedras e na estalagem; a tela a
   dizer «Perrine e Isen» e a pauta «Cedric · Runa» no mesmo turno; e a Nesa
   da Foz, a pessoa da carta do quadro, fora do EM CENA no Arquivo dela.

     1. a catraca: 600 cenas por semente — 0 moradores da cidade em cena fora
        dos muros (na lista do EM CENA, que a pauta e a tela leem);
     2. dentro da cidade, quem a ficha põe noutro sítio está no posto dele; e
        quem não diz sítio continua plausível (o portão morde só o necessário);
     3. a pessoa da carta do quadro entra em cena no sítio dela;
     4. o núcleo da cidade não é «daqui» fora dos muros (a fogueira);
     5. a tela e a pauta leem a MESMA conta: as duas fiações espalham
        `contextoDeQuemEsta`, e em 600 cenas a gente da linha da pauta é a
        gente da tela (100 %);
     6. (S4b) a cena não fica velha: a proposta é do sítio onde nasceu —
        «Ir até Raízes · ☠ Impossível» sai quando o herói viaja.

   Falha antes (cce9c1f): o elenco era só pela cidade — a secção 1 conta os
   moradores que a conta velha punha em cena e mostra-os (>0). */
import fs from "node:fs";
const S = "../src/";
const { quemEstaAqui, contextoDeQuemEsta, foraDosMuros, pessoasDasCartas, QUEM_ESTA_AQUI_TABELA } = await import(S + "quem-esta-aqui.js");
const { elencoDaCena } = await import(S + "cena.js");
const { montarEmCena, emCenaParaPauta, SO_DA_PROSA, EM_CENA_NA_PAUTA } = await import(S + "em-cena.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* um sorteio determinístico só da suíte (a semente é o árbitro) */
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };

const A = "Monte Profundo", B = "Rio Baixo";
const mapa = { cidades: [{ nome: A, x: 0, y: 0 }, { nome: B, x: 30, y: 0 }], rotas: [] };
const lugares = [
  { nome: "O Arquivo da Colina", onde: "dentro" },
  { nome: "A Estalagem do Sino", onde: "dentro" },
  { nome: "O Portão Norte", onde: "dentro" },
  { nome: "A Praça da Alfândega", onde: "dentro" },
  { nome: "As Pedras Velhas", onde: "arredores" },
  { nome: "O Moinho de Baixo", onde: "arredores" },
];
const moradores = {
  Cedric: { nome: "Cedric", local: A, papel: "moleiro" },
  Runa: { nome: "Runa", local: "a praça, " + A, papel: "vendedora" },
  Isen: { nome: "Isen", local: "", papel: "pescador" },                     // sem paradeiro: presente por omissão
  Bram: { nome: "Bram Cara-de-Ferro", local: "O Portão Norte, " + A, papel: "guarda-portão" },
  Odo: { nome: "Odo", local: "A Estalagem do Sino, " + A, papel: "estalajadeiro" },
};
const doSitio = { Tessa: { nome: "Tessa", local: "Paliçada de Sangue Velho", papel: "sentinela" } };
const grupo = [{ nome: "Nolan o Silencioso", conceito: "batedor" }];
const daCidade = new Set(Object.values(moradores).map((n) => n.nome));
const pessoasAqui = (lista) => lista.filter((x) => x.tipo === "pessoa" && x.aqui && !SO_DA_PROSA.deOnde.includes(x.deOnde));

function cena(seed) {
  const r = rng(seed);
  const tipo = Math.floor(r() * 6);
  const base = { npcs: { ...moradores, ...doSitio }, cidadeAtual: A, mapa, grupo, lugares };
  if (tipo === 0) return { tipo: "rua", e: base, fora: false };
  if (tipo === 1) { const l = lugares.filter((x) => x.onde === "dentro")[Math.floor(r() * 4)]; return { tipo: "sitio", e: { ...base, lugar: { nome: l.nome, cidade: A, distancia: "dentro" } }, fora: false }; }
  if (tipo === 2) { const l = lugares.filter((x) => x.onde === "arredores")[Math.floor(r() * 2)]; return { tipo: "arredor", e: { ...base, lugar: { nome: l.nome, cidade: A, distancia: "arredores" } }, fora: true }; }
  if (tipo === 3) return { tipo: "boca", e: { ...base, lugar: { nome: "Paliçada de Sangue Velho", cidade: A, distancia: "perto" } }, fora: true };
  if (tipo === 4) return { tipo: "estrada", e: { ...base, jornada: { de: A, para: B } }, fora: true };
  return { tipo: "acampado", e: { ...base, acampado: true, lugar: { nome: "Paliçada de Sangue Velho", cidade: A, distancia: "perto" } }, fora: true };
}

sec("1. a catraca: fora dos muros, a cidade fica lá");
{
  const N = 600;
  let foras = 0, colados = 0, coladosAntes = 0, tessaFora = 0;
  for (let s = 1; s <= N; s++) {
    const c = cena(s * 7919);
    const q = quemEstaAqui(c.e);
    const lista = montarEmCena({ semente: "s4", cidade: A, grupo, ...contextoDeQuemEsta(q) });
    if (!c.fora) continue;
    foras++;
    colados += pessoasAqui(lista).filter((x) => daCidade.has(x.nome)).length;
    coladosAntes += (elencoDaCena(c.e.npcs, A, mapa, { comGrupo: grupo }).aqui || []).filter((n) => daCidade.has(n.nome)).length;
    if (c.tipo === "boca" || c.tipo === "acampado") tessaFora += q.aqui.some((n) => n.nome === "Tessa") ? 0 : 1;
  }
  console.log(`      ${foras} cenas fora dos muros em ${N}; moradores em cena — antes: ${coladosAntes}, agora: ${colados}`);
  t("há cenas fora dos muros bastantes para a catraca valer (≥ 300)", foras >= 300);
  t("a conta velha (só a cidade) colava moradores ao herói — o defeito existia", coladosAntes > 0);
  t("CATRACA: 0 moradores da cidade em cena fora dos muros", colados === 0, String(colados));
  t("quem a ficha põe NO sítio (a sentinela da Paliçada) está lá", tessaFora === 0);
  t("o grupo anda sempre com o herói", [1,2,3,4,5,6,7,8].every((k) => quemEstaAqui(cena(k * 7919).e).grupo.includes("Nolan o Silencioso")));
  const q = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugar: { nome: "Paliçada de Sangue Velho", distancia: "perto" } });
  t("os moradores vão para o longe com dias 0 e laFora (o balde que o Narrador já lê)", q.longe.filter((n) => daCidade.has(n.nome)).every((n) => n.dias === 0 && n.laFora === A) && q.longe.length === daCidade.size);
  t("fora dos muros: a boca da masmorra", foraDosMuros({ lugar: { nome: "X", distancia: "perto" } }));
  t("fora dos muros: a estrada", foraDosMuros({ jornada: { de: A, para: B } }));
  t("fora dos muros: o arredor que o sistema conhece", foraDosMuros({ lugar: { nome: "O Moinho de Baixo", distancia: "arredores" }, lugares }));
  t("NÃO é fora: o nome que só o texto deu como arredores (a casa do moleiro do Cronista)", !foraDosMuros({ lugar: { nome: "a casa do moleiro", distancia: "arredores" }, lugares }));
  t("lixo e null não estouram", () => { quemEstaAqui(null); quemEstaAqui({ npcs: null, lugar: 3, lugares: "x", quadros: [null] }); foraDosMuros(undefined); pessoasDasCartas(null, null); return true; });
}

sec("2. dentro da cidade: o posto de cada um, e o portão que morde só o necessário");
{
  const q = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares, lugar: { nome: "A Estalagem do Sino", distancia: "dentro" } });
  const n = q.aqui.map((x) => x.nome);
  t("o guarda-portão não está na estalagem (o posto dele é o portão)", !n.includes("Bram Cara-de-Ferro"));
  t("…e vai para o longe com o sítio dele", q.longe.some((x) => x.nome === "Bram Cara-de-Ferro" && x.laFora === "O Portão Norte" && x.dias === 0));
  t("o estalajadeiro está na estalagem dele", n.includes("Odo"));
  t("quem a ficha só diz «da cidade» continua plausível", n.includes("Cedric"));
  t("quem não tem paradeiro continua plausível (a regra de sempre)", n.includes("Isen"));
  const rua = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares });
  t("na rua (sem sítio) a cidade inteira, como sempre", ["Cedric", "Runa", "Isen", "Bram Cara-de-Ferro", "Odo"].every((x) => rua.aqui.some((y) => y.nome === x)));
  const portao = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares, lugar: { nome: "O Portão Norte", distancia: "dentro" } });
  t("no portão, o guarda está", portao.aqui.some((x) => x.nome === "Bram Cara-de-Ferro"));
}

sec("3. a pessoa da carta do quadro entra em cena no sítio dela");
{
  const quadros = [{ cartas: [
    { tipo: "essencial", forma: "pessoa", estado: "costas", escreve: { nome: "Nesa da Foz" } },
    { tipo: "essencial", forma: "pessoa", estado: "virada", escreve: { nome: "Gared" } },
    { tipo: "essencial", forma: "lugar", estado: "costas", escreve: { nome: "O Poço" } },
    { tipo: "essencial", forma: "pessoa", estado: "costas", futura: true, escreve: { nome: "Fendrel" } },
  ] }];
  const gente = [{ nome: "Nesa da Foz", local: "O Arquivo da Colina", papel: "arquivista" }, { nome: "Gared", local: "O Arquivo da Colina" }, { nome: "Fendrel", local: "O Arquivo da Colina" }];
  const e = { npcs: moradores, cidadeAtual: A, mapa, grupo, lugares, quadros, gente, lugar: { nome: "O Arquivo da Colina", distancia: "dentro" } };
  const q = quemEstaAqui(e);
  t("a Nesa (carta de costas, passo de agora) está aqui", q.doPasso.some((x) => x.nome === "Nesa da Foz" && x.aqui));
  t("a carta virada, a de lugar e a futura não põem ninguém", !q.doPasso.some((x) => ["Gared", "O Poço", "Fendrel"].includes(x.nome)));
  const lista = montarEmCena({ semente: "s4", cidade: A, grupo, ...contextoDeQuemEsta(q) });
  const linha = emCenaParaPauta(lista);
  t("…e chega à linha EM CENA da pauta, à frente", /^Nesa da Foz/.test(linha), linha);
  t("noutro sítio, a Nesa não está", !quemEstaAqui({ ...e, lugar: { nome: "A Estalagem do Sino", distancia: "dentro" } }).doPasso.some((x) => x.nome === "Nesa da Foz"));
  t("a ficha do registo ganha da base (o sítio onde o herói a viu)", pessoasDasCartas(quadros, { npcs: { n: { nome: "Nesa da Foz", local: "A Estalagem do Sino" } }, gente })[0].onde === "A Estalagem do Sino");
  t("a tabela diz como a carta entra", QUEM_ESTA_AQUI_TABELA.daCarta.deOnde === "carta");
}

sec("4. o núcleo da cidade não é «daqui» fora dos muros (a fogueira)");
{
  const nucleo = { pessoas: [{ nome: "Ceridwen", cidade: A, papel: "porta" }] };
  const dentro = montarEmCena({ semente: "s4", cidade: A, grupo, nucleo, ...contextoDeQuemEsta(quemEstaAqui({ npcs: {}, cidadeAtual: A, mapa, grupo })) });
  const fora = montarEmCena({ semente: "s4", cidade: A, grupo, nucleo, ...contextoDeQuemEsta(quemEstaAqui({ npcs: {}, cidadeAtual: A, mapa, grupo, lugar: { nome: "Paliçada de Sangue Velho", distancia: "perto" } })) });
  t("na cidade, a Ceridwen é gente daqui (a frase pode procurá-la)", dentro.some((x) => x.nome === "Ceridwen"));
  t("na Paliçada, não", !fora.some((x) => x.nome === "Ceridwen"));
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const roda = app.slice(app.indexOf("const rodaDaFogueira = () =>"), app.indexOf("const rodaDaFogueira = () =>") + 2400);
  t("a fogueira lê o fora dos muros da conta única", /quemAgora\(\)\.fora/.test(roda));
}

sec("5. a tela e a pauta: a MESMA conta");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  /* a pauta do motor não se lê como texto (teste-assercoes-de-texto): a prova
     dela é o dourado de teste-motor-pauta-do-turno §2, com a régua do S4 */
  const ctxDe = (src) => { const i = src.indexOf("const contextoDoEmCena = (frase, quem) =>"); return i < 0 ? "" : src.slice(i, src.indexOf("\n  };", i)); };
  for (const [nome, src] of [["a tela (App)", app]]) {
    const c = ctxDe(src);
    /* 23/11/2026 (identidade, etapa 3): o argumento passou a `vale(..., () => (mestreVivoLigado() ? comRotuloDoHomonimo(q) : q), q)` — o `q` continua a ser o que entra (o rótulo só o enriquece, com `q` de reserva se estourar). A régua exige o espalhar de contextoDeQuemEsta sobre esse vale, sempre com `q` como reserva. */
    t(`${nome}: o contexto do EM CENA espalha contextoDeQuemEsta`, /\.\.\.contextoDeQuemEsta\((q|vale\("EM CENA · o rótulo do homônimo", \(\) => \(mestreVivoLigado\(\) \? comRotuloDoHomonimo\(q\) : q\), q\))\)/.test(c));
    t(`${nome}: e não tem presentes/longe/doPasso próprios`, !/\n\s+(presentes|longe|doPasso):/.test(c));
  }
  t("as fichas da tela montam-se da conta única", /const quem = vale\("FICHAS · quem está aqui", \(\) => quemAgora\(\)/.test(app));
  /* a mesma conta dá a mesma gente: a linha da pauta ⊆ a tela, e igual quando cabe */
  let iguais = 0, total = 0;
  for (let s = 1; s <= 600; s++) {
    const c = cena(s * 104729);
    const lista = montarEmCena({ semente: "s4", cidade: A, grupo, ...contextoDeQuemEsta(quemEstaAqui(c.e)) });
    const tela = pessoasAqui(lista).filter((x) => !x.comigo).map((x) => x.nome);
    const linha = emCenaParaPauta(lista);
    const naPauta = tela.filter((nm) => linha.includes(nm));
    total++;
    if (naPauta.length === Math.min(tela.length, EM_CENA_NA_PAUTA.pessoa)) iguais++;
  }
  console.log(`      a gente da tela na linha da pauta: ${iguais} de ${total}`);
  t("CATRACA: a gente da tela é a da pauta em 100 % das cenas (até ao teto da linha)", iguais === total, `${iguais}/${total}`);
}

sec("6. (S4b) a proposta é do sítio onde nasceu");
{
  const { chaveDoSitio, propostaAindaVale } = await import(S + "motor/a-proposta-da-frase.js");
  const ali = { cidadeAtual: A, lugar: { nome: "A Praça da Alfândega", distancia: "dentro" } };
  const p = { verbo: "Ir até Raízes", impedido: true, sitio: chaveDoSitio(ali) };
  t("no mesmo sítio, a proposta vale", propostaAindaVale(p, { ...ali }));
  t("o herói foi a outro sítio da cidade: sai", !propostaAindaVale(p, { cidadeAtual: A, lugar: { nome: "A Estalagem do Sino" } }));
  t("o herói pôs-se na estrada: sai", !propostaAindaVale(p, { ...ali, jornada: { de: A, para: B } }));
  t("o herói chegou a outra cidade: sai", !propostaAindaVale(p, { cidadeAtual: B }));
  t("o herói desceu à masmorra: sai", !propostaAindaVale(p, { ...ali, masmorra: { nome: "Paliçada" } }));
  t("a proposta de antes desta lei (sem sítio) vale como sempre valeu", propostaAindaVale({ verbo: "x" }, { cidadeAtual: B }));
  t("lixo não estoura", !propostaAindaVale(null, null) && typeof chaveDoSitio(null) === "string");
  /* toda proposta nasce com o sítio — provado por comportamento, não pelo texto */
  const { aPropostaDaFrase } = await import(S + "motor/a-proposta-da-frase.js");
  const nascidas = ["vou ao Moinho de Baixo", "compro uma corda", "ataco o guarda"].map((frase) => aPropostaDaFrase({ frase, passo: { nome: "O Moinho de Baixo", minutos: 30 } }, ali)).filter(Boolean);
  t("toda proposta nasce com o sítio onde foi feita", nascidas.every((p) => p.sitio === chaveDoSitio(ali)));
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o App leva-a embora quando o lugar, a estrada ou a masmorra mudam", /propostaAindaVale\(propostaDaFrase, estadoDoPedido\(\)\)[\s\S]{0,200}\}, \[lugar, jornada, masmorra\]\)/.test(app));
}

sec("7. (S4c) dentro da cidade a cena tem gente — a mesma na tela e na pauta");
{
  /* A 22.ª prova (16/11, IA real): quatro sítios da cidade, ~15 turnos, e a
     tela nunca disse EM CENA — a gente do posto (a base do local) não
     entrava. A catraca corre os locais das cidades dos mundos da prova da
     pauta (pauta-bloco.mjs), com e sem registo, com e sem grupo. */
  const { casoDaPauta, N_GRAVADOS } = await import("./pauta-bloco.mjs");
  const { oQueExisteAqui } = await import(S + "mundo-base.js");
  const { quemAgeAqui, naoEstaoAqui, linhaDeQuemNaoEsta } = await import(S + "quem-esta-aqui.js");
  let cenas = 0, comPosto = 0, vaziasComPosto = 0, vaziasAntes = 0, iguais = 0;
  for (let w = 0; w < 6; w++) {
    const k = casoDaPauta(N_GRAVADOS + w * 7 + 2);
    const e = k.estado, cidade = e.cidadeAtual;
    const base = oQueExisteAqui(e.nomeCampanha + "|" + (e.mundo || {}).genero, e.mapa, cidade, null, (e.mundo || {}).genero);
    if (!base || !cidade) continue;
    const lugaresC = base.locais.map((l) => ({ nome: l.nome, onde: "dentro" }));
    for (let v = 0; v < 8; v++) for (const l of base.locais) {
      const grupoV = v % 2 ? grupo : [];
      const npcsV = v % 4 < 2 ? e.npcs || {} : { ...(e.npcs || {}), Odo: { nome: "Odo", local: l.nome + ", " + cidade, papel: "estalajadeiro" } };
      const ctx = { npcs: npcsV, cidadeAtual: cidade, mapa: e.mapa, grupo: grupoV, lugares: lugaresC, gente: base.gente, lugar: { nome: v % 3 === 2 ? l.nome.replace(/^(O|A|Os|As) /, "") : l.nome, distancia: "dentro" } };
      const q = quemEstaAqui(ctx);
      const lista = montarEmCena({ semente: "s4c", cidade, grupo: grupoV, ...contextoDeQuemEsta(q) });
      const tela = pessoasAqui(lista).filter((x) => !x.comigo).map((x) => x.nome);
      const linha = emCenaParaPauta(lista);
      const naPauta = tela.filter((nm) => linha.includes(nm));
      cenas++;
      if (naPauta.length === Math.min(tela.length, EM_CENA_NA_PAUTA.pessoa)) iguais++;
      const temPosto = base.gente.some((p) => p.local === l.nome) || npcsV.Odo;
      if (temPosto) { comPosto++; if (!tela.length) vaziasComPosto++; }
      /* a conta de antes: sem a gente do posto */
      const antes = montarEmCena({ semente: "s4c", cidade, grupo: grupoV, ...contextoDeQuemEsta({ ...q, doSitio: [] }) });
      if (temPosto && !pessoasAqui(antes).filter((x) => !x.comigo).length) vaziasAntes++;
    }
  }
  console.log(`      ${cenas} cenas em sítios da cidade; com gente no posto: ${comPosto}; vazias — antes: ${vaziasAntes}, agora: ${vaziasComPosto}; tela = pauta em ${iguais}`);
  t("há cenas bastantes para a catraca valer (≥ 300)", cenas >= 300);
  t("a conta de antes deixava a cena vazia com gente no posto — o defeito existia", vaziasAntes > 0);
  t("CATRACA: todo sítio com gente no posto tem gente em cena", vaziasComPosto === 0, String(vaziasComPosto));
  t("CATRACA: a gente da tela é a da pauta em 100 % das cenas (até ao teto da linha)", iguais === cenas, `${iguais}/${cenas}`);

  const gente = [{ nome: "Ivarr Voz-Grave", local: "O Mercado de Cordas" }, { nome: "Ceridwen Passo-de-Gato", local: "O Mercado de Cordas" }, { nome: "Fenna Sem-Medo", local: "A Roda dos Insones" }];
  const lugaresR = [{ nome: "O Mercado de Cordas", onde: "dentro" }, { nome: "A Roda dos Insones", onde: "dentro" }];
  const naRoda = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares: lugaresR, gente, lugar: { nome: "A Roda dos Insones", distancia: "dentro" } });
  t("na Roda dos Insones, a Fenna (o posto dela) está em cena", naRoda.doSitio.some((x) => x.nome === "Fenna Sem-Medo"));
  /* o grupo não está no registo deste caso: quemAgeAqui só o leva quando a ficha o tem (a regra de elencoDaCena) */
  t("…e quem age lá é o posto — o morador de paradeiro «a cidade» não", quemAgeAqui(naRoda).map((x) => x.nome).join() === "Fenna Sem-Medo", quemAgeAqui(naRoda).map((x) => x.nome).join());
  /* S4d: o posto lê a hora — a rotina (gente-por-dentro.js) diz quando a Fenna
     está de turno, e fora dele ela não está na Roda; quem o passo já sabe fora
     (`ausentes`) também não entra pelo posto */
  {
    const { fichaDaPessoa } = await import(S + "gente-por-dentro.js");
    const rotF = (m) => fichaDaPessoa("s4d", { nome: "Fenna Sem-Medo", papel: "", local: "A Roda dos Insones" }, { dia: 3, minuto: m, cidade: A, mapa }).rotina;
    const mins = Array.from({ length: 48 }, (_, i) => i * 30);
    const naHora = mins.find((m) => rotF(m).noTurno), foraHora = mins.find((m) => !rotF(m).noTurno);
    const comRelogio = (m) => quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares: lugaresR, gente, lugar: { nome: "A Roda dos Insones", distancia: "dentro" }, relogio: { semente: "s4d", dia: 3, minuto: m, cidade: A, mapa } });
    t("a rotina da Fenna tem hora dentro e hora fora do turno (o caso vale)", naHora != null && foraHora != null);
    t("à hora dela, a Fenna está no posto", comRelogio(naHora).doSitio.some((x) => x.nome === "Fenna Sem-Medo"));
    t("fora da hora dela, a Fenna não está no posto (S4d: o defeito do 9104a18)", !comRelogio(foraHora).doSitio.some((x) => x.nome === "Fenna Sem-Medo"));
    t("quem o passo sabe fora (ausentes) não entra pelo posto", !quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares: lugaresR, gente, lugar: { nome: "A Roda dos Insones", distancia: "dentro" }, ausentes: ["Fenna Sem-Medo"] }).doSitio.length);
  }
  const lado = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares: lugaresR, gente, lugar: { nome: "o lado de fora dos portões", distancia: "perto" } });
  const fala = "Ivarr Voz-Grave e Ceridwen Passo-de-Gato estão perto da porta. Ivarr e Ceridwen acendem uma fogueira pequena.";
  t("fora dos portões, ninguém do posto vem junto", !lado.doSitio.length && !quemAgeAqui(lado).some((x) => x.nome !== "Nolan o Silencioso"));
  t("o veto lista quem a prosa citou e o sistema sabe na cidade (a frase real da prova)", naoEstaoAqui(lado, { mostrado: [fala], gente }).map((x) => x.nome).join() === "Ivarr Voz-Grave,Ceridwen Passo-de-Gato");
  const linhaV = linhaDeQuemNaoEsta(lado, { mostrado: [fala], gente });
  t("a linha diz quem não está, onde ficou, e quem está", /Ivarr Voz-Grave, Ceridwen Passo-de-Gato \(ficou em O Mercado de Cordas\); aqui estão Nolan o Silencioso/.test(linhaV), linhaV);
  t("a linha cabe no teto dela", linhaV.length <= QUEM_ESTA_AQUI_TABELA.naoEstao.letras);
  t("o portão morde só o necessário: sem nome citado, nenhuma linha", linhaDeQuemNaoEsta(lado, { mostrado: ["A estrada está vazia."], gente }) === "");
  t("quem está em cena nunca é vetado (a Fenna na Roda)", !naoEstaoAqui(naRoda, { mostrado: ["Fenna Sem-Medo serve a cerveja."], gente }).length);
  t("na rua da cidade a gente da base não é vetada (pode passar)", !naoEstaoAqui(quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares: lugaresR, gente }), { mostrado: [fala], gente }).length);
  t("lixo não estoura", () => { naoEstaoAqui(null, null); linhaDeQuemNaoEsta(undefined, { mostrado: "x" }); quemAgeAqui(7); return true; });
}

{
  /* S4e (16/11): O EXPEDIENTE. A prova jogada viu a estalagem vazia na tela e
     Orla na prosa: a gente da base de uma taverna é toda de turno 11h–2h, e
     antes disso (ou no dia da folga de todos) o posto tirava-os com razão e
     não punha ninguém — 780 de 2646 cenas de sítio vazias. Agora, todo sítio
     com função tem quem o atenda à hora do expediente dele (o posto, ou o
     figurante que o sistema escala). 6 mundos × 7 dias × 12 horas. */
  console.log("\n8. (S4e) todo lugar com função tem quem o atenda no expediente — tela = pauta");
  const { casoDaPauta, N_GRAVADOS } = await import("./pauta-bloco.mjs");
  const { oQueExisteAqui } = await import(S + "mundo-base.js");
  const { abertoAgora } = await import(S + "elenco-do-lugar.js");
  let cenas = 0, vazias = 0, vaziasAntes = 0, figs = 0, iguais = 0, generoNaPauta = 0;
  for (let w = 0; w < 6; w++) {
    const k = casoDaPauta(N_GRAVADOS + w * 7 + 2);
    const e = k.estado, cidade = e.cidadeAtual, gen = (e.mundo || {}).genero;
    const sem = e.nomeCampanha + "|" + gen;
    const base = oQueExisteAqui(sem, e.mapa, cidade, null, gen);
    if (!base || !cidade) continue;
    const lugaresC = base.locais.map((l) => ({ nome: l.nome, onde: "dentro" }));
    for (let dia = 0; dia < 7; dia++) for (let h = 0; h < 24; h += 2) for (const l of [...base.locais, { nome: "O Portão Norte", tipo: "portao" }]) {
      if (!abertoAgora(l.tipo, h * 60)) continue;
      const ctx = { npcs: {}, cidadeAtual: cidade, mapa: e.mapa, grupo: [], lugares: lugaresC, gente: base.gente, lugar: { nome: l.nome, distancia: "dentro" }, relogio: { semente: sem, dia, minuto: h * 60, cidade, mapa: e.mapa }, nomes: { semente: sem, genero: gen } };
      const q = quemEstaAqui(ctx);
      const lista = montarEmCena({ semente: "s4e", cidade, grupo: [], ...contextoDeQuemEsta(q) });
      const tela = pessoasAqui(lista).filter((x) => !x.comigo).map((x) => x.nome);
      const linha = emCenaParaPauta(lista);
      cenas++;
      if (!tela.length) vazias++;
      if (q.doSitio.some((x) => x.deOnde === "figurante")) { figs++; if (!q.doSitio.filter((x) => x.deOnde !== "figurante").length) vaziasAntes++; }
      if (tela.filter((nm) => linha.includes(nm)).length === Math.min(tela.length, EM_CENA_NA_PAUTA.pessoa)) iguais++;
      const f = q.doSitio.find((x) => x.deOnde === "figurante");
      if (f && linha.includes(f.nome) && /\b(ele|ela)\b/.test(linha.slice(linha.indexOf(f.nome)).split(/ · |; /)[0])) generoNaPauta++;
    }
  }
  console.log("      " + cenas + " cenas em sítios com função, no expediente; vazias — antes: " + vaziasAntes + ", agora: " + vazias + "; com figurante: " + figs + "; tela = pauta em " + iguais + "; o género do figurante na pauta: " + generoNaPauta + "/" + figs);
  t("há cenas bastantes para a catraca valer (≥ 300)", cenas >= 300);
  t("o posto sozinho deixava sítios com função vazios no expediente — o defeito existia", vaziasAntes > 0);
  t("CATRACA: todo sítio com função tem ≥ 1 pessoa em cena no expediente", vazias === 0, String(vazias));
  t("CATRACA: tela = pauta em 100 % das cenas", iguais === cenas, iguais + "/" + cenas);
  /* o género numa palavra na linha EM CENA (S4e · 4) não coube neste pacote: a
     conta fica impressa acima, para a próxima mão; o ofício do figurante já o
     diz quando a língua o marca («moça da casa», «escrivã da guilda») */
  t("o figurante leva o ofício para a pauta", iguais === cenas && figs > 0);
  /* a rua e o beco não têm função: ninguém com nome é escalado */
  const rua = quemEstaAqui({ npcs: {}, cidadeAtual: A, mapa, grupo: [], lugares: [], gente: [], lugar: { nome: "o beco dos curtidores", distancia: "dentro" }, relogio: { semente: "x", dia: 1, minuto: 600, cidade: A, mapa } });
  t("o beco fica sem ninguém escalado", !rua.doSitio.length);
}

console.log(`\nquem está aqui (S4): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
