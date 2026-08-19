/* ============================================================
   QUEM COMEÇA A BRIGA (v9.73) — o sistema lê o primeiro golpe

   "O mestre chama os combates."

   Hoje quem abre uma luta é a IA, pelo campo `combate_iniciar`. Isso é
   defensável para METADE dos casos — o mundo atacando primeiro é ficção,
   e ficção é dela. A outra metade não: quando o JOGADOR escreve "ataco o
   bandido com a espada", não há nada a decidir. Ele declarou. A luta
   começa, e nenhum narrador devia ter direito de veto sobre isso.

   E tinha. "Ataco o bandido" não casava nada no catálogo de desafios,
   caía como ficção pura, e o que acontecia dependia inteiramente do humor
   da cena que a IA tinha na cabeça: às vezes o painel abria, às vezes o
   golpe virava um empurrão narrado, às vezes o alvo "recuava assustado".
   O jogador aprende rápido que atacar é sugerir.

   ------------------------------------------------------------
   A TRAVA, e ela é a razão de este arquivo ser pequeno:

   O SISTEMA NUNCA INVENTA O ALVO. Ele só abre luta contra quem já EXISTE
   no registro do mundo e está na cena. Sem isso, "ataco o dragão ancião"
   no nível 1 seria um jeito de invocar um dragão digitando — o jogador
   escreveria o inimigo em vez de encontrá-lo, e o orçamento de encontro,
   o bestiário e o mapa deixariam de significar qualquer coisa.

   Quando o alvo não está registrado — a criatura que a IA acabou de
   descrever e o sistema nunca viu —, ele NÃO abre nada e devolve o turno
   com uma ordem em vez de uma sugestão: abra o combate, ou diga que não
   há quem atacar. O que ela não pode mais é narrar a luta se resolvendo
   sozinha.

   E o grupo do herói fica de fora: virar um companheiro em inimigo mexe
   em ficha, vínculo e elenco, e um caminho que faz isso em silêncio, a
   partir de uma frase ambígua, é caro demais para o que ganha.
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- O QUE É DECLARAR UM ATAQUE ----------------
   Verbos de violência com alvo. A lista é de VIOLÊNCIA FÍSICA e nada
   mais: ameaçar é intimidação (já está no catálogo de desafios),
   empurrar é uma disputa, e roubar é prestidigitação. Aqui só entra o
   que abre sangue. */
export const RX_AGRESSAO = /\b(ataco|atacar|golpeio|desfiro|desco a|acerto um|acerto o|acerto a|corto|decepo|esfaqueio|apunhalo|estoco|esfolo|soco|esmurro|chuto|pontape)\b|\b(saco (a|o|minha|meu) \w+ e (ataco|avan[cç]o|corto|golpeio|parto)|parto para cima d|avan[cç]o (sobre|contra|para cima d)|investo contra|me atiro (sobre|contra)|dou (um|uma) (golpe|estocada|talho|pancada|cutilada|joelhada|cabe[cç]ada) (em|n))/;

/* O que TEM cara de ataque e não é. Cada linha aqui é um jeito de o
   sistema abrir uma luta que ninguém pediu — e uma luta aberta por
   engano custa a cena inteira, não uma linha na tela. */
export const NAO_E_AGRESSAO = [
  {
    id: "figura",
    rx: /\b(ataco (o|a) (problema|assunto|quest[aã]o|comida|prato|jantar|almo[cç]o|trabalho|tarefa)|ataco de frente o)\b/,
    porque: "'ataco o problema de frente' é figura de linguagem, e atacar o jantar é fome",
  },
  {
    id: "hipotese",
    rx: /\b(se eu (atacar|atacasse|golpear)|caso eu (ataque|ataqu)|e se eu (atacar|golpear)|penso em atacar|pensei em atacar|estou pensando em|quero saber se)\b/,
    porque: "perguntar o que aconteceria se atacasse não é atacar — e abrir a luta aqui puniria o jogador por pensar alto",
  },
  {
    id: "passado",
    rx: /\b(ataquei|golpeei|acertei|matei|derrubei) \w+ (ontem|antes|no dia|naquele|quando)\b/,
    porque: "contar o que já fez não é fazer de novo",
  },
  {
    id: "treino",
    rx: /\b(treino|pratico|ensaio|exercito)\b[^.!?]{0,30}\b(golpe|estocada|espada|luta|com o boneco|no saco)/,
    porque: "treinar o golpe é rotina de acampamento, não uma briga",
  },
];

export function ehDeclaracaoDeAtaque(texto) {
  const t = norm(texto);
  if (!t.trim()) return false;
  for (const n of NAO_E_AGRESSAO) {
    try { if (n.rx.test(t)) return false; } catch { /* nunca custa o turno */ }
  }
  try { return RX_AGRESSAO.test(t); } catch { return false; }
}

/* ============================================================
   O PESO DE QUEM VOCÊ ATACOU

   O registro de pessoas guarda nome, papel e relação — nunca guardou
   nível nem ameaça, porque um NPC não é um inimigo até virar um. Então
   a ameaça sai do PAPEL, que é a única coisa que o mundo já afirmou
   sobre aquela pessoa.

   É uma régua grosseira e ela é honesta: quem vive de armas devolve o
   golpe melhor que quem vive de vender cerveja. O que ela NÃO faz é
   deixar o jogador escolher a força do inimigo — a escolha é dele sobre
   em QUEM bater, e o preço vem do mundo.

   SEM `\b` NO FIM, e isto já custou caro quatro vezes neste projeto: são
   RADICAIS. `capit[aã]\b` não casa "capitão" (o `o` seguinte é letra e a
   fronteira falha), `taverneir\b` não casa "taverneiro", e o efeito não é
   um erro visível — é o degrau errado sendo escolhido em silêncio. Na
   primeira rodada desta suíte, o capitão da guarda virou "comum" e o
   taverneiro também, que é exatamente a tabela deixando de existir.
   ============================================================ */
export const PESO_DO_PAPEL = [
  {
    id: "guerra", ameaca: "competente",
    rx: /\b(capit[aã]|comandante|general|cavaleir|sargent|mercenari|guarda-cost|campe[aã]o|gladiador|ca[cç]ador de recompensa|assassin|matador)/,
    porque: "quem vive de matar não morre porque um estranho sacou uma espada",
  },
  {
    id: "armas", ameaca: "comum",
    rx: /\b(guarda|soldad|milicia|sentinela|arqueir|batedor|patrulh|xerife|carcereir|vigia)/,
    porque: "treinado e armado, mas é gente de turno, não de lenda",
  },
  {
    id: "poder", ameaca: "competente",
    rx: /\b(mago|maga|feiticeir|bruxo|bruxa|arquimag|conjurad|necromant|sacerdote de|sumo )/,
    porque: "quem conjura é perigoso na proporção do que sabe, e nunca é presa fácil",
  },
  {
    id: "mando", ameaca: "elite",
    rx: /\b(lorde|lady|bar[aã]o|baronesa|duque|duquesa|conde|condessa|rei|rainha|princip|princesa|governador|senhor de|chefe d|patriarc|matriarc)/,
    porque: "quem manda anda acompanhado, e o que responde ao golpe raramente é a própria pessoa",
  },
  {
    id: "braco", ameaca: "comum",
    rx: /\b(ferreir|a[cç]ougueir|lenhador|minerador|estivador|pedreir|forjador|curtidor|carrocei|barqueir)/,
    porque: "não é treinado, mas passa o dia levantando o que você não levanta",
  },
  {
    id: "gente", ameaca: "fraco",
    rx: /\b(taverneir|estalajadeir|mercador|comerciante|escriba|erudito|bibliotec|curandeir|herborist|alquimist|camponê|campones|servo|serva|crian[cç]a|mendig|bardo|cozinheir|joalheir|cartograf)/,
    porque: "gente que não se defende de ofício, e o sistema não vai fingir que se defende",
  },
];

export function ameacaDoPapel(papel) {
  const p = norm(papel);
  if (!p.trim()) return { ameaca: "comum", id: "semPapel", porque: "sem papel no registro, o mundo trata como gente comum armada do que tiver à mão" };
  for (const x of PESO_DO_PAPEL) {
    try { if (x.rx.test(p)) return { ameaca: x.ameaca, id: x.id, porque: x.porque }; } catch { /* nada */ }
  }
  return { ameaca: "comum", id: "semPapel", porque: "papel que a tabela não conhece: o mundo trata como gente comum" };
}

/* ============================================================
   QUEM ESTÁ SENDO ATACADO

   O nome citado tem de estar no elenco DA CENA. O nome mais longo
   ganha, que é a mesma regra dos lugares, das habilidades e das
   pessoas: "Bram" e "Bram, o Torto" na mesma sala não podem trocar de
   lugar.

   E se ninguém foi citado, o sistema NÃO escolhe por eliminação, nem
   quando há uma pessoa só na cena. Aqui isso seria diferente de tudo o
   mais: escolher errado num teste social custa uma linha, escolher
   errado aqui abre uma luta contra alguém que o jogador não quis tocar.
   ============================================================ */
export function alvoDaAgressao(texto, { presentes = [], grupo = [] } = {}) {
  const t = norm(texto);
  if (!t.trim()) return null;
  const doGrupo = new Set((grupo || []).map((g) => norm(g && g.nome)).filter(Boolean));
  const citados = (presentes || [])
    .filter((n) => n && n.nome && String(n.nome).length >= 3)
    .filter((n) => t.includes(norm(n.nome)))
    .sort((a, b) => String(b.nome).length - String(a.nome).length);
  if (!citados.length) return null;
  const alvo = citados[0];
  /* o companheiro fica de fora: virar aliado em inimigo mexe em ficha,
     vínculo e elenco, e fazer isso em silêncio a partir de uma frase
     ambígua custa mais do que ganha */
  if (doGrupo.has(norm(alvo.nome))) return { nome: alvo.nome, doGrupo: true };
  return { nome: alvo.nome, papel: alvo.papel || "", relacao: alvo.relacao, doGrupo: false };
}

/* ============================================================
   O VEREDICTO
   ============================================================ */
export function lerAgressao(texto, { presentes = [], grupo = [], emCombate = false } = {}) {
  if (emCombate) return null;                       // dentro da luta quem age é o painel
  if (!ehDeclaracaoDeAtaque(texto)) return null;
  const alvo = alvoDaAgressao(texto, { presentes, grupo });
  if (!alvo) {
    return {
      tipo: "semAlvoConhecido",
      porque: "eu declarei um ataque e o sistema não tem, no registro deste lugar, ninguém com esse nome",
    };
  }
  if (alvo.doGrupo) {
    return { tipo: "companheiro", nome: alvo.nome, porque: "quem viaja comigo não vira inimigo por uma frase" };
  }
  const peso = ameacaDoPapel(alvo.papel);
  return {
    tipo: "agressao",
    nome: alvo.nome, papel: alvo.papel || "",
    ameaca: peso.ameaca, porqueDoPeso: peso.porque,
    porque: "eu declarei o primeiro golpe contra alguém que está aqui",
  };
}

/* ============================================================
   O QUE O JOGADOR LÊ E O QUE O MESTRE RECEBE
   ============================================================ */
export function falaDaAgressao(a) {
  if (!a || a.tipo !== "agressao") return "";
  return `⚔ Você parte para cima de ${a.nome} — o combate está aberto.`;
}

export function falaDoCompanheiro(a) {
  if (!a || a.tipo !== "companheiro") return "";
  return `✋ ${a.nome} viaja com você. Se é para romper com quem está do seu lado, diga com todas as letras o que quer fazer — o sistema não abre essa luta por engano.`;
}

export function envelopeDaAgressao(a) {
  if (!a || a.tipo !== "agressao") return "";
  return `[COMBATE ABERTO PELO SISTEMA] Eu declarei o primeiro golpe contra ${a.nome}${a.papel ? ` (${a.papel})` : ""} e o painel de combate JÁ ESTÁ ABERTO, com a ficha do alvo montada pelo sistema.
REGRA DESTE ENVELOPE (obrigatória): NÃO envie "combate_iniciar" — já está feito, e mandar de novo cria um segundo inimigo. Narre o instante da investida em uma ou duas frases — o aço saindo da bainha, a cara de quem entendeu tarde demais, quem se levanta em volta — e me passe a vez: eu ajo pelos botões de combate.
NÃO decida se o golpe acertou, NÃO diga quanto doeu e NÃO faça ${a.nome} recuar, fugir, se render ou "desviar por pouco": o dado resolve isso e ainda não foi rolado. E não desfaça o que eu fiz — não há versão desta cena em que eu não ataquei.`;
}

export function envelopeSemAlvo(a, oQueEuDisse = "") {
  if (!a || a.tipo !== "semAlvoConhecido") return "";
  return `[ATAQUE DECLARADO — SEM ALVO NO REGISTRO] Eu disse: "${String(oQueEuDisse).slice(0, 160)}". Isso é uma declaração de violência, e não uma pergunta. O sistema não abriu o combate porque não tem, no registro deste lugar, ninguém com o nome que eu citei — quem está aí pode ser uma criatura que só você descreveu.
REGRA DESTE ENVELOPE (obrigatória): decida UMA das duas coisas, e só uma:
1) HÁ alvo aqui — então DECLARE "combate_iniciar" com ele agora, nesta mesma resposta, e narre só a investida. Não resolva a luta.
2) NÃO há alvo aqui — então diga isso na ficção, curto ("não há ninguém para atacar"), e devolva a palavra para mim.
O que você NÃO pode fazer é narrar a briga acontecendo sem abrir o combate: sem o painel aberto, nada do que você contar tem número atrás, e eu fico lendo uma luta que não está acontecendo.`;
}
