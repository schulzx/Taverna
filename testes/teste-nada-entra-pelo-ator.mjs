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

   A FASE NE (13/11, mente/plano-nada-entra.md): as secções do Cronista
   viraram portas (NE1, §8), as portas de fora entraram na tabela e os
   marcadores `__*` filtram-se em qualquer modo (NE2, §9), e o modo `boca`
   — o pedido do `mestre` com as portas fechadas — corre os mesmos turnos
   que o `ator` e tem de acabar igual a uma resposta vazia (§5, §7).

   A NE7 (13/11): o `boca` passou a ser o PADRÃO. As provas que mediam «o
   `mestre` dito é o modo ausente» passaram a medir «o padrão dito é o modo
   ausente» (a intenção era a mesma: a peça sem modo lê o padrão da tabela);
   as que diziam «no `mestre` e no padrão» dizem agora «no `mestre`» e,
   à parte, «o padrão é o `boca`». A catraca da NE7 é a §10.

   Nenhuma asserção lê o texto de src/motor/ nem do App (a catraca de
   teste-assercoes-de-texto): a porta do peso da linha, que mora no App,
   prova-se aqui só pela tabela; o App, pelo build. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODO_DO_NARRADOR, PORTAS_DO_NARRADOR, oModoDoNarrador, portaAberta, oCronistaChama, aRespostaPelaPorta, oPedidoDoModo, oAceitoPelaPorta } from "../src/motor/portas-do-narrador.js";
import { julgarOCronista, oCanoneQueExiste, O_CANONE_CONHECIDO } from "../src/motor/cronista.js";
import { oQueACenaDaAoLivro } from "../src/motor/livro-do-turno.js";
import { oPerigoDaResposta } from "../src/motor/fecho-da-resposta.js";
import { lerAgressao, alvoPrometido } from "../src/agressao.js";
import { aplicarOTurno, aplicar } from "../src/motor/aplicar.js";
import { aplicarOCodex, aplicarAChegada } from "../src/motor/fim-do-turno.js";
import { aNemesisNaNarrativa, osVistosDaNarrativa } from "../src/motor/entrega-do-turno.js";
import { aLutaDaResposta } from "../src/motor/luta-do-turno.js";
import { aMesaDoTurno } from "../src/motor/fecho-da-resposta.js";
import { oGatilhoDoCronista, oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";
import { correrOTurno, estadoNoTurno, FORMATO_DA_SESSAO, reproduzirASessao, abrirASessao } from "../src/sessao.js";
import { oPedidoNoServidor, oTurnoNoServidor } from "../src/turno-no-servidor.js";
import { semearACasa } from "../src/semente.js";
import { casosDoTurno, casosDoFim, sorteDoCaso, motorDoArcoDoCaso, baseDoNomeDoCaso } from "./aplicar-casos.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ler = (f) => JSON.parse(fs.readFileSync(path.join(AQUI, f), "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const copia = (x) => JSON.parse(JSON.stringify(x));
const J = (x) => JSON.stringify(x);
/* o padrão da tabela, dito pelo nome (NE7: o `boca`) */
const PADRAO = oModoDoNarrador();

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
  /* NE1 (13/11): uma por secção do Cronista, na forma do aceito (o que o
     juízo assina) — §8 joga-as uma a uma */
  "cronista.lugar": { lugar: "a fazenda de Jessa" },
  "cronista.global": { missoes: { global_encerrado: true } },
  "cronista.canone": { canone: { "Livro de Contas da Guilda": { tipo: "artefato", descricao: "o livro que a quest pôs no mundo" } } },
  "cronista.gente": { pessoas: [{ nome: "Ysolde Marfim", papel: "viajante" }] },
  "cronista.conversa": { falou_com: ["Hrolf"] },
  "cronista.fe": { fe: [{ fieis: 10, pf: 1, motivo: "a praça reza", de: "gesto", rotulo: "gesto" }] },
  "cronista.grupo": { grupo: { entraram: ["Hrolf"] } },
  "cronista.teste": { teste_sugerido: { atributo: "Presença", perfil: "dificil", motivo: "o rei cedeu o trono" } },
  "cronista.cartaz": { missao_oferecida: { titulo: "Escolta", tipo: "contrato", dador: "Hrolf", descricao: "levar a carroça", paga: 15, etapas: [{ tipo: "ir_a", alvo: "Vau" }] } },
  "cronista.relogio": { relogio_novo: { nome: "O ritual começa", tipo: "ameaca", segmentos: 4, gatilho: "noite", consequencia: "a cripta abre" } },
  "cronista.promessas": { promessas: [{ tipo: "frase", texto: "ela voltará ao amanhecer com a resposta", quem: "Ysolde" }] },
  "cronista.livro": { falou_com: ["Hrolf"] },
  /* NE2 (13/11): as de fora (§9) */
  livroVistoDaProsa: "Corvo Sal cruza os braços e encara-te.",
  alvoDaProsa: "Um lobo cinzento rosna à beira da estrada.",
  lutaPrometida: "O camarada de Tônia surge à porta.",
  nucleoDaFala: "(as duas últimas falas do Mestre citam o elo: a porta mora no App)",
  marcadores: { __vitoriaAuto: true, __inimigosFinais: [{ nome: "Dragão Ancião", vida: 0, vidaMax: 300, ameaca: "lendario", derrotado: true }] },
  perigo: { tipo: "armadilha", descricao: "o chão cede" },
  arquivistaDoSave: "(o botão «recalibrar save antigo»: mora no App)",
  arquivistaDaAscensao: "(o botão «Recalibrar ascensão»: mora no painel)",
  lexico: "(a leitura do mundo na criação: mora no App; a troca é lexico-do-mundo.js)",
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
/* NE7 (13/11): os casos trazem o modo em que foram gravados (o «mestre»,
   aplicar-casos.mjs); aqui o modo é o que a prova diz, e o ausente é ausente */
const semModo = (ctx) => { const { modoDoNarrador, ...resto } = ctx || {}; return resto; };
const ctxDoCaso = (c, modo) => {
  const ctx = { ...semModo(c.ctx), sorte: undefined, sorteDoTurno: sorteDoCaso(c.semente), motorDoArco: (sobre = {}) => motorDoArcoDoCaso(c.ctx.arco, sobre.eventos), baseDoNome: (s) => baseDoNomeDoCaso(s), ...(modo ? { modoDoNarrador: modo } : {}) };
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
  /* MOVIDA (13/11, NE2), com o motivo: nasceu o terceiro modo, `boca` — o
     pedido do `mestre` com as portas fechadas. A intenção fica: a tabela diz
     os modos que existem, e nenhum outro. */
  t("a tabela tem os três modos, `mestre`, `ator` e `boca`", nomes.length === 3 && ["mestre", "ator", "boca"].every((n) => nomes.includes(n)));
  t("duas colunas explícitas em todo modo: `portas` (uma lista) e `pedido` (mestre ou ator)", nomes.every((n) => Array.isArray(MODO_DO_NARRADOR[n].portas) && ["mestre", "ator"].includes(MODO_DO_NARRADOR[n].pedido)));
  t("o `boca` é o pedido do `mestre` com todas as portas fechadas; o `ator`, o pedido do ator", oPedidoDoModo("boca") === "mestre" && MODO_DO_NARRADOR.boca.portas.length === 0 && oPedidoDoModo("ator") === "ator" && oPedidoDoModo("mestre") === "mestre" && oPedidoDoModo() === "mestre" && oPedidoDoModo("lixo") === "mestre");
  /* MOVIDAS (13/11, NE7), com o motivo: o `boca` virou o padrão e o
     `mestre` ficou de reserva. A intenção fica: um só padrão, o modo
     ausente (ou o lixo) é ele, e o Cronista só lê no modo que abre a porta. */
  t("o `boca` é o padrão (NE7, depois dos substitutos da NE4)", MODO_DO_NARRADOR.boca.padrao === true && oModoDoNarrador("boca") === "boca" && oModoDoNarrador() === "boca");
  t("um só é o padrão, e é o `boca`; o `mestre` fica na tabela, de reserva", nomes.filter((k) => MODO_DO_NARRADOR[k].padrao).length === 1 && MODO_DO_NARRADOR.mestre.padrao === false && oModoDoNarrador("mestre") === "mestre");
  t("o modo ausente, ou um nome que a tabela não tem, é o padrão", oModoDoNarrador(undefined) === "boca" && oModoDoNarrador("lixo") === "boca" && oModoDoNarrador(null) === "boca" && oModoDoNarrador("ator") === "ator");
  t("o Cronista lê no `mestre` e não lê no padrão, no `ator` nem no `boca`", oCronistaChama("mestre") && !oCronistaChama() && !oCronistaChama("ator") && !oCronistaChama("boca"));
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
  /* MOVIDA (13/11, NE1 e NE2), com o motivo: a Fase NE achou mais portas que
     a anatomia não contou — as secções do Cronista e as nove de fora —, e
     elas entram com `achado` (por isso as contagens da anatomia, acima, não
     mudam). A intenção fica: todo achado diz de onde veio. */
  t("os achados de 03/11 dizem que a anatomia não os contou (a mesa, o peso da linha)", PORTAS_DO_NARRADOR.filter((p) => p.achado && /^03\/11/.test(p.achado)).map((p) => p.id).join() === "mesa,pesoDaLinha");
  const ne1 = PORTAS_DO_NARRADOR.filter((p) => p.canal === "cronista"), ne2 = PORTAS_DO_NARRADOR.filter((p) => /NE2/.test(p.achado || ""));
  t(`NE1: a porta do Cronista partida em ${ne1.length} secções, cada uma com as chaves do aceito que governa`, ne1.length === 12 && ne1.every((p) => /^cronista\./.test(p.id) && /NE1/.test(p.achado) && Array.isArray(p.chaves) && p.peca === "oAceitoDoCronista") && ne1.flatMap((p) => p.chaves).length === new Set(ne1.flatMap((p) => p.chaves)).size);
  t("…as chaves são as do molde do Cronista (lugar, missoes, canone, pessoas, falou_com, fe, grupo, teste_sugerido, missao_oferecida, relogio_novo, promessas, promessas_pagas)", J(ne1.flatMap((p) => p.chaves).sort()) === J(["canone", "falou_com", "fe", "grupo", "lugar", "missao_oferecida", "missoes", "pessoas", "promessas", "promessas_pagas", "relogio_novo", "teste_sugerido"]));
  t(`NE2: as ${ne2.length} de fora, com a peça que as fecha (o livro, o alvo, a luta prometida, o núcleo, os marcadores, o perigo, os dois Arquivistas, o Léxico)`, J(ne2.map((p) => p.id)) === J(["livroVistoDaProsa", "alvoDaProsa", "lutaPrometida", "nucleoDaFala", "marcadores", "perigo", "arquivistaDoSave", "arquivistaDaAscensao", "lexico"]));
  t("as três IAs que não são o Narrador têm o canal `ia`", J(PORTAS_DO_NARRADOR.filter((p) => p.canal === "ia").map((p) => p.id)) === J(["arquivistaDoSave", "arquivistaDaAscensao", "lexico"]));
  t("toda porta diz a peça que a fecha e o que faz", PORTAS_DO_NARRADOR.every((p) => typeof p.peca === "string" && p.peca && typeof p.faz === "string" && p.faz));
  /* MOVIDA (13/11, NE2), com o motivo: a porta `marcadores` (os `__*` da
     luta) é `sempreFechada` — são do código, e a IA nunca os escreve. A
     intenção fica: no `mestre` abre-se tudo o que um modo pode abrir.
     E os dois Arquivistas (NE3, 13/11): a pessoa aprovou tirá-los, e a porta
     fechada em todo modo é a verdade que a tela do App lê. */
  const abriveis = PORTAS_DO_NARRADOR.filter((p) => !p.sempreFechada).map((p) => p.id);
  t("no `mestre` toda porta está aberta (menos as sempre fechadas: os marcadores e os dois Arquivistas)", abriveis.every((id) => portaAberta(id, "mestre")) && J(PORTAS_DO_NARRADOR.filter((p) => p.sempreFechada).map((p) => p.id)) === J(["marcadores", "arquivistaDoSave", "arquivistaDaAscensao"]) && ["marcadores", "arquivistaDoSave", "arquivistaDaAscensao"].every((id) => !portaAberta(id, "mestre") && !portaAberta(id, "boca")));
  t("no `ator` toda porta está fechada", ids.every((id) => !portaAberta(id, "ator")), ids.filter((id) => portaAberta(id, "ator")).join(", "));
  t("no `boca` toda porta está fechada", ids.every((id) => !portaAberta(id, "boca")), ids.filter((id) => portaAberta(id, "boca")).join(", "));
  t("toda porta tem uma tentação nesta suíte, e nenhuma tentação sobra", ids.every((id) => id in TENTACAO) && Object.keys(TENTACAO).every((k) => ids.includes(k)), ids.filter((id) => !(id in TENTACAO)).join(", "));
}

sec("3. a resposta pela porta");
{
  const r = tentar({ narrativa: "x", perigo: null });
  /* MOVIDA (13/11, NE7), com o motivo: a resposta sem modo já não é a do
     `mestre` — é a do padrão, o `boca`. A intenção fica: o `mestre` não
     muda um byte, e a peça sem modo lê o padrão. */
  t("no `mestre` a resposta é a mesma — o mesmo objeto, nem uma cópia", aRespostaPelaPorta(r, "mestre") === r);
  t("sem modo, a resposta é a do padrão (o `boca`: nenhuma `mudancas`)", J(aRespostaPelaPorta(r)) === J(aRespostaPelaPorta(r, "boca")) && aRespostaPelaPorta(r).mudancas === null);
  const a = aRespostaPelaPorta(r, "ator");
  t("no `ator` nenhuma `mudancas` entra (nem os campos que não são porta)", a !== r && a.mudancas === null && a.narrativa === r.narrativa);
  t("…e a de quem chamou não é tocada", r.mudancas.moedas === 500 && r.mudancas.sinais.length === 9);
  t("`mudancas: {}` vira `null` no `ator` (a resposta vazia, como a poda a deixa)", aRespostaPelaPorta({ narrativa: "x", mudancas: {} }, "ator").mudancas === null);
  t("sem `mudancas`, a resposta segue igual", (() => { const v = { narrativa: "y" }; return aRespostaPelaPorta(v, "ator") === v; })());
  /* NE2: os marcadores do código saem em QUALQUER modo, o `mestre` incluído */
  const comMarca = { narrativa: "x", mudancas: { moedas: 5, ...TENTACAO.marcadores } };
  const mM = aRespostaPelaPorta(comMarca, "mestre");
  t("NE2: no `mestre` os `__*` da IA saem (e o resto fica); a de quem chamou não é tocada", mM !== comMarca && J(mM.mudancas) === J({ moedas: 5 }) && comMarca.mudancas.__vitoriaAuto === true);
  t("…e no `boca` e no `ator` também (com o resto fechado)", aRespostaPelaPorta(comMarca, "boca").mudancas === null && aRespostaPelaPorta(comMarca, "ator").mudancas === null);
  t("no `boca` nenhuma `mudancas` entra, como no `ator`", aRespostaPelaPorta(r, "boca").mudancas === null && aRespostaPelaPorta(r, "boca").narrativa === r.narrativa);
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
  let iguais = 0, mordem = 0, padrao = 0, boca = 0;
  const dif = [];
  for (const c of CT) {
    const tentacao = tentar(c.resp);
    const a = turnoDoCaso(c, c.estado, tentacao, "ator"), v = turnoDoCaso(c, c.estado, VAZIA, "ator");
    if (a === v) iguais++; else if (dif.length < 3) dif.push(c.id);
    if (turnoDoCaso(c, c.estado, tentacao, "boca") === turnoDoCaso(c, c.estado, VAZIA, "boca")) boca++;
    if (turnoDoCaso(c, c.estado, tentacao, "mestre") !== turnoDoCaso(c, c.estado, VAZIA, "mestre")) mordem++;
    /* MOVIDA (13/11, NE7): o padrão dito (o `boca`), e já não o `mestre` — a intenção é a mesma */
    if (turnoDoCaso(c, c.estado, c.resp, PADRAO) === turnoDoCaso(c, c.estado, c.resp, undefined)) padrao++;
  }
  t(`no \`ator\`, ${iguais}/${CT.length} turnos acabam iguais aos de uma resposta vazia`, iguais === CT.length, dif.join(" | "));
  t(`no \`boca\` (NE2), ${boca}/${CT.length} também`, boca === CT.length);
  t(`no \`mestre\`, a tentação muda ${mordem}/${CT.length} turnos (a prova morde)`, mordem === CT.length);
  t(`o padrão dito (\`${PADRAO}\`) é o modo ausente em ${padrao}/${CT.length} turnos (a resposta gravada)`, padrao === CT.length);
}

sec("6. o fim do turno nos 275 casos (aplicar-casos#casosDoFim): o códex e a chegada");
{
  /* a prosa destes casos já traz as tentações do fim: um local e uma pessoa
     da base da cidade, os nomes à mão (vivo e morto), a chegada a um passo */
  const CF = casosDoFim();
  const fim = (c, resp, modo) => {
    const m = modo ? { modoDoNarrador: modo } : {};
    semearACasa(c.semente);
    const cx = aplicarOCodex(copia(c.estado), resp, { ...semModo(c.ctx), ...m });
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
    if (fim(c, c.resp, PADRAO) === fim(c, c.resp)) padrao++; /* NE7: o padrão dito, e já não o `mestre` */
  }
  t(`no \`ator\`, ${iguais}/${CF.length} fins de turno iguais aos de uma resposta vazia`, iguais === CF.length);
  /* um caso em nove não oferece nomes à mão, e pode não ter nada que a prosa mude */
  t(`no \`mestre\`, a prosa muda ${mordem}/${comNomes} dos casos com nomes à mão oferecidos (a gente, a base, a chegada)`, comNomes > 200 && mordem === comNomes);
  t(`o padrão dito (\`${PADRAO}\`) é o modo ausente em ${padrao}/${CF.length}`, padrao === CF.length);
}

sec("7. as sessões gravadas (o replay, src/sessao.js#correrOTurno), turno a turno");
{
  const SESSOES = ["sessao-s8.json", "sessao-s9.json", "sessao-s10.json", "sessao-s13.json", "sessao-navegador.json"];
  let linhas = 0, iguais = 0, mordem = 0, padrao = 0, calados = 0, nemesis = 0, vistos = 0, boca = 0;
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
      if (fim(comTentacao, "boca") === fim(vazia, "boca")) boca++;
      if (fim(comTentacao, "mestre") !== fim(vazia, "mestre")) mordem++;
      if (fim(L, PADRAO) === fim(L)) padrao++; /* NE7: o padrão dito, e já não o `mestre` */
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
  t(`no \`boca\` (NE2), ${boca}/${linhas} também`, boca === linhas);
  t(`no \`mestre\`, a tentação muda ${mordem}/${linhas} (a prova morde)`, mordem === linhas);
  t(`o padrão dito (\`${PADRAO}\`) é o modo ausente em ${padrao}/${linhas} (a sessão gravada)`, padrao === linhas);
  t(`o gatilho do Cronista cala nos ${calados}/${linhas} turnos do \`ator\``, calados === linhas);
  t(`a prosa não encerra a nêmesis em nenhum dos ${nemesis}/${linhas}`, nemesis === linhas);
  t(`nem dá recência ao elenco em nenhum dos ${vistos}/${linhas}`, vistos === linhas);
}

sec("8. NE1 — o Cronista, secção a secção, e o cânone que só guarda o que existe");
{
  const J8 = (x) => JSON.stringify(x);
  const HER = { nome: "Íris Vantel", nivel: 5, inventario: [{ nome: "Livro de Contas da Guilda" }], grupo: [], atributos: { Presença: 12 } };
  const E0 = () => ({ personagem: HER, npcs: { Hrolf: { nome: "Hrolf" } }, canone: {}, missoes: [], relogios: [], prometido: null, dia: 3, npcTurno: 4,
    eventos: { global: { nome: "A Praga", etapas: ["a"], etapa: 0 } }, divindade: { despertar: true }, mapa: { cidades: [] }, cidadeAtual: "Vau",
    abertura: { muralLiberado: true }, espinha: null, combate: null });
  /* o aceito jogado: os efeitos, as portas chamadas, as linhas, o recusado */
  const jogar = (ac, modo, estado) => {
    let E = estado || E0();
    const log = [];
    const porta = (nome, volta) => (...a) => { log.push(["porta", nome]); return typeof volta === "function" ? volta(...a) : volta; };
    const ctx = new Proxy({
      ler: () => E,
      aplicar: (efs) => { for (const e of efs) { log.push(["ef", e.tipo, e.tipo === "calou" ? e.onde : J8(e)]); if (e.tipo === "npcs") E = { ...E, npcs: e.npcs }; if (e.tipo === "canone") E = { ...E, canone: e.canone }; } },
      pers: HER, narrativa: "x", testeDoTurno: null, rolagem: null, ...(modo ? { modoDoNarrador: modo } : {}),
      conferirCom: porta("conferirCom", (p) => p), ganharFe: porta("ganharFe", ["fé"]), pregarNoMural: porta("pregarNoMural", true), registrarLugar: porta("registrarLugar", null),
      fichaDeCompanheiro: porta("fichaDeCompanheiro", (n) => ({ nome: n, nivel: 3, vida: 10, vidaMax: 10 })), marcarNoArco: porta("marcarNoArco", null),
      historiaDoMural: () => [], contextoDoNome: () => ({}), nucleoAgora: () => null, sincronizarNemesis: () => {}, mundoDaBase: () => null, notaDoRecrutamento: () => "",
    }, { get: (o, k) => (k in o ? o[k] : () => undefined) });
    let fim;
    try { fim = oAceitoDoCronista(ac, [], ac, ctx); } catch (e) { return "estourou: " + (e && e.message); }
    return { foto: J8({ log, msgs: fim.msgs }), canone: E.canone, recusado: fim.recusadoDoCanone || [] };
  };
  const vazio = { mestre: jogar({}, "mestre").foto, boca: jogar({}, "boca").foto, ator: jogar({}, "ator").foto };
  t("o aceito vazio dá o mesmo nos três modos", vazio.mestre === vazio.boca && vazio.boca === vazio.ator);
  const secoes = PORTAS_DO_NARRADOR.filter((p) => p.canal === "cronista");
  const naoMorde = [], abertas = [];
  for (const p of secoes) {
    if (jogar(TENTACAO[p.id], "mestre").foto === vazio.mestre) naoMorde.push(p.id);
    for (const m of ["boca", "ator"]) if (jogar(TENTACAO[p.id], m).foto !== vazio[m]) abertas.push(`${m}:${p.id}`);
  }
  t(`as ${secoes.length} secções mordem no \`mestre\``, !naoMorde.length, naoMorde.join(", "));
  t("…e ficam fechadas no `boca` e no `ator` (a secção não lida não escreve nada)", !abertas.length, abertas.join(", "));
  const tudo = Object.assign({}, ...secoes.map((p) => TENTACAO[p.id]));
  t("o aceito pela porta: o `mestre` devolve o mesmo objeto; o `boca` tira todas as secções", oAceitoPelaPorta(tudo, "mestre") === tudo && J8(oAceitoPelaPorta(tudo, "boca")) === "{}" && J8(oAceitoPelaPorta(null, "boca")) === "{}" && Object.keys(tudo).length === 11);

  /* a chave mestra da 19.ª (T16, mente/sessao-19.md): o Narrador deu ao
     herói uma chave que o sistema não deu, e o Cronista pô-la no cânone */
  const chave = { canone: { "Chave Mestra": { tipo: "artefato", descricao: "a chave mestra de ferro forjado" } } };
  const rM = jogar(chave, "mestre");
  t("a «chave mestra» da 19.ª é recusada no `mestre` (o sistema não a deu), e diz porquê", !("Chave Mestra" in rM.canone) && rM.recusado.some((x) => x.o === "Chave Mestra" && x.porque === "objeto" && x.secao === "canone"), J8(rM.recusado));
  /* o livro da quest: um artefato que o enredo pôs no mundo (o papel «item» de uma quest do fio, já resolvido) */
  const doFio = { ...E0(), personagem: { ...HER, inventario: [] }, espinha: { quests: { registos: [{ id: "q1", papeis: { pagina: { nome: "a página arrancada de um livro de contas", tipo: "item" } } }] } } };
  const livro = { canone: { "Página arrancada de um livro de contas": { tipo: "artefato", descricao: "a página da quest" } } };
  t("o artefato que a quest pôs no mundo passa (o enredo conhece-o), mesmo fora do inventário", "Página arrancada de um livro de contas" in jogar(livro, "mestre", doFio).canone);
  t("…e o que está no inventário também (o Livro de Contas da Guilda)", "Livro de Contas da Guilda" in jogar(TENTACAO["cronista.canone"], "mestre").canone);
  const ce = (canone, estado) => oCanoneQueExiste(canone, estado, {});
  const E = { personagem: { nome: "Íris", inventario: [{ nome: "Chave" }], grupo: [{ nome: "Brás", inventario: [{ nome: "Diário de Margarida Vaz" }] }] }, npcs: { Tobias: { nome: "Tobias" } }, mapa: { cidades: [{ nome: "Vau Seco" }] }, cidadeAtual: "Vau Seco", canone: { "Torre Velha": { tipo: "lugar" } } };
  t("uma palavra só não abre a porta: «chave» no inventário não deixa entrar «a chave mestra»", ce({ "a chave mestra": { tipo: "chave" } }, E).recusado.length === 1);
  t("o nome casa sem artigo e por palavras inteiras («o diário de Margarida» dentro do do grupo)", J8(Object.keys(ce({ "o Diário de Margarida": { tipo: "livro" } }, E).canone)) === J8(["o Diário de Margarida"]));
  t("a gente casa pelo primeiro nome (o registo diz Tobias, o Cronista Tobias Ferro); a desconhecida não entra", J8(Object.keys(ce({ "Tobias Ferro": { tipo: "pessoa" }, "Ysolde Marfim": { tipo: "pessoa" } }, E).canone)) === J8(["Tobias Ferro"]));
  t("o lugar do mapa e o que já está no cânone passam; o lugar inventado não", J8(Object.keys(ce({ "Vau Seco": { tipo: "cidade" }, "Torre Velha": { tipo: "torre" }, "Ponte Brumosa": { tipo: "ponte" } }, E).canone)) === J8(["Vau Seco", "Torre Velha"]));
  t("o «artefato» que é gente conhecida passa (o Cronista rotula mal; o que conta é o sistema conhecer o nome)", "Tobias" in ce({ Tobias: { tipo: "artefato" } }, E).canone);
  t("o tipo que não é objeto, gente nem lugar segue (o segredo, a promessa, a organização)", Object.keys(ce({ "O que Tobias esconde": { tipo: "segredo" }, "A Ordem": { tipo: "organizacao" } }, E).canone).length === 2);
  t("as famílias e as fontes saem de uma tabela (O_CANONE_CONHECIDO)", O_CANONE_CONHECIDO.objeto.test("artefato") && O_CANONE_CONHECIDO.gente.test("pessoa") && O_CANONE_CONHECIDO.lugar.test("cidade") && O_CANONE_CONHECIDO.palavras >= 2 && Object.isFrozen(O_CANONE_CONHECIDO));
  t("lixo não derruba (null, {}, um cânone que é lista)", [null, undefined, [], "x"].every((x) => J8(ce(x, x).canone) === "{}"));
  t("o juízo do Cronista continua o mesmo (a régua corre depois dele: a linha da sessão grava o juízo cru)", "Chave Mestra" in julgarOCronista(E0(), chave, { narrativa: "x" }).aceito.canone);
}

sec("9. NE2 — as portas de fora, fechadas pela peça que as tem");
{
  const J9 = (x) => JSON.stringify(x);
  /* MOVIDAS (13/11, NE7): «a peça sem modo é o `mestre`» passou a «a peça
     sem modo é o padrão» — o padrão é o `boca` */
  /* o livro de factos: o «visto» que a prosa dá */
  const est = { cidadeAtual: "Vau", npcs: { "Corvo Sal": { nome: "Corvo Sal", cidade: "Vau", papel: "ferreiro" } }, personagem: { nome: "Íris", grupo: [] }, dia: 1, npcTurno: 2, lugar: null };
  const aqui = (modo) => oQueACenaDaAoLivro(est, { narrativa: TENTACAO.livroVistoDaProsa, ...(modo ? { modoDoNarrador: modo } : {}) }).emCena.filter((x) => x.aqui).map((x) => x.nome);
  const semProsa = oQueACenaDaAoLivro(est, { narrativa: "" }).emCena.filter((x) => x.aqui).map((x) => x.nome);
  t("livroVistoDaProsa: a prosa põe o Corvo à vista no `mestre`; no `boca` é a cena sem prosa", aqui("mestre").includes("Corvo Sal") && J9(aqui()) === J9(aqui(PADRAO)) && J9(aqui("boca")) === J9(semProsa) && !aqui("boca").includes("Corvo Sal"), J9([aqui("mestre"), aqui("boca")]));
  /* o alvo do ataque */
  const ag = (modo) => lerAgressao("ataco o lobo com a espada", { presentes: [], grupo: [], mostrado: [TENTACAO.alvoDaProsa], ...(modo ? { modoDoNarrador: modo } : {}) });
  t("alvoDaProsa: o lobo que a prosa mostrou é o alvo no `mestre`; no `boca` não há alvo conhecido", (ag("mestre") || {}).criatura === true && J9(ag()) === J9(ag(PADRAO)) && (ag("boca") || {}).tipo === "semAlvoConhecido", J9([ag("mestre"), ag("boca")]));
  /* o nome da luta prometida */
  const lp = (modo) => alvoPrometido("o camarada", { presentes: [], mostrado: [TENTACAO.lutaPrometida], ...(modo ? { modoDoNarrador: modo } : {}) });
  t("lutaPrometida: a prosa dá o nome no `mestre`; no `boca` fica o do cartão", lp("mestre").deOnde === "prosa" && J9(lp()) === J9(lp(PADRAO)) && lp("boca").deOnde === "cartao", J9([lp("mestre"), lp("boca")]));
  /* o perigo */
  const pg = (modo) => { const ch = []; const ctx = new Proxy({ aplicar: () => {}, ler: () => ({}) }, { get: (o, k) => (k in o ? o[k] : (...a) => { ch.push(String(k)); return { pers: a[1] && a[1].pers, msgs: [], nota: "" }; }) }); oPerigoDaResposta({ pers: { nome: "Íris", nivel: 2 }, perigo: TENTACAO.perigo, combate: { inimigos: [] }, ...(modo ? { modoDoNarrador: modo } : {}) }, ctx); return ch; };
  t("perigo: o que escapasse à poda dispara no `mestre`; no `boca` não chama porta nenhuma", pg("mestre").includes("dispararPerigo") && J9(pg()) === J9(pg(PADRAO)) && pg("boca").length === 0, J9([pg("mestre"), pg("boca")]));
  /* os marcadores na luta: a vitória que a IA declarasse não paga espólio */
  const st = () => ({ combate: { rodada: 2, inimigos: [{ nome: "Lobo Cinzento", vida: 4, vidaMax: 12, derrotado: false, ameaca: "comum" }] }, descobertas: [], ocioso: 0, ataqueResolvido: false, derrotadosDaSessao: [], masmorra: null, salaEmCurso: null, mapa: { cidades: [] }, semente: "s|Fantasia medieval", genero: "Fantasia medieval", molde: null, lexico: null, divindade: null });
  const luta = (mud, modo) => {
    const S = st(), ch = [];
    const c = new Proxy({ ler: () => S, aplicar: (efs) => { for (const e of efs) { ch.push(["ef", e.tipo]); if (e.tipo === "combate") S.combate = e.combate; } }, ...(modo ? { modoDoNarrador: modo } : {}) }, {
      get: (o, k) => (k in o ? o[k] : (...a) => { ch.push(["porta", String(k)]); return k === "avancarOsMinutos" ? { ficha: a[1] } : k === "sorteDoTurno" ? () => 0.5 : undefined; }), has: () => true });
    let r = null;
    try { r = aLutaDaResposta({ pers: copia(HEROI), mudancas: copia(mud) }, c); } catch (e) { return "estourou: " + (e && e.message); }
    return J9({ pers: r && r.pers, msgs: r && r.msgs, combate: S.combate, ch });
  };
  t("marcadores: o `__vitoriaAuto` da IA não fecha a luta nem paga espólio no `mestre` (nem no `boca`)", luta(TENTACAO.marcadores, "mestre") === luta({}, "mestre") && luta(TENTACAO.marcadores, "boca") === luta({}, "boca") && !/estourou/.test(luta({}, "mestre")));
  /* as que moram no App: a tabela (a fiação, pelo build) */
  t("nucleoDaFala e o Léxico: abertos no `mestre`, fechados no `boca` e no `ator` (moram no App)", ["nucleoDaFala", "lexico"].every((id) => portaAberta(id, "mestre") && !portaAberta(id, "boca") && !portaAberta(id, "ator")));
  t("os dois Arquivistas: fechados em todo modo (NE3 — a tela do App lê a porta)", ["arquivistaDoSave", "arquivistaDaAscensao"].every((id) => ["mestre", "boca", "ator", undefined].every((m) => !portaAberta(id, m))));
}

sec("10. NE7 — o `boca` é o padrão: o jogo publicado fecha todas as portas");
{
  /* o App lê o padrão (MODO_DA_MESA = oModoDoNarrador() fora do dev), e o
     servidor também (oModoDoNarrador(opcoes.modoDoNarrador)): a catraca é
     sobre a tabela e sobre o servidor; a fiação do App prova-se pelo build */
  const m = MODO_DO_NARRADOR[PADRAO];
  const abriveis = PORTAS_DO_NARRADOR.filter((p) => !p.sempreFechada).map((p) => p.id);
  t("o padrão fecha todas as portas que não são `sempreFechada` (e as sempre fechadas também)", m.portas.length === 0 && abriveis.length > 0 && PORTAS_DO_NARRADOR.every((p) => !portaAberta(p.id)), PORTAS_DO_NARRADOR.filter((p) => portaAberta(p.id)).map((p) => p.id).join(", "));
  t("o pedido do padrão é o do `mestre` (a pauta inteira, os envelopes), não o do ator", m.pedido === "mestre" && oPedidoDoModo() === oPedidoDoModo("mestre") && oPedidoDoModo() === "mestre");
  t("no padrão o Cronista não é chamado (a gente e a conversa entram pela ficha da cena)", oCronistaChama() === false && oGatilhoDoCronista({ npcs: {}, canone: {}, mapa: { cidades: [] } }, { narrativa: TENTACAO.cronista, doTurno: { frase: "olho em volta" }, pers: copia(HEROI) }, null).calado === true);
  t("o `mestre` continua na tabela, de reserva, abrindo tudo o que um modo pode abrir", abriveis.every((id) => portaAberta(id, "mestre")) && oCronistaChama("mestre"));
  t("…e todo modo que não abre tudo é um modo das portas fechadas (não há meio-termo escondido na tabela)", Object.values(MODO_DO_NARRADOR).every((x) => x.portas.length === 0 || abriveis.every((id) => x.portas.includes(id))));
}

sec("11. NE7 — o servidor segue o mesmo padrão (turno-no-servidor.js)");
{
  const S9 = ler("sessao-s9.json");
  const corpo = { estado: estadoNoTurno(S9, 3), frase: "olho em volta" };
  const sem = await oPedidoNoServidor(corpo, { agora: () => 0 });
  const boca = await oPedidoNoServidor(corpo, { agora: () => 0, modoDoNarrador: "boca" });
  const mestre = await oPedidoNoServidor(corpo, { agora: () => 0, modoDoNarrador: "mestre" });
  t("o pedido do servidor sem modo é o do padrão, byte a byte, e é o do Mestre (JSON, sem ficha de ator)", J(sem) === J(boca) && J(sem.pedido) === J(mestre.pedido) && sem.pedido.formato === "json" && !("ficha" in sem));
  const PROSA11 = "A chuva bate no telhado. O homem do balcão limpa as mãos e olha a porta. Lá fora um cão late duas vezes e cala. O cheiro de cebola frita sobe da cozinha.";
  const TENT11 = JSON.stringify({ narrativa: PROSA11, mudancas: { moedas: 500, adicionar_itens: [{ nome: "Coroa de Ferro", tipo: "tesouro" }], cidade_atual: "Cidade Inventada", sinais: ["loot: lâmina lendária"] } });
  const porta = (texto) => async () => ({ texto, uso: { entrada: 1000, saida: 200 } });
  let cronistas = 0;
  const espiao = async () => { cronistas++; return {}; };
  const a = await oTurnoNoServidor(corpo, { agora: () => 0, chamar: porta(TENT11), cronista: espiao });
  const b = await oTurnoNoServidor(corpo, { agora: () => 0, chamar: porta(JSON.stringify({ narrativa: PROSA11 })), cronista: espiao });
  t("no servidor sem modo, a resposta cheia de campos deixa o estado igual ao da mesma prosa sem campos", J(a.estadoDoFim) === J(b.estadoDoFim));
  t("…e o Cronista do servidor não é chamado", cronistas === 0 && !a.cronista.chamado && !b.cronista.chamado);
  /* a prova morde, e é ela que pega o defeito da NE7: o servidor só passava
     o modo ao replay quando ele não era "mestre" (o padrão de antes); com o
     padrão no `boca`, o `mestre` dito caía no padrão e fechava as portas */
  const c = await oTurnoNoServidor(corpo, { agora: () => 0, chamar: porta(TENT11), cronista: () => null, modoDoNarrador: "mestre" });
  t("o `mestre` dito ao servidor ainda abre as portas: a mesma resposta muda o estado", J(c.estadoDoFim) !== J(b.estadoDoFim) && J(c.estadoDoFim) !== J(a.estadoDoFim));
  /* a sessão gravada guarda o comportamento da época dela: sem modo na cabeça,
     é de antes da NE7 e o replay corre-a no `mestre` (FORMATO_DA_SESSAO.modoSemModo) */
  const rSem = reproduzirASessao(S9), rMestre = reproduzirASessao(S9, { modoDoNarrador: "mestre" }), rBoca = reproduzirASessao(S9, { modoDoNarrador: "boca" });
  t("a sessão sem modo reproduz-se no `mestre` (a época dela), e no `boca` reproduz menos", FORMATO_DA_SESSAO.modoSemModo === "mestre" && J(rSem.divergentes) === J(rMestre.divergentes) && rBoca.reproduzidos < rMestre.reproduzidos, J([rMestre.reproduzidos, rBoca.reproduzidos]));
  t("a cabeça nova diz o modo em que se joga (campo novo; sem ele, nada)", abrirASessao({ semente: "x", modoDoNarrador: "boca" }).modoDoNarrador === "boca" && !("modoDoNarrador" in abrirASessao({ semente: "x" })));
}

sec("12. NE7 — a porta fechada não cala o que o sistema sabe: a frase do jogador que paga");
{
  /* a porta `oQueFaltaDebitar` lia DUAS coisas: a prosa do Narrador («você
     paga 10 moedas») e a frase do jogador («pago duas moedas ao guarda»).
     A segunda não é da IA — é a entrada do jogador, que o sistema tem. Com
     a porta fechada (o padrão, desde a NE7) a prosa e o `moedas` declarado
     não entram, e a frase continua a pagar: senão, no jogo publicado,
     pagar a alguém pela conversa não tirava nada da bolsa. */
  const p = { nome: "Vera", vida: 10, vidaMax: 10, mana: 0, manaMax: 0, moedas: 20, inventario: [], habilidades: [], grupo: [], efeitos: [], condicoes: [] };
  const bolsa = (resp, ctx) => aplicar({ personagem: copia(p) }, resp, ctx).estado.personagem.moedas;
  const PAGA = "Pago duas moedas ao guarda para me deixar passar.";
  t("no padrão, a frase do jogador que paga tira da bolsa (20 → 18)", bolsa({ narrativa: "O guarda pega as moedas.", mudancas: {} }, { pedido: PAGA }) === 18);
  t("…igual ao `mestre` com a mesma cena", bolsa({ narrativa: "O guarda pega as moedas.", mudancas: {} }, { pedido: PAGA, modoDoNarrador: "mestre" }) === 18);
  t("no padrão, a prosa que diz um pagamento não tira nada (sem frase do jogador)", bolsa({ narrativa: "Você paga 10 moedas ao ferreiro.", mudancas: {} }, {}) === 20);
  t("…nem o `moedas` declarado pela IA desconta da frase (a IA não diz quanto saiu)", bolsa({ narrativa: "", mudancas: { moedas: -2 } }, { pedido: PAGA }) === 18);
  /* nem a cena que recusa o impede: impedir também é mexer no estado, e a
     prosa não mexe em nada (a régua da §5: a tentação acaba igual à vazia).
     No `mestre` (a reserva) a recusa da cena ainda impedia. */
  const RECUSA = { narrativa: "O guarda recusa as moedas e cospe no chão.", mudancas: {} };
  t("…nem a cena que recusa o pagamento o desfaz no padrão (no «mestre» desfazia)", bolsa(RECUSA, { pedido: PAGA }) === 18 && bolsa(RECUSA, { pedido: PAGA, modoDoNarrador: "mestre" }) === 20);
  t("o que o sistema já cobrou (o envelope «já registrada pelo sistema») não se cobra de novo", bolsa({ narrativa: "", mudancas: {} }, { pedido: PAGA, envelopes: "[COMPRA — JÁ REGISTRADA PELO SISTEMA]" }) === 20);
  t("sem fundos, nada sai", aplicar({ personagem: { ...copia(p), moedas: 1 } }, { narrativa: "", mudancas: {} }, { pedido: PAGA }).estado.personagem.moedas === 1);
}

console.log(`\nnada entra pelo ator: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
