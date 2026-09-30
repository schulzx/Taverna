/* registo-simulado.mjs (Fase MM, MM8c-1) — o registo de uma campanha longa

   Não é suíte (não começa por `teste-`): é o mundo de 200 turnos que o
   estudo da MM8 simulou, posto num sítio só para as duas suítes que o
   medem — `teste-mm8c1-tetos.mjs` (os tetos) e `teste-prompt.mjs` (o pior
   caso do prompt) — nunca discordarem sobre o que é "uma campanha longa".

   Sem IA, e tudo por semente. A taxa com que o Narrador e o Cronista
   registam gente NÃO sai de captura nenhuma (não há nenhuma no repositório):
   são três faixas, ditas como suposição, dentro do que o código permite —
   o Cronista traz até 4 pessoas por turno, e o prompt manda não registar
   figurantes de cena única. Ao fim de 200 turnos dão 50, 107 e 168 pessoas.

   O que a simulação tem de verdadeiro é a FORMA: a gente da base entra no
   registo quando é citada (com `local` = a cidade, como o App faz), o
   Narrador acrescenta nomes com notas curtas e às vezes longas, uma parte
   deles vai também para o cânone como "pessoa", o vilão revelado e uma
   relação definida à mão chegam com `Date.now()` — os dois defeitos da
   recência que a MM8c-1 conserta. */
import { gerarGeografia, rngDe } from "../src/geografia.js";
import { oQueExisteAqui } from "../src/mundo-base.js";
import { criarNPC } from "../src/npcs.js";
import { pessoaDiversa } from "../src/nomes.js";

const G = "Fantasia medieval";

export const CENARIOS = [
  { id: "contido", pBase: 0.15, lambda: 0.10, fCanon: 0.3, turnosPorCidade: 20 },
  { id: "medio", pBase: 0.30, lambda: 0.25, fCanon: 0.5, turnosPorCidade: 15 },
  { id: "solto", pBase: 0.40, lambda: 0.50, fCanon: 0.7, turnosPorCidade: 10 },
];

/* um relógio de parede fixo: o valor que `Date.now()` teria dado */
const RELOGIO = 1759100000000;

export function registoSimulado(cenario, { semente = "mm8|mundo|0", turnos = 200 } = {}) {
  const cen = typeof cenario === "string" ? CENARIOS.find((c) => c.id === cenario) : cenario;
  const mapa = gerarGeografia(semente, null, null);
  const cs = mapa.cidades;
  const rnd = rngDe(`${semente}|sim|${cen.id}`);
  const npcs = {}, canone = {};
  const revelados = new Set();
  let ci = 0, contador = 0;
  for (let t = 1; t <= turnos; t++) {
    if (t > 1 && (t - 1) % cen.turnosPorCidade === 0) ci = (ci + 1) % cs.length;
    const cidade = cs[ci];
    contador++;
    const q = oQueExisteAqui(semente, mapa, cidade.nome, null, G);
    if (rnd() < cen.pBase) {
      const livres = q.gente.filter((p) => !revelados.has(p.nome));
      if (livres.length) {
        const p = livres[Math.floor(rnd() * livres.length)];
        revelados.add(p.nome);
        npcs[p.nome] = criarNPC(p.nome, { papel: p.papel, local: cidade.nome, notas: `${p.traco}; quer ${p.vontade}`, ultimaVez: contador, conhecidoEm: 1 + Math.floor(t / 6) });
      }
    }
    let novos = Math.floor(cen.lambda);
    if (rnd() < cen.lambda - novos) novos++;
    for (let j = 0; j < novos; j++) {
      const p = pessoaDiversa(G, rnd);
      const nome = `${p.nome} ${t}-${j}`;
      /* um terço das notas do Narrador é longa: "vínculos, promessas, dívidas, história" */
      const notas = rnd() < 0.33
        ? `${p.traco}; deve dinheiro ao irmão da ferreira, prometeu levar uma carta a ${cs[(ci + 2) % cs.length].nome} e ainda não levou, e desconfia de toda a gente de fora`
        : `${p.traco}; conhece os becos do porto`;
      npcs[nome] = criarNPC(nome, { papel: p.ocupacao, local: cidade.nome, notas, segredo: rnd() < 0.15 ? "vende informação à guarda" : "", ultimaVez: contador, conhecidoEm: 1 + Math.floor(t / 6) });
      if (rnd() < cen.fCanon) canone[nome] = { tipo: "pessoa", papel: p.ocupacao, local: cidade.nome, notas: "descrição curta de uma frase factual, com o que ela é de fato" };
    }
    /* o vilão revelado ao turno 30, e uma relação definida à mão ao 60 —
       os dois com relógio de parede, como o App escreve hoje */
    if (t === 30) npcs["Morvath, o Sem-Rosto"] = criarNPC("Morvath, o Sem-Rosto", { papel: "o vilão", relacao: "inimigo", notas: "O VILÃO desta campanha.", ultimaVez: RELOGIO, conhecidoEm: 5 });
    if (t === 60) npcs["Ilsa Marés"] = { ...criarNPC("Ilsa Marés", { papel: "barqueira", relacao: "amigo", local: cidade.nome, ultimaVez: contador }), ultimaVez: RELOGIO + 1000 };
  }
  return { mapa, cidade: cs[ci], npcs, canone, contador };
}
