# O classificador treinado — protótipo de medida (10/11/2026)

**A pergunta:** uma tabela de pesos treinada por semelhança acerta a intenção e a perícia de
frases que nunca vimos, melhor do que o catálogo de padrões escritos à mão (`lerAcao`), sem IA no
jogo, sem custo por turno e em menos de 5 ms?

**A resposta curta:** acerta um pouco melhor, e **erra menos no lado caro** (pede dado onde não
devia). Mas, com a tabela podada ao tamanho que cabe no jogo (293 KB), o ganho nas frases que
nenhum dos dois tinha visto é pequeno: **+1,9 pontos de intenção, −8 falsos «pede dado» em 317, +2,5
pontos de perícia**. Os erros que sobram são quase todos de **contexto** (quem é a pessoa, o que vai
entre aspas, se há luta), e n-gramas não os veem. **Recomendação: ainda não vira módulo de jogo;
vira já corpus e catraca** (§6).

Tudo o que se mediu está em `…/scratchpad/classificador/` (os scripts, o corpus, os rótulos, os
pesos). Nada tocou `src/`, `testes/` nem `App.jsx`.

---

## 1 · O corpus

| fonte | frases | rótulos | quem rotulou |
|---|---|---|---|
| **reais** — o que o jogador escreveu nas sessões de prova 1–18 | **439** (de 494 extraídas; 55 descartadas: cliques, texto do Mestre, resumos) | 19 usados | **à mão**, frase a frase |
| **suítes** — as frases que 37 suítes do catálogo guardam | 762 | 43 | o catálogo de hoje (as suítes estão verdes, logo acerta nas que elas afirmam) |
| **geradas** — moldes verbo × objeto × complemento | 5 400 (120 por rótulo) | 45 | o molde |

**De onde vieram as reais.** `mente/mm11-sessao*.md` (as linhas **J** e as `J *…*` dentro das
linhas M), `testes/registo-s4-escuta.json`, a `mensagens` do save da 14.ª, as «…» dos relatórios
13–18 que começam por verbo na primeira pessoa, e as frases da 18.ª reconstruídas pelo `jogo` em
`…/scratchpad/md/*.mjs` (o receptor dela foi bloqueado; as frases exatas não ficaram). Por sessão:
1:28 · 2:10 · 3:13 · 4:42 · 5:44 · 6:49 · 7:46 · 8:49 · 9:36 · 10:40 · 11:28 · 13:2 · 14:5 ·
15:2 · 16:1 · 17:5 · 18:39. **As sessões 12–17 quase não deixaram falas citadas**; a 18.ª é, na
maior parte, as variantes dos cinco momentos da planta MC.

**Por rótulo (reais):** conversa 187 · mover 88 · livre 76 · buscar 12 · atacar 10 · investigar
10 · arrebentar 9 · estancar 9 · fazer_falar 7 · imp_percepcao 5 · rastrear 5 · lembrar 5 ·
convencer 4 · mentira 4 · intimidar 3 · furtar_se 2 · escutar 1 · atuar 1 · imp_forca 1.
**78 frases reais pedem teste; 361 não.** Dos 40 rótulos de teste, **22 não têm uma única frase
real** (nadar, saltar, tranca, desarmar, cavalgar…): ali só o gerado e as suítes falam.

**O vocabulário de rótulos** é fechado: os 34 ids de `DESAFIOS`, as seis famílias do improviso
(`imp_forca` → Atletismo, `imp_percepcao` → Percepção, …), e os que não rolam perícia: `atacar`,
`naoSePede`, e o sem dado partido em `conversa` / `mover` / `livre`. A perícia sai do rótulo.

**A régua do rótulo à mão** (uma frase, um rótulo — o que o sistema teria de resolver):
se a frase declara um gesto com risco, o teste; senão um golpe, `atacar`; senão o que domina —
ir (`mover`), falar/perguntar (`conversa`), o resto (`livre`). **Corrigi o catálogo onde ele erra**
(a lista da planta MC, §1.2, e o que achei a mais): «procuro ‹pessoa› no ‹sítio›» é `mover`, não
busca; «subo a ladeira» não é escalar; «sigo o rasto da estrada» é ir; «chega de mentir: diga…» é
fazer falar, não mentir; «examino o corte / a moeda / o esqueleto» é Investigação; «observo o
rosto dele» é Intuição; «paro e olho quem está de guarda, se alguém me segue» é Percepção.
**A ressalva honesta:** um só rotulador, e eu via a resposta do catálogo ao lado (enviesa a favor
dele). Os rótulos estão em `gold-1..4.txt`, por índice de `reais-cru.json`.

**O gerador** (`gerar.mjs`) foi escrito **antes** de ler as falas das sessões 1–11; as da 18.ª eu já
tinha visto na planta MC. Tem ortografia pt-PT/pt-BR (rasto/rastro, «estou a» / «estou -ando»,
ênclise), prefixos («Eu», «Com cuidado,»), e erros de digitação em 12% das frases. Semente fixa.

## 2 · O método

- **Traços:** a frase normalizada (minúsculas, sem acento, pontuação fora, ênclise solta), as
  palavras, os pares de palavras e os n-gramas de caracteres 3–5 de cada palavra.
- **Modelo:** regressão logística multinomial (45 classes), AdaGrad, 12 épocas, L2 1e-5, ordem
  sorteada por `mulberry32(7)`; as classes pesam pela raiz do inverso da frequência; as frases reais
  pesam o dobro. **Determinístico:** duas corridas dão a mesma tabela, byte a byte.
- **A tabela:** para cada traço, os pesos por classe **menos a mediana da linha** (somar uma
  constante a todas as classes de um traço não muda o softmax — é exato), depois a poda
  (|w| < 1,6) e uma casa decimal. É um JSON `{ rotulos, vies, pesos: { traço: [[classe, peso]…] } }`
  e o leitor tem 15 linhas (`classificar` em `modelo.mjs`).
- **A rede:** abaixo da confiança τ = 0,5, quem decide é o catálogo. τ foi escolhido **só** com as
  sessões 1–10 (entre 0 e 0,9; «modelo primeiro» venceu «catálogo primeiro» em todas as medidas).
- **O catálogo** foi corrido como a mesa o usa: `ehDeclaracaoDeAtaque` e depois `lerAcao`, com um
  contexto vazio (sem `ehPessoaConhecida`, sem tentativas) — o que o **desfavorece** nos «procuro
  ‹pessoa›»; o jogo de verdade tem esse guarda. Corri também o **catálogo de antes da MC1**
  (`git archive 54331a8^ src`), que nunca viu a 18.ª.
- **Sem fuga entre treino e teste:** toda frase do treino cuja forma normalizada é igual a uma do
  teste sai do treino (as suítes das sessões 7–11 repetem falas reais). Paráfrases próximas ficam.

## 3 · A tabela de acerto

As colunas: **intenção** (o rótulo grosso: o id do teste, `atacar`, `naoSePede` ou «sem dado») ·
**pede dado?** (acertar se há teste) · **perícia certa quando há teste** · **falsos «pede dado»**
(o pior erro: rola onde não devia) · **testes perdidos**.

### 3.1 · O que conta mais: cada sessão fora, só as sessões 1–10 (357 frases que o gerador não viu)

| quem decide | intenção | pede dado? | perícia certa, quando há teste | falsos «pede dado» | testes perdidos |
|---|---|---|---|---|---|
| catálogo de hoje | 85,2% | 88,2% | 25,0% (de 40) | 18/317 | 24/40 |
| catálogo antes da MC1 | 85,4% | 88,5% | 25,0% | 17/317 | 24/40 |
| modelo (293 KB) | 83,5% | 87,7% | 20,0% | 21/317 | 23/40 |
| **modelo + rede (293 KB)** | **87,1%** | **90,2%** | **27,5%** | **10/317** | 25/40 |
| modelo + rede, **sem poda (6–8 MB)** | 89,1–89,9% | 91,0–92,2% | 35–40% | 6–8/317 | 22–24/40 |

### 3.2 · Cada sessão fora, todas as sessões (439 frases)

| quem decide | intenção | pede dado? | perícia certa, quando há teste | falsos «pede dado» | testes perdidos |
|---|---|---|---|---|---|
| catálogo de hoje | 86,1% | 88,8% | 56,4% (de 78) | 22/361 | 27/78 |
| catálogo antes da MC1 | 80,6% | 86,1% | 34,6% | 21/361 | 40/78 |
| modelo + rede (293 KB) | **87,9%** | **91,1%** | **59,0%** | **12/361** | 27/78 |
| modelo + rede, sem poda | 90,2% | 93,6% | 60,3% | 5/361 | 23/78 |

### 3.3 · O hold-out por sessão pedido: treino com as sessões 1–10, medido nas recentes

| medido em | quem decide | intenção | pede dado? | perícia certa | falsos «pede dado» | perdidos |
|---|---|---|---|---|---|---|
| 11–18 (82) | catálogo de hoje | 90,2% | 91,5% | 89,5% (38) | 4/44 | 3/38 |
| | catálogo antes da MC1 | 59,8% | 75,6% | 44,7% | 4/44 | 16/38 |
| | **modelo + rede** | **90,2%** | **92,7%** | **92,1%** | 4/44 | **2/38** |
| 17 e 18 (44) | catálogo de hoje | 95,5% | 95,5% | 97,0% (33) | 1/11 | 1/33 |
| | catálogo antes da MC1 | 38,6% | 65,9% | 45,5% | 1/11 | 14/33 |
| | **modelo + rede** | 93,2% | **95,5%** | **100%** | 2/11 | **0/33** |

**Este hold-out está contaminado dos dois lados, e por isso não é a régua principal.** A MC1
escreveu o catálogo de hoje *sobre* as frases da 18.ª, e o gerador foi escrito por quem as tinha
lido. A comparação limpa ali é com o **catálogo de antes da MC1**: o modelo, treinado sem ver a 18.ª,
passa de 38,6% para 93,2% de intenção e de 14 para 0 testes perdidos — mas parte disso é o meu
gerador a saber o que vinha. A régua honesta é a 3.1.

### 3.4 · Uma sonda de frases novas (18, escritas por mim agora; ilustração, não prova)

O catálogo acerta 8; o modelo sozinho 11; o modelo + rede 10. «Rebento as cordas com os pulsos»,
«Dou uma vista de olhos pela sala», «Procuro o ferreiro na praça» → certos só pelo modelo.
«Vou atrás das pegadas» (rastrear, confiança 0,44) e «Encosto a orelha à porta» (escutar, 0,41)
**o modelo acerta e a rede deita fora**, porque a frase nova é justamente a de confiança baixa.
«Será que o guarda está a mentir-me?» dá `mentir` (o verbo engana; o certo é Intuição), «Ato um
garrote» e «Faço pressão no golpe para parar a hemorragia» não chegam a Medicina.

## 4 · Os erros que sobram (modelo + rede, as 58 frases erradas em 439: sessões 1–10 com cada sessão fora, 11–18 no hold-out)

Por ordem de peso:

1. **«Procuro ‹pessoa›» lido como busca** (7 frases; o catálogo erra as mesmas). O jogo resolve
   isto com `ehPessoaConhecida` no contexto, que o protótipo não tinha. Não é coisa de n-gramas.
2. **O pedido social dentro da fala** — «Diz-me o que se passa no Fundo do Poço», «exijo a
   verdade», «Ou você me diz de quem é, ou eu conto à Vigia», a mão no cabo da arma (12 frases de
   `fazer_falar`/`intimidar`/`convencer` dadas como conversa ou nada). O sinal está **entre aspas
   e no tom**, não no verbo; com 14 frases reais destas, o modelo não aprendeu.
3. **Percepção sem verbo de procurar** — «paro e olho quem está de guarda e se me seguem»,
   «espreito pelo vidro os dois vultos», «observo o rosto dele» (8 frases). Nenhum dos dois vê.
4. **O golpe narrado** — «avanço sobre a coisa com o punho», «fico em guarda e deixo que venha»
   (5). A agressão do jogo lê isto com o estado da luta; aqui não havia.
5. **O falso «pede dado» que ficou** — «toco baixinho a canção» → atuar, «meu plano é ouvir tudo»
   → escutar, «vou entrar com ou sem a bênção dela» → furtividade, «Quem manda?» → Percepção.

## 5 · Tamanho, tempo e o estudo do Mestre

- **Tamanho:** sem poda, 6,2–8,2 MB (600–770 mil pesos). A poda é o preço: **293 KB** (11 007
  traços, 18 111 pesos) custa ~2–3 pontos de intenção e metade do ganho em falsos «pede dado» e em
  perícia. L1 no treino deu tabelas mais pequenas e piores (262 KB com perícia 25%); só n-gramas
  3–4 com contagem ≥ 3 dá 258 KB com o mesmo acerto que os 293 KB.
- **Tempo** (Node, média sobre 1 201 frases): **46 µs por frase** (pior 364 µs) contra 126 µs do
  catálogo. Treino do modelo inteiro: 7,4 s.
- **Lixo:** `null`, `{}`, `""`, `42` não estouram — e devolvem `livre` (o viés). No módulo, a frase
  vazia tem de devolver `null` antes da conta.
- **O estudo do Mestre** (`…/crd3/semente-das-intencoes.json`) chegou a tempo e foi usado: desloquei
  o viés das classes de teste para a distribuição de perícia que o Matt pede (prior shift, α 0,5 e 1).
  **Piorou o lado caro:** com α 0,5 a perícia sozinha sobe (20% → 27,5% nas sessões 1–10), mas os
  falsos «pede dado» passam de 10 para 14 com a rede e de 21 para 28 sem ela; com α 1, de 10 para 20.
  O que o estudo ensina não é uma distribuição para empurrar o modelo, é uma **taxa por categoria
  para conferir** — e o próprio estudo propõe isso (L1: a catraca de ±15 pontos). Fica de fora do
  modelo e entra na catraca (§6). E fica a lição que ele confirma nos meus números: o Matt divide a
  busca quase meio a meio entre Percepção e Investigação; o nosso corpus real tem 12 buscas para 10
  investigações, e o catálogo dá Percepção a quase todas.

## 6 · A recomendação

**Ainda não vira `src/escuta-treinada.js`. Vira já o corpus e a catraca.**

Porquê não o módulo agora:

1. **O ganho no que importa é pequeno ao tamanho que cabe:** nas frases que ninguém tinha visto,
   a tabela de 293 KB leva a intenção de 85,2% a 87,1% e corta os falsos «pede dado» de 18 para 10.
   É real, mas é metade do que a tabela grande dá, e a grande não cabe no bundle.
2. **A frase nova é a de confiança baixa**, e é exatamente ela que a rede devolve ao catálogo: o
   limiar que protege do dado errado mata o ganho de generalização que motivou isto
   («vou atrás das pegadas» acerta a 0,44 e sai).
3. **Os erros grandes são de contexto** (pessoa conhecida, fala entre aspas, estado da luta). O
   catálogo já tem portas para isso (`naoSeCom`, `ehPessoaConhecida`, a peneira); um classificador
   de texto não as tem e não as aprende com 439 frases.
4. **O corpus real é pequeno e torto:** 78 frases com teste, 22 rótulos de teste sem nenhuma frase
   real, um só rotulador, e o hold-out das sessões recentes contaminado pela MC1.

O que fazer em vez disso, por ordem (tudo `médio`, e tudo do sistema):

1. **O corpus vira catraca** — `testes/corpus-das-frases.json` (as 439, com sessão e rótulo) e uma
   suíte que mede o `lerAcao` contra ele: a taxa de acerto não pode descer, e a taxa de teste por
   categoria fica a ±15 pontos da do Matt (a proposta L1 do estudo). É a peça que vale com ou sem
   modelo, e a que impede o catálogo de aprender só os erros da última sessão.
2. **As frases que só o modelo acertou viram linhas do catálogo** — «rebento», «vista de olhos»,
   «encosto a orelha», «garrote/hemorragia», «mentir-me» → Intuição, «vou atrás das pegadas», o
   olhar de quem vigia (Percepção) e o olhar sobre a coisa na mão (Investigação). O modelo serve de
   **farejador de lacunas**: corre sobre cada sessão nova, e onde ele e o catálogo discordam com
   confiança alta, alguém olha.
3. **Voltar à pergunta com ~1 000 frases reais rotuladas por dois** (a 19.ª e a 20.ª, com o receptor
   a gravar as frases inteiras). Se então o modelo + rede de ≤ 300 KB ganhar ≥ 5 pontos de intenção e
   cortar ≥ 40% dos falsos «pede dado» nas sessões que não viu, vira fase: módulo puro que só fala
   quando o catálogo diz nada, a tabela como `TABELA_DA_ESCUTA` (JSON importado), e a suíte catraca
   do corpus a dizer o acerto mínimo.

**A proposta ambiciosa, para a pessoa decidir:** gravar **toda** frase do jogador do beta (sem
nome, sem save, só a frase e o que o sistema fez com ela) para um corpus que cresce sozinho. É o
único caminho para o modelo deixar de ser pequeno — e toca infra e dados de jogadores, logo é dela.

## 7 · Onde olhar

`…/scratchpad/classificador/`: `extrair.mjs` (as frases reais) · `gold-1..4.txt` (os rótulos à
mão) · `gerar.mjs` (os moldes) · `suites.mjs` · `rotulos.mjs` (o vocabulário e o catálogo como
baseline) · `modelo.mjs` (treino, tabela, leitor) · `comum.mjs` + `avaliar2.mjs` (a prova; saída em
`resultado-final.md`) · `varrer.mjs` + `varrer-1.txt`, `varrer-2.txt` (tamanho × acerto × estudo do
Mestre) · `sonda.mjs` · `pesos.json` (a tabela de 293 KB).
