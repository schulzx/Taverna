/* ============================================================
   O GATILHO DO CRONISTA (onda 1 do custo do turno, 13/10/2026)

   O Cronista é a segunda chamada de cada turno: lê a narração e diz ao
   sistema o que registrar (quem apareceu, onde o herói ficou, o que se
   prometeu, o trabalho que alguém ofereceu). Corria em TODO turno — 78
   leituras em 79 turnos na 10.ª sessão — e voltava vazio na maioria:
   nas sessões 8–10, 114 de 197 leituras não registaram nada novo
   (mente/custo-do-turno.md, desperdício 5).

   Este módulo decide, por código e sem chamada nenhuma, se a leitura
   corre AGORA. E o que decide não ler não se perde: a narração fica na
   fila e vai junto na próxima leitura — que acontece o mais tardar no
   terceiro turno (a rede). O gatilho escolhe a HORA da leitura, nunca se
   a narração é lida.

   ---------------- O QUE NÃO PODE ESPERAR ----------------

   Há registro que vale no próprio turno, e é ele que acende o gatilho:
   · o LUGAR — o jogador se moveu (pela frase, ou por um envelope de
     movimento/viagem/chegada): o Cronista é a rede do teleporte;
   · GENTE NOVA — um nome próprio que o sistema ainda não conhece, e que
     o Narrador vai precisar de ter no registo já no turno seguinte;
   · a LUTA — com combatentes de pé, a guarda de coesão (o morto que o
     sistema mantém vivo) não pode chegar atrasada;
   · a FÉ — de um herói desperto, que se mede por turno;
   · o GRUPO, o TRABALHO OFERECIDO, a PROMESSA DITA em voz alta.

   O que pode esperar dois turnos sem mentir: a semente que o Narrador
   plantou numa fala (cobrada dez turnos depois), o objeto que vira
   cânone. É isso que a fila carrega.

   Determinista: a mesma narração, a mesma frase e o mesmo registo dão
   sempre a mesma decisão. Nada de rede, de relógio nem de sorte.
   ============================================================ */

const txt = (s) => String(s == null ? "" : s);
const norm = (s) => txt(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const lista = (x) => (Array.isArray(x) ? x : []);

/* A rede e os tetos. `pulosMax` é quantos turnos seguidos o Cronista
   pode ficar sem ler: no terceiro ele lê, com a fila. */
export const REDE_DO_CRONISTA = {
  pulosMax: 2,
  /* as narrações na fila (sem a do turno): a rede garante que nunca passam
     de `pulosMax`, e o teto é a cerca para um estado vindo de fora */
  filaMax: 2,
  /* cada narração da fila, cortada: a do turno vai inteira */
  letrasPorNarrativa: 2400,
  /* os nomes já vistos, para o mesmo nome não acender o gatilho duas vezes */
  vistosMax: 300,
  letrasDoNome: 40,
};

/* ---------------- OS GATILHOS DE TEXTO ----------------
   `onde`: "frase" (o que o jogador escreveu), "narrativa" (o que o
   Narrador respondeu), "texto" (os dois) ou "envelopes" (o cabeçalho de
   cada envelope do sistema neste turno). `de` diz que secção do Cronista
   precisa do turno — para quem ler o relato saber por que acendeu. */
const G = (id, onde, rx, de) => ({ id, onde, rx, de });
/* palavra inteira em português: o \b do JavaScript não conhece o "ê" de
   "você" nem o "ç" de "serviço", e falharia calado justo neles */
const P = (alts) => new RegExp(`(?<![\\p{L}])(${alts})(?![\\p{L}])`, "iu");
export const GATILHOS_DO_CRONISTA = [
  G("movimento", "frase",
    /* o verbo que já é deslocamento, ou o "vou/sigo/levo" com destino:
       "vou perguntar" não move ninguém, "vou até a forja" move */
    P("entro|entramos|saio|sa[ií]mos|subo|subimos|des[cç]o|descemos|volto|voltamos|atravesso|atravessamos|parto|partimos|fujo|fugimos|embarco|desembarco|retorno|retornamos|me afasto|escalo|(?:sigo|seguimos|vou|vamos|caminho|caminhamos|corro|corremos|ando|avan[cç]o|levo|levamos|puxo|guio)[^.!?\\n]{0,40}?\\s(?:até|para|pela|pelo|ao|à|aos|às|rumo|de volta|em direção)"),
    "lugar"),
  /* o passo que a NARRAÇÃO deu ("você desce ao porão"): é exatamente o
     que ninguém registou, e o que a rede do lugar existe para apanhar */
  G("passo", "narrativa",
    P("voc[eê]s? (?:j[aá] )?(?:entra|entram|sai|saem|desce|descem|sobe|sobem|atravessa|atravessam|chega|chegam|volta|voltam|segue|seguem|cruza|cruzam|alcan[cç]a|alcan[cç]am)"),
    "lugar"),
  /* o começo de campanha e a volta a ela: a cena inteira é nova */
  G("cena", "envelopes", /^\[(ABERTURA|RETOMADA)/, "canone"),
  G("grupo", "texto",
    P("vou com voc[eê]|vamos juntos|conte comigo|venha comigo|vem comigo|me junto|junte-se|juntar-se|acompanh(o|ar|a-lo|á-lo|a-la|á-la)|aceito ir"),
    "grupo"),
  G("trabalho", "narrativa",
    P("pago bem|pagarei|pago-lhe|paga-se|recompensa|servi[cç]o|trabalho para|um trabalho|contrato|preciso que (voc[eê]|algu[eé]m)|quem trouxer|quem achar"),
    "missao_oferecida"),
  G("promessa", "texto",
    P("prometo|prometeu|prometi|promessa|juro|jurou|jurei|jura|d[ií]vida|devo-lhe|me deve|te devo|vingan[cç]a"),
    "promessas"),
];

/* Os envelopes em que o próprio sistema mudou o herói de lugar (e o
   disse ao Narrador): com um deles no turno, a frase de movimento já
   está registada e não acende o gatilho. */
export const SISTEMA_MOVEU = /^\[(MOVIMENTO|VIAGEM|CHEGADA|PARTIDA|MASMORRA|ACAMPAMENTO|FIM DO ACAMPAMENTO|ONDE ACORDO|EMBOSCADA|LUGAR|DESTINO|FUGA|PROCURA)/;

/* ---------------- OS NOMES PRÓPRIOS ----------------
   Uma sequência de palavras com maiúscula ("Brannoc", "Petra Guarda-
   Portão", "Ordem dos Esquecidos") que NÃO abre frase nem fala: no
   começo de frase o português põe maiúscula em qualquer palavra
   ("Cobram", "Passem"), e contar essas seria acender o gatilho em todo
   turno. O nome que só aparece abrindo frase quase sempre aparece de
   novo no meio de outra — e é aí que ele é apanhado. */
const MAI = "A-ZÁÉÍÓÚÂÊÔÃÕÇÀ";
const MIN = "a-záéíóúâêôãõçàü";
const RX_NOME = new RegExp(`[${MAI}][${MIN}]+(?:(?: (?:d[aeo]s?|e) | |-)[${MAI}][${MIN}]+)*`, "g");
const ABRE_FRASE = /[.!?:;—–\-"“”«»(\n…]$/;
/* as palavras que a prosa põe com maiúscula fora do começo de frase (depois
   de um travessão sem ponto, de reticências coladas) e que nunca são nome */
export const NAO_SAO_NOMES = new Set(["a", "o", "as", "os", "um", "uma", "uns", "umas", "ela", "ele", "elas", "eles", "eu", "voce", "voces", "nos", "la", "aqui", "ali", "ao", "aos", "antes", "depois", "atras", "agora", "entao", "mas", "e", "se", "nao", "sim", "quem", "que", "onde", "como", "quando", "isso", "isto", "aquilo", "esse", "essa", "este", "esta", "senhor", "senhora", "dona", "mestre", "deus", "deuses"]);

export function nomesProprios(texto) {
  const t = txt(texto);
  const out = [];
  RX_NOME.lastIndex = 0;
  let m;
  while ((m = RX_NOME.exec(t))) {
    const antes = t.slice(0, m.index);
    if (antes && /[^\s]/.test(antes.slice(-1))) continue; /* colado a outra letra: não é começo de palavra */
    const pre = antes.replace(/\s+$/, "");
    if (!pre || ABRE_FRASE.test(pre)) continue;
    if (NAO_SAO_NOMES.has(norm(m[0]))) continue;
    const n = m[0].slice(0, REDE_DO_CRONISTA.letrasDoNome);
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

/* um nome é conhecido se é, contém ou está contido num nome conhecido
   ("Nyla" e "Nyla Punho-de-Pedra" são a mesma pessoa) */
function conhecido(nome, conhecidos) {
  const n = norm(nome);
  if (!n) return true;
  for (const k of conhecidos) {
    if (!k) continue;
    if (k === n) return true;
    if (k.length >= 3 && n.length >= 3 && (k.includes(n) || n.includes(k))) return true;
  }
  return false;
}

/* ---------------- A LEITURA (um campo novo do save, `leituraDoCronista`) ----------------
   { pulos, fila: [narrativas], vistos: [nomes normalizados] }. A versão
   antiga ignora o campo; um save sem ele começa vazio. Lixo não estoura. */
export function garantirLeitura(estado) {
  const o = estado && typeof estado === "object" && !Array.isArray(estado) ? estado : {};
  const R = REDE_DO_CRONISTA;
  const pulos = Number.isFinite(Number(o.pulos)) && Number(o.pulos) > 0 ? Math.min(Math.floor(Number(o.pulos)), R.pulosMax) : 0;
  const fila = lista(o.fila).filter((x) => typeof x === "string" && x.trim()).map((x) => x.slice(0, R.letrasPorNarrativa)).slice(-R.filaMax);
  const vistos = lista(o.vistos).filter((x) => typeof x === "string" && x).map((x) => x.slice(0, R.letrasDoNome)).slice(-R.vistosMax);
  return { pulos, fila, vistos };
}

/* ---------------- A DECISÃO ----------------
   Entra o turno: a narração, a frase do jogador (vazia no turno do
   sistema), as linhas dos envelopes, os nomes que o sistema já conhece
   (o elenco, o cânone, o mapa, o grupo, o herói), se há luta de pé e se
   o herói é um deus desperto. Sai `{ corre, motivos, novos }`: `motivos`
   são os ids que acenderam (vazio quando não corre), `novos` os nomes
   que o registo não conhecia. */
export function decidirOCronista(turno, estado) {
  const o = turno && typeof turno === "object" ? turno : {};
  const leitura = garantirLeitura(estado);
  const narrativa = txt(o.narrativa);
  const frase = txt(o.frase);
  const envelopes = lista(o.envelopes).map(txt).map((l) => l.trimStart()).filter((l) => l.startsWith("["));
  const motivos = [];
  const onde = { frase, narrativa, texto: `${frase}\n${narrativa}` };
  for (const g of GATILHOS_DO_CRONISTA) {
    const acende = g.onde === "envelopes" ? envelopes.some((l) => g.rx.test(l)) : g.rx.test(onde[g.onde] || "");
    if (acende) motivos.push(g.id);
  }
  /* o movimento que o SISTEMA já registou não precisa da rede: o Cronista
     é quem apanha o passo que ninguém registou */
  if (motivos.includes("movimento") && envelopes.some((l) => SISTEMA_MOVEU.test(l))) motivos.splice(motivos.indexOf("movimento"), 1);
  const conhecidos = [...lista(o.conhecidos), ...leitura.vistos].map(norm).filter(Boolean);
  const novos = nomesProprios(narrativa).filter((n) => !conhecido(n, conhecidos));
  if (novos.length) motivos.push("nome");
  if (o.emLuta) motivos.push("luta");
  if (o.fe) motivos.push("fe");
  if (leitura.pulos >= REDE_DO_CRONISTA.pulosMax) motivos.push("rede");
  return { corre: motivos.length > 0, motivos, novos };
}

/* O turno que não leu: a narração entra na fila e o pulo conta. */
export function pularALeitura(estado, narrativa) {
  const l = garantirLeitura(estado);
  const n = txt(narrativa).trim();
  return garantirLeitura({ ...l, pulos: l.pulos + 1, fila: n ? [...l.fila, n] : l.fila });
}

/* O turno que leu (e só depois de a resposta chegar — leitura que falhou
   não esvazia a fila): a fila zera, e os nomes da narração do turno e da
   fila passam a vistos. */
export function lerALeitura(estado, narrativa) {
  const l = garantirLeitura(estado);
  const nomes = [...l.fila, txt(narrativa)].flatMap(nomesProprios).map(norm).filter(Boolean);
  const vistos = [...l.vistos.filter((v) => !nomes.includes(v)), ...new Set(nomes)];
  return garantirLeitura({ pulos: 0, fila: [], vistos });
}

/* O bloco que a fila põe no pedido ao Cronista, antes da narração do
   turno. Vazio quando não há fila. O lugar, o teste e a luta são do
   turno; o resto vale para a fila também. */
export function blocoDaFila(estado) {
  const l = garantirLeitura(estado);
  if (!l.fila.length) return "";
  return `NARRATIVAS ANTERIORES AINDA NÃO LIDAS (mais antiga primeiro; registre delas o cânone, as pessoas, as promessas, falou_com, o grupo e o trabalho oferecido; "lugar", "teste_sugerido" e "combate" são SÓ da narrativa do turno):\n${l.fila.map((n, i) => `(${i + 1}) ${n}`).join("\n\n")}\n\n`;
}
