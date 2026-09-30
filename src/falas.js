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
import { paraODossie } from "./indole.js";

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
export function dossieDe(pessoa, { faz = "", gesto = "", proibidos = [], acao = "", outros = [], lugar = "", cena = {} } = {}) {
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
    /* v9.136: quem ela É. Os traços, o medo SE ele estiver acordado nesta
       cena, a força, e o propósito — que vai mesmo antes de amadurecer,
       porque é ele que dá fundo falso à fala desde o primeiro encontro. */
    indole: paraODossie(p.indole, { inimigos: cena.inimigos, lugar, presentes: cena.presentes, noite: cena.noite, convivio: cena.convivio }),
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
    (d.indole && d.indole.tracos.length) ? `COMO VOCÊ É: ${d.indole.tracos.join("; ")}.` : "",
    (d.indole && d.indole.forca) ? `NO QUE VOCÊ É BOM: ${d.indole.forca}.` : "",
    (d.indole && d.indole.medo) ? `O QUE VOCÊ TEME, E ESTÁ AQUI: ${d.indole.medo}.` : "",
    (d.indole && d.indole.proposito) ? `A SUA INTENÇÃO SECRETA: ${d.indole.proposito} NUNCA a anuncie: ela aparece no que você escolhe dizer, não no que você conta.` : "",
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

/* ---------------- A RESPOSTA DO ATOR (MM15, 30/09) ----------------
   Da v9.135 à v9.341 o App lia a resposta do ator com `extrairJSON`, que é
   o parser do NARRADOR: ele passa tudo por `sanearResposta`, que devolve só
   narrativa, perigo, rolagem, mudancas e sugestoes. O campo `fala` morria
   ali, em TODA resposta — `{"fala":"Aqui não."}` virava
   `{ narrativa: "…" }`, `garantirFala(undefined)` dava "", e o envelope
   saía vazio. Duzentas versões de falas pagas, e nenhuma palavra chegou ao
   Narrador. A segunda sessão de prova (MM11) viu o sintoma — quatro
   "Responda como …" que não aparecem em pauta nenhuma — e esta é a causa.

   A boca tem o seu próprio leitor, e ele só conhece o campo dela. Resposta
   sem o campo é pessoa calada, como antes: nada de adivinhar fala em prosa
   solta, que é justamente o parágrafo que o ator não devia escrever. */
export function falaDaResposta(bruto) {
  const limpo = String(bruto == null ? "" : bruto).replace(/```json/gi, "").replace(/```/g, "").trim();
  const ini = limpo.indexOf("{"), fim = limpo.lastIndexOf("}");
  if (ini !== -1 && fim > ini) {
    try {
      const j = JSON.parse(limpo.slice(ini, fim + 1));
      if (j && typeof j === "object" && typeof j.fala === "string") return garantirFala(j.fala);
    } catch { /* segue para o resgate */ }
  }
  /* resgate por campo: JSON truncado ou torto, a fala inteira ou não */
  const m = limpo.match(/"fala"\s*:\s*"((?:[^"\\]|\\.)*)("?)/);
  if (!m) return "";
  let s = m[1];
  try { s = JSON.parse(`"${s}"`); } catch { s = s.replace(/\\"/g, "\"").replace(/\\n/g, " "); }
  /* sem a aspa de fecho, a fala foi cortada pelo teto de tokens: o corte
     fica visível, como no parágrafo longo de `garantirFala` */
  const f = garantirFala(s);
  return f && !m[2] && !f.endsWith("…") ? `${f.slice(0, TETO_DA_FALA - 1).trimEnd()}…` : f;
}

/* ---------------- QUANTAS BOCAS SE PAGAM (MM15, 30/09) ----------------
   A regra de bolso: uma chamada paga que não chega ao jogador não se faz.

   Cada boca é uma chamada ao modelo, feita ANTES do Narrador e à espera
   dela (~1,5 s na sessão). No único fluxo que as pede — o turno em que eu
   escrevo, em `enviar` — o Narrador fala sempre logo a seguir, e é ele quem
   dá voz à gente da cena: o INTERPRETE_PROMPT diz-lhe com todas as letras
   que "o que ela diz é seu, inteiro", e a linha A GENTE já lhe entrega o
   gesto que o sistema escolheu.

   Por isso ZERO, e não "só a quem está de facto na cena". A segunda via foi
   medida e não serve: as bocas já saem de `pessoasDaCena()`, que é o
   "aqui" do `elencoDaCena` — filtrar por ele é filtrar a lista por ela
   mesma. Túlio, em casa, recebeu duas falas pagas porque ESTAVA no "aqui"
   (os nomes fundidos e a gente da cidade que segue a heroína, os defeitos 4
   e 5 da sessão); o conserto dele é no elenco, não aqui.

   O que se perde é nada que o jogador tenha tido: pela causa acima, fala
   nenhuma chegou nunca à pauta, e as duas sessões de prova (a segunda deu
   "as melhores dez respostas que joguei nesta mesa") foram jogadas assim.
   O que se ganha: até duas chamadas e ~1,5 s em cada turno com gente.

   A boca continua inteira e agora lê a própria resposta: voltar a pedi-la
   é mudar este número (até `MAX_BOCAS`), e isso é decisão de quem jogar o
   antes e o depois — nunca mais um gasto que ninguém viu. */
export const BOCAS_POR_TURNO = 0;

/* Quem recebe boca neste turno, pela ordem que o Intérprete deu (o laço
   mais forte primeiro). Vazio em turno do sistema — o que começa por
   colchete não é frase do jogador, e ninguém responde a um envelope. */
export function bocasDoTurno(movimentos, opcoes) {
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const conteudo = o.conteudo == null ? "" : String(o.conteudo);
  const pedidas = o.bocas == null ? BOCAS_POR_TURNO : Number(o.bocas);
  const n = Math.max(0, Math.min(MAX_BOCAS, Math.floor(Number.isFinite(pedidas) ? pedidas : 0)));
  if (!n) return [];
  if (conteudo.trimStart().startsWith("[")) return [];
  const mov = (Array.isArray(movimentos) ? movimentos : []).filter((m) => m && m.nome && m.pessoa);
  return mov.slice(0, n);
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
