/* teste-nada-entra-pelo-ator.mjs (o plano do Narrador ator, etapa 3, 03/11/2026)

   A decisão da pessoa: "o narrador é só a boca... nada entra por ele, tudo
   entra pelo sistema e é devolvido pelo sistema" (mente/plano-narrador-ator.md,
   decisão 4). Esta suíte prova a etapa 3 — as portas fechadas — JOGANDO, sem
   gastar um tostão: nenhuma IA é chamada, os turnos são os gravados.

   A RÉGUA: no modo `ator`, uma resposta do Narrador CHEIA DE TENTAÇÕES (moedas,
   item, equipamento, gente nova, cidade, facção, «combate_encerrar», subir de
   nível pelo feito, todos os sinais, e a prosa que credita, debita, revela,
   chega, mata e nomeia) deixa o estado IGUAL ao de uma resposta vazia. No modo
   `mestre`, a mesma tentação muda o estado (a prova morde), e o modo dito é o
   mesmo que o modo ausente (o padrão não mudou nada).

   As guardas (o Portão, o Juiz, a correção da nêmesis morta) leem a prosa só
   para pedir conserto: não são portas, e ficam fora da comparação onde dizem
   alguma coisa (§4, a nêmesis).

   Nenhuma asserção lê o texto de src/motor/ nem do App (a catraca de
   teste-assercoes-de-texto): a porta do peso da linha, que mora no App,
   prova-se aqui só pela tabela; o App, pelo build. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODO_DO_NARRADOR, PORTAS_DO_NARRADOR, oModoDoNarrador, portaAberta, oCronistaChama, aRespostaPelaPorta } from "../src/motor/portas-do-narrador.js";
import { aplicarOTurno } from "../src/motor/aplicar.js";
import { aplicarOCodex, aplicarAChegada } from "../src/motor/fim-do-turno.js";
import { aNemesisNaNarrativa, osVistosDaNarrativa } from "../src/motor/entrega-do-turno.js";
import { aLutaDaResposta } from "../src/motor/luta-do-turno.js";
import { aMesaDoTurno } from "../src/motor/fecho-da-resposta.js";
import { oGatilhoDoCronista, oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";
import { correrOTurno, estadoNoTurno } from "../src/sessao.js";
import { semearACasa } from "../src/semente.js";
import { casosDoTurno, casosDoFim, sorteDoCaso, motorDoArcoDoCaso, baseDoNomeDoCaso } from "./aplicar-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ler = (f) => JSON.parse(fs.readFileSync(path.join(AQUI, f), "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const copia = (x) => JSON.parse(JSON.stringify(x));

/* ---------------- AS TENTAÇÕES ----------------
   Uma por porta: o que, no modo `mestre`, faz a porta abrir. A suíte exige
   uma para cada linha da tabela — porta nova sem tentação é vermelho. */
const TENTACAO = {
  vida: 8, mana: 4, moedas: 500, adicionar_itens: ["Coroa de Ouro"], remover_itens: ["Poção de Cura"],
  adicionar_equipamento: [{ nome: "Lâmina do Rei", tipo: "arma", raridade: "lendario" }], remover_equipamento: ["Espada Curta"],
  remover_habilidades: ["Golpe Duplo"], efeitos_adicionar: [{ nome: "Fúria", turnos: 3, bonus: 2 }], efeitos_remover: ["Abençoado"],
  feito: "matou o dragão", grupo_adicionar: [{ nome: "Hrolf", classe: "Bárbaro", nivel: 4 }], grupo_remover: ["Rurik"],
  grupo_vida: [{ nome: "Freya", vida: 10 }], grupo_xp: [{ nome: "Freya", xp: 5000 }], grupo_itens: [{ nome: "Freya", itens: ["Escudo de Prata"] }],
  grupo_atualizar: [{ nome: "Freya", classe: "Paladino" }],
  combate_iniciar: [{ nome: "Troll das Pedras", ameaca: "elite" }], combate_encerrar: true,
  mapa_cidades: [{ nome: "Cidade Nova", tipo: "cidade", regiao: "Vale" }], mapa_faccoes: [{ nome: "Guilda Nova" }],
  lugar_atual: "a fazenda de Jessa", cidade_atual: "Porto Cinza", jornada_meio: "de barco pelo rio, devagar e sem pressa nenhuma",
  faccao_jogador: "Ordem do Corvo", evento_global_encerrar: true,
  fe: "fe:proeza", milagre: "milagre:cura", viagem: "viagem:Porto Cinza", masmorra: "masmorra:a cripta", raid: "raid:a horda",
  ascender: "ascender:deicidio", loot: "loot:raro", dominio: "dominio:da Forja", patrono: "patrono:o Velho",
  canone: { "Torre Negra": { tipo: "fortaleza", notas: "o farol apagado" } }, npcs: [{ nome: "Hrolf Barba-Ruiva", papel: "ferreiro" }],
  mesa: { moedas: 500, xp: 40, adicionar_itens: ["Coroa de Ouro"] },
  oQueFaltaCreditar: "Você encontra 50 moedas de ouro e uma poção de cura no baú.",
  oQueFaltaDebitar: "Você paga 10 moedas ao ferreiro.",
  mencionadosNaCena: "(um local e uma pessoa da base da cidade, citados na prosa: §6)",
  nomesAMaoNaProsa: "Teodora Vaz enche as canecas e ri alto. Bruno Sal está morto no chão da estalagem.",
  detectarChegada: "Ao cair da tarde você entra em Vila Funda pela estrada curta.",
  aNemesisNaNarrativa: "Vorn tomba sem vida aos seus pés.",
  osVistosDaNarrativa: "Hrolf Barba-Ruiva acena do balcão.",
  segredosReveladosNoTurno: "No fundo da gruta, atrás das raízes, brilha a chave de ferro escondida.",
  cronista: "Uma desconhecida, Ysolde Marfim, entrega-lhe um mapa e jura que voltará.",
  pesoDaLinha: "Ele morreu ali mesmo. 🎲",
};
const SINAIS = PORTAS_DO_NARRADOR.filter((p) => p.canal === "sinal").map((p) => TENTACAO[p.id]);
const DO_CAMPO = PORTAS_DO_NARRADOR.filter((p) => p.canal === "mudancas" && !p.campos);
/* a resposta inteira, todas as portas JSON de uma vez, e a prosa que as tenta */
const TODAS_AS_MUDANCAS = { ...Object.fromEntries(DO_CAMPO.map((p) => [p.id, TENTACAO[p.id]])), xp: 9999, sinais: SINAIS };
const PROSA_QUE_TENTA = [TENTACAO.oQueFaltaCreditar, TENTACAO.oQueFaltaDebitar, TENTACAO.nomesAMaoNaProsa, TENTACAO.detectarChegada, TENTACAO.aNemesisNaNarrativa, TENTACAO.osVistosDaNarrativa, TENTACAO.segredosReveladosNoTurno, TENTACAO.cronista].join(" ");
const tentar = (resp) => ({ ...resp, narrativa: `${(resp && resp.narrativa) || ""} ${PROSA_QUE_TENTA}`.trim(), mudancas: { ...((resp && resp.mudancas) || {}), ...TODAS_AS_MUDANCAS } });
const VAZIA = Object.freeze({ narrativa: "" });

/* ---------------- O TURNO NO MOTOR ----------------
   O de teste-motor-aplicar, secção 9: os casos do turno inteiro, com a sorte
   semeada por caso. A foto é tudo o que o turno devolve — o estado, os
   efeitos (o que o App escreve nos refs), a nota ao Narrador, as linhas da
   tela e as `mudancas` que seguem para a luta e a mesa —, menos a prosa,
   que vai à tela nos dois modos. */
const CT = casosDoTurno();
const ctxDoCaso = (c, modo) => {
  const ctx = { ...c.ctx, sorte: undefined, sorteDoTurno: sorteDoCaso(c.semente), motorDoArco: (sobre = {}) => motorDoArcoDoCaso(c.ctx.arco, sobre.eventos), baseDoNome: (s) => baseDoNomeDoCaso(s), ...(modo ? { modoDoNarrador: modo } : {}) };
  ctx.sorte = ctx.sorteDoTurno("salvaguarda");
  return ctx;
};
const fotoDoTurno = (s) => JSON.stringify({
  semFicha: !!s.semFicha, estado: s.estado, efeitos: (s.efeitos || []).map((e) => (e && e.tipo === "calou" ? { tipo: "calou", onde: e.onde } : e)),
  notas: s.paraOCronista, msgs: s.msgs, mudancas: (s.podado && s.podado.mudancas) || null,
});
const turnoDoCaso = (c, estado, resp, modo) => { semearACasa(c.semente); return fotoDoTurno(aplicarOTurno(copia(estado), copia(resp), ctxDoCaso(c, modo))); };

/* o herói das portas uma a uma: com o que cada porta pode tirar ou mudar */
const c0 = CT[0];
const HEROI = {
  ...c0.estado.personagem, nivel: 5, xp: 900, vida: 20, vidaMax: 30, mana: 4, manaMax: 10, moedas: 50,
  inventario: [{ id: "pocao_cura", nome: "Poção de Cura", tipo: "consumivel" }], equipamento: [{ nome: "Espada Curta", tipo: "arma" }],
  habilidades: [{ nome: "Golpe Duplo" }], efeitos: [{ nome: "Abençoado", turnos: 5, bonus: 1 }], condicoes: [],
  grupo: [{ nome: "Freya", classe: "Guerreiro", nivel: 4, vida: 10, vidaMax: 24, xp: 100, efeitos: [], condicoes: [], inventario: [] }, { nome: "Rurik", classe: "Mago", nivel: 3, vida: 12, vidaMax: 14, efeitos: [], condicoes: [] }],
};
const ESTADO_DAS_PORTAS = {
  ...c0.estado, personagem: HEROI, fichaDoRef: HEROI, fichaDoReact: HEROI, combate: null, danoJaAplicado: false, habUsada: false,
  acampado: false, masmorra: null, raid: null, jornada: null, eventos: { locais: [], global: { nome: "A Praga Cinzenta" }, semGlobalDesde: 0, seq: 1 },
};

sec("1. a chave — MODO_DO_NARRADOR");
{
  const nomes = Object.keys(MODO_DO_NARRADOR);
  t("a tabela tem os dois modos, `mestre` e `ator`", nomes.length === 2 && nomes.includes("mestre") && nomes.includes("ator"));
  t("um só é o padrão, e é o `mestre` (o de hoje)", nomes.filter((k) => MODO_DO_NARRADOR[k].padrao).length === 1 && MODO_DO_NARRADOR.mestre.padrao === true);
  t("o modo ausente, ou um nome que a tabela não tem, é o padrão", oModoDoNarrador(undefined) === "mestre" && oModoDoNarrador("lixo") === "mestre" && oModoDoNarrador(null) === "mestre" && oModoDoNarrador("ator") === "ator");
  t("o Cronista lê no `mestre` (e no padrão) e não lê no `ator`", oCronistaChama("mestre") && oCronistaChama() && !oCronistaChama("ator"));
  t("a tabela é congelada (voltar é mudar uma palavra, não um objeto vivo)", Object.isFrozen(MODO_DO_NARRADOR) && Object.isFrozen(MODO_DO_NARRADOR.ator) && Object.isFrozen(PORTAS_DO_NARRADOR));
}

sec("2. a tabela das portas — PORTAS_DO_NARRADOR, contra a anatomia (mente/narrador-ator-anatomia.md §2)");
{
  const ids = PORTAS_DO_NARRADOR.map((p) => p.id);
  const daAnatomia = PORTAS_DO_NARRADOR.filter((p) => !p.achado);
  const json = daAnatomia.filter((p) => p.canal === "mudancas"), sinais = daAnatomia.filter((p) => p.canal === "sinal"), prosa = daAnatomia.filter((p) => p.canal === "prosa");
  t("os ids não se repetem", new Set(ids).size === ids.length);
  t(`29 portas JSON (${json.length} campos + o campo dos sinais), 37 contando cada sinal (${json.length + sinais.length})`, json.length + 1 === 29 && json.length + sinais.length === 37);
  t(`9 portas da prosa (${prosa.length}), o Cronista entre elas`, prosa.length === 9 && prosa.some((p) => p.id === "cronista"));
  t("os grupos da anatomia: ficha 17, luta 2, mundo 7, sinais 9, memória 2", ["ficha", 17, "luta", 2, "mundo", 7, "sinais", 9, "memoria", 2].every((x, i, a) => i % 2 || daAnatomia.filter((p) => p.grupo === x).length === a[i + 1]));
  t("os achados de 03/11 dizem que a anatomia não os contou (a mesa, o peso da linha)", PORTAS_DO_NARRADOR.filter((p) => p.achado).map((p) => p.id).join() === "mesa,pesoDaLinha");
  t("toda porta diz a peça que a fecha e o que faz", PORTAS_DO_NARRADOR.every((p) => typeof p.peca === "string" && p.peca && typeof p.faz === "string" && p.faz));
  t("no `mestre` toda porta está aberta", ids.every((id) => portaAberta(id, "mestre") && portaAberta(id)));
  t("no `ator` toda porta está fechada", ids.every((id) => !portaAberta(id, "ator")), ids.filter((id) => portaAberta(id, "ator")).join(", "));
  t("toda porta tem uma tentação nesta suíte, e nenhuma tentação sobra", ids.every((id) => id in TENTACAO) && Object.keys(TENTACAO).every((k) => ids.includes(k)), ids.filter((id) => !(id in TENTACAO)).join(", "));
}

sec("3. a resposta pela porta");
{
  const r = tentar({ narrativa: "x", perigo: null });
  t("no `mestre` a resposta é a mesma — o mesmo objeto, nem uma cópia", aRespostaPelaPorta(r, "mestre") === r && aRespostaPelaPorta(r) === r);
  const a = aRespostaPelaPorta(r, "ator");
  t("no `ator` nenhuma `mudancas` entra (nem os campos que não são porta)", a !== r && a.mudancas === null && a.narrativa === r.narrativa);
  t("…e a de quem chamou não é tocada", r.mudancas.moedas === 500 && r.mudancas.sinais.length === 9);
  t("`mudancas: {}` vira `null` no `ator` (a resposta vazia, como a poda a deixa)", aRespostaPelaPorta({ narrativa: "x", mudancas: {} }, "ator").mudancas === null);
  t("sem `mudancas`, a resposta segue igual", (() => { const v = { narrativa: "y" }; return aRespostaPelaPorta(v, "ator") === v; })());
  t("a falha é fechada: uma `mudancas` que estoura dá só a prosa", (() => {
    const traicoeira = { narrativa: "z", mudancas: new Proxy({}, { ownKeys: () => { throw new Error("boom"); } }) };
    const x = aRespostaPelaPorta(traicoeira, "ator");
    return x.mudancas === null && x.narrativa === "z";
  })());
}

sec("4. porta a porta — a tentação morde no `mestre` e não entra no `ator`");
{
  /* as portas JSON do aplicar, do meio e do registo: uma resposta com UMA porta */
  const vaziaM = turnoDoCaso(c0, ESTADO_DAS_PORTAS, VAZIA, "mestre"), vaziaA = turnoDoCaso(c0, ESTADO_DAS_PORTAS, VAZIA, "ator");
  t("a resposta vazia é a mesma nos dois modos", vaziaM === vaziaA);
  const noTurno = PORTAS_DO_NARRADOR.filter((p) => (p.canal === "mudancas" && !p.campos && p.grupo !== "luta") || p.canal === "sinal");
  const naoMorde = [], abertas = [];
  for (const p of noTurno) {
    const resp = { narrativa: "", mudancas: p.canal === "sinal" ? { sinais: [TENTACAO[p.id]] } : { [p.id]: TENTACAO[p.id] } };
    if (turnoDoCaso(c0, ESTADO_DAS_PORTAS, resp, "mestre") === vaziaM) naoMorde.push(p.id);
    if (turnoDoCaso(c0, ESTADO_DAS_PORTAS, resp, "ator") !== vaziaA) abertas.push(p.id);
  }
  t(`as ${noTurno.length} portas JSON do turno mordem no \`mestre\``, !naoMorde.length, naoMorde.join(", "));
  t(`…e as ${noTurno.length} ficam fechadas no \`ator\``, !abertas.length, abertas.join(", "));

  /* a cobrança e o débito: a prosa no aplicar */
  for (const id of ["oQueFaltaCreditar", "oQueFaltaDebitar"]) {
    const resp = { narrativa: TENTACAO[id] };
    t(`${id}: a prosa mexe na bolsa no \`mestre\`, e não no \`ator\``, turnoDoCaso(c0, ESTADO_DAS_PORTAS, resp, "mestre") !== vaziaM && turnoDoCaso(c0, ESTADO_DAS_PORTAS, resp, "ator") === vaziaA);
  }

  /* a luta: aLutaDaResposta, com as portas do App em dublê */
  const lutaCom = (mudancas, modo) => {
    const st = { combate: { rodada: 2, inimigos: [{ nome: "Lobo Cinzento", vida: 4, vidaMax: 12, derrotado: false, ameaca: "comum" }] }, descobertas: [], ocioso: 0, ataqueResolvido: false, derrotadosDaSessao: [], masmorra: null, salaEmCurso: null, mapa: { cidades: [] }, semente: "s|Fantasia medieval", genero: "Fantasia medieval", molde: null, lexico: null, divindade: null };
    const chamadas = [];
    const passa = { avancarOsMinutos: (_, p) => ({ ficha: p }), sorteDoTurno: () => () => 0.5, abrirCombate: (_, o) => ({ pers: o.pers, msgs: [], nota: "" }) };
    const c = new Proxy({ ler: () => st, aplicar: (efs) => { for (const e of efs) { chamadas.push(["efeito", e.tipo]); if (e.tipo === "combate") st.combate = e.combate; } }, ...(modo ? { modoDoNarrador: modo } : {}) }, {
      get: (o, k) => (k in o ? o[k] : (...args) => { chamadas.push(["porta", String(k)]); return passa[k] ? passa[k](...args) : undefined; }),
      has: () => true,
    });
    let r = null, erro = "";
    try { r = aLutaDaResposta({ pers: copia(HEROI), mudancas: copia(mudancas) }, c); } catch (e) { erro = String(e && e.message); }
    return JSON.stringify({ erro, pers: r && r.pers, msgs: r && r.msgs, combate: st.combate, chamadas, mud: r && Object.fromEntries(Object.entries(r.mudancas || {}).filter(([k]) => !k.startsWith("__"))) });
  };
  for (const id of ["combate_iniciar", "combate_encerrar"]) {
    const vazias = [lutaCom({}, "mestre"), lutaCom({}, "ator")];
    const m = lutaCom({ [id]: TENTACAO[id] }, "mestre"), a = lutaCom({ [id]: TENTACAO[id] }, "ator");
    t(`${id}: a luta muda no \`mestre\`, e no \`ator\` é a de uma resposta vazia`, m !== vazias[0] && a === vazias[1] && vazias[0] === vazias[1], JSON.parse(m).erro || JSON.parse(a).erro);
  }

  /* a mesa (o achado): o ganho declarado conta o turno no `mestre` */
  {
    const mesa = (mudancas, modo) => JSON.stringify(aMesaDoTurno({ textura: {}, mudancas, combate: null, mesa: null, folego: null, lugares: [], ...(modo ? { modoDoNarrador: modo } : {}) }).mesa);
    t("mesa: o ganho declarado conta no `mestre`, e no `ator` não", mesa(TENTACAO.mesa, "mestre") !== mesa(null, "mestre") && mesa(TENTACAO.mesa, "ator") === mesa(null, "ator") && mesa(null, "ator") === mesa(null, "mestre"));
  }

  /* a nêmesis: a prosa que a mata encerra-a no `mestre`; a correção da morta é guarda */
  {
    const viva = { nome: "Vorn", status: "viva" }, morta = { nome: "Vorn", status: "derrotada", mortaEm: 3 };
    t("aNemesisNaNarrativa: a prosa encerra a nêmesis no `mestre`, e no `ator` não", !!aNemesisNaNarrativa(viva, TENTACAO.aNemesisNaNarrativa, "mestre").encerrar && aNemesisNaNarrativa(viva, TENTACAO.aNemesisNaNarrativa, "ator").encerrar === null);
    t("…a correção da nêmesis morta (guarda, não porta) fica nos dois modos", aNemesisNaNarrativa(morta, "Vorn ri na sombra.", "ator").paraOCronista.length === 1 && aNemesisNaNarrativa(morta, "Vorn ri na sombra.", "mestre").paraOCronista.length === 1);
  }

  /* os vistos: a recência do elenco */
  {
    const ler = { elenco: null, npcs: { "Hrolf Barba-Ruiva": { nome: "Hrolf Barba-Ruiva" } }, dia: 7 };
    const v = (narr, modo) => JSON.stringify(osVistosDaNarrativa(copia(ler), narr, modo).elenco);
    t("osVistosDaNarrativa: a prosa dá recência no `mestre`, e no `ator` o elenco é o de um turno sem prosa", v(TENTACAO.osVistosDaNarrativa, "mestre") !== v("", "mestre") && v(TENTACAO.osVistosDaNarrativa, "ator") === v("", "ator") && v("", "ator") === v("", "mestre"));
  }

  /* o segredo: a pista na prosa fecha-o no `mestre`; o teste que passou fecha-o nos dois */
  {
    const espinha = { atos: [{ marcos: [{ titulo: "A chave", feitio: "descobrir", onde: "a Gruta das Vozes", feito: false, segredo: { coisa: "a chave de ferro escondida", acha: "investigacao" } }] }] };
    const segredo = (narrativa, teste, modo) => {
      const E = { espinha, lugar: { nome: "a Gruta das Vozes" }, npcs: {}, canone: {}, missoes: [], personagem: copia(HEROI) };
      const pedidos = [];
      const ctx = new Proxy({ ler: () => E, aplicar: () => {}, pers: copia(HEROI), narrativa, testeDoTurno: teste, rolagem: null, ...(modo ? { modoDoNarrador: modo } : {}),
        conferirCom: (p, o) => { pedidos.push(o && o.segredos); return p; } }, { get: (o, k) => (k in o ? o[k] : () => undefined) });
      try { oAceitoDoCronista({}, [], {}, ctx); } catch (e) { pedidos.push("estourou: " + (e && e.message)); }
      return JSON.stringify(pedidos);
    };
    const passou = { sucesso: true, pericia: "investigacao" };
    t("segredosReveladosNoTurno: a pista na prosa fecha o segredo no `mestre`, e no `ator` não", segredo(TENTACAO.segredosReveladosNoTurno, null, "mestre") !== "[]" && segredo(TENTACAO.segredosReveladosNoTurno, null, "ator") === "[]");
    t("…o teste que passou (o caminho do sistema) fecha-o nos dois modos", segredo("", passou, "ator") === segredo("", passou, "mestre") && segredo("", passou, "ator") !== "[]");
  }

  /* o Cronista: o gatilho cala */
  {
    const g = (modo) => oGatilhoDoCronista({ npcs: {}, canone: {}, mapa: { cidades: [] } }, { narrativa: TENTACAO.cronista, doTurno: { frase: "olho em volta" }, pers: copia(HEROI), modoDoNarrador: modo }, null);
    t("cronista: no `mestre` o nome novo acende a leitura; no `ator` o gatilho cala", g("mestre").corre === true && g("ator").corre === false && g("ator").calado === true && !g("mestre").calado);
  }

  /* o peso da linha mora no App: aqui só a tabela (o App, pelo build) */
  t("pesoDaLinha: aberta no `mestre`, fechada no `ator` (a porta mora no App)", portaAberta("pesoDaLinha", "mestre") && !portaAberta("pesoDaLinha", "ator"));
}

sec("5. os 275 turnos gravados (aplicar-casos#casosDoTurno), com a resposta cheia de tentações");
{
  let iguais = 0, mordem = 0, padrao = 0;
  const dif = [];
  for (const c of CT) {
    const tentacao = tentar(c.resp);
    const a = turnoDoCaso(c, c.estado, tentacao, "ator"), v = turnoDoCaso(c, c.estado, VAZIA, "ator");
    if (a === v) iguais++; else if (dif.length < 3) dif.push(c.id);
    if (turnoDoCaso(c, c.estado, tentacao, "mestre") !== turnoDoCaso(c, c.estado, VAZIA, "mestre")) mordem++;
    if (turnoDoCaso(c, c.estado, c.resp, "mestre") === turnoDoCaso(c, c.estado, c.resp, undefined)) padrao++;
  }
  t(`no \`ator\`, ${iguais}/${CT.length} turnos acabam iguais aos de uma resposta vazia`, iguais === CT.length, dif.join(" | "));
  t(`no \`mestre\`, a tentação muda ${mordem}/${CT.length} turnos (a prova morde)`, mordem === CT.length);
  t(`o \`mestre\` dito é o modo ausente em ${padrao}/${CT.length} turnos (a resposta gravada, intacta)`, padrao === CT.length);
}

sec("6. o fim do turno nos 275 casos (aplicar-casos#casosDoFim): o códex e a chegada");
{
  /* a prosa destes casos já traz as tentações do fim: um local e uma pessoa
     da base da cidade, os nomes à mão (vivo e morto), a chegada a um passo */
  const CF = casosDoFim();
  const fim = (c, resp, modo) => {
    const m = modo ? { modoDoNarrador: modo } : {};
    semearACasa(c.semente);
    const cx = aplicarOCodex(copia(c.estado), resp, { ...c.ctx, ...m });
    const ch = aplicarAChegada({ ...copia(c.estado), base: cx.estado.base, npcs: cx.estado.npcs }, resp, m);
    return JSON.stringify({ base: cx.estado.base, npcs: cx.estado.npcs, codex: [cx.efeitos, cx.paraOCronista, cx.msgs], cidade: ch.estado.cidadeAtual, lugar: ch.estado.lugar, mapa: ch.estado.mapa, chegada: [ch.efeitos, ch.paraOCronista, ch.msgs, ch.minutos] });
  };
  let iguais = 0, mordem = 0, padrao = 0, comNomes = 0;
  for (const c of CF) {
    const resp = { narrativa: `${c.resp.narrativa} ${TENTACAO.nomesAMaoNaProsa}`, mudancas: c.resp.mudancas };
    const oferecidos = (c.estado.oferecidos || []).length > 0;
    if (oferecidos) comNomes++;
    if (fim(c, resp, "ator") === fim(c, VAZIA, "ator")) iguais++;
    if (oferecidos && fim(c, resp, "mestre") !== fim(c, VAZIA, "mestre")) mordem++;
    if (fim(c, c.resp, "mestre") === fim(c, c.resp)) padrao++;
  }
  t(`no \`ator\`, ${iguais}/${CF.length} fins de turno iguais aos de uma resposta vazia`, iguais === CF.length);
  /* um caso em nove não oferece nomes à mão, e pode não ter nada que a prosa mude */
  t(`no \`mestre\`, a prosa muda ${mordem}/${comNomes} dos casos com nomes à mão oferecidos (a gente, a base, a chegada)`, comNomes > 200 && mordem === comNomes);
  t(`o \`mestre\` dito é o modo ausente em ${padrao}/${CF.length}`, padrao === CF.length);
}

sec("7. as sessões gravadas (o replay, src/sessao.js#correrOTurno), turno a turno");
{
  const SESSOES = ["sessao-s8.json", "sessao-s9.json", "sessao-s10.json", "sessao-s13.json", "sessao-navegador.json"];
  let linhas = 0, iguais = 0, mordem = 0, padrao = 0, calados = 0, nemesis = 0, vistos = 0;
  const dif = [];
  for (const f of SESSOES) {
    const A = ler(f);
    A.turnos.forEach((L, i) => {
      linhas++;
      const antes = estadoNoTurno(A, i);
      const cfg = (modo) => ({ semente: A.semente, mundo: A.mundo, ...(modo ? { modoDoNarrador: modo } : {}) });
      const na = L.narrador || {};
      const comTentacao = { ...L, narrador: { narrativa: `${na.narrativa || ""} ${PROSA_QUE_TENTA}`, mudancas: { ...(na.mudancas || {}), ...TODAS_AS_MUDANCAS } } };
      const vazia = { ...L, narrador: { narrativa: "", mudancas: {} } };
      const fim = (linha, modo) => JSON.stringify(correrOTurno(copia(antes), linha, cfg(modo)).estado);
      const va = fim(vazia, "ator");
      if (fim(comTentacao, "ator") === va) iguais++; else if (dif.length < 3) dif.push(`${f}#${L.n}`);
      if (fim(comTentacao, "mestre") !== fim(vazia, "mestre")) mordem++;
      if (fim(L, "mestre") === fim(L)) padrao++;
      /* as peças do fim que o replay não corre (moram no App): o gatilho, a nêmesis, os vistos */
      const narr = comTentacao.narrador.narrativa;
      const g = oGatilhoDoCronista(antes, { narrativa: narr, doTurno: { frase: (L.entrada || {}).frase || "" }, pers: antes.personagem, modoDoNarrador: "ator" }, antes.leituraDoCronista || null);
      if (g.calado && !g.corre) calados++;
      if (aNemesisNaNarrativa({ nome: "Vorn", status: "viva" }, narr, "ator").encerrar === null) nemesis++;
      const ev = osVistosDaNarrativa({ elenco: antes.elenco, npcs: { ...(antes.npcs || {}), "Hrolf Barba-Ruiva": {} }, dia: antes.dia }, narr, "ator");
      if (JSON.stringify(ev.elenco) === JSON.stringify(osVistosDaNarrativa({ elenco: antes.elenco, npcs: antes.npcs, dia: antes.dia }, "", "ator").elenco)) vistos++;
    });
  }
  t(`no \`ator\`, ${iguais}/${linhas} turnos das sessões acabam iguais aos de uma resposta vazia`, iguais === linhas, dif.join(" | "));
  t(`no \`mestre\`, a tentação muda ${mordem}/${linhas} (a prova morde)`, mordem === linhas);
  t(`o \`mestre\` dito é o modo ausente em ${padrao}/${linhas} (a sessão gravada, intacta)`, padrao === linhas);
  t(`o gatilho do Cronista cala nos ${calados}/${linhas} turnos do \`ator\``, calados === linhas);
  t(`a prosa não encerra a nêmesis em nenhum dos ${nemesis}/${linhas}`, nemesis === linhas);
  t(`nem dá recência ao elenco em nenhum dos ${vistos}/${linhas}`, vistos === linhas);
}

console.log(`\nnada entra pelo ator: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
