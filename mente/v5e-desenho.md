# V5e · a resposta chega pelo começo — a construção (`desenho`, 28/09)

A decisão está em `mente/formas.md` §V5e; o momento é do `jogo` (`mente/v5e-jogo.md`).
Aqui fica **a ordem para o `oficial`**, o que cada script toca, a prova e os números.

## 1 · A ordem — cinco scripts, e um sexto opcional

Pasta: `C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v5e-desenho\entrega\`

Todos usam `_arquivo.cjs`, que **aceita LF e CRLF** (as âncoras se escrevem em LF;
grava com o fim de linha que achou) e falha se a âncora não bate ou é ambígua. Os
trechos longos moram em `.txt` ao lado (`2-glifos.txt`, `3-pecas.txt`,
`5-chegada.txt`), sem crase escapada. Só o 5 toca o `App.jsx`: **o bastão é preciso
para ele**. De dentro da pasta, com `R` = a raiz do projeto:

```
node 1-estilo.cjs R
node 2-glifos.cjs R
node 3-ui.cjs R
node 5-app.cjs R
node 6-testes.cjs R        # copia teste-v5e-chegada.mjs (ao lado) para testes/
npm run build && npm test
# e SÓ se o `jogo` der o veredito da cerimônia (mente/v5e-jogo.md §4):
node 7-acender.cjs R
npm run build && npm test
```

(Não há 4.) **O 7 é um commit à parte**: religa `ABERTURA.acesa` e troca a asserção
irmã de `teste-v5-pagina` com o motivo. Desfazê-lo é reverter só ele.

**As linhas do `App.jsx`.** 24 315 → 24 442. Antes da linha **22 489** (o último
endereço que o `check-acoes-do-jogador` lê) há só **10 trocas na mesma linha** (os
imports, o efeito das mensagens, `aoRolar`, a seta do fim, a entrada no jogo); o 5
**confere** que o trecho da linha 22 489 continua na 22 489, e aborta se não.
**0 endereços mexidos.**

**Provado** em duas cópias de `c5acc8c` — LF (`git -c core.autocrlf=false archive`)
e CRLF (`core.autocrlf=true`) —: **build limpo, 217/217 suítes, 15/15 varredores nas
duas**. Também com o 7 (cópia LF): 217/217 · 15/15. (Numa das corridas com o 7, a
`teste-sala` caiu uma vez com a máquina carregada e passou sozinha e na corrida
seguinte: é a da rede da sala, não é desta etapa.)

**Commit** (`git commit -- <caminhos>`): `src/App.jsx` `src/estilo.js` `src/glifos.js`
`src/ui.jsx` `src/painel-alforje.jsx` `testes/teste-r3-campo-do-turno.mjs`
`testes/teste-v3-glifos.mjs` `testes/teste-v5-pagina.mjs` `testes/check-formas.mjs`
`testes/teste-v5e-chegada.mjs` + `src/constantes.js` (o bump, por último). O 7:
`src/estilo.js` `testes/teste-v5-pagina.mjs` + o bump.

## 2 · O que cada script toca

- **1-estilo.cjs** — `CHEGADA` (`toleranciaDoFim: 0.25`), `SETA_DA_LEITURA` (18 do
  fundo; a sombra `y 4 · raio 14 · alfa 0,45`), e `ALFORJE.tira` ganha `recuo` e
  `marca` (os números que a faixa do fundo escrevia à mão).
- **2-glifos.cjs** — `estaNoFim`, `pousoDaVista`, `comportamentoDaRolagem`; o
  import de `CHEGADA`.
- **3-ui.cjs** — `ui.jsx`: nascem `TiraDaResposta` e `SetaDaLeitura` (antes do
  botão de ouvir, fora do trecho que a suíte de V5a lê); `painel-alforje.jsx`: a
  faixa do fundo desenha a tira pela peça.
- **5-app.cjs** — o `App.jsx`, pela ordem: os imports (`useLayoutEffect`,
  `CHEGADA`, `SetaDaLeitura`, as três contas); o efeito das mensagens passa a chamar
  `chegouMensagem({ antes, cresceu })`; a entrada no jogo chama `pousarAoAbrir()`;
  `aoRolar` guarda a distância ao fim e usa `estaNoFim`; a seta do fim segue o
  `reduce`; o órgão da chegada entra logo depois da abertura de cerimônia
  (`5-chegada.txt`); o efeito da volta da batalha distingue entrar (a regra) de
  voltar da luta (o fim); a região que rola ganha `onWheel/onTouchMove/onKeyDown/
  onPointerDown` (o toque do jogador) e a seta `novo` que some; a seta é a peça.
- **6-testes.cjs** — três asserções movidas, **cada uma com o motivo escrito ao
  lado** (`teste-r3-campo-do-turno`: o piso da seta lido na peça;
  `teste-v3-glifos` §11: a seta do fim de V3c lida na peça, e nenhuma cópia no App;
  `teste-v5-pagina`: a seta continua entre o fim da página e o pé); `check-formas`:
  o teto do `App.jsx` desce de 75 para 74, com a linha da história; e a suíte nova
  `teste-v5e-chegada.mjs` (38 checagens: as contas com os casos do `jogo`, as peças,
  a fiação).
- **7-acender.cjs** (opcional) — `ABERTURA.acesa: true` e a asserção irmã.

## 3 · O harness do pouso — sem gastar chamadas

`scratchpad\v5e-desenho\medir-v5e.mjs`: o jogo vivo no Chrome headless, com perfil
temporário e o save do dia injetado com o jogo desmontado. **O Narrador é
simulado**: o pedido ao `/api/narrador` é segurado (1,2 a 2,5 s) e respondido com
prosa fixa — **0 chamadas, 0 centavos**. As cenas, a 375 × 812 e a 1280 × 800:
- abrir o jogo;
- no fim com a resposta longa: a espera, 150 ms depois, 1,35 s e 3,85 s;
- no fim com a resposta curta;
- relendo 180 e 600 px, e o toque na seta `novo`;
- 20 letras digitadas durante a chegada;
- a cerimônia (curta, e relendo);
- 30 amostras de 100 ms com a vista pousada;
- `reduce` a 150 ms.

Uso: `ORIGEM=http://localhost:<porta> ROTULO=antes|depois|acesa node medir-v5e.mjs`
(o servidor é um `npx vite` numa cópia; **nunca contra o save de ninguém**).
Resultados: `v5e-antes.json`, `v5e-depois.json`, `v5e-acesa.json`; fotos em
`fotos-antes\`, `fotos-depois\`, `fotos-acesa\`.

## 4 · Os números

Em `formas.md` §V5e ponto 5. Em uma linha: **a primeira linha da resposta à vista
em todas as chegadas de quem estava no fim (a runa a 24 px, 15 linhas desde a
1.ª), a resposta curta inteira e com o fim a 0 px, quem relia 180 px já não é
arrancado (Δ 0 e seta `novo`), nada salta (30 de 30 amostras iguais), o `reduce`
seco a 150 ms, abrir o jogo no começo da última resposta, e a cerimônia inteira à
vista a 72 px — com o fim à vista na curta e Δ 0 relendo.**

## 5 · A conferência viva (depois do commit)

Aba nova. Salvar e restaurar os espaços de save antes de injetar. A 375 e a 1280:
1. **Mandar um turno** estando no fim: a resposta abre pela runa, logo abaixo do
   esbatimento; a seta ↓ aparece e leva ao fim.
2. **Mandar e subir** umas seis linhas durante a espera: a resposta chega e a vista
   **não se mexe**; a tira `novo` aparece embaixo com a primeira linha; tocá-la
   leva ao começo.
3. **Uma resposta curta**: fica toda à vista, no fim.
4. **Recarregar o jogo** (Continuar aventura): abre no começo da última resposta.
5. **Com reduce** (as definições do sistema): o salto é seco.
6. **A gaveta aberta no telefone** quando a resposta chega: a espreita continua a
   mesma (agora é a peça).

## 6 · Figma

Biblioteca `e5wJUzInAssoebx5npssKc`, página **`V5e · a resposta chega pelo começo`**
(`246:80`): `A tira da resposta` (`246:81`, propriedade *Ponta*), `A seta da leitura`
(`246:95`, *Estado* Fim · Novo), e a sequência antes/depois do jogo vivo:
- **375** — a resposta a chegar (com a cerimônia), quem relia 180 px, o toque na
  seta `novo`, abrir o jogo;
- **1280** — a resposta a chegar e quem relia.

**Desvios do Figma: nenhum.** A pessoa não desenhou o pouso nem a seta: não há
nó dela de que isto se afaste. As duas decisões em que me afastei do `jogo` estão
escritas em `formas.md` §V5e ponto 4.
