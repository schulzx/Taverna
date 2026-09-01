/* teste-resolver.mjs (v9.57) — "quero ir para a cidade onde o rei mora".
   O resolver acha, ou pergunta. O que ele nunca faz é chutar.        */
import { resolverLugar, perguntaDeAmbiguidade, perguntaDeVaguidade, perguntaDeVazio, respostaDaEscolha, RESOLVER_PROMPT } from "../src/resolver.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId, MOLDES } from "../src/moldes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* um mundo pequeno e explícito: cada cidade responde por uma coisa */
const mapa = { cidades: [
  { nome: "Elandor", porte: "capital", tipo: "capital", populacao: 42000, regiao: "Vale Alto", continente: "Kor", bioma: "planicie", x: 50, y: 20, descoberta: true, relacao: "aliada" },
  { nome: "Baixa das Velas", porte: "porto", tipo: "porto", populacao: 9000, regiao: "Costa Cinza", continente: "Kor", bioma: "costa", x: 20, y: 60, descoberta: true, relacao: "neutra", pisada: true },
  { nome: "Pedra Cinzenta", porte: "fortaleza", tipo: "fortaleza", populacao: 900, regiao: "Vale Alto", continente: "Kor", bioma: "montanha", x: 80, y: 30, descoberta: true, relacao: "inimiga" },
  { nome: "Vau Pequeno", porte: "aldeia", tipo: "aldeia", populacao: 210, regiao: "Costa Cinza", continente: "Kor", bioma: "floresta", x: 45, y: 80, descoberta: true, relacao: "neutra", sede: true },
  { nome: "Cidade Oculta", porte: "cidade", tipo: "cidade", populacao: 5000, regiao: "Ermo", continente: "Kor", bioma: "deserto", x: 90, y: 90, descoberta: false },
] };

sec("1. a descrição vira lugar");
{
  const casos = [
    ["vou para a capital", "Elandor"],
    ["quero ir para a cidade onde o rei mora", "Elandor"],
    ["vamos para o porto", "Baixa das Velas"],
    ["parto para a fortaleza", "Pedra Cinzenta"],
    ["vou para a aldeia", "Vau Pequeno"],
    ["vamos para a cidade nas montanhas", "Pedra Cinzenta"],
    /* Elandor (y 20) e Pedra Cinzenta (y 30) estão AMBAS ao norte deste
       mundo: perguntar é a resposta certa, não um erro do resolver. */
    ["sigo para a cidade do norte", null],
    ["volto para os meus domínios", "Vau Pequeno"],
    ["vamos para onde já estivemos", "Baixa das Velas"],
    ["rumo à cidade inimiga", "Pedra Cinzenta"],
    ["viajo para o Vale Alto", null],   // dois lá: ambíguo, e é o certo
  ];
  for (const [txt, esperado] of casos) {
    const r = resolverLugar(txt, mapa);
    if (esperado) {
      t(`"${txt}" → ${esperado}`, r.tipo === "achei" && r.escolha.cidade.nome === esperado);
    } else {
      t(`"${txt}" é ambíguo, e isso é o certo`, r.tipo === "ambiguo");
    }
  }
  t("pelo nome inteiro sempre acha", resolverLugar("vou para Baixa das Velas", mapa).escolha.cidade.nome === "Baixa das Velas");
  t("e por um pedaço do nome também", resolverLugar("vamos para Elandor", mapa).escolha.cidade.nome === "Elandor");
  t("a razão da escolha fica registrada", resolverLugar("vou para a capital", mapa).escolha.porque.length > 0);
}

sec("2. o que ele NUNCA faz");
{
  t("cidade não descoberta nunca é destino", resolverLugar("vou para a Cidade Oculta", mapa).tipo === "nada");
  t("nem por descrição", !JSON.stringify(resolverLugar("vou para o deserto", mapa)).includes("Cidade Oculta"));
  t("a cidade onde já estou é excluída", resolverLugar("vou para a capital", mapa, { excluir: "Elandor" }).tipo !== "achei"
    || resolverLugar("vou para a capital", mapa, { excluir: "Elandor" }).escolha.cidade.nome !== "Elandor");
  t("texto sem pista nenhuma não acha nada", resolverLugar("olho para o céu", mapa).tipo === "nada");
  t("mapa vazio não quebra", resolverLugar("vou para a capital", { cidades: [] }).tipo === "nada");
  t("mapa nulo também não", resolverLugar("vou para a capital", null).tipo === "nada");
  t("texto vazio também não", resolverLugar("", mapa).tipo === "nada" && resolverLugar(null, mapa).tipo === "nada");
}

sec("3. a ambiguidade PERGUNTA, e a pergunta é do sistema");
{
  const r = resolverLugar("viajo para o Vale Alto", mapa);
  t("dois candidatos", r.tipo === "ambiguo" && r.candidatos.length === 2);
  const q = perguntaDeAmbiguidade(r, "viajo para o Vale Alto");
  t("a pergunta repete o que eu disse", q.includes("viajo para o Vale Alto"));
  t("e lista numerada", /1\. /.test(q) && /2\. /.test(q));
  t("com porte, região e população", /capital/.test(q) && /Vale Alto/.test(q) && /almas/.test(q));
  t("e diz como responder", /responda com o número ou o nome/.test(q));
  t("no máximo cinco opções — lista longa não é escolha", perguntaDeAmbiguidade({ tipo: "ambiguo", candidatos: r.candidatos }, "x").split("\n").length <= 7);

  t("responder com o número escolhe", (respostaDaEscolha("1", r.candidatos) || {}).nome === r.candidatos[0].cidade.nome);
  t("responder com o número 2 também", (respostaDaEscolha("2", r.candidatos) || {}).nome === r.candidatos[1].cidade.nome);
  t("responder com o nome escolhe", (respostaDaEscolha("a Pedra Cinzenta", r.candidatos) || {}).nome === "Pedra Cinzenta");
  t("responder outra coisa NÃO escolhe", respostaDaEscolha("não sei, tanto faz", r.candidatos) === null);
  t("número fora da lista não escolhe", respostaDaEscolha("9", r.candidatos) === null);
  t("resposta vazia não escolhe", respostaDaEscolha("", r.candidatos) === null && respostaDaEscolha("1", []) === null);
}

sec("3b. e o vazio também pergunta, dizendo o que conhece");
{
  const r = resolverLugar("vou para a Torre de Marfim", mapa);
  t("não achou", r.tipo === "nada");
  const q = perguntaDeVazio(r, "vou para a Torre de Marfim");
  t("diz que não encontrou", /Não encontrei/.test(q));
  t("e lista o que o herói conhece", q.includes("Elandor") && q.includes("Baixa das Velas"));
  t("sem citar o que ele não conhece", !q.includes("Cidade Oculta"));
  t("e ensina como pedir", /a capital, o porto, a cidade do norte/.test(q));
  t("pergunta de tipo errado devolve vazio", perguntaDeVazio({ tipo: "achei" }) === "" && perguntaDeAmbiguidade({ tipo: "nada" }) === "");
}

sec("4. o cânone entra na busca");
{
  const extra = [{ cidade: "Baixa das Velas", termos: ["Hakon", "ferreiro"], porque: "Hakon mora lá" }];
  const r = resolverLugar("quero ir para a cidade onde encontramos o ferreiro", mapa, { extra });
  t("acha pelo que o cânone registrou", r.tipo === "achei" && r.escolha.cidade.nome === "Baixa das Velas");
  t("e diz por quê", r.escolha.porque.some((p) => /Hakon/.test(p)));
  t("sem o cânone, não acha", resolverLugar("quero ir para a cidade onde encontramos o ferreiro", mapa).tipo === "nada");
  t("cânone com lixo não quebra", resolverLugar("vou para a capital", mapa, { extra: [null, {}, { cidade: "X" }] }).tipo === "achei");
  t("cânone apontando para cidade que não existe é ignorado", resolverLugar("vou ver o ferreiro", mapa, { extra: [{ cidade: "Nenhures", termos: ["ferreiro"] }] }).tipo === "nada");
}

sec("5. contra os mundos de verdade");
{
  let quebrou = 0, achou = 0, ambiguo = 0, nada = 0;
  for (const m of MOLDES) {
    const geo = gerarGeografia(`resolver|${m.id}`, m);
    const mp = { cidades: geo.cidades.map((c) => ({ ...c, descoberta: true })) };
    for (const frase of ["vou para a capital", "vamos para o porto", "sigo para a cidade do norte", "parto para a fortaleza", "quero ir para a aldeia", "vou para a maior cidade"]) {
      try {
        const r = resolverLugar(frase, mp);
        if (r.tipo === "achei") achou++; else if (r.tipo === "ambiguo" || r.tipo === "vago") ambiguo++; else nada++;
        /* e o teto de opções vale sempre: cinco é o que se escolhe de relance */
        if (r.tipo === "ambiguo" && r.candidatos.length > 5) quebrou++;
        /* o invariante que importa: nunca devolve uma cidade que não existe */
        if (r.tipo === "achei" && !mp.cidades.some((c) => c.nome === r.escolha.cidade.nome)) quebrou++;
      } catch { quebrou++; }
    }
  }
  console.log(`      ${achou} resolvidas · ${ambiguo} perguntaram · ${nada} sem resposta`);
  /* O invariante que importa NÃO é "resolve a maioria" — num mundo-Torre
     não existe porto nem fortaleza, e responder "não há" é o certo. É
     "nunca inventa", e é isso que se mede. */
  t("nunca devolve um lugar que não existe", quebrou === 0);
  t("resolve boa parte sozinho", achou >= 6);
  t("e pergunta quando precisa — não chuta", ambiguo > 0);
}

sec("5b. muitos empatados não é uma escolha, é uma lista");
{
  /* dez andares idênticos ao norte: oferecer cinco deles seria fingir uma
     pergunta — o jogador não pediu nenhum daqueles cinco em especial */
  const muitos = { cidades: Array.from({ length: 12 }, (_, i) => ({ nome: `Andar ${i + 1}`, porte: "andar", populacao: 400, regiao: "Seção", bioma: "planicie", x: 50, y: 10 + i * 0.2, descoberta: true })) };
  const r = resolverLugar("vou para o andar do norte", muitos);
  t("com doze candidatos, o sistema diz que a descrição é vaga", r.tipo === "vago");
  const q = perguntaDeVaguidade(r, "vou para o andar do norte");
  t("a pergunta diz quantos são", /serve para \d+ lugares/.test(q));
  t("dá alguns exemplos, não a lista toda", (q.match(/Andar \d+/g) || []).length <= 3);
  t("e ensina a estreitar", /Seja mais específico/.test(q) && /junte pistas/.test(q));
  t("vaguidade de outro tipo devolve vazio", perguntaDeVaguidade({ tipo: "achei" }) === "");
  /* e abaixo do teto continua sendo pergunta com lista */
  const poucos = { cidades: muitos.cidades.slice(0, 3) };
  t("com três, ainda é lista numerada", resolverLugar("vou para o andar do norte", poucos).tipo === "ambiguo");
}

sec("6. a regra que o Mestre recebe");
{
  t("diz que quem procura é o sistema", /Quem procura o lugar é o SISTEMA/.test(RESOLVER_PROMPT));
  t("proíbe o Mestre de escolher por mim", /NÃO escolhe por ele e NÃO adivinha/.test(RESOLVER_PROMPT));
  t("e de inventar cidade para preencher", /não existe/.test(RESOLVER_PROMPT));
}

console.log(`\nresolver v9.57: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
