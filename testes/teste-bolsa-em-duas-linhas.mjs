/* teste-bolsa-em-duas-linhas.mjs — o nome numa linha, as ações noutra (v9.359)

   A queixa, da pessoa, com foto: na gaveta de ~340 px, a linha de um item da
   Bolsa levava ícone, nome e até quatro controlos lado a lado, todos
   `shrink-0` menos o nome. O nome encolhia até uma palavra por linha
   ("Amuleto oculto virado do avesso"), o "Investigar" passava por cima de
   "virado", o select "dar…" esticava até ao nome mais longo do grupo
   ("Cassian Longbottom") e o "soltar" saía cortado para fora da gaveta. Os
   "Equipamentos na mochila" tinham o mesmo defeito com o ✕.

   A forma: a primeira linha é do nome (inteiro, sem nada por cima); as ações
   descem para a segunda, em flex-wrap, e o select tem largura curta e fixa.
   Esta suíte não renderiza React — lê o App.jsx como texto e prende a
   construção. A medida viva (getBoundingClientRect a 1600 e a 375 px) foi
   feita no navegador no dia do conserto. */
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const trecho = (txt, ini, fim) => { const i = txt.indexOf(ini); if (i < 0) return ""; const j = txt.indexOf(fim, i + ini.length); return j < 0 ? txt.slice(i) : txt.slice(i, j); };

const BOLSA = trecho(APP, "{/* Bolsa (itens comuns) */}", "A BANCADA (v9.13)");
const EQUIP = trecho(APP, ">Equipamentos na mochila<", "{/* Forja");

sec("1. a Bolsa: o nome fecha a sua linha antes das ações");
{
  t("o trecho da Bolsa foi achado", BOLSA.length > 0 && /soltar/.test(BOLSA));
  t("depois de {it.nome} a linha fecha, e as ações abrem uma div em flex-wrap que leva o soltar",
    /\{it\.nome\}[\s\S]*?<\/div>\s*<div className="[^"]*flex-wrap[^"]*"[^>]*>[\s\S]*?>soltar</.test(BOLSA));
  t("a linha das ações alinha com o nome (os 22px da descrição)",
    /<div className="[^"]*flex-wrap[^"]*" style=\{\{ paddingLeft: "22px" \}\}>/.test(BOLSA));
  t("nenhum controlo da Bolsa volta a ser shrink-0 ao lado do nome", !/rounded[^"]*shrink-0/.test(BOLSA));
  t("o select dar… tem largura máxima curta, com reticências", /<select value=""[^\n]*maxWidth: "7rem", textOverflow: "ellipsis"[^\n]*>\s*<option value="">dar…<\/option>/.test(BOLSA));
}

sec("2. os equipamentos na mochila: a mesma forma");
{
  t("o trecho dos equipamentos foi achado", EQUIP.length > 0 && /equipar</.test(EQUIP));
  t("o nome do equipamento não é mais truncado", /className="tv-body text-sm" style=\{\{ color: T\.ink, overflowWrap: "anywhere" \}\}>\{it\.nome\}/.test(EQUIP));
  t("as ações vivem numa div em flex-wrap que começa pelo verbo (equipar) e acaba no ✕",
    /<div className="flex flex-wrap[^"]*"><button onClick=\{\(\) => equipar\(it\)\}[\s\S]*?dar…[\s\S]*?title="Descartar">✕<\/button><\/div>/.test(EQUIP));
  t("e nada de shrink-0 empurrando os controlos para fora", !/shrink-0/.test(EQUIP));
  t("o select dar… tem a mesma largura máxima", /<select value=""[^\n]*maxWidth: "7rem"[^\n]*>\s*<option value="">dar…<\/option>/.test(EQUIP));
}

console.log(`\nbolsa em duas linhas (v9.359): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
