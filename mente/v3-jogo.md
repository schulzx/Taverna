# V3 · os ícones, contados a jogar (`jogo`, 24/09, noite)

*Paga R8 na tela principal. O `desenho` fabrica a família em paralelo (Figma
`126:5`, traço Lucide); aqui está o que cada emoji diz a quem joga, o que fica,
o que sai, e em que ordem.* **Nada daqui é código; nenhuma regra nova.**

---

## 0 · Como se contou

- **Lido:** `App.jsx` inteiro por script (631 emoji, 115 distintos — 63 são do
  `godLinha`, consola de depuração, e **296 linhas são falas do sistema**
  empurradas para o registo), os painéis, e as tabelas do motor que o ecrã
  pinta (`condicoes.js`, `testes.js`, `ofertas.js`, `selo-de-estado.js`,
  `calendario.js`, `relogios.js`, `reacoes.js`, `pericias.js`).
- **Jogado:** Chrome headless, perfil temporário, os saves de V1 (*dia* e
  *noite*, Ilsa, maga) injectados com o jogo desmontado, a **1280×800 e
  375×812**; mesa → gaveta `✦` → O TEMPO → cada aba (mesa) / o alforje
  (telefone). Script em `scratchpad/v3-jogo/jogar.mjs`, fotos ao lado. Nenhum
  save de jogador tocado.
- **O número jogado:** numa campanha **nova, sem luta, sem condição, sem
  masmorra**, o jogador vê **57 emoji distintos** a um toque da mesa; **43 das 75
  ocorrências estão abaixo do piso de 12 px**, seis a 9 px. Um veterano vê mais.
- **A língua da pessoa** (`126:5` e `47:2`): **zero emoji**. Traço Lucide, três
  tamanhos — **24** no trilho, **18–20** num ladrilho de 40 (os verbos da
  batalha), **14–16** em linha (o lugar, o ouro, o PM) — e **o ladrilho de 36 com
  glifo de 16 à esquerda de cada linha do registo** (`47:2`, `135:640`). É esse
  ladrilho que dá casa às pílulas do sistema.

---

## 1 · O achado que mais vale: uma coisa, várias caras

| a coisa | as caras de hoje (onde) | quantas |
|---|---|---|
| **o prazo** | `SeloDePrazo` com a areia (cinta, `ui.jsx:1572`) · texto âmbar nu *"prazo 4 noites"* (a soleira, todo turno com oferta) · `⏳ prazo:` (Diário `painel-diario.jsx:95`, Mural `App.jsx:2207`) · `✉️ … prazo: dia N` (Correio `:2401`) | **4** — **e a certa já está construída**: só a cinta a usa |
| **o dinheiro** | `◉` texto da fonte (90× no `App.jsx`, a soleira, o Mural, a Guilda) · `IconeBolsa` desenhado (cinta) · `💰` (`:19235`) · `coins` na v3 | **4** |
| **a magia** | `✦` texto (o botão da gaveta, `:24099`) · `✧` (efeitos na cinta, `:1400`) · `IconeFaiscas` (cerimónia, menu) · `📖` (caderno, gaveta e ficha) · `✨` (Abençoado) · `sparkles` na v3 | **6** |
| **o dado** | `🎲` (o teste pendente `:24123`/`:23029`, as rolagens, `selo-de-estado.js:96`) · `IconeD20` (a espera do Mestre `:23332`) · `IconeDado`, um **d6** (criação `:4256`, menu `:5098`) · o texto *"Rolar d20"* · `dice-6` na v3 | **5** |
| **não pode** | `⛔` (**58 linhas**) · `🔒` (gaveta `:175`, talentos, rito) · `✋` (`:13864`, `:17118`) · `⏳` (*"já usou sua ação"* `:12625`) · `⚠` | **5** |
| **há trabalho no mural** | `📋` (`:10214`) **ou** o ícone do molde (`:16338`: `🏹 🧹 📦 💌 🔦 🔎 🆘 🛡`) · `📌` · `✍` · `🗡` · `📜` (contrato aceito `:19585`) | **até 14** para a mesma notícia. O jogador viu `🆘` a noite inteira: lê-se *emergência*, era *um recado* |
| **o dano** | `⚔` (golpe) · `⚡` (dano no inimigo `:10610`, oportunidade `:15828`) · `💢` (batida, fogo amigo `:13052`) | **3** |
| **a exaustão** | `🥱` (registo `:7918`) · `😵` (a condição) · `😩` (ficha `:2660`, marcha forçada) · `🌙` (aviso de sono `:7920`) | **4** |
| **o tempo passa** | `🕐` (esperar `:15595`) · `📅` + `🌙` + estação + clima (O TEMPO `:1699`, **quatro emoji numa linha**) · `⏳` | **3+** |
| **o lugar** | `📍` (mapa, planta ×5) · `🧭` · `🗺` · `🏘` (palco) · `map-pin`/`compass` na v3 | **4+** |

**E o avesso, que dói igual — uma cara, várias coisas:**

| a cara | o que ela diz hoje |
|---|---|
| `🎲` | teste pendente · rolagem registada · *vantagem* · *desvantagem* · a preferência "rolagens à vista" · a fala do jogador *"Peço um teste"* · *Encarar* (ascensão) — **7** |
| `📖` | Códex · *Deduzir* (`testes.js:26`) · magia preparada · "do caderno" · *Lendo o mundo* — **5** |
| `⏳` | prazo · recarga · ritual · *"a mesa não anda sem o Mestre"* (`:8069`) · *"já usou a ação"* — **5** |
| `⚔` | golpe · combate · **escolher caminho** (`:2595` — a classe não é luta) · guerra · slot de arma · *Aparar* — **6** |
| `🛡` | Protegido · Escudo Arcano · o contrato de **escolta** · slot · *"fica com 1 PV"* · Vitórias — **6** |
| `☠` + `IconeCaveira` | a morte · **a condição ruim sem ícone** (`:1394`) · o poder do chefe · **a aba Códex** (`GLIFO_DA_ABA`) |
| `⚡` | dano · **poder** (`:1861`, `:20883`) — o número do herói e o golpe têm a mesma cara |
| `🔥` · `💧` · `💪` | queimando/descanso curto/festa/fúria · água/Enfraquecido · Fortalecido/*Forçar* |
| `IconeEspada` | **a aba Gestão** — e a espada é, na v3, o verbo *Atacar* |
| `IconeLosango` | a Ascensão — irmão desenhado do losango do **PM** |
| a "coroa" da v3 | é um **`trophy`** (`126:145`). O troféu diz *venceu*; a coroa diz *este é você* (§5 de `v1-jogo.md`). E o troféu vai fazer falta aos Títulos |

*Um glifo que significa sete coisas não significa nenhuma — o jogador lê a
palavra ao lado e o glifo é ruído. A família nova só paga R8 se cada glifo
disser uma coisa.*

---

## 2 · A proposta: o jogo fala com vinte glifos, e cada um diz uma coisa

É a lei que já estava escrita e ninguém aplicou fora do chat — **o glifo nomeia o
ASSUNTO, nunca o veredito** (`formas.md`, *O glifo do chat…*). Os nomes são os do
Lucide, a língua da v3; a forma é do `desenho`.

| # | assunto | glifo | engole | nunca mais quer dizer |
|---|---|---|---|---|
| 1 | o dado | **d20** (`IconeD20` existe; o `dice-6` da v3 corrige-se) | `🎲` · o d6 do teste | preferência, espera |
| 2 | o golpe, o dano | `swords` | `⚔` `⚡`(dano) `💢` | caminho, guerra política |
| 3 | a defesa | `shield` | `🛡` quando é defesa | escolta, vitória |
| 4 | a magia | `sparkles` (`IconeFaiscas`) | `✦` `✧` `✨` `📖`(caderno) | — |
| 5 | o PM | `diamond` (`IconeMana`) | `◆` | Ascensão |
| 6 | a vida | `heart` (`IconeVida`) | `🩹` `🩸` | — |
| 7 | o dinheiro | **um só** — `coins` ou `IconeBolsa`, o `desenho` escolhe | `◉` `💰` | — |
| 8 | o prazo | ampulheta com areia (`SeloDePrazo`, a peça inteira) | `⏳` de prazo, o texto âmbar nu | recarga, espera |
| 9 | a hora, o tempo que passa | `clock` | `🕐` `📅` `⏳` de turno/recarga | prazo |
| 10 | onde estou | `map-pin` | `📍` | — |
| 11 | para onde vou | `compass` (é o Mapa na v3) | `🧭` `🗺` | — |
| 12 | descansar | `tent` | `⛺` | — |
| 13 | o perigo mortal | `skull` (`IconeCaveira`) | `☠` `💀` `⚰` | **Códex** (vai a `amphora`), condição ruim |
| 14 | aviso — reaja | `triangle-alert` (`IconeAviso`) | `⚠` | recusa |
| 15 | trancado até… | `lock` | `🔒` | — |
| 16 | procurar, perceber | `search` | `🔎` `🔍` `👁` | — |
| 17 | trabalho, contrato | `scroll-text` | `📋` os 9 moldes `📌` `✍` `🗡` `📜`(contrato) | crónica |
| 18 | ouvir o Mestre | `volume-2` / `pause` | `🔊` `⏸` | — |
| 19 | a favor · contra | `chevrons-up` / `chevrons-down` | condição boa/ruim, vantagem/desvantagem | — |
| 20 | o seu herói · a luz | `crown` · `sunrise` `sun` `sunset` `moon` (+ `cloud-rain`/`-snow`/`-fog`/`-lightning` quando o tempo muda o céu) | a coroa-troféu · `🌙 ☀ 🌤 🌱 📅` | — |

**`⛔` sai sem substituto.** A recusa já tem forma (*Impedido*, `formas.md`
"não pode agora", fechada em D4) e as 58 frases já dizem o porquê. `⛔` é o
veredito a gritar por cima do assunto. Na tabela de tradução (§4) `⛔` não
vira glifo: **vira a forma** — a pílula passa ao tom *Impedido*, sem ícone, e a
frase (*"Bola de Fogo custa 3 PM — você tem 1"*) diz o resto. Onde o sítio
souber o assunto, pode pô-lo (o losango do PM aqui) — é melhoria de V3b, não
condição.

**Os três grupos do veredito:**
- **gameplay → ganha um dos vinte**: o que muda uma decisão ou distingue um
  estado (tabela acima).
- **enfeite → sai, e a palavra fica**: as 18 perícias (`painel-ficha.jsx:130` —
  o `★`/`★★` ao lado já diz o treino), `🐢🚶🏃` (as palavras estão lá), `🌿`,
  `😩` da marcha, `🎭` antecedente, `📣` fama, `🧠`, os slots `⚔🛡🧥`, `🥖💧🕯🎒`
  (viram *Rações 10 · Água 10 · Tochas 5 · Kit*), `⚖` recalibrar, `🎲` da
  preferência, `📅` e a estação, os contadores do Códex (`☠ Abates`…), as
  abas `🌍 🏘 🏳 🙏`, `🌫`, `💾`/`📜` de exportar, as três saídas do
  acampamento (`🌙🔥🎒` — o verbo é de 17 px e o preço está escrito), **e todo
  emoji na boca do jogador** (`🎲 Peço um teste` `:17707`, `📋 Pego o cartaz`
  `:19584`, `📜 Declaro` `:16563`): a voz dele não leva carimbo do sistema.
- **conteúdo → fica em V3**: a identidade de uma coisa do mundo, escrita por
  tabela — os lugares do Mapa e da planta (`comodos.js`, `arredores.js`), os
  Títulos, as criaturas do Bestiário, templos, festas, tipos de missão e de
  carta. Vivem **dentro** dos painéis e voltam quando a pessoa redesenhar essas
  telas (V·Mapa, V·Códex). **Na mesa não sobra nenhum**: o único que lá aparecia
  (o molde na pílula do Mural) é notícia, e vira `scroll-text`.

---

## 3 · O censo, por onde o jogador olha

**A. A mesa, sempre à vista** (medido: 8 emoji distintos no save *noite*)

| onde | hoje | diz | quando | veredito |
|---|---|---|---|---|
| pílulas do sistema (`BlocoSistema`, `App.jsx:3833`) | ~80 prefixos em 296 falas | o que o mundo fez | **todo turno**, 0–3 | **gameplay** → o glifo do assunto no ladrilho de 36 da v3; `⛔` sai |
| a dobra das rolagens (`:3871`) | `🎲` em cada linha | as contas | quando se abre | gameplay → d20 |
| `Voz` (`:23327`) | `🔊`/`⏸`/`…` | ouvir | **uma por mensagem** — o glifo mais repetido do ecrã | gameplay → `volume-2`/`pause` |
| chips da cinta (`chipsDoEstado`, `:1390`) | 22 emoji de `condicoes.js`, `✦`/`☠` de reserva, `✧`, `🎲 vantagem`, `⛔ sem ação` | o que te ajuda e o que te pesa | todo turno com condição | **gameplay** → só `chevrons-up/down` + `sparkles`; os 22 saem (o nome está escrito) |
| cinta (`:1629`) | `⚠ não guardou` | a tua vida não está salva | raro, grave | gameplay → `IconeAviso` |
| o teste pendente (`:24123`, `:23029`) | `🎲 Teste de…` + *"Rolar d20"* | o preço antes do clique | **todo teste** | gameplay → d20 (é o dado de V6) |
| a gaveta (`:24099`) | `✦` texto | a magia | sempre à vista | gameplay → `sparkles` |
| a soleira (`Oferta`, `ui.jsx:966`) | *"prazo 4 noites"* nu, `◉ 140` | o que custa e paga | todo turno com oferta | gameplay → `SeloDePrazo` + o glifo do dinheiro |
| cabeçalho velho (`:1263`, `palco.js:127`) | `🏘`, `🌙 noite · ☀ ensolarado` | onde, que luz | início do registo | **sai com V5** — não gastar V3 nele |

**B. A um toque**

| onde | veredito |
|---|---|
| **O TEMPO** (`:1670`, `:1699–1700`) | `⛺` → `tent`; a linha `📅 2 de Brumal · 22:00 🌙 🌱 Primavera` + `☀ ensolarado` (**cinco emoji**) → **um glifo só, o céu** (a luz da hora, trocado pelo clima quando o clima muda o céu) e as palavras |
| **a gaveta** (`painel-habilidades.jsx`) | `📖`/`📕` (`:163`) **carregam o estado** preparada/guardada → ver §5; `⏳ 2t` (`:88`) → `clock`; `🔒` (`:175`) → `lock`; o selo `📖` "do caderno" (`:90`) → sai |
| **Gestão/Ficha** (`App.jsx:2492–3680`, `painel-ficha.jsx`) | enfeites da §2 saem; `⚗` essência é **moeda** → pede glifo ao `desenho` (é o 21.º, e é pedido, não invenção); `⚒` desmontar é botão só-glifo que **destrói** (`:3407`, `:3563`) → verbo escrito, como `formas.md` já manda; `😊😐😠` (`:3159`) → palavra ao lado do número; `⚡ poder` → a palavra *poder* |
| **Diário** | `⏳ prazo` → `SeloDePrazo`; `🌍` `🌱` → saem; ícones de missão → conteúdo |
| **Bolsa** | `⚗` `⚒` como acima |
| **Mapa** / planta | `📍` (você está aqui, ×6) → `map-pin`; `🧭 Viajar para` → `compass`; o resto é conteúdo |
| **Códex** | contadores → saem; a ameaça do Bestiário (`painel-codex.jsx:103`, `🐀→🐉`) **carrega estado** → §5 |

**C. Na mesa, quando se está lá** — masmorra (`:23450–23519`: `🕳 🕯 🗝 👁 🔎 🔮 🔒 ❔ ↩`),
acampamento (`:23531–23693`), raid (`:23407–23434`). Mesma tabela; `🕯` tochas
é recurso contado e pede glifo próprio ao `desenho` (22.º), ou `flame` se a
fogueira sair do acampamento como proponho.

---

## 4 · A ordem

**O que decide a ordem é uma escolha de construção**, e é minha porque muda o
que V3b custa: **o motor continua a escrever as frases que escreve; o ecrã
traduz.** Uma tabela `emoji → assunto` (lei da casa: se é número/sentido, é
tabela) e **um** componente de linha que troca o prefixo pelo glifo. As 296 falas
do sistema, o `selo-de-estado.js` e as tabelas do motor **não se tocam** — é o
território do sistema, e a fila dele está parada. V3b deixa de ser 300 sítios e
passa a ser uns dez.

**V3a — fora do `App.jsx`, `aprendiz`, agora:**
1. A família em `ui.jsx` (do `desenho`) **e a tabela de assuntos + a linha que
   traduz**, com a catraca: todo emoji que abre uma fala do sistema no
   `src/` tem entrada (ou está na lista de "sai"); glifo novo sem assunto não
   nasce.
2. `Voz` desenha o seu glifo quando não lho passam.
3. `Oferta`/`Soleira`: *"prazo N noites"* vira `SeloDePrazo`; o dinheiro vira o
   glifo. **É o maior ganho por linha de V3a — todo turno com oferta.**
4. A gaveta (`painel-habilidades.jsx`) — é a mesa a um toque.
5. `painel-diario`, `painel-ficha`, `painel-mapa`, `planta-cidade`, `painel-codex`
   — por esta ordem: primeiro o que carrega estado (prazo, ameaça), depois o
   que só enfeita.

**V3b — o `App.jsx`, `oficial`, com o bastão; por custo a quem joga:**
1. **`BlocoSistema` + a dobra** passam a usar a linha que traduz — *todo turno;
   296 falas por dois sítios.*
2. **`Voz`**: deixar de passar `🔊` (`:23327`) — *uma vez por mensagem.*
3. **`chipsDoEstado`** (`:1390`): devolve o sinal (a favor/contra/arcano) e não
   um emoji — *é o único estado vivo da cinta; distingue o que te ajuda do que
   te mata.*
4. **o teste pendente** (`:24123`, `:23029`) — *o veredito antes do clique*.
5. **`✦` da gaveta** (`:24099`) e **`⚠ não guardou`** (`:1629`).
6. **O TEMPO** (`:1670`, `:1699`).
7. Masmorra, acampamento, raid; a Gestão em `PainelLateral`; as falas do
   jogador sem carimbo (`:16563`, `:17707`, `:19584`); `GLIFO_DA_ABA` deixa a
   espada e a caveira (*o trilho inteiro é V7; isto é só não mentir até lá*).

---

## 5 · Onde o emoji carrega estado — o canal além da cor

Lei de R9: *nenhum acento carrega sentido sozinho*. Cada um destes tem de se
ler **em cinzento e em deuteranopia**.

| estado | hoje é carregado por | o canal que o glifo tem de ter |
|---|---|---|
| condição a favor / contra | a cor do chip e 22 caras | **forma** (`chevrons-up` × `-down`) → **enchimento** (contra = chip cheio) → cor |
| vantagem / desvantagem | a palavra, e o mesmo `🎲` | as mesmas setas + a palavra |
| efeito arcano | `✧` | `sparkles` — forma própria, não setas |
| o prazo | areia **só na cinta** | a peça inteira em todo o lado: **areia → palavra → enchimento → cor** (já é a ordem de R13) |
| magia preparada / guardada | `📖` aberto × `📕` fechado **vermelho** | **enchimento** (preparada = cheio + `check`) e a palavra *guardada*; o livro fechado vermelho lia-se *proibida* |
| perícia treinada | a opacidade do emoji | já tem `★`/`★★`: o emoji sai e nada se perde |
| a ameaça no Bestiário | o animal (`🐀🐺🐗🦖🐉`) | **pips 1–5** + a palavra (*fraco … lendário*): um rato e um lobo a 13 px não dizem ordem |
| ouvir | `🔊` × `⏸` (forma) + âmbar | já é forma; manter a forma como primeiro canal |
| guardado / não guardou | `✓` × `⚠` + verde/perigo | forma (`check` × `triangle-alert`) + palavra |
| sala da masmorra | `ICONE_SALA` / `🔒` / `❔` | forma (`lock` × `help-circle` × o tipo) |
| o seu herói | a coroa-troféu | **posição** (no seu retrato, em cada ecrã de sala) + `crown` |
| PV | comprimento + rosto *grave* + `tv-agonia` | intocado: o coração não muda, o arco é que fala (V4) |

---

## 6 · A prova jogada que vou cobrar depois de construído

**Montagem:** os saves *dia* e *noite* de V1 + **um save de masmorra** e **um com
condições** (a favor e contra ao mesmo tempo) e **um teste pendente** — se não
houver save com eles, uma volta real de 3 turnos (é pouca chamada). *Antes* =
HEAD de hoje num worktree; *depois* = a árvore. **375×812 e 1280×800.**

1. **A catraca, medida no DOM e não no código:** o `jogar.mjs` corre nos quatro
   saves e conta emoji visíveis. **Mesa: zero.** A um toque: só os de conteúdo da
   §2, listados por nome.
2. **Os cinco segundos**, antes e depois, na mesma foto: *quanto dinheiro tens?
   · há prazo, e quanto falta? · as três últimas linhas do sistema são sobre o
   quê? · estás sob algum efeito, ajuda ou pesa? · o que faz o botão ao lado do
   campo?* Conta quantas acertei.
3. **A leitura das pílulas:** doze falas reais do registo, embaralhadas; digo o
   assunto de cada uma. Antes e depois, cronometrado (três passagens).
4. **Cinzento e deuteranopia** sobre as fotos da cinta com condições e da gaveta.

**Conta como "leu pior" — e qualquer um devolve a etapa:**
- um glifo que **leio mais devagar** do que o emoji que substituiu, na 3.ª
  passagem (a 1.ª é aprendizagem e não conta);
- **o mesmo glifo com dois sentidos no mesmo ecrã** — o defeito que V3 veio pagar;
- um glifo abaixo de **12 px**, ou uma pílula que **passou a quebrar linha** a 375;
- um estado da §5 que em cinzento deixe de se distinguir;
- um controlo só-glifo **sem nome acessível**;
- menos acertos nos cinco segundos do que o antes.

---

## 7 · A proposta ambiciosa — **o glifo viaja**

Hoje o que se ganha aparece como uma frase no registo e, noutro sítio, um número
muda sem ninguém ver. **Com vinte glifos que dizem uma coisa cada, a mesma cara
aparece em três lugares: na promessa, no pagamento e onde fica guardado.** Liga-os
o movimento:

1. **A promessa** — a `Oferta` mostra o que custa e o que paga **em glifos**
   (`scroll-text` · ampulheta · moeda · `swords` se há luta à espera), o
   veredito antes do clique em forma de ícone, lido de relance.
2. **O pagamento** — quando o Mestre paga, a pílula que volta traz **os mesmos
   glifos**; e cada glifo de recurso **voa da pílula para o seu contador na
   cinta** (a moeda para a bolsa, o losango para o PM, o coração para o anel):
   **400 ms, sem bloquear nada**, o contador pulsa uma vez ao receber.
3. **Saída sempre:** `prefers-reduced-motion` → sem voo, só o pulso; dois
   pagamentos no mesmo turno voam juntos, não em fila; nada espera por animação.

**Porquê é jogo:** é a gramática de todo o jogo de cartas e de todo o roguelike
que a pessoa já jogou — o ouro que salta para o contador ensina, sem uma linha de
texto, **onde as coisas ficam** e **que aquilo foi teu**. *Convenção observada,
não estudo:* escrevo-a como tal. A prova é minha e é medida: nos cinco segundos,
*"quanto ganhaste neste turno?"* — hoje obriga a comparar dois números de
memória.

**Peso:** médio no tema (nenhuma regra, nenhum fluxo muda; a forma é do
`desenho`, o momento é meu). Só depois de V4 (os anéis são o destino do voo).

---

## 8 · De passagem — dois pedidos ao sistema (não são desta mesa)

- **A exaustão não fica.** No save *noite* o registo diz duas vezes *"Você está
  Exausto (desvantagem)"* (às 36 h e às 38 h) e a ficha exportada tem
  `condicoes: []`. **O ecrã promete uma condição que a regra não aplica** — e a
  cinta, honesta, não mostra chip nenhum. Leve (bug com prova).
- **Sol às 22:00.** O TEMPO diz `22:00 🌙` e `☀ ensolarado` na mesma caixa. O
  glifo único do céu (§2, n.º 20) esconde o defeito na tela, mas o texto
  *ensolarado* à noite continua a ser o motor a falar errado.

---

**Peso desta proposta:** médio (V3 inteira: criar e aposentar forma, sem mudar
fluxo). **Nada aqui é pesado.** O único ponto que toca a memória de quem joga é
`GLIFO_DA_ABA` perder a espada e a caveira — e o trilho muda de qualquer maneira
em V7.

*Todo número deste documento sai de um script no scratchpad
(`scratchpad/v3-jogo/`) ou da tela a correr. Nenhum sai de memória.*

---

## 9 · A prova jogada de V3 — o resultado (`jogo`, 25/09)

**Montagem.** *Antes* = `245dd3c` num worktree (5174); *depois* = a árvore com
V3b e V1b por commitar (5173). Chrome headless, perfil temporário, **todo pedido
a `/api` cortado** (cortados: 0 — nenhum saiu). Duas cenas por injecção com o
jogo desmontado: **(a)** o save *noite* de V1 + doze falas reais do sistema + uma
porta (`▸ Mural — …`) + *Sangrando*, *Abençoado* e o efeito *Bênção +1*;
**(b)** o save *dia* com um teste pendente (*Perceber, dif. 13*). As duas a
**1280×800 e 375×812**, e depois a gaveta aberta e uma habilidade armada.
Scripts `scratchpad/v3-jogo/prova.mjs` e `prova2.mjs`; 32 fotos em
`scratchpad/v3-jogo/prova/`.

**O que não medi e digo:** a leitura das pílulas **não foi cronometrada**. Um
cronómetro na minha mão não é comparável ao de um jogador, e escrevê-lo seria
inventar precisão. Contei o que se conta: **quantas das doze pílulas levam o
glifo do assunto certo**.

### 9.1 · Por critério

| critério | antes | depois | |
|---|---|---|---|
| emoji visíveis na mesa, cena (a) | 10 (1280) · 8 (375) | **1 · 0** — sobra o `🎲` do chip `vantagem` | **falhou por um** |
| emoji visíveis, cena (b) (teste pendente) | 1 · 1 | **0 · 0** — o d20 lê-se d20 | passou |
| pílulas com o glifo do assunto certo (12) | 11 (emoji um a um) | **7** · 1 é a forma *Impedido* · **4 erradas** | **falhou** |
| o mesmo glifo, dois sentidos, no mesmo ecrã | — | **`swords` = o dano no lobo e *"Nyla tem um trabalho"*** | **falhou** |
| a mesma notícia, várias caras | — | *"… tem um trabalho no mural"* ×3: **nada** (`🆘`), **espadas** (`🏹`), **pergaminho** (`📋`) | **falhou** — é o defeito que V3 veio pagar |
| glifo abaixo de 12 px | emoji a 9–12 | ladrilho 36 com glifo 16; chips com setas a 12 | passou |
| pílula que passou a quebrar linha a 375 | — | nenhuma (as mesmas duas quebram antes e depois) | passou |
| cinzento e deuteranopia (chips) | gota × faíscas | **setas para baixo × para cima + peso** — distinguem-se nas duas | passou |
| controlo só-glifo sem nome | — | nenhum novo | passou |
| cinco segundos (5 perguntas, cena a, 1280) | 3/5 | **4/5** — o botão ao lado do campo passou a dizer *magia* (as faíscas são as do chip *Bênção*); o `✦` a 12 px lia-se enfeite. Nos dois falha *"as três últimas falas são sobre o quê?"* (2 de 3: antes o `🕯`, depois a chama) | passou |

**As quatro erradas, uma a uma** (todas se consertam fora da regra):
1. `🆘 Olga … tem um trabalho no mural` → **sem glifo** (`🆘` não está na tabela).
2. `🏹 Nyla … tem um trabalho no mural` → **`swords`**. A origem é `App.jsx:16338`,
   que põe o ícone do molde na notícia.
3. `🕯 Ninguém do seu grupo está caído` → **`tocha`**. O `🕯` diz **três** coisas
   no `App.jsx`: a tocha (6 falas), **trazer de volta um caído** (`:10627`,
   `:13774–13799`, 5 falas) e **a fé** (`:9564`, `:20209`).
4. `📖 Você ainda não sabe essa magia de cor` → **lupa**. Das quatro falas `📖`
   do registo, duas são magia (`:14157`, `:18654`); a tabela manda-as todas para
   *procurar*.

**E um que não é erro mas lê pior.** O *Impedido* é um **quadrado vazio com
contorno** (`Projétil Arcano custa 2 PM — você tem 1`), e lê-se como caixa de
marcar por preencher. Antes, o `⛔` dizia *não* antes da frase. **Corrijo-me:**
na §2 escrevi que o `⛔` saía sem substituto. Construído, o vazio é pior do que
uma marca. **A forma precisa de uma marca**: `ban` (o círculo cortado), em
`inkDim`, dentro do ladrilho. É a marca da forma, não um assunto.

**Custo de altura, 1280:** cada fala do sistema passou de **38 para 44 px**
(+6, +16 %). Num turno de três falas são 18 px. A 375 o custo é **zero**: as
pílulas antigas já quebravam em duas linhas e o ladrilho cabe na mesma altura.
Aceito o custo, porque é o preço da coluna de assuntos que a v3 desenhou (`47:2`).

### 9.2 · As quatro perguntas do `oficial`

1. **A Porta — lê pior, e é de V3b.** Antes era uma **pílula com contorno de
   1 px, fundo `paginaAlta`, `rounded-full`, centrada**: um botão, sem dúvida.
   Depois: **sem contorno, sem fundo, largura inteira**, e a seta fica a
   **83 px do fim da frase a 1280** (13 px a 375). A 375 ainda se lê como
   ligação; a 1280, a linha âmbar a negrito sem glifo no ladrilho parece uma
   frase realçada, e a seta solta parece de outra coisa. **Conserto no estilo
   da v3:** a seta **entra no ladrilho**, à esquerda (o assunto de uma porta é
   *ir*, e a coluna de glifos fica inteira). A linha ganha **contorno
   `T.lineStrong`, raio `LADRILHO.raio`, e largura à medida do texto** (`w-fit`,
   não `w-full`). Zero px de altura a mais.
2. **Os chips a 375 — já era assim.** Antes cortava `Bênção +1 3t` (a
   402 px de 375) e escondia `🎲 vantagem` e `−3 PV/turno`. Depois corta à mesma
   (385 px) e esconde os mesmos dois. Os chips ficaram 2–8 px mais estreitos sem
   o emoji, e não chega. **Não é de V3**; é de V4 (a cinta com anéis), e deixo
   lá uma nota: *o chip mecânico (`−3 PV/turno`) é o que muda a decisão, e é o
   que fica escondido — a ordem da fila está ao contrário*.
3. **A ficha da habilidade armada sobre a borda do cartão, 1280 — já era
   assim**, ao pixel: o cartão acaba em 517 e a ficha ocupa 484–524, antes e
   depois. Não é de V3. *(A mim lê-se como uma lingueta presa ao cartão, e não
   me incomoda; fica para V5, que refaz o pé da página.)*
4. **A gaveta a 375 só com o campo aberto — já era assim**, antes e depois:
   escondida sem foco, visível com o campo aberto. Não é de V3. É a composição
   de V6.

### 9.3 · O que mudou para quem joga, em número

- Emoji do sistema operativo na mesa: **10 → 1** a 1280, **8 → 0** a 375, na
  cena mais carregada que montei. O teste pendente: **1 → 0**.
- A identidade deixa de mudar com o aparelho em **todas as falas do sistema**:
  296 sítios passam por um ladrilho só.
- Os estados da cinta ficam legíveis **em deuteranopia pela forma** (setas),
  não pela cor.
- **O que piorou, em número:** 4 das 12 falas com o assunto errado; +6 px por
  fala a 1280; a porta perdeu o contorno.

### 9.4 · Veredito — **sobe com conserto**

Os consertos são cinco, todos pequenos, nenhum toca regra:
1. `App.jsx:16338` — a notícia do mural passa a `📋` sempre, sem o ícone do
   molde. *Uma linha; paga "uma notícia, três caras".*
2. `glifos.js` — `📖` → `faisca`. As duas falas de `📖` que não são magia
   (`:9690`, `:20679`) mudam de prefixo. *Paga a lupa.*
3. `App.jsx` — o `🕯` de trazer de volta os caídos (`:10627`, `:13774–13799`)
   passa a `🩹`, e o da fé (`:9564`, `:20209`) a `🌟`. *Paga a tocha errada; a
   tocha fica só com as tochas.*
4. `chipsDoEstado` — os selos de `selosDaMecanica` passam por `assuntoDaLinha`,
   como as pílulas. *Paga o último emoji da mesa.*
5. **A porta** — seta no ladrilho, contorno `lineStrong`, `w-fit` (§9.2-1).

**Recomendado, mas não bloqueia:** a marca `ban` no ladrilho *Impedido*
(§9.1). **Fica para a etapa seguinte, e é o maior ganho que falta:** a soleira
ainda escreve *"prazo 4 noites"* e `◉ 140` como texto nu (o item 3 de V3a na §4
não entrou). É todo turno com oferta, e é a peça de quatro canais que já existe
(`SeloDePrazo`) a faltar onde o jogador decide.

*De passagem, e não é desta mesa:* `App.jsx:20679` escreve *"Novo arco
iniciado"* no registo. É o sistema a falar de si mesmo.
