# K3 · a reação acontece (bloco do `desenho`)

Fase K, etapa de **construção**. **Nenhum `.js`, `.jsx` ou `.mjs` foi tocado por
mim** — este arquivo é o contrato que a mão cola. K1 decidiu a forma, K1b o tempo,
K2 a trava. **Aqui não se redesenha nada**: transcreve-se, com o nome exato da
propriedade, o ponto exato da folha e o número exato da tabela.

O que esta etapa entrega, e é tudo texto:

1. **As sete classes da janela**, prontas para colar, com o ponto de inserção e a
   razão dele (e a razão é também de catraca — colar no sítio errado deixa `D5c`
   verde a medir nada).
2. **O anel de foco em código**, e a advertência de K2 §1.6 virada regra escrita.
3. **A peça que K1 supôs mal** — decidida e assinada, com número.
4. **O contrato de `src/painel-reacao.jsx`**, assinatura a assinatura.
5. **A lista de verificação das 12 portas do segredo do dano — e a 13.ª**, que
   nasceu desta leitura e mora em `grade-de-batalha.jsx`.

E **uma divergência de número que eu não podia calar** (§1.6): o `73 %` de
`k1b-jogo.md:500` e de `pauta-desenho.md:1129` não sobrevive à tabela desenhada por
K1b três parágrafos acima dele. A decisão está assinada, com o que ela custa.

---

# 1 · AS CLASSES, PRONTAS PARA COLAR

## 1.1 · O ponto de inserção, e ele é três razões, não uma

**O bloco inteiro entra em `MOVIMENTO_CSS` (`src/estilo.js`) IMEDIATAMENTE DEPOIS
de `.tv-pisca { … }` (linha 192) e IMEDIATAMENTE ANTES do
`@media (prefers-reduced-motion: reduce)` (linha 199).** O `@media` existente é
**estendido no lugar**, nunca duplicado nem movido.

1. **A lei da cascata, escrita no próprio arquivo** (`estilo.js:193-198`): uma media
   query não soma especificidade, só envolve — quem decide o empate é a posição.
   O bloco de menos-movimento tem de ficar **debaixo** de tudo que ele desliga.
   *Subir a caixa não dá erro: dá um acessível que não funciona, calado.*
2. **A ORDEM É A REGRA (1/2) fica intacta**: `.tv-fade` continua antes de
   `.tv-reliquia`, e nada meu se mete entre as duas.
3. **E a razão que ninguém tinha escrito, e é a que me preocupa mais:**
   `check-formas.mjs` (D5c) colhe as classes que animam **só do texto ANTES da
   primeira media query** — `const antes = MOVIMENTO_CSS.slice(0, iMedia)`
   (`:640`). Classe nova colada **depois** do `@media` é **invisível para o dente**:
   a suíte fica verde, o `prefers-reduced-motion` não a cobre, e ninguém descobre.
   *Colar no sítio errado não quebra o vermelho — apaga-o.* É o mesmo defeito da
   lei da cascata visto pelo lado da catraca, e as duas apontam para o mesmo sítio.

## 1.2 · O bloco

Cola dentro da template literal de `MOVIMENTO_CSS`. **Zero crases, zero cor
literal** (a tinta entra por `T`, em linha, pelo componente — a folha só carrega o
ritmo, que é como as outras onze caixas deste arquivo já funcionam).

```css
/* ---------------- A JANELA DA REAÇÃO (K3) ----------------
   Sete classes, e nenhuma `infinite`. A saída de cada uma pousa no
   ESTADO FINAL da animação, nunca no inicial — e onde e a propria
   animacao que faz a coisa sumir, `none` sozinho e um bug: deixaria o
   cartao colado na tela para quem pediu menos movimento.

   Um so desenho de entrada (`tvSobeSeis`) para o chamado e para o
   leque: e o MESMO gesto — a peca nasce 6px abaixo e assenta — em duas
   velocidades. Dois keyframes iguais com nomes diferentes seriam duas
   verdades sobre um movimento so.

   E A DURACAO DO TRILHO NAO MORA AQUI, de proposito: ela sai de
   `ritmoDaRodada().abre.trilhoMs`, que a le da tabela. Um numero de
   relogio copiado para a folha nao muda no dia em que a janela mudar —
   e ai a barra mente. E tambem o que mantem `D5e.1` verde. */
@keyframes tvSobeSeis { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.tv-chamado-entra { animation: tvSobeSeis 120ms cubic-bezier(.2,.7,.3,1) both; }
.tv-leque-abre    { animation: tvSobeSeis 160ms cubic-bezier(.2,.7,.3,1) both; }

@keyframes tvApareceSo { from { opacity: 0; } to { opacity: 1; } }
.tv-trilho-entra { animation: tvApareceSo  90ms ease both; }
.tv-resolve      { animation: tvApareceSo 120ms ease both; }

@keyframes tvSomeSo { from { opacity: 1; } to { opacity: 0; } }
.tv-trilho-sai { animation: tvSomeSo  90ms ease both; }
.tv-janela-sai { animation: tvSomeSo 140ms ease both; }

/* O TRILHO. `scaleX` e nao `width`: a tela nao anima leiaute (so
   `opacity` e `transform`), e a proporcao fica impossivel de escrever em
   pixeis — nao ha pixel nenhum nesta caixa para alguem copiar. O trilho
   e `width: 100%` da janela; o cheio e este `scaleX` do trilho.
   `transform-origin: left` e o que faz a barra esvaziar-se da direita
   para a esquerda em vez de encolher pelo meio.

   As duas variaveis sao carimbadas em linha pelo componente e trazem o
   relogio inteiro: `--tv-trilho-ms` e a duracao (da tabela), e
   `--tv-trilho-desde` e um atraso NEGATIVO — quanto do trilho ja passou
   no instante da primeira pintura. E por causa dele que a barra NASCE JA
   NA PROPORCAO que o relogio diz, e nunca num 100% escrito a mao.

   Os valores de reserva sao `0ms` de proposito: se o carimbo falhar, a
   abreviada continua valida e a barra pousa VAZIA (invisivel). Falhar
   para o lado de nao mostrar relogio nenhum e o unico lado honesto —
   uma barra parada e um relogio a mentir. */
@keyframes tvJanelaTempo { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.tv-janela-tempo {
  --tv-trilho-ms: 0ms;
  --tv-trilho-desde: 0ms;
  transform-origin: left center;
  animation: tvJanelaTempo var(--tv-trilho-ms) linear var(--tv-trilho-desde) both;
  transition: background-color 90ms ease;   /* Pressa=Sobra -> Pouco: so a tinta */
}
```

E o `@media` do fim da caixa passa a ser exatamente isto (as três linhas de cima
são as de hoje, palavra por palavra):

```css
@media (prefers-reduced-motion: reduce) {
  .tv-anel-fora, .tv-anel-dentro, .tv-pisca { animation: none; }
  .tv-chamado-entra, .tv-leque-abre, .tv-trilho-entra, .tv-resolve { animation: none; }
  /* estas duas terminam em `opacity: 0`, e e a animacao que as faz
     sumir: `none` sozinho deixaria o cartao aceso na tela. A saida pousa
     no estado FINAL. */
  .tv-janela-sai, .tv-trilho-sai { animation: none; opacity: 0; }
  /* E A EXCECAO QUE E LEI, agora com o mecanismo escrito. K1: a saida de
     `tv-janela-tempo` nao e `none`, e VIRAR CONTAGEM. `none` sozinho
     congelaria o cheio em `scaleX(1)` — uma barra CHEIA e parada, que e
     a pior mentira possivel sobre o tempo. Pousando em `scaleX(0)` ela
     fica invisivel, e quem conta o tempo passa a ser o numeral, que e
     literalmente o que `Tempo=Contagem` e. */
  .tv-janela-tempo { animation: none; transform: scaleX(0); transition: none; }
}
```

## 1.3 · O que cada uma é, e de onde vem o número

| classe | quanto | o quê | curva | a saída |
|---|---|---|---|---|
| `tv-chamado-entra` | **120 ms** | `opacity` + `translateY(6px)` | `cubic-bezier(.2,.7,.3,1)` | `none` — termina no lugar |
| `tv-leque-abre` | **160 ms** | idem | idem | `none` |
| `tv-trilho-entra` | **90 ms** | só `opacity` | `ease` | `none` |
| `tv-janela-tempo` | `--tv-trilho-ms` | `transform: scaleX()` | **linear** | **`scaleX(0)`**, nunca `none` |
| `tv-trilho-sai` | **90 ms** | só `opacity` | `ease` | `none` + `opacity: 0` |
| `tv-resolve` | **120 ms** | só `opacity` (cruzado) | `ease` | `none` |
| `tv-janela-sai` | **140 ms** | só `opacity` | `ease` | `none` + `opacity: 0` |

Os sete números vêm todos de `formas.md` (tabela do movimento, ~2563-2576) e de
K1 (`k1-desenho.md:414-422`). **Nenhum é meu, e nenhum é novo.** As duas únicas
decisões de ofício aqui são de *propriedade*, não de tempo, e estão nos §1.4 e §1.5.

**A curva:** `cubic-bezier(.2,.7,.3,1)` é a curva da casa (já em `.tv-vira`), e
**linear só para o que mede tempo** — *uma curva de aceleração numa barra de tempo
mente sobre o tempo*. O trilho é o único `linear` desta caixa.

**O deslocamento de 6 px do leque não é escolha nova:** é o mesmo do chamado.
O leque **é o mesmo cartão a crescer**, e dois deslocamentos para um objeto só
seriam duas verdades. (A casa tem um terceiro valor, os 8 px de `.tv-fade` — e é
por isso que a tela de batalha não usa `.tv-fade`: `formas.md:2588`.)

## 1.4 · `scaleX`, não `width` — e é o que torna o defeito dos 213 px impossível

K2 mediu o defeito e escreveu a regra: *o cheio era de **213 px fixos**, logo o
mesmo estado nominal dava **62 % a 344 px, 60,7 % a 351 px**; um relógio medido em
píxeis não é um relógio, é um desenho de um relógio.* A regra de K2 —
**trilho `width: 100 %` da janela, cheio `width: N %` do trilho** — está cumprida,
e cumprida por uma propriedade melhor:

- **`width` anima leiaute**, e a lei 2 da tabela do movimento proíbe-o: *animar
  leiaute durante um turno é, literalmente, custar o turno*. `transform` não toca
  no leiaute e resolve-se no compositor.
- **`scaleX` não tem unidade.** Não existe píxel nenhum na declaração para alguém
  copiar; a proporção é a própria propriedade. O defeito dos 213 px deixa de ser
  uma regra a lembrar e passa a ser uma coisa **que não há por onde escrever**.
- **A largura do trilho continua a ser a largura da janela** (`width: 100 %` no
  trilho, no JSX), nunca o comprimento do verbo — senão `APARAR` e `ESCUDO ARCANO`
  dariam dois relógios diferentes para o mesmo tempo.

`transform-origin: left center` é obrigatório: sem ele o cheio encolhe pelo meio, e
uma barra que se esvazia dos dois lados não é uma barra, é um efeito.

## 1.5 · O atraso negativo: um relógio só, lido duas vezes

A lei de K2 §2.2 é dura e está certa: **o trilho não tem relógio próprio; ele é
uma leitura do relógio da janela.** Uma animação CSS com duração e um `setTimeout`
com a mesma duração são **dois relógios**, e eles divergem sob estrangulamento *na
direção cruel* — a barra chega a zero com a janela ainda aberta.

`animation-delay` negativo é o que faz os dois serem um só:

```js
const passou = Date.now() - t0;                    // o unico relogio que existe
const noTrilho = passou - oferta.folgaMs;          // quanto do trilho ja correu
/* carimbado em linha, no elemento do cheio: */
style={{ "--tv-trilho-ms": `${oferta.trilhoMs}ms`, "--tv-trilho-desde": `${-Math.max(0, noTrilho)}ms` }}
```

A animação **começa já progredida**, exatamente onde o relógio de parede está.
Três coisas caem de graça:

- **A barra nasce na proporção que lhe cabe, e nunca num número escrito à mão.**
  Não há `100 %` nem `73 %` em lado nenhum: há `agora − t0`.
- **A primeira pintura atrasada não mente.** Se a aba estava estrangulada e volta
  aos 14,5 s, a barra aparece no último meio segundo — que é o corolário duro que
  K2 §2.3 já assumiu por escrito (*o tempo era dele, e passou*).
- **O recarimbo é uma linha.** Em `visibilitychange → visible`, reescrever
  `--tv-trilho-desde` realinha a barra com o relógio. E se `agora − t0 ≥ janelaMs`,
  o componente **não desenha barra nenhuma**: chama `aoResponder(null)` na hora.

**E a expiração continua a ser do relógio de parede, nunca do CSS.** O
`animationend` não decide nada. A folha desenha onde o relógio já está; ela nunca
diz que horas são.

## 1.6 · A escala do trilho — a divergência, e a decisão assinada

Duas frases da fase dizem coisas diferentes sobre o mesmo pixel, e nenhuma das duas
pode entrar em código sem matar a outra:

| onde | o que diz |
|---|---|
| `k1b-desenho.md:161-192` (a tabela desenhada) | `0→11 000` **sem trilho**; `11 000→14 000` trilho âmbar; `14 000→15 000` trilho `danger`. E: *num trilho de 4 000 ms, 62 % são 2 480 ms restantes e 17 % são 680 ms — dentro da banda de `aperto`.* **Conferido, não suposto.** ⇒ **a escala do trilho são os 4 000 ms do trilho** |
| `k1b-jogo.md:500` e `pauta-desenho.md:1129` | *nasce já na proporção (**73 %** aos 4 000 ms de uma janela de 15 000), nunca a 100 %* ⇒ **a escala seria a janela inteira** (11 000/15 000 = 73,3 % passados; 26,7 % de cheio à nascença) |

**Assino a primeira: a escala do trilho é `trilhoMs`.** Três números matam a
segunda, e nenhum deles é de gosto:

1. **Ela apaga as duas variantes que K1 construiu e K1b conferiu.**
   `Pressa=Sobra` = 62 % de cheio passaria a significar **9 300 ms restantes** — um
   instante **dentro da folga**, onde por decisão da própria K1b **não há barra
   nenhuma na tela**. Uma variante que só pode ser desenhada num instante em que a
   peça não existe não é uma variante.
2. **Ela move o vermelho 1 550 ms para trás.** `Pressa=Pouco` = 17 % passaria a
   entrar aos **12 450 ms** em vez dos 14 000 da tabela de K1b — e `Pouco` deixaria
   de cair dentro do `aperto`, que é a única coisa que `aperto` mede.
3. **E rouba resolução ao segundo que importa.** O último segundo ocuparia **6,7 %**
   do trilho em vez de 25 %: num cartão de 344 px, **23 px de percurso em vez de
   86 px** para o segundo em que o jogador decide.

**E o que a decisão do `jogo` queria fica cumprido, inteiro — só que por mecanismo
e não por constante.** *«Nunca a 100 %»* é obedecido pela via do §1.5: o cheio **não
é um número em lado nenhum**, é `agora − t0`. Não há `100 %` na folha, e também não
há `73 %` — os dois seriam um número que o relógio não produziu.

**O que isto custa, dito em vez de escondido:** a barra não mede a folga, e portanto
o jogador que olha aos 11 s não sabe que já passaram onze segundos. **É a decisão de
K1b, não um efeito colateral dela:** *a folga que não se vê é a única folga que se
sente*; uma barra que medisse a folga retroativamente desfazia a decisão de que
nasceu. O que a barra promete é o **prazo**, e o prazo é honesto ao milissegundo.

> **Vai à pauta, para o `jogo` contestar se quiser:** morre o número `73 %` de
> `k1b-jogo.md:500` e de `pauta-desenho.md:1129`. **Fica tudo o resto do pedido**:
> a classe `tv-trilho-entra`, os 90 ms, `opacity` e nada mais, a nascença na
> proporção, o «nunca a 100 %» e o `prefers-reduced-motion` a seco.

## 1.7 · O que a suíte vai dizer, antes de a mão descobrir

Três avisos medidos em `testes/check-formas.mjs`, para o construtor não gastar uma
tarde a ler um vermelho que já está explicado:

- **D5c fica verde com as sete**, porque as sete estão no `@media` — e só porque o
  bloco foi colado **antes** dele (§1.1).
- **D5e.1 fica verde**, e é por causa da variável: `duracoesDaRegra` (`:731`) só
  colhe `/(-?\d*\.?\d+)\s*(ms|s)\b/`, e `var(--tv-trilho-ms)` não tem dígito
  nenhum antes do `ms`. Os outros seis números — 90 · 120 · 140 · 160 — não estão
  em `numerosDoRelogio` (`600 · 1000 · 4000 · 4600 · 5000 · 5600 · 11000 · 15000 ·
  16600 · 33200`). **Escrever `4000ms` na folha fica vermelho no dia em que
  alguém o escrever**, que é exatamente o que o dente existe para fazer.
- **E há um dente que fica apertado, e é honesto avisar:** `D5e.2 · colhe pelo
  menos uma duração por classe que anima` (`:765`) compara
  `duracoesVistas.length >= queAnimam.size`. Hoje são **14 durações para 13
  classes** (folga 1: `.tv-dice` declara duas). Com as sete novas passa a **20
  para 20** — verde, com **folga zero**, e a próxima classe de duração variável
  fica vermelha sem nada de errado ter acontecido.
  **O conserto é melhorar o dente, não afrouxá-lo**, e é uma linha: contar à parte
  as classes cuja duração é `var(--…)` e **asserir que são exatamente uma** — a
  única classe da casa cuja duração, por lei, não mora na folha. O dente passa a
  provar a lei em vez de apenas não tropeçar nela. *(E a lei da casa exige o
  porquê escrito ao lado da asserção movida — este parágrafo é esse porquê.)*
- **`TEMPOS_DO_CARTAO` (§4.6) NÃO entra em `numerosDoRelogio`.** Se entrar, o
  `140ms` de `.tv-janela-sai` passa a colidir consigo mesmo e o dente fica
  vermelho a dizer uma falsidade. D5e.1 existe para impedir que **a folha copie o
  relógio do SISTEMA** — a duração da janela, que é regra e pode mudar. Os 140 ms
  da saída do cartão são número **da folha**, e a tabela só os espelha para o JS
  poder marcar o desmonte.

---

# 2 · O ANEL DE FOCO, EM CÓDIGO

## 2.1 · A classe

Vai em **`SUPERFICIES_CSS`**, não em `MOVIMENTO_CSS` — o anel não anda. É o
contrato declarado do próprio arquivo: *`MOVIMENTO_CSS` é tudo que anda na tela;
`SUPERFICIES_CSS` é o que fica parado* (`estilo.js:119` e `:204`).

```css
/* ---------------- O ANEL DE FOCO (K3) ----------------
   A forma e a de K1 e nao muda: dois degraus, o vao de `bg` e o traco de
   `ink`. Medido em K2: `ink`/`panel` = 14,37:1, `ink`/`bg` = 15,31:1, e a
   area do indicador da 2,0x o minimo do SC 2.4.13 nas tres pecas.

   E `box-shadow`, E NUNCA `border`: um `border` de 2px OCUPA LEIAUTE e
   empurra os irmaos: a fila de quatro pilulas da ficha mexia-se quando o
   foco entrasse — um alvo em movimento, para o jogador de teclado, que e
   exatamente quem aquela fila existe para servir. `box-shadow` nao ocupa
   leiaute nenhum. (No Figma o anel e geometria porque o Figma nao tem
   `box-shadow` de espalhamento com dois degraus — e o defeito que K2
   §1.6 encontrou e nomeou.)

   Nada de `outline: none` fora desta caixa. Hoje o campo de batalha tem
   86 alvos focaveis por luta com o anel apagado a mao
   (`grade-de-batalha.jsx:515-519`), e foi assim que ele desapareceu. */
.tv-anel-foco:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px ${T.bg}, 0 0 0 4px ${T.ink};
}
/* O MODO DE ALTO CONTRASTE APAGA `box-shadow`. Nao e opiniao: e o que
   `forced-colors` faz por especificacao — e sem estas duas linhas o anel
   simplesmente NAO EXISTE para quem joga assim. `outline` sobrevive, nao
   ocupa leiaute (ao contrario de `border`) e aceita a cor do sistema. */
@media (forced-colors: active) {
  .tv-anel-foco:focus-visible { outline: 2px solid Highlight; outline-offset: 2px; }
}
```

## 2.2 · As cinco regras que vêm com ela

1. **`box-shadow`, nunca `border`.** `border` ocupa leiaute; `outline` não ocupa,
   mas não faz dois degraus numa propriedade só — por isso ele é o **recurso do
   `forced-colors`**, e não a forma.
2. **Nunca `outline: none` fora do bloco `:focus-visible` que instala o anel.** Um
   `outline: none` solto é um anel apagado à espera de alguém reparar.
3. **A fila de pílulas não se mexe, e está medido.** As quatro pílulas de
   *«quando um golpe chega»* (`76:226`) têm goteira de **8 px**. O anel cresce
   **4 px para fora** de um lado só (só uma pílula tem foco de cada vez): **4 px
   dentro de uma goteira de 8**, metade de folga, **zero deslocamento**. É a prova
   aritmética de que `box-shadow` custa leiaute nenhum aqui.
4. **`overflow: hidden` de um antepassado corta o anel.** É a única forma de
   perder um `box-shadow` sem erro nenhum. O cartão, o leque e a fila da ficha não
   podem recortar.
5. **`box-shadow` não soma entre regras.** Se a peça já tem sombra de profundidade,
   as duas escrevem-se na **mesma declaração**, ou o foco apaga a sombra.

## 2.3 · E quem decide quando ele acende

`:focus-visible` — a heurística do navegador, e **não uma segunda lógica nossa**.
Foco movido por programa depois de um gesto de **teclado** acende; depois de um
gesto de **ponteiro**, não. É o mesmo sinal que manda nos atalhos `1..4`/`0`, e é
por isso que os dois quase sempre concordam.

*Quase*: `ultimoDispositivo` é o rastreador da casa e `:focus-visible` é o do
navegador; podem divergir num caso de borda (os números acesos sem anel, ou o
contrário). **Fica escrito como imprecisão aceite, e não consertada:** inventar um
anel em JS para a fazer bater seria trocar a heurística testada do navegador por
uma nossa, e a casa já sabe o que acontece quando alguém acha que sabe melhor que
`:focus-visible` — são os 86 alvos do tabuleiro.

---

# 3 · `O CHAMADO` E O ESTADO DE FOCO — DECIDIDO E ASSINADO

## 3.1 · A suposição de K1 é falsa, e agora ela custa alguma coisa

K1 escreveu: *«o chamado está focado desde o instante em que existe, logo uma
variante Foco seria a única alguma vez usada»*. **K2 leu a composição da peça e
mediu o contrário:** `Etapa=Direta` é `o chamado` (56 px) **+ o recuo** (48 px) —
**duas paradas de tabulação**. O chamado perde o foco e recupera-o, na peça mais
visitada da fase (`Etapa=Direta` é o caso de **12 classes em 12**).

**E o que isso custa, que é a parte que faltava:** com duas paradas e sem anel, o
jogador de teclado **não sabe em qual está**. `Enter` é então uma moeda ao ar entre
*aparar* e *deixar passar* — **50 % de chance de gastar a reação que ele queria
poupar, ou de a poupar quando queria gastá-la**, sob um relógio de 15 s, uma vez
por rodada. Não é conforto: é a diferença entre jogar e adivinhar.

## 3.2 · A decisão

> **Não nasce eixo `Estado` em `O chamado`. Nasce a classe `.tv-anel-foco`, e ela
> nasce para a casa inteira — chamado, recuo, linhas do leque e as quatro pílulas
> da ficha.** O anel é forma **transversal**, `:focus-visible`, exatamente como K1
> disse; o que estava errado era a razão, não a conclusão.

**Os números que a sustentam:**

| | |
|---|---|
| abrir o eixo custaria | `O chamado` de **10 → 20 variantes** (`Forma` 2 × `Tempo` 3 × `Pressa` 2 × **`Estado` 2**) |
| e as vinte novas seriam | **idênticas**: o mesmo `box-shadow`, sem uma medida diferente entre elas |
| e o mesmo eixo já existe | em `O verbo com preço` (8) e `A escolha` (12) — **o anel passaria a viver em três sítios e a derivar em silêncio** |
| o anel, medido (K2 §1.5) | `ink`/`panel` = **14,37:1**; contorno de repouso `lineStrong`/`panel` = 3,51:1 sobre o piso de 3:1 do SC 1.4.11 |
| a área do indicador | o chamado 341×56 → **1 588 px²** contra o mínimo de **794 px²** do **SC 2.4.13 (*Focus Appearance*, AAA)** = **2,0×** (contando só os 2 px de `ink`; os 2 px de `bg` são vão) |

**A peça que eu fabrico nesta etapa é a classe, não a variante** — e ela nasce para
todos, que é a regra: a mesma `.tv-anel-foco` serve as três peças da fase e apaga,
no dia em que for aplicada ao tabuleiro, a dívida dos 86 alvos de E1.

**E o que fica no Figma, porque lá a peça não diz o que é:** a correção já está
escrita por K2 na descrição de `O chamado` (`62:2453`) e de `A escolha` (`20:77`),
com o anel desenhado na folha `K2 · a trava`. **Não abri o arquivo do Figma nesta
etapa** — está dito em §6.

---

# 4 · O CONTRATO DE `src/painel-reacao.jsx`

Arquivo próprio, fora do `App.jsx`. *Conta se prova, tela se olha*: o módulo puro
(`ritmo-da-reacao.js`) já decidiu tudo o que há para decidir; este arquivo monta a
tela e devolve gestos.

## 4.1 · A assinatura

```jsx
/* src/painel-reacao.jsx — O CARTAO DA REACAO (K3)
   Ele pergunta e devolve o gesto. NAO decide nada. */
export function PainelReacao({
  oferta,             /* `ritmoDaRodada().abre`, tal e qual — ou `null`, e `null` quer
                         dizer NAO HA CARTAO. Traz `reacoes`, `gatilho`, `inimigo`,
                         `ordem`, `ritmo` e OS QUATRO MS: `janelaMs`, `folgaMs`,
                         `trilhoMs`, `apertoMs`. */
  t0,                 /* Date.now() do instante em que o cartao nasceu. DO APP. */
  linhaDoGolpe,       /* a frase ja pronta, do `jogo`. O componente nunca a formata. */
  resolucao,          /* `null` enquanto a janela esta aberta. Depois:
                         { texto, glifo, houveGesto } — ja resolvido pelo sistema. */
  reduzido,           /* prefers-reduced-motion, lido uma vez pelo App */
  ultimoDispositivo,  /* "teclado" | "ponteiro" */
  aoResponder,        /* (reacao | null) => void  ·  `null` = o relogio acabou, SEM GESTO */
  aoRecusar,          /* () => void               ·  o recuo: e um gesto, e uma resposta */
  aoSair,             /* () => void               ·  o cartao cumpriu a vida; pode desmontar */
}) { /* … */ }
```

**Os quatro ms não são props separadas, e é de propósito.** Eles já vêm dentro de
`abre` (`ritmo-da-reacao.js:273-276`). Uma segunda estrada para o mesmo número é um
segundo dono — a primeira lei da casa por um fio, e a mesma doença de
`PISO_DO_GOLPE` que esta etapa está a pagar do outro lado.

**`t0` é prop, e não estado interno.** Um componente que carimba o seu próprio `t0`
**reinicia o relógio a cada remontagem** — StrictMode, uma `key` que muda, um pai
que rerenderiza —, e reiniciar o relógio é **dar tempo de jogo de graça**, que é
mecânica nova entrada pela porta dos fundos. O dono do instante é quem abriu a
janela.

## 4.2 · Os três degraus de `Etapa`

Derivados, nunca guardados como estado paralelo:

| `Etapa` | quando | paradas de tabulação | atalhos |
|---|---|---|---|
| **Direta** | `oferta.reacoes.length === 1` — **o caso comum, 12 classes em 12** | **2**: o chamado (56 px) → o recuo (48 px) | `Enter` aceita · `Escape` recusa |
| **Chamando → Escolhendo** | `oferta.reacoes.length >= 2` | **Chamando 2** (chamado + recuo); **Escolhendo 1** (`role="menu"`, *roving tabindex*) | `Enter`/`Espaço` abre · setas andam · `Enter` responde · `Escape` = deixar passar · `1..4` e `0` **só com `ultimoDispositivo === "teclado"`** |
| **Resolvida** | `resolucao !== null` | **0** — não há alvo nenhum; resolução é leitura | — |

`reacoes.length === 0` não existe: a janela não teria aberto (porta `sem_reacao`).

**O foco entra na primeira reação, nunca no recuo** — quem carrega em `Enter` por
reflexo não pode acabar a recusar sem querer. E o *deixar passar* é a **última
linha do menu** em `Escolhendo`, o que mantém `Escolhendo` com **um** ponto de
tabulação só.

## 4.3 · O foco, e a assimetria é o desenho inteiro

Da tabela de K2 §1.3, virada obrigação de código:

| o instante | o foco |
|---|---|
| a janela abre | **guardar `document.activeElement` primeiro**, depois mover para a parada 1 |
| ele responde | volta ao elemento guardado |
| ele recusa | volta ao elemento guardado — recusar é uma resposta |
| **a janela expira** | **não se mexe.** *Quem não respondeu não pediu nada.* |
| o cartão resolvido sai | não se mexe |

**É por isto que `aoResponder(null)` e `aoRecusar()` são duas portas e não uma.**
As duas fecham a janela; só uma devolve o foco. Um componente que as juntasse
mexeria no teclado de quem escolheu ignorar o botão — e o enunciado da pessoa é
*byte a byte o jogo de hoje*, onde nada mexe no foco de ninguém.

**E `role="status"` na linha de `Etapa=Resolvida`.** O cartão não leva `aria-live`
— o foco a entrar já o anuncia (ARIA APG), e as duas coisas juntas anunciam a
dobrar. Mas na expiração **o foco não se move**, logo sem `role="status"` o jogador
de leitor de tela **não fica a saber o que aconteceu** — e a linha da resolução é
precisamente o que K2 §2.3 chamou *a condição da trava*.

## 4.4 · A trava de 150 ms

**O que ela é:** uma linha revelada há menos de 150 ms **não aceita ativação**.

```js
/* o relogio de parede, nunca um contador de tiques nem um sinalizador com
   temporizador: e a lei de K2 §2.2, e o anti-padrao vivo esta ao lado
   (`grade-de-batalha.jsx:385`, que conta `i += 1`). */
const podeAtivar = () => Date.now() - tAbriuOLeque >= TEMPOS_DO_CARTAO.travaMs;
```

- **Cobre as linhas de reação**, que são as que **nascem debaixo do dedo**: o
  chamado ocupava 646–716 e, aberto o leque, é ali que uma linha nova aparece.
- **Não cobre o recuo.** Ele fica nos mesmos **716–764** nos dois degraus — a
  âncora de K1 — logo não pode ter chegado debaixo de um dedo que já lá estava.
  Travar o recuo seria punir um gesto deliberado com um remédio para um acidente
  que ele não pode sofrer.
- **Não cobre `Etapa=Direta`**: ali não há revelação nenhuma.
- **Bloqueia só a ATIVAÇÃO** — nunca o foco, nunca o `hover`, nunca a leitura. E
  vale para qualquer dispositivo: o caso real de teclado é o mesmo evento a abrir
  o leque e a ativar a linha que nasceu por baixo.

## 4.5 · O que o componente NÃO faz — e a lista é o contrato

- **Não rola dado nenhum.** Nem da `chance`, nem de nada.
- **Não debita PM.** O PM sai da ficha no App, e só quando houve escolha.
- **Não decide a reação.** Quem escolhe na ausência de gesto é `reacaoDoSilencio`.
- **Não escreve no log, não toca em `combate`, não toca na ficha.**
- **Não fecha a janela.** Ele chama de volta; quem fecha é `fecharAJanela`, e
  **nenhuma resolução acontece fora do ramo `valeu === true`** — o rolo vive dentro
  desse ramo. O DOM não é árbitro de nada: o componente pode chamar de volta duas
  vezes numa corrida, e é o portão de uma via que tem de aguentar isso.
- **Não pausa e não reinicia o relógio.** Nem ao esconder a aba, nem ao voltar.
- **E não sabe o dano.** Não há `dano` na assinatura, não há `corte`, não há
  `previsao`. *Uma peça que não recebe o número não o pode desenhar* — é a 13.ª
  porta fechada no sítio onde fechá-la custa zero (§5).

## 4.6 · A tabela que falta, e onde ela mora

Três durações que o **JS** precisa de saber (as outras vivem só na folha):

```js
/* src/ritmo-da-reacao.js — ao lado de RITMO_DA_REACAO.
   DOIS DONOS, UMA TABELA: e o mesmo arranjo que K1b escreveu para
   `folga`/`trilho`/`aperto` — numeros do `desenho` guardados na tabela do
   `jogo`, porque o que eles medem e tempo, e tempo e jogo.
   Duas leituras: o componente e a suite. */
export const TEMPOS_DO_CARTAO = {
  resolucaoMs: 1200,  /* `Etapa=Resolvida` fica na tela antes de sair */
  saiMs: 140,         /* ESPELHO de `.tv-janela-sai` na folha; a suite assere que batem */
  travaMs: 150,       /* a trava das linhas recem-reveladas */
};
```

**A duplicação dos 140 é declarada, não escondida**, e tem catraca: uma asserção em
`teste-arte.mjs` (que já importa `MOVIMENTO_CSS`) a conferir que a folha escreve
`tvSomeSo 140ms` para `.tv-janela-sai`. É o padrão que a casa já usa para
`PISO_DO_GOLPE` — duas cópias só sobrevivem com uma suíte a prová-las iguais.

**Por que não `animationend` (que dispensaria o número):** o cartão já tem um
horário em JS — os 1 200 ms da resolução. Dois mecanismos para a vida de um cartão
é uma divergência à espera de acontecer; e sob `prefers-reduced-motion` a saída não
anima, logo o evento não vem e o cartão ficava na tela para sempre.

## 4.7 · E o resto da fiação, que é do App e não do componente

- `escolherReacao` recebe **`persBase`**, a ficha do início da rodada.
- **A expiração devolve os cobertos ao laço de hoje** (`reacaoDoSilencio` a partir
  de `abre.ordem`) — tratá-los como *não reagem* quebra 37,44 % das sementes.
- **Nunca dois cartões na tela ao mesmo tempo. Nunca.** Uma pilha de cartões é uma
  lista de tarefas, que é o objeto exato que esta fase existe para não ser.
- **A ordem do DOM é a ordem de tabulação**: o cartão nasce na linha do veredito,
  entre o campo e os verbos, e herda o lugar 3 da ordem de E1. Nada de `tabindex`
  positivo.

---

# 5 · A LISTA DE VERIFICAÇÃO DO SEGREDO DO DANO

Decisão da pessoa, 15/09: **o dano vem surpresa.** K1b fechou doze portas por
escrito; aqui elas viram lista de conferência, na linguagem de quem constrói.

| # | a porta | o que conferir no código |
|---|---|---|
| 1 | **a cor** | a tinta do cartão muda por **tempo** (`amber → danger` no `aperto`), nunca por tamanho de golpe |
| 2 | **o tamanho da lista** | `oferta.reacoes` vem de `ritmoDaRodada` e **não é refiltrada** no componente. O limiar decide **se** a janela abre, nunca **o que** ela oferece |
| 3 | **a altura / a largura** | 344 px sempre; a altura sai do número de reações e do comprimento do verbo |
| 4 | **a espessura** | cordão 3 px, trilho 4 px — constantes, nunca função de nada |
| 5 | **o movimento de entrada** | 120 ms, `translateY(6px)`, a mesma curva para todo golpe. **Nada escala** — nem distância, nem duração, nem amplitude |
| 6 | **o ícone** | `reacoes.js.icone` — propriedade da **reação**, nunca do golpe |
| 7 | **a duração da janela** | `janelaMs` vem da tabela. **Um golpe grande com menos tempo faria o relógio SER o dano** — a mais sedutora, recusada por escrito |
| 8 | **a ordem das reações** | a ordem da tabela, sempre a mesma. Reordenar por eficácia é um ranking do dano |
| 9 | **o texto do preço** | de `reacoes.js.corta`, em **proporção** — *corta metade*. **Nunca `9 vira 4`** |
| 10 | **a linha do golpe** | verbo + ator, a mesma gramática. **Sem advérbio de intensidade** — um advérbio é o número em três sílabas |
| 11 | **o clarão (`.tv-dano`)** | dispara **depois** de o dano assentar, nunca antes da janela |
| 12 | **a barra de PV / o retrato / a ficha** | **nada na ficha se mexe antes de a janela resolver** — senão o jogador lê o dano exato por subtração |

**E os dois endereços de código por onde as portas 9 e 10 se abrem sozinhas se
ninguém olhar** — K1b escreveu a regra, mas não o endereço:

- `combate.js:180` — `linhaDoAtaque` devolve, literalmente, `· CRÍTICO! 9 de dano`.
  **Esta string não pode entrar no cartão**, e `linhaDoGolpe` (§4.1) é uma frase do
  `jogo`, não esta.
- `combate.js:562` — `severidadeDano(dano, vidaMax, vidaDepois, critico)` devolve
  `{ rotulo, guia, pct }`, com rótulos como `grave (crítico)`. **É a porta 10
  fabricada por tabela**: um advérbio de intensidade gerado a partir do número.

## 5.1 · A 13.ª porta — **o número flutuante do tabuleiro**

**`grade-de-batalha.jsx:254-293` + `.tv-flutua` (`estilo.js:164-165`).** O tabuleiro
tem um `useEffect` sobre `[combate]` que compara a vida de cada ente com a vida
anterior e, na diferença, faz subir **o número, em algarismos, por cima do quadrado
de quem apanhou**:

```js
if (antes != null && v !== antes) {
  const delta = v - antes;
  novos.push({ …, texto: delta > 0 ? `+${delta}` : `${delta}`, cor: … });
}
```

**Por que é porta nova e não a 12 outra vez:** a porta 12 é *a barra de PV do
herói*, e o que ela impede é a leitura **por subtração**, na **ficha**. Esta é
outra superfície (**o tabuleiro**, que é onde o cartão vive desde a Fase E), outro
gatilho (**a mudança de `vida` dentro de `combate`**, e não a pintura da ficha) e
outro grau: **ela não se deduz, ela imprime o número**. Um jogador com o cartão
aberto e um `−9` a subir do seu próprio quadrado não tem segredo nenhum para
guardar.

**A regra, e é uma frase:** *enquanto a janela está aberta, nenhuma escrita de
estado pode alterar `combate.heroi.vida`* — nem por um passo intermédio, nem com o
mesmo valor por um objeto novo. O flutuante só dispara na mudança (`v !== antes`),
logo obedecer a esta frase fecha-a inteira; **desobedecer uma vez, num passo
intermédio inofensivo, abre-a inteira.**

**E uma dívida que encontrei ao ler a linha, declarada e não consertada aqui:** a
cor do flutuante é `#FF9A85`, **literal, fora de `T`** (`grade-de-batalha.jsx:282`).
É um vermelho que nunca passou por tabela nenhuma, ao lado do `T.danger` que devia
ser. Fica para a pauta — não é de K3, e é uma linha.

---

# 6 · PARA A PAUTA, PARA A PESSOA, E O QUE EU NÃO SEI

## 6.1 · A proposta ambiciosa — **no modo de alto contraste o Taverna não tem foco nenhum**

`forced-colors: active` (o alto contraste do Windows, e o que muita gente com baixa
visão usa o dia inteiro) **remove `box-shadow` por especificação**. O anel da casa
inteira é `box-shadow`. Logo, para esse jogador, **o indicador de foco do jogo é
zero**: não é fraco, não existe — e ele joga um RPG de texto com teclado, que é
exatamente o público que mais depende dele.

O conserto são as **duas linhas** do §2.1, uma vez, na folha; o que a torna
proposta e não item é o **alcance**: aplicá-lo à casa toda significa passar
`.tv-anel-foco` pelos **215 `<button>`** que K2 contou e pelos 86 alvos do
tabuleiro, que é
trabalho de etapa e muda o que um jogador vive. **Medida, não adjetivo:**
indicadores de foco visíveis sob `forced-colors` hoje = **0**; depois = todos.

## 6.2 · Vai à pauta

1. **Morre o número `73 %`** de `k1b-jogo.md:500` e `pauta-desenho.md:1129`
   (§1.6). Fica tudo o resto do pedido. **O `jogo` que conteste se discordar** — e
   a discordância resolve-se escrita, nunca em dois códigos.
2. **`D5e.2` fica com folga zero** e o conserto está escrito (§1.7).
3. **`#FF9A85` literal** em `grade-de-batalha.jsx:282` (§5.1).
4. **`.tv-dice` continua a animar 1 000 ms**, que é `aperto` e `bonusContagem` — a
   colisão escrita que K2 deixou à decisão da pessoa. **Nada em K3 a toca.**

## 6.3 · O que eu não sei

- **Não abri o Figma nesta etapa.** Tudo o que este arquivo diz sobre nós, medidas
  e variantes vem de K1, K1b e K2, lidos nos documentos — e a leitura nó a nó foi
  de K2, em 16/09. **Se o arquivo mudou desde então, este contrato não sabe.**
- **Não sei se o cartão cabe quando a linha do golpe agrupa dois golpes numa frase
  só.** K1b garantiu que `Etapa=Chamando` estica para duas linhas; **três linhas
  nunca foram medidas.**
- **Não medi o custo de pintura do `scaleX` num telefone antigo.** É compositor por
  construção, mas *«é compositor»* é argumento, não medida. É pergunta de K4.
- **Não sei quantas janelas o jogador de facto responde** — é literalmente o que
  K4 existe para descobrir, e se a batida nova cansar em vez de tensionar, isso
  aparece no número.
