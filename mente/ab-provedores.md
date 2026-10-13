# A/B de provedores para o Narrador — 13/10/2026

**Pergunta da pessoa:** há provedor melhor que o DeepSeek, cujos créditos estão a acabar depressa?

> **Atualizado na segunda rodada (paga, mais abaixo):** a recomendação mudou. Com a qualidade a mandar e o preço a desempatar, o Narrador deve passar para o **Gemini 3.8 Flash**: melhor que o DeepSeek em todos os critérios, por US$ 0,60 por sessão com o cache arrumado, contra US$ 0,43. O topo é o **GPT-5.6 Sol**, a US$ 1,67. Ver "Segunda rodada". O texto logo abaixo é o da primeira rodada, feita sem crédito.

**Resposta curta (primeira rodada):** por agora, **mantenha o DeepSeek no Narrador** e corte o gasto pelo **cache** e pelo **horário**, não pelo provedor. O Cronista não pesa nada (US$ 0,015 por sessão) e trocá-lo não poupa nada. Os candidatos pagos mais baratos (Haiku 5.5, Qwen3.8 Flash, GPT-5.6 Luna, MiMo V2.6 Pro) **ficaram por testar**: a conta do OpenRouter está sem crédito. O teste está pronto para correr quando houver saldo (ver a secção final).

---

## 1. O que aconteceu com o teste

- A chave do OpenRouter tinha **US$ 0 de crédito** (`/api/v1/credits` → `total_credits: 0`). Passaram **3 chamadas pagas** antes de o OpenRouter responder 402. A pessoa confirmou que não conseguiu pôr saldo.
- Segui a ordem de pivô: **qualidade só com variantes `:free`**, **custo calculado sem chamar nada**.
- **Nenhum dos candidatos do pedido tem variante gratuita** (DeepSeek, Qwen, Gemini, MiMo, GPT e Haiku não têm). As gratuitas que serviam para um Narrador:
  - `nvidia/nemotron-3-super-120b-a12b:free`: **12/12 pautas**.
  - `nvidia/nemotron-3-ultra-550b-a55b:free`: **10/12 pautas** (2 deram 503 "overloaded" duas vezes).
  - `google/gemma-4-31b-it:free` e `gemma-4-26b-a4b-it:free`: **429 upstream** em três tentativas espaçadas. Parei e não testei.
  - `thinkingmachines/inkling(-small):free`: **403**, só funciona em "agentic harnesses".
- **Todas as respostas Nemotron vieram de variante gratuita.** A versão paga é o mesmo modelo, mas o provedor gratuito pode diferir em quantização e latência.
- Amostras pagas avulsas (não chegam para concluir nada): o **DeepSeek V4 Pro reenviado** respondeu às pautas 8 e 14 (servido por Reka e Baidu, não pela DeepSeek). O **Claude Haiku 5.5** respondeu à pauta 17.

**Gasto total do teste: US$ 0,042** (as 3 chamadas pagas, mais uma que já estava em curso quando veio o 402). As 22 chamadas gratuitas custaram US$ 0. Como a conta tinha zero, estes US$ 0,04 ficam como **saldo negativo** no OpenRouter. A chave não foi escrita em lugar nenhum.

---

## 2. A régua (escrita antes de ler qualquer resposta)

| | critério | nota |
|---|---|---|
| a | cumpre a frase fechada da pauta (é fato / PERGUNTOU / O PREÇO / QUEM CARREGA / DESFECHO / envelope / O FECHO) | 0–2 |
| b | não inventa número, nome, lugar ou pista que a pauta não dá, nem revela o que o envelope proíbe | 0–2 |
| c | PT-BR correto, "você", concordância | 0–2 |
| d | JSON válido com `narrativa` string | automático |
| e | prosa viva | 0–5 |
| e' | tamanho dentro de 60–140 palavras | automático |
| f | muletas (calado/à espera, sem tirar os olhos/olhar fixo, cruza os braços, como quem, prende a respiração) | regex |

**Leitura cega:** por pauta, os rótulos A–D foram embaralhados com semente fixa e o mapa só foi aberto depois de todas as notas dadas. A base é a **resposta real do DeepSeek no registo da s10** (`prod`).

**As 12 pautas** (índices do `registo-s10.jsonl`):

| índice | tipo de pauta |
|---|---|
| 2 | abertura |
| 8 | PERGUNTOU preço + distância |
| 14 | QUEM CARREGA, com voz de provérbio |
| 17 | O PREÇO + etapa cumprida + FECHO de corte seco |
| 34 | PERGUNTOU + o mundo se mexe |
| 114 | QUEM CARREGA "inteiro" + PERGUNTOU + plantio |
| 142 | revelação: achado com preço |
| 149 | missão concluída + QUEM CARREGA + notícia |
| 194 | luta: abertura do combate |
| 201 | DESFECHO |
| 207 | APERTA, o empaque |
| 218 | falha que não pode revelar nada |

---

## 3. A tabela

Os custos são por **sessão de 75 turnos**, calculados com os tokens reais da s10:

- **Narrador:** 79 chamadas em 73 turnos; 38.847 tokens de entrada e 358 de saída por chamada.
- **Cronista:** 83 chamadas; 2.725 tokens de entrada (82% em cache) e 151 de saída.

Os preços são os oficiais do `/api/v1/models` do OpenRouter, em US$ por milhão de tokens: entrada / cache lido / saída.

Os tokenizadores não contam igual, e eu ajustei o que pude medir:

- O **Claude Haiku 5.5** conta **1,445×** os tokens do DeepSeek para o mesmo texto (medido: 40.812 contra 28.246).
- O **Nemotron** conta **0,96×** (medido em 3 pautas).
- Para os restantes usei 1,0×. É estimativa, ±15%.

| modelo | preço in / cache / out | cache de prefixo | Narrador/sessão hoje (cache 47%) | com cache 85% | qualidade a · b · c · e (média) | JSON quebrado | dentro de 60–140 | muletas | latência média |
|---|---|---|---|---|---|---|---|---|---|
| **DeepSeek V4 Pro, direto, fora do pico** (base, `prod`) | 0,66 / 0,022 / 1,98 | sim, implícito | **US$ 1,19** | **US$ 0,43** | **1,08 · 1,50 · 1,75 · 3,2** (12) | 0/12 | 6/12 | 6/12 | 7,4 s |
| DeepSeek V4 Pro, direto, **no pico** | 1,32 / 0,044 / 3,96 | sim | US$ 2,39 | US$ 0,86 | — | — | — | — | — |
| DeepSeek V4 Pro via OpenRouter, servido pela Baidu | 0,249 / — / 0,748 (promo, fp8) | **não** | US$ 0,81 | US$ 0,81 | 2 amostras: ok | 0/2 | 0/2 | 1/2 | 14 s |
| Nemotron 3 Ultra (**free**) | 0,60 / 0,12 / 2,40 | sim | US$ 1,20 | US$ 0,65 | **1,30 · 1,00 · 1,90 · 3,5** (10) | 0/10 | 3/10 | 3/10 | **18 s** |
| Nemotron 3 Super (**free**) | 0,08 / — / 0,45 | não | US$ 0,25 | US$ 0,25 | 0,67 · 1,00 · 1,25 · 2,2 (12) | 0/12 | 1/12 | **8/12** | 7,2 s |
| Claude Haiku 5.5 | 0,10 / 0,01 (escrita 0,125) / 0,50 | sim, com `cache_control` explícito | US$ 0,34 | US$ 0,15 | 1 amostra: 1 · 1 · 2 · 3 | 0/1 | 0/1 | 0/1 | 5,1 s |
| Qwen3.8 Flash | 0,15 / 0,016 / 0,47 | sim, implícito | US$ 0,29 | US$ 0,13 | não testado | | | | |
| GPT-5.6 Luna | 0,20 / 0,02 / 1,20 | sim | US$ 0,40 | US$ 0,18 | não testado | | | | |
| MiMo V2.6 Pro | 0,435 / 0,004 / 0,87 | preço de cache existe; implícito "false" | US$ 0,76 | US$ 0,24 | não testado | | | | |
| Gemini 3.8 Flash | 0,75 / 0,075 / 3,75 | sim, implícito | US$ 1,47 | US$ 0,66 | não testado | | | | |
| Gemma 4 31B | 0,09 / 0,05 / 0,34 | sim | US$ 0,23 | US$ 0,19 | 429 no free | | | | |

**O Cronista por sessão:**

| modelo | US$/sessão |
|---|---|
| DeepSeek V4 Flash direto, fora do pico | 0,015 |
| DeepSeek V4 Flash, no pico | 0,029 |
| Qwen3.8 Flash | 0,015 |
| Haiku 5.5 | 0,018 |

Ou seja, o Cronista é **~1% da conta**. **O Narrador é 98% do gasto.**

**Nemotron Ultra contra o DeepSeek, nas mesmas 10 pautas:**

| | a | b | c | e |
|---|---|---|---|---|
| DeepSeek (`prod`) | 1,0 | 1,5 | 1,9 | 3,1 |
| Ultra | 1,3 | 1,0 | 1,9 | 3,5 |

O Ultra cumpre um pouco mais a pauta e escreve um pouco melhor, mas **inventa mais**. Na pauta 218 deu a "pista de consolo" proibida (um tal Varek no cais). Na 17 revelou o nome que a personagem pedia para calar. Também escreve mais comprido: 3 respostas em 10 dentro do tamanho. **Não é mais barato** (US$ 1,20 contra 1,19 hoje, e 0,65 contra 0,43 com cache), e no free leva 18 s. Fica rejeitado.

O **Super** é barato e claramente pior:

- passa o tamanho em 11 de 12;
- tem muletas em 8 de 12;
- na luta (194) resolveu golpes e sangue por conta própria;
- no empaque (207) acordou o capanga desmaiado e inventou "a Estrada do Sal".

Também fica rejeitado.

### Um achado que não é de provedor

Três pautas falharam com **todos** os modelos, o DeepSeek real incluído:

- **114:** Helga não diz o "é fato… inteiro" do QUEM CARREGA em nenhuma das 3 respostas.
- **149:** nenhuma das 3 narra o fechamento da missão nem a notícia do envelope.
- **218:** o `prod` ignora a armadilha, e o Ultra entrega pista.

São pautas com **dois ou três envelopes empilhados**. O defeito está no pedido, não em quem responde, e é material para quem está em `src/prompt.js`.

---

## 4. Três respostas lado a lado (pauta 8: "quanto custa uma caneca e quanto leva até a Cabra Trêmula")

A pauta dá: **PERGUNTOU caneca ◉ 2 cobres** e **FECHO**: "alguém em cena deixa uma fala a meio".

**DeepSeek (resposta real da s10):**
> — Duas cobres, se não quiser beber água de poça. A Cabra? Duas esquinas, dois minutos. Mas o Godfrey serve mais rápido do que o vinagre dele. […] — Então é agora. Você quer que eu entre na frente ou prefere que fique na porta?

Tem o preço, mas erra o gênero ("duas cobres"). O fecho saiu pergunta, não fala a meio.

**Nemotron 3 Ultra (free):**
> — Duas moedas de cobre a caneca — responde o homem de manto sujo que largou a carroça, sem olhar na sua direção. […] — Na Cabra Trêmula. Dois minutos a pé, se não parar pra mijar no muro. Vira à direita na esquina da fonte seca, porta de ferro com uma cabra entalhada.

Preço e concordância certos, a melhor voz das três. O fecho também saiu pergunta.

**Nemotron 3 Super (free):**
> …o preço na boca do velho vendedor de cerveja é duas cobres a caneca — ele nem levanta os olhos do balde enquanto serve. Godfrey da Foz está na Cabra Trêmula […] cento e sessenta metros a sudeste […] Saoirse cruza os braços…

Tem o preço, mas erra o gênero, usa a muleta proibida pelo próprio FECHO e "vê" Godfrey dentro da taverna a 160 m de distância.

A título de registo: o **DeepSeek reenviado** na mesma pauta foi a única resposta que cumpriu o FECHO ("Vamos ver se o velho ainda desconfia de... — ela para no meio da frase").

---

## 5. A recomendação

**Manter o DeepSeek no Narrador e no Cronista, e cortar a conta por três alavancas que não pedem trocar de provedor:**

1. **Cache de 47% para 85%** (o trabalho em curso no `prompt.js`): **US$ 1,19 → US$ 0,43 por sessão**, −64%. É a maior alavanca de todas, e só vale enquanto o pedido for direto à DeepSeek, que tem cache implícito.
2. **Fugir do pico da DeepSeek:** no pico tudo custa o dobro (US$ 2,39 / 0,86 por sessão). Se as sessões de teste caem no pico, é aí que os créditos derretem.
3. **Não trocar o Cronista:** ele custa US$ 0,015 por sessão, e não há poupança possível ali.

**Por que não trocar já:**

- Os candidatos que poderiam cortar outros 60–70% (Haiku 5.5 ~US$ 0,15, Qwen3.8 Flash ~0,13, GPT-5.6 Luna ~0,18 por sessão com cache) **não foram medidos** em qualidade.
- O único modelo que se aproximou do DeepSeek na leitura cega (Nemotron Ultra) não sai mais barato.
- Trocar o Narrador sem prova é trocar a voz do jogo às cegas.
- O DeepSeek via OpenRouter servido pela Baidu (US$ 0,81) só ganha **enquanto o cache estiver nos 47%**. Com o cache arrumado, a DeepSeek direta (0,43) volta a ser mais barata.

**Quando houver crédito, corre-se a segunda volta.** Custo estimado: **~US$ 1,10** para 12 pautas em 6 modelos. O roteiro:

- O Narrador muda só se Haiku 5.5, Qwen3.8 Flash ou GPT-5.6 Luna empatarem com o DeepSeek em (a) e (b). Esses dois critérios pesam mais que a prosa, porque é neles que o jogo quebra.
- Se empatarem, o desenho fica **misto**: o candidato barato no Narrador, com o DeepSeek de reserva na fila de provedores.

---

## 6. O que mudaria em `api/narrador.js` (só se a segunda volta aprovar; é **pesado**: toca chave, infra e dinheiro, e quem decide é a pessoa)

- **Um terceiro provedor `chamarOpenRouter`**, OpenAI-compatível como o `chamarDeepSeek`. Chama `POST https://openrouter.ai/api/v1/chat/completions` e entra na `fila` com `PROVEDOR="openrouter"`.
- **Variáveis de ambiente novas na Vercel:**

  | variável | para quê |
  |---|---|
  | `OPENROUTER_API_KEY` | a chave |
  | `OR_MODELO_NARRADOR` | ex.: `anthropic/claude-haiku-5.5` |
  | `OR_MODELO_LEVE` | o modelo do Cronista |
  | `OR_TEMPERATURA` | default 0.85, como o caminho Gemini |
  | `OR_PENALIDADE` | só enviada se o modelo aceitar `frequency_penalty`; Haiku, Gemini e GPT não aceitam |
  | `OR_PROVEDORES` | lista para `provider.order`, ex.: `deepseek` para fixar o endpoint oficial e manter o cache implícito |

- **No corpo do pedido:**
  - `reasoning: { enabled: false }`, o equivalente ao `thinking: disabled`;
  - `response_format: { type: "json_object" }`;
  - `usage: { include: true }`;
  - `provider: { order, allow_fallbacks: true, require_parameters: true }`.
- **Claude:** o cache só existe com `cache_control: { type: "ephemeral" }` na parte estática do `system`. Sem isso, as contas de cache acima não valem.
- **`src/custo.js` → `lerUso`:** hoje lê `prompt_cache_hit_tokens` ou `cached_tokens` na raiz. O OpenRouter devolve `usage.prompt_tokens_details.cached_tokens`, e sem esse campo o painel de custo mostraria cache 0. O OpenRouter também devolve `usage.cost` pronto.

---

## 7. Como retomar (scratchpad da sessão `953734d9…/scratchpad/ab-provedores/`)

| arquivo | o que faz |
|---|---|
| `regua.md` | a régua, escrita antes de ler as respostas |
| `rodar.cjs <modelo> <índices> [concorrência]` | reenvia as pautas; recusa ids pagos sem `AB_PAGO=1`; para em 402/429; guarda em `res/<modelo>.json` |
| `cego.cjs` | gera `cego.txt` (cego) e `mapa.json` (rótulos + JSON, palavras, muletas, latência) |
| `custo.cjs` | a tabela de custo |
| `gasto.cjs` / `cred.cjs` | gasto e crédito da chave, sem imprimi-la |

Índices da segunda volta: `2,8,14,17,34,114,142,149,194,201,207,218`. Modelos: `deepseek/deepseek-v4-pro-0813` (de preferência com `OR_PROVEDORES=deepseek`), `anthropic/claude-haiku-5.5`, `qwen/qwen3.8-flash`, `openai/gpt-5.6-luna`, `xiaomi/mimo-v2.6-pro` e `google/gemini-3.8-flash`.

---

# Segunda rodada (paga) — 13/10/2026

**O pedido:** a pessoa recarregou o OpenRouter com US$ 5 e pôs um teto de US$ 2,00 nesta rodada. Disse também: *"precisamos de uma qualidade narrativa muito grande"*. A qualidade manda; o preço só desempata.

## Como foi feita

**As pautas:** as mesmas 12 da primeira rodada (2, 8, 14, 17, 34, 114, 142, 149, 194, 201, 207, 218), com o mesmo `system` e as mesmas mensagens do registo da s10. Entram as três pautas de envelopes empilhados:

| pauta | o que pede |
|---|---|
| 114 | Helga / QUEM CARREGA "inteiro" |
| 149 | Perrin + fim da missão + notícia |
| 218 | armadilha falhada que não pode revelar nada |

**Os parâmetros:**

- DeepSeek: os de produção (temperatura 1.0, penalidade de frequência 0.3).
- Os outros: temperatura 0.85, sem penalidade (o caminho Gemini do `narrador.js`).
- Todos: raciocínio desligado (`reasoning: {enabled:false}`, 0 tokens de raciocínio em todos) e `response_format: json_object`.

**Os modelos:**

- **Baratos, 12 pautas cada:** DeepSeek V4 Pro reenviado, Claude Haiku 5.5, Qwen3.8 Flash, GPT-5.6 Luna, MiMo V2.6 Pro, Gemini 3.1 Flash Lite (o Flash mais barato) e Gemini 3.8 Flash (o Flash atual).
- **De topo, pedido da pessoa:** Claude Sonnet 5.5 e GPT-5.6 Sol. São caros, e por isso correram só as 5 pautas mais difíceis (14, 114, 149, 207, 218).
- **Base:** a **resposta real do DeepSeek no registo** (`prod`).
- **O endpoint do DeepSeek:** o oficial ficou de fora, porque a política de dados da conta OpenRouter o bloqueia ("training violation"). Mudar isso é configuração da conta, e não mexi. Pus o reenvio na Alibaba, que cobra o mesmo preço oficial (0,66 / 0,066 / 1,98).

**A régua:** a mesma da primeira rodada, com os pesos da pessoa:

**nota = 35% prosa viva (e) + 25% cumpre a pauta (a) + 20% não inventa (b) + 20% PT-BR (c)**, numa escala de 0–10.

**Avaliação cega:**

- 8 respostas por pauta, rótulos A–H embaralhados com semente fixa.
- As notas foram todas escritas antes de abrir o mapa.
- Os dois de topo tiveram um cego próprio, com o `prod`.

## A tabela

Custo por sessão de 75 turnos, só o Narrador: 81 chamadas, 38.847 tokens de entrada do DeepSeek cada.

- A **razão de tokens** é o quanto cada tokenizador conta para o mesmo texto, medido nas 12 pautas.
- A **saída** é a média medida de cada modelo.
- **Hoje** = cache a 47%. **Com cache** = 85%.

| modelo | pautas | a cumpre (0–2) | b não inventa (0–2) | c PT-BR (0–2) | e prosa (0–5) | **nota 0–10** | JSON quebrado | 60–140 palavras | muletas | latência | razão de tokens | US$/sessão hoje | **US$/sessão com cache** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **DeepSeek V4 Pro, real (`prod`)** | 12 | 1,08 | 1,50 | 1,75 | 3,17 | **6,8** | 0 | 6/12 | 7/12 | 7,4 s | 1,00 | 1,19 | **0,43** |
| DeepSeek V4 Pro, reenviado | 12 | 1,17 | 1,33 | 1,83 | 3,50 | 7,1 | 0 | 5/12 | 6/12 | 8,4 s | 1,00 | 1,19 | 0,42 |
| **Gemini 3.8 Flash** | 12 | **1,92** | **1,58** | 1,83 | **4,17** | **8,7** | 0 | 1/12 | **2/12** | 6,8 s | 0,90 | 1,33 | **0,60** |
| GPT-5.6 Luna | 12 | 1,58 | 1,33 | 1,83 | 3,25 | 7,4 | 0 | 2/12 | 4/12 | 4,4 s | 0,87 | 0,41 | 0,17 |
| Gemini 3.1 Flash Lite | 12 | 1,58 | 1,42 | 1,83 | 2,75 | 7,2 | 0 | 4/12 | 4/12 | 3,9 s | 0,90 | 0,44 | 0,20 |
| MiMo V2.6 Pro | 12 | 1,00 | 1,50 | 1,50 | 3,25 | 6,5 | 0 | 5/12 | 6/12 | **18,8 s** | 1,01 | 0,76 | 0,24 |
| Qwen3.8 Flash | 12 | 0,75 | 0,75 | 1,75 | 2,92 | 5,5 | 0 | 4/12 | 7/12 | 8,8 s | 0,90 | 0,26 | 0,11 |
| Claude Haiku 5.5 | 12 | 0,33 | 1,00 | 1,75 | 3,08 | 5,3 | **1** (JSON entre crases) | 5/12 | 5/12 | 4,7 s | **1,45** | 0,34 | 0,14 |
| *`prod` nas 5 difíceis* | 5 | 0,40 | 1,40 | 1,80 | 2,80 | *5,7* | 0 | 3/5 | 3/5 | 7,4 s | 1,00 | 1,19 | 0,43 |
| **GPT-5.6 Sol** | 5 | **2,00** | 1,80 | **2,00** | 4,40 | **9,4** | 0 | 1/5 | 1/5 | 5,8 s | 0,87 | 4,08 | **1,67** |
| Claude Sonnet 5.5 | 5 | 1,20 | 1,80 | 1,80 | **4,60** | 8,3 | 0 | 0/5 | 1/5 | 7,5 s | 1,45 | 6,65 | 2,49 |

Notas de preço (em US$ por milhão de tokens):

- **GPT-5.6 Luna e Sol:** o OpenRouter cobrou a entrada sem cache ao preço de escrita (0,25 e 2,5), e é esse que está na conta.
- **Gemini 3.8 Flash:** cobrado a 0,75 de entrada e 3,75 de saída.
- **Haiku e Sonnet:** o tokenizador da Anthropic conta **45% mais** tokens no nosso português. Com cache, precisam de `cache_control` explícito.

**Todos os modelos escrevem mais comprido do que os 60–140 palavras pedidos**, o DeepSeek incluído. O Gemini 3.8 Flash é o que mais passa: só 1 resposta em 12 dentro. O tamanho é regra do prompt e cobra-se lá.

## As três pautas empilhadas: alguém as cumpre?

Nota (a) por pauta: 2 = cumpriu, 1 = metade, 0 = falhou.

| modelo | 114 Helga | 149 fim da missão | 218 armadilha |
|---|---|---|---|
| DeepSeek real | 0 | 0 | 0 |
| DeepSeek reenviado | 1 | 1 | 0 |
| **GPT-5.6 Sol** | **2** | **2** | **2** |
| **Gemini 3.8 Flash** | **2** | **2** | 1 |
| GPT-5.6 Luna / MiMo / Gemini Lite | 1 | 1 | 2 |
| Sonnet 5.5 | 1 | 1 | 1 |
| Qwen3.8 Flash | 1 | 0 | 0 |
| Haiku 5.5 | 0 | 0 | 1 |

**Sim, cumprem-se.**

- O **GPT-5.6 Sol** cumpriu as três.
- O **Gemini 3.8 Flash** cumpriu duas, e na terceira a mola "emperra" em vez de "saltar".
- O DeepSeek falhou as três na sessão real.

Então o defeito que a primeira rodada atribuía ao pedido é, em boa parte, **do modelo**. Quando a pauta empilha dois ou três envelopes, o DeepSeek fica com um e larga os outros.

## Três respostas lado a lado (pauta 114: Helga tem de dizer, inteiro, que recruta e que deu o nome da heroína)

**DeepSeek, resposta real da s10 (falhou):**
> — E eu te chamei de sargenta porque você nunca deixou de ser. Posto não se tira da gente, Hilda. Só se enterra com a gente.

A frase é bonita, mas o "é fato: entra nesta resposta" não entrou. A resposta também não termina em pergunta, como o FECHO pedia.

**Gemini 3.8 Flash (cumpriu):**
> — […] Fui eu que dei teu nome. Eu recruto pra quem tá por trás de tudo isso, sargenta. […] Nyla dá um passo para o lado, escorando o quadril no balcão quase colada em Helga […]. Nenhuma das duas parece notar o espaço que encurtaram.

Tem o fato inteiro. O plantio do interesse entre as duas está mostrado sem ser dito. Fecha em pergunta.

**GPT-5.6 Sol (cumpriu):**
> — Mas já que você veio cobrar verdade, toma a minha: sua antiga companheira de armas está metida nisso. Ela recruta para quem está por trás de tudo. Fui eu que dei seu nome a quem esperava você. […] Helga segura a outra ponta antes que ele tombe. Nenhuma larga primeiro.

Tem o fato, a medalha da PERGUNTOU e o plantio num gesto. Fecha em pergunta.

## Qualidade contra o DeepSeek, modelo a modelo

| modelo | contra o DeepSeek | exemplo | US$/sessão com cache |
|---|---|---|---|
| **GPT-5.6 Sol** | **melhor, e muito** (9,4 contra 5,7 nas mesmas 5 pautas) | Cumpre as três pautas empilhadas. Na 218 entrega a falha em 46 palavras, sem pista; na 207 a Saoirse corrige a placa "sem estranhar", exatamente o envelope APERTA | 1,67 (×3,9) |
| **Gemini 3.8 Flash** | **melhor** (8,7 contra 6,8, em 12 pautas) | Na 14 o Godfrey diz o próprio nome, e a Nyla diz a frase com provérbio ("Pedra que rola não junta musgo, e língua solta enterra o dono antes do inverno"). Na 34 o Rei Emprestado entra na fala de um mendigo, entrelaçado com a compra | **0,60 (×1,4)** |
| Claude Sonnet 5.5 | melhor na prosa (4,6, a mais viva de todas), igual a pior em cumprir (1,2) | Na 14, duas conversas a atropelar-se e o Godfrey a reconhecer a Hilda; mas esqueceu a frase da Nyla. Na 218 narrou a heroína na 3.ª pessoa ("Os dedos de Hilda… Ela mexe") | 2,49 (×5,8) |
| GPT-5.6 Luna | **igual, um pouco melhor** (7,4): cumpre mais, prosa igual | Na 2 a abertura cita o que existe e fecha em pergunta; na 207 inventou a "Vigia dos Andarilhos" | 0,17 (×0,4) |
| Gemini 3.1 Flash Lite | igual (7,2): cumpre mais, prosa mais pobre (2,75) | Na 218 entrega a falha seca e certa, mas escreve "como um relatório" | 0,20 |
| DeepSeek reenviado | igual (7,1) | É o mesmo modelo, e a mesma loteria nas empilhadas | 0,42 |
| MiMo V2.6 Pro | igual a pior (6,5), e **18,8 s** de latência | Na 2 escreveu "Sãoirse" três vezes; na 218 acertou em cheio | 0,24 |
| Qwen3.8 Flash | **pior** (5,5) | Na 218 a heroína atira uma flecha na arqueira, em vez de desarmar a armadilha | 0,11 |
| Claude Haiku 5.5 | **pior** (5,3) | Na 14 a Nyla não diz a frase; na 201 dá à heroína o golpe que foi da Saoirse; na 2 devolveu o JSON entre crases | 0,14 |

## A recomendação final

**Trocar o Narrador para o Gemini 3.8 Flash, e manter o Cronista no DeepSeek Flash.**

- **Qualidade:** é o único modelo barato que é claramente melhor que o DeepSeek em todos os critérios que a pessoa mandou pesar (prosa 4,17 contra 3,17; cumprir 1,92 contra 1,08; não inventar 1,58 contra 1,50; muletas em 2 de 12 contra 7 de 12), e cumpriu duas das três pautas empilhadas que o DeepSeek falhou.
- **Preço:** US$ 0,60 por sessão com o cache a 85%, contra 0,43 do DeepSeek: +40%, uns 17 cêntimos por sessão. Hoje, com o cache a 47%, sai 1,33 contra 1,19.
- **Latência:** 6,8 s, contra 7,4 s.
- **Cronista:** é ~1% da conta (US$ 0,015 por sessão) e não pede escrita fina; trocá-lo não ganha nada.

**Se a pessoa quiser o melhor que o dinheiro compra:**

- O **GPT-5.6 Sol** foi o único a cumprir tudo, e escreve quase tão bem quanto o Sonnet, com PT-BR impecável. Custa US$ 1,67 por sessão com cache (4 vezes o DeepSeek).
- **Mas foi medido em só 5 pautas**, as difíceis. Antes de o adotar, vale uma terceira rodada de ~US$ 0,90: as 12 pautas, só no Sol.
- O **Sonnet 5.5** tem a prosa mais viva de todas, mas cumpre menos e custa US$ 2,49. Não compensa.

**O que não fazer:** trocar pelo Haiku 5.5 ou pelo Qwen3.8 Flash para poupar. São os mais baratos (US$ 0,11–0,14) e são piores que o DeepSeek justamente no que a casa mais vigia: cumprir a pauta e não inventar.

**O que vale com qualquer modelo:**

- Arrumar o cache (47% → 85%) corta 55–64% da conta.
- Fugir do pico da DeepSeek, enquanto ela ficar, corta metade.

## O que muda em `api/narrador.js` (pesado: toca dinheiro e infra, quem decide é a pessoa)

**O caminho mais curto já existe:** o `chamarGemini` fala direto com a API do Google e usa a `GEMINI_API_KEY`. Não precisa do OpenRouter. Faltam três coisas:

1. **Modelo por variável de ambiente.** Hoje o `MODELOS` do Gemini está escrito no código, e para o Narrador começa no `gemini-3.1-pro-preview` (US$ 2 / 12). Passaria a `GM_MODELO_NARRADOR` (= `gemini-3.8-flash`) e `GM_MODELO_LEVE`, com a lista atual como reserva.
2. **Pensamento.** Hoje é `thinkingConfig: { thinkingLevel: "LOW" }`, e os tokens de pensamento são cobrados como saída (US$ 3,75/M). O teste correu sem pensamento e saiu assim; vale pôr o nível no mínimo por uma variável, por exemplo `GM_PENSAMENTO=MINIMAL`.
3. **`PROVEDOR=gemini`** na Vercel. O DeepSeek fica atrás na fila, como reserva.

**Para o GPT-5.6 Sol**, ou para usar o OpenRouter como agregador, entra o provedor `chamarOpenRouter` descrito na secção 6: `OPENROUTER_API_KEY`, `OR_MODELO_NARRADOR`, `OR_MODELO_LEVE`, `OR_TEMPERATURA`, `OR_PROVEDORES`.

**O `lerUso` de `src/custo.js`** tem de ler também `usage.prompt_tokens_details.cached_tokens` (formato OpenAI/OpenRouter). O caminho Gemini já é lido pelo `cachedContentTokenCount`.

**Antes de virar a chave:** jogar uma sessão curta com o Gemini 3.8 Flash. Como ele escreve comprido, vale conferir se o tamanho ainda cabe na tela; se não, apertar o tamanho no prompt, não no modelo.

## Gasto

| | US$ |
|---|---|
| **Segunda rodada** | **1,91** (teto 2,00) |
| baratos, 7 modelos × 12 pautas | 0,91 |
| Sonnet 5.5, 5 pautas | 0,575 |
| Sol, 5 pautas | 0,425 |
| **Total gasto na conta (as duas rodadas)** | **1,95** (`/api/v1/credits`) |
| **Saldo restante** | **~3,05** de 5,00 |

A chave não foi escrita em nenhum arquivo.

**Arquivos no scratchpad** (`ab-provedores/`):

| arquivo | o que guarda |
|---|---|
| `res/` | os 7 baratos desta rodada |
| `res-topo/` | o Sonnet e o Sol |
| `res-r1/` | a primeira rodada |
| `cego2.txt`, `cego3.txt` | as leituras cegas |
| `mapa2.json`, `mapa3.json` | o mapa dos rótulos |
| `analise2.cjs` | as notas e as contas |
