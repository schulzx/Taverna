/* ============================================================
   A OUTRA METADE DA BRIGA (v9.74) — quando o mundo ataca primeiro

   A v9.73 deu ao sistema a metade que era dele: o jogador declara o
   primeiro golpe e a luta abre, sem direito de veto de ninguém. Ficou
   dizendo, com todas as letras, que a outra metade continuava sendo da
   IA — e continua, na parte que é dela: **decidir que algo hostil
   aparece é ficção, e ficção é dela.**

   O que NÃO é dela é o que vem depois dessa decisão: quantos são, quão
   fortes são, e se aquilo cabe no herói que está na frente. Hoje ela
   manda `combate_iniciar` com a lista inteira montada por conta própria
   — nome, ameaça e quantidade —, e o sistema só carimba um selo em cima
   ("Encontro mortal") depois do fato consumado. O selo descreve; não
   decide. Um narrador com o dia inspirado põe seis ogros contra um
   herói de nível 2, e o sistema anuncia educadamente que aquilo vai
   matar o jogador.

   ------------------------------------------------------------
   A DIVISÃO QUE ESTE ARQUIVO PROPÕE, e é a mesma da casa inteira:

   ELA DIZ QUE HÁ HOSTILIDADE E DE QUE TIPO. "Três bandidos saltam do
   mato", "um lobo enorme rosna na trilha". Isso é cena, é dela, e o
   sistema não inventa nada disso.

   O SISTEMA DECIDE O ENCONTRO. Pega a criatura que ela nomeou — do
   BESTIÁRIO, nunca de fora dele —, lê quantos ela quis, e então aplica
   a única coisa que ela não tem como saber: o orçamento. Se a conta
   passar do que o herói aguenta, o sistema APARA a quantidade até o
   teto do mortal e diz que aparou. Não é censura à ameaça: mortal
   continua existindo, e é o degrau mais alto que há. É a diferença
   entre "dá para vencer, mas alguém pode não voltar" e "isto não era um
   encontro, era um acidente".

   E se a criatura não estiver no bestiário, o sistema NÃO monta nada.
   Ele não sabe o que é uma "Aberração do Sétimo Selo", não sabe quantos
   PV aquilo tem, e inventar seria pior do que deixar como está.
   ============================================================ */

import { CRIATURAS_FANTASIA, ARQUETIPOS, completarInimigo } from "./bestiario.js";
import { quantosPara, avaliarEncontro, FAIXAS } from "./orcamento.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- ISTO É UMA INVESTIDA? ----------------
   O canal `perigo` já serve às armadilhas e aos elementos (salvaguardas.js).
   Aqui é o outro tipo de perigo: o que tem vontade própria e vem em cima.

   A régua é o VERBO, não o substantivo: "há bandidos na estrada" é
   cenário, "os bandidos saltam do mato" é uma investida. Foi essa
   distinção que faltou em todo detector de narrativa que este projeto já
   escreveu e teve de apagar depois. */
export const RX_INVESTIDA = /\b(salta|saltam|pula|pulam|surge|surgem|irrompe|irrompem|avan[cç]a|avan[cç]am|ataca|atacam|investe|investem|cerca|cercam|emboscad|se atira|se atiram|parte para cima|partem para cima|saca a arma|sacam as armas|puxa a lamina|puxam as laminas|rosna e|rosnam e|se joga sobre|se jogam sobre|bloqueia o caminho|bloqueiam o caminho|fecha o cerco|fecham o cerco)\b/;

/* E o que tem verbo de investida e não é briga nenhuma. */
export const NAO_E_INVESTIDA = [
  {
    id: "lembranca",
    rx: /\b(lembra|lembrou|sonh|imagin|conta que|dizem que|contam que|reza a lenda|ouviu falar|no ano passado|anos atras|h[aá] muito tempo)\b/,
    porque: "a emboscada lembrada, sonhada ou contada por terceiros não está acontecendo agora",
  },
  {
    id: "condicional",
    rx: /\b(se (voc[eê]|alguem)|caso (voc[eê]|alguem)|poderia|pode ser que|talvez|se aproximar|se algu[eé]m)\b/,
    porque: "o aviso de que algo PODERIA atacar é tensão, e virar luta a partir dele rouba a decisão do jogador",
  },
];

export function ehInvestida(texto) {
  const t = norm(texto);
  if (!t.trim()) return false;
  for (const n of NAO_E_INVESTIDA) {
    try { if (n.rx.test(t)) return false; } catch { /* nunca custa o turno */ }
  }
  try { return RX_INVESTIDA.test(t); } catch { return false; }
}

/* ---------------- QUANTOS SÃO ----------------
   O número escrito por extenso é o caso comum na prosa, e "um bando de"
   é o caso que mais aparece. Sem teto aqui: quem apara é o orçamento,
   logo abaixo, e ele apara com a régua do herói e não com um número
   inventado neste arquivo. */
export const NUMEROS = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6,
  sete: 7, oito: 8, nove: 9, dez: 10, "meia duzia": 6, duzia: 12,
};
const RX_MUITOS = /\b(bando|matilha|alcateia|horda|grupo|turma|dezena|varios|varias|muitos|muitas|um punhado)\b/;

export function quantosNaFrase(texto) {
  const t = norm(texto);
  const dig = t.match(/\b(\d{1,2})\s+\w/);
  if (dig) { const n = parseInt(dig[1], 10); if (n >= 1 && n <= 20) return n; }
  /* o número por extenso ANTES do coletivo, mas só quando é maior que um:
     "um bando de goblins" tem a palavra "um" e não é um goblin — é o
     artigo do bando. Ler o "um" primeiro devolvia um goblin solitário
     para uma frase que descreve um cerco. */
  for (const [palavra, n] of Object.entries(NUMEROS)) {
    if (n > 1 && new RegExp(`\\b${palavra}\\b`).test(t)) return n;
  }
  if (RX_MUITOS.test(t)) return 4;
  return 1;
}

/* ---------------- QUAL CRIATURA ----------------
   Só o bestiário. O sistema não sabe quantos PV tem uma "Aberração do
   Sétimo Selo", e inventar um número para ela seria abrir de novo o
   buraco que o orçamento existe para tapar. O nome mais longo ganha,
   pela mesma razão de sempre: "Lobo" e "Lobo Atroz" na mesma frase não
   podem trocar de lugar. */
export function criaturaNaFrase(texto) {
  const t = norm(texto);
  const todas = [...CRIATURAS_FANTASIA, ...ARQUETIPOS];
  const achadas = todas
    .filter((c) => t.includes(norm(c.nome)) || t.includes(norm(c.nome) + "s"))
    .sort((a, b) => b.nome.length - a.nome.length);
  return achadas[0] || null;
}

/* ============================================================
   O ENCONTRO

   `faixaTeto` é o degrau mais alto que o sistema deixa a ficção
   alcançar. "mortal" de propósito: a ameaça continua podendo matar, que
   é o que faz o jogo ter aposta. O que ele impede é o degrau que não
   existe na tabela — o encontro que não é difícil, é aritmeticamente
   impossível.
   ============================================================ */
/* ---------------- O DEGRAU QUE NÃO EXISTE NA TABELA ----------------
   Aparar a QUANTIDADE resolve seis ogros; não resolve UM dragão ancião.
   Um é um, passa por qualquer teto de contagem, e continua sendo a morte
   certa de um herói de nível 2 — que é exatamente o acidente que este
   arquivo existe para impedir.

   Aqui o sistema não tem como consertar: ele não sabe encolher um dragão
   sem inventar um dragão menor, e inventar é o que ele não faz. Então
   ele recusa e devolve a cena com duas saídas — a mesma forma da recusa
   da agressão. "Mortal" continua existindo e é o degrau mais alto da
   tabela; o que não existe é o que está três vezes acima da capacidade
   do grupo, e para isso a tabela não tem nome porque não é encontro. */
export const TETO_DO_DESPROPORCIONAL = 3;

export function montarEmboscada(texto, { pers = null, faixaTeto = "mortal" } = {}) {
  if (!ehInvestida(texto)) return null;
  const base = criaturaNaFrase(texto);
  if (!base) return { tipo: "semCriatura", porque: "a coisa que investiu não está no bestiário, e o sistema não inventa ficha" };
  const pedidos = quantosNaFrase(texto);
  const modelo = completarInimigo({ nome: base.nome, ameaca: base.ameaca }, (pers && pers.nivel) || 1);
  /* UMA só já é desproporcional? Então não há quantidade que salve. */
  const sozinha = avaliarEncontro([modelo], pers);
  if (sozinha && sozinha.razao > TETO_DO_DESPROPORCIONAL) {
    return {
      tipo: "desproporcional", criatura: base.nome, ameaca: base.ameaca,
      razao: sozinha.razao,
      porque: `uma única ${base.nome} já pesa ${sozinha.razao}× a capacidade deste grupo, e não há número menor que um`,
    };
  }
  /* o teto vem do herói que está na frente, e não de um número aqui */
  const teto = Math.max(1, quantosPara(modelo, pers, faixaTeto, { max: 12 }));
  const quantos = Math.max(1, Math.min(pedidos, teto));
  const inimigos = Array.from({ length: quantos }, (_, i) => ({
    nome: quantos > 1 ? `${base.nome} ${i + 1}` : base.nome,
    ameaca: base.ameaca, nivel: modelo.nivel,
  }));
  const aval = avaliarEncontro(inimigos.map((e) => completarInimigo(e, (pers && pers.nivel) || 1)), pers);
  return {
    tipo: "emboscada",
    criatura: base.nome, ameaca: base.ameaca,
    pedidos, quantos, teto, aparado: quantos < pedidos,
    inimigos, faixa: aval ? aval.faixa : null,
    porque: quantos < pedidos
      ? `a cena pediu ${pedidos} e o orçamento deste herói comporta ${quantos}`
      : `a cena pediu ${pedidos} e o orçamento comporta`,
  };
}

/* ============================================================
   O QUE O JOGADOR LÊ E O QUE O MESTRE RECEBE
   ============================================================ */
export function falaDaEmboscada(e) {
  if (!e || e.tipo !== "emboscada") return "";
  return `⚔ ${e.quantos > 1 ? `${e.quantos}× ${e.criatura}` : e.criatura} — o combate está aberto.`;
}

export function envelopeDaEmboscada(e) {
  if (!e || e.tipo !== "emboscada") return "";
  const corte = e.aparado
    ? ` Você descreveu ${e.pedidos}; o sistema pôs ${e.quantos}, porque ${e.pedidos} contra mim não seria um encontro difícil, seria um acidente. Narre o número que o sistema pôs — quem não veio, não veio.`
    : "";
  return `[EMBOSCADA — COMBATE ABERTO PELO SISTEMA] Você narrou uma investida e o sistema montou o encontro: ${e.quantos}× ${e.criatura} (${e.ameaca}). O painel JÁ ESTÁ ABERTO com as fichas prontas.${corte}
REGRA DESTE ENVELOPE (obrigatória): NÃO envie "combate_iniciar" — já está feito, e mandar de novo dobra os inimigos. Narre o instante da investida em uma ou duas frases e me passe a vez: eu ajo pelos botões de combate.
NÃO decida se alguém acertou, NÃO diga quanto doeu, NÃO mate ninguém e NÃO faça eles recuarem ou fugirem por conta própria — quem resolve tudo isso é o dado, e ele ainda não foi rolado.`;
}

/* A criatura fora do bestiário: o sistema não monta, mas também não
   deixa a cena virar uma briga sem números atrás. É o mesmo formato da
   recusa da agressão — uma ordem de duas saídas, não uma sugestão. */
export function envelopeSemCriatura() {
  return `[INVESTIDA SEM FICHA — DECISÃO DO SISTEMA] Você narrou algo hostil vindo para cima de mim, mas não nomeou nenhuma criatura que o sistema conheça, e ele não inventa ficha: não sabe quantos PV aquilo tem nem quanto vale no orçamento do encontro.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, faça UMA das duas coisas e só uma:
1) DECLARE "combate_iniciar" agora, usando um nome de criatura do bestiário desta campanha e uma ameaça compatível com o meu nível.
2) Ou deixe claro que aquilo NÃO me alcança neste turno — ficou à distância, sumiu, era outra coisa — e devolva a palavra para mim.
O que você não pode é seguir narrando a briga sem painel aberto: sem número atrás, eu fico lendo uma luta que não está acontecendo.`;
}

export function envelopeDesproporcional(e) {
  if (!e || e.tipo !== "desproporcional") return "";
  return `[INVESTIDA RECUSADA — DECISÃO DO SISTEMA] Você jogou ${e.criatura} (${e.ameaca}) em cima de mim, e a conta do encontro diz que UMA só já pesa ${e.razao} vezes o que este grupo aguenta. Não há quantidade menor que um: isso não é um encontro difícil, é um acidente. O sistema não abriu combate nenhum.
REGRA DESTE ENVELOPE (obrigatória): na próxima fala, faça UMA das duas coisas e só uma:
1) Mantenha ${e.criatura} na cena, mas LONGE — passando ao longe, do outro lado do vale, farejando e seguindo em frente. Ameaça vista de perto e não enfrentada é das melhores coisas que uma cena tem; o que ela não pode é me alcançar agora.
2) Ou troque por algo do tamanho do que eu sou hoje e DECLARE "combate_iniciar" com isso.
NÃO narre o golpe dela me acertando, NÃO me faça sobreviver por sorte e NÃO invente que ela perdeu o interesse depois de me ferir: nada aconteceu comigo neste turno.`;
}

export function faixaPorId(id) { return FAIXAS.find((f) => f.id === id) || null; }
