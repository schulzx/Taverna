/* motor/a-escuta-da-cena.js (M5 · 18/11/2026) — «a escuta da cena».

   O exame do Mestre (mente/lancamento/o-mestre-vivo.md §11–§13) mostrou de
   onde vem o buraco maior: dois terços do que uma mesa real rolaria passam
   sem dado porque o catálogo (`lerAcao`, desafios.js) não reconhece a frase.
   E ensinar o catálogo verbo a verbo não generalizou — a metade que ninguém
   afinou quase não mexeu. Esta escuta ataca pela ESTRUTURA da frase:

     1. a MOLDURA que esconde o ato — «dá pra eu…?», «consigo…?», «será que
        consigo…», «queria ver se…», «posso…?», «vou tentar…» —: tira-se a
        moldura e lê-se o ato de dentro, como declaração;
     2. a FALA que pede algo a alguém (o pedido, a barganha, a ameaça, a
        afirmação falsa sobre si) — só quando há na cena quem a ouça;
     3. o ATO dito sem o verbo do catálogo (descer pela corda, passar a
        ponte, pé ante pé, vasculhar, seguir de longe): famílias de formas,
        por tabela;
     4. a PERGUNTA que é gesto de saber (o assunto raro, o rastro, o que há
        ali) — só quando a cena diz que há o que saber ou achar, e não há a
        quem perguntar.

   A escuta NÃO decide se rola: ela traduz a frase do jogador para a frase que
   o catálogo já ouve (a mesma gramática de `comoSeDiz`) e devolve o veredito
   do próprio catálogo. Quem decide é a régua (a-regua-do-momento.js), pela
   cena. Por isso a escuta só existe atrás da régua: sem cena ela nem é
   chamada, e o Mestre de hoje (sem cena) fica exatamente como era — ouvir
   «pulo da carroça» sem cena seria pedir dado na carroça parada.

   As formas saíram de três fontes, e só delas: os erros da metade A do exame,
   e as frases dos nossos dois corpus (corpus-da-mesa, corpus-das-situacoes)
   que o catálogo não ouvia. Nunca da metade B do exame, nunca de texto de
   mesa real.

   Nada aqui sorteia, e nada muta. */
import { lerAcao, comoSeDiz } from "../desafios.js";
import { lerCena } from "../cena-do-momento.js";

const nrm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9?\s'-]/g, " ").replace(/\s+/g, " ").trim();
const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);

/* ---------------- 1. AS MOLDURAS ----------------
   A moldura é a parte da frase que pergunta pela possibilidade ou anuncia a
   intenção; o ato mora no grupo capturado. A ordem importa: a moldura mais
   longa primeiro. */
export const MOLDURAS_DO_ATO = Object.freeze([
  /^(?:e\s+)?(?:sera\s+que\s+)?da\s+tempo\s+de\s+(?:eu\s+)?(.+)$/,
  /^(?:e\s+)?(?:sera\s+que\s+)?da\s+(?:pra|para)\s+(?:eu\s+|mim\s+|a\s+gente\s+)?(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?queria\s+(?:ver\s+se|saber\s+se)\s+(?:eu\s+)?(?:consigo\s+|da\s+(?:pra|para)\s+)?(.+)$/,
  /^(?:e\s+)?sera\s+que\s+(?:eu\s+)?(?:consigo\s+|da\s+(?:pra|para)\s+)?(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:consigo|conseguiria|posso|poderia|daria\s+(?:pra|para))\s+(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:vou|quero|vou\s+ver\s+se|deixa\s+eu)\s+tentar\s+(.+)$/,
  /^(?:e\s+)?(?:eu\s+)?(?:tento|tentarei)\s+(.+)$/,
]);

/* «dar uma intimidada», «dar uma geral»: o ato virou substantivo. A troca
   devolve o verbo ao catálogo. */
export const ATO_EM_SUBSTANTIVO = Object.freeze([
  Object.freeze({ rx: /\bdar? uma geral\b/, por: "revistar" }),
  Object.freeze({ rx: /\bdar? uma (?:olhada|espiada|conferida|checada|vistoria)\b/, por: "examinar" }),
  Object.freeze({ rx: /\bdar? uma (?:prensa|apertada|enquadrada)\b/, por: "intimidar" }),
  Object.freeze({ rx: /\bdar? uma (\w+)ada\b/, por: "$1ar" }),
]);

/* as condições da cena que as formas pedem */
const inerte = (p) => p.estados.includes("morta") || p.estados.includes("desacordada");
const temPessoa = (c) => c.pessoas.some((p) => !inerte(p));
const temPessoaQueNota = (c) => c.pessoas.some((p) => !p.estados.includes("do_grupo") && !inerte(p));
const temCriatura = (c) => c.criaturas.length > 0;
const haRaro = (c) => c.cena.estados.includes("assunto_raro");
const haAchado = (c) => c.coisas.some((x) => x.estados.includes("ha_algo_escondido") || x.estados.includes("armadilhado") || x.estados.includes("suspeito"));
/* a pergunta só é gesto quando não há a quem perguntar: com um estranho vivo
   em cena, «há estalagem no caminho?» é para ele, e pergunta não rola */
const ninguemAQuemPerguntar = (c) => !temPessoaQueNota(c);

/* ---------------- 2. A FALA QUE PEDE ----------------
   A forma da fala diz o ato social, mesmo sem o verbo do catálogo. Só vale
   quando há quem ouça (uma pessoa viva na cena); a régua decide pelo estado
   dela — e, porque é a leitura mais fraca, a fala ouvida aqui só rola quando
   quem ouve tem motivo para negar (a linha `falaSemOposicao` da régua). A
   ordem é a da força: a ameaça antes da mentira, a mentira antes do pedido.
   `diz`: como o catálogo ouve o ato — o verbo dele à frente da frase do
   jogador, para a conta do pedido (social.js) ler o pedido inteiro. */
export const FORMAS_DA_FALA = Object.freeze([
  Object.freeze({ id: "intimidar", diz: "ameaço ele:", rx: /\b(se (ele|ela|voce|vc|tu|o senhor) nao\b[^?.!]{0,60}\b(vai|vou|a guarda|morre|quebro|conto|acabo)|pressiono|aperto (ele|ela)|encosto (ele|ela) na parede|bato (a mao|o punho|com a mao) na mesa|ameac\w*|senao (eu|a guarda|vai)|ou (ele|ela|voce|vc) (me )?(fala|diz|conta|abre|entrega)|ou eu (te |lhe |a |o )?(levo|conto|entrego|mato|quebro|corto|chamo))\b/ }),
  Object.freeze({ id: "mentir", diz: "minto para ele:", rx: /\b((digo|falo|afirmo|juro|garanto|conto|explico)\b[^?.!]{0,40}\bque\b[^?.!]{0,30}\b(venho|sou|estou|trabalho|fui mandad\w*|me mand\w*|me espera\w*|a servico d\w*|em nome d\w*|autorizad\w*|tenho permissao|sou amigo)|me faco passar|faco-me passar|me passo por|finjo ser|nego que)\b/ }),
  Object.freeze({ id: "convencer", diz: "tento convencer ele:", rx: /\b(peco|pecar|insisto|imploro|suplico|negocio|pechincho|barganh\w*|descont\w*|suborn\w*|exijo|chega de mentir|quero o nome|e eu (te |lhe )?(dou|entrego|pago|limpo|ajudo|conto)|eu (te |lhe )?(dou|entrego|pago) [^?.!]{0,20}se|pago [^?.!]{0,30}(pra|para) (ele|ela) (fechar|deixar|esquecer|me deixar|olhar)|vamos conversar|vamos fazer um trato|(vc|voce|ele|ela|o senhor) (solta|soltar|deixa|libera|abre|me da|me vende)|grito (pra|para) (todo mundo|todos|a multidao|o povo|a gente)|virar (amigo|parceiro|camarada)|faco amizade|conto umas piadas)\b/ }),
  /* a fala dirigida sem forma de pedido: o verbo de dizer, a quem tem motivo
     para negar. A pergunta fica de fora (pergunta não rola). */
  Object.freeze({ id: "convencer", diz: "tento convencer ele:", se: (c) => c.pessoas.some((p) => !inerte(p) && p.estados.some((e) => OPOEM_A_FALA.includes(e))),
    rx: /^(?!.*\bpergunt)(?!.*\?\s*$).*\b(digo|falo|grito|explico|conto|aviso|mando|ordeno|proponho|ofereco|prometo|garanto|juro|argumento|lembro (a|ao|ele|ela))\b/ }),
]);
/* a fala direta: aspas, ou um vocativo curto antes da vírgula no começo */
const FALA_DIRETA = /["“”«»—]|^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?,\s/;
/* os estados de pessoa que fazem a fala dirigida virar tentativa */
const OPOEM_A_FALA = Object.freeze(["motivo_para_negar", "hostil", "desconfiada"]);

/* ---------------- 3. O ATO, POR FAMÍLIA DE FORMAS ----------------
   `id` é o desafio do catálogo; a frase que o catálogo ouve é a dele
   (`comoSeDiz`), ou, com `sobre`, «o que eu sei sobre…» com a frase dentro
   (para a régua do saber comum comparar o assunto com a ficha). `se`
   (opcional) é a condição da cena para a forma valer. A ordem decide: a
   memória antes do «vasculhar», o ouvido antes do olho. */
export const FORMAS_DO_ATO = Object.freeze([
  Object.freeze({ id: "lembrar", sobre: true, rx: /\b(procuro na memoria|puxo pela memoria|vasculho a memoria|reviro a memoria|lembro (de )?(alguma coisa|algo))\b/ }),
  Object.freeze({ id: "escutar", rx: /\b(ouvir (o que|alguma|algo|se|a conversa|melhor)|escut(o|ar) (o que|atras|na|pela|a conversa)|apuro o ouvido|encosto o ouvido|colo o ouvido|ouvido (na|a|colado)|presto atencao (ao|aos|a|as|no|na) (som|sons|barulho|ruido|conversa|vozes)|fico quieto e escuto|paro e escuto|o que (se passa|dizem) (la|do outro lado|atras))\b/ }),
  /* as duas seguintes vêm do classificador do protótipo (mente/classificador-
     prototipo.md), usado como farejador: os traços de maior peso dele para
     «investigar», treinados só com os nossos corpus (o de «atuar» foi
     tentado e saiu: ouvia o canto entre os seus como encenação) */
  Object.freeze({ id: "investigar", rx: /\b(deduz\w*|analis\w*|vestigios|quem fez (isto|isso)|o que aconteceu aqui|me agacho e (olho|examino|observo))\b/ }),
  /* ler a pessoa: a frase julga a sinceridade, a intenção ou o nervo de
     alguém da cena (dita ao Mestre, não a ela: sem «você») */
  Object.freeze({ id: "mentira", se: temPessoaQueNota, rx: /^(?!.*\b(voce|vc|tu)\b).*\b(mentindo|sincer\w*|confiar nel\w*|confiavel|blef\w*|escondendo (algo|alguma coisa)|nervos\w*|enrolando|me enganando|quer de verdade|intencao|intencoes|a cara del\w*|os olhos del\w*|a reacao del\w*|o jeito del\w*|leio (ele|ela|o rosto|a expressao))\b/ }),
  Object.freeze({ id: "seguir_alguem", se: temPessoaQueNota, rx: /\b(sig\w*|acompanho)\b[^?.!]{0,30}\b(discretamente|de longe|a (uma )?distancia|pela multidao|no meio da multidao|ate ver (onde|para onde|pra onde)|sem (que|ser))\b/ }),
  Object.freeze({ id: "furtar_se", rx: /\b(pe ante pe|ponta dos pes|de fininho|de mansinho|sem fazer (barulho|ruido)|sem ser (vist|notad|percebid)\w*|na surdina|escapo pela|escapulo|me escapo|saio escondid\w*|me esgueir\w*|sem ninguem (ver|notar|perceber)|me misturo (na|no|com)|fico nas sombras|pelas sombras|me abaixo atras|me agacho atras)\b/ }),
  /* a mão leve sem o verbo do catálogo: guardar escondido o que é de outro */
  Object.freeze({ id: "bater_carteira", se: temPessoaQueNota, rx: /\b(embolso|escondo na manga|enfio no bolso|guardo no bolso|passo a mao n\w*|afano|surrupio)\b/ }),
  Object.freeze({ id: "saltar", rx: /\b((pulo|salto|pular|saltar|me jogo|me atiro)\s+(da|do|de|das|dos|pela|pelo|para fora)|dou um (pulo|salto))\b/ }),
  Object.freeze({ id: "escalar", rx: /\b(desco|descer|subo|subir|trepo|trepar|me penduro|me pendurar)\b[^?.!]{0,30}\b(muro|muralha|parede|corda|arvore|penhasco|telhado|janela|torre|rocha|barranco|encosta|poco|fosso)\b/ }),
  Object.freeze({ id: "equilibrio", rx: /\b(passo|passar|atravesso|atravessar|cruzo|cruzar|vou passando|corro|correr)\b[^?.!]{0,30}\b(ponte|pinguela|viga|tabua|corda bamba|beiral|parapeito|tronco|borda|beirada)\b/ }),
  Object.freeze({ id: "escapar", rx: /\b(escapo|me solto|me livro|me desvencilho|passo espremid\w*|passo de lado)\b[^?.!]{0,30}\b(abraco|agarr\w*|cordas?|grade|correntes?|algemas?|maos|pegada|fresta|vao)\b/ }),
  Object.freeze({ id: "nadar", rx: /\b(mergulho|mergulhar)\b/ }),
  Object.freeze({ id: "buscar", rx: /\b(reviro|revirar|vasculh\w*|revist\w*|fuco|fucar|apalpo|dou uma geral|olho bem|examino bem)\b/ }),
  Object.freeze({ id: "buscar", rx: /\b(olho|procuro|corro os olhos|passo os olhos)\b[^?.!]{0,40}\b(pra|para) ver se (acho|encontro|vejo|tem|ha)\b/ }),
  Object.freeze({ id: "buscar", rx: /\bfico (olhando|observando|de olho|atento)\b[^?.!]{0,20}\bse\b/ }),
  Object.freeze({ id: "buscar", rx: /\b(cheiro|farejo|provo um pouco)\b/ }),
  Object.freeze({ id: "bater_carteira", se: temPessoaQueNota, rx: /\b((pego|tiro|puxo|levo|afano|surrupio|arranco)\s+(a|o|as|os)\s+(bolsa|bolsinha|carteira|chave|chaves|anel|colar|moedas|faca|adaga|algibeira|sacola)\s+(dele|dela|do|da)|(pego|tiro|puxo|levo)\b[^?.!]{0,30}\benquanto (ele|ela) (olha|esta distraid\w*|nao ve|vira|se vira))\b/ }),
  Object.freeze({ id: "acalmar_bicho", se: temCriatura, rx: /\b(sussurro|falo baixo|falo manso|estendo a mao|acaricio|afago|faco carinho)\b/ }),
  Object.freeze({ id: "forcar", rx: /\b(queda de braco|braco de ferro|faco (toda a )?forca|empurro com tudo|puxo com (toda|tudo)|(dobr\w*|entort\w*|afasto|ergo|levanto|arrasto)\b[^?.!]{0,20}\b(barras?|laje|pedregulho|rocha|bloco|viga|tronco caido|grade))\b/ }),
  Object.freeze({ id: "aguentar", se: temPessoa, rx: /\b(agarro|seguro|pego)\s+(a mao|o braco|o pulso|a corda)\b[^?.!]{0,40}\b(puxo|ergo|levanto|ico|seguro firme)\b/ }),
  Object.freeze({ id: "aguentar", rx: /\b(resist\w* (a|ao|as|aos) (veneno|febre|frio|dor|fome|sede|cansaco|gas|fumaca|calor|doenca|sono)|nao desmaiar|mesmo desconfiando)\b/ }),
  Object.freeze({ id: "heraldica", rx: /\b(emblema|brasao|insignia|tatuagem|sinete|estandarte|flamula)\b[^?.!]{0,40}\b(de onde|de quem|origem|a quem pertence|que casa|que ordem)\b/ }),
  Object.freeze({ id: "arcano", rx: /\b((ler|leio|decifr\w*|entender|traduzir)\b[^?.!]{0,30}\b(livro|grimorio|runas?|inscric\w*|pergaminho|feitic\w*)|(sentir|sinto)\b[^?.!]{0,20}\b(magia|encant\w*|feitic\w*|o que (e|ela e|ele e)))\b/ }),
  Object.freeze({ id: "falsificar", rx: /\b(imitando a letra|imito a letra|imito a assinatura|forjo|copio o selo)\b/ }),
  Object.freeze({ id: "orientar", rx: /\b((leio|consulto|estudo) o mapa|pelas estrelas|pelo sol|acho o (rumo|caminho|norte))\b/ }),
]);

/* ---------------- 4. A PERGUNTA QUE É GESTO ----------------
   Perguntar não rola (estudo das mesas §6) — salvo quando a pergunta É o
   gesto: lembrar um assunto raro, procurar o rastro, ver o que há ali. A
   condição da cena é o que separa a pergunta do gesto: há o que saber ou
   achar, e não há a quem perguntar. */
export const PERGUNTAS_QUE_SAO_GESTO = Object.freeze([
  Object.freeze({ id: "rastrear", rx: /\b(rastros?|pegadas?|pisadas?|trilha de)\b/, se: (c) => haAchado(c) && ninguemAQuemPerguntar(c) }),
  Object.freeze({ id: "buscar", rx: /\b(tem|ha|existe)\b[^?.!]{0,40}\b(aqui|ali|por aqui|nas|nos|no|na|dentro)\b/, se: (c) => haAchado(c) && ninguemAQuemPerguntar(c) }),
  Object.freeze({ id: "lembrar", sobre: true, rx: /\?\s*$/, se: (c) => haRaro(c) && ninguemAQuemPerguntar(c) }),
]);

/* a pergunta dirigida a alguém (a fala entre aspas, o «pergunto», o você)
   nunca é gesto de saber */
const FALA_DIRIGIDA = /["“”«»]|\b(pergunto|digo|falo|peco|respondo|voce|vc|tu|senhor|senhora)\b/;

/* o veredito do catálogo para a frase traduzida, se for teste */
function oCatalogoOuve(frase, leitura) {
  let v = null;
  try { v = lerAcao(frase, leitura); } catch { v = null; }
  return v && v.tipo === "teste" ? v : null;
}
const semMoldura = (t) => {
  for (const rx of MOLDURAS_DO_ATO) { const m = t.match(rx); if (m && m[1] && m[1].trim()) return m[1].trim(); }
  return "";
};
const verbal = (t) => ATO_EM_SUBSTANTIVO.reduce((s, x) => s.replace(x.rx, x.por), t);
/* A primeira do plural vira a do singular: «-amos/-emos/-imos» → «-o», e o
   «nos» átono antes do verbo vira «me». Os verbos que não são ação de
   ninguém («vamos», «somos», «estamos», «temos») ficam como estão. */
export const PLURAL_QUE_FICA = Object.freeze(["vamos", "somos", "estamos", "temos", "podemos", "devemos", "queremos", "precisamos", "fomos", "ficamos"]);
const emSingular = (t) => t
  .replace(/\bnos (?=\w+(amos|emos|imos)\b)/g, "me ")
  .replace(/\b(\w{2,}?)(amos|emos|imos)\b/g, (m, raiz) => (PLURAL_QUE_FICA.includes(m) ? m : raiz + "o"));
const pelaForma = (lista, t, c) => lista.find((f) => f.rx.test(t) && (!f.se || f.se(c))) || null;
const fraseDe = (f, t, ctx) => oCatalogoOuve(f.sobre ? `o que eu sei sobre ${t}?` : comoSeDiz(f.id), ctx);

/* ---------------- A ESCUTA ----------------
   `frase`: o que o jogador escreveu. `cena`: a cena (crua ou lida); sem
   cena, devolve null (a escuta não existe sem cena). `leitura`: o contexto
   de `lerAcao` (personagem, lugar, pessoaDe…). Devolve o veredito do
   catálogo para o ato que a frase esconde, com `escuta` dizendo por qual
   porta ele foi ouvido — ou null. */
export function escutarComCena(frase, cena, leitura) {
  const c = lerCena(cena);
  if (!c || typeof frase !== "string" || !frase.trim()) return null;
  const ctx = obj(leitura) ? leitura : {};
  const t = nrm(frase);
  const semInterrogacao = t.replace(/\?\s*$/, "").trim();
  const pergunta = /\?\s*$/.test(t);
  const marca = (v, porta) => (v ? Object.freeze({ ...v, escuta: porta }) : null);
  /* 1. a moldura: o ato de dentro, como declaração */
  const dentro = semMoldura(semInterrogacao);
  const corpo = verbal(dentro || semInterrogacao);
  /* 0. a mesa fala em grupo: «nos escondemos», «tentamos abrir» — o
     catálogo foi escrito na primeira do singular */
  const singular = emSingular(semInterrogacao);
  if (singular !== semInterrogacao) {
    const v = oCatalogoOuve(singular, ctx);
    if (v) return marca(v, "grupo");
  }
  if (dentro) {
    const v = oCatalogoOuve("tento " + corpo, ctx);
    /* o improviso é a família do verbo, a leitura mais vaga do catálogo:
       se a forma do ato diz mais («consigo ouvir…?» é escutar, não «olhar
       com atenção»), vale a forma */
    const a = v && v.id === "improviso" ? pelaForma(FORMAS_DO_ATO, corpo, c) : null;
    const pela = a ? fraseDe(a, corpo, ctx) : null;
    if (pela) return marca(pela, "moldura");
    if (v) return marca(v, "moldura");
  }
  /* 2. a fala que pede, se há quem ouça */
  if (temPessoa(c)) {
    /* a fala direta — entre aspas, ou chamando alguém pelo nome ou pelo
       ofício antes da vírgula («chefe, …») — é dirigida, mesmo sem verbo de
       dizer; vale como a última forma da tabela (a quem tem motivo para
       negar, e nunca a pergunta) */
    const direta = !pergunta && FALA_DIRETA.test(String(frase).trim());
    const f = pelaForma(FORMAS_DA_FALA, corpo, c)
      || (direta ? pelaForma(FORMAS_DA_FALA.slice(-1).map((x) => ({ ...x, rx: /./ })), corpo, c) : null);
    if (f) {
      const v = oCatalogoOuve(`${f.diz} ${frase}`, ctx) || oCatalogoOuve(comoSeDiz(f.id), ctx);
      if (v) return marca(v, "fala");
    }
  }
  /* 3. o ato pela forma */
  const a = pelaForma(FORMAS_DO_ATO, corpo, c);
  if (a) {
    const v = fraseDe(a, corpo, ctx);
    if (v) return marca(v, "ato");
  }
  /* 4. a pergunta que é gesto — nunca a dirigida a alguém */
  if ((pergunta || dentro) && !FALA_DIRIGIDA.test(String(frase).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""))) {
    const p = pelaForma(PERGUNTAS_QUE_SAO_GESTO, t, c);
    if (p) {
      const v = fraseDe(p, semInterrogacao, ctx);
      if (v) return marca(v, "pergunta");
    }
  }
  return null;
}
