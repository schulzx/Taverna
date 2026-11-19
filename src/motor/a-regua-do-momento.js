/* motor/a-regua-do-momento.js (M3 · 18/11/2026) — «a régua do momento».

   O desenho é mente/lancamento/o-mestre-vivo.md §3: uma tabela só responde
   «isto vale uma rolagem?», para toda ação — a conversa incluída. As regras
   saem do estudo das mesas reais (mente/lancamento/estudo-das-mesas.md §6),
   cada uma com a força que a mesa deu a ela:

     pergunta não rola (65 de 65) · busca rola se há o que achar ou perigo,
     senão o Mestre descreve · conversa rola quando quem ouve tem motivo para
     negar · quem já está com medo cede sem dado · ler a pessoa rola quando o
     jogador pede · travessia rola com perigo ou pressa · esgueirar rola se
     alguém pode notar · encenação e logística não rolam · magia, talento e
     item resolvem pela própria regra · e o dado espontâneo: o mundo provoca
     um teste quando a cena muda.

   A régua LÊ a cena (cena-do-momento.js); nunca a escreve. E onde não há
   cena (`null`), ela devolve EXATAMENTE o que o Mestre de hoje devolve
   (`porQueNaoChama`, com a conversa rolando pela escada do pedido) — a
   suíte prova isto sobre os dois corpus. Assim a régua pode entrar no jogo
   atrás de uma chave, e desligada nada muda.

   M5 (18/11/2026), «o treino»: quando o catálogo não ouve ato nenhum e há
   cena, a régua pede uma segunda escuta (a-escuta-da-cena.js), que lê a
   ESTRUTURA da frase — a moldura, a fala que pede, o ato sem o verbo do
   catálogo — e devolve o veredito do próprio catálogo. Só com cena: sem
   ela, nada disto corre. E quatro linhas novas na régua, dos estados que o
   exame pediu (o morto não responde, a mão leve sem olhos, o céu, a coisa
   do herói e a de toda feira, a coisa rara de achar).

   RODADA 3 DO TREINO (18/11/2026): a moldura da frase entra como PESO
   (`molduraDe`: «posso…?» empurra para o dado, «eu vou + verbo» para o
   «acontece»), nunca sozinha contra a cena; as ações encadeadas se partem e
   a régua fica com o ato que tem oposição; o pedido de dado e a perícia
   nomeada passam pela escuta; linhas novas para os estados que faltavam
   (o selado, o já resolvido, o já testado, a alavanca, o à vista, o som
   abafado, o moribundo, o herói penalizado, o que não resiste); e o DADO
   DO DESTINO — a pergunta pelo que a sorte fez com uma coisa, que o Mestre
   rola sem perícia (estudo §10.3 nº 3, §10.5 nº 93).

   Este módulo não é lido pelo App ainda: a fiação é a etapa seguinte. */
import { QUANDO_O_MESTRE_CHAMA, porQueNaoChama, saberComumDe } from "./o-mestre-chama.js";
import {
  lerCena, haOposicao, haOQueAchar, haSegredo, haPerigo, alguemPodeNotar, haPlateia, cenaRevela,
  custoDeFalhar, respostaDaPergunta, estadosQueChamam, estadoPorId, temMarca,
} from "../cena-do-momento.js";
import { escutarComCena, molduraDe, atosDaFrase } from "./a-escuta-da-cena.js";
import { lerAcao } from "../desafios.js";

/* ---------------- A FAMÍLIA DA AÇÃO ----------------
   O id do catálogo (desafios.js), na língua do estudo. O improviso diz a
   família pelo atributo (a chave «…|improviso|<atributo>|…»). */
export const FAMILIA_DO_DESAFIO = Object.freeze({
  buscar: "procurar", investigar: "procurar", escutar: "procurar", desarmar: "procurar",
  furtar_se: "esgueirar", seguir_alguem: "esgueirar",
  mentira: "ler_pessoa",
  lembrar: "saber", fraqueza: "saber", heraldica: "saber", orientar: "saber",
  arcano: "arcano",
  tranca: "forcar", forcar: "forcar", arrebentar: "forcar",
  escalar: "travessia", nadar: "travessia", saltar: "travessia", equilibrio: "travessia", escapar: "travessia", cavalgar: "travessia",
  rastrear: "rastrear",
  estancar: "socorrer", diagnosticar: "socorrer", aguentar: "socorrer",
  bater_carteira: "furtar",
  convencer: "convencer", fazer_falar: "convencer", impressionar: "convencer",
  intimidar: "intimidar",
  mentir: "enganar", falsificar: "enganar",
  atuar: "atuar",
  acalmar_bicho: "animal",
});
export const FAMILIA_DO_IMPROVISO = Object.freeze({
  intelecto: "saber", percepcao: "procurar", presenca: "convencer", vigor: "socorrer", destreza: "travessia", forca: "forcar",
});

export function familiaDaAcao(v) {
  if (!v || typeof v !== "object" || v.tipo !== "teste") return "";
  if (v.id === "improviso") {
    const p = String(v.chave || "").split("|");
    const i = p.indexOf("improviso");
    return FAMILIA_DO_IMPROVISO[i >= 0 ? p[i + 1] : ""] || "";
  }
  return FAMILIA_DO_DESAFIO[v.id] || "";
}

/* Os degraus da escada do pedido (social.js) que são PERGUNTA, não pedido:
   a cortesia (onde fica, quanto custa) e a conversa (o que se diz por aí).
   Pergunta não rola. */
export const PERGUNTA_DA_ESCADA = Object.freeze(["cortesia", "conversa"]);
/* quem cede sem dado quando está com medo: a pressão e o pedido */
export const CEDE_COM_MEDO = Object.freeze(["convencer", "intimidar"]);
/* M5: as famílias que são conversa mesmo quando o catálogo não marcou
   `social` (o discurso que o improviso leu pela Presença): com cena, elas
   passam pelas linhas da conversa — quem já está disposto cede sem dado. */
export const FAMILIAS_DA_CONVERSA = Object.freeze(["convencer", "intimidar", "enganar"]);
/* M5: o que o herói sabe ou desvenda e que a coisa do próprio herói, ou a
   de toda feira, já entrega */
export const FAMILIAS_DO_SABER = Object.freeze(["saber", "arcano"]);

/* ---------------- A RÉGUA ----------------
   A primeira linha cujo `quando` é verdade decide. `x` é o que a régua já
   leu: { v, familia, social, cena, op (oposição da pessoa), bicho (oposição
   da criatura), coisa (oposição da coisa), custo }. */
/* rodada 3: as molduras que pedem licença ou já sinalizam risco (§10.3) */
export const MOLDURAS_DE_RISCO = Object.freeze(["pedido", "licenca", "tentativa"]);
/* rodada 3: as famílias que o mundo pode tornar impossíveis (o selado, o
   sabotado), e as que a alavanca do herói resolve */
export const FAMILIAS_DO_IMPOSSIVEL = Object.freeze(["forcar", "travessia"]);
export const FAMILIAS_DA_ALAVANCA = Object.freeze(["forcar", "convencer", "intimidar", "enganar"]);
/* rodada 3: o que está à vista não se procura nem se adivinha */
export const FAMILIAS_DO_EVIDENTE = Object.freeze(["procurar", "rastrear", "saber"]);

export const REGUA_DO_MOMENTO = Object.freeze([
  /* rodada 3: o que já ficou acertado, ou já foi tentado, não rola de novo
     (§8 nº 27, 37, 38) */
  Object.freeze({ id: "jaResolvido", rola: false, diz: "isto já ficou acertado: não há o que rolar",
    quando: (x) => temMarca(x.cena, "resolvido") && (!x.social || x.op.facilita || x.cena.cena.estados.includes("ja_resolvido")) }),
  Object.freeze({ id: "jaTestado", rola: false, diz: "o teste de antes já cobre isto",
    quando: (x) => temMarca(x.cena, "testado") }),
  /* rodada 3: o mundo decide que não (selado por magia, sabotado — §10.5
     nº 84, 85): não há dado que abra */
  Object.freeze({ id: "impossivel", rola: false, diz: "não cede, e não vai ceder: o mundo decide",
    quando: (x) => FAMILIAS_DO_IMPOSSIVEL.includes(x.familia) && temMarca(x.cena, "impossivel") }),
  /* rodada 3: o preparo do herói resolve (a senha, a chave, o documento
     bom — nº 73, 74, 76); contra quem é hostil, o papel não basta (nº 75) */
  Object.freeze({ id: "alavanca", rola: false, diz: "o seu preparo resolve: a senha, a chave, o papel certo",
    quando: (x) => FAMILIAS_DA_ALAVANCA.includes(x.familia) && temMarca(x.cena, "alavanca") && !(x.social && x.op.estados.includes("hostil")) }),
  /* rodada 3: o que está à vista (nº 70, 59) */
  Object.freeze({ id: "aVista", rola: false, diz: "está à vista: o Mestre conta o que se vê",
    quando: (x) => FAMILIAS_DO_EVIDENTE.includes(x.familia) && temMarca(x.cena, "evidente") }),
  /* M5: quem não pode responder (o morto, o desacordado) não é convencido
     nem enganado: não há conversa, e não há dado */
  Object.freeze({ id: "semResposta", rola: false, diz: "quem ouviria não pode responder",
    quando: (x) => x.social && x.op.inerte }),
  /* a conversa, dentro da régua */
  Object.freeze({ id: "pergunta", rola: false, diz: "pergunta não rola: quem quer responde, quem esconde desconversa",
    quando: (x) => x.social && PERGUNTA_DA_ESCADA.includes(x.v.social && x.v.social.tamanho) && !x.op.opoe }),
  Object.freeze({ id: "medoCede", rola: false, diz: "quem já está com medo cede sem dado",
    quando: (x) => x.social && CEDE_COM_MEDO.includes(x.familia) && x.op.cede }),
  Object.freeze({ id: "dispostoCede", rola: false, diz: "com quem está disposto, a conversa resolve sem dado",
    quando: (x) => x.social && x.op.facilita }),
  Object.freeze({ id: "motivoParaNegar", rola: true, diz: "quem ouve tem motivo para negar",
    quando: (x) => x.social && x.op.opoe }),
  /* M5: a fala que só a escuta ouviu (nenhum verbo de conversa na frase:
     «peço…», «vc solta e eu…») é a leitura mais fraca de uma tentativa.
     Ela rola pela regra mais forte do estudo — quem ouve tem motivo para
     negar —, e não pela escada do estranho: sem oposição, o pedido se
     conversa e o Mestre narra a resposta */
  Object.freeze({ id: "falaComLicenca", rola: true, diz: "você pede licença: sabe que pode ouvir um não",
    quando: (x) => x.social && x.v.escuta === "fala" && MOLDURAS_DE_RISCO.includes(x.moldura) && !x.op.facilita }),
  Object.freeze({ id: "falaSemOposicao", rola: false, diz: "ninguém tem motivo para negar: a conversa resolve",
    quando: (x) => x.social && x.v.escuta === "fala" }),
  Object.freeze({ id: "conversaComEstranho", rola: true, diz: "um estranho que não te deve nada: a escada do pedido dá o número",
    quando: (x) => x.social }),
  /* ler a pessoa: rola quando o jogador pede, e o pedido é a frase */
  Object.freeze({ id: "lerPessoa", rola: true, diz: "ler a pessoa rola quando o jogador pede",
    quando: (x) => x.familia === "ler_pessoa" }),
  /* escutar */
  Object.freeze({ id: "somClaro", rola: false, diz: "dá para ouvir tudo daqui: o Mestre conta o que se ouve",
    quando: (x) => x.v.id === "escutar" && cenaRevela(x.cena) }),
  /* rodada 3: o som abafado — há o que ouvir, e custa (§8 nº 8) */
  Object.freeze({ id: "somAbafado", rola: true, diz: "há vozes, mas abafadas: ouvir custa",
    quando: (x) => x.v.id === "escutar" && temMarca(x.cena, "abafa") }),
  Object.freeze({ id: "haOQueOuvir", rola: true, diz: "há o que ouvir, e não é fácil",
    quando: (x) => x.v.id === "escutar" && (haSegredo(x.cena) || x.cena.pessoas.length > 0 || x.cena.criaturas.length > 0) }),
  Object.freeze({ id: "silencio", rola: false, diz: "não há o que ouvir: o Mestre descreve o silêncio",
    quando: (x) => x.v.id === "escutar" }),
  /* a busca (M5: e a coisa rara de achar, que custa procurar) */
  Object.freeze({ id: "buscaComAchado", rola: true, diz: "há o que achar, ou perigo no que se toca",
    quando: (x) => x.familia === "procurar" && (haOQueAchar(x.cena) || haPerigo(x.cena) || temMarca(x.cena, "escasso")) }),
  Object.freeze({ id: "buscaVazia", rola: false, diz: "nada escondido nem perigo: o Mestre descreve o que há",
    quando: (x) => x.familia === "procurar" }),
  /* esgueirar */
  Object.freeze({ id: "alguemPodeNotar", rola: true, diz: "alguém pode notar",
    quando: (x) => x.familia === "esgueirar" && alguemPodeNotar(x.cena) }),
  Object.freeze({ id: "ninguemVe", rola: false, diz: "não há quem note: você anda em silêncio e pronto",
    quando: (x) => x.familia === "esgueirar" }),
  /* travessia */
  Object.freeze({ id: "travessiaArriscada", rola: true, diz: "o chão pune ou o tempo aperta",
    quando: (x) => x.familia === "travessia" && (x.custo.pune || x.custo.apressa) }),
  /* rodada 3: o herói mal (bêbado, ferido) faz do calmo um risco (nº 91) */
  Object.freeze({ id: "corpoQueFalha", rola: true, diz: "o corpo não obedece como devia",
    quando: (x) => ["travessia", "esgueirar", "rastrear"].includes(x.familia) && temMarca(x.cena, "penaliza") }),
  Object.freeze({ id: "travessiaCalma", rola: false, diz: "sem perigo nem pressa: você passa",
    quando: (x) => x.familia === "travessia" }),
  /* a tranca */
  Object.freeze({ id: "trancado", rola: true, diz: "está trancado",
    quando: (x) => x.v.id === "tranca" && x.coisa.opoe }),
  Object.freeze({ id: "semTranca", rola: false, diz: "não há tranca: a coisa abre",
    quando: (x) => x.v.id === "tranca" }),
  /* socorrer */
  Object.freeze({ id: "socorroUrgente", rola: true, diz: "a vida está em jogo, ou o tempo aperta",
    quando: (x) => x.familia === "socorrer" && (x.custo.pune || x.custo.apressa || temMarca(x.cena, "morrendo")) }),
  Object.freeze({ id: "socorroCalmo", rola: false, diz: "sem pressa nem perigo, o cuidado acontece",
    quando: (x) => x.familia === "socorrer" }),
  /* encenação */
  Object.freeze({ id: "plateia", rola: true, diz: "há plateia de fora para conquistar",
    quando: (x) => x.familia === "atuar" && haPlateia(x.cena) }),
  Object.freeze({ id: "entreOsSeus", rola: false, diz: "encenação para os seus não rola",
    quando: (x) => x.familia === "atuar" }),
  /* o bicho */
  Object.freeze({ id: "bichoResiste", rola: true, diz: "o bicho resiste",
    quando: (x) => x.familia === "animal" && x.bicho.opoe }),
  Object.freeze({ id: "bichoManso", rola: false, diz: "o bicho já é manso",
    quando: (x) => x.familia === "animal" && x.bicho.facilita }),
  /* M5: a mão leve só rola se alguém pode notar — do morto se tira e pronto */
  Object.freeze({ id: "maoLeveSemOlhos", rola: false, diz: "ninguém que possa notar: você pega e pronto",
    quando: (x) => x.familia === "furtar" && !alguemPodeNotar(x.cena) }),
  /* M5: o céu. Encoberto, orientar-se rola; à vista, o sol e as estrelas
     dizem a hora e o rumo — salvo se há perigo ou pressa */
  Object.freeze({ id: "ceuEncoberto", rola: true, diz: "nem sol nem estrela: o rumo é adivinhado",
    quando: (x) => x.v.id === "orientar" && temMarca(x.cena, "cobre") }),
  Object.freeze({ id: "ceuAVista", rola: false, diz: "o céu está à vista e diz a hora e o rumo",
    quando: (x) => x.v.id === "orientar" && !x.custo.pune && !x.custo.apressa }),
  /* M5: o que a ficha já sabe não rola, qualquer que seja o desafio de
     saber (o Mestre de hoje só pergunta isto ao «lembrar»; «dragão tem medo
     de raio?» é lido como fraqueza, e o herói que acabou de estudar dragões
     rolava de novo) */
  Object.freeze({ id: "jaSabeOAssunto", rola: false, diz: "a ficha já tem o assunto",
    quando: (x) => x.familia === "saber" && x.v.id !== "lembrar" && !!saberComumDe({ ...x.v, id: "lembrar", sobre: x.v.sobre || x.frase }, x.ctx) }),
  /* M5: a coisa do próprio herói, e a de toda feira, não pedem dado de saber */
  Object.freeze({ id: "doProprioHeroi", rola: false, diz: "é seu: você conhece",
    quando: (x) => FAMILIAS_DO_SABER.includes(x.familia) && temMarca(x.cena, "proprio") }),
  Object.freeze({ id: "coisaComum", rola: false, diz: "é coisa de toda feira: qualquer um sabe",
    quando: (x) => FAMILIAS_DO_SABER.includes(x.familia) && temMarca(x.cena, "comum") }),
  /* rodada 3: o que o herói já sabe, dito pela cena (o teste de antes, o
     passado dele) — a ficha nem sempre tem o assunto escrito */
  Object.freeze({ id: "heroiJaSabe", rola: false, diz: "você já sabe isto",
    quando: (x) => FAMILIAS_DO_SABER.includes(x.familia) && temMarca(x.cena, "sabe") }),
  /* rodada 3: a força contra o que não resiste (o portão entreaberto) */
  Object.freeze({ id: "semResistencia", rola: false, diz: "não há o que resista: basta um empurrão",
    quando: (x) => x.familia === "forcar" && temMarca(x.cena, "livre") && !x.coisa.opoe }),
  /* o resto: a ação tem oposição própria (o saber, o arcano, o rastro, a
     mão leve, a força), e rola como o Mestre de sempre a faria rolar */
  Object.freeze({ id: "comoSempre", rola: true, diz: "a ação tem a sua própria oposição",
    quando: () => true }),
]);

/* as linhas do Mestre de hoje que valem com cena: todas menos a da
   conversa, que agora mora dentro da régua */
const VETOS_DE_SEMPRE = QUANDO_O_MESTRE_CHAMA.filter((r) => r.id !== "conversa");
const ROLA_HOJE = Object.freeze([null, "conversa"]);
const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);

function pesosDe(cena, ctx) {
  const custo = custoDeFalhar(cena);
  return Object.freeze({
    segredo: haSegredo(cena),
    pressa: custo.apressa,
    testemunha: custo.espalha,
    perigo: custo.pune,
    vantagem: !!(obj(ctx) && ctx.vantagem),
    /* rodada 3: o herói mal (bêbado, ferido) pesa contra ele no número */
    penalidade: temMarca(cena, "penaliza"),
  });
}

/* ---------------- O DADO DO DESTINO ----------------
   Rodada 3 (estudo §10.3 nº 3, §10.5 nº 93): na mesa em português o mestre
   rola um dado SEM perícia para saber o que a sorte fez — o frasco que
   sobreviveu ao barco virado, qual arma restou, de que lado caiu. É uma
   pergunta (não um gesto), sobre uma COISA, a ninguém da cena, e logo
   depois de um tranco (algo ameaçou a coisa, ou a cena tem perigo).
   `oDadoDoDestino` diz o resultado, determinístico pela semente: o mesmo
   d6, a mesma faixa, em qualquer máquina. */
export const PERGUNTA_DO_DESTINO = /\b(sobreviveu|sobreviveram|se salvou|se salvaram|resistiu|resistiram|aguentou|aguentaram|(ficou|ficaram|ta|esta|estao|tao|continua|continuam|chegou|chegaram) (inteir|intact|bem|sec)\w*|quebrou|quebraram|se quebrou|rachou|racharam|molhou|molharam|estragou|estragaram|se perdeu|se perderam|afundou|afundaram|sobrou|sobraram|restou|restaram|escapou|escaparam|de que lado (caiu|ficou)|caiu de que lado|caiu (de pe|em pe|aberto|fechado)|cara ou coroa)\b/;
const A_ALGUEM = /["“”«»]|\b(pergunto|digo|falo|peco|voce|vc|tu|senhor|senhora)\b/;
export const FAIXAS_DO_DESTINO = Object.freeze([
  Object.freeze({ ate: 2, id: "nao", diz: "a sorte levou: não resistiu" }),
  Object.freeze({ ate: 4, id: "em_parte", diz: "em parte: resistiu, mas com um preço" }),
  Object.freeze({ ate: 6, id: "sim", diz: "a sorte ajudou: resistiu" }),
]);
const fnv = (s) => { let h = 0x811c9dc5; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
export function oDadoDoDestino(semente, pergunta) {
  const d = (fnv(String(semente == null ? "" : semente) + "|destino|" + String(pergunta == null ? "" : pergunta)) % 6) + 1;
  const f = FAIXAS_DO_DESTINO.find((x) => d <= x.ate) || FAIXAS_DO_DESTINO[FAIXAS_DO_DESTINO.length - 1];
  return Object.freeze({ dado: d, faces: 6, id: f.id, diz: f.diz });
}
const semAcento = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export function ePerguntaDoDestino(frase, cena) {
  const c = lerCena(cena);
  if (!c || typeof frase !== "string") return false;
  const t = semAcento(frase).trim();
  if (!/\?\s*$/.test(t) && !/^(sera que|e ai)\b/.test(t)) return false;
  if (A_ALGUEM.test(t) || !PERGUNTA_DO_DESTINO.test(t)) return false;
  return temMarca(c, "ameaca") || haPerigo(c);
}

/* ---------------- VALE ROLAGEM? ----------------
   `veredito`: o que `lerAcao` devolveu (ou null).
   `cena`: a cena crua ou lida (cena-do-momento.js), ou null.
   `ctx`: o contexto do chamado (emCombate, bonus, mundoDisseNao, saber,
   vantagem) — o mesmo de `porQueNaoChama`.
   M5: `ctx.frase` (o que o jogador escreveu) e `ctx.leitura` (o contexto
   de `lerAcao`) — opcionais; com eles e com cena, o que o catálogo não
   ouviu passa pela escuta da cena, e `ouviu` diz o que ela ouviu
   ({ id, pericia, chave, porta }) ou null.
   Devolve { rola, porque, diz, pesos, resposta, ouviu }:
     `porque`: o id da linha que decidiu (do Mestre de hoje, ou da régua);
     `pesos`: o que pesa no número e no preço (null sem cena);
     `resposta`: para a pergunta que não rola, como a pessoa responde
       (franca, evasiva, recusa) — sinal para o Narrador, nunca dado.
   Preparo da fiação (18/11/2026, o-mestre-vivo.md §15): COM cena, vem
   também `veredito` — o veredito inteiro que a régua julgou (o do
   catálogo, o que a escuta ouviu, ou o do ato da frase encadeada), com o
   `dc`, o `social` e a `pessoa`, para o App o passar a `oChamado` sem
   chamar a escuta de novo (`null` no dado do destino). Campo aditivo: nada
   do que já se media muda. Sem cena, a resposta fica a de hoje, byte a byte. */
export function valeRolagem(vereditoDoCatalogo, cena, ctx) {
  const c = obj(ctx) ? ctx : {};
  const lida = lerCena(cena);
  if (!lida) {
    let por = null;
    try { por = porQueNaoChama(vereditoDoCatalogo, c); } catch { por = "erro"; }
    return Object.freeze({ rola: ROLA_HOJE.includes(por), porque: por || "chama", diz: "", pesos: null, resposta: null });
  }
  const r = decidir(vereditoDoCatalogo, lida, c);
  if (r.rola || typeof c.frase !== "string" || c.parte) return r;
  /* rodada 3: as ações encadeadas («aí eu…», «vou fazer o seguinte:») — a
     régua julga cada ato e fica com o primeiro que tem oposição na cena */
  let atos = [];
  try { atos = atosDaFrase(c.frase); } catch { atos = []; }
  for (const ato of atos) {
    let v = null;
    try { v = lerAcao(ato, obj(c.leitura) ? c.leitura : {}); } catch { v = null; }
    let p = null;
    try { p = decidir(v, lida, { ...c, frase: ato, parte: true }); } catch { p = null; }
    if (p && p.rola) {
      const ouviu = p.ouviu || (v && v.tipo === "teste" ? Object.freeze({ id: v.id, pericia: v.pericia || "", chave: v.chave || "", porta: "ato" }) : null);
      return Object.freeze({ ...p, porque: "encadeada:" + p.porque, ouviu });
    }
  }
  return r;
}

function decidir(vereditoDoCatalogo, lida, c) {
  let veredito = vereditoDoCatalogo;
  const pesos = pesosDe(lida, c);
  const moldura = typeof c.frase === "string" ? molduraDe(c.frase) : "";
  /* rodada 3: o dado do destino — só quando o catálogo não ouviu ato */
  if ((!veredito || veredito.tipo !== "teste") && typeof c.frase === "string" && ePerguntaDoDestino(c.frase, lida)) {
    const destino = oDadoDoDestino(obj(c.leitura) ? c.leitura.semente : "", c.frase);
    return Object.freeze({ rola: true, porque: "destino", diz: "a sorte decide: o Mestre rola sem perícia", pesos, resposta: null,
      ouviu: Object.freeze({ id: "destino", pericia: "", chave: "", porta: "destino" }), destino, moldura, veredito: null });
  }
  /* M5: o catálogo não ouviu ato nenhum — a escuta da cena tenta pela
     estrutura da frase (`ctx.frase`, lida com `ctx.leitura`, o contexto de
     `lerAcao`). Sem frase, nada muda. */
  let ouvido = null;
  if ((!veredito || veredito.tipo === "livre" || veredito.tipo === "naoSePede") && typeof c.frase === "string") {
    try { ouvido = escutarComCena(c.frase, lida, c.leitura); } catch { ouvido = null; }
    if (ouvido) veredito = ouvido;
  }
  /* M5: «esse desenho é de algum culto que eu conheça?» — o catálogo leu
     `lembrar` e não recortou o assunto; sem assunto, a régua do saber comum
     não tem o que comparar com a ficha. O assunto é então a frase inteira. */
  if (veredito && veredito.tipo === "teste" && veredito.id === "lembrar" && !veredito.sobre && typeof c.frase === "string") {
    veredito = { ...veredito, sobre: c.frase };
  }
  const ouviu = ouvido ? Object.freeze({ id: ouvido.id, pericia: ouvido.pericia || "", chave: ouvido.chave || "", porta: ouvido.escuta || "" }) : null;
  for (const r of VETOS_DE_SEMPRE) {
    let cala = false;
    try { cala = !!r.cala(veredito, c); } catch { cala = true; }
    if (cala) {
      const resposta = r.id === "naoETeste" ? respostaDaPergunta(lida, "") : null;
      return Object.freeze({ rola: false, porque: r.id, diz: r.porque, pesos, resposta: resposta ? resposta.id : null, ouviu, moldura, veredito: veredito || null });
    }
  }
  const v = veredito;
  const familia = familiaDaAcao(v);
  const quem = (v.pessoa && v.pessoa.nome) || v.quem || "";
  const x = {
    v, familia, social: !!v.social || FAMILIAS_DA_CONVERSA.includes(familia), cena: lida,
    op: haOposicao(lida, { sobre: "pessoa", quem }),
    bicho: haOposicao(lida, { sobre: "criatura", quem }),
    coisa: haOposicao(lida, { sobre: "coisa" }),
    custo: custoDeFalhar(lida),
    ctx: c, frase: typeof c.frase === "string" ? c.frase : "", moldura,
  };
  for (const r of REGUA_DO_MOMENTO) {
    let vale = false;
    try { vale = !!r.quando(x); } catch { vale = false; }
    if (vale) {
      const resposta = r.id === "pergunta" ? respostaDaPergunta(lida, quem) : null;
      return Object.freeze({ rola: r.rola, porque: r.id, diz: r.diz, pesos, resposta: resposta ? resposta.id : null, ouviu, moldura, veredito: v });
    }
  }
  return Object.freeze({ rola: true, porque: "comoSempre", diz: "", pesos, resposta: null, ouviu, moldura, veredito: v });
}

/* ---------------- O DADO ESPONTÂNEO ----------------
   Na mesa real um terço dos pedidos vem sem ação declarada: o mestre pede
   Percepção porque algo se aproxima, Furtividade porque o lugar é vigiado,
   Saberes porque um assunto apareceu. Aqui é o mundo que provoca: um estado
   que CHAMA (a marca `chama` em ESTADOS_DA_CENA) e que não estava na cena
   antes. Devolve o teste que a cena chama, ou null. */
export const PORQUE_DO_ESPONTANEO = Object.freeze({
  percepcao: "algo se aproxima: quem está atento percebe",
  furtividade: "o lugar é vigiado: quem entra tem de passar sem ser visto",
  saberes: "um assunto apareceu: quem estudou pode lembrar",
});

export function oQueACenaChama(cenaAntes, cenaDepois) {
  const depois = lerCena(cenaDepois);
  if (!depois) return null;
  const antes = estadosQueChamam(lerCena(cenaAntes));
  const novo = estadosQueChamam(depois).find((id) => !antes.includes(id));
  if (!novo) return null;
  const e = estadoPorId(novo);
  if (!e || !e.chama) return null;
  return Object.freeze({ pericia: e.chama, estado: novo, porque: PORQUE_DO_ESPONTANEO[e.chama] || "" });
}
