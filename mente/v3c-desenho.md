# V3c · o que V3 deixou — especificação de construção (`desenho` → `oficial`)

*25/09/2026, madrugada. A decisão e o porquê estão em `mente/formas.md`, secção
**V3c** (no fim da secção V). O momento — o que o jogador tem de ler e quando — é
do `jogo`, em `mente/v3c-jogo.md`, escrito em paralelo; esta especificação
segue-o e absorveu os pedidos dele (§1 retorno, alinhamento, `onde`, `quem`; §2
a ordem do TEMPO e o céu de cada espera; §3 *guardada* na fonte; §5 o `🔮` que
recusa; §6 os ícones do molde nos saves antigos). Onde divergi, está dito em
`formas.md` §V3c.*

**Figma** (biblioteca `e5wJUzInAssoebx5npssKc`, página `V3 · os ícones`):
`A oferta` (`235:233` — `Largura=Telefone` `235:200`, 86 px; `Largura=Mesa`
`235:217`, 54 px), `Glifo/moeda` (`232:148`), **o par da soleira**
(`236:142`: cinco casos a 375 antes/depois + a mesa com a coluna do dinheiro) e
**o par de O TEMPO** (`233:6484`). O código é o espelho: se divergir, o Figma
ganha.

---

## 0 · A ordem, e o que é obrigatório neste ciclo

| # | script | o quê | obrigatório? |
|---|---|---|---|
| 1 | `1-soleira.cjs` | a soleira: prazo → `janela`, dinheiro → `Glifo/moeda`, retorno = só o dinheiro, Convite, `onde` só se não é aqui, piso de `quem`, retorno que trunca, coluna do dinheiro na mesa | **SIM — o primeiro a construir** |
| 2 | `2-tempo.cjs` | O TEMPO: um glifo só (o céu, `luzDaHora`), hora · data · estação, céu limpo não se escreve, o céu de cada espera, `descanso` no acampamento | **sim** |
| 3 | `3-guardada-e-arco.cjs` | *guardada* Neutra (fonte `📖`); o `🔮` que recusa → `📕`; "Novo arco iniciado" sai; `🆘 🧹 📦 💌 🔦` → trabalho | **sim** |
| 5 | `5-masmorra-acampamento-falas.cjs` | masmorra e acampamento sem emoji do sistema; as 14 falas do jogador sem carimbo | recomendado (pronto e provado; cabe no ciclo) |
| 6 | `6-testes.cjs R 555 150` | as provas: tetos D5h, a asserção de R5d movida com o motivo, `teste-v3-glifos` §10 | **sim** (com o que tiver sido aplicado — ver §3) |
| 7 | `7-seta-do-fim.cjs` | a seta do fim na margem do cartão, com nome e desenhada | opcional (depois do 6) |

**Não há item 4 separado:** o arco vai no script 3. **Os scripts dependem da
ordem 1 → 2 → 3 → 5 → 6 → 7** (o 2 lê a linha de import que o 1 escreve; o 6
insere a §10 antes do fecho do teste; o 7 insere a §11 depois dela).

## 1 · Como aplicar (o `oficial`, com o bastão)

Os scripts estão em
`C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v3c-entrega\`.
Todos usam `comum.cjs` (o de V3b): respeitam o CRLF, trocam por **âncora de
texto exato** e **falham** se a âncora não bate ou aparece um número de vezes
diferente do esperado. **Nenhum muda o número de linhas do `App.jsx`** (24 257
antes e depois — cada script confere e aborta se mudar). De dentro da pasta, com
`R` = a raiz do projeto:

```
node 1-soleira.cjs R
node 2-tempo.cjs R
node 3-guardada-e-arco.cjs R
node 5-masmorra-acampamento-falas.cjs R
node 6-testes.cjs R 555 150
npm run build && npm test
node 7-seta-do-fim.cjs R        # OPCIONAL; build + test outra vez
```

**Provado** numa cópia byte a byte da árvore em `7efd121` (522 arquivos de `src/`
e `testes/` idênticos, conferido): **1→6: `npm run build` limpo, 213/213 suítes,
15/15 varredores**; **1→7: o mesmo**. `teste-v3-glifos` 73 → 98 (→ 99 com o 7).
Os dois números do 6 **reconferem-se no dia**: se a árvore mudou, o
`check-formas` imprime *"desceu — baixe o teto"* com o valor certo, e é esse que
se passa.

## 2 · O que cada script toca — as âncoras, para quem confere

### 1 · a soleira (`glifos.js`, `ui.jsx`, `estilo.js`, `App.jsx`)

- **`glifos.js`** — nascem `partesDaMoeda(texto)` (parte a frase onde está o `◉`:
  `[{moeda:false,texto}, {moeda:true,texto:"140"}, …]`) e
  `retornoDaSoleira({ moedas, xp, item })` (`◉ 140`; sem dinheiro `+94 XP`; o item
  sempre; `null` → `""`). Puros, provados em Node.
- **`ui.jsx`** — nasce **`TextoComMoeda({ texto })`**, depois da `Oferta`: a
  frase com `◉ N` desenha `<Glifo nome="moeda" tamanho={TIPOS.piso} rotulo="moedas" />`
  + espaço inseparável + a quantia, num `whitespace-nowrap` (sem `inline-flex`:
  medido, somava 1 px à linha). Na **`Oferta`**: o preço e o retorno passam por
  ela; a fila da máquina ganha `min-w-0 max-w-full md:shrink-0` (encolhe só no
  telefone) e a variável `--janela-na-mesa`; o retorno ganha `truncate min-w-0`;
  o selo vai numa caixa `shrink-0 whitespace-nowrap flex items-center
  md:min-w-[var(--janela-na-mesa)]` (a caixa `flex` tirou o 1 px que o selo somava);
  sem janela mas com retorno, um lugar vazio `hidden md:block` do mesmo tamanho;
  `quem · onde` ganha `minWidth: SOLEIRA.quemMinimo`. O comentário velho *"O
  RETORNO AINDA NÃO TRUNCA"* é substituído pelo que diz que agora trunca, com a
  medida.
- **`estilo.js`** — `SOLEIRA` ganha `janelaNaMesa: 108` e `quemMinimo: "14ch"`,
  com o porquê.
- **`App.jsx`** (linhas ≈183, 22418–22422, 22567–22574; zero linhas a mais):

| âncora (texto exato) | fica |
|---|---|
| ` import { assuntoDaLinha } from "./glifos.js";` | `… assuntoDaLinha, retornoDaSoleira } …` |
| `preco: m.prazo > 0 ? \`prazo ${m.prazo} noites\` : "",` | `janela: m.prazo > 0 ? { quanto: m.prazo, conta: "noites" } : null,` |
| `preco: c.prazo > 0 ? \`prazo ${c.prazo} noites\` : "",` | idem com `c` |
| `tom: m.prazo > 0 ? "preco" : "convite",` (e o de `c`) | `tom: "convite", /* V3c: … */` |
| `retorno: textoDaPaga(m),` | `retorno: retornoDaSoleira(m.recompensa),` |
| `const paga = [c.paga ? \`◉ ${c.paga}\` : "", rec.xp …].filter(Boolean).join(" · ");` | `const paga = retornoDaSoleira({ moedas: c.paga, xp: rec.xp, item: rec.item });` |
| `onde: c.cidade \|\| "",` | `onde: c.cidade && c.cidade !== cidadeAtualRef.current ? c.cidade : "",` |

`textoDaPaga` (`missoes.js`, território do sistema) **não se toca**: continua a
frase do Diário e do envelope.

### 2 · O TEMPO (`glifos.js`, `App.jsx` ≈183 e 1643–1701, `check-formas`)

- **`glifos.js`** — quatro entradas antes de `ban`: `madrugada` (Lucide sunrise),
  `dia` (sun), `entardecer` (sunset), `noite` (moon), geradas por
  `gerar-luzes.mjs` a partir das fontes do Lucide 1.48.0 (ISC, já no cabeçalho),
  `M` absoluto e sem `m` relativo.
- **`App.jsx`** — `import { luzDaHora } from "./gravura-da-cena.js";` **na mesma
  linha 183**; `⛺ Montar acampamento` → `<Glifo nome="descanso" tamanho={16} />`
  (a linha passa de `block` a `flex items-center gap-2`); cada botão de esperar
  ganha `aria-label={\`Esperar ${h}h, até ${luz}\`}` e o glifo 12 do céu onde se
  acorda por cima do número (`flex flex-col … gap-0.5`, dentro do alvo de 48); a
  linha `📅 … 🌙 …` → `<Glifo nome={luzDaHora(horaTxt(minuto))} tamanho={16}
  rotulo={…} />{hora} · {data} · {estação em minúscula}`; o clima só por palavra, e
  não quando é `ensolarado`.
- **`check-formas` D5h.3** aprende: um glifo de luz é lido quando um `.jsx` desenha
  `<Glifo nome={luzDaHora(`. (Importa `LUZES` de `gravura-da-cena.js`.)

### 3 · guardada, o morto que recusa, o arco (`App.jsx` ≈13774, 18654, 20677–20679; `glifos.js`)

- `${r.acao === "preparou" ? "📖" : "📕"} ${nome}: …` → `📖 ${nome}: …`.
- `texto: \`🔮 ${r.motivo}.\`` (o interrogatório que recusa) → `📕`.
- As três linhas do `trocarArco` (comentário de 2 + o `pushMsgs` do *"⚙ Novo arco
  iniciado"*) → um comentário de 3 linhas que diz porque a fala saiu. **A lógica
  que abre o arco não se toca** (`historiaRef` e a `notaRef` ficam).
- `glifos.js`: o comentário da entrada `📕` diz que ela é só recusa; `🆘 🧹 📦 💌
  🔦` → `trabalho` (os saves antigos).

### 5 · masmorra, acampamento, as falas do jogador (`App.jsx`)

Masmorra (≈23450–23519): `🕳` → glifo `masmorra`; `🕯 N` → `tocha` com
`rotulo="tochas"`; `🗝` → a palavra *chave*; `👁 passiva` → `procurar`; `🔎`,
`🔮`, `↩`, `🏃` saem (o rótulo diz); `"🔒" : "❔"` → `cadeado` / `desconhecido`
(16). Acampamento (≈23531–23693): `⛺` do título sai; o fallback do sítio →
`descanso`; `🩹 Dados de vida` → `vida`; `🩹 Gastar 1` → `Gastar 1`; `✦ Objetos
de poder` → `faisca`; a sintonia `"✦" : "○"` → `IconeCheck` quando sintonizado,
nada quando dormente; `saida(…)` perde o parâmetro `glifo` (as três saídas dizem o
nome). Falas do jogador: 14 linhas perdem o emoji do começo (e o `◉` do decreto
vira *"recompensa de N moedas"*; *"Fugo"* → *"Fujo"*). **O que o Narrador recebe
(`enviar(...)`) não muda uma letra.** O **raid** (≈23396–23435) **fica de fora**:
é o placar de uma luta.

### 6 · as provas

- `check-formas`: D5h.1 **589 → 555**, D5h.2 **156 → 150**, com a data.
- `teste-r2-pecas`: a asserção de R5d *"nenhum min-width"* **muda, com o motivo
  escrito** — o único piso é o de `quem · onde`, sai da tabela, não toca o verbo;
  o `md:min-w` da janela vale só onde a linha não quebra.
- `teste-v3-glifos` **§10** (25 asserções): `partesDaMoeda` e `retornoDaSoleira`
  em Node; `TextoComMoeda` e a `Oferta`; a janela, o retorno, o `onde`; a coluna da
  mesa (`janelaNaMesa ≥ 106,4`, o selo mais largo medido) e o piso de `quem`; as
  quatro luzes lidas pela conta nas 24 horas; a linha do TEMPO, o céu limpo, o
  céu de cada espera, o acampamento; *guardada* Neutra e o morto Impedido; os
  saves antigos; o arco; a masmorra e o acampamento **sem nenhum emoji nem `◉◆✦✧`**
  (o bloco inteiro, sem comentários); nenhuma fala do jogador com carimbo; *fujo*.
  **Provado a morder:** corrida contra a árvore em `7efd121`, **18 das 25**
  reprovam (todas as que leem a tela); as outras 7 provam funções e entradas que
  em `7efd121` nem existem. A §11 (do 7) também reprova contra `7efd121`.
- O **7** acrescenta a §11 (1 asserção).

## 3 · Se não couber tudo

- **Só 1:** aplique `1-soleira.cjs`, depois `6-testes.cjs` **não serve** (a §10
  pede 2, 3 e 5). Nesse caso as provas do 1 são as primeiras doze asserções da
  §10 e a do R5d — **peça-me**, e eu corto o `teste-v3c.txt` ao que foi aplicado.
  Os tetos descem sozinhos: o `check-formas` imprime o número.
- **1–3 sem o 5:** o mesmo — a §10 tem de perder as três asserções do 5 e os
  tetos passam a ser os que o `check-formas` disser.
- O caminho barato é aplicar **1→6 inteiro**: está provado junto.

## 4 · Os números, para o diário

**A soleira** (harness com as peças reais, Chrome headless, fontes da casa; e o
jogo vivo na cópia de prova com o save *noite* de V1, `/api` cortado — **0
pedidos cortados**):

| | antes | depois |
|---|---|---|
| altura de cada oferta a 375 (5 casos) | 86 · 86 · 107 · 86 · 86 | **igual** — nenhuma fila nova |
| soleira fechada a 375 (vivo) | 169 px (medida do `jogo`) | **142 px** |
| largura de `quem` a 375 | até **1 px** (*"a…"*) | **≥ 171 px** |
| fila da máquina a 375 | 315 (cartaz) · 515 (favor) | 127 · 138 |
| retorno além da borda do cartão | até **197 px**, sem reticência | **0** |
| desvio do dinheiro entre as duas ofertas, 1280 (vivo) | 8 px | **0 px** (borda direita a 1047 nas duas) |
| altura a 1280 | 54 | 54 |
| emoji na soleira | `◉` de fonte em cada oferta | **0** |

Contraste sobre `panel`: selo folgado `mundo` **7,94:1** · a apertar `amber`
**9,65:1** · esta noite `onAccent` sobre `danger` **6,59:1** · moeda e retorno
`inkDim` **6,00:1** (todos ≥ 4,5).

**O TEMPO** (vivo, 22:00): a linha **2 filas (40 px) → 1 fila (18 px)** a 375;
`22:00 · 2 de Brumal · primavera` com o céu *noite*; o *"ensolarado"* ao lado da
lua sumiu; **0 emoji no painel** (eram 5); os sete botões de esperar mostram
noite · noite · noite · madrugada · madrugada · dia · noite, sem altura a mais.

**A seta do fim** (vivo): a 375 saiu de x 243–291 para **x 303–351** — sobre a
coluna **48 → 27 px**, e do meio das linhas para o fim delas; a 1280, **0 px**.

**A catraca:** emoji do sistema no `App.jsx` **589 → 555**; `◉ ◆ ✦ ✧` **156 → 150**.

## 5 · O que ficou de fora, e porquê

- **O raid** (`⚡ ☠`, ≈23411–23434): é o placar de uma luta em curso; a tela de
  combate está parada à espera da pessoa (`47:2`), por ordem do coordenador.
- **O clima a substituir o céu** (pedido do `jogo`, §2): pede 4–6 glifos que a
  família não tem; a morada é V4 (a pílula do tempo). Fica a palavra.
- **A dobra a dizer `mais 1 trabalho`** e **o acampamento à frente do cartaz
  quando o herói sangra** (`jogo` §1): são ordem e composição da soleira (a régua
  da fila A de R15), com lógica no `ofertasDaSoleira` e uma prop nova na `Soleira`
  — o momento é do `jogo` e a decisão pede a mesa inteira; não os pus num ciclo
  cujo tema é a forma. **Prontos para a próxima etapa**, e a peça aceita-os sem
  mudar (`Dobra` já tem `singular`/`plural`).
- **`painel-diplomacia`, `painel-guilda`, `painel-talentos`** (os 11 `◉` que D5h.2
  ainda conta fora do `App.jsx`): `TextoComMoeda` já serve; é trabalho do
  `aprendiz`, fora do bastão, noutro ciclo.
- **A tabela `ASSUNTO_DO_EMOJI` para `🏹 🔎 🛡` nos saves antigos** (`jogo` §6):
  têm outros sentidos no `App.jsx`; o resíduo desce com o histórico.
- **O motor que diz *"ensolarado"* às 22:00** continua a pensar errado: pedido ao
  sistema já aberto (V3 §8). A tela deixou de o repetir.

## 6 · A conferência, depois de construído (minha)

Na árvore viva, **aba nova** (HMR mente depois de rename), a 375 e a 1280, pela
árvore de acessibilidade: a soleira com as duas ofertas do save *noite* (nome
`moedas` no glifo, o selo, a coluna do dinheiro), O TEMPO às 22:00 e às 05:10, a
masmorra (se houver save com sala de enigma), o acampamento, e o registo com
*preparada*/*guardada*. Salvar e restaurar os espaços de save antes.
