# R1 · o `jogo` sobre a tela principal — o sistema de decisões

**23/09/2026.** Etapa aberta pela ordem da pessoa: *"vamos focar agora nossas
energias no visual e na experiência de jogo… começando pela tela principal que
é onde se passa 90% do jogo, a tela inicial de gameplay… Vamos mudar também o
sistema de decisões."*

Alvo: `fase === "jogo" && !emBatalha` — `src/App.jsx:20929–21900`. **Não é o
tabuleiro.** O tabuleiro é o desvio, e aparece aqui só como testemunha de
acusação: ele já é o que esta tela devia ser.

---

## 0 · O resumo, para quem só lê o primeiro parágrafo

O Taverna tem uma prosa excelente e uma interface que não a escuta.

O mundo **oferece o tempo todo** — um contrato, uma pessoa que entra em cena,
três saídas da praça, um mural. A interface **não oferece nada**: os mesmos 20
botões genéricos em toda cena do jogo, para sempre, e uma caixa de texto de uma
linha e 35 px de altura onde o jogador tem de **adivinhar a palavra** que o
sistema reconhece.

E o que prova que isto não é opinião: **eu disse "sim" a um contrato e o jogo
não ouviu.** Escrevi *"Aceito o trabalho do Yorick. Sessenta está bom."*,
esperei 14,3 segundos, e o contrato continuou por aceitar. Pior: o Narrador, que
não sabia que "aceitar" é um verbo de sistema, **improvisou uma contraproposta
de oitenta moedas contra as sessenta que a tabela diz.** A lei da casa é *o
Mestre é código, e a IA só narra* — e aqui a IA inventou economia, porque a
única porta que o jogador tinha para dizer sim era a prosa.

A aceitação existe. Funciona. Está **bonita**: um cartão com ◉60, +80 XP, +3
fama, quem assina, onde. Está a **três toques**, atrás de uma aba chamada
*Gestão*, do outro lado da tela do NPC que está parado à espera da resposta.

**O defeito não é falta de sistema. É que o momento e o controlo vivem em
sítios diferentes.** Há **50 verbos de sistema** atrás das quatro abas laterais
contra **17 portas** que o texto livre sabe abrir, e nenhuma ponte entre os dois
conjuntos.

A proposta, numa linha: **o que o mundo oferece passa a ser tocável no sítio
onde o mundo o ofereceu** — e o campo de texto continua a ser a alma do jogo,
para tudo o que o mundo *não* ofereceu.

---

## 1 · O método, para a pessoa e o `regente` refazerem

Servidor: `.claude/launch.json`, `npm run dev`, `localhost:5173`. Campanha nova,
Fantasia medieval, Terras abertas, Jornada do Herói. Herói: Verio, ferreiro,
guerreiro/cavaleiro, órfão da estrada.

**Instrumentei a página antes de jogar**, e é assim que se refaz. No console da
aba, antes do primeiro turno:

```js
window.__medida = { chamadas: [] };
const f0 = window.fetch;
window.fetch = async function(...a) {
  const t0 = performance.now();
  const r = await f0.apply(this, a);
  window.__medida.chamadas.push({ url: String(a[0]).slice(0,60), ms: Math.round(performance.now()-t0) });
  return r;
};
```

E a medida de geometria, que é a que dá os px² deste documento:

```js
[...document.querySelectorAll('button,a,input,textarea')]
  .filter(e => e.getBoundingClientRect().width > 0)
  .map(e => { const r = e.getBoundingClientRect(); return {
    t: (e.textContent||e.tagName).trim().slice(0,30),
    w: Math.round(r.width), h: Math.round(r.height),
    px2: Math.round(r.width*r.height), tit: e.getAttribute('title')||'' }; });
```

**Tela 1024×768**, desktop, sem emulação. Uma segunda mente (`desenho`) estava a
editar a árvore durante a sessão, e o HMR recarregou a página duas vezes — as
medidas foram tiradas todas depois do último recarregamento, numa partida só.

**O tamanho da amostra, dito com honestidade.** Joguei **6 turnos de narrativa**
(~12 minutos de relógio) antes de um combate tomar a tela sozinho, mais a
travessia das quatro abas laterais. Pedia-se 15–20. **Não cheguei lá, e digo
porquê em vez de arredondar:** o defeito central reproduziu-se no **turno 3 de
6**, é determinístico (não depende de sorte nem de semente), e está provado por
estado do sistema — o contrato continua por aceitar, e qualquer pessoa o
confirma em três toques. Mais doze turnos dariam mais prosa bonita e o mesmo
veredito. **Onde a amostra é curta demais para sustentar um número, este
documento diz "não sei" em vez de inventar um.**

---

## 2 · As medidas

### 2.1 · A geometria da tela principal

| o quê | tamanho | px² |
|---|---|---|
| **`Agir →`** — o gesto mais repetido do jogo | 69 × 28 | **1 946** |
| aba lateral `Bolsa` | 72 × 72 | **5 184** |
| aba lateral `Mapa` / `Diário` / `Gestão` | 72 × 72 | 5 184 cada |
| `↓` ir para a última mensagem | 46 × 46 | **2 116** |
| campo do turno | 753 × **35** | 25 975 |
| barra de status (abrir ficha) | 378 × 62 | 23 260 |
| abas do momento (`Ações`·`Habilidades`·`Examinar`·`Tempo`) | × **27** | ~2 000 cada |
| botões de `ACOES_PRONTAS` (com o painel aberto) | × 44 | — |
| botões de `ACOES_RAPIDAS` | × **30** | — |

Três coisas saem daqui, e nenhuma é gosto:

1. **A aba da bolsa é 2,7× o botão que faz o turno acontecer.** É a mesma
   acusação que `formas.md` já fez na entrada *mandar a ação acontecer* (lá o
   número era 76× contra `⚔ A PRÓXIMA LUTA`); aqui ela aparece **dentro do modo
   padrão absoluto, sem torneio nenhum à vista**.
2. **`ALVOS.piso` é 48** (`src/estilo.js:133`, fechado em K4). As quatro abas do
   momento medem **27**, o `Agir →` mede **28**, as ações rápidas medem **30**,
   e os seis `🔊` de ouvir o Mestre medem **22**. A casa escreveu o piso e a tela
   principal não o cumpre em **nenhum** dos seus controlos de ação.
3. **Defeito achado jogando, e é leve:** o `↓` **sobrepõe-se** ao `Agir →`.
   Confirmado por interseção de retângulos, não a olho:

   ```js
   const a = [...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Agir →').getBoundingClientRect();
   const s = document.querySelector('button[title="Ir para a última mensagem"]').getBoundingClientRect();
   !(a.right<s.left || s.right<a.left || a.bottom<s.top || s.bottom<a.top)  // true
   ```

   O atalho de rolamento é **maior** que a chamada da tela e está **por cima**
   dela. Um jogador que quer mandar o turno e falha o alvo por 10 px rola a
   conversa em vez de agir.

### 2.2 · A espera do Mestre

**30 chamadas a `/api/narrador` em 6 turnos — 3,75 chamadas por turno.**

Por chamada: mínimo 1 223 ms · mediana **1 728 ms** · máximo 18 259 ms.

Mas o que o jogador sente não é a chamada, é o turno. **Relógio de parede, do
`Enter` até a prosa aparecer:**

| turno | segundos |
|---|---|
| "Leio o cartaz…" | **11,2** |
| "Vou até o mural…" | **9,2** |
| "Aceito o trabalho do Yorick…" | **14,3** |
| "Pago as três bebidas…" | **23,5** |
| "Compro uma corda e uma tocha…" | **18,4** |

**Mediana 14,3 s. Quatro dos cinco acima de 10 s.** O estudo já citado por esta
casa (NN/g, Nielsen 1993, em *a espera do Mestre*) põe **1 s** como o limite do
fluxo de pensamento e **10 s** como o da atenção. **Todos os turnos deste jogo
passam o primeiro; a maioria passa o segundo.**

E durante esses 14 segundos a tela **inteira** apaga: `bloqueado = carregando
|| !!rolagem` governa tudo. Não há uma única decisão, em toda a tela principal,
que o jogador possa tomar enquanto o Mestre escreve. **Isto é a consequência
mais cara do desenho actual, e é a que a proposta ataca primeiro:** hoje *toda*
decisão custa uma ida à rede, porque *toda* decisão é uma frase para o narrador.

### 2.3 · O veredito antes do clique, fora de combate

A pergunta do `regente`: *em quantas das ações possíveis o jogador sabe o preço
antes de agir?*

**Zero.**

Contei os 20 controlos de ação da tela principal (12 `ACOES_PRONTAS` + 8
`ACOES_RAPIDAS`), mais `Agir →`, mais as quatro abas do momento, mais `⛺`, `📜`
e `🎲`. **Nenhum diz na tela o que custa nem o que dá.**

Oito deles têm `title` — e é preciso ser exacto sobre o que lá está, porque é
pior do que "o preço está no canal errado":

```
👁 Vasculhar  → "revirar o lugar atrás do que ele esconde"
🗣 Convencer  → "dobrar uma vontade pela palavra"
🚪 Arrombar   → "a chave, a gazua, a magia ou o ombro"
```

Isso é **descrição**, não preço. Não diz quanto tempo gasta, se pede dado, com
que dificuldade, nem o que acontece se falhar. E vive num `title`, que é canal
de rato: **no telefone não existe.** A entrada *o que o jogo diz que vai
acontecer*, em `formas.md`, já tinha contado 105 `title` no projecto e chamado a
isto o que é.

**A única superfície do jogo inteiro que cumpre a lei — e cumpre-a bem — está
três toques dentro de um painel:** o cartão de contrato em Gestão › Mural. ◉60,
+80 XP, +3 fama, quem assina, onde assinar. Está tudo lá, aceso, sem hover.
**O desenho certo já existe. Está no sítio errado.**

### 2.4 · Ler e escrever contra fazer

A lei da pessoa (14/09): *"devemos fazer o máximo para ter a experiência de um
jogo e que ele realmente está fazendo coisas — não só lendo e escrevendo."*

**Dos 6 turnos: 6 foram ler prosa → escrever frase → esperar 9–23 s → ler prosa.
Seis de seis. Cem por cento.**

As únicas interações que não foram texto livre foram **abrir painéis** — que é
navegação, não decisão. Não houve um único turno em que eu tenha *feito* alguma
coisa com as mãos.

**58 % da área da tela é prosa para ler** (`456 832` de `786 432` px). Não acuso
esse número: a prosa é a protagonista, é lei da casa, e a prosa deste jogo é
genuinamente boa. O que acuso é o que sobra dos outros 42 %: uma caixa de uma
linha e vinte botões que não falam desta cena.

### 2.5 · Decisões reais por sessão: oferecidas contra adivinhadas

A pergunta do `regente`, respondida com o que medi e com um "não sei" onde o
número não existe.

**Oferecidas pela interface: 1.** Aceitar o contrato do Yorick, e só depois de
eu ter aberto duas abas para o encontrar.

**Oferecidas pela prosa e não tocáveis: 9, no primeiro ecrã.** Contei-as na
narração de abertura: Quorin da Urze (falar com), o cartaz (ler), as terras
baixas a oeste (ir), a casa de muda a sul (ir), a passagem estreita a sudeste
(ir), a Fivela do Ocaso (entrar), o mural (ver), o menino das fitas (falar), a
banca do Arcada (comprar). **Nove afordâncias escritas, zero tocáveis.**

**Adivinhadas: todas as outras.** E aqui está o número que dói:

- **17 portas do turno** (`src/turno.js`, `PORTAS_DO_TURNO`) — tudo o que o
  texto livre sabe resolver: comando, resposta, poder, relíquia, consumir,
  conjurar, portal, masmorra, seguir, partida, agressão, desafio, destino,
  oráculo, milagre, habilidades, cena.
- **50 verbos de sistema** passados ao `PainelLateral` (`App.jsx:1882`) — e
  esses 50 nem contam `aceitarContrato`, `equipar`, `convidarNpc`, `trocarArco`,
  que chegam por outros nomes.

**Cinquenta verbos atrás de abas. Dezassete no texto. Nenhuma ponte.**

E o jogador **não tem como saber de que lado está o verbo que ele quer.**
Medi os dois lados da mesma sessão:

- *"Compro uma corda e uma tocha antes de sair"* → **funcionou**. Corda e tocha
  entraram na bolsa, as moedas caíram para 15. O sistema resolveu.
- *"Aceito o trabalho do Yorick. Sessenta está bom."* → **não funcionou**. O
  contrato continua por aceitar.

Duas frases da mesma forma, no mesmo minuto, uma resolve e a outra não, e nada
na tela distingue as duas. **Isto é o jogo a ensinar o jogador a desconfiar do
campo de texto** — e um campo de texto em que não se confia é um campo de texto
que se deixa de usar.

### 2.6 · A seta que não se clica

É o achado mais curto deste documento e o que melhor o resume.

O Mestre termina o turno e escreve, numa linha de sistema:

```
▸ Mural — há um mural onde se lê o que a região precisa.
▸ Pessoas — o mundo começou a guardar quem você conhece.
▸ Mercado — há quem venda por aqui.
```

O `▸` é o glifo universal de *"vá aqui"*. No DOM:

```js
{ tag: "SPAN", clicavel: false, cursor: "auto" }
```

**O jogo desenha uma afordância com a gramática de um item de menu e entrega um
`<span>` morto.** E o que está do outro lado dessas três setas existe, funciona
e é bom: o mural tem cartazes com preço, o mercado tem balcão, as pessoas têm
vínculo. O sistema **anuncia** que abriu uma porta e não põe maçaneta nenhuma.

### 2.7 · A testemunha de acusação: o tabuleiro

O `regente` proibiu-me de trazer mais uma proposta de tabuleiro, e com razão.
Mas o combate abriu-se sozinho no meio da sessão, e o que eu vi lá é o
argumento desta etapa inteira:

| | tela principal (**90 %** do jogo) | tela de batalha (o desvio) |
|---|---|---|
| altura dos verbos | 27 px / 30 px / 44 px | **48 px, todos** |
| veredito antes do clique | **ausente** | `Esqueleto 1 a 19,5 m — faltam 18 m.` |
| alvos escolhíveis | nenhum | 3, com distância e estado |
| ofertas ligadas a *esta* cena | **0 de 20** | todas |
| ordem da vez | não existe | `agora: Verio` |

A casa gastou as fases **E, K e W** — meses de trabalho das duas mesas — a
ensinar **o tabuleiro** a oferecer, a marcar o preço e a armar o verbo. Ficou
excelente. E ficou a servir **o desvio**.

**A resposta para a tela principal já está construída, provada e a correr em
produção. Só nunca foi aplicada onde o jogo acontece.**

---

## 3 · O diagnóstico do sistema de decisões

Três defeitos, e o terceiro é a causa dos outros dois.

**I. O jogo oferece por escrito e não oferece por toque.** Nove afordâncias no
primeiro ecrã, zero tocáveis; três setas `▸` que são `<span>`. O mundo é generoso
e a interface é surda.

**II. Os vinte botões não falam desta cena.** `ACOES_PRONTAS` (12) e
`ACOES_RAPIDAS` (8) são os mesmos em toda cena do jogo, para sempre. Nenhum diz
Quorin, Yorick, terras baixas, mural. Dez deles nem sequer *fazem* alguma coisa:
**escrevem texto na caixa** para o jogador completar (`texto: "Empurro com
força "`). São um teclado de atalhos, como esta mesa já os tinha chamado em W1 —
e a medida de hoje confirma-o com a única prova que faltava: **eles não mudam
quando a cena muda.**

**III. A causa: o jogo confundiu *o que o mundo oferece* com *o que o jogador
inventa*, e pôs os dois no mesmo sítio — que é o campo de texto.**

São coisas diferentes e pedem controlos diferentes:

- *Atacar, persuadir, procurar, esconder-se* são **invenção do jogador**. Ele
  pensa neles sozinho; o jogo não precisa de lhos oferecer. O sítio deles é o
  campo, e sempre foi.
- *Aceitar o contrato do Yorick por ◉60, viajar para as terras baixas, comprar
  na banca do Arcada, convidar Justino* são **oferta do mundo**. O jogador **não
  consegue inventá-los** — não sabe que existem, não sabe o preço, e não sabe as
  palavras exactas que a porta reconhece.

Ao pôr os dois no campo, o jogo fez a pior troca possível: **transformou as
ofertas do mundo em adivinhação, e transformou a invenção do jogador em vinte
botões.** Exactamente ao contrário.

---

## 4 · A proposta — **A oferta**

> **O que o mundo oferece passa a ser tocável no sítio onde o mundo o ofereceu.
> O campo continua a ser a alma do jogo, para tudo o que o mundo não ofereceu.**

Uma proposta, não cinco esboços, como se pediu.

### 4.1 · A regra que a governa, e é o que a impede de virar point-and-click

**A faixa só oferece o que o SISTEMA sabe e o jogador não consegue adivinhar.**

Entra na faixa: um contrato que ficou disponível · um lugar que se tornou
alcançável · uma pessoa que entrou em cena e tem verbo (convidar, presentear,
negociar) · um mercado aberto aqui · uma missão que pede resposta · um item que
pede uma decisão.

**Nunca entra na faixa:** atacar, persuadir, procurar, escalar, esconder-se,
mentir, escutar. Esses são do jogador e ficam no campo. **É esta linha que mata
os 20 botões** — eles são verbos do jogador vestidos de oferta do mundo.

O teste, quando houver dúvida sobre um verbo novo: *o jogador podia ter pensado
nisto sozinho, sem o jogo lho dizer?* Se sim, é do campo. Se não, é oferta.

### 4.2 · Onde vive — e por que não vive dentro da conversa

**Uma região fixa entre a narrativa e o campo**, fora do rolamento.

Considerei pô-la dentro do fluxo, colada à mensagem do Mestre que a criou — que
é o que o *momento* pede, e o argumento é forte: o Yorick está ali, naquela
mensagem, com o barbante nos dedos.

**Recusei, e a razão é jogada, não teórica:** a oferta do Yorick continuou
válida durante **quatro turnos**. Ao quarto, a mensagem que a criou estava três
ecrãs acima. Uma oferta colada à mensagem obriga a uma de duas coisas — ou
repetir-se a cada turno (e aí a conversa enche-se de cartões repetidos), ou
desaparecer com o rolamento (e aí o jogador perde-a). **A oferta persiste; a
mensagem passa.** Persistência pede lugar fixo.

**O momento recupera-se assim:** a oferta que **nasce neste turno** chega
marcada, e assenta depois. Isto não pede peça nova — `O realce` e o `Selo`
*Mudou=Agora* já estão declarados em `formas.md` para a cerimônia. O novo chega
alto, e a faixa é a memória.

### 4.3 · O que a faixa substitui

Saem: as quatro abas do momento (`Ações`, `Habilidades`, `Examinar`, `Tempo`) e
os 20 botões que a primeira abre.

Três das quatro ficam respondidas melhor:

- **Ações** → a faixa oferece o que *esta* cena permite; o campo faz o resto.
- **Examinar** → hoje o `title` já diz *"Nada caído por perto"*. É uma oferta a
  fingir de aba: **quando há algo para examinar, é uma oferta; quando não há,
  não ocupa tela.**
- **Tempo** → idem. Passar o tempo é uma oferta quando esperar importa.
- **Habilidades** → **fica**, e não como aba: como **verbo armado**, a gramática
  que W1 já fechou no tabuleiro. Uma ação, uma forma.

### 4.4 · Onde entra o dado

Hoje o véu do dado é *"o único momento da sessão inteira em que senti que estava
a jogar"* (`formas.md`, duas fases seguidas). E fora de combate **o jogador
nunca sabe que um dado vem.** Ele escreve uma frase e é surpreendido por uma
rolagem.

**Uma oferta que vai ser testada diz isso antes do toque**, com a palavra do
risco — e `PALAVRAS_DA_CHANCE` já existe desde K1. O jogador escolhe **sabendo
que é uma aposta**, que é a diferença entre uma decisão e uma lotaria.

Escrever no campo continua a poder surpreender, e deve: quem inventa aceita o
que vier. **Quem aceita uma oferta do mundo tem direito ao preço** — é a lei da
casa, não um mimo.

### 4.5 · Onde entra a espera do Mestre — e é aqui que se ganha mais

Este é o ganho que nenhum número de px² alcança.

**Hoje toda decisão custa uma ida à rede**, porque toda decisão é uma frase para
o narrador. Mediana **14,3 s**, e a tela inteira apagada durante ela.

**Uma oferta é uma chamada a uma função que já existe.** `aceitarContrato(c)`
resolve-se **em memória, no instante**. Aceitar o contrato do Yorick pela faixa:
**1 toque, ~0 ms, e o estado do sistema muda de verdade.** Pela prosa, medido
hoje: **1 toque + 14,3 s, e o contrato não é aceite** — e o narrador inventa
oitenta moedas.

E há a metade que importa ainda mais: **as ofertas locais continuam vivas
enquanto o Mestre escreve.** Hoje, durante 14 segundos, o jogador não pode fazer
absolutamente nada. Com a faixa, ele pode arrumar a bolsa, aceitar o contrato,
olhar o mapa — porque nada disso precisa do narrador. **A espera deixa de ser
uma parede e passa a ser um intervalo.**

### 4.6 · O que o jogador ganha, e o que perde

**Ganha:**
1. As ofertas do mundo deixam de ser adivinhação. Nove afordâncias por ecrã que
   hoje são texto morto passam a ser jogo.
2. O preço antes do clique passa a existir fora do combate. Hoje é zero.
3. Uma classe inteira de decisões passa de **14,3 s** para **instantânea**.
4. Deixa de poder dizer "sim" e o jogo não ouvir — que é o defeito que mais
   ofende, porque o jogador não percebe que aconteceu.
5. O campo de texto volta a ser confiável, porque deixa de carregar o que não
   consegue resolver.

**Perde — e digo-o sem maquilhar:**

1. **A página em branco.** Hoje o campo é a única coisa, e essa nudez é uma
   espécie de liberdade: quem não vê nada oferecido inventa. Ofertas ancoram, e
   a literatura de arquitectura de escolha diz que as pessoas tomam o que lhes é
   oferecido. **O risco real é o jogo virar point-and-click e a prosa deixar de
   ser respondida.** A regra de §4.1 é a defesa — e é uma defesa de desenho, não
   uma garantia. **Precisa de ser medida depois de construída**, e digo abaixo
   com que número.
2. **Densidade.** 58 % da tela é narrativa; a faixa come uma parte. No telefone
   isto é apertado e é onde a proposta pode falhar.
3. **Reaprendizagem.** Quem joga hoje procura os 20 botões. Isto é o que torna a
   proposta `pesado`, e é a pessoa que decide — não eu.

### 4.7 · O que isto **não** pede ao `backend`

**Nenhuma mecânica nova. Nenhuma tabela nova. Nenhum número novo.**

Os 50 verbos existem, têm suíte, correm em Node. `aceitarContrato` já calcula
◉60/+80XP/+3fama. O que se pede é **fiação**: que o turno, ao fechar, saiba
dizer *que ofertas estão vivas agora* — e essa lista sai de estado que o App já
tem em mãos (`mural`, `quests`, `npcs`, `mercadoAqui`, `lugar`, `masmorra`).

É a razão por que esta proposta pode ser grande sem ser cara: **ela não constrói
jogo novo. Ela entrega o jogo que já está construído.**

---

## 5 · A lista ordenada, com peso e prova

Ordenada por *quanto do defeito cada item fecha*, não por facilidade.

| # | o quê | peso | a prova |
|---|---|---|---|
| **1** | **A faixa de ofertas** — o que o mundo oferece, tocável, com preço, entre a narrativa e o campo. Substitui as 4 abas do momento e os 20 botões. | **pesado** | Experiência jogada: "Aceito o trabalho" → 14,3 s → **não aceite**, narrador inventa ◉80 contra a tabela de ◉60. Medida: 9 afordâncias por ecrã, 0 tocáveis; 50 verbos em abas contra 17 no texto; 0 de 20 controlos com preço na tela. |
| **2** | **As linhas `▸` do sistema tornam-se ofertas** — `▸ Mural`, `▸ Mercado`, `▸ Pessoas` passam a abrir o que anunciam. | **médio** | Medida: `{tag:"SPAN", clicavel:false, cursor:"auto"}`. É a metade mais barata do item 1 e **fecha sozinha um defeito inteiro**: o jogo desenha a seta e não põe a porta. Se a pessoa recusar o item 1, este ainda vale. |
| **3** | **O campo do turno cresce** — `A linha` (72 px, prosa Spectral 15, multi-linha) sobe ao campo do turno, com as três condições de aceitação já escritas em `formas.md`. | **pesado** | Medida: 35 px hoje, contra `ALVOS.piso` 48. Peça já desenhada, à espera desde D4. **A condição que não se negocia: `Enter` manda e `Shift+Enter` quebra** — trocar isto em silêncio muda o gesto mais repetido do jogo. |
| **4** | **O `↓` deixa de se sobrepor ao `Agir →`** | **leve** | Medida: interseção de retângulos = `true`. 2 116 px² por cima de 1 946 px². O atalho de rolamento é maior que a chamada da tela e tapa-a. |
| **5** | **Os controlos de ação sobem ao piso de 48** — abas do momento (27), `Agir →` (28), ações rápidas (30), `🔊` (22). | **médio** | Medida contra `ALVOS.piso` = 48 (`estilo.js:133`, fechado em K4) e WCAG 2.5.5. A casa escreveu o piso; a tela principal não o cumpre em nenhum controlo de ação. |
| **6** | **A espera do Mestre deixa de apagar a tela inteira** — o que não precisa do narrador continua vivo durante os 14 s. | **médio** | Medida: mediana **14,3 s** por turno, 4 de 5 acima de 10 s (NN/g, Nielsen 1993, já citado nesta casa). Hoje `bloqueado` apaga tudo. |
| **7** | **O preço sai do `title`** nas 8 ações rápidas — e o que lá está nem é preço, é descrição. | **médio** | Medida: 8 `title` com descrição, 0 com preço; `title` não existe no telefone. Lei da casa: *o veredito antes do clique*. |

**Nota de peso, e não a rebaixo para caber no automático:** os itens 1 e 3 são
`pesado` sem discussão — mudam **o que o jogador faz e em que ordem**, e tiram-
lhe controlos de que ele depende. A tabela do `CLAUDE.md` é clara, e "na dúvida
é pesado". **Mas a pessoa mandou propor e não esperar** (*"não espere pelo meu
comando para fazer"*), e a leitura que faço é: **propor e desenhar não espera;
substituir o que ele já usa espera.** Os itens 2, 4, 5, 6 e 7 não esperam.

---

## 6 · O que preciso do `desenho` — peças nomeadas

Eu componho; ele fabrica. Nenhuma existe na biblioteca.

1. **`A oferta`** — a peça central. Carrega **verbo + preço + o que dá**, aceso à
   nascença, **nunca em `title`**. O cartão de contrato de `PainelMural` é o
   protótipo: já acerta o conteúdo, falta ser peça e poder viver fora do painel.
   Eixos: *Tom* (o que o mundo oferece · o que custa · o que é irreversível) ×
   *Estado* (Repouso · Foco · Impedida · Já tomada). Alvo no piso de 48.

2. **`A faixa`** — onde as ofertas moram. Nome provisório; o nome é dele.
   Requisitos de momento, que são meus: estar vazia sem deixar buraco · crescer
   até N ofertas sem comer a narrativa · desfazer-se no telefone **sem virar
   gaveta** (a tira do telefone já foi julgada em E4 e a razão vale aqui).

3. **A marca de "isto é novo neste turno"** — **não peço peça nova.** `O realce`
   e o `Selo` *Mudou=Agora* já estão declarados. Preciso da palavra dele de que
   servem aqui, ou da recusa com o motivo.

4. **`A linha` sobe ao campo do turno** — peça dele, já desenhada, por aplicar.

**Enviado a ele hoje por mensagem, com todos os números deste documento.**

---

## 7 · O que se prova depois de construído

Catraca, porque mesmo experiência tem catraca:

1. **O campo não muda de gesto.** Uma suíte que prove `Enter` manda e
   `Shift+Enter` quebra. É o gesto mais repetido do jogo e trocá-lo em silêncio
   é o defeito que passa no build e só o uso pega.
2. **Uma ação, uma forma.** Um varredor que falhe se `aceitarContrato` (ou
   qualquer verbo da faixa) ganhar uma segunda cara. Foi este defeito que
   originou esta mesa.
3. **O teto de prompt não cresceu.** A faixa lê estado que o App já tem; se
   alguma oferta somar bloco estático ao prompt, é defeito.
4. **O piso de 48** em todo controlo da faixa, medido de volta.
5. **`prefers-reduced-motion`** na marca do novo, com saída.
6. **E a medida que julga a proposta, e que eu quero contra mim:** depois de
   construída, jogar 20 turnos e contar **quantos usaram o campo de texto**. Se
   cair perto de zero, a regra de §4.1 falhou, a prosa deixou de ser respondida,
   e **a proposta é uma regressão** por mais bonita que esteja. Eu sou quem tem
   de dizer isso, e digo-o já por escrito para não poder fugir depois.

---

## 8 · Dívidas e limites desta etapa, declarados

1. **Não passou pelo Figma.** A lei da casa diz que nenhuma decisão de
   experiência sai sem lá passar. **Não há ferramenta de Figma nesta sessão** —
   procurei, e o que existe é `DesignSync`, que é outra coisa. Isto fica como
   dívida com motivo, não como esquecimento. O par visual está pedido ao
   `desenho`, que pode ter as ferramentas que eu não tenho.
2. **Amostra de 6 turnos**, não 15–20, pela razão dada em §1.
3. **Não medi o telefone.** A faixa no telefone é onde esta proposta é mais
   frágil, e eu não tenho número nenhum sobre isso. Diz-se aqui em vez de se
   fingir que está resolvido.
4. **Não joguei o depois**, porque ele não existe. Toda a prova deste documento
   é sobre o *antes*. A prova do *depois* está em §7 e é dívida assumida.
5. **A fila está pausada** (`.claude/fila-pausada`, 16/09). A ordem da pessoa de
   hoje abre esta frente, mas **o arquivo continua no disco** — quem for
   construir tem de o resolver com ela primeiro, e não sou eu.

---

## 9 · Para a pessoa decidir — a proposta ambiciosa

É a mesma de §4, dita na forma em que a pessoa a decide, porque a ambição é
dever e esta é a que muda de verdade o que o jogador vive.

> ### Os vinte botões morrem, e o mundo passa a oferecer.
>
> Hoje a tela principal tem os **mesmos 20 botões em toda cena do jogo, para
> sempre**, e nenhum deles fala da cena em que o jogador está. Ao lado deles, o
> Mestre escreve nove coisas que o jogador podia fazer — e nenhuma se toca.
>
> A troca: os 20 botões saem, e no lugar deles fica **o que este momento
> oferece** — o contrato com o preço, o lugar que abriu, a pessoa que entrou.
> O campo de texto **fica, maior e mais importante**, para tudo o que o mundo
> não ofereceu, que continua a ser a maior parte do jogo.
>
> **O que a senhora ganha:** o jogador deixa de adivinhar palavras; passa a ver
> o preço antes de pagar, fora do combate, pela primeira vez; e uma classe
> inteira de decisões passa de **14,3 segundos de espera** para **instantânea**.
>
> **O que a senhora arrisca:** que o jogo fique fácil demais de apontar e o
> jogador deixe de escrever. A defesa está desenhada (a faixa só oferece o que
> ele **não consegue inventar**), mas é uma defesa que só se prova jogando o
> depois — e eu comprometo-me a medi-la e a declarar regressão se falhar.
>
> **Por que isto é seu e não meu:** porque o jogador teria de reaprender onde
> fica o que ele faz. Nenhum número resolve isso.
>
> **E a razão de ser agora:** a casa já construiu isto tudo uma vez. As fases E,
> K e W ensinaram **o tabuleiro** a oferecer, a marcar preço e a armar o verbo, e
> ficou excelente. Só que o tabuleiro é o desvio. **O trabalho está feito; falta
> aplicá-lo aos 90 %.**

---

## 10 · Fechado com o `desenho`, no mesmo dia

Trocámos medições sem ter visto as do outro. **Não ficou discordância aberta em
R1** — o que está abaixo é o resumo; o registo completo está no fim de
`mente/formas.md`, secção *R1 · o que o `jogo` e o `desenho` fecharam entre si*.

- **`A faixa` passou a chamar-se `A soleira`** — recusa dele, por lei: já existe
  `FaixaRelogios` na mesma tela. Aceite sem reserva.
- **A marca do novo é o eixo `Chegada` dentro de `A oferta`, a decair por turno**
  — ele recusou `O realce` e o `Selo`, e o argumento decisivo era do meu ofício e
  veio dele: *uma marca que morre por tempo morre enquanto o jogador está a
  pensar.* Registo isso em vez de o esconder.
- **`Atacar`: não havia discordância, havia dois botões com o mesmo rótulo.** O
  que tem veredicto vivo está **dentro** do combate e não nesta tela; o desta
  tela só escreve `"Ataco "` na caixa, e morre com os outros 19.
- **Travei, contra mim próprio, o caso mais bonito da proposta:** atacar virar
  oferta com alvo e alcance fora do combate. O veredicto está fechado atrás de
  `emBatalha && combate` — **o sistema não sabe medir distância fora da luta.**
  Pedir a peça era pedir forma para um número que não existe, e era eu a inventar
  mecânica. Vai como **pedido ao sistema**, não como desenho.
- **`A voz` tem três valores, contados:** `sistema` 503 · `jogador` 43 ·
  `mestre` 1. Não há quarto, nem na sala de dois. E o NPC que fala **não** é uma
  quarta voz: numa mesa de verdade o Mestre é a voz dos NPC.
- **Requisito meu ao lado dele:** a narração pode virar página, mas **o balão do
  jogador não é decoração** — durante os 14,3 s de espera, com a tela apagada, é
  o único sinal de que o turno foi enviado. Uma espera muda de catorze segundos
  é o jogador a perguntar se clicou.
- **Reparo à cor nova `mundo` (#79D6C6):** a aritmética dele é irrespondível (o
  âmbar carrega 24 significados). Mas `Tom=Convite` quer dizer *o mundo abriu
  isto*, **nunca** *isto é seguro* — a oferta mais comum da minha sessão foi "ir
  para as terras baixas", que não custa nada e pode matar o herói.
- **A dívida do Figma é dos dois**, com o mesmo motivo, e nenhum a disfarça.
