/* teste-mercado-sem-nomes.mjs — a página em branco do mercado.
   O relato (A1, visto em 05/10 e de novo em 10/10): o jogo inteiro caía
   numa página em branco com "Cannot read properties of null (reading
   'length')". A causa: `nomesDeLugar` (lexico.js) devolve `null` — e não
   uma lista vazia — quando o léxico do mundo tem menos de 2 nomes de
   mercado, e `gerarMercador` (mercado.js) lia `doMundo.length` sem guarda.
   Um mundo cujo Léxico veio magro numa só categoria derrubava o render.

   A lei que isto prova: `null` é tratado explícito. Mundo com 0 ou 1 nome
   de mercado nomeia as bancas pelo banco genérico, EXATAMENTE como um
   mundo sem léxico nenhum (mesma semente, mesmo nome) — o léxico magro não
   pode nem derrubar a cena nem mudar o que o sorteio genérico daria. */
import { gerarMercador, mercadoresDaCidade } from "../src/mercado.js";
import { garantirLexico, nomesDeLugar } from "../src/lexico.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);
const tenta = (f) => { try { return { v: f(), erro: null }; } catch (e) { return { v: null, erro: e }; } };

/* `garantirLexico`, e não `lerLexico`: este último descarta um léxico que
   não vale por inteiro, e o que se quer aqui é o mundo válido que veio
   magro SÓ nos nomes de mercado — o caso que o jogo viu. */
const lexCom = (nomes) => garantirLexico({ lugares: [{ tipo: "mercado", chamado: "feira", nomes }] });
const LEX_0 = lexCom([]);
const LEX_1 = lexCom(["Feira do Setor 3"]);
const LEX_3 = lexCom(["Feira do Setor 3", "Central de Achados", "Pavilhão do Vale"]);
const CIDADE = { nome: "Vau Sombrio", porte: "capital" };

sec("a origem: nomesDeLugar devolve null com menos de 2 nomes");
ok(nomesDeLugar(LEX_0, "mercado") === null, "0 nomes de mercado: null");
ok(nomesDeLugar(LEX_1, "mercado") === null, "1 nome de mercado: null");
ok(Array.isArray(nomesDeLugar(LEX_3, "mercado")), "3 nomes de mercado: a lista");

for (const [rotulo, lex] of [["0 nomes", LEX_0], ["1 nome", LEX_1]]) {
  sec(`léxico com ${rotulo} de mercado: não derruba, cai no genérico`);
  for (const tipo of ["geral", "ferreiro", "ambulante"]) {
    const semente = `prova|${tipo}`;
    const r = tenta(() => gerarMercador({ cidade: tipo === "ambulante" ? null : CIDADE, semente, tipo, lex }));
    ok(!r.erro, `${tipo}: gerarMercador não estoura${r.erro ? " — " + r.erro.message : ""}`);
    const base = gerarMercador({ cidade: tipo === "ambulante" ? null : CIDADE, semente, tipo, lex: null });
    ok(r.v && typeof r.v.nome === "string" && r.v.nome.length > 0, `${tipo}: a banca tem nome (${r.v && r.v.nome})`);
    ok(r.v && r.v.nome === base.nome, `${tipo}: o mesmo nome que um mundo sem léxico daria (${base.nome})`);
  }
  const cid = tenta(() => mercadoresDaCidade(CIDADE, 1, 1, lex));
  ok(!cid.erro && Array.isArray(cid.v) && cid.v.length === 3, `a capital monta as 3 bancas pelo caminho que a tela usa${cid.erro ? " — " + cid.erro.message : ""}`);
}

sec("sem léxico, e léxico lixo");
for (const [rotulo, lex] of [["null", null], ["undefined", undefined], ["{}", {}], ["lugares null", { lugares: null }]]) {
  const r = tenta(() => mercadoresDaCidade(CIDADE, 1, 1, lex));
  ok(!r.erro && r.v.length === 3 && r.v.every((m) => m.nome), `lex ${rotulo}: 3 bancas com nome${r.erro ? " — " + r.erro.message : ""}`);
}

sec("o caminho normal: o mundo nomeia as bancas");
const NOMES = nomesDeLugar(LEX_3, "mercado");
const bancas = mercadoresDaCidade(CIDADE, 1, 1, LEX_3);
ok(bancas.every((m) => NOMES.includes(m.nome)), `as bancas levam nomes do léxico (${bancas.map((m) => m.nome).join(" · ")})`);
ok(new Set(bancas.map((m) => m.nome)).size === bancas.length, "três bancas, três nomes distintos");
const amb = gerarMercador({ cidade: null, semente: "prova|ambulante", tipo: "ambulante", lex: LEX_3 });
ok(NOMES.some((n) => amb.nome === `${n} (ambulante)`), `o ambulante também (${amb.nome})`);

sec("determinismo: a mesma semente dá o mesmo nome");
for (const [rotulo, lex] of [["0 nomes", LEX_0], ["1 nome", LEX_1], ["3 nomes", LEX_3], ["sem léxico", null]]) {
  const a = mercadoresDaCidade(CIDADE, 8, 2, lex).map((m) => m.nome).join("|");
  const b = mercadoresDaCidade(CIDADE, 8, 2, lex).map((m) => m.nome).join("|");
  ok(a === b, `${rotulo}: duas montagens, os mesmos nomes (${a})`);
  const x = gerarMercador({ cidade: null, semente: "ambulante|9|42", tipo: "ambulante", lex }).nome;
  const y = gerarMercador({ cidade: null, semente: "ambulante|9|42", tipo: "ambulante", lex }).nome;
  ok(x === y, `${rotulo}: o ambulante da mesma semente tem o mesmo nome (${x})`);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nmercado sem nomes: tudo verde");
process.exit(falhas ? 1 : 0);
