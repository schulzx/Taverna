/* PROCURAR ALGUÉM (v9.130) — fase 2 do plano

   O relato: "Procuro por sinais de Ione". O sistema abriu VASCULHAR O LUGAR,
   pediu Percepção, o herói passou — e recebeu uma arma escondida com pressa
   e sessenta moedas. Nada de Ione.

   A regra já estava escrita: o desafio `buscar` tem um guarda cujo próprio
   comentário diz "PROCURAR UMA PESSOA NÃO É VASCULHAR UM LUGAR". Só que o
   guarda era uma LISTA DE PALAVRAS — taverneiro, ferreiro, alguém — e Ione
   não é nenhuma delas. Ele reconhecia ofícios e não reconhecia gente.

   Esta suíte defende duas coisas:
   · que o guarda pergunte ao ELENCO, e não ao dicionário;
   · e que procurar alguém nunca pague em prata, em nenhum dos desfechos. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const { lerAcao } = await import(S + "desafios.js");
const P = await import(S + "procura.js");
const B = await import(S + "mundo-base.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const NOMES = ["Ione Vantel", "Kael Duarte", "Fina Da Rede"];
const ctxBase = { personagem: {}, semente: "x", lugar: "A Caneca Torta", tentativas: {}, dia: 1, achadoDe: () => null };
const comGuarda = { ...ctxBase, ehPessoaConhecida: (x) => !!P.nomeProcurado(x, NOMES) };

sec("1. O NOME NA FRASE, E SÓ O QUE O JOGO CONHECE");
{
  t("acha o nome inteiro", P.nomeProcurado("Procuro por sinais de Ione Vantel", NOMES) === "Ione Vantel");
  /* a mesa chama Ione Vantel de Ione: casar só com o nome completo perderia
     todas as frases reais */
  t("acha pelo primeiro nome", P.nomeProcurado("Procuro por sinais de Ione", NOMES) === "Ione Vantel");
  t("acha pelo sobrenome", P.nomeProcurado("alguém viu Duarte?", NOMES) === "Kael Duarte");
  t("nome que o jogo não conhece não conta", P.nomeProcurado("procuro por Belarmino", NOMES) === "");
  t("frase sem nome nenhum não conta", P.nomeProcurado("vasculho o quarto atrás de moedas", NOMES) === "");
  /* o pedaço solto não pode roubar a frase: "vasculho a sala" não fala de
     ninguém, e "sinal" não é "Fina" */
  t("não casa com pedaço de palavra", P.nomeProcurado("procuro um sinal de fumaça", NOMES) === "");
  t("sem elenco, nenhum nome é reconhecido", P.nomeProcurado("Procuro por Ione", []) === "");

  t("procurar é procura", P.ehProcura("Procuro por sinais de Ione"));
  t("perguntar por alguém também", P.ehProcura("pergunto por Ione na taverna"));
  t("onde está também", P.ehProcura("onde está Ione?"));
  /* nomear alguém não basta: a frase precisa PEDIR achar */
  t("mas atacar alguém não é procurar", !P.ehProcura("ataco Ione com a espada"));
}

sec("2. O GUARDA PERGUNTA AO ELENCO");
{
  const semGuarda = lerAcao("Procuro por sinais de Ione", ctxBase);
  t("sem o guarda, a frase caía em vasculhar o lugar", semGuarda && semGuarda.rotulo === "vasculhar o lugar");
  const com = lerAcao("Procuro por sinais de Ione", comGuarda);
  t("com o guarda, o desafio de busca recua", !com || com.rotulo !== "vasculhar o lugar");
  /* e o que sempre foi vasculhar continua sendo — o conserto não pode comer
     o caso certo */
  const quarto = lerAcao("vasculho o quarto", comGuarda);
  t("vasculhar um cômodo continua sendo vasculhar", quarto && quarto.rotulo === "vasculhar o lugar");
  const gaveta = lerAcao("reviro as gavetas atrás de papéis", comGuarda);
  t("e revirar gavetas também", gaveta && gaveta.rotulo === "vasculhar o lugar");
  /* o guarda antigo, de palavras, continua de pé para os ofícios */
  const taverneiro = lerAcao("procuro o taverneiro", ctxBase);
  t("o guarda de palavras continua valendo sozinho", !taverneiro || taverneiro.rotulo !== "vasculhar o lugar");
}

sec("3. ONDE ELA ESTÁ — SEIS RESPOSTAS, NENHUMA EM MOEDAS");
{
  const mapa = { cidades: [{ nome: "Prata Velha", x: 30, y: 40 }, { nome: "Ponto do Rei", x: 60, y: 20 }] };
  const casos = [
    ["no_grupo", { grupo: [{ nome: "Ione Vantel" }] }],
    ["aqui", { genteDaqui: [{ nome: "Ione Vantel", local: "A Caneca Torta", papel: "taverneira" }] }],
    ["noutro_lugar", { npcs: { a: { nome: "Ione Vantel", local: "Ponto do Rei" } }, cidadeAtual: "Prata Velha", mapa }],
    ["aqui_escondida", { genteDaqui: [{ nome: "Ione Vantel", local: "A Fossa" }], base: B.porSituacao(null, "Ione Vantel", B.SITUACOES.cativa, { onde: "A Fossa" }) }],
    ["morta", { base: B.porSituacao(null, "Ione Vantel", B.SITUACOES.morta) }],
    ["ninguem", {}],
  ];
  for (const [esperado, ctx] of casos) {
    const r = P.procurarPessoa("Ione Vantel", ctx);
    t(`${esperado}: o desfecho é esse`, r && r.desfecho === esperado);
    t(`${esperado}: tem linha para o log`, P.linhaDaProcura(r).length > 8);
    const env = P.envelopeDaProcura(r);
    t(`${esperado}: o envelope é fato fechado`, env.startsWith("[PROCURA — RESOLVIDA PELO SISTEMA]"));
    /* A REGRA DESTA VERSÃO: procurar gente não paga tesouro, em desfecho
       nenhum. É o defeito inteiro que abriu a fase 2. */
    /* medir a PALAVRA pegava a minha própria proibição — o envelope diz
       "não transforme isto em achado de tesouro", e a prova jurava que ele
       pagava. O que não pode existir é PAGAMENTO. */
    t(`${esperado}: e não paga nada`, !/◉|\d+\s*moedas|p[ôo]s? na (minha|sua) bolsa|entrou na bolsa/i.test(env));
    t(`${esperado}: e proíbe virar achado`, /não invente|NÃO invente|não transforme|Não a faça|não faça/i.test(env));
  }
}

sec("4. SÓ A ESCONDIDA PEDE DADO");
{
  const escondida = P.procurarPessoa("Ione Vantel", { genteDaqui: [{ nome: "Ione Vantel" }], base: B.porSituacao(null, "Ione Vantel", B.SITUACOES.escondida) });
  t("quem se esconde exige o teste", P.pedeDado(escondida));
  for (const ctx of [{ grupo: [{ nome: "Ione Vantel" }] }, { genteDaqui: [{ nome: "Ione Vantel" }] }, {}]) {
    t("as outras o mundo responde sem dado", !P.pedeDado(P.procurarPessoa("Ione Vantel", ctx)));
  }
  t("e o rumo sai legível, não como objeto", !/\[object/.test(P.envelopeDaProcura(P.procurarPessoa("Ione Vantel", {
    npcs: { a: { nome: "Ione Vantel", local: "Ponto do Rei" } }, cidadeAtual: "Prata Velha",
    mapa: { cidades: [{ nome: "Prata Velha", x: 30, y: 40 }, { nome: "Ponto do Rei", x: 60, y: 20 }] },
  }))));
}

sec("5. A SITUAÇÃO DE CADA UM");
{
  t("sem nada, todo mundo é livre", B.situacaoDe(null, "Ione") === B.SITUACOES.livre);
  const cativa = B.porSituacao(null, "Ione Vantel", B.SITUACOES.cativa, { onde: "A Fossa", quem: "o carcereiro" });
  t("a situação é guardada", B.situacaoDe(cativa, "Ione Vantel") === B.SITUACOES.cativa);
  t("com onde e com quem", B.ondeEsta(cativa, "Ione Vantel").onde === "A Fossa" && B.ondeEsta(cativa, "Ione Vantel").quem === "o carcereiro");
  t("e o nome não precisa vir igualzinho", B.situacaoDe(cativa, "ione vantel") === B.SITUACOES.cativa);
  /* morrer escreve nos DOIS lugares: a lista de mortos, que metade do jogo
     já lê, e a situação, que a procura consulta */
  const morta = B.matar(null, "Ione Vantel");
  t("matar marca a situação", B.situacaoDe(morta, "Ione Vantel") === B.SITUACOES.morta);
  t("e continua na lista de mortos", B.estaMorto(morta, "Ione Vantel"));
  /* a lista guarda o nome CRU e a chave é normalizada: comparar direto fazia
     todo morto de save antigo voltar a `livre` */
  t("save antigo, só com a lista, continua morto", B.situacaoDe({ mortos: ["Zulmira"] }, "zulmira") === B.SITUACOES.morta);
  t("situação inventada vira livre", B.situacaoDe(B.porSituacao(null, "X", "voando"), "X") === B.SITUACOES.livre);
  t("a catraca aceita save sem situações", typeof B.garantirBase({ mortos: [] }).situacoes === "object");
}

sec("6. LIGADA AO JOGO");
{
  t("existe uma lista só de quem o jogo conhece", /const nomesConhecidos = \(\) => \{/.test(APP));
  t("ela junta elenco, grupo, gente daqui e a espinha", /npcsRef\.current[\s\S]{0,400}?genteDaqui\(\)[\s\S]{0,300}?espinhaRef\.current/.test(APP));
  t("o guarda de `buscar` recebe a pergunta", /ehPessoaConhecida: \(txt\) =>/.test(APP));
  t("e o desafio a consulta", /naoSeCom && x\.naoSeCom\(daAcao, ctx\)/.test(readFileSync("../src/desafios.js", "utf8")));
  t("a procura corre ANTES do adjudicador", /if \(procurarAlguem\(acao\)\) return true;\s*const v = veredictoDaAcao\(acao\);/.test(APP));
  t("a escondida devolve o turno ao teste normal", /if \(!r \|\| procuraPedeDado\(r\)\) return false;/.test(APP));
  t("e o Narrador recebe o fato fechado", /envelopeDaProcura\(r\)/.test(APP));
}

console.log(`\nprocura v9.130: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
