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
  custoDeFalhar, respostaDaPergunta, estadosQueChamam, estadoPorId, temMarca, alvoDaAcao,
  temMarcaNoAlvo, coisasQueAFraseNomeia, aCenaQueAFraseToca,
} from "../cena-do-momento.js";
import { escutarComCena, molduraDe, atosDaFrase } from "./a-escuta-da-cena.js";
import { lerAcao } from "../desafios.js";
import { TAMANHOS_DO_PEDIDO, pesoDoPapel } from "../social.js";

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

/* ---------------- O CONSERTO DEPOIS DA PRIMEIRA SESSÃO (19/11/2026) ----------------
   mente/lancamento/o-mestre-vivo.md §17. Quatro tabelas, cada uma de um
   defeito que a sessão jogada mostrou (mestre-vivo-sessao.md §5). */

/* (a) O RISCO DO ATO. «vou escalar o muro do forte pra espiar de cima» rolou
   no Mestre de hoje e passou de graça no novo: a régua só via perigo em
   ESTADO (o chão liso, a pressa), e nenhum estado dizia altura. O veredito do
   catálogo já traz a queda (`v.queda`, desafios.js#quedaDe); quando ela é de
   uma fortificação, cair é o preço do próprio ato, sem estado nenhum. A
   altura comum (o muro do quintal, o telhado, a beirada de uma trilha larga)
   continua calma — o exame (E174, E365, E371) e o estudo das mesas dizem que
   a travessia sem perigo nem pressa não rola. `ids`: os desafios que caem;
   `altura`: as palavras da frase que dizem fortificação; `quedaQuePune`: o
   nome da altura (ALTURA_POR_LUGAR) que já é de torre. */
export const RISCO_DO_ATO = Object.freeze({
  ids: Object.freeze(["escalar", "saltar", "equilibrio"]),
  altura: /\b(muralhas?|forte|fortaleza|castelo|torres?|torreao|bastiao|baluarte|ameias?|atalaia|campanario|farol|mastro)\b/,
  quedaQuePune: Object.freeze(["a torre"]),
});
/* 19/11 (o-mestre-vivo.md §19): O PERIGO QUE A FRASE DECLARA. A terceira
   sessão jogada viu o corpo em risco passar calmo: «salto o vão de três
   metros por cima da água» (T12) e «pulo os barris fugindo de quem vem
   armado» (T27; na sessão 2, «pulando de barco em barco» em fuga). A régua
   só via perigo em ESTADO, e nenhum estado diz vão, água ou perseguidor — o
   mundo ainda não os escreve (fragil, em_movimento: ESTADOS_SEM_FONTE). Mas
   quem os diz é o jogador, na própria frase: como a muralha, o perigo é do
   ato. Só o que a frase DECLARA conta — a medida, o vão, a água por baixo, a
   fuga —, nunca a palavra solta: «pulo na água e nado até o bote» (exame,
   E196) e «subo no telhado pela calha» (E365), ditos numa cena calma,
   continuam sem dado, como a mesa real os deixou.
   `vao`: o salto por cima do vazio; `agua`: a água POR BAIXO do ato;
   `fuga`: alguém atrás do herói (a pressa é do ato); `metros` / `medida`:
   a altura ou a distância dita em número, a partir de `metrosQuePunem`. */
export const PERIGO_DECLARADO = Object.freeze({
  vao: /\b(vao|vaos|fenda|abismo|precipicio|ravina|desfiladeiro|entre (os|as|dois|duas) (telhados|trapiches|barcos|predios|casas|torres|rochas|pedras|mastros|navios)|de (um |uma )?(telhado|barco|trapiche|predio|casa|navio|mastro|rocha|pedra) (em|pra|para|pro|ao) (outr[oa]|o outro|a outra|telhado|barco|trapiche|navio))\b/,
  agua: /\b(sobre|por cima d[aoe]s?|acima d[aoe]s?|em cima d[aoe]s?|por sobre)\s+(a |o |as |os )?(agua|aguas|rio|mar|canal|correnteza|riacho|lago|doca|porto)\b/,
  fuga: /\b(fug\w*|fujo|foge|escapando|perseguid\w*|me persegu\w*|atras de mim|no meu encalco|na minha cola|vem atras|correndo d[eao]s? \w+,? (que|armad\w*|de (faca|espada|adaga|arco|besta)))\b/,
  medida: /\b(\d+|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|doze|quinze|vinte)\s*(m|metros?)\b/,
  numeros: Object.freeze({ dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, doze: 12, quinze: 15, vinte: 20 }),
  metrosQuePunem: 3,
  /* a altura dita em andares («dois andares acima do cais») */
  andares: /\b(\d+|dois|duas|tres|quatro|cinco|seis)\s+andares\b/,
  andaresQuePunem: 2,
  ids: Object.freeze(["escalar", "saltar", "equilibrio"]),
});
function perigoDeclarado(frase, id) {
  const t = semAcento(frase);
  if (!t) return "";
  const P = PERIGO_DECLARADO;
  if (P.fuga.test(t)) return "fuga";
  if (!P.ids.includes(id)) return "";
  if (P.vao.test(t)) return "vao";
  if (P.agua.test(t)) return "agua";
  const m = t.match(P.medida);
  const quanto = (x) => (x ? (/^\d+$/.test(x[1]) ? Number(x[1]) : P.numeros[x[1]] || 0) : 0);
  if (quanto(t.match(P.andares)) >= P.andaresQuePunem) return "medida";
  return quanto(m) >= P.metrosQuePunem ? "medida" : "";
}
const riscoDoAto = (x) => !!x.v && ((RISCO_DO_ATO.ids.includes(x.v.id) && !!x.v.queda
  && (RISCO_DO_ATO.altura.test(semAcento(x.frase)) || RISCO_DO_ATO.quedaQuePune.includes(x.v.queda.nome)))
  || !!perigoDeclarado(x.frase, x.v.id));

/* (c) O MOTIVO PARA NEGAR, LIDO NO ALVO DA FALA. Era um estado sem fonte
   (a-cena-do-jogo.js, ESTADOS_SEM_FONTE): como estado da pessoa, sem o
   tamanho do pedido, faria a pergunta de cortesia ao guarda rolar. Aqui ele é
   da FALA: o papel de quem ouve e o tamanho do que se pede, para o alvo da
   frase (alvoDaAcao), nunca para a cena inteira. Quem ouve tem motivo para
   negar quando não está do seu lado (nem disposto, nem com medo, nem fora de
   si) e:
     - o pedido custa a ele (os degraus da escada do pedido, social.js,
       DITOS na frase — o degrau padrão não conta: frase que não diz o que
       pede não é pedido grande);
     - é o dinheiro dele que está em jogo (`preco`: a barganha, o desconto —
       a escada não ouvia «barganhar» nem «pelo preço normal»);
     - veste farda, batina ou brasão (o papel que pesa contra na escada,
       social.js#pesoDoPapel, delta > 0): para ele, até a boa vontade pedida
       a um estranho (o degrau da simpatia) já custa;
     - guarda um segredo e a frase o pressiona (insistir, ameaçar, não
       perguntar) — o dado vem quando o jogador pressiona (§3, o segredo).
   Nunca quando a frase resolve pela magia («conjuro amizade nele antes de
   pedir»): a magia resolve pela própria regra (estudo das mesas §6). */
export const MOTIVO_PARA_NEGAR_DO_ALVO = Object.freeze({
  degraus: Object.freeze(["favor", "risco", "traicao"]),
  degrausDaAutoridade: Object.freeze(["simpatia", "favor", "risco", "traicao"]),
  magia: /\b(conjur\w*|lanc\w* (um |uma |o |a )?(feitic\w*|magia|encant\w*|amizade)|feitic\w*|encanto)\b/,
  preco: /\b(barganh\w*|pechinch\w*|regate\w*|descont\w*|abatimento|(faz|deixa|fica|sai) (por )?mais barato|metade do preco|preco (normal|justo|de sempre|de tabela|certo|menor)|baix\w* o preco|faz (por|pelo) (menos|\d+|dez|vinte|trinta|quarenta|cinquenta)|(pagar|pago|ofereco|oferecer|dou|dar) (bem |muito |um pouco )?menos|(fecha|feche|fechar|fechamos|deixa|deixe|vende|venda|fica|faca|larga|solta) (por|em|a) (\d+|dez|doze|quinze|vinte|trinta|quarenta|cinquenta|metade))\b/,
  /* 21/11 (o-mestre-vivo.md §20): a boa vontade não paga a conta. «Regateio
     com a vendedora» rolou uma vez em três na quarta sessão: com a vendedora
     disposta, a régua dizia «com quem está disposto, a conversa resolve». Mas
     o desconto sai do bolso dela, goste ela ou não do herói. Só o laço que
     DEVE algo (o favor, o companheiro, o sim já dado) dispensa o dado do
     preço; a simpatia (`disposta`) não. */
  precoContraASimpatia: Object.freeze(["disposta"]),
  /* pressionar: a ameaça, ou a conversa que insiste («insisto», «exijo»,
     «te encaro até você falar») — pedir a quem guarda segredo não é pressionar */
  pressao: /\b(insist\w*|exij\w*|exigir|pression\w*|encaro|nao saio daqui|ate (ele|ela|voce|vc) (falar|contar|dizer|abrir o bico)|fala logo|desembucha)\b/,
});
function motivoParaNegarDoAlvo(x) {
  const M = MOTIVO_PARA_NEGAR_DO_ALVO;
  if (!x.social || x.op.facilita || x.op.cede || x.op.inerte || !x.op.quem) return false;
  const t = semAcento(x.frase);
  if (!t || M.magia.test(t)) return false;
  const pergunta = /\?\s*$/.test(t);
  if (M.preco.test(t)) return true;
  /* 19/11 (§18): o alvo já resolvido pela frase (quem ela nomeia, ou o
     estranho a quem ela se dirige e que não está no retrato) */
  const alvo = x.alvo || alvoDaAcao(x.cena, { sobre: "pessoa", quem: x.quem });
  const papel = alvo ? pesoDoPapel(alvo.papel || alvo.nome) : null;
  const degraus = papel && papel.delta > 0 ? M.degrausDaAutoridade : M.degraus;
  if (TAMANHOS_DO_PEDIDO.some((d) => degraus.includes(d.id) && d.rx.test(t))) return true;
  const pressiona = x.familia === "intimidar" || (x.familia === "convencer" && M.pressao.test(t));
  return pressiona && !pergunta && x.op.estados.includes("esconde_algo");
}

/* (b) A VÍTIMA DO FURTO. «tento roubar uma bolsa do bolso de um bêbado»: a
   frase diz de quem se tira, e a vítima pode notar — é oposição por
   definição, esteja ou não no retrato. Só a vítima fora de si (morta,
   desacordada) e sem mais ninguém que note deixa a mão leve sem dado. Quem
   dorme ou está desacordado dá vantagem, e não dispensa o dado se há outro
   alguém. */
export const A_VITIMA_DO_FURTO = Object.freeze({
  rx: /\b(bolso|bolsa|bolsinha|algibeira|carteira|cinto|cinturao|mochila|sacola)\s+(d[eoa]s?\s+|dele|dela|deles|delas)/,
  vantagem: Object.freeze(["dormindo", "desacordada"]),
  diz: "quem vai ser roubado não está atento",
});
const vitimaNaFrase = (x) => A_VITIMA_DO_FURTO.rx.test(semAcento(x.frase)) && !x.cena.pessoas.some((p) => tem(p, "inerte"));
const tem = (p, marca) => p.estados.some((id) => (estadoPorId(id) || {})[marca]);

/* (3) QUEM FALA COM VOCÊ SE OUVE. «quero ouvir o que ela tem pra me contar»
   rolou Percepção para ouvir quem conversava com o herói, e a falha foi
   desmentida pela fala inteira na linha seguinte. Ouvir quem fala COM você é
   conversa, não escuta: não rola. */
export const OUVIR_QUEM_FALA = /\bouvir\b[^?.!]{0,40}\b(?:(?:me|nos) (?:contar|dizer|falar)|tem (?:pra|para|a) (?:me |nos )?(?:contar|dizer|falar))\b/;

/* ---------------- O CONSERTO DEPOIS DA SEGUNDA SESSÃO (19/11/2026) ----------------
   mente/lancamento/o-mestre-vivo.md §18. Mentira, ameaça e barganha passaram
   sem dado (mestre-vivo-sessao-2.md, T3, T5, T8, T14, T16, T17, T30), e um
   favor pedido ao companheiro rolou Persuasão 18 (T13). Duas causas.

   (d) A QUEM A FALA SE DIRIGE. A régua tomava por alvo o primeiro de fora do
   grupo, e sem ninguém de fora, o companheiro: «digo pro cobrador que sou
   enviado do conselho» caiu em Jasper, que está do seu lado, e passou de
   graça; «peço pro Jasper dar uma volta entre os soldados» caiu na
   artilheira, e rolou. Agora o alvo sai da frase:
     - quem a frase NOMEIA e está na cena (o nome próprio, ou o papel inteiro),
       o primeiro a aparecer na frase;
     - sem nome, quando só há gente do grupo e a frase se dirige a outra
       pessoa («pro vendedor», «ao guarda»), essa pessoa é um estranho que o
       retrato não tem — sem estado nenhum, como todo estranho.
   `dirigida`: a preposição e a palavra; `naoEPessoa`: as palavras que vêm
   depois da preposição e não são gente; o verbo no infinitivo («pra fugir»)
   também não é. `minimo`: o tamanho mínimo de um pedaço de nome. */
export const O_ALVO_DA_FALA = Object.freeze({
  dirigida: /\b(?:pro|pros|pra|pras|ao|aos|para o|para a|para os|para as)\s+(?:seu |sua |esse |essa |este |esta |aquele |aquela |tal |o |a )?([a-z]{3,})\b/g,
  naoEPessoa: Object.freeze(["ele", "ela", "eles", "elas", "mim", "voce", "voces", "gente", "dentro", "fora", "frente", "tras", "cima",
    "baixo", "lado", "cidade", "rua", "porta", "casa", "alto", "chao", "mesa", "ali", "aqui", "onde", "quem", "isso", "isto", "aquilo",
    "todo", "toda", "todos", "todas", "mais", "menos", "nada", "tudo", "outro", "outra", "meu", "minha", "nosso", "nossa"]),
  minimo: 3,
  /* 21/11 (§20): gente cujo nome acaba como verbo — «conto a mesma mentira
     pra mulher da criança» caía no companheiro, porque «mulher» parecia
     «pra fazer» */
  naoEInfinitivo: Object.freeze(["mulher", "colher"]),
  /* 21/11 (a sexta sessão, T9): «peço à meio-orc da banca que me dê um pedaço
     de corda» — o «à» sem acento é «a», que sozinho não é preposição de fala
     («vou a pé»), e o pedido caía na companheira (o sim de quem está do meu
     lado). Depois de um verbo de pedir ou de dar, com a fala logo a seguir
     (que, dois pontos, vírgula), o «a» diz o ouvinte. */
  pedidoA: /\b(?:peco|pedimos|pergunto|ofereco|dou|pago|entrego|mostro|devolvo|regateio|pechincho|negocio|minto|ameaco|digo|juro|garanto|conto|explico)\s+(?:a|as)\s+([a-z][a-z'-]{2,})(?:\s+d[aeo]s?\s+[a-z'-]+)?\s*(?:que\b|:|,)/,
});
/* «-or» fica de fora de propósito: «cobrador», «vendedor», «senhor» são gente */
const ehInfinitivo = (w) => /(ar|er|ir)$/.test(w) && !O_ALVO_DA_FALA.naoEInfinitivo.includes(w);
/* o papel sem a vogal do gênero: «artilheiro» e «artilheira» são o mesmo */
const raizDoPapel = (s) => semAcento(s).replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim().split(" ").map((w) => w.replace(/(o|a|os|as)$/, "")).join(" ");
const noTexto = (t, pedaco) => {
  if (!pedaco) return -1;
  const m = new RegExp(`\\b${pedaco.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).exec(t);
  return m ? m.index : -1;
};
/* quem da cena a frase nomeia → a pessoa (a primeira que aparece) ou null */
export function quemAFraseNomeia(frase, cena) {
  const c = lerCena(cena);
  if (!c || typeof frase !== "string") return null;
  const t = semAcento(frase);
  const tRaiz = raizDoPapel(frase);
  let melhor = null, onde = Infinity;
  for (const p of c.pessoas) {
    /* o nome próprio: os pedaços que começam com maiúscula */
    const pedacos = String(p.nome || "").split(/[\s,()]+/).filter((w) => /^[A-ZÀ-Ý]/.test(w) && w.length >= O_ALVO_DA_FALA.minimo).map(semAcento);
    for (const w of pedacos) { const i = noTexto(t, w); if (i >= 0 && i < onde) { melhor = p; onde = i; } }
    /* o papel inteiro, sem o gênero */
    const r = p.papel ? raizDoPapel(p.papel) : "";
    if (r.length >= O_ALVO_DA_FALA.minimo) { const i = noTexto(tRaiz, r); if (i >= 0 && i < onde) { melhor = p; onde = i; } }
  }
  return melhor;
}
/* o estranho a quem a frase se dirige quando só há gente do grupo → a
   palavra («vendedor») ou "" */
export function estranhoAQuemSeFala(frase, cena) {
  const c = lerCena(cena);
  if (!c || typeof frase !== "string") return "";
  const vivos = c.pessoas.filter((p) => !p.estados.some((id) => (estadoPorId(id) || {}).inerte));
  if (!vivos.length || vivos.some((p) => !p.estados.includes("do_grupo"))) return "";
  const t = semAcento(frase);
  for (const m of t.matchAll(O_ALVO_DA_FALA.dirigida)) {
    const w = m[1];
    if (O_ALVO_DA_FALA.naoEPessoa.includes(w) || ehInfinitivo(w)) continue;
    if (vivos.some((p) => semAcento(p.nome).split(/\s+/).includes(w) || raizDoPapel(p.papel || "") === raizDoPapel(w))) continue;
    return w;
  }
  const a = t.match(O_ALVO_DA_FALA.pedidoA);
  const w = a ? a[1] : "";
  if (w && !O_ALVO_DA_FALA.naoEPessoa.includes(w) && !ehInfinitivo(w)
    && !vivos.some((p) => semAcento(p.nome).split(/\s+/).includes(w) || raizDoPapel(p.papel || "") === raizDoPapel(w))) return w;
  return "";
}

/* 19/11 (o-mestre-vivo.md §19): O NOME QUE NÃO ESTÁ EM CENA. A terceira
   sessão jogada mentiu ao guarda (T2), pediu metade do preço (T5) e mentiu
   a Bryna (T24) sem dado — e com a mesma frase, no T20, rolou. A diferença
   não estava na ação: estava em QUEM o painel tinha em cena. Quando a pessoa
   de quem a frase fala não está no retrato (o painel ainda perde gente: é
   outro pacote), o alvo caía no primeiro de fora, ou, só com o grupo, no
   companheiro — e a companheira «aceita» a mentira dita ao guarda. Agora:
     - o nome próprio a quem a frase se dirige («pra Bryna», «ao Doran») e
       que não está em cena é um estranho fora do retrato, mesmo com outras
       pessoas de fora presentes — só logo depois do verbo da fala
       (`verbosDaFala`: «minto pra Bryna», «digo ao Doran»), porque o nome
       solto na frase («digo ao guarda que a Helga me mandou») é assunto, não
       ouvinte; lido com as maiúsculas, antes de baixar a caixa;
     - o nome ou o papel que a frase traz e que não casa com ninguém da cena
       nunca cai no companheiro: é um estranho;
     - a barganha («pela metade do preço», «regateio») sem nome, com só o
       grupo em cena, é com quem vende (`quemVende`): ninguém regateia com a
       companheira de viagem. */
export const O_ALVO_AUSENTE = Object.freeze({
  verbosDaFala: Object.freeze(["minto", "digo", "falo", "conto", "explico", "juro", "garanto", "grito", "sussurro", "peço", "peco", "pergunto",
    "respondo", "confesso", "invento", "asseguro", "ameaço", "ameaco", "prometo", "aviso"]),
  ouvinte: "\\s+(?:(?!que\\s)\\S+\\s+)?(?:pro|pra|pros|pras|ao|aos|a|à|para o|para a)\\s+([A-ZÀ-Ý][a-zà-ÿ]{2,})(?![\\p{L}])",
  quemVende: "quem vende",
});
/* o verbo com a primeira letra nas duas caixas (a frase pode começar com ele) */
const RX_DO_OUVINTE = new RegExp("(?:^|[^\\p{L}])(?:" + O_ALVO_AUSENTE.verbosDaFala.map((v) => "[" + v[0] + v[0].toUpperCase() + "]" + v.slice(1)).join("|") + ")" + O_ALVO_AUSENTE.ouvinte, "gu");
/* 21/11 (§25, a quinta sessão jogada): O NOME CHAMADO. «chamo Magnus:
   Magnus, vem cá», «falo com Jora Olho-de-Corvo: Jora, preciso da sua
   ajuda» e «grito pelo nome dela: Magnus! Magnus, você está aí?» não tinham
   ouvinte para a régua (o «chamo» não era verbo da fala, o «com» não era
   ligação, e o nome solto depois de dois pontos não era lido) — e quem não
   está em cena não saía como «não está aqui». Três formas, além do verbo da
   fala com a ligação:
     - `direto`: o verbo de chamar com o nome logo a seguir («chamo Magnus»);
     - a ligação `com` («falo com Jora»), nos verbos da fala;
     - `vocativo`: o nome com vírgula, exclamação ou interrogação, logo
       depois de dois pontos, de aspas ou do começo, e só quando a frase fala
       a alguém (`aAlguem`: «vem cá», «você», «preciso», «aparece») — o
       «Depois, vou ao cais» não chama ninguém.
   `naoEChamado`: as palavras que abrem um vocativo sem serem nome. */
export const O_NOME_CHAMADO = Object.freeze({
  direto: "(?:^|[^\\p{L}])(?:[Cc]hamo|[Cc]hamar|[Cc]hamamos|[Gg]rito por|[Gg]rito pelo|[Cc]lamo por)\\s+(?:o\\s+|a\\s+)?([A-ZÀ-Ý][a-zà-ÿ]{2,})(?![\\p{L}])",
  com: "(?:^|[^\\p{L}])(?:[Ff]alo|[Cc]onverso|[Ff]alamos|[Cc]onversamos)\\s+com\\s+(?:o\\s+|a\\s+)?([A-ZÀ-Ý][a-zà-ÿ]{2,})(?![\\p{L}])",
  vocativo: "(?:^|[:\"“«—]\\s*)([A-ZÀ-Ý][a-zà-ÿ]{2,})\\s*[,!?]",
  aAlguem: /\b(vem|venha|vem ca|aparece|apareca|voce|vc|preciso|escuta|escute|ajuda|me ajuda|cade|esta ai|ta ai|responde|responda|espera|espere)\b/,
  naoEChamado: Object.freeze(["senhor", "senhora", "moco", "moca", "amigo", "amiga", "ei", "ola", "oi", "bom", "boa", "depois", "entao", "sim", "nao", "claro", "certo", "pronto", "bem", "agora", "ali", "aqui", "olha", "escuta", "vamos"]),
});
const RX_CHAMADO_DIRETO = new RegExp(O_NOME_CHAMADO.direto, "gu");
const RX_CHAMADO_COM = new RegExp(O_NOME_CHAMADO.com, "gu");
const RX_VOCATIVO = new RegExp(O_NOME_CHAMADO.vocativo, "gu");
/* os nomes que a frase chama, na ordem em que aparecem (sem a cena) */
function nomesChamados(frase) {
  const achados = [];
  const poe = (m) => { if (m && m[1]) achados.push({ i: m.index, nome: m[1] }); };
  for (const m of frase.matchAll(RX_DO_OUVINTE)) poe(m);
  for (const m of frase.matchAll(RX_CHAMADO_DIRETO)) poe(m);
  for (const m of frase.matchAll(RX_CHAMADO_COM)) poe(m);
  if (O_NOME_CHAMADO.aAlguem.test(semAcento(frase))) for (const m of frase.matchAll(RX_VOCATIVO)) poe(m);
  return achados.sort((a, b) => a.i - b.i).map((x) => x.nome)
    .filter((n) => { const w = semAcento(n); return !O_ALVO_DA_FALA.naoEPessoa.includes(w) && !O_NOME_CHAMADO.naoEChamado.includes(w); });
}
/* o primeiro nome que a frase chama, haja cena ou não → o nome, ou "" (o App
   o usa para que o grito por alguém não vire pergunta ao mundo) */
export function oNomeChamado(frase) {
  try { return typeof frase === "string" ? nomesChamados(frase)[0] || "" : ""; } catch { return ""; }
}
/* o nome próprio a quem a frase se dirige e que ninguém da cena tem → o nome, ou "" */
export function nomeAusenteNaFrase(frase, cena) {
  const c = lerCena(cena);
  if (!c || typeof frase !== "string") return "";
  const nomes = c.pessoas.flatMap((p) => String(p.nome || "").split(/[\s,()]+/)).map(semAcento).filter(Boolean);
  for (const n of nomesChamados(frase)) {
    if (nomes.includes(semAcento(n))) continue;
    return n;
  }
  return "";
}
/* alguém da cena casa com o nome ou o papel que a frase disse? (a régua de alvoDaAcao) */
const casaComAlguem = (c, quem) => {
  const q = semAcento(quem).trim();
  return !!q && c.pessoas.some((x) => (x.nome && (semAcento(x.nome) === q || q.includes(semAcento(x.nome))))
    || (x.papel && (semAcento(x.papel) === q || q.includes(semAcento(x.papel)) || semAcento(x.papel).includes(q))));
};

/* 19/11 (§19): A BUSCA DEBAIXO DOS OLHOS DO DONO. «Reviro a barraca dele com
   ele ali» (sessão mv-3, T21) passou sem dado — nada escondido que o mundo
   conhecesse —, achou, e foi flagrado pela narração. Mexer nas coisas de
   alguém que está ali não é procurar: é a mão leve contra ele, e o que está
   em jogo é ser visto. Quando a frase diz de quem é o que se revira (dele,
   dela, ou o nome de quem está em cena) e o dono está ali, vivo e de olhos
   abertos, o ato é o do furto (`frase`: a frase-modelo que o catálogo lê como
   mão leve), e a régua o julga como tal. Do caído, do morto e de quem não
   está, revistar continua a ser procurar (o exame, E018–E025). */
/* 21/11 (o-mestre-vivo.md §20): duas portas que a quarta sessão achou
   fechadas. (a) «reviro os cestos da banca da vendedora» — o dono dito pelo
   PAPEL de quem está em cena, e não só pelo nome ou pelo «dele». (b) a
   frase-modelo da mão leve era sempre a mesma bolsa: a chave dela no livro de
   tentativas era a de qualquer mão leve do lugar, e um furto falho antes
   fechava a revista dos cestos — que caía na busca vazia, sem dado. Agora a
   frase-modelo leva a coisa revirada (`objeto` → `comObjeto`), e o livro
   fecha só a mesma coisa. */
/* 21/11 (o-mestre-vivo.md §20): O FURTO QUE DIZ «SEM SER VISTO». «Tento furtar a
   bolsa do homem do caixote sem ser visto» o catálogo lê como esgueirar (o «sem
   ser visto» ganha do verbo), e a quarta sessão rolou Furtividade num furto
   (T13) — cuja falha, de quebra, fechou os esconderijos. O que se arrisca é a
   mão na bolsa: a régua troca pelo veredito da mão leve, lido numa frase-modelo
   com a coisa. Só no Mestre vivo; o catálogo de hoje fica como está. */
export const O_FURTO_SEM_SER_VISTO = Object.freeze({
  rx: /\b(furt\w*|roub\w*|afan\w*|surrupi\w*|bat\w* a carteira)\s+(?:(?:a|o|as|os|um|uma)\s+)?((?:bolsa|bolsinha|carteira|algibeira|bolso|cantil|anel|colar|moedas?)(?:\s+d[aeo]s?\s+[a-z]+(?:\s+d[aeo]s?\s+[a-z]+)?)?)/,
  modelo: "surrupio a {coisa}",
});
export const A_BUSCA_SOB_OLHOS = Object.freeze({
  frase: "surrupio a bolsa do cinto dele",
  objeto: /\b(?:reviro|revirar|revisto|revistar|vasculho|vasculhar|remexo|remexer|procuro|procurar|busco|buscar|fuco|fucar|mexo|mexer|olho)\s+(?:em |dentro d[aeo]s? |nos |nas |no |na )?((?:o|a|os|as)\s+[^.!?;:,]{2,40})/,
  comObjeto: "surrupio {objeto}",
  /* onde a coisa revirada acaba: o que vem depois já é outro ato ou o motivo */
  corte: /\s+(?:procurando|buscando|atras|para|pra|enquanto|com|e|que|ate|antes|sem)\b/,
  posse: /\b(dele|dela|deles|delas|do dono|da dona)\b/,
  /* 21/11 (§25, a quinta sessão jogada): «reviro os cestos da banca do
     vendedor de amêijoas enquanto ele me olha» passou duas vezes sem dado. O
     dono dito pelo OFÍCIO só fazia rolar quando alguém da cena tinha esse
     papel — e o vendedor de uma banca do mercado não é gente do retrato (a
     banca é do sistema de comércio; quem está em cena é o elenco). Quando a
     frase diz de quem é (o ofício, `oficio`) E diz que ele está olhando
     (`olhar`), o dono está ali pela palavra do jogador: é a mão leve contra
     ele, como com o nome. Sem o olhar dito, o ofício sozinho continua a ser
     só a posse — a banca largada não rola. */
  oficio: /\bd[aeo]s?\s+((?:vendedor|vendedora|mercador|mercadora|feirante|quitandeir[oa]|peixeir[oa]|comerciante|lojista|taverneir[oa]|estalajadeir[oa]|ferreir[oa]|receptador|receptadora|cambista|padeir[oa]|acougueir[oa]|dono da banca|dona da banca|dono da barraca|dona da barraca)(?:\s+d[aeo]s?\s+[a-z]+)?)\b/,
  olhar: /\b(?:ele|ela|o dono|a dona)\s+(?:me\s+|nos\s+)?(?:olha|olhando|encara|encarando|observa|observando|vigia|vigiando|ve|vendo|fita|fitando|espia|espiando|mira|mirando)\b|\b(?:na frente|diante|debaixo do nariz|sob os olhos|na cara|a vista)\s+d(?:ele|ela)\b|\bcom (?:ele|ela) (?:ali|olhando|vendo|de olho)\b/,
  foraDeSi: /\b(caid[oa]s?|desmaiad[oa]s?|inconscientes?|desacordad[oa]s?|mort[oa]s?|cadaver|defunt[oa])\b/,
});
function donoDebaixoDosOlhos(frase, lida, nomeado) {
  const t = semAcento(frase);
  const acordado = (p) => !p.estados.includes("do_grupo") && !tem(p, "inerte") && !A_BUSCA_SOB_OLHOS.foraDeSi.test(semAcento(`${p.nome} ${p.papel}`));
  /* «a barraca do Doran»: o nome vem depois do «do/da», que é a posse */
  const dele = (p) => [p.nome, p.papel].flatMap((s) => semAcento(s).split(/\s+/)).filter((w) => w.length >= O_ALVO_DA_FALA.minimo)
    .some((w) => new RegExp(`\\bd[aeo]s?\\s+${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t));
  if (nomeado && acordado(nomeado) && dele(nomeado)) return nomeado;
  const peloPapel = lida.pessoas.find((p) => acordado(p) && dele(p));
  if (peloPapel) return peloPapel;
  /* §25: o dono dito pelo ofício e o olhar dito — ele está ali pela frase */
  const oficio = A_BUSCA_SOB_OLHOS.olhar.test(t) ? (t.match(A_BUSCA_SOB_OLHOS.oficio) || [])[1] : "";
  if (oficio) return Object.freeze({ nome: "", papel: oficio, estados: Object.freeze([]), olhando: true });
  if (!A_BUSCA_SOB_OLHOS.posse.test(t)) return null;
  return lida.pessoas.find(acordado) || null;
}

/* (e) MENTIRA E AMEAÇA NÃO SÃO PEDIDO. A fala que só a escuta ouviu
   («digo pra Seraphina que sou fiscal do porto», «ou ela me conta, ou eu
   conto pro conselho») caía em `falaSemOposicao`: sem estado que dissesse
   motivo para negar, a conversa «resolvia». Mas quem ouve a mentira perde
   alguma coisa se acreditar, e quem ouve a ameaça resiste a ceder: a
   oposição é do próprio ato, como a queda é da muralha. `familias`: as que
   têm oposição no ato; `contraODisposto`: as que nem a boa vontade dispensa
   (ameaçar quem está do seu lado não é pedir um favor — o exame, E094 e E096,
   diz que mentir a quem já deixa passar não rola, e isso fica). Quem já está
   com medo, quem já cedeu e quem não pode responder continuam sem dado. */
/* `quemSeDiz`: a mentira que a escuta ouve pela forma («digo que…») só é
   mentira certa quando o herói se dá um título, um cargo ou uma licença
   («sou fiscal do porto», «venho a serviço do barão»). «Explico que a Helga
   me mandou» (exame, E696) pode ser verdade, e o sistema não tem como saber:
   ali fica a conversa de sempre. A mentira que o catálogo ouve pelo verbo
   («minto», «invento», «finjo ser») é sempre mentira. */
/* 19/11 (§19): `contraOGrupo` — a mentira a quem viaja com você. «Minto pra
   Orla que não fui eu que peguei a chave» (sessão mv-3, T13) passou sem dado
   como favor de quem está do seu lado: mas ela estava lá, sabe o que viu, e
   perde alguma coisa se acreditar. A mentira ao guarda que já deixa passar
   (E094) continua sem dado: ela empurra para onde ele já ia. A mentira ao
   companheiro empurra contra o que ele sabe. */
export const MENTIRA_E_AMEACA = Object.freeze({
  familias: Object.freeze(["enganar", "intimidar"]),
  contraODisposto: Object.freeze(["intimidar"]),
  contraOGrupo: Object.freeze(["enganar"]),
  quemSeDiz: /\b((eu )?sou|somos) (?!so\b)\w+|\b(a servico|em nome|a mando) d\w*|\bautorizad\w*|\btenho (permissao|autorizacao|ordem|ordens)\b/,
});
const mentiraOuAmeaca = (x) => MENTIRA_E_AMEACA.familias.includes(x.familia)
  && (x.familia !== "enganar" || x.v.escuta !== "fala" || MENTIRA_E_AMEACA.quemSeDiz.test(semAcento(x.frase)));

/* A REGRA DE SEGURANÇA. As linhas que dizem «não» pela AUSÊNCIA de um estado
   (ninguém escreveu motivo para negar) não ganham do Mestre de hoje: se ele
   rolaria e a cena não tem um estado positivo que explique o não, vale ele.
   As outras linhas que calam têm o seu estado positivo (a pessoa disposta,
   nada escondido que o mundo conheça, ninguém que note, a altura comum). */
export const CALA_POR_AUSENCIA = Object.freeze(["falaSemOposicao"]);

export const REGUA_DO_MOMENTO = Object.freeze([
  /* rodada 3: o que já ficou acertado, ou já foi tentado, não rola de novo
     (§8 nº 27, 37, 38) */
  Object.freeze({ id: "jaResolvido", rola: false, diz: "isto já ficou acertado: não há o que rolar",
    quando: (x) => x.noAlvo("resolvido") && (!x.social || x.op.facilita || x.cena.cena.estados.includes("ja_resolvido")) }),
  Object.freeze({ id: "jaTestado", rola: false, diz: "o teste de antes já cobre isto",
    quando: (x) => x.noAlvo("testado") }),
  /* rodada 3: o mundo decide que não (selado por magia, sabotado — §10.5
     nº 84, 85): não há dado que abra */
  Object.freeze({ id: "impossivel", rola: false, diz: "não cede, e não vai ceder: o mundo decide",
    quando: (x) => FAMILIAS_DO_IMPOSSIVEL.includes(x.familia) && x.noAlvo("impossivel") }),
  /* rodada 3: o preparo do herói resolve (a senha, a chave, o documento
     bom — nº 73, 74, 76); contra quem é hostil, o papel não basta (nº 75) */
  Object.freeze({ id: "alavanca", rola: false, diz: "o seu preparo resolve: a senha, a chave, o papel certo",
    quando: (x) => FAMILIAS_DA_ALAVANCA.includes(x.familia) && x.noAlvo("alavanca") && !(x.social && x.op.estados.includes("hostil")) }),
  /* rodada 3: o que está à vista (nº 70, 59) */
  Object.freeze({ id: "aVista", rola: false, diz: "está à vista: o Mestre conta o que se vê",
    quando: (x) => FAMILIAS_DO_EVIDENTE.includes(x.familia) && x.noAlvo("evidente") }),
  /* M5: quem não pode responder (o morto, o desacordado) não é convencido
     nem enganado: não há conversa, e não há dado */
  Object.freeze({ id: "semResposta", rola: false, diz: "quem ouviria não pode responder",
    quando: (x) => x.social && x.op.inerte }),
  /* a conversa, dentro da régua */
  Object.freeze({ id: "pergunta", rola: false, diz: "pergunta não rola: quem quer responde, quem esconde desconversa",
    quando: (x) => x.social && PERGUNTA_DA_ESCADA.includes(x.v.social && x.v.social.tamanho) && !x.op.opoe && !x.nega }),
  Object.freeze({ id: "medoCede", rola: false, diz: "quem já está com medo cede sem dado",
    quando: (x) => x.social && CEDE_COM_MEDO.includes(x.familia) && x.op.cede }),
  /* 19/11 (§18): ameaçar quem está do seu lado não é pedir um favor */
  Object.freeze({ id: "ameacaAoDisposto", rola: true, diz: "a ameaça vira quem estava do seu lado contra você",
    quando: (x) => x.social && MENTIRA_E_AMEACA.contraODisposto.includes(x.familia) && x.op.facilita }),
  /* 19/11 (§19): mentir a quem viaja com você é mentir a quem sabe */
  Object.freeze({ id: "mentiraAoGrupo", rola: true, diz: "quem viaja com você sabe o que viu, e perde se acreditar",
    quando: (x) => x.social && MENTIRA_E_AMEACA.contraOGrupo.includes(x.familia) && x.op.estados.includes("do_grupo") && !x.op.cede && mentiraOuAmeaca(x) }),
  /* 21/11 (§20): o desconto pedido a quem só tem simpatia continua sendo
     dinheiro dela (MOTIVO_PARA_NEGAR_DO_ALVO.precoContraASimpatia) */
  Object.freeze({ id: "precoComSimpatia", rola: true, diz: "o desconto sai do bolso de quem vende, por mais simpatia que tenha",
    quando: (x) => x.social && x.familia === "convencer" && x.op.facilita && x.op.estados.length > 0
      && x.op.estados.every((e) => MOTIVO_PARA_NEGAR_DO_ALVO.precoContraASimpatia.includes(e))
      && MOTIVO_PARA_NEGAR_DO_ALVO.preco.test(semAcento(x.frase)) && !MOTIVO_PARA_NEGAR_DO_ALVO.magia.test(semAcento(x.frase)) }),
  Object.freeze({ id: "dispostoCede", rola: false, diz: "com quem está disposto, a conversa resolve sem dado",
    quando: (x) => x.social && x.op.facilita }),
  /* 19/11 (§17): o motivo também se lê no alvo da fala — o papel e o tamanho
     do pedido (MOTIVO_PARA_NEGAR_DO_ALVO), e não só o estado escrito */
  Object.freeze({ id: "motivoParaNegar", rola: true, diz: "quem ouve tem motivo para negar",
    quando: (x) => x.social && (x.op.opoe || x.nega) }),
  /* 19/11 (§18): a mentira e a ameaça têm oposição no próprio ato */
  Object.freeze({ id: "mentiraOuAmeaca", rola: true, diz: "quem ouve a mentira ou a ameaça tem o que perder se ceder",
    quando: (x) => x.social && mentiraOuAmeaca(x) }),
  /* M5: a fala que só a escuta ouviu (nenhum verbo de conversa na frase:
     «peço…», «vc solta e eu…») é a leitura mais fraca de uma tentativa.
     Ela rola pela regra mais forte do estudo — quem ouve tem motivo para
     negar —, e não pela escada do estranho: sem oposição, o pedido se
     conversa e o Mestre narra a resposta */
  Object.freeze({ id: "falaComLicenca", rola: true, diz: "você pede licença: sabe que pode ouvir um não",
    quando: (x) => x.social && x.v.escuta === "fala" && MOLDURAS_DE_RISCO.includes(x.moldura) && !x.op.facilita }),
  Object.freeze({ id: "falaSemOposicao", rola: false, diz: "ninguém tem motivo para negar: a conversa resolve",
    quando: (x) => x.social && x.v.escuta === "fala" }),
  Object.freeze({ id: "conversaComEstranho", rola: true, diz: "um estranho que não deve nada a você: a escada do pedido dá o número",
    quando: (x) => x.social }),
  /* ler a pessoa: rola quando o jogador pede, e o pedido é a frase */
  Object.freeze({ id: "lerPessoa", rola: true, diz: "ler a pessoa rola quando o jogador pede",
    quando: (x) => x.familia === "ler_pessoa" }),
  /* escutar — 19/11 (§17): antes de tudo, quem fala COM você se ouve sem dado */
  Object.freeze({ id: "ouvirQuemFala", rola: false, diz: "quem fala com você se ouve sem dado: é conversa",
    quando: (x) => x.v.id === "escutar" && OUVIR_QUEM_FALA.test(semAcento(x.frase)) && x.cena.pessoas.some((p) => !p.estados.includes("do_grupo") && !tem(p, "inerte")) }),
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
    quando: (x) => x.familia === "procurar" && (haOQueAchar(x.cena) || haPerigo(x.cena) || x.noAlvo("escasso")) }),
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
  /* 19/11 (§17): a queda de uma fortificação é o preço do próprio ato */
  /* 19/11 (§19): e o perigo que a própria frase declara (PERIGO_DECLARADO) */
  Object.freeze({ id: "riscoDoAto", rola: true, diz: "o perigo é do próprio ato: a queda, o vão, a água, quem vem atrás",
    quando: (x) => x.familia === "travessia" && riscoDoAto(x) }),
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
    quando: (x) => x.familia === "furtar" && !alguemPodeNotar(x.cena) && !vitimaNaFrase(x) && !(x.alvo && x.alvo.olhando === true) }),
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
    quando: (x) => FAMILIAS_DO_SABER.includes(x.familia) && x.noAlvo("proprio") }),
  Object.freeze({ id: "coisaComum", rola: false, diz: "é coisa de toda feira: qualquer um sabe",
    quando: (x) => FAMILIAS_DO_SABER.includes(x.familia) && x.noAlvo("comum") }),
  /* rodada 3: o que o herói já sabe, dito pela cena (o teste de antes, o
     passado dele) — a ficha nem sempre tem o assunto escrito */
  Object.freeze({ id: "heroiJaSabe", rola: false, diz: "você já sabe isto",
    quando: (x) => FAMILIAS_DO_SABER.includes(x.familia) && x.noAlvo("sabe") }),
  /* rodada 3: a força contra o que não resiste (o portão entreaberto) */
  Object.freeze({ id: "semResistencia", rola: false, diz: "não há o que resista: basta um empurrão",
    quando: (x) => x.familia === "forcar" && x.noAlvo("livre") && !x.coisa.opoe }),
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
  if (r.rola || typeof c.frase !== "string" || c.parte || r.aoGrupo) return r;
  /* 21/11 (a sexta sessão): o que o livro de tentativas já respondeu para a
     frase inteira («isso você já conseguiu aqui», «você já tentou assim») não
     se reabre pelos pedaços — «regateio com a meio-orc: as rações pela
     metade» relido como «as rações pela metade», sem ouvinte, era outro
     pedido a outra pessoa, e rolava */
  const v0 = vereditoDoCatalogo;
  if (v0 && v0.chave && ["livre", "jaTentou", "vasculhado"].includes(v0.tipo)) return r;
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

/* o Mestre de hoje rolaria este veredito do catálogo? (porQueNaoChama) */
function rolaHoje(v, c) {
  try { return ROLA_HOJE.includes(porQueNaoChama(v, c)); } catch { return false; }
}
/* a vantagem do furto: o alvo dorme, ou está fora de si (A_VITIMA_DO_FURTO) */
function vantagemDoFurto(x) {
  const a = alvoDaAcao(x.cena, { sobre: "pessoa", quem: x.quem });
  return a && a.estados.some((e) => A_VITIMA_DO_FURTO.vantagem.includes(e)) ? A_VITIMA_DO_FURTO.diz : "";
}

function decidir(vereditoDoCatalogo, cenaInteira, c) {
  /* 21/11 (o-mestre-vivo.md §23): a cena que a frase toca — as coisas ao
     toque (o cesto, a calha) só contam quando a frase as nomeia */
  const lida = aCenaQueAFraseToca(cenaInteira, typeof c.frase === "string" ? c.frase : "") || cenaInteira;
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
  /* 21/11 (§25, a quinta sessão jogada): A COISA DE ALGUÉM DITO PELO OFÍCIO.
     «Remexo os sacos da vendedora» não chegava aqui como busca: o catálogo
     recua diante de «vendedor» (a guarda contra «procuro o vendedor», que é
     procurar gente), e a escuta também não a ouvia. A régua relê a frase sem
     o dono («remexo os sacos») e, se o catálogo a lê como busca, é busca — o
     dono, dito pelo ofício e olhando, faz dela a mão leve logo abaixo
     (A_BUSCA_SOB_OLHOS). O catálogo não muda: só o Mestre vivo chega aqui.
     21/11 (a sexta sessão, a prova das buscas): ANTES da escuta. Depois dela,
     «reviro os cestos do vendedor de peixe» já chegava como a busca da
     frase-modelo do catálogo («reviro o quarto atrás de um esconderijo»): o
     achado procurado era o do quarto (nenhum, embora os cestos guardassem
     algo e a régua rolasse por eles) e a chave do livro era a do lugar
     inteiro — falhar fechava a feira toda. Relida sem o dono, a frase é a do
     jogador: o achado e a chave são os dos cestos. */
  if ((!veredito || veredito.tipo !== "teste") && typeof c.frase === "string") {
    const t0 = semAcento(c.frase);
    if (A_BUSCA_SOB_OLHOS.objeto.test(t0) && A_BUSCA_SOB_OLHOS.oficio.test(t0)) {
      let vb = null;
      try { vb = lerAcao(t0.replace(A_BUSCA_SOB_OLHOS.oficio, " ").replace(/\s+/g, " ").trim(), obj(c.leitura) ? c.leitura : {}); } catch { vb = null; }
      if (vb && vb.tipo === "teste" && vb.id === "buscar") { veredito = vb; ouvido = Object.freeze({ ...vb, escuta: "ato" }); }
    }
  }
  /* 21/11 (a sexta sessão, T28): o «livre» com chave é o livro de tentativas
     respondendo («isso você já conseguiu aqui») — o catálogo OUVIU o ato, e a
     escuta não o relê. Relia: a fala ia para a frase-modelo do catálogo
     («tento convencer o guarda a me deixar passar»), rolava pela chave do
     guarda, e a chave do guarda fechada depois calava o suborno ao guarda de
     verdade (T33). */
  const fechadoPeloLivro = !!(veredito && veredito.tipo === "livre" && veredito.chave);
  if ((!veredito || (veredito.tipo === "livre" && !fechadoPeloLivro) || veredito.tipo === "naoSePede") && typeof c.frase === "string") {
    try { ouvido = escutarComCena(c.frase, lida, c.leitura); } catch { ouvido = null; }
    if (ouvido) veredito = ouvido;
  }
  /* M5: «esse desenho é de algum culto que eu conheça?» — o catálogo leu
     `lembrar` e não recortou o assunto; sem assunto, a régua do saber comum
     não tem o que comparar com a ficha. O assunto é então a frase inteira. */
  if (veredito && veredito.tipo === "teste" && veredito.id === "lembrar" && !veredito.sobre && typeof c.frase === "string") {
    veredito = { ...veredito, sobre: c.frase };
  }
  /* 21/11 (§20): o furto que diz «sem ser visto» é a mão leve (O_FURTO_SEM_SER_VISTO) */
  let furtoQueSeEsconde = null;
  if (veredito && veredito.tipo === "teste" && veredito.id === "furtar_se" && typeof c.frase === "string") {
    const m = semAcento(c.frase).match(O_FURTO_SEM_SER_VISTO.rx);
    if (m) {
      let vf = null;
      try { vf = lerAcao(O_FURTO_SEM_SER_VISTO.modelo.replace("{coisa}", m[2]), obj(c.leitura) ? c.leitura : {}); } catch { vf = null; }
      if (vf && ["teste", "jaTentou", "livre"].includes(vf.tipo) && (vf.tipo !== "teste" || familiaDaAcao(vf) === "furtar")) { veredito = vf; furtoQueSeEsconde = vf; }
    }
  }
  let ouviu = furtoQueSeEsconde && furtoQueSeEsconde.tipo === "teste" ? Object.freeze({ id: furtoQueSeEsconde.id, pericia: furtoQueSeEsconde.pericia || "", chave: furtoQueSeEsconde.chave || "", porta: "furto" }) : ouvido ?Object.freeze({ id: ouvido.id, pericia: ouvido.pericia || "", chave: ouvido.chave || "", porta: ouvido.escuta || "" }) : null;
  for (const r of VETOS_DE_SEMPRE) {
    let cala = false;
    try { cala = !!r.cala(veredito, c); } catch { cala = true; }
    if (cala) {
      const resposta = r.id === "naoETeste" ? respostaDaPergunta(lida, "") : null;
      return Object.freeze({ rola: false, porque: r.id, diz: r.porque, pesos, resposta: resposta ? resposta.id : null, ouviu, moldura, veredito: veredito || null });
    }
  }
  let v = veredito;
  let familia = familiaDaAcao(v);
  /* 19/11 (§18): sem nome no veredito, o alvo sai da frase — quem ela nomeia,
     ou o estranho a quem ela se dirige quando só há gente do grupo */
  const frase = typeof c.frase === "string" ? c.frase : "";
  let quem = (v.pessoa && v.pessoa.nome) || v.quem || "";
  /* a escuta devolve o veredito da frase-modelo do catálogo («tento
     convencer o guarda…»): o «guarda» dela não é de quem o jogador falou */
  if (quem && ouvido && frase && !semAcento(frase).includes(semAcento(quem).replace(/^(o|a|os|as) /, ""))) quem = "";
  let alvo = null, op = null;
  const umEstranho = (nome) => {
    quem = nome; alvo = Object.freeze({ nome, papel: nome, estados: Object.freeze([]) });
    op = Object.freeze({ opoe: false, cede: false, facilita: false, inerte: false, quem: nome, estados: alvo.estados });
  };
  if (!quem && frase) {
    let nomeado = null, estranho = "";
    try { nomeado = quemAFraseNomeia(frase, lida); } catch { nomeado = null; }
    if (nomeado) { quem = nomeado.nome || nomeado.papel; alvo = nomeado; }
    else {
      /* 19/11 (§19): o nome próprio que não está em cena vem antes */
      try { estranho = nomeAusenteNaFrase(frase, lida) || estranhoAQuemSeFala(frase, lida); } catch { estranho = ""; }
      if (estranho) umEstranho(estranho);
    }
  }
  const social = !!v.social || FAMILIAS_DA_CONVERSA.includes(familia);
  /* 19/11 (§19): o alvo da fala nunca cai no companheiro por falta de outro */
  if (social && !alvo) {
    let o = null;
    try { o = haOposicao(lida, { sobre: "pessoa", quem }); } catch { o = null; }
    if (o && o.estados.includes("do_grupo")) {
      if (quem && !casaComAlguem(lida, quem)) umEstranho(quem);
      else if (!quem && MOTIVO_PARA_NEGAR_DO_ALVO.preco.test(semAcento(frase))) umEstranho(O_ALVO_AUSENTE.quemVende);
    }
  }
  /* 19/11 (§19): a busca debaixo dos olhos do dono é a mão leve contra ele */
  if (familia === "procurar" && v.id === "buscar" && frase) {
    let dono = null;
    /* o nomeado vem de outra leitura da cena (quemAFraseNomeia relê): casa-se pelo nome */
    const naCena = alvo ? lida.pessoas.find((p) => p.nome === alvo.nome && p.papel === alvo.papel) || null : null;
    try { dono = donoDebaixoDosOlhos(frase, lida, naCena); } catch { dono = null; }
    let vf = null;
    if (dono) {
      const coisa = ((semAcento(frase).match(A_BUSCA_SOB_OLHOS.objeto) || [])[1] || "").split(A_BUSCA_SOB_OLHOS.corte)[0].trim();
      const ler = (f) => { try { return lerAcao(f, obj(c.leitura) ? c.leitura : {}); } catch { return null; } };
      if (coisa) vf = ler(A_BUSCA_SOB_OLHOS.comObjeto.replace("{objeto}", coisa));
      /* a coisa que o catálogo não lê como mão leve volta à frase-modelo de
         sempre; a que o livro já fechou (a mesma coisa, falha) fica fechada */
      const fechada = vf && ["jaTentou", "livre", "vasculhado"].includes(vf.tipo);
      if (!fechada && (!vf || vf.tipo !== "teste" || familiaDaAcao(vf) !== "furtar")) vf = ler(A_BUSCA_SOB_OLHOS.frase);
    }
    if (vf && vf.tipo === "teste" && familiaDaAcao(vf) === "furtar") {
      v = vf; familia = "furtar"; alvo = dono; quem = dono.nome || dono.papel; op = null;
      ouviu = Object.freeze({ id: vf.id, pericia: vf.pericia || "", chave: vf.chave || "", porta: "dono" });
    }
  }
  /* 21/11 (o-mestre-vivo.md §21): A COISA QUE A FRASE NOMEIA. A oposição
     da coisa era sempre a da primeira coisa da cena (a porta); agora é a da
     coisa que a frase nomeia («arrombo a arca»), e só sem nenhuma, a de
     antes. E as marcas que são de UMA coisa ou de UMA pessoa (o selado, a
     alavanca, o que não resiste, o que é do herói, o já resolvido…) se leem
     no alvo (`noAlvo`, temMarcaNoAlvo): a coisa nomeada (sem nenhuma, «a
     coisa» da ação, a primeira da cena — a do exame, que só tem uma, como
     antes; a do jogo, a porta ou o lugar); na conversa, a pessoa a quem se fala; fora dela, a
     pessoa que a frase nomeia, e nenhuma quando não nomeia (o sim de uma
     pessoa não cala a escalada do muro). */
  let coisasDitas = [];
  try { coisasDitas = frase ? coisasQueAFraseNomeia(frase, lida) : []; } catch { coisasDitas = []; }
  const opDaPessoa = op || haOposicao(lida, { sobre: "pessoa", quem });
  let pessoaDita = null;
  if (!social && frase) { try { pessoaDita = quemAFraseNomeia(frase, lida); } catch { pessoaDita = null; } }
  const coisaDaAcao = haOposicao(lida, { sobre: "coisa", quem: coisasDitas[0] || "" });
  const alvoDasMarcas = Object.freeze({
    coisas: coisasDitas.length ? coisasDitas : coisaDaAcao.quem ? [coisaDaAcao.quem] : [],
    pessoas: social ? (opDaPessoa.quem ? [opDaPessoa.quem] : []) : pessoaDita ? [pessoaDita.nome || pessoaDita.papel] : [],
  });
  const x = {
    v, familia, social, cena: lida,
    op: opDaPessoa, alvo,
    bicho: haOposicao(lida, { sobre: "criatura", quem }),
    coisa: coisaDaAcao,
    noAlvo: (marca) => temMarcaNoAlvo(lida, marca, alvoDasMarcas),
    custo: custoDeFalhar(lida),
    ctx: c, frase: typeof c.frase === "string" ? c.frase : "", moldura, quem,
  };
  /* 19/11 (§17): o motivo para negar do alvo da fala, uma vez por frase */
  try { x.nega = motivoParaNegarDoAlvo(x); } catch { x.nega = false; }
  for (const r of REGUA_DO_MOMENTO) {
    let vale = false;
    try { vale = !!r.quando(x); } catch { vale = false; }
    if (vale) {
      const resposta = r.id === "pergunta" ? respostaDaPergunta(lida, quem) : null;
      /* a regra de segurança: o «não» que só tem ausência não ganha do Mestre de hoje */
      if (!r.rola && CALA_POR_AUSENCIA.includes(r.id) && rolaHoje(vereditoDoCatalogo, c)) {
        return Object.freeze({ rola: true, porque: "comoHoje", diz: "o Mestre de hoje rolaria, e a cena não diz por que não", pesos, resposta: null, ouviu, moldura, veredito: v, ...(x.social && quem ? { alvo: quem } : {}) });
      }
      const vantagem = r.rola && x.familia === "furtar" ? vantagemDoFurto(x) : "";
      /* 19/11 (§18): o pedido ao companheiro — o que vem depois dele na frase
         («…e descobrir quem anda pensando em desertar, sem ninguém notar») é o
         que ELE vai fazer, e não um ato do herói para a régua julgar */
      const aoGrupo = r.id === "dispostoCede" && x.op.estados.includes("do_grupo");
      /* 21/11 (§20): `alvo` — a quem a fala se dirige, como a régua o resolveu;
         a pauta do turno diz ao Narrador que é essa pessoa quem reage */
      return Object.freeze({ rola: r.rola, porque: r.id, diz: r.diz, pesos, resposta: resposta ? resposta.id : null, ouviu, moldura, veredito: v, ...(vantagem ? { vantagem } : {}), ...(aoGrupo ? { aoGrupo } : {}), ...(x.social && quem ? { alvo: quem } : {}) });
    }
  }
  return Object.freeze({ rola: true, porque: "comoSempre", diz: "", pesos, resposta: null, ouviu, moldura, veredito: v, ...(x.social && quem ? { alvo: quem } : {}) });
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
