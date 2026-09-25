# V5a · o cabeçalho da pessoa — a construção (`desenho`, 25/09)

A decisão curta está em `mente/formas.md` §V5a; o conteúdo das etiquetas é do
`jogo` (`mente/v5a-jogo.md` §1–2). Aqui fica **a ordem para o `oficial`**, o que
cada script toca, o que morre, e os números.

## 1 · A ordem — seis scripts, por âncora exacta

Pasta: `C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v5a-desenho\entrega\`

Todos recebem a raiz do projecto (`R`), falham se a âncora não bate ou aparece
mais de uma vez, e **o 5 aborta se o `App.jsx` mudar de número de linhas — no
total e em cada região** (o `check-acoes-do-jogador` lê recusas por número de
linha; nenhum dos 138 endereços da tabela se move). O `App.jsx` é tocado só pelo
5: **o bastão é preciso para ele**. De dentro da pasta:

```
node 1-hora-e-prazo.cjs R
node 2-estilo.cjs R
node 3-ui.cjs R
node 4-glifos.cjs R
node 5-app.cjs R
node 6-testes.cjs R        # copia teste-v5a-cabecalho.mjs (ao lado) para testes/
npm run build && npm test
```

**Provado** numa cópia de `4ce9d4c` (`git -c core.autocrlf=false archive`, LF como
a árvore): **build limpo, 214/214 suítes, 15/15 varredores** (antes: 213/213 ·
15/15). `App.jsx` **24 257 → 24 257 linhas**, região a região. A árvore viva só
difere de `4ce9d4c` em `mente/` — nenhum dos arquivos que os scripts tocam.

**Commit**, pela lei da casa (`git commit -- <caminhos>`): `src/App.jsx`
`src/estilo.js` `src/glifos.js` `src/ui.jsx` `src/hora-e-prazo.js`
`src/gravura-da-cena.js` `src/rosto-da-cena.jsx` (os dois últimos como
remoção) `testes/check-formas.mjs` `testes/teste-palco.mjs`
`testes/teste-r13-pecas.mjs` `testes/teste-r3-campo-do-turno.mjs`
`testes/teste-v1-folha.mjs` `testes/teste-v3-glifos.mjs`
`testes/teste-v5a-cabecalho.mjs` + `src/constantes.js` (o bump, por último).

## 2 · O que cada script toca

**1 · `hora-e-prazo.js`.** Escreve `src/hora-e-prazo.js` a partir de fatias exactas
de `gravura-da-cena.js` (a ampulheta, o aperto, as contas; `LUZES`,
`HORARIO_DA_LUZ`, `luzDaHora`; o `r2`), com cabeçalho novo que diz o que morreu e
porquê. Apaga `src/gravura-da-cena.js` e `src/rosto-da-cena.jsx`. Troca o import
em `App.jsx` (mesma linha 183), `check-formas.mjs` e `teste-v3-glifos.mjs`.

**2 · `estilo.js`.** Sai `LUZ_DA_CENA` com a sua nota de ~270 linhas (lápide de 12
no lugar). Nascem `RUNA`, `CABECALHO_DA_PAGINA`, `FLOREADO` (com a excepção ao
piso escrita na nota). Sai o bloco `forced-colors` de `.tv-gravura-*` da folha.
Três comentários deixam de apontar para a gravura (AMBIENTE, ESBATIMENTO, a nota
da luz ambiente na folha — **sem crase dentro do template da folha**, conferido).

**3 · `ui.jsx`.** `DivisoriaRunica({ respiro = RUNA.respiro })` passa a ser a runa
da v3 (um `svg` com os três pontos de `T` por nome, traços `alfa(T.amber, 0,2)`).
Nascem `CabecalhoDaPagina({ lugar, direita, cede })` e `FimDaPagina()`. Sai o
re-export de `RostoDaCena`; o import do selo de prazo passa a `hora-e-prazo.js`.

**4 · `glifos.js`.** Nascem `CLIMA_QUE_SE_CALA` e `etiquetasDaPagina({ lugar, cena,
luz, clima }) → { lugar, direita, cede }` (o travessão vira ponto; à superfície
`[luz, clima]` com cede `fim`; na masmorra `[camada, tochas]` — `sem tochas` com
zero — com cede `inicio`). Os quatro comentários da luz deixam de dizer
*"a mesma conta da gravura"*.

**5 · `App.jsx`** (neutro em linhas, região a região):
- **A** import (linha 183): `RostoDaCena` → `CabecalhoDaPagina, FimDaPagina`;
  `etiquetasDaPagina` do `glifos.js`.
- **B** (~1205) o componente `CabecalhoDaCena` (v9.157) sai → lápide com o porquê e
  os números; a lápide da vinheta (R17) fica, com uma frase corrigida.
- **C** (~1717) `OTopoDoPapel` sai → lápide de R13-B com a tabela antes/depois.
- **D** (~7617) o comentário de `lugarDaCena` deixa de falar da gravura.
- **E** (~7644) `lugarAntesRef` e o efeito que o marcava saem (a prop `chegada` era
  inerte há doze dias) → lápide com a lei que ele guardava.
- **F** (~1691) o comentário do painel do tempo diz a morada nova do lugar.
- **G** (~23219) o cartão: comentário novo e **`border` → `outline` com
  `outlineOffset: -1`** (o fio por dentro, como o nó).
- **H** (~23232) a chamada: `<CabecalhoDaPagina {...etiquetasDaPagina({ lugar:
  lugarDaCena(), cena: cenaDoPalco(), luz: luzDaHora(Math.floor((minuto || 0) /
  60)), clima })} />` no lugar de `<OTopoDoPapel …>`.
- **I** (~23266) `<CabecalhoDaCena cena={cenaDoPalco()} />` → um comentário JSX de
  uma linha.
- **J** (~23745) `<div ref={fimRef} style={{ height: 8 }} />` →
  `<div ref={fimRef}><FimDaPagina /></div>` (mesma altura).

**6 · as suítes** — cada asserção movida ou apagada leva o motivo escrito no sítio:
- `teste-r13-pecas`: saem §1 (determinismo da paisagem), §2 (o buril), §3 (os 30
  biomas), §6b (os sete pisos de `LUZ_DA_CENA`), as 7 asserções de `LUZ_DA_CENA`
  em §6 (fica uma: os quatro nomes), as 3 das `BANDAS` em §7, a do contrato de
  `RostoDaCena` em §8 (invertida: *não volta*), e em §9 a tinta da gravura,
  *Talhos e Legenda fora do render*, a degradação da gravura (fica a metade que é
  lei da folha) e *a faixa não anima*. `LARGURA_DE_REFERENCIA` (375) passa a
  constante local da suíte — a conta da cinta ainda a lê. **109 → 65.**
- `teste-palco`: as 2 do componente de v9.157 → 1 (*não voltou*); *dentro da área
  que rola* → *acima dela* (a lei fica mais forte); as 3 do véu saem (`TONS` é
  guardado por `teste-momentos`); o bloco R13-B vira o bloco V5a (a fiação do
  cabeçalho: moldura de duas faixas, antes da área que rola, a conta não
  copiada, o mesmo lugar/luz/clima, o empréstimo terminado). **71 → 65.**
- `teste-r3-campo-do-turno`: *a narração usa a superfície dela* aceita `border` ou
  `outline`. **75 → 75.**
- `check-formas`: a zona `LUZ_DA_CENA` sai (com lápide); comentário da luz.
- `teste-v3-glifos`, `teste-v1-folha`: só palavras.
- **nova `teste-v5a-cabecalho.mjs` — 54 asserções**: as medidas do nó e a soma
  69; a excepção ao piso (e o piso continua 12); cores e contraste; o que as
  etiquetas dizem contra o `palco.js` real (ordem, `cede`, `sem tochas`, o céu que
  se cala, nada sabido, lixo); a peça (tabelas, sem medição, sem animação, a runa
  uma só, o `sr-only`, o `fimRef`, o fio por dentro); e o que morreu continua morto.

## 3 · O que morre, exactamente

| o quê | onde | porquê |
|---|---|---|
| `RostoDaCena` e o arquivo inteiro (236 linhas) | `src/rosto-da-cena.jsx`, re-export em `ui.jsx` | a gravura saiu da tela |
| `gravuraDaCena`, `BANDAS`, `BIOMAS_DA_GRAVURA`, `GRAMATICAS`, `HACHURAS`, `GRAMATICA_LISA`, `gramaticaDo`, `TREMOR_MINIMO`, `LARGURA_DE_REFERENCIA`, `hachuraDoCeu`, `hachuraDoChao` (+ `talhos`, as 8 silhuetas, `DESENHO_DA_SILHUETA`) | `gravura-da-cena.js` (576 → `hora-e-prazo.js`, 162) | único leitor era `rosto-da-cena.jsx` |
| `LUZ_DA_CENA` | `estilo.js` | **só a gravura a lia** — `O TEMPO` lê `luzDaHora` (os nomes), nunca as cores. Corrijo o pressuposto do pedido: *não* tem leitor. |
| `.tv-gravura-fundo` / `.tv-gravura-tinta` (forced-colors) | folha | idem |
| `CabecalhoDaCena` (o cartão de v9.157) | `App.jsx` | segunda peça a dizer o lugar; dizia `ensolarado` à noite |
| `OTopoDoPapel` + a `ResizeObserver` | `App.jsx` | media a largura da gravura |
| `lugarAntesRef` + o efeito | `App.jsx` | alimentava a prop `chegada`, inerte |
| o losango da divisória | `ui.jsx` | a runa é uma forma só (a da v3) |

**Fica:** `luzDaHora`/`LUZES`/`HORARIO_DA_LUZ` e o selo de prazo (`hora-e-prazo.js`);
`cabecalhoDaCena`/`cenaDoPalco` (`palco.js` decide a masmorra da etiqueta e o local
do véu da morte); `TONS` (cartão da chegada); `lugarDaCena`; os `public/cenas/*.webp`.
`teste-ligacao`: 2 757 → 2 750 regras, nenhuma sem leitor. D5g: 615 → 613 (as duas
`text-[10px]` do cartão de v9.157). Save: intocado (a gravura nunca foi guardada).

## 4 · Os números

Medido ao vivo (Chrome headless, perfil temporário, `/api` cortado — 0 pedidos;
os saves de prova de V1 + a masmorra e o lugar longo do `jogo`; `4ce9d4c` na 5179,
a cópia com os scripts na 5180). Scripts: `scratchpad/v5a-desenho/medir.mjs`
(`antes.json`, `depois.json`, `fotos-antes/`, `fotos-depois/`), `pixel.mjs`
(`pixel.json`, `chrome-cabecalho.png`, `diff-mapa.png`), `cria.mjs`.

| | 320 | 375 | 1280 |
|---|---|---|---|
| fixo no topo do papel | 97 → **69** | 97 → **69** | 97 → **69** |
| área da prosa (dia) | 342 → **371** | 475 → **504** | 473 → **502** |
| 1.ª linha do Mestre, topo da cena | 384 → **277** | 366 → **259** | 348 → **241** |
| linhas à vista no topo (dia · noite) | 2 → **5** | 7 → **11** · 5 → **9** | 8 → **11** · 5 → **8** |
| altura do cabeçalho, 4 cenas | 69 | 69 | 69 |
| transbordo lateral | 0 | 0 | 0 |

**+29 px em todos os turnos** (uma linha de 27,6) e **+107 px no topo de cada cena**
(≈ 4 linhas no telefone, 3 na mesa).

**Ao píxel contra o `129:4`** (as mesmas etiquetas, 1142 × 69): mínimo da diferença
em deslocamento **(0,0)** (2,94/255; ±1 px piora); 93,9 % dos píxeis a ΔE76 < 3,
95,5 % sem a moldura; o resto é o antialias da letra e o fio de 1 px que o Figma
reparte por duas filas (formas.md §V5a.2).

**Contraste:** lugar `amber`/`pagina` **10,61:1**; luz `inkDim`/`pagina` **6,60:1**;
pontos 10,61 · 8,72 · 6,36; traço 1,48 (decorativo). **Letra 10** (excepção):
altura de maiúscula 7,3 px contra altura-x 6,6 px da letra de 12.

**Degradação medida:** masmorra a 375 cabe inteira; a 320 cai a camada, fica
`3 TOCHAS`; lugar de 44 car. apaga a direita e trunca (283 px a 375, 228 a 320).

**Criação do mundo:** as sete runas continuam com 24 px de caixa (o ritmo da tela
não muda), agora com a forma da v3.

## 5 · Figma

- Biblioteca `e5wJUzInAssoebx5npssKc`, página **`V5a · o cabeçalho da pessoa`**
  (`241:67`): `O cabeçalho da página` (`241:97`; `Largura=Mesa` `241:75`,
  `Largura=Telefone` `241:86`; propriedades `Lugar`, `Direita`), `A runa`
  (`241:68`), `O fim da página` (`241:98`) — cores ligadas a `Paleta semantica
  (T)`; o par antes/depois (capturas do jogo vivo, masmorra, topo da cena):
  375 `242:90`/`242:91`, 1280 `242:93`/`242:95`; os quatro casos da degradação
  (`242:97`). `O rosto da cena` e a colecção `Luz da cena` marcados APOSENTADOS.
- Arquivo da pessoa `ffWFqD7TueSb88Mkeg9bhW`, **`141:2`** à direita dos quadros
  (x 8800): o `129:4` clonado, o código no Chrome, o mapa da diferença e a nota.

## 6 · A conferência depois de construído (minha)

Na árvore viva, **aba nova** (HMR mente depois de rename — e aqui há dois
arquivos apagados e um criado), a 375 e a 1280, pela árvore de acessibilidade: o
cabeçalho numa cidade, na estrada e na masmorra (`CAMADA n · n TOCHAS`), a runa no
fim do registo, a seta *ir para o fim*, a criação do mundo. **Salvar e restaurar os
espaços de save antes.** A tela de combate não é tocada por nenhum script.
