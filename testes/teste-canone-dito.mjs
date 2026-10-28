/* teste-canone-dito.mjs (Fase T, trilha B · 28/10/2026) — o que só foi dito chega ao Mestre como dito

   O juízo do Cronista (src/motor/cronista.js#julgarCanone) marca `dito` na
   ficha do cânone cujo nome só aparece DENTRO de uma fala — o Berço de que
   o taberneiro fala não é o Berço que o herói viu. A ficha entrava no
   cânone com a marca, e a linha do cânone (src/prompt.js#linhaDoCanone)
   não a escrevia: o Mestre lia, debaixo de «verdade absoluta e imutável»,
   o boato como fato. Esta suíte prova o caminho inteiro — o juízo marca, o
   aceito guarda, a linha escreve, o prompt mostra — e que a ficha sem a
   marca sai byte a byte como saía. E mede o custo: a marca é curta, e no
   cânone das pessoas o teto a paga (cabe menos gente, nunca passa dos
   chars do teto). */
import { MARCA_DO_DITO, formatarCanone, TETO_DO_CANONE, montarSystemPrompt } from "../src/prompt.js";
import { julgarOCronista, O_QUE_O_CRONISTA_PODE } from "../src/motor/cronista.js";
import { oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const NARRATIVA = "O taberneiro baixa a voz: \"Dizem que o Berço de Ossos ainda pulsa sob a colina.\" Na mesa ao lado, a Lâmina de Varek brilha sobre o pano, à vista de todos.";
const PROPOSTA = { canone: {
  "Berço de Ossos": { tipo: "artefato", descricao: "disco de ossos que pulsa", local: "sob a colina" },
  "Lâmina de Varek": { tipo: "artefato", descricao: "a espada sobre a mesa" },
} };

sec("1. o juízo marca, o aceito guarda");
const juizo = julgarOCronista({ personagem: { nome: "Íris" }, npcs: {}, canone: {} }, PROPOSTA, { narrativa: NARRATIVA });
const ac = juizo.aceito.canone || {};
t("o nome só da fala sai marcado `dito` pelo juízo", !!(ac["Berço de Ossos"] && ac["Berço de Ossos"].dito));
t("o nome que a prosa pôs em cena não", !!ac["Lâmina de Varek"] && !ac["Lâmina de Varek"].dito);
/* o aceito do motor, com o estado mínimo e as portas que esta secção lê */
let E = { personagem: { nome: "Íris" }, npcs: {}, canone: {}, dia: 3 };
const aplicar = (efs) => { for (const ef of efs) if (ef.tipo === "canone") E = { ...E, canone: ef.canone }; };
oAceitoDoCronista({ canone: ac }, [], PROPOSTA, {
  ler: () => E, aplicar, pers: E.personagem, narrativa: NARRATIVA,
  mundoDaBase: () => null, registrarLugar: () => null,
});
t("o aceito guarda a marca na ficha do cânone", !!(E.canone["Berço de Ossos"] && E.canone["Berço de Ossos"].dito));

sec("2. a linha escreve a marca, e só onde ela está");
const txt = formatarCanone(E.canone);
const linhaBerco = txt.split("\n").find((l) => l.includes("Berço de Ossos")) || "";
const linhaLamina = txt.split("\n").find((l) => l.includes("Lâmina de Varek")) || "";
t("a linha do dito traz a marca", linhaBerco.includes(MARCA_DO_DITO), linhaBerco);
t("a linha do fato não", !!linhaLamina && !linhaLamina.includes(MARCA_DO_DITO), linhaLamina);
t("a marca diz que não é fato (a palavra que o Mestre lê)", /não fato/.test(MARCA_DO_DITO));
t("e é mais curta que a do Cronista (a linha paga cada caractere)", MARCA_DO_DITO.length < O_QUE_O_CRONISTA_PODE.fatos.marca("").length, `${MARCA_DO_DITO.length} vs ${O_QUE_O_CRONISTA_PODE.fatos.marca("").length}`);
/* a ficha sem `dito` sai como saía, caractere por caractere (a linha antiga, à letra) */
const antiga = (nome, f) => {
  const p = [];
  if (f.tipo) p.push(f.tipo); if (f.papel) p.push(f.papel); if (f.genero) p.push(f.genero);
  if (f.local) p.push(`em ${f.local}`); if (f.status) p.push(f.status);
  return `• ${nome}${p.length ? ` — ${p.join(", ")}` : ""}${f.notas ? `. ${f.notas}` : ""}`;
};
const fatos = {
  "Torre Cega": { tipo: "lugar", local: "Monte Rasa" },
  "Dolmen": { tipo: "pessoa", papel: "capanga", genero: "ele", status: "preso", notas: "deve a Rurik" },
  "Nada": {},
};
t("o cânone sem marca sai byte a byte como antes", formatarCanone(fatos) === Object.entries(fatos).map(([n, f]) => antiga(n, f)).join("\n"));
t("a ficha marcada sem nenhum outro campo ganha o travessão", formatarCanone({ Fiandeira: { dito: "x" } }) === `• Fiandeira — ${MARCA_DO_DITO}`);
t("a marca vem antes das notas", formatarCanone({ Fiandeira: { tipo: "pessoa", dito: "x", notas: "tece de noite" } }) === `• Fiandeira — pessoa, ${MARCA_DO_DITO}. tece de noite`);
t("`dito` vazio não marca", formatarCanone({ Torre: { tipo: "lugar", dito: "" } }) === "• Torre — lugar");

sec("3. o prompt do Mestre mostra a marca");
let prompt = "";
/* a ficha de ab-ator.mjs; o prompt sem cena e sem relevância leva o cânone inteiro */
const PERS = { nome: "Íris", sobrenome: "Vantel", conceito: "caçadora de fendas", historia: "", nivel: 8, raca: "Humano", classe: "Caçadora", atributos: { forca: 1, destreza: 3, vigor: 2, intelecto: 2, presenca: 1, percepcao: 4 }, vidaMax: 61, manaMax: 30 };
let erro = "";
try { prompt = montarSystemPrompt("Teste", { genero: "Fantasia sombria" }, PERS, E.canone, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", { emCidade: true }); } catch (e) { erro = String(e && e.message); }
t("o system prompt leva a linha marcada", prompt.includes(linhaBerco), erro || "a linha não está no prompt");
t("e a do fato sem marca", prompt.split("\n").includes(linhaLamina));

sec("4. o custo: a marca curta, e o teto das pessoas a paga");
const custo = `, ${MARCA_DO_DITO}`.length;
console.log(`     custo por linha marcada: ${custo} chars (${MARCA_DO_DITO.length} da marca + 2 da vírgula)`);
t("a marca custa menos de 30 chars por linha", custo < 30, String(custo));
/* o pior caso das pessoas: o cânone cheio de gente marcada, acima do teto */
const gente = {};
for (let i = 0; i < 40; i++) gente[`Pessoa ${i}`] = { tipo: "pessoa", papel: "mercador de tecidos finos", genero: i % 2 ? "ele" : "ela", local: "Monte Rasa", dito: "x", notas: "viu o herói entrar na cidade" };
const cheio = formatarCanone(gente, { teto: TETO_DO_CANONE });
console.log(`     40 pessoas marcadas com o teto: ${cheio.split("\n").length} linhas, ${cheio.length} chars (teto ${TETO_DO_CANONE.chars})`);
t("com todas marcadas, o cânone das pessoas não passa do teto de chars", cheio.length <= TETO_DO_CANONE.chars, String(cheio.length));
t("e cada linha que sobe leva a marca", cheio.split("\n").every((l) => l.includes(MARCA_DO_DITO)));

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
