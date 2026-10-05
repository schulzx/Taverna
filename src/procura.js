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
import { rumoEntre, formatarDistancia, coordDe } from "./coordenadas.js";

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
     · `aposVerbo`/`junto`: quem vem logo depois do verbo da procura
       ("procuro a Lourdes") — a companhia dita antes não é o procurado.
       Frase sem verbo (o "Lina," de `pessoaNaFrente`): não pesa;
     · `dito`: o pedaço mais longo que a frase diz ("Lourdes Ferreira"
       dito inteiro continua a ser ela);
     · `perto`: quem está no grupo ou na cena (`perto`) — a procura que
       só diz o primeiro nome nunca escolhe a homónima de quem está ao lado;
     · `exato`: quem se chama exatamente assim;
     · `longo`: o nome mais longo, como antes. */
export const PLACAR_DA_PROCURA = ["aposVerbo", "junto", "dito", "perto", "exato", "longo"];
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
      const posicoes = [...t.matchAll(rx)].map((m) => m.index + m[1].length);
      if (!posicoes.length) continue;
      const depois = posicoes.filter((x) => x >= verbo);
      const apos = verbo >= 0 && depois.length ? 1 : 0;
      const placar = {
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
export function ehProcura(texto) { return VERBOS.test(norm(texto)); }

/* ---------------- ONDE ELA ESTÁ ----------------
   Cinco degraus, do mais perto ao mais longe, e o primeiro que responder
   ganha. A ordem é a da certeza: quem está na sua frente vale mais do que
   quem a base diz que mora aqui. */
export function procurarPessoa(nome, ctx = {}) {
  const alvo = norm(nome);
  if (!alvo) return null;
  const {
    npcs = {}, grupo = [], genteDaqui = [], espinha = null, base = null,
    cidadeAtual = "", lugarAtual = "", mapa = null, presentes = [],
  } = ctx;

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
    return { nome: noElenco.nome, onde: noElenco.local, papel: noElenco.papel || "", situacao: sit, desfecho: "noutro_lugar", ...rumoPara(mapa, cidadeAtual, noElenco.local) };
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
  const doMarco = marcoComNome(espinha, alvo);
  if (doMarco) {
    return { nome: doMarco.quem || doMarco.alvo, onde: doMarco.onde, situacao: sit, desfecho: "noutro_lugar", ...rumoPara(mapa, cidadeAtual, doMarco.onde) };
  }

  /* 7 — ninguém. E isto é resposta, não fracasso. */
  return { nome, onde: "", situacao: sit, desfecho: "ninguem" };
}

function marcoComNome(espinha, alvo) {
  const atos = (espinha && espinha.atos) || [];
  for (const a of atos) for (const m of a.marcos || []) {
    if (m.feito) continue;
    if (norm(m.quem).includes(alvo) || norm(m.alvo).includes(alvo)) return m;
  }
  return null;
}

/* O rumo e a distância saem das coordenadas que o mundo já tem. Sem cidade
   conhecida dos dois lados não há rumo, e a resposta fica só com o nome do
   lugar — que continua sendo mais do que "você não achou nada". */
function rumoPara(mapa, deNome, paraNome) {
  const cidades = (mapa && mapa.cidades) || [];
  const acha = (n) => cidades.find((c) => norm(c.nome) === norm(n)) || cidades.find((c) => norm(n).includes(norm(c.nome)));
  const a = acha(deNome), b = acha(paraNome);
  if (!a || !b || a === b) return {};
  const ca = coordDe(a), cb = coordDe(b);
  if (!ca || !cb) return {};
  const r = rumoEntre(ca, cb);
  /* `rumoEntre` devolve o RUMO inteiro — id, curto, rotulo e graus. O que
     entra numa frase e o rotulo ("a nordeste"); jogar o objeto no texto
     escrevia `[object Object]` na cara do jogador. */
  return { rumo: (r && r.rotulo) || "", distancia: formatarDistancia(Math.hypot(cb.x - ca.x, cb.y - ca.y) * 25) };
}

/* ---------------- O QUE O NARRADOR RECEBE ----------------
   Fato fechado, como todo envelope desta casa: o sistema já decidiu onde a
   pessoa está, e o Narrador conta como o herói descobre. */
export function envelopeDaProcura(r) {
  if (!r) return "";
  const onde = r.onde ? ` (${r.onde})` : "";
  const rumo = r.rumo ? ` a ${r.distancia} para ${r.rumo}` : "";
  const cabeca = "[PROCURA — RESOLVIDA PELO SISTEMA]";
  const fim = " Narre a descoberta em 1-2 frases, pelo que o herói vê e ouve. NÃO invente outro paradeiro, não faça a pessoa aparecer se ela não está aqui, e não transforme isto em achado de tesouro.";
  switch (r.desfecho) {
    case "no_grupo": return `${cabeca} ${r.nome} anda comigo — está aqui do meu lado.${fim}`;
    case "aqui": return `${cabeca} Procurei ${r.nome} e ELA ESTÁ AQUI${onde}${r.papel ? `, ${r.papel}` : ""}. Encontrei sem dificuldade.${fim}`;
    case "aqui_escondida": return `${cabeca} ${r.nome} está aqui${onde}, mas ${r.situacao === SITUACOES.cativa ? "não está livre para aparecer" : "não quer ser encontrada"}. Achá-la exige o teste que o sistema já pediu — narre a procura, não o encontro.${fim}`;
    case "noutro_lugar": return `${cabeca} ${r.nome} NÃO está aqui. O que se apura é que ela está em ${r.onde}${rumo}. Diga isso pela boca de quem responderia — ninguém aqui sabe mais do que isso.${fim}`;
    case "morta": return `${cabeca} ${r.nome} está MORTA${onde}, e isso já é fato do mundo. Não a faça aparecer viva por engano nem sugira que possa estar enganado.${fim}`;
    default: return `${cabeca} Procurei ${r.nome} e NINGUÉM com esse nome passou por aqui — não há rastro, e quem eu perguntei não conhece o nome. Isto é o que o mundo tem a dizer: não invente uma pista, não mande o herói a lugar nenhum e não transforme a procura em outra coisa.${fim}`;
  }
}

export function linhaDaProcura(r) {
  if (!r) return "";
  switch (r.desfecho) {
    case "no_grupo": return `👥 ${r.nome} anda com você.`;
    case "aqui": return `🔎 ${r.nome} está aqui${r.onde ? ` — ${r.onde}` : ""}.`;
    case "aqui_escondida": return `🔎 ${r.nome} está por aqui, mas não à vista.`;
    case "noutro_lugar": return `🧭 ${r.nome} está em ${r.onde}${r.rumo ? ` — ${r.distancia} para ${r.rumo}` : ""}.`;
    case "morta": return `☠ ${r.nome} está morta${r.onde ? ` — ${r.onde}` : ""}.`;
    default: return `🔎 Ninguém com o nome de ${r.nome} passou por aqui.`;
  }
}

/* Só a procura ESCONDIDA precisa de dado: as outras quatro são o mundo
   respondendo, e o mundo não rola dado para dizer o que já sabe. */
export function pedeDado(r) { return !!r && r.desfecho === "aqui_escondida"; }
