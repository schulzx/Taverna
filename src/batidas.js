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

   O que aqui se escreve são TEXTOS com um buraco que só se enche na hora:
   {sombra}, o antagonista no tamanho do ato ("quem está por trás de tudo",
   o título, o nome; `FIO.curta`, saga.js). Assim a sombra cresce com a
   história sem que o save guarde três versões de cada frase.

   Puro, determinístico pela semente, sem tocar no que recebe. A espinha de
   um save antigo não tem batidas, e o envelope dela continua o de sempre.
   ============================================================ */
import { rngDe } from "./geografia.js";
import { locaisDaCidade, genteDoLocal, chefesDoMundo } from "./mundo-base.js";
import { ANTECEDENTES } from "./antecedentes.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
/* enche só o que sabe; {sombra} fica para a hora */
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
    "o herói tira a verdade a {quem} sem pôr {quem} em perigo?",
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
const LIMPAR = ["batida"];
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
      if (!escolhidos.has(i)) return;
      const feitio = ehChefe(m) ? "enfrentar" : m.feitio;
      const cena = feitio === "procurar"
        ? `${m.quem}${p && p.papel && !/\(/.test(p.papel) ? `, ${p.papel}` : ""}, em ${m.onde}${naCidade(m)}`
        : feitio === "descobrir"
          ? `${m.onde}${naCidade(m)}${guarda ? `, à guarda de ${guarda.nome}` : ""}`
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

    return { ...a, marcos: ms };
  });
  const fio = e.fio && e.fio.antagonista && ant ? { ...e.fio, antecedente: ant } : e.fio;
  return { ...e, atos, ...(fio ? { fio } : {}) };
}
