/* ============================================================
   O INTÉRPRETE GANHA BOCA (v9.135)

   O `interprete.js` decidia o que uma pessoa FAZ e parava ali. O cabeçalho
   dele dizia, com todas as letras:

     "O Intérprete diz O QUE a pessoa FAZ. Nunca o que ela DIZ.
      A fala é do Narrador, sempre, e é onde ele é insubstituível."

   Esta versão move essa linha. E move por um motivo medido, que não é o que
   eu tinha suposto.

   ---------------- O QUE A SONDA MOSTROU, E O QUE NÃO ----------------

   Eu previa que o prompt do Narrador cairia um terço. NÃO CAI: o filtro da
   sonda era grosseiro e arrancava dele o cânone, o bestiário e parte do
   formato da resposta. O que de fato muda de dono são 2.787 caracteres —
   4,8%. O ganho de orçamento é pequeno e não justificaria nada.

   O que a sonda mostrou de verdade foi outra coisa. Pedindo aos dois
   arranjos um campo OBRIGATÓRIO na resposta:

     chamada única, com 58 mil caracteres de instrução ...... 1 de 6
     chamada do ator, com 1,7 mil ........................... 6 de 6

   A chamada grande deixa cair pedaços do contrato. A pequena não. E isto o
   código já sabia: `App.jsx` tem uma rede de segurança que REPETE a chamada
   quando a narrativa volta vazia — o jogo já paga por essa falha hoje.

   ---------------- O QUE ISTO É, E O QUE NÃO É ----------------

   NÃO é um segundo Narrador. É uma segunda BOCA. O ator não decide nada:
   ele recebe quem a pessoa é, o que ela quer, o que ela NUNCA faz e o gesto
   que o sistema já escolheu para ela — e devolve só a fala. Quem costura
   continua sendo o Narrador; quem decide continua sendo o Mestre.

   É por isso que ele não quebra a regra da casa: o Mestre continua sendo
   código, e a IA continua sem decidir o que existe.

   ---------------- O QUE ELE GANHA QUE NINGUÉM TINHA ----------------

   Os vetos por pessoa. `interprete.js` guarda, desde a v9.106, o que cada
   um NUNCA faz — o covarde não ameaça, o sacerdote não ameaça em público, o
   guarda não se esquiva do assunto. Isso governava o GESTO e nunca chegou à
   FALA, porque chegava ao Narrador como uma linha entre dezenas. Agora
   chega como a única coisa que o ator daquela pessoa tem na frente.
   ============================================================ */

/* Duas bocas por turno, no máximo. Três pessoas falando é uma cena que o
   jogador não consegue responder, e cada boca é uma chamada — o teto é de
   ritmo antes de ser de custo. */
export const MAX_BOCAS = 2;

/* A fala é curta por regra. O ator que escreve parágrafo está narrando, e
   narrar não é dele. */
export const TETO_DA_FALA = 320;

const limpar = (s) => String(s || "")
  .replace(/^["'“”«\s]+|["'“”»\s]+$/g, "")
  .replace(/\s+/g, " ")
  .trim();

/* ---------------- O DOSSIÊ ----------------
   Tudo o que o ator recebe, e nada além. Se um campo não estiver aqui, ele
   não sabe — e é isso que o impede de decidir o que existe no mundo. */
export function dossieDe(pessoa, { faz = "", gesto = "", proibidos = [], acao = "", outros = [], lugar = "" } = {}) {
  const p = pessoa || {};
  const nome = String(p.nome || "").slice(0, 40);
  if (!nome) return null;
  return {
    nome,
    papel: String(p.papel || p.conceito || "").slice(0, 60),
    temperamento: String(p.temperamento || p.traco || "").slice(0, 60),
    relacao: String(p.relacao || "").slice(0, 20),
    quer: String(p.vontade || p.quer || "").slice(0, 80),
    faz: String(faz || "").slice(0, 120),
    gesto: String(gesto || "").slice(0, 30),
    proibidos: (proibidos || []).slice(0, 4).map((x) => String(x).slice(0, 20)),
    outros: (outros || []).slice(0, 3).map((x) => String(x).slice(0, 40)),
    acao: String(acao || "").slice(0, 240),
    lugar: String(lugar || "").slice(0, 50),
  };
}

/* O que cada veto quer dizer em palavras. O ator não conhece o vocabulário
   interno do Intérprete — ele precisa da proibição em português. */
const PROIBIDO_EM_PALAVRAS = {
  ameaca: "não ameaça ninguém, nem de leve",
  protege: "não se põe na frente de ninguém",
  entrega: "não entrega o que sabe nem quem confiou nele",
  recua: "não recua nem se diminui na frente dos outros",
  aproxima: "não se aproxima nem se abre",
  esquiva: "não se esquiva do assunto",
  cobra: "não cobra nada de ninguém",
};

export function promptDoAtor(d) {
  if (!d) return "";
  const vetos = (d.proibidos || []).map((x) => PROIBIDO_EM_PALAVRAS[x]).filter(Boolean);
  return [
    `Você É ${d.nome}. Não narra, não descreve a cena, não explica: FALA, como esta pessoa falaria.`,
    d.papel ? `QUEM VOCÊ É: ${d.papel}.${d.temperamento ? ` ${d.temperamento}.` : ""}` : "",
    d.quer ? `O QUE VOCÊ QUER: ${d.quer}.` : "",
    d.relacao ? `O QUE ELA É SUA: ${d.relacao}.` : "",
    /* o veto vem por último entre as instruções de quem ele é, porque é a
       última coisa que ele lê antes de falar — e é a que mais se perde */
    vetos.length ? `O QUE VOCÊ NUNCA FAZ, nesta cena e em qualquer outra: ${vetos.join("; ")}. Isto não tem exceção.` : "",
    d.faz ? `O QUE O SISTEMA JÁ DECIDIU QUE VOCÊ FAZ AGORA: ${d.faz}. A sua fala tem de caber nisso — não faça outra coisa.` : "",
    d.lugar ? `ONDE: ${d.lugar}.` : "",
    d.outros.length ? `QUEM MAIS ESTÁ AQUI: ${d.outros.join(", ")}.` : "",
    "",
    "Responda com UM objeto JSON e nada mais: {\"fala\":\"…\"}",
    `A fala tem de UMA a TRÊS frases, no máximo ${TETO_DA_FALA} caracteres, sem aspas de citação e sem dizer o seu próprio nome antes dela.`,
    "VOCÊ É SÓ A BOCA: não decide o que existe no mundo, não move ninguém, não conta o que os outros fazem e não resolve a cena.",
  ].filter(Boolean).join("\n");
}

export function pedidoDoAtor(d) {
  if (!d) return "Fale.";
  return d.acao ? `O herói acabou de dizer: "${d.acao}"\n\nResponda como ${d.nome}.` : `Fale como ${d.nome}.`;
}

/* ---------------- A CATRACA DA FALA ----------------
   O que volta do ator é texto de modelo, e texto de modelo precisa de porta.
   Fala vazia não vira envelope: melhor uma pessoa calada do que uma linha
   inventada com o nome dela. */
export function garantirFala(bruta) {
  const f = limpar(bruta);
  if (!f || f.length < 2) return "";
  return f.length > TETO_DA_FALA ? `${f.slice(0, TETO_DA_FALA - 1).trimEnd()}…` : f;
}

/* ---------------- O QUE VAI À PAUTA ----------------
   Fato consumado, como todo envelope desta casa. O Narrador costura; ele
   não reescreve e não dá fala a quem não falou. */
export function envelopeDasFalas(falas) {
  const ditas = (falas || []).filter((x) => x && x.nome && x.fala);
  if (!ditas.length) return "";
  const linhas = ditas.map((x) => `${x.nome} disse: "${x.fala}"`).join("\n");
  return `${linhas}\nEstas falas JÁ ACONTECERAM, com estas palavras. Costure-as na cena com gesto, lugar e silêncio — não as reescreva, não resuma, não invente outra fala para quem já falou e não faça falar quem não está nesta lista.`;
}

/* NAO HA um `quantasBocas` exportado: quem conta as bocas e o proprio App,
   fatiando os movimentos do Interprete em `MAX_BOCAS`. Uma funcao que so
   repete um `Math.min` de uma linha e export morto com nome bonito. */
