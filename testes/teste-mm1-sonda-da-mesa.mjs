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
        ROLAGEM   — `concluirRolagem` (MM4), onde o veredito do tipo
                    `teste` volta do dado: `testes.js#envelopeDoTeste`
                    monta o resultado (atributo, perícia, CD, total) e ele
                    entra num `enviar(...)`. É a outra metade de ADJUDICA —
                    lá o teste é decidido, aqui ele chega ao Narrador.

      PAUTA + ENVIAR + HELPERS formam o "caminho principal" (o que a tarefa
      chama de "pautaDoTurno... ou o montador do prompt"). GOLPE, REVIDE,
      ADJUDICA e ROLAGEM são quatro canais A MAIS, genuínos, mas que também contêm MUITA
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

        PISO_CHEGA = 69              (o "chega" de hoje; não pode DESCER)
        TETO_SABE_E_NAO_CONTA = 0    (o "sabe-e-nao-conta" de hoje; não pode SUBIR)

      (MM1 partiu de 66 e 1; a MM2 moveu os dois e a MM4 subiu o piso — os
      motivos estão na seção 6.)

      Cada etapa da Fase MM SOBE o piso (liga um fato que hoje "não conta")
      e DESCE o teto (o inverso: acha um "sabe-e-nao-conta" novo que ainda
      não tinha caso, prova-o e o devolve como "chega" na etapa seguinte). Ao
      mover qualquer um destes dois números, escreva aqui o motivo — é a lei
      da casa: "ao mover uma asserção de teste, escreva o motivo". */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
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
  /* MM14 (o resto do nº 6): `pautaDoTurno` deixou de chamar `fichaParaPauta`
     e `genteParaPauta` por nome — o cálculo das três fichas mudou-se para
     `fichasDaMesa`, de onde o sinal do oráculo também as pede. Sem esta
     âncora aqui, a prova estrutural (a "chega" de PAUTA+ENVIAR+HELPERS) não
     achava mais as duas funções chamadas, e casos que dependem delas caíam
     para "sabe-e-nao-conta" por um motivo falso: elas continuam a alimentar
     a pauta, só que por dentro de uma função vizinha. */
  "const fichasDaMesa = (",
  /* (MM, o laço da história ligado, 11/10): o mesmo motivo do de cima —
     `enviar` deixou de chamar `resumoChefesPrompt` por nome e passou a
     chamar `chefesDoFio`, que lhe passa a espinha (um vilão só) e cai na
     chamada de antes se ela estourar. Os chefes continuam a chegar ao
     prompt, por dentro desta vizinha. */
  /* onda 2 do custo (13/10): a mesma vizinha, com o `soOAntagonista` */
  "const chefesDoFio = (soOAntagonista = false) => {",
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
/* MM4: a região que faltava para um teste declarado ser provado até o fim.
   ADJUDICA decide e manda rolar (`rolarDesafio`); o resultado só vira texto
   do Narrador quando o dado volta, aqui. Sem esta âncora, nenhum caso cujo
   fato viaja no RESULTADO de um teste podia provar que chega. */
const ANCORAS_ROLAGEM = ["const concluirRolagem = (valor, dadoAnterior = null) => {"];

function extrairTodas(anchors) {
  const achadas = [];
  const faltando = [];
  let texto = "";
  for (const a of anchors) {
    /* Quando a própria âncora já termina em "{" (ex.: "... => {"), a chave
       de abertura é ela mesma — não há "=>" a procurar depois. `pautaDoTurno`
       ("const pautaDoTurno = (") e, desde MM14, `fichasDaMesa`
       ("const fichasDaMesa = (") terminam em "(": o "=>" e a "{" vêm depois,
       porque o parâmetro tem um default (`= ""`). */
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
const rRolagem = extrairTodas(ANCORAS_ROLAGEM);

sec("0. as âncoras do App.jsx ainda batem (se isto quebrar, o resto da suíte não prova nada)");
{
  const todas = [rPauta, rEnviar, rHelpers, rGolpe, rRevide, rAdjudica, rRolagem];
  const faltando = todas.flatMap((r) => r.faltando);
  /* MM4: 12 → 13 âncoras — entrou a de `concluirRolagem` (ROLAGEM) */
  // retirada (trilha A, 29/10): «as 13 âncoras de pautaDoTurno/enviar/helpers/golpe/revide/adjudica/rolagem existem no App.jsx de hoje» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «o corpo de pautaDoTurno não está vazio (extração por chave, não por linha)» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  t("o corpo de enviar não está vazio", rEnviar.texto.length > 5000);
  t("o corpo de concluirRolagem não está vazio, e é ele que chama enviar", rRolagem.texto.length > 2000 && /\benviar\(/.test(rRolagem.texto));
}

const CAMINHO_PRINCIPAL = rPauta.texto + rEnviar.texto + rHelpers.texto;
const CAMINHO_CHEGA = CAMINHO_PRINCIPAL + rGolpe.texto + rRevide.texto + rAdjudica.texto + rRolagem.texto;

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
   O CAMINHO QUE JÁ NÃO SE LÊ — a cadeia do turno, jogada e espiada
   (trilha B, 29/10). A pauta e o pedido mudaram-se para src/motor/, e o
   texto do motor não se lê (teste-assercoes-de-texto): o que o App ainda
   tem de `enviar` é a casca. Ler o App deixou de dizer o que chega ao
   Narrador — a secção 3 passou a confiar numa lista à mão, e a 4 a passar
   vazia. A pergunta passa a ser respondida jogando: a cadeia
   `oPreludioDoTurno` → `oPedidoDoTurno` corre sobre os 335 casos de
   preludio-bloco.mjs com as funções pedidas espiadas (um gancho do
   carregador de módulos; cadeia-espiada.mjs, num processo à parte), e
   cada uma diz quantas vezes o caminho a chamou. Pedem-se: as vias dos
   casos "chega" que o App já não chama por nome, o ondeVive de todo
   "sabe-e-nao-conta", e a via da mordida da secção 4.
   A chamada de DENTRO do módulo conta: o espião troca a declaração
   `export function` na memória (o `mapaEmTexto` que o `resumoGridPrompt`
   chama por dentro do grid.js é caminho). Só a forma `export const` é
   espiada de fora, e vai em `soDeFora`; um ondeVive assim não serve à
   catraca da secção 4, e a suíte di-lo.
   ============================================================ */
/* a mordida: o ondeVive do caso #115 (o terreno da luta), que o pedido
   chama POR DENTRO do grid.js — nem o texto do App nem a via o nomeiam */
const MORDIDA_ONDE_VIVE = "grid.js#mapaEmTexto";
/* o controle: uma função do sistema que o turno até à rede não chama (o
   dado é do clique, não do pedido) — o espião que contasse tudo daria
   aqui mais de zero */
const CONTROLE_DA_CADEIA = "combate.js#d20";
const ESPIADA = (() => {
  const viasForaDoApp = CASOS.filter((c) => c.veredito === "chega" && !apareceNoCaminho(c.via.split("#")[1], CAMINHO_CHEGA)).map((c) => c.via);
  const ondeVivem = CASOS.filter((c) => c.veredito === "sabe-e-nao-conta" && c.ondeVive).map((c) => c.ondeVive);
  const alvos = [...new Set([...viasForaDoApp, ...ondeVivem, MORDIDA_ONDE_VIVE, CONTROLE_DA_CADEIA])];
  return { alvos, viasForaDoApp: [...new Set(viasForaDoApp)] };
})();
{
  const nomes = {};
  for (const a of ESPIADA.alvos) { const m = a.split("#")[0]; if (!nomes[m]) nomes[m] = Object.keys(await import("../src/" + m)); }
  const saida = execFileSync(process.execPath, [path.join(__dirname, "cadeia-espiada.mjs"), JSON.stringify({ nomes, alvos: ESPIADA.alvos })], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  Object.assign(ESPIADA, JSON.parse(saida.trim().split("\n").pop()));
}
const chamadaNaCadeia = (ref) => (ESPIADA.chamadas[ref] || 0) > 0;

/* ============================================================
   4. CHEGA — a função de via está no caminho da pauta/prompt
   ============================================================ */
sec("3. chega — a função de via é CHAMADA no caminho até o Narrador");
{
  const chegam = CASOS.filter((c) => c.veredito === "chega");
  t(`há casos chega (${chegam.length})`, chegam.length > 0);
  /* (trilha A, 29/10) onze vias chegam ao Narrador pelo pedido do turno, que
     saiu de `enviar`: o trecho de `enviar` da pauta ao system mudou-se para src/motor/pedido-do-turno.js (oPedidoDoTurno), provado byte a byte contra o recorte do App em teste-motor-pedido-do-turno.mjs — o texto do motor não se lê
     (teste-assercoes-de-texto), e o pedido à rede é comparado inteiro. */
  // retirada (trilha B, 29/10): «e a lista do pedido no motor não guarda quem o caminho do App ainda chama» — a lista à mão (NO_PEDIDO_DO_MOTOR, onze nomes) era confiança, não prova: a via que saísse do pedido continuava isenta. No lugar dela, a cadeia espiada: a via que o App não chama por nome tem de ser CHAMADA pela cadeia prelúdio→pedido (a asserção de baixo e a da contagem).
  const semChamada = [];
  for (const c of chegam) {
    const nome = c.via.split("#")[1];
    if (!apareceNoCaminho(nome, CAMINHO_CHEGA) && !chamadaNaCadeia(c.via)) semChamada.push(`#${c.n} (${c.via})`);
  }
  t(`a cadeia prelúdio→pedido corre e chega à rede (${ESPIADA.naRede}/${ESPIADA.casos} casos)`, ESPIADA.casos >= 300 && ESPIADA.naRede >= ESPIADA.casos - 20);
  t(`as ${ESPIADA.viasForaDoApp.length} vias que o App já não chama por nome são chamadas pela cadeia (${ESPIADA.viasForaDoApp.map((v) => v.split("#")[1] + " " + (ESPIADA.chamadas[v] || 0)).join(" · ")})`,
    ESPIADA.viasForaDoApp.length >= 11 && ESPIADA.viasForaDoApp.every(chamadaNaCadeia));
  t(`todo caso "chega" tem sua função de via chamada em PAUTA+ENVIAR+HELPERS+GOLPE+REVIDE+ADJUDICA+ROLAGEM ou na cadeia do motor`,
    semChamada.length === 0, semChamada.join(", "));
}

/* ============================================================
   5. SABE-E-NÃO-CONTA — a catraca nos dois sentidos
   ============================================================ */
sec("4. sabe-e-nao-conta — a função de ondeVive NÃO aparece no caminho principal (o texto do App e a cadeia do motor)");
{
  const escondidos = CASOS.filter((c) => c.veredito === "sabe-e-nao-conta");
  /* MM2: ESTA ASSERÇÃO DIZIA "há ao menos um" (> 0), e caiu por mérito: o
     único sabe-e-nao-conta da MM1 era o #138, a cobertura, e a MM2 o fez
     chegar pela linha da luta. Zero é o alvo da fase, não um defeito da
     régua. O que fica é a forma — todos os que existirem têm ondeVive — e
     a catraca de baixo, que continua valendo para o primeiro caso novo que
     uma etapa futura revelar. */
  t(`todo sabe-e-nao-conta tem onde viver (${escondidos.length} hoje)`, escondidos.every((c) => c.ondeVive));
  /* (trilha B, 29/10) o caminho principal já não é só texto do App: a
     pauta e o pedido são do motor, e o texto do App encolheu à casca de
     `enviar`. A catraca olha os dois — o texto que sobra no App e a cadeia
     espiada —, e a mesma função julga os casos de verdade e a mordida. */
  const jaChegaram = (lista) => lista.filter((c) => c.veredito === "sabe-e-nao-conta" && c.ondeVive
    && (apareceNoCaminho(c.ondeVive.split("#")[1], CAMINHO_PRINCIPAL) || chamadaNaCadeia(c.ondeVive))).map((c) => `#${c.n} (${c.ondeVive})`);
  t(`todo ondeVive de sabe-e-nao-conta é uma função que a cadeia espia por inteiro, de fora e de dentro do módulo (${ESPIADA.naoEspiaveis.length} não espiáveis, ${ESPIADA.soDeFora.length} só de fora)`,
    escondidos.every((c) => ESPIADA.alvos.includes(c.ondeVive) && !ESPIADA.naoEspiaveis.includes(c.ondeVive) && !ESPIADA.soDeFora.includes(c.ondeVive)), [...ESPIADA.naoEspiaveis, ...ESPIADA.soDeFora].join(", "));
  const jaChegou = jaChegaram(CASOS);
  t(`nenhum "sabe-e-nao-conta" já chegou por baixo dos panos — nem no texto do App nem na cadeia do motor; se aparecer aqui, o CASO precisa mudar de veredito`,
    jaChegou.length === 0, jaChegou.join(", "));
  /* A MORDIDA: o caso #115 virado em sabe-e-nao-conta — o terreno da luta,
     cujo ondeVive (`mapaEmTexto`) o pedido do motor chama por dentro do
     grid.js. A catraca tem de o acusar, e só pela cadeia: o texto do App
     não o vê. É o "mude o veredito deste caso" que a secção promete. */
  const mordida = { n: 9999, veredito: "sabe-e-nao-conta", ondeVive: MORDIDA_ONDE_VIVE };
  t(`mordida: um sabe-e-nao-conta cuja função o pedido chama por dentro de outra (${MORDIDA_ONDE_VIVE}, ${ESPIADA.chamadas[MORDIDA_ONDE_VIVE] || 0} chamadas) é acusado — e o texto do App sozinho não o via`,
    JSON.stringify(jaChegaram([...CASOS, mordida])) === JSON.stringify([...jaChegou, `#9999 (${MORDIDA_ONDE_VIVE})`]) && !apareceNoCaminho(MORDIDA_ONDE_VIVE.split("#")[1], CAMINHO_PRINCIPAL));
  t(`e o controle: ${CONTROLE_DA_CADEIA}, que o caminho não chama, passa (${ESPIADA.chamadas[CONTROLE_DA_CADEIA]} chamadas)`,
    ESPIADA.chamadas[CONTROLE_DA_CADEIA] === 0 && jaChegaram([{ n: 9998, veredito: "sabe-e-nao-conta", ondeVive: CONTROLE_DA_CADEIA }]).length === 0);
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

  /* A PROVA DE QUE O SISTEMA SABE: cobertura e linha de visão são
     calculadas de verdade. Na MM1 era por isso que #138 ("aquilo do meu
     lado conta como cobertura?") ficava "sabe-e-nao-conta" e não
     "ninguem-decide" — alguém no código sabia a resposta, só não a mandava.
     Na MM2 passou a mandar; a prova de que CHEGA vem logo abaixo. */
  t("posicao · grid.js#temCobertura calcula cobertura onde ela existe (a vala do campo aberto)", temCobertura(campo, 5, 0) === true);
  t("posicao · grid.js#temCobertura calcula a ausência dela na estrada aberta", temCobertura(campo, 9, 5) === false);
  const masm = montarGrade({ emMasmorra: true });
  t("posicao · grid.js#linhaDeVisao calcula quando a parede bloqueia", linhaDeVisao(masm, { nome: "a", x: 0, y: 4 }, { nome: "b", x: 0, y: 13 }) === false);
  t("posicao · grid.js#linhaDeVisao calcula quando o corredor está livre", linhaDeVisao(masm, { nome: "a", x: 3, y: 4 }, { nome: "b", x: 3, y: 13 }) === true);

  /* #138 CHEGA (MM2): o mesmo campo, o ogro agora NA VALA (a região que
     protege por natureza) — a linha que vai ao Narrador tem de dizer que ele
     está atrás de cobertura, com o rótulo da tabela, e o goblin na estrada
     aberta não. É a prova comportamental do veredito novo. */
  const { ROTULOS_DO_TABULEIRO } = await import("../src/grid.js");
  const ogroNaVala = { nome: "Ogro", x: 5, y: 0, vida: 50 };
  const goblin = { nome: "Goblin", x: 12, y: 5, vida: 7 };
  const comCob = resumoGridPrompt(campo, { heroi, grupo: [], inimigos: [ogroNaVala, goblin] });
  t("posicao · #138 · resumoGridPrompt diz que o inimigo na vala está atrás de cobertura",
    /Ogro a \d+ m \(/.test(comCob) && comCob.includes(`(${ROTULOS_DO_TABULEIRO.coberturaDele}`));
  t("posicao · #138 · e não diz o mesmo de quem está na estrada aberta",
    /Goblin a \d+ m[.,]/.test(comCob));

  /* #142 CHEGA (MM2): com a ordem da iniciativa (o formato de combate.ordem),
     a linha da luta diz quem age e em que ordem — a cada turno, não só na
     abertura. */
  const ordem = [{ nome: "Goblin", lado: "inimigo", iniciativa: 18 }, { nome: "Vera", lado: "heroi", iniciativa: 12 }, { nome: "Ogro", lado: "inimigo", iniciativa: 5 }];
  const comOrdem = resumoGridPrompt(campo, { heroi, grupo: [], inimigos: [ogroNaVala, goblin], ordem });
  t("regra · #142 · resumoGridPrompt diz a ordem da rodada",
    comOrdem.includes(`${ROTULOS_DO_TABULEIRO.ordemDaRodada} Goblin, Vera, Ogro.`));

  const { resumoDaqui } = await import("../src/mundo-base.js");
  t("mundo-base.js#resumoDaqui existe e devolve string (fixture completo é caro demais para esta suíte; a chamada real já é provada na seção 3)", typeof resumoDaqui === "function");

  const { envelopeDeVeredicto, lerAcao } = await import("../src/desafios.js");
  t("regra · desafios.js#lerAcao e #envelopeDeVeredicto existem e são funções", typeof lerAcao === "function" && typeof envelopeDeVeredicto === "function");

  /* #33 CHEGA (MM4): a frase que o catálogo não conhece ganha o atributo e a
     CD por tabela, e o envelope do resultado — o que `concluirRolagem` manda
     a `enviar` — diz os dois ao Narrador. */
  const { envelopeDoTeste } = await import("../src/testes.js");
  const imp = lerAcao("Salto do balcão para o lustre", { personagem: { nivel: 3 }, semente: "sonda", lugar: "a taverna", tentativas: {}, dia: 1 });
  t("regra · #33 · a ação sem desafio catalogado vira teste, com atributo e CD decididos pelo sistema",
    imp && imp.tipo === "teste" && imp.atributo === "destreza" && imp.dc === 13);
  const envImp = envelopeDoTeste({ tipo: imp.atributo, pericia: imp.pericia, motivo: imp.rotulo, valor: 12, mod: 2, total: 14, dc: imp.dc, resultado: "sucesso", nivelTreino: "nenhum" });
  t("regra · #33 · e o envelope que vai ao Narrador leva a perícia, o atributo e a dificuldade",
    /Acrobacia \(Destreza\)/.test(envImp) && /dificuldade em 13/.test(envImp));

  /* #14 CHEGA (MM12): a cidade por dentro. A frase do jogador ("quanto
     custa a diária?") tem de devolver o preço desta cidade, calculado por
     fichaDaCidade — a mesma prova que teste-mm12-cidade.mjs faz por dentro
     do módulo, aqui repetida como prova comportamental da via de pauta. */
  const { fichaDaCidade, fichaParaPauta } = await import("../src/cidade-por-dentro.js");
  const cidTeste = { nome: "Vau do Sino", porte: "cidade", regiao: "Brejos" };
  const ctxTeste = { semente: "sonda-mm1|Fantasia medieval", mapa: { cidades: [cidTeste] }, genero: "Fantasia medieval" };
  const precoDaFicha = fichaDaCidade(cidTeste, ctxTeste).pouso.comum;
  const respostaDaPauta = fichaParaPauta(cidTeste, { ...ctxTeste, frase: "Quanto custa a diária?" }).pergunta[0];
  t(`mundo · #14 · cidade-por-dentro.js#fichaParaPauta devolve o preço da própria ficha (◉ ${precoDaFicha})`,
    !!respostaDaPauta && respostaDaPauta.includes(`◉ ${precoDaFicha} a noite`), respostaDaPauta);

  /* #106 CHEGA (MM8a): a gente por dentro. O mesmo fixture mínimo da suíte
     dedicada (teste-mm8a-ficha.mjs) — uma pessoa em cena e a pergunta de
     C1E1 sobre a compleição dela — provando que a resposta de pauta cita a
     compleição, tirada do mesmo maxilar que o retrato desenha. */
  const { genteParaPauta } = await import("../src/gente-por-dentro.js");
  const pergunta106 = CASOS.find((c) => c.n === 106).pergunta;
  const respostaDaGente = genteParaPauta({
    semente: "sonda-mm1|Fantasia medieval",
    presentes: [{ nome: "Fina", genero_pessoa: "mulher", papel: "serviçal" }],
    frase: pergunta106,
  }).pergunta[0];
  t("mundo · #106 · gente-por-dentro.js#genteParaPauta devolve a compleição da própria ficha",
    !!respostaDaGente && /compleição/.test(respostaDaGente), respostaDaGente);
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
  /* MM2 (v9.304+): PISO 66 → 67 e TETO 1 → 0. Motivo: a cobertura passou a
     chegar pela linha da luta — `resumoGridPrompt` marca, na mesma linha das
     distâncias, o inimigo atrás de cobertura e o herói quando é ele, e ainda
     o inimigo sem linha de visão. O #138 saiu de "sabe-e-nao-conta" para
     "chega" (provado na seção 5). A linha de visão não moveu caso nenhum:
     nenhuma das 157 perguntas a pede dentro de uma luta (a única de "quem
     vê quem", #70, é fora de combate, onde não há grade).
     E 67 → 68, NA MESMA ETAPA: o #142 (a ordem da iniciativa entre
     rodadas). Conferido, ele era sabe-e-não-conta disfarçado de
     ninguém-decide — a ordem rolada uma vez vive em combate.ordem e só ia
     ao Narrador na abertura. `enviar` passou a entregar combate.ordem a
     resumoGridPrompt, que fecha a linha da luta com a ordem dos vivos. Em
     vez de reclassificá-lo e deixar o teto subir, fechou-se: o teto fica 0. */
  /* MM4 (toda ação ganha um dado): PISO 68 → 69. Motivo: o #33 ("isso seria
     um teste de investigação ou de intuição?") tinha como FATO "qual
     atributo testar quando a ação não casa com nenhum desafio catalogado" —
     e é exatamente o que o improviso passou a decidir, por tabela
     (FAMILIAS_DO_IMPROVISO + CD_DO_IMPROVISO), e a levar ao Narrador pelo
     envelope do resultado. Para provar essa chegada, a suíte ganhou a
     região ROLAGEM (`concluirRolagem`), provada na seção 0 e na 5.
     Os outros cinco do bloco "que teste é este?" (#76, #78, #93, #102,
     #152) NÃO moveram, cada um com o porquê escrito na nota do caso: o
     #102 pergunta ANTES de declarar (e a pergunta é peneirada de
     propósito), o #152 é poder e não atributo, o #93 é pool de dados, e
     #76/#78 são licença sem risco. */
  /* MM6 (escondido é um estado, frontend, 29/09): PISO 69 → 72. Os três
     casos do Ataque Furtivo e do estado escondido viram "chega":
       #74  — "tenho vantagem porque ele não me viu chegar?" `quemMeVe`
              (escondido.js) roda dentro de `enviar` (região ENVIAR) e soma
              à linha da luta.
       #124 — "o furtivo soma porque tenho um aliado do lado dele?"
       #153 — "ainda escondido, dá pra atacar por trás mesmo caído?"
       Os dois últimos são `vereditoDoFurtivo` (combate.js), chamado dentro
       de `resolverAtaqueJogador` (região GOLPE) e do golpe de oportunidade
       de `resolverRevide` (região REVIDE) — não precisou de região nova:
       a chamada já aparece em DUAS das que a suíte já conhecia, byte a
       byte a mesma prova que o resto do funil usa. */
  /* MM12 (a cidade por dentro, frontend, 29/09): PISO 72 → 81. `fichaParaPauta`
     (cidade-por-dentro.js) está ligada em `pautaDoTurno` (região PAUTA) e nove
     casos que eram "ninguém decide" viram "chega": #6 a língua da rua, #14 e
     #15 o preço do pouso, #31 quem estuda magia, #37 e #38 a gíria e o que
     ela quer dizer, #70 a vigilância fora de combate, #107 como se reconhece
     quem é bem-vindo, #110 o que o sino marca agora. O #80 ("ela me dá de
     graça?") fica ninguém-decide: o costume da praça (DADIVAS) não é a
     decisão desta pessoa sobre este item — a nota do caso explica. */
  /* MM8a (a gente por dentro, frontend, 29/09): PISO 81 → 89. `genteParaPauta`
     (gente-por-dentro.js) está ligada em `pautaDoTurno` (região PAUTA), depois
     de `fichaParaPauta`, e oito casos que eram "ninguém decide" viram "chega":
     #18 o passado com data, #26 o motivo do posto, #42 o adversário mais
     famoso (um chefe, uma criatura ou uma pessoa do mundo, nunca inventado),
     #54 quem trabalha em cada casa (`genteDoLocal` já sabia; a pauta não
     dizia — era "sabe e não conta"), #90 a escala de plantão e folga, #103 a
     comparação de idades, #105 o jeito e desde quando, #106 a compleição pelo
     maxilar do retrato. O #29 fica ninguém-decide: pergunta por uma ferida DE
     AGORA, mostrada na cena — o sistema só decide a cicatriz do retrato. */
  /* MM8b (o elenco, 30/09): PISO 89 → 92. O elenco de 24 (elenco.js) dá às
     cidades as suas casas notáveis e a reputação da casa e de cada um;
     `genteParaPauta` — já ligada em `pautaDoTurno` desde a MM8a — responde
     pela secção PERGUNTOU: #60 o que dizem da casa, #61 quem é bem e mal
     visto, #62 se a família é popular. */
  const PISO_CHEGA = 92;
  const TETO_SABE_E_NAO_CONTA = 0;
  t(`o piso do chega não desceu (hoje: ${X}, piso: ${PISO_CHEGA})`, X >= PISO_CHEGA);
  t(`o teto do sabe-e-nao-conta não subiu (hoje: ${Y}, teto: ${TETO_SABE_E_NAO_CONTA})`, Y <= TETO_SABE_E_NAO_CONTA);
}

console.log(`\nsonda-da-mesa v1: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
