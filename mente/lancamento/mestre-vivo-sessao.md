# O Mestre vivo, jogado: sessão A × B (commit 9a07609)

Sessão jogada em 19/11/2026 contra o commit `9a07609`, num Chrome headless dirigido por CDP, com narração real (o `/api` do dev-server vai à produção). Duas abas, dois perfis de navegador. **B** = `?mestre=1` (o Mestre novo); **A** = `?mestre=0` (o Mestre de hoje, controle). Eu não alterei nenhum arquivo do jogo.

**Como o controle foi montado (desvio do roteiro, e por quê).** Em vez de criar duas campanhas sorteadas (que dariam heróis e mundos diferentes e tornariam as 15 frases incomparáveis), criei a campanha em B, joguei a primeira cena e o deslocamento até Bateria Alta, e **copiei o localStorage do save para o perfil A** (com a chave do Mestre em «0»). Resultado: A e B partem **do mesmo ponto exato** (mesmo herói, Gareth, ladino goliath; mesmo mundo, Baía do Enforcado; mesma cena, o soldado no portão de Bateria Alta, Aldric ao lado). As 15 frases pareadas começam aí. Por isso, a 1ª frase de B («oi, vou falar com a Helga…», que virou uma viagem) **não** entra no pareamento. A cena de abertura foi gerada uma vez (em B) e é comum às duas.

**Custo:** cerca de 52 chamadas de narração (limite 60). B: 33 ações de jogador (37 narrações), A: 15 ações (15 narrações). Contei «turno» como uma ação do jogador que o jogo resolveu; clicar «Rolar», «Reescrever» ou confirmar uma viagem não conta como turno novo. Não houve luta em nenhuma sessão (um «Atacar» chegou a ser oferecido por engano; não confirmei).

**Limites desta medição, ditos de antemão:** é **uma** partida de cada lado, com um jogador só (eu). Os números abaixo dizem o que aconteceu nesta mesa, não uma taxa estável. O mundo de A e o de B divergem depois da 1ª frase (a IA narra diferente), então o pareamento é de *frase*, não de *cena*.

---

## 1. Tabela-resumo, A × B

Duas colunas para B: as **15 frases pareadas** (comparáveis com A) e a **sessão inteira** de B.

| medida | A (15 pareadas) | B (as mesmas 15) | B (sessão inteira, 33 turnos) |
|---|---|---|---|
| turnos fora de luta | 15 | 15 | 33 |
| turnos com dado (qualquer origem) | 4 (27%) | 5 (33%) | 9 (27%) |
| dados que julguei **certos** | 3 | 5 | 6 |
| dados **indevidos** (banais ou que não casaram com o que aconteceu) | 1 (o «mundo responde» num pedido de desconto: rolou 48 contra 40%, e o castigo, um guarda com uma carta, não tinha nada a ver com o desconto) | 0 | 3 |
| ações sem dado que **mereciam** (omitidos) | 6 | 5 | 13 |
| dados **espontâneos** (o mundo provocou, eu não pedi ação de risco) | 1 | 0 | 2 (mais 1 «mundo responde» colado a uma pergunta minha) |
| conversas com dado **e preço dito** («Se falhar…») | 0 de 1 (o dado veio com «dificuldade 16», sem a frase do preço) | 3 de 3 | 3 de 4 |
| perguntas respondidas sem dado | 4 | 4 | 7 |
| PT-PT («tu», «teu», «sabes»…) | 0 | 0 | 3 turnos (4 ocorrências) |

**Contagem dos 15 pareados, uma a uma** (D = dado pedido; `-` = sem dado):

| # | frase | A | B |
|---|---|---|---|
| 1 | oi soldado, to procurando a Helga… | - | - |
| 2 | pergunto o que ta acontecendo nesse forte | - | - |
| 3 | minto que sou inspetor da coroa | D Enganação 16 (passou) | D Enganação 16 (falhou por 1) |
| 4 | vou tentar sair sem ninguem ver | - | D Furtividade 15 (passou) |
| 5 | olho em volta procurando algo escondido | D Percepção 13 (falhou) | - (achou faca e mapa sem rolar) |
| 6 | posso pedir um desconto? | «mundo responde» 40% (falhou) | D Persuasão 18 (falhou) |
| 7 | ameaço o primeiro que aparecer | - | D Intimidação 16 (passou) |
| 8 | vou forçar a fechadura | - | D Arrombamento 15 (falhou) |
| 9 | converso com o Aldric | - | - |
| 10 | vou até o mercado | - | - |
| 11 | pergunto ao vendedor… e peço desconto | (viagem) → reescrito: - | (viagem) → reescrito: - |
| 12 | reviro o lixo atrás da banca | - («já tentou aqui») | - («nada que preste», sem rolar) |
| 13 | vou escalar o muro | D Atletismo 15 (falhou, caiu: 2 de dano) | - (escalou sem rolar) |
| 14 | tento roubar a bolsa de um bêbado | - (roubou) | - (roubou) |
| 15 | saio da cidade pela estrada | - | - |

Observação direta: **nos 15 pareados o Mestre novo não pediu *mais* dado que o de hoje de modo relevante (5 contra 4); pediu em lugares diferentes.** O novo ganhou nas frases sociais e de furtividade/arrombamento (3, 4, 6, 7, 8) e perdeu nas de busca e escalada (5, 13), onde o de hoje pediu e ele não. E em **duas das frases de risco mais óbvias (13 escalar um muro, 14 roubar bolsa de bêbado)** o novo narrou o sucesso sem rolar nada.

---

## 2. As 15 frases iguais, lado a lado

**1. «oi soldado, to procurando a Helga. sabe onde ela ta?»**
- A: o soldado aponta para dentro; você já desce e fala com Helga. Sem dado.
- B: idem, e o soldado ainda sussurra «aqui não se pergunta onde ela está; diz-se que se tem recado para dar». Sem dado. Empate; B deu uma fala melhor.

**2. «pergunto o que ta acontecendo nesse forte, to meio perdido»**
- A: Helga fala do forte e pergunta «procurando a milícia ou o que ela esconde?». B: fala de pólvora molhada e **já puxa o assunto Astrid**. Sem dado nos dois. B conduz melhor a trama.

**3. «minto que sou inspetor da coroa e mando liberar a passagem»**
- A: «enganar Helga — dificuldade 16 (um favor que lhe custa pouco, desconhecido). Seu bônus: +2 treinado». Rolou 18+2=20, passou; aparece «Refazer · gasta 1 de 1» e um botão CONTINUAR. Sem a frase do preço.
- B: «Enganação. Precisa de 16. **Se falhar, a resposta é não, e pedir igual não muda nada.**» Rolou 13+2=15, falhou por um. A fala de Helga depois do fracasso é ótima («você não tem nem uma tinta de carimbo»).
- **O preço dito antes do dado é a melhor mudança de B.** Em A o jogador não sabe o que perde.

**4. «vou tentar sair sem ninguem ver»**
- A: **sem dado**; narrou «nenhum passo, nenhum olhar» e já introduziu um soldado conversando.
- B: Furtividade 15, «**Se falhar, alguém na rua vê você onde não devia**». Rolou 19, ficou «Escondido» (um selo apareceu no alto da tela). B certo.

**5. «olho em volta procurando algo escondido ou util»**
- A: Percepção 13, «Se falhar, o tempo se vai e o lugar fica remexido». Rolou 5, falhou, o lugar ficou remexido e o soldado reclamou. A certo, e o preço doeu.
- B: **sem dado.** Já narrou «um mapa meio rasgado e uma faca de bom aço» achados de graça. Omissão.

**6. «posso pedir um desconto pra quem vende por aqui?»**
- A: **sem dado de perícia**; respondeu «Não, mas…» e rolou escondido um «O MUNDO RESPONDE · 48 · chance 40% · falhou», cuja consequência foi um guarda entregando uma carta, sem relação com desconto. Indevido.
- B: Persuasão 18 (d20, sem bônus: difícil para um ladino), «a resposta é não». Rolou 5, falhou. Certo, mas o resultado narrado ignorou o desconto e foi para outro assunto.

**7. «ameaco o primeiro que aparecer: me conta o que sabe ou vai se arrepender»**
- A: **sem dado.** Corwin cospe o palito, ameaça de volta, a cena segue. Omissão.
- B: Intimidação 16, «a resposta é não». Rolou 16+3=19, passou. Mas a narração do sucesso foi estranha: o soldado chega, Helga mente por você, e ninguém responde à ameaça.

**8. «vou forcar a fechadura da primeira porta que encontrar»**
- A: **sem dado.** Nenhuma fechadura aconteceu; a cena virou conversa. Omissão (e a ação sumiu).
- B: Arrombamento 15, «Se falhar, a fechadura emperra e o tempo corre». Rolou 6, falhou, e a falha vira «já são dois num só turno» (consequência com tensão). Certo.

**9. «converso com o Aldric sobre o que ele acha de tudo isso»** — sem dado nos dois, e certo. As falas de Aldric nos dois lados são boas e curtas.

**10. «vou ate o mercado ver o que tem pra comprar»** — sem dado nos dois, e certo. B mostrou a banca («Tônico Revigorante, Dente grande demais…»); A deu um mercado genérico.

**11. «pergunto ao vendedor sobre Astrid o Andarilho e peco desconto»**
- Nos **dois** lados o jogo leu a frase como uma ordem de viagem («Ir até Sala das Cartas», porque «Astrid» é um lugar-pessoa) e **perdeu a metade «peço desconto»**. Precisei de «Reescrever» nos dois. Defeito comum, não do Mestre novo.
- Reescrito («pergunto ao anão da Bigorna de Ferro se ele faz um desconto»): sem dado nos dois. B: «traga o dente de um Lobo Atroz e eu corto três peças». A: «o ferro da Bigorna não barateia». Pedir desconto **sem rolar** é o buraco: nenhum dos dois pediu Persuasão aqui, embora B tenha pedido na frase 6.

**12. «reviro o lixo atrás da banca atrás de qualquer coisa»**
- A: «você já tentou vasculhar o lugar aqui, do mesmo jeito, e não deu» (a trava de repetição pegou, porque A já tinha procurado no forte; uma trava global, não do lugar).
- B: «cinzas de carvão, um pano sujo, uma corda… nada que preste». Sem dado. Mesmo resultado nos dois: nada, sem rolar. Honesto, mas a mesa não *sentiu* a busca.

**13. «eu vou escalar o muro do forte pra espiar de cima»**
- A: Atletismo 15, «Se falhar, você despenca lá de cima». Rolou 12, caiu, **2 de dano e «Caído»**. O preço foi cobrado de verdade (a perda de PV, 12/14).
- B: **sem dado.** «Você escala a muralha interna com Aldric logo atrás» e, de graça, vê Helga desenrolando um mapa. **A omissão mais clara da sessão:** uma escalada com preço real (queda) narrada como passeio.

**14. «tento roubar uma bolsa de moedas do bolso de um bebado»** — **sem dado nos dois**, e roubou nos dois («a bolsa pesa na sua palma»). Nenhum pediu Furtividade/Prestidigitação. Empate no pior sentido: **o furto foi um ato garantido.** É a frase-teste mais óbvia da sessão e nenhum Mestre acertou.

**15. «saio da cidade pela estrada»** — sem dado nos dois, certo.

---

## 3. O veredito de jogador

**Mais mesa de RPG, igual ou pior?** *Um pouco mais mesa nos momentos sociais, igual no resto, e pior em dois pontos específicos.*

- **Melhor:** a *frase do preço* («Se falhar, a resposta é não, e pedir igual não muda nada»). Isso é o que uma mesa tem e A não tem: antes de rolar eu sei o que arrisco, e quando falho o jogo cobra exatamente isso. As duas rolagens sociais de B que falharam (frases 3 e 6) doeram e foram *aceitáveis* porque eu sabia. Em A, o dado de Enganação veio com a explicação «dificuldade 16 (um favor que lhe custa pouco…)», mas sem dizer o que se perde.
- **Melhor:** B pediu dado em furtividade (4) e arrombamento (8), e o Mestre antigo não. Foram os dois dados que mais pareceram «jogo».
- **Pior:** B **não** pediu dado onde A pediu (a busca da frase 5 e a escalada da 13). Eu esperava que o novo cobrisse tudo o que o antigo cobria; não cobriu.
- **Pior, e é o que mais pesa:** nas conversas longas e nos pedidos finais (barganha, mentira, ameaça), B quase nunca rolou. Na segunda metade da sessão (frases 19 a 35), eu **menti** duas vezes, **barganhei** duas vezes, **ameacei** uma vez com a faca na mão, e **me esgueirei** perto de um tropeiro. **Nenhum teve dado.** Todas deram certo, todas imediatamente, todas sem custo. A mesa parecia um conto em que o herói sempre acerta.

**A mesa ficou vazia de dado?** Sim, em dois trechos de B:

1. **Frases 9 a 15** (conversar com Aldric, ir ao mercado, perguntar ao vendedor, revirar lixo, escalar o muro, roubar, sair da cidade): **7 turnos seguidos sem nenhum dado**, incluindo escalar e roubar.
2. **Turnos 22 a 31** (a conversa de insistência com Astrid, a decisão de partir, a ronda de emboscada, a busca nas pedras, a pergunta ao Aldric, a mentira ao tropeiro, a barganha, o esgueirar para a carroça): **9 turnos seguidos sem dado**, a mais longa. Dentro desse trecho houve ameaça, mentira, barganha e furtividade, tudo de graça.

A régua da casa é «um dado a cada dois ou três turnos fora da luta». B teve 9 dados em 33 turnos (um a cada 3,7), mas distribuídos em **blocos** (cinco no começo, três quando cheguei a Sala das Cartas, e um na estrada) em vez de espalhados: cumpre a média e falha o ritmo.

**O dado, quando veio, pesou?** Sim, e este é o ponto forte de B. O «Precisa de N. Se falhar, …» antes do clique cria tensão; a bandeja mostra o d20, o bônus e «precisa de 16 ✕ falhou». O que enfraqueceu o peso foi o que veio *depois*: duas vezes (turnos 17 e 18) a narração do resultado **não casou** com o que o dado julgava (ver defeitos 1 e 2). Um dado que falha e produz um achado de 168 moedas ou um assalto a uma mesa que eu não toquei destrói o peso.

---

## 4. Os 10 momentos mais instrutivos

**Bons**

1. **«minto que sou inspetor da coroa e mando liberar a passagem»** → «Enganação. Precisa de 16. Se falhar, a resposta é não, e pedir igual não muda nada.» Rolei 13+2=15, falhei por um, e Helga respondeu «você não tem nem uma tinta de carimbo». O exemplo do que o Mestre novo faz melhor do que qualquer coisa. (Captura MV-B01.)
2. **«vou tentar sair sem ninguem ver»** → Furtividade 15, «Se falhar, alguém na rua vê você onde não devia». Rolei 19, ganhei o selo «Escondido» no alto da tela. O dado entrou na tela *como estado*, não só como número.
3. **«vou forcar a fechadura da primeira porta que encontrar»** → Arrombamento 15, rolei 6, e a falha virou «já são dois num só turno», com uma segunda chegada (o soldado) e Helga tensa. A falha *empurrou a história*.
4. **«Aldric, o que voce sabe sobre essa Alma de Gellyn…?»** → Aldric responde em personagem («paga bem e some… gente que paga por cabeça não deixa rastro na areia»), sem dado, e certo. Pergunta de companheiro não precisa de dado, e o jogo sabe.
5. **«sigo viagem com Astrid ate Ossuario Prata Podre»** → o jogo mostrou o veredito *antes*: «☠ Impossível — não é difícil, é impossível: nada do que você tem alcança isto… 218 km, 7,5 dias». O «veredito antes do clique» no seu melhor: me poupou uma viagem de 7 dias contra um lugar fechado.

**Ruins**

6. **«eu vou escalar o muro do forte pra espiar de cima»** → B: escalou, viu Helga e o mapa, **sem rolar**. A, na mesma frase, rolou Atletismo e eu caí (2 de dano). O Mestre novo regrediu aqui.
7. **«tento roubar uma bolsa de moedas do bolso de um bebado»** → «a corda cede como se nunca tivesse sido amarrada». Roubo garantido, sem Furtividade, nos dois Mestres.
8. **Chegada à Sala das Cartas** (nada que eu tenha feito além de confirmar uma viagem) → apareceu um dado de Percepção **espontâneo**; rolei 6+2=8, e a narração do fracasso foi: «**Você revira a mesa, as gavetas e o baú de Astrid com pressa**… Isso não se faz numa casa de cartas». Eu **nunca** disse isso. O dado espontâneo + um texto de resultado «buscar» atribuiu ao herói uma ação que ele não fez e que ofendeu a pessoa que ele queria como cliente. (Captura MV-B03.)
9. **Turno 17, na estrada** → dado de Percepção espontâneo (Astrid fala de trás de um rochedo; «Percepção 13»). Falhei por 2, e o resultado foi «**achado: moedas antigas, 168 moedas**» (+ conquista «Bolso Cheio»). Falhar *pagou*. E a Astrid de trás do rochedo **não existia** para o motor: quando fui falar com ela, o jogo disse «Astrid o Andarilho não está aqui — anda em Sala das Cartas». O Narrador inventou uma presença que o sistema desconhece. (Capturas MV-B02.)
10. **«pago as dez pecas e assino. depois digo que quero ouvir o que ela tem pra me contar»** → depois do preview de pagamento (bom), veio **Percepção 13 para ouvir uma pessoa que fala comigo**; falhei, e o texto foi «você ouve pedaços sem sentido» (enquanto a mesma resposta contou, em seguida, a fala inteira de Astrid). Dado para algo banal, e uma falha que o texto desmente na linha seguinte.

---

## 5. Defeitos, do mais grave ao menos

1. **(Grave, B) O Narrador atribui ao herói ações que o jogador não escreveu.** Resultado de um dado de Percepção espontâneo na Sala das Cartas virou «você revira a mesa, as gavetas e o baú de Astrid». Estraga a cena, o relacionamento e a confiança do jogador. Turno B-18f. *(O mesmo mecanismo no turno 17 produziu «achado» no lugar de «ouvir a voz».)*
2. **(Grave, B) O resultado do dado não corresponde à pergunta do dado.** Os três dados de Percepção «espontâneos» (estrada, chegada, «ouvir») reaproveitam o texto de **busca** («Você revira o que dá e não encontra… o lugar fica remexido»; «Se falhar, o tempo se vai e o lugar fica remexido») para situações que não são busca. O catálogo parece só ter o molde de busca para Percepção. A falha *paga* (168 moedas) em vez de custar.
3. **(Grave, B) Contradição Narrador × sistema.** O Narrador pôs Astrid «atrás de um rochedo» na estrada; o motor diz que Astrid está em Sala das Cartas (a 5 min dali). Uma fala narrada de personagem que o estado do mundo nega. A régua da casa («o Narrador não inventa; o sistema sabe») foi violada pelo texto.
4. **(Médio-grave, os dois) Frase com nome próprio vira viagem.** «pergunto ao vendedor sobre Astrid… e peço desconto» → «Ir até Sala das Cartas»; «antes de assinar… falando que a Helga vai dar uma boa palavra» → «Ir até Bateria Alta»; «chamo Astrid… sou amigo da Helga» → «Partir para Recife Funda»; «oi, vou falar com a Helga» → «Ir até Bateria Alta». Quatro vezes, o nome de uma pessoa ou lugar dentro de uma frase *sobre outra coisa* roubou a frase inteira. O jogador escrevendo livremente perde o que disse e tem de reescrever (usei «Reescrever» 6 vezes ao todo). A viagem sugerida é mostrada com motivo antes de acontecer, o que atenua. O defeito existe nas duas sessões.
5. **(Médio, os dois) Ações de risco claro sem dado:** furto (os dois), escalada (B), arrombamento e ameaça (A), furtividade (A). Em B, a segunda metade da sessão tem 13 omissões (barganhar, mentir, ameaçar, esgueirar, vasculhar emboscada). O catálogo parece julgar **só pela frase isolada** e quase sempre responde «não precisa»: a mesma barganha («desconto») rolou na frase 6 e não rolou na 11 nem na 30. **Inconsistência de critério**: o mesmo pedido, ora com dado, ora sem.
6. **(Médio, B) «Atacar Guarda da adaga»:** a frase «se a mulher não largar meu punho eu corto o braço dela» foi lida como atacar um alvo chamado «Guarda da adaga», que é o nome do **item** (a adaga de guarda que Aldric me deu). O botão «Atacar» abriria uma luta contra um alvo inexistente. Não confirmei. (Captura MV-B05.)
7. **(Médio, B) Ritmo em blocos:** 7 e 9 turnos seguidos sem dado; ver o veredito.
8. **(Médio, B) Dado para algo banal:** «ouvir» uma pessoa que está falando comigo; e Percepção para «reparar» em alguém que acabou de falar.
9. **(Leve, B) PT-PT escapando na narração:** «Assina **teu** nome», «**teu** silêncio», «o que **sabes** de Bateria Alta», «**tua** garganta», «**tua** irmã», «Larga». Em A não vi nenhum nos 15 turnos. A lei da casa é «você», nunca «tu».
10. **(Leve, os dois) Continuidade do Narrador:** Helga aparece em duas cenas ao mesmo tempo («Helga, que te ensinou o ofício» na bancada do mercado, quando ela estava no forte); «a noite engole o posto da estrada» às 13:14; um «mensageiro na porta do forte» num texto que dizia que eu já saíra da cidade; Isolde fala no lugar de Astrid na Sala das Cartas. Nomes de pessoas trocados (Corwin / Edric Guarda-Portão é soldado e é anão ao mesmo tempo, em A).
11. **(Leve, B) Pedido de pagamento:** a confirmação «Pagar ◉ 10» mostra o veredito antes (bom), mas o clique duplo (cartão, depois botão «Pagar · ◉ 10») é lento, e meu primeiro script travou numa segunda leitura do mesmo botão; aqui pode ser só o meu driver.
12. **(Leve, B) A salvo-conduto foi comprado e a quest continuou «Ouvir Astrid o Andarilho»**; o painel «O salvo-conduto» não reagiu à compra.
13. **(Observação, A) O dado de A tem mais interface** (Refazer, vantagem, CONTINUAR, salvaguarda e dano de queda: «2 de dano — 4 m de queda · Caído»). O dado de B é mais limpo e mais rápido (um clique, resultado na bandeja) e **não tem «Refazer»**; é uma diferença de sensação, não de erro.

**Dados espontâneos de B**, para o registro: (a) na estrada, o «Percepção 13» da voz atrás do rochedo (d20, 9, falhou); (b) na chegada à Sala das Cartas, «Percepção 13» (d20, 6, falhou); (c) Percepção ao «ouvir» (d20, 7, falhou). E o «mundo responde 58%» (passou, 32) numa pergunta minha de espiar. **Os três dados de Percepção de B falharam** (os dois espontâneos e o do «ouvir»); nada que eu tenha feito pedia esses dados, e nenhum soou como «o mundo me provocou». Soaram como o jogo me empurrando para um «a ação que você não fez fracassou».

**Capturas** (em `mente/lancamento/capturas/`): `MV-B01-mentira-com-preco.png` (conversa com preço dito), `MV-B02-percepcao-espontanea.png` (dado espontâneo na estrada), `MV-B03-dado-na-chegada.png` (dado espontâneo na chegada), `MV-B04-busca-sem-dado.png` (busca nas pedras sem rolar, «nada escondido»), `MV-B05-atacar-alvo-errado.png` («Atacar Guarda da adaga»).

---

## 6. Transcrição completa

Convenção: `[B-NN]` ou `[A-NN]` é o arquivo do turno; a frase vai em código; as linhas citadas são as linhas **novas** que apareceram na tela depois da ação (a narração, os cartões de dado, o resultado). Os sufixos: `a`/`b` = cliques em botões de confirmar/rolar, `r` = «Reescrever», `c`/`d`… = continuação. A narração de cada turno repete trechos da anterior no DOM; filtrei as repetições.

### Sessão B (`?mestre=1`)

**[B-01]** (leitura)
> GARETH
> Ladino · nível 1
> 14
> ALDRIC ROMPE-ESCUDOS
> Caçador · nível 1
> 12
> 9
> O SALVO-CONDUTO
> Ouvir Astrid o Andarilho
> PISTAS · 0 DE 1
> BAÍA DO ENFORCADO
> A lei deste mundo: O sangue nobre manda e o dinheiro compra: um plebeu rico vale mais que um cavaleiro pobre, mas nunca diante do rei.
> Pessoas — o mundo começou a guardar quem você conhece.
> Guilda — há uma casa com sede aqui, e dá para bater na porta.
> Baía do Enforcado cheira a sal, peixe seco e alcatrão.
> O cais de pedra se estende sob névoa, e cada prancha range sob seus passos. Um sino de bóia toca ao longe, lento. Aqui o mar manda: a cidade vive do que se planta nas encostas e do que se troca no porto. Um fiscal de milícia, rosto de quem já viu naufrágio, pendura no seu pulso uma medalha de cobre de visitante. 'Devolve na saída. Perder custa cinco peças.'
> Aldric Rompe-Escudos desce atrás de você, o arco nas costas, os olhos varrendo as ruas estreitas. Há seis anos vocês dividem estrada, pão e perigo.
> Dizem que a guarda fechou a estrada para Ossuário Prata Podre. Ninguém fala disso sem baixar a voz. Os dois últimos que tentaram escoltar Astrid o Andarilho voltaram num carro de bois, os rostos virados para o céu. Ele precisa chegar a Recife Funda antes da lua nova, e carrega na cabeça o que sabe sobre a mão que guarda Trapiche do Sal.
> Você ainda não o encontrou. A praça fica adiante, e a Sereia Rouca abre as portas para o primeiro freguês.
> Ir até Bateria Alta
> «oi, vou falar com a Helga. posso pedir um quarto barato pra hoje?»
> 5 min
> Reescrever
> DIA · 08:00
> 10
> rações
> 10
> água
> 5
> tochas
> 15
> moedas

**[B-01b]** `@Ir · 5 min`
> BATERIA ALTA
> Baía do Enforcado cheira a sal, peixe seco e alcatrão. O cais de pedra se estende sob névoa, e cada prancha range sob seus passos. Um sino de bóia toca ao longe, lento. Aqui o mar manda: a cidade vive do que se planta nas encostas e do que se troca no porto. Um fiscal de milícia, rosto de quem já viu naufrágio, pendura no seu pulso uma medalha de cobre de visitante. 'Devolve na saída. Perder custa cinco peças.'
> Você sobe a ladeira de pedras gastas até o portão de Bateria Alta. O forte fica no ponto mais alto da cidade, com muralhas baixas e canhoneiras viradas para o mar. Um soldado de milícia, elfo de olhos claros e farda surrada, observa você se aproximar. Ele desvia o olhar, depois pergunta:
> — Negócio com a artilharia, forasteiro? Aqui não é lugar de quem não foi chamado.
> Aldric para ao seu lado, o arco nas costas, e cruza os braços.
> Atrás do soldado, uma escada de pedra desce para o interior do forte, onde se ouve o som abafado de martelos.
> Mercado — há quem venda por aqui.
> Você sobe a ladeira de pedras gastas até o portão de Bateria Alta. O forte fica no ponto mais alto da cidade, com muralhas baixas e canhoneiras viradas para o mar. Um soldado de milícia, elfo de olhos claros e farda surrada, observa você se aproximar. Ele desvia o olhar, depois pergunta:
> Falar com Helga
> Explorar Ossuário Prata Podre
> Procurar Astrid o Andarilho
> DIA · 08:05

**[B-02]** (leitura)
> 1
> oi soldado, to procurando a Helga. sabe onde ela ta?
> Helga está aqui — Bateria Alta.
> O soldado elfo desvia o olhar para a escada que desce ao interior do forte, depois volta para você.
> — Helga? A artilheira. Deve estar na plataforma dos canhões, conferindo pólvora e ferro. Última porta à esquerda, depois da escada. E, forasteiro... — ele baixa a voz e os olhos claros endurecem — aqui não se pergunta onde ela está; diz-se que se tem recado para dar.
> Você desce a escada de pedra, Aldric atrás de você com passos medidos. O corredor cheira a pedra molhada e corda. A porta à esquerda está entreaberta, e de dentro vem um riso baixo, seco, que termina antes da frase.
> Helga está sentada numa caixa de munição, as mãos sujas de carvão, e quando o vê, pergunta sem levantar a voz:
> — Trouxe o que me pertence, ou veio só para olhar como se pergunta por mim neste forte?"
> quem ensinou a canção ao herói
> +17 XP · um lugar por onde você nunca tinha passado
> Ir até Sala das Cartas

**[B-03]** `pergunto o que ta acontecendo nesse forte, to meio perdido`
> pergunto o que ta acontecendo nesse forte, to meio perdido
> Helga termina de limpar as mãos num trapo e fecha a porta com o pé, sem tirar os olhos de você.
> — Está acontecendo o de sempre: pólvora molhada, canhões que não atiram e um capitão que acha que a maré vai esperar. Mas você não veio perguntar do forte. Veio perguntar da estrada, e eu sei do que falam.
> Ela se senta numa caixa de munição, puxa um frasco de aguardente e toma um gole seco antes de oferecer.
> — Astrid o Andarilho. Não é o primeiro que me procura por causa dele. Só que ninguém pergunta o que ele carrega além do mapa. Pergunta errada.
> Ela deixa a frase a meio, olhando para a porta como se esperasse que alguém entrasse.
> +17 XP · uma conversa que ficou
> +3
> ofertas
> DIA · 08:10

**[B-04]** `minto que sou inspetor da coroa e mando liberar a passagem`
> minto que sou inspetor da coroa e mando liberar a passagem
> Enganação. Precisa de 16. Se falhar, a resposta é não, e pedir igual não muda nada.
> Rolar d20 + 2
> Enganação
> precisa de 16
> Mudar de ideia

**[B-04b]** `@Rolar d20`
> Helga inclina a cabeça, e o riso morre antes de nascer.
> — Inspetor da coroa. O peito estufa, a voz enche. Eu já vi quem manda de verdade. Vocês falam fino e andam com escolta. Você não tem nem uma tinta de carimbo.
> Ela cruza os braços, as mãos sujas de carvão marcando o linho.
> — A passagem não se liberta com palavra. E se eu falar por você e der errado, a próxima maré me põe na forca. Não pago esse preço por um estranho.
> De um canto, Aldric assovia baixo: "Amizade é coisa que o mar semeia; colhe-se com o tempo, não com a língua."
> Ir até Sala das Cartas
> +3
> ofertas
> 13
> ✕
> ENGANAÇÃO
> 13 + 2 = 15
> precisa de 16 — ✕ falhou
> DIA · 08:15

**[B-05]** `vou tentar sair sem ninguem ver`
> vou tentar sair sem ninguem ver
> Furtividade. Precisa de 15. Se falhar, alguém na rua vê você onde não devia.
> Rolar d20 + 9
> Furtividade
> precisa de 15
> Mudar de ideia
> ENGANAÇÃO · 13 + 2 = 15 · PRECISA DE 16

**[B-05b]** `@Rolar d20`
> Escondido
> Você está escondido (furtividade 19).
> Helga ergue os olhos no instante em que a porta range ao fechar, mas você já está na sombra do corredor, e o olhar dela passa por cima sem encontrar. Ninguém vê, ninguém ouve. Aldric assovia baixo, como se falasse com o vento. Você desliza até a escada, e o mundo atrás fica para trás.
> +17 XP · o que você tentou, conseguiu
> Ir até Sala das Cartas
> +4
> ofertas
> ✓
> FURTIVIDADE
> 10 + 9 = 19
> precisa de 15 — ✓ passou
> DIA · 08:20

**[B-06]** `olho em volta procurando algo escondido ou util`
> olho em volta procurando algo escondido ou util
> A porta atrás de você range de leve, e Helga começa a trautear — a melodia é sua, mas o verso que ela canta é outro: um que você nunca ouviu. Ela não o explica. Você desvia o olhar, e a sombra do corredor esconde um vulto: sobre um caixote, um mapa meio rasgado e, ao lado, uma faca de bom aço cravada na madeira. Duas coisas que não deviam estar juntas, e as duas pesam.
> FURTIVIDADE · 10 + 9 = 19 · PRECISA DE 15
> DIA · 08:30

**[B-07]** `posso pedir um desconto pra quem vende por aqui?`
> posso pedir um desconto pra quem vende por aqui?
> Persuasão. Precisa de 18. Se falhar, a resposta é não, e pedir igual não muda nada.
> Rolar d20
> Persuasão
> precisa de 18
> Mudar de ideia

**[B-07b]** `@Rolar d20`
> Você se esquiva na sombra do corredor, mas a porta da Bateria Alta range atrás, e Helga aparece, a faca na bainha e o mapa rasgado na mão. Ela assovia baixo, e o som corta o silêncio como lâmina. — Diga, forasteiro: o que vale mais, a faca que você não pegou ou o mapa que você não leu? Ela espera, o olhar fixo, e a pergunta fica no ar entre vocês.
> — A passagem para Recife Funda não se compra com prata, e Astrid não espera quem se esconde. O que você está disposto a pagar?
> Ir até Sala das Cartas
> +4
> ofertas
> ✕
> PERSUASÃO
> precisa de 18 — ✕ falhou
> DIA · 08:40

**[B-08]** `ameaco o primeiro que aparecer: me conta o que sabe ou vai se arrepender`
> ameaco o primeiro que aparecer: me conta o que sabe ou vai se arrepender
> Intimidação. Precisa de 16. Se falhar, a resposta é não, e pedir igual não muda nada.
> Rolar d20 + 3
> Intimidação
> precisa de 16
> Mudar de ideia
> PERSUASÃO · 5 · PRECISA DE 18

**[B-08b]** `@Rolar d20`
> Assim faz barulho.
> Passos sobem a escada. Um soldado de milícia surge na porta, a mão no punho da espada. Ele vê Helga e a faca, e a voz sai firme: — Está tudo bem, artilheira? Ouvi um barulho.
> Helga desvia o olhar de você, sorri e ergue a faca: — Só afiando a lâmina no caixote. Nada que valha uma subida.
> O soldado hesita, olha o corredor. Não vê você. Aldric prende a respiração.
> Ir até Sala das Cartas
> +4
> ofertas
> 16
> ✓
> INTIMIDAÇÃO
> 16 + 3 = 19
> precisa de 16 — ✓ passou
> DIA · 08:45

**[B-09]** `vou forcar a fechadura da primeira porta que encontrar`
> vou forcar a fechadura da primeira porta que encontrar
> Arrombamento. Precisa de 15. Se falhar, a fechadura emperra e o tempo corre.
> Rolar d20 + 3
> Arrombamento
> precisa de 15
> Mudar de ideia
> INTIMIDAÇÃO · 16 + 3 = 19 · PRECISA DE 16

**[B-09b]** `@Rolar d20`
> ↯ A fechadura emperra com a tentativa malfeita.
> no braço faz barulho.
> Você se agacha na sombra do corredor, mas a porta da Bateria Alta range atrás, e passos sobem a escada. O soldado que desceu antes para no degrau, a mão no punho da espada, e Helga surge à porta com o caderno aberto na mão, três riscos de carvão onde devia haver assinatura. Ela o fecha ao vê-lo, e a voz sai firme: — Já são dois num só turno. Diga rápido o que busca, forasteiro, porque a milícia não sobe por curiosidade.
> O soldado atrás de você pigarreia, e Aldric assovia baixo. Você percebe, sem querer, que Helga esgueirou a mão para o lado do caixote onde a faca esteve cravada.
> Ir até Sala das Cartas
> +4
> ofertas
> 3
> ✕
> ARROMBAMENTO
> 3 + 3 = 6
> precisa de 15 — ✕ falhou
> DIA · 08:52

**[B-10]** `converso com o Aldric sobre o que ele acha de tudo isso`
> converso com o Aldric sobre o que ele acha de tudo isso
> Aldric assovia baixo e cruza os braços, os olhos na sombra do corredor. — Acho que Helga riu antes de terminar a frase, e isso é pior que faca. Em guerra velha, quem ri cedo esconde o punhal cedo. Ele desvia o olhar para a escada, depois para você. — Mas a gente não veio aqui para ler riso alheio. Veio pelo salvo-conduto.
> ARROMBAMENTO · 3 + 3 = 6 · PRECISA DE 15
> DIA · 08:57

**[B-11]** `vou ate o mercado ver o que tem pra comprar`
> vou ate o mercado ver o que tem pra comprar
> Você desce os corredores de pedra de Bateria Alta, atravessa o portão e segue a ladeira até a Feira do Saque. O cheiro de peixe seco e alcatrão pesa no ar, e a praça exibe barracas cobertas por lona raspada. Um marinheiro de ombros largos desvia de você com um aceno distraído. Aldric caminha ao seu lado, os olhos varrendo a multidão.
> — Bigorna de Ferro é o primeiro estande à esquerda. O anão atrás do balcão já tirou o martelo do cinto, mas ainda está sorrindo.
> A banca aberta exibe: Tônico Revigorante, Dente grande demais para ser de bicho comum, Mapa de Estreito do Enforcado e mais dois itens sob lona.
> DIA · 09:02

**[B-12]** (leitura)
> «pergunto ao vendedor sobre Astrid o Andarilho e peco desconto»
> 5 min
> Reescrever

**[B-12r]** `@Reescrever`
> +4
> ofertas
> AGIR

**[B-12c]** `pergunto ao anao da Bigorna de Ferro se ele faz um desconto`
> pergunto ao anao da Bigorna de Ferro se ele faz um desconto
> O anão da Bigorna de Ferro ergue o martelo e aponta para o mapa. — Desconto? Sei. Você me traz o dente de um Lobo Atroz, eu corto três peças. Traz o mapa que eu não tenho, corto mais. Aí o punho aperta. Na bancada, a faca de bom aço cravada no caixote ainda balança, e Helga, que te ensinou o ofício, começa a trautear sua melodia com um verso que você jura que não é o mesmo. Aldric ergue uma sobrancelha.
> — Mercado é mar: o que sobe numa onda, a outra leva.
> quem ensinou a canção ao herói
> DIA · 09:12

**[B-13]** `reviro o lixo atras da banca atras de qualquer coisa`
> reviro o lixo atras da banca atras de qualquer coisa
> Você se agacha atrás da banca da Bigorna de Ferro e revira o lixo: cinzas de carvão, um pano sujo de graxa, uma corda mordida pelo sal. Nada que preste.
> Brigid Pé-Leve, a sacerdote das marés, surge por trás, sem pressa. Para, mede você com olhos de quem paga por cada palavra, e pergunta:
> — Diga-me, forasteiro: quando revira o lixo de um anão, procura alguma coisa ou só quer que ele saiba que você passou por aqui?
> DIA · 09:22

**[B-14]** `eu vou escalar o muro do forte pra espiar de cima`
> eu vou escalar o muro do forte pra espiar de cima
> Você escala a muralha interna de Bateria Alta com Aldric logo atrás. Do alto, o forte se abre: pátio de paralelepípedos, canhões voltados para o mar, e a escada que desce ao paiol. Helga atravessa o pátio, para junto à amurada e desenrola um mapa. O vento levanta a ponta do papel.
> quem ensinou a canção ao herói
> DIA · 09:27

**[B-15]** `tento roubar uma bolsa de moedas do bolso de um bebado`
> tento roubar uma bolsa de moedas do bolso de um bebado
> Você desliza entre as sombras do pátio do forte, os olhos no marinheiro bêbado encostado ao muro. A mão avança leve, os dedos tocam o couro da bolsa. O dono ronca, o queixo caído no peito. Você puxa devagar, e a corda cede como se nunca tivesse sido amarrada.
> Aldric, do alto da escada, vê a cena e não faz som. Os dois lados do pátio continuam quietos, e a bolsa pesa na sua palma.
> DIA · 09:32

**[B-16]** `saio da cidade pela estrada`
> saio da cidade pela estrada
> Você desce a escada do forte e cruza o portão de Baía do Enforcado. Aldric o acompanha, a capa batendo no vento salgado. A estrada serpenteia entre pedras e poças de chuva, e ao longe, a fogueira fria marca o último ponto de passagem. Um mensageiro na porta do forte, sem fôlego, fala do festival de Barra do Sal que terminou em briga. Vocês seguem, e a cidade fica para trás.
> DIA · 09:37

**[B-17]** `vou seguindo a estrada, atento. alguem tem noticia de Astrid? pergunto pro Aldric o que ele sabe do caminho ate Ossuario Prata Podre`
> Ir até o posto da estrada
> «vou seguindo a estrada, atento. alguem tem noticia de Astrid? pergunto pro Aldric o que ele sabe do caminho ate Ossuario Prata Podre»
> 59 min
> Reescrever

**[B-17a]** `@Ir até o posto`
> ·
> fora dos muros, a 59 min a pé
> Ir · 59 min

**[B-17b]** `@Ir ·`
> O POSTO DA ESTRADA
> vou seguindo a estrada, atento. alguem tem noticia de Astrid? pergunto pro Aldric o que ele sabe do caminho ate Ossuario Prata Podre
> A estrada desce entre pedras cobertas de limo e uma névoa rasteira que cheira a sal. Você segue atento, o passo medido, os olhos varrendo o mato. Aldric caminha ao seu lado, o arco atravessado nas costas.
> — Do caminho até Ossuário Prata Podre? — ele repete, e cospe no chão. — A estrada vira trilha, a trilha vira pedra solta, e a pedra solta vira silêncio. Dizem que a milícia pôs correntes no portão e deixou um aviso pregado com prego de navio.
> Ele para e olha para trás, como se a névoa tivesse se mexido.
> — Astrid? Ninguém fala dele sem baixar a voz. Mas eu sei que ele ia trocar de cavalo no posto. Talvez ainda não tenha passado.
> Você nota, perto da fogueira fria, uma marca de bota na lama, recente, virada para o sul. Aldric não disse nada sobre ela. Atrás de vocês, um vulto se mexe entre as pedras, e você prende a respiração. O mato range. Alguém se aproxima pelo lado da estrada, e a mão de Aldric desce para o arco.
> — Espera — ele sussurra.
> O mato range de novo. E então a voz de Astrid, baixa e rápida, vem de trás de um rochedo:
> — Vocês chegaram tarde demais para me achar, e cedo demais para morrer. Fiquem onde estão.
> Percepção. Precisa de 13. Se falhar, o tempo se vai e o lugar fica remexido.
> Rolar d20 + 2
> Percepção
> precisa de 13
> Mudar de ideia
> DIA · 10:41

**[B-17c]** `@Rolar d`
> Olho em volta com atenção.
> Faltaram 2 — e por tão pouco o mundo negocia: você acha, mas o dobro do tempo se foi e ficou tudo fora do lugar.
> Achado: moedas antigas de um reino que não existe mais — ◉ 168 moedas
> Você se agacha junto ao carro de boi tombado, os dedos afundando na terra fofa. Sob a roda apodrecida, um pano se rasga e as moedas escorrem: peças antigas, cunhadas com um rosto que nenhum reino vivo lembra. A poeira sobe, doce de madeira velha. Aldric estremece, mas não olha. Vocês ficaram tempo demais; as tábuas estão fora do lugar, o mato pisado. Alguém que passe verá. Ao longe, um sino de bóia toca.
> — Esconde ou explica — diz Aldric. — As duas custam.
> +168
> Conquista desbloqueada: 🪙 Bolso Cheio — título "Bolso Cheio"
> Você se agacha junto ao carro de boi tombado, os dedos afundando na terra fofa. Sob a roda apodrecida, um pano se rasga e as moedas escorrem: peças antigas, cunhadas com um rosto que nenhum reino vivo lembra. A poeira sobe, doce de madeira velha. Aldric estremece, mas não olha. Vocês ficaram tempo demais; as tábuas estão fora do lugar, o mato pisado. Alguém que passe verá. Ao longe, um sino de bóia toca.
> Ir até Sala das Cartas
> +4
> ofertas
> ✕
> PERCEPÇÃO
> 9 + 2 = 11
> precisa de 13 — ✕ falhou
> DIA · 11:06
> 183

**[B-18]** `chamo Astrid pra sair de tras do rochedo. digo que ja sou amigo da Helga e que vim pra ajudar ele a chegar em Recife Funda. quanto ele cobra pelo salvo-conduto?`
> Partir para Recife Funda
> «chamo Astrid pra sair de tras do rochedo. digo que ja sou amigo da Helga e que vim pra ajudar ele a chegar em Recife Funda. quanto ele cobra pelo salvo-conduto?»
> Reescrever

**[B-18r]** `@Reescrever`
> Ir até Sala das Cartas
> +4
> ofertas
> AGIR

**[B-18c]** `falo com a voz atras do rochedo: aparece, Astrid, sou amigo da Helga. o que voce quer em troca do salvo-conduto?`
> «falo com a voz atras do rochedo: aparece, Astrid, sou amigo da Helga. o que voce quer em troca do salvo-conduto?»
> 5 min
> Reescrever

**[B-18d]** `@Ir até`
> ·
> Astrid o Andarilho não está aqui
> ·
> Astrid o Andarilho anda em Sala das Cartas
> Ir · 5 min

**[B-18e]** `@Ir · 5 min`
> SALA DAS CARTAS
> A Sala das Cartas cheira a cera e sal. Isolde levanta os olhos de um mapa, e Kaelith Sombravinda começa a rir antes de terminar a frase. Astrid o Andarilho dobra uma carta sobre a mesa e olha para você, sem pressa.
> — Você veio escondido — diz ela, baixo. — Mas aqui dentro, a sombra também tem nome.
> Ela puxa uma cadeira com o pé.
> — Senta. Me diga por que eu não deveria chamar a milícia antes de ouvir o que você tem a dizer.
> Você sente a porta atrás de si se fechar. Astrid aponta para a cadeira, sem desviar o olhar.
> cartógrafonavegante aposentadoo protegido
> A Sala das Cartas cheira a cera e sal. Isolde levanta os olhos de um mapa, e Kaelith Sombravinda começa a rir antes de terminar a frase. Astrid o Andarilho dobra uma carta sobre a mesa e olha para você, sem pressa.
> Rolar d20 + 2
> Percepção
> precisa de 13
> Mudar de ideia
> DIA · 11:11

**[B-18f]** `@Rolar d`
> ↯ Você revira o que dá e não encontra — e o lugar fica remexido, o que qualquer um nota.
> Você revira a mesa, as gavetas e o baú de Astrid com pressa, mas a fechadura cede e o conteúdo se espalha pelo chão. Astrid ergue a cabeça, os olhos fixos em você. Kaelith para de rir. Isolde cruza os braços.
> — Isso não se faz numa casa de cartas — diz Astrid, e a voz vem baixa, como quem guarda um segredo. — Agora, diga: o que você veio buscar aqui?
> o protegidonavegante aposentadocartógrafo
> Você revira a mesa, as gavetas e o baú de Astrid com pressa, mas a fechadura cede e o conteúdo se espalha pelo chão. Astrid ergue a cabeça, os olhos fixos em você. Kaelith para de rir. Isolde cruza os braços.
> Aceitar: ver um trabalho e julgá-lo
> Helga conta com você · 5 min
> +3
> ofertas
> 6
> 6 + 2 = 8
> DIA · 11:36

**[B-19]** `desculpa, foi sem querer! sento na cadeira e explico que a Helga me mandou e que quero um salvo-conduto, e prometo pagar bem`
> desculpa, foi sem querer! sento na cadeira e explico que a Helga me mandou e que quero um salvo-conduto, e prometo pagar bem
> Isolde desvia o olhar, como quem perdoa sem querer, e fala baixo: — O banco perto da janela range; senta aí. Helga manda gente até demais, mas nunca sem razão. Eu arrumo o salvo-conduto. Você vai pagar bem e pagar agora.
> Ela puxa um tinteiro, uma pena, e desenha três linhas numa folha grossa.
> — Assina teu nome, forasteiro. E não derruba mais nada.
> A pena espera, vertical, sobre o papel.
> cartógrafoquem ensinou a canção ao herói
> PERCEPÇÃO · 6 + 2 = 8 · PRECISA DE 13
> DIA · 11:41

**[B-20]** `antes de assinar, pergunto quanto custa e tento barganhar pela metade do preco, falando que a Helga vai dar uma boa palavra por mim`
> Ir até Bateria Alta
> «antes de assinar, pergunto quanto custa e tento barganhar pela metade do preco, falando que a Helga vai dar uma boa palavra por mim»
> 5 min
> Reescrever

**[B-20r]** `@Reescrever`
> Aceitar: ver um trabalho e julgá-lo
> Helga conta com você · 5 min
> +3
> ofertas
> AGIR

**[B-20c]** `antes de assinar, pergunto quanto custa e tento barganhar pela metade do preco`
> antes de assinar, pergunto quanto custa e tento barganhar pela metade do preco
> Isolde ergue os olhos da pena sem pressa. — Custa dez peças, mas eu não corto pela metade. Ela desenha uma linha firme sob os três riscos de tinta. — Pago em boa moeda ou não assino. Kaelith solta um riso curto e volta ao mapa. Astrid, sem desviar o olhar, pergunta baixo: — Você veio até aqui para barganhar, ou para me ouvir?
> cartógrafonavegante aposentadoo protegido
> DIA · 11:51

**[B-21]** `pago as dez pecas e assino. depois digo que quero ouvir o que ela tem pra me contar`
> Pagar ◉ 10
> «pago as dez pecas e assino. depois digo que quero ouvir o que ela tem pra me contar»
> ◉ 10
> Reescrever

**[B-21a]** `@Pagar`
> ·
> a bolsa fica com ◉ 173
> Pagar · ◉ 10

**[B-21b]** `@◉ 10`
> pago as dez pecas e assino. depois digo que quero ouvir o que ela tem pra me contar
> Percepção. Precisa de 13. Se falhar, só ouve pedaços, e o tempo passa ali.
> Rolar d20 + 2
> Percepção
> precisa de 13
> Mudar de ideia
> 173

**[B-21c]** `@Pagar ·`


**[B-21d]** `@Rolar d`
> ↯ Você ouve pedaços sem sentido, e encostar ali por tanto tempo é arriscado.
> As dez moedas de prata batem secas sobre a mesa de tábuas largas, e Isolde recolhe cada uma sem erguer os olhos, deslizando o salvo-conduto assinado até os seus dedos. Você tenta apurar o ouvido, caçando o sussurro que corre entre as frestas do assoalho e o canto onde Kaelith apoia os cotovelos, mas o rangido das vigas e a tosse súbita do marinheiro afogam qualquer sentido em murmúrios quebrados; encostar ali tempo demais só faz a poeira arder na garganta.
> Astrid puxa a cadeira para mais perto. 
> — Para sair vivo pelos portões desta ilha, você precisa de mim — diz ela, a voz firme. — Mas o caminho exige que escolha entre carregar quem sabe a rota ou guardar a prata que sobrou na bolsa. As duas coisas não cabem na mesma mão.
> Aceitar: ver um trabalho e julgá-lo
> Helga conta com você · 5 min
> +3
> ofertas
> 7
> ✕
> PERCEPÇÃO
> 7 + 2 = 9
> precisa de 13 — ✕ falhou
> DIA · 11:55

**[B-22]** `aceito te levar. mas antes me conta a verdade: o que voce carrega na cabeca e quem quer te matar?`
> aceito te levar. mas antes me conta a verdade: o que voce carrega na cabeca e quem quer te matar?
> Astrid se inclina sobre a mesa, e a lamparina desenha sombras longas no seu rosto miúdo. — Carrego na cabeça um mapa que ferve como brasa: o canal, a enseada, as correntes que ninguém navegou — e o nome de quem paga para me ver morta. Ela para, e o resto da frase fica preso no ar como a fumaça da lamparina. Kaelith bate uma carta na mesa, Isolde ergue os olhos devagar, e você entende que a pergunta toda ainda não foi feita. — Mas morta eu conto de graça, e você não quer esse desconto — diz ela, baixo.
> o protegidonavegante aposentadocartógrafo
> PERCEPÇÃO · 7 + 2 = 9 · PRECISA DE 13
> DIA · 12:00

**[B-23]** `insisto: sem o nome de quem paga pela sua morte eu nao saio daqui, e se precisar eu seguro essa mesa e te encaro ate voce falar`
> insisto: sem o nome de quem paga pela sua morte eu nao saio daqui, e se precisar eu seguro essa mesa e te encaro ate voce falar
> Astrid prende os olhos nos seus. — Alma de Gellyn, colecionadora e a primeira a pagar por minha cabeça. Ela baixa a voz. — Agora me diga: se a guarda dela nos achar nesta sala, você morre comigo ou me entrega?
> o protegido
> DIA · 12:10

**[B-24]** `te entrego nunca. vamos embora agora, partimos pela estrada rumo ao destino dela`
> Ir até o posto da estrada
> «te entrego nunca. vamos embora agora, partimos pela estrada rumo ao destino dela»
> 59 min
> Reescrever

**[B-24a]** `@Ir até o posto`
> ·
> fora dos muros, a 59 min a pé
> Ir · 59 min

**[B-24b]** `@Ir · 59`
> O POSTO DA ESTRADA
> te entrego nunca. vamos embora agora, partimos pela estrada rumo ao destino dela
> Astrid assente, os olhos ainda duros. — Então me leva. Ela junta as cartas, prende o salvo-conduto no cinto e se move para a porta. Você a segue pelo umbral, Aldric à frente, e a noite engole o posto da estrada. A estrada para o sul range sob os pés quando vocês partem, e a névoa baixa esconde o caminho. Ninguém olha para trás.
> Ir até Sala das Cartas
> +4
> ofertas
> DIA · 13:14

**[B-25]** `vou na frente com cuidado, procurando sinais de emboscada na estrada`
> vou na frente com cuidado, procurando sinais de emboscada na estrada
> Você segue à frente, o passo cauteloso, os olhos varrendo a estrada batida e as moitas baixas. Nada se mexe além do vento entre as folhas, e a fogueira fria solta um resto de cinza quando você passa perto. Aldric vem atrás, o arco cruzado nas costas, e para de repente.
> — Em terra de gente, o perigo é gente — murmura, e estende a você uma adaga de guarda gasta. — Leva. Mas se usar, que seja antes do agradecimento.
> Entre seus dedos, a adaga é leve e fria; na outra mão, o salvo-conduto assinado pesa como chumbo.
> DIA · 13:24

**[B-26]** `sigo viagem com Astrid ate Ossuario Prata Podre`
> Ir até Ossuário Prata Podre
> «sigo viagem com Astrid ate Ossuario Prata Podre»
> ☠ Impossível
> Reescrever

**[B-26a]** `@Ir até Ossuário`
> ·
> 🧭 Ossuário Prata Podre fica a sudoeste, a 218 km — 7,5 dias de marcha por campo aberto.
> ·
> ☠ Ossuário Prata Podre — IMPOSSÍVEL: não é difícil, é impossível — nada do que você tem alcança isto. À porta: do tamanho de vocês, até seis vezes acima de vocês. No fundo: muito acima de vocês.
> Ir · ☠ Impossível

**[B-26r]** `@Reescrever`
> Ir até Sala das Cartas
> +4
> ofertas
> AGIR

**[B-27]** `paro na beira da estrada e procuro com calma por qualquer coisa escondida entre as pedras, um bau, um esconderijo, o que tiver`
> paro na beira da estrada e procuro com calma por qualquer coisa escondida entre as pedras, um bau, um esconderijo, o que tiver
> Você se afasta da beira e procura entre as pedras, mas só encontra terra solta e gravetos. Nada escondido. Atrás de você, Aldric examina os rastros na estrada. — Aqui passaram dois de espada, um coxo, e alguém que não deixou sola. Cochicho? Não. Mas a brisa vira. O mar logo engole o que a gente fala.
> DIA · 13:34

**[B-28]** `Aldric, o que voce sabe sobre essa Alma de Gellyn que quer a cabeca dela?`
> Aldric, o que voce sabe sobre essa Alma de Gellyn que quer a cabeca dela?
> Aldric baixa a voz, o arco firme na mão. — Alma de Gellyn? Dizem que é uma colecionadora, paga bem e some. Se está atrás da cabeça de Astrid, é porque o mapa vale mais que a estrada.
> Ele olha para você, sério.
> — E gente que paga por cabeça não costuma deixar rastro na areia.

**[B-29]** `volto pra cidade com ela e procuro um barqueiro pra pedir passagem sem perguntas, e minto que ela e minha irma doente`
> volto pra cidade com ela e procuro um barqueiro pra pedir passagem sem perguntas, e minto que ela e minha irma doente
> Você está no posto da estrada, Astrid escondida sob uma capa, os olhos baixos. Lá fora, o vento arrasta folhas secas pelo pátio de terra batida. Um tropeiro de mãos rachadas escuta sua mentira sem piscar, encostado ao balcão. — Irmã doente? — repete, e cospe no chão de tábuas. — Doente eu também fico, de carregar gente que não diz o nome.
> Ele aponta para a carroça coberta e cobra o dobro, a moeda já na palma da mão. Astrid aperta o seu braço com força demais, e o salvo-conduto assinado queima no seu peito como brasa.
> DIA · 13:39

**[B-30]** `nao pago o dobro. digo pro tropeiro que a adaga de guarda vale mais que isso e que ele faz pelo preco normal ou eu vou procurar outro`
> nao pago o dobro. digo pro tropeiro que a adaga de guarda vale mais que isso e que ele faz pelo preco normal ou eu vou procurar outro
> O tropeiro ri sem abrir a boca, mas a risada morre quando você mostra a adaga de guarda gasta. — Guarda fina, sim — diz ele, mordendo a isca. — Faço pelo preço justo. Mas não me agradeça: agradeça à estrada que me deixou curioso.
> Ele junta as rédeas e aponta a carroça coberta, onde o feno seco promete um esconderijo. De repente, um homem passa de rota, falando baixo demais; você ouve 'Barra do Sal' e 'festa virada em briga', e depois o vento leva o resto. Aldric olha para você, sério como pedra.
> — Gente que fala baixo na estrada ou esconde segredo ou espera o nosso. Não é bom sinal.
> DIA · 13:44

**[B-31]** `eu vou me esgueirar ate a carroca coberta sem o tropeiro ver e puxar a Astrid pra dentro do feno`
> eu vou me esgueirar ate a carroca coberta sem o tropeiro ver e puxar a Astrid pra dentro do feno
> Você se esgueira até a carroça coberta, puxa Astrid para dentro do feno sem que o tropeiro veja. Ela se encolhe junto a você. Lá fora, alguém fala baixo de Bateria Alta, e a voz se perde no vento. Astrid sussurra: — O que se esconde lá dentro ninguém nomeia, e é justamente o que procuram. O silêncio aperta. A carroça não vai esperar para sempre.
> DIA · 13:49

**[B-32]** `posso espiar pela fresta e ver quem esta falando baixo la fora?`
> posso espiar pela fresta e ver quem esta falando baixo la fora?
> "posso espiar pela fresta e ver quem esta falando baixo la fora?" — Sim.
> A fresta entre as tábuas da parede do posto revela dois vultos curvados junto à fogueira fria, as vozes baixas como lâminas desembainhadas devagar. São um homem de capa salgada e uma mulher com as mãos embrulhadas em trapos; falam de Bateria Alta, de um nome que não repetem. Aldric cheira o ar e sussurra: — Gente de escuta, não de briga. Mas escuta não enche barriga. No seu punho, a adaga; na sua bolsa, o salvo-conduto. Duas coisas que não cabem juntas, e as duas custam.
> 30
> 2
> ✓
> O MUNDO RESPONDE
> 32
> chance 58% — ✓ passou

**[B-33]** `saio da carroca de supetao, seguro o homem que fala baixo pelo colarinho e ameaco ele: me conta o que sabe ou eu corto sua lingua`
> saio da carroca de supetao, seguro o homem que fala baixo pelo colarinho e ameaco ele: me conta o que sabe ou eu corto sua lingua
> Você salta da carroça e agarra o homem pelo colarinho. — Me conta o que sabe, ou eu corto sua língua. Ele não recua, apenas inclina a cabeça, e a tosse corta o silêncio. — Corta, então. Mas é teu silêncio que vão enterrar na estrada.
> A mulher das mãos em trapos agarra seu punho com uma força que não combina com o corpo. — Larga. Agora. O que sabes de Bateria Alta não vale tua garganta.
> O MUNDO RESPONDE · 32 · CHANCE 58%
> DIA · 13:54

**[B-34]** `solto o homem e puxo a adaga: se a mulher nao largar meu punho eu corto o braco dela`
> Atacar Guarda da adaga
> «solto o homem e puxo a adaga: se a mulher nao largar meu punho eu corto o braco dela»
> Reescrever

**[B-34a]** `@Atacar Guarda`
> ·
> abre a luta
> Atacar

**[B-34r]** `@Reescrever`
> Ir até Sala das Cartas
> +4
> ofertas
> AGIR

**[B-35]** `largo o homem e peco desculpa, ofereco duas moedas pros dois pra me contarem o que sabem, e digo que sou so um viajante perdido`
> largo o homem e peco desculpa, ofereco duas moedas pros dois pra me contarem o que sabem, e digo que sou so um viajante perdido
> Você solta o colarinho do homem e estende duas moedas. Ele as pega com dois dedos, sem olhar, e a mulher por fim relaxa o punho.
> — Viajante perdido não agarra gente na estrada — diz ela, baixo. — Mas prata cala a pressa.
> O homem guarda as moedas no forro da capa.
> — Bateria Alta esconde o que ninguém quer nomear. Só isso. Agora some, e leva tua irmã.
> Astrid, na carroça, não faz ruído.
> DIA · 13:59


### Sessão A (`?mestre=0`, controle)

**[A-00]** (leitura)
> GARETH
> Ladino · nível 1
> 14
> ALDRIC ROMPE-ESCUDOS
> Caçador · nível 1
> 12
> 9
> O SALVO-CONDUTO
> Ouvir Astrid o Andarilho
> PISTAS · 0 DE 1
> BATERIA ALTA
> A lei deste mundo: O sangue nobre manda e o dinheiro compra: um plebeu rico vale mais que um cavaleiro pobre, mas nunca diante do rei.
> Pessoas — o mundo começou a guardar quem você conhece.
> Guilda — há uma casa com sede aqui, e dá para bater na porta.
> Baía do Enforcado cheira a sal, peixe seco e alcatrão. O cais de pedra se estende sob névoa, e cada prancha range sob seus passos. Um sino de bóia toca ao longe, lento. Aqui o mar manda: a cidade vive do que se planta nas encostas e do que se troca no porto. Um fiscal de milícia, rosto de quem já viu naufrágio, pendura no seu pulso uma medalha de cobre de visitante. 'Devolve na saída. Perder custa cinco peças.'
> Aldric Rompe-Escudos desce atrás de você, o arco nas costas, os olhos varrendo as ruas estreitas. Há seis anos vocês dividem estrada, pão e perigo.
> Dizem que a guarda fechou a estrada para Ossuário Prata Podre. Ninguém fala disso sem baixar a voz. Os dois últimos que tentaram escoltar Astrid o Andarilho voltaram num carro de bois, os rostos virados para o céu. Ele precisa chegar a Recife Funda antes da lua nova, e carrega na cabeça o que sabe sobre a mão que guarda Trapiche do Sal.
> Você ainda não o encontrou. A praça fica adiante, e a Sereia Rouca abre as portas para o primeiro freguês.
> Você sobe a ladeira de pedras gastas até o portão de Bateria Alta. O forte fica no ponto mais alto da cidade, com muralhas baixas e canhoneiras viradas para o mar. Um soldado de milícia, elfo de olhos claros e farda surrada, observa você se aproximar. Ele desvia o olhar, depois pergunta:
> — Negócio com a artilharia, forasteiro? Aqui não é lugar de quem não foi chamado.
> Aldric para ao seu lado, o arco nas costas, e cruza os braços.
> Atrás do soldado, uma escada de pedra desce para o interior do forte, onde se ouve o som abafado de martelos.
> Mercado — há quem venda por aqui.
> Falar com Helga
> Explorar Ossuário Prata Podre
> Procurar Astrid o Andarilho
> DIA · 08:05
> 10
> rações
> 10
> água
> 5
> tochas
> 15
> moedas

**[A-01]** `oi soldado, to procurando a Helga. sabe onde ela ta?`
> 1
> oi soldado, to procurando a Helga. sabe onde ela ta?
> Helga está aqui — Bateria Alta.
> O soldado elfo hesita, depois aponta com o queixo para dentro do forte.
> — Última plataforma, mexendo na culatra da peça de meia légua. Se ela não te conhecer, não passa da escada.
> Você desce os degraus gastos e ouve antes de ver: o raspar de metal e uma voz baixa cantando, sem pressa. Helga está ajoelhada junto ao canhão de bronze, as mãos escuras de graxa. Ela não levanta os olhos.
> — Procurando artilharia às oito da manhã? Ou a mim? — pergunta, e a canção para.
> Aldric para atrás de você, atento à sombra da muralha.
> quem ensinou a canção ao herói
> +17 XP · um lugar por onde você nunca tinha passado
> Ir até Sala das Cartas

**[A-02]** `pergunto o que ta acontecendo nesse forte, to meio perdido`
> pergunto o que ta acontecendo nesse forte, to meio perdido
> Helga se levanta, limpando as mãos num pano engordurado.
> — Aqui é onde os canhões dormem acordados. Quarto de guarda, paiol, e eu — remendo o ferro que o mar rói. Você chegou cedo demais para vistoria e tarde demais para a rendição.
> Ela sorri, e o sorriso se apaga quando olha para a escadaria.
> — Está procurando a milícia ou o que ela esconde?
> +17 XP · uma conversa que ficou
> +3
> ofertas
> DIA · 08:10

**[A-03]** `minto que sou inspetor da coroa e mando liberar a passagem`
> minto que sou inspetor da coroa e mando liberar a passagem
> enganar Helga — dificuldade 16 (um favor que lhe custa pouco, desconhecido). Seu bônus: +2 ★ treinado.
> Rolar d20 + 2
> Enganação
> precisa de 16
> Mudar de ideia
> 16

**[A-03b]** `@Rolar d`
> Ir até Sala das Cartas
> +3
> ofertas
> 18
> 18
> +2
> →
> PRECISA DE 16
> 20
> PASSOU
> por 4
> Refazer · gasta 1 de 1
> CONTINUAR
> Enganação: 20 contra 16, passou

**[A-03c]** `@CONTINUAR`
> Helga solta o pano no chão e cruza os braços.
> — Inspetor da coroa, então. Devia ter avisado. Eu desço, mostro a peça, presto contas. Mas aqui no forte vale a regra: homem da coroa conhece gente. Você vai querer um salvo-conduto, e isso eu não arranjo de graça.
> Ela aponta para a escadaria, para o molhe ao longe, e depois para o cais.
> — Posso garantir o que eu mesma levo: uma passagem para o outro lado do cais, sem nome no livro. Ou apresento você a quem vende mapas na Sala das Cartas. Escolhe o que paga e o que deve.
> +17 XP · o que você tentou, conseguiu
> ✓
> ENGANAÇÃO
> 18 + 2 = 20
> precisa de 16 — ✓ passou
> DIA · 08:15

**[A-04]** `vou tentar sair sem ninguem ver`
> vou tentar sair sem ninguem ver
> Você mede a distância até a escada e o vão de sombra entre as peças de artilharia. Aldric faz um gesto curto com a cabeça, e vocês dois deslizam para a saída com o silêncio de quem conhece pátios de guarda. Helga está de costas, reapertando um parafuso, cantarolando baixo. Nenhum passo, nenhum olhar.
> Uma voz seca corta o corredor:
> — Sem livro de bordo, artilheira? Ou a inspeção acabou cedo demais?
> É Corwin, soldado do portão, parado no alto da escada, mordendo um palito.
> ENGANAÇÃO · 18 + 2 = 20 · PRECISA DE 16
> DIA · 08:20

**[A-05]** `olho em volta procurando algo escondido ou util`
> olho em volta procurando algo escondido ou util
> Percepção. Precisa de 13. Se falhar, o tempo se vai e o lugar fica remexido.
> Rolar d20 + 2
> Percepção
> precisa de 13
> Mudar de ideia

**[A-05b]** `@Rolar d`
> 2
> ↯ Você revira o que dá e não encontra — e o lugar fica remexido, o que qualquer um nota.
> Você procura pelos cantos do forte, afasta lonas e move correntes, mas não encontra o que queria. Fica apenas o rastro: marcas de mãos na poeira, uma pilha de estopa fora do lugar. Helga percebe e desvia o olhar, como quem anota e não esquece. Corwin, lá de cima, diz sem pressa:
> — Remexeu o que não era seu e não levou nada. Isso aqui não é casa de penhores, forasteiro.
> No chão, perto da peça, uma faca de osso sem nenhum ferrolho conhecido. E na parede, um gancho vazio, do tamanho exato de uma espada que não está ali. Duas coisas que não cabem juntas, e as duas custam.
> Ir até Sala das Cartas
> +3
> ofertas
> 3
> ✕
> PERCEPÇÃO
> 3 + 2 = 5
> precisa de 13 — ✕ falhou
> DIA · 08:45

**[A-06]** `posso pedir um desconto pra quem vende por aqui?`
> posso pedir um desconto pra quem vende por aqui?
> "posso pedir um desconto pra quem vende por aqui?" — Não, mas…
> Corwin Guarda-Portão aparece no alto da escada, mastigando as palavras como quem prova uma sopa. — Leve esta carta a Carreira Velha, em Recife das Ossadas. Eu não posso entrar lá: me conhecem pelo molho. — Ele enfia o papel dobrado na sua mão, ainda morno do bolso. Ao lado, Helga observa em silêncio, e a faca de osso para onde seu olhar volta tem um brilho de maré baixa. Duas coisas que não cabem juntas: a carta que um guarda não entrega e a lâmina que um forte não explica. As duas custam.
> +6
> 40
> 8
> O MUNDO RESPONDE
> 48
> chance 40% — ✕ falhou

**[A-07]** `ameaco o primeiro que aparecer: me conta o que sabe ou vai se arrepender`
> ameaco o primeiro que aparecer: me conta o que sabe ou vai se arrepender
> Corwin Guarda-Portão desce dois degraus e cospe o palito. Não se apressa.
> — Todo forasteiro que sobe aqui tem essa boca — diz ele. — A maioria desce procurando os próprios dentes.
> Helga recua meio passo, mão parada no martelo, e observa. Aldric já não está onde estava; está três passos à sua esquerda, com o arco ainda às costas.
> — Fale, soldado — sua voz é baixa, sem pressa. — O forte inteiro ouviu a inspeção acabar cedo demais.
> O MUNDO RESPONDE · 48 · CHANCE 40%
> DIA · 08:50

**[A-08]** `vou forcar a fechadura da primeira porta que encontrar`
> vou forcar a fechadura da primeira porta que encontrar
> Helga desvia o olhar para o caderno que leva contra o peito — três riscos de carvão no couro, e os dedos dela cobrem o lugar da assinatura. Corwin morde o palito, os olhos estreitos.
> — Trancado, aqui, é convite ou promessa — diz ele.
> Lá fora, o sol aquece a pedra cinzenta do terraço do forte. O vento sobe do cais carregado de alcatrão.
> Helga estende a mão:
> — O que você procura, afinal, forasteiro?
> DIA · 08:55

**[A-09]** `converso com o Aldric sobre o que ele acha de tudo isso`
> converso com o Aldric sobre o que ele acha de tudo isso
> Aldric solta o ar devagar, os olhos ainda na sombra do forte.
> — Acho que viemos de graça. Guarda não é costume de conversar, e carta na mão de soldado não é recado — é isca.
> Ele ajeita o arco no ombro e baixa a voz:
> — Mas você não ia embora sem saber, e eu também não.
> O vento sobe do cais, frio, com cheiro de sal e de fumaça velha.
> DIA · 09:00

**[A-10]** `vou ate o mercado ver o que tem pra comprar`
> vou ate o mercado ver o que tem pra comprar
> Você desce a ladeira de pedra que separa o forte do coração da cidade. A feira já ferve: lonas esticadas, caixotes, o cheiro de peixe defumado e de couro. Vendedores apregoam, remadores descarregam, um cego toca uma viola torta.
> Na barraca da Bigorna de Ferro, Aldric para junto de você, os olhos varrendo a multidão.
> — Mercado de manhã é onde se ouve o que a guarda não diz — comenta, baixo.
> Eira o Silencioso, mestre do porto, assina um manifesto perto do cais, e por um instante olha na sua direção.
> DIA · 09:05

**[A-11]** `pergunto ao vendedor sobre Astrid o Andarilho e peco desconto`
> «pergunto ao vendedor sobre Astrid o Andarilho e peco desconto»
> 5 min
> Reescrever

**[A-11r]** `@Reescrever`
> +6
> ofertas
> AGIR

**[A-11c2]** `pergunto ao anao da Bigorna de Ferro se ele faz um desconto`
> pergunto ao anao da Bigorna de Ferro se ele faz um desconto
> O anão da Bigorna de Ferro, Edric Guarda-Portão, desvia o olhar da barraca e bufa: — Desconto? O ferro da Bigorna não barateia. Mas se trouxer notícia de Astrid o Andarilho, talvez eu considere.
> +7

**[A-12]** `reviro o lixo atras da banca atras de qualquer coisa`
> reviro o lixo atras da banca atras de qualquer coisa
> ↺ Você já tentou vasculhar o lugar aqui, do mesmo jeito, e não deu. Insistir igual não muda nada — por outro caminho, com ajuda de alguém, com uma ferramenta que você não usou, dedicando bem mais tempo.
> Helga desce os degraus de pedra com a pressa de quem segura um segredo. — Forasteiro. Alguém veio atrás de você. Um homem que não devia estar na muralha. — Ela põe na sua mão um bilhete dobrado e um anel de cobre. — Ele deixou isto e disse que você sabe o que custa. Depois sumiu na bruma, como se o mar o engolisse.
> Aldric lê por cima do seu ombro, e o nome no papel é Astrid o Andarilho.
> quem ensinou a canção ao herói
> +6

**[A-13]** `eu vou escalar o muro do forte pra espiar de cima`
> eu vou escalar o muro do forte pra espiar de cima
> Atletismo. Precisa de 15. Se falhar, você despenca lá de cima.
> Rolar d20 + 3
> Atletismo
> precisa de 15
> Mudar de ideia

**[A-13b]** `@Rolar d`
> ↯ Você escorrega e volta ao chão, com as mãos em carne viva.
> o muro — 4 m de queda (1d6).
> Salvaguarda de Destreza ★: d20 → 9 + 7 = 16 vs 13 · resistiu
> 2 de dano — 4 m de queda · 12/14 PV
> Caído (1t) — No chão: desvantagem até levantar.
> A pedra cede sob sua mão, e o corpo desce quatro metros de muro antes de bater no chão do pátio. O impacto corta o ar, as palmas em carne viva latejam. Você fica caído um instante, a visão tremendo, mas os ossos aguentaram. Helga está de pé a poucos passos, com o caderno contra o peito e os olhos fixos em você.
> — Você não devia ter subido aí. — A voz dela é baixa, mas as palavras chegam sem pressa. — Alguém procura você. Um homem com um anel de cobre e um bilhete que diz seu nome.
> Ela entrega o papel dobrado. Nele, apenas uma linha: “O Andarilho espera na Sereia Rouca antes da maré.” […]
> ✓ Caído passou
> Ir até Sala das Cartas
> +6
> ofertas
> ✕
> ATLETISMO
> 9 + 3 = 12
> precisa de 15 — ✕ falhou
> DIA · 09:15

**[A-14]** `tento roubar uma bolsa de moedas do bolso de um bebado`
> tento roubar uma bolsa de moedas do bolso de um bebado
> O bêbado se inclina sobre o balcão, resmungando para o copo. Seus dedos encontram a bolsa, solta no cinto, e a retiram sem peso, sem pressa. O gesto é limpo, mas alguma coisa — um botão que prende, um fio de couro — prende por um instante. O anão Edric Guarda-Portão, do outro lado do balcão, não levanta os olhos. Lá fora, uma vendedora anuncia que o peixe subiu de preço. O bêbado não se mexe.
> Ao fundo, Helga desce os degraus com o caderno contra o peito e vem direto a você, sem desviar o olhar.
> ATLETISMO · 9 + 3 = 12 · PRECISA DE 15
> DIA · 09:20

**[A-15]** `saio da cidade pela estrada`
> saio da cidade pela estrada
> Você deixa para trás as casas de pedra e os canhões silenciosos. A estrada desce entre muros de bruma, e o cheiro de alcatrão se mistura ao de terra molhada. Aldric anda a seu lado, o arco nas costas, os olhos nos arbustos baixos. A uns trezentos passos do portão, a bruma engole a cidade. O som do mar fica distante, o vento vira, e a estrada agora é só pedra e barro para diante.
> DIA · 09:25
