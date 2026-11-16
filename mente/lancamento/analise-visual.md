# Taverna v9.647 — análise de lançamento, ponta 2: experiência de uso e visual

*`desenho`, 15/11/2026. Só leitura: nenhum código, Figma, pauta ou commit foi tocado.*

## 0 · Método, e o que vale como prova aqui

A pessoa disse: *«Não faça a análise por memória, mas pelo produto que temos hoje»*. Por
isso **a prova deste relatório é o jogo vivo de hoje e o código de HEAD (`13364fc`) medido
hoje.** Diários, pautas, `formas.md` e capturas antigas serviram só para saber onde olhar.
Uma tela que eu não vi hoje entra marcada **«não vista hoje»**, e fica sem nota.

**Como se viu:**

- **Sem IA** (`TAVERNA_API=http://127.0.0.1:9`, porta 5199): menu, os dois passos da criação,
  a tela principal, o dado, Diário, Mapa, Bolsa/Herói, Mercado e Códex, a **1440×900,
  1280×720, 800×451 e 375×812**.
- **Com IA real** (porta 5197, a minha aba): uma campanha nova, com **~15 turnos**. Vi a
  abertura, a espera, dois testes (um passou e outro falhou), a proposta da frase com o
  veredito, uma viagem, o encontro na estrada, **uma batalha inteira** (3 ratos gigantes, 3
  rodadas, vitória e recolha), a entrada numa masmorra e **uma segunda batalha no telefone**.
- **Build de produção** (`vite build` para o rascunho e `vite preview` na porta 5196): o peso
  real do que o jogador descarrega.
- Medidas tiradas no DOM vivo: `getBoundingClientRect`, `getComputedStyle`, Performance API,
  `elementsFromPoint`. O contraste vem da fórmula WCAG 2.x, calculada em Node.

**Capturas:** estão em `mente/lancamento/capturas/` (36 ficheiros, `01-`…`36-`), referidas
abaixo como **[c01]**…**[c36]**. Ficaram a 800 px de largura, porque o painel do navegador
reduz a imagem. As medidas em px no texto são do viewport real, não da imagem.

**Armadilha observada:** com o painel oculto, duas capturas saíram velhas ou em branco
([c02a] é uma delas). Onde a imagem e a árvore discordaram, valeu a árvore
(`get_page_text`/DOM).

---

## 1 · A primeira impressão

### 1.1 Os primeiros 10 segundos — desktop

1. **Antes de haver jogo, há um ecrã verde vazio.** O `index.html` traz `<div id="root">`
   vazio e `body{background:#12241B}` (`index.html:9`). Nada se pinta antes de o JS chegar e
   correr. E o JS é **um só ficheiro de 5 336 KB minificado, 1 792 KB em gzip**, medido no
   `vite preview`. Somam-se a imagem do menu, **`taverna-hero.png` com 1 541 KB** (1344×768,
   e a 375 mostra-se a 303×260 px), a marca **`taverna-marca.jpg` com 131 KB** (1024×1024,
   mostrada a 61×61 px), o Tailwind pela CDN e quatro famílias do Google Fonts.
   **Conta (não é medida de rede):** num perfil «4G lento» de 1,6 Mbit/s, só o JS leva
   ~9 s e a imagem do menu mais ~7,7 s. Mesmo numa rede de 10 Mbit/s são ~2,7 s de
   descarga, mais o parse de 5,3 MB de JS num telemóvel médio. **Quem chega por um link
   no telemóvel olha para um retângulo verde.**
2. **Depois aparece o menu [c01].** A ilustração da taverna é boa e quente: dragão, elfa,
   encapuzado de olhos ciano, samurai, uma fada no meio. Mas o estilo é *cartoon digital*
   saturado, e os 258 retratos do jogo são *pintura semi-realista* ([c10], [c27]). **A
   primeira imagem promete um jogo que não é o que se joga.** A marca é uma caneca
   ilustrada num quadrado e a palavra «TAVERNA» numa serifada sem trabalho de logotipo: não
   se distingue de mil «taverna» genéricas.
3. **O primeiro ecrã a 1440 tem três cartões:** «Começar a jogar», «Jogar em dois» e «A
   campanha em arquivo». O terceiro explica a limpeza de cache e a troca de máquina a quem
   ainda nem jogou: é ruído no segundo mais caro do funil.
4. **A consola do site diz** «cdn.tailwindcss.com should not be used in production».
   Medido no build de produção. O público gamer e dev abre a consola.

### 1.2 Os primeiros 3 minutos — desktop

- **A criação são dois formulários longos** [c02][c03][c04]. O passo 1 tem **sete secções**:
  nome, 7 géneros, 4 moldes, 4 arcos, 8 vozes, 2 apresentações e um texto livre. O passo 2
  tem identidade, raça e profissão em **`<select>` nativo**, classe, caminho, 6 atributos
  com botões −/+ de **24×24 px** e mais um texto livre. O caminho mínimo até jogar foram
  ~12 gestos e duas frases escritas por mim.
- **O retrato do herói não aparece na criação.** No lugar dele há um ícone de traço num
  círculo [c03]. O jogo tem **240 retratos pintados de herói**, um por raça × sexo × classe
  (`public/retratos/gente`, 240 ficheiros), e **o momento em que se escolhe raça e classe é
  o único onde não se mostram**. É a maior oportunidade de impressão desperdiçada do
  produto.
- **A espera pela abertura.** Com a IA real a página fica vazia, só com a linha «Mestre
  preparando…» em 12 px e uma faixa fina [c20]. A narração chega **inteira, de uma vez**
  (sem streaming: o texto saltou +523 caracteres num único quadro). Na abertura a espera
  passou de 7 s; num turno normal medi a chegada a **5,4 s, 5,6 s e 8,0 s** depois do
  gesto.
- **Quando a prosa chega, o jogo fica bonito** [c21][c22]. A página de pergaminho
  `#E9DCC0` tem Spectral 17/27,6 numa coluna de **536 px (~68 caracteres por linha)**, um
  título de cena a 28 px e a faixa do rumo (bússola) no topo. **Este é o primeiro momento
  em que parece um produto acabado.**

### 1.3 No telefone (375×812)

- O menu leva **mais de 4 s em dev a acender** [c15a]. Isso é só dev. Em produção o
  problema é o mesmo do §1.1, pior por ser telemóvel.
- **A tela principal a 375 é a melhor composição do jogo hoje** [c16][c34]. A página ocupa
  ~610 px de altura, a prosa tem ~40 caracteres por linha, e a barra de baixo traz os dois
  retratos, Diário, Mapa, Bolsa e os dados de uso. **Todos os alvos têm ≥ 44 px**: medi 15
  controlos, e o único menor é o tirador da gaveta (375×13).
- **A batalha no telefone joga-se** [c36], com fichas grandes e 7×18 casas. Mas os rótulos
  de intenção («3-12 → Hilda Coraçã…») cortam-se na borda direita, e o placeholder
  «como? (opci…» também.

### 1.4 A régua sem dó

| jogo | o que faz que nós não fazemos | onde estamos |
|---|---|---|
| **Baldur's Gate 3** | O d20 rola **no centro do ecrã**, grande, com o número a bater e os bónus a somarem-se um a um. O 20 natural tem cerimónia. | O nosso d20 vive numa bandeja de **48 px**, a animação de rolar dura **520 ms** (`MOVIMENTO_DO_DADO.rolar`, `estilo.js:1020`), e o resultado encolhe para um chip à esquerda [c06][c07]. Na luta, um **1 natural** saiu como linha mono de 12 px num canto: «d20 1+6=7 vs 12 · desastre (errou feio)» [c30]. |
| **Disco Elysium** | O teste tem nome de voz interior, % de sucesso e o preço da falha, e a prosa é protagonista. | **Estamos à altura no encontro** [c27]: retrato pintado, opções com CD, % e «se falhar: …». É o nosso melhor quadro. |
| **Slay the Spire** | A intenção do inimigo lê-se de relance, e a recompensa é um ecrã de cartas. | **A intenção está lá** («NESTA RODADA, ELES VÃO», [c28]). A recompensa é uma caixa com duas linhas «Recolher» [c32]. |
| **Balatro** | *Juice*: todo o número conta para cima com som, treme e acende, e cada ponto parece ganho. | O XP e as moedas aparecem como texto estático («+22 XP», «+60 XP · uma terra…»). Há som, mas sintetizado, curto e com seis momentos (§5). |
| **Citizen Sleeper** | Os dados são o recurso, e estão sempre visíveis e tocáveis no HUD. | Os dados de uso (×10 rações, ×10 água, ×5 tochas) estão lá, a **11 px** de rótulo, ao lado da Bolsa. Bom princípio, pouca presença. |
| **Roadwarden** | O texto vem por baixo de uma **ilustração da cena**, e é a imagem que fica na memória. | **Temos 30 cenas pintadas em `public/cenas` (656 KB) que nenhum ecrã usa.** A vinheta saiu em R-série, `App.jsx:1487`: «SAIU INTEIRA». O jogo é texto em pergaminho sobre feltro, sem uma imagem do lugar. |
| **AI Dungeon** | Chat puro e um campo de texto. | Estamos muito à frente: há regras, dado, grelha táctica, retratos e mapa. |
| **Friends & Fables / AI Realm** | Imagem gerada por cena, mapa e ficha. Vivem no Discord ou no telemóvel. | Nós temos o que eles não têm: o **Mestre que é código**, a batalha em grelha, o encontro com %, e 258 retratos com estilo coerente. Falta-nos a **imagem do lugar**, que eles têm. |

**Veredito do §1.** Nos primeiros 10 segundos o Taverna **parece um site**: ecrã vazio, um
menu de cartões e um formulário. **Aos 3 minutos parece um jogo de texto muito bem
tipografado**, e no encontro e na batalha **parece um jogo**. O problema é a ordem: o melhor
está atrás de um formulário de sete secções e de uma espera muda.

### 1.5 O frame que venderia hoje, e o que falta

- **Os que já temos, por ordem:** (1) o **encontro** com o rato pintado e as cinco opções com
  % [c27]; (2) a **carta do herói** na Bolsa, com moldura de metal, gema e nível [c10]; (3) a
  **batalha no telefone** [c36]; (4) a **página com prosa** e a faixa do rumo [c21].
- **O que falta, e é o que um trailer pede:** (a) **o d20 a cair grande no feltro e a parar
  no 20**, com luz e som; (b) **uma cena pintada** por trás ou por cima da página, para que
  um GIF mostre um *lugar* e não um parágrafo; (c) **a vitória como recompensa**: cartas a
  virar e XP a contar; (d) o rosto do herói **escolhido** na criação.

---

## 2 · O que temos de bom — a cara do lançamento

1. **O pergaminho e a tipografia da prosa.** Contraste **12,15:1** (`#2A1C11` sobre
   `#E9DCC0`) e 5,60 no pior ponto da vinheta. São ~68 caracteres por linha (536 px) a
   1440 e ~40 a 375. Polaridade positiva, com estudo citado em `formas.md` (Piepenbrock et
   al., 2013). **Isto lê melhor do que AI Dungeon, F&F e AI Realm, sem discussão.**
2. **Os retratos pintados**: 258 (18 feras e 240 heróis), **9,2 KB de média** em WebP
   320×320, com estilo coerente entre si. A carta do herói [c10] e o rato do encontro [c27]
   estão ao nível de um jogo comercial indie.
3. **O encontro antes da luta** [c27]: opções com perícia, CD, tempo, % e o preço da falha,
   mais «Voltar atrás · CERTO». É *O veredito antes do clique* feito forma, e é a peça mais
   «jogo» do produto.
4. **A batalha táctica com intenções** [c28][c31][c36]. A barra de iniciativa com retratos,
   «NESTA RODADA, ELES VÃO» com o dano previsto, a reação com preço («aparar · 0 PM — corta
   metade»), o turno deles passo a passo com bolhas no tabuleiro («Rato Gigante 3 · 12 +1
   contra 13 · acerta»), e os caídos como caveiras no fim.
5. **O dado chamado pelo sistema antes da narração.** Medido: o pedido de Investigação
   («Precisa de 15. Se falhar, os vestígios não fecham e a hora se vai.») apareceu **276 ms**
   depois de eu enviar a frase, sem esperar pela IA. A falha tem preço escrito [c23]. **É o
   coração da ordem de 04/11, e funciona.**
6. **O telefone é cidadão de primeira** [c16][c34][c36]: sem rolagem lateral (`scrollWidth`
   = 375), alvos ≥ 44 px e prosa confortável.
7. **Os ícones ilustrados do trilho** (o livro do Diário, o pergaminho do Mapa, o saco da
   Bolsa, o grimório do Códex). São objetos, não glifos, e são casca de verdade.
8. **Contraste em geral:** a tinta clara sobre feltro dá 13,24, o rótulo 5,98, a borda de
   controlo 4,00 e o perigo sobre painel 5,35. Não achei um único par de texto abaixo de
   4,5. **O problema da casa não é contraste: é tamanho** (§9).

---

## 3 · Tela a tela

Tamanho: **S** ≤ 1 dia, **M** 2–4 dias, **G** ≥ 1 semana. Quem: **desenho** (forma e Figma),
**aprendiz** (fora do `App.jsx`), **oficial** (dentro do `App.jsx`).

### 3.1 Menu — **6/10** (1440 [c01]) · **6/10** (375 [c15])

- **Funciona:** a ilustração é quente, o «Continuar aventura» com nome da campanha e do
  herói é claro, e há «Continuar com resumo — Anteriormente, em…» (ótimo para quem volta).
- **Falha:** o estilo da ilustração não é o do jogo (§1.1). A marca é fraca. «A campanha em
  arquivo» aparece na primeira visita. O «Continuar aventura» é **rosa** (`T.rosa` como chão
  de botão; a nota de `T` diz «marca, nunca chão de letra»). A barra «Taverna» de topo
  repete a palavra que está 100 px abaixo.
- **Fazer:** (a) primeira visita = **um só botão grande «Começar»** e, por baixo, «Jogar em
  dois»; o arquivo desce para um link no pé. (b) Uma ilustração de abertura **no estilo dos
  retratos** (a mesa de feltro com o pergaminho, o d20 e quatro heróis pintados do nosso
  acervo), em WebP ≤ 200 KB. (c) Um logotipo: palavra em Cinzel com um d20 como «V» ou como
  selo de cera, já na paleta. · **M** · desenho (logotipo, arte) → aprendiz.

### 3.2 Criação: o mundo — **4/10** [c02]

- **Funciona:** os textos de cada voz do Mestre (8 exemplos de prosa) são deliciosos; é a
  melhor demonstração do Narrador antes de jogar.
- **Falha:** são sete secções de decisão antes do herói. Os ícones misturam **emoji do
  sistema** (🍺🔥🌙🏰🌈🗺🗼🏴‍☠️🛰) com ícones de traço: renderizam diferente em Windows, Mac e
  Android e não são da casa. O fundo é feltro verde liso, sem mesa.
- **Fazer:** (a) **«Começar já»**: o mundo por omissão (Fantasia · Terras abertas · Jornada
  · Épico) num toque, e «Personalizar o mundo» como gaveta para quem quer. (b) As vozes como
  **cartas que se viram** com a frase de exemplo. (c) Trocar os emoji por glifos da
  biblioteca. · **M** · desenho → aprendiz/oficial (o fluxo vive no `App.jsx`).

### 3.3 Criação: o herói — **4/10** [c03][c04]

- **Funciona:** o «Sortear um nome deste mundo», o antecedente com gancho («Busca pistas da
  família que perdeu…») e o veredito do botão («falta o conceito · distribuir 6 pontos»).
- **Falha:** raça e profissão em `<select>` nativo; **o retrato não aparece**; os atributos
  são seis linhas de formulário com −/+ a 24×24 px. Um nome masculino sorteado («Yorick»)
  ficou numa heroína: o sorteio não seguiu a escolha de sexo feita depois.
- **Fazer:** **a criação vira uma mesa de cartas.** Raça e classe como grelha de retratos
  (as 240 pinturas já existem e já estão cortadas para cartão). O cartão grande do herói
  [c10] fica **à vista enquanto se escolhe** e muda de rosto a cada toque. Os atributos
  ficam como seis peças com +/− ≥ 44 px. O sorteio do nome passa a ouvir o sexo. · **G** ·
  desenho (Figma) → aprendiz (peça) → oficial (fluxo).

### 3.4 A tela principal — **7/10** a 1440 [c21][c22] · **8/10** a 375 [c16][c34] · **6,5/10** a 1280×720 [c17] · **6/10** a 800×451 [c18]

- **Funciona:** a página, a prosa, a faixa do rumo, os retratos-carta do grupo à esquerda, o
  trilho ilustrado à direita, «PISTAS 0 de 1» e «HORA Dia · 08:00» no topo. O erro de rede é
  claro e tem saída: «A ligação com o Mestre se partiu… [Tentar de novo]» e «O que os dados
  decidiram fica decidido; falta só o Mestre contar» [c07].
- **Falha:**
  1. **A 1440 a mesa está vazia.** A página mede ~600 de 1440 px. À esquerda há dois
     retratos de ~90 px e o chip do último dado; à direita, o trilho. **Os outros ~60 % da
     tela são feltro liso.** A direção «C — a mesa» prometia peças *na mesa*; hoje é um
     pano verde com uma folha no meio.
  2. **A voz da máquina domina a folha quando o Mestre está calado.** Medido sem IA:
     **84 % dos caracteres visíveis são JetBrains Mono** (467 de 554). Com IA, a prosa
     (Spectral) chega a ~507 contra ~260 de mono. Linhas como «A lei deste mundo: …»,
     «Pessoas — o mundo começou a guardar quem você conhece», «Conquista desbloqueada: …»
     e «+60 XP · uma terra onde…» são **mono 12 px peso 300 sobre pergaminho**: é o
     terminal dentro do livro.
  3. **Os rótulos são minúsculos.** Num ecrã a 1440 contei 14 textos abaixo de 12 px:
     LUGAR, PISTAS e HORA a 11, o nome do herói na carta a 11,16, **«Piotr» a 9 px**,
     «15 moedas» a 10, e Diário, Mapa e Bolsa a 11.
  4. **A 1280×720 o Códex cabe por 3 px** (`bottom: 717` com viewport 720). Mais um item no
     trilho e ele sai do ecrã.
  5. **A 800×451 e a 375 o Códex não tem porta visível.** Medido: zero botões «Códex» no
  DOM visível; na barra de baixo só há Diário, Mapa e Bolsa. (Pode estar no tirador da
  gaveta; não o abri.)
  6. **Não há menu nem pausa.** Som, «Rolagens do mundo à vista», «O Mestre rola por mim» e
     **«Sair para o início» vivem dentro de Bolsa › Herói › «Perícias e detalhes»**, uma
     secção recolhida no fundo de um painel que rola (`App.jsx:2641-2659`). São três toques
     e uma rolagem, e **Esc não abre nada**. Um gamer procura Esc ou ⚙ no primeiro minuto.
  7. **O sistema fala de si** na folha (§3.6).
- **Fazer:** (a) **A cena pintada volta, como chão do topo da página** (as 30 cenas). (b) **A
  mesa ganha peças à volta da folha a 1440:** o grupo maior (cartas de 140 px, não 90), a
  bandeja do dado **na mesa** e não sob a folha, a vela. (c) **Um botão ⚙/Esc** com Som,
  Texto (tamanho), Rolagens, Guardar, Sair. (d) **As linhas de sistema da folha deixam de
  ser mono:** ou viram peça (ícone + 1 linha Spectral itálica em `tintaDoPergaminhoDim`), ou
  vão para um carimbo à margem. (e) **Piso de 12 px para rótulo e 13 para nome**, sem
  exceção. · (a)(b) **G**, (c) **S**, (d) **M**, (e) **S** · desenho → aprendiz/oficial.

### 3.5 A bandeja e o dado — **5/10** [c06][c07][c22][c23][c33]

- **Funciona:** a chamada do Mestre em letra («Percepção. Precisa de 13. *Se falhar, o
  tempo se vai e o lugar fica remexido.*»), o botão «Rolar d20 + 1 · precisa de 13» com
  «Mudar de ideia» ao lado, o chip que pousa com «✓ passou» ou «✕ falhou» (o falhado com
  anel tracejado, que é forma e não só cor), e a grelha de faces 1–20 no chip depois de um
  golpe falhado [c33] (bonito, e é informação).
- **Falha:** o dado mede **48 px**, rola **520 ms** e pousa em **140 ms** (`estilo.js:1019`).
  Medi a sequência inteira em ~680 ms antes de a linha do sistema aparecer. **Não há
  suspense.** O chip histórico encolhe para dois hexágonos de ~12 px [c24]. O 20 e o 1
  naturais não têm forma própria.
- **Fazer:** §5.1. · **M** · desenho → aprendiz.

### 3.6 Proposta da frase e veredito — **5/10** [c24][c25]

- **Funciona:** a frase vira cartão («Ir até Fenda de Silêncio · ● Difícil · Reescrever»),
  abre com o preço e o «Ir · ● Difícil» final.
- **Falha — o sistema fala de si, em número cru:** «● Fenda de Silêncio — DIFÍCIL: … **(187 de
  poder (você 126 + 1 no grupo) contra 515 — 2.8× menos do que isto pede)**» [c25], com
  parêntesis dentro de parêntesis e ponto decimal inglês («2.8×»). Isto é diagnóstico de
  programador. Na mesma linha de jogo apareceram:
  - «Velha valente → Fenda de Silêncio · chegando · **⌖ K11 50,5 · 50,2**» (coordenadas
    internas);
  - «**faltam 1 avanco**» (sem cedilha, e «1 avanços» no plural);
  - «**3 Rato Gigantes** caíram» (plural errado);
  - o cabeçalho da masmorra «**camada 0** · 5 tochas» (índice que começa em zero) [c35];
  - na ficha do herói, «**PODER 121 / grupo 102**» [c14].
- **Fazer:** o veredito diz **o que o jogador sente**: «Acima de vocês. Três vezes acima.»
  com uma régua de 3 caveiras, e o número fica no toque, para quem o pede. Tirar
  coordenadas e índices da tela. Corrigir os dois erros de português (e varrer o plural de
  nome composto). · **S–M** · desenho (frase e forma) → sistema/aprendiz (as palavras vêm
  de tabela).

### 3.7 O encontro — **8,5/10** [c27]

- **Funciona:** tudo o que está no §2.3.
- **Falha:** depois de «Lutar», o painel fecha e **a batalha leva ~30 s** (a narração da
  entrada é esperada) com só «Mestre preparando…» numa linha [c26 → c28]. O botão de
  confirmar repete «Lutar» (duas caixas com a mesma palavra). «3× Rato Gigante» mostra um
  retrato para três.
- **Fazer:** a mesa de batalha abre **já**, com o tambor (`tocarEntrada` existe), e a
  narração da entrada chega por cima quando chegar. Mostrar os três retratos em leque. ·
  **M** · oficial.

### 3.8 A batalha — **6/10** a 1440 [c28–c32] · **6,5/10** a 375 [c36]

- **Funciona:** §2.4, e a vitória mostra os caídos como caveiras.
- **Falha:**
  1. **O disco branco gigante depois de Mover** [c29]. Visto ao vivo num Chromium real
     (o painel do Claude), e não em headless: um círculo branco e âmbar de ~180 px cobre o
     herói e as fichas, e fica. `elementsFromPoint` no centro dá
     `rect.tv-anel-foco-no-campo` (aria «H6 · você · na estrada…») com **`outline: auto
     4.8px rgb(229,151,0)`**, isto é, o anel de foco do navegador e não o da casa
     (`estilo.js:5246` define `solid` só em `:focus-visible`). **Pendente desde A1b(4),
     10/10; hoje está confirmado.**
  2. **Os rótulos de intenção empilham-se:** três «2-10 → Hilda Coração-de-Ferro»
     sobrepostos no meio do tabuleiro [c28][c30]. A 375 cortam-se na borda [c36].
  3. **A janela de reação encavala no tabuleiro** («Rato Gigante 2 te acerta · aparar…»)
     [c30][c31].
  4. **Metade de baixo do quadro do tabuleiro fica vazia** a 1440: as 12 filas ocupam ~250
     de ~420 px.
  5. **O chão é liso:** só o deserto tem textura (`estilo.js:3224`, 1 ficheiro em
     `public/terrenos`). A luta na «estrada» é uma grelha verde.
  6. **Nomes truncados** na iniciativa e no cartão («Hilda Coraçã…», «Rato Gigan…»).
  7. **O 1 natural não é um momento** [c30]. A narração do turno de topo à direita
     («O terceiro rato permanece bufando…») fica velha durante a vitória [c32].
- **Fazer:** (1) o anel do campo com `outline-style` explícito também em `:focus`, e o foco
  programático depois de Mover sem anel UA (**S**, aprendiz). (2) As intenções de vários
  atacantes ao mesmo alvo fundem-se num rótulo «3× 2–10 → Hilda» (**S**, desenho →
  aprendiz). (3) A reação ancora fora do campo, no lugar da barra de ações (**M**). (4) O
  quadro ajusta a altura às filas (**S**). (5) O chão das 9 plantas (§8.3). (7) O nat 20 e
  o nat 1 com cerimónia (§5.1).

### 3.9 A vitória — **5/10** [c32]

- **Funciona:** «Vitória +8◉ −11 PV +22 XP», o espólio «NO CHÃO» com «Recolher» e «Respirar
  fundo →». Na página, a linha-resumo «A luta · 3 Rato Gigantes caíram · 3 rodadas» [c33].
- **Falha:** é uma caixa de lista. Nada conta, nada vira, nada soa. Os números são estáticos.
- **Fazer:** a vitória usa **a cerimónia que já existe para o espólio** (a carta que vira pela
  raridade, `painel-espolio.jsx`, teto de 4 s); o XP conta para cima e a barra enche; o
  item cai na Bolsa com o selo. · **M** · aprendiz.

### 3.10 Diário — **7/10** [c08]

- **Funciona:** a missão com descrição, «O PRÓXIMO PASSO» destacado, as etapas «Ainda não se
  sabe», a recompensa como carta de costas, e «A MÃO POR TRÁS — Alguém» com silhueta.
- **Falha:** é um modal de ecrã inteiro castanho sobre o feltro: perde a casca (nada de
  livro, de couro ou de página). «A campanha: Jornada do Herói · trocar o arco» mostra o
  mecanismo.
- **Fazer:** o Diário como **livro aberto**, com a mesma folha da prosa à direita e as
  missões como fitas à esquerda. Tirar «trocar o arco» daqui (vai para ⚙). · **M** ·
  desenho → aprendiz.

### 3.11 Mapa — **6,5/10** [c09]

- **Funciona:** carta gerada com estradas, trilhas e pé, o perigo em caveiras, e o cartão do
  lugar com «O PREÇO» e «Partir para Baixo escura · 4 h de estrada · chegas às 12:10 · sem
  noite ao relento» (o veredito à vista).
- **Falha:** **é azul-noite às 08:10 de «manhã de primavera»**: a paleta fria da v3 vive
  aqui inteira, e contradiz a mesa quente. As montanhas são triângulos chapados. Na faixa
  do rumo na página [c26], **nomes sobrepostos**: «TERRAS DAS BRUMAS» (x 818–969) e
  «FRONTEIRAS DO ESTIO» (x 894–1063) na mesma linha y 111–127, **75 px de sobreposição**.
- **Fazer:** o mapa como **pergaminho cartográfico** (fundo `pergaminho`, tinta e lavagens de
  aguarela por bioma), com a hora a pintar só a luz. Corrigir a colisão da faixa (a conta
  de nomes sem colisão em `faixa-do-rumo.js` falha com duas filas). · **M** (paleta), **S**
  (colisão) · desenho → aprendiz.

### 3.12 Bolsa / O Herói — **6/10** (topo 8, fundo 4) [c10][c11][c14]

- **Funciona:** a **carta do herói** (melhor peça visual do jogo), PV, PM e XP em barras, os
  atributos em medalhões, o boneco de equipamento com 7 casas, a mochila em casas e os
  mantimentos em caixas.
- **Falha:** abaixo da dobra vira **painel de configuração**: «Ritmo de marcha», «Quando um
  golpe chega», «Ao derrubar um inimigo» (pílulas mono de ~11 px) e «A bancada». As
  definições do jogo estão escondidas aqui (§3.4.6). O título muda de «A BOLSA» para «O
  HERÓI» conforme a rolagem.
- **Fazer:** a Bolsa é inventário e herói; preferências de luta e marcha vão para ⚙; a
  bancada e a forja ganham porta própria. · **M** · desenho → oficial.

### 3.13 Mercado — **6/10** [c12]

- **Funciona:** bancas como abas, o preço com «faltam ◉ 7», o efeito («vai para a mochila»,
  «▼ CA −1») e o veredito à direita com «Comprar Loriga Segmenteira · faltam ◉ 7».
- **Falha:** **o mesmo ícone de pergaminho** para «Caixa de música quebrada», «Dente
  grande…» e «Mapa de Margens Altas»; os itens não têm arte. A grelha é de caixas castanhas
  iguais.
- **Fazer:** ícones por família de item (~40 glifos cobrem o acervo) e, para os raros, uma
  pintura pequena no estilo dos retratos. · **M** · desenho.

### 3.14 Códex — **5/10** [c13]

- **Funciona:** títulos, bestiário 0/23, registos e crónica.
- **Falha:** é **uma gaveta lateral**, enquanto Diário, Bolsa, Mercado e Mapa são ecrã
  inteiro: são **três padrões de sobreposição** (modal cheio, gaveta lateral e painel na
  folha). Lista longa de conquistas bloqueadas em cinzento.
- **Fazer:** uma forma de painel só (a folha de livro de §3.10) para Diário, Códex e Bolsa. ·
  **M** · desenho.

### 3.15 Masmorra (o painel na folha) — **5/10** [c35]

- **Funciona:** «1 de 9 salas», as passagens por pista («escuta-se água corrente»), as
  tochas a gastar e o «Procurar nesta sala (10 min · rolagem de Percepção)».
- **Falha:** é uma caixa escura dentro do pergaminho (quebra a lei «na folha só há tinta»).
  A pílula escolhida («Normal») é **violeta**, a cor da magia (`T.violet`), usada como
  «selecionado». «camada 0».
- **Fazer:** a planta da masmorra como **mapa desenhado à mão** que se revela sala a sala, e
  as passagens como portas. · **G** · desenho.

### 3.16 Não vistas hoje (sem nota)

A **fogueira**; a **cerimónia do espólio** (a carta que vira) e o **despertar** da arma; a
**gaveta do quadro** e as **cartas de pista** (vi só o sinal «PISTAS 0 de 1»); a **subida de
nível**; a **morte** e o fim; **Talentos/Habilidades**; **Grupo, Pessoas e Mural**; a
**sala a dois**; a **crónica gerada**; a **Mesa do Mestre**; o **golpe final** (Poupar/Matar);
a **luta com o painel de reação a expirar**. Nenhuma destas apareceu em ~15 turnos de uma
campanha nova. **Isso é um achado por si:** em 15 turnos o jogador novo não chega a ver a
maior parte das cerimónias que o projeto construiu.

---

## 4 · A casca (ordem de 04/11): quanto está no ar

Peças da direção «C — a mesa», conferidas uma a uma no jogo vivo:

| peça | no ar? | prova |
|---|---|---|
| A folha de pergaminho com a prosa | **sim** | [c21], `T.pergaminho`, 12,15:1 |
| A mesa (feltro em vez de madeira, escolha da pessoa em 05/11) | **sim, mas vazia** | ~60 % de feltro liso a 1440 [c22] |
| Cinzel nos títulos curtos | **sim** | rótulos LUGAR/PISTAS/HORA, nomes nas cartas |
| A bandeja e as 7 formas do dado | **sim, pequena** | 48 px, 520 ms [c06] |
| A proposta da frase com dado | **sim** | [c24] |
| As peças de recurso (rações, água, tochas como dados de uso) | **sim, a 11 px** | trilho direito [c05] |
| Os retratos como cartas | **sim** | grupo, Bolsa, encontro, batalha |
| A vela e a luz quente | **quase nada** | `luzDaVela: 0.07` (`estilo.js:2797`); o ícone da hora é uma vela de 10 px |
| O objeto na mesa (dados soltos, moedas, mapa dobrado, vela acesa) | **não** | — |
| A cena do lugar | **não** (30 cenas paradas) | `App.jsx:1487-1491` |
| Os painéis como objetos (livro, bolsa de couro, grimório) | **só nos ícones**; os painéis abrem como modais castanhos | [c08][c12][c13] |
| O mapa na mesma luz | **não** (v3 azul-noite) | [c09] |

**Estimativa:** cerca de **60 % da casca está no ar**. Está a parte que se *lê* (folha, tipo,
peças, dado); falta a parte que se *vê ao longe* (o lugar, a luz, a mesa cheia, a cerimónia).

**O que dá mais impressão por esforço, por ordem:**

1. **A cena pintada no topo da página** (assets prontos; uma faixa de ~180 px com
   esbatimento para o pergaminho, só no turno de chegada e recolhendo depois). **S–M.**
2. **O d20 grande** (§5.1). **M.**
3. **A mesa cheia a ≥ 1280**: o grupo como cartas de 140 px de pé, a bandeja a rolar no
   feltro ao lado da folha, a vela que tremeluz (com saída). **M.**
4. **O mapa no pergaminho.** **M.**
5. **Os painéis como livro.** **M–G.**

---

## 5 · O dado, o *juice* e o som

### 5.1 O dado à vista

**Hoje:** 48 px; rola 520 ms com uma rotação de −18° (`painel-bandeja.jsx:82`); pousa em
140 ms; o veredito leva 180 ms. Medi o percurso inteiro em ~680 ms. O som são duas batidas
sintetizadas de 70 ms (`som-da-mesa.js:55-58`).

**Proposta (forma minha, momento do `jogo`):**

- **O lançamento**: o dado sai da bandeja para o **centro da folha, a 160 px**, rola entre
  **1,2 e 1,6 s** com a face a trocar e a rotação a abrandar, e pára. O modificador soma-se
  depois em letra que conta («13 → +1 → **14**»), contra o «precisa de 13» desenhado como
  linha na bandeja. **Saída:** tocar salta para o fim; `prefers-reduced-motion` mostra o
  resultado em 120 ms (`MOVIMENTO_DO_DADO.semMovimento` já existe).
- **O 20 natural:** a face acende em âmbar, há uma onda de luz no feltro, o sino do crítico
  (que já existe no som da luta) e o chip fica com coroa. **O 1 natural:** o dado racha,
  com um tom grave, e o chip fica com uma fissura. São os dois momentos que um jogador de
  RPG grava e partilha.
- **Nunca custa o turno:** a rolagem corre enquanto a narração é pedida (o sistema já decide
  antes da IA), por isso os 1,5 s **escondem a latência** em vez de a somarem.
- **Medida:** (1) tempo do gesto ao primeiro texto ≤ 1,6 s; (2) um dado a cada 2–3 turnos
  fora da luta (régua de 04/11). Na minha sessão: abertura com dado, examinar com dado,
  viagem com dado do mundo, encontro com dado. **4 dados em 6 turnos fora da luta → a régua
  cumpre-se.**

### 5.2 O *juice* (onde o jogo está parado)

| momento | hoje | falta |
|---|---|---|
| XP ganho | «+60 XP · uma terra…» em mono 12 px | a barra de XP do herói enche, com o número a contar |
| Moedas | «Achado na estrada: 9 moedas para a bolsa.» | a moeda voa da folha para a Bolsa e o contador sobe (24 → 32) |
| Conquista | «Conquista desbloqueada: 🍻 Ombro Amigo — título…» em mono, logo no 1.º turno | um selo que pousa no canto e vai para o Códex |
| Dano no herói | PV 20 → 9 na barra | a carta treme, há uma lasca vermelha e o número sobe e some (o «−20 que sobe e some em 1,2 s» de D2 na pauta) |
| Vitória | caixa estática | §3.9 |
| Viagem | 3 linhas mono | a faixa do rumo **anda** (o herói desliza no arco) |

### 5.3 O som

**Hoje:** Web Audio sintetizado (zero ficheiros). Há um interruptor «Som da mesa». Os
momentos são a carta, o dado, o despertar e seis da luta, a −18 dB (`som-da-mesa.js:31-124`).
**Não há música, ambiente, nem foley gravado.** O dado é um triângulo de 260 → 90 Hz e soa a
clique de UI, não a osso no feltro.

**Fazer:** (1) **Um leito de ambiente por tipo de lugar** (taverna, estrada, masmorra,
batalha), em loops OGG/Opus de ~60 s a ~48 kbit/s (~350 KB cada), carregados preguiçosamente
depois do primeiro gesto. (2) **Foley gravado do dado** (3 variações de d20 em feltro, ~15 KB
cada). (3) **Um tema de 20 s** no menu. **Custo:** licenças CC0/royalty-free ou encomenda; é
dinheiro, logo é da pessoa. Sem custo, há só (2) com gravação própria.

---

## 6 · Onboarding e clareza

- **Não há tutorial nem primeira cena guiada.** O jogador cai numa página com duas linhas de
  sistema e um campo «O que você faz? Fale, aja, explore…». No meu turno 1 sem IA, a única
  ajuda foi o dado já chamado. **A página em branco é o maior medo do jogador de RPG de
  texto** (é a queixa nº 1 de AI Dungeon).
- **Sugestões de ação:** não as vi. O ícone ✦ ao lado do campo é «Habilidades» (`aria-label`
  medido), não sugestões.
- **Espera pelo Narrador:** a linha «Mestre preparando…» a 12 px no fim da página, e o campo
  diz «Pode ir escrevendo…» [c20]. Sem streaming, a prosa chega aos ~5–8 s de uma vez. O que
  se vê durante a espera é uma faixa fina com três pontos.
- **Erros:** bons. O erro de rede tem «Tentar de novo» e diz que os dados ficam decididos
  [c07].
- **Estados vazios:** bons no Diário («Ainda não se sabe», «Nenhuma missão encerrada
  ainda»). O Códex abre numa lista longa de bloqueados.

**Fazer:**

1. **Uma primeira cena guiada por desenho, não por texto de ajuda:** a abertura já chama um
   teste; acrescentar **três propostas tocáveis** sob a prosa do 1.º turno (a «Proposta da
   frase» já existe como peça: «Ir ao Pregão da Âncora», «Falar com Piotr», «Procurar
   rastros»), que somem quando o jogador escrever a primeira frase dele. **M** · jogo
   decide, desenho fabrica.
2. **A espera com presença:** uma pena que escreve na folha onde a prosa vai nascer, e o
   texto a revelar-se frase a frase (mesmo sem streaming de rede, revelar ~40 caracteres por
   frame dá a sensação de voz). Com `prefers-reduced-motion`, aparece inteiro. **S–M.**
3. **Streaming real** do `/api/narrador` corta a latência percebida para ~1 s até à primeira
   palavra. Toca a função da Vercel (infra), por isso é da pessoa. **M.**
4. **Medida:** 5 jogadores novos, cronometrados até à primeira ação escrita deles e até ao
   primeiro dado. Alvo: < 60 s da abertura do link à primeira frase.

---

## 7 · Telefone (375×812)

**Joga-se. É a nossa melhor plataforma, e o público chega por ela.**

| o quê | estado | prova |
|---|---|---|
| Rolagem lateral | nenhuma (`scrollWidth` = 375) | medido |
| Alvos ≥ 44 px | 14 de 15 (o tirador da gaveta mede 13 de alto) | medido |
| Prosa | ~40 caracteres por linha, 17 px | [c16][c34] |
| Batalha | jogável; rótulos de intenção cortados na borda; «como? (opci…» | [c36] |
| Códex | sem porta visível | medido |
| Primeira carga | ~3,5 MB antes do menu (JS 1,79 MB gz + hero 1,54 MB + marca, fontes e Tailwind) | build de produção |
| Partilha do link | **sem `og:image`, `og:title`, `description`, `favicon`, `apple-touch-icon`, `theme-color` nem `manifest`** | `index.html` inteiro tem 12 linhas |
| Depois de mudar o tamanho, a rolagem fica longe do fim (a última prosa abaixo da dobra) | visto | [c34] |

**O que quebra a experiência no telemóvel não é a tela: é a chegada.** Um link partilhado no
Discord ou no WhatsApp aparece **sem imagem nem descrição**, abre num **ecrã verde vazio**
durante segundos, e cai num **formulário de sete secções**.

---

## 8 · O sistema de design

### 8.1 Coerência (medido hoje em HEAD)

- **Tokens:** `T` tem 34 chaves com o contraste anotado ao lado (`estilo.js:144-214`). É bom e
  raro. `estilo.js` mede **357 KB**.
- **«Uma ação, uma forma» na contagem:** `<button>` cru **128** no `App.jsx` contra **14**
  `<Botao>`, e **162** contra **18** nos painéis e em `ui.jsx`. No todo **290 crus contra 32
  (≈ 10 %)**.
- **Cores literais:** **44 `rgba(` e 8 hex no `App.jsx`, 45 hex nos painéis.** Os véus dos
  modais são todos literais e ainda da v3 violeta: `rgba(6,4,10,0.94)`, `rgba(8,6,14,0.85)`…
  (`App.jsx:630, 747, 823, 961`).
- **Estilo inline:** **805 `style={{` no `App.jsx`** e **1 441 classes Tailwind** comuns
  (`flex`, `text-xs`, `px-*`…), compiladas no navegador pela CDN.
- **Emoji e dingbats no `App.jsx`: 597.** Os mais frequentes: ⚡79 ⛔57 ✦32 ⚔21 ★16 🎲15 ⚑15
  ☠13 📜13 ⚠12 🏛10 🛡10 🧭9. Os emoji coloridos (🎲📜🏛🛡🧭🍻🌠) desenham-se com a fonte do
  sistema operativo: cada SO dá outra cara, e nenhuma é a da casa.
- **Padrões de painel:** três (ecrã inteiro, gaveta lateral, caixa na folha). §3.14.
- **Cores com dois trabalhos:** violeta como «selecionado» na masmorra [c35]; rosa como chão
  do botão principal no menu [c15].
- **Tipografia:** quatro famílias (Cinzel, Cormorant, Spectral, JetBrains Mono). A Cormorant
  quase não aparece na tela principal (13 caracteres). O mono é a voz dominante fora da
  prosa.
- `App.jsx` tem **29 341 linhas** (o `CLAUDE.md` diz ~21 mil: envelheceu).

### 8.2 Dívida técnica que é dívida visual

1. **Tailwind pela CDN em produção:** aviso na consola, CSS gerado em tempo de execução por
   observador de mutações (custa a cada render) e uma dependência externa no caminho
   crítico. **Fazer:** Tailwind CLI ou PostCSS no build (ficam só as classes usadas), ou
   migrar as 1 441 classes para `estilo.js`. **M** · aprendiz (fora do `App.jsx` é só a
   config; dentro, nenhuma linha muda).
2. **Um bundle só, 5,3 MB:** `vite.config.js` não tem `manualChunks` nem `import()`.
   **Fazer:** separar a criação, a batalha e os painéis grandes em chunks preguiçosos; a
   tela principal tem de ficar < 600 KB gz. **M** · oficial.
3. **Imagens do menu:** a hero PNG de 1,54 MB vira WebP ou AVIF ~120–180 KB com `srcset`
   (375/768/1440); a marca vira 128×128 WebP ~8 KB. **S.**
4. **Splash no `index.html`:** o feltro, a marca e uma frase em HTML e CSS puros (<4 KB)
   pintados no primeiro byte. **S.**

### 8.3 A arte: o que temos e o que falta para lançar

| acervo | temos | falta | custo estimado |
|---|---|---|---|
| Retratos de herói | 240/240 (1 variante) | 2.ª variante (todas as Hildas guerreiras humanas têm a mesma cara) | ~240 gerações (F4), créditos do Figma, da pessoa |
| Feras | 18 | o bestiário tem 23 entradas no Códex («0/23»); faltam ~5 | ~5–10 gerações |
| Elenco (NPCs por ofício) | 0 pintados (F3) | 240 | ~240 gerações |
| Cenas | **30, por usar** | ligá-las (0 de arte) | 0 |
| Chão do tabuleiro | 1 (deserto) de 10 plantas | 9 texturas tileáveis ~512 px | ~9–18 gerações, ou pintura à mão |
| Itens | 0 (ícones de traço genéricos) | ~40 glifos por família + ~20 pinturas de raros | glifos: desenho, S–M; pinturas: ~20 gerações |
| Arte de menu e logotipo | 1 ilustração fora do estilo | 1 ilustração-chave + logotipo | ~5 gerações + desenho |
| Som | 0 ficheiros | 4 ambientes + foley do dado + tema | licenças ou encomenda (dinheiro → pessoa) |

**A arte mínima para lançar:** a **ilustração-chave e o logotipo** (para o menu, o og:image e
o ícone), as **cenas ligadas** (custo zero) e o **chão das 9 plantas**. O resto pode vir
depois.

---

## 9 · Acessibilidade e desempenho

### 9.1 Contraste — **passa**

Todos os pares medidos passam AA para texto (tabela no §2.8 e `estilo.js`). O pior par de
letra que encontrei é a tinta média sobre a borda da vinheta, com 5,60. O divisor `line`
mede 1,51 contra o feltro, o que é aceitável porque é decorativo; a borda de controlo
`lineStrong` mede 4,00.

### 9.2 Tamanho — **falha**

Há 14 textos abaixo de 12 px na tela principal a 1440, e um nome de companheiro a **9 px**.
O WCAG não fixa um mínimo, mas a WCAG 1.4.4 pede que o texto escale até 200 % sem perda.
**Não há controlo de tamanho de texto no jogo.** **Fazer:** piso de 12 px, e «Tamanho do
texto: normal / grande» no ⚙ (um multiplicador em `TIPOS`). **S–M.**

### 9.3 Teclado e leitor de ecrã

- Esc fecha Diário, Mapa, Bolsa e Códex (testado). Os botões principais têm nome
  acessível: «Yorick Punho-de-Pedra, a ficha e a bolsa», «Rolar d20 + 1. Percepção, precisa
  de 13. Se falhar…», «Pistas: 0 de 1. Abrir.». É bom.
- **Há só um `<h1>` em todo o jogo** («Taverna», no menu). **A batalha não tem nenhum
  cabeçalho** (medido: `headings: []`). Um leitor de ecrã não navega por regiões.
- **Regiões vivas:** `aria-live` existe em `ui.jsx` (5), bandeja (2), batalha (2), espólio
  (2), mesa do Mestre e quadro (1 cada). **Não achei `aria-live` nem `role="log"` na página
  da prosa** (`App.jsx`: 0 ocorrências de `aria-live`), por isso **a narração nova não é
  anunciada**.
- Na criação do mundo, **2 botões sem nome acessível** (medido).
- **Fazer:** a página da prosa com `role="log" aria-live="polite"`; um `<h1>` por ecrã
  (o nome do lugar; na batalha, «Rodada 1 · Na estrada»); nome nos cartões de escolha. **S.**

### 9.4 Movimento reduzido

Há **105 `@keyframes`** e **31 ocorrências de `prefers-reduced-motion`** em
`estilo.js`/`*.jsx`. Não emulei a preferência no navegador hoje, por isso **não verifiquei ao
vivo**. Pelo código, o dado tem um ramo `semMovimento: 120`.

### 9.5 Desempenho

| medida | valor | como |
|---|---|---|
| JS da produção | **5 336 KB min · 1 792 KB gzip · 1 ficheiro** | `vite build` + `vite preview` |
| Imagem do menu | **1 541 KB PNG** (1344×768, mostrada a 303–1380 px) | Performance API |
| Marca | 131 KB JPG 1024² mostrada a 61 px | idem |
| Retratos | 9,2 KB média, WebP 320² | `public/retratos`, 3,0 MB no todo, preguiçosos |
| Cenas | 656 KB **não usadas** | grep |
| Pintura antes do JS | **nenhuma** (raiz vazia) | `index.html` |
| Tempo até interativo em localhost | 611 ms (DCL), sem limitação | Performance API; não representa telemóvel |
| Latência do turno com IA | 5,4 / 5,6 / 8,0 s até ao texto; o dado chamado a 276 ms | medido no DOM |
| Entrada na batalha depois de «Lutar» | ~30 s até ao tabuleiro | medido |

---

## 10 · Lista priorizada

### P0 — não se lança sem

| # | problema | prova | o que fazer e como | tam. | quem | como se mede |
|---|---|---|---|---|---|---|
| P0-1 | **Ecrã vazio na primeira carga**: 1,8 MB gz de JS antes de qualquer pixel, mais 1,5 MB de PNG no menu | §9.5; `index.html` | (a) splash em HTML/CSS inline no `index.html` (feltro, marca, «a acender as velas…»); (b) hero e marca em WebP/AVIF com `srcset`; (c) `manualChunks` e `import()` para criação, batalha e painéis | M | aprendiz (a,b) · oficial (c) | Lighthouse mobile: FCP < 1,5 s, LCP < 2,5 s, JS inicial < 600 KB gz |
| P0-2 | **Tailwind pela CDN em produção** (aviso na consola, CSS em tempo de execução) | consola do build | Tailwind CLI/PostCSS no `vite build` | S–M | aprendiz | 0 avisos na consola; CSS estático < 40 KB |
| P0-3 | **O link partilhado não tem cara** | `index.html` sem og, favicon, manifest | `og:title`, `og:description`, `og:image` 1200×630 (a ilustração-chave), favicon SVG, apple-touch-icon, `theme-color` do feltro, `manifest.json` | S | desenho (imagem) → aprendiz | depurador de partilha do Discord/WhatsApp mostra cartão com imagem |
| P0-4 | **Disco branco gigante depois de Mover** | [c29]; `outline: auto` no `rect.tv-anel-foco-no-campo` | `outline-style: solid` explícito também em `:focus`, e nada de anel UA no foco programático | S | aprendiz | captura depois de Mover a 1440 e 375, sem disco |
| P0-5 | **O sistema fala de si e em português errado** | [c25][c26][c35][c14]: «187 de poder (você 126 + 1…) 2.8×», «⌖ K11 50,5 · 50,2», «camada 0», «faltam 1 avanco», «3 Rato Gigantes», «PODER 121» | o veredito em palavras e régua de caveiras, com o número no toque; sem coordenadas nem índices; corrigir cedilha e plural; um varredor de texto de tela para «poder (», «⌖», «camada 0» | S–M | desenho (frase) → backend (tabelas de palavras) → aprendiz | varredor verde; 0 ocorrências em 20 turnos |
| P0-6 | **Sem menu nem pausa**: som, sair e rolagens em Bolsa › Perícias | `App.jsx:2641-2659` | botão ⚙ no topo e Esc com painel: Som, Tamanho do texto, Rolagens à vista, O Mestre rola por mim, Guardar em arquivo, Sair para o início | S | desenho → oficial | do jogo ao «Som: não» em ≤ 2 toques |
| P0-7 | **A criação esconde os retratos** e pede sete secções | [c02][c03] | «Começar já» com mundo por omissão, e o herói escolhido em grelha de retratos com a carta grande à vista | G | desenho → aprendiz → oficial | da abertura do link à 1.ª narração < 90 s para um jogador novo (5 pessoas) |
| P0-8 | **O dado não é um momento** (48 px, 520 ms; o nat 1 como linha de log) | [c06][c30]; `estilo.js:1019` | §5.1: lançamento no centro a 160 px, 1,2–1,6 s, tocar salta, reduced-motion 120 ms, cerimónia do 20 e do 1 | M | desenho → aprendiz | experiência jogada do `jogo`; gesto → primeiro texto ≤ 1,6 s |

### P1 — primeira semana

| # | problema | prova | fazer | tam. | quem |
|---|---|---|---|---|---|
| P1-1 | **As 30 cenas pintadas por usar**; a tela não mostra o lugar | `App.jsx:1487` | a cena no topo da página no turno de chegada, recolhendo para 48 px depois | S–M | desenho → oficial |
| P1-2 | A 1440 a mesa está ~60 % vazia | [c22] | grupo em cartas de 140 px, bandeja na mesa, vela | M | desenho → aprendiz |
| P1-3 | Rótulos a 9–11 px; sem tamanho de texto | §9.2 | piso de 12 px; multiplicador em `TIPOS` | S–M | aprendiz |
| P1-4 | A voz mono na folha (84 % dos caracteres sem IA) | §3.4 | linhas de sistema em Spectral itálico com ícone, ou carimbo à margem | M | desenho → aprendiz |
| P1-5 | Nomes sobrepostos na faixa do rumo | [c26]: 75 px | corrigir a colisão entre filas em `faixa-do-rumo.js` | S | aprendiz |
| P1-6 | Intenções empilhadas e cortadas; reação encavala; quadro com metade vazia | [c28][c30][c36] | fundir intenções por alvo; reação no lugar da barra; altura do quadro pelas filas | M | desenho → aprendiz |
| P1-7 | A vitória é uma lista | [c32] | cerimónia de cartas, XP a contar | M | aprendiz |
| P1-8 | ~30 s entre «Lutar» e o tabuleiro | §3.7 | o tabuleiro abre já e a narração chega depois | M | oficial |
| P1-9 | Espera muda; sem streaming | [c20] | pena que escreve e revelação por frase; streaming real (infra → pessoa) | S–M | aprendiz · pessoa |
| P1-10 | Primeira cena sem guia | §6 | 3 propostas tocáveis no 1.º turno | M | jogo → desenho → oficial |
| P1-11 | Mapa azul-noite contra a mesa quente | [c09] | mapa em pergaminho cartográfico | M | desenho → aprendiz |
| P1-12 | Códex sem porta a 375 e a 800×451; cabe por 3 px a 1280×720 | §3.4 | porta no tirador e no ⚙; trilho que se adapta à altura | S | aprendiz |
| P1-13 | Narração sem região viva; sem cabeçalhos | §9.3 | `role="log" aria-live="polite"`; `<h1>` por ecrã | S | oficial |
| P1-14 | Chão das 9 plantas | `estilo.js:3224` | 9 texturas tileáveis | M | desenho (arte) |

### P2 — depois

- **P2-1** Migrar os 290 `<button>` crus para `Botao` e as variantes (catraca por contagem
  num varredor). G · aprendiz/oficial.
- **P2-2** Véus dos modais e os 97 literais de cor para `T` (`véu`, `véuForte`). S.
- **P2-3** Trocar os ~597 emoji e dingbats do `App.jsx` por `Glifo` da biblioteca (começar
  pelos 13 que aparecem em tela de jogo). M.
- **P2-4** Uma forma só de painel (livro) para Diário, Códex e Bolsa. M–G.
- **P2-5** Ícones de item por família (~40). M.
- **P2-6** Masmorra como planta desenhada à mão. G.
- **P2-7** A 2.ª variante dos retratos e o elenco F3 (créditos, da pessoa). G.
- **P2-8** O som: ambientes, foley e tema (dinheiro, da pessoa). M.
- **P2-9** O sorteio do nome a ouvir o sexo. S.

---

## 11 · Tecnologia e identidade próprias

Cada proposta foi escolhida por **sair de uma coisa que só nós temos**: o Mestre que é código e
a semente determinística.

### 11.1 **O dado que se pode provar** — o d20 físico e determinístico

- **O que é:** um d20 3D (WebGL leve ou CSS 3D) que rola no feltro com física simulada. O
  resultado é **o que o sistema já decidiu**: a física é integrada *para trás* a partir da
  face final, com a semente como parâmetro. Mesma semente, mesmo voo, em qualquer máquina.
  Um link «ver este dado» reproduz o lançamento.
- **Porque marca:** os jogos de IA não têm dado; os VTT (Foundry, Roll20) têm dado aleatório
  de verdade, que não se pode reproduzir. **Um nat 20 que se pode partilhar e repetir
  exatamente** é material de clip infinito.
- **O que já existe:** `FORMAS_DO_DADO` (as 7 geometrias), `MOVIMENTO_DO_DADO`,
  `PAPEL_DO_DADO`, o determinismo por semente (lei da casa), `tocarDado`.
- **Custo e risco:** M–G. Risco: peso (um WebGL mínimo é ~30–60 KB gz; three.js inteiro não
  serve). Mitigação: CSS 3D de um icosaedro com 20 faces em `transform` dá 80 % do efeito
  com 0 KB de dependência.

### 11.2 **O cartão da sessão** — gerado pelo sistema, partilhável

- **O que é:** ao fechar a sessão (ou na fogueira), o jogo compõe em `<canvas>` um cartão
  1080×1350: a carta do herói pintada, o lugar (a cena), «3 nat 20 · 1 nat 1 · 3 ratos
  gigantes», **a melhor frase da noite** (a do maior dado), a silhueta do vilão e a semente.
  Um botão «Guardar imagem / Partilhar» usa a Web Share API no telemóvel.
- **Porque marca:** é o *Wrapped* do RPG, e cada partilha é um anúncio com a nossa arte.
- **O que já existe:** retratos, cenas, `registro`/`historico` no save, o Códex, a moldura da
  carta.
- **Custo e risco:** M. Feito no cliente, sem infra. A versão com link e og:image por sessão
  precisa de servidor: é infra, da pessoa.

### 11.3 **O replay da luta pela semente**

- **O que é:** como a luta é determinística, gravar a semente e os gestos chega para a
  reproduzir. «Ver a luta outra vez» anima o tabuleiro a 2× com as bolhas de golpe e exporta
  um WebM ou GIF de 15 s (`MediaRecorder` sobre um canvas espelho).
- **Porque marca:** os clips de jogada táctica são o que circula (Into the Breach, Slay the
  Spire), e **nenhum RPG de IA tem combate reproduzível**.
- **O que já existe:** `SE — o combate ganha uma semente` (Fase SE), o evento do golpe, a
  grelha, as intenções.
- **Custo e risco:** G. Risco: o estado da luta tem de ser serializável por gestos; a prova é
  uma suíte «replay == original».

### 11.4 **A crónica ilustrada** — a campanha como livro

- **O que é:** o botão «Gerar crónica» (já existe no Diário) passa a produzir **um livro**: uma
  página por capítulo com a cena pintada por cabeçalho, a prosa do Mestre em Spectral, os
  retratos de quem apareceu na margem e o dado que decidiu cada virada impresso como
  capitular. Exporta para HTML autónomo ou PDF (impressão do navegador).
- **Porque marca:** «a tua campanha é um livro com a tua cara» é uma frase de marketing
  pronta, e é a promessa de Roadwarden e Disco Elysium tornada pessoal.
- **O que já existe:** `onExportarCronica`, as 30 cenas, os 258 retratos, a folha e a sua
  tipografia, a «página impressa» que o `jogo` reservou para R16.
- **Custo e risco:** M. Risco baixo; é só leitura do save.

### 11.5 **O retrato que guarda a campanha** (já na pauta, e eu reforço)

- **O que é:** cicatrizes, queimaduras e cabelo grisalho por cima da pintura, postos pelo que
  aconteceu.
- **Porque marca:** dá um rosto que conta a história, e alimenta o 11.2 e o 11.4.
- **O que já existe:** o contrato de enquadramento de cada retrato (`cx`, `olhos` medidos pelo
  MediaPipe em `retratos-medidos.json`) diz **onde** está a cara: a cicatriz cai no sítio
  certo em 240 rostos sem desenho manual.
- **Custo e risco:** M (peça) mais um campo de save novo e aditivo (reversível pela lei de
  28/09).

### 11.6 **A mesa para quem assiste** (modo stream e espectador)

- **O que é:** um modo 16:9 com a página a 70 % da altura, o dado grande, sem barras de
  preferência, e uma «câmara» que segue a ação (na luta, o tabuleiro; fora dela, a folha).
  Na sala a dois, o segundo jogador pode ser **só espectador**.
- **Porque marca:** os criadores de conteúdo são o canal do público gamer; um RPG de IA que
  **se vê bem em stream** é raro.
- **O que já existe:** a sala a dois (`api/sala`), a página, a bandeja.
- **Custo e risco:** M para o layout; o espectador na sala toca o protocolo (`api/sala`), e é
  da pessoa.

---

## 12 · As 5 apostas

Se só pudéssemos fazer cinco coisas no visual e na UX antes de lançar:

1. **A chegada (P0-1, P0-2, P0-3).** Splash instantâneo, bundle partido, imagens leves,
  Tailwind compilado e cartão de partilha. *Porquê:* o público chega por link no telemóvel,
  e hoje recebe um link sem cara e um ecrã verde. Tudo o resto depende de ele ficar os 10
  primeiros segundos. **Medida:** Lighthouse mobile ≥ 80 e LCP < 2,5 s.
2. **O dado no centro da mesa (P0-8 e §11.1 na versão CSS 3D).** *Porquê:* é a ordem de 04/11
  e é o momento do BG3 que toda a gente reconhece. Já ganhamos na regra (o sistema decide
  antes da IA, a 276 ms); falta ganhar no olho, e a animação **esconde** a latência em vez de
  a somar. **Medida:** experiência jogada do `jogo`, e um GIF de nat 20 que se queira
  partilhar.
3. **A criação como mesa de retratos, com «Começar já» (P0-7).** *Porquê:* temos 240
  pinturas e a criação mostra um ícone de traço. É o primeiro contacto do jogador com o
  herói e com a arte, e hoje é um formulário de `<select>`. **Medida:** tempo até à 1.ª
  narração < 90 s, e a % de jogadores que mudam de raça ou classe mais de 3 vezes (sinal de
  que brincaram).
4. **O lugar pintado e a mesa cheia (P1-1, P1-2).** *Porquê:* as 30 cenas estão prontas e
  paradas; com elas e com o grupo grande à volta da folha, a 1440 deixa de ser 60 % feltro
  liso, e a captura passa a mostrar um *sítio*. É a maior subida de impressão por hora de
  trabalho do relatório. **Medida:** o par antes/depois no Figma e a fração da tela com
  conteúdo a 1440 (hoje ~40 %, alvo ≥ 70 %).
5. **A limpeza do que se lê (P0-4, P0-5, P0-6, P1-4, P1-5).** Sem disco gigante, sem «187 de
  poder…», sem «camada 0», sem «avanco», sem nomes sobrepostos, com ⚙ e Esc, e com a voz da
  máquina fora da folha. *Porquê:* são os defeitos que um streamer lê em voz alta e de que se
  ri. Um jogo «acabado» não mostra o seu depurador. **Medida:** 20 turnos de uma campanha
  nova com zero ocorrências, com um varredor de texto de tela como catraca.

**A proposta ambiciosa deste ciclo** é o **§11.2, o cartão da sessão**. É barato (cliente
apenas), usa só o que já existe e transforma cada sessão num anúncio pintado. Vai para «Para
a pessoa decidir» quando a fila do desenho reabrir; aqui fica só escrita, porque esta tarefa
não semeia a pauta.
