/* ============================================================
   O CONFERENTE DA PROSA (o Mestre que conhece a cena, etapa 4 · 21/11/2026)
   src/motor/o-conferente-da-prosa.js — mente/lancamento/o-mestre-vivo.md §24

   A quinta sessão jogada com o Mestre vivo (mestre-vivo-sessao-5.md) viu o
   Narrador receber a ficha da cena na pauta (§22) e ignorá-la: a tela
   disse que a espada se compra nas bancas e a prosa vendeu e entregou a
   espada, com as moedas e a mochila intactas; o cordão e os botões
   «entregues» nunca entraram na bolsa; a gazua e a lâmina que a ficha nega
   foram narradas em uso; uma pessoa da cena falou em quase todo turno,
   respondeu por quem a frase chamou e repetiu a mesma fala quatro vezes; e
   três ações do jogador nem foram narradas. O veto antes da narração não
   basta: é preciso conferir a resposta DEPOIS de escrita.

   A REGRA DE MESA, do sistema e sem IA (nenhuma chamada nova — o pior caso
   continua a ser UMA chamada por turno): entre a resposta do Narrador e a
   tela, nesta ordem de preferência,
     a. PODA a frase que afirma o que o sistema não fez neste turno:
        · objeto que muda de mão para o herói e o sistema não lhe deu (a
          régua é a da memória do inventado, `oInventadoDaProsa`, com o que
          o jogador pediu ou comprou SEM folga, mais as cabeças daqui);
        · pagamento ou venda quando a bolsa não mexeu (`pagou === false`);
        · a arma ou a ferramenta que a frase diz ser do herói e a ficha
          não tem («arrombo com a minha gazua», «saco a minha espada»);
        · a fala de quem não está na lista da cena (a gente que a prosa
          inventou) e de quem está mas fala fora da vez (abaixo);
     b. quando a poda deixa a prosa vazia (ou curta demais), o sistema
        escreve no lugar a LINHA DE TROCA, por tabela — curta, em fala de
        mesa, sem nome de mecanismo;
     c. NÃO refaz a chamada: o jogo não tem orçamento de retentativa de
        conteúdo (as duas tentativas de `chamarMestre` são da ligação que
        cai), e chamada nova por turno é custo novo.

   QUEM RESPONDE. Com alvo no veredito (a quem a frase fala), a resposta é
   dele. Outra pessoa da cena que fala ou age está FORA DA VEZ quando a
   frase não a nomeia e: o alvo não aparece na prosa (ela respondeu no
   lugar); ou ela já tomou a palavra nos últimos `vez` turnos; ou repete a
   própria fala da última vez; ou fala comprido demais num turno que é de
   outro. A memória (quem falou, em que turno, o quê) é só de sessão: quem
   chama a guarda num ref e a devolve a cada turno.

   A AÇÃO NÃO SOME. Com um veredito julgado (o dado rolou), se a prosa não
   diz nem o alvo, nem a coisa da frase, nem uma palavra da família da ação
   (escalar → subir, telhado; furtar → mão, bolsa), o sistema põe à frente a
   linha do resultado, por tabela.

   21/11 (sessão 6 do Mestre vivo, mestre-vivo-sessao-6.md): dez disparos e
   nenhuma linha no lugar; a prosa ficou com «ela» sem ninguém antes. Agora:
     · CORTOU, REPÕE — a primeira cortada de cada razão (objeto, pagamento,
       meio) dá lugar a uma linha da tabela `reposicao`, pela semente do turno;
     · A ÓRFÃ SAI — a frase logo depois de uma cortada que abre referindo o
       que sumiu (`orfa`) vai junto;
     · QUEM NÃO ESTÁ NÃO FALA — `ausente` (a ficha disse que não está aqui):
       a fala e a ação com ele por sujeito saem;
     · O ÊXITO NA FALHA — o dado falhou numa travessia e a frase diz que
       você conseguiu (`exitoNaFalha`): sai, e a linha da falha entra.

   MENÇÃO NÃO É PRESENÇA (memory/portao-morde-so-o-necessario.md): falar DE
   alguém ausente pode, o ausente FALAR não; o jogador nomear uma espada não
   é a espada mudar de mão; «você não tem gazua» fica; a lança do guarda é
   do guarda. Os pares que separam os dois lados estão na suíte.

   Puro, sem React, sem relógio, sem sorte. Lixo devolve a prosa como veio
   e nunca lança. Provado em testes/teste-o-conferente-da-prosa.mjs.
   ============================================================ */
import { oInventadoDaProsa, aGenteInventadaDaProsa, MEMORIA_DO_INVENTADO } from "./memoria-do-inventado.js";
import { podarOAusente } from "./poda-do-ausente.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const sem = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const palavras = (s) => sem(s).replace(/[^a-z0-9-]+/g, " ").trim().split(/\s+/).filter(Boolean);
const primeiro = (n) => palavras(String(n || "").split(",")[0])[0] || "";

/* ---------------- A TABELA ---------------- */
export const O_CONFERENTE = Object.freeze({
  porque: "a quinta sessão viu o Narrador ignorar a ficha da cena: o veto antes da narração não basta, e a resposta é conferida depois de escrita, sem chamada nova",
  /* a pessoa da cena fala, sem ser chamada, no máximo uma vez a cada `vez` turnos */
  vez: 3,
  /* a fala de quem não foi chamado, num turno que é de outro: até estas letras */
  curta: 180,
  /* a mesma fala de novo: a fração de palavras em comum (de quatro letras ou mais) */
  parecido: 0.5,
  minPalavrasDaFala: 4,
  /* a prosa que sobra com menos letras do que isto não se sustenta: troca
     (uma frase curta e inteira — «A praça ferve.» — ainda é cena) */
  minLetras: 12,
  /* quantas pessoas a memória de falas guarda */
  memoria: 12,
  /* o que o conferente conta como objeto que muda de mão, além da tabela da
     memória do inventado (o cordão da rede que o velho «entregou») */
  maisObjetos: Object.freeze({ cordao: "o", cordel: "o" }),
  /* o verbo de pedir ou comprar na frase: o que vem depois dele o jogador
     PEDIU, e pedir não é ter (a folga da frase não vale) */
  pede: /\b(compro|comprar|compra|adquiro|adquirir|peco|pedir|pede|quero|me da|me de|me passa|me vende|me empresta|empresta|vende)\b(.*)$/,
  /* a arma ou a ferramenta que a frase diz ser do herói: depois do possessivo
     ou do «com» instrumental (nunca «armado de lança», que é de outro) */
  meuMeio: /\b(minha|meu|minhas|meus|com a|com o|com as|com os|com uma|com um)\s+(?:(?:minha|meu|minhas|meus|velha|velho|pequena|pequeno|boa|bom)\s+)?([a-z]+)/g,
  /* as famílias de arma e de ferramenta: a cabeça e os nomes da mesma coisa */
  meios: Object.freeze([
    Object.freeze(["espada", "lamina", "adaga", "punhal", "faca", "sabre", "gladio"]),
    Object.freeze(["machado", "machadinha"]),
    Object.freeze(["martelo", "marreta", "clava", "maca-de-armas"]),
    Object.freeze(["lanca", "alabarda", "pique"]),
    Object.freeze(["arco", "flecha", "flechas", "besta", "virote"]),
    Object.freeze(["gazua", "gazuas", "ferramentas", "ferramenta", "grampo", "grampos"]),
    Object.freeze(["pe-de-cabra", "alavanca"]),
  ]),
  /* o pagamento: o verbo com o herói por sujeito e a moeda perto; o comprar
     e o pagar dele; o vender ao herói */
  pagar: Object.freeze({
    verbos: Object.freeze(["paga", "pagou", "pagas", "compra", "comprou", "estende", "estendeu", "entrega", "entregou", "conta", "contou", "deixa", "deixou", "poe", "pos", "larga", "largou", "atira", "atirou", "empurra", "empurrou", "passa", "passou", "deu"]),
    soComMoeda: Object.freeze(["estende", "estendeu", "entrega", "entregou", "conta", "contou", "deixa", "deixou", "poe", "pos", "larga", "largou", "atira", "atirou", "empurra", "empurrou", "passa", "passou", "deu"]),
    /* «da» fica de fora (é também a preposição), e a bolsa (a mão passa na bolsa sem pagar) */
    moeda: Object.freeze(["moeda", "moedas", "cobre", "cobres", "prata", "pratas", "ouro", "dinheiro"]),
    vende: /\b(vende-lhe|vendeu-lhe|lhe vende|lhe vendeu|vende-te|te vende|vende a voce|vendeu a voce)\b/,
    janela: 6,
  }),
  /* O DAR AO HERÓI com a coisa ANTES do verbo («corta um pedaço de corda e
     entrega-lhe»): a régua da memória lê o objeto depois do verbo, e este
     escapava. Só morde a coisa que a frase PEDIU (ou a família dela) e que o
     herói não tem: pedir ao velho um cordão e a prosa pô-lo na mão. */
  daAoHeroi: /\b(entrega|estende|passa|poe|deixa|da|oferece|joga|atira|devolve|empresta)-(lhe|lho|lha|lhos|lhas|te|to|ta)\b|\blhe (entrega|entregou|estende|estendeu|passa|passou|poe|pos|da|deu|oferece|ofereceu|joga|atira|devolve|empresta)\b|\b(entrega|entregou|estende|estendeu|passa|passou|oferece|ofereceu|joga|atira|devolve|empresta) (a|para) voce\b|\b(na|em) sua mao\b|\bnas suas maos\b/,
  /* os nomes da mesma coisa pedida */
  doPedido: Object.freeze([
    Object.freeze(["corda", "cordao", "cordel", "fio", "barbante"]),
    Object.freeze(["moeda", "moedas", "cobre", "trocado"]),
    Object.freeze(["mapa", "carta", "bilhete"]),
  ]),
  heroi: Object.freeze(["voce", "tu"]),
  posse: Object.freeze(["sua", "seu", "suas", "seus"]),
  /* o que nega a frase inteira; o «sem» só nega a coisa logo depois dele
     («sem gazua»), nunca o gesto («entrega-lho sem olhar») */
  nega: Object.freeze(["nao", "nem", "nunca", "jamais", "nenhum", "nenhuma", "falta", "faltam"]),
  /* o dono da arma, logo depois dela: «a lança do guarda», «a faca dela» */
  /* e a arma sem o herói na frase só morde no começo dela («A lâmina encosta
     no pescoço»): «o guarda ergue a espada» é a espada do guarda */
  meioNoComeco: 3,
  doOutro: /^\s*(de|do|da|dos|das|dele|dela|deles|delas)\b/,
  /* as palavras do alvo que não o identificam */
  vazias: Object.freeze(["quem", "atende", "banca", "dono", "dona", "aqui", "esta", "isso", "isto", "aquele", "aquela", "para", "pela", "pelo", "com", "sobre", "que"]),
  /* a família da ação dita na prosa: um começo de palavra basta */
  trata: Object.freeze({
    travessia: Object.freeze(["sub", "escal", "trep", "salt", "pul", "nad", "telhad", "alto", "topo", "cima", "agarr", "despenc", "cai", "queda", "equilibr"]),
    forcar: Object.freeze(["forc", "ced", "rang", "trinc", "estal", "arromb", "abr", "tranc", "cadead", "fechadur", "tamp", "ombro"]),
    furtar: Object.freeze(["mao", "dedo", "bolsa", "cinto", "furt", "surrup", "afan", "pulso"]),
    procurar: Object.freeze(["procur", "revir", "vascul", "busc", "encontr", "acha", "nada", "vazio", "fundo"]),
    esgueirar: Object.freeze(["escond", "sombra", "esgueir", "vist", "repar", "silenc", "passo"]),
    saber: Object.freeze(["lembr", "sabe", "memori", "recorda"]),
  }),
  /* A LINHA DO RESULTADO: o que aconteceu, em fala de mesa. {alvo} só nas
     linhas com nome; sem nome, a forma impessoal. Nenhuma fala de dado,
     teste, regra ou sistema. */
  resultado: Object.freeze({
    travessia: Object.freeze({ ok: "Você chega aonde queria.", falha: "Você não consegue." }),
    forcar: Object.freeze({ ok: "Cede ao seu esforço.", falha: "Não cede." }),
    furtar: Object.freeze({ ok: "Você consegue, sem que percebam.", falha: "Percebem a sua mão." }),
    procurar: Object.freeze({ ok: "Você procura com cuidado.", falha: "Você procura, e não acha nada." }),
    esgueirar: Object.freeze({ ok: "Ninguém repara em você.", falha: "Alguém repara em você." }),
    saber: Object.freeze({ ok: "Você se lembra.", falha: "Nada lhe vem à memória." }),
    convencer: Object.freeze({ ok: "{alvo} se deixa convencer.", falha: "{alvo} não se deixa convencer.", okSem: "Se deixam convencer.", falhaSem: "Não se deixam convencer." }),
    intimidar: Object.freeze({ ok: "{alvo} recua diante de você.", falha: "{alvo} não se intimida.", okSem: "Recuam diante de você.", falhaSem: "Não se intimidam." }),
    enganar: Object.freeze({ ok: "{alvo} acredita em você.", falha: "{alvo} não acredita em você.", okSem: "Acreditam em você.", falhaSem: "Não acreditam em você." }),
    ler_pessoa: Object.freeze({ ok: "Você lê o rosto de {alvo}.", falha: "{alvo} não deixa transparecer nada.", okSem: "Você lê o rosto de quem ouve.", falhaSem: "Ninguém deixa transparecer nada." }),
    atuar: Object.freeze({ ok: "Prendem os olhos em você.", falha: "Ninguém presta atenção." }),
    animal: Object.freeze({ ok: "O bicho se acalma.", falha: "O bicho não se acalma." }),
    socorrer: Object.freeze({ ok: "Você consegue cuidar disso.", falha: "Não melhora." }),
    rastrear: Object.freeze({ ok: "Você acha o rastro.", falha: "Você perde o rastro." }),
    arcano: Object.freeze({ ok: "Você entende o que vê.", falha: "Você não entende o que vê." }),
    outro: Object.freeze({ ok: "Você consegue.", falha: "Não dá certo." }),
  }),
  /* A LINHA DE TROCA: quando a poda leva a prosa inteira e não há
     resultado a dizer, o que de fato ficou, pela razão da poda */
  troca: Object.freeze({
    objeto: "Nada passa para a sua mão.",
    pagamento: "Nenhuma moeda sai da sua bolsa.",
    meio: "Você não tem isso com você.",
    fala: "Ninguém responde por enquanto.",
    inventada: "Ninguém mais está aqui.",
    ausente: "Ninguém responde ao chamado.",
  }),
  /* 21/11 (sessão 6 do Mestre vivo): CORTOU, REPÕE. O conferente disparou dez
     vezes e só cortou: a venda, a entrega e o pagamento sumiam e nada dizia o
     que de fato valia. Agora a primeira frase cortada de cada razão dá lugar a
     uma linha destas, escolhida pela semente do turno (mesma frase, mesmo
     turno, mesma linha). Voz do Mestre, sem nome de mecanismo. */
  reposicao: Object.freeze({
    objeto: Object.freeze(["Nada muda de mão.", "A coisa não chega à sua mão.", "Por ora, nada passa para você."]),
    pagamento: Object.freeze(["As moedas seguem na sua bolsa.", "A troca não se fecha, e a sua bolsa continua como estava.", "Nenhuma moeda sai da sua bolsa."]),
    meio: Object.freeze(["Você não tem isso com você.", "Sua mão procura e não acha a ferramenta.", "Isso não está com você."]),
  }),
  /* A FRASE ÓRFÃ: a que vem logo depois de uma cortada e abre referindo o que
     sumiu — o pronome sujeito («Ela espera a resposta»), o «isso», o «com ela
     na mão», o «os olhos dele», ou o gesto sem sujeito («Não tira os olhos de
     você»). Só a vizinha imediata, só no começo da frase: o pronome no meio de
     uma frase com antecedente próprio não é órfão. */
  orfa: Object.freeze({
    pronome: Object.freeze(["ela", "ele", "elas", "eles", "isso", "isto", "aquilo"]),
    dono: Object.freeze(["dele", "dela", "deles", "delas"]),
    antes: Object.freeze(["nao", "nem", "ainda", "ja", "so", "apenas"]),
    gesto: Object.freeze(["tira", "desvia", "espera", "aguarda", "sorri", "acena", "encara", "cruza", "suspira", "bufa", "assente", "resmunga", "embolsa", "recolhe", "guarda", "observa"]),
  }),
  /* O ÊXITO NA FALHA: o dado falhou e a prosa conta que deu certo (sessão 6,
     turno 39: a fuga falhou e o texto pôs a heroína «do outro lado, de pé»).
     Estreito de propósito: só nas famílias abaixo, só com «você» por sujeito
     até `perto` palavras antes do verbo, nunca com negação, «quase» ou um
     «mas» na frase. O verbo de êxito basta; o de chegada só com o lugar
     alcançado nas `janela` palavras seguintes. */
  exitoNaFalha: Object.freeze({
    familias: Object.freeze(["travessia"]),
    perto: 3,
    janela: 6,
    verbos: Object.freeze(["consegue", "conseguiu", "escapa", "escapou", "despista", "despistou", "alcanca", "alcancou"]),
    chegada: Object.freeze(["esta", "chega", "chegou", "pousa", "pousou", "aterrissa", "aterrissou", "passa", "passou", "atravessa", "atravessou"]),
    lugares: Object.freeze(["do outro lado", "no topo", "em cima", "no alto", "a salvo", "fora do alcance", "longe dele", "longe deles"]),
    trava: Object.freeze(["quase", "mas", "porem", "contudo", "entretanto"]),
  }),
  /* o desafio da régua → a família do resultado (o mesmo mapa da régua,
     FAMILIA_DO_DESAFIO, só para os ids que o teste do turno guarda) */
  familiaDoDesafio: Object.freeze({
    buscar: "procurar", investigar: "procurar", escutar: "procurar", desarmar: "procurar",
    furtar_se: "esgueirar", seguir_alguem: "esgueirar", mentira: "ler_pessoa",
    lembrar: "saber", fraqueza: "saber", heraldica: "saber", orientar: "saber", arcano: "arcano",
    tranca: "forcar", forcar: "forcar", arrebentar: "forcar",
    escalar: "travessia", nadar: "travessia", saltar: "travessia", equilibrio: "travessia", escapar: "travessia", cavalgar: "travessia",
    rastrear: "rastrear", estancar: "socorrer", diagnosticar: "socorrer", aguentar: "socorrer",
    bater_carteira: "furtar", convencer: "convencer", fazer_falar: "convencer", impressionar: "convencer",
    intimidar: "intimidar", mentir: "enganar", falsificar: "enganar", atuar: "atuar", acalmar_bicho: "animal",
  }),
});
const C = O_CONFERENTE;
const HEROI = new Set(C.heroi), POSSE = new Set(C.posse), NEGA = new Set(C.nega), VAZIAS = new Set(C.vazias);
const PAGAR = new Set(C.pagar.verbos), SO_MOEDA = new Set(C.pagar.soComMoeda), MOEDA = new Set(C.pagar.moeda);
const MEIO = new Map();
for (const f of C.meios) for (const p of f) MEIO.set(p, f);

/* ---------------- a prosa em pedaços ----------------
   Cada linha é dividida em frases; a linha que abre com travessão é um
   pedaço só (a fala e a etiqueta dela). `nar` é a parte narrada do pedaço
   (sem as falas): é nela que se lê o que a prosa AFIRMA. */
function pedacosDe(texto) {
  const out = [];
  String(texto).split("\n").forEach((linha, li) => {
    if (!linha.trim()) return;
    if (/^\s*[—–]/.test(linha)) {
      const nar = linha.trim().split(/[—–]/).filter((_, i) => i >= 2 && i % 2 === 0).join(" ");
      out.push({ li, texto: linha, nar: tirarAspas(nar), fala: true });
      return;
    }
    for (const m of linha.matchAll(/[^.!?…]+(?:[.!?…]+["»”']?|$)\s*/g)) {
      if (!m[0].trim()) continue;
      const dentro = ((linha.slice(0, m.index).match(/[—–]/g) || []).length % 2) === 1;
      out.push({ li, texto: m[0], nar: dentro ? "" : tirarAspas(m[0].replace(/[—–][^—–]*$/, "")), fala: dentro });
    }
  });
  return out;
}
const tirarAspas = (s) => String(s).replace(/«[^»]*»/g, " ").replace(/“[^”]*”/g, " ").replace(/"[^"]*"/g, " ");
function remontar(texto, pedacos, fora, repoe) {
  const linhas = String(texto).split("\n");
  const porLinha = new Map();
  for (const p of pedacos) { if (!porLinha.has(p.li)) porLinha.set(p.li, []); porLinha.get(p.li).push(p); }
  const novas = [];
  const R = repoe instanceof Map ? repoe : new Map();
  linhas.forEach((linha, li) => {
    const ps = porLinha.get(li);
    if (!ps) { novas.push(linha); return; }
    /* a cortada que repõe dá lugar à linha, com o espaço que ela tinha */
    const fica = ps.map((p) => (!fora.has(p) ? p.texto : R.has(p) ? R.get(p) + ((p.texto.match(/\s+$/) || [" "])[0]) : "")).join("");
    if (fica.trim()) novas.push(fica.replace(/\s+$/, ""));
  });
  return novas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------------- o que a frase pede, e o meio que diz ser dela ---------------- */
function pedidosDaFrase(frase) {
  const m = sem(frase).match(C.pede);
  return m ? palavras(m[2]) : [];
}
const temNaPosse = (cabeca, posses) => {
  const fam = MEIO.get(cabeca) || [cabeca];
  const ps = new Set(arr(posses).flatMap((n) => palavras(obj(n) ? n.nome : n)));
  return fam.some((c) => ps.has(c) || ps.has(c + "s"));
};
/* a palavra é uma coisa que se pega? (a tabela da memória, as cabeças daqui, as famílias do pedido) */
const ehCoisa = (x) => [x, x.replace(/s$/, ""), x.replace(/oes$/, "ao")].some((y) =>
  Object.prototype.hasOwnProperty.call(MEMORIA_DO_INVENTADO.objetos, y) || Object.prototype.hasOwnProperty.call(C.maisObjetos, y) || C.doPedido.some((f) => f.includes(y)));
/* a arma ou ferramenta que a frase diz ser do herói e ele não tem */
export function osMeiosNegados(frase, posses) {
  const t = sem(frase);
  const out = [];
  for (const m of t.matchAll(C.meuMeio)) {
    const c = m[2];
    if (MEIO.has(c) && !temNaPosse(c, posses) && !out.includes(c)) out.push(c);
  }
  return out;
}

/* ---------------- as leituras de um pedaço ---------------- */
const ws = (s) => [...sem(s).matchAll(/[a-z0-9]+(?:-[a-z0-9]+)*/g)].map((m) => m[0]);
const negadoNa = (w, coisas) => w.some((x, k) => NEGA.has(x) || (x === "sem" && !!coisas && [w[k + 1], w[k + 2]].some((y) => y && coisas.has(y))));
/* o herói é o sujeito do verbo em i: o pronome até quatro palavras antes, ou
   a mão dele («sua mão»); ou o verbo abre a frase e a anterior era dele */
function heroiFaz(w, i, heroiAntes) {
  for (let k = i - 1; k >= Math.max(0, i - 4); k--) {
    if (HEROI.has(w[k]) && !(k > 0 && ["a", "de", "para", "com", "por", "em"].includes(w[k - 1]))) return true;
    if (k > 0 && POSSE.has(w[k - 1]) && ["mao", "maos", "dedos", "dedo"].includes(w[k])) return true;
  }
  return heroiAntes && i <= 1;
}
function pagaNoPedaco(nar, heroiAntes) {
  const w = ws(nar);
  if (!w.length || negadoNa(w)) return false;
  if (C.pagar.vende.test(sem(nar))) return true;
  for (let i = 0; i < w.length; i++) {
    const base = w[i].split("-")[0];
    if (!PAGAR.has(base) || !heroiFaz(w, i, heroiAntes)) continue;
    if (!SO_MOEDA.has(base)) return true;
    if (w.slice(i + 1, i + 1 + C.pagar.janela).some((x) => MOEDA.has(x))) return true;
  }
  return false;
}
function meioNoPedaco(nar, negados) {
  if (!negados.length) return false;
  const w = ws(nar);
  const fams = new Set(negados.flatMap((c) => MEIO.get(c) || [c]));
  if (!w.length || negadoNa(w, fams)) return false;
  for (let k = 0; k < w.length; k++) {
    if (!fams.has(w[k])) continue;
    /* do herói: o pronome antes da palavra, ou «sua lâmina» */
    const doHeroi = w.slice(0, k).some((x) => HEROI.has(x)) || (k > 0 && POSSE.has(w[k - 1]));
    if (!doHeroi && k >= C.meioNoComeco) continue;
    /* o dono logo depois da palavra («a lança do guarda», «a faca dela») */
    if (!C.doOutro.test(w.slice(k + 1, k + 2).join(" "))) return true;
  }
  return false;
}

/* ---------------- quem é quem ---------------- */
function aPessoa(p) {
  const o = obj(p);
  if (!o) return null;
  const nome = txt(o.nome), papel = txt(o.papel);
  if (!nome && !papel) return null;
  return { nome, papel, doGrupo: arr(o.estados).includes("do_grupo") };
}
const ehOAlvo = (p, alvo) => {
  const a = sem(alvo).trim();
  if (!a) return false;
  if (p.nome && primeiro(p.nome) === primeiro(alvo)) return true;
  const pp = sem(p.papel).trim();
  return !!pp && (pp.includes(a) || a.includes(pp));
};
const chavesDoAlvo = (alvo, pessoas) => {
  const p = pessoas.find((x) => x.nome && ehOAlvo(x, alvo));
  const k = palavras(alvo).filter((x) => x.length >= 4 && !VAZIAS.has(x));
  return [...new Set([...(p ? [primeiro(p.nome)] : []), ...k])];
};
const temAlguma = (texto, chaves) => {
  const w = new Set(ws(texto));
  return chaves.some((k) => w.has(k));
};
const comecaCom = (texto, raizes) => ws(texto).some((x) => raizes.some((r) => x.startsWith(r)));
function parecida(a, b) {
  const A = new Set(ws(a).filter((x) => x.length >= 4)), B = new Set(ws(b).filter((x) => x.length >= 4));
  if (A.size < C.minPalavrasDaFala || B.size < C.minPalavrasDaFala) return false;
  let n = 0;
  for (const x of A) if (B.has(x)) n++;
  return n / Math.min(A.size, B.size) >= C.parecido;
}
/* quem fala ou age na prosa, e o quê: a régua da poda do ausente (sujeito de
   verbo de ação ou de fala, a etiqueta da fala, a fala colada), sem podar */
function quemTomaAPalavra(texto, pessoas, heroi) {
  const nomeados = pessoas.filter((p) => p.nome).map((p) => ({ nome: p.nome, onde: "", morto: false }));
  if (!nomeados.length) return new Map();
  const r = podarOAusente(texto, nomeados, { frase: "", outros: [heroi].filter(Boolean), limiar: 1, semTravaDaFala: true });
  const out = new Map();
  for (const p of r.podadas) out.set(p.nome, [...(out.get(p.nome) || []), p.frase]);
  return out;
}

/* ---------------- a semente, a órfã e o êxito na falha (21/11, sessão 6) ---------------- */
/* FNV-1a de 32 bits: a mesma frase no mesmo turno escolhe a mesma linha em qualquer máquina */
function semente(s) {
  let h = 0x811c9dc5;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
export function linhaDeReposicao(motivo, chave) {
  const L = C.reposicao[motivo];
  if (!L || !L.length) return "";
  return L[semente(`${chave}|${motivo}`) % L.length];
}
const PRONOME_ORFAO = new Set(C.orfa.pronome), DONO_ORFAO = new Set(C.orfa.dono), ANTES_ORFAO = new Set(C.orfa.antes), GESTO_ORFAO = new Set(C.orfa.gesto);
/* a frase abre referindo o que a cortada levou? (só o começo dela) */
export function ehOrfa(frase) {
  const w = ws(frase);
  if (!w.length) return false;
  if (PRONOME_ORFAO.has(w[0])) return true;
  if (w[0] === "com" && PRONOME_ORFAO.has(w[1])) return true;
  if (["o", "a", "os", "as"].includes(w[0]) && DONO_ORFAO.has(w[2])) return true;
  const k = ANTES_ORFAO.has(w[0]) ? 1 : 0;
  return GESTO_ORFAO.has(w[k]);
}
/* as frases do texto ORIGINAL que a prosa de agora ainda tem, na ordem; a que
   ficou logo depois de uma que saiu e abre órfã sai também (e a seguinte, se
   for órfã da órfã). Devolve a prosa sem elas e as frases tiradas. */
function cortarOrfas(original, atual) {
  const ps = pedacosDe(original);
  let cursor = 0, saiu = false;
  const tirar = [];
  for (const p of ps) {
    const k = p.texto.trim();
    const i = k ? atual.indexOf(k, cursor) : -1;
    if (i < 0) { saiu = true; continue; }
    cursor = i + k.length;
    if (saiu && !p.fala && ehOrfa(p.texto)) { tirar.push({ i, k }); continue; }
    saiu = false;
  }
  if (!tirar.length) return { texto: atual, orfas: [] };
  let s = atual;
  /* a marca \u0001 diz «aqui havia texto»: a linha que fica só com ela sai inteira */
  for (const { i, k } of [...tirar].reverse()) s = s.slice(0, i) + "\u0001" + s.slice(i + k.length);
  s = s.split("\n").filter((l) => !/^[\s\u0001]+$/.test(l) || !l.includes("\u0001"))
    .map((l) => l.replace(/\u0001/g, "").replace(/[ \t]{2,}/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { texto: s, orfas: tirar.map((x) => x.k) };
}
const VERBO_EXITO = new Set(C.exitoNaFalha.verbos), CHEGADA = new Set(C.exitoNaFalha.chegada), TRAVA_EXITO = new Set(C.exitoNaFalha.trava);
/* a frase narra que o herói conseguiu? (para o veredito de falha) */
export function contaOExito(nar) {
  const w = ws(nar);
  if (!w.length || negadoNa(w) || w.some((x) => TRAVA_EXITO.has(x))) return false;
  const E = C.exitoNaFalha;
  for (let i = 0; i < w.length; i++) {
    const doHeroi = w.slice(Math.max(0, i - E.perto), i).some((x) => HEROI.has(x));
    if (!doHeroi) continue;
    if (VERBO_EXITO.has(w[i])) return true;
    if (CHEGADA.has(w[i])) {
      const depois = " " + w.slice(i + 1, i + 1 + E.janela).join(" ") + " ";
      if (E.lugares.some((l) => depois.includes(" " + l + " "))) return true;
    }
  }
  return false;
}

/* a família do resultado: a do desafio que rolou, senão a do veredito */
export function linhaDoResultado(familia, sucesso, alvo) {
  const L = C.resultado[familia] || C.resultado.outro;
  const a = txt(alvo);
  const comNome = a && /^\p{Lu}/u.test(a);
  if (L.okSem && !comNome) return sucesso ? L.okSem : L.falhaSem;
  return (sucesso ? L.ok : L.falha).replace("{alvo}", a);
}

/* ============================================================
   quemFicaCalado(falas, turno, { frase, alvo, pessoas }) → [nome]
   Quem tomou a palavra nos últimos `vez` turnos e a quem a frase não se
   dirige (nem é o alvo): vai ao veto da ficha da cena ANTES da narração
   (fichaDaCenaNaPauta, `calados`). A mesma régua da poda, um passo antes.
   ============================================================ */
export function quemFicaCalado(falas, turno, ctx) {
  try {
    const f = obj(falas) || {};
    const c = obj(ctx) || {};
    const n = Number(turno);
    if (!Number.isFinite(n)) return [];
    const naFrase = new Set(palavras(c.frase));
    const nomes = arr(c.pessoas).map(aPessoa).filter((p) => p && p.nome).map((p) => p.nome);
    return nomes.filter((nome) => {
      const m = obj(f[primeiro(nome)]);
      if (!m || !Number.isFinite(m.turno) || n - m.turno >= C.vez) return false;
      if (naFrase.has(primeiro(nome))) return false;
      return !(txt(c.alvo) && primeiro(c.alvo) === primeiro(nome));
    });
  } catch {
    return [];
  }
}

/* ============================================================
   conferirAProsa(narrativa, ctx) →
     { narrativa, podadas: [{ motivo, frase }], troca, frente, falas, repostas }
   ctx: {
     frase      — a do jogador, neste turno;
     cena       — a cena do momento ({ pessoas: [{ nome, papel, estados }] });
     alvo       — a quem a frase fala (momento.alvo), ou "";
     aoGrupo    — a frase fala ao grupo (momento.aoGrupo);
     familia    — a família da ação julgada (familiaDaAcao), ou "";
     teste      — o teste do turno ({ sucesso, desafio }) ou null (sem dado);
     coisa      — a coisa em que a frase mexe (aCoisaDaFrase), ou "";
     negados    — o que o sistema negou neste turno (semFolga);
     posses     — o que é do herói (inventário e equipado);
     estado     — o da memória do inventado (o cânone);
     lugarDoTurno, mundo — idem;
     pagou      — a bolsa mexeu neste turno: true | false | null (não se sabe);
     heroi      — o nome do herói;
     turno      — o da pauta;
     falas      — a memória de quem falou ({ [primeiro nome]: { turno, fala } });
     ausente    — quem a frase chamou e a ficha diz que não está aqui
                  (quemNaoEstaNaCena: { nome, onde, morto }), ou null
   }
   `troca`: a linha que o sistema pôs no lugar da prosa (""), `frente`: a
   do resultado posta à frente (""). `falas`: a memória nova (objeto novo).
   `repostas`: as linhas que entraram no lugar de uma cortada (21/11).
   ============================================================ */
export function conferirAProsa(narrativa, ctx) {
  const texto = typeof narrativa === "string" ? narrativa : "";
  const c = obj(ctx) || {};
  const falas0 = obj(c.falas) || {};
  const nada = { narrativa: texto, podadas: [], troca: "", frente: "", falas: falas0, repostas: [] };
  if (!texto.trim()) return nada;
  try {
    const frase = txt(c.frase);
    const naFrase = new Set(palavras(frase));
    const turno = Number.isFinite(Number(c.turno)) ? Number(c.turno) : null;
    const pessoas = arr(obj(c.cena) ? c.cena.pessoas : null).map(aPessoa).filter(Boolean);
    const alvo = txt(c.alvo);
    const heroi = txt(c.heroi);
    const podadas = [];

    /* a. as afirmações: o objeto, o pagamento, o meio */
    const meiosNegados = [...new Set([...osMeiosNegados(frase, c.posses), ...arr(c.negados).flatMap(palavras).filter((x) => MEIO.has(x) && !temNaPosse(x, c.posses))])];
    const pedidos = pedidosDaFrase(frase).filter((x) => !temNaPosse(x, c.posses));
    const semFolga = [...new Set([...arr(c.negados).map(txt).filter(Boolean), ...pedidos, ...meiosNegados])];
    const opc = { frase, lugarDoTurno: txt(c.lugarDoTurno), maisObjetos: C.maisObjetos, ...(semFolga.length ? { semFolga } : {}) };
    const E = obj(c.estado) || {};
    const pedacos = pedacosDe(texto);
    const fora = new Set();
    /* 21/11: a razão de cada cortada, para a linha que repõe */
    const razao = new Map();
    const familia = (c.teste && C.familiaDoDesafio[txt(c.teste.desafio)]) || txt(c.familia);
    const julgou = !!(c.teste && typeof c.teste.sucesso === "boolean");
    const linhaRes = julgou ? linhaDoResultado(familia, c.teste.sucesso, alvo) : "";
    const exitoNaFalha = julgou && c.teste.sucesso === false && C.exitoNaFalha.familias.includes(familia);
    let anterior = "";
    for (const p of pedacos) {
      if (!p.nar.trim()) continue;
      const heroiAntes = /\b(voce|tu)\b/.test(sem(anterior));
      /* o dado falhou e a frase conta que deu certo: sai, e o resultado entra no lugar */
      if (exitoNaFalha && contaOExito(p.nar)) { fora.add(p); razao.set(p, "exito"); podadas.push({ motivo: "exito", frase: p.texto.trim() }); anterior = p.nar; continue; }
      /* o meio negado primeiro: a gazua «enfiada» é também objeto, e a razão é o meio */
      let motivo = meioNoPedaco(p.nar, meiosNegados) ? "meio" : "";
      if (!motivo) try {
        const antes = anterior ? oInventadoDaProsa(anterior, E, opc).map((o) => o.nome) : [];
        const agora = oInventadoDaProsa(`${anterior ? anterior.replace(/[.!?…\s]*$/, ". ") : ""}${p.nar}`, E, opc)
          .filter((o) => ["pega", "recebe", "guarda"].includes(o.como) && !antes.includes(o.nome));
        if (agora.length) motivo = "objeto";
      } catch { /* a régua do objeto não abre: segue sem ela */ }
      if (!motivo && pedidos.length && C.daAoHeroi.test(sem(p.nar)) && !negadoNa(ws(p.nar))) {
        const coisas = pedidos.filter(ehCoisa);
        const fam = new Set(coisas.flatMap((x) => [x, ...(C.doPedido.find((f) => f.includes(x) || f.includes(x.replace(/s$/, ""))) || [])]));
        if (ws(p.nar).some((x) => fam.has(x) && !temNaPosse(x, c.posses) && x.length >= 3)) motivo = "objeto";
      }
      if (!motivo && c.pagou === false && pagaNoPedaco(p.nar, heroiAntes)) motivo = "pagamento";
      if (motivo) { fora.add(p); razao.set(p, motivo); podadas.push({ motivo, frase: p.texto.trim() }); }
      anterior = p.nar;
    }
    /* CORTOU, REPÕE: a primeira cortada de cada razão dá lugar à linha dela */
    const repoe = new Map();
    const repostas = [];
    const chave = `${frase}|${turno == null ? "" : turno}`;
    for (const p of pedacos) {
      const m = razao.get(p);
      if (!m) continue;
      const linha = m === "exito" ? linhaRes : linhaDeReposicao(m, chave);
      if (!linha || repostas.includes(linha)) continue;
      repoe.set(p, linha);
      repostas.push(linha);
    }
    let prosa = fora.size ? remontar(texto, pedacos, fora, repoe) : texto;

    /* 21/11: QUEM NÃO ESTÁ NÃO FALA. A ficha disse que a pessoa chamada não
       está aqui (quemNaoEstaNaCena); a fala e a ação que a prosa lhe dá saem.
       Só com ela por sujeito ou na etiqueta da fala — a régua da poda do
       ausente; falar DELA continua a valer. Antes da gente inventada: quem a
       ficha conhece e diz ausente não é inventado. A frase não protege o
       nome aqui (foi ele quem o chamou, e é por isso que a prosa o trouxe). */
    const aus = obj(c.ausente) && txt(c.ausente.nome) ? [{ nome: txt(c.ausente.nome), onde: txt(c.ausente.onde), morto: !!c.ausente.morto }] : [];
    if (aus.length && prosa.trim()) {
      const pa = primeiro(aus[0].nome);
      const outros = pessoas.map((p) => p.nome).filter((n) => n && primeiro(n) !== pa);
      const r = podarOAusente(prosa, aus, { frase: "", outros: [...outros, heroi].filter(Boolean), limiar: 1, semTravaDaFala: true });
      for (const p of r.podadas) podadas.push({ motivo: "ausente", frase: p.frase });
      if (r.podadas.length) prosa = r.narrativa;
    }
    /* b. quem fala: a gente inventada, e quem está fora da vez */
    const inventados = (() => {
      try { return aGenteInventadaDaProsa(prosa, E, { lugarDoTurno: txt(c.lugarDoTurno), mundo: c.mundo, conhecidos: pessoas.map((p) => p.nome).filter(Boolean) }).map((g) => g.nome); } catch { return []; }
    })();
    const tomam = quemTomaAPalavra(prosa, pessoas, heroi);
    const foraDaVez = [];
    for (const p of pessoas) {
      if (!p.nome || (heroi && primeiro(p.nome) === primeiro(heroi))) continue;
      const diz = tomam.get(p.nome);
      if (!diz || !diz.length) continue;
      if (naFrase.has(primeiro(p.nome))) continue;
      if (c.aoGrupo && p.doGrupo) continue;
      if (alvo && ehOAlvo(p, alvo)) continue;
      const fala = diz.join(" ");
      const m = obj(falas0[primeiro(p.nome)]);
      const semEla = diz.reduce((s, f) => s.split(f).join(" "), prosa);
      const repete = !!m && txt(m.fala) && parecida(fala, m.fala);
      const noLugar = !!alvo && !temAlguma(semEla, chavesDoAlvo(alvo, pessoas));
      const cedo = !!m && turno != null && Number.isFinite(m.turno) && turno - m.turno < C.vez && turno !== m.turno;
      const comprida = fala.length > C.curta && (!!alvo || !!c.teste);
      if (repete || noLugar || cedo || comprida) foraDaVez.push(p.nome);
    }
    const candidatos = [...inventados, ...foraDaVez].map((nome) => ({ nome, onde: "", morto: false }));
    if (candidatos.length) {
      const outros = pessoas.map((p) => p.nome).filter((n) => n && !candidatos.some((x) => x.nome === n));
      const r = podarOAusente(prosa, candidatos, { frase, outros: [...outros, heroi].filter(Boolean), limiar: 1, semTravaDaFala: true });
      for (const p of r.podadas) podadas.push({ motivo: inventados.includes(p.nome) ? "inventada" : "fala", frase: p.frase });
      if (r.podadas.length) prosa = r.narrativa;
    }
    /* 21/11: a frase que ficou órfã do que saiu sai também */
    if (podadas.length && prosa.trim()) {
      const o = cortarOrfas(texto, prosa);
      for (const f of o.orfas) podadas.push({ motivo: "orfa", frase: f });
      prosa = o.texto;
    }

    /* c. a troca e a frente */
    let troca = "", frente = "";
    if (podadas.length && prosa.replace(/\s+/g, " ").trim().length < C.minLetras) {
      prosa = "";
      if (!linhaRes) troca = C.troca[podadas[0].motivo] || C.troca.fala;
    }
    if (julgou) {
      const chaves = [...(alvo ? chavesDoAlvo(alvo, pessoas) : []), ...palavras(c.coisa).filter((x) => x.length >= 4 && !VAZIAS.has(x))];
      const raizes = C.trata[familia] || [];
      const trata = !!prosa && (prosa.includes(linhaRes) || temAlguma(prosa, chaves) || (raizes.length > 0 && comecaCom(prosa, raizes)));
      if (!trata) frente = linhaRes;
    }
    const final = [frente, troca, prosa].filter((x) => x && x.trim()).join("\n\n");

    /* a memória: quem tomou a palavra na prosa que vai à tela */
    const falas = { ...falas0 };
    if (turno != null) {
      for (const [nome, diz] of quemTomaAPalavra(final, pessoas, heroi)) {
        if (heroi && primeiro(nome) === primeiro(heroi)) continue;
        falas[primeiro(nome)] = Object.freeze({ turno, fala: diz.join(" ").slice(0, 400) });
      }
      const chaves = Object.keys(falas).sort((a, b) => (falas[b].turno || 0) - (falas[a].turno || 0));
      for (const k of chaves.slice(C.memoria)) delete falas[k];
    }
    if (!podadas.length && !frente) return { ...nada, falas };
    return { narrativa: final || texto, podadas, troca, frente, falas, repostas: repostas.filter((l) => final.includes(l)) };
  } catch {
    return nada;
  }
}

/* a memória do inventado e a do conferente falam do mesmo objeto: a suíte lê
   que as cabeças daqui não colidem com as dela */
export const CABECAS_DO_CONFERENTE = Object.freeze(Object.keys(C.maisObjetos).filter((k) => !Object.prototype.hasOwnProperty.call(MEMORIA_DO_INVENTADO.objetos, k)));
