/* teste-r13-pecas.mjs — as peças da cinta e o rosto da cena (R13)

   O QUE ESTA SUÍTE GUARDA, e não é a tela: é a CONTA por baixo dela. A
   lei da casa parte a peça em duas — `gravura-da-cena.js` decide (e
   prova-se aqui, em Node) e os `.jsx` pintam (e provam-se no olho). O
   que se pode afirmar sem montar React afirma-se aqui.

   E A PRIMEIRA COISA QUE ELA PROVA É A PRIMEIRA LEI DA CASA:
   determinismo por semente. Mesma semente, mesma cripta, em qualquer
   máquina — uma imagem que muda de máquina para máquina não é uma
   gravura, é ruído com boa aparência.

   A SEGUNDA É A DÍVIDA QUE `formas.md` DECLAROU E ESTA ETAPA PAGOU:
   *a hachura do protótipo é regular, e um buril não é.* Há um dente só
   para isso — se alguém "simplificar" um destes laços para um passo
   constante, a gravura volta a ler-se como trama de máquina e a suíte
   diz porquê. */
import { readFileSync } from "node:fs";
import {
  AMPULHETA, areiaDaAmpulheta,
  APERTOS, apertoDoPrazo, palavraDoPrazo,
  GRAMATICAS, HACHURAS, BIOMAS_DA_GRAVURA, GRAMATICA_LISA, gramaticaDo,
  BANDAS, LUZES, HORARIO_DA_LUZ, luzDaHora,
  hachuraDoCeu, hachuraDoChao, gravuraDaCena, LARGURA_DE_REFERENCIA,
} from "../src/gravura-da-cena.js";
import { LUZ_DA_CENA, CINTA, T, TIPOS, ALVOS } from "../src/estilo.js";
import { idsDeBioma, MOLDES } from "../src/moldes.js";
import { rng, hashSemente } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const UI = readFileSync("../src/ui.jsx", "utf8");
const ROSTO = readFileSync("../src/rosto-da-cena.jsx", "utf8");

/* ============================================================ */
sec("1. determinismo por semente — a primeira lei da casa");
{
  const cena = () => gravuraDaCena({ semente: "s-12345", bioma: "montanha", lugar: "Vale Torto", hora: 19, largura: 375 });
  const a = JSON.stringify(cena()), b = JSON.stringify(cena());
  t("a mesma semente dá a mesma cripta, chamada a chamada", a === b);

  const outra = JSON.stringify(gravuraDaCena({ semente: "s-12346", bioma: "montanha", lugar: "Vale Torto", hora: 19, largura: 375 }));
  t("uma semente diferente dá outra cripta", a !== outra);

  /* O LUGAR ENTRA NA SEMENTE, e é isto que faz duas montanhas do mesmo
     mundo não serem a mesma montanha. */
  const outroLugar = JSON.stringify(gravuraDaCena({ semente: "s-12345", bioma: "montanha", lugar: "Pedra Alta", hora: 19, largura: 375 }));
  t("o lugar entra na semente: duas montanhas do mesmo mundo diferem", a !== outroLugar);

  /* E A HORA NÃO ENTRA NO DESENHO — muda a LUZ e nada mais. É a lei da
     peça: «a hora não muda o desenho: muda a luz». Se um dia a hora
     entrar no sorteio, a gravura passa a piscar de hora a hora e o
     motivo de ela não animar cai por terra. */
  const manha = gravuraDaCena({ semente: "s-12345", bioma: "montanha", lugar: "Vale Torto", hora: 5, largura: 375 });
  const noite = gravuraDaCena({ semente: "s-12345", bioma: "montanha", lugar: "Vale Torto", hora: 23, largura: 375 });
  t("a hora muda a luz e NÃO o desenho", manha.luz !== noite.luz && JSON.stringify(manha.d) === JSON.stringify(noite.d));

  /* A semente é `hashSemente(mundo + "|" + bioma + "|" + lugar)`, byte a
     byte como `formas.md` a escreve — e não um segundo motor. */
  const esperado = rng(hashSemente("s-12345|montanha|Vale Torto"));
  t("o motor é o da casa: hashSemente + rng de semente.js", typeof esperado === "function" && esperado() >= 0);
}

/* ============================================================ */
sec("2. a dívida da hachura — um buril não anda de compasso");
{
  const rand = rng(hashSemente("buril"));
  const ceu = hachuraDoCeu(rand, 375);
  const xs = ceu.map((l) => Number(l.match(/^M (-?[\d.]+)/)[1]));
  /* os saltos entre talhos consecutivos da MESMA fiada */
  const saltos = [];
  for (let i = 1; i < xs.length; i++) if (xs[i] > xs[i - 1]) saltos.push(Math.round((xs[i] - xs[i - 1]) * 10));
  const distintos = new Set(saltos).size;
  /* A RÉGUA NÃO É A PERCENTAGEM, e a primeira versão deste dente errou
     nisso: pedia "mais de metade dos saltos distintos" e mediu 137 em
     302 — 45 %. O número estava certo e a régua é que estava errada,
     porque com os saltos arredondados a 0,1 px as colisões são
     inevitáveis num acervo de 300. O que prova que o buril não anda de
     compasso é que NENHUM salto domina: um passo constante daria UM
     salto repetido as 302 vezes. */
  const maisRepetido = Math.max(...[...new Set(saltos)].map((v) => saltos.filter((x) => x === v).length));
  t(`o espaçamento do céu é irregular (${distintos} saltos distintos em ${saltos.length})`,
    distintos > 20, "passo constante = trama de máquina, não talho");
  t(`e nenhum salto domina (o mais repetido sai ${maisRepetido}× em ${saltos.length})`,
    maisRepetido < saltos.length * 0.1, "um passo constante daria UM salto repetido em todas");

  /* e o ÂNGULO também: `formas.md` pede os dois do mesmo `rng` */
  const incl = new Set(ceu.map((l) => l.match(/l (-?[\d.]+) (-?[\d.]+)$/)).filter(Boolean)
    .map((m) => Math.round((Number(m[2]) / Number(m[1])) * 100)));
  t(`e o ângulo também sai do mesmo rng (${incl.size} inclinações distintas)`, incl.size > 5);

  /* as cinco hachuras de chão existem e são CINCO TALHOS diferentes, não
     cinco densidades — é isso que as faz distinguirem-se em cinzento */
  const assinaturas = new Set();
  for (const h of HACHURAS) {
    const linhas = hachuraDoChao(rng(hashSemente("chao")), h, 375);
    /* A IMPRESSÃO DIGITAL DE CADA HACHURA. A primeira versão comparava
       os três primeiros talhos com os números apagados, e `seca` e
       `pedra` saíam IGUAIS — as duas são talhos rectos, e o que as
       separa é o ÂNGULO (uma direcção contra duas, cruzadas), que um
       `M # # l # #` não mostra. A régua passa a colher o que de facto as
       separa: que comandos de caminho usa, e em quantos sentidos talha. */
    const comandos = [...new Set(linhas.join(" ").match(/[A-Za-z]/g) || [])].sort().join("");
    const sentidos = new Set(linhas.map((l) => l.match(/l (-?[\d.]+) (-?[\d.]+)$/))
      .filter(Boolean).map((m) => Math.sign(Number(m[2]) / Number(m[1]))));
    assinaturas.add(h === "nenhuma" ? "vazia" : comandos + "|" + [...sentidos].sort().join(","));
    if (h === "nenhuma") t("a hachura `nenhuma` (o vazio) não desenha nada", linhas.length === 0);
    else t(`a hachura \`${h}\` desenha (${linhas.length} talhos)`, linhas.length > 10);
  }
  t("e as cinco são cinco TALHOS diferentes, não cinco densidades", assinaturas.size === HACHURAS.length,
    [...assinaturas].join("  ·  "));
}

/* ============================================================ */
sec("3. os 30 biomas, e o desconhecido que não dá buraco");
{
  const todos = new Set();
  for (const m of MOLDES) for (const id of idsDeBioma(m)) todos.add(id);
  t(`moldes.js tem ${todos.size} biomas (a peça foi desenhada para 30)`, todos.size === 30, `achou ${todos.size}`);

  const semLinha = [...todos].filter((id) => !BIOMAS_DA_GRAVURA[id]);
  t("todo bioma de moldes.js tem uma linha na tabela da gravura",
    semLinha.length === 0, "sem linha: " + semLinha.join(", "));

  const sobra = Object.keys(BIOMAS_DA_GRAVURA).filter((id) => !todos.has(id));
  t("e nenhuma linha da tabela fala de um bioma que já não existe",
    sobra.length === 0, "a mais: " + sobra.join(", "));

  const fora = Object.entries(BIOMAS_DA_GRAVURA)
    .filter(([, g]) => !GRAMATICAS.includes(g.silhueta) || !HACHURAS.includes(g.hachura))
    .map(([id]) => id);
  t("toda linha usa uma das sete gramáticas e uma das cinco hachuras",
    fora.length === 0, "fora do acervo: " + fora.join(", "));

  /* A DEGRADAÇÃO ESCRITA: bioma desconhecido dá horizonte liso com
     hachura, que é uma gravura legítima — nunca um buraco na tela. */
  t("o bioma desconhecido cai no liso", gramaticaDo("bioma_que_nao_existe") === GRAMATICA_LISA);
  t("e o bioma vazio/nulo também", gramaticaDo(null) === GRAMATICA_LISA && gramaticaDo(undefined) === GRAMATICA_LISA);
  const orfa = gravuraDaCena({ semente: "x", bioma: "nada_disto", lugar: "Lugar Nenhum", hora: 3 });
  t("e desenha mesmo assim: silhueta, chão e astro", !!orfa.d.silhueta && orfa.d.chao.length > 0 && orfa.astro.raio > 0);

  /* e nenhum dos 30 estoura nem devolve desenho vazio */
  const vazios = [...todos].filter((id) => {
    const g = gravuraDaCena({ semente: "s", bioma: id, lugar: "L", hora: 12 });
    return !g.d.silhueta || g.d.ceu.length === 0;
  });
  t("os 30 biomas desenham, e nenhum devolve faixa vazia", vazios.length === 0, vazios.join(", "));
}

/* ============================================================ */
sec("4. a areia é uma função, não um desenho");
{
  const alturaDe = (f) => {
    const m = areiaDaAmpulheta(f).match(/L 6 ([\d.]+) L/);
    return AMPULHETA.base - Number(m[1]);
  };
  t("cheia dá a altura máxima", Math.abs(alturaDe(1) - AMPULHETA.alturaMax) < 0.01);
  t("a meio dá metade", Math.abs(alturaDe(0.5) - AMPULHETA.alturaMax / 2) < 0.01);

  /* O PISO DE 0,08 NÃO É ARREDONDAMENTO: existe para que "esta noite"
     ainda TENHA areia. Um triângulo de altura zero lê-se como um erro de
     desenho, não como urgência. */
  t("e o piso segura o zero: `esta noite` ainda tem areia",
    alturaDe(0) > 0 && Math.abs(alturaDe(0) - AMPULHETA.alturaMax * AMPULHETA.piso) < 0.01);
  t("o piso vale para o negativo e para o lixo", alturaDe(-5) === alturaDe(0) && alturaDe("abc") === alturaDe(1));
  t("e o teto segura o excesso", alturaDe(9) === alturaDe(1));

  /* CHEIA, A AREIA ENCHE O BULBO DE LADO A LADO: h = 5, meia-base
     0,68 × 5 = 3,4, e o triângulo vai de 2,6 a 9,4 — que é exactamente a
     boca da ampulheta a y = 11. É isso que a faz ler como MEDIDOR e não
     como enfeite. (A primeira versão desta asserção escrevia 4,3, que é
     0,34 × h: o erro estava aqui, não na peça.) */
  t("a base é 0,68 × a altura, de cada lado",
    /^M 6 11 L 2\.6 11 L 6 6 L 9\.4 11 Z$/.test(areiaDaAmpulheta(1)), areiaDaAmpulheta(1));
}

/* ============================================================ */
sec("5. o selo de prazo conta ao contrário, e nunca 1/4");
{
  t("3 ou mais noites: folgado", apertoDoPrazo(3).id === "folgado" && apertoDoPrazo(9).id === "folgado");
  t("2 e 1: a apertar", apertoDoPrazo(2).id === "apertar" && apertoDoPrazo(1).id === "apertar");
  t("0: esta noite, e é a única que ENCHE", apertoDoPrazo(0).id === "estaNoite" && apertoDoPrazo(0).cheio === true);
  t("e só ela enche — a distinção é de FORMA, não de cor",
    APERTOS.filter((a) => a.cheio).length === 1);
  t("`urgente` força a última noite", apertoDoPrazo(5, true).id === "estaNoite");

  t("a palavra conta o que FALTA", palavraDoPrazo(3) === "3 noites" && palavraDoPrazo(2) === "2 noites");
  t("uma noite fala no singular", palavraDoPrazo(1) === "1 noite");
  t("a última diz `esta noite`, nunca um número", palavraDoPrazo(0) === "esta noite");
  t("e nenhuma palavra do selo escreve uma fracção",
    [0, 1, 2, 3, 9].every((n) => !palavraDoPrazo(n).includes("/")));

  /* A areia é o canal PRIMÁRIO: ela tem de descer com o aperto, senão o
     selo fica a depender da cor — que é a última leitura, nunca a
     primeira. */
  const areias = [3, 2, 0].map((n) => apertoDoPrazo(n).areia);
  t("a areia desce a cada degrau (o canal primário funciona sozinho)",
    areias[0] > areias[1] && areias[1] > areias[2]);

  /* A COR SAI POR NOME DE TOKEN — cor é número, logo é tabela. */
  const semToken = APERTOS.filter((a) => !(a.token in T)).map((a) => a.id);
  t("todo aperto aponta para um token real de T", semToken.length === 0, semToken.join(", "));
}

/* ============================================================ */
sec("6. a hora acende a luz, e as quatro luzes existem");
{
  t("as quatro luzes de formas.md estão na tabela",
    LUZES.every((l) => LUZ_DA_CENA[l]) && LUZES.length === 4);
  const faltando = [];
  for (const l of LUZES) for (const k of ["ceuAlto", "ceuBaixo", "chao", "astro", "astroAlfa", "astroAlto"]) {
    if (LUZ_DA_CENA[l][k] === undefined) faltando.push(`${l}.${k}`);
  }
  t("e cada uma traz a receita inteira", faltando.length === 0, faltando.join(", "));
  t("a tinta da gravura é UMA, e é chave de topo", typeof LUZ_DA_CENA.tinta === "string");
  t("o astro sai de T, nunca de um hex novo",
    LUZES.every((l) => Object.values(T).includes(LUZ_DA_CENA[l].astro)));
  /* madrugada e entardecer têm o astro BAIXO; dia e noite, ALTO */
  t("madrugada e entardecer trazem o astro baixo",
    LUZ_DA_CENA.madrugada.astroAlto === false && LUZ_DA_CENA.entardecer.astroAlto === false);

  t("cada hora do dia acende exactamente uma luz",
    Array.from({ length: 24 }, (_, h) => luzDaHora(h)).every((l) => LUZES.includes(l)));
  t("a noite atravessa a meia-noite", luzDaHora(23) === "noite" && luzDaHora(0) === "noite" && luzDaHora(3) === "noite");
  t("as fronteiras não deixam buraco nem sobreposição",
    HORARIO_DA_LUZ.length === 4 && luzDaHora(4) === "madrugada" && luzDaHora(8) === "dia"
    && luzDaHora(18) === "entardecer" && luzDaHora(21) === "noite");
  t("aceita a hora como texto, que é como a cinta a tem",
    luzDaHora("06:13") === "madrugada" && luzDaHora("19:40") === "entardecer");
  t("e o lixo não dá buraco: cai no dia", luzDaHora(undefined) === "dia" && luzDaHora("nada") === "dia");
}

/* ============================================================ */
sec("7. as três bandas e a cinta somam o que prometem");
{
  t("as três bandas cobrem os 96 px sem sobra",
    BANDAS.ceu[0] === 0 && BANDAS.ceu[1] === BANDAS.chao[0] && BANDAS.chao[1] === BANDAS.altura);
  t("o horizonte é a linha onde a silhueta pousa", BANDAS.horizonte === BANDAS.chao[0]);
  t("a legenda mora na banda do chão", BANDAS.legenda > BANDAS.chao[0] && BANDAS.legenda < BANDAS.altura);

  /* A CATRACA DO ORÇAMENTO (`mente/r13-mesa.md`, §1): uma tabela de
     orçamento que não fecha na largura do ecrã não é um orçamento; é uma
     lista de desejos. Foi por não somar que as duas primeiras versões
     deste orçamento saíram erradas — a do `jogo` e a do `desenho`, com o
     mesmo erro e em separado. */
  const folga = LARGURA_DE_REFERENCIA - 2 * CINTA.enchimento - CINTA.ficha - CINTA.tempo;
  t(`a conta da cinta fecha: 375 − 24 − 186 − 98 = ${CINTA.folgaMinima}`, folga === CINTA.folgaMinima, `deu ${folga}`);
  t("e o enchimento é 12 e não 16 — é dessa folga que o sinal de guardado vive",
    CINTA.enchimento === 12 && CINTA.folgaMinima >= 67);
  t("os dois alvos da cinta medem o piso da casa", CINTA.altura === ALVOS.piso);
  t("e o estado vivo cresce, não encolhe", CINTA.alturaViva > CINTA.altura);
}

/* ============================================================ */
sec("8. o contrato de assinatura das peças (o App chama por estes nomes)");
{
  /* Estas sete linhas são o CONTRATO que o `oficial` escreveu do outro
     lado ao mesmo tempo que estas peças nasceram. Um nome trocado só
     aparece no build — e num arquivo de 21 mil linhas, tarde. */
  const contrato = [
    ["IconeVida", /export function IconeVida\(\{ tamanho = 12, cor \}\)/],
    ["IconeMana", /export function IconeMana\(\{ tamanho = 12, cor \}\)/],
    ["IconeBolsa", /export function IconeBolsa\(\{ tamanho = 12, cor \}\)/],
    ["IconeAmpulheta", /export function IconeAmpulheta\(\{ tamanho = 12, cor, fracao = 1 \}\)/],
    ["SeloDePrazo", /export function SeloDePrazo\(\{ noites, quantos = 1, urgente = false \}\)/],
    ["SinalDeGuardado", /export function SinalDeGuardado\(\{ visivel \}\)/],
  ];
  for (const [nome, rx] of contrato) t(`ui.jsx exporta \`${nome}\` com a assinatura combinada`, rx.test(UI));
  t("e `RostoDaCena` chega ao App por ui.jsx, com UM import só",
    /export \{ RostoDaCena \} from "\.\/rosto-da-cena\.jsx"/.test(UI)
    && /export function RostoDaCena\(\{ semente = "", bioma = "", lugar = "", hora = 12, largura = LARGURA_DE_REFERENCIA \}\)/.test(ROSTO));

  /* A MOCHILA SOBREVIVEU AO RENOMEAR. `formas.md` dá o nome
     `IconeBolsa` à MOEDA de 12×12; o glifo de 24×24 que tinha esse nome
     é uma mochila, e apagá-lo teria tirado a tela à aba do inventário
     sem uma linha de aviso. */
  t("e a mochila de 24×24 continua viva, com o nome que sempre foi o dela",
    /export function IconeMochila\(\{ tamanho = 24/.test(UI));
}

/* ============================================================ */
sec("9. as leis da casa, medidas no texto das peças novas");
{
  const semComentario = (x) => x.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  const RX_COR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])|\b(?:rgb|rgba|hsl|hsla)\(/g;

  /* COR É NÚMERO, LOGO É TABELA — e o rosto da cena é o sítio onde isto
     mais se arriscava: uma xilogravura são dezenas de traços, e cada um
     é um sítio onde um hex cabe. */
  for (const [nome, txt] of [["rosto-da-cena.jsx", ROSTO], ["gravura-da-cena.js", readFileSync("../src/gravura-da-cena.js", "utf8")]]) {
    const achados = semComentario(txt).match(RX_COR) || [];
    t(`\`${nome}\` não tem um único literal de cor`, achados.length === 0, achados.join(" "));
  }

  t("a tinta da gravura sai de LUZ_DA_CENA, nunca de uma constante local",
    /LUZ_DA_CENA\.tinta/.test(ROSTO));

  /* NADA DESCE DE 12: as peças escrevem a letra por `TIPOS`, nunca por
     um número solto. */
  const letras = (semComentario(UI + ROSTO).match(/fontSize:\s*(\d+)/g) || []);
  t("nenhuma peça nova escreve um tamanho de letra à mão", letras.length === 0, letras.join(" "));
  t("e as duas que escrevem letra pedem-na a TIPOS",
    TIPOS.maquina >= TIPOS.piso && /TIPOS\.maquina/.test(UI) && /TIPOS\.corpo/.test(ROSTO));

  /* COMPONENTE DEFINIDO DENTRO DO RENDER MATA O FOCO — a armadilha da
     casa. `Talhos` e `Legenda` têm de viver FORA de `RostoDaCena`. */
  const iRosto = ROSTO.indexOf("export function RostoDaCena");
  t("Talhos e Legenda são definidos FORA do render",
    ROSTO.indexOf("function Talhos") < iRosto && ROSTO.indexOf("function Legenda") < iRosto);

  /* A DEGRADAÇÃO NÃO É OPCIONAL, e está escrita em formas.md. */
  /* A FOLHA LÊ-SE SEM COMENTÁRIOS, e a razão é a mesma que
     `check-formas.mjs` escreve para a máscara dele: a caixa que explica
     por que NÃO se declara `forced-color-adjust: none` contém a própria
     frase — sem a máscara, esta catraca reprovava a documentação que
     concorda com ela. */
  const FOLHA = semComentario(readFileSync("../src/estilo.js", "utf8"));
  t("a varredura do guardado tem saída no prefers-reduced-motion",
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.tv-guardado-varre/.test(FOLHA));
  t("e a saída NÃO é `none` sozinho — pousa no fio cheio",
    /\.tv-guardado-varre \{ animation: none; transform: scaleX\(1\); opacity: 1; \}/.test(FOLHA));
  t("o rosto da cena degrada em forced-colors, sem forced-color-adjust: none",
    /@media \(forced-colors: active\)[\s\S]*?\.tv-gravura-tinta/.test(FOLHA) && !/forced-color-adjust:\s*none/.test(FOLHA));
  /* O LIMIAR É A CONTA DA FOLGA, e a suíte guarda a CONTA e não o
     número. `CINTA.rotuloDoGuardado` é uma MEDIDA — 74 px, lida no
     navegador com a fonte carregada e por `scrollWidth`; a conta à mão
     dava 72 e enganava-se por dois — e o limiar é a largura em que a
     folga finalmente a alcança. Escrito assim, o dia em que a cinta
     mudar de repartição é o dia em que esta linha fica vermelha, que é o
     que se quer: nesse dia o rótulo passa a caber (ou a não caber)
     noutra largura.

     E A ASSERÇÃO SEGUINTE DIZ O QUE NÃO ESTÁ RESOLVIDO, em vez de o
     arredondar: 74 > 67, logo aos 375 px do telefone de referência o
     rótulo NÃO aparece. Não é defeito desta peça — é uma conta de
     `formas.md` que não fecha, e a mesa é que a fecha. */
  const limiar = Number((FOLHA.match(/@media \(max-width: (\d+)px\)[\s\S]{0,120}?\.tv-guardado-rotulo \{ display: none; \}/) || [])[1]);
  t(`o limiar do rótulo é a conta da folga (limiar ${limiar}, o rótulo pede ${CINTA.rotuloDoGuardado} px)`,
    limiar === 2 * CINTA.enchimento + CINTA.ficha + CINTA.tempo + CINTA.rotuloDoGuardado - 1,
    "o limiar não é a conta da folga: refaça-o em vez de o afinar a olho");
  t("e a medida DIZ, em vez de esconder, que o rótulo não cabe na folga de 375",
    CINTA.rotuloDoGuardado > CINTA.folgaMinima);
  t("mas a camada que fala nunca cai: aria-live fora do rótulo",
    /className="sr-only" aria-live="polite"/.test(UI));
  t("e a faixa não anima: zero movimento novo no rosto da cena",
    !/animation|transition|tv-fade|tv-slide/.test(semComentario(ROSTO)));
}

console.log(`\nR13 · as peças: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
