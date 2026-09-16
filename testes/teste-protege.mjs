/* teste-protege.mjs (v9.278 · F2) — o abrigo que muda de corpo

   A TERCEIRA FAMÍLIA DE `APLICACAO_DO_BUFF` A SER COBRADA, e a primeira que
   não se prova com um número. `absorve` (P3) compra PONTOS, `amortece` (F1)
   compra PROPORÇÃO, e as suítes das duas medem quanto. Esta família promete
   outra coisa — a ficha di-lo em maiúsculas em quatro entradas de `AGUARDAM`:
   "protege um ALIADO adjacente", "protege um ALIADO de dano", "um espírito
   protege um ALIADO". **O que distingue `protege` das irmãs não é quanto, é
   EM QUEM**, e é isso que esta suíte cobra.

   O QUE F2 PAGOU, E O QUE F2 MEDIU E NÃO PAGOU — as duas metades estão aqui,
   e a segunda ocupa mais espaço que a primeira de propósito:

   (1) O CORPO, pago. O portador `amparo` (aflicoes.js) parte `guarda` ao meio
       e leva `alvo: "aliados"`, que já tinha três leitores vivos — o herói e o
       companheiro no App, mais a régua de Uma Vida. Zero linhas de `App.jsx`.

   (2) A MOEDA, medida e NÃO ligada. `protegido` é a única condição do catálogo
       com `defesa`; `mecanicaDe` soma-o desde a v9.0 e ninguém o lê. O jogador
       lê "+2 de defesa" na própria ficha da condição e recebe ZERO. A seção 5
       tranca isso em asserção que ACENDE no dia em que alguém ligar o campo —
       é a jogada de H4 com o dono da marca e de H3 com a porta `aflicaoDe`.

   E É POR ISSO QUE A ETAPA SAIU IDÊNTICA AO BYTE nas duas réguas: com o corpo
   corrigido e a moeda morta, mover o abrigo não move um ponto de dano. **As
   duas metades são um pagamento só**, e a suíte prova as duas.

   O PERIGO DESTA FAMÍLIA É O REGEX, e é maior do que o de H4. A palavra
   "escudo" aparece dos DOIS lados da briga (veto escrito em `combos.js:161`) e
   `guarda` apanha "barreira", "muralha", "aparar" e "reduz o dano". A seção 3
   é o dente que impede a próxima mão de alargar o recorte até as habilidades
   casarem: ela nomeia as três frases que um recorte mais largo apanharia e
   prova que nenhuma delas promete proteger corpo nenhum.

   DETERMINISMO: não há `Math.random` em lado nenhum. O único ponto de sorte do
   caminho é a salvaguarda de `rolarAflicao`, e ela não corre para esta família
   (`alvo !== "alvo"` sai antes do dado); `resolverAtaque` é comparado pelo
   campo `ca`, que é aritmética pura e não passa pelo d20. */

import { readFileSync } from "node:fs";
import { PORTADORES, aflicaoDe, rolarAflicao } from "../src/aflicoes.js";
import { CONDICOES, criarCondicao, mecanicaDe } from "../src/condicoes.js";
import { resolverAtaque, modificadoresDeCondicao } from "../src/combate.js";
import { APLICACAO_DO_BUFF, aplicacaoDoBuff } from "../src/combos.js";
import { efeitoDeBuff } from "../src/efeitos.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { CRIATURAS_FANTASIA, ARQUETIPOS } from "../src/bestiario.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ---------------- O ACERVO, do mesmo jeito de `check-protecao` e de F1 ------
   Uma família não se prova com objetos inventados: quem tem de casar com a
   tabela são as habilidades que o jogador compra. */
const acervo = [];
const guardar = (h, fonte) => { if (h && h.nome) acervo.push({ hab: h, fonte }); };
for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
for (const m of MAGIAS) guardar(m, "grimorio");

const texto = (h) => `${(h && h.nome) || ""} ${(h && h.descricao) || ""}`;
const portadorDe = (h) => aflicaoDe(texto(h));
const porNome = (n) => (acervo.find(({ hab }) => hab.nome === n) || {}).hab || null;
const daFamilia = (id) => acervo.filter(({ hab }) => { const l = aplicacaoDoBuff(hab); return !!l && l.id === id; });

const AMPARO = PORTADORES.find((p) => p.id === "amparo") || null;
const GUARDA = PORTADORES.find((p) => p.id === "guarda") || null;

/* AS NOVE QUE MUDAM DE CORPO, escritas pelo nome. Não é decoração: uma
   varredura que só conta ficaria verde se o recorte trocasse nove frases por
   outras nove. Seis dizem "aliado"; três dizem "o grupo" / "quem estiver
   perto", e essas três são as MAIS bem servidas — `aliados` entrega
   exactamente "você e o grupo", com zero de sobra. */
const AS_NOVE = [
  "Muralha", "Escudo da Fé", "Círculo Sagrado", "Espírito Guardião",
  "Muralha Viva", "Escudo da Aurora", "Espírito Vigia",
  "Muralha de Espinhos", "Totem de Guarda",
];

/* ============================================================
   1. A LINHA EXISTE, E É TABELA
   ============================================================ */
sec("1. o portador do corpo alheio existe e está na tabela");
t("`amparo` é uma linha de PORTADORES, não um if solto", !!AMPARO);
t("ele abre a MESMA condição que `guarda` — uma promessa, um catálogo",
  !!AMPARO && !!GUARDA && AMPARO.cond === GUARDA.cond && AMPARO.cond === "protegido");
t("e o que muda entre os dois é SÓ o corpo",
  !!AMPARO && !!GUARDA && AMPARO.alvo === "aliados" && GUARDA.alvo === "proprio");
t("`chance: 1` como `guarda`, `bencao` e `inspiracao` — amparar é o turno inteiro, não o efeito colateral de um golpe",
  !!AMPARO && AMPARO.chance === 1 && AMPARO.dif === 0);
/* A ORDEM É REGRA: a primeira linha que casa vence, e o cabeçalho da tabela
   declara "do mais específico para o mais genérico". Duas condições casadas
   são mais específicas que uma palavra solta. */
const iAmparo = PORTADORES.findIndex((p) => p.id === "amparo");
const iGuarda = PORTADORES.findIndex((p) => p.id === "guarda");
t("e vem ANTES de `guarda`, senão a palavra solta apanhava a frase primeiro",
  iAmparo >= 0 && iGuarda >= 0 && iAmparo < iGuarda, `amparo ${iAmparo}, guarda ${iGuarda}`);
/* E A POSIÇÃO É A MÍNIMA QUE FUNCIONA — medido, não escolhido: nenhuma das
   nove casa qualquer portador anterior a esta linha, então subir `amparo` mais
   para cima só aumentaria a superfície dele sem comprar nada. */
const antesDeAmparo = PORTADORES.slice(0, iAmparo);
const roubadas = AS_NOVE.filter((n) => { const h = porNome(n); return h && antesDeAmparo.some((p) => p.re.test(texto(h))); });
t("a posição é a MÍNIMA que funciona — nenhuma das nove casa portador anterior",
  roubadas.length === 0, roubadas.join(", "));

/* ============================================================
   2. O CORPO — as nove mudam de lado, e são exactamente estas
   ============================================================ */
sec("2. o abrigo deixa de cair em quem conjurou");
const pegas = acervo.filter(({ hab }) => { const p = portadorDe(hab); return p && p.id === "amparo"; });
console.log(`  ··  ${pegas.length} frases do acervo de ${acervo.length} passam a abrigar outro corpo: ${pegas.map(({ hab }) => hab.nome).join(" · ")}`);
t(`são exactamente as nove nomeadas, nem uma a mais nem uma a menos`,
  pegas.length === AS_NOVE.length && AS_NOVE.every((n) => pegas.some(({ hab }) => hab.nome === n)),
  `achou ${pegas.map(({ hab }) => hab.nome).join(", ")}`);
for (const n of AS_NOVE) {
  const h = porNome(n);
  const p = h && portadorDe(h);
  t(`"${n}" abriga o grupo, e não quem a usou`, !!p && p.alvo === "aliados" && p.cond === "protegido");
}
/* O CONTRAFACTUAL, que é o que dá valor à asserção de cima: sem a linha nova
   estas mesmas nove caíam em `proprio` ou em portador NENHUM. Não basta
   mostrar que hoje está certo; é preciso mostrar que antes estava errado. */
const semAmparo = (h) => { const txt = texto(h); return PORTADORES.filter((p) => p.id !== "amparo").find((p) => p.re.test(txt)) || null; };
const antes = AS_NOVE.map((n) => { const p = semAmparo(porNome(n)); return p ? p.alvo : "NENHUM"; });
t("e sem esta linha as nove caíam no corpo errado ou em portador nenhum",
  antes.every((a) => a !== "aliados"), antes.join(", "));
console.log(`  ··  onde elas caíam antes de F2: ${AS_NOVE.map((n, i) => `${n}=${antes[i]}`).join(" · ")}`);

/* ============================================================
   3. O DENTE CONTRA ALARGAR O REGEX — a lição de H4, na família onde ela
      é mais perigosa
   ============================================================ */
sec("3. o recorte é a frase inteira, e não se alarga");
/* Estas três entram no dia em que alguém puser "escudo"/"barreira"/"muralha"
   como palavra de proteção do recorte. MEDIDO: com elas dentro, o recorte sobe
   de 9 para 12 — e as três não prometem proteger ninguém. "Escudo do Aliado
   Caído" ARRASTA um caído, "Vida Emprestada" TRANSFERE PV, "Cerca Viva" cresce
   entre o grupo e o perigo. Alargar para as apanhar seria o regex a ser
   esticado até as habilidades casarem, que é exactamente o que H4 proibiu. */
const NAO_PODEM_ENTRAR = ["Escudo do Aliado Caído", "Vida Emprestada", "Cerca Viva"];
for (const n of NAO_PODEM_ENTRAR) {
  const h = porNome(n);
  t(`"${n}" existe no acervo e NÃO é amparo — ela não promete proteger corpo nenhum`,
    !!h && (portadorDe(h) || {}).id !== "amparo");
}
/* E O CONTROLE VIVO DO OUTRO LADO: quem promete proteção e nomeia o PRÓPRIO
   corpo fica onde estava. "Armadura Sombria — trevas protetoras envolvem o
   corpo" é da família `protege` e continua em `guarda`, porque "protetoras" é
   "protet" e não "proteg" — a mesma letra que H1 apanhou. */
const SOMBRIA = porNome("Armadura Sombria");
t("`Armadura Sombria` promete o PRÓPRIO corpo e continua em `guarda`",
  !!SOMBRIA && (portadorDe(SOMBRIA) || {}).id === "guarda");
t("e ela é da família `protege` — a família não é o portador, e as duas tabelas respondem a perguntas diferentes",
  !!SOMBRIA && (aplicacaoDoBuff(SOMBRIA) || {}).id === "protege");
/* AS DUAS CONDIÇÕES TÊM DE ESTAR NA FRASE, e cada uma sozinha não basta. */
t("só o verbo, sem corpo declarado, NÃO é amparo", !AMPARO.re.test("Protege quem conjurou por 2 turnos"));
t("só o corpo, sem verbo de proteger, NÃO é amparo", !AMPARO.re.test("Aliados ganham vantagem por 3 turnos"));
t("os dois juntos, em qualquer ordem, SÃO amparo",
  AMPARO.re.test("Protege um aliado adjacente") && AMPARO.re.test("Você e um aliado ficam protegidos"));
/* E O BESTIÁRIO E OS ITENS PASSAM PELO MESMO `aflicaoDe`: um falso positivo
   ali abrigaria o grupo porque um bicho tem nome bonito. Medido: zero. */
const bichos = [...CRIATURAS_FANTASIA, ...ARQUETIPOS].filter(Boolean).map((b) => `${b.nome || ""} ${b.desc || b.descricao || ""}`);
const bichosPegos = bichos.filter((s) => AMPARO.re.test(s));
console.log(`  ··  ${bichos.length} criaturas varridas contra o recorte`);
t("nenhuma criatura do bestiário casa o recorte", bichosPegos.length === 0, bichosPegos.slice(0, 3).join(" | "));

/* ============================================================
   4. A FAMÍLIA `protege`, cobrada pelo nome
   ============================================================ */
sec("4. as oito da família, uma a uma");
const familia = daFamilia("protege");
console.log(`  ··  a família tem ${familia.length} no acervo: ${familia.map(({ hab }) => hab.nome).join(" · ")}`);
t("a família continua com gente no acervo", familia.length > 0);
const cumprem = familia.filter(({ hab }) => (portadorDe(hab) || {}).alvo === "aliados");
const proprio = familia.filter(({ hab }) => (portadorDe(hab) || {}).alvo === "proprio");
console.log(`  ··  ${cumprem.length} abrigam outro corpo · ${proprio.length} promete${proprio.length === 1 ? "" : "m"} o próprio e fica${proprio.length === 1 ? "" : "m"} onde está${proprio.length === 1 ? "" : "o"}`);
t("seis das oito passam a abrigar outro corpo", cumprem.length === 6, `são ${cumprem.length}`);
/* A QUE NÃO PASSA, E O MOTIVO ESCRITO. "Bênção do Bosque — o grupo recupera
   vida e resiste a veneno" é da família `protege` pela palavra "resiste a", e
   não passa por DUAS razões independentes: a frase não tem verbo de proteger,
   e `veneno` é a primeira linha de PORTADORES, logo apanha-a antes de qualquer
   coisa. Fazê-la passar exigiria pôr `amparo` acima dos debuffs de arma —
   superfície que esta etapa não compra por uma frase. */
const BOSQUE = porNome("Bênção do Bosque");
t("`Bênção do Bosque` NÃO passa, e casa `veneno` por ordem de tabela",
  !!BOSQUE && (portadorDe(BOSQUE) || {}).id === "veneno");
t("e o motivo é duplo: a frase também não tem o verbo de proteger", !!BOSQUE && !AMPARO.re.test(texto(BOSQUE)));
/* E TRÊS DE FORA DA FAMÍLIA TAMBÉM PASSAM A CUMPRIR, porque a promessa mora na
   FRASE e não no rótulo: `Escudo da Fé` é da família `absorve` (o nome tem
   "escudo"), e é a entrada de `AGUARDAM` que mais reclamava o corpo certo. */
const deFora = pegas.filter(({ hab }) => (aplicacaoDoBuff(hab) || {}).id !== "protege");
console.log(`  ··  ${deFora.length} de fora da família também mudam de corpo: ${deFora.map(({ hab }) => hab.nome).join(" · ")}`);
t("três de fora da família também passam a abrigar outro corpo", deFora.length === 3, `são ${deFora.length}`);
const FE = porNome("Escudo da Fé");
t("`Escudo da Fé` é da família `absorve` e mesmo assim muda de corpo — a promessa está na frase, não no rótulo",
  !!FE && (aplicacaoDoBuff(FE) || {}).id === "absorve" && (portadorDe(FE) || {}).alvo === "aliados");
t("e ela continua a comprar o abrigo que já comprava — F2 não lhe tirou número nenhum",
  !!FE && Number(efeitoDeBuff(FE, { nome: "R", classe: "Clérigo", nivel: 5, efeitos: [] }).efeito.absorve) > 0);

/* ============================================================
   5. A MOEDA MORTA — a asserção que ACENDE
   ============================================================ */
sec("5. o que F2 mediu e NÃO ligou: a moeda vale zero");
/* ESTA SEÇÃO É A MAIS CARA DA SUÍTE, e existe para não deixar o achado virar
   lembrança. `protegido` declara `defesa` no catálogo, o jogador lê "+2 de
   defesa" na descrição, e o número não chega a lado nenhum. */
const PROT = CONDICOES.protegido;
t("`protegido` declara `defesa` no catálogo, e é a ÚNICA condição que o faz",
  Number(PROT.defesa) > 0 && Object.values(CONDICOES).filter((c) => c && c.defesa).length === 1);
t("e a descrição que o jogador LÊ promete esse número por extenso",
  new RegExp(`\\+${PROT.defesa}\\s+de\\s+defesa`, "i").test(String(PROT.desc || "")), PROT.desc);
const mec = mecanicaDe([criarCondicao("protegido")]);
t("`mecanicaDe` soma o campo — a primeira metade do caminho existe", mec.defesa === PROT.defesa);
/* E AQUI ELE PARA. Se esta asserção ficar vermelha, alguém ligou o campo: leia
   o comentário de `modificadoresDeCondicao` (combate.js) antes de a "corrigir",
   porque o preço está medido e a decisão é da pessoa. */
t("…e `modificadoresDeCondicao` NÃO o leva adiante — se esta linha acender, alguém ligou a moeda",
  modificadoresDeCondicao([criarCondicao("protegido")]).defesa === undefined);
/* O DENTE FINAL, e é o que prova o zero em vez de o afirmar: a defesa que
   `resolverAtaque` usa é a MESMA com e sem a condição. `ca` é aritmética pura
   e não passa pelo d20, então a comparação é determinística. */
const alvoNu = { nome: "Alvo", classe: "Guerreiro", nivel: 5, atributos: { destreza: 2 }, equipados: {}, vida: 40, vidaMax: 40 };
const golpe = (cond) => resolverAtaque({ atacante: "Bicho", alvo: alvoNu, ehAtacanteInimigo: true, bonusAtaque: 5, danoBase: 12, condAlvo: cond });
const caSem = golpe([]).ca, caCom = golpe([criarCondicao("protegido")]).ca;
console.log(`  ··  a defesa que o golpe enfrenta: ${caSem} sem a condição, ${caCom} com ela — a diferença que a ficha promete é ${PROT.defesa}`);
t("estar `protegido` NÃO muda a defesa que o golpe enfrenta — a moeda vale zero, e é o achado de F2",
  caSem === caCom, `${caSem} vs ${caCom}`);
/* O PREÇO DE LIGAR, MEDIDO EM F2 E ESCRITO AQUI para quem for decidir. Duas
   linhas: `defesa: m.defesa` em `modificadoresDeCondicao` e `+ modAlvo.defesa`
   em `ca`. Na régua de Uma Vida, molde histórico, família do retrato:
     · vitória    52,1% → 54,7%     · PV do grupo 25,88 → 27,57
     · quedas     1,790 → 1,720     · dano sofrido 240,61 → 235,48
     · desferido 120,74 → 131,90    · `duro` 8,8% → 10,8%
   Três asserções de `teste-regua.mjs` caem com isso, e uma delas é a que
   garante que o retrato de B1/B1b/B2/T1 continua alcançável. A arena não
   sente NADA (idêntica ao byte), e não por ser inofensivo: ela nunca põe
   condição em duelista nenhum, então é cega a esta família inteira. */
const COMBATE = readFileSync("../src/combate.js", "utf8");
t("o preço de ligar está escrito onde a decisão será tomada, não só aqui",
  /F2/.test(COMBATE) && /54,7%/.test(COMBATE) && /modificadoresDeCondicao/.test(COMBATE));

/* ============================================================
   6. A VOZ — o sistema não fala de si mesmo
   ============================================================ */
sec("6. nenhuma linha que o jogador lê diz o nome do mecanismo");
const res = rolarAflicao({ fonte: AMPARO, nomeFonte: "Muralha", atacante: "Doran", sempre: true });
t("a família abre a condição sem rolar dado nenhum — buff não tem salvaguarda",
  !!res && res.aplicou === true && res.resistiu === false && res.escopo === "aliados");
const MURALHA = porNome("Muralha");
const buff = efeitoDeBuff(MURALHA, { nome: "Doran", classe: "Guerreiro", nivel: 5, efeitos: [] }, res.cond.turnos);
const ditas = [res.texto, res.nota, buff.extraEscopo].join(" ");
const PALAVRAS_DE_BASTIDOR = ["amparo", "portador", "PORTADORES", "aplicacaoDoBuff", "alvo:", "aliados\"", "regex", "família"];
const vazou = PALAVRAS_DE_BASTIDOR.filter((p) => ditas.includes(p));
t("nem a frase do jogador nem a nota do Mestre nomeiam o mecanismo", vazou.length === 0, vazou.join(", "));
t("a frase da família continua a ser a de P1, de corpo e não de rótulo",
  buff.extraEscopo.includes((APLICACAO_DO_BUFF.find((a) => a.id === "protege") || {}).conceito));

/* ============================================================
   7. O LIXO NÃO CUSTA O TURNO
   ============================================================ */
sec("7. null, {} e save antigo passam sem estourar");
t("`aflicaoDe` com vazio devolve null, como sempre", aflicaoDe("") === null && aflicaoDe(null) === null);
t("`mecanicaDe` com null e [] devolve defesa 0 — `= {}` não cobre null",
  mecanicaDe(null).defesa === 0 && mecanicaDe([]).defesa === 0);
t("`modificadoresDeCondicao` sem argumento não estoura", !!modificadoresDeCondicao());
t("condição sem catálogo é ignorada, não somada", mecanicaDe([{ id: "inventada", nome: "Inventada" }]).defesa === 0);
/* DETERMINISMO: duas leituras da mesma frase dão o mesmo portador, sempre. */
t("a mesma frase dá sempre o mesmo portador",
  portadorDe(MURALHA).id === portadorDe(MURALHA).id && portadorDe(MURALHA).id === "amparo");

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus > 0) process.exit(1);
