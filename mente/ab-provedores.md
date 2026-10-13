# A/B de provedores para o Narrador — 13/10/2026

**Pergunta da pessoa:** há provedor melhor que o DeepSeek, cujos créditos estão a acabar depressa?

**Resposta curta:** por agora, **mantenha o DeepSeek no Narrador** e corte o gasto pelo **cache** e pelo **horário**, não pelo provedor. O Cronista não pesa nada (US$ 0,015 por sessão) e trocá-lo não poupa nada. Os candidatos pagos mais baratos (Haiku 5.5, Qwen3.8 Flash, GPT-5.6 Luna, MiMo V2.6 Pro) **ficaram por testar**: a conta do OpenRouter está sem crédito. O teste está pronto para correr quando houver saldo (ver a secção final).

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
