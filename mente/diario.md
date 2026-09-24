# O diário da mente

Um registro por ciclo, o mais recente no topo. É aqui que a pessoa vê o que
cada agente fez, e é aqui que a mente lê o próprio passado antes de agir.

Formato:

```
## dd/mm hh:mm · vX.YYY · <título do item> · commit <hash>
- **estado inicial:** suítes verdes/vermelhas, o que a pauta tinha
- **conselheiro:** o que propôs (ou "não chamado")
- **backend / frontend / testes:** o que cada um entregou, em uma linha cada
- **decisões médias tomadas:** cada uma com o motivo (é o que a pessoa audita)
- **o que ficou:** o que não coube, o que dormiu, o que foi para "pesado"
```

---
## 24/09 16:50 · v9.289 · o sistema de fugir (item da pessoa, pedido #33) · commit `7a2b00b`

- **por que este ciclo andou com a fila parada:** a pessoa escreveu hoje
  *"Pode arrumar o sistema de fugir."* É a exceção que a ordem de 23/09 prevê
  (é do tema — o jogador sente, e sente a 3 PV — e foi pedida). Nenhum outro
  item de `mente/pauta.md` foi tocado. Mecânica que muda o que o jogador vive
  (seria `pesado`), autorizada pela frase.
- **estado inicial:** árvore limpa, 209/209 suítes, 15/15 varredores. Sem
  pausa, sem trava do sistema. A trava do desenho (R21, o `regente`) estava
  viva — renovada às 16:55 — e o bastão do `App.jsx`, livre: tomei-o às 17:09
  e **devolvi-o às 18:01**, com a fiação fechada.
- **o que o R15 escondia, medido e não suposto:** os três golpes que levaram a
  heroína de 18 a 3 PV (`20/14/17 vs 12`, 5 cada) **não foram a rodada dos
  javalis — foram golpes "de oportunidade" fantasmas.** `App.jsx:14260` cobrava
  `oportunidadesContraOJogador` com a lista INTEIRA de inimigos de pé, a
  qualquer distância. Javalis-de-pedra são corpo a corpo (1,5 m) e andam 9 m
  (`deslocamentoDeCriatura`): a 19,5 m, na vez deles, só chegavam a 10,5 m e
  não podiam bater. O outro sítio que faz a mesma conta (o Mover, `:15472`) já
  passava só os `colados`. **Antes: 3 golpes de quem nem a alcançava. Agora: 0
  — só quem está colado golpeia ao sair.**
- **backend:** `src/fuga.js` — `vereditoDaFuga` (sem dado: é uma corrida de uma
  rodada; quem está colado golpeia ao sair; o herói cobre 2× o passo correndo
  ou 1× de guarda erguida, sem golpe; cada inimigo persegue a 2× o passo dele,
  cortado pela condição — `PERSEGUICAO_POR_CONDICAO`: caído e lento à metade,
  agarrado/paralisado/atordoado/amedrontado parados; alcança se a distância
  final ≤ o alcance dele), `quemGolpeiaAoSair`, `ehFuga`, `linhaDaFuga` (≤ 54),
  `notaDaFuga`. `combate.js` exporta `pedeDesengajar`, e `ehRetirada` passa a
  usá-la (a lista das frases de cuidado continua uma só).
- **testes:** `testes/teste-fuga.mjs`, 82 provas, com o R15 rejogado em número
  como primeiro bloco.
- **frontend:** uma porta só, `fugirDaLuta`, para a frase e para o botão (lei de
  X2). O verbo `Fugir` na fileira da batalha, `Papel=Recuo` ao lado de
  `esperar` (a mesma peça `Verbo` — uma ação, uma forma). O fantasma
  consertado na retirada. `bumpCont("fugas")`: o contador que o antagonista lê
  desde sempre (*"que eu corro quando aperta"*) e **ninguém escrevia** — um
  sinal dormente que acordou. Suítes de endereço (`acoes-do-jogador`) e da tela
  re-medidas, cada asserção movida com o porquê ao lado.
- **decisões médias, com o motivo:**
  - **O veredito não rola dado.** Porque só assim ele pode ser mostrado inteiro
    antes do clique — uma fuga com d20 escondido só poderia prometer "talvez".
    Determinismo por semente cumprido pela raiz: não há sorte na decisão.
    Os golpes de oportunidade rolam como todo ataque do combate já rola.
  - **Fuga que o sistema já sabe que falha não gasta o turno.** A frase
    digitada recebe a linha do veredito ("Bandido te alcança — não dá para
    fugir.") e a rodada segue intacta; o botão fica impedido com a mesma razão.
    Tentar o que é certo falhar seria um turno roubado — o defeito exato do R15.
  - **Fugir arma e o segundo toque executa** — exceção consciente à regra de W1
    ("o segundo toque nunca é confirmação"), porque fugir é irreversível e a
    lei da casa "o veredito antes do clique" manda. O primeiro toque mostra o
    preço; a linha não diz "para desistir" no botão que vai fazer o oposto.
  - **Escapar acaba a luta sem espólio, sem XP, sem morte registrada**: os
    inimigos seguem vivos no mundo, e o Narrador é proibido de os fazer
    alcançar o herói nessa cena.
  - **"fuja" saiu das frases de fuga** (tirei eu, uma linha): "grito para Elma:
    fuja!" encerraria a luta do herói por uma fala dele. Ordem dada a outro
    ("mando/grito/digo ... fugir") é veto. O portão morde só o necessário.
  - **Formato de save: intocado.** `contadores` já era um objeto aberto.
- **a regra, jogada em número (a mesa que ela desenha):** colado a um bicho tão
  rápido quanto você, nem correndo (1,5 + 18 − 18 = 1,5 ≤ 1,5). Derrubá-lo antes
  (caído persegue à metade) abre a fuga, pagando o golpe dele. Colado a um
  zumbi (6 m): foge correndo, com um golpe. **Empurrar e Derrubar ganharam uma
  razão de ser que não é dano.**
- **prova:** `bash mente/so-o-meu.sh` (HEAD + os meus 13 arquivos) → 210/210
  suítes, 15/15 varredores; `npm run build` limpo na árvore inteira. Na árvore
  cheia o desenho (R21) tem trabalho em voo — `estilo.js`, `ui.jsx`,
  `painel-alforje.jsx`, `marca-da-porta.js`, `formas.md`, `pauta-desenho.md` —
  e o `frontend` viu vermelho **dele** a meio (uma crase em `SUPERFICIES_CSS`,
  `marca-da-porta.js` sem leitor); não toquei, não esperei.
- **o que ficou, escrito para não virar surpresa:**
  - **não joguei a fuga no navegador.** O `frontend` abriu o app (sem erro no
    console) mas não montou um combate posicionado até à frase. A prova é a
    suíte e o R15 rejogado em Node. Um `jogo` que jogue a próxima emboscada
    fecha isto.
  - **atiradores perseguem como corpo a corpo:** a 20 m de um arqueiro o herói
    "escapa limpo" — no mundo, levaria flechas nas costas. Consertar pede
    decidir se fugir de arqueiros deve ser quase impossível; ficou para a mesa.
  - **a corrida é em uma dimensão:** ignora paredes e inimigos dos dois lados;
    o herói encurralado numa masmorra lê o mesmo veredito do campo aberto.
  - **o passo já gasto na rodada é ignorado:** a fuga usa o passo inteiro.
  - **a fila do sistema continua parada**; nenhum item novo aberto.

---
## 23/09 · v9.281 · decisão de sequenciamento, sem ciclo, sem commit

- **não é um ciclo — é uma pausa da automação, com o motivo escrito**, porque
  a pessoa entregou o julgamento a quem regia e pediu que ficasse registrado.
- **o que mudou:** a fila foi retomada mais cedo hoje (`.claude/fila-pausada`
  removido, `taverna-ciclo` religado) e, minutos depois, a pessoa pediu foco
  total em visual/gameplay e levantou um risco de sequenciamento: o ciclo
  automático do sistema e o `regente` (redesign da tela principal) podem
  decidir a mesma coisa de dois jeitos, sem um saber do outro.
- **a decisão: `taverna-ciclo` volta a DESLIGADO** (só ele — `.claude/fila-pausada`
  não foi recriado, e o `regente` segue rodando normal). Motivo: o risco não é
  hipotético. Os dois alvos que a pessoa deu hoje ao redesign —
  **a tela principal** e **o sistema de decisões** — moram exatamente no
  território do ciclo automático (`src/turno.js`, o despachante de turno;
  `src/cena.js`, a estrutura de cena; `src/*.js` em geral). Um ciclo
  automático que pegasse um item de `mente/pauta.md` tocando decisão ou cena
  — sem saber que o `regente` está a meio de decidir a forma e o fluxo dessas
  mesmas telas — arriscava exatamente o retrabalho que a pessoa disse não
  querer: a fila resolve de um jeito, o `regente` decide diferente dias
  depois, e o primeiro trabalho vira lixo.
- **o que não mudou:** `mente/pauta.md` continua como está — nada foi
  arquivado, adiado item a item, nem marcado. Religar é rápido (só o
  `enabled: true` da tarefa) e não perde nada; por isso não houve necessidade
  de tocar na fila em si, só no gatilho automático dela.
- **para retomar:** quando o `regente` entregar a primeira análise/plano da
  tela principal (o que já está em andamento), reavaliar — provavelmente dá
  para religar o ciclo automático restringido a itens que não tocam decisão
  nem cena/tela, ou religar cheio se o plano do `regente` não encostar em
  `turno.js`/`cena.js`. Quem religar, decida com o plano em mãos, não às
  cegas.

---
## 16/09 22:55 · v9.280 · F3 · a família `intocado` chega à escada · commit `f706cf2`

- **estado inicial:** este ciclo **morreu uma vez** — o `backend` foi cortado a
  meio do veredito por um limite de sessão, sem escrever nada no disco — e foi
  **retomado** em vez de renascido, que é a lei nova da casa. A trava foi tomada
  às 22:28Z por um ciclo agendado (que herdou uma trava morta de 18:36Z) e ficou
  comigo; limpei a linha morta do `backend` em `mente/agora.json`.
- **a árvore estava suja, e a sujeira não era minha:** 743 linhas do **E4**,
  vivo, com o bastão do `App.jsx` renovado às 22:32Z — incluindo **`src/grid.js`**,
  que ele estava a mudar naquele minuto. Não lhe toquei, não usei `stash` nem
  `checkout --`, e o meu veredito saiu de `bash mente/so-o-meu.sh`.
- **conselheiro:** **não chamado** — fase aprovada, etapa escrita. *(E não semeei
  a pauta: a pessoa pediu pausa depois deste ciclo.)*
- **backend:** `ESCADA_DA_GUARDA` e as 5 linhas novas de `GUARDAS`
  (`habilidades.js`), o veredito em comentário, as 3 trocas de dívida
  (`poder-de-classe.js`) e a correção da conta de colisões (`efeitos.js`).
- **testes:** `testes/teste-intocado.mjs` — **106 asserções**, nova; a §10 de
  `check-protecao`; e **uma asserção movida com o motivo escrito** em
  `teste-arena.mjs`.
- **prova:** build limpo. `so-o-meu.sh` com os meus 7: **202/202 suítes · 14/14
  varredores**. Árvore inteira, com o E4 dentro: **203/203 · 15/15**.
  **Zero linhas de `App.jsx`.**

### O VEREDITO — desenho antes de código, e a colisão não existia

**`intocado` não é uma família: são três promessas debaixo de um rótulo.**

| | o que promete | quantas | onde mora |
|---|---|---|---|
| 1 | **o golpe que erra** | 8 | a escada de `GUARDAS` — é a que F3 paga |
| 2 | **imunidade a condição** | 5 | o catálogo de condições — endereço abaixo |
| 3 | **zona e fuga** | 5 | o lugar e o movimento |

`estaIntocavel` responde à promessa **de prazo**, e a v9.53 já a respondeu:
absoluta por 1 turno (8 PM), entortada por 3–4. **O que a família traz não é uma
segunda resposta à mesma pergunta — é o degrau de baixo, que a escada nunca
teve: 2 e 4 PM.** Sustentam-no o comentário de `GUARDAS` (*"quanto mais absoluta
a promessa, mais curto o prazo"*), a precedência `guardaDe` antes de
`aplicacaoDoBuff` já escrita em `arena.js:220` e `App.jsx:7622`, e os dois
leitores vivos de `combate.js`. **Nada esbarrou em lei; nada subiu como pesado.**

**E a régua já estava escrita, sem ninguém a ter lido.** As três esquivas da
v9.53 obedecem, sem exceção, a `floor(PM / 2)` — 7→3, 7→3, 8→4 — e as cinco de
`tipo: "defesa"` **não** obedecem, o que confirma a régua: lá o preço é a CA,
aqui é o prazo. Virou `ESCADA_DA_GUARDA`, lida de volta por duas provas.
`turnosDoAbsoluto: 1` é a outra metade: Vazio Perfeito compraria 4 turnos pela
conta e leva 1, **porque é absoluto**. O absoluto barato foi **recusado de
propósito**: entregar *"anula o golpe"* a 2 PM desfaria a escada pelo degrau
mais barato.

### As 18

**Passam a cumprir — 5:** Esquiva Ágil, Defesa Fluida, Dança das Sombras,
Antevisão, Corte de Espelhos. **Já cumpriam e ninguém sabia — 3:** Vazio
Perfeito, Dança Sem Vulto, Nada Me Alcança — **o rótulo `intocado` de P1 nasceu
por cima de mecânica viva.** **Não passam — 10**, cada uma com o motivo nomeado
em asserção.

### Decisões médias, com o motivo

1. **Subir as cinco, e não quatro.** A catraca fica **inteiramente verde** (32
   células, amplitude 12,5 contra teto 20, margem mais fina a melhorar de 5,1
   para 6,1 pt) — e a lei é *meça e não reequilibre*. **Mas `sombra` desce 55,1 →
   46,5 % no retrato**, e o dígito fica escrito na pauta para a avaliação da
   pessoa, com a alavanca nomeada: desligar **uma** linha (`esquiva_agil`)
   devolve a catraca a HEAD byte a byte e deixa 4 de 18 — ao preço de perder a
   única que a arena vê.
2. **A causa não é a tabela, é a política do piloto** (`companheiros.js:273`):
   `guarda` vence de tudo **sem perguntar quanto vale**, e `sombra` troca um
   turno de rodada 1–2 por uma compra de 2 PM. A sensibilidade **confirma** a
   régua em vez de a acusar: com 3 turnos — o que a régua **proíbe** a 2 PM —
   `sombra` sobe a 58,6 % e a amplitude a 15,8.
3. **A asserção do teto de guardas mudou de FORMA, não de severidade**, com o
   motivo ao lado: `tetoDeGuardasNosProntos: 0` virou **lista nomeada**
   (`["sombra:Esquiva Ágil"]`). Um teto que sobe é a doença — no dia seguinte
   sobe para 2 e ninguém vê; uma lista obriga quem acrescentar a segunda a
   escrever o que ela fez ao equilíbrio.
4. **A conta de colisões estava a falar de duas coisas** e foi corrigida em
   `efeitos.js`: contra `absorve` eram 1 e **continuam 1**; contra a tabela
   inteira já eram **4** na v9.233, e depois de F3 são **9** — todas da mesma
   família e resolvidas pela mesma precedência de uma linha.
5. **Um bug achado de passagem, com teste que o prova** (leve):
   `esquivaDeGuarda(pers, null)` estourava no destructuring — a armadilha que a
   própria lei nomeia (`= {}` não cobre `null`).

### Onde morde, e o que as réguas não veem

**600 golpes contra o mesmo alvo:** 68,5 % de acerto nu → **47,2 %** com
qualquer esquiva de pé (−21,3 pontos de acerto, −35,8 % de dano). O absoluto, no
mesmo banco: **0/600**. É a escada inteira em dois números, e a paridade fecha
em ~4 de dano evitado por 2 PM — o que `absorve` compra a 2 PM.

**Esta é a primeira etapa da Fase F que a arena realmente vê:** guarda **não**
passa por condição, logo a cegueira que F2 mediu (`prepararDuelista` zera
`condicoes`) **não se aplica aqui**. Em compensação, **a régua de Uma Vida é
cega por ROSTER, não por mecanismo** — o grupo dela é Guerreiro, Mago, Clérigo e
Engenheiro, e as cinco são de Ladino, Monge, Andarilho e duas subclasses que ela
nem alcança. **Nenhuma das duas mede a mesa de campanha com um herói Ladino ou
Monge**, que é exatamente onde o jogador vai sentir isto.

- **o que ficou, com endereço:** (1) **a imunidade temporária** — e a dívida é
  **maior** do que se pensava: `imuneA` só é consultada em **dois** sítios, e os
  dois são **autoinfligidos**; a aflição que um **inimigo** impõe entra por
  `rolarAflicao`, que **não pergunta a `imuneA` coisa nenhuma** — nem a
  imunidade **permanente** do elmo Sem Medo protege hoje de um medo lançado
  contra você. Não é etapa de prazo: é a porta única da aflição, e vem antes.
  (2) **o degrau da CARGA** — *"o próximo golpe erra"*, gasto na primeira
  batida, molde de `absorverDano`; é o único absoluto que não acaba o combate, e
  precisa de um escritor **em cada mesa** (o `App.jsx`, com bastão, e
  `arena.js`) — meia ligação faria as duas mesas divergirem. (3) **a política do
  piloto**.
- **`AGUARDAM` fica em 38:** nada pago, **três dívidas trocadas e escritas**.
  Dizer que desceria seria a contabilidade a mentir — a escada paga
  *desvantagem*, e as fichas dizem *"anula"*: a mesma distância que
  `AMORTECIMENTO_DO_BUFF` mantém entre a "metade" da ficha e o quarto que cobra.
- **para a pessoa decidir:** o **−8,6 de `sombra`** é o único dígito desta etapa
  que pode querer os olhos dela, e está na pauta com a alavanca de uma linha.

---

## 16/09 20:45 · v9.279 · os dois pedidos da mesa · commit `e112017`

- **estado inicial:** trava posta às 20:10 (não existia). Árvore limpa fora de
  `mente/pedidos-ao-sistema.md`, que o **E4 estava a escrever naquele minuto**.
  `npm test` **200/200 · 14/14** de entrada.
- **o item não foi uma fase, e é o passo 2 do roteiro a valer literalmente.**
  F3 estava disponível, mas `mente/pedidos-ao-sistema.md` tinha um pedido **com
  relógio**: o E4 escreveu-o no **começo** do ciclo dele, de propósito, e
  avisou por escrito que sem resposta a marca de borda cairia para E5 *"por
  falta de três campos num objeto que já os tem"*. **Um pedido parado trava uma
  fase inteira do outro lado.**
- **conselheiro:** **não chamado** — a fila dos pedidos estava cheia.
- **backend:** `lugarDaAcao`/`LUGAR_NA_ACAO` (`combate.js`) e a peça pura do
  passo (`PASSO_NA_RODADA`, `passoQueResta`, `podeDarUmPasso`, `passoAposAndar`
  em `grid.js`).
- **testes:** `testes/teste-onde-foi.mjs` — nova; `teste-grid` 160 → **182 ok**.
- **prova:** build limpo, `npm test` **201/201 suítes · 14/14 varredores** na
  árvore inteira. **Não precisei de `so-o-meu.sh`: não havia vermelho de
  ninguém.** **Zero linhas de `App.jsx`** — o bastão é do E4 desde as 18:05Z e
  o dono esteve vivo o ciclo inteiro.

### A primeira pergunta era se são a mesma ferida — e não são

| | pedido 1 | pedido 2 |
|---|---|---|
| laço | `turnoDosInimigos` (`combate.js:299`) | `moverPara` (`App.jsx:14570`) |
| função do grid | `alcanca` — **mede**, não move | `caminhar` — **move**, devolve `custoM` |
| quem age | o inimigo | o herói |
| onde a ferida mora | **no motor**: a medida existe e é deitada fora | **só no `App.jsx`** |

Partilham `grid.js` como módulo e **nada mais** — nenhum estado, nenhuma
chamada em comum. **Um conserto cada**, e perguntar primeiro custou dez minutos
e evitou um conserto que não existia.

### Pedido 1 — pago

A ação passa a levar **`onde`**, **`alvoOnde`** e **`metros`**: a conta que o
laço já fazia em `alcanca`, usava para decidir o golpe e **deitava fora antes
de voltar**. Nenhum nome é novo — `onde` é o vocabulário que o próprio laço usa
nos alvos, `metros` é o que `alcanca`, `moverInimigos` e
`detectarAlcanceImpossivel` já devolvem.

**Aditivo por construção**, que era a condição imposta pelo leitor no `App.jsx`
que eu não podia editar: `lugarDaAcao` devolve `{}` quando não há o que dizer, e
espalhar `{}` não acrescenta chave. **Sem grade nenhum dos três nasce** — e a
distinção importa: *"não sei onde ele está"* não pode parecer *"está a 0 m"*.
Zero metros **medido** continua a nascer, porque colado é medida de verdade.
**Teto de prompt intocado.**

### Pedido 2 — não era o que o pedido dizia, e essa é a parte que vale

**Não falta desconto em `movimento.js`: a luta nasce sem `economia`.**
`equiparCombate` (`App.jsx:4929`, a porta única de `abrirCombate`) monta a mesa
com `rodada: 1` e `recursos`, **e sem `economia`** — ela só nasce na virada de
rodada. E o desconto do passo faz `eco ? { ...eco, movM: sobra } : eco`: **sem
`eco`, evapora**. A rodada 1 inteira é de graça, que é exatamente os 21 m com a
marca parada em `9 de 9`.

**E a mesma linha em falta tem um segundo sintoma:** a guarda da ação está
atrás de `if (eco)`, logo o aviso *"você já usou sua ação nesta rodada"*
**nunca dispara na rodada 1** — e isso **bate com a medição de W2**, que contou
**zero chamadas** àquele literal e não soube dizer porquê. Uma linha em falta,
dois sintomas, e um deles estava medido há duas fases sem diagnóstico.

**A peça pura ficou feita e provada**, em `grid.js` colada a `alcancaveisDe` —
que é onde `METROS_POR_QUADRADO` e `custoM` já vivem; uma segunda cópia de 1,5 m
noutro módulo seria o `PISO_DO_GOLPE` outra vez. `passoQueResta` devolve `null`
para *"ninguém andou ainda"* (nunca `0`) e **nunca mais que o total de hoje**:
passo que encolhe não é burlável por saldo antigo.

**A asserção que falha antes e passa depois NÃO foi entregue verde, e é
honesto dizer porquê:** o defeito vive em **seis linhas do `App.jsx`**, e
escrever a catraca agora deixaria a suíte **vermelha por trabalho que não é
meu**. As seis substituições ficaram endereçadas uma a uma no pedido, e **a
primeira delas paga sozinha os 21 m e o aviso da ação**.

- **o que ficou:** as seis linhas de fiação (bastão), e o pedido marcado `[~]`
  com o diagnóstico inteiro em vez de `[ ]` com a queixa.
- **decisão média:** responder a fila dos pedidos **antes** de F3. A razão é de
  relógio, não de valor: F3 espera sem custo, o pedido de E4 tinha prazo escrito
  e uma fase do outro lado dependia dele.
- **para a pessoa decidir:** nada novo. O +2 de defesa (F2) continua onde está.

---

## 16/09 19:50 · v9.278 · F2 · o abrigo cai no corpo certo · commit `3bac9b6`

- **estado inicial:** trava posta às 19:00 (não existia). Árvore com o E3 a
  trabalhar ao lado; ele **fechou durante o ciclo** (commits `512b944` e
  `b7b9812`, v9.277) — por isso os comentários da mão, que datavam v9.277,
  foram **redatados para v9.278** antes do commit: a versão mudou debaixo dela.
  `npm test` verde de entrada e de saída.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o portador `amparo` (`aflicoes.js`) com `alvo: "aliados"`, os
  dois comentários de `combate.js` que trancam a moeda desligada, e `AGUARDAM`
  reescrito.
- **testes:** `testes/teste-protege.mjs` — **47 asserções**, 7 seções, nova;
  mais a §9 de `check-protecao` (57 → 65 ok) e `teste-afl`.
- **prova:** `npm run build` limpo, `npm test` **200/200 suítes · 14/14
  varredores** na árvore inteira; `so-o-meu.sh` com os 7 arquivos, o mesmo.
  **Zero linhas de `App.jsx`** — o bastão nunca esteve comigo, e o dono estava
  vivo o ciclo inteiro (a regra dos 90 minutos é para dono morto).

### O que a família paga não é quanto, é EM QUEM

`absorve` compra pontos, `amortece` compra proporção — e `protege` promete
**um corpo que não é o de quem usou**. Quatro entradas de `AGUARDAM` já o
diziam com todas as letras: *"a guarda sobe em QUEM USA"*, *"a condição
`protegido` cai em quem usou, não no aliado"*, *"o mesmo abrigo no corpo
errado"*.

**E a máquina já existia** — é a terceira etapa seguida em que procurar paga
mais que escrever. `PORTADORES` tem a coluna `alvo` com `"aliados"` **vivo e
com três leitores** (App `:7725` e `:7825`, `regua-combate.mjs:747`). Nasce o
portador `amparo`, e **6 das 8** passam a cair no corpo certo: Muralha, Círculo
Sagrado, Espírito Guardião, Muralha Viva, Espírito Vigia, Totem de Guarda.
Armadura Sombria fica em `proprio` porque promete o **próprio** corpo — está
certa onde está; Bênção do Bosque não tem verbo de proteger e é apanhada antes
pela linha 0 (`veneno`).

**Quatro das seis não tinham portador NENHUM por uma letra:** `prote[çc]` casa
"proteção" e **não casa "protege"**, que é o verbo que a ficha usa. É a
armadilha exata que H1 apanhou em "protetoras", e estava de pé há versões.

### O achado que reenquadra a etapa: a moeda vale zero

`protegido` é a **única** condição do catálogo com o campo `defesa`, a
descrição que o jogador lê diz **"+2 de defesa"**, e o campo **nunca foi lido
por ninguém**: `mecanicaDe` soma-o desde a v9.0, `modificadoresDeCondicao` não
o devolve e `resolverAtaque` nunca o viu. **34 defensivas do acervo** prometem
esse +2 e entregam zero.

**Provado, não afirmado:** com o corpo corrigido e a moeda morta, a régua de
Uma Vida sai **idêntica ao byte**. As duas metades são **um pagamento só**.

**A mão ligou-a, mediu e desligou-a** — e essa é a decisão que eu confirmo:
são duas linhas em `combate.js`, mas o preço é **balanceamento**, e na dúvida
entre médio e pesado é pesado. Vitória **52,1 → 54,7 %** · PV do grupo
**25,88 → 27,57** · quedas **1,790 → 1,720** · sofrido **240,61 → 235,48** ·
desferido **120,74 → 131,90** · `duro` **8,8 → 10,8 %**, e **caem três
asserções de `teste-regua.mjs`**, uma delas a que garante que o retrato de
B1/B1b/B2/T1 continua alcançável. **Subiu para "Para a pessoa decidir"** com o
preço inteiro escrito, e ficou trancado numa asserção que **acende** se alguém
ligar as duas linhas sem passar por lá.

### Decisões médias, com o motivo

1. **O recorte exige DUAS coisas na frase** — o verbo *proteger* **e** um corpo
   declarado (`aliad` / "o grupo" / "quem estiver perto") — e **não** as
   palavras de abrigo. Medido: trocar uma pela outra leva o recorte de **9 para
   12**, e as três que entrariam não protegem ninguém (uma arrasta um caído,
   outra transfere PV, outra cresce entre o grupo e o perigo). **As três estão
   nomeadas em asserção**, mais o teto `tetoDeAmparos` no varredor. É o cuidado
   que H4 comprou, aplicado antes de custar.
2. **"Aliados" (eu + o grupo) em vez de alvo único**, e o argumento não foi o
   esperado: das 9 frases que mudam de lado, **seis** dizem "um aliado"
   (sobre-entrega) mas **três** dizem "o grupo" e são entregues **exatamente**.
   O estado anterior era pior que sobre-entregar: era **disjunto** da promessa
   — o abrigo caía só no corpo que a ficha **exclui**. Alvo único é mecânica
   nova e pede o bastão; ficou escrito com endereço.
3. **`AGUARDAM` fica em 38, nada pago, quatro dívidas trocadas** — e uma delas
   estava **factualmente errada**: *Elixir de Combate* dizia *"é guarda desde a
   v9.53"*, e não é (`aflicaoDe` devolve `null`, portador nenhum, a condição
   nem nasce). `SEM_DONO_HOJE` **subiu** 2 → 3 pela primeira vez, e a subida é
   uma linha a sair do **silêncio** — expôs de passagem um buraco do contador
   (`comDono` filtrava `a.dono !== null`, e entrada **sem a chave** passava).

- **o que ficou:** o alvo único (bastão); *Bênção do Bosque*, que só passaria
  se `amparo` subisse acima dos debuffs de arma; e um cuidado que vale para
  **F3 e F4** e ficou escrito na pauta — **`prepararDuelista` (`arena.js:128`)
  zera `condicoes` e nada volta a escrevê-las**, logo a arena é
  **estruturalmente cega** a toda família que passe por condição. A identidade
  da catraca **não** é prova de inocuidade; quem mede estas etapas é a régua.
- **para a pessoa decidir:** o item novo no topo da pauta — o +2 que 34 fichas
  prometem entra, e o retrato se recalibra à volta dele; ou a ficha deixa de o
  prometer?

---

## 16/09 18:20 · v9.276 · H4 · a marca pesa no golpe · commit `408a841`

- **estado inicial:** trava posta às 13:55 (não existia). Árvore suja só do
  lado do E3 (a tela da batalha, com o bastão do `App.jsx`). O vermelho de
  `check-formas` que o ciclo anterior deixou declarado **já tinha saído**
  quando fui provar: `npm test` fechou **199/199 suítes · 14/14 varredores**.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o campo `danoRecebidoExtra` e a condição `marcado`
  (`condicoes.js`), os dois lados da conta em `combate.js`, o portador `marca`
  (`aflicoes.js`) e `AGUARDAM` reescrito.
- **testes:** `testes/teste-marca.mjs` — **64 asserções**, 8 seções, nova;
  mais `teste-cond` e `teste-poder-de-classe`.
- **prova:** `npm run build` limpo, `npm test` **199/199 · 14/14** na árvore, e
  `bash mente/so-o-meu.sh` com os meus 7 arquivos: **198/198 · 13/13**.
  **Zero linhas de `App.jsx`** — o bastão nunca esteve comigo.

### O buraco era maior e mais antigo do que a pauta dizia

A pauta pedia *"ler o espelho que falta"* do lado do alvo. Medindo, o defeito
não era uma falta, era uma **confusão de línguas**: `danoExtra` e
`danoReduzido` falam do dano que o portador **causa** — e a prova não é o
comentário de `condicoes.js:87`, que mente por omissão, mas **a descrição que
o jogador lê**: *"fortalecido: +2 no dano causado"*, *"enfraquecido: −2 no dano
causado"*. `combate.js:127` lia `modAtk.danoExtra` do lado certo e
`modAlvo.danoReduzido` do lado errado; `modAtk.danoReduzido` e
`modAlvo.danoExtra` **não eram lidos em lugar nenhum**.

**O número que decidiu:** golpe de 10 pela fórmula velha — **10** sem a
Maldição do Patrono, **8** com ela. Amaldiçoar o inimigo **endurecia-o**.

**Ler o espelho de `danoExtra` do lado do alvo teria empilhado a segunda
confusão sobre a primeira.** O que entrou foi a separação das duas perguntas:
quanto o portador **causa** e quanto o portador **recebe**, em campos que não
se confundem, cada um lido no lado certo.

### Decisões médias, com o motivo

1. **Nasceu UM campo, não dois.** `danoRecebidoExtra` entra; o espelho
   `danoRecebidoReduzido` **não** — *"apanhar menos"* já tem **dois donos
   vivos** (o abafo de F1 e o abrigo de P3), os dois na fila do dano com régua
   e prazo próprios. Um terceiro campo seria a mesma regra em três cabeças com
   uma só paga. Ficou **ponteiro** no catálogo e uma asserção que **acende** se
   alguém o criar.
2. **A marca entra PLANA**, e essa era a convenção que o arquivo já praticava
   sem a dizer (`modAlvo.danoReduzido` já ficava fora do parêntese): o do
   atacante soma em `danoBase` e **dobra** no crítico, o do alvo não. Base 10,
   quem bate `fortalecido`, alvo `marcado` → **14**; em crítico **26**, não 28.
3. **O regex é frase inteira.** Doze frases do acervo contêm "marca" e **onze**
   começam por *"Marca um alvo"* prometendo coisas sem relação entre si. Há
   asserção a impedir que a próxima mão alargue a linha para "resolver" a
   segunda metade por atalho.
4. **O conserto da inversão** (leve, bug com teste que prova) entrou junto, e a
   suíte corre os dois lados **com a mesma semente** — a primeira versão dela
   "provou" o contrário porque comparava dados diferentes, e isso ficou escrito
   no cabeçalho do helper.

### Onde a marca entra na fila do dano

**A montante de tudo.** `resolverAtaque` produz o número **antes** de
`amortece → invocação → abrigo → PV temporário → PV real → a queda`: a marca
não é uma estação da fila, é **o golpe que chega mais pesado à primeira**.

### O veredito de tamanho da segunda metade: ficou escrita, com medida

*"Dano extra SEU"* pede um campo de **dono** que não existe: `criarCondicao`
grava `origem`, e origem é o nome da **habilidade**, não de quem a usou. O dono
atravessaria **5 assinaturas**, e as **duas do meio** (`mecanicaDe`,
`modificadoresDeCondicao`) decidem **só pelo catálogo** — não têm por onde
receber quem ataca. A ponta boa: `resolverAtaque` **já tem `atacante` em
mãos**. A medição está trancada em asserções (§8) que acendem no dia em que
alguém puser dono na instância. É a mesma jogada de H3 com a porta `aflicaoDe`.

### Medido e não reequilibrado

Arena **idêntica número a número** (sombra 55,1 · remendo 54,4 · chama 53,6 ·
voto 51,5 · flecha 49,6 · muralha 46,8 · punho 45,6 · voz 43,3) e régua de Uma
Vida idem (240,61 ± 3,65 sofrido, 120,74 ± 3,44 desferido) — **as duas causas
trancadas na suíte**: `prepararDuelista` zera `condicoes`, e a régua só aplica
aflição que não cai no alvo. Viva onde morde: 600 golpes de 12 contra o mesmo
alvo dão **7 416 sem a marca e 8 568 com ela (+15,5 %)**.

**E o que as réguas NÃO veem, dito aqui em vez de escondido:** `enfraquecido`
chega ao jogo por **6 frases do acervo** mais o bestiário, e o conserto **vira
o sinal** — quem o carrega apanhava −2 e passa a bater −2, **4 pontos de troca
por golpe**, e nenhuma das duas réguas o enxerga. Não toquei em número de
tabela nenhum.

- **o que ficou:** o **dono** da marca (a segunda metade), a pílula do HUD —
  `App.jsx:21603` mostra `mec.danoExtra` e não tem irmã para `danoReduzido` nem
  para `danoRecebidoExtra`, logo quem está enfraquecido ou marcado **não lê o
  número na barra**; é da mesa de desenho e do bastão, e fica dito.
- **`AGUARDAM` 39 → 38:** saiu **Julgamento**, a única que paga inteiro. Marca
  do Caçador e Maldição do Patrono ficam com a dívida **trocada e escrita**;
  `SEM_DONO_HOJE` 4 → 2 (sobram Coração Tempestuoso/H5 e Mina Oculta/H6).
- **para a pessoa decidir:** nada novo foi para "pesado" neste ciclo.

---

## 16/09 17:05 · v9.275 · H3 · a cura tem relógio · commit `7bd9291`

- **estado inicial:** trava posta às 16:05 (não existia). Árvore suja só do
  lado da outra mente (E3, a tela da batalha, com o bastão do `App.jsx` desde
  as 12:58Z). `npm test` com um vermelho que não era meu.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `REGENERACAO_DO_BUFF` + `regeneracaoDaHabilidade` (`efeitos.js`),
  o ramo `cura`/`fontes` em `tickEfeitos` e `pousarCura` (`regras-jogo.js`), o
  pouso e a porta única `firmarNaArena` (`arena.js`), `textoDaHabilidade`
  público (`combos.js`), o ponteiro em `condicoes.js` e `AGUARDAM` reescrito.
- **testes:** `testes/teste-cura-turno.mjs` — **92 asserções**, nova; mais a
  §8 de `check-protecao` e a §7 de `check-cura-nao-limpa`.
- **prova:** `npm run build` limpo. `bash mente/so-o-meu.sh` com os meus 10
  arquivos: **197/197 suítes · 13/13 varredores**. Na árvore, `check-formas`
  acusa uma pílula em `src/painel-habilidades.jsx` — arquivo que a outra mente
  **criou no E3 naquele minuto**. Não consertei e não esperei.

### A pergunta que decidiu a etapa, e quem a respondeu foi a contagem

**Onde mora o espelho de `danoTurno`: na condição ou no efeito?** As duas eram
defensáveis, e o que decidiu foi um número:

| relógio | chamadores vivos | alcançáveis sem o bastão |
|---|---|---|
| `tickCondicoes` | 3 (`App.jsx:8347`, `:8418`, `:8471`) | **0** |
| `tickEfeitos` | 4 (3 no App + **`arena.js:360`**) | **1** |

Um `curaTurno` em `CONDICOES` nasceria **inerte neste ciclo** — e inerte é
exatamente o pecado que a Fase F existe para pagar. **Um sítio contra zero:**
o campo mora no efeito, e a cura pousa em PV **hoje**, com **zero linhas de
`App.jsx`**. É a mesma jogada de F1, e pela mesma razão: procurar quem já
roda antes de escrever quem ainda não. Ficou um **ponteiro** ao lado da
documentação de `danoTurno` para ninguém refazer a pergunta nem criar a régua
duas vezes. **O campo não foi posto nos dois** — seria a mesma regra em duas
cabeças com só uma paga.

### Onde a cura entra na fila — a pergunta que o ciclo tinha de responder

**Fora dela.** A fila do dano (o abafo de F1 → a invocação → **abrigo → PV
temporário → PV real → a porta da queda**) corre no **meio** do turno; o
relógio corre no **fim**, no mesmo instante em que o irmão cobra o veneno.

Provado, um turno inteiro: teto 20, vida 9, veneno 2, regeneração 3, golpe de
6 → o golpe morde 9→3, o veneno 3→1, o relógio devolve 1→**4**. E o
contrafactual é o que a ordem compra: com **3 de vida e um golpe de 4**, curar
antes **apagaria a queda**. Curar no meio da rodada e curar no fim dela são
jogos diferentes, e este escolheu o fim.

**O relógio não levanta os caídos** — guarda espelhada de `App.jsx:8350`.
Invertê-la toca a porta da queda (Fase Q), e isso é da pessoa: declarado, não
feito.

### Decisões médias, com o motivo

1. **O espelho no efeito e não na condição** — pela tabela de chamadores acima.
2. **`textoDaHabilidade` passou a público** em `combos.js`: os dois
   classificadores passam a ler **a mesma régua**. Duas leituras do mesmo texto
   é a forma de divergirem daqui a três versões.
3. **`firmarNaArena`** extraído das 5 linhas duplicadas de `arena.js` — mesma
   lei de porta única que `passarPeloAbrigo` cumpre no App.
4. **`AGUARDAM` continua 39, e devia mesmo.** As três dívidas foram
   **trocadas, não apagadas**: Círculo Sagrado fica com a zona (H6), Renovação
   com o ramo do grupo, Chamado da Chuva com o clima sem leitor. Duas ganharam
   `dono` medido, e **`SEM_DONO_HOJE` desceu de 6 para 4** com o motivo na
   asserção, como F1 fez. Meia promessa paga não sai da lista — encolhe nela.

### Medido e não reequilibrado

Catraca da arena **idêntica número a número** contra HEAD puro (sombra 55,1 ·
remendo 54,4 · chama 53,6 · voto 51,5 · flecha 49,6 · muralha 46,8 · punho
45,6 · voz 43,3 · amplitude 11,8), 420 quedas e 5 848 linhas iguais — e a
**causa está trancada na suíte**: nenhum dos 8 prontos regenera. A régua idem.

Que é viva, é: um duelista com **Chamado da Chuva** dá **8 prazos firmados, 14
pousos e 27 PV devolvidos** em 6 quedas; sem a habilidade, zero de tudo.

- **o que ficou:** a fiação dos três tiques do `App.jsx` (uma linha de
  `pousarCura` em cada, dentro de `calou(...)`) e a porta `aflicaoDe`, que
  continua a sair **antes** de `efeitoDeBuff` — o mesmo portão que F1 mediu.
  A suíte imprime a medição em vez de a travar: *"App.jsx: 3 chamadas ao
  relógio dos efeitos, 0 pousos de cura"*. Mais a cura de **grupo** e a zona
  do Círculo Sagrado (H6).
- **para a pessoa decidir:** se o relógio deve levantar quem caiu. Hoje não
  levanta, por espelho fiel do irmão que cobra o dano.

---

## 16/09 13:40 · v9.274 · F1 · a família `amortece` passa a cobrar · commit `c1038e5`

- **estado inicial:** trava posta às 09:25 (não existia). Árvore limpa fora de
  `mente/agora.json` e dos rascunhos de K4 da outra mente. `npm test` **194/194
  suítes** mas **12/13 varredores**: `check-imports` acusava
  `constantes.js: usa "ALVOS" sem importar`. Nunca se constrói sobre vermelho,
  então foi o primeiro item — e era **falso positivo do próprio varredor**.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `AMORTECIMENTO_DO_BUFF` (`src/efeitos.js`, colada à irmã
  `ABSORCAO_DO_BUFF`), a chave `amortece` a nascer em `efeitoDeBuff`, e a
  **estação nova** dentro de `amortecerDano` (`src/tracos.js`). Mediu a arena e
  **não** a ligou. Comentários de `companheiros.js` e `poder-de-classe.js`
  corrigidos; `AGUARDAM` de 40 para 39.
- **testes:** `testes/teste-amortece.mjs` — **193 asserções**, 9 seções,
  0 falhas; e `check-protecao.mjs` ganhou a seção 7 e o dente
  `amorteceForaDaFamilia`.
- **prova:** `npm run build` limpo. Na árvore, `npm test` dá **195/196** com
  `teste-ligacao` vermelha por `estilo.js:TELA_DE_BATALHA` — **export da outra
  mente, do E3, em edição naquele minuto**. Provado com
  `bash mente/so-o-meu.sh` (HEAD + só os meus 8 arquivos): **196/196 suítes e
  13/13 varredores**. Não consertei e não esperei, como manda a lei.

### Onde a família entra na ordem do dano — o coração da etapa

A fila do herói é `amortecerDano` (origem) → `repartirDano` (invocação) →
`passarPeloAbrigo`, e este último é **abrigo → PV temporário → PV real → a
porta da queda**. O abafo entra na **primeira estação, sobre o golpe cheio**,
antes do abrigo e do poço: quem reduz por **proporção** tem de morder o número
cheio, senão o mesmo buff vale metade contra quem tem escudo e o dobro contra
quem não tem; quem come um valor **fixo** morde o que sobrou, porque para ele a
ordem não muda o total.

Dentro de `amortecerDano`, **depois das duas metades de origem e antes da
redução fixa**, por três razões que são regressão se invertidas: (i) a redução
fixa continua a última, regra que o cabeçalho já escrevia antes de F1 existir;
(ii) a porta `d >= 4` da Pele de Pedra passa a ver **o mesmo número que vê
hoje** — se o abafo cortasse antes, um Goliath com o buff deixaria de gastar a
Pele em golpes que hoje a gastam, mudança de traço racial por causa de uma
habilidade, e silenciosa; (iii) a Pele é um **gasto** e rende mais sobre o
número cheio, enquanto o abafo não se gasta e pode esperar a vez.

Provado com a fila inteira: Goliath com abafo de 25% e escudo de 6 contra um
golpe de 20 → Pele 20→10 → abafo 10→8 → invocação 8 → abrigo 8→**2**.

### Decisões médias, com o motivo

1. **A moeda é porcentagem, não pontos.** `absorve` compra pontos porque o
   abrigo morre na primeira batida; `amortece` vale em **todo** golpe do prazo,
   então a régua é medida no total. A paridade está escrita degrau a degrau no
   cabeçalho e cobrada pela suíte: 2 PM → 10% → ~3 no total contra os 4 que a
   irmã come; 4 PM → 20% → ~9 contra 8. Quem paga 4 PM por proteção recebe
   proteção de 4 PM, venha ela de uma vez ou repartida.
2. **O teto é 25%, e é onde a tabela recusa a letra da ficção.** As fichas
   dizem "metade". Metade **durante turnos** seria a Pele de Pedra — um gasto
   de uma vez por luta — ligada a toda a cena por 3 PM. A lei que `GUARDAS` e
   `ABSORCAO_DO_BUFF` já escreveram é *nada que zere o golpe*, e ela vale aqui.
   **A ficção diz metade; o sistema paga um quarto, e paga em todo golpe.**
   É a decisão mais discutível do ciclo e está declarada de propósito — se a
   pessoa quiser a metade literal, é mudar um número de tabela.
3. **A arena foi medida e NÃO foi ligada.** Ligar `amortecerDano` em
   `arena.js` faria a família cumprir nas duas mesas, mas acenderia junto os
   **traços raciais** que a catraca nunca mediu: **3 dos 8 prontos** têm origem
   que ele lê (A Muralha/Goliath, A Chama/Tiefling, O Punho/Anão). Numa cópia
   descartável a catraca **quebra**: muralha 46,8 → 62,5 no retrato, 66,9 em
   "bb", três famílias fora da faixa, amplitude 21,8 contra teto 20. Não é
   zero, então não liguei — o número fica escrito para F2.
4. **`AGUARDAM` 40 → 39.** `Postura Defensiva` saiu (atravessa a porta
   inteira). `Corpo de Ferro` ficou, com a dívida **trocada** de "a mecânica
   não existe" para "a porta não abre", e com `dono` escrito. O motivo da
   mudança do teto está no comentário da asserção, como a lei pede.
5. **O varredor deixou de acusar quem reexporta** (commit `2b99c79`, antes do
   item). `check-imports` não conhecia `export { X } from`, e quem levava a
   acusação era decidido pela **ordem alfabética**: há dois reexports no
   projeto, e `portao.js` escapava só porque vem depois de `cena` no alfabeto.
   Um varredor que grita por engano perde o único valor que tem.

### O achado honesto, e é o que F2 herda

**As 8 da família nascem com número; só 2 atravessam a porta de produção de
hoje** (`Postura Defensiva` e `Proteção contra Energia`). As outras 6 não casam
com `aflicaoDe`, e `aplicarBuffDeHabilidade` (`App.jsx:8136`) sai **antes** de
`efeitoDeBuff` — o efeito nunca chega à ficha. Isso é `App.jsx`, cujo **bastão
esteve com a outra mente o ciclo inteiro** (E3, a tela da batalha), e fica
declarado em vez de meio-feito. É a mesma lição de W2: meia troca é a mesma
regra em dois caminhos.

- **o que ficou:** a porta `aflicaoDe`; a arena, com o número que a proíbe
  hoje; o piloto dos companheiros **intocado de propósito** (P2 provou que
  procurar vem depois de cumprir); e `protege`, `intocado` e `nao_cai` ainda
  com força zero — **mas o molde está estabelecido**, que era o que F1
  prometia: tabela irmã + chave que só nasce quando existe + estação na fila
  do dano + seção no varredor.
- **para a pessoa decidir:** nada novo foi para "pesado" neste ciclo. A única
  coisa que pede o olho dela é a decisão 2 — o quarto em vez da metade.

---

## 16/09 09:25 · v9.272 · Z1 · o recálculo, e a prova de que ele não se mexe · commit `400748a`

- **estado inicial:** trava `.claude/ciclo-em-curso` **não existia** — mas
  `mente/agora.json` tinha, por commitar, duas linhas de um Z1 **que morreu
  antes de escrever uma linha de código** (`orquestrador` e `backend`, com
  `desde` marcado às 22:00Z, hora que ainda não aconteceu). **Registo de ciclo
  morto**, como manda o roteiro: nada no disco além daquelas duas linhas, que
  reaproveitei com a hora certa. Árvore de resto limpa, `npm test` verde de
  entrada. A outra mente estava viva ao lado no K4 (trava
  `.claude/ciclo-desenho-em-curso` das 08:47, `mente/k4-desenho.md` por
  commitar) — **nada disso entrou no meu commit**, e o bastão do `App.jsx`
  nunca esteve comigo.
- **A versão não mudou debaixo de mim desta vez** — reli `src/constantes.js`
  imediatamente antes de bumpar, como Y1 ensinou, e ainda dizia `v9.271`.
  Fui para `v9.272`. A releitura continua a ser barata e a suposição continua
  a ser cara.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/recalculo.js` (4 exports) e a extração da fórmula de PV/PM
  de `src/prontos.js:171-173` para `corpoDaFicha`.
- **testes:** `testes/teste-recalculo.mjs` — **54 asserções**, 0 falhas, e a
  medição de divergência impressa em vez de travada.
- **prova:** `npm run build` limpo, `npm test` **194/194 suítes verdes**.
  Não precisei de `mente/so-o-meu.sh`: não havia vermelho de ninguém.

### As três propriedades, e como cada uma ficou provada

1. **Idempotente** — n = 1..10 sobre **1 008 fichas** (12 classes × 7 níveis,
   escolhidos nos degraus onde `bonusProficiencia` vira, × 2 configurações de
   atributos × 3 antecedentes × {certa, torta}). A asserção é tripla: `mudou`
   falso na 2.ª passagem, igualdade profunda 2.ª↔10.ª, e `recalc^n ===
   recalc^1` ficha a ficha. *"Abrir o jogo dez vezes não move um ponto"* é
   literalmente esta asserção, e está escrito assim no comentário.
2. **Mudo quando não é preciso** — a asserção é **identidade referencial**
   (`r.ficha === pers`), não só `JSON.stringify` igual. **É a diferença que
   importa:** um clone com as mesmas chaves passa num teste de JSON e continua
   a ser uma escrita. Só a identidade prova que nem sequer houve cópia.
3. **Deriva das tabelas** — a suíte **remonta** a fórmula de `vidaBase`/
   `manaBase`, `pv`/`pm` do antecedente e `PV_POR_NIVEL`/`PM_POR_NIVEL`, e o
   teto de nível sai de `XP_ACUMULADO.length` em vez de um `20` escrito à mão.
   Nenhum número na asserção; é o que a faz sobreviver a uma mudança de tabela.

### As decisões médias, com o motivo

- **O recálculo NÃO sobe de nível pelo XP — e esta é a decisão pesada da
  etapa.** Subir exige **gastar** o XP; `xp` não é campo governado; logo um
  nível movido sem o XP gasto sobe outra vez na leitura seguinte. Medido com a
  própria tabela: nível 1 com 100 000 XP daria **1 → 12 → 16 → 18 → 20 em
  quatro aberturas** — literalmente o *"status diferente em cada gameplay"*
  que a pessoa proibiu. O dono da subida continua a ser `aplicarNivel`
  (`regras-jogo.js:37`), que roda a cada ganho de XP e por isso garante
  `xp < custo(nivel)` em toda ficha bem formada. Aqui o nível é **saneado**
  (`floor`, nunca `round` — arredondar para cima daria meio degrau de graça) e
  serve de entrada para os outros três. **O desenho errado ficou escrito no
  teste pelo nome e pelo número** (§5b), no molde do "desenho A" de
  `teste-trava-da-reacao`, com uma asserção a provar que ele move mesmo a
  ficha: senão a catraca não saberia reconhecer o erro no dia em que voltasse.
- **Ausência não é divergência.** Campo `null`/`undefined` não discorda.
  Nenhuma ficha de hoje guarda `proficiencia` — deriva-a na leitura — e
  escrevê-la em todo save seria mudar dado do jogador **sem necessidade**, que
  é metade da ressalva. Quem guarda o campo e o guarda errado é corrigido. E
  **`0` não é ausência**: `vidaMax: 0` é ficha partida e é consertada.
- **`vida`/`mana` correntes ficaram de fora.** A lei da etapa é *nada fora de
  `CAMPOS_DO_RECALCULO` é tocado, nunca*. Se um teto cair, uma ficha pode
  ficar com `vida > vidaMax` — **quem apara o corrente é quem aplica na tela,
  com o veredito antes do clique.** É hand-off explícito para Z2.
- **Não passa por `antecedentePorId`.** Aquele leitor cai no primeiro da lista
  quando não acha — serve à criação, que precisa sempre de um antecedente, e
  aqui daria o corpo do Órfão a qualquer nome escrito errado. Quem pergunta
  pelo corpo quer a verdade ou o silêncio, nunca um palpite.
- **Duas asserções do `testes` ficaram vermelhas contra o módulo e foram
  reescritas — nenhuma afrouxada, e o motivo está em comentário nas duas.** A
  mão de testes tinha presumido que o recálculo derivaria o nível do XP; o
  contrato nunca o disse e o `backend` decidiu o contrário com razão medida.
  A segunda exigia que o recálculo escrevesse por cima de campo ausente, e
  virou a §7b — a asserção da lei que ela estava a contrariar.

### O achado: quantas fichas divergem, e quanto

**Do recálculo novo: nenhuma.** 0 de 8 prontos e 0 de 504 fichas certas; nem
um PV nem um PM se move. Os oito prontos saíram **idênticos byte a byte** à
extração — medido por snapshot `JSON.stringify` da ficha inteira antes e
depois, não só dos dois campos.

**Da recalibração de hoje, sobre o mesmo corpus de 144 fichas: quase todas.**
O PV mexeria em **120 de 144** (erro médio 4,5 PV; pior caso um Mago nível 20,
128 → 145, **+17**) e o PM em **138 de 144** (erro médio **19,7 PM**; pior
caso o mesmo Mago, 90 → 46, **−44**). A razão está nomeada: ela usava
`pvEsperadoJogador` (`combate.js:465`), que é a **régua do balanceamento** —
estimativa de classe média — e nunca foi a ficha de ninguém; e inventava o PM
numa linha solta (`App.jsx:20853`) que não batia nem com `prontos.js` nem com
a tela de criação. **Nada foi ajustado para caber:** é achado, e é ele que
justifica Z2.

**A honestidade da medição:** o corpus é *construído*, não é um save real de
uma partida real — não há fixture de save no projeto. Os 0/8 dos prontos são
fichas de verdade; os 0/504 são fichas montadas como o jogo as monta (criação
no nível 1 + `aplicarNivel` pagando o XP exato de cada degrau). **Quantas
fichas de jogador de verdade divergem, só Z2 saberá**, ao correr o recálculo
num load a sério.

### O que já existia e foi reusado em vez de reescrito

A lição de H2 (6 dos 12 assuntos já tinham dono) e de Y1 (3 das 4 peças já
existiam) pagou-se a terceira vez: **os quatro números já tinham dono.**
`bonusProficiencia` (`regras.js:12`), `XP_ACUMULADO` (`regras.js:38`),
`PV_POR_NIVEL`/`PM_POR_NIVEL` (`regras-jogo.js:34-35`), `vidaBase`/`manaBase`
(`classes.js`), `pv`/`pm` (`antecedentes.js`). **Não nasceu tabela nova** — o
que nasceu foi o **lugar único** onde se lê todas elas. E a extração pagou-se
já: a fórmula tinha **três donos** (prontos, criação, recalibração) e o
terceiro já tinha divergido dos outros dois sem ninguém dar por isso.

### O que ficou

- **Z2 herda três coisas:** as três portas por fechar (save, mundo, ascensão,
  incluindo o botão que diz *"⚖ Recalibrar com a IA"* em
  `painel-ascensao.jsx:35` e `:229`), **o aparo de `vida`/`mana` correntes**
  quando um teto cai, e a medição real contra saves de jogador. Precisa do
  bastão do `App.jsx`.
- **Uma armadilha latente, já com catraca.** `corpoDaFicha` usa
  `(cObj && cObj.vidaBase) || 10` — um `||`, não um `??`. Hoje as 12 classes
  têm `vidaBase`/`manaBase` verdadeiros; uma classe futura com `vidaBase: 0`
  cairia no default de 10 em silêncio. A §6 fica vermelha nesse dia. Não é bug
  hoje, e não foi mexido para não mudar número.
- **Nada para a pessoa decidir** neste ciclo.

---

## 16/09 08:00 · v9.271 · Y1 · `Empurrar` e `Derrubar` ganham motor · commit `384c3d5`

- **A VERSÃO MUDOU DEBAIXO DE MIM, e é registo de processo.** Abri o ciclo com
  `v9.269` lido em `src/constantes.js` e planeei `v9.270`. Quando fui bumpar,
  ao fim do ciclo, o `constantes.js` **já dizia `v9.270`**: a outra mente
  fechou K3 (`9901996`) enquanto eu trabalhava e levou o número. Reli o
  arquivo em vez de aplicar o que tinha planeado, e fui para **`v9.271`** — a
  lei diz que em conflito de `VERSAO` fica o número maior. **É exatamente o
  motivo por que o `CLAUDE.md` manda ler a versão no arquivo e nunca de um
  exemplo escrito**, e desta vez o exemplo que envelheceu era o meu, com meia
  hora de idade. Três textos meus já diziam `v9.270` e foram corrigidos.
- **estado inicial:** árvore com a outra mente (K3) viva ao lado — `App.jsx`,
  `estilo.js`, `ritmo-da-reacao.js`, `formas.md` e dois `k3-*.md` modificados,
  mais `painel-reacao.jsx` e `palavras-da-reacao.js` por commitar. **Nada
  disso era meu e nada disso entrou no meu commit.** A trava
  `.claude/ciclo-em-curso` **não existia** (o ciclo de V1 fechou-a); pus a
  minha. O bastão do `App.jsx` estava com o `regente`/`oficial` desde as
  07:42 — **menos de 90 minutos, logo vivo: não lhe toquei**.
- **o vermelho que me foi anunciado e que já não existia:** o briefing avisava
  de um `teste-ligacao` sobre `ritmo-da-reacao.js`, arquivo da outra mente.
  No meu `npm test` de fecho ele estava **verde** — a outra mente fechou-o e
  commitou K3 durante o meu ciclo. Não precisei de `so-o-meu.sh`.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/disputa.js` (7 exports), três nomes novos em `src/grid.js`
  e o buraco de X2 fechado em `src/golpe.js`.
- **testes:** `testes/teste-disputa.mjs` (163 asserções), a asserção movida em
  `testes/teste-golpe.mjs` e a sonda `testes/sonda-empurrao.mjs`.

### As decisões médias, com o motivo

- **UM módulo para os dois verbos, não dois.** `Empurrar` e `Derrubar` são o
  **mesmo teste oposto com dois desfechos**; dois módulos seriam dois motores
  da mesma regra, e o dia em que um mudasse o outro mentiria. O nome
  `disputa.js` é o que o próprio código já usava para a ausência:
  `golpe.js:245` dizia *"o motor não tem disputa entre duas fichas"*.
- **O deslocamento forçado ficou em `grid.js`, não em `disputa.js`.** A lei da
  etapa era *não criar um segundo motor de movimento*, e quem é dono da
  posição, da parede e da casa ocupada é o tabuleiro. `disputa.js` decide
  **quem ganha**; `grid.js` decide **para onde o corpo vai**.
- **Empate ganha quem resiste.** O empurrão é de graça em consequência — não
  custa vida, não erra crítico. Uma ação barata que ganhasse empates seria
  clicada todo turno.
- **A resistência tem duas portas (Força/Atletismo ou Destreza/Acrobacia, a
  melhor).** Sem a segunda, uma ficha de Destreza alta e Força zero não teria
  defesa nenhuma contra um botão.
- **Vitória com destino bloqueado NÃO causa dano.** Dano de parede seria
  mecânica nova, e mecânica nova é da pessoa. O resultado diz `bloqueio` e o
  alvo fica onde estava — está escrito no cabeçalho que foi deliberado.
- **A força de quem não tem ficha saiu da linha para a tabela.** O inimigo do
  bestiário não tem `atributos`; o precedente de produção (`aflicoes.js:99`)
  resolve-o pelo nível. A **forma e o número são dele** — só a régua mudou de
  casa, e agora a suíte lê-a de volta.

### O que já existia e foi reusado em vez de reescrito

A lição de H2 (dos 12 assuntos, 6 já tinham dono) pagou-se outra vez: **três
das quatro peças já existiam.** A condição prono é o `caido` de
`condicoes.js:120` — **não nasceu condição nova**; o portão de tamanho é a
`ESCADA` de `grid.js:95`, cujo comentário já dizia, literalmente, que é ela
que dá sentido a *"empurrar um degrau"*; e a perícia estava escolhida desde
sempre, porque a descrição de `atletismo` em `pericias.js:40` já continha a
palavra **"empurrar"**. O que faltava mesmo era só o **teste oposto** e o
**passo forçado numa direção**.

**E uma armadilha de nome que quase custou caro:** `src/queda.js` (Q1) tem
`GOLPE_NO_CAIDO`, mas ali "caído" quer dizer **inconsciente a 0 PV**, não
prono — mecânicas opostas com o mesmo nome. Há agora uma asserção que prova
que `disputa.js` **não importa `queda.js`**, para que a próxima pessoa não as
funda.

### A asserção que se moveu, e por que não foi afrouxamento

`teste-golpe.mjs` dizia `"esquivar,empurrar,derrubar"` continuam sem motor.
Ficou mentira no dia em que Y1 nasceu. Foi movida para `"esquivar"` com ~25
linhas de motivo escrito por cima — e **ganhou um segundo dente**: a tabela
nomeia `disputa.js`, e uma asserção nova importa-o e prova que as funções
nomeadas **existem mesmo**. Sem isso, fechar o buraco seria escrever uma
string no campo `motor`.

### O efeito na distância, medido — e a régua que não servia

**A régua de B1 não pode medir isto, e está provado no próprio arquivo:** ela
roda com `grade: null` (`regua-combate.mjs:935`, declarado em `:484-486`), e
`TABULEIRO_NA_REGUA` lista `"distancia"`, `"posicao"` e `"deslocamento"` em
**`naoMede`** — além de os três cenários estarem **saturados** (duro 0,0% ·
justo 1,6% · brando 100%). Foi a ressalva de Q1 confirmada por leitura, e não
por suposição. Então a medida foi feita por **sonda** sobre as `PLANTAS`
reais: 10 plantas × 2000 empurrões, com sorte semeada.

- **1,50 m por empurrão bem-sucedido, sem dispersão nenhuma.** A hipótese
  escrita **antes** de medir era que a diagonal desse menos (Chebyshev);
  **estava errada**, e a sonda di-lo — que é toda a razão de se medir.
- **Bloqueio: 22,1% das vitórias** em bruto; **5,6%** contando só alvos que não
  começavam encostados à moldura (a colocação uniforme infla a `borda`; os
  dois números estão declarados).
- **E o terreno importa de forma diferente em cada planta:** masmorra 10,5% ·
  taverna 10,4% · cidade 8,0% · ruína 7,5%, contra floresta 1,2% · deserto
  1,7% · estrada 2,0%. É o que um verbo de posição devia fazer.
- **Contra a caminhada de W1** (1,4 rodadas = 12,6 m por luta): um empurrão
  vale **0,167 rodada (11,9%)**, e um turno de empurrão devolve **16,7%** do
  que um turno de corrida devolve. **Empurrar não é uma forma barata de fazer
  distância — e não devia ser:** gasta o turno inteiro para mover uma casa
  alguém que resiste. O que ele compra é posição.
- **Nada foi reequilibrado**, como a etapa mandava.

### O que ficou

- **A fiação é Y2, e não foi por escolha:** o bastão do `App.jsx` esteve com a
  outra mente o ciclo inteiro. Os dois botões continuam a só escrever uma
  frase na caixa. Entrou na pauta como **Y1b**, médio.
- **O reforço entra na luta sem `x`/`y`** (X3b/X4) — **esbarrei e não
  consertei**, como mandado. `deslocarForcado` e `destinoDoEmpurrao` tratam-no
  defensivamente (não estouram, devolvem motivo), e o achado **continua
  aberto**.
- **Para a pessoa, se quiser:** dar ao bicho a destreza real (`des`, que o
  bestiário já traz) na resistência ao empurrão, em vez de só o `nível/4`. A
  linha está pronta na tabela, com o motivo — mas é mecânica nova, logo dela.
- **Nota de processo:** as duas mãos correram em paralelo contra um contrato
  que eu pinei, e mesmo assim ele derivou quatro vezes (`{dx,dy}`↔`{x,y}`, o
  campo `total`, `destinoDoEmpurrao` a sair e voltar). O paralelo poupou
  tempo, mas **o contrato pinado não bastou**: com módulo novo e suíte nova ao
  mesmo tempo, vale sequenciar ou pinar até o formato de retorno.

---

## 16/09 07:55 · v9.269 · V1 · o poço que apanha por você · commit `056dcd2`

- **HOUVE UM CICLO MORTO, e é a primeira coisa que este bloco regista.** A
  trava `.claude/ciclo-em-curso` estava posta às **05:09** com o meu nome e
  este item (`orquestrador · V1 · o PV temporario`), e o ciclo **morreu no
  limite de uso da API — não por falha**. Às 07:38 ela tinha 2h29, muito
  acima dos 90 minutos do roteiro: assumi-a em vez de esperar por ela, e
  reescrevi-a com a hora nova e a nota `(assumido de um ciclo morto)`. **Não
  desfiz nada do que ele deixou**, e a razão é que o que ele deixou estava
  quase todo de pé: `src/temporario.js` (414 linhas), `testes/teste-temporario.mjs`
  (967 linhas, 212 asserções) e `src/efeitos.js` ligado. Desfazer teria
  queimado uma etapa inteira por causa de uma linha de comentário.
- **estado inicial:** `npm test` **190/191**, e a única vermelha era
  `teste-regua.mjs` — a catraca da seção 9, *"e nada do jogo importa a régua
  — nem sequer a menciona"*, com `temporario.js` a nomeá-la. Árvore com a
  outra mente viva ao lado (K3): `mente/formas.md`, `mente/k3-jogo.md`,
  `mente/k3-desenho.md` e `mente/agora.json` são dela e **não entraram no meu
  commit** — `git commit -- <caminhos>`, como a lei manda.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **UM VERMELHO QUE NÃO É MEU, e a prova de que não é.** No fecho, `npm test`
  acendeu `teste-ligacao.mjs` em `ritmo-da-reacao.js:TEMPOS_DO_CARTAO` — um
  export sem leitor num arquivo **da outra mente**, que apareceu na árvore no
  meio do meu ciclo (K3, com `src/estilo.js`). Não o consertei e não esperei
  por ele: `bash mente/so-o-meu.sh src/temporario.js src/efeitos.js
  src/constantes.js testes/teste-temporario.mjs` dá **HEAD + só os meus =
  191/191 suítes verdes · 13/13 varredores limpos**. Verde ali é verde meu, e
  foi com isso que subi. A catraca de K3 morde quem a pôs, e é assim que ela
  tem de funcionar.
- **o bastão do `App.jsx`: NÃO TOMADO.** É da outra mente (K3). V1 é só
  motor; V2 (a tela) fica para quem tiver o bastão, e o que ela vai precisar
  está **escrito** no cabeçalho de `src/temporario.js`, não por descobrir.
- **backend:** uma coisa só, e a certa — tirou o nome do instrumento de
  medida do comentário de `src/temporario.js`. Três frases reescritas: *"a
  régua tem de ser a de cima um degrau acima"* → *"a **medida** tem de ser"*;
  a abertura que citava o arquivo e o caminho virou *"**MEDIDO, e não
  estimado** — a medição inteira (N, cenários, intervalos) está escrita no
  diário desta versão; aqui fica só o que justifica o número"*; e a ressalva
  de Q1 virou *"**a medição correu com `grade: null`**"*. Os números da
  tabela **não foram tocados**.
- **testes:** nenhuma suíte escrita neste ciclo — as do ciclo morto já
  cobriam tudo (212 asserções em 10 seções). `grep -rn "regua-combate" src/`
  sai **vazio**; `teste-regua.mjs` fechou **150 ok · 0 falhas**.

- **decisões médias tomadas** (cada uma com o motivo, que é o que se audita):
  1. **A catraca não foi afrouxada — o código é que passou a cumpri-la.** A
     saída fácil era pôr `temporario.js` numa lista de exceções de
     `teste-regua.mjs`. Seria a casa a escrever que *às vezes* o jogo pode
     falar do instrumento que o mede, e a próxima exceção viria de graça. O
     dente da seção 9 fica com os dentes todos.
  2. **O número medido fica, o nome de quem mediu sai.** O comentário de um
     número de tabela é o que torna a lei *"se é número, é tabela"*
     auditável — apagar o **porquê** de `teto: 9` para calar a catraca teria
     trocado um vermelho por uma regra sem razão escrita. Então ficou o fato
     (9,69 de dano por corpo por rodada; **9 é o maior inteiro abaixo**) e
     saiu a proveniência, que passou a morar aqui, no diário — que é o lugar
     do registo de medição.
  3. **Não desfiz o ciclo morto, assumi-o.** O roteiro manda desfazer *"se a
     árvore estiver pela metade"*; esta não estava — estava a uma linha de
     comentário do verde, com build limpo e 212 asserções de pé.

- **A MEDIÇÃO, POR EXTENSO** (é aqui que ela mora agora, e é o que
  `src/temporario.js` quer dizer com *"o diário desta versão"*):
  instrumento `testes/regua-combate.mjs`, **300 combates por cenário**,
  herói equipado (arma, armadura, escudo) e o trio de nível 5.
  · `justo` — **6,30 ± 0,25 rodadas**, **243,91 ± 6,82** de dano no grupo
    inteiro (quatro corpos) → ~38,7 por rodada → **9,69 por corpo por rodada**.
  · `duro` — 5,09 rodadas, 223,92 de dano → **11,00** por corpo por rodada.
  · `brando` — 2,95 rodadas.
  Daí os dois números da tabela: **`teto: 9`** é o maior inteiro abaixo de
  **9,69** (manda o menor dos dois, porque é na luta mais branda que uma
  rodada de graça é mais barata de comprar) — o poço mais caro que o sistema
  pode dar **nunca compra uma rodada inteira de impunidade**, que é a mesma
  lei que o teto 12 escreveu para o golpe. E **`turnosPadrao: 7`** é o
  primeiro inteiro acima da margem de cima de 6,30 ± 0,25, porque um poço que
  expira no meio da luta é o mesmo que não existir.
  **MEDIDO, E NÃO REEQUILIBRADO:** nenhum número do jogo mudou neste ciclo.
  **E COM A RESSALVA QUE Q1 IMPRIMIU:** a medição corre com **`grade: null`**
  — sem tabuleiro, todo golpe alcança toda gente e ninguém gasta rodada a
  andar. É **limite otimista, não o jogo**. Com grade a luta é mais longa (X1
  mediu 2 a 3 rodadas só de caminhada), logo **7 é piso da duração real e não
  o retrato dela** — o poço cobre a luta medida, e na luta de verdade pode
  acabar antes. Se um dia a régua ganhar grade, é este 7 que se remede.

- **A ORDEM DO DANO, COM A QUEDA NO MEIO** (o cuidado que Q1 tornou
  necessário, e a pergunta que a pessoa fez):
  `abrigo (família absorve) → TEMPORÁRIO → PV real → a porta da queda`
  · **O temporário é consumido ANTES de `quedaAoChegarAZero` ser perguntada
    — e não por uma regra nova.** Sai por **composição**: `absorverDano`
    (efeitos.js) é a **única** porta por onde o dano passa antes de virar PV,
    e a porta de Q1 só é perguntada quando o **PV real** chega a zero. Q1
    ficou **intocada — nem uma linha**.
  · **O abrigo vem primeiro por regressão**, não por gosto: ele gasta-se
    inteiro assim que toca num golpe, e pôr o poço à frente mudaria *quando*
    ele se gasta — o escudo passaria a render mais do que rende hoje. Com o
    abrigo primeiro, a fase é **puramente aditiva**: ficha sem temporário
    devolve byte a byte o que devolvia antes.
  · **Provado, e não afirmado** (`teste-temporario.mjs` §7): um herói com 3 de
    vida apanha um golpe que **sem** o poço o levaria a 0 — e a 0 a porta de
    Q1 decide se ele cai. **Com** o poço consumido antes, o PV real fica
    acima de zero e *"a porta da queda NUNCA chega a ser perguntada"*; sem
    ele, a porta responde que o herói cai — e o desfecho é **lido de volta**
    de `quedaAoChegarAZero`, não escrito à mão, para acompanhar sozinho o dia
    em que "cai" mudar de palavra. **Ninguém cai com escudo de pé.**

- **"FICA O MAIOR", PROVADO NOS DOIS SENTIDOS** (§3, §4 e §9):
  `POUCO depois MUITO` e `MUITO depois POUCO` dão **MUITO** nos dois casos, e
  a asserção **nega a soma explicitamente** (`!== POUCO + MUITO`) para dizer o
  que impede, não só o que espera. Três lançamentos seguidos do mesmo poço
  continuam a dar **um** poço. A oferta menor **não é aceite, não escreve
  linha nenhuma** e devolve a **mesma** ficha que entrou (o empate idem — um
  objeto novo faria a fiação de cima piscar por uma mudança que não existe),
  mas ainda diz **porquê** para o log. E **não cura**: `vida` e `vidaMax` saem
  intocados nos dez caminhos, inclusive com o maior poço possível sobre um
  corpo moído. O "fica o maior" tem **um dono só** (`vereditoDoTemporario`), e
  §9 compara as duas pontas (`absorverDano` e `gastarTemporario`) nos mesmos
  seis pares e cobra o mesmo número, o mesmo resto e a mesma frase — sem
  espiar o código.

- **o que ficou (o que V2 herda, escrito e não por descobrir):**
  1. **`tickTemporario` não é chamado por ninguém** — o relógio da rodada é
     de V2, ao lado de `tickEfeitos` (`regras-jogo.js:369`). **Enquanto não
     andar, o poço dura para sempre.** É a dívida declarada desta etapa.
  2. **`ganharTemporario` também não tem quem o chame** — a torneira (poção,
     milagre, habilidade) é de V2/V3. O módulo nasce com a regra pronta e a
     torneira fechada, de propósito.
  3. **`vereditoDoTemporario` é a tela de V2**: `haEscolha: true` é o sinal de
     que o jogador tem uma decisão de verdade (4 contra 10) e de que ela deve
     aparecer **antes do clique**.
  4. **O furo de `arena.js:249`**: ela escreve de volta só `outro.efeitos`
     quando `absorvido > 0`, e o poço vive em `pers.temporario`, que essa
     linha não copia — num duelo, o temporário seria gasto e esquecido a cada
     golpe. **Hoje não morde ninguém** (nada põe temporário num duelista); no
     dia em que puser, é essa linha que mente. `App.jsx` (`passarPeloAbrigo`)
     já devolve `ab.pers` inteiro e não tem o problema.
  5. E o par disso: `ab.linha` é `""` quando o `absorvido` vem só do poço, e a
     arena empurraria `"Nome — "` para o log. **`linhaDoTemporario` existe
     para V2 ter o que pôr ali.**

---
## 16/09 08:20 · v9.268 · Q1 · quem cai, e quem só morre · commit `7a519be`

- **estado inicial:** trava `.claude/ciclo-em-curso` **ausente** — pus a
  minha. Árvore só com `mente/agora.json` e dois documentos da outra mente
  (K2), que ela commitou durante o ciclo. `npm test` **verde de saída**.
  `VERSAO` relida em `src/constantes.js` antes de datar: `v9.266` no início,
  e a outra mente subiu `v9.267` (`ae1be0b`, `d5b9569`) **no meio do ciclo**
  — **releio antes de fechar e redatei 7 comentários** de `v9.266` para
  `v9.268`. É exatamente a armadilha que custou 32 redatações em H1, e desta
  vez a segunda leitura apanhou-a.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **o bastão do `App.jsx`: NÃO TOMADO.** `.claude/app-jsx` era da outra
  mente (W2/K2, 06:40). A etapa foi desenhada para caber **só no motor**: o
  App foi lido e não tocado, e a fiação ficou **escrita** no cabeçalho de
  `src/queda.js` para Q2 a aplicar de uma vez.
- **backend:** `src/queda.js` (novo) — `DONOS_DA_QUEDA` (herói **sempre**,
  companheiro **sempre**, inimigo **se importante**), `quedaAoChegarAZero`
  como porta única que nunca lança e nunca devolve `null`,
  `APELIDOS_DO_LADO` (cobre o `ref` de `combate.js` sem tradução à mão),
  `ehImportante` que só aceita `importante === true`, e `GOLPE_NO_CAIDO`.
  Em `src/bestiario.js`, o campo declarado `importante` no molde do
  `degrau` de N2, e `completarInimigo` a carregá-lo até à ficha que chega à
  luta — pela terceira vez que esta casa paga por uma tabela que a mesa não
  vê (`perfil` v9.152, `degrau` v9.259).
- **testes:** `testes/teste-queda.mjs` (novo, 81 asserções em 8 seções) e
  `testes/sonda-queda.mjs` (novo, medição). A suíte deriva a expectativa da
  **coluna `testa` da própria tabela** em vez de repetir 1/2/3 à mão, varre
  22 entradas tortas e 16 valores falsos de `importante`, e prova o contrato
  com `aplicarTesteMorte` empurrando falhas pelo motor real até `morto`.
  `teste-ligacao` **20/1 → 21/0** e `check-mortas` **1 → 0 exports sem
  leitor**: `falhasDoGolpeNoCaido` nasceu sem leitor e a suíte fechou-o no
  mesmo dia, que é o que a catraca existe para forçar.

- **decisões médias tomadas** (cada uma com o motivo, que é o que se audita):
  1. **O módulo chama-se `queda.js` e não reescreve `testeDeMorte`.** A
     decisão ("cai ou morre?") e a sorte ("resiste ou enfraquece?") são duas
     perguntas; misturá-las tornaria Q1 improvável sem semente. `combate.js`
     ficou **intocado**.
  2. **O padrão de quem não se declarou é MORRER DIRETO.** Um lado
     desconhecido que caísse ganharia imortalidade por acidente, e o nome
     inventado pelo Narrador é o caso comum, não o raro.
  3. **5 das 27 criaturas declaram `importante`** — Dragão Jovem, Lich,
     Dragão Ancião, Comandante, Horror. Critério escrito: aparece sozinha e
     nomeada, e o jogo perde o fim dela se acontecer sem cena. Deixei duas
     exceções de propósito — o **Comandante** é `elite` e declara, o
     **Colosso** é `lendario` e não — porque são a prova viva de que o campo
     **não** sai da `ameaca`, que é a adivinhação que a pauta proíbe.
  4. **`e.importante` vindo da IA é ignorado.** O Narrador nomeia; quem
     declara mecânica é a tabela. Torna `completarInimigo` idempotente.
  5. **O golpe em quem já caiu custa 1 falha (2 no crítico) e 0 em quem não
     testa.** O ciclo exigia que a tabela dissesse o que faz com os 13,4%-18%
     de N1; a alternativa — deixá-lo evaporar — premia o azar de quem já
     perdeu alguém. `falhasAteMorrer: 3` espelha o literal de
     `aplicarTesteMorte`, com a suíte a provar que os dois concordam.
  6. **Contadores de diagnóstico no retorno de `simularCombate`**
     (`danoEmCaidos`, `golpesEmCaidosPorNome` e mais cinco). Somar campo ao
     retorno não muda veredito: **`CATRACA_DE_UMA_VIDA` intacta**, nenhum
     limiar tocado, nenhum cenário alterado.
  7. **Corrigi o cabeçalho de `queda.js` eu mesmo** depois da medição, em
     dois pontos: os números de N1 e a frase "o herói escapa por acidente".
     Comentário que mente é pior que comentário ausente, e este ia para Q2
     como instrução.

- **a medição, e ela diverge de N1 — não se forçou o número antigo.**
  1000 sementes, família `umavida`, IC 95%, Adversário ligado:

  | | justo | duro |
  |---|---|---|
  | golpes em corpo caído | 4,97 ± 0,13 | 5,43 ± 0,14 |
  | dano em corpo caído | 61,20 ± 1,65 PV | 67,18 ± 1,83 PV |
  | fração do dano inimigo | **20,02%** | **22,68%** |
  | *projeção Q1:* quedas que virariam morte | **0,868 ± 0,047** | **0,990 ± 0,050** |

  N1 escreveu 13,40%/18,03%; mediu-se **20,02%/22,68%**. A causa está no
  próprio diário: N1 mediu **antes de N1b** (o conserto da ordem da rodada) e
  com parte da conta vinda de uma reconstrução de scratchpad que o diário já
  marcava como reconstrução. Com o Adversário **desligado** os mesmos
  contadores dão 3,78%/6,59% — nenhuma das duas pontas reproduz 13,40%, e
  quem gera a sobra é quem concentra fogo.
  **Duas ressalvas que viajam com todo número acima:** (a) a régua corre com
  `grade: null` (X4) — **não tem tabuleiro**, todo golpe alcança, logo isto é
  o **limite otimista** do desperdício e nunca "o jogo"; (b) tudo na metade de
  baixo é **projeção**, porque Q1 não liga nada e a mesa de verdade reagiria
  (quem morre deixa de ser alvo).
  **Registado e NÃO reequilibrado**, como o ciclo mandou: balancear é da
  pessoa, e a régua está saturada até ela responder sobre o alvo tático.

- **o que Q1 achou e muda o alcance de Q2:** a frase do cabeçalho que dizia
  que **o herói escapa** do desperdício por acidente de referência foi medida
  e **desmentida** — são **2,03 (`justo`) e 1,86 (`duro`)** golpes por combate
  em herói **já** no chão. O filtro de `combate.js:267` tira quem estava
  caído no **início** do passo; quem cai **durante** o passo apanha, herói
  incluído. O conserto da foto é dos **três lados**, e está escrito na pauta
  em Q2.

- **o que ficou:** **Q2 não foi tocada** (o ciclo mandou um item). Continuam
  na fila, e Q1 **não** os tocou porque são fiação: a **queda e a morte de
  companheiro são silêncio absoluto** (`App.jsx:13967`, achado de X3b) e o
  **reforço entra sem `x`/`y` nem iniciativa** (X4). `mente/pedidos-ao-sistema.md`
  foi lido: **nada atendido neste ciclo** — os nove abertos são de `turno.js`,
  `falas.js`, `desafios.js` e do `App.jsx`, e nenhum cabia numa etapa que se
  proibiu o App para não tomar o bastão da outra mente.
- **fechamento:** `npm run build` limpo, `npm test` **190/190 suítes · 13/13
  varredores**. Não houve vermelho da outra mente para separar — K2 e W2
  estavam verdes. `bash mente/so-o-meu.sh` (HEAD + só os nossos) deu
  **189/189 · 13/13**, 189 porque `teste-trava-da-reacao.mjs` da outra mente
  ainda não estava em HEAD quando se provou.

## 16/09 07:10 · v9.266 · H2 · de quem já são os 12 · commit `59dab1e`

- **estado inicial limpo, pela primeira vez em três ciclos.** Trava ausente —
  pus a minha. `git status` só com `mente/agora.json` (o painel), a outra mente
  com o `App.jsx` já commitado (`eadef55`, D3). `npm test` **verde de saída:
  188/188 suítes, 13/13 varredores.** `VERSAO` relida em `src/constantes.js`
  **antes** de datar qualquer comentário — `v9.265` em HEAD e na árvore, logo
  esta etapa sai **v9.266**. (H1 teve de redatar 32 comentários por não fazer
  isto; desta vez a outra mente não subiu no meio, mas a releitura custou nada.)
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **o bastão do `App.jsx`: NÃO TOMADO.** A etapa era medição e registro em
  `src/poder-de-classe.js`; o App só foi **lido**. A outra mente (K2) precisava
  dele para aplicar as quatro frases que W2 deixou prontas e transbordando —
  deixá-lo livre custou zero a esta etapa e destrava a dívida do outro lado.
- **backend (medição):** mediu os 12 contra o projeto inteiro, com um script
  descartável no scratchpad que corre os despachantes reais sobre as `HAB(...)`
  de `classes.js`. Cita arquivo e linha em cada veredito.
- **backend (registro):** as 12 entradas de `AGUARDAM` ganharam o campo `dono`
  e o `motivo` reescrito; o cabeçalho perdeu a lista dos sete assuntos e ganhou
  o resultado. **40 12 6** confere. Não tocou no App, nem em `constantes.js`,
  nem nos testes.
- **testes:** seção 9 de `teste-poder-de-classe.mjs` — exatamente 12 com `dono`,
  nenhuma das outras 28, forma `src/<arquivo>.js · <algo>`, **o arquivo nomeado
  existe no disco** (`existsSync`, resolvido por `import.meta.url` e não pelo
  cwd), e `semDono <= SEM_DONO_HOJE` (6), local ao teste. 196 asserções, 0
  falhas. Nenhuma asserção de H1 movida nem afrouxada.

### O número, e por que ele é menor

Dos 12: **6 já têm dono** (2 vivo, 4 parcial), **6 não têm**. Dos **sete**
assuntos, **quatro caíram**, e nenhuma linha de mecânica foi escrita para
descobrir isso:

- **contra-conjuração já acontece** — a reação `contramagia` (`reacoes.js:35`)
  é concedida por nome na ficha e a fiação está viva. **Contramágica cumpre
  hoje.** O que não existe é o inimigo *conjurar* — e isso é **decisão
  escrita** em `controle.js:26`, não buraco;
- **PM de volta tem dono vivo, mas não o que a linha dizia:**
  `sacrificarInvocacao` (`invocacoes.js:197`), não `gastarRecurso`
  (`combate.js:745`) — que é **export morto**, e a suíte já o travava;
- **clima tem motor vivo e semeável** (`rolarClima`), **sem leitor de número**:
  `palco.js` e `geografo.js` só o narram. Falta leitor, não mecânica;
- **a metade mental da Contra-Canção sai pela porta** que já existe
  (`removerPelaPorta`).

**Ficam quatro assuntos e seis habilidades:** marca, cura por turno, zona
persistente, e aura reativa sozinha na família.

### Decisões médias, com o motivo

1. **`dono` é campo, não prosa** — *"se é número, é tabela"* vale para endereço
   também. Motivo: um veredito escrito só no `motivo` não é legível pela suíte,
   e o que a suíte não lê apodrece. Com o campo, a catraca prova que o arquivo
   citado **existe no disco** — que é o que um rename silencioso quebra.
2. **A catraca dos sem-dono é `<=`, não `===`.** Motivo escrito no teste: um
   `===` ficaria **vermelho no commit que PAGA a dívida**. A suíte tem de
   aplaudir a descida e morder só a subida.
3. **As 40 continuam 40 — nenhuma saiu.** Contramágica cumpre e Foco Interior
   tem molde, mas **`dono` não autoriza ligar nada**: é endereço medido. Sair
   de `AGUARDAM` exige a ligação feita **e provada**, e isso é etapa própria.
   Afrouxar aqui seria usar o campo novo como porta dos fundos para esvaziar a
   lista sem pagar.
4. **A Fase H não fecha em H2 — encolhe.** A pauta autorizava fechar "se sobrar
   pouco". **Sobrou pouco, mas não sobrou nada:** quatro assuntos de mecânica
   real não cabem na fila automática, porque mecânica que muda o que o jogador
   vive é `pesado` pela tabela do `CLAUDE.md`. Escrevi **H3–H6**, uma por
   assunto, na ordem do mais barato ao mais caro — e o que de fato tinha dono
   virou item de "Aberto", não etapa de fase. Sete assuntos viraram quatro
   etapas: **a fase termina menor do que começou, que era o bom sinal.**
5. **H6 (zona persistente) leva trava escrita: não começa sem a palavra da
   pessoa.** Motivo: ela precisa de escrever em `grade.paredes`, e a grade
   **viaja no save** — formato de save é `pesado` explícito na lei da casa. A
   autorização da fase não cobre o que a etapa revelou de novo e grande.

### O que ficou (e virou item da fila, não etapa)

- **Quatro regras que apanham a habilidade errada**, apanhadas na medição e
  **não consertadas de propósito** — a etapa era medir. Uma delas **inverte a
  promessa**: a Maldição do Patrono aplica `enfraquecido`, e `combate.js:127`
  desconta o `danoReduzido` do dano que o alvo **recebe** — amaldiçoar um
  inimigo hoje deixa-o **2 mais duro**. As outras três são regex a apanhar
  palavra dentro de palavra: `chama` em "**Chama**do da Chuva" (põe
  `queimando`), `oração` em "C**oração** Tempestuoso" (abençoa o grupo), e
  `prote[çc]` que **não** casa "prote**gi**da" — esta última é a **mesma
  família** do defeito "protetoras" que a v9.265/H1 corrigiu, o que diz que a
  correção de lá tratou o caso e não a raiz.
- **Três ligações de uma linha**, medidas e não feitas (Foco Interior,
  Contra-Canção mental, Chamado da Chuva) — com o aviso de medir o que a
  terceira compra antes de a escrever: clima que ninguém lê é cenário.
- **Contramágica sai de `AGUARDAM` quando tiver prova**, e aí
  `TETO_DE_AGUARDAM` desce para 39. De quebra, um campo morto a enterrar:
  `funcao: "contramagia"` (`grimorio.js:142`) não está em `FUNCOES_DO_SISTEMA`.
- **Para a pessoa:** a única pergunta que é dela é a trava de H6 — se a zona
  persistente pode escrever na grade que viaja no save.

## 16/09 06:20 · v9.265 · H1 · a porta das habilidades de classe · commit `d99bab3`

- **estado inicial — e ele começa com um ciclo morto.** A trava
  `.claude/ciclo-em-curso` estava posta desde `00:25` (mais de cinco horas), e a
  árvore não estava limpa: **um ciclo H1 anterior morreu no meio, por limite de
  uso da API — não por falha.** `npm test` **vermelho em duas suítes**
  (`teste-arena.mjs`, `teste-guardas.mjs`, 4 asserções). Apaguei a trava velha,
  pus a minha, e tomei o bastão do `App.jsx` (ninguém o tinha). A outra mente
  fechou **W2** enquanto este ciclo corria (`cf91c7a`, `b92ffc0`) e subiu a
  `VERSAO` para **v9.264** — por isso H1 sai como **v9.265**, e não v9.264 como
  as três mãos dataram os comentários. Redatei os 32 comentários antes do
  commit: é exatamente a armadilha que o `CLAUDE.md` nomeia, e ela mordeu de novo.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.

### O que o ciclo morto deixou, e por que foi DESFEITO

Ele deixara **+43 linhas em `src/habilidades.js`**: uma forma nova (`abissal`) e
sete entradas em `GUARDAS`, com comentários bem escritos defendendo três coisas
novas — `valor` negativo como **preço**, `tipo: "amortece"` para dano recebido, e
`escopo` para guarda que cai no aliado. Terminar era uma saída legítima. **Não
era a certa, e as suítes vermelhas é que estavam com a razão:**

1. **`guardaDe` é classificador EXCLUSIVO.** `ehBuff` (`companheiros.js:161`)
   devolve `false` para quem é guarda, e o piloto escolhe guarda **antes** de
   buff. Pôr *Fúria de Batalha* em `GUARDAS` com `valor: -2` **apagaria o +2 de
   dano** que ela já entregava por `aplicarBuffDeHabilidade` e deixaria só a
   penalidade de defesa: a habilidade ficaria **estritamente pior**. A premissa
   escrita no comentário — *"um número com sinal trocado é o preço que faltava,
   sem uma linha de código nova"* — era justamente o erro. O DENTE 4 de
   `teste-guardas.mjs` diz isso em voz alta **desde a v9.232, com o motivo**.
2. **Quatro das sete linhas prometiam motor que ninguém escreveu.** O comentário
   afirmava que `amortecerDano` "passou a ler esta lista por `corteDeGuarda`" e
   que `erguerGuarda` "RECUSA quem tem escopo" — **`corteDeGuarda` não existe em
   lugar nenhum do projeto**, e nenhuma das duas fiações foi escrita. `muralha`,
   `contra_cancao`, `postura_defensiva` e `corpo_de_ferro` seriam erguidas e não
   fariam nada. Isto é *promete na ficha e falha na mesa* — **a própria doença
   que H1 existe para curar**, instalada dentro do remédio.
3. **`amortece` e `escopo` são mecânica nova** — dano recebido, alvo que não é o
   herói. Território de **H2**, que mede antes de construir. Terminar ali seria
   fazer H2 por dentro de H1, sem medição.

`git checkout -- src/habilidades.js`, suíte verde de novo (187/187), e H1
recomeçou limpo. **A forma `abissal` era a única parte sadia do lote e foi
embora junto** — ela volta barata como item de acervo quando alguém quiser.

### A etapa, em três mãos e na ordem certa

- **backend:** `src/poder-de-classe.js` (novo, 392 linhas) — `PODERES_DE_CLASSE`
  (8 entradas), `poderDe`, `temPassivoDeClasse`, `aplicarPoder(pers, hab, ctx)`
  e **`AGUARDAM`**. Mais as linhas de tabela nas casas que já existiam:
  `PRESSAS` (habilidades.js), `CONTROLES` (controle.js), `PORTADORES`
  (aflicoes.js), `resolve: true` nas duas portas de `condicoes.js`, e
  `dobraMovimento`/`ignoraTerrenoDificil` lendo **duas** fontes (dadivas.js).
  `temRegraPropria` ganhou a sétima família.
- **frontend:** `porHabilidadeDeClasse(h, pers, frase)` (`App.jsx:7941`), em
  `try/catch` com `calou`, e nos **DOIS** sítios do laço (`:13448` painel,
  `:13592` citada). Consertou de quebra os 90 endereços que as 87 linhas novas
  envelheceram em `check-acoes-do-jogador.mjs` e nas três suítes vizinhas.
- **testes:** `testes/teste-poder-de-classe.mjs` (novo, **177 asserções**), com
  a régua em tabela (`MEDIDA_DA_PORTA`) e os dentes dos dois lados — nenhuma
  linha órfã, nada fora da tabela vira poder (varrendo 593 habilidades), recusa
  por identidade de objeto, imutabilidade byte a byte, determinismo do alvo.

### O número honesto, e ele é menor do que a pauta previa

A pauta prometia **54 de 66**. A porta derruba **17 agora e provadas** (+3 de
subclasse de brinde, pelas mesmas linhas), e **`AGUARDAM` declara 40**. A conta
fecha porque a medição de v9.250 errou para mais: **9 das 66 já cumpriam** por
leitores que ela não enxergava (`seguraEmPe`, `temVozDeComando`,
`limiteDeInvocacoes`, `RX_SACRIFICIO`). 9 + 17 + 40 = 66.

**Uma porta que derruba 20 e declara 40 vale mais que uma que alega 54 sem
prova** — é a lição da Fase T, e é por isso que a etapa fecha assim em vez de
esticar o número. Das 40: **12 são os de H2** (mecânica nova, intocados de
propósito), **7 caem pela régua do golpe do App** (`HAB_OFENSIVA_RX` procura
palavras de violência e "sopro elemental em cone" não tem nenhuma — já é item
próprio na pauta), **5 são famílias de força zero**, e **16 pedem número que
nenhuma tabela cobra ainda**.

### A catraca — é o que sobra quando a etapa envelhecer

`TETO_DE_AGUARDAM = 40`, com folga **zero**: hoje `AGUARDAM.length === 40`.
Quem escrever amanhã uma habilidade que promete e não cumpre **fica vermelho no
dia em que a escreve**; quem pagar uma dívida **abaixa o número no mesmo
commit**. A suíte também exige que toda entrada tenha motivo (≥25 chars) e
data, que nenhum nome seja fantasma (todos existem no acervo) e que a classe
declarada seja a real. **A lista só encolhe.**

### Decisões médias, com o motivo

- **Desfazer em vez de terminar** o lote do ciclo morto — os três motivos acima.
  A parte sadia (`abissal`) foi junto porque separá-la custaria mais que
  reescrevê-la, e ela não é da fase.
- **Fechar H1 em 17 em vez de esticar para 54.** O resto exige ou mecânica (H2),
  ou consertar `HAB_OFENSIVA_RX` (item próprio), ou números que nenhuma tabela
  cobra — cada um é outra etapa, e enfiá-los aqui produziria exatamente a
  promessa vazia que a catraca existe para impedir.
- **Cinco asserções viradas do avesso, não afrouxadas.** Diziam que *Purificar*
  e *Palavra de Coragem* aguardavam resolvedor; o resolvedor chegou. Cada uma
  passou a exigir o **cumprimento** com o motivo e a data escritos, a sabotagem
  de T4 ganhou **dois** substitutos (uma que prova que `coberturaDasCondicoes`
  lê o campo, outra que prova que `removerPelaPorta` o lê também), e o controle
  negativo de `temRegraPropria` **trocou de habilidade** (Passo do Vento →
  *Palma dos Sete Ventos*, dano puro) em vez de sumir.
- **`Palavra de Coragem` fica nas duas listas, de propósito** — o medo sai por
  esta porta, o PV temporário não existe. Meia promessa cumprida é meia dívida.
  Em vez de afrouxar a não-sobreposição, a suíte trancou a exceção por
  **igualdade** (`MEIA_DIVIDA`): qualquer outra sobreposição fica vermelha, e no
  dia em que o PV temporário nascer esta linha cobra a saída da entrada.
- **Sem bloco de prompt novo.** `PODER_DE_CLASSE_PROMPT` não existe de
  propósito: `HABILIDADES_PROMPT` já diz "o sistema resolve, você narra" e cada
  resolução devolve a `nota` por turno. **O teto de prompt é sagrado** e somar
  bloco estático é proibido.

### O que ficou

- **H2 espera**, com os 12 já nomeados e datados dentro de `AGUARDAM` — a
  medição da próxima etapa começa com a lista na mão, não do zero.
- **As 7 da régua do golpe** (`HAB_OFENSIVA_RX` com `ataca` e sem `ataque`) já
  eram item da pauta e continuam lá; agora com os nomes ao lado.
- **Bastão do `App.jsx` devolvido** ao fim da etapa 2. A outra mente não foi
  tocada: nenhum vermelho dela, nenhum arquivo dela no commit.

---
## 16/09 03:10 · v9.263 · X4 · a conta do que mudou · **a Fase X fecha** · commit `8d402ed`

- **estado inicial:** HEAD `4619533`, VERSÃO **v9.261** lida do arquivo.
  **Sem trava do sistema — pus a minha.** `npm test` **187/187 suítes verdes ·
  13/13 varredores limpos**, build limpo. A outra mente está rodando **W1** (a
  frase que se monta) com a trava dela posta; **não tomei o bastão do
  `App.jsx`** — X4 é medição, e leitura não pede bastão.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **testes (duas mãos, em arquivos separados, no mesmo turno):** a primeira, o
  **eixo da frase** — `acoes-do-jogador.mjs`, `sonda-turno-esteril.mjs` e o par
  `teste-`/`check-`; a segunda, a **régua de B1** — `regua-combate.mjs` e
  `teste-regua.mjs`. Nenhuma tocou no arquivo da outra.
- **nenhuma linha de produção escrita.** O único arquivo de `src/` tocado foi
  o bump de `VERSAO`.

### A resposta, e ela é um "não mudou" honesto

Mesma política fixa de X1 — estrada, 1 inimigo não-ágil, herói corpo a corpo
nível 3, 7 turnos declarando "Ataco &lt;nome&gt;" e nada mais:

| | 15/09 (X1) | 16/09 (depois de X2) |
|---|---|---|
| turnos estéreis | **7/7** | **7/7** |
| rolagens | **0** | **0** |
| revides | **0** | **0** |

**E tinha de dar isso.** X2 escreveu, com todas as letras, que **não encurtou
a caminhada** — *"ela tornou a caminhada visível antes do clique, que é outra
coisa"*. A régua confirma a palavra dela em vez de a contradizer, e uma régua
que confirma o que a etapa prometeu vale mais do que uma que encontra um ganho.

**O que mudou está na sessão A′, e é medível:** os mesmos 7 turnos agora com o
clique **impedido antes de ser gasto**, com a distância, o alcance e os metros
que faltam ditos na tela. **Sete turnos perdidos viraram sete turnos que o
jogo avisou que seriam perdidos.**

**E a honestidade que fecha este eixo:** a sessão B — o jogador que anda em vez
de insistir — dá **2 turnos andando + 5 golpes, 0% estéril, 5 rolagens**. Só
que **já dava isso em X1**. Andar sempre funcionou: é geometria, não botão.
**Nenhum dos dois números é ganho de X2**, e vendê-lo como ganho seria a conta
mentindo a favor — que é exatamente o que X3b mandou X4 não fazer.

### O eixo novo de X3b: estéril e mudo são taxas OPOSTAS

A sessão A″ mede os mesmos sete turnos pelo eixo da frase:

- `taxa_esteril` = **7/7 = 100%** (turnos sem um número mudar) — o eixo de X1
- `taxa_muda` = **0/7 = 0%** (turnos sem **uma linha** sequer)
- `taxa_sem_narracao` = **7/7 = 100%** (turnos sem uma frase de **evento**)

As duas primeiras são **opostas na mesma sessão**, e **a distância entre elas é
inteira de recusa**. Das 14 linhas dos 7 turnos: **7 eco do jogador, 7 recusa,
0 narração de evento** — e **0 chamadas ao Narrador** (o `return true` de
`:11871` antecede o `enviar` de `:11932`). O jogador lê o tempo todo e nada
lhe é narrado.

**O alerta de X3b estava certo, e agora tem número:** sem separar a recusa, a
medida daria **0% de turnos mudos** onde a resposta honesta é **100% sem
narração**. Por isso nasceu `NAO_CONTA_COMO_FRASE`, irmão do
`NAO_CONTA_COMO_NUMERO` de X1, com cinco exclusões e o motivo de cada uma — a
recusa, o eco do jogador, o telegrama, a rolagem `🎲` (que sai atrás de
`mostrarRolagens`, desligado por omissão) e a nota ao Narrador.

### O funil — e X3b errou os dois números, para menos

`pushMsgs` é `App.jsx:7499`: **o endereço confere**. O resto não:

| | X3b disse | X4 mediu |
|---|---|---|
| funções que falam no combate | 13 | **14** (11 de núcleo + 3 de borda) |
| formas de recusa | 15 | **18 chamadas · 25 formas · 7 famílias** |

As 57 chamadas do funil: **frase de mesa 36 (63,2%) · telegrama 12 (21,1%) ·
recusa 9 (15,8%)**, e **22 das 57 nascem fora do React** (35 ainda só existem
dentro do `App.jsx`). A maior boca é `resolverRevide` sozinha, com 29 das 57.
A maior família de recusa é `alcance`, com 6 chamadas e 13 formas — e apareceram
**duas famílias que a pauta não nomeava**: *conjuração travada* (armadura, forma
animal, grimório) e *condição que prende*.

O núcleo dos 11 não foi contado no olho: saiu de **ponto fixo sobre o grafo de
chamadas**, a partir das guardas explícitas de `combateRef.current`. Pelo
precedente de X1, **a medição mandou na pauta**.

### A régua de B1: o que ela NÃO pode medir, dito em vez de inventado

A pessoa pediu *"a régua de B1 refeita com o jogador agindo"* e acrescentou a
única instrução que importava mais que o número: **se não der para simular
honestamente, diga em vez de inventar.**

Não dá, e a razão é estrutural. **A régua não tem tabuleiro:**

- não importa `src/grid.js` nem `src/golpe.js` (imports em
  `regua-combate.mjs:193-206`);
- passa **`grade: null`** ao motor (`:887`), e `grid.js:422` abre com
  `if (!g) return { ok: true, penalidade: 0 }` — **sem grade, os dois lados
  alcançam sempre**;
- o passo 1 do laço era `if ((heroi.vida || 0) > 0)`: a única pergunta era
  *"está de pé"*, nunca *"alcança"*.

**Logo a linha de 1,4% nunca mediu "o motor sozinho": ela sempre pressupôs um
jogador que age todo turno.** A régua é o **limite otimista**, e o jogo real é
**pior** que ela — não melhor, que era a suposição embutida na pergunta.
Está escrito como bloco exportado `TABULEIRO_NA_REGUA`, no molde do
`ADVERSARIO_NA_REGUA` que N1b deixou para o mesmo tipo de buraco.

**Medir o preço real exige a grade dentro da régua** — montar planta,
posicionar, caminhar com orçamento em metros, `alcanca` antes de cada golpe
**dos dois lados**. Isso é um **simulador de tabuleiro: órgão novo, logo
`pesado`, logo da pessoa.** Ficou como proposta em
`TABULEIRO_NA_REGUA.paraMedir`, **não construída**.

### O preço da caminhada — a primeira ponte entre X1 e B1

O que **deu** para medir honestamente foi o custo de o herói não poder golpear.
`rodadasDeCaminhada = k` cala o herói nas primeiras k rodadas; **`k = 0` é o
default e é byte a byte** (dente próprio em 4 famílias, e a asserção existente
de 52,1% · 25,88 · 1,790 continua verde). No `justo` com
`comAdversario: false`, 4 famílias × 500 = **2000 sementes por degrau**:

| k | vitória | PV do grupo | quedas |
|---|---|---|---|
| 0 | 51,8% ± 2,2 | 25,90 | 1,785 |
| 1 | 39,6% ± 2,1 | 18,78 | 2,087 |
| 2 | 29,8% ± 2,0 | 12,86 | 2,332 |
| 3 | 22,7% ± 1,8 | 8,85 | 2,503 |

**Uma rodada de caminhada custa ~9,7 pontos de vitória**, −5,68 PV de grupo e
+0,24 queda (degraus −12,3 · −9,8 · −7,0, com rendimento decrescente). Na moeda
de B2 — a escada de `CATRACA_DE_UMA_VIDA`, medida no mesmo molde, ~2,9 pontos
por ponto de dano — **um turno andando ≈ 3,3 pontos de dano por golpe, quase
todo o teto de +4 que aquela escada aponta.** É a primeira vez que a geometria
que X1 achou aparece na moeda do balanceamento.

**Os degraus não foram escolhidos, foram derivados:** a suíte importa
`DESLOCAMENTO_PADRAO` (`grid.js`) e `ALCANCES` (`golpe.js`) e **refaz** o "2 a
3 turnos" de X1 — (12,0−1,5)/9 → 2 e (25,5−1,5)/9 → 3. Se o passo ou o alcance
mudarem em `src/`, o dente fica vermelho sozinho.

**Não medi no jogo de hoje (Adversário ligado), e medi a razão em vez de a
afirmar:** o `justo` está em 1,4–1,8%, **saturado no piso**. Com k ≥ 1 a
vitória cabe dentro da própria margem (0,4 ± 0,6 · 0,0 ± 0,6 · 0,0 ± 0,6) —
**indistinguível de zero**. Isso virou dente; a escada de lá é `pendente`.

**E o contrapeso, que é achado novo e baixa o preço:** `moverPara`
(`App.jsx:14500-14568`) **nunca chama `fecharMeuTurno`** — o próprio sítio
escreve *"o que fecha o turno é AGIR"*, e os quatro chamadores de
`fecharMeuTurno` (`:11929`, `:13453`, `:13543`, `:13594`) não incluem o
movimento. Somado ao `semAlcance` de graça que X1 mediu: **enquanto o herói
anda, a oposição também não age.** Então o preço real está **entre zero e os
9,7 pontos**, e 9,7 é a **ponta cara**. Está dito na tabela, no cabeçalho, e
ficou `pendente` — não virou limiar.

---

## A FASE X DE PONTA A PONTA — o que o jogador não conseguia, e o que consegue

**Em 15/09, quando a fase abriu**, o `jogo` jogou e contou: dos 20 botões do
painel de Ações, **nenhum era de combate**. `Atacar` não atacava — **digitava
`"Ataco "` na caixa de texto**. Três ataques declarados sem ambiguidade num
combate aberto deram **zero rolagens**, e sete turnos fecharam com os mesmos
PV 20/20, PM 6/6, XP 89/300. A lei da casa estava invertida no pior lugar:
*o Mestre é código, e a IA só narra* — **mas quem decidia se o golpe
acontecera era a IA.**

**O que ele NÃO conseguia fazer, e hoje consegue:**

1. **Disparar o próprio golpe.** `Atacar`, com a luta aberta, **ataca**: monta a
   frase canônica, passa pela porta única `declararGolpe` (`:11851`), e
   `src/golpe.js` — módulo puro, provado em Node — **decide antes de qualquer
   efeito**. A catraca desceu com o fato: `TETO_SEM_MOTOR` **7 → 6**. *(X2)*
2. **Saber o preço antes de pagar.** O botão nasce **impedido** e a linha lê
   *"Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."* — o
   número conferido vivo na campanha e casa a casa contra `vereditoDoGolpe` em
   Node. Antes, a recusa só chegava **depois** do clique. É a lei do veredito
   antes do clique, aplicada ao combate. *(X2)*
3. **Não perder o turno quando o Mestre cai.** Se o motor rolou, **o resultado
   não se descarta**: fica guardado e é narrado quando o Narrador voltar. Antes,
   uma queda da IA jogava a ação fora — e, pior, uma retentativa **re-rolava um
   resultado ruim**. *(X3)*
4. **Ter uma régua que não evapora.** Antes, cada medição de combate morria no
   scratchpad. Hoje a fase deixa quatro instrumentos permanentes:
   `acoes-do-jogador.mjs` (a tabela), `sonda-turno-esteril.mjs` (a régua),
   `check-acoes-do-jogador.mjs` (o varredor que impede a tabela de apodrecer,
   agora com 11 dentes) e `teste-acoes-do-jogador.mjs` (**155 asserções**,
   eram 108). *(X1, X4)*

**E o que a fase descobriu que ninguém tinha nomeado** — o achado que vale mais
que qualquer das quatro linhas acima: **a trava não era o botão, era a
geometria.** `posicionar` abre a luta a **12,0 m (taverna) a 25,5 m
(masmorra)**, o corpo a corpo alcança **1,5 m**, e **10 de 10 plantas recusam
no turno 1**. `resolverAtaqueJogador` sempre existiu e sempre foi bom; o golpe
morria antes dele. Consertar só o botão teria dado ao jogador um *"longe
demais"* dez vezes seguidas — e **pareceria que o conserto falhou**.

### O que ele CONTINUA não conseguindo fazer

1. **Chegar perto sem gastar 2 a 3 turnos andando.** X2 tornou a caminhada
   visível; não a encurtou, e disse isso. **Agora ela tem preço medido:
   ~9,7 pontos de vitória por rodada** — e é o número que falta a esta casa
   decidir se aceita.
2. **Andar pelo tabuleiro escrevendo.** Não há **porta do campo em `turno.js`
   — 17 portas, nenhuma delas do tabuleiro**. Hoje `vou até K14` numa luta cai
   na porta `destino` (`:238`), que **não tem guarda `!emCombate`**, vai ao
   resolvedor de cidades do mapa-múndi, escreve `[DESTINO NÃO RECONHECIDO]` e
   entrega à IA: **ninguém anda, e gasta-se uma chamada ao Mestre para não
   andar.** Pedido por E2 e de novo por W1; continua em "Aberto".
3. **`Esquivar`, `Empurrar`, `Derrubar`, `Ajudar`.** Quatro botões de combate,
   **zero motor**. X2 deixou-os de fora **de propósito**: ali não falta fiação,
   **falta mecânica**, e enfiá-los na porta de `Atacar` seria fingir que
   existem. São a **Fase Y**, já aprovada, na ordem Empurrar/Derrubar →
   Esquivar → Ajudar.
4. **Passar a vez sem chamar o Mestre.** Não há botão de esperar desde a v9.13
   (`App.jsx:3133`) — e é o que W1 mediu como o item mais barato e que mais
   paga. Continua em "Aberto".
5. **Ouvir a luta.** Nos sete turnos da sessão A o jogador lê **catorze linhas
   e zero narração de evento**. X3b já tinha mostrado por que: **se o Mestre
   calasse hoje, a cena sobreviveria como extrato bancário; a luta, não.**

### Os dois achados de mecânica quebrada de X3b — X4 não os tocou

Confirmado que **não são desta etapa**, e os dois continuam em "Aberto" como
`médio`, intactos. Mas X4 tem algo a dizer sobre cada um:

- **o reforço entra na luta sem `x`/`y` nem iniciativa** — é **invisível para a
  régua por construção**: sem grade, `alcanca` devolve sempre `ok`, e um
  combatente sem posição não tem como doer ali. Só o jogo o sente.
- **a queda de companheiro é silêncio absoluto** — X4 o **confirma por
  ausência**: o funil tem linha para a queda do herói (`:14218`) e para **treze**
  eventos de companheiro (`:14061` a `:14260`), e **nenhuma** para o
  companheiro que chega a zero.

### Decisões médias tomadas (com o motivo)

- **Corrigi dois números da pauta para cima** (13 → 14 chamadores, 15 → 18/25
  recusas). **Motivo:** os de X3b eram prosa de diário, não número provado — e o
  precedente de X1 é explícito, *"a medição manda na pauta, não o contrário"*.
- **`k = 0` como default da caminhada na régua, e byte a byte provado.**
  **Motivo:** mudar a régua muda **os dois lados** de toda comparação passada;
  a história de B1/B2/T1 não pode passar a mentir por causa de X4.
- **Medi a saturação do piso em vez de a afirmar.** **Motivo:** *"um limiar em
  cima de um teto não mede nada"* já é lei do cabeçalho da régua — mas dizer que
  algo está saturado sem medir é a mesma opinião com confiança que a casa proíbe.
- **O custo da caminhada ficou `pendente`, não virou limiar.** **Motivo:** o
  achado de `moverPara` mostra que 9,7 é a ponta cara de uma faixa, e faixa não
  vira catraca.
- **Não tomei o bastão do `App.jsx`.** **Motivo:** X4 é leitura; a outra mente
  está em W1 e o bastão livre vale mais que a comodidade.

### O que ficou

- **Um achado novo, `leve`, para "Aberto":** a recusa de alcance imprime **"está
  a 17 m, em na vala — longe demais"** (`grid.js:428` põe `em ` antes de um
  `nomeDoLugar` que já traz a preposição; sem nome, ficam dois espaços). Saiu
  sete vezes seguidas na sonda. **Não a consertei de carona** — ela é a mesma
  frase de `LINHAS_DO_GOLPE` e da catraca dos 54 caracteres que W1 pediu, e
  consertá-las em separado criaria a segunda cara da mesma linha.
- **Uma proposta `pesada` para a pessoa:** a grade dentro da régua — o
  simulador de tabuleiro que mediria o preço real da caminhada. Escrita em
  `TABULEIRO_NA_REGUA.paraMedir`, **não construída**.
- **Três coisas que X4 não conseguiu medir**, declaradas na tabela e impressas
  pela sonda: quantas linhas saem num turno **real** (a sonda não roda React);
  a voz das **5 chamadas mistas** (listas montadas em tempo de execução); e
  **quanto a IA de fato narra** — isso seria medir a rede, e a Fase X mede o que
  o código diz sozinho.
- **Nada foi rebalanceado, nada foi ligado, nenhuma catraca foi afrouxada.** O
  dente 1 de `CATRACA_DE_UMA_VIDA` continua `pendente`, como N1b o deixou.
### A nota que a casa exige: o meu bloco de pauta saiu no commit da outra mente

**Aconteceu a terceira vez, e desta vez do outro lado.** Enquanto eu media, a
outra mente fechou **W1** e commitou `mente/pauta.md` — onde ela tinha escrito,
legitimamente, o pedido de W1 ao motor (a pauta do sistema **é** o canal por
onde o desenho pede regra). Só que o meu bloco de X4 já estava no arquivo, e
**`63e0667` — um commit que fala do turno como gesto — levou dentro o veredito
inteiro da Fase X**, sem o mencionar.

**Não reescrevi a história:** `origin/main` já estava em `2afce4c` quando
descobri, e `push --force` num ramo que faz deploy para jogadores reais é arma
apontada para o vizinho. A lei da casa diz o que fazer nesse caso e foi o que
fiz — **repor a verdade no diário e num commit seguinte, e seguir**. O bloco de
X4 na pauta agora traz uma linha dizendo onde ele foi publicado.

**E a lição, porque as três vezes têm a mesma forma e nenhuma foi por `add -A`:**
`git commit -- <caminhos>` fecha a janela entre o *seu* `add` e o *seu* `commit`,
mas **não** protege um arquivo que as duas mentes editam ao mesmo tempo — ali o
caminho nomeado leva tudo o que estiver dentro dele. `mente/pauta.md` é o único
arquivo da casa nessa situação por desenho: é meu, e é onde o desenho me pede
coisas. **O bastão resolveu o `App.jsx`; a pauta não tem bastão.** Fica como
achado para a pessoa decidir — talvez um `mente/pedidos-ao-sistema.md`, que o
desenho escreve e o ciclo consome, custe menos que uma trava nova.

- **O que ficou meu neste commit, e é o que sobrou de `pauta.md`:** o fecho da
  Fase X, a correção da versão e o item novo do *"em na vala"*.

---

## 16/09 02:25 · v9.261 · X3b · o que a voz da casa cobre · commit `30a6b3d`

- **estado inicial:** HEAD `4221f16`, VERSÃO **v9.260** lida do arquivo (a
  outra mente a bumpou em E2 durante este ciclo; bumpei para **v9.261** em
  cima do que estava no disco, não do que a pauta dizia). **Sem trava — pus a
  minha.** `npm test` **187/187 suítes verdes · 13/13 varredores limpos**,
  build limpo. A outra mente rodou **E2** (o endereço do tabuleiro) e fechou
  no meio do ciclo (`e192188`, `e791646`); a árvore voltou limpa antes do meu
  commit e **não precisei de `so-o-meu.sh`** — nenhum vermelho de lado nenhum.
  **Não tomei o bastão do `App.jsx`:** X3b é retrato, e leitura não pede bastão.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o retrato da **oferta** — `arena.js` inteiro mais 22 módulos
  puros com prosa de combate, os 14 eventos com arquivo:linha e a frase
  literal. Achou três que não estavam na lista (`masmorras.js`,
  `adversario.js`, `grid.js`).
- **frontend:** o retrato da **demanda** — o funil de `pushMsgs`
  (`App.jsx:7499`) e as treze funções que o chamam dentro do combate, os 14
  eventos classificados em **código-frase / código-telegrama / IA**, mais a
  contagem à parte das **15 formas de recusa**.
- **nenhuma linha de produção escrita.** X3b é medição; o único arquivo de
  `src/` tocado foi o bump de `VERSAO`.

### O número, e ele decidiu a fase

A arena tem linha escrita em **10 dos 14** eventos. Mas **molde reusável em
campanha que a campanha ainda não tem: 3 de 14 (21%)** — e os três (acerta,
erra, crítico) são **um molde só**, o do golpe. **Dos 5 que a pessoa perguntou
por nome** — condição, queda, morte, reviravolta, chegada de inimigo —
a arena cobre **0 de 5**.

A razão é estrutural, e é o achado do ciclo: **a voz da arena não é uma fonte
independente.** Dos 8 moldes que ela escreve, 2 são reflexivos (`se recompõe`,
`firma`) e não sabem nomear um terceiro — e o caso normal da campanha é
**grupo**. Os outros 5 ela **empresta** de módulos da campanha (`tickEfeitos`,
`expirarGuardas`, `absorverDano`, `testeConcentracao`, `firmarEfeito`), e o
`App.jsx` **já empurra exatamente os mesmos**. O empréstimo só existe onde a
campanha já tinha escrito. A cobertura do duelo é o retrato da campanha,
devolvido.

- **decisão tomada, e ela encolhe a proposta: X3c está CANCELADA.** A razão
  não é o número sozinho, é a contradição que o número revela: **X3c se
  proibia de inventar prosa nova** (*"sem inventar uma linha de prosa nova"*),
  e o reuso disponível cobre **um** dos 14. Cumprir a promessa seria escrever
  prosa nova sob o nome de reuso — o código fingindo ser a IA, que é o
  próprio limite que a etapa escreveu para si. **A Fase X fecha em X4.**
- **a honestidade contrária, registrada de propósito:** o golpe é o evento
  mais frequente (3 a 6 por rodada), então em **volume de linhas** a cobertura
  não é 21%. Só que o golpe **já tem string** no `App.jsx`
  (`⚔ Halvard → Bandido: 9 de dano · Bandido 11/20`) — trocar telegrama por
  frase é reescrever uma linha que existe, não é *"o turno se completa quando
  o Mestre cala"*. É outra etapa, menor, e de forma. Não estiquei X3c para
  caber nisso.
- **o limite que era lei de X3c continua valendo e não foi tocado:** valia
  **só em combate**; fora dele a prosa **é** o conteúdo e ali trava, como a
  pessoa decidiu.

### O que ficou

**Sete achados novos foram para "Aberto"**, cada um do tamanho que tem e
nenhum vestido de reuso — dois deles são mecânica quebrada, não prosa:

- **médio ·** o **reforço entra na luta sem lugar no tabuleiro**: `montarGrid`
  não roda de novo com a luta aberta (`App.jsx:8928`, `:9007`), e `alcanca` /
  `moverInimigos` passam a receber um combatente sem `x`/`y` nem iniciativa.
- **médio ·** a **queda e a morte de companheiro são silêncio absoluto**
  (`App.jsx:13967`) — o herói que cai tem quatro frases; o aliado ao lado
  dele, nenhuma, nem nota ao Narrador.
- **leve ·** a **salvaguarda de fim de turno que falha é muda**, e
  `condicoes.js:576` **já calcula** a linha que ninguém consome.
- **leve ·** a **virada de chefe nunca dispara para um herói de arma** —
  `virarChefeSePreciso` só é chamada de `resolverHabilidadeOfensiva`.
- **leve ·** **`ultimoDano` escrito em nove sítios sem um leitor**.
- **leve ·** a **arena descarta a linha boa da guarda** (`habilidades.js:356`,
  que o App usa) e escreve outra por cima — duas frases para o mesmo evento.
- **leve ·** a **condição tem prosa de saída e não tem prosa de entrada**.

**Para X4**, deixei o mapa do funil (`pushMsgs` e os treze chamadores), um
eixo novo (*turnos sem uma frase*, que não é a mesma taxa de *turnos sem um
número*) e uma correção de escopo: **15 formas de recusa** têm frase no
caminho de combate, e recusa **não é** narração — X4 tem de contá-las à parte
para não inflar o próprio número.

**Nada foi rebalanceado, nada foi ligado, nenhuma lei foi afrouxada.**

---


## Os ciclos anteriores

Os 31 ciclos mais antigos estão em `mente/arquivo/diario-antigo.md`,
inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo
ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.
