/* teste-mm8c2-quem-importa.mjs (Fase MM · MM8c-2) — o vilão antes do padeiro

   A pauta das pessoas passa a escolher por IMPORTÂNCIA (grupo, laço,
   relação, elenco), com a recência a desempatar: nas PESSOAS CONHECIDAS,
   no LONGE do rodapé e nas pessoas do cânone. O "ELENCO DIVERSO PRONTO"
   deixa de ser `Math.random` e passa a ser o elenco ainda por conhecer,
   já estreado e por perto — no ESTADO DESTE TURNO, não no fixo. E as duas
   contradições antigas do prompt saem pelo que o código de facto faz. */
import {
  PESO_DA_IMPORTANCIA, importanciaDe, ordemDaImportancia, ordemDaRecencia, resumoNPCsParaPrompt,
  criarNPC, firmarLaco, TETO_DAS_PESSOAS,
} from "../src/npcs.js";
import { resumoCenaPrompt, TETO_DO_QUEM } from "../src/cena.js";
import { formatarCanone, TETO_DO_CANONE, montarSystemPrompt } from "../src/prompt.js";
import { elencoDoMundo, elencoParaPovoar, PARA_POVOAR, ESTREIA_POR_FONTE } from "../src/elenco.js";
import { completarInimigo } from "../src/bestiario.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { matar, garantirBase } from "../src/mundo-base.js";
import { registoSimulado } from "./registo-simulado.mjs";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const G = "Fantasia medieval";
const pessoa = (nome, ultimaVez, extra = {}) => ({ ...criarNPC(nome, { papel: "morador", ...extra }), ultimaVez });

/* ============================================================ */
sec("1. a tabela de peso");
{
  const P = PESO_DA_IMPORTANCIA;
  t("grupo > laço > inimigo > elenco > nada", P.grupo > P.laco && P.laco > P.relacao.inimigo && P.relacao.inimigo > P.elenco && P.elenco > 0);
  t("rival, romance e cônjuge pesam como quase-inimigo; aliado e amigo, menos", P.relacao.rival >= P.relacao.aliado && P.relacao.romance >= P.relacao.aliado && P.relacao.conjuge >= P.relacao.aliado);
  t("morto pesa menos (a memória fica, cede o lugar)", P.morto < 0);
  t("o desconhecido e o neutro não pesam", importanciaDe(pessoa("Padeiro", 1)) === 0 && importanciaDe(pessoa("N", 1, { relacao: "neutro" })) === 0);
  t("o laço pesa, rompido também (é história)", importanciaDe(firmarLaco(pessoa("L", 1), "amizade", 1)) === P.laco
    && importanciaDe({ ...pessoa("R", 1), laco: { tipo: "amor", forca: 1, rompido: true, rompidoEm: 3 } }) === P.laco);
  t("o grupo e o elenco vêm do contexto, por nome ou ficha", importanciaDe(pessoa("Kael", 1), { grupo: [{ nome: "kael" }] }) === P.grupo && importanciaDe(pessoa("Mira", 1), { elenco: ["Mira"] }) === P.elenco);
  t("lixo pesa zero", [null, undefined, 3, "x", {}].every((x) => importanciaDe(x, { grupo: "y", elenco: 7 }) === 0));
}

/* ============================================================ */
sec("2. o rival de há 150 turnos e o padeiro de ontem");
{
  let reg = { Rival: pessoa("Rival", 5, { relacao: "rival" }), Vilao: pessoa("Vilao", 3, { relacao: "inimigo" }) };
  for (let i = 1; i <= 150; i++) reg[`Gente ${i}`] = pessoa(`Gente ${i}`, 5 + i);
  reg.Padeiro = pessoa("Padeiro", 200);
  const txt = resumoNPCsParaPrompt(reg);
  t("o rival visto no turno 5, ausente 150 turnos, continua nas 22", txt.includes("• Rival "));
  t("o vilão também", txt.includes("• Vilao "));
  t("e o padeiro de ontem, sem laço, está atrás dos dois", txt.indexOf("• Padeiro") > txt.indexOf("• Vilao ") && txt.indexOf("• Padeiro") > txt.indexOf("• Rival "));
  /* MOVIDAS NA MM8d (30/09), com o motivo: na MM8c-2 a "Gente" sem peso
     enchia os lugares que sobravam ("as 22 continuam 22"; "quem sai é o
     mais antigo dos sem peso"). Desde a MM8d o figurante sem investimento,
     fora do elenco e fora da cena NÃO OCUPA LUGAR, mesmo com lugar vazio —
     é a regra da etapa. O que a MM8c-2 provava (o teto não muda, e quem tem
     peso entra à frente) continua provado; o que mudou é que a sobra fica
     vazia em vez de cheia de figurantes. O padeiro fica porque o Mestre o
     anotou agora (está na cena), não porque sobrou lugar. */
  t("as 22 continuam no teto (nunca mais do que 22, nem dos caracteres)", txt.split("\n").length <= TETO_DAS_PESSOAS.pessoas && txt.length <= TETO_DAS_PESSOAS.chars);
  t("a gente sem peso e fora da cena não ocupa lugar (MM8d); o padeiro de agora fica", !txt.includes("• Gente ") && txt.includes("• Padeiro") && txt.split("\n").length === 3);
  /* o padeiro contra o vilão, na lista cheia de gente importante */
  let cheio = { Vilao: pessoa("Vilao", 1, { relacao: "inimigo" }), Padeiro: pessoa("Padeiro", 999) };
  for (let i = 1; i <= 21; i++) cheio[`Amigo ${i}`] = pessoa(`Amigo ${i}`, 10 + i, { relacao: "amigo" });
  const t2 = resumoNPCsParaPrompt(cheio);
  t("com 21 amigos e o vilão, o padeiro de ontem é quem fica de fora", t2.includes("• Vilao ") && !t2.includes("• Padeiro"));
  t("determinismo: a mesma ordem duas vezes", JSON.stringify(ordemDaImportancia(reg)) === JSON.stringify(ordemDaImportancia({ ...reg })));
  t("no empate de peso, a recência (a régua da MM8c-1)", ordemDaImportancia({ a: pessoa("A", 3), b: pessoa("B", 9) })[0].nome === "B");
}

/* ============================================================ */
sec("3. o LONGE do rodapé e as pessoas do cânone também");
{
  const mapa = { cidades: [{ nome: "Aqui", x: 0, y: 0 }, { nome: "Longe", x: 60, y: 0 }] };
  const reg = { Rival: pessoa("Rival", 1, { relacao: "rival", local: "Longe" }) };
  for (let i = 1; i <= 40; i++) reg[`Estranho ${i}`] = pessoa(`Estranho ${i}`, 10 + i, { local: "Longe" });
  const txt = resumoCenaPrompt(reg, "Aqui", mapa);
  const longe = txt.split("\n").find((l) => /LONGE/.test(l)) || "";
  t("o rival que está longe há muito entra no LONGE à frente dos estranhos recentes", /: Rival está em Longe/.test(longe));
  t("e o LONGE continua no teto", (longe.match(/ está em /g) || []).length <= TETO_DO_QUEM.longe.pessoas);
  const comElenco = resumoCenaPrompt(reg, "Aqui", mapa, { elenco: ["Estranho 1"] });
  t("o elenco (MM8b) passa à frente de quem não é", /LONGE .*: Rival está em Longe[^·]* · Estranho 1 está em Longe/.test(comElenco));
  const canone = {};
  for (let i = 1; i <= 40; i++) canone[`Estranho ${i}`] = { tipo: "pessoa", notas: "uma frase" };
  canone.Rival = { tipo: "pessoa", notas: "o rival de sempre" };
  const c = formatarCanone(canone, { teto: TETO_DO_CANONE, npcs: reg });
  t("no cânone, o rival antigo fica e o estranho antigo sai", c.includes("• Rival ") && !c.includes("• Estranho 1 "));
  const c2 = formatarCanone(canone, { teto: TETO_DO_CANONE, npcs: reg, elenco: ["Estranho 1"] });
  t("e o elenco também conta no cânone", c2.includes("• Estranho 1 "));
}

/* ============================================================ */
sec("4. quem entra nas 22, antes e depois, numa campanha de 200 turnos");
{
  const r = registoSimulado("solto");
  /* a campanha de verdade tem história: cinco dos primeiros ganham peso */
  const nomes = Object.values(r.npcs).sort((a, b) => a.ultimaVez - b.ultimaVez).map((n) => n.nome);
  const reg = { ...r.npcs };
  reg[nomes[2]] = { ...reg[nomes[2]], relacao: "rival" };
  reg[nomes[4]] = firmarLaco(reg[nomes[4]], "amor", 3);
  reg[nomes[6]] = { ...reg[nomes[6]], relacao: "inimigo" };
  reg[nomes[8]] = firmarLaco(reg[nomes[8]], "divida", 4);
  reg[nomes[10]] = { ...reg[nomes[10]], relacao: "aliado" };
  const pesados = [nomes[2], nomes[4], nomes[6], nomes[8], nomes[10], "Morvath, o Sem-Rosto", "Ilsa Marés"];
  const grupo = [{ nome: nomes[12] }];
  const antes = ordemDaRecencia(reg).slice(0, 22).map((n) => n.nome);
  const depois = resumoNPCsParaPrompt(reg, undefined, { grupo }).split("\n").map((l) => l.slice(2).split(" (")[0]);
  const conta = (lista) => [...pesados, nomes[12]].filter((n) => lista.includes(n)).length;
  console.log(`      ${Object.keys(reg).length} pessoas · com peso (rival, amor, inimigo, dívida, aliado, o vilão, a amiga, um companheiro): ${pesados.length + 1}`);
  console.log(`      nas 22 pela recência: ${conta(antes)} delas · pela importância: ${conta(depois)} delas`);
  t("antes, a recência deixava de fora quem tem história", conta(antes) < pesados.length + 1);
  t("depois, toda a gente com peso está nas 22", conta(depois) === pesados.length + 1);
  t("e as 22 continuam 22, no teto", depois.length <= TETO_DAS_PESSOAS.pessoas && resumoNPCsParaPrompt(reg, undefined, { grupo }).length <= TETO_DAS_PESSOAS.chars);
}

/* ============================================================ */
sec("5. a gente para povoar — o fim do Math.random");
{
  const SEM = "Sonda da Gente|Fantasia medieval";
  const mapa = gerarGeografia(SEM, "sobremundo");
  const espinha = estenderEspinha({ semente: SEM, mapa, genero: G, cidadeInicial: mapa.cidades[0].nome });
  const guildas = guildasDoMundo(SEM, mapa, G);
  const el = elencoDoMundo(SEM, mapa, { genero: G, espinha, guildas });
  const cidade = mapa.cidades[0].nome;
  const ctx = { genero: G, espinha, guildas, dia: 60, cidade, npcs: {} };
  const a = elencoParaPovoar(SEM, mapa, ctx);
  t(`seis, como o banco antigo (${a.length})`, a.length === PARA_POVOAR);
  t("na forma que o prompt lê (nome, gênero, raça, ofício, traço)", a.every((p) => typeof p.nome === "string" && p.nome && ["genero_pessoa", "raca", "ocupacao", "traco"].every((k) => typeof p[k] === "string")));
  t("determinístico: a mesma lista duas vezes", JSON.stringify(a) === JSON.stringify(elencoParaPovoar(SEM, mapa, { ...ctx })));
  t("todos são do elenco", a.every((p) => el.pessoas.some((x) => x.nome === p.nome)));
  t("nenhum chefe: têm lista própria", !a.some((p) => el.pessoas.find((x) => x.nome === p.nome).fonte === "chefe"));
  const daqui = el.pessoas.filter((p) => p.cidade === cidade && p.fonte !== "chefe" && p.estreia <= 60);
  t("quem está na cidade do herói vem primeiro", a.slice(0, Math.min(daqui.length, PARA_POVOAR)).every((p) => daqui.some((x) => x.nome === p.nome)));
  const conhecidos = Object.fromEntries(a.slice(0, 2).map((p) => [p.nome, criarNPC(p.nome, {})]));
  const b = elencoParaPovoar(SEM, mapa, { ...ctx, npcs: conhecidos });
  t("quem o herói já conhece sai da lista", !b.some((p) => conhecidos[p.nome]));
  const noDia1 = elencoParaPovoar(SEM, mapa, { ...ctx, dia: 1 }, 99);
  t("quem ainda não estreou não aparece", noDia1.every((p) => el.pessoas.find((x) => x.nome === p.nome).estreia <= 1));
  const morto = a[0].nome;
  const semMorto = elencoParaPovoar(SEM, mapa, { ...ctx, base: matar(garantirBase(null), morto) });
  t("quem morreu não povoa nada", !semMorto.some((p) => p.nome === morto));
  t("o módulo do elenco não usa Math.random", !/Math\.random/.test(fs.readFileSync(new URL("../src/elenco.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")));
  t("lixo devolve lista vazia, nunca erro", [null, undefined, {}, "x"].every((m) => Array.isArray(elencoParaPovoar("s", m, null))) && elencoParaPovoar("s", mapa, { dia: "x" }, "y").length === 0);
  t("as faixas de estreia continuam as da MM8b", ESTREIA_POR_FONTE.recorrente.ate === 1);

  /* no prompt: a lista mora no ESTADO; o fixo não muda com ela (a cache) */
  const pers = { nome: "X", atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vidaMax: 10, manaMax: 8, nivel: 1 };
  const monta = (lista) => montarSystemPrompt("T", { genero: G }, pers, {}, { cidades: ["Uma"], tavernas: ["Outra"], elenco: lista }, "", "", "", "", "", "", "", { emCidade: true });
  const p1 = monta(a), p2 = monta(b), p0 = monta([]);
  const fixo = (p) => p.slice(0, p.indexOf("═══════════════ ESTADO DESTE TURNO"));
  t("a gente por conhecer vai para o ESTADO DESTE TURNO", p1.indexOf(`GENTE POR CONHECER`) > p1.indexOf("ESTADO DESTE TURNO") && p1.includes(a[0].nome));
  t("e a parte fixa é a mesma com qualquer lista (a cache não se parte)", fixo(p1) === fixo(p2) && fixo(p1) === fixo(p0));
  t("sem ninguém por conhecer, a linha nem aparece", !p0.includes("GENTE POR CONHECER"));
  t("campo vazio não vira vírgula solta", !/\(\s*,|,\s*,|,\s*\)/.test(p1.split("GENTE POR CONHECER")[1].split("\n")[0]));
}

/* ============================================================ */
sec("6. as duas contradições antigas, pelo que o código faz");
{
  const P = fs.readFileSync(new URL("../src/prompt.js", import.meta.url), "utf8");
  /* 2. o PV do Narrador: o código o lê como SUGESTÃO dentro da faixa da
     criatura (completarInimigo, v9.154), e honra a vida atual reduzida */
  const esperado = completarInimigo({ nome: "Lobo", ameaca: "comum" }, 5).vidaMax;
  const exagerado = completarInimigo({ nome: "Lobo", ameaca: "comum", vidaMax: esperado * 10 }, 5);
  const ferido = completarInimigo({ nome: "Lobo", ameaca: "comum", vida: 3 }, 5);
  t("o código: um PV exagerado é aparado à faixa da criatura", exagerado.vidaMax < esperado * 10 && exagerado.vidaMax <= esperado * 1.5 + 1 && !!exagerado.pvAferido);
  t("o código: a vida reduzida de quem já apanhou é honrada", ferido.vida === 3 && ferido.vidaMax >= 3);
  t("o prompt já não diz que o PV é ignorado", !/número de PV que você mandar é ignorado/.test(P));
  t("diz o que o código faz: só vale dentro da faixa", /um PV que você mande só vale dentro da faixa daquela criatura/.test(P));
  t("e já não manda listar PV atual e máximo ao abrir", !/listando cada inimigo com nome, PV atual e máximo/.test(P));
  t("a regra do dano anterior à abertura continua (o código a honra)", /dano legítimo ocorreu antes da abertura/.test(P));
  /* 1. os chefes: nenhuma porta do código regista chefe que o Narrador
     semeie (`chefesDoMundo` é só da semente); áreas secretas, sim, pelo
     sinal masmorra:<nome> (`entrarMasmorra`) */
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o código: o sinal masmorra:<nome> gera a área que o Narrador nomeou", /chave === "masmorra"/.test(APP) && /entrarMasmorra\(nomeMm\)/.test(APP));
  t("o prompt já não manda semear chefes", !/semeie chefes ocultos/.test(P));
  t("diz que os chefes são os do sistema, escondidos, e as áreas pelo sinal", /os chefes são os que o sistema já pôs no mundo/.test(P) && /manda "masmorra:<nome>"/.test(P));
}

/* A FIAÇÃO — o App deixa de sortear a gente do banco e passa a pedir ao
   elenco quem está por conhecer; as pessoas conhecidas ordenam por
   importância. Por texto, com o fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("o App importa o elenco", /import \{[^}]*elencoParaPovoar[^}]*\} from "\.\/elenco\.js"/.test(app));
  t("o banco de nomes já não sorteia a gente (sem elencoDiverso no App)", !app.includes("elencoDiverso("));
  t("as pessoas conhecidas recebem o grupo e o elenco", app.includes("resumoNPCsParaPrompt(npcsRef.current, undefined, { grupo: ") && app.includes("||| [], elenco: nomesDoElenco()".replace("|||", "{}).grupo ||")) /* MM8d: a chamada ganhou emCena e missao depois do elenco; prova-se o que esta asserção sempre quis (o grupo e o elenco chegam), sem o fecho da linha */);
  t("o prompt do turno leva a gente por conhecer", app.includes("elenco: (() => { try { return elencoParaPovoar("));
  t("o cânone recebe o elenco", app.includes("{ npcs: npcsRef.current, elenco: nomesDoElenco() }"));
}

console.log(`\nMM8c-2 · quem importa: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
