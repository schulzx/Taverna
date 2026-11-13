/* ============================================================
   O FEITO É DO SISTEMA — A FIAÇÃO NO APP (13/11/2026)

   A peça (src/feito-do-sistema.js, provada em teste-feito-do-sistema.mjs)
   só paga quando o App passa ao `aplicarOTurno` o teste do turno e o livro
   de factos (`ctx.doSistema`). Sem isso, fora da luta o herói não sobe: a
   20.ª sessão mediu 0 XP fora da luta em 47 respostas. Esta suíte prova:

     §1 o teste do turno leva o desafio, quem e o facto que deu (a chave
        que impede o mesmo achado de pagar duas vezes), em calou
     §2 o teste concedido leva o desafio
     §3 o aplicar recebe doSistema com o teste e o livro
     §4 o feito do turno que a quest abate é o que o aplicar pagou — o do
        sistema primeiro; sem isso a quest que fecha paga em duplicado

   Falha na árvore de 0cdaf4b (a peça sem fiação) e passa nesta. */
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

sec("1. O TESTE DO TURNO LEVA A CHAVE DO ACHADO");
{
  const i = APP.indexOf("escreverODescobriu((facto && facto.achado)");
  const trecho = i >= 0 ? APP.slice(i, i + 700) : "";
  t("depois do descobriu, o teste ganha desafio, facto e quem", /testeDoTurnoRef\.current = \{ \.\.\.testeDoTurnoRef\.current, desafio: \(des && des\.id\) \|\| "", facto: facto \|\| null, quem:/.test(trecho));
  t("em calou", /calou\("o feito do sistema · o teste"/.test(trecho));
}

sec("2. O TESTE CONCEDIDO LEVA O DESAFIO");
t("sucesso concedido grava o id do desafio", /testeDoTurnoRef\.current = \{ pericia: \(v && v\.pericia\) \|\| "", sucesso: true, desafio: \(v && v\.id\) \|\| "" \}/.test(APP));

sec("3. O APLICAR RECEBE O QUE SÓ O APP TEM");
t("doSistema com o teste do turno e o livro de factos", /doSistema:\s*\{\s*teste:\s*testeDoTurnoRef\.current,\s*factos:\s*factosRef\.current\s*\}/.test(APP));

sec("4. A QUEST ABATE O FEITO QUE O APLICAR PAGOU");
t("feitoDoTurno do aplicar primeiro, o da IA só como reserva", /const feito = saida && saida\.feitoDoTurno \? saida\.feitoDoTurno\.grau : \(saida && saida\.podado/.test(APP));

console.log(`\n${ok} ok, ${mal} falhas`);
process.exit(mal ? 1 : 0);
