/* teste-decretos-bando.mjs (29/10, trilha B) — o bando tem gênero, e o artigo sai dele

   O DEFEITO, achado pela trilha A no «nA» (diário, 2feef9e): os decretos
   dizem «A ${bando}», «a ${bando}», «pela ${bando}» e «líder da ${bando}»,
   e `decretos.js` sorteia o nome entre cinco — um deles masculino. Uma vez
   em cada cinco o Narrador lia «A Bando do Javali inteira morreu».

   O CONSERTO mora na tabela: `BANDOS` leva o gênero de cada nome, e
   `CONCORDANCIA_DO_BANDO` as palavras que concordam com ele (o artigo e os
   particípios que os quatro envelopes e as mensagens do App usam). A peça
   `ditosDoBando(bando)` lê o gênero pela PRIMEIRA palavra do nome — o save
   antigo só guardou a string, e tem de ler certo também.

   O QUE ESTA SUÍTE PROVA: o artigo de cada um dos 50 nomes possíveis, a
   contração com a peça de lugar.js (que é por onde os envelopes encaixam
   preposições), o save antigo, o lixo, e que o sorteio não mudou — a mesma
   semente dá o mesmo grupo de antes, letra a letra (o gênero não gasta
   sorte). Antes do conserto ela cai no import (`ditosDoBando` não existia). */
import { BANDOS, CONCORDANCIA_DO_BANDO, ditosDoBando, gerarGrupoAventureiros } from "../src/decretos.js";
import { contrair } from "../src/lugar.js";
import { rng, hashSemente } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

sec("1. A TABELA");
{
  t("cinco nomes, cada um com gênero f ou m", BANDOS.length === 5 && BANDOS.every((b) => typeof b.nome === "string" && b.nome && (b.genero === "f" || b.genero === "m")));
  t("o «Bando» é masculino, e só ele", BANDOS.filter((b) => b.genero === "m").map((b) => b.nome).join() === "Bando");
  const chaves = (g) => Object.keys(CONCORDANCIA_DO_BANDO[g] || {}).sort().join();
  t("os dois gêneros dizem as mesmas palavras", chaves("f") && chaves("f") === chaves("m"), chaves("f") + " / " + chaves("m"));
  t("o artigo é o da gramática", CONCORDANCIA_DO_BANDO.f.o === "a" && CONCORDANCIA_DO_BANDO.m.o === "o");
}

sec("2. OS 50 NOMES QUE O SORTEIO DÁ");
{
  /* os adjetivos não importam ao gênero — o nome manda. Pego-os das saídas
     reais do gerador, para não copiar a tabela de dentro do módulo. */
  const adjs = new Set();
  for (let i = 0; i < 400; i++) {
    const g = gerarGrupoAventureiros("Fantasia medieval", 5, rng(hashSemente("adj-" + i)));
    const b = BANDOS.find((x) => g.bando.startsWith(x.nome + " "));
    adjs.add(g.bando.slice(b.nome.length + 1));
  }
  t("o gerador usa os dez complementos", adjs.size === 10, String(adjs.size));
  let certos = 0, total = 0;
  const errados = [];
  for (const b of BANDOS) for (const a of adjs) {
    total++;
    const nome = `${b.nome} ${a}`;
    const d = ditosDoBando(nome);
    const art = b.genero === "m" ? "o" : "a";
    if (d.genero === b.genero && d.oNome === `${art} ${nome}` && d.ONome === `${art.toUpperCase()} ${nome}`) certos++;
    else errados.push(nome + " → " + d.ONome);
  }
  t(`os ${total} nomes leem com o artigo do seu gênero`, certos === total && total === 50, errados.slice(0, 3).join(" · "));
  const bj = ditosDoBando("Bando do Javali");
  t("«O Bando do Javali inteiro morreu», não «A Bando … inteira»", `${bj.ONome} ${bj.inteiro} morreu` === "O Bando do Javali inteiro morreu", bj.ONome);
  const cz = ditosDoBando("Companhia das Cinzas");
  t("«A Companhia das Cinzas inteira morreu» continua como era", `${cz.ONome} ${cz.inteiro} morreu` === "A Companhia das Cinzas inteira morreu");
  t("«voltou vivo, envergonhado» / «voltou viva, envergonhada»",
    `${bj.vivo}, ${bj.envergonhado}` === "vivo, envergonhado" && `${cz.vivo}, ${cz.envergonhado}` === "viva, envergonhada");
  t("«liderado por» / «liderada por»", bj.liderado === "liderado" && cz.liderado === "liderada");
  t("«Ordem Menor» é feminina pela primeira palavra", ditosDoBando("Ordem Menor do Sal").oNome === "a Ordem Menor do Sal");
}

sec("3. A CONTRAÇÃO — a peça de lugar.js encaixa a preposição");
{
  const bj = ditosDoBando("Bando do Corvo"), lg = ditosDoBando("Liga da Aurora");
  t("«pelo Bando» / «pela Liga»", contrair("por " + bj.oNome) === "pelo Bando do Corvo" && contrair("por " + lg.oNome) === "pela Liga da Aurora", contrair("por " + bj.oNome));
  t("«líder do Bando» / «líder da Liga»", contrair("líder de " + bj.oNome) === "líder do Bando do Corvo" && contrair("líder de " + lg.oNome) === "líder da Liga da Aurora");
}

sec("4. O SAVE ANTIGO E O LIXO");
{
  t("a string que o save guardou basta (sem campo novo)", ditosDoBando("Bando do Carvalho").genero === "m" && ditosDoBando("Irmandade da Estrada").genero === "f");
  t("espaço em volta não engana", ditosDoBando("  Bando do Sal  ").oNome === "o Bando do Sal");
  t("nome que a tabela não conhece fica no feminino (o texto de sempre)", ditosDoBando("Guarda do Rio").oNome === "a Guarda do Rio" && ditosDoBando("Bandoleiros").genero === "f");
  for (const lixo of [null, undefined, "", "   ", {}, 7, []]) {
    let d = null, erro = "";
    try { d = ditosDoBando(lixo); } catch (e) { erro = e.message; }
    t(`lixo (${JSON.stringify(lixo)}) dá «o bando», sem estourar`, d && d.oNome === "o bando" && d.ONome === "O bando" && d.genero === "m", erro || (d && d.ONome));
  }
  const d = ditosDoBando("Bando do Javali");
  d.o = "x";
  t("o que sai é cópia: mexer nele não muda a tabela", CONCORDANCIA_DO_BANDO.m.o === "o" && ditosDoBando("Bando do Javali").o === "o");
}

sec("5. O SORTEIO NÃO MUDOU");
{
  /* medido em HEAD (3f2f4b4) antes do conserto: o gênero não pode gastar
     sorte, senão todo grupo semeado do jogo muda de nome e de gente. */
  const ANTES = ["Liga do Carvalho|Fendrel da Torre|3|6", "Ordem Menor do Javali|Cora o Andarilho|3|3", "Bando do Corvo|Elowen Mão-Torta|4|5", "Ordem Menor do Carvalho|Bjorn Voz-Grave|2|5", "Irmandade da Estrada|Joric Barba-Ruiva|2|4", "Ordem Menor do Javali|Falk|3|7", "Liga dos Desalmados|Hilda Sem-Medo|4|3", "Irmandade da Estrada|Eamon|2|6", "Bando do Carvalho|Magnus Sombravinda|2|7", "Ordem Menor das Três Luas|Isen|2|4", "Irmandade das Três Luas|Jarl o Manco|2|4", "Companhia da Estrada|Neirin|2|3"];
  const agora = [];
  for (let i = 0; i < 12; i++) {
    const g = gerarGrupoAventureiros("Fantasia medieval", 5, rng(hashSemente("bando-" + i)));
    agora.push(`${g.bando}|${g.lider}|${g.membros.length}|${g.forca}`);
  }
  const iguais = agora.filter((x, i) => x === ANTES[i]).length;
  t("12 grupos semeados, letra a letra iguais aos de antes", iguais === 12, `${iguais}/12 · ${agora.find((x, i) => x !== ANTES[i]) || ""}`);
  t("o nome continua uma string (o save não muda de forma)", typeof gerarGrupoAventureiros("Fantasia medieval", 3, rng(1)).bando === "string");
  let m = 0;
  for (let i = 0; i < 1000; i++) if (ditosDoBando(gerarGrupoAventureiros("Fantasia medieval", 5, rng(hashSemente("conta-" + i))).bando).genero === "m") m++;
  t("cerca de um em cada cinco sai masculino (era quem lia «A Bando»)", m > 150 && m < 250, String(m));
}

console.log(`\n${ok} ok, ${mal} mal`);
process.exit(mal ? 1 : 0);
