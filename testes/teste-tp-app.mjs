/* ============================================================
   TP · A PROSA TOCÁVEL — O LADO DO APP (formas.md §TP 10, «oficial»)

   O motor marca (`marcasDaProsa`, provado em teste-marcas-da-prosa) e as
   peças desenham (`Relato tocaveis`, `EmCena nomeados`, provadas em
   teste-prosa-tocavel e teste-painel-fichas). Aqui só se cobra a fiação
   do App, lida como texto (JSX não corre em Node):

   1. as marcas calculam-se em calou, uma vez por resposta (no efeito das
      fichas, cuja chave é a última fala do Mestre), nunca a cada letra;
   2. o ctx leva o das fichas mais a memória, o livro, a cidade e o sítio
      (sem cidade/lugar, o sítio daqui tocaria «de longe»);
   3. só a última resposta do Mestre recebe `tocaveis` (o `i` dela), e na
      manhã da fogueira a segunda metade desconta o corte;
   4. o mesmo estado e as mesmas mãos do EmCena;
   5. o EmCena recebe `nomeados`;
   6. o id tocado de longe acha a página pela memória no `quemNoEnvio`.
   ============================================================ */
import { readFileSync } from "node:fs";

const ler = (x) => readFileSync(new URL(x, import.meta.url), "utf8").split(String.fromCharCode(13)).join("");
const APP = ler("../src/App.jsx");

let bons = 0, maus = 0;
const t = (o, cond, extra = "") => {
  if (cond) { bons++; console.log("  ok  " + o); }
  else { maus++; console.log("  XX  " + o + (extra ? "\n      → " + extra : "")); }
};
const corpoDe = (inicio, fim) => {
  const a = APP.indexOf(inicio);
  if (a < 0) return "";
  const b = APP.indexOf(fim, a + inicio.length);
  return b < 0 ? "" : APP.slice(a, b);
};

console.log("\n1 · as marcas, em calou e uma vez por resposta");
const montar = corpoDe("const montarAsMarcas = (", "\n  };");
t("o App importa marcasDaProsa de fichas.js", /import \{[^}]*\bmarcasDaProsa\b[^}]*\} from "\.\/fichas\.js";/.test(APP));
t("montarAsMarcas existe e chama marcasDaProsa", montar && /marcasDaProsa\(/.test(montar));
t("e está inteira num try com calou (um motor que estoura deixa a prosa como era)",
  /^const montarAsMarcas = \([^)]*\) => \{\s*try \{/.test(montar) && /catch \(e\) \{ calou\("TP · as marcas da prosa", e\); return null; \}/.test(montar));
t("lê a ÚLTIMA fala do Mestre (o laço de trás para a frente, autor mestre)",
  /for \(let j = L\.length - 1; j >= 0; j--\) if \(L\[j\] && L\[j\]\.autor === "mestre"\)/.test(montar));
const efeito = corpoDe("const ultimaDoMestre = (", "}, [fase, ultimaDoMestre]);");
t("é o efeito das fichas que as calcula (chave: a última fala do Mestre, não a entrada)",
  /setMarcasDaResposta\(montarAsMarcas\(mensagens, r\.lista, r\.ctx\)\)/.test(efeito));
t("fora do jogo, ou num estouro, as marcas somem (null)",
  (efeito.match(/setMarcasDaResposta\(null\)/g) || []).length === 2);
t("ninguém mais chama marcasDaProsa (nada a cada render)", (APP.match(/marcasDaProsa\(/g) || []).length === 1);
t("o estado das marcas não vai ao save", !/marcasDaResposta\s*:/.test(APP));

console.log("\n2 · o ctx: o das fichas, mais memória, livro, cidade e sítio");
t("montarAsFichas devolve o ctx (as marcas usam o MESMO das fichas)", /return \{ lista, fichas: fichasDaCena\(lista, ctx\), ctx \};/.test(APP));
t("o ctx estende o das fichas", /\.\.\.\(ctx \|\| \{\}\),/.test(montar));
t("memoria e factos", /memoria: memoriaRef\.current,/.test(montar) && /factos: factosRef\.current,/.test(montar));
t("cidade (a de agora, em texto)", /cidade: String\(cidadeAtualRef\.current \|\| ""\),/.test(montar));
t("lugar (o NOME do sítio: o motor compara nomes)", /lugar: String\(\(lg && lg\.nome\) \|\| ""\),/.test(montar) && /const lg = lugarRef\.current;/.test(montar));

console.log("\n3 · só a resposta de agora recebe tocaveis");
const toc = corpoDe("const tocaveisDaProsa = (() => {", "})();");
t("tocaveisDaProsa em calou", /catch \(e\) \{ calou\("TP · os nomes tocáveis", e\); return null; \}/.test(toc));
t("o i é o das marcas, e confere que é uma fala do Mestre", /i: mr\.i, marcas: mr\.marcas/.test(toc) && /if \(!m \|\| m\.autor !== "mestre"\) return null;/.test(toc));
const relatos = APP.match(/<Relato [^\n]*\/>/g) || [];
t("as três chamadas do Relato passam tocaveis", relatos.length === 3 && relatos.every((r) => /tocaveis=\{/.test(r)), relatos.length + " chamadas");
/* MOVIDA em 09/11 (TE11): depois de tocaveis vem agora achados (o chip do
   achado no recibo); a intenção é a mesma — o i passa tal qual, sem desconto */
t("o Relato inteiro e a 1.ª metade levam o i tal qual",
  relatos.filter((r) => /tocaveis=\{tocaveisDaProsa\}[ />]/.test(r)).length === 2);
t("a 2.ª metade da manhã desconta o corte (i - k), como a voz e a abertura",
  relatos.some((r) => /mensagens=\{mensagens\.slice\(k\)\}/.test(r) && /tocaveis=\{tocaveisDaProsa \? \{ \.\.\.tocaveisDaProsa, i: tocaveisDaProsa\.i - k \} : null\}/.test(r)));

console.log("\n4 · o mesmo estado e as mesmas mãos do EmCena");
t("a escrita é uma conta só (fichaEscrita), em calou",
  /const fichaEscrita = \(\(\) => \{ try \{ return toque && entrada\.trim\(\) === String\(toque\.texto \|\| ""\)\.trim\(\) \? toque\.id : null; \} catch/.test(APP));
t("os tocáveis: fichaEscrita, fichaAberta e as mesmas mãos",
  /escrita: fichaEscrita, aberta: cartaoNaProsa \? fichaAberta : null, onToque: tocarFicha, onAbrir: abrirNaProsa, onFechar: fecharFicha, onVerbo: verboDaFicha/.test(toc));
/* a ficha aberta é UMA (fichaAberta) e abre pela mesma mão (abrirFicha): só o
   sítio do cartão é de quem o pediu — visto vivo, o mesmo aberta nos dois
   desenhava dois cartões da mesma ficha */
t("abrir na prosa e na gaveta é o mesmo abrirFicha, e só muda onde o cartão pousa",
  /const abrirNaProsa = \(ficha\) => \{ try \{ setCartaoNaProsa\(true\); \} catch \(e\) \{ calou\([^)]*\); \} abrirFicha\(ficha\); \};/.test(APP)
  && /const abrirNaGaveta = \(ficha\) => \{ try \{ setCartaoNaProsa\(false\); \} catch \(e\) \{ calou\([^)]*\); \} abrirFicha\(ficha\); \};/.test(APP));
const emCena = (APP.match(/<EmCena [\s\S]*?\/>/) || [""])[0];
t("o EmCena com a mesma escrita, a mesma aberta e as mesmas mãos",
  /escrita=\{fichaEscrita\}/.test(emCena) && /aberta=\{cartaoNaProsa \? null : fichaAberta\}/.test(emCena)
  && /onToque=\{tocarFicha\} onAbrir=\{abrirNaGaveta\} onFechar=\{fecharFicha\} onVerbo=\{verboDaFicha\}/.test(emCena));
t("o toque escreve pelo juntarNomeNoCampo de sempre (tocarFicha intacto)",
  /const junto = juntarNomeNoCampo\(atual, pos, nome, postos\);/.test(corpoDe("const tocarFicha = (ficha) => {", "const abrirFicha")));

console.log("\n5 · o EmCena recebe nomeados");
t("nomeados={nomeadosNaProsa}", /nomeados=\{nomeadosNaProsa\}/.test(emCena));
t("os nomeados são os ids das marcas, em calou",
  /const nomeadosNaProsa = \(\(\) => \{ try \{ return tocaveisDaProsa \? tocaveisDaProsa\.marcas\.map\(\(m\) => m\.id\) : \[\]; \} catch \(e\) \{ calou\(/.test(APP));

console.log("\n6 · o longe acha a página pela memória");
t("alvoDoEnvio passa a memória ao quemNoEnvio",
  /quemNoEnvio\(\{ id: tq && tq\.id, ids, texto: acao \}, lista, memoriaRef\.current\)/.test(corpoDe("const alvoDoEnvio = (", "\n  };")));

console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
