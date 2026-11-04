/* O MESTRE PEDE O DADO (04/11/2026) — src/motor/o-mestre-pede.js

   «precisamos de uma forma de o sistema acionar o dado mais vezes». O
   Mestre pede uma FRASE que o catálogo já julga; esta suíte prova:
   §1 cada frase pedida é um teste do catálogo (lerAcao), com perícia e CD;
   §2 quando pede: a conversa viva ganha da sala; nada em luta, estrada,
      masmorra, ou com a mesa ocupada;
   §3 não pede duas vezes a mesma coisa no mesmo dia; no dia seguinte, sim;
   §4 o cartão: o dado e o número antes do toque, «Rolar» e «Agora não»;
      sem teste não há cartão (o lugar já revirado, a mesa recusa);
   §5 o defeito que esta etapa achou: «leio as intenções» nunca rolava. */
import { O_MESTRE_PEDE, aChaveDoPedido, oQueOMestrePede, oCartaoDoPedido } from "../src/motor/o-mestre-pede.js";
import { lerAcao } from "../src/desafios.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const ctx = { personagem: { nivel: 3, atributos: {}, pericias: {} }, semente: "x1", lugar: "taverna",
  emCombate: false, tentativas: {}, dia: 1, pessoaDe: () => null, fama: 0,
  ehPessoaConhecida: () => false, achadoDe: () => null };

sec("§1 a frase pedida é um teste do catálogo");
{
  const sala = oQueOMestrePede({ onde: "A Lanterna da Bruma", dia: 1 });
  const vs = lerAcao(sala.frase, ctx);
  t("«Olhar à volta» → vasculhar, Percepção", vs && vs.tipo === "teste" && vs.pericia === "percepcao" && Number.isFinite(vs.dc), J(vs && { tipo: vs.tipo, id: vs.id, dc: vs.dc }));
  for (const quem of ["Gareth", "Maela Corvo", "o taverneiro Loras"]) {
    const p = oQueOMestrePede({ onde: "A Lanterna da Bruma", falouCom: quem, dia: 1 });
    const v = lerAcao(p.frase, ctx);
    t(`«Ler as intenções de ${quem}» → ler a intenção, Intuição`, v && v.tipo === "teste" && v.pericia === "intuicao" && v.id === "mentira", J(v && { tipo: v.tipo, id: v.id }));
  }
}

sec("§2 quando o Mestre pede");
{
  t("a conversa viva ganha da sala", oQueOMestrePede({ onde: "Termas", falouCom: "Gareth", dia: 2 }).id === "intencao");
  t("sem conversa, a chegada", oQueOMestrePede({ onde: "Termas", dia: 2 }).id === "chegada");
  t("sem sítio nem conversa, nada", oQueOMestrePede({ dia: 2 }) === null);
  for (const [nome, opc] of [["em luta", { emCombate: true }], ["com a mesa ocupada", { ocupado: true }], ["na estrada", { naEstrada: true }], ["na masmorra", { naMasmorra: true }]]) {
    t(`${nome}: nada`, oQueOMestrePede({ onde: "Termas", falouCom: "Gareth", dia: 2, ...opc }) === null);
  }
  t("o verbo e a frase dizem o nome", (() => { const p = oQueOMestrePede({ falouCom: "Gareth", dia: 1 }); return p.verbo === "Ler as intenções de Gareth" && p.frase.includes("Gareth"); })());
}

sec("§3 não pede duas vezes");
{
  const p = oQueOMestrePede({ onde: "Termas", dia: 3 });
  t("o mesmo sítio no mesmo dia: já pedido, nada", oQueOMestrePede({ onde: "Termas", dia: 3, jaPedidos: [p.chave] }) === null);
  t("no dia seguinte, pede de novo", oQueOMestrePede({ onde: "Termas", dia: 4, jaPedidos: [p.chave] }) !== null);
  t("a chave não liga a maiúsculas", aChaveDoPedido("chegada", { onde: "TERMAS", dia: 3 }) === p.chave);
  const g = oQueOMestrePede({ onde: "Termas", falouCom: "Gareth", dia: 3, jaPedidos: [p.chave] });
  t("lida a sala, a pessoa ainda pode ser lida", g && g.id === "intencao");
  t("lida a pessoa, volta a sala (se ainda não pedida)", oQueOMestrePede({ onde: "Praça", falouCom: "Gareth", dia: 3, jaPedidos: [g.chave] }).id === "chegada");
}

sec("§4 o cartão");
{
  const p = oQueOMestrePede({ onde: "Termas", dia: 1 });
  const c = oCartaoDoPedido(p, { tipo: "teste", dc: 13 }, { mod: 3, pericia: "Percepção" });
  t("o dado e o bónus no preço", c.preco === "d20 + 3", c.preco);
  t("a perícia e a CD na linha", c.linhas[0] === "Percepção · precisa de 13", c.linhas[0]);
  t("«Rolar» e «Agora não»", c.confirmar === O_MESTRE_PEDE.confirmar && c.recuo === O_MESTRE_PEDE.recuo && c.confirmar === "Rolar");
  t("o cartão leva a frase, a chave e a marca de pedido", c.frase === p.frase && c.chave === p.chave && c.pedido === true && c.glifo === "dado");
  t("o bónus negativo com o sinal certo", oCartaoDoPedido(p, { tipo: "teste", dc: 13 }, { mod: -1 }).preco === "d20 − 1");
  t("sem teste (o lugar já revirado), nada", oCartaoDoPedido(p, { tipo: "livre", chave: "x" }, {}) === null);
  t("sem veredicto, nada", oCartaoDoPedido(p, null, {}) === null);
  t("CD que não é número, nada", oCartaoDoPedido(p, { tipo: "teste", dc: "x" }, {}) === null);
  t("o cartão não fala do sistema", !/sistema|mestre pede|pedido|rolagem/i.test([c.verbo, c.preco, ...c.linhas].join(" ")));
}

sec("§5 «leio as intenções» rola (o defeito do catálogo)");
{
  /* \b depois de «intenç» exigia uma fronteira a meio da palavra: a
     alternativa existia e nunca casava. Achado ao escrever o pedido. */
  for (const f of ["Leio as intenções dele.", "Leio as intenções do guarda.", "leio intenções"]) {
    const v = lerAcao(f, ctx);
    t(`«${f}» → Intuição`, v && v.tipo === "teste" && v.pericia === "intuicao", J(v && v.tipo));
  }
}

console.log(`\no mestre pede: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
