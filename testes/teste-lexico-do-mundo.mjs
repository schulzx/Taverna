/* teste-lexico-do-mundo.mjs (NE6, 13/11/2026) — o Léxico vira tabela

   A Fase NE (mente/plano-nada-entra.md): «nenhuma IA escreve estado de
   jogo». O Léxico era uma IA que, na criação, escrevia `mundo.lexico`; a
   troca é src/lexico-do-mundo.js — o mesmo formato (o de garantirLexico),
   por tabela nossa, pelo gênero, pelo molde e pela semente.

   A régua: (1) é o formato do Léxico, e o léxico VALE (lexicoVale) e chega
   ao prompt dentro do teto do bloco; (2) nada das tabelas se perde na
   garantia (todo texto cabe no teto do seu campo, todo id existe); (3)
   determinístico — a mesma semente dá o mesmo léxico, outra semente dá
   outro mundo do mesmo gênero; (4) o que fica vazio fica vazio de
   propósito (os bancos do gênero respondem); (5) o molde muda a viagem e
   a passagem; (6) lixo não derruba. */
import {
  lexicoDoMundo, LEXICO_DOS_GENEROS, LEXICO_DO_MOLDE, QUANTOS_NO_LEXICO, idDoGeneroDoLexico,
} from "../src/lexico-do-mundo.js";
import { cenarioAtivo } from "../src/cenario.js";
import { garantirLexico, lexicoVale, lexicoPrompt, TETO_DO_BLOCO, COISAS, SISTEMAS, TIPOS_DE_LUGAR, nomeDaMoeda, continenteDo } from "../src/lexico.js";
import { GENEROS } from "../src/constantes.js";
import { MOLDES } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const GENS = Object.keys(LEXICO_DOS_GENEROS);
/* o gênero padrão é o do cenário (o rótulo), e a tabela vai pelo id do cartão */
const PADRAO = cenarioAtivo().generos.padrao;
const ROTULO = Object.fromEntries(GENEROS.map((g) => [g.id, g.label]));

sec("1. o formato do Léxico, e o léxico vale");
{
  t("seis gêneros na tabela, pelo id do cartão da criação, e o padrão do cenário é um deles", GENS.length === 6 && GENS.every((id) => ROTULO[id]) && GENS.includes(idDoGeneroDoLexico(PADRAO)));
  const daCriacao = GENEROS.map((g) => g.label);
  t("todo cartão da criação tem tabela própria, menos o «Universo próprio» (que usa a do padrão)", GENEROS.filter((g) => !LEXICO_DOS_GENEROS[g.id]).map((g) => g.label).join() === "Universo próprio" && idDoGeneroDoLexico("Universo próprio") === idDoGeneroDoLexico(PADRAO));
  for (const g of daCriacao) {
    const x = lexicoDoMundo({ genero: g, molde: "sobremundo" }, { semente: `Sal|${g}` });
    t(`${g}: gerado, vale (lexicoVale), e a garantia não lhe tira nada`, x.gerado === true && lexicoVale(x) && J(garantirLexico(x)) === J(x));
  }
  const x = lexicoDoMundo({ genero: ROTULO.cyberpunk }, { semente: "Sal|Cyberpunk" });
  const bloco = lexicoPrompt(x);
  t(`chega ao prompt pelo bloco que já existia (${bloco.length} chars, teto ${TETO_DO_BLOCO}) — nenhum bloco novo`, bloco.length > 0 && bloco.length <= TETO_DO_BLOCO);
  t("a moeda do mundo e o continente saem dos leitores de sempre", ["eurodólares", "créditos"].includes(nomeDaMoeda(x)) && LEXICO_DOS_GENEROS.cyberpunk.continente.includes(continenteDo(x)));
}

sec("2. as tabelas cabem na garantia — nenhum texto cortado, nenhum id inventado");
{
  const ids = new Set(COISAS.map((c) => c.id)), sis = new Set(SISTEMAS.map((s) => s.id));
  const foraC = [], foraS = [], cortados = [], foraL = [];
  for (const g of GENS) {
    const T = LEXICO_DOS_GENEROS[g];
    for (const [id, xs] of Object.entries(T.chamado)) {
      if (!ids.has(id)) foraC.push(`${g}:${id}`);
      for (const v of xs) { const y = garantirLexico({ chamado: { [id]: v } }).chamado[id]; if (y !== undefined && y !== v) cortados.push(`${g}:chamado.${id}`); }
    }
    for (const [id, xs] of Object.entries(T.funciona)) {
      if (!sis.has(id)) foraS.push(`${g}:${id}`);
      for (const v of xs) if (garantirLexico({ funciona: { [id]: v } }).funciona[id] !== v) cortados.push(`${g}:funciona.${id}`);
    }
    for (const l of T.lugares) { if (!TIPOS_DE_LUGAR.includes(l.tipo)) foraL.push(`${g}:${l.tipo}`); for (const v of l.chamado) if ((garantirLexico({ lugares: [{ tipo: l.tipo, chamado: v }] }).lugares[0] || {}).chamado !== v) cortados.push(`${g}:lugar.${l.tipo}`); }
    const campo = (k, xs) => xs.forEach((v) => { const y = garantirLexico({ [k]: [v] })[k][0]; if (y !== v) cortados.push(`${g}:${k}`); });
    campo("passado", T.passado); campo("titulos", T.titulos); campo("naoExiste", T.naoExiste);
    for (const v of T.aLei) if (garantirLexico({ aLei: v }).aLei !== v) cortados.push(`${g}:aLei`);
    for (const v of T.comoSeFala) if (garantirLexico({ comoSeFala: v }).comoSeFala !== v) cortados.push(`${g}:comoSeFala`);
    for (const v of T.continente) if (garantirLexico({ nomes: { continente: v } }).nomes.continente !== v) cortados.push(`${g}:continente`);
    for (const f of T.faccoes) if (J(garantirLexico({ faccoes: [f] }).faccoes[0]) !== J(f)) cortados.push(`${g}:faccao ${f.nome}`);
  }
  t("todo `chamado` é de uma COISA que o léxico conhece", !foraC.length, foraC.join(", "));
  t("todo `funciona` é de um SISTEMA que existe", !foraS.length, foraS.join(", "));
  t("todo tipo de lugar é um TIPO_DE_LUGAR (a engrenagem do jogo)", !foraL.length, foraL.join(", "));
  t("nenhum texto das tabelas é cortado pela garantia (cada um cabe no teto do seu campo)", !cortados.length, cortados.slice(0, 6).join(", "));
  t("os recortes têm de onde tirar (cada lista com mais do que a semente leva)", GENS.every((g) => Object.entries(QUANTOS_NO_LEXICO).every(([k, n]) => LEXICO_DOS_GENEROS[g][k].length > n)));
  t("as quatro adaptações que valem em toda cena (as sem porta) estão em todo gênero", GENS.every((g) => SISTEMAS.filter((s) => !s.porta).every((s) => (LEXICO_DOS_GENEROS[g].funciona[s.id] || []).length >= 1)));
}

sec("3. determinístico, e com variedade");
{
  const a = lexicoDoMundo({ genero: ROTULO.steampunk, molde: "sobremundo" }, { semente: "Brasa|Steampunk" });
  t("a mesma semente dá o mesmo léxico (byte a byte)", J(a) === J(lexicoDoMundo({ genero: ROTULO.steampunk, molde: "sobremundo" }, { semente: "Brasa|Steampunk" })));
  const vinte = new Set(Array.from({ length: 20 }, (_, i) => J(lexicoDoMundo({ genero: ROTULO.steampunk }, { semente: `c${i}|Steampunk` }))));
  t(`vinte campanhas do mesmo gênero dão ${vinte.size} léxicos diferentes`, vinte.size >= 18);
  const passados = new Set(Array.from({ length: 20 }, (_, i) => J(lexicoDoMundo({ genero: ROTULO.horror }, { semente: `h${i}` }).passado)));
  t("o passado muda de campanha para campanha (os recortes)", passados.size >= 8);
  t("e cada recorte leva o que a tabela QUANTOS_NO_LEXICO diz", Object.entries(QUANTOS_NO_LEXICO).every(([k, n]) => a[k].length === n));
  t("o léxico não gasta a sorte da casa (a corrente é dele: chamar duas vezes não muda a segunda)", (() => { const x = lexicoDoMundo({ genero: ROTULO.cyberpunk }, { semente: "z" }); lexicoDoMundo({ genero: ROTULO.cyberpunk }, { semente: "y" }); return J(x) === J(lexicoDoMundo({ genero: ROTULO.cyberpunk }, { semente: "z" })); })());
  const fs = lexicoDoMundo({ genero: ROTULO.fantasia }, { semente: "x" }), cy = lexicoDoMundo({ genero: ROTULO.cyberpunk }, { semente: "x" });
  t("gêneros diferentes, mundos diferentes (a regra, o passado, a moeda)", fs.aLei !== cy.aLei && J(fs.passado) !== J(cy.passado));
}

sec("4. o que fica vazio, fica vazio de propósito — os bancos do gênero respondem");
{
  const x = lexicoDoMundo({ genero: ROTULO.scifi }, { semente: "v" });
  t("sem nomes próprios, cidades, tavernas, povos, ofícios, criaturas, raças, equipamento, profissões nem afixos", !x.nomes.masc.length && !x.nomes.fem.length && !x.nomes.sobrenome.length && !x.nomes.cidadeA.length && !x.nomes.cidadeB.length && !x.cidades.length && !x.tavernas.length && !x.povos.length && !x.oficios.length && !x.criaturas.length && !x.racas.length && !Object.keys(x.equipamento).length && !x.profissoes.length && !Object.keys(x.afixos.prefixos).length);
  t("os lugares só dão o nome do tipo (nenhum nome próprio), e nunca o tipo chamado por ele mesmo", x.lugares.length > 0 && x.lugares.every((l) => !l.nomes.length && l.chamado && l.chamado.toLowerCase() !== l.tipo));
  t("a fantasia quase não renomeia (o mundo que as palavras genéricas já descrevem)", Object.keys(lexicoDoMundo({ genero: ROTULO.fantasia }, { semente: "v" }).chamado).length <= 6);
}

sec("5. o molde muda a viagem e a passagem");
{
  const ids = MOLDES.map((m) => m.id);
  t("todo molde da tabela é um molde que existe, e as terras abertas ficam com o texto do gênero", Object.keys(LEXICO_DO_MOLDE).every((k) => ids.includes(k)) && !LEXICO_DO_MOLDE.sobremundo);
  const sob = lexicoDoMundo({ genero: ROTULO.fantasia, molde: "sobremundo" }, { semente: "m" }), arq = lexicoDoMundo({ genero: ROTULO.fantasia, molde: "arquipelago" }, { semente: "m" });
  t("no arquipélago navega-se (a viagem e a passagem são as do molde)", arq.funciona.viagem === LEXICO_DO_MOLDE.arquipelago.viagem && arq.funciona.passagem === LEXICO_DO_MOLDE.arquipelago.passagem && sob.funciona.viagem !== arq.funciona.viagem);
  t("…e o resto do léxico é o mesmo da mesma semente", sob.aLei === arq.aLei && J(sob.passado) === J(arq.passado) && J(sob.chamado) === J(arq.chamado));
  t("os textos do molde cabem na garantia", Object.values(LEXICO_DO_MOLDE).every((m) => Object.entries(m).every(([k, v]) => garantirLexico({ funciona: { [k]: v } }).funciona[k] === v)));
}

sec("6. lixo não derruba");
{
  let estourou = "";
  const lixos = [null, undefined, 3, "x", [], {}, { genero: 7 }, { genero: "Gênero que não existe", molde: {} }];
  try { for (const l of lixos) for (const o of [null, undefined, {}, { semente: null }, { semente: 5 }]) lexicoDoMundo(l, o); } catch (e) { estourou = String(e && e.message); }
  t("nenhum lixo estoura (o mundo, as opções)", !estourou, estourou);
  t("o gênero que não existe é o do padrão; o «Universo próprio» também", J(lexicoDoMundo({ genero: "Gênero que não existe" }, { semente: "q" })) === J(lexicoDoMundo({ genero: PADRAO }, { semente: "q" })) && J(lexicoDoMundo({ genero: "Universo próprio" }, { semente: "q" })) === J(lexicoDoMundo({ genero: PADRAO }, { semente: "q" })));
  t("o lixo ainda vale (gerado e lexicoVale)", lixos.every((l) => { const x = lexicoDoMundo(l); return x.gerado && lexicoVale(x); }));
  t("e não muta o mundo recebido", (() => { const m = Object.freeze({ genero: ROTULO.cyberpunk, molde: "estelar" }); try { lexicoDoMundo(m, { semente: "f" }); return true; } catch { return false; } })());
}

console.log(`\nléxico do mundo: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
