# MM17 — a região delimitada

*Decidida pela pessoa a 06/10:* "não precisamos de um mapa infinito, podemos ter um mapa
definido e muito mais complexo com uma zona delimitada... a história já vem com os ganchos
de pra onde o player tem que ir, o mapa por ser menor pode ser melhor trabalhado e mais rico."

**O limite que não se negocia:** só campanhas NOVAS. Save existente fica com o continente
que tem, intocado. A região é o MESMO `mapa` (continente, continentes, regiões, cidades,
rotas, `x,y` em `KM_POR_UNIDADE` = 25) mais UM campo novo, `mapa.regiao`, que a versão
antiga ignora — um commit revertido não parte save nenhum.

## A linha de base (etapa A, `testes/medir-regiao.mjs`, N=60, molde do beta, HEAD v9.354)

| | antes (continente) | depois (região) |
|---|---|---|
| (a) masmorra → "cidade próxima", km | mediana **167,7** (a pessoa: 168), máx 282,8 | mediana 8,1, máx ~28 |
| (a) masmorra → base, km | mediana **950**, máx 2.062 | mediana 13,9, máx 30,1 |
| (a) masmorra → base, horas de marcha | mediana 372 (46 dias); 60/60 mundos com alguma > 1 dia | mediana 3,5, **máx 8** (1 dia); 0/200 |
| (b) marcos da espinha a > 1 dia da base | meio 751/755 · fim 239/248 · segredo 332/371 | **0** em todos (e a amarração põe 100% dentro) |
| (c) lugares com ficha (quem, ida, perigo, planta) | **0/495** (as cidades têm a base do mundo: 798/798) | **100%** (1.300+ em 200 mundos) |
| (d) lá dentro: ONDE / seção MASMORRA | 39 / 284 caracteres | 40 / 272 |
| (d) "locais da cidade" que vão junto lá dentro | mediana **3.210** car. (máx 4.667) | ainda lá (3.800) — sai na etapa C |
| (e) PIOR CENA REAL do prompt | 74.644 | 74.644 (a etapa A não toca o prompt) |
| elenco de 24 | cheio 59/60 | cheio 167/200, o menor 18, todos dentro |
| tamanho do `mapa` no save | ~5,0 KB | ~7,0 KB (o campo `regiao` ~4,9 KB) |

Os outros moldes (Torre, Arquipélago, Braço) medem o mesmo defeito (masmorra a ~170 km da
cidade próxima, 0% de ficha) e **ficam como estão** — ver Decisões.

## O desenho final (tudo em `src/regiao.js`, tudo tabela)

- `FAIXAS_DA_REGIAO`: povoados **3–4** (dentro do "2 a 4" da pessoa; o piso 3 é pela conta
  de gente), lugares **5–8**, meio **2–3** (= etapas da estrutura − 2, quando se sabe a
  estrutura), chãos (sub-regiões) **2–3**.
- `ALCANCE_DA_REGIAO` (horas de marcha da base): teto = `HORAS_MARCHA_POR_DIA` (8);
  povoado 3–7, meio 4–7, **fim 7–8** (o clímax na borda), paralelo 2–6.
- `BIOMAS_HABITAVEIS` = planície, colina, floresta, costa: rota de cidade tem ≥ 20 km
  (`gerarRotas`), e a 12–15 km/dia isso é dia e meio — povoado só mora onde há estrada.
- `PORTES_DA_REGIAO`: base = **capital** da região; povoados = forte, cidade, vila, aldeia,
  o **maior mais longe** (a espinha põe o fim nas cidades mais distantes).
- `NIVEL_POR_ATO` meio 3–7 · fim 8–12 · paralelo 1–6; `SALAS_POR_ATO` 6–9 · 10–12 · 5–7;
  `PERIGO_POR_NIVEL` baixo/médio/alto/mortal.
- `TIPOS_DE_LUGAR` = os 7 tipos de masmorra de sempre + **acampamento** (mesma mecânica: as
  tendas são salas, a do chefe é o fundo — nada novo para o motor).
- `ROTA_DO_CLIMAX` (kmDia ≥ 16): o clímax vai para um chão com estrada; os chãos duros
  (montanha, pântano) guardam o meio e o paralelo.
- `HORIZONTE`: 3–6 entradas `{nome, tipo, boato}` (terras, regiões, cidades do continente
  que sobrou; se ele couber inteiro na região, de outro sorteio da semente). Sem ficha, sem
  coordenada, sem rota.
- A ficha de cada lugar: `quem` (os bichos daquele chão, os do nível mais perto), `horas`
  /`km`/`modo`/`rumo` da base **pela régua da boca** (`rotaAteAMasmorra`), `perigo`,
  `salas`, `nivel`, `rumor`, e os 2 `vizinhos` mais perto com horas.
- `masmorrasDoMundo` (mundo-base.js) ganhou um ramo: mapa **com** `regiao` devolve os
  lugares dela no formato de sempre; **sem** o campo, a resposta é byte a byte a de antes
  (hashes de 200 sementes × 4 moldes guardados em `teste-regiao.mjs`).
- `amarrarEspinha(mapa, espinha, ctx)` → `{ atos: [{papel, lugar}], marcos: [{dentro}],
  climax: {id, alvo}, todosDentro }`. O App ainda não a lê.

## Decisões, e o porquê

1. **Posto pelas horas, não pelos km.** "30 km" é um dia na planície e dois e meio na
   montanha. Os km saem de `TERRENO_VIAGEM`; a ficha mede com a boca — uma verdade só.
2. **Base capital, povoados 3–4.** Medido em 200 mundos: base "cidade" + aldeias deixava o
   elenco cheio em 20% dos mundos e um ato da espinha em sete sem marcos; assim, 84% e um
   em dezoito (o continente: um em trinta — o resto é da etapa C).
3. **Os povoados dão a volta pelos chãos** (a vila da fronteira pertence ao chão duro e mora
   na borda habitável): com todos no coração, a região tinha um bando de bichos só e a
   espinha esgotava-o.
4. **Os outros moldes ficam como estão** (`gerarRegiao` devolve `null` e quem chama usa
   `gerarGeografia`): estão fora do beta (ordem de 28/09); a Torre já é delimitada por
   natureza (andares a 6 h, portal a portal); o Arquipélago mede por mar com outra escala
   (`unidade.km` 40, `rotasDoMar`) e o Braço por saltos — cada um pediria a sua régua, e
   nenhum é o que o jogador do beta vai jogar. Ganham o equivalente quando voltarem.
5. **O ramo em `masmorrasDoMundo`** em vez de mexer em cada leitor: são seis chamadas no App,
   mais a boca, a porta, a cidade por dentro e a abertura. Um ramo guardado pelo campo novo
   serve todos, e a regressão prova que o continente não sentiu.

## Achados para as etapas seguintes (não são desta)

- **A ida a pé ignora o chão** (`rotaAteAMasmorra`, boca.js): até 15 km é a 4 km/h em
  qualquer terreno, enquanto `TERRENO_VIAGEM` diz 12 km/dia na montanha. Na região isso
  põe a mina da montanha "a 3 h" quando a tabela de marcha diz um dia. É bug com teste que
  prova (leve), mas muda a ida dos saves de hoje — fica para a etapa C, e a ficha tem de
  ser recalculada no mesmo passo.
- **A boca usa o chão do DESTINO para a viagem toda**: entre dois lugares da região, direto,
  há idas de 3,5 dias (planície → pântano); pela base, nunca mais de 2.
- **Saídas de um passo acordam**: `DIAS_DE_UM_PASSO` = 0,5, e 115/200 bases têm um povoado a
  meio dia — o "cão de guarda da chegada" e a linha "SAÍDAS DAQUI" (~360 car., dinâmica)
  passam a valer fora da Torre. Decidir na B se meio dia de estrada é "uma cena".
- **A célula do ermo tem 125 km** (`LADO_CELULA` 5 unidades): a região inteira cabe em 1–2
  células; os trechos de viagem e a feição do ermo serão iguais em todo o mapa. Etapa D.
- **`masmorrasConhecidas`** só abre as da mesma sub-região ou da cidade próxima; numa região
  de um dia, a base deve conhecer todas. Etapa C.
- A espinha na região fica com **5,7% dos atos sem marcos que os pesem** (continente: 3,2%),
  quase todos o último — a etapa C resolve pondo marcos nos lugares.

## O plano (uma etapa por versão)

- **B — a criação (frontend; App.jsx, save).** Na criação de uma campanha NOVA do molde
  sobremundo, `gerarRegiao({ semente: sementeMundo(), molde, genero, lex, estrutura })` no
  lugar de `gerarGeografia` (fallback para ela quando `null`), e o `mapaRef` passa a levar
  `regiao` junto de `cidades/regioes/rotas`. O load já preserva o campo (`garantirGeografia`
  espalha o mapa; provado). Save antigo: intocado. Decidir o cão de um passo. A
  `AGUARDANDO` de `teste-ligacao.mjs` esvazia aqui.
- **C — a história amarrada (backend + frontend; espinha, pauta).** `amarrarEspinha` lida na
  criação; o fecho da espinha passa a ter `onde` = o lugar do clímax; marcos nos lugares do
  meio (o "descer" que a saga diz faltar volta quando a masmorra publicar "concluída"); os
  ganchos (abertura, mural, boatos) apontam para os lugares; a base conhece todos os lugares.
  **A pauta dentro da masmorra:** sai o `resumoDaqui` e os arredores (−3.200 a −3.800 car.
  por turno lá dentro) e entra a ficha do lugar; o horizonte entra como uma linha curta, só
  quando perguntado. A boca a pé passa a respeitar o chão (e a ficha com ela).
- **D — os dados do mapa vivo (backend → desenho).** `mapa.regiao.quadro` (já existe) para o
  painel aproximar a região (~2,7 unidades de lado num mapa de 100); grade/células na
  escala da região; o que a pessoa desenhar no Figma lê daqui.
- **Depois do beta:** a região seguinte, como continuação (escrito em `pauta.md`).
