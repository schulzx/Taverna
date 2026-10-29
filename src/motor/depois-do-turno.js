/* ============================================================
   OS ÓRGÃOS DO DEPOIS DA RESPOSTA, NO MOTOR (Fase 4, trilha A, 29/10/2026) — src/motor/depois-do-turno.js

   O /api/turno já corre no servidor o resto do turno sobre a resposta (o
   aplicar, o fim do turno, o Juiz, o Cronista: 6b255cc). O que o App ainda
   fazia depois do aplicar, e o servidor não tinha, são órgãos com nome —
   funções do componente, não um trecho de `enviar`. Moram aqui, À LETRA,
   como o prelúdio e o pedido: cada órgão e o fecho das funções do
   componente que ele chama (pela árvore do @babel/parser,
   testes/gerar-depois-dourado.mjs), com as mesmas trocas mecânicas —
   `xRef.current` → `$ref.<campo>`, o estado React → `$render` — e estas
   PORTAS, que são o que o servidor injeta e o App já tem:
     - `pushMsgs`, os setters do React, `salvar` (a tela e o disco);
     - `calou`, e `aplicar` (o que se escreveu chega ao App antes de cada
       porta que lhe dá a palavra, e no fim de cada órgão — também quando
       estoura);
     - `sorte` (o gerador do turno: cada órgão corre dentro de `comSorte`;
       sem ela, a da casa, como no App);
     - `agora` (o `Date.now` do App);
     - `reler` (só o App: os refs de agora, pelo campo; a peça relê-os
       depois de cada porta, para nunca ler a cópia velha de um ref que a
       porta tenha escrito lá).

   É UMA FÁBRICA, e não uma função: `osOrgaosDoDepois(estado, portas)`
   devolve os órgãos (`ORGAOS_DO_DEPOIS`) sobre aquele estado — porque mais
   de um deles é também PORTA de outra peça (o `pregarNoMural` é uma das
   portas que o Cronista chama, e no replay era dublê). Quem os usa cria a
   fábrica com o estado do instante e chama o que precisa; o que eles
   escrevem sai pelo `aplicar` (e fica em `escritas`).

   Os órgãos:
     - `oferecerTrabalhoDaqui` (v9.37, MM13, MM18): o mundo prega no mural,
       por conta própria, o trabalho de quem mora aqui — no máximo um por
       dia, fora de luta e de masmorra, com o diário com espaço;
     - `pregarNoMural`: a porta única do mural (uma pessoa, um trabalho; o
       que já está no diário não volta; quem já trabalha comigo não prega
       outro);
     - `conferirAsMissoes` (v9.27, v9.129, v9.132, MM14, MM-C): o
       conferente — a espinha confere pela mesma porta, a falha descrita, o
       avanço, a paga, o item das grandes (na sorte do turno), a casa (o
       dízimo, a prova), o arco que a missão empurra, o relógio de prazo que
       morre com ela; devolve a ficha do herói depois da paga;
     - `ganharFe` e `marcarNoArco`: a fé e o arco que ele move — portas
       também do Cronista;
     - `conferirCom`: a porta do Cronista que põe a conversa ou o segredo
       do turno nos refs só enquanto as missões se conferem (o literal de
       `portasDoCronista` do App, à letra).

   A prova é testes/teste-motor-depois-do-turno.mjs: o recorte do App de
   fa0a5e0 (depois-dourado.json) e esta peça sobre os mesmos casos, lado a
   lado — os refs do fim, as portas na ordem (com o estado de cada uma) e
   o que cada órgão devolve.
   ============================================================ */

import { garantirAbertura, muralLiberado } from "../abertura.js";
import { AMANHECER, dataTxt, ehNoite, estacaoDe, horaTxt } from "../calendario.js";
import { elencoDaCena } from "../cena.js";
import { cenarioAtivo } from "../cenario.js";
import { criarChao } from "../chao.js";
import { ECONOMIA_ACAO_PROMPT, acoesBonusDe, patamarDe, perfilCombate, resumoAcaoDeTurno } from "../combate.js";
import { garantirCompasso, resumoCompasso } from "../compasso.js";
import { CONTADORES_INICIAIS } from "../conquistas.js";
import { ATRIBUTOS } from "../constantes.js";
import { comoComponente } from "../craft.js";
import { DEVOCAO_PROMPT, resumoFePrompt } from "../devocao.js";
import { CAMINHOS_PROMPT, DIVINDADE_PROMPT, garantirDivindade, resumoAscensao, tituloDe, tituloDoHeroi } from "../divindades.js";
import { garantirElencoDoSave } from "../elenco.js";
import { resumoErmos } from "../ermos.js";
import { calcularFama, patamarFama } from "../fama.js";
import { gatilhosDe } from "../gatilhos.js";
import { dominiosDe } from "../gestao.js";
import { ehMagiaDoGrimorio } from "../grimorio.js";
import { contribuirNaCasa, dizimoDe, nomeDoPosto as postoDaCasa } from "../guildas.js";
import { temRegraPropria } from "../habilidades.js";
import { ganharHeroismo } from "../heroismo.js";
import { garantirHistoria, resumoHistoria, resumoQuests } from "../historia.js";
import { jaMeViuAntes } from "../interprete.js";
import { invocacaoDe, invocacoesDe } from "../invocacoes.js";
import { resumoLegadoPrompt } from "../legado.js";
import { RARIDADE_ROTULO, gerarLoot } from "../loot.js";
import { temCaderno } from "../magias.js";
import { resumoDiplomacia, resumoMapaParaPrompt } from "../mapa.js";
import { cenaNaMasmorra } from "../masmorra-sem-cidade.js";
import { conferir as conferirMissoes, envelopeDeAvanco, envelopeDeConclusao, etapaDef, garantirMissoes, linhaDoAvanco as linhaEtapa, ativas as missoesAtivas, recompensaDe, resumoMissoesPrompt, tipoDef as tipoMissao } from "../missoes.js";
import { MOLDE_PADRAO, moldePorId, resumoMoldePrompt } from "../moldes.js";
import { notaComOTurno } from "./aplicar.js";
import { somarAoContador } from "./combate-do-turno.js";
import { oEnvelopeDaGente } from "./envelopes-do-turno.js";
import { arcoComOMarco, ganhoDeFe } from "./meio-do-turno.js";
import { CONTAGEM_VAZIA, pontoDaSorte as pontoDaSorteDe, sorteNoPonto } from "./sorte-do-turno.js";
import { chaveDoLugar, garantirBase, oQueExisteAqui } from "../mundo-base.js";
import { garantirLaco, resumoNPCsParaPrompt } from "../npcs.js";
import { envelopeDoRecado, genteDaHistoria, ofertasDaqui } from "../ofertas.js";
import { resumoPericiasPrompt } from "../pericias.js";
import { resumoProfissaoPrompt } from "../profissoes.js";
import { SINAIS_ABERTOS, montarSystemPrompt } from "../prompt.js";
import { aplicarNivel, atributoEfetivo } from "../regras-jogo.js";
import { bonusProficiencia, ehProficiente, resumoEpico } from "../regras.js";
import { barraDe } from "../relogios.js";
import { conferirEspinha, fatosQueFecham, feitioDe, garantirEspinha, linhaDoMarco, progressoDoAto } from "../saga.js";
import { LUGARES, ocupados as ocupadosDaSala } from "../sala.js";
import { sorteDaCasa } from "../semente.js";
import { resumoSintoniaPrompt } from "../sintonia.js";
import { pagaDoFecho } from "../tarefas-antigas.js";
import { VINCULO_INICIAL, linhaDoVinculo } from "../vinculos.js";
import { comSorte } from "../semente.js";

/* OS REFS QUE OS ÓRGÃOS DO DEPOIS TOCAM — um por campo, como no prelúdio:
   o nome do ref no App, se o save o guarda (o campo é o do save; senão é o
   do ref), se algum órgão o escreve, e o valor de partida (o mesmo
   `useRef(...)` do App). */
export const REFS_DO_DEPOIS = Object.freeze({
  abertura: Object.freeze({ ref: "aberturaMundoRef", salvo: true, escreve: false, padrao: () => (garantirAbertura(null)) }),
  acampado: Object.freeze({ ref: "acampadoRef", salvo: true, escreve: false, padrao: () => (false) }),
  atoDoTurno: Object.freeze({ ref: "atoDoTurnoRef", salvo: false, escreve: false, padrao: () => ("nada") }),
  bancoNomes: Object.freeze({ ref: "bancoNomesRef", salvo: false, escreve: false, padrao: () => (null) }),
  baseMundo: Object.freeze({ ref: "baseMundoRef", salvo: true, escreve: true, padrao: () => (garantirBase(null)) }),
  canone: Object.freeze({ ref: "canoneRef", salvo: true, escreve: true, padrao: () => ({}) }),
  chao: Object.freeze({ ref: "chaoRef", salvo: true, escreve: false, padrao: () => (criarChao()) }),
  chegadaInferida: Object.freeze({ ref: "chegadaInferidaRef", salvo: false, escreve: false, padrao: () => ("") }),
  cidadeAtual: Object.freeze({ ref: "cidadeAtualRef", salvo: true, escreve: true, padrao: () => ("") }),
  cobrouAgora: Object.freeze({ ref: "cobrouAgoraRef", salvo: false, escreve: false, padrao: () => (false) }),
  combate: Object.freeze({ ref: "combateRef", salvo: true, escreve: true, padrao: () => (null) }),
  compasso: Object.freeze({ ref: "compassoRef", salvo: true, escreve: false, padrao: () => (garantirCompasso(null)) }),
  confidencias: Object.freeze({ ref: "confidenciasRef", salvo: true, escreve: false, padrao: () => ([]) }),
  contadores: Object.freeze({ ref: "contRef", salvo: true, escreve: true, padrao: () => ({ ...CONTADORES_INICIAIS }) }),
  contagemDaSorte: Object.freeze({ ref: "contagemDaSorteRef", salvo: false, escreve: true, padrao: () => (CONTAGEM_VAZIA) }),
  danoJaAplicado: Object.freeze({ ref: "danoJaAplicadoRef", salvo: false, escreve: true, padrao: () => (false) }),
  derrotadosDaSessao: Object.freeze({ ref: "derrotadosDaSessaoRef", salvo: false, escreve: false, padrao: () => ([]) }),
  devocao: Object.freeze({ ref: "devocaoRef", salvo: true, escreve: true, padrao: () => ({ cidades: {}, andarilhos: 0 }) }),
  dia: Object.freeze({ ref: "diaRef", salvo: true, escreve: false, padrao: () => (1) }),
  divindade: Object.freeze({ ref: "divindadeRef", salvo: true, escreve: true, padrao: () => (garantirDivindade(null)) }),
  elenco: Object.freeze({ ref: "elencoSaveRef", salvo: true, escreve: false, padrao: () => (garantirElencoDoSave(null)) }),
  espinha: Object.freeze({ ref: "espinhaRef", salvo: true, escreve: true, padrao: () => (garantirEspinha(null)) }),
  eventos: Object.freeze({ ref: "eventosRef", salvo: true, escreve: true, padrao: () => ({ locais: [], global: null, semGlobalDesde: 0, seq: 1 }) }),
  faccaoJogador: Object.freeze({ ref: "faccaoJogadorRef", salvo: true, escreve: true, padrao: () => ("") }),
  falouCom: Object.freeze({ ref: "falouComRef", salvo: false, escreve: false, padrao: () => ([]) }),
  genteNaPauta: Object.freeze({ ref: "genteNaPautaRef", salvo: false, escreve: false, padrao: () => (null) }),
  governos: Object.freeze({ ref: "governosRef", salvo: true, escreve: false, padrao: () => ({}) }),
  guildas: Object.freeze({ ref: "guildasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  habUsada: Object.freeze({ ref: "habUsadaRef", salvo: false, escreve: true, padrao: () => (false) }),
  historia: Object.freeze({ ref: "historiaRef", salvo: true, escreve: true, padrao: () => (garantirHistoria({ estrutura: "jornada", etapa: 0 })) }),
  jornada: Object.freeze({ ref: "jornadaRef", salvo: true, escreve: true, padrao: () => (null) }),
  lugar: Object.freeze({ ref: "lugarRef", salvo: true, escreve: true, padrao: () => (null) }),
  mapa: Object.freeze({ ref: "mapaRef", salvo: true, escreve: true, padrao: () => ({ cidades: [], faccoes: [] }) }),
  masmorra: Object.freeze({ ref: "masmorraRef", salvo: true, escreve: false, padrao: () => (null) }),
  mensagens: Object.freeze({ ref: "mensagensRef", salvo: true, escreve: false, padrao: () => ([]) }),
  minuto: Object.freeze({ ref: "minutoRef", salvo: true, escreve: false, padrao: () => (AMANHECER + 60) }),
  missoes: Object.freeze({ ref: "missoesRef", salvo: true, escreve: true, padrao: () => ([]) }),
  mundo: Object.freeze({ ref: "mundoRef", salvo: false, escreve: false, padrao: () => (null) }),
  mural: Object.freeze({ ref: "muralRef", salvo: true, escreve: true, padrao: () => ([]) }),
  nemesis: Object.freeze({ ref: "nemesisRef", salvo: true, escreve: false, padrao: () => (null) }),
  nomeCampanha: Object.freeze({ ref: "nomeCampanhaRef", salvo: false, escreve: false, padrao: () => ("") }),
  nota: Object.freeze({ ref: "notaRef", salvo: false, escreve: true, padrao: () => ("") }),
  npcs: Object.freeze({ ref: "npcsRef", salvo: true, escreve: true, padrao: () => ({}) }),
  npcTurno: Object.freeze({ ref: "npcTurnoRef", salvo: false, escreve: true, padrao: () => (0) }),
  personagem: Object.freeze({ ref: "personagemRef", salvo: false, escreve: true, padrao: () => (null) }),
  portao: Object.freeze({ ref: "portaoRef", salvo: false, escreve: true, padrao: () => (null) }),
  portaoCtx: Object.freeze({ ref: "portaoCtxRef", salvo: false, escreve: true, padrao: () => (null) }),
  quests: Object.freeze({ ref: "questsRef", salvo: true, escreve: false, padrao: () => ([]) }),
  raid: Object.freeze({ ref: "raidRef", salvo: true, escreve: false, padrao: () => (null) }),
  relogios: Object.freeze({ ref: "relogiosRef", salvo: true, escreve: true, padrao: () => ([]) }),
  sala: Object.freeze({ ref: "salaRef", salvo: false, escreve: false, padrao: () => (null) }),
  segredosRevelados: Object.freeze({ ref: "segredosReveladosRef", salvo: false, escreve: false, padrao: () => ([]) }),
  sinaisDoTurno: Object.freeze({ ref: "sinaisDoTurnoRef", salvo: false, escreve: false, padrao: () => (SINAIS_ABERTOS) }),
  sinalMasmorra: Object.freeze({ ref: "sinalMasmorraRef", salvo: false, escreve: true, padrao: () => (null) }),
  sinalRaid: Object.freeze({ ref: "sinalRaidRef", salvo: false, escreve: true, padrao: () => (null) }),
  sinalViagem: Object.freeze({ ref: "sinalViagemRef", salvo: false, escreve: true, padrao: () => (null) }),
  system: Object.freeze({ ref: "systemRef", salvo: false, escreve: true, padrao: () => ("") }),
  textura: Object.freeze({ ref: "texturaRef", salvo: false, escreve: true, padrao: () => ({}) }),
  tomando: Object.freeze({ ref: "tomandoRef", salvo: true, escreve: false, padrao: () => (null) }),
  trabalhoPendente: Object.freeze({ ref: "trabalhoPendenteRef", salvo: false, escreve: true, padrao: () => ([]) }),
  ultimoTrabalhoDia: Object.freeze({ ref: "ultimoTrabalhoDiaRef", salvo: false, escreve: true, padrao: () => (0) }),
});

/* O ESTADO REACT QUE ELES LEEM: o do último render, em `estado.render`;
   sem ele, o do estado. */
export const RENDER_DO_DEPOIS = Object.freeze(["mundo","nomeCampanha","personagem"]);

/* OS ÓRGÃOS que a fábrica devolve, e AS PORTAS, pelo nome. */
export const ORGAOS_DO_DEPOIS = Object.freeze(["oferecerTrabalhoDaqui","pregarNoMural","conferirAsMissoes","ganharFe","marcarNoArco","conferirCom"]);
export const PORTAS_DO_DEPOIS = Object.freeze(["aplicar", "calou", "pushMsgs", "salvar", "agora", "sorte", "reler", ...["setBaseMundo","setChegada","setCombate","setDevocao","setDivindade","setEspolioRevelado","setEventos","setGuildasMundo","setJornada","setLugar","setLugarNovo","setMapa","setMissoes","setMural","setNpcs","setPersonagem","setQuests","setRelogios"]]);

/* ---------------- o que é do módulo do App, à letra ---------------- */


/* ============================================================
   OS ÓRGÃOS DO DEPOIS
   osOrgaosDoDepois(estado, portas) → { ...ORGAOS_DO_DEPOIS, escritas, descarregar }
   ============================================================ */
export function osOrgaosDoDepois(estado, portas) {
  const $E = estado && typeof estado === "object" ? estado : {};
  const $P = portas && typeof portas === "object" ? portas : {};
  const $render0 = $E.render && typeof $E.render === "object" ? $E.render : {};
  const escritas = {};
  let pendentes = {};
  const partida = {};
  /* o App muda por dentro o que está nos refs, e à letra a peça faz o
     mesmo: cada campo que é objeto é COPIADO na primeira leitura (e a foto
     dele guardada), para o estado que entra não mudar; o que mudou por
     dentro sem ser reescrito vira escrita antes de cada porta e no fim */
  const $copias = {};
  const copiar = (c, v0) => {
    if (!v0 || typeof v0 !== "object") return v0;
    $copias[c] = { v: structuredClone(v0), foto: JSON.stringify(v0) };
    return $copias[c].v;
  };
  /* o que a releitura trouxe do App (ver `reler`, abaixo) */
  const relidos = {};
  const tem = (o, c) => Object.prototype.hasOwnProperty.call(o, c);
  const lerCampo = (c) => {
    if (tem(escritas, c)) return escritas[c];
    if (c in $copias) return $copias[c].v;
    if (tem(relidos, c)) return copiar(c, relidos[c]);
    if ($E[c] !== undefined) return copiar(c, $E[c]);
    if (!REFS_DO_DEPOIS[c]) return undefined;
    if (!(c in partida)) partida[c] = copiar(c, REFS_DO_DEPOIS[c].padrao());
    return partida[c];
  };
  const mudouPorDentro = () => {
    for (const [c, x] of Object.entries($copias)) {
      if (Object.prototype.hasOwnProperty.call(escritas, c)) { delete $copias[c]; continue; }
      if (JSON.stringify(x.v) !== x.foto) { escritas[c] = x.v; pendentes[c] = x.v; delete $copias[c]; }
    }
  };
  const $ref = new Proxy({}, {
    get: (_, c) => (typeof c === "string" ? lerCampo(c) : undefined),
    set: (_, c, v) => { escritas[c] = v; pendentes[c] = v; return true; },
  });
  const $partidaDoRender = {
    mundo: () => (null),
    nomeCampanha: () => (""),
    personagem: () => (null),
  };
  const $render = {};
  for (const n of RENDER_DO_DEPOIS) {
    const v = Object.prototype.hasOwnProperty.call($render0, n) ? $render0[n] : $E[n];
    $render[n] = v !== undefined ? v : $partidaDoRender[n]();
  }
  const descarregar = () => {
    mudouPorDentro();
    const x = pendentes;
    pendentes = {};
    if (Object.keys(x).length && typeof $P.aplicar === "function") $P.aplicar(x);
  };
  /* AS PORTAS. Antes de o App ter a palavra, recebe o que já se escreveu. */
  const calou = (onde, e) => { try { if (typeof $P.calou === "function") $P.calou(onde, e); } catch { /* o calou nunca custa o turno */ } return []; };
  /* A RELEITURA, DEPOIS DE CADA PORTA. No App a fábrica nasce com a cópia
     dos refs do instante; uma porta que lá escreva num ref que a peça lê
     a seguir (um setter que embrulhe, o salvar que poda e avisa pelo
     pushMsgs) deixaria a peça a ler a cópia velha. Com `portas.reler` (os
     refs do App agora, pelo campo), a peça relê depois de cada porta: o
     campo cujo valor já não é o que a peça lá deixou passa a ser o do App
     (e conta em `relidos`). Sem ela (o servidor, onde o estado é o da
     peça e ninguém mais o escreve), não há o que reler. */
  const conhecido = (c) => (tem(escritas, c) ? escritas[c] : tem(relidos, c) ? relidos[c] : $E[c]);
  const reler = () => {
    if (typeof $P.reler !== "function") return;
    let f;
    try { f = $P.reler(); } catch (e) { calou("a releitura do depois", e); return; }
    if (!f || typeof f !== "object") return;
    for (const c of Object.keys(f)) {
      if (!REFS_DO_DEPOIS[c] || f[c] === conhecido(c)) continue;
      delete $copias[c];
      if (tem(escritas, c)) escritas[c] = f[c];
      else relidos[c] = f[c];
    }
  };
  /* o ref como valor (o conferirCom escolhe em qual dos dois põe a
     conversa): ler e escrever o `current` dele é ler e escrever o campo */
  const $umRef = (c) => ({ get current() { return $ref[c]; }, set current(v) { $ref[c] = v; } });
  void $umRef;
  /* a porta pode DEVOLVER a lista nova (o App: a luta carimba as
     mensagens); sem lista devolvida (o servidor), a peça junta as novas */
  const pushMsgs = (novas) => {
    descarregar();
    const lista = typeof $P.pushMsgs === "function" ? $P.pushMsgs(novas) : undefined;
    if (Array.isArray(lista)) { escritas.mensagens = lista; delete $copias.mensagens; }
    else $ref.mensagens = [...($ref.mensagens || []), ...(Array.isArray(novas) ? novas : [])];
    reler();
  };
  const salvar = (extra) => { descarregar(); if (typeof $P.salvar === "function") $P.salvar(extra); reler(); };
  const setBaseMundo = (v) => { descarregar(); if (typeof $P.setBaseMundo === "function") $P.setBaseMundo(v); reler(); };
  const setChegada = (v) => { descarregar(); if (typeof $P.setChegada === "function") $P.setChegada(v); reler(); };
  const setCombate = (v) => { descarregar(); if (typeof $P.setCombate === "function") $P.setCombate(v); reler(); };
  const setDevocao = (v) => { descarregar(); if (typeof $P.setDevocao === "function") $P.setDevocao(v); reler(); };
  const setDivindade = (v) => { descarregar(); if (typeof $P.setDivindade === "function") $P.setDivindade(v); reler(); };
  const setEspolioRevelado = (v) => { descarregar(); if (typeof $P.setEspolioRevelado === "function") $P.setEspolioRevelado(v); reler(); };
  const setEventos = (v) => { descarregar(); if (typeof $P.setEventos === "function") $P.setEventos(v); reler(); };
  const setGuildasMundo = (v) => { descarregar(); if (typeof $P.setGuildasMundo === "function") $P.setGuildasMundo(v); reler(); };
  const setJornada = (v) => { descarregar(); if (typeof $P.setJornada === "function") $P.setJornada(v); reler(); };
  const setLugar = (v) => { descarregar(); if (typeof $P.setLugar === "function") $P.setLugar(v); reler(); };
  const setLugarNovo = (v) => { descarregar(); if (typeof $P.setLugarNovo === "function") $P.setLugarNovo(v); reler(); };
  const setMapa = (v) => { descarregar(); if (typeof $P.setMapa === "function") $P.setMapa(v); reler(); };
  const setMissoes = (v) => { descarregar(); if (typeof $P.setMissoes === "function") $P.setMissoes(v); reler(); };
  const setMural = (v) => { descarregar(); if (typeof $P.setMural === "function") $P.setMural(v); reler(); };
  const setNpcs = (v) => { descarregar(); if (typeof $P.setNpcs === "function") $P.setNpcs(v); reler(); };
  const setPersonagem = (v) => { descarregar(); if (typeof $P.setPersonagem === "function") $P.setPersonagem(v); reler(); };
  const setQuests = (v) => { descarregar(); if (typeof $P.setQuests === "function") $P.setQuests(v); reler(); };
  const setRelogios = (v) => { descarregar(); if (typeof $P.setRelogios === "function") $P.setRelogios(v); reler(); };
  const $agora = typeof $P.agora === "function" ? $P.agora : () => Date.now();
  void $agora;

  /* ---------------- A FICHA VIVA (v9.41) ----------------
     O espelho acima só é atualizado por um efeito — ou seja, na renderização
     SEGUINTE. Só que um turno de combate inteiro roda dentro de UM clique:
     eu ataco, o sistema fecha a luta, credita os espólios, e a linha de baixo
     manda ao Mestre a cópia da ficha que quem chamou tinha em mão antes de
     tudo isso. A cópia velha chega ao `aplicarResposta` e volta por cima.

     Foi exatamente assim que "+21 moedas e +90 XP" apareceu na tela e não
     apareceu na bolsa: o crédito existiu por três linhas. `fichaViva` lê o
     estado mais recente e `mudarFicha` grava nos dois lugares de uma vez, de
     modo que o próximo a ler nunca receba o passado. */
  const fichaViva = () => $ref.personagem || $render.personagem;
  /* v9.22: `mundoAtual()` e `nomeCampanhaRef` existem porque VÁRIOS callbacks
     desta casa são useCallback de deps estreitas, criados no primeiro render —
     quando mundo é null e o nome da campanha é "". Ler o estado direto lá
     dentro devolve esses valores de nascimento para sempre. Aqui a
     consequência era silenciosa e por isso pior: o system prompt era
     remontado com campanha sem nome e mundo vazio toda vez que o cânone ou o
     registro de pessoas mudava, e o Mestre perdia contexto sem ninguém ver. */
  const mundoAtual = () => $ref.mundo || $render.mundo || null;
  const sementeMundo = () => `${$ref.nomeCampanha || $render.nomeCampanha || "aventura"}|${(mundoAtual() && mundoAtual().genero) || ""}`;
  const pontoDaSorte = () => pontoDaSorteDe({ dia: $ref.dia, minuto: $ref.minuto, falas: ($ref.mensagens || []).length });
  const sorteDoTurno = (evento) => {
    try {
      const r = sorteNoPonto($ref.contagemDaSorte, sementeMundo(), pontoDaSorte(), evento);
      $ref.contagemDaSorte = r.contagem;
      return r.sorte;
    } catch (e) { calou("sorteDoTurno", e); return sorteDaCasa; }
  };
  const generoMundo = () => (mundoAtual() && mundoAtual().genero) || cenarioAtivo().generos.padrao;
  /* v9.40: a FORMA do mundo desta campanha. Todo gerador que fala de lugar
     recebe isto ao lado do gênero — um decide o sabor, o outro a forma. */
  const moldeMundo = () => moldePorId((mundoAtual() && mundoAtual().molde) || MOLDE_PADRAO);
  /* O que o Mestre recebe sobre o cosmos: regras só após o despertar (custo zero antes) */
  const infoDivindade = () => {
    const dv = $ref.divindade;
    if (!dv || !dv.despertar) return "";
    const fe = resumoFePrompt($ref.mapa, $ref.devocao, dv);
    return `${DIVINDADE_PROMPT}\n${CAMINHOS_PROMPT}\n${DEVOCAO_PROMPT}\nEstado atual do jogador: ${resumoAscensao(dv, 0)}${dv.panteao.length ? `\nPanteão conhecido: ${dv.panteao.map((d) => `${d.icone} ${d.nome} ${d.dominio} — GD ${d.gd} (${tituloDe(d.gd)}), culto: ${d.culto}`).join("; ")}.` : ""}${fe ? `\n${fe}` : ""}`;
  };
  /* ---------------- ANDAR DENTRO DA CIDADE (v9.55) ----------------
     "Vou até o Javali Cambaleante." O Mestre narrou a travessia da praça e
     a porta da taverna, e o sistema deixou o herói no centro — o marcador
     do mapa não saiu do lugar.

     O Mestre estava certo em não registrar nada: o prompt lhe diz que
     `lugar_atual` é o que fica FORA da cidade. A taverna não é fora da
     cidade. O modelo tinha dois estados — dentro e fora — e a cidade
     inteira cabia no primeiro.

     Quem move, então, é o CÓDIGO, e move ANTES de o Mestre responder: o
     jogador escreveu o nome de um lugar que o sistema conhece, com um
     verbo de deslocamento. Não há o que interpretar, e é justamente o
     tipo de coisa que esta casa não delega.

     Vale para os dois lados do muro: um local de dentro vira `dentro` (sair
     dele leva minutos); um do cinturão vira `arredores` (leva horas), que é
     o que já era. E o Mestre recebe o fato pronto, não um pedido. */
  const semNome = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const pessoasDaCena = () => {
    try {
      const p0 = fichaViva() || $render.personagem || {};
      const { aqui } = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: p0.grupo || [], masmorra: $ref.masmorra });
      const quantos = aqui.length;
      const daBase = oQueExisteAqui(sementeMundo(), $ref.mapa, $ref.cidadeAtual, $ref.baseMundo, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico);
      const confid = $ref.confidencias || [];
      return aqui.map((x) => {
        const nome = typeof x === "string" ? x : x.nome;
        const n = $ref.npcs[nome] || {};
        const l = garantirLaco(n.laco);
        const daBaseEla = ((daBase && daBase.gente) || []).find((g) => g.nome === nome) || {};
        const noGrupo = (p0.grupo || []).some((g) => (g.nome || "") === nome);
        return {
          nome,
          papel: n.papel || daBaseEla.papel || "",
          temperamento: n.traco || daBaseEla.traco || "",
          quer: daBaseEla.vontade || n.notas || "",
          teme: n.segredo || "",
          relacao: n.relacao || "desconhecido",
          laco: (l && l.tipo) || "",
          forcaDoLaco: (l && !l.rompido && l.forca) || 0,
          rompido: !!(l && l.rompido),
          euDevo: /d[íi]vida|devo|prometi/i.test(String(n.notas || "")) || (l && l.tipo === "divida"),
          /* 11/10 (MM11 · 5.ª sessão, M35): quem recebeu de mim sem que eu
             pedisse nada fica a dever (`registarABolsaDaFrase`) — o sinal
             que o Intérprete e a índole já liam e ninguém acendia */
          meDeve: !!n.meDeve,
          sabeDeMim: confid.some((c) => (c.ouvintes || []).includes(nome)),
          euSeiDela: !!n.segredo,
          primeiraVez: n.conhecidoEm == null && !noGrupo, /* v9.315: dia 0 é conhecido, não "nunca vi" (!n.conhecidoEm tratava os dois igual) */
          viuAntes: (() => { try { return jaMeViuAntes(n, { hoje: $ref.dia, vistos: ($ref.elenco || {}).vistos }); } catch (e) { calou("viuAntes", e); return false; } })(),
          ato: $ref.atoDoTurno,
          quantosEscutam: Math.max(0, quantos - 1),
          aSos: quantos <= 1,
          emPerigo: !!$ref.combate || ($ref.personagem || $render.personagem || {}).vida < (($ref.personagem || $render.personagem || {}).vidaMax || 1) * 0.35,
          emCombate: !!$ref.combate,
          noLugarDela: !!($ref.lugar && daBaseEla.local && $ref.lugar.nome === daBaseEla.local),
          tocaramNoSegredo: !!n.segredo && /segredo|verdade|passado|de onde|quem [ée]/i.test($ref.atoDoTurno === "pedi" ? "pergunta" : ""),
          ehCompanheiro: noGrupo,
          fama: Math.round(famaAtual()),
          noite: ehNoite($ref.minuto),
        };
      });
    } catch (e) { return calou("pessoasDaCena", e); }
  };
 /* ONDA 3 DO CUSTO (14/10): a relevância do turno (relevancia.js: o que o turno cita pelo nome, quem a cena tem, onde o herói está), lida pela gente, pelo cânone, pelas masmorras e pelos esconderijos; se a pauta trouxe a linha A GENTE (a porta do bloco que a ensina); e os nomes da gente da cidade (a GENTE POR CONHECER não os repete). Montados em enviar, junto dos sinais; fora de um turno ou se estourarem, null — e tudo vai como antes. Não vão ao save. */
  /* o herói tem o que governar: facção, cidade sua, governo, cidade a ser
     tomada, ou uma casa de que é membro (a guilda do painel de Gestão) */
  const temOQueGovernar = () => {
    try {
      return !!$ref.faccaoJogador
        || (($ref.mapa || {}).cidades || []).some((c) => c && c.relacao === "jogador")
        || Object.keys($ref.governos || {}).length > 0
        || !!$ref.tomando
        || ($ref.guildas || []).some((g) => g && g.membro);
    } catch (e) { calou("o herói tem o que governar", e); return true; }
  };
  const cenaDoPrompt = () => {
    const p = fichaViva() || $render.personagem || {};
    const sinais = $ref.sinaisDoTurno || SINAIS_ABERTOS;
    const mm = $ref.masmorra;
    const cena = {
      emCombate: !!$ref.combate,
      emMasmorra: !!(mm && !mm.encerrada),
      /* v9.115: há um chamado em curso? É a porta da raid. */
      emRaid: !!($ref.raid && $ref.raid.fase === "luta"),
      /* v9.117: há uma missão DO SISTEMA aberta? É a porta da trama. */
      temTrama: ($ref.missoes || []).some((m) => m && m.status === "ativa" && m.tipo === "trama"),
      /* v9.120: a porta da mesa de dois abre quando há de fato duas
         cadeiras ocupadas — não quando há uma sala aberta e vazia. */
      emSala: ocupadosDaSala($ref.sala).length >= LUGARES,
      /* v9.106: há alguém em cena? É a porta do Intérprete. */
      temGente: pessoasDaCena().length > 0,
      temVilao: !!($ref.nemesis && $ref.nemesis.nome),
      /* v9.112: a Pauta deste turno traz uma cobrança do mundo? */
      temCobranca: !!$ref.cobrouAgora,
      temChao: ($ref.chao || []).length > 0,
      emCidade: !!$ref.cidadeAtual,
      /* dentro de um PRÉDIO da cidade — não nos arredores. A régua é a
         distância, que já sabe distinguir uma escada de uma caminhada. */
      dentroDeUmLocal: !!($ref.lugar && $ref.lugar.distancia === "dentro" && $ref.cidadeAtual),
      /* cidade tem mercador; ermo não tem. É a mesma pergunta, e é honesta:
         a regra de compra e venda importa onde há de quem comprar. */
      /* ONDA 2 DO CUSTO: e a tabela de preços só abre quando o turno fala de
         comércio — na cidade ela abria em 96% dos turnos e é de onde vinham
         os preços inventados; o preço de verdade chega por PERGUNTOU e O PREÇO */
      temMercado: !!$ref.cidadeAtual && !!sinais.comercio,
      temGoverno: temOQueGovernar() || !!sinais.governo,
      fimDoAcampamento: !!sinais.fimDoAcampamento,
      temBancada: ((p.inventario || []).some((it) => !!comoComponente(it))),
      temMissao: !!resumoMissoesPrompt($ref.missoes),
      conjura: perfilCombate(p.classe).tipo === "conjurador" || temCaderno(p)
        || (p.habilidades || []).some((h) => ehMagiaDoGrimorio(h && h.nome)),
      temGrupo: ((p.grupo || []).length > 0),
      temLegado: !!resumoLegadoPrompt(p),
      temSintonia: !!resumoSintoniaPrompt(p),
      temEspecializacao: !!p.especializacao,
      despertou: !!($ref.divindade && $ref.divindade.despertar),
      invoca: (p.habilidades || []).some((h) => !!invocacaoDe(h)) || invocacoesDe(p).length > 0,
      /* o bloco explica como narrar um efeito que ACABA por acontecimento —
         sem efeito assim ativo, não há o que narrar */
      temGatilho: (p.efeitos || []).some((e) => gatilhosDe(e).length > 0),
      temDadiva: ((p.dadivas || []).length > 0) || (p.nivel || 1) >= 20,
      temRegraPropria: temRegraPropria(p),
      emViagem: !!$ref.jornada, acampado: !!$ref.acampado, genteNaPauta: $ref.genteNaPauta, /* onda 3 do custo: `acampado` nunca vinha, e a porta do acampamento (ACAMPAMENTO_PROMPT) nunca abria — o defeito que a onda 2 achou; `genteNaPauta` abre o bloco da GENTE EM CENA só com a linha A GENTE na pauta (null fora de um turno = a porta de antes) */
    };
    /* MM17 C2: lá dentro fecham o mercado, a cidade, a estrada e o prédio
       (PORTAS_NA_MASMORRA): 2.768 car. de regras de compra e venda por
       turno numa cripta. Fora dela, a mesma cena (o mesmo objeto). */
    try { return cenaNaMasmorra(cena); } catch (e) { calou("cenaNaMasmorra", e); return cena; }
  };
  /* o nível é o da ficha VIVA (o ref, 4.ª fatia): o `personagem` do render
     é nulo nas closures que nascem no primeiro render (o aplicarResposta é
     uma delas), e a fama caía no nível 1 — o defeito 4 de 28/10 */
  const famaAtual = () => calcularFama($ref.contadores, (($ref.personagem || $render.personagem || {}).nivel) || 1, dominiosDe($ref.mapa).length);
  const tempoInfoPrompt = () => {
    const est = estacaoDe($ref.dia);
    return `TEMPO DA CAMPANHA: hoje é ${dataTxt($ref.dia)} — dia ${$ref.dia} da campanha —, ${horaTxt($ref.minuto)}${ehNoite($ref.minuto) ? " (NOITE)" : ""}, ${est.nome.toLowerCase()} ${est.icone} (${est.nota}). O app controla o relógio e o calendário: NUNCA estime datas ou horas por conta própria; use estas.`;
  };
  /* OS EFEITOS DO MOTOR, NUM LUGAR SÓ (T1-A, 27/10). O motor (`aplicar`)
     não escreve em ref nem chama setX: devolve o estado novo e descreve o
     resto. Aqui é onde isso vira tela — cada um em `calou`, porque um
     efeito que estoura não pode levar o turno. A nota cresce como sempre
     cresceu (`notaComOTurno`); as travas voltam aos refs; a luta vai ao
     ref e à tela; os erros que o motor engoliu chegam ao `calou` com o nome
     de sempre. */
  const aplicarOsEfeitos = (saida) => {
    if (!saida || !saida.estado) return;
    /* as travas voltam aos refs só quando o estado as traz: o registo (e
       o mapa, e o lugar dito) não as levam, e escrever `undefined` nelas
       desarmava a trava do dano que o aplicar deixou armada para o turno
       seguinte (o achado de 28/10, na 3.ª fatia) */
    try { if ("danoJaAplicado" in saida.estado) $ref.danoJaAplicado = saida.estado.danoJaAplicado; } catch (e) { calou("aplicarOsEfeitos/danoJaAplicado", e); }
    try { if ("habUsada" in saida.estado) $ref.habUsada = saida.estado.habUsada; } catch (e) { calou("aplicarOsEfeitos/habUsada", e); }
    try { $ref.nota = notaComOTurno($ref.nota, saida.paraOCronista); } catch (e) { calou("aplicarOsEfeitos/nota", e); }
    for (const ef of saida.efeitos || []) {
      try {
        if (ef.tipo === "combate") { $ref.combate = ef.combate; setCombate(ef.combate); }
        else if (ef.tipo === "textura") $ref.textura = { ...$ref.textura, ganho: true };
        else if (ef.tipo === "calou") calou(ef.onde, ef.erro);
        /* o registo (T1-A, 2.ª fatia): o cânone, o mapa, a gente, e o prompt
           remontado com tudo isso já no lugar — o próximo turno enxerga */
        else if (ef.tipo === "canone") $ref.canone = ef.canone;
        else if (ef.tipo === "mapa") { $ref.mapa = ef.mapa; setMapa(ef.mapa); }
        else if (ef.tipo === "npcTurno") $ref.npcTurno = ef.npcTurno;
        else if (ef.tipo === "npcs") { $ref.npcs = ef.npcs; setNpcs(ef.npcs); }
        /* o mapa e o lugar (T1-A, 3.ª fatia): a cidade em que estou, o lugar
           dito, a jornada, a facção, a devoção, e a cerimónia da chegada —
           a faixa ganha aqui a chave do instante, que não é estado do jogo */
        else if (ef.tipo === "cidadeAtual") $ref.cidadeAtual = ef.cidade;
        else if (ef.tipo === "lugar") { $ref.lugar = ef.lugar; setLugar(ef.lugar); }
        else if (ef.tipo === "jornada") { $ref.jornada = ef.jornada; setJornada(ef.jornada); }
        else if (ef.tipo === "faccaoJogador") $ref.faccaoJogador = ef.faccao;
        else if (ef.tipo === "devocao") { $ref.devocao = ef.devocao; setDevocao(ef.devocao); }
        else if (ef.tipo === "lugarNovo") setLugarNovo(ef.cidade);
        else if (ef.tipo === "chegada") setChegada({ ...ef.chegada, chave: $agora() });
        /* as missões e os sinais (T1-A, 3.ª fatia): o deus, a ficha que o
           milagre muda (o ref, a tela e o save juntos, v9.32), os eventos, o
           arco, a lista das missões redesenhada, as portas que os sinais
           pedem, e a revelação do achado. O achado em si já não é efeito
           (4.ª fatia): entrava por uma função atualizadora, e o
           `setPersonagem(pers)` do fim do turno apagava-o; agora vem dentro
           da ficha do turno, que é a que se grava. */
        else if (ef.tipo === "divindade") { $ref.divindade = ef.divindade; setDivindade(ef.divindade); }
        else if (ef.tipo === "ficha") { $ref.personagem = ef.personagem; setPersonagem(ef.personagem); salvar({ personagem: ef.personagem }); }
        else if (ef.tipo === "eventos") { $ref.eventos = ef.eventos; setEventos(ef.eventos); }
        else if (ef.tipo === "historia") $ref.historia = ef.historia;
        else if (ef.tipo === "quests") setQuests([...$ref.quests]);
        else if (ef.tipo === "sinalViagem") $ref.sinalViagem = ef.destino;
        else if (ef.tipo === "sinalMasmorra") $ref.sinalMasmorra = ef.nome;
        else if (ef.tipo === "sinalRaid") $ref.sinalRaid = ef.nome;
        else if (ef.tipo === "espolio") setEspolioRevelado(ef.item);
        /* o fim do turno (T1-A, 4.ª fatia): a base do mundo com o que a
           narração revelou — o ref e a tela juntos, como no registrarRevelacao */
        else if (ef.tipo === "base") { $ref.baseMundo = ef.base; setBaseMundo(ef.base); }
        /* o portão: o contexto que o conserto reusa (só quando chegou a ser
           montado) e as violações do turno */
        else if (ef.tipo === "portao") { if ("contexto" in ef) $ref.portaoCtx = ef.contexto; $ref.portao = ef.violacoes; }
        else if (ef.tipo === "remontarPrompt") $ref.system = montarSystemPrompt($ref.nomeCampanha || $render.nomeCampanha, mundoAtual(), ef.personagem || $ref.personagem, $ref.canone, $ref.bancoNomes, (resumoMapaParaPrompt($ref.mapa, $ref.faccaoJogador) + "\n" + resumoDiplomacia($ref.mapa, $ref.faccaoJogador)).trim(), resumoDoArco(), resumoQuests($ref.quests), resumoNPCsParaPrompt($ref.npcs), tempoInfoPrompt(), infoDivindade(), infoTitulo(), cenaDoPrompt());
      } catch (e) { calou("aplicarOsEfeitos/" + (ef && ef.tipo), e); }
    }
  };
  /* CRONISTA DO TURNO (v7.4.2): fusão do Fiscal de Missões com o Escriba —
     UMA única chamada leve por turno (antes eram duas: metade do custo e da
     latência) julga o turno inteiro de uma vez e devolve um JSON por seções.
     O CÓDIGO aplica cada seção ISOLADAMENTE: se uma vier quebrada, as outras
     ainda valem. Conservador de propósito: seções vazias são comuns. */
  /* O estado que as etapas consultam. Serve ao conferente (a cada turno) e à
     porta de entrada das ofertas — é ele que impede uma etapa de nascer
     cumprida, como "encontre Ubba" com Ubba na sua frente. */
  const mundoDasMissoes = (persAtual) => {
    const p = persAtual || $ref.personagem || $render.personagem || {};
    return {
      cidadeAtual: $ref.cidadeAtual,
      /* v9.117: e ONDE dentro dela. Uma etapa que manda a uma cabana, a
         uma torre caída ou a uma boca de mina não tem como ser conferida
         por `cidadeAtual` — o herói chegava e o diário não sabia. */
      lugarAtual: $ref.lugar || null,
      /* 11/10: com quem falei neste turno — só na conferência que o
         Cronista dispara (`falouComRef`); fora dela, vazio */
      falouCom: $ref.falouCom || [],
      /* MM-C · C0: o marco com cena fecha pelo FATO (saga.js, fatosQueFecham)
         — o segredo revelado, a conversa — e não por o herói lá estar. Os
         segredos revelados só existem na conferência que o Cronista dispara. */
      soPeloFato: (() => { try { return fatosQueFecham($ref.espinha); } catch (e) { calou("os fatos que fecham", e); return null; } })(),
      segredosRevelados: $ref.segredosRevelados || [],
      derrotados: [...(($ref.baseMundo || {}).mortos || []), ...($ref.derrotadosDaSessao || [])],
      inventario: p.inventario || [], equipamento: p.equipamento || [],
      npcs: $ref.npcs, dia: $ref.dia, relogios: $ref.relogios, emLuta: !!$ref.combate,
      /* v9.129: o que já foi apresentado em cena. É o que a etapa `revelar`
         lê — descobrir é diferente de passar pela porta. */
      revelados: ($ref.baseMundo || {}).revelados || [],
      /* v9.132: a base inteira, porque a etapa de resgate pergunta a
         SITUACAO de alguem — e quem sabe normalizar nome e ela. */
      base: $ref.baseMundo,
      /* MM13 (defeito A): a ponte do "descobrir" — a etapa antiga guarda o
         NOME do lugar, e a base grava a chave "Cidade|tipo" quando revela.
         Sem isto, nenhuma missão de descobrir fechava sozinha. */
      chaveDoLugar: (n) => chaveDoLugar(sementeMundo(), $ref.mapa, n, { genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, cidade: $ref.cidadeAtual }),
      /* 11/10 (MM, o laço da história 1/6, v9.396 do backend): o fio é um só —
         a missão fecha pelo marco que a espinha já fechou. Sem isto "O rasto
         de Edric" (sessão 5) ficava em 0/2 com o marco caído. Ler um ref não
         lança; quem lê o campo (`conferirMissoes`) é que o trata. */
      espinha: $ref.espinha,
      /* MM-C · 7.ª sessão (M51): a cidade a que só se chegou por inferência
         — ir_a/levar_a esperam a confirmação (CHEGADA_INFERIDA) */
      chegadaInferida: $ref.chegadaInferida || "",
    };
  };
  /* A TABELA DE FÉ (v7.5) mudou-se para o motor (T1-B, 27/10):
     motor/cronista.js#TABELA_DA_FE, com a população lida do mapa por
     `feDaTabela`. O juízo do Cronista entrega a conta feita. */

  /* TÍTULO ÚNICO (v7.6): resolve o nome que a ficha mostra e que o Mestre usa.
     Fé tem precedência (é o que o herói É); sem fé, vale a fama. */
  /* VÍNCULOS (v7.8): o Mestre não sabia se um companheiro te adora ou te
     tolera — então a intimidade das falas era chute. Agora ele sabe. */
  const infoVinculos = () => {
    const g = (($render.personagem || $ref.personagem || {}).grupo || []).filter((x) => x && x.nome);
    if (!g.length) return "";
    const linhas = g.map((c) => {
      const v = typeof c.vinculo === "number" ? c.vinculo : VINCULO_INICIAL;
      return linhaDoVinculo(c.nome, v);
    });
    return `VÍNCULOS DO GRUPO (trate cada um com a intimidade certa — quem tem vínculo baixo NÃO faz confidências nem se sacrifica; quem tem vínculo alto puxa assunto pessoal, discorda com liberdade e arrisca a pele por mim): ${linhas.join("; ")}.`;
  };
  const infoRegras = () => {
    const p = $render.personagem || $ref.personagem || {};
    const nv = p.nivel || 1;
    const prof = bonusProficiencia(nv);
    const chave = ATRIBUTOS.find((a) => ehProficiente(p.classe, a.id));
    /* ONDA 2 DO CUSTO: o ESTADO ÉPICO conta o XP de cada turno no nível 20 —
       saiu daqui (que vai ao texto fixo, em cache) para `infoEpico`, que vai
       ao ESTADO com o título */
    return `REGRAS DE PROGRESSÃO (o sistema calcula — não recalibre): proficiência +${prof} (nível ${nv}), somada automaticamente ao atributo que a classe domina${chave ? ` (${chave.nome})` : ""}. Um herói experiente rola alto no que é a especialidade dele — isso é esperado, não infle dificuldades para compensar. ESCALAS DE TEMPO (5e): uma rodada de combate dura 6 segundos; um turno de exploração de masmorra, 10 minutos; viagens contam em horas. Nunca descreva o tempo de forma incompatível com isso.`;
  };
  const infoEpico = () => {
    const ep = resumoEpico($render.personagem || $ref.personagem || {});
    return ep ? ` ESTADO ÉPICO: ${ep} — no ápice mortal o herói não sobe mais de nível; acumula XP e recebe dádivas épicas concedidas pelo sistema.` : "";
  };
  /* ONDA 2 DO CUSTO (13/10): o que o rodapé mandava a cada turno e só muda
     por campanha ou por nível — a forma do mundo, o treino das perícias, o
     que a profissão abre — sobe para o texto fixo, junto da ficha (o `fixo`
     de infoTitulo). Medido em 201 pedidos das 8.ª a 10.ª sessões: ~1,2 mil
     caracteres que não mudaram uma vez de um turno para o seguinte. Os
     PASSIVOS (somam bênção e equipamento), o traço (diz o que já foi gasto)
     e o deslocamento ficam no rodapé: mudam com o turno. */
  const fixoDaFicha = () => {
    const p = $ref.personagem || $render.personagem || {};
    const partes = [];
    try { partes.push(resumoMoldePrompt(moldeMundo())); } catch (e) { calou("a forma do mundo no fixo", e); }
    try { partes.push(resumoPericiasPrompt(p, (id) => atributoEfetivo(p, id), "treino")); } catch (e) { calou("as perícias no fixo", e); }
    try { partes.push(resumoProfissaoPrompt(p)); } catch (e) { calou("a profissão no fixo", e); }
    return partes.filter(Boolean).join("\n");
  };
  const infoTitulo = () => {
    /* usa o espelho: no carregamento do save o estado ainda não chegou */
    const p = $render.personagem || $ref.personagem || {};
    const t = tituloDoHeroi($ref.divindade, patamarFama(famaAtual()).rotulo, patamarDe(p.nivel || 1).nome);
    const base = t.divino
      ? `${t.titulo} (GD ${t.gd} — título DIVINO, conquistado por fé, não por nível)`
      : `${t.titulo} (mortal — reconhecimento do mundo; NÃO é título divino)`;
    const acao = resumoAcaoDeTurno(p.classe, p.nivel || 1);
    const vinc = infoVinculos();
    const bocas = 1 + (p.grupo || []).length;
    const ermos = resumoErmos(p.suprimentos, p.exaustao, p.ritmoViagem, bocas);
    const bonus = acoesBonusDe(p.classe, p.nivel || 1);
    /* ONDA 2 DO CUSTO: o título, os suprimentos e os vínculos mudam com o
       jogo e vão ao ESTADO (`vivo`); a economia de ação, a ação de turno e a
       progressão só mudam com o nível e vão ao texto fixo (`fixo`), em cache */
    const regras = `${ECONOMIA_ACAO_PROMPT}${bonus.length ? ` AÇÕES BÔNUS DESTA CLASSE: ${bonus.map((b) => `${b.nome} (${b.desc})`).join("; ")}.` : " Esta classe não tem ação bônus própria — usa só a ação principal."} AÇÃO DE TURNO EM COMBATE: ${acao.texto} (${perfilCombate(p.classe).nota}). ${infoRegras()}`;
    let fixo = regras;
    try { const f = fixoDaFicha(); if (f) fixo = `${regras}\n${f}`; } catch (e) { calou("o fixo da ficha", e); }
    let epico = "";
    try { epico = infoEpico(); } catch (e) { calou("o estado épico", e); }
    return { vivo: `${base}. ${ermos}${epico}${vinc ? ` ${vinc}` : ""}`, fixo };
  };
  /* FÉ COM ENDEREÇO (v8.9): ganhar fiéis é ganhar DEVOÇÃO em algum lugar.
     O local vem do acontecimento (o Mestre diz onde) ou, na falta dele, de
     onde o herói está. Sem cidade nenhuma, vira andarilho — vale menos e
     míngua mais rápido, que é exatamente o incentivo certo. */
  /* A FÉ QUE SE GANHA: a regra mora no motor (`ganhoDeFe`,
     src/motor/meio-do-turno.js, T1-A 3.ª fatia) — a fé cai no mapa, o número
     é recontado, a virada de patamar e a ascensão vão ao Mestre. Aqui só a
     fiação. O nível sai da ficha do ref: o `personagem` do render, que
     esta função lia, é `null` dentro do aplicarResposta (nasce no primeiro
     render), e todo sinal "fe:" com o deus desperto derrubava o turno. */
  const ganharFe = (fieis, pf, motivo, local) => {
    const r = ganhoDeFe({ divindade: $ref.divindade, devocao: $ref.devocao, mapa: $ref.mapa, cidadeAtual: $ref.cidadeAtual, dia: $ref.dia, nivel: ($ref.personagem || $render.personagem || {}).nivel }, fieis, pf, motivo, local);
    aplicarOsEfeitos({ estado: {}, efeitos: r.efeitos, paraOCronista: r.notas });
    return r.msgs;
  };
  /* ---------------- O ARCO CASADO COM O MOTOR (v9.28) ----------------
     O arco corria por opinião do Mestre ("historia_avancar") e o motor corria
     por fato. Os dois descolavam: o jogador ficava em "O Abismo", com o Mestre
     instruído a narrar a derrota mais escura da campanha, enquanto o motor
     mostrava um mundo onde nada tinha acontecido ainda. O Mestre inventava o
     abismo do nada, e a história saía sem saber que rumo tomar.

     Agora o arco anda por MARCO, e marco é fato do motor: missão concluída,
     relógio que encheu, evento global encerrado, nêmesis abatida. As mesmas
     coisas que o jogador já viveu. */

  /* O retrato do motor que o arco enxerga. Só refs — é chamado de dentro de
     callbacks antigos, e ler estado aqui traria o valor do primeiro render. */
  /* `sobre.eventos` (T1-A 3.ª fatia): o bloco das missões, no motor,
     encerra o evento global ANTES de o marco virar o arco — e o ref ainda
     não o sabe; o motor passa o de agora */
  const motorDoArco = (sobre = {}) => {
    const n = $ref.nemesis;
    const g = ((sobre && "eventos" in sobre ? sobre.eventos : $ref.eventos) || {}).global;
    const ms = missoesAtivas($ref.missoes);
    return { marcosPendentes: (() => { try { const pa = progressoDoAto($ref.espinha, ($ref.historia || {}).etapa || 0); return Math.max(0, pa.total - pa.feitos); } catch (e) { return undefined; } })(),
      /* nexo (11/10): o nome da nêmesis só sobe DEPOIS do rosto. Esta linha
         vai ao prompt em todo turno, e levava o nome desde o dia em que ela
         nascia — e a nêmesis agora é o antagonista da espinha (`vilaoDoFio`),
         cujo nome o fio guarda para o último ato. Antes do rosto ela já está
         na mesa como SOMBRA (`resumoVilaoPrompt`), sem nome. */
      nemesis: n && n.status !== "derrotada" && n.nome && n.conhecido ? n.nome : null,
      global: g && g.nome ? g.nome : null,
      /* nexo (11/10, contradição 7): a história principal abre as peças do
         arco, e o evento global corre ao lado dela (`resumoHistoria`). Sai
         de `impostas` para não ir duas vezes à mesma linha. */
      principal: (() => { try { return (ms.find((m) => m.tipo === "principal") || {}).titulo; } catch (e) { calou("a principal do arco", e); return undefined; } })(),
      impostas: ms.filter((m) => tipoMissao(m.tipo).forcada && m.tipo !== "principal").map((m) => `"${m.titulo}"`).slice(0, 3),
      relogios: ($ref.relogios || []).map((r) => `${r.nome} ${barraDe(r)}`).slice(0, 3),
    };
  };
  /* o RITMO sobe junto do arco: uma linha, e ela não diz o movimento nem
     o assunto — diz só a tensão, que é o que a IA precisa para escolher o
     tamanho da própria voz. Saber que se está na véspera é saber que o
     clímax vem no turno seguinte, e isso apaga a única coisa que a véspera
     existe para dar. */
  const resumoDoRitmo = () => { try { return resumoCompasso($ref.compasso); } catch { return ""; } };
  /* v9.91: o RITMO vai junto do arco, e num lugar so. `resumoDoArco` e
     passado a montarSystemPrompt em seis chamadas diferentes; acrescentar
     um parametro seria seis lugares para esquecer dele na setima. */
  const resumoDoArco = () => [resumoHistoria($ref.historia, motorDoArco()), resumoDoRitmo()].filter(Boolean).join("\n");
  /* Um acontecimento do motor empurra o arco. Se o empurrão bastar, o momento
     vira — em SILÊNCIO para o jogador: dizer "a história avança: Provações"
     entrega o que ainda vem, e ele passa a esperar o abismo em vez de vivê-lo.
     Quem recebe a virada é o Mestre, por envelope, e só como mudança de tom. */
  const marcarNoArco = (tipo, rotulo) => {
    /* a regra mora em `arcoComOMarco` (src/motor/meio-do-turno.js, T1-A 3.ª
       fatia). Sem salvar aqui de propósito: quem chamou está no meio de um
       turno e vai gravar no fim dele, e `salvar` já leva historiaRef. */
    try {
      const a = arcoComOMarco($ref.historia, tipo, rotulo, motorDoArco);
      if (!a.mudou) return;
      aplicarOsEfeitos({ estado: {}, efeitos: [{ tipo: "historia", historia: a.historia }, ...(a.remontar ? [{ tipo: "remontarPrompt" }] : [])], paraOCronista: a.notas });
    } catch { /* o arco nunca pode derrubar o turno */ }
  };
  const conferirAsMissoes = (persAtual) => {
    const p = persAtual || $ref.personagem || $render.personagem || {};
    /* ---------------- A ESPINHA CONFERE PELA MESMA PORTA (v9.129) ----------------
       Mesmo mundo, mesmo `ver()` das etapas. Dois jeitos de dizer "cumprido"
       seriam dois jeitos de discordar — e o que a espinha promete e que o
       marco cai pelo mesmo fato que faria uma missao andar. */
    {
      const mundoAgora = mundoDasMissoes(p);
      /* MM-C · C0: na ordem do ato — marco de ato posterior não fecha */
      const ce = conferirEspinha($ref.espinha, mundoAgora, (cond, m) => etapaDef(cond.tipo).ver(cond, m), { ato: ($ref.historia || {}).etapa });
      if (ce.cumpridos.length) {
        $ref.espinha = ce.espinha;
        for (const m of ce.cumpridos) {
          /* o marco empurra o ARCO pelo peso do proprio feitio: e assim que
             a espinha e a forma dramatica andam casadas em vez de cada uma
             contar a sua historia */
          marcarNoArco(feitioDe(m.feitio).peso, m.titulo); /* MM14: gravava {historia, ganhou} no lugar do arco, e cada marco cumprido reiniciava o arco */
          pushMsgs([{ autor: "sistema", texto: `✦ ${linhaDoMarco(m)}` }]);
        }
        salvar({ espinha: $ref.espinha, historia: $ref.historia });
      }
    }
    const r = conferirMissoes($ref.missoes, mundoDasMissoes(p));
    /* ---------------- A FALHA DESCRITA (v9.132) — fase 3 ----------------
       Ate aqui so o PRAZO fazia uma missao fracassar. Uma missao de resgate
       cuja pessoa morreu ficava ativa para sempre, esperando um resgate que
       nao pode mais acontecer — e o jogador nunca sabia que tinha perdido. */
    if ((r.falhadas || []).length) {
      $ref.missoes = r.missoes; setMissoes(r.missoes);
      for (const f of r.falhadas) {
        pushMsgs([{ autor: "sistema", texto: `✖ ${f.missao.titulo} — ${f.motivo}.` }]);
        $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDaGente("missaoPerdida", { titulo: f.missao.titulo, motivo: f.motivo });
      }
      salvar({ missoes: $ref.missoes });
    }
    if (!r.avancos.length) return p;
    $ref.missoes = r.missoes; setMissoes(r.missoes);
    pushMsgs(r.avancos.map((a) => ({ autor: "sistema", texto: linhaEtapa(a) })));
    for (const a of r.avancos) {
      if (a.missao.status !== "concluida") {
        $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDeAvanco(a)}`;
      }
    }
    let pers = p;
    for (const m of r.concluidas) {
      const rec = m.recompensa || recompensaDe({ tipo: m.tipo, nivel: pers.nivel || 1, etapas: m.etapas.length });
      pers = aplicarNivel({ ...pers, moedas: (pers.moedas || 0) + rec.moedas, xp: (pers.xp || 0) + rec.xp });
      const linhas = [`${tipoMissao(m.tipo).icone} MISSÃO CONCLUÍDA: ${m.titulo} — ${rec.moedas ? `+${rec.moedas} moedas · ` : "o pagamento não era em moedas · "}+${rec.xp} XP`];
      /* MM14 (30/09): a missão que veio da lista antiga (um fio do
         descanso, ou um contrato de save de antes da v9.27) paga a MESMA
         fé e o MESMO heroísmo que a lista antiga pagava — moedas e XP já
         saíram das duas linhas acima, `pagaDoFecho` não repete. */
      try {
        const pf = pagaDoFecho(m, { despertar: !!($ref.divindade && $ref.divindade.despertar) });
        if (pf.fe) linhas.push(...ganharFe(pf.fe.fieis, pf.fe.pf, "seu feito corre de boca em boca"));
        if (pf.heroismo) { const rh = ganharHeroismo(pers, pf.heroismo); pers = rh.pers; if (rh.msg) linhas.push(rh.msg); }
      } catch (e) { calou("a paga da tarefa antiga", e); }
      if (rec.item) {
        const it = gerarLoot(rec.item, { nivel: pers.nivel || 1, lex: (mundoAtual() || {}).lexico, rnd: sorteDoTurno("loot") });
        pers = { ...pers, equipamento: [...(pers.equipamento || []), it] };
        linhas.push(`✦ Recompensa: ${it.nome} (${RARIDADE_ROTULO[it.raridade] || it.raridade})`);
      }
      if (m.guilda) {
        const casa = ($ref.guildas || []).find((g) => g.id === m.guilda && g.membro);
        if (casa) {
          const d = dizimoDe(casa, rec.moedas);
          if (d > 0) { pers = { ...pers, moedas: Math.max(0, (pers.moedas || 0) - d) }; linhas.push(`◉ ${d} de dizimo para o cofre de ${casa.nome}`); }
          const rc = contribuirNaCasa({ ...casa, cofre: casa.cofre + d }, m.contribui || 0, m.titulo);
          /* a prova cumprida e o que transforma candidato em membro */
          const virou = !!(casa.emProva && m.prova);
          trocarCasa(virou ? { ...rc.guilda, emProva: false } : rc.guilda);
          if (virou) linhas.push(`✋ ${casa.nome} aceitou você — ${postoDaCasa(casa, casa.posto)} de verdade agora.`);
          if (rc.subiu) linhas.push(`⬆ ${rc.subiu.nome} em ${casa.nome} — ${rc.subiu.o}`);
        }
      }
      pushMsgs(linhas.map((t) => ({ autor: "sistema", texto: t })));
      $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDeConclusao(m, rec)}`;
      bumpCont("contratosConcluidos");
      /* v9.28: é aqui que o arco anda. Uma missão que o mundo impôs pesa três
         vezes o que pesa um favor — não pelo trabalho que deu, mas pelo tanto
         que virou a história. */
      marcarNoArco(tipoMissao(m.tipo).forcada ? "missao_forcada" : "missao", `concluí "${m.titulo}"`);
      /* o relógio de prazo morre junto com a missão que ele vigiava */
      if (m.relogioId) {
        const semRel = ($ref.relogios || []).filter((x) => x.fonte !== `missao:${m.id}`);
        if (semRel.length !== ($ref.relogios || []).length) { $ref.relogios = semRel; setRelogios(semRel); }
      }
    }
    if (pers !== p) { setPersonagem(pers); $ref.personagem = pers; }
    return pers;
  };
  /* ---------------- O MUNDO OFERECE TRABALHO (v9.37) ----------------
     O outro lado do mural, e a inversão que faltava: em vez de esperar o
     Mestre inventar um nobre desesperado e o Cronista tentar extrair etapas
     da prosa dele, o SISTEMA monta o serviço inteiro — quem pede, o que
     pede, quanto paga — e manda o Mestre encenar a abordagem.

     Ele vem da base do mundo, então a pessoa existe, mora em algum lugar
     desta cidade e tem uma vontade própria desde a criação da campanha. A
     preferência é por quem o herói JÁ conhece: um rosto conhecido pedindo
     ajuda vale mais que um estranho, e poupa o Mestre de apresentar gente
     nova a cada duas cenas.

     Conservador de propósito: fora de combate, fora de masmorra, no máximo
     um por dia e só quando o diário está com espaço. Trabalho oferecido
     demais vira ruído, e ruído é o oposto de uma oferta que importa. */
  /* MM18 (11/10): A HISTÓRIA NÃO SE OFERECE. A preferência por quem o herói
     já conhece punha no mural, no começo, justamente a gente da história —
     o alvo da principal pregou "A caçada de Noé Laminado" (4.ª sessão).
     Quem é da história (a pista, o alvo, quem as missões que não se
     recusam e os marcos por fazer nomeiam) fica fora do mural e da
     proposta do Mestre. E o papel pregado vence (`CARTAZ_ESPERA`). */
  const historiaDoMural = () => {
    try { return genteDaHistoria({ abertura: $ref.abertura, missoes: $ref.missoes, espinha: $ref.espinha, grupo: ($ref.personagem || $render.personagem || {}).grupo || [] }); }
    catch (e) { calou("a gente da história", e); return []; }
  };
  const oferecerTrabalhoDaqui = () => {
    /* MM13: nenhuma oferta avulsa antes de o herói estar orientado. */
    if (!muralLiberado({ abertura: $ref.abertura, missoes: $ref.missoes })) return;
    if ($ref.combate || $ref.masmorra) return;
    if (!$ref.cidadeAtual) return;
    if ($ref.ultimoTrabalhoDia >= $ref.dia) return;
    const abertas = garantirMissoes($ref.missoes).filter((q) => ["ativa", "oferecida"].includes(q.status));
    if (abertas.length >= 3) return;
    const p = $ref.personagem || $render.personagem || {};
    const candidatas = ofertasDaqui({
      semente: sementeMundo(), mapa: $ref.mapa, cidade: $ref.cidadeAtual,
      base: $ref.baseMundo, genero: generoMundo(), nivel: p.nivel || 1, quantas: 6,
      molde: moldeMundo(), lex: (mundoAtual() || {}).lexico,
      evitar: abertas.flatMap((q) => [q.titulo, q.dador]),
      historia: historiaDoMural(),
    });
    if (!candidatas.length) return;
    const conhecidos = new Set(Object.keys($ref.npcs || {}).map((n) => n.toLowerCase()));
    const of = candidatas.find((c) => conhecidos.has(String(c.dador).toLowerCase())) || candidatas[0];
    /* v9.119: O TRABALHO VAI PARA O MURAL, NÃO PARA O DIÁRIO. Antes ele
       virava missão "oferecida" ali mesmo, com duas linhas no log e um
       aceita/recusa no diário — uma segunda fonte de missões, opcional,
       disputando as mesmas vagas com a trama da história, que não é
       opcional. Agora quem quer o herói num serviço prega o papel e
       menciona; o herói vai ao mural se quiser. */
    if (!pregarNoMural({ ...of, oferecido: true })) return;
    $ref.ultimoTrabalhoDia = $ref.dia;
    /* o aviso espera a cena: quem o solta é `aplicarResposta`, depois da
       narração em que o Mestre encena a menção. Uma linha, e só: o log é a
       cena, e o cartaz já diz o resto quando o jogador abrir o mural. */
    $ref.trabalhoPendente = [`📋 ${of.dador} tem um trabalho no mural.`];
    $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDoRecado(of)}`;
  };
  const guardarCasas = (lista) => {
    $ref.guildas = lista; setGuildasMundo(lista);
    salvar({ guildas: lista });
  };
  const trocarCasa = (nova) => guardarCasas(($ref.guildas || []).map((g) => (g.id === nova.id ? nova : g)));
  /* Prega um cartaz no mural. Uma porta só, para o trabalho que o sistema
     sorteia e o que a ficção inventa nunca discordarem sobre a forma nem
     sobre quando o papel já está lá. */
  const pregarNoMural = (cartaz) => {
    if (!cartaz || !cartaz.titulo) return false;
    const chave = (c) => `${semNome(c.dador || "")}|${semNome(c.titulo || "")}`;
    const atual = $ref.mural || [];
    if (atual.some((c) => chave(c) === chave(cartaz))) return false;
    /* ---------------- UMA PESSOA, UM TRABALHO (achado na tela) ----------------
       Zulmira do Sino apareceu DUAS vezes no mural no mesmo turno: uma pelo
       trabalho que o sistema escolheu pregar por ela (🏹) e outra pelo que o
       Mestre relatou da própria cena (📋). Títulos diferentes, mesma pessoa,
       mesmo serviço — e duas linhas iguais no log.

       A regra que resolve isso não é nova: `ofertas.js` a escreve desde a
       v9.37 na terceira decisão dele, "cada pessoa tem UM trabalho, para
       sempre". Faltava valer também para o que a ficção prega. */
    if (cartaz.dador && atual.some((c) => c.oferecido && semNome(c.dador || "") === semNome(cartaz.dador))) return false;
    /* o que já está no diário não volta ao mural: seria oferecer de novo o
       serviço que o herói já pegou */
    const jaNoDiario = garantirMissoes($ref.missoes)
      .filter((q) => ["ativa", "oferecida", "concluida"].includes(q.status))
      .some((q) => semNome(q.titulo) === semNome(cartaz.titulo));
    if (jaNoDiario) return false;
    /* A1 · B4 (10/10): QUEM JÁ TEM TRABALHO COMIGO NÃO PREGA OUTRO. O título
       muda de um turno para o outro ("O que há no Oratório" / "Encontrar a
       guarda do portão") e a régua acima, que compara títulos, deixava
       passar — no ANTES (T7) o mural anunciou o trabalho que eu tinha
       aceite no turno anterior. É a lei de `ofertas.js` ("cada pessoa tem
       UM trabalho"), que até aqui valia só para o que estava no mural e não
       para o que já estava na mão. */
    try {
      const comigo = !!cartaz.dador && garantirMissoes($ref.missoes)
        .some((q) => q && q.status === "ativa" && q.dador && semNome(q.dador) === semNome(cartaz.dador));
      if (comigo) return false;
    } catch (e) { calou("o mural e quem já trabalha comigo", e); }
    const doMundo = atual.filter((c) => !c.oferecido);
    /* MM18: o papel nasce com data — vence ao fim de CARTAZ_ESPERA */
    const oferecidos = [...atual.filter((c) => c.oferecido), { ...cartaz, pregadoEm: cartaz.pregadoEm != null ? cartaz.pregadoEm : $ref.dia }].slice(-TETO_OFERECIDOS);
    $ref.mural = [...doMundo, ...oferecidos];
    setMural($ref.mural);
    return true;
  };
  /* ---------------- CONQUISTAS E VÍNCULOS (100% por código, zero tokens) ---------------- */
  /* T1-A, 6.ª fatia: a conta mora em `somarAoContador` (src/motor/combate-do-turno.js) */
  const bumpCont = (campo, n = 1) => { $ref.contadores = somarAoContador($ref.contadores, campo, n); };
  /* ---------------- o que o render calculava ---------------- */
  /* ---------------- MURAL DE CONTRATOS (v9.37 · o mundo é que oferece) ----------------
     O mural deixou de ser uma tabela de sorteio e virou uma JANELA: os
     cartazes são os trabalhos que a gente desta cidade já queria ver feitos,
     lidos direto da base do mundo. Cada pessoa tem um serviço, sempre o
     mesmo, e o cartaz é só o papel onde ele foi parar. */
  /* Quantos cartazes de gente que falou com o herói o mural guarda. Eles
     sobrevivem à renovação — foram pregados POR ALGUÉM, não sorteados —,
     e sem teto a pilha cresceria para sempre. */
  const TETO_OFERECIDOS = 6;
  /* a porta que o Cronista chama com a conversa ou o segredo do turno: o
     literal de `portasDoCronista` do App, à letra */
  const conferirCom = ((pc, o) => {
      const ref = o && o.segredos ? $umRef("segredosRevelados") : $umRef("falouCom");
      ref.current = (o && (o.segredos || o.falouCom)) || [];
      try { return conferirAsMissoes(pc) || pc; } finally { ref.current = []; }
    });

  /* cada órgão corre dentro da sorte do turno (`portas.sorte`; sem ela, a
     da casa, como no App) e descarrega no fim — também quando estoura */
  const envolver = (f) => (...args) => { try { return comSorte($P.sorte, () => f(...args)); } finally { descarregar(); } };
  return { oferecerTrabalhoDaqui: envolver(oferecerTrabalhoDaqui), pregarNoMural: envolver(pregarNoMural), conferirAsMissoes: envolver(conferirAsMissoes), ganharFe: envolver(ganharFe), marcarNoArco: envolver(marcarNoArco), conferirCom: envolver(conferirCom), escritas, relidos, descarregar };
}
