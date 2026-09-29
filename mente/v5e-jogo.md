# V5e · a resposta chega pelo começo — o momento (`jogo`, 28/09)

## PARA O `desenho`, JÁ — as regras que tens de construir

**A regra-mãe, numa linha:** *quando chega a resposta, a vista vai para o fim — mas
nunca para além do começo da resposta.* Uma conta só para os dois casos: a resposta
que cabe fica toda à vista, ancorada no fim, como hoje; a que não cabe pousa pelo
começo. **Ela é conta, logo mora num módulo puro** (`pousoDaVista(...)` → um
`scrollTop` ou `null`), provada em Node, e o `App.jsx` só a chama.

1. **Estar no fim = a distância ao fundo é ≤ ¼ da altura da área** (a 375, ~112 px,
   umas quatro linhas; a 1280, ~110). Tabela (`CHEGADA.toleranciaDoFim = 0.25`), não
   os 240 px de hoje. 240 são nove linhas a 375: **medido (§3), quem subiu 180 px (seis
   linhas) para reler é hoje arrancado para o fim.** A mesma medida decide quando a seta
   aparece: **uma definição de "estar no fim", não duas.**
2. **O instante que conta é o da CHEGADA**, e não o do envio. Entre um e outro passam
   ~14 s, e é nesse tempo que se sobe para reler a frase que se escreveu.
3. **Quem estava no fim** (regra 1, medida no instante da chegada):
   - **alvo = min(o fim, o começo da resposta)**. O "começo" é a runa da resposta
     logo abaixo do esbatimento: `topo da runa − ESBATIMENTO.altura`, que é o
     `scrollMarginTop` que a mensagem já tem.
   - A resposta que cabe (resposta + linhas do sistema + a runa do fim ≤ a área) fica
     no fim, e nada muda para ela.
4. **Quem estava a reler** (distância > ¼): **a vista não se move, nunca.** A seta
   ganha o estado **`Novo`**, e a acção dele **já tem forma na casa**: é a `Espreita`
   do alforje (R21, `painel-alforje.jsx`) — *a primeira linha da resposta nova, e o
   toque leva ao COMEÇO dela* (`irAoInicioDaEspreita`, `App.jsx` ~:22912, que já faz
   `block: "start"`). **Uma acção, uma forma:** a seta `Novo` diz a primeira linha
   (`primeiraLinhaDaProsa`, que existe) e leva ao começo; a forma dentro da página é
   tua (a pílula que cresce da seta?), a acção e o destino são os da `Espreita`. Some
   quando o começo da resposta entra na vista, ou ao toque. No estado `Fim` (sem
   resposta nova), a seta é a de hoje e leva ao fim. **Uma peça, dois estados.**
5. **O que chega depois, no mesmo turno, não arrasta a vista para além do começo.**
   As linhas do sistema (as do mesmo empurrão, as novidades das abas, o fim de sessão)
   e a própria cerimónia a acender recalculam o alvo pela mesma conta (min(fim,
   começo)). Se a vista já está no começo, nada se mexe. **Se o jogador tocou na
   rolagem desde a chegada, nada o move até ao turno seguinte.**
6. **A rolagem pendente segura contra o RODAPÉ, não contra o começo.** O comentário
   de hoje (`App.jsx` ~:7932) diz para que ela existe: *"o jogador quer ler a narrativa
   do Mestre antes de rolar, sem a tela pular para o rodapé"*. **Medido (§3): hoje, com
   o teste pendente, a resposta nasce INTEIRA ABAIXO da vista** (a runa a 462 px numa
   área de 448 a 375; 456 / 442 na mesa) — **0 linhas à vista e nenhuma seta**. A regra
   nova serve a intenção dela: com rolagem pendente, o alvo é **o começo** da resposta
   (nunca o fim), mesmo que a resposta caiba.
7. **Com `prefers-reduced-motion`, o salto é seco** (`behavior: "auto"`); sem ele,
   `smooth`. Nunca há animação para além da própria rolagem.
8. **Nada rouba o foco.** O campo continua com o cursor; as 20 letras escritas durante
   a chegada chegam todas.
9. **Abrir o jogo (continuar a campanha) e a abertura da campanha usam a mesma regra**:
   a vista pousa no começo da última resposta do Mestre se ela não couber, e as linhas
   de "Anteriormente…" ficam por baixo. Hoje abre-se no fim.
10. **O turno seguinte começa como hoje**: ao enviar, a vista vai ao fim (a frase do
    jogador e a espera à vista).
11. **A cerimónia (`ABERTURA.acesa`) religa-se nesta etapa, como último passo e só com a
    prova do §4** (as duas falhas de V5 desfeitas). Se a prova falhar, fica `false` e a
    etapa sobe sem ela.

---

## 1 · Porquê — o que o jogador vive hoje, em número

Em **todas** as respostas reais dos saves (1 137 a 1 880 car.), quem está no fim recebe
a resposta **pelo fim**: a vista corre até ao fundo e mostra as **últimas 8–9 linhas**.
**A 375 ficam 24 a 43 linhas acima** (o começo está a 724–1 276 px por cima do topo); a
1280, 9 a 20. **A primeira linha não está à vista em 10 de 10.** O jogador lê o
desfecho antes da cena, ou rola para trás a cada turno — o gesto mais repetido do jogo,
feito do lado errado. Um livro não se abre na última página do capítulo.

## 2 · A regra, caso a caso

| no instante da chegada | a resposta cabe? | onde pousa | depois, no mesmo turno |
|---|---|---|---|
| **no fim** (≤ ¼ da área) | sim | **no fim** (tudo à vista), como hoje | o que chegar recalcula min(fim, começo): segue o fim enquanto o começo fica à vista, e pára no começo |
| **no fim** | não | **no começo**: a runa logo abaixo do esbatimento | nada se mexe |
| **a reler** (> ¼) | — | **não se move** | a seta passa a `Novo` (a primeira linha; toque → começo). Some quando o começo entra na vista |
| **rolagem pendente** | — | **o começo**, mesmo que caiba | nada se mexe até rolar |
| qualquer um, e o jogador **tocou na rolagem depois da chegada** | — | — | **nada o move** até ao turno seguinte |
| **abrir o jogo / a abertura da campanha** | — | a mesma conta: o começo da última resposta, se não couber | "Anteriormente…" fica por baixo |
| **enviar o turno** | — | o fim (a frase do jogador e a espera), como hoje | — |

`reduce` → salto seco; sem ele, `smooth`. O foco nunca sai do campo.

## 3 · O antes, medido agora (HEAD `c5acc8c`)

**Montagem.** Um harness com as peças reais de V5 (`Prosa`, a runa com o ouvir,
`FimDaPagina`, a `FOLHA`), os textos verdadeiros do Mestre dos saves de V1, a página com
as medidas do jogo vivo (343 × 448 a 375; 1 144 × 442 a 1280), e **a regra de rolagem do
App de HEAD copiada** (`cresceu && !longeDoFim(>240) && !rolagem` → `fim.scrollIntoView`
`smooth`/`end`). Chrome headless, perfil temporário, **0 chamadas ao Mestre**. Script
`scratchpad/v5e-jogo/harness/chegada.mjs`; números em `antes.json`.

| caso | 375 | 1280 |
|---|---|---|
| **5 respostas reais, quem estava no fim** | a 1.ª linha à vista em **0 de 5**; vêem-se 8–9 linhas, **24–43 acima** | **0 de 5**; 8–9 vistas, **9–20 acima** |
| **resposta curta** (~270 car.) | cabe: 8/8 linhas, a runa a −13 px | cabe: 4/4 |
| **a reler, subiu 180 px (6 linhas)** | **arrancado para o fim** (a mesma vista do "no fim") | **arrancado** |
| **a reler, subiu 600 px** | não se move; a seta diz *ir para a última mensagem* e leva **ao fim** | idem |
| **rolagem pendente** | **a resposta nasce toda abaixo da vista** (runa a 462 numa área de 448): **0 linhas, e nenhuma seta** | 456 / 442: 0 linhas, nenhuma seta |
| **uma linha do sistema chega depois** | **arrasta a vista 82 px** para o fim | **64 px** |
| **`reduce`** | rola `smooth` na mesma (o código não o lê) | idem |
| **20 letras a escrever durante a chegada** | 20/20, o foco fica no campo | 20/20 |

**Quatro defeitos de hoje, além do principal:**
1. quem relê seis linhas é arrancado;
2. a rolagem pendente esconde a resposta que devia deixar ler;
3. o que chega depois arrasta;
4. o `reduce` é ignorado.

**Um que não existe:** o foco e as letras estão bem.

## 4 · A cerimónia — religa-se aqui, e a prova é esta

As duas falhas de V5 (V5 §8.1) eram as duas **da vista presa ao fim**:
- **(a)** a cerimónia nascia acima do topo, em 5 de 5;
- **(b)** ao acender, empurrava o fim 53–64 px para baixo da vista.

Com a regra desta etapa:
- **(a) desaparece:** a vista pousa no começo, e no harness de V5 a cerimónia ficou a
  **48 px do topo, com 12 linhas à vista desde a primeira** (14 no dia);
- **(b) é a regra 5:** a cerimónia a acender é *uma coisa que chega depois* e recalcula
  min(fim, começo). Na resposta que cabe, o fim volta à base. Na que não cabe, a vista já
  está no começo, e crescer para baixo não mexe nada.

**Religa-se (`ABERTURA.acesa: true`) como último passo da etapa, só se passarem os três:**
1. quem estava no fim com resposta longa: a frase grande **inteira à vista**, com o topo a
   **≤ 72 px** do topo da área, em 10 de 10 (5 respostas × 375/1280);
2. resposta curta: a cerimónia à vista **e** o fim na base a **±2 px**, nas duas larguras;
3. a reler: a cerimónia acende e **a vista não se move** (Δ `scrollTop` = 0).

Falhando um, `acesa` fica `false` e V5e sobe sem ela. **A cerimónia depende desta
etapa, e esta etapa não depende da cerimónia.**

## 5 · O protocolo da prova do depois

**Onde:**
- **o harness de §3**, mas com a fiação **copiada do App do depois** (não reescrita) e a
  função pura **importada**;
- **a suíte em Node** da função pura (`pousoDaVista`, com uma tabela de casos: no fim,
  cabe e não cabe; a reler; rolagem; tocou depois; os limites de ¼);
- **um turno real a 375**, e só um: é o único que prova a fiação viva, custa 1 chamada, e
  digo quanto custou.

**Qualquer critério que caia e V5e não sobe:**

| # | critério | antes → exigido |
|---|---|---|
| 1 | **no fim, resposta longa**: a 1.ª linha à vista | 0/10 → **10/10**; a runa a ≤ 72 px do topo; ≥ 8 linhas à vista desde a 1.ª a 375, ≥ 8 a 1280 |
| 2 | **no fim, resposta curta**: tudo à vista, o fim na base | igual a hoje (±2 px) |
| 3 | **a reler 180 e 600 px** | arrancado / seta ao fim → **Δ `scrollTop` = 0** nos dois; seta `Novo` com a 1.ª linha; o toque pousa a runa ≤ 72 px do topo; some quando o começo entra na vista |
| 4 | **o que chega depois** (linha do sistema, cerimónia) | arrasta 82 / 64 px → **0 px** com a vista no começo |
| 5 | **rolagem pendente** | 0 linhas, sem seta → **a 1.ª linha à vista** |
| 6 | **`reduce`** | `smooth` → **salto seco**: o `scrollTop` 50 ms depois da chegada já é o final |
| 7 | **20 letras durante a chegada** | 20/20 → **20/20**, foco no campo |
| 8 | **nada salta** | com a vista pousada, 3 s de amostras a cada 100 ms: **`scrollTop` constante** |
| 9 | **abrir o jogo** | no fim → **a 1.ª linha da última resposta à vista**, se não couber |
| 10 | **uma seta, dois estados** | uma peça só no DOM; `Novo` só depois de uma chegada a reler |
| 11 | **a cerimónia** | os três do §4 — ou fica apagada, e diz-se |
| 12 | **a casa** | build, suítes verdes, a tela de combate intocada |
| 13 | **joguei** | três turnos lidos a 375, e escrevo se a leitura começa onde a história começa |

## 6 · A proposta ambiciosa — **o marcador de onde paraste**

Esta etapa decide onde a vista pousa quando o Mestre fala. **A seguinte decide onde ela
pousa quando o jogador volta.** Hoje, reabrir o jogo é cair no fim do registo, e com esta
etapa no começo da última resposta. **Mas o jogador pode ter parado a meio dela**, ou
três respostas antes, a reler.

**Proposta:** quando a página perde a vista (fechar, trocar de app, `visibilitychange`),
guarda-se **a linha que estava no topo da área**. Ao voltar, pousa-se lá, com a
`Espreita` a dizer *continuas aqui* e um fio âmbar de 1 px na margem dessa linha. O fio
apaga-se ao primeiro gesto.

**Porque faria o jogo ser lembrado:** é o marcador de leitura dos e-readers (continuar
onde se parou, entre sessões e aparelhos — convenção observada, não estudo). Num jogo em
que se lê mais do que se clica, **voltar à mesa e encontrar o dedo onde o deixaste** é o
que separa um livro de um chat.

**O que precisa e o que arrisca:**
- **Não toca no save:** uma chave de preferência de leitura por modo, como
  `taverna_cfg_rolagens`. Um commit revertido deixa uma chave inerte, e nenhum dado de
  jogador se perde.
- **Peso: médio de design.** Proponho-o como **V5f**, depois de V5e provada, porque usa
  a mesma conta de pouso.

---

## 7 · A prova jogada de V5e — o resultado (`jogo`, 28/09)

**Montagem.** O jogo vivo, com o Narrador simulado pelo método do `desenho`. O pedido a
`/api/narrador` é segurado e respondido com o envelope real (`{ texto }`), com **as
minhas 5 respostas reais** (1 137 a 1 880 car.) e uma curta. Custo: **0 chamadas, 0
cêntimos**: 21 respostas simuladas por corrida, e os outros pedidos a `/api` cortados.
Chrome headless com perfil temporário, e o save do dia injectado com o jogo desmontado.
**Duas árvores, lado a lado:**
- **apagada:** a 5173, a árvore do `oficial`;
- **acesa:** uma **cópia** da árvore com o `7-acender.cjs` aplicado, servida à parte na
  5181, com a cache do vite isolada. A árvore não foi tocada.

Cada resposta real chega numa sessão nova, para ser a primeira da sessão (a da
cerimónia). Ficheiros em `scratchpad/v5e-jogo/`: `prova.mjs` → `apagada.json` e
`acesa.json`, e as fotos em `fotos-apagada/` e `fotos-acesa/`.

**Uma nota de método, porque quase me enganou.** Na primeira corrida esqueci o envelope
`{ texto }`, e o App mostrou *"O Mestre hesita…"* (103 px) em vez da resposta. Os números
pareciam bons, e eram de uma resposta de duas linhas. O script do `desenho` tem o
envelope certo (`medir-v5e.mjs`:69), logo os números dele e do `oficial` valem. Os meus
foram refeitos com ele.

### 7.1 · Os 13 critérios

| # | critério | antes | depois |
|---|---|---|---|
| 1 | **no fim, resposta longa: a 1.ª linha à vista** | 0/10 | **10/10.** A runa a **24 px** do topo em todas, e **14–15 linhas** à vista desde a primeira (13–15 com a cerimónia) |
| 2 | **no fim, resposta curta** | tudo à vista | **igual**: 3/3 linhas (375), 2/2 (1280), o fim na base (**0 px**) |
| 3 | **a reler 180 e 600 px** | 180: arrancado para o fim | **Δ `scrollTop` = 0** nos 4 casos. A tira `Novo` diz a 1.ª linha (*"A praça se acalma quando o sol cai…"*); o toque pousa a runa a **24 px** com 13–15 linhas; depois a seta volta a `Fim` |
| 4 | **o que chega depois** | arrasta 82 / 64 px | a cerimónia a acender (o caso que se pode provocar vivo) **não mexe a vista**: a runa fica a 24. As linhas do sistema de turnos seguintes não se provocam sem Mestre; estão cobertas pela suíte `teste-v5e-chegada` (a forma do código) e pela conta pura |
| 5 | **rolagem pendente** | 0 linhas, sem seta | **passou por leitura e pela suíte, não vivo**: o teste pendente vem do Cronista, cujo pedido a prova corta. O ramo da resposta não lê `rolagem` e pousa pelo começo; o que vem depois respeita-a |
| 6 | **`reduce`** | `smooth` | **seco**: a 150 ms a runa já está a 27 px e depois a 24 (os 3 px são o `tv-fade` a assentar, não rolagem) |
| 7 | **20 letras durante a CHEGADA** | 20/20 | **20/20, com o foco no campo**, nas duas larguras (ver 7.3 para a ESPERA) |
| 8 | **nada salta** | — | **30 amostras em 3 s: min = max**, nas duas larguras |
| 9 | **abrir o jogo** | no fim | **a runa a 24 px, 15 linhas desde a primeira**, nas duas larguras |
| 10 | **uma seta, dois estados** | — | **passou**: `Ir para a última mensagem` ↔ `Resposta nova do Mestre: …`, uma peça |
| 11 | **a cerimónia** | apagada | **os três passam** (7.2) |
| 12 | **a casa** | — | build e suítes verdes, pelo `oficial` (217/217, 15/15); os scripts não tocam em combate |
| 13 | **joguei** | — | a 375, a primeira resposta da sessão abre como um capítulo: runa, *"A manhã em Torre da Fonte cheira a cera e tinta."* em 28, e 13 linhas de cena por baixo (`fotos-acesa/real0-375.png`). **Não li o fim de nada antes do começo.** Relendo, a resposta nova não me puxou: chamou-me pela primeira frase, e fui quando quis |

### 7.2 · A cerimónia — **veredito: ACENDE**

| critério (§4) | resultado |
|---|---|
| (1) resposta longa, no fim: a frase grande **inteira** à vista, topo a **≤ 72 px** | **10/10**: o topo a **72 px exactos** em todas (runa 24 + o bloco da runa 48), inteira. Altura de 38 a 151 px conforme a frase: 1 a 4 linhas a 28 |
| (2) resposta curta: a cerimónia à vista **e** o fim na base | **2/2**: a cerimónia a 226 px (375) e a 251 (1280), inteira, com o **fim na base: 0 px** |
| (3) a reler: acende e a vista não se mexe | **4/4, Δ = 0**: acende lá em baixo, fora de vista, e ninguém é puxado. O toque na tira pousa-a a 72 px, inteira |

**As duas falhas de V5 desfizeram-se as duas:**
- a cerimónia fora de vista passou de 5/5 para **0/10**;
- o fim empurrado passou de −53 a −64 px para **0 px**.

**Acende-se: `7-acender.cjs`, commit próprio.** O preço é que a cerimónia custa 1–2
linhas de prosa à vista no turno dela (13 contra 15 a 375), em ≤ 2 turnos por sessão. É o
preço de uma cena que abre.

### 7.3 · As letras: a CHEGADA e a ESPERA são duas coisas

- **Durante a chegada (esta etapa): 20/20**, com o foco no campo, nas duas larguras. A
  rolagem não toca no campo. **O `oficial` tem razão.**
- **Durante a espera (o Mestre a pensar): 0/20.** O campo está `disabled` enquanto
  `bloqueado` (`App.jsx` ~:24256), e as letras escritas nesse tempo **perdem-se sem
  aviso**: nem entram, nem se diz que não entraram. **O `desenho` tem razão** (os 7/20
  dele são o ritmo: parte das letras entrou antes de o campo fechar). O meu harness de §3
  não copiava o `disabled`, e escrevi o critério 7 só para a chegada. **Não é de V5e**
  (igual antes e depois), e a culpa do desenho é minha: o `v1-jogo.md` §2 pôs *"À espera —
  desactivado com o texto lá"*.
- **É defeito, e tem nome:** **V6a · a espera deixa escrever**, peso **médio**. Numa mesa,
  pensa-se a jogada seguinte enquanto o Mestre fala. O conserto é o campo **editável**
  durante a espera, com **só o envio** travado (o `Enter` não parte e o dado fica em *À
  espera*). Entra no V6 (o compositor e o dado), que já é dono destes estados. Prova: 20/20
  letras escritas durante uma espera de 3 s, 0 turnos enviados por engano, e o
  `Shift+Enter` intacto.

### 7.4 · Os dois desvios do `desenho` (`formas.md` §V5e.4) — **concordo com os dois**

- **Enviar leva ao fim SEMPRE** (e não só a menos de 240 px). A minha regra 10 dizia
  *"como hoje"*, e o *hoje* era o defeito. **Enviar é um gesto**: quem escreveu e mandou
  acabou de dizer que está no presente. Deixá-lo lá em cima, a olhar para o que relia,
  esconde a própria frase e a espera, que são a única prova de que o turno partiu (R3). A
  forma dele é a certa.
- **O `Novo` é a tira da espreita, não uma pílula nova.** Foi o que pedi: *uma acção, uma
  forma*. A pílula foi uma sugestão minha de forma, e a forma é dele. A tira já existia
  para a mesma acção (a resposta chegou enquanto estavas noutro sítio; o toque leva ao
  começo) e passou a peça. **Melhor do que a minha sugestão.**

### 7.5 · O senão de forma: **a tira `Novo` na mesa cobre a prosa — lê pior, sim**

Medido: a 1280 a tira tem **553 × 48** e fica sobre a coluna, a 18 px do fundo
(`setaCaixa` 328 · 436 · 553 · 48). Tapa **~1,7 linhas** da prosa que o jogador está a
reler (a foto `fotos-acesa/reler600-1280.png` mostra uma linha cortada ao meio por cima
e outra por baixo). E a mesa **tem para onde ir**: sobram **~296 px de margem de cada
lado** da coluna de 536.

**Conserto (leve, forma do `desenho`):** na mesa, a tira mora **na margem direita**:
- da coluna + 24 até à borda − 24, **~260 px**, ancorada ao fundo como a seta `Fim`;
- a primeira linha trunca a ~30 caracteres, o que chega para reconhecer a frase;
- **0 px de prosa tapada.**

**No telefone fica como está**: não há margem, e a espreita do alforje (o precedente de
R21) também cobre. Pode ir no mesmo commit de V5e ou logo a seguir, e não bloqueia.

### 7.6 · O que muda para quem joga, em número

- **a primeira linha da resposta à vista: 0/10 → 10/10** respostas reais;
- no telefone, **lê-se desde a primeira linha: 15 linhas de cena à chegada**, contra as
  últimas 8–9 de antes, com 24–43 linhas por cima;
- **quem relê não é arrancado**: Δ 0 px (antes, seis linhas de releitura eram arrancadas
  para o fim), e a resposta nova chama-o pela primeira frase;
- o `reduce` passa a ser respeitado: o salto é seco;
- **a cerimónia volta**, e vê-se: 10/10, a 72 px, inteira. Na chegada a um lugar novo e na
  primeira resposta da sessão, a página abre como um capítulo.

### 7.7 · Veredito

**V5e: SOBE.** Os 13 critérios passam. O 5 (rolagem pendente) passa por leitura e pela
suíte, porque não se provoca sem o Cronista. Leva o **conserto leve da tira na margem
da mesa** (7.5), no mesmo commit se couber, e **não bloqueia** sem ele.

**A cerimónia: ACENDE**, em commit próprio (`7-acender.cjs`), com os três critérios em
10/10, 2/2 e 4/4.

**Para a pauta:**
- **V6a · a espera deixa escrever** (médio; 0/20 letras hoje) entra no V6;
- **V5f · o marcador de onde paraste** (a ambiciosa, §6) continua em pé.
