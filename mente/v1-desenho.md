# V1 · a folha da v3 — especificação de construção (`desenho` → `aprendiz`)

*24/09/2026. A decisão e o porquê estão em `mente/formas.md`, secção
**V · a tela da pessoa → V1**. Este arquivo é só o que se constrói, arquivo a
arquivo, e o que se prova. Nada aqui toca o `App.jsx` nem o save.*

**Figma (biblioteca `e5wJUzInAssoebx5npssKc`):** página `V1 · a folha da v3`
(`221:67`) — o par ANTES (`221:68`, R2 congelado em literal) / DEPOIS (`221:122`,
ligado às variáveis), a tabela (`222:67`) e a faixa dos daltonismos (`222:249`).
A colecção `Paleta semantica (T)` já tem os valores de V1 e a variável nova
`rosa` (`VariableID:220:134`, code syntax `T.rosa`). **O código é o espelho:
se um hex abaixo divergir do Figma, o Figma ganha e o desenho erra — pare e
pergunte.**

**Tudo isto já foi aplicado numa cópia da árvore (scratchpad) e medido:**
`npm run build` limpo; **212/212 suítes verdes** (211 de hoje + a nova);
**14/15 varredores** — o único vermelho é `check-acoes-do-jogador.mjs`, que já
estava vermelho ANTES da V1 na mesma cópia (é o `App.jsx` do `orquestrador` a
meio da etapa dele: endereços de recusa a mudar de linha). Prove com
`bash mente/so-o-meu.sh <os seus arquivos>` antes de julgar esse vermelho.

---

## 1 · `src/estilo.js` — os valores de `T`

Troque **só o valor**, mantendo o nome (há ~1 600 leitores de `T` e nenhum muda).
A coluna "comentário" é o que vai no `/* … */` da linha, curto.

| token | hoje (R2) | **V1** | comentário da linha |
|---|---|---|---|
| `bg` | `#131120` | **`#12101F`** | a mesa da v3 (L 0,60 = a régua do Material) |
| `panel` | `#1B182C` | **`#1A162B`** | a cinta, o trilho, o compositor |
| `panelSoft` | `#252038` | **`#241F3C`** | o erguido: pílula, aba ativa |
| `line` | `#3D3559` | **`#352F54`** | divisória — decorativa (1,51 contra a mesa) |
| `lineStrong` | `#7A719A` | `#7A719A` (fica) | a borda de CONTROLO |
| `pagina` | `#3A2F23` | **`#0F0C18`** | o POÇO da história — a página castanha morreu |
| `paginaAlta` | `#48392B` | **`#241F3C`** | = `panelSoft`, de propósito (a suíte prende) |
| `paginaFio` | `#7A6349` | **`#695DA4`** | o fio que carrega 1.4.11 dos chips (3,31/3,41) |
| `ink` | `#F2ECE0` | **`#EAE4D6`** | a prosa — o da v3 (13,59–14,15 no corpo) |
| `inkMeio` | `#C3B7A3` | `#C3B7A3` (fica) | a segunda voz |
| `inkDim` | `#A29AB4` | **`#9B93AC`** | o rótulo da máquina — o da v3 |
| `amber` | `#E8A33D` | **`#FFB03A`** | a luz e o herói |
| `amberSoft` | `#F5C878` | **`#FFD08A`** | o âmbar que se lê em letra |
| `onAccent` | `#1A1408` | `#1A1408` (fica) | 10,04 sobre o âmbar novo |
| `violet` | `#9B8DE4` | **`#AC79E9`** | a magia — o `#9B5DE5` da v3 ERGUIDO no mesmo matiz |
| `violetSoft` | `#B0A5EC` | **`#C29DEF`** | a magia em letra (7,00 sobre o erguido) |
| `onSecond` | `#14101F` | `#14101F` (fica) | 5,93 sobre o violeta novo |
| `mundo` | `#79D6C6` | **`#00BBF9`** | o mundo — o ciano da v3 |
| `mundoSoft` | `#A8E7DC` | **`#71DCFF`** | a voz do mundo |
| `onMundo` | `#04140F` | **`#03131C`** | tinta sobre o ciano (8,51) |
| `rosa` | — | **`#F15BB5`** (NOVO, logo antes de `ok`) | a tua mão: o escolhido — marca, nunca chão de letra |
| `danger` | `#EE7C6A` | **`#FF6B6B`** | o da v3 |
| `ok` | `#8FE0A2` | `#8FE0A2` (fica) | |
| `okFundo` / `perigoFundo` | — | ficam | |

**A nota grande acima de `T` (linhas ~33–110, "R2 · A PÁGINA ILUMINADA")** não
se apaga — é história e é citada. Acrescente **por cima dela** um bloco
`V1 · A FOLHA DA v3 (24/09/2026)` com, no máximo, estes seis parágrafos (o
texto completo está em `formas.md` §V1; copie as frases de lá, não invente):
1. a direção é a tela da pessoa (Figma `ffWFqD7TueSb88Mkeg9bhW`, `126:5`);
2. **a página castanha morre** e porquê (os 33 %, rosa 4,29 e violeta 4,14);
3. a prosa: 13,59–14,15 no corpo contra a régua do Material 14,22;
4. o violeta da v3 erguido (3,81 → 5,93/4,99);
5. o `paginaFio` que fica forte até V2 e porquê;
6. os três pares que colam nos daltonismos e a defesa.
E no fim da nota R2, uma linha: `(Os valores desta nota são os de R2; os de
hoje estão na nota V1 acima.)`

## 2 · `src/estilo.js` — o ambiente (tabela nova + o helper que faltava)

Logo **depois** de `export const ESBATIMENTO = {…};` e **antes** de
`const RAMPA_DO_ESBATIMENTO`:

```js
export const AMBIENTE = {
  direcao: "to right",
  paradas: [
    { token: "amber", alfa: 0.063, em: 0 },
    { token: "mundo", alfa: 0.09,  em: 0.55 },
    { token: "rosa",  alfa: 0.072, em: 1 },
  ],
  pisos: { prosa: 7, corpoContraMesa: 2.3 },
};
```

- As paradas apontam para `T` **por nome** (como `APERTOS` em
  `gravura-da-cena.js`): a luz ambiente segue a paleta sozinha e não há hex novo.
- Os alfas são os do Figma: paradas `.07/.10/.08` × opacidade `.90` do nó
  `ambient-gradient-overlay` = `.063/.090/.072`.
- `pisos.prosa` = 7 (AAA, o piso da legenda em `LUZ_DA_CENA`); `corpoContraMesa`
  = 2,3 ΔE76 (Sharma, *Digital Color Imaging Handbook*: o limiar de diferença
  perceptível) — é o que substitui o par de R2 "página × mesa ≥ 1,5".

O helper `alfa(cor, a)` — o que `MATERIAIS` promete "de outro ciclo" desde
D5. **Privado** (sem `export`), ao lado de `sombra`/`brilho` ou logo depois de
`AMBIENTE`, e **escrito com interpolação** para não contar como literal no
`check-formas` (medido: D5a não se mexe):

```js
const alfa = (cor, a) => {
  const n = parseInt(cor.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const LUZ_AMBIENTE = `linear-gradient(${AMBIENTE.direcao}, ${AMBIENTE.paradas
  .map((p) => `${alfa(T[p.token], p.alfa)} ${Math.round(p.em * 100)}%`).join(", ")})`;
```

(Aqui, no `.js`, a crase é do próprio código. **Dentro de `SUPERFICIES_CSS`
nenhum comentário pode ter crase** — é a armadilha de 24/09 no `CLAUDE.md`.)

Na folha, a regra `.tv-esbate-topo` (≈ linha 1654) ganha **uma** linha, a primeira:

```css
.tv-esbate-topo {
  background-image: ${LUZ_AMBIENTE};
  -webkit-mask-image: …   (fica)
  mask-image: …           (fica)
}
```

**Porquê nesta classe e não numa nova:** `.tv-esbate-topo` tem um leitor só
(`App.jsx:23112`) e é exactamente *o corpo da história* — a região que rola por
baixo da gravura, que é onde a v3 põe o gradiente (`parchment-body`). Uma classe
nova precisaria do `App.jsx`. O `background-attachment` por omissão (`scroll`)
fixa o gradiente à caixa, não ao texto: ele não rola com a prosa. A máscara do
esbatimento esbate-o também nos 24 px de cima — é o que a v3 faz (o corpo
começa abaixo da cabeça). Em `forced-colors` a máscara sai e o gradiente é
ignorado pelo navegador (fundos-imagem não se pintam em alto contraste).
**Nada se move**: `prefers-reduced-motion` não tem trabalho.

Escreva por cima da regra um comentário **sem crase** a dizer isto em três linhas.

## 3 · `src/estilo.js` — os números que envelheceram

| onde | hoje | V1 | porquê |
|---|---|---|---|
| `ESBATIMENTO.alfaAA` | `0.54` | **`0.52`** | `T.ink` composto a alfa `a` sobre o pior ponto do corpo (poço + ambiente a 55 %) cai a 4,5:1 em **0,520** (poço nu: 0,505). A banda ilegível passa a 12,48 px < 13,8 ✓ |
| o comentário da linha de `alfaAA` e o bloco "1. **0,54**" (≈ l.762) | "T.ink sobre T.pagina cai de 11,08:1…" | "T.ink sobre o pior ponto do corpo (13,59:1) cai a 4,5:1 em a = 0,52" | |
| nota de `LUZ_DA_CENA` (≈ l.219–220) | "`ink` × chão de dia, **10,60:1** … `T.mundo` … nunca desce de **7,27:1**" | **11,12:1** e **6,36:1** (o dia é o pior nos dois) | o ink desceu, o ciano é mais escuro que o teal |
| `VEU` (≈ l.967) | "3,06:1" | **3,30:1** | a cena lida por trás do véu leve |
| `SUPERFICIES_CSS` (≈ l.1332, a nota da `.tv-coluna`) | "14,37:1 para 11,08:1" | acrescente: "(V1: no poço, 13,59–14,15:1 — o peso 300 continua a ser a defesa contra a irradiação)" | **sem crase** |

## 4 · `index.html` — o primeiro pixel

`<body style="margin:0;background:#0E0C15">` → **`#12101F`**. O `#0E0C15` é o
`bg` de ANTES de R2: o primeiro pixel está duas paletas atrás. Passa a ser uma
cópia de `T.bg` (D5b) — o `check-formas` pede a entrada (ver §6).

## 5 · Fora do `App.jsx`, os leitores que a paleta nova obriga

1. **`src/painel-habilidades.jsx:149`** — `color: prep.length >= teto ? T.violet : T.inkDim`
   → **`T.violetSoft`**. É o único `T.violet` como letra fora do `App.jsx`.
   (Com o `#AC79E9` o violeta já passa em letra, 4,99; o `violetSoft` dá 7,00 e
   é o token cujo trabalho é este.)
2. **`src/rosto.jsx:212–213`** — os dois brilhos das lentes do Engenheiro,
   `fill="#EAE4D6"`, são **o próprio `T.ink` de novo** (o comentário de
   `check-formas` já o dizia desde D5). Passe a `fill={T.ink}` e acrescente
   `import { T } from "./estilo.js";` (a folha não importa nada: não há ciclo).
   Sem isto o `check-formas` fica vermelho (rosto.jsx ganha 2 cópias de `T`).
3. **`src/ui.jsx:1242–1248`** — o parágrafo `CONTRASTE, MEDIDO` passa a:
   `T.inkDim` sobre `T.panel` = **6,00:1** (**5,36** sobre `panelSoft`) ·
   `T.amber` = **9,65** (**8,62**) · `T.danger` **6,34** (**5,66**) ·
   `T.mundo` **7,94** (**7,09**) · `T.inkMeio` **8,90** (**7,95**). "A pior é
   `T.inkDim`/`panelSoft`, com **19 %** de folga." (Deixou de ser o `danger`.)
4. **`src/ui.jsx:1550`** — "6,37:1" → **"6,34:1"** (o selo cheio, `danger`
   sobre a cinta). **Não é piso**: o piso de uma forma é 3:1 (1.4.11); 6,37 era a
   medida de R2. Ver §8 para o `jogo`.
5. **`src/grade-de-batalha.jsx:133`** — confira de que par são os "6,62:1 /
   6,37:1" (a legenda sobre `bg`/`panel`?) e ponha o número de V1; se for
   `inkDim`: **6,40** sobre `bg`. Se não conseguir identificar o par, **pare e
   pergunte** — não escreva um número que não mediu.

## 6 · `testes/check-formas.mjs` — as catracas que a troca de valores move

Medido na cópia, com tudo acima aplicado. **Nenhuma cor nova nasceu fora de
tabela** — o que muda é que literais velhos deixaram de ser byte a byte iguais a
`T` (desce) e três passaram a sê-lo (sobe). A regra anti-cemitério obriga a
igualdade exacta, e cada linha leva data e motivo:

| tabela | entrada | hoje | V1 | motivo a escrever na entrada |
|---|---|---|---|---|
| `TETO_DE_LITERAIS` (D5a) | `"src/rosto.jsx"` | 12 | **10** | 24/09 · V1: os dois brilhos das lentes eram `T.ink` escrito à mão |
| `TETO_DE_COR_DE_T` (D5b) | `"src/App.jsx"` | 17 | **3** | 24/09 · V1: a paleta trocou de valores; 14 cópias de R2 deixaram de ser byte a byte `T` — **a dívida não sumiu, ficou invisível a este dente** (a mesma frase da entrada de R2) |
| | `"src/estilo.js"` | 5 | **1** | idem |
| | `"src/carta-taro.jsx"` | 5 | **1** | idem (o `#EAE4D6` dos `FORROS` volta a ser `T.ink`) |
| | `"src/ui.jsx"` | 1 | **sai a linha** | teto 0 = ENTRADA MORTA; ponha-a na lista "SAÍRAM" com o motivo |
| | `"index.html"` | — | **1** (nova) | 24/09 · V1: o primeiro pixel passou a ser `T.bg` de verdade; o `index.html` é servido antes do bundle e não pode importar `T` (o perdão eterno de D5a, agora com a cor certa) |

A de `rosto.jsx` em D5b **não nasce**: o §5.2 converte os dois literais.

## 7 · `testes/teste-v1-folha.mjs` — a suíte nova (a catraca de R2 refeita)

Lê `T`, `AMBIENTE`, `ESBATIMENTO`, `FOLHA` de `../src/estilo.js` e prova
(as asserções foram corridas na cópia, 8/8):

1. **Os 37 pares** — os 32 de R2 (os mesmos papéis, com os nomes de `T`: onde
   R2 dizia `chao`/`chaoAlto`/`borda`/`bordaViva` é `panel`/`panelSoft`/`line`/
   `lineStrong`) **menos** "a página × a mesa ≥ 1,5" (ver 4) e menos o
   duplicado (`inkDim`×`panel` aparecia duas vezes, como "rótulo do HUD" e como
   "placeholder"), **mais** sete:
   `paginaFio`×`pagina` ≥ 3 · `rosa`×`bg` ≥ 3 · `rosa`×`panelSoft` ≥ 3 ·
   `violet`×`panelSoft` ≥ 4,5 (a razão de o violeta ter subido) ·
   `danger`/`amberSoft`/`inkMeio` × `paginaAlta` ≥ 4,5 (os chips da página).
   Pisos: 4,5 para letra, 3 para borda/marca.
2. **A prosa no pior ponto do ambiente ≥ `AMBIENTE.pisos.prosa`** — varra o
   corpo de 0 a 100 % em passos de 1 %, compondo as paradas em sRGB
   **pré-multiplicado** (é como o CSS interpola) sobre `T.pagina`. Hoje 13,59.
3. `inkMeio` e `inkDim` no pior ponto ≥ 4,5 (8,72 / 5,88).
4. **O corpo distingue-se da mesa em todo ponto** — ΔE76(corpo(x), `T.bg`) ≥
   `AMBIENTE.pisos.corpoContraMesa` (hoje 3,60). **Motivo a escrever no
   comentário, porque é uma asserção de R2 que muda:** *R2 separava a página da
   mesa por LUZ (1,43:1) porque a página era a figura. Na v3 a figura é a prosa
   — o poço é mais escuro que a mesa, e o que o separa é o matiz do ambiente e o
   contorno. O piso passa de razão de luz a diferença perceptível (ΔE).*
5. Toda parada de `AMBIENTE` aponta para um token que existe em `T`.
6. `T.paginaAlta === T.panelSoft` **e** `T.paginaFio !== T.line` (a segunda
   cai em V2, quando o contorno for separado do controlo — escreva-o).
7. **`ESBATIMENTO.alfaAA` é a conta de hoje** (±0,01): o alfa em que `T.ink`
   sobre o pior ponto do corpo cai a 4,5. *Uma tabela que se recalcula não se
   afina à mão* — é o que faltava em R15, e foi por isso que os 0,54 envelheceram
   em silêncio.
8. A folha contém `.tv-esbate-topo {` seguido de `background-image:
   linear-gradient(to right, rgba(255,176,58,0.063) 0%` — a luz chega à tela.

O esqueleto pronto (medido, 8/8) está em
`C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\caixa\testes\teste-v1-folha.mjs`
— use-o como ponto de partida e escreva os comentários (o porquê de cada piso).

**`teste-ligacao`:** `AMBIENTE` tem leitores no próprio arquivo e na suíte —
passa (medido).

## 8 · O que NÃO muda e ninguém deve "consertar"

- **`teste-r13-pecas`** continua verde sem mexer: `legendaMundo` com o ciano dá
  **6,36** no pior (dia) contra o piso 4,5; `legendaInk` **11,12** contra 7; o
  astro (`T.ink` a 0,85) passa nas quatro. Não mexa nos pisos de `LUZ_DA_CENA`.
- **`teste-r3-campo-do-turno`** prende `background: T.pagina, border: 1px solid
  ${T.paginaFio}` no `App.jsx` — continua verdadeiro (só os valores mudaram).
- `MATERIAIS` (a cortiça, o cartaz, os percevejos) **não muda**: nenhuma entrada
  passou a repetir uma cor de `T` (medido).
- `TIPOS`, `ALVOS`, `CAMPO_DO_TURNO`, `CINTA`, `FONT_CSS`: **nada**. A letra é
  V2 (o `jogo` pediu-o, com razão: se a paleta e a letra mudam juntas, a prova
  não sabe a qual culpar).

## 9 · A conferência no navegador (é minha, depois de construído)

Aba **nova** (HMR mente), save de teste num espaço salvo e restaurado. Eu
confiro: o corpo da história tem a luz (âmbar à esquerda, ciano ao centro, rosa
à direita, e não rola com a prosa); os 24 px de cima esbatem; o contorno do
cartão é violeta-cinza; a cinta mostra o lugar e a hora em ciano; o dado é o
âmbar da v3; `forced-colors` e `reduced-motion` sem surpresa. O `jogo` corre o
protocolo §9 do `v1-jogo.md`.

## 10 · O que fica para o `App.jsx` (V2, com o `oficial` e o bastão)

1. **O contorno separa-se do controlo:** `App.jsx:23061` (o cartão) e
   `painel-alforje.jsx:75` passam a `T.line` (o fio subtil da v3, 1,51 —
   decorativo, isento de 1.4.11: não é componente nem informação); os chips da
   página (`App.jsx:3840/3849/3865`) e o botão flutuante (`:23580`) passam a
   `T.lineStrong` (4,29 sobre o poço). Aí `paginaFio` fica sem trabalho e
   **aposenta-se**, e a asserção 6 da suíte muda com motivo.
   *(O `painel-alforje.jsx:75` pode ir já na V1 se o `aprendiz` quiser — mas
   sozinho cria duas caras para o mesmo contorno; prefiro que vá com o do
   `App.jsx`.)*
2. **A aba ativa do trilho:** moldura **e** ícone em `T.rosa` (a v3 pinta a
   moldura de violeta; violeta é a magia — ver `formas.md` §V1).
3. O comentário de `App.jsx` ≈ l.23066–23075 ("a narração é a única coisa
   QUENTE da tela (h≈30)… 1,43:1 de luz, 143° de matiz") fica falso com V1 —
   reescreve-o quem tiver o bastão.
4. As 30 cores literais do `App.jsx` (incl. `RARIDADE_COR`, que agora tem o
   `inkDim` exacto na raridade `comum`) — dívida D5b, não desta etapa.
