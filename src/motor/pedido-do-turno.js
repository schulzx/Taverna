/* ============================================================
   O PEDIDO DO TURNO, NO MOTOR (Fase 4, trilha B, 29/10/2026) — src/motor/pedido-do-turno.js

   O segundo passo da ordem do inventário (14bde83, mente/diario.md) para o
   `/api/turno`. A pauta já era peça (pauta-do-turno.js, bb7ab7a); o rodapé
   já era motor (`oRodapeDoTurno`, envelopes-do-turno.js). Faltava o que os
   junta: o trecho de `enviar` que vai da pauta ao system — a nota do turno,
   os fios novos que a estrada segura, a escuta que corta e anda, os sinais
   do turno, as pessoas pela relevância, o rodapé com as suas trinta peças, o
   histórico com a frase do jogador por último, e o `montarSystemPrompt` —,
   mais a arrumação que `chamarMestre` faz antes da rede (a janela ancorada e
   a ordem do cache). Com esta peça, o pedido ao Narrador monta-se em Node a
   partir do estado e do que o turno escreveu antes dele.

   Vem À LETRA, como a pauta: o trecho e as 35 funções do componente que ele
   chama (o fecho, pela árvore do @babel/parser), com as mesmas trocas
   mecânicas — `xRef.current` → `$ref.<campo>`, o estado React → `$render`,
   o que escreve na tela é porta (`pushMsgs`, `setNpcs`, `calou`), o recuo
   do gênero é o padrão do cenário — e mais duas: o `useCallback(f, deps)`
   do App é só `f` (aqui não há render), e a `pautaDoTurno` é a peça dela,
   corrida sobre o estado de agora, com o que ela escreve a entrar pelo
   mesmo `aplicar`.

   A ENTRADA é o que `enviar` escreveu antes do trecho e o trecho lê
   (`ENTRADA_DO_PEDIDO`): a frase, a ficha deste clique, o histórico-base, a
   oficina, o compasso, a forma da cena, a frente, a virada, a trama e o
   pedido da escuta. No servidor, quem as produz é o `turno()` inteiro.

   O ESTADO NÃO SE MUTA: `$ref` lê do estado e escreve num registo à parte
   (`escritas`), que chega ao App por `portas.aplicar` antes de cada porta
   que lhe dá a palavra, e no fim — também quando estoura.

   A prova é testes/teste-motor-pedido-do-turno.mjs: o recorte do App de
   HEAD (pedido-dourado.json) e esta peça sobre os 275 casos, o pedido que
   vai à rede byte a byte.
   ============================================================ */

import { garantirAbertura } from "../abertura.js";
import { resumoArredoresPrompt } from "../arredores.js";
import { resumoRitoPrompt } from "../ascensao.js";
import { AMANHECER, dataTxt, ehNoite, estacaoDe, horaTxt } from "../calendario.js";
import { celulaDaCidade, celulaDaJornada, resumoCelulaPrompt } from "../celulas.js";
import { elencoDaCena, resumoCenaPrompt } from "../cena.js";
import { cenarioAtivo } from "../cenario.js";
import { RAIO_EXAME, criarChao, envelopeDoQueFicou, pertoDaqui } from "../chao.js";
import { ranksDoPersonagem } from "../classes.js";
import { ECONOMIA_ACAO_PROMPT, acoesBonusDe, patamarDe, perfilCombate, resumoAcaoDeTurno } from "../combate.js";
import { resumoCombosPrompt } from "../combos.js";
import { podePagar } from "../comercio.js";
import { comodosDoLocal, resumoComodosPrompt } from "../comodos.js";
import { resumoGrupoPrompt } from "../companheiros.js";
import { garantirCompasso, resumoCompasso } from "../compasso.js";
import { resumoCondicoesPrompt } from "../condicoes.js";
import { CONTADORES_INICIAIS } from "../conquistas.js";
import { ATRIBUTOS } from "../constantes.js";
import { comoComponente } from "../craft.js";
import { fatorDePreco, garantirLei } from "../crime.js";
import { dobraMovimento, resumoDadivasPrompt } from "../dadivas.js";
import { resumoDescansoPrompt } from "../descanso.js";
import { DEVOCAO_PROMPT, resumoFePrompt } from "../devocao.js";
import { CAMINHOS_PROMPT, DIVINDADE_PROMPT, garantirDivindade, resumoAscensao, tituloDe, tituloDoHeroi } from "../divindades.js";
import { fatorDaOficina } from "../dominios.js";
import { elencoDoMundo, elencoParaPovoar, garantirElencoDoSave } from "../elenco.js";
import { resumoErmos } from "../ermos.js";
import { quemMeVe } from "../escondido.js";
import { escutarOTurno, fechoDoPedido, fioDaHistoria, garantirEscuta, separarEnvelopes } from "../escuta.js";
import { calcularFama, patamarFama } from "../fama.js";
import { fiosNovosNaEstrada } from "../fios-da-estrada.js";
import { gatilhosDe } from "../gatilhos.js";
import { regioesDoMapa, saidasDeUmPassoPrompt } from "../geografia.js";
import { dominiosDe } from "../gestao.js";
import { resumoGridPrompt } from "../grid.js";
import { ehMagiaDoGrimorio, resumoGrimorioPrompt } from "../grimorio.js";
import { temRegraPropria } from "../habilidades.js";
import { resumoHeroismoPrompt } from "../heroismo.js";
import { garantirHistoria, resumoHistoria, resumoQuests } from "../historia.js";
import { jaMeViuAntes } from "../interprete.js";
import { invocacaoDe, invocacoesDe, resumoInvocacoesPrompt } from "../invocacoes.js";
import { resumoProficienciaPrompt } from "../itens.js";
import { janelaAncorada } from "../janela.js";
import { resumoLegadoPrompt } from "../legado.js";
import { linhaDeLugar, resumoLugarPrompt, umSoLugar } from "../lugar.js";
import { luzDaLuta } from "../luz.js";
import { resumoMagiasPrompt, temCaderno } from "../magias.js";
import { resumoDiplomacia, resumoMapaParaPrompt } from "../mapa.js";
import { aquiDoTurno, calaNaMasmorra, cenaNaMasmorra } from "../masmorra-sem-cidade.js";
import { mapasAVenda, mercadoresDaCidade, resumoMercadoPrompt } from "../mercado.js";
import { ativas as missoesAtivas, resumoMissoesPrompt, tipoDef as tipoMissao } from "../missoes.js";
import { MOLDE_PADRAO, moldePorId, resumoMoldePrompt } from "../moldes.js";
import { aEscutaAnda } from "./antes-do-mestre.js";
import { aFormaDaqui, oRodapeDoTurno } from "./envelopes-do-turno.js";
import { aCidadeSobOsPes } from "./tempo-do-turno.js";
import { resumoDeslocamentoPrompt } from "../movimento.js";
import { chefesDoMundo, garantirBase, locaisDaCidade, oQueExisteAqui, resumoChefesPrompt, resumoDaqui } from "../mundo-base.js";
import { afrouxarLaco, criarNPC, firmarLaco, garantirLaco, resumoNPCsParaPrompt, romperLaco } from "../npcs.js";
import { garantirCoracaoDoSave, nucleoDaCampanha } from "../nucleo.js";
import { cederNaCena, porNaPauta, textoDaPauta } from "../pauta.js";
import { oBoatoDaChegada, oBoatoQueChegou, oVetoDoBoato } from "../boatos.js";
import { resumoPericiasPrompt } from "../pericias.js";
import { precoDeCompraPara, resumoProfissaoPrompt } from "../profissoes.js";
import { garantirLivro, pagar, regar, semear } from "../promessas.js";
import { garantirPrometido } from "../prometido.js";
import { SINAIS_ABERTOS, emJogoNoTurno, linhasJaDitas, montarSystemPrompt, pedidoNaOrdemDoCache } from "../prompt.js";
import { resumoReacoesPrompt } from "../reacoes.js";
import { atributoEfetivo } from "../regras-jogo.js";
import { bonusProficiencia, ehProficiente, resumoEpico } from "../regras.js";
import { genteParaPovoarAqui, relevanciaDoTurno } from "../relevancia.js";
import { barraDe, resumoRelogiosPrompt } from "../relogios.js";
import { garantirEspinha, progressoDoAto } from "../saga.js";
import { LUGARES, ocupados as ocupadosDaSala } from "../sala.js";
import { resumoSintoniaPrompt } from "../sintonia.js";
import { sementesDoElo, subtramasDoNucleo } from "../subtramas.js";
import { resumoTracosPrompt } from "../tracos.js";
import { linhaDaViagem, pausarViagem, resumoViagemPrompt, trechoAtual } from "../viagem.js";
import { resumoVilaoPrompt } from "../vilao.js";
import { VINCULO_INICIAL, linhaDoVinculo } from "../vinculos.js";
import { comSorte } from "../semente.js";
import { aPautaDoTurno, oEstadoDaPauta } from "./pauta-do-turno.js";

/* OS REFS QUE A MONTAGEM TOCA — um por campo, como na pauta: o nome do ref no
   App, se o save o guarda (o campo é o do save; senão é o do ref), se a
   montagem o escreve, e o valor de partida (o mesmo `useRef(...)` do App). */
export const REFS_DO_PEDIDO = Object.freeze({
  abertura: Object.freeze({ ref: "aberturaMundoRef", salvo: true, escreve: false, padrao: () => (garantirAbertura(null)) }),
  acampado: Object.freeze({ ref: "acampadoRef", salvo: true, escreve: false, padrao: () => (false) }),
  adiadosEscuta: Object.freeze({ ref: "adiadosEscutaRef", salvo: false, escreve: true, padrao: () => ([]) }),
  atoDoTurno: Object.freeze({ ref: "atoDoTurnoRef", salvo: false, escreve: false, padrao: () => ("nada") }),
  bancoNomes: Object.freeze({ ref: "bancoNomesRef", salvo: false, escreve: false, padrao: () => (null) }),
  baseMundo: Object.freeze({ ref: "baseMundoRef", salvo: true, escreve: false, padrao: () => (garantirBase(null)) }),
  /* escreve desde 29/10: o boato que se confirma (boatos.js) troca a entrada do cânone quando a linha dele chega ao texto */
  canone: Object.freeze({ ref: "canoneRef", salvo: true, escreve: true, padrao: () => ({}) }),
  chao: Object.freeze({ ref: "chaoRef", salvo: true, escreve: false, padrao: () => (criarChao()) }),
  cidadeAtual: Object.freeze({ ref: "cidadeAtualRef", salvo: true, escreve: false, padrao: () => ("") }),
  clima: Object.freeze({ ref: "climaRef", salvo: true, escreve: false, padrao: () => (null) }),
  cobrouAgora: Object.freeze({ ref: "cobrouAgoraRef", salvo: false, escreve: false, padrao: () => (false) }),
  combate: Object.freeze({ ref: "combateRef", salvo: true, escreve: false, padrao: () => (null) }),
  compasso: Object.freeze({ ref: "compassoRef", salvo: true, escreve: false, padrao: () => (garantirCompasso(null)) }),
  confidencias: Object.freeze({ ref: "confidenciasRef", salvo: true, escreve: false, padrao: () => ([]) }),
  contadores: Object.freeze({ ref: "contRef", salvo: true, escreve: false, padrao: () => ({ ...CONTADORES_INICIAIS }) }),
  coracao: Object.freeze({ ref: "coracaoRef", salvo: true, escreve: true, padrao: () => (garantirCoracaoDoSave(null)) }),
  coracaoPendente: Object.freeze({ ref: "coracaoPendenteRef", salvo: false, escreve: true, padrao: () => (null) }),
  coracaoRitmo: Object.freeze({ ref: "coracaoRitmoRef", salvo: false, escreve: true, padrao: () => ({ ultimas: {} }) }),
  devocao: Object.freeze({ ref: "devocaoRef", salvo: true, escreve: false, padrao: () => ({ cidades: {}, andarilhos: 0 }) }),
  dia: Object.freeze({ ref: "diaRef", salvo: true, escreve: false, padrao: () => (1) }),
  divindade: Object.freeze({ ref: "divindadeRef", salvo: true, escreve: false, padrao: () => (garantirDivindade(null)) }),
  elenco: Object.freeze({ ref: "elencoSaveRef", salvo: true, escreve: false, padrao: () => (garantirElencoDoSave(null)) }),
  elencoCache: Object.freeze({ ref: "elencoCacheRef", salvo: false, escreve: true, padrao: () => (null) }),
  escuta: Object.freeze({ ref: "escutaRef", salvo: true, escreve: true, padrao: () => (garantirEscuta(null)) }),
  espinha: Object.freeze({ ref: "espinhaRef", salvo: true, escreve: false, padrao: () => (garantirEspinha(null)) }),
  eventos: Object.freeze({ ref: "eventosRef", salvo: true, escreve: false, padrao: () => ({ locais: [], global: null, semGlobalDesde: 0, seq: 1 }) }),
  faccaoJogador: Object.freeze({ ref: "faccaoJogadorRef", salvo: true, escreve: false, padrao: () => ("") }),
  genteDaqui: Object.freeze({ ref: "genteDaquiRef", salvo: false, escreve: true, padrao: () => ([]) }),
  genteNaPauta: Object.freeze({ ref: "genteNaPautaRef", salvo: false, escreve: true, padrao: () => (null) }),
  governos: Object.freeze({ ref: "governosRef", salvo: true, escreve: false, padrao: () => ({}) }),
  guildas: Object.freeze({ ref: "guildasRef", salvo: true, escreve: false, padrao: () => ([]) }),
  historia: Object.freeze({ ref: "historiaRef", salvo: true, escreve: false, padrao: () => (garantirHistoria({ estrutura: "jornada", etapa: 0 })) }),
  jornada: Object.freeze({ ref: "jornadaRef", salvo: true, escreve: false, padrao: () => (null) }),
  lei: Object.freeze({ ref: "leiRef", salvo: true, escreve: false, padrao: () => (garantirLei(null)) }),
  lugar: Object.freeze({ ref: "lugarRef", salvo: true, escreve: false, padrao: () => (null) }),
  mapa: Object.freeze({ ref: "mapaRef", salvo: true, escreve: false, padrao: () => ({ cidades: [], faccoes: [] }) }),
  masmorra: Object.freeze({ ref: "masmorraRef", salvo: true, escreve: false, padrao: () => (null) }),
  mensagens: Object.freeze({ ref: "mensagensRef", salvo: true, escreve: false, padrao: () => ([]) }),
  mercado: Object.freeze({ ref: "mercadoRef", salvo: true, escreve: false, padrao: () => ({ comprados: {}, ambulante: null, pressoes: {}, gastos: {}, pechinchas: {} }) }),
  minuto: Object.freeze({ ref: "minutoRef", salvo: true, escreve: false, padrao: () => (AMANHECER + 60) }),
  missoes: Object.freeze({ ref: "missoesRef", salvo: true, escreve: false, padrao: () => ([]) }),
  mundo: Object.freeze({ ref: "mundoRef", salvo: false, escreve: false, padrao: () => (null) }),
  nemesis: Object.freeze({ ref: "nemesisRef", salvo: true, escreve: false, padrao: () => (null) }),
  nomeCampanha: Object.freeze({ ref: "nomeCampanhaRef", salvo: false, escreve: false, padrao: () => ("") }),
  nomesOferecidos: Object.freeze({ ref: "nomesOferecidosRef", salvo: false, escreve: true, padrao: () => ([]) }),
  nomesPendentes: Object.freeze({ ref: "nomesPendentesRef", salvo: false, escreve: true, padrao: () => (null) }),
  nota: Object.freeze({ ref: "notaRef", salvo: false, escreve: true, padrao: () => ("") }),
  npcs: Object.freeze({ ref: "npcsRef", salvo: true, escreve: true, padrao: () => ({}) }),
  npcTurno: Object.freeze({ ref: "npcTurnoRef", salvo: false, escreve: false, padrao: () => (0) }),
  nucleoCache: Object.freeze({ ref: "nucleoCacheRef", salvo: false, escreve: true, padrao: () => (null) }),
  personagem: Object.freeze({ ref: "personagemRef", salvo: false, escreve: false, padrao: () => (null) }),
  promessas: Object.freeze({ ref: "promessasRef", salvo: true, escreve: true, padrao: () => (garantirLivro(null)) }),
  prometido: Object.freeze({ ref: "prometidoRef", salvo: true, escreve: false, padrao: () => (garantirPrometido(null)) }),
  quemE: Object.freeze({ ref: "quemERef", salvo: false, escreve: true, padrao: () => ({ ultimas: {}, cenas: {} }) }),
  quests: Object.freeze({ ref: "questsRef", salvo: true, escreve: false, padrao: () => ([]) }),
  raid: Object.freeze({ ref: "raidRef", salvo: true, escreve: false, padrao: () => (null) }),
  relevancia: Object.freeze({ ref: "relevanciaRef", salvo: false, escreve: true, padrao: () => (null) }),
  relogios: Object.freeze({ ref: "relogiosRef", salvo: true, escreve: false, padrao: () => ([]) }),
  reviravolta: Object.freeze({ ref: "reviravoltaRef", salvo: true, escreve: false, padrao: () => (null) }),
  sala: Object.freeze({ ref: "salaRef", salvo: false, escreve: false, padrao: () => (null) }),
  sinaisDoTurno: Object.freeze({ ref: "sinaisDoTurnoRef", salvo: false, escreve: true, padrao: () => (SINAIS_ABERTOS) }),
  subtramasCache: Object.freeze({ ref: "subtramasCacheRef", salvo: false, escreve: true, padrao: () => (null) }),
  system: Object.freeze({ ref: "systemRef", salvo: false, escreve: true, padrao: () => ("") }),
  tomando: Object.freeze({ ref: "tomandoRef", salvo: true, escreve: false, padrao: () => (null) }),
  turnoDeRegistro: Object.freeze({ ref: "turnoDeRegistroRef", salvo: false, escreve: false, padrao: () => (0) }),
});

/* O ESTADO REACT QUE A MONTAGEM LÊ: o do último render, em `estado.render`;
   sem ele, o do estado. */
export const RENDER_DO_PEDIDO = Object.freeze(["governos","historico","mercado","mundo","nomeCampanha","personagem"]);


/* O QUE O TURNO ESCREVEU ANTES E A MONTAGEM LÊ: os nomes de `enviar` que
   chegam em `entrada` (a frase é `entrada.frase`). É a lista do que o
   `turno()` inteiro terá de produzir no servidor antes de chamar a peça. */
export const ENTRADA_DO_PEDIDO = Object.freeze(["frase","daFrente","daTrama","daVirada","doCompasso","fioEsc","formaDaCena","histBase","oficina","pedidoEsc","persAtual"]);

/* O PEDIDO À REDE: o que `chamarMestre` passa a `chamarModelo` (o teto de
   3600 é de rede, não de meta: com 2600 o JSON truncava). */
export const PEDIDO_AO_NARRADOR = Object.freeze({ maxTokens: 3600, formato: "json", tarefa: "narrador", comCache: true });

/* O ESTADO QUE O APP DÁ AO PEDIDO (trilha A, 29/10) — o da pauta e mais o do
   pedido. A peça do pedido entrega o estado à da pauta, logo leva os campos
   das duas tabelas (REFS_DA_PAUTA e REFS_DO_PEDIDO), cada um lido do ref do
   nome dele (`refs` é o dicionário { nomeDoRef: { current } } do App).

   Do render passam só os seis do React (RENDER_DO_PEDIDO, que contém os cinco
   da pauta). A banca da praça (`cidadeMercado`, `mercadoAqui`) NÃO passa,
   pelo motivo de `oEstadoDaPauta`: a do render é a do último desenho da
   tela, e um turno que muda de cidade antes do pedido vendia a praça de antes
   — na pauta e no MERCADO do rodapé, que a lia direto do render. Sem ela, a
   peça refá-la do estado do instante, que é o que o recorte do App provado
   em pedido-dourado.json sempre fez. */
export function oEstadoDoPedido(refs, render) {
  const R = refs && typeof refs === "object" ? refs : {};
  const V = render && typeof render === "object" ? render : {};
  const e = oEstadoDaPauta(R, V);
  for (const [c, r] of Object.entries(REFS_DO_PEDIDO)) if (!(c in e)) e[c] = R[r.ref] && typeof R[r.ref] === "object" ? R[r.ref].current : undefined;
  for (const n of RENDER_DO_PEDIDO) if (Object.prototype.hasOwnProperty.call(V, n)) e.render[n] = V[n];
  return e;
}

/* ---------------- o que é do módulo do App, à letra ---------------- */


/* ============================================================
   O PEDIDO DO TURNO
   oPedidoDoTurno(estado, entrada, portas) → { pedido, saida, escritas }
   ============================================================ */
export function oPedidoDoTurno(estado, entrada, portas) {
  const $E = estado && typeof estado === "object" ? estado : {};
  const $P = portas && typeof portas === "object" ? portas : {};
  const $in = entrada && typeof entrada === "object" ? entrada : {};
  const $render0 = $E.render && typeof $E.render === "object" ? $E.render : {};
  const escritas = {};
  let pendentes = {};
  const partida = {};
  const lerCampo = (c) => {
    if (Object.prototype.hasOwnProperty.call(escritas, c)) return escritas[c];
    if ($E[c] !== undefined) return $E[c];
    if (!REFS_DO_PEDIDO[c]) return undefined;
    if (!(c in partida)) partida[c] = REFS_DO_PEDIDO[c].padrao();
    return partida[c];
  };
  const $ref = new Proxy({}, {
    get: (_, c) => (typeof c === "string" ? lerCampo(c) : undefined),
    set: (_, c, v) => { escritas[c] = v; pendentes[c] = v; return true; },
  });
  /* o valor de partida de cada estado React (o argumento do useState do
     App, que pode ler um ref): é o que o render tem quando nem ele nem o
     estado o trazem */
  const $partidaDoRender = {
    governos: () => ({}),
    historico: () => ([]),
    mercado: () => ($ref.mercado),
    mundo: () => (null),
    nomeCampanha: () => (""),
    personagem: () => (null),
  };
  const $render = {};
  for (const n of RENDER_DO_PEDIDO) {
    const v = Object.prototype.hasOwnProperty.call($render0, n) ? $render0[n] : $E[n];
    $render[n] = v !== undefined ? v : $partidaDoRender[n]();
  }
  const descarregar = () => {
    const x = pendentes;
    pendentes = {};
    if (Object.keys(x).length && typeof $P.aplicar === "function") $P.aplicar(x);
  };
  /* AS PORTAS, as da pauta e mais a do elenco (`setNpcs`, que o coração
     chama). Antes de o App ter a palavra, recebe o que já se escreveu. */
  const calou = (onde, e) => { try { if (typeof $P.calou === "function") $P.calou(onde, e); } catch { /* o calou nunca custa o turno */ } return []; };
  const pushMsgs = (novas) => { descarregar(); if (typeof $P.pushMsgs === "function") $P.pushMsgs(novas); };
  const setNpcs = (v) => { descarregar(); if (typeof $P.setNpcs === "function") $P.setNpcs(v); };
  /* A PAUTA é a peça dela (pauta-do-turno.js), sobre o estado de agora: o
     que ela escreve chega aqui e ao App pelo mesmo `aplicar`. */
  const pautaDoTurno = (acao) => {
    descarregar();
    const r = aPautaDoTurno({ ...$E, ...escritas, render: $render0 }, { frase: acao }, {
      calou: $P.calou, pushMsgs: $P.pushMsgs, setPersonagem: $P.setPersonagem,
      aplicar: (x) => { Object.assign(escritas, x); if (typeof $P.aplicar === "function") $P.aplicar(x); },
    });
    return r.pauta;
  };

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
  /* ---------------- O BOATO DA CHEGADA (29/10, trilha B) ----------------
     O herói chegou ao sítio de que se falava: boatos.js decide, por semente,
     se era verdade, meia-verdade ou mentira, e a linha vai à secção O BOATO
     da pauta (que cede na pergunta: numa pergunta, responde-se, e o boato
     espera). O que ele revelou fica à espera em `boatoDoTurno` (do turno,
     não do App nem do save): o cânone e
     o registo só mudam se a linha chegou ao texto que vai ao Narrador
     (`oBoatoQueChegou`, logo a seguir à pauta) — cortada pelo teto, o
     boato fica como estava e volta no turno seguinte. Antes da chegada,
     nada: nem a pauta nem o pedido levam o veredito. */
  let boatoDoTurno = null;
  /* E O VETO ANTES DELA (a 13.ª, 29/10): sem revelação neste turno, se a
     frase ou a cena tocam um boato que o herói conhece, o Mestre não o decide
     (boatos.js#oVetoDoBoato, uma linha no NÃO PODE). */
  const comOBoato = (p, frase) => {
    boatoDoTurno = null;
    try {
      const eb = {
        canone: $ref.canone, npcs: $ref.npcs, cidadeAtual: $ref.cidadeAtual, lugar: $ref.lugar, masmorra: $ref.masmorra, mapa: $ref.mapa,
        combate: $ref.combate, jornada: $ref.jornada, dia: $ref.dia, mensagens: $ref.mensagens, heroi: (fichaViva() || {}).nome,
      };
      const r = oBoatoDaChegada(eb, null, sementeMundo());
      if (!r.linhaDaPauta) {
        const veto = oVetoDoBoato(eb, frase, sementeMundo());
        return veto ? porNaPauta(p, "naoPode", veto) : p;
      }
      boatoDoTurno = r;
      return cederNaCena(porNaPauta(p, "boato", r.linhaDaPauta), {});
    } catch (e) { calou("o boato da chegada", e); return p; }
  };
  /* 06/10 (a luz e a sombra): as tochas que há para acender — as da
     masmorra lá dentro, as da mochila cá fora — e o mapa de luz da luta,
     refeito a cada pergunta dos mesmos refs (nunca vai ao save; o que vai é
     `combate.tochaDoHeroi`, campo novo e opcional). Null fora da luta, e
     null se estourar: o veredito volta à regra de antes. */
  const tochasAgora = () => {
    const mm = $ref.masmorra;
    if (mm && !mm.encerrada) return Math.max(0, Number(mm.tochas) || 0);
    return Math.max(0, Number(((fichaViva() || {}).suprimentos || {}).tochas) || 0);
  };
  const luzDaLutaAgora = (comb) => {
    try {
      const c = comb || $ref.combate;
      if (!c) return null;
      const mm = $ref.masmorra;
      return luzDaLuta({
        grade: c.grade, heroi: c.heroi, aliados: c.aliados || [], inimigos: c.inimigos || [],
        tochaDoHeroi: c.tochaDoHeroi, tochas: tochasAgora(), emMasmorra: !!(mm && !mm.encerrada),
        noite: ehNoite($ref.minuto), clima: ($ref.clima && $ref.clima.rotulo) || "",
        pers: fichaViva(),
      });
    } catch (e) { calou("a luz da luta", e); return null; }
  };
  /* v9.22: `mundoAtual()` e `nomeCampanhaRef` existem porque VÁRIOS callbacks
     desta casa são useCallback de deps estreitas, criados no primeiro render —
     quando mundo é null e o nome da campanha é "". Ler o estado direto lá
     dentro devolve esses valores de nascimento para sempre. Aqui a
     consequência era silenciosa e por isso pior: o system prompt era
     remontado com campanha sem nome e mundo vazio toda vez que o cânone ou o
     registro de pessoas mudava, e o Mestre perdia contexto sem ninguém ver. */
  const mundoAtual = () => $ref.mundo || $render.mundo || null;
  const sementeMundo = () => `${$ref.nomeCampanha || $render.nomeCampanha || "aventura"}|${(mundoAtual() && mundoAtual().genero) || ""}`;
  /* MM8c-2: o contexto e os nomes do elenco desta campanha — a gente que
     PESA na narração (resumoCenaPrompt, resumoNPCsParaPrompt, o cânone),
     não a lista para povoar (essa é `elencoParaPovoar`, mais abaixo). */
  const contextoDoElenco = () => ({ genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, espinha: $ref.espinha, guildas: $ref.guildas, base: $ref.baseMundo, estado: $ref.elenco, npcs: $ref.npcs });
  /* MM-C C1: o núcleo desta campanha, memorizado pelo que o muda — o mesmo
     critério do cache do elenco (identidade dos refs) mais o companheiro,
     o antecedente e a reviravolta eleita. Recalcular a cada turno daria o
     mesmo núcleo pelo dobro do preço. */
  const nucleoAgora = () => {
    const pers = $ref.personagem || $render.personagem || {};
    const semente = sementeMundo(), mapa = $ref.mapa, ctx = contextoDoElenco();
    const comp = (pers.grupo || []).find((g) => g && g.nome && !g.invocada) || {};
    const rv = $ref.reviravolta || null;
    const chave = [comp.nome || "", comp.conceito || "", comp.ligacao || "", pers.antecedente || "", (rv && rv.forma) || "", (rv && rv.alvo) || ""].join("|");
    const c = $ref.nucleoCache;
    if (c && c.semente === semente && c.mapa === mapa && c.espinha === ctx.espinha && c.guildas === ctx.guildas && c.base === ctx.base && c.estado === ctx.estado && c.chave === chave) return c.nucleo;
    const nucleo = nucleoDaCampanha(semente, mapa, { ...ctx, grupo: pers.grupo || [], antecedente: pers.antecedente || "", reviravolta: rv && rv.forma ? { forma: rv.forma, alvo: rv.alvo } : null });
    $ref.nucleoCache = { semente, mapa, espinha: ctx.espinha, guildas: ctx.guildas, base: ctx.base, estado: ctx.estado, chave, nucleo };
    return nucleo;
  };
  /* MM-C C2: as subtramas do núcleo, memorizadas pelo próprio núcleo (que
     nucleoAgora já memoriza pelo que o muda). O elenco do mundo dá as casas. */
  const subtramasAgora = (nucleo) => {
    const c = $ref.subtramasCache;
    if (c && c.nucleo === nucleo) return c.lista;
    const semente = sementeMundo();
    let elenco = null;
    try { elenco = elencoDoMundo(semente, $ref.mapa, contextoDoElenco()); } catch (e) { calou("o elenco das subtramas", e); }
    const lista = subtramasDoNucleo(nucleo, { semente, espinha: $ref.espinha, elenco });
    $ref.subtramasCache = { nucleo, elenco, lista };
    return lista;
  };
  const nomesDoElenco = () => {
    try {
      const semente = sementeMundo(), mapa = $ref.mapa, ctx = contextoDoElenco();
      const c = $ref.elencoCache;
      if (c && c.semente === semente && c.mapa === mapa && c.espinha === ctx.espinha && c.guildas === ctx.guildas && c.base === ctx.base && c.estado === ctx.estado) return c.nomes;
      const nomes = elencoDoMundo(semente, mapa, ctx).pessoas.map((p) => p.nome);
      $ref.elencoCache = { semente, mapa, espinha: ctx.espinha, guildas: ctx.guildas, base: ctx.base, estado: ctx.estado, nomes };
      return nomes;
    } catch (e) { calou("nomesDoElenco", e); return []; }
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
  /* A cidade sob os pés, resolvida uma vez. Devolve null fora de cidade. */
  /* (Fase T, trilha A) a cidade no mapa é do motor (aCidadeSobOsPes, src/motor/tempo-do-turno.js) */
  const cidadeSobOsPes = () => aCidadeSobOsPes({ cidadeAtual: $ref.cidadeAtual, mapa: $ref.mapa });
  /* Achar a cidade no mapa era feito em três lugares, cada um com a sua
     própria comparação de caixa e de acento. Um lugar só. */
  const cidadeDoMapa = (nome) => (($ref.mapa && $ref.mapa.cidades) || [])
    .find((c) => String(c.nome || "").toLowerCase() === String(nome || "").toLowerCase()) || null;
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
  /* ---------------- ONDE O ERMO ESTÁ (v9.54) ----------------
     A célula do trecho atual. Em viagem, o ponto do caminho já percorrido;
     parado fora de cidade, a célula de onde o herói ficou. Dentro da
     cidade não há ermo, e o prompt não recebe nada. */
  const celulaAqui = () => {
    const semA = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const j = $ref.jornada;
    if (j && j.para) {
      const rota = ($ref.mapa.rotas || []).find((r) =>
        (semA(r.de) === semA(j.de) && semA(r.para) === semA(j.para)) ||
        (semA(r.de) === semA(j.para) && semA(r.para) === semA(j.de)));
      const dias = Math.max(0.5, rota ? Number(rota.dias) || 3 : 3);
      const andados = Math.max(0, $ref.dia - (Number(j.desde) || $ref.dia));
      return celulaDaJornada(sementeMundo(), j, $ref.mapa, moldeMundo(), andados / dias);
    }
    if ($ref.cidadeAtual && !$ref.lugar) return null;
    const cid = ($ref.mapa.cidades || []).find((c) => semA(c.nome) === semA($ref.cidadeAtual));
    return cid ? celulaDaCidade(sementeMundo(), cid, { mapa: $ref.mapa, molde: moldeMundo() }) : null;
  };
  /* A CHEGADA DO LUGAR — `lugarAntesRef` SAIU EM V5a. Guardava o lugar em que
     o turno começara, para o eixo `Chegada` do rosto da cena — e esse eixo
     nunca chegou a existir na peça: foi uma prop INERTE durante doze dias,
     escrita para acender no dia em que o `desenho` a fabricasse. A gravura
     saiu primeiro. A chegada a um lugar novo passa a marcar-se na PROSA e não
     no cabeçalho (a cartela, proposta do `jogo` em `v5a-jogo.md` §5),
     justamente para o cabeçalho nunca mudar de altura nem piscar. Se voltar,
     a conta é a de sempre — o turno começa quando `carregando` sobe — e o
     mecanismo irmão continua vivo e provado na soleira (`soleiraAntesRef`).

     A LEI QUE ELE GUARDAVA FICA ESCRITA, para quem o trouxer de volta: a
     marca de chegada DECAI NO TURNO SEGUINTE, NUNCA POR RELÓGIO. *Uma marca
     que morre por tempo morre enquanto o jogador está pensando.* O turno
     começa quando `carregando` passa a verdadeiro; nesse instante o lugar em
     que se estava fica registado, e tudo o que for diferente disso é
     CHEGADA até o turno seguinte começar.

     E A LIÇÃO DO QUE NÃO SE FEZ: uma prop que vai na chamada «para o dia em
     que a peça a tiver» é código que corre todos os turnos sem efeito
     nenhum. Doze dias depois, a peça morreu sem a ter — e a prop, a
     referência e o efeito tinham de morrer com ela. */

  /* MM16 nº 4: dentro da masmorra o Local do rodapé é a boca (o lugar que a
     entrada registou), não a estrada: a jornada fica guardada para a saída,
     e dizia "EM VIAGEM desde …" com o herói a três salas da porta. */
  const localAtualTxt = () => ($ref.masmorra && $ref.lugar)
    ? linhaDeLugar($ref.lugar)
    : $ref.jornada
    ? `${(linhaDaViagem($ref.jornada) || `EM VIAGEM desde ${$ref.jornada.de || "a última parada"}`).replace(/^🧭 /, "EM VIAGEM: ")} — não estou em cidade nenhuma`
    : $ref.lugar
      ? linhaDeLugar($ref.lugar)
      : ($ref.cidadeAtual ? `em ${$ref.cidadeAtual}` : "a sós, fora de cidade");
  /* o nível é o da ficha VIVA (o ref, 4.ª fatia): o `personagem` do render
     é nulo nas closures que nascem no primeiro render (o aplicarResposta é
     uma delas), e a fama caía no nível 1 — o defeito 4 de 28/10 */
  const famaAtual = () => calcularFama($ref.contadores, (($ref.personagem || $render.personagem || {}).nivel) || 1, dominiosDe($ref.mapa).length);
  const tempoInfoPrompt = () => {
    const est = estacaoDe($ref.dia);
    return `TEMPO DA CAMPANHA: hoje é ${dataTxt($ref.dia)} — dia ${$ref.dia} da campanha —, ${horaTxt($ref.minuto)}${ehNoite($ref.minuto) ? " (NOITE)" : ""}, ${est.nome.toLowerCase()} ${est.icone} (${est.nota}). O app controla o relógio e o calendário: NUNCA estime datas ou horas por conta própria; use estas.`;
  };
  /* 11/10 (MM, o laço da história 4/6, v9.401 do backend): um vilão só — a
     lista de chefes obedece ao antagonista do fio. Se a leitura com a espinha
     estourar, a lista de antes volta: o prompt nunca fica sem chefes. */
  /* ONDA 2 DO CUSTO: sem chefe em jogo no turno, só o antagonista e o +N */
  const chefesDoFio = (soOAntagonista = false) => {
    try { return resumoChefesPrompt(sementeMundo(), $ref.mapa, $ref.baseMundo, generoMundo(), (mundoAtual() || {}).lexico, { espinha: $ref.espinha, soOAntagonista }); }
    catch (e) { calou("os chefes do fio", e); return resumoChefesPrompt(sementeMundo(), $ref.mapa, $ref.baseMundo, generoMundo(), (mundoAtual() || {}).lexico); }
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
  /* ---------------- O BAÚ SÓ ONDE SE PROCURA (30/09, MM13b) ----------------
     `achavelAqui` precisa saber ONDE o herói está para não devolver o
     segredo de outro prédio ou o baú de outra estrada — ver mundo-base.js. */
  const ondeSeProcura = () => {
    const l = $ref.lugar;
    return { lugar: (l && l.nome) || "", dentroDe: (l && l.dentroDe) || "", foraDosMuros: !$ref.cidadeAtual || !!(l && l.distancia === "arredores") };
  };
  /* O cão de guarda da nêmesis na narração (morreu na cena sem registo? o
     sistema encerra; apareceu depois de morta? o sistema corrige o Mestre)
     mora em `aNemesisNaNarrativa` (src/motor/entrega-do-turno.js) desde a
     8.ª fatia da T1-A; o `aplicarResposta` chama-o e aplica o que ele diz. */

  /* O que o Mestre lê sobre ela em TODO turno — viva ou morta. */
  const infoNemesis = () => {
    const n = $ref.nemesis;
    if (!n || !n.nome) return "";
    if (n.status === "derrotada") {
      return `NÊMESIS ENCERRADA (fato do sistema): ${n.nome}, "${n.titulo}", está MORTA${n.comoMorreu ? ` — ${n.comoMorreu}` : ""}. Não a coloque em cena, não a faça agir nem enviar agentes, e não invente sucessores dela.`;
    }
    return resumoVilaoPrompt(n);
  };
  /* os efeitos que o App já sabe aplicar pelos seus próprios sistemas: o
     laço do herói com a pessoa (firmar, ao máximo, romper — npcs.js) e a
     relação com quem está no registo. A bolsa sai no clique, com o
     veredito antes. O resto (a luta, o teste, a missão, os dias, o tique)
     chega ao Narrador como fato, na linha da decisão, e é o motor de cada
     um que o faz acontecer na resposta. */
  const aplicarEfeitosDoCoracao = (efeitos) => {
    let npcs = $ref.npcs || {};
    const chaveDe = (nome) => Object.keys(npcs).find((k) => k.toLowerCase() === String(nome || "").toLowerCase());
    let mudou = false;
    for (const e of (Array.isArray(efeitos) ? efeitos : [])) {
      try {
        if (!e) continue;
        if (e.tipo === "laco" && !e.com) {
          const k = chaveDe(e.nome);
          if (!k) continue;
          const npc = npcs[k];
          const tipoDe = (n) => (garantirLaco(n && n.laco) || {}).tipo;
          const forcaDe = (n) => (garantirLaco(n && n.laco) || {}).forca || 0;
          let novo = npc;
          if (e.delta === "rompe") novo = romperLaco(npc, $ref.dia);
          else if (e.delta === -1) novo = afrouxarLaco(npc);
          else if (e.delta === 1) novo = firmarLaco(npc, e.firma || tipoDe(npc) || "amizade", $ref.dia);
          else if (e.delta === "max") { let ant = -1; while (ant !== forcaDe(novo)) { ant = forcaDe(novo); novo = firmarLaco(novo, e.firma || tipoDe(novo) || "amizade", $ref.dia); } }
          if (novo !== npc) { npcs = { ...npcs, [k]: novo }; mudou = true; }
        } else if (e.tipo === "relacao" && e.com && e.valor) {
          const k = chaveDe(e.com);
          if (!k) continue;
          npcs = { ...npcs, [k]: { ...npcs[k], relacao: String(e.valor) } };
          mudou = true;
        }
      } catch (e2) { calou("um efeito do coração", e2); }
    }
    if (mudou) { $ref.npcs = npcs; setNpcs(npcs); }
  };
  const confirmarCoracao = (pauta) => {
    const pend = $ref.coracaoPendente;
    $ref.coracaoPendente = null;
    if (!pend || !pend.r) return;
    const r = pend.r;
    const nucleo = nucleoAgora();
    const elo = ((nucleo && nucleo.pessoas) || []).find((x) => x && x.papel === "elo") || null;
    const specs = elo ? sementesDoElo(nucleo, { dia: $ref.dia }) : [];
    const dela = (x) => !!(specs.length && x && x.dona === specs[0].dona && x.alvo === elo.nome);
    try {
      if (elo && specs.length && (pend.emCena || []).includes(elo.nome)) {
        let L = garantirLivro($ref.promessas);
        if (!L.sementes.some(dela)) { for (const sp of specs) L = semear(L, sp).livro; $ref.promessas = L; }
      }
    } catch (e) { calou("as sementes do elo", e); }
    if (r.linha && !String(pauta || "").includes(r.linha)) return;
    $ref.coracao = garantirCoracaoDoSave(r.coracao);
    /* E1 (o Narrador só narra): a figura que o arco pôs em cena tem nome
       (`inst.figura`, subtramas.js) — e, se a linha que a nomeia coube no
       texto, entra no registo, para o Narrador não a rebatizar depois. */
    try {
      const b = r.batida;
      const inst = b ? (subtramasAgora(nucleo) || []).find((i) => i && i.nome === b.nome && i.figura && i.figura.nome) : null;
      if (inst && r.linha && r.linha.includes(inst.figura.nome)) {
        const fig = inst.figura;
        const reg = $ref.npcs || {};
        if (!Object.keys(reg).some((k) => k.toLowerCase() === String(fig.nome).toLowerCase())) {
          const novo = { ...reg, [String(fig.nome).slice(0, 40)]: criarNPC(String(fig.nome).slice(0, 40), { papel: fig.papel || "", genero: fig.genero === "ela" ? "mulher" : "homem", local: $ref.cidadeAtual || "", ultimaVez: $ref.npcTurno, conhecidoEm: $ref.dia }) };
          $ref.npcs = novo; setNpcs(novo);
        }
      }
    } catch (e) { calou("a figura do arco no registo", e); }
    if (r.quem) { const rt = $ref.coracaoRitmo || {}; $ref.coracaoRitmo = { ...rt, ultimas: { ...(rt.ultimas || {}), [r.quem]: pend.turno } }; }
    try { aplicarEfeitosDoCoracao(r.efeitos); } catch (e) { calou("os efeitos do coração", e); }
    try {
      const b = r.batida;
      if (elo && b && b.nome === elo.nome) {
        let L = garantirLivro($ref.promessas);
        if ((b.tipo === "pistaA" || b.tipo === "pistaB") && specs[b.pista]) {
          const sm = L.sementes.find((x) => dela(x) && x.forma === specs[b.pista].forma && x.estado !== "paga" && x.estado !== "murcha");
          if (sm) L = regar(L, sm.id, { dia: $ref.dia, cena: elo.nome }).livro;
        } else if (b.tipo === "revelacao" || b.tipo === "corpo") {
          for (const sm of L.sementes.filter((x) => dela(x) && x.estado === "madura")) L = pagar(L, sm.id, { dia: $ref.dia }).livro;
        }
        $ref.promessas = L;
      }
    } catch (e) { calou("o Livro do coração", e); }
  };
  /* ---------------- o que o render calculava ---------------- */
  const cidadeMercado = Object.prototype.hasOwnProperty.call($render0, "cidadeMercado") ? $render0.cidadeMercado : cidadeDoMapa($ref.cidadeAtual);
  const mercadoAqui = Object.prototype.hasOwnProperty.call($render0, "mercadoAqui") ? $render0.mercadoAqui : (() => {
    const comprados = ($render.mercado && $render.mercado.comprados) || {};
    const semEstoqueGasto = (m) => ({ ...m, estoque: (m.estoque || []).filter((it) => !(comprados[m.id] || []).includes(it.nome)) });
    const lista = [];
    /* 10.ª sessão (v9.455, M16): a carroça do ambulante só está à mão enquanto
       a viagem em que ela apareceu está aberta — chegado à cidade, ela seguiu
       viagem, e nem o painel nem a pauta a vendem (a "banca da chave" que o
       Mestre pôs na praça saía daqui). Um save antigo, sem trecho, vale só na
       estrada. */
    const carrocaAVista = (() => {
      try {
        const amb = $render.mercado && $render.mercado.ambulante, j = $ref.jornada;
        if (!amb || !j) return false;
        return !amb.trecho || amb.trecho === (j.de || "") + ">" + (j.para || "");
      } catch (e) { calou("a carroça à vista", e); return false; }
    })();
    if (carrocaAVista) lista.push(semEstoqueGasto($render.mercado.ambulante));
    if (cidadeMercado) lista.push(...mercadoresDaCidade(cidadeMercado, $ref.dia, ($render.personagem && $render.personagem.nivel) || 1, (mundoAtual() || {}).lexico, {
      pressoes: ($render.mercado && $render.mercado.pressoes) || {},
      /* v9.139: a casa de ofício de um domínio seu barateia aqui o que esta
         cidade produz. É a primeira vez que uma decisão de governo aparece
         na etiqueta de um preço. */
      oficina: (g) => { const f = fatorDaOficina(($render.governos || {})[cidadeMercado.nome], g, cidadeMercado); return f === 1 ? null : { fator: f, porque: "a casa de ofício daqui fabrica isto" }; },
    }).map(semEstoqueGasto));
    /* CARTÓGRAFO (v9.14): quem vende papel põe os mapas das regiões que o
       herói ainda não conhece na banca. Some sozinho quando não há mais o que
       revelar — não fica um item morto na prateleira. */
    const ocultas = regioesDoMapa($ref.mapa, { conhecidas: false });
    if (ocultas.length) {
      const porRegiao = {};
      for (const c of ($ref.mapa.cidades || [])) if (c.regiao) porRegiao[c.regiao] = (porRegiao[c.regiao] || 0) + 1;
      const mapas = mapasAVenda(ocultas, porRegiao);
      for (const l of lista) {
        if (l.tipo !== "geral" && l.tipo !== "relicario") continue;
        const gastos = ($render.mercado && $render.mercado.comprados && $render.mercado.comprados[l.id]) || [];
        l.estoque = [...l.estoque, ...mapas.filter((mp) => !gastos.includes(mp.nome))];
      }
    }
    /* v9.44: o desconto do Mercador é aplicado no ESTOQUE, não no caixa. A
       etiqueta que o jogador lê e a moeda que sai do bolso saem daqui — se o
       desconto morasse só em `comprarNoMercado`, a banca anunciaria um preço
       e cobraria outro, que é a pior forma de dar um benefício. */
    /* v9.138: A PECHINCHA MORA AQUI, com o desconto da profissão, pelo
       mesmo motivo que ele mora aqui desde a v9.44: a etiqueta que o jogador
       lê e a moeda que sai do bolso saem da MESMA linha. Barganha aplicada
       só no caixa é uma banca que anuncia um preço e cobra outro. */
    const barg = ($render.mercado && $render.mercado.pechinchas) || {};
    return lista.map((l) => {
      const b = barg[l.id];
      const aj = (b && b.dia === $ref.dia && b.ajuste) || 1;
      return {
        ...l,
        caixa: podePagar(l, cidadeMercado, $ref.dia, (($render.mercado && $render.mercado.gastos && $render.mercado.gastos[l.id] && $render.mercado.gastos[l.id].dia === $ref.dia) ? $render.mercado.gastos[l.id].moedas : 0)),
        barganha: (b && b.dia === $ref.dia) ? b : null,
        estoque: (l.estoque || []).map((it) => ({ ...it, preco: Math.max(1, Math.round(precoDeCompraPara($render.personagem, it.preco) * aj * fatorDePreco($ref.lei, cidadeMercado, $ref.dia))) })),
      };
    });
  })();

  /* ---------------- o trecho de `enviar`, à letra ---------------- */
  const montar = () => {
  const conteudo = $in.frase;
  const daFrente = $in.daFrente;
  const daTrama = $in.daTrama;
  const daVirada = $in.daVirada;
  const doCompasso = $in.doCompasso;
  const fioEsc = $in.fioEsc;
  const formaDaCena = $in.formaDaCena;
  const histBase = $in.histBase;
  const oficina = $in.oficina;
  const pedidoEsc = $in.pedidoEsc;
  const persAtual = $in.persAtual;
    const pauta = textoDaPauta(comOBoato(pautaDoTurno(conteudo), conteudo), { turno: $ref.turnoDeRegistro + 1 }); try { const b = oBoatoQueChegou(boatoDoTurno, pauta); boatoDoTurno = null; if (b) { $ref.canone = b.canone; if (b.npcs !== $ref.npcs) { $ref.npcs = b.npcs; setNpcs(b.npcs); } } } catch (e) { calou("o boato da chegada", e); } try { const q = $ref.quemE || {}; const pq = q.pendente; if (pq) $ref.quemE = pauta.includes(pq.linha) ? { ultimas: { ...(q.ultimas || {}), [pq.quem]: pq.turno }, cenas: { ...(q.cenas || {}), [pq.quem]: (Number((q.cenas || {})[pq.quem]) || 0) + 1 }, pendente: null } : { ...q, pendente: null }; } catch (e) { calou("o ritmo do QUEM É", e); } try { confirmarCoracao(pauta); } catch (e) { calou("confirmar o coração", e); } try { const np = $ref.nomesPendentes; $ref.nomesPendentes = null; if (np && np.linha && pauta.includes(np.linha)) $ref.nomesOferecidos = np.nomes; } catch (e) { calou("confirmar os nomes à mão", e); } /* E1: o teto corta a linha dos nomes num turno cheio, e o Narrador ainda tem os da véspera na história (a prova viva: Alba da Pedra, oferecida no turno 7, usada no 8 com a linha cortada) — os oferecidos ficam até a linha voltar com outros */ /* MM-C C2: a batida só conta se coube */ /* MM-C C1: a ficha só conta se chegou ao texto */
    /* guardado antes da resposta: "a luta acabou neste turno" é a
       diferença entre o que havia e o que ficou */
    const combateAntes = !!$ref.combate;
    /* MM18: no máximo UM empurrão por turno (dois no degrau da cobrança), e
       o que toca o fio entra primeiro; o que pode esperar volta à nota do
       turno seguinte, uma vez só. Os fatos do turno vão sempre. Se a
       escuta estoura, a nota é a de antes, inteira. */
    const daNota = umSoLugar($ref.nota); /* MM14: a pauta nunca leva duas versões do lugar */
    let doTurno = [oficina, daNota, doCompasso, formaDaCena, daFrente, daVirada, daTrama], adiadosEsc = null;
    /* A CAMPANHA QUE PRENDE (item 3): na estrada (em viagem ou acampado), o
       envelope que abre fio novo só entra se se amarra à história, e entra
       com a amarra dita; o resto fica seguro na nota até à chegada. */
    let envDoTurno = null, seguraEstrada = [];
    try {
      const naEstrada = !!$ref.jornada || !!$ref.acampado;
      if (naEstrada) {
        const fe = fiosNovosNaEstrada([oficina, ...separarEnvelopes(daNota), doCompasso, formaDaCena, daFrente, daVirada, daTrama], {
          naEstrada, fio: fioDaHistoria({ abertura: $ref.abertura, missoes: $ref.missoes }),
          prometido: $ref.prometido, nomes: [($ref.nemesis || {}).nome].filter(Boolean),
        });
        if (fe.seguram.length || fe.amarrados.length) { envDoTurno = fe.ficam; seguraEstrada = fe.seguram; doTurno = fe.ficam; }
      }
    } catch (e) { calou("os fios novos na estrada", e); envDoTurno = null; seguraEstrada = []; }
    if (pedidoEsc) {
      try {
        const rEsc = escutarOTurno({
          envelopes: envDoTurno || [oficina, ...separarEnvelopes(daNota), doCompasso, formaDaCena, daFrente, daVirada, daTrama],
          fio: fioEsc, semAvanco: garantirEscuta($ref.escuta).semAvanco, adiadosAntes: $ref.adiadosEscuta,
        });
        doTurno = rEsc.ficam;
        adiadosEsc = rEsc.adiados;
      } catch (e) { calou("a escuta do turno", e); adiadosEsc = null; }
    }
    const nota = [pauta, ...doTurno].filter(Boolean).join("\n");
    $ref.nota = "";
    if (adiadosEsc) { $ref.nota = adiadosEsc.join("\n"); $ref.adiadosEscuta = adiadosEsc; }
    if (seguraEstrada.length) $ref.nota = [$ref.nota, ...seguraEstrada].filter(Boolean).join("\n");
    /* a escada anda depois da pauta: o degrau deste turno é o de antes dele */
    try {
      const anda = aEscutaAnda({ escuta: $ref.escuta, missoes: $ref.missoes, espinha: $ref.espinha, combate: $ref.combate }, { pedido: pedidoEsc, fio: fioEsc });
      $ref.escuta = anda.escuta;
      if (anda.erro) calou("a escuta anda", anda.erro);
    } catch (e) { calou("a escuta anda", e); }
    const corpo = nota ? `${nota}\n${conteudo}` : conteudo;
    /* ONDA 2 DO CUSTO (13/10): OS SINAIS DO TURNO. Lidos na frase, na pauta
       e nos envelopes (com a lista das missões), e nas duas últimas
       narrações, contra o nome de quem existe (os chefes do mundo, as
       masmorras daqui). Abrem e fecham as portas que a cena sozinha deixava
       sempre abertas (`emJogoNoTurno`, prompt.js). Se estourar, tudo abre. */
    try {
      const recentes = ($ref.mensagens || []).filter((m) => m && m.autor === "mestre").slice(-2).map((m) => m.texto).join("\n");
      let chefesNomes = [], masmorrasNomes = [], missoesTxt = "";
      try { chefesNomes = chefesDoMundo(sementeMundo(), $ref.mapa, generoMundo(), (mundoAtual() || {}).lexico).map((c) => c && c.nome).filter(Boolean); } catch (e) { calou("os chefes do sinal", e); }
      try { const fio = (($ref.espinha || {}).fio || {}).antagonista; if (fio) chefesNomes.push(String(fio)); } catch (e) { calou("o antagonista do sinal", e); }
      $ref.genteDaqui = []; try { const q = ($ref.cidadeAtual && !$ref.masmorra) ? oQueExisteAqui(sementeMundo(), $ref.mapa, $ref.cidadeAtual, $ref.baseMundo, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico) : null; masmorrasNomes = ((q && q.masmorras) || []).map((m) => m && m.nome).filter(Boolean); $ref.genteDaqui = ((q && q.gente) || []).map((g) => g && g.nome).filter(Boolean); } catch (e) { calou("as masmorras do sinal", e); }
      try { missoesTxt = resumoMissoesPrompt($ref.missoes) || ""; } catch (e) { calou("as missões do sinal", e); }
      $ref.sinaisDoTurno = emJogoNoTurno({ frase: conteudo, nota: `${nota}\n${missoesTxt}`, recentes, chefes: chefesNomes, masmorras: masmorrasNomes }); try { $ref.genteNaPauta = /^A GENTE\s/m.test(String(pauta || "")); } catch (e) { calou("a linha A GENTE da pauta", e); $ref.genteNaPauta = null; } try { /* ONDA 3: em jogo é o grupo, quem está aqui, quem a missão pede, o núcleo e o fio; o texto é a frase, a pauta, as missões, as duas últimas narrações, o arco e o fio; os lugares, a cidade, o prédio e a masmorra */ const pR = persAtual || $ref.personagem || $render.personagem || {}; const lugarR = $ref.lugar || {}; let presentesR = [], nucleoR = []; try { presentesR = ((elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: pR.grupo || [], masmorra: $ref.masmorra }) || {}).aqui || []).map((x) => (typeof x === "string" ? x : x && x.nome)); } catch (e) { calou("quem está aqui, para a relevância", e); } try { nucleoR = ((nucleoAgora() || {}).pessoas || []).map((x) => x && x.nome); } catch (e) { calou("o núcleo, para a relevância", e); } const fioR = [(($ref.espinha || {}).fio || {}).antagonista]; const missaoR = ($ref.missoes || []).filter((m) => m && m.status === "ativa").flatMap((m) => [m.dador, ...(m.etapas || []).map((e) => e && e.alvo)]); let arcoR = ""; try { arcoR = resumoDoArco(); } catch (e) { calou("o arco, para a relevância", e); } $ref.relevancia = relevanciaDoTurno({ frase: conteudo, nota, missoes: missoesTxt, recentes, arco: arcoR, fio: fioR, emJogo: [...(pR.grupo || []), ...presentesR, ...missaoR, ...nucleoR, ...fioR], lugares: [$ref.cidadeAtual, lugarR.nome, lugarR.dentroDe, $ref.masmorra && $ref.masmorra.nome], carrega: (pR.inventario || []).map((it) => it && it.nome) }); } catch (e) { calou("a relevância do turno", e); $ref.relevancia = null; }
    } catch (e) { calou("os sinais do turno", e); $ref.sinaisDoTurno = SINAIS_ABERTOS; $ref.relevancia = null; $ref.genteNaPauta = null; }
    /* RODAPÉ DO SISTEMA (v7.0.2): lembrete curto colado SÓ na mensagem atual
       (não fica no histórico — custo ~zero) reforçando as regras que o
       DeepSeek mais esquecia: relógio do sistema, proibição de inventar
       memórias, obediência ao cânone e narrativa sempre preenchida. */
    let npcsDoTurno = null; try { /* onda 3: as PESSOAS CONHECIDAS pela relevância, montadas UMA vez — o system as leva e o O QUE EXISTE lê-as para dizer cada fato uma vez só */ npcsDoTurno = resumoNPCsParaPrompt($ref.npcs, undefined, { grupo: (persAtual || $ref.personagem || $render.personagem || {}).grupo || [], elenco: nomesDoElenco(), vistos: $ref.elenco.vistos, emCena: (() => { try { const c = ($ref.mensagens || []).filter((m) => m && m.autor === "mestre").slice(-2).map((m) => m.texto).join(" "); return Object.keys($ref.npcs || {}).filter((n) => c.includes(n)); } catch (e) { calou("emCena das pessoas", e); return []; } })(), missao: (() => { try { return ($ref.missoes || []).filter((m) => m && m.status === "ativa").flatMap((m) => [m.dador, ...(m.etapas || []).map((e) => e && e.alvo)]).filter(Boolean); } catch (e) { calou("missao das pessoas", e); return []; } })(), relevancia: $ref.relevancia }); } catch (e) { calou("as pessoas do turno", e); npcsDoTurno = null; }
    /* o texto, a ordem e a regra das peças vivem no motor (envelopes-do-turno.js); aqui ficam as peças */
    const rodape = oRodapeDoTurno({ dia: $ref.dia, minuto: $ref.minuto, local: localAtualTxt(), ascensao: $ref.divindade && $ref.divindade.despertar ? resumoAscensao($ref.divindade, ($render.personagem && $render.personagem.nivel) || 1) : false }, (() => {
      /* CONDIÇÕES (v9.0) e NÊMESIS: estado vivo, colado em TODO turno. É o que
         impede o Mestre de narrar um herói inteiro enquanto o sistema o mantém
         atordoado — ou uma nêmesis viva depois de o sistema tê-la enterrado. */
      /* MM16 nº 6: a ficha DESTE turno. `personagem` aqui é o valor do
         render em que `enviar` nasceu (o useCallback não o tem nas
         dependências), e um estado posto no mesmo clique — o escondido que
         acabou de nascer, a condição da falha crítica — só chegava ao
         rodapé no turno seguinte. A mesma ordem do pedido logo abaixo. */
      const p = persAtual || $ref.personagem || $render.personagem || {};
      const cond = resumoCondicoesPrompt(p, p.grupo || []);
      const nem = infoNemesis();
      const merc = $ref.masmorra ? "" : resumoMercadoPrompt(mercadoAqui); /* MM16 nº 4: na masmorra não há banca aberta */
      const grp = resumoGrupoPrompt(p.grupo || []);
      const rea = $ref.combate ? resumoReacoesPrompt(p) : "";
      /* v9.20: o terreno é fato, e o Mestre precisa dele para não teleportar
         ninguém pelo salão. Só existe durante a luta — fora dela, espaço é
         livre e é ele quem descreve. */
      /* MM6: "o anao esta me vendo?" — null quando nao estou escondido, e
         so entao a linha do tabuleiro sai identica a de antes. */
      let qmvLuta = null;
      try {
        qmvLuta = $ref.combate ? quemMeVe(p, { grade: $ref.combate.grade, heroi: $ref.combate.heroi, inimigos: $ref.combate.inimigos || [], luz: luzDaLutaAgora() }) : null;
      } catch (e) { calou("quemMeVe-na-luta", e); }
      const zon = $ref.combate ? resumoGridPrompt($ref.combate.grade, {
        heroi: $ref.combate.heroi,
        inimigos: $ref.combate.inimigos || [], grupo: $ref.combate.aliados || [], ordem: $ref.combate.ordem,
        quemMeVe: qmvLuta,
      }) : "";
      /* v9.34: quanto chão eu cubro num turno. Sem isto o Mestre inventa a
         velocidade do herói cena a cena, e sempre a favor da cena. */
      const mov = resumoDeslocamentoPrompt(p, { dobrar: dobraMovimento(p) });
      /* v9.6: a ficha de atributos, os combos que a build permite e o rito de
         ascensão em curso — os três lugares onde o Mestre inventava por não saber */
      /* ONDA 2 DO CUSTO: os ATRIBUTOS saíram daqui — a ficha do herói, no
         texto fixo, já os diz (fichaTexto), e a progressão diz qual a
         classe domina. Eram a mesma linha duas vezes no mesmo pedido. */
      const cmb = $ref.combate ? resumoCombosPrompt(p) : "";
      const rit = resumoRitoPrompt($ref.divindade, p.nivel || 1);
      /* BASE DO MUNDO (v9.8): o lugar onde o herói está já tem locais, gente e
         segredos definidos. É isto que substitui a invenção a cada turno. */
      /* v9.39: quando o herói está fora da cidade, o que a base descreve
         continua verdadeiro — mas é o mundo LÁ, não a cena aqui. A linha do
         lugar vem antes para o Mestre ler nessa ordem. */
      /* MM16 nº 4: dentro da masmorra a cena é a sala, e quem a diz é a
         planta (o ONDE e a seção MASMORRA da pauta). Este bloco pedia ao
         Mestre "quem aparece na estrada" com o herói numa câmara. */
      const ondeEstou = $ref.masmorra ? "" : resumoLugarPrompt($ref.lugar, $ref.cidadeAtual);
      /* v9.40: a forma do mundo vem ANTES do que existe aqui — é ela que
         diz se "aqui" é uma cidade, um andar ou uma órbita, e sem essa
         ordem o Mestre lê a lista de locais já pensando em cidade. */
      /* ONDA 2 DO CUSTO: a FORMA DESTE MUNDO não muda numa campanha — subiu
         para o texto fixo (fixoDaFicha), e o "aqui" segue sem ela */
      const forma = "";
      /* v9.43: para onde dá para ir num gesto. Em mundo de estrada esta linha
         nem existe (toda rota leva dias); na Torre é o portal do andar, e sem
         ela o Mestre inventa o nome do destino e esquece de registrar a
         chegada — que foi o bug do "subi na narração e não subi no sistema". */
      const saidas = saidasDeUmPassoPrompt($ref.mapa, $ref.cidadeAtual);
      /* v9.51: o cinturão da cidade. Sem esta linha o Mestre inventava a
         fazenda de novo a cada menção, com outro nome e outro dono — o mesmo
         motivo pelo qual a base do mundo existe. */
      const cidadeObj = ($ref.mapa.cidades || []).find((c) => (c.nome || "").toLowerCase() === String($ref.cidadeAtual || "").toLowerCase());
      const fora = cidadeObj ? resumoArredoresPrompt(sementeMundo(), cidadeObj) : "";
      /* v9.54: A FORMA DO ASSENTAMENTO. A planta já sabia que uma aldeia de
         190 almas não tem muralha; o Mestre não sabia, e narrava portão,
         guarda e muro numa aldeia que não tem nenhum dos três. É uma linha
         curta porque é um FATO curto — e fato que o desenho já mostra ao
         jogador não pode continuar sendo contradito na prosa. */
      const shape = cidadeObj && !$ref.lugar ? aFormaDaqui(cidadeObj) : "";
      /* v9.54: o trecho de ermo em que o herói está. É o estágio 2 do mundo
         chegando ao Mestre: o caminho entre dois lugares deixa de ser um
         vazio narrado de improviso e vira terreno, distância e uma feição
         que continua lá na volta. */
      /* v9.56 (etapa 2): em viagem quem descreve o terreno é o registro da
         viagem, que tem o trecho exato. Mandar os dois seria dizer a mesma
         coisa duas vezes com palavras diferentes — e duas descrições do
         mesmo lugar é como o Mestre acaba inventando uma terceira. */
      const ermoAqui = $ref.jornada ? "" : (() => { try { return resumoCelulaPrompt(celulaAqui(), moldeMundo()); } catch { return ""; } })();
      /* v9.56: quanto falta de estrada. Sem esta linha o Mestre sabia que o
         herói viajava e não sabia se era o primeiro dia ou o último — daí
         "a estrada segue" repetido, sem nunca apertar o ritmo. */
      /* A pausa é LIDA, não guardada: se há luta e há jornada, a viagem está
         parada — e como só `viajar` anda, não há estado para sincronizar nem
         para esquecer de desfazer. */
      /* A pausa diz ONDE parou: "no 4º trecho de 13, junto às três pedras".
         É o que impede o Mestre de resolver a luta num lugar genérico e
         depois retomar a estrada como se nada tivesse acontecido ali. */
      const viag = ($ref.jornada && !$ref.masmorra) /* MM16 nº 4: a estrada espera à porta */
        ? resumoViagemPrompt($ref.combate
          ? pausarViagem($ref.jornada, (() => {
            const tr = trechoAtual($ref.jornada);
            return `estamos no meio de uma luta${tr ? `, no ${tr.indice + 1}º trecho de ${tr.total} — ${tr.feicao.nome}` : ""}`;
          })())
          : $ref.jornada)
        : "";
      /* v9.58: A PLANTA DO PRÉDIO em que o herói está. Enquanto ele estiver
         na rua isto não existe — a cidade tem locais, e é `resumoDaqui` que
         os lista. Dentro de um, a pergunta muda: o que há neste prédio, e
         por onde se anda dentro dele. Sem esta linha o Mestre inventava a
         escada, e o jogador que escrevesse "subo" descobria que o sistema
         não o seguia para lugar nenhum. */
      const comodosAqui = (() => {
        try {
          const alvoNome = $ref.lugar ? ($ref.lugar.dentroDe || $ref.lugar.nome) : "";
          if (!alvoNome) return "";
          const cid = cidadeSobOsPes();
          if (!cid) return "";
          const dono = locaisDaCidade(sementeMundo(), cid, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico).find((l) => semNome(l.nome) === semNome(alvoNome));
          if (!dono) return "";
          return resumoComodosPrompt(comodosDoLocal(sementeMundo(), dono, generoMundo(), moldeMundo()), dono.nome);
        } catch { return ""; }
      })();
      /* MM17 C2: lá dentro a cena é a sala. A cidade (os locais, a gente, os
         rumores, os arredores, o ermo, as saídas e a forma do mundo) cala por
         tabela (`DENTRO_DA_MASMORRA`, masmorra-sem-cidade.js); fora dela o
         "aqui" sai byte a byte o de antes. */
      const daquiTxt = calaNaMasmorra("daqui", $ref.masmorra) ? "" : resumoDaqui(sementeMundo(), $ref.mapa, $ref.cidadeAtual, $ref.baseMundo, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico, { semMasmorras: !($ref.sinaisDoTurno || SINAIS_ABERTOS).masmorraEmJogo, relevancia: $ref.relevancia, onde: (() => { try { return ondeSeProcura(); } catch (e) { calou("onde se procura, para o rodapé", e); return null; } })(), jaDitos: (() => { try { return linhasJaDitas(npcsDoTurno || ""); } catch (e) { calou("as linhas já ditas, para o rodapé", e); return null; } })() }); /* onda 3 do custo: a gente, os esconderijos e as masmorras pela relevância (resumoDaqui, mundo-base.js) */
      let aqui = "";
      try {
        aqui = aquiDoTurno({ forma, ondeEstou, comodos: comodosAqui, daqui: daquiTxt, formaDaCidade: shape, viagem: viag, ermo: ermoAqui, arredores: fora, saidas }, $ref.masmorra);
      } catch (e) { calou("aquiDoTurno", e); aqui = [forma, ondeEstou, comodosAqui, daquiTxt, shape, viag, ermoAqui, fora, saidas].filter(Boolean).join("\n\n"); }
      const chefes = chefesDoFio(!($ref.sinaisDoTurno || SINAIS_ABERTOS).chefeEmJogo);
      /* QUEM ESTÁ EM CENA (v9.9): presentes, ausentes com a distância em dias,
         e o que foi dito em particular — as duas regras que impedem o aliado
         de teletransportar e o estranho de saber o que não ouviu. */
      /* MM8c-1: quem foi citado nas duas últimas falas do Mestre nunca sai
         do "aqui", mesmo com a recência antiga — citar alguém na narração
         é a cena dizendo que ela está presente agora */
      let emCenaAgora = [];
      try {
        const citadosAgora = ($ref.mensagens || []).filter((m) => m && m.autor === "mestre").slice(-2).map((m) => m.texto).join(" ");
        emCenaAgora = Object.keys($ref.npcs || {}).filter((nome) => citadosAgora.includes(nome));
      } catch { emCenaAgora = []; }
      const cena = resumoCenaPrompt($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: p.grupo || [], confidencias: $ref.confidencias, emCena: emCenaAgora, masmorra: $ref.masmorra, elenco: nomesDoElenco(), vistos: $ref.elenco.vistos, missao: (() => { try { return ($ref.missoes || []).filter((m) => m && m.status === "ativa").flatMap((m) => [m.dador, ...(m.etapas || []).map((e) => e && e.alvo)]).filter(Boolean); } catch (e) { calou("missao do rodape", e); return []; } })(), naPauta: (() => { try { return Object.keys($ref.npcs || {}).filter((n) => n && pauta.includes(`${n} está em `)); } catch (e) { calou("quem a pauta já veta", e); return []; } })(), lugar: (() => { try { const l = $ref.lugar || {}; return [l.nome].filter(Boolean); } catch (e) { calou("o prédio da cena", e); return []; } })(), });
      /* PROFICIÊNCIA (v9.11): o que o herói sabe usar, e o que está pesando */
      const eqp = resumoProficienciaPrompt(p, ranksDoPersonagem(p));
      /* PERÍCIAS (v9.15): em que ele é treinado, em que é leigo, e os passivos —
         que decidem o que ele nota SEM rolar. Sem isto o Mestre inventa a
         competência do herói cena a cena, e sempre a favor da cena. */
      const per = resumoPericiasPrompt(p, (id) => atributoEfetivo(p, id), "passivos"); /* onda 2: o treino subiu para o fixo */
      const her = resumoHeroismoPrompt(p);
      const dsc = resumoDescansoPrompt(p, $ref.dia);
      const rel = resumoRelogiosPrompt($ref.relogios);
      const mag = resumoMagiasPrompt(p);
      const sin = resumoSintoniaPrompt(p);
      const leg = resumoLegadoPrompt(p);
      const mis = resumoMissoesPrompt($ref.missoes);
      const grm = resumoGrimorioPrompt(p);
      /* v9.32: as dádivas no rodapé. Sem isto o Mestre não sabe que o herói é
         imune a veneno nem que ele tem um nome próprio de bênção — e inventa
         os dois. */
      const dad = resumoDadivasPrompt(p);
      /* v9.44: o traço da origem e o que a profissão abre. Sem estas duas
         linhas o Mestre trata Anão e Elfo como a mesma pessoa e a profissão
         do herói como enfeite de ficha — que foi exatamente o que acontecia. */
      const trc = resumoTracosPrompt(p);
      /* onda 2: a PROFISSÃO subiu para o texto fixo (fixoDaFicha) */
      /* v9.46: quem está no campo por conjuração. Sem esta linha o Mestre
         narra um herói sozinho ao lado de uma fera invocada de 40 PV. */
      const ivc = resumoInvocacoesPrompt(p);
      /* v9.41: só entra quando há coisa caída — e aí precisa entrar, senão o
         Mestre descreve um chão limpo em cima de um chão cheio, ou pior,
         "entrega" o que o jogador ainda não recolheu. */
      const chn = envelopeDoQueFicou(pertoDaqui($ref.chao, $ref.combate ? $ref.combate.heroi : null, RAIO_EXAME));
      return { aqui, chao: chn, chefes, cena, proficiencia: eqp, pericias: per, heroismo: her, descanso: dsc, relogios: rel, magias: mag, sintonia: sin, legado: leg, missoes: mis, dadivas: dad, tracos: trc, invocacoes: ivc, deslocamento: mov, condicoes: cond, nemesis: nem, mercado: merc, grupo: grp, reacoes: rea, tabuleiro: zon, combos: cmb, rito: rit };
    })());
    const base = histBase ?? $render.historico;
    /* MM18: a frase do jogador é a ÚLTIMA coisa que o Narrador lê — depois
       do rodapé, com a etiqueta de `escuta.js`. Na 4.ª sessão ela ia a 7–14
       mil caracteres do fim. O histórico guarda só a frase (onda 1 do
       custo, `memoriaDoTurno`). */
    let pedidoFinal = `${corpo}\n${rodape}`;
    try {
      const fecho = fechoDoPedido(pedidoEsc);
      if (fecho) pedidoFinal = `${nota ? nota + "\n" : ""}${rodape}\n${fecho}`;
    } catch (e) { calou("a frase do jogador por último", e); }
    const novoHist = [...base, { role: "user", content: pedidoFinal }];
    /* ---------------- O PROMPT SE REFAZ A CADA TURNO (v9.54) ----------------
       Enquanto o prompt era o mesmo em toda cena, remontá-lo em onze eventos
       espalhados bastava. Com as portas da cena isso deixou de bastar, e o
       modo de falhar era o pior possível: um combate que abrisse DEPOIS da
       última remontagem subiria sem as regras de terreno, de economia de
       ação e de aflição — o Mestre inventaria as três, e ninguém saberia
       por quê.

       Remontar aqui custa uma concatenação de sessenta mil caracteres, que
       é ruído perto da chamada de rede que vem a seguir. Os onze pontos
       antigos continuam onde estavam: eles servem ao caso em que o prompt
       muda sem haver turno (recalibrar, carregar save). */
    $ref.system = montarSystemPrompt(
      $ref.nomeCampanha || $render.nomeCampanha, mundoAtual(), persAtual || $ref.personagem || $render.personagem,
      $ref.canone, { ...$ref.bancoNomes, elenco: (() => { try { if (calaNaMasmorra("povoar", $ref.masmorra)) return []; /* MM17 C2: a gente por conhecer é a da cidade */ const povo = elencoParaPovoar(sementeMundo(), $ref.mapa, { ...contextoDoElenco(), dia: $ref.dia, cidade: $ref.cidadeAtual, npcs: $ref.npcs }); /* onda 3: só quem é daqui (ou o turno cita), e sem repetir a gente da cidade */ try { return genteParaPovoarAqui(povo, $ref.relevancia, $ref.cidadeAtual, $ref.genteDaqui); } catch (e) { calou("a gente por conhecer daqui", e); return povo; } } catch (e) { calou("elencoParaPovoar", e); return []; } })() },
      (resumoMapaParaPrompt($ref.mapa, $ref.faccaoJogador) + "\n" + resumoDiplomacia($ref.mapa, $ref.faccaoJogador)).trim(),
      resumoDoArco(), resumoQuests($ref.quests), npcsDoTurno != null ? npcsDoTurno : resumoNPCsParaPrompt($ref.npcs, undefined, { grupo: (persAtual || $ref.personagem || $render.personagem || {}).grupo || [], elenco: nomesDoElenco(), vistos: $ref.elenco.vistos, emCena: (() => { try { const c = ($ref.mensagens || []).filter((m) => m && m.autor === "mestre").slice(-2).map((m) => m.texto).join(" "); return Object.keys($ref.npcs || {}).filter((n) => c.includes(n)); } catch (e) { calou("emCena das pessoas", e); return []; } })(), missao: (() => { try { return ($ref.missoes || []).filter((m) => m && m.status === "ativa").flatMap((m) => [m.dador, ...(m.etapas || []).map((e) => e && e.alvo)]).filter(Boolean); } catch (e) { calou("missao das pessoas", e); return []; } })() }),
      tempoInfoPrompt(), infoDivindade(), infoTitulo(), cenaDoPrompt(),
      /* MM8c-1: o cânone lê a recência do registo para decidir quem sai do teto; MM8c-2: e o elenco, para pesar igual */
      { npcs: $ref.npcs, elenco: nomesDoElenco(), relevancia: $ref.relevancia }, /* onda 3: e o cânone pela relevância do turno */
    );
    return { base, combateAntes, corpo, nota, novoHist, pauta };
  };
  let saida;
  try { saida = comSorte($in.sorte, montar); } finally { descarregar(); }
  /* O PEDIDO À REDE, como `chamarMestre` o arruma: a janela ancorada e a
     ordem do cache; se a arrumação estourar, vai como vinha. */
  const system = $ref.system;
  let pedido = { system, messages: janelaAncorada(saida.novoHist) };
  try { pedido = pedidoNaOrdemDoCache(system, pedido.messages); } catch (e) { calou("o pedido na ordem do cache", e); }
  return { pedido: { system: pedido.system, messages: pedido.messages, ...PEDIDO_AO_NARRADOR }, saida, escritas };
}
