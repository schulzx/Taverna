/* ============================================================
   A HORA E O PRAZO — duas contas pequenas que a tela lê (V5a)

   Este arquivo se chamava `gravura-da-cena.js` e era a CONTA da
   xilogravura de 96 px do topo do papel (R13-B): gramáticas de silhueta,
   hachuras de buril, as três bandas, a semente de cada cripta. Em V5a
   (25/09/2026) a pessoa tirou a gravura da tela — *"deixar exatamente
   igual à imagem do Figma"* — e o topo do papel passou a ser o
   `CabecalhoDaPagina` (`ui.jsx`), o nó `129:4` da v3.

   O QUE MORREU COM ELA, e porquê cada coisa: o motor inteiro da gravura
   (`gravuraDaCena`, `BANDAS`, `BIOMAS_DA_GRAVURA`, as hachuras, o tremor,
   `LARGURA_DE_REFERENCIA`) só tinha um leitor, `rosto-da-cena.jsx`, que
   saiu inteiro. Uma conta sem desenho que a pinte é export morto fingindo
   que vive — a lei de `teste-ligacao`. O histórico está em
   `mente/formas.md` (R13, R15, V5a) e no `git`.

   O QUE FICOU, porque tem leitor e não era gravura:
   - A AMPULHETA, O APERTO E AS CONTAS — a geometria e a palavra de
     `O selo de prazo` (`ui.jsx`), que a cinta e `A oferta` desenham.
     Moravam aqui por vizinhança de etapa (nasceram em R13 com a gravura),
     não por parentesco.
   - A LUZ DA HORA — os NOMES das quatro luzes e a fronteira de cada uma.
     `O TEMPO` desenha o céu com eles (V3c) e a etiqueta da direita do
     cabeçalho da página escreve-os (V5a). As quatro receitas de COR
     (`LUZ_DA_CENA`, em `estilo.js`) eram só da gravura e saíram com ela.

   Conta se prova, tela se olha: nada aqui pinta, e tudo se prova em Node
   (`teste-r13-pecas.mjs`, `teste-v3-glifos.mjs`, `teste-v5a-cabecalho.mjs`).
   ============================================================ */

/* ------------------------------------------------------------
   A AMPULHETA — a areia é uma função, não um desenho.

   `formas.md` (R13, os quatro glifos): a areia desenha a fração que
   FALTA, e é o canal PRIMÁRIO do selo de prazo — geometria pura,
   sobrevive aos três daltonismos, ao cinzento e ao tamanho.

   O PISO DE 0,08 NÃO É ARREDONDAMENTO: existe para que "esta noite"
   ainda TENHA areia. Um triângulo de altura zero lê-se como um erro de
   desenho, não como urgência.
   ------------------------------------------------------------ */
export const AMPULHETA = {
  alturaMax: 5,     /* a altura da areia com o prazo cheio, no quadro 12×12 */
  piso: 0.08,       /* a fração mínima — ver acima */
  meiaBase: 0.68,   /* a meia-base do triângulo, em múltiplos da altura */
  base: 11,         /* o y do fundo do bulbo */
  eixo: 6,          /* o x do eixo do glifo */
};

/* Devolve o `d` do triângulo de areia para uma fração 0..1.
   `h = 5 × max(0,08, min(1, fracao))`, meia-base `0,68 × h`, e o
   triângulo é `M 6 11 L (6−meia) 11 L 6 (11−h) L (6+meia) 11 Z`. */
export function areiaDaAmpulheta(fracao) {
  const f = Math.max(AMPULHETA.piso, Math.min(1, Number.isFinite(fracao) ? fracao : 1));
  const h = AMPULHETA.alturaMax * f;
  const meia = AMPULHETA.meiaBase * h;
  const x = AMPULHETA.eixo, y = AMPULHETA.base;
  return `M ${x} ${y} L ${r2(x - meia)} ${y} L ${x} ${r2(y - h)} L ${r2(x + meia)} ${y} Z`;
}

/* ------------------------------------------------------------
   O SELO DE PRAZO — a forma que cada aperto toma.

   Tabela e não `if` pela mesma razão do `selo-de-estado.js`: os quatro
   canais (areia · palavra · forma · cor) têm de andar JUNTOS, e três
   ramos de código divergem no primeiro ajuste. A cor sai por NOME de
   token, nunca por valor — quem pinta é a tela.
   ------------------------------------------------------------ */
export const APERTOS = [
  { id: "folgado",   minimo: 3, areia: 0.85, cheio: false, token: "mundo"    },
  { id: "apertar",   minimo: 1, areia: 0.33, cheio: false, token: "amber"    },
  { id: "estaNoite", minimo: 0, areia: 0.08, cheio: true,  token: "onAccent" },
];

/* Quantas noites faltam → o aperto. `urgente` força a última noite: é a
   porta para quando o motor sabe que o prazo cai agora e a contagem de
   calendário ainda não o diz (ver `mente/pedidos-ao-sistema.md`). */
export function apertoDoPrazo(noites, urgente = false) {
  const n = Number.isFinite(noites) ? Math.max(0, Math.floor(noites)) : 0;
  if (urgente) return APERTOS[2];
  return APERTOS.find((a) => n >= a.minimo) || APERTOS[2];
}

/* ------------------------------------------------------------
   O EIXO `Conta` (R15) — a mesma ampulheta conta duas grandezas.

   `formas.md` (R15 §4): a janela de uma oferta **não é texto, é `O selo
   de prazo`** — *uma ação, uma forma.* Mas a petição do correio conta
   NOITES de calendário e uma oferta de encontro conta TURNOS, e a peça
   não ganha um gémeo por causa disso: ganha um EIXO. **A areia da
   ampulheta é a mesma geometria nos dois**, e é ela o canal primário.

   É TABELA E NÃO UM `if` pela razão de sempre nesta casa, e aqui ela
   morde duas vezes: são PALAVRAS de tela, e a regra que as rege — *conta
   ao contrário, nunca `1/4`, e a última unidade tem nome e não número* —
   tem de valer igual nas duas contas ou o jogador aprende duas
   gramáticas para um selo só.
   ------------------------------------------------------------ */
export const CONTAS = {
  noites: { um: "1 noite", muitos: "noites", ultima: "esta noite" },
  turnos: { um: "1 turno", muitos: "turnos", ultima: "este turno" },
};

/* A palavra e o número. `esta noite` na última — NUNCA `1/4`: o nome do
   contrato e a fração eram o que ocupava a linha na fita antiga, e são
   a parte que o jogador já sabe.

   `conta` cai em `noites` quando vier lixo, e a degradação é de
   propósito: uma contagem que não se sabe de quê ainda é melhor dita em
   noites — a unidade que este jogo tem em todo lado — do que apagada. */
export function palavraDoPrazo(noites, urgente = false, conta = "noites") {
  const n = Number.isFinite(noites) ? Math.max(0, Math.floor(noites)) : 0;
  const c = CONTAS[conta] || CONTAS.noites;
  if (urgente || n === 0) return c.ultima;
  return n === 1 ? c.um : `${n} ${c.muitos}`;
}

/* ------------------------------------------------------------
   A LUZ DA HORA — qual das quatro luzes a hora acende.

   Nasceu para a gravura (*a hora não muda o desenho: muda a luz*) e
   sobreviveu a ela, porque é PALAVRA e não cor: `O TEMPO` desenha o céu da
   hora com estes nomes (V3c) e o cabeçalho da página escreve-os à direita
   (V5a) — a mesma conta nos dois, logo nunca discordam. As fronteiras são
   tabela pela razão de sempre: uma hora que caísse em dois `if` teria
   duas luzes conforme a ordem dos ramos.

   ⌁ AS FRONTEIRAS SÃO DE R13: `formas.md` nomeia as quatro luzes e não
   diz onde uma acaba e a outra começa. Estão escritas aqui para poderem
   ser recusadas numa linha. */
export const LUZES = ["madrugada", "dia", "entardecer", "noite"];
export const HORARIO_DA_LUZ = [
  { luz: "madrugada",  de: 4,  ate: 8  },
  { luz: "dia",        de: 8,  ate: 18 },
  { luz: "entardecer", de: 18, ate: 21 },
  { luz: "noite",      de: 21, ate: 4  },  /* atravessa a meia-noite */
];

/* Aceita número (0–23), "HH:MM", ou o próprio nome da luz — a cinta tem
   a hora como texto e o motor tem-na como número, e uma peça que só
   soubesse um dos dois obrigaria quem a chama a converter. */
export function luzDaHora(hora) {
  if (typeof hora === "string") {
    const nome = hora.trim().toLowerCase();
    if (LUZES.includes(nome)) return nome;
    const m = nome.match(/(\d{1,2})\s*[:h]/);
    if (m) return luzDaHora(Number(m[1]));
    const n = Number(nome);
    if (Number.isFinite(n)) return luzDaHora(n);
    return "dia";
  }
  if (!Number.isFinite(hora)) return "dia";
  const h = ((Math.floor(hora) % 24) + 24) % 24;
  for (const f of HORARIO_DA_LUZ) {
    if (f.de < f.ate ? h >= f.de && h < f.ate : h >= f.de || h < f.ate) return f.luz;
  }
  return "dia";
}

/* O arredondamento a duas casas da geometria da areia. */
const r2 = (n) => Math.round(n * 100) / 100;
