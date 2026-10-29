/* ============================================================
   O PRELÚDIO DO TURNO, NO MOTOR (Fase 4, trilha B, 29/10/2026) — src/motor/preludio-do-turno.js

   O terceiro passo da ordem do inventário (14bde83, mente/diario.md) para o
   `/api/turno`. A pauta (pauta-do-turno.js) e o pedido ao Narrador
   (pedido-do-turno.js) já eram peças; o pedido lê onze entradas
   (`ENTRADA_DO_PEDIDO`) que `enviar` escrevia ANTES dele, e eram o que
   ainda prendia o pedido ao navegador. Esta peça é esse trecho: da frase
   que é pedido meu (`ultimoPedido`) às bocas (`falasDoTurno`) — o chão que
   se varre, a oficina que vira bilhete, a chegada sozinha, a caminhada na
   cidade, a escuta que lê o pedido, o compasso, a forma da cena, a frente
   que anda uma rodada, a virada (a caçada, a volta ao território, a
   missão que vira), a trama nova, o ato do herói, o Intérprete, os
   propósitos, as cinco mãos (`mexerNa*`) e as falas.

   Vem À LETRA, como as outras duas: o trecho e as funções do componente
   que ele chama (o fecho, pela árvore do @babel/parser), com as mesmas
   trocas mecânicas — `xRef.current` → `$ref.<campo>`, o estado React →
   `$render`, `useCallback(f, deps)` → `f` — e estas PORTAS, que são o que
   o servidor injeta e o App já tem:
     - `pushMsgs`, os setters do React, `salvar` (a tela e o disco: o App
       passa os seus; o servidor junta o que vier e devolve o estado);
     - `chamarModelo` (a rede das BOCAS, as falas pagas: com
       `BOCAS_POR_TURNO` a 0, falas.js, ninguém a chama — e sem porta a
       boca cala, como cala no App quando a rede falha);
     - `interprete` (o Intérprete: sem porta é o de interprete.js, o mesmo
       do App; o servidor pode dar o seu);
     - `adiar` (o `setTimeout` do App: o que ele empurra para depois do
       turno — a presença na luta que se abriu. Sem porta, corre no fim
       desta peça);
     - `agora` (o `Date.now` do App: só chaveia a faixa da chegada);
     - `calou`, e `aplicar` (o que se escreveu chega ao App antes de cada
       porta que lhe dá a palavra, e no fim — também quando estoura).

   A SAÍDA é `entradaDoPedido`: o que `oPedidoDoTurno` recebe — a frase, a
   ficha do clique e o histórico-base que passam, e as oito que o trecho
   escreve. Encadeadas, as duas peças dão o pedido inteiro a partir de
   { estado, frase } e das portas: `oPedidoDoTurno({ ...estado,
   ...escritas }, entradaDoPedido, portas)`, com a mesma `sorte`.

   A SORTE: `entrada.sorte` (gerador semeado) corre a parte síncrona dentro
   de `comSorte`; sem ela, a da casa, como no App (que a semeia no envio).
   As bocas esperam a rede depois disso, e não sorteiam.

   UM ACHADO, À LETRA: o componente do App NÃO declara `setHistoria` (é da
   `TelaMundo`), e três funções deste fecho chamam-no — no App a chamada
   estoura com ReferenceError (e o que vinha depois dela não corre). A peça
   faz o mesmo, de propósito: consertar é da trilha A, no App, e a peça
   segue-o no dia em que ele mudar.

   A prova é testes/teste-motor-preludio-do-turno.mjs: o recorte do App de
   HEAD (preludio-dourado.json) e esta peça sobre os casos, e a cadeia das
   duas peças contra os dois recortes nos mesmos refs — o pedido à rede
   byte a byte.
   ============================================================ */

import { garantirAbertura, muralLiberado, tramaTemEspaco } from "../abertura.js";
import { arredoresDaCidade } from "../arredores.js";
import { consultarBiblioteca, contarTurnoDeCena, envelopeDaCena, garantirEstante, marcarJogada, podeFormaDeCena, trechoDaJogada, zerarCadenciaDaCena } from "../biblioteca.js";
import { chegadaABoca } from "../boca.js";
import { AMANHECER, dataTxt, ehNoite, estacaoDe, festivalDe, horaTxt } from "../calendario.js";
import { elencoDaCena } from "../cena.js";
import { cenarioAtivo } from "../cenario.js";
import { criarChao } from "../chao.js";
import { ECONOMIA_ACAO_PROMPT, acoesBonusDe, patamarDe, perfilCombate, resumoAcaoDeTurno } from "../combate.js";
import { comodosDoLocal } from "../comodos.js";
import { avancarCompasso, envelopeDoCompasso, garantirCompasso, resumoCompasso } from "../compasso.js";
import { CONTADORES_INICIAIS, avaliarConquistas } from "../conquistas.js";
import { ATRIBUTOS } from "../constantes.js";
import { garantirCorreio, processarDiaCorreio } from "../correio.js";
import { comoComponente } from "../craft.js";
import { DEVOCAO_PROMPT, alvosFelicidade, fieisTotais, processarDiaFe, resumoFePrompt } from "../devocao.js";
import { garantirDiplomacia, golpeDaGuerra, mexerNoApreco, potenciasDoMundo } from "../diplomacia.js";
import { CAMINHOS_PROMPT, DIVINDADE_PROMPT, garantirDivindade, grauDe, pfMaximo, pfPorDia, resumoAscensao, tituloDe, tituloDoHeroi } from "../divindades.js";
import { bonusDeObras, envelopeDaTomada, equilibrioDe, humorAoTomar, obraPronta, pulsoDaFuria, revoltaAgora, terminarObra, tomadaPronta } from "../dominios.js";
import { agirForaDeCena, boatoDoForaDeCena, garantirElencoDoSave, promoverNoDia } from "../elenco.js";
import { garantirEscada, subirEscada } from "../encalhe.js";
import { avancarEpisodio, cenaResolvida, episodioQueAbre, garantirEpisodio, sementesDoEpisodio } from "../episodios.js";
import { resumoErmos } from "../ermos.js";
import { fioDaHistoria, garantirEscuta } from "../escuta.js";
import { bocasDoTurno, dossieDe, falaDaResposta, pedidoDoAtor, promptDoAtor } from "../falas.js";
import { calcularFama, patamarFama, rumorDoDia } from "../fama.js";
import { bandoAoVoltar, folegoSegura, relogioDoTerritorio } from "../fuga.js";
import { gatilhosDe } from "../gatilhos.js";
import { cidadesPisadas, descobrirCidade, pisarNaCidade } from "../geografia.js";
import { dominiosDe } from "../gestao.js";
import { cobrarNaVirada, envelopeDaMemoria, registrarGesto } from "../gesto.js";
import { ehMagiaDoGrimorio } from "../grimorio.js";
import { CRESCE, DESFECHO_TAREFA, conferirLeisDaCasa, contribuirNaCasa, crescerACasa, punirNaCasa, resolverTarefaDaCasa, sangueEntreCasas } from "../guildas.js";
import { temRegraPropria } from "../habilidades.js";
import { capituloFechado, casarComVilao, envelopeDeVirada, envelopeDoCapitulo, estruturaPorId, fecharCapitulo, garantirHistoria, linhaDoCapitulo, registrarMarco, resumoHistoria, resumoQuests } from "../historia.js";
import { dispararProposito, indoleDe } from "../indole.js";
import { atoDoTexto, paraPauta as interpreteParaPauta, jaMeViuAntes, marcarMovimento } from "../interprete.js";
import { invocacaoDe, invocacoesDe } from "../invocacoes.js";
import { resumoLegadoPrompt } from "../legado.js";
import { linhaDeLugar, lugarPedido } from "../lugar.js";
import { temCaderno } from "../magias.js";
import { cidadesDominadas, resumoDiplomacia, resumoMapaParaPrompt } from "../mapa.js";
import { cenaNaMasmorra } from "../masmorra-sem-cidade.js";
import { garantirMesa, pilarFaminto, pilarRepetido, temperaturaDaMesa } from "../mestria.js";
import { criarMissao, ativas as missoesAtivas, resumoMissoesPrompt, tipoDef as tipoMissao } from "../missoes.js";
import { MODO_PADRAO } from "../modos.js";
import { MOLDE_PADRAO, moldePorId, resumoMoldePrompt } from "../moldes.js";
import { oChaoDaCena, oPedidoDaEscuta } from "./antes-do-mestre.js";
import { notaComOTurno } from "./aplicar.js";
import { aFamaDoFeito, abrirOCombate, somarAoContador, surgirANemesis } from "./combate-do-turno.js";
import { oEnvelopeDaFe, oEnvelopeDaGente, oEnvelopeDaViagem, oEnvelopeDoCaminho, oEnvelopeDoDominio, oEnvelopeDoFio, oEnvelopeDoMundo } from "./envelopes-do-turno.js";
import { arcoComOMarco, nevoaDaVizinhanca } from "./meio-do-turno.js";
import { CONTAGEM_VAZIA, pontoDaSorte as pontoDaSorteDe, sorteNoPonto } from "./sorte-do-turno.js";
import { aCidadeSobOsPes, comAExaustao, oCorpoNoRelogio, oPassoNaCidade, osMinutosAndam } from "./tempo-do-turno.js";
import { chaveDoLugar, cumprirProposito, garantirBase, locaisDaCidade, masmorrasDoMundo, oQueExisteAqui, propositoCumprido } from "../mundo-base.js";
import { nomePessoa } from "../nomes.js";
import { TIPOS_DE_LACO, comLaco, criarNPC, firmarEntre, firmarLaco, garantirLaco, paresEntre, relacaoNPC, resumoNPCsParaPrompt, romperLaco } from "../npcs.js";
import { bilheteDaOficina, criarOficina } from "../oficina.js";
import { promessaEmAberto } from "../palavra-dada.js";
import { resumoPericiasPrompt } from "../pericias.js";
import { pesoDaCena, seguraOCompasso } from "../peso.js";
import { derivarPostura, garantirPosturaAtiva } from "../posturas.js";
import { presencaDoHeroiEmCombate, resolverPresenca } from "../presenca-divina.js";
import { resumoProfissaoPrompt } from "../profissoes.js";
import { garantirLivro, pagar, regar, semear } from "../promessas.js";
import { garantirPrometido } from "../prometido.js";
import { SINAIS_ABERTOS, montarSystemPrompt } from "../prompt.js";
import { prontoPorId } from "../prontos.js";
import { envelopeDaRodada, envelopeDoRompimento, papelPorId, portePorId, rodadaDaFrente } from "../raids.js";
import { idaAMasmorra } from "../rastro.js";
import { atributoEfetivo } from "../regras-jogo.js";
import { bonusProficiencia, ehProficiente, resumoEpico } from "../regras.js";
import { processarDiaReino } from "../reino.js";
import { barraDe } from "../relogios.js";
import { alvoDaForma, diasEntreRegasDe, elegerReviravoltas, garantirReviravolta, maiorPodeNascer, menorPodeNascer, oDiaSeguinte, quemPodeRevelar, revelacaoDe, sementesDaReviravolta } from "../reviravoltas.js";
import { caiuOFio, fatosQueFecham, garantirEspinha, oRostoEspera, progressoDoAto } from "../saga.js";
import { LUGARES, ocupados as ocupadosDaSala } from "../sala.js";
import { hashSemente, sorteDaCasa } from "../semente.js";
import { resumoSintoniaPrompt } from "../sintonia.js";
import { folegoDaLeitura, lerTermometro } from "../termometro.js";
import { avancarFase as avancarFaseTorneio, correrForaDeTela, epilogar, faseCompleta, registrarMinhaLuta } from "../torneio.js";
import { envelopeDaTrama, envelopeDoQueVira, intencaoDaTramaPorId, montarTrama, quemPede, viradaDevida } from "../tramas.js";
import { tetoDoMarco, veredito as vereditoDaNoite } from "../uma-noite.js";
import { HORAS_MARCHA_POR_DIA, jornadaSemDestino, linhaDaViagem, progressoDaViagem } from "../viagem.js";
import { TOTAL_DE_PASSOS, avancarPlano, envelopeDaQueda, envelopeDaQuedaCedoDemais, envelopeDoAvanco, escolherAlvo, faseDe, garantirVilao, levaForma, linhaDaQueda, linhaDoAvanco as linhaDoVilao, podeAvancar, podeCair } from "../vilao.js";
import { VINCULO_INICIAL, linhaDoVinculo } from "../vinculos.js";
import { comSorte } from "../semente.js";

/* OS REFS QUE O PRELÚDIO TOCA — um por campo, como na pauta e no pedido: o
   nome do ref no App, se o save o guarda (o campo é o do save; senão é o do
   ref), se o prelúdio o escreve, e o valor de partida (o mesmo
   `useRef(...)` do App). */
export const REFS_DO_PRELUDIO = Object.freeze({
  abertura: Object.freeze({ ref: "aberturaMundoRef", salvo: true, escreve: false, padrao: () => (garantirAbertura(null)) }),
  acampado: Object.freeze({ ref: "acampadoRef", salvo: true, escreve: false, padrao: () => (false) }),
  acordouAbs: Object.freeze({ ref: "acordouAbsRef", salvo: true, escreve: false, padrao: () => (0) }),
  atoDoTurno: Object.freeze({ ref: "atoDoTurnoRef", salvo: false, escreve: true, padrao: () => ("nada") }),
  bancoNomes: Object.freeze({ ref: "bancoNomesRef", salvo: false, escreve: false, padrao: () => (null) }),
  baseMundo: Object.freeze({ ref: "baseMundoRef", salvo: true, escreve: true, padrao: () => (garantirBase(null)) }),
  cacadasFeitas: Object.freeze({ ref: "cacadasFeitasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  canone: Object.freeze({ ref: "canoneRef", salvo: true, escreve: true, padrao: () => ({}) }),
  chao: Object.freeze({ ref: "chaoRef", salvo: true, escreve: true, padrao: () => (criarChao()) }),
  chegadaInferida: Object.freeze({ ref: "chegadaInferidaRef", salvo: false, escreve: true, padrao: () => ("") }),
  cidadeAtual: Object.freeze({ ref: "cidadeAtualRef", salvo: true, escreve: true, padrao: () => ("") }),
  cobrouAgora: Object.freeze({ ref: "cobrouAgoraRef", salvo: false, escreve: false, padrao: () => (false) }),
  combate: Object.freeze({ ref: "combateRef", salvo: true, escreve: true, padrao: () => (null) }),
  combateOcioso: Object.freeze({ ref: "combateOciosoRef", salvo: false, escreve: true, padrao: () => (0) }),
  compasso: Object.freeze({ ref: "compassoRef", salvo: true, escreve: true, padrao: () => (garantirCompasso(null)) }),
  confidencias: Object.freeze({ ref: "confidenciasRef", salvo: true, escreve: false, padrao: () => ([]) }),
  conquistas: Object.freeze({ ref: "conqRef", salvo: true, escreve: true, padrao: () => ({ desbloqueadas: {}, ordem: [] }) }),
  contadores: Object.freeze({ ref: "contRef", salvo: true, escreve: true, padrao: () => ({ ...CONTADORES_INICIAIS }) }),
  contagemDaSorte: Object.freeze({ ref: "contagemDaSorteRef", salvo: false, escreve: true, padrao: () => (CONTAGEM_VAZIA) }),
  correio: Object.freeze({ ref: "correioRef", salvo: true, escreve: true, padrao: () => ({ enviadas: [], recebidas: [], historico: [], tratados: [], seq: 1 }) }),
  correioMsgsDia: Object.freeze({ ref: "correioMsgsDiaRef", salvo: false, escreve: true, padrao: () => ([]) }),
  danoJaAplicado: Object.freeze({ ref: "danoJaAplicadoRef", salvo: false, escreve: true, padrao: () => (false) }),
  derrotadosDaSessao: Object.freeze({ ref: "derrotadosDaSessaoRef", salvo: false, escreve: false, padrao: () => ([]) }),
  descobertas: Object.freeze({ ref: "descobRef", salvo: true, escreve: true, padrao: () => ([]) }),
  devocao: Object.freeze({ ref: "devocaoRef", salvo: true, escreve: true, padrao: () => ({ cidades: {}, andarilhos: 0 }) }),
  dia: Object.freeze({ ref: "diaRef", salvo: true, escreve: true, padrao: () => (1) }),
  diaLuta: Object.freeze({ ref: "diaLutaRef", salvo: true, escreve: true, padrao: () => ({ gasto: 0, lutas: 0 }) }),
  diplomacia: Object.freeze({ ref: "diplomaciaRef", salvo: true, escreve: true, padrao: () => (garantirDiplomacia(null)) }),
  divindade: Object.freeze({ ref: "divindadeRef", salvo: true, escreve: true, padrao: () => (garantirDivindade(null)) }),
  elenco: Object.freeze({ ref: "elencoSaveRef", salvo: true, escreve: true, padrao: () => (garantirElencoDoSave(null)) }),
  elencoMem: Object.freeze({ ref: "elencoMemRef", salvo: true, escreve: true, padrao: () => ({}) }),
  episodio: Object.freeze({ ref: "episodioRef", salvo: true, escreve: true, padrao: () => (null) }),
  escada: Object.freeze({ ref: "escadaRef", salvo: true, escreve: true, padrao: () => (garantirEscada(null)) }),
  escuta: Object.freeze({ ref: "escutaRef", salvo: true, escreve: false, padrao: () => (garantirEscuta(null)) }),
  espinha: Object.freeze({ ref: "espinhaRef", salvo: true, escreve: false, padrao: () => (garantirEspinha(null)) }),
  estante: Object.freeze({ ref: "estanteRef", salvo: true, escreve: true, padrao: () => (garantirEstante(null)) }),
  eventos: Object.freeze({ ref: "eventosRef", salvo: true, escreve: true, padrao: () => ({ locais: [], global: null, semGlobalDesde: 0, seq: 1 }) }),
  expiracoesSeguidas: Object.freeze({ ref: "expiracoesSeguidasRef", salvo: false, escreve: true, padrao: () => (0) }),
  faccaoJogador: Object.freeze({ ref: "faccaoJogadorRef", salvo: true, escreve: true, padrao: () => ("") }),
  falasDoTurno: Object.freeze({ ref: "falasDoTurnoRef", salvo: false, escreve: true, padrao: () => ([]) }),
  falouCom: Object.freeze({ ref: "falouComRef", salvo: false, escreve: false, padrao: () => ([]) }),
  famaPatamar: Object.freeze({ ref: "famaPatamarRef", salvo: true, escreve: true, padrao: () => (0) }),
  fatosDoPeso: Object.freeze({ ref: "fatosDoPesoRef", salvo: false, escreve: true, padrao: () => ({}) }),
  folego: Object.freeze({ ref: "folegoRef", salvo: false, escreve: false, padrao: () => (null) }),
  genteNaPauta: Object.freeze({ ref: "genteNaPautaRef", salvo: false, escreve: false, padrao: () => (null) }),
  gestos: Object.freeze({ ref: "gestosRef", salvo: true, escreve: true, padrao: () => ([]) }),
  governos: Object.freeze({ ref: "governosRef", salvo: true, escreve: true, padrao: () => ({}) }),
  guilda: Object.freeze({ ref: "guildaRef", salvo: true, escreve: true, padrao: () => ({ nivel: 1, cofre: 0 }) }),
  guildas: Object.freeze({ ref: "guildasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  habUsada: Object.freeze({ ref: "habUsadaRef", salvo: false, escreve: true, padrao: () => (false) }),
  historia: Object.freeze({ ref: "historiaRef", salvo: true, escreve: true, padrao: () => (garantirHistoria({ estrutura: "jornada", etapa: 0 })) }),
  intencoesFeitas: Object.freeze({ ref: "intencoesFeitasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  interprete: Object.freeze({ ref: "interpreteRef", salvo: false, escreve: true, padrao: () => (null) }),
  jornada: Object.freeze({ ref: "jornadaRef", salvo: true, escreve: true, padrao: () => (null) }),
  jornadaInferida: Object.freeze({ ref: "jornadaInferidaRef", salvo: false, escreve: true, padrao: () => ("") }),
  lugar: Object.freeze({ ref: "lugarRef", salvo: true, escreve: true, padrao: () => (null) }),
  mapa: Object.freeze({ ref: "mapaRef", salvo: true, escreve: true, padrao: () => ({ cidades: [], faccoes: [] }) }),
  masmorra: Object.freeze({ ref: "masmorraRef", salvo: true, escreve: false, padrao: () => (null) }),
  mensagens: Object.freeze({ ref: "mensagensRef", salvo: true, escreve: false, padrao: () => ([]) }),
  mesa: Object.freeze({ ref: "mesaRef", salvo: true, escreve: false, padrao: () => (garantirMesa(null)) }),
  minuto: Object.freeze({ ref: "minutoRef", salvo: true, escreve: true, padrao: () => (AMANHECER + 60) }),
  missoes: Object.freeze({ ref: "missoesRef", salvo: true, escreve: true, padrao: () => ([]) }),
  modo: Object.freeze({ ref: "modoRef", salvo: true, escreve: false, padrao: () => (MODO_PADRAO) }),
  mundo: Object.freeze({ ref: "mundoRef", salvo: false, escreve: false, padrao: () => (null) }),
  nemesis: Object.freeze({ ref: "nemesisRef", salvo: true, escreve: true, padrao: () => (null) }),
  noite: Object.freeze({ ref: "noiteRef", salvo: true, escreve: true, padrao: () => (null) }),
  nomeCampanha: Object.freeze({ ref: "nomeCampanhaRef", salvo: false, escreve: false, padrao: () => ("") }),
  nota: Object.freeze({ ref: "notaRef", salvo: false, escreve: true, padrao: () => ("") }),
  npcs: Object.freeze({ ref: "npcsRef", salvo: true, escreve: true, padrao: () => ({}) }),
  npcTurno: Object.freeze({ ref: "npcTurnoRef", salvo: false, escreve: true, padrao: () => (0) }),
  oficina: Object.freeze({ ref: "oficinaRef", salvo: false, escreve: true, padrao: () => (criarOficina()) }),
  personagem: Object.freeze({ ref: "personagemRef", salvo: false, escreve: true, padrao: () => (null) }),
  portao: Object.freeze({ ref: "portaoRef", salvo: false, escreve: true, padrao: () => (null) }),
  portaoCtx: Object.freeze({ ref: "portaoCtxRef", salvo: false, escreve: true, padrao: () => (null) }),
  postura: Object.freeze({ ref: "posturaRef", salvo: true, escreve: true, padrao: () => (garantirPosturaAtiva(null)) }),
  promessas: Object.freeze({ ref: "promessasRef", salvo: true, escreve: true, padrao: () => (garantirLivro(null)) }),
  prometido: Object.freeze({ ref: "prometidoRef", salvo: true, escreve: false, padrao: () => (garantirPrometido(null)) }),
  propositosDoTurno: Object.freeze({ ref: "propositosDoTurnoRef", salvo: false, escreve: true, padrao: () => ([]) }),
  quests: Object.freeze({ ref: "questsRef", salvo: true, escreve: false, padrao: () => ([]) }),
  raid: Object.freeze({ ref: "raidRef", salvo: true, escreve: true, padrao: () => (null) }),
  reacaoUsada: Object.freeze({ ref: "reacaoUsadaRef", salvo: false, escreve: true, padrao: () => (false) }),
  registro: Object.freeze({ ref: "registroRef", salvo: true, escreve: false, padrao: () => ([]) }),
  reino: Object.freeze({ ref: "reinoRef", salvo: true, escreve: true, padrao: () => ({}) }),
  relogios: Object.freeze({ ref: "relogiosRef", salvo: true, escreve: false, padrao: () => ([]) }),
  reviravolta: Object.freeze({ ref: "reviravoltaRef", salvo: true, escreve: true, padrao: () => (null) }),
  reviravoltaMaior: Object.freeze({ ref: "reviravoltaMaiorRef", salvo: true, escreve: true, padrao: () => (null) }),
  sala: Object.freeze({ ref: "salaRef", salvo: false, escreve: false, padrao: () => (null) }),
  segredosRevelados: Object.freeze({ ref: "segredosReveladosRef", salvo: false, escreve: false, padrao: () => ([]) }),
  sinaisDoTurno: Object.freeze({ ref: "sinaisDoTurnoRef", salvo: false, escreve: false, padrao: () => (SINAIS_ABERTOS) }),
  sinalMasmorra: Object.freeze({ ref: "sinalMasmorraRef", salvo: false, escreve: true, padrao: () => (null) }),
  sinalRaid: Object.freeze({ ref: "sinalRaidRef", salvo: false, escreve: true, padrao: () => (null) }),
  sinalViagem: Object.freeze({ ref: "sinalViagemRef", salvo: false, escreve: true, padrao: () => (null) }),
  system: Object.freeze({ ref: "systemRef", salvo: false, escreve: true, padrao: () => ("") }),
  tarefasCasa: Object.freeze({ ref: "tarefasCasaRef", salvo: true, escreve: true, padrao: () => ([]) }),
  territorioEmLuta: Object.freeze({ ref: "territorioEmLutaRef", salvo: false, escreve: true, padrao: () => (null) }),
  textura: Object.freeze({ ref: "texturaRef", salvo: false, escreve: true, padrao: () => ({}) }),
  tomando: Object.freeze({ ref: "tomandoRef", salvo: true, escreve: true, padrao: () => (null) }),
  torneio: Object.freeze({ ref: "torneioRef", salvo: true, escreve: true, padrao: () => (null) }),
  tramasFeitas: Object.freeze({ ref: "tramasFeitasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  turnoDeRegistro: Object.freeze({ ref: "turnoDeRegistroRef", salvo: false, escreve: false, padrao: () => (0) }),
  ultimaAcao: Object.freeze({ ref: "ultimaAcaoRef", salvo: false, escreve: true, padrao: () => ("") }),
  ultimoPedido: Object.freeze({ ref: "ultimoPedidoRef", salvo: false, escreve: true, padrao: () => ("") }),
  ultimoPeso: Object.freeze({ ref: "ultimoPesoRef", salvo: false, escreve: false, padrao: () => ({ peso: null, dia: 0 }) }),
  veredito: Object.freeze({ ref: "vereditoRef", salvo: false, escreve: true, padrao: () => (null) }),
});

/* O ESTADO REACT QUE O PRELÚDIO LÊ: o do último render, em `estado.render`;
   sem ele, o do estado. */
export const RENDER_DO_PRELUDIO = Object.freeze(["mundo","nomeCampanha","personagem"]);

/* O QUE O PRELÚDIO ENTREGA AO PEDIDO, na ordem de `ENTRADA_DO_PEDIDO`: as
   três que passam (a frase, a ficha deste clique, o histórico-base) e as
   oito que o trecho escreve. */
export const SAIDA_DO_PRELUDIO = Object.freeze(["frase", "persAtual", "histBase", ...["oficina","doCompasso","formaDaCena","daFrente","daVirada","daTrama","pedidoEsc","fioEsc"]]);

/* AS PORTAS, pelo nome: o que o App (ou o servidor) dá a esta peça. */
export const PORTAS_DO_PRELUDIO = Object.freeze(["aplicar", "calou", "pushMsgs", "salvar", "chamarModelo", "interprete", "adiar", "agora", ...["setBaseMundo","setChao","setChegada","setCombate","setConquistas","setCorreio","setDescobertas","setDevocao","setDia","setDiploState","setDivindade","setEspolioRevelado","setEventos","setFase","setGovernos","setGuilda","setGuildasMundo","setJornada","setLugar","setLugarNovo","setMapa","setMinuto","setMissoes","setNemesis","setNpcs","setOfertaCapitulo","setPersonagem","setQuests","setRaid","setReino","setTarefasCasa","setTomando"]]);

/* ---------------- o que é do módulo do App, à letra ---------------- */


/* ============================================================
   O PRELÚDIO DO TURNO
   oPreludioDoTurno(estado, entrada, portas) → Promise<{ entradaDoPedido, escritas }>
   ============================================================ */
export async function oPreludioDoTurno(estado, entrada, portas) {
  const $E = estado && typeof estado === "object" ? estado : {};
  const $P = portas && typeof portas === "object" ? portas : {};
  const $in = entrada && typeof entrada === "object" ? entrada : {};
  const $render0 = $E.render && typeof $E.render === "object" ? $E.render : {};
  const escritas = {};
  let pendentes = {};
  const partida = {};
  /* O App MUDA POR DENTRO o que está nos refs (o push na lista do correio,
     a virada gravada na missão — `m.virada = …` num elemento da lista), e
     à letra a peça faz o mesmo. Para o estado que entra não mudar, cada
     campo que é objeto é COPIADO na primeira leitura (e a foto dele
     guardada); o que mudou por dentro sem ser reescrito vira escrita antes
     de cada porta e no fim — o App vê o mesmo que veria no ref dele. */
  const $copias = {};
  const copiar = (c, v0) => {
    if (!v0 || typeof v0 !== "object") return v0;
    $copias[c] = { v: structuredClone(v0), foto: JSON.stringify(v0) };
    return $copias[c].v;
  };
  const lerCampo = (c) => {
    if (Object.prototype.hasOwnProperty.call(escritas, c)) return escritas[c];
    if (c in $copias) return $copias[c].v;
    if ($E[c] !== undefined) return copiar(c, $E[c]);
    if (!REFS_DO_PRELUDIO[c]) return undefined;
    if (!(c in partida)) partida[c] = copiar(c, REFS_DO_PRELUDIO[c].padrao());
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
  /* o valor de partida de cada estado React (o argumento do useState do
     App, que pode ler um ref): é o que o render tem quando nem ele nem o
     estado o trazem */
  const $partidaDoRender = {
    mundo: () => (null),
    nomeCampanha: () => (""),
    personagem: () => (null),
  };
  const $render = {};
  for (const n of RENDER_DO_PRELUDIO) {
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
  /* o pushMsgs do App escreve as mensagens (carimbadas pela luta) e o
     prelúdio relê-as logo a seguir (o ponto da sorte conta as falas): a
     porta DEVOLVE a lista nova, e ela entra nas escritas sem voltar ao App;
     sem lista devolvida (o servidor), a peça junta as novas ela mesma */
  const pushMsgs = (novas) => {
    descarregar();
    const lista = typeof $P.pushMsgs === "function" ? $P.pushMsgs(novas) : undefined;
    if (Array.isArray(lista)) { escritas.mensagens = lista; delete $copias.mensagens; }
    else $ref.mensagens = [...($ref.mensagens || []), ...(Array.isArray(novas) ? novas : [])];
  };
  const salvar = (extra) => { descarregar(); if (typeof $P.salvar === "function") $P.salvar(extra); };
  const setBaseMundo = (v) => { descarregar(); if (typeof $P.setBaseMundo === "function") $P.setBaseMundo(v); };
  const setChao = (v) => { descarregar(); if (typeof $P.setChao === "function") $P.setChao(v); };
  const setChegada = (v) => { descarregar(); if (typeof $P.setChegada === "function") $P.setChegada(v); };
  const setCombate = (v) => { descarregar(); if (typeof $P.setCombate === "function") $P.setCombate(v); };
  const setConquistas = (v) => { descarregar(); if (typeof $P.setConquistas === "function") $P.setConquistas(v); };
  const setCorreio = (v) => { descarregar(); if (typeof $P.setCorreio === "function") $P.setCorreio(v); };
  const setDescobertas = (v) => { descarregar(); if (typeof $P.setDescobertas === "function") $P.setDescobertas(v); };
  const setDevocao = (v) => { descarregar(); if (typeof $P.setDevocao === "function") $P.setDevocao(v); };
  const setDia = (v) => { descarregar(); if (typeof $P.setDia === "function") $P.setDia(v); };
  const setDiploState = (v) => { descarregar(); if (typeof $P.setDiploState === "function") $P.setDiploState(v); };
  const setDivindade = (v) => { descarregar(); if (typeof $P.setDivindade === "function") $P.setDivindade(v); };
  const setEspolioRevelado = (v) => { descarregar(); if (typeof $P.setEspolioRevelado === "function") $P.setEspolioRevelado(v); };
  const setEventos = (v) => { descarregar(); if (typeof $P.setEventos === "function") $P.setEventos(v); };
  const setFase = (v) => { descarregar(); if (typeof $P.setFase === "function") $P.setFase(v); };
  const setGovernos = (v) => { descarregar(); if (typeof $P.setGovernos === "function") $P.setGovernos(v); };
  const setGuilda = (v) => { descarregar(); if (typeof $P.setGuilda === "function") $P.setGuilda(v); };
  const setGuildasMundo = (v) => { descarregar(); if (typeof $P.setGuildasMundo === "function") $P.setGuildasMundo(v); };
  const setJornada = (v) => { descarregar(); if (typeof $P.setJornada === "function") $P.setJornada(v); };
  const setLugar = (v) => { descarregar(); if (typeof $P.setLugar === "function") $P.setLugar(v); };
  const setLugarNovo = (v) => { descarregar(); if (typeof $P.setLugarNovo === "function") $P.setLugarNovo(v); };
  const setMapa = (v) => { descarregar(); if (typeof $P.setMapa === "function") $P.setMapa(v); };
  const setMinuto = (v) => { descarregar(); if (typeof $P.setMinuto === "function") $P.setMinuto(v); };
  const setMissoes = (v) => { descarregar(); if (typeof $P.setMissoes === "function") $P.setMissoes(v); };
  const setNemesis = (v) => { descarregar(); if (typeof $P.setNemesis === "function") $P.setNemesis(v); };
  const setNpcs = (v) => { descarregar(); if (typeof $P.setNpcs === "function") $P.setNpcs(v); };
  const setOfertaCapitulo = (v) => { descarregar(); if (typeof $P.setOfertaCapitulo === "function") $P.setOfertaCapitulo(v); };
  const setPersonagem = (v) => { descarregar(); if (typeof $P.setPersonagem === "function") $P.setPersonagem(v); };
  const setQuests = (v) => { descarregar(); if (typeof $P.setQuests === "function") $P.setQuests(v); };
  const setRaid = (v) => { descarregar(); if (typeof $P.setRaid === "function") $P.setRaid(v); };
  const setReino = (v) => { descarregar(); if (typeof $P.setReino === "function") $P.setReino(v); };
  const setTarefasCasa = (v) => { descarregar(); if (typeof $P.setTarefasCasa === "function") $P.setTarefasCasa(v); };
  const setTomando = (v) => { descarregar(); if (typeof $P.setTomando === "function") $P.setTomando(v); };
  /* a rede das bocas: sem porta, a boca cala (como no App quando a rede falha) */
  const chamarModelo = (...args) => (typeof $P.chamarModelo === "function" ? $P.chamarModelo(...args) : Promise.reject(new Error("sem rede")));
  const $interprete = typeof $P.interprete === "function" ? $P.interprete : interpreteParaPauta;
  const $agora = typeof $P.agora === "function" ? $P.agora : () => Date.now();
  /* o `setTimeout` do App: o que ele adia para depois do turno */
  const $adiados = [];
  const setTimeout = (f) => {
    const g = () => { try { f(); } finally { descarregar(); } };
    if (typeof $P.adiar === "function") $P.adiar(g); else $adiados.push(g);
    return $adiados.length;
  };
  /* o componente do App não declara `setHistoria`: a chamada estoura lá, e aqui */
  const setHistoria = () => { throw new ReferenceError("setHistoria is not defined"); };

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
  const mudarFicha = (fn) => {
    const base = $ref.personagem || $render.personagem;
    if (!base) return base;
    const novo = typeof fn === "function" ? fn(base) : fn;
    if (!novo) return base;
    $ref.personagem = novo;
    setPersonagem(novo);
    return novo;
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
  const pontoDaSorte = () => pontoDaSorteDe({ dia: $ref.dia, minuto: $ref.minuto, falas: ($ref.mensagens || []).length });
  const sorteDoTurno = (evento) => {
    try {
      const r = sorteNoPonto($ref.contagemDaSorte, sementeMundo(), pontoDaSorte(), evento);
      $ref.contagemDaSorte = r.contagem;
      return r.sorte;
    } catch (e) { calou("sorteDoTurno", e); return sorteDaCasa; }
  };
  /* MM8c-2: o contexto e os nomes do elenco desta campanha — a gente que
     PESA na narração (resumoCenaPrompt, resumoNPCsParaPrompt, o cânone),
     não a lista para povoar (essa é `elencoParaPovoar`, mais abaixo). */
  const contextoDoElenco = () => ({ genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, espinha: $ref.espinha, guildas: $ref.guildas, base: $ref.baseMundo, estado: $ref.elenco, npcs: $ref.npcs });
  const generoMundo = () => (mundoAtual() && mundoAtual().genero) || cenarioAtivo().generos.padrao;
  /* v9.40: a FORMA do mundo desta campanha. Todo gerador que fala de lugar
     recebe isto ao lado do gênero — um decide o sabor, o outro a forma. */
  const moldeMundo = () => moldePorId((mundoAtual() && mundoAtual().molde) || MOLDE_PADRAO);
  /* ============================================================
     A PORTA ÚNICA DE ABRIR COMBATE (v9.73; o equipamento v9.32; o tabuleiro v9.34)

     T1-A, 6.ª fatia: a regra — completar quem entra, os traços de abertura,
     o grau divino, o tabuleiro pela situação, a iniciativa, a economia da
     rodada 1, o orçamento e o códex — mora em `abrirOCombate`
     (src/motor/combate-do-turno.js), pura e à letra, com os porquês. Daqui
     sai a fiação: o que a planta lê do lugar, os refs que a luta nova zera
     e publica, e a presença um tique depois.
     ============================================================ */
  /* o que a planta lê do lugar (13/10, v9.463): o sítio (lugarRef) e a
     cidade antes do texto do local — a luta na cidade sai da rua, não da
     estrada; a estrada só com a jornada aberta (grid.js#PLANTA_DO_LUGAR).
     A peça chama isto DENTRO de cada montagem do tabuleiro, como era. */
  const plantaDaLuta = () => {
    let ondeG = {};
    try { ondeG = { emViagem: !!$ref.jornada, cidade: $ref.cidadeAtual || "", lugar: $ref.lugar || null }; } catch (e) { calou("o lugar da planta", e); ondeG = {}; }
    return {
      emMasmorra: !!$ref.masmorra,
      ...ondeG,
      local: localAtualTxt(),
      bioma: (($ref.mapa.cidades || []).find((c) => c.nome === $ref.cidadeAtual) || {}).bioma || "",
    };
  };
  const abrirCombate = (inimigosCrus, { pers: persEntra = null, jaNoRef = false, situacao = "cena" } = {}) => {
    /* TODA luta nova zera a marca do território: só volta a valer quando
       ESTA luta é mesmo a que reabriu por causa do território de uma fuga —
       `talvezVoltarAoTerritorio` a repõe logo depois de chamar esta função.
       Sem isto, vencer qualquer OUTRA luta no mesmo lugar apagaria um
       relógio de território que nunca chegou a se resolver. */
    $ref.territorioEmLuta = null;
    const r = abrirOCombate({
      inimigosCrus, jaNoRef, combateNoRef: $ref.combate, pers: persEntra || fichaViva() || $render.personagem, situacao,
      panteao: ($ref.divindade && $ref.divindade.panteao) || [], planta: plantaDaLuta,
      sementeDaAbertura: `${sementeMundo()}|abertura|${$ref.turnoDeRegistro}`, diaLuta: $ref.diaLuta, descobertas: $ref.descobertas,
    }, { sorteDoTurno, calou });
    if (!r.abriu) return r.saida;
    $ref.combate = r.combateNoRef;
    $ref.combateOcioso = 0;
    $ref.reacaoUsada = false;
    /* K3: a escada do silencio e POR LUTA, e zera no mesmo sitio em que a
       reacao da rodada zera. Sem isto, quem calou uma luta ficava calado
       para sempre — e a escada promete o resto DESTA luta, nao mais. */
    $ref.expiracoesSeguidas = 0;
    $ref.diaLuta = r.diaLuta;
    setCombate($ref.combate);
    if (r.descobertas !== $ref.descobertas) { $ref.descobertas = r.descobertas; setDescobertas($ref.descobertas); }
    /* v9.32: o meu peso divino sobre eles. Adiado um tique porque ele lê o
       combate já no ref, e aqui o React ainda não reagiu. */
    setTimeout(() => presencaNaLuta($ref.combate, $ref.personagem, { contraMim: false }), 0);
    return r.saida;
  };
  /* A presença nos DOIS sentidos, na abertura da luta. O deus que entrou
     esmaga; o herói que ascendeu faz joelho dobrar. A segunda metade nunca
     rodava em lugar nenhum — era o "não tinha efeito sobre os outros". */
  const presencaNaLuta = (comb, persBase, { contraMim = true } = {}) => {
    const pers = persBase || $ref.personagem || $render.personagem;
    if (!comb || !pers) return;
    const gdJ = grauDe($ref.divindade, pers.nivel || 1);
    const linhas = [];
    let p = pers;

    if (contraMim) {
      const div = (comb.inimigos || []).filter((e) => (e.gd || 0) >= 3).sort((a, b) => (b.gd || 0) - (a.gd || 0))[0];
      const res = div ? resolverPresenca({ fonte: div, jogador: p, grupo: p.grupo || [], gdJogador: gdJ }) : null;
      if (res) {
        if (res.condJogador) p = { ...p, condicoes: [...(p.condicoes || []).filter((x) => x.id !== res.condJogador.id), res.condJogador] };
        if (res.afetados.length) {
          p = { ...p, grupo: (p.grupo || []).map((g) => {
            const a = res.afetados.find((x) => x.nome === g.nome);
            return a ? { ...g, condicoes: [...(g.condicoes || []).filter((x) => x.id !== a.cond.id), a.cond] } : g;
          }) };
        }
        linhas.push(...res.linhas);
        $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${res.nota}`;
      }
    }

    const meu = presencaDoHeroiEmCombate({ gdJogador: gdJ, inimigos: comb.inimigos || [], nomeHeroi: p.nome });
    if (meu) {
      const porNome = new Map(meu.afetados.map((a) => [a.nome, a.cond]));
      const novos = (comb.inimigos || []).map((e) => {
        const c = porNome.get(e.nome);
        return c ? { ...e, condicoes: [...(e.condicoes || []).filter((x) => x.id !== c.id), c] } : e;
      });
      $ref.combate = { ...($ref.combate || comb), inimigos: novos };
      setCombate($ref.combate);
      linhas.push(...meu.linhas);
      $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${meu.nota}`;
    }

    if (p !== pers) { $ref.personagem = p; setPersonagem(p); }
    if (linhas.length) pushMsgs(linhas.map((t) => ({ autor: "sistema", texto: t })));
  };
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
  /* Todo lugar a que se pode ir daqui a pé: os locais de dentro dos muros, o
     cinturão de fora, e — quando o herói já está num local — os cômodos DELE.

     Os cômodos só entram quando se está no prédio de propósito: "subo para o
     quarto" na praça não quer dizer nada, e a mesma frase dentro da taverna
     quer dizer tudo. Um quarto é um lugar do prédio, não da cidade. */
  const lugaresDaqui = () => {
    const cid = cidadeSobOsPes();
    if (!cid) return [];
    const dentro = locaisDaCidade(sementeMundo(), cid, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico).map((l) => ({ ...l, onde: "dentro" }));
    const fora = arredoresDaCidade(sementeMundo(), cid).map((a) => ({ ...a, onde: "arredores" }));
    const aqui = $ref.lugar;
    const anfitriao = aqui && dentro.find((l) => semNome(l.nome) === semNome(aqui.nome));
    const comodos = anfitriao
      ? comodosDoLocal(sementeMundo(), anfitriao, generoMundo(), moldeMundo()).map((q) => ({ ...q, onde: "comodo", dentroDe: anfitriao.nome }))
      : [];
    /* quem já está num cômodo pode voltar para o salão: o próprio anfitrião
       continua na lista, e é o que faz "desço para o salão" funcionar */
    const paiDoComodo = aqui && aqui.dentroDe ? dentro.find((l) => semNome(l.nome) === semNome(aqui.dentroDe)) : null;
    const irmaos = paiDoComodo
      ? comodosDoLocal(sementeMundo(), paiDoComodo, generoMundo(), moldeMundo()).map((q) => ({ ...q, onde: "comodo", dentroDe: paiDoComodo.nome }))
      : [];
    return [...comodos, ...irmaos, ...dentro, ...fora];
  };
  /* O lugar que a frase pede, ou null. É a MESMA pergunta que o interceptador
     faz antes de abrir estrada — e precisa ser a mesma função, ou as duas
     respondem coisas diferentes sobre a mesma frase. */
  const alvoLocalPedido = (texto) => {
    const cru = String(texto || "");
    if (!cru.trim() || cru.trimStart().startsWith("[")) return null;
    /* MM16 nº 2: dentro da masmorra não há passo pela cidade — e a entrada
       pela frase abre a masmorra ANTES de a frase subir, então o passo
       que roda no envio já a encontra aberta */
    if ($ref.combate || $ref.acampado || $ref.masmorra) return null;
    /* MM16 nº 2: a masmorra que o herói conhece, nomeada como destino, não
       é passo a pé: sem isto "vou ao Templo Afogado de Sal" casava o templo
       da cidade pelo tipo, e o herói ia rezar em vez de ir à masmorra */
    try { if (idaAMasmorra(cru, ctxDoRastro())) return null; } catch (e) { calou("ida no passo", e); }
    return lugarPedido(cru, lugaresDaqui());
  };
  /* Move de verdade: registra o lugar, cobra o tempo e entrega o fato pronto
     ao Mestre. Separado do detector porque o mapa também chama daqui — clicar
     em "ir" na planta é a mesma coisa que escrever, e tem que ser o mesmo
     código, ou as duas portas divergem. */
  const moverParaLocal = (alvo) => {
    /* (Fase T, trilha A) o passo é do motor (oPassoNaCidade,
       src/motor/tempo-do-turno.js): o lugar novo (v9.118: todo lugar nasce
       com ponto, o cômodo ancorado no prédio), os minutos da caminhada
       (TEMPO_DA_CAMINHADA: o cinturão é uma caminhada de verdade; o outro
       lado da praça, não; a escada da taverna é um minuto), a linha e a
       nota. O replay faz a mesma conta. Aqui fica a escrita. */
    let passo = null;
    try { passo = oPassoNaCidade({ cidadeAtual: $ref.cidadeAtual, lugar: $ref.lugar, dia: $ref.dia, mapa: $ref.mapa }, alvo); } catch (e) { calou("o passo na cidade", e); passo = null; }
    if (!passo) return false;
    $ref.lugar = passo.lugar; setLugar(passo.lugar);
    const t = avancarMinutos(passo.minutos);
    if (passo.caminhadaNaTela && t) pushMsgs([{ autor: "sistema", texto: t }]);
    pushMsgs([{ autor: "sistema", texto: passo.linha }]);
    $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${passo.nota}`;
    return true;
  };
  const talvezAndarNaCidade = (texto) => {
    const alvo = alvoLocalPedido(texto);
    if (alvo) moverParaLocal(alvo);
  };
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
  const varrerChao = () => {
    const c = oChaoDaCena({ chao: $ref.chao, cidadeAtual: $ref.cidadeAtual, lugar: $ref.lugar, dia: $ref.dia }).chao;
    if (c !== $ref.chao) { $ref.chao = c; setChao(c); }
    return c;
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
  /* ---------------- A NÉVOA AO REDOR (v9.51) ----------------
     Chegar a uma cidade abre a vizinhança dela: as cidades ligadas por uma
     rota direta entram no mapa marcadas como conhecidas DE OUVIR. É o que
     acontece de verdade — ninguém passa uma tarde numa vila sem descobrir
     para onde vão as duas estradas que saem dela.

     Antes disso o mapa mostrava um ponto só, o que o herói tivesse pisado,
     e um mapa de um ponto é um alfinete. */
  const abrirNevoaDaVizinhanca = (nomeCidade, msgs) => {
    const viz = nevoaDaVizinhanca($ref.mapa, nomeCidade);
    if (!viz.msg) return;
    $ref.mapa = viz.mapa; setMapa($ref.mapa);
    msgs.push(viz.msg);
  };
  const talvezChegarSozinho = () => {
    /* 8.ª sessão: a jornada sem destino, andada até ao fim, fecha na cidade
       de onde partiu (viagem.js) — a saída dos saves que já a têm */
    let j = $ref.jornada;
    try { j = jornadaSemDestino($ref.jornada); } catch (e) { calou("a jornada sem destino", e); j = $ref.jornada; }
    if (!j || !j.para) return;
    const p = progressoDaViagem(j);
    const diasNoCalendario = $ref.dia - (Number(j.desde) || $ref.dia);
    const socorro = !p && diasNoCalendario >= 3;
    if (p && !p.chegou && !(diasNoCalendario >= (j.dias || 3) * 3)) return;
    if (!p && !socorro) return;
    const msgs = [];
    /* MM16 nº 2: O FIM DA ESTRADA ATÉ UMA MASMORRA É A BOCA DELA, não uma
       cidade. Sem este ramo a jornada da Nave de Ferro chegaria a uma
       "cidade" chamada Nave de Ferro, e a porta abriria sem o veredito.
       Aqui o herói fica DIANTE da entrada, do lado de fora (boca.js), a
       cidade de referência não muda e o Mestre recebe a ordem de parar à
       porta. A jornada fecha mesmo que a conta estoure: preso na estrada
       para sempre é pior do que parado à beira dela. */
    if (j.alvo && j.alvo.tipo === "masmorra") {
      $ref.jornada = null; setJornada(null);
      try {
        const ch = chegadaABoca(j.alvo, { cidade: $ref.cidadeAtual, dia: $ref.dia, pers: $ref.personagem || $render.personagem, jornada: j });
        if (ch) {
          $ref.lugar = ch.lugar; setLugar(ch.lugar);
          pushMsgs(ch.linhas.map((texto) => ({ autor: "sistema", texto })));
          $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${ch.nota}`;
        }
      } catch (e) { calou("chegada à boca", e); }
      return;
    }
    $ref.cidadeAtual = j.para;
    try {
      $ref.chegadaInferida = $ref.jornadaInferida && $ref.jornadaInferida === j.para ? j.para : "";
      $ref.jornadaInferida = "";
    } catch (e) { calou("a chegada inferida", e); }
    $ref.jornada = null; setJornada(null);
    if ($ref.lugar) { $ref.lugar = null; setLugar(null); }
    const dias = p ? Math.max(0.5, Math.round((p.horasTotais / HORAS_MARCHA_POR_DIA) * 10) / 10) : Math.round(diasNoCalendario);
    msgs.push(`🧭 Fim da estrada: depois de ${dias} ${dias === 1 ? "dia" : "dias"} de marcha${p && p.kmTotais ? ` e ${p.kmTotais} km` : ""}, você chega a ${j.para}.`);
    const dsc = descobrirCidade($ref.mapa, j.para);
    if (dsc.nova) { $ref.mapa = dsc.mapa; setMapa($ref.mapa); msgs.push(`🗺 ${dsc.nova} entrou no seu mapa.`); }
    $ref.mapa = pisarNaCidade($ref.mapa, j.para); setMapa($ref.mapa);
    abrirNevoaDaVizinhanca(j.para, msgs);
    pushMsgs(msgs.map((texto) => ({ autor: "sistema", texto })));
    $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoCaminho("chegada", { dias, destino: j.para });
  };
  /* o nível é o da ficha VIVA (o ref, 4.ª fatia): o `personagem` do render
     é nulo nas closures que nascem no primeiro render (o aplicarResposta é
     uma delas), e a fama caía no nível 1 — o defeito 4 de 28/10 */
  const famaAtual = () => calcularFama($ref.contadores, (($ref.personagem || $render.personagem || {}).nivel) || 1, dominiosDe($ref.mapa).length);
  const tempoInfoPrompt = () => {
    const est = estacaoDe($ref.dia);
    return `TEMPO DA CAMPANHA: hoje é ${dataTxt($ref.dia)} — dia ${$ref.dia} da campanha —, ${horaTxt($ref.minuto)}${ehNoite($ref.minuto) ? " (NOITE)" : ""}, ${est.nome.toLowerCase()} ${est.icone} (${est.nota}). O app controla o relógio e o calendário: NUNCA estime datas ou horas por conta própria; use estas.`;
  };
  /* RELÓGIO (v6.7): o tempo corre sozinho. Cada chamada avança N minutos;
     dias viram por aqui (com reino, festivais e sono a reboque). Retorna
     texto de envelope para o chamador anexar ao envio do Mestre. */
  /* ---------------- O RELÓGIO DENTRO DO TURNO (T1-A, 5.ª fatia, 28/10) ----------------
     O relógio escreve na ficha (a invocação que expira, a Exaustão). Fora
     do turno, escreve no ref pelo `mudarFicha`, como sempre. DENTRO do
     `aplicarResposta` o ref é a ficha de ANTES do turno, e o `pers` local
     — o que o turno devolve e o save grava — gravava-se depois por cima: a
     fera desfeita voltava no save, a Exaustão sumia, e no intervalo o ref
     era a ficha velha. Por isso o turno anda o relógio por
     `avancarOsMinutos(n, ficha)`: as mudanças caem NA ficha do turno, que
     volta em `ficha` (e vai ao ref, que fica a verdade). Provado em
     teste-relogio-do-turno. */
  const avancarMinutos = (n) => avancarOsMinutos(n).texto;
  const avancarOsMinutos = (n, fichaDoTurno = null) => {
    let ficha = fichaDoTurno && typeof fichaDoTurno === "object" ? fichaDoTurno : null;
    const naFicha = (fn) => { if (ficha) ficha = fn(ficha); else mudarFicha(fn); };
    /* (Fase T, trilha A) a conta do relógio é do motor (osMinutosAndam,
       src/motor/tempo-do-turno.js): o replay faz a mesma. A porta do dia
       (o reino, o festival) fica aqui — lê e escreve o reino. */
    const rel = osMinutosAndam({ minuto: $ref.minuto }, n);
    const extras = [];
    for (const aoVirar of rel.aoVirar) {
      $ref.minuto = aoVirar; /* a porta do dia corre com o minuto daquele dia, como antes */
      const evs = avancarDiasReino(1);
      evs.forEach((ev) => pushMsgs([{ autor: "sistema", texto: `👑 ${ev.evento.titulo} em ${ev.cidade}: ${ev.evento.txt(ev.cidade)}` }]));
      extras.push(envelopeEventosReino(evs));
      const fest = festivalDe($ref.dia);
      if (fest) {
        const r = Object.fromEntries(Object.entries($ref.reino || {}).map(([k, v]) => [k, { ...v, felicidade: Math.min(100, (v.felicidade || 0) + fest.fel) }]));
        $ref.reino = r; setReino(r);
        pushMsgs([{ autor: "sistema", texto: `${fest.icone} Hoje é ${fest.nome}: ${fest.descricao}.` }]);
        extras.push(oEnvelopeDoMundo("festival", { nome: fest.nome, descricao: fest.descricao, data: dataTxt($ref.dia) }));
      }
    }
    $ref.minuto = rel.minuto;
    setMinuto($ref.minuto);
    /* O QUE O TEMPO FAZ AO CORPO (oCorpoNoRelogio, no motor, com os porquês:
       a invocação cujo prazo acabou, só fora da luta — v9.54; o aviso das
       16 h e a Exaustão das 20 h, que não se reanuncia). A escrita é a de
       sempre: a ficha pelo `naFicha` (no turno, a ficha do turno; fora
       dele, o `mudarFicha`, que escreve nos dois lugares — a armadilha da
       v9.54 era escrever num só), a tela e a nota. */
    try {
      const corpo = oCorpoNoRelogio({ combate: $ref.combate, ficha: ficha || fichaViva() || $render.personagem, dia: $ref.dia, minuto: $ref.minuto, acordouAbs: $ref.acordouAbs }, n);
      if (corpo.fim) {
        naFicha(() => corpo.fim.pers);
        pushMsgs(corpo.fim.linhas.map((t) => ({ autor: "sistema", texto: t })));
        $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${corpo.nota}`;
      }
      if (corpo.exausto) {
        naFicha(comAExaustao);
        pushMsgs([{ autor: "sistema", texto: corpo.linha }]);
      } else if (corpo.aviso) {
        pushMsgs([{ autor: "sistema", texto: corpo.linha }]);
      }
    } catch (e) { calou("o corpo no relógio", e); }
    /* o ref antes das conquistas, como o mudarFicha fazia: elas leem-no */
    if (ficha && ficha !== fichaDoTurno) { $ref.personagem = ficha; setPersonagem(ficha); }
    checarConquistas();
    const texto = extras.filter(Boolean).join("");
    return { texto, ficha: ficha || fichaDoTurno };
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
  /* ---------------- O ATOR (v9.135) ----------------
     Uma chamada por boca, no modelo barato, com o dossie daquela pessoa e
     nada mais. Elas vao em paralelo entre si: a fala de uma nao depende da
     outra, e serializar so somaria segundos.

     Falha nao custa turno: se o ator nao responde, a pessoa fica calada e o
     Narrador narra como sempre narrou. */
  /* ---------------- O PROPÓSITO ACONTECE (v9.137) ----------------
     A v9.136 deu a cada pessoa um propósito com condição de maturação, e o
     ator passou a saber que "a hora chegou". Só que NADA no mundo mudava —
     e propósito que amadurece sem consequência é a mesma etiqueta de antes,
     agora com data. Quem faz acontecer é o Mestre.

     Roda ANTES das bocas, para que a fala já saia de dentro do fato. */
  const indoleDaPessoa = (pessoa) => {
    /* a gente da base já nasce com índole; a que o Narrador trouxe, não —
       e a chave é o NOME, então derivar aqui dá a MESMA índole */
    if (pessoa && pessoa.indole) return pessoa.indole;
    return indoleDe(sementeMundo(), pessoa || {});
  };
  const outraCidade = (semente) => {
    const cs = (($ref.mapa || {}).cidades || []).filter((c) => c && c.nome && c.nome !== $ref.cidadeAtual);
    if (!cs.length) return "";
    return cs[Math.abs(semente) % cs.length].nome;
  };
  /* ---------------- A MASCARA DO ALIADO (v9.203) ----------------
     A primeira reviravolta, ponta a ponta. Eleita pela semente do mundo,
     ela espera um aliado com o proposito de trair e um vilao; entao
     semeia no Livro os tres sinais que a preparam, rega-os no ritmo do
     arco (dias, nao turnos) e so revela quando a catraca deixa (tres
     sementes maduras). A verdade fica aqui — a pauta nunca a vaza antes
     da hora. Aditivo e defensivo: nunca pode custar o turno. */
  /* ---------------- O ENCALHE (v9.205) ----------------
     Le se o jogador esta parado (repeticao vazia, nunca curiosidade) e,
     se estiver, sobe a escada no ritmo dos dias e manda o mundo busca-lo
     com um motivo verdadeiro. Explorar nao dispara; mover-se derruba a
     escada a zero. Aditivo e defensivo. Sinais de leitura barata entram
     agora (missoes abertas, diario parado); os demais acendem quando o
     dado ficar acessivel. */
  const snapshotDoEncalhe = () => {
    try {
      const abertas = (missoesAtivas($ref.missoes) || []).length;
      const reg = Array.isArray($ref.registro) ? $ref.registro : [];
      const ultimoDia = reg.reduce((m, x) => Math.max(m, Number(x && x.dia) || 0), 0);
      const diasSemDiario = reg.length ? Math.max(0, $ref.dia - ultimoDia) : 0;
      return { missoesAbertas: abertas, tetoMissoes: 6, diasSemDiario };
    } catch (e) { return {}; }
  };
  /* ---------------- A POSTURA DO MUNDO (v9.206) ----------------
     Monta as leituras que ja existem e deriva a postura, com histerese. O
     jogador nunca ve o rotulo; o mundo reage pela config de cada botao.
     Aqui em G1 o consumidor vivo e o adversario (o vies de moral). */
  const snapshotDePosturas = () => {
    try {
      const fama = famaAtual();
      const term = lerTermometro(snapshotDoTermometro()).leitura;
      const rels = Array.isArray($ref.relogios) ? $ref.relogios : [];
      const relAlto = rels.reduce((m, r) => Math.max(m, (Number(r.segmentos) > 0 ? (Number(r.cheios) || 0) / Number(r.segmentos) : 0)), 0);
      let faseVilao = 0, rostoCaiu = false, alvoDoVilao = false;
      try {
        const v = $ref.nemesis;
        if (v && v.status !== "derrotada") {
          faseVilao = faseDe(v.fase).ordem;
          rostoCaiu = !!v.conhecido || faseVilao >= 3;
          alvoDoVilao = faseVilao >= 2 && Array.isArray(v.marcas) && v.marcas.length > 0;
        }
      } catch (e) {}
      let estacaoDura = false;
      try { estacaoDura = estacaoDe($ref.dia).id === "inverno"; } catch (e) {}
      const pesoRecente = ($ref.ultimoPeso && $ref.dia - $ref.ultimoPeso.dia <= 2) ? $ref.ultimoPeso.peso : null;
      return {
        termometro: term,
        pesoRecente,
        heroiAlvoDoVilao: alvoDoVilao,
        faseVilao, rostoCaiu,
        relogioAlto: relAlto >= 0.66,
        semRelogio: rels.length === 0,
        famaAlta: fama >= 60, famaBaixa: fama < 15,
        estacaoDura,
        arcoNoInicio: (Number(($ref.historia || {}).etapa) || 0) <= 1,
      };
    } catch (e) { return {}; }
  };
  /* ---------------- OS EPISODIOS (v9.207) ----------------
     Abre uma subestrutura quando os fatos maduram (e planta as sementes
     dela no Livro antes), avanca um marco por vez, e ao fechar registra
     um marco no arco — o episodio e capitulo da espinha, nao desvio.
     Um por vez. Aditivo e defensivo. So a Linha Escura tem condicao de
     leitura barata agora; as demais acendem quando o dado ficar acessivel. */
  const snapshotDoEpisodio = () => {
    try {
      const dominios = (typeof dominiosDe === "function") ? (dominiosDe($ref.mapa) || []) : [];
      const rels = Array.isArray($ref.relogios) ? $ref.relogios : [];
      const relAlto = rels.reduce((m, r) => Math.max(m, (Number(r.segmentos) > 0 ? (Number(r.cheios) || 0) / Number(r.segmentos) : 0)), 0);
      const pesoRecente = ($ref.ultimoPeso && $ref.dia - $ref.ultimoPeso.dia <= 2) ? $ref.ultimoPeso.peso : null;
      return {
        temLugarAmado: dominios.length > 0,
        relogioRegionalAlto: relAlto >= 0.66,
        pesoRecente,
      };
    } catch (e) { return {}; }
  };
  const mexerNoEpisodio = () => {
    try {
      if ($ref.modo === "rapida") return; /* a noite conduz o episodio (mexerNaNoite) */
      const ato = Math.max(0, Number(($ref.historia || {}).etapa) || 0);
      if ($ref.episodio && $ref.episodio.aberto) {
        const r = avancarEpisodio($ref.episodio, { dia: $ref.dia });
        $ref.episodio = r.episodio;
        if (r.fechou) {
          /* aninha no ato: o episodio fechado avanca o arco */
          try { const rr = registrarMarco($ref.historia, r.pesoNoArco || "missao", "episodio: " + $ref.episodio.id); $ref.historia = rr.historia; setHistoria($ref.historia); } catch (e) {}
          $ref.episodio = null;
        }
        return;
      }
      /* nada aberto: talvez abrir */
      const espinha = ($ref.historia || {}).estrutura || "jornada";
      const abre = episodioQueAbre(snapshotDoEpisodio(), { ativo: $ref.episodio, espinha });
      if (!abre) return;
      /* semeia no Livro ANTES de abrir */
      let L = garantirLivro($ref.promessas);
      for (const spec of sementesDoEpisodio(abre, { ato, dia: $ref.dia })) {
        L = semear(L, { forma: spec.forma, dona: spec.dona, peso: spec.peso, alvo: spec.alvo, ato: spec.ato, dia: spec.dia }).livro;
      }
      $ref.promessas = L;
      $ref.episodio = garantirEpisodio({ id: abre, marco: 0, aberto: true, desde: $ref.dia, avancouEm: $ref.dia });
    } catch (e) { calou("mexerNoEpisodio", e); }
  };
  const fecharNoite = (v) => {
    if (!v) return;
    $ref.veredito = v;
    $ref.noite = { ...($ref.noite || {}), fim: v.venceu ? "venceu" : "caiu" };
    try { salvar(); } catch (e) {}
    setFase("veredito");
  };
  const mexerNaNoite = () => {
    try {
      if ($ref.modo !== "rapida" || !$ref.noite || $ref.noite.fim) return;
      const N = $ref.noite;
      /* -------- O CAPITULO -------- */
      if (N.prato === "capitulo" && $ref.episodio && $ref.episodio.aberto) {
        if ($ref.combate) return; /* rodada de luta nao e cena nova */
        $ref.episodio = cenaResolvida($ref.episodio);
        const teto = tetoDoMarco($ref.episodio.id, $ref.episodio.marco);
        const r = avancarEpisodio($ref.episodio, { ritmo: "cena", teto, dia: $ref.dia });
        $ref.episodio = r.episodio;
        if (r.avancou) {
          $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoFio("marcoEmpurra");
        }
        if (r.fechou) {
          const L = garantirLivro($ref.promessas);
          const pagas = L.sementes.filter((x) => x.estado === "paga").length;
          const murchas = L.sementes.filter((x) => x.estado === "murcha").length;
          const viva = fichaViva() || $render.personagem || {};
          fecharNoite(vereditoDaNoite({ episodioId: N.episodioId, pronto: N.prontoId, venceu: (viva.vida || 0) > 0, cenas: N.cenasTotais || 0, pagas, murchas }));
          return;
        }
        $ref.noite = { ...N, cenasTotais: (N.cenasTotais || 0) + 1 };
        return;
      }
      /* -------- O TORNEIO -------- */
      if (N.prato === "torneio" && $ref.torneio) {
        let T = $ref.torneio;
        /* o fim da luta real: a chave registra o que a mesa decidiu */
        if (N.lutaEmCurso && !$ref.combate) {
          const venci = ((fichaViva() || $render.personagem || {}).vida || 0) > 0;
          T = registrarMinhaLuta(T, venci);
          $ref.noite = { ...N, lutaEmCurso: false };
          if (T.eliminadoEm) {
            const ep = epilogar(avancarFaseTorneio(T));
            $ref.torneio = ep.torneio;
            const camp = ep.torneio.campeao ? prontoPorId(ep.torneio.campeao) : null;
            fecharNoite({
              titulo: "A chave te engoliu", venceu: false,
              linhas: [
                `Voce caiu na ${T.eliminadoEm}.`,
                camp ? `${camp.nome} levou o cinto sem voce.` : "A chave terminou sem voce.",
                "O acampamento ja fala de outra coisa.",
              ],
              cronica: `${(prontoPorId(N.prontoId) || {}).nome || "?"} · O Torneio · caiu na ${T.eliminadoEm}.`,
            });
            return;
          }
          if (faseCompleta(T)) T = avancarFaseTorneio(T);
          if (T.campeao === T.meu) {
            $ref.torneio = T;
            fecharNoite({
              titulo: "O cinto e seu", venceu: true,
              linhas: [
                `${(prontoPorId(N.prontoId) || {}).nome || "?"} atravessou a chave inteira.`,
                "Sete entraram contra voce. Nenhum sobrou.",
                "A bolsa e o nome desta noite sao seus.",
              ],
              cronica: `${(prontoPorId(N.prontoId) || {}).nome || "?"} · O Torneio · campeao.`,
            });
            return;
          }
          const fora = correrForaDeTela(T);
          $ref.torneio = fora.torneio;
          if (fora.rumores.length) $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoFio("rumoresDaChave", { rumores: fora.rumores });
          return;
        }
        $ref.torneio = T;
      }
    } catch (e) { calou("mexerNaNoite", e); }
  };
  const mexerNaPostura = () => {
    try {
      if ($ref.modo === "rapida") return; /* a postura da noite e declarada, nao derivada */
      const r = derivarPostura($ref.postura, snapshotDePosturas(), { dia: $ref.dia });
      $ref.postura = { postura: r.postura, desde: r.desde != null ? r.desde : ($ref.postura || {}).desde || 0 };
      if (!r.mudou) return;
      /* A VIRADA (v9.208). Ao ENTRAR numa postura dura, quem esta ao lado do
         heroi fica marcado como quem ficou. Ao entrar numa boa, o mundo
         paga o que devia — e cobra de quem se aproveitou. */
      const nova = r.postura;
      const gesto = GESTO_DA_POSTURA[nova];
      if (gesto) {
        const grupo = ((fichaViva() || $render.personagem || {}).grupo) || [];
        for (const g of grupo) if (g && g.nome) $ref.gestos = registrarGesto($ref.gestos, { quem: g.nome, gesto, postura: nova, dia: $ref.dia });
      }
      const cob = cobrarNaVirada($ref.gestos, { para: nova, dia: $ref.dia });
      $ref.gestos = cob.ledger;
      if (cob.pagamentos.length) {
        const env = envelopeDaMemoria(cob.pagamentos);
        if (env) $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + env;
      }
    } catch (e) { calou("mexerNaPostura", e); }
  };
  const mexerNoEncalhe = () => {
    if ($ref.modo === "rapida") return; /* a noite nao encalha: o teto empurra */
    try {
      const r = subirEscada($ref.escada, snapshotDoEncalhe(), { dia: $ref.dia });
      $ref.escada = r.escada;
      if (r.intervencao) {
        $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoFio("oMundoVaiBuscar", { degrau: r.escada.degrau, diz: r.intervencao.diz });
      }
    } catch (e) { calou("mexerNoEncalhe", e); }
  };
  /* que forma consegue achar um ALVO vivo agora. As SETE formas tem
     detector (v9.228): quem decide e reviravoltas.js, e aqui so se
     junta o mundo que ele le — a semente, o vilao, o grupo e a bolsa da
     ficha viva, o registro de pessoas, as missoes e o mapa. Cru: a
     fachada normaliza e engole o proprio tropeco. A regra que morava
     nesta funcao migrou inteira; duplicar seria as duas metades
     discordando amanha. */
  const alvoDaReviravolta = (forma) => {
    try {
      const f = fichaViva() || $render.personagem || {};
      return alvoDaForma(forma, {
        semente: sementeMundo(),
        vilao: $ref.nemesis,
        grupo: f.grupo,
        inventario: f.inventario,
        npcs: $ref.npcs,
        personagem: { antecedente: f.antecedente },
        missoes: $ref.missoes,
        cidades: ($ref.mapa || {}).cidades,
        cidadeAtual: $ref.cidadeAtual,
      });
    } catch (e) { return null; }
  };
  /* ---------------- O CICLO DE UMA VIRADA (R3) ----------------
     Semear (uma vez) e regar (no ritmo DA FORMA). Devolve a virada nova
     quando fez um gesto, e `null` quando nao fez nada — e assim o "um gesto
     por turno" fica na mao de quem chama, visivel, em vez de escondido em
     tres `return` no meio de um corpo que agora cuida de duas. */
  const cuidarDasSementes = (rev, ato) => {
    if (!rev || rev.revelada) return null;
    /* SEMEAR (uma vez) as sementes da forma no Livro */
    if (!rev.semeada) {
      let L = garantirLivro($ref.promessas);
      for (const spec of sementesDaReviravolta(rev.forma, { alvo: rev.alvo, ato, dia: $ref.dia })) {
        L = semear(L, { forma: spec.forma, dona: spec.dona, peso: spec.peso, alvo: spec.alvo, ato: spec.ato, dia: spec.dia }).livro;
      }
      $ref.promessas = L;
      return { ...rev, semeada: true, regadaEm: $ref.dia };
    }
    /* REGAR uma semente imatura, no ritmo do arco. O numero vem da FORMA e
       nao mais cravado aqui: para a menor `diasEntreRegasDe` devolve o mesmo
       3 de sempre (regressao zero literal), e a maior anda no dobro, que e o
       compasso do arco e nao o da cena. */
    if ($ref.dia - (rev.regadaEm || 0) >= diasEntreRegasDe(rev.forma)) {
      const L = garantirLivro($ref.promessas);
      const imatura = L.sementes.find((x) => x.dona === "reviravolta" && x.alvo === rev.alvo && (x.estado === "semeada" || x.estado === "regada"));
      if (imatura) {
        $ref.promessas = regar(L, imatura.id, { dia: $ref.dia, cena: "a virada" }).livro;
        return { ...rev, regadaEm: $ref.dia };
      }
    }
    return null;
  };
  /* A REVELACAO. Paga as sementes maduras DAQUELA virada (o filtro e por
     alvo, e e por isso que as duas nunca podem dividir alvo), acende o que
     ela acende e deixa a nota do turno. Grava `reveladaEm`: e por esse dia
     que a folga ate a virada seguinte se mede, e `revelada` sozinho diz que
     caiu sem dizer quando. */
  const revelarAVirada = (rev) => {
    let L = garantirLivro($ref.promessas);
    for (const x of L.sementes.filter((s2) => s2.dona === "reviravolta" && s2.alvo === rev.alvo && s2.estado === "madura")) {
      L = pagar(L, x.id, { dia: $ref.dia, colheita: revelacaoDe(rev.forma) }).livro;
    }
    $ref.promessas = L;
    if (TRAICAO.includes(rev.forma)) {
      $ref.fatosDoPeso = { ...$ref.fatosDoPeso, traicaoRevelada: true };
      try { $ref.gestos = registrarGesto($ref.gestos, { quem: rev.alvo, gesto: "delatou", postura: ($ref.postura || {}).postura, dia: $ref.dia }); } catch (e) {}
    }
    /* a nota do turno, e so do turno: e por aqui que o Narrador descobre a
       verdade eleita, no mesmo instante que o jogador. Nada disto vira bloco
       no prompt, e o `motivo` da arbitragem nunca sai do bastidor. */
    const passos = oDiaSeguinte(rev.forma, { alvo: rev.alvo, vilao: ($ref.nemesis || {}).nome || "" });
    $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoFio("virada", { revelacao: revelacaoDe(rev.forma), passos });
    return { ...rev, revelada: true, reveladaEm: $ref.dia };
  };
  /* ---------------- AS DUAS VIRADAS, UM TURNO (R3) ----------------
     A ORDEM E A LEI. A menor cuida das sementes dela primeiro e, se fez
     alguma coisa, o turno acabou — e exatamente a sequencia da v9.228, com
     os mesmos `return`, para uma campanha em curso nao sentir nada.

     Depois vem a UNICA pergunta sobre revelar: `quemPodeRevelar` devolve um
     nome so, e por isso nao existe o turno em que as duas estouram. O que
     era `if (rev && rev.revelada) return` no alto do corpo SUMIU de
     proposito: com duas viradas, aquele corte pararia a maior por causa da
     menor, que e o bug que esta etapa veio desfazer.

     E so por ultimo a maior semeia/rega. E depois da revelacao porque uma
     semente plantada hoje nao amadurece hoje: adiantar o passo da maior
     custaria o turno da menor sem comprar nada. */
  const mexerNaReviravolta = () => {
    try {
      if ($ref.modo === "rapida") return; /* folego de campanha */
      const { menor, maior } = elegerReviravoltas(sementeMundo());
      const dia = $ref.dia;
      const ato = Math.max(0, Number(($ref.historia || {}).etapa) || 0);

      /* 1. ELEGER A MENOR: a forma do mundo, quando o detector dela acha um
         alvo vivo — e, desde v9.229, so com a licenca do modulo tambem deste
         lado. `menorPodeNascer` recusa o alvo que a MAIOR ja tomou: as duas
         plantam sob a mesma dona ("reviravolta"), o filtro do Livro e dona +
         alvo, e uma menor nascida por cima colheria as sementes que a maior
         plantou — e a terceira tranca de `quemPodeRevelar` trancaria a maior
         para sempre. Ela nao leva `dia` como a irma, e isso e de proposito:
         a menor nao fica refem de prazo nenhum, porque o detector dela roda
         de novo no turno seguinte e o alvo vem do mundo, nao do contrato.
         Sem alvo, ela simplesmente ainda nao nasceu — e agora isso deixou de
         abortar o orgao inteiro (a guarda engole o alvo vazio, como a da
         maior ja engolia). */
      if (menor && !$ref.reviravolta) {
        const alvo = alvoDaReviravolta(menor);
        if (menorPodeNascer($ref.reviravoltaMaior, alvo)) {
          $ref.reviravolta = garantirReviravolta({ forma: menor, alvo, eleitaEm: dia });
        }
      }
      /* 2. ELEGER A MAIOR, so com a licenca do modulo: nunca no mesmo alvo da
         menor (as sementes das duas se somariam no Livro), e so depois da
         espera quando a menor ainda nao nasceu.

         A ORDEM — menor antes da maior — CONTINUA SERVINDO com as duas
         trancas, e nao por sorte: os dois passos sao SEQUENCIAIS dentro do
         mesmo turno, e o passo 1 ja escreveu `reviravoltaRef.current` antes
         de este aqui le-lo. Nao existe, portanto, o turno em que cada uma
         olhou a outra enquanto ela ainda era `null`: se hoje os dois
         detectores apontam a MESMA pessoa, a menor nasce (a preferencia e
         dela, como manda o modulo) e a maior ja a ve de pe e recusa. O
         caminho inverso — maior nascida ontem, menor achando o mesmo alvo
         hoje — e exatamente o que a tranca nova do passo 1 fecha. Por isso
         nada foi reordenado. */
      if (maior && !$ref.reviravoltaMaior) {
        const alvoMaior = alvoDaReviravolta(maior);
        if (maiorPodeNascer($ref.reviravolta, alvoMaior, { dia })) {
          $ref.reviravoltaMaior = garantirReviravolta({ forma: maior, alvo: alvoMaior, eleitaEm: dia });
        }
      }

      /* 3. A MENOR SEMEIA OU REGA — e, se fez, o turno acabou */
      const passoDaMenor = cuidarDasSementes($ref.reviravolta, ato);
      if (passoDaMenor) { $ref.reviravolta = passoDaMenor; return; }

      /* 4. DE QUEM E A VEZ. Uma pergunta, uma resposta, e quem sai dela ja
         pode revelar agora — a catraca do Livro esta dentro dela. */
      const vez = quemPodeRevelar({
        menor: $ref.reviravolta,
        maior: $ref.reviravoltaMaior,
        livro: $ref.promessas,
        episodioAberto: !!($ref.episodio && $ref.episodio.aberto),
        dia,
      });
      if (vez.quem === "menor" && $ref.reviravolta) {
        $ref.reviravolta = revelarAVirada($ref.reviravolta);
        return;
      }
      if (vez.quem === "maior" && $ref.reviravoltaMaior) {
        $ref.reviravoltaMaior = revelarAVirada($ref.reviravoltaMaior);
        return;
      }

      /* 5. e so entao a maior cuida das dela */
      const passoDaMaior = cuidarDasSementes($ref.reviravoltaMaior, ato);
      if (passoDaMaior) $ref.reviravoltaMaior = passoDaMaior;
    } catch (e) { calou("mexerNaReviravolta", e); }
  };
  const dispararPropositos = (conteudo) => {
    try {
      if (String(conteudo || "").trimStart().startsWith("[")) return [];
      const mov = (($ref.interprete || {}).movimentos || []);
      const feitos = [];
      for (const m of mov) {
        if (propositoCumprido($ref.baseMundo, m.nome)) continue;
        const pes = m.pessoa || {};
        const d = dispararProposito(indoleDaPessoa(pes), pes, {
          dias: Math.max(0, $ref.dia - ((($ref.npcs || {})[m.nome] || {}).conhecidoEm ?? $ref.dia)),
          forcaDoLaco: Number(pes.forcaDoLaco) || 0,
          meDeve: !!pes.meDeve, euDevo: !!pes.euDevo,
          sabeDeMim: !!pes.sabeDeMim, euSeiDela: !!pes.euSeiDela, euGanhei: !!pes.euGanhei,
        });
        if (!d) continue;
        /* um por turno: dois planos secretos amadurecendo na mesma cena é
           uma cena que ninguém acredita */
        if (!aplicarProposito(d)) continue;
        $ref.baseMundo = cumprirProposito($ref.baseMundo, d.nome, d.proposito);
        setBaseMundo($ref.baseMundo);
        feitos.push(d);
        break;
      }
      if (feitos.length) salvar({ baseMundo: $ref.baseMundo });
      return feitos;
    } catch { return []; }
  };
  /* O efeito em si. Devolve `false` quando o mundo não tem como sustentá-lo
     — furto sem bolsa, missão sem outra cidade no mapa — e aí o propósito
     NÃO é marcado como cumprido: ele espera a próxima cena em vez de virar
     uma promessa que o jogador leu e nunca viu acontecer. */
  const aplicarProposito = (d) => {
    const ef = d.efeito || {};
    if (ef.tipo === "relacao") {
      definirRelacao(d.nome, ef.relacao);
      pushMsgs([{ autor: "sistema", texto: `${d.linha}` }]);
      return true;
    }
    if (ef.tipo === "convite") {
      pushMsgs([{ autor: "sistema", texto: `${d.linha} Ela quer ir junto — o convite é seu para aceitar ou não.` }]);
      return true;
    }
    if (ef.tipo === "furto") {
      const inv = (fichaViva() || {}).inventario || [];
      /* bolsa quase vazia não é lugar de ladrão: roubar a última coisa de
         alguém é punição, e o propósito é história */
      if (inv.length < 2) return false;
      const i = Math.abs(hashSemente(`${d.nome}|furto`)) % inv.length;
      const alvo = typeof inv[i] === "string" ? inv[i] : (inv[i] && inv[i].nome);
      if (!alvo) return false;
      setPersonagem((p) => {
        const idx = (p.inventario || []).findIndex((x) => (typeof x === "string" ? x : (x && x.nome)) === alvo);
        if (idx === -1) return p;
        const nv = [...p.inventario]; nv.splice(idx, 1);
        return { ...p, inventario: nv };
      });
      pushMsgs([{ autor: "sistema", texto: `${d.linha} Sumiu da bolsa: ${alvo}.` }]);
      d.envelope += ` O que sumiu foi: ${alvo}.`;
      return true;
    }
    if (ef.tipo === "missao") {
      const destino = outraCidade(hashSemente(d.nome));
      /* uma etapa só, e ela EXIGE viagem. `falar_com` a própria pessoa
         cumpriria no mesmo turno — ela está aqui, e chegar não é cumprir. */
      if (!destino) return false;
      const m = criarMissao({
        titulo: d.titulo || `O pedido de ${d.nome}`,
        tipo: "favor", dador: d.nome, dia: $ref.dia, status: "ativa",
        nivel: Math.max(1, Number((fichaViva() || {}).nivel) || 1),
        descricao: `${d.nome} pediu, e o que ela pede está em ${destino}.`,
        etapas: [{ tipo: "ir_a", alvo: destino }],
      });
      if (!m) return false;
      $ref.missoes = [...$ref.missoes, m]; setMissoes($ref.missoes);
      salvar({ missoes: $ref.missoes });
      pushMsgs([{ autor: "sistema", texto: `${d.linha} 🤝 ${m.titulo} — ${destino}.` }]);
      return true;
    }
    return false;
  };
  const colherAsFalas = async (conteudo) => {
    try {
      if (String(conteudo || "").trimStart().startsWith("[")) return [];
      const mov = ($ref.interprete || {}).movimentos || [];
      if (!mov.length) return [];
      const nomes = mov.map((m) => m.nome);
      const lugar = ($ref.lugar && $ref.lugar.nome) || $ref.cidadeAtual || "";
      // quantas bocas se pagam e tabela (BOCAS_POR_TURNO); o Narrador ja da voz a gente da cena
      const escolhidos = bocasDoTurno(mov, { conteudo });
      if (!escolhidos.length) return [];
      const ditas = await Promise.all(escolhidos.map(async (m) => {
        const d = dossieDe(m.pessoa, {
          faz: m.faz, gesto: m.gesto, proibidos: m.proibidos,
          acao: conteudo, outros: nomes.filter((n) => n !== m.nome), lugar,
          /* v9.136: a cena, para a indole saber se o medo dela esta acordado
             — medo que aparece sempre vira maneirismo, e maneirismo nao e
             medo. E o convivio, que e o que faz um proposito amadurecer. */
          cena: {
            inimigos: (($ref.combate || {}).inimigos) || [],
            presentes: pessoasDaCena(),
            noite: ($ref.minuto || 0) < 6 * 60 || ($ref.minuto || 0) >= 20 * 60,
            convivio: {
              dias: Math.max(0, $ref.dia - ((($ref.npcs || {})[m.nome] || {}).conhecidoEm ?? $ref.dia)),
              forcaDoLaco: Number((m.pessoa || {}).forcaDoLaco) || 0,
              meDeve: !!(m.pessoa || {}).meDeve, euDevo: !!(m.pessoa || {}).euDevo,
              sabeDeMim: !!(m.pessoa || {}).sabeDeMim, euSeiDela: !!(m.pessoa || {}).euSeiDela,
              euGanhei: !!(m.pessoa || {}).euGanhei,
            },
          },
        });
        if (!d) return null;
        try {
          const bruto = await chamarModelo(promptDoAtor(d), [{ role: "user", content: pedidoDoAtor(d) }], 220, "json", "leve");
          // leitor proprio da boca: o extrairJSON do Narrador apagava o campo "fala" desde a v9.135
          const fala = falaDaResposta(bruto);
          return fala ? { nome: d.nome, fala } : null;
        } catch { return null; }
      }));
      return ditas.filter(Boolean);
    } catch { return []; }
  };
  /* o contexto do rastro montado uma vez — três detectores pedem o mesmo.
     MM16 nº 2: e o movimento também (era uma cópia à parte), com o mapa
     (a cidade, a região e o ponto), a jornada (seguir ou largar a estrada)
     e a ficha (o veredito na partida) que a ida a uma masmorra lê */
  const ctxDoRastro = () => ({
    cidadeAtual: $ref.cidadeAtual,
    mapa: $ref.mapa, jornada: $ref.jornada, pers: fichaViva() || $render.personagem,
    cidades: (($ref.mapa || {}).cidades || []).map((c) => c.nome),
    emCombate: !!$ref.combate, acampado: !!$ref.acampado,
    emMasmorra: !!$ref.masmorra, emViagem: !!$ref.jornada, lugar: $ref.lugar, masmorras: (() => { try { return masmorrasDoMundo(sementeMundo(), $ref.mapa); } catch (e) { return []; } })(),
  });
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
  const materialDaTrama = () => {
    try {
      const aqui = oQueExisteAqui(sementeMundo(), $ref.mapa, $ref.cidadeAtual, $ref.baseMundo, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico);
      const cid = (($ref.mapa || {}).cidades || []);
      const vizinhas = cid.filter((c) => c.descoberta && c.nome !== $ref.cidadeAtual);
      const fora = $ref.cidadeAtual ? arredoresDaCidade(sementeMundo(), (aqui && aqui.cidade) || { nome: $ref.cidadeAtual }) : [];
      const gente = (aqui && aqui.gente) || [];
      const conhecidos = Object.values($ref.npcs || {}).filter((n) => n && n.nome && String(n.status || "").toLowerCase() !== "morto");
      /* quem PEDE é de preferência alguém que o herói já conhece: um pedido
         de estranho é um cartaz, e cartaz é o mural */
      const heroi = ((fichaViva() || $render.personagem || {}).nome) || ""; const pessoa = quemPede({ conhecidos, gente, heroi }); /* MM14: quem pede nunca é o herói */
        const sumidoSexo = sorteDoTurno("sumido")() < 0.5 ? "masc" : "fem";
      return {
        cidade: vizinhas.length ? vizinhas[0] : null,
        pessoa,
        local: ((aqui && aqui.locais) || [])[0] || null,
        criatura: ((aqui && aqui.criaturas) || [])[0] || null,
        /* O ERMO, e não um local da cidade. Foi aqui que nasceu "Praga em A
           Loja do Norte": o material entregava o LUGAR DE TRABALHO de quem
           pedia, e um ninho de bicho não se faz numa loja. */
        ermo: fora.length ? fora[Math.floor(sorteDoTurno("ermo")() * fora.length)] : null,
        sumido: nomePessoa(generoMundo(), sumidoSexo, sorteDoTurno("nome"), (mundoAtual() || {}).lexico), sumidoSexo, heroi,
        objeto: "pacote lacrado",
      };
    } catch { return {}; }
  };
  const situacaoDaTrama = () => {
    const h = $ref.historia || {};
    const est = estruturaPorId(h.estrutura);
    const nEt = Math.max(1, (est.etapas || []).length - 1);
    const v = $ref.nemesis;
    const vivo = v && v.status !== "derrotada" && v.nome;
    const c = garantirCompasso($ref.compasso);
    const p0 = fichaViva() || $render.personagem || {};
    return {
      momento: (Number(h.etapa) || 0) / nEt,
      faseVilao: vivo ? v.fase : "",
      temVilao: !!vivo, vilaoConhecido: !!(vivo && v.conhecido),
      movimento: c.movimento, assunto: c.assunto,
      temGrupo: (p0.grupo || []).length > 0,
      temCidadeVizinha: ((($ref.mapa || {}).cidades) || []).some((x) => x.descoberta && x.nome !== $ref.cidadeAtual),
      temGenteConhecida: Object.keys($ref.npcs || {}).length > 0,
      temPromessaAberta: (() => { try { return !!promessaEmAberto($ref.mensagens); } catch (e) { return false; } })(), /* MM14: só a palavra dada é promessa */
      nivel: p0.nivel || 1,
      intencoesFeitas: $ref.intencoesFeitas,
      tramasFeitas: $ref.tramasFeitas,
    };
  };
  const talvezDarUmaTrama = ({ forcar = false } = {}) => {
    try {
      if ($ref.combate || $ref.masmorra || $ref.acampado || $ref.raid) return "";
      /* uma por vez */
      if (($ref.missoes || []).some((m) => m.status === "ativa" && m.tipo === "trama")) return "";
      /* MM13: enquanto o herói não está orientado, a trama também espera —
         é uma oferta do mundo como outra qualquer. `forcar` (a abertura,
         quando não há pista) continua furando esta espera. */
      if (!forcar && !muralLiberado({ abertura: $ref.abertura, missoes: $ref.missoes })) return ""; if (!forcar && !(() => { try { return tramaTemEspaco({ abertura: $ref.abertura, missoes: $ref.missoes, dia: $ref.dia }); } catch (e) { calou("tramaTemEspaco", e); return true; } })()) return ""; /* MM14: uma trama forçada só quando a principal deixou espaço */
      /* e não no respiro: o respiro existe para NÃO haver nada em jogo.
         v9.120: MENOS NA ABERTURA. O compasso nasce em "respiro" — é o
         padrão de `garantirCompasso` —, e por isso a primeira cena da
         campanha era a única em que o Mestre não tinha intenção nenhuma na
         mão. O jogador era posto no mundo e largado ali, com um gancho
         improvisado no lugar do fio da história. A abertura é justamente
         onde a indução tem de começar. */
      const c = garantirCompasso($ref.compasso);
      if (!forcar && c.movimento === "respiro") return "";
      /* v9.392: fora da abertura forçada, a trama só nasce amarrada ao fio */
      let amarra = null;
      if (!forcar) {
        try { amarra = { fio: fioDaHistoria({ abertura: $ref.abertura, missoes: $ref.missoes }), prometido: $ref.prometido, nomes: [($ref.nemesis || {}).nome].filter(Boolean) }; } catch (e) { calou("a amarra da trama", e); amarra = null; }
      }
      const t = montarTrama({ situacao: situacaoDaTrama(), material: materialDaTrama(), amarra });
      if (!t) return "";
      const m = criarMissao({
        id: `${t.id}_${$ref.dia}`, titulo: t.titulo, tipo: "trama", status: "ativa",
        descricao: t.descricao, dador: t.dador, etapas: t.etapas,
        nivel: t.nivel, dia: $ref.dia,
        intencao: t.intencao, veiculo: t.veiculo, virada: t.virada,
      });
      if (!m) return "";
      $ref.missoes = [...($ref.missoes || []), m]; setMissoes($ref.missoes);
      $ref.intencoesFeitas = [...$ref.intencoesFeitas, t.intencao].slice(-12);
      $ref.tramasFeitas = [...$ref.tramasFeitas, t.veiculo].slice(-8);
      pushMsgs([{ autor: "sistema", texto: `✦ ${m.titulo} — entrou no diário.` }]);
      return envelopeDaTrama(t);
    } catch (e) { calou("talvezDarUmaTrama", e); return ""; }
  };
  /* ============================================================
     A VIRADA ACONTECE (v9.117) — o conserto dos três lobos

     "quando cheguei os lobos não estavam lá … iam me mandando de lugar em
     lugar atrás dos lobos e não chegava nunca, o mestre narrava pegadas e
     sombras."

     A etapa `derrotar` só CONFERIA. Nada, em lugar nenhum do código,
     fazia o bicho aparecer — a missão era um pedido ao Narrador para
     abrir um combate que o prompt o proíbe de abrir. Ele fez a única
     coisa possível com duas ordens contrárias: narrou pegadas para
     sempre.

     Daqui em diante quem entrega é o SISTEMA. Duas réguas, porque são
     dois momentos diferentes:

       POR ETAPA   a escolta chega à cidade e a emboscada abre. A virada é
                   `apos: N` e dispara quando a etapa N é cumprida.

       POR LUGAR   a caçada. Não dá para esperar a etapa, porque a etapa É
                   matar o bicho: ela dispara quando o herói PISA no lugar
                   marcado, e é isso que impede a caçada eterna.
     ============================================================ */
  /* ONDE EU ESTOU são DOIS nomes, e a caçada tem de aceitar os dois. O
     herói está na Praça de Escambo, DENTRO de Baixo do Eco: uma caçada
     endereçada à cidade tem de valer em qualquer canto dela, e uma
     endereçada a um ponto do ermo não pode valer na cidade. Testar só o
     nome mais interno reprovava a primeira; testar só a cidade aprovaria
     a segunda em lugar errado. */
  const ondeEstou = () => [($ref.lugar && $ref.lugar.nome) || "", $ref.cidadeAtual || ""].filter(Boolean);
  const mesmoLugar = (a, b) => {
    const n = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^(a|o|as|os)\s+/, "").trim();
    return !!n(a) && !!n(b) && (n(a) === n(b) || n(a).includes(n(b)) || n(b).includes(n(a)));
  };
  /* O BANDO DE UMA FUGA VIRA LISTA DE INIMIGOS — numerado como a caçada já
     numeia o dela (`Nome 1`, `Nome 2`) quando o mesmo nome se repete: quem
     lembra QUEM ficou (fuga.js) guarda só um nome e uma ameaça por corpo,
     não a numeração — essa é sempre de quem monta a luta. */
  const inimigosDoBandoDaFuga = (bando) => {
    const porNome = new Map();
    for (const b of bando) porNome.set(b.nome, (porNome.get(b.nome) || 0) + 1);
    const vistos = new Map();
    return bando.map((b) => {
      if ((porNome.get(b.nome) || 1) <= 1) return { nome: b.nome, ameaca: b.ameaca };
      const k = (vistos.get(b.nome) || 0) + 1; vistos.set(b.nome, k);
      return { nome: `${b.nome} ${k}`, ameaca: b.ameaca };
    });
  };
  /* A PRESA APARECE, e isto vale para TODA missão ativa — inclusive as do
     mural. A queixa que originou tudo isto era de um trabalho de mural, e
     consertar só as tramas deixaria o defeito de pé exatamente onde ele
     foi encontrado. Basta a etapa dizer ONDE. */
  const talvezCacar = () => {
    if ($ref.combate || $ref.acampado || $ref.masmorra || $ref.raid) return "";
    for (const m of ($ref.missoes || [])) {
      if (m.status !== "ativa") continue;
      const i = (m.etapas || []).findIndex((e) => e && !e.feito);
      const e = i >= 0 ? m.etapas[i] : null;
      if (!e || e.tipo !== "derrotar" || !e.onde) continue;
      const chave = `${m.id}|${i}`;
      if ($ref.cacadasFeitas.includes(chave)) continue;
      if (!ondeEstou().some((x) => mesmoLugar(x, e.onde))) continue;
      /* O FOLEGO DA FUGA: a mesma resposta em que o heroi fugiu — ou o
         mesmo lugar logo depois — nao pode reabrir a cacada que ele
         acabou de deixar para tras. */
      if (folegoSegura($ref.folego, { lugares: ondeEstou(), origem: "cacada" })) continue;
      const quantos = Math.max(1, Number(e.quantos) || 1);
      const inimigos = Array.from({ length: quantos }, (_, k) => ({
        nome: quantos > 1 ? `${e.alvo} ${k + 1}` : e.alvo,
        ameaca: (m.virada && m.virada.ameaca) || "comum",
      }));
      const ab = abrirCombate(inimigos, { pers: $ref.personagem });
      if (ab.msgs.length) pushMsgs(ab.msgs.map((x) => ({ autor: "sistema", texto: x })));
      if (ab.pers) { setPersonagem(ab.pers); $ref.personagem = ab.pers; }
      $ref.cacadasFeitas = [...$ref.cacadasFeitas, chave].slice(-40);
      pushMsgs([{ autor: "sistema", texto: `⚔ ${e.alvo}${quantos > 1 ? ` — são ${quantos}` : ""}. Estavam aqui.` }]);
      if (m.virada && !m.virada.feita) {
        m.virada = { ...m.virada, feita: true };
        $ref.missoes = [...$ref.missoes]; setMissoes($ref.missoes);
      }
      return `${envelopeDoQueVira({ tipo: "cacada" }, { alvo: e.alvo })}${ab.nota ? `\n${ab.nota}` : ""}`;
    }
    return "";
  };
  /* A VOLTA AO TERRITÓRIO (fuga.js): o bando que ficou de guarda no lugar
     de onde o herói fugiu não esquece — voltar lá, enquanto o relógio
     existe, reabre a luta com eles alertas. O mesmo fôlego que protege a
     caçada logo acima protege esta porta: a resposta em que a fuga
     aconteceu, e o turno em que o herói ainda não saiu do lugar, não
     reabrem luta nenhuma. */
  const talvezVoltarAoTerritorio = () => {
    if ($ref.combate || $ref.acampado || $ref.masmorra || $ref.raid) return "";
    if (folegoSegura($ref.folego, { lugares: ondeEstou(), origem: "cacada" })) return "";
    const r = relogioDoTerritorio($ref.relogios, ondeEstou());
    if (!r) return "";
    const bando = bandoAoVoltar(r);
    if (!bando.length) return "";
    const ab = abrirCombate(inimigosDoBandoDaFuga(bando), { pers: $ref.personagem, situacao: "emboscada" });
    if (ab.msgs.length) pushMsgs(ab.msgs.map((x) => ({ autor: "sistema", texto: x })));
    if (ab.pers) { setPersonagem(ab.pers); $ref.personagem = ab.pers; }
    $ref.territorioEmLuta = r.id;
    pushMsgs([{ autor: "sistema", texto: `⚔ ${r.nome} — você voltou, e eles estavam à espera.` }]);
    return oEnvelopeDaViagem("emboscadaDaFuga", { bando: r.nome, nota: ab.nota });
  };
  const talvezVirar = () => {
    let env = talvezCacar();
    if (env) return env;
    env = talvezVoltarAoTerritorio();
    if (env) return env;
    const ms = $ref.missoes || [];
    for (const m of ms) {
      if (m.status !== "ativa" || !m.virada || m.virada.feita) continue;
      const v = m.virada;
      const feitas = (m.etapas || []).filter((e) => e.feito).length;
      const vilao = $ref.nemesis;
      const nomeDoVilao = vilao && vilao.status !== "derrotada" && vilao.conhecido ? vilao.nome : "";

      /* a caçada já foi entregue por `talvezCacar`, que vale para TODA
         missão com endereço — inclusive as do mural, que foi de onde a
         queixa veio. Consertar só as tramas deixaria o defeito de pé
         exatamente no lugar em que ele foi encontrado. */
      if (v.tipo === "cacada") continue;

      const devida = viradaDevida(m, { etapasFeitas: feitas });
      if (!devida) continue;

      if (devida.tipo === "emboscada") {
        if ($ref.combate || $ref.acampado) continue;
        if (folegoSegura($ref.folego, { lugares: ondeEstou(), origem: "virada" })) continue;
        const quantos = Math.max(1, devida.quantos || 3);
        const inimigos = Array.from({ length: quantos }, (_, i) => ({
          nome: nomeDoVilao ? `Homem de ${nomeDoVilao} ${i + 1}` : `Emboscador ${i + 1}`,
          ameaca: devida.ameaca || "competente",
        }));
        const ab = abrirCombate(inimigos, { pers: $ref.personagem, situacao: "emboscada" });
        if (ab.msgs.length) pushMsgs(ab.msgs.map((t) => ({ autor: "sistema", texto: t })));
        if (ab.pers) { setPersonagem(ab.pers); $ref.personagem = ab.pers; }
        pushMsgs([{ autor: "sistema", texto: `⚔ ${devida.onde || "No caminho"}: fecham a passagem — são ${quantos}.` }]);
        env += `${env ? "\n" : ""}${envelopeDoQueVira(devida, { vilao: nomeDoVilao })}${ab.nota ? `\n${ab.nota}` : ""}`;
      } else if (devida.tipo === "encontro" || devida.tipo === "revelacao") {
        /* encontro e revelação NÃO abrem combate: entregam a cena, e o que
           se decide nela continua sendo do jogador. Os dois são nomeados
           aqui de propósito — um tipo declarado em tramas.js e sem leitor
           deste lado é uma virada que não acontece, que é exatamente o
           defeito que a etapa `derrotar` era. O teste confere os dois
           lados justamente por isso. */
        const quem = devida.tipo === "encontro"
          ? (nomeDoVilao && intencaoDaTramaPorId(m.intencao) && /rosto|guerra/.test(String($ref.nemesis.fase || "")) ? nomeDoVilao : "")
          : "";
        env += `${env ? "\n" : ""}${envelopeDoQueVira(devida, { quem })}`;
        pushMsgs([{ autor: "sistema", texto: `✦ ${m.titulo}: a coisa vira aqui.` }]);
      }
      m.virada = { ...devida, feita: true };
    }
    if (env) { $ref.missoes = [...ms]; setMissoes($ref.missoes); }
    return env;
  };
  /* ---------------- AS MAOS DA CASA (v9.133) ----------------
     Nenhuma regra mora aqui: tudo o que decide esta em `guildas.js`, e este
     bloco so aciona, guarda e conta ao jogador. */
  const minhaCasa = () => ($ref.guildas || []).find((g) => g.membro) || null;
  const guardarCasas = (lista) => {
    $ref.guildas = lista; setGuildasMundo(lista);
    salvar({ guildas: lista });
  };
  const trocarCasa = (nova) => guardarCasas(($ref.guildas || []).map((g) => (g.id === nova.id ? nova : g)));
  /* ---------------- A CONSULTA AO BIBLIOTECARIO (v9.85) ----------------
     O mestre ja escolhia bem QUAL fio puxar. O que ele nunca teve foi a
     segunda metade da decisao, que e a FORMA: um relogio quase cheio pode
     entrar numa cena de vinte maneiras, e o envelope pedia sempre a mesma
     — "traga isto a cena em duas ou tres frases". Pedido igual todo turno
     recebe resposta igual todo turno, e era dai que vinha a repeticao do
     narrador, nao da temperatura.

     Aqui o mestre monta a situacao com o que ele JA SABE — a mesa, o arco,
     a fase do vilao, quem esta na cena — e a estante devolve uma forma. O
     nome dela nao viaja: sobe a forma, nunca a etiqueta. */
  /* ---------------- O QUE O MESTRE SABE DO LUGAR (v9.93) ----------------
     Tudo já existia: o mapa guarda porte, bioma e rotas com dias; o
     registro de gente sabe quem está aqui e quem está longe. O que não
     existia era alguém PERGUNTANDO antes de decidir — e por isso um cerco
     podia germinar numa aldeia sem portão, e um reencontro podia ser
     escolhido com a única pessoa conhecida sentada na minha frente. */
  const lugarDaMesa = () => {
    try {
      const mapa = $ref.mapa || {};
      const cidades = mapa.cidades || [];
      const aqui = cidades.find((c) => c.nome === $ref.cidadeAtual) || null;
      const p0 = fichaViva() || {};
      const el = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: p0.grupo || [] });
      /* a vizinha conhecida mais perto, em dias de estrada. Só conta o que
         o jogador JÁ descobriu: um caminho que ele não conhece não é uma
         saída, é névoa. */
      const conhecidas = new Set(cidades.filter((c) => c.descoberta).map((c) => c.nome));
      const dias = (mapa.rotas || [])
        .filter((r) => (r.de === $ref.cidadeAtual && conhecidas.has(r.para)) || (r.para === $ref.cidadeAtual && conhecidas.has(r.de)))
        .map((r) => Number(r.dias) || 0).filter((d) => d > 0);
      return {
        porte: (aqui && aqui.porte) || "",
        bioma: (aqui && aqui.bioma) || "",
        gentePorPerto: (el.aqui || []).length,
        genteLonge: (el.longe || []).length,
        diasAteVizinha: dias.length ? Math.min(...dias) : 0,
      };
    } catch { return {}; }
  };
  /* ---------------- O ELENCO QUE A ONDA CONSULTA (v9.97) ----------------
     "Os fins não sabem de quem falam: o sistema escolhe 'um amor que
     termina' sem saber se há um casal registrado nesta campanha."

     Agora sabe. `aqui` é quem está na cena e pode ser nomeado numa
     semente; `lacos` é quem já é alguma coisa de mim, por tipo. Um "amor
     que termina" só abre se houver um amor — e o nome dela sai daqui, não
     da imaginação de quem narra. */
  const elencoDaOnda = () => {
    try {
      const p0 = fichaViva() || {};
      const el = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: p0.grupo || [] });
      const lacos = { rompidos: comLaco($ref.npcs, { rompido: true }) };
      for (const t of TIPOS_DE_LACO) lacos[t.id] = comLaco($ref.npcs, { tipo: t.id, rompido: false });
      /* e os PARES que já existem entre gente do registro: é o que permite
         "os dois querem que eu escolha" saber quais dois, e é o que faz o
         mundo ter história sem mim no meio */
      return { aqui: (el.aqui || []).map((x) => x.nome).filter(Boolean), lacos, entre: paresEntre($ref.npcs) };
    } catch { return { aqui: [], lacos: {} }; }
  };
  const situacaoDaMesa = ({ fio = "" } = {}) => {
    const p0 = fichaViva() || {};
    const h = $ref.historia || {};
    const est = estruturaPorId(h.estrutura);
    const nEt = Math.max(1, (est.etapas || []).length - 1);
    const v = $ref.nemesis;
    const vivo = v && v.status !== "derrotada";
    const daqui = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: p0.grupo || [] }).aqui || [];
    /* ---------------- O HISTORICO E DO SISTEMA (v9.86) ----------------
       Tres formas dependem de haver passado nesta campanha, e ate aqui quem
       decidia se havia era a IA: o `evite` mandava escolher outra forma se
       nao houvesse. Delegar essa pergunta e exatamente o que esta casa nao
       faz — o registro de pessoas e os feitos do arco estao do lado de ca.
       Uma IA que recebe "traga alguem que voce ja conhece" numa campanha de
       dois dias faz a unica coisa que pode: inventa a pessoa. */
    const feitos = (h.feitos || []).length;
    return {
      ordemDaFase: vivo ? (faseDe(v.fase).ordem) : -1,
      vilaoConhecido: !!(vivo && v.conhecido),
      momento: (Number(h.etapa) || 0) / nEt,
      temperatura: temperaturaDaMesa($ref.mesa).id,
      pilarFaminto: (pilarFaminto($ref.mesa) || {}).id || null,
      /* v9.88: e o oposto dele — o que o JOGADOR vem repetindo, para a
         estante parar de somar mais do mesmo em cima do que ele já traz */
      pilarRecente: (pilarRepetido($ref.mesa) || {}).id || null,
      fio,
      pessoaNaCena: daqui.length > 0,
      emCidade: !!$ref.cidadeAtual,
      emMasmorra: !!$ref.masmorra,
      emCombate: !!$ref.combate,
      emViagem: !!$ref.jornada,
      noite: ehNoite($ref.minuto),
      temGrupo: (p0.grupo || []).length > 0,
      temPromessa: (missoesAtivas($ref.missoes) || []).length > 0,
      temCicatriz: ((p0.cicatrizes || []).length > 0),
      temDerrotado: $ref.derrotadosDaSessao.length > 0,
      temLugarAbandonado: ((($ref.mapa || {}).cidades) || []).some((c) => c.descoberta && c.nome !== $ref.cidadeAtual),
      temRelogio: ($ref.relogios || []).some((x) => x.cheios > 0),
      temGenteConhecida: Object.keys($ref.npcs || {}).length > 0,
      temPassado: feitos >= 2 || $ref.derrotadosDaSessao.length > 0 || (p0.cicatrizes || []).length > 0,
      /* v9.87: tres memorias diferentes, e nao uma so. Um heroi com tres
         cicatrizes e nenhum quilometro rodado tem passado de sobra e nenhum
         lugar de que se lembrar; um que conversou duas vezes nao tem frase
         para ecoar. Os limiares sao baixos de proposito — a trava existe
         para a campanha RECEM-NASCIDA, nao para racionar a forma. */
      /* v9.88: contar NARRACOES era proxy grosso — doze paragrafos de
         travessia e descricao nao deixam uma frase para ecoar. Conta-se
         agora a narracao que tem FALA dentro (aspas ou travessao), que e o
         que o eco precisa que exista. Continua sendo proxy: se ha uma
         frase memoravel so a IA sabe, e este e o unico caso em que
         devolver a pergunta a ela seria defensavel. */
      temFalaAnterior: ($ref.mensagens || []).filter((m) => m && m.autor === "mestre" && /[“"”]|—s/.test(String(m.texto || ""))).length >= 8,
      temObjetos: (p0.inventario || []).length >= 3,
      temLugarVisitado: cidadesPisadas($ref.mapa).length >= 2,
      ...lugarDaMesa(),
      pvBaixo: (p0.vida || 0) > 0 && (p0.vida || 0) <= Math.ceil((p0.vidaMax || 1) / 3),
      nivel: p0.nivel || 1,
      fama: famaAtual(),
    };
  };
  const formaDoMestre = ({ fio = "", preferir = null } = {}) => {
    try {
      const j = consultarBiblioteca(situacaoDaMesa({ fio }), { estante: $ref.estante, preferir });
      if (!j) return "";
      $ref.estante = marcarJogada($ref.estante, j.id, j.gesto);
      return trechoDaJogada(j);
    } catch { return ""; /* a forma nunca pode custar o turno */ }
  };
  /* ---------------- A FORMA DA CENA COMUM (v9.86) ----------------
     O Bibliotecario nasceu falando so nos tres envelopes de iniciativa. So
     que esses tres sao raros de proposito — a cadencia do mundo e larga
     porque um mundo que interrompe toda hora e barulhento, nao vivo.

     Quer dizer que a forma chegava a um turno em cada dez, e os outros nove
     — a maior parte do jogo — continuavam exatamente como antes. E e
     justamente neles que a repeticao aparece, porque sao eles que se
     repetem.

     Aqui so entram as formas marcadas `sozinha`: as que moldam a CENA em
     vez de moldar a entrega de outra coisa. "Termine com duas portas
     abertas" funciona sem fio nenhum atras; "faca isto chegar por um
     mensageiro" nao funciona sem o isto. */
  /* ---------------- A ONDA ANDA (v9.91) ----------------
     Um turno de cada vez, no mesmo ponto por onde passa todo turno. E ela
     SEGURA quando já há cena grande em curso: um clímax de compasso
     disparando dentro de um combate que o jogador já está travando são
     duas cenas grandes no mesmo turno, e a segunda apaga a primeira.

     A forma da cena (o Bibliotecário) cede a vez quando o compasso fala.
     Não por hierarquia: o envelope do compasso JÁ diz do que a cena trata
     e em que tempo, e uma forma por cima disso seria o sistema dando duas
     instruções de composição para a mesma cena. */
  /* Firma, fortalece, rompe ou reata — conforme o assunto declarou. Só no
     clímax: nem a semente nem a véspera mexem no registro, porque até o
     clímax nada aconteceu de fato. */
  const registrarLacoDaOnda = (r) => {
    try {
      if (!r || !r.virou || !r.movimento || r.movimento.id !== "climax") return;
      const a = r.assunto, quem = r.quem;
      if (!a || !quem) return;
      const chave = Object.keys($ref.npcs || {}).find((k) => k.toLowerCase() === quem.toLowerCase());
      if (!chave) return;
      const npc = $ref.npcs[chave];
      let novo = npc;
      /* ENTRE DOIS vem primeiro porque não mexe no meu laço com ninguém:
         é o mundo se organizando sozinho, e o registro grava nas DUAS
         pontas de uma vez. */
      if (a.firmaEntre && r.quem2) {
        $ref.npcs = firmarEntre($ref.npcs, quem, r.quem2, a.firmaEntre, $ref.dia);
        setNpcs($ref.npcs);
        return;
      }
      if (a.firma) novo = firmarLaco(npc, a.firma, $ref.dia);
      else if (a.reata) novo = firmarLaco(npc, ((npc.laco || {}).tipo) || "amizade", $ref.dia);
      else if (a.rompe) novo = romperLaco(npc, $ref.dia);
      if (novo === npc) return;
      $ref.npcs = { ...$ref.npcs, [chave]: novo };
      setNpcs($ref.npcs);
    } catch { /* registrar nunca pode custar o turno */ }
  };
  /* ---------------- O SNAPSHOT DO TERMOMETRO (v9.202) ----------------
     Monta, dos refs, o estado que o Termometro le. So os sinais de leitura
     limpa entram agora; os demais defaultam desligados e acendem quando o
     dado ficar acessivel — um snapshot parcial ainda da uma leitura sa,
     porque sinal que nao liga simplesmente nao pesa. Defensivo de ponta a
     ponta: ler o estado nunca pode custar o turno. */
  const snapshotDoTermometro = () => {
    try {
      const p0 = fichaViva() || $render.personagem || {};
      const grupo = Array.isArray(p0.grupo) ? p0.grupo : [];
      const frac = (e) => (e && Number(e.vidaMax) > 0 ? Number(e.vida) / Number(e.vidaMax) : null);
      const fracaoPV = frac(p0);
      const fracsGrupo = grupo.map(frac).filter((x) => x != null);
      const fracaoGrupo = fracsGrupo.length ? fracsGrupo.reduce((a, b) => a + b, 0) / fracsGrupo.length : null;
      const rels = Array.isArray($ref.relogios) ? $ref.relogios : [];
      const relogioMaisAlto = rels.reduce((m, r) => Math.max(m, (Number(r.segmentos) > 0 ? (Number(r.cheios) || 0) / Number(r.segmentos) : 0)), 0);
      let faseVilao = 0;
      try { const v = $ref.nemesis; if (v && v.status !== "derrotada") faseVilao = faseDe(v.fase).ordem; } catch (e) {}
      let estacaoDura = false;
      try { estacaoDura = estacaoDe($ref.dia).id === "inverno"; } catch (e) {}
      return {
        fracaoPV, fracaoGrupo,
        companheiroGrave: fracsGrupo.some((f) => f <= 0.33),
        relogioMaisAlto, faseVilao, estacaoDura,
      };
    } catch (e) { return {}; }
  };
  const talvezAndarOCompasso = (conteudo, opcoes) => {
    /* MM18: quem chama pode segurar a onda (a pergunta do jogador, no
       degrau da escuta) — a mesma porta do combate e da viagem */
    const segurarExtra = !!(opcoes && opcoes.segurar);
    try {
      if (String(conteudo || "").trimStart().startsWith("[")) return "";
      /* ---------------- O VILÃO PASSA NA FRENTE (v9.93) ----------------
         O passo dele e o clímax do compasso podiam cair no mesmo turno, e
         nada os coordenava. É o mesmo defeito que `segurar` já resolvia
         para combate, masmorra e viagem — só que ninguém tinha ligado o
         vilão nele.

         E ele ganha sempre: a onda é cíclica e pode esperar um turno sem
         perder nada, enquanto o passo do vilão acontece uma vez a cada
         seis dias de campanha. Adiar o raro para não atropelar o
         frequente seria trocar a peça grande pela pequena. */
      if (($ref.nota || "").includes("— MOVIMENTO DO SISTEMA]")
        || ($ref.nota || "").includes("MOMENTO ÚNICO DA CAMPANHA")
        || ($ref.nota || "").includes("[A QUEDA —")) {
        $ref.compasso = { ...$ref.compasso, turnos: Math.max(0, ($ref.compasso.turnos || 0) - 1) };
        return "";
      }
      const sit = situacaoDaMesa();
      /* O FOLEGO (v9.202): o Termometro le como o jogador chega a onda e
         alonga o respiro de quem afoga, encurta a subida de quem passeia.
         Nunca muda a ordem dos movimentos — so quantos turnos cada um dura. */
      const leitura = lerTermometro(snapshotDoTermometro());
      const r = avancarCompasso($ref.compasso, sit, {
        segurar: segurarExtra || !!$ref.combate || !!$ref.masmorra || !!$ref.jornada || seguraOCompasso((pesoDaCena($ref.fatosDoPeso) || {}).peso),
        preferir: sit.pilarFaminto,
        elenco: elencoDaOnda(),
        folego: folegoDaLeitura(leitura.leitura),
        /* G8 (v9.212): o tempero do Termometro, enfim consumido — quando o
           jogador passeia, a prateleira pesada (perda, poder) e preferida
           na proxima semente da onda. */
        preferirTom: leitura.tempero === "prateleira_pesada" ? "pesado" : null,
      });
      $ref.compasso = r.compasso;
      /* ---------------- O CLÍMAX REGISTRA (v9.97) ----------------
         É aqui que o círculo fecha: a semente escolheu o nome, a onda o
         carregou, e o clímax grava o que aconteceu entre nós dois. Sem
         isto o laço existiria só na narração — e o que existe só na
         narração o sistema não pode consultar depois.

         E o registro é do SISTEMA, nunca da IA: ela narra o beijo, o
         sistema anota que há um amor. */
      registrarLacoDaOnda(r);
      return envelopeDoCompasso(r);
    } catch { return ""; /* a onda nunca pode custar o turno */ }
  };
  const talvezDarFormaACena = (conteudo) => {
    try {
      $ref.estante = contarTurnoDeCena($ref.estante);
      /* um envelope de iniciativa ja traz forma, e duas formas no mesmo
         turno e o sistema falando por cima de si mesmo */
      if (($ref.nota || "").includes("A FORMA")) return "";
      /* turno que nao e do jogador (envelope de sistema, comando, retomada)
         nao e cena: dar forma a ele seria moldar a resposta a mim mesmo */
      if (String(conteudo || "").trimStart().startsWith("[")) return "";
      const sit = situacaoDaMesa();
      if (!podeFormaDeCena(sit, $ref.estante).pode) return "";
      const j = consultarBiblioteca(sit, { estante: $ref.estante, soSozinhas: true });
      if (!j) return "";
      $ref.estante = zerarCadenciaDaCena(marcarJogada($ref.estante, j.id, j.gesto));
      return envelopeDaCena(j);
    } catch { return ""; }
  };
  /* UMA RODADA POR TURNO DO JOGADOR. Não é um laço: se a frente
     resolvesse tudo de uma vez, o jogador leria o desfecho em vez de
     atravessá-lo, e a raid inteira caberia numa mensagem. */
  const rodarAFrente = () => {
    const r0 = $ref.raid;
    if (!r0 || r0.fase !== "luta" || r0.rompeu) return "";
    const out = rodadaDaFrente(r0, { rnd: sorteDoTurno("frente") });
    $ref.raid = out.raid; setRaid(out.raid);
    /* a hoste do painel acompanha a frente: quem caiu aparece caído na
       ficha do grupo, e não continua de pé em dois lugares diferentes */
    const persAtual = $ref.personagem || $render.personagem;
    const porNome = new Map(out.raid.hoste.map((h) => [h.nome, h]));
    const grupoNovo = (persAtual.grupo || []).map((g) => {
      const h = g.daRaid && porNome.get(g.nome);
      return h ? { ...g, vida: h.morto ? 0 : h.caido ? 0 : Math.max(1, g.vida || h.vidaMax) } : g;
    });
    const persNovo = { ...persAtual, grupo: grupoNovo };
    setPersonagem(persNovo); $ref.personagem = persNovo;
    for (const l of out.ledger) {
      if (l.tipo === "morreu") pushMsgs([{ autor: "sistema", texto: `☠ ${l.nome || l.quem} (${papelPorId(l.papel).rotulo}) morreu na linha.` }]);
    }
    let env = envelopeDaRodada(out.raid, out.ledger, { abatidos: out.abatidos });
    if (out.raid.rompeu) {
      env += `\n${envelopeDoRompimento(out.raid)}`;
      pushMsgs([{ autor: "sistema", texto: `⚑ A frente rompeu. ${out.raid.chefe} chega até você.` }]);
      /* e AGORA vira combate de verdade: o chefe, e o que furou a linha */
      const sobra = Math.max(1, Math.min(3, Math.round(out.raid.horda / 20)));
      const inimigos = [{ nome: out.raid.chefe, ameaca: "lendario", nivel: out.raid.nivelChefe, gd: portePorId(out.raid.porte).gd }];
      for (let i = 0; i < sobra; i++) inimigos.push({ nome: `O que passou (${i + 1})`, ameaca: "competente", nivel: out.raid.nivelChefe - 6 });
      const ab = abrirCombate(inimigos, { pers: $ref.personagem });
      if (ab.msgs.length) pushMsgs(ab.msgs.map((m) => ({ autor: "sistema", texto: m })));
      if (ab.pers) { setPersonagem(ab.pers); $ref.personagem = ab.pers; }
      if (ab.nota) env += `\n${ab.nota}`;
    }
    return env;
  };
  /* FAMA (v6.8): derivada das façanhas reais — a IA não infla nem esquece.
     Quando o patamar sobe, o mundo muda o tratamento (envelope no próximo envio). */
  /* T1-A, 5.ª fatia: a comparação dos patamares mora em `aFamaDoFeito`
     (src/motor/combate-do-turno.js), pura e à letra; daqui sai a fiação —
     a linha na tela, a nota, a última checagem. Provado byte a byte contra
     o órgão de antes (teste-motor-combate). */
  const checarFama = () => {
    const r = aFamaDoFeito(famaAtual(), $ref.famaPatamar);
    if (r.msgs.length) pushMsgs(r.msgs.map((texto) => ({ autor: "sistema", texto })));
    $ref.nota = notaComOTurno($ref.nota, r.paraOCronista);
    $ref.famaPatamar = r.fama;
    return r.fama;
  };
  /* NÊMESIS (v6.8): quando o nome cresce demais, alguém jura seu fim. */
  /* T1-A, 5.ª fatia: a regra (quem pode surgir, o dado, o vilão, o nome, o
     retrato, a identidade do fio) mora em `surgirANemesis`
     (src/motor/combate-do-turno.js), pura e à letra, com os porquês — entre
     eles o de não pôr o vilão no registo nem na tela. Daqui sai a fiação: o
     calou do fio, a nêmesis, a nota e as conquistas. Provado byte a byte
     contra o órgão de antes (teste-motor-combate). */
  const tentarSurgirNemesis = () => {
    const r = surgirANemesis({
      nemesis: $ref.nemesis, fama: famaAtual(), contadores: $ref.contadores, mapa: $ref.mapa,
      moedas: ($ref.personagem || {}).moedas || 0, dia: $ref.dia, espinha: $ref.espinha,
      derrotados: () => mundoDasMissoes().derrotados, genero: ($render.mundo && $render.mundo.genero) || cenarioAtivo().generos.padrao, lexico: (mundoAtual() || {}).lexico,
    }, { sorteDoTurno });
    for (const ef of r.efeitos) if (ef.tipo === "calou") calou(ef.onde, ef.erro);
    if (!r.nemesis) return;
    $ref.nemesis = r.nemesis; setNemesis(r.nemesis);
    $ref.nota = notaComOTurno($ref.nota, r.paraOCronista);
    checarConquistas();
  };
  /* ---------------- A MORTE DA NÊMESIS TEM UMA PORTA SÓ (v9.0) ----------------
     Antes, ela só "morria" se o registro de pessoas dissesse morto num dia
     que passasse. Um decreto cumprido pela cabeça dela, ou o próprio Mestre
     narrando a morte, não desligavam nada — e ela continuava caçando um herói
     que já a tinha enterrado. Agora tudo passa por aqui. */
  const encerrarNemesis = (causa) => {
    const n = garantirVilao($ref.nemesis);
    if (!n || n.status === "derrotada") return false;
    /* ---------------- ELE NÃO CAI ANTES DA HORA (v9.83) ----------------
       Vilão derrubado de primeira é monstro com nome. E a IA narra a morte
       dele com a melhor das intenções — porque a cena pedia um desfecho, e
       dar desfecho é o trabalho dela.

       O sistema recusa, e a recusa não é "nada aconteceu": ele ESCAPA
       custando alguma coisa. Uma peça dele fica para trás, um plano
       atrasa, alguém que estava com ele morre no lugar. É o que
       transforma cada encontro num degrau em vez de um empate. */
    /* nexo (11/10): a nêmesis do fio é o chefe do confronto final; caída EM
       COMBATE, quem decidiu foi o dado, e "ele escapa" seria mentira
       (`caiuOFio`, saga.js). A morte só narrada passa pela porta de sempre. */
    let caiuEmCombate = false;
    try { caiuEmCombate = caiuOFio(n, mundoDasMissoes().derrotados); } catch (e) { calou("caiuOFio", e); }
    if (!podeCair(n) && !caiuEmCombate) {
      $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDaQuedaCedoDemais(n)}`;
      return false;
    }
    $ref.nemesis = { ...n, status: "derrotada", odio: 0, mortaEm: $ref.dia, comoMorreu: causa || "" };
    setNemesis($ref.nemesis);
    /* a semente do vilao se paga quando ele cai: a promessa da campanha
       inteira, enfim colhida. So paga se madura — um vilao derrubado cedo
       demais (o que podeCair impede) nao teria a maturidade, e o Livro
       concorda com essa recusa sem precisar saber dela. */
    try {
      const Lv = garantirLivro($ref.promessas);
      const semV = Lv.sementes.find((x) => x.dona === "vilao" && x.alvo === (n.nome || "") && x.estado === "madura");
      if (semV) $ref.promessas = pagar(Lv, semV.id, { dia: $ref.dia, colheita: "a queda de " + (n.nome || "o vilao") }).livro;
    } catch (e) { /* pagar nunca pode custar a queda */ }
    /* o registro de pessoas é a memória do Mestre: ela precisa constar morta lá */
    const chave = Object.keys($ref.npcs || {}).find((k) => k.toLowerCase() === (n.nome || "").toLowerCase());
    if (chave && String($ref.npcs[chave].status || "").toLowerCase() !== "morto") {
      $ref.npcs = { ...$ref.npcs, [chave]: { ...$ref.npcs[chave], status: "morto", notas: `${$ref.npcs[chave].notas || ""} Morreu no dia ${$ref.dia}${causa ? ` — ${causa}` : ""}.`.trim() } };
      setNpcs($ref.npcs);
    }
    bumpCont("nemesisVencidas"); checarConquistas();
    marcarNoArco("nemesis", `matei ${n.nome}, ${n.titulo}`);
    pushMsgs([{ autor: "sistema", texto: linhaDaQueda(n) }]);
    $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDaQueda(n, causa)}`;

    /* ---------------- E O CAPÍTULO FECHA (v9.84) ----------------
       "O sistema de vilão deve ser tão bem elaborado que o fim do arco
       dele será o fim do capítulo."

       As duas coisas se encontram aqui: o vilão caiu E o arco chegou ao
       último momento. Uma sem a outra não fecha nada — matá-lo no meio o
       sistema não deixa, e chegar ao fim sem derrubá-lo é o clímax por
       acontecer.

       O que o jogador lê é uma linha: "Fim do capítulo 1". Nada de nome
       de etapa, nada de estrutura. E o Mestre recebe a ordem de fazer um
       EPÍLOGO — não um resumo, e sem anunciar o próximo vilão. */
    if (capituloFechado($ref.historia, true)) {
      const fc = fecharCapitulo($ref.historia, { vilao: n, dia: $ref.dia, causa });
      $ref.historia = fc.historia; setHistoria(fc.historia);
      pushMsgs([{ autor: "sistema", texto: linhaDoCapitulo(fc.registro) }]);
      $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDoCapitulo(fc.registro)}`;
      /* e a porta aparece — DEPOIS do epílogo, nunca antes: o envelope
         acima proíbe perguntar o que o jogador quer fazer agora, porque o
         silêncio depois do fim é parte do fim. O painel só renderiza no
         turno seguinte a este, quando a narração já chegou. */
      setOfertaCapitulo(fc.registro);
    }
    return true;
  };
  /* O registro de pessoas mudou (cronista, combate, ficção)? Se a ficha dela
     virou "morto", a perseguição termina na hora — não no próximo amanhecer. */
  const sincronizarNemesis = () => {
    const n = $ref.nemesis;
    if (!n || n.status === "derrotada") return;
    const ficha = Object.values($ref.npcs || {}).find((x) => (x.nome || "").toLowerCase() === (n.nome || "").toLowerCase());
    if (ficha && /(morto|morta|falecid|abatid|执行)/.test(String(ficha.status || "").toLowerCase())) {
      encerrarNemesis("confirmado no registro de pessoas");
    }
  };
  const processarNemesisDiaria = () => {
    const v = garantirVilao($ref.nemesis);
    if (!v || v.status === "derrotada") return;
    if (v !== $ref.nemesis) { $ref.nemesis = v; setNemesis(v); }
    sincronizarNemesis();
    if ($ref.nemesis.status === "derrotada") return;
    if (!podeAvancar($ref.nemesis, { dia: $ref.dia })) return;

    const proximo = Math.min(TOTAL_DE_PASSOS - 1, ($ref.nemesis.passo || 0) + 1);
    const alvo = escolherAlvo(CUSTO_DO_PASSO[proximo], {
      pessoas: Object.values($ref.npcs || {})
        .filter((n) => n && n.nome && String(n.status || "").toLowerCase() !== "morto" && n.nome !== $ref.nemesis.nome)
        .map((n) => n.nome),
      lugares: [...dominiosDe($ref.mapa).map((c) => c.nome), $ref.cidadeAtual].filter(Boolean),
      promessas: (missoesAtivas($ref.missoes) || []).map((m) => m.titulo).filter(Boolean),
      /* as marcas vão junto: deduplicar na entrada não bastava, porque sem
         isto ele continuaria SORTEANDO quem já levou e o passo não
         registraria nada — um passo no vazio, que é pior que repetir,
         porque some sem deixar rastro */
    }, sorteDoTurno("alvo-do-vilao"), $ref.nemesis.marcas || []);
    const r = avancarPlano($ref.nemesis, { dia: $ref.dia, alvo });
    if (!r) return;
    /* nexo (11/10): a nêmesis do fio só mostra o rosto no último ato — é lá
       que a espinha diz o nome (`oRostoEspera`, saga.js). O passo fica por
       dar, e o plano tenta de novo amanhã. */
    try { if (oRostoEspera($ref.espinha, ($ref.historia || {}).etapa || 0, r)) return; } catch (e) { calou("oRostoEspera", e); }
    $ref.nemesis = r.vilao; setNemesis(r.vilao);

    /* ---------------- O VILAO ESCREVE NO LIVRO (v9.199) ----------------
       Cada degrau da escada de revelacao e uma insinuacao de quem ele e.
       O Livro guarda essa progressao para que a catraca a enxergue: no
       "rosto" (terceira rega) a semente amadurece, e so entao uma virada
       sobre o vilao podera colher. A verdade fica no antagonista.js; aqui
       mora so o rastro do que foi mostrado. */
    try {
      const L = garantirLivro($ref.promessas);
      const nomeVilao = r.vilao.nome || "";
      const semVilao = L.sementes.find((x) => x.dona === "vilao" && x.alvo === nomeVilao && x.estado !== "paga" && x.estado !== "murcha");
      const FORMA_DA_FASE = { rumor: "aviso_do_bebado", marca: "brasao_limado", mao: "conserto_invisivel", rosto: "nome_na_lamina", guerra: "posto_sem_guarda", queda: "nome_na_lamina" };
      const faseId = (r.fase && r.fase.id) || "rumor";
      if (!semVilao) {
        $ref.promessas = semear(L, { forma: FORMA_DA_FASE[faseId] || "aviso_do_bebado", dona: "vilao", ato: 0, peso: "pesado", alvo: nomeVilao, material: "um sinal de " + (nomeVilao || "quem move as sombras") + ": " + ((r.fase && r.fase.revela) || "algo se aproxima"), dia: $ref.dia }).livro;
      } else {
        $ref.promessas = regar(L, semVilao.id, { dia: $ref.dia, cena: faseId }).livro;
      }
    } catch (e) { /* o Livro nunca pode custar o passo do vilao */ }

    /* A REVELAÇÃO é o ÚNICO momento em que o sistema fala em voz de sistema
       sobre ele — porque é um marco da campanha, e o jogador precisa saber
       que aquilo acabou de acontecer. Nas outras fases o sistema cala e
       deixa a cena falar. */
    const linha = linhaDoVilao(r);
    if (linha) pushMsgs([{ autor: "sistema", texto: linha }]);
    if (r.revelacao) {
      $ref.npcs = { ...$ref.npcs, [r.vilao.nome]: criarNPC(r.vilao.nome, {
        papel: r.vilao.titulo, relacao: "inimigo",
        notas: `O VILÃO desta campanha. Acredita que ${r.vilao.crenca}. Quer ${r.vilao.quer}.`,
        conhecidoEm: $ref.dia, ultimaVez: $ref.npcTurno,
      }) };
      setNpcs($ref.npcs);
      marcarNoArco("nemesis", `soube quem é ${r.vilao.nome}`);
    }
    /* ---------------- E A MESA SENTE (v9.89) ----------------
       `processarNemesisDiaria` não tocava na mesa, e por isso o passo do
       vilão — que é a maior pressão que este jogo produz — não esquentava
       nada. A temperatura podia ler "fria" no turno seguinte a ele e
       mandar o mundo puxar um fio da memória JUNTO, empilhando duas
       pressões no mesmo envelope por não saber da primeira.

       O passo entra como perigo, que é o que ele é. Não como luta: ele
       ainda não veio em pessoa, e marcar luta faria o mestre parar de
       conceder dado numa cena que não tem dado nenhum. */
    $ref.textura = { ...($ref.textura || {}), perigo: true };
    $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDoAvanco(r)}${levaForma(r) ? formaDoMestre({ fio: "vilao" }) : ""}`;

    /* ---------------- O ARCO ANDA COM ELE (v9.84) ----------------
       Até aqui o arco andava por CONTAGEM: cada missão concluída, relógio
       cheio ou ameaça abatida somava marcos, e a cada tanto o momento
       virava. Era um termômetro de atividade — e um jogador que fizesse
       vinte favores pequenos chegava ao momento mais escuro da história
       sem nunca ter tido contra quem.

       O arco de uma história não anda porque o herói andou: anda porque o
       ANTAGONISTA andou. As duas peças passam a ser uma só. */
    const casou = casarComVilao($ref.historia, r.fase.ordem);
    if (casou.virou) {
      $ref.historia = casou.historia; setHistoria(casou.historia);
      $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDeVirada(casou)}`;
    }
  };
 // envelopes do correio do(s) dia(s) processado(s)
  const avancarDiasReino = (n) => {
    const eventos = [];
    let cofreDeltaTotal = 0;
    let r = $ref.reino;
    for (let i = 0; i < n; i++) {
      $ref.dia += 1;
      /* TEMPLOS (v8.9): onde há para onde rezar, o povo aguenta mais —
         o equilíbrio da felicidade daquele domínio sobe com o templo. */
      /* v9.139: o alvo da felicidade deixou de ser 55 fixo. Ele responde ao
         imposto, às obras e a quem governa — é o que faz da aba um governo:
         a decisão de hoje aparece na cidade daqui a alguns dias, e não no
         mesmo instante em que o botão é apertado. O templo continua somando
         por cima, porque a fé e o governo são coisas diferentes. */
      const alvos = (() => {
        const doTemplo = alvosFelicidade($ref.mapa, $ref.devocao);
        const out = {};
        for (const [nome, g] of Object.entries($ref.governos || {})) {
          const base = equilibrioDe({ semente: sementeMundo(), gov: g });
          out[nome] = Math.max(0, Math.min(100, base + ((doTemplo[nome] || 55) - 55)));
        }
        for (const [nome, v] of Object.entries(doTemplo)) if (out[nome] == null) out[nome] = v;
        return out;
      })();
      const { reino: nr, evento } = processarDiaReino(r, $ref.mapa, alvos);
      r = nr;
      /* v9.139: A OBRA BARRA O EVENTO. É a forma mais concreta de uma
         construção existir: o celeiro não dá pontos — o celeiro faz a praga
         nos celeiros parar de acontecer. Sem isto, "obra" seria um número
         somado a outro número. */
      const barrado = evento && (bonusDeObras(($ref.governos || {})[evento.cidade]).impede).has(evento.evento.id);
      if (evento && !barrado) {
        eventos.push(evento);
        cofreDeltaTotal += evento.cofreDelta || 0;
        bumpCont("eventosReino");
      }

      /* ---------------- O DIA DO GOVERNO (v9.139) ----------------
         Três coisas precisam do dia passando: a obra que fica pronta (obra
         que termina no clique é item de loja), a fúria que conta os dias, e
         a cidade que se perde. */
      /* ---------------- A GUERRA CUSTA (v9.142) ----------------
         `gestao.js` dizia desde a v6.5: "guerra: sem bônus — os efeitos da
         guerra são ficção do Mestre". Ou seja, declarar guerra não fazia
         absolutamente nada, e a única coisa que impedia o jogador de
         declarar guerra a todo mundo era não ter motivo. */
      {
        const golpe = golpeDaGuerra(potenciasAqui(), { dominios: Object.keys(r).length });
        if (golpe) {
          r = Object.fromEntries(Object.entries(r).map(([nome, v]) => [nome, { ...v, felicidade: Math.max(0, Math.min(100, v.felicidade + golpe.felicidade)) }]));
          if (i === 0) pushMsgs([{ autor: "sistema", texto: `⚔ ${golpe.o} (${golpe.felicidade} de ânimo por dia).` }]);
        }
      }

      /* v9.140: a reivindicação amadurece com o dia, como a obra. */
      if ($ref.tomando) {
        const alvo = cidadeDoMapa($ref.tomando.cidade);
        if (!alvo) { $ref.tomando = null; setTomando(null); }
        else if (tomadaPronta($ref.tomando, alvo, $ref.dia)) {
          const aRevelia = !!$ref.tomando.aRevelia;
          $ref.mapa = { ...$ref.mapa, cidades: ($ref.mapa.cidades || []).map((c) => (c.nome === alvo.nome ? { ...c, relacao: "jogador", faccao: $ref.faccaoJogador || c.faccao } : c)) };
          setMapa($ref.mapa);
          /* a cidade nasce no humor que a sua fama comprou */
          r = { ...r, [alvo.nome]: { populacao: (r[alvo.nome] && r[alvo.nome].populacao) || 800, felicidade: humorAoTomar(aRevelia) } };
          const casa = minhaCasa();
          if (casa) { const cr = crescerACasa(casa, CRESCE.dominio, "tomou uma cidade"); trocarCasa(cr.guilda); }
          $ref.tomando = null; setTomando(null);
          pushMsgs([{ autor: "sistema", texto: `⚑ ${alvo.nome} é sua.${aRevelia ? " O povo aceitou a bandeira e não aceitou você." : ""} Veja em Gestão › Domínios.` }]);
          $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDaTomada(alvo, { aRevelia, casa: (casa || {}).nome })}`;
        }
      }
      {
        let govs = { ...($ref.governos || {}) };
        let mudou = false;
        for (const [nome, g0] of Object.entries(govs)) {
          let g = g0;
          const pronta = obraPronta(g, $ref.dia);
          if (pronta) {
            g = terminarObra(g); mudou = true;
            pushMsgs([{ autor: "sistema", texto: `${pronta.icone} ${nome}: ${pronta.nome} de pé — ${pronta.porque}.` }]);
            $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoDominio("obraConcluida", { cidade: nome, obra: pronta.nome });
          }
          const fel = (r[nome] && r[nome].felicidade) != null ? r[nome].felicidade : 55;
          const g2 = pulsoDaFuria(g, fel, $ref.dia);
          if (g2 !== g) { g = g2; mudou = true; }
          const rev = revoltaAgora(g, $ref.dia);
          if (rev && rev.caiu) {
            /* A CIDADE SAI. O evento "murmúrios de revolta" existia desde a
               v6.5 e não levava a nada: baixava um número que voltava a
               subir sozinho. Um reino que não pode ser perdido não é um
               reino, é um placar. */
            $ref.mapa = { ...$ref.mapa, cidades: ($ref.mapa.cidades || []).map((c) => (c.nome === nome ? { ...c, relacao: "neutra", sede: false } : c)) };
            setMapa($ref.mapa);
            delete govs[nome]; mudou = true;
            const nr2 = { ...r }; delete nr2[nome]; r = nr2;
            pushMsgs([{ autor: "sistema", texto: `🔥 ${nome} se revoltou e não é mais sua. ${rev.prazo} dias de fúria, e ninguém desceu o imposto.` }]);
            $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoDominio("revolta", { cidade: nome, dias: rev.prazo });
          } else if (rev && rev.faltam <= 3) {
            pushMsgs([{ autor: "sistema", texto: `⚠ ${nome} está a ${rev.faltam} dia${rev.faltam === 1 ? "" : "s"} da revolta.` }]);
          }
          if (govs[nome]) govs[nome] = g;
        }
        if (mudou) { $ref.governos = govs; setGovernos(govs); }
      }
      /* ---------------- A CASA, POR DIA (v9.133) ----------------
         Quem foi mandado volta, e a lei olha o calendario. As duas coisas
         precisam do dia passando: uma tarefa que resolvesse na hora seria um
         botao que imprime ouro, e uma lei de presenca que nunca contasse os
         dias nao seria lei. */
      {
        const casa = minhaCasa();
        if (casa) {
          const prontas = ($ref.tarefasCasa || []).filter((t) => $ref.dia - t.desde >= t.dias);
          if (prontas.length) {
            let g2 = casa;
            let p2 = $ref.personagem || $render.personagem;
            for (const t of prontas) {
              const r2 = resolverTarefaDaCasa(t);
              const d = DESFECHO_TAREFA[r2.desfecho];
              eventos.push({ texto: `${d.icone} ${d.diz(r2)}` });
              /* quem volta com o servico feito traz a paga E a contribuicao;
                 quem nao volta sai da lista de membros para sempre */
              if (r2.desfecho === "feito") {
                g2 = { ...g2, cofre: g2.cofre + Math.round(t.paga * 0.6), membros: g2.membros.map((m) => (m.nome === t.quem ? { ...m, fora: false } : m)) };
                const rc = contribuirNaCasa(g2, Math.round((t.contribui || 0) / 2), t.titulo);
                g2 = rc.guilda;
                p2 = { ...p2, moedas: (p2.moedas || 0) + Math.round(t.paga * 0.4) };
              } else if (r2.desfecho === "voltou") {
                g2 = { ...g2, membros: g2.membros.map((m) => (m.nome === t.quem ? { ...m, fora: false } : m)) };
              } else {
                g2 = { ...g2, membros: g2.membros.filter((m) => m.nome !== t.quem) };
              }
            }
            $ref.tarefasCasa = ($ref.tarefasCasa || []).filter((t) => $ref.dia - t.desde < t.dias);
            setTarefasCasa($ref.tarefasCasa);
            setPersonagem(p2); $ref.personagem = p2;
            trocarCasa(g2);
          }
          /* o sangue entre casas: gente de outra casa que caiu sobe o atrito,
             e atrito no teto e guerra */
          {
            const c3 = minhaCasa();
            if (c3) {
              const sg = sangueEntreCasas(c3, $ref.guildas || [], ($ref.baseMundo || {}).mortos || []);
              if (sg.viradas.length) {
                trocarCasa(sg.guilda);
                for (const v of sg.viradas) eventos.push({ texto: `⚔ ${c3.nome} e ${v.casa}: ${v.de} → ${v.para}.` });
              }
            }
          }
          /* a lei, uma por vez: tres punicoes no mesmo dia viram tela de erro */
          const casaAgora = minhaCasa();
          if (casaAgora) {
            const inf = conferirLeisDaCasa(casaAgora, { dia: $ref.dia, mortos: ($ref.baseMundo || {}).mortos || [], contratosDeFora: 0 });
            if (inf) {
              const pu = punirNaCasa(casaAgora, inf);
              trocarCasa(pu.guilda);
              if (pu.expulso) eventos.push({ texto: `⛔ ${casaAgora.nome} pos voce na rua: ${inf.falta}.` });
              else if (pu.caiu) eventos.push({ texto: `▼ ${casaAgora.nome} te rebaixou a ${pu.caiu.nome}: ${inf.falta}.` });
              else eventos.push({ texto: `${inf.icone} ${casaAgora.nome} anotou uma falta: ${inf.falta}.` });
            }
          }
        }
      }
      /* CORREIO (v7.0): respostas chegam, petições surgem/expiram — por dia. */
      const faccNomes = (($ref.mapa && $ref.mapa.faccoes) || [])
        .filter((f) => f && f.nome && !f.doJogador && f.relacao !== "jogador")
        .map((f) => f.nome);
      /* v9.144: A CARTA PASSA PELA MESMA BALANÇA DA MESA. Sem isto o
         correio era uma segunda diplomacia por sorteio: recusado na mesa,
         bastava insistir por carta até sair. */
      const potsCorreio = potenciasAqui().filter((x) => !x.doJogador);
      const pc = processarDiaCorreio($ref.correio, { sorte: sorteDoTurno("correio"),
        dia: $ref.dia,
        fama: famaAtual(),
        ehLider: cidadesDominadas($ref.mapa).length > 0 || !!($ref.mapa.faccoes || []).some((f) => f.doJogador),
        faccoes: [...new Set([...faccNomes, ...potsCorreio.map((x) => x.nome)])],
        potencias: potsCorreio,
        dip: $ref.diplomacia,
        meuPoder: meuPoderDiplomatico(),
      });
      $ref.correio = pc.correio; setCorreio(pc.correio);
      /* o ouro que foi junto com a carta chegou lá, e ninguém devolve ouro:
         sobe o apreço mesmo quando a resposta é não */
      if ((pc.efeitos.aprecoAdd || []).length) {
        let d = $ref.diplomacia;
        for (const a of pc.efeitos.aprecoAdd) d = mexerNoApreco(d, a.nome, a.quanto);
        guardarDiplomacia(d);
      }
      aplicarEfeitosCorreio(pc.efeitos);
      pc.msgs.forEach((m) => {
        pushMsgs([{ autor: "sistema", texto: `✉️ ${m.replace(/^\[CORREIO — [^\]]+\]\s*/, "")}` }]);
        $ref.correioMsgsDia.push(m);
      });
    }
    /* O DIA DA FÉ (v8.9): a devoção agora vive NO MAPA — templos pregam,
       a presença do herói converte, a fé viaja pelas estradas e míngua onde
       não há nada disso. Os fiéis do painel são a soma de tudo isso; o PF
       vem das preces (proporcional aos fiéis) mais o que os templos rendem.
       A IA não concede PF nem fiéis: ela só gasta em milagres. */
    {
      const dv = $ref.divindade;
      if (dv && dv.despertar) {
        const fieisAntes = fieisTotais($ref.mapa, $ref.devocao);
        let dev = $ref.devocao;
        let pfTemplos = 0;
        const marcos = [];
        for (let i = 0; i < n; i++) {
          const passo = processarDiaFe({ mapa: $ref.mapa, devocao: dev, divindade: dv, dia: $ref.dia, cidadeAtual: $ref.cidadeAtual });
          dev = passo.devocao; pfTemplos += passo.pf; marcos.push(...passo.marcos);
        }
        $ref.devocao = dev; setDevocao(dev);
        const fieisDepois = fieisTotais($ref.mapa, dev);
        const teto = pfMaximo({ ...dv, fieis: fieisDepois });
        const ganho = pfPorDia({ ...dv, fieis: fieisDepois }) * n + pfTemplos;
        const novo = { ...dv, fieis: fieisDepois, pf: Math.min(teto, (dv.pf || 0) + ganho) };
        $ref.divindade = novo; setDivindade(novo);
        if (novo.pf > (dv.pf || 0)) pushMsgs([{ autor: "sistema", texto: `✨ As preces rendem ${novo.pf - (dv.pf || 0)} PF${pfTemplos ? ` (${pfTemplos} vindos dos templos)` : ""} (${novo.pf}/${teto}).` }]);
        if (fieisDepois < fieisAntes) pushMsgs([{ autor: "sistema", texto: `🌟 A fé míngua onde não há templo nem sinal seu: ${fieisAntes - fieisDepois} deixam de rezar.` }]);
        /* marcos de fé viram notícia para o jogador E envelope para o Mestre */
        marcos.slice(0, 3).forEach((m) => {
          pushMsgs([{ autor: "sistema", texto: m.texto }]);
          $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDaFe("feNaGeografia", { cidade: m.cidade, de: m.de, para: m.para, fe: m.fe, subiu: m.subiu });
        });
      }
    }
    $ref.reino = r; setReino(r); setDia($ref.dia);
    if (cofreDeltaTotal !== 0) {
      $ref.guilda = { ...$ref.guilda, cofre: Math.max(0, ($ref.guilda.cofre || 0) + cofreDeltaTotal) };
      setGuilda($ref.guilda);
    }
    if (eventos.length) checarConquistas();
    /* por dia passado: fama recalculada, nêmesis cresce, rumores viajam */
    for (let i = 0; i < n; i++) {
      checarFama();
      tentarSurgirNemesis();
      processarNemesisDiaria();
      try { const r = promoverNoDia(sementeMundo(), $ref.mapa, contextoDoElenco(), $ref.elenco, { npcs: $ref.npcs, grupo: ($ref.personagem || $render.personagem || {}).grupo || [], dia: $ref.dia - (n - 1 - i) }); $ref.elenco = r.estado; } catch (e) { calou("promoverNoDia", e); } /* MM8f: o elenco age fora de cena, e o que é de longe corre como boato */ try { const diaDaVolta = $ref.dia - (n - 1 - i); const r2 = agirForaDeCena(sementeMundo(), $ref.mapa, contextoDoElenco(), $ref.elenco, { dia: diaDaVolta, npcs: $ref.npcs, grupo: ($ref.personagem || $render.personagem || {}).grupo || [] }); $ref.elenco = r2.estado; const boatoDoMundo = boatoDoForaDeCena(sementeMundo(), $ref.mapa, contextoDoElenco(), $ref.elenco, { dia: diaDaVolta, cidade: $ref.cidadeAtual, npcs: $ref.npcs }); if (boatoDoMundo) { pushMsgs([{ autor: "sistema", texto: `🗞 Corre a boca miúda: ${boatoDoMundo}…` }]); $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoMundo("rumorDeLonge", { boato: boatoDoMundo }); } } catch (e) { calou("agirForaDeCena", e); }
      if (sorteDoTurno("rumor")() < 0.25) {
        const boato = rumorDoDia({ ...$ref.contadores, cicatrizes: ($render.personagem.cicatrizes || []).length, quaseMorte: $ref.contadores.quaseMorte || 0 }, $render.personagem.nome, patamarFama(famaAtual()), !!($ref.nemesis && $ref.nemesis.status !== "derrotada"));
        pushMsgs([{ autor: "sistema", texto: `🗞 Corre a boca miúda: ${boato}…` }]);
        $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDoMundo("rumor", { boato });
      }
    }
    return eventos;
  };
  const envelopeEventosReino = (evs) => {
    const correioEnv = $ref.correioMsgsDia.length ? "\n" + $ref.correioMsgsDia.join("\n") : "";
    $ref.correioMsgsDia = [];
    const base = !evs.length ? "" : "\n" + evs.map((ev) => oEnvelopeDoMundo("eventoDeReino", { titulo: ev.evento.titulo, cidade: ev.cidade, texto: ev.evento.txt(ev.cidade), felDelta: ev.felDelta, popDelta: ev.popDelta, cofreDelta: ev.cofreDelta, soSeInfeliz: ev.evento.soSeInfeliz })).join("\n");
    return base + correioEnv;
  };
  /* CORREIO (v7.0): efeitos concretos aplicados pelo app — felicidade nos
     domínios, moedas no cofre/bolso, tratados gravados no mapa (ficção obedece). */
  const aplicarEfeitosCorreio = (ef) => {
    if (!ef) return;
    if (ef.felicidade) {
      const r = { ...$ref.reino };
      Object.keys(r).forEach((k) => { r[k] = { ...r[k], felicidade: Math.max(0, Math.min(100, (r[k].felicidade || 55) + ef.felicidade)) }; });
      $ref.reino = r; setReino(r);
    }
    if (ef.moedas) {
      if (ef.moedas > 0) {
        $ref.guilda = { ...$ref.guilda, cofre: ($ref.guilda.cofre || 0) + ef.moedas };
        setGuilda($ref.guilda);
      } else {
        let falta = -ef.moedas;
        const doBolso = Math.min($render.personagem.moedas || 0, falta);
        if (doBolso) setPersonagem((p) => ({ ...p, moedas: p.moedas - doBolso }));
        falta -= doBolso;
        if (falta > 0) {
          $ref.guilda = { ...$ref.guilda, cofre: Math.max(0, ($ref.guilda.cofre || 0) - falta) };
          setGuilda($ref.guilda);
        }
      }
    }
    const ROTULO_TRATADO = { alianca: "Aliança", guerra: "Guerra", comercio: "Acordo comercial", casamento: "União por casamento", apoio: "Apoio militar" };
    const MAPA_TRATADO = { alianca: "alianca", guerra: "guerra", comercio: "comercio", casamento: "alianca", apoio: "comercio" };
    (ef.tratadosAdd || []).forEach(({ faccao, tratado }) => {
      const rotulo = ROTULO_TRATADO[tratado] || tratado;
      const c = garantirCorreio($ref.correio);
      if (!c.tratados.some((t) => t.faccao === faccao && t.tratado === tratado)) {
        c.tratados = [...c.tratados, { faccao, tratado, rotulo, dia: $ref.dia }];
        $ref.correio = c; setCorreio(c);
      }
      const m = $ref.mapa;
      if (m && Array.isArray(m.faccoes)) {
        m.faccoes = m.faccoes.map((f) => f.nome === faccao ? { ...f, tratado: MAPA_TRATADO[tratado] || f.tratado || "nenhum" } : f);
        setMapa({ ...m });
      }
    });
    (ef.tratadosRem || []).forEach(({ faccao, tratado }) => {
      const c = garantirCorreio($ref.correio);
      c.tratados = c.tratados.filter((t) => !(t.faccao === faccao && t.tratado === tratado));
      $ref.correio = c; setCorreio(c);
      const m = $ref.mapa;
      if (m && Array.isArray(m.faccoes) && tratado === "guerra") {
        m.faccoes = m.faccoes.map((f) => f.nome === faccao && f.tratado === "guerra" ? { ...f, tratado: "nenhum" } : f);
        setMapa({ ...m });
      }
    });
  };
  /* RELAÇÕES FORMAIS (v6.5): o jogador pode fixar a relação com qualquer
     pessoa conhecida — inclusive CÔNJUGE. Vira canon absoluto via envelope.
     É também o remendo para histórias já vividas (ex.: um casamento que a
     ficção consumou mas o registro não sabia). */
  const definirRelacao = (nome, relacao) => {
    const reg = $ref.npcs;
    /* membro do grupo sem ficha? o app cria na hora — relação formal precisa de registro */
    let n = reg[nome];
    if (!n) {
      const comp = ($render.personagem.grupo || []).find((g) => (g.nome || "").toLowerCase() === nome.toLowerCase());
      if (!comp) return;
      n = criarNPC(comp.nome, { papel: [comp.classe, comp.subclasse].filter(Boolean).join(" · ") || "companheiro", relacao: "aliado", notas: comp.descricao || "", conhecidoEm: 0 });
    }
    if ((n.relacao || "") === relacao) return;
    const rotulo = relacaoNPC(relacao).rotulo;
    $ref.npcs = { ...reg, [nome]: { ...n, nome, relacao, ultimaVez: n.ultimaVez || $ref.npcTurno } };
    setNpcs($ref.npcs);
    pushMsgs([{ autor: "sistema", texto: `🤝 Relação formal registrada: ${nome} agora é ${rotulo}.` }]);
    $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDaGente("relacaoFormal", { nome, rotulo, relacao });
  };
  /* ---------------- CONQUISTAS E VÍNCULOS (100% por código, zero tokens) ---------------- */
  /* T1-A, 6.ª fatia: a conta mora em `somarAoContador` (src/motor/combate-do-turno.js) */
  const bumpCont = (campo, n = 1) => { $ref.contadores = somarAoContador($ref.contadores, campo, n); };
  const checarConquistas = (pers) => {
    const p = pers || $render.personagem;
    if (!p) return;
    const fs = $ref.mapa.faccoes || [];
    const stats = {
      ...$ref.contadores,
      nivel: p.nivel || 1,
      moedas: p.moedas || 0,
      companheiros: (p.grupo || []).length,
      npcs: Object.keys($ref.npcs || {}).length,
      criaturasDescobertas: $ref.descobertas.length,
      cicatrizes: (p.cicatrizes || []).length,
      diasVividos: $ref.dia,
      fama: famaAtual(),
      temNemesis: !!($ref.nemesis && $ref.nemesis.status !== "derrotada"),
      dominios: dominiosDe($ref.mapa).length,
      temGuilda: !!$ref.faccaoJogador,
      guildaNivel: $ref.guilda.nivel,
      cofre: $ref.guilda.cofre,
      tratados: fs.filter((f) => f.tratado === "comercio" || f.tratado === "alianca").length,
      vassalos: fs.filter((f) => f.tratado === "vassalagem").length,
      guerras: fs.filter((f) => f.tratado === "guerra").length,
      vinculoAmizade: (p.grupo || []).filter((g) => (g.vinculo || 0) >= 50).length,
      vinculoProfundo: (p.grupo || []).filter((g) => (g.vinculo || 0) >= 100).length,
      itemLendario: [...(p.equipamento || []), ...Object.values(p.equipados || {}), ...(p.grupo || []).flatMap((g) => [...(g.equipamento || []), ...Object.values(g.equipados || {})])].some((i) => i && i.raridade === "lendario"),
    };
    const novas = avaliarConquistas(stats, $ref.conquistas.desbloqueadas);
    if (!novas.length) return;
    const c = { desbloqueadas: { ...$ref.conquistas.desbloqueadas }, ordem: [...$ref.conquistas.ordem] };
    const msgs = novas.map((n) => {
      c.desbloqueadas[n.id] = true; c.ordem.push(n.id);
      return { autor: "sistema", texto: `🏆 Conquista desbloqueada: ${n.icone} ${n.nome} — título "${n.titulo}"` };
    });
    $ref.conquistas = c; setConquistas(c);
    pushMsgs(msgs);
  };
  /* DIPLOMACIA: propostas a potências vão para a ficção; o Mestre decide a
     resposta do líder e só registra o tratado firmado — os efeitos (renda,
     tributo) são calculados pelo app. */
  /* ---------------- A DIPLOMACIA (v9.142) ----------------
     Esta era a última sala em que a IA decidia o que existe. O texto que ia
     ao Narrador dizia "A DECISÃO É DELE(A)" e mandava a IA escrever o
     tratado de volta no mundo. Todo o resto do projeto foi feito para tirar
     exatamente isso dela.

     Agora quem pesa é o código — apreço, apetite, medo, orgulho, poder
     relativo, fama, e o que você fez desde a última vez — e o Narrador
     recebe o veredito como fato consumado, para encenar a mesa. */
  const potenciasAqui = () => potenciasDoMundo({
    guildas: $ref.guildas || [],
    faccoes: ($ref.mapa || {}).faccoes || [],
    faccaoJogador: $ref.faccaoJogador || "",
  });
  const meuPoderDiplomatico = () => {
    const casa = minhaCasa();
    /* o que você põe na mesa: a sua casa, e o que já é seu no mapa */
    return Math.min(100, Math.round((casa ? casa.poder : 0) + dominiosDe($ref.mapa).length * 6));
  };
  const guardarDiplomacia = (d) => {
    $ref.diplomacia = d; setDiploState(d); salvar({ diplomacia: d });
  };
  /* ---------------- o que o render calculava ---------------- */
  /* que gesto POSITIVO cada postura dura registra para quem esta ao lado:
     na crise/escassez, ajudou escondido; no luto, ficou; na cacada, escondeu. */
  const GESTO_DA_POSTURA = Object.prototype.hasOwnProperty.call($render0, "GESTO_DA_POSTURA") ? $render0.GESTO_DA_POSTURA : { crise: "ajudou_escondido", escassez: "ajudou_escondido", luto: "ficou", cacada: "escondeu_voce" };
  /* que reviravoltas acendem o peso da traicao (Furia) e a delacao.

     R3 (v9.229): NENHUMA MAIOR ENTRA AQUI, e e de proposito — quem vier
     "consertar" a lista amanha, leia antes. O alvo de `cidade_dizimo` e uma
     CIDADE, nao gente: `registrarGesto({ quem: rev.alvo, gesto: "delatou" })`
     poria uma delacao na conta de um lugar, e o elenco passaria a ter um
     nome que ninguem pode olhar na cara. As outras duas maiores revelam um
     PASSADO (quem assinou a primeira missao, quem ensinou o oficio), e nao
     uma delacao de agora: acender `traicaoRevelada` nelas seria a Furia
     cobrando de um fato antigo o preco de uma facada recente. */
  const TRAICAO = Object.prototype.hasOwnProperty.call($render0, "TRAICAO") ? $render0.TRAICAO : ["aliado_agente", "informante_duplo", "trai_para_proteger"];
  /* ---------------- O PLANO ANDA (v9.83) ----------------
     Era um contador: `odio` subia de dois a cinco por dia e, em quatro
     números fixos, disparava difamação, sabotagem, assassinos e confronto
     — sempre nessa ordem, sempre nesse ritmo, em toda campanha que este
     jogo já teve. E enquanto o número corria, NADA acontecia no mundo.

     Agora o que anda é um PLANO de nove passos, e cada passo tira alguma
     coisa — escolhida entre o que o jogador tem de verdade: a pessoa cujo
     nome ele escreveu, a cidade que ele tomou, a promessa que ele fez.
     Ameaçar "o reino" é meteorologia; isto é vilania.

     E anda devagar de propósito: um vilão que se move todo dia é barulho,
     e barulho não assusta. */
  const CUSTO_DO_PASSO = Object.prototype.hasOwnProperty.call($render0, "CUSTO_DO_PASSO") ? $render0.CUSTO_DO_PASSO : ["sombra", "voz", "lugar", "esperanca", "gente", "lugar", "voz", "gente", "tudo"];

  /* ---------------- o trecho de `enviar`, à letra ---------------- */
  let $falas = Promise.resolve([]);
  const montar = () => {
    const conteudo = $in.frase;
    /* O que EU pedi neste turno — só a minha frase distingue "o Mestre me
       devolveu à cidade" de "eu voltei".

       Turno do SISTEMA não é pedido meu, e a diferença é o colchete: todo
       envelope começa por um cabeçalho entre colchetes, e o que eu digito
       nunca começa assim. Sem essa distinção o cão de guarda se desarmava
       sozinho — dentro do envelope de "passar o tempo" está escrito "NÃO me
       leve de volta à cidade", e o detector lia a proibição como pedido. */
    $ref.ultimoPedido = String(conteudo || "").trimStart().startsWith("[") ? "" : String(conteudo || "");
    varrerChao();   // outro lugar, outro dia: o que ficou para trás fica para trás
    /* v9.45: o trabalho de bastidor entra AQUI, junto do bilhete do sistema —
       e só aqui. Cada poção fervida na bancada anotou uma linha e não acordou
       o Mestre; agora todas viram um envelope só, colado à frente do que o
       jogador de fato pediu. É o que separa "ato na cena" de "trabalho de
       mãos": o primeiro merece um turno, o segundo merece uma frase. */
    const oficina = bilheteDaOficina($ref.oficina);
    if (oficina) $ref.oficina = criarOficina();
    talvezChegarSozinho();
    talvezAndarNaCidade(conteudo);
    /* ---------------- MM18: O MESTRE QUE ESCUTA ----------------
       A frase lida uma vez, o fio da história, o degrau da escada (por
       turnos sem tocar o fio). Numa pergunta, no degrau da escuta, o
       compasso e a forma da cena SEGURAM pela porta que já têm: cortar o
       envelope depois seria o sistema andar uma história que ninguém
       contou. `pedidoEsc` nulo = a escuta não está (a Noite, ou um erro):
       o turno segue como era. */
    /* (T1-A, 8.ª fatia) a escuta lê o pedido e anda no motor
       (`oPedidoDaEscuta`, `aEscutaAnda`, src/motor/antes-do-mestre.js) */
    let pedidoEsc = null, fioEsc = [], segurarEsc = false;
    try {
      const doPedido = oPedidoDaEscuta({ modo: $ref.modo, abertura: $ref.abertura, missoes: $ref.missoes, escuta: $ref.escuta }, conteudo);
      if (doPedido.erro) calou("a escuta lê o pedido", doPedido.erro);
      pedidoEsc = doPedido.pedido; fioEsc = doPedido.fio; segurarEsc = doPedido.segurar;
    } catch (e) { calou("a escuta lê o pedido", e); pedidoEsc = null; fioEsc = []; segurarEsc = false; }
    const doCompasso = talvezAndarOCompasso(conteudo, { segurar: segurarEsc });
    const formaDaCena = doCompasso || segurarEsc ? "" : talvezDarFormaACena(conteudo);
    /* A FRENTE ANDA UMA RODADA POR TURNO MEU (v9.115), e anda aqui, no
       mesmo lugar em que todo sistema de turno anda. Uma rodada por turno,
       nunca um laço: se a frente resolvesse tudo de uma vez, o jogador
       leria o desfecho da raid em vez de atravessá-lo. */
    const daFrente = String(conteudo || "").trimStart().startsWith("[RAID") ? "" : rodarAFrente();
    /* A MISSÃO DO MESTRE E A VIRADA DELA (v9.117), no mesmo ponto em que
       todo sistema de turno anda. A ordem importa: primeiro se VIRA o que
       já estava em curso (a emboscada, a presa que aparece) e só depois se
       dá missão nova — senão o turno em que a caçada acontece seria também
       o turno em que uma trama nova chega, e as duas dividiriam a cena. */
    /* A VIRADA NÃO TEM GUARDA DE COLCHETE, e a primeira versão tinha —
       custou a prova na tela. O turno em que o jogador continua depois de
       uma rolagem chega como "[ROLAGEM] …", e é exatamente o turno em que
       ele acabou de PROCURAR a praga: com o guarda, a caçada não
       disparava justamente na hora em que devia. Ela já é idempotente
       (`cacadasFeitasRef`), então o guarda não protegia de nada. */
    const daVirada = talvezVirar();
    const daTrama = daVirada ? "" : (String(conteudo || "").trimStart().startsWith("[") ? "" : talvezDarUmaTrama());
    /* v9.104: A PAUTA VEM NA FRENTE. Ela é o que o SISTEMA decidiu, e o
       Narrador precisa saber ONDE a cena acontece antes de ler qualquer
       instrução sobre o que fazer nela — a ordem importa para quem lê.
       Por ora ela carrega o Geógrafo; os outros sistemas se mudam para
       dentro dela quando chegar a vez de cada um. */
    /* v9.106: o ATO do herói, lido do que ele escreveu, ANTES da Pauta —
       é o que a maioria dos movimentos do Intérprete consulta. */
    $ref.atoDoTurno = atoDoTexto(conteudo);
    $ref.ultimaAcao = String(conteudo || "").slice(0, 200);
    /* ---------------- AS BOCAS (v9.135) ----------------
       Antes da Pauta, porque a fala e conteudo dela. O Interprete decide o
       que cada um FAZ; o ator diz o que ele DIZ, uma chamada pequena por
       pessoa, em paralelo. Nao roda em envelope do sistema (o que comeca
       por colchete nao e frase do jogador) nem sem gente na cena. */
    $ref.interprete = $interprete(pessoasDaCena(), { elenco: $ref.elencoMem });
    for (const m of $ref.interprete.marcas) $ref.elencoMem = marcarMovimento($ref.elencoMem, m.nome, m.id, m.gesto);
    $ref.propositosDoTurno = dispararPropositos(conteudo);
    mexerNaReviravolta();
    mexerNoEncalhe();
    mexerNaPostura();
    mexerNoEpisodio();
    mexerNaNoite();
    $falas = colherAsFalas(conteudo); /* as bocas: a promessa sai aqui, a espera é lá fora */
    return { daFrente, daTrama, daVirada, doCompasso, fioEsc, formaDaCena, oficina, pedidoEsc };
  };
  let saida;
  try {
    saida = comSorte($in.sorte, montar);
    $ref.falasDoTurno = await $falas;
  } finally { descarregar(); }
  /* no App, o que o setTimeout lança não volta ao turno: aqui vai ao calou */
  for (const g of $adiados.splice(0)) { try { g(); } catch (e) { calou("o que o turno adiou", e); } }
  const entradaDoPedido = { frase: $in.frase, persAtual: $in.persAtual, histBase: $in.histBase };
  for (const n of SAIDA_DO_PRELUDIO.slice(3)) entradaDoPedido[n] = saida[n];
  return { entradaDoPedido, escritas };
}
