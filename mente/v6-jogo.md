# V6 · o compositor e o dado (com V6a dentro) — o momento (`jogo`, 28/09)

## PARA O `desenho`, JÁ — o que tens de construir

### A · V6a, a lei: *o que se escreve nunca se perde; o que espera é o envio*

1. **O campo NUNCA fica `disabled`.** Hoje fecha-se com `bloqueado = carregando ||
   rolagem` (`App.jsx` ~:22051), e as letras escritas nesse tempo **somem sem aviso**
   (medido em V5e: 0 de 20). A partir de V6 o `disabled` sai do `<textarea>`, e **o que
   `bloqueado` trava passa a ser só o ENVIO**: o `Enter` (`gestoDoCampo` → `mandar`), o
   toque no dado e o `Agir`. A gaveta `✦` pode continuar travada durante a espera, porque
   não guarda texto.
2. **O `Enter` durante a espera não envia, não apaga, não enfileira.** Mantém o texto
   intacto, e **o dado responde**: um só pulso do estado `À espera` (sem pulso com
   `reduce`) e o nome acessível *"À espera do Mestre"*. **Nunca há fila automática**: uma
   frase escrita antes de ler a resposta não pode partir sozinha depois dela. **O jogador
   lê primeiro, e o envio é sempre dele.**
3. **Quando a resposta chega, o texto fica no campo, e o dado passa a `Pronto`** (cheio,
   aceso). Nada mais muda: nem o cursor, nem o foco, nem a posição do caret.
4. **Com teste pendente (`rolagem`), o campo também escreve.** O dado está em `Rolar`, e
   **o `Enter` não rola nem envia** (rolar o dado com uma tecla de texto seria uma
   surpresa). O texto espera e, resolvido o teste e a resposta dele, o dado volta a
   `Pronto`.
5. **Na sala a dois não muda o protocolo** (`api/sala` é da pessoa). A tua parte, depois
   de a mandares, **já não se perde**: vive na faixa. O dado fica `À espera` (do outro) e
   **o campo continua a deixar escrever** a jogada seguinte, com as mesmas regras 2 e 3.
6. **Os outros caminhos por onde uma letra se perde hoje**, e o que proponho para cada um
   (§1):
   - `irMenu` faz `setEntrada("")` (~:22025): o texto morre ao ir ao menu;
   - fechar ou recarregar a página com texto no campo;
   - a batalha a abrir por cima: o texto sobrevive no estado, mas não se vê;
   - o morto e o véu do dado cobrem o campo, mas não o apagam.
   **Solução única: o RASCUNHO.** O texto do campo guarda-se numa chave de preferência
   por modo (como `taverna_cfg_rolagens`, **fora do save**) a cada pausa de escrita, e
   volta ao campo ao montar. `irMenu` deixa de o apagar. Apaga-se só quando o turno parte.

### B · O dado: um só, cinco estados, no lugar do `Agir →`

| estado | quando | forma (a peça é tua) | o toque | o `Enter` |
|---|---|---|---|---|
| **Repouso** | campo vazio, nada pendente | o d20 de V3 em contorno âmbar, apagado | **foca o campo** (pegar no dado é começar a jogada). Nunca um botão morto | — |
| **Pronto** | há texto, nada pendente | cheio, aceso (o `btn-send-d20` da v3, `126:117`) | envia | envia |
| **Lançado** | no instante do envio | um quarto de volta, **≤ 300 ms**, e nada com `reduce` | — | — |
| **À espera** | o Mestre a responder, ou a sala à espera do outro | apagado, **com o texto no campo se houver** | nada. O nome diz *"À espera do Mestre"* | não envia; um pulso (regra 2) |
| **Rolar** | teste pendente | cheio, **com a dificuldade na face** (`12`) | **abre o véu do dado** (o `OverlayDado` de hoje, intocado) | **não rola** |

- **Um dado na tela em qualquer instante.** O cartão do teste perde o botão `Rolar d20`
  (que se aposenta) e passa a **linha do veredito**, por cima do campo:
  `Teste de Força · dif. 12 — motivo`, com a vantagem se houver. Só existe quando há
  veredito; 0 px sem ele.
- **`✦` no lugar da caneta (`126:114`)**: à esquerda, dentro da pílula do campo. Na mesa
  está sempre; no telefone, só com o campo aberto (R17).
- **`Enter` envia e `Shift+Enter` quebra linha**, intocados (R13 §2.8).
- **A borda do campo continua semântica**: violeta com habilidade armada, âmbar com
  milagre, e o fio de hoje sem nada. A v3 pinta-a violeta sempre, e isso apagaria o sinal
  de *armada* (desvio V6-D5).

---

## 1 · Cada caminho por onde uma letra se perde (V6a)

| caminho | hoje | depois |
|---|---|---|
| **escrever enquanto o Mestre pensa** | o campo `disabled`: **0/20 letras**, sem aviso (medido: 375 e 1280) | escreve-se; só o envio espera (regras 1–3) |
| **escrever com um teste pendente** | `disabled`, com o placeholder *"Role o dado abaixo…"*: **0/20** | escreve-se; o `Enter` não rola nem envia (regra 4) |
| **sala a dois, à espera do outro** | a tua parte vai para a faixa (não se perde) | igual, e o campo aceita a jogada seguinte (regra 5) |
| **`Enter` com o turno a recusar** (`agirInterno`: `carregando \|\| rolagem`, e a trava de X3) | volta calado e **o texto fica** (já é assim, e está bem) | igual; o dado diz porquê (`À espera` / `Rolar`) |
| **ir ao menu** (`irMenu` → `setEntrada("")`) | **o texto morre** | o rascunho fica (regra 6) |
| **fechar ou recarregar a página** | **o texto morre** (é estado do React) | o rascunho volta ao montar |
| **a batalha abre por cima** | o texto sobrevive no estado, mas não se vê | igual; volta com a página |
| **o morto, o véu do dado, o alforje por cima** | cobrem o campo, não o apagam | igual |
| **o turno parte** (`setEntrada("")` em `agirInterno`, ~:14060 e :14092) | apaga, e a frase passa ao registo (é o destino dela) | igual, e o rascunho apaga-se aqui, **e só aqui** |

**O rascunho não é o save:** é uma chave de preferência por modo, como
`taverna_cfg_rolagens` (o território do save não se toca, CLAUDE.md). Um commit revertido
deixa uma chave inerte, e nenhum dado de jogador se perde. Guarda-se a cada pausa de
~400 ms de escrita e ao `visibilitychange`, e **nunca durante a injecção de save** (a
armadilha da casa: o autosave sobrescreve a injecção, e isto é um autosave).

## 2 · Como o jogador sabe que o dado envia (a dúvida de V1 §5)

Não há estudo que eu possa citar. Há três coisas que não dependem de estudo:
1. **O dado acende à primeira letra** (`Repouso` → `Pronto`). A mudança liga o botão ao
   texto no instante em que se escreve: *eu escrevi, ele acordou*. É a mesma lição de R17
   (*o melhor botão desactivado é o que não está lá*), trocada por *o botão que dorme até
   haver o que mandar*.
2. **O sítio.** É a ponta direita do campo, onde todo o campo de mensagem do telefone põe
   o enviar (convenção observada, e digo-o como observação).
3. **O nome.** `Agir` no nome acessível e no `title`, e `Rolar o dado` no estado `Rolar`.
   **Na mesa, e só no `Pronto`, a palavra `Agir` aparece à esquerda do dado**: há 1 066 px
   de campo, e uma palavra de verbo é jogo, não bastidor. No telefone não aparece.

**E ninguém depende de o saber:** o `Enter` envia como sempre. **Prova (§5):** 20 turnos
meus, contando os envios por `Enter` contra os por toque, e **o primeiro toque de quem
nunca viu** (eu, numa sessão em que esqueço o `Enter`): se hesito no dado, vê-se no toque
que não vem.

**O que o dado faz ao toque, aqui:** envia, com o quarto de volta de `Lançado` (≤ 300 ms).
O sólido que rola a sério (V3d, a ambiciosa) é outra etapa.

## 3 · Os desvios contra a v3 (`126:112`, o compositor da pessoa) — para o quadro do Figma

| # | a v3 | V6 | porquê | se a pessoa recusar |
|---|---|---|---|---|
| D1 | `dice-6` (um d6) no botão âmbar | **o d20 de V3** (o icosaedro) | um jogo de d20 com um d6 no botão de agir diz o dado errado | fica um d6 a rolar testes de d20 |
| D2 | a caneta (`126:114`) à esquerda, enfeite | **`✦`, a gaveta das habilidades**, no mesmo sítio | a caneta não faz nada; `✦` é a porta das habilidades, que hoje mora à direita | a caneta volta, e o `✦` fica à direita, entre o campo e o dado |
| D3 | o dado sempre cheio e aceso | **cinco estados**; com o campo vazio é contorno | um botão aceso que não faz nada mente; `Repouso` foca o campo em vez de mentir | o dado aceso com o campo vazio, a enviar nada |
| D4 | — | **a linha do veredito** por cima do campo, só com veredito | o teste pendente passa do cartão com botão para o sítio do olho que acabou de escrever, e o `Rolar d20` (132 × **28 px**, abaixo do piso de 48) aposenta-se | o cartão do teste fica, e dois dados âmbar na tela |
| D5 | a borda do campo violeta sempre | **violeta só com habilidade armada** (âmbar com milagre) | a borda já é o sinal de *armada*; pintá-la sempre apagá-lo-ia | perde-se o sinal de habilidade armada |
| D6 | um campo de uma linha (49 px) | **cresce até 138** e rola dentro (R17) | a frase do jogador tem de caber inteira antes de partir | a frase longa esconde-se dentro de uma linha |
| D7 | — | **no telefone o `✦` só aparece com o campo aberto** (R17) | uma linha estreita leva um alvo fixo além do que cresce | o campo de 375 perde 48 px para a gaveta |
| D8 | — | **`Agir` escrito ao lado do dado, na mesa, no `Pronto`** (§2) | o primeiro toque de quem não conhece o dado | o dado sem palavra (e o `Enter` continua) |

## 4 · O antes, medido agora (HEAD `6805086`)

**Montagem.** O jogo vivo com o Narrador simulado (o método de V5e, com o envelope
`{ texto }`): 2 respostas simuladas, os outros pedidos a `/api` cortados, **0 chamadas**.
Chrome headless, perfil temporário, o save do dia injectado com o jogo desmontado. Para o
teste pendente, o mesmo save com `rolagem` gravada (Força, dif. 12). Script
`scratchpad/v6-jogo/antes.mjs` → `antes.json`, fotos em `fotos-antes/`.

| | 375 | 1280 |
|---|---|---|
| **letras escritas durante a espera** (20, a 60 ms) | **0 no campo durante a espera, 0 depois da resposta**: o campo `disabled` | **0 / 0** |
| **letras escritas com um teste pendente** | **0/20** (`disabled`; *"Role o dado abaixo…"*) | **0/20** |
| **o campo** (vazio · com texto) | 325 × 48 · 325 × 138 | 1 066 × 65 · 965 × 65 |
| **`✦`** | 48 × 48 | 48 × 65 |
| **`Agir →`** (só com texto) | 89 × 48 | 89 × 65 |
| **`Rolar d20 (+1)`**, com teste pendente | **132 × 28**: abaixo do piso de 48 | **132 × 28** |
| **dados âmbar na tela com teste pendente** | **1** (o `Rolar d20`), longe do campo, por baixo dele | **1** |

**O que isto diz:**
- A V6a é **0/20 em quatro de quatro situações**: espera e teste, 375 e 1280.
- O botão que rola os testes é **o alvo mais pequeno da tela principal** (28 px de alto).
- Hoje há **um** dado âmbar com teste pendente. **Com o d20 da v3 posto no lugar do
  `Agir` sem esta etapa, seriam dois**, com dois sentidos: é o defeito que V1 §2 previu.
  V6 mantém **um**.

## 5 · O protocolo da prova do depois

O mesmo `antes.mjs` com `ROTULO=depois`, mais os casos novos, com o Narrador simulado.
**Qualquer critério que caia e V6 não sobe:**

| # | critério | antes → exigido |
|---|---|---|
| 1 | **letras na espera** | 0/20 → **20/20** no campo durante a espera **e depois da resposta**, 375 e 1280 |
| 2 | **letras com teste pendente** | 0/20 → **20/20** |
| 3 | **o `Enter` na espera** | — → **0 turnos enviados**, o texto intacto (mesmo comprimento), um pulso só (0 com `reduce`) |
| 4 | **nenhuma fila** | com texto escrito na espera, a resposta chega → **0 envios automáticos em 5 s**; o dado passa a `Pronto` |
| 5 | **o `Enter` com teste pendente** | → **não rola, não envia**; o véu não abre |
| 6 | **um dado** | 1 → **1** em todos os estados, com e sem teste (um só `[data-dado]` visível) |
| 7 | **os cinco estados** | cada estado provocado e lido pelo nome acessível: Repouso (vazio) · Pronto (texto) · Lançado (≤ 300 ms, 0 com `reduce`) · À espera · Rolar (com `12` na face) |
| 8 | **o `Repouso` foca** | o toque com o campo vazio põe o foco no campo, e 0 envios |
| 9 | **alvos** | o dado ≥ 48 × 48 · `✦` ≥ 48 · o `Rolar` (28 px) aposentado: **0** botões `Rolar d20` |
| 10 | **`Enter` / `Shift+Enter`** | intactos: `Shift+Enter` quebra linha e não envia; `Enter` envia no `Pronto` |
| 11 | **o rascunho** | texto no campo → recarregar → **o texto volta**; ir ao menu e voltar → **volta**; enviar → apaga-se; injectar um save com o jogo desmontado **não o ressuscita noutra campanha** (a chave é por modo e limpa-se com o save novo) |
| 12 | **a sala a dois** | o protocolo byte a byte igual (a suíte da sala verde, sem asserção movida); à espera do outro, o campo escreve |
| 13 | **a catraca de R6** | 20 turnos jogados: **≥ 15 pelo campo** (e conto quantos pelo `Enter` e quantos pelo dado) |
| 14 | **lado a lado com o `126:112`** | cada diferença ou está em D1–D8, ou é defeito |
| 15 | **a casa** | build, suítes verdes, **a tela de combate intocada** (o painel da batalha tem o seu campo; V6 não lhe toca) |

## 6 · A proposta ambiciosa — **a frase mostra o preço antes de partir**

A linha do veredito nasce aqui para o teste pendente. **Ela pode dizer mais, e é aqui que
a lei-mãe desta casa chega à frase escrita:** *o veredito antes do clique.* Hoje o jogador
escreve *"ataco o javali com a espada"* e só depois do envio descobre que foi um ataque, e
contra quê. **O despachante que decide isso é código e é puro** (`turno.js`:
`decidirTurno`, `portasQueAbrem`, `cascataDoTurno`). Pode correr **enquanto se escreve**,
sem o Mestre.

**Proposta:** com o campo parado ~500 ms, a linha do veredito diz o que a frase **vai
fazer**, na voz do jogo e nunca no nome do mecanismo:
- `Atacar o javali · Força contra 12`;
- `Beber a poção pequena · 5 a 9 PV`;
- `Perguntar ao mundo · sim ou não`;
- nada, se é só fala.

É o mesmo lugar e a mesma peça, com um veredito a mais.

**Porque faria o jogo ser lembrado:** é o momento em que o texto livre deixa de ser uma
aposta. O jogador **vê o preço antes de pagar**, na frase que ele próprio escreveu, e
mais nenhum RPG de texto faz isso.

**O que arrisca:** que a linha acerte mal (a frase é ambígua). Por isso diz só o que o
despachante **decidiria**, que é exactamente o que vai acontecer, e cala-se quando não
decide nada.

**O que precisa:** um pedido ao sistema, `vereditoDaFrase(texto, estado)` puro por cima
do despachante (a pedir em `pedidos-ao-sistema.md` quando o `regente` o puser na fila; não o escrevi lá). **Peso: médio de design com pedido.**
Proponho-o como **V6b**, logo a seguir, porque a peça (a linha) nasce agora.

---

## 7 · A prova jogada de V6 — o resultado (`jogo`, 28/09)

**Montagem.** O jogo vivo na 5173 (a árvore do `oficial`, não commitada), com o Narrador
simulado com o envelope `{ texto }` e a minha resposta real de 1 137 car. Custo: **0
chamadas**; os outros pedidos a `/api` foram cortados. Chrome headless com perfil
temporário, o save do dia (e o mesmo com o teste pendente) injectado com o jogo
desmontado, 375 e 1280.
- **Scripts**, em `scratchpad/v6-jogo/`: `depois.mjs` → `depois.json`, e `extra.mjs` →
  `extra.json` (animações com e sem `reduce`, e `Shift+Enter` com o carácter de verdade).
- **Fotos** em `fotos-depois/`.
- **Os pedidos contam-se pelo Mestre simulado**: um envio é um pedido. Não se contam pelo
  ecrã.

### 7.1 · Os 15 critérios

| # | critério | antes | depois |
|---|---|---|---|
| 1 | **letras na espera** | 0/20 | **20/20** no campo durante a espera **e 20 depois de a resposta chegar**, 375 e 1280. O campo nunca está `disabled`, e por cima diz *"Fica guardado — você manda depois de ler."* |
| 2 | **letras com teste pendente** | 0/20 | **20/20**, nas duas larguras |
| 3 | **o `Enter` na espera** | — | **0 pedidos a mais** (1 no total, o do envio), **o texto intacto** (20 → 20), o pulso uma vez (`tvDadoPulso`) e **0 com `reduce`** |
| 4 | **nenhuma fila** | — | **5 s depois da resposta: 0 pedidos a mais**, o texto no campo (20), **o dado em `Pronto`**, o foco no campo |
| 5 | **o `Enter` com teste pendente** | — | **0 pedidos**; o dado continua em `Rolar`; o véu não abriu |
| 6 | **um dado** | 1 | **1 `[data-dado]` em todos os estados**; **0 botões `Rolar d20`**. Ver 7.3 para a linha da espera |
| 7 | **os cinco estados** | — | Repouso *"Escrever a jogada"* · Pronto *"Agir"* · Lançado (60 ms depois do envio) · À espera *"À espera do Mestre"* · Rolar *"Rolar o dado — Teste de Força — dificuldade 12"*, com o **`12` na face**. `tvDadoLancado` corre sem `reduce` e não corre com ele |
| 8 | **o `Repouso` foca** | — | o toque com o campo vazio **põe o foco no campo, 0 envios**, nas duas larguras |
| 9 | **alvos** | `Rolar d20` 132 × **28** | **o dado 48 × 48** (90 × 48 na mesa com `AGIR`) · **`✦` 48 × 48** na mesa · no telefone o `✦` só com o campo aberto (D7) · **0 `Rolar d20`** |
| 10 | **`Enter` / `Shift+Enter`** | — | `Shift+Enter` **quebra a linha e não envia** (`"linha um\n"`, 0 pedidos); `Enter` envia no `Pronto` |
| 11 | **o rascunho** | o texto morre | **recarregar: 20 → 20**, nas duas larguras. O *"não passa a outra campanha"* e o `irMenu` foram vistos pelo `oficial`; eu não os refiz |
| 12 | **a sala a dois** | — | **por leitura, não viva** (dois clientes e o `api/sala`, que a prova corta). §7.2-(3) |
| 13 | **a catraca de R6** | — | **NÃO MEDIDA.** §7.4 |
| 14 | **lado a lado com o `126:112`** | — | cada diferença está em D1–D15 do `146:2`: o dado de 48, o `✦` onde estava a caneta, a pílula de 65 na mesa (D6), `AGIR` (D8), sem faixa de painel (D12). Nenhuma diferença fora da lista |
| 15 | **a casa** | — | build e suítes verdes, pelo `oficial` (218/218, 15/15); os scripts não tocam em combate |

### 7.2 · As três decisões

**(1) O campo aberto no telefone: nenhuma das duas — um terceiro caminho.**

Medido a 375: a pílula tem 283 px, mas **o texto começa a 65 px da borda dela e tem 201
px de largura** (~28 car. de Spectral 15). A coluna do `✦` ocupa a altura toda à
esquerda, e o `✦` só existe em baixo. **Lê pior, sim.** O texto recuado parece citado,
como a fala do jogador no registo (R3), e ele ainda não disse nada.

**As duas opções escritas:**
- **ficar como está:** 201 px de texto, recuado sem razão visível;
- **a alternativa de `formas.md` §V6:** o `✦` e o dado numa fila por baixo, ~300 px de
  texto, e **+56 px de altura** com o campo aberto. Com o teclado aberto, 56 px são duas
  linhas de prosa a menos, na única hora em que o ecrã já é metade do que era.

**Proposta: o `✦` no canto de baixo à esquerda DA pílula, sem coluna.** O `textarea`
passa a ter `padding-bottom` de 48 e `padding-left` de 16, e o `✦` fica posicionado no
canto. Resultado:
- o texto começa a **16 px** da borda, em vez de 65;
- a largura do texto passa de **201 para ~250 px** (+25 %, ~34 car.);
- **a altura não muda** enquanto o texto couber em ~3 linhas, porque a pílula aberta já
  tem 138 px e hoje usa uma para uma frase de ação;
- o dado fica fora, à direita, como está.

É a forma de todo o campo de mensagem com anexo no canto (convenção observada). A forma
exacta é do `desenho`; **o número que exijo é o texto a ≤ 16 px da borda e ≥ 240 px de
largura, sem px de altura a mais para frases de até 3 linhas.**

**(2) O anel de foco: lê pior, sim.** Medido: **3 px de `ink` (14,8:1 contra a mesa)**,
aceso sempre que se escreve, porque `:focus-within` num `textarea` é qualquer foco. É a
linha mais clara e mais grossa da tela. Pesa mais que o botão âmbar da soleira, e puxa o
olho para a moldura em vez da frase. Veio do anel das casas do tabuleiro, que tem outro
trabalho: achar uma casa entre oito vizinhas coladas.

**Conserto: 2 px de `lineStrong`** (**4,16:1 contra a mesa**, medido). Continua acima dos
3:1 da WCAG 2.4.11 e da regra de 2 px de perímetro; deixa de gritar. **A pílula aberta já
é sinal de foco** (cresce, R17), e o anel só tem de confirmar.

**(3) A sala a dois: confirmo que não perde letras, e aceito o D15.** Por leitura
(`agir` → `porAcao` → `setEntrada("")`):
- **a tua parte sai do campo para a faixa**, não para o nada;
- **mandar de novo reescreve-a**: é o que a faixa promete (*"dá para reescrever a sua até
  lá"*, `App.jsx` ~:24195), e o que a suíte da sala prende;
- **o texto que escreves a seguir fica no campo** até o mandares, como em qualquer
  espera.

**Com a reescrita a existir, `Pronto` diz a verdade** (o toque faz uma coisa: reescreve),
e `À espera` mentiria. **O D15 ganha, e a minha regra 5 estava errada neste ponto.** O que
não verifiquei vivo: o cliente que não é anfitrião (`mandarRecado`). Fica para a primeira
sessão a dois.

### 7.3 · Dois achados que não são de V6, mas estão à vista agora

- **A linha da espera no registo tem um d20 que roda com `reduce`.** `.tv-dice` (`tvShake`
  e `tvGlow`, **infinitas**) corre com `prefers-reduced-motion: reduce`: medido,
  `reduz-lancado` e `reduz-pulso` em `extra.json`. **O comentário do V5 diz que tem "a
  saída dele no reduced motion" e não tem.** Não há regra `.tv-dice` em nenhum dos blocos
  `reduce` de `estilo.js`. É anterior a V6 (a linha *"O Mestre tece o destino"* já o
  tinha). **Conserto leve:** `.tv-dice { animation: none }` no bloco `reduce`. Vai com V6,
  que é a etapa dos dados.
- **Durante a espera há dois d20 desenhados:** o do registo (cinzento, 16 px, a rodar) e
  o do compositor (`À espera`, apagado). Só um é alvo, e **nenhum é âmbar**, logo não é o
  defeito de V1 (*dois dados âmbar com dois sentidos*). Não o conserto aqui: o do registo
  é o Mestre a rolar, e o do compositor é o teu, à espera dele. Lê-se como mesa. Registo-o
  para quem vier medir.

### 7.4 · O que ficou por provar, e porquê

**(13) A catraca de R6 (≥ 15 de 20 turnos pelo campo) e *Enter* contra *toque*.** Não os
joguei. Com o Mestre simulado, eu escolho sempre, e as respostas não mudam as ofertas:
contar os meus 20 turnos contra respostas fixas não mediria nada. O *Enter contra toque*
pede, além disso, **alguém que não conheça o dado**, e eu conheço-o.

**O que falta:** uma sessão real de 20 turnos, a 375, com o Narrador de verdade (~20
chamadas; o custo aparece em `/custo`, e o `regente` decide se vale). Eu conto campo contra
soleira e `Enter` contra toque. Idealmente, **a pessoa joga os primeiros 5 turnos sem que
lhe digam o que é o dado**, e contamos o primeiro toque.

**Porque isto não bloqueia V6:** a catraca de R6 guarda contra *o campo perder turnos para
a soleira*. V6 não mexe na soleira e **só dá ao campo**: nunca fecha, guarda o rascunho, e o
teste passa para junto dele. Nada nesta etapa pode tirar turnos ao campo.

### 7.5 · O que muda para quem joga, em número

- **as letras escritas enquanto o Mestre pensa: 0/20 → 20/20**, e ficam depois da resposta;
- **com um teste pendente: 0/20 → 20/20**;
- **o texto no campo sobrevive a recarregar a página** (antes morria);
- **um dado só**, que diz o que faz em cada momento, **com a dificuldade na face**. O botão
  de rolar de 28 px de alto (o alvo mais pequeno da tela) desapareceu;
- **nenhum envio que o jogador não fez**: 0 pedidos a mais com `Enter` na espera, e 0 nos
  5 s depois da resposta.

### 7.6 · Veredito

**V6 SOBE COM TRÊS CONSERTOS LEVES, no mesmo commit** (são forma e folha, e nenhum mexe
na regra):
1. **o `✦` no canto da pílula, sem coluna**, no telefone: o texto a ≤ 16 px da borda e com
   ≥ 240 px, e 0 px de altura a mais até 3 linhas (7.2-1);
2. **o anel de foco da pílula: 2 px de `lineStrong`** (4,16:1) em vez de 3 px de `ink`
   (7.2-2);
3. **`.tv-dice` parado com `reduce`** (7.3), que é defeito anterior mas é desta etapa dos
   dados.

**A catraca de R6 e o *Enter* contra *toque* ficam para a primeira sessão real** (7.4). Não
bloqueiam, pela razão escrita.

Joguei a espera a 375: escrevi a jogada seguinte enquanto o Mestre pensava, carreguei em
`Enter` por hábito, **o dado pulsou e a frase ficou lá**. A resposta chegou, li-a, e a minha
frase estava à espera, com o dado aceso. **É a mesa: fala o Mestre, eu penso, e a minha vez
é minha.**
