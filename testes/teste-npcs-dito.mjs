/* teste-npcs-dito.mjs (Fase T, trilha B · 28/10/2026) — o que só foi dito, na gente

   O juízo do Cronista (src/motor/cronista.js#julgarGente) marca `dito` na
   pessoa que só aparece dentro da fala de alguém — a Clarissa do Posto
   Velho de que o taberneiro fala. O cânone já escrevia a marca (0816cbf,
   teste-canone-dito); a gente não: src/npcs.js#criarNPC jogava o campo fora,
   e a linha das PESSOAS CONHECIDAS (resumoNPCsParaPrompt) não o diria. Pior:
   o cânone que a tinha calava-se quando a linha das PESSOAS já dizia o resto
   (prompt.js#jaFoiDita, MM8d), e a marca sumia pelos dois lados.

   Esta suíte prova o caminho — o juízo marca, o registo guarda, a linha
   escreve —, o ciclo da marca (fica enquanto só se ouve, cai quando a
   pessoa chega sem ela, nunca sobe em quem já é fato), que a ficha sem a
   marca sai byte a byte igual, que um save com o campo não quebra a versão
   antiga do jogo, e o custo no pior caso. */
import { MARCA_DO_DITO, criarNPC, mesclarNPC, resumoNPCsParaPrompt, TETO_DAS_PESSOAS, ordemDaImportancia, normalizarRecencia, nomeComDono } from "../src/npcs.js";
import { formatarCanone, linhasJaDitas } from "../src/prompt.js";
import { julgarOCronista, O_QUE_O_CRONISTA_PODE } from "../src/motor/cronista.js";
import { oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  const v = typeof cond === "function" ? (() => { try { return !!cond(); } catch { return false; } })() : !!cond;
  if (v) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const Js = JSON.stringify;

const NARRATIVA = "O taberneiro baixa a voz: \"A Clarissa do Posto Velho sabe o caminho, mas ninguém a vê há semanas.\" Junto ao balcão, Bento enxuga as canecas e não diz nada.";
const PROPOSTA = { pessoas: [
  { nome: "Clarissa do Posto Velho", papel: "guia", genero: "ela" },
  { nome: "Bento", papel: "taberneiro", genero: "ele" },
] };

sec("1. o juízo marca, o registo guarda");
const juizo = julgarOCronista({ personagem: { nome: "Íris" }, npcs: {}, canone: {} }, PROPOSTA, { narrativa: NARRATIVA });
const pes = juizo.aceito.pessoas || [];
const clar = pes.find((p) => p.nome === "Clarissa do Posto Velho");
const bento = pes.find((p) => p.nome === "Bento");
t("a pessoa só da fala sai marcada pelo juízo", !!(clar && clar.dito), Js(pes));
t("a que a prosa pôs em cena não", !!bento && !bento.dito);
/* o aceito do motor, com o estado mínimo e as portas que a secção da gente lê */
let E = { personagem: { nome: "Íris" }, npcs: {}, canone: {}, dia: 3, npcTurno: 5, cidadeAtual: "Brejo Alto" };
const aplicar = (efs) => { for (const ef of efs) if (ef.tipo === "npcs") E = { ...E, npcs: ef.npcs }; };
oAceitoDoCronista({ pessoas: pes }, [], PROPOSTA, {
  ler: () => E, aplicar, pers: E.personagem, narrativa: NARRATIVA,
  mundoDaBase: () => null, registrarLugar: () => null, contextoDoNome: () => ({}),
});
const fichaC = E.npcs["Clarissa do Posto Velho"], fichaB = E.npcs.Bento;
/* FALHA NO HEAD DE ANTES: criarNPC montava a ficha campo a campo e o `dito` não era campo */
t("o registo guarda a marca na ficha de quem só foi dito", !!(fichaC && fichaC.dito), Js(fichaC));
t("e a ficha de quem está em cena não tem a chave", !!fichaB && !("dito" in fichaB), Js(fichaB));
/* FALHA NO HEAD DE ANTES: o juízo tirava-lhe o "aqui" (a cidade do herói,
   dita só numa fala), e fichaDoCronista carimbava-lho de volta — "em Brejo
   Alto", o PROCURA/ESTÁ AQUI da 11.ª pela outra porta */
t("quem só foi dito não ganha a cidade do herói como paradeiro", !!fichaC && fichaC.local !== "Brejo Alto", Js(fichaC && fichaC.local));
t("e quem está em cena ganha-a, como sempre", !!fichaB && fichaB.local === "Brejo Alto", Js(fichaB && fichaB.local));

sec("2. a linha das PESSOAS CONHECIDAS escreve a marca, e só onde ela está");
const txt = resumoNPCsParaPrompt(E.npcs);
const lC = txt.split("\n").find((l) => l.includes("Clarissa")) || "";
const lB = txt.split("\n").find((l) => l.includes("Bento")) || "";
t("a linha de quem só foi dito traz a marca", lC.includes(MARCA_DO_DITO), lC);
t("a de quem está em cena não", !!lB && !lB.includes(MARCA_DO_DITO), lB);
t("a marca é a do cânone (uma tabela só)", formatarCanone({ X: { dito: "y" } }) === `• X — ${MARCA_DO_DITO}`);
/* a ficha sem marca, byte a byte: a linha de antes desta etapa, gravada do HEAD f0dda9e */
const SEM = { Lia: criarNPC("Lia", { papel: "ferreira", genero: "mulher", local: "a forja", ultimaVez: 4, conhecidoEm: 1 }) };
t("a ficha sem marca sai byte a byte como saía", resumoNPCsParaPrompt(SEM) === "• Lia (ferreira, mulher, em a forja, entrou na história no DIA 1)", resumoNPCsParaPrompt(SEM));
t("e o objeto da ficha também (nenhuma chave nova)", Js(Object.keys(SEM.Lia)) === Js(["conhecidoEm", "nome", "papel", "relacao", "genero", "local", "status", "segredo", "notas", "laco", "entre", "consultas", "ultimaVez", "semente"]), Js(Object.keys(SEM.Lia)));
t("`dito` vazio, lixo ou não-texto não marca", ["", "   ", null, 0, true, {}, []].every((d) => !("dito" in criarNPC("Z", { dito: d }))));

sec("3. o ciclo da marca");
const so = criarNPC("Clarissa", { papel: "guia", dito: O_QUE_O_CRONISTA_PODE.fatos.marca("") });
t("fica enquanto a pessoa só se ouve (chega de novo com a marca)", !!mesclarNPC(so, { local: "o posto", dito: O_QUE_O_CRONISTA_PODE.fatos.marca("") }).dito);
t("cai quando ela chega sem a marca (alguém a viu em cena)", !("dito" in mesclarNPC(so, { local: "a praça" })));
const fato = criarNPC("Lia", { papel: "ferreira" });
t("e nunca sobe em quem já é fato (o boato sobre a Lia não a torna boato)", !("dito" in mesclarNPC(fato, { dito: "dito por alguém em cena, não fato" })));
t("a mescla não muta o recebido", (() => { const a = { ...so }; mesclarNPC(a, { local: "x" }); return a.dito === so.dito; })());
t("mescla com null não quebra e não tira nada que não devia", mesclarNPC(fato, null).nome === "Lia");

sec("4. o cânone que tem a marca não se cala pela linha que não a tem (MM8d)");
const can = { Clarissa: { tipo: "pessoa", papel: "guia", dito: "x" } };
const semMarca = linhasJaDitas("• Clarissa (guia)");
const comMarca = linhasJaDitas(`• Clarissa (guia, ${MARCA_DO_DITO})`);
/* FALHA NO HEAD DE ANTES: jaFoiDita só lia papel, gênero, lugar, estado e notas */
t("a linha das PESSOAS sem a marca não cala o cânone marcado", formatarCanone(can, { jaDitos: semMarca }).includes(MARCA_DO_DITO));
t("a que a tem cala-o, como calava (nada sobe duas vezes)", formatarCanone(can, { jaDitos: comMarca }) === "");
t("e o cânone sem marca cala-se como sempre", formatarCanone({ Lia: { tipo: "pessoa", papel: "guia" } }, { jaDitos: linhasJaDitas("• Lia (guia)") }) === "");

sec("5. a versão antiga do jogo lê o save com o campo");
/* O campo é novo, e o formato do save é da pessoa: só entra porque a versão
   antiga o ignora. Provado contra o código do HEAD f0dda9e (git archive no
   scratchpad, 28/10): resumoNPCsParaPrompt, ordemDaImportancia, mesclarNPC,
   nomeComDono e normalizarRecencia de antes devolvem, para o registo com
   `dito`, o mesmo que para o registo sem ele — nenhum leitor de antes lê a
   chave, e a mescla de antes leva-a junto, inteira. O que se pode provar
   aqui, sem o HEAD de antes, é a mesma coisa pelo lado de hoje: todo leitor
   do registo, salvo a linha das PESSOAS, dá o mesmo com e sem a chave; e a
   linha de hoje, sem a marca, é byte a byte a de antes. */
const base = { papel: "guia", genero: "mulher", local: "Posto Velho", ultimaVez: 3, conhecidoEm: 2 };
const regSem = { Clarissa: criarNPC("Clarissa", base), Lia: criarNPC("Lia", { papel: "ferreira", ultimaVez: 4, conhecidoEm: 1 }) };
const regCom = JSON.parse(Js({ ...regSem, Clarissa: criarNPC("Clarissa", { ...base, dito: "dito por alguém em cena, não fato" }) }));
t("o save vai e volta pelo JSON com a marca", regCom.Clarissa.dito === "dito por alguém em cena, não fato");
t("a ordem da importância não a lê", Js(ordemDaImportancia(regCom, {}).map((n) => n.nome)) === Js(ordemDaImportancia(regSem, {}).map((n) => n.nome)));
t("o load (normalizarRecencia) guarda-a", normalizarRecencia(regCom).Clarissa.dito === regCom.Clarissa.dito);
t("o dono do nome não a lê", Js(nomeComDono("Clarissa Rocha", regCom, {})) === Js(nomeComDono("Clarissa Rocha", regSem, {})));
const linhaVelha = "• Clarissa (guia, mulher, em Posto Velho, entrou na história no DIA 2)";
t("a linha de hoje, tirada a marca, é a que a versão antiga escrevia para o mesmo save", resumoNPCsParaPrompt(regCom).split("\n").find((l) => l.includes("Clarissa")).replace(`, ${MARCA_DO_DITO}`, "") === linhaVelha && resumoNPCsParaPrompt(regSem).includes(linhaVelha));

sec("6. o custo, no pior caso");
const custo = `, ${MARCA_DO_DITO}`.length;
console.log(`     custo por pessoa marcada: ${custo} chars`);
const muitos = {};
for (let i = 0; i < 40; i++) muitos[`Pessoa ${i}`] = criarNPC(`Pessoa ${i}`, { papel: "mercador de tecidos finos", genero: i % 2 ? "homem" : "mulher", local: "Monte Rasa", notas: "viu o herói entrar na cidade", ultimaVez: i + 1, conhecidoEm: 3, relacao: "aliado", dito: "x" });
const cheio = resumoNPCsParaPrompt(muitos);
console.log(`     40 pessoas marcadas: ${cheio.split("\n").length} linhas, ${cheio.length} chars (teto ${TETO_DAS_PESSOAS.chars})`);
t("a marca custa menos de 30 chars por pessoa", custo < 30, String(custo));
t("com todas marcadas, as PESSOAS CONHECIDAS não passam do teto de chars (o teto paga a marca)", cheio.length <= TETO_DAS_PESSOAS.chars, String(cheio.length));
t("e cada linha que sobe leva a marca", cheio.split("\n").every((l) => l.includes(MARCA_DO_DITO)));

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
