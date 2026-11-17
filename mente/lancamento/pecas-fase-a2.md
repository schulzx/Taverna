# As peças: Fase A2, os ajustes que a medida pediu

**17/11/2026.** A fase A (`pecas-fase-a.md`) mediu o encaixe e mostrou cinco furos. Esta fase fez os sete
ajustes que o coordenador decidiu e mediu de novo **com a mesma régua**: as 439 frases do corpus contra as três
etapas com dado da quest da prova, o que dá 1317 encaixes, nas duas leituras. Só mudaram `src/pecas/**` e
`testes/teste-pecas-*.mjs`. Não houve IA, navegador nem servidor.

## 1. Antes × depois

| leitura | solução | cena | aquecimento que esquenta | aquecimento frio | livre | sem nada |
|---|---|---|---|---|---|---|
| **principal, fase A** | 131 (9,9%) | — | 486 (36,9%) | 114 (8,7%) | 586 (44,5%) | 0 |
| **principal, A2** | **101** (7,7%) | **75** (5,7%) | **687** (52,2%) | **96** (7,3%) | **358** (27,2%) | **0** |
| estrita, fase A | 86 | — | 234 | 388 | 609 | 0 |
| estrita, A2 | 97 | 57 | 476 | 262 | 425 | 0 |

Por peça (principal, A2): ver 37 · 27 · 215 · 33 · 127; rasto 41 · 21 · 238 · 26 · 113; fera 23 · 27 · 234 · 37 · 118.

**A leitura dos números.** O livre caiu 228, quase todos frases compostas em que o «ir» engolia a conversa. O
frio caiu 18, e hoje é só conversa ou olhar sem alvo na cena (§3). As soluções **caíram** 30, e foi de propósito.
A fase A contava como solução coisas que não eram: a família larga («sorrio para ele» virava «perguntar aos
vizinhos»), «procuro a Lourdes» era revistar, «de que fugi» era fugir. Saíram essas, entraram as certas: a
pergunta a quem a etapa pede e o alvo pelo papel. A catraca da suíte passou a 100 soluções, 100 frios, 70 cenas
e 360 livres, e o motivo está escrito ao lado dela.

Os testes de cena (75) foram: arrebentar 27, estancar 25, lembrar 10, atuar 6, forçar 3, magia 3, furtar-se 1.

## 2. Exemplos, de 40 em 40 (o 1.º, o 41.º, o 81.º… Não são os melhores)

- *solução* (só há 101, logo saem 3; completo de 10 em 10): «Não guardo a lâmina. Vou até à porta do galpão… agacho-me e procuro armadilhas» → `revistar@curral`; «Pego a moeda falsa… examino a moeda de perto» → `investigar@curral`; «Inês entra na luta aberta: Atacar» → `lutar@fera` (é registo de combate); de 10 em 10, ainda «Examino o poço… Procuro o que as Celas escondem» → `ler@curral`; «Pergunto quem eram eles e onde…» → `vizinhos@curral`; «Me agacho e examino o corte na carcaça» → `ler@curral`; «Monto acampamento no telheiro» → `orientar@toca` (**falso**, §4); «Digo ao arquivista… examino as estantes» → `revistar@curral`; «Sento no banco com ela. Pergunto se viu chegar uma mulher…» → `fazer_falar@tratador`; «Sigo as marcas no chão até a mata» → `rastrear@toca`.
- *cena* (só há 75; de 8 em 8): «Recuo para a sombra e tento esconder-me do lobo» → furtar-se; «Arrebento as amarras» → arrebentar; «Pressiono o ferimento de Elowen» → estancar; «Testo as amarras e forço os pulsos» → arrebentar; «Forço os pulsos contra as raízes» → arrebentar; «Socorro a minha irmã» → estancar; «levanto a tábua» → forçar; «Estanco o sangue de Elowen» → estancar; «Pressiono o ferimento» (fera) → estancar; «Testo as amarras» (fera) → arrebentar.
- *aquecimento que esquenta*: «deixo a guarda revistar… pergunto: "Que língua…"» → `vizinhos`; «Deixo a praça e sigo para O Livro Morto… Procuro quem lá guarda os registos» → `ler`, `revistar`; «Pergunto a Vando sobre a mulher que varre a soleira» → `vizinhos`; «Chega de mentir: diga o que é essa canção» → `vizinhos`; «Vou com Saoirse até a Cabra Trêmula. Procuro Godfrey» → `ler`, `revistar`; «Viro-me para o boticário e pergunto» → `vizinhos`; «Aceno ao meirinho e pergunto-lhe» → `convencer@toca`, `perguntar@curral`; «Respondo a Hakon: depende…» → os mesmos; «Respondo a Vando: agora entramos» → os mesmos; «volto às Celas. Procuro Nyla» → `pagar@toca`, `pagar@curral`.
- *livre*: «Sigo pela rua principal e pergunto ao menino… onde fica o Sino Calado» (ir); «Caminhamos a noite inteira… chegamos a Serra do Bode» (ir); «Pago as dez escamas» (comércio); «Pago um quarto comum… durmo» (descanso); «saio com Vando. Vamos direto a Fogão Q…» (ir); «Levo você e Freya até Petra… Seguimos agora» (ir); «Vou até o balcão e pergunto… quanto custa um quarto» (ir, com o balcão em `saidas`); «Compro duas tochas» (comércio); «Sigo pela rua principal até a forja do Tomas» (ir).
- *frio*: os 96 estão em §3.

## 3. Os frios que sobraram (20, de 5 em 5), com a causa

As causas, nas três peças: nada aponta 44, família sem solução 22, nomeia quem não está 18, negação ou intenção 12.

1. «Passo a tocha… avanço sobre a coisa que se mexeu». **O catálogo não lê** o ataque «avançar sobre».
2. «Atacar com a maça: erro; caio a 0 PV». É registo de combate, não frase de jogador.
3. «toco o primeiro verso a Ambrósio». Arte dirigida a quem não está. O frio está certo.
4. «Vou te tirar daqui, Petra. Saímos os quatro… pelo portão norte». **O «ir» não pega** «saímos… pelo portão».
5. «Mostro a carta… o que o Rossio Torto esconde». Família sem solução na peça: o frio está certo.
6. «entrego o alaúde… e puxo o trinco do alçapão». É um gesto sem obstáculo. O catálogo diz «livre».
7. «Ponho duas moedas no balcão pela caneca». É a conta, que o rx do balcão não pega (falta «ponho… pela»).
8. «Pouso o couro… e leio-lhe em voz baixa a frase…». Lê para Noé, que não está. O frio está certo.
9. «Não me meto na confusão… termino a maçã e pergunto à vendedora». A negação abre a frase, e a pergunta é a quem não está.
10. «Não aceito o álibi, Petra…». É a negação, e Petra não está. O frio está certo.
11. «Pergunto ao taverneiro que nome o velho deixou». O taverneiro não está aqui. O frio está certo.
12. «Saco a faca… e ataco a cria de Lobo Sarnento». Ataque a quem a cena não tem. O frio está certo.
13. «Vou pela rua até à botica… Pergunto ao boticário». **O «ir» não conhece «vou pela rua até»**, e o boticário não está.
14. «Continuamos a caminhar até chegarmos à Ponte Lenta». **O «ir» não conhece «continuamos a caminhar»**.
15. «toco o primeiro verso a Ambrósio» (fera), como em 3.
16. «Examino a placa de mármore…» na toca, onde não há solução de olhar. A regra diz frio. Está certo, mas dói.
17. «Abro o pano e folheio o livro-caixa…» na toca: nada aponta para lá.
18. «Aceito os catres… e». É uma frase cortada.
19. A botica (fera), como em 13.
20. «Olho em volta com atenção» na toca. É olhar, e a peça da toca não tem solução de olhar.

Leitura: 11 dos 20 são frios certos (ninguém da cena, registo de log, frase cortada). Os outros 9 vêm de três
furos: o rx do «ir» (4, 13, 14, 19), o do balcão (7) e o da agressão (1). Faltam também soluções de olhar na
toca (16, 17, 20). Isso é o molde da etapa «fera», não o encaixe.

## 4. Os falsos encaixes: 60 soluções ao acaso

Sorteio pela semente `A2-60`. Das 101 soluções saíram 60, e a mesma frase pode vir em duas peças. **Erradas: 10 de
60 (17%)**, ou seja, a ação não é o que a frase quis:

- «Pergunto à mulher do pão onde fica a estalagem… e quanto custa» → `fazer_falar` (3 vezes). É pedir direção e
  preço, não o assunto da etapa. O balcão só se reconhece pela oração «quanto custa», e a pergunta vem noutra.
- «Olho com atenção o que ela traz no avental» → `revistar@curral` (2 vezes). É olhar uma pessoa, não o sítio.
- «Monto acampamento…» → `pegadas@curral` / `orientar@toca` (2 vezes). É **o catálogo** que lê o acampamento como sobrevivência.
- «seguimos para a paliçada norte… procurando o cão» → `revistar@curral` (2 vezes). Ele está a sair da cena, mas o destino não tem maiúscula.
- «Vou até a alcova e olho o vulto que geme: quem é?» → `fazer_falar`. É falar com um estranho que a cena não tem.

Antes desta leitura havia mais. As que se acharam a meio da fase foram corrigidas e ficaram na suíte como catraca:
«procuro a Lourdes / o Zeca / Godfrey» deixou de ser revistar, «de que fugi» deixou de ser fugir, «prendo-a à
cintura» deixou de ser capturar, «pergunto ao taverneiro como **ele** se chama» deixou de ser a pessoa da cena, e
«Hakon, de onde nos conhecemos?» deixou de ser conversa com quem está.

## 5. Os três jogadores-roteiro

| | turnos | ver | rasto | fera | destino | preços pagos | o mundo cobrou |
|---|---|---|---|---|---|---|---|
| **direto** | 4 (eram 4) | 1 dado | 2 | 1 (a besta morre) | — | 0 | 0 |
| **conversador** | **23** (eram 63) | 4 t, 2 dados, fecha pela conversa | 11 t, 6 dados, fecha pela conversa | 8 t, 4 dados, a forçada imposta | — (matou) | 4 | **2** (eram 7) |
| **azarado** | 12 (eram 12) | 2 dados, 1 preço | 3, 2 | 6, 2 | carta | 5 | 0 |

O conversador aciona agora 10 soluções pela própria frase (eram 0). Fecha «ver» e «rasto» conversando, e só na
toca, depois de ter feito tudo com o tratador, é que o mundo traz a besta. **O alvo era ≤ ~20 turnos, e chegou a
23.** Varri brasa de 4 a 8 e cheio 2 ou 3: nenhuma combinação desce de 22. O que sobra é a sequência do dado
(10 rolagens, várias falhadas), não o relógio. O direto e o azarado ficaram iguais em todas as combinações.

## 6. O que cada ajuste mudou

1. **O teste de cena** (`{ tipo: "cena", acao, dado }`). A ação com dado no catálogo que não está na peça vira
   cena. A exceção são as famílias que são trabalho de qualquer etapa (`FAMILIAS_QUE_AQUECEM`: falar, olhar,
   seguir), e só se a peça tiver uma solução dessa família: aí a ação vizinha aquece. O corpo, o cuidado, o saber e
   a arte viram sempre cena, porque arrebentar amarras não é escalar o muro da toca. A magia vai pelo grimório
   (`CENA_SEM_CATALOGO`). O dado traz perícia, CD e o custo do catálogo (`custoPorAlvo`). A cena não chama
   `aquecer`, e portanto o relógio não anda. *Decisão minha*: li «família da peça» como estas famílias de trabalho
   e não como qualquer família. Pela letra, estancar na toca aqueceria «acalmar a fera».
2. **A frase por oração** (`partirEmOracoes`, `PESO_DO_ENCAIXE`). A frase parte-se em «e», «depois», «então»,
   vírgula e fim de frase. Nunca parte dentro de aspas, entre dois nomes com maiúscula, nem na vírgula decimal. O
   «?» e o «!» ficam com a oração. Vale a de maior peso (solução 5 > cena 4 > aquece 3 > livre 2 > frio 1), e as
   livres seguem em `saidas`. *Decisão*: o frio fica abaixo do livre, porque «vou ao mercado e penso na vida» é
   ir. **Quem sai da cena age na chegada** (`SAIDA_DA_CENA`): «Vou à toca e procuro rastos» é ir, e a busca vai
   em `naChegada`. A exceção é o caminho que é a própria solução («sigo as pegadas até à toca»). A oração sem
   pessoa herda a pessoa da anterior («Cumprimento X e pergunto…»), e também herda o «fora»: em «convencer o
   guarda com lábia e charme», a segunda oração continua a ser sobre o guarda. A negação e a intenção não são
   gesto (`NAO_E_ACAO`): essa oração só aquece. O «…» não parte a frase, porque no corpus é elisão.
3. **A conversa direta** (`CONVERSA_DIRETA`, `ligada: true`). Uma pergunta (pergunto, indago, me diga…) ou um
   pedido (peço, convenço, insisto…) dirigido à pessoa que a etapa pede aciona a solução dela na hora. A pessoa
   pode vir pelo nome, pelo papel, pelo pronome ou herdada. Se não houver solução dela, vale «alguém daqui» da
   etapa. Sem nome nenhum, a única pessoa da cena serve, mas só para a pergunta e só se a frase não chamar alguém
   por um nome que a cena não tem. «Pergunto quanto custa» é do balcão. Se a conversa dela já falhou, a pergunta
   segue a seta da falha: aciona-a se o Mestre já a abriu, senão aquece-a. A bolsa e a espada nunca se abrem pela
   conversa (`FAMILIAS_QUE_PEDEM_A_PALAVRA`). A solução que o calor já abriu rola pela frase seguinte que aponta
   para ela (`CALOR_DAS_PECAS.abertaAcionaPelaFrase`).
4. **O alvo por descrição** (`aDescricao`, `ALVO_POR_DESCRICAO`, `PAPEIS_DO_ELENCO`). O papel da quest passou a
   ir com a pessoa da cena: quem entrou pelo sítio leva o papel (`peca.js`), e o ofício e o género viajam com
   ela. «o tratador», «a fera», «a besta» e «o bicho» resolvem contra a cena, e o pronome resolve quando há um só
   candidato. O ofício do catálogo (`alvoDescrito`) ou um papel da biblioteca que ninguém daqui veste conta como
   alguém de fora.
5. **As famílias.** `mentira` passou a «intuicao», separada de «saber». A troca larga por família acabou: só se
   trocam as ações de `ACOES_QUE_SE_TROCAM` (convencer↔fazer_falar, buscar↔investigar, rastrear↔orientar). O
   improviso já não aciona solução nenhuma, só aquece.
6. **O ritmo.** A brasa passou de 8/7/6/5 para 6/5/4/4. A frase fria gasta 2 no relógio, e o mundo impõe a
   forçada **na primeira** cobrança (`impoeNa` 2 → 1). Cada número traz o porquê e a medida na tabela.
   *Desvio do texto de `as-pecas.md` §3.5*: lá, a primeira cobrança só põe a forçada à vista. A forçada à vista
   nunca era pegada por quem só conversa, e cada etapa travada custava duas cobranças.
7. **`o_convite_sem_selo/saida`** («sair do salão», `["nenhum", ["esta_em", "lugar:salao"]]`). É um veto: não há
   facto que o sucesso escreva. Para ser peça, precisa de um facto positivo, por exemplo
   `["esteve", "lugar:<fora do salão>"]` ou `["esta_em", "lugar:<pátio>"]`, com o veto mantido como condição. Assim
   herda o molde `esteve` (esgueirar, convencer o porteiro, pagar, escalar). Não editei a biblioteca.

E o pedido a meio: **as strings de `src/pecas/**` passaram a PT-BR** («se cansa de esperar e se fecha», «rastro»,
«lugar», «se ouve», «está fazendo»…). `node testes/check-pt-br.mjs` não acusa nenhum arquivo da pasta.

## 7. O que ainda é furo

1. **O rx do «ir» da casa** (`SAIDAS_LIVRES.ir`) não conhece «vou pela rua até», «continuamos a caminhar»,
   «saímos… pelo portão» nem «seguimos para a paliçada». Daí saem 4 dos frios e 2 dos falsos.
2. **As leituras do catálogo que erram a cena**: o acampamento lido como orientar e o «avanço sobre» que não é
   lido como ataque. Pertencem a `desafios.js`/`agressao.js`, que estão fora do meu território.
3. **A pergunta de direção e preço** («onde fica a estalagem e quanto custa») ainda vira conversa da etapa. O
   balcão só se reconhece na oração com «quanto custa».
4. **Olhar uma pessoa** («o que ela traz no avental») encaixa no revistar do sítio.
5. **A toca não tem solução de olhar.** Quem examina a toca à procura do bicho fica frio. É o molde `derrotou`
   (lutar, emboscar, intimidar, capturar, fugir), e uma exceção em `excecoes-da-prova.js` resolveria.
6. A régua do conversador é um jogador e uma semente. Os 23 turnos dependem da sorte do dado. A prova jogada
   (fase B) é que diz se três etapas em vinte e poucos turnos parecem mesa.

## 8. A minha leitura

**Sim, está pronto para a fase B**, com duas ressalvas escritas acima. A frase composta já não foge pela porta de
ir. A conversa certa vira dado no primeiro turno. O socorro e as amarras rolam sem queimar a etapa. O «sem nada»
continua em zero, e ninguém fica preso. Os 17% de falsos encaixes vêm quase todos de leituras da casa (o «ir», o
catálogo), e a fase B vai herdá-los de qualquer forma, porque o jogo de hoje lê com essas mesmas funções. Corrigi-
los no `desafios.js` é trabalho do outro território. O número que a fase B precisa de vigiar é o primeiro turno
na abertura: se «vou ao curral e falo com a pastora» sair como solução com dado, o desenho aguenta.
