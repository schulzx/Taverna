# O combate e a viagem — o diagnóstico, a visão e a Fase CB

*O `jogo`, 09/11/2026. Lido no código por âncora, medido em Node no scratchpad,
jogado no navegador com o `taverna-sem-ia` (porta 5199, a IA não corre).
As capturas de hoje estão em `mente/figma/cb-antes-1-abertura.png`,
`cb-antes-2-o-golpe.png` e `cb-antes-3-telefone.png`.*

## 0 · A palavra dela

*«Apertei em um lugar do mapa e depois apertei em viajar para o lugar e
instantaneamente abriu uma batalha contra um dragão ancião… não teve narração
sobre o encontro, não teve nada.»* — *«temos que ter um combate fluido e
instintivo, que também use todos os sentidos e que seja intuitivo… não
precisamos ter receio em copiar o que funciona… tem minha permissão para ousar
e decidir quais são as melhores alternativas.»*

Copiar **mecânica e convenção** é permitido. Arte, nomes e texto desses jogos
não entram. Toda peça abaixo cita de onde veio o mecanismo.

O peso: a ordem de 23/09 (liberdade no desenho) mais a permissão de hoje põem
a fase inteira na mão da mesa. O limite continua a ser o que um commit
revertido não desfaz. Todo campo novo desta fase (o encontro pendente, as
intenções, as superfícies, a altura da casa) é **aditivo e ignorado pela
versão antiga**, e logo é reversível.

---

## 1 · O dragão: o caso, a causa, o que devia ter acontecido

### 1.1 O caminho que o clique fez (reproduzido no código)

1. `Partir para X` no cartão do mapa → `partirPeloMapaVivo` (App.jsx ~25244)
   → `viajarPeloMapa(nome)` (App.jsx ~6806).
2. `viajarPeloMapa` arma `sinalViagemRef = nome`, escreve `🧭 X — a caminho.` e
   chama o Mestre com o envelope `partidaMapa`. **O Mestre narra a partida
   antes de qualquer encontro ter sido rolado.**
3. A resposta chega, e 400 ms depois `viajar(destino, { origem: "sinal" })`
   corre (App.jsx ~10865).
4. `viajar` rola o clima e o encontro: `rolarEncontro(genero, nivel)`
   (encontros.js:111). Em 32% dos trechos sai `perigo`.
5. `investidaDaEstrada` (encontros.js:182) decide com 1/3 de chance (até 60%
   com neblina) que a criatura **investe**. Se investe, `abrirCombate(...,
   "emboscada")` abre a mesa de batalha **na mesma hora**. A mesa toma a tela.
6. O envelope que pedia ao Mestre *«narre o instante da investida em uma ou
   duas frases»* vai junto com o trecho. Como a origem é `sinal`,
   `QUEM_RESPONDE.sinal` diz `chamadas: 0` (rastro.js:827), e o envelope **fica
   na nota à espera da próxima frase do jogador**. Na luta, a próxima frase
   já é um golpe.

### 1.2 A causa, em três frases

- **A luta abre sem narração** porque a ordem está invertida: o Mestre fala
  da partida antes de o sistema rolar a estrada, e o encontro, rolado depois,
  abre a mesa na hora e manda a narração dele para a fila da próxima frase,
  que nunca vem antes da luta. Entre a partida narrada e o dragão há
  **400 ms e zero palavras**.
- **O dragão ancião pode sair** porque a tabela da estrada olha só o nível do
  herói, e com uma janela que sobe com ele: `nivelRef <= nivel+2 && nivelRef >=
  nivel−4`. A partir do nível 14 a janela só tem lendários. A tabela não lê o
  bioma, nem a região, nem o perigo que o próprio mapa pinta na estrada. E a
  investida não tem o freio que a emboscada narrada tem: `importante: true` (o
  bestiário diz que *«um dragão nunca é um bando… a mesa negocia com ele antes
  de o enfrentar»*) não pesa em lado nenhum.
- **Duas réguas para a mesma pergunta**, que é a doença que esta casa mais
  repete. O mapa diz *«a estrada: perigo baixo»* (`perigoDaEstradaComMotivo`,
  que lê o perigo dos lugares nas pontas) e a mesma estrada, rolada, dá um
  dragão ancião (que lê o nível do herói).

### 1.3 Os números (a tabela de hoje, 4000 trechos por nível, `medir-estrada.mjs`)

| herói | trechos com perigo | investe | do perigo, lendário | quem pode sair |
|---|---|---|---|---|
| nv 1 | 32,9% | 32% | 0% | Slime, Rato, Lobo, Goblin, Bandido, Esqueleto, Zumbi, Lobo Atroz, Cultista + arquétipos |
| nv 5 | 30,9% | 35% | 0% | até Golem de Pedra |
| nv 8 | 32,3% | 33% | **14,6%** | Ogro … Gigante, **Dragão Jovem** |
| nv 11 | 32,6% | 34% | **40,3%** | Golem, Quimera, Gigante, Dragão Jovem, Lich |
| nv 14 | 32,4% | 33% | **100%** | Dragão Jovem, Lich, **Dragão Ancião** |
| nv 18–20 | ~31% | 33% | **100%** | **só o Dragão Ancião** |

Para um herói de nível 14, um Dragão Ancião sozinho pesa **2,76×** a
capacidade dele (`avaliarEncontro`). Fica abaixo do `TETO_DO_DESPROPORCIONAL`
(3×), e por isso nenhum freio da casa o pararia, nem o da emboscada narrada.
Do nível 14 para cima, **um trecho em cada nove** abre uma luta lendária sem
aviso (32% × 33%). E a 15%, no nível 1, o perigo da estrada já é «mortal».

### 1.4 O que ela devia ter visto (o roteiro do momento)

1. **A partida** — o Mestre narra a saída (já existe).
2. **O sinal, de longe** — horas depois, o relógio andou. *Uma sombra passa
   sobre a estrada; do outro lado do vale, o gado dispara.* O Mestre **pede**
   Percepção, e o dado pousa na bandeja (a ordem de 04/11: o dado aparece).
3. **O que se sabe** — o teste passou: *«Um dragão ancião. Ainda não te viu.»*
   O retrato dele cresce no cartão. A ameaça vem como faixa e não como número:
   **☠ fuja disto**.
4. **A escolha, com o preço à vista** (o veredito antes do clique):
   esconder-se no bosque (Furtividade, CD 18 · 45% · se falhar ele vê-te e
   desce) · voltar a Baixo da Fonte (perde 4 h, seguro) · seguir pela ravina
   (Sobrevivência CD 14 · +2 h) · esperar que passe (1 h) · enfrentá-lo
   (☠ — *isto não é um encontro, é uma lenda*).
5. **Só então a luta**, se ela a escolheu ou se o dado falhou. A tela escurece,
   o rugido soa, o Mestre narra a descida em duas frases **antes** de a mesa
   abrir, e a mesa abre com o dragão já posto. Se ela falhou o teste, a
   abertura é de emboscada. Se o escolheu, é de encontro, com a fuga aberta.

---

## 2 · A batalha de hoje, jogada

Joguei duas lutas abertas por `/combate` (sem IA a luta é inteira do
sistema): um Lobo nv 3, e três Bandidos nv 3. O herói era um Guerreiro humano
nv 1 (20 PV), com a Quorin ao lado. Monitor de 1024×768 e telefone de
375×812.

### 2.1 As medidas

**Cliques por turno** (contados):
- inimigo ao alcance: `Atacar` (1). Com um alvo só ao alcance, o ataque sai
  sem escolha de alvo.
- inimigo longe: tocar a casa (1, o `Mover` não é preciso) + `Atacar` (1) = 2.
  `Atacar` fica apagado até chegar: *«Lobo a 4,5 m — faltam 3 m»*.
- cada abate: + `Poupar/Matar` (1). Na luta de três bandidos o pedido veio
  **duas vezes, uma delas pelo abate da Quorin** (o golpe do companheiro
  também interrompe o jogador).
- a reação (*«contra-ataque · 0 PM — na mesma batida / deixar passar»*):
  +1, e a janela **fecha sozinha** (no meu teste expirou antes de eu responder).
- o fim: `Respirar fundo →` (1).
- **Média, para matar um inimigo: 2–3 cliques. Uma luta de 3 inimigos: ~8.**
  É pouco, e isso é bom. O problema é o que cada clique **diz**.

**O que o jogador vê antes de agir:**

| | hoje |
|---|---|
| distância e alcance | **sim** — «a 1,5 m — ao alcance», «faltam 3 m» |
| o dado do dano | **sim, seco** — «1 ataque por turno de 1d8» |
| o golpe livre ao sair | **sim** — «sair custa um golpe livre» (bom, à BG3) |
| a cobertura | só no rótulo da casa («sob a arcada, cobertura +2»), e só no leitor de ecrã; no tabuleiro é uma faixa tingida |
| **a chance de acertar** | **não** — era d20+6 contra 11–12, ~80%, e não se diz |
| **o dano provável / se abate** | **não** — o lobo de 4 PV caía com qualquer acerto, e nada o dizia |
| **o que o inimigo vai fazer** | **não** |
| a ordem da iniciativa | os chips «Participantes» estão na ordem, mas não se lê que é uma fila |

**O feedback do golpe:**
- o número do dado (*«d20 9+6=15 vs 12 · acerta, 12 de dano»*) chega
  **depois** do `Poupar/Matar`, numa linha pequena no pé da coluna direita;
- no tabuleiro sobe um número flutuante («-8») sobre quem apanhou
  (`flutuantes`, grade-de-batalha.jsx:351);
- **sem tremor, sem pausa no impacto e sem som de golpe**. O `som-da-mesa.js`
  de hoje toca três momentos (a carta, o dado, o despertar) e nenhum é da luta;
- o cartão do inimigo ainda dizia `PV 4/4` com o texto *«cai sob o seu
  golpe»* por cima, à espera da escolha.

**A leitura do turno dos inimigos:** os inimigos e a companheira agem **numa
rajada** entre um clique meu e o estado seguinte. O Bandido 3 agiu e não
deixou rasto nenhum na tela (o herói continuou 20/20, e não há linha que diga
que ele errou ou que esperou). O único rasto é o número flutuante. Não há uma
lista do que aconteceu na rodada.

**O tempo de um turno:** não o pude medir em segundos, porque o painel oculto
congela o `requestAnimationFrame` (a armadilha conhecida da casa). Em passos:
um turno meu com mover e atacar são 2 toques, mais a rajada dos outros. O
custo de tempo real está no fecho e na reação, que param a mesa.

**O tamanho da luta no início:** em Node, para um herói de nível 1, o Goblin
e o Lobo têm 4 PV, o Bandido 8, o Ogro 11. O Guerreiro dá 6–13 com ~80% de
acerto, e **todo o bicho da estrada de nível 1 cai num golpe**. Uma luta de
nível 1 dura uma rodada, e numa rodada não há nada a decidir. (No nível 3 o
PV dobra: 17 no Bandido. A `regua-combate.mjs` só mede o nível 5.)

**O telefone (375×812)** (`cb-antes-3-telefone.png`): a janela do campo mostra
**7×5 casas de 14×14 — 18% do tabuleiro**. O terceiro bandido não aparece. As
letras e os números do endereço somem. Duas barras de rolagem castanhas ficam
à vista, sob os chips e sob a tira do PV, e o nome do alvo é cortado.

**O monitor (1024×768)** (`cb-antes-1-abertura.png`): o tabuleiro fica
centrado com duas faixas mortas de ~20% de cada lado do campo, e mesmo assim
as filas 12–14 estão fora da vista e é preciso rolar.

### 2.2 O que dói, por prioridade

1. **O encontro não existe como momento.** A luta cai do céu, sem sinal, sem
   escolha e sem palavra (§1). É o defeito que ela nomeou e o mais caro.
2. **Ataca-se às cegas.** Não se vê a chance, nem o dano, nem se o golpe
   abate. Atacar é irreversível, e isto fere a lei *o veredito antes do
   clique*. É a coisa que BG3 e XCOM nunca escondem.
3. **O inimigo não anuncia nada.** Sem intenção, mover-se não serve para nada
   (não há sopro a evitar nem alvo a proteger), e o turno deles é uma rajada
   que não se lê.
4. **O golpe não se sente.** Um número que sobe, e mais nada: sem pausa, sem
   tremor, sem som.
5. **A luta de nível 1 acaba num golpe.** Nenhuma tática sobrevive a um TTK
   de 1.
6. **O fecho interrompe demais.** `Poupar/Matar` a cada queda, até na da
   companheira, e a reação com relógio a parar a mesa.
7. **O telefone vê 18% da luta.** E o monitor desperdiça as margens e ainda
   assim obriga a rolar.
8. **A fila não parece fila.** Os chips têm a ordem, mas não têm forma de
   linha do tempo. A economia de ação resume-se a um chip («ação»), e o
   bónus, a reação e o movimento não se vêem juntos.
9. **O terreno é pobre.** Há cobertura, terreno difícil, estorvos, linha de
   visão, empurrão e área (grid.js já tem tudo isto). Não há altura, nem
   superfícies, nem objeto que se use.

**O que está bom e fica:** o tabuleiro à vista com o endereço; os retratos
(o dragão, nas palavras dela, *«ficou excelente, o tamanho também»* — a
escala dos tamanhos, `TAMANHOS`/`ladoDe`, está certa); tocar a casa para
andar; o aviso do golpe livre; a reação como janela; a recusa com o motivo
(«faltam 3 m»).

---

## 3 · A visão: o combate que se lembra

A régua de cada peça: **o jogador decide melhor com menos cliques, e sente
mais**. Todo número sai de tabela, tudo é determinístico pela semente, e a
`regua-combate.mjs` mede de novo a cada mudança de equilíbrio.

### 3.1 A previsão antes do clique — *BG3, XCOM 2*
- **O que o jogador vive:** passa o rato (ou dá o primeiro toque) num inimigo
  e lê, sobre ele, **«78% · 6–13 · abate»**. O alvo pisca a vermelho se o
  golpe o pode derrubar. Com cobertura, o número desce e o escudo aparece ao
  lado (XCOM mostra a percentagem e o escudo da cobertura; BG3 mostra a
  percentagem sobre o alvo).
- **Motor:** `previsaoDoAtaque(atacante, alvo, ctx)` em `combate.js`. É puro,
  com os mesmos termos de `resolverAtaque` (bónus, defesa, cobertura,
  vantagem, crítico), e devolve chance, dano mínimo e máximo, a chance de
  abater e a de crítico. Sem sorte. A catraca: a previsão bate com a
  frequência real em 10 000 rolagens semeadas.
- **Tela:** a peça `Mira` (`desenho`), uma etiqueta sobre a ficha do alvo. No
  telefone, o primeiro toque prevê e o segundo confirma. **Cliques: os mesmos
  de hoje.**

### 3.2 Andar e atacar num toque, com o caminho e o custo à vista — *BG3*
- **Vive:** passa o rato numa casa e a linha do caminho desenha-se com os
  metros («4,5 m · sobram 4,5»). Os trechos que provocam golpe livre ficam a
  vermelho, com o ícone. Tocar num inimigo longe **anda até ele e ataca**,
  com a previsão de tudo antes.
- **Motor:** `caminhar`/`custosDe` já existem. Falta só `caminhoComProvocacoes`
  (que casas do caminho saem do alcance de quem). É pequeno.
- **Tela:** a linha do caminho no `GridDeBatalha`. **Poupa 1 clique por turno
  com inimigo longe.**

### 3.3 A intenção do inimigo à vista — *Into the Breach, Slay the Spire*
- **Vive:** no começo da rodada, sobre cada inimigo, um ícone com um número:
  ⚔ 7–12 → Bran; 🛡 protege o xamã; ✚ cura; 🏃 vai fugir. O sopro do dragão
  pinta **as casas** que vai queimar, e quem sair delas escapa. Mover-se passa
  a ser decisão. O turno deles deixa de ser surpresa e passa a ser um quebra-
  cabeças que se resolve (é a lição inteira de Into the Breach: a ameaça
  anunciada e cumprida).
- **Motor (o mais caro do lote 1):** `intencoesDaRodada(combate, sorte)` decide
  no começo da rodada, com a mesma mente da Fase N (`turnoDosInimigos` já
  escolhe alvo por inteligência), e **compromete** a escolha. A execução lê a
  intenção. Se ficou impossível (o alvo saiu do alcance), cai numa regra de
  recurso tabelada (`RECURSO_DA_INTENCAO`). Os inimigos de mente `astuto`
  podem mostrar só o tipo e esconder o alvo, para a inteligência continuar a
  ser vantagem deles. Campo novo `combate.intencoes`, aditivo. **A régua mede
  de novo:** a intenção dá vantagem ao jogador, e o número de inimigos ou de
  PV pode ter de subir.
- **Tela:** a peça `Intencao` (`desenho`) sobre a ficha, e as casas da área
  tingidas e tracejadas.

### 3.4 A fila de iniciativa como linha do tempo — *BG3, Divinity: Original Sin 2*
- **Vive:** no topo, os retratos na ordem, o da vez maior, com uma marca entre
  rodadas. Passar o rato num retrato acende a ficha no tabuleiro, e vice-
  versa. Quem age a seguir lê-se sem pensar.
- **Motor:** zero (`combate.ordem` já existe).
- **Tela:** os chips «Participantes» viram a `FilaDaVez`. É do `aprendiz`.

### 3.5 A economia de ação à vista — *BG3 (círculo, triângulo, barra)*
- **Vive:** junto aos verbos, ● ação, ◆ bónus, ◇ reação e a barra do
  movimento. Cada verbo mostra o que gasta, e o que já se gastou apaga-se.
  O «posso ainda fazer alguma coisa?» responde-se num olhar.
- **Motor:** zero (`economiaNova`/`combate.economia` já existem).
- **Tela:** a peça `Economia` (`desenho`), e o custo em cada verbo.

### 3.6 O golpe sentido — *Hades, Dead Cells (pausa no impacto); a escola do «juice»*
- **Vive:** o acerto congela a mesa 70 ms, a ficha atingida treme 120 ms, o
  número salta grande (dourado no crítico, cinza no «errou»), o corte ou a
  pancada soa, e a queda tem o seu som grave. O crítico pausa mais e treme
  mais. Errar tem som também (o sopro da lâmina no ar).
- **Motor:** nenhum. O som vai para `som-da-mesa.js`, como mais momentos na
  tabela `SOM_DA_MESA` (golpe, crítico, erro, queda, magia por elemento),
  sintetizado e sem ficheiros.
- **Tela:** a tabela `GOLPE_SENTIDO` em `estilo.js` (pausa, tremor, escala do
  número, durações). Nada bloqueia a entrada: a animação toda dura menos de
  400 ms e o próximo toque é aceite durante ela. Com `prefers-reduced-motion`
  ficam o número e o som, e saem o tremor e a pausa. O som respeita o
  interruptor que já existe.

### 3.7 O turno deles, contado — *BG3 (a câmara que segue), XCOM (a ação em passos)*
- **Vive:** cada inimigo age por sua vez, 500 ms cada, com a câmara a ir até
  ele e uma linha curta no rodapé: *«Bandido 3 → Bran: erra»*. Há `acelerar`
  (2×) e `pular` (instantâneo). No fim fica a lista da rodada, aberta com um
  toque.
- **Motor:** nenhum. `turnoDosInimigos` já devolve os passos. É só tocá-los em
  sequência em vez de os aplicar de uma vez.
- **Tela:** o `oficial` no App (a rajada aplica-se ao estado, e a tela
  reproduz-a). **Nunca custa o turno:** o estado já está aplicado e a
  animação é só leitura. Pular é sempre possível.

### 3.8 A altura, a cobertura e as superfícies — *Divinity: Original Sin 2, BG3*
- **Vive:** casas altas (o muro, o telhado, a rocha), mais claras e com
  sombra. De cima acerta-se melhor e vê-se mais longe (BG3: +2 no ataque do
  alto, −2 de baixo). As superfícies ficam no chão: óleo, água, gelo, fogo,
  veneno. E reagem (DOS2): fogo no óleo explode e arde, raio na água
  eletrifica quem está nela, gelo na água vira chão que derruba, fogo no gelo
  vira água. Um mago com fogo e um barril de óleo valem um plano.
- **Motor (o mais caro da fase):** `altura` por casa nas `PLANTAS` (grid.js) e
  `BONUS_DA_ALTURA` em tabela. Um módulo puro novo, `superficies.js`, com
  `SUPERFICIES` (efeito por casa, duração em rodadas, dano por turno, teste
  de Destreza) e `REACOES_ELEMENTARES` (par → resultado). Os ataques com
  `perfil.ataque` (fogo, gelo, raio já existem no bestiário) deixam
  superfície. Campos novos `grade.alturas` e `combate.superficies`, aditivos.
  A régua mede de novo, com os conjuradores como suspeitos.
- **Tela:** o `desenho` fabrica as texturas das superfícies e o degrau da
  altura. O `jogo` decide quando cada uma se anuncia (a primeira explosão
  merece uma pausa; a décima não).

### 3.9 Empurrar e usar o cenário — *Into the Breach, DOS2, BG3*
- **Vive:** empurrar (já existe: `EMPURRAO_NO_TABULEIRO`, `deslocarForcado`)
  passa a valer muito mais. Empurrar do alto fere com a queda; empurrar para o
  fogo ou para a água eletrificada aplica a superfície. Os objetos do cenário
  (o barril, o candeeiro, o carro de feno) explodem, ardem ou tapam a vista.
  A pré-visualização do empurrão mostra a casa onde ele pára e o que lhe
  acontece lá.
- **Motor:** `DANO_DA_QUEDA` por degrau de altura, e objetos com etiqueta nos
  `estorvo` das plantas (`OBJETOS_DO_CENARIO`).
- **Tela:** a seta do empurrão com a casa final, e o objeto como peça.

### 3.10 O fim da luta — *Critical Role (o «como queres fazer isto?»), MM3*
- **Vive:** a pergunta do golpe final aparece **uma vez por luta**: no último
  inimigo, ou num `importante`. As quedas do meio resolvem-se pela escolha
  lembrada (poupar ou matar), e a queda pela mão do companheiro nunca
  interrompe o jogador. O último golpe ganha a pausa maior, o som da queda e
  a tela a assentar (`FIM_DA_LUTA`). Depois vem a cerimónia da recompensa,
  que já existe (TE10).
- **Motor:** a regra de quando perguntar, em tabela (`QUANDO_O_FECHO_PERGUNTA`).
- **Tela:** o fecho existe. Muda só a frequência. **De N interrupções por luta
  para ≤ 1.** É também o chão em que assenta o item que já espera a pessoa no
  topo da pauta, *«Como você quer fazer isto? — o momento que para a mesa»*
  (o `jogo`, 01/10): com uma pergunta só por luta, ela pode ocupar o ecrã
  inteiro sem cansar.

### 3.11 A régua do começo — *o TTK de 1 golpe*
- **Vive:** no nível 1, um comum aguenta 2 golpes e um fraco 1. Os bandos de
  fracos fazem número. A luta dura 2 a 3 rodadas, o bastante para uma decisão
  existir.
- **Motor (médio, `backend`):** rever `pvEsperadoInimigo` nos níveis 1–3, ou o
  dano do herói no nível 1, em tabela. A `regua-combate.mjs` ganha o cenário
  `nivel1` (hoje só mede o nível 5), e é ela que decide qual dos dois mexe.

### 3.12 O telefone a 375 e o PC a 1905
- **Telefone:** a câmara segue a ação e enquadra **quem importa** (o herói, o
  alvo, quem tem intenção sobre ele), com o mínimo de 9×9 casas por omissão.
  Pinça para ampliar. Os verbos no arco do polegar (já é a lei de E1). Saem
  as duas barras de rolagem. A previsão é uma folha que sobe do fundo, e não
  uma etiqueta que o dedo tapa.
- **PC:** o campo usa a largura toda (sem as faixas mortas), e o tabuleiro de
  14×14 cabe inteiro sem rolar a 1905×1000. A fila em cima, a coluna da
  direita com a ficha e o registo da rodada.

### 3.13 O encontro na viagem — o desenho (é a §1.4 com regra)
- **O aviso de longe** — `sinalDoEncontro(enc, ctx)`: cada criatura do
  bestiário ganha, numa tabela nova (`SINAIS_DO_BESTIARIO`), o sinal pelo qual
  se anuncia (rasto, som, cheiro, vulto, silêncio dos pássaros) e a
  distância. O Mestre **pede** Percepção (estende `O_MESTRE_PEDE`, que hoje
  cala na estrada). O resultado decide **o que se sabe** (só «algo grande»,
  ou «um dragão ancião, ainda não te viu») e **quem tem a iniciativa**.
- **A escolha antes da luta** — `escolhasDoEncontro(enc, pers, ctx)` devolve a
  lista com o veredito de cada uma (perícia, CD, chance, preço de falhar):
  evitar ou contornar (Sobrevivência; custa horas), esconder-se (Furtividade
  contra a Percepção passiva dela), negociar (Presença; só quem fala, numa
  tabela `QUEM_FALA`), emboscar (Furtividade; se passar, a luta abre com a
  abertura a favor e uma rodada de surpresa), fugir (volta para trás no
  trecho) e lutar. `resolverEscolha` é determinístico pela semente.
- **A régua da dificuldade** — a ameaça da estrada passa a ler **a região e o
  bioma** (a mesma régua que pinta o mapa, `perigoDaEstradaComMotivo`) ao lado
  do nível. O lendário e o `importante` **nunca investem**: anunciam-se ao
  longe, sempre com a fuga possível. Mais de 2× a capacidade dá uma ameaça «a
  evitar», com o sinal sempre visto (Percepção automática). A janela de nível
  deixa de produzir 100% de lendários no topo (tabela `AMEACA_DA_ESTRADA`).
- **A narração** — o encontro de perigo **força uma chamada própria do Mestre
  antes da mesa abrir** (o sinal e a escolha vão pela pauta dinâmica, com
  SECOES e prio, e o veto *«não abra luta; não decida»* vai em `naoPode`).
  **Nenhum bloco estático novo:** o teto de prompt não cresce.

---

## 4 · A ordem, por retorno

**Lote 1 — nota-se na primeira luta.** CB1–CB8. O encontro deixa de cair do
céu, cada golpe diz a chance antes, sente-se ao bater, o inimigo anuncia, e o
fecho deixa de interromper. É o que ela vai sentir na primeira sessão.

**Lote 2 — a luta ganha profundidade.** CB9–CB13. A fila, a economia, o
caminho, o turno contado e a régua do nível 1.

**Lote 3 — o tabuleiro vira cenário.** CB14–CB17. A altura, as superfícies, o
cenário que se usa e os ecrãs (telefone e PC).

O lote 3 é o mais caro e o que mais muda o jogo. Fica para depois do lote 1
estar jogado, porque a intenção (CB6) e a previsão (CB5) são a base em que a
altura e as superfícies se lêem: uma superfície que não se prevê é uma
armadilha, não uma tática.

---

## 5 · As etapas da Fase CB

Cada etapa no padrão da casa: **módulo puro → fiação defensiva → suíte**.
Quem faz: **B** `backend` (motor), **O** `oficial` (App.jsx, com o bastão),
**A** `aprendiz` (fora do App), **D** `desenho` (a peça, no Figma antes do
código), **J** `jogo` (o momento, e a revisão jogando).

| etapa | o quê | quem | a prova |
|---|---|---|---|
| **CB1** · a régua da estrada | `AMEACA_DA_ESTRADA`: a ameaça lê região, bioma e nível; o lendário e o `importante` nunca investem; acima de 2× é «a evitar». Em `encontros.js`. | B | `teste-ameaca-da-estrada.mjs`: a tabela de §1.3 vira catraca (nv 14–20 com lendário ≤ teto; **zero investidas acima de 2×** em 4000 trechos por nível; o mapa e o encontro não discordam na mesma aresta). |
| **CB2** · o encontro em três tempos | módulo puro `o-encontro.js`: `sinalDoEncontro`, `escolhasDoEncontro`, `resolverEscolha`; tabelas `SINAIS_DO_BESTIARIO`, `QUEM_FALA`, `ESCOLHAS_DO_ENCONTRO`. | B | `teste-o-encontro.mjs`: mesma semente = mesmo desfecho; toda a escolha tem o veredito antes; nenhuma abre a luta sem ter sido escolhida ou falhada. |
| **CB3** · a fiação do encontro | `viajar` pousa o encontro pendente (campo novo de save, aditivo) em vez de abrir a mesa; o perigo força uma chamada do Mestre antes; a luta abre só depois da escolha, com a situação que o desfecho deu. **Corrige a causa de §1.2.** | O | `teste-encontro-fiacao.mjs` (lê o App por âncora: `abrirCombate` não é chamado no rolar da estrada sem escolha); e jogado: partir → sinal → escolha → narração → mesa. |
| **CB4** · o cartão do encontro e a transição | a peça `CartaoDoEncontro` (o sinal, o retrato, a faixa da ameaça, as escolhas com o veredito) e a entrada na mesa (escurece, retrato cresce, rugido; 1,2 s, pulável com toque ou Esc; com movimento reduzido é corte seco). | D → A | varredor de forma; `prefers-reduced-motion` provado; o momento no Figma antes. |
| **CB5** · a previsão do golpe | `previsaoDoAtaque` em `combate.js`; a peça `Mira` sobre o alvo. | B → D → A/O | `teste-previsao-do-ataque.mjs`: a previsão bate com 10 000 rolagens semeadas (±1 pp); todo o verbo de ataque tem previsão. |
| **CB6** · a intenção do inimigo | `intencoesDaRodada` + `RECURSO_DA_INTENCAO`; a execução cumpre a intenção; a peça `Intencao` e as casas da área. | B → D → O | `teste-intencoes.mjs`: o que se anuncia é o que acontece (ou o recurso tabelado); **a régua de combate mede de novo** e o equilíbrio fica dentro da faixa. |
| **CB7** · o golpe sentido | `GOLPE_SENTIDO` (estilo.js) e os momentos de luta em `SOM_DA_MESA`; a pausa, o tremor, o número e o som. | D → A (+B no som) | `teste-som-da-mesa.mjs` cresce; varredor: nenhuma animação de golpe passa de 400 ms nem prende a entrada; movimento reduzido tira o tremor e a pausa. |
| **CB8** · o fecho uma vez | `QUANDO_O_FECHO_PERGUNTA`: no último inimigo ou num `importante`; o companheiro nunca interrompe. | B → O | `teste-fecho.mjs`: numa luta de N inimigos, ≤ 1 pergunta. |
| **CB9** · a fila da vez | os chips viram `FilaDaVez`, que se liga à ficha no tabuleiro pelo rato. | D → A | varredor de forma. |
| **CB10** · a economia à vista | a peça `Economia`, e o custo em cada verbo. | D → A | varredor: todo verbo diz o que gasta. |
| **CB11** · o caminho e andar-e-atacar | `caminhoComProvocacoes`; a linha do caminho; tocar no inimigo longe anda e ataca. | B → A/O | suíte do caminho; **cliques contados: −1 por turno com inimigo longe.** |
| **CB12** · o turno deles contado | a rajada passa a reproduzir-se em passos de 500 ms, com acelerar, pular e o registo da rodada. | O | jogado; varredor: há sempre saída (pular) e o estado nunca espera pela animação. |
| **CB13** · a régua do nível 1 | o cenário `nivel1` na régua; o TTK de um comum passa a 2 golpes, por tabela. | B | `regua-combate.mjs` com o cenário novo; catraca do TTK. |
| **CB14** · a altura | `grade.alturas`, `BONUS_DA_ALTURA`, a linha de visão do alto; o degrau desenhado. | B → D → A | `teste-altura.mjs`; régua. |
| **CB15** · as superfícies e as reações | `superficies.js`: `SUPERFICIES`, `REACOES_ELEMENTARES`; os ataques com elemento deixam chão. | B → D → A/O | `teste-superficies.mjs` (toda reação da tabela provada; determinismo); régua com os conjuradores. |
| **CB16** · o cenário que se usa | `DANO_DA_QUEDA`, `OBJETOS_DO_CENARIO`; o empurrão com a casa final prevista. | B → D → A | suíte; régua. |
| **CB17** · o telefone e o PC | a câmara que enquadra quem importa (≥ 9×9); a pinça; sem barras soltas; o campo inteiro a 1905. | D → A/O | medido: casas visíveis a 375 (hoje 35 de 196) e a 1905 (o tabuleiro inteiro, sem rolar). |

**A ordem de execução:** CB1 → CB2 → CB3 → CB4 (o encontro, que é o defeito
dela) · CB5 → CB7 → CB8 (a luta diz e sente) · CB6 (a intenção, a mais cara
do lote 1, com a régua) · depois o lote 2 e o lote 3.

**O Figma antes do código:** CB4, CB5, CB6, CB7, CB9, CB10, CB14, CB15 e CB17
nascem no Figma. O `desenho` fabrica as peças (`CartaoDoEncontro`, `Mira`,
`Intencao`, `FilaDaVez`, `Economia`, as texturas da superfície). O `jogo`
compõe o momento, com o tempo e o *easing* declarados. Nada disto existe
ainda no arquivo, e é o primeiro trabalho do `desenho` nesta fase.

**O que se prova em toda a etapa de tela:** a animação respeita
`prefers-reduced-motion` e tem saída (pular, acelerar); o controle existe numa
forma só (`mente/formas.md`); **o teto de prompt não cresce** (o encontro e a
intenção vão pela pauta dinâmica e não por bloco estático); e nada custa o
turno (`calou(...)` em toda a fiação nova).

---

## 6 · A proposta ambiciosa — *quem vê primeiro, monta a mesa*

**O que mudaria:** quando o herói vê o inimigo primeiro (passou a Percepção,
ou escolheu emboscar), a luta não abre com as fichas já postas. Abre numa
**fase de colocação**: o tabuleiro aparece com a zona onde o grupo pode
ficar (o bosque, o alto da ravina, atrás do carro), o inimigo ainda sem saber
que vocês estão lá, e o jogador põe cada um no seu sítio antes da primeira
rodada. Quem foi visto primeiro não monta nada, e a abertura é a de emboscada
contra si. É o que XCOM faz com a ocultação e o BG3 com o começo furtivo: a
melhor luta ganha-se antes de começar.

**Porque é a que faria o jogo ser lembrado:** junta as três coisas que hoje
estão soltas, o sinal (CB2), a altura (CB14) e a surpresa, numa decisão só,
tomada com a cabeça fria. Liga a viagem à luta como uma história e não como
um corte.

**O custo:** motor médio (zonas de colocação na planta, a ocultação como
estado até ao primeiro golpe) e tela média (arrastar as fichas na zona). Vem
depois do CB14.

---

## 7 · Para a pessoa decidir (no máximo duas)

1. **O dragão ancião na estrada.** A proposta é que um lendário **nunca
   invista** na estrada: anuncia-se, e luta-se com ele só por escolha ou por
   um dado falhado. Mas há duas leituras do que o jogo é. **(a)** O lendário
   vive só no seu covil, como chefe, e a estrada nunca o traz. **(b)** A
   estrada pode trazê-lo ao herói alto, sempre com aviso e fuga, como o
   momento raro que se conta depois. A minha escolha é **(b)**, com a régua de
   CB1. A decisão é tua porque decide o que o mundo é.
2. **As superfícies elementares (CB15) entram no beta?** São o que mais
   aproxima o Taverna de Divinity, e também o que mais mexe no equilíbrio (o
   conjurador passa a dono do campo). A minha proposta é fechar o lote 1
   primeiro, jogar, e decidir as superfícies com a luta nova na mão.
