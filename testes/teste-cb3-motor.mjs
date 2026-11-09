/* OS PEDIDOS DA CB3 AOS MOTORES (Fase CB, 09/11/2026)

   A CB2 deixou o encontro da estrada em três tempos (encontro-na-estrada.js)
   e pediu, para a fiação da CB3 (o `oficial`), quatro peças de motor que
   não existiam. Esta suíte prova as quatro:

   §1 o encontro tem uma chamada própria do Mestre (`QUEM_RESPONDE.encontro`,
      rastro.js): a narração vem ANTES de a mesa abrir;
   §2 voltar atrás recua a jornada (`recuarViagem`, viagem.js);
   §3 o perigo verdadeiro do trecho, sem neblina (`perigoDoTrecho`,
      partida.js), pela régua do mapa — e o encontro rolado com ele nunca
      passa do degrau;
   §4 a surpresa entra na ordem (`abrirOCombate` com `iniciativa`), e a fuga
      aberta marca os inimigos (`fugaAberta` → `deixaIr`);
   §5 a fuga aberta é cumprida (`vereditoDaFuga` lê `deixaIr`);
   e os dois pedidos que a forma da batalha (formas.md §CB 12 e §CB 15)
   juntou a esta leva:
   §6 o fecho pergunta uma vez por luta (`QUANDO_O_FECHO_PERGUNTA`,
      `oFechoPergunta`, golpe-final.js);
   §7 o d20 do golpe vai à bandeja com as faces que acertam
      (`lancamentoDoAtaque`, motor/a-bandeja.js).
   Imutabilidade e lixo em cada secção. */
import { QUEM_RESPONDE, quemResponde } from "../src/rastro.js";
import { recuarViagem, abrirViagem, andar, pausarViagem, ESTADOS } from "../src/viagem.js";
import { perigoDoTrecho, VEREDITO_DA_PARTIDA } from "../src/partida.js";
import { perigoDaEstradaComMotivo, PERIGO_NA_ESTRADA } from "../src/mapa-vivo.js";
import { rolarEncontro, perigoDaCriatura } from "../src/encontros.js";
import { abrirOCombate } from "../src/motor/combate-do-turno.js";
import { DESFECHOS_DO_ENCONTRO, ESCOLHAS_DO_ENCONTRO } from "../src/encontro-na-estrada.js";
import { vereditoDaFuga } from "../src/fuga.js";
import { PERIGO_POR_NIVEL } from "../src/regiao.js";
import { TERRENO_VIAGEM } from "../src/geografia.js";
import { rng, hashSemente } from "../src/semente.js";
import { QUANDO_O_FECHO_PERGUNTA, oFechoPergunta, ESCOLHAS_DO_GOLPE_FINAL } from "../src/golpe-final.js";
import { lancamentoDoAtaque, naBandeja } from "../src/motor/a-bandeja.js";
import { facesQueAcertam, previsaoDoAtaque } from "../src/previsao.js";
import { resolverAtaque } from "../src/combate.js";
import { completarInimigo } from "../src/bestiario.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const PERIGOS = PERIGO_POR_NIVEL.map((p) => p.id);

/* ============================================================ */
sec("§1 o encontro tem a sua chamada, antes da mesa");
{
  const Q = QUEM_RESPONDE.encontro;
  t("a origem «encontro» existe na tabela", !!Q && Q.id === "encontro");
  t("uma chamada própria, com envelope próprio (não espera a próxima frase)", Q.chamadas === 1 && Q.envelope === "proprio");
  t("e não fala na boca do herói", Q.vozDoHeroi === false);
  t("quemResponde(\"encontro\") devolve-a", quemResponde("encontro") === Q);
  t("o sinal continua a não chamar (a origem antiga não mudou)", QUEM_RESPONDE.sinal.chamadas === 0 && QUEM_RESPONDE.sinal.envelope === "proximo");
}

/* ============================================================ */
sec("§2 voltar atrás recua a jornada");
{
  const j0 = andar(andar(abrirViagem({ de: "Vau", para: "Ravina", dia: 3, rota: { dias: 2, km: 50, terreno: "planicie" } })));
  const horas = ESCOLHAS_DO_ENCONTRO.escolhas.fugir.custo.horas;
  const r = recuarViagem(j0, horas * 60);
  t("recua os minutos do preço da escolha (as horas de «Voltar atrás»)", r.andadoMin === Math.max(0, j0.andadoMin - horas * 60), `${j0.andadoMin} → ${r.andadoMin}`);
  t("nunca abaixo de zero: quem recua mais do que andou está de volta à partida", recuarViagem(j0, 99999).andadoMin === 0);
  const conc = { ...j0, andadoMin: j0.totalMin, estado: ESTADOS.concluida };
  t("a jornada concluída que recua volta a estar em curso", recuarViagem(conc, 60).estado === ESTADOS.emCurso);
  const pausada = pausarViagem(j0, "um dragão");
  t("a pausada continua pausada (retomar é explícito)", recuarViagem(pausada, 60).estado === ESTADOS.pausada);
  t("sem minutos válidos, a jornada volta como veio", recuarViagem(j0, null) === j0 && recuarViagem(j0, -5) === j0 && recuarViagem(j0, "x") === j0);
  t("lixo: null dá null, e não estoura", recuarViagem(null, 60) === null && recuarViagem(undefined, 60) === null);
  const antes = J(j0); recuarViagem(j0, 120);
  t("imutável: a jornada recebida fica como veio", J(j0) === antes);
  t("o resto da jornada fica (destino, total, terreno)", r.para === j0.para && r.totalMin === j0.totalMin && r.terreno === j0.terreno);
}

/* ============================================================ */
sec("§3 o perigo verdadeiro do trecho, sem neblina");
{
  const MAPA = {
    cidades: [{ nome: "Vau Fincado", x: 0, y: 0, bioma: "planicie" }, { nome: "Baixo da Fonte", x: 10, y: 0, bioma: "planicie" }],
    rotas: [],
    regiao: {
      nome: "Teste", versao: 2,
      lugares: [
        { id: "ravina", nome: "A Ravina Negra", x: 5, y: 5, ato: "meio", ficha: { perigo: "mortal", quem: [{ nome: "Dragão Ancião" }, { nome: "Lobo Atroz" }] } },
        { id: "bosque", nome: "O Bosque Quieto", x: 3, y: 2, ficha: { perigo: "baixo", quem: [{ nome: "Lobo" }] } },
        { id: "torre", nome: "A Torre Calada", x: 8, y: 8, ficha: {} },
      ],
    },
  };
  const P = perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "A Ravina Negra", terreno: "planicie" });
  t("de uma povoação a um lugar mortal, a estrada é mortal", !!P && P.perigo === "mortal" && P.ponta === "mortal" && P.subiu === false, J(P));
  t("lê a ficha e não o nó visível: não recebe estado nenhum, logo nenhuma neblina o cala", !!perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "ravina", terreno: "planicie" }));
  t("quem lá anda vai junto (os nomes da ficha das pontas)", !!P && P.quem.includes("Dragão Ancião") && P.quem.includes("Lobo Atroz"), J(P && P.quem));
  t("entre duas povoações, a estrada pesa o povoado", (perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "Baixo da Fonte", terreno: "planicie" }) || {}).perigo === PERIGO_NA_ESTRADA.povoado);
  const duro = perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "O Bosque Quieto", terreno: "montanha" });
  t("o chão duro sobe um degrau (a mesma régua das arestas)", !!duro && duro.subiu === true && duro.perigo === "medio", J(duro));
  const semNo = perigoDoTrecho(MAPA, { de: "a última parada", para: "O Bosque Quieto", terreno: "planicie" });
  t("a partida que não é nó pesa como a do veredito da partida (pontaSemNo)", !!semNo && semNo.ponta === "baixo" && VEREDITO_DA_PARTIDA.pontaSemNo === "povoado");
  t("pelo nome da ficha do alvo quando o «para» falta", (perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "", alvo: { nome: "A Ravina Negra" }, terreno: "" }) || {}).perigo === "mortal");
  t("o lugar sem perigo na ficha não tem perigo que se diga: null", perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "A Torre Calada", terreno: "planicie" }) === null);
  t("destino desconhecido: null (rola pelo nível, como antes)", perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "Lugar Nenhum" }) === null);
  t("sem região (o continente): null", perigoDoTrecho({ cidades: MAPA.cidades }, { de: "Vau Fincado", para: "Baixo da Fonte" }) === null);
  t("lixo: null", perigoDoTrecho(null, null) === null && perigoDoTrecho(MAPA, null) === null && perigoDoTrecho(undefined, { para: "x" }) === null);

  /* a mesma régua das arestas, em todas as combinações */
  let difere = 0, casos = 0;
  const chaos = Object.keys(TERRENO_VIAGEM);
  for (const pa of PERIGOS) for (const chao of chaos) {
    const m = { ...MAPA, regiao: { ...MAPA.regiao, lugares: [{ id: "x", nome: "O Sítio", ficha: { perigo: pa } }] } };
    const a = perigoDoTrecho(m, { de: "Vau Fincado", para: "O Sítio", terreno: chao });
    const b = perigoDaEstradaComMotivo(PERIGO_NA_ESTRADA.povoado, pa, chao);
    casos++;
    if (!a || !b || a.perigo !== b.perigo || a.subiu !== b.subiu) difere++;
  }
  t(`o trecho e a aresta respondem igual em ${casos} combinações de ponta e chão`, difere === 0, `${difere} diferenças`);

  /* e o encontro rolado com ele nunca passa do degrau (a régua da CB1) */
  let acima = 0, perigos = 0;
  for (let i = 0; i < 1500; i++) {
    const nivel = 1 + (i % 20);
    const e = rolarEncontro("Fantasia medieval", nivel, "Teste", rng(hashSemente(`cb3|${i}`)), { perigo: P.perigo, quem: P.quem });
    if (!e || e.tipo !== "perigo") continue;
    perigos++;
    if (PERIGOS.indexOf(perigoDaCriatura(e)) > PERIGOS.indexOf(P.perigo)) acima++;
    if (e.estrada !== P.perigo) acima++;
  }
  t(`o encontro rolado com o trecho fica no degrau dele (${perigos} perigos)`, perigos > 300 && acima === 0, `${acima} fora`);
  const raso = perigoDoTrecho(MAPA, { de: "Vau Fincado", para: "Baixo da Fonte", terreno: "planicie" });
  let dragoes = 0;
  for (let i = 0; i < 1500; i++) {
    const e = rolarEncontro("Fantasia medieval", 18, "Teste", rng(hashSemente(`cb3b|${i}`)), { perigo: raso.perigo, quem: raso.quem });
    if (e && e.tipo === "perigo" && /Dragão/.test(e.criatura)) dragoes++;
  }
  t("entre duas povoações, nem o herói de nível 18 encontra um dragão", dragoes === 0, String(dragoes));
}

/* ============================================================ */
sec("§4 a surpresa na ordem, e a fuga aberta marcada");
{
  const pers = { nome: "Bran", classe: "Guerreiro", nivel: 6, vida: 50, vidaMax: 50, atributos: { forca: 3, destreza: 2, vigor: 2 }, equipados: {}, condicoes: [],
    grupo: [{ nome: "Elma", classe: "Mago", nivel: 6, vida: 30, vidaMax: 30, atributos: {}, condicoes: [] }] };
  const crus = [{ nome: "Lobo", ameaca: "comum", nivel: 4 }, { nome: "Lobo", ameaca: "comum", nivel: 4 }];
  const abrir = (extra) => abrirOCombate({ inimigosCrus: crus.map((x, i) => ({ ...x, nome: `Lobo ${i + 1}` })), pers, situacao: "encontro", planta: { bioma: "planicie", emViagem: true }, sementeDaAbertura: "cb3|abertura", ...extra },
    { sorteDoTurno: (k) => rng(hashSemente("cb3|" + k)) }).combateNoRef;
  const B = DESFECHOS_DO_ENCONTRO.bonusDeIniciativa;
  const base = abrir({});
  const mod = (c, nome) => c.ordem.find((o) => o.nome === nome).mod;
  const comHeroi = abrir({ iniciativa: "heroi" });
  t(`a emboscada a favor: o herói e o grupo somam +${B} (a tabela do encontro)`, mod(comHeroi, "Bran") === mod(base, "Bran") + B && mod(comHeroi, "Elma") === mod(base, "Elma") + B && mod(comHeroi, "Lobo 1") === mod(base, "Lobo 1"));
  const comEles = abrir({ iniciativa: "inimigos" });
  t(`visto primeiro: os inimigos somam +${B}`, mod(comEles, "Lobo 1") === mod(base, "Lobo 1") + B && mod(comEles, "Bran") === mod(base, "Bran"));
  t("o mesmo dado rola nos três (o bónus é a única diferença)", comHeroi.ordem.find((o) => o.nome === "Bran").rolo === base.ordem.find((o) => o.nome === "Bran").rolo);
  t("a surpresa fica escrita no combate (campo novo, aditivo)", comHeroi.surpresa === "heroi" && comEles.surpresa === "inimigos" && !("surpresa" in base));
  t("sem os campos, a ordem é a de sempre, byte a byte", J(abrir({ iniciativa: null }).ordem) === J(base.ordem) && J(abrir({ iniciativa: "lixo" }).ordem) === J(base.ordem));
  const aberta = abrir({ fugaAberta: true });
  t("a fuga aberta marca todo inimigo que entra com deixaIr", aberta.inimigos.length === 2 && aberta.inimigos.every((e) => e.deixaIr === true));
  t("sem ela, ninguém leva a marca", base.inimigos.every((e) => !("deixaIr" in e)));
  t("a marca não mexe na posição nem na ordem", J(aberta.ordem) === J(base.ordem) && J(aberta.inimigos.map((e) => [e.x, e.y])) === J(base.inimigos.map((e) => [e.x, e.y])));
}

/* ============================================================ */
sec("§5 a fuga aberta é cumprida");
{
  const heroi = { nome: "Bran", x: 5, y: 5 };
  const lobo = { nome: "Lobo", ameaca: "comum", vida: 10, vidaMax: 10, x: 5, y: 6, condicoes: [] };
  const fecha = vereditoDaFuga({ heroi, inimigos: [lobo], passoHeroiM: 3, desengajar: true });
  t("sem a marca, o lobo alcança quem recua devagar", fecha.escapa === false, J(fecha.quemAlcanca));
  const solta = vereditoDaFuga({ heroi, inimigos: [{ ...lobo, deixaIr: true }], passoHeroiM: 3, desengajar: true });
  t("com deixaIr, ninguém persegue: escapa", solta.escapa === true && solta.quemAlcanca.length === 0, J(solta));
  t("e o perseguidor diz que deixou ir", solta.perseguidores[0].deixaIr === true && solta.perseguidores[0].alcanca === false);
  const auto = vereditoDaFuga({ heroi, inimigos: [{ ...lobo, deixaIr: true }], passoHeroiM: 3 });
  t("o melhor modo é o que não leva golpe (recuar de guarda erguida)", auto.escapa === true && auto.golpes.length === 0, auto.modo);
  const corre = vereditoDaFuga({ heroi, inimigos: [{ ...lobo, deixaIr: true }], passoHeroiM: 3, desengajar: false });
  t("correndo, o golpe de quem está colado continua (é reação, não perseguição)", corre.golpes.includes("Lobo") && corre.escapa === true);
  t("parado, nem a fuga aberta tira o herói do lugar", vereditoDaFuga({ heroi, inimigos: [{ ...lobo, deixaIr: true }], passoHeroiM: 0 }).escapa === false);
}

/* ============================================================ */
sec("§6 o fecho uma vez por luta (CB8, formas.md §CB 6)");
{
  const T = QUANDO_O_FECHO_PERGUNTA;
  t("a tabela é a da forma: último e importante perguntam, o aliado não, lembra poupar, uma vez por luta",
    T.ultimoInimigo === true && T.importante === true && T.peloAliado === false && T.lembra === "poupar" && T.porLuta === 1 && Object.isFrozen(T));
  const b1 = { nome: "Bandido 1", vida: 6 }, b2 = { nome: "Bandido 2", vida: 9 }, b3 = { nome: "Bandido 3", vida: 9 };
  const leva = { tipo: "ataque", resultado: "acerta", dano: 8 };
  const meio = oFechoPergunta({ alvo: b1, r: leva, inimigos: [b1, b2, b3] });
  t("a queda do meio não pergunta: aplica a lembrada (poupar antes da primeira escolha)", meio.pergunta === false && meio.escolha === ESCOLHAS_DO_GOLPE_FINAL.nao_letal.id && meio.motivo === "meio");
  t("e depois de um «matar», a do meio repete-o", oFechoPergunta({ alvo: b1, r: leva, inimigos: [b1, b2, b3], lembrada: "letal" }).escolha === "letal");
  const ultimo = oFechoPergunta({ alvo: b3, r: { ...leva, dano: 12 }, inimigos: [{ ...b1, vida: 0, derrotado: true }, { ...b2, vida: 0, derrotado: true }, b3] });
  t("o último de pé pergunta", ultimo.pergunta === true && ultimo.escolha === null && ultimo.motivo === "ultimo");
  t("o importante pergunta mesmo a meio", oFechoPergunta({ alvo: { ...b1, importante: true }, r: leva, inimigos: [b1, b2] }).pergunta === true);
  t("a queda pela mão de um aliado nunca pergunta, nem a última", (() => { const x = oFechoPergunta({ alvo: b3, r: { ...leva, dano: 12 }, inimigos: [b3], peloAliado: true }); return x.pergunta === false && x.motivo === "pelo_aliado" && x.escolha === "nao_letal"; })());
  t("já perguntou uma vez nesta luta: a última também aplica a lembrada", (() => { const x = oFechoPergunta({ alvo: b3, r: { ...leva, dano: 12 }, inimigos: [b3], perguntas: 1, lembrada: "letal" }); return x.pergunta === false && x.escolha === "letal"; })());
  t("a preferência manda sobre tudo («sempre matar» nunca pergunta)", (() => { const x = oFechoPergunta({ alvo: b3, r: { ...leva, dano: 12 }, inimigos: [b3], preferencia: "sempre_letal" }); return x.pergunta === false && x.escolha === "letal" && x.motivo === "preferencia"; })());
  t("o que não é escolha (não leva a zero, área) não pergunta nem aplica", oFechoPergunta({ alvo: b2, r: { ...leva, dano: 3 }, inimigos: [b2] }).escolha === null && oFechoPergunta({ alvo: b3, r: { ...leva, dano: 12 }, inimigos: [b3], area: true }).escolha === null);
  /* a luta dos três bandidos (o caso da planta): de 2 perguntas para 1 */
  let perguntas = 0, lembrada = null;
  const vivos = [{ ...b1 }, { ...b2 }, { ...b3 }];
  const quedas = [{ alvo: 0, aliado: false }, { alvo: 1, aliado: true }, { alvo: 2, aliado: false }];
  for (const q of quedas) {
    const f = oFechoPergunta({ alvo: vivos[q.alvo], r: { ...leva, dano: 20 }, inimigos: vivos, peloAliado: q.aliado, perguntas, lembrada });
    if (f.pergunta) { perguntas++; lembrada = "letal"; }
    vivos[q.alvo] = { ...vivos[q.alvo], vida: 0, derrotado: true };
  }
  t("a luta dos três bandidos pergunta uma vez só (era duas)", perguntas === 1);
  t("lixo: sempre a forma, nunca exceção", J(oFechoPergunta(null)) === J({ pergunta: false, escolha: null, motivo: "sem_escolha" }) && oFechoPergunta({ alvo: b1 }).pergunta === false);
}

/* ============================================================ */
sec("§7 o dado do golpe rola na mesa (formas.md §CB 15)");
{
  const alvo = completarInimigo({ nome: "Lobo", ameaca: "comum" }, 5);
  const r = resolverAtaque({ rolar: rng(hashSemente("bandeja|1")), atacante: "Bran", alvo, ehAtacanteInimigo: false, bonusAtaque: 6, danoBase: 8, bonusDefesaAlvo: 2 });
  const l = lancamentoDoAtaque(r, {});
  t("o d20 da bandeja é o d20 que o golpe rolou, com o bónus e a defesa dele", !!l && l.dados.length === 1 && l.dados[0].valor === r.d20 && l.mod === r.bonus && l.alvo === r.ca && l.golpe === true, J(l));
  t("as faces que acertam são as da previsão (a mesma régua)", J(l.acertam) === J(facesQueAcertam(r.bonus, r.ca, 20)) && J(l.acertam) === J(previsaoDoAtaque({ alvo, bonusAtaque: 6, dano: 8, bonusDefesaAlvo: 2 }).faces));
  t("e a face que saiu acende exatamente quando o golpe acerta", l.acertam.includes(r.d20) === (r.resultado === "acerta" || r.resultado === "critico"));
  let difere = 0;
  for (let i = 0; i < 400; i++) {
    const vant = i % 3 === 1, desv = i % 3 === 2;
    const ri = resolverAtaque({ rolar: rng(hashSemente(`bandeja|${i}`)), atacante: "Bran", alvo, ehAtacanteInimigo: false, bonusAtaque: i % 9, danoBase: 6, vantagem: vant, desvantagem: desv, criticoEm: i % 5 === 0 ? 19 : 20 });
    const li = lancamentoDoAtaque(ri, { criticoEm: i % 5 === 0 ? 19 : 20 });
    const acertou = ri.resultado === "acerta" || ri.resultado === "critico";
    const contado = li.dados.find((d) => !d.posto);
    if (li.acertam.includes(ri.d20) !== acertou || contado.valor !== ri.d20 || li.dados.length !== ri.dados.length) difere++;
    if ((ri.resultado === "critico") !== (li.desfecho === "critico")) difere++;
  }
  t("em 400 golpes (vantagem, desvantagem, crítico em 19): a face acesa, o dado contado e o desfecho batem com o golpe", difere === 0, `${difere} diferenças`);
  const v = resolverAtaque({ rolar: rng(hashSemente("bandeja|v")), atacante: "Bran", alvo, bonusAtaque: 4, danoBase: 5, vantagem: true });
  const lv = lancamentoDoAtaque(v, {});
  t("com vantagem vão os dois dados, e o que não contou fica posto de lado", lv.dados.length === 2 && lv.dados.filter((d) => d.posto).length === 1 && lv.modo === "vantagem");
  t("a tela rola-o (não é o Véu): jaRolou false, e entra na bandeja como os outros", lv.jaRolou === false && naBandeja([], lv).length === 1);
  t("o golpe que não rolou não vai à mesa (impedido, intocável, lixo)",
    lancamentoDoAtaque({ tipo: "impedido" }) === null && lancamentoDoAtaque({ tipo: "ataque", resultado: "erra", d20: 0, dados: [] }) === null && lancamentoDoAtaque(null) === null);
}

console.log(`\nos pedidos da CB3: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
