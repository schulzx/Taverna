/* Taverna v6.8 — NÊMESIS, FAMA E RUMORES (código, zero tokens).
   - FAMA é derivada das façanhas reais (contadores do app): a IA não pode
     inflar nem esquecer. Patamares mudam como o mundo te trata.
   - NÊMESIS: quando seu nome cresce demais, alguém jura seu fim — gerada por
     tabela, com motivo ligado ao que você REALMENTE fez. O ódio cresce a
     cada dia; nos limiares, ela age (sabotagem, assassinos, difamação…).
   - RUMORES viajam citando feitos verdadeiros dos seus contadores. */

/* v9.54: DOIS DEGRAUS NOVOS NO TOPO. "Lenda Viva" cobria de 70 até o teto de
   100 — quase um terço da escala inteira num rótulo só, e a fama parava de
   dizer alguma coisa exatamente quando o herói passava a merecê-la. Os dois
   últimos são deliberadamente diferentes em NATUREZA, não em grau: virar
   canção é perder o controle da própria história, e virar mito é o mundo
   deixar de acreditar que você é gente. */
export const PATAMARES_FAMA = [
  { min: 0, rotulo: "Desconhecido(a)", nota: "só mais um rosto na estrada" },
  { min: 10, rotulo: "Conhecido(a)", nota: "nas tavernas da região, alguém já ouviu seu nome" },
  { min: 25, rotulo: "Renomado(a)", nota: "comerciantes e guardas te reconhecem; portas se abrem" },
  { min: 45, rotulo: "Famoso(a)", nota: "crianças imitam você; potências te medem com cuidado" },
  { min: 70, rotulo: "Lenda Viva", nota: "seu nome viaja mais rápido que você — e nem sempre conta a verdade" },
  { min: 85, rotulo: "Nome de Canção", nota: "trovadores disputam de quem é a versão certa; nenhuma é a sua, e já não adianta corrigir" },
  { min: 100, rotulo: "Mito em Vida", nota: "há quem duvide que você exista de fato — e quem te encontra fica sem saber o que dizer" },
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

/* ---------------- A NÊMESE MUDOU DE CASA (v9.86) ----------------
   Aqui morava o gerador de nêmese: `gerarNemesis`, `LIMIARES_NEMESIS` e
   `ACOES_NEMESIS` — um motivo sorteado, um título de uma lista de oito, e
   quatro degraus de ódio que disparavam difamação, sabotagem, assassinos e
   confronto.

   A v9.83 substituiu tudo isso pelo VILÃO (vilao.js): seis fases, seis
   arquétipos, um plano de nove passos que cobra alvos reais do jogo, e a
   revelação como marco único da campanha. Desde então nada aqui era
   chamado por ninguém.

   E ficar não era neutro. Dois geradores de antagonista no mesmo
   repositório é uma armadilha para quem for mexer nisso depois: o nome
   `gerarNemesis` é o primeiro que uma busca encontra, e o campo `odio`
   que ele produzia ainda vive em saves antigos, onde `garantirVilao` o
   migra. Quem restaurasse esta função teria dois sistemas escrevendo no
   mesmo lugar do save.

   O que ficou de fato útil deste bloco — a ideia de o antagonista nascer
   de uma dívida concreta com o jogador — está em `ARQUETIPOS` e no
   `nasceDe` de cada um deles.

   Achado pela varredura de regras sem leitor (v9.85). */

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
