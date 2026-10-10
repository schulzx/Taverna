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

## D — o que a tela do mapa vivo vai poder mostrar (06/10, `src/mapa-vivo.js`)

Para a pessoa e o desenho. `dadosDoMapaVivo(mapa, estado)` é a ponte: lê a região e onde o
herói está, devolve o que se desenha, não desenha nada. Provado em
`testes/teste-mapa-vivo.mjs` (79 asserções, N=200 mundos do molde do beta; 9 mutações do
módulo, as 9 apanhadas). Tudo o que é número está numa tabela exportada.

**Uma região de exemplo** (semente `regiao|0|…`, "Fronteiras da Serpente", estrutura jornada):
o quadro tem **64 km de lado** (25,6 h de marcha pela floresta da base), régua de **15 km
= 6 h**; 1 base, 4 povoados, 7 lugares (1 fim, 3 meio, 3 paralelo), 6 nomes no horizonte.
No turno 1 a tela mostra **11 nós**: a base (visitada, "início", o herói lá), 4 povoados e
5 lugares em **boato**, o lugar do primeiro gancho **conhecido** e marcado `proximo` (é o
que a abertura já nomeia, com horas e rumo), e **1 oculto** — o clímax, que não aparece nem
como ponto, nem como vizinho, nem como aresta. 14 arestas no turno 1, 27 com tudo aberto.

**Em 200 mundos:** lado mediana 78 km (59–100), 19–30 h de marcha; 9–13 nós (povoados 3–4,
lugares 5–8); no turno 1, 8–12 visíveis, sempre **1 oculto**; 10–21 arestas (17–30 aberto);
3–6 nomes no horizonte. Nenhum nó em cima de outro (distância mínima 0,0034 do lado ≈ 260
m); 17 pares em 200 mundos ficam a menos de 0,02 do lado (~1,5 km) — **ícones que se
tocam: a tela afasta os rótulos, a posição não se mexe** (é a verdade das horas). A saída
pesa ~11 KB de JSON; a tela deve memorizá-la pelos refs, não recalcular a cada render.

**O que a tela recebe:**

- `quadro` — `margem` (0,08), `ladoKm`, `ladoHoras`, `regua {km, fracao, horas}`. Fixo
  desde a criação: é o quadro de TODOS os pontos, os escondidos incluídos — se crescesse com
  a neblina, o pergaminho mexia e o tamanho contava que há coisa por achar.
- `nos[]` — `{ id, nome, tipo: base|povoado|lugar, subtipo (porte ou tipo de lugar), icone,
  x, y (0–1), estado, perigo, perigoRotulo, horasDaBase, vizinhos [{id, horas}], boato
  (lugares), atoDaHistoria, momento: agora|passado|proximo|null, aqui }`.
- `nos[].quem` (P3, 10/10) — os nomes dos bichos da ficha, na ordem dela e sem nível (com
  léxico, os renomeados), lidos por `quemDoLugar`, a mesma porta que dá a planta: só nos
  lugares cujo `perigo` a neblina mostra (boato e oculto ficam sem o campo). Nó = ficha =
  planta em 2.823/2.823 nós de 200 mundos; o JSON cresce ~1% (mediana 9.382 → 9.510 chars,
  pior mundo +316, 2,5%).
- `arestas[]` — `{ id, de, para, horas, horasDeVolta, tipoDeChao, modo: estrada|a_pe,
  origem: rota|ficha, km, perigo }`. As horas são as que o jogo cobra: rota = dias × 8;
  ida a um lugar = a ficha, que é a mesma conta da boca (0 contradições em 7.642 arestas).
- `heroi` — num sítio só: `onde: base|povoado|boca|masmorra|arredor|viagem|nenhum`, `noId`,
  `x, y`; lá dentro `masmorra {nome, camada, camadas, progresso}`; na estrada `jornada
  {deId, paraId, arestaId, fracao, horasFeitas, horasQueFaltam, horasTotais, estado}` com a
  posição interpolada pela estrada percorrida (sem saltos, de ponta a ponta).
- `neblina {contagem por estado, ocultos}` — o "há N lugares que não conhece" do rodapé.
- `horizonte[]` — `{nome, tipo, boato, rumo, rotulo, x, y}` no rebordo do quadrado, cada um
  num dos 8 rumos da rosa (baralhados pela semente): nunca dois no mesmo rumo.
- `relogio {dia, minuto, hora, fase, noite, luz 0–1, estacao}` — seis fases
  (`FASES_DO_DIA`), a noite igual à do calendário minuto a minuto, a luz por curva
  (`LUZ_DO_DIA`) para a tela pintar o céu.

**O que anima:** o herói a andar na aresta a cada avanço (a fração vem da estrada, não do
calendário); a neblina que abre (boato → conhecido → visitado → concluído); o gancho que
acende `proximo` e passa a `agora` quando o ato chega; o dia e a noite pelo relógio.

**O que fica oculto, e porquê** (`PISO_DA_NEBLINA`, `SINAIS_DA_NEBLINA`,
`REVELACAO_DO_ATO`): (1) o **clímax** nasce desconhecido e só acorda quando a história chega
ao ato dele, quando o herói vai lá (estrada, boca, porta) ou quando o App o diz conhecido —
nunca pela vila ao pé (pode ser a base) nem pelo gancho do ato anterior; (2) o **ato** de
um lugar ("meio", "fim") só se diz quando o ato chega; à boca do clímax antes da hora o
herói vê o lugar, não o ato; (3) o **paralelo nunca leva rótulo** — se levasse, os sem
rótulo seriam, por exclusão, os da história; (4) o **segredo** da espinha ("o que X
esconde") mora num local dentro de uma cidade e nenhum texto de marco sai daqui — só o
"descer" é lido, para saber o ato de cada lugar; (5) **boato não tem ficha**: sem perigo,
sem vizinhos, e a aresta até ele sem cor de perigo.

**O continente:** mapa sem `regiao` (todo save de antes da MM17) devolve `null` (200/200) e
a tela fica com o pergaminho de sempre (`painel-mapa.jsx`). Região v1 desenha-se igual.

**O que a tela precisaria que o App guardasse e hoje não guarda** (campos NOVOS, opcionais,
que a versão antiga ignora — a função já os lê; quem os escreve é a fiação, não esta etapa):

1. **`baseMundo.visitadas`** — a lista de lugares onde o herói já esteve, com a chave de
   `concluidas` (`chaveDeLugar`: sem artigo e sem acento), escrita na chegada à boca
   (`chegadaABoca`) e ao entrar na masmorra. Hoje "visitado" só vale enquanto se está lá: ao
   sair, o lugar volta a conhecido (ou a boato). Passa-se como `estado.visitados`.
2. **`baseMundo.ouvidas`** (opcional, depois) — lugares que alguém nomeou ao herói fora do
   gancho (um NPC, o mural). Passa-se como `estado.conhecidos`; é a única porta, além da
   história e da estrada, que acorda o clímax antes do seu ato.

**O mapa de chamada** (o App, dentro de `calou`, memorizado pelos estados que já existem —
`jornada`, `lugar`, `masmorra`, `dia`, `minuto`, `cidadeAtual`):

```js
dadosDoMapaVivo(mapaRef.current, {
  cidadeAtual: cidadeAtualRef.current, lugar: lugarRef.current,
  masmorra: masmorraRef.current, jornada: jornadaRef.current,
  base: baseMundoRef.current, espinha: espinhaRef.current,
  etapa: historiaRef.current.etapa,
  dia: diaRef.current, minuto: minutoRef.current, semente: sementeMundo(),
  // visitados: baseMundoRef.current.visitadas, conhecidos: … (quando existirem)
}) // → null no continente: cai no pergaminho antigo
```

A dívida está em `AGUARDANDO` de `teste-ligacao.mjs` (credor: a tela do mapa em tempo real,
do desenho/oficial) e sai quando o App ou um painel importar `mapa-vivo.js`.
