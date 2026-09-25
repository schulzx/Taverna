/* teste-v5a-cabecalho.mjs — o cabeçalho da pessoa (V5a, 25/09/2026)

   A ORDEM FOI DIRETA: *"ainda existe uma imagem procedural, vamos tirar
   ela e deixar exatamente igual à imagem do Figma"* — o nó `129:4`
   (`parchment-header`) do arquivo `ffWFqD7TueSb88Mkeg9bhW`. A gravura de
   R13-B saiu da tela e o topo do papel passou a ser `CabecalhoDaPagina`.

   O QUE ESTA SUÍTE GUARDA, por ordem:
   1. AS MEDIDAS DO NÓ, em tabela, e a soma que o nó mede (69 px). Um
      número do Figma mudado à mão fica vermelho aqui — "exatamente igual"
      só se prova se a conta se refizer.
   2. OS PARES DE COR, medidos: a etiqueta do lugar e a da luz contra o poço.
   3. O QUE AS ETIQUETAS DIZEM (`etiquetasDaPagina`, em Node), contra o
      `palco.js` real — incluindo quem cede primeiro no telefone.
   4. A PEÇA E A FIAÇÃO, no texto: a degradação sem medição, a linha que
      nunca quebra, a runa que é uma forma só, o fim da página sem custo.
   5. O QUE MORREU CONTINUA MORTO: a gravura não volta por nenhuma porta. */
import { readFileSync, existsSync } from "node:fs";
import { T, TIPOS, RUNA, CABECALHO_DA_PAGINA, FLOREADO, alfa } from "../src/estilo.js";
import * as ESTILO from "../src/estilo.js";
import { etiquetasDaPagina, CLIMA_QUE_SE_CALA } from "../src/glifos.js";
import { cabecalhoDaCena } from "../src/palco.js";
import * as HORA from "../src/hora-e-prazo.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const semComentario = (x) => x.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
/* V4: lidas sem o CR — a régua não pode depender do fim de linha (v9.176). */
const UI = readFileSync("../src/ui.jsx", "utf8").split(String.fromCharCode(13)).join("");
const APP = readFileSync("../src/App.jsx", "utf8").split(String.fromCharCode(13)).join("");
const corpoDe = (txt, ini, fim) => txt.slice(txt.indexOf(ini), txt.indexOf(fim, txt.indexOf(ini) + ini.length));

/* ============================================================ */
sec("1. as medidas do 129:4, em tabela, e a soma que o nó mede");
{
  const C = CABECALHO_DA_PAGINA;
  /* O NÓ MEDE 69 × 1142: pt 20 · linha 13 · gap 12 · runa 8 · pb 16. */
  t(`o cabeçalho mede 69 px: ${C.cima} + ${C.linha} + ${C.entre} + ${RUNA.ponto} + ${C.baixo}`,
    C.cima + C.linha + C.entre + RUNA.ponto + C.baixo === 69);
  t("o enchimento é o do nó: 20 em cima, 16 em baixo, 24 dos lados", C.cima === 20 && C.baixo === 16 && C.lado === 24);
  t("a etiqueta é JetBrains Mono 10 numa linha de 13, e a do lugar rastreia 1,8", C.letra === 10 && C.linha === 13 && C.espacamento === 1.8);
  /* A EXCEÇÃO AO PISO É ESCRITA E ÚNICA: a letra do cabeçalho está abaixo
     de TIPOS.piso porque a pessoa pediu o nó ao pixel. O dente guarda que
     a exceção continua a ser ESTA e que o piso da casa não desceu por
     arrasto — se alguém baixar TIPOS.piso "para caber", fica vermelho. */
  t("a letra do cabeçalho está abaixo do piso, e o piso continua 12 (a exceção é esta, não a regra)",
    C.letra < TIPOS.piso && TIPOS.piso === 12);
  /* A RUNA: fio 40, três pontos de 8 a cada 16 (o imgFrame 40×8: 4 · 20 · 36), gap 12. */
  t("os três pontos cabem nos 40 px do imgFrame do nó", RUNA.passo * (RUNA.pontos.length - 1) + RUNA.ponto === 40 && RUNA.ponto === 8);
  t("o traço curto é 40 e o espaço entre as partes é 12", RUNA.fio === 40 && RUNA.espaco === 12);
  t("os pontos são âmbar · mundo · rosa, por NOME de T", RUNA.pontos.join() === "amber,mundo,rosa" && RUNA.pontos.every((n) => typeof T[n] === "string"));
  t("e são as cores do nó (#FFB03A · #00BBF9 · #F15BB5)",
    [T.amber, T.mundo, T.rosa].map((c) => c.toUpperCase()).join() === "#FFB03A,#00BBF9,#F15BB5");
  t("o traço é âmbar a 0,2 — o rgba(255,176,58,0.2) do nó", alfa(T.amber, RUNA.alfaDoFio) === "rgba(255,176,58,0.2)");
  t("o chão do cabeçalho é o poço (#0F0C18) e as etiquetas são T.amber e T.inkDim (#9B93AC)",
    T.pagina.toUpperCase() === "#0F0C18" && T.inkDim.toUpperCase() === "#9B93AC");
  /* O FLOREADO do 129:40: barras de 4 com 4 entre elas, pousadas pela base. */
  t("o floreado são quatro barras de 4 px de cada lado, com as alturas do nó",
    FLOREADO.barra === 4 && FLOREADO.espaco === 4
    && FLOREADO.esquerda.join() === "12,20,16,14" && FLOREADO.direita.join() === "14,18,12,16");
  /* O FLOREADO NÃO PODE ROUBAR ALTURA À PROSA (a condição do `regente`): na
     linha da runa ele transborda (alto − 8) / 2 para cima e para baixo, e o
     ar que o fim do registro já tinha é 16 acima e 24 abaixo. */
  const transborda = (Math.max(...FLOREADO.esquerda, ...FLOREADO.direita) - RUNA.ponto) / 2;
  t(`o floreado cabe no ar que o fim do registro já tinha (transborda ${transborda} px; há 16 acima e 24 abaixo)`,
    transborda <= 16 && transborda <= 24);
}

/* ============================================================ */
sec("2. os pares de cor, medidos (WCAG 2.1)");
{
  const L = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [16, 8, 0].map((s) => ((n >> s) & 255) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
  };
  const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const lugar = cr(T.amber, T.pagina), luz = cr(T.inkDim, T.pagina);
  /* A LETRA É 10, logo o piso que se pede aqui é o de texto pequeno — e o
     lugar, que é a MORADA dele na tela, pede AAA (7:1). A luz repete o que
     `O TEMPO` já diz, e pede AA (4,5:1). */
  t(`o lugar (âmbar) contra o poço passa AAA: ${lugar.toFixed(2)}:1 ≥ 7`, lugar >= 7);
  t(`a luz e o ar (inkDim) contra o poço passam AA: ${luz.toFixed(2)}:1 ≥ 4,5`, luz >= 4.5);
  /* e os pontos da runa são FORMA sem sentido (decorativos): o piso é só
     serem perceptíveis, e nenhum desce de 3:1 */
  const pontos = RUNA.pontos.map((n) => cr(T[n], T.pagina));
  t(`os três pontos distinguem-se do poço (${pontos.map((x) => x.toFixed(2)).join(" · ")}) ≥ 3`, pontos.every((x) => x >= 3));
}

/* ============================================================ */
sec("3. o que as etiquetas dizem — em Node, contra o palco.js real");
{
  const e = etiquetasDaPagina;
  /* À SUPERFÍCIE: o lugar à esquerda, a luz e o clima à direita. */
  const cidade = e({ lugar: "Forte Rasa", cena: cabecalhoDaCena({ cidade: "Forte Rasa", minuto: 1320 }), luz: "noite", clima: { id: "chuva", rotulo: "chuva" } });
  t("na cidade: o lugar à esquerda; a luz e o clima à direita, por esta ordem",
    cidade.lugar === "Forte Rasa" && cidade.direita.join("|") === "noite|chuva", JSON.stringify(cidade));
  /* O CÉU LIMPO NÃO SE ESCREVE — era o defeito medido do cartão de v9.157:
     `noite · ensolarado` às 22:00. */
  const limpo = e({ lugar: "Forte Rasa", luz: "noite", clima: { id: "ensolarado", rotulo: "ensolarado" } });
  t("o céu limpo não se escreve: `ensolarado` às 22:00 não aparece", limpo.direita.join("|") === "noite", JSON.stringify(limpo));
  t("sem clima, só a luz", e({ lugar: "X", luz: "dia" }).direita.join("|") === "dia");
  /* O TRAVESSÃO DOS NOMES DE MASMORRA PASSA A SER O PONTO DO FIGMA. */
  t("`Andar 1 — do Silêncio` passa a `Andar 1 · do Silêncio`", e({ lugar: "Andar 1 — do Silêncio" }).lugar === "Andar 1 · do Silêncio");
  t("as maiúsculas NÃO são da conta (são da peça, por CSS — o leitor de tela lê a palavra)", e({ lugar: "Vale Torto" }).lugar === "Vale Torto");
  t("à superfície, quem cede no telefone é o FIM (o clima)", cidade.cede === "fim");
  t("o céu que se cala é tabela, não `if`", Array.isArray(CLIMA_QUE_SE_CALA) && CLIMA_QUE_SE_CALA.includes("ensolarado"));
  /* NA MASMORRA: a camada e as tochas, pelo que `palco.js` decide, na ordem
     de um endereço (do maior para o menor). Mas quem CEDE é a camada — o
     INÍCIO: a tocha é recurso, e é ela que fica quando só cabe um termo. */
  const mm = cabecalhoDaCena({ masmorra: { nome: "Andar 1 — do Silêncio", atual: 3, tochas: 3, salas: [{ id: 3, camada: 1 }] }, minuto: 1320 });
  const baixo = e({ lugar: "Andar 1 — do Silêncio", cena: mm, luz: "noite", clima: { id: "chuva", rotulo: "chuva" } });
  t("na masmorra: a camada e as tochas, nesta ordem — e sem luz nem clima (lá em baixo não há hora)",
    baixo.direita.join("|") === "camada 1|3 tochas", JSON.stringify(baixo) + " · onde=" + JSON.stringify(mm && mm.onde));
  t("e lá em baixo quem cede é o INÍCIO (a camada), para a tocha ficar", baixo.cede === "inicio");
  t("uma tocha no singular, como o palco a escreve",
    e({ cena: cabecalhoDaCena({ masmorra: { nome: "X", tochas: 1, salas: [] } }) }).direita.join("|") === "1 tocha");
  t("zero tochas diz `sem tochas` — `0` lê-se como contagem, `sem` lê-se como perigo",
    e({ cena: cabecalhoDaCena({ masmorra: { nome: "X", tochas: 0, salas: [] } }) }).direita.join("|") === "sem tochas");
  t("sem tochas conhecidas, fica a camada",
    e({ cena: cabecalhoDaCena({ masmorra: { nome: "X", atual: 1, salas: [{ id: 1, camada: 2 }] } }) }).direita.join("|") === "camada 2");
  /* NADA SABIDO, NADA MOSTRADO — e nunca lança. */
  const vazio = e(null);
  t("nada sabido, nada mostrado — e `null` não lança", vazio.lugar === "" && vazio.direita.length === 0);
  t("lixo também não", (() => { try { const r = e("lixo"); return r.lugar === "" && r.direita.length === 0; } catch { return false; } })());
  t("a direita nunca traz termo vazio", e({ lugar: "X", luz: "", clima: { id: "chuva", rotulo: "" } }).direita.length === 0);
}

/* ============================================================ */
sec("4. a peça e a fiação");
{
  const cab = semComentario(corpoDe(UI, "export function CabecalhoDaPagina", "function barrasDoFloreado"));
  const runa = semComentario(corpoDe(UI, "export function DivisoriaRunica", "export function CabecalhoDaPagina"));
  const fim = semComentario(corpoDe(UI, "export function FimDaPagina", "\n}\n") + "\n}");
  t("a peça tem a assinatura combinada: `CabecalhoDaPagina({ lugar = \"\", direita = [], cede = \"fim\" })`",
    /export function CabecalhoDaPagina\(\{ lugar = "", direita = \[\], cede = "fim" \}\)/.test(UI));
  t("todas as medidas saem das tabelas — nenhum número de leiaute escrito à mão",
    /CABECALHO_DA_PAGINA/.test(cab) && !/(?:fontSize|height|gap|padding|letterSpacing|lineHeight|columnGap):\s*\d/.test(cab + runa + fim),
    "o nó é 'exatamente igual' porque a conta se refaz; um número solto deixa de se refazer");
  /* A LINHA NUNCA QUEBRA: altura fixa, nowrap, e as maiúsculas por CSS. */
  t("a linha das etiquetas tem altura fixa e não quebra", /height: C\.linha/.test(cab) && /whitespace-nowrap/.test(cab) && /uppercase/.test(cab));
  /* A DEGRADAÇÃO SEM MEDIÇÃO: a direita é uma fila que quebra dentro de uma
     caixa de uma linha com overflow escondido, e o espaçador de 0 px deixa o
     PRIMEIRO termo descer também (sem ele, ficava cortado a meio). */
  t("a direita cede termo a termo: fila que quebra, uma linha de alto, overflow escondido",
    /flex flex-wrap overflow-hidden/.test(cab) && /flex: "1 1 0%"/.test(cab) && /minWidth: 0, height: C\.linha/.test(cab));
  t("e o espaçador de 0 px vem antes do primeiro termo", /<span style=\{\{ width: 0 \}\} \/>\s*\{doFim \? pecas : pecas\.slice\(\)\.reverse\(\)\}/.test(cab));
  t("quando cede o início, a fila corre ao contrário (lê-se igual, quebra pela outra ponta)",
    /doFim \? "justify-end" : "flex-row-reverse justify-start"/.test(cab));
  t("o leitor de tela ouve a linha inteira, na ordem certa", /<span className="sr-only">\{termos\.join\(" · "\)\}<\/span>/.test(cab));
  t("o lugar só encurta depois, com reticência, e cresce até o que diz", /className="truncate" style=\{\{ flex: "0 1 auto", minWidth: 0, color: T\.amber/.test(cab));
  t("a peça não mede nada: sem ResizeObserver, sem estado, sem efeito", !/ResizeObserver|useState|useEffect|useRef/.test(cab));
  t("e não anima", !/animation|transition|tv-fade|tv-slide|tv-pulse/.test(cab + runa + fim));
  /* A RUNA É UMA FORMA SÓ: o cabeçalho e o fim da página usam DivisoriaRunica. */
  t("a runa do cabeçalho e a do fim da página são a mesma peça", /<DivisoriaRunica respiro=\{0\} \/>/.test(cab) && /<DivisoriaRunica respiro=\{0\} \/>/.test(fim));
  t("e a runa desenha-se de RUNA, com os pontos de T por nome", /RUNA\.pontos\.map/.test(runa) && /fill=\{T\[nome\]\}/.test(runa) && /alfa\(T\.amber, RUNA\.alfaDoFio\)/.test(runa));
  t("a runa solta guarda o ar de sempre (as oito da criação do mundo não mudam de ritmo)",
    /export function DivisoriaRunica\(\{ respiro = RUNA\.respiro \}\)/.test(UI) && RUNA.respiro === 8);
  t("nenhuma runa à mão sobrou no App (a gema em losango de v9.173)", !/rotate\(45deg\)", border: `1px solid \$\{T\.amber\}`/.test(APP + UI));
  /* O FIM DA PÁGINA CUSTA 0 px: tem a altura do marcador que o fimRef já era (8). */
  t("o fim da página tem a altura do marcador que substituiu (8 px = RUNA.ponto)", /style=\{\{ height: RUNA\.ponto, gap: RUNA\.espaco \}\}/.test(fim) && RUNA.ponto === 8);
  t("e é o fimRef que o leva — a seta \"ir para o fim\" continua a ir para o mesmo sítio",
    /<div ref=\{fimRef\}><FimDaPagina \/><\/div>/.test(APP) && !/<div ref=\{fimRef\} style=\{\{ height: 8 \}\} \/>/.test(APP));
  t("tudo decorativo é aria-hidden (a runa e o floreado)", /aria-hidden="true"/.test(runa) && /aria-hidden="true"/.test(fim));
  /* O FIO DO CARTÃO É POR DENTRO, como o do Figma (strokeAlign INSIDE): é
     isso que põe o cabeçalho a 24 px da borda e não a 25. */
  t("o fio do cartão é por dentro (outline −1), e não border",
    /style=\{\{ background: T\.pagina, outline: `1px solid \$\{T\.line\}`, outlineOffset: -1 \}\}/.test(APP)
    && !/style=\{\{ background: T\.pagina, border: `1px solid \$\{T\.line\}` \}\}/.test(APP));
  t("o cabeçalho está no topo do papel, antes da área que rola",
    APP.indexOf("<CabecalhoDaPagina {...etiquetasDaPagina(") > 0
    && APP.indexOf("<CabecalhoDaPagina {...etiquetasDaPagina(") < APP.indexOf("flex-1 overflow-y-auto overflow-x-hidden"));
}

/* ============================================================ */
sec("5. o que morreu continua morto");
{
  t("rosto-da-cena.jsx e gravura-da-cena.js já não existem",
    !existsSync("../src/rosto-da-cena.jsx") && !existsSync("../src/gravura-da-cena.js"));
  t("hora-e-prazo.js guarda só o que tinha outro leitor: o prazo e a luz da hora",
    Object.keys(HORA).sort().join() === ["AMPULHETA", "APERTOS", "CONTAS", "HORARIO_DA_LUZ", "LUZES", "apertoDoPrazo", "areiaDaAmpulheta", "luzDaHora", "palavraDoPrazo"].sort().join(),
    Object.keys(HORA).join(", "));
  t("LUZ_DA_CENA saiu de estilo.js", !("LUZ_DA_CENA" in ESTILO));
  t("e a folha já não tem a degradação da gravura", !/tv-gravura/.test(ESTILO.FOLHA));
  const vivo = semComentario(APP);
  t("o App não monta gravura nenhuma, nem o cartão de v9.157, nem a marca de chegada inerte",
    !/RostoDaCena|OTopoDoPapel|CabecalhoDaCena|lugarAntesRef/.test(vivo));
}

console.log(`\nV5a · o cabeçalho da pessoa: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
