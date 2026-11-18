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

   Este módulo não é lido pelo App ainda: a fiação é a etapa seguinte. */
import { QUANDO_O_MESTRE_CHAMA, porQueNaoChama, saberComumDe } from "./o-mestre-chama.js";
import {
  lerCena, haOposicao, haOQueAchar, haSegredo, haPerigo, alguemPodeNotar, haPlateia, cenaRevela,
  custoDeFalhar, respostaDaPergunta, estadosQueChamam, estadoPorId, temMarca,
} from "../cena-do-momento.js";
import { escutarComCena } from "./a-escuta-da-cena.js";

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
export const REGUA_DO_MOMENTO = Object.freeze([
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
  Object.freeze({ id: "travessiaCalma", rola: false, diz: "sem perigo nem pressa: você passa",
    quando: (x) => x.familia === "travessia" }),
  /* a tranca */
  Object.freeze({ id: "trancado", rola: true, diz: "está trancado",
    quando: (x) => x.v.id === "tranca" && x.coisa.opoe }),
  Object.freeze({ id: "semTranca", rola: false, diz: "não há tranca: a coisa abre",
    quando: (x) => x.v.id === "tranca" }),
  /* socorrer */
  Object.freeze({ id: "socorroUrgente", rola: true, diz: "a vida está em jogo, ou o tempo aperta",
    quando: (x) => x.familia === "socorrer" && (x.custo.pune || x.custo.apressa) }),
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
    quando: (x) => x.familia === "saber" && temMarca(x.cena, "comum") }),
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
  });
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
       (franca, evasiva, recusa) — sinal para o Narrador, nunca dado. */
export function valeRolagem(vereditoDoCatalogo, cena, ctx) {
  let veredito = vereditoDoCatalogo;
  const c = obj(ctx) ? ctx : {};
  const lida = lerCena(cena);
  if (!lida) {
    let por = null;
    try { por = porQueNaoChama(veredito, c); } catch { por = "erro"; }
    return Object.freeze({ rola: ROLA_HOJE.includes(por), porque: por || "chama", diz: "", pesos: null, resposta: null });
  }
  const pesos = pesosDe(lida, c);
  /* M5: o catálogo não ouviu ato nenhum — a escuta da cena tenta pela
     estrutura da frase (`ctx.frase`, lida com `ctx.leitura`, o contexto de
     `lerAcao`). Sem frase, nada muda. */
  let ouvido = null;
  if ((!veredito || veredito.tipo === "livre") && typeof c.frase === "string") {
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
      return Object.freeze({ rola: false, porque: r.id, diz: r.porque, pesos, resposta: resposta ? resposta.id : null, ouviu });
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
    ctx: c, frase: typeof c.frase === "string" ? c.frase : "",
  };
  for (const r of REGUA_DO_MOMENTO) {
    let vale = false;
    try { vale = !!r.quando(x); } catch { vale = false; }
    if (vale) {
      const resposta = r.id === "pergunta" ? respostaDaPergunta(lida, quem) : null;
      return Object.freeze({ rola: r.rola, porque: r.id, diz: r.diz, pesos, resposta: resposta ? resposta.id : null, ouviu });
    }
  }
  return Object.freeze({ rola: true, porque: "comoSempre", diz: "", pesos, resposta: null, ouviu });
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
