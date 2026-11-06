# SQ3 · a secundária planeada — o desenho (05/11/2026)

A palavra dela: *«as quests secundárias também devem ser planejadas assim como
uma quest de história, claro que com sua devida proporção, então teremos menos
quests secundárias mas bem elaboradas»*.

## O que a casa já tem, e o que se reaproveita

| a história principal tem | a secundária reaproveita |
|---|---|
| a espinha: atos com marcos (`saga.js`, `estenderEspinha`), cada marco uma condição que se confere | **os atos são etapas de missão** (`missoes.js`): `falar_com` (a pessoa no sítio dela, `estaCom`), `revelar` (o sítio com a `chave` da base), `ir_a` (a cidade). São as três que a abertura e a espinha já usam, e que o conferente segue sem ajuda |
| a virada que o código executa (`tramas.js`, `viradaDevida`; o prelúdio abre a luta ou põe a cena) | **a reviravolta é a `virada`** da missão — `emboscada`, `encontro` ou `revelacao`, `apos` um ato. A missão fica de pé até ela acontecer (`VIRADAS_QUE_ESPERAM`) |
| o prazo do mural (`PRAZOS`, o relógio de noites, `falharPorRelogio`) | **o custo de falhar é o prazo**: 4, 6 ou 8 noites, e a frase do que se perde |
| o elenco (`elenco.js`): 24 pessoas com sítio, vontade, casa e laços entre elas | **o fio**: a pessoa, o laço, a casa |
| a base (`mundo-base.js`): os sítios de cada cidade, os segredos | o sítio a descobrir, o segredo |
| o mapa (`geografia.js`): as cidades, as que ainda não se conhecem | a cidade aonde o fio leva |
| o laço do registo (`npcs.js`, `firmarLaco`) | **o fecho** |

Nenhum campo novo no save. A missão planeada é uma missão como as outras
(`criarMissao`), com `veiculo: "secundaria_planeada"` e o molde no `id`
(`sq_<molde>_<hash>`): o gancho é a `descricao`, os atos são as `etapas`, a
reviravolta é a `virada`, o custo é o `prazo`, e o fecho **deriva-se** do molde
e das etapas (`lerSecundaria`). Uma versão antiga lê-a como um favor comum.

## A forma — uma espinha em ponto pequeno

- **O fio** (de onde nasce, sempre do mundo): um laço do elenco (dívida,
  rivalidade, família, aprendizado, amor), uma casa notável, o segredo de um
  sítio da cidade, uma cidade vizinha onde mora gente do elenco, uma facção do
  mapa, o arco regional que já corre. **Nunca do nada:** sem fio, não nasce.
- **O gancho**: quem pede (uma pessoa do elenco, no sítio dela), porquê agora
  (a vontade dela, o laço que azedou), e o que o herói ganha em ver (o favor de
  uma casa, um sítio, uma estrada).
- **Dois ou três atos**, cada um uma etapa que o jogo já segue.
- **Uma reviravolta** entre atos, executada pelo código.
- **O custo de falhar**: o prazo em noites e o que se perde.
- **O fecho que muda o mundo**: `laco` (a pessoa fica a dever-te, ou amiga —
  `firmarLaco`), `lugar` (o sítio fica sabido — `revelar` na base) ou `porta`
  (uma cidade que não se conhecia abre-se no mapa — `descobrirCidade`).

## Quem escolhe o quê

- **A pessoa:** do elenco, viva, já estreada (`estreia <= dia`), fora da
  espinha e dos chefes (a principal não se mistura), e que não esteja já numa
  secundária viva. Da cidade onde o herói está, primeiro.
- **O molde:** pela semente, entre os que têm fio neste mundo; nunca o mesmo
  molde de uma secundária viva.
- **Menos e melhores** (`TETO_DAS_SECUNDARIAS`): duas vivas ao mesmo tempo, e
  três dias entre o nascimento de uma e o da seguinte. Por cima, o portão de
  SQ2 (`secundariasAbertas`) e o mesmo dado da noite de sempre
  (`ALVOS_DO_DESCANSO.novaMissao`).
- **Uma por noite, no máximo**, e a noite que a dá não dá também o arco
  regional.

## Porquê 2 e 3

Duas é o que a mesa de um Mestre aguenta a par da principal sem que nenhuma
fique esquecida (é também o teto que a noite já tinha, `secundariasMax`). Três
dias é o que uma secundária de 2–3 atos leva a jogar numa cidade (o censo de
SQ1: ≈1 dia de jogo a cada 7 turnos); o prazo mais curto é 4 noites, logo uma
nova nunca chega antes de a anterior ter tido tempo de andar. Medido contra o
antes: 1,65 trabalhos por 3 dias vindos da noite (1,16 + 0,49) passam a, no
máximo, 1 por 3 dias.

## O que fica para o `oficial` (`mente/sq3-fiacao.md`)

A noite só planeia quando recebe o mundo (`mundo`, a mesma forma de
`mundoDasTarefas()`) e as missões; sem eles, faz o de sempre. Ligar é passar os
dois, dar o prazo à nascida (`iniciarPrazo`), e aplicar o fecho quando ela fecha.
