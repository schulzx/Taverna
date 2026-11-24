/* ============================================================
   A FORMA DA TROCA (23/11/2026) — identidade e posse, etapa 8.

   A ordem da dona do jogo: «criar sistemas funcionais que identifiquem e
   resolvam os problemas, e não apenas exemplos. Se a troca não está
   funcionando, vou criar um sistema que identifica e realiza trocas.»

   Até aqui o tipo da troca (dar, vender, comprar, pedir, furtar, emprestar,
   devolver, cobrar, pagar, subornar, escambo, pegar) era decidido no ouvido
   por regras de verbo e de construção — e verbo novo não tinha regra. Aqui
   o tipo sai da FORMA da transação, numa tabela:

     de → para        quem entrega e quem recebe (o herói, o outro, o chão);
     oQue             a coisa que anda (moedas, item, um favor);
     contra           o que volta em troca (moedas, item, favor, serviço,
                      nenhuma), dito ou implícito no preço de quem vende;
     gesto            o verbo reduzido a uma de cinco classes de
                      CONSENTIMENTO e DIREÇÃO — oferecer, pedir, tomar,
                      apelar à dívida, propor troca —, com quem age (o herói
                      ou o outro, no imperativo dirigido a ele);
     divida           quem deve a quem, pelo registro de posse;
     prazo, retorno   a coisa volta depois / a coisa volta a quem a tinha.

   O gesto é pista de consentimento, nunca tabela de tipo: «compro» e
   «arremato» são o mesmo gesto (propor troca, quem age recebe), e é a
   posse e a contrapartida que dizem que é uma compra.

   A DIREÇÃO (aDirecaoDaTroca): o gesto que diz quem dá decide; sem ele, a
   POSSE — quem tem a coisa nomeada (só o herói tem o símbolo: vai dele; só
   a banca tem a corda: vem dela; está solta ou com um morto: vem do chão);
   com os dois lados tendo a coisa (moeda, em geral), a preposição («de/do
   X» tira, «me»/«a mim» traz, «a/pra X» entrega) e, por fim, o verbo sem
   gesto que só diz um sentido («passo», «levo»).

   Tudo o que é escolha está em A_FORMA_DA_TROCA. Módulo puro,
   determinístico, sem React e sem palavra nenhuma da frase: quem lê a
   frase é o ouvido (o-ouvido.js), que entrega os traços.
   ============================================================ */

export const A_FORMA_DA_TROCA = Object.freeze({
  /* as cinco classes de gesto (o que o verbo diz de consentimento e direção) */
  gestos: Object.freeze(["oferecer", "pedir", "tomar", "divida", "trocar"]),
  /* os lados (o morto entrega pelo chão: o que ele levava caiu) */
  lados: Object.freeze(["heroi", "outro", "chao", "mundo"]),
  /* as contrapartidas */
  contrapartidas: Object.freeze(["moedas", "item", "favor", "servico", "nenhuma"]),
  /* os subtipos que a tabela pode dar (o vocabulário do ouvido e do exame) */
  subtipos: Object.freeze(["comprar", "vender", "pagar", "dar", "pedir", "pegar", "furtar", "emprestar", "devolver", "subornar", "escambo", "cobrar"]),
  /* a contrapartida implícita: quem recebe o que tem preço, sem dizer que não paga e sem tomar nem
     cobrar, paga o preço (o gesto que impede a moeda implícita) */
  semMoedaImplicita: Object.freeze(["tomar", "divida"]),
  /* A TABELA. A primeira linha que casa decide. Campo ausente = qualquer valor; `contra: null` =
     nenhuma contrapartida (dita ou implícita); lista = um dos valores. */
  linhas: Object.freeze([
    Object.freeze({ quando: Object.freeze({ de: "chao", para: "heroi", forca: true }), subtipo: "furtar", consentimento: "tomado", porque: "o herói toma às escondidas ou à força o que está na cena" }),
    Object.freeze({ quando: Object.freeze({ de: ["chao", "mundo"], para: "heroi" }), subtipo: "pegar", consentimento: "dado", porque: "do chão ou do mundo para o herói" }),
    /* herói → outro */
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", contra: "item" }), subtipo: "escambo", consentimento: "dado", porque: "o herói entrega e recebe uma coisa do outro" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", oQue: "item", contra: "moedas" }), subtipo: "vender", consentimento: "dado", porque: "o herói entrega uma coisa e recebe moeda" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", contra: "favor" }), subtipo: "subornar", consentimento: "dado", porque: "o herói entrega em troca de um favor" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", oQue: "moedas", contra: "servico" }), subtipo: "pagar", consentimento: "dado", porque: "moeda em troca de um serviço" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", oQue: "moedas", divida: "heroiDeve" }), subtipo: "pagar", consentimento: "devido", porque: "moeda a quem o herói deve" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", oQue: "item", divida: "heroiDeve" }), subtipo: "devolver", consentimento: "devido", porque: "a coisa a quem a emprestou ao herói" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", retorno: true }), subtipo: "devolver", consentimento: "devido", porque: "a coisa volta a quem a tinha" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", oQue: "moedas", gesto: "divida" }), subtipo: "pagar", consentimento: "devido", porque: "moeda pelo que é devido" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", prazo: true }), subtipo: "emprestar", consentimento: "dado", porque: "o herói entrega com prazo" }),
    Object.freeze({ quando: Object.freeze({ de: "heroi", para: "outro", contra: null }), subtipo: "dar", consentimento: "dado", porque: "o herói entrega sem contrapartida" }),
    /* outro → herói */
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", contra: "moedas" }), subtipo: "comprar", consentimento: "pedido", porque: "o herói recebe e paga em moeda" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", contra: "item" }), subtipo: "escambo", consentimento: "dado", porque: "o herói recebe e entrega uma coisa sua" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", divida: "outroDeve" }), subtipo: "cobrar", consentimento: "devido", porque: "o outro deve isto ao herói" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", oQue: "moedas", gesto: "divida" }), subtipo: "cobrar", consentimento: "devido", porque: "a moeda que o herói diz que lhe devem" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", gesto: "tomar", forca: true }), subtipo: "furtar", consentimento: "tomado", porque: "o herói toma sem consentimento" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", gesto: "tomar" }), subtipo: "pegar", consentimento: "tomado", porque: "o herói pega sem pedir" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", prazo: true }), subtipo: "emprestar", consentimento: "pedido", porque: "o herói recebe com prazo" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", gesto: "trocar" }), subtipo: "comprar", consentimento: "pedido", porque: "o herói propõe receber em troca" }),
    Object.freeze({ quando: Object.freeze({ de: "outro", para: "heroi", gesto: ["pedir", "oferecer", "divida"] }), subtipo: "pedir", consentimento: "pedido", porque: "o herói pede" }),
  ]),
  /* a ordem da direção: o gesto, a posse, a preposição, o sentido do verbo sem gesto */
  porqueDaDirecao: Object.freeze({ gesto: "o gesto diz quem dá", posse: "só um lado tem a coisa", preposicao: "a preposição diz de onde ou para onde", sentido: "o verbo diz o sentido", contra: "quem compra um favor é quem paga" }),
});

const F = A_FORMA_DA_TROCA;
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const LADO = new Set(F.lados);
const ladoOk = (x) => (LADO.has(x) ? x : null);
const oposto = (x) => (x === "heroi" ? "outro" : "heroi");

/* ============================================================
   aDirecaoDaTroca(t) → { de, para, porque } | null
   t: {
     gesto    — uma das cinco classes, ou null;
     agente   — "heroi" | "outro" (quem age: o outro, no imperativo dirigido);
     sentido  — "da" | "recebe" (o que o agente faz com a coisa), ou null;
     fraco    — o sentido é de um verbo sem gesto («passo», «levo»): só vale por último;
     posse    — { heroi, outro, chao } (quem tem a coisa nomeada);
     texto    — { de, para } (o que as preposições dizem: «do X» → de "outro»; «me» → para "heroi";
                «pra X» → para "outro"), cada um ou null;
     contra   — { tipo } (quem compra um favor é quem paga)
   }
   ============================================================ */
export function aDirecaoDaTroca(t0) {
  try {
    const t = obj(t0) || {};
    const R = F.porqueDaDirecao;
    const ag = t.agente === "outro" ? "outro" : "heroi";
    const pelo = (da) => (da ? { de: ag, para: oposto(ag) } : { de: oposto(ag), para: ag });
    /* 0. «me»/«a mim», ditos ao outro, e «pra mim»: o herói é quem recebe — vale mais que o verbo e a posse */
    const tx0 = obj(t.texto) || {};
    if (tx0.paraMim) return Object.freeze({ de: "outro", para: "heroi", porque: R.preposicao });
    /* 1. o gesto forte (com consentimento) diz quem dá */
    if (t.gesto && F.gestos.includes(t.gesto) && !t.fraco && (t.sentido === "da" || t.sentido === "recebe")) return Object.freeze({ ...pelo(t.sentido === "da"), porque: R.gesto });
    /* 2. a moeda por um favor: o favor vem do outro, a moeda do herói */
    const ct = obj(t.contra);
    if (ct && ct.tipo === "favor") return Object.freeze({ de: "heroi", para: "outro", porque: R.contra });
    /* 4. a posse: um lado só tem a coisa */
    const p = obj(t.posse) || {};
    const lados = ["heroi", "outro", "chao"].filter((k) => p[k]);
    if (lados.length === 1) return Object.freeze({ de: lados[0], para: lados[0] === "heroi" ? "outro" : "heroi", porque: R.posse });
    /* 4. os dois lados (ou nenhum) têm a coisa: a preposição */
    const tx = obj(t.texto) || {};
    const de = ladoOk(tx.de), para = ladoOk(tx.para);
    if (de && de !== para) return Object.freeze({ de, para: para && para !== de ? para : de === "heroi" ? "outro" : "heroi", porque: R.preposicao });
    if (para) return Object.freeze({ de: para === "heroi" ? "outro" : "heroi", para, porque: R.preposicao });
    /* 5. o verbo sem gesto que só diz um sentido */
    if (t.sentido === "da" || t.sentido === "recebe") return Object.freeze({ ...pelo(t.sentido === "da"), porque: R.sentido });
    return null;
  } catch { return null; }
}

const casa = (esperado, valor) => (Array.isArray(esperado) ? esperado.includes(valor) : esperado === valor);

/* ============================================================
   aFormaDaTroca(t) → { subtipo, consentimento, porque, de, para, oQue, contra }
   t: { gesto, agente, de, para, oQue: { tipo: "moedas"|"item"|"favor", aVenda },
        contra: null | { tipo, implicita }, divida: null | "heroiDeve" | "outroDeve",
        prazo, retorno, forca, comPreco, contraImplicita, semPagar, pedidoSemVerbo }
   Sem forma que decida (o lado de onde vem a coisa não se sabe, ou o herói
   recebe sem gesto nenhum e sem contrapartida): subtipo null — a pergunta
   do Mestre, e nunca um tipo adivinhado.
   ============================================================ */
export function aFormaDaTroca(t0) {
  const nada = (porque) => Object.freeze({ subtipo: null, consentimento: null, porque: porque || "a forma não decide", de: null, para: null, oQue: null, contra: null });
  try {
    const t = obj(t0);
    if (!t) return nada();
    let de = t.de === "outro" || t.de === "heroi" || t.de === "chao" || t.de === "mundo" ? t.de : null;
    let para = t.para === "outro" || t.para === "heroi" ? t.para : null;
    if (!de || !para || de === para) return nada("não se sabe de que lado vem a coisa");
    let oQue = obj(t.oQue) ? { tipo: t.oQue.tipo || "item", aVenda: !!t.oQue.aVenda } : { tipo: "item", aVenda: false };
    let contra = obj(t.contra) && F.contrapartidas.includes(t.contra.tipo) ? { tipo: t.contra.tipo, implicita: !!t.contra.implicita } : null;
    /* «tô sem grana» só tira o preço do pedido feito ao outro («me dá… tô sem grana»): quem quer ou compra sem ter com
       que pagar continua comprando, e a bolsa responde «não chega» */
    if (t.semPagar && (t.agente === "outro" || (t.gesto === "pedir" && !t.comPreco)) && (!contra || contra.implicita)) contra = { tipo: "nenhuma", implicita: false };
    /* a normalização: o que anda é a coisa, e não a moeda que paga por ela («pago trinta pela espada»
       é a espada vindo, contra moeda) */
    if (oQue.tipo === "moedas" && contra && contra.tipo === "item") { [de, para] = [para, de]; oQue = { tipo: "item", aVenda: false }; contra = { tipo: "moedas", implicita: false }; }
    /* o favor que o herói recebe («compro o silêncio do Rato») é moeda que ele entrega por um favor */
    if (oQue.tipo === "favor") { de = "heroi"; para = "outro"; oQue = { tipo: "moedas", aVenda: false }; contra = { tipo: "favor", implicita: false }; }
    /* a contrapartida implícita: o que tem preço, recebido sem tomar, sem cobrar e sem dizer que não
       paga, paga-se em moeda */
    if (!contra && de === "outro" && para === "heroi" && oQue.aVenda && !F.semMoedaImplicita.includes(t.gesto) && !(t.gesto === "pedir" && t.agente !== "outro" && !t.comPreco) && !t.prazo && !t.retorno) contra = { tipo: "moedas", implicita: true };
    /* quem propõe troca e entrega a coisa sem dizer o quê recebe: a moeda de quem compra */
    if (!contra && de === "heroi" && para === "outro" && t.gesto === "trocar" && oQue.tipo === "item") contra = { tipo: t.contraImplicita === "item" ? "item" : "moedas", implicita: true };
    const v = {
      de, para, oQue: oQue.tipo,
      contra: contra && contra.tipo !== "nenhuma" ? contra.tipo : null,
      gesto: F.gestos.includes(t.gesto) ? t.gesto : null,
      divida: t.divida === "heroiDeve" || t.divida === "outroDeve" ? t.divida : null,
      prazo: !!t.prazo, retorno: !!t.retorno, forca: !!t.forca,
    };
    for (const l of F.linhas) {
      const q = l.quando;
      let ok = true;
      for (const k of Object.keys(q)) { if (!casa(q[k], v[k])) { ok = false; break; } }
      if (!ok) continue;
      return Object.freeze({ subtipo: l.subtipo, consentimento: l.consentimento, porque: l.porque, de, para, oQue: oQue.tipo, contra: v.contra });
    }
    return nada("o herói recebe sem gesto e sem contrapartida");
  } catch { return nada(); }
}
