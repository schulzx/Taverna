# V3 · os ícones desenhados — especificação de construção (`desenho` → `aprendiz` / `oficial`)

*24–25/09/2026. A decisão e o porquê estão em `mente/formas.md`, secção
**V · a tela da pessoa → V3**. O que cada emoji DIZ a quem joga está em
`mente/v3-jogo.md` (o `jogo`, em paralelo); este arquivo segue-o — onde o censo
dele diz *enfeite*, o emoji sai e a palavra fica; onde diz *gameplay*, entra o
glifo do assunto. Aqui está só o que se constrói, arquivo a arquivo, e o que se
prova.*

**Figma (biblioteca `e5wJUzInAssoebx5npssKc`), página `V3 · os ícones`
(`226:67`):** a família (`226:68`, 37 componentes `Glifo/<nome>`, traço ligado a
`inkDim`, a fase escrita na descrição de cada um), `DegrausDaAmeaca` (`227:162`,
seis variantes `Nivel=0…5`), **o par ANTES / DEPOIS** de quatro peças reais
(`228:67` — a gaveta de `painel-habilidades`, as duas gavetas da luta, o
Bestiário, o trilho) e a gramática (`228:6383`). Na página antiga `Glifos`
(`15:2`), os oito componentes cuja forma passou ao `Glifo` levam na descrição
*"V3: aposentado"* — não se apagou nada. **O código é o espelho: se um `d`
abaixo divergir do Figma, o Figma ganha.**

**V3a está no ar (`afaffd8`, v9.295).** Antes de subir, foi aplicado numa cópia do HEAD `245dd3c` (v9.294) e medido:
`npm run build` limpo; **213/213 suítes verdes** (212 de hoje + `teste-v3-glifos`);
**15/15 varredores**. Os quatro dentes novos foram provados a morder (um emoji
posto de volta, um `aria-label` tirado, uma entrada sem leitor, um glifo pintado
de `T.line` — os quatro reprovam; tirados, volta a verde). Os scripts que o
fizeram estão prontos a correr (§5).

---

## 0 · A divisão, com os números

| | onde | emoji do sistema | ◉ ◆ ✦ ✧ de fonte | quem |
|---|---|---|---|---|
| **V3a** (agora) | os 13 `.jsx` fora do `App.jsx` + `ui.jsx` + `glifos.js` (novo) | **101 → 0** | **23 → 11** (os 11 são `◉` dentro de frase: V3b) | `aprendiz` |
| **V3b** (com o bastão) | `App.jsx` | 595 (112 distintos) — congelado, só desce | 162 — congelado | `oficial` |
| fora de V3 | os módulos `src/*.js` | 841 — conteúdo e território do sistema; impresso, não é dente | — | V3b traduz-os no ecrã, sem os tocar |

Distintos na interface inteira: **126 → 112**. Nas telas a um toque da mesa
(as abas de topo, a gaveta, a ficha, o mapa, a planta, a grelha da batalha):
**zero emoji do sistema**.

---

## 1 · `src/glifos.js` — NOVO: a tabela

É gerado, não escrito à mão: `node gerar-glifos.mjs <raiz>/src/glifos.js`, de
dentro de `v3a-entrega/` (§5). O script lê as fontes do **Lucide 1.48.0** (ISC,
em `v3a-entrega/lucide/`) e os três desenhos da casa, e escreve:

- o cabeçalho com a lei, a gramática e **a licença ISC do Lucide por inteiro**;
- `TRACO_DO_GLIFO = { 12: 1.25, 16: 1.5, 20: 1.75, 24: 2 }` (px de tela);
- `tracoDoGlifo(tamanho)` (interpola, prende nas pontas, aguenta lixo) e
  `tracoNaGrelha(tamanho)` (o `strokeWidth` em unidades da grelha);
- `GLIFOS = { nome: { de, d } }`, **16 entradas**:

| nome | origem | o assunto (um só) | aposenta | leitores em V3a |
|---|---|---|---|---|
| `dado` | casa (d20) | o dado: teste, rolagem, sorteio | `🎲`, e o d6 de `IconeDado` | `IconeD20`, `IconeDado`, ascensão (*Encarar*), o rastro da luta |
| `mapa` | `compass` | para onde vou: o Mapa, viajar, a estrada | `🧭` `🗺` | `IconeMapa`, `IconeBussola`, `painel-mapa` ×2 |
| `bolsa` | `wallet-minimal` | a bolsa | `◆` quando dizia bolsa | `IconeMochila`, a bolsa da luta |
| `diario` | `book-open` | o Diário, o *anteriormente* | `📜` da aba | `IconeLivro` |
| `grupo` | `users-round` | o grupo | `👥` `🚶` | `IconeDois`, `painel-mapa` (*anda contigo*) |
| `ascensao` | casa | a Ascensão | `🌟`, e o losango (era o do PM) | `IconeLosango`, ascensão, ficha |
| `alfinete` | `map-pin` | onde estou | `📍` | `IconeAlfinete`, mapa ×4, planta ×4 |
| `aviso` | `triangle-alert` | aviso — reaja | `⚠`, e o `⚔` da guerra política | `IconeAviso`, ascensão, ficha, guilda ×3 |
| `cadeado` | `lock` | trancado até… | `🔒` | gaveta, ascensão, talentos |
| `desconhecido` | `circle-help` | o que ainda não viste | `❔` | Códex ×2 |
| `faisca` | `sparkles` | a magia | `✦` `✧` `✨`, o `📖` do caderno | `IconeFaiscas`, gaveta ×3, ficha, luta ×3 |
| `espadas` | `swords` | o golpe, o dano | `⚔` `⚡` `💢` | luta ×2, grelha ×2 |
| `espada` | `sword` | a arma (só onde `IconeEspada` já está) | — | `IconeEspada` |
| `passo` | `footprints` | o movimento que resta na rodada | `👣` | grelha ×2 |
| `masmorra` | casa | a boca de uma masmorra | `🕳` | `painel-mapa` |
| `relogio` | `clock` | o tempo que passa: recarga, ritual | `⏳` quando não é prazo | gaveta ×4 |

Os quatro da cinta **não** entram na tabela (têm forma desde R13, quadro 12,
miolo cheio): `moeda` → `IconeBolsa`, `mana` → `IconeMana`, `vida` →
`IconeVida`, `ampulheta` → `IconeAmpulheta`. O `Glifo` pede-os pelo nome.

**O d20.** A casa desenha 12 das 18 arestas de um icosaedro projetado pelo eixo
de uma face: a silhueta (hexágono regular de raio 10), a face da frente
(raio 10/φ = 6,18 — a razão do sólido verdadeiro) e as três arestas que a
prendem aos vértices mais próximos. Todas as 18 davam **74 % de tinta a 16 px**
(a família anda nos 40–50 %) e viravam mancha; as 12 dão **58 %**. As 18 ficam
no Figma como `Glifo/dado · cheio` para ≥ 40 px (V6 e a proposta ambiciosa).
**O dado nunca desce abaixo de 14 px.**

## 2 · `src/ui.jsx`

1. `import { GLIFOS, tracoNaGrelha } from "./glifos.js";` logo abaixo do import
   de `estilo.js`.
2. **Nasce `Glifo({ nome, tamanho = 16, cor = "currentColor", rotulo, fracao })`**
   e **`DegrausDaAmeaca({ nivel = 0, de = 5, tamanho = 16, cor = "currentColor", rotulo })`**,
   num bloco novo logo antes de `OS ÍCONES DO MENU (v9.169)` (o texto inteiro,
   com o comentário que diz as três leis, está em `v3a-ui.cjs`).
   - sem `rotulo`: `aria-hidden="true"`; com `rotulo`: `role="img"` + `aria-label`;
   - `svg` 24×24, `fill="none"`, `stroke={cor}`, `strokeWidth={tracoNaGrelha(tamanho)}`,
     ponta e junta redondas, `focusable="false"`, `style` em linha
     (`display: inline-block; vertical-align: -0.15em; flex-shrink: 0`);
   - `DegrausDaAmeaca`: cinco barras que sobem; a cheia pinta com `cor`, **a
     vazia é oca** (contorno `T.lineStrong`, 1 px) — `inkDim` contra `lineStrong`
     separa só 1,54:1 de luz, então cheia × vazia tem de ser forma, não cor.
3. **Doze `Icone*` passam a pedir a forma** — a assinatura fica exactamente como
   está (quem chama no `App.jsx` continua a compilar e a ver a mesma cor), o
   corpo passa a ser uma linha: `return <Glifo nome="…" tamanho={tamanho} cor={cor} />;`

   | `Icone*` | → | efeito na tela sem tocar no `App.jsx` |
   |---|---|---|
   | `IconeD20` | `dado` | a espera do Mestre e o "Escrevendo sua lenda" ganham o d20 verdadeiro |
   | `IconeDado` | `dado` | **o d6 morre**: o sorteio do nome e o menu *Uma Noite* mostram o d20 |
   | `IconeLivro` | `diario` | a aba Diário e o *"Anteriormente"* do menu |
   | `IconeMochila` | `bolsa` | a aba Bolsa (a carteira da v3) |
   | `IconeMapa` | `mapa` | a aba Mapa vira a bússola da v3 |
   | `IconeBussola` | `mapa` | o género *Steampunk* deixa de ser um círculo pelado (veio quebrado do Figma em v9.173) |
   | `IconeLosango` | `ascensao` | a aba Ascensão deixa o losango do PM |
   | `IconeAviso` | `aviso` | o aviso do menu passa ao triângulo |
   | `IconeAlfinete` | `alfinete` | o momento *lugar novo* |
   | `IconeDois` | `grupo` | *Jogar em dois* |
   | `IconeEspada` | `espada` | a mesma espada, no traço da família |
   | `IconeFaiscas` | `faisca` | a mesma forma (`sparkles`), no traço da família |

   **Não delegam, e é de propósito:** `IconeCaveira` (é também o género
   *Pós-apocalíptico*; sai da aba Códex em V3b pelo lado do `App.jsx`), os
   quatro da cinta (R13, `teste-r13-pecas` §8 prende a assinatura), e os que não
   são desta etapa (`IconeSeta`, `IconeCaneca`, `IconeEscudo*`, os do menu…).

## 3 · Os painéis — o que muda, arquivo a arquivo

A âncora exacta de cada troca está em `v3a-paineis.cjs` (falha se não bate ou é
ambígua). O resumo, para quem confere:

| arquivo | antes → depois | o que muda |
|---|---|---|
| `painel-codex` | 26 → 0 | os 15 contadores e as 3 linhas do *Mundo* perdem o emoji (a palavra fica); a sub-aba `📜 Crônica` → `Crônica`; o título secreto e a criatura não vista → `desconhecido` 18 px com rótulo; **a ameaça do Bestiário: os cinco animais → `DegrausDaAmeaca`**, com a tabela `DEGRAU_DA_AMEACA` (fraco 1 … lendário 5) e `corDaAmeaca` (a cor que a palavra já tinha, agora num sítio só); `👹` sem ameaça → lugar vazio de 18; `📜`/`💾` dos dois botões de exportar saem |
| `painel-habilidades` | 13 → 0 | recarga `⏳` → `relogio` 12; o `📕 guardada` → `guardada`; o selo `📖` "do caderno" sai; **a pílula preparada leva `IconeCheck` (cheia + marca, `v3-jogo` §5) e a guardada nada**; o ritual `⏳` → `relogio` com rótulo *ritual*; `📖 Magias na cabeça` → `faisca` + palavra; `🔒` → `cadeado`; a frase de ajuda desenha os mesmos glifos que descreve |
| `painel-mapa` | 13 → 0 | onde estou: estrada `mapa` · masmorra `masmorra` · lugar `alfinete`; *Viajar para* leva `mapa`; `📍` → `alfinete` (com rótulo quando é a única marca); `🚶` → `grupo` rotulado *anda contigo*; as abas `🌍 🏘 🏳 🙏` e o `🌫` perdem o emoji |
| `planta-cidade` | 4 → 0 | `📍` → `alfinete` (com rótulo *você está aqui*) |
| `painel-ascensao` | 11 → 0 | *Despertar* e o título → `ascensao`; *Encarar* → `dado`; `🔒` → `cadeado`; `⚠ Imune` → `aviso`; `⚖ ⚱ 🌌 🙏` saem |
| `painel-ficha` | 9 → 0 | o título divino → `ascensao`; *Fôlego* e *cicatrizes* → `vida` (R13); `⚠` → `aviso` em `danger`; o efeito `✦` → `faisca`; `◉ moedas` → `moeda`; `🧠 📣` e **os encaixes `⚔ 🛡 🧥 ◆`** saem (o nome do item diz o que é — `v3-jogo` §2) |
| `painel-guilda` | 6 → 0 | `⚔ em guerra` e *A casa está em guerra* → `aviso` (a guerra política deixa de ser espadas — `v3-jogo` §2); `⚠ faltas` → `aviso`; `◉` do cofre, do saque e da paga → `moeda`; `✋ 🕊 ✍` saem (é a voz do jogador) |
| `painel-batalha` | 5 → 0 | **as duas gavetas: `✦` → `faisca` 20 e `◆` → `bolsa` 20** (o `◆` é o PM — a bolsa tinha a cara da mana), com `aria-label` e `minWidth: ALVOS.piso`; o `chip(ativo, glifo, rotulo)` ganha o glifo do assunto (`espadas` na ação, `faisca` na extra); o rastro `🎲` → `dado` 14 |
| `painel-diario` | 4 → 0 | o prazo `⏳` → `ampulheta` (R13; a peça inteira `SeloDePrazo` pede ao sistema os números — §7); `▶ Agora` → `› Agora` (o `›` está no subconjunto que a fonte serve); `🌍 🌱` saem |
| `painel-diplomacia` | 3 → 0 | as quatro propostas perdem `◉ 🤝 ♜ ⚔` (a palavra diz; a guerra já é `danger`); `🎁 presentear` → `presentear` |
| `painel-talentos` | 2 → 0 | `🔒` → `cadeado`; `⚔ Abrir … segunda classe` perde o `⚔` (a classe não é luta) |
| `painel-heroismo` | 1 → 0 | `📜 Declarar` → `Declarar` |
| `grade-de-batalha` | 4 → 0 | `⚡ sair custa um golpe livre` → `espadas` (é dano); `👣` ×2 → `passo`; `💢` (a área apanha aliados) → `espadas` rotulado *atinge aliados* |

Os `import` que cada arquivo ganha também estão no script (`Glifo` de `./ui.jsx`;
o Códex leva `DegrausDaAmeaca`; a gaveta leva `IconeCheck`).

## 4 · As provas

1. **`testes/check-formas.mjs` — secção 8, D5h** (texto inteiro em `d5h.txt`):
   - **D5h.1** — emoji do sistema (`\p{Extended_Pictographic}`, sem © ® ™) por
     `.jsx`: **só desce**. Teto: `src/App.jsx: 595`; qualquer outro arquivo, zero.
   - **D5h.2** — `◉ ◆ ✦ ✧` de fonte por `.jsx`, só desce. Tetos: `App.jsx 162`,
     `painel-diplomacia 2`, `painel-guilda 3`, `painel-talentos 6`.
   - **D5h.3** — cada entrada de `GLIFOS` tem leitor num `.jsx` que desenha com `Glifo`.
   - **D5h.4** — `<Glifo cor={T.x}>` só com tintas (nunca `line`/`panel`/`bg`/`pagina`).
   - **D5h.5** — botão cujo conteúdo é só um `Glifo` tem `aria-label`.
   - Imprime, sem dente, os 841 emoji dos módulos `src/*.js`.
   - **O teto do `App.jsx` reconta-se no dia**: 595 é HEAD `245dd3c`. Se o
     `orquestrador` tiver mexido, o dente diz o número — escreva-o com a data.
2. **`testes/teste-diplomacia.mjs`** — a asserção *"o botão do presente diz o
   preço"* deixa de exigir o `🎁`, **com o motivo escrito** (lei da casa); o que
   ela guarda — o preço visível — fica.
3. **`testes/teste-v3-glifos.mjs`** — NOVA, 40 asserções: a tabela (M absoluto,
   sem `m` relativo — foi o defeito que apareceu ao juntar paths do Lucide; tudo
   dentro da grelha); o traço; **o d20 provado como geometria** (hexágono
   regular, face equilátera concêntrica, razão 1/φ, 12 arestas e todas entre as
   18 verdadeiras); o `Glifo` e as suas três leis; os 12 `Icone*` que delegam;
   os 13 arquivos a zero; o Bestiário por tabela; as gavetas da luta com nome e 48.

## 5 · Como aplicar (o `aprendiz`)

Os scripts estão em
`C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v3a-entrega\`
(a referência completa em diff é `v3a.patch`, no mesmo sítio). Todos respeitam o
CRLF da árvore e **falham se a âncora não bate**. De dentro dessa pasta, com `R`
= a raiz do projeto:

```
node gerar-glifos.mjs R/src/glifos.js
node v3a-ui.cjs R/src/ui.jsx
node v3a-paineis.cjs R/src
node v3a-testes.cjs R
```

Depois: `npm run build` → `npm test` → a conferência (§6). Provado numa cópia do
HEAD `245dd3c` com os arquivos em CRLF: build limpo, 213/213, 15/15. **Nenhum
destes arquivos é tocado pelo `App.jsx`** — não precisa do bastão.

## 6 · A conferência no navegador (minha, depois de construído)

Medido num harness com as peças reais (Vite, Chromium 152, Windows 11):
- as gavetas da luta: **34,6 × 48 → 48 × 48** (`✦`) e 48,4 → 56,2 (`◆ 3`); as
  duas passam a ter nome (`aria-label`) em vez de só `title`;
- todos os glifos da família saem `aria-hidden` e com `stroke=currentColor`
  (a cor da letra, que é de `T`);
- a tinta do d20: 58 % a 16 px (as 18 arestas davam 74 %).

Depois de construído confiro na árvore viva: a gaveta (preparada/guardada/ritual/
trancado), o Bestiário, o mapa e a planta, a ficha, a luta (as duas gavetas e a
tira), e o trilho — a 1280 e a 375, a árvore de acessibilidade e não a foto.

## 7 · V3b — a ordem de construção do `oficial` (com o bastão)

*Reescrita a 25/09 para o `oficial` executar. **Provado contra o HEAD real
`afaffd8`** (V3a no ar, v9.295): os passos 1→4 aplicados por script,
`npm run build` limpo, **213/213 suítes, 15/15 varredores**; e o mesmo com o
passo 5 (V3c) por cima. **Nenhum script muda o número de linhas do `App.jsx`**
(24 257 antes e depois): `check-acoes-do-jogador` endereça ~90 recusas por
número de linha, e a primeira versão, com +22 linhas, partia 89 endereços.*

**Os scripts:**
`C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v3b-entrega\`.
Todos usam `comum.cjs`: respeitam o CRLF, trocam por **âncora de texto exacto**
e **falham** se a âncora não bate ou aparece um número de vezes diferente do
esperado. De dentro da pasta, com `R` = a raiz do projecto e **o bastão na mão**:

```
node 1-pecas.cjs R        # glifos.js + estilo.js + ui.jsx (as peças)
node 2-app.cjs R          # App.jsx, itens 1–5
node 3-v1b.cjs R          # V1b: App.jsx, painel-alforje.jsx, estilo.js e duas suítes
node 4-testes.cjs R 589 156 75   # as provas; os três números: ver 7.4
npm run build && npm test
node 5-v3c-trilho.cjs R   # OPCIONAL (V3c, item 6) — só se houver tempo; build + test outra vez
```

### 7.0 · A prioridade

| | item | obrigatório neste ciclo? |
|---|---|---|
| 1 | as falas do sistema (`BlocoSistema`) → o ladrilho do assunto | **sim** — *todo turno; 296 falas por um sítio só* |
| 2 | a voz (`🔊`/`⏸`) | **sim** — *uma vez por mensagem, o glifo mais repetido do ecrã* |
| 3 | os chips do estado vivo | **sim** — *distingue o que te ajuda do que te pesa* |
| 4 | o teste pendente (as duas telas) | **sim** — *o veredito antes do clique* |
| 5 | a gaveta da mesa, a habilidade armada, a espera, o "não guardou" | **sim** |
| V1b | o contorno separa-se do controlo, `paginaFio` aposenta-se, o comentário, o "Continuar aventura" | **sim** |
| 6 | o trilho: Gestão → `heroi`, Códex → `codice` | V3c — **script pronto e provado** (`5-v3c-trilho.cjs`); cabe se sobrar meia hora |
| 7 | O TEMPO (`⛺`, e a linha `📅 … 🌙 …` → um glifo só, o céu) | V3c — âncoras em 7.6, sem script |
| 8 | masmorra, acampamento, raid; as falas do jogador sem carimbo | V3c — âncoras em 7.6, sem script |

### 7.1 · As peças (`1-pecas.cjs`) — fora do `App.jsx`

**`src/glifos.js`** — é a tabela da nossa peça, irmã de `estilo.js`; o assunto
mora aqui e não num módulo novo de `src/*.js` (território do sistema: decisão do
`regente`, 25/09). Ganha:
- **13 glifos** depois de `relogio` (texto em `entradas.txt`, Lucide 1.48.0):
  `escudo` · `essencia` · `descanso` · `perigo` · `procurar` · `trabalho` ·
  `tocha` · `heroi` · `trofeu` · `favor` · `contra` · `ouvir` · `pausa`.
  **Cada um tem leitor no mesmo commit** (D5h.3): `ouvir`/`pausa`/`favor`/`contra`
  directamente no `App.jsx`; os outros pela tabela do assunto, que o
  `BlocoSistema` desenha. `codice` só entra com o item 6.
- **`ASSUNTO_DO_EMOJI`** (~110 prefixos → glifo, `IMPEDIDO`, `impedidoCom(glifo)`
  ou `null`) e **`assuntoDaLinha(texto) → { glifo, tom, resto }`**, puro, provado
  em Node (texto inteiro em `assunto.txt`). `⛔`/`🚫` → tom Impedido sem glifo;
  `📕`/`🐾` → Impedido com `faisca`; `⛓` → Impedido com `cadeado`. Um prefixo
  desconhecido sai na mesma (a linha nunca mostra emoji), mas a suíte recusa-o
  até ter decisão.

**`src/estilo.js`** — `export const LADRILHO = { lado: 36, glifo: 16, raio: 12, espaco: 12 }`, logo depois de `ALVOS`.

**`src/ui.jsx`** — `export function LadrilhoDoAssunto({ glifo, tom = "neutro" })`
antes dos ícones do menu; importa `LADRILHO`. A forma está em `formas.md` §V3b.

### 7.2 · O `App.jsx` (`2-app.cjs`) — as âncoras, conferidas em `afaffd8`

| # | âncora (texto exacto, ≈linha) | fica |
|---|---|---|
| 0 | `SinalDeGuardado, MarcaDaPorta, RostoDaCena } from "./ui.jsx";` (183) | `…, MarcaDaPorta, Glifo, LadrilhoDoAssunto, RostoDaCena } from "./ui.jsx"; import { assuntoDaLinha } from "./glifos.js";` — **na mesma linha**, e `RostoDaCena` fica o último (`teste-palco` lê-o assim) |
| 0 | `import { FOLHA, TIPOS, ALVOS, CINTA, VEU, ESBATIMENTO } from "./estilo.js";` (55) | `+ LADRILHO` (e `alfa` no passo 3) |
| 1 | o comentário `/* R3: as três cores saíram da MESA…` **até** o fim do `return` do `BlocoSistema` (3825–3880, 56 linhas; em `bloco-velho.txt`) | `bloco-novo.txt`, **56 linhas**: `const linha = …` com `assuntoDaLinha(semSetaQueMente(bruto))`, `LadrilhoDoAssunto`, a porta como botão a `ALVOS.piso` com `IconeSeta` no fim, o saldo e as linhas dobradas também traduzidos |
| 2 | `{voz && voz.i === i ? (voz.status === "gerando" ? "…" : "⏸") : "🔊"}</span>}` (23327) | `<Glifo nome="pausa" tamanho={14} />` / `<Glifo nome="ouvir" tamanho={14} />` |
| 3 | `      texto: (c.icone \|\| (c.tipo === "bom" ? "✦" : "☠")) + " " + c.nome + …,` (1394) | `glifo: c.tipo === "bom" ? "favor" : "contra", texto: c.nome + …,` (uma linha) |
| 3 | `      texto: "✧ " + e.nome + …,` (1400) | `glifo: "faisca", texto: e.nome + …,` |
| 3 | `fontWeight: 600,⏎              }}>{c.texto}</span>` (1603) | `+ display: "inline-flex", alignItems: "center", gap: 4` e `{c.glifo ? <Glifo nome={c.glifo} tamanho={12} /> : null}{c.texto}` |
| 4 | `…style={{ color: T.ink }}>🎲 Teste de {rolagem.rotulo` (**2×**: 23029, 24123) | `<Glifo nome="dado" tamanho={16} /> Teste de …` |
| 4 | `<span style={{ color: T.violetSoft }}> · ✦ {rolagem.porVantagem}</span>` | `· <Glifo nome="faisca" tamanho={12} /> …` |
| 5 | `aria-pressed={habAbertas} aria-label="Habilidades" title="Habilidades"` | o nome diz as armadas: `` `Habilidades, ${n} armada(s)` `` |
| 5 | `}}>✦{habsSel.length > 0 ? ` ${habsSel.length}` : ""}</button>` (24107) | `<Glifo nome="faisca" tamanho={20} />` + o número num `<span className="ml-1">` |
| 5 | `…>✦ {h.nome} · {h.custo} PM</span>` (23384) | `<Glifo nome="faisca" tamanho={12} />{h.nome} · {h.custo} PM` |
| 5 | `✦ As duas ações saíram — o Mestre está tecendo o turno.` (23905) | sem o `✦` (não é magia; a frase diz) |
| 5 | `}}>⚠ não guardou</span>` (1629) | `<Glifo nome="aviso" tamanho={12} /> não guardou` |

### 7.3 · V1b (`3-v1b.cjs`)

| onde | antes | depois |
|---|---|---|
| `App.jsx` — o cartão da história (≈23231) | `border: 1px solid ${T.paginaFio}` | `T.line` (decorativo: um contentor de prosa não é componente) |
| `App.jsx` — a régua da fala do jogador (≈23301) | `esperaResposta ? T.amber : T.paginaFio` | `… : T.line` |
| `App.jsx` — o botão flutuante "ir para a última" (≈23750) | `T.paginaFio` | **`T.lineStrong`** (é controlo; 4,29:1 sobre o poço) |
| `App.jsx` — o comentário "a narração é a única coisa QUENTE" (23213–23218) | falso desde V1 | reescrito, **6 linhas → 6 linhas** |
| `App.jsx` — **"Continuar aventura"** (≈5057) | borda `T.danger`, brilho `rgba(216,106,91,0.15)` (o danger de R2) | borda **`T.rosa`** (5,78:1 sobre `panel`), brilho `` `${alfa(T.rosa, 0.15)}` ``, e o ponto aceso `<PontoAtivo … cor={T.rosa} />` |
| `painel-alforje.jsx:75` | `T.paginaFio` | `T.line` |
| `estilo.js` | `paginaFio: "#695DA4"` | **aposentado** (a linha sai, fica o comentário); **`alfa` passa a `export`** (era privada; o brilho da rosa precisava dela) |
| `teste-v1-folha` asserção 6 | `paginaFio !== line` | `T.paginaFio === undefined` + **`alfa(T.rosa, 0.15) === "rgba(241,91,181,0.15)"`** (o 2.º leitor de `alfa`); nos pares, `paginaFio×bg/pagina` → `lineStrong×pagina` — **com o motivo escrito** |
| `teste-r3-campo-do-turno` | "a narração usa a superfície quente" pedia `paginaFio` | pede `T.line`, **com o motivo** |

*Não entra em V1b:* a aba activa do trilho em `T.rosa` (`v1-desenho.md` §10.2) — é
V7 (o trilho novo); pô-la agora seria desenhar a fita duas vezes.

### 7.4 · As provas (`4-testes.cjs`) — e os números que descem

| dente | antes (`afaffd8`) | depois de V3b | porquê |
|---|---|---|---|
| D5h.1 — emoji do sistema no `App.jsx` | 595 | **589** | voz 2, teste 2, chips 1 (`☠`), não guardou 1 |
| D5h.2 — `◉ ◆ ✦ ✧` no `App.jsx` | 162 | **156** | a gaveta, a armada, a espera, a vantagem, e o `✦`/`✧` dos chips |
| D5a — literais de cor no `App.jsx` | 76 | **75** | o brilho `rgba(216,106,91,0.15)` do "Continuar aventura" |
| D5h.3 | — | **aprende a ler a tabela**: um glifo que só `ASSUNTO_DO_EMOJI` nomeia conta como lido quando algum `.jsx` chama `assuntoDaLinha` | sem isto, `essencia`, `procurar`, `trabalho` e `trofeu` reprovavam |

**Os números reconferem-se no dia**: se o `App.jsx` mudou entre `afaffd8` e a
aplicação, `check-formas` imprime *"desceu — baixe o teto"* com o valor certo, e
é esse que se passa ao `4-testes.cjs`.

**Duas asserções mudam com o motivo escrito:** `teste-palco` (o nome da gaveta
passou a dizer quantas estão armadas) e `teste-r3-campo-do-turno` (a porta deixou
de ser pílula e passou a linha-botão; o alvo continua `ALVOS.piso`).

**`teste-v3-glifos` ganha §6 e §7 (23 asserções; 63 no total):** todo assunto da
tabela é um glifo que existe; **todo emoji que abre uma frase em `src/` tem uma
decisão na tabela** (a catraca do prefixo); os casos de `assuntoDaLinha` (`⛔`,
`🧭`, `⚠️` com variação, `📕` Impedido com assunto, `⚖` que sai, o desconhecido,
a linha sem emoji, o `✦` de fonte, `null`, o emoji a meio que não se toca); e na
tela: `LADRILHO` 36/16/12/12, as duas formas do ladrilho, o `BlocoSistema` a
traduzir, a porta a `ALVOS.piso` com a seta, **nenhum `rounded-full` no
`BlocoSistema`**, a voz, os chips, o teste nas duas telas, a gaveta com o número
no nome, o "não guardou", e a peça a morar em `ui.jsx`. O passo 5 acrescenta §8.

### 7.5 · O Figma

`O ladrilho do assunto` (`229:125`, cinco variantes: *Neutro* · *Impedido* ·
*Impedido com assunto* · *Porta* · *Sem assunto*) e **o par antes/depois de
falas reais do `BlocoSistema`** (`230:125`: `🧭 Chegada…`, `⛔ Bola de Fogo…`,
`⚗ +3 de essência…`, `▸ Mercado…`, e a dobra `⚔ 3 golpes · 🎲 2 rolagens`), na
página `V3 · os ícones`. A variável `paginaFio` leva na descrição *"aposentado em
V1b"* (fica para os ANTES).

### 7.6 · V3c — as âncoras (sem script)

- **O TEMPO** (`App.jsx` ≈1670): `⛺ Montar acampamento` → `<Glifo nome="descanso" tamanho={16} />`.
  ≈1699–1700: `📅 {dataTxt(dia)} · {horaTxt(minuto)}{ehNoite(minuto) ? " 🌙" : ""}{est ? " " + est.icone + " " + est.nome : ""}`
  e `{clima.icone} {clima.rotulo}` → **um glifo só, o céu**: `luzDaHora(hora)`
  (já exportada por `gravura-da-cena.js`) escolhe `madrugada|dia|entardecer|noite`
  (os quatro entram em `GLIFOS` com este leitor), e o `📅`, o `🌙`, o `est.icone`
  e o `clima.icone` saem — ficam as palavras. É o começo de V4 (a pílula do tempo).
- **Masmorra** (≈23450–23519): `🕳 {masmorra.nome}` → `masmorra`; `🕯 {masmorra.tochas}` → `tocha`;
  `🗝` → `masmorra` com rótulo *chave*; `👁 passiva` e `🔎 Procurar nesta sala` → `procurar`;
  `🔮 Tentar` → `faisca`; `"🔒" : "❔"` → `cadeado` / `desconhecido`; `↩ voltar` → `IconeSetaEsq`.
- **Acampamento** (≈23531–23693: `⛺`, `🩹`, `✦ Objetos de poder`, as três saídas `🌙🔥🎒`) e **raid** (≈23407–23434: `⚡`, `☠`).
- **As falas do jogador sem carimbo** (`📜 Declaro` ≈16563, `🎲 Peço um teste` ≈17707,
  `📋 Pego o cartaz` ≈19584, `🏃 Fugo de` ≈19431): o emoji sai da frase **dele**.
  *Atenção:* aí sim mexe-se no texto que o Narrador recebe — é uma linha de
  `pushMsgs` com `autor: "jogador"`, e `check-acoes-do-jogador` endereça algumas.

**Um pedido ao sistema, leve, para V3c:** `missoes.js` expor as noites que
faltam de um prazo, para o Diário desenhar a peça inteira `SeloDePrazo` em vez
de só a ampulheta.

## 8 · O que NÃO muda e ninguém deve "consertar"

- Os `★` (treino, título equipado, a sede da cidade) ficam: o `jogo` conta-os
  como o canal do treino, e não são desta etapa.
- Os ícones de CONTEÚDO nos painéis — os títulos do Códex (`c.icone`), os
  templos, os cómodos — ficam: são a identidade de uma coisa do mundo, vêm das
  tabelas do motor e voltam quando a pessoa redesenhar essas telas (V·Códex, V·Mapa).
- `IconeCaveira`, os quatro da cinta, `IconeCheck`, `IconeSeta*`, os do menu que
  não têm par: ficam como estão.
- O `◉` dentro de frases (diplomacia, guilda, talentos, e 162 no `App.jsx`):
  congelado por D5h.2, paga-se em V3b.
