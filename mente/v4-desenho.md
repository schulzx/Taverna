# V4 · a cinta com os anéis — a construção (`desenho`, 25/09)

A decisão está em `mente/formas.md` §V4; o momento é do `jogo` (`mente/v4-jogo.md`).
Aqui fica **a ordem para o `oficial`**, o que cada script toca, e os números.

## 1 · A ordem — seis scripts, por âncora exata

Pasta: `C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v4-desenho\entrega\`

Todos usam `_arquivo.cjs`, que **tolera LF e CRLF** (as âncoras escrevem-se em
LF; o arquivo grava com o fim de linha que achou) e falha se a âncora não bate ou
é ambígua. **O 5 aborta se o `App.jsx` mudar de número de linhas — no total e em
cada região**: o `check-acoes-do-jogador` lê recusas por linha, e **nenhum dos
endereços se move**. O 5 lê o texto novo da cinta de `5-acinta.txt` (ao lado): é
JSX com crases em comentários, e dentro de um template seria a armadilha da crase.
Só o 5 toca o `App.jsx`: **o bastão é preciso para ele**. De dentro da pasta:

```
node 1-estilo.cjs R
node 2-hora-e-prazo.cjs R
node 3-glifos.cjs R
node 4-ui.cjs R
node 5-app.cjs R
node 6-testes.cjs R        # copia teste-v4-cinta.mjs (ao lado) para testes/
npm run build && npm test
```

**Provado** em duas cópias de `fd6bdb1` — uma em LF (`git -c core.autocrlf=false
archive`, como a árvore de hoje) e uma em CRLF (`core.autocrlf=true`) —: **build
limpo, 215/215 suítes, 15/15 varredores nas duas** (antes: 214/214 · 15/15).
`App.jsx` 24 257 → 24 257 linhas, região a região.

**Commit** (`git commit -- <caminhos>`): `src/App.jsx` `src/estilo.js`
`src/glifos.js` `src/ui.jsx` `src/hora-e-prazo.js` `testes/check-formas.mjs`
`testes/teste-heroi-na-tela.mjs` `testes/teste-palco.mjs` `testes/teste-taro.mjs`
`testes/teste-r13-pecas.mjs` `testes/teste-v5a-cabecalho.mjs`
`testes/teste-v4-cinta.mjs` + `src/constantes.js` (o bump, por último).

## 2 · O que cada script toca

**1 · `estilo.js`** — a `CINTA` ganha as medidas da v3 (`espaco` 8, `respiro` 7,
`perto` 4, `entreRetratos` 18, `separador` 24, `fioDoSeparador` 1,
`entreAnelERotulo` 8, `linhaDoRotulo` 16, `entreContadores` 16,
`entreNumeroEGlifo` 6, `coroa` 16, `glifoDaCoroa` 10, `alvoAlem` 12/8,
`pedidoFresco` 1500, `pilula`, `mesa`, `palavraCurtaAbaixoDe` 360). Nasce **`ANEL`**
(40 · 32 · 28, aro 3, folga 1, sobreposição 8, recorte 2, grave 1/3, cura 400,
aceso 250, perdido 750, alfaParado 0,5, traço 2, barra 0,18, apagado 0,35). A folha:
**`.tv-agonia` passa a 3 pulsos** (`MUDOU_AGORA`) com a cor de `alfa(T.danger, …)`;
nascem `.tv-anel-cresce`, `.tv-anel-clarao`, `.tv-anel-perdido` e a palavra curta
do prazo; o bloco `reduced-motion` ganha as quatro saídas. (Comentários da folha
sem crase — conferido.)

**2 · `hora-e-prazo.js`** — `CONTAS.noites.ultimaCurta = "hoje"`;
`palavraDoPrazo(…, curta = false)`.

**3 · `glifos.js`** — importa `ANEL`; nasce o glifo **`coroa`** (lucide:crown);
nascem `ESTADOS_DO_ANEL`, `estadoDoAnel`, `piorEstado`, `textoDoPV`,
`nomeDoCompanheiro`, `nomeDoCacho`, `quemAbrir`, `repartirACinta` (puros).

**4 · `ui.jsx`** — `Retrato` aceita `anel={null}` (sem aro próprio); `SeloDePrazo`
ganha `escondidoGrave` (o `+N` herda o pior), o pulso ao entrar na última noite e a
palavra curta; nascem **`Anel`**, **`DiscoDoGrupo`**, **`RotuloDoRetrato`**,
**`Contadores`**, **`PilulaDoTempo`**, **`useMesa`**, **`useRepartoDaCinta`**,
**`GrupoNaCinta`**.

**5 · `App.jsx`** (neutro, região a região):
- **A** imports (linhas 55 e 183): `ANEL`; saem `IconeVida`/`IconeMana`; entram as
  peças; `estadoDoAnel` do `glifos.js`.
- **B** (~1372) `CINTA_DESENHA`: saem `rosto`/`trilho`/`fio` (fica
  `transbordoDaMarca`).
- **C** (~1459) sai `BarraDeRecurso` (com o motivo); **`ACinta` reescrita** na
  composição da v3; nasce `focarNoCartao`.
- **D** (~22027) o clarão do bloco (`vidaVistaRef`/`feridaRecente`) sai — a lei
  mudou de casa para o anel —; nasce **`abrirCompanheiro`** (a sala Grupo no cartão
  dele; com a janela de reação aberta não abre).
- **E** (~23136) a chamada: `feridaRecente={…}` → `dia={dia}
  aoAbrirCompanheiro={abrirCompanheiro}`.
- **F** (~3312) o cartão do companheiro na sala Grupo ganha `data-membro`,
  `tabIndex={-1}` e o `ref` que o foca quando o pedido é fresco.

**Não toca** a tela de combate: a cinta não existe na luta (`!emBatalha`), e o
`tv-dano` do combate continua como estava (o anel tem classe própria).

**6 · as suítes** — cada asserção movida leva o motivo:
- `teste-heroi-na-tela` §1 (o clarão, 5 → 6: a lei, agora no anel), §2 (o clarão e a
  agonia no anel; **«a agonia pulsa sem parar» inverteu-se**: 3 vezes e para; com
  `reduce` nada), a barra → o arco, o `semCarta` no `Anel`. 25 passam.
- `teste-palco`: as três da barra mudam de objeto (arco da tabela, PM só quando
  conta, nenhuma barra); a âncora das importações aceita o que vem depois.
- `teste-taro`: a conta dos retratos lê `<Anel ente=` (é o mesmo, com outro
  invólucro); o atalho da ficha procura o `Anel`.
- `teste-r13-pecas`: o contrato do `SeloDePrazo` ganha o quinto campo.
- `check-formas`: `.tv-agonia` sai do livro de perdões de D5c (pagou); o teto de
  literais de `estilo.js` desce 13 → 11 (os dois `rgba` do pulso).
- `teste-v5a-cabecalho` (a minha dívida de V5a): lê sem o CR — numa árvore em CRLF
  falhava 2 asserções, e não era código, era a régua.
- **nova `teste-v4-cinta.mjs` — 59 asserções**: as contas em Node (estados, pior,
  nomes, quem abrir, quem cede nos casos medidos a 375/320/1280), as medidas e os
  pares de cor, o movimento (nada infinito, tudo com saída), a peça e a fiação, e
  os três defeitos do antes.

## 3 · Os números (medidos ao vivo)

Chrome headless, perfil temporário, `/api` cortado (0 pedidos), o save da noite de
V1 com o grupo do `jogo`; `fd6bdb1` na 5181, a cópia com os scripts na 5182. Script
`scratchpad/v4-desenho/medir-v4.mjs` (`antes.json`, `depois.json`, `fotos-*`); o
harness do anel e da pílula em `scratchpad/v4-desenho/harness/` e `pilula.mjs`.

| | antes | depois |
|---|---|---|
| companheiros na tela principal (4, uma a morrer) | **0** | **4** (a 1280, 375, 320); com prazo a 320, 1 + disco `+3`; pior caso, disco `+4` com aro e traço |
| ler o PV do pior | 2 toques + ~600 px | **0** |
| abrir o cartão dele | 2 toques + rolagem | **1** (foco no cartão da Ninha, à vista: y 461 de 812) |
| barra de PV com prazo (375 · 320) | **3 · 0 px** | não existe — é arco |
| animações com `reduce`, herói grave | `tvAgonia:running` | **0** |
| pulso de agonia sem `reduce` | infinito | **3** e repouso (0 a correr aos 4 s) |
| tecla durante os 750 ms da ferida | — | não se perde (`abc`) |
| altura da cinta | 48 · 72 | 48 · 72 |
| topo do campo (375 · 1280 · 320) | 735 · 706 · 623 | **735 · 706 · 623** |
| folga real no pior caso | — | **15 px** a 375 · **4 px** a 320 (com `hoje`) |
| pílula no pior caso (sem glifo) | — | 170 a 375 · 125 a 320 |
| coluna PM/bolsa no telefone | — | **54 px** |

**Contraste** (WCAG 2.1): calma × grave **1,52:1** em cinzento (o ciano da v3,
1,25); arco sobre o trilho `amber` **8,62** · `danger` **5,66**; o traço do
tombado **12,40**; ouro **9,65** e PM **7,84** sobre a cinta; a pílula **7,09**;
o selo cheio `onAccent`/`danger` **6,59**.

## 4 · Figma

- Biblioteca `e5wJUzInAssoebx5npssKc`, página **`V4 · a cinta com os anéis`**
  (`243:73`): `O anel` (`243:149`, 12 variantes), `O disco do grupo` (`243:162`),
  `Os contadores` (`243:177`), `A pílula do tempo` (`243:190`) — cores ligadas a
  `Paleta semantica (T)`; o par antes/depois (jogo vivo) a 1280 (4), 375 (4), 375
  (pior) e 320 (pior).
- Arquivo da pessoa, **`142:2`** (x 8800, abaixo da prova de V5a): o `126:6`
  clonado e a cinta do código a 1280, com os desvios escritos.

## 5 · A conferência depois de construído (minha)

Na árvore viva, **aba nova**, a 375 · 1280 · 320, pela árvore de acessibilidade:
os nomes dos alvos (`A ficha`, `O grupo — Ninha caiu, Tomé em perigo`, `Tomé · 3
de 10 PV`), o toque que abre o Grupo no cartão, a coroa e a marca da porta, a
pílula e os contadores. **Salvar e restaurar os espaços de save antes.**
