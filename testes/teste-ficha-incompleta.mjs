/* teste-ficha-incompleta.mjs (Fase T1, trilha B, fatia 2 · 27/10) — a ficha incompleta não derruba o turno

   O DEFEITO, ACHADO PELO JOGO EM NODE (testes/jogar-em-node.mjs): o
   `aplicar` do motor estourava com uma ficha sem `inventario` ou sem
   `habilidades` — `regras-jogo.js#aplicarMudancas` fazia
   `[...pers.inventario]` e `[...pers.habilidades]` sem conferir, e
   `m.dano_ambiental` com as mudanças nulas. O App nunca o viu porque a
   ficha dele traz as listas sempre; um save mínimo, uma ficha de outro
   cliente ou a sala, não. E a lei da casa diz por que não basta um
   `= {}`/`= []` no destructuring: o padrão cobre `undefined`, não `null`.

   O QUE SE PROVA: os dois lixos (ausente e `null`) em cada lista, as
   mudanças nulas, a ficha que não é objeto, o PV e o PM sem número ou sem
   máximo; que a ficha completa sai como saía (a prova byte a byte do motor
   é de teste-motor-aplicar.mjs, que continua verde); e que nada do que
   entra é tocado. */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;

const { aplicarMudancas } = await import("../src/regras-jogo.js");
const { aplicar } = await import("../src/motor/aplicar.js");

const completa = () => ({ nome: "Vera", classe: "Guerreiro", nivel: 1, xp: 0, vida: 20, vidaMax: 20, mana: 4, manaMax: 6, moedas: 30, inventario: ["Pão"], habilidades: [{ nome: "Golpe firme", custo: 2 }], grupo: [{ nome: "Doran", vida: 8, vidaMax: 10 }], efeitos: [], condicoes: [], equipamento: [], equipados: {} });
const sem = (...campos) => { const f = completa(); for (const c of campos) delete f[c]; return f; };
const nulo = (...campos) => { const f = completa(); for (const c of campos) f[c] = null; return f; };
const muda = (pers, m) => { const msgs = [], notas = []; const novo = aplicarMudancas(pers, m, msgs, notas); return { novo, msgs, notas }; };

sec("1. AS LISTAS AUSENTES OU NULAS SÃO LISTAS VAZIAS");
for (const [rotulo, fazer] of [["ausentes", sem], ["nulas", nulo]]) {
  t(`sem inventário (${rotulo}): o item entra numa bolsa nova`, () => J(muda(fazer("inventario"), { adicionar_itens: ["Corda"] }).novo.inventario) === J(["Corda"]));
  t(`sem habilidades (${rotulo}): a remoção não estoura e a lista sai vazia`, () => J(muda(fazer("habilidades"), { remover_habilidades: ["Golpe firme"] }).novo.habilidades) === "[]");
  t(`sem grupo (${rotulo}): o companheiro entra num grupo novo`, () => muda(fazer("grupo"), { grupo_adicionar: [{ nome: "Bram" }] }).novo.grupo.map((g) => g.nome).join() === "Bram");
  t(`as três de uma vez (${rotulo}), com mudanças vazias`, () => { const n = muda(fazer("inventario", "habilidades", "grupo"), {}).novo; return J(n.inventario) === "[]" && J(n.habilidades) === "[]" && J(n.grupo) === "[]"; });
  t(`a venda com a bolsa ${rotulo} não estoura (não há o que vender)`, () => muda(fazer("inventario"), { moedas: 5, remover_itens: ["Pão"] }).novo.moedas === 35);
}

sec("2. AS MUDANÇAS NULAS SÃO NENHUMA MUDANÇA");
{
  const f = completa();
  for (const m of [null, undefined, "lixo", 7]) {
    t(`mudanças ${J(m) || "undefined"}: a ficha sai com os mesmos números`, () => { const n = muda(f, m).novo; return n.vida === 20 && n.mana === 4 && n.moedas === 30 && J(n.inventario) === J(f.inventario); });
  }
  t("e as listas de mensagens nulas não estouram", () => !!aplicarMudancas(completa(), { vida: -2 }, null, null));
}

sec("3. A FICHA QUE NÃO É OBJETO VOLTA COMO VEIO");
for (const p of [null, undefined, "Vera", 3]) {
  t(`ficha ${J(p) || "undefined"}: devolvida, sem inventar um herói`, () => aplicarMudancas(p, { vida: 5, adicionar_itens: ["X"] }, [], []) === p);
}

sec("4. OS NÚMEROS SEM NÚMERO NÃO VIRAM NaN");
{
  const semPV = muda(sem("vida", "vidaMax"), { vida: -3 }).novo;
  t("sem PV: o PV fica como estava (sem número não há conta)", !("vida" in semPV) || semPV.vida === undefined);
  t("e não aparece NaN em lado nenhum da ficha", !/NaN|null/.test(J({ v: semPV.vida, m: semPV.mana, o: semPV.moedas })));
  const semTeto = muda(sem("vidaMax"), { vida: 5 }).novo;
  t("com PV e sem máximo, a cura soma sem teto (20 + 5)", semTeto.vida === 25);
  const semMana = muda(sem("mana", "manaMax"), { mana: 2 }).novo;
  t("sem PM: o PM fica como estava", semMana.mana === undefined);
  const semMoedas = muda(sem("moedas"), { moedas: -4 }).novo;
  t("sem moedas: a bolsa conta de zero, e nunca fica negativa", semMoedas.moedas === 0);
  const semXp = muda(sem("xp"), { feito: "marco" }).novo;
  t("sem XP: o feito paga a partir de zero (nunca NaN)", Number.isFinite(semXp.xp) && semXp.xp > 0, J(semXp.xp));
}

sec("5. A FICHA COMPLETA SAI COMO SAÍA, E NADA DO QUE ENTRA É TOCADO");
{
  const f = completa(), antes = J(f);
  const { novo, msgs } = muda(f, { vida: -25, mana: 9, moedas: -10, adicionar_itens: ["Corda"] });
  t("o PV desce até zero e não passa (o piso de sempre)", novo.vida === 0);
  t("o PM sobe até o máximo e não passa (o teto de sempre)", novo.mana === 6);
  t("a bolsa e a mochila como sempre", novo.moedas === 20 && J(novo.inventario) === J(["Pão", "Corda"]));
  t("e as linhas da tela como sempre", msgs.includes("Você perdeu 25 PV.") && msgs.includes("Item obtido: Corda"));
  t("a ficha que entrou não foi tocada", J(f) === antes);
  const s = sem("inventario", "habilidades"), antesS = J(s);
  muda(s, { adicionar_itens: ["Corda"] });
  t("nem a incompleta: as listas que faltavam não lhe foram escritas", J(s) === antesS && !("inventario" in s));
}

sec("6. O TURNO DO MOTOR COM UM SAVE MÍNIMO");
{
  const minima = { nome: "Vera", vida: 12, vidaMax: 12, mana: 0, manaMax: 0, moedas: 25 };
  const r = (() => { try { return aplicar({ personagem: minima }, { narrativa: "Você encontra 5 moedas no chão.", mudancas: { adicionar_itens: ["Pedra lisa"] } }, {}); } catch (e) { return { erro: e.message }; } })();
  t("o aplicar não estoura com a ficha sem listas (era o defeito)", !r.erro, r.erro);
  t("e a ficha sai com a bolsa nova e o achado creditado", !r.erro && J(r.estado.personagem.inventario) === J(["Pedra lisa"]) && r.estado.personagem.moedas === 30, !r.erro && J(r.estado.personagem));
  t("com as mudanças nulas também", () => !!aplicar({ personagem: minima }, { narrativa: "x", mudancas: null }, {}).estado);
}

console.log(`\nficha incompleta: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
