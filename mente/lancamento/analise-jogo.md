# A análise do jogo — gameplay, ritmo, enredo e o Mestre (15/11/2026, para o plano de lançamento)

> **Quem escreve:** o `conselheiro`, ponta 1 de 2 (a ponta visual/UX é de outro agente).
> **O método (a correção da pessoa: «não faça a análise por memória, mas pelo produto que temos
> hoje»):** a prova é **(1) o jogo vivo jogado hoje** — 41 respostas do Narrador, US$ 0,355, 26,5 min,
> transcrição em `mente/lancamento/sessao-de-hoje.md` (citada aqui como **[H Tn]**) — e **(2) o código
> de HEAD `13364fc` (v9.647) lido e medido hoje**. Diários, pautas e sessões antigas só serviram para
> saber onde olhar. O que vem só deles está marcado **«não verificado hoje»**.
> **A amostra é uma campanha.** Uma sessão de 41 respostas é um retrato, não uma estatística: onde um
> número só aparece uma vez, digo-o.

---

## 0. O resumo, numa tela

**O que é verdade hoje, jogado:** o Taverna já tem o que nenhum concorrente de «IA mestre» tem — um
motor que decide e uma IA que só narra — e isso **sente-se**: o preço do antídoto sai da tabela e a bolsa
recusa (*«◉ Não chega: Antídoto custa ◉ 48, e a bolsa tem ◉ 25»* [H T8]); o primeiro dado chega na
primeira frase (*«Saberes. Precisa de 13.»* [H T1]); a encruzilhada da quest mostra o que se ganha e o
que custa antes do clique [H T14]; a luta prevê o golpe e anuncia a intenção do inimigo [H T18]; o
descanso diz o preço em rações [H T25].

**O que parte hoje, jogado, e um estranho vê na primeira meia hora:**

1. **A prosa e o estado separam-se nos objetos.** «Apanho o anel» não apanha; o Narrador diz que
   apanhou, e no turno seguinte que o vendeu; a bolsa fica igual [H T7, T9]. É o pior tipo de defeito
   para um jogo cuja promessa é «o Mestre é código»: o jogador sente-se roubado e não sabe porquê.
2. **A quest de monstro fecha sem monstro.** «O Que Desce ao Anoitecer» — uma besta que massacrou a
   criação — cumpre-se em 10 min e 13 ações sem a besta aparecer; ela *«aceita a corda, manseta feito
   cão velho»* [H T14]. A etapa 2 «Seguir o rasto até onde a besta dorme» fecha ao chegar à praça da
   alfândega [H T5].
3. **O elenco cola-se ao herói.** Cedric e Runa (moradores de Monte Profundo) estão na praça, no
   Arquivo, na alfândega e **na paliçada a 19 km**; Isen e Ceridwen sentam-se à fogueira do grupo
   [H T5, T16, T25]. O «Em cena» da tela e o EM CENA da pauta dão duas listas diferentes [H T15].
4. **O Narrador ainda inventa gente e mortos.** Myrna, *«a menina arrancada da forja»*, não existe no
   sistema [H T1–T2]; *«o ouro do morto»* [H T6]; *«o frasco de óleo que você comprou mais cedo»* [H T9].
   E a pauta ainda **manda** inventar: *«um objeto que está onde não devia, e que fala sozinho»*
   (`src/estante.js:140`) [H T17].
5. **Três caras para «rolar um dado».** A bandeja do chamado, a carta social com *«Não era isso»* e
   *«Refazer · 1 ponto»* [H T13], e o enigma *«Teste de agulha · dif. 17»* [H T23]; a busca da masmorra
   rola sem bandeja nenhuma [H T19].
6. **Um modal invisível prendeu o «Partir»** três vezes, sem mensagem [H T30].
7. **O veredito do perigo mente para cima.** «DIFÍCIL… é onde se morre (4.5× menos)» e a luta acabou
   em 2 rodadas sem um ponto de dano; a pauta do mesmo lugar dizia «perigo médio» [H T16, T18].
8. **«Ataco o guarda»** num sítio guardado não abre luta nem diz porquê [H T29].

**A tese do relatório:** o motor está à frente do jogo. O que falta ao lançamento não é mais sistema; é
**fechar as costuras onde o sistema e a prosa se desencontram** (objetos, gente em cena, perigo,
formas do dado) e **dar à quest o clímax que a ficha promete**. Cinco apostas no §10.

---

## 1. O que temos de bom — e o que só parece

### 1.1 Forte de verdade (com prova de hoje)

| diferencial | a prova | contra quem |
|---|---|---|
| **A IA não escreve estado.** O preço, a bolsa, o XP, o achado e o dano saem do motor; o Narrador recebe envelopes «JÁ APLICADO PELO SISTEMA». | Compra recusada e depois feita pela tabela (*«Antídoto — ◉ 48 (restam ◉ 150)»* [H T31]); o anel narrado não entrou na bolsa (o lado bom do defeito 1: **o estado não foi corrompido**) [H T9]; `custo.porTarefa` só tem `narrador` (Cronista e Léxico fora) — save lido hoje. | AI Dungeon e NovelAI não têm estado de regra; o texto é o jogo. É o nosso fosso. |
| **O dado nasce da frase, com o preço dito antes.** | 8 d20 à vista em 26 frases, 6 perícias; *«Sobrevivência. Precisa de 15. Se falhar, a trilha se perde e meia hora com ela.»* [H T4]; o primeiro dado é a primeira frase [H T1]. | Um VTT não tem quem leia a frase; um AI-GM genérico rola quando a IA lembra. |
| **A escolha com o preço na carta.** | Três cartas GANHAS/CUSTA e «Fá-lo à tua maneira» [H T14]; o motor tem 52 quests com `escolhas`/`solucoes`/`falha`/`abandono` (`src/biblioteca-de-quests.js:2206`, medido hoje em Node). | É a coisa mais «mesa de jogo» do produto e quase ninguém a tem. |
| **A luta tática legível.** | Intenção do inimigo à vista (*«3–12 → Saoirse»*), um toque anda e ataca (*«16 +7 = 23 contra 13 · acerta»*), reação com custo (*«esquiva ágil · 0 PM — anula»*), «poupado / matar» [H T18]. | Mais perto de BG3 do que de qualquer IA-GM; mais leve que um VTT. |
| **O sucesso dá um facto do sistema.** | *«[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA] … d20 19 … O sucesso deu isto, e é verdade do mundo: …»* (pedido do T4); o quadro de pistas com 4 caminhos e o preço da falha [H T11]. | O «sucesso vazio» que o Matt quase nunca faz — aqui, quando o sucesso tem fonte, é verdade. |
| **Recompensa por gesto, sem combate.** | *«+60 XP · o que o caminho escondia veio à luz»*, *«+17 XP · o que tentaste, conseguiste»* [H T3, T4]; nível 2 em ~12 ações. | Progressão fora da luta é rara em RPG de IA. |
| **A fogueira.** | *«Com quem você se senta esta noite?»* e Nolan confessa: *«Fui eu… dei a ordem pra trancar a cancela»* [H T25]. | Momento de personagem pelo sistema (o núcleo dramático), não pela sorte da IA. |
| **Determinismo real.** | `grep Math.random src/**/*.js` → 22 ocorrências, **todas em comentários**; 0 no `App.jsx` (medido hoje); `testes/check-sem-random.mjs` existe. A auditoria de 27/10 contava 133. | É a base de replay, partilha e sala — tecnologia que ninguém copia num mês (§9). |
| **Replay em Node.** | `src/sessao.js` (1309 linhas): `reproduzirASessao`, `correrOTurno`, formato `taverna-sessao` v1; `testes/replay.mjs` + 7 sessões gravadas. | Ninguém do género pode provar que a sessão de ontem se reproduz. |
| **Custo.** | US$ 0,355 em 41 respostas = **US$ 0,0087 por resposta**, mediana 5,1 s (hoje). | Barato o bastante para free-to-play com teto. |

### 1.2 O que só parece

- **«O Narrador nunca inventa.»** Inventa gente (Myrna), mortos e objetos na prosa [H T1, T6, T9, T17]. O
  estado está limpo; a **história** não. Para o jogador a história é o estado.
- **«A quest manda.»** Manda na ordem das etapas, não no que acontece nelas: o rasto «até onde a besta
  dorme» fecha numa praça; a besta nunca entra em cena; a pessoa da carta (Nesa) não está no EM CENA do
  sítio onde vive [H T5, T10, T14].
- **«Uma régua só para o perigo.»** O cartão diz «DIFÍCIL… é onde se morre», a pauta diz «perigo médio
  — Zumbi (nv 2), Bandido (nv 2)», e o resultado foi 0 de dano [H T16, T18].
- **«Uma ação, uma forma.»** Três formas de dado numa sessão (§5).
- **«O sistema não fala de si.»** *«+8 cidade tem de tudo»*, *«207 de poder (você 145 + 1 no grupo)
  contra 937»*, *«(um favor que lhe custa pouco, desconhecido (+2))»*, *«faltam 1 avanco»* [H T6, T16,
  T13, T27].
- **Variedade de acervo.** 52 quests e 20 planos de vilão (medido hoje), mas **3 tipos de fraqueza**
  (`FRAQUEZAS`, `src/plano-do-vilao.js:648`) — e a mesma frase da fraqueza voltou **três vezes** em 26
  frases [H T1, T25, T26], a primeira ao minuto 2.

---

## 2. Os primeiros 15 minutos

### 2.1 O caminho, medido

| marco | quando | cliques |
|---|---|---|
| menu → jogo | 95 s (eu, sem ler; um humano lê 3–6 min — **estimativa, não medida**) | **17** + 2 textos obrigatórios (nome da campanha, «conceito») |
| 1.ª resposta | 5,1 s | — |
| **1.º dado** | 1.ª frase, ~2 min | 1 |
| 1.º facto que mexe no mundo | T3 (pegadas), ~4 min | — |
| **1.ª escolha com peso** | **9 min 47 s** | 13 ações |
| 1.ª recompensa grande | 10 min (+125 XP, nível 2) | — |
| **1.ª luta** | 13 min 50 s — **só porque fui procurá-la** | — |

### 2.2 Onde um estranho desiste (por ordem de risco)

1. **O formulário do mundo** [H, criação]: 7 géneros, 4 moldes, 4 arcos, 8 vozes, 2 apresentações, um
   campo de nome obrigatório antes de qualquer imagem do jogo; depois 5 seletores de 10–12 opções e 6
   pontos. Há «Sortear um nome», **não há «sortear tudo / começar já»**. É uma tela de configuração, não
   um convite. E fala de si: *«O momento em que você está NUNCA aparece na tela»* (texto do arco).
2. **O campo vazio.** A primeira tela de jogo não oferece nenhuma ação: só *«O que você faz? Fale, aja,
   explore…»* [H T0]. O jogador de AI Dungeon sabe escrever; o de BG3 não. As propostas («Ir até…»)
   só aparecem depois de escrever.
3. **A troca de nomes** no primeiro parágrafo: o companheiro é Nolan, a vítima é Nolan [H T0]. O
   Narrador confunde-os logo a seguir.
4. **O descanso escondido no relógio** e a frase «montamos acampamento» ignorada [H T25].
5. **O «Partir» morto** por um modal que não se vê [H T30] — aqui um estranho fecha o separador.

### 2.3 O «uau»

O primeiro «uau» da sessão foi **a encruzilhada** (min 9:47) e o segundo **a luta** (min 13:50). Os dois
estão **depois** do ponto onde um estranho já decidiu. Não há «uau» nos primeiros 3 minutos: a abertura
é bonita, mas é prosa; o primeiro dado é um Saberes que devolve, ao minuto 2, a fraqueza do vilão final
(*«o que o pode derrubar: …»* [H T1]) — gasta-se o maior segredo da campanha no primeiro clique.

**O que fazer:** §8 P0-6 (a abertura com um gesto e um risco nos primeiros 3 min) e P1-1 (criação em um
toque).

---

## 3. O laço de jogo e a retenção

### 3.1 O laço de uma hora, jogado

`frase → (chamado → d20) → facto do sistema → XP do gesto → proposta de ir → etapa ✓ → encruzilhada →
cerimónia → nova quest`. Funciona e é rápido: 4 etapas em 13 ações [H T1–T14]. **O defeito é o
contrário do esperado: anda depressa demais e sem clímax.** A quest não tem pico (nenhuma luta, nenhum
risco de vida, nenhuma falha que custasse), e a recompensa chega igual.

### 3.2 Sessão 1, 5, 20 (acervo medido hoje em Node)

| peça | número | onde |
|---|---|---|
| quests | **52** (tipo 1: 36 · tipo 2 «do coração»: 16) | `BIBLIOTECA_DE_QUESTS`, `src/biblioteca-de-quests.js:2206` + `src/acervo/quests-lote-{4,5,6}.js` |
| etapas por quest | **4,12** em média (4–5) | idem |
| quests com «derrotou» em algum caminho | 37 de 52 | idem |
| arquétipos de vilão com plano | **20** | `PLANOS_DO_ARQUETIPO`, `src/plano-do-vilao.js:137` |
| tipos de fraqueza | **3** | `FRAQUEZAS`, `:648` |
| desfechos do vilão | 4 | `DESFECHOS_DO_VILAO`, `:910` |
| espinhas (arcos) | 4 na tela (Jornada, Arquipélago, Ascensão, Mistério) | criação [H] |
| criaturas de fantasia no bestiário | 18 + 9 arquétipos | `src/bestiario.js` |

- **Sessão 1:** coberta (uma quest em ~10 min; uma masmorra de 6 salas). **Sessão 5:** a quest média
  dura ~10–20 min; uma sessão de 1 h queima 3–5 quests; 52 quests ≈ 10–15 h de quests distintas por
  campanha. A partilha entre duas campanhas era 0,84 quests (diário 09/11 — **não verificado hoje**).
  **Sessão 20:** o que se repete primeiro não são as quests, são **as frases de sistema** (a fraqueza
  3× numa sessão; «moedas numa vala» 3× em 3 viagens [H T16, T27, T30]) e **os tiques do Narrador**
  (8 de 41 respostas acabam em «ou X ou Y?»; Nolan jura por um santo novo a cada fala).
- **O fim existe só como instrução à IA.** `src/historia.js:57` diz ao Narrador «Clímax e desfecho…
  Depois do fim, um epílogo» — não achei **tela, estado ou cerimónia de fim de campanha** no `App.jsx`
  (grep por «fim da campanha», «epílogo», «campanhaAcabou»: nada na tela). **Não joguei até ao fim.**
- **Porque volto amanhã?** Hoje: o XP e o próximo passo. **Falta o gancho de saída** (EM8, aberto na
  pauta): não achei momento de fecho de sessão nem «da última vez» na reabertura. **Não verifiquei a
  reabertura hoje.**

### 3.3 Morte e derrota

Não cheguei a 0 PV. Pelo código: a derrota vira cativeiro (`src/cativeiro.js`, `SAIDAS_DO_CATIVEIRO`;
campo `cativeiro` no save); a queda tem salvaguarda (vi: *«3 de dano — 4 m de queda»* [H T21]). Não achei
morte permanente nem tela de morte. **Não verificado hoje ao vivo.** Risco: com a luta tão fácil
quanto a de hoje, a derrota pode nunca acontecer na primeira hora — e um RPG sem medo não prende.

---

## 4. Enredo e história

### 4.1 O que é bom

- **A estrutura é autoral e coerente:** um vilão com nome desde o turno 1 (Fendrel, na pauta), a quest
  de abertura amarrada a ele (Nesa: *«O sujeito da coleira atende por Fendrel»* [H T13]), uma segunda
  quest que nasce da primeira, uma terceira na masmorra (*«O Celeiro de Inverno»*).
- **A voz do Narrador é boa** quando narra o que o sistema decidiu: a luta [H T18], a queda [H T21], a
  compra [H T31]. Mediana 94 palavras (bom tamanho).
- **O companheiro com segredo** à fogueira [H T25].

### 4.2 O que é fraco, hoje

| defeito | prova de hoje | a causa (lida no código) |
|---|---|---|
| **Gente inventada com peso** (vítimas, parentes) | Myrna «prima do moleiro», «a menina arrancada da forja» [H T1–T2] | o veto do inventado só olha objetos (`src/motor/memoria-do-inventado.js`); gente nomeada pela IA não tem veto. |
| **A pauta pede a invenção** | *«um objeto… que fala sozinho»* → o sino [H T17] | `src/estante.js:140` (`forma`), montado em `src/biblioteca.js:552`. É a classe do defeito grave da 20.ª, noutra linha. |
| **O facto genérico vira acusação** | *«o chão daqui é o de quem o pisa todos os dias: Nolan Olho-de-Corvo»* → *«os passos… pertencem a Nolan Olho-de-Corvo»* [H T4] | o sucesso de rasto devolve «quem vive aqui», não o rasto da quest; o Narrador liga os pontos errados. |
| **O clímax evaporado** | a besta nunca aparece; *«aceita a corda»* [H T14] | a etapa «Pôr {fera} ao alcance da tua mão» fecha com informação, não com encontro (lida em Node hoje). |
| **A pessoa da carta fora de cena** | Nesa: EM CENA = Cedric · Runa no Arquivo dela [H T10] | o EM CENA do passo (`EM_CENA_DO_PASSO`, v9.645) não cobre a pessoa das cartas do quadro. **Hipótese, não provada.** |
| **O elenco cola-se** | Cedric/Runa a 19 km; Isen/Ceridwen à fogueira [H T16, T25] | **não achei a causa hoje**; é o defeito 9 da 21.ª, de pé. |
| **Duas listas de «em cena»** | tela: Perrine e Isen; pauta: Cedric e Runa [H T15] | o chip da tela e a pauta leem fontes diferentes. **Não localizei as duas funções.** |
| **O segredo gasto cedo** | a fraqueza do vilão no 1.º Saberes, e de novo no T25 e T26 | o fio da fraqueza é o facto mais à mão para «o que sei de…»; `FRAQUEZAS` tem 3 tipos. |
| **Distâncias que mudam** | Acampamento de Espinhos: 28 km / 1 dia na ida, 11,6 km / 0,5 dia na volta [H T27, T30] | **não localizado**. |
| **Género e dialeto** | *«Ceridwen o Manco, encostada»*; *«Perrine… tá metido… por ele»*; chamados em PT-PT (*«ficas a saber»*, *«bónus»*) e narração em PT-BR (*«você»*, *«tá»*) | o léxico de nomes e as tabelas do sistema estão em PT-PT, o Narrador em PT-BR. Para o público-alvo (Brasil) **é um defeito de produto**. |

### 4.3 A régua Matt Mercer, hoje

Perguntei o que um jogador do Matt pergunta: *«o que sei de…»* → dado e facto (verdade) [H T1, T26];
*«quem está aqui?»* → respondeu com a cena de outra pessoa, e a tela e a pauta discordam [H T15];
*«onde encontro a Nesa?»* → verdade, do sistema [H T11]; *«quanto deves?»* → oráculo, sem resposta
útil [H T6]. **Metade verdade, metade plausível** — o mesmo veredito das sessões 19–21, agora visto por
mim.

---

## 5. O dado e o risco — a régua de 04/11

**Régua:** um dado a cada 2–3 turnos fora da luta, com sentido.

| medida (hoje) | valor | régua |
|---|---|---|
| d20 à vista fora da luta | **8 em 26 frases = 1 a cada 3,25** (contando os 28 toques, 1 a cada 6,8 ações) | 2–3 → **perto, não cumprida** |
| nascidos da frase | 6 de 8 (2 ofertas do sistema: Percepção ×2) | — |
| perícias | 6 (Saberes, Percepção, Sobrevivência, Persuasão, Atletismo, agulha) | ≥ 5 ✓ |
| sucessos com facto | 5 de 5 | ✓ |
| falhas com consequência | 3 de 3 (lugar remexido, queda −3 PV, meia informação) | ✓ |
| dados escondidos | busca da masmorra (*«Percepção 15 vs 15»* só no pedido) [H T19] | ✗ |
| frases que pediam dado e não tiveram | *«Falo com a Nesa… O que sabe…»* (Intuição/Persuasão) [H T12]; *«Bato o ombro com força no mourão»* (Atletismo) [H T17]; *«Ataco o guarda»* (luta) [H T29] | — |
| **formas do dado** | **3**: bandeja do chamado; carta social com «Não era isso» + «Refazer · 1 ponto»; enigma «Teste de agulha · dif. 17» | **1** |

**Veredito:** o **sentido** está cumprido (cada dado tem preço dito e consequência), o **ritmo** não
(3,25, e cai a 6,8 se se contam os toques), e a **forma** está partida em três. O «Refazer · 1 ponto»
existe só na carta social — o jogador que o descobre ali não o tem na bandeja. **Isto é o P0-4.**

---

## 6. Combate

**Jogado hoje (uma luta, 2 rodadas):**

- **Clareza: alta.** Intenções à vista, previsão (*«3–12»*), d20 sobre o alvo, a reação com custo, a
  ordem de iniciativa no topo, «sair: 2 golpes livres» (o preço da fuga dito). [H T18]
- **Fluidez: alta.** Um toque no inimigo = andar + atacar. A narração da luta chega em 5–6 s e é boa.
- **Duração: curta demais para o risco anunciado.** 2 rodadas, 0 de dano sofrido, contra um lugar
  marcado «DIFÍCIL… é onde se morre (4.5×)». A pauta do mesmo lugar: *«perigo médio — Zumbi (nv 2),
  Bandido (nv 2)»*. **O veredito da porta mede a masmorra inteira (o chefe incluído) e o jogador lê-o
  como a primeira sala.** É a lei do veredito cumprida na letra e falhada no sentido.
- **Defeitos visíveis:** o círculo laranja e branco do tamanho da grelha tapou o inimigo na 2.ª rodada
  (defeito 15 da 20.ª, de pé); o Narrador narrou um golpe da adaga antes de a luta existir
  [H T18]; a «emboscada» achada na busca nunca virou luta [H T19]; «Ataco o guarda» fora da masmorra
  não abre luta nem diz porquê [H T29].
- **Profundidade (código, não jogado hoje):** altura ±2, seis superfícies e reações elementares,
  objetos do cenário, Empurrar/Derrubar/Saltar, 113 suítes de combate (diário — **não verificado
  hoje**). Na luta de hoje **nada disso teve ocasião** de aparecer: a profundidade existe e a primeira
  luta não a pede.
- **O +2 de defesa** que 34 fichas prometem continua sem leitor (pauta, 16/09; `src/combate.js` —
  **não verifiquei a linha hoje**).

---

## 7. Multijogador — a sala a dois

- **Está no menu do beta**, incondicional: «Jogar em dois · Criar uma sala / Entrar com código»
  (`src/App.jsx:5112–5116`, visto na primeira tela hoje), enquanto Uma Noite e Duelo estão atrás de
  `modoNaPorta` (`:5093`, `:5102`).
- **A arquitetura:** `api/sala.js` (151 linhas) guarda numa LISTA de recados e num `mundo` — **o save
  inteiro, sobrescrito a cada turno** — no Redis do Upstash, vida de 24 h; o anfitrião é a autoridade, e
  a rota *«Não valida regra de jogo»* (cabeçalho). O save de hoje tem **95 KB** depois de 26 min.
- **Não testei hoje** (precisaria de dois aparelhos e de gastar Redis). A auditoria de 27/10 dizia «nunca
  foi provada numa sessão» e `teste-sala` intermitente — **não verificado hoje**.
- **Veredito: não é lançável como promessa.** Ou se prova numa sessão a dois antes do beta, ou se
  **esconde atrás de `modoNaPorta`** como os outros dois modos (a ordem de 28/09: «um modo só»).
  Tirá-la da porta é uma linha e é reversível. **P0-7.**

---

## 8. Defeitos e dívidas que bloqueiam o lançamento

Cada item: **o problema · a prova · o que fazer e como · tamanho · quem · como se mede.**
Tamanhos: S (≤ 1 ciclo), M (2–4), G (fase).

### P0 — não lança sem

**P0-1 · O objeto que a prosa dá e o sistema não dá.**
- *Prova:* «Apanho o Anel de Ouro da tábua» → narrado como apanhado, fica `[NO CHÃO]`; «vendo-o» →
  narrado com moedas, bolsa igual [H T7, T9].
- *O que fazer:* (a) o verbo de apanhar na frase («apanho, pego, guardo, recolho» + nome de coisa que
  está no `[NO CHÃO]`) vira o mesmo recolhimento do botão «Examinar/Recolher» (`src/chao.js:183` já tem
  o envelope «RECOLHIMENTO — JÁ APLICADO»); (b) a venda pela frase de um item que **não está na bolsa**
  é recusada antes do Narrador, como a compra sem dinheiro já é (*«◉ Não chega…»*); (c) um veto em
  `naoPode`: «nada passa à mão do herói nesta resposta» sempre que há coisa no chão e o turno não a
  recolheu.
- *Tamanho/quem:* M · `backend` (leitura da frase em `a-proposta-da-frase.js`, veto) → `oficial` (fiação).
- *Medida:* corpus de 30 frases de apanhar/vender/dar; 100% resolvidas pelo sistema; na sessão de
  prova, 0 diferenças entre a prosa e a bolsa em objetos.

**P0-2 · A pauta que ainda pede invenção, e a gente inventada.**
- *Prova:* `src/estante.js:140` (*«um objeto que está onde não devia, e que fala sozinho»*) → o sino
  [H T17]; Myrna e «o morto» [H T1, T6].
- *O que fazer:* catraca `teste-pauta-nao-pede-coisa` (já existe, da 20.ª) **alargada a `estante.js`**:
  toda `forma` que pede coisa tem de trazer a coisa do sistema (um item do chão, um facto do livro) ou
  não sai. Para gente: o veto NE8 (`memoria-do-inventado.js`) ganha a família «pessoa nomeada pela IA
  com papel de vítima/parente/testemunha» — vai a `naoPode` por 6 turnos, como os objetos.
- *Tamanho/quem:* M · `backend` + `testes`.
- *Medida:* 0 linhas de pauta pedem coisa sem a dizer (varredor); na prova, pessoas nomeadas que não
  existem no registo ≤ 1 por 40 respostas.

**P0-3 · O clímax da quest.**
- *Prova:* «O Que Desce ao Anoitecer» acaba sem a besta [H T14]; «Seguir o rasto até onde a besta
  dorme» fecha numa praça [H T5].
- *O que fazer:* uma regra no motor das quests: **a etapa cujo objeto é uma criatura/pessoa hostil
  (`{fera}`, `{alvo}`) só fecha com ela em cena** — encontro (luta, negociação, captura com dado) pelo
  `o-encontro.js` que já existe (CB2). A etapa de rasto fecha no **covil** (o `lugar` do papel), não
  no sítio onde a pista apontou. Auditar as 37 quests com «derrotou» e as que têm `{fera}`.
- *Tamanho/quem:* M–G · `backend` (biblioteca + quests-do-turno) → `oficial`.
- *Medida:* em 1000 mundos, 100% das quests de criatura têm um encontro antes da encruzilhada; na prova,
  a quest de abertura tem ≥ 1 dado com risco de vida.

**P0-4 · Uma forma só para o dado.**
- *Prova:* três formas [H T1, T13, T23]; busca da masmorra sem bandeja [H T19].
- *O que fazer:* a carta social (`SOCIAL — RESOLVIDO PELO SISTEMA`) e o enigma da masmorra passam pelo
  **chamado** (`src/motor/o-mestre-chama.js`, `oChamado`): mesma bandeja, mesma fala (*«Persuasão.
  Precisa de 16. Se falhar, …»*), o «Refazer» do heroísmo também na bandeja (hoje só existe na social);
  «Procurar nesta sala» também. Sem o modificador escrito (*«(um favor que lhe custa pouco,
  desconhecido (+2))»*).
- *Tamanho/quem:* M · `backend` (o chamado aceita as três origens) → `desenho` (o Refazer na bandeja,
  Figma) → `oficial`.
- *Medida:* varredor de forma: um só componente renderiza d20 fora da luta; na prova, 100% dos d20 fora
  da luta na bandeja.

**P0-5 · O elenco no sítio, e uma lista só de «em cena».**
- *Prova:* Cedric/Runa a 19 km, Isen/Ceridwen à fogueira; tela ≠ pauta [H T15, T16, T25]; Nesa ausente
  do EM CENA do Arquivo dela [H T10].
- *O que fazer:* (1) achar a causa: quem põe moradores da cidade no EM CENA fora da cidade (o defeito
  vem da 18.ª e da 21.ª — **causa não achada hoje**); (2) **uma função pura** `quemEstaAqui(estado)`
  que alimenta o chip da tela **e** a pauta **e** a fogueira; (3) a pessoa de uma carta do quadro entra
  em cena no sítio dela, como a pessoa do passo.
- *Tamanho/quem:* M · `backend` (função e causa) → `oficial` (dois leitores no App).
- *Medida:* catraca: em 500 cenas simuladas, 0 moradores de A em cena em B; chip = pauta em 100%; à
  fogueira só o grupo.

**P0-6 · Os primeiros três minutos.**
- *Prova:* campo vazio sem ação [H T0]; o 1.º dado gasta a fraqueza do vilão [H T1]; «Conquista
  desbloqueada» no turno 0; +60 XP pela cidade onde se nasce [H T1].
- *O que fazer:* (a) a abertura termina com **três propostas tocáveis** do sistema (o passo da quest,
  uma pessoa em cena, um risco à vista) — as peças existem (chips de proposta); (b) o facto da fraqueza
  **não pode** ser a resposta de um Saberes antes do ato 2 (`SABER_COMUM`/`saberDoHeroi` excluem o fio
  da fraqueza até `camadaDoVilao ≥ 2`); (c) `feito-do-sistema.js:89` não paga a cidade inicial (a memória
  nasce com ela); (d) nenhuma conquista no turno 0.
- *Tamanho/quem:* S+S+S+S · `backend` → `oficial` (o chip da abertura).
- *Medida:* da abertura ao 1.º toque ≤ 10 s sem escrever; a fraqueza nunca sai antes do ato 2 em 1000
  mundos; 0 XP no turno 1 sem gesto.

**P0-7 · O que está na porta e não está pronto.**
- *Prova:* «Jogar em dois» incondicional no menu (`App.jsx:5112`); nunca provado a dois (§7).
- *O que fazer:* pôr a sala atrás de `modoNaPorta("sala")` (desligada no beta), como `rapida` e `duelo`.
  Voltar é uma linha.
- *Tamanho/quem:* S · `oficial`. *Medida:* o menu do beta tem uma porta de jogo.

**P0-8 · O modal invisível que prende a tela.**
- *Prova:* «Partir» morto três vezes, sem erro na consola; por baixo, a cerimónia da quest (que voltou
  três vezes) e a subida de nível por fechar [H T30]; o botão «Confirmar» dos pontos de atributo a
  y=640 numa janela de 768 (medido).
- *O que fazer:* a fila de cerimónias (TE9) **nunca** fica atrás da página: se existe, cobre e prende o
  foco; se não cobre, não bloqueia cliques. E a cerimónia da quest mostra-se uma vez.
- *Tamanho/quem:* S–M · `oficial` (+ `aprendiz` para a peça).
- *Medida:* teste de fiação: com cerimónia pendente, todo botão da página ou funciona ou está
  `aria-disabled` com o porquê; a cerimónia da quest aparece 1 vez por quest.

**P0-9 · O sistema a falar de si na tela.**
- *Prova:* *«+8 cidade tem de tudo»* [H T6]; *«207 de poder (você 145 + 1 no grupo) contra 937 — 4.5×»*
  [H T16]; *«(um favor que lhe custa pouco, desconhecido (+2))»* [H T13]; *«faltam 1 avanco»* [H T27].
- *O que fazer:* um varredor que lê os textos de tela gerados nas sessões gravadas (`testes/sessao-*.json`
  → `correrOTurno`) e falha com `+N`, «de poder», «×», parênteses de modificador. O texto do oráculo vem
  de `src/oraculo.js:116` (o renderizador que o põe na tela **não achei hoje** — `linhaDaConsulta` em
  `:198` já o tira). O veredito do perigo diz só «Difícil — é onde se morre» e, se quiser número,
  «vão 2, esperam-vos 8».
- *Tamanho/quem:* S · `testes` + `oficial`. *Medida:* varredor verde em todas as sessões gravadas.

**P0-10 · Uma língua.**
- *Prova:* *«ficas a saber»*, *«bónus»*, *«Fá-lo à tua maneira»* (PT-PT, do sistema) ao lado de
  *«você»*, *«tá»* (PT-BR, do Narrador) [H T3, T14, T18].
- *O que fazer:* **decisão da pessoa** (o público é Brasil?). Se for PT-BR: as tabelas de texto de
  tela do motor (chamado, quadro, encruzilhada, cerimónias) passam por um varredor de PT-PT
  (`ficas|fá-lo|bónus|ecrã|telemóvel|estás`) e são reescritas. É voz do sistema em massa → pesado.
- *Tamanho/quem:* M · `backend` + `desenho` (textos de peça). *Medida:* varredor a 0 nos textos de tela.

### P1 — primeira semana

| # | problema · prova | o que fazer e como | tam. · quem | medida |
|---|---|---|---|---|
| P1-1 | **Criação longa demais** (17 cliques, 2 textos obrigatórios) [H] | botão «Entrar já» no passo 1: sorteia mundo e herói pela semente, mostra a ficha num cartão com «trocar» por campo. O «conceito» passa a opcional (o sistema escreve um). | M · `desenho` → `oficial` | menu → 1.º dado ≤ 60 s com ≤ 4 cliques |
| P1-2 | **O veredito do perigo mede a masmorra e o jogador lê a sala** [H T16, T18] | `vereditoDaPartida` diz duas coisas: «à porta» (a 1.ª sala) e «ao fundo» (o chefe), da mesma régua (MC8). A pauta e o cartão leem a mesma função. | S–M · `backend` → `aprendiz` | régua: o 1.º encontro cai na faixa anunciada em ≥ 80% de 1000 masmorras |
| P1-3 | **«Ataco X» em sítio guardado não faz nada** [H T29] | se X é guarda/vigia de um lugar com ficha de inimigos, abre o encontro (`o-encontro.js`) com o veredito; se não há X no sistema, a resposta diz-o sem desviar. | M · `backend` → `oficial` | corpus de 20 frases de agressão: 100% abrem luta ou dizem porquê |
| P1-4 | **Descanso pela frase** [H T25] | «montamos acampamento / dormimos / descansamos» → proposta «Dormir · 2 rações» (o `sono` de `a-proposta-da-frase.js` já existe); o descanso sai do botão da hora para uma porta visível. | S · `backend` + `desenho` | as 5 formas da frase dão a proposta |
| P1-5 | **A emboscada achada não vira luta** [H T19] | busca com `ENCONTREI … (emboscada)` arma o encontro na sala, com a vantagem de quem achou. | S · `backend` | suíte: emboscada achada → encontro com surpresa do herói |
| P1-6 | **Distâncias que mudam** (28 km ida, 11,6 km volta) [H T27, T30] | achar a causa (a rota de volta parte do ponto da marcha?); catraca: ida = volta em 1000 pares. | S · `backend` | catraca |
| P1-7 | **Nomes repetidos e género** (Nolan × Nolan; «Ceridwen o Manco, encostada») [H T0, T9] | o primeiro nome do companheiro não se repete na cidade inicial (`elenco.js`); o epíteto concorda com o género do registo. | S · `backend` | 0 colisões de primeiro nome entre o grupo e a cidade em 1000 mundos |
| P1-8 | **O quadro: a carta da pessoa não vira pela conversa** — «Falo com a Nesa: o que sabe?» sem dado; só «Tento convencer» rolou [H T12–T13] | os 4 caminhos da carta (`CAMINHOS_DA_CARTA`) entram no detector do chamado: falar com a pessoa da carta sobre o assunto = Persuasão da carta. | S · `backend` | as 4 vias de cada carta em corpus |
| P1-9 | **O tique «ou X ou Y?»** (8 de 41) | `O FECHO` da pauta já varia; contar por resposta e vetar o «ou… ou» duas vezes seguidas. | S · `backend` | ≤ 10% das respostas |
| P1-10 | **O círculo que tapa a grelha** [H T18] | defeito de forma (é da ponta visual — fica aqui porque custou um golpe). | S · `aprendiz` | — |

### P2 — depois

- **O fim da campanha com estado** (hoje só instrução à IA, `src/historia.js:57`): uma cerimónia e uma
  crónica exportável (já há `onExportarCronica`).
- **O gancho de saída** (EM8): o fio mais quente ao sair, citado ao voltar.
- **O +2 de defesa** das 34 fichas (pesado, pauta 16/09).
- **Morte permanente opcional** («Uma Vida» com morte real é o que o nome promete).
- **O custo de 2027:** o 3.8 Flash dobra a 01/01/2027 (`custo.js`, auditoria) — **não verificado hoje**.

---

## 9. Tecnologia própria

### 9.1 O que já é nosso (verificado hoje)

1. **O Mestre é código.** O turno resolve regra antes do Narrador e manda-lhe envelopes «JÁ APLICADO»
   (visto em cada pedido hoje). O Narrador não tem porta para estado (`custo.porTarefa` só `narrador`;
   Cronista e Léxico fora).
2. **O determinismo por semente**, sem `Math.random` no código vivo (medido: 0).
3. **A sessão como arquivo e o replay em Node** (`src/sessao.js`, `testes/replay.mjs`, 7 sessões).
4. **O chamado** — o catálogo que lê português e devolve perícia, CD e preço da falha
   (`o-mestre-chama.js`), com corpus de 439 frases reais + 498 escritas como catraca (diário 11/11 —
   **não recontei hoje**).
5. **O quadro da quest** (GUMSHOE em código: a carta essencial vira sempre, a falha com preço).
6. **O classificador treinado com estatística do CRD3** — protótipo, **não é módulo** (decisão de 11/11:
   corpus pequeno). Não é ainda tecnologia em produção.

### 9.2 Seis propostas ousadas

**T1 · A mesa reproduzível — o replay partilhável.**
- *O que é:* um link que abre a campanha de outra pessoa **turno a turno, com os mesmos dados**, e deixa
  «tomar o controlo» a partir de qualquer turno (um *fork*). «Vê como eu morri no Acampamento de
  Espinhos — e tenta tu.»
- *Porque é defensável:* exige o que ninguém do género tem: estado de regra separado da prosa,
  determinismo e um formato de sessão. Um concorrente sobre LLM puro não consegue reproduzir; um VTT não
  tem a prosa.
- *O que já existe:* `sessao.js` (`reproduzirASessao`, `virarAPagina`, `compressao.js`), o save
  exportável (`exportarSave`), a semente. **Falta:** que o replay corra **no navegador** (hoje Node), o
  `AINDA_DO_APP` (`sessao.js:1056`) a zero, e um armazenamento (o Redis da sala serve).
- *Custo/risco:* G. Risco: as partes do turno que ainda vivem no App divergem; o próprio `DONO_DO_CAMPO`
  diz onde. É também o que o marketing gamer pede: **clipes de jogadas** partilháveis.

**T2 · O cartucho — a aventura como ficheiro aberto.**
- *O que é:* um formato (`taverna-cartucho`) com a semente do mundo, o vilão, as quests escolhidas, o
  esqueleto e os factos — que se joga, se partilha e se **escreve** (uma ferramenta de autor que valida
  pelas mesmas suítes da biblioteca: `validarQuest`, 836 provas). A comunidade de mesa escreve
  aventuras; o motor garante que são jogáveis.
- *Porque é defensável:* o efeito de rede do conteúdo; o validador é o motor inteiro.
- *O que já existe:* `BIBLIOTECA_DE_QUESTS` com `validarQuest` (`biblioteca-de-quests.js:2263`),
  `esqueleto.js`, os lotes em ficheiros separados (`src/acervo/quests-lote-N.js`) — o formato quase já
  está lá.
- *Custo/risco:* M para o formato e o leitor; G para o editor. Risco legal: conteúdo de terceiros
  (moderação).

**T3 · O juiz de coerência — a prosa podada contra o estado.**
- *O que é:* depois de cada resposta, um verificador **determinístico** compara a prosa com o estado:
  objetos passados à mão, gente nomeada, mortos, distâncias, quem está em cena. O que diverge é podado
  (como já se poda a ferida, `podarONarrador`) ou reescrito numa segunda volta barata.
- *Porque é defensável:* é a resposta direta ao defeito nº 1 do género (a IA que mente sobre o mundo) e
  vive do registo, das fichas e do `marcasDaProsa` que só nós temos.
- *O que já existe:* `podarONarrador`, `memoria-do-inventado.js`, `marcasDaProsa` (fichas.js), o
  registo de gente, o `[NO CHÃO]`. O P0-1 e o P0-2 são o primeiro tijolo.
- *Custo/risco:* M–G. Risco: falso positivo corta prosa boa (a lei «o portão morde só o necessário»).
  Mede-se nas sessões gravadas: divergências por 40 respostas.

**T4 · A mesa assíncrona — o Mestre que espera pelos dois.**
- *O que é:* em vez de dois jogadores ao mesmo tempo (a sala de hoje, frágil), **turnos por correio**:
  cada jogador joga a sua vez quando pode, o motor resolve, o Narrador narra uma vez a jogada conjunta.
  Joga-se ao longo de dias, no telemóvel, como um jogo de xadrez por correspondência.
- *Porque é defensável:* resolve o problema real do RPG de mesa (marcar a sessão) e só é possível com
  regra determinística e estado no servidor (o anfitrião não precisa de estar ligado).
- *O que já existe:* `api/sala.js` (fila + mundo), `src/sala.js`, o turno a duas mãos.
- *Custo/risco:* G; toca infra (Redis, custo por sala) → **da pessoa**. Melhor do que tentar provar a
  sala síncrona antes do beta.

**T5 · O Mestre que aprende a nossa mesa — o classificador vivo.**
- *O que é:* cada frase jogada (anonimizada, com consentimento) entra no corpus; o classificador
  (n-gramas + linear, 293 KB, 46 µs — diário 11/11, **não verificado hoje**) é retreinado e só substitui
  o catálogo onde a catraca prova que é melhor. O motor afina-se com o público, sem LLM.
- *Porque é defensável:* dados próprios de intenção em português de jogadores de RPG — ninguém tem.
- *O que já existe:* `mente/classificador-prototipo.md`, o corpus como catraca, `teste-corpus-das-situacoes.mjs`.
- *Custo/risco:* M; privacidade (LGPD) → consentimento explícito; **da pessoa**.

**T6 · O livro da campanha — a crónica como artefacto.**
- *O que é:* no fim de cada sessão, o sistema compõe um «capítulo» ilustrado (os retratos que já
  existem, o mapa, as cartas do quadro viradas, os dados decisivos com o número) que se partilha como
  imagem/página. O jogador gamer partilha a jogada; o de mesa, a crónica.
- *Porque é defensável:* nasce do estado (cada linha com fonte), não de um resumo de IA.
- *O que já existe:* `onExportarCronica`, `gerarCronica`, retratos, o recibo dos dados.
- *Custo/risco:* M; é o «gancho de saída» (EM8) com cara.

---

## 10. As cinco apostas (se só fizéssemos cinco coisas no gameplay antes de lançar)

1. **O estado e a prosa concordam nos objetos e na gente** (P0-1 + P0-2 + P0-5). *Porquê:* é a nossa
   promessa e o nosso fosso; hoje parte-se em 10 minutos de jogo, à vista. Sem isto, «o Mestre é código»
   é uma frase de marketing desmentida pelo primeiro anel.
2. **Toda quest tem um clímax com risco** (P0-3 + P1-2). *Porquê:* a encruzilhada é o nosso melhor ecrã,
   mas chega sem ter custado nada; a luta é boa e ninguém a encontra. Juntar os dois — o encontro com a
   besta antes da escolha — é o «uau» que falta, e usa peças que já existem (`o-encontro.js`, a régua do
   combate).
3. **Os primeiros três minutos** (P0-6 + P1-1). *Porquê:* o estranho decide antes do minuto 9:47, que é
   onde hoje está o primeiro momento bom. Criação em um toque, abertura com três toques possíveis e um
   risco à vista, e o segredo do vilão guardado.
4. **Uma forma de dado, à vista, sempre** (P0-4 + P0-9). *Porquê:* a ordem de 04/11 é «o dado aparece»;
   três formas e números de bastidor ensinam ao jogador que há três jogos. A bandeja é a assinatura
   visual do produto — tem de ser a única.
5. **Fechar a porta do que não está provado e prender o que prende a tela** (P0-7 + P0-8). *Porquê:* um
   beta morre por um botão morto ou por um modo a dois que falha à frente de dois amigos. São duas
   mudanças pequenas e reversíveis.

(A língua, P0-10, é condição de qualquer das cinco se o público for o Brasil — e é decisão da pessoa.)

---

## 11. O que não verifiquei

- **A derrota, o cativeiro e a morte** ao vivo (não cheguei a 0 PV).
- **A sala a dois** (dois aparelhos, Redis).
- **O fim da campanha** (só li o código: não há tela).
- **A reabertura de um save** noutro dia e o gancho.
- **O telemóvel** (é da ponta visual).
- **A suíte** (corrida hoje sobre a árvore de HEAD): `npm test` → **515/515 suítes verdes, 27/27
  varredores limpos**, exit 0. Verde e mesmo assim os defeitos do §8 aparecem a jogar: a suíte prova
  o motor, não as costuras entre o motor e a prosa — é esse o argumento do T3 (o juiz de coerência).
- **A causa** do elenco que se cola, das duas listas de «em cena», das distâncias que mudam e do
  renderizador que mostra «+8 cidade tem de tudo» — vi os efeitos, não localizei as linhas.
- **Os concorrentes:** as comparações do §1 são do que é público e geral sobre o género (AI Dungeon,
  NovelAI, Friends & Fables, Hidden Door, AI Realm); **não os joguei nem pesquisei hoje.**
- Tudo o que cito do diário (partilha 0,84, 113 suítes de combate, o classificador) está marcado.
