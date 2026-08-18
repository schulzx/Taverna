/* ============================================================
   SOCIAL (v9.65) — a dificuldade sai da PESSOA e do PEDIDO

   Até aqui, convencer, intimidar e enganar rolavam contra um 14
   fixo. O mesmo 14 para arrancar uma fofoca de um bêbado e para
   convencer o capitão da guarda a abrir o portão da cidade. É
   exatamente o defeito que já foi consertado duas vezes neste
   projeto, com outras roupas:

     - a busca rolava contra um número que descrevia o herói, e não
       o quarto (v9.59);
     - a tranca rolava contra um número que não sabia se a porta era
       de taverna ou de cadeia (v9.59).

   O terceiro caso é este, e é o mais usado dos três fora da luta.

   E havia o outro lado, pior que a dificuldade: no SUCESSO, o
   quanto a pessoa cedia era inteiramente da IA. Ela concede o que a
   cena dela pede — o guarda que abre o portão porque a história
   quer o herói do outro lado, o mercador que dá o item de graça
   porque a conversa ficou bonita. Um sistema em que o dado decide
   SE e a IA decide QUANTO não é um sistema: é uma formalidade antes
   da improvisação.

   ------------------------------------------------------------
   A PEÇA CENTRAL É A ESCADA DO PEDIDO.

   Numa mesa, ninguém rola "Persuasão" no vazio: rola-se para
   arrancar UMA coisa de UMA pessoa, e todo mestre sabe, sem tabela
   nenhuma, que pedir uma informação é mais fácil que pedir um
   favor, que é mais fácil que pedir para quebrar uma regra, que é
   mais fácil que pedir para trair quem lhe paga. E que há coisas
   que conversa nenhuma compra.

   Essa escada é o que esta tabela escreve. Cada degrau diz três
   coisas, e a terceira é a que tira a decisão da IA:

     dc     — o quanto custa arrancar aquilo;
     cede   — o que o sucesso compra EXATAMENTE;
     nunca  — o que ele não compra, por mais alto que role o dado.

   O DEGRAU PADRÃO É `favor`, dc 14 — o número de antes. Quando o
   sistema não consegue ler o tamanho do pedido, o jogo se comporta
   como se comportava; a mudança só morde onde há informação. É a
   forma honesta de trocar uma régua por outra sem que ninguém
   descubra jogando que a conta virou outra.
   ============================================================ */

import { relacaoNPC } from "./npcs.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ============================================================
   A ESCADA DO PEDIDO
   ============================================================ */
export const TAMANHOS_DO_PEDIDO = [
  {
    id: "cortesia", dc: 8, rotulo: "uma cortesia",
    rx: /\b(onde fica|como chego|que horas|quanto custa|qual o pre[cç]o|me indica|me aponta|o caminho para|quem é o dono|como se chama)\b/,
    cede: "a cortesia que qualquer pessoa faria: uma direção, um nome, um preço de tabela",
    nunca: "nada que a pessoa precise pensar duas vezes antes de dar",
  },
  {
    id: "conversa", dc: 11, rotulo: "uma informação que ela não guarda",
    rx: /\b(o que se (diz|comenta|fala)|que not[ií]cias|ouviu falar|soube de|algum boato|algum rumor|o que aconteceu|quem esteve|quem passou|me conta (sobre|o que)|fofoca|novidades)\b/,
    cede: "o que essa pessoa sabe e não tem motivo para esconder: boato, quem passou por aqui, o que se comenta na rua",
    nunca: "aquilo que ela ganharia calando ou perderia falando",
  },
  {
    id: "favor", dc: 14, rotulo: "um favor que lhe custa pouco",
    rx: /\b(me d(ê|e|ar) um desconto|abaix(a|ar) o pre[cç]o|pechinch|barganh|me esper(a|ar)|guard(a|ar) (isto|isso|para mim)|lev(a|ar) (este|esse|um) recado|me empresta|me emprestar|me arrum|me apresent|fal(a|ar) bem de mim|me indic)\b/,
    cede: "um favor de quem não arrisca nada com ele: um desconto razoável, esperar, guardar algo, levar um recado, apresentar você a alguém",
    nunca: "qualquer coisa que ponha o emprego, o nome ou a pele dela em jogo",
  },
  {
    id: "risco", dc: 18, rotulo: "quebrar uma regra pequena",
    rx: /\b(vir(a|ar) (as costas|o rosto)|fing(e|ir) que n[aã]o (viu|vi|me viu)|me empresta(r)? a chave|abr(a|e|ir) (o|a) (port[aã]o|porta|cofre|arquivo|cela|jaula)|me deix(a|ar) (entrar|passar)|deix(a|ar) me (ver|olhar)|ment(e|ir) por mim|diz(er)? que eu estava|me escond(a|e|er)|n[aã]o cont(a|ar) a ningu[eé]m|deix(a|ar) passar|me d(ê|e|ar) a chave)\b/,
    cede: "que essa pessoa quebre uma regra pequena por você — e ela vai querer que isso não apareça",
    nunca: "que ela assuma a culpa depois, nem que repita o favor de graça",
  },
  {
    id: "traicao", dc: 22, rotulo: "trair quem lhe paga",
    rx: /\b(entreg(a|ar|ue) (o|a|seu|sua) (patr[aã]o|chefe|capit[aã]o|senhor|senhora|mestre|ordem|guilda|gente)|abandon(a|ar) o posto|desert(a|ar)|tra(i|ir|ia) (o|a|seu|sua)|se volt(a|ar) contra|testemunh(a|ar) contra|denunci(a|ar) (o|a|seu|sua)|mud(a|ar) de lado|roub(a|ar) para mim|entreg(a|ar|ue)-?(o|a|me))\b/,
    cede: "a traição pedida, e nada além dela — com medo, com preço e com data marcada para ela sumir da cidade",
    nunca: "lealdade nova: quem trai por você trai você, e o sistema conta com isso",
  },
];

/* O que conversa nenhuma compra. Não é um degrau mais caro: é a
   linha onde o teste deixa de existir, e o sistema DIZ o que
   mudaria — porque negar sem explicar é o mesmo que o Mestre
   improvisar um "não" e o jogador não ter o que fazer com ele. */
export const FORA_DA_CONVERSA = [
  {
    id: "vida", rx: /\b(se mat(a|e|ar)|tir(a|ar) a pr[oó]pria vida|morr(e|er) por mim|se sacrific|pul(a|ar) do|se entreg(a|ar) para morrer)\b/,
    porque: "ninguém entrega a própria vida porque a conversa foi boa",
    comoSeria: ["um vínculo construído ao longo de muitos dias", "uma dívida de vida", "uma fé que já era dela antes de você"],
  },
  {
    id: "familia", rx: /\b(entreg(a|ar|ue)\s+(o|a|os|as|seu|sua|meu|minha)?\s*(pr[oó]pri[ao]\s+)?(filh|m[aã]e|pai|irm[aã]|marido|esposa|mulher|fam[ií]lia)|mat(a|ar) (o|a) pr[oó]pri)/,
    porque: "não se convence alguém a entregar a própria família numa conversa",
    comoSeria: ["chantagem com algo maior que a família", "provar que já estão perdidos", "muito tempo e muito dano à pessoa"],
  },
  {
    id: "fe", rx: /\b(renega (a|sua) f[eé]|abandona (o|seu) deus|blasfem|cospe no altar|profana o pr[oó]prio)\b/,
    porque: "a fé de alguém não cai por argumento de estranho",
    comoSeria: ["um milagre contra ela", "anos de convivência", "provar a mentira do próprio templo"],
  },
];

export function tamanhoPorId(id) { return TAMANHOS_DO_PEDIDO.find((t) => t.id === id) || null; }
export function tamanhoPadrao() { return tamanhoPorId("favor"); }

/* Lê o TAMANHO do que está sendo pedido. Vai do mais caro para o mais
   barato: quem escreve "me deixa entrar e me diz o que se comenta" está
   pedindo as duas coisas, e o preço é o da mais cara. */
export function tamanhoDoPedido(texto) {
  const t = norm(texto);
  for (let i = TAMANHOS_DO_PEDIDO.length - 1; i >= 0; i--) {
    if (TAMANHOS_DO_PEDIDO[i].rx.test(t)) return TAMANHOS_DO_PEDIDO[i];
  }
  return tamanhoPadrao();
}

export function foraDaConversa(texto) {
  const t = norm(texto);
  return FORA_DA_CONVERSA.find((f) => f.rx.test(t)) || null;
}

/* ============================================================
   O TEMPERO DA PESSOA

   Dois eixos, e são diferentes: a RELAÇÃO é o que essa pessoa
   sente por você, e o PAPEL é o que ela tem a perder. Um amigo
   ferreiro empresta a forja; um amigo carcereiro ainda assim não
   abre a cela, porque o que segura a mão dele não é antipatia.
   ============================================================ */
export const PESO_DA_RELACAO = {
  conjuge: -6, romance: -5, familia: -5, aliado: -4, amigo: -4, companheiro: -4,
  neutro: 0, desconhecido: 2,
  rival: 4, inimigo: 8,
};

export const PESO_DO_PAPEL = [
  { rx: /guarda|soldad|capit[aã]|sentinela|milic|carcereir|xerife|patrulh/, delta: 3, diz: "gente de farda responde a outro dono" },
  { rx: /sacerdot|clerig|ac[oó]lito|monge|inquisid|orac|prior/, delta: 3, diz: "quem serve a um deus não negocia por você" },
  { rx: /nobre|bar[aã]o|conde|duque|senhor de|dama|principe|princesa|regente/, delta: 3, diz: "para a nobreza você é ninguém até provar o contrário" },
  { rx: /mercador|comerciant|vendedor|negociant|agiot|cambist|estalajadeir|taverneir/, delta: -1, diz: "quem vive de negociar está sempre meio aberto a negociar" },
  { rx: /ladr[aã]o|contraband|pirata|assassin|bandid|salteador|gatuno/, delta: -1, diz: "quem vive fora da lei não tem regra que o segure" },
  { rx: /mendig|servo|criad|camp[oô]nes|pescador|estribeir|moleque|aprendiz/, delta: -2, diz: "quem tem pouco tem pouco a perder ao ajudar" },
];

export function pesoDoPapel(papel) {
  const p = norm(papel);
  return PESO_DO_PAPEL.find((x) => x.rx.test(p)) || null;
}

/* ============================================================
   AS ALAVANCAS

   O que o herói pode pôr na mesa, e que o CÓDIGO consegue
   conferir. É a diferença entre uma alavanca e uma bravata: dizer
   "ofereço ouro" sem ouro na bolsa não desconta nada, e prometer
   ouro que não se tem é um problema para depois.

   O `segredo` é a mais bonita das quatro. O registro de pessoas
   guarda um campo `segredo` desde sempre — "o que ele esconde" — e
   até aqui ele era só memória de enredo para o Mestre ler. Agora
   ele tem consequência mecânica: saber o que alguém esconde, e
   dizer que sabe, vale mais que qualquer discurso.
   ============================================================ */
export const ALAVANCAS = [
  {
    id: "moeda", delta: -3, rotulo: "ouro na mesa",
    rx: /\b(ofere[cç]o|pago|dou|deixo|pus|ponho|na mesa|em troca de|por (uma|umas|dez|vinte|cinquenta|cem)?\s*moeda|suborn|gorjeta|prata|ouro)\b/,
    /* preço por degrau: um favor barato compra-se com trocado; uma
       traição, não. O número existe para o sistema poder COBRAR. */
    preco: { cortesia: 2, conversa: 10, favor: 30, risco: 120, traicao: 500 },
    confere: ({ pers, preco }) => (Number((pers || {}).moedas) || 0) >= preco,
    semIsso: "você não tem essa quantia na bolsa",
  },
  {
    id: "segredo", delta: -6, rotulo: "o que ela esconde",
    rx: /\b(eu sei (o que|que|sobre)|sei do seu|sei o que voc[eê]|seu segredo|conta comigo ou|todo mundo vai saber|posso contar a|se eu falar)\b/,
    confere: ({ pessoa }) => !!(pessoa && pessoa.segredo),
    semIsso: "você não sabe nada que essa pessoa esconda",
    /* chantagem funciona e cobra: quem é chantageado passa a odiar */
    piora: 2,
  },
  {
    id: "divida", delta: -4, rotulo: "a dívida que ela tem com você",
    rx: /\b(voc[eê] me deve|eu te (ajudei|salvei|tirei)|depois do que fiz|lembra (do|de) que|por conta daquilo|estamos quites|me deve essa)\b/,
    confere: ({ pessoa }) => !!(pessoa && /d[ií]vida|devo|deve|salvou|salvei|ajudei|favor/.test(norm(pessoa.notas))),
    semIsso: "não há dívida nenhuma registrada entre vocês",
  },
  {
    id: "aco", delta: -2, rotulo: "o aço à vista",
    rx: /\b(m[aã]o na espada|encost(o|ando|ar) (a|o) (l[aâ]mina|faca|punhal|espada|a[cç]o)|sac(o|ando|ar) a (espada|arma)|apont(o|ando|ar) (a|o) (l[aâ]mina|arma|espada|besta|arco)|de arma em punho|ponta da l[aâ]mina|com a espada na m[aã]o)\b/,
    confere: ({ pers }) => {
      const eq = Object.values((pers || {}).equipado || {});
      return eq.some((it) => /espada|machado|lan[cç]a|adaga|punhal|maça|martelo|arco|besta|cajado|lamina|sabre|foice|alabarda/.test(norm(typeof it === "string" ? it : (it && it.nome) || "")));
    },
    semIsso: "você não tem uma arma à mão para tornar isso crível",
    /* a ameaça funciona e cobra o mesmo: ninguém perdoa a lâmina */
    piora: 2,
    /* e só serve para quem está intimidando — ameaçar enquanto se
       tenta convencer é uma contradição, não um bônus */
    so: "intimidacao",
  },
];

export function alavancaPorId(id) { return ALAVANCAS.find((a) => a.id === id) || null; }

/* As alavancas que estão MESMO na mesa: a frase invoca, a ficha confirma.
   Devolve também as invocadas e não confirmadas, porque o jogador merece
   ouvir por que o blefe dele não contou. */
export function alavancasNaMesa(texto, { pessoa = null, pers = null, pericia = "" } = {}) {
  const t = norm(texto);
  const tamanho = tamanhoDoPedido(texto);
  const valem = [], vazias = [];
  for (const a of ALAVANCAS) {
    if (!a.rx.test(t)) continue;
    if (a.so && a.so !== pericia) continue;
    const preco = a.preco ? (a.preco[tamanho.id] || 0) : 0;
    let ok = true;
    try { ok = a.confere({ pessoa, pers, preco }); } catch { ok = false; }
    if (ok) valem.push({ ...a, preco });
    else vazias.push({ ...a, preco });
  }
  return { valem, vazias };
}

/* ============================================================
   A CONTA

   Devolve dificuldade, de onde ela veio, o que o sucesso compra e
   o que ele não compra. Nada aqui é sorteado: tudo sai da ficha da
   pessoa, do registro e da bolsa do herói.
   ============================================================ */
export function dificuldadeSocial({ texto = "", pessoa = null, pers = null, pericia = "", fama = 0 } = {}) {
  const tamanho = tamanhoDoPedido(texto);
  const partes = [];
  let dc = tamanho.dc;
  partes.push(tamanho.rotulo);

  if (pessoa) {
    const rel = (pessoa.relacao || "desconhecido").toLowerCase();
    const pr = PESO_DA_RELACAO[rel];
    if (pr) { dc += pr; partes.push(`${relacaoNPC(rel).rotulo.toLowerCase()} (${pr > 0 ? "+" : ""}${pr})`); }
    const pp = pesoDoPapel(pessoa.papel);
    if (pp) { dc += pp.delta; partes.push(`${pp.diz} (${pp.delta > 0 ? "+" : ""}${pp.delta})`); }
  }

  /* o nome do herói só pesa quando já existe. Fama alta abre porta e fama
     nenhuma não fecha nada — por isso a escada é assimétrica. */
  const f = Math.max(0, Math.min(100, Number(fama) || 0));
  if (f >= 70) { dc -= 3; partes.push("seu nome chega antes de você (−3)"); }
  else if (f >= 40) { dc -= 1; partes.push("já ouviram falar de você (−1)"); }

  const { valem, vazias } = alavancasNaMesa(texto, { pessoa, pers, pericia });
  for (const a of valem) { dc += a.delta; partes.push(`${a.rotulo} (${a.delta})`); }

  return {
    dc: Math.max(5, dc),
    deOnde: partes.join(", "),
    tamanho: tamanho.id,
    rotuloDoPedido: tamanho.rotulo,
    cede: tamanho.cede,
    nunca: tamanho.nunca,
    alavancas: valem.map((a) => ({ id: a.id, rotulo: a.rotulo, preco: a.preco, piora: a.piora || 0 })),
    blefes: vazias.map((a) => ({ id: a.id, rotulo: a.rotulo, porque: a.semIsso })),
    custoEmMoedas: valem.reduce((s, a) => s + (a.preco || 0), 0),
  };
}

/* ============================================================
   A RELAÇÃO SE MEXE

   Nenhum sistema social é honesto se a conversa não deixa marca.
   Ameaçar funciona — e custa. Chantagear funciona — e custa mais.
   Isto é o que faz o jogador escolher entre resolver a cena e
   resolver a campanha, que é a escolha interessante.
   ============================================================ */
export const ESCADA_DA_RELACAO = ["conjuge", "romance", "familia", "aliado", "amigo", "companheiro", "neutro", "desconhecido", "rival", "inimigo"];

export function moverRelacao(relacao, degraus) {
  const r = (relacao || "desconhecido").toLowerCase();
  /* as quatro do começo são laços, não temperatura: um cônjuge irritado
     não vira "aliado", vira um cônjuge irritado. A escada só mexe do
     neutro para baixo, que é onde ela descreve mesmo uma disposição. */
  const i = ESCADA_DA_RELACAO.indexOf(r);
  if (i < 0) return r;
  if (i < ESCADA_DA_RELACAO.indexOf("neutro") && degraus > 0) return r;
  const j = Math.max(0, Math.min(ESCADA_DA_RELACAO.length - 1, i + degraus));
  return ESCADA_DA_RELACAO[j];
}

/* ============================================================
   O ENVELOPE

   O ponto inteiro do módulo. O Mestre recebe o que foi comprado e
   o que NÃO foi, com a mesma força das outras regras: sem margem
   para a generosidade que a cena pediria.
   ============================================================ */
export function envelopeSocial(conta, { passou, quem = "essa pessoa", oQueEuDisse = "", rotulo = "convencer" }) {
  const disse = oQueEuDisse ? ` Eu disse: "${String(oQueEuDisse).trim()}".` : "";
  if (!passou) {
    return `[SOCIAL — RESOLVIDO PELO SISTEMA]${disse} Tentei ${rotulo} ${quem} e NÃO consegui. O que eu pedia era ${conta.rotuloDoPedido}, e a resposta é não.
REGRA DESTE ENVELOPE (obrigatória): a recusa é firme e vale a cena inteira. NÃO me dê metade do que pedi, NÃO deixe a pessoa "quase" aceitar, NÃO invente um terceiro que faça o favor no lugar dela. Mostre a recusa na voz e na postura dela, com o motivo DELA — o que ela tem a perder —, e devolva a palavra para mim.`;
  }
  const pago = conta.custoEmMoedas > 0 ? ` Já paguei ${conta.custoEmMoedas} moedas por isto, e o sistema já as tirou da minha bolsa.` : "";
  const alav = conta.alavancas.length ? ` O que pesou: ${conta.alavancas.map((a) => a.rotulo).join(", ")}.` : "";
  return `[SOCIAL — RESOLVIDO PELO SISTEMA]${disse} Tentei ${rotulo} ${quem} e CONSEGUI.${pago}${alav}
O QUE O SUCESSO COMPROU, exatamente: ${conta.cede}.
O QUE ELE NÃO COMPROU: ${conta.nunca}.
REGRA DESTE ENVELOPE (obrigatória): entregue o que está na primeira linha, inteiro, sem fazer a pessoa hesitar de novo — o teste já foi. E não entregue NADA da segunda: um sucesso não escala para o favor seguinte, e a pessoa continua sendo quem era, com os interesses que tinha.`;
}

/* Quando o pedido está fora do que qualquer conversa alcança. */
export function envelopeForaDaConversa(f, quem = "essa pessoa") {
  return `[SEM TESTE — DECISÃO DO SISTEMA] Eu pedi a ${quem} algo que conversa nenhuma compra: ${f.porque}. Não houve rolagem porque não havia teste — isto não é uma dificuldade alta, é outra categoria de coisa.
REGRA DESTE ENVELOPE (obrigatória): narre a recusa como a pessoa recusaria — assombro, riso, ofensa, medo, o que couber nela —, e NÃO abra uma fresta. Você PODE deixar claro pela cena o que um dia mudaria isso (${f.comoSeria.join(", ")}), mas nada disso acontece agora e nada disso se resolve nesta conversa.`;
}

/* A linha do blefe, e SÓ ela. A conta em si já sai na linha do teste, com o
   nome de quem está na frente — repeti-la aqui era o sistema falando duas
   vezes a mesma coisa, que na tela lê como ruído.

   O que esta linha diz não está em lugar nenhum: que o jogador ofereceu uma
   alavanca que não tinha. Sem ela, prometer ouro sem ouro falhava em
   silêncio, e ele passava a partida achando que a oferta pesava. */
export function falaDosBlefes(conta) {
  if (!conta || !conta.blefes.length) return "";
  return `🗣 Não contou: ${conta.blefes.map((x) => `${x.rotulo} — ${x.porque}`).join("; ")}.`;
}
