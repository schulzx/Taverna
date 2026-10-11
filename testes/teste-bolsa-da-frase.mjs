/* ============================================================
   A BOLSA DA FRASE (11/10, MM11 · 5.ª sessão, M9/M10 e M35)

   As frases são as da sessão, tiradas do registo das chamadas
   (registo-s5.jsonl, chamadas 21, 23 e 73 do Narrador):
     J9  — "quero comprar tochas, uma corda e rações … Quanto custa tudo?"
           a pauta foi sem número e o Mestre inventou "dez cunhas";
     J10 — "Pago as onze cunhas pela corda boa, as tochas e as rações.
           Anão, … viste passar…?" o oráculo ganhou o turno e a compra
           nunca fechou: o embrulho chegou e as cunhas não saíram;
     J35 — "Tiro da bolsa duas rações e o odre de água e entrego a Edric"
           `suprimentos` 10 → 10, e Edric não ficou a dever nada.
   ============================================================ */
import fs from "node:fs";
import {
  compraNaFrase, falaDaCompra, envelopeDaCompra, vetoDaCompra, balcaoParaPauta,
  dadivaNaFrase, falaDaDadiva, envelopeDaDadiva, vetoDaDadiva, mochilaDepoisDaDadiva,
  MANTIMENTO_NA_FRASE, QUANTIDADE_DA_FRASE, O_QUE_SE_DA, MARCA_DA_DADIVA,
} from "../src/bolsa-da-frase.js";
import { balcaoDeMantimentos } from "../src/mercado.js";
import { oQueFaltaDebitar } from "../src/cobranca.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const J9 = "Deixo o mural. Hakon, chega de resmungar. Vamos ao mercado: quero comprar tochas, uma corda e rações para uns três dias de estrada. Quanto custa tudo?";
const J10 = "Pago as onze cunhas pela corda boa, as tochas e as rações. Anão, uma pergunta: viste passar por aqui alguém que procurasse um tal de Edric, ou ouviste falar da Ponte Lenta?";
const J35 = "Tiro da bolsa duas rações e o odre de água e entrego a Edric sem exigir nada. \"Come. Depois me diz que nome o moribundo te deu, e de quem era.\"";

const CIDADE = { nome: "Casa da Fonte", porte: "cidade" };
const BALCAO = balcaoDeMantimentos(CIDADE, { dia: 1 });
const preco = (id) => BALCAO.find((b) => b.id === id).preco;

console.log("\n[as tabelas]");
ok(MANTIMENTO_NA_FRASE.map((m) => m.id).join() === "racoes,agua,tochas,kit", "as quatro prateleiras do balcão, na ordem dele");
ok(QUANTIDADE_DA_FRASE.pluralSemNumero > 1 && QUANTIDADE_DA_FRASE.teto >= QUANTIDADE_DA_FRASE.pluralSemNumero, "plural sem número pede mais de um, e há teto");
ok(!O_QUE_SE_DA.kit && O_QUE_SE_DA.racoes.cede === "a fome", "o kit não se reparte; a ração mata a fome");
ok(MARCA_DA_DADIVA.vinculoDoCompanheiro > 0, "o companheiro ganha vínculo");

console.log("\n[J9: perguntar o preço não compra — e a pauta leva o número]");
ok(compraNaFrase(J9, { balcao: BALCAO, bolsa: 100 }) === null, "a pergunta de preço não fecha compra nenhuma");
const bc = balcaoParaPauta(J9, { balcao: BALCAO });
ok(bc.pergunta.length === 1, "o balcão responde à pergunta");
const conta = 3 * preco("tochas") + preco("kit") + 3 * preco("racoes");
ok(bc.pergunta[0].includes(`◉ ${conta}`), `com a conta do que a frase pediu (◉ ${conta}): ${bc.pergunta[0].slice(0, 90)}…`);
ok(/corda/.test(bc.pergunta[0]), "e diz que a corda é a do kit");
ok(balcaoParaPauta("quanto custa uma adaga?", { balcao: BALCAO }).pergunta.length === 0, "adaga não é do balcão (é das bancas)");
ok(balcaoParaPauta("compro rações", { balcao: BALCAO }).pergunta.length === 0, "sem pergunta, o balcão não fala");

console.log("\n[J10: a compra com a quantia dita]");
const c15 = compraNaFrase(J10, { balcao: BALCAO, bolsa: 15, temKit: false });
ok(c15 && !c15.fecha && c15.porque === "sem_fundos", "com ◉ 15 na bolsa e a corda (o kit) no pedido, não fecha");
ok(c15.declarado === 11, "a quantia dita, onze por extenso, é lida");
ok(vetoDaCompra(c15).length === 1 && /não fechou/.test(vetoDaCompra(c15)[0]), "e o veto diz ao Narrador que não entrega");
ok(envelopeDaCompra(c15) === "", "sem envelope de compra");
const cRica = compraNaFrase(J10, { balcao: BALCAO, bolsa: 200, temKit: false });
ok(cRica && !cRica.fecha && cRica.porque === "pouco", "com dinheiro, mas onze pelo que custa mais: não fecha");
ok(/◉ 11 não paga/.test(falaDaCompra(cRica)), "a linha do jogador diz o preço certo");
const cKit = compraNaFrase(J10, { balcao: BALCAO.filter((b) => b.id !== "kit"), bolsa: 200, temKit: true });
const custoSemKit = 3 * preco("tochas") + 3 * preco("racoes");
ok(cKit && cKit.jaTem.includes("kit") && cKit.total === custoSemKit, `quem já tem o kit só paga tochas e rações (◉ ${custoSemKit})`);
ok(cKit.fecha === (11 >= custoSemKit), "e fecha se as onze pagam");

console.log("\n[a compra que fecha]");
const c = compraNaFrase("Compro rações para três dias e duas tochas.", { balcao: BALCAO, bolsa: 50 });
ok(c && c.fecha && c.total === 3 * preco("racoes") + 2 * preco("tochas"), "três dias de ração e duas tochas, ao preço do balcão");
ok(/JÁ REGISTRADA PELO SISTEMA/.test(envelopeDaCompra(c)), "o envelope é o da compra registada");
const deb = oQueFaltaDebitar(`Você paga ${c.total} moedas ao merceeiro.`, {}, { bolsa: 50, envelopes: envelopeDaCompra(c) });
ok(!deb.temAlgo, "e a cobrança reconhece-o: a prosa que diz o pagamento não cobra duas vezes");
ok(/^🛒/.test(falaDaCompra(c)) && falaDaCompra(c).includes(`restam ◉ ${50 - c.total}`), "o recibo na tela");

console.log("\n[o que não compra]");
for (const f of ["pago a bebida e saio", "se eu comprar rações, chegam?", "levo a tocha acesa à frente", "não compro rações hoje", "conto as tochas que tenho"]) {
  ok(compraNaFrase(f, { balcao: BALCAO, bolsa: 50 }) === null, `nada: "${f}"`);
}
const banca = compraNaFrase("Compro a espada longa da ferraria.", { balcao: BALCAO, bolsa: 500 });
ok(banca && !banca.fecha && banca.porque === "so_banca" && vetoDaCompra(banca).length === 1, "a espada é das bancas: não fecha pela frase, e o Narrador não a entrega");

console.log("\n[J35: a dádiva]");
const GENTE = [{ nome: "Hakon Guarda-Portão", companheiro: true }, { nome: "Edric" }];
const SUP = { racoes: 10, agua: 5, tochas: 5, kit: false };
const d = dadivaNaFrase(J35, { pessoas: GENTE, suprimentos: SUP });
ok(d && d.da && d.quem === "Edric" && !d.companheiro, "a Edric, que não é do grupo");
ok(d.itens.find((x) => x.id === "racoes").quantos === 2 && d.itens.find((x) => x.id === "agua").quantos === 1, "duas rações e um odre");
const depois = mochilaDepoisDaDadiva(SUP, d);
ok(depois.racoes === 8 && depois.agua === 4 && SUP.racoes === 10, "a mochila desce 10 → 8 e 5 → 4 (e a de antes fica intacta)");
ok(/a fome e a sede cedem/.test(envelopeDaDadiva(d)) && /dever/.test(envelopeDaDadiva(d)), "o efeito: a fome, a sede e a dívida");
ok(/restam 8 rações/.test(falaDaDadiva(d, depois)), "a linha do jogador");
const pobre = dadivaNaFrase(J35, { pessoas: GENTE, suprimentos: { racoes: 1, agua: 0 } });
ok(pobre && !pobre.da && vetoDaDadiva(pobre).length === 1, "sem rações bastantes, não dá — e o Narrador não as põe na mão dele");
const aHakon = dadivaNaFrase("Dou uma ração ao Hakon.", { pessoas: GENTE, suprimentos: SUP });
ok(aHakon && aHakon.companheiro && aHakon.quem === "Hakon Guarda-Portão", "ao companheiro também (é vínculo)");
const lhe = dadivaNaFrase("Estendo-lhe duas tochas.", { pessoas: GENTE, suprimentos: SUP });
ok(lhe && lhe.quem === "Edric", "o pronome vai a quem não é do grupo, se é só um");
ok(dadivaNaFrase("Dou um passo atrás.", { pessoas: GENTE, suprimentos: SUP }) === null, "dar um passo não é dádiva");
ok(dadivaNaFrase("Entrego a carta a Edric.", { pessoas: GENTE, suprimentos: SUP }) === null, "a carta não é mantimento");

console.log("\n[a fiação no App]");
const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const ag = app.indexOf("const agirInterno = (texto) => {");
const iBolsa = app.indexOf("registarABolsaDaFrase(acao);", ag);
const iSinais = app.indexOf("const sinais = sinaisDoTurno(acao);", ag);
ok(ag > 0 && iBolsa > ag && iBolsa < iSinais, "a bolsa da frase corre antes do despachante (antes de o oráculo ganhar o turno)");
ok(/calou\("a bolsa da frase"/.test(app) && /calou\("a compra da frase"/.test(app) && /calou\("a dádiva da frase"/.test(app), "toda a fiação cala");
ok(/porNaPauta\(p, "naoPode", naoPodeDoTurnoRef\.current/.test(app), "o veto viaja na secção naoPode da pauta");
ok(/balcaoParaPauta\(frase/.test(app), "o preço do balcão entra na ficha do mercado");
ok(/meDeve: !!n\.meDeve/.test(app), "quem recebeu fica a dever (o sinal do Intérprete acende)");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
