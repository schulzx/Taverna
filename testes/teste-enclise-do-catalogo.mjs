/* teste-enclise-do-catalogo.mjs (Fase MM) — "escondo-me" esconde.

   Achado a jogar MM6: "Eu me escondo atrás de uma árvore" rolou
   Furtividade e nasceu o estado; "escondo-me atrás de uma árvore" não
   rolava nada. O catálogo de desafios foi escrito em próclise ("me
   escondo", "me equilibro"), e a ênclise — o jeito NORMAL de escrever
   em português — passava por ele sem casar. O mesmo defeito que a
   agressão teve com "socá-lo" (v9.309), agora no catálogo.

   A solução é uma, e não quarenta remendos: `emProclise` (peneira.js)
   reescreve a frase antes do catálogo, no mesmo tamanho — o reflexivo
   para antes do verbo ("escondo-me" → "me escondo"), o objeto para depois
   ("sigo-o" → "sigo o", como "sigo ele"; "convencê-lo" → "convencer o").

   E UM SEGUNDO DEFEITO, que a primeira correção teria alargado: o
   catálogo era a única porta que age pelo jogador SEM a peneira. "Posso
   me esgueirar até a porta?" rolava Furtividade, "não me escondo" também.
   Aceitar o infinitivo ("tento me esconder") sem a peneira faria "posso
   me esconder?" rolar. Por isso o catálogo passou a ler só o que o herói
   DECLAROU, como a agressão e o improviso já liam.

   Esta suíte prova as três metades com um CORPUS: cada ênclise casa o
   mesmo desafio que a próclise casa; o hífen que não é ênclise não muda;
   e a pergunta, a negação, o condicional e o passado continuam sem dado.
   A taxa é impressa e o piso é 100%. */
import { ENCLISE, emProclise, NAO_E_DECLARACAO, soODeclarado } from "../src/peneira.js";
import { DESAFIOS, FAMILIAS_DO_IMPROVISO, NAO_E_IMPROVISO, lerAcao } from "../src/desafios.js";
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const idDe = (v) => (v && v.tipo === "teste" ? (v.id === "improviso" ? "improviso:" + v.atributo : v.id) : null);
const ler = (f) => { try { return lerAcao(f, {}); } catch (e) { return { tipo: "erro", erro: String(e) }; } };

sec("1. a tabela da ênclise");
{
  t("o reflexivo e o dativo vão para antes do verbo", ["me", "te", "se", "nos", "vos", "lhe", "lhes"].every((p) => ENCLISE.antes.includes(p)));
  t("o objeto fica depois", ["o", "a", "os", "as"].every((p) => ENCLISE.depois.includes(p)));
  t("nenhum pronome está dos dois lados", !ENCLISE.antes.some((p) => ENCLISE.depois.includes(p)));
  t("a mesóclise é só o futuro — o condicional (-ia) é hipótese e fica de fora",
    ENCLISE.mesoclise.includes("ei") && !ENCLISE.mesoclise.some((f) => /^ia/.test(f)));
  t("o -lo que comeu a letra devolve r ao infinitivo e s ao plural",
    ENCLISE.letraComida.some((l) => l.fim === "mo" && l.volta === "s") && ["a", "e", "i", "o"].every((v) => ENCLISE.letraComida.some((l) => l.fim === v && l.volta === "r")));
  t("e o \"mo\" é lido antes do \"o\" (senão vemo-lo viraria vemor)",
    ENCLISE.letraComida.findIndex((l) => l.fim === "mo") < ENCLISE.letraComida.findIndex((l) => l.fim === "o"));
  t("com o porquê", typeof ENCLISE.porque === "string" && ENCLISE.porque.length > 40);
}

sec("2. emProclise — a troca, no mesmo tamanho");
{
  const PARES = [
    ["escondo-me atrás do barril", "me escondo atrás do barril"],
    ["Escondo-me.", "Me escondo."],
    ["tento esconder-me", "tento me esconder"],
    ["vou esgueirar-me", "vou me esgueirar"],
    ["sigo-o de longe", "sigo o de longe"],
    ["tento convencê-lo", "tento convencer o"],
    ["tento distraí-la", "tento distrair a"],
    ["vemo-lo", "vemos o"],
    ["dou-lhe um sermão", "lhe dou um sermão"],
    ["iço-me", "me iço"],
    ["esconder-me-ei", "me esconderei "],
    ["atacá-lo-ei", "atacarei o "],
    ["convencer-me-á", "me convencerá "],
  ];
  for (const [de, para] of PARES) t(`"${de}" → "${para}"`, emProclise(de) === para, JSON.stringify(emProclise(de)));
  t("o condicional fica como está: \"esconder-me-ia\"", emProclise("esconder-me-ia") === "esconder-me-ia");
  t("o plural que comeu o s perde o s, não a posição: \"escondemo-nos\" → \"nos escondemo\"", emProclise("escondemo-nos") === "nos escondemo");
  t("lixo não quebra: null, undefined, {} e número", emProclise(null) === "" && emProclise(undefined) === "" && typeof emProclise({}) === "string" && emProclise(42) === "42");
  t("sem hífen, a frase volta igual (e é o mesmo objeto de texto)", emProclise("me escondo atrás do barril") === "me escondo atrás do barril");
  t("aplicar duas vezes é aplicar uma", PARES.every(([de]) => emProclise(emProclise(de)) === emProclise(de)));
}

sec("3. o corpus — a ênclise casa o que a próclise casa");
/* [ênclise, próclise (ou a forma que o catálogo já lia), o desafio esperado] */
const CASA = [
  /* furtividade — o item */
  ["Escondo-me atrás do barril.", "Me escondo atrás do barril.", "furtar_se"],
  ["escondo-me nas sombras do beco", "me escondo nas sombras do beco", "furtar_se"],
  ["tento esconder-me atrás da carroça", "tento me esconder atrás da carroça", "furtar_se"],
  ["vou esconder-me no celeiro", "vou me esconder no celeiro", "furtar_se"],
  ["esgueiro-me pela sombra até a porta", "me esgueiro pela sombra até a porta", "furtar_se"],
  ["vou esgueirar-me pelos fundos", "vou me esgueirar pelos fundos", "furtar_se"],
  /* o futuro é promessa de ato, como "atacá-lo-ei" na agressão */
  ["esconder-me-ei atrás do altar", "me esconderei atrás do altar", "furtar_se"],
  ["misturo-me na multidão da feira", "me misturo na multidão da feira", "furtar_se"],
  ["aproximo-me sem ruído da tenda", "me aproximo sem ruído da tenda", "furtar_se"],
  ["agacho-me atrás do balcão", "me agacho atrás do balcão", "furtar_se"],
  ["abaixo-me entre os barris", "me abaixo entre os barris", "furtar_se"],
  /* os outros reflexivos do catálogo */
  ["iço-me pela corda até a janela", "me iço pela corda até a janela", "escalar"],
  ["tento içar-me até o parapeito", "tento me içar até o parapeito", "escalar"],
  ["atiro-me para o outro lado do vão", "me atiro para o outro lado do vão", "saltar"],
  ["vou atirar-me sobre o fosso", "vou me atirar sobre o fosso", "saltar"],
  ["jogo-me no rio e nado", "me jogo no rio e nado", "nadar"],
  ["equilibro-me na viga podre", "me equilibro na viga podre", "equilibrio"],
  ["tento equilibrar-me no parapeito", "tento me equilibrar no parapeito", "equilibrio"],
  ["solto-me das cordas", "me solto das cordas", "escapar"],
  ["desvencilho-me das amarras", "me desvencilho das amarras", "escapar"],
  ["contorço-me até a corda ceder", "me contorço até a corda ceder", "escapar"],
  ["tento soltar-me das algemas", "tento me soltar das algemas", "escapar"],
  ["oriento-me pelas estrelas", "me oriento pelas estrelas", "orientar"],
  ["tento orientar-me pelo musgo", "tento me orientar pelo musgo", "orientar"],
  ["passo-me por mensageiro do duque", "me passo por mensageiro do duque", "mentir"],
  ["disfarço-me de guarda", "me disfarço de guarda", "mentir"],
  ["apresento-me a ela com uma mesura", "me apresento a ela com uma mesura", "impressionar"],
  ["aproximo-me dela e digo que ela brilha", "me aproximo dela e digo que ela brilha", "impressionar"],
  ["aproximo-me devagar do cavalo assustado", "me aproximo devagar do cavalo assustado", "acalmar_bicho"],
  /* o objeto: depois do verbo, como o catálogo escreve quem sofre a ação */
  ["tento convencê-lo a me deixar passar", "tento convencer ele a me deixar passar", "convencer"],
  ["convenço-o a abrir o portão", "convenço ele a abrir o portão", "convencer"],
  ["encaro-o nos olhos até ele desviar", "encaro ele nos olhos até ele desviar", "intimidar"],
  ["sigo-o de longe pelo mercado", "sigo ele de longe pelo mercado", "seguir_alguem"],
  ["sigo-a sem ser notada", "sigo ela sem ser notada", "seguir_alguem"],
  ["levanto-o do chão com um grunhido", "levanto o baú do chão com um grunhido", "forcar"],
  ["arrasto-o até a porta", "arrasto o baú até a porta", "forcar"],
  /* as famílias do improviso */
  ["penduro-me no lustre", "me penduro no lustre", "improviso:destreza"],
  ["tento pendurar-me na corda do sino", "tento me pendurar na corda do sino", "improviso:destreza"],
  ["balanço-me na corda até a sacada", "me balanço na corda até a sacada", "improviso:destreza"],
  ["esquivo-me para o lado", "me esquivo para o lado", "improviso:destreza"],
  ["mantenho-me atento aos passos no corredor", "me mantenho atento aos passos no corredor", "improviso:percepcao"],
  ["tento lembrar-me de onde vi esse símbolo", "tento me lembrar de onde vi esse símbolo", "improviso:intelecto"],
  ["distraio-o com uma moeda no chão", "distraio ele com uma moeda no chão", "improviso:presenca"],
  ["tento distraí-la enquanto o Bram passa", "tento distrair ela enquanto o Bram passa", "improviso:presenca"],
];
/* o que continua SEM dado — a ênclise não é licença para a peneira dormir */
const NAO_CASA = [
  ["posso esconder-me atrás do barril?", "pergunta"],
  ["posso esgueirar-me até a porta?", "pergunta — rolava antes, sem ênclise nenhuma"],
  ["posso me esgueirar até a porta?", "pergunta — a próclise também rolava"],
  ["será que consigo esconder-me ali?", "hipótese"],
  ["não me escondo, fico onde estou", "negação — rolava Furtividade"],
  ["não vou esconder-me de ninguém", "negação"],
  ["nunca me esgueiro por aí", "negação"],
  ["se ele virar as costas, escondo-me", "condição"],
  ["esconder-me-ia, se pudesse", "o condicional é hipótese"],
  ["equilibrar-me-ia na viga, mas tenho medo", "o condicional é hipótese"],
  ["ontem escondi-me no celeiro", "passado"],
  ["Escondo-me atrás do barril. Posso?", "a licença do fim vale para a frase"],
  ["Digo: \"escondo-me, se for preciso\"", "fala, não gesto"],
  ["escondo-o no bolso do casaco", "o objeto escondido não é o herói escondido"],
  ["escondo-a debaixo da capa", "idem"],
  ["tento agarrá-la pelo braço", "disputa"],
  ["atiro-a no bandido", "coisa atirada em alguém é golpe"],
  ["levanto-me da cadeira", "levantar-se não é peso"],
  ["arrasto-me para debaixo da mesa", "arrastar-se não é vencer o peso"],
];

{
  const erros = [];
  let n = 0;
  for (const [encl, procl, esperado] of CASA) {
    n++;
    const a = idDe(ler(encl)), b = idDe(ler(procl));
    if (a !== esperado || b !== esperado) erros.push(`"${encl}" deu ${a}, "${procl}" deu ${b}, esperado ${esperado}`);
  }
  for (const [f, porque] of NAO_CASA) {
    n++;
    const v = ler(f);
    if (v && v.tipo === "teste") erros.push(`"${f}" rolou ${idDe(v)} (${porque})`);
  }
  const taxa = Math.round(((n - erros.length) / n) * 1000) / 10;
  console.log(`      corpus da ênclise: ${n - erros.length}/${n} (${taxa}%) · ${CASA.length} casam · ${NAO_CASA.length} não rolam`);
  t("o corpus tem ao menos 50 frases", n >= 50, String(n));
  t("toda frase do corpus sai com o veredito esperado (piso: 100%)", erros.length === 0, erros.join(" | "));
  t("todo reflexivo do catálogo tem ênclise no corpus",
    ["furtar_se", "escalar", "saltar", "nadar", "equilibrio", "escapar", "orientar", "mentir", "impressionar", "acalmar_bicho"].every((id) => CASA.some((c) => c[2] === id)));
  t("e toda família do improviso que tem verbo pronominal",
    ["destreza", "percepcao", "intelecto", "presenca"].every((f) => CASA.some((c) => c[2] === "improviso:" + f)));
}

sec("4. o hífen que não é ênclise não se mexe");
{
  const HIFENS = [
    "guarda-roupa", "meio-dia", "bem-vindo", "pé-de-cabra", "bem-te-vi", "bem-me-quer",
    "corpo-a-corpo", "cara-a-cara", "dia-a-dia", "passo-a-passo", "porta-a-porta",
    "segunda-feira", "beija-flor", "arco-íris", "mal-estar", "guarda-costas", "esconde-esconde",
    "pega-pega", "Jean-Luc", "vice-rei", "saio da taverna - a noite está fria",
  ];
  const mudou = HIFENS.filter((h) => emProclise(h) !== h);
  t(`${HIFENS.length} hífens de palavra composta ficam como estão`, mudou.length === 0, mudou.join(", "));
  t("\"abro o guarda-roupa e me escondo lá dentro\" é a furtividade, e o guarda-roupa continua inteiro",
    idDe(ler("abro o guarda-roupa e me escondo lá dentro")) === "furtar_se" && emProclise("abro o guarda-roupa e me escondo") === "abro o guarda-roupa e me escondo");
  t("\"luto corpo-a-corpo\" não vira outra coisa", emProclise("luto corpo-a-corpo com ele") === "luto corpo-a-corpo com ele");
  t("\"forço a porta com o pé-de-cabra\" continua a tranca", idDe(ler("forço a porta com o pé-de-cabra")) === "tranca");
}

sec("5. a peneira no catálogo — o que ela não tirou");
{
  t("só os seis desafios de saber leem a pergunta",
    DESAFIOS.filter((d) => d.lePergunta).map((d) => d.id).sort().join(",") === ["arcano", "diagnosticar", "fraqueza", "heraldica", "investigar", "mentira"].sort().join(","));
  t("\"de quem é esse brasão?\" continua a rolar Saberes", idDe(ler("de quem é esse brasão?")) === "heraldica");
  t("\"o que sei sobre essa criatura?\" também", idDe(ler("o que sei sobre essa criatura?")) === "fraqueza");
  t("\"ele está mentindo?\" é Intuição", idDe(ler("ele está mentindo?")) === "mentira");
  /* a frase feita é o gatilho de "impressionar", e por isso não é trava do
     catálogo — a suíte do improviso tem esta frase no corpus dela */
  t("\"quebro o gelo com uma piada\" continua a boa impressão", idDe(ler("Quebro o gelo com uma piada")) === "impressionar");
  t("\"Posso? Escondo-me atrás do barril.\" — quem perguntou e não esperou já decidiu",
    idDe(ler("Posso? Escondo-me atrás do barril.")) === "furtar_se");
  t("\"peço um teste de Furtividade\" continua recusado com a frase que funcionaria",
    (() => { const v = ler("peço um teste de Furtividade"); return v && v.tipo === "naoSePede"; })());
  t("o \"se\" depois de preposição não é condição: \"convenço o guarda a se afastar\" é conversa",
    soODeclarado("convenço o guarda a se afastar").trim() !== "" && idDe(ler("tento convencer o guarda a se afastar")) === "convencer");
  t("mas \"se ele se afastar\" continua a ser condição", soODeclarado("se ele se afastar").trim() === "");
  t("a peneira da casa segue uma só: o improviso lê as mesmas travas", NAO_E_DECLARACAO.every((n, i) => NAO_E_IMPROVISO[i] === n));
}

sec("6. o rótulo do improviso guarda os acentos do jogador");
{
  const v = ler("Balanço-me na corda até a sacada");
  t("\"balanço-me na corda até a sacada\" → \"balançar-me na corda até a sacada\"", v && v.rotulo === "balançar-me na corda até a sacada", v && v.rotulo);
  const w = ler("tento pendurar-me no lustre de cristal");
  t("o infinitivo com pronome dá o mesmo rótulo que o presente", w && w.rotulo === "pendurar-me no lustre de cristal", w && w.rotulo);
  const fam = FAMILIAS_DO_IMPROVISO.find((f) => f.id === "destreza");
  const v2 = fam && fam.verbos.find((x) => x.faz && x.faz["me penduro"]);
  t("e a tabela da destreza nomeia os dois", !!(v2 && v2.faz["me pendurar"] === v2.faz["me penduro"]));
}

sec("7. a letra acentuada solta, que nunca casava");
{
  /* A frase chega ao catálogo sem acento (norm), e uma letra acentuada
     FORA de classe numa regra é uma alternativa morta. O corpus achou
     "convenço" assim — "convenço-o" não casava, e "convenço ele" também
     não, desde sempre. Varridas as regras do catálogo e das famílias:
     quatro mortas ("convenço", "calço a placa", "trenó", "encalço"),
     consertadas. As que sobram têm a gêmea sem acento ao lado ("(é|e)",
     "a\b|à\b") e são inofensivas — ficam listadas aqui. */
  const GEMEAS = ["escutar", "arcano", "heraldica"];
  const fora = (rx) => !!rx && /[À-ÿ]/.test(rx.source.replace(/\[[^\]]*\]/g, ""));
  const soltas = DESAFIOS.filter((d) => fora(d.rx)).map((d) => d.id);
  t("nenhuma regra do catálogo tem letra acentuada solta, salvo as de gêmea", soltas.every((id) => GEMEAS.includes(id)), soltas.join(","));
  t("nem as famílias do improviso", FAMILIAS_DO_IMPROVISO.every((f) => f.verbos.every((v) => !fora(v.rx) && !fora(v.nucleo))));
  t("\"convenço o guarda a abrir\" é Persuasão", idDe(ler("convenço o guarda a abrir o portão")) === "convencer");
  t("\"calço a placa com a adaga\" desarma", idDe(ler("calço a placa com a adaga")) === "desarmar");
  t("\"conduzo o trenó pela encosta\" é Montaria", idDe(ler("conduzo o trenó pela encosta")) === "cavalgar");
  t("\"vou no encalço dele\" é seguir alguém", idDe(ler("vou no encalço dele pela viela")) === "seguir_alguem");
}

sec("8. onde a troca entra");
{
  const src = readFileSync("../src/desafios.js", "utf8");
  t("o catálogo lê a ênclise desfeita E só o declarado", /emProclise\(soODeclarado\(daAcao, TRAVAS_DO_CATALOGO\)\)/.test(src));
  t("o veto (naoSe) lê a frase inteira", /x\.naoSe\.test\(inteira\)/.test(src));
  t("o improviso lê as famílias na próclise, e a peneira nas duas", /const s = emProclise\(s0\);\s*\n\s*if \(peneiraDoImproviso\(s\)\) return null;/.test(src));
  t("a agressão não passou pela troca — ela lê a ênclise direto (v9.309)", !/emProclise/.test(readFileSync("../src/agressao.js", "utf8")));
}

console.log(`\nênclise do catálogo: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
