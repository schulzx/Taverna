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
  APERTOS, apertoDoPrazo, palavraDoPrazo, CONTAS,
  GRAMATICAS, HACHURAS, BIOMAS_DA_GRAVURA, GRAMATICA_LISA, gramaticaDo,
  BANDAS, LUZES, HORARIO_DA_LUZ, luzDaHora,
  hachuraDoCeu, hachuraDoChao, gravuraDaCena, LARGURA_DE_REFERENCIA, TREMOR_MINIMO,
} from "../src/gravura-da-cena.js";
import { LUZ_DA_CENA, CINTA, T, TIPOS, ALVOS, ESBATIMENTO, FOLHA, SOLEIRA } from "../src/estilo.js";
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

  /* O DESVIO DO ÂNGULO, e é ESTE o dente que paga a dívida — os dois de
     cima não bastavam, e é por isso que ele nasce depois de eles terem
     ficado verdes com o defeito na tela.

     Medido na primeira construção: o céu variava **1,95° de desvio
     padrão** e o chão seco **2,73°** — oito e dez ângulos inteiros
     distintos em trezentos talhos. Os dentes do espaçamento diziam
     "irregular" e tinham razão, mas um traço que se desvia dois graus
     não treme: vai a direito com ruído de arredondamento, e a mancha
     lê-se como TRAMA. *Uma catraca que só pergunta «varia?» fica verde
     em cima do defeito que existe para apanhar; a que pergunta «varia
     QUANTO?» não fica.*

     O ângulo colhe-se do talho recto (`l dx dy`) e, onde não há talho
     recto nenhum, da CORDA da onda (`q … dx dy`) — sem a segunda metade
     a `molhada` media zero e passava por ser invisível ao regex. */
  const angulosDe = (linhas) => linhas.map((l) => {
    const recto = l.match(/l (-?[\d.]+) (-?[\d.]+)$/);
    if (recto) return Math.atan2(Number(recto[2]), Number(recto[1])) * 180 / Math.PI;
    const onda = l.match(/q [-\d.]+ [-\d.]+ (-?[\d.]+) (-?[\d.]+)$/);
    if (onda) return Math.atan2(Number(onda[2]), Number(onda[1])) * 180 / Math.PI;
    return null;
  }).filter((x) => x !== null);
  const desvio = (a) => { if (a.length < 2) return 0; const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((s2, y) => s2 + (y - m) ** 2, 0) / a.length); };

  const medido = { ceu: desvio(angulosDe(hachuraDoCeu(rng(hashSemente("buril")), 375))) };
  for (const h of HACHURAS) if (h !== "nenhuma") medido[h] = desvio(angulosDe(hachuraDoChao(rng(hashSemente("buril")), h, 375)));
  const fracos = Object.entries(TREMOR_MINIMO).filter(([k, piso]) => !(medido[k] >= piso));
  t(`o buril treme o que tem de tremer (${Object.entries(medido).map(([k, v]) => `${k} ${v.toFixed(1)}°`).join(" · ")})`,
    fracos.length === 0,
    fracos.map(([k, piso]) => `${k} desvia ${(medido[k] || 0).toFixed(2)}°, o piso é ${piso}° — voltou a ser trama.`).join("\n      "));

  /* E O PISO TEM DE ESTAR NA TABELA, não aqui: uma catraca que guarda um
     número que ela própria não vê não é uma catraca (a linha é do
     `desenho`, escrita para os pisos de contraste, e vale igual aqui).
     A tabela cobre exactamente as quatro hachuras que desenham mais o
     céu — uma hachura nova sem piso nasceria sem catraca, calada. */
  const devidos = [...HACHURAS.filter((h) => h !== "nenhuma"), "ceu"].sort();
  t("e cada hachura que desenha tem o seu piso na tabela",
    JSON.stringify(Object.keys(TREMOR_MINIMO).sort()) === JSON.stringify(devidos),
    "a tabela tem " + Object.keys(TREMOR_MINIMO).sort().join(", ") + " e devia ter " + devidos.join(", "));

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

  /* R15 — O EIXO `Conta` (Noites · Turnos). A janela de `A oferta` não é
     texto, é ESTE selo — e a petição do correio conta noites de
     calendário enquanto uma oferta de encontro conta turnos. A resposta
     do `desenho` foi um EIXO e não um gémeo: *uma ação, uma forma.* */
  t("a conta em turnos existe, e é tabela e não um `if`",
    !!CONTAS.noites && !!CONTAS.turnos && Object.keys(CONTAS).length === 2);
  t("em turnos a palavra conta o que falta, e o singular fala no singular",
    palavraDoPrazo(4, false, "turnos") === "4 turnos" && palavraDoPrazo(1, false, "turnos") === "1 turno");
  t("e a última unidade tem NOME e não número, nas duas contas",
    palavraDoPrazo(0, false, "turnos") === "este turno" && palavraDoPrazo(0, false, "noites") === "esta noite");
  t("`urgente` força a última em qualquer conta", palavraDoPrazo(9, true, "turnos") === "este turno");
  /* A DEGRADAÇÃO É ESCRITA: uma conta que não existe cai em noites, não
     em `undefined`. Uma contagem mal endereçada ainda é melhor dita na
     unidade que este jogo tem em todo lado do que apagada da tela. */
  t("uma conta desconhecida cai em noites, nunca em `undefined`",
    palavraDoPrazo(3, false, "semanas") === "3 noites" && palavraDoPrazo(3) === "3 noites");
  /* A AREIA É A MESMA GEOMETRIA NAS DUAS, e é ela o canal primário:
     `apertoDoPrazo` não sabe de contas nem precisa de saber. */
  t("a areia não muda com a conta — a geometria é a mesma nas duas",
    apertoDoPrazo(2).areia === apertoDoPrazo(2).areia && apertoDoPrazo(0).cheio === true);
  /* E O SELO NÃO GANHOU UM GÉMEO: há UM `SeloDePrazo` em `ui.jsx`, e a
     oferta instancia-o em vez de desenhar a sua própria contagem. */
  t("não nasceu um segundo selo: `A oferta` instancia o que já existe",
    (UI.match(/export function SeloDePrazo\b/g) || []).length === 1
    && /<SeloDePrazo\b/.test(UI));

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
  /* R15 — A RECEITA POR LUZ PERDEU O ASTRO E GANHOU O SEGUNDO BURIL.
     `astro`/`astroAlfa` subiram ao topo da tabela (quatro cópias do
     mesmo valor por modo é "a mesma cor escrita quatro vezes"), e o
     céu ganhou `talhoDoCeu`. O que continua por luz é `astroAlto`:
     *posição é luz, opacidade era afinação.* */
  const faltando = [];
  for (const l of LUZES) for (const k of ["ceuAlto", "ceuBaixo", "chao", "talho", "talhoDoCeu", "astroAlto"]) {
    if (LUZ_DA_CENA[l][k] === undefined) faltando.push(`${l}.${k}`);
  }
  t("e cada uma traz a receita inteira", faltando.length === 0, faltando.join(", "));
  t("a tinta da gravura é UMA, e é chave de topo", typeof LUZ_DA_CENA.tinta === "string");
  /* UMA verificação em vez de quatro, porque agora é um valor em vez de
     quatro. E o alfa do astro e o dos buris são números de topo pela
     mesma razão: quem os lê é a suíte, não só a tela. */
  t("o astro sai de T, nunca de um hex novo, e é UM no topo da tabela",
    Object.values(T).includes(LUZ_DA_CENA.astro) && LUZ_DA_CENA.astro === T.ink);
  t("o alfa do astro e o dos dois buris moram na tabela",
    LUZ_DA_CENA.astroAlfa > 0 && LUZ_DA_CENA.astroAlfa <= 1
    && LUZ_DA_CENA.alfaDoTalho > 0 && LUZ_DA_CENA.alfaDoTalho <= 1);
  t("nenhuma luz guarda uma cópia local do astro",
    LUZES.every((l) => LUZ_DA_CENA[l].astro === undefined && LUZ_DA_CENA[l].astroAlfa === undefined));
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
sec("6b. a gravura de linha branca — os sete pisos, medidos nas quatro luzes");
{
  /* POR QUE ESTA SECÇÃO EXISTE, e é a lição mais cara das duas entregas:
     a primeira versão desta peça pintava as quatro coisas com uma tinta
     só, e o talho media **1,08:1** contra o chão da noite — o buril não
     existia, e NENHUMA catraca o disse. Foi preciso um par de olhos no
     navegador. *Um contraste que ninguém mede é um contraste que ninguém
     tem.* O `desenho` pôs os pisos em `LUZ_DA_CENA.pisos` para a suíte
     os ler de volta; é esta secção que os lê.

     A CONTA É A COMPOSIÇÃO, não a cor nua: um talho a 0,85 de opacidade
     sobre o chão NÃO é o talho — é a mistura dos dois. Medir a cor crua
     dava um número mais bonito e falso. */
  const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16));
  const lum = (c) => { const v = c.map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4))); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const razao = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const sobre = (frente, alfa, atras) => rgb(frente).map((c, i) => alfa * c + (1 - alfa) * rgb(atras)[i]);
  const misturar = (a, b, k) => rgb(a).map((c, i) => c + (rgb(b)[i] - c) * k);
  const hex = (c) => "#" + c.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
  /* A TABELA PRIMEIRO, E COM MENSAGEM. Sem esta linha a secção morria com
     um `TypeError` em cima de `P.silhuetaNoCeu` — e um varredor que
     rebenta diz "está partido", não diz "a tabela que eu guardo
     desapareceu", que é outra coisa e tem outro conserto. Mesmo
     argumento de `pisoDeZona` em `check-formas`: catraca que mede o
     vazio é pior que catraca nenhuma, e ela tem de o SABER dizer. */
  const P = LUZ_DA_CENA.pisos || {};
  const SETE = ["silhuetaNoCeu", "talhoNoChao", "legendaInk", "legendaMundo", "chapaNoCeu", "texturaDoCeu", "astroNoCeu"];
  const semPiso = SETE.filter((k) => !(P[k] > 0));
  t("os sete pisos moram na tabela, não na suíte", semPiso.length === 0,
    semPiso.length === SETE.length
      ? "A TABELA `LUZ_DA_CENA.pisos` DESAPARECEU — sem ela esta secção mede o vazio e fica verde por não medir nada."
      : "sem piso: " + semPiso.join(", "));

  /* O CÉU É UM GRADIENTE, e por isso quem mede nele tem de dizer em que
     altura mediu. `ceuEm` é a mesma conta que o `<linearGradient>` do
     `.jsx` faz: interpola `ceuAlto`→`ceuBaixo` pela banda inteira. */
  const ceuEm = (z, y) => hex(misturar(z.ceuAlto, z.ceuBaixo, y / BANDAS.ceu[1]));
  const ALTURAS = [8, 16, 24, 32, 40, 48, 56, 60];

  const mal = [];
  const linha = [];
  for (const nome of LUZES) {
    const z = LUZ_DA_CENA[nome];
    /* a silhueta pousa no horizonte, logo mede-se contra o céu DE BAIXO */
    const m = {
      silhuetaNoCeu: razao(rgb(LUZ_DA_CENA.tinta), rgb(z.ceuBaixo)),
      talhoNoChao: razao(sobre(z.talho || LUZ_DA_CENA.tinta, LUZ_DA_CENA.alfaDoTalho, z.chao), rgb(z.chao)),
      legendaInk: razao(rgb(T.ink), rgb(z.chao)),
      legendaMundo: razao(rgb(T.mundo), rgb(z.chao)),
      chapaNoCeu: Math.min(razao(rgb(T.inkMeio), rgb(z.ceuAlto)), razao(rgb(T.inkMeio), rgb(z.chao))),
      /* R15 — A TEXTURA DO CÉU DEIXA DE SER DÍVIDA E ENTRA NO LAÇO, e é
         medida em TODO o gradiente e não só na metade de baixo: com o
         buril claro o pior ponto deixou de ser o topo (é o horizonte,
         onde o campo já é claro) e passou a 2,14 contra um piso de 1,5.
         A caixa de dívida que aqui estava — com `TOPO_DECLARADO` e o
         dente "no topo não piora do que hoje se mede" — SAIU pela regra
         anti-cemitério que ela própria escrevia: *no dia em que o
         `desenho` der ao céu um segundo talho, estes números sobem e
         esta caixa sai.* Deu. */
      texturaDoCeu: Math.min(...ALTURAS.map((y) => {
        const c = ceuEm(z, y);
        return razao(sobre(z.talhoDoCeu || LUZ_DA_CENA.tinta, LUZ_DA_CENA.alfaDoTalho, c), rgb(c));
      })),
      /* R15 — O PISO QUE A SUÍTE SE RECUSOU A INVENTAR, e agora pode,
         porque o `desenho` escreveu o número: é 3:1, o mesmo de
         `silhuetaNoCeu`/`talhoNoChao`/`chapaNoCeu`, porque **o astro é
         uma forma** — e não o 1,5 da textura, que uma textura pode
         dissolver-se em tom e um disco que se dissolve lê como borrão. */
      astroNoCeu: (() => {
        const y = z.astroAlto ? 16 : BANDAS.horizonte - 10;
        const c = ceuEm(z, y);
        return razao(sobre(LUZ_DA_CENA.astro, LUZ_DA_CENA.astroAlfa, c), rgb(c));
      })(),
    };
    for (const [k, v] of Object.entries(m)) if (v < P[k]) mal.push(`${nome}.${k} = ${v.toFixed(2)}, o piso é ${P[k]}`);
    linha.push(`${nome} ${m.silhuetaNoCeu.toFixed(1)}/${m.talhoNoChao.toFixed(1)}/${m.texturaDoCeu.toFixed(2)}/${m.astroNoCeu.toFixed(2)}`);
  }
  t(`os sete pisos fechados passam nas quatro luzes (silhueta/talho/textura/astro: ${linha.join(" · ")})`,
    mal.length === 0, mal.join("\n      "));

  /* ------------------------------------------------------------
     A TABELA RECALCULA-SE, E É POR ISSO QUE ELA É TABELA.

     `talhoDoCeu` não é um hex escolhido: é `ceuBaixo` — a cor do
     horizonte, o ponto mais claro do campo — erguido
     `erguerOTalhoDoCeu` em direcção ao branco, com um k só para as
     quatro. A suíte REFAZ a conta em vez de comparar hexes de cor:
     *uma tabela que se recalcula não pode ser afinada à mão sem que a
     catraca diga.* A caixa do hex ignora-se — `#D2CDD2` e `#d2cdd2`
     são a mesma cor com outro texto, e isso já custou uma linha nesta
     casa (`sombra(".55")`, em `estilo.js`).
     ------------------------------------------------------------ */
  const erguer = (h, k) => hex(rgb(h).map((c) => Math.round(c + (255 - c) * k)));
  const desafinadas = LUZES.filter((n) => {
    const z = LUZ_DA_CENA[n];
    return String(z.talhoDoCeu).toLowerCase() !== erguer(z.ceuBaixo, LUZ_DA_CENA.erguerOTalhoDoCeu);
  });
  t(`o talho do céu é o horizonte erguido ${Math.round(LUZ_DA_CENA.erguerOTalhoDoCeu * 100)} % ao branco, nas quatro`,
    desafinadas.length === 0 && LUZ_DA_CENA.erguerOTalhoDoCeu > 0,
    desafinadas.map((n) => `${n}: ${LUZ_DA_CENA[n].talhoDoCeu} ≠ ${erguer(LUZ_DA_CENA[n].ceuBaixo, LUZ_DA_CENA.erguerOTalhoDoCeu)}`).join(" · "));

  /* A SILHUETA É MASSA, NÃO MARCA — e é o dente que impede a lei nova de
     ser aplicada onde ela não vale: `tinta` continua uma, e a silhueta
     continua a ser pintada com ela nas quatro luzes. */
  t("a silhueta continua `tinta` — massa não é marca",
    /d=\{g\.d\.silhueta\}\s+fill=\{tinta\}/.test(ROSTO));
  t("e o céu deixou de ser talhado a `tinta`",
    /linhas=\{g\.d\.ceu\}[^/]*tinta=\{talhoCeu\}/.test(ROSTO)
    && !/linhas=\{g\.d\.ceu\}[^/]*tinta=\{tinta\}/.test(ROSTO));
  /* O ALFA DEIXOU DE ESTAR SOLTO NO `.jsx`: nenhum dos dois buris
     escreve o seu número à mão. */
  t("nenhum dos dois buris traz o alfa escrito à mão no .jsx",
    !/opacidade=\{0\.\d+\}/.test(ROSTO) && (ROSTO.match(/opacidade=\{alfa\}/g) || []).length === 2);
  /* R15 §5 — O TALHO PARA NA BORDA DO ASTRO. O segundo canal do astro é
     ser o único SÓLIDO num campo talhado; um recorte é o que o garante,
     e sem cor nenhuma (uma máscara pediria branco e preto literais, e
     `rosto-da-cena.jsx` não tem tecto de literais). */
  t("o talho do céu é recortado à volta do astro (o disco é sólido)",
    /clipPath[\s\S]{0,400}clipRule="evenodd"/.test(ROSTO) && /recorte=\{`url\(#\$\{id\}-semOAstro\)`\}/.test(ROSTO));

  /* ------------------------------------------------------------
     O QUE AQUI ESTAVA, E POR QUE SAIU (R15) — e a caixa saiu pela regra
     que ela própria escreveu no fim de si mesma.

     Ela media a textura do céu a `tinta` sobre o gradiente e declarava
     a dívida com a tabela inteira dos números, porque o piso de 1,5
     reprovava no topo das quatro luzes (noite 1,09). Guardava duas
     coisas: que a metade de BAIXO passava, e que o topo NÃO PIORAVA em
     relação ao medido — este segundo dente existia só porque o primeiro
     não podia ser cobrado em todo o lado.

     A saída não veio de afinar: veio de o `desenho` descobrir que a LEI
     estava errada (*"o céu é a fonte de luz" é verdade do horizonte,
     não do céu*) e dar ao céu o seu próprio buril, claro. Com ele o
     pior ponto das quatro passa de **1,09** para **2,14**, e a textura
     entra no laço dos pisos fechados lá em cima, medida em TODO o
     gradiente. `TOPO_DECLARADO` e o dente do topo foram com ela: *um
     dente que existe só porque o piso não passa é uma dívida com forma
     de catraca, e quando a dívida se paga ele não fica de lembrança.*

     O QUE FICA DESTA CAIXA, porque é o que não envelhece: o número que
     provou que a opacidade não era a saída — a 1,0, tinta chapada, a
     noite chegava a **1,18** no topo. O limite nunca foi a
     transparência; era a distância entre `tinta` e `ceuAlto`.

     E O ASTRO — que aqui era só um `console.log` de cortesia, porque a
     suíte se recusou (com razão) a inventar um piso que o `desenho` não
     tinha escrito — deixou de precisar dele: tem piso na tabela e
     asserção no laço, a três colunas acima.
     ------------------------------------------------------------ */
}

/* ============================================================ */
sec("6c. o esbatimento do topo (R15) — uma região declarada ilegível");
{
  /* POR QUE ESTA SECÇÃO NÃO MEDE PIXELS: um esbatimento **não é
     decoração, é uma região declarada ILEGÍVEL.** Uma máscara de alfa
     sobre texto não o adoça — apaga-o por graus. Logo a altura dele é o
     seu CUSTO, e o dente é uma DESIGUALDADE e não um número: no dia em
     que alguém subir a altura, a linha fica vermelha e diz porquê. */
  const bandaIlegivel = ESBATIMENTO.alfaAA * ESBATIMENTO.altura;
  const teto = ESBATIMENTO.entrelinhaDaProsa / 2;
  t(`nunca esconde uma linha inteira (${bandaIlegivel.toFixed(2)} < ${teto.toFixed(2)})`,
    bandaIlegivel < teto,
    `a banda ilegível é ${bandaIlegivel.toFixed(2)} px e metade da entrelinha é ${teto.toFixed(2)}`);
  /* A ENTRELINHA NÃO É UM NÚMERO SOLTO: é a régua da prosa que a tela
     já usa (`leading-relaxed` = 1,625). Se `TIPOS.prosa` mudar e esta
     linha não, o teto acima passa a guardar a prosa de ontem. */
  t(`a entrelinha da prosa é TIPOS.prosa × 1,625 (${(TIPOS.prosa * 1.625).toFixed(2)})`,
    Math.abs(ESBATIMENTO.entrelinhaDaProsa - TIPOS.prosa * 1.625) <= 0.05);
  /* E HÁ UM PISO POR BAIXO: abaixo de ~12 px um gradiente deixa de se
     ler como esbatimento e volta a ser uma borda, só que desfocada —
     que é o defeito original com mais um passo. */
  t("e não é tão baixo que volte a ser uma borda desfocada", ESBATIMENTO.altura >= 12);
  /* A RAMPA É ESCALONADA E NÃO LINEAR, pela mesma razão que a barra de
     PV é comprimento: a percepção de luminância não é linear, e uma
     rampa linear lê-se como um degrau no fim. */
  const r = ESBATIMENTO.rampa;
  t("a rampa vai de invisível a inteira, sem andar para trás",
    Array.isArray(r) && r.length >= 3 && r[0][0] === 0 && r[0][1] === 0
    && r[r.length - 1][0] === 1 && r[r.length - 1][1] === 1
    && r.every((p, i) => i === 0 || (p[0] > r[i - 1][0] && p[1] > r[i - 1][1])));
  t("e é escalonada, não linear (um batente foge da recta)",
    r.some(([f, a]) => Math.abs(a - f) > 0.05));

  /* A FOLHA — e o dente que importa é o ÚLTIMO: em `forced-colors` a
     máscara SAI INTEIRA, porque ali o sistema não tem como repor texto
     apagado por graus, e a cabeça já não é uma imagem, é um contorno. */
  t("a folha traz `.tv-esbate-topo`", FOLHA.includes(".tv-esbate-topo"));
  t("a altura da banda sai da tabela, não de um número escrito na folha",
    FOLHA.includes(`${ESBATIMENTO.altura}px`));
  t("e há um bloco `forced-colors` que a apaga",
    /@media \(forced-colors: active\) \{\s*\.tv-esbate-topo \{[^}]*mask-image: none/.test(FOLHA));
  /* NÃO SE CRIA ELEMENTO NENHUM: a máscara vai na PRÓPRIA região que
     rola. Uma camada por cima interceptaria cliques — e isso custaria o
     turno, que é a única coisa que esta casa nunca deixa custar. */
  t("é uma máscara e não uma camada — nada de `pointer-events` a remendar",
    !/\.tv-esbate-topo \{[^}]*pointer-events/.test(FOLHA));
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
  t(`a conta da cinta fecha: 375 − 24 − ${CINTA.ficha} − ${CINTA.tempo} = ${CINTA.folgaMinima}`,
    folga === CINTA.folgaMinima, `deu ${folga}`);

  /* ESTA ASSERÇÃO MUDOU EM 23/09, E O MOTIVO FICA ESCRITO porque a lei da
     casa o manda. Ela dizia `CINTA.folgaMinima >= 67` — e 67 era um número
     ORÇADO pelo `desenho` (ficha 186 + tempo 98), não medido. Com a cinta
     no ar a régua deu **ficha 194 e tempo 145**: o tempo estava 47 px
     optimista, porque o selo mede 76 e não 53 e o `+N` custa outros 20. A
     folga real a 375 px é **12**. Uma catraca que guarda uma estimativa
     como se fosse piso não guarda nada: bastava a medida chegar para ela
     ficar vermelha por ter razão.

     A INTENÇÃO SOBREVIVE INTEIRA — o enchimento tem de ser 12 e não 16 —
     mas a razão é agora MAIOR e mede-se no pior caso em vez do típico:
     com 16 a linha **não cabe** na última noite de um prazo, que é a noite
     em que ela mais importa. `tempoMaximo` é o selo cheio (`esta noite` em
     negrito, 105) e `fichaMinima` é a ficha com os trilhos no mínimo —
     porque quem cede é sempre a ficha: *o comprimento de um trilho é uma
     razão, não uma medida, e um trilho de 40 px diz o que um de 56 diz;
     `esta noite` não encolhe sem mentir.* */
  const comDoze = 2 * CINTA.enchimento + CINTA.fichaMinima + CINTA.tempoMaximo;
  const comDezasseis = 2 * 16 + CINTA.fichaMinima + CINTA.tempoMaximo;
  t(`o pior caso cabe: 24 + ${CINTA.fichaMinima} + ${CINTA.tempoMaximo} = ${comDoze} ≤ 375`,
    comDoze <= LARGURA_DE_REFERENCIA, `deu ${comDoze}`);
  t("e o enchimento é 12 e não 16 — com 16 a última noite transbordaria",
    CINTA.enchimento === 12 && comDezasseis > LARGURA_DE_REFERENCIA,
    `com 16 daria ${comDezasseis}`);
  t("quem cede é a ficha, nunca o prazo: o trilho tem mínimo",
    CINTA.trilhoMinimo < CINTA.trilho && CINTA.fichaMinima < CINTA.ficha);
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
    /* A ASSERÇÃO DO SELO MUDOU EM 23/09 (R15), E O MOTIVO FICA ESCRITO,
       que é a lei da casa: ela pedia `({ noites, quantos = 1, urgente =
       false })` e passou a aceitar o quarto campo `conta = "noites"`,
       que é o eixo `Conta` (Noites · Turnos) que `A oferta` precisa para
       a janela. O QUE ELA CONTINUA A GUARDAR É O QUE IMPORTAVA: os três
       primeiros parâmetros, NA MESMA ORDEM E COM OS MESMOS PADRÕES — as
       chamadas vivas da cinta não mudam uma letra, e `conta` tem de ter
       valor por omissão. Um campo novo sem padrão partiria o chamador
       silenciosamente, que é exactamente o que este contrato existe
       para apanhar. */
    ["SeloDePrazo", /export function SeloDePrazo\(\{ noites, quantos = 1, urgente = false, conta = "noites" \}\)/],
    ["SinalDeGuardado", /export function SinalDeGuardado\(\{ visivel \}\)/],
    /* R15 — AS DUAS PEÇAS NOVAS ENTRAM NO MESMO CONTRATO, e entram ANTES
       de o `App.jsx` as chamar, porque foi contra estas assinaturas que
       o `oficial` escreveu as chamadas dele no mesmo turno. `janela` é o
       QUARTO campo de `A oferta` e é OPCIONAL: sem ela a peça é a de
       ontem, byte a byte. */
    ["Oferta", /export function Oferta\(\{ verbo, preco, retorno, quem, onde, tom = "convite", estado = "repouso", chegada = "assentada", janela, aoClicar \}\)/],
    ["Dobra", /export function Dobra\(\{ quantos = 0, singular = "oferta", plural = "ofertas", estado = "dobrada", aoAlternar \}\)/],
  ];
  /* R15 — O TETO DE CAMPOS É LEI, E É VARRÍVEL. `SOLEIRA.camposDaOferta`
     é 4 — verbo · preço · retorno · janela — e **o quinto campo é
     defeito**: faz a oferta deixar de se ler de relance e passar a ser
     um formulário, que é o *point-and-click* que a medida dos 990 ms
     existe para apanhar. `quem`/`onde` NÃO contam: `formas.md` nunca os
     marcou como campo obrigatório, e eles cedem o lugar por `truncate`.
     O dente conta o que a peça ESCREVE na tela. */
  const campos = ["{verbo}", "{preco}", "{retorno}", "<SeloDePrazo"];
  const corpoDaOferta = UI.slice(UI.indexOf("export function Oferta"), UI.indexOf("export function Dobra"));
  t(`a oferta escreve os ${SOLEIRA.camposDaOferta} campos da tabela, e nem um a mais`,
    SOLEIRA.camposDaOferta === 4 && campos.every((c) => corpoDaOferta.includes(c)),
    "faltam: " + campos.filter((c) => !corpoDaOferta.includes(c)).join(", "));
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
