/* ============================================================
   AS BATIDAS (MM, a campanha que prende, 11/10)

   A pessoa jogou a quarta sessão de prova e disse: *"achei a história de
   morna para frio, não prendeu muito"*. E pediu *"uma campanha que prende,
   com reviravoltas e histórias que merecem ser lidas, à la Matt Mercer e
   Brennan Lee Mulligan"*.

   Com o fio da v9.379 a espinha passou a ter nexo — cada peça aponta para
   a seguinte, e o fio todo leva ao antagonista. Mas continuava a ser uma
   lista de tarefas: seis atos, trinta e tal marcos, e todos com a mesma
   cara ("Encontrar Sigrun", "O que o Mercado da Bota esconde", "Acabar com
   Lobo"). Nenhum dizia o que o herói tinha a perder, nem que pergunta a
   cena respondia. Uma mesa do Matt ou do Brennan tem POUCAS batidas fortes
   por arco, e cada uma é uma cena com três coisas:

     · ONDE e COM QUEM (a cena);
     · o que ESTÁ EM JOGO para este herói — pessoal e concreto, saído do
       passado que o jogador escolheu (o antecedente), não "o reino";
     · a PERGUNTA dramática que ela responde.

   Este módulo marca essas batidas na espinha, uma vez, na criação do mundo:
   no máximo cinco por ato, e a última cena forte do ato é sempre uma (o
   FECHO, onde o ato vira) — gente, segredo, chefe ou o fundo do lugar do
   ato; nunca o bicho que sobrou do sorteio. Os outros marcos — o bicho a
   abater, o fundo a alcançar — continuam lá e continuam a contar para o
   arco; passam a ser o CAMINHO entre batidas, e o Narrador lê-os assim.

   E mais três coisas que a quarta sessão pedia, no mesmo sítio porque são
   da mesma natureza (o que a espinha guarda e o Narrador só recebe na hora):

   1. O SEGREDO DE CADA "DESCOBRIR". O marco fechava por o herói entrar no
      lugar, e o lugar "guardava uma carta" que não dizia nada. Agora guarda
      uma coisa do Escondido da cidade (o mesmo baú, alçapão, livro-caixa
      que `segredosDaCidade` já põe no mundo; sem o do lugar, um da mesma
      tabela, pela semente) e o que ela PROVA: um facto que muda o que o
      jogador sabe e aponta para a peça seguinte.

   2. A REVIRAVOLTA DO ATO 0. A abertura já planta o laço do antecedente
      ("e um antigo companheiro de armas anda metido nisto",
      `LACOS_DO_ANTECEDENTE`, abertura.js) e ninguém o colhia. O fecho do
      primeiro ato colhe-o: a verdade sobre aquele laço, ligada à sombra do
      fim e à peça seguinte.

   3. O RELÓGIO DO ANTAGONISTA. O plano de `vilao.js` (os nove passos, as
      fases rumor → marca → mão) só corria quando a fama fazia nascer uma
      nêmesis — e na quarta sessão nunca nasceu. Aqui o antagonista do fio
      anda desde o primeiro dia, pelos MESMOS passos do plano (ligado, não
      duplicado: `PASSOS_DO_PLANO`, `FASE_DO_PASSO`, `DIAS_POR_PASSO`): cada
      ato até ao último tem uma etapa, que mira o fecho desse ato. Se o
      herói chega ao fecho antes do prazo, apanha-os a meio (TRAVADA); se
      demora, chegaram primeiro (CUMPRIDA) e o mundo mostra a marca. Antes
      do nome, o herói cruza com a obra dele, um bilhete dele, os servos
      dele — a escada das fases. O Narrador recebe só a marca do momento,
      nunca o plano.

   O que aqui se escreve são TEXTOS com dois buracos que só se enchem na
   hora: {sombra}, o antagonista no tamanho do ato ("quem está por trás de
   tudo", o título, o nome; `FIO.curta`, saga.js), e {leva}, a peça
   seguinte que ainda está de pé. Assim a sombra cresce com a história sem
   que o save guarde três versões de cada frase.

   Puro, determinístico pela semente, sem tocar no que recebe. A espinha de
   um save antigo não tem batidas, e o envelope dela continua o de sempre.
   ============================================================ */
import { rngDe } from "./geografia.js";
import { locaisDaCidade, genteDoLocal, chefesDoMundo, segredosDaCidade, SEGREDOS } from "./mundo-base.js";
import { ANTECEDENTES } from "./antecedentes.js";
import { PASSOS_DO_PLANO, FASE_DO_PASSO, FASES, DIAS_POR_PASSO } from "./vilao.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const finito = (v) => typeof v === "number" && Number.isFinite(v);
/* enche só o que sabe; {sombra} e {leva} ficam para a hora */
const encher = (tpl, v) => String(tpl || "").replace(/\{(\w+)\}/g, (m, k) => (v[k] == null ? m : String(v[k])));

/* ---------------- O TAMANHO DE UM ATO ---------------- */
export const BATIDAS = {
  porAto: { min: 3, max: 5 },
  /* o que é cena por natureza: gente, segredo, o chefe do fim */
  narrativos: ["confronto", "procurar", "descobrir"],
  /* o que vira cena quando o ato tem pouca: o fundo de um lugar primeiro,
     depois o bicho que guarda o caminho */
  promoviveis: ["descer", "enfrentar"],
};

/* ---------------- O QUE ESTÁ EM JOGO ----------------
   A coisa do passado do herói que a história põe na mesa — uma por
   antecedente, em três jeitos de dizer, para vinte batidas não repetirem a
   mesma frase. Casa com o laço que a abertura planta (`LACOS_DO_ANTECEDENTE`)
   e com o gancho da ficha (`antecedentes.js`). Sem antecedente, o que trouxe
   o herói até aqui. */
export const EM_JOGO = {
  coisas: {
    orfao: ["o último rasto da família do herói", "o nome da família que o herói perdeu", "quem levou a família do herói"],
    soldado: ["o paradeiro do antigo companheiro de armas", "a ordem que o herói cumpriu na guerra", "a honra da antiga companhia do herói"],
    nobre_caido: ["o nome da família do herói", "a dívida que pesa sobre a casa do herói", "o que resta do brasão da família"],
    erudito: ["o texto proibido que o herói leu", "a página que falta ao texto proibido", "quem mais leu o texto proibido"],
    ladrao: ["a dívida que a guilda dos dedos cobra ao herói", "o preço que a guilda pôs na cabeça do herói", "o segredo que a guilda quer comprar ao herói"],
    acolito: ["a liberdade que o herói roubou à ordem", "o que a ordem de que o herói fugiu procura", "os votos que o herói quebrou"],
    pragado: ["a verdade sobre a febre que poupou o herói", "os que a febre levou e o herói não", "a cura que nunca chegou à aldeia do herói"],
    artista: ["a canção que o herói escreveu sem saber de quê", "o último verso da canção do herói", "quem ensinou ao herói aquela canção"],
    cacador: ["o alvo antigo que escapou ao herói", "a recompensa que o herói nunca cobrou", "o nome na última ordem de caça do herói"],
    ferreiro: ["a forja da família do herói", "o martelo que tiraram ao pai do herói", "o que se forja agora na forja da família"],
    ex_cultista: ["o que o herói deixou com os antigos irmãos", "o nome que os antigos irmãos deram ao herói", "o rito que o herói recusou acabar"],
    naufrago: ["o porquê do naufrágio do herói", "a carga que o navio do herói levava", "os que se afogaram e o herói não"],
    sem: ["o que trouxe o herói até aqui", "a razão que o herói tem para estar aqui", "o que o herói veio buscar"],
  },
  /* {coisa} sempre; {sombra} enche-se na hora, no tamanho do ato */
  porFeitio: {
    procurar: [
      "{quem} sabe uma coisa sobre {coisa}; se {sombra} chegar primeiro, essa boca fecha-se",
      "{quem} {vontade} — e sabe mais do que diz sobre {coisa}",
      "o que {quem} cala custa {coisa}; o que diz pode custar-lhe a pele",
      "{quem} tem um preço para falar de {coisa}, e {sombra} já ofereceu mais",
      "{quem} é a última ponta viva de {coisa}; perder esta conversa é perder o rasto",
    ],
    descobrir: [
      "o que aqui se guarda prova uma coisa sobre {coisa}; deixá-lo é deixá-lo a {sombra}",
      "aqui está a ponta de {coisa}, e quem a guardou não a quer achada",
      "alguém escondeu aqui a verdade sobre {coisa}, e há de voltar para a buscar",
      "o que aqui se esconde é a prova de {coisa} que {sombra} quer apagada",
    ],
    enfrentar: [
      "{alvo} está entre o herói e {coisa}",
      "cair diante de {alvo} é perder {coisa} de vez",
      "{alvo} guarda o caminho de {coisa}, e ninguém voltou para o contar",
    ],
    descer: [
      "no fundo de {onde} está o que falta saber sobre {coisa}",
      "lá dentro ficou o último que foi atrás de {coisa}",
      "o fundo de {onde} guarda a prova de {coisa}, e {sombra} sabe-o",
    ],
    confronto: [
      "{sombra} tem nas mãos {coisa} — e sabe o nome do herói",
      "acabar aqui é recuperar {coisa}; falhar é deixá-lo a {sombra} para sempre",
    ],
  },
};

/* ---------------- A PERGUNTA DA CENA ----------------
   O que a cena decide — dita como pergunta de mesa, para o Narrador saber o
   que está em aberto e não a fechar sozinho. */
export const PERGUNTAS = {
  procurar: [
    "{quem} confia no herói antes de confiar no medo?",
    "o que {quem} pede em troca — e o herói pode pagá-lo?",
    "{quem} está do lado do herói, ou do lado de quem paga mais?",
    "{quem} diz a verdade inteira, ou só a que lhe convém?",
    "o herói tira a verdade a {quem} sem pôr essa pessoa em perigo?",
  ],
  descobrir: [
    "quem mais sabe o que aqui se guarda — e está a ver?",
    "depois de saber, o herói ainda pode fingir que não sabe?",
    "o que aqui se esconde vale ser visto a procurá-lo?",
    "o herói leva a prova, ou deixa-a onde está e finge que não viu?",
  ],
  enfrentar: [
    "o herói passa por {alvo} sem deixar lá ninguém?",
    "quanto sangue custa {alvo} — e de quem?",
    "o herói luta aqui, ou acha outro caminho?",
  ],
  descer: [
    "o herói sobe com o que foi buscar, e inteiro?",
    "o que o fundo cobra para devolver o herói?",
    "o que o herói deixa lá em baixo para conseguir voltar?",
  ],
  confronto: [
    "quando {sombra} disser o que quer, o herói ainda o quer morto?",
    "o que o herói está disposto a perder para acabar com isto?",
  ],
};

/* ---------------- QUEM GUARDA O MARCO ----------------
   A cena de um "descobrir" nomeia quem o guarda ("A Biblioteca do
   Peregrino, em Casa da Fonte, à guarda de Corwin o Silencioso"). É gente da
   história: o mural lê a mesma frase para não o pôr a pregar trabalho
   (`ofertas.js#genteDaHistoria`, a 5.ª sessão de prova). Uma frase só, para
   quem a escreve e quem a lê não se desencontrarem. */
export const GUARDA_NA_CENA = "à guarda de";

/* ---------------- O QUE O SEGREDO PROVA ----------------
   Uma linha por tipo do Escondido (`SEGREDOS`, mundo-base.js): o facto que
   muda o que o jogador sabe, e o caminho para a peça seguinte. "aponta
   para"/"leva a" porque {leva} é gente, lugar ou "o que X esconde". */
export const SEGREDO_DIZ = {
  bau: "os pertences de alguém dado por morto e um recibo recente com o sinal de {sombra} — quem morreu trabalhava para ele; o recibo aponta para {leva}",
  alcapao: "um túnel com pegadas de poucas noites: gente de {sombra} entra e sai por aqui sem ser vista, e o túnel vai dar a {leva}",
  carta: "a carta avisa que {sombra} já comprou meia cidade por dentro; quem a escreveu mandava procurar {leva}",
  passagem: "um quarto murado usado ontem: velas, um mapa, e marcado a carvão como próximo sítio o caminho para {leva}",
  cofre: "um contrato com o sinal de {sombra}, que paga o silêncio de quem manda aqui; a próxima entrega aponta para {leva}",
  corpo: "os ossos são de alguém que fazia perguntas sobre {sombra}; no forro da roupa, o caminho para {leva}",
  registro: "há meses que alguém paga a {sombra} por este lugar, e os pagamentos levam a {leva}",
  relicario: "dentro, um nome que não devia estar ali — o de quem serve {sombra} — e o caminho para {leva} escrito no forro",
};

/* o teste que acha o segredo, dito como a mesa o diz */
const NOME_DO_TESTE = { percepcao: "Percepção", intelecto: "Intelecto" };

/* ---------------- A REVIRAVOLTA DO ATO 0 ----------------
   A verdade do laço que a abertura plantou, uma por antecedente, revelada
   no fecho do primeiro ato. Cada uma faz três coisas: muda o que o herói
   sabe do próprio passado, liga-o à sombra do fim, e aponta para o ato
   seguinte ({leva}). Sem antecedente: o que o trouxe não foi acaso. */
export const REVIRAVOLTA_DO_ATO0 = {
  orfao: "o nome parecido com o da família do herói é o de verdade: há alguém do sangue dele vivo, que serve {sombra} — e o rasto dessa pessoa aponta para {leva}",
  soldado: "o antigo companheiro de armas metido nisto recruta para {sombra}: foi ele quem deu o nome do herói a quem o esperava, e o rasto dele aponta para {leva}",
  nobre_caido: "a dívida que pesa sobre o nome da família do herói foi comprada por {sombra}: quem a cobra agora é ele, e a cobrança começa por {leva}",
  erudito: "o texto proibido que o herói leu foi escrito para {sombra} — é um mapa, e a página seguinte aponta para {leva}",
  ladrao: "a guilda dos dedos já vendeu o herói a {sombra}: tudo o que ele descobre chega lá antes dele, e o próximo recado da guilda aponta para {leva}",
  acolito: "a ordem de que o herói fugiu serve {sombra}, e quer o herói de volta para lho entregar; o rasto da ordem aponta para {leva}",
  pragado: "a febre que poupou o herói não foi acaso: foi a primeira obra de {sombra}, e quem a espalhou anda pelo caminho de {leva}",
  artista: "quem ensinou ao herói a canção servia {sombra}; o último verso, que o herói nunca cantou, aponta para {leva}",
  cacador: "o alvo antigo que escapou ao herói trabalha agora para {sombra}, e foi ele quem pôs a recompensa a correr — a próxima pista leva a {leva}",
  ferreiro: "quem tomou a forja da família do herói fê-lo por ordem de {sombra}, e o que lá se forja agora segue para {leva}",
  ex_cultista: "os antigos irmãos servem {sombra}, e é o herói que eles querem de volta; o rasto deles aponta para {leva}",
  naufrago: "o naufrágio não foi tempestade: foi {sombra}, que queria o que o navio levava — e a bússola aponta para {leva} porque é lá que isso está agora",
  sem: "o que trouxe o herói a {cidade} não foi acaso: alguém que serve {sombra} pô-lo no caminho dele de propósito, e já sabe que chegou; o rasto dessa gente aponta para {leva}",
};

/* ---------------- O RELÓGIO DO ANTAGONISTA ----------------
   Os passos são os do plano de `vilao.js` que vêm ANTES do rosto (o nome é
   do último ato, `FIO.sombra`): fases rumor, marca e mão. O que o herói
   cruza em cada fase sai da escada das fases — a obra dele, um bilhete
   dele, os servos dele. O prazo de cada etapa é o passo do plano
   (`DIAS_POR_PASSO`) mais uns dias por ato, contados desde a etapa
   anterior: o herói ligeiro faz o antagonista correr; o lento deixa-o
   ganhar. */
export const RELOGIO_DO_FIO = {
  passos: [0, 1, 2, 3, 4],
  diasAMaisPorAto: 2,
  rosto: { rumor: "A OBRA DELE", marca: "UM BILHETE DELE", mao: "OS SERVOS DELE" },
  /* a assinatura que ele deixa — o bilhete sem palavras */
  assinaturas: ["três riscos de carvão", "um nó de corda vermelha", "cera preta sem selo", "um prego dobrado em gancho", "uma pena queimada na ponta", "um círculo de sal"],
  /* por passo do plano: a corrida (travada) e a perda (cumprida).
     {gente}, {cidade}, {onde}, {assinatura}. */
  marcas: [
    { travada: "em {cidade} um carroceiro sem rosto recruta os sem-casa a moeda por cabeça, e a carroça ainda não partiu", cumprida: "os sem-casa de {cidade} sumiram das soleiras numa noite só e voltaram calados, de botas novas, a guardar {onde}" },
    { travada: "em {cidade}, {gente} recebeu uma bolsa para calar o que sabe e ainda não decidiu se a aceita", cumprida: "em {cidade}, {gente} aceitou a bolsa: já não fala com estranhos, e a moeda nova ainda lhe brilha na mão" },
    { travada: "vieram tomar {onde} e foram interrompidos: na porta deixaram {assinatura}, feito a meio", cumprida: "{onde} mudou de dono de um dia para o outro, e na porta deixaram {assinatura}" },
    { travada: "no poço de {cidade} há um bilhete com {assinatura} a dizer que ninguém vem, e o povo ainda não acredita nele", cumprida: "o bilhete com {assinatura} no poço de {cidade}, a dizer que ninguém vem, já todos o leram, e quem pedia ajuda calou-se" },
    { travada: "os servos dele estão em {cidade} a virar {gente}, que ainda hesita; sabem o nome do herói e não o esperavam tão cedo", cumprida: "{gente} passou para o lado dele: os servos dele já sabem o nome do herói e esperam-no em {onde}" },
  ],
  /* o que o mundo diz, no ato seguinte, a quem chegou antes deles */
  depois: "em {cidade} o herói chegou antes deles — {gente} sabe-o, e a sombra também",
};

/* ---------------- QUEM É O HERÓI ----------------
   A ficha guarda o NOME do antecedente ("Soldado Reformado"); a criação, às
   vezes, o id. Os dois servem — a mesma porta dupla de `lacoDoAntecedente`. */
export function antecedenteDe(ref) {
  const k = norm(ref);
  if (!k) return "";
  const a = ANTECEDENTES.find((x) => norm(x.id) === k || norm(x.nome) === k);
  return a && EM_JOGO.coisas[a.id] ? a.id : "";
}

/* ============================================================
   MARCAR AS BATIDAS — uma vez, na criação
   `ctx`: { semente, mapa, genero, molde, lex, antecedente }. Devolve a
   espinha nova (sem passar pela catraca: quem chama passa-a por
   `garantirEspinha`). Sem atos, devolve-a como veio.
   ============================================================ */
const LIMPAR = ["batida", "segredo", "reviravolta", "relogio"];
export function marcarBatidas(espinha, ctx) {
  const e = espinha && typeof espinha === "object" ? espinha : null;
  if (!e || !Array.isArray(e.atos) || !e.atos.length) return e;
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const semente = String(o.semente != null ? o.semente : e.semente || "");
  const genero = o.genero || "Fantasia medieval", molde = o.molde || null, lex = o.lex || null;
  const cidades = (o.mapa && Array.isArray(o.mapa.cidades) ? o.mapa.cidades : []).filter((c) => c && c.nome);
  const ant = antecedenteDe(o.antecedente != null && o.antecedente !== "" ? o.antecedente : e.fio && e.fio.antecedente);
  const coisas = EM_JOGO.coisas[ant || "sem"];

  let chaves = new Set();
  if (o.mapa) {
    try {
      for (const c of chefesDoMundo(semente, o.mapa, genero, lex)) { chaves.add(norm(c.nome)); if (c.nomeCurto) chaves.add(norm(c.nomeCurto)); }
    } catch { chaves = new Set(); }
  }
  const ehChefe = (m) => m.feitio === "enfrentar" && chaves.has(norm(m.alvo));
  const cidadeDe = (nome) => cidades.find((c) => norm(c.nome) === norm(nome)) || null;
  const locais = {};
  const locaisDe = (c) => {
    if (!locais[c.nome]) { try { locais[c.nome] = locaisDaCidade(semente, c, genero, molde, lex); } catch { locais[c.nome] = []; } }
    return locais[c.nome];
  };
  const genteDe = (c, local) => { try { return genteDoLocal(semente, local, genero, molde, lex); } catch { return []; } };
  const pessoa = (m) => {
    const c = cidadeDe(m.cidade);
    if (!c || !m.quem) return null;
    for (const l of locaisDe(c)) {
      const p = genteDe(c, l).find((x) => norm(x.nome) === norm(m.quem));
      if (p) return p;
    }
    return null;
  };
  const localDe = (m) => { const c = cidadeDe(m.cidade); return c ? locaisDe(c).find((l) => norm(l.nome) === norm(m.onde)) || null : null; };
  const naCidade = (m) => (m.cidade && norm(m.cidade) !== norm(m.onde) ? `, em ${m.cidade}` : "");
  /* O MESMO MODELO NÃO VEM DUAS VEZES SEGUIDAS. Vinte batidas sorteadas de
     quatro frases repetiam a mesma pergunta em cenas vizinhas, e a
     repetição é o que faz uma lista parecer lista. O sorteio continua a ser
     da semente; só passa ao modelo seguinte quando cairia no da última vez. */
  const ultimaVez = new Map();
  const semRepetir = (r, lista, chave) => {
    let i = Math.floor(r() * lista.length);
    if (lista.length > 1 && ultimaVez.get(chave) === lista[i]) i = (i + 1) % lista.length;
    ultimaVez.set(chave, lista[i]);
    return lista[i];
  };

  const ultimo = e.atos.length - 1;
  const nEtapas = Math.max(0, ultimo);
  const P = RELOGIO_DO_FIO.passos;
  const temFio = !!(e.fio && e.fio.antagonista);

  const atos = e.atos.map((a, k) => {
    const ms = (Array.isArray(a && a.marcos) ? a.marcos : []).map((m) => {
      const x = { ...m };
      for (const c of LIMPAR) delete x[c];
      return x;
    });
    if (!ms.length) return { ...a, marcos: ms };
    /* QUEM É BATIDA: o fecho sempre — a última cena forte do ato (gente,
       segredo, chefe, o fundo do lugar); antes dele, o que é cena por
       natureza, até ao teto; se o ato fica curto, o fundo e o bicho viram
       cena. E se nem assim chega (o ato pequeno que acaba num bicho), o
       fecho é o último marco, que é como o ato acaba de facto. */
    const forte = (m) => BATIDAS.narrativos.includes(m.feitio) || ehChefe(m) || m.feitio === "descer";
    const escolher = (fecho) => {
      const narr = ms.map((m, i) => i).filter((i) => i < fecho && (BATIDAS.narrativos.includes(ms[i].feitio) || ehChefe(ms[i])));
      const out = new Set(narr.slice(0, BATIDAS.porAto.max - 1));
      for (const f of BATIDAS.promoviveis) {
        for (let i = 0; i < fecho && out.size + 1 < BATIDAS.porAto.min; i++) if (!out.has(i) && ms[i].feitio === f) out.add(i);
      }
      out.add(fecho);
      return out;
    };
    /* o confronto fecha o último ato; a descida ao lugar do ato (a que a
       amarração da região escreve, `espinha|i|d`) fecha um ato do meio — o
       que vem depois dela é o que sobrou do sorteio, e a região já diz que
       a história não precisa disso para andar (regiao.js, `montar`) */
    const conf = ms.findIndex((m) => m.feitio === "confronto");
    const doLugar = ms.findIndex((m) => m.feitio === "descer" && String(m.id || "").endsWith("|d"));
    /* ...a não ser que um chefe com nome espere depois da descida: um chefe
       é sempre cena, e deixá-lo como resto seria gastar o melhor do ato */
    const chefeDepois = doLugar >= 0 ? ms.map((m, i) => i).filter((i) => i > doLugar && ehChefe(ms[i])).pop() : undefined;
    const ultimoForte = ms.map((m, i) => i).filter((i) => forte(ms[i])).pop();
    let fecho = conf >= 0 ? conf : chefeDepois != null ? chefeDepois : doLugar >= 0 ? doLugar : ultimoForte == null ? ms.length - 1 : ultimoForte;
    let escolhidos = escolher(fecho);
    if (escolhidos.size < Math.min(ms.length, BATIDAS.porAto.min) && fecho !== ms.length - 1) { fecho = ms.length - 1; escolhidos = escolher(fecho); }

    ms.forEach((m, i) => {
      const r = rngDe(`${semente}|batida|${m.id}`);
      const p = m.feitio === "procurar" ? pessoa(m) : null;
      const loc = m.feitio === "descobrir" ? localDe(m) : null;
      const guarda = loc ? (genteDe(cidadeDe(m.cidade), loc)[0] || null) : null;
      const v = {
        quem: m.quem, onde: m.onde, alvo: m.alvo, cidade: m.cidade || "",
        coisa: pick(r, coisas),
        vontade: p && p.vontade ? p.vontade : "tem as suas razões para falar pouco",
      };
      /* O SEGREDO: todo "descobrir", batida ou caminho — o do Escondido do
         lugar, quando o lugar tem um; senão um da mesma tabela, pela semente */
      if (m.feitio === "descobrir") {
        const c = cidadeDe(m.cidade);
        let sg = null;
        if (c) { try { sg = segredosDaCidade(semente, c, genero, molde, lex).find((x) => norm(x.local) === norm(m.onde)) || null; } catch { sg = null; } }
        const escondido = !!sg;
        if (!sg) sg = SEGREDOS[Math.floor(rngDe(semente + "|segredo|" + m.id)() * SEGREDOS.length)];
        m.segredo = { coisa: sg.o, diz: SEGREDO_DIZ[sg.tipo] || SEGREDO_DIZ.registro, acha: NOME_DO_TESTE[sg.acha] || sg.acha, dc: sg.dc, escondido };
      }
      if (!escolhidos.has(i)) return;
      const feitio = ehChefe(m) ? "enfrentar" : m.feitio;
      const cena = feitio === "procurar"
        ? `${m.quem}${p && p.papel && !/\(/.test(p.papel) ? `, ${p.papel}` : ""}, em ${m.onde}${naCidade(m)}`
        : feitio === "descobrir"
          ? `${m.onde}${naCidade(m)}${guarda ? `, ${GUARDA_NA_CENA} ${guarda.nome}` : ""}`
          : feitio === "enfrentar" ? `${m.alvo}, em ${m.onde}`
            : feitio === "descer" ? `o fundo de ${m.onde}`
              : `{sombra}, em ${m.onde}`;
      const tplJogo = EM_JOGO.porFeitio[feitio] || EM_JOGO.porFeitio.procurar;
      /* sem vontade conhecida, a variante que a pede fica de fora */
      const jogos = p ? tplJogo : tplJogo.filter((t) => !t.includes("{vontade}"));
      m.batida = {
        cena,
        emJogo: encher(semRepetir(r, jogos.length ? jogos : tplJogo, `jogo|${feitio}`), v),
        pergunta: encher(semRepetir(r, PERGUNTAS[feitio] || PERGUNTAS.procurar, `pergunta|${feitio}`), v),
        fecho: i === fecho,
      };
    });

    /* A REVIRAVOLTA: o fecho do primeiro ato colhe o laço da abertura (só
       quando há um ato depois, para onde ela aponte) */
    if (k === 0 && e.atos.length > 1) {
      const f = ms[fecho];
      const cidadeDoAto = [...ms].reverse().map((m) => m.cidade).find(Boolean) || f.onde || "";
      f.reviravolta = encher(REVIRAVOLTA_DO_ATO0[ant || "sem"], { cidade: cidadeDoAto });
    }
    /* O RELÓGIO: uma etapa por ato antes do último, a mirar o fecho dele —
       o passo do plano espalhado pelos atos, do rumor à mão */
    if (temFio && k < ultimo && nEtapas > 0) {
      const f = ms[fecho];
      const passo = P[Math.round((k * (P.length - 1)) / Math.max(1, nEtapas - 1))];
      const cidade = [...ms].reverse().map((m) => m.cidade).find(Boolean) || f.onde || "";
      const gente = f.feitio === "procurar" ? f.quem : (ms.filter((m) => m.feitio === "procurar" && m.batida).pop() || ms.filter((m) => m.feitio === "procurar").pop() || {}).quem || "";
      f.relogio = { passo: passo == null ? P[0] : passo, gente, cidade };
    }
    return { ...a, marcos: ms };
  });
  const fio = temFio
    ? { ...e.fio, ...(ant ? { antecedente: ant } : {}), assinatura: pick(rngDe(semente + "|assinatura"), RELOGIO_DO_FIO.assinaturas) }
    : e.fio;
  return { ...e, atos, ...(fio ? { fio } : {}) };
}

/* ============================================================
   O RELÓGIO NA HORA — o que já caiu, e como
   Sem estado guardado: deriva-se da espinha (as etapas marcadas na criação,
   o dia em que cada marco se cumpriu — `conferirEspinha` grava-o) e do dia
   de agora. Sem o dia de agora, vale o último dia que a espinha conhece.
   Devolve uma lista, na ordem dos atos:
     { ato, passo, fase, prazo, como: "travada" | "cumprida" | "", caiu,
       gente, cidade, onde }
   ============================================================ */
export function relogioDoFio(espinha, { dia } = {}) {
  const e = espinha && typeof espinha === "object" && Array.isArray(espinha.atos) ? espinha : null;
  if (!e) return [];
  const inicio = e.fio && finito(e.fio.inicio) ? e.fio.inicio : 1;
  const dias = e.atos.flatMap((a) => (a && Array.isArray(a.marcos) ? a.marcos : []).map((m) => m && m.dia)).filter(finito);
  const agora = finito(dia) ? dia : dias.length ? Math.max(inicio, ...dias) : inicio;
  const out = [];
  let desde = inicio, k = 0;
  e.atos.forEach((a, ato) => {
    for (const m of (a && Array.isArray(a.marcos) ? a.marcos : [])) {
      if (!m || !m.relogio || !finito(m.relogio.passo)) continue;
      const passo = m.relogio.passo;
      const prazo = desde + DIAS_POR_PASSO + RELOGIO_DO_FIO.diasAMaisPorAto * k;
      let como = "", caiu = null;
      if (m.feito && (!finito(m.dia) || m.dia <= prazo)) { como = "travada"; caiu = finito(m.dia) ? m.dia : null; }
      else if (agora >= prazo) { como = "cumprida"; caiu = prazo; }
      const fase = (FASES[FASE_DO_PASSO[passo]] || FASES[0]).id;
      out.push({ ato, passo, fase, prazo, como, caiu, gente: m.relogio.gente || "", cidade: m.relogio.cidade || m.onde || "", onde: m.onde || "", diz: (PASSOS_DO_PLANO[passo] || {}).diz || "" });
      desde = caiu != null ? caiu : prazo;
      k += 1;
    }
  });
  return out;
}

/* A marca de uma etapa, dita como fato do mundo. A forma (obra, bilhete,
   servos) vem da fase; o texto, do passo e de como caiu. */
export function marcaDaEtapa(et, assinatura = "") {
  if (!et) return "";
  const rosto = RELOGIO_DO_FIO.rosto[et.fase] || RELOGIO_DO_FIO.rosto.rumor;
  return et.como === "cumprida"
    ? rosto + " (já aconteceu — fato do mundo; não diga de quem é): " + fatoDaEtapa(et, assinatura) + "."
    : rosto + " (corre agora — fato do mundo; não diga de quem é): " + fatoDaEtapa(et, assinatura) + "; se o herói tardar, chegam primeiro.";
}

/* O fato de uma etapa, sem a moldura: a corrida (travada, ou ainda por
   cair) ou a perda (cumprida), com a gente, a cidade, o lugar e a
   assinatura cheios. MM19: é também o que a escada da escuta cobra quando
   o herói empaca (`escuta.js#cenaDoDegrau`) — o mesmo fato, para a pauta
   não dizer duas coisas. */
export function fatoDaEtapa(et, assinatura = "") {
  if (!et) return "";
  const tpl = RELOGIO_DO_FIO.marcas[et.passo] || RELOGIO_DO_FIO.marcas[0];
  const v = { gente: et.gente || "quem manda em " + et.cidade, cidade: et.cidade, onde: et.onde, assinatura: assinatura || RELOGIO_DO_FIO.assinaturas[0] };
  return encher(et.como === "cumprida" ? tpl.cumprida : tpl.travada, v);
}

/* O que o mundo lembra, no ato seguinte, de quem chegou antes deles. */
export function depoisDaEtapa(et) {
  if (!et || et.como !== "travada") return "";
  return encher(RELOGIO_DO_FIO.depois, { cidade: et.cidade, gente: et.gente || "a gente de " + et.cidade });
}
