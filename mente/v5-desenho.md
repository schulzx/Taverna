# V5 · a página — a construção (`desenho`, 25/09)

A decisão está em `mente/formas.md` §V5; o momento é do `jogo` (`mente/v5-jogo.md`).
Aqui fica **a ordem para o `oficial`**, o que cada script toca, e os números.

## 1 · A ordem — cinco scripts, por âncora exata

Pasta: `C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v5-desenho\entrega\`

Todos usam `_arquivo.cjs`, que **tolera LF e CRLF** (as âncoras se escrevem em LF;
o arquivo grava com o fim de linha que achou) e falha se a âncora não bate ou é
ambígua. Os trechos grandes de JSX moram em `.txt` ao lado (`3-glifos.txt`,
`5-abertura.txt`, `5-voz.txt`, `5-mestre.txt`, `5-sala.txt`, `5-conves.txt`,
`5-pe.txt`): têm crases em comentários, e dentro de um template seriam a armadilha
da crase. Só o 5 toca o `App.jsx`: **o bastão é preciso para ele**. De dentro da
pasta, com `R` = a raiz do projeto:

```
node 1-estilo.cjs R
node 2-ui.cjs R
node 3-glifos-e-gaveta.cjs R
node 5-app.cjs R
node 6-testes.cjs R        # copia teste-v5-pagina.mjs (ao lado) para testes/
npm run build && npm test
```

(Não há 4: a hora e o prazo não mudam neste ciclo.)

**As linhas do `App.jsx`.** 24 257 → 24 315. O 5 **aborta** se alguma edição com
número de linhas diferente cair antes da linha **22 489** — o último endereço que o
`check-acoes-do-jogador` e a tabela `acoes-do-jogador.mjs` leem —; antes disso só há
trocas na mesma linha (os imports, o `scrollMarginTop` do cartão do companheiro).
**0 endereços mexidos.**

**Provado** em duas cópias de `1bb8f4d` — uma em LF (`git -c core.autocrlf=false
archive`, como a árvore de hoje) e uma em CRLF (`core.autocrlf=true`) —: **build
limpo, 216/216 suítes, 15/15 varredores nas duas** (antes: 215/215 · 15/15).

**Commit** (`git commit -- <caminhos>`): `src/App.jsx` `src/estilo.js` `src/ui.jsx`
`src/glifos.js` `src/painel-alforje.jsx` `testes/teste-nome-da-campanha.mjs`
`testes/teste-r3-campo-do-turno.mjs` `testes/teste-v3-glifos.mjs`
`testes/teste-v5a-cabecalho.mjs` `testes/teste-r13-pecas.mjs`
`testes/teste-v5-pagina.mjs` + `src/constantes.js` (o bump, por último).

## 2 · O que cada script toca

- **1-estilo.cjs** — `estilo.js`: as tabelas `PAGINA` (28/28/28, telefone 20, 16
  entre parágrafos, 24 entre blocos, entrelinha 1,625), `ABERTURA` (28, 20 acima de
  110 car., entrelinha 1,35, peso 500), `PE_DA_PAGINA` (6/4, lados 24 e 12);
  `RUNA.glifoDeOuvir` (14); `ALFORJE.focoAbaixoDoCabecalho` (92, V4d); na folha,
  `.tv-pagina` e `.tv-pe-da-pagina`, lidas das tabelas (`padding-inline` na mesa —
  nunca `padding-right`, que `teste-celular` caça).
- **2-ui.cjs** — `ui.jsx`: `PontoMestre` se aposenta; `Oferta` ganha `moldura =
  "caixa"` (o 5.º campo, no fim); nascem `BotaoDeOuvir`, `Prosa`, `PeDaPagina`
  (antes da runa, e não entre ela e o cabeçalho: a suíte de V5a lê esse trecho e
  prende que não há número à mão); `DivisoriaRunica` ganha `ponta`; a `Voz` diz
  `preparando…` · `lendo…` · *tecendo*.
- **3-glifos-e-gaveta.cjs** — `glifos.js`: `GLIFO_DA_SALA`, `partesDaProsa`,
  `primeiraFrase`; `painel-alforje.jsx`: o cabeçalho `md:sticky md:top-0 md:z-10`
  com fundo `panel` (V4d).
- **5-app.cjs** — `App.jsx`: os imports (`ALFORJE`; `Prosa, BotaoDeOuvir,
  PeDaPagina`; `GLIFO_DA_SALA`; sai `PontoMestre`); o `scrollMarginTop` do cartão
  do companheiro (V4d); o efeito da abertura (`5-abertura.txt`, em `calou`, nada no
  save); a região que rola vira `tv-pagina` e ganha o invólucro da seta; sai o `O
  MESTRE` do topo (`5-voz.txt`); a resposta do Mestre (`5-mestre.txt`: runa com
  ponta + `Prosa`, e a espera no fim com o dado que rola); o painel da sala
  (`5-sala.txt`); a soleira sai do convés (`5-conves.txt`) e entra no pé do cartão
  com `moldura="aberta"` (`5-pe.txt`).
- **6-testes.cjs** — cinco asserções movidas, **cada uma com o motivo escrito ao
  lado**: `teste-nome-da-campanha` (o `py-6` virou `tv-pagina`; a lei — o
  enchimento de cima ≥ o esbatimento — fica, dita por nome), `teste-r3-campo-do-turno`
  (a coluna começa pela runa; a prosa nasce em `TIPOS.prosa` dentro de `Prosa`; `A
  voz` em dois lugares, não três), `teste-v3-glifos` (o ouvir mora no
  `BotaoDeOuvir`; as tochas saíram do painel da masmorra para o cabeçalho),
  `teste-v5a-cabecalho` (a assinatura da runa ganhou `ponta = null`),
  `teste-r13-pecas` (a assinatura da oferta ganhou `moldura = "caixa"`); e a suíte
  nova `teste-v5-pagina.mjs` (57 dentes: as tabelas, as contas em Node, as peças, a
  fiação, nenhum movimento novo).

## 3 · A conferência viva (para depois do commit)

Aba nova (HMR mente depois de rename). Salvar e restaurar os espaços de save antes
de injetar. O que olhar, a 1280 e a 375:
1. **O topo do campo** no mesmo píxel de antes (735 · 706) com e sem oferta.
2. **Sem `O MESTRE`** no topo; cada resposta abre com a runa e o ouvir (48 × 48).
3. **A oferta dentro do cartão**, sem caixa ciano, sob o fio; sem oferta, o cartão
   desce até o campo e não há pé.
4. **Mandar um turno**: a linha `[dado] O MESTRE · preparando…` aparece no fim,
   à vista; a primeira resposta da sessão abre com a primeira frase grande; a
   seguinte, não.
5. **Na masmorra**: `TESOURO · POR RESOLVER` e `2/7`; com 0 tochas, `ÀS ESCURAS` em
   vermelho e a linha do preço.
6. **A gaveta na mesa**: tocar num companheiro na cinta — o título e o ✕ ficam à
   vista.

## 4 · Os números (o jogo vivo, antes × depois)

Em `formas.md` §V5 ponto 4. Em uma linha: **topo do campo imóvel em 13 de 13
casos; área que rola igual ou maior; rolo 50–127 px mais curto; +1 a +2 linhas de
prosa no topo do rolo; a espera passa de 1 454 px fora de vista para dentro dela;
cerimônia 113 px a 375 e 76 a 1280, efêmera.**

## 5 · Figma

- Biblioteca `e5wJUzInAssoebx5npssKc`, página **`V5 · a página`** (`244:320`): as seis
  peças, a coleção `A página`, e o par antes/depois (375: dia, noite, masmorra, às
  escuras; 1280: a noite com duas ofertas; o turno: a espera, a primeira resposta,
  e a proposta).
- Arquivo da pessoa `ffWFqD7TueSb88Mkeg9bhW`, **`144:2`** (página `02 · Entrada`,
  abaixo de V4): o `126:5` clonado ao lado do código a 1280 × 912, com as marcas
  numeradas e **os 17 desvios escritos um por um** (D1–D9 do `jogo`, D10–D17 do
  `desenho`) — cada um sai de um trecho próprio do script, e pode ser recusado sem
  desfazer os outros.
