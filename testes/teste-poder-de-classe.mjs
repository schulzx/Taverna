/* teste-poder-de-classe.mjs (v9.265 — H1, etapa 3 de 3: A PROVA)

   O QUE ESTA SUÍTE GUARDA. `poder-de-classe.js` abriu a décima porta da
   fileira: até a v9.264 a habilidade de classe era a única fonte de poder
   do jogo sem despachante — lida na ficha, cobrada em PM e sem acontecer.
   Aqui a porta é provada dos dois lados: que a tabela é lida de volta a
   partir do ACERVO REAL (nenhuma linha órfã), e que nada fora da tabela
   vira poder (varrendo as 593 habilidades, uma por uma).

   E A CATRACA, que é o coração da fase. A lei escrita em `mente/pauta.md`
   (item H1) diz: "nenhuma habilidade promete na ficha e falha na mesa, e
   a lista das que ainda não cumprem é DECLARADA e ENCOLHE a cada etapa,
   nunca cresce". `AGUARDAM` é essa lista; a seção 6 é o dente que a faz
   morder sozinha.

   O MOLDE é `teste-guardas.mjs`, a irmã mais próxima em forma e ambição:
   a régua em tabela nomeada no topo de cada seção, a varredura do acervo
   inteiro em vez de uma lista de nomes escrita à mão, e o dente nos dois
   sentidos.

   NADA AQUI SORTEIA, e não é por travar `Math.random`: é porque
   `poder-de-classe.js` não tem sorte nenhuma por dentro (está escrito lá:
   "aqui não há semente porque não há sorte"). A seção 5 prova que a
   escolha de alvo é determinística pela ORDEM DA MESA, que é a única
   arbitragem que um sistema sem servidor tem.                            */
import {
  PODERES_DE_CLASSE, poderDe, temPassivoDeClasse, aplicarPoder, AGUARDAM,
} from "../src/poder-de-classe.js";
import { temRegraPropria } from "../src/habilidades.js";
import { criarCondicao, portaDeSaida } from "../src/condicoes.js";
/* o acervo de verdade: a tabela só vale se as linhas dela casarem com
   habilidade que existe na ficha de alguém */
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
/* a régua do PV sai da tabela do jogo, nunca de um número digitado aqui */
import { PV_POR_NIVEL } from "../src/regras-jogo.js";
/* os dois leitores de fora, para a porta ser provada onde ela CHEGA e não
   só onde ela nasce (lei "export morto mente": referência em teste conta) */
import { dobraMovimento, ignoraTerrenoDificil } from "../src/dadivas.js";
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   A RÉGUA, EM TABELA — todo número desta suíte sai daqui, com o
   motivo escrito ao lado. É o molde do `MEDIDA_DO_PILOTO` de
   `teste-guardas.mjs`, e a lei é a mesma: se é número, é tabela.
   ============================================================ */
const MEDIDA_DA_PORTA = {
  /* O PISO DO ALCANCE, o mesmo de `teste-guardas` e pelo mesmo motivo: as
     12 classes (148) + subclasses (144) + especializações (216) somam 508,
     e o grimório entra por cima. O piso guarda o ALCANCE da varredura —
     uma importação que quebre e devolva lista vazia fica vermelha aqui em
     vez de passar verde medindo nada. */
  pisoDoAcervo: 508,
  /* ZERO É A LEI, nos dois sentidos, como em `GUARDAS`. Uma linha da
     tabela sem habilidade real é promessa órfã; uma habilidade fora da
     tabela virando poder é PV saindo do lugar errado — e esse é o erro
     que não se percebe. */
  tetoDePoderesSemHabilidade: 0,
  tetoDeFalsosPoderes: 0,
  /* A MAGIA TEM O DESPACHANTE DELA (`usarFuncaoMagica`), e esta porta é da
     CLASSE. Um regex desta tabela que alcance o grimório abriria o segundo
     caminho para o mesmo número — a doença que esta casa já pagou caro. */
  tetoDeMagiasQueViramPoder: 0,
  /* O NÍVEL DA PROVA e a mesa dela. 8 porque é onde a escada da cura já
     subiu o bastante para o número ser conferível de cabeça, e o mesmo
     nível do herói de `teste-guardas`. */
  nivelDaProva: 8,
  diaDaProva: 3,
  /* A RÉGUA DA CURA, lida de volta da própria tabela. `base` máxima é a do
     Segundo Fôlego (7), que é o ÚNICO que se gasta — uma vez por dia
     compra o degrau a mais. `porNivel` máximo é o dele também (1,5). Estes
     dois tetos são o que impede uma linha nova de escrever `base: 40` e
     apagar o combate; a régua do módulo ("nada passa de um terço do PV
     típico do nível") não vira asserção por nível porque o PISO da cura é
     plano e domina o nível 1 — o teto de base e de escada morde o mesmo
     exagero sem mentir sobre onde morde. */
  tetoDaBaseDeCura: 7,
  tetoPorNivelDeCura: 1.5,
  /* A escada conferida de ponta a ponta: do nível 1 ao 20 a cura de UM
     alvo nunca desce abaixo da cura de GRUPO. Quem escolhe um escolhe
     fundo, quem rega todos rega raso. */
  nivelMinimoDaEscada: 1,
  nivelMaximoDaEscada: 20,
  /* O PV típico do nível, derivado de `PV_POR_NIVEL` (regras-jogo.js) e da
     mediana de `vidaBase` das classes — nunca digitado. Serve só para a
     mesa da prova ter tamanho honesto. */
  vigorDaProva: 2,
};

/* ---------------- O ACERVO INTEIRO ---------------- */
const ACERVO = [];
const guardar = (h, fonte) => { if (h && h.nome) ACERVO.push({ hab: h, fonte }); };
for (const c of CLASSES) for (const h of c.habilidades) guardar(h, `classe:${c.nome}`);
for (const [s, hs] of Object.entries(SUBCLASSES)) for (const h of hs) guardar(h, `subclasse:${s}`);
for (const [e, hs] of Object.entries(ESPECIALIZACOES)) for (const h of hs) guardar(h, `especializacao:${e}`);
for (const m of MAGIAS) guardar(m, "grimorio");
const doAcervo = (nome) => (ACERVO.find((x) => x.hab.nome === nome) || {}).hab || null;
const NOMES_DO_ACERVO = new Set(ACERVO.map((x) => x.hab.nome));

const medianaVidaBase = (() => {
  const v = CLASSES.map((c) => Number(c.vidaBase) || 10).sort((a, b) => a - b);
  return v[Math.floor(v.length / 2)];
})();
const pvTipico = (nivel) => medianaVidaBase + MEDIDA_DA_PORTA.vigorDaProva * 2 + (Math.max(1, nivel) - 1) * PV_POR_NIVEL;

const N = MEDIDA_DA_PORTA.nivelDaProva;
const PV = pvTipico(N);
/* a mesa da prova: o herói e dois companheiros, em ordem fixa. Nada aqui
   é sorteado e nada é compartilhado entre seções — cada chamada recebe uma
   mesa NOVA, porque a prova de imutabilidade não pode depender de a
   anterior ter sido bem-comportada. */
const mesa = (extra = {}) => JSON.parse(JSON.stringify({
  nome: "Vera", classe: "Clérigo", nivel: N, vida: PV, vidaMax: PV, grupo: [], ...extra,
}));
const comGrupo = (extra = {}) => mesa({
  vida: PV, grupo: [{ nome: "Ilse", vida: 10, vidaMax: 40, condicoes: [] }, { nome: "Bram", vida: 30, vidaMax: 30, condicoes: [] }],
  ...extra,
});

console.log(`  ··  acervo: ${ACERVO.length} habilidades · PV típico do nível ${N} = ${PV} (vidaBase mediana ${medianaVidaBase} + vigor ${MEDIDA_DA_PORTA.vigorDaProva * 2} + ${N - 1}×${PV_POR_NIVEL})`);
t(`a varredura alcança pelo menos ${MEDIDA_DA_PORTA.pisoDoAcervo} habilidades`,
  ACERVO.length >= MEDIDA_DA_PORTA.pisoDoAcervo, `varreu ${ACERVO.length}`);

/* ============================================================
   1. A TABELA É LIDA DE VOLTA — o dente nos dois sentidos

   PRIMEIRO SENTIDO (o DENTE 1 de `teste-guardas`): toda entrada de
   `PODERES_DE_CLASSE` casa com habilidade REAL do acervo. Uma linha
   órfã é regra que nasceu sem ninguém para executá-la, e ela passa
   verde em qualquer suíte que só se pergunte pela tabela.

   E ELA PERCORRE A TABELA, não uma lista de nomes escrita aqui —
   pelo mesmo motivo de lá: o poder novo de amanhã chega a esta
   seção sozinho e cobra o próprio lugar no acervo no dia em que
   nasce. Uma lista à mão reproduziria o buraco uma camada acima.
   ============================================================ */
sec("1. toda linha da tabela tem habilidade real no acervo");
{
  const orfas = [];
  for (const p of PODERES_DE_CLASSE) {
    const casam = ACERVO.filter(({ hab }) => { const x = poderDe(hab); return x && x.id === p.id; });
    if (!casam.length) { orfas.push(p.id); t(`[${p.id}] tem habilidade real no acervo`, false, "nenhuma habilidade casa com essa linha"); continue; }
    t(`[${p.id}] → "${casam[0].hab.nome}" (${casam[0].fonte})${casam.length > 1 ? ` +${casam.length - 1}` : ""}`, true);
  }
  t(`nenhuma das ${PODERES_DE_CLASSE.length} linhas é órfã (teto ${MEDIDA_DA_PORTA.tetoDePoderesSemHabilidade})`,
    orfas.length <= MEDIDA_DA_PORTA.tetoDePoderesSemHabilidade, orfas.join(", "));

  /* cada linha declara o que o motor dela precisa, e nada a mais */
  for (const p of PODERES_DE_CLASSE) {
    t(`[${p.id}] traz id, regex, motor e conceito`, !!p.id && p.rx instanceof RegExp && !!p.motor && String(p.conceito || "").trim().length > 10);
  }
  t("nenhum id se repete", new Set(PODERES_DE_CLASSE.map((p) => p.id)).size === PODERES_DE_CLASSE.length);
  const motores = [...new Set(PODERES_DE_CLASSE.map((p) => p.motor))].sort();
  t(`os motores declarados são ${motores.join(", ")}`, motores.join(",") === "cura,passivo,porta");
  /* a porta nomeia PORTA que existe em `PORTAS_DE_SAIDA`, e o alcance mora
     LÁ — duas listas para a mesma pergunta divergiriam no primeiro ajuste */
  for (const p of PODERES_DE_CLASSE.filter((x) => x.motor === "porta")) {
    const porta = portaDeSaida(p.porta);
    t(`[${p.id}] aponta para a porta "${p.porta}", que existe e resolve`, !!porta && porta.resolve === true && porta.remove.length > 0,
      porta ? `resolve=${porta.resolve} remove=${porta.remove.length}` : "porta inexistente");
  }
}

/* ============================================================
   2. E NADA FORA DA TABELA VIRA PODER

   O SEGUNDO SENTIDO, e o caro. As regex são ancoradas de propósito
   (está escrito no módulo): "Chamado da Chuva" diz *cura leve
   contínua*, e um `/cura leve/` solto transformaria uma magia de
   clima na cura do Clérigo. Um falso positivo aqui é PV saindo do
   lugar errado — o erro que não se percebe em mesa.

   A varredura é do ACERVO INTEIRO, incluindo o grimório, e é ele
   que carrega a outra metade da lei: a porta é da CLASSE, e a magia
   já tem o despachante dela. Zero magias podem entrar por aqui.
   ============================================================ */
sec("2. nada fora da tabela vira poder");
{
  /* A LISTA DO QUE CUMPRE, declarada — e ela é a única concessão a nomes
     escritos à mão nesta suíte, porque é exatamente ela que a asserção
     está trancando: qualquer habilidade nova que o regex passe a alcançar
     fica vermelha aqui antes de mover um PV. */
  const NOMES_QUE_CUMPREM = [
    "Cura Leve", "Toque Curativo", "Canção Curativa", "Balada do Herói",
    "Segundo Fôlego", "Purificar", "Palavra de Coragem", "Passo do Vento",
  ];
  const reconhecidas = ACERVO.filter(({ hab }) => poderDe(hab));
  const falsos = reconhecidas.filter(({ hab }) => !NOMES_QUE_CUMPREM.includes(hab.nome)).map(({ hab, fonte }) => `${hab.nome} (${fonte})`);
  console.log(`  ··  ${reconhecidas.length} habilidades do acervo são poder de classe pela tabela`);
  t(`nenhuma habilidade fora da lista declarada vira poder (teto ${MEDIDA_DA_PORTA.tetoDeFalsosPoderes})`,
    falsos.length <= MEDIDA_DA_PORTA.tetoDeFalsosPoderes, falsos.slice(0, 8).join(" | "));
  t("e toda a lista declarada é achada de verdade no acervo",
    NOMES_QUE_CUMPREM.every((n) => reconhecidas.some(({ hab }) => hab.nome === n)),
    NOMES_QUE_CUMPREM.filter((n) => !reconhecidas.some(({ hab }) => hab.nome === n)).join(", "));

  const doGrimorio = MAGIAS.filter((m) => poderDe(m)).map((m) => m.nome);
  t(`nenhuma magia do grimório vira poder de classe (teto ${MEDIDA_DA_PORTA.tetoDeMagiasQueViramPoder})`,
    doGrimorio.length <= MEDIDA_DA_PORTA.tetoDeMagiasQueViramPoder, doGrimorio.join(", "));

  /* AS ARMADILHAS NOMEADAS — as que o próprio módulo diz que a âncora
     existe para recusar, mais as vizinhas de família. Se alguém afrouxar
     um regex amanhã, é aqui que a casa ouve primeiro. */
  for (const nome of ["Chamado da Chuva", "Renovação", "Círculo Sagrado", "Contra-Canção", "Restauração Menor", "Restauração Maior"]) {
    const h = doAcervo(nome);
    if (!h) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
    t(`"${nome}" fala de cura ou de limpeza e NÃO é poder desta porta`, !poderDe(h), `casou com ${poderDe(h) && poderDe(h).id}`);
  }
  /* o lixo, e o `= {}` que não cobre `null` */
  for (const lixo of [null, undefined, "", {}, { nome: "" }, { nome: "   ", descricao: "" }, 0, []]) {
    t(`${JSON.stringify(lixo) === undefined ? String(lixo) : JSON.stringify(lixo)} não é poder nenhum → null`, poderDe(lixo) === null);
  }
}

/* ============================================================
   3. A RÉGUA DA CURA, LIDA DE VOLTA DA TABELA

   Os números não são conferidos contra uma cópia digitada aqui: a
   suíte recalcula a escada a partir de `base`/`porNivel`/`minimo` e
   confere que o resolvedor devolve exatamente aquilo. Copiar "16"
   provaria que a suíte sabe somar, não que o jogo soma.
   ============================================================ */
sec("3. a régua da cura sai da tabela");
{
  const curas = PODERES_DE_CLASSE.filter((p) => p.motor === "cura");
  const curaDe = (r, nivel) => Math.max(Number(r.minimo) || 1, Math.round((Number(r.base) || 0) + (Number(r.porNivel) || 0) * Math.max(1, Number(nivel) || 1)));
  t(`há ${curas.length} linhas de cura, e todas declaram base, escada e piso`,
    curas.length > 0 && curas.every((r) => r.base > 0 && r.porNivel > 0 && r.minimo > 0));
  t(`nenhuma base passa de ${MEDIDA_DA_PORTA.tetoDaBaseDeCura}`, curas.every((r) => r.base <= MEDIDA_DA_PORTA.tetoDaBaseDeCura),
    curas.filter((r) => r.base > MEDIDA_DA_PORTA.tetoDaBaseDeCura).map((r) => `${r.id}=${r.base}`).join(", "));
  t(`e nenhuma escada passa de ${MEDIDA_DA_PORTA.tetoPorNivelDeCura} por nível`, curas.every((r) => r.porNivel <= MEDIDA_DA_PORTA.tetoPorNivelDeCura),
    curas.filter((r) => r.porNivel > MEDIDA_DA_PORTA.tetoPorNivelDeCura).map((r) => `${r.id}=${r.porNivel}`).join(", "));
  /* só o que se gasta pode passar da base dos outros — e ele é UM só */
  const acimaDaMedia = curas.filter((r) => r.base >= MEDIDA_DA_PORTA.tetoDaBaseDeCura);
  t("o único que chega ao teto da base é o que se gasta por dia", acimaDaMedia.length === 1 && acimaDaMedia[0].porDia === true,
    acimaDaMedia.map((r) => r.id).join(", "));

  /* A RÉGUA DO DOBRO, de ponta a ponta da escada: quem escolhe UM escolhe
     fundo, quem rega TODOS rega raso. Conferida em cada nível de 1 a 20,
     porque uma linha nova pode respeitar a régua no nível 8 e furá-la no 1. */
  const furos = [];
  for (let n = MEDIDA_DA_PORTA.nivelMinimoDaEscada; n <= MEDIDA_DA_PORTA.nivelMaximoDaEscada; n++) {
    const um = Math.min(...curas.filter((r) => r.alvo !== "grupo").map((r) => curaDe(r, n)));
    const todos = Math.max(...curas.filter((r) => r.alvo === "grupo").map((r) => curaDe(r, n)));
    if (!(um > todos)) furos.push(`nv${n}: um=${um} grupo=${todos}`);
  }
  t(`a cura de um alvo supera a de grupo em todos os níveis ${MEDIDA_DA_PORTA.nivelMinimoDaEscada}–${MEDIDA_DA_PORTA.nivelMaximoDaEscada}`,
    furos.length === 0, furos.slice(0, 4).join(" | "));
  t("e o piso nunca é maior que a cura do nível 1 (piso que morde seria escada mentindo)",
    curas.every((r) => r.minimo <= curaDe(r, 1)));

  /* AGORA A FICHA, e ela tem de bater com a conta acima */
  const leve = doAcervo("Cura Leve"), regraLeve = poderDe(leve);
  const esperado = curaDe(regraLeve, N);
  const antes = mesa({ vida: 10 });
  const r = aplicarPoder(antes, leve, {});
  t(`Cura Leve no nível ${N} devolve ${esperado} PV, o que a tabela manda`, r.ok === true && r.pers.vida === 10 + esperado, `vida ${r.pers.vida}`);
  t("o jogador lê o número na linha", r.linha.includes(`+${esperado} PV`) && r.linha.includes(`${10 + esperado}/${PV}`), r.linha);
  t("e o Mestre é proibido de recalcular", /não o recalcule/.test(r.nota) && /APLICADA PELO SISTEMA/.test(r.nota));
  /* o teto do PV é respeitado: cura não passa de vidaMax */
  const quaseInteiro = mesa({ vida: PV - 1 });
  const r2 = aplicarPoder(quaseInteiro, leve, {});
  t("a cura para no teto de PV e anuncia o ganho REAL, não o da tabela", r2.ok === true && r2.pers.vida === PV && r2.linha.includes("+1 PV"), r2.linha);
}

/* ============================================================
   4. `aplicarPoder` MUDA A FICHA DE VERDADE — uma família por vez

   O par antes×depois, com número exato. "Mudou alguma coisa" é o
   que uma suíte diz quando não olhou.
   ============================================================ */
sec("4. cada motor muda a ficha, e muda o que promete");
{
  /* ---- CURA em outro corpo: o PV sobe em QUEM recebeu, e só nele ---- */
  {
    const antes = comGrupo();
    const r = aplicarPoder(antes, doAcervo("Cura Leve"), {});
    const ganho = poderDe(doAcervo("Cura Leve")).base + poderDe(doAcervo("Cura Leve")).porNivel * N;
    t("a cura vai ao mais ferido da mesa: Ilse, e não o herói inteiro", r.ok === true && r.pers.grupo[0].vida === 10 + Math.round(ganho), `Ilse ${r.pers.grupo[0].vida}`);
    t("…e o herói não ganhou um PV que não era dele", r.pers.vida === antes.vida);
    t("…nem o companheiro que estava inteiro", r.pers.grupo[1].vida === antes.grupo[1].vida);
    t("o nome de quem recebeu está na linha", r.linha.includes("Ilse") && r.linha.startsWith("✚"), r.linha);
  }
  /* ---- CURA de GRUPO: sobe em todos os de pé, e o caído fica no chão ---- */
  {
    const antes = comGrupo({ vida: 20, grupo: [{ nome: "Ilse", vida: 10, vidaMax: 40 }, { nome: "Morto", vida: 0, vidaMax: 20 }] });
    const regra = poderDe(doAcervo("Canção Curativa"));
    const valor = Math.max(regra.minimo, Math.round(regra.base + regra.porNivel * N));
    const r = aplicarPoder(antes, doAcervo("Canção Curativa"), {});
    t(`a canção rega todos os de pé em +${valor}`, r.ok === true && r.pers.vida === 20 + valor && r.pers.grupo[0].vida === 10 + valor,
      `heroi ${r.pers.vida} · Ilse ${r.pers.grupo[0].vida}`);
    t("e o caído continua no chão — cura fecha ferida, não ergue do chão", r.pers.grupo[1].vida === 0);
    t("a nota proíbe o Mestre de levantar quem está caído", /não levante quem está caído/.test(r.nota));
  }
  /* ---- PORTA: a condição SAI da lista, e só a que a porta alcança ---- */
  {
    const antes = mesa({ condicoes: [criarCondicao("sangrando"), criarCondicao("envenenado"), criarCondicao("cego")] });
    const r = aplicarPoder(antes, doAcervo("Purificar"), {});
    const ids = r.pers.condicoes.map((c) => c.id);
    t("Purificar tira o veneno e a cegueira", r.ok === true && !ids.includes("envenenado") && !ids.includes("cego"), ids.join(", "));
    t("…e deixa o sangramento, que é ferimento e não coisa posta no corpo", ids.join(",") === "sangrando");
    t("o alcance é o da porta declarada, não uma segunda lista aqui",
      portaDeSaida("Purificar").remove.every((id) => !ids.includes(id)));
    t("e a nota nomeia o que saiu e proíbe devolver", /CONDIÇÃO REMOVIDA PELO SISTEMA/.test(r.nota) && /Não devolva a condição/.test(r.nota));
  }
  /* ---- PORTA em outro corpo ---- */
  {
    const antes = comGrupo({ grupo: [{ nome: "Ilse", vida: 10, vidaMax: 40, condicoes: [criarCondicao("amedrontado"), criarCondicao("envenenado")] }] });
    const r = aplicarPoder(antes, doAcervo("Palavra de Coragem"), {});
    const ids = r.pers.grupo[0].condicoes.map((c) => c.id);
    t("Palavra de Coragem tira o medo de Ilse", r.ok === true && !ids.includes("amedrontado"), ids.join(", "));
    t("…e só o medo: o veneno não é assunto desta palavra", ids.join(",") === "envenenado");
    t("…e a ficha do herói não foi tocada", r.pers.condicoes === undefined || (r.pers.condicoes || []).length === 0);
  }
  /* ---- PASSIVO: não muda a ficha, e é OUTRO MÓDULO que o lê ---- */
  {
    const antes = mesa({ habilidades: [doAcervo("Passo do Vento")] });
    const r = aplicarPoder(antes, doAcervo("Passo do Vento"), {});
    t("o passivo devolve ok sem mexer num campo sequer", r.ok === true && r.pers === antes);
    t("a linha diz que já está valendo", r.linha.startsWith("🌀") && /não encontra chão difícil/.test(r.linha), r.linha);
    t("e a nota proíbe pedir teste por algo que o sistema já conta", /JÁ VALENDO PELO SISTEMA/.test(r.nota) && /não me peça teste/.test(r.nota));
    /* A PORTA CHEGA AO LEITOR DE FORA, que é o que faz o passivo existir.
       `dobraMovimento`/`ignoraTerrenoDificil` liam só a dádiva até a
       v9.264; um passivo que nenhum módulo lesse seria linha decorativa. */
    t("`temPassivoDeClasse` reconhece o movimento pela chave", temPassivoDeClasse(antes, "movimento"));
    t("…e aceita a habilidade escrita como texto cru na ficha", temPassivoDeClasse({ habilidades: ["Passo do Vento"] }, "movimento"));
    t("…e diz não para uma chave que ninguém declarou", !temPassivoDeClasse(antes, "voo"));
    t("…e para quem só tem cura na ficha", !temPassivoDeClasse({ habilidades: [doAcervo("Cura Leve")] }, "movimento"));
    t("dadivas.js dobra o movimento por causa da habilidade, não só da dádiva", dobraMovimento(antes) && ignoraTerrenoDificil(antes));
    t("…e não dobra o de quem não a tem", !dobraMovimento({ habilidades: [doAcervo("Cura Leve")] }));
    for (const lixo of [null, undefined, {}, { habilidades: null }, { habilidades: [] }, 7]) {
      t(`temPassivoDeClasse(${JSON.stringify(lixo) === undefined ? String(lixo) : JSON.stringify(lixo)}) não estoura e diz não`, temPassivoDeClasse(lixo, "movimento") === false);
    }
  }
  /* ---- O QUE SE GASTA, e o prazo dele é o DIA ---- */
  {
    const dia = MEDIDA_DA_PORTA.diaDaProva;
    const folego = doAcervo("Segundo Fôlego");
    const regra = poderDe(folego);
    const valor = Math.max(regra.minimo, Math.round(regra.base + regra.porNivel * N));
    const antes = mesa({ vida: 10 });
    const r1 = aplicarPoder(antes, folego, { dia });
    t(`o Segundo Fôlego devolve ${valor} PV ao próprio corpo`, r1.ok === true && r1.pers.vida === 10 + valor, `vida ${r1.pers.vida}`);
    t("e a ficha anota o DIA em que foi gasto, não um contador para alguém zerar", r1.pers.poderGastos[regra.id] === dia);
    const r2 = aplicarPoder(r1.pers, folego, { dia });
    t("no mesmo dia, a segunda vez é recusada", r2.ok === false);
    const r3 = aplicarPoder(r1.pers, folego, { dia: dia + 1 });
    t("e o dia seguinte o devolve sozinho — sem descanso que o limpe", r3.ok === true && r3.pers.poderGastos[regra.id] === dia + 1);
    t("nenhuma das outras curas se gasta", PODERES_DE_CLASSE.filter((p) => p.motor === "cura" && p.porDia).length === 1);
  }
  /* ---- O QUE NÃO É DESTA FAMÍLIA: `null`, e é a esmagadora maioria ---- */
  {
    t("uma habilidade de outra família devolve null (a porta cala e o turno segue)", aplicarPoder(mesa(), doAcervo("Cem Punhos"), {}) === null);
    t("ficha nula devolve null", aplicarPoder(null, doAcervo("Cura Leve"), {}) === null);
    t("habilidade nula devolve null", aplicarPoder(mesa(), null, {}) === null);
  }
}

/* ============================================================
   5. A RECUSA NÃO COBRA · A IMUTABILIDADE · O DETERMINISMO
   ============================================================ */
sec("5. a recusa não cobra, a ficha não é mutada e o alvo não sorteia");
{
  /* ---- A RECUSA DEVOLVE A MESMA FICHA, pela identidade ---- */
  /* `===` e não `deepEqual` de propósito: gastar para nada é desperdício,
     não decisão, e a única prova de que nada foi gasto é o objeto ser o
     MESMO que entrou. Uma cópia idêntica já seria uma ficha nova gravada. */
  const recusas = [
    ["o Segundo Fôlego já gasto no dia", (() => { const p = aplicarPoder(mesa({ vida: 10 }), doAcervo("Segundo Fôlego"), { dia: 1 }).pers; return [p, doAcervo("Segundo Fôlego"), { dia: 1 }]; })()],
    ["a cura sobre quem não tem ferida", [mesa(), doAcervo("Cura Leve"), {}]],
    ["a canção sobre um grupo inteiro", [comGrupo({ grupo: [{ nome: "Ilse", vida: 40, vidaMax: 40 }] }), doAcervo("Canção Curativa"), {}]],
    ["a porta sobre quem não carrega nada que ela alcance", [mesa({ condicoes: [criarCondicao("sangrando")] }), doAcervo("Purificar"), {}]],
    ["o fôlego de quem está no chão", [mesa({ vida: 0 }), doAcervo("Segundo Fôlego"), { dia: 1 }]],
    ["a cura no aliado citado que está inteiro", [comGrupo(), doAcervo("Cura Leve"), { alvo: "Bram" }]],
  ];
  for (const [rotulo, [pers, hab, ctx]] of recusas) {
    const r = aplicarPoder(pers, hab, ctx);
    t(`recusa: ${rotulo}`, !!r && r.ok === false, r ? `ok=${r.ok}` : "devolveu null");
    t(`  …e devolve a MESMA ficha, sem nada gasto`, !!r && r.pers === pers);
    t(`  …com uma linha que o jogador entende: "${r && r.linha}"`,
      !!r && r.linha.startsWith("⛔") && r.linha.length > 20 && !/undefined|NaN|\[object/.test(r.linha));
    t(`  …e sem nota: recusa não fala com o Mestre`, !!r && r.nota === "");
  }

  /* ---- IMUTABILIDADE: byte a byte ---- */
  /* A lei é "estado é substituído, nunca mutado". A prova é a ficha que
     ENTROU sair com o mesmo JSON de antes — inclusive nos casos em que o
     resolvedor mexe fundo (grupo inteiro, lista de condições). */
  const casos = [
    ["cura de um alvo", comGrupo(), doAcervo("Cura Leve"), {}],
    ["cura de grupo", comGrupo({ vida: 10 }), doAcervo("Canção Curativa"), {}],
    ["cura do próprio", mesa({ vida: 10 }), doAcervo("Segundo Fôlego"), { dia: 2 }],
    ["porta no herói", mesa({ condicoes: [criarCondicao("envenenado"), criarCondicao("cego")] }), doAcervo("Purificar"), {}],
    ["porta no companheiro", comGrupo({ grupo: [{ nome: "Ilse", vida: 10, vidaMax: 40, condicoes: [criarCondicao("amedrontado")] }] }), doAcervo("Palavra de Coragem"), {}],
    ["passivo", mesa({ habilidades: [doAcervo("Passo do Vento")] }), doAcervo("Passo do Vento"), {}],
  ];
  for (const [rotulo, pers, hab, ctx] of casos) {
    const copia = JSON.stringify(pers);
    const r = aplicarPoder(pers, hab, ctx);
    t(`${rotulo}: a ficha que entrou sai byte a byte igual`, JSON.stringify(pers) === copia);
    /* e o outro lado da mesma lei: quando alguma coisa MUDOU, o que volta é
       um objeto novo. O passivo é a exceção declarada — ele não muda campo
       nenhum, e por isso devolve a mesma ficha de propósito. */
    const mudou = poderDe(hab).motor !== "passivo";
    t(`  …e o que volta é ${mudou ? "OUTRA ficha" : "a MESMA (o passivo não muda campo nenhum)"}`,
      mudou ? (r.ok === true && r.pers !== pers) : r.pers === pers);
  }
  /* o objeto do grupo também não é mutado no lugar */
  {
    const p = comGrupo();
    const ilseAntes = p.grupo[0];
    const r = aplicarPoder(p, doAcervo("Cura Leve"), {});
    t("o companheiro curado é um objeto NOVO — quem estava na lista não foi mexido", r.pers.grupo[0] !== ilseAntes && ilseAntes.vida === 10);
    t("…e quem não foi curado continua sendo o MESMO objeto (sem re-render de graça)", r.pers.grupo[1] === p.grupo[1]);
  }

  /* ---- DETERMINISMO: a mesma mesa, duas vezes, em qualquer ordem ---- */
  /* Não há semente aqui porque não há sorte: a arbitragem é a ORDEM DA
     MESA — [herói, ...grupo] — e o desempate é a posição. É o único árbitro
     que um sistema sem servidor tem, e ele precisa de prova porque um
     `sort` instável ou um `find` sobre objeto reordenado o quebraria em
     silêncio, em uma máquina só. */
  {
    const a = aplicarPoder(comGrupo(), doAcervo("Cura Leve"), { alvo: "" });
    const b = aplicarPoder(comGrupo(), doAcervo("Cura Leve"), { alvo: "" });
    t("a mesma mesa, duas vezes, escolhe o mesmo alvo e o mesmo número", JSON.stringify(a) === JSON.stringify(b));
    /* a ordem das CHAMADAS não muda a escolha: outra família no meio não
       desloca o alvo da cura */
    aplicarPoder(comGrupo(), doAcervo("Purificar"), {});
    aplicarPoder(comGrupo(), doAcervo("Canção Curativa"), {});
    const c = aplicarPoder(comGrupo(), doAcervo("Cura Leve"), { alvo: "" });
    t("…e continua a mesma depois de outras chamadas no meio", JSON.stringify(a) === JSON.stringify(c));
    /* o desempate é a POSIÇÃO, e o herói vem primeiro: com a mesma fração
       de PV, quem está na frente da mesa recebe */
    const empate = mesa({ vida: 20, vidaMax: 40, grupo: [{ nome: "Ilse", vida: 10, vidaMax: 20 }] });
    const e1 = aplicarPoder(empate, doAcervo("Cura Leve"), { alvo: "" });
    const e2 = aplicarPoder(mesa({ vida: 20, vidaMax: 40, grupo: [{ nome: "Ilse", vida: 10, vidaMax: 20 }] }), doAcervo("Cura Leve"), { alvo: "" });
    t("no empate de fração, o desempate é a ordem da mesa — o herói", /em você/.test(e1.linha) && e1.linha === e2.linha, e1.linha);
    /* e o nome citado ganha do cálculo: quem escreve um nome aponta */
    const citado = aplicarPoder(comGrupo({ vida: 10 }), doAcervo("Cura Leve"), { alvo: "Ilse" });
    t("o nome citado vence o mais ferido — quem aponta, aponta", /Ilse/.test(citado.linha), citado.linha);
  }

  /* ---- `= {}` NÃO COBRE `null`, e é lei da casa ---- */
  for (const ctx of [null, undefined, {}, { dia: null }, { alvo: null }, { dia: "banana", alvo: 7 }]) {
    let estourou = false, r = null;
    try { r = aplicarPoder(mesa({ vida: 10 }), doAcervo("Cura Leve"), ctx); } catch { estourou = true; }
    t(`ctx ${JSON.stringify(ctx) === undefined ? String(ctx) : JSON.stringify(ctx)} não estoura e ainda cura`, !estourou && !!r && r.ok === true);
  }
  /* e o `porDia`, que é o único que LÊ o `dia`, não se perde sem ele */
  {
    const r = aplicarPoder(mesa({ vida: 10 }), doAcervo("Segundo Fôlego"), null);
    t("o Segundo Fôlego sem `dia` nenhum grava o dia 0 e não estoura", r.ok === true && r.pers.poderGastos.segundo_folego === 0);
  }
}

/* ============================================================
   6. A CATRACA: `AGUARDAM` É DECLARADA E SÓ ENCOLHE

   A LEI DA FASE, escrita pela pessoa em `mente/pauta.md` (H1):
   "nenhuma habilidade promete na ficha e falha na mesa, e a lista
   das que ainda não cumprem é DECLARADA e ENCOLHE a cada etapa,
   nunca cresce."

   Uma lista honesta que ninguém mede é um comentário. O que a
   transforma em catraca é o TETO abaixo — e é por isso que ele é um
   número escrito aqui, e não `AGUARDAM.length` lido de volta: uma
   asserção que compara a lista consigo mesma passa verde com mil
   entradas.
   ============================================================ */
sec("6. a catraca de AGUARDAM");
{
  /* ============================================================
     O TETO DA DÍVIDA — 40, medido em 16/09/2026 (v9.265).

     BAIXAR ESTE NÚMERO É O PROGRESSO DA FASE. SUBI-LO É PROIBIDO.

     POR QUÊ, e vale escrever inteiro porque a tentação é real: no dia
     em que alguém acrescentar uma habilidade não-cumprida a `AGUARDAM`,
     esta linha fica VERMELHA — e o remédio óbvio, subir o teto para 41,
     é exatamente a doença. O teto existe para que a dívida tenha um
     custo no mesmo commit em que nasce: ou a habilidade passa a cumprir
     (e o teto desce), ou quem a escreveu explica por escrito, à pessoa,
     por que a casa vai dever mais do que devia ontem. Uma lista que
     pode crescer em silêncio não mede nada; mede só a paciência de
     quem lê.

     QUEM DERRUBAR UMA LINHA ABAIXA O TETO NO MESMO COMMIT. Deixar o
     teto folgado depois de pagar a dívida é guardar espaço para a
     próxima — e a próxima chega.
     ============================================================ */
  const TETO_DE_AGUARDAM = 40;
  console.log(`  ··  AGUARDAM hoje: ${AGUARDAM.length} · teto ${TETO_DE_AGUARDAM} (16/09/2026)`);
  t(`a dívida declarada não passou do teto (${AGUARDAM.length} ≤ ${TETO_DE_AGUARDAM})`,
    AGUARDAM.length <= TETO_DE_AGUARDAM,
    `subiu para ${AGUARDAM.length} — o remédio é fazer a habilidade cumprir, NUNCA subir o teto`);
  /* e a folga também é dito: um teto muito acima da lista é catraca solta */
  t("…e o teto não está folgado: quem pagou dívida abaixou o teto junto",
    TETO_DE_AGUARDAM - AGUARDAM.length <= 0, `folga de ${TETO_DE_AGUARDAM - AGUARDAM.length} linhas — abaixe o teto`);

  /* ---- TODA ENTRADA É DECLARADA E DATADA ---- */
  const semCampo = AGUARDAM.filter((a) => !String(a.nome || "").trim() || !String(a.classe || "").trim()
    || !String(a.promete || "").trim() || !String(a.motivo || "").trim() || !String(a.desde || "").trim());
  t("toda entrada tem nome, classe, promete, motivo e desde", semCampo.length === 0,
    semCampo.map((a) => a.nome || "(sem nome)").join(", "));
  const dataTorta = AGUARDAM.filter((a) => !/^\d{2}\/\d{2}$/.test(String(a.desde || "")));
  t("e toda data está escrita como dia/mês", dataTorta.length === 0, dataTorta.map((a) => `${a.nome}:${a.desde}`).join(", "));
  /* motivo de uma palavra é motivo nenhum: a lista tem de servir a quem
     vier pagar a dívida, e "não dá" não diz o que construir */
  const motivoCurto = AGUARDAM.filter((a) => String(a.motivo).trim().length < 25);
  t("nenhum motivo é curto demais para servir a quem vier pagá-lo", motivoCurto.length === 0,
    motivoCurto.map((a) => a.nome).join(", "));

  /* ---- E ELA NÃO SE PROTEGE COM FANTASMAS ---- */
  /* O DENTE QUE IMPEDE A CATRACA DE MEDIR NADA. Uma lista de dívidas com
     nomes que não existem no acervo passaria verde para sempre e
     encolheria sozinha ao sabor de quem escreve — seria decoração com
     aparência de contabilidade. */
  const fantasmas = AGUARDAM.filter((a) => !NOMES_DO_ACERVO.has(a.nome)).map((a) => a.nome);
  t("toda habilidade declarada em AGUARDAM existe MESMO no acervo, pelo nome", fantasmas.length === 0, fantasmas.join(", "));
  /* e a classe declarada é a classe de verdade — um rótulo errado manda
     quem for pagar a dívida procurar no arquivo errado */
  const classeTorta = AGUARDAM.filter((a) => {
    const achada = ACERVO.find((x) => x.hab.nome === a.nome);
    return achada && achada.fonte !== `classe:${a.classe}`;
  }).map((a) => `${a.nome} diz ${a.classe}`);
  t("…e a classe declarada é a classe em que a habilidade mora", classeTorta.length === 0, classeTorta.join(" | "));
  const repetidas = AGUARDAM.map((a) => a.nome).filter((n, i, v) => v.indexOf(n) !== i);
  t("e nenhuma habilidade é declarada duas vezes", repetidas.length === 0, repetidas.join(", "));

  /* ---- AS DUAS LISTAS NÃO SE SOBREPÕEM ---- */
  /* A METADE MAIS IMPORTANTE DA LEI: uma habilidade que a porta CUMPRE e
     que ainda está declarada como dívida faz a conta mentir dos dois
     lados — a dívida parece maior do que é, e o que cumpre parece menos.

     A EXCEÇÃO É NOMEADA, CONTADA E JUSTIFICADA, e não é um perdão solto.
     "Palavra de Coragem" promete DUAS coisas ("remove medo E concede PV
     temporário"); o medo sai por esta porta desde a v9.265, o PV
     temporário não existe em lugar nenhum do código. Meia promessa
     cumprida é meia dívida, não dívida quitada — e apagá-la de `AGUARDAM`
     seria a casa alegando cumprir o que não cumpre.

     O DENTE É A IGUALDADE, não a continência: a sobreposição tem de ser
     EXATAMENTE esta lista. Uma habilidade nova que caia nas duas sem
     explicação fica vermelha aqui; e no dia em que o PV temporário for
     construído, esta linha também fica vermelha e cobra a saída da
     entrada — o perdão não sobrevive ao pagamento. */
  const MEIA_DIVIDA = ["Palavra de Coragem"];
  const sobrepostas = AGUARDAM.filter((a) => { const h = doAcervo(a.nome); return h && !!poderDe(h); }).map((a) => a.nome);
  t(`a sobreposição entre AGUARDAM e o que a porta cumpre é exatamente a meia-dívida declarada (${MEIA_DIVIDA.join(", ")})`,
    sobrepostas.length === MEIA_DIVIDA.length && sobrepostas.every((n) => MEIA_DIVIDA.includes(n)),
    `sobrepõem: ${sobrepostas.join(", ") || "nenhuma"}`);
  for (const nome of MEIA_DIVIDA) {
    const linha = AGUARDAM.find((a) => a.nome === nome);
    t(`"${nome}" é meia-dívida de verdade: a porta a cumpre…`, !!poderDe(doAcervo(nome)));
    t(`  …e o motivo dela nomeia por escrito a metade que falta`, !!linha && /PV TEMPORÁRIO não existe/i.test(linha.motivo), linha && linha.motivo);
  }
  /* o outro lado do mesmo dente: o que a porta cumpre INTEIRO não pode
     estar na dívida de jeito nenhum */
  const cumpremInteiro = ACERVO.filter(({ hab }) => poderDe(hab)).map(({ hab }) => hab.nome).filter((n) => !MEIA_DIVIDA.includes(n));
  const mentindo = cumpremInteiro.filter((n) => AGUARDAM.some((a) => a.nome === n));
  t("nenhuma habilidade que a porta cumpre inteira é declarada como dívida", mentindo.length === 0, mentindo.join(", "));

  /* ---- E A PROSA NÃO ENTRA NA CONTA ---- */
  /* Está escrito no módulo e vale trancar: as habilidades que são só
     ficção (Rastrear, Lábia, Conhecimento Vasto…) não prometem número
     nenhum, e contá-las como dívida inflaria a lista com trabalho que não
     existe — o que faria o teto acima subir sem nenhum bug ter nascido. */
  for (const nome of ["Rastrear", "Lábia", "Conhecimento Vasto", "Mãos Leves", "Ler Auras", "Falar com Animais"]) {
    if (!doAcervo(nome)) { t(`"${nome}" existe no acervo`, false, "não encontrada"); continue; }
    t(`"${nome}" é prosa, e prosa não é dívida`, !AGUARDAM.some((a) => a.nome === nome));
  }
}

/* ============================================================
   7. A PORTA CHEGOU AOS DOIS SÍTIOS DO APP

   UM SÍTIO SÓ É MEIO ÓRGÃO — a pedra em que esta casa tropeçou
   quatro vezes. O `App.jsx` tem DUAS fileiras: a do painel (o botão
   da habilidade) e a da citada (quem digita "uso Purificar" na
   frase). Uma porta em uma só é a habilidade que funciona pelo
   botão e falha pelo texto, sem ninguém ficar vermelho.

   O molde é `teste-comp.mjs`: ler o `App.jsx` como TEXTO, porque um
   ramo do App é invisível ao `teste-ligacao`, que só conta leitores
   de export.
   ============================================================ */
sec("7. a fiação chegou aos dois sítios do App");
{
  const APP = readFileSync("../src/App.jsx", "utf8");
  t("o App importa `aplicarPoder` de poder-de-classe.js", /import \{ aplicarPoder \} from "\.\/poder-de-classe\.js"/.test(APP));
  /* O HOMÔNIMO: `poder.js` também exporta `poderDe`, e é outra coisa (o
     ÍNDICE de poder de uma ficha). Importar os dois trocaria um pelo outro
     calado — e nenhum teste veria. */
  t("…e NÃO importa o `poderDe` homônimo de lá (o nome já é de poder.js)", !/import \{[^}]*\bpoderDe\b[^}]*\} from "\.\/poder-de-classe\.js"/.test(APP));

  t("a fiação existe, e se chama `porHabilidadeDeClasse`", /const porHabilidadeDeClasse = \(/.test(APP));
  /* NUNCA PODE CUSTAR O TURNO: um órgão que estoura não derruba a cena */
  const corpo = (APP.match(/const porHabilidadeDeClasse = \([\s\S]*?\n  \};/) || [""])[0];
  t("…dentro de try/catch, com o `calou` da casa", /try \{/.test(corpo) && /catch \([\s\S]*?calou\("poder-de-classe"/.test(corpo), "sem try/catch ou sem calou");
  t("…e a chamada a `aplicarPoder` está DENTRO desse try, não ao lado dele",
    corpo.indexOf("try {") >= 0 && corpo.indexOf("aplicarPoder(") > corpo.indexOf("try {"));

  /* OS DOIS SÍTIOS, contados. A fileira é declarada como array literal nos
     dois lugares; contar as fileiras que NOMEIAM a porta é o que impede um
     refator de levar uma delas embora em silêncio. */
  const fileiras = APP.match(/for \(const fn of \[[^\]]*porHabilidadeDeClasse[^\]]*\]\)/g) || [];
  t(`a porta está nas DUAS fileiras do laço (achadas: ${fileiras.length})`, fileiras.length === 2,
    fileiras.length === 1 ? "um sítio só é meio órgão" : `${fileiras.length} fileiras`);
  /* e a RECUSA é honrada nos dois: sem isto, o "você já recorreu a isso
     hoje" cobraria o PM de um turno que não aconteceu */
  const recusas = APP.match(/fn === porHabilidadeDeClasse/g) || [];
  t(`a recusa que não cobra é tratada nos DOIS sítios (achadas: ${recusas.length})`, recusas.length === 2, `${recusas.length} tratamentos`);
  /* e nos dois a frase do jogador é passada adiante — é o único nome de
     ALIADO que o App tem para dar ao módulo */
  t("os dois laços passam a frase adiante, que é de onde sai o alvo citado",
    (APP.match(/fn\((?:h|habCitada), pers, acao\)/g) || []).length === 2);

  /* NENHUM NÚMERO, NENHUMA FRASE DE MUNDO E NENHUM ID MORAM NO APP.
     "Conta se prova, tela se olha": se um id da tabela vazar para cá,
     existe um segundo caminho para o mesmo número. */
  for (const vazamento of PODERES_DE_CLASSE.map((p) => p.id).concat(["poderGastos"])) {
    t(`o App não conhece \`${vazamento}\` — a conta mora no módulo`, !APP.includes(vazamento));
  }
}

/* ============================================================
   8. `temRegraPropria` ENXERGA A FAMÍLIA NOVA

   A porta do bloco de prompt (habilidades.js) pergunta "este herói
   tem alguma habilidade que passa por aqui?". A família nova entrou
   na pergunta na v9.265; o que esta seção guarda é que ela entrou
   SEM abrir a porta para todo mundo — o controle negativo é a
   metade que importa.
   ============================================================ */
sec("8. temRegraPropria enxerga o poder de classe, e só ele");
{
  t("quem tem Purificar na ficha abre a porta", temRegraPropria({ habilidades: [doAcervo("Purificar")] }));
  t("quem tem Passo do Vento também", temRegraPropria({ habilidades: [doAcervo("Passo do Vento")] }));
  t("quem tem Segundo Fôlego também", temRegraPropria({ habilidades: [doAcervo("Segundo Fôlego")] }));
  /* o controle negativo: dano puro é o caminho PADRÃO do golpe, não regra
     própria — se ele abrir a porta, é porque algum regex da fileira ficou
     solto e o bloco de prompt passou a ir em toda cena */
  t("quem só tem golpe de dano puro NÃO abre por isso", !temRegraPropria({ habilidades: [doAcervo("Palma dos Sete Ventos")] }));
  t("quem só tem prosa NÃO abre", !temRegraPropria({ habilidades: [doAcervo("Lábia")] }));
  t("ficha vazia e nula também não", !temRegraPropria({}) && !temRegraPropria(null) && !temRegraPropria({ habilidades: [] }));
  /* e a porta não virou porteira: a maioria esmagadora do acervo continua
     do lado de fora */
  const abrem = ACERVO.filter(({ hab }) => temRegraPropria({ habilidades: [hab] })).length;
  console.log(`  ··  ${abrem} das ${ACERVO.length} habilidades do acervo abrem a porta do bloco de regra própria`);
  t("a porta continua sendo exceção, não regra (menos de um terço do acervo)", abrem * 3 < ACERVO.length, `${abrem}/${ACERVO.length}`);
}

console.log(`\npoder de classe v9.265: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
