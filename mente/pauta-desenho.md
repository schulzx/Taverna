# A pauta do desenho

A fila da **segunda mente** — a do visual. O `regente` pega daqui, uma etapa
por ciclo, independente da fila do sistema (`mente/pauta.md`).

Mesmos pesos do `CLAUDE.md`, com a tabela de design: `leve` e `médio` o ciclo
executa sozinho; `pesado` espera a pessoa. **Fluxo do jogo e mover o que o
jogador já usa são sempre `pesado`** — ali o custo é a memória de quem joga,
e nenhum número resolve. Paleta e tipografia são `médio` **se comprovadas**
pela régua dos quatro dentes.

A forma de cada coisa mora em `mente/formas.md`; o feito, em
`mente/diario-desenho.md`.

---

## Para a pessoa decidir (pesado)

**Esta seção esvaziou-se em 23/09, e não por terem sido respondidos um a um.**
A pessoa mudou o regime: no tema do visual e da experiência de jogo, **a mesa
decide e faz** — paleta, tipografia, nomes, posições, fluxo, tela que nasce e
tela que se aposenta. Os 12 que esperavam aqui foram para *Aprovado*, com a
ordem citada. A lei inteira está no `CLAUDE.md`, em *"A ordem de 23/09"*.

**O que ainda chega aqui, e só isto:** o que **um commit revertido não
conserta**, porque é esse o limite do modelo de reversão que ela própria deu.

- **o formato do save** — desfazer o commit não devolve a ficha que o save já
  reescreveu na máquina de quem joga;
- **o que custa dinheiro ou toca infra** (Vercel, Redis, chaves);
- **apagar dado de jogador**, em qualquer forma.

*A pergunta deixou de ser "isto é pesado?" e passou a ser "um commit revertido
conserta isto?". Se conserta, faz-se — e diz-se no relato.*

## A lei que a pessoa deu à mesa (14/09)

> *"Nós estamos criando um jogo. Apesar de seu coração ser em leitura,
> devemos fazer o máximo para ter a experiência de um jogo e que ele
> realmente está fazendo coisas — não só lendo e escrevendo."*

Isto não é um item: é a régua de toda proposta desta fila. Sempre que o
`jogo` e o `desenho` escolherem entre uma forma que **conta** o que
aconteceu e uma forma que **deixa o jogador fazer**, a segunda ganha — e o
que não puder ser feito deve ao menos ser **visto acontecendo**, não
recebido pronto em prosa. A prosa continua sendo a protagonista; o que se
recusa é que ela seja a **única** coisa que o jogador toca.

## A terceira lei da mesa (15/09)

A pessoa, ao aprovar O Pergaminho: *"gostei muito de que essa sugestão já veio
com uma proposta e inclusive muito bem fundamentada. Gostaria que todas
viessem assim se possível — não precisa ter uma explicação gigante nem nada
do tipo, mas vir com uma proposta e dizendo o porquê é muito bacana."*

Então **toda proposta traz as duas coisas, e em poucas linhas**: o que fazer,
e por quê. Nunca só o diagnóstico — *"a escala de texto está errada"* não é
proposta; *"18 degraus viram 6, o piso sobe para 13px, porque metade do texto
hoje é 9–10px e a prosa é a protagonista"* é. E nunca uma parede de texto: o
porquê cabe numa frase se a proposta for boa. Quem não sabe dizer por que,
ainda não terminou de pensar.

Vale para as duas mentes: o `conselheiro` e o `regente` cobram isto de quem
propõe.

## A segunda lei da mesa (14/09)

> *"Faça da forma que um experiente designer de UI e game designer fariam."*

Quer dizer: **decida.** Onde um profissional experiente decidiria sozinho —
o tempo de uma barra, o tamanho de um alvo de toque, a ordem de um leque, o
que não perguntar ao jogador — **decida e escreva o porquê**, em vez de
devolver a escolha. A pessoa não quer ser consultada sobre ofício; quer ser
consultada sobre o que muda o jogo dela. Perguntar demais é uma forma de
timidez, e a timidez já é o defeito.

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

### Liberados pela ordem de 23/09 — a mesa sequencia e faz

**Os 12 abaixo esperavam a pessoa e não esperam mais.** Ela escreveu: *"não me
importo em alterar desde que a nova versão for superior... não espere pelo meu
comando... você tem total liberdade pra trabalhar e ser criativo."* Todos são
do tema (visual e experiência), todos têm número, e **todos são reversíveis
num commit** — que é o limite que ela própria pôs.

**O que isto NÃO afrouxa:** *superior* continua a demonstrar-se pelos três
caminhos (medida, estudo citado, experiência jogada), e a prova entra escrita.
A mesa deixou de pedir licença; não deixou de provar.

**A ordem entre eles é da mesa**, e a régua de desempate é a dela: *o melhor
RPG de mesa do mundo*. Quem rege escolhe pelo que muda mais o que o jogador
vive — não pelo que é mais barato de fazer.

- [x] **(R1) a cena ganha um rosto, e o jogo nunca lho deu** · **FEITO em
  R13-B, `643294a`, v9.284.** A xilogravura por semente esta na tela: 96 px,
  sete gramaticas de silhueta sobre 30 biomas, quatro luzes pela hora, **32
  pares medidos e zero reprovas**. O custo que esta proposta orcava em duas
  linhas de prosa **nao se pagou**: a etapa A devolvera 334 px antes, e a
  pagina ficou em 490 px contra os 151 de origem. *A condicao de R1 era R12, e
  ninguem o sabia ate R6 medir o telefone.* · de: desenho · 23/09

  **O diagnóstico, e é uma frase:** este é um RPG de texto em que **nada na tela
  mostra onde você está**. O bioma existe no motor — há `VinhetaDaCena`, há
  `biomaDaqui()` — e o que ele produz é uma mudança de tom que **a medição não
  distingue do fundo**. O jogo descreve uma taverna, uma estrada, uma cripta, e o
  ecrã é sempre o mesmo retângulo.

  **A proposta.** A página ganha um **cabeçalho de cena** — uma faixa de 96 px no
  topo do papel, com uma **xilogravura gerada pela mesma semente do mundo**, o
  nome do lugar, e a hora do dia a mudar a luz da faixa. **Não é ilustração
  comprada: é o gerador de retrato que a casa já tem, apontado para o lugar em
  vez de para a cara.** *Determinismo por semente continua a valer* — a mesma
  semente dá a mesma cripta, em qualquer máquina, que é a primeira lei do
  `CLAUDE.md` aplicada a uma imagem.

  **O custo, escrito antes de ser perguntado, para poder ser recusado:** 96 px
  saem dos 418 da página no telefone, que passa a 322 — de 51,5 % para 39,6 % do
  ecrã. Com a coluna de 65ch e 17 px, ainda dá **11 linhas de prosa contra as 13
  de hoje**. **Duas linhas é o preço.**

  **Por que é dela:** acrescenta ao ecrã uma coisa de que o jogador passa a
  depender para saber onde está, e **muda o que o produto é** — de *"um log com
  uma barra de vida"* para *"um livro ilustrado que responde"*. Isso não é uma
  tela mais bonita; é outro produto, e a régua desta casa manda trazer isso à
  pessoa mesmo com o número do nosso lado.

- [ ] **(R1) renomear os verbos e as abas** · pesado · de: desenho · 23/09
  `Habilidades` → `Perícias`; `Examinar` → `Olhar`; `Tempo` → `Esperar`;
  `Gestão` → `Herói`; `Diário` → `Crônica`. **A pessoa autorizou por escrito**
  (*"nomes de menus e posições etc"*), e mesmo assim fica aqui e não foi feito na
  Fase R — por uma razão de ordem, não de permissão: **a fase já tirou ao jogador
  as quatro abas do momento e os 20 verbos no mesmo dia.** Trocar também o nome
  do que sobrou é pedir-lhe que reaprenda duas coisas de uma vez, e a régua do
  `pesado` é o custo da memória de quem joga. *Fica para o ciclo a seguir à prova
  jogada de R6 — se o jogador se perder, quero saber se foi da forma ou do nome.*

- [ ] **(E4) o foco deixa de ser opção e passa a ser o padrão da casa — e a
  classe passa a existir só para DESLIGAR** · pesado · de: desenho · 16/09

  **O que é.** Hoje um controlo só tem anel de foco se quem o escreveu se
  lembrar de lhe pôr `.tv-anel-foco` (ou `.tv-anel-foco-no-campo`, se for SVG, e
  ninguém avisa qual). A proposta inverte o ónus: **a folha dá o anel a
  `:focus-visible` de tudo o que é focável**, com a superfície decidida por
  selector (o que vive dentro de `<svg>`, o que corre em `forced-colors`, e o
  resto), e a classe deixa de servir para *ligar* — passa a servir só para
  **desligar**, em casos nomeados e por escrito. *Um controlo novo nasce
  acessível, e um defeito passa a exigir um acto explícito.*

  **A prova, pelos três caminhos:**

  1. **Medida.** São **cinco** maneiras de apagar um anel e **nenhuma dá erro**:
     estilo inline por cima; `none` dentro de uma lista de sombras (invalida a
     declaração inteira em silêncio); `box-shadow` não pinta em SVG;
     `forced-colors` remove `box-shadow` por especificação; e `overflow: hidden`
     /`clipsContent` num ancestral corta o anel. Contra isso, a casa tem **218
     `<button>` crus contra 16 `<Botao>` — 6,8 % dos controlos passam por
     `ui.jsx`**. A tela da batalha nasceu com **`outline: none` inline em 67 dos
     80 elementos focáveis** (E3), a barra de batalha tinha **0 de 7** controlos
     com anel visível (E3), e E4 achou os seis anéis do `Botao` **cortados pelo
     pai desde o dia em que nasceram** e cinco anéis ainda feitos só de sombra.
     *Cinco ciclos seguidos encontraram a mesma classe de defeito em sítios
     diferentes. O que se repete não é o erro: é o ónus estar do lado errado.*
  2. **Estudo citado.** WCAG 2.4.7 *Focus Visible* (AA) e 2.4.11 *Focus
     Appearance* (AAA, WCAG 2.2); a especificação de `forced-colors` (CSS Color
     Adjust 1), que **manda remover `box-shadow`**; e `:focus-visible` (CSS
     Selectors 4), que é o que permite dar o anel a toda a gente **sem** o mostrar
     a quem clica com o rato — que é a razão pela qual a regra antiga
     («`outline: none` em tudo, e ponho de volta onde precisar») existia e deixou
     de ser necessária.
  3. **Experiência jogada — FALTA**, e é o que peço ao `jogo` no ciclo em que
     isto entrar: jogar uma luta inteira só com o teclado, antes e depois.

  **Por que é pesado, e não rebaixo.** Muda o anel de **todos** os controlos do
  jogo no mesmo commit, incluindo telas que ninguém olhou; é uma lei da casa a
  mudar de sentido; e há sítios onde o anel vai aparecer onde nunca apareceu e
  alguém vai achar que é defeito. **Sai de tabela** (as três construções em
  `estilo.js`, uma por superfície), logo é um commit desfeito se der errado.

  **E ela encontra-se com A11 pela porta certa:** A11 pede *"um indicador que não
  dependa de `box-shadow`, provado no modo forçado, com catraca junto"*. E4 pagou
  a metade da biblioteca — **a biblioteca já não tem um único anel feito só de
  sombra**. A metade que falta é exactamente esta: *não basta a peça certa existir
  se pô-la continua a ser opcional.*

- [ ] **(E3) a casa deixa de ser alvo de toque e passa a ser escala —
  `ESCALA_DA_CASA`, e o jogo já tem a resposta escondida atrás de um botão de
  19 px** · pesado · de: jogo · 16/09

  **A medida, corrida ao vivo em duas lutas:** sobram **~561 px** de altura para o
  tabuleiro depois de toda a mobília de E1, e **18 filas a 48 px pedem 864**.
  **Nenhuma arrumação de mobília resolve** — não é um problema de layout, é uma
  desigualdade. A 48 px cabem **2 das 10 plantas**; **a 31 px cabem as dez**. No
  telefone o número é ainda mais duro: **24 de 160 casas = 15 % do tabuleiro**.

  **A experiência jogada, e é ela que faz a proposta e não a conta:** *a única
  vista onde eu vi a luta toda foi o `⤢ ampliar` — **que já desenha a 32 px***. A
  casa **já resolveu isto** e escondeu a resposta atrás de um botão que media
  **68 × 19 px** e saía do ecrã quando o tabuleiro rolava. E na entrada da luta o
  herói estava **abaixo da janela e do ecrã**, a 16 filas do inimigo numa janela de
  11: **ver um era deixar de ver o outro** durante toda a aproximação.

  **O estudo, e é o que desarma a objeção óbvia:** WCAG 2.5.5, Apple HIG e Material
  fixam **44/44/48 para ALVO DE PONTEIRO** — nenhum dos três fala de **escala de
  mapa**. E1 já escreveu a distinção sem lhe dar nome, ao desenhar o *"ver tudo"*:
  *o que é alvo tem o custo escrito dentro; o que não tem nada escrito dentro não é
  alvo.* **A proposta é dar-lhe nome e tabela:** `ESCALA_DA_CASA`, irmã de `ALVOS`,
  com **piso por tipo de ponteiro** — o dedo continua a ter os seus 48 onde toca, e
  o campo deixa de os pagar onde só se olha.

  **Por que é `pesado` e espera a pessoa:** muda **o que o jogador vê ao entrar na
  luta**, que é a coisa que ele acabou de aprender neste ciclo — e mexe num piso
  que esta mesa passou duas fases a impor. *É o tipo de mudança que a régua da casa
  manda trazer à pessoa mesmo quando o número está do nosso lado.*

- [ ] **(E3) a letra tem um piso, e hoje 652 lugares estão abaixo dele —
  `TIPOS`, a irmã de `ALVOS`** · pesado · de: desenho · 16/09

  **A medida, corrida hoje sobre o `src/` de hoje:**

  | tamanho | ocorrências |
  |---|---|
  | `text-[8px]` | **12** |
  | `text-[9px]` | **223** |
  | `text-[10px]` | **313** |
  | `text-[11px]` | **104** |
  | **abaixo de 12 px** | **652** |
  | `text-xs` (12 px) | 205 |

  **Três em cada quatro letras pequenas deste jogo estão abaixo do piso que esta
  casa já citou por escrito** — 652 contra 205. E não há tabela: `ALVOS` não tem
  irmã tipográfica em `estilo.js`, logo **o tamanho da letra é um literal de
  Tailwind espalhado por 14 ficheiros**, que é exactamente a doença que a
  primeira lei do `CLAUDE.md` existe para caçar.

  > ### O piso do polegar virou tabela em K4. O piso do olho continua a ser um literal — e é o mesmo tipo de número: um que o corpo do jogador impõe e o código não pode inventar.

  **A prova, pelos três caminhos que a casa aceita:**
  - **Medida** — os 652 acima, contados por varredura, reproduzíveis.
  - **Estudo citado, e a fonte é esta própria casa** — E2 fixou **12 px** para a
    letra da régua no telefone e escreveu porquê: *"um degrau acima do piso
    citado (HIG 11 pt, Material 11 sp) é o que sobrevive ao jogador que já
    aumentou o texto do sistema"*. **A casa decidiu 12 em E2 e entrega 9 em 223
    lugares.** Junta-se a WCAG 1.4.4 (*Resize text*): a 200 % de texto do sistema,
    o que parte primeiro é sempre o que já nasceu no chão.
  - **Experiência jogada** — falta, e é o que peço ao `jogo` no ciclo em que isto
    entrar: a mesma ficha lida a 9 e a 12, no telefone, com o texto do sistema a
    100 % e a 130 %.

  **A proposta, numa linha:** nasce `TIPOS` em `src/estilo.js`, irmã de `ALVOS`,
  com **`piso: 12`** e os degraus nomeados; a conversão é **um painel por
  etapa**, com um dente em `check-formas.mjs` que congela a contagem no dia em
  que nasce e **só a deixa descer** — a mesma catraca com que D5f congelou as 18
  pílulas à mão. **Reversibilidade: é uma tabela trocada, logo um commit
  desfeito.**

  **E é `pesado` por uma razão só, dita sem a esconder: isto muda quanto cabe no
  ecrã, em toda a parte.** Não é um painel mais bonito — é a ficha, a bolsa, o
  códex e o tabuleiro a caberem menos por rolagem. *O jogador não reaprende nada;
  vê menos de cada vez e lê o que vê.* **A troca é densidade por legibilidade, e
  a prosa é a protagonista** — mas quem decide quanto do jogo cabe num ecrã é a
  pessoa, não a mesa.

  *(E há um caso dentro do caso que mede o custo exacto: a fila «quando um golpe
  chega» da ficha vive a **9 px** e, para ir a 12, a mesa precisa de 3 a 4 filas
  onde hoje tem 2 — porque o painel mede 320 px. **É a proposta (K4) do painel de
  28rem a aparecer outra vez, por outra porta.** As duas pagam-se melhor juntas
  do que separadas.)*

- [ ] **(K4) a janela pergunta sobre a RODADA, não sobre o golpe — e a trava
  de K2 NÃO proíbe** · pesado · de: jogo · 16/09
  **É a saída do beco de K3.** A proposta de K3 tentava mover **a pergunta** e
  batia na asserção 05 (`abre.ordem <= ordemDaReacaoDeHoje`). Esta move **a
  resposta**: o cartão diz de quem vêm os golpes da rodada e o jogador escolhe
  **onde** a reação cai. **`abre.ordem` não muda** — a janela continua a abrir
  exactamente onde abre hoje, e quem não responde continua a resolver por
  `reacaoDoSilencio({ desde: abre.ordem })`, byte a byte.
  > *A trava soldou a ordem da PERGUNTA à ordem dos golpes. Ela nunca soldou a
  > ordem da RESPOSTA.*

  **O número, em 20 000 sementes sobre o motor de hoje:**

  | | hoje | com a escolha |
  |---|---|---|
  | dano do golpe perguntado (mesa A) | 3,52 | **6,15** — ×1,75 |
  | dano do golpe perguntado (solo) | 3,53 | **7,72** — ×2,19 |
  | **dano que chega sem pergunta (mesa A)** | **62,42 %** | **33,37 %** |
  | **dano que chega sem pergunta (solo)** | **75,24 %** | **45,87 %** |

  **Nenhuma outra mudança desta fase move esse número.** E cai de lambuja o
  defeito do `inimigo_erra`: se a rodada tem um erro e um acerto, o jogador
  escolhe o acerto — sem precisar de uma regra que proíba perguntar no erro.
  **E `Etapa=Escolhendo` passa a abrir**: a peça que custou um ciclo, foi
  desenhada, fabricada, montada e **nunca abre** (12 classes em 12 oferecem
  exactamente um verbo) ganha o trabalho para que foi feita, e `ATALHOS_DA_JANELA`
  deixa de ter uma linha de letra morta.
  **O segredo do dano fica inteiro:** mostram-se **nomes, não números** — *o Ogro ·
  o arqueiro · o Ogro de novo*. O jogador escolhe o inimigo, não a aritmética, e
  aprende em duas lutas quem bate mais forte. Isso é jogo, e é o contrário de
  contabilidade.
  **O que se perde, dito antes de a pessoa o descobrir:** quebra a lei de K3
  *«quem responde resolve-se pelo MESMO caminho de quem não responde»*, de
  propósito — o jogador que responde passa a ter um mundo **melhor** que o de hoje.
  Quanto melhor está medido e é pequeno: a reação já é uma por rodada, e o que muda
  é **em que golpe** ela cai, não quantas há. **É isso que precisa da aprovação
  dela**, e é a única coisa desta proposta que é opinião.

- [ ] **(K4) a escada tem de CORTAR antes de calar — quem ignora a batida paga
  2,4× mais relógio do que quem a joga** · pesado · de: jogo · 16/09
  **Medido, em 4 000 lutas pareadas:** quem **cala** paga **30,9 s** de espera por
  luta; quem **responde** paga **13,0 s**. A primeira expiração custa os **15 000
  ms inteiros** e compra **exactamente zero** — o sistema resolve o que já
  resolveria, e isso foi provado duas vezes na tela. **A escada protege do número
  de perguntas (3,22 → 1,98) e não protege do preço de cada uma.** É o contrário
  do que uma saída de conforto devia fazer.
  **Proposta:** depois de **uma** expiração, a janela seguinte nasce **sem folga** —
  só o trilho (4 600 ms). Um degrau novo em `ESCADA_DO_SILENCIO`, lido da tabela
  como os outros dois. **A conta:** 15 600 + 4 600 = **20,2 s** contra os 30,9 s
  medidos — **−35 %** de relógio para exactamente a pessoa que a escada existe para
  proteger. **E quem responde não sente nada**, porque o contador zera na primeira
  resposta.
  > *A folga de onze segundos é para quem está a decidir; quem já demonstrou que
  > não decide não precisa dela para não decidir outra vez.*

  Vem à pessoa porque **muda o tempo que o jogador vive**, e a decisão dos 15 s foi
  dela (*"pra que fique tranquilo até pra pessoas com dificuldade"*) — encurtar o
  segundo prazo não contradiz o motivo dela, mas **só ela pode dizer isso.**

- [ ] **(K4) a ficha do jogador de monitor é 24 % mais estreita que a do
  telefone** · pesado · de: desenho · 16/09
  **E é a única proposta desta pauta que acusa o painel, não a peça.** O painel da
  ficha é `w-80` — **320 px**, dos quais **258 úteis na mesa** contra **321 no
  telefone**. O jogador de ecrã grande lê a ficha numa coluna **mais estreita** que
  a de quem joga no bolso. É isso, e não a peça, que prende o texto da fila de
  pílulas aos **9 px**: a 12 px (o `text-xs` que toda a Fase K usa) a mesa
  precisaria de 3–4 filas e o telefone continuaria em 2.
  **Proposta:** `md:w-80` → `md:w-[28rem]` (**448 px**; bloco da fila 386; duas
  filas nos quatro heróis; 20,8 % → 29,2 % de um ecrã de 1536; cabe no
  `max-w-[88vw]`). **Reversível num token.**
  **Por que é pesado, dito sem rodeios:** não há nada a reaprender — o que muda é
  **quanto da cena o painel tapa quando está aberto**, e isso é território do
  jogador. **Alternativa mais barata, registada:** `A escolha` *Forma=Lista*
  (4 filas fixas, +149 px, iguais nas duas larguras, zero dependência do
  comprimento do nome do verbo).

- [x] **(K3) a janela pergunta sobre o golpe que menos importa — e há número** · **APROVADA 17/09 — virou a Fase J** (a pergunta muda de golpe). Move-se a resposta, não a pergunta: a saída que o `jogo` e o `desenho` acharam melhor **não bate na trava de K2**, e derruba o dano sem pergunta de 62,4% para 33,4%. ·
  pesado · de: jogo · 16/09
  **O diagnóstico, corrido em 20 000 sementes sobre o motor real** (ladino nv 3 +
  2 companheiros contra 4 comuns, a mesa mais parecida com a campanha):
  a janela abre **no maior golpe da rodada em 36,09 %** das vezes; o golpe sobre
  o qual ele **é perguntado** faz **3,56** de dano, e o que chega **coberto, sem
  pergunta**, faz **5,86**. **63 % do dano da rodada chega sem ninguém lhe
  perguntar** (75 % para o ladino solo). E **metade das perguntas é sobre um
  golpe que errou** (50,09 %): *revidar · 0 PM* não é uma decisão, é um sim com
  relógio — e K1 matou `inimigo_cai` com exactamente esta frase (*«uma pergunta
  cuja resposta é sempre sim não é pergunta, é um diálogo de confirmação com
  relógio»*). **A janela abre em 98,6–100 % das rodadas** para sete das doze
  classes: **não existe rodada de descanso.**
  **As duas propostas, e a segunda é a forte:** (a) a janela **não abre num erro
  do inimigo** — corta 45–50 % das perguntas e põe as restantes no momento que
  dói; (b) a janela abre **no MAIOR golpe da rodada**, não no primeiro que
  qualifica — sobe de **36,09 % para 100 %** a fracção de perguntas feitas sobre
  o golpe que mais dói.
  **E o obstáculo, dito antes de a pessoa o descobrir:** **a trava de K2 proíbe as
  duas.** A asserção 05 exige `abre.ordem <= ordemDaReacaoDeHoje`; saltar um golpe
  faz a replicação de [R1] começar mais à frente e **o contra-ataque do golpe 0
  deixa de acontecer** — isso é regressão medida, não estilo. *A ordem da pergunta
  está soldada à ordem dos golpes, e foi a trava que a soldou.* **Vem à pessoa
  porque muda mecânica e porque contradiz uma asserção que ela já aprovou.**
  **O que se perde, dito por mim:** o jogador deixa de poder **recusar** o
  contra-ataque — e recusar compra alguma coisa de verdade.
  **[K4, 16/09] MEDIDO OUTRA VEZ, e ele não exagerou em nada.** Corrido de novo
  sobre o código de hoje: 63 % → **62,42 %**; 50,09 % → **50,66 %**; 36,09 % →
  **35,54 %**; 98,60 % → **98,51 %**; 75 % → **75,24 %**. **A única divergência
  fora do ruído sai contra ele**, e o golpe real confirmou-o na tela: três das
  cinco janelas abriram num erro, e em três rodadas seguidas o dano grande chegou
  coberto. **A proposta (a) — *a janela não abre num erro do inimigo* — leva
  agora também a assinatura do `desenho`**, por razão de forma e independente da
  razão de dano: abrir só em golpe que acerta multiplica por **50** a informação
  da aparição da peça (0,020 → 1,023 bits) pagando com **metade** das
  interrupções. **A proposta (b) foi superada:** a de K4, no topo desta lista,
  chega ao mesmo lugar **sem bater na trava de K2** — mova-se a resposta, não a
  pergunta.

- [x] **(K3) no modo de alto contraste o Taverna não tem foco nenhum** · **APROVADA 17/09 — virou a Fase A11** (acessibilidade do foco). `forced-colors` remove `box-shadow` por especificação, e o anel da casa inteira é `box-shadow`: para quem usa alto contraste, **o foco não é fraco, é zero**. ·
  pesado · de: desenho · 16/09
  **Não é «fraco»: é zero.** `forced-colors: active` — o alto contraste do
  Windows, que muita gente com baixa visão usa o dia inteiro — **remove
  `box-shadow` por especificação**, e o anel de foco da casa inteira é
  `box-shadow`. Logo, para esse jogador, **o indicador de foco de um RPG de texto
  jogado com teclado é nenhum**, que é exactamente o público que mais depende
  dele. **Medida, não adjectivo:** indicadores de foco visíveis sob
  `forced-colors` hoje = **0**; depois = todos.
  **E hoje ficou mais barata:** K3 fabricou `.tv-anel-foco` com as duas linhas de
  `outline` do `forced-colors` já dentro, e aplicou-a ao cartão e às quatro
  pílulas da ficha. **A peça existe e está provada.** O que falta é **alcance**, e
  é por isso que é pesado: passá-la pelos **215 `<button>`** que K2 contou e pelos
  **86 alvos do tabuleiro** com `outline: none` à mão
  (`grade-de-batalha.jsx:515-519`) é trabalho de etapa e muda o que um jogador
  vive. **Paga também a dívida de E1**, que está aberta desde 15/09.

- [x] **(K2) o combate ganha uma semente, e o Duelo já provou que dá** · **APROVADA 17/09 — virou a Fase SE** (a semente do combate). São **205 chamadas a `Math.random`** na campanha contra **zero** em `duelo.js`: a primeira lei da casa — *mesma semente, mesmo resultado* — vale hoje metade do jogo, e o Duelo já provou que a outra metade é possível. ·
  pesado · de: jogo · 16/09
  **O diagnóstico, com o número.** A primeira lei desta casa diz *mesma semente,
  mesmo resultado, em qualquer máquina — é o único árbitro que um sistema sem
  servidor tem*. **Mas a campanha não tem semente nenhuma:** são **205 chamadas a
  `Math.random`** por ~50 módulos, sem um fio que as ligue. **E `src/duelo.js`
  tem zero** — `duelar(A, B, { semente })` e `sementeDaSala(...)` fazem o Duelo
  reprodutível de ponta a ponta desde D2/D3, e `src/semente.js` já exporta o
  gerador. ***A peça existe; falta ligá-la ao combate.***
  **A proposta, e a ordem é o que a torna barata:** `src/dado.js` com
  `fioDaLuta({ save, luta, rodada })`; o combate passa a receber **o rolador por
  parâmetro**, com `rolar = Math.random` por omissão — **exactamente a assinatura
  que `reacaoDoSilencio` já leva desde hoje**. Nada quebra no dia 1: quem não
  passa o rolador tem o jogo de hoje. **A reação é a primeira, porque K2 já a
  pagou**; depois `combate.js`, uma função por versão, cada uma com a varredura
  de sementes a provar que a extracção foi de graça.
  **Por que muda o que o jogador vive, e não é higiene:** hoje, quando ele perde
  e quer perceber porquê, a resposta é *"azar"*; com semente é *"a mesma luta,
  outra vez, igual"* — **e a diferença entre as duas frases é a diferença entre um
  jogo que se pode entender e um que se tem de aceitar.** O *"eu juro que apareceu
  diferente"* deixa de ser indecidível. **E toda etapa futura passa a poder PROVAR
  «o depois é igual ao antes» em vez de o declarar:** K2 gastou um ciclo inteiro a
  construir à mão, para **uma** função, a prova que uma semente daria de graça
  para o motor inteiro.
  **O risco, dito pelo próprio `jogo`:** são 205 chamadas, e tocá-las todas de uma
  vez é o tipo de mudança que parte o jogo em silêncio. **A defesa é não as
  tocar** — é o rolador por parâmetro, função a função, com `Math.random` a
  continuar a ser o valor por omissão até ao último dia. **Reversível em qualquer
  ponto.** O que ele não sabe dizer é quantas versões leva.
  **Por que é dela:** mexe no motor inteiro, não numa tela. *E a alternativa
  honesta seria apagar a linha do `CLAUDE.md`, que a mesa não tem autoridade para
  propor.*

- [ ] **(K2) a casa não tem régua para o alvo de toque — e tem duas populações
  de controlo sem nunca ter sabido** · pesado · de: desenho · 16/09
  **A medida, e são 215 `<button>` varridos** (194 calculáveis):

  | | mediana | abaixo de 24 px | abaixo de 44 px |
  |---|---|---|---|
  | **a casa, hoje** | **30 px** | **14 (7,2 %)** | **169 (87,1 %)** |
  | **as peças da Fase K** | **48 px** | 0 | 0 |

  **A proposta:** nasce `ALVO { minimo: 24, conforto: 44, denso: 32 }` ao lado de
  `T`, **com a fonte escrita em cada linha** (WCAG 2.2 SC 2.5.8 nível AA · Apple
  HIG e WCAG 2.5.5 AAA · e o alvo denso de uma fila de contadores, onde 44
  partiria a linha), o `Botao` de `ui.jsx` passa a lê-la, e um quarto teto em
  `check-formas.mjs` — **`TETO_DE_ALVO_MIUDO`, congelado em 14, que só pode
  descer**. *A tinta e o alvo são duas medidas diferentes:* a tinta pode medir
  30 px e o alvo 44, e a diferença sai de enchimento ou de um `::after`
  transparente — **que não custa um pixel de leiaute**.
  **Por que existem duas populações: porque ninguém escreveu o número.** O
  próprio `desenho` subiu a Pílula de 35 para 47 em K1 citando as três réguas —
  **e escreveu-as num parágrafo de um documento em vez de as pôr numa tabela**,
  que é a primeira lei desta casa aplicada ao avesso. *Um número de
  acessibilidade que vive numa prosa é um número que o próximo controlo não lê.*
  **O que o jogador vive, e é jogo e não higiene:** num telefone, **87 % dos
  controlos estão abaixo do confortável para um polegar**, e um toque falhado no
  meio de um combate por turnos não custa um toque — custa a hesitação de
  perceber por que não aconteceu nada, **com um relógio a correr**. A Fase K
  acabou de pôr na tela o controlo mais sensível a tempo que este jogo já teve:
  ***ele entra correto por acidente de alguém ter medido; o próximo entra correto
  por sorte.***
  **O risco, dito por ele:** crescer o alvo sem crescer a tinta **aproxima alvos
  vizinhos**, e o SC 2.5.8 tem uma excepção de espaçamento exactamente por isso —
  **e ele não mediu espaçamento**. Logo a tabela entra, e a aplicação entra **um
  arquivo de cada vez, medindo**. *E o terceiro caminho falta: nenhum pixel de
  tinta muda, mas quem assina que não piorou é o `jogo` jogando, e isso é K4.*
  **Por que é dela:** uma régua de alvo muda **o que o jogador toca em toda a
  interface**. Isso é fluxo.

- [ ] **(W2) o adversário ganha ouvido — a rodada em que o golpe é recusado
  passa a ser a rodada da voz** · do `jogo` · 16/09
  **O diagnóstico é a soma de três medições que já estavam na casa e que
  ninguém tinha somado:** toda luta corpo a corpo abre com **1,4 rodadas em que
  o jogador não tem nada para fazer, nada para ler e nada a perder** — **10 de
  10 plantas** recusam o corpo a corpo no turno 1, abertura média **19,95 m**
  (W1 §1); **7/7 turnos estéreis, 0 rolagens, 0 chamadas, 100 % sem narração**
  (X4); e a rodada **é de graça**, porque `App.jsx:11871` devolve `true` antes
  do `enviar`. **É o maior espaço vazio do combate e o único que não custa
  quota nenhuma para ser preenchido.**
  **A proposta liga quatro peças que já existem e nunca se viram** — o teste
  (`desafios.js:385` `intimidar`, perícia `intimidacao`, `social`), a condição
  (`condicoes.js:139` `amedrontado`, salva `presenca`, cd 12, **7 leitores**),
  a aplicação (`presenca-divina.js:154` **já a aplica a inimigos, com a linha
  escrita**) e o envelope da poção. **Zero mecânica nova, zero prosa nova,
  zero chamadas.**
  **A peça que falta é uma só, e é o coração:** `garantirLuta`
  (`adversario.js:211-260`) tem **trinta e tal campos — `rodada`, `minhaVida`,
  `heroiFamoso`, `saidas`, `escuro`, `temRefem` — e nenhum deles é "o que o
  herói disse"**. As quebras de intenção lêem `minhaVida < 0.4`,
  `protegidoQuebrou`, `rodada > 3`. **O adversário deste jogo não tem como
  ouvir.** Com um campo `foiAmeacado`, o `receoso` (`:628`) e o
  `fugir_ferido` (`:515`) ganham um segundo gatilho, e **o bando que recua
  porque alguém gritou é coisa que este jogo nunca viu.**
  **Estudo citado, e é de dentro de casa:** `adversario.js:784` escreve a lei
  *"NUNCA invente uma intenção que a Pauta não deu"* — e a Pauta tem trinta
  entradas de mundo e **zero de herói**. É o mesmo defeito que `reacoes.js` já
  tem e que a Fase K nasceu para corrigir.
  **O risco, dito pelo próprio `jogo`:** uma fala de graça numa rodada de graça
  é uma fala que **todo jogador fará em toda abertura de toda luta** — e aí o
  imposto de caminhada troca de roupa e continua imposto. **A defesa já está no
  código** (`chaveDaTentativa`, `desafios.js:710`: a segunda tentativa no mesmo
  lugar ouve *"você já tentou isso aqui"*, de graça) **mas é mais fraca do que
  ele escreveu**, e a adenda §8.1 diz porquê: a chave social é
  `lugar|alvo|<pessoa>|<tamanho>` e **o `tamanho` sai do texto do jogador —
  são seis chaves, não uma**. Há pedido ao `backend` para a chavear por
  `lugar|intimidacao|<inimigo>`.
  **Por que é pesado:** é campo novo e tabela nova em módulo puro, e **o
  jogador reaprende uma coisa grande — que a luta se pode ganhar sem um
  golpe.** Isso é fluxo.

- [ ] **(W2) o tabuleiro passa a desenhar o NÃO — a linha que sai do herói e
  não chega** · do `desenho` · 16/09
  **O diagnóstico saiu de contar o que o tabuleiro desenha hoje:** o passo
  previsto, o passo a acontecer, a mira, o alcance (duas vezes) e a área. **São
  seis desenhos, e os seis desenham coisas que VÃO acontecer.**
  > **O tabuleiro deste jogo nunca desenhou uma recusa. Tem seis formas para o
  > sim e zero para o não — e o não é o que acontece em 10 de 10 plantas, no
  > turno 1 de toda luta corpo a corpo.**
  **A proposta:** na rodada da recusa, uma linha reta sai da ficha do herói na
  direcção do alvo mais próximo **e pára onde o alcance acaba**. Um traço, e
  depois nada. **A distância que falta fica desenhada como o que é: um vão.**
  E tem **três estados, e é o terceiro que a torna a forma de W2** — na recusa
  por **distância** pára ao fim do alcance (*a espada chega até aqui*); na
  recusa por **parede** pára **na pedra**, antes do vão (*não é distância, é
  aquilo* — e as duas recusas que `App.jsx:1121` diz serem *"coisas
  diferentes"* passam a **parecer** diferentes em vez de se lerem diferentes);
  e **na fala a mesma linha chega, inteira, até à ficha** — ***a voz não tem
  alcance***. *A frase do `jogo` — "a 19,95 m a tua voz chega e a tua espada
  não" — deixa de precisar de ser escrita, porque está desenhada.*
  **Medida:** zero contas novas e zero peças novas. `vd.maisProximo.distanciaM`,
  `vd.alcanceM` e `vd.faltaM` já saem de `golpe.js:190-198`; as cores são o
  `T.amber` do passo e o `T.violetSoft` já corrigido; e a geometria da folga já
  foi medida em W1 §2.2 (o arco da vida pára a 0,47 da casa, logo a linha tem
  onde acabar sem tocar em ninguém).
  **Estudo citado, e é a lei desta casa:** ***o veredito antes do clique***.
  Hoje ela cumpre-se em texto e **não se cumpre em forma** — e o `desenho`
  provou que esse texto **vive dentro de uma gaveta que nasce fechada**. *Um
  veredito que depende de o jogador abrir uma gaveta não é um veredito antes do
  clique.* **A linha está sempre lá.**
  **O risco, dito por ele:** é **mais um traço** num tabuleiro que ele próprio
  já acusou de poder virar mosaico, e chega no momento mais carregado. **A
  defesa que ele propõe e não consegue provar:** a linha só existe **enquanto
  não há verbo armado** — arma-se um verbo e ela apaga-se, porque aí o
  tabuleiro voltou a falar de sins. *Está dita como suposição.*
  **Por que é pesado:** muda o que o tabuleiro **é** — de um mapa do possível
  para um mapa que também mostra o impossível —, e o jogador tem de reaprender
  a ler uma linha que não chega.

- [x] **(W1) a luta abre onde a sala é comprida, e ninguém decidiu isso** · **APROVADA 17/09 — vai para a Fase E** (E6). A distância de abertura é a **altura da planta e mais nada** (`grid.js:569-575`): a masmorra abre a 25,5 m por ser estreita, não por ser longe. Passa a sair de tabela, como todo número desta casa. ·
  pesado · de: jogo · 16/09
  **O acidente, e é de uma linha.** A abertura de toda luta sai de `posicionar`
  (`grid.js:569-575`): o herói em `y = altura − 1`, os inimigos em `y = 0`. Logo
  **a distância de abertura é a altura da planta, e mais nada.**
  > **A masmorra abre a 25,5 m porque é ESTREITA (7×18), não porque é longe.
  > A taverna abre a 12 m porque é BAIXA (12×9), não porque é apertada.
  > A razão de aspecto do desenho da planta decide a distância do combate.**

  **A conta, corrida em Node sobre `PLANTAS` × `posicionar`:** abertura média
  **19,95 m**; **10 de 10 plantas** recusam o corpo a corpo no turno 1; **1,4
  rodadas por luta são só caminhada** (2 na masmorra, no navio, no gelo e na
  floresta). **E o arqueiro não paga nada disto** — alcança em 10/10 no turno 1.
  *O jogo cobra um imposto de caminhada a quem luta de perto, e cobra-o por
  engano.*
  **A proposta.** A distância de abertura **sai de uma tabela** — por cenário e
  por como a luta começou — e **nunca dos cantos da planta**. A emboscada abre
  colada; a perseguição abre longe; a rixa de taverna abre a 3 m porque uma
  taverna é pequena. A regra: **pelo menos um inimigo dentro do primeiro passo
  de alguém.** *(O embrião já existe e ninguém reparou: `posicionar:573` já abre
  o inimigo `agil` a meio campo. Falta ser tabela em vez de booleano.)*
  **Porque muda o que o jogador vive:** hoje a primeira coisa que toda luta lhe
  ensina é *"ande em frente"*; com isto é *"onde é que eu me ponho"* — e o campo
  já tem tudo para essa pergunta valer (cobertura, terreno que cobra, golpe
  livre, alcance por tamanho). **A regra está toda lá; falta a luta começar perto
  o bastante para alguém a usar.**
  **Porque é dela:** é tabela nova e é `backend`; e o jogador reaprende uma coisa
  só, mas grande — **que a luta começa em contacto**. Isso é fluxo.
  **O risco, dito pelo próprio `jogo`:** a aproximação é onde a posição vale
  alguma coisa, e abrir tudo colado achataria o combate no sentido oposto. **A
  defesa é a própria tabela:** ela não diz "colado", diz *"dentro do primeiro
  passo de alguém"* — e "alguém" pode ser o arqueiro, o que deixa o corpo a corpo
  com uma rodada de aproximação que passa a ser **uma escolha** (avançar sob fogo
  ou cobrir-se) em vez de uma caminhada.

- [ ] **(W1) o tabuleiro deixa de esperar o verbo: toca-se o ALVO primeiro, e a
  fileira responde com o preço de cada verbo** · pesado · de: desenho · 16/09
  **O diagnóstico acusa o desenho que a própria etapa acabou de fazer, e é por
  isso que ele vale.** A lei da casa é *o veredito antes do clique*. No fluxo
  **verbo → alvo**, o jogador escolhe **o que quer fazer antes de saber o que
  aquilo custa**: o primeiro toque é um compromisso às cegas, e o veredito só
  chega depois dele. ***W1 melhora muito o segundo toque e não melhora nada o
  primeiro.***
  **A proposta: inverter.** Tocar `Halvard`, e a fileira inteira responde de uma
  vez — `ATACAR` *armado* `3 m, ao alcance`; `SALTAR` *impedido* `4,5 m — o seu
  passo chega a 3`. **Vários vereditos ao mesmo tempo, antes de qualquer
  compromisso. São os mesmos dois toques** — muda **quando** ele sabe o preço.
  **A medida que a torna barata, e ela é o achado:** a fenda da razão **já está
  reservada nos botões e já custa 57 px no telefone**, e hoje **não mostra
  nada**. A proposta **não pede um pixel novo nem uma peça nova** — `Botao`
  *Impedido* com `a razao` e `Botao` *Armado* já existem os dois. **É a primeira
  composição em que aquela fenda tem um trabalho que mais nada faz**, e fecha por
  cima o achado de E1 de que a fenda e os tons de `A Consequência` *foram
  construídos duas vezes por acidente*.
  **Porque é dela:** o jogador reaprende **a ordem dos dois toques**. É fluxo.
  **O risco, dito pelo `desenho`, e não é pequeno:** várias razões em mono 10 px
  por baixo de vários verbos **podem ser uma parede de texto no momento mais
  tenso da mesa** — lê-se bem numa folha e mal com o coração acelerado. *"Não
  resolvo isto com desenho: resolve-se jogando."* A defesa que ele deixa escrita:
  **só os verbos armados escrevem; os impedidos ficam calados até serem
  tocados** — corta a parede a metade e mantém o ganho inteiro, **e é suposição,
  não medida**.
  *(Escrita com a fileira de seis de E1. Com a fileira de quatro que W1 decidiu,
  o ganho é menor e o risco também — e o `regente` diz por escrito que isso
  **enfraquece a proposta**, porque `Atacar` é o único verbo da fileira que se
  arma: com quatro, a inversão responde por um. Ela só volta ao tamanho cheio se
  a pessoa responder "dar-lhes motor" ao item seguinte.)*

- [x] **(W1) os três verbos de teatro: dar-lhes motor, ou tirá-los da tela** · **APROVADA 17/09 — já é a Fase Y**, que a pessoa aprovou em 15/09 e está em 1 de 3 (Y1 deu motor a Empurrar e Derrubar em v9.271). `Esquivar` é Y2; a barra fixa só os mostra quando cumprirem. ·
  pesado · de: jogo · 16/09
  `golpe.js:222-254` escreve, com o motivo, que **`Esquivar`, `Empurrar` e
  `Derrubar` não chegam a motor nenhum** — X2 preferiu **escrever o buraco a
  remendá-lo**, e teve razão. **Está na mesa há uma fase, e W1 obriga-o a sair de
  lá:** uma barra fixa não pode carregar teatro, e foi por isso que a fileira de
  seis de E1 virou uma de quatro. *Uma barra fixa em que metade dos alvos não faz
  nada mecânico ensina, em duas lutas, a não confiar na barra.*
  **Duas saídas, e as duas são dela.**
  **Dar-lhes motor.** `Empurrar` e `Derrubar` são disputa de força, e o motor não
  tem disputa entre duas fichas — é a peça que falta. **`Esquivar` é a mais
  barata e a que mais muda o combate:** a condição `protegido` **já existe em
  `condicoes.js`** e nada a concede a partir de uma declaração do jogador; é a
  única decisão defensiva que o jogador hoje não tem.
  **Tirá-los.** Com W2 a transformar a caixa em fala, *"empurro com força"* passa
  a ser **uma fala**, e uma fala num sítio onde a fala mora não é uma perda. **O
  `jogo` defende esta, se só houver uma** — os doze botões de `Ações` são,
  medidos, **um teclado de atalhos**, e um teclado de atalhos é o oposto do que
  esta fase entrega. *Mas tira ao jogador coisa de que ele depende, logo é dela.*

- [x] **(E2) a régua mostra a planta INTEIRA, e a janela é uma marca dentro dela** · **APROVADA 17/09 — vai para a Fase E** (E7). A régua deixa de responder *"como se chama isto que vejo"* e passa a responder **"o que existe que eu não vejo"** — a pergunta que um campo de 33% faz o tempo inteiro. ·
  pesado · de: desenho · 15/09
  **A proposta.** A régua deixa de rotular só as casas que estão na tela e passa
  a rotular **a planta toda** — as 18 colunas cabem nos 337 px do telefone a
  18,7 px cada, que é exatamente o `N = 2` que E1 já calculou; **a letra nunca
  sai, e custa zero casas**. A janela do campo vira um trecho realçado *dentro*
  da régua, como a alça de uma barra de rolagem que soubesse dizer nomes.
  **O porquê, e é uma frase:** hoje a régua responde *"como se chama isto que eu
  vejo"*, e a pergunta que um campo de **33 %** faz o tempo inteiro é **"o que
  existe que eu não vejo"** — que nada na tela responde. É a frase de E1 (*"uma
  régua que começa em F conta que A–E existem"*) feita à letra em vez de por
  inferência, e é o que torna *"vou até K14"* dizível sobre uma casa que o
  jogador nunca viu.
  **Por que é dela e não da mesa:** a régua deixa de bater casa a casa com o
  tabuleiro — deixa de ser o cabeçalho congelado da planilha e passa a ser um
  mapa do campo. Isso é o jogador a reaprender o que a borda significa, e **o
  risco só se resolve jogando**: pode ser que duas escalas na mesma tela
  confundam mais do que a borda muda informa.
  *(A alternativa barata, se a pessoa recusar: a régua fica como está e a
  **marca de borda** — `A marca de borda` `53:43`, já desenhada, variante
  *Quem = A casa* — passa a falar pela casa que está fora da janela. Resolve o
  caso agudo e não resolve a pergunta geral. **Depende de E3**, porque hoje o
  tabuleiro sempre cabe e nada fica fora da janela.)*

- [x] **a resposta dele sobre como quer ser perguntado morre no fim da luta** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **o dano aparece antes de doer** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **`lineStrong`: a casa não sabe dizer "sou um controlo" sem gritar** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **a rodada tem três batidas, e o jogador toca as três** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **`Atacar` ataca — os verbos de combate saem do autocompletar** · feita em v9.253 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **(E1) O turno monta-se antes de acontecer** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **(E1) O tabuleiro conta o que o inimigo VAI fazer** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **(E1) Em combate, o texto deixa de ser o caminho da AÇÃO e passa a ser o caminho da FALA** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **O Pergaminho — a prosa ganha material próprio** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **o turno acontece mesmo quando o Narrador cala** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **A batalha toma a tela** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **O Duelo é jogado, não lido** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **A sala ao vivo precisa de um momento partilhado** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] ****O jogador precisa de uma forma de se mover que não dependa do** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **`Esc` fecha, e o fundo fecha, em toda sobreposição** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **A escala de texto vira tabela** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **O nó entre o Figma e o código custa um plano** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **A ação principal tem a mesma cara nos três modos** · feita · texto em `mente/arquivo/pauta-desenho-feitas.md`


### Fase R — a tela principal, e o sistema de decisões

**A ordem da pessoa, em 23/09/2026, na íntegra:**

> *"vamos focar agora nossas energias no visual e na experiência de jogo, a
> gameplay tem que ser interativa e interessante pra prender o jogador, e o
> design e visual precisam ser estimulantes e chamativos como um bom jogo, use
> a mente, nossos designers Figma e os agentes de programação pra fazer todo o
> estudo da estrutura visual e interativa, **começando pela tela principal que é
> onde se passa 90% do jogo**, a tela inicial de gameplay, contemplando todos os
> detalhes como menus e telas ligadas, caso seja necessário **podemos mudar a
> palheta de cores/fontes, nomes de menus e posições** etc, não me importo em
> alterar desde que a nova versão for superior, seja pela qualidade visual ou
> pela experiência que ela trará. **Vamos mudar também o sistema de decisões**,
> não se acanhe em fazer o que for melhor e ter boas ideias, não espere pelo meu
> comando para fazer, precisamos de eficiência e velocidade."*

**A fase existe porque a pauta inteira estava a olhar para o lado errado.** As
fases E, K e W — nove etapas, cinco ciclos — desenharam **a tela da batalha**. A
pessoa pediu **a tela da narrativa** (`fase === "jogo" && !emBatalha`), que é
onde se passam os 90%. E a testemunha de acusação é a própria mesa: *os mesmos
verbos medem 48 px no tabuleiro e 28 na tela principal; o tabuleiro escreve o
preço dentro da casa e a tela principal esconde-o num `title`.* **A resposta já
estava construída e a correr — nunca tinha sido aplicada aos 90%.**

**Ponto de restauração** (feito pela pessoa antes de abrir a fase): branch
`backup-pre-redesign` e tag `backup-pre-redesign-2026-09-23`, em `d6f1003`,
local e no `origin`. *Ousadia é barata aqui; a timidez é que é o defeito.*

- [x] **R1 · o estudo** · feito 23/09 · texto em `mente/r1-jogo.md` e
  `mente/r1-desenho.md`
- [x] **R2 · a folha nova** — `TIPOS` (o piso da letra) + a paleta *A página
  iluminada* + as peças `Oferta`/`Soleira`/`Voz` · feito 23/09
- [x] **R3 · a tela veste a folha** — a página, a coluna de 65ch, as setas `▸`
  viram portas, o campo do turno cresce, os alvos sobem a 48 · feito 23/09
- [x] **R4 · os 20 verbos aposentam-se** e as peças cabem no orçamento · feito
  23/09
- [x] **R5 · a régua corrigida** — a soleira leva só o que perece; o `+N` vira
  porta · feito 23/09
- [x] **R6 · a prova jogada do *depois*** · de: jogo · 23/09 · **PAGA** — o
  escrito em `mente/r6-jogo.md`. **15 dos 20 turnos usaram o campo de texto**:
  a premissa aguentou, os 20 verbos genéricos nao fizeram falta uma unica vez,
  e o jogo **nao** virou point-and-click. Mas a soleira so aprendeu dois verbos
  e **so em 2 dos 20 ofereceu a coisa que o jogador ia mesmo fazer** — *o ganho
  esta provado e quase todo por gastar*. E a medicao do telefone achou o reu
  que ninguem tinha na conta e que virou R13.
  **A catraca que o `jogo` escreveu contra si mesmo** e que esta fase ainda não
  pagou: 20 turnos, **contando quantos usaram o campo de texto**. Perto de zero
  é **regressão** — o jogo teria virado *point-and-click* e a prosa deixado de
  ser respondida —, e é ele quem tem de o dizer. *A proposta tem duas das três
  provas; falta a terceira, e falta por não existir ainda o depois para jogar.*
- [ ] **R7 · os 653 tamanhos abaixo do piso, um painel por etapa** · de: desenho
  R2 pôs `TIPOS` e a catraca que **congela a dívida em 653 e só a deixa
  descer**. A conversão é um painel por etapa, medindo. *A tela principal é a
  pior região do projeto: **68 de 90 · 76 %**.*
- [ ] **R8 · os 81 emoji do SO saem; entram glifos desenhados** · de: desenho
  **204 usos, 81 distintos**, contra 33 ícones desenhados. *A identidade do jogo
  muda conforme o aparelho de quem joga.* ~21 faltam só para esta tela.
- [ ] **R9 · os acentos colapsam sob daltonismo** · de: desenho ·
  **NÃO HERDADO pelas peças de R13 (23/09), e a medida é que o impediu**
  O `selo de prazo` ia nascer com três cores. Medido antes de construir:
  `mundo`×`amber` = **1,26:1 em visão normal** e **1,12:1 em deuteranopia** —
  **pior do que o próprio defeito que R9 acusa** (`ok`×`amber` = 1,37). A peça
  passou a distinguir-se por **areia da ampulheta → palavra → enchimento →
  cor**, por essa ordem. O mesmo se aplicou ao PV (`amber`×`danger` = 1,21 em
  deuteranopia): os três canais que o salvam — comprimento da barra, o rosto em
  *grave*, `tv-agonia` — **já existiam e nunca tinham sido escritos como
  razão**. *O item continua aberto para a paleta; para as peças novas está
  fechado.*
  Medido e **não corrigido por esta fase**: em deuteranopia `ok` e `amber` ficam
  a **1,02:1** — a mesma cor. *A cobertura é uma lei, não uma medida*, e a
  paleta nova não a paga: herdou o defeito do dia em que nasceu.
- [x] **R12 · o telefone paga a fase, e é onde eu olharia a seguir** · de:
  regente · 23/09 · **RE-MIRADO, DESENHADO E CONSTRUIDO em R13-A (`fc3efb1`)**
  — a pagina do telefone foi de 151 para **586 px sem oferta**, e a moldura
  deixou de crescer a cada contrato. *O item original acusava a soleira e
  falhava os 334 px de cabecalho, barra e prazos.* — a forma fechada
  está em `mente/formas.md` §*R13 · a fabricação*, a composição em
  `mente/r13-mesa.md`, o par 375×812 e as peças no Figma. **Falta construir.**
  *R12 acusava a soleira (149 px) e falhou o réu maior:* a barra de estado (180)
  mais a fita de prazos (81) são **261**, e nenhum dos dois tinha sido medido.
  **E falhou um terceiro que ninguém tinha na conta: o cabeçalho, 73 px para
  escrever o nome do produto a quem já está dentro dele.** As três morrem e
  entra `A cinta`, 48 px: a página passa de **151 para 503** (3,33×) e para
  **586** nos turnos sem oferta — quase metade deles.
  **Medido:** a prosa no telefone foi de **51,5 % para 37,3 %** com uma oferta na
  soleira. Na mesa voltou acima do ponto de partida (58,1 → 58,3 %); **no
  telefone não voltou.** A causa é geometria e não desleixo: **a peça cresce e o
  ecrã não** — a 375 px um cartão que na mesa partilha uma linha precisa de duas.
  *E o telefone é o aparelho que mais recebeu desta fase* (o preço estava em
  `title`, que lá não existe; 21 de 26 alvos estavam abaixo do piso) — **o que
  não torna o custo menor, torna-o pago.**
  **O que eu experimentaria, por ordem:** a soleira no telefone virar **uma linha
  de altura de uma oferta só, com o resto atrás da porta** em vez de empilhar; ou
  o cartão curto voltar aos 54 px e só o longo crescer. **Não decido aqui** — é
  forma, é do `desenho` com o `jogo`, e quero a prova jogada de R6 antes.

- [x] **R11 · o terceiro acento existe e ainda não fez o trabalho por que foi
  criado** · de: regente · 23/09 · **CONVERTIDO E CONSTRUIDO em R13-A
  (`fc3efb1`)** — `T.mundo` ganhou uma *regiao* (a metade direita da cinta:
  hora, prazo, o tempo) em vez de uma lista de usos, e passou de **zero
  leitores** aos cinco significados que R2 lhe prometera tirar ao ambar.
  A conversão não foi feita significado a significado, como se supunha: foi
  feita **de uma vez, por geometria.** A metade direita de `A cinta` é o alvo
  do tempo, e **é toda `T.mundo`** — relógio, data, estação, lugar e a espera
  passam a viver num sítio só, numa cor só. `T.onMundo` deixa de ter zero
  leitores no dia em que a cinta for construída. *Uma cor nova que não tira
  trabalho a nenhuma outra é só mais uma cor — e esta passa a tirar cinco de
  uma vez porque lhe deram uma REGIÃO, não uma lista de usos.*
  `mundo` nasceu em R2 com uma justificação exata: *o âmbar carrega **24
  significados** e `mundo` tira-lhe **cinco** — relógio, data, estação, lugar, a
  espera — devolvendo-lhe uma função só.* Contei os leitores hoje: `T.mundo` é
  lido **duas vezes**, ambas nas peças novas (`Oferta` *tom=convite* e `Voz`
  *quem=mundo*), e **`T.onMundo` tem zero**. *Os cinco significados continuam
  âmbar.* **Logo o âmbar não desceu de 24, e esta fase não pode dizer que
  desceu.** O acento está certo e a conversão é que falta — relógio, data,
  estação, lugar e a espera, um de cada vez, medindo. *Uma cor nova que não tira
  trabalho a nenhuma outra é só mais uma cor.*

- [ ] **R10 · a forma "revelar mais itens na própria lista" não tem nome** ·
  de: aprendiz · 23/09
  O `+N` da soleira precisava dela e `formas.md` não a tem — a forma fechada de
  *abrir e fechar um painel* é **Véu + Fechar**, desenhada para as 15
  sobreposições, e um véu de tela inteira para mostrar uma oferta a mais é
  desproporcionado. O `aprendiz` **compôs com peças que já são lei** em vez de
  inventar, e escreveu a dívida no código. *Vai reaparecer — abas, inventário,
  bolsa —, e na segunda vez já não é composição, é forma por nomear.*

- [ ] **R14 · a página tem uma hora, e o livro escurece com o mundo** · de:
  desenho · 23/09 · **a proposta ambiciosa de R13** · médio, com catraca
  R13 constrói `LUZ_DA_CENA` — quatro receitas de luz (madrugada, dia,
  entardecer, noite) — e gasta-as em **96 px**. A proposta é gastá-las na
  **página inteira**.

  Hoje `T.pagina` é **um castanho e sempre o mesmo**: a superfície onde a prosa
  mora não sabe que horas são. O jogador lê uma cripta à meia-noite e uma praça
  ao meio-dia **no mesmo papel**. Com a luz da cena a valer para a página, a
  xilogravura e o texto deixam de ser *uma imagem colada por cima de uma
  coluna* e passam a ser **um só objecto iluminado** — um livro lido à luz que
  há na cena.

  **Por que é agora e não antes:** a peça que faltava é a tabela, e ela nasce
  nesta etapa. Sem `LUZ_DA_CENA` isto seria gosto; com ela é **uma
  interpolação e um commit**.

  **A catraca, escrita antes de começar, porque esta é a proposta que mais
  facilmente estraga o jogo:** *a prosa é a protagonista, e legibilidade vem
  antes de beleza.*
  1. `ink` × `pagina` **≥ 10:1 em todas as horas** (hoje é 11,08:1) — e a
     suíte lê a tabela de volta e falha se descer;
  2. `paginaFio` × a mesa **≥ 3:1 em todas as horas** (WCAG 1.4.11);
  3. a amplitude entre a hora mais clara e a mais escura **não passa de
     1,6:1 de luminância na superfície** — o suficiente para se notar, pouco
     para cansar quem lê uma sessão inteira;
  4. **o `jogo` joga uma cena de noite e uma de dia** e diz se leu pior. *Se
     leu pior, cai — e a medida não a salva.*

  **O que se arrisca, dito antes de ser perguntado:** quem lê muito de noite
  pode achar que a página escura "apagou". A defesa é o piso de 10:1 e a saída
  de emergência: uma preferência que fixa a página na luz de dia. **Sem essa
  saída, a proposta não entra.**

  *Não vai a "Para a pessoa decidir" porque um commit revertido conserta isto
  inteiro — é uma tabela. Pela régua de 23/09, é da mesa.*

### Fase J — a pergunta muda de golpe
**Aprovada em 17/09**, com a saída que o `jogo` e o `desenho` acharam melhor.
K4 mediu e não defendeu a fase que a construiu: **62,42% do dano da rodada
chega sem pergunta** e **50,66% das perguntas são sobre um golpe que errou**;
a janela abre no maior golpe da rodada em apenas **36,09%** das vezes.

**A saída não bate na trava de K2, e é por isso que é esta:** *move-se a
resposta, não a pergunta.* Dano sem pergunta cai de 62,4% para **33,4%**.

- [ ] **J1 · a pergunta encontra o golpe que importa** · de: pessoa · 17/09
  Sem tocar na regressão zero que K2 provou (o desenho óbvio quebra-a em
  37,44% das sementes, +12,4% de dano ao furtivo em silêncio). Medir antes e
  depois com a mesma sonda de K4.
- [ ] **J2 · o que a batida passa a custar** · de: pessoa · 17/09
  Refazer a conta de K4: perguntas por luta, expirações, relógio de quem
  responde contra o de quem cala (hoje **quem cala paga 2,4× mais**). E os
  dois defeitos que a Fase K fechou torta: **expirar ainda gasta PM** (2 PM
  em 100% das janelas das cinco conjuradoras) e **`recusar` é a única tecla
  que muda o mundo** (+65% de dano, morte 13,7% → 49,3%) **e a única sem
  glifo nem número**.

### Fase A11 — o foco existe para quem usa alto contraste
**Aprovada em 17/09.** `forced-colors: active` — o alto contraste do Windows,
que muita gente com baixa visão usa o dia inteiro — **remove `box-shadow` por
especificação**, e o anel de foco da casa inteira é `box-shadow`. Para esse
jogador **o foco não é fraco: é zero**, e o teclado deixa de ter onde pousar.

- [ ] **A11 · o anel sobrevive ao alto contraste** · de: pessoa · 17/09
  Um indicador que não dependa de `box-shadow` (contorno real, que o modo
  respeita), provado no modo forçado e **sem mudar nada para quem não o
  usa**. K3 acabou de construir o anel: a peça existe, falta a segunda
  língua. Catraca junto, senão volta na próxima peça.

  **[E4 · 16/09] A metade da BIBLIOTECA está paga.** `O anel de foco`
  (`166:4018`) nasceu com o eixo `Superficie` — *Caixa* · *Dentro do SVG* ·
  *Alto contraste* —, e os **cinco** anéis que ainda eram só `DROP_SHADOW`
  foram convertidos a geometria absoluta, sem crescer um pixel: `Botao`
  *Papel=Chamada* nas duas medidas e `A escolha` nas três formas. **A
  biblioteca já não tem um único anel feito só de sombra.** Apareceu de
  lambuja a **quinta** maneira de o apagar (`clipsContent` / `overflow:
  hidden` num ancestral), e com ela seis anéis do `Botao` que estavam
  cortados desde a nascença.
  **O que falta é a catraca** — e ela está agora escrita como a proposta
  ambiciosa de E4, no topo desta pauta: *não basta a peça certa existir se
  pô-la continua a ser opcional.*

### Fase SE — o combate ganha uma semente
**Aprovada em 17/09.** A primeira lei desta casa diz *mesma semente, mesmo
resultado, em qualquer máquina — é o único árbitro que um sistema sem
servidor tem*. **E a campanha não tem semente nenhuma:** são **205 chamadas a
`Math.random`** em ~50 módulos, contra **zero** em `duelo.js`. A lei vale
metade do jogo, e a outra metade já provou que dá.

- [ ] **SE1 · o inventário do acaso** · de: pessoa · 17/09
  Onde estão as 205, quais decidem regra e quais só escolhem prosa, e o que
  `duelo.js`/`arena.js` fizeram para não precisar de nenhuma (`comSorteTravada`
  existe e funciona). **Sem mudar nada** — é o retrato, e a fase vive ou morre
  nele.
- [ ] **SE2+ · as etapas que o inventário pedir** · de: pessoa · 17/09
  Escritas ao fim de SE1. **Se a conta mostrar que o caminho é caro demais
  para o que devolve, a fase encolhe ou morre** — e isso é resultado, não
  fracasso: foi o que aconteceu com X3c e com a Fase H.

### Fase M — o caminho dos tokens (o Figma manda, o código obedece)
Proposta da pessoa (14/09): *"os agentes de design ganham liberdade total
para criar e alterar layouts no Figma, desde que usem estritamente as
Variáveis e Estilos nativos. Antes de codificar, o Claude Code lê esses dados
brutos direto do arquivo pelo MCP e atualiza automaticamente um único arquivo
de estilos globais no repositório. Os agentes de programação usam apenas as
classes desse arquivo centralizado, garantindo que qualquer alteração visual
feita pelos designers seja replicada de forma idêntica, eliminando a chance
de o código ficar diferente ou baseado em achismos."*

**É viável, e — o que importa — não depende do plano.** D3 já provou a
leitura: `get_variable_defs` puxou as 27 variáveis a frio e bateu **26/27**
contra `src/estilo.js`, com a única divergência sendo formato de alfa (o
Figma guarda num byte: `.45` volta `0,45098`; a regra é comparar com
tolerância de 1/255). **Code Connect é outra coisa** — ele amarra
*componentes*, exige Organization/Enterprise, e **este caminho não o usa**.

**Duas correções de rumo, ditas antes de custar tempo:**
1. **Não há `tailwind.config.js`.** O Tailwind entra pela CDN no
   `index.html`, então o "arquivo único de estilos globais" já existe e é
   **`src/estilo.js`** (criado em D2). Não se cria um segundo.
2. **A direção se inverte, e isso tem preço.** Hoje `estilo.js` é a fonte e
   o Figma é o espelho. Aqui o Figma passa a mandar, e o arquivo vira
   **gerado** — logo não pode ser editado à mão nunca mais, e o erro de um
   designer chega à produção sozinho. Por isso a catraca não é opcional.

- [ ] **M1 · o gerador** · de: pessoa · 14/09
  Um script que lê as variáveis do arquivo do Figma e escreve `src/estilo.js`
  inteiro — cabeçalho dizendo que é gerado, a origem, e a data. Roda por
  comando, não por mágica. Determinístico: rodar duas vezes sem mexer no
  Figma não muda um byte.
- [ ] **M2 · a catraca que impede o desastre** · de: pessoa · 14/09
  Com o Figma mandando, um engano lá vira produção aqui. Então o gerado
  **passa por prova antes de valer**: contraste de cada par texto/fundo
  dentro da norma, nenhum token sumido que alguém ainda importe, nenhum
  valor fora de faixa. `npm test` vermelho se regredir — e a regra do teto
  de alfa (1/255) escrita onde se compara, não na memória de ninguém.
- [ ] **M3 · a deriva denunciada** · de: pessoa · 14/09
  Um varredor que compara o `estilo.js` do repositório com o Figma **e
  reclama quando divergem** — é o que substitui o Code Connect na metade dos
  tokens: não impede a deriva, mas não a deixa acontecer calada. Entra no
  `rodar-tudo.mjs`.
- [ ] **M4 · os componentes, sem Code Connect** · de: pessoa · 14/09
  A metade que o plano cobraria: amarrar componente do Figma a componente de
  código. Sem a ferramenta, a amarra é **convenção + varredor** — nome igual
  dos dois lados, declarado em `mente/formas.md`, e um `check-` que falha
  quando um existe sem o outro. **É pior que Code Connect e é honesto sobre
  isso:** prova hoje, não impede amanhã. Se a pessoa um dia subir de plano,
  esta etapa é substituída, não remendada.

### Fase E — a batalha tem tela, e o tabuleiro tem endereço
Decisão da pessoa (14/09): *"seria interessante uma tela para a batalha,
pois é um momento importante e a maioria das outras funções ficariam
inúteis — quando entrar em batalha, uma tela só com o grid e as funções de
batalha e utilitários."* E, para o mover: *"nosso grid pode ter letras e
números, tipo um tabuleiro de xadrez, então se um player disser 'vou até
H20' não teria a confusão que 'me aproximo do…' causa."*

Duas decisões que se resolvem juntas, porque a segunda só faz sentido na
primeira: hoje **o campo de 16×16 nunca foi visto inteiro**, vive num
scroller de 301px, e o painel `Ações` abre abaixo da dobra.

- [x] **E1 · a tela desenhada antes de existir** · feita em v9.254 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **E2 · o endereço do tabuleiro** · feita em v9.260 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **E3 · a tela existe** · de: pessoa · 14/09 · **feito v9.277**
  **A tela da batalha existe, e a condição de entrada foi paga primeiro:** o
  tabuleiro **saiu de dentro do rolador do log** — a batalha é agora irmã do log,
  não filha dele, e a catraca morde se voltar a ser. Os **429 px abaixo da borda**
  eram essa árvore, e só a inversão os resolvia.
  **O ganho que a fila queria não é a tela, é o que saiu com ela:**
  `App.jsx` **22 219 → 21 939 linhas (−280)** — saíram **453 de tela** e entraram
  173 de fiação. Nasceram `src/painel-batalha.jsx` (a tela), `src/tela-de-batalha.js`
  (a decisão, provável em Node) e `src/painel-habilidades.jsx` (as duas gavetas,
  levadas byte a byte). Os números de E1 viraram a tabela **`TELA_DE_BATALHA`**
  (`src/estilo.js`, ao lado de `ALVOS`), e a suíte lê de volta a soma que a
  justifica: `respiro + campo + goteira + lateral + respiro = 1280`.
  **O que o jogador vê:** duas colunas, casa de **48 px medida no navegador**, a
  narração encolhida às duas últimas linhas do Mestre, a faixa `agora: <nome>`, a
  linha do veredito **nunca vazia**, os sete verbos, a ficha curta a 344 px. A luta
  começa e **a tela vira sozinha**; durante ela **não há porta nenhuma**; no fim há
  **uma**. **Zero sobreviventes** dos treze controlos proibidos, e **nada na tela
  diz que ela é uma tela**.
  **E a conferência viva pagou o ciclo inteiro:** com **198 suítes e 14 varredores
  verdes**, a luta real achou **`outline: "none"` inline em 67 dos 80 elementos
  focáveis** — a doença de K4 aplicada casa a casa. Corrigida, e com ela nasceu a
  **quarta maneira de apagar um anel**, que não estava escrita em lado nenhum:
  **`box-shadow` não pinta em elemento SVG** — a regra é aceite, a propriedade diz
  que o anel existe, e nada é desenhado. Nasceu `.tv-anel-foco-no-campo`
  (`outline`, não sombra): **15,31:1, medido com o `Tab` e não com `.focus()`**.
  O escrito fica em `mente/formas.md` (*A tela da batalha existe*),
  `mente/e3-jogo.md` e `mente/e3-desenho.md`.

  **As duas medidas de E1 que a construção desmentiu, e viraram os dois itens
  abaixo:** o campo mede **583 px e não 828** (828 nunca coube na própria mobília
  de E1: a soma dá 1 116 contra 860 de tela), logo cabem **2 das 10 plantas** e não
  nove; e no telefone são **6 filas e não 12**, porque a tira de consulta come
  **144 px** que o orçamento de E2 não tinha.
- [ ] **(E3) a tela entra a seco** · leve · de: oficial · 16/09
  E1 pede `tv-batalha-entra`, **140 ms de opacidade**, e a tela entra sem nada. Não
  foi construída **por prudência declarada**: criar classe de animação nova mexia
  nas catracas de animação de `check-formas`, e a construção preferiu não o fazer no
  ciclo em que a tela nascia. **É feio e está por pagar**, e a etapa que o pagar tem
  de o fazer com a saída sob `prefers-reduced-motion`, como toda a casa.

- [ ] **(E3) o campo rola até ao fim e o herói fica dentro do terço emprestado**
  · médio · de: oficial · 16/09
  Medido depois do enquadramento estar construído e a funcionar: com o herói na
  **última fila da planta**, o rolador bate no fim e ele fica a **90 % da janela** —
  ou seja, **dentro do terço que a reserva da reação (K3) pode tapar a qualquer
  segundo**. É o único caso em que a regra 1 de E1 (*o herói no meio da área livre*)
  não se pode cumprir, e **a cura não é de conta:** exige **folga de rolagem por
  baixo do campo** — e *um campo que rola para o nada* é decisão de desenho. A
  construção mediu, não decidiu, e mandou-a para cá. **É a decisão certa.**

- [ ] **(E3) `Atacar` perdeu o privilégio na cor e recebeu-o na largura**
  · médio · de: regente · 16/09
  Medido vivo: **294 px contra 59 px do `Mover`** — `flex: 1 1 0` sobre um rótulo
  mais largo. **W1 decidiu, por minha mão, que na tela da batalha não há
  `Papel=Chamada` nenhum**, porque *o âmbar cheio pertence ao que VAI acontecer, não
  ao que é popular*. A construção obedeceu à letra e **o privilégio voltou pelo
  outro eixo**: cinco vezes a largura do vizinho é uma hierarquia tão clara como a
  cor. *Uma lei que se cumpre num eixo e se viola no outro é meia lei* — e a minha
  decisão precisa de dizer qual dos dois queria. Fica com o meu nome porque o
  buraco é meu, não de quem construiu.

- [ ] **(E3) a marca na borda: a regra 3 de E1 está meia** · leve · de: jogo · 16/09
  A metade construída é a que importa e saiu de graça: **a câmara não vai atrás do
  inimigo do outro lado do campo** (o efeito só escuta a casa do herói). Falta a
  outra: *a borda ganha a marca com **o nome e a distância***. Sem ela, quem age
  fora da janela age **em silêncio absoluto** — e o `jogo` mediu o caso agudo: herói
  e inimigo a **16 filas numa janela de 11**, onde *ver um é deixar de ver o outro*
  durante toda a aproximação. A peça existe (`A marca de borda`, `53:43`, 8
  variantes, fabricada em E1); falta montá-la.
- [x] **E4 · mover é fazer** · de: pessoa · 14/09 · **feito v9.281**
  **A pergunta da etapa era "quantas rodadas o jogador consegue se mover de facto,
  contra as zero de hoje" — e a resposta veio de onde ninguém procurava.** O passo
  não era descontado porque **a luta nascia sem `economia`**: `equiparCombate`
  (`App.jsx:4929`, a porta única de `abrirCombate`) montava a luta sem ela, e o
  desconto fazia `eco ? … : eco` — **sem `eco`, evaporava**. A rodada 1 inteira era
  de graça. O motor entregou a peça pura (`PASSO_NA_RODADA`, `passoQueResta`,
  `podeDarUmPasso`, `passoAposAndar`) e **as seis linhas endereçadas**; o bastão era
  nosso e nós ligámo-las. **Medido vivo: `👣 9 de 9` → `0 de 9` depois de um passo**
  — a primeira vez que a rodada 1 debita. A catraca `check-passo-na-rodada.mjs`
  **falha com 7 asserções antes e passa com 10 depois**: *falha antes, passa depois*,
  no caso mais limpo que a fase teve.
  **E a mesma chave em falta tinha um segundo sintoma que ninguém tinha ligado:** a
  guarda da ação estava atrás de `if (eco)`, logo *"Você já usou sua ação nesta
  rodada"* **nunca disparava na rodada 1** — o que explica as **zero chamadas** que
  W2 contou sem saber porquê. **O segundo golpe na primeira rodada passa a ser
  recusado, e nunca tinha sido.**
  **O que o jogador ganha, com número medido em duas lutas:**
  o **custo nasce escrito dentro da casa** em *Alcançável* (83 números em `cidade`,
  38 em `estrada`), em `amberSoft` a **12,40:1** — a peça pintava `#000000`, que
  daria **1,08:1**, e o `desenho` curou-a antes de ser construída; o **roving
  tabindex** levou as paragens de `Tab` até ao `Atacar` de **84 (ou 1, na mesma
  luta) para 3, com variância 0** — *não era longo, era impossível de aprender,
  porque mudava*; e no telefone a **tira de consulta foi desfeita** (149 → 44 px,
  campo 296 → 396, **12 → 36 casas inteiras**), o que era **repor o que E1 desenhara**
  e a construção de E3 empilhara.
  **O achado que só o número dentro da casa revela:** em **6 das 10 plantas o herói
  abre dentro da lama**, e as oito vizinhas custam **3 m, não 1,5** — o erro de quem
  contava quadrados era exatamente um anel, e o único sinal era o véu ser menor.
  **Duas mentiras da tela, corrigidas:** `Mover` **armava com o conjunto vazio**
  (`aria-pressed=true` e a linha a mandar tocar uma casa que não existia); e o campo
  **perdia as 216 casas focáveis** quando o passo acabava, em silêncio.
  **E o defeito que só a luta viva apanhou, com a suíte verde — o de E3 outra vez:**
  `impedimentosDaFileira` estava certa e provada em Node, e **a tela nunca a
  chamava** — o botão engolia o toque e a linha continuava a falar da distância do
  inimigo. *Uma suíte verde sobre uma regra que a tela não invoca é a pior espécie
  de verde.* Corrigido com dente novo em `check-tela-de-batalha.mjs`.
  **A dívida de entrada paga:** `custosDe` nasceu em `src/grid.js`, que é território
  do sistema, e `alcancaveisDe` passou a ser a leitura das chaves dele. A asserção
  que o justifica carrega a busca **antiga** íntegra e prova conjunto idêntico em
  **dez plantas × três passos × dois modos = 60 buscas, 1.739 casas**.
  O escrito fica em `mente/e4-jogo.md`, `mente/e4-desenho.md` e no bloco de E4 de
  `mente/formas.md`.

  **O que NÃO coube, e fica endereçado para não se perder** *(a mesa parou aqui por
  ordem da pessoa, para ela avaliar — não por falta de caminho)*:
  1. **A mira na criatura** — `src/grade-de-batalha.jsx`, a linha
     `const clicavel = mirando ? tiro : indo;` na camada do toque; `podeIr` ×
     `noAlcance` já vivem separados ali ao lado. Peça `A mira`, conjunto `172:5328`.
     **Decidido e não construído:** o alvo é a **casa**, nunca a ficha (a ficha mede
     **38,4 px**, abaixo do piso de 48), e **armar um verbo de criatura apaga o véu
     do passo** — 83 casas âmbar e 1 alvo âmbar seriam uma cor a dizer duas coisas.
  2. **O varredor do anel** — as cinco maneiras de o apagar já estão em prosa na
     caixa de `.tv-anel-foco` (`src/estilo.js`), e **a lei já está no código**
     (`outline` a carregar, `box-shadow` só no vão). Falta **o dente que a prenda** —
     e ele paga **A11** de brinde, que é a irmã exata da quarta maneira.
  3. **A marca na borda** — **desbloqueada e não montada, por tempo e não por falta
     de dados**: `combate.js:441`, `lugarDaAcao` devolve `onde`, `alvoOnde` e
     `metros`. Peça `A marca de borda`, `53:43`, 8 variantes.
  4. **Buraco declarado pelo `oficial`:** a marca `a paragem` só desenha com
     `podeIr.size > 0` — **com o passo gasto a paragem existe e não se vê**.
     `src/grade-de-batalha.jsx`, a linha `{!focada && podeIr.size > 0 && (`.
  5. **Por que 3 paragens de `Tab` e não 2:** a primeira é o `⤢ ampliar`, que K4/E3
     puseram na ordem de propósito. **A variância é 0, que era o que a catraca
     queria.** Para chegar a 2, o que sai é o `⤢` — e isso é decisão de desenho.
  6. **`usarTelefone()` não reage a mudança de viewport depois de montado**
     (`src/painel-batalha.jsx:66-78`). *Ressalva honesta do `oficial`:* pode ser a
     emulação a não disparar o `change`, e uma rotação real dispararia — **não se
     sabe distinguir sem um telefone de verdade**. O custo de estar errado é o
     telefone abrir em arranjo de mesa.
- [ ] **E5 · o tabuleiro conta o que o inimigo VAI fazer** · de: pessoa · 15/09
  *(**E4 deixou-lhe o chão pronto, e um dado novo que ela não tinha:** o passo
  **custa** (a `economia` nasce com a luta), o custo está **escrito dentro de cada
  casa alcançável**, a grelha é **um** ponto de paragem com as setas por dentro, e
  `custosDe` devolve **metros por casa** — que é exatamente a moeda em que uma
  ameaça se escreve. E o motor passou a dizer **onde**: `lugarDaAcao`
  (`combate.js:441`) devolve `onde`, `alvoOnde` e `metros` por ação do inimigo. **A
  experiência jogada que a aprovou continua a valer, e agora tem contraprova:** o
  `jogo` fez **zero decisões espaciais** numa luta inteira porque nada pagava por
  estar num sítio — e E4 acabou de fazer o sítio pagar. **Leve os seis itens
  endereçados de E4 acima**, em especial a **mira** e a **marca na borda**: as duas
  são meias-peças desta, não dívidas separadas.)*
  **Aprovada em 15/09.** Experiência jogada: numa luta inteira o `jogo` fez
  **zero decisões espaciais**, porque nada no campo pagava por estar num
  sítio em vez de noutro. Antes do turno do inimigo, **as casas que ele
  ameaça acendem**, com o alvo escrito — o jogador vê e decide: sair,
  cobrir-se, aceitar. **O porquê que a torna barata:** a regra já está toda
  lá (paredes com cobertura, terreno que cobra, alcance por tamanho, golpe
  livre por dar as costas) — falta o jogador poder usá-la. Um tabuleiro onde
  a posição não muda nada é um tabuleiro decorativo.
  Cuidado herdado da Fase N: o que o campo mostra é **a intenção do degrau
  daquele inimigo**, não onisciência — um bruto não telegrafa um plano que
  não tem.

- [ ] **E6 · a luta abre onde a tabela mandar** · de: pessoa · 17/09
  **Aprovada em 17/09.** A abertura sai de `grid.js:569-575` — herói em
  `y = altura−1`, inimigos em `y = 0` —, logo **a distância do combate é a
  altura da planta e mais nada**: a masmorra abre a 25,5 m por ser
  **estreita**, a taverna a 12 m por ser **baixa**. Ninguém decidiu isso.
  Passa a sair de **tabela**, como todo número desta casa. Medido: abertura
  média **19,95 m**, **10/10 plantas recusam corpo a corpo no turno 1**, e
  **1,4 rodadas por luta de pura caminhada** — que X4 pôs preço: **~9,7
  pontos de vitória por rodada andada**.
- [ ] **E7 · a régua mostra a planta inteira** · de: pessoa · 17/09
  **Aprovada em 17/09.** A régua deixa de rotular só o que está na tela e
  passa a rotular **a planta toda** — 18 colunas cabem nos 337 px do telefone
  a 18,7 px, **a letra nunca sai e custa zero casas** —, com a janela do
  campo virando um trecho realçado dentro dela. **O porquê, numa frase:** hoje
  ela responde *"como se chama isto que vejo"*, e a pergunta que um campo de
  33% faz o tempo inteiro é **"o que existe que eu não vejo"**.

### Fase S — o Duelo e a sala ganham momento
Decisão da pessoa (14/09) sobre as duas: *"vamos corrigir."*

- [ ] **S1 · o Duelo é jogado, não lido** · de: pessoa · 14/09
  Hoje: **3 cliques do menu ao resultado**, e o vencedor aparece **antes**
  das 48 linhas de log. Queda a queda, com o resultado por último — e o
  jogador tocando alguma coisa entre uma queda e outra. O motor não muda:
  a luta já é determinística e já está calculada; o que muda é **quando o
  jogador fica sabendo**.
- [ ] **S2 · a sala ao vivo tem um momento partilhado** · de: pessoa · 14/09
  Medido em duas abas reais: a escolha sincroniza em ~1s, **o resultado
  não** — um lado viu a luta, o outro ficou 10s parado sem aviso. Os dois
  lados precisam ver *o duelo acontecendo*, ao mesmo tempo. Cuidado: o
  protocolo da sala (`api/sala`) é **pesado** — se a solução exigir mudá-lo,
  volta à pessoa.

### Fase G — os gestos que o jogador já conhece
Decisão da pessoa (14/09): *"vamos corrigir também."*

- [ ] **G1 · `Esc` fecha, e o fundo fecha** · de: pessoa · 14/09
  **15 sobreposições, 4 regras de fecho, e `Escape` não fecha nenhuma.**
  Uma regra só, em todas: `Esc` fecha, clique no fundo fecha, e o `✕` tem
  uma forma só (hoje são 8 visuais e 4 tamanhos). Catraca: nenhuma
  sobreposição nova nasce sem as duas saídas.
- [ ] **G2 · "não pode agora" recusa, e DIZ POR QUÊ** · de: pessoa · 14/09
  Achado de D1, da mesma família: **8 opacidades diferentes**, mas
  `cursor: not-allowed` aparece **4 vezes no projeto inteiro**.
  *(**corrigido em D3**: "a maioria continua clicável" está **errado**. Dos
  36 botões com opacidade condicional, **33 têm `disabled`** — o navegador
  recusa de verdade. **O defeito não é o clique fantasma, é o SILÊNCIO.**
  E o `jogo` mediu o que dói: `bloqueado = carregando || !!rolagem` governa
  **15** controles, e "o Mestre está escrevendo", "há um dado esperando" e
  "proibido para sempre" saem hoje **no mesmo cinza**. O `Agir →` carrega
  três razões na mesma cara. Então a etapa deixa de ser sobre o cursor e
  passa a ser sobre **a peça ter onde escrever a razão** — o que a
  biblioteca de D3 agora tem.)*

### Fase L — a letra, medida por plataforma
Decisão da pessoa (14/09): *"nosso texto precisa ter padrões e tem que ser
pensado na experiência do usuário em qual plataforma ele está usando; um
celular não deve ter letra muito pequena, mas ao mesmo tempo não muito
grande para não tomar muito espaço. Use tamanhos comprovados pra cada
plataforma."*

- [ ] **L1 · a escala, com fonte citada** · de: pessoa · 14/09
  Hoje: **18 degraus de tamanho, e 542 dos 1.107 textos (49%) são 9px ou
  10px** — em JetBrains Mono, a fonte "do que é máquina", que tem 682 usos
  contra 315 do corpo. Nenhum alarme dispara porque a WCAG não tem piso de
  tamanho; o contraste passa. A escala vira **tabela**, com um degrau por
  papel (prosa, rótulo, número, título) e **dois valores por degrau: toque
  e ponteiro**. *Comprovado* aqui significa **citar a origem** de cada piso
  (as diretrizes de plataforma e de acessibilidade que o `desenho` for
  buscar), não escolher por gosto — e o corpo de leitura é o degrau mais
  importante, porque a prosa é a protagonista.
- [ ] **L2 · a mesma tela nas duas mãos** · de: pessoa · 14/09
  Aplicar a escala e **provar nas duas plataformas** com a mesma tela lado
  a lado — o `desenho` tem as ferramentas de janela para emular o celular.
  Medir o que a pessoa citou como critério: legível sem apertar os olhos,
  e sem comer o espaço da cena. A fonte de máquina volta ao seu lugar: o
  que é número é mono, o que é prosa não.

### Fase D — a casa ganha um desenho (a mesa de design nasce)
Decisão da pessoa (14/09): três agentes novos — `jogo`, `desenho`, `aprendiz`
— trabalhando pelo Figma, com liberdade para mudar o que for preciso **desde
que comprovado**. Meta declarada: *"o melhor jogo de RPG com a melhor
experiência e qualidade de um AAA."*

Esta fase **não faz nada bonito ainda**, e é de propósito: ela constrói o
chão que impede o defeito que a pessoa nomeou (a mesma ação com duas caras).
Medir antes de mexer, como a Fase A ensinou — aqui aplicado ao visual.

- [x] **D1 · o inventário honesto** · feita em v9.242 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **D2 · o estilo ganha casa própria** · feita em v9.244 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **D3 · a biblioteca no Figma, e a estrada de volta** · feita em v9.246 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **D4 · as formas escritas** · feita em v9.249 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [x] **D5 · a catraca do desenho** · feita em v9.252 · texto em `mente/arquivo/pauta-desenho-feitas.md`
- [ ] **D6 · o sistema para de falar de si mesmo** · de: jogo · 14/09
  *(etapa nova, nascida de D1 — o `jogo` jogando achou a lei mais partida do
  dia, e ela não cabia em D5 como estava escrita.)*
  **13 strings de bastidor chegam à tela**, com a quota de API do autor à
  cabeça: `Limite diário alcançado (500 chamadas)… me avise: o teto sobe`
  (`api/_portao.js:174`), `sem gastar tokens` (`App.jsx:2796`), `semente` e
  `selo da luta` (`:4491`), `roster` ×4 (`:4402, 4416, 4461`), `o modelo
  forte` (`:3682`), `o sistema está traduzindo` (`:3770`), `espinha`
  (`:3587`), `tabelas geradoras` (`:3557`), `canal` (`:4381`). Limpar as
  strings, e **`check-formas.mjs` ganha um quarto dente**: lista negra de
  vocabulário de bastidor nas strings renderizadas (`token`, `semente`,
  `seed`, `selo`, `roster`, `preset`, `postura`, `modelo`, `prompt`,
  `canal`, `chamadas`, `o sistema`, `tabela`), com perdão escrito — e
  `api/*.js` **tem** de entrar no varrimento, porque a pior string de todas
  vem de lá e chega inteira ao jogador. Uma cor errada faz o jogo feio;
  `sem gastar tokens` no inventário faz o jogo deixar de ser um jogo.

  **Depois de D5**, a mesa propõe livremente pela pauta — a animação do
  dado, a batalha que toma a tela (essa é `pesado`, da pessoa), a paleta, o
  que for. Antes de D5, cada melhoria custaria o dobro e apodreceria na
  metade do tempo.

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **a gaveta `✦` desaparece em repouso, e é a única coisa que R17 tirou ao
  jogador** · médio · de: regente · 24/09 · **para o `jogo` decidir**

  **O que aconteceu, e está declarado e não escondido.** R17 tornou a segunda
  linha do campo do turno condicional (nasce ao focar, some ao largar) e devolveu
  **+16,7 px permanentes** à página, mais a prosa na primeira tela do turno da
  chegada. **O preço, medido pelo `oficial`:** em repouso a gaveta `✦` também
  desaparece na coluna estreita — **armar uma habilidade passa a custar um toque
  a mais** (tocar o campo primeiro). É consequência directa da decisão do §3 e
  cabia dentro dela, mas **não foi nomeada a ninguém antes de acontecer**, e é a
  única coisa desta etapa que o jogador *perde*.

  **A proposta, e é uma escolha entre dois números que já existem:** ou fica como
  está (repouso **322,7 px**, +16,7 contra os 306 de partida, e um toque a mais
  para armar), ou a gaveta sobe para a primeira linha ao lado do campo por **56
  px** — e aí o repouso volta a **266,7 px**, que é **pior que os 306 de onde
  partimos**. *O `jogo` decide, porque é momento: a pergunta é quantas vezes em
  20 turnos se arma uma habilidade, e ele tem o censo.*

  **E a régua nova dele responde a isto sozinha, se for aplicada:** *nomeie o
  momento em que a peça NÃO serve.* A gaveta não serve no turno em que se lê —
  logo a forma certa talvez não seja nenhuma das duas acima, mas a gaveta a ter
  **o seu próprio momento**, separado do campo.

- [ ] **`recusar` é o único gesto do cartão que muda o mundo, e é o único sem
  marca** · médio · de: jogo · 16/09 (K4) · **o achado que o número deu e a
  intuição não daria**
  **A conta:** *responder* e *deixar expirar* produzem mundos **idênticos** em
  100 % de 4 000 sementes. `recusar` leva o dano da luta de **13,13 para 21,67**
  (+65 %) e a morte de **13,7 % para 49,3 %** (mesa A); de 27,21 para 31,00 e de
  85,2 % para **99,6 %** (mesa B). **É a única das três teclas que o jogador pode
  tocar para que alguma coisa aconteça de diferente — e o cartão trata-a como se
  não tivesse acontecido.**
  **A decisão de K3 de não lhe dar linha de log continua certa** (porta 10 de K2:
  o log fica byte a byte o de hoje). O que caiu foi a justificação da ausência de
  **glifo e de número** — *«não houve gesto»* —, porque o gesto mais consequente
  do jogo é exactamente esse. **Precisa dos dois seniores**, e não é peça nova: é
  decidir o que o recuo mostra **dentro** do cartão, sem sair para o log.

- [ ] **o cartão mente por omissão sobre o preço do «sim»** · médio · de: jogo ·
  16/09 (K4)
  `revidar · 0 PM — na mesma batida` diz que não custa nada, **e custa a reação da
  rodada**. Medido: quando a janela abre num erro, a rodada ainda traz **5,85** de
  dano que vai chegar **coberto porque a reação já foi gasta no revide**. E
  `contra_ataque` tem `chance: 0.55` que o cartão também cala.
  **A palavra, dentro do orçamento de 40 caracteres de K1 (mede 38):**
  `revidar · 0 PM — e a guarda fica aberta`. Não diz reação, não diz rodada, não
  diz recurso: diz o **efeito**.
  **E a segunda metade é fiação, não peça:** `PALAVRAS_DA_CHANCE` já existe, já
  está certa e já sabe escrever o risco na fenda do preço — **só não é lida por
  este caminho**. Casa com o item do preço que cala o risco, logo abaixo; são a
  mesma dívida vista de dois lados.

- [ ] **`Etapa=Escolhendo` foi desenhada, fabricada, montada e nunca abre** ·
  leve (o registo) · de: jogo · 16/09 (K4)
  **12 classes em 12** têm exactamente **um** verbo de `sofre_dano`, logo o leque
  **nunca** se abre — e `ATALHOS_DA_JANELA` tem uma linha (`escolher`:
  `ArrowDown/ArrowUp + Enter`) que é **letra morta**. É a peça mais cara da fase a
  não fazer nada. **Não se conserta sozinha, e é por isso que está aqui em vez de
  ser feita:** ou o acervo de reações cresce (fila do sistema), ou a proposta de
  K4 no topo passa e o leque ganha o trabalho para que foi fabricado. **Fica
  registado para que ninguém a "limpe" por parecer morta** — e para que o dia em
  que ela abrir não seja recebido como peça nova.

- [ ] **a família das pílulas à mão tem 18 membros, e a primitiva agora existe** ·
  médio · de: desenho · 16/09 (K4)
  K4 mediu **19** e converteu **1** (a fila da ficha). Ficam **18**: `App.jsx` 13,
  `painel-mapa` 2, `grade-de-batalha` 1, `painel-codex` 1, `painel-talentos` 1 —
  cada uma com a mesma quinta gramática que a fila tinha (preenchimento âmbar
  cheio, borda `T.line` a **1,295:1**, sem filete, sem `aria-pressed`). **O dente
  D5f congela o número no dia em que nasceu: a dívida só desce.** Converter é
  mecânico agora que `PilulaDeEscolha` existe — **uma etapa, não um ciclo**, e
  vale mais por `aria-pressed` (que mede **0 ocorrências em 221 `<button>`** de
  todo o `src/`) do que pelos pixels.

- [ ] **o preço cala o risco nas duas reações que podem falhar** · médio · de:
  regente · 16/09 (K3) · **achado na conferência viva, não na suíte**
  Na tela, hoje, o cartão do ladino diz literalmente **`💨 esquiva ágil · 0 PM —
  anula`**. `esquiva_agil` tem `chance: 0.6`. **O preço promete uma certeza sobre
  uma aposta que falha 2 em 5** — e `formas.md:1076` já tinha escrito a proibição
  pelo nome: *«oferecer "corta tudo" calando que falha 2 em 5 seria mentir o
  preço»*. `contra_ataque` (0,55) tem o mesmo problema.
  **Porque acontece, com a conta:** `PALAVRAS_DA_CHANCE` existe e está certa, mas
  a fenda do preço tem **40 caracteres** (K1, medido a 375 px) e
  `esquiva ágil · 0 PM — anula · mais vezes que não` mede **48**. A regra de hoje
  — *a chance sai, o preço nunca se corta* — está certa na prioridade e errada no
  resultado: **as únicas duas reações cuja chance importa são exactamente as duas
  que nunca a mostram.**
  **Três saídas, e nenhuma é para decidir de fim de ciclo:** (a) a chance ganha
  **segunda linha** no cartão — K1b já deixou `Etapa=Chamando` esticar para duas,
  e o chamado tem 56 px; (b) o orçamento sobe, porque **K3 deu ao cartão um teto
  de 560 px** e os 40 caracteres foram medidos para 375 — *o número é de outra
  peça*; (c) a chance vira **glifo ou peso de traço**, sem custo de largura.
  **Precisa dos dois seniores**, e é a primeira coisa que K4 vai encontrar
  quando perguntar por que o jogador aceita a esquiva sem ler.

- [ ] **`#FF9A85` literal no número flutuante do tabuleiro** · leve · de:
  desenho · 16/09 (K3)
  `grade-de-batalha.jsx:282` pinta o número de dano que sobe do quadrado com um
  vermelho escrito à mão, **fora de `T`**, ao lado do `T.danger` que devia ser. É
  um tom que nunca passou por tabela nenhuma. **Uma linha**, e o `desenho`
  encontrou-o a ler a 13.ª porta do segredo do dano — não é de K3 e por isso não
  foi consertado de carona.

- [ ] **o dente `D5e.2` ficou com folga zero, e o conserto é melhorá-lo** ·
  leve · de: desenho · 16/09 (K3)
  `check-formas.mjs:765` compara `duracoesVistas.length >= queAnimam.size`. Antes
  de K3 eram **14 durações para 13 classes** (folga 1: `.tv-dice` declara duas);
  com as sete novas ficou **20 para 20** — verde, e **a próxima classe de duração
  variável fica vermelha sem nada de errado ter acontecido**. **O conserto é uma
  linha e torna o dente melhor, não mais frouxo:** contar à parte as classes cuja
  duração é `var(--…)` e **asserir que são exactamente uma** — `.tv-janela-tempo`
  é a única classe da casa cuja duração, por lei, não mora na folha. O dente passa
  a **provar a lei** em vez de apenas não tropeçar nela.

- [ ] **os 133 endereços de linha são uma catraca que qualquer edição do
  `App.jsx` desloca — e ela já cobrou uma lápide** · médio · de: regente ·
  16/09 (K2)
  **[K3, 16/09] Cobrou outra vez, no ciclo seguinte, e mais caro:** a janela da
  reação acrescentou **424 linhas** ao `App.jsx` e `check-acoes-do-jogador.mjs`
  passou a acusar **90 divergências — todas de endereço, nenhuma de
  comportamento**. Foram re-medidas à mão por um mapa de linhas antigo→novo. **É
  a segunda vez em dois ciclos**, e o segundo pagamento foi 2,7× o primeiro; a
  catraca não mede o jogo, mede o quanto o arquivo não se mexeu.
  **O achado, e ele saiu de pagar a dívida de W2:** ao levar três funções do
  `App.jsx` para `golpe.js`, apagar as 33 linhas empurrava **133 endereços
  `src/App.jsx:<linha>`** cravados em nove arquivos de `testes/` — o funil e as
  recusas de `acoes-do-jogador.mjs`, o `pushMsgs` de `check-acoes-do-jogador`,
  `check-formas`, a régua de combate, `teste-regua`, `teste-guardado`. **Alguns
  são verificados por varredor** (`pushMsgs segue em src/App.jsx:7504`), logo o
  deslocamento não é cosmético: é a medição a mentir com a suíte verde. Ficou no
  lugar **uma lápide de exactamente 33 linhas de comentário**, com o motivo do
  próprio tamanho escrito dentro.
  **A proposta:** o endereço deixa de ser um número e passa a ser **uma âncora
  de texto** — um trecho curto e único do código, que um varredor resolve em
  linha na hora de falhar. *É o mesmo movimento que a âncora de recusa fez nesta
  etapa quando a frase mudou de arquivo: `check-acoes-do-jogador` deixou de
  procurar num arquivo fixo e passou a dizer ONDE procura.* **Porquê:** um
  endereço de linha num arquivo de 21 mil linhas é uma catraca que só está certa
  até à próxima edição — e a casa acabou de pagar 33 linhas de comentário para
  não a partir. *É trabalho de uma tarde, e paga a lápide no mesmo dia.*

- [ ] **`A escolha` tem os dois defeitos que esta casa já conhece, e vai ser a
  peça que carrega o nome do inimigo** · médio · de: desenho · 16/09 (W1)
  Lidos em `20:77` ao confirmar que *Forma=Pílula* serve de alvo na fila do
  polegar. **Ela serve** — e `Estado=Escolhida` cobre também *"o que o toque único
  usaria"*, sem estado novo. **Mas faltam duas correções, e nenhuma é peça nova:**
  1. **`Pilula × Foco` mede 75 px contra os 47 das outras três — cresce 28 px.**
     Numa fila de alvos, **tabular empurraria o tabuleiro em mais de meia casa** —
     é o defeito do *Impedido* de E1 outra vez, na peça seguinte. E tem preço
     medido: **com o foco, a região do veredito vai a 105 px e a devolução de W1
     ao campo é ZERO.** *O anel tem de ser desenhado sem mudar a caixa.*
  2. **`rotulo`, `a marca` e `a razao` são CAMADAS, não propriedades**
     (`componentPropertyReferences` vazio nos três). É a doença que E2
     diagnosticou e curou em três peças — ***num componente cujo texto muda por
     instância, texto que não é propriedade é um override à espera de se
     apagar*** — e **esta é a quarta**, numa peça cujo rótulo vai ser **o nome de
     um inimigo**: muda em toda instância e em toda luta. `a razao` é a fenda que
     leva o `· 3 m`; existe, está escondida por omissão, e serve.
  **Por que o `desenho` não as pagou em W1:** é peça viva sob composição que o
  `jogo` ainda não reviu — a mesma condição que E1 pôs e E2 respeitou.

- [ ] **a reserva da razão sobe do botão para a fileira** · médio · de: desenho ·
  16/09 (W1)
  **Medido na peça, e é o terceiro round do mesmo achado.** O `Botao` *Gesto ·
  Normal* mede **63 px**, não 44, porque **reserva 19 px para a linha da razão
  nos quatro estados** — foi a correção que E1 fez para o *Impedido* não empurrar
  o tabuleiro, e estava certa. **Mas na fileira de batalha essa reserva não serve
  para nada:** os verbos partilham **uma** linha do veredito, e a razão nunca
  renderiza por botão (`mostrar a razao = false` em todos). E1 escreveu *"três
  fileiras de 44 px = 144"*; a peça mede **3×63 + 12 = 201**. **São 57 px a mais,
  e uma casa pede 48: a reserva da razão custa mais do que uma fila inteira de
  casas no telefone.**
  **O caminho, e não é mexer na peça:** *a reserva sobe de nível — do botão para
  a fileira*. Quem compõe uma fileira onde o *Impedido* pode aparecer reserva a
  altura **uma vez, na fileira**; quem compõe uma onde ele não pode não paga
  nada. **Mesmos pixels quando a razão pode acontecer, 57 px mais barato quando
  não pode.**
  **Por que o `desenho` NÃO o pagou em W1, e a recusa está certa pela terceira
  vez:** `A linha` (`22:46`) compõe quatro instâncias que dependem de `a razao`,
  e ***peça mudada em silêncio por baixo de uma composição é pior do que peça com
  espaço reservado***. É a mesma condição que E1 pôs e E2 respeitou — e agora tem
  o número que faltava para a fechar. *(Parente do item "a razão sai do `Botao` e
  passa a ser sempre `A Consequência`", mais abaixo: são o mesmo achado visto de
  dois lados, e fecham juntos quando o `jogo` rever `A linha`.)*

- [ ] **D5d · a catraca não vigia a própria paleta** · leve · de: desenho · 15/09
  **Achado a construir o `lineStrong`, e é um buraco na catraca que ele mesmo
  atravessou:** um token novo em `T` passa por **todos** os portões da casa com
  **zero** leitores. `teste-ligacao` §2 varre `^export` e um token é **propriedade
  de `T`**, não export; `check-formas` isenta a zona `T` de propósito (uma paleta
  que não pode crescer é sagrada, que é o oposto da lei). Resultado: a lei do
  export morto vale para toda regra da casa **menos** para a cor.
  **O dente:** toda chave de `T` tem **≥2 leitores** em `src/`. **Medido: `T` fica
  verde no dia em que nasce** — o mínimo é **8**, em `T.onSecond`. `MATERIAIS`
  fica **fora**, por escopo e com o motivo escrito: as 13 chaves têm 1 leitor
  cada, e está certo — há **uma** cortiça.
  **E aperta primeiro o token de quem o propôs:** `lineStrong` entrou com
  exactamente **2**, no piso, contra os 8 do segundo pior. *Uma catraca que estreia
  perdoando o seu autor não é catraca.*

- [ ] **a mira reprova o piso, e agora tem número exacto** · leve · de: desenho ·
  15/09 · **espera o bastão do `App.jsx`**
  O contorno da mira é violeta a 60 % sobre `bg` = **2,689:1** e reprova a
  WCAG 1.4.11. **O defeito é a opacidade, não o tom** — trocar a cor piora
  (`lineStrong` a 60 % = 2,071), e a mira tem de continuar violeta porque há três
  coleções na mesma tela. O conserto que E1 propôs (**70 % = 3,254**) fica
  **0,018 abaixo** do piso de 3,272 que o `lineStrong` instalou: *passa a norma e
  falha a casa.* **O número é 74 % (3,484).** Uma linha, em `App.jsx`.

_Os quinze abaixo saíram da medição de D1 (14/09). A ordem é por retorno:
o barato e mecânico primeiro, o que precisa de decisão depois. Vários só
fecham de verdade **depois de D2 e D5** — o item diz quando._

**Os quatro primeiros nasceram em E1 (15/09)** e são defeitos de **peça**, não
de tela: E3 vai montar com estas peças, e cada um deles vira um defeito no
código no dia em que for montado.

*(Três pedidos de E1 **não** estão nesta lista porque foram **pagos dentro da
própria etapa**, e vale dizer o que eram: `Botao` *Impedido* era **19 px mais
alto** que *Repouso* e **empurrava o tabuleiro** ao ficar indisponível — passou
a ter **uma altura por `Papel`×`Tamanho`**, com a linha da razão reservada nos
quatro estados, e ela não é espaço morto: é onde `A Consequência` do preço se
senta; `Barra de medida` tinha o trilho fixo em 90 px e truncava `17/20` em
`17/` no telefone — agora estica e encolhe, com o trilho a ir de 285 px a
**48** entre 359 e 120 de caixa, porque **quem absorve é o trilho, o único
elemento cuja largura não carrega informação**; e `A marca de borda` foi
**fabricada** — `53:43`, 8 variantes.)*

- [ ] **a razão sai do `Botao` e passa a ser sempre `A Consequência`** · médio · de: desenho · 15/09 (E1)
  É o fim de linha do achado de E1: o nó *"a razão"* do `Botao` existe só nas 12
  variantes em que ele **recusa**, e os tons *Impedimento* e *Espera* de
  `A Consequência` existem exatamente para isso — **foram construídos duas vezes
  por acidente**. O `desenho` **recusou fazê-lo nesta rodada, com motivo, e a
  recusa está certa:** `A linha` (`22:46`) compõe **quatro** instâncias de
  `Botao` que dependem de `a razao` e `mostrar a razao`, e apagá-las mudaria
  calada uma peça que o `jogo` não reviu. ***Peça mudada em silêncio por baixo
  de uma composição é pior do que peça com espaço reservado.*** Fecha quando o
  `jogo` rever `A linha`.
- [ ] **o eixo *Largura* do `Botao`** · médio · de: desenho · 15/09 (E1)
  `formas.md` diz que *Largura* é variante (*"cabe no conteúdo"* / *"ocupa a
  linha"*); no Figma o conjunto tem `Papel × Estado × Tamanho` **e nada mais**.
  Em *A pergunta que expira* os botões ocupam a linha **por sobreposição na
  instância**, que é a definição de um eixo em falta. **Não foi pago em E1 de
  propósito, e o motivo é um número:** o eixo leva o conjunto de 24 para **48**
  variantes, acima do teto de 30 que a disciplina de biblioteca recomenda; e a
  alternativa — mexer na estrutura interna das 24 — **mudaria calado toda
  composição que já as usa**, incluindo *A linha*. Pesa porque a condição 2 de
  *A linha* (*"no telefone a chamada ocupa a largura"*) depende dele.
- [ ] **a masmorra 7×18, o caso que nenhum quadro mostra** · leve · de: jogo · 15/09 (E1)
  Das dez plantas, **nove aparecem inteiras** no arranjo de duas colunas; a
  masmorra 7×18 transborda **58 px — uma casa e um quinto**, e é **a única que
  rola num monitor**. Portanto é o único caso em que as regras de enquadramento
  (o herói no centro da área livre; a câmara só se move quando é obrigada) e a
  marca de borda fazem trabalho de verdade no desktop — **e não tem quadro**. É
  o que o `jogo` comporia a seguir, e ele disse-o em vez de o esconder.
- [ ] **o branco invisível na raiz das peças de D3/D4** · leve · de: desenho · 15/09 (E1)
  Os componentes de D3/D4 carregam na raiz um preenchimento **branco invisível**
  (`visible: false`, sem variável) — o branco que `figma.createAutoLayout()` dá
  de nascença, **desligado em vez de removido**. Amostrados 3 de 3 (`Barra de
  medida`, `Botao`, `Consequencia`): todos o têm. **Não pinta nada hoje; pinta
  branco no dia em que alguém ligar a visibilidade**, e qualquer varredura de
  *zero hex solto* vai encontrá-lo. A regra de D4 continua certa e é só aplicá-la:
  **quadro que só organiza leva `fills = []`**, não `fills = [branco desligado]`.
  As quatro peças de E1 nascem sem ele. *(Contado por amostra, não por varredura
  do arquivo — e é por isso que é item e não nota.)*
- [x] **dois números que E3 leva de graça, e um deles é uma reprovação viva**
  · leve · de: desenho · 15/09 (E1) · **fechado em E3 — e nenhum dos dois foi pago
  por E3**
  **O primeiro tinha-se corrigido sozinho, de lado, e ninguém deu por isso.** A
  conta estava certa: `T.violet` a 60 % sobre `bg` dá **2,689:1** e reprova o WCAG
  1.4.11. Mas **W2 trocou o token para `T.violetSoft`** por outro motivo, e o
  contorno mede hoje **3,786:1 — passa com folga**. O `oficial` mediu antes de
  aplicar e **não tocou na linha**. *É o melhor argumento que esta mesa tem para a
  regra de medir de novo antes de corrigir um número escrito noutro ciclo.*
  **O segundo já tinha sido pago por E2**, e a catraca
  `check-endereco-do-tabuleiro.mjs` §6 morde se `#141020` voltar.
  **De brinde, um terceiro que ninguém tinha contado:** um `#14101F` escrito à mão
  dentro de `PainelHabilidades` — `T.onSecond` byte a byte —, achado e morto ao
  levar a gaveta para casa própria.
  *(o texto original:)*
  Os dois são de **E3**, e ficam aqui para não se perderem se E3 demorar.
  (1) **O contorno da mira REPROVA o piso de não-texto hoje.**
  `grade-de-batalha.jsx:433` desenha a união com `opacidade={0.6}`, e **violeta a
  60% sobre `bg` dá 2,68:1** contra os 3:1 do WCAG 1.4.11 — o âmbar a 60% dá
  3,85:1 e passa, o violeta não. **0,6 → 0,7** dá 3,24:1 e passa. É um número, e
  só se viu porque a discordância da borda obrigou a medir o contorno sozinho.
  (2) **`#141020` → `T.bg`** no fundo do tabuleiro (`grade-de-batalha.jsx:367`):
  é **literal solto** que a catraca D5a conta **e** está a **1,04:1** de `T.bg`,
  o que faz o vão de 2 px do anel de foco não se separar. A troca é invisível a
  olho nu — 1,04:1 é menos que a diferença entre `panel` e `bg`, que é 1,07:1 —
  e **conserta os dois de uma vez**.

- [ ] **nenhum número muda em silêncio** · médio · de: desenho · 14/09 (D4)
  *A proposta ambiciosa do `desenho`, e ela é `médio` pela régua nova: a
  pergunta do pesado é "o jogador teria de reaprender?", e aqui a resposta é
  **não**. Nada muda de lugar, nada muda de nome, nenhum fluxo muda — o que
  hoje acontece calado passa a acontecer à vista.*
  **O diagnóstico:** o Taverna calcula um jogo inteiro e **conta** o
  resultado em prosa cinzenta. 225 moedas entraram em dois turnos e o número
  só existe dentro da Bolsa. O XP subiu e a barra já estava cheia quando o
  jogador olhou. A vida caiu e a barra deslizou em 700 ms sem dizer quanto. A
  primeira missão da campanha virou a quarta de seis pílulas iguais. **O jogo
  tem o padrão certo e usa-o uma vez só** — o véu do dado.
  **A lei proposta:** *todo valor de estado que muda entre um turno e o outro
  veste a marca de "mudou agora", no lugar onde ele vive.* Três peças, e
  **duas já foram fabricadas em D4**: o `Selo` com *Mudou=Agora* (halo, três
  pulsos, e para) e a `Barra` com *Mudou=Golpe/Ganho* (o pedaço que saiu fica
  visível, o número escrito, e a barra de XP **enche** no fim da missão em
  vez de já estar cheia). A terceira é **O Realce** no log, também feita.
  **O que falta é conta, não tela:** uma primitiva `Numero` que saiba a
  diferença entre o valor de agora e o do turno passado, e entregue
  `{ valor, delta, mudouAgora }`. Módulo puro, com suíte — **e por isso é da
  fila do sistema**, não desta: a mesa pede, o `backend` escreve.
  **O preço, dito por escrito:** movimento demais cansa, e esta lei põe
  movimento em muitos lugares ao mesmo tempo. Três defesas, todas na forma: o
  halo para depois de três pulsos; a marca vale **um turno** e some; e sob
  `prefers-reduced-motion` **nada pulsa** — parada, a marca diz o mesmo. Se
  ainda assim ficar demais, o corte é do `jogo`: **quais** números merecem a
  marca é momento. O `jogo` já pôs o seu teto: **no máximo dois por turno, e
  só para o que aconteceu *com* o jogador.**
  **A prova de que não é gosto** é a lei que a pessoa deu à mesa — *"devemos
  fazer o máximo para ter a experiência de um jogo e que ele realmente está
  fazendo coisas — não só lendo e escrevendo"* — aplicada ao único lugar onde
  cabe sem mexer em fluxo nenhum: os números que o jogo **já** calcula e
  **já** mostra, e que hoje mudam sem que ninguém veja.

- [ ] **os 80 literais que já são `T`** · leve · de: desenho · 14/09
  Dos 242 literais de cor nos arquivos de tela, **67 (28%) já são cores da
  tabela**: 24 hex idênticos a um valor de `T`, e 43 `rgba()` cujo RGB é
  exatamente uma cor de `T` com alfa — **44 deles só no `App.jsx`**. Um
  helper `alfa(cor, a)` e uma substituição mecânica apagam mais de um quarto
  da dívida. **O retorno mais barato da fase inteira**, e é ele que torna
  D5b zero-perdão.
  *(corrigido por D2: são **80**, não 67. D2 mudou a folha de casa e com
  isso ela passou a ser território varrido — dentro dela há mais **13**
  `rgba()` que já são `T` com alfa, 7 no `MOVIMENTO_CSS` e 6 no
  `SUPERFICIES_CSS`. D2 não as tocou de propósito: trocá-las à mão seria
  escrever a fórmula do `alfa()` treze vezes antes de ela existir. **Este
  item é agora pré-requisito de D5b**, não um vizinho dele.)*
  *(confirmado por D5, 15/09: são **80** exatos, e o dente D5b mede exatamente
  este número. Quando este item rodar, o teto de D5b vai a zero e as entradas
  **saem** da tabela — a catraca falha com `ENTRADA MORTA` se ficarem lá a
  dizer `0`.)*

- [ ] **o pergaminho ganha nome** · médio · de: desenho e jogo · 15/09 (D5)
  **71 literais em `painel-mapa.jsx` (41) + `planta-cidade.jsx` (30), e a prova
  de que é sistema é um acaso impossível: 10 hexes aparecem nos DOIS arquivos,
  escritos separadamente, e cobrem 52 dos 71 usos** — `#5C4A30` a tinta (×11),
  `#F0E6CC` o papel (×10), `#EADFC1`, `#6D5C40`, `#B4322E`, `#3A2E1C`,
  `#C9A45A`, `#A08A5E`, `#8D7A56`, e a família do mar. Dívida acidental não
  concorda byte a byte em dois arquivos.
  A casa dele **não é `T`** — `T` é semântica (`panel`, `line`, `danger`) e não
  deve crescer para `papel`, `tinta`, `estrada`, `mar`, `selo`. É
  **`MATERIAIS`**, a paleta física criada em D2, onde a cortiça já mora.
  **~11 tokens.**
  *(correção medida: as "irmãs em `rosto.jsx` e `carta-taro.jsx`" **não
  existem** — as duas são escuras e são dívida comum. `carta-taro.jsx` carrega
  8 cores de `T` exatas e é o depósito mais rico de D5b fora do `App.jsx`.)*
  Paga o perdão de D5a nos dois arquivos. E o `jogo` olhou e disse o que o
  torna barato: **é o único lugar do jogo onde a tela é clara**, e a fronteira
  entre as duas paletas é exatamente a borda do objeto desenhado — o título, as
  abas, a tira do lugar, o `✕` e a legenda são **100% `T`**. Não é vazamento, é
  moldura.

- [ ] **os pigmentos do dado de jogo** · leve · de: desenho · 15/09 (D5)
  77 literais em `semente.js` (38), `mapa.js` (13), `npcs.js` (10), `palco.js`
  (10) e `devocao.js` (6) — cabelo, pele, olhos, bioma, facção, relação,
  devoção. **Já obedecem à lei da casa** (estão dentro de tabelas nomeadas, ao
  lado de `rotulo` e `icone`), e por isso estão **fora de D5b por escopo**: uma
  cor de patamar que vira `T.amber` muda sozinha no dia em que a Fase L
  esquentar o âmbar, e a rampa de devoção deixa de ser rampa.
  O que sobra para este item é menor e é real: **`rosto.jsx` tem `#7A1F1F`, que
  é `CABELO[8]` exato** — cor de dado copiada para dentro da interface, a
  direção contrária e a única que é mesmo defeito.

- [ ] **a cor do primeiro pixel sai de uma fonte só** · leve · de: desenho · 15/09 (D5)
  `index.html` tem `<body style="background:#0E0C15">`, que é `T.bg` copiado à
  mão. **Possivelmente o único perdão eterno do projeto:** o `index.html` é
  servido **antes** do bundle e não tem como importar `T`. O item não é faxina,
  é uma decisão de duas linhas: o build **gera** essa linha a partir de `T`, ou
  a casa **aceita** a cópia e escreve isso no lugar onde ela vive. Hoje ela
  aparece nas duas tabelas da catraca com teto 1, sem data de validade.
- [ ] **uma forma para o destrutivo — e o contraste que reprova sai** · leve · de: desenho · 14/09
  O botão que **remove um companheiro do grupo** (`App.jsx:2540`) usa `#fff`
  sobre `T.danger`: **3,42:1, reprova em WCAG AA**. Os outros destrutivos
  (`painel-talentos.jsx:112` e `:417`, `painel-ascensao.jsx:72`) usam
  `#1A0F0D` (5,48:1, passa). São três tintas de texto-sobre-vermelho, duas
  inventadas na hora, e a ilegível está no único botão que apaga alguém.
  `T.onAccent` sobre `danger` dá 5,34:1 e resolve. Correção de
  acessibilidade, não de gosto.
- [ ] **`prefers-reduced-motion` cobre as 13 animações, não 3** · leve · de: desenho · 14/09
  Só `tv-anel-fora`, `tv-anel-dentro` e `tv-pisca` têm saída — e são as três
  menos importantes, o sigilo de espera de uma tela administrativa. As cinco
  **infinitas que rodam durante o jogo** não param para ninguém:
  `tv-dice`, `tv-pulse`, `tv-agonia`, `tv-reliquia`, `tv-anel-*`. `tv-agonia`
  pulsa vermelho **enquanto o herói estiver abaixo de ⅓ de vida** — pode ser
  a cena inteira. Fecha D5c.
- [ ] **nenhum veredito mora num `title`** · leve · de: jogo · 14/09
  A lei diz que toda ação irreversível mostra o preço antes. Hoje o preço do
  **Destino** (*"o segundo dado vale — mesmo se for pior"*) está num atributo
  `title`: invisível sem rato, inexistente no telemóvel. O `jogo` clicou sem
  saber que podia piorar. Mesmo defeito em `⤢` e no interruptor `🎲`, cujo
  **estado só existe no tooltip** — clicou, o emoji não mudou, e não ficou a
  saber se ligou ou desligou.
- [ ] **`⛺` em combate pergunta antes** · leve · de: jogo · 14/09
  Um emoji sem rótulo, clicado a meio de uma luta do torneio, **terminou a
  luta** — sem confirmação, sem dizer o que aconteceu ao adversário, sem
  ganhou/fugiu/desistiu. A ação mais irreversível da sessão inteira, atrás
  do controle mais mudo.
- [ ] **`tv-btn` não existe, e quatro ícones estão mortos** · leve · de: desenho · 14/09
  `tv-btn` é usada **5 vezes** em `painel-ascensao.jsx` e **não existe em
  `FONT_CSS` nem em lugar nenhum** — cinco botões carregando uma classe
  inerte que alguém no futuro vai tomar por padrão da casa. E
  `IconeBandeira`, `IconeGota`, `IconeCirculoX`, `IconeFrasco` nunca são
  renderizados: aparecem uma vez cada, **na linha de import gigante
  `App.jsx:163`**. Passam no `teste-ligacao` porque a lei conta "referência",
  e import é referência. **A catraca de export morto tem um furo do tamanho
  de uma linha de import** — fechá-lo é meio-item à parte, e é da outra fila.
- [ ] **`REVANCHE` faz revanche** · leve · de: jogo · 14/09
  O botão grande e dourado do resultado do Duelo devolve o jogador ao **ecrã
  de montagem**. O rótulo promete uma coisa e o clique faz outra.
- [ ] **o aviso cola-se ao botão que destrói** · leve · de: jogo · 14/09
  *"Começar uma nova campanha substitui a anterior neste dispositivo"* é
  **rodapé no fim da página**; o botão `Nova campanha` que substitui está
  longe dali. É a coisa mais cara do jogo, protegida pelo texto mais
  distante.
- [ ] **as moedas no cinturão** · leve · de: jogo · 14/09
  *(medido no jogo carregado)* A barra de status mostra **NIV, PV, PM, XP, o
  dia e o lugar** — e **não mostra o dinheiro**. `◉ 240` só existe **dentro**
  do painel Bolsa, e é o número que decide toda compra, todo suborno, todo
  presente e toda obra: o jogador abre uma gaveta para saber se pode pagar.
  Com o **Selo de estado** fabricado em D3/D4, o cinturão do cabeçalho é
  **montagem, não desenho novo** — nenhuma peça nova, nenhum fluxo mudado,
  nada para reaprender.
  *(substitui e absorve "as moedas existem no HUD", na fila desde D1: é o
  mesmo item, e agora tem a peça que o torna barato.)*
- [ ] **`.tv-margem-abas` é o padding-right da v9.197 outra vez, em
  `margin`** · leve · de: jogo · 14/09 (achado em D2)
  O comentário da própria classe conta, em vinte linhas, como uma
  declaração que vale 0 continuou mandando na cascata e colou o conteúdo na
  borda direita no telefone — e a correção da v9.197 matou o
  `padding-right` e **deixou o `margin-right: 0` vivo do lado**. A classe é
  usada em seis cartões (`App.jsx:3081, 3331, 20628, 20675, 20757, 21064`),
  todos com `mx-4 md:mx-8`; especificidade idêntica, e a nossa folha vem
  depois do Tailwind (CDN no `<head>`, ver `index.html:7`), então **ela
  ganha: 16px à esquerda e ZERO à direita**, nos seis. A declaração dentro
  do `@media (min-width: 768px)` é idêntica à base — ruído puro.
  É meia linha para apagar, e **não** foi apagada em D2 de propósito: a
  linha daquela etapa era *zero diferença na tela*, e esta muda pixel. É a
  mesma queixa de quem jogou no telefone, pela terceira vez no mesmo sítio.
- [ ] **o regex de `teste-celular.mjs:56` não afirma o que parece** · leve ·
  de: aprendiz · 14/09 (achado em D2)
  `!/padding-rights*:/` — o `s*` é "zero ou mais letras s" grudado em
  `right`, não um `\s*`. Passa hoje só porque não existe `padding-right`
  nenhum na folha; no dia em que voltar um `padding-right : 68px` com
  espaço, a catraca que existe para pegá-lo **não pega**. Uma barra
  invertida. (Território de teste de forma, logo desta fila.)
- [ ] **`T` ganha `dangerFundo` e `okFundo`** · leve · de: desenho · 14/09
  `#33201F` e `#1F3320` já existem, com **7 usos**, e são a única gramática
  de "estado com fundo" que o jogo tem. Estão fora da tabela por descuido,
  não por decisão.
- [ ] **vitória e derrota são dois ecrãs, e o meu campeão é marcado como
  meu** · médio · de: jogo · 14/09
  Medido lado a lado nas duas abas do PvP: quem perdeu e quem ganhou veem
  **o mesmo ecrã**, mesma cor, mesmo tamanho — `A Sombra vence · 2×1`. Nada
  diz qual dos dois campeões era do jogador. Para além da palavra do nome,
  os dois fins são pixel a pixel idênticos.
- [ ] **o turno diz de quem é a vez, no sítio onde se age** · médio · de: jogo · 14/09
  O painel `ORDEM DE INICIATIVA` marcou o inimigo como **`● AGINDO` por mais
  de 10 segundos enquanto o jogo esperava pelo jogador**. A linha do jogador
  não tinha marca nenhuma, e nada na barra de ação dizia "é a sua vez". Ele
  esperou, não soube se tinha travado, e descobriu escrevendo à sorte.
- [ ] **o momento merece um momento** · médio · de: jogo · 14/09
  A conclusão da primeira missão da campanha foi **a quarta de seis pílulas
  cinzentas do mesmo tamanho, na mesma cor, no mesmo tipo**, sem pausa, sem
  som, sem a barra de XP enchendo. Idem conquista desbloqueada, achado, e o
  nascimento silencioso de um sexto separador no menu. O jogo tem o padrão
  certo e usa-o uma vez só: **o modal do dado**, que escurece a tela, mostra
  `5 + 2 = 7` e depois "Falha" — *"o único momento da sessão inteira em que
  senti que estava a jogar"*. É o que o resto devia invejar.
- [ ] **uma gramática só para "escolher um entre N"** · médio · de: desenho e jogo · 14/09
  O `desenho` mediu no código: `CartaoDeEscolha` é usado 11 vezes, **todas na
  criação de personagem**; fora dali "escolha um da lista" é redesenhado à
  mão em 8 lugares, com "selecionado" ora borda âmbar, ora fundo violeta, ora
  só opacidade. O `jogo` tropeçou nas mesmas cinco gramáticas jogando —
  **quatro delas na mesma criação de personagem**: cartão grande, `<select>`
  nativo, botão-pílula, stepper `−`/`+`, aba-pílula. Junto: **"ação principal
  bloqueada" tem 3 comportamentos** (desativado com a razão escrita — bom;
  desativado e mudo — o `À ARENA →` que fez o jogador adivinhar; e ativo com
  erro vermelho longe do campo).
- [ ] **`ui.jsx` ganha o que falta** · médio · de: desenho · 14/09
  `BotaoDestrutivo`, `Fechar`, `Sobreposicao`, `Badge`, `Barra`. Hoje são
  **218 `<button>` crus contra 16 `<Botao>`** — nove dos dez painéis usam
  **zero** primitivas de botão, e 9 dos 11 componentes de layout têm um único
  leitor (o `App.jsx`): não são primitivas compartilhadas, são funções que
  saíram do App e continuaram a só servir ao App. **Sem isto, D4 escreve
  formas que nada obriga ninguém a usar.**
- [ ] **a segunda paleta ganha nome** · médio · de: desenho · 14/09
  `painel-mapa.jsx` (41 literais) + `planta-cidade.jsx` (30) têm **71
  literais e ZERO cores de `T`** — e concordam entre si: `#5C4A30` a tinta,
  `#F0E6CC` o papel, `#EADFC1`, `#6D5C40`, `#B4322E`. Não é sujeira: é uma
  **paleta de pergaminho inteira que o jogo já tem e nunca foi declarada**,
  com irmãs em `rosto.jsx` (`TINTA`, `PANO`, `PANO_FUNDO`, nomeadas em
  `const` local) e `carta-taro.jsx` (36 literais). Perdoá-las uma a uma em
  D5 seria registrar como dívida o que é design.
- [ ] **a chave do Torneio é visível durante o torneio** · médio · de: jogo · 14/09
  Depois de entrar na chave, as palavras "chave", "torneio" e "final" **não
  aparecem uma única vez**. O jogador não sabe em que ronda está nem quem
  falta.

- [ ] **a interface sai do App.jsx, uma tela por vez** · médio · de: regente · 14/09
  Medido em 14/09: `App.jsx` tem **21.295 linhas e 939 `style={{}}`** —
  **63% da interface do jogo**. Fora dele vivem 4.994 linhas e 580 estilos
  (11 painéis, `ui.jsx`, e os quatro desenhos). Enquanto a tela morar no
  `App.jsx`, toda etapa de design disputa o bastão com a mente do sistema.
  Cada tela levada para um `painel-*.jsx` próprio compra independência
  permanente — **prefira mover a remendar no lugar**. Não é uma etapa: é um
  hábito, e vale como meia-etapa em qualquer ciclo que já segure o bastão.
  Catraca: build limpo, suítes verdes, e a tela idêntica no navegador.

## Recusado (com o motivo — para a mente não propor de novo)

_(vazio)_

## Fases fechadas (o texto saiu para a estante)

A mente lê esta pauta ao começar todo ciclo, e fase fechada não
participa de decisão nova. O texto inteiro — etapas, números,
razões — está em `mente/arquivo/pauta-desenho-fechadas.md`, e o diário aponta para lá.

- **Fase W — o turno por toque (a ação deixa a caixa de texto)** — 2/3 etapas · texto inteiro em `mente/arquivo/pauta-desenho-fechadas.md`
- **Fase K — as três batidas da rodada (a reação ganha controle)** — 5/5 etapas · texto inteiro em `mente/arquivo/pauta-desenho-fechadas.md`

---

## Semeado em R15 (`desenho`, 23/09)

### A proposta ambiciosa — e ela NÃO vai à pessoa, pela lei dela própria

> **A ordem de 23/09 pede uma proposta ambiciosa por etapa. O regime de 23/09
> diz que só chega à pessoa o que um commit revertido não conserta.** Esta sai
> de uma tabela e desfaz-se num commit, logo é da mesa. Fica escrita aqui com o
> mesmo cuidado com que iria para lá — o que muda é quem decide, não o rigor.

- [ ] **R16 · a página deixa de ser um rectângulo castanho e passa a ser PAPEL
  com a cena impressa nele** · de: desenho · 23/09 · **a proposta ambiciosa de
  R15** · médio, com catraca

  **O que fazer.** R13 deu à cena um rosto de 96 px. R15 deu-lhe um buril que
  funciona. Mas o buril vive numa faixa e a página continua **um rectângulo
  chapado de `T.pagina`** — *uma xilogravura colada por cima de uma coluna de
  texto*. A proposta é levar o mesmo talho, em densidade mínima, para **debaixo
  da prosa**: a página passa a ser a folha onde a cena foi impressa, e não uma
  caixa ao lado dela. A silhueta do bioma, uma vez, muito ténue, e a hachura do
  chão a morrer nos primeiros centímetros — *o que um prelo deixa quando a
  chapa encosta ao papel.*

  **Por quê agora.** Porque a peça que faltava nasceu nesta etapa: `talho`,
  `talhoDoCeu`, `alfaDoTalho` e o motor determinista já existem. **Isto deixou
  de ser gosto e passou a ser uma interpolação e um commit.**

  **E o risco óbvio resolve-se ao contrário do esperado — está medido.** A
  objecção é *"vai estragar a leitura"*, e a prosa é a protagonista. Mas o
  campo da página é **escuro** (`T.pagina`, L 0,0305) e a prosa é **clara**
  (`T.ink`, 11,08:1). Pela lei que R15 escreveu — *a marca é o contrário do
  campo* — a marca da página é **`tinta`**, e uma marca escura **afasta-se** da
  prosa em vez de se aproximar:

  | marca | a prosa × a página |
  |---|---|
  | nenhuma (hoje) | 11,08:1 |
  | `tinta` a 0,05 | **11,38:1** |
  | `tinta` a 0,10 | **11,68:1** |
  | `tinta` a 0,20 | **12,30:1** |
  | (uma marca CLARA a 0,20) | 6,96:1 — **reprova AAA** |

  **A marca de água torna a prosa MAIS legível, não menos** — e a versão clara,
  que é a que a intuição sugeriria, é a única que reprova. *A catraca escreve-se
  antes de começar: a prosa nunca desce de AAA (7:1), e a régua é o próprio
  número acima.* A visibilidade da marca fica em **1,50:1** contra a página —
  exactamente o piso de textura de `LUZ_DA_CENA`, sem margem, e é esse o teto
  natural da peça.

  **O que o jogador ganha:** ler uma cripta e ler uma praça deixam de acontecer
  no mesmo papel. Hoje a única coisa na tela que sabe onde o jogador está são
  96 px no topo; passariam a ser os 586 px onde ele realmente olha.

### As dívidas que R15 declara e não paga

- [ ] **R15 · o talho tem de PARAR na borda do astro** · de: desenho · 23/09 ·
  médio
  O astro ganhou piso (3:1) e passa-o contra o céu nu: **4,04 · 4,88 · 3,41 ·
  9,43**. Contra um céu **já talhado** o entardecer cai a **2,56**, porque o
  talho claro lhe atravessa o disco. **O segundo canal do astro não é cor: é
  ser o único SÓLIDO num campo talhado** — e um disco atravessado por talhos
  não é um sólido, é mais campo. Vê-se nas doze faixas do Figma
  (*R15 · o ceu talhado a branco*). **É forma (`gravura-da-cena.js`), não
  valor**, e a etapa mandou-me parar e dizer em vez de inventar.

- [ ] **A biblioteca do Figma derivou DUAS VEZES em dois dias, e corrigir à mão
  não é conserto** · de: desenho · 23/09 · médio, e é o item que mais paga
  R13 achou a biblioteca a mostrar a paleta **pré-R2** — dez valores errados,
  nove tokens em falta — e corrigiu-a à mão. **R15 achou-a a mostrar a receita
  pré-correcção-do-buril: nove dos doze valores de céu e chão errados, e `talho`
  inexistente.** Uma etapa depois. *A fonte da verdade visual esteve errada em
  duas das duas vezes em que alguém foi lá ver.*

  **A proposta:** um varredor — `check-figma.mjs` — que lê `T`, `MATERIAIS` e
  `LUZ_DA_CENA` de `src/estilo.js`, lê as variáveis do arquivo, e **falha se
  algum valor divergir**. Não sincroniza (escrever no Figma a partir de uma
  suíte é dar-lhe a caneta); **acusa**, com o nome do modo e os dois hexes,
  como `check-formas` já faz com a folha. *Uma fonte da verdade que ninguém
  confere é uma fonte da verdade que mente na primeira semana — e esta mentiu
  duas.*

- [ ] **A página do telefone cai a 47,0 % com a oferta de quatro campos** · de:
  desenho · 23/09 · **é do `jogo`, não meu** · médio
  `A oferta` de R15 mede **108 px** medidos no Figma (contra 83–93 hoje), e com
  ela a página em A+B-com-oferta passa de **407 px (50,1 %)** para **382 px
  (47,0 %)** — **abaixo da linha que a mesa assinou em R5a**. A janela em si é
  **grátis** (partilha a linha do preço; `Janela=Nenhuma` mede os mesmos 108);
  o custo é o verbo ser um alvo de 48 a sério e o retorno ter a sua linha.
  **O orçamento é do `jogo` e gastá-lo sozinho seria eu a decidir o que não é
  meu.** Nos 9 de 20 turnos sem oferta nada muda.

- [ ] **`A oferta`, `A dobra` e `O selo` *Conta=Turnos* estão desenhados e não
  são componentes** · de: desenho · 23/09 · leve
  Vivem como quadros na página *R15 · a soleira aprende verbos*. Viram
  `COMPONENT_SET` com eixos a sério quando os verbos do `jogo` forem
  construídos — construir a peça antes de haver o que ela mostre seria mobília,
  que é o que a peneira desta etapa recusa.


---

## Semeado em R17 (`desenho`, 24/09)

**A forma inteira está em `mente/formas.md` §*R17 · a fabricação***, e no Figma
(`e5wJUzInAssoebx5npssKc`, página `R17 · o cartaz que nao pode ser aceite`,
`200:67`). O que segue é só o que ficou **por fazer**, com peso.

### A proposta ambiciosa — e ela também não vai à pessoa

> Sai de tabela e desfaz-se num commit, logo é da mesa (regime de 23/09). Fica
> escrita aqui com o mesmo rigor com que iria para lá.

- [ ] **R18 · no telefone, toda lista de ofertas nasce DOBRADA** · de: desenho ·
  24/09 · **a proposta ambiciosa de R17** · médio, com catraca

  **O que fazer.** A tábua do mural é a única tela deste jogo que representa um
  **objecto do mundo** — e no telefone ela é um scroll de rectângulos iguais. A
  proposta é que, na coluna estreita, **um cartaz nasça fechado**: percevejo,
  ícone, título e o preço. Toca-se e ele abre; toca-se noutro e o primeiro
  fecha. *Um papel pregado numa tábua não se lê todo ao mesmo tempo — vira-se
  um de cada vez, e é isso que faz uma tábua parecer uma tábua.*

  **Os números, medidos a 375 px com a folha e as fontes carregadas:**

  | estado | altura | cartazes num ecrã de 812 |
  |---|---|---|
  | hoje | 224,0 | **3,38** |
  | com a letra da coluna estreita (R17 §11) | 253,9 | 3,01 |
  | **fechado** (só a cabeça) | **79,8** | **8,48** |

  **8,48 contra 3,38 — duas vírgula cinco vezes mais tábua por ecrã**, e o
  jogador passa a ver a oferta inteira da cidade sem rolar uma vez. Hoje ele
  vê três cartazes e **um deles é aceitável** (o `jogo` mediu: 4 de 5 recusam).

  **Por que agora, e por que não custa peça nova.** `A dobra` nasceu em R15
  declarada *"para todos"*, e R17 já a instancia uma vez (o cartaz recusado,
  §5). Isto é a segunda instância, e a regra que sai dela é geral:
  **na coluna estreita, o teto da soleira (1) e a dobra do cartaz são a mesma
  lei — mostra-se uma coisa de cada vez, e a lista continua inteira.**

  **A objecção honesta, e a resposta:** *um cartaz fechado esconde a
  recompensa, e a recompensa é o que faz o jogador querer o serviço.* Por isso
  o preço (`◉ 40`) **fica na cabeça** — é o campo que já lá está, e é o único
  que decide se vale abrir. Os três chips de recompensa (+XP, +fama, item) são
  o que se lê **depois** de querer.

  **O que a mesa tem de assinar antes:** é do `jogo` dizer se a tábua ainda
  parece uma tábua com os papéis fechados. **Sem essa assinatura isto não
  entra** — é uma mudança do que o jogador vê primeiro.

- [ ] **R19 · a gravura deixa de ser uma faixa e passa a ser o chão da página no
  telefone** · de: desenho · 24/09 · **a segunda ambiciosa** · médio

  Irmã de R16 e mais agressiva do que ela: R16 leva o talho para debaixo da
  prosa; **R19 leva a SILHUETA.** No telefone, `O rosto da cena` ocupa 96 px de
  812 — **11,8 %** — e a página que lhe fica por baixo tem 586 px de castanho
  chapado. A proposta é a silhueta do bioma **sangrada pela página inteira**,
  em densidade mínima, **nunca por baixo de uma linha de prosa**: a gravura
  vive na margem e no sangramento, e o bloco de texto tem chão liso. *É como se
  imprime um livro ilustrado, e é a diferença entre uma imagem colada e um
  livro.*

  **O que muda em número:** a imagem passa de 11,8 % do ecrã a ser o chão de
  **72 %** dele, sem custar **um px de leiaute** — é o mesmo SVG determinista,
  a mesma semente, a mesma `LUZ_DA_CENA`.

  **O tecto, e é ele que faz a proposta ser aceitável:** a prosa mede hoje
  **11,08:1**; a composição com a gravura por baixo **não pode descer de 7:1**
  (AAA, o mesmo piso da legenda da faixa em R13). Isso é uma conta, não um
  gosto, e a suíte pode refazê-la.

### As três peças que o `jogo` pediu em R17 — decididas, por construir

- [x] **R17a · `A Consequência` ganha `Saída` no código** · **FEITA no próprio
  ciclo R17** · de: desenho · médio
  32 variantes no Figma, `minHeight` ligado a `alvo/piso`. Em código a peça
  **nunca existiu** (105 `title` fazem-lhe as vezes). Constrói-se junto com o
  primeiro construtor, que é o cartaz. Forma fechada em `formas.md` §R17 §§1-4.
  **Nasceu em `src/ui.jsx` com os cinco canais e a cor igual nos dois estados.**
  `Forma=Balão` **não** foi construída e degrada para `linha`: `formas.md` fixa o
  movimento do balão e não a **forma de repouso**, e o `aprendiz` recusou-se a
  inventá-la — bem. *Fica como pergunta ao `desenho` para o dia em que houver o
  primeiro consumidor; hoje não há nenhum.*
- [x] **R17b · a fenda `o que colidiu`** · **FEITA no próprio ciclo R17** · de: desenho · leve
  Segunda propriedade de texto de `Consequencia`, vazia por omissão. **É ela
  que torna o falso positivo visível** (`formas.md` §R17 §4). Especificada,
  não desenhada.
- [ ] **R17c · `A cinta` ganha `Estado=Em viagem`** · de: jogo · médio
  Quarto estado, a `alturaViva` (72). Forma em `formas.md` §R17 §14. **Quando
  entra e quando recolhe é do `jogo`.**

### A tabela das duas colunas — desenhada, por construir

- [ ] **R17d · `MEDIDAS` nasce, e `TIPOS`/`ALVOS` viram `var(--tv-*)`** · de:
  desenho · 24/09 · médio · **o item de maior alcance desta etapa**
  A forma inteira em `formas.md` §R17 §§8-11, com o código da tabela escrito.
  **117 leitores migram sem serem tocados**; **14 sítios de conta mudam**, todos
  nomeados (6 divisões em `grade-de-batalha.jsx` + 8 asserções em 4 suítes) —
  e essa migração **conserta um defeito latente**: aquelas 6 divisões querem
  dizer *"a casa do tabuleiro"*, que é a coluna do **dedo**, sempre.
  *Nada nesta etapa pede uma decisão nova ao `aprendiz`.*
- [ ] **R17e · a catraca da tabela** · de: desenho · leve · para o `testes`
  `check-formas` ganha um dente que conta **`text-[Npx]` literal e `fontSize:`
  com número**, e só o deixa descer — substituindo a catraca de 653 que congela
  só 8–11 px. **Um número literal não sabe em que coluna está**, e por isso é
  dívida mesmo quando é grande.
- [ ] **R17f · `A Consequência` é sempre `Forma=Linha` no dedo** · de: desenho ·
  leve
  `Forma=Balão` abre no *hover*, **e num dedo o hover não existe**. Os 105
  `title` do jogo são 105 factos que não existem para quem joga no telefone.
  É uma regra de composição e entra no varredor com a peça.

### O campo do turno — e é o achado do dia

- [ ] **R17g · o campo do telefone tem piso 90 e tecto 138** · de: jogo · médio
  O `jogo` mediu: **930 px na mesa, 129 no telefone, 65 de altura nos dois — o
  jogador vê 31 % do que escreveu.** A forma em `formas.md` §R17 §12: 3 linhas
  a `corpo` 16 (42,9 ch/linha a 343 px, logo 93 caracteres cabem inteiros).
  Custa 25 px de página; R17h devolve 56. **É a única peça da casa que é mais
  generosa no dedo do que no ponteiro, e a razão é geométrica.**
- [ ] **R17h · a fila B sai da peneira da soleira; a porta fica** · **BLOQUEADO:
  depende de R20, e a premissa estava errada** · de: jogo ·
  médio · **discordância fechada, os dois lados em `formas.md` §R17 §13**
  Resultado do `jogo` (os 56 px voltam: a página do telefone vai de 306 a
  **362 px, 37,7 % → 44,6 %**), mecanismo do `desenho` (`A dobra` não morre —
  com zero itens escondidos ela não existe por construção). **Matar a porta
  voltaria a trancá-la**, contra a lei que o próprio `jogo` escreveu em R15.

  **E a premissa do `jogo` estava errada, achada pelo `oficial` ao ir ao código
  procurar a porta.** O §13 diz *"a fila B já tem casa permanente no relógio
  desde R13"* — **verdade para `Esperar` e `Montar acampamento`, FALSO para
  `Seguir viagem`**, que R15 criou e a que nunca deu morada (`viajarPeloMapa`
  retorna se há jornada; `painel-mapa.jsx` diz *"Você já está na estrada"*; o
  relógio não tem `Seguir`). **Construir R17h hoje apagaria a única porta de
  toque da coisa que a pessoa estava a fazer** — e foi essa mesma coisa,
  escondida atrás do `+N`, que fez nascer a etapa. *O `jogo` generalizou a
  partir de dois casos e havia três.*

  **Não morre: fica a dever a R20.** Viajar é passar o tempo com destino, logo a
  morada de `Seguir viagem` é a dos outros dois. **Ordem: R20 → R17h**, e R17h só
  entra depois de a porta existir e ter sido tocada.

### As dívidas que R17 declara e não paga

- [ ] **a biblioteca do Figma derivou pela terceira vez em três etapas** · de:
  desenho · 24/09 · médio
  R13 achou a paleta pré-R2. R15 achou a luz pré-correcção. **R17 achou a letra
  pré-piso: `a frase` de `Consequencia` estava a 10 px desde D4 — abaixo do
  piso que a própria casa escreveu em R2**, e nenhum varredor olha para o
  Figma. Corrigido à mão pela terceira vez. *Corrigir à mão não é conserto, é
  adiamento* — a sincronização automatizada continua por fazer, e cada etapa
  que passa torna-a mais barata do que a correcção seguinte.
- [ ] **a porta de `Saída=Tem` sobre o tabuleiro não foi medida** · de: desenho ·
  leve
  No campo de batalha `A Consequência` é sempre *Linha* por decisão de R13
  (quatro segundos de balão tapam casas). **Mas uma *Linha* de 48 px sobre o
  tabuleiro também tapa**, e essa medida esta etapa não fez.
- [ ] **o piso de 13 no dedo tem preço, e está medido** · de: desenho · nota
  Subir o cartaz do mural ao piso da coluna estreita leva-o de 224,0 a
  **253,9 px (+13,3 %)**. A dívida de R7 tem preço; neste cartaz o
  encolhimento de R17 §3 paga-a cinco vezes. **Noutras telas pode não pagar** —
  a conversão continua a ser um painel por etapa, medindo.

## Semeado em R17 (`jogo`, 24/09)

*O `desenho` semeou a fabricação (R17a–R17h, R18, R19). Aqui fica só o que é de
composição e ele não tem como escrever: uma tela que ainda não obedece à régua
das duas colunas, e a proposta ambiciosa — que **não vai à pessoa**, porque sai
de uma tabela e se desfaz num commit.*

- [ ] **R17i · o mural na coluna estreita: a cortiça deixa de ser moldura** · de:
  jogo · 24/09 · médio · **VEM ANTES DE R18, e a ordem é lei e não preferência**

  **Porquê antes.** O `desenho` declarou o canal que nunca pode encolher — **a
  palavra na ranhura do preço** (`◉ 40` → `no diário`) — e escreveu que *se a
  ranhura tiver de encolher, é o percevejo que se reforça, não o contrário*.
  **A ranhura vive na largura**, e a parede dobrada de R18 está construída a
  302 px porque é o que há hoje. **R17i não alarga só o papel: alarga o único
  canal que ele próprio declarou intocável**, de 302 para 343 (+13,6 %).
  *A altura sem a largura faz a parede nascer estreita, e a primeira coisa a
  apertar seria a primeira coisa a não poder apertar.*

  **E o que R17i aposenta, nomeado por dever da §20:** perde-se a leitura *"isto
  é uma tábua"* ao primeiro olhar. **Paga-se porque na coluna estreita ninguém
  vê a tábua inteira** — é uma leitura cobrada e não entregue.

  **R18 do `desenho` resolve a ALTURA da tábua (a dobra). Isto é a LARGURA, e
  não se resolve pela mesma peça.** Medido no telefone: o cartaz mede **294 px
  dentro de 375** — a cortiça, a moldura e o respiro comem **~76 px, 20 % do
  eixo mais estreito**, para dizer *"isto é uma tábua"* a quem **nunca vê a
  tábua**. Na coluna larga vê-se o objecto inteiro com os papéis pregados nele, e
  é aí que a metáfora se paga.

  > **Um objecto que não cabe no ecrã deixa de ser um objecto e passa a ser uma
  > moldura.** Na coluna estreita a cortiça sobrevive como **o chão por trás dos
  > papéis**, não como o caixilho à volta deles: o cartaz passa de 294 para
  > **343 px (+17 %)** de largura, no eixo em que a leitura dói.

  Não é remover a tábua — é a mesma tábua vista de perto em vez de vista de
  longe. *É a mesma decisão que o campo com duas alturas: a peça ganha dois
  estados, não duas versões.* **Com R18 por cima, os dois ganhos multiplicam-se:
  mais papéis no ecrã E cada papel mais largo.**

### A proposta ambiciosa de R17 (`jogo`) — e ela NÃO vai à pessoa, pela régua dela própria

- [ ] **R20 · a coluna estreita perde a fita das abas** · de: jogo · 24/09 ·
  **a proposta ambiciosa de R17** · médio, **e só acontece se o censo a
  sustentar**

  **O que se propõe.** A fita de cinco abas — `GESTÃO · DIÁRIO · BOLSA · MAPA ·
  CÓDEX` — ocupa **76 px permanentes, 9,4 % da altura do telefone**, e as cinco
  são **acervo** pela régua de R17, que manda acervo para trás de um toque nos
  dois aparelhos. A fita cumpre a letra (é um toque) e falha o espírito: são
  **cinco portas sempre abertas para cinco salas que ninguém compara com a
  cena**. É, hoje, a maior faixa permanente da tela sem um leitor na prosa.

  **E há um argumento mais forte do que o uso: as salas já têm porta.** R13 fez
  da cinta inteira **um alvo só** que abre a ficha — e PV, bolsa, relógio e prazo,
  que estão na cinta, são exactamente o **estado** cujo **acervo** mora em
  `GESTÃO`, `BOLSA` e `DIÁRIO`. *É a mesma conta com que o `desenho` fechou a
  porta `+N` uma faixa acima: quando a sala já tem porta, a segunda porta não é
  acesso — é mobília.*

  **O que a pessoa ganharia, em número:** a página a ler passa de **359 para
  435 px — 53,6 %**, acima da linha que a mesa assinou em R5a, e **1,42× a
  página de hoje**. Peças permanentes na tela: **6 → 5**.
  *(Conta refeita em `formas.md` §R17 depois de o campo ganhar piso 90: a minha
  primeira versão dizia 475 e 1,55×, e assentava num campo de 66 px que a medida
  do `desenho` desmentiu.)*

  **A catraca, e ela é o corpo da proposta e não um apêndice:** esta é a coisa
  mais *reaprender* que a mesa propôs desde que a ordem de 23/09 lhe deu a
  decisão, e por isso **não se faz por argumento — faz-se por censo.** Vinte
  turnos, contando **quantas vezes cada aba é aberta e a partir de onde**. R13
  aposentou quatro botões de cabeçalho exactamente assim (`🎲` 0 usos, `📜` 0
  usos), e **a fita é a última peça da tela principal que nunca passou por um
  censo**. Aba aberta com frequência a partir da tela principal fica, e a
  proposta encolhe para as outras. *Uma proposta ambiciosa que se recusa a ser
  medida é só uma proposta arrojada.*

  *Não vai a "Para a pessoa decidir" porque um commit revertido conserta isto
  inteiro — é uma faixa de leiaute. Pela régua de 23/09, é da mesa, e fica
  escrita com o mesmo cuidado com que iria para lá: o que muda é quem decide,
  não o rigor.*

### O que o `jogo` assinou em R17, e a condição que pôs

- **R18 do `desenho` (o cartaz nasce dobrado) está ASSINADO**, com duas
  condições escritas em `formas.md` §R17: **(1) a dobra tem de carregar a marca
  de `Saída`** — sem isso os 8,48 cartazes por ecrã viram quatro toques
  desperdiçados a procurar o único vivo, que é **pior do que hoje**; **(2) um
  aberto de cada vez na coluna estreita, livre na larga.**
- **E a dobra aposenta a razão de 2:1 que o `jogo` tinha pedido** (o cartaz
  aceitável ao dobro do recusado): era um remendo para um mundo em que tudo está
  aberto. *Com tudo dobrado, o canal honesto é a marca, não o tamanho.*



### R17 · o que a assinatura do `jogo` acrescentou (24/09, mesmo dia)

- [x] **R18 está ASSINADO pelo `jogo`, com duas condições** — e o argumento dele
  é melhor que o meu: *uma cortiça verdadeira **é** uma parede de títulos; a
  tábua de papéis todos abertos é que nunca foi uma tábua.* **R18 deixa de ser
  um ganho de densidade e passa a ser uma reparação de metáfora que dá densidade
  de lucro.**
- [ ] **R17j · `A marca na dobra`** · de: desenho · 24/09 · médio · **R18 NÃO
  ENTRA SEM ISTO**
  A condição (1) do `jogo`, e é a que decide se R18 ganha ou perde: *se o papel
  morto for indistinguível do vivo enquanto dobrado, o jogador abre quatro para
  achar um, e os 8,48 por ecrã viram quatro toques desperdiçados — pior do que
  hoje.* **Fabricado e no Figma: `O percevejo` (`206:93`, 6 variantes) e a
  parede de prova `R17 · a tábua dobrada` (`206:94`).** Forma fechada em
  `formas.md` §17 e §17b. Falta o código.
  **Três canais, e a cor não é nenhum:** a palavra na ranhura do preço
  (`◉ 40` → `no diário`, zero px), a tinta do título (14,83:1 → 8,82:1, os dois
  AAA) e o percevejo (cheio · meio saído · **furo**).
- [ ] **R17k · `A dobra` ganha a lei de LISTA** · de: desenho · leve
  Condição (2) do `jogo`, aceite: **na coluna estreita, uma lista de dobras abre
  UMA de cada vez**; na larga, livre. *Não é eixo novo da peça — é lei de quem
  monta a lista*, e entra no varredor com ela.
- [ ] **ordem: R17i ANTES de R18** · de: desenho · nota
  A moldura de madeira diz *isto é uma tábua* a quem **vê a tábua** — na coluna
  estreita ninguém a vê inteira, logo paga por uma leitura que não acontece.
  **R17i resolve a largura, R18 resolve a altura**, e o contrário faz a parede
  nascer estreita.
- [ ] **a lei do 2× ganhou escopo em vez de morrer** · nota
  O `jogo` reparou que a razão aceitável ≥ 2× recusada *"era um remendo para um
  mundo em que tudo está aberto"*. **Lista ABERTA: o canal é o tamanho (2,34×
  medido). Lista DOBRADA: o canal é a marca.** Emendado em `formas.md` §3.
- [ ] **a regra dos canais estava mal citada por mim, e o Figma apanhou-a** ·
  nota · `formas.md` §17b
  `O selo de prazo` não diz *"geometria primeiro"*: diz **"o canal que carrega a
  informação mais directamente primeiro"**. **Quantidade pede geometria; facto
  pede palavra; o material vem depois dos dois.** Eu tinha posto o percevejo em
  primeiro por reflexo; na parede construída é `no diário` que se lê antes de
  tudo. *Terceira etapa seguida em que o raciocinado mentiu e o construído
  salvou.*


### R17 · as três do `regente`, depois das capturas do telefone (24/09)

- [ ] **R17L · a linha do turno parte-se em duas na coluna estreita** · de:
  regente · médio · **a peça mais usada do jogo, e vai ser construída neste
  ciclo** · forma em `formas.md` §19
  Linha 1: o campo, 343 px, piso 90 / tecto 138. Linha 2: a gaveta e o verbo à
  direita. **`IconeBalao` sai.** **129 → 343 px de largura útil (+166 %);
  ~29 → ~119 caracteres visíveis; 31 % → 100 % de uma frase de 93.** Custa
  +81 px, o `+N` devolve 56, líquido **+25** — a página fica em 337 px (41,5 %)
  contra 306 (37,7 %).
  **LEI nova e varrível:** *numa coluna estreita, uma linha leva no máximo UM
  alvo fixo além do que cresce* — cada fixo custa 56 px de 343 (16,3 %).
- [ ] **R17m · A LEI DA APOSENTADORIA** · de: desenho · 24/09 · médio ·
  `formas.md` §20
  **256 px de duas imagens do mesmo lugar antes de uma palavra** no telefone:
  R13-B fabricou `O rosto da cena` e **não aposentou `VinhetaDaCena`**. Quatro
  degraus de desempate (determinismo · mais de um facto · menos página no
  aparelho mais apertado · a biblioteca pode variar), e **a que sai, sai
  inteira**. **O dever:** quem fabrica nomeia o que aposenta, ou escreve que não
  aposenta nada. *Qual das duas fica é do `jogo`; a lei já responde — a gravura
  ganha nos degraus 1, 2 e 4, e o 3 devolve 160 px de 586 (27 %).*
  **Dívida:** o varredor não existe — contar, por região, elementos que declarem
  a mesma origem (`bioma`/`lugar`) e falhar acima de um.
- [ ] **R17n · `MEDIDAS.texto.minimoParaTruncar`** · de: regente · leve ·
  `formas.md` §21
  `assi…` e `a…` são `truncate` num sítio onde não devia ter sido pedido.
  **Um campo trunca ou não se desenha.** O número é **12** e **refaz-se**:
  `Math.ceil(MEDIDAS.medida.minima / 4)` = 45/4. Segunda régua concorda (as
  reticências valem >10 % do que se mostra abaixo de ~10 caracteres). **Quando
  não se desenha, o facto muda de casa** — no cartaz, para o estado aberto da
  dobra. Varrível, e é o dente mais fácil da etapa.
