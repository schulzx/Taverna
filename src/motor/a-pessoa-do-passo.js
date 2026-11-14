/* ============================================================
   A PESSOA DO PASSO (o Narrador ator, a 15.ª sessão · 03/11/2026) — src/motor/a-pessoa-do-passo.js

   A missão manda procurar «Godofredo, taverneiro, no Barril Rachado». O
   herói foi lá e chamou-o três vezes, e ele nunca entrou em QUEM ESTÁ: a
   ficha do ator punha-o só no «Quer» da companheira («Quer: falar com
   Godofredo, taverneiro daqui…»), e as FRONTEIRAS diziam «Falam só:
   Yvete». A Matilde do mural, na casa dela, o mesmo. No modo `mestre` era
   a prosa que os trazia e o Cronista que os registava; no `ator` nada
   entra pela boca do Narrador (mente/plano-narrador-ator.md, decisão 4), e
   a missão principal ficava parada no primeiro passo (mente/sessao-15.md,
   caso 1 e defeito 1).

   QUEM O PASSO PROCURA ESTÁ ONDE O PASSO DIZ. O sistema já sabe, sem ler
   prosa nenhuma: a etapa `falar_com` de uma missão ativa diz QUEM e ONDE;
   o herói está num lugar (`lugar`, `cidadeAtual`); e a base do mundo diz,
   de cada pessoa da cidade, o ofício, o jeito de falar (`modo`) e o que
   ela quer (`vontade`) — e, pela semente, a hora a que está no posto
   (gente-por-dentro.js, a rotina). Esta peça junta as três coisas: quando
   o herói está no sítio da pessoa do passo, a pessoa está em cena — com
   voz, o que sabe e o que quer — se a hora dela é esta; e se não é, a
   ficha diz porquê, com a verdade da rotina (onde ela anda e a que horas
   volta). O `falar_com` cumpre-se depois pela porta que já existe
   (registo-da-cena.js: quem a frase chama e está na ficha).

   O ONDE DA ETAPA, pela ordem: o `onde` da própria etapa; a abertura (a
   pista no sítio dela, o alvo no dele); o registo (`npcs[nome].local`); a
   gente da base desta cidade, pelo nome (é dela que o mural tira quem
   assina: o contrato aceite pelo botão nasce com `onde: ""`, e quem o
   assinou continua a morar onde a base o pôs). Um `onde` que é a cidade
   inteira não põe ninguém em cena: numa capital de sessenta mil almas, a
   pessoa não está em cada taverna.

   QUAIS ETAPAS: a atual de cada missão ativa, e as que se lhe seguem por
   cima de caminho só (ETAPAS_DE_CAMINHO, a mesma régua de `proximoPasso`).
   A conferência só avança a etapa atual; quem está mais adiante na mesma
   rua continua a ser gente do mundo.

   A 20.ª SESSÃO (mente/sessao-20.md §4.2, 13/11): 0 passos em 47 respostas.
   A quest de abertura pedia «Ouvir Brigid» — conversou(papel:mae) —, e esta
   peça só conhecia o `falar_com` das MISSÕES: a quest projeta-se no Diário
   com etapas do tipo `quest` (missaoDaQuest), que aqui não contavam, e a
   Brigid nasceu sem casa. Fui à porta dela, falei duas vezes, e ela nunca
   entrou em cena. Agora a pessoa que o passo ATIVO de uma quest pede
   (osPassosDasQuests, a-quest-manda.js: os candidatos «pessoa» da falta)
   conta como a de um `falar_com`, no sítio onde o papel mora (`local`,
   esqueleto.js#casaDe) — e, num save de antes da casa, onde a gente da base
   desta cidade a põe. O passo cumpre-se pela porta de sempre: quem a frase
   chama e está na ficha (registo-da-cena.js) vai ao livro como `falou`.

     aPessoaDoPasso(estado)
       estado: o do instante (abertura, missoes, lugar, cidadeAtual, npcs,
               mapa, baseMundo, mundo, nomeCampanha, dia, minuto, personagem)
     → [{ nome, papel, onde, de, aqui, agora, ausente, voz, quer, sabe, genero, missao, seguinte, rotulo }]
       de:      "pista" | "alvo" | "dador" | "etapa" | "quest"
       rotulo:  o que a quest diz da pessoa (só `de: "quest"`), ou ""
       aqui:    está em cena agora (a rotina diz que é a hora dela, ou o
                jogo não sabe a hora)
       ausente: a frase do porquê, quando não está (A_PESSOA_DO_PASSO.ausente)

   A 16.ª SESSÃO (mente/sessao-16.md): a principal saiu do primeiro passo e
   parou no segundo, por três razões que são todas desta peça.
     · QUEM DEU O PASSO NÃO SAI DE CENA (defeito 1). A Astrid falou no T3, o
       `falar_com` cumpriu-se, e no T4, à hora do balcão e ao lado dele, já
       não era «do passo»: ninguém a voltava a pôr lá, e as FRONTEIRAS diziam
       «vive em A Lanterna da Bruma, Ponto da Fonte» com o herói lá dentro (o
       registo carimba o sítio com a cidade, `localComCidade`, e `moradaDe`
       só lê «X, em Y» — `oSitioDoRegisto` traduz). Agora a pessoa da etapa
       cumprida que entregou a etapa de agora continua a ser do passo (`dado`):
       está no sítio dela, à hora dela, e é ela que sabe o passo de agora.
     · O QUE ELA SABE É O PASSO, COM CONTEÚDO (defeito 2). O «Sabe» era «mais
       do que ninguém… sobre o que o Largo do Cardo guarda» — e o «Não sabe
       responder a: «O que sabe?»» logo abaixo. O passo seguinte diz-se agora
       com o onde, o quem e o quê: «O Largo do Cardo fica em Rio Profundo, à
       guarda de Joric Filho da Névoa; o que lá se esconde acha-o quem lá
       procurar». A frase vaga da pista só fica quando não há passo a dizer.
     · O «REVELAR» TEM PORTA (defeito 3). Com o herói no sítio que a etapa
       manda descobrir, quem o guarda (a cena da batida, `GUARDA_NA_CENA`;
       senão o primeiro da gente da casa, o mesmo que batidas.js põe «à
       guarda») entra em cena como a pessoa de um `falar_com`, à hora dele; e
       `oQueOSitioEsconde` diz à ficha que o sítio esconde uma coisa e como se
       acha — e, quando o teste do turno passou ali, o que se achou (a mesma
       régua de `segredosReveladosNoTurno`, saga.js, que o Cronista usa para
       fechar o marco).

   A 17.ª SESSÃO (mente/sessao-17.md): a principal de dois passos parou no
   segundo por lugar e presença.
     · DE FOLGA «NO TEMPLO» É NUM TEMPLO (defeito 3, O_FORA_COM_SITIO): o
       sítio da rotina é um sítio desta cidade, dito pelo nome, e com o
       herói lá a pessoa está em cena, fora do posto.
     · QUEM VEIO TER COM O HERÓI FICA (defeito 4, O_QUE_VEIO_TER): a pessoa
       do passo que chegou com um pedido fica no sítio onde o herói a viu —
       a rua da cidade incluída, no mesmo dia —, e `osDoPasso` diz à ficha
       quem os passos procuram, para que ninguém «chegue» a meio da estrada.

   A 21.ª SESSÃO (mente/sessao-21.md §2.3, 13/11): a casa existia e o Diário
   dizia onde, e mesmo assim 0 passos em 28 respostas. Quorin, «quem tem um
   filho naquela barca», mora no cais da quest; o herói passou nove turnos
   lá, falou-lhe cinco vezes, e ela nunca entrou em cena. Duas razões, as
   duas daqui:
     · A HORA DO OFÍCIO NÃO MANDA EM QUEM A QUEST PÔS NO SÍTIO. A gente da
       base mora onde trabalha, e a rotina dizia «não está aqui agora» de
       manhã — com o filho dela refém a meio do rio. A pessoa que o passo de
       uma quest pede (`de: "quest"`) está no sítio do passo: a quest é o
       acontecimento da vida dela, e ela espera quem vem ouvi-la. Por isso
       "quest" não está em `aHoraConta`.
     · O QUE A QUEST DIZ DELA vem com ela: `rotulo` (o papel em frase de
       mundo, estadoDaQuest#rotulos) e, no «Sabe», o passo que vem depois do
       dela (`depoisTexto`) — é isso que «ouvir» quer dizer. A pauta do modo
       `boca` põe-na na linha EM CENA (pauta-do-turno.js, em-cena.js `doPasso`),
       e a conversa fecha o passo pela porta de sempre.

   Sem sorte: tudo sai do estado e da semente do mundo. Puro, sem React.
   Provado em `testes/teste-a-pessoa-do-passo.mjs` e `testes/teste-sessao-17.mjs`.
   ============================================================ */
import { garantirMissoes, estaEm, moradaDe, etapaAtual, textoDaEtapa, ETAPAS_DE_CAMINHO } from "../missoes.js";
import { GUARDA_NA_CENA } from "../batidas.js";
import { segredosReveladosNoTurno } from "../saga.js";
import { garantirAbertura } from "../abertura.js";
import { oQueExisteAqui } from "../mundo-base.js";
import { fichaDaPessoa } from "../gente-por-dentro.js";
import { MOLDE_PADRAO, moldePorId } from "../moldes.js";
import { cenarioAtivo } from "../cenario.js";
import { comEm } from "../lugar.js";
import { oficioNoGenero } from "../nomes.js";
import { osPassosDasQuests } from "../a-quest-manda.js";
import { MISSAO_DA_QUEST } from "../biblioteca-de-quests.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));
/* a mesma pessoa: o nome inteiro, ou o nome antes da vírgula do epíteto */
const mesmo = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.split(",")[0].trim() === y.split(",")[0].trim()); };
const minuscula = (x) => { const t = limpo(x); return t ? t[0].toLowerCase() + t.slice(1) : t; };

/* COMO SE DIZ O QUE O SISTEMA SABE DA PESSOA. {N} o nome, {P} o papel,
   {H} o herói, {A} o alvo da etapa, {E} onde («no Barril Rachado»), {O} o
   objeto da abertura, {T} o título da missão, {G} onde a pessoa anda agora
   (a rotina), {R} o posto, {I}–{F} as horas, ditas. */
export const A_PESSOA_DO_PASSO = Object.freeze({
  /* a pista da abertura: o que ela sabe é o que a abertura diz que sabe,
     e o que faz é o que a mesa sempre lhe pediu (PASSO_AQUI, abertura.js) */
  sabeDaPista: "mais do que ninguém nesta cidade sobre {O}",
  oNome: "diz o próprio nome a {H} logo que {H} lhe fala",
  /* quem assinou o contrato do mural, com ele aceite */
  querDoDador: "falar a {H} do trabalho que pregou no mural, «{T}», agora que {H} o aceitou",
  /* o passo que vem depois do desta pessoa, dito como coisa que ela sabe */
  sabeDaEtapa: Object.freeze({
    falar_com: "{A} encontra-se {E}",
    derrotar: "{A} anda {E}",
    /* a 16.ª (defeito 2): o onde, o quem e o quê do passo — {C} a cidade
       do sítio (cidadeDoSitio), {G} quem o guarda (guardaDito) */
    revelar: "{A} fica {C}{G}; o que lá se esconde acha-o quem lá procurar",
    /* …e com o herói já no sítio: é aqui */
    revelarAqui: "{A} esconde alguma coisa, e acha-a quem a procurar aqui{G}",
    ir_a: "o caminho para {A}",
  }),
  cidadeDoSitio: Object.freeze({ outra: "em {X}", esta: "nesta cidade" }),
  guardaDito: ", à guarda de {X}",
  guardaAqui: "; quem guarda o sítio é {X}",
  /* quem guarda o sítio do «revelar» (a 16.ª, defeito 3): o posto dele */
  agoraDoGuarda: "guarda {L}",
  /* o sítio do «revelar», dito na CENA: que esconde, e como se acha; e o
     que se achou, quando o teste do turno passou ali. {L} o sítio, {A}
     como se acha (ACHA_DITO), {H} o herói, {O} a coisa achada */
  sitioEsconde: "{L} esconde alguma coisa, e acha-a quem a procurar com {A}",
  sitioAchou: "{H} achou o que {L} escondia: {O}",
  /* sem `onde`: só o nome */
  semOnde: "quem é {A}",
  /* o que ainda há a fazer, nas etapas sem frase própria */
  oQueHa: "o que há a fazer a seguir: {A}",
  /* fora da hora: onde anda e quando volta, a verdade da rotina */
  ausente: "{N}{P} não está aqui agora: {G}. Costuma estar {R} {I} {F}.",
  horas: Object.freeze({ de: "desde", ate: "até" }),
  /* as famílias de ofício cujo posto não se vê (gente-por-dentro.js) */
  semPosto: Object.freeze(["comum"]),
  /* DE QUEM A HORA CONTA. A ordem de 03/11 diz que a hora conta, e conta
     para todos: a rotina é a mesma verdade que a pauta dá a quem pergunta
     «cadê?». Voltar atrás para um tipo (a pista da abertura, por exemplo)
     é tirá-lo daqui. */
  aHoraConta: Object.freeze(["pista", "alvo", "dador", "etapa", "guarda"]),
  /* (a 21.ª: a pessoa do passo de uma quest, `de: "quest"`, não está aqui
     de propósito — ver o cabeçalho) */
  /* A PESSOA DO PASSO DE UMA QUEST (a 20.ª, 13/11): os predicados da falta
     que pedem a pessoa FRENTE A FRENTE — falar, consultar, encontrar. O
     acompanhar e a afeição não: são de quem já anda com o herói */
  daQuest: Object.freeze(["conversou", "consultou", "conheceu"]),
});

/* ONDE ANDA QUEM NÃO ESTÁ NO POSTO (04/11, a 17.ª sessão, defeito 3). A
   ficha dizia do Godfrey «de folga hoje, no templo», e na catedral de Torre
   Alto ele não estava, nem às 9h20 nem às 12h05: a rotina
   (gente-por-dentro.js, FORA_DO_TURNO) dá um TIPO de sítio, e ninguém o
   punha lá. O primeiro passo só se cumpriu no dia seguinte, por quem achou o
   botão de esperar 24 h. Agora a verdade é inteira: o «no templo» é um
   templo desta cidade (o primeiro da base com esse tipo, que é a mesma
   ordem em qualquer máquina; o «numa taverna» é uma que não é a dele), a
   frase diz-lhe o nome, e com o herói lá a pessoa está em cena, fora do
   posto. O que não é sítio que se visite («em casa», «a tratar de família»)
   fica como vem; o que é sítio e a cidade não tem perde o sítio na frase
   (`semSitio`) — a ficha não diz «no templo» se o sistema não a põe lá.
   `tipos`: os tipos da base que valem por cada sítio de FORA_DO_TURNO;
   `agoraAqui`: o que está a fazer, quando o herói a encontra lá. */
export const O_FORA_COM_SITIO = Object.freeze({
  tipos: Object.freeze({
    "no templo": Object.freeze(["templo", "capela"]),
    "numa taverna da cidade": Object.freeze(["taverna"]),
    "na praça": Object.freeze([]),
  }),
  semSitio: "pela cidade",
  agoraAqui: Object.freeze({ folga: "de folga hoje, aqui por conta própria", fora: "fora do turno, aqui por conta própria" }),
});

/* COMO SE ACHA O QUE O SÍTIO ESCONDE — a perícia do segredo (`segredo.acha`,
   batidas.js: NOME_DO_TESTE) dita como o mundo a diz; o resto, o olho. */
export const ACHA_DITO = Object.freeze({
  percepcao: "olho atento",
  intelecto: "cabeça fria, a ler o que lá está",
  investigacao: "paciência, coisa a coisa",
  outro: "olho atento",
});

/* A HORA DITA. A rotina guarda o turno em minutos do dia (gente-por-dentro.js,
   FAMILIAS_DE_OFICIO); a ficha não diz «11h», diz «as onze da manhã». */
export const A_HORA_DITA = Object.freeze({
  nomes: Object.freeze(["meia-noite", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "meio-dia"]),
  partes: Object.freeze([{ ate: 360, o: "da madrugada" }, { ate: 720, o: "da manhã" }, { ate: 1140, o: "da tarde" }, { ate: 1440, o: "da noite" }]),
});
export function aHoraDita(minuto) {
  const m = ((Math.floor(Number(minuto) || 0) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  if (h === 0) return "a meia-noite";
  if (h === 12) return "o meio-dia";
  const n = A_HORA_DITA.nomes[h % 12];
  const parte = A_HORA_DITA.partes.find((p) => m < p.ate).o;
  return `${h % 12 === 1 ? "a" : "as"} ${n} ${parte}`;
}

/* o mundo da campanha: a mesma semente da pauta (`sementeMundo`) */
function oMundo(e) {
  const r = ehObj(e.render) ? e.render : {};
  const mundo = ehObj(e.mundo) ? e.mundo : ehObj(r.mundo) ? r.mundo : {};
  const nome = limpo(e.nomeCampanha) || limpo(r.nomeCampanha) || "aventura";
  let genero = limpo(mundo.genero), molde = null, padrao = "";
  try { padrao = cenarioAtivo().generos.padrao; } catch { padrao = ""; }
  try { molde = moldePorId(mundo.molde || MOLDE_PADRAO); } catch { molde = null; }
  return { semente: `${nome}|${genero}`, genero: genero || padrao, molde, lex: mundo.lexico || null };
}

/* onde o herói está, para `estaEm` (missoes.js) */
const aquiDe = (e) => ({ lugarAtual: ehObj(e.lugar) ? e.lugar : null, cidadeAtual: str(e.cidadeAtual) });

/* O SÍTIO QUE O REGISTO GUARDA. O registo carimba o paradeiro com a cidade
   onde o herói estava (npcs.js, localComCidade: «A Lanterna da Bruma, Ponto
   da Fonte»), e `moradaDe` só lê «X, em Y»: lido assim, o sítio inteiro
   era o nome, e a Astrid «vivia em A Lanterna da Bruma, Ponto da Fonte»
   com o herói lá dentro (a 16.ª, defeito 1). A vírgula só se lê como a
   cidade quando o que vem depois dela É uma cidade (a de agora, ou uma do
   mapa) — um epíteto com vírgula fica como veio. */
export function oSitioDoRegisto(local, estado) {
  const s = limpo(local);
  const m = s.match(/^(.*\S)\s*,\s*([^,]+)$/);
  if (!m || /^(em|no|na|nos|nas)\s/i.test(m[2])) return s;
  const e = ehObj(estado) ? estado : {};
  const cidades = [str(e.cidadeAtual), ...arr(ehObj(e.mapa) ? e.mapa.cidades : null).map((c) => (ehObj(c) ? str(c.nome) : ""))].filter(Boolean);
  return cidades.some((c) => sem(c) === sem(m[2])) ? `${m[1]}, em ${limpo(m[2])}` : s;
}

/* o `onde` que põe gente em cena: um sítio, e o herói nele */
function estaAqui(e, onde) {
  const lugar = semArtigo(moradaDe(onde).lugar);
  if (!lugar || !ehObj(e.lugar) || !limpo(e.lugar.nome)) return false;
  if (lugar === semArtigo(e.cidadeAtual) || lugar === semArtigo(e.lugar.cidade)) return false;
  try { return estaEm(aquiDe(e), onde); } catch { return false; }
}

/* O MARCO DO SÍTIO: o «descobrir» da espinha, de pé, cujo lugar é este
   (o alvo da etapa `revelar`, ou o lugar onde o herói está) */
function oMarcoDoSitio(e, alvo) {
  const L = semArtigo(moradaDe(alvo).lugar || alvo);
  if (!L) return null;
  for (const a of arr(ehObj(e.espinha) ? e.espinha.atos : null)) for (const m of arr(ehObj(a) ? a.marcos : null)) {
    if (ehObj(m) && !m.feito && m.feitio === "descobrir" && limpo(m.onde) && semArtigo(m.onde) === L) return m;
  }
  return null;
}
/* quem a cena da batida diz que guarda o marco («…, à guarda de Joric») */
function oGuardaDaCena(m) {
  const cena = ehObj(m) && ehObj(m.batida) ? str(m.batida.cena) : "";
  const k = cena.indexOf(`, ${GUARDA_NA_CENA} `);
  return k >= 0 ? limpo(cena.slice(k + GUARDA_NA_CENA.length + 3)) : "";
}

/* o que a pessoa sabe do passo que vem depois do dela. `guarda`: quem
   guarda o sítio de um `revelar` (o quem do passo); `aqui`: a cidade de agora */
function oQueSabeDe(et, H, guarda, aqui, jaLa) {
  if (!ehObj(et)) return "";
  const A = limpo(et.alvo);
  if (!A) return "";
  const onde = limpo(et.onde);
  const P = A_PESSOA_DO_PASSO;
  if (et.tipo === "revelar") {
    const cid = limpo(moradaDe(onde).cidade);
    const C = cid && sem(cid) !== sem(aqui) ? tpl(P.cidadeDoSitio.outra, { X: cid }) : tpl(P.cidadeDoSitio.esta, {});
    return tpl(jaLa ? P.sabeDaEtapa.revelarAqui : P.sabeDaEtapa.revelar, { A: limpo(moradaDe(A).lugar) || A, C, G: guarda ? tpl(jaLa ? P.guardaAqui : P.guardaDito, { X: guarda }) : "" });
  }
  const modelo = P.sabeDaEtapa[et.tipo];
  if (modelo) return onde || !/\{E\}/.test(modelo) ? tpl(modelo, { A, E: onde ? comEm(onde) : "", H }) : tpl(P.semOnde, { A });
  let t = "";
  try { t = textoDaEtapa(et); } catch { t = ""; }
  return t ? tpl(P.oQueHa, { A: minuscula(t) }) : "";
}

/* ONDE O HERÓI ESTÁ, numa frase só: o sítio com a cidade («Catedral da
   Cinza, em Vale Verde»), ou a cidade sem sítio (a rua, à chegada). Na
   estrada, nada. É o que a ficha grava como o sítio de quem VEIO TER com o
   herói (O_QUE_VEIO_TER), e o que se compara depois. */
export function ondeOHeroiEsta(estado) {
  const e = ehObj(estado) ? estado : {};
  const cid = limpo(e.cidadeAtual);
  const L = ehObj(e.lugar) ? limpo(e.lugar.nome) : "";
  if (L) return limpo(e.lugar.cidade) || cid ? `${L}, em ${limpo(e.lugar.cidade) || cid}` : L;
  if (ehObj(e.jornada) || ehObj(e.masmorra)) return "";
  return cid;
}
const mesmoSitio = (x, y) => {
  const a = moradaDe(x), b = moradaDe(y);
  return !!semArtigo(a.lugar) && semArtigo(a.lugar) === semArtigo(b.lugar) && (!a.cidade || !b.cidade || semArtigo(a.cidade) === semArtigo(b.cidade));
};

/* QUEM VEIO TER COM O HERÓI FICA (04/11, a 17.ª sessão, defeito 4). À
   chegada a Vale Verde o Theron do Brejo, a pessoa do segundo passo, veio
   ter com a Inês com um pedido; no turno seguinte tinha saído de QUEM ESTÁ,
   com o botão do nome dele ainda na tela, e «Falo com Theron do Brejo…» foi
   respondido por uma passante. A pessoa do passo que entrou em cena não sai
   no turno seguinte: a ficha grava-a no sítio onde o herói a viu (o registo,
   `npcs[nome].local`, pela mesma porta da conversa — registo-da-cena.js), e
   enquanto o herói lá estiver ela está em cena — até ao fim da conversa (o
   passo cumprido deixa-a no sítio dela, como sempre) ou até ele sair. Na
   rua (a cidade sem sítio), só no mesmo dia: o encontro à porta da cidade
   não fica à espera dele para sempre.
     `agora`: o que está a fazer, quando ficou. */
export const O_QUE_VEIO_TER = Object.freeze({
  agora: "ficou com {H} desde que lhe veio falar",
});

/* QUEM OS PASSOS PROCURAM, esteja o herói onde estiver: o nome e o onde do
   `falar_com` de agora de cada missão ativa, e dos que se lhe seguem por
   cima de caminho só (a mesma régua de aPessoaDoPasso). É por aqui que a
   ficha sabe que quem chega com um pedido é a pessoa de um passo — e que,
   na estrada, ela não chega (O_QUE_VEIO_TER).
     → [{ nome, onde, missao, etapa }] */
export function osDoPasso(estado) {
  const e = ehObj(estado) ? estado : {};
  let ms = [];
  try { ms = garantirMissoes(e.missoes).filter((m) => ehObj(m) && m.status === "ativa"); } catch { ms = []; }
  ms = [...ms, ...asMissoesDasQuests(e)];
  const out = [];
  for (const m of ms) {
    const et0 = etapaAtual(m);
    if (!et0) continue;
    const i0 = m.etapas.indexOf(et0);
    for (let k = i0; k < m.etapas.length; k++) {
      if (k > i0 && !ETAPAS_DE_CAMINHO.includes(m.etapas[k - 1].tipo)) break;
      const et = m.etapas[k];
      if (ehObj(et) && !et.feito && et.tipo === "falar_com" && limpo(et.alvo) && !out.some((x) => mesmo(x.nome, et.alvo))) out.push({ nome: limpo(et.alvo), onde: limpo(et.onde), missao: m.id, etapa: k });
    }
  }
  return out;
}

/* AS PESSOAS DOS PASSOS DAS QUESTS (a 20.ª, ver o cabeçalho): cada pessoa
   que o passo ativo de uma quest pede vira o `falar_com` de uma missão com
   o id da projeção (MISSAO_DA_QUEST.prefixo), para correr pela mesma régua.
   O `onde`, pela ordem: o LUGAR do próprio passo («Esperar os da cara
   tapada em {estrada}» + conheceu(rapaz): o rapaz aparece na estrada, não
   em casa — o desenho da quest manda); a casa do papel com a cidade dele;
   sem nenhum, vazio (a régua procura-a no registo e na base desta cidade) —
   mas só com o herói na cidade do papel: a Brigid de Monte do Martelo não
   mora noutra terra. */
function asMissoesDasQuests(e) {
  let passos = [];
  try {
    const W = oMundo(e);
    passos = osPassosDasQuests(e, { mundo: { semente: W.semente, mapa: e.mapa, genero: W.genero, molde: W.molde, lex: W.lex, base: e.baseMundo } });
  } catch { passos = []; }
  const out = [];
  for (const p of arr(passos)) {
    if (!ehObj(p)) continue;
    const etapas = [];
    const l0 = arr(p.lugares).find((l) => ehObj(l) && limpo(l.nome));
    for (const c of arr(ehObj(p.candidatos) ? p.candidatos.pessoa : [])) {
      const nome = ehObj(c) ? limpo(c.nome) : "";
      if (!nome || etapas.some((x) => mesmo(x.alvo, nome))) continue;
      if (c.predicado && !A_PESSOA_DO_PASSO.daQuest.includes(c.predicado)) continue;
      const [casa, cid] = l0 ? [limpo(l0.nome), limpo(l0.cidade)] : [limpo(c.onde), limpo(c.cidade)];
      if (!casa && cid && limpo(e.cidadeAtual) && sem(cid) !== sem(e.cidadeAtual)) continue;
      etapas.push({ tipo: "falar_com", alvo: nome, onde: casa ? (cid ? `${casa}, em ${cid}` : casa) : "", feito: false,
        rotulo: limpo(c.rotulo), depois: limpo(p.depois) });
    }
    /* uma missão por pessoa: a régua anda pela etapa de agora de cada uma */
    for (const et of etapas) out.push({ id: `${MISSAO_DA_QUEST.prefixo}${limpo(p.quest)}`, titulo: limpo(p.texto), tipo: MISSAO_DA_QUEST.tipo[1], status: "ativa", dador: "", etapas: [et] });
  }
  return out;
}

export function aPessoaDoPasso(estado) {
  const e = ehObj(estado) ? estado : {};
  /* sem sítio, só a rua da cidade (a chegada, defeito 4 da 17.ª): lá só
     está quem veio ter com o herói. Na estrada e na masmorra, ninguém */
  const semLugar = !ehObj(e.lugar) || !limpo(e.lugar.nome);
  if (semLugar && !ondeOHeroiEsta(e)) return [];
  const aquiAgora = ondeOHeroiEsta(e);
  let ms = [];
  try { ms = garantirMissoes(e.missoes).filter((m) => ehObj(m) && m.status === "ativa"); } catch { ms = []; }
  /* a 20.ª: e as pessoas dos passos das quests */
  ms = [...ms, ...asMissoesDasQuests(e)];
  if (!ms.length) return [];
  const a = garantirAbertura(e.abertura);
  const npcs = ehObj(e.npcs) ? e.npcs : {};
  const pers = ehObj(e.personagem) ? e.personagem : ehObj(e.render) && ehObj(e.render.personagem) ? e.render.personagem : {};
  const H = limpo(pers.nome) || "o herói";
  const grupo = arr(pers.grupo).filter((g) => ehObj(g) && g.nome);
  const W = oMundo(e);
  /* a gente da base desta cidade, só se for preciso (é a conta mais cara) */
  let base = null, locais = [];
  const aBase = () => {
    if (base === null) {
      base = [];
      try { const q = oQueExisteAqui(W.semente, e.mapa, str(e.cidadeAtual), e.baseMundo, W.genero, W.molde, W.lex); base = arr(q && q.gente); locais = arr(q && q.locais).filter((l) => ehObj(l) && limpo(l.nome)); } catch { base = []; locais = []; }
    }
    return base;
  };
  /* o sítio desta cidade aonde a rotina manda quem está fora do posto
     (O_FORA_COM_SITIO): o primeiro da base com o tipo, que não é o posto */
  const oSitioDoFora = (fora, posto) => {
    const tipos = O_FORA_COM_SITIO.tipos[str(fora)];
    if (!tipos) return null;
    aBase();
    const l = locais.find((x) => tipos.includes(str(x.tipo)) && semArtigo(x.nome) !== semArtigo(moradaDe(posto).lugar));
    return l ? { nome: limpo(l.nome) } : { nome: "" };
  };
  const daBase = (nome) => aBase().find((p) => ehObj(p) && mesmo(p.nome, nome)) || null;
  /* quem guarda o sítio: o que a cena da batida diz, senão o primeiro da
     gente da casa (o mesmo que batidas.js põe «à guarda») — a casa só com o
     herói nela: a gente da base é a DESTA cidade */
  const oGuarda = (alvo, naCasa) => oGuardaDaCena(oMarcoDoSitio(e, alvo)) || (!naCasa ? "" : limpo((aBase().find((p) => ehObj(p) && limpo(p.local) && semArtigo(p.local) === semArtigo(moradaDe(alvo).lugar || alvo)) || {}).nome));
  const out = [];
  for (const m of ms) {
    const et0 = etapaAtual(m);
    if (!et0) continue;
    const i0 = m.etapas.indexOf(et0);
    const daAbertura = !a.legado && m.id === a.principalId;
    /* as etapas que põem gente em cena: a de quem DEU o passo de agora (o
       `falar_com` cumprido logo antes — a 16.ª, defeito 1), a de agora, e
       as que se lhe seguem por cima de caminho só */
    const alvos = [];
    const antes = i0 > 0 ? m.etapas[i0 - 1] : null;
    if (ehObj(antes) && antes.feito && antes.tipo === "falar_com") alvos.push({ k: i0 - 1, dado: true });
    for (let k = i0; k < m.etapas.length; k++) {
      if (k > i0 && !ETAPAS_DE_CAMINHO.includes(m.etapas[k - 1].tipo)) break;
      alvos.push({ k, dado: false });
    }
    for (const { k, dado } of alvos) {
      const et = m.etapas[k];
      if (!ehObj(et) || (et.feito && !dado) || !limpo(et.alvo)) continue;
      /* o `revelar` põe em cena quem guarda o sítio, com o herói lá */
      const ehGuarda = et.tipo === "revelar" && !dado;
      if (et.tipo !== "falar_com" && !ehGuarda) continue;
      let nome = "", onde = "";
      if (ehGuarda) {
        onde = limpo(et.onde) || limpo(et.alvo);
        if (semLugar || !estaAqui(e, onde)) continue;
        nome = oGuarda(et.alvo, true);
        if (!nome) continue;
      } else nome = limpo(et.alvo);
      if (grupo.some((g) => mesmo(g.nome, nome)) || mesmo(nome, H) || out.some((x) => mesmo(x.nome, nome))) continue;
      const ehPista = !ehGuarda && daAbertura && mesmo(nome, a.pista.nome);
      const ehAlvo = !ehGuarda && !a.legado && mesmo(nome, a.alvo.quem);
      const ehDador = !ehGuarda && limpo(m.dador) && mesmo(nome, m.dador) && m.tipo !== "principal";
      const regK = Object.keys(npcs).find((x) => mesmo(x, nome));
      const reg = regK && ehObj(npcs[regK]) ? npcs[regK] : null;
      let pb = null, noPosto = ehGuarda, veio = false, ondeVe = onde;
      if (!ehGuarda) {
        onde = limpo(et.onde) || (ehPista ? a.pista.local : "") || (ehAlvo ? a.alvo.onde : "") || (reg ? oSitioDoRegisto(reg.local, e) : "");
        if (!onde) { pb = daBase(nome); onde = pb ? limpo(pb.local) : ""; }
        if (!onde) continue;
        /* O POSTO SEM CIDADE É NA CIDADE DA ABERTURA (04/11, os sítios como
           cartões). A pista mora «n'O Descanso do Carroceiro», sem cidade, e
           Vale Verde também tem um Descanso do Carroceiro: lido assim, o
           Godfrey estava atrás dos dois balcões. A pista é gente da cidade
           onde a abertura começa (PASSO_AQUI, abertura.js); a comparação
           leva-lhe a cidade, e o `onde` dito continua como veio. */
        if (ehPista && !moradaDe(onde).cidade && limpo(a.cidade)) ondeVe = `${limpo(moradaDe(onde).lugar)}, em ${limpo(a.cidade)}`;
        else ondeVe = onde;
        noPosto = !semLugar && estaAqui(e, ondeVe);
        /* quem veio ter com o herói e ficou (O_QUE_VEIO_TER): o registo
           guarda-o onde o herói o viu, e o herói ainda lá está */
        veio = !noPosto && !!reg && !!limpo(reg.local) && mesmoSitio(oSitioDoRegisto(reg.local, e), aquiAgora)
          && (!semLugar || Number(reg.conhecidoEm) === Number(e.dia));
        /* na rua só está quem veio ter com o herói */
        if (semLugar && !veio) continue;
      }
      if (!pb) pb = daBase(nome);
      const papel = (ehPista && limpo(a.pista.papel)) || (reg && limpo(reg.papel)) || (pb && limpo(oficioNoGenero(pb.papel, pb.genero_pessoa))) || "";
      /* a rotina: a hora dela, pela semente (gente-por-dentro.js) */
      let rot = null, familia = "";
      try {
        const fp = fichaDaPessoa(W.semente, { nome, papel, local: moradaDe(onde).lugar, modo: pb ? pb.modo : "", genero_pessoa: pb ? pb.genero_pessoa : "" },
          { mapa: e.mapa, genero: W.genero, lex: W.lex, molde: W.molde, base: e.baseMundo, npcs, grupo, dia: e.dia, minuto: e.minuto, cidade: str(e.cidadeAtual) });
        rot = fp.rotina; familia = fp.familia;
      } catch { rot = null; }
      const daQuest = str(m.id).startsWith(MISSAO_DA_QUEST.prefixo);
      const de = ehGuarda ? "guarda" : ehPista ? "pista" : ehAlvo ? "alvo" : ehDador ? "dador" : daQuest ? "quest" : "etapa";
      const sabeAHora = !!(rot && rot.agora && rot.agora !== "morreu") && A_PESSOA_DO_PASSO.aHoraConta.includes(de);
      /* fora do posto, o sítio aonde a rotina a manda (O_FORA_COM_SITIO) —
         só para quem trabalha numa casa DESTA cidade: a gente de outra terra
         não folga no templo daqui */
      const foraAgora = sabeAHora && !rot.noTurno && !!str(rot.fora) && str(rot.agora).endsWith(str(rot.fora));
      const posteDaqui = foraAgora && (aBase(), locais.some((l) => semArtigo(l.nome) === semArtigo(moradaDe(onde).lugar)))
        && (!moradaDe(ondeVe).cidade || semArtigo(moradaDe(ondeVe).cidade) === semArtigo(e.cidadeAtual));
      const sf = posteDaqui ? oSitioDoFora(rot.fora, onde) : null;
      const ondeAnda = sf ? `${str(rot.agora).slice(0, -str(rot.fora).length)}${sf.nome ? comEm(sf.nome) : O_FORA_COM_SITIO.semSitio}` : rot ? str(rot.agora) : "";
      const laFora = !!(sf && sf.nome) && !semLugar && estaAqui(e, sf.nome);
      if (!noPosto && !veio && !laFora) continue;
      const aqui = veio || laFora || !sabeAHora || !!rot.noTurno;
      /* o que sabe: o passo que vem depois do dela — com o onde, o quem e o
         quê (a 16.ª, defeito 2). A frase da pista («mais do que ninguém…
         sobre…») só fica quando não há passo a dizer: vaga, ela não é pista */
      const sabe = [];
      const prox = ehGuarda ? null : m.etapas[k + 1];
      const jaLa = ehObj(prox) && prox.tipo === "revelar" && estaAqui(e, limpo(prox.onde) || limpo(prox.alvo));
      const guardaDoProx = ehObj(prox) && prox.tipo === "revelar" ? oGuarda(prox.alvo, jaLa) : "";
      const seguinte = oQueSabeDe(prox, H, guardaDoProx, e.cidadeAtual, jaLa);
      if (seguinte) sabe.push(seguinte);
      else if (ehPista && limpo(a.alvo.objeto)) sabe.push(tpl(A_PESSOA_DO_PASSO.sabeDaPista, { O: a.alvo.objeto }));
      else if (daQuest && limpo(et.depois)) sabe.push(tpl(A_PESSOA_DO_PASSO.oQueHa, { A: minuscula(et.depois) }));
      const vontade = pb ? limpo(pb.vontade) : "";
      const quer = ehDador ? tpl(A_PESSOA_DO_PASSO.querDoDador, { H, T: limpo(m.titulo) }) : /^quer /u.test(vontade) ? vontade.replace(/^quer /u, "") : "";
      /* o posto, quando o ofício o diz («atrás do balcão»); o genérico («no
         que faz», A_PESSOA_DO_PASSO.semPosto) não diz nada a quem o vê. O
         nome dito só a quem ainda não o conhece (o registo: a 16.ª, defeito
         10 — repetia-se a cada ficha) */
      const posto = veio ? tpl(O_QUE_VEIO_TER.agora, { H })
        : laFora ? O_FORA_COM_SITIO.agoraAqui[rot.deFolga ? "folga" : "fora"]
          : rot && rot.noTurno && rot.turno && !A_PESSOA_DO_PASSO.semPosto.includes(familia) ? rot.turno : "";
      const agora = [ehGuarda ? tpl(A_PESSOA_DO_PASSO.agoraDoGuarda, { L: limpo(moradaDe(onde).lugar) }) : posto, ehPista && !reg ? tpl(A_PESSOA_DO_PASSO.oNome, { H }) : ""].filter(Boolean);
      const ausente = aqui ? "" : tpl(A_PESSOA_DO_PASSO.ausente, {
        N: nome, P: papel ? `, ${papel},` : "", G: ondeAnda,
        R: rot.turno, I: `${A_PESSOA_DO_PASSO.horas.de} ${aHoraDita(rot.de)}`, F: `${A_PESSOA_DO_PASSO.horas.ate} ${aHoraDita(rot.ate)}`,
      });
      out.push({
        nome, papel, onde: veio ? aquiAgora : onde, de,
        aqui, agora, ausente, voz: pb ? limpo(pb.modo) : "", quer, sabe,
        genero: pb ? sem(pb.genero_pessoa) : reg ? sem(reg.genero) : "",
        /* de que missão, e o índice do passo que ela sabe (a pista como
           cartão, a-pista-como-cartao.js); -1 quando não há passo a seguir */
        missao: m.id, seguinte: ehObj(prox) ? k + 1 : -1,
        rotulo: daQuest ? limpo(et.rotulo) : "",
      });
    }
  }
  return out;
}

/* O QUE O SÍTIO ESCONDE (a 16.ª, defeito 3). O herói chegou ao Largo do
   Cardo, examinou-o porta a porta, e nada: no modo `mestre` era a prosa que
   revelava e o Cronista que lia; no `ator` a porta da prosa está fechada, e
   só o teste que passou ali revela (saga.js, segredosReveladosNoTurno — a
   mesma régua que o Cronista usa para fechar o marco). Com o herói no sítio
   de um «descobrir» de pé:
     cena:  o sítio esconde alguma coisa, e como se acha (ACHA_DITO);
     achou: com o teste do turno a passar ali, o que se achou (a coisa do
            segredo) — o que ela prova vem no turno seguinte, pelo JÁ SE SABE.
   `teste`: { pericia, sucesso } do turno, ou nada.
     → { lugar, cena, achou } | null */
export function oQueOSitioEsconde(estado, teste) {
  const e = ehObj(estado) ? estado : {};
  if (!ehObj(e.lugar) || !limpo(e.lugar.nome)) return null;
  const m = oMarcoDoSitio(e, e.lugar.nome);
  if (!m || !ehObj(m.segredo)) return null;
  const cid = limpo(m.cidade);
  if (cid && limpo(e.cidadeAtual) && sem(cid) !== sem(e.cidadeAtual)) return null;
  const pers = ehObj(e.personagem) ? e.personagem : {};
  const H = limpo(pers.nome) || "o herói";
  const L = limpo(m.onde);
  const P = A_PESSOA_DO_PASSO;
  let achou = "";
  const t = ehObj(teste) ? { pericia: str(teste.pericia), sucesso: !!teste.sucesso } : null;
  if (t && t.sucesso) {
    let seg = [];
    try { seg = segredosReveladosNoTurno(e.espinha, { lugar: e.lugar.nome, teste: t, narrativa: "" }); } catch { seg = []; }
    if (seg.some((x) => semArtigo(x) === semArtigo(L)) && limpo(m.segredo.coisa)) achou = tpl(P.sitioAchou, { H, L, O: minuscula(m.segredo.coisa) });
  }
  const A = ACHA_DITO[sem(m.segredo.acha)] || ACHA_DITO.outro;
  return { lugar: L, cena: achou ? "" : tpl(P.sitioEsconde, { L, A }), achou };
}
