/* ============================================================
   O ADVERSÁRIO (v9.110) — a oposição como cena

   Um Mestre de mesa nunca roda "seis goblins atacam". Ele roda "seis
   goblins estão te empurrando para a beira do poço". Essa é a diferença
   entre um combate e uma cena, e ela é decidível.

   O que o sistema já sabia sobre a luta: `combate.js` sabe a mecânica,
   `orcamento.js` sabe se ela é justa, `emboscada.js` pega a investida,
   `grid.js` sabe quem alcança quem. E a única coisa que ele sabia sobre
   a VONTADE do inimigo era `querFugir` — mais 35% de chance de bater num
   companheiro em vez do herói, que era a prioridade de alvo inteira.

   ---------------- O QUE ISTO É ----------------

   O terceiro AGENTE. Como o Vilão e o Aliado, ele É alguém e responde
   "o que EU faço". A diferença de desenho: ele tem DUAS SAÍDAS do mesmo
   acervo, e essa é a razão de ele existir como módulo em vez de virar
   mais um envelope.

   · A INTENÇÃO é ficção — vai à Pauta e o Narrador conta.
   · A PRIORIDADE DE ALVO é mecânica — entra em `turnoDosInimigos` e
     muda quem apanha.

   Uma intenção que não muda o alvo é adjetivo; um alvo que não vem de
   uma intenção é aleatório. É por terem a mesma fonte que a frase
   "estão te empurrando para a beira do poço" fica VERDADE: o bicho de
   fato bate em quem está entre ele e a beira.

   ---------------- A CONDIÇÃO DE QUEBRA ----------------

   A terceira peça, e a que faz a luta ter forma. Toda intenção sabe em
   que ponto ela desmonta e no que vira: quem veio capturar e perdeu
   metade do bando passa a querer sair vivo; quem protegia uma coisa e a
   viu quebrar passa a querer vingança. Sem isso, um combate é a mesma
   frase repetida até alguém cair.

   ---------------- O QUE ELE NÃO FAZ ----------------

   Ele não rola dado, não decide dano, não escolhe golpe (isso é do
   `golpeDaVez`) e não escreve fala. Ele diz O QUE a oposição quer e EM
   QUEM ela bate. O COMO continua sendo do Narrador.
   ============================================================ */

import { menteDoBicho } from "./lexico.js";

const limpar = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);

/* ---------------- A PRIORIDADE DE ALVO ----------------
   Lista fechada, e fechada de propósito: cada uma é uma regra que o
   `turnoDosInimigos` sabe executar. Uma prioridade que o código não sabe
   cumprir seria uma promessa na Pauta sem nada atrás — a classe de bug
   que este projeto já pagou caro.

   `escolher` recebe os alvos possíveis e devolve UM, ou null quando
   ninguém serve (e aí quem chama cai na regra de sempre). */
export const PRIORIDADES = [
  {
    id: "o_ferido", o: "quem já está sangrando",
    escolher: (a) => maisPor(a.filter((x) => frac(x) < 0.6), (x) => -frac(x)),
  },
  {
    id: "o_conjurador", o: "quem está fazendo magia",
    escolher: (a) => primeiro(a.filter((x) => x.conjurador)),
  },
  {
    id: "o_curandeiro", o: "quem remenda os outros",
    escolher: (a) => primeiro(a.filter((x) => x.cura)),
  },
  {
    id: "quem_carrega", o: "quem está com a coisa",
    escolher: (a) => primeiro(a.filter((x) => x.carrega)),
  },
  {
    id: "quem_bloqueia", o: "quem está no caminho",
    escolher: (a) => primeiro(a.filter((x) => x.bloqueia)),
  },
  {
    id: "o_heroi", o: "o herói, e só ele",
    escolher: (a) => primeiro(a.filter((x) => x.heroi)),
  },
  {
    id: "quem_nao_e_o_heroi", o: "qualquer um menos o herói",
    escolher: (a) => primeiro(a.filter((x) => !x.heroi)),
  },
  {
    id: "o_mais_forte", o: "o que dói mais deixar de pé",
    escolher: (a) => maisPor(a, (x) => (x.nivel || 1) + (x.conjurador ? 2 : 0)),
  },
  {
    id: "o_mais_fraco", o: "o que cai mais fácil",
    escolher: (a) => maisPor(a, (x) => -((x.nivel || 1) + frac(x) * 3)),
  },
  {
    id: "quem_me_feriu", o: "quem me acertou por último",
    escolher: (a) => primeiro(a.filter((x) => x.meFeriu)),
  },
  {
    id: "quem_esta_perto", o: "o que estiver ao alcance da mão",
    escolher: (a) => primeiro(a.filter((x) => x.perto)),
  },
  {
    id: "quem_esta_longe", o: "quem atira de longe",
    escolher: (a) => primeiro(a.filter((x) => !x.perto)),
  },
  {
    id: "quem_estiver", o: "quem estiver na frente",
    escolher: (a) => primeiro(a),
  },
];

export function prioridadePorId(id) { return PRIORIDADES.find((p) => p.id === id) || null; }

const frac = (x) => {
  const max = Number(x && x.vidaMax) || 1;
  const v = Number(x && x.vida);
  return Math.max(0, Math.min(1, (Number.isFinite(v) ? v : max) / max));
};
const primeiro = (a) => (a && a.length ? a[0] : null);
const maisPor = (a, f) => {
  if (!a || !a.length) return null;
  let melhor = a[0], nota = f(a[0]);
  for (const x of a.slice(1)) { const n = f(x); if (n > nota) { melhor = x; nota = n; } }
  return melhor;
};

/* ---------------- OS ALVOS ----------------
   A catraca do outro lado: todo campo que uma `escolher` lê passa por
   aqui. Um alvo que chega sem `vidaMax` faria `o_ferido` escolher
   sempre o primeiro da lista e ninguém notaria, porque a lista costuma
   começar pelo herói e bater no herói é o comportamento antigo. */
export function garantirAlvo(a) {
  const o = a && typeof a === "object" ? a : {};
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    ref: limpar(o.ref, 12) || "jogador",
    nome: limpar(o.nome, 40),
    vida: num(o.vida, 1),
    vidaMax: Math.max(1, num(o.vidaMax, 1)),
    nivel: num(o.nivel, 1),
    heroi: !!o.heroi,
    conjurador: !!o.conjurador,
    cura: !!o.cura,
    carrega: !!o.carrega,
    bloqueia: !!o.bloqueia,
    meFeriu: !!o.meFeriu,
    perto: o.perto === undefined ? true : !!o.perto,
    i: num(o.i, 0),
  };
}

/* Executa a prioridade. Falha aberta de propósito: quando ninguém serve,
   devolve null e `turnoDosInimigos` segue com a regra que já tinha — a
   intenção não pode ser motivo para um inimigo perder o turno. */
export function escolherAlvo(prioridadeId, alvos) {
  const lista = (Array.isArray(alvos) ? alvos : []).map(garantirAlvo).filter((x) => x.vida > 0);
  if (!lista.length) return null;
  const p = prioridadePorId(prioridadeId);
  if (!p) return null;
  let r = null;
  try { r = p.escolher(lista); } catch { r = null; }
  return r || null;
}

/* ---------------- A MENTE DA CRIATURA ----------------
   A primeira divisão do acervo, e a que mais muda o resultado: quem
   PENSA, quem é BICHO e quem é MORTO. Um lobo não negocia com refém,
   uma carcaça não foge ferida, um salteador faz as duas coisas.

   Ordem importa: o MORTO é testado antes do BICHO porque um "lobo
   esquelético" é morto, não lobo — e o que ele é decide se ele foge.
   Por isso também "besta" cai por último entre as duas: a palavra
   aparece em nome de gente ("Besta do Norte" é um título) mas em
   companhia de osso, casco ou pelo ela é o bicho mesmo. */
const RX_MORTO = /(esquel[ée]t|zumbi|morto[- ]viv|carca[çc]a|espectr|fantasma|alma penada|lich|necro|revenant|gh[ou]l|m[úu]mia|aparic|sombra errante|ossada|caveira|cad[áa]ver|aut[ôo]mat|golem|constructo|estátua viva|boneco)/i;
/* `\b` na frente, plural opcional e nenhuma letra depois: sem isso
   `verme` casava dentro de "Vermelho" e todo dragão vermelho do jogo
   virava bicho — que decide se ele negocia, se foge e em quem bate. */
const RX_BICHO = /\b(lobo|urso|rato|aranha|serpente|cobra|javali|le[ãa]o|tigre|corvo|morcego|inseto|escorpi[ãa]o|verme|slime|gosma|limo|sanguessuga|abelha|vespa|formiga|hiena|chacal|crocodilo|jacar[ée]|tubar[ãa]o|falc[ãa]o|[áa]guia|gafanhoto|centop[ée]ia|besouro|cão|c[ãa]es|matilha|fera|bicho|besta)(?:s|es)?(?![a-zà-ÿ])/i;
const RX_PENSA = /\b(bandido|salteador|guarda|soldado|mercen[áa]rio|cultista|assassino|ladr[ãa]o|feiticeir|mago|bruxo|sacerdote|capit[ãa]o|caçador|arqueir|l[âa]mina|punho|irmandade|ordem|s[íi]ndico|agente|inquisidor|goblin|orc|kobold|gnoll|hobgoblin|ogro|troll|gigante|drag[ãa]o|demônio|diabo|fada|elfo|an[ãa]o)(?:s|es)?(?![a-zà-ÿ])/i;

/* v9.113: O MUNDO TEM A PALAVRA FINAL, e ela vem antes de qualquer
   regex. As listas abaixo são de fantasia medieval e acertam nela; num
   mundo criado pelo léxico elas não têm chance — "larva de fenda" e
   "farrapo de névoa" não casam com nada e caíam todas em "pensa",
   deixando sete intenções sem disparar nunca. */
export function menteDaCriatura(nome, desc = "", lex = null) {
  if (lex) {
    let doMundo = "";
    try { doMundo = menteDoBicho(lex, nome); } catch { doMundo = ""; }
    if (doMundo) return doMundo;
  }
  const txt = String(nome || "") + " " + String(desc || "");
  if (RX_MORTO.test(txt)) return "morto";
  /* o BICHO antes de quem PENSA, e o motivo é o "Rato Gigante": num nome
     de criatura o substantivo é o animal e o resto é tamanho. Testando
     na ordem contrária, todo bicho grande do bestiário virava gente. */
  if (RX_BICHO.test(txt)) return "besta";
  if (RX_PENSA.test(txt)) return "pensa";
  /* o padrão é PENSA, e de propósito: uma criatura desconhecida tratada
     como gente ganha um plano ruim; tratada como bicho, perde a metade
     do acervo. Errar para o lado que ainda produz cena. */
  return "pensa";
}

/* ---------------- A SITUAÇÃO DA LUTA ----------------
   O vocabulário do lugar é o MESMO do Geógrafo, de propósito: `fundo`,
   `apertado`, `alto`, `agua`, `saidas` chegam de lá prontos. Duas
   linguagens para descrever o mesmo chão seria a garantia de que uma
   das duas ia mentir. */
export function garantirLuta(s) {
  const o = s && typeof s === "object" ? s : {};
  const b = (v) => !!v;
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const f01 = (v, d = 1) => Math.max(0, Math.min(1, Number.isFinite(Number(v)) ? Number(v) : d));
  return {
    /* quem eu sou */
    nome: limpar(o.nome, 40),
    ameaca: limpar(o.ameaca, 12) || "comum",
    ehBicho: b(o.ehBicho),          /* animal ou coisa: quer comer, território, ou nada */
    ehMorto: b(o.ehMorto),          /* não teme morrer e não negocia */
    ehTropa: b(o.ehTropa),          /* muitos iguais sob ordem */
    ehChefe: b(o.ehChefe),
    pensa: o.pensa === undefined ? true : b(o.pensa),
    /* como vai a luta */
    rodada: num(o.rodada, 1),
    quantos: num(o.quantos, 1),
    quantosEram: num(o.quantosEram, num(o.quantos, 1)),
    minhaVida: f01(o.minhaVida),
    vidaDosMeus: f01(o.vidaDosMeus),
    faixa: limpar(o.faixa, 12),     /* trivial · facil · medio · dificil · mortal */
    /* o outro lado */
    heroiVida: f01(o.heroiVida),
    heroiCaido: b(o.heroiCaido),
    heroiSozinho: b(o.heroiSozinho),
    quantosDoOutroLado: num(o.quantosDoOutroLado, 1),
    temConjurador: b(o.temConjurador),
    temCurandeiro: b(o.temCurandeiro),
    alguemFerido: b(o.alguemFerido),
    heroiFamoso: b(o.heroiFamoso),
    heroiCarrega: limpar(o.heroiCarrega, 40),
    /* o lugar — mesmas palavras do Geógrafo */
    apertado: b(o.apertado),
    aberto: b(o.aberto),
    fundo: b(o.fundo),
    alto: b(o.alto),
    agua: b(o.agua),
    escuro: b(o.escuro),
    saidas: num(o.saidas, 2),
    publico: b(o.publico),
    emMasmorra: b(o.emMasmorra),
    ondeCai: limpar(o.ondeCai, 40),   /* o poço, a beira, o rio: o que existe para empurrar alguém dentro */
    /* como começou */
    euEmbosquei: b(o.euEmbosquei),
    fuiEmboscado: b(o.fuiEmboscado),
    /* o que há em jogo */
    temRefem: b(o.temRefem),
    temCivil: b(o.temCivil),
    protejoAlgo: limpar(o.protejoAlgo, 40),
    protegidoQuebrou: b(o.protegidoQuebrou),
    querSaber: limpar(o.querSaber, 40),
    /* quem manda */
    temLider: b(o.temLider),
    liderCaiu: b(o.liderCaiu),
    doVilao: b(o.doVilao),
    ordemDoVilao: limpar(o.ordemDoVilao, 60),
  };
}

/* ---------------- AS INTENÇÕES ----------------
   Cada uma diz três coisas e nenhuma a mais: o que a oposição QUER, em
   QUEM ela bate, e em que ponto isso DESMONTA.

   `quer` é a linha que vai à Pauta e o `alvo` é o que muda a mecânica.
   `vira` é a intenção que nasce quando a quebra acontece — e quando é
   null, o acervo é consultado de novo do zero.

   `peso` só desempata: entre duas que servem, ganha a mais específica.
   A REDE — as últimas da lista — existe pelo mesmo motivo que a do
   Intérprete e a do Vilão: uma situação sem leitura nenhuma é um agente
   mudo, e a mudez não avisa. */
export const INTENCOES = [
  /* ---- o bicho, que não faz plano ---- */
  {
    id: "comer", peso: 9, quer: "matar para comer, e leva o primeiro que cair",
    alvo: "o_mais_fraco", quando: (s) => s.ehBicho && !s.protejoAlgo,
    quebra: (s) => s.minhaVida < 0.4, vira: "fugir_ferido",
    porque: "é bicho: não pesa se vale a pena",
  },
  {
    id: "territorio", peso: 10, quer: "expulsar do território, e para de bater em quem recua",
    alvo: "quem_esta_perto", quando: (s) => s.ehBicho && (s.emMasmorra || s.protejoAlgo),
    quebra: (s) => s.minhaVida < 0.35, vira: "fugir_ferido",
    porque: "o lugar é dele antes de ser cena",
  },
  {
    id: "ninhada", peso: 12, quer: "manter todo mundo longe de uma coisa atrás dele",
    alvo: "quem_esta_perto", quando: (s) => s.ehBicho && !!s.protejoAlgo,
    quebra: (s) => s.protegidoQuebrou, vira: "vinganca",
    porque: "há o que defender e ele não sai de perto",
  },
  /* ---- o morto e a coisa, que não temem ---- */
  {
    id: "nao_para", peso: 11, quer: "avançar sem recuar nunca, até desmontar",
    alvo: "quem_estiver", quando: (s) => s.ehMorto,
    quebra: () => false, vira: null,
    porque: "não teme morrer, logo não muda de ideia",
  },
  {
    id: "guardar_o_fundo", peso: 13, quer: "não deixar ninguém passar para o fundo",
    alvo: "quem_bloqueia", quando: (s) => s.ehMorto && (s.fundo || s.emMasmorra),
    quebra: () => false, vira: null,
    porque: "foi posto ali e ali fica",
  },
  /* ---- capturar, que é a intenção mais útil do acervo ---- */
  {
    id: "capturar", peso: 16, quer: "derrubar sem matar e levar vivo",
    alvo: "o_ferido", quando: (s) => s.pensa && !s.ehBicho && !s.ehMorto && (s.heroiFamoso || s.doVilao) && s.quantos >= 2,
    quebra: (s) => s.quantos < Math.ceil(s.quantosEram / 2), vira: "sair_vivo",
    porque: "vale mais vivo, e eles são gente suficiente para carregar",
  },
  {
    id: "capturar_um", peso: 15, quer: "levar UM deles e deixar o resto",
    alvo: "quem_nao_e_o_heroi", quando: (s) => s.pensa && !s.ehBicho && s.doVilao && s.quantosDoOutroLado > 1,
    quebra: (s) => s.minhaVida < 0.4, vira: "sair_vivo",
    porque: "a ordem era trazer alguém, não todos",
  },
  {
    id: "arrancar", peso: 14, quer: "machucar até alguém falar",
    alvo: "o_ferido", quando: (s) => s.pensa && !!s.querSaber,
    quebra: (s) => s.heroiCaido, vira: "sair_vivo",
    porque: "quem eles querem é quem sabe",
  },
  /* ---- o lugar decide a intenção ---- */
  {
    id: "empurrar", peso: 15, quer: "empurrar para a beira e deixar a queda fazer o resto",
    alvo: "quem_esta_perto", quando: (s) => s.pensa && s.alto && !!s.ondeCai,
    quebra: (s) => s.minhaVida < 0.4, vira: "sair_vivo",
    porque: "há de onde cair e isso poupa golpe",
  },
  {
    id: "afogar", peso: 14, quer: "prender debaixo d'água quem já estiver molhado",
    alvo: "o_ferido", quando: (s) => s.pensa && s.agua,
    quebra: (s) => s.minhaVida < 0.4, vira: "sair_vivo",
    porque: "a água mata mais barato que a lâmina",
  },
  {
    id: "separar", peso: 13, quer: "cortar o grupo em dois e cercar a metade menor",
    alvo: "quem_nao_e_o_heroi", quando: (s) => s.pensa && s.aberto && s.quantos > s.quantosDoOutroLado,
    quebra: (s) => s.quantos <= s.quantosDoOutroLado, vira: null,
    porque: "são mais e há espaço para cercar",
  },
  {
    id: "prender_no_corredor", peso: 13, quer: "segurar a passagem e obrigar a lutar um de cada vez",
    alvo: "quem_bloqueia", quando: (s) => s.apertado && s.quantos < s.quantosDoOutroLado,
    quebra: (s) => s.quantos <= 1, vira: "sair_vivo",
    porque: "são menos, e o corredor iguala a conta",
  },
  {
    id: "fechar_a_saida", peso: 14, quer: "tomar a única saída antes de brigar de verdade",
    alvo: "quem_bloqueia", quando: (s) => s.pensa && s.saidas <= 1 && !s.ehBicho,
    quebra: (s) => s.minhaVida < 0.4, vira: "sair_vivo",
    porque: "quem tem a porta decide quando acaba",
  },
  {
    id: "apagar_a_luz", peso: 12, quer: "brigar no escuro, onde eles não enxergam e ele sim",
    alvo: "o_conjurador", quando: (s) => s.pensa && s.escuro,
    quebra: (s) => !s.escuro, vira: null,
    porque: "o escuro é vantagem dele",
  },
  /* ---- desmontar o outro lado ---- */
  {
    id: "calar_a_magia", peso: 17, quer: "derrubar quem conjura antes de qualquer outra coisa",
    alvo: "o_conjurador", quando: (s) => s.pensa && s.temConjurador,
    quebra: (s) => !s.temConjurador, vira: null,
    porque: "sabe o que uma magia faz e não quer descobrir de novo",
  },
  {
    id: "matar_o_remendo", peso: 16, quer: "derrubar quem cura, para o resto não voltar de pé",
    alvo: "o_curandeiro", quando: (s) => s.pensa && s.temCurandeiro && s.rodada >= 2,
    quebra: (s) => !s.temCurandeiro, vira: null,
    porque: "viu alguém ser remendado e aprendeu",
  },
  {
    id: "acabar_o_ferido", peso: 14, quer: "terminar o que já está caindo antes de pegar outro",
    alvo: "o_ferido", quando: (s) => s.alguemFerido && s.rodada >= 2,
    quebra: (s) => !s.alguemFerido, vira: null,
    porque: "um a menos de pé vale mais que dois machucados",
  },
  {
    id: "tirar_a_coisa", peso: 16, quer: "arrancar a coisa das mãos dele e sumir com ela",
    alvo: "quem_carrega", quando: (s) => s.pensa && !!s.heroiCarrega,
    quebra: (s) => s.minhaVida < 0.35, vira: "fugir_ferido",
    porque: "vieram pela coisa, não pela briga",
  },
  {
    id: "humilhar", peso: 12, quer: "vencer na frente de todo mundo, sem pressa",
    alvo: "o_heroi", quando: (s) => s.pensa && s.publico && s.heroiFamoso,
    quebra: (s) => s.minhaVida < 0.5, vira: "sair_vivo",
    porque: "há plateia, e a plateia é metade do motivo",
  },
  {
    id: "provar", peso: 13, quer: "medir-se com o mais forte e ignorar o resto",
    alvo: "o_mais_forte", quando: (s) => s.pensa && (s.ehChefe || s.ameaca === "elite" || s.ameaca === "lendario") && s.quantos === 1,
    quebra: (s) => s.minhaVida < 0.35, vira: "sair_vivo",
    porque: "está sozinho e é bom o bastante para escolher com quem lutar",
  },
  /* ---- atrasar, que quase nunca é combate ---- */
  {
    id: "atrasar", peso: 15, quer: "ganhar tempo, não vencer — alguém atrás precisa desse tempo",
    alvo: "quem_esta_perto", quando: (s) => s.pensa && s.doVilao && s.quantos < s.quantosDoOutroLado,
    quebra: (s) => s.rodada >= 4 || s.quantos <= 1, vira: "sair_vivo",
    porque: "não vieram para ganhar, vieram para segurar",
  },
  {
    id: "atrasar_na_porta", peso: 14, quer: "segurar na entrada até o de dentro terminar o que faz",
    alvo: "quem_bloqueia", quando: (s) => s.emMasmorra && s.doVilao && s.rodada <= 3,
    quebra: (s) => s.rodada > 3, vira: "sair_vivo",
    porque: "há coisa acontecendo lá dentro",
  },
  /* ---- proteger ---- */
  {
    id: "proteger", peso: 15, quer: "não sair de perto da coisa, e bater em quem chegar nela",
    alvo: "quem_bloqueia", quando: (s) => !!s.protejoAlgo && !s.ehBicho,
    quebra: (s) => s.protegidoQuebrou, vira: "vinganca",
    porque: "estar entre eles e aquilo é a ordem",
  },
  {
    id: "usar_o_refem", peso: 18, quer: "manter a faca no refém e falar antes de brigar",
    alvo: "quem_nao_e_o_heroi", quando: (s) => s.pensa && s.temRefem,
    quebra: (s) => s.rodada >= 3, vira: "matar_todos",
    porque: "com refém não se briga, se negocia",
  },
  {
    id: "escudo_humano", peso: 16, quer: "pôr um civil na frente e brigar por trás dele",
    alvo: "quem_esta_longe", quando: (s) => s.pensa && s.temCivil && s.quantos <= 2,
    quebra: (s) => !s.temCivil, vira: "sair_vivo",
    porque: "há gente inocente por perto e ele não tem escrúpulo",
  },
  /* ---- a virada: o que a luta vira quando quebra ---- */
  {
    id: "sair_vivo", peso: 20, quer: "sair inteiro daqui, e briga só com quem impedir",
    alvo: "quem_bloqueia", quando: (s) => s.minhaVida < 0.3 && s.pensa && s.saidas >= 1,
    quebra: (s) => s.saidas < 1, vira: "encurralado",
    porque: "já entendeu que perdeu",
  },
  {
    id: "fugir_ferido", peso: 20, quer: "correr, e só morde quem estiver no caminho",
    alvo: "quem_bloqueia", quando: (s) => s.minhaVida < 0.25 && s.ehBicho,
    quebra: (s) => s.saidas < 1, vira: "encurralado",
    porque: "bicho ferido não termina briga",
  },
  {
    id: "encurralado", peso: 22, quer: "brigar como quem não tem para onde ir",
    alvo: "quem_esta_perto", quando: (s) => s.minhaVida < 0.3 && (s.saidas < 1 || s.fundo),
    quebra: () => false, vira: null,
    porque: "não há saída, e isso muda tudo",
  },
  {
    id: "vinganca", peso: 21, quer: "fazer doer, sem cuidar mais da própria pele",
    alvo: "quem_me_feriu", quando: (s) => s.protegidoQuebrou || (s.liderCaiu && s.temLider && s.minhaVida < 0.6),
    quebra: () => false, vira: null,
    porque: "quebraram o que ele guardava",
  },
  {
    id: "matar_todos", peso: 19, quer: "não deixar ninguém de pé, e começa pelo que cai mais fácil",
    alvo: "o_mais_fraco", quando: (s) => s.pensa && s.temRefem && s.rodada >= 3,
    quebra: () => false, vira: null,
    porque: "a conversa acabou",
  },
  {
    id: "debandar", peso: 19, quer: "cada um por si — a ordem morreu com quem mandava",
    alvo: "quem_estiver", quando: (s) => s.liderCaiu && s.ehTropa,
    quebra: () => false, vira: null,
    porque: "tropa sem chefe é gente com medo",
  },
  {
    id: "vender_caro", peso: 18, quer: "morrer levando alguém junto",
    alvo: "o_ferido", quando: (s) => s.minhaVida < 0.2 && s.quantos === 1 && (s.ehChefe || s.ehMorto),
    quebra: () => false, vira: null,
    porque: "é o último e sabe disso",
  },
  /* ---- a emboscada, dos dois lados ---- */
  {
    id: "cair_em_cima", peso: 17, quer: "aproveitar o susto e derrubar um antes de reagirem",
    alvo: "o_mais_fraco", quando: (s) => s.euEmbosquei && s.rodada <= 2,
    quebra: (s) => s.rodada > 2, vira: null,
    porque: "o primeiro golpe é de graça e só existe uma vez",
  },
  {
    id: "recuperar_o_pe", peso: 14, quer: "reagrupar e parar de apanhar de surpresa",
    alvo: "quem_esta_perto", quando: (s) => s.fuiEmboscado && s.rodada <= 2,
    quebra: (s) => s.rodada > 2, vira: null,
    porque: "foi pego e ainda está atrás na conta",
  },
  /* ---- a ordem de cima ---- */
  {
    id: "cumprir_a_ordem", peso: 17, quer: "fazer o que mandaram, e o resto é problema depois",
    alvo: "o_heroi", quando: (s) => s.doVilao && !!s.ordemDoVilao,
    quebra: (s) => s.minhaVida < 0.3, vira: "sair_vivo",
    porque: "há ordem, e desobedecer custa mais que apanhar",
  },
  /* ---- o herói caído ---- */
  {
    id: "confirmar", peso: 18, quer: "garantir que quem caiu não levante",
    alvo: "o_ferido", quando: (s) => s.heroiCaido && !s.pensa,
    quebra: () => false, vira: null,
    porque: "não sabe fazer diferente",
  },
  {
    id: "deixar_cair", peso: 17, quer: "ignorar quem já caiu e limpar o resto",
    alvo: "quem_nao_e_o_heroi", quando: (s) => s.heroiCaido && s.pensa,
    quebra: (s) => !s.heroiCaido, vira: null,
    porque: "caído não é ameaça e há mais gente de pé",
  },
  /* ---- o estado dos dois lados ---- */
  {
    id: "terminar", peso: 17, quer: "terminar o herói enquanto ele ainda não se recompôs",
    alvo: "o_heroi", quando: (s) => s.heroiVida < 0.3 && !s.heroiCaido,
    quebra: (s) => s.heroiVida >= 0.5, vira: null,
    porque: "ele está por um fio e isso é a luta inteira",
  },
  {
    id: "cercar_o_sozinho", peso: 15, quer: "cercar por todos os lados quem está sem ninguém",
    alvo: "o_heroi", quando: (s) => s.heroiSozinho && s.quantos >= 3 && !s.apertado,
    quebra: (s) => !s.heroiSozinho || s.quantos < 3, vira: null,
    porque: "está sozinho e eles são muitos: cercar é de graça",
  },
  {
    id: "perder_o_animo", peso: 18, quer: "brigar mal, olhando para trás — o bando está se desfazendo",
    alvo: "quem_esta_perto", quando: (s) => s.vidaDosMeus < 0.4 && s.pensa && s.quantos < s.quantosEram,
    quebra: (s) => s.quantos <= 1, vira: "sair_vivo",
    porque: "metade dos companheiros já caiu e isso se vê na cara deles",
  },
  {
    id: "brincar", peso: 13, quer: "brincar com a presa em vez de acabar logo",
    alvo: "quem_nao_e_o_heroi", quando: (s) => s.pensa && (s.faixa === "trivial" || s.faixa === "facil") && s.minhaVida > 0.8,
    quebra: (s) => s.minhaVida < 0.7, vira: null,
    porque: "a briga é fácil demais para ser levada a sério",
  },

  /* ---- a REDE: sem isto o adversário fica mudo na cena mais comum ---- */
  {
    id: "sobrepujar", peso: 5, quer: "usar o número e cercar",
    alvo: "quem_estiver", quando: (s) => s.quantos > s.quantosDoOutroLado,
    quebra: (s) => s.quantos <= s.quantosDoOutroLado, vira: null,
    porque: "são mais",
  },
  {
    id: "aguentar", peso: 5, quer: "aguentar e bater em quem estiver mais perto",
    alvo: "quem_esta_perto", quando: (s) => s.quantos < s.quantosDoOutroLado,
    quebra: (s) => s.minhaVida < 0.3, vira: "sair_vivo",
    porque: "são menos e não têm plano melhor",
  },
  {
    id: "brigar", peso: 3, quer: "brigar até um dos dois lados parar",
    alvo: "quem_estiver", quando: () => true,
    quebra: (s) => s.minhaVida < 0.25, vira: "sair_vivo",
    porque: "é uma briga, e ninguém pensou muito nela",
  },
];

export function intencaoPorId(id) { return INTENCOES.find((i) => i.id === id) || null; }

/* ---------------- A CONSULTA ----------------
   Falha FECHADA: sem situação, sem intenção. Um adversário com intenção
   inventada é pior que um sem nenhuma, porque a Pauta afirma ao Narrador
   uma coisa que o `turnoDosInimigos` não vai cumprir.

   E ela é DETERMINÍSTICA na luta: a mesma situação devolve a mesma
   intenção. Um inimigo que troca de plano a cada render não tem plano —
   e o `escolherAlvo` é chamado dentro do turno de combate, que roda mais
   de uma vez por rodada. */
export function consultarAdversario(situacao) {
  const s = garantirLuta(situacao);
  if (!s.nome) return null;
  let melhor = null;
  for (const i of INTENCOES) {
    let bate = false;
    try { bate = !!i.quando(s); } catch { bate = false; }
    if (!bate) continue;
    if (!melhor || i.peso > melhor.peso) melhor = i;
  }
  return melhor;
}

/* ---------------- A ADERÊNCIA, QUE É O CORAÇÃO ----------------
   `antes` é a intenção que valia na rodada passada, e ela CONTINUA
   valendo enquanto não quebrar — mesmo que outra passe a pontuar mais.

   A primeira versão não tinha isto: derivava do zero a cada chamada. Dá
   na mesma em cena parada e é errado em tudo o mais, por dois motivos.

   Um inimigo que troca de plano sempre que os números oscilam não tem
   plano — é o defeito que este módulo existe para consertar, reaparecendo
   por dentro. E sem memória do que valia antes, a VIRADA não é
   detectável: a intenção nova chega eleita e sem passado, e o Narrador
   nunca é avisado de que alguma coisa mudou.

   Com `antes`, "condição de quebra" volta a querer dizer o que diz: a
   luta vira quando a intenção que estava valendo desmonta, e não quando
   uma conta qualquer muda de sinal. */
export function intencaoDaVez(situacao, { antes = "" } = {}) {
  const s = garantirLuta(situacao);
  const anterior = antes ? intencaoPorId(antes) : null;

  if (anterior) {
    let quebrou = false, aindaVale = false;
    try { quebrou = !!anterior.quebra(s); } catch { quebrou = false; }
    try { aindaVale = !!anterior.quando(s); } catch { aindaVale = false; }
    /* ela segue valendo mesmo sem `quando` bater, desde que não tenha
       quebrado: quem decidiu capturar não desiste porque o alvo mudou
       de posição. Só a quebra desfaz uma intenção. */
    if (!quebrou) return { intencao: anterior, quebrou: false, de: null, aindaVale };
    const virou = anterior.vira ? intencaoPorId(anterior.vira) : null;
    if (virou) return { intencao: virou, quebrou: true, de: anterior.id, aindaVale };
    const outra = melhorSem(s, anterior.id);
    return { intencao: outra || anterior, quebrou: !!outra, de: anterior.id, aindaVale };
  }

  /* primeira leitura desta luta */
  const base = consultarAdversario(s);
  if (!base) return null;
  let quebrouJa = false;
  try { quebrouJa = !!base.quebra(s); } catch { quebrouJa = false; }
  if (!quebrouJa) return { intencao: base, quebrou: false, de: null, aindaVale: true };
  const nova = base.vira ? intencaoPorId(base.vira) : melhorSem(s, base.id);
  return { intencao: nova || base, quebrou: !!nova, de: base.id, aindaVale: true };
}

function melhorSem(s, id) {
  let melhor = null;
  for (const i of INTENCOES) {
    if (i.id === id) continue;
    let bate = false;
    try { bate = !!i.quando(s); } catch { bate = false; }
    if (bate && (!melhor || i.peso > melhor.peso)) melhor = i;
  }
  return melhor;
}

/* ---------------- A SAÍDA MECÂNICA ----------------
   O que `turnoDosInimigos` chama. Devolve o alvo escolhido pela
   prioridade da intenção da vez, ou null para o comportamento de
   sempre. */
export function alvoDoAdversario(situacao, alvos, { antes = "" } = {}) {
  const v = intencaoDaVez(situacao, { antes });
  if (!v || !v.intencao) return null;
  return escolherAlvo(v.intencao.alvo, alvos);
}

/* ---------------- A SAÍDA DE FICÇÃO ----------------
   Uma linha para a Pauta. Diz o QUE e o EM QUEM — nunca o como, nunca a
   fala, nunca o adjetivo. E ela nomeia o alvo quando a prioridade tem
   um: "empurrando para a beira" sem dizer QUEM está sendo empurrado é a
   metade que o Narrador inventaria errado. */
export function linhaDaLuta(situacao, alvos = [], { antes = "" } = {}) {
  const s = garantirLuta(situacao);
  const v = intencaoDaVez(s, { antes });
  if (!v || !v.intencao) return "";
  const alvo = escolherAlvo(v.intencao.alvo, alvos);
  const quem = alvo && alvo.nome ? ` — em ${alvo.nome}` : "";
  const virou = v.quebrou ? " (mudou agora)" : "";
  return `${s.nome}: ${v.intencao.quer}${quem}${virou}`;
}

/* O envelope de CANON, para o Narrador não desfazer o que a mecânica já
   fez. Sai só quando a intenção MUDOU, porque é a mudança que precisa
   aparecer na prosa — repetir a mesma intenção toda rodada é o que
   transforma a Pauta em ruído. */
export function envelopeDaVirada(situacao, { antes = "" } = {}) {
  const s = garantirLuta(situacao);
  const v = intencaoDaVez(s, { antes });
  if (!v || !v.quebrou || !v.intencao) return "";
  const oQueEra = intencaoPorId(v.de);
  return `[A LUTA VIROU] ${s.nome} não quer mais ${oQueEra ? oQueEra.quer.split(",")[0] : "o que queria"} — agora quer ${v.intencao.quer.split(",")[0]}. Mostre a virada acontecendo: alguma coisa nesta rodada fez a oposição mudar de ideia, e o jogador tem de poder ver o quê.`;
}

export const ADVERSARIO_PROMPT = `A OPOSIÇÃO TEM VONTADE (v9.110):
· O sistema decide o que os inimigos QUEREM e EM QUEM eles batem, e manda isso na Pauta. Não é enfeite: a prioridade de alvo da Pauta é a mesma que o sistema usa para rolar os golpes — o que a linha diz é o que de fato acontece.
· Narre a intenção, não o ataque. "Seis goblins atacam" não é cena; "estão te empurrando para a beira do poço" é.
· Se a Pauta disser que a luta VIROU, mostre a virada nesta rodada. Alguma coisa mudou a cabeça deles e o jogador precisa poder ver o quê.
· NUNCA invente uma intenção que a Pauta não deu, e nunca contradiga a que ela deu. Um inimigo que a Pauta manda capturar não mata; um que ela manda fugir não fica.`;
