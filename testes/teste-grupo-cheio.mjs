/* teste-grupo-cheio.mjs (Fase T1-A, 3.ª fatia, 28/10/2026) — a frase do grupo cheio

   Na 2.ª fatia o Cronista passou a entrar só pelo juízo (`julgarOCronista`),
   e a frase "O grupo está cheio — X não pôde se juntar." sumiu da tela sem
   ninguém notar: com o grupo cheio, a porta do convite recusa todos, e o
   juízo diz `semPorta` (ou `desconhecido`) antes de chegar a `cheio`. Foi
   reposta no fim da fatia, sem suíte que a guardasse. Esta é a suíte.

   A prova joga o juízo de verdade (o recusado que ele devolve) e a régua da
   frase (`frasesDoGrupoCheio`, src/motor/meio-do-turno.js):
   1. grupo cheio, a porta fechada: a frase sai, para o conhecido e para o
      desconhecido;
   2. com vaga, um `semPorta` NÃO é "cheio" — cala;
   3. quem já anda com o herói, ou é o herói, não ouve "cheio";
   4. a última vaga: entra o primeiro, o segundo ouve "cheio";
   5. o invocado não ocupa vaga;
   6. a fiação no App. */
import { julgarOCronista } from "../src/motor/cronista.js";
import { frasesDoGrupoCheio } from "../src/motor/meio-do-turno.js";
import { MAX_COMPANHEIROS } from "../src/constantes.js";
import fs from "node:fs";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const comp = (nome, x = {}) => ({ nome, vida: 10, vidaMax: 10, ...x });
const cheio = Array.from({ length: MAX_COMPANHEIROS }, (_, i) => comp(["Freya", "Rurik", "Ubba", "Marta", "Lia", "Bram"][i]));
const npcs = { Hilda: { nome: "Hilda" }, Tobias: { nome: "Tobias" }, Oswin: { nome: "Oswin" } };
/* o turno do Cronista como o App o monta: a porta é quem o convite aceitaria */
const frases = (grupo, entraram, aceitariam = []) => {
  const j = julgarOCronista({ personagem: { nome: "Vera", grupo }, npcs }, { grupo: { entraram } }, { aceitariam });
  return { j, linhas: frasesDoGrupoCheio(j.recusado, grupo) };
};

sec("1. grupo cheio, a porta fechada: a frase sai");
{
  const { j, linhas } = frases(cheio, ["Hilda", "Desconhecido Total"]);
  t("o juízo recusa sem dizer `cheio` (é a porta que fecha antes)", j.recusado.every((x) => x.porque !== "cheio") && j.recusado.length === 2, JSON.stringify(j.recusado));
  t("e o jogador ouve que o grupo está cheio, pelos dois", linhas.length === 2 && linhas[0] === "O grupo está cheio — Hilda não pôde se juntar." && /Desconhecido Total/.test(linhas[1]), JSON.stringify(linhas));
}

sec("2. com vaga, a porta fechada não é grupo cheio");
{
  const { j, linhas } = frases(cheio.slice(0, 2), ["Hilda", "Ninguém Daqui"]);
  t("o juízo recusa (semPorta, desconhecido)", j.recusado.map((x) => x.porque).join(",") === "semPorta,desconhecido", JSON.stringify(j.recusado));
  t("e nenhuma frase de grupo cheio", linhas.length === 0);
}

sec("3. quem já anda com o herói, ou é o herói, não ouve 'cheio'");
{
  const { linhas } = frases(cheio, [cheio[0].nome, "Vera"]);
  t("já no grupo e o próprio herói calam", linhas.length === 0);
}

sec("4. a última vaga");
{
  const tres = cheio.slice(0, MAX_COMPANHEIROS - 1);
  const { j, linhas } = frases(tres, ["Hilda", "Tobias"], ["Hilda", "Tobias"]);
  t("entra o primeiro", j.aceito.grupo && j.aceito.grupo.entraram.join(",") === "Hilda");
  t("e o segundo ouve que o grupo está cheio", linhas.length === 1 && /Tobias não pôde se juntar/.test(linhas[0]), JSON.stringify(linhas));
}

sec("5. o invocado não ocupa vaga");
{
  const comInvocado = [...cheio.slice(0, MAX_COMPANHEIROS - 1), comp("Lobo Espiritual", { invocada: true })];
  const { linhas } = frases(comInvocado, ["Hilda"]);
  t("com um de carne a menos, a porta fechada não é 'cheio'", linhas.length === 0);
  t("lixo não estoura e não fala", frasesDoGrupoCheio(null, null).length === 0 && frasesDoGrupoCheio([null, { secao: "grupo" }], cheio).length === 0);
}

sec("6. a fiação no App");
{
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o Cronista do App diz as frases da régua, a partir do recusado do juízo", /msgs\.push\(\.\.\.frasesDoGrupoCheio\(recusadoDoCronista, p\.grupo\)\);/.test(APP));
  t("e já não guarda uma cópia da régua", !/const cheioAgora = \(p\.grupo/.test(APP));
}

console.log(`\ngrupo cheio: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
