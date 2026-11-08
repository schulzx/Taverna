/* teste-marcas-da-prosa.mjs — TP · a prosa tocável: os nomes são as fichas
   (pedido TP-1; formas.md §TP, a TL 10 aprovada pela pessoa a 09/11/2026)

   O motor diz onde, na resposta do Mestre, estão os nomes que o sistema
   conhece (`marcasDaProsa`); a tela só embrulha o trecho que ele devolve, e a
   prosa nunca inventa uma ficha. Esta suíte prende as regras:

     1. a tabela (`MARCAS_NA_PROSA`) e a catraca: `fora` é a mesma lista que
        `EM_CENA.fora` da folha de estilo;
     2. o quadro do Figma (328:27): cinco marcas — Conrado, ermida, Martim
        Cinzentos, Mécia, porta —, o 2.º «Conrado» e o 2.º «ermida» fora;
     3. respostas reais da 10.ª sessão (`sessao-s10.json`): o Godfrey uma vez
        só, a gente que só a prosa trouxe fora, o companheiro fora, o sítio
        onde o herói está fora, a chave à venda;
     4. as palavras: nomes compostos, acentos, maiúsculas, a fronteira, o
        nome que não atravessa parágrafo nem vírgula, o nome partido entre
        duas fichas;
     5. o longe: a pessoa com página E `conheceu`; o só nomeado nunca; o
        lugar com página ou `esteve`; o nome comum nunca de longe;
     6. o teto: cinco, os de cá antes dos de longe, de volta à ordem da prosa;
     7. as leis de sempre, varridas nas 194 respostas gravadas (s8, s9, s10):
        `de` é a 1.ª ocorrência com fronteira, nenhuma sobreposição, nenhum
        id fora da lista, determinismo, imutabilidade, `null` e lixo dão [].

   Falha na árvore de antes: `marcasDaProsa` não existe. */
import { readFileSync } from "node:fs";
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = "../src/";
const J = JSON.stringify;

let FI = {};
try { FI = await import(S + "fichas.js"); } catch (e) { console.log("  (fichas.js não carrega: " + e.message + ")"); }
const marcasDaProsa = FI.marcasDaProsa || (() => null);
const MARCAS_NA_PROSA = FI.MARCAS_NA_PROSA || {};
const lerSessao = (n) => JSON.parse(readFileSync(new URL("./sessao-" + n + ".json", import.meta.url), "utf8"));
const vista = (ms) => (Array.isArray(ms) ? ms.map((m) => `${m.palavra}${m.longe ? "·longe" : ""}`) : ms);

/* a 1.ª ocorrência com fronteira de palavra Unicode — escrita aqui de novo,
   à parte da do motor: a tela (`Prosa`) embrulha a 1.ª ocorrência, e as
   duas contas têm de cair no mesmo sítio */
const LETRA = /[\p{L}\p{M}\p{N}]/u;
function primeira(texto, palavra) {
  for (let i = texto.indexOf(palavra); i >= 0; i = texto.indexOf(palavra, i + 1)) {
    const a = i > 0 ? texto[i - 1] : "", d = texto[i + palavra.length] || "";
    if (!(a && LETRA.test(a)) && !(d && LETRA.test(d))) return i;
  }
  return -1;
}
/* as leis que valem para TODA saída */
function leis(texto, ms, idsPossiveis) {
  if (!Array.isArray(ms)) return "não é lista";
  if (ms.length > MARCAS_NA_PROSA.teto) return "passou do teto";
  const ids = new Set();
  for (let k = 0; k < ms.length; k++) {
    const m = ms[k];
    if (texto.slice(m.de, m.de + m.palavra.length) !== m.palavra) return "palavra não está em de: " + m.palavra;
    if (primeira(texto, m.palavra) !== m.de) return "de não é a 1.ª ocorrência: " + m.palavra;
    if (/\n/.test(m.palavra)) return "atravessa parágrafo: " + m.palavra;
    if (ids.has(m.id)) return "id repetido: " + m.id;
    ids.add(m.id);
    if (idsPossiveis && !idsPossiveis.has(m.id)) return "inventou: " + m.id;
    if (!m.ficha || m.ficha.id !== m.id) return "sem ficha: " + m.id;
    if (k && ms[k - 1].de + ms[k - 1].palavra.length > m.de) return "sobrepõe ou fora de ordem: " + m.palavra;
  }
  return "";
}

sec("1. A tabela e a catraca");
{
  t("teto 5", MARCAS_NA_PROSA.teto === 5, J(MARCAS_NA_PROSA));
  t("fora: o companheiro e o lugar onde se está", J(MARCAS_NA_PROSA.fora) === J(["pessoaDoGrupo", "aqui"]), J(MARCAS_NA_PROSA.fora));
  t("o primeiro nome toca sozinho a partir de 3 letras", MARCAS_NA_PROSA.primeiroNome === 3);
  /* a catraca: a gaveta do `Em cena` (estilo.js) e o motor deixam de fora as
     mesmas variantes — uma regra, dois leitores; se uma mudar sozinha, a
     barra mostra um rosto que a prosa também marcou (ou nenhum dos dois) */
  let EST = null;
  try { EST = await import(S + "estilo.js"); } catch (e) { console.log("  (estilo.js não carrega: " + e.message + ")"); }
  const foraDaTela = EST && EST.EM_CENA && EST.EM_CENA.fora;
  if (!Array.isArray(foraDaTela)) console.log("  --  salta: EM_CENA.fora ainda não existe em estilo.js (a peça do aprendiz); a catraca liga-se sozinha quando nascer");
  else t("EM_CENA.fora (estilo.js) === MARCAS_NA_PROSA.fora (fichas.js)", J(foraDaTela) === J(MARCAS_NA_PROSA.fora), J(foraDaTela) + " ≠ " + J(MARCAS_NA_PROSA.fora));
}

sec("2. O quadro 328:27 — cinco marcas, só a 1.ª menção");
/* o texto do quadro «depois · repouso», tirado do Figma (página 327:2) */
const QUADRO = "A estrada desce por entre pedras que alguém empilhou muito antes de haver estrada, e o vento que sobe do vale traz cheiro de água parada. Conrado para à beira do caminho, tira o chapéu e olha para a ermida como quem conhece um velho inimigo.\n\nMartim Cinzentos segura as rédeas com as duas mãos. «Se pararmos para rezar, perdemos a luz», diz ele, sem olhar para ninguém. «Se não pararmos, Conrado não vem.»\n\nMécia ri baixinho. Lá em baixo, entre os juncos, alguma coisa se mexe contra o vento, e o teu cavalo levanta as orelhas antes de ti.\n\nA ermida tem a porta aberta. Dentro, uma vela que ninguém acendeu ainda arde.";
const LISTA_QUADRO = [
  { id: "p-conrado", tipo: "pessoa", nome: "Conrado Sem-Senhor", aqui: true, deOnde: "registo" },
  { id: "p-mecia", tipo: "pessoa", nome: "Mécia dos Juncos", aqui: true, deOnde: "registo", genero: "ela" },
  { id: "p-martim", tipo: "pessoa", nome: "Martim Cinzentos", aqui: true, deOnde: "registo" },
  { id: "p-barqueiro", tipo: "pessoa", nome: "Barqueiro", aqui: true, deOnde: "registo" },
  { id: "l-ermida", tipo: "lugar", nome: "A ermida", aqui: false, deOnde: "perto", distancia: "1 h", rumo: "norte" },
  { id: "l-porta", tipo: "lugar", nome: "porta", aqui: true, deOnde: "saida", saida: true },
  { id: "l-cova", tipo: "lugar", nome: "Cova Escura", aqui: true, deOnde: "lugar" },
  { id: "p-vela", tipo: "pessoa", nome: "a que acendeu a vela", aqui: true, deOnde: "prosa", cabeca: "vela" },
];
{
  const ms = marcasDaProsa(QUADRO, LISTA_QUADRO, {});
  t("cinco marcas, pela ordem da prosa", J(vista(ms)) === J(["Conrado", "ermida", "Martim Cinzentos", "Mécia", "porta"]), J(vista(ms)));
  t("as leis de toda saída", leis(QUADRO, ms, new Set(LISTA_QUADRO.map((x) => x.id))) === "", leis(QUADRO, ms));
  t("o 1.º «Conrado» (no 1.º parágrafo), nunca o 2.º", ms[0] && ms[0].de === QUADRO.indexOf("Conrado") && QUADRO.indexOf("Conrado", ms[0].de + 1) > 0);
  t("o 1.º «ermida» (minúscula), nunca o «A ermida» do fim", ms[1] && ms[1].de === QUADRO.indexOf("ermida"));
  t("«Martim Cinzentos» inteiro, num trecho só", ms[2] && ms[2].palavra === "Martim Cinzentos" && ms[2].id === "p-martim");
  t("«Mécia» pelo primeiro nome (o «juncos» de depois não a estende)", ms[3] && ms[3].palavra === "Mécia" && ms[3].id === "p-mecia");
  t("a saída é tocável: «Saio pela porta»", ms[4] && ms[4].id === "l-porta" && ms[4].ficha.frase === "Saio pela porta", ms[4] && ms[4].ficha.frase);
  t("o horizonte é tocável, e de cá: «Vou até a ermida»", ms[1] && ms[1].longe === false && ms[1].ficha.frase === "Vou até a ermida", ms[1] && ms[1].ficha.frase);
  t("as fichas são as de fichaParaTela (a mesma frase do toque)", ms[0] && J(ms[0].ficha) === J(FI.fichaParaTela(LISTA_QUADRO[0], {})));
  t("o barqueiro, que a resposta não nomeia, não tem marca", !ms.some((m) => m.id === "p-barqueiro"));
  t("o que só a prosa trouxe nunca marca (a «vela» é palavra da resposta)", !ms.some((m) => m.id === "p-vela"));
  t("o lugar onde se está nunca marca", !marcasDaProsa("Voltas a Cova Escura.", LISTA_QUADRO, {}).length);
  t("a forma exata: { id, palavra, de, longe, ficha }", ms[0] && J(Object.keys(ms[0])) === J(["id", "palavra", "de", "longe", "ficha"]), ms[0] && J(Object.keys(ms[0])));
}

sec("3. Respostas reais (10.ª sessão)");
{
  const s10 = lerSessao("s10");
  const fala = (n) => s10.turnos.find((x) => x.n === n).narrador.narrativa;

  /* T5 — o EM CENA da pauta era «Godfrey da Foz (taverneiro draconato) ·
     Nyla Punho-de-Pedra · Nyla Pé-Leve»; a mulher de manto e o guarda de
     elmo eram leituras da prosa; o Rossio Torto é a vila que a mulher nomeia */
  const T5 = fala(5);
  const L5 = [
    { id: "p-godfrey", tipo: "pessoa", nome: "Godfrey da Foz", papel: "taverneiro draconato", aqui: true, deOnde: "registo" },
    { id: "p-nyla-pp", tipo: "pessoa", nome: "Nyla Punho-de-Pedra", aqui: true, deOnde: "registo", genero: "ela" },
    { id: "p-nyla-pl", tipo: "pessoa", nome: "Nyla Pé-Leve", aqui: true, deOnde: "registo", genero: "ela" },
    { id: "p-manto", tipo: "pessoa", nome: "Mulher de manto", aqui: true, deOnde: "prosa", cabeca: "manto" },
    { id: "p-elmo", tipo: "pessoa", nome: "Guarda de elmo", aqui: true, deOnde: "prosa", cabeca: "elmo" },
    { id: "l-cabra", tipo: "lugar", nome: "Cabra Trêmula", aqui: true, deOnde: "lugar" },
  ];
  const m5 = marcasDaProsa(T5, L5, { cidade: "Monte Rasa" });
  t("T5: o Godfrey, uma vez só (o 2.º «Godfrey» fica prosa)", J(vista(m5)) === J(["Godfrey"]) && m5[0].de === T5.indexOf("Godfrey"), J(vista(m5)));
  t("T5: a mulher de manto e o guarda de elmo (só da prosa) não marcam", !m5.some((m) => m.id === "p-manto" || m.id === "p-elmo"));
  t("T5: as leis", leis(T5, m5, new Set(L5.map((x) => x.id))) === "", leis(T5, m5));
  /* o Rossio Torto: só nomeado pela mulher, nunca lá esteve → prosa; com
     `esteve` no livro → toca, de longe, «Vou até Rossio Torto» */
  const livroComRossio = { v: 1, pessoas: {}, lugares: { "cidade|rossio torto": { nome: "Rossio Torto", esteve: { de: 3, ate: 3, vezes: 1, turno: 2 } } } };
  const m5b = marcasDaProsa(T5, L5, { cidade: "Monte Rasa", factos: livroComRossio });
  t("T5: o Rossio Torto onde o herói já esteve toca de longe", J(vista(m5b)) === J(["Godfrey", "Rossio Torto·longe"]), J(vista(m5b)));
  t("T5: a ficha de longe é a página do Códice (Ir)", m5b[1] && m5b[1].ficha.frase === "Vou até Rossio Torto" && m5b[1].id === "cidade|rossio torto", m5b[1] && m5b[1].ficha.frase);
  const livroSoNomeado = { v: 1, pessoas: {}, lugares: { "cidade|rossio torto": { nome: "Rossio Torto" } } };
  t("T5: o Rossio Torto que o livro só conhece de nome não toca", J(vista(marcasDaProsa(T5, L5, { factos: livroSoNomeado }))) === J(["Godfrey"]));

  /* T16 — o herói está no Rossio Torto; a Saoirse anda com ele; a chave
     sem fechadura está à venda na banca */
  const T16 = fala(16);
  const L16 = [
    { id: "p-saoirse", tipo: "pessoa", nome: "Saoirse", aqui: true, deOnde: "grupo", comigo: true },
    { id: "p-barba", tipo: "pessoa", nome: "Homem de barba", aqui: true, deOnde: "prosa", cabeca: "barba" },
    { id: "c-chave", tipo: "coisa", nome: "Chave sem fechadura conhecida", preco: 50, moeda: "cobres", banca: "Banca do alpendre", aqui: true, deOnde: "banca" },
    { id: "c-vela", tipo: "coisa", nome: "Vela que não derrete", preco: 114, moeda: "cobres", banca: "Banca do alpendre", aqui: true, deOnde: "banca" },
    { id: "l-rossio", tipo: "lugar", nome: "Rossio Torto", aqui: true, deOnde: "lugar" },
  ];
  const m16 = marcasDaProsa(T16, L16, { grupo: ["Saoirse"], cidade: "Rossio Torto", factos: livroComRossio });
  t("T16: a chave à venda toca pela cabeça do nome («chave»)", J(vista(m16)) === J(["chave"]) && m16[0].id === "c-chave", J(vista(m16)));
  t("T16: o Rossio Torto é onde se está — nem de cá (fora) nem de longe (o livro tem-no)", !m16.some((m) => /Rossio/.test(m.palavra)));
  t("T16: o homem de barba (só da prosa) não marca", !m16.some((m) => m.id === "p-barba"));
  t("T16: as leis", leis(T16, m16, new Set(L16.map((x) => x.id))) === "", leis(T16, m16));

  /* T12 — a estrada de Monte Rasa a Nova Profundo; só a Saoirse com ele */
  const T12 = fala(12);
  const L12 = [{ id: "p-saoirse", tipo: "pessoa", nome: "Saoirse", aqui: true, deOnde: "grupo", comigo: true }];
  const livro12 = { v: 1, pessoas: {}, lugares: { "cidade|monte rasa": { nome: "Monte Rasa", esteve: { de: 1, ate: 4, vezes: 1, turno: 11 } }, "cidade|nova profundo": { nome: "Nova Profundo" } } };
  const m12 = marcasDaProsa(T12, L12, { factos: livro12 });
  t("T12: o companheiro, nomeado, nunca marca", !m12.some((m) => m.id === "p-saoirse"));
  t("T12: Monte Rasa (já esteve) toca de longe; Nova Profundo (nunca foi) não", J(vista(m12)) === J(["Monte Rasa·longe"]), J(vista(m12)));
  t("T12: companheiro sem `comigo`, só pelo grupo, também fica fora", !marcasDaProsa(T12, [{ id: "p-s", tipo: "pessoa", nome: "Saoirse", aqui: true, deOnde: "registo", comigo: true }], { grupo: ["Saoirse"] }).length);
}

sec("4. As palavras — compostos, acentos, maiúsculas, fronteiras");
{
  const corrado = [{ id: "p-c", tipo: "pessoa", nome: "Corrado o Ruivo", aqui: true, deOnde: "registo" }];
  const a = marcasDaProsa("Corrado o Ruivo entra; Corrado ri.", corrado, {});
  t("«Corrado o Ruivo» inteiro quando o nome inteiro vem", J(vista(a)) === J(["Corrado o Ruivo"]), J(vista(a)));
  const b = marcasDaProsa("Corrado ri. Depois, Corrado o Ruivo sai.", corrado, {});
  t("a 1.ª menção pelo primeiro nome fica «Corrado» (não salta para o inteiro de depois)", J(vista(b)) === J(["Corrado"]) && b[0].de === 0, J(vista(b)));
  /* duas fichas: o Corrado que é só Corrado e o Corrado o Ruivo */
  const dois = [...corrado, { id: "p-c2", tipo: "pessoa", nome: "Corrado", aqui: true, deOnde: "registo" }];
  const c = marcasDaProsa("Corrado o Ruivo encara Corrado.", dois, {});
  t("o nome composto ganha ao simples no mesmo sítio", c[0] && c[0].id === "p-c" && c[0].palavra === "Corrado o Ruivo", J(vista(c)));
  /* o 2.º «Corrado» seria a 1.ª ocorrência dele DENTRO de outra marca: a
     tela embrulharia o sítio errado, e o motor prefere calar */
  t("…e o «Corrado» simples depois dele não marca (a 1.ª ocorrência da palavra é a do composto)", c.length === 1, J(vista(c)));
  const c2 = marcasDaProsa("Corrado ri.", dois, {});
  t("«Corrado» sozinho é o Corrado (nome inteiro), nunca o Ruivo", c2.length === 1 && c2[0].id === "p-c2", J(c2.map((m) => m.id)));
  const nylas = [
    { id: "n1", tipo: "pessoa", nome: "Nyla Punho-de-Pedra", aqui: true, deOnde: "registo" },
    { id: "n2", tipo: "pessoa", nome: "Nyla Pé-Leve", aqui: true, deOnde: "registo" },
  ];
  t("«Nyla» com duas Nylas em cena não toca nenhuma (a prosa nunca escolhe por nós)", !marcasDaProsa("Nyla sorri.", nylas, {}).length);
  const n = marcasDaProsa("Nyla sorri, e Nyla Pé-Leve cala-se.", nylas, {});
  t("«Nyla Pé-Leve» inteira acha a dela, com o hífen e o acento", J(n.map((m) => [m.id, m.palavra])) === J([["n2", "Nyla Pé-Leve"]]), J(n.map((m) => [m.id, m.palavra])));
  const mecia = [{ id: "m", tipo: "pessoa", nome: "Mécia dos Juncos", aqui: true, deOnde: "registo" }];
  t("o acento não separa: «Mecia» escrito sem ele acha a Mécia, e a palavra é a escrita", J(vista(marcasDaProsa("Mecia ri.", mecia, {}))) === J(["Mecia"]));
  t("o acento decomposto (NFD) também", J(vista(marcasDaProsa("Mécia ri.", mecia, {}))) === J(["Mécia"]));
  t("MAIÚSCULAS contam como maiúscula: «MÉCIA DOS JUNCOS»", J(vista(marcasDaProsa("— MÉCIA DOS JUNCOS! — gritam.", mecia, {}))) === J(["MÉCIA DOS JUNCOS"]));
  const rosa = [{ id: "r", tipo: "pessoa", nome: "Rosa", aqui: true, deOnde: "registo" }];
  t("o nome próprio pede maiúscula: a «rosa» do jardim não é a Rosa", !marcasDaProsa("Uma rosa murcha no copo.", rosa, {}).length);
  t("…e a Rosa acha-se", J(vista(marcasDaProsa("Uma rosa murcha; Rosa suspira.", rosa, {}))) === J(["Rosa"]));
  const martim = [{ id: "mt", tipo: "pessoa", nome: "Martim Cinzentos", aqui: true, deOnde: "registo" }];
  t("o nome não atravessa parágrafo", J(vista(marcasDaProsa("Chega Martim\n\nCinzentos é a casa.", martim, {}))) === J(["Martim"]));
  t("o nome não atravessa vírgula", J(vista(marcasDaProsa("Martim, Cinzentos de pó.", martim, {}))) === J(["Martim"]));
  t("fronteira de palavra: «Martins» não é o Martim", !marcasDaProsa("Os Martins chegaram.", martim, {}).length);
  const rato = [{ id: "c-rato", tipo: "criatura", nome: "Rato Gigante", raiz: "rato", aqui: true, deOnde: "luta", hostil: true, quantos: 3 }];
  t("o bicho pelo plural: «ratos gigantes»", J(vista(marcasDaProsa("Três ratos gigantes saem do ralo.", rato, {}))) === J(["ratos gigantes"]));
  t("o bicho pela raiz: «o rato»", J(vista(marcasDaProsa("O rato morde.", rato, {}))) === J(["rato"]));
  t("«ratoeira» não é o rato (fronteira)", !marcasDaProsa("Há uma ratoeira no canto.", rato, {}).length);
  const atad = [{ id: "c-at", tipo: "coisa", nome: "Ataduras de linho", preco: 29, moeda: "moedas", banca: "Botica", aqui: true, deOnde: "banca" }];
  t("a coisa inteira: «ataduras de linho»", J(vista(marcasDaProsa("Ela embrulha as ataduras de linho.", atad, {}))) === J(["ataduras de linho"]));
  t("a coisa pela cabeça: «as ataduras»", J(vista(marcasDaProsa("Ela embrulha as ataduras.", atad, {}))) === J(["ataduras"]));
  t("a coisa que não está à vista (aqui: false) não marca", !marcasDaProsa("Ela embrulha as ataduras.", [{ ...atad[0], aqui: false }], {}).length);
}

sec("5. O longe — só quem o herói já viu");
{
  const memoria = {
    paginas: {
      "p-delfina": { tipo: "pessoa", nome: "Delfina", papel: "moleira", genero: "ela", cidade: "Porto das Pedras", primeiro: 10, ultimo: 12 },
      "p-teodoro": { tipo: "pessoa", nome: "Teodoro", papel: "pescador", genero: "ele", cidade: "Porto das Pedras", primeiro: 11, ultimo: 11 },
      "l-pedras": { tipo: "lugar", nome: "Pedras Altas", primeiro: 9, ultimo: 9 },
      "l-porta": { tipo: "lugar", nome: "Porta", primeiro: 9, ultimo: 9 },
      "c-rato": { tipo: "criatura", nome: "Rato gigante", primeiro: 8, ultimo: 8 },
    },
  };
  const factos = {
    v: 1,
    pessoas: {
      "Porto das Pedras|gente|Delfina": { nome: "Delfina", visto: { de: 12, ate: 12, vezes: 1, turno: 30 } },
      "Porto das Pedras|gente|Teodoro": { nome: "Teodoro", nomeado: { de: 11 } },
    },
    lugares: {},
  };
  const ctx = { memoria, factos };
  const texto = "Teodoro disse que a Delfina vive no moinho de Pedras Altas, logo depois da Porta Velha.";
  const m = marcasDaProsa(texto, [], ctx);
  t("a Delfina (página + vista no livro) toca de longe", m.some((x) => x.id === "p-delfina" && x.longe && x.palavra === "Delfina"), J(vista(m)));
  t("…e a ficha é a página do Códice: «Procuro Delfina»", (m.find((x) => x.id === "p-delfina") || {}).ficha?.frase === "Procuro Delfina");
  t("o Teodoro só nomeado (página, mas nunca visto) não toca", !m.some((x) => x.id === "p-teodoro"));
  t("o lugar com página toca de longe: «Pedras Altas»", m.some((x) => x.id === "l-pedras" && x.longe));
  t("o lugar de nome comum («Porta») nunca toca de longe", !m.some((x) => x.id === "l-porta"));
  t("a criatura da memória não toca de longe (só gente e lugares)", !marcasDaProsa("Um rato gigante passa.", [], ctx).length);
  t("as leis (ids da memória)", leis(texto, m, new Set(Object.keys(memoria.paginas))) === "", leis(texto, m));
  t("sem livro, ninguém de longe — só os lugares com página", J(vista(marcasDaProsa(texto, [], { memoria }))) === J(["Pedras Altas·longe"]), J(vista(marcasDaProsa(texto, [], { memoria }))));
  t("vista no livro mas sem página: não toca (o pedido: página E conheceu)", !marcasDaProsa("Delfina acena.", [], { factos }).length);
  t("de longe, o nome próprio pede maiúscula: «pedras altas» na frase não é o lugar", !marcasDaProsa("Sobe por pedras altas e lisas.", [], ctx).length);
  /* quem está aqui não é de longe: a mesma Delfina na lista marca de cá */
  const aqui = [{ id: "p-delfina", tipo: "pessoa", nome: "Delfina", aqui: true, deOnde: "registo" }];
  const m2 = marcasDaProsa("Delfina acena.", aqui, ctx);
  t("a Delfina em cena marca de cá (longe: false), com a ficha da cena", m2.length === 1 && m2[0].longe === false && m2[0].ficha.frase === "Falo com Delfina", J(m2.map((x) => [x.id, x.longe, x.ficha.frase])));
  /* o companheiro também tem página (abriu-se-lhe o cartão), e nunca é longe */
  const comp = [{ id: "p-saoirse", tipo: "pessoa", nome: "Saoirse", aqui: true, deOnde: "grupo", comigo: true }];
  const mem2 = { paginas: { ...memoria.paginas, "p-saoirse": { tipo: "pessoa", nome: "Saoirse", primeiro: 1, ultimo: 12 } } };
  const fac2 = { ...factos, pessoas: { ...factos.pessoas, "npc|Saoirse": { nome: "Saoirse", visto: { de: 1, ate: 12, vezes: 3, turno: 40 } } } };
  t("o companheiro com página e visto continua fora (está na lista)", !marcasDaProsa("Saoirse segue em silêncio.", comp, { memoria: mem2, factos: fac2, grupo: ["Saoirse"] }).length);
  /* o livro aceita o id da página direto, quando é o mesmo */
  t("conheceu pelo id da página, quando o livro o usa", marcasDaProsa("Delfina acena.", [], { memoria, factos: { v: 1, pessoas: { "p-delfina": { nome: "Delfina", visto: { de: 1 } } }, lugares: {} } }).length === 1);
}

sec("6. O teto — cinco, os de cá antes dos de longe");
{
  const nomes = ["Ana", "Bruno", "Carla", "Duarte", "Elisa", "Fausto", "Gil"];
  const lista = nomes.map((n, i) => ({ id: "p" + i, tipo: "pessoa", nome: n, aqui: true, deOnde: "registo" }));
  const texto = nomes.join(", ") + " estão todos à mesa.";
  const m = marcasDaProsa(texto, lista, {});
  t("sete nomes em cena → cinco marcas, os cinco primeiros da prosa", J(vista(m)) === J(nomes.slice(0, 5)), J(vista(m)));
  const memoria = { paginas: { "l-a": { tipo: "lugar", nome: "Agulha de Ferro", ultimo: 3 }, "l-b": { tipo: "lugar", nome: "Bastião Torto", ultimo: 2 }, "l-c": { tipo: "lugar", nome: "Cova Funda", ultimo: 1 } } };
  /* os de longe vêm ANTES na prosa, e mesmo assim cedem aos de cá */
  const texto2 = "Da Agulha de Ferro ao Bastião Torto e à Cova Funda, " + nomes.slice(0, 4).join(", ") + " lembram tudo.";
  const m2 = marcasDaProsa(texto2, lista, { memoria });
  t("4 de cá + 3 de longe → os 4 de cá e o 1.º de longe", J(vista(m2)) === J(["Agulha de Ferro·longe", "Ana", "Bruno", "Carla", "Duarte"]), J(vista(m2)));
  t("…de volta à ordem da prosa", m2.every((x, i) => !i || m2[i - 1].de < x.de));
  const m3 = marcasDaProsa(texto2, lista.slice(0, 2), { memoria });
  t("2 de cá + 3 de longe → todos os de longe cabem (5)", J(vista(m3)) === J(["Agulha de Ferro·longe", "Bastião Torto·longe", "Cova Funda·longe", "Ana", "Bruno"]), J(vista(m3)));
}

sec("7. As leis — determinismo, imutabilidade, lixo, e as 194 respostas");
{
  const a = marcasDaProsa(QUADRO, LISTA_QUADRO, {});
  const b = marcasDaProsa(QUADRO, LISTA_QUADRO, {});
  t("determinístico: a mesma entrada, a mesma saída", J(a) === J(b) && a.length === 5);
  t("a ordem da lista não muda as marcas", J(marcasDaProsa(QUADRO, [...LISTA_QUADRO].reverse(), {}).map((m) => [m.id, m.de])) === J(a.map((m) => [m.id, m.de])));
  const congela = (o) => { if (o && typeof o === "object") { Object.freeze(o); Object.values(o).forEach(congela); } return o; };
  const ctxC = congela({ memoria: { paginas: { "l-x": { tipo: "lugar", nome: "Pedras Altas", ultimo: 1 } } }, factos: { v: 1, pessoas: {}, lugares: {} }, grupo: ["Saoirse"] });
  const listaC = congela(JSON.parse(J(LISTA_QUADRO)));
  t("não muta a lista nem o ctx (congelados)", () => marcasDaProsa(QUADRO + " Pedras Altas.", listaC, ctxC).length === 5);
  for (const [nome, args] of [["null", [null, null, null]], ["undefined", []], ["texto vazio", ["", LISTA_QUADRO, {}]], ["só espaços", ["   \n ", LISTA_QUADRO, {}]], ["texto número", [42, LISTA_QUADRO, {}]], ["texto objeto", [{ texto: QUADRO }, LISTA_QUADRO, {}]], ["lista null", [QUADRO, null, null]], ["lista objeto", [QUADRO, { a: 1 }, {}]], ["lista de lixo", [QUADRO, [null, 1, "x", {}, { id: 3, nome: "Conrado", tipo: "pessoa", aqui: true }, { id: "z", tipo: "pessoa", aqui: true }], {}]], ["ctx de lixo", [QUADRO, [], { memoria: "x", factos: 7, grupo: "y", cidade: 3 }]]]) {
    t(`${nome} → []`, () => J(marcasDaProsa(...args)) === "[]", J(marcasDaProsa(...args)));
  }
  t("ctx null com lista boa funciona", () => marcasDaProsa(QUADRO, LISTA_QUADRO, null).length === 5);
  t("memória com páginas de lixo não derruba", () => Array.isArray(marcasDaProsa(QUADRO, LISTA_QUADRO, { memoria: { paginas: { __proto__: { tipo: "pessoa" }, x: null, y: { tipo: "lugar" } } }, factos: { lugares: { "a|b": null, constructor: { nome: "X", esteve: {} } } } })));

  /* a varredura: as 194 respostas do Mestre nas sessões gravadas, com a
     lista de cada turno tirada do EM CENA da pauta que foi com ele (a gente
     com nome, de cá; os «a quem não tem nome» como companheiros fora) */
  let respostas = 0, marcas = 0, maxMarcas = 0, comLista = 0;
  const inteirosPerdidos = [];
  const erros = [];
  for (const n of ["s8", "s9", "s10"]) {
    const s = lerSessao(n);
    for (const tu of s.turnos || []) {
      const texto = tu.narrador && tu.narrador.narrativa;
      if (typeof texto !== "string" || !texto.trim()) continue;
      respostas++;
      const pauta = String((tu.pedido && tu.pedido.pauta) || "");
      const linha = (pauta.match(/EM CENA:([^\n]*)/) || ["", ""])[1];
      const gente = linha.split(";")[0].split("·").map((x) => x.replace(/\(.*$/, "").replace(/,.*$/, "").trim()).filter((x) => x && !/^(a quem|à venda)/.test(x));
      const lista = gente.map((nome, i) => ({ id: `${n}-${tu.n}-${i}`, tipo: "pessoa", nome, aqui: true, deOnde: "registo" }));
      const ms = marcasDaProsa(texto, lista, {});
      const e = leis(texto, ms, new Set(lista.map((x) => x.id)));
      if (e) erros.push(`${n} T${tu.n}: ${e}`);
      /* quem a pauta tinha em cena e a resposta escreve por inteiro marca
         sempre (dentro do teto) */
      if ((ms || []).length < MARCAS_NA_PROSA.teto) for (const x of lista) if (primeira(texto, x.nome) >= 0 && !ms.some((m) => m.id === x.id)) inteirosPerdidos.push(`${n} T${tu.n}: ${x.nome}`);
      if (lista.length) comLista++;
      marcas += (ms || []).length;
      maxMarcas = Math.max(maxMarcas, (ms || []).length);
    }
  }
  console.log(`  ..  ${respostas} respostas varridas (${comLista} com gente em cena na pauta), ${marcas} marcas (no máximo ${maxMarcas} numa resposta)`);
  t("as 194 respostas gravadas estão todas na varredura", respostas === 194, String(respostas));
  t("nenhuma resposta gravada quebra as leis (1.ª ocorrência, sem sobrepor, sem inventar, ≤ teto)", erros.length === 0, erros.slice(0, 3).join(" | "));
  /* medido a 09/11: 54 respostas com gente na pauta (as s8 e s9 não a
     gravavam), 29 marcas — a gente sem nome próprio («Homem de manto»)
     não marca, e as duas Nylas da 10.ª calam o «Nyla» sozinho */
  t("a varredura acha nomes de verdade (não passa por estar vazia)", comLista >= 50 && marcas >= 25, `${comLista} · ${marcas}`);
  t("quem a pauta tinha em cena e a resposta escreve inteiro, marca", inteirosPerdidos.length === 0, inteirosPerdidos.slice(0, 3).join(" | "));
}

console.log(`\nmarcas da prosa (TP-1): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
