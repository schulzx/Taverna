/* O QUE A CENA REGISTA (03/11, a 14.ª sessão, conserto 3) — src/motor/registo-da-cena.js

   Com o Narrador ator o Cronista não lê a prosa, e a 14.ª sessão mediu o
   que saiu com ele (mente/sessao-14.md, defeito 5): a Inez e a Beatriz,
   com quem o herói falou e de quem aceitou pedidos, nunca entraram em
   `npcs`; «Encontrar Inez do Prado Baixo» ficou em falso depois de três
   conversas; o cordão que a Beatriz lhe deu não entrou no inventário.

   O que esta suíte prova:
   §1 a peça: com quem o herói falou (a `conversa` da ficha), quem entra no
      registo (gente da cena, nunca o herói, a fera, quem está no chão ou o
      grupo), o que o pedido aceite entrega; o lixo não estoura, a entrada
      não muda, a mesma entrada dá o mesmo;
   §2 a fiação no motor: no modo `ator`, `oAceitoDoCronista` com a ficha do
      turno põe a gente em `npcs` (pela mesma régua do Cronista), confere as
      missões com a conversa e põe o item na ficha; e a conversa cumpre a
      etapa `falar_com` de verdade (missoes.js);
   §3 o modo `mestre` não muda: a mesma ficha e o mesmo aceite não fazem
      nada quando o Cronista é chamado, nem no `ator` sem ficha. */
import { oQueACenaRegista, O_QUE_O_PEDIDO_ENTREGA } from "../src/motor/registo-da-cena.js";
import { aFichaDeAtor } from "../src/motor/ficha-de-ator.js";
import { oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";
import { etapaDef } from "../src/missoes.js";
import { opcoesDoPedido } from "../src/subtramas.js";

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };

const BRAM = { nome: "Bram Pedra-Alta", grupo: [{ nome: "Leonor", vinculo: 30, classe: "Engenheiro" }], inventario: [] };
const POCA = "ONDE      Na Poça da Foz, dentro de Monte da Forca\nEM CENA   Inez do Prado Baixo (atendente) · Leonor (com você) · Lobo cinzento (fera)";
const ficha = (frase, nota = POCA) => aFichaDeAtor({ frase, nota, estado: { personagem: BRAM } });
/* o aceite como o App o guarda (`aceiteDoTurnoRef`): de quem, o objeto e a fala do cartão */
const CARTAO = opcoesDoPedido({ nome: "Beatriz Sem-Pão", papel: "elo", pedido: { fala: "Leve este cordão a um templo longe daqui. Eu não posso.", objeto: "levar um cordão a um templo" } }).find((o) => o.id === "aceitou");
const ACEITE = { de: "Beatriz Sem-Pão", objeto: "levar um cordão a um templo", pede: CARTAO.pede };

sec("§1 a peça");
const T1 = ficha("Vou ao balcão e pergunto à Inez quanto custa um quarto por uma noite.");
const r1 = oQueACenaRegista({ ficha: T1, estado: { personagem: BRAM } });
t("T1: falou com a Inez (o nome que a frase diz, e ela está em cena)", r1.falou_com.includes("Inez do Prado Baixo"));
t("…e a Inez entra no registo, com o papel que a cena lhe dá", r1.pessoas.some((p) => p.nome === "Inez do Prado Baixo" && p.papel === "atendente"));
t("o herói, a fera e o grupo nunca entram no registo", !r1.pessoas.some((p) => /Bram|Lobo|Leonor/.test(p.nome)) && !oQueACenaRegista({ ficha: ficha("Digo à Leonor que partimos já."), estado: { personagem: BRAM } }).pessoas.length);
t("…mas falar com o companheiro é conversa (o `falou_com` di-lo)", oQueACenaRegista({ ficha: ficha("Digo à Leonor que partimos já."), estado: { personagem: BRAM } }).falou_com.includes("Leonor"));
t("T5: quem a frase nomeia e NÃO está em cena não é conversa nem registo", (() => { const r = oQueACenaRegista({ ficha: ficha("Pergunto a um devoto se a Inez passou por aqui hoje.", "ONDE      Em Claustro do Primeiro Prego\nEM CENA   Leonor (com você)"), estado: { personagem: BRAM } }); return !r.falou_com.length && !r.pessoas.length; })());
t("o género que o EM CENA põe no lugar do papel («(ela)») vai como género, não como ofício", (() => { const r = oQueACenaRegista({ ficha: ficha("Pergunto à Inez onde fica o templo.", "EM CENA   Inez do Prado Baixo (ela) · Leonor (com você)"), estado: { personagem: BRAM } }); const p = r.pessoas.find((x) => x.nome === "Inez do Prado Baixo"); return p && p.genero === "ela" && p.papel === ""; })());
const r10 = oQueACenaRegista({ ficha: ficha("Aceito."), aceite: ACEITE, estado: { personagem: BRAM } });
t("T10: o pedido aceite que entrega uma coisa (o cordão da Beatriz) põe-na na mão do herói", r10.itens.length === 1 && r10.itens[0].nome === "Cordão de Beatriz Sem-Pão" && r10.itens[0].descricao.includes("levar um cordão a um templo"));
t("…e não duas vezes, se já está na mochila", !oQueACenaRegista({ ficha: ficha("Aceito."), aceite: ACEITE, estado: { personagem: { ...BRAM, inventario: [{ nome: "Cordão de Beatriz Sem-Pão" }] } } }).itens.length);
t("o pedido que não entrega coisa nenhuma («parar para rezar no caminho») não põe item", !oQueACenaRegista({ ficha: T1, aceite: { de: "Inez do Prado Baixo", objeto: "parar para rezar no caminho", pede: "Prometi rezar onde ele caiu. É no caminho." }, estado: { personagem: BRAM } }).itens.length);
t("a tabela do que o pedido entrega: ids únicos, com nome e para quê", new Set(O_QUE_O_PEDIDO_ENTREGA.map((e) => e.id)).size === O_QUE_O_PEDIDO_ENTREGA.length && O_QUE_O_PEDIDO_ENTREGA.every((e) => e.de instanceof RegExp && e.nome.includes("{N}") && e.descricao.includes("{O}")));
for (const [n, e] of [["null", null], ["undefined", undefined], ["{}", {}], ["tipos errados", { ficha: 5, aceite: "x", estado: [] }], ["ficha com lixo", { ficha: { pessoas: [null, 3, {}], conversa: [null, 7, ""] }, aceite: { de: null, objeto: {} }, estado: { personagem: null } }]]) {
  let r = null, erro = null;
  try { r = oQueACenaRegista(e); } catch (x) { erro = x; }
  t(`${n}: não estoura, e não regista nada`, !erro && r && !r.pessoas.length && !r.falou_com.length && !r.itens.length);
}
const ent = congelar({ ficha: T1, aceite: ACEITE, estado: { personagem: BRAM } });
let erroCongelado = null; try { oQueACenaRegista(ent); } catch (x) { erroCongelado = x; }
t("a entrada não muda (congelada, corre)", !erroCongelado);
t("a mesma entrada dá o mesmo", JSON.stringify(oQueACenaRegista(ent)) === JSON.stringify(oQueACenaRegista(ent)));

sec("§2 a fiação no motor (oAceitoDoCronista, modo `ator`)");
const correr = (modo, fichaDoAtor, aceite) => {
  const efeitos = [], conferidas = [];
  const E = { npcs: {}, canone: {}, missoes: [], personagem: BRAM, cidadeAtual: "Monte da Forca" };
  const ctx = new Proxy({ ler: () => E, aplicar: (x) => { for (const ef of x) { efeitos.push(ef); if (ef.tipo === "npcs") E.npcs = ef.npcs; } }, pers: BRAM, narrativa: "", testeDoTurno: null, rolagem: null, modoDoNarrador: modo, fichaDoAtor, aceite,
    conferirCom: (p, o) => { conferidas.push(o); return p; } }, { get: (o, k) => (k in o ? o[k] : () => undefined) });
  const fim = oAceitoDoCronista({}, [], {}, ctx);
  return { fim, efeitos, conferidas, E };
};
const ator = correr("ator", T1, ACEITE);
t("a Inez entra em `npcs` pela secção da gente (a régua do Cronista: o registo assinado pelo código)", ator.E.npcs["Inez do Prado Baixo"] && ator.efeitos.some((e) => e.tipo === "npcs") && ator.fim.tocouElenco);
t("as missões conferem-se com a conversa do turno (a porta `conferirCom`, com `falouCom`)", ator.conferidas.some((o) => o && Array.isArray(o.falouCom) && o.falouCom.includes("Inez do Prado Baixo")));
t("o cordão entra no inventário da ficha que o turno devolve, e a tela diz «Item obtido»", (ator.fim.p.inventario || []).some((i) => i.nome === "Cordão de Beatriz Sem-Pão") && ator.efeitos.some((e) => e.tipo === "ficha") && ator.fim.msgs.includes("Item obtido: Cordão de Beatriz Sem-Pão"));
t("o herói que entra não é mutado (a ficha nova é outra)", BRAM.inventario.length === 0);
const etapa = { tipo: "falar_com", alvo: "Inez do Prado Baixo", onde: "Poça da Foz, em Monte da Forca" };
const mundo = { cidadeAtual: "Monte da Forca", lugarAtual: { nome: "Poça da Foz", cidade: "Monte da Forca" }, npcs: {} };
t("«Encontrar Inez do Prado Baixo»: em falso sem a conversa (o que a sessão viu), cumprido com a lista que o sistema dá", etapaDef("falar_com").ver(etapa, { ...mundo, soPeloFato: { pessoas: ["Inez do Prado Baixo"] } }) === false && etapaDef("falar_com").ver(etapa, { ...mundo, soPeloFato: { pessoas: ["Inez do Prado Baixo"] }, falouCom: ator.conferidas.find((o) => o && o.falouCom).falouCom }) === true);

sec("§3 o modo `mestre` não muda");
/* o que esta fiação escreve: a gente e a ficha (as promessas correm sempre, e são do Cronista) */
const doRegisto = (r) => r.efeitos.filter((e) => e.tipo === "npcs" || e.tipo === "ficha");
const mestre = correr("mestre", T1, ACEITE);
t("no `mestre` a mesma ficha e o mesmo aceite não registam, não conferem e não dão item (quem o faz é o Cronista)", !doRegisto(mestre).length && !mestre.conferidas.length && mestre.fim.p === BRAM && !mestre.fim.msgs.length);
const semModo = correr(undefined, T1, ACEITE);
/* MOVIDA (13/11, NE7), com o motivo: o padrão virou o «boca» — o Cronista
   não lê, e é a ficha que regista. A intenção fica: o modo ausente é o
   padrão, e faz exatamente o que o padrão dito faz. */
const boca = correr("boca", T1, ACEITE);
t("o modo ausente é o padrão (o `boca`, NE7): regista pela ficha, como o `boca` dito", doRegisto(semModo).length > 0 && semModo.conferidas.length > 0 && JSON.stringify(doRegisto(semModo)) === JSON.stringify(doRegisto(boca)) && JSON.stringify(semModo.conferidas) === JSON.stringify(boca.conferidas));
const semFicha = correr("ator", null, null);
t("no `ator` sem ficha, nada (o turno de antes desta fiação)", !doRegisto(semFicha).length && !semFicha.conferidas.length && semFicha.fim.p === BRAM);

console.log(`\nregisto da cena: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
