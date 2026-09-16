# K4 · a peça torta, e a forma do cansaço

*O escrito do `desenho` para a última etapa da Fase K (16/09/2026). O número da
batida é do `jogo`, em `mente/k4-jogo.md`; esta folha é a metade de forma.*

---

## 0 · O resumo, para quem só lê o primeiro ecrã

1. **A pílula da ficha não mede 27 por engano de padding. Mede 27 porque
   ninguém escreveu altura nenhuma.** `27,5 = 9 × 1,5 + 12 + 2` — texto,
   entrelinha herdada, `py-1.5` e a borda. **O número 47 não existe em lado
   nenhum do repositório.** Foi por isso que 102 asserções passaram: não há o
   que uma suíte pudesse ler.
2. **A altura é o sintoma. O defeito é que `A escolha` *Forma=Pílula* não existe
   em código** — a fila monta o controlo à mão, e ao montá-lo à mão inventou uma
   quinta gramática de escolher numa casa cuja Fase D inteira existiu para matar
   as seis primeiras. **Quebra três leis escritas, não uma:** enche-se de âmbar
   cheio (proibido por `formas.md:363-367`), contorna-se com `T.line`
   (**1,295:1**, reprova o SC 1.4.11) e não diz a ninguém que está escolhida
   (**`aria-pressed` = 0 ocorrências em todo o `src/`**).
3. **A correcção é uma tabela, uma primitiva e quatro âncoras** — §3, com o
   `.cjs` já com a armadilha de ambiguidade assinalada (o `style` da fila bate
   **duas vezes** no `App.jsx`).
4. **O custo, medido: +41 px** na ficha (e **+97 px** no único caso em que a
   fila passa a três filas — painel de 320 px, herói de Escudo Arcano).
   **Zero filas a mais no telefone, nos quatro heróis possíveis.**
5. **Sobre o cansaço, o meu veredito: a peça está certa e o ritmo está errado.**
   A aparição do cartão carrega hoje **0,020 bits**. A mesma peça, abrindo só
   quando o golpe acerta, carrega **1,023 bits — 50× mais informação por metade
   das interrupções.** Não condeno a fase; condeno o gatilho, e assino por baixo
   da proposta (a) do `jogo` **por razão de forma, independente da razão de
   dano dele**.

---

# 1 · POR QUE 27, E NÃO 47 — a aritmética inteira

## 1.1 · O endereço, e a conta

`src/App.jsx:1994-2002`, a fila de quatro pílulas da ficha:

```jsx
<button key={p.id} onClick={…}
  className="tv-anel-foco tv-mono text-[9px] px-2.5 py-1.5 rounded-full"
  style={{ background: ativo ? T.amber : T.panel, … border: `1px solid ${ativo ? T.amber : T.line}`, … }}>
```

A caixa compõe-se assim, e **nenhuma das quatro parcelas é uma decisão de
altura**:

| parcela | de onde vem | px |
|---|---|---|
| a caixa de linha | `text-[9px]` dá **só** `font-size: 9px` (valor arbitrário do Tailwind v3 não traz entrelinha); a entrelinha é a `line-height: 1.5` que o *preflight* põe em `html` e que o `<button>` herda por `line-height: inherit` | **13,5** |
| o enchimento | `py-1.5` = `0.375rem` × 2 | **12** |
| a borda | `border: 1px solid …` no `style` inline | **2** |
| **total** | | **27,5** |

**27,5 é o 27 que K3 leu** (um `offsetHeight` de caixa fraccionária volta
inteiro; se o número for 27 ou 28 é arredondamento de caixa de linha e **não
muda nada do que se segue**).

> ### O achado não é «falta padding». É que a altura desta peça é o RESTO DE UMA CONTA.
>
> Ninguém escreveu 27. Ninguém escreveu 47. **O número que o desenho decidiu não
> aparece uma única vez no repositório** — nem como literal, nem em tabela, nem
> em comentário. É a primeira lei da casa, *se é número, é tabela*, aplicada ao
> visual e falhada da forma mais limpa possível: **não há número errado, há
> número ausente.** Por isso as 102 asserções de `teste-painel-reacao.mjs`
> passaram verdes: não existia texto que uma suíte pudesse ler de volta.

E há um corolário que vale para toda a casa: **uma altura composta por
`font-size` + `padding` é uma altura que muda sozinha.** Basta alguém trocar
`text-[9px]` por `text-[10px]` — uma decisão de legibilidade, aparentemente
inofensiva — e o alvo de toque cresce 1,5 px sem que ninguém tenha tocado numa
medida de alvo. A régua e o texto não podem ser o mesmo número.

## 1.2 · E não é só a altura: a fila usa uma gramática que a casa proibiu por escrito

*A pergunta que me foi feita — «se a fila está a montar uma pílula à mão em vez
de usar a primitiva, esse é o defeito real» — tem resposta afirmativa, e com
três provas, não uma.*

| lei escrita | onde está | o que a fila faz | medida |
|---|---|---|---|
| **«nunca preenchimento âmbar cheio para seleção»** — `background: T.amber` tem 37 usos e é a assinatura da **ação** da tela | `formas.md:363-367` | `background: ativo ? T.amber : T.panel` — âmbar cheio, exactamente o proibido | a pílula escolhida fica com a mesma cara do botão principal da tela |
| **«a gramática única de escolhido: borda `amber` 1 px + filete de 3 px no lado de entrada + o visto»** | `formas.md:351-352` | tem o visto, **não tem o filete**, e a borda âmbar perde-se dentro do preenchimento âmbar | 1 dos 3 canais |
| **a borda de controlo é `lineStrong`, nunca `line`** (SC 1.4.11 pede 3:1) | `estilo.js:35-44`, e já cumprido em `ui.jsx:28` e `ui.jsx:398` | `border: 1px solid ${T.line}` na pílula em repouso | `line`/`panel` = **1,295:1** · reprova · `lineStrong`/`panel` = **3,512:1** |

**E a quarta, que é de leitor de ecrã e não de olho:** as quatro pílulas são
`<button>` mudos. Quem ouve a ficha ouve quatro botões sem relação entre si e
**nunca fica a saber qual está escolhido** — o visto `✓` é texto decorativo
dentro do rótulo. Medida: **`aria-pressed` aparece 0 vezes em `src/`**; `role="radio"`,
`aria-checked` e `role="group"` também: **zero, em 221 `<button>`**. A fila que
existe para cumprir a **WCAG 2.2.1** não cumpre a **4.1.2**.

*(O contraste, que é a única coisa que a fila acerta e fica registada porque
medi: `inkDim`/`panel` = **6,45:1** em repouso e `onAccent`/`amber` = **8,58:1**
escolhida. As duas passam o AA com folga. **O problema nunca foi a tinta.**)*

## 1.3 · O tamanho da doença, medido: não é uma pílula, é uma família de 19

Varri `src/**` à procura da assinatura — `rounded-full` num `<button>` cujo
`background` é um ternário que devolve `T.amber` ou `T.violet`:

| arquivo | pílulas cheias à mão |
|---|---|
| `src/App.jsx` | **14** |
| `src/painel-mapa.jsx` | 2 |
| `src/grade-de-batalha.jsx` | 1 |
| `src/painel-codex.jsx` | 1 |
| `src/painel-talentos.jsx` | 1 |
| **total** | **19** |

*(Com a janela de busca alargada de 3 para 5 linhas o número vai a 21; escrevo
os dois porque o varredor de §3.6 tem de nascer com o número exacto do seu
próprio regex, e não com o meu.)*

**A fila da ficha não inventou nada: copiou o vizinho.** `App.jsx:1914` (as
sub-abas da gestão) e `App.jsx:2040` (o ritmo de marcha, seis linhas abaixo dela)
são a mesma pílula âmbar cheia, escrita à mão, com outra medida. É a doença que
`formas.md:348` já tinha nomeado — *"pílulas em três cores"* — e que a Fase D
mandou curar com a peça `A escolha`. **A peça foi desenhada em D4, corrigida em
K1, e nunca chegou a existir em código:** `formas.md:361-362` diz, por extenso,
*"Pílula, aba, contador e lista: **[ainda não existe]**"*.

> ### O defeito real, numa frase
>
> **K3 entregou a fila antes de a peça existir**, e quem tem de construir uma
> peça que não existe copia a mais próxima. A altura de 27 é a única parte disto
> que alguém conseguiu medir — e é a menos grave das quatro.

---

# 2 · O CUSTO, EM PIXÉIS, ANTES E DEPOIS

## 2.1 · A largura real da ficha, nos dois sítios (e a inversão que ninguém tinha medido)

`App.jsx:1904` — `<aside className="… w-full md:w-80 md:max-w-[88vw] … p-4 md:p-5">`.

| | viewport | painel | `p-4`/`p-5` | conteúdo | dentro do bloco da fila (`px-2.5` + 2 de borda) |
|---|---|---|---|---|---|
| **telefone** | 375 | 375 (`w-full`) | 16 × 2 | 343 | **321 px** |
| **mesa** | ≥768 | **320** (`w-80`) | 20 × 2 | 280 | **258 px** |

> **O jogador de monitor lê a ficha numa coluna 24 % mais estreita que a do
> telefone** (258 contra 321). Não é uma opinião sobre densidade: é a
> consequência aritmética de `w-80` + `p-5`, e vale para a ficha inteira, não só
> para esta fila. **É o número que sustenta a proposta ambiciosa de §6.**

## 2.2 · A fila, fila a fila

Avanço da JetBrains Mono = **0,6 em** (600/1000), logo **5,4 px por carácter a
9 px**. Goteira `gap-2` = 8. Os quatro rótulos possíveis do terceiro lugar saem
de `reacoes.js:22-69` (`verboDaReacao` é o verbo do próprio herói): *Aparar*,
*Esquiva Ágil*, *Contramágica*, *Escudo Arcano*.

**Hoje** (chrome horizontal = `px-2.5` 20 + borda 2 = **22**):

| rótulo | car. | largura |
|---|---|---|
| `✓ Eu decido` | 11 | 81,4 |
| `Eu decido, sem pressa` | 21 | 135,4 |
| `Aparar sempre` … `Escudo Arcano sempre` | 13…20 | 92,2 … 130,0 |
| `Deixar passar` | 13 | 92,2 |

→ **2 filas**, nos dois larguras e nos quatro heróis. Altura da região:
`2 × 27,5 + 8` (goteira) `+ 17,5` (o rótulo *Quando um golpe chega*) `+ 18`
(`py-2` + borda do bloco) = **98,5 px**.

**Depois** (altura 48; chrome horizontal = 12 + 15 + 2 = **29**, mais a coluna
fixa do visto `1ch` + 4 = **8,6** → **37,6**):

| | telefone (321) | mesa (258) |
|---|---|---|
| Aparar · Esquiva · Contramágica | **2 filas** | **2 filas** |
| Escudo Arcano | **2 filas** | **3 filas** (a segunda pede 263 e há 258) |

| | antes | depois | delta |
|---|---|---|---|
| a região, 2 filas | 98,5 | **139,5** | **+41 px** |
| a região, 3 filas (mesa · Escudo Arcano) | 98,5 | **195,5** | **+97 px** |

**Cabem onde estão?** Sim, e a resposta é do tipo de painel: a ficha é
`overflow-y-auto` (`App.jsx:1904`). **Ali uma fila custa rolamento, não custa um
controlo** — ao contrário da fileira de batalha de W1, onde 6 px custavam
7 casas. **+41 px numa coluna que rola são 41 px; +41 px no campo de batalha
seriam uma fila de casas.** É a razão pela qual esta correcção é barata e a de
W1 não era.

**E o que eu não escondo:** na mesa, com o herói de Escudo Arcano, a segunda fila
pede **263 px** contra **258** disponíveis — falha por **5 px**. Com *Esquiva
Ágil* passa por **0,4 px**. **Uma fila decidida por fracções de pixel não é um
leiaute, é uma coincidência** — e como a peça é `flex-wrap`, a consequência é
uma fila a mais, nunca uma quebra. Está medido, está dito, e é exactamente o que
a proposta de §6 resolve de uma vez para a ficha inteira.

---

# 3 · A CORRECÇÃO, COM ÂNCORA — o que quem constrói tem de fazer, sem adivinhar

*Não escrevi código de produção. O que se segue é especificação com endereço,
para o `aprendiz` (§3.1 a §3.4) e para o `testes` (§3.5 e §3.6).*

## 3.1 · A tabela — `src/estilo.js`, logo depois de `MATERIAIS` (a fechar na linha 102)

```js
/* ============================================================
   O ALVO DE TOQUE — o piso da casa, em px.

   A doença que esta tabela cura tem endereço: `App.jsx:1998`. A fila de
   quatro pílulas da ficha mede 27,5 px e o desenho dela mede 48 — e a
   diferença atravessou uma suíte de 102 asserções sem uma única falha,
   porque NENHUM DOS DOIS NÚMEROS ESTÁ ESCRITO NO CÓDIGO. A altura era o
   resto de uma conta: 9 px de texto × 1,5 de entrelinha herdada, mais
   12 px de `py-1.5`, mais 2 px de borda. Uma medida que ninguém escreve
   é uma medida que ninguém pode provar — e uma altura composta por
   `font-size` + `padding` muda sozinha no dia em que alguém aumentar o
   texto por legibilidade.

   POR QUE 48 E NÃO 47. 44 é o mínimo do WCAG 2.5.5 (AAA) e do HIG; 48 é
   o do Material, é a casa do tabuleiro, é a linha do recuo do leque
   (`painel-reacao.jsx`) — e é o que K1 deixou por fechar quando anotou
   que a Pílula «saiu 47 e não 45, e o número não fecha». Um piso, quatro
   leitores, em vez de quatro números parecidos. O orçamento do telefone
   de W1 aguenta: 48 + 24 = 72 px de região reservada, contra o degrau
   medido em 75 — folga de 3 px em vez de 4, e a mesma 13.ª fila.
   ============================================================ */
export const ALVOS = {
  piso: 48,     /* toda peça em que se toca */
  chamado: 56,  /* `O chamado`: mais alto por decisão de K1, fixado em K3 */
};
```

**Fora desta tabela, de propósito e com o motivo escrito:** o `LARGURA_MAXIMA_PX
= 560` de `painel-reacao.jsx:27` **fica onde está**. É um **tecto de largura**,
não um **piso de alvo**; metê-lo aqui daria dois sentidos à mesma tabela, e uma
tabela com dois sentidos é a próxima dívida. *(Se o `regente` quiser as larguras
em tabela, ela chama-se outra coisa e nasce noutra etapa.)*

## 3.2 · A ponte — `src/constantes.js:52`

```diff
-export { T } from "./estilo.js";
+export { T, ALVOS } from "./estilo.js";
```

**É a única forma de `App.jsx`, `ui.jsx` e `painel-reacao.jsx` a alcançarem sem
mudar de convenção:** os três importam `T` de `constantes.js`, e `estilo.js` não
importa nada por desenho (`estilo.js:16-20`). Um import novo de `estilo.js` nos
três arquivos seria uma segunda estrada para a mesma tabela.

## 3.3 · A primitiva — `src/ui.jsx`, a seguir a `CartaoDeEscolha` (fecha na linha 404)

`CartaoDeEscolha` é a *Forma=Cartão* de `A escolha` (`20:77`). Esta é a
*Forma=Pílula* da mesma peça, e mora ao lado por isso.

```jsx
/* A PÍLULA DE ESCOLHA — `A escolha` *Forma=Pílula* (Figma `20:77`), a
   segunda forma da mesma peça de que `CartaoDeEscolha` é a primeira.

   A ALTURA SAI DE `ALVOS.piso` E NUNCA DE `padding` + `font-size`. É a
   lição de K3 com endereço: a fila da ficha media 27,5 px porque a sua
   altura era o resto de uma conta que ninguém tinha escrito.

   A GRAMÁTICA DO ESCOLHIDO É UMA SÓ (`formas.md`): borda `amber` de 1 px
   + filete de 3 px do lado de entrada + o visto. NUNCA preenchimento
   âmbar cheio — `background: T.amber` tem 37 usos e é a assinatura da
   AÇÃO da tela; usá-lo para dizer «selecionado» faz uma opção parecer o
   botão principal.

   A COLUNA DO VISTO É FIXA (`1ch`) E EXISTE NOS QUATRO ESTADOS. Esconder
   um filho colapsa o espaço e arrasta as palavras: com visto e sem, o
   texto começa no mesmo x, e a largura da pílula não depende de ela
   estar escolhida. O `padding-left` é 15 e não 12 porque os 3 px do
   filete não podem comer a goteira do texto. */
export function PilulaDeEscolha({ rotulo, escolhida, impedida, razao, aoClicar }) {
  return (
    <button type="button" disabled={impedida} aria-pressed={!!escolhida}
      onClick={impedida ? undefined : aoClicar} title={razao || undefined}
      className="tv-anel-foco tv-mono text-[9px] rounded-full"
      style={{
        display: "inline-flex", alignItems: "center",
        minHeight: ALVOS.piso, padding: "0 12px 0 15px",
        background: T.panel,
        color: escolhida ? T.amberSoft : T.inkDim,
        border: `1px solid ${escolhida ? T.amber : T.lineStrong}`,
        boxShadow: escolhida ? `inset 3px 0 0 0 ${T.amber}` : "none",
        fontWeight: escolhida ? 600 : 400,
        opacity: impedida ? 0.45 : 1,
        cursor: impedida ? "not-allowed" : "pointer",
      }}>
      <span aria-hidden="true" style={{ display: "inline-block", width: "1ch", marginRight: 4, textAlign: "center" }}>
        {escolhida ? "✓" : ""}
      </span>
      {rotulo}
    </button>
  );
}
```

**Os números desta peça, todos medidos por mim e todos citáveis:**

| | valor | régua |
|---|---|---|
| altura | **48 px** (`ALVOS.piso`) | WCAG **2.5.5** (AAA, 44) e **2.5.8** (AA, 24); Material 48 dp |
| tinta escolhida | `amberSoft`/`panel` = **11,81:1** | AA pede 4,5:1 |
| tinta em repouso | `inkDim`/`panel` = **6,45:1** | AA pede 4,5:1 |
| contorno em repouso | `lineStrong`/`panel` = **3,512:1** | SC **1.4.11** pede 3:1 |
| filete escolhida | `amber`/`panel` = **8,57:1** | SC 1.4.11 |
| o anel | `.tv-anel-foco`, já fabricada em K3 | `box-shadow`, nunca `border` — e a saída `forced-colors` já lá está |
| movimento | **120 ms** na borda e no filete, como toda *A escolha* (`formas.md:355`) | sob `prefers-reduced-motion`, aparece pronta |

**A saída de movimento é obrigatória à nascença** — a transição vai em
`SUPERFICIES_CSS` (não em `MOVIMENTO_CSS`: é `transition`, não `animation`, e o
varredor D5c vigia `animation`), e o `@media (prefers-reduced-motion: reduce)`
põe `transition: none`. *Uma peça nova sem saída é a dívida que D5c existe para
não deixar nascer.*

## 3.4 · A fila da ficha — `src/App.jsx:1982-2007`

**A armadilha, antes do patch:** o `style` desta pílula **não é âncora única**.
A string

```
style={{ background: ativo ? T.amber : T.panel, color: ativo ? T.onAccent : T.inkDim, border: `1px solid ${ativo ? T.amber : T.line}`, fontWeight: ativo ? 700 : 400 }}
```

aparece **duas vezes** no arquivo: `:1999` (a fila da reação) e `:2041` (o ritmo
de marcha, 42 linhas abaixo). Um `t(de, para)` ancorado nela **estoura por
ambíguo** — que é o que o padrão da casa promete — mas quem vier com um
`replace` à mão troca as duas. **A âncora tem de incluir a `className`**, que
essa sim é única no repositório:

```
className="tv-anel-foco tv-mono text-[9px] px-2.5 py-1.5 rounded-full"
```

**O que fica no lugar do `<button>` (linhas 1996-2002):**

```jsx
return (
  <PilulaDeEscolha
    key={p.id}
    rotulo={p.rotulo}
    escolhida={(preferenciaReacao || "normal") === p.id}
    aoClicar={() => aoEscolherPreferenciaReacao && aoEscolherPreferenciaReacao(p.id)}
  />
);
```

— e o `const ativo = …` some, porque a peça é que sabe o que é estar escolhida.

**Mais três linhas, e nenhuma é cosmética:**

1. **`import`** — juntar `PilulaDeEscolha` ao import de `ui.jsx` no topo do
   `App.jsx` (a mesma linha por onde entram `Botao` e `CartaoDeEscolha`).
2. **O grupo** — `<div className="flex gap-2 flex-wrap">` (`:1993`) passa a
   `<div className="flex gap-2 flex-wrap" role="group" aria-label="Quando um golpe chega">`.
   **Sem isto o leitor de ecrã ouve quatro botões sem parentesco**, e a fila que
   existe para cumprir a WCAG 2.2.1 continua a falhar a 4.1.2.
3. **A goteira de 8 px fica, e o comentário de `:1978-1981` fica com ela** —
   continua verdadeiro: o anel cresce 4 px para um lado e cabe na metade da
   goteira, logo **a fila não se mexe quando o foco entra**. K3 provou-o vivo e
   a mudança de altura não o toca.

**E `painel-reacao.jsx` paga a mesma dívida no mesmo passo** (é o que dá à
tabela os dois leitores que `teste-ligacao` exige):

| linha | hoje | passa a |
|---|---|---|
| `:17` | `import { T } from "./constantes.js";` | `import { T, ALVOS } from "./constantes.js";` |
| `:43` | `minHeight: 48` | `minHeight: ALVOS.piso` |
| `:67` | `minHeight: 56` | `minHeight: ALVOS.chamado` |

## 3.5 · A suíte — `testes/teste-peca-escolha.mjs` (nova)

*Conta se prova, tela se olha*: a peça é JSX e não se instancia em Node, mas **a
tabela é `.js` puro e o texto do arquivo é acervo** — é assim que
`check-endereco-do-tabuleiro.mjs:175` já prova uma decisão de cor.

```
A. A TABELA, LIDA DE VOLTA (import, nunca transcrição)
   1. ALVOS.piso >= 44                        · WCAG 2.5.5 (AAA) e o piso escrito em D4
   2. ALVOS.piso >= 24                        · WCAG 2.5.8 (AA)
   3. ALVOS.chamado >= ALVOS.piso             · uma peça mais alta nunca desce abaixo do piso
   4. Object.keys(ALVOS).length >= 2          · o piso do alcance: uma tabela renomeada mede zero

B. A PEÇA (texto de `src/ui.jsx`)
   5. `PilulaDeEscolha` existe e é exportada
   6. o corpo dela contém `minHeight: ALVOS.piso`
   7. e NÃO contém `minHeight:` seguido de dígito            · a altura nunca é literal
   8. e NÃO contém `background: T.amber`                     · a gramática do escolhido
   9. e contém `T.lineStrong` e não `T.line` na borda        · SC 1.4.11
  10. e contém `aria-pressed`                                · SC 4.1.2
  11. e contém `width: "1ch"`                                · a coluna do visto não colapsa

C. A FIADA (texto de `src/App.jsx`)
  12. o bloco «QUANDO UM GOLPE CHEGA» contém `<PilulaDeEscolha`
  13. e NÃO contém `rounded-full`                            · a pílula à mão não voltou
  14. e contém `role="group"`

D. O OUTRO LEITOR (texto de `src/painel-reacao.jsx`)
  15. contém `ALVOS.piso` e `ALVOS.chamado`
  16. e NÃO contém `minHeight: <dígito>`
```

**Ao mover a asserção de K3 que media o cartão, escreva o motivo** — é lei da
casa e aqui aplica-se a uma: `teste-painel-reacao.mjs` não conhece altura de
pílula nenhuma hoje, logo **nada se move**; o que se acrescenta é o `ALVOS` como
origem dos 48/56 que ele já vê passar por `painel-reacao.jsx`.

## 3.6 · O varredor — **D5f**, quarto dente de `testes/check-formas.mjs`

O varredor certo é este e não outro: **não há módulo para medir, a doença está
no TEXTO do repositório, e num arquivo por vez é invisível** — é a razão que o
próprio cabeçalho de `check-formas.mjs:13-19` escreve, palavra por palavra, para
D5a. Três sub-dentes, no formato da casa:

```js
/* D5f · O ALVO DE TOQUE SAI DE TABELA, NUNCA DE ARITMÉTICA DE PADDING.

   A DOENÇA, com endereço e data: `App.jsx:1998` (16/09) media 27,5 px de
   alvo onde o desenho dizia 48, e NENHUM DOS DOIS NÚMEROS EXISTIA NO
   TEXTO. D5a apanha cor nova, D5b apanha cor copiada, D5c e D5e apanham
   o relógio — e os quatro ficaram cegos a uma medida de alvo, porque uma
   medida ausente não é um literal.

   D5f.1 · ALTURA LITERAL EM PEÇA DE CONTROLO. Teto por arquivo do
     padrão /\b(?:minHeight|height)\s*:\s*\d/ nos arquivos de peça
     (`src/ui.jsx`, `src/painel-reacao.jsx`). Depois da correcção: 0 nos
     dois — e pela regra anti-cemitério A ENTRADA SAI da tabela quando
     chega a zero.
   D5f.2 · A PÍLULA CHEIA À MÃO. Teto por arquivo de `rounded-full` num
     `<button>` cujo `background` é ternário para `T.amber`/`T.violet`.
     Medido a 16/09: App 14 · painel-mapa 2 · grade-de-batalha 1 ·
     painel-codex 1 · painel-talentos 1 = 19 (janela de 3 linhas).
     QUEM CONSTRUIR MEDE OUTRA VEZ COM O SEU PRÓPRIO REGEX e escreve o
     número que ele der — um teto copiado de outra medição é a mentira
     que a tabela existe para impedir. A fila da ficha desce o teto do
     App em 1 no mesmo commit, com a data na própria linha.
   D5f.3 · O PISO DO ALCANCE. `ALVOS` tem de ter >= 2 entradas e
     `ALVOS.piso >= 44`. Sem isto, renomear a tabela deixa D5f.1 a medir
     o vazio e a ficar verde — e catraca verde por vazio é pior que
     catraca nenhuma (o argumento é o de `ALCANCE_MINIMO`).

   O BURACO, declarado com número porque um buraco calado é mentira: D5f
   conta TEXTO e não sabe renderizar. Um `<button>` com `minHeight:
   ALVOS.piso` e `overflow: hidden` a cortar o rótulo passa verde. O que
   este dente prende é a ORIGEM do número, não a caixa desenhada; a caixa
   só se confere viva, e é por isso que §7 diz que a conferência no
   navegador continua por fazer. */
```

**A válvula é a da casa:** um teto pode subir, com motivo e data na própria
linha. O que a catraca proíbe é subir calado.

---

# 4 · A FORMA DO CANSAÇO — a minha metade da medição de K4

*O número da batida é do `jogo`. Isto é a leitura de forma, e ela responde a
três perguntas: o que faz uma janela cansar, se há sinal que o diga de antemão,
e o que eu assino.*

## 4.1 · O que, na forma, faz uma janela cansar — os cinco eixos, com o número de hoje

| eixo | o cartão de hoje | o veredito |
|---|---|---|
| **frequência** | a janela abre em **98,60–100 %** das rodadas para **7 das 12 classes**; 62,37–100 % para as outras 5 | **é aqui que mora o cansaço, e só aqui** |
| **duração** | janela **15 000 ms**; **11 000** sem relógio nenhum; trilho **4 000**; aperto **1 000**; resolução **1 200**; tecto por rodada **16 600**, entre respostas **33 200** | **73 % da janela não tem relógio** (11 de 15) — desenho correcto |
| **movimento** | trilho de **4 px**, a aresta de baixo do próprio botão, `scaleX` **linear**, `animation-delay` negativo | linear é a única curva honesta num prazo: qualquer `ease` mente sobre o tempo que sobra |
| **sítio onde nasce** | a região do veredito, à esquerda, tecto **560 px** (a região varia 288 → 1 400, 4,86×) | o tecto é conserto certo; o **sítio** é o problema — a seguir |
| **o que tapa** | no telefone, **57 % da tira do herói, e a barra de PM inteira** | **§4.2** |

**E o custo em relógio de parede, que é o que o jogador sente:** a rodada já
esperava **~13,4 s** pelo Mestre. A janela **suspende** a rodada, logo soma-se:
uma resposta em 2 s faz a rodada crescer **+15 %**; o tecto de 16,6 s fá-la
crescer **+124 %**. *(O único pedaço que não custa nada é a resolução: os
1 200 ms vivem por cima da espera do Mestre — decisão 2 de K3, e está certa.)*

**Quatro factos de forma defendem a fase, e escrevo-os antes de acusar:**

1. **`Etapa=Direta` é o caso de 12 classes em 12** — o caso comum é **binário**
   (aceitar/recusar), que é a pergunta mais barata que existe. Pela lei de Hick
   (Hick 1952; Hyman 1953) o tempo de decisão cresce com `log2(n+1)`: duas saídas
   são o chão da escala, e o leque de 2+ só aparece a quem tem 2+ reações.
2. **11 dos 15 segundos não têm relógio.** O pedágio visível só existe para quem
   hesita — e a contagem do `prefers-reduced-motion` nunca tem dois dígitos
   (4,3,2,1 em vez de 15 numerais, que seria um temporizador de bomba).
3. **O limite de tempo pode ser desligado** — `eu decido, sem pressa` estende-o
   sem fim, um verbo fixo desliga-o. É a WCAG 2.2.1 cumprida duas vezes.
4. **Uma saída em cada estado.** `Enter` aceita, `Escape` recusa, o recuo é uma
   linha visível, e a expiração deixa rasto no log igual ao de quem respondeu.

> **Logo: se K4 medir cansaço, não é cansaço de forma. É cansaço de frequência.**
> Esta é uma afirmação falsificável, e é a minha metade da medição: se o `jogo`
> encontrar cansaço e o encontrar **também** com a janela rara, eu estou errado e
> a peça é que está pesada. Se o encontrar só com a janela frequente, a peça está
> certa e o gatilho está errado.

## 4.2 · A peça que tem de reimprimir o que tapa está no sítio errado

K3 mediu e consertou: no telefone o cartão tapa **57 % da tira do herói**,
**incluindo a barra de PM inteira**, no segundo exacto em que pede PM. O
conserto foi **escrever o saldo de PM dentro do cartão**. O conserto está certo
(*mostrar o preço e esconder a bolsa é meio veredito*) — **e é também o
diagnóstico**:

> ### Uma peça que precisa de reimprimir a informação que tapa não tem um defeito de conteúdo. Tem um defeito de endereço.
>
> É a mesma lei que tirou o `<title>` em E2 e a segunda linha da desistência em
> W1 — **duas verdades sobre a mesma coisa**. Aqui a casa escolheu a única saída
> que não exigia mexer no leiaute do combate, e foi a escolha certa para K3. Mas
> fica escrito, com o número, que o cartão está a nascer **por cima da única
> coisa que o jogador tem de ler para responder**.

## 4.3 · Há um sinal de forma que já diz «isto vai cansar»? Há, e tem unidade

**A régua do meu ofício para isto é a surpresa da aparição, e ela mede-se em
bits.** A informação que o simples *aparecer* de uma peça carrega é
`−log₂(p)`, onde `p` é a fracção das unidades de jogo em que ela aparece
(Shannon, *A Mathematical Theory of Communication*, 1948). Não é analogia: é a
definição.

| a janela abre em… | `p` | a aparição carrega |
|---|---|---|
| **hoje**, marcial/misto/furtivo | 0,986 | **0,020 bits** |
| hoje, o mago contra 2 comuns | 0,624 | 0,681 bits |
| **só em golpe que acerta** (proposta (a) do `jogo`: 0,986 × (1 − 0,5009)) | **0,492** | **1,023 bits** |

> ### A peça que aparece em 98,6 % das rodadas carrega 0,020 bits ao aparecer. A mesma peça, abrindo só quando o golpe acerta, carrega 1,023 — **50× mais informação, por metade das interrupções.**

**E é isso que quer dizer «deixou de ser acontecimento e virou moldura».** A
minha régua, escrita para a casa poder usá-la noutras peças:

- **acima de 1 bit** (`p ≤ 0,5`) — acontecimento: a aparição é, por si, notícia;
- **entre 1 e 0,1 bit** — sinal a desgastar-se;
- **abaixo de 0,1 bit** (`p ≥ 0,933`) — **moldura**: a aparição não informa nada,
  e tudo o que a peça custa é custo puro.

**Hoje o cartão está a 0,020 — cinco vezes abaixo do chão da moldura.** E uma
moldura com relógio é um pedágio: cobra-se atenção em cada passagem e não se
entrega informação nenhuma pela passagem.

**Os estudos, porque «é o padrão» sem fonte não é estudo:**

- **Mackworth, *The breakdown of vigilance during prolonged visual search*
  (Quarterly Journal of Experimental Psychology, 1948)** — o *vigilance
  decrement*: a deteção de um sinal recorrente degrada-se de forma mensurável
  dentro da primeira meia hora de tarefa. Uma janela por rodada, numa sessão de
  RPG, está exactamente nesse regime.
- **Anderson, Vance, Kirwan, Eargle & Jenkins, *How Polymorphic Warnings Reduce
  Habituation in the Brain* (CHI 2015)** — por fMRI, a resposta neural a um
  aviso repetido **cai acentuadamente ao fim de poucas repetições**, e variar a
  *forma* do aviso atrasa a habituação. É a prova experimental de que **a peça
  que aparece sempre com a mesma cara deixa de ser vista** — e a nossa aparece
  com a mesma cara em 12 classes de 12 (`Etapa=Direta`).
- **Bailey & Konstan, *On the need for attention-aware systems* (Computers in
  Human Behavior, 2006)** — o custo de uma interrupção depende do **momento** em
  que ela cai, e não do seu conteúdo: interromper num mau momento aumenta erro e
  irritação de forma mensurável. É o número do `jogo` dito noutra língua: **63 %
  do dano da rodada chega sem pergunta, e 50,09 % das perguntas são sobre um
  golpe que errou.** A janela não está a interromper de mais — está a interromper
  **na altura errada**, que é pior.
- **Miller (1968), via Nielsen, *Response Times: The 3 Important Limits*
  (NN/g, 1993)** — 10 s é o limite acima do qual a atenção do utilizador sai da
  tarefa. **A nossa janela é 15 s, 1,5× o limite.** K1b já respondeu a isto pela
  metade certa (11 s calados + 4 s de barra), e a outra metade é a pílula
  `sem pressa`. Fica registado que o número bruto está acima do limite e que a
  defesa é o silêncio dos primeiros 11 s.

## 4.4 · O meu veredito, assinado

> **Não condeno a fase. Condeno o gatilho — e por razão de forma, que é
> independente da razão de dano do `jogo`.**
>
> A peça está certa: o caso comum é binário, 73 % da janela é calada, há saída em
> todos os estados, o limite de tempo desliga-se e o movimento é honesto. **O que
> está errado é que ela acontece quase sempre**, e uma pergunta que acontece
> quase sempre não é uma pergunta: é uma moldura com relógio, e uma moldura com
> relógio é um pedágio.
>
> **Assino por baixo da proposta (a) do `jogo`** — *a janela não abre num erro do
> inimigo* — e acrescento o número que ela não tinha: **a aparição do cartão
> passa de 0,020 para 1,023 bits, 50×, pagando com metade das interrupções.**
> A proposta (b) (abrir no maior golpe da rodada) é melhor ainda do meu lado,
> porque põe a peça a coincidir com o momento que dói — mas as duas esbarram na
> asserção 05 da trava de K2, e isso é mecânica, é da pessoa, e não é minha.
>
> **E se a medição do `jogo` disser o contrário do que eu escrevi aqui — que
> cansa mesmo com a janela rara — a peça está pesada e eu assino a condenação
> dela, sem defender o que esta mesa construiu.** O que não faço é dizer que
> cansa sem o número, nem que não cansa por a ter desenhado.

---

# 5 · A FASE K DO LADO DA FORMA — o antes e o depois

## 5.1 · O que existia em 15/09 às 19:40, quando K1 abriu

**Nada.** Não havia peça, não havia momento, não havia relógio. O jogador tinha
**seis reações em `reacoes.js` e nada onde tocar**: o módulo escrevia no seu
próprio cabeçalho que *"no 5e e no BG3 metade da tensão do combate mora aqui"* e
na linha seguinte entregava a escolha ao sistema. **O módulo diagnosticava o
problema e depois causava-o.** Numa luta inteira o `jogo` tocou **três**
controles, e um deles foi o `⛺` que encerrou a luta por engano.

## 5.2 · Etapa a etapa, o que nasceu e o que mudou de cara

| | **K1** · o momento desenhado | **K1b** · o relógio de 15 s | **K2** · a trava | **K3** · a reação acontece | **K4** · a batida |
|---|---|---|---|---|---|
| **nasceu** | `O chamado` (8 var.), `O verbo com preço` (6+), 3 glifos vectoriais, `PALAVRAS_DA_CHANCE` | `RITMO_DA_REACAO` (uma tabela, não duas), `lineStrong` (`#70688C`), as réguas ANTES/DEPOIS na mesma escala | a suíte de 85→102 asserções, o dente **D5e** em `check-formas` | `painel-reacao.jsx`, `palavras-da-reacao.js`, **7 classes novas** e **`.tv-anel-foco`** | a régua da aparição (§4.3), `ALVOS`, `PilulaDeEscolha`, o dente **D5f** |
| **mudou de cara** | `A pergunta que expira` 4→8 variantes; **a Pílula de `A escolha` 35→47 px**; `Chamando` 193→118 (−39 %), `Escolhendo` 332→217 (−35 %) | a barra passa a correr **4 s, não 15**; `folgado` morre; os bónus somam ao **trilho**, não à janela | `O chamado` **não** ganha eixo `Estado` — o anel vira classe transversal | o cartão ganha **tecto de 560**, diz o **saldo de PM**, e a fila da ficha existe pela primeira vez | a fila da ficha passa de uma pílula à mão para **a peça**; a altura passa a sair de tabela |
| **o número que a etapa deixou** | a peça media 320 e três documentos diziam 344; **5 factos errados em 18 nós** | rodada de 4 inimigos **60 000 → 15 000 ms (−75 %)**; luta de 5 rodadas **300 000 → 33 200 (−88,9 %)** | o desenho óbvio de K3 **quebrava a regressão zero em 37,44 % das sementes** | 192/192 suítes, 13/13 varredores, **102 asserções**; cartão 560, chamado 56, recuo 48, trilho 4 s | **0,020 bits** de aparição; **27,5 px** onde o desenho dizia 48; **19** pílulas à mão |

## 5.3 · O que a Fase K deixa por fazer, do meu lado — e é nomeado, não lamentado

1. **A dívida de alto contraste — está com a pessoa, e é a maior.** Sob
   `forced-colors: active` o `box-shadow` é removido por especificação, e o anel
   de foco da casa inteira é `box-shadow`. K3 fabricou `.tv-anel-foco` com as
   duas linhas de `outline` do `forced-colors` já dentro e aplicou-a a **5
   controlos** (o chamado, o recuo, as linhas do leque e as quatro pílulas).
   **Falta o alcance: 221 `<button>` em `src/` e 86 alvos do tabuleiro com
   `outline: none` escrito à mão** (`grade-de-batalha.jsx:515-519`). Indicadores
   de foco visíveis sob `forced-colors` hoje fora da Fase K: **zero**.
2. **`A escolha` continua a existir pela metade em código.** Depois de §3
   existirão **Cartão** e **Pílula**; *Aba*, *Contador* e *Lista* continuam
   `[ainda não existe]`, e as **19 pílulas cheias à mão** (§1.3) continuam lá —
   D5f congela-as, não as paga.
3. **O Figma não foi aberto em K3 nem em K4.** As correcções de K2 estão
   escritas nas descrições de `O chamado` (`62:2453`) e de `A escolha`
   (`20:77`), e **`A escolha` vai ficar com 47 px no Figma contra 48 no código**
   no instante em que §3 entrar. *Isto é uma divergência real entre a fonte da
   verdade e o espelho*, e não a escondo: quem levar §3 à mesa leva também a
   pílula a 48 no Figma, ou o `regente` decide ficar-se pelos 47 e a tabela muda
   num carácter.
4. **As duas correcções de propriedade de `A escolha` continuam abertas** —
   `rotulo`, `a marca` e `a razao` são **camadas e não propriedades**, numa peça
   cujo rótulo muda em toda instância. É a quarta peça com a mesma doença que E2
   curou em três.
5. **O `Estado=Foco` da Pílula ainda cresce 28 px no Figma** (75 contra 47). **Em
   código isto já está resolvido** pelo `.tv-anel-foco` (`box-shadow` não ocupa
   leiaute); no Figma continua geometria, porque lá não há `box-shadow` de dois
   degraus. A divergência está escrita em K3 §1.6 e continua verdadeira.
6. **A conferência viva de §3 está por fazer** — e há coisa nenhuma nesta folha
   que a substitua. K3 apanhou dois defeitos na tela que 102 asserções não
   apanharam; **D5f apanha a origem do número, nunca a caixa desenhada.**

---

# 6 · PARA A PESSOA DECIDIR — a proposta ambiciosa

> ## A ficha deixa de ser uma coluna de 320 px, e a Fase K é a prova de que ela já não cabe.

**O número que abre o caso, e não é uma questão de gosto:**

| | largura útil do bloco da fila |
|---|---|
| telefone (375 px, `w-full` + `p-4`) | **321 px** |
| **mesa (≥768 px, `md:w-80` + `p-5`)** | **258 px** |

**O jogador de monitor lê a ficha do herói numa coluna 24 % mais estreita do que
a do telefone.** Não é densidade: é `w-80` (320 px fixos) mais `p-5`, decididos
quando a ficha tinha metade do que tem hoje. E vale para a ficha **inteira** — os
suprimentos, o ritmo de marcha, os talentos, a preferência de defesa —, não só
para esta fila.

**O que isso custa, medido nesta etapa:**

- a fila de quatro pílulas, à altura certa, cabe em **2 filas no telefone nos 4
  heróis possíveis** e em **2 filas na mesa em 3 dos 4** — o quarto falha por
  **5 px**, e o terceiro passa por **0,4 px**. *Uma fila decidida por fracções de
  pixel não é um leiaute.*
- **e o texto fica preso aos 9 px.** Para levar esta fila aos **12 px** que todo
  o resto da Fase K usa (`text-xs` em `painel-reacao.jsx:40` e `:64`), a mesa
  precisaria de **3 a 4 filas** (+149 px); o telefone continuaria em 2. **A
  coluna de 320 px é o que proíbe a ficha de ser legível**, e proíbe-o só na
  mesa.

**A proposta, numa linha:** `md:w-80` → `md:w-[28rem]` em `App.jsx:1904`.

| | hoje | proposta |
|---|---|---|
| painel na mesa | 320 px | **448 px** |
| conteúdo | 280 | 408 |
| bloco da fila | 258 | **386** |
| a fila a 12 px de texto | 3–4 filas | **2 filas, nos 4 heróis** |
| fracção de um ecrã de 1536 px | 20,8 % | **29,2 %** |
| `md:max-w-[88vw]` a 768 px | 676 px de tecto — **448 cabe** | idem |

**A prova, pelos três caminhos que a casa aceita:** *medida* — os números acima,
todos aritméticos e reproduzíveis; *estudo citado* — o texto de corpo do jogo
vive entre 45 e 75 caracteres por linha (Bringhurst, *The Elements of
Typographic Style*), e uma coluna de 258 px a 12 px de mono dá **~35
caracteres**, metade do chão; *experiência jogada* — falta, e é o que peço ao
`jogo` na etapa em que isto entrar.

**O que o jogador tem de reaprender: nada.** É o mesmo painel, no mesmo canto,
com o mesmo gesto para abrir e fechar. **O que muda é quanto da cena ele tapa
enquanto está aberto** — e é por isso que vem à pessoa e não à mesa: *mexer no
que o produto é* é o critério dela, e um painel que tapa 29 % do ecrã em vez de
21 % é uma decisão sobre a prosa, que é a protagonista.

**A reversibilidade é uma palavra**: `w-[28rem]` → `w-80`, num só sítio.

*(E a segunda, mais barata, se a primeira não passar: **a fila da ficha adopta
`A escolha` *Forma=Lista*** — uma por fila, largura toda, 48 px, como
`painel-reacao.jsx` já faz com os verbos do leque. Custo: **4 filas fixas, +149
px**, iguais no telefone e na mesa, texto a 12 px, e **zero dependência da
largura do painel ou do nome do verbo do herói**. É mais alta e é previsível —
troca-se altura por determinismo. A variante está declarada em `formas.md:358` e
nunca foi fabricada.)*

---

# 7 · O BLOCO PARA `formas.md` — pronto a colar, `[K4]`

*Duas peças: uma correcção marcada `[K4]` dentro do bloco de K1 (a entrada da
preferência, `formas.md:1045-1072`), e um bloco novo para o fim do arquivo.*

## 7.1 · A correcção dentro da entrada existente

**No item `- **forma** —` (linha 1049), trocar `(47 px)` por `(48 px)` e
acrescentar a seguir ao parágrafo da citação:**

```markdown
  **[K4] A medida passou a sair de tabela, e o número fechou em 48.** A fila
  nasceu em K3 a **27,5 px** — `9 px de texto × 1,5 de entrelinha herdada + 12 de
  `py-1.5` + 2 de borda` — e a diferença atravessou 102 asserções sem uma falha
  porque **nenhum dos dois números existia no código**. A altura passa a
  `ALVOS.piso` (`src/estilo.js`), e o piso é **48**: fecha o 47 que K1 deixou
  dito por não fechar, é o número da casa do tabuleiro e da linha do recuo do
  leque, e cabe no orçamento do telefone de W1 (48 + 24 = **72** contra o degrau
  de 75 — folga de 3 px em vez de 4, a mesma 13.ª fila).
```

**No item `- **onde vive** —` (linhas 1063-1064), substituir por:**

```markdown
- **onde vive** — Figma: a fila na ficha, com instâncias de `A escolha` (`20:77`)
  — **[K4] e o Figma diz 47 onde o código dirá 48: a divergência está aberta e
  escrita, não descoberta.** · Código: **`PilulaDeEscolha`, `src/ui.jsx`**, com a
  fila em `App.jsx:1982-2007`.
```

## 7.2 · O bloco novo, para o fim do arquivo

```markdown
# O alvo de toque sai de tabela — a pílula, o piso e a régua da aparição (K4 · 16/09)

## A pílula media 27,5 e o desenho dizia 48 — e o defeito não era o padding

`App.jsx:1998` compunha a altura do alvo somando `text-[9px]` (que dá só
`font-size`, e herda a entrelinha 1,5 do preflight do Tailwind), `py-1.5` e a
borda: **13,5 + 12 + 2 = 27,5**. **Nem 27 nem 48 estavam escritos em lado
nenhum** — e é por isso que as 102 asserções de K3 passaram verdes: *não há
texto que uma suíte possa ler de volta.* A primeira lei da casa falhada na sua
forma mais limpa: **não havia número errado, havia número ausente.**

> ### Uma altura composta por `font-size` + `padding` é uma altura que muda sozinha.
> Trocar `text-[9px]` por `text-[10px]` — uma decisão de legibilidade — move o
> alvo de toque 1,5 px sem ninguém ter tocado numa medida de alvo. **A régua e o
> texto não podem ser o mesmo número.**

## O defeito real: a fila montava a peça à mão, e inventou uma quinta gramática

`A escolha` *Forma=Pílula* nunca existiu em código (esta folha dizia-o por
extenso). Sem primitiva, a fila copiou a pílula mais próxima — as sub-abas da
gestão (`:1914`) e o ritmo de marcha (`:2040`) — e herdou três defeitos que a
peça não tem:

| lei desta folha | o que a fila fazia | o número |
|---|---|---|
| nunca preenchimento âmbar cheio para seleção | `background: ativo ? T.amber` | `T.amber` tem 37 usos e é a assinatura da **ação** |
| borda `amber` + filete de 3 px + o visto | só o visto | 1 dos 3 canais |
| borda de controlo é `lineStrong` | `T.line` | **1,295:1**, reprova o SC 1.4.11 (`lineStrong` dá 3,512:1) |

**E uma quarta, de leitor de ecrã:** `aria-pressed` mede **0 ocorrências em
`src/`**, em **221 `<button>`**. A fila que existe para cumprir a WCAG 2.2.1
falhava a 4.1.2.

**A família tem 19 membros** (`App.jsx` 14 · `painel-mapa` 2 ·
`grade-de-batalha` 1 · `painel-codex` 1 · `painel-talentos` 1), e o dente
**D5f** de `check-formas.mjs` congela o número no dia em que nasce.

## `ALVOS`, e por que o piso é 48

`ALVOS = { piso: 48, chamado: 56 }`, em `src/estilo.js`, exportado por
`constantes.js` como `T` já é. **48 e não 47:** 44 é o mínimo do WCAG 2.5.5
(AAA), 48 é o do Material, é a casa do tabuleiro, é a linha do recuo do leque —
e fecha o número que K1 deixou dito por não fechar (*"saiu 47 e não 45, e o
número não fecha"*). **Um piso, quatro leitores**, em vez de quatro números
parecidos. O orçamento do telefone de W1 aguenta: 48 + 24 = **72** contra o
degrau de **75**.

**O `LARGURA_MAXIMA_PX = 560` fica fora, de propósito:** é tecto de largura, não
piso de alvo, e uma tabela com dois sentidos é a próxima dívida.

## O custo, medido

A região da ficha vai de **98,5 px** a **139,5 px** (+41), e a **195,5** (+97) no
único caso em que passa a três filas — painel de mesa, herói de Escudo Arcano.
**Zero filas a mais no telefone, nos quatro heróis possíveis.** Numa coluna que
rola, uma fila custa rolamento; no campo de batalha custaria casas — é a razão
pela qual esta correcção é barata e a de W1 não era.

**E o que ficou dito e não consertado:** na mesa a segunda fila falha por **5 px**
no pior caso e passa por **0,4 px** no penúltimo. *Uma fila decidida por
fracções de pixel não é um leiaute* — e o que a decide não é a peça, é o painel
de **320 px**, que dá à mesa uma coluna **24 % mais estreita que a do telefone**
(258 contra 321). Está na pauta, com o número.

## A régua da aparição — quando uma peça deixa de ser acontecimento

A informação que o simples *aparecer* de uma peça carrega é **`−log₂(p)`**, com
`p` a fracção das unidades de jogo em que ela aparece (Shannon, 1948). Não é
analogia; é a definição.

| | `p` | bits |
|---|---|---|
| a janela da reação, hoje (7 das 12 classes) | 0,986 | **0,020** |
| a mesma janela, abrindo só em golpe que acerta | 0,492 | **1,023** |

> ### Acima de 1 bit é acontecimento. Abaixo de 0,1 bit é moldura. E uma moldura com relógio é um pedágio.

**Hoje o cartão está a 0,020 — cinco vezes abaixo do chão da moldura.** Abrir só
em golpe que acerta multiplica por **50** a informação da aparição, **pagando com
metade das interrupções**.

**Os estudos:** Mackworth (1948) mede o *vigilance decrement* — a deteção de um
sinal recorrente degrada-se dentro da primeira meia hora; Anderson *et al.*
(CHI 2015) mostram por fMRI que a resposta a um aviso repetido **cai ao fim de
poucas repetições**, e que variar a forma atrasa a habituação — a nossa peça
aparece com a mesma cara em 12 classes de 12; Bailey & Konstan (2006) mostram
que o custo de uma interrupção depende do **momento** e não do conteúdo, que é o
*63 % do dano chega sem pergunta* do `jogo` dito noutra língua.

## O veredito de forma da Fase K

**A peça está certa e o ritmo está errado.** O caso comum é binário
(`Etapa=Direta`, 12 classes em 12 — o chão da lei de Hick), **73 % da janela não
tem relógio** (11 s de 15), há saída em todos os estados e o limite de tempo
desliga-se por duas estradas (WCAG 2.2.1). **O que cansa não é a forma: é
acontecer quase sempre.** O `desenho` assina a proposta (a) do `jogo` — *a
janela não abre num erro do inimigo* — por razão de forma, independente da razão
de dano dele.

**E uma peça que precisa de reimprimir a informação que tapa não tem defeito de
conteúdo: tem defeito de endereço.** O cartão tapa **57 % da tira do herói** no
telefone, incluindo a barra de PM, e K3 consertou-o escrevendo o saldo de PM lá
dentro. O conserto está certo; **o diagnóstico fica escrito com ele.**
```

---

# 8 · O QUE EU NÃO SOUBE, E O QUE NÃO FIZ

- **Não abri o Figma.** As medidas internas de `A escolha` *Forma=Pílula*
  (enchimento e tamanho de texto a 47 px) não estão nesta folha porque não as
  fui ler — trabalhei sobre o que `formas.md` e `k1-desenho.md` registam. **Se o
  enchimento do Figma não bater com o `0 12px 0 15px` de §3.3, o Figma é que
  manda e a linha muda.** Está dito em vez de arredondado.
- **Não confirmei os 27 px no navegador.** A aritmética dá **27,5**, K3 leu
  **27**, e a diferença é arredondamento de caixa de linha. **Não muda a
  conclusão** — o ponto é que nenhum dos dois números foi escrito por ninguém —,
  mas quem construir deve ler a caixa viva antes de fechar o commit, porque *a
  caixa desenhada só se confere viva e D5f prende a origem do número, não a
  caixa*.
- **As larguras de texto são calculadas, não medidas.** Uso o avanço de 0,6 em
  da JetBrains Mono. Se a fonte não carregar, o `monospace` de recurso do sistema
  pode divergir — **o que é mais uma razão para a altura não sair da aritmética
  do texto**, e é a razão pela qual §3.3 usa `minHeight` e não enchimento.
- **O número de pílulas à mão é 19 com a minha janela de 3 linhas e 21 com uma de
  5.** Escrevi os dois de propósito: **o teto de D5f tem de nascer do regex do
  próprio dente**, medido por quem o escrever, e não copiado daqui.
- **Não sei se a fila cansa** — isso é a medição do `jogo`, e escrevi em §4.1 a
  forma falsificável da minha afirmação para que o número dele a possa desmentir.
- **Não toquei em `formas.md`, `pauta-desenho.md`, `diario-desenho.md` nem em
  `k4-jogo.md`**, e não escrevi código de produção nem commitei. §7 é texto para
  o `regente` colar.
