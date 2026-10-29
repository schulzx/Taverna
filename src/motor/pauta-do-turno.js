/* ============================================================
   A PAUTA DO TURNO, NO MOTOR (Fase 4, trilha B, 29/10/2026) — src/motor/pauta-do-turno.js

   A pauta é o que o Mestre decidiu para este turno, em secções com
   prioridade e teto (pauta.js): onde estou, quem está, o que não pode, o
   rumo, o fecho. Até aqui ela só existia DENTRO do App — a `pautaDoTurno`
   e as 50 funções do componente que ela chama, a ler 82 refs —, e por isso
   o pedido ao Narrador só se montava num navegador. O inventário de 14bde83
   (mente/diario.md) pôs a pauta à cabeça da ordem para o `/api/turno`:
   sem ela em Node, não há turno no servidor.

   Vem para cá À LETRA: o mesmo texto do App, com os mesmos porquês, em que
   só mudam quatro coisas, todas mecânicas (o gerador está descrito no
   diário):
     · `xRef.current` lê-se e escreve-se em `$ref.<campo>` — o campo é o
       nome no save quando o save o guarda (`contRef` → `contadores`,
       `aberturaMundoRef` → `abertura`), senão o nome do ref;
     · o estado React (`personagem`, `mundo`, `nomeCampanha`, `mercado`,
       `governos`) lê-se em `$render`, o do último render;
     · o que escreve na tela é PORTA: `pushMsgs`, `setPersonagem`, `calou`;
     · o recuo do gênero do mundo (o literal da fantasia medieval no App) é
       o padrão do cenário em uso, como nos outros 36 sítios do src/ (T4-B):
       no cenário padrão, o mesmo texto.

   O ESTADO NÃO SE MUTA. `$ref` lê do estado recebido e escreve num registo
   à parte (`escritas`), que volta inteiro; o estado de quem chama fica como
   estava. Campo ausente vale o de partida do App (`REFS_DA_PAUTA`), e é
   por isso que um estado vazio é um jogo novo, não um estouro.

   A ORDEM É A DO APP. Antes de cada porta que dá a palavra ao App
   (`pushMsgs`), o que a pauta já escreveu é entregue (`portas.aplicar`),
   porque o pushMsgs dele lê os refs; e no fim, o resto — também quando a
   pauta estoura (no App os refs já estariam escritos).

     aPautaDoTurno(estado, entrada, portas) → { pauta, escritas }
       estado:  { <campo>: valor, …, render: { personagem, mundo, … } }
       entrada: { frase, sorte } (a ação do turno, o `conteudo` de enviar;
                                 a sorte é opcional: sem ela, a da casa)
       portas:  { calou, pushMsgs, setPersonagem, aplicar }   (todas opcionais)

   Provada contra o recorte à letra do App (testes/pauta-dourado.json, de
   gerar-pauta-dourado.mjs) sobre os 275 casos de testes/pauta-bloco.mjs —
   os 194 turnos gravados das sessões 8 a 10 e 81 que só a prova tem —, a
   pauta byte a byte, os refs do fim e a ordem das portas, em
   teste-motor-pauta-do-turno.mjs.
   ============================================================ */
import { fioParaAPrincipal, garantirAbertura, proximoPasso, sinosForaDeHora, vetosDaAbertura } from "../abertura.js";
import { envelopeDaVirada, intencaoDaVez, linhaDaLuta, menteDaCriatura } from "../adversario.js";
import { LUTA_SEM_PAINEL } from "../agressao.js";
import { DIAS_ATE_APODRECER, paraPauta as aliadoParaPauta, codigoPorId, cruzouOCodigo, garantirAliados, nascerAliado, vontadePorId } from "../aliado.js";
import { certezaDe, garantirSaber, oQueEleNaoSabe, responder, paraPauta as vilaoParaPauta } from "../antagonista.js";
import { arredoresDaCidade } from "../arredores.js";
import { balcaoParaPauta } from "../bolsa-da-frase.js";
import { AMANHECER, ehNoite } from "../calendario.js";
import { elencoDaCena } from "../cena.js";
import { fichaDaCidade, fichaParaPauta } from "../cidade-por-dentro.js";
import { consultarCobrador, envelopeDoMundo, linhaDoMundo } from "../cobrador.js";
import { perfilCombate } from "../combate.js";
import { envelopeDoComercio, podePagar } from "../comercio.js";
import { comodosDoLocal } from "../comodos.js";
import { garantirCompasso } from "../compasso.js";
import { CONTADORES_INICIAIS } from "../conquistas.js";
import { fatorDePreco, garantirLei, procuradoParaPauta } from "../crime.js";
import { envelopeDasPotencias, garantirDiplomacia, potenciasDoMundo } from "../diplomacia.js";
import { envelopeDoDominio, fatorDaOficina } from "../dominios.js";
import { elencoDoMundo, foraDeCenaParaPauta, garantirElencoDoSave, saidaParaPauta } from "../elenco.js";
import { montarEmCena, pautaComEmCena } from "../em-cena.js";
import { envelopeDoEpisodio } from "../episodios.js";
import { garantirSuprimentos } from "../ermos.js";
import { pautaDoEscondido } from "../escondido.js";
import { degrauDaEscuta, fioDaHistoria, garantirEscuta, lerOPedido, linhaDoRumo } from "../escuta.js";
import { envelopeDasFalas } from "../falas.js";
import { calcularFama } from "../fama.js";
import { escolherFecho } from "../fecho.js";
import { genteParaPauta } from "../gente-por-dentro.js";
import { cidadesPisadas, regioesDoMapa } from "../geografia.js";
import { garantirEspaco, paraPauta, posicaoDoHeroi } from "../geografo.js";
import { dominiosDe } from "../gestao.js";
import { golpeFinalNaPauta } from "../golpe-final.js";
import { envelopeDaGuilda } from "../guildas.js";
import { estruturaPorId, garantirHistoria } from "../historia.js";
import { paraPauta as interpreteParaPauta, jaMeViuAntes, marcarMovimento } from "../interprete.js";
import { garantirForma, leiParaPauta } from "../lei-da-forma.js";
import { nomeDaMoeda } from "../lexico.js";
import { tiposPedidos } from "../lugar.js";
import { luzDaLuta, luzParaPauta } from "../luz.js";
import { horizonteDaPergunta, linhaDaFicha } from "../masmorra-sem-cidade.js";
import { masmorraParaPauta, saidasDe } from "../masmorras.js";
import { balcaoDeMantimentos, mapasAVenda, mercadoParaPauta, mercadoresDaCidade, precoComumParaPauta, precosDaRua } from "../mercado.js";
import { apostas, situacaoQueCasa } from "../mesa-posta.js";
import { garantirMesa, pilarFaminto, pilarRepetido, temperaturaDaMesa } from "../mestria.js";
import { ativas as missoesAtivas } from "../missoes.js";
import { MODO_PADRAO } from "../modos.js";
import { MOLDE_PADRAO, moldePorId } from "../moldes.js";
import { vetosParaAPauta } from "./correcao-do-juiz.js";
import { oEnvelopeDaGente, oEnvelopeDoFio } from "./envelopes-do-turno.js";
import { aCidadeSobOsPes } from "./tempo-do-turno.js";
import { garantirBase, locaisDaCidade, oQueExisteAqui } from "../mundo-base.js";
import { linhaDosNomesAMao, nomesAMao } from "../nomes.js";
import { TIPOS_DE_LACO, comLaco, garantirLaco, paresEntre } from "../npcs.js";
import { garantirCoracaoDoSave, nucleoDaCampanha, quemEParaPauta } from "../nucleo.js";
import { PESO_AMEACA, avaliarEncontro } from "../orcamento.js";
import { cederNaCena, garantirPauta, porNaPauta } from "../pauta.js";
import { juntarRespostas } from "../perguntas.js";
import { pesoDaCena, vetoDoPeso } from "../peso.js";
import { fatorDeMercado, garantirPosturaAtiva, moralDoInimigo } from "../posturas.js";
import { precoDeCompraPara } from "../profissoes.js";
import { cobrarNoTurno, garantirPrometido } from "../prometido.js";
import { paraPauta as arquivistaParaPauta } from "../registro.js";
import { envelopeDaEspinha, garantirEspinha, marcoAtual, momentoDoFio } from "../saga.js";
import { vistaDaLuta } from "../saida-da-luta.js";
import { segredosGuardados, vetoDoSegredo } from "../segredo-guardado.js";
import { hashSemente, rng } from "../semente.js";
import { avancarCoracao, subtramasDoNucleo } from "../subtramas.js";
import { envelopeDaChave, provocacaoDoRival } from "../torneio.js";
import { faseDe } from "../vilao.js";
import { comSorte } from "../semente.js";
import { cenarioAtivo } from "../cenario.js";

/* OS REFS QUE A PAUTA TOCA — um por campo: o nome do ref no App, se o save o
   guarda (o campo é o do save; senão é o do ref), se a pauta o escreve, e o
   valor de partida (o mesmo `useRef(...)` do App), que vale quando o estado
   não traz o campo. É a lista que o App percorre para montar o estado e
   aplicar o que voltou, e a que a suíte confere contra o recorte. */
export const REFS_DA_PAUTA = Object.freeze({
  abertura: Object.freeze({ ref: "aberturaMundoRef", salvo: true, escreve: false, padrao: () => (garantirAbertura(null)) }),
  acampado: Object.freeze({ ref: "acampadoRef", salvo: true, escreve: false, padrao: () => (false) }),
  aliados: Object.freeze({ ref: "aliadosRef", salvo: true, escreve: true, padrao: () => ({}) }),
  atoDoTurno: Object.freeze({ ref: "atoDoTurnoRef", salvo: false, escreve: false, padrao: () => ("nada") }),
  baseMundo: Object.freeze({ ref: "baseMundoRef", salvo: true, escreve: false, padrao: () => (garantirBase(null)) }),
  cidadeAtual: Object.freeze({ ref: "cidadeAtualRef", salvo: true, escreve: false, padrao: () => ("") }),
  clima: Object.freeze({ ref: "climaRef", salvo: true, escreve: false, padrao: () => (null) }),
  cobradas: Object.freeze({ ref: "cobradasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  cobrouAgora: Object.freeze({ ref: "cobrouAgoraRef", salvo: false, escreve: true, padrao: () => (false) }),
  combate: Object.freeze({ ref: "combateRef", salvo: true, escreve: false, padrao: () => (null) }),
  compasso: Object.freeze({ ref: "compassoRef", salvo: true, escreve: false, padrao: () => (garantirCompasso(null)) }),
  confidencias: Object.freeze({ ref: "confidenciasRef", salvo: true, escreve: false, padrao: () => ([]) }),
  contadores: Object.freeze({ ref: "contRef", salvo: true, escreve: false, padrao: () => ({ ...CONTADORES_INICIAIS }) }),
  coracao: Object.freeze({ ref: "coracaoRef", salvo: true, escreve: false, padrao: () => (garantirCoracaoDoSave(null)) }),
  coracaoFala: Object.freeze({ ref: "coracaoFalaRef", salvo: false, escreve: true, padrao: () => (null) }),
  coracaoPendente: Object.freeze({ ref: "coracaoPendenteRef", salvo: false, escreve: true, padrao: () => (null) }),
  coracaoRitmo: Object.freeze({ ref: "coracaoRitmoRef", salvo: false, escreve: false, padrao: () => ({ ultimas: {} }) }),
  criaturaAVista: Object.freeze({ ref: "criaturaAVistaRef", salvo: false, escreve: false, padrao: () => (null) }),
  crimeDoTurno: Object.freeze({ ref: "crimeDoTurnoRef", salvo: false, escreve: true, padrao: () => (null) }),
  derrotadosDaSessao: Object.freeze({ ref: "derrotadosDaSessaoRef", salvo: false, escreve: false, padrao: () => ([]) }),
  dia: Object.freeze({ ref: "diaRef", salvo: true, escreve: false, padrao: () => (1) }),
  diplomacia: Object.freeze({ ref: "diplomaciaRef", salvo: true, escreve: false, padrao: () => (garantirDiplomacia(null)) }),
  elenco: Object.freeze({ ref: "elencoSaveRef", salvo: true, escreve: false, padrao: () => (garantirElencoDoSave(null)) }),
  elencoCache: Object.freeze({ ref: "elencoCacheRef", salvo: false, escreve: true, padrao: () => (null) }),
  elencoMem: Object.freeze({ ref: "elencoMemRef", salvo: true, escreve: true, padrao: () => ({}) }),
  emCena: Object.freeze({ ref: "emCenaRef", salvo: false, escreve: true, padrao: () => (null) }),
  episodio: Object.freeze({ ref: "episodioRef", salvo: true, escreve: false, padrao: () => (null) }),
  escuta: Object.freeze({ ref: "escutaRef", salvo: true, escreve: false, padrao: () => (garantirEscuta(null)) }),
  espinha: Object.freeze({ ref: "espinhaRef", salvo: true, escreve: false, padrao: () => (garantirEspinha(null)) }),
  faccaoJogador: Object.freeze({ ref: "faccaoJogadorRef", salvo: true, escreve: false, padrao: () => ("") }),
  falasDoTurno: Object.freeze({ ref: "falasDoTurnoRef", salvo: false, escreve: false, padrao: () => ([]) }),
  fatosDoPeso: Object.freeze({ ref: "fatosDoPesoRef", salvo: false, escreve: true, padrao: () => ({}) }),
  fecho: Object.freeze({ ref: "fechoRef", salvo: false, escreve: true, padrao: () => ("") }),
  forma: Object.freeze({ ref: "formaRef", salvo: true, escreve: false, padrao: () => (garantirForma(null)) }),
  formasCobradas: Object.freeze({ ref: "formasCobradasRef", salvo: true, escreve: true, padrao: () => ([]) }),
  golpeFinalEnvelope: Object.freeze({ ref: "golpeFinalEnvelopeRef", salvo: false, escreve: true, padrao: () => (null) }),
  golpesDaRodada: Object.freeze({ ref: "golpesDaRodadaRef", salvo: false, escreve: false, padrao: () => (null) }),
  governos: Object.freeze({ ref: "governosRef", salvo: true, escreve: false, padrao: () => ({}) }),
  guildas: Object.freeze({ ref: "guildasRef", salvo: true, escreve: false, padrao: () => ([]) }),
  historia: Object.freeze({ ref: "historiaRef", salvo: true, escreve: false, padrao: () => (garantirHistoria({ estrutura: "jornada", etapa: 0 })) }),
  intencao: Object.freeze({ ref: "intencaoRef", salvo: false, escreve: true, padrao: () => ("") }),
  interprete: Object.freeze({ ref: "interpreteRef", salvo: false, escreve: false, padrao: () => (null) }),
  jornada: Object.freeze({ ref: "jornadaRef", salvo: true, escreve: false, padrao: () => (null) }),
  lei: Object.freeze({ ref: "leiRef", salvo: true, escreve: false, padrao: () => (garantirLei(null)) }),
  lugar: Object.freeze({ ref: "lugarRef", salvo: true, escreve: false, padrao: () => (null) }),
  mapa: Object.freeze({ ref: "mapaRef", salvo: true, escreve: false, padrao: () => ({ cidades: [], faccoes: [] }) }),
  masmorra: Object.freeze({ ref: "masmorraRef", salvo: true, escreve: false, padrao: () => (null) }),
  mensagens: Object.freeze({ ref: "mensagensRef", salvo: true, escreve: false, padrao: () => ([]) }),
  mercado: Object.freeze({ ref: "mercadoRef", salvo: true, escreve: false, padrao: () => ({ comprados: {}, ambulante: null, pressoes: {}, gastos: {}, pechinchas: {} }) }),
  mesa: Object.freeze({ ref: "mesaRef", salvo: true, escreve: false, padrao: () => (garantirMesa(null)) }),
  minuto: Object.freeze({ ref: "minutoRef", salvo: true, escreve: false, padrao: () => (AMANHECER + 60) }),
  missoes: Object.freeze({ ref: "missoesRef", salvo: true, escreve: false, padrao: () => ([]) }),
  modo: Object.freeze({ ref: "modoRef", salvo: true, escreve: false, padrao: () => (MODO_PADRAO) }),
  mundo: Object.freeze({ ref: "mundoRef", salvo: false, escreve: false, padrao: () => (null) }),
  naoPodeDoTurno: Object.freeze({ ref: "naoPodeDoTurnoRef", salvo: false, escreve: true, padrao: () => ([]) }),
  nemesis: Object.freeze({ ref: "nemesisRef", salvo: true, escreve: false, padrao: () => (null) }),
  noite: Object.freeze({ ref: "noiteRef", salvo: true, escreve: false, padrao: () => (null) }),
  nomeCampanha: Object.freeze({ ref: "nomeCampanhaRef", salvo: false, escreve: false, padrao: () => ("") }),
  nomesPendentes: Object.freeze({ ref: "nomesPendentesRef", salvo: false, escreve: true, padrao: () => (null) }),
  nota: Object.freeze({ ref: "notaRef", salvo: false, escreve: true, padrao: () => ("") }),
  npcs: Object.freeze({ ref: "npcsRef", salvo: true, escreve: false, padrao: () => ({}) }),
  nucleoCache: Object.freeze({ ref: "nucleoCacheRef", salvo: false, escreve: true, padrao: () => (null) }),
  personagem: Object.freeze({ ref: "personagemRef", salvo: false, escreve: true, padrao: () => (null) }),
  postura: Object.freeze({ ref: "posturaRef", salvo: true, escreve: false, padrao: () => (garantirPosturaAtiva(null)) }),
  prometido: Object.freeze({ ref: "prometidoRef", salvo: true, escreve: true, padrao: () => (garantirPrometido(null)) }),
  propositosDoTurno: Object.freeze({ ref: "propositosDoTurnoRef", salvo: false, escreve: false, padrao: () => ([]) }),
  quemE: Object.freeze({ ref: "quemERef", salvo: false, escreve: true, padrao: () => ({ ultimas: {}, cenas: {} }) }),
  registro: Object.freeze({ ref: "registroRef", salvo: true, escreve: false, padrao: () => ([]) }),
  reino: Object.freeze({ ref: "reinoRef", salvo: true, escreve: false, padrao: () => ({}) }),
  relogios: Object.freeze({ ref: "relogiosRef", salvo: true, escreve: false, padrao: () => ([]) }),
  reviravolta: Object.freeze({ ref: "reviravoltaRef", salvo: true, escreve: false, padrao: () => (null) }),
  saber: Object.freeze({ ref: "saberRef", salvo: true, escreve: false, padrao: () => ([]) }),
  sinoDoTurno: Object.freeze({ ref: "sinoDoTurnoRef", salvo: false, escreve: true, padrao: () => ("") }),
  sitio: Object.freeze({ ref: "sitioRef", salvo: true, escreve: false, padrao: () => (null) }),
  subtramasCache: Object.freeze({ ref: "subtramasCacheRef", salvo: false, escreve: true, padrao: () => (null) }),
  torneio: Object.freeze({ ref: "torneioRef", salvo: true, escreve: false, padrao: () => (null) }),
  turnoDeRegistro: Object.freeze({ ref: "turnoDeRegistroRef", salvo: false, escreve: false, padrao: () => (0) }),
  ultimaAcao: Object.freeze({ ref: "ultimaAcaoRef", salvo: false, escreve: false, padrao: () => ("") }),
  ultimaCobranca: Object.freeze({ ref: "ultimaCobrancaRef", salvo: true, escreve: true, padrao: () => (-99) }),
  ultimoPeso: Object.freeze({ ref: "ultimoPesoRef", salvo: false, escreve: true, padrao: () => ({ peso: null, dia: 0 }) }),
  vetosDoJuiz: Object.freeze({ ref: "vetosDoJuizRef", salvo: false, escreve: false, padrao: () => ([]) }),
  vilaoAgiu: Object.freeze({ ref: "vilaoAgiuRef", salvo: true, escreve: true, padrao: () => (-99) }),
});

/* O ESTADO REACT QUE A PAUTA LÊ: o valor do último render, que o App passa em
   `estado.render`. Sem ele vale o do estado (no App os dois são o mesmo
   objeto, salvo num render velho). `cidadeMercado` e `mercadoAqui`, que o
   render calcula, também podem vir ali; sem eles, refazem-se aqui. */
export const RENDER_DA_PAUTA = Object.freeze(["governos","mercado","mundo","nomeCampanha","personagem"]);

/* ---------------- o que é do módulo do App, à letra ---------------- */
/* MM-C · C0 (11/10, a 6.ª sessão): o que o Mestre MOSTROU na conversa — as
   últimas falas dele, para o alvo do golpe sair da prosa ("ataco o cão sem
   pelo") e para o veto da luta que só a prosa começou. E a frase anterior
   do jogador, para o "pago as sete fichas" herdar o item do "quanto é".
   Leem `mensagensRef`, que já guarda tudo isto: não é estado novo, nem save. */
const LEITURA_DA_CONVERSA = { falasDoMestre: 2 };
const falasDoMestre = (msgs, n = LEITURA_DA_CONVERSA.falasDoMestre) =>
  (Array.isArray(msgs) ? msgs : []).filter((m) => m && m.autor === "mestre" && typeof m.texto === "string" && m.texto.trim()).slice(-n).map((m) => m.texto);

/* ============================================================
   A PAUTA DO TURNO
   aPautaDoTurno(estado, entrada, portas) → { pauta, escritas }
   ============================================================ */
export function aPautaDoTurno(estado, entrada, portas) {
  const $E = estado && typeof estado === "object" ? estado : {};
  const $P = portas && typeof portas === "object" ? portas : {};
  const $render0 = $E.render && typeof $E.render === "object" ? $E.render : {};
  /* o que a pauta escreveu (tudo), e o que ainda não foi entregue ao App */
  const escritas = {};
  let pendentes = {};
  const partida = {};
  const lerCampo = (c) => {
    if (Object.prototype.hasOwnProperty.call(escritas, c)) return escritas[c];
    if ($E[c] !== undefined) return $E[c];
    if (!REFS_DA_PAUTA[c]) return undefined;
    if (!(c in partida)) partida[c] = REFS_DA_PAUTA[c].padrao();
    return partida[c];
  };
  const $ref = new Proxy({}, {
    get: (_, c) => (typeof c === "string" ? lerCampo(c) : undefined),
    set: (_, c, v) => { escritas[c] = v; pendentes[c] = v; return true; },
  });
  const $render = {};
  for (const n of RENDER_DA_PAUTA) $render[n] = Object.prototype.hasOwnProperty.call($render0, n) ? $render0[n] : lerCampo(n);
  const descarregar = () => {
    const x = pendentes;
    pendentes = {};
    if (Object.keys(x).length && typeof $P.aplicar === "function") $P.aplicar(x);
  };
  /* AS PORTAS. O calou devolve a lista vazia, como o do App (há quem a
     devolva: `return calou(...)`). Antes de o App ter a palavra, recebe o
     que a pauta já escreveu — o pushMsgs dele lê os refs. */
  const calou = (onde, e) => { try { if (typeof $P.calou === "function") $P.calou(onde, e); } catch { /* o calou nunca custa o turno */ } return []; };
  const pushMsgs = (novas) => { descarregar(); if (typeof $P.pushMsgs === "function") $P.pushMsgs(novas); };
  const setPersonagem = (v) => { if (typeof $P.setPersonagem === "function") $P.setPersonagem(v); };

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
  /* 9.ª sessão (v9.433): a palavra do mundo para a moeda, para o preço que vai à pauta dizer a unidade
     — o Mestre vendia em "marcos" num mundo de moedas. 20/10: UM nome só por campanha (`nomeDaMoeda`),
     o mesmo da linha ECONOMIA do pedido; o léxico que chega tarde não o troca, e sem léxico é "moedas". */
  const moedaDoMundo = () => { try { return nomeDaMoeda((mundoAtual() || {}).lexico); } catch (e) { calou("a moeda do mundo", e); return ""; } };
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
  /* quem do núcleo está em cena: citado nas duas últimas falas do Mestre
     (pelo nome inteiro ou pelo primeiro, como o Mestre o chama) ou a andar
     no grupo. O registo de NPCs não basta: o elo e o vilão podem ainda não
     estar lá quando o Mestre já os pôs a falar. */
  const nucleoEmCena = (nucleo) => {
    const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const fala = " " + sem(($ref.mensagens || []).filter((m) => m && m.autor === "mestre").slice(-2).map((m) => m.texto).join(" ")).replace(/[^a-z0-9]+/g, " ") + " ";
    const grupo = (($ref.personagem || $render.personagem || {}).grupo || []).filter((g) => g && g.nome && !g.invocada).map((g) => sem(g.nome));
    const out = [];
    for (const p of ((nucleo && nucleo.pessoas) || [])) {
      if (!p || !p.nome) continue;
      const inteiro = sem(String(p.nome).split(",")[0]).replace(/[^a-z0-9]+/g, " ").trim();
      const prim = inteiro.split(" ")[0] || "";
      const citado = (inteiro && fala.includes(" " + inteiro + " ")) || (prim.length >= 3 && fala.includes(" " + prim + " "));
      if (citado || grupo.includes(sem(p.nome))) out.push(p.nome);
    }
    return out;
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
  /* o contexto do coração neste instante — o mesmo para o turno, para a tela
     e para o clique. A máscara do aliado que já caiu (reviravoltas.js) vai
     em `reveladas`, com o ato em que caiu, para a do elo nunca cair no mesmo. */
  /* 13/10 (v9.461, LONGE_DA_HISTORIA): quem esta longe e quem o registo SABE
     aqui — a mesma conta do EM CENA. O coracao (QUEM CARREGA) e o QUEM E
     leem-na para nao trazer a resposta quem a historia sabe noutra cidade. */
  const elencoDoCoracao = () => {
    const grupo = (($ref.personagem || $render.personagem || {}).grupo) || [];
    try {
      const el = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: grupo, masmorra: $ref.masmorra }) || {};
      return { longe: el.longe || [], presentes: el.aqui || [], grupo };
    } catch (e) { calou("quem está longe, para o coração", e); return { longe: [], presentes: [], grupo }; }
  };
  /* a cidade onde o heroi ESTA, para o coracao e para o QUEM E: vazia em
     viagem e na masmorra aberta */
  const cidadeDoCoracao = () => ($ref.jornada || ($ref.masmorra && !$ref.masmorra.encerrada)) ? "" : ($ref.cidadeAtual || "");
  const contextoDoCoracao = (nucleo, extra) => {
    const esp = $ref.espinha || {};
    const lista = subtramasAgora(nucleo);
    const ato = ($ref.historia || {}).etapa || 0;
    const mortos = Object.values($ref.npcs || {}).filter((n) => n && n.nome && String(n.status || "").toLowerCase() === "morto").map((n) => n.nome);
    let reveladas = [];
    try {
      const rv = $ref.reviravolta;
      const mascara = ((nucleo && nucleo.pessoas) || []).find((x) => x && x.papel !== "elo" && x.revelaNoAto != null);
      if (rv && rv.revelada && mascara) {
        const k = (esp.atos || []).findIndex((a) => { const ms = ((a && a.marcos) || []).filter(Boolean); const f = ms.find((m) => m.batida && m.batida.fecho) || ms[ms.length - 1]; return !!(f && f.feito && Number(f.dia) >= (rv.reveladaEm || 0)); });
        reveladas = [{ nome: mascara.nome, ato: k >= 0 ? k : ato }];
      }
    } catch (e) { calou("a máscara que já caiu", e); }
    return { semente: sementeMundo(), espinha: esp, elenco: ($ref.subtramasCache || {}).elenco || null, dia: $ref.dia, ato, turno: $ref.turnoDeRegistro + 1, emCena: nucleoEmCena(nucleo), ultimas: ($ref.coracaoRitmo || {}).ultimas || {}, luta: !!$ref.combate, mortos, reveladas, subtramas: lista, frase: "", maoDoVilao: false,
      /* 9.ª sessão (v9.434): a cidade onde o herói ESTÁ — a porta do elo
         (subtramas.js, PORTA_DO_ELO) só o traz quando é a dele. Em viagem e
         na masmorra aberta vai vazia: o elo não aparece na estrada. */
      cidade: cidadeDoCoracao(),
      ...elencoDoCoracao(),
      ...(extra || {}) };
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
  /* ---------------- O QUE A CENA USA (v9.54) ----------------
     As perguntas que decidem quais blocos de regra sobem no prompt deste
     turno. Todas são baratas e todas saem dos refs vivos — nenhuma
     adivinha nada, que é a régua da porta: se o sistema não sabe dizer se
     a situação está acontecendo, o bloco fica.

     Onde existe um `resumo*Prompt`, a pergunta é ele mesmo devolver vazio.
     Não é preguiça: essas funções JÁ carregam o teste de "não há nada a
     dizer sobre isto", e escrever o teste uma segunda vez aqui seria criar
     duas verdades que podem discordar. */
  /* ---------------- O ESPAÇO DA MESA (v9.104) ----------------
     O retrato que o Geógrafo lê. Nenhum campo aqui é inventado: todos
     saem de refs que já existiam e que ninguém tinha juntado. É a mesma
     função que `situacaoDaMesa` faz para o Bibliotecário. */
  const espacoDaMesa = () => {
    const mm = $ref.masmorra;
    const naMasmorra = !!(mm && !mm.encerrada);
    const lug = $ref.lugar;
    const cid = ($ref.mapa.cidades || []).find((c) => c.nome === $ref.cidadeAtual) || null;
    const dentro = !!(lug && lug.distancia === "dentro") || naMasmorra;
    /* de que TIPO é o prédio em que estou, quando estou num. O lugar
       guarda o nome; os locais da cidade guardam o tipo — e é o tipo que
       o acervo lê, porque é ele que diz o que o espaço comporta. */
    let tipoDoLocal = "";
    if (lug && lug.nome && cid) {
      const achado = locaisDaCidade(sementeMundo(), cid, generoMundo(), moldeMundo(), (mundoAtual() || {}).lexico)
        .find((l) => semNome(l.nome) === semNome(lug.nome));
      if (achado) tipoDoLocal = achado.tipo;
    }
    /* v9.104: e quando o lugar foi INVENTADO pela ficção — o caso comum,
       porque o Mestre nomeia lugares livremente —, o nome às vezes se
       entrega: "A Taverna do Corvo", "o Templo Pálido". `tiposPedidos` já
       sabe ler isso e existia para outra coisa.

       Quando o nome não denuncia nada ("O Escudo das Velas"), o tipo fica
       vazio e as afordâncias de lugar não disparam. É o lado seguro: um
       tipo chutado daria ao Narrador uma regra sobre um lugar que talvez
       não seja aquele. */
    if (!tipoDoLocal && lug && lug.nome) tipoDoLocal = tiposPedidos(lug.nome)[0] || "";
    const sit = situacaoDaMesa();
    const cl = $ref.clima;
    return garantirEspaco({
      tipo: naMasmorra ? "masmorra" : $ref.jornada ? "estrada" : lug ? "lugar" : $ref.cidadeAtual ? "cidade" : "nenhum",
      rotulo: naMasmorra ? mm.nome : (lug && lug.nome) || $ref.cidadeAtual || "",
      tipoDoLocal,
      bioma: biomaDaqui(),
      porte: (cid && (cid.porte || cid.tipo)) || "",
      dentro,
      aberto: !dentro && !naMasmorra,
      apertado: naMasmorra,
      /* a sala do chefe e a cripta são fundo de saco: uma saída só */
      fundo: naMasmorra && saidasDe(mm).length <= 1,
      alto: naMasmorra,
      agua: /pantano|costa/.test(biomaDaqui()) && !dentro,
      saidas: naMasmorra ? Math.max(1, saidasDe(mm).length) : dentro ? 2 : 4,
      /* lá embaixo a luz é a tocha; aqui em cima é a hora */
      luz: naMasmorra ? (mm.tochas > 0 ? "penumbra" : "escuro") : (ehNoite($ref.minuto) && !dentro ? "penumbra" : "clara"),
      publico: !!$ref.cidadeAtual && !$ref.acampado && !naMasmorra,
      gentePorPerto: sit.gentePorPerto,
      cabem: naMasmorra ? 4 : dentro ? 10 : 20,
      emCombate: !!$ref.combate,
      emMasmorra: naMasmorra,
      emViagem: !!$ref.jornada,
      acampado: !!$ref.acampado,
      noite: ehNoite($ref.minuto),
      clima: (cl && cl.rotulo) || "",
      montado: false,
    });
  };
  /* ---------------- A PAUTA DO TURNO (v9.104) ----------------
     Um lugar só, ordenado e com teto, para tudo o que o Mestre decidiu.
     Nasce com o Geógrafo dentro; cada sistema se muda para cá quando
     chegar a vez dele. */
  /* ---------------- O QUE A OPOSIÇÃO QUER (v9.110) ----------------
     Traduz o combate para a situação que o acervo do Adversário sabe
     ler. As palavras do LUGAR vêm do Geógrafo prontas — duas versões do
     mesmo chão seria a garantia de que uma das duas ia mentir. */
  /* Os alvos como o Adversário os enxerga. Serve só para a LINHA da
     Pauta poder nomear quem apanha — a escolha de verdade acontece
     dentro do `turnoDosInimigos`, com as bandeiras que só o motor sabe
     (alcance contra a grade, quem está no caminho). */
  const alvosDaLuta = () => {
    try {
      const p0 = fichaViva() || $render.personagem || {};
      const grupo = (p0.grupo || []).filter((g) => (g.vida || 0) > 0);
      return [
        { ref: "jogador", nome: p0.nome, vida: p0.vida, vidaMax: p0.vidaMax, nivel: p0.nivel, heroi: true,
          conjurador: perfilCombate(p0.classe || "").tipo === "conjurador" },
        ...grupo.map((g, i) => ({ ref: "grupo", nome: g.nome, vida: g.vida, vidaMax: g.vidaMax || g.vida, nivel: g.nivel || 1, i,
          conjurador: perfilCombate(g.classe || "").tipo === "conjurador",
          cura: ["Clérigo", "Druida", "Bardo"].includes(g.classe || "") })),
      ];
    } catch (e) { return calou("alvosDaLuta", e); }
  };
  const lutaDaMesa = () => {
    try {
      const c = $ref.combate;
      if (!c || !(c.inimigos || []).length) return null;
      const p0 = fichaViva() || $render.personagem || {};
      const vivos = (c.inimigos || []).filter((e) => !e.derrotado && (e.vida || 0) > 0);
      if (!vivos.length) return null;
      const e = espacoDaMesa();
      const grupo = (p0.grupo || []).filter((g) => (g.vida || 0) > 0);
      const somaVida = vivos.reduce((s, x) => s + (x.vida || 0), 0);
      const somaMax = vivos.reduce((s, x) => s + (x.vidaMax || x.vida || 1), 0) || 1;
      /* quem fala pela oposição é o mais forte de pé: um bando tem uma
         intenção só, e é a de quem manda nele. */
      const voz = vivos.reduce((a, b) => ((b.nivel || 0) + PESO_AMEACA[b.ameaca] * 10 > (a.nivel || 0) + PESO_AMEACA[a.ameaca] * 10 ? b : a), vivos[0]);
      const mente = menteDaCriatura(voz.nome, voz.desc, (mundoAtual() || {}).lexico);
      const av = avaliarEncontro(vivos, p0);
      const mm = $ref.masmorra;
      return {
        nome: voz.nome, ameaca: voz.ameaca || "comum",
        ehBicho: mente === "besta", ehMorto: mente === "morto",
        ehTropa: vivos.length >= 4 && new Set(vivos.map((x) => x.nome)).size <= 2,
        ehChefe: !!voz.chefe || voz.ameaca === "lendario",
        pensa: mente !== "besta" && mente !== "morto",
        rodada: c.rodada || 1,
        quantos: vivos.length, quantosEram: (c.inimigos || []).length,
        minhaVida: (voz.vida || 0) / (voz.vidaMax || voz.vida || 1),
        vidaDosMeus: somaVida / somaMax,
        faixa: (av && av.faixa && av.faixa.id) || "",
        heroiVida: (p0.vida || 0) / (p0.vidaMax || 1),
        heroiCaido: (p0.vida || 0) <= 0,
        heroiSozinho: grupo.length === 0,
        quantosDoOutroLado: 1 + grupo.length,
        temConjurador: [p0, ...grupo].some((x) => perfilCombate(x.classe || "").tipo === "conjurador"),
        temCurandeiro: grupo.some((x) => ["Clérigo", "Druida", "Bardo"].includes(x.classe || "")),
        alguemFerido: [p0, ...grupo].some((x) => (x.vida || 0) > 0 && (x.vida || 0) < (x.vidaMax || 1) * 0.5),
        heroiFamoso: famaAtual() >= 45,
        heroiCarrega: (mm && !mm.encerrada && mm.temChave) ? "a chave da masmorra" : "",
        apertado: e.apertado, aberto: e.aberto, fundo: e.fundo, alto: e.alto,
        agua: e.agua, escuro: e.luz === "escuro", saidas: e.saidas,
        publico: e.publico, emMasmorra: e.emMasmorra,
        ondeCai: e.alto ? (e.emMasmorra ? "o poço da sala" : "a beira") : "",
        euEmbosquei: !!c.emboscada && !c.surpresaDoJogador,
        fuiEmboscado: !!c.emboscada && !!c.surpresaDoJogador,
        temRefem: !!c.refem, temCivil: e.gentePorPerto > 0 && !e.emMasmorra,
        protejoAlgo: (mm && !mm.encerrada && voz.chefe) ? "o que está atrás dele" : "",
        protegidoQuebrou: false,
        querSaber: "",
        temLider: vivos.length > 1, liderCaiu: (c.inimigos || []).some((x) => x.chefe && (x.derrotado || (x.vida || 0) <= 0)),
        doVilao: !!($ref.nemesis && $ref.nemesis.nome) && !!c.doVilao,
        ordemDoVilao: (c.doVilao && ($ref.nemesis || {}).arquetipo) ? "o que a ameaça mandou" : "",
        /* o vies da postura: o adversario fica receoso no apice, aproveitador na crise */
        posturaMoral: moralDoInimigo(($ref.postura || {}).postura),
      };
    } catch (e) { calou("lutaDaMesa", e); return null; }
  };
  /* A intenção da luta e o que ela virou. A memória é por COMBATE: sem
     ela não existe "virou", existe só "agora é outra" — e um inimigo que
     troca de plano toda rodada não tem plano. */
  const intencaoDaLuta = () => {
    const s = lutaDaMesa();
    if (!s) return null;
    const v = intencaoDaVez(s, { antes: $ref.intencao || "" });
    if (!v || !v.intencao) return null;
    return { ...v, situacao: s };
  };
  /* O QUE O MUNDO FAZ SOBRE UMA COISA DE TRÊS DIAS ATRÁS (v9.112).
     Ele lê o REGISTRO, que já é o livro-razão: o quê, quando, onde,
     quem viu, o peso e agora o ato. Nada de estrutura nova. */
  const oQueOMundoCobra = () => {
    try {
      return consultarCobrador($ref.registro, {
        dia: $ref.dia,
        cobradas: $ref.cobradas,
        fama: Math.round(famaAtual()),
        ultimaCobranca: $ref.ultimaCobranca,
        ultimasFormas: $ref.formasCobradas,
        publico: !!(espacoDaMesa() || {}).publico,
        temGente: pessoasDaCena().length > 0,
      });
    } catch (e) { calou("oQueOMundoCobra", e); return null; }
  };
  /* Achar a cidade no mapa era feito em três lugares, cada um com a sua
     própria comparação de caixa e de acento. Um lugar só. */
  const cidadeDoMapa = (nome) => (($ref.mapa && $ref.mapa.cidades) || [])
    .find((c) => String(c.nome || "").toLowerCase() === String(nome || "").toLowerCase()) || null;
  /* MM14: as tres fichas da mesa (cidade, gente, mercado) para uma frase —
     extraido de `pautaDoTurno` para que o sinal do oraculo
     (`ehPerguntaAoMundo`) tambem possa perguntar as fichas antes de rolar
     o d100. Quando `presentes` nao vem pronto (o sinal so tem a frase),
     calcula-se aqui pelo mesmo elenco da cena que `pautaDoTurno` usa. */
  /* E1: o porte da terra em número (o `pouso.fator` da ficha da cidade) —
     a caneca e o quarto falam da mesma terra. 1 quando não há cidade. */
  const fatorDoPouso = () => {
    try {
      const cd = cidadeDoMapa($ref.cidadeAtual);
      if (!cd) return 1;
      const f = fichaDaCidade(cd, { semente: sementeMundo(), mapa: $ref.mapa, lex: (mundoAtual() || {}).lexico, genero: generoMundo(), molde: moldeMundo() });
      const n = Number(f && f.pouso && f.pouso.fator);
      return Number.isFinite(n) && n > 0 ? n : 1;
    } catch (e) { calou("fatorDoPouso", e); return 1; }
  };
  const fichasDaMesa = (frase = "", presentes = null) => {
    if (!Array.isArray(presentes)) {
      try {
        presentes = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: ($ref.personagem || $render.personagem || {}).grupo || [], masmorra: $ref.masmorra }).aqui;
      } catch (e) { calou("elencoDaCena em fichasDaMesa", e); presentes = []; }
    }
    /* MM14: os nomes que a mesa ja conhece — a gente em cena e o lugar onde
       se esta —, para as fichas apagarem o nome proprio antes de procurar o
       assunto ("o Sino Calado" nao pergunta pelo sino). Uma vez so, e as
       tres fichas (a cidade, a gente, o mercado) a usam. */
    const nomesDaMesa = [...Object.keys($ref.npcs || {}), ($ref.lugar && $ref.lugar.nome) || ""].filter(Boolean);
    let fc = null;
    try {
      if ($ref.cidadeAtual && !$ref.jornada && !$ref.masmorra && !$ref.combate) {
        let foraDeHora = [];
        try { foraDeHora = sinosForaDeHora($ref.abertura, { dia: $ref.dia, cidade: $ref.cidadeAtual }); } catch (e) { calou("sinosForaDeHora", e); }
        fc = fichaParaPauta(cidadeDoMapa($ref.cidadeAtual), {
          semente: sementeMundo(), mapa: $ref.mapa, lex: (mundoAtual() || {}).lexico,
          genero: generoMundo(), molde: moldeMundo(), dia: $ref.dia, minuto: $ref.minuto, frase,
          nomes: nomesDaMesa, foraDeHora,
          /* E1: "dentro dos muros" com número — do ponto do herói, não do centro */
          aqui: meuPonto(),
        });
      }
    } catch (e) { calou("fichaParaPauta", e); }
    /* MM8a: a gente por dentro — so quando a frase pergunta por alguem */
    let gp = null;
    try {
      if (!$ref.combate) {
        let recentes = [];
        try { recentes = ($ref.mensagens || []).filter((m) => m && (m.autor === "jogador" || m.autor === "mestre")).slice(-4).map((m) => m.texto); } catch (e) { calou("recentes da gente por dentro", e); }
        gp = genteParaPauta({
          semente: sementeMundo(), mapa: $ref.mapa, cidade: $ref.cidadeAtual,
          genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico,
          base: $ref.baseMundo, npcs: $ref.npcs, presentes, espinha: $ref.espinha, guildas: $ref.guildas, estado: $ref.elenco,
          grupo: ($ref.personagem || $render.personagem || {}).grupo || [],
          heroi: ($ref.personagem || $render.personagem || {}).nome || "",
          recentes, lugar: $ref.lugar, dia: $ref.dia, minuto: $ref.minuto, frase,
          nomes: nomesDaMesa,
        });
      }
    } catch (e) { calou("genteParaPauta", e); }
    /* MM14: o preco perguntado — a mesma frase, a banca de hoje. Nunca em
       luta (ali nao ha banca) nem fora de cidade (nao ha onde comprar). */
    let mc = null;
    try {
      /* 9.ª sessão (v9.433): também na estrada, quando há carroça — e com a
         moeda do mundo, para o preço dizer a unidade */
      const bancas = bancasDaCena();
      mc = (!$ref.combate && bancas.length) ? mercadoParaPauta(bancas, frase, { onde: $ref.jornada ? "" : ($ref.cidadeAtual || ""), moeda: moedaDoMundo() }) : null;
    } catch (e) { calou("mercadoParaPauta", e); }
    /* 11/10 (MM11 · 5.ª sessão, J9): o preço do BALCÃO de mantimentos — as
       rações, as tochas, a corda do kit. A banca não os vende, e a pauta
       ia vazia: o Mestre inventou "dez cunhas, mais uma pela corda boa".
       Entra na mesma ficha do mercado (é ela que cala o oráculo). */
    try {
      if (!$ref.combate && $ref.cidadeAtual) {
        const p0 = $ref.personagem || $render.personagem || {};
        const bc = balcaoParaPauta(frase, { balcao: balcaoAqui(cidadeDoMapa($ref.cidadeAtual)), temKit: garantirSuprimentos(p0.suprimentos).kit, moeda: moedaDoMundo() });
        if (bc.pergunta.length) mc = { pergunta: [...((mc && mc.pergunta) || []), ...bc.pergunta], em: [...((mc && mc.em) || []), ...bc.em] };
      }
    } catch (e) { calou("balcaoParaPauta", e); }
    /* MM17 C2: as terras de além da região — só quando a frase pergunta por
       elas, nunca na masmorra nem na luta. É ficha do mundo: o oráculo não
       rola o que o mapa sabe (`A_FICHA_DECIDE`). */
    let hz = null;
    try {
      hz = horizonteDaPergunta(frase, $ref.mapa, { masmorra: $ref.masmorra, luta: !!$ref.combate });
    } catch (e) { calou("horizonteDaPergunta", e); }
    /* E1 (o Narrador só narra): o preço COMUM perguntado (a caneca, o prato
       quente, o pão) — a tabela pelo porte da terra. A banca não os vende e
       a pauta ia vazia: o Mestre inventava o número. */
    let pc = null;
    try {
      pc = (!$ref.combate && $ref.cidadeAtual) ? precoComumParaPauta(frase, { fator: fatorDoPouso(), moeda: moedaDoMundo() }) : null;
    } catch (e) { calou("precoComumParaPauta", e); }
    return { cidade: fc, gente: gp, mercado: mc, horizonte: hz, preco: pc };
  };
  /* ---------------- F2a · EM CENA: o que existe à volta do herói ----------------
     O contexto de `montarEmCena` (em-cena.js), um só para a pauta e para a
     leitura do golpe: o grupo e quem anda comigo, o registo daqui, o núcleo
     em cena, o que o Mestre mostrou, a criatura da estrada (só no mesmo
     trecho), a luta, a sala, a banca à vista (o critério de bancasDaCena),
     a moeda do mundo, a frase e o lugar. Cada fonte num calou: uma que
     estoura deixa a lista mais curta, nunca o turno sem ela. */
  const quemAndaComigo = (grupo) => {
    const doGrupo = new Set((grupo || []).map((g) => String((g && g.nome) || "").toLowerCase()));
    return Object.values($ref.npcs || {})
      .filter((n) => n && n.nome && String(n.relacao || "").toLowerCase() === "companheiro" && String(n.status || "vivo").toLowerCase() === "vivo" && !doGrupo.has(String(n.nome).toLowerCase()))
      .map((n) => n.nome);
  };
  const contextoDoEmCena = (frase, aqui) => {
    const p0 = $ref.personagem || $render.personagem || {};
    const vale = (rotulo, f, seNao) => { try { return f(); } catch (e) { calou(rotulo, e); return seNao; } };
    const nucleo = vale("EM CENA · o núcleo", () => nucleoAgora(), null);
    const mm = $ref.masmorra;
    return {
      semente: sementeMundo(),
      turno: $ref.turnoDeRegistro + 1,
      cidade: $ref.cidadeAtual || "",
      presentes: aqui || [],
      grupo: p0.grupo || [],
      comigo: vale("EM CENA · quem anda comigo", () => quemAndaComigo(p0.grupo), []),
      emCena: nucleo ? vale("EM CENA · o núcleo em cena", () => nucleoEmCena(nucleo), []) : [],
      nucleo,
      mostrado: vale("EM CENA · o que o Mestre mostrou", () => falasDoMestre($ref.mensagens), []),
      encontro: vale("EM CENA · a criatura da estrada", () => { const v = $ref.criaturaAVista, j = $ref.jornada; return (v && j && v.trecho === (j.de || "") + ">" + (j.para || "")) ? v : null; }, null),
      combate: $ref.combate,
      sala: vale("EM CENA · a sala", () => (mm && !mm.encerrada && Array.isArray(mm.salas)) ? (mm.salas.find((x) => x.id === mm.atual) || null) : null, null),
      /* 10.ª sessão (v9.455, EM_CENA_DO_LUGAR): quem o sistema sabe longe não
         entra na lista do que está à frente, por mais que a prosa o nomeie —
         a MESMA conta da linha LONGE da pauta */
      longe: vale("EM CENA · quem está longe", () => elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: p0.grupo || [], masmorra: mm }).longe || [], []),
      bancas: vale("EM CENA · as bancas", () => bancasDaCena(), []),
      moeda: moedaDoMundo(),
      frase: String(frase || ""),
      lugar: $ref.lugar,
      antes: $ref.emCena,
      /* 13/10 (v9.461): a espinha diz quem a historia pos noutra cidade
         (longeDaHistoria), e os sitios daqui saem do texto antes de se
         procurar bicho nele (BICHO_DO_SITIO: a Serpente Rouca e uma casa) */
      espinha: $ref.espinha,
      lugares: vale("EM CENA · os sítios", () => lugaresDaqui().map((l) => l.nome), []),
    };
  };
  const pautaDoTurno = (acaoDoTurno = "") => {
    let p = garantirPauta(null);
    $ref.cobrouAgora = false;
    /* quem está longe já é calculado pelo elenco da cena — o Geógrafo lê
       dali em vez de refazer a conta, porque duas versões da mesma
       verdade é como nasce o balanceamento fantasma desta casa */
    const { longe, aqui } = elencoDaCena($ref.npcs, $ref.cidadeAtual, $ref.mapa, { comGrupo: ($ref.personagem || $render.personagem || {}).grupo || [], masmorra: $ref.masmorra });
    const g = paraPauta({
      ...contextoDoEspaco(),
      espaco: espacoDaMesa(),
      lex: (mundoAtual() || {}).lexico,
      sitio: $ref.acampado ? $ref.sitio : null,
      clima: ($ref.clima && $ref.clima.rotulo) || "",
      longe,
    });
    p = porNaPauta(p, "onde", g.onde);
    /* MM16 nº 4: A PLANTA À VOLTA DA SALA (a sala mesma vai na 1.ª linha do
       ONDE, que é de ferro). Fora da masmorra a função devolve nada. Na
       luta, uma linha só: quem está e a quantos metros é do tabuleiro. */
    try {
      p = porNaPauta(p, "masmorra", masmorraParaPauta($ref.masmorra, { luta: !!$ref.combate }));
    } catch (e) { calou("masmorraParaPauta", e); }
    /* MM17 C2: e, numa campanha com região, o que se sabe DE FORA do lugar
       (a ficha: o tipo, o perigo, quem anda por lá, as horas até à base).
       Na luta não entra: lá a secção é a linha do tabuleiro. */
    try {
      p = porNaPauta(p, "masmorra", linhaDaFicha($ref.mapa, $ref.masmorra, { luta: !!$ref.combate }));
    } catch (e) { calou("linhaDaFicha", e); }
    /* 06/10: A LUZ DA LUTA — o escuro, a minha tocha, quem enxerga no
       escuro. Vazia com tudo claro; prio barata (pauta.js). */
    try {
      if ($ref.combate) p = porNaPauta(p, "luz", luzParaPauta(luzDaLutaAgora(), { heroi: $ref.combate.heroi, inimigos: $ref.combate.inimigos || [] }));
    } catch (e) { calou("luzParaPauta", e); }
    /* MM (a luta tem saída): A VISTA DA LUTA. Na quinta sessão a prosa disse
       "o dragão sumiu" com ele a 1,5 m, pôs Hakon a gritar a 0/12 e trocou a
       cabeçada pelo sopro — o Narrador lia os golpes do meio da rodada e
       nunca o estado do fim dela. Três linhas, dentro do teto da pauta: quem
       está de pé e no chão, os vetos de quem caiu e de quem não sumiu, e os
       golpes que o sistema nomeou. */
    try {
      const cV = $ref.combate;
      if (cV) {
        const gR = $ref.golpesDaRodada;
        const vista = vistaDaLuta({ heroi: fichaViva(), inimigos: cV.inimigos || [], lugar: cV.heroi || null,
          golpes: gR && gR.rodada === (cV.rodada || 1) - 1 ? gR.golpes : [] });
        p = porNaPauta(p, "quem", vista.quem);
        p = porNaPauta(p, "vetoDoDesfecho", vista.vetos);
        p = porNaPauta(p, "naoPode", vista.naoPode);
      }
    } catch (e) { calou("a vista da luta na pauta", e); }
    /* v9.138: o que este lugar produz e o que lhe falta. Vai em ONDE porque
       é geografia antes de ser economia — a praça de um porto e a de uma
       serra não se parecem, e o Narrador nunca teve como saber disso.
       MM16 nº 5: a seção é "economia" (rótulo ONDE, prio 2,5). Como 4.ª
       linha do ONDE ela tinha prio 1,3 e, numa masmorra, os 264 caracteres
       de Vau Fincado tiravam do teto a frase do golpe final (sessão 3, M21
       e M30). Na cidade lê-se igual; na luta cede (`cederNaCena`, abaixo). */
    p = porNaPauta(p, "economia", envelopeDoComercio(cidadeDoMapa($ref.cidadeAtual), $ref.dia));
    /* v9.139: e, se este chão for seu, o que você decidiu sobre ele. Só
       quando o herói está lá — governo de longe não é o que se vê na praça. */
    {
      const cd = cidadeDoMapa($ref.cidadeAtual);
      if (cd && cd.relacao === "jogador" && !$ref.masmorra) { /* MM16 nº 4: o domínio é a praça, não a masmorra */
        p = porNaPauta(p, "onde", envelopeDoDominio(cd, ($ref.governos || {})[cd.nome], {
          felicidade: (($ref.reino || {})[cd.nome] || {}).felicidade,
          semente: sementeMundo(),
        }));
      }
    }
    /* v9.129: A SECAO `momento` estava declarada em `pauta.js` desde a v9.104
       e nunca era preenchida — uma porta sem leitor. A espinha e o leitor
       dela: "a batida da historia" e exatamente o marco em que se esta. */
    /* v9.133: pertencer a uma casa muda como o mundo trata o heroi, e isso e
       cena. Vai em ONDE porque e do mesmo naipe do lugar: contexto que
       colore tudo o que acontece dentro dele. */
    {
      const casa = minhaCasa();
      if (casa && !$ref.masmorra) p = porNaPauta(p, "onde", envelopeDaGuilda(casa)); /* MM16 nº 4: lá dentro a casa não é o lugar */
    }
    p = porNaPauta(p, "momento", envelopeDaEspinha($ref.espinha, $ref.historia.etapa, estruturaPorId($ref.historia.estrutura)));
    /* v9.391: a marca do antagonista no momento, o JÁ SE SABE do segredo que
       acabou de cair, o que o mundo lembra de quem chegou a tempo */
    let maoDoVilao = false; /* MM-C C2: a marca ou os servos do fio nesta cena (o vilão do núcleo só pede pela mão) */
    try { const mf = momentoDoFio($ref.espinha, $ref.historia.etapa, { dia: $ref.dia, vilao: $ref.nemesis }); p = porNaPauta(p, "momento", mf); const assin = String((($ref.espinha || {}).fio || {}).assinatura || ""); if (assin && (mf || []).some((l) => String(l).includes(assin))) maoDoVilao = true; } catch (e) { calou("o momento do fio", e); }
    /* o episodio em curso fala pelo mesmo canal do arco: e a batida de
       dentro da batida — o cerco que a Jornada esta vivendo agora. */
    if ($ref.episodio && $ref.episodio.aberto) p = porNaPauta(p, "momento", envelopeDoEpisodio($ref.episodio));
    /* a Noite-torneio fala pelo mesmo canal: a chave, o rival, o teto do
       interludio — instrucao de mesa, nunca nome de sistema */
    if ($ref.modo === "rapida" && $ref.noite && $ref.noite.prato === "torneio" && $ref.torneio && !$ref.combate) {
      p = porNaPauta(p, "momento", envelopeDaChave($ref.torneio) + " " + provocacaoDoRival($ref.torneio) + " " + oEnvelopeDoFio("interludioDoTorneio"));
    }
    /* MM13: o prenúncio do sino é um aviso de UM turno — a pauta o consome
       e apaga, para não repeti-lo enquanto ele espera para encher de vez. */
    if ($ref.sinoDoTurno) { p = porNaPauta(p, "momento", $ref.sinoDoTurno); $ref.sinoDoTurno = ""; }
    /* v9.118: a vizinhança tem seção própria e prioridade baixa — numa cena
       cheia a gente presente ganha dela, e é isso que se quer */
    p = porNaPauta(p, "daqui", g.daqui);
    /* MM12: a cidade por dentro — o hoje e a língua sempre, a resposta ao
       que o jogador perguntou só quando ele pergunta. Nunca em jornada, em
       masmorra nem em combate: ali não há rua para se perguntar nada dela. */
    /* MM14: as tres fichas da mesa (cidade, gente, mercado), pela mesma
       frase e o mesmo elenco desta cena — agora em fichasDaMesa, para que
       o sinal do oraculo tambem consiga perguntar. */
    const { cidade: fc, gente: gp, mercado: mc, horizonte: hz, preco: pc } = fichasDaMesa(acaoDoTurno, aqui);
    if (fc) p = porNaPauta(p, "cidade", fc.cidade);
    /* MM14: as três fichas juntam-se numa mesa só, pela ordem em que a
       frase pediu cada coisa — não pela ordem em que os módulos correram. */
    p = porNaPauta(p, "pergunta", juntarRespostas([fc, gp, mc, hz, pc]));
    /* E1 (o Narrador só narra): O PREÇO da rua — a cena mostra preços sem
       ninguém perguntar, e é melhor que os mostre certos. Só com rua. */
    try {
      if ($ref.cidadeAtual && !$ref.jornada && !$ref.masmorra && !$ref.combate) p = porNaPauta(p, "preco", precosDaRua(fatorDoPouso(), { moeda: moedaDoMundo() }));
    } catch (e) { calou("precosDaRua", e); }
    /* E1: NOMES À MÃO — dois nomes livres da cultura, para o figurante que a
       cena pede. Ninguém do registo, do elenco nem do grupo. Ficam pendentes:
       só contam como oferecidos se a linha chegar ao texto. */
    $ref.nomesPendentes = null;
    try {
      const p0 = $ref.personagem || $render.personagem || {};
      const usados = [...Object.values($ref.npcs || {}), ...nomesDoElenco(), ...(p0.grupo || []), p0.nome || ""].filter(Boolean);
      const nomes = nomesAMao({ semente: sementeMundo(), dia: $ref.dia, cidade: $ref.cidadeAtual || "", genero: generoMundo(), lex: (mundoAtual() || {}).lexico, usados });
      const linha = linhaDosNomesAMao(nomes);
      if (linha) { p = porNaPauta(p, "nomes", linha); $ref.nomesPendentes = { nomes, linha }; }
    } catch (e) { calou("nomesAMao", e); $ref.nomesPendentes = null; }
    p = porNaPauta(p, "naoPode", g.naoPode);
    /* 11/10 (MM11 · 5.ª sessão, M10): a compra ou a dádiva que a frase
       declarou e o sistema não fechou — o Narrador não entrega o que a
       bolsa não pagou */
    /* MM-C · C0: se o próprio turno abriu o combate (a agressão declarada), o
       veto da luta sem painel já não é verdade e não viaja */
    try { if ($ref.combate && ($ref.naoPodeDoTurno || []).includes(LUTA_SEM_PAINEL.veto)) $ref.naoPodeDoTurno = $ref.naoPodeDoTurno.filter((v) => v !== LUTA_SEM_PAINEL.veto); } catch (e) { calou("o veto da luta com o combate aberto", e); }
    try { p = porNaPauta(p, "naoPode", $ref.naoPodeDoTurno || []); } catch (e) { calou("o veto da bolsa da frase", e); }
    /* MM13: enquanto o mural espera, o veto vai junto do do geógrafo. */
    p = porNaPauta(p, "naoPode", vetosDaAbertura({ abertura: $ref.abertura, missoes: $ref.missoes }));
    /* MM15 (4): o segredo que a espinha guarda não é a boca do Narrador —
       o veto só nasce quando a frase do turno nomeia um segredo de pé. */
    try {
      p = porNaPauta(p, "naoPode", vetoDoSegredo(acaoDoTurno, segredosGuardados($ref.espinha, mundoDaBase()), { lugar: ($ref.lugar && $ref.lugar.nome) || "" }));
    } catch (e) { calou("vetoDoSegredo", e); }
    /* O JUIZ CORRIGE: a invenção da resposta anterior que o sistema contradiz,
       com o número certo — só no turno logo a seguir, ou quando a frase toca a
       coisa (vetosParaAPauta). O turno é o do textoDaPauta. */
    try { p = porNaPauta(p, "vetoDoJuiz", ...vetosParaAPauta($ref.vetosDoJuiz, { turno: $ref.turnoDeRegistro + 1, cidade: $ref.cidadeAtual || "", frase: acaoDoTurno })); } catch (e) { calou("o veto do juiz na pauta", e); }
    /* v9.165: A LEI DA FORMA na cena — quem guarda este andar, o estado da
       maré do porto. Só parado em cidade: no meio da estrada a linha do
       andar de trás seria mentira sobre o lugar onde a cena está. */
    if (!$ref.jornada && !$ref.masmorra) { /* MM16 nº 4: a lei do andar é a da cidade, não a da masmorra */
      const lf = leiParaPauta({
        molde: moldeMundo(), semente: sementeMundo(), mapa: $ref.mapa,
        forma: $ref.forma, lex: (mundoAtual() || {}).lexico, genero: generoMundo(),
        cidadeAtual: $ref.cidadeAtual, dia: $ref.dia,
      });
      p = porNaPauta(p, "onde", lf.onde);
      p = porNaPauta(p, "naoPode", lf.naoPode);
    }
    /* v9.105: O ARQUIVISTA. Ele não resume a campanha — recupera as três
       linhas que importam a ESTA cena, com esta gente, neste lugar. O
       custo é fixo para sempre: uma campanha de mil turnos entrega as
       mesmas três que uma de trinta. */
    /* v9.106: O INTÉRPRETE. Uma linha por pessoa presente, no máximo
       três. Ele diz o que cada uma FAZ; o que ela DIZ continua sendo do
       Narrador, e é onde ele é insubstituível. */
    {
      /* v9.135: o Interprete e consultado UMA vez por turno, em `enviar`,
         porque o ATOR precisa do movimento antes de a Pauta ser montada.
         Consultar duas vezes sortearia dois movimentos e marcaria memoria
         duas vezes — a pessoa faria uma coisa e falaria sobre outra. */
      const r = $ref.interprete || interpreteParaPauta(pessoasDaCena(), { elenco: $ref.elencoMem });
      p = porNaPauta(p, "gente", r.linhas);
      if (!$ref.interprete) for (const m of r.marcas) $ref.elencoMem = marcarMovimento($ref.elencoMem, m.nome, m.id, m.gesto);
      p = porNaPauta(p, "fala", envelopeDasFalas($ref.falasDoTurno));
      /* v9.137: a seção ACABOU ("o que o sistema resolveu agora") estava
         declarada na Pauta e não tinha UM produtor sequer. É exatamente o
         lugar do propósito que amadureceu: o Mestre já resolveu, e o
         Narrador só narra o momento em que aparece. */
      p = porNaPauta(p, "acabou", ($ref.propositosDoTurno || []).map((x) => x.envelope).join("\n"));
      /* MM10: o crime deste turno (testemunhas, a lei, o preço) — uma vez
         só, e depois limpo; e o veto de quem é procurado aqui, todo turno
         em que durar. */
      try {
        if ($ref.crimeDoTurno) {
          p = porNaPauta(p, "acabou", $ref.crimeDoTurno.acabou || []);
          p = porNaPauta(p, "naoPode", $ref.crimeDoTurno.naoPode || []);
          $ref.crimeDoTurno = null;
        }
        p = porNaPauta(p, "naoPode", procuradoParaPauta($ref.lei, { cidade: $ref.cidadeAtual, dia: $ref.dia }).naoPode);
      } catch (e) { calou("crimeParaPauta", e); }
    }
    /* MM13: O MUNDO PINGA FIOS — no máximo uma linha por turno, da primeira
       pessoa em cena que tiver algo a dizer sobre a principal. */
    try {
      for (const pessoa of aqui || []) {
        const fio = fioParaAPrincipal({ abertura: $ref.abertura, missoes: $ref.missoes, semente: sementeMundo(), pessoa });
        if (fio) { p = porNaPauta(p, "gente", fio); break; }
      }
    } catch (e) { calou("o fio da abertura", e); }
    /* v9.108: O ALIADO AGE POR CONTA PRÓPRIA. Um por turno, e só um: o
       silêncio dos outros é o que faz a vez de cada um valer alguma
       coisa. */
    /* v9.110: O ADVERSÁRIO. Uma linha, e ela é a mesma coisa que a
       mecânica vai fazer: a prioridade de alvo desta intenção é a que
       entra no `turnoDosInimigos` logo abaixo. Uma intenção que não muda
       o alvo seria adjetivo. */
    {
      const v = intencaoDaLuta();
      if (v) {
        const antes = $ref.intencao || "";
        $ref.intencao = v.intencao.id;
        p = porNaPauta(p, "contra", linhaDaLuta(v.situacao, alvosDaLuta(), { antes }));
        /* a VIRADA é fato consumado e vai ao canon, não à Pauta: a Pauta
           diz o que vale agora, o canon diz o que já aconteceu e não se
           desfaz. Sai uma vez só, na rodada em que virou. */
        const env = envelopeDaVirada(v.situacao, { antes });
        if (env) $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${env}`;
      }
    }
    {
      const r = aliadoParaPauta(aliadosDaCena());
      if (r.linhas.length) {
        p = porNaPauta(p, "aliado", r.linhas);
        marcarQueFalou(r.quem);
        if (r.vaiEmbora) aliadoVaiEmbora(r.quem);
      }
    }
    /* v9.107: A AMEAÇA PENSA. Duas linhas no máximo — o que ela concluiu
       e o que faz por causa disso. A leitura sobe junto de propósito: sem
       ela a resposta parece arbitrária, e com ela o Narrador sabe se está
       encenando um vilão que acertou ou um que se enganou. */
    {
      const r = respostaDaAmeaca();
      if (r) maoDoVilao = true;
      /* nexo (11/10): o nome só depois do rosto — o mesmo motivo do arco */
      if (r) p = porNaPauta(p, "vilao", vilaoParaPauta(r, { nome: (($ref.nemesis || {}).conhecido && ($ref.nemesis || {}).nome) || "a ameaça" }));
    }
    /* v9.112: O MUNDO LEMBROU. Raro de propósito — uma vez a cada cinco
       dias, no máximo. A dívida só é marcada como cobrada DEPOIS de a
       linha entrar na Pauta: marcar antes perderia a conta para sempre
       se ela não coubesse, e em silêncio. */
    {
      const r = oQueOMundoCobra();
      const linha = r ? linhaDoMundo(r) : "";
      if (linha) {
        p = porNaPauta(p, "mundo", linha);
        $ref.cobrouAgora = true;
        $ref.cobradas = [...$ref.cobradas, r.chave].slice(-200);
        $ref.ultimaCobranca = $ref.dia;
        $ref.formasCobradas = [...$ref.formasCobradas, r.cobranca.id].slice(-6);
        $ref.nota = `${$ref.nota ? $ref.nota + "\n" : ""}${envelopeDoMundo(r)}`;
      }
    }
    /* v9.142: quem são as potências, o que cada uma quer e o que acha de
       você. Vai em O MUNDO porque é o mundo em volta — e vai SEMPRE, não
       só quando o mundo cobra uma dívida antiga. */
    p = porNaPauta(p, "mundo", envelopeDasPotencias(potenciasAqui(), $ref.diplomacia));
    try { p = porNaPauta(p, "antes", saidaParaPauta(sementeMundo(), $ref.mapa, contextoDoElenco(), $ref.elenco, { dia: $ref.dia, cidade: $ref.cidadeAtual }).antes); } catch (e) { calou("saidaParaPauta", e); }
    /* MM-C C2: QUEM CARREGA — uma batida por turno, da subtrama de quem está
       em cena (subtramas.js). Como a QUEM É, só conta se chegar ao texto:
       fica pendente, e o envio confirma (confirmarCoracao). O que um clique
       decidiu (a decisão, o porquê) entra uma vez, no turno que ele envia. */
    let quemCarrega = "";
    try {
      const fala = $ref.coracaoFala;
      $ref.coracaoFala = null;
      if (fala && fala.linha) p = porNaPauta(p, fala.secao === "pergunta" ? "pergunta" : "coracao", fala.linha);
      const nucleo = nucleoAgora();
      const frase = String(acaoDoTurno || "").trimStart().startsWith("[") ? "" : String(acaoDoTurno || "");
      const ctx = contextoDoCoracao(nucleo, { frase, maoDoVilao });
      const r = fala && fala.proprio ? { coracao: $ref.coracao, linha: "", quem: "", efeitos: [], longe: [], batida: null } : avancarCoracao($ref.coracao, nucleo, ctx); /* o turno que o próprio coração envia é a batida dele: nenhuma outra no mesmo fôlego */
      if (r.linha) p = porNaPauta(p, "coracao", r.linha);
      if ((r.longe || []).length) p = porNaPauta(p, "foraDeCena", r.longe.map((x) => x && x.texto).filter(Boolean));
      quemCarrega = r.quem || "";
      $ref.coracaoPendente = { r, turno: ctx.turno, emCena: ctx.emCena };
    } catch (e) { calou("avancarCoracao", e); $ref.coracaoPendente = null; }
    /* MM-C C1: QUEM É — a ficha por dentro de quem do núcleo está em cena,
       uma pessoa por turno, e a mesma só de tantos em tantos turnos
       (nucleo.js), no turno que a pauta leva. O ritmo só conta se a linha
       CHEGA ao texto (o teto pode cortá-la): fica pendente, e o envio confirma. */
    try {
      const nucleo = nucleoAgora();
      const esp = $ref.espinha || {};
      const turnoQ = $ref.turnoDeRegistro + 1;
      const q = { ultimas: {}, cenas: {}, ...($ref.quemE || {}), pendente: null };
      const r = quemEParaPauta(nucleo, { emCena: nucleoEmCena(nucleo), ato: ($ref.historia || {}).etapa || 0, ultimoAto: Math.max(0, (esp.atos || []).length - 1), turno: turnoQ, ultimas: q.ultimas, cenas: q.cenas, fio: esp.fio || null, jaCarrega: quemCarrega, ...elencoDoCoracao(), espinha: esp, cidade: cidadeDoCoracao() }); /* 13/10 (v9.461): quem a historia sabe longe nao leva a ficha */
      p = porNaPauta(p, "quemE", ...(r.quemE || []));
      $ref.quemE = { ...q, pendente: r.quem && r.quemE && r.quemE[0] ? { quem: r.quem, turno: turnoQ, linha: r.quemE[0] } : null };
    } catch (e) { calou("quemEParaPauta", e); } try { p = porNaPauta(p, "foraDeCena", foraDeCenaParaPauta($ref.elenco, { dia: $ref.dia, cidade: $ref.cidadeAtual, npcs: $ref.npcs, emCena: (() => { try { const c = ($ref.mensagens || []).filter((m) => m && m.autor === "mestre").slice(-2).map((m) => m.texto).join(" "); return Object.keys($ref.npcs || {}).filter((nm) => c.includes(nm)); } catch (e2) { return []; } })() }).foraDeCena); } catch (e) { calou("foraDeCenaParaPauta", e); }
    p = porNaPauta(p, "antes", arquivistaParaPauta($ref.registro, {
      onde: linhaDoLugarDaMesa(),
      quem: (elencoDaOnda().aqui || []),
      assunto: ($ref.compasso || {}).assunto || "",
      turnoAtual: $ref.turnoDeRegistro,
      diaAtual: $ref.dia,
    }));
    /* ---------------- O PESO DA CENA (v9.204) ----------------
       Reconhece a gravidade dos fatos do turno, poe o peso na pauta e
       CALA o mundo pelo canal do veto (mercado, oferta e trabalho somem).
       Um peso por cena — pesoDaCena ja garante isso. Consome e limpa: o
       peso e um beat, e "solta" e o jogador seguir quando quiser. */
    try {
      const cena = pesoDaCena($ref.fatosDoPeso);
      if (cena) $ref.ultimoPeso = { peso: cena.peso, dia: $ref.dia };
      if (cena) {
        p = porNaPauta(p, "peso", "Esta cena tem PESO: " + cena.nome + " — " + cena.diz + ". Quem tem laco com isto comparece.");
        p = porNaPauta(p, "naoPode", vetoDoPeso(cena.peso));
      }
      $ref.fatosDoPeso = {};
    } catch (e) { /* o peso nunca pode custar o turno */ }

    /* ---------------- A MESA POSTA (v9.201) ----------------
       Quando a acao declarada casa com uma situacao conhecida, as DUAS
       versoes da cena chegam ao Narrador ANTES do dado — e a de falha
       nomeia a moeda, a lei que impede o "nada acontece". Casa
       conservador (chave forte) e fica de fora do combate, que tem
       resolucao propria. Nunca custa o turno. */
    try {
      if (!$ref.combate) {
        const sit = situacaoQueCasa(acaoDoTurno);
        if (sit) { const ap = apostas(sit); if (ap) p = porNaPauta(p, "mesa", "Se " + ap.sePassa, "Se " + ap.seFalha, ap.noMeio ? "Se " + ap.noMeio : ""); }
      }
    } catch (e) { /* a aposta nunca pode custar o turno */ }
    /* ---------------- MM3: O GOLPE FINAL, NA PAUTA ----------------
       O envelope nasce em `continuarGolpeDoJogador` (aplicarEscolha ja
       resolvido) e mora num ref ate a PROXIMA montagem da pauta -- que e
       sempre a narracao do proprio golpe (`enviar` monta a pauta uma vez
       por turno). Consome e limpa: um golpe final e um fato de UM turno,
       nunca do proximo. */
    try {
      const gf = $ref.golpeFinalEnvelope;
      if (gf) p = golpeFinalNaPauta(p, gf); /* MM14: o "como" era cortado pelo teto em ACABOU (prio 3,1) e nunca chegava; vai em DESFECHO */
    } catch (e) { /* o golpe final nunca pode custar o turno */ }
    $ref.golpeFinalEnvelope = null;
    /* ---------------- MM6: O ESCONDIDO FORA DA LUTA ----------------
       Dentro da luta a linha e a do tabuleiro (resumoGridPrompt, em `enviar`);
       aqui e o veto — quem nao me viu nao pode reagir a mim por conta propria. */
    try {
      if (!$ref.combate) {
        const peEsc = pautaDoEscondido($ref.personagem || $render.personagem, { presentes: aqui });
        if (peEsc) p = porNaPauta(p, "naoPode", peEsc.naoPode);
      }
    } catch (e) { /* o veto do escondido nunca pode custar o turno */ }
    /* MM18: O RUMO — reagir e responder primeiro, depois UMA ponte para o
       próximo passo da principal; e, se o jogador está fora do fio há
       turnos, o degrau da escada (o sinal, quem vem buscar, a cobrança).
       Fora da luta: lá a ordem do turno é a do tabuleiro. Entra ANTES de
       `cederNaCena` porque nada vem depois dele, e não cede: "rumo" não
       está em nenhuma lista de `SECOES_QUE_CEDEM`. */
    try {
      if (!$ref.combate && $ref.modo !== "rapida") {
        const rumo = linhaDoRumo({
          pedido: lerOPedido(acaoDoTurno),
          degrau: degrauDaEscuta(garantirEscuta($ref.escuta).semAvanco),
          passo: proximoPasso({ abertura: $ref.abertura, missoes: $ref.missoes }),
          semente: $ref.dia,
          /* MM19 (v9.394, o backend): o mundo que o degrau do encalhe precisa
             para virar cena com nome e lugar — onde estou, o fio aberto, a
             espinha e o ato, o dia, e quem anda contra mim */
          mundo: { aqui: (g.onde || [])[0] || "", abertura: $ref.abertura, missoes: $ref.missoes,
                   espinha: $ref.espinha, ato: $ref.historia.etapa, dia: $ref.dia, vilao: $ref.nemesis,
                   /* 12.ª sessão: quem o Mestre já nomeou está em cena, e não se apresenta de novo */
                   mostrado: falasDoMestre($ref.mensagens) },
        });
        if (rumo) p = porNaPauta(p, "rumo", rumo);
      }
    } catch (e) { calou("o rumo na pauta", e); }
    /* A CAMPANHA QUE PRENDE (item 1): O QUE VOLTA — a promessa que a narração
       plantou e o sistema guardou volta quando amadurece. Anda o relógio, por
       isso UMA vez por turno (pautaDoTurno só é chamada em `enviar`). Fora da
       Noite: lá não há campanha para prometer. */
    try {
      if ($ref.modo !== "rapida") {
        const rv = cobrarNoTurno($ref.prometido, {
          pedido: lerOPedido(acaoDoTurno), luta: !!$ref.combate,
          fio: fioDaHistoria({ abertura: $ref.abertura, missoes: $ref.missoes }),
          mortos: ($ref.baseMundo || {}).mortos || [],
        });
        $ref.prometido = rv.estado;
        if (rv.linha) p = porNaPauta(p, "volta", rv.linha);
      }
    } catch (e) { calou("o que volta na pauta", e); }
    /* (item 2): O FECHO — como acaba a resposta deste turno, nunca o anterior;
       no fim do ato, a escolha com preço (a batida que vira o ato). */
    try {
      let fimDeAto = false;
      try { fimDeAto = !!((marcoAtual($ref.espinha, $ref.historia.etapa) || {}).batida || {}).fecho; } catch (e) { calou("o fim do ato", e); }
      const fx = escolherFecho({
        pedido: lerOPedido(acaoDoTurno), luta: !!$ref.combate, fimDeAto,
        gente: (pessoasDaCena() || []).length > 0 || (($ref.personagem || {}).grupo || []).length > 0,
        ultimo: $ref.fecho,
        sorte: rng(hashSemente(sementeMundo() + "|fecho|" + $ref.turnoDeRegistro)),
      });
      $ref.fecho = fx.id;
      p = porNaPauta(p, "fecho", fx.linha);
    } catch (e) { calou("o fecho na pauta", e); }
    /* MM16 nº 5: O QUE CEDE ONDE. A tabela é do motor (`SECOES_QUE_CEDEM`);
       aqui só se diz que cena é esta. `arredores` é FORA DOS MUROS — sem
       cidade (estrada, jornada) ou num lugar marcado `distancia: "arredores"`
       —, o mesmo sinal de `ondeSeProcura`; `lugarRef` sozinho não serve,
       porque também guarda o lugar "dentro" (a taberna, a praça). */
    try {
      const fora = !$ref.cidadeAtual || !!($ref.lugar && $ref.lugar.distancia === "arredores");
      p = cederNaCena(p, { luta: !!$ref.combate, masmorra: !!$ref.masmorra, arredores: fora });
    } catch (e) { calou("cederNaCena", e); }
    /* F2a · EM CENA: o sistema entrega ao Mestre a lista do que existe, e a
       linha engole os NOMES À MÃO (que continuam a ser confirmados pela linha
       deles, que vai dentro). Depois do cederNaCena: na luta não entra (a
       vista da luta já é a lista), e a linha encolhe até não tirar nada. */
    try {
      const lista = montarEmCena(contextoDoEmCena(acaoDoTurno, aqui));
      $ref.emCena = lista;
      p = pautaComEmCena(p, lista, { luta: !!$ref.combate, turno: $ref.turnoDeRegistro + 1 });
    } catch (e) { calou("EM CENA", e); }
    return p;
  };
  /* ---------------- QUEM ANDA COMIGO (v9.108) ----------------
     Traduz o grupo para a situação que o acervo do aliado sabe ler. A
     alma de cada um nasce na primeira vez que ele é visto e nunca muda:
     uma pessoa que troca de código toda semana não tem código. */
  const aliadosDaCena = () => {
    try {
      const p0 = fichaViva() || $render.personagem || {};
      const grupo = p0.grupo || [];
      if (!grupo.length) return [];
      const mem = garantirAliados($ref.aliados);
      const pares = paresEntre($ref.npcs);
      const ctxAto = contextoDoAto();
      return grupo.map((g) => {
        const nome = g.nome || "";
        if (!mem[nome]) mem[nome] = nascerAliado(nome);
        const a = mem[nome];
        if (a.saiu) return null;
        const v = vontadePorId(a.vontade);
        const atrito = pares.find((x) => x.tipo === "rivalidade" && (x.a === nome || x.b === nome)
          && grupo.some((o) => (o.nome || "") === (x.a === nome ? x.b : x.a)));
        return {
          nome,
          vontade: a.vontade,
          vontadeTexto: (v && v.o) || "",
          apodrecerTexto: (v && v.apodrece) || "",
          etapa: a.etapa,
          apodrecendo: a.parada >= DIAS_ATE_APODRECER * 0.6,
          apodreceu: a.apodreceu,
          codigoTexto: (codigoPorId(a.codigos[0]) || {}).o || "",
          cruzouAgora: !!cruzouOCodigo(a, contextoDoAto()),
          cruzou: a.cruzou,
          vinculo: Number(g.vinculo) || 50,
          calado: a.calado,
          atritoCom: atrito ? (atrito.a === nome ? atrito.b : atrito.a) : "",
          publico: !!$ref.cidadeAtual && !$ref.acampado,
          emCidade: !!$ref.cidadeAtual,
          acampado: !!$ref.acampado,
          emCombate: !!$ref.combate,
          ato: $ref.atoDoTurno,
          /* o contexto do ato entra JUNTO da cena: as opiniões leem os
             dois e separá-los foi o que fez a primeira versão calar */
          ...ctxAto,
        };
      }).filter(Boolean);
    } catch (e) { return calou("aliadosDaCena", e); }
  };
  /* O contexto que o CÓDIGO consulta. Grosseiro de propósito: um código
     cruzado por engano custa uma cena; um nunca cruzado custa o módulo
     inteiro, porque a peça que faz a relação gastar deixa de existir. */
  const contextoDoAto = () => {
    const p0 = fichaViva() || $render.personagem || {};
    return {
      ato: $ref.atoDoTurno,
      presente: (p0.grupo || []).length > 0,
      emCombate: !!$ref.combate,
      rendido: false,
      suborno: $ref.atoDoTurno === "paguei" && /suborn|calar|compr[oa]/i.test(String($ref.ultimaAcao || "")),
      alguemPrecisava: $ref.atoDoTurno === "ignorei" && ($ref.contadores.pedidosRecusados || 0) > 0,
      quebreiPromessa: false, roubeiPobre: false, fugi: ($ref.contadores.fugas || 0) > 0,
      escolhiEstranho: false, usoProibido: false, saqueiCorpo: false, quebreiLei: false,
      poupei: ($ref.contadores.poupados || 0) > 0,
    };
  };
  /* Depois de falar, ele cala por um tempo. E quem NÃO falou fica mais
     perto da vez dele — é o que faz o grupo se revezar sozinho. */
  const marcarQueFalou = (quem) => {
    const mem = garantirAliados($ref.aliados);
    for (const [nome, a] of Object.entries(mem)) {
      mem[nome] = { ...a, calado: nome === quem ? 0 : a.calado + 1 };
    }
    $ref.aliados = mem;
  };
  const aliadoVaiEmbora = (quem) => {
    const mem = garantirAliados($ref.aliados);
    if (!mem[quem]) return;
    mem[quem] = { ...mem[quem], saiu: true };
    $ref.aliados = mem;
    mudarFicha((p) => ({ ...p, grupo: (p.grupo || []).filter((g) => (g.nome || "") !== quem) }));
    pushMsgs([{ autor: "sistema", texto: `${quem} pegou as coisas dele e foi embora.` }]);
    $ref.nota = ($ref.nota ? $ref.nota + "\n" : "") + oEnvelopeDaGente("companheiroFoiEmbora", { quem });
  };
  /* ---------------- A MENTE DA AMEAÇA (v9.107) ----------------
     O retrato que o Sistema Vilão lê. Nenhum campo é inventado: o plano
     vem de `vilao.js`, o que chegou até ele vem do livro-razão, e o
     herói pelos olhos dele sai da ficha e dos contadores. */
  const menteDaAmeaca = () => {
    const v = $ref.nemesis;
    if (!v || !v.nome) return null;
    const p0 = fichaViva() || $render.personagem || {};
    const saber = garantirSaber($ref.saber);
    const naoSabe = oQueEleNaoSabe(saber, ($ref.registro || []).filter((x) => x.peso >= 2));
    return {
      nome: v.nome, arquetipo: v.arquetipo, corpo: v.corpo || "pessoa",
      passo: v.passo || 0, conhecido: !!v.conhecido, marcas: (v.marcas || []).length,
      quanto: saber.length,
      certezaMax: saber.reduce((a, x) => Math.max(a, certezaDe(x)), 0),
      ignora: naoSabe.length,
      fama: Math.round(famaAtual()),
      nivel: p0.nivel || 1,
      heroiFerido: (p0.vida || 0) < (p0.vidaMax || 1) * 0.5,
      heroiSozinho: !(p0.grupo || []).length,
      heroiRico: (p0.moedas || 0) >= 300,
      heroiMatou: ($ref.contadores.inimigosDerrotados || 0) > 0,
      heroiPoupou: ($ref.contadores.poupados || 0) > 0,
      heroiFugiu: ($ref.contadores.fugas || 0) > 0,
      heroiAceitouAlgo: ($ref.contadores.contratos || 0) > 0,
      perto: !!(v.marcas || []).some((m) => String(m).includes($ref.cidadeAtual || "\u0000")),
      dia: $ref.dia,
      desdeQueAgiu: $ref.dia - $ref.vilaoAgiu,
    };
  };
  const respostaDaAmeaca = () => {
    try {
      const m = menteDaAmeaca();
      if (!m) return null;
      const r = responder(m);
      if (r) $ref.vilaoAgiu = $ref.dia;
      return r;
    } catch { return null; }
  };
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
  /* O rótulo curto do lugar, que o registro guarda e o Arquivista casa.
     Curto de propósito: "no Escudo das Velas" casa com "no Escudo das
     Velas, dentro de Forte do Vigia" na comparação por prefixo. */
  const linhaDoLugarDaMesa = () => {
    const mm = $ref.masmorra;
    if (mm && !mm.encerrada) return mm.nome;
    if ($ref.lugar && $ref.lugar.nome) return $ref.lugar.nome;
    if ($ref.jornada) return `estrada para ${$ref.jornada.para || "adiante"}`;
    return $ref.cidadeAtual || "";
  };
  /* ---------------- O ESPAÇO, NUMA CHAMADA (v9.118) ----------------
     Cinco lugares deste arquivo montavam à mão o mesmo objeto para
     perguntar onde o herói está — cidade, jornada, masmorra, mapa, lugar —
     e bastava um deles esquecer um campo para o Geógrafo responder sobre
     um herói que não era este. Agora é uma função só, e quem quiser
     acrescentar um campo acrescenta para todos de uma vez. */
  const contextoDoEspaco = () => ({
    cidadeAtual: $ref.cidadeAtual,
    jornada: $ref.jornada,
    masmorra: $ref.masmorra,
    mapa: $ref.mapa,
    lugar: $ref.lugar,
    semente: sementeMundo(),
  });
  /* Onde eu estou, em coordenada. É esta a posição que a tela desenha, que
     o Mestre recebe e que a boca de uma masmorra guarda ao ser aberta. */
  const meuPonto = () => { try { return (posicaoDoHeroi(contextoDoEspaco()) || {}).coord || null; } catch (e) { calou("meuPonto", e); return null; } };
  /* v9.56: a linha da viagem passou a dizer PARA ONDE e QUANTO FALTA. Ela
     dizia só de onde e desde quando — o Mestre não sabia sequer o destino,
     e por isso escrevia "a estrada segue" turno após turno sem nunca
     apertar o ritmo. */
  /* ---------------- O BIOMA DE ONDE EU ESTOU (v9.99) ----------------
     Esta busca estava copiada em quatro lugares, e as quatro cópias
     tinham o mesmo furo: fora de cidade devolviam "planicie". Quem
     forrageia no meio de um pântano colhia flor de planície, e o
     acampamento da estrada nascia sempre no mesmo descampado.

     Em viagem o bioma é o da cidade DE ONDE parti — a estrada atravessa
     a paisagem das duas pontas, e a de partida é a única que o sistema
     tem certeza de já ter visto. */
  const biomaDaqui = () => {
    const cs = ($ref.mapa && $ref.mapa.cidades) || [];
    const acha = (nome) => (cs.find((c) => c.nome === nome) || {}).bioma || "";
    const j = $ref.jornada;
    return acha($ref.cidadeAtual) || (j ? acha(j.de) || acha(j.para) : "") || "planicie";
  };
  /* o nível é o da ficha VIVA (o ref, 4.ª fatia): o `personagem` do render
     é nulo nas closures que nascem no primeiro render (o aplicarResposta é
     uma delas), e a fama caía no nível 1 — o defeito 4 de 28/10 */
  const famaAtual = () => calcularFama($ref.contadores, (($ref.personagem || $render.personagem || {}).nivel) || 1, dominiosDe($ref.mapa).length);
  /* MM15 (4): o mundo que o segredo guardado precisa para saber o que um
     lugar É na base e quem lá trabalha — o mesmo formato de mundoDasTarefas. */
  const mundoDaBase = () => ({ semente: sementeMundo(), mapa: $ref.mapa, genero: generoMundo(), molde: moldeMundo(), lex: (mundoAtual() || {}).lexico, base: $ref.baseMundo });
  /* ---------------- AS MAOS DA CASA (v9.133) ----------------
     Nenhuma regra mora aqui: tudo o que decide esta em `guildas.js`, e este
     bloco so aciona, guarda e conta ao jogador. */
  const minhaCasa = () => ($ref.guildas || []).find((g) => g.membro) || null;
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
  /* 9.ª sessão (v9.433): as bancas que estão NA CENA — na cidade, as de
     sempre; na estrada, só a carroça do ambulante (a cidade de partida ficou
     para trás); na masmorra aberta, nenhuma. É daqui que a pauta tira o
     preço e a frase compra. */
  const bancasDaCena = () => {
    if ($ref.masmorra && !$ref.masmorra.encerrada) return [];
    const todas = Array.isArray(mercadoAqui) ? mercadoAqui : [];
    if ($ref.jornada) return todas.filter((m) => m && m.tipo === "ambulante");
    return $ref.cidadeAtual ? todas : [];
  };
  /* ---------------- COMPRAR MANTIMENTO (v9.150) ----------------
     O preço é recalculado AQUI, e não lido do que a tela mostrou: a
     tela pode estar velha (o dia virou, a estação mudou, a pressão da
     praça andou) e cobrar o número antigo seria deixar o jogador
     comprar no preço de ontem. Quem decide o preço é sempre o mesmo
     lugar, no instante do gesto. */
  const balcaoAqui = (cid = cidadeMercado) => balcaoDeMantimentos(cid, {
    dia: $ref.dia, pressoes: ($ref.mercado || {}).pressoes || {},
    extra: fatorDeMercado(($ref.postura || {}).postura, { vendendo: false }),
    temKit: garantirSuprimentos(($ref.personagem || $render.personagem).suprimentos).kit,
  });
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

  /* A SORTE. O que a pauta sorteia sem semente própria (o aliado que fala, a
     resposta da ameaça) usa a sorte da casa, como no App; quem chama de fora
     dele passa `entrada.sorte` (um gerador semeado) e a pauta corre dentro
     de comSorte, que repõe a da casa no fim. */
  const frase = entrada && typeof entrada === "object" ? entrada.frase : undefined;
  const sorte = entrada && typeof entrada === "object" ? entrada.sorte : undefined;
  let pauta;
  try { pauta = comSorte(sorte, () => pautaDoTurno(frase)); } finally { descarregar(); }
  return { pauta, escritas };
}
