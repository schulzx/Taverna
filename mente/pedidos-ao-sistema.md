# Pedidos ao sistema

A mesa de design escreve aqui o que **precisa do motor** e não pode escrever
ela mesma — regra, número, porta em `turno.js`, função pura. A mente do
sistema lê daqui ao escolher o item do ciclo, e trata cada pedido como
qualquer outro item da sua fila: pelo peso.

**Este arquivo existe por um motivo de encanamento, não de organização.**
`git commit -- <caminhos>` protege as duas mentes de commitarem o trabalho
uma da outra — **exceto num arquivo que as duas editam por desenho**, que era
`mente/pauta.md`: o desenho escrevia pedidos lá dentro. Aconteceu três vezes
(`a6a6473`, `e430a12`, `63e0667`), a última com o commit de W1 levando dentro
o bloco de X4 sem o mencionar. Separar o arquivo custa menos que uma trava
nova, e resolve a causa em vez do sintoma.

**Quem escreve:** `regente` (e as mãos dele). **Quem lê e responde:**
`orquestrador`. **Quem atende:** `backend`. Ao atender, o sistema marca `[x]`
com a versão, e a linha fica — o histórico do que uma mente pediu à outra é
barato e vale.

Formato: `- [ ] **o que falta** · de: <etapa> · dd/mm` + duas ou três linhas
dizendo **para quê**, porque um pedido sem o porquê vira adivinhação.

---

## Abertos

- [ ] **a porta do tabuleiro em `turno.js`** · de: E2 · 15/09
  São 17 portas e **nenhuma é do campo**. Hoje *"vou até K14"* cai na porta
  `destino`, que não tem guarda de combate, vai ao resolvedor de cidades do
  mapa-múndi, gasta uma chamada ao Mestre e **ninguém anda**. Precisa de
  `casaDoEndereco`, `vereditoDoPasso` (com o `ateOnde` que não existe),
  `RECUSAS_DO_PASSO` com a catraca de 54 caracteres, e a porta
  `passo-no-campo`. **E há uma nota em `App.jsx:14568` que PROÍBE o Mestre de
  citar quadrados** — a condição não é string em falta, é instrução contrária.
- [ ] **`esperar`: passar a vez sem chamar o Mestre** · de: W1 · 16/09
  **O mais barato e o que mais paga.** São 1,4 rodadas por luta de pura
  caminhada, e hoje cada uma custa ~20 toques e uma chamada ao Narrador
  porque não existe botão de passar a vez.
- [ ] **`declararGolpe(alvo, motivo)`, `alvosDoVerbo`, `vereditoDoVerbo`** · de: W1 · 16/09
  O que o gesto de W1 precisa para perguntar ao motor antes de oferecer:
  quais alvos um verbo alcança, e o que ele custa. Hoje a tela adivinha.
- [~] **`LINHAS_DO_GOLPE` com a catraca de 54 caracteres** · de: W1 · 16/09 ·
  **RETIRADO DA FILA DO MOTOR EM W2 — a mesa de desenho assume e constrói.**
  As frases de X2 **já transbordam em produção** — 64 a 86 caracteres contra
  54, e é a frase que mais aparece no jogo.
  **Porque deixa de ser pedido:** o `desenho` mediu em W2 e a peça não é do
  motor — é `src/golpe.js`, **nascido em X2, desta mesa**, e o próprio
  `App.jsx:1106` escreve que *"`golpe.js` mede e devolve números; estas três
  funções os VESTEM"*. Vestir número é forma. A tabela, o aparo, a redacção
  das quatro frases e as cinco asserções estão **fechados e medidos** em
  `mente/w2-desenho.md` §3.3-3.5: nada falta decidir, só aplicar.
  **Porque não foi aplicado em W2:** os **dois** leitores de `recusaDoGolpe`
  vivem no `App.jsx` (`:11981` no chat, `:20910` na linha do veredito), a
  troca é **atómica** — meia troca é a mesma regra em dois caminhos, o bug que
  esta casa já pagou três vezes — e o **bastão do `App.jsx` esteve com a outra
  mente o ciclo inteiro**. **W3 constrói, numa passagem só.**
- [ ] **um teto de nome na fonte do inimigo** · de: W2 · 16/09
  `completarInimigo` (`bestiario.js:92`) aceita o nome que a IA mandar, **sem
  teto**; `garantirLuta` (`adversario.js:219`) já faz `limpar(o.nome, 40)`. O
  teto existe num sítio e falta no outro — e `regras-jogo.js:388`, ao descartar
  nomes repetidos, **força o Narrador a alongá-los** nas lutas com mais de um
  inimigo, que são as que a linha do veredito mais trabalha. Sem isto, a
  `curta` de `LINHAS_DO_GOLPE` é curta para as tabelas e larga para o jogo.
- [ ] **o ouvido do adversário** · de: W2 · 16/09
  `garantirLuta` (`adversario.js:211-260`) tem trinta e tal campos de mundo e
  **nenhum de herói**: as quebras de intenção lêem `minhaVida`, `rodada`,
  `protegidoQuebrou`, e **nenhuma lê o que o herói disse**. Um campo
  `foiAmeacado` daria ao `receoso` (`:628`) e ao `fugir_ferido` (`:515`) um
  segundo gatilho — e é o que separa a fala em combate de ser decoração.
  *É mecânica nova: pesado, e a decisão é da pessoa (w2-jogo.md §5).*
- [ ] **`TETO_DA_FALA_DO_JOGADOR = 240`, em `falas.js`** · de: W2 §8.2 · 16/09
  Ao lado de `TETO_DA_FALA` (320), porque é o mesmo assunto e a suíte que lê um
  passa a ler os dois. 240 não é número novo: é o `slice` que `falas.js:82` já
  aplica a *"o que o herói acabou de dizer"*. Medido: o envelope da fala no
  pior caso dá **227 + 240 = 467** caracteres, contra a maior nota que já viaja
  hoje (356, a aflição da arma) — **1,31×**, **+0,57%** do teto de prompt, uma
  vez por rodada. **A fala que estoura é RECUSADA, nunca truncada em silêncio**,
  e o teto **não** pode ir ao `maxLength` do `<input>` (`App.jsx:21553`): a
  caixa tem três empregos e cortaria também a frase que age.
- [ ] **a chave da fala em combate não pode ler o texto do jogador** · de: W2 §8.1 · 16/09
  `lerAcao` chaveia o desafio social por `lugar|alvo|<pessoa>|<tamanho>`
  (`desafios.js:916-918`), e o `tamanho` sai de `tamanhoDoPedido(texto)`
  (`social.js:135`): **seis chaves distintas para a mesma ameaça**, logo seis
  tentativas antes de o livro travar. E `pessoaNaFrente` (`App.jsx:15536`) lê o
  elenco de NPCs, **não os inimigos** — com um companheiro na cena, a ameaça
  gritada ao ogro é chaveada ao nome do companheiro. Em combate a chave devia
  ser `lugar|intimidacao|<nome do inimigo>` e mais nada. *(`lugar` **é** estável
  na luta: `App.jsx:7139` e `:5956` fecham as duas portas que o mudariam.)*
- [ ] **`vereditoDoGolpeAgora` precisa de saber o que está na caixa** · de: W2 §8.3 · 16/09
  Hoje `const vdGolpe = vereditoDoGolpeAgora();` (`App.jsx:20846`) lê só o
  tabuleiro. Com a frase a ter dois destinos (golpe ou fala), o jogador não tem
  como saber qual vai sair antes de carregar em `Agir →` — e *"o veredito antes
  do clique"* fica cumprido para o tabuleiro e por cumprir para a frase.
- [ ] **um contador de falas por luta — e ele tem de nascer ANTES de W2** · de: W2 §8.4 · 16/09
  W2 vale por destravar um comportamento, logo tem de ser medível depois: o
  número é **falas por luta**, sobre ≥ 20 lutas, e a banda é **0,5 a 1,2**
  (abaixo, o campo ficou vazio; acima, virou imposto de abertura). **Nenhum
  contador de hoje serve:** a mesa de `mestria.js` escreve `pilar: "combate"` em
  toda luta (`App.jsx:9379`, sobrescrevendo o `social`) e `anotarTurno` só corre
  quando uma resposta do Mestre volta (`:9376`) — a fala de W2 não gera chamada
  e nunca seria anotada. Um campo por luta em `combateRef` e um agregado curto
  no save bastam. **Se o contador nascer junto com W2, o depois é medido contra
  nada e a aposta fica sem forma de perder.**

- [ ] **uma catraca que prove que `metrosTxt` nunca passa de 4 caracteres** · de: W2 · desenho · 16/09
  O orçamento das quatro frases de `LINHAS_DO_GOLPE` assume que o número mais
  largo que `metrosTxt` (`grid.js:50`) escreve mede **4** (`10,5`) — e nada no
  motor o garante. Uma planta maior, ou uma distância que passe de 99 m, empurra
  a frase para 55 sem que nenhuma suíte se queixe, porque a catraca mede o teto
  da frase e não o teto do número. **Ou a catraca existe, ou a tabela tem de
  declarar 5 e perder um caractere de nome nas quatro.**
- [ ] **o teto de nome na fonte tem número: `limpar(nome, 24)`** · de: W2 · desenho · 16/09
  *Refinamento do pedido do `jogo` acima, não um segundo pedido.* Medido: a
  entrada mais apertada das quatro (`parede`) só apara nomes acima de **25**
  caracteres, e o máximo das tabelas é **18** — logo **a redacção do `desenho`
  aguenta sem este teto**, e até contra um nome de 200 caracteres, porque o aparo
  mora na tabela. **24 é o maior teto que nunca faz o aparo morder**, e é seis
  acima do máximo das tabelas: com ele, o aparo passa a ser cinto contra o
  inesperado em vez de comportamento normal. *Não bloqueia `LINHAS_DO_GOLPE`.*

## Atendidos

_(vazio)_
