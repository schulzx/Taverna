/* gerar-aplicar-dourado.mjs (Fase T1-A, 27/10/2026) — a fotografia de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que fez o
   `aplicar-dourado.json`, e fica para quem quiser refazer a prova. Lê o
   `aplicarResposta` do App de ANTES da mudança — `git show b9e6e20:src/App.jsx`,
   o último commit em que o bloco ainda morava inteiro no App —, recorta o
   bloco que saiu para `src/motor/aplicar.js` (de `const op = opts` até a
   dádiva pendente, exclusive), e corre-o em Node com os refs trocados por
   objetos simples e as funções dos módulos de verdade. O que ele produz em
   cada caso de `aplicar-casos.mjs` é gravado como o dourado.

   uso: node testes/gerar-aplicar-dourado.mjs [commit] [--sorte]

   --sorte (T1-A, 2.ª fatia, 27/10): o DOURADO DA SORTE DO TURNO. A
   salvaguarda do fim do turno passou a rolar pelo fio da sorte do turno
   (`ctx.sorte`), e não pela reserva da casa. O código de antes não tinha
   esse fio, então o dublê é declarado: o MESMO bloco de b9e6e20, com a
   `tentarSaidaNoFimDoTurno` de verdade recebendo o d20 de
   `dadoDo(semente do caso, "salvaguarda")` — a conta de face de
   `rolarSalvaguarda` — e a casa semeada com OUTRA semente, para a prova
   mostrar que o dado já não sai dela. Grava `aplicar-dourado-sorte.json`. */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { casosDoAplicar, retrato, digital } from "./aplicar-casos.mjs";
import { semearACasa, dadoDo } from "../src/semente.js";
import { podarONarrador } from "../src/agressao.js";
import { tickEfeitos, atributoEfetivo, aplicarMudancas } from "../src/regras-jogo.js";
import { tickCondicoes, tentarSaidaNoFimDoTurno } from "../src/condicoes.js";
import { oQueFaltaCreditar, oQueFaltaDebitar, falaDaCobranca, envelopeDaCobranca, envelopeDaCobrancaNegada, falaDoDebito, envelopeDoDebito } from "../src/cobranca.js";
import { itemConsumivel } from "../src/pocoes.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SORTE = process.argv.includes("--sorte");
const COMMIT = process.argv.slice(2).find((a) => !a.startsWith("--")) || "b9e6e20";
const app = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString();
const i0 = app.indexOf("    const op = opts && typeof opts === \"object\" ? opts : {};");
const i1 = app.indexOf("    if ((pers.dadivasPendentes || 0) > 0) pers = concederDadivas(pers, msgs);");
if (i0 < 0 || i1 < i0) throw new Error("o bloco não está onde estava");
const corpo = app.slice(i0, i1);

const velho = new Function("R", `
  const { opts, persAtual, personagemRef, personagem, danoJaAplicadoRef, habUsadaRef, notaRef, combateRef, setCombate,
    ultimoDesfechoRef, texturaRef, calou, podarONarrador, tickEfeitos, atributoEfetivo, aplicarMudancas, tickCondicoes,
    tentarSaidaNoFimDoTurno, oQueFaltaCreditar, oQueFaltaDebitar, falaDaCobranca, envelopeDaCobranca,
    envelopeDaCobrancaNegada, falaDoDebito, envelopeDoDebito, itemConsumivel } = R;
  let resp = R.resp;
${corpo}
  return { pers, msgs, resp };
`);

const fora = [];
const dourado = casosDoAplicar().map((c) => {
  const k = JSON.parse(JSON.stringify(c));
  const R = {
    opts: k.ctx, persAtual: k.estado.personagem, personagemRef: { current: null }, personagem: null,
    danoJaAplicadoRef: { current: k.estado.danoJaAplicado }, habUsadaRef: { current: k.estado.habUsada },
    notaRef: { current: k.notaAntes }, combateRef: { current: k.estado.combate }, setCombate: () => {},
    ultimoDesfechoRef: { current: k.estado.ultimoDesfecho }, texturaRef: { current: {} },
    calou: (onde) => fora.push(onde), resp: k.resp,
    podarONarrador, tickEfeitos, atributoEfetivo, aplicarMudancas, tickCondicoes,
    tentarSaidaNoFimDoTurno: SORTE
      ? (() => { const sorte = dadoDo(c.semente, "salvaguarda"); return (p, o) => tentarSaidaNoFimDoTurno(p, { ...o, d20: () => 1 + Math.floor(sorte() * 20) }); })()
      : tentarSaidaNoFimDoTurno,
    oQueFaltaCreditar, oQueFaltaDebitar, falaDaCobranca, envelopeDaCobranca, envelopeDaCobrancaNegada,
    falaDoDebito, envelopeDoDebito, itemConsumivel,
  };
  semearACasa(SORTE ? `outra casa|${c.semente}` : c.semente);
  const r = velho(R);
  const ret = retrato({
    pers: r.pers, msgs: r.msgs, nota: R.notaRef.current, combate: R.combateRef.current,
    danoJaAplicado: R.danoJaAplicadoRef.current, habUsada: R.habUsadaRef.current, textura: R.texturaRef.current, resp: r.resp,
  });
  return { id: c.id, digital: digital(ret), bytes: ret.length, msgs: r.msgs, nota: R.notaRef.current };
});
const saida = { origem: `o aplicarResposta de ${COMMIT} (bloco 'a ficha': poda, travas, relógio, mudanças, cobrança), sobre aplicar-casos.mjs${SORTE ? ", com o d20 da salvaguarda de dadoDo(semente do caso, \"salvaguarda\") e a casa semeada com outra semente" : ""}`, calou: fora.length, casos: dourado };
fs.writeFileSync(path.join(AQUI, SORTE ? "aplicar-dourado-sorte.json" : "aplicar-dourado.json"), JSON.stringify(saida));
console.log(`dourado: ${dourado.length} casos, ${fora.length} calou`);
