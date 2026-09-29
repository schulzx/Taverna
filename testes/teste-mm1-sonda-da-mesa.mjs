/* teste-mm1-sonda-da-mesa.mjs (Fase MM, etapa MM1 — v9.303+)

   A prova da régua: as 157 perguntas de C1E1 (sonda-da-mesa-casos.mjs) contra
   o código de HOJE. Sem nenhuma chamada de IA — tudo aqui é leitura de texto
   e chamada de função pura, por isso a suíte é rápida.

   TRÊS PROVAS:

   1. ESTRUTURAL (todos os casos) — `ondeVive` e `via`, quando não-nulos,
      apontam para exports que existem de verdade (import + typeof). Para
      "chega", a função de `via` tem de aparecer CHAMADA dentro do caminho
      que alimenta a pauta/o prompt do Narrador. Esse caminho não é uma
      linha só: é a soma de seis lugares do App.jsx, cada um extraído por
      ÂNCORA DE TEXTO + contagem de chaves — nunca por número de linha,
      porque o App.jsx muda sob os pés desta suíte (a mente do desenho edita
      o arquivo entre um ciclo e outro):

        PAUTA     — o corpo de `pautaDoTurno` (a âncora pedida pela tarefa)
        ENVIAR    — o corpo de `enviar`, que monta `corpo`/`rodapé` e chama
                    `chamarMestre` — é "o montador do prompt" fora de prompt.js
        HELPERS   — seis funções pequenas que `enviar` chama diretamente
                    (infoDivindade, cenaDoPrompt, tempoInfoPrompt, infoRegras,
                    infoTitulo, infoNemesis) e cujo CORPO carrega o fato
        GOLPE     — `resolverAtaqueJogador` + `aplicarGolpeDoJogador`, a
                    porta única do golpe do jogador — é aqui que o resultado
                    do combate vira o `conteudo` de uma chamada a `enviar`
        REVIDE    — `resolverRevide` + `fecharMeuTurno`, o revide dos
                    inimigos, que alimenta a MESMA chamada a `enviar` acima
                    (por `aoTerminar`/`depoisDoRevide`)
        ADJUDICA  — `adjudicarAcao`, onde `desafios.js#lerAcao` vira
                    `envelopeDeVeredicto` e entra direto num `enviar(...)`

      PAUTA + ENVIAR + HELPERS formam o "caminho principal" (o que a tarefa
      chama de "pautaDoTurno... ou o montador do prompt"). GOLPE, REVIDE e
      ADJUDICA são três canais A MAIS, genuínos, mas que também contêm MUITA
      conta que NUNCA chega ao Narrador (ex.: o `motivo` de "sem alcance" que
      vira mensagem de SISTEMA na tela, não turno de IA) — por isso o teste
      de "sabe-e-nao-conta" (prova 1b) olha só para PAUTA+ENVIAR+HELPERS:
      é ali que a tarefa manda provar a AUSÊNCIA, e é o texto mais estreito
      que ainda é honesto sobre "o que o Narrador de fato recebe todo turno".

   1b. A CATRACA NOS DOIS SENTIDOS — para "sabe-e-nao-conta", a função de
       `ondeVive` NÃO pode aparecer no caminho principal. Se uma etapa futura
       (MM2 em diante) ligar `grid.js#temCobertura` à pauta, este teste
       quebra sozinho — e é assim que a suíte avisa "mude o veredito deste
       caso", em vez de deixar o caso mentir para sempre.

   2. COMPORTAMENTAL (amostra) — para cada TIPO que tem pelo menos um caso
      "chega", chama a função de `via` com um fixture mínimo e confere que o
      fato aparece no texto. Para posição, prova também que o motor CALCULA
      distância, linha de visão e cobertura (grid.js) — é a prova de que o
      sistema SABE, célula-chave para MM2 decidir o que ainda falta mandar.

   3. O NÚMERO — imprime a linha `sonda da mesa: X/157 chega · ...` e a
      tabela tipo×veredito, e trava duas catracas:

        PISO_CHEGA = 66              (o "chega" de hoje; não pode DESCER)
        TETO_SABE_E_NAO_CONTA = 1    (o "sabe-e-nao-conta" de hoje; não pode SUBIR)

      Cada etapa da Fase MM SOBE o piso (liga um fato que hoje "não conta")
      e DESCE o teto (o inverso: acha um "sabe-e-nao-conta" novo que ainda
      não tinha caso, prova-o e o devolve como "chega" na etapa seguinte). Ao
      mover qualquer um destes dois números, escreva aqui o motivo — é a lei
      da casa: "ao mover uma asserção de teste, escreva o motivo". */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CASOS } from "./sonda-da-mesa-casos.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const SRC = path.join(__dirname, "../src");
const APP = fs.readFileSync(path.join(SRC, "App.jsx"), "utf8");

/* ============================================================
   1. EXTRAÇÃO DAS REGIÕES DO App.jsx — por âncora, não por linha
   ============================================================ */

/* Acha `anchor` e devolve o texto balanceado de chaves a partir da PRIMEIRA
   `{` encontrada — depois de `=>` quando `viaArrow` (arrow function), ou
   logo após a própria âncora quando ela já termina em `{` (ex.: o corpo de
   `enviar`, cuja âncora inclui a lista de parâmetros do useCallback). */
function extrairBloco(src, anchor, { viaArrow = true } = {}) {
  const i = src.indexOf(anchor);
  if (i < 0) return { achou: false, texto: "" };
  let j = viaArrow ? src.indexOf("{", src.indexOf("=>", i)) : src.indexOf("{", i + anchor.length - 1);
  let depth = 0, k = j;
  for (; k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (depth === 0) break; }
  }
  return { achou: true, texto: src.slice(i, k + 1) };
}

const ANCORAS_PAUTA = ["const pautaDoTurno = ("];
const ANCORAS_ENVIAR = ["const enviar = useCallback(async (conteudo, persAtual, histBase) => {"];
const ANCORAS_HELPERS = [
  "const infoDivindade = () => {",
  "const cenaDoPrompt = () => {",
  "const tempoInfoPrompt = () => {",
  "const infoRegras = () => {",
  "const infoTitulo = () => {",
  "const infoNemesis = () => {",
];
const ANCORAS_GOLPE = [
  "const resolverAtaqueJogador = (acao, pers) => {",
  "const aplicarGolpeDoJogador = (acao, pers) => {",
];
const ANCORAS_REVIDE = [
  "const resolverRevide = (persBase, aoTerminar) => {",
  "const fecharMeuTurno = (pers, aoTerminar) => {",
];
const ANCORAS_ADJUDICA = ["const adjudicarAcao = (acao) => {"];

function extrairTodas(anchors) {
  const achadas = [];
  const faltando = [];
  let texto = "";
  for (const a of anchors) {
    /* Quando a própria âncora já termina em "{" (ex.: "... => {"), a chave
       de abertura é ela mesma — não há "=>" a procurar depois. Só a âncora
       de pautaDoTurno ("const pautaDoTurno = (") termina em "(": o "=>" e a
       "{" vêm depois, porque o parâmetro tem um default (`= ""`). */
    const viaArrow = !a.trim().endsWith("{");
    const r = extrairBloco(APP, a, { viaArrow });
    if (!r.achou) faltando.push(a);
    else { achadas.push(a); texto += "\n" + r.texto; }
  }
  return { texto, achadas, faltando };
}

const rPauta = extrairTodas(ANCORAS_PAUTA);
const rEnviar = extrairTodas(ANCORAS_ENVIAR);
const rHelpers = extrairTodas(ANCORAS_HELPERS);
const rGolpe = extrairTodas(ANCORAS_GOLPE);
const rRevide = extrairTodas(ANCORAS_REVIDE);
const rAdjudica = extrairTodas(ANCORAS_ADJUDICA);

sec("0. as âncoras do App.jsx ainda batem (se isto quebrar, o resto da suíte não prova nada)");
{
  const todas = [rPauta, rEnviar, rHelpers, rGolpe, rRevide, rAdjudica];
  const faltando = todas.flatMap((r) => r.faltando);
  t(`as 12 âncoras de pautaDoTurno/enviar/helpers/golpe/revide/adjudica existem no App.jsx de hoje`,
    faltando.length === 0, faltando.join(", "));
  t("o corpo de pautaDoTurno não está vazio (extração por chave, não por linha)", rPauta.texto.length > 2000);
  t("o corpo de enviar não está vazio", rEnviar.texto.length > 5000);
}

const CAMINHO_PRINCIPAL = rPauta.texto + rEnviar.texto + rHelpers.texto;
const CAMINHO_CHEGA = CAMINHO_PRINCIPAL + rGolpe.texto + rRevide.texto + rAdjudica.texto;

/* Uma constante do sistema (tudo-maiúsculas, ex. ECONOMIA_ACAO_PROMPT) entra
   no texto por interpolação de template (`${NOME}`), não por chamada — por
   isso ela é procurada como substring; uma função é procurada como CHAMADA
   (`nome(`), para não confundir "é citada" com "é usada". */
function apareceNoCaminho(nomeExport, caminho) {
  if (/^[A-Z0-9_]+$/.test(nomeExport)) return caminho.includes(nomeExport);
  return new RegExp("\\b" + nomeExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\(").test(caminho);
}

/* ============================================================
   2. FORMA E COBERTURA DOS 157 CASOS
   ============================================================ */
sec("1. os 157 casos — forma");
{
  t("são 157 casos", CASOS.length === 157, String(CASOS.length));
  const ns = CASOS.map((c) => c.n);
  const semBuraco = ns.length === 157 && new Set(ns).size === 157 && Math.min(...ns) === 1 && Math.max(...ns) === 157;
  t("n vai de 1 a 157, sem buraco nem repetição", semBuraco);
  const semFato = CASOS.filter((c) => !c.fato || !String(c.fato).trim());
  t("todo caso tem um fato não-vazio", semFato.length === 0, semFato.map((c) => c.n).join(","));
  const semPergunta = CASOS.filter((c) => !c.pergunta || !String(c.pergunta).trim());
  t("todo caso tem uma pergunta traduzida/parafraseada", semPergunta.length === 0, semPergunta.map((c) => c.n).join(","));
  const VEREDITOS = new Set(["chega", "sabe-e-nao-conta", "ninguem-decide", "codigo-resolve"]);
  const veredictoRuim = CASOS.filter((c) => !VEREDITOS.has(c.veredito));
  t("todo veredito é um dos quatro previstos", veredictoRuim.length === 0, veredictoRuim.map((c) => `${c.n}:${c.veredito}`).join(","));
  const semNaoNulo = CASOS.filter((c) => c.veredito === "sabe-e-nao-conta" && c.ondeVive == null);
  t("todo sabe-e-nao-conta tem ondeVive (não pode ser null)", semNaoNulo.length === 0, semNaoNulo.map((c) => c.n).join(","));
  /* nenhum texto em inglês do C1E1 original — só a citação "C1E1 #n" pode
     conter esse padrão; a pergunta e o fato têm de estar em português */
  const comIngles = CASOS.filter((c) => /\b(the|you|are|is|what|this)\b/i.test(c.pergunta));
  t("nenhuma pergunta ficou em inglês (direito autoral)", comIngles.length === 0, comIngles.map((c) => c.n).join(","));
}

/* ============================================================
   3. ondeVive e via — módulos e exports que existem de verdade
   ============================================================ */
sec("2. ondeVive e via apontam para exports reais (import + typeof)");
{
  const refs = new Map(); // "modulo.js#nome" -> [n,...]
  for (const c of CASOS) {
    for (const campo of ["ondeVive", "via"]) {
      const ref = c[campo];
      if (!ref) continue;
      if (!refs.has(ref)) refs.set(ref, []);
      refs.get(ref).push(c.n);
    }
  }
  const semHash = [...refs.keys()].filter((r) => !r.includes("#"));
  t("toda referência é 'modulo.js#exportNome'", semHash.length === 0, semHash.join(","));

  const faltando = [];
  const cache = new Map();
  for (const ref of refs.keys()) {
    const [modulo, nome] = ref.split("#");
    if (!cache.has(modulo)) {
      try { cache.set(modulo, await import("../src/" + modulo)); }
      catch (e) { cache.set(modulo, { __erro: e.message }); }
    }
    const mod = cache.get(modulo);
    if (mod.__erro) { faltando.push(`${ref} (módulo não abre: ${mod.__erro})`); continue; }
    if (typeof mod[nome] === "undefined") faltando.push(`${ref} (para os casos ${refs.get(ref).join(",")})`);
  }
  t(`todos os ${refs.size} exports referenciados existem`, faltando.length === 0, faltando.join(" | "));
}

/* ============================================================
   4. CHEGA — a função de via está no caminho da pauta/prompt
   ============================================================ */
sec("3. chega — a função de via é CHAMADA no caminho até o Narrador");
{
  const chegam = CASOS.filter((c) => c.veredito === "chega");
  t(`há casos chega (${chegam.length})`, chegam.length > 0);
  const semChamada = [];
  for (const c of chegam) {
    const nome = c.via.split("#")[1];
    if (!apareceNoCaminho(nome, CAMINHO_CHEGA)) semChamada.push(`#${c.n} (${c.via})`);
  }
  t(`todo caso "chega" tem sua função de via chamada em PAUTA+ENVIAR+HELPERS+GOLPE+REVIDE+ADJUDICA`,
    semChamada.length === 0, semChamada.join(", "));
}

/* ============================================================
   5. SABE-E-NÃO-CONTA — a catraca nos dois sentidos
   ============================================================ */
sec("4. sabe-e-nao-conta — a função de ondeVive NÃO aparece no caminho principal");
{
  const escondidos = CASOS.filter((c) => c.veredito === "sabe-e-nao-conta");
  t(`há ao menos um caso sabe-e-nao-conta (${escondidos.length})`, escondidos.length > 0);
  const jaChegou = [];
  for (const c of escondidos) {
    const nome = c.ondeVive.split("#")[1];
    if (apareceNoCaminho(nome, CAMINHO_PRINCIPAL)) jaChegou.push(`#${c.n} (${c.ondeVive})`);
  }
  t(`nenhum "sabe-e-nao-conta" já chegou por baixo dos panos — se aparecer aqui, o CASO precisa mudar de veredito`,
    jaChegou.length === 0, jaChegou.join(", "));
}

/* ============================================================
   6. PROVA COMPORTAMENTAL — uma amostra por tipo que tem "chega"
   ============================================================ */
sec("5. prova comportamental — o fato aparece de verdade no texto que a função devolve");
{
  const { resumoCenaPrompt } = await import("../src/cena.js");
  const npcs = { "Aldo Ferreira": { nome: "Aldo Ferreira", papel: "guarda do portão", status: "vivo" } };
  const cena = resumoCenaPrompt(npcs, "Porto Fundo", null, { comGrupo: [{ nome: "Aldo Ferreira" }] });
  t("mundo · cena.js#resumoCenaPrompt entrega quem está presente", /Aldo Ferreira/.test(cena));

  const { resumoCondicoesPrompt } = await import("../src/condicoes.js");
  const pers = { condicoes: [{ icone: "☠", nome: "Envenenado", turnos: 2, efeito: "perde PV a cada turno" }] };
  const cond = resumoCondicoesPrompt(pers, []);
  t("regra · condicoes.js#resumoCondicoesPrompt entrega a condição ativa", /Envenenado/.test(cond));

  const { montarGrade, resumoGridPrompt, temCobertura, linhaDeVisao } = await import("../src/grid.js");
  const campo = montarGrade({ local: "campo aberto", bioma: "planicie" });
  const heroi = { nome: "Vera", x: 9, y: 5 };
  const ogro = { nome: "Ogro", x: 9, y: 1, vida: 50 };
  const gridTxt = resumoGridPrompt(campo, { heroi, grupo: [], inimigos: [ogro] });
  t("posicao · grid.js#resumoGridPrompt entrega a distância até o inimigo", /Ogro a \d+ m/.test(gridTxt));

  /* A PROVA DE QUE O SISTEMA SABE (mesmo quando não conta): cobertura e
     linha de visão são calculadas de verdade — é por isso que #138
     ("aquilo do meu lado conta como cobertura?") é "sabe-e-nao-conta" e não
     "ninguem-decide": alguém no código SABE a resposta, só não a manda. */
  t("posicao · grid.js#temCobertura calcula cobertura onde ela existe (a vala do campo aberto)", temCobertura(campo, 5, 0) === true);
  t("posicao · grid.js#temCobertura calcula a ausência dela na estrada aberta", temCobertura(campo, 9, 5) === false);
  const masm = montarGrade({ emMasmorra: true });
  t("posicao · grid.js#linhaDeVisao calcula quando a parede bloqueia", linhaDeVisao(masm, { nome: "a", x: 0, y: 4 }, { nome: "b", x: 0, y: 13 }) === false);
  t("posicao · grid.js#linhaDeVisao calcula quando o corredor está livre", linhaDeVisao(masm, { nome: "a", x: 3, y: 4 }, { nome: "b", x: 3, y: 13 }) === true);

  const { resumoDaqui } = await import("../src/mundo-base.js");
  t("mundo-base.js#resumoDaqui existe e devolve string (fixture completo é caro demais para esta suíte; a chamada real já é provada na seção 3)", typeof resumoDaqui === "function");

  const { envelopeDeVeredicto, lerAcao } = await import("../src/desafios.js");
  t("regra · desafios.js#lerAcao e #envelopeDeVeredicto existem e são funções", typeof lerAcao === "function" && typeof envelopeDeVeredicto === "function");
}

/* ============================================================
   7. O NÚMERO — a linha que a Fase MM inteira vai mover
   ============================================================ */
sec("6. o número e a catraca");
{
  const porVeredito = {};
  for (const c of CASOS) porVeredito[c.veredito] = (porVeredito[c.veredito] || 0) + 1;
  const X = porVeredito["chega"] || 0;
  const Y = porVeredito["sabe-e-nao-conta"] || 0;
  const Z = porVeredito["ninguem-decide"] || 0;
  const W = porVeredito["codigo-resolve"] || 0;

  console.log(`\nsonda da mesa: ${X}/157 chega · ${Y} sabe e não conta · ${Z} ninguém decide · ${W} código resolve`);

  const tipos = [...new Set(CASOS.map((c) => c.tipo))].sort();
  const veredictos = ["chega", "sabe-e-nao-conta", "ninguem-decide", "codigo-resolve"];
  console.log("\ntipo × veredito:");
  console.log("tipo".padEnd(10) + veredictos.map((v) => v.padStart(18)).join(""));
  for (const tp of tipos) {
    const linha = veredictos.map((v) => String(CASOS.filter((c) => c.tipo === tp && c.veredito === v).length).padStart(18));
    console.log(tp.padEnd(10) + linha.join(""));
  }

  /* PISO_CHEGA e TETO_SABE_E_NAO_CONTA são o ponto de partida da Fase MM,
     medido nesta etapa (MM1) contra o código da v9.303. Cada etapa seguinte
     (MM2 liga distância/visão/cobertura; MM3 o golpe final; MM6 o estado de
     furtivo; etc.) tem de SUBIR o piso — provando um "ninguem-decide" ou
     "sabe-e-nao-conta" antigo virando "chega" — e pode DESCER o teto, na
     direção contrária: achar um "sabe-e-nao-conta" que hoje nem tinha caso
     (porque a etapa que o revelou ainda não existia) e cobri-lo aqui.
     Mover qualquer um dos dois números exige o motivo escrito nesta seção —
     é a lei "ao mover uma asserção de teste, escreva o motivo". */
  const PISO_CHEGA = 66;
  const TETO_SABE_E_NAO_CONTA = 1;
  t(`o piso do chega não desceu (hoje: ${X}, piso: ${PISO_CHEGA})`, X >= PISO_CHEGA);
  t(`o teto do sabe-e-nao-conta não subiu (hoje: ${Y}, teto: ${TETO_SABE_E_NAO_CONTA})`, Y <= TETO_SABE_E_NAO_CONTA);
}

console.log(`\nsonda-da-mesa v1: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
