/* Taverna v6.8 — NÊMESIS, FAMA E RUMORES (código, zero tokens).
   - FAMA é derivada das façanhas reais (contadores do app): a IA não pode
     inflar nem esquecer. Patamares mudam como o mundo te trata.
   - NÊMESIS: quando seu nome cresce demais, alguém jura seu fim — gerada por
     tabela, com motivo ligado ao que você REALMENTE fez. O ódio cresce a
     cada dia; nos limiares, ela age (sabotagem, assassinos, difamação…).
   - RUMORES viajam citando feitos verdadeiros dos seus contadores. */

export const PATAMARES_FAMA = [
  { min: 0, rotulo: "Desconhecido(a)", nota: "só mais um rosto na estrada" },
  { min: 10, rotulo: "Conhecido(a)", nota: "nas tavernas da região, alguém já ouviu seu nome" },
  { min: 25, rotulo: "Renomado(a)", nota: "comerciantes e guardas te reconhecem; portas se abrem" },
  { min: 45, rotulo: "Famoso(a)", nota: "crianças imitam você; potências te medem com cuidado" },
  { min: 70, rotulo: "Lenda Viva", nota: "seu nome viaja mais rápido que você — e nem sempre conta a verdade" },
];
export const patamarFama = (fama) => [...PATAMARES_FAMA].reverse().find((p) => fama >= p.min) || PATAMARES_FAMA[0];

/* Fama derivada das façanhas: combates, masmorras, decretos, domínios, nível… */
export function calcularFama(cont, nivel, dominios) {
  return Math.min(100,
    (cont.combatesVencidos || 0) * 2 +
    (cont.elitesDerrotados || 0) * 3 +
    (cont.lendariosDerrotados || 0) * 8 +
    (cont.masmorrasConcluidas || 0) * 6 +
    (cont.contratosConcluidos || 0) * 2 +
    (cont.decretosCumpridos || 0) * 4 +
    (cont.eventosReino || 0) +
    (dominios || 0) * 8 +
    (nivel || 1) * 1.5
  );
}

/* ---------------- NÊMESIS ---------------- */
const MOTIVOS = [
  { id: "sangue", motivo: "você matou alguém que ela amava", so: (c) => (c.inimigosDerrotados || 0) > 0 },
  { id: "trono", motivo: "você tomou terras que ela considerava suas por direito", so: (c, st) => (st.dominios || 0) > 0 },
  { id: "culto", motivo: "você frustrou os planos do culto ao qual ela serve", so: () => true },
  { id: "humilhacao", motivo: "você a humilhou publicamente — e o mundo inteiro ficou sabendo", so: (c) => (c.combatesVencidos || 0) >= 3 },
  { id: "inveja", motivo: "ela faria tudo que você fez — se tivesse tido a chance. Agora quer provar ser melhor", so: () => true },
  { id: "profecia", motivo: "uma profecia diz que você é o fim de tudo que ela construiu", so: () => true },
];
const TITULOS_NEM = ["a Lâmina Silenciosa", "o Corvo Negro", "a Víbora Coroada", "o Sem-Rosto", "a Mão Vazia", "o Lamento", "a Herdeira Amarga", "o Penitente de Ferro"];

export function gerarNemesis(nomePessoaFn, cont, stats, dia) {
  const pool = MOTIVOS.filter((m) => m.so(cont, stats));
  const m = pool[Math.floor(Math.random() * pool.length)];
  return {
    nome: nomePessoaFn(),
    titulo: TITULOS_NEM[Math.floor(Math.random() * TITULOS_NEM.length)],
    motivo: m.motivo,
    odio: 15,
    status: "espreita", // espreita → ativa → derrotada
    origemDia: dia,
    ultimoLimiar: 0,
  };
}

/* O ódio cresce por dia; limiares disparam ações por tabela. */
export const LIMIARES_NEMESIS = [30, 55, 80, 100];
export const ACOES_NEMESIS = {
  30: { tipo: "difamacao", rotulo: "Difamação", txt: (n) => `${n.nome} espalha mentiras sobre você nas estradas — sua reputação é o alvo.` },
  55: { tipo: "sabotagem", rotulo: "Sabotagem", txt: (n) => `Agentes de ${n.nome} sabotam seus negócios: caravanas roubadas, depósitos queimados (o cofre sentiu).` },
  80: { tipo: "assassinos", rotulo: "Assassinos enviados", txt: (n) => `${n.nome} parou de brincar: assassinos pagos estão a caminho, e eles conhecem seus hábitos.` },
  100: { tipo: "confronto", rotulo: "O confronto final", txt: (n) => `${n.nome} deixou de se esconder. Ela quer você — frente a frente, diante de testemunhas. Isso só termina de um jeito.` },
};

/* ---------------- RUMORES ----------------
   Mistura boatos do mundo com boatos sobre VOCÊ — estes últimos citando
   feitos verdadeiros dos contadores (nada inventado). */
const RUMORES_MUNDO = [
  "dizem que uma caravana sumiu inteira na estrada do norte — nem os corvos acharam",
  "um poço de uma vila vizinha amanheceu com água vermelha; ninguém bebe dela há três dias",
  "há um eremita nas colinas que compra ossos. Ninguém sabe para quê, e ninguém pergunta",
  "ouvi que o inverno deste ano virá cedo e cruel — os pássaros já partiram",
  "um mercador jura ter visto luzes andando sozinhas no pântano, em fila, como uma procissão",
  "dizem que o preço do ferro vai dobrar — alguma guerra está sendo armada em silêncio",
  "há um círculo de pedras numa clareira onde nenhum animal entra. Nem os cães dos caçadores",
  "falaram que um navio chegou ao porto sem tripulação. A carga estava intacta",
];

export function rumorSobreJogador(cont, nome, patamar) {
  const feitos = [];
  if ((cont.masmorrasConcluidas || 0) > 0) feitos.push(`dizem que ${nome} desceu em ${cont.masmorrasConcluidas > 1 ? `${cont.masmorrasConcluidas} masmorras` : "uma masmorra"} e voltou para contar — ninguém volta de lá`);
  if ((cont.lendariosDerrotados || 0) > 0) feitos.push(`juram que ${nome} derrubou uma criatura lendária a sangue frio`);
  if ((cont.decretosCumpridos || 0) > 0) feitos.push(`comentam que ${nome} nem sai mais de casa — paga ouro e os problemas morrem sozinhos`);
  if ((cont.contratosConcluidos || 0) >= 5) feitos.push(`dizem que ${nome} nunca deixou um contrato sem cumprir — nem um`);
  if ((cont.cicatrizes || 0) >= 3) feitos.push(`viram as cicatrizes de ${nome} na taverna. Cada uma deve ter uma história que ninguém pediu para ouvir`);
  if ((cont.quaseMorte || 0) >= 2) feitos.push(`cochicham que ${nome} já morreu ${cont.quaseMorte} vezes — a morte é que não quis ficar com ele`);
  if (patamar.min >= 45) feitos.push(`em duas cidades já chamam ${nome} de ${patamar.rotulo.toLowerCase()} sem ninguém corrigir`);
  if (!feitos.length) return null;
  return feitos[Math.floor(Math.random() * feitos.length)];
}

export function rumorDoDia(cont, nome, patamar, temNemesis) {
  const r = Math.random();
  if (temNemesis && r < 0.2) return "dizem que alguém poderoso anda fazendo perguntas sobre você — e pagando bem pelas respostas";
  if (r < 0.45) {
    const s = rumorSobreJogador(cont, nome, patamar);
    if (s) return s;
  }
  return RUMORES_MUNDO[Math.floor(Math.random() * RUMORES_MUNDO.length)];
}
