/* AS TOCHAS QUE ZERAVAM NA SAÍDA (16/11, a prova jogada da mesa)

   Visto com a IA real: dentro da cripta «primeiro subsolo · 4 tochas» (5 à
   entrada, 1 gasta); o «Sair» dizia «4 tocha(s) voltam para a mochila», e a
   pilha, a Bolsa e a barra de baixo passavam a 0 — e continuavam em 0 doze
   horas e um turno depois.

   A causa: `sairDaMasmorra` devolvia as tochas à ficha certa (o ref), mas
   chamava o turno da fuga com `personagem`, a ficha da última renderização
   — a de dentro, com a mochila a 0 desde a entrada (`entrarMasmorra` tira as
   tochas da mochila para `mm.tochas`). O turno aplica a resposta do Narrador
   sobre a ficha que recebe (`aplicarResposta(resp, persAtual)`), e essa
   ficha apagava a devolução. Está assim desde a v9.26 — logo também na
   v9.650 que está no ar.

   O que esta suíte prova:
     1. a conta pura (aSaidaDaMasmorra): entrar com 5, gastar 1, sair → 4 na
        mochila; rações e água intactas; nunca negativo; sem masmorra, nada;
     2. a frase em palavras e com o plural da casa («4 tochas voltam», «1
        tocha volta»), sem «tocha(s)»;
     3. a leitura da tela fora da masmorra é a mochila (mantimentosDeUso e
        tochasAgora leem `suprimentos.tochas` quando não há masmorra aberta),
        e a ficha da saída diz 4;
     4. a fiação: a ficha que segue para o turno da fuga é a da saída, nunca
        `personagem`.

   FALHA em HEAD (825c276): não há aSaidaDaMasmorra, e o turno da fuga vai
   com `personagem`. */

import { readFileSync } from "node:fs";
import { aSaidaDaMasmorra, noEscuro } from "../src/masmorras.js";
import { garantirSuprimentos } from "../src/ermos.js";

let ok = 0, falhou = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { falhou++; console.log("  XX  " + nome); } };

console.log("1 · a conta pura");
{
  // a entrada, como o App a faz: as tochas saem da mochila para a planta
  const heroi = { nome: "Vera", suprimentos: { ...garantirSuprimentos(null), tochas: 5, racoes: 3, agua: 2 } };
  const mm = { nome: "Cripta do Corvo", tochas: heroi.suprimentos.tochas, salas: [] };
  const dentro = { ...heroi, suprimentos: { ...heroi.suprimentos, tochas: 0 } };
  const gastou = { ...mm, tochas: mm.tochas - 1 };
  const r = aSaidaDaMasmorra(dentro, gastou);
  t("entrar com 5, gastar 1, sair → 4 na mochila", r.pers.suprimentos.tochas === 4 && r.tochas === 4);
  t("rações e água passam intactas pela porta", r.pers.suprimentos.racoes === 3 && r.pers.suprimentos.agua === 2);
  t("a ficha de entrada não é mutada", dentro.suprimentos.tochas === 0 && r.pers !== dentro);
  t("tocha negativa ou lixo volta 0", aSaidaDaMasmorra(dentro, { tochas: -2 }).pers.suprimentos.tochas === 0 && aSaidaDaMasmorra(dentro, { tochas: "x" }).tochas === 0);
  t("sem masmorra, a ficha volta como veio", aSaidaDaMasmorra(dentro, null).pers === dentro);
  t("ficha null não estoura", aSaidaDaMasmorra(null, gastou).pers.suprimentos.tochas === 4);
  t("e a masmorra de 4 não estava no escuro", !noEscuro(gastou));
}

console.log("2 · a frase");
{
  const quatro = aSaidaDaMasmorra({}, { tochas: 4 }).aviso;
  const uma = aSaidaDaMasmorra({}, { tochas: 1 }).aviso;
  t("«4 tochas voltam para a mochila»", /4 tochas voltam para a mochila/.test(quatro));
  t("«1 tocha volta para a mochila»", /1 tocha volta para a mochila/.test(uma));
  t("nunca «tocha(s)»", !/\(s\)/.test(quatro + uma));
  t("sem luz que sobrou, sem linha", aSaidaDaMasmorra({}, { tochas: 0 }).aviso === "");
}

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const corte = (de, ate) => { const i = app.indexOf(de); const j = app.indexOf(ate, i + de.length); return i >= 0 && j > i ? app.slice(i, j) : ""; };

console.log("3 · a leitura da tela fora da masmorra");
{
  const uso = corte("function mantimentosDeUso(personagem, masmorra) {", "\n}\n");
  t("mantimentosDeUso: fora da masmorra (ou encerrada) as tochas são as da mochila",
    /masmorra && !masmorra\.encerrada \? [^:]+: sup\.tochas/.test(uso));
  const agora = app.slice(app.indexOf("if (mm && !mm.encerrada) return Math.max(0, Number(mm.tochas) || 0);") - 400, app.indexOf("if (mm && !mm.encerrada) return Math.max(0, Number(mm.tochas) || 0);") + 300);
  t("tochasAgora: a mesma regra (masmorra aberta → mm.tochas; senão a mochila)", /suprimentos/.test(agora));
}

console.log("4 · a fiação da porta");
{
  const sair = corte("const sairDaMasmorra = () => {", "\n  };\n");
  t("sairDaMasmorra usa aSaidaDaMasmorra", /aSaidaDaMasmorra\(/.test(sair));
  t("o turno da fuga segue com a ficha da saída", /enviar\(oEnvelopeDaMasmorra\("fuga"[^)]*\)\s*,\s*persOut\)/.test(sair));
  t("e nunca com `personagem` (a ficha da última renderização)", !/enviar\([^;]*,\s*personagem\)/.test(sair));
  t("a linha da tela é a da conta, sem «tocha(s)»", !/tocha\(s\)/.test(sair) && /saida\.aviso/.test(sair));
  const portal = corte("let saiuDe = \"\";", "salvar({ personagem: persP");
  t("a passagem do portal usa a mesma conta e a mesma frase", /aSaidaDaMasmorra\(p, mm\)/.test(portal) && !/tocha\(s\)/.test(portal));
}

console.log(`\nsaída da masmorra: ${ok} passaram, ${falhou} falharam`);
if (falhou) process.exit(1);
