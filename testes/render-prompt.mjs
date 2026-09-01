/* Renderiza o system prompt de um heroi tipico e mede as secoes. */
import { montarSystemPrompt } from "../src/prompt.js";
import fs from "node:fs";

const pers = {
  nome: "Brann", conceito: "druida do vale", historia: "", nivel: 8,
  raca: "Humano", classe: "Druida", subclasse: "Metamorfo", profissao: "Ferreiro",
  antecedente: "Órfão da Estrada", antecedenteGancho: "Busca pistas da família que perdeu.",
  atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 },
  vidaMax: 61, manaMax: 48, efeitos: [], condicoes: [],
};
const s = montarSystemPrompt(
  "Prova de Forma", { genero: "Fantasia medieval", descricao: "" }, pers, "",
  {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal"
);
fs.writeFileSync("prompt-atual.txt", s);
console.log(`system prompt (sem cânone/mapa/npcs/quests): ${s.length} caracteres · ~${Math.round(s.length / 3.6)} tokens`);
console.log(`linhas: ${s.split("\n").length}`);
