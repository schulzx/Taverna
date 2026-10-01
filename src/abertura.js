/* ============================================================
   A ABERTURA (Fase MM, etapa MM13) — o mundo puxa o herói

   A pessoa, em 29/09: "quando o jogo inicia o mestre já joga uma quest
   logo de cara… nos RPGs do Matt, o player é induzido à quest da
   história principal… o mundo joga ele na quest… como um sandbox sem
   tutorial." E depois: "ele diz o mundo, onde o personagem está, e uma
   pequena história do local… conforme o mestre trabalha o mundo, vai
   induzindo o player para a quest."

   A casa já forçava a história: a abertura sorteava uma trama e pedia um
   "primeiro fio". Mas o sorteio não lia a espinha nem o passado do herói,
   e na tela o primeiro turno mostrava um cartaz com Aceitar — o cardápio
   chegava antes do mundo, e a história não se via.

   ---------------- OS TRÊS MOVIMENTOS DO MATT (C1E1) ----------------

   1) O PROPÓSITO ANTES DA CENA, COMO MEMÓRIA. Os heróis chegam a
      Kraghammer já sabendo porque vieram (uma amiga sumida, um pedido de
      quem lhes arranjou os papéis) e com UM nome: o dono da mina, e onde
      achá-lo. Não é oferta, é o que eles trazem na cabeça. Aqui a razão
      sai da ESPINHA (a estrutura escolhida e o primeiro marco do primeiro
      ato, que já estão decididos desde a criação do mundo) e do
      ANTECEDENTE do herói, por tabela e semente. A pista é uma pessoa com
      nome e um lugar DESTA cidade, tirados da base do mundo — nada de gente
      inventada ao lado da que o mundo já tem. A principal nasce ACEITA, e o
      primeiro passo é encontrar a pista, no lugar dela.

   2) A ORDEM DA NARRAÇÃO: o mundo → onde estou (a chegada) → a pequena
      história do lugar → porque estou aqui e o que sei. O próximo passo
      sai do que se sabe, e é o jogador que o diz.

   3) O SINO. No meio da conversa com o dono da mina, um sino toca ao
      longe; depois um segundo e um terceiro; "alguma coisa está a sair da
      pedreira". A história foi até eles. Aqui o sino é uma pressão que
      enche quando o jogador já conheceu o lugar OU quando se afasta da
      história, e que ao encher faz a história vir — nunca no primeiro
      minuto (há um piso) e nunca como bloqueio: é um acontecimento, e o
      que ele faz com ele é dele.

   ---------------- O QUE ESTE MÓDULO NÃO É ----------------

   Não é o sistema inteiro de pistas: `fioParaAPrincipal` é só o gancho —
   diz se ESTA pessoa ou ESTE lugar tem um fio para a principal. Não é
   bloco fixo de prompt: tudo o que vai ao Narrador vai pela abertura (uma
   vez por campanha) ou pela pauta do turno. E não guarda nada que a
   semente refaça — só o que ACONTECEU (quantos turnos, onde já esteve, se
   o sino tocou) vai para o save, num campo novo que a versão antiga
   ignora.

   ---------------- A PISTA TEM MORADA (MM13b, 30/09) ----------------

   A prova jogada de MM13 achou a pista e o sino a apontar para lugares
   que a planta da cidade não mostrava. Eram três defeitos com a mesma
   cara: o lugar do segundo passo era de OUTRA cidade e a linha não o
   dizia (`cidadeDoMarco`, `ondeComMorada`); a pista tinha o nome de outro
   marco da espinha, e conhecê-la fechava esse marco (o filtro de
   homónimos); e o léxico que chega depois de o mundo nascer renomeava a
   planta e não o que já estava gravado (`soOVocabulario`, em lexico.js,
   que o App aplica nesse caso). O primeiro passo passou de chegar a
   encontrar.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { marcoAtual } from "./saga.js";
import { estruturaPorId } from "./historia.js";
import { oQueExisteAqui, masmorrasDoMundo, chefesDoMundo, chaveDoLugar, locaisDaCidade, genteDoLocal } from "./mundo-base.js";
import { criarMissao, etapaAtual, garantirMissoes, mesmaPessoa, rumoDaEtapa } from "./missoes.js";
import { criarRelogio, envelopeCheio, TAMANHOS } from "./relogios.js";
import { vocacaoDe } from "./comercio.js";
import { fichaDaCidade } from "./cidade-por-dentro.js";
import { comEm, contrair } from "./lugar.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const txt = (x, n = 120) => (typeof x === "string" ? x.trim().slice(0, n) : "");
const inteiro = (x) => Math.max(0, Math.floor(Number(x) || 0));

/* ============================================================
   AS TABELAS
   ============================================================ */

/* A RAZÃO, pela estrutura que a pessoa escolheu. Cada linha é o motivo que
   o herói TRAZ — a memória de antes da primeira cena —, e aponta para o
   {objeto}: o primeiro marco da espinha, dito em voz de mundo. Uma
   estrutura nova sem linha aqui cai na `jornada` (a suíte confere que as
   de `historia.js` estão todas). */
export const RAZOES_DA_ESTRUTURA = {
  jornada: [
    "uma carta sem assinatura chamou-o a {cidade}, e a única coisa que dizia com clareza era {objeto}",
    "alguém a quem devia a vida pediu-lhe, antes de morrer, que fosse a {cidade} atrás de {objeto}",
  ],
  arquipelago: [
    "ouviu o mesmo nome em três portos antes de chegar a {cidade}: {objeto}",
    "tem contas a acertar em mais de um lugar, e a primeira passa por {cidade} e por {objeto}",
  ],
  reinado: [
    "quer um lugar seu nesta terra, e em {cidade} dizem que quem o quer tem de passar por {objeto}",
    "veio a {cidade} com um título que ninguém reconhece ainda, e o primeiro apoio passa por {objeto}",
  ],
  misterio: [
    "aconteceu uma coisa que não se explica, e o único fio solto que leva a algum lado é {objeto}, em {cidade}",
    "recebeu um recado que não fecha — e o que não fecha aponta para {objeto}, em {cidade}",
  ],
  escalada: [
    "quer subir, e em {cidade} o primeiro degrau tem nome: {objeto}",
    "veio a {cidade} medir-se, e quem mede os que chegam é {objeto}",
  ],
  divida: [
    "quem lhe tirou o que não volta deixou rasto, e o rasto chega a {cidade} por {objeto}",
    "anda a cobrar uma dívida de sangue, e em {cidade} o nome seguinte é {objeto}",
  ],
  cerco: [
    "os primeiros sinais do que avança sobre esta terra chegaram a {cidade}, e apontam para {objeto}",
    "veio a {cidade} porque alguém tem de segurar a linha, e o que se sabe começa em {objeto}",
  ],
  heranca: [
    "herdou de um morto mais do que queria, e à margem do que herdou está escrito {objeto}, em {cidade}",
    "o espólio que lhe coube tem uma conta por fechar em {cidade}, e a conta tem nome: {objeto}",
  ],
};

/* O LAÇO DO ANTECEDENTE: o que o passado do herói tem a ver com isto. É a
   segunda metade da razão, a que torna a história DELE e não de qualquer
   um. Chave pelo id de `antecedentes.js`; a ficha guarda o NOME, por isso
   `lacoDoAntecedente` aceita os dois (a mesma porta dupla de
   `oficioDoAntecedente`). Sem antecedente, sem laço — e a razão continua
   inteira. */
export const LACOS_DO_ANTECEDENTE = {
  orfao: { nome: "Órfão da Estrada", o: "e um nome parecido com o da família que perdeu anda ligado a isto" },
  soldado: { nome: "Soldado Reformado", o: "e quem mandou o recado foi um antigo companheiro de armas" },
  nobre_caido: { nome: "Sangue Nobre Caído", o: "e o nome da família ainda abre esta porta — e ainda deve alguma coisa a ela" },
  erudito: { nome: "Erudito de Arquivo", o: "e o texto proibido que leu falava deste lugar" },
  ladrao: { nome: "Filho da Guilda dos Dedos", o: "e a guilda dos dedos quer saber o que ele descobrir: é a dívida que ela cobra" },
  acolito: { nome: "Acólito Fugitivo", o: "e a ordem de que fugiu procura a mesma coisa" },
  pragado: { nome: "Sobrevivente da Praga", o: "e há quem diga que isto tem a ver com a febre que o poupou" },
  artista: { nome: "Artista Itinerante", o: "e uma das suas canções fala disto sem dizer o nome" },
  cacador: { nome: "Caçador de Recompensas", o: "e há recompensa, e um alvo antigo talvez ande pelo mesmo caminho" },
  ferreiro: { nome: "Herdeiro da Forja", o: "e quem tomou a forja da família passou por aqui" },
  ex_cultista: { nome: "Ex-Cultista Arrependido", o: "e reconhece nisto a mão dos antigos irmãos" },
  naufrago: { nome: "Náufrago", o: "e a bússola empenada aponta para cá desde o naufrágio" },
};

/* O OBJETO: como o primeiro marco se diz em voz de mundo. */
export const OBJETO_DO_FEITIO = {
  procurar: "{quem}",
  descobrir: "o que {onde} guarda",
  enfrentar: "{alvo}",
};

/* O TÍTULO da principal — o que o diário mostra. Sem "missão", sem
   "principal": o nome de uma história, não de um mecanismo. */
export const TITULO_DO_FEITIO = {
  procurar: "O rasto de {quem}",
  descobrir: "O que {onde} guarda",
  enfrentar: "A sombra de {alvo}",
};

/* O QUE SE SABE: a pista é o marco em pessoa (o Nostoc do Matt, o único
   nome que se tinha) ou é quem, nesta cidade, sabe mais do marco. */
export const O_QUE_SE_SABE = {
  propria: "é o único nome que traz, e trabalha {local}",
  informante: "é quem, nesta cidade, sabe mais de {objeto}; encontra-se {local}",
};

/* ONDE SE PROCURA UM INFORMANTE: os lugares de conversa, pelo tipo do
   local de cada molde. Casa por pedaço do tipo, em ordem de preferência;
   um mundo sem nenhum deles usa qualquer local da cidade. */
export const LUGARES_DE_CONVERSA = ["taverna", "descanso", "mercado", "feira", "cais", "concourse", "doca", "guilda", "templo", "capela"];

/* A CHEGADA, pelo molde: onde o herói está quando a narração começa. Não
   é um local da base de propósito — é a entrada, e é por ser a entrada que
   a pista fica a um passo de distância e não debaixo do nariz. */
export const CHEGADAS = {
  sobremundo: "à porta de {cidade}, com a poeira da estrada ainda na roupa",
  torre: "ao patamar de {cidade}, acabado de subir a escada",
  arquipelago: "ao cais de {cidade}, acabado de desembarcar",
  estelar: "à comporta de {cidade}, acabada de pressurizar",
};

/* A PEQUENA HISTÓRIA DO LUGAR: do que a cidade vive e o que o povo conta
   do que fica perto — o Matt disse o que era Kraghammer e a mina que a
   sustenta. Sai da vocação (`comercio.js`) e do rumor da masmorra mais
   próxima, ou do chefe que tem covil aqui; sem nenhum dos dois, só a
   vocação. */
export const HISTORIA_DO_LUGAR = {
  comMasmorra: "{cidade} {vive}; perto dela fica {masmorra}, e {rumor}",
  comChefe: "{cidade} {vive}; e fala-se baixo de {chefe}, que tem covil nestas bandas",
  soVocacao: "{cidade} {vive}, e toda a gente daqui sabe disso",
  semVocacao: "{cidade} é pequena e desconfiada, e conhece-se de cara quem vem de fora",
};

/* O SINO — a escalada. Tudo em turnos de jogo:
   · `segmentos` — o tamanho da pressão (um dos TAMANHOS de `relogios.js`,
     porque é um relógio que se entrega ao encher);
   · `piso` — antes disto o sino nunca toca, encha o que encher;
   · `turnosPorSegmento` — o tempo passado na cidade enche, devagar;
   · `porVisita` — cada lugar novo e cada pessoa nova no registo enche um;
   · `tolerancia` — turnos sem avançar a história antes de o afastamento
     começar a pesar; depois disso, `porTurnoAfastado` por turno;
   · `tetoVisitados` — quantos lugares o save guarda para não contar duas
     vezes a mesma visita.
   Medido na suíte: quem explora (um sítio novo a cada dois turnos) ouve o
   sino no piso; quem fica parado ouve-o por afastamento; ninguém o ouve
   antes do piso. */
export const SINO = {
  segmentos: 8,
  piso: 12,
  turnosPorSegmento: 4,
  porVisita: 1,
  tolerancia: 8,
  porTurnoAfastado: 1,
  tetoVisitados: 24,
};

/* O PRENÚNCIO — o primeiro sino, ao longe, um segmento antes de encher.
   `{sinal}` é o da cidade (`cidade-por-dentro.js`: o sino, a corneta, a
   sirene); a aldeia sem sinal tem gente a correr. */
/* MM14: O SINO FORA DE HORA, PERGUNTADO DEPOIS. "Para que toca o sino
   assim?" (T43 da sessão de prova): o rebate tocou às 10:49 e a taverneira
   respondeu às 13:30 que "não toca fora de hora há anos" — a ficha da
   cidade só sabia o sino das HORAS. A abertura passa a guardar QUANDO o
   sino tocou (dois campos novos no save, ignorados pela versão antiga), e
   `sinosForaDeHora` devolve os de hoje à ficha. `o` é a resposta inteira;
   `curto`, a que cabe no ambiente de todo turno. */
export const SINOS_FORA_DE_HORA = {
  prenuncio: { o: "{sinal} tocou uma vez fora de hora e calou; ninguém disse porquê", curto: "{sinal} tocou fora de hora e calou" },
  rebate: { o: "{sinal} tocou a rebate: {o}", curto: "{sinal} tocou a rebate" },
  /* a aldeia sem sino dá o alarme de outro jeito */
  semSinal: "a gente",
};

export const PRENUNCIOS = {
  comSinal: "ao longe, {sinal} toca fora de hora e cala; ninguém diz porquê",
  semSinal: "gente passa a correr para os lados de {origem}, sem dizer porquê",
};

/* O ACONTECIMENTO — o que o sino traz, pelo feitio do que a história pede
   agora. {origem} é a masmorra perto da cidade, ou o lugar do marco. */
export const ACONTECIMENTOS_DO_SINO = {
  procurar: [
    "{quem} chega a {cidade} às pressas, ferido(a), com gente atrás — e pergunta por quem anda a perguntar por si",
    "gente armada entra em {cidade} a perguntar por {quem}, e já sabe que o herói também pergunta",
  ],
  descobrir: [
    "o que {onde} guardava começa a sair, e a cidade toca a rebate",
    "alguma coisa sai de {origem} e chega às portas de {cidade}; há feridos a correr pela rua",
  ],
  enfrentar: [
    "{alvo} sai de {origem} e chega às portas de {cidade}; há feridos a correr pela rua",
    "{alvo} ataca quem vem de {origem}, e os sobreviventes chegam a {cidade} a pedir ajuda",
  ],
};

/* O SINO DE LONGE: o herói já saiu da cidade quando o sino toca. A
   história vai atrás dele — pela boca de quem fugiu, e não pela porta. */
export const SINO_DE_LONGE = "chega a notícia de {cidade}, trazida por quem fugiu: {o}";

/* O MURAL ESPERA. As ofertas avulsas (os cartazes com Aceitar) só chegam
   depois de o herói dar o primeiro passo da principal, ou deste número de
   turnos — o que vier primeiro. Antes disso, ninguém oferece trabalho, e o
   veto vai à pauta do turno (secção NÃO PODE) com esta frase. */
export const MURAL = {
  turnos: 6,
  veto: "ninguém oferece trabalho avulso ao herói nesta cena",
};

/* O FIO QUE O MUNDO PINGA — só o gancho mínimo. `chance`: a fração da gente
   da cidade de partida que ouviu falar do objeto (pela semente e pelo
   nome, sempre a mesma pessoa). `como`: o que essa pessoa sabe. */
export const FIOS = {
  chance: 0.25,
  como: [
    "ouviu o nome numa conversa que não era para ouvir",
    "viu alguém perguntar pelo mesmo, há poucos dias",
    "sabe quem mais anda atrás disso, e não gosta dessa gente",
    "tem um palpite, e cobra por ele",
  ],
};

/* AS PALAVRAS DE BASTIDOR: nenhuma entra na linha do próximo passo. É a
   lei "o sistema não fala de si": o jogador sente o rumo, nunca lê o nome
   do mecanismo. A suíte varre a saída com esta lista. */
export const PALAVRAS_DE_BASTIDOR = ["missao", "missão", "etapa", "principal", "sistema", "espinha", "marco", "relogio", "relógio", "trama", "pista", "quest", "mural", "abertura"];

/* ============================================================
   A CATRACA DO SAVE
   ============================================================ */

/* O campo novo `abertura` do save. Save antigo não o tem, e aí a campanha
   é LEGADO: já está orientada (o mural não se fecha para quem joga há
   semanas) e o sino não existe. */
export function garantirAbertura(a) {
  if (!a || typeof a !== "object" || Array.isArray(a)) return { legado: true };
  if (a.legado) return { legado: true };
  const p = obj(a.pista), al = obj(a.alvo);
  return {
    v: 1,
    principalId: txt(a.principalId, 40),
    cidade: txt(a.cidade, 60),
    chegada: txt(a.chegada, 120),
    razao: txt(a.razao, 300),
    sabe: txt(a.sabe, 200),
    historia: txt(a.historia, 240),
    titulo: txt(a.titulo, 70),
    pista: { nome: txt(p.nome, 60), papel: txt(p.papel, 60), local: txt(p.local, 60) },
    alvo: {
      feitio: OBJETO_DO_FEITIO[al.feitio] ? al.feitio : "procurar",
      quem: txt(al.quem, 60), onde: txt(al.onde, 60), alvo: txt(al.alvo, 60),
      objeto: txt(al.objeto, 90), origem: txt(al.origem, 60),
    },
    sinal: txt(a.sinal, 30),
    turnos: inteiro(a.turnos),
    semAvanco: inteiro(a.semAvanco),
    feitas: inteiro(a.feitas),
    conhecidos: inteiro(a.conhecidos),
    visitados: (Array.isArray(a.visitados) ? a.visitados : []).map((x) => txt(String(x == null ? "" : x), 60)).filter(Boolean).slice(-SINO.tetoVisitados),
    cheios: Math.min(SINO.segmentos, inteiro(a.cheios)),
    prenunciado: !!a.prenunciado,
    tocou: !!a.tocou,
    /* MM14: quando (dia e minuto do mundo) e, no rebate, o que trouxe */
    prenunciadoEm: quandoFoi(a.prenunciadoEm),
    tocouEm: quandoFoi(a.tocouEm),
    oQueTocou: txt(a.oQueTocou, 200),
  };
}

function quandoFoi(q) {
  if (!q || typeof q !== "object") return null;
  const dia = Number(q.dia), minuto = Number(q.minuto);
  if (!Number.isFinite(dia) || dia < 1 || !Number.isFinite(minuto) || minuto < 0) return null;
  return { dia: Math.floor(dia), minuto: Math.floor(minuto) % 1440 };
}

/* ============================================================
   A ABERTURA
   ============================================================ */

function lacoDoAntecedente(ref) {
  if (!ref) return "";
  const k = norm(ref);
  const achado = Object.entries(LACOS_DO_ANTECEDENTE).find(([id, l]) => norm(id) === k || norm(l.nome) === k);
  return achado ? achado[1].o : "";
}

const encher = (modelo, v) => String(modelo || "").replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? String(v[k]) : ""));

/* O PORTUGUÊS DA MESA: os nomes da base nascem com artigo ("A Confraria do
   Juramento") e o objeto começa por "o que". Encaixados numa frase, "de o
   que" e "por A Confraria" denunciam a costura. `contrair` junta a
   preposição ao artigo (do, pelo, na); `meio` baixa o artigo que ficou a
   meio da frase. A mesma burrice deliberada de `comEm` (lugar.js).
   MM14 (30/09): a tabela CONTRACOES e `contrair` mudaram-se para
   `lugar.js` — as tramas e as etapas das missões precisavam da mesma
   regra, e a segunda cópia seria a segunda régua. */
const meio = (nome) => String(nome || "").replace(/^(O|A|Os|As) /, (m) => m.toLowerCase());

function objetoDe(alvo) {
  return encher(OBJETO_DO_FEITIO[alvo.feitio] || OBJETO_DO_FEITIO.procurar, { ...alvo, onde: meio(alvo.onde) });
}

function ehConversa(local) {
  const t = norm(local && local.tipo);
  const i = LUGARES_DE_CONVERSA.findIndex((x) => t.includes(x));
  return i < 0 ? LUGARES_DE_CONVERSA.length : i;
}

/* ---------------- A MORADA DO MARCO (30/09, MM13b) ----------------
   O primeiro marco da espinha é DESTA região, mas quase nunca desta
   cidade: a espinha sorteia o primeiro ato entre as cidades mais perto
   da partida (`saga.js`, "a espinha caminha para fora"). A marca guarda
   o lugar pelo NOME ("A Corda Velha") e esquece a cidade — e a linha do
   passo dizia "procurar Petra na Corda Velha" a quem estava noutra
   cidade, onde a planta não tem Corda Velha nenhuma. Medido na varredura
   de 576 aberturas: 57% dos segundos passos apontavam para um lugar de
   outra cidade sem o dizer.

   Achar a cidade é refazer a pergunta que a espinha fez, pela semente:
   o descobrir traz a chave (`Cidade|tipo`); o procurar é a cidade onde
   AQUELA pessoa trabalha NAQUELE lugar; o enfrentar aponta para um covil
   ou uma cidade do mapa, que já estão no mapa do mundo. A cidade de
   partida é perguntada primeiro. Nada disto se grava: é recalculado. */
function cidadeDoMarco(semente, mapa, marco, nomeCidade, genero, molde, lex) {
  const cs = ((mapa && mapa.cidades) || []).filter((c) => c && c.nome);
  const ordem = [...cs.filter((c) => c.nome === nomeCidade), ...cs.filter((c) => c.nome !== nomeCidade)];
  const chave = String((marco.condicao && marco.condicao.chave) || marco.chave || "");
  if (chave.includes("|")) {
    const c = chave.split("|")[0];
    if (cs.some((x) => x.nome === c)) return c;
  }
  if (!marco.onde) return "";
  if (cs.some((x) => norm(x.nome) === norm(marco.onde))) return "";
  for (const c of ordem) {
    let locais = [];
    try { locais = locaisDaCidade(semente, c, genero, molde, lex); } catch { locais = []; }
    const l = locais.find((x) => norm(x.nome) === norm(marco.onde));
    if (!l) continue;
    if (marco.feitio !== "procurar" || !marco.quem) return c.nome;
    let gente = [];
    try { gente = genteDoLocal(semente, l, genero, molde, lex); } catch { gente = []; }
    if (gente.some((p) => norm(p.nome) === norm(marco.quem))) return c.nome;
  }
  return "";
}

/* O onde de uma etapa que fica noutra cidade leva a cidade atrás — a
   mesma forma que o jogador lê no mapa ("A Corda Velha, em Vila Clara").
   Aqui, só o lugar: a planta desta cidade já o mostra. */
const ONDE_TETO = 60;
function ondeComMorada(local, cidade, aqui) {
  if (!local || !cidade || norm(cidade) === norm(aqui)) return local || "";
  const longo = `${local}, em ${cidade}`;
  return longo.length <= ONDE_TETO ? longo : local;
}

function historiaDoLugar(semente, mapa, cidade, genero, lex) {
  const voc = vocacaoDe(cidade);
  const vive = voc ? voc.o : "";
  let mm = [];
  try { mm = masmorrasDoMundo(semente, mapa).filter((m) => m.cidadeProxima === cidade.nome); } catch { mm = []; }
  if (vive && mm.length) {
    const m = mm[0];
    return { texto: encher(HISTORIA_DO_LUGAR.comMasmorra, { cidade: cidade.nome, vive, masmorra: m.nome, rumor: m.rumor }), origem: m.nome };
  }
  let ch = null;
  try { ch = chefesDoMundo(semente, mapa, genero, lex).find((c) => c.linha !== "principal" && c.covil === cidade.nome) || null; } catch { ch = null; }
  if (vive && ch) return { texto: encher(HISTORIA_DO_LUGAR.comChefe, { cidade: cidade.nome, vive, chefe: ch.nome }), origem: "" };
  if (vive) return { texto: encher(HISTORIA_DO_LUGAR.soVocacao, { cidade: cidade.nome, vive }), origem: "" };
  return { texto: encher(HISTORIA_DO_LUGAR.semVocacao, { cidade: cidade.nome }), origem: "" };
}

/* O herói chega. `ctx`:
     { semente, mapa, cidade (nome da cidade de partida), espinha,
       estrutura, antecedente (id ou nome), genero, molde, lex, base,
       nivel, dia }
   Devolve { abertura, missao } — a abertura para o save e a principal,
   já ATIVA, para o diário — ou `null` quando a cidade não tem gente com
   nome (aí quem chama segue como antes). Determinística pela semente. */
export function abrirAbertura(ctx) {
  const o = obj(ctx);
  const semente = String(o.semente == null ? "" : o.semente);
  const genero = txt(o.genero, 40) || "Fantasia medieval";
  const nomeCidade = txt(o.cidade, 60);
  if (!nomeCidade) return null;
  let q = null;
  try { q = oQueExisteAqui(semente, o.mapa, nomeCidade, o.base, genero, o.molde || null, o.lex || null); } catch { q = null; }
  if (!q || !q.cidade || !(q.gente || []).length) return null;
  const rnd = rngDe(`${semente}|abertura|${nomeCidade}`);
  const locais = q.locais || [];
  const gente = q.gente;
  const localPorNome = (n) => locais.find((l) => norm(l.nome) === norm(n)) || null;

  /* o primeiro marco do primeiro ato — decidido na criação do mundo */
  let marco = null;
  try { marco = marcoAtual(o.espinha, 0); } catch { marco = null; }

  let alvo, condicao, pista = null, propria = false, cidadeAlvo = "";
  /* MM13b: A PISTA NÃO TEM O NOME DE OUTRO MARCO. A etapa `falar_com` casa
     pelo primeiro nome (`mesmaPessoa`), e a espinha confere TODOS os
     marcos, de todos os atos, a cada turno: uma pista chamada Orin, numa
     espinha que tem "Encontrar Orin" três marcos adiante (outro Orin,
     noutro lugar), fechava esse marco no turno em que se conhecia a pista
     — "🔎 Encontrar Orin — O Armazém Velho" no turno 2, a contradizer a
     pista e o diário. Em 576 aberturas, 11% das pistas tinham um homónimo
     na espinha. Quem não tem homónimo é preferido; se ninguém serve, a
     regra cede (uma pista com homónimo é melhor que nenhuma). */
  const quens = ((obj(o.espinha).atos || []).flatMap((x) => (x && x.marcos) || []).map((m) => m && m.quem)).filter(Boolean);
  const semHomonimo = (x, alem = "") => ![alem, ...quens].filter(Boolean).some((k) => norm(k) === norm(x.nome) || mesmaPessoa(k, x.nome));
  const preferir = (lista, alem = "") => { const l = lista.filter((x) => semHomonimo(x, alem)); return l.length ? l : lista; };
  if (marco && OBJETO_DO_FEITIO[marco.feitio] && (marco.quem || marco.onde || marco.alvo)) {
    alvo = { feitio: marco.feitio, quem: marco.quem || "", onde: marco.onde || "", alvo: marco.alvo || "" };
    const c = obj(marco.condicao);
    try { cidadeAlvo = cidadeDoMarco(semente, o.mapa, marco, q.cidade.nome, genero, o.molde || null, o.lex || null); } catch { cidadeAlvo = ""; }
    /* MM13b: o onde do passo leva a cidade quando o lugar é de outra */
    const ondeDoPasso = c.tipo === "falar_com" || c.tipo === "revelar" ? ondeComMorada(marco.onde || "", cidadeAlvo, q.cidade.nome) : (marco.onde || "");
    condicao = c.tipo ? { tipo: c.tipo, alvo: c.alvo || "", quantos: c.quantos || 1, onde: ondeDoPasso } : null;
    /* descobrir cumpre-se pela CHAVE que a base grava (`Cidade|tipo`), não
       pelo nome: a espinha nova já a traz; a antiga, traduz-se aqui */
    if (condicao && condicao.tipo === "revelar") {
      let k = c.chave || "";
      if (!k) { try { k = chaveDoLugar(semente, o.mapa, condicao.alvo, { genero, molde: o.molde || null, lex: o.lex || null, cidade: cidadeAlvo || nomeCidade }); } catch { k = ""; } }
      if (k) condicao.chave = k;
    }
    /* "aqui" é a CIDADE do marco, e não um nome que casa: dois lugares de
       cidades diferentes podem chamar-se o mesmo */
    const aqui = !!localPorNome(marco.onde) && (!cidadeAlvo || norm(cidadeAlvo) === norm(q.cidade.nome));
    if (marco.feitio === "procurar" && aqui) {
      const p = gente.find((x) => norm(x.nome) === norm(marco.quem));
      if (p) { pista = p; propria = true; }
    } else if (marco.feitio === "descobrir" && aqui) {
      const daCasa = preferir(gente.filter((x) => norm(x.local) === norm(marco.onde)));
      if (daCasa.length) pista = pick(rnd, daCasa);
    }
  } else {
    /* espinha vazia (mundo sem mapa, save torto): a história começa por
       alguém desta cidade, e a pista é outra pessoa que a conhece */
    const p = pick(rnd, gente);
    alvo = { feitio: "procurar", quem: p.nome, onde: p.local || "", alvo: "" };
    condicao = { tipo: "falar_com", alvo: p.nome, quantos: 1, onde: p.local || "" };
  }
  if (!pista) {
    /* o informante: nem o alvo, nem homónimo de nenhum marco (acima) */
    const candidatos = preferir(gente.filter((x) => norm(x.nome) !== norm(alvo.quem) && x.local), alvo.quem);
    const pool = candidatos.length ? candidatos : gente.filter((x) => x.local);
    if (!pool.length) return null;
    const melhor = Math.min(...pool.map((x) => ehConversa(localPorNome(x.local))));
    const deConversa = pool.filter((x) => ehConversa(localPorNome(x.local)) === melhor);
    pista = pick(rnd, deConversa);
  }
  alvo.objeto = objetoDe(alvo);

  const est = estruturaPorId(o.estrutura);
  const razoes = RAZOES_DA_ESTRUTURA[est.id] || RAZOES_DA_ESTRUTURA.jornada;
  const laco = lacoDoAntecedente(o.antecedente);
  const razao = contrair(`${encher(pick(rnd, razoes), { cidade: q.cidade.nome, objeto: alvo.objeto })}${laco ? `, ${laco}` : ""}`);
  const sabe = contrair(`${pista.nome}, ${pista.papel}, ${encher(propria ? O_QUE_SE_SABE.propria : O_QUE_SE_SABE.informante, { local: comEm(pista.local), objeto: alvo.objeto })}`);
  const molde = o.molde && o.molde.id ? o.molde.id : (typeof o.molde === "string" ? o.molde : "sobremundo");
  const chegada = encher(CHEGADAS[molde] || CHEGADAS.sobremundo, { cidade: q.cidade.nome });
  const hl = historiaDoLugar(semente, o.mapa, q.cidade, genero, o.lex || null);
  /* MM13b: sem masmorra perto, o que o sino traz vem do lugar do marco —
     e, se ele é de outra cidade, da CIDADE, que está no mapa do mundo:
     "alguma coisa sai de A Corda Velha e chega às portas de Monte do
     Norte" apontava para uma taverna que a planta desta cidade não tem. */
  const fora = !!cidadeAlvo && norm(cidadeAlvo) !== norm(q.cidade.nome);
  alvo.origem = hl.origem || (fora && alvo.feitio !== "enfrentar" ? cidadeAlvo : alvo.onde) || "";
  let sinal = "";
  try { sinal = fichaDaCidade(q.cidade, { semente, mapa: o.mapa, genero, lex: o.lex || null, molde: o.molde || null }).hoje.sinal || ""; } catch { sinal = ""; }
  const titulo = encher(TITULO_DO_FEITIO[alvo.feitio] || TITULO_DO_FEITIO.procurar, alvo).slice(0, 70);

  /* A PRINCIPAL NASCE ACEITA. Primeiro passo: ENCONTRAR a pista, no lugar
     dela. Era "ir aonde a pista está" (`ir_a`), e na prova jogada de MM13
     (30/09) isso falhou duas vezes: o ✓ dizia "Chegar a…" a quem ia
     procurar alguém, e o passo contava ao chegar, não ao encontrar. O Matt
     não manda os heróis a Kraghammer, manda-os ao Nostoc.

     `falar_com` fecha quando a pessoa entra no registo — e ela só entra
     depois de o herói estar no lugar dela (`aindaSoUmNome`, a lei "menção
     não é presença"): fecha quando se está com ele, nem antes, nem num
     turno depois. Depois, o que o primeiro marco pede, na língua que
     `missoes.js` já confere — e se o marco é a própria pista, é um passo
     só. */
  const etapas = [{ tipo: "falar_com", alvo: pista.nome, onde: pista.local }];
  const repete = condicao && condicao.tipo === "falar_com" && norm(condicao.alvo) === norm(pista.nome);
  const soChegar = condicao && condicao.tipo === "ir_a" && norm(condicao.alvo) === norm(pista.local);
  if (condicao && !repete && !soChegar) etapas.push(condicao);
  const missao = criarMissao({
    id: "mis_principal", titulo, tipo: "principal", status: "ativa",
    descricao: razao.slice(0, 240), dador: "", etapas,
    nivel: Math.max(1, inteiro(o.nivel) || 1), dia: inteiro(o.dia),
  });
  if (!missao) return null;

  const abertura = garantirAbertura({
    principalId: missao.id, cidade: q.cidade.nome, chegada, razao, sabe, historia: hl.texto, titulo,
    pista: { nome: pista.nome, papel: pista.papel, local: pista.local },
    alvo, sinal, turnos: 0, semAvanco: 0, feitas: 0, visitados: [], cheios: 0,
  });
  return { abertura, missao };
}

/* ============================================================
   O QUE A ABERTURA PEDE AO NARRADOR — uma vez por campanha
   ============================================================ */

/* O pedido do primeiro turno. Substitui o texto de `abrirACampanha` e o
   envelope da trama sorteada que ia junto: é o MESMO canal (a mensagem da
   abertura, cobrada uma vez), nunca o prompt fixo. As quatro partes estão
   na ordem do Matt. `habilidades` é a lista de nomes que o sistema já deu. */
export function pedidoDaAbertura(abertura, { habilidades = [] } = {}) {
  const a = garantirAbertura(abertura);
  if (a.legado || !a.pista.nome) return "";
  const habs = (Array.isArray(habilidades) ? habilidades : []).filter(Boolean).join(", ") || "nenhuma";
  return `[ABERTURA DA CAMPANHA] Primeiro turno. Narre em QUATRO partes, nesta ordem, em prosa corrida e sem títulos, na 2ª pessoa — o herói é "você" ("você chegou", nunca "cheguei"):

1) O MUNDO. Que lugar é este, dito por dentro: o que o move, quem manda, do que se vive, e uma lei daqui que não valeria noutro lugar. Concreto: um cheiro, um som, um preço.
2) ONDE O HERÓI ESTÁ. Chegou agora ${a.chegada}. O que se vê e se ouve dali.
3) A PEQUENA HISTÓRIA DO LUGAR. ${a.historia}.
4) PORQUE ELE ESTÁ AQUI E O QUE SABE — como memória dele, não como pedido de ninguém: ${a.razao}. O que sabe: ${a.sabe}.

Isto já está decidido e não é oferta: ninguém lhe pede nada nesta cena, e ninguém oferece trabalho ao herói. Ele ainda NÃO está ${comEm(a.pista.local)} nem diante de ${a.pista.nome}. Termine com o próximo passo à vista pelo que ele sabe, sem o dizer por ele e sem perguntar "o que você faz?".
(As habilidades iniciais dele já foram concedidas: ${habs} — NÃO envie "adicionar_habilidades".)`;
}

/* ============================================================
   O MURAL ESPERA
   ============================================================ */

function principalDe(abertura, missoes) {
  const ms = garantirMissoes(missoes);
  const a = garantirAbertura(abertura);
  if (!a.legado && a.principalId) {
    const m = ms.find((x) => x.id === a.principalId);
    if (m) return m;
  }
  return ms.find((x) => x.status === "ativa" && x.tipo === "principal")
    || ms.find((x) => x.status === "ativa" && x.tipo === "trama")
    || null;
}

/* O mural (e toda oferta avulsa com Aceitar) só depois de o herói estar
   orientado: o primeiro passo da principal feito, ou `MURAL.turnos` turnos
   passados, ou a principal já fora de jogo. Save antigo: sempre liberado.
   `estado`: { abertura, missoes }. */
export function muralLiberado(estado) {
  const e = obj(estado);
  const a = garantirAbertura(e.abertura);
  if (a.turnos >= MURAL.turnos) return true;
  return deuOPrimeiroPasso(a, e.missoes);
}

/* O critério da MM13 sem o atalho do relógio: o primeiro passo da
   principal feito, ou a principal já fora de jogo. Save antigo: sim. */
function deuOPrimeiroPasso(a, missoes) {
  if (a.legado) return true;
  const m = principalDe(a, missoes);
  if (!m || m.id !== a.principalId || m.status !== "ativa") return true;
  return !!(m.etapas[0] && m.etapas[0].feito);
}

/* ============================================================
   A TRAMA ESPERA A SUA VEZ (MM14, 30/09)

   "Quatro missões do sistema em 43 respostas" (sessão de prova MM11), e
   na prova jogada de MM13 uma missão "do Mestre" no turno 8, antes de o
   herói dar o primeiro passo da principal. A trama forçada (`tramas.js`,
   que o App tenta dar a cada turno) só tinha três portas: nenhuma outra
   trama ativa, o mural liberado e o compasso fora do respiro. Por isso:

   · NASCIA ANTES DO PRIMEIRO PASSO — o mural liberta-se também por
     `MURAL.turnos` (6), e a trama usava a mesma porta. Para o mural é
     certo: o cartaz é opcional e espera o jogador. A trama não se recusa,
     e uma segunda história que se não recusa antes de a primeira andar é o
     cardápio outra vez.
   · NASCIA EM SÉRIE — "uma por vez" quer dizer que, no turno a seguir a
     uma fechar, nasce a próxima: "Tirar Branca de lá" fechou no turno 10 e
     "O lance" nasceu no 11; "O lance" fechou no 42 e "A noite em claro"
     nasceu no 43. Nada media o espaço entre elas.

   A regra de mesa: a principal é a história. Uma trama forçada só nasce
   quando a anterior fechou, a principal deixou espaço, e o herói está
   orientado pelo critério da MM13 (o primeiro passo feito — sem o atalho
   dos seis turnos). "Espaço" é medido com o que o save já tem, sem campo
   novo:
   · `dias` — dias de jogo desde que nasceu a última história que não se
     recusa (a principal da abertura ou uma trama: `criadaEm`). O relógio
     de turnos da abertura pára quando o sino toca, e o save antigo não o
     tem; o dia de jogo existe sempre e anda para todos.
   · `semAvanco` — turnos seguidos sem a principal andar (o contador do
     sino). Quem acabou de dar um passo na história está nela; interromper
     aí é roubar-lhe a cena. Depois de o sino tocar o contador congela, e
     esta porta deixa de ler.
   `forcar` (a abertura sem pista) não passa por aqui: é a única história.
   ============================================================ */
export const ESPACO_DA_TRAMA = {
  dias: 1,
  semAvanco: 3,
  /* as histórias que não se recusam e contam para o intervalo */
  contam: ["principal", "trama"],
};

/* `estado`: { abertura, missoes, dia }. Devolve true quando uma trama
   forçada pode nascer neste turno. */
export function tramaTemEspaco(estado) {
  const e = obj(estado);
  const a = garantirAbertura(e.abertura);
  const ms = garantirMissoes(e.missoes);
  /* a anterior fechou */
  if (ms.some((m) => m.status === "ativa" && m.tipo === "trama")) return false;
  /* o herói está orientado */
  if (!deuOPrimeiroPasso(a, ms)) return false;
  /* o intervalo, em dias de jogo */
  const dia = Number(e.dia);
  const nascidas = ms.filter((m) => ESPACO_DA_TRAMA.contam.includes(m.tipo)).map((m) => Number(m.criadaEm) || 0);
  if (Number.isFinite(dia) && nascidas.length && dia - Math.max(...nascidas) < ESPACO_DA_TRAMA.dias) return false;
  /* a principal não acabou de andar */
  if (!a.legado && !a.tocou) {
    const m = principalDe(a, ms);
    if (m && m.id === a.principalId && m.status === "ativa" && a.semAvanco < ESPACO_DA_TRAMA.semAvanco) return false;
  }
  return true;
}

/* O veto que vai à pauta (secção NÃO PODE) enquanto o mural espera. */
export function vetosDaAbertura(estado) {
  return muralLiberado(estado) ? [] : [MURAL.veto];
}

/* A MENÇÃO NÃO É PRESENÇA. A abertura diz o nome da pista (é o "único nome
   que se tinha"), e o App regista no elenco quem é nomeado na narração —
   o que cumpriria o encontro sem encontro nenhum. Enquanto o primeiro
   passo não está feito e o herói não está no lugar da pista, o nome dela
   (e o do alvo) é só um nome: o App não o regista. `ctx`: { lugar, missoes }. */
export function aindaSoUmNome(abertura, nome, ctx = {}) {
  const a = garantirAbertura(abertura);
  if (a.legado || !nome) return false;
  const o = obj(ctx);
  const n = norm(nome);
  if (n !== norm(a.pista.nome) && n !== norm(a.alvo.quem)) return false;
  const m = principalDe(a, o.missoes);
  if (!m || m.id !== a.principalId || m.status !== "ativa") return false;
  if (m.etapas[0] && m.etapas[0].feito) return false;
  const aqui = norm(obj(o.lugar).nome || o.lugar);
  return aqui !== norm(a.pista.local);
}

/* ============================================================
   O PRÓXIMO PASSO — uma linha, em voz de mundo
   ============================================================ */

/* O que fazer agora, dito como o mundo o diria ("Procurar Nostoc no
   mercado"). Lê a principal; num save antigo, a trama ativa. Vazio quando
   não há história em curso. Onde ela aparece é da tela. */
export function proximoPasso(estado) {
  const e = obj(estado);
  const a = garantirAbertura(e.abertura);
  const m = principalDe(a, e.missoes);
  if (!m || m.status !== "ativa") return "";
  const et = etapaAtual(m);
  if (!et) return "";
  const daAbertura = !a.legado && m.id === a.principalId;
  if (et.tipo === "ir_a" && et.lugar && daAbertura && norm(et.alvo) === norm(a.pista.local)) {
    return `Procurar ${a.pista.nome} ${comEm(a.pista.local)}`;
  }
  /* a etapa de MM13 sem onde: o da abertura */
  if (et.tipo === "falar_com" && !et.onde && daAbertura && norm(et.alvo) === norm(a.alvo.quem)) {
    return rumoDaEtapa({ ...et, onde: a.alvo.onde });
  }
  /* MM13b: a voz é uma só, a de `missoes.js` — a mesma que a linha do ✓
     usa para dizer o que abriu. Duas vozes para o mesmo passo seriam dois
     rumos. */
  return rumoDaEtapa(et);
}

/* ============================================================
   O MUNDO PINGA FIOS — o gancho mínimo
   ============================================================ */

/* Esta pessoa (ou este lugar) tem um fio para a principal? Devolve UMA
   linha para a pauta (secção A GENTE), ou "". `ctx`:
     { abertura, missoes, semente, pessoa: {nome, local}, lugar }
   A pista e o alvo têm fio sempre; o lugar da pista e o do alvo também;
   da gente da cidade de partida, `FIOS.chance` ouviu falar, pela semente
   e pelo nome — sempre a mesma pessoa. */
export function fioParaAPrincipal(ctx) {
  const o = obj(ctx);
  const a = garantirAbertura(o.abertura);
  if (a.legado) return "";
  const m = principalDe(a, o.missoes);
  if (!m || m.id !== a.principalId || m.status !== "ativa") return "";
  const p = obj(o.pessoa);
  const nome = txt(p.nome, 60);
  const obj_ = a.alvo.objeto;
  if (nome && norm(nome) === norm(a.alvo.quem)) return `${nome} é quem o herói veio procurar`;
  /* MM13b: e sabe ONDE. A pista dava o nome e calava a morada — "a Corda
     Velha" do segundo passo não estava na fala de quem a deu. Agora o
     Narrador recebe o lugar (e a cidade, se é outra) do passo seguinte. */
  if (nome && norm(nome) === norm(a.pista.nome)) {
    const seguinte = m.etapas.find((e, i) => i > 0 && e.onde && norm(e.onde) !== norm(a.pista.local));
    return contrair(`${nome} sabe de ${obj_}${seguinte ? ` (${comEm(seguinte.onde)})` : ""}, e fala se lhe perguntarem`);
  }
  const lugar = txt(obj(o.lugar).nome || (typeof o.lugar === "string" ? o.lugar : ""), 60);
  if (!nome && lugar) {
    if (norm(lugar) === norm(a.alvo.onde) && a.alvo.feitio === "descobrir") return contrair(`aqui há sinal de ${obj_}, para quem procurar`);
    if (norm(lugar) === norm(a.pista.local)) return `é aqui que se encontra ${a.pista.nome}`;
    return "";
  }
  if (!nome) return "";
  const r = rngDe(`${String(o.semente == null ? "" : o.semente)}|fio|${norm(nome)}`);
  if (r() >= FIOS.chance) return "";
  return contrair(`${nome} ${pick(r, FIOS.como)} — sobre ${obj_}`);
}

/* ============================================================
   O SINO
   ============================================================ */

/* Um turno do sino. `ctx`:
     { missoes, lugar (o lugar onde o herói está agora), conhecidos (quantas
       pessoas o registo tem agora — número ou a lista), pausa (sono,
       masmorra, raid: o sino não anda), cidade (a cidade onde se está) }
   A gente nova conta pela DIFERENÇA do registo entre dois turnos, e não
   por nome: assim quem chama não precisa de saber quem entrou neste turno,
   e o save não precisa de guardar a lista inteira do elenco.
   Devolve { abertura, prenuncio, toque } — `prenuncio` é uma linha para a
   pauta (secção MOMENTO) no turno em que chega; `toque` é o acontecimento
   quando o sino toca: { relogio, envelope, linha }. O sino toca UMA vez. */
export function andarOSino(abertura, ctx = {}) {
  const a = garantirAbertura(abertura);
  const vazio = { abertura: a, prenuncio: "", toque: null };
  if (a.legado || a.tocou) return vazio;
  const o = obj(ctx);
  if (o.pausa) return vazio;

  const turnos = a.turnos + 1;
  let cheios = a.cheios;
  /* o tempo na cidade */
  if (turnos % SINO.turnosPorSegmento === 0) cheios += 1;
  /* as visitas: lugar novo e gente nova */
  const vistos = new Set(a.visitados.map(norm));
  const novos = [];
  const lugar = txt(obj(o.lugar).nome || (typeof o.lugar === "string" ? o.lugar : ""), 60);
  if (lugar && !vistos.has(norm(lugar))) novos.push(lugar);
  const nConhecidos = Array.isArray(o.conhecidos) ? o.conhecidos.length : inteiro(o.conhecidos);
  const genteNova = o.conhecidos == null ? 0 : Math.max(0, nConhecidos - a.conhecidos);
  cheios += (novos.length + genteNova) * SINO.porVisita;
  /* o afastamento: turnos sem a história andar */
  const m = principalDe(a, o.missoes);
  const feitas = m && m.id === a.principalId ? m.etapas.filter((x) => x.feito).length : a.feitas;
  const avancou = feitas > a.feitas;
  const semAvanco = avancou ? 0 : a.semAvanco + 1;
  /* depois de a principal fechar não há de que se afastar */
  if (m && m.status === "ativa" && semAvanco > SINO.tolerancia) cheios += SINO.porTurnoAfastado;
  cheios = Math.min(SINO.segmentos, cheios);

  const novo = {
    ...a, turnos, cheios, semAvanco, feitas,
    conhecidos: o.conhecidos == null ? a.conhecidos : nConhecidos,
    visitados: [...a.visitados, ...novos].slice(-SINO.tetoVisitados),
  };
  const v = { ...a.alvo, cidade: a.cidade, origem: a.alvo.origem || a.alvo.onde || a.cidade, sinal: a.sinal };

  /* nunca antes do piso: cheio espera, um segmento abaixo */
  if (cheios >= SINO.segmentos && turnos < SINO.piso) novo.cheios = SINO.segmentos - 1;

  if (novo.cheios >= SINO.segmentos) {
    const r = rngDe(`${a.cidade}|sino|${a.titulo}`);
    /* quem se procurava ja foi achado: o sino nao o traz ferido a uma porta
       onde ele ja esteve, traz o que sai do lugar */
    const achado = a.alvo.feitio === "procurar" && m && m.id === a.principalId && m.etapas.every((x) => x.feito);
    const lista = ACONTECIMENTOS_DO_SINO[achado ? "descobrir" : a.alvo.feitio] || ACONTECIMENTOS_DO_SINO.descobrir;
    const aconteceu = contrair(encher(pick(r, lista), v));
    /* o heroi ja saiu da cidade: a historia vai atras dele pela boca de quem fugiu */
    const longe = !!(o.cidade && norm(o.cidade) !== norm(a.cidade));
    const consequencia = longe ? encher(SINO_DE_LONGE, { cidade: a.cidade, o: aconteceu }) : aconteceu;
    const segs = TAMANHOS.includes(SINO.segmentos) ? SINO.segmentos : 8;
    const base = criarRelogio({
      id: "sino", nome: `O rebate em ${a.cidade}`.slice(0, 60), tipo: "ameaca", segmentos: segs,
      gatilho: "manual", fonte: "sino", consequencia,
    });
    const relogio = base ? { ...base, cheios: base.segmentos } : null;
    return {
      abertura: { ...novo, tocou: true, prenunciado: true, tocouEm: quandoFoi({ dia: o.dia, minuto: o.minuto }), oQueTocou: txt(aconteceu, 200) },
      prenuncio: "",
      toque: relogio ? { relogio, envelope: envelopeCheio(relogio), linha: `⚠ ${consequencia.charAt(0).toUpperCase()}${consequencia.slice(1)}.` } : null,
    };
  }
  if (!novo.prenunciado && novo.cheios >= SINO.segmentos - 1 && !(o.cidade && norm(o.cidade) !== norm(a.cidade))) {
    const pr = contrair(encher(v.sinal ? PRENUNCIOS.comSinal : PRENUNCIOS.semSinal, v));
    return { abertura: { ...novo, prenunciado: true, prenunciadoEm: quandoFoi({ dia: o.dia, minuto: o.minuto }) }, prenuncio: pr, toque: null };
  }
  return { abertura: novo, prenuncio: "", toque: null };
}

/* MM14: os sinos que tocaram FORA DE HORA hoje, na cidade da abertura —
   para a ficha da cidade (`fichaParaPauta`, ctx `foraDeHora`) os dizer ao
   ser perguntada. [{ hora: "10:49", o, curto }], pela ordem em que
   tocaram; vazio noutra cidade, noutro dia, ou num save de antes. */
export function sinosForaDeHora(abertura, { dia, cidade } = {}) {
  const a = garantirAbertura(abertura);
  if (a.legado) return [];
  const d = Math.floor(Number(dia));
  if (!Number.isFinite(d) || (cidade != null && norm(cidade) !== norm(a.cidade))) return [];
  const sinal = a.sinal || SINOS_FORA_DE_HORA.semSinal;
  const hora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const out = [];
  const um = (q, molde, o = "") => {
    if (!q || q.dia !== d) return;
    const x = (s) => contrair(encher(s, { sinal, o }));
    out.push({ hora: hora(q.minuto), o: x(molde.o), curto: x(molde.curto), minuto: q.minuto });
  };
  um(a.prenunciadoEm, SINOS_FORA_DE_HORA.prenuncio);
  um(a.tocouEm, SINOS_FORA_DE_HORA.rebate, a.oQueTocou);
  return out.sort((x, y) => x.minuto - y.minuto).map(({ hora: h, o, curto }) => ({ hora: h, o, curto }));
}
