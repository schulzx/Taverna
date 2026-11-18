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

   Este módulo não é lido pelo App ainda: a fiação é a etapa seguinte. */
import { QUANDO_O_MESTRE_CHAMA, porQueNaoChama } from "./o-mestre-chama.js";
import {
  lerCena, haOposicao, haOQueAchar, haSegredo, haPerigo, alguemPodeNotar, haPlateia, cenaRevela,
  custoDeFalhar, respostaDaPergunta, estadosQueChamam, estadoPorId,
} from "../cena-do-momento.js";

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

/* ---------------- A RÉGUA ----------------
   A primeira linha cujo `quando` é verdade decide. `x` é o que a régua já
   leu: { v, familia, social, cena, op (oposição da pessoa), bicho (oposição
   da criatura), coisa (oposição da coisa), custo }. */
export const REGUA_DO_MOMENTO = Object.freeze([
  /* a conversa, dentro da régua */
  Object.freeze({ id: "pergunta", rola: false, diz: "pergunta não rola: quem quer responde, quem esconde desconversa",
    quando: (x) => x.social && PERGUNTA_DA_ESCADA.includes(x.v.social && x.v.social.tamanho) && !x.op.opoe }),
  Object.freeze({ id: "medoCede", rola: false, diz: "quem já está com medo cede sem dado",
    quando: (x) => x.social && CEDE_COM_MEDO.includes(x.familia) && x.op.cede }),
  Object.freeze({ id: "dispostoCede", rola: false, diz: "com quem está disposto, a conversa resolve sem dado",
    quando: (x) => x.social && x.op.facilita }),
  Object.freeze({ id: "motivoParaNegar", rola: true, diz: "quem ouve tem motivo para negar",
    quando: (x) => x.social && x.op.opoe }),
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
  /* a busca */
  Object.freeze({ id: "buscaComAchado", rola: true, diz: "há o que achar, ou perigo no que se toca",
    quando: (x) => x.familia === "procurar" && (haOQueAchar(x.cena) || haPerigo(x.cena)) }),
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
   Devolve { rola, porque, diz, pesos, resposta }:
     `porque`: o id da linha que decidiu (do Mestre de hoje, ou da régua);
     `pesos`: o que pesa no número e no preço (null sem cena);
     `resposta`: para a pergunta que não rola, como a pessoa responde
       (franca, evasiva, recusa) — sinal para o Narrador, nunca dado. */
export function valeRolagem(veredito, cena, ctx) {
  const c = obj(ctx) ? ctx : {};
  const lida = lerCena(cena);
  if (!lida) {
    let por = null;
    try { por = porQueNaoChama(veredito, c); } catch { por = "erro"; }
    return Object.freeze({ rola: ROLA_HOJE.includes(por), porque: por || "chama", diz: "", pesos: null, resposta: null });
  }
  const pesos = pesosDe(lida, c);
  for (const r of VETOS_DE_SEMPRE) {
    let cala = false;
    try { cala = !!r.cala(veredito, c); } catch { cala = true; }
    if (cala) {
      const resposta = r.id === "naoETeste" ? respostaDaPergunta(lida, "") : null;
      return Object.freeze({ rola: false, porque: r.id, diz: r.porque, pesos, resposta: resposta ? resposta.id : null });
    }
  }
  const v = veredito;
  const familia = familiaDaAcao(v);
  const quem = (v.pessoa && v.pessoa.nome) || v.quem || "";
  const x = {
    v, familia, social: !!v.social, cena: lida,
    op: haOposicao(lida, { sobre: "pessoa", quem }),
    bicho: haOposicao(lida, { sobre: "criatura", quem }),
    coisa: haOposicao(lida, { sobre: "coisa" }),
    custo: custoDeFalhar(lida),
  };
  for (const r of REGUA_DO_MOMENTO) {
    let vale = false;
    try { vale = !!r.quando(x); } catch { vale = false; }
    if (vale) {
      const resposta = r.id === "pergunta" ? respostaDaPergunta(lida, quem) : null;
      return Object.freeze({ rola: r.rola, porque: r.id, diz: r.diz, pesos, resposta: resposta ? resposta.id : null });
    }
  }
  return Object.freeze({ rola: true, porque: "comoSempre", diz: "", pesos, resposta: null });
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
