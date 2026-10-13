/* ============================================================
   PROCURAR ALGUÉM (v9.130) — fase 2 do plano

   O relato que abriu esta versão: "Procuro por sinais de Ione". O sistema
   abriu VASCULHAR O LUGAR, pediu Percepção, o herói passou — e recebeu uma
   arma escondida com pressa e sessenta moedas. Nada de Ione.

   O engraçado é que a regra já estava escrita. O desafio `buscar` tem um
   guarda com um comentário que diz, com todas as letras, "PROCURAR UMA
   PESSOA NÃO É VASCULHAR UM LUGAR, e a diferença é cara". Só que o guarda
   é uma LISTA DE PALAVRAS — taverneiro, ferreiro, guarda, alguém — e Ione
   não é nenhuma delas. Ele sabia reconhecer ofícios e não sabia reconhecer
   gente.

   E o jogo conhece Ione. Ela está no elenco, ou na base da cidade, ou é um
   marco da espinha. A pergunta certa nunca foi "esta frase tem palavra de
   pessoa?" — era "esta frase tem o nome de alguém que existe?".

   ---------------- O QUE MUDA, ALÉM DO GUARDA ----------------

   Procurar alguém deixa de ser um teste contra a tabela de tesouro e passa
   a ser uma PERGUNTA AO MUNDO. Ela anda com você, está aqui à vista, está
   aqui e não quer ser achada, está em outro lugar, morreu, ou nunca passou
   por aqui — e nenhuma dessas respostas se paga em moedas:

   · ela está aqui, à vista — não há o que rolar, você a encontra;
   · ela está aqui e não quer ser achada — aí sim tem dado, e o que está em
     jogo é ela, não um baú;
   · ela está em outro lugar — a resposta é o rumo e a distância, que é
     exatamente o que faz a procura continuar em vez de acabar;
   · ninguém com esse nome passou por aqui — e saber isso é informação, que
     é o que uma procura devia render mesmo quando falha.

   Nenhuma delas paga prata, e é esse o ponto: o esconderijo continua lá
   para quem estiver vasculhando o lugar de verdade.
   ============================================================ */
import { situacaoDe, SITUACOES } from "./mundo-base.js";
import { rumoEntre, formatarDistancia, coordDe, garantirCoord, kmEntre } from "./coordenadas.js";
/* E1 (12/10): a hora e a distância são as do Geógrafo — uma medida só */
import { caminhoNaRegiao, origemDoHeroi, tempoDoCaminho } from "./marcha.js";
/* 9.ª sessão (12/10): o elo procura-se pelo papel do passado do herói */
import { PROCURA_DO_ELO } from "./nucleo.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- O NOME NA FRASE ----------------
   Só conta nome que o jogo CONHECE. É o que separa "procuro por sinais de
   Ione" de "procuro por sinais de passagem": o segundo não nomeia ninguém,
   e continua sendo vasculhar o lugar — que é o certo.

   O nome mais longo ganha: num mundo com uma Ione e uma Ione Vantel, a
   frase que diz o sobrenome está falando da segunda.

   O APELIDO DE LUGAR NÃO É NOME (Fase MM, MM14 · item 10). A sessão de
   prova (mm11-sessao.md, T3 e T7) perguntou "onde fica o Sino Calado" e
   recebeu "Floripes do Sino está em Campo das Cinco Torres"; mais tarde,
   "Encontrar Lino do Sino". Floripes e Lino são gente que o jogo conhece
   (o gerador de pessoas tira o sobrenome do léxico do mundo, e este mundo
   tem alcunhas de lugar: "do Sino", "das Tábuas", "do Lamento"), e esta
   função casava QUALQUER pedaço de 4 letras ou mais: "sino", de "Floripes
   do Sino", com "o Sino Calado". O pedaço que vem depois de uma partícula
   ("do", "da", "dos", "das", "de") é alcunha: diz de ONDE a pessoa é, e
   não QUEM ela é, e sozinho não procura ninguém. O nome inteiro continua a
   casar ("onde anda a Floripes do Sino?"), o primeiro nome também, e o
   sobrenome sem partícula ("Duarte") também.
   `lugares` (opcional): nomes de lugar que se tiram da frase antes de
   procurar, porque o que o jogador diz de um lugar nunca é procura de gente.

   O NOME MAIS LONGO DITO, NÃO O NOME MAIS LONGO (05/10, 3.ª sessão de
   prova, defeito 7). "Procuro a Lourdes ao balcão" achou a Lourdes
   FERREIRA, a estudante da Livraria do Santo, duas vezes (M3, M7): a frase
   casava o pedaço "lourdes" dela e o nome inteiro da taverneira, e ganhava
   o nome mais comprido do registo — não o mais comprido DITO. E a frase
   dizia DUAS pessoas ("com a Iracema ao lado ... Procuro a Lourdes"). O
   placar, por esta ordem (`PLACAR_DA_PROCURA`):
     · `naoOuve` (13/10, a 10.ª sessão, M22): quem OUVE a pergunta
       ("pergunto a Torvald se…", "pergunto ao Godfrey onde encontro a Nyla")
       perde para qualquer outro nome dito — sozinho, continua a ser ele
       ("Pergunto à Rosalina: …", J7 da MM14);
     · `aposVerbo`/`junto`: quem vem logo depois do verbo da procura
       ("procuro a Lourdes") — a companhia dita antes não é o procurado.
       Frase sem verbo (o "Lina," de `pessoaNaFrente`): não pesa;
     · `dito`: o pedaço mais longo que a frase diz ("Lourdes Ferreira"
       dito inteiro continua a ser ela);
     · `perto`: quem está no grupo ou na cena (`perto`) — a procura que
       só diz o primeiro nome nunca escolhe a homónima de quem está ao lado;
     · `exato`: quem se chama exatamente assim;
     · `longo`: o nome mais longo, como antes. */
export const PLACAR_DA_PROCURA = ["naoOuve", "aposVerbo", "junto", "dito", "perto", "exato", "longo"];
export const ALCUNHA_DE_LUGAR = { particulas: ["de", "do", "da", "dos", "das", "del"], pedacoMinimo: 4, nomeMinimo: 3 };
export function nomeProcurado(texto, nomes = [], opcoes = {}) {
  let t = norm(texto);
  if (!t) return "";
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  for (const l of Array.isArray(o.lugares) ? o.lugares : []) {
    const nl = norm(l).replace(/^(o|a|os|as)\s+/, "");
    if (nl.length >= ALCUNHA_DE_LUGAR.nomeMinimo) t = t.split(nl).join(" ".repeat(nl.length));
  }
  const perto = new Set((Array.isArray(o.perto) ? o.perto : []).map((x) => norm(x && typeof x === "object" ? x.nome : x)).filter(Boolean));
  let achado = "", melhor = null;
  /* onde começa a procura: o primeiro verbo dela na frase (-1 = nenhum) */
  const mv = VERBOS.exec(t);
  const verbo = mv ? mv.index : -1;
  const ganha = (a, b) => {
    for (const k of PLACAR_DA_PROCURA) if (a[k] !== b[k]) return a[k] > b[k];
    return false;
  };
  for (const n of Array.isArray(nomes) ? nomes : []) {
    if (typeof n !== "string") continue;
    const nn = norm(n);
    if (nn.length < ALCUNHA_DE_LUGAR.nomeMinimo) continue;
    /* o nome inteiro, ou um pedaço dele — a mesa chama Ione Vantel de Ione,
       e uma procura que só casasse com o nome completo perderia todas as
       frases reais. Mas nunca o pedaço que vem depois de uma partícula. */
    const pal = nn.split(/\s+/);
    const pedacos = [nn, ...pal.filter((x, i) => x.length >= ALCUNHA_DE_LUGAR.pedacoMinimo && !(i > 0 && ALCUNHA_DE_LUGAR.particulas.includes(pal[i - 1])))];
    for (const p of pedacos) {
      const rx = new RegExp(`(^|[^a-z0-9])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "g");
      /* 8.ª sessão (M8): "Deixo Ursa" não procura Ursa (PROCURA_NAO_E_AQUI) */
      const posicoes = [...t.matchAll(rx)].map((m) => m.index + m[1].length).filter((x) => !PROCURA_NAO_E_AQUI.deixa.test(t.slice(Math.max(0, x - 32), x)));
      if (!posicoes.length) continue;
      /* quem ouve a pergunta perde para outro nome dito (PROCURA_NAO_E_AQUI.destinatario) */
      const ouvinte = posicoes.every((x) => PROCURA_NAO_E_AQUI.destinatario.test(t.slice(Math.max(0, x - 32), x)));
      const depois = posicoes.filter((x) => x >= verbo);
      const apos = verbo >= 0 && depois.length ? 1 : 0;
      const placar = {
        naoOuve: ouvinte ? 0 : 1,
        aposVerbo: apos,
        junto: apos ? -(Math.min(...depois) - verbo) : 0,
        dito: p.length, perto: perto.has(nn) ? 1 : 0, exato: p === nn ? 1 : 0, longo: n.length,
      };
      if (!melhor || ganha(placar, melhor)) { melhor = placar; achado = n; }
    }
  }
  return achado;
}

/* Os verbos que fazem de uma frase uma PROCURA. "Onde está Ione" e "pergunto
   por Ione" contam; "mato Ione" não — a frase nomeia alguém, mas o que ela
   pede não é achar. */
const VERBOS = /\b(procur|busc|pergunt|onde (esta|está|anda|para|foi)|sinais? de|rastro de|pista de|atras de|atrás de|not[ií]cias? de|paradeiro|encontr|acho ela|acho ele|localiz|indag|investigo o sumi)/;

/* A PROCURA NÃO PÕE NINGUÉM ONDE A CENA JÁ DISSE OUTRA COISA (12/10, MM11 ·
   8.ª sessão, M8 e M13). "Deixo Ursa e vou até a banca do Martelo Velho.
   Pergunto ao ferreiro…" resolveu uma procura por Ursa — a prisioneira que
   a prosa deixara na cela — e respondeu "Ursa o Andarilho está aqui — O
   Armazém do Silêncio". "…volto às Celas Trêmulas com Freya. Procuro Nyla,
   a carcereira" respondeu "Nyla está aqui — A Serpente & o Elmo": a procura
   corre ANTES do passo, e o "aqui" era a taverna de onde a heroína saía.
   Duas regras:
     · `ida`: a frase que vai a outro sítio ANTES de procurar não é uma
       procura daqui — quem lá está di-lo a cena da chegada (e a guarda do
       vasculhar, `ehPessoaConhecida`, continua a ler o nome);
     · `deixa`: o nome logo depois de um verbo de deixar não é procurado. */
export const PROCURA_NAO_E_AQUI = {
  ida: /\b(vou|vamos|volto|voltamos|sigo|seguimos|entro|entramos|subo|subimos|desco|descemos|parto|partimos|regresso|regressamos|retorno|retornamos|caminho|caminhamos|atravesso|atravessamos|corro|corremos|me dirijo|nos dirigimos)\s+(?:[a-z]+\s+){0,2}?(a|ao|aos|as|ate|para|pra|em|no|na|nos|nas)\s/g,
  deixa: /\b(deixo|deixamos|largo|largamos|abandono|abandonamos|me despeco de|despeco-me de|saio de perto de)\s+(?:(?:o|a|os|as)\s+)?$/,
  /* 13/10 (a 10.ª sessão, M22): "Pergunto a Torvald se alguém assim vive por
     aqui" — quem ouve a pergunta só é o procurado se não houver outro nome
     (o placar dava-lhe o aposVerbo: o primeiro verbo da procura era o
     "pergunto"); é a chave naoOuve de PLACAR_DA_PROCURA */
  destinatario: /\b(pergunto|perguntamos|indago)\s+(?:a|ao|aos|as|para|pra)\s+(?:(?:o|a|os|as)\s+)?$/,
};
/* a frase vai a outro sítio antes do primeiro verbo de procura? */
function vaiAntesDeProcurar(t) {
  const mv = VERBOS.exec(t);
  if (!mv) return false;
  const rx = new RegExp(PROCURA_NAO_E_AQUI.ida.source, "g");
  let m;
  while ((m = rx.exec(t))) {
    if (m.index >= mv.index) break;
    if (!VERBOS.test(m[0])) return true;
  }
  return false;
}
export function ehProcura(texto) {
  const t = norm(texto);
  return VERBOS.test(t) && !vaiAntesDeProcurar(t);
}

/* ---------------- QUEM SE PROCURA PELO PAPEL (9.ª sessão de prova, 12/10) ----------------
   "Cresci na guilda dos dedos. Procuro meu antigo mestre de recados, que
   devia estar aqui em Buraco Norte" (M47). O sistema sabia quem era — o
   elo do núcleo, Oren Trançado, `eraDoHeroi` "o mestre de recados da
   guilda", a viver ali mesmo — e a procura só lia NOMES: a frase não tinha
   nenhum, e o Mestre inventou "o velho que foi para Vau de Pedra". O
   jogador perguntou pelo mesmo papel quatro vezes na sessão.
   A frase que nomeia o elo pelas palavras do passado do herói
   (`PROCURA_DO_ELO`, nucleo.js — todas as raízes de uma alternativa, no
   começo de palavra) resolve-se para ele: devolve { nome, papel, cidade },
   e o App passa-o a `procurarPessoa` em `ctx.porPapel`. O papel ganha ao
   nome dito: "pergunto à Dara quem leva os recados da guilda" procura o
   mestre de recados, não a Dara. Morto ou sem elo: null. */
/* A FRASE DA PROCURA, NÃO A FALA INTEIRA (13/10, a 10.ª sessão de prova,
   M38). "Digo ao arquivista que servi na guerra e que tenho direito aos
   papéis da minha companhia. Enquanto ele hesita, examino as estantes…
   procurando com cuidado qualquer papel escondido" achou a HELGA ("Procurei
   Helga, e ESTÁ AQUI"): "companhia" e "guerra" estavam na primeira frase, e
   o verbo da procura na segunda, a falar de um papel. As raízes do papel
   contam só na frase (`PROCURA_PELO_PAPEL_NA_FRASE.corte`) que tem o verbo
   da procura; o que vem logo depois do verbo e é COISA (`coisa`) não é
   gente; e a frase que nomeia quem anda com o herói fala dele, não do elo
   ("procuro com a Saoirse, a minha antiga companheira…"). */
export const PROCURA_PELO_PAPEL_NA_FRASE = {
  corte: /[.!?;\n]+/,
  coisa: /\b(procur\w*|busc\w*)\s+(?:com cuidado\s+|entao\s+|tambem\s+)?(o que|algo|alguma coisa|qualquer|um papel|uns papeis|papel|papeis|registros?|documentos?|livros?|cartas?|a carta|o mapa|a chave|pistas?)\b/,
};
export function papelProcurado(texto, nucleo) {
  const n = nucleo && typeof nucleo === "object" ? nucleo : {};
  const elo = (Array.isArray(n.pessoas) ? n.pessoas : []).find((p) => p && p.papel === "elo" && p.nome && !p.morto);
  if (!elo) return null;
  const alts = PROCURA_DO_ELO[n.antecedente] || PROCURA_DO_ELO.sem;
  const comp = (Array.isArray(n.pessoas) ? n.pessoas : []).filter((p) => p && p.papel === "companheiro" && p.nome).map((p) => norm(String(p.nome)).split(/\s+/)[0]).filter((w) => w.length >= 3);
  const frases = String(texto == null ? "" : texto).split(PROCURA_PELO_PAPEL_NA_FRASE.corte).map((f) => norm(f)).filter((f) => f && VERBOS.test(f));
  const casa = frases.some((f) => {
    if (PROCURA_PELO_PAPEL_NA_FRASE.coisa.test(f)) return false;
    const t = ` ${f.replace(/[^a-z0-9]+/g, " ")} `;
    if (comp.some((w) => t.includes(` ${w} `))) return false;
    const tem = (raiz) => t.includes(` ${norm(raiz)}`);
    return alts.some((a) => Array.isArray(a) && a.length && a.every(tem));
  });
  if (!casa) return null;
  return { nome: String(elo.nome), papel: String(elo.eraDoHeroi || ""), cidade: String(elo.cidade || "") };
}

/* ---------------- A PORTA DA PROCURA (13/10, a 10.ª sessão de prova) ----------------
   A procura de gente mora na porta do desafio, antes do catálogo — e a
   porta só abria quando o catálogo achava um desafio na frase. "Procuro
   Nyla Punho-de-Pedra" (o verbo do Códice), "procuro meu antigo companheiro
   de armas" e "onde posso encontrá-la" não são desafio nenhum: o turno ia
   ao Mestre sem a resposta do mundo, e o Mestre inventou (uma briga, um
   avistamento). `procuraDeGente` é o sinal da porta (turno.js,
   `ehProcuraDeGente`): a frase procura (`ehProcura`), com um verbo que
   BUSCA (`PROCURA_DE_GENTE.busca` — "pergunto ao Godfrey quem é a Nyla" é
   conversa, e continua a ser) e nomeia alguém que o jogo conhece, pelo nome
   (`nomes`, a mesma lista que o App dá a `nomeProcurado`) ou pelo papel do
   passado do herói (`nucleo`). */
export const PROCURA_DE_GENTE = {
  busca: /\b(procur|busc|onde (esta|anda|para|foi|posso encontr|encontro|acho)|paradeiro|encontr|localiz|rastro de|pista de|sinais? de|noticias? de)/,
};
export function procuraDeGente(texto, ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const t = norm(texto);
  if (!t || !ehProcura(texto) || !PROCURA_DE_GENTE.busca.test(t)) return false;
  try { if (papelProcurado(texto, c.nucleo)) return true; } catch { /* nunca custa o turno */ }
  let nome = "";
  try { nome = nomeProcurado(texto, Array.isArray(c.nomes) ? c.nomes : [], { perto: Array.isArray(c.perto) ? c.perto : [] }); } catch { nome = ""; }
  return !!nome;
}

/* ---------------- ONDE ELA ESTÁ ----------------
   Cinco degraus, do mais perto ao mais longe, e o primeiro que responder
   ganha. A ordem é a da certeza: quem está na sua frente vale mais do que
   quem a base diz que mora aqui. */
export function procurarPessoa(nome, ctx = {}) {
  const r = procurarPeloNome(nome, ctx);
  /* F2d (12/10, fichas.js): a pessoa que tem página na memória do herói
     ("procuro Oren", fora de cena) e que o mundo não acha — fora do registo,
     da base e da espinha, como o elo do núcleo antes de ser apresentado —
     está onde o herói a viu por último. O registo continua a ganhar: a
     memória só responde ao "ninguém". */
  const dm = ctx && typeof ctx === "object" && ctx.daMemoria && typeof ctx.daMemoria === "object" ? ctx.daMemoria : null;
  if (r && dm && dm.cidade && r.desfecho === "ninguem" && norm(dm.nome) === norm(nome)) {
    const c = ctx || {};
    const aqui = norm(dm.cidade) === norm(c.cidadeAtual);
    const comPapel = dm.papel ? { papel: String(dm.papel) } : {};
    return aqui
      ? { ...r, nome: String(dm.nome), onde: dm.cidade, desfecho: "aqui", ...comPapel }
      : { ...r, nome: String(dm.nome), onde: dm.cidade, desfecho: "noutro_lugar", ...comPapel, ...rumoPara(c.mapa, dm.cidade, { cidadeAtual: c.cidadeAtual, coord: c.coord, lugar: c.lugar, jornada: c.jornada }) };
  }
  /* 9.ª sessão: procurado pelo papel (`papelProcurado`) — a resposta diz
     de quem se trata, e quem o mundo não acha está onde o núcleo o põe */
  const pp = ctx && typeof ctx === "object" && ctx.porPapel && typeof ctx.porPapel === "object" ? ctx.porPapel : null;
  if (!r || !pp || !pp.papel) return r;
  if (r.desfecho === "ninguem" && pp.cidade) {
    const c = ctx || {};
    const aqui = norm(pp.cidade) === norm(c.cidadeAtual);
    return aqui
      ? { ...r, onde: pp.cidade, desfecho: "aqui", porPapel: pp.papel }
      : { ...r, onde: pp.cidade, desfecho: "noutro_lugar", porPapel: pp.papel, ...rumoPara(c.mapa, pp.cidade, { cidadeAtual: c.cidadeAtual, coord: c.coord, lugar: c.lugar, jornada: c.jornada }) };
  }
  return { ...r, porPapel: pp.papel };
}
function procurarPeloNome(nome, ctx = {}) {
  const alvo = norm(nome);
  if (!alvo) return null;
  const {
    npcs = {}, grupo = [], genteDaqui = [], espinha = null, base = null,
    cidadeAtual = "", lugarAtual = "", mapa = null, presentes = [],
  } = ctx && typeof ctx === "object" ? ctx : {};
  /* E1: de ONDE o herói está (o ponto do rastreio, o lugar, a jornada) — os
     mesmos três que o Geógrafo recebe para a linha "não entra nesta cena" */
  const origem = { cidadeAtual, coord: ctx && ctx.coord, lugar: ctx && ctx.lugar, jornada: ctx && ctx.jornada };

  const sit = base ? situacaoDe(base, nome) : SITUACOES.livre;
  const casa = (x) => x && norm(x).includes(alvo);
  /* quem nao aparece so porque voce entrou e olhou em volta */
  const escondida = (x) => x === SITUACOES.escondida || x === SITUACOES.cativa;

  /* 1 — no grupo: anda com você, e procurar quem anda com você é uma
     pergunta que o sistema responde na hora, sem cena */
  if ((grupo || []).some((g) => casa(g && g.nome))) {
    return { nome, onde: "no seu grupo", situacao: sit, desfecho: "no_grupo" };
  }

  /* 2 — presente na cena */
  if ((presentes || []).some((p) => casa(p && (p.nome || p)))) {
    return { nome, onde: lugarAtual || cidadeAtual, situacao: sit, desfecho: escondida(sit) ? "aqui_escondida" : "aqui" };
  }

  /* 3 — morta. Vem antes do resto porque nenhuma outra resposta importa
     depois dela, e porque uma procura por quem morreu que devolvesse "não
     está aqui" seria uma crueldade acidental do sistema. */
  if (sit === SITUACOES.morta) {
    const n = Object.values(npcs || {}).find((x) => casa(x && x.nome)) || null;
    return { nome, onde: (n && n.local) || "", situacao: sit, desfecho: "morta" };
  }

  /* 4 — no elenco: o jogo sabe quem é e onde foi vista pela última vez */
  const noElenco = Object.values(npcs || {}).find((x) => casa(x && x.nome));
  if (noElenco) {
    const aqui = casa(noElenco.local) || norm(noElenco.local) === norm(cidadeAtual) || norm(noElenco.local) === norm(lugarAtual);
    if (aqui || !noElenco.local) {
      return { nome: noElenco.nome, onde: noElenco.local || cidadeAtual, papel: noElenco.papel || "", situacao: sit, desfecho: escondida(sit) ? "aqui_escondida" : "aqui" };
    }
    return { nome: noElenco.nome, onde: noElenco.local, papel: noElenco.papel || "", situacao: sit, desfecho: "noutro_lugar", ...rumoPara(mapa, noElenco.local, origem) };
  }

  /* 5 — gente da base desta cidade: existe aqui e ainda não foi apresentada */
  const daBase = (genteDaqui || []).find((p) => casa(p && p.nome));
  if (daBase) {
    /* a situacao manda mesmo aqui: a sonda achou uma CATIVA "sem
       dificuldade", porque este degrau devolvia `aqui` sem olhar o estado.
       Quem esta presa nao e encontrada por quem entra e olha em volta. */
    return { nome: daBase.nome, onde: daBase.local || cidadeAtual, papel: daBase.papel || "", situacao: sit, desfecho: escondida(sit) ? "aqui_escondida" : "aqui" };
  }

  /* 6 — prometida pela espinha: existe no mundo, em outro canto */
  /* nexo (11/10): e A CIDADE. "Noé está em Rua dos Retalhos" não dizia em
     que terra ficava a rua, e o Narrador pô-la duas vezes na cidade onde o
     herói estava (4.ª sessão, contradição 8). A espinha nova guarda a cidade
     do marco; com ela, o onde diz a rua E a cidade, e o rumo sai da cidade
     (o nome de uma rua não está no mapa). A espinha antiga fica como era. */
  const doMarco = marcoComNome(espinha, alvo);
  if (doMarco) {
    const naCidade = doMarco.cidade && norm(doMarco.cidade) !== norm(doMarco.onde);
    return { nome: doMarco.quem || doMarco.alvo, onde: naCidade ? `${doMarco.onde}, em ${doMarco.cidade}` : doMarco.onde, situacao: sit, desfecho: "noutro_lugar", ...rumoPara(mapa, doMarco.cidade || doMarco.onde, origem) };
  }

  /* 7 — ninguém. E isto é resposta, não fracasso. */
  return { nome, onde: "", situacao: sit, desfecho: "ninguem" };
}

/* nexo (11/10): o nome INTEIRO primeiro. Por pedaço, "Vex" achava "Vex
   Valdez", um marco antes, e a procura mandava o herói à cidade do outro —
   3 em 227 procuras de 40 campanhas. Só sem nome inteiro vale o pedaço. */
function marcoComNome(espinha, alvo) {
  const atos = (espinha && espinha.atos) || [];
  const vivos = atos.flatMap((a) => a.marcos || []).filter((m) => m && !m.feito);
  return vivos.find((m) => norm(m.quem) === alvo || norm(m.alvo) === alvo)
    || vivos.find((m) => norm(m.quem).includes(alvo) || norm(m.alvo).includes(alvo))
    || null;
}

/* O rumo e a distância saem das coordenadas que o mundo já tem. Sem cidade
   conhecida dos dois lados não há rumo, e a resposta fica só com o nome do
   lugar — que continua sendo mais do que "você não achou nada".

   UMA MEDIDA SÓ (o Narrador só narra · E1, 12/10). Na 6.ª sessão (M30) a
   mesma pauta disse Serra do Bode a "6,6 km, a 2,1 h a pé" (o Geógrafo, do
   ponto do herói) e a "13 km" (esta procura, do centro da cidade de onde se
   partira, por uma conta própria — `hypot × 25`), e a jornada contava 20 km
   e 8 h. O Narrador ficou com "meio dia de marcha". Agora a distância é a
   do Geógrafo (`kmEntre`, do ponto do herói quando o App o passa — senão
   da cidade) e a hora é a da conta única (`caminhoNaRegiao` a partir de
   `origemDoHeroi`, marcha.js) — as duas mesmas funções da linha "não entra
   nesta cena sem…" (`quemNaoChega`, geografo.js). Sem região, só a
   distância, como antes. */
function rumoPara(mapa, paraNome, origem) {
  const o = origem && typeof origem === "object" ? origem : {};
  const cidades = (mapa && mapa.cidades) || [];
  const acha = (n) => cidades.find((c) => norm(c.nome) === norm(n)) || cidades.find((c) => norm(n).includes(norm(c.nome)));
  const a = acha(o.cidadeAtual), b = acha(paraNome);
  if (!b || a === b) return {};
  const ca = garantirCoord(o.coord) || (a ? coordDe(a) : null), cb = coordDe(b);
  if (!ca || !cb) return {};
  const r = rumoEntre(ca, cb);
  /* `rumoEntre` devolve o RUMO inteiro — id, curto, rotulo e graus. O que
     entra numa frase e o rotulo ("a nordeste"); jogar o objeto no texto
     escrevia `[object Object]` na cara do jogador. */
  let tempo = "";
  try {
    const de = origemDoHeroi(mapa, { cidadeAtual: o.cidadeAtual, lugar: o.lugar, jornada: o.jornada, ponto: o.coord });
    const c = de != null ? caminhoNaRegiao(mapa, de, b.nome) : null;
    tempo = c ? tempoDoCaminho(c) : "";
  } catch { tempo = ""; }
  return { rumo: (r && r.rotulo) || "", distancia: formatarDistancia(kmEntre(ca, cb)), ...(tempo ? { tempo } : {}) };
}

/* ---------------- O QUE O NARRADOR RECEBE ----------------
   Fato fechado, como todo envelope desta casa: o sistema já decidiu onde a
   pessoa está, e o Narrador conta como o herói descobre. */
export function envelopeDaProcura(r) {
  if (!r) return "";
  const onde = r.onde ? ` (${r.onde})` : "";
  /* E1: o rótulo do rumo já traz a preposição ("ao sul") — "para ao sul" saía torto */
  const rumo = r.rumo ? ` a ${r.distancia} ${r.rumo}${r.tempo ? `, ${r.tempo} daqui` : ""}` : "";
  /* 9.ª sessão: quem foi procurado pelo papel é dito pelo nome, em fato */
  const cabeca = `[PROCURA — RESOLVIDA PELO SISTEMA]${r.porPapel ? encherPapel(PROCURA_PELO_PAPEL.envelope, r) : ""}`;
  const fim = " Narre a descoberta em 1-2 frases, pelo que o herói vê e ouve. NÃO invente outro paradeiro, não faça aparecer quem não está aqui, e não transforme isto em achado de tesouro.";
  switch (r.desfecho) {
    case "no_grupo": return `${cabeca} ${r.nome} anda comigo — está aqui do meu lado.${fim}`;
    case "aqui": return `${cabeca} Procurei ${r.nome}, e ESTÁ AQUI${onde}${r.papel ? `, ${r.papel}` : ""}. Encontrei sem dificuldade.${fim}`;
    case "aqui_escondida": return `${cabeca} ${r.nome} está aqui${onde}, mas ${r.situacao === SITUACOES.cativa ? "não está livre para aparecer" : "não quer aparecer"}. Chegar até lá exige o teste que o sistema já pediu — narre a procura, não o encontro.${fim}`;
    case "noutro_lugar": return `${cabeca} ${r.nome} NÃO está aqui. O que se apura é que está em ${r.onde}${rumo}. Diga isso pela boca de quem responderia — ninguém aqui sabe mais do que isso.${fim}`;
    case "morta": return `${cabeca} ${r.nome} MORREU${onde}, e isso já é fato do mundo. Não traga de volta com vida por engano nem sugira que possa estar enganado.${fim}`;
    default: return `${cabeca} Procurei ${r.nome} e NINGUÉM com esse nome passou por aqui — não há rastro, e quem eu perguntei não conhece o nome. Isto é o que o mundo tem a dizer: não invente uma pista, não mande o herói a lugar nenhum e não transforme a procura em outra coisa.${fim}`;
  }
}

/* 9.ª sessão (12/10): a frase do procurado pelo papel — no envelope (o
   Narrador recebe o nome que o sistema sabe, como fato) e na linha que o
   jogador lê (o papel ao lado do nome, para ele ligar os dois) */
export const PROCURA_PELO_PAPEL = {
  envelope: " Quem procuro — {papel}, do meu passado — chama-se {nome} (é fato: conheço essa pessoa de antes, e quem me responde pode dizer-lhe o nome).",
  linha: "{nome} ({papel})",
};
const encherPapel = (tpl, r) => String(tpl).replace(/\{(papel|nome)\}/g, (m, k) => String((k === "papel" ? r.porPapel : r.nome) || ""));

export function linhaDaProcura(r0) {
  if (!r0) return "";
  const r = r0.porPapel ? { ...r0, nome: encherPapel(PROCURA_PELO_PAPEL.linha, r0) } : r0;
  switch (r.desfecho) {
    case "no_grupo": return `👥 ${r.nome} anda com você.`;
    case "aqui": return `🔎 ${r.nome} está aqui${r.onde ? ` — ${r.onde}` : ""}.`;
    case "aqui_escondida": return `🔎 ${r.nome} está por aqui, mas não à vista.`;
    case "noutro_lugar": return `🧭 ${r.nome} está em ${r.onde}${r.rumo ? ` — ${r.distancia} ${r.rumo}${r.tempo ? `, ${r.tempo}` : ""}` : ""}.`;
    case "morta": return `☠ ${r.nome} morreu${r.onde ? ` — ${r.onde}` : ""}.`;
    default: return `🔎 Ninguém com o nome de ${r.nome} passou por aqui.`;
  }
}

/* Só a procura ESCONDIDA precisa de dado: as outras quatro são o mundo
   respondendo, e o mundo não rola dado para dizer o que já sabe. */
export function pedeDado(r) { return !!r && r.desfecho === "aqui_escondida"; }
