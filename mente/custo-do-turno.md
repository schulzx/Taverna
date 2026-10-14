# O custo do turno — a auditoria (13/10/2026, `backend`)

> *"Precisamos baratear os turnos para viabilizar o projeto; se o turno fica caro,
> a assinatura fica cara; se a assinatura é cara, teremos menos assinantes."* —
> a pessoa, 13/10. E: *"se com o Gemini já está assim na versão que deveria ser
> barata, imagina a do GPT Sol."*

Esta etapa é **medição e proposta**. Nada em `src/`, `api/` ou `testes/` mudou,
nenhuma chamada paga foi feita. Os scripts estão no scratchpad da sessão, em
`custo/` (ver o fim).

## 0. O resumo, em uma tela

- **Hoje (v9.469, estimado):** US$ 1,17 por sessão de 63 turnos (R$ 7,18). A
  11.ª sessão mediu US$ 1,73 (R$ 10,65) antes do cache explícito.
- **Para onde vai o dinheiro:** a **mensagem do turno** (34%, cobrada cheia todo
  turno) e as **escritas do cache explícito** (28%). A saída custa só 8% e o
  pensamento do Gemini, quase nada.
- **O maior desperdício está escondido no histórico:** cada fala antiga do
  jogador guarda a **PAUTA inteira daquele turno**. São ~2.200 caracteres, e a
  frase do jogador ocupa ~150 deles. Isso dá **73% dos caracteres do histórico**,
  e obriga a reescrever o cache com mais frequência. Guardar só a frase poupa
  **US$ 0,30 por sessão (−26%)**, e o Narrador deixa de reler ordens velhas.
- **O alvo do plano base:** **US$ 0,50 a 0,62 por sessão** (R$ 3,05 a 3,81), ou
  **R$ 1,70 a 2,12 por hora**, depois de três ondas sem trocar de modelo. Com a
  rota por peso (onda 4) fica entre US$ 0,42 e 0,50.
- **O superior (GPT-5.6 Sol):** hoje custaria US$ 2,16 por sessão (R$ 13,29).
  Com o turno enxuto cai para **US$ 1,02 a 1,22** (R$ 6,26 a 7,51), cerca de
  **2× a base**. Isso é viável. Pôr o Sol só nos turnos que importam só fica mais
  barato se o cache dele durar entre esses turnos. Se não durar, sai **mais caro
  do que o Sol em todos**.
- **O aviso que muda a conta:** em `custo.js` o 3.8 Flash **dobra de preço em
  01/01/2027**. Com o preço novo, a base da v9.469 vai para US$ 1,91 e a da onda
  3 para US$ 0,95. O plano não é opcional.

## 1. Como medi, e a margem

- **Os tokens por chamada da 11.ª** (`s11/narrador-por-chamada.csv`, 63
  chamadas do Narrador, Gemini 3.8 Flash, v9.466) dão a forma real:
  - `system` de 11.490 tokens (40.541 caracteres, 3,53 caracteres por token);
  - ~602 tokens por mensagem de histórico (regressão);
  - ~8.500 tokens na mensagem do turno (o intercepto, menos o system);
  - janela ancorada 24/24 (de 1 até 47 mensagens, depois o corte para 25);
  - saída de 1,567 tokens por palavra **+ 2,4**.
- **O conteúdo de cada bloco** vem dos registos da 8.ª, 9.ª e 10.ª, que guardam
  o pedido inteiro (era DeepSeek, mesma montagem; a v9.465 só mudou o *lugar* da
  zona e do ESTADO). Usei a média por turno em caracteres de cada secção da zona
  das REGRAS DA CENA ABERTA, do ESTADO DESTE TURNO, da pauta e do rodapé.
- **O simulador** (`custo/sim2.cjs`) refaz a sessão turno a turno com a regra
  exata de `janela.js` (âncora 24/24, `decidirOCache`, rabo de 6.000, TTL de
  30 min, a guarda paga) e os preços de `custo.js`. **Calibração:** com o cache
  implícito da 11.ª ele dá US$ 1,44 contra US$ 1,50 medidos (2% abaixo). Com o
  explícito dá US$ 1,09 para o Narrador, perto dos US$ 1,03 que o ciclo v9.468
  estimou.
- **Ritmo de jogo:** considerei **35 turnos por hora**, com um humano lendo de
  120 a 260 palavras e escrevendo uma frase (1,7 min por turno). A sessão de 63
  turnos dura ~1h50. A 10.ª (79 turnos em 47 min) foi jogada por um agente e não
  serve de régua.
- **R$** = US$ × 5,45 × 1,13. Usei o mesmo fator para o OpenRouter, onde a taxa
  de compra de crédito fica de fora.
- **Margem:** ±10% no absoluto. As *diferenças* entre os cenários são mais
  firmes, porque saem do mesmo modelo.

## 2. A anatomia do turno em US$ (v9.469, cache explícito, saída como na 11.ª)

| componente | US$/sessão | ¢/turno | % |
|---|---:|---:|---:|
| **system fixo**: leitura do cache | 0,053 | 0,085 | 4,6 |
| system fixo: **escrita** do cache (rescrito a cada troca) | 0,129 | 0,205 | 11,1 |
| system fixo: o 1.º turno, cheio | 0,009 | 0,014 | 0,7 |
| **histórico, as mensagens do jogador** (= a PAUTA velha + a frase): leitura / rabo cheio / escrita | 0,050 / 0,065 / 0,130 | 0,39 | **21,0** |
| histórico, as narrativas antigas: leitura / rabo / escrita | 0,026 / 0,034 / 0,068 | 0,20 | 11,0 |
| guarda do cache (token × hora) | 0,030 | 0,047 | 2,5 |
| **mensagem do turno** (sempre cheia) | **0,402** | **0,638** | **34,4** |
| saída (narrativa + JSON + pensamento) | 0,097 | 0,154 | 8,3 |
| Cronista (Flash-Lite 3.5, 1 por turno) | 0,076 | 0,121 | 6,5 |
| **total** | **1,167** | **1,85** | 100 |

**Por dentro da mensagem do turno.** Cada 1.000 caracteres por turno custam
**US$ 0,012 por sessão**. A média por turno (10.ª):

| parte | chars/turno | US$/sessão | os maiores blocos (chars/turno · % dos turnos em que entra) |
|---|---:|---:|---|
| REGRAS DA CENA ABERTA (a zona) | 11.731 | 0,140 | as regras de MISSÕES 930+258 · TRABALHO DO MUNDO 588 · **o grupo da economia (MERCADO + ESCALA + PREÇOS + EQUIPAMENTO + TRANSPORTE + SERVIÇOS + RECOMPENSAS + COMPRA E VENDA) 2.739, 100%** · COMPANHEIROS EM COMBATE 593, 100% · DESCANSO + FIM DO ACAMPAMENTO 924, 90% · TURNO DO MUNDO + AGENDA + GESTÃO + DIPLOMACIA 1.351, 90% |
| ESTADO DESTE TURNO | 8.035 | 0,096 | "COMO O MUNDO O CHAMA" 1.755, que leva colados ECONOMIA DE AÇÃO, PROGRESSÃO, ESCALAS DE TEMPO e VÍNCULOS · PESSOAS CONHECIDAS 1.091 · COMO SE CHAMA 749 · PATAMAR 713 · CIDADES + CAMINHOS 875 · CÂNONE 427 · DUAS PROIBIÇÕES 392 · GENTE POR CONHECER 364 |
| PAUTA do turno | 2.101 | 0,025 | — (é o canal que trabalha; fica) |
| RODAPÉ | 11.862 | 0,141 | O QUE EXISTE EM ⟨cidade⟩ ~3.500 · CHEFES 1.007, 100% · Inviolável 843 · O QUE FOI DITO EM PARTICULAR 609 · FORMA DESTE MUNDO 509 · PERÍCIAS + PASSIVOS 635 · PROFISSÃO 363 · MISSÕES 358 |

**A saída por dentro.** A regressão da 11.ª dá 1,567 tokens por palavra + 2,4,
e o português do Gemini dá ~3,8 caracteres por token. Não sobra lugar para
pensamento: o LOW do 3.8 Flash fica perto de zero nos turnos de narração (no
Léxico, que pensa de verdade, foram 5.350). O JSON custa ~10 tokens
(`{"narrativa":…,"mudancas":null}`), e `mudancas` saiu não-nulo **0 vezes em 127
turnos** (9.ª e 10.ª). **O pensamento e o JSON não são alavanca:** os dois
juntos ficam abaixo de US$ 0,01 por sessão.

**Cada 100 palavras de narrativa custam US$ 0,09 a 0,12 por sessão.** Entram
157 tokens de saída, e eles ainda voltam no histórico (lidos do cache e
reescritos).

## 3. O que não serve mais, com prova

| # | o desperdício | a prova | poupa/sessão | risco |
|---|---|---|---:|---|
| 1 | **A PAUTA velha guardada no histórico.** `App.jsx` guarda `corpo` no histórico (`histFinal`), e `corpo` é a pauta + os envelopes + a frase | na 10.ª, as mensagens do jogador no histórico somam 33,8 mil caracteres contra 12,4 mil das narrativas; numa delas, típica, são 2.212 caracteres, dos quais 117 de frase. São ordens de um turno que passou ("O FECHO termine em fala a meio", "NÃO PODE…", "REGRA DESTE ENVELOPE") | **0,30** (1,17 → 0,86) | **baixo**: os vetos que ainda valem voltam na pauta nova, todo turno, e o que aconteceu está na narrativa. É provável que **melhore**, porque o Narrador relê ordens de fecho velhas (a 11.ª contou 4 respostas que terminam em "—") |
| 2 | **Tamanho acima do pedido:** mediana de 262 palavras contra 80–140 | 11.ª; e no teste cego só 1 de 12 respostas do Gemini coube no limite | 0,18 (se 120 palavras pegar) | a v9.468 já pôs a etiqueta junto da frase; **falta medir** na 12.ª |
| 3 | **Regra estática no canal volátil** (cobrada cheia todo turno, quando poderia estar no cache) | ECONOMIA DE AÇÃO, PROGRESSÃO, ESCALAS DE TEMPO e VÍNCULOS vão colados ao título (`infoTitulo` + `infoRegras`, `App.jsx` ~12020) em 100% dos turnos; a narrativa só estava em luta em 7% deles. Mais COMO SE CHAMA, PATAMAR, DUAS PROIBIÇÕES, Inviolável, FORMA DESTE MUNDO, PERÍCIAS, PROFISSÃO, TRAÇO, EQUIPAMENTO, ATRIBUTOS (que já está no ESTADO) e as regras de MISSÕES e TRABALHO DO MUNDO: ~8,6 mil caracteres que mudam só por campanha ou por nível | 0,08 (descem para o system fixo, em cache) | baixo: muda o lugar, não o texto. Um aumento de nível passa a reescrever o cache (raro) |
| 4 | **Portas abertas sem a coisa em jogo** | **gestão, diplomacia e "brincar de rei"** (1.351 caracteres, 90% dos turnos): nenhuma narrativa de 180 turnos falou em reino, vassalo, tratado ou embaixada, e o herói do beta não tem domínio. **Economia** (2.739, 100% na cidade): só 20% das narrativas dizem um preço, e a tabela de faixas é justamente de onde vêm os preços inventados ("dez pratas por cabeça", "três pratas a cama" na 11.ª). **COMPANHEIROS EM COMBATE** (593) abre fora da luta. **DESCANSO + FIM DO ACAMPAMENTO** (924) abre em 90% dos turnos | 0,07 | baixo a médio: a tabela de preços sai, e o preço vem do sistema por envelope (é a lei). Vigiar preço inventado |
| 5 | **O Cronista em todo turno** | 78 Cronistas em 79 turnos na 10.ª. Conteúdo de verdade (cânone, pessoa nova, promessa, missão oferecida) apareceu em ≤ 25 deles; os campos `lugar`, `fe`, `grupo` e `combate` voltam cheios por obrigação em todos | 0,04 | baixo, com um gatilho determinista (nome próprio novo na narrativa, palavra de promessa ou de dívida, envelope de missão) e uma rodada a cada 3 turnos como rede |
| 6 | **Blocos quase nunca usados** | o nome inteiro de um CHEFE aparece em **1%** das narrativas (2 de 194) com o bloco presente em 100%; as masmorras da região em **3%**; a GENTE POR CONHECER em **4%**; os itens do CÂNONE em 19%. Já a gente da cidade (O QUE EXISTE) aparece em **68%**: essa trabalha | 0,03–0,04 | médio: o bloco existe para o Narrador *não inventar*, então a regra é encurtar (os 2 mais perto, o antagonista), nunca tirar |
| 7 | **Duplicados** | quem está longe é dito 3 vezes (PESSOAS CONHECIDAS com o lugar, o rodapé LONGE, o NÃO PODE da pauta); as missões 3 vezes (regra na zona, ESTADO, rodapé); os atributos 2 vezes; o "dito em particular" é cheio de "Falo com X" | 0,03 | baixo |
| — | **Os modos fora do beta** (Uma Noite, Duelo, a sala) | 0 pedidos da 10.ª com o texto deles: as portas `so("sala")` etc. já ficam fechadas | 0 | — já está certo |
| — | **Um defeito à vista:** os VÍNCULOS saem `Saoirse: 50/100 (undefined)` | `marcoDe(v)` devolve um marco sem `rotulo` | — | leve, da fila do sistema |

## 4. O que já fazemos e não precisa mais

- **Chamadas por turno:** são duas (o Narrador e o Cronista), mais um revisor
  ocasional (5 em 79). O Cronista vale 6,5% da conta. Com gatilho, cai pela
  metade (item 5).
- **O histórico:** vão de 23 a 46 mensagens (de 12 a 23 turnos) e a âncora salta
  a cada 12. O que pesa **não é o número de turnos, é o que cada turno guarda**
  (item 1). Depois da onda 1, a janela custa ~4,4 mil tokens lidos do cache:
  baixar para 16/16 poupa US$ 0,015 e subir para 32/16 custa mais US$ 0,02.
  **Resumo do histórico: não fazer.** Precisaria de mais uma chamada e arriscaria
  a memória para poupar centavos. Fica a janela como está.
- **O pensamento:** perto de zero, como medido acima. O 3.8 Flash não aceita
  menos que LOW, e não há o que cortar.
- **O tamanho:** de US$ 0,09 a 0,12 por sessão a cada 100 palavras. Se as 80–140
  palavras pegarem, a v9.469 vai para US$ 0,99.
- **A régua do cache (rabo de 6.000):** continua ótima com o histórico enxuto. A
  3.000 sobe US$ 0,02; a 9.000 ou 12.000, US$ 0,01.

## 5. Ideias novas, com número

**a) Rota por peso do turno.** Classifiquei à mão as 78 jogadas da 10.ª:
**bastidor 27%** (comprar, perguntar preço, andar, partir em viagem, dormir,
deixar o tempo passar), **combate 15%**, **médio 33%** (falar com alguém,
procurar, ir a um lugar com gente) e **importante 24%** (abertura,
revelação, A HISTÓRIA VIROU, O PASSADO VOLTA, RELÓGIO COMPLETO, missão
concluída, fogueira, gente do núcleo, o desfecho). A 11.ª tem a mesma mistura.
O sistema já sabe o peso pelos envelopes e pela escuta, então isso sai
**determinista, de uma tabela**.

- Mandar o bastidor para um modelo barato, com um prompt enxuto (system curto de
  ~5 mil tokens, a pauta, o rodapé do lugar e as últimas 6 mensagens), custa
  US$ 0,002 por turno contra ~0,005 no Flash. **Poupa US$ 0,08 por sessão** (de
  0,50 para 0,42 depois da onda 3).
- Isso não quebra o cache do Flash: o histórico só cresce pelo fim.
- O risco é a **voz**. No teste cego, o candidato era o GPT-5.6 Luna (nota 7,4,
  prosa 3,25 de 5) ou o Gemini 3.1 Flash-Lite (7,2, prosa 2,75, "escreve como um
  relatório"); o 3.8 Flash teve 8,7.

**b) Juntar a partida e a chegada.** Uns 8% dos turnos não têm frase do jogador
(VIAGEM ABERTA/PARTIDA, PASSAR O TEMPO, BUSCA CONCLUÍDA). A partida pode ir
colada ao envelope da chegada. Poupa ~US$ 0,03 a 0,04 e não toca na voz.

**c) Prompt por cena, mais fundo** (onda 3). É o `so(...)` levado à pauta:
- PESSOAS CONHECIDAS só com quem está na cidade, na missão ou no grupo, e os
  longe numa linha;
- o cânone pelo lugar;
- só as 2 masmorras mais perto e o antagonista.

A mensagem do turno vai de ~4,9 mil para ~3,6 mil tokens. Poupa US$ 0,06.

**d) Pôr a zona das portas no cache: NÃO.** A zona muda em ~30% dos turnos, e
cada mudança reescreveria o system e o histórico inteiros. Fica **+US$ 0,27 mais
caro**. O estático da onda 2 (muda por campanha ou por nível) sobe para o cache;
a zona fica no turno.

**e) Pôr o Cronista dentro do Narrador: NÃO.** A saída do Flash custa 1,5× a do
Lite, e a E2–E4 tirou o escrivão do Narrador de propósito.

## 6. A segunda assinatura — o GPT-5.6 Sol

O preço vem de `custo.js` (2,50 de entrada, 0,20 de cache, 10 de saída, via
OpenRouter). O Sol conta 13% menos tokens (teste cego) e usa o cache implícito
da OpenAI, que relê o prefixo sem custo de escrita **enquanto está quente**.

| cenário | saída 262 pal. | saída ~120 pal. |
|---|---:|---:|
| Sol em todos os turnos, prompt de hoje | US$ 2,16 · R$ 13,29 | US$ 1,95 · R$ 12,04 |
| **Sol em todos, depois da onda 3** | **US$ 1,22 · R$ 7,51** | **US$ 1,02 · R$ 6,26** |
| Sol nos importantes (24%), Flash no resto, cache do Sol **vivo** entre eles | US$ 0,94 · R$ 5,79 | US$ 0,77 · R$ 4,75 |
| o mesmo, cache do Sol **frio** (expira entre os turnos dele) | US$ 1,36 · R$ 8,40 | US$ 1,12 · R$ 6,93 |
| Sol nos importantes, Lite no bastidor, Flash no resto (vivo) | US$ 0,81 · R$ 4,99 | US$ 0,69 · R$ 4,27 |
| *(para comparar) a base depois da onda 3* | *US$ 0,62 · R$ 3,81* | *US$ 0,50 · R$ 3,05* |

**A leitura.**

- **O superior é viável depois da onda 3:** o Sol em todos os turnos fica em
  ~2× a base, com uma voz só e sem roteador.
- **Só nos importantes** só compensa se o cache do Sol sobreviver de 5 a 10
  minutos entre os turnos dele. Isso exige confirmar se o OpenRouter repassa a
  retenção longa de prompt (`prompt_cache_retention`). Sem ela, a mistura é **a
  pior das opções** e ainda troca a voz no meio da cena.
- **Recomendação:** o superior começa como **Sol em todos**, depois das ondas 1
  e 2. A mistura fica para quando houver a retenção medida.
- Em 2027 a base dobra (US$ 0,95 na onda 3) e o Sol em todos (US$ 1,02 a 1,22)
  fica a uns 20% dela. A distância entre as duas assinaturas encolhe sozinha.

## 7. O plano, em ondas (poupança × segurança)

Os valores são acumulados por sessão de 63 turnos e por hora (35 turnos). Cada
célula dá o valor com a saída de hoje (262 palavras) → com o 80–140 cumprido.

| onda | o que é | US$/sessão | R$/sessão | R$/hora | a medida que a prova | risco |
|---|---|---:|---:|---:|---|---|
| — | 11.ª medida (v9.466) | 1,73 | 10,65 | 5,92 | — | — |
| **0** | **já no ar (v9.468):** cache explícito + tamanho junto da frase + Cronista no Lite | 1,17 → 0,99 | 7,18 → 6,10 | 3,99 → 3,39 | na 12.ª: cache ≥ 65% e mediana ≤ 140 palavras no `/custo` | — |
| **1** | **o histórico guarda a frase, não a pauta** (a frase do jogador + o título de cada envelope, ~60 tokens); **Cronista por gatilho** | 0,83 → 0,70 | 5,09 → 4,33 | 2,83 → 2,41 | o US$ por sessão do `/custo`; escritas de cache por sessão (de ~12 para ~6); a nota "não inventa" e a continuidade (o Mestre lembra o que se fez há 3 turnos?) | **baixo** — mudam uma linha do `App.jsx` (`histFinal`) e um módulo puro; o save antigo continua válido (o formato `{role, content}` não muda) |
| **2** | **a mensagem do turno enxuta:** o estático sobe para o system em cache (item 3); as portas só abrem com a coisa em jogo (item 4); sem duplicados (item 7). **Não soma bloco**: só move e fecha | 0,68 → 0,56 | 4,19 → 3,43 | 2,33 → 1,91 | o tamanho da mensagem do turno ≤ 18 mil caracteres (hoje ~34 mil); preços inventados (a 11.ª teve 3); teleporte e viagem fantasma; a nota "cumpre a pauta" | baixo a médio |
| **3** | **por relevância:** pessoas, cânone, masmorras e chefes pelo lugar e pela missão | 0,62 → 0,50 | 3,81 → 3,05 | 2,12 → 1,70 | nome inventado por sessão (a 11.ª teve "Clarissa do Posto Velho"); a regra "PROCURA acha quem existe" | médio |
| **4** | **rota por peso:** o bastidor (~27%) num modelo barato e enxuto; a partida colada à chegada | 0,50 → 0,42 | 3,08 → 2,59 | 1,71 → 1,44 | teste cego antes (12 pautas de bastidor, Luna × Flash-Lite × Flash); na sessão, a nota de prosa dos turnos leves ≥ 3/5 | **alto** (a voz) |

**O custo-alvo:**
- **base:** US$ 0,50 a 0,62 por sessão (R$ 3,05 a 3,81), R$ 1,70 a 2,12 por
  hora, com o mesmo Narrador de hoje (ondas 0–3);
- **superior:** Sol em todos a US$ 1,02 a 1,22 (R$ 6,26 a 7,51).

Para quem joga 10 horas por mês, a base sai a **R$ 17 a 21 por mês de API** em
2026 e R$ 33 a 41 em 2027. É esse o número que a assinatura tem de cobrir.

**O que a qualidade vigia em toda onda** é a régua do teste cego e das sessões
de prova (cumpre a pauta, não inventa, PT-BR, prosa), mais os contadores da
11.ª (muletas, falas a meio, preço e nome inventados). Uma onda que baixa uma
nota volta atrás. Um commit revertido conserta tudo isto: nenhuma onda toca
formato de save, infra ou dado de jogador.

**Quem faz:**
- onda 1: `backend` (o gatilho do Cronista e o que vai para a memória, em
  módulo puro) + `frontend`, com o bastão, para a linha do `histFinal`;
- ondas 2 e 3: `backend` (`prompt.js` e os `resumo*Prompt`), com `frontend` para
  o que mora no `App.jsx` (`infoTitulo`, `infoRegras` e o rodapé);
- onda 4: primeiro o teste cego, e só depois a tabela de pesos.

## 8. Os scripts (scratchpad da sessão, `custo/`)

| script | o que mede |
|---|---|
| `sim2.cjs` | o simulador da sessão (janela, cache explícito, rota, Sol); calibrado na 11.ª |
| `ondas.cjs`, `cen.cjs` | os cenários das tabelas 6 e 7 |
| `anat-us.cjs` | a anatomia da tabela 2 |
| `anat.cjs`, `blocos.cjs`, `rod.cjs` | o tamanho de cada parte e de cada bloco nos registos |
| `hu.cjs` | a mensagem do jogador no histórico |
| `uso.cjs` | se a narrativa usa o bloco |
| `leve.cjs`, `resp.cjs`, `s11.cjs` | o Cronista; os campos do JSON; a regressão da saída |
