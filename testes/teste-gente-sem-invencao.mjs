/* A GENTE NÃO MANDA INVENTAR (nexo, 11/10)

   A lista de contradições entre órgãos da 4.ª sessão (mente/mm11-sessao-4.md,
   "As contradições entre órgãos") tinha três que nasciam no Intérprete
   (interprete.js), e as três eram o sistema a mandar o Narrador fazer o
   contrário do que outro órgão lhe pedia:

     4. "menciona uma coisa que fizemos juntos, sem contexto" no MESMO pedido
        que o rodapé "NUNCA invente memórias" — Euzébio "pulei no rio atrás
        de ti", que nunca aconteceu;
     9. `atrasa` ("encontra um serviço urgente") disparava com `euDevo` — eu
        devo a ela — e é o gesto de quem DEVE: foi dado ao credor;
     e o defeito 6 da sessão: `usa_o_nome` mandava usar "o apelido que só
        ela usa", e o Narrador inventou "Sibi", que apareceu em 18 das 42
        narrações, até em terceira pessoa.

   FALHA em HEAD (v9.374): `atrasa` sai para o credor, `lembra_de_antes` sai
   para quem nunca me viu antes, e dois movimentos mandam inventar. */

import * as I from "../src/interprete.js";
import { rng } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const mov = (id) => I.movimentoPorId(id) || { quando: () => false, faz: "" };
const vale = (id, p) => { try { return !!mov(id).quando(I.garantirPessoa(p)); } catch { return false; } };

/* quantas vezes um movimento sai, em 3000 consultas com sorte semeada */
function sai(id, pessoa) {
  const sorte = rng("gente-sem-invencao|" + id);
  let n = 0;
  for (let i = 0; i < 3000; i++) { const m = I.consultarInterprete(pessoa, { sorte, ignorarMemoria: true }); if (m && m.id === id) n++; }
  return n;
}

sec("1. foge quem deve, não quem cobra");
{
  const credora = { nome: "Euzébio", papel: "mercador", euDevo: true, relacao: "conhecido", forcaDoLaco: 1 };
  const devedora = { nome: "Marta", papel: "mercador", meDeve: true, relacao: "conhecido", forcaDoLaco: 1 };
  t("atrasa não vale para quem eu devo", !vale("atrasa", credora));
  t("atrasa vale para quem me deve", vale("atrasa", devedora));
  t(`e não sai nunca ao credor (${sai("atrasa", credora)} em 3000)`, sai("atrasa", credora) === 0);
  t(`e sai ao devedor (${sai("atrasa", devedora)} em 3000)`, sai("atrasa", devedora) > 0);
  t("pedir desculpa pelo que foi cobrado é de quem deve", vale("pede_desculpa", { ...devedora, ato: "acusei" }) && !vale("pede_desculpa", { ...credora, ato: "acusei" }));
  t("o credor continua a cobrar (lembra_a_divida, conta_os_dias)", vale("lembra_a_divida", credora) && vale("conta_os_dias", credora) && !vale("lembra_a_divida", devedora));
}

sec("2. lembrar é do que aconteceu");
{
  const nova = { nome: "Belmira", forcaDoLaco: 2, primeiraVez: false, viuAntes: false };
  const antiga = { nome: "Belmira", forcaDoLaco: 2, primeiraVez: false, viuAntes: true };
  t("lembra_de_antes não vale para quem nunca me viu num dia anterior", !vale("lembra_de_antes", nova));
  t("vale para quem me viu", vale("lembra_de_antes", antiga));
  t(`e não sai nunca sem esse passado (${sai("lembra_de_antes", nova)} em 3000)`, sai("lembra_de_antes", nova) === 0);
  t("e o que se lembra é o que a ficha diz, nunca uma cena nova", /ficha/.test(mov("lembra_de_antes").faz) && !/fizemos juntos|sem contexto/.test(mov("lembra_de_antes").faz));
}

sec("3. o nome do herói é o da ficha");
{
  t("usa_o_nome não manda inventar apelido", !/apelido/i.test(mov("usa_o_nome").faz));
  t("e trata pelo nome", /nome/.test(mov("usa_o_nome").faz));
}

sec("4. nenhum movimento manda inventar o que o sistema não tem");
{
  /* as três formas que a 4.ª sessão pegou: o apelido, a memória sem
     contexto e a cena feita juntos — nenhum `faz` do acervo as pede */
  const INVENTA = /apelido|fizemos juntos|sem contexto|como quem sabe que eu lembro/i;
  const culpados = I.MOVIMENTOS.filter((m) => INVENTA.test(m.faz)).map((m) => m.id);
  t(`nenhum faz pede invenção${culpados.length ? " — " + culpados.join(", ") : ""}`, culpados.length === 0);
  t("os movimentos continuam a ter dono, gesto e peso", I.MOVIMENTOS.every((m) => m.id && I.gestoPorId(m.gesto) && m.peso > 0 && m.faz));
}

console.log(`\na gente sem invenção: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
