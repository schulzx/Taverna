# O estudo do Mestre — o que o Matt Mercer faz, em número, e o que nos falta (10/11/2026)

> **A palavra da pessoa (10/11/2026):** *«tudo o que esse sistema conseguir fazer depois de treinado com
> as campanhas do critical role, ele deverá poder fazer, desde que fique melhor do que temos hoje… vamos
> fazer nosso sistema dar certo e treiná-lo da melhor forma».*
>
> **A lei deste documento:** nenhuma frase do programa entra no projeto. Daqui só saem contagens,
> proporções e padrões **descritos por nós**. O corpus (CRD3, CC BY-SA 4.0; o programa é da Critical
> Role) e o analisador ficam fora da árvore, no scratchpad da sessão
> (`…/scratchpad/crd3/analisador/matt.cjs`, `nos.mjs`, `semente.cjs`).

**Quem fez:** o `conselheiro`, 10/11. **O que se mede:** 159 episódios (campanha 1, ep. 1–115;
campanha 2, ep. 1–46), ~563 horas de mesa pelo proxy, contra o que temos de nós: 226 respostas do
Narrador com a frase do jogador (sessões 8, 9 e 10 em `testes/registo-s8-s10-cronista.json`; sessão 14
em `mente/sessao-14-dados/pedidos-ator-s14.json`), mais os números escritos da 18.ª sessão
(`mente/sessao-18.md` §2–§3), e o catálogo de hoje (`lerAcao`, pós-MC1) corrido sobre as nossas frases.

---

## 1 · O método, e onde ele mente

1. **Regex em inglês, sobre transcrição.** Detetam-se nas falas do Mestre os pedidos de teste de
   perícia, de atributo, de ferramenta, as salvaguardas, a iniciativa, os pedidos de ataque e dano, a
   CD dita em voz alta, vantagem/desvantagem, testes em grupo, os dados nomeados; nas falas dos
   jogadores, a declaração de ação, a pergunta de jogo e o número que tiraram. É contagem por
   palavra-chave: **ruidosa**, e com viés conhecido para baixo (um pedido dito de forma que a regex não
   prevê não conta) e para cima (uma conversa à mesa que parece declaração conta).
2. **O tempo é um proxy:** palavras faladas por todos ÷ 150 por minuto. Dá 3,54 h por episódio, perto
   do que os episódios duram; serve para *ritmo*, não para cronómetro.
3. **A luta é uma janela:** do pedido de iniciativa até 60 falas sem vocabulário de luta. Dá 22% das
   palavras em luta e 0,89 lutas por episódio. Pode errar a fronteira em ±dezenas de falas.
4. **A intenção é nossa:** 16 categorias em português (procurar, esgueirar, ler pessoa, lembrar,
   arcano, forçar, equilibrar, rastrear, socorrer, furtar, convencer, intimidar, enganar, atuar,
   animal, perguntar) + «outro». No inglês, «outro» é sobretudo **fala em personagem** — e é onde
   moram quase todos os testes sociais; por isso convencer/enganar/intimidar saem com poucos casos.
5. **O número do jogador** é o último dito antes da primeira fala do Mestre que narra; «baixo» = total
   ≤ 9, «alto» = total ≥ 18 (a CD quase nunca é dita, então o corte é pela régua típica).
6. **A unidade de comparação.** O nosso turno é uma frase inteira do jogador; no programa, uma
   declaração é uma fala com verbo de ação. São parecidas, não iguais (um turno nosso junta duas ou
   três falas deles). Onde a unidade engana, comparo também por **palavras narradas pelo Mestre**.
7. **O nosso lado é pequeno:** 226 respostas, 208 fora da luta, de quatro sessões, três delas antes
   da Fase MC. Onde não há dado comparável, digo-o na linha.

---

## 2 · As métricas, lado a lado

| # | métrica | Matt (159 ep.) | nós | fonte do nosso número |
|---|---|---:|---:|---|
| 1 | **declarações fora da luta seguidas de dado** | **26,5%** (1 em 3,8) | **4,3%** (1 em 23) · S18: 9 em 26, mas **1** responde à frase | s8–s10+s14; `sessao-18.md` §2 |
| 2 | frases nossas que o catálogo de hoje torna teste | — | **9,7%** (15 de 155; sem o contexto do jogo) | `lerAcao` sobre o corpus |
| 3 | palavras do Mestre fora da luta **por dado** | **389** | 2.866 (s8–s14) · ~360 (S18) | mediana 124 palavras × turnos ÷ dados |
| 4 | testes fora da luta por hora (+ salvaguardas) | 11,1 (+1,3) | sem relógio comparável | — |
| 5 | quem pede o dado | Mestre **94%**, jogador 6% | o Mestre (MC2/MC3) | — |
| 6 | pedidos sem ação declarada logo antes (espontâneos) | **37%**: Percepção 15%, Furtividade 13%, sociais 13%, em grupo 10% | 4 ofertas iguais de Percepção em 26 turnos | S18 §2 |
| 7 | **sucesso alto que não dá nada** | **1%** (76% dão resposta de ≥ 25 palavras) | **75%** (3 de 4 Percepções à vista) | S18 §2 |
| 8 | depois de um resultado baixo | nada **7%** · meia-verdade 23% · mordida 11% · a cena segue 59% | 1 falha, com preço | S18 §2 (amostra de 1) |
| 9 | **perguntas de «o que sei de…» respondidas com dado** | **22%** (78% respondidas sem dado) | MC1 manda **todas** a Saberes | plano MC §3.1 |
| 10 | perguntas de jogo respondidas com dado | 9,4% | 3,4% | s8–s14 |
| 11 | **palavras da resposta a uma pergunta de jogo** (mediana · p75) | **11 · 25** | **113** (mínimo 44 em 226) | s8–s10 |
| 12 | palavras da resposta a uma declaração (mediana) | 9 (fala a fala) | 131 | s8–s10 |
| 13 | descrições longas (≥ 40 palavras) por hora fora da luta · mediana | 16,9 · 78 palavras | toda resposta é descrição · 124 | — |
| 14 | **descrições com ≥ 3 sentidos** | **4%** (≥ 2: 25%) | **48%** (≥ 2: 88%) | s8–s14 |
| 15 | cheiro · tato/temperatura · som, por descrição | 3% · 12% · 21% | 27% · 48% · 73% | s8–s14 |
| 16 | CD dita em voz alta | **0%** nos testes · 0,7% nas salvaguardas | sempre («precisa de 14», MC3) | — |
| 17 | o Mestre pergunta «como?» antes de chamar o dado | 2% | — | — |
| 18 | vantagem · desvantagem · teste em grupo | 3% · 2% · 7% | — | — |
| 19 | o mundo mexe sem ser pedido | 7% das declarações (3,0/h) | **2,9%** dos turnos (envelope do sistema) | s8–s10 |
| 20 | luta: palavras do Mestre fora da luta **por luta** | 13.344 | ~1.600 (S18) · ~2.500 (s8–s10) | — |
| 21 | o «como queres fazer isto?» no golpe final | 0,66 por iniciativa | existe (`taverna_cfg_golpe_final=perguntar`) | — |
| 22 | episódio que fecha num gancho (novidade ou luta nos 15 turnos antes do corte) | **64%** (47% novidade · 17% em luta · 36% calmo; 9 sem fecho detetado) | **não achei mecanismo de fecho** | `src/` (grep) |
| 23 | fala narrativa que acaba a perguntar ao jogador | 6% (o «o que fazes?» explícito: 0,6/h) | 12% acabam em pergunta; 0% «o que faz?» | s8–s14 |
| 24 | espólio por hora fora da luta · descansos por episódio | 0,92 · 0,57 curtos + 0,27 longos | sem dado comparável (a regex apanha preços) | — |
| 25 | fração das palavras ditas pelo Mestre | 49,7% | — | — |

**O que a tabela desfaz (mitos que tínhamos):** o Matt **não** pergunta «o que fazes?» a cada fala
(0,6 por hora); **não** pergunta «como?» antes de rolar (2%); **não** diz a CD (0%); **não** gasta todos
os sentidos (4% das descrições com três); e a falha dele **quase nunca é um nada** (7%).

---

## 3 · As lacunas, por tamanho de efeito no jogador

Ordem: o que o jogador sente em todo turno primeiro; o que sente uma vez por sessão depois.

### L1 · O dado não responde à intenção (efeito: todo turno)

**Matt:** um dado em ~1 de cada 4 declarações, e a probabilidade depende do que se tenta: rastrear
57% · ler alguém 51% · procurar 43% · esgueirar 40% · furtar 39% · equilibrar 39% · lembrar 34% ·
forçar 31% · socorrer 28% · arcano 26% · convencer 19% (os sociais sobem muito se se contar a fala em
personagem). **Nós:** 4% antes da MC; na S18, 9 dados em 26 turnos mas **um só** nasceu da frase. O
catálogo de hoje, sem o contexto do jogo, torna teste 10% das nossas frases — e erra nos dois
sentidos: «procuro ‹nome› no ‹sítio›» vira busca de Percepção (o Matt nunca rola para encontrar quem
se sabe onde está), «examino o ‹lugar› com cuidado, o chão, as lonas» não vira nada, e **toda** busca
vai a Percepção (o Matt divide quase meio a meio: Percepção 42%, Investigação 40%).

**Proposta:** `PROBABILIDADE_POR_INTENCAO` não como regra de sorte, mas como **catraca**: um corpus
etiquetado das nossas frases (as 155 deste estudo + as da S18 + as da 19.ª) corre pelo `lerAcao` com
contexto, e a taxa de teste por categoria tem de cair dentro de ±15 pontos da do Matt (semente em
`…/scratchpad/crd3/semente-das-intencoes.json`). E duas linhas no catálogo: «procurar ‹pessoa
conhecida›» é ir, não buscar; «olho/examino ‹coisa à mão›» vai a Investigação, «olho em volta / à
espreita» a Percepção. **Quem:** backend (catálogo + suíte) · testes (o corpus). **Prova na 19.ª:**
≥ 20% dos turnos fora da luta com dado **nascido da frase**; Investigação ≥ 25% das buscas.

### L2 · O sucesso que não dá nada (efeito: o dado vira ritual)

**Matt:** resultado alto vazio em 1%; em 76% a resposta tem substância. **Nós:** 75% (S18). É a MC4,
e o estudo **confirma o alvo e sobe-o**: a planta pede ≥ 95% de sucessos com facto; o Matt está em
~99%. **Proposta:** manter MC4, com a catraca a 97%. **Quem:** backend. **Prova:** a da MC4 + na 19.ª,
0 sucessos vazios no lugar do passo.

### L3 · A resposta não tem o tamanho da pergunta (efeito: todo turno, e o custo)

**Matt:** a uma pergunta de jogo, mediana de 11 palavras (p75: 25); a conversa é pingue-pongue, e a
descrição longa (mediana 78) fica para quando há o que ver — ~17 por hora. **Nós:** 113 palavras a uma
pergunta, nunca menos de 44. «Quanto custa a cerveja?» recebe um parágrafo. É a maior diferença de
ritmo do estudo, e é o que mais faz o jogo parecer «um sistema interativo» em vez de uma mesa.

**Proposta:** `TAMANHO_DA_RESPOSTA` (tabela nova): por tipo de turno — pergunta respondida pelo
sistema · ação trivial · conversa · chegada a lugar novo · consequência de dado · revelação — um teto
de palavras e o `maxTokens` do pedido. Entra pela pauta dinâmica como **uma linha que substitui** a
indicação de tamanho que houver (nenhum bloco novo), e pelo `maxTokens` do `PEDIDO_AO_ATOR`. **Quem:**
backend (tabela + classificador do turno) → oficial (o `maxTokens` por turno, com `calou`). **Prova:**
suíte: cada tipo tem teto, o pior caso do prompt não cresce; na 19.ª, mediana das respostas a
perguntas ≤ 40 palavras, chegadas ≥ 80, e o custo por resposta cai.

### L4 · Saber vira dado sempre (efeito: a pergunta mais comum de quem chega)

**Matt:** «o que sei de…» é respondido **sem dado em 78%** dos casos; rola em 22%, quando o saber é
raro. **Nós:** a MC1 manda toda frase de saber a Saberes. **Proposta:** uma linha em
`QUANDO_O_MESTRE_CHAMA`: **saber comum não se rola** — o que a origem, o ofício e o antecedente do herói
dariam, e o que o registo do lugar diz a quem lá está, sai como facto, sem dado; o dado fica para o
escondido (o bestiário raro, o segredo do passo, a terra estrangeira). **Quem:** backend. **Prova:**
suíte: «o que sei de ‹a cidade onde estou›» sem dado e com facto; «o que sei de ‹a criatura rara›» com
dado; na 19.ª, ~1 em 4 perguntas de saber com dado.

### L5 · Todos os sentidos em todo turno (efeito: repetição que cansa)

**Matt:** 4% das descrições longas com três sentidos; cheiro em 3%, tato em 12%. **Nós:** 48% com três;
cheiro em 27%, tato em 48%, som em 73% — e em toda resposta, até na que continua a cena. **Proposta:**
`PINCELADAS_POR_TURNO`: chegada a lugar novo, até 2 sentidos (um não visual); continuação no mesmo
lugar, 0–1; a linha CENA da ficha diz o número **deste** turno (troca a frase fixa por uma linha
dinâmica, não soma). **Quem:** backend. **Prova:** suíte (a linha muda com o turno, o teto não cresce);
na 19.ª, em turnos sem mudança de lugar, cheiro ou tato em ≤ 20% e três sentidos em ≤ 10%.

### L6 · A falha como «nada» (efeito: o jogador deixa de arriscar)

**Matt:** depois de um resultado baixo, «nada» explícito em 7%; meia-verdade («mas…», «parece-lhe
que…») em 23%; mordida em 11%; e em 59% a cena simplesmente segue, sem o que se queria. **Nós:** a MC
§2.5 dá preço a toda falha (`CUSTO_DE_FALHAR`) — o estudo **corrige**: morder sempre é mais do que o
Matt morde. **Proposta:** `MARGEM_DA_FALHA`: falhar por ≤ 3 dá meia-verdade (o facto com uma parte em
falta, ou o facto com custo); falhar por mais cobra o aviso; «nada acontece» nunca é a resposta.
**Quem:** backend (junto da MC4). **Prova:** em 10 000 rolagens semeadas, falhas por ≤ 3 com facto
parcial = 100%; na 19.ª, falhas narradas como «nada» ≤ 10%.

### L7 · A oferta repetida (efeito: o dado denuncia-se)

**Matt:** 37% dos pedidos vêm sem ação declarada antes — e espalham-se por Percepção, Furtividade,
Persuasão, Investigação, Enganação; 10% são em grupo. **Nós:** quatro ofertas iguais de Percepção em 26
turnos. A MC6 trata a oferta vazia; o estudo **acrescenta** a variedade: **a oferta segue a cena**
(lugar guardado → Furtividade; alguém que esconde → Intuição; há o que achar → Percepção; companheiro
presente → teste em grupo), e nunca a mesma perícia duas vezes seguidas. **Quem:** backend (MC6).
**Prova:** em 1000 cenas, nenhuma perícia > 40% das ofertas; na 19.ª, ≥ 3 perícias diferentes nas
ofertas.

### L8 · O mundo mexe pouco (efeito: o mundo parece parado à espera do herói)

**Matt:** o mundo interrompe em ~7% das declarações. **Nós:** o envelope do sistema aparece em 2,9% dos
turnos — **abaixo do próprio teto da tabela** (`RITMO_DO_MUNDO = { cada: 6, chance: 45 }`,
`oraculo.js:692`, que permitiria ~1 em 7). A suspeita, **não provada**: `MOVIMENTOS_DO_MUNDO` tem
poucas entradas abertas fora de relógio e boato. **Proposta:** medir em Node quantas vezes
`iniciativaDoMundo` devolve `null` por não haver movimento aberto; se for a causa, ampliar o acervo no
mesmo formato. **Quem:** backend. **Prova:** em 1000 contextos de cidade, movimento aberto em ≥ 80%; na
19.ª, ≥ 5% dos turnos fora da luta com o mundo a mexer.

### L9 · A sessão não fecha num gancho (efeito: uma vez por sessão — e é o que faz voltar)

**Matt:** 64% dos episódios param logo depois de uma novidade ou no meio de uma luta. **Nós:** não achei
no código um momento de fecho nem um «da última vez» ao reabrir (procurei em `src/`: `abertura.js` e
`sessao-guardada.js` guardam e reabrem, não fecham). **Proposta (pesada — muda o que o jogador vive):**
*o gancho de saída* — ao dormir ou ao sair, o sistema escolhe do registo o fio mais quente (o relógio
quase cheio, a pessoa que vem, o passo à vista) e a reabertura começa por ele. **Quem:** jogo (o
momento) → backend → oficial. **Prova:** suíte: o gancho sai sempre do registo; na 19.ª, reabrir e a
primeira resposta cita o fio escolhido.

### O que o estudo mostra e **não** é lacuna

- **A luta não é o que falta.** Temos 5 a 8 vezes mais luta por palavra narrada do que o programa
  (que é muito social). O beta quer ação; fica dito, não proposto.
- **A CD em voz alta.** O Matt não a diz (0%); nós dizemos, por lei (*o veredito antes do clique*) e
  por aprovação da MC. O que o Matt protege com o silêncio — que o número não conte o segredo — a MC
  §2.6 já protege. Se a pessoa quiser o mistério dele, a saída é o **degrau em palavra** («difícil»)
  no lugar do número; fica em «Para a pessoa decidir» só se ela perguntar.
- **«O que fazes?» e «como?»** — o Matt quase não diz nenhum dos dois. Não há o que copiar.
- **O golpe final perguntado** — já temos.
- **A fala em personagem** — a nossa medida (20% das palavras em fala) é exata; a dele (11%) é um
  proxy fraco. Sem conclusão.

---

## 4 · O que o estudo faz à Fase MC (MC1–MC3 no ar: `54331a8`, `0610845`)

**Confirma:**
- **O Mestre chama, o jogador não pede** — 94% dos dados do Matt são chamados por ele (MC2/MC3).
- **Sem pergunta de esclarecimento antes** — 2%: o chamado direto da MC3 é o compasso certo.
- **O sucesso dá sempre um facto** (MC4) — o Matt está em ~99%.
- **A oferta só onde há o que achar** (MC6) — a oferta igual e vazia é o oposto do que ele faz.

**Corrige — sobretudo os números:**
- **A régua de 04/11** («um dado a cada dois ou três turnos fora da luta») está **no mesmo sítio que
  o Matt por palavra narrada** (389 palavras dele por dado; um turno nosso tem 124 → um dado a cada
  ~3 turnos). Mantém-se — mas **conta-se só o dado que nasce da frase ou da cena**, não o automático
  da viagem nem a oferta repetida. Por declaração, o alvo é **~1 em 4**, e varia por intenção (L1).
- **Quando NÃO pedir**, com número: conversa e pergunta de facto ~90% sem dado; **saber comum ~78% sem
  dado** (L4, uma linha nova em `QUANDO_O_MESTRE_CHAMA`); convencer ~80% sem dado quando é conversa e
  não aposta.
- **A falha não morde sempre** (L6): meia-verdade para quem falha por pouco; o preço avisado para quem
  falha por muito.
- **A perícia por intenção** (`DESAFIOS`, §3.1): a busca divide-se Percepção/Investigação quase meio a
  meio; ler alguém é Intuição (78%); esgueirar é Furtividade (72%); rastrear é Sobrevivência (40%) ou
  Investigação (33%) — o que a MC1 pôs só em Sobrevivência.

**Acrescenta:** L3 (o tamanho da resposta), L5 (as pinceladas), L7 (a variedade da oferta), L8 (o mundo
que mexe), L9 (o gancho de saída) — e para o MC11, a semente e a catraca de L1 como a régua de
`medir-dados.mjs`.

---

## 5 · Onde olhar

- O analisador, as saídas e a semente (fora da árvore, de propósito):
  `C:\Users\clara\AppData\Local\Temp\claude\d5096f640d890ce8\953734d9-f48f-4ab6-9fdf-7529c9232286\scratchpad\crd3\analisador\`
  (`matt.cjs` → `matt.json`; `nos.mjs` → `nos.json`; `semente.cjs`) e
  `…\scratchpad\crd3\semente-das-intencoes.json`.
- O nosso corpus: `testes/registo-s8-s10-cronista.json`, `mente/sessao-14-dados/pedidos-ator-s14.json`,
  `mente/sessao-18.md` §2–§3.
- A fase que isto alimenta: `mente/plano-o-mestre-chama-o-dado.md` §2.3–§3.4 e §5; a secção «Fase EM» em
  `mente/pauta.md`.
