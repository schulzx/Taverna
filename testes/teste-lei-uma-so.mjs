/* A LEI DA CIDADE É UMA SÓ (Fase MM, o laço da história, 11/10) — a 5.ª sessão de prova

   M1: o guarda da porta de Casa da Fonte cobrou "Salvo-conduto. Selo e
   nome" (a lei da porta, `LEI_DA_PORTA`, lida da ficha da cidade). M4: o
   herói perguntou ao taverneiro "o que eu preciso saber da lei daqui para
   não acabar na cadeia?" e ouviu "os mordomos do cântaro… mantenha seu
   juramento, e nada lhe cobram" — a regra do MUNDO do Léxico ("A LEI DESTE
   MUNDO: Todo juramento tem peso"), dita como lei da cidade; o salvo-conduto
   só voltou como garrancho na parede (mente/mm11-sessao-5.md, coerência 8).
   A resposta da ficha à pergunta pela lei dizia só QUEM a guarda.

   O que esta suíte prova (cidade-por-dentro.js, abertura.js, lexico.js):
     1. a sessão reconstruída — a frase do J4 em 24 campanhas de verdade: a
        resposta da pauta à pergunta pela lei traz a MESMA regra que a
        abertura cobrou à porta (era 0 de 24);
     2. quem fala dela lê do mesmo campo: a abertura, a pergunta pela lei e
        a pergunta pela porta leem `leiDaCidade` (a tabela LEI_DA_CIDADE);
     3. o Léxico chama à regra do mundo REGRA, não lei, e o bloco fixo não
        cresce;
     4. lixo.

   FALHA em HEAD (v9.400): a resposta à lei não traz a regra da porta, e o
   Léxico chama "A LEI DESTE MUNDO" à regra do mundo. */

const C = await import("../src/cidade-por-dentro.js");
const AB = await import("../src/abertura.js");
const SG = await import("../src/saga.js");
const R = await import("../src/regiao.js");
const L = await import("../src/lexico.js");
const { ESTRUTURAS } = await import("../src/historia.js");
const { moldePorId } = await import("../src/moldes.js");
const { sementeDe, generoDe } = await import("./medir-regiao.mjs");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);

const J4 = "Quanto custa um quarto por uma noite? E me diz uma coisa, taverneiro: quem manda nesta cidade, e o que eu preciso saber da lei daqui para não acabar na cadeia?";

sec("1. a sessão reconstruída: a pergunta pela lei responde com a lei da porta");
{
  let comPorta = 0, casa = 0, n = 0;
  for (let i = 0; i < 24; i++) {
    const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
    let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
    if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
    const ab = tenta(() => AB.abrirAbertura({ semente, mapa, cidade: mapa.cidades[0].nome, espinha: esp, estrutura, genero, molde, nivel: 1, dia: 1 }), null);
    if (!ab || !ab.abertura.porta) continue;
    n++;
    const cidade = mapa.cidades[0];
    const fc = C.fichaParaPauta(cidade, { semente, mapa, genero, molde, dia: 1, minuto: 485, frase: J4 });
    const lei = fc.pergunta.find((l) => /^quem guarda a lei/.test(l)) || "";
    if (lei.includes(ab.abertura.porta)) comPorta++;
    const pedido = AB.pedidoDaAbertura(ab.abertura, {});
    if (pedido.includes(ab.abertura.porta)) casa++;
  }
  console.log(`      aberturas com regra à porta: ${n} · a resposta à lei traz a mesma regra: ${comPorta} de ${n}`);
  t("há aberturas com a lei da porta (a sessão tinha)", n >= 12, `${n}`);
  t("a abertura cobra a regra à porta (LEI_DA_PORTA)", casa === n);
  t(`a resposta à pergunta pela lei traz a mesma regra em ${n} de ${n}`, comPorta === n, `${comPorta}`);
}

sec("2. um campo só");
{
  const cidade = { nome: "Casa da Fonte", porte: "capital", regiao: "Campos Verdes", x: 10, y: 10 };
  const ctx = { semente: "s5", mapa: { cidades: [cidade] } };
  const f = C.fichaDaCidade(cidade, ctx);
  const l = C.leiDaCidade(f);
  t("leiDaCidade lê a regra da porta e quem a guarda", l.porta === f.reconhecimento && l.quem === f.instituicoes.lei && !!l.porta && !!l.quem);
  const lei = C.fichaParaPauta(cidade, { ...ctx, frase: "o que diz a lei daqui?" }).pergunta[0] || "";
  t("a pergunta pela lei: quem a guarda e a regra da porta", lei === C.LEI_DA_CIDADE.lei.replace("{quem}", l.quem).replace("{porta}", l.porta), lei);
  const porta = C.fichaParaPauta(cidade, { ...ctx, frase: "preciso de salvo-conduto para entrar?" }).pergunta[0] || "";
  t("a pergunta pela porta: a mesma regra, dita como a lei daqui", porta === C.LEI_DA_CIDADE.porta.replace("{porta}", l.porta), porta);
  t("a abertura lê do mesmo sítio (abertura.js usa leiDaCidade)", /leiDaCidade\(/.test((await import("node:fs")).readFileSync(new URL("../src/abertura.js", import.meta.url), "utf8")));
  const aldeia = { nome: "Vau", porte: "aldeia", regiao: "Campos Verdes", x: 1, y: 1 };
  const fa = C.fichaParaPauta(aldeia, { semente: "s5", mapa: { cidades: [aldeia] }, frase: "qual a lei daqui?" }).pergunta[0] || "";
  t("na aldeia sem papel, a lei diz isso mesmo (nenhum: todos se conhecem)", /quem guarda a lei/.test(fa) && /à porta: nenhum/.test(fa), fa);
}

sec("3. o Léxico: a regra do mundo não é lei de cidade");
{
  const lex = { gerado: true, aLei: "Todo juramento tem peso: cada promessa quebrada arranca um fio do tecido do mundo.", chamado: { guarda: "os mordomos" } };
  const bloco = L.lexicoPrompt(lex);
  t("o bloco fixo diz A REGRA DO MUNDO", bloco.includes(`${L.ROTULO_DA_REGRA}: Todo juramento`));
  t("e já não diz \"A LEI DESTE MUNDO\"", !/A LEI DESTE MUNDO/.test(bloco));
  t("o rótulo é mais curto que o de antes (o bloco fixo não cresce)", L.ROTULO_DA_REGRA.length <= "A LEI DESTE MUNDO".length);
}

sec("4. lixo");
{
  for (const lixo of [null, undefined, 3, "x", {}, { instituicoes: null }, { reconhecimento: 7 }]) {
    t(`leiDaCidade(${J(lixo)}) não estoura e dá vazio`, J(tenta(() => C.leiDaCidade(lixo), null)) === J({ porta: "", quem: "" }));
  }
}

console.log(`\na lei é uma só: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
