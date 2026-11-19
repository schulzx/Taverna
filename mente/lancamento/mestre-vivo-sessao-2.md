# O Mestre vivo, jogado outra vez: sessão 2 (commit 05b2a02)

Jogada em 19/11/2026 contra a cópia limpa do commit `05b2a02` (`git archive`), num Chrome headless dirigido por CDP, com narração real (o `/api` do dev-server vai à produção). Dois perfis de navegador. Não alterei nenhum arquivo do jogo; os únicos arquivos escritos no repositório são este relatório e as capturas `MV2-*`.

- **Parte 1:** `?mestre=1`, campanha nova, molde de mundo trocado na criação: **Steampunk · O Arquipélago · Ascensão do Reino** (da outra vez foi o padrão). Herói Ulysses Copperwright (bruxo), companheiro Jasper (ladino), cidade Ponta das Gaivotas. A janela real do headless era 1262 x 704; as capturas da Parte 1 saíram nesse tamanho, as da Parte 2 foram forçadas a 1280 x 800 e 375 x 812.
- **Parte 2:** `?mestre=0`, perfil novo, campanha nova (Dagny, ladina goliath, e Merek, caçador draconato, em Forte Seco). Foco na tela.

**Custo:** por contagem do meu registro, cerca de **49 chamadas de narração** no total (Parte 1 ≈ 44; Parte 2 ≈ 5), dentro do limite de 60. Contei «turno» como uma jogada escrita (ou a escolha numa tela de encontro) que o jogo resolveu com narração; clicar «Rolar», «Reescrever» ou confirmar uma viagem não conta como turno. As viagens (5 na Parte 1) ficam fora dos totais e foram vistas à parte.

**Limites, ditos de antemão:** é **uma** partida, com um jogador só (eu), e o mundo é outro (o steampunk), então os números dizem o que aconteceu nesta mesa, não uma taxa. A comparação com a 1ª sessão é de ordem de grandeza.

---

## 1. Parte 1: os números, lado a lado com a 1ª sessão

Contagem desta sessão: **28 turnos fora de luta** (27 frases escritas + 1 escolha no encontro da estrada). Não houve luta (o encontro com 3 goblins foi resolvido por «Negociar»).

| medida | 1ª sessão (B, 33 turnos) | esta sessão (28 turnos) |
|---|---|---|
| turnos fora de luta | 33 | 28 |
| turnos com dado, n e % | 9 (27%) | 8 (29%) |
| dados que julguei **certos** | 6 | 6 |
| dados **indevidos** | 3 | 1 (Persuasão 18 para pedir um favor ao companheiro, T13) |
| dado espontâneo opcional (tanto faz) | (3 espontâneos, todos ruins) | 1 (Percepção na estrada, com «Agora não») |
| ações de risco **sem dado** que mereciam | 13 | **9** (barganha T3, mentira T5 e T16, ameaça T8, T14 e T30, furto T9, atravessar os barcos T22, esgueirar-se sozinho no mato T29) |
| maior sequência de turnos sem dado | 9 | **6** (T14 a T20) |
| dados espontâneos (sem eu pedir ação de risco) | 2 (+1 «mundo responde») | **1** de verdade (estrada, opcional) + 1 rolagem de «Navegação» automática, sem escolha, só no registro |
| conversas com dado **e preço dito** | 3 de 4 | **3 de 3** («Se falhar, a resposta é não…» em T13 e T25; «se falhar: a conversa acabou em aço» no encontro) |
| perguntas respondidas sem dado | 7 | 5 (T1, T2, T6, T24b, T28), todas certas |
| ações sem dado cujo efeito entrou **no estado** | não medido | **0 de 5** verificadas (defeito 1 da seção 5) |
| PT-PT («tu», «teu», «sabes», «leva», «tens») | 3 turnos (9%) | **9 turnos (32%)**: T4, T6, T7, T8, T16, T17, T18, T19, T25 |

**Os 8 turnos com dado:**

| # | frase | dado | resultado | o texto responde ao que foi testado? |
|---|---|---|---|---|
| T4 | «eu vou escalar a muralha pra olhar a cidade lá de cima» | Atletismo 15, «se falhar, você despenca lá de cima» | 10, falhou: queda de 7 m, 4 de dano (14 para 10 PV), «Caído» | **Sim**, e o preço foi cobrado de verdade (os PV caíram) |
| T10 | «me encosto numa coluna e escuto o que o Xavier e o Klaus cochicham» | Percepção 13, «se falhar, só ouve pedaços» | 12, falhou por 1 | **Em parte:** ouviu só «maré», certo; mas o texto abre com «do alto da capela, pela fresta da torre, você vê o telhado de Ponta das Gaivotas», uma vista que eu não pedi, de um lugar onde eu não estava, com a linha de sistema «Faltaram 1 — e fica meio caminho» |
| T13 | «peço pro Jasper dar uma volta entre os soldados e descobrir quem anda pensando em desertar» | Persuasão 18 (a um companheiro!) | 23, passou | Sim (Jasper volta com notícia), mas o dado era dispensável |
| T21 | «me esgueiro por trás do Ambrose sem ele perceber» | Furtividade 15 | 10, falhou | **Sim** (a lanterna raspa numa amarra, ele vira o rosto) |
| T25 | «peço um desconto na taxa de troca, só tenho moeda miúda» | Enganação 14 (+10) | 28, passou com folga | **Sim** (taxa de amigo, «desconto miúdo»), mas sem número e sem efeito nas moedas |
| T26 | «tento pegar de leve o bilhete… e depois furto o mapa aberto da Ursula» (duas ações) | Prestidigitação 15 | 11, falhou | **Sim** para a 1ª ação; a 2ª (o mapa) foi ignorada: um dado para duas ações |
| estrada | (espontâneo) «Ler os sinais da estrada» | Percepção 13, opcional, botão «Agora não» | 20, passou | **Não:** o resultado foi um viajante genérico dizendo uma frase que Prudence já tinha dito; as pegadas e o osso do aviso não voltaram |
| encontro | «Negociar» com 3 goblins (Persuasão 11, 80%, 12 moedas) | d20+6 | 22, passou | **Não:** pagou 12 das 15 moedas (sobraram 3, o estado bateu) mas a narração falou de Klaus e uma fogueira fria, sem uma palavra sobre os goblins; só soube o desfecho porque perguntei (T28) |

**Dado espontâneo, e como foi narrado.** Nas 4 chegadas a lugar novo (Altar Afogado, Bateria Alta, Trapiche do Sal, Feira do Saque) **nenhum dado foi lançado**: o dado de Percepção na chegada, que estragou a 1ª sessão, sumiu. Na estrada para Ponta Vermelha o jogo ofereceu **um** dado, de um jeito novo: um cartão laranja «Rolar d20 + 1 · Ler os sinais da estrada», com o número (13) e o botão **«Agora não»**. É a melhor forma de espontâneo que vi: optativo, com o motivo dito. A narração do resultado é que falhou (acima). Houve também, no registro, uma linha «Navegação em marítima: d20+6 = 24 vs 7 → rota mantida», uma rolagem que ninguém pediu nem viu antes.

---

## 2. Os defeitos da 1ª sessão, um a um

| # | defeito (1ª sessão) | agora | o turno que prova |
|---|---|---|---|
| 1 | Narrador atribui ao herói ações que o jogador não escreveu | **continua, menos grave** (não ofendeu ninguém, mas existe) | T8 («olha para a sua mão estendida», eu só tinha falado baixo); T10 (herói numa torre vendo a cidade); T21 (a lanterna «se prende ao seu cinto»); T31 («suas mãos agora seguram a faca e a corda de três nós»). O caso feio da 1ª sessão (revirar o baú de Astrid) não se repetiu |
| 2 | Resultado do dado não corresponde à pergunta do dado | **melhorou, continua**: 6 de 8 casam, 2 não | T10 (vista da torre no lugar da escuta); encontro com os goblins (fala de Klaus); a Percepção da estrada (viajante genérico). Atletismo, Furtividade, Enganação e Prestidigitação casaram |
| 3 | Contradição Narrador × sistema (personagem que o motor nega) | **continua** | T24: a narração pôs Urusla na Feira do Saque e, ao perguntar a ela, o jogo respondeu «Urusla não está aqui». Klaus aparece em **9 cenas** (Altar, Bateria, Trapiche, Feira e a estrada), e Prudence some dos botões depois do T8 |
| 4 | Frase com nome próprio vira viagem | **continua** | T0: «…o que ele sabe da Prudence» virou «Ir até Altar Afogado». T31: «subo numa árvore **alta**» virou «Ir até **Bateria Alta**» (captura MV2-04). T5a: «o homem de **capa**» virou «A capa não está com você — não há o que entregar». Três em ~34 frases; o «Reescrever» salva |
| 5 | Ações de risco claro sem dado | **continua, um pouco melhor**: 9 de 28 contra 13 de 33 | ameaça 3 de 3 sem dado (T8, T14 com a mão no braço dela, T30 com faca na garganta); mentira 2 de 2 sem dado (T5, T16); furtar: sem dado em T9, **com** dado em T26 (a mesma ação, critério diferente); atravessar o cais pulando barcos em fuga (T22) sem dado |
| 6 | «Atacar Guarda da adaga» (alvo = nome de item) | **não deu para ver** | não apareceu botão «Atacar» em nenhum turno; T30 teve faca na mão e o jogo não ofereceu luta |
| 7 | Ritmo em blocos | **melhorou** | a maior sequência caiu de 9 para 6 (T14 a T20) e os dados voltaram a aparecer espalhados (T4, T10, T13, T21, T25, T26). Ainda há um bloco de 6 |
| 8 | Dado para algo banal | **melhorou, continua** | T13: Persuasão 18 para pedir um favor ao companheiro. O espontâneo da estrada agora é opcional. Na Parte 2, o Mestre «de hoje» pediu Percepção 13 para «ver quem vende o quê» numa praça |
| 9 | PT-PT escapando na narração | **continua e piorou** | 9 turnos de 28 contra 3 de 33: «Tu cuida» (T4), «tuas» (T6), «não te salva… te espera» (T7), «tu voltas… teu», «Pergunta ao Klaus» (T8), «Leva… tua espera» (T16, T19), «tens», «teu nome» (T17, T18), «tua ladainha… hoje te faço a taxa… leva… não digas» (T25). O mundo era steampunk; não sei se o molde pesa |

---

## 3. O veredito de jogador

**Pareceu mais mesa do que da outra vez?** *Sim no dado, não na conversa.*

- **Melhor, e de forma clara:** o dado agora **aparece onde um mestre o pediria** e traz o preço antes do clique. Escalar a muralha custou 4 PV, e eu soube que ia custar. Esgueirar-se, enganar para pedir desconto, furtar com a mão: cada um com a frase do que se perde, e o texto que veio depois quase sempre falava **disso**. O espontâneo virou um convite opcional («Agora não»), e o dado de chegada a lugar novo, que arruinou a 1ª sessão, desapareceu. O encontro da estrada (3 goblins, cinco saídas com chance, perícia, tempo e «se falhar») é o melhor momento de mesa que o jogo teve nas duas sessões: eu **escolhi** pelo risco.
- **O dado pesou?** Quando teve preço visível, sim: T4 doeu (14 para 10 PV), T21 e T26 falharam e a cena cobrou na hora. Perdeu peso quando o texto não respondeu (a escuta que virou vista da torre; os goblins que nunca foram narrados).
- **Onde ainda soa errado:**
  1. **O herói que fala e é sempre atendido.** Mentir (2), ameaçar (3) e barganhar (2) sem dado: todas foram resolvidas por vontade do Narrador, nunca por sorteio, e a maioria deu certo para mim. Quando a ação sem dado deu errado (furtar o Xavier, T9) foi também decisão do texto. A mesa parece um conto: o resultado não é meu.
  2. **Todo personagem fecha a fala com uma pergunta para mim**, em quase todas as narrações («E você? Ainda confia…», «O que exatamente você acha que herdou?»). Em 10 turnos cansa; em 25, é tique.
  3. **Klaus.** Um personagem que o sistema diz que não está em cena aparece e fala em nove cenas, inclusive a cinco dias de estrada, e sequestra a cena de resultado (a negociação com os goblins, a ameaça a ele mesmo).
  4. **O que a narração entrega não entra no jogo.** Carta com o selo de Prudence, mão de engenho, alfinete, papel, lanterna, embrulho: **nenhum** entrou na bolsa («1 coisa» o tempo todo). O jogador acredita que tem; a ficha diz que não.
  5. **PT-PT** em um terço das narrações.

---

## 4. Parte 2: as telas novas, tela por tela

Feito com o Mestre «de hoje» (`?mestre=0`) em Forte Seco e Porto Clara, em 1280 x 800 e depois em 375 x 812. **Erros no console: nenhum** (gancho em `console.error`, `console.warn`, `error` e `unhandledrejection` na campanha da Parte 2; na Parte 1 não instalei o gancho, então não medi). **Rolagem lateral: nenhuma** em nenhuma tela, nos dois tamanhos (`scrollWidth` igual à largura da janela).

**Fechar:** em 1280, **Esc, toque fora e «Pousar» fecham** livro, bolsa, banca e mapa (testado em estado limpo, 12 de 12). Em 375 as telas são de página inteira: **Esc e «‹ A mesa» fecham** as quatro; «tocar fora» não existe.

### O livro (cinco fitas)
- **Funcionou:** a capa de couro, as fitas como lacres, «As buscas» com o próximo passo, as etapas («as que faltam se abrem pelo caminho»), «A mão por trás» (um rosto sem nome). Em **Feitos**, o selo «Andarilho» de verdade, o título que se pode usar e o próximo da família («Pés Cansados: Viaje 10 vezes»). Celular: o livro vira página única com subfitas «Em curso · 1 / Ofertas · 0 / Estante · 0», legível e sem corte (capturas MV2-05, MV2-06).
- **Quatro das cinco fitas só existem depois da 1ª conquista** (regra do projeto: o Códex só abre com `conquistas > 0`). Nos primeiros minutos o livro mostra **uma fita só**, e quem foi atrás das cinco (como eu) acha que está quebrado. Não é erro, mas confunde na 1ª abertura.
- **1280:** nada cortado. Gente (só Merek), Bestiário («0 de 22: Nenhuma fera vista…») e a crônica lidos por texto.
- **Defeitos:** (a) **A crônica mostra markdown cru** (`*A lenda de Dagny · Fantasia medieval*`, `---`) e erros de texto: «**1 de Brumal de Brumal**», «**Ladina golias, acólita Fugitiva**» (gênero e espécie trocados). (b) Gente: «**noutra guerra**» (PT-PT). (c) **375:** a faixa das fitas rola na horizontal e a 5ª («A crônica») fica cortada no canto, sem dica de que há mais.

### A bolsa
- **Funcionou:** a ficha com o retrato, o boneco com os encaixes (CA 14, PV, PM, XP), a mochila de 10 casas, os mantimentos («5 dias para 2 bocas»). Tocar numa peça abre o cartão com **Oferendar / Dar a Merek / Largar «não tem volta»**; «Dar a Merek» moveu o item de verdade (a mochila de Dagny foi a 0 e a de Merek a 1, conferido na tela do companheiro). Equipar a Maça trocou o item no corpo e jogou a Espada Curta na mochila (conferido em 375).
- **Defeitos:** (a) **1280 x 800: o cartão do item é cortado embaixo** («Desmontar» e «Largar» ficam meio fora da moldura). (b) **O veredito do equipar mentiu por omissão:** o cartão da Maça diz «Dano: 1d6 → 1d8, melhora» e «Equipar · dano 1d8»; só **depois** do clique o registro avisa «você não tem treino em arma marcial: ataques com desvantagem e sem bônus de proficiência». Quebra a lei «o veredito antes do clique» no pior lugar (a banca avisa «Sem treino» para armadura, mas não para a arma). (c) O item «Símbolo sagrado riscado» oferece **«OFERENDAR · o altar aceita, o deus responde»**, texto de mecanismo sobre uma «coisa sem nome». (d) Clicar no cartão de um companheiro abre a **tela antiga** («A BOLSA DE MEREK CINZA-ANTIGA», abas Grupo/Pessoas/Mercado/Guilda/Mural, «O QUE SE LEVA», botão «Passar a Dagny»), visualmente de outro jogo (fundo verde-escuro liso, sem couro). Funciona; destoa.

### A banca (Mercado)
- **Funcionou muito bem:** o **veredito antes do clique, nos dois lados.** Comprar: `Comprar · 3 · fica com 12`, «você tem 14 · fica com 3», botão «Comprar Maça Pesada · você fica com 3». Vender: «A Roda Velha paga 7 · você fica com 21», botão «Vender · recebe 7, **não tem volta**». **O saldo bateu em todas as operações** (tocha: 15 para 14 e +1 tocha; venda: 14 para 21; maça: 21 para 3). Em 375 o veredito sobe como uma folha de baixo, com «Voltar ao pano», legível. «Pechinchar» baixou os preços em 12% (260/18/70).
- **Defeitos:** (a) **O lado de vender fica fora da dobra em 1280 x 800** (a seção «O que pagam pelo que você leva» começa em y ≈ 985); só se descobre rolando dentro do painel. (b) **O rótulo «NA SUA BOLSA ◉ 15» fica em cima da lista de mercadorias do vendedor**; é a carteira, não a bolsa, e lê como se as peças fossem suas. (c) **Pechinchar não mostra o dado nem a chance antes:** só o aviso «se ele se ofender, o preço sobe»; o `d20 17+0 = 17 contra 15` só aparece depois, no registro. (d) **Os preços subiram sem aviso** entre duas visitas (Rúnica Armadura 324 para 344, Cimitarra 22 para 23) depois que vendi um item e pechinchei na outra banca; pode ser «Primavera encareceu», mas a tela não disse. (e) «Tochas por ◉ 1 (Primavera encareceu mantimento)» só aparece no registro.

### O mapa
- **Funcionou:** a **carta de pergaminho** é a tela mais bonita das quatro. Escolher um destino mostra, antes de partir, o nome, o tipo, a distância («4 h a leste»), «O PREÇO» (ida e volta, perigo com caveiras, «chega às 12:05», «sem noite ao relento», «A estrada: perigo médio · Lá: difícil»), «Quem anda lá» («Atiradores e zumbis») e «O que se diz». Parti para **Porto Clara** (4 h); o relógio foi de 08:05 a 12:05, certo. Na estrada a carta troca o cartão por «VOCÊ JÁ ESTÁ NA ESTRADA · faltam 0 h»; na chegada diz «Você está em Porto clara».
- **Defeitos:** (a) **A viagem termina «presa»:** depois de partir, o cabeçalho segue «A CAMINHO DE PORTO CLARA», a carta diz «faltam 0 h / A caminho» e o registro «Forte Seco → Porto clara · chegando» **sem chegar**, até o jogador escrever outra jogada (a chegada só se completou quando escrevi «chego em Porto Clara…»). Parece travado; falta um «Chegar». (b) **«Porto clara» em minúscula** no cabeçalho, no registro e na carta (o título da carta diz «PORTO CLARA»). (c) Mapa em 375 abre **recortado e centrado no marcador** («BROU DE MIL BOCAS» cortado): precisa arrastar; funciona, mas não avisa. (d) A carta dá «Caminho conhecido» para a Mina de Cinzas, onde nunca estive (o nó era «só se ouviu falar»). (e) As rolagens de «Navegação» aparecem no registro com a conta nua («d20+2 = 10 vs 5 → rota mantida»), texto de sistema.

---

## 5. Defeitos novos, do mais grave ao menos

**Mestre (Parte 1)**
1. **(Grave) O que a narração dá não entra no estado.** Carta, mão de engenho, alfinete, papel, lanterna, embrulho: 0 de 5 (bolsa «1 coisa» o tempo todo). O Narrador afirma o que o motor não registrou, e o jogador nunca sabe o que de fato tem.
2. **(Grave) Ação de risco sem dado resolvida por vontade do texto**, nos dois sentidos: a mentira ao cobrador (T5) foi respondida **por Jasper** («Passa, passa…», o cobrador nem estava), a ameaça a Prudence (T8) trouxe um NPC novo (Xavier Underwood) e o furto no Xavier (T9) falhou **sem dado**. A mesma ação (furto) rolou em T26 e não em T9.
3. **(Grave) Texto de sistema dentro da narração**, contra a lei «o sistema não fala de si»: «**O sucesso te garante o favor sem risco**» (T16, dentro do parágrafo), «**Faltaram 1 — e fica meio caminho: vem pela metade…**» (T10), «**com dez de folga — deu certo com folga, e a folga compra alguma coisa**» (T25), «Navegação em marítima…».
4. **(Médio-grave) Resultado do encontro não narrado:** pagar 12 moedas para negociar com goblins e a narração não falar neles (só Klaus).
5. **(Médio) Klaus (9 cenas, a 5 dias de estrada) e fantasmas de cena:** NPCs que mudam de sobrenome entre cenas (Ambrose Brasswick / Merriweather, Lavinia Pennington / Underwood, Ursula / Urusla); a narração põe gente que o motor nega (Urusla «não está aqui»).
6. **(Médio) Todo NPC fecha com uma pergunta ao jogador**, em quase toda narração.
7. **(Médio) Um dado para duas ações** (T26: bilhete e mapa; o mapa foi ignorado).
8. **(Médio) A trava «Você já tentou escalar aqui, do mesmo jeito, e não deu»** disparou cinco dias de marcha depois da única escalada (T31): é global, não do lugar, como na 1ª sessão.
9. **(Leve) «+17 XP · o que você tentou, conseguiu»** quando nada foi feito (T3, a barganha ignorada); **conquista «Ombro Amigo»** ao chegar ao Altar sem eu ter feito nada; **a busca «Ouvir Prudence» continua 0 de 1** depois de uma conversa longa com ela.
10. **(Leve) O veredito de viagem impossível está truncado:** «À porta: um pouco acima de vocês, com 10 de 14 PV, até muito acima de vocês, com 10 de 14 PV. No fundo: muito acima de vocês, com 10 de 14 PV.», e um « · » solto no motivo das viagens curtas.
11. **(Leve) PT-PT** (defeito 9 da lista antiga: 32% dos turnos).

**Telas (Parte 2), com o tamanho de tela**
1. **(Grave, 1280 e 375) Viagem que não chega:** fica em «a caminho / faltam 0 h / chegando» até outra jogada.
2. **(Médio, 1280 x 800) Veredito do equipar omite «sem treino: desvantagem»**; só aparece no registro depois.
3. **(Médio, 1280 x 800) Vender fica abaixo da dobra** na banca; **cartão do item cortado embaixo** na bolsa.
4. **(Médio, os dois) A crônica com markdown cru** («*…*», «---») e erros («Brumal de Brumal», «Ladina golias»).
5. **(Médio, os dois) «Porto clara» em minúscula.**
6. **(Leve, 1280) «NA SUA BOLSA ◉ N» sobre a lista do vendedor; Pechinchar sem dado/chance antes; preços que sobem sem explicação.**
7. **(Leve, 1280) Tela de companheiro é a antiga**, de outro estilo.
8. **(Leve, 375) Fita «A crônica» cortada; mapa abre recortado.**
9. **(Leve) Quatro fitas escondidas até a 1ª conquista.**
10. **(Leve) «OFERENDAR · o altar aceita, o deus responde»** em item sem nome.

**Capturas** (`mente/lancamento/capturas/`): `MV2-01` escalada com preço · `MV2-02` dado espontâneo opcional na estrada · `MV2-03` mentira sem dado com texto de sistema · `MV2-04` «árvore alta» vira viagem · `MV2-05/06` livro 1280/375 · `MV2-07/08` bolsa 1280/375 · `MV2-09/10` banca 1280/375 (veredito de compra) · `MV2-11/12` mapa 1280/375. As de 01 a 04 foram feitas na janela real do headless (1262 x 704).

---

## 6. Transcrição completa

Formato: `>>> a frase do jogador` (ou `@click:` quando cliquei), o texto novo que apareceu na tela e `BTNS:` os botões de ação visíveis no fim. Os turnos aparecem como o jogo os mostrou (a numeração T# do texto acima é a minha, não do jogo). Os rolamentos manuais são os `@click:^Rolar`.

### Parte 1 (`?mestre=1`)

```
>>> oi, vou falar com o homem de capa, pergunto o que ele sabe da Prudence
Ir até Altar Afogado
«oi, vou falar com o homem de capa, pergunto o que ele sabe da Prudence»
5 min
Reescrever

T0 (viagem sugerida, sem narracao): oi, vou falar com o homem de capa, pergunto o que ele sabe da Prudence -> 'Ir até Altar Afogado' + Reescrever
BTNS: ["Pe oa  — o mundo começou a guardar quem você conhece.","Falar com Homem de capa","Explorar A Nave de Silêncio","Procurar Prudence Cranborne","AGIR","10\nraçõe \n10\nágua\n5\ntocha \n15\nmoeda "]
>>> vou falar com o homem de capa e pergunto se ele sabe onde a carroça dela esta


BTNS: ["Pe oa  — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ir até Altar Afogado","10\nraçõe \n10\nágua\n5\ntocha \n15\nmoeda "]
>>> vou falar com o homem de capa e pergunto se ele sabe onde a carroça dela esta
O cais de Ponta das Gaivotas cheira a salmoura e a carvão, e a gaivota que pousa no poste torto não canta: rosna, como tudo aqui. Ao desembarcar, um homem de capa ensebada estende a mão — não para ajudar, para cobrar. Uma medalha de cobre, devolvida na saída. Jasper paga por dois sem olhar o preço, e o guarda cuspiu no cais e disse: 'Bem-vindos ao fim das rotas.'
vou falar com o homem de capa e pergunto se ele sabe onde a carroça dela esta
O homem de capa ensebada aponta para o fim da rua sem tirar os olhos das moedas que Jasper deixou na palma da mão.
— A carroça da sacerdote? Está diante da capela, coberta de lona. Mas Prudence saiu ao cais, e a maré não pergunta a hora.
Ele fecha a mão sobre as moedas e vira o rosto para o mar. Jasper já está a meio passo de você, e a rua, de repente, não tem mais ninguém.
Mercado — há quem venda por aqui.
Ir até Altar Afogado
DIA · 08:05

BTNS: undefined
>>> pergunto pro Jasper se ele ouviu algum boato sobre essa cidade, e se confia nesse povo
pergunto pro Jasper se ele ouviu algum boato sobre essa cidade, e se confia nesse povo
Jasper encolhe os ombros, mas os olhos não param na rua vazia.
— O que se ouve é que a sacerdote sabe de um nome que ninguém quer dizer. E que quem dorme com a porta aberta acorda sem os sapatos. Confiar? Aqui se paga primeiro e se reza depois. E nem sei a quem.
Ele para diante de você e inclina a cabeça de leve.
— E o homem da capa? Você acredita nele, ou só nos olhos dele? — Jasper pergunta.

BTNS: undefined
>>> @click:^Mercado
O SINO DE SAL
Armazém · Ponta das Gaivotas
A mercadoria muda a cada semana. Na gaveta hoje:
5260
Pechinchar
uma proposta por dia; se ele se ofender, o preço sobe
OUTRAS BANCAS
Balcão de mantimentos
SOBRE O PANO · 9 PEÇAS
NA SUA BOLSA
Elixir de Vigor
106
✕
faltam 91
vai para a mochila
Antídoto
35
✕
faltam 20
vai para a mochila
Dente grande demais para ser de bicho comum
79
✕
faltam 64
vai para a mochila
Elixir de Intelecto
106
✕
faltam 91
vai para a mochila
Poção de Mana Pequena
31
✕
faltam 16
vai para a mochila
Poção de Cura Pequena
27
✕
faltam 12
vai para a mochila
Mapa de Mar Sem Vento
150
✕
faltam 135
abre a região na carta
Mapa de Mar dos Ossos
195
✕
faltam 180
abre a região na carta
Mapa de Estreito Sem Vento
195
✕
faltam 180
abre a região na carta
O QUE PAGAM PELO QUE VOCÊ LEVA
paga 7
ELIXIR DE VIGOR
incomum · poção · O Sino de Sal
SE VOCÊ COMPRAR
= vai para a mochila
O PREÇO
106
você tem 15 · faltam 91
Ponta das Gaivotas produz erva · Primavera barateou erva.
COMPRAR ELIXIR DE VIGOR
faltam 91 moedas
POUSAR · ESC

BTNS: undefined
>>> vou la no armazem e peço um desconto no elixir pro vendedor, to meio sem grana
vou la no armazem e peço um desconto no elixir pro vendedor, to meio sem grana
Jasper desvia o olhar para o chão de pedra e, mais uma vez, para a capa do cobrador, que ainda parece passar diante de vocês dois.
— Confesso que o homem me olha como quem conta moedas, não como quem vê gente — diz, baixo. — Mas a esta hora aceito desconto até de quem me chama de tolo, ainda mais com a bolsa no osso.
Ele devolve a pergunta com um sorriso torto:
— E você? Ainda confia no seu irmão, ou só no tino dele para farejar baú velho?
+17 XP · o que você tentou, conseguiu
DIA · 08:15

>>> eu vou escalar a muralha pra olhar a cidade lá de cima
eu vou escalar a muralha pra olhar a cidade lá de cima
Atletismo. Precisa de 15. Se falhar, você despenca lá de cima.
Rolar d20 + 1
Atletismo
precisa de 15
Mudar de ideia
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Rolar d20 + 1 Atletismo precisa de 15","Mudar de ideia"]

>>> @click:^Rolar
↯ Você escorrega e volta ao chão, com as mãos em carne viva.
a torre — 7 m de queda (2d6).
Salvaguarda de Destreza: d20 → 6 + 1 = 7 vs 15 · não resistiu
4 de dano — 7 m de queda · 10/14 PV
Caído (1t) — No chão: desvantagem até levantar.
Você se apoia na pedra e tenta a subida, mas a saliência racha sob os dedos — um estalo seco — e o mundo escorrega. Sete metros de parede, e o chão chega de uma vez. Aterrissa de lado, o ar foge, e a sua mão fica em carne viva, presa entre o pó e a pedra. Jasper ajoelha-se e segura-lhe o ombro, sem puxar.
— Quieto aí — ele diz. — Eu cuido da pergunta. Tu cuida de levantar antes que o cobrador volte e cobre pela vista.
A dor tarda um segundo, e depois não pede licença.
✓ Caído passou
Ir até Altar Afogado
✕
ATLETISMO
9 + 1 = 10
precisa de 15 — ✕ falhou
DIA · 08:25
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ir até Altar Afogado"]

>>> levanto, e digo pro homem de capa que eu sou enviado do conselho e que ele tem que me deixar passar sem pagar
A capa não está com você — não há o que entregar.
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ir até Altar Afogado"]

(T5a sem narracao: 'digo pro homem de capa que eu sou enviado do conselho...' -> 'A capa não está com você — não há o que entregar.' lido como entregar item)
>>> digo pro cobrador que eu sou enviado do conselho e que ele tem que me deixar passar sem pagar
digo pro cobrador que eu sou enviado do conselho e que ele tem que me deixar passar sem pagar
Jasper morde a palavra antes de soltá-la, e por fim cede com um gesto: 'Passa, passa — mas se perguntarem, eu não sei de nada.' Nas mãos dele ficam duas coisas que não se dão bem: a moeda do cobrador, quente do bolso dele, e a capa que ainda balança ao virar da esquina, como um recibo que ninguém assina. Você segue, e o cais cospe o som das ondas — não há relógio nenhum, só o sino ao longe. E a certeza de que a carroça está à porta da capela, coberta de lona, ainda esperando que alguém a chame pelo nome.
ATLETISMO · 9 + 1 = 10 · PRECISA DE 15
DIA · 08:30
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ir até Altar Afogado"]

>>> @click:Ir até Altar
«Vou até Altar Afogado.»
5 min
Reescrever
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ir até Altar Afogado «Vou até Altar Afogado.» 5 min","Reescrever"]

>>> @click:Ir até Altar Afogado
·
dentro dos muros, a 5 min a pé
Ir · 5 min
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ir até Altar Afogado «Vou até Altar Afogado.» 5 min","Reescrever","Ir · 5 min"]

>>> @click:^Ir · 5
ALTAR AFOGADO
Vou até Altar Afogado.
Conquista desbloqueada: 🍻 Ombro Amigo — título "Ombro Amigo"
Você atravessa a praça do sino e empurra a porta baixa do Altar Afogado. Lá dentro, a luz cai salgada pelas frestas, e o cheiro de cera queimada se mistura ao de peixe e de corda. Prudence Cranborne está de costas, ajoelhada diante do altar, e por um instante escova a estola com a mão — devagar, como quem tirasse areia de uma ferida. Ela se levanta sem pressa, e quando vira o rosto, o sorriso vem antes da voz: 'As chaves pesam, Ulysses?'
quem te deixou as chaves
DIA · 08:40
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Prudence Cranborne"]

>>> respondo que pesam mais do que eu esperava, e pergunto o que aconteceu com a antiga guarda e que nome é esse que ninguém quer dizer
respondo que pesam mais do que eu esperava, e pergunto o que aconteceu com a antiga guarda e que nome é esse que ninguém quer dizer
Prudence solta um riso baixo, sem alegria. 'Pesam porque ainda são tuas, e isso ninguém tira.' Ela alisa a estola e olha para a porta, como se o mar entrasse por ela. 'A antiga guarda? Metade desertou, a outra metade aprendeu a cobrar pedágio. Quanto ao nome…' Ela se inclina um pouco, baixa a voz: 'Esse ninguém diz em voz alta. Nem eu, até ter certeza de que você veio para ficar.' E então, sem mudar o tom, pergunta: 'O que exatamente você acha que herdou?'
+17 XP · um lugar por onde você nunca tinha passado
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Prudence"]

>>> digo que herdei uma guarda sem moral nenhuma, e peço pra ela escrever uma carta com o selo dela pros homens da Bateria me obedecerem
digo que herdei uma guarda sem moral nenhuma, e peço pra ela escrever uma carta com o selo dela pros homens da Bateria me obedecerem
Prudence Cranborne endireita a estola e olha para você como quem reconhece o peso que a chave põe no bolso. 'Pois a guarda da Bateria Alta não tem mais moral para obedecer nem a maré. Mas há dezessete anos eu ainda subia aquela ladeira com o capitão Underwood, e a medalha de cobre valia o mesmo que o pão.' Ela pega um selo da capela e assopra o pó. 'Uma carta com o selo eu assino, porque você veio e ainda não se vendeu. Mas não te salva dos homens que aprenderam a cobrar passagem.' Baixa a voz: 'Há pouco, no cais, um viajante viu Klaus no Píer das Gaivotas — e não era o único a procurá-lo. A maré abre para Ponta Vermelha, e o recado que te espera lá é mais alto do que eu posso dizer.'
DIA · 08:50
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Prudence Cranborne"]

>>> chego bem perto dela e falo baixo que se ela nao me disser esse nome agora, as chaves voltam pro conselho com a historia de que ela fugiu
2
chego bem perto dela e falo baixo que se ela nao me disser esse nome agora, as chaves voltam pro conselho com a historia de que ela fugiu
Prudence inclina-se para trás, como se a ameaça tivesse peso físico, e olha para a sua mão estendida.
— Então as chaves voltam ao conselho, e tu voltas a ser o que eras antes de eu te escolher — diz, sem desviar o olhar. — Mas o nome, Ulysses, não se diz baixo. Pergunta ao Klaus. Ele veio atrás de ti, e está ali fora, à espera que o chames pelo que é.
Xavier Underwood levanta-se do banco, a madeira estala, e pergunta, sem olhar nos seus olhos: 'E se o nome for teu, quem é que foge?'
quem te deixou as chavesviúva de pescador
DIA · 08:55
BTNS: ["2","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Prudence","Xavier Underwood"]

>>> enquanto o Xavier se ajeita no banco eu tento tirar a bolsa de moedas do cinto dele sem ele sentir
enquanto o Xavier se ajeita no banco eu tento tirar a bolsa de moedas do cinto dele sem ele sentir
Você se move devagar, o corpo baixo, os dedos na beirada da bolsa — mas a mão de Xavier desce na sua e aperta, de repente, forte como um torno de ferreiro. 'Devia ter ficado com o tigre adormecido', ele diz, sem olhar nos seus olhos, e desliza a bolsa para o bolso da frente. Klaus, encostado à porta, ri baixo: 'Não é tolo, o viúvo. Paga as dívidas antes de dormir.' Xavier ergue o queixo e encara você, pausado: 'Aqui, quem tira da bolsa sem pedir deixa os dentes na rua.'
viúva de pescador
DIA · 09:00
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Xavier"]

>>> me encosto numa coluna e escuto o que o Xavier e o Klaus cochicham la na porta, sem eles perceberem
me encosto numa coluna e escuto o que o Xavier e o Klaus cochicham la na porta, sem eles perceberem
Percepção. Precisa de 13. Se falhar, só ouve pedaços, e o tempo passa ali.
Rolar d20 + 1
Percepção
precisa de 13
Mudar de ideia
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Xavier","Rolar d20 + 1 Percepção precisa de 13","Mudar de ideia"]

>>> @click:^Rolar
Faltaram 1 — e fica meio caminho: vem pela metade: um pedaço verdadeiro do que existia, e o resto em falta.
Do alto da capela, pela fresta da torre, você vê o telhado de Ponta das Gaivotas como quem lê um mapa de dívidas: a Roda dos Punhos cheia, o cais com barcos que não deviam estar atracados juntos, e na praça o sino mudo. De Recife Funda chega, pelo porto, um recado com selo de fundeadouro: o mastro da última pousada ainda exibe a bandeira que você viu hasteada no dia em que partiu — inalterada, como se nada tivesse acontecido desde então. Você tenta escutar o que se diz ali dentro, mas só apanha metade: a palavra 'maré' e mais nada. Xavier levanta-se e encara a porta, como se a outra metade estivesse do lado de fora.
11
✕
PERCEPÇÃO
11 + 1 = 12
precisa de 13 — ✕ falhou
DIA · 09:02
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Xavier"]

>>> procuro algo escondido atras do altar, tem que ter alguma coisa
procuro algo escondido atras do altar, tem que ter alguma coisa
Você afasta a cortina atrás do altar: só pedra fria e uma ânfora rachada com água benta. Nada escondido. Prudence acompanha seus movimentos com um sorriso triste. 'Nada nas minhas costas, Ulysses.' Então Klaus, que já estava ali, dá um passo à frente e pergunta: 'O que você espera encontrar quando parar de procurar?'
quem te deixou as chaves
PERCEPÇÃO · 11 + 1 = 12 · PRECISA DE 13
DIA · 09:12
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Prudence"]

>>> me despeço e vou pra Bateria Alta ver esses doze homens
Ir até Bateria Alta
«me despeço e vou pra Bateria Alta ver esses doze homens»
5 min
Reescrever
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Prudence","Ir até Bateria Alta «me despeço e vou pra Bateria Alta ver esses doze ","Reescrever"]

>>> @click:^Ir · 
1
BATERIA ALTA
me despeço e vou pra Bateria Alta ver esses doze homens
Na Bateria Alta, o vento chicoteia a muralha e o sal gruda nos lábios. Doze homens exaustos viram-se ao mesmo tempo — alguns com alabardas, outros com as mãos vazias. Jasper, ao seu lado, conta-os em voz baixa e não gosta do número.
— São doze, Ulysses. Doze olhos, e metade deles com as costas na parede.
Wilhelmina Hartley, artilheira da cidade, estuda você da amurada e pergunta, sem baixar o tom: 'É você que vai pagar o soldo atrasado, ou veio ver a gente descer?'
artilheiro
Ir até Altar Afogado
DIA · 09:22
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Wilhelmina Hartley","Ir até Altar Afogado"]

>>> peço pro Jasper dar uma volta entre os soldados e descobrir quem anda pensando em desertar, sem ninguem notar
peço pro Jasper dar uma volta entre os soldados e descobrir quem anda pensando em desertar, sem ninguem notar
Persuasão. Precisa de 18. Se falhar, a resposta é não, e pedir igual não muda nada.
Rolar d20 + 6
Persuasão
precisa de 18
Mudar de ideia
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Wilhelmina Hartley","Rolar d20 + 6 Persuasão precisa de 18","Mudar de ideia"]

>>> @click:^Rolar
Wilhelmina Hartley baixa o rosto sobre o sino rachado e não repete a pergunta. 'O soldo atrasado se paga sozinho quando o vento vira', diz, 'mas a minha fome não.' Os doze homens trocam olhares, e Jasper some entre eles como quem conta passos na areia. Quando volta, põe nas suas mãos um alfinete cru e um papel dobrado, sujo de pólvora. 'Um quer descer ao mercado', sussurra, 'e a artilheira, entretanto, deixou isto no parapeito. Mas não foi esquecido — foi posto.' Klaus já não está ao seu lado. Desceu a muralha escondido, e o alfinete está quente. O papel cheira a sal e a pressa.
Ir até Altar Afogado
17
✓
PERSUASÃO
17 + 6 = 23
precisa de 18 — ✓ passou
DIA · 09:32
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Wilhelmina Hartley","Ir até Altar Afogado"]

>>> seguro a artilheira pelo braço, olho fundo nos olhos dela e digo que ou ela me conta pra onde some a polvora ou eu mesmo conto pro conselho que a muralha esta indefesa
seguro a artilheira pelo braço, olho fundo nos olhos dela e digo que ou ela me conta pra onde some a polvora ou eu mesmo conto pro conselho que a muralha esta indefesa
Wilhelmina baixa os olhos para a sua mão no braço dela e não a afasta. 'A pólvora não some — muda de dono. Mas se o conselho souber que a muralha está nua, a próxima maré traz navio que não atraca para pagar soldo.' Ela engole seco. 'Vá ao Trapiche do Sal. Pergunte pelo pacote que o mar devolveu.' Klaus já está a um passo de vocês, o rosto virado para a escada. 'E se eu fosse você, não descia sozinha. Ouvi dizer que alguém me procura — e não é por recado.' Jasper sacode a cabeça, pálido. O vento derruba o alfinete no chão.
PERSUASÃO · 17 + 6 = 23 · PRECISA DE 18
DIA · 09:37
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Wilhelmina","Ir até Altar Afogado"]

>>> vou pro Trapiche do Sal procurar o pacote que o mar devolveu
Ir até Trapiche do Sal
«vou pro Trapiche do Sal procurar o pacote que o mar devolveu»
5 min
Reescrever
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Wilhelmina","Ir até Trapiche do Sal «vou pro Trapiche do Sal procurar o pacote que ","Reescrever"]

>>> @click:^Ir · 
TRAPICHE DO SAL
vou pro Trapiche do Sal procurar o pacote que o mar devolveu
No Trapiche do Sal, entre cordas e caixotes que pingam, Seraphina Pennington não levanta o rosto: 'Todo mundo pergunta pelo tal pacote. Ninguém me diz quem devolveu nem por que.' Nadine Underwood joga um balde d'água no cais e olha de viés. É Klaus quem chega, de repente, o rosto cheio de pressa: 'Ulysses, escuta — no Píer das Gaivotas há um homem com um pergaminho que diz o recado.' Jasper limpa as mãos na capa e pergunta: 'E quem foi que pediu a Klaus para te encontrar aqui?'
mestre do portoestivador
Ir até Altar Afogado
DIA · 09:47
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina Pennington","Nadine Underwood","Ir até Altar Afogado"]

>>> falo pra Seraphina que sou fiscal do porto mandado pelo conselho e que preciso ver o pacote agora
falo pra Seraphina que sou fiscal do porto mandado pelo conselho e que preciso ver o pacote agora
O sucesso te garante o favor sem risco: Seraphina ergue o rosto, sem olhar nos olhos, e aponta para uma caixa lacrada sob o balcão. 'O pacote o mar devolveu, e eu guardo pacote como guardo dívida. Leva, que o conselho não me paga por afogado.' Ela desliza a caixa, mas a mão contrabandista de Ambrose a intercepta: 'E o que o fiscal paga pelo calado?' Antes que responda, Klaus entra apressado, o rosto molhado de sal: 'Ulysses, não é só o pacote que veio à tona. Alguém no Píer das Gaivotas diz seu nome.' Jasper, sem olhar para o irmão, põe nas suas mãos o alfinete de pólvora e o papel dobrado que o vento da Bateria Alta quase derrubou. As duas coisas não cabem juntas na palma.
mestre do portocontrabandista
DIA · 09:52
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Ambrose","Bateria Alta","Ir até Altar Afogado"]

>>> pego a caixa e abro pra ver o que tem dentro
3
pego a caixa e abro pra ver o que tem dentro
A caixa lacrada range quando você a abre. Dentro, uma mão de engenho, pequena, com juntas de cobre e dois dedos quebrados, ainda presa a uma pulseira de couro com um selo de cera derretida. Seraphina desvia o olhar para o cais.
— O mar devolveu assim — diz. — E quem paga a guarda por baixo da mesa já veio perguntar por ela.
Klaus inclina-se sobre a mesa:
— Não foi só por isso que te procurei, Ulysses. Ouvi o teu nome no Píer das Gaivotas, na boca de quem não devia conhecê-lo.
Ambrose cruza os braços e encara a porta:
— Dizem que quando a mão volta, o dono está a um passo.
Nadine deixa a frase a meio:
— E se o dono já estiver aqui dentro…
mestre do portocontrabandistaestivador
DIA · 09:57
BTNS: ["3","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Ambrose","Nadine","Ir até Altar Afogado"]

>>> pergunto pra Seraphina quanto ela quer pela mão de engenho e tento pagar bem menos, digo que so tenho umas moedas e que ela me deve um favor
pergunto pra Seraphina quanto ela quer pela mão de engenho e tento pagar bem menos, digo que so tenho umas moedas e que ela me deve um favor
Seraphina encolhe os ombros, os olhos no caixote, não nos seus. 'Favor não enche barriga.' Ela desliza a mão de engenho um palmo para trás. 'Mas se só tens umas moedas, elas ficam no balcão e a coisa fica em cima — até o dono verdadeiro aparecer.' Klaus, atrás de você, arrasta um caixote com o pé e diz baixo: 'Ou até alguém pagar o dobro.' Ambrose ri, um som seco, e cruza os braços: 'Dobro do que eu ainda não disse quanto é.' Jasper, perto da porta, não se move — os dedos dele brincam com o alfinete no bolso.
mestre do portocontrabandista
DIA · 10:02
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Ambrose","Ir até Altar Afogado"]

>>> levo a mão de engenho e saio pro Píer das Gaivotas ver quem esta falando meu nome
3
levo a mão de engenho e saio pro Píer das Gaivotas ver quem esta falando meu nome
Você pega a mão de engenho, e Seraphina não tenta impedir: 'Leva, e se o mar vier buscar, diz que não fui eu.' A porta range. Lá fora, a comoção: montes de peixe virado, facas no chão, estivadores sem direção. Nadine sai atrás de você, muda. Ambrose diz: 'O recado é esse. Já estavam à tua espera.' A multidão se fecha, e o Píer das Gaivotas fica de repente longe.
mestre do portoestivadorcontrabandista
DIA · 10:07
BTNS: ["3","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Nadine","Ambrose","Ir até Altar Afogado"]

(check T19: bolsa segue com '1 COISA'; moedas 15; mão de engenho/alfinete/papel narrados não entraram no estado)
>>> vou explorar a Nave de Silêncio
Ir até a Nave de Silêncio
«vou explorar a Nave de Silêncio»
☠ Impossível
Reescrever
BTNS: ["3","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Nadine","Ambrose","Ir até a Nave de Silêncio «vou explorar a Nave de Silêncio» ☠ Impossív","Reescrever"]

>>> reviro os caixotes de peixe do trapiche procurando qualquer coisa que preste
reviro os caixotes de peixe do trapiche procurando qualquer coisa que preste
Você revira os caixotes de peixe do trapiche. Escamas, gelo derretido, anzóis tortos, um pano de estopa. Nada que preste, só o dinheiro sujo de sal. Seraphina observa em silêncio e aponta para uma lanterna de cobre sem pavio, largada entre duas amarras. É sua, se quiser. A lanterna pesa na mão, e Ambrose, sem tirar os olhos de você, lembra que o mar devolveu a mão — e que ele também devolveu uma vez. Jasper está ao seu lado, tenso, e a mão de engenho queima no seu bolso.
mestre do portocontrabandista
DIA · 10:17
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Ambrose","Ir até Altar Afogado"]

>>> me esgueiro por tras do Ambrose sem ele perceber pra espiar o que ele carrega por dentro do casaco
me esgueiro por tras do Ambrose sem ele perceber pra espiar o que ele carrega por dentro do casaco
Furtividade. Precisa de 15. Se falhar, alguém na rua vê você onde não devia.
Rolar d20 + 1
Furtividade
precisa de 15
Mudar de ideia
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Ambrose","Rolar d20 + 1 Furtividade precisa de 15","Mudar de ideia"]

>>> @click:^Rolar
3
↯ O passo sai errado e o corpo aparece onde não devia.
Você contorna os caixotes para sair sem chamar atenção, mas a lanterna de cobre que Seraphina lhe apontou se prende ao seu cinto e raspa numa amarra. O som corre pelo sal, e Ambrose vira o rosto na hora. Ele não fala: apenas te olha da porta, e alguma coisa no jeito que Nadine desvia os olhos te diz que ela também viu. Você ainda sente o peso da mão de engenho no bolso. Jasper, ao seu lado, prende o fôlego entre os dentes por um instante, e depois solta um suspiro baixo, como quem conta o que já foi pago.
mestre do portocontrabandistaestivador
Ir até Altar Afogado
✕
FURTIVIDADE
9 + 1 = 10
precisa de 15 — ✕ falhou
DIA · 10:22
BTNS: ["3","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Seraphina","Ambrose","Nadine","Ir até Altar Afogado"]

>>> saio correndo e atravesso o cais pulando por cima dos barcos amarrados, de um em um, pra fugir do Ambrose
saio correndo e atravesso o cais pulando por cima dos barcos amarrados, de um em um, pra fugir do Ambrose
Você salta do trapiche para o convés de um bote, a madeira range sob a bota, e o pulo seguinte leva você a uma traineira baixa antes que a amarra estale. Ambrose não grita. Fica parado à porta, as mãos nos bolsos, e o olhar dele acompanha você de barco em barco como quem conta passos que não precisa dar. Nadine recolhe uma corda e não a segura. Jasper, atrás, pragueja baixo enquanto pula. Na última escuna, sua mão pousa na amurada, e a mão de engenho quase cai do seu bolso — fria, pequena, agarrada como se fosse sua. Você chega ao cais de pedra já sem fôlego, e aí ouve, vindo da Feira do Saque, a voz de uma criança cantando uma cantiga que a maré costuma engolir. A mão no seu bolso parece, por um instante, mais quente.
contrabandistaestivador
FURTIVIDADE · 9 + 1 = 10 · PRECISA DE 15
DIA · 10:27
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ambrose","Nadine","Ir até Altar Afogado"]

>>> vou até a Feira do Saque ver quem canta
Ir até Feira do Saque
«vou até a Feira do Saque ver quem canta»
5 min
Reescrever
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ambrose","Nadine","Ir até Feira do Saque «vou até a Feira do Saque ver quem canta» 5 min","Reescrever"]

>>> @click:^Ir · 
FEIRA DO SAQUE
vou até a Feira do Saque ver quem canta
Você entra na Feira do Saque ainda com a canção nos ouvidos. Entre lonas e cordames, uma criança de cabelo aparado canta baixinho, de mão dada com uma lavinia autômato que não olha nos olhos. Urusla Vandermere aponta para um mapa aberto e diz: 'Hoje ela só canta a parte que acalma.' Ambrose Merriweather cruza os braços, a boca torcida, e deixa no ar: 'O resto vem com o vento.'
cambista
Ir até Altar Afogado
DIA · 10:37
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ambrose Merriweather","Ir até Altar Afogado"]

>>> pergunto pra Urusla quem e a crianca e o que ela esta mostrando no mapa, e se ela troca informacao por moeda
Urusla não está aqui
«pergunto pra Urusla quem e a crianca e o que ela esta mostrando no mapa, e se ela troca informacao por moeda»
Reescrever
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ambrose Merriweather","Urusla não está aqui «pergunto pra Urusla quem e a crianca e o que ela","Reescrever"]

>>> pergunto pro Ambrose quem e a crianca que canta e o que o resto que vem com o vento quer dizer
pergunto pro Ambrose quem e a crianca que canta e o que o resto que vem com o vento quer dizer
Ambrose Merriweather encolhe os ombros, o rosto fechado como quem guarda troco miúdo. "É a filha da maré — e o resto é o que ela canta quando a maré sobe." Jasper puxa seu braço de leve: "E o que a gente faz se o resto for um nome?" — mas é Lavinia quem vira a cabeça, devagar, e pergunta: "Você já viu essa criança antes, não viu?"
cambistareceptador
DIA · 10:42
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ambrose Merriweather","Lavinia","Ir até Altar Afogado"]

>>> digo pro Ambrose que sou cliente fiel e peço um desconto na taxa de troca, so tenho moeda miuda
digo pro Ambrose que sou cliente fiel e peço um desconto na taxa de troca, so tenho moeda miuda
Enganação. Precisa de 14. Se falhar, a resposta é não, e pedir igual não muda nada.
Rolar d20 + 10
Enganação
precisa de 14
Mudar de ideia
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Ambrose Merriweather","Lavinia","Rolar d20 + 10 Enganação precisa de 14","Mudar de ideia"]

>>> @click:^Rolar
com dez de folga — deu certo com folga, e a folga compra alguma coisa.
O cambista de sobrenome Brasswick ouve tua ladainha de moeda miúda e cede meio sorriso, sem afrouxar o nó da bolsa. 'Cliente fiel paga a dobrar, por conhecer o caminho. Mas hoje te faço a taxa de amigo: leva a troca e não digas que fui eu.' Desconto miúdo, o bastante para não doer. Enquanto contas as moedas, Lavinia Pennington desliza um bilhete dobrado para tua mão, sem levantar os olhos. 'A cantiga tem segunda parte. Quem te vendia mapas sabia dela.' Ao teu lado, Jasper pigarreia, e no centro da feira Ursula Vandermere vira as costas, como quem sente o salário esfriar.
receptadorvendedor de mapas
Ir até Altar Afogado
18
✓
ENGANAÇÃO
18 + 10 = 28
precisa de 14 — ✓ passou
DIA · 10:47
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Lavinia Pennington","Ursula Vandermere","Ir até Altar Afogado"]

>>> tento pegar de leve o bilhete que a Lavinia deixou cair e leio sem ninguem ver, e depois furto o mapa aberto da Ursula enquanto ela vira de costas
tento pegar de leve o bilhete que a Lavinia deixou cair e leio sem ninguem ver, e depois furto o mapa aberto da Ursula enquanto ela vira de costas
Prestidigitação. Precisa de 15. Se falhar, a mão é vista onde não devia tocar.
Rolar d20 + 1
Prestidigitação
precisa de 15
Mudar de ideia
ENGANAÇÃO · 18 + 10 = 28 · PRECISA DE 14
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Lavinia Pennington","Ursula Vandermere","Rolar d20 + 1 Prestidigitação precisa de 15","Mudar de ideia"]

>>> @click:^Rolar
↯ A mão erra o tempo e toca onde não devia tocar.
Sua mão demora um instante a mais no bolso, e Lavinia capta — ela gira a cabeça, sem olhar, e guarda a mão fina sob o xale. Ursula nem se vira: só assovia. Ninguém viu, e ainda assim você sente o tempo cobrado no suor frio da nuca. Ambrose Merriweather aperta as moedas na palma e diz: 'Tempo é a única moeda que a feira não troca.' Você fica de mãos vazias.
receptadorvendedor de mapascambista
Ir até Altar Afogado
✕
PRESTIDIGITAÇÃO
10 + 1 = 11
precisa de 15 — ✕ falhou
DIA · 10:48
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Lavinia","Ursula","Ambrose Merriweather","Ir até Altar Afogado"]

>>> saio da cidade pela estrada e sigo viagem a pé em direção a Ponta Vermelha
Partir para Ponta Vermelha
«saio da cidade pela estrada e sigo viagem a pé em direção a Ponta Vermelha»
Reescrever
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Lavinia","Ursula","Ambrose Merriweather","Partir para Ponta Vermelha «saio da cidade pela estrada e sigo viagem ","Reescrever"]

>>> @click:^Partir$
A CAMINHO DE PONTA VERMELHA
garoa fina
saio da cidade pela estrada e sigo viagem a pé em direção a Ponta Vermelha
Navegação em maritima: d20+6 = 24 vs 7 → rota mantida
Conquista desbloqueada: 🧭 Andarilho — título "Andarilho"
Na estrada: garoa fina — não limpa nem molha — tudo fica pela metade, inclusive o ânimo.
🔥 a fogueira fria — cinzas de quem passou por aqui antes de você.
Ponta das Gaivotas → Ponta Vermelha · PAUSADA (10%) — um encontro na estrada
Na estrada para Ponta Vermelha a garoa não molha, só costura a névoa baixa entre os arbustos. Você vê pegadas pequenas, descalças, e ao lado delas um osso roído, branco, ainda úmido. Lavinia Underwood para diante de você e pergunta: "Se alguém do regimento perguntar, você nunca me viu. Mas me diga: por que foi justo agora que resolveu sair da cidade?" Jasper se adianta devagar, os olhos nas marcas, e sussurra: "Não anda sozinho, Ulysses. E anda de dentro para fora."
O MESTRE
preparando…
pegadas pequenas e descalças, e um osso roído no chão
Aceitar: negar ao regimento que se viram
Lavinia Underwood conta com você · 5 min
+2
ofertas
PRESTIDIGITAÇÃO · 10 + 1 = 11 · PRECISA DE 15
DIA · 14:48
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Aceitar: negar ao regimento que se viram Lavinia Underwood conta com v","+2 ofertas"]

>>> @click:^Rolar
A garoa engrossa quando um viajante cruza com você no estreito da estrada, a capa pingando sal. Ele segura uma cabaça rachada e olha para trás uma vez antes de dizer: “Vi Klaus lá no Píer das Gaivotas, e não era o único procurando por ele.” Jasper pergunta se alguém veio junto. O viajante entorna a cabaça, limpa a boca com as costas da mão e responde, baixo: “Um que paga por baixo da mesa também anda fazendo perguntas.” A estrada vira ladeira, e ele some na névoa sem dizer o nome. Jasper encara você. “E agora?” […]
Aceitar: negar ao regimento que se viram
Lavinia Underwood conta com você · 5 min
+2
ofertas
19
✓
PERCEPÇÃO
19 + 1 = 20
precisa de 13 — ✓ passou
NA ESTRADA · UM ENCONTRO
3× Goblin
ainda não te viu
À VISTA · SÃO 3
O que você faz?
Contornar
Sobrevivência · CD 10
2 h
se falhar: fui visto, e a luta vem direita a mim
65%
d20 +2
Esconder-se
Furtividade · CD 10
1 h
se falhar: fui visto, e a luta vem direita a mim
60%
d20 +1
Negociar
Persuasão · CD 11
12
se falhar: a conversa acabou em aço, cara a cara
80%
d20 +6
Emboscar
Furtividade · CD 12
se falhar: fui visto, e a luta vem direita a mim
50%
d20 +1
Voltar atrás
sem dado
4 h
ainda não te viu: recuar é seguro
CERTO
Lutar
Escolha o que você faz
ou escreva o que você faz — o campo continua aberto
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Aceitar: negar ao regimento que se viram Lavinia Underwood conta com v","+2 ofertas","Escolha o que você faz"]

>>> @click:^Negociar · 80%
Klaus surge da garoa como se sempre estivesse caminhando ao seu lado. Ele não fala de imediato; apenas olha para você, o queixo tenso, o passo reduzido à sua velocidade. Atrás, Jasper estala a língua, impaciente.
— O que foi? — pergunta Jasper.
Klaus não responde a ele. Espera que seja você a perguntar.
Na beira da estrada, uma fogueira fria marca o lugar onde alguém dormiu — cinzas úmidas, uma lata amassada. Klaus para diante dela e, sem tirar os olhos de você, pergunta:
— Você ainda acredita que o mar devolve as coisas de graça?
+3
16
PERSUASÃO
16 + 6 = 22
precisa de 11 — ✓ passou
3
BTNS: ["Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","Aceitar: negar ao regimento que se viram Lavinia Underwood conta com v","+3 ofertas"]

>>> e os goblins? o que aconteceu com eles depois que eu paguei
1
e os goblins? o que aconteceu com eles depois que eu paguei
Klaus limpa as mãos na capa antes de responder. "Os goblins? Aceitaram o pagamento e desceram para o mato baixo, mas não foram longe. Um deles deixou um pedaço de corda com três nós amarrada no espinheiro — dívida acertada, dívida vigiada." Jasper solta um riso curto. "Ou seja, não viram as costas." Klaus concorda com a cabeça, devagar. E, enquanto você observa a garoa fina fechar a estrada atrás dele, ele acrescenta: "Há quem diga que goblin não esquece rosto. Mas eu digo que goblin não esquece medo." Diante de vocês, na curva, um camponês conserta a roda da carroça com paciência, martelando o aro gasto até ele assentar certo na madeira.
3, hostis
PERSUASÃO · 16 + 6 = 22 · PRECISA DE 11
DIA · 14:53
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","goblins","Aceitar: negar ao regimento que se viram Lavinia Underwood conta com v","+3 ofertas"]

>>> entro sozinho no mato baixo, devagar e sem fazer barulho, pra ver onde os goblins foram
entro sozinho no mato baixo, devagar e sem fazer barulho, pra ver onde os goblins foram
Klaus olha para você, segura um embrulho e diz: "Leve isto à Casa Ironside. Não pergunte a quem. Quem pergunta por mim, pergunta por você também." E some na garoa antes que Jasper o alcance. Você entra no mato baixo devagar, sem ruído; os goblins seguem adiante, e a corda de três nós balança no espinheiro.
Aceitar: levar um embrulho sem perguntar
Klaus conta com você · 5 min
+6
DIA · 14:58
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","goblins","Aceitar: levar um embrulho sem perguntar Klaus conta com você · 5 min","+6 ofertas"]

>>> puxo o Klaus pela gola contra o espinheiro, faca na mao, e falo que ele vai me contar quem manda esse embrulho ou nao sai daqui inteiro
puxo o Klaus pela gola contra o espinheiro, faca na mao, e falo que ele vai me contar quem manda esse embrulho ou nao sai daqui inteiro
Klaus sente a faca na altura do queixo e a gola torcida, mas não se debate. O espinheiro range atrás dele. Jasper solta um "Ulysses…" baixo, e ninguém mais se move. Klaus abre as mãos, os olhos fixos nos seus. "O embrulho não é meu, e quem manda só me paga se você o receber longe daqui." O mato baixo range adiante, uns trinta passos — os goblins esperam, e um assovia duas notas secas. Klaus pergunta, a voz tremendo de leve: "Você quer saber quem é, ou quer sair inteiro?"
DIA · 15:03
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","goblins","Aceitar: levar um embrulho sem perguntar Klaus conta com você · 5 min","+6 ofertas"]

>>> subo numa arvore alta ali do lado pra olhar a estrada toda de cima e ver se tem mais alguem vindo
Ir até Bateria Alta
«subo numa arvore alta ali do lado pra olhar a estrada toda de cima e ver se tem mais alguem vindo»
5 min
Reescrever
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","goblins","Ir até Bateria Alta «subo numa arvore alta ali do lado pra olhar a est","Reescrever"]

>>> escalo o tronco de uma arvore grande ali do lado pra olhar a estrada de cima e ver se tem mais alguem vindo
escalo o tronco de uma arvore grande ali do lado pra olhar a estrada de cima e ver se tem mais alguem vindo
↺ Você já tentou escalar aqui, do mesmo jeito, e não deu. Insistir igual não muda nada — por outro caminho, com ajuda de alguém, com uma ferramenta que você não usou, dedicando bem mais tempo.
A casca escorrega sob seus dedos — o mesmo tronco, a mesma lisura. Você desce sem ver a estrada. Lá embaixo, os três goblins dobram a curva; um assovia e aponta. Suas mãos agora seguram a faca e a corda de três nós que alguém deixou no seu caminho.
BTNS: ["1","Pessoas — o mundo começou a guardar quem você conhece.","Mercado — há quem venda por aqui.","goblins","Aceitar: levar um embrulho sem perguntar Klaus conta com você · 5 min","+6 ofertas"]

```

### Parte 2 (`?mestre=0`)

Só as jogadas escritas (o resto da Parte 2 foi tela, descrito na seção 4: abrir livro, bolsa, banca e mapa, comprar, vender, equipar, partir). A partida começou na abertura de Forte Seco, narrada pelo jogo.

```
>>> vou dar uma volta pela praça e ver quem vende o quê, procuro uma banca de mercado
Ir até o Bazar do Enforcado
«vou dar uma volta pela praça e ver quem vende o quê, procuro uma banca de mercado»
5 min
Reescrever
BTNS: ["DAGNY VENTOFORTE Ladino · nível 1 14","MEREK CINZA-ANTIGA Caçador · nível 1 14 9","FORTE SECO","Pessoas — o mundo começou a guardar quem você conhece.","Guilda — há uma casa com sede aqui, e dá para bater na porta.","Ir até o Bazar do Enforcado «vou dar uma volta pela praça e ver quem v","Reescrever"]

>>> @click:^Ir · 
O BAZAR DO ENFORCADO
vou dar uma volta pela praça e ver quem vende o quê, procuro uma banca de mercado
Percepção. Precisa de 13. Se falhar, o tempo se vai e o lugar fica remexido.
Falar com Guarda de couraça
Explorar Veio Corvos
Rolar d20 + 4
Percepção
precisa de 13
Mudar de ideia
DIA · 08:05
BTNS: ["DAGNY VENTOFORTE Ladino · nível 1 14","MEREK CINZA-ANTIGA Caçador · nível 1 14 9","O BAZAR DO ENFORCADO","Pessoas — o mundo começou a guardar quem você conhece.","Guilda — há uma casa com sede aqui, e dá para bater na porta.","Falar com Guarda de couraça","Explorar Veio Corvos","Rolar d20 + 4 Percepção precisa de 13","Mudar de ideia"]

>>> chego em Porto Clara e olho a vila ao redor, procurando um lugar pra descansar
PORTO CLARA
chego em Porto Clara e olho a vila ao redor, procurando um lugar pra descansar
Fim da estrada: depois de 0.5 dias de marcha e 20 km, você chega a Porto clara.
Porto clara aparece de cima da última ladeira: paliçada baixa, uma rua só, o mar cinza-azulado espremido contra o cais. O portão range quando você passa, e uma mulher com um cesto de peixe desvia o olhar.
A praça tem um poço, um pelourinho e a taverna O Monge da Última Noite, com a porta aberta e cheiro de pão assado. Na frente, um banco de pedra e um cão magro que dorme ao sol.
Merek estala o pescoço. "Aqui serve." E aponta o banco com o queixo.
+17 XP · um lugar por onde você nunca tinha passado
Partir para Forte Seco
DIA · 12:10
BTNS: ["DAGNY VENTOFORTE Ladino · nível 1 14","MEREK CINZA-ANTIGA Caçador · nível 1 14 9","PORTO CLARA","Pessoas — o mundo começou a guardar quem você conhece.","Guilda — há uma casa com sede aqui, e dá para bater na porta.","Mercado — há quem venda por aqui.","Partir para Forte Seco"]

```
