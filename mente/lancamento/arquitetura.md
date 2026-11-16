# Taverna — a arquitetura do lançamento

**15/11/2026 · sobre a v9.647.** A ordem da pessoa: *«arquitete tudo, inclusive uma melhoria nas
telas que temos para que o Taverna seja realmente um jogo AAA… nosso design precisa ser autêntico e
original, uma experiência imersiva em um mundo de RPG. Use a língua PT-BR em tudo. Você tem minha
permissão para qualquer alteração que precise ser feita.»*

Quem faz o quê: **o Figma é de um agente em Fable** (as telas, antes do código); **o código é de um
agente em Opus** (aplica tudo no sistema). Este documento é a planta dos dois. As provas de cada
defeito estão em `analise-jogo.md`, `analise-visual.md` e `capturas/`; a ordem das ondas e os
portões, em `plano-de-lancamento.md`.

---

## 1. A direção de arte — «A Mesa do Mestre»

**A ideia, numa frase:** *você não está a olhar para uma interface; está sentado à mesa, do lado do
jogador, e tudo o que existe é um objeto pousado nela.*

Não é a fantasia genérica dos jogos (moldura de pedra, filigrana dourada, barra de vida vermelha).
É a **materialidade de uma mesa de RPG à luz de vela** — a coisa que só o RPG de mesa tem e que
nenhum jogo de IA nem nenhum CRPG mostra. É a direção «C — a mesa» de 04/11 levada até ao fim.

### 1.1 A lei da mesa (o teste de toda peça)

> **Se não poderia estar em cima de uma mesa, não aparece na tela.**

| o que o jogo precisa mostrar | o objeto na mesa |
|---|---|
| a narração | **a página** — pergaminho, tinta, a letra do Mestre |
| o lugar | **a estampa** — a cena pintada colada no alto da página, como ilustração de livro antigo |
| o risco | **o dado** — osso, grande, que voa e pousa no feltro |
| gente, bichos, espólio, escolhas | **cartas** — viram, pousam, vão para a mão |
| recursos (rações, água, tochas, moedas) | **peças** — fichas e moedas empilhadas, que se contam olhando |
| a hora | **a vela** — queima ao longo do dia; a altura dela é o relógio |
| o que o sistema confirma (quest fechada, nível, conquista) | **o lacre** — o selo de cera que o Mestre bate na página |
| o que o sistema avisa (XP, moedas, regra) | **a nota do Mestre** — uma linha à margem, na letra dele |
| Diário e Códex | **o livro** — aberto, com fitas marcadoras |
| inventário | **a bolsa de couro** aberta sobre a mesa |
| o mapa | **a carta** — pergaminho cartográfico desenrolado |
| a luta | **o tapete de batalha** — desenrola-se sobre a mesa e toma o lugar da página |
| menu, pausa, preferências | **o escudo do Mestre** — a divisória que o Mestre levanta; do lado de cá, as regras da casa |
| a espera pela IA | **a pena que escreve** — nunca uma barra, nunca «carregando» |

O que **sai** da vista do jogador: caixa escura dentro do pergaminho, letra de terminal (mono) em
texto corrido, modal castanho, emoji do sistema operacional, número de bastidor, coordenada, índice.

### 1.2 A luz

A vela é a única fonte de luz, e ela é mecânica:

- **De dia** a mesa é clara e quente; **à noite** o feltro escurece e o halo da vela encolhe em
  torno da página; **na masmorra** a luz é a das tochas — a pilha de tochas na mesa é o raio do halo.
  O jogador *vê* que tem pouca luz antes de ler o número.
- Sombras suaves debaixo de toda peça (carta, dado, livro): é o que separa «objeto pousado» de
  «retângulo desenhado».
- `prefers-reduced-motion`: a vela não tremula, o halo é fixo.

### 1.3 A paleta — quente, de materiais (os valores saem de `T`; aqui vão os papéis)

| material | papel | regra |
|---|---|---|
| **feltro** (verde-garrafa profundo) | o chão de tudo | decisão da pessoa em 05/11; fica |
| **pergaminho** e **tinta** | toda leitura longa | 12:1 hoje — não se mexe |
| **âmbar** (a chama) | o que está vivo: foco, o dado ativo, a ação principal | uma ação principal por tela |
| **latão** | molduras de carta, cantos de livro, fivelas | nunca texto |
| **lacre** (vermelho de cera) | selos, perigo, dano | nunca decoração |
| **osso** | dados e peças | — |
| **violeta** | magia, e só magia | sai de «selecionado» (hoje na masmorra) |
| ~~rosa~~ | marca | sai de chão de botão (hoje no «Continuar aventura») |
| ~~azul-noite da v3~~ | — | **aposenta-se**; o mapa vai para o pergaminho |

### 1.4 A tipografia

- **Cinzel** — títulos curtos, nomes em carta, números de dado.
- **Spectral** — toda prosa; **Spectral itálico** — a nota do Mestre (a voz do sistema na página).
- **A mono sai da vista do jogador.** Hoje 84 % dos caracteres visíveis sem IA são mono.
- **Piso: 12 px para rótulo, 13 px para nome**, sem exceção (hoje há 14 textos abaixo disso a 1440,
  um deles a 9 px). Um multiplicador de tamanho de texto no escudo do Mestre.

### 1.5 Os cinco momentos de assinatura (o que um trailer mostra)

1. **O lance** — o Mestre diz a perícia, o número e o preço; o d20 sai da bandeja, voa até o centro
   a 160 px, rola 1,2–1,6 s, para. O bônus soma em letra que conta. **20 natural:** a face acende,
   uma onda de luz corre o feltro, o sino. **1 natural:** o dado racha. Tocar pula; o voo cobre a
   espera pela IA em vez de somar a ela.
2. **A carta que vira** — encruzilhada, espólio, recompensa de vitória: sempre a mesma carta,
   sempre o mesmo gesto.
3. **O lacre** — quest fechada, nível novo, conquista: o selo desce e bate na página, com som.
4. **A estampa** — ao chegar a um lugar, a cena pintada abre no alto da página e recolhe depois.
5. **O tapete** — «Lutar» desenrola o tapete de batalha sobre a mesa **na hora**; a narração da
   entrada chega por cima quando chegar (hoje são ~30 s de espera muda).

### 1.6 O som (o que não custa dinheiro entra já; o resto é da pessoa)

Já: o dado com corpo (três variações sintetizadas mais graves, de osso no feltro), o lacre, a carta,
a pena. Depende de orçamento (D6 do plano): ambiente por lugar, tema do menu, foley gravado.

---

## 2. As telas — o que muda em cada uma

Notas de hoje entre parênteses (da `analise-visual.md` §3). Cada tela tem quadro no Figma a
**1440×900 e 375×812**; as de jogo, também a 1280×720.

### A · A chegada (menu 6 → alvo 9)
- **Abertura instantânea** em HTML puro: o feltro, a marca e a vela que acende — antes de qualquer JS.
- **A marca:** «Taverna» em Cinzel com um d20 em lacre. Serve de favicon, de imagem de link e de selo.
- **Primeira visita = uma ação:** «Sentar à mesa». O resto (continuar, arquivo) aparece só quando
  existe. Arte de abertura no estilo dos retratos: a mesa, a página, o d20 e quatro heróis do acervo.
- **Imagem de link** 1200×630 e 9:16.

### B · A criação (4 → alvo 9)
- **«Sentar à mesa» joga em um toque:** o sistema sorteia mundo e herói pela semente e mostra **a
  carta do herói pintada**, grande, com «trocar» em cada campo.
- **Quem quer escolher, escolhe em cartas:** raça e classe como leque dos 240 retratos; a carta
  grande muda de rosto a cada toque. Atributos como seis peças, com +/− de 44 px.
- **O mundo** como quatro cartas (cenário, forma, arco, voz); a voz do Mestre vira ao toque e mostra
  a frase de exemplo. Sem emoji do sistema.
- Meta: do link à primeira narração em **< 90 s e ≤ 4 toques** (hoje 17 cliques).

### C · A mesa — a tela principal (7 → alvo 9,5)
A 1440, três zonas sobre o feltro, sem feltro morto (hoje ~60 % vazio):
- **Esquerda — o grupo:** cartas de pé a 140 px (hoje 90), com PV/PM como peças na base; quem está
  em cena, numa fila de retratos sob o nome do lugar (a «sala à vista»).
- **Centro — a página:** a estampa do lugar no alto, a prosa, as notas do Mestre à margem, as
  propostas tocáveis, o campo de escrever como a linha onde a pena pousa.
- **Direita — a bandeja e as peças:** a bandeja do dado **no feltro**; as pilhas de rações, água,
  tochas e moedas; a vela-relógio.
- **Em baixo, à direita — os objetos:** o livro, a carta, a bolsa, o grimório, pousados; abrir é
  pegar. O **escudo do Mestre** num canto, sempre.
- A 375: a página ocupa a tela; grupo e peças numa faixa fina no alto; os objetos na barra de baixo
  — **com o Códex**, que hoje não tem porta no telefone.

### D · O dado (5 → alvo 10)
- **Uma forma só** para todo d20 fora da luta: perícia, social, enigma, busca da masmorra (hoje são
  três formas e uma escondida). O «Refazer» vive na bandeja.
- O lance, o 20 e o 1 de §1.5. O histórico dos dados como fila de dados pousados, legíveis.

### E · O veredito e a proposta da frase (5 → alvo 9)
- O perigo dito como o jogador sente: **«Acima de vocês»** com uma régua de caveiras; o número só
  ao toque. Fora: «187 de poder… 2.8×», «⌖ K11», «camada 0».
- O perigo de uma masmorra diz duas coisas: **à porta** e **no fundo**.

### F · O encontro e a luta (encontro 8,5 → 9,5 · luta 6 → 9)
- O encontro mantém-se (é o nosso melhor quadro); três inimigos, três retratos em leque.
- **O tapete abre já.** Intenções de vários atacantes no mesmo alvo fundem-se («3× 2–10 → Hilda»).
  A reação ancora no lugar da barra de ações, fora do campo. O quadro tem a altura das filas.
- Some o disco branco depois de Mover. Nomes inteiros.
- **A vitória é cerimônia:** as cartas do espólio viram, o XP conta e enche a barra, o lacre fecha.
- O chão das nove plantas que hoje são lisas (arte — entra por ordem de uso).

### G · Os objetos — Diário, Códex, Bolsa, Mercado (5–7 → alvo 9)
- **Uma forma de painel só: o livro aberto** sobre a mesa (hoje são três padrões: modal cheio,
  gaveta lateral, painel na folha). Diário e Códex são o mesmo livro com fitas.
- **A bolsa** é herói + inventário; preferências de luta e de marcha vão para o escudo do Mestre.
- **O mercado** é a banca: itens com ícone por família (~40) em vez do mesmo pergaminho para tudo.

### H · O mapa (6,5 → alvo 9)
Pergaminho cartográfico, tinta e aguadas por bioma; a hora pinta só a luz. Nomes sem colisão na
faixa do rumo (hoje 75 px sobrepostos).

### I · O escudo do Mestre (não existe → nasce)
⚙ no canto e **Esc**. Do lado de cá do escudo: Som · Tamanho do texto · Rolagens à vista · O Mestre
rola por mim · Na luta (reação, golpe final) · Na estrada (marcha) · Guardar em arquivo · Sair.

### J · As cerimônias e o fim da sessão
O lacre (quest, nível, conquista), a carta do espólio, a fogueira, e **o cartão da sessão** — a
imagem 1080×1350 que o jogo compõe ao fechar a sessão (herói, lugar, os dados da noite, a melhor
frase, a semente) com «Guardar» e «Compartilhar».

### K · A masmorra (5 → depois do beta fechado)
A planta desenhada à mão, que se revela sala a sala. É a única tela grande que fica para depois.

---

## 3. O Figma — os lotes do agente em Fable

Arquivo único: `Taverna — biblioteca`, `e5wJUzInAssoebx5npssKc` (lei da casa: nenhum segundo
arquivo). Uma página nova, **`10 · A Mesa do Mestre`**. Cada quadro leva o par **antes/depois** (a
captura de hoje, de `mente/lancamento/capturas/`, ao lado) e as medidas escritas. Toda peça nova
entra em `mente/formas.md` numa seção própria, com os tokens que pede a `T`.

| lote | quadros | destrava no código |
|---|---|---|
| **F1 · a fundação e a mesa** | os materiais e a luz (§1.2–1.4) · a marca, o favicon, a imagem de link · C (a mesa, 1440 / 1280 / 375, dia e noite) · I (o escudo) · a nota do Mestre e o lacre | V1, V2, V4, C1 |
| **F2 · o dado** | D inteiro: o chamado, o voo, o pouso, o 20, o 1, as quatro origens numa forma, o histórico | V3 |
| **F3 · a chegada e a criação** | A · B | V5, C2 |
| **F4 · a luta** | E · F (encontro, tapete, intenções, reação, vitória) | V6 |
| **F5 · os objetos e o mapa** | G · H | V7, V8 |
| **F6 · as cerimônias** | J (e o cartão da sessão) | V9, V10 |

---

## 4. O código — os pacotes do agente em Opus

Três trilhos. **S** (sistema) e **C** (chegada) não dependem do Figma e começam já; **V** (visual)
entra lote a lote, atrás do Figma. Cada pacote: módulo puro → fiação com `calou` → suíte → build
limpo → `npm test` verde → commit narrativo com os caminhos. Todo texto novo em **PT-BR**.

### Trilho S — a verdade e as regras

| # | pacote | o que entrega | prova |
|---|---|---|---|
| **S1** | **PT-BR em tudo** | um varredor de PT-PT nos textos de tela (`ficas`, `bónus`, `ecrã`, `telemóvel`, `estás`, `fá-lo`, `connosco`, 2.ª pessoa «tu» conjugada…) e a reescrita das tabelas de texto do motor e das peças; plural e cedilha («3 Rato Gigantes», «faltam 1 avanco») | varredor a 0 |
| **S2** | **prosa = bolsa** | «pego/apanho/guardo» + coisa do chão = o recolhimento do botão; vender o que não se tem é recusado antes do Narrador; veto em `naoPode` | corpus de 30 frases |
| **S3** | **nada inventado** | `teste-pauta-nao-pede-coisa` cobre `estante.js`; veto de gente nomeada pela IA | varredor + sessão |
| **S4** | **quem está aqui** | uma função pura lida pelo chip, pela pauta e pela fogueira; a causa do elenco que se cola | 500 cenas simuladas |
| **S5** | **os três primeiros minutos** | três propostas tocáveis na abertura; a fraqueza do vilão só a partir do ato 2; sem XP pela cidade natal; sem conquista no turno 0 | 1000 mundos |
| **S6** | **a tela não mostra o bastidor** | varredor de texto de tela («de poder», «×», «camada», «⌖», «(+N)»); o veredito em palavras | sessões gravadas |
| **S7** | **o clímax** | a etapa de criatura só fecha com a criatura em cena; o rasto fecha no covil | 1000 mundos |
| **S8** | **o perigo da porta** | o veredito diz «à porta» e «no fundo» | régua de 1000 masmorras |
| **S9** | **um dado só (motor)** | social, enigma e busca passam pelo chamado; o «Refazer» na bandeja; as frases que pediam dado e não tiveram | corpus |
| **S10** | **miúdos** | ida = volta; nomes que não repetem; gênero do epíteto; «ou X ou Y?» ≤ 10 % | catracas |
| **S11** | **o juiz de coerência** | o verificador determinístico prosa × estado (objetos, gente, cena) | divergências por 40 respostas |

### Trilho C — a chegada e a porta

| # | pacote | o que entrega |
|---|---|---|
| **C1** | o link tem cara | og, favicon, `theme-color`, manifest (arte do F1) |
| **C2** | nada de tela vazia | abertura inline; imagens em WebP; divisão do pacote; Tailwind compilado no build |
| **C3** | só o pronto na porta | a sala a dois atrás de `modoNaPorta` |
| **C4** | o modal que prende | a fila de cerimônias cobre e prende o foco, ou não bloqueia |
| **C5** | o disco branco | o anel do campo sem o contorno do navegador |
| **C6** | acessibilidade mínima | `role="log"` na narração, títulos por tela, piso de 12 px |

### Trilho V — as telas (atrás do Figma)

| # | pacote | lote do Figma |
|---|---|---|
| **V1** | os materiais em `estilo.js` e as peças novas em `ui.jsx` (a nota do Mestre, o lacre, a peça, a carta de pé) | F1 |
| **V2** | o escudo do Mestre (⚙, Esc) e a mudança das preferências para lá | F1 |
| **V3** | o lance do dado, o 20 e o 1, uma bandeja só | F2 |
| **V4** | a mesa cheia: três zonas, a estampa do lugar, a vela-relógio, a luz | F1 |
| **V5** | «Sentar à mesa» e a criação em cartas | F3 |
| **V6** | o tapete que abre já, intenções, reação, a vitória-cerimônia | F4 |
| **V7** | o livro (Diário + Códex), a bolsa, a banca | F5 |
| **V8** | o mapa em pergaminho | F5 |
| **V9** | o lacre nas cerimônias; a pena que escreve | F6 |
| **V10** | o cartão da sessão | F6 |

### A ordem de execução

1. **Agora, em paralelo:** Figma **F1** (Fable) · código **C3 + S5 + S2 + C5 + S6** (Opus).
2. Código **S1** (PT-BR) · Figma **F2**.
3. Código **V1 + V2 + V4** (a mesa nova) · Figma **F3**.
4. Código **V3 + S9** (o dado) · Figma **F4**.
5. Código **C1 + C2 + V5** (a chegada) · Figma **F5**.
6. Código **S3 + S4 + S7 + S8** · depois **V6** · Figma **F6**.
7. Código **V7 + V8 + V9 + V10 + S10 + S11 + C4 + C6**.
8. Sessão jogada contra os portões do plano; depois, o beta fechado.

**As regras de sempre continuam:** no máximo dois agentes ao mesmo tempo; um agente novo por lote,
com briefing curto; o bastão do `App.jsx`; `git commit -- <caminhos>`; o número da versão é de quem
sobe.

---

## 5. O que continua a pedir a sua palavra, apesar da permissão geral

A permissão cobre tudo o que um commit revertido conserta. Estas três coisas não se desfazem com
um commit, por isso só as aviso e espero:

- **gastar dinheiro novo** — som gravado, domínio, créditos de imagem além de um punhado para a arte
  de abertura;
- **mexer na infra** — teto global de gasto, telemetria, streaming da narração;
- **mudar um campo de save que já existe** ou apagar dado de jogador.
