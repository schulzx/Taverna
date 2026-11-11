/* O MESTRE PEDE O DADO (04/11/2026) — src/motor/o-mestre-pede.js

   «precisamos de uma forma de o sistema acionar o dado mais vezes». O
   Mestre pede uma FRASE que o catálogo já julga; esta suíte prova:
   §1 cada frase pedida é um teste do catálogo (lerAcao), com perícia e CD;
   §2 quando pede: a conversa viva ganha da sala; nada em luta, estrada,
      masmorra, ou com a mesa ocupada;
   §3 não pede duas vezes a mesma coisa no mesmo dia; no dia seguinte, sim;
   §4 o cartão: o dado e o número antes do toque, «Rolar» e «Agora não»;
      sem teste não há cartão (o lugar já revirado, a mesa recusa);
   §5 o defeito que esta etapa achou: «leio as intenções» nunca rolava;
   §6 MC6 (11/11): o Mestre pede onde há o que achar — em 1000 lugares, a
      oferta em lugar vazio ≤ 1/N e nunca duas seguidas; e a oferta tem
      chave própria: depois de uma oferta vazia, «procuro», «examino o
      corte» e «lembro» ainda rolam (a prova de md/queimado.mjs, da
      planta §1.1, invertida). */
import { O_MESTRE_PEDE, aChaveDoPedido, oQueOMestrePede, oCartaoDoPedido, oVereditoDaOferta } from "../src/motor/o-mestre-pede.js";
import { lerAcao, registrarTentativa, garantirTentativas } from "../src/desafios.js";

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

sec("§6 o Mestre pede onde há o que achar (MC6)");
{
  const N = O_MESTRE_PEDE.vazioUmEm;
  t("a uma-em-N é um número da tabela, maior que 1", Number.isInteger(N) && N > 1);
  /* mil lugares vazios, um atrás do outro, como a mesa os vive: o que o
     Mestre pede entra na lista de pedidos, e o dia corre de dez em dez */
  /* «seguidas» é no mesmo dia (o motor não vê os sítios onde não pediu) */
  let ja = [], ofertas = 0, seguidas = 0, ultimaVazia = null;
  for (let i = 0; i < 1000; i++) {
    const p = oQueOMestrePede({ onde: `Sítio ${i}`, dia: 1 + Math.floor(i / 10), jaPedidos: ja, haOQueAchar: false, semente: "MC6|mil" });
    if (p) {
      ofertas++;
      if (p.vazia && ultimaVazia === 1 + Math.floor(i / 10)) seguidas++;
      if (p.vazia) ultimaVazia = 1 + Math.floor(i / 10);
      ja = [...ja, p.chave].slice(-60);
    }
  }
  t(`em 1000 lugares vazios, a oferta vem ≤ 1 em ${N} (${ofertas})`, ofertas <= 1000 / N && ofertas > 0);
  t("e nunca duas vazias seguidas no mesmo dia", seguidas === 0, `${seguidas}`);
  t("e um mundo sem nada para achar não cala a oferta para sempre (uma vazia por dia, no máximo)", ofertas >= 50 && ofertas <= 100, `${ofertas}`);
  t("a oferta vazia vem marcada (a chave diz que foi vazia)", (() => { for (let i = 0; i < 200; i++) { const p = oQueOMestrePede({ onde: `S${i}`, dia: 1, haOQueAchar: false, semente: "x" }); if (p) return p.vazia === true && p.chave.endsWith(`|${O_MESTRE_PEDE.marcaVazia}`); } return false; })());
  /* onde há o que achar, pede sempre — a oferta é o Mestre a dizer «rola» */
  let cheias = 0;
  for (let i = 0; i < 1000; i++) if (oQueOMestrePede({ onde: `Sítio ${i}`, dia: 1, haOQueAchar: true, semente: "MC6|mil" })) cheias++;
  t("onde há o que achar (um achável, o segredo do passo), pede sempre", cheias === 1000);
  t("quem não diz se há (null) tem a régua de antes: pede", !!oQueOMestrePede({ onde: "Termas", dia: 1 }) && !!oQueOMestrePede({ onde: "Termas", dia: 1, haOQueAchar: null }));
  /* a sorte é semeada: pedir de novo não é rolar de novo */
  const a = Array.from({ length: 40 }, (_, i) => !!oQueOMestrePede({ onde: `Rua ${i}`, dia: 2, haOQueAchar: false, semente: "s1" }));
  const b = Array.from({ length: 40 }, (_, i) => !!oQueOMestrePede({ onde: `Rua ${i}`, dia: 2, haOQueAchar: false, semente: "s1" }));
  t("o mesmo sítio, no mesmo dia, no mesmo mundo: a mesma resposta", J(a) === J(b) && a.some(Boolean) && a.some((x) => !x));
  t("a sorte dada manda (a suíte): 0 pede, 0,99 não", !!oQueOMestrePede({ onde: "X", dia: 1, haOQueAchar: false, sorte: () => 0 }) && !oQueOMestrePede({ onde: "X", dia: 1, haOQueAchar: false, sorte: () => 0.99 }));
  const v1 = oQueOMestrePede({ onde: "X", dia: 1, haOQueAchar: false, sorte: () => 0 });
  t("depois de uma vazia, o mesmo sítio não volta a ser pedido nesse dia", oQueOMestrePede({ onde: "X", dia: 1, haOQueAchar: true, jaPedidos: [v1.chave] }) === null);
  t("depois de uma vazia, a seguinte vazia não vem — mas a que tem o que achar, sim", oQueOMestrePede({ onde: "Y", dia: 1, haOQueAchar: false, sorte: () => 0, jaPedidos: [v1.chave] }) === null && !!oQueOMestrePede({ onde: "Y", dia: 1, haOQueAchar: true, jaPedidos: [v1.chave] }));
  t("no dia seguinte, a vazia volta a poder vir", !!oQueOMestrePede({ onde: "Y", dia: 2, haOQueAchar: false, sorte: () => 0, jaPedidos: [v1.chave] }));
  t("a conversa viva continua a ganhar da sala", oQueOMestrePede({ onde: "Termas", falouCom: "Gareth", dia: 2, haOQueAchar: false, sorte: () => 0.99 }).id === "intencao");
}

sec("§6b a oferta não come o dado do jogador (a prova de md/queimado.mjs, invertida)");
{
  const LARGO = "Largo do Cereal";
  const ctxL = (tentativas) => ({ ...ctx, lugar: LARGO, tentativas, achadoDe: () => null });
  const vO = lerAcao(O_MESTRE_PEDE.pedidos.find((p) => p.id === "chegada").frase(), ctxL({}));
  t("a frase da oferta é uma busca do catálogo, que fecha depois de passar sem achado", vO && vO.tipo === "teste" && vO.fechaDepois === true, J(vO && { tipo: vO.tipo, chave: vO.chave }));
  const daOferta = oVereditoDaOferta(vO);
  t("a oferta tem chave própria no livro de tentativas", daOferta.chave !== vO.chave && daOferta.chave.endsWith(`|${O_MESTRE_PEDE.marcaDaOferta}`) && daOferta.oferta === true);
  t("e só muda a chave (o resto do veredito é o mesmo)", J({ ...daOferta, chave: vO.chave, oferta: undefined }) === J({ ...vO, oferta: undefined }));
  t("aplicada duas vezes, é a mesma chave", oVereditoDaOferta(daOferta).chave === daOferta.chave);
  t("o que não é teste passa como veio", oVereditoDaOferta(null) === null && oVereditoDaOferta({ tipo: "livre" }).tipo === "livre");
  /* a oferta passou e não achou: o lugar fica limpo — com a chave DELA */
  const depois = registrarTentativa(garantirTentativas({}), daOferta.chave, { resultado: "sucesso", dia: 1, limpo: true });
  for (const f of ["Procuro o que o Largo do Cereal esconde.", "Examino o corte na carcaça.", "O que eu sei sobre o Largo do Cereal?"]) {
    const v = lerAcao(f, ctxL(depois));
    t(`depois da oferta vazia, «${f}» ainda rola`, v && v.tipo === "teste", J(v && v.tipo));
  }
  /* o defeito, para a catraca saber o que trocou: com a chave da busca, a
     oferta queimava o «procuro» do jogador */
  const queimado = registrarTentativa(garantirTentativas({}), vO.chave, { resultado: "sucesso", dia: 1, limpo: true });
  const v = lerAcao("Procuro o que o Largo do Cereal esconde.", ctxL(queimado));
  t("(o defeito: com a chave da busca, «procuro» dava «já revirado»)", v && v.tipo === "vasculhado", J(v && v.tipo));
}

console.log(`\no mestre pede: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
