# V3c · o que V3 deixou, contado a jogar (`jogo`, 25/09, madrugada)

*Nada aqui é código; nenhuma regra nova. Todo número sai de
`scratchpad/v3c-jogo/base.mjs` (o ANTES, HEAD `7efd121`, Chrome headless,
perfil temporário, `/api` cortado — 0 pedidos cortados) ou de uma linha de
código citada.*

## PARA O `desenho`, JÁ (lê isto antes do resto)

1. **A soleira mostra três coisas, nesta ordem de leitura: o verbo → o
   dinheiro → o prazo.** XP e fama saem da soleira (ficam na porta: a tábua do
   Mural já os mostra como selos, `App.jsx:2191`). Sem dinheiro, o retorno
   mostra o que paga no lugar dele (XP, item). Item, quando há, fica sempre.
2. **O prazo de um contrato deixa de ser `preco` e passa a ser `janela`** — o
   `SeloDePrazo` que a `Oferta` já desenha (`ui.jsx:1154`). **Nenhuma peça
   nova.** *O prazo só grita quando aperta*: é o canal do próprio selo (areia
   → palavra → enchimento → cor). Hoje grita sempre — âmbar, peso 600 —, com
   quatro noites folgadas.
3. **Aceitar um contrato não custa nada** (não gasta turno, `precisaDoNarrador:
   false`; não gasta moeda) → **tom `convite`**, não `preco`. O âmbar volta a
   querer dizer *ao tocar, algo sai da tua mão* (uma noite, moedas).
4. **O dinheiro das duas ofertas lê-se na mesma coluna** — é o número que se
   compara. A forma é tua; peço **0 px de desvio** a 1280 (hoje **8 px**:
   `◉ 140` em x 965, `◉ 115` em x 973, porque o XP muda de largura).
5. **O glifo do dinheiro na soleira é o mesmo da bolsa na cinta.** Uma cara.
6. **`onde` só quando não é aqui.** *"· Torre da Fonte"* nas duas ofertas é o
   sítio onde o herói está.
7. **Nenhum `quem` truncado a uma letra.** Medido a 375: o segundo contrato
   mostra *"a…"* (era *"assina Olga da Maré"*). Tinta que não diz nada; se não
   cabe um nome, não se desenha.
8. **O TEMPO: um glifo só, o céu da hora** (`luzDaHora`, `gravura-da-cena.js:210`),
   trocado pelo do clima **só quando o clima muda o céu**. Depois as palavras:
   **hora · data · estação**, e o clima por palavra nas mesmas condições.
9. **`📕 X: guardada` é Neutro com `faisca`**, como *preparada*. Conserto na
   fonte (`App.jsx:18654`, sempre `📖`), **não** na tabela: a tabela traduz o
   prefixo, não lê o fim da frase.

---

## 1 · A soleira — o que se lê primeiro

**O que o jogador decide ali.** Aceitar um contrato não custa nada agora: não
gasta turno, não gasta moeda, e falhar por tempo não tira fama
(`envelopeDeFalhaPorTempo`: *"o mundo não vira as costas"*) — perde-se a paga e
alguém fica magoado. Então a pergunta não é *"posso pagar?"*; é **"vale a
pena?" e "cabe no meu tempo?"**. A ordem sai daí:

1. **O verbo** — *o que estou a aceitar*. Já é o botão cheio; fica.
2. **O dinheiro** — *porque diria sim*, e **o que distingue uma oferta da
   outra**. No save *noite*, das quatro coisas escritas à direita de cada
   contrato, **só o dinheiro e o XP mudam** (140 × 115, 112 × 94); o prazo (4 ×
   4) e a fama (+3 × +3) são iguais. Hoje o que é igual grita (âmbar negrito) e
   o que decide sussurra (`inkDim`, 155,147,172).
3. **O prazo** — *a condição*. Lê-se por exceção: calado com quatro noites,
   alto com uma. É exactamente o que o `SeloDePrazo` já faz e o texto nu não
   faz: `APERTOS` (folgado ≥3 · a apertar ≥1 · esta noite, que **enche**).

**XP e fama saem — e porquê não é tirar ao jogador algo de que depende.** A
fama sai de `recompensaDe` como `round(peso × 3)`, e `peso` depende só do tipo
e do número de etapas: **nunca desempata dois contratos do mesmo tamanho**. O
XP sobe com o nível do trabalho, **no mesmo sentido do dinheiro** (no save, a
mesma ordem). Nenhum dos dois muda a decisão que a soleira existe para pedir.
Continuam a um toque (o Mural) e no Diário depois de aceitar. **Exceção que é
lei desde v9.193:** um favor sem moedas não pode ler-se *"não paga nada"* — aí
o retorno mostra o XP (e o item).

**Quando há duas ofertas (o save *noite*).**
- **Mesa, 1280:** as duas à vista, 54 px cada — é a comparação lado a lado, e
  por isso o dinheiro tem de alinhar (ponto 4). Com a fila B presente (o
  acampamento, quando há o que curar) a segunda vai para a dobra — certo.
- **Telefone, 375:** teto 1, e a segunda está atrás de *"mais 1 oferta"*. A
  dobra aceita o substantivo por prop (`Dobra singular/plural`): **quando tudo
  o que ela esconde é trabalho, diz `mais 1 trabalho`** — o jogador sabe se
  vale abrir. Misturado, continua *ofertas*.
- **O desempate está errado num caso, e medi-o** (cena *sangue*: o save *noite*
  com *Sangrando*, −3 PV/turno): a 375 a única oferta à vista é o cartaz, e
  **o acampamento — a única coisa que estanca o sangue — está atrás de "mais 2
  ofertas"**. A régua de R15 (*ganha a fila A, o que fecha*) assume que a fila
  A fecha; **um cartaz oferecido não fecha** (atravessa a renovação do mural de
  propósito, e só cai quando outro é pregado por cima, `App.jsx:19493`). Régua
  proposta: **o que cura uma perda por turno passa à frente de tudo o que não
  tem janela.** É ordem de tela, não regra.

**O ganho a 375, em px** (a medir no depois; a conta é o alvo):

| | antes | alvo |
|---|---|---|
| contrato Godfrey | **113 px, 3 filas** | ≤ 86, 2 filas |
| contrato Moisés | 86 px, 2 filas, `quem` = *"a…"* | ≤ 86, 2 filas, sem *"a…"* |
| soleira fechada | 169 px (20,8 % de 812) | ≤ 142 — **uma linha de prosa volta à página** (Spectral 17/1,6 ≈ 27 px) |
| soleira aberta | 263 px | ≤ 236 |
| desvio do dinheiro entre as duas, 1280 | 8 px | 0 |

---

## 2 · O TEMPO — o que se lê num olhar

Medido: a linha é `📅 2 de Brumal · 22:00 🌙 🌱 Primavera` + `☀ ensolarado` —
**4 emoji na linha, 5 no painel** (com o `⛺`), **2 filas a 375** (40 px), e
**diz lua e sol na mesma caixa às 22:00** (o bug do motor, pedido em V3 §8).

O TEMPO é onde se decide **esperar** ou **acampar**. Num olhar, o jogador
precisa de: **que horas são e que luz está lá fora** (é contra isso que escolhe
1h ou 8h); depois o dia (o correio conta prazos em *dia N*); a estação só pesa
no inverno (renda, `estacaoDura`), e diz-se por palavra.

**A linha:** `[céu] 22:00 · 2 de Brumal · primavera`. O céu é **um** glifo
16 px: `luzDaHora` escolhe entre as quatro luzes; o clima **substitui-o só
quando muda o céu** (chuva, neve, névoa, tempestade) e aí também entra a
palavra. Céu limpo não se escreve — *o sistema não fala do que não muda nada*,
e o *"ensolarado"* às 22:00 deixa de chegar à tela (o pedido ao sistema fica
aberto: o motor continua a pensar errado). Contas: ~245 px a 375 → **1 fila**
(hoje 2). `⛺` → `descanso` (tent), que já está na tabela.

**E o que o jogador não lê e devia (0 px):** cada botão de esperar leva, por
baixo do número, **o céu onde vai acordar** — `luzDaHora(hora + h)`, glifo 12
dentro do mesmo alvo de 48 (12 + 16 de letra + 2 cabem em 48). A partir das
22:00: `1h`/`2h` lua, `6h` madrugada, `8h`–`12h` sol… `24h` lua outra vez. **É o
veredito antes do clique do esperar**, e poupa uma conta de cabeça (somar
horas módulo 24 e saber a que luz dá). Esperar **não** anda prazos (só a noite
dormida tiqueia, `App.jsx:20604`) — nada mais a avisar ali.

---

## 3 · `📕 X: guardada`

**Diz:** *pus esta magia de lado; ficam 2 de 3 lugares ocupados.* É a
confirmação de um toque **meu**, no acampamento, e o número entre parênteses é
a única parte útil (quantos lugares tenho livres). **Não é recusa**: com o
ladrilho oco e a razão a cinza, lê-se *proibida* — o mesmo defeito do livro
fechado vermelho da gaveta (V3 §5).

**Tom: Neutro, glifo `faisca`**, exactamente como *preparada*. As duas diferem
pela palavra e pelo número que anda — basta. **As outras três falas `📕`
(`:14155`, `:18648`, `:18651`) são recusas de verdade** (fora do acampamento,
teto cheio, magia não preparada) e ficam no Impedido. Por isso o conserto é
**na fonte, uma linha**: `:18654` escreve sempre `📖`. A tabela continua a
dizer `📕` = *a magia não pode*.

## 4 · *"Novo arco iniciado"*

**Confirmo: sai do registo.** `⚙` + *"Novo arco iniciado"* é a máquina a relatar
uma troca de configuração. **O que há de jogo na linha — o nome do arco e a
promessa de género — não se perde**: o jogador escolheu-o no Diário (`painel-diario.jsx:157`),
e o cartão *Arco da campanha* muda **no mesmo sítio e no mesmo instante** do
toque (lê `historia.estrutura`). A continuidade na ficção é do Mestre, que já
recebe a nota para *costurar a transição* (`App.jsx:20680`). A linha era um
eco, fora do lugar onde se olha.

*De passagem:* mudar de arco é o maior momento de rumo que o jogo tem, e hoje
é um botão de 10 px. Merece a cerimónia de V2 (a abertura grande na primeira
voz do Mestre depois da troca) — fica para V2, não gasto V3c nisto.

## 5 · `🔮` no interrogatório dos mortos

- **`:13778` e `:13785` — certo.** O assunto é a magia (*Falar com os Mortos ·
  Goblin: restam 2 perguntas · −3 PM*); o PM é custo, e o custo diz-se por
  palavra. `faisca` está bem.
- **`:13774` — errado.** `🔮 ${r.motivo}` é **recusa** (*"pergunte alguma
  coisa"*, *"o cadáver já respondeu as cinco perguntas"*, `grimorio.js:478–481`)
  e sai Neutro. Deve sair Impedido com `faisca`: o prefixo é `📕`.
- **Dois `🔮` que não são magia**, e é a mesma cara com dois sentidos:
  `:17919` põe `🔮` **na boca do jogador** (`{ autor: "jogador" }` — a voz dele
  não leva carimbo, V3 §2) e `:23492` põe `🔮` no **enigma** da masmorra (*Tentar
  o enigma de novo*), que não é magia — leva o glifo da sala de enigma, o
  mesmo do mapa da masmorra.

## 6 · Um resto de V3 que está no ar agora (não é pergunta tua, mas vi-o)

O conserto 1 de V3b (`:16338`, a notícia do mural sempre `📋`) vale para
**falas novas**. **As que já estão nos saves** guardam o ícone do molde: no save
*noite*, *"Olga da Maré tem um trabalho no mural."* aparece **sem ladrilho**
(`🆘` não está em `ASSUNTO_DO_EMOJI`). Leve e da tabela: `🆘 🧹 📦 💌 🔦` →
`trabalho` (nenhum tem outro uso em `App.jsx`: 0 ocorrências). `🏹 🔎 🛡` têm
outros usos e ficam como estão — o resíduo desses três desce com o tempo, à
medida que o histórico rola.

---

## 7 · O protocolo da prova jogada de V3c

**Montagem.** *Antes* = HEAD de hoje (`base.mjs` já corrido — os números acima
são dele); *depois* = a árvore com V3c. Chrome headless, perfil temporário,
`/api` cortado, injecção com o jogo desmontado. **375×812 e 1280×800.**

**Cenas** (todas por injecção sobre os saves de V1):
1. **noite** tal como está — os dois contratos, soleira fechada e com a dobra aberta.
2. **sangue** — noite + *Sangrando*: onde fica o acampamento a 375.
3. **aperto** — noite com o prazo do Godfrey a 1 e o do Moisés a 2: o selo
   *esta noite* cheio e o *2 noites* âmbar, lado a lado com o folgado.
4. **favor** — um cartaz oferecido com `paga: 0`: o retorno não pode dizer
   *"sem moedas"* seco.
5. **dia** — uma oferta; O TEMPO às 08:00 (sol, sem clima).
6. **O TEMPO de noite** (22:00, lua) e **com chuva** (clima injectado): o céu troca, a palavra entra.
7. **registo** — seis falas injectadas: `📖 … preparada`, `📕 … guardada`,
   `📕 fora do acampamento`, `🔮 … restam 2`, `🔮 pergunte alguma coisa`, e a
   do arco (a troca feita pelo Diário, a ver se cai no registo).
8. **masmorra**, se houver save com sala de enigma: o botão *Tentar de novo* e
   uma fala de interrogatório no mesmo ecrã.

**Mede-se:** filas e altura de cada oferta; altura da soleira; o topo do campo;
desvio do dinheiro entre as duas; emoji visíveis (soleira e O TEMPO: **zero**);
filas da linha do TEMPO; o tom de cada fala da cena 7; o `↓` flutuante a 375
contra o contorno de cada Porta. E **os cinco segundos da soleira**, antes e
depois na mesma foto: *qual paga mais? · quanto tempo tenho? · aceitar
custa-me alguma coisa? · há mais ofertas, e de quê? · há alguma a apertar?*

**Conta como "leu pior" — qualquer um devolve a etapa:**
- **a 375, uma oferta com mais filas do que hoje**, ou a primeira oferta a sair
  de vista (o fundo dela abaixo do topo do campo, 735);
- a soleira fechada a 375 **mais alta** do que 169 px;
- um *"a…"* ou qualquer `quem` truncado abaixo de um nome;
- o dinheiro das duas ofertas **desalinhado** a 1280;
- **o prazo lido mais tarde do que hoje quando aperta** (cena 3: o *esta noite*
  tem de ser o que primeiro salta, antes do dinheiro);
- um contrato com borda âmbar (tom `preco`) sem nada a sair da mão;
- o acampamento atrás da dobra com o herói a sangrar (se a régua do §1 entrar);
- qualquer emoji na soleira ou no TEMPO; lua e sol ao mesmo tempo;
- *guardada* no tom Impedido, ou uma recusa no tom Neutro;
- **o mesmo glifo com dois sentidos no mesmo ecrã** (`faisca` = magia e enigma);
- menos acertos nos cinco segundos do que o antes.

**O que não vou medir, e digo:** o tempo de leitura cronometrado — o mesmo
limite de V3 §9.

---

## 8 · A proposta ambiciosa — **esperar até a luz**

**Numa mesa de verdade ninguém diz *"espero oito horas"*. Diz-se *"esperamos
até o amanhecer"*.** O TEMPO fala em horas porque é a unidade do motor, e o
jogador faz a conta ao contrário na cabeça.

**O que muda para quem joga:** a fila de esperar passa a ser `1h` · `2h` (a
espera curta, a tocaia) e **as três luzes seguintes**, cada uma com o seu céu e
as horas que custa — às 22:00: **`até a madrugada · 6h`**, **`até o dia ·
10h`**, **`até o entardecer · 20h`**. As horas saem de `HORARIO_DA_LUZ` (tabela
que existe) e entram em `passarTempo(h)` como hoje: **nenhuma regra, nenhum
número novo, o prompt igual.**

**E o momento, que é o que faz isto ser lembrado:** o toque fecha O TEMPO e,
**enquanto o Mestre escreve** (a espera que já existe — 14,3 s medidos em R1),
a página **amanhece**: o ambiente (V1c, a luz da hora) e o céu da gravura
passam da noite à madrugada em ~2,4 s, e a hora da cinta anda. A espera morta
passa a ser o tempo a passar. **Nunca custa o turno:** corre dentro de uma
espera que já existe e nunca a prolonga; `prefers-reduced-motion` troca a luz
de uma vez; dois toques seguidos não enfileiram — vale a luz final.

**Prova:** contada — hoje, esperar até de manhã pede duas operações de cabeça
(somar módulo 24 e saber a que luz dá); depois, zero. Jogada — antes e depois,
*"quero estar na estrada ao amanhecer"*, quantos toques e quantas contas.
Convenção de mesa observada, não estudo: escrevo-a como tal.

**Peso:** muda o que o jogador toca no TEMPO (as horas finas 4h/6h/8h/12h/24h
cedem às luzes) — pela tabela antiga seria *pesado*; pela ordem de 23/09 é da
mesa, porque um commit revertido o desfaz inteiro. **Depende de V1c** (sem a
luz da página a mudar, fica só metade: os botões certos, sem o amanhecer).
O botão por luz nasce da `Oferta`/`Botao` que existem; o céu é o glifo de §2.

---

**Peso desta etapa:** médio no tema (criar e aposentar forma, reordenar a
soleira sem mudar o fluxo). O único ponto que toca a memória de quem joga é XP
e fama saírem da soleira — ficam a um toque, e o §1 diz porque não pesam na
decisão. **Nada aqui toca save, infra ou dado de jogador.** O par no Figma
(soleira 375/1280 com os dois contratos, antes e depois; O TEMPO) é do
`desenho`, que o está a fabricar; o momento é este documento.

---

## 9 · A prova jogada de V3c — o resultado (`jogo`, 25/09, manhã)

*Montagem, como o §7 manda: **antes** = worktree de `7efd121` servido na 5174
(cache do Vite à parte); **depois** = a árvore com V3c por aplicar (1→7), na
5173. Chrome headless, perfil temporário, `/api` cortado — **0 pedidos
cortados** nas três corridas. Injecção com o jogo desmontado. **375×812 e
1280×800.** Nove cenas: as oito do §7 mais o **acampamento aberto** (`acampado:
true`), e a fala de magia **feita a jogar** — dois toques no caderno do
acampamento (*Projétil Arcano*: guardar, preparar), não injectada. A masmorra
saiu do próprio motor (`gerarMasmorra`, sala atual = enigma por resolver, 1
tentativa). Script: `scratchpad/v3c-jogo/prova.mjs`; números em `prova.json` +
`prova3.json`; fotos em `scratchpad/v3c-jogo/fotos-prova/` (`antes-*`/`depois-*`).*

### Os critérios do §7, um a um

| critério (qualquer um devolve a etapa) | antes | depois | |
|---|---|---|---|
| oferta a 375 com mais filas do que hoje | Godfrey **113 px, 3 filas** · Moisés 86 | **86, 2 filas** · 86, 2 | passa |
| primeira oferta fora de vista (fundo > 735) | fundo 662 | fundo 662 | passa |
| soleira fechada a 375 > 169 px | 169 | **142** (−27: uma linha de prosa volta) | passa |
| soleira aberta a 375 (alvo ≤ 236) | 263 | **235** | passa |
| `quem` truncado abaixo de um nome | Moisés: **18 px, "a…"** | **182 px, "assina Olga da Maré" inteiro**; Godfrey 182 px, "assina Nyla Rompe-Escu…" (o nome lê-se) | passa |
| dinheiro desalinhado a 1280 | **8 px** (965 × 973) | **0 px** (moeda em 1004 nas duas; número acaba em 1047 nas duas) | passa |
| prazo lido mais tarde quando aperta (cena 3) | `prazo 1 noites` âmbar 600, **igual ao folgado** (e com erro de concordância) | `⌛ 1 noite` e `⌛ 2 noites` âmbar; as folgadas azul `mundo` | passa, por pouco — ver nota 1 |
| contrato com borda âmbar sem nada a sair da mão | **2 de 2** | **0 de 2** (azul Convite); o acampamento, que custa uma noite, segue âmbar | passa |
| acampamento atrás da dobra com o herói a sangrar | atrás de *mais 2 ofertas* | **igual** — a régua do §1 não entrou (`v3c-desenho.md` §5 adiou-a) | não se aplica; o defeito continua aberto |
| emoji na soleira | `◉` em cada oferta | **0** | passa |
| emoji no TEMPO | linha 4, painel **5** (`⛺📅🌙🌱☀`) | **0 e 0** | passa |
| lua e sol ao mesmo tempo | `🌙 … ☀ ensolarado` às 22:00 | glifo `noite`, sem palavra de clima; com chuva: `noite` + *chuva* | passa |
| *guardada* no Impedido | Impedido (ladrilho oco, frase `inkDim`) — **ao vivo** | **Neutro** (cheio, `faisca`, frase `inkMeio`) — ao vivo, igual a *preparada* | passa |
| recusa no Neutro | *"pergunte alguma coisa"* Neutro | **Impedido** (oco, `faisca`); *"isso se arruma no acampamento"* Impedido nos dois | passa |
| o mesmo glifo com dois sentidos no ecrã | `🔮` = enigma (×2 no painel) e magia (registo) | `faisca` só para magia; o enigma perdeu o `🔮` do botão (o *"Você está em: 🔮 Enigma"* fica — ver M1) | passa |
| menos acertos nos cinco segundos | **2 de 5** | **4 de 5** | passa |

**Os cinco segundos** (foto *noite* a 375, fechada e aberta; *aperto* para a
quinta):

| pergunta | antes | depois |
|---|---|---|
| qual paga mais? | sim (com a dobra aberta) | sim — e na mesa em coluna |
| quanto tempo tenho? | sim | sim |
| aceitar custa-me alguma coisa? | **não** — borda âmbar + `prazo` âmbar negrito lê-se *preço* | **sim** — nada âmbar à direita, borda Convite |
| há mais ofertas, e de quê? | *quantas* sim, *de quê* não | igual (*mais 1 trabalho* não entrou) |
| há alguma a apertar? | **não** — tudo âmbar sempre, é preciso ler cada número | **sim** — só o que aperta é âmbar |

**Nota 1 — o meu protocolo estava errado num ponto, e corrijo-o.** Esperei
*"esta noite"* cheio com prazo 1. A tabela `APERTOS` (`gravura-da-cena.js:70`)
enche só com **0**, e uma oferta com prazo 0 não tem janela (`m.prazo > 0 ? … :
null`): **na soleira o selo nunca enche**, e a gradação de uma oferta é
folgado (azul) / a apertar (âmbar). Está certo — é a regra da cinta, uma cara
só. O *"por pouco"*: a 375 o selo passou da esquerda da fila (x 29) para o fim
dela (x 294), logo é lido *depois* do dinheiro pela ordem da vista; o que o
salva é ser **a única tinta âmbar da fila**, com a ampulheta. Jogado: no par
*aperto* o `1 noite` salta antes do `140`; no antes nada saltava, porque tudo
saltava. Não peço conserto; se um dia se quiser mais, é peso 600 no `apertar`
do selo — forma do `desenho`, e mexe na cinta também.

### As quatro coisas que o `oficial` não viu

**1 · A masmorra** (a sala do enigma, 1 tentativa). Emoji no painel **13 → 4**:
saíram `🕳 🕯 👁 🔎 ↩ 🏃` e os dois `❔` (agora `desconhecido`), e o `🔮` do
*Tentar as contas de novo*. **Ficam quatro, e todos vêm de tabela do motor
impressa ao lado do seu próprio rótulo:** *"Você está em: **🔮** Enigma"*
(`ICONE_SALA`, `App.jsx:23458`) e **🐢** *Cauteloso* · **🚶** *Normal* ·
**🏃** *Apressado* (`r.icone`, `App.jsx:23466`). A §5 de V3c do `desenho` diz
*"um rótulo não leva glifo que diga o que ele diz"* — e estes quatro são isso.
O `teste-v3-glifos` §10.5 passa porque lê literais no código, não o ecrã; a
frase *"masmorra sem emoji"* do `v3c-desenho.md` §2.5 **não é verdade no ecrã**.
Não é regressão (é menos de um terço do antes) — é uma frase que o diário não
pode repetir sem o M1. A interrogação no mesmo ecrã: `restam 2 perguntas`
Neutro/`faisca`, `pergunte alguma coisa` Impedido/`faisca` — certo.

**2 · O acampamento aberto.** Emoji **6 → 0** (`⛺ 🩹 🩹 🌙 🔥 🎒`); 6 glifos
desenhados; altura igual (914 a 375, 532 a 1280) — nada cresceu. As três
saídas dizem-se pelo nome e pelo que cobram; lê-se igual e mais limpo.
*De passagem:* a recusa *"isso se arruma no acampamento — monte acampamento
(**⛺**) …"* (`acampamento.js:327`, território do sistema) aponta agora para
um desenho que **já não existe em tela nenhuma** — o botão do TEMPO é o glifo
`descanso`. Pedido ao sistema (P1, abaixo).

**3 · A fala de magia, feita a jogar** (dois toques no caderno do acampamento,
375 e 1280). *"Projétil Arcano: guardada (1/3)."* → ladrilho **cheio**, fio
`line` (53,47,84), `faisca`, frase `inkMeio` (195,183,163) — **idêntica** a
*"preparada (2/3)"*. No antes a mesma fala saía **oca, a cinza** — lia-se
*proibido* a cada arrumação. Acertou.

**4 · A seta do fim contra a Porta "Mural", a 375.** Medido com a Porta posta à
altura da seta:

| | antes | depois |
|---|---|---|
| seta | x 243–291 | x 303–351 |
| sobre a coluna da prosa | 48 px, **no meio das linhas** | 27 px, **no fim delas** |
| sobre a caixa da Porta | 48 px | 21 px |
| **sobre o texto da Porta** | **48 px** (*"se lê"*, *"precisa."* tapados) | **0 px** (o texto acaba em 301, a seta começa em 303) |
| mesa, 1280 | 0 | 0 |

**Lê melhor do que o antes, não pior.** Os 21 px são o `padding` direito (12)
e o fio da Porta: some a ponta do contorno, nenhuma letra. **Não recomendo o
`max-width`**: para deixar livres os 48 px + margem, a Porta a 375 teria de
parar em ~264 px de largura (hoje 293: x 31 → 324), e *"Mural — há um mural onde se lê o
que a região precisa."* passa a ter mais quebra — **pagaria em altura em toda
Porta, em todo turno, para limpar uma sobreposição que só existe enquanto o
jogador está a reler para cima** (a seta só nasce a mais de 240 px do fim).
Ganhar o caso raro pagando o comum é a troca errada (a mesma régua de R5d).

### O que mudou para quem joga, em número

- **Soleira a 375:** 169 → **142 px** fechada (+1 linha de prosa no ecrã
  principal, todo turno com contrato), 263 → **235** aberta; o contrato mais
  comprido 3 → **2 filas**.
- **O nome de quem pede:** 18 px (*"a…"*) → **182 px**, inteiro.
- **Comparar paga na mesa:** 8 → **0 px** de desvio.
- **Aceitar deixou de parecer caro:** contratos com tinta de preço **2 → 0**; o
  âmbar só aparece onde o prazo aperta.
- **O TEMPO a 375:** a linha **2 filas → 1** (40 → 18 px), o painel 347 → **325
  px**, emoji **5 → 0**, *"ensolarado"* ao lado da lua **→ nunca**; **7 de 7**
  botões de esperar dizem agora a luz onde se acorda (antes 0) — o veredito
  antes do clique chegou ao relógio.
- **Registo:** *guardada* deixou de se ler recusa; a recusa do morto deixou de
  se ler neutra; *"Novo arco iniciado"* **1 → 0** linhas (a troca feita pelo
  Diário, ao vivo); a notícia do mural nos saves velhos ganhou ladrilho
  (`trabalho`), antes vazio.
- **Masmorra 13 → 4 emoji** (→ 0 no estado medido, com M1); **acampamento 6 → 0**.
- **Cinco segundos: 2 → 4 de 5.**

### Consertos

**M1 — recomendado neste commit, se o bastão ainda estiver na mão do `oficial`**
(`App.jsx`, 2 trocas, 0 linhas a mais, **nenhum teto a mexer**: são consultas a
tabela, não literais, e o D5h não as conta):

| âncora (texto exato) | fica |
|---|---|
| `` `Você está em: ${ICONE_SALA[salaAtual?.tipo] \|\| ""} ${ROTULO_SALA[salaAtual?.tipo] \|\| "—"}`` | `` `Você está em: ${ROTULO_SALA[salaAtual?.tipo] \|\| "—"}`` |
| ``title={`${r.desc} · ${r.minutos} min por sala`}>`` + a linha seguinte `{r.icone} {r.nome}` | a mesma âncora, e a linha seguinte `{r.nome}` |

A segunda **tem de levar o `title` como âncora**: `{r.icone} {r.nome}` aparece
também em `:2677` (o ritmo de viagem, na Gestão), que não é desta etapa.
Sem o M1, a etapa sobe na mesma e o diário diz *"masmorra: 13 → 4 emoji no
ecrã"*, não *"sem emoji"*.

**M2 — do `desenho`, não urgente:** a passagem **já visitada** ainda imprime
`ICONE_SALA` (`App.jsx:23504`, `sd.visitada ? (ICONE_SALA[sd.tipo] || "·")`),
ao lado do seu rótulo (*Combate*, *Tesouro*…). Não aparece no estado medido.
A forma é dele (proponho a marca `IconeCheck` a `inkDim` — *já pisei aqui* —
ou nada). Se M1 e M2 entrarem, `ICONE_SALA` sai do import do `App.jsx`; o
export continua com leitores (`sonda-masmorra`, `teste-v3-glifos`).

**P1 — pedido ao sistema** (`mente/pedidos-ao-sistema.md`): `acampamento.js:327`,
tirar *" (⛺)"* da frase de `podeArrumar` — o desenho a que ela aponta saiu do
ecrã em V3c.

**Seta do fim:** nenhum.

**Aberto, e não é desta etapa:** o acampamento atrás de *"mais 2 ofertas"* com
o herói a sangrar, e *"mais 1 trabalho"* — ambos adiados pelo `desenho` para a
próxima etapa da soleira; a medida continua a do §1.

### Veredito

**Sobe.** Nenhum critério do §7 devolve a etapa: todas as linhas da tabela
passam com número, menos uma (o acampamento a sangrar), que não se aplica
porque a régua não entrou.
**Com o M1 no mesmo commit** se o bastão ainda estiver na mão — duas trocas,
zero teste a mudar —; sem ele, sobe igual e com a frase da masmorra corrigida
no diário. Joguei o antes e o depois nos nove cenários: **o depois é jogo** —
a soleira diz o que distingue as duas ofertas e cala o que é igual, o relógio
diz a luz de cada espera, e arrumar o caderno deixou de soar a *não podes*.
