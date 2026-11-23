# O Mestre vivo — décima sétima sessão jogada (22/11/2026): uma porta só, e o que ela deixou passar

Commit jogado: `265f14d` (v9.675, lido em `src/constantes.js` da cópia). Cópia limpa fora do repositório (`git archive` em `$TEMP/jogar-265f14d`, `node_modules` por junção, Vite na porta 5217), `?mestre=1`, IA real, Edge headless por CDP com perfil novo (`perfis-jogar/s17`). O console foi capturado a cada turno (gancho em `console.info`): as 47 frases digitadas têm a linha `[o ouvido] {…}`, guardadas em `s17-ouvido.txt` do scratchpad. Nenhum arquivo do projeto foi tocado, fora este relatório.

**Campanha (nova, nada a ver com as 14–16):** Fantasia medieval · **A Torre** (andares empilhados: «Andar 1 — do Sal») · Jornada do Herói, tom «Cronista», lei «Terra é poder». Herói: **Osric, Tiefling Feiticeiro, «Filho da Guilda dos Dedos»**, com o companheiro **Loras (Monge)**. Cidade Balcão do Degrau. Quest: **«As Chaves da Guarda»** (Ouvir Brannoc → Saber quem da guarda come da mão de quem paga → Tirar quem paga de dentro de Balcão → Decidir o que fica da guarda). Ao fechar nasceu **«O Último a Sair — Ver o que resta de Passagem do Sino»**.

**Orçamento:** 47 frases digitadas + 8 cliques que geraram turno (2 viagens, «Falar» do cartão Frente a frente, 3 ataques, «Poupar», «Escolher» do desfecho) = 55 turnos, abaixo do limite de 60. Um turno foi reenviado por «Tentar de novo» porque a IA bateu no **teto diário de 500 chamadas** (frase 8; «a mesa do Mestre fechou por hoje… volta às 21h»): esperei a virada e reenviei, sem frase nova. Numeração = ordem da frase digitada.

## 1. A quest (na 16: fechou na frase 34, 2 cartas, 21 turnos perdido, 2.ª parada 26 frases)

| batida | frase | o que foi |
|---|---|---|
| destino dito | 1 e 8 | f1: a carroça e Brannoc; f8 (Mordecai, que o sistema nem tinha): «Arno foi à Roda dos Insones», e o botão dizia «Ir até Roda dos Insones» |
| passo 1 «Ouvir Brannoc» | 5 | só virou na 5.ª frase: nas frases 1 a 4 ele falou, prometeu e **sumiu** («Brannoc não está. A carroça partiu», f4, com ele de pé na frente de Osric duas frases antes) |
| passo 2 «Saber quem paga» | 12 | virou por uma **falha** de Persuasão (13 contra 16) no empréstimo de um mapa, sem relação com o passo |
| passo 3 «Tirar quem paga de dentro de Balcão» | luta (turno ~31) | virou ao poupar o Godfrey Punho-de-Pedra, que a prosa **nunca apresentou** |
| desfecho | luta | cartão de 3 caminhos com GANHA e CUSTA antes do clique |
| quest cumprida | clique de «Escolher» (turno 34 de 55) | «★ cumprida», +100 XP, +37 moedas |

- **Fechou: 1.** Em **26 frases digitadas + 8 cliques = 34 turnos** (na 16: 34 frases, 36 com cliques). **Cartas viradas: 1** (`quadro.cartas`), mais o cartão «Frente a frente» (na 16: 2).
- **Prosa e botão concordaram** em 4 turnos (8 a 11, a ida à Roda). **Divergiram** em 5 momentos: f4 (a carroça partiu × botão «Balcão»), f19 e f24 (Brannoc manda para «a guilda dos puxa-fios, Andar dos Ossos», o quadro diz «dentro de Balcão»), f25 («desço ao Andar dos Ossos»: a prosa descreve a descida e o sistema não se mexe; na f26 a prosa **desfaz** a descida), f42 («Passagem do Sino» × botão «Partir para Andar 21»).
- **O que o desfecho fez na ficha:** +100 XP e +37 moedas, aplicados **um turno depois** do clique (XP 191→291, ◉63→100). O Tônico «no chão» já estava na bolsa. Preço de falha: não houve falha com preço.
- **A segunda quest andou? Não.** «Ver o que resta de Passagem do Sino» ficou em **0 de 1 por 21 frases** (27 a 47, mais 2 cliques). O botão «Partir para Andar 21 — das Cinzas» abre o aviso honesto «Não há caminho direto — o portal deste andar leva ao Andar 2», e o «Partir» do cartão não faz nada. Nenhum botão leva a Passagem do Sino e a prosa não aponta o caminho (na f42 Loras só «acena»).
- **Turnos perdido: 36** (na 16: 21). Quest 1: **15** (f4, e f13 a f26: o passo pedia «tirar quem paga a guarda» e **ninguém dizia quem**; o jeito de achar estava dentro da gaveta «Em cena», no cartão «Frente a frente», que só abri na f26 olhando a árvore da página). Quest 2: **21**.

## 2. O elenco (na 16: 1 nome, 3 lugares)

Falaram com nome: Brannoc Filho da Névoa, Hilda Passo-de-Gato, **Hilda «o Andarilho»** (uma segunda Hilda, papel de «trocador»), Jora, Fendrel Barba-Ruiva, Kolvar o Silencioso, **Morgane**, **Mordecai**, Loras, a vendedora do Cálice Amargo (sem nome) e, citado, Arno.
- **Falaram sem estar em «Em cena»: 4 pessoas.** Brannoc nas frases 1 a 4 (ele só entra em «Em cena» na f5); **Morgane** (4 falas, nunca esteve na lista); **Mordecai** (1 fala, f8); Arno (citado como se estivesse no Cálice).
- **Nomes que a prosa criou e o sistema não tinha: 3** (Morgane, Mordecai, Arno). Lugares: **1** («Andar dos Ossos» + «guilda dos puxa-fios», f19); o «Cálice Amargo» e a «Roda dos Insones» o sistema tinha.
- **O vilão da quest, Godfrey Punho-de-Pedra, existiu só no sistema:** 0 falas, nunca citado pela prosa antes da luta, e o cartão abriu o «Terreno: na boca da caverna / atrás das estalagmites / no poço escuro» numa feira (frase do passo 3). Brannoc, no mesmo turno, entrega «uma lasca de osso e uma moeda riscada» que ninguém mais citou.
- **Objeto como pessoa em «Em cena»: 4 nomes** («Corda que sempre volta enrolada» desde a f4, «Mapa de Vão II», «Mapa de Vão III», «Mapa de Alto IV», «Poção de Mana Média»). **Duas Hildas** na mesma lista a partir da f6. O quadro chama Brannoc de «Catador de espólios» e a prosa o faz capitão da guarda.

## 3. Troca por troca (na 16: 12 de 40, 30%)

Frases de troca ou que procuraram ser: **31** (as 47 digitadas menos 16 de conversa, movimento e atos). Do console `[o ouvido]` e da lista de mensagens.

| f | o que digitei | o ouvido leu | resposta do sistema | ficha antes → depois | prosa | classe |
|---|---|---|---|---|---|---|
| 4 | «Brannoc, me vende uma corda dessas…» | comprar, Brannoc **longe**, nao/ausente | nenhuma | ◉25 → 25 | «Brannoc não está. A carroça partiu» (2 turnos depois de ele estar na frente) | (i) |
| 7 | «Entrego a ela cinco moedas e peço o nome» | dar 5, Hilda o **Andarilho** (a outra), aplicado | **duas linhas** «◉ −5 … (bolsa ◉ 20)» e «◉ −5 moedas» | ◉25 → **15** | Hilda recebe 5 e dá o nome | (i) |
| 9 | «Mordecai, me serve uma caneca… na minha conta» | agir | nenhuma | igual | serve a caneca, fiado aceito | (ii) |
| 12 | «Jora, me empresta esse mapa só um minuto» | emprestar, dado | cartão Persuasão 16; 13, falha | igual | Jora nega | concorda |
| 13 | «Jora, troco a minha gazua de osso por um nome» | escambo, minha, nao_vende | «Jora não troca isso.» | igual | «o osso não solta o nome» | concorda |
| 14 | «deixo seis moedas… no bolso da Jora» | dar 6, Jora, aplicado | **duas linhas** | ◉15 → **3** | Jora recebe 6, **não dá o nome** | (i) |
| 15 | «me dá o nome, ou me devolve as seis. Estou cobrando.» | trocar, pergunta | «O que você faz com as moedas? 1. Dar · 2. Emprestar · 3. Vender» | igual | nenhuma | (i) |
| 16 | «2» | «empresto 6 moedas a Jora» | «Não chega: você tem ◉3» | igual | «o saquinho não tem seis moedas para emprestar» | (i) |
| 17 | «tiro a bolsinha de moedas do cinto do Kolvar» | agir (sem furtar) | cartão Prestidigitação 15; 11, falha; «Fendrel vê» | igual | Fendrel o pega | concorda |
| 18 | «Peço desculpas ao Fendrel, pego Loras… e volto ao Balcão» | pedir «desculpa» | «Fendrel não tem desculpa para dar.» + viagem | igual | **duas** falas do Narrador na mesma frase, uma com «E tu… trouxeste» | (i) |
| 20 | «Morgane, me vende uma dessas velas? Dou duas moedas.» | comprar, coisa **«dessa»** | «Ninguém aqui vende dessa.» | igual | «duas moedas não compram vela» | (i) |
| 23 | «Pego a vela preta que ela me estendeu» | pegar, quem=«Guarda» | «Não há vela aqui que se leve» | igual | a prosa **tinha dado** a vela na 22 e agora a retira | (iv) |
| 27 | «quanto custa uma corda? Se for menos de cinco, eu compro» | comprar, nao_vende | «Hilda não vende isso.» | igual | evasiva, sem preço | (v) |
| 28 | «Vendo o retalho de couro pra Hilda por duas moedas» | vender | «Hilda não cede: nada muda de mão.» | igual | «Por duas não» | concorda |
| 29 | «…dou duas moedas ao Mordecai» (ausente) | agir | **nenhuma** | igual | «As moedas seguem na sua bolsa.» (poda do conferente trocou o pagamento) | (ii) |
| 30 | «Passo três flechas pro Loras» (não tenho) | agir | nenhuma | igual | Loras pega as flechas | (iv) |
| 31 | «Brannoc, suborno você: quinze moedas…» | **subornar**, 15, aplicado/dado | **nenhuma**, sem dado | ◉100 → 100 | Brannoc embolsa as 15 | (iv) |
| 32 | «Isso eu já sabia. Me devolve as quinze moedas.» | pedir de graça | «Brannoc não tem moeda para dar.» | igual | «o couro da bota faz um volume» (tem) | (iii) |
| 33 | «Arranco a corda fina das mãos da Hilda» | furtar/tomar, dado | Atletismo 15; 19, sucesso; «Você arranca a Corda» | corda entra | a prosa narra uma **pedra** que se move | (v) |
| 34 | «estendo a corda de volta a ela: devolvo» | dar, aplicado | «Corda… agora é de Hilda» | corda sai | «sem tocar na corda… devolve a quem te deu» | (iii) |
| 35 | «Compro uma poção de mana pequena…» | comprar, aplicado | cartão «◉ 15 · a bolsa fica com ◉ 85» | ◉100 → 85, +poção | a vendedora entrega o frasco | concorda |
| 36 | «Vendo o retalho de couro e o tônico pra vendedora» | vender | cartão «◉ +3 → ◉ 88» | ◉85 → 88, retalho sai | «Três pelo retalho. O tônico fica.» | concorda |
| 37 | «Pago a gorjeta pra vendedora: uma moeda, e pago o pão do Loras» | pagar 1 | **duas linhas** | ◉88 → **86** | pão a Loras (preço não dito) | (i) |
| 38–39 | «Loras, fica com o tônico, de presente» e «Dar» | trocar sem subtipo → pergunta | «O que você faz com o Tônico? 1. Dar…» e depois «agora é de Loras» | tônico → Loras | «Obrigado… vou guardar» | concorda |
| 40 | «Hilda, você é uma velha trambiqueira…» (ofensa) | trocar, corda, pergunta | «O que você faz com a Corda? 1. Comprar · 2. Pedir · 3. Furtar» | igual | nenhuma | (i) |
| 41 | «Deixa pra lá a corda. Brannoc, deixa que eu carrego esse fardo» | comprar corda (a pergunta acumulou) | «Brannoc não vende Corda» | igual | «A escada não foge» | (i) |
| 43 | «Brannoc, me dá um pedaço desse pão» | pedir, coisa **«pedaço»** | «Brannoc não tem pedaço para dar.» | igual | «Não tenho pedaço de graça» | concorda |
| 44 | «Pego a pedra estrelada que ficou no chão» | pegar | «Não há pedra aqui que se leve.» | igual (a rúnica já estava em `equipamento`) | «Não há pedra estrelada ali» | concorda |
| 45 | «Não quero comprar nada, Hilda, só olhando» | falar | nenhuma | igual | Hilda responde | concorda |
| 46 | «Jora, me empresta aquele mapa agora…» (ausente) | emprestar, Jora **longe**, nao/ausente | nenhuma | igual | Jora **aparece** e responde | (iii) |
| 47 | «Brannoc, pago o que devo do pão: duas moedas» | pagar 2, aplicado | **duas linhas** | ◉86 → **82** | «recolhe as duas moedas» | (i) |

**Total de concordância: 10 de 31 (32%)** (na 16: 12 de 40, 30%). Por classe: (i) o sistema leu ou aplicou errado **11**; (ii) sem resposta **2**; (iii) a prosa contrariou o aplicado **3**; (iv) a prosa deu o que o sistema negou ou não decidiu **3**; (v) detalhe trocado **2**. Os 10 concordantes: 12, 13, 17, 28, 35, 36, 38–39, 43, 44, 45.

- **Frases com duas respostas do sistema: 5** (na 16: 3). Quatro são **débito duplicado**: **toda frase de pagamento sem cartão** (7, 14, 37, 47) tem uma linha «◉ −N: … (bolsa ◉ X)» e outra «◉ −N moedas», e a ficha perde 2N (14 moedas a mais no total). Com cartão: 0 de 2. A quinta é a f41 (a pergunta pendente mais uma negativa).
- **Frases sem leitura do ouvido: 0 de 47** (na 16: 5). A porta antiga morreu como porta de leitura: o ouvido leu todas, e o cartão morto «O ela não está aqui para comprar» não apareceu.
- O que o derruba agora já não é a porta antiga: é (1) o **débito duplo**, (2) pedido de desculpas, ofensa, «deixa pra lá» e «estou cobrando» lidos como troca de objeto, (3) a prosa que dá e tira item por conta própria.
- **Cobertura dos 12 tipos:** comprar (4, 20, 35), vender (28, 36), pagar (37, 47), dar (7, 14, 39), pedir (43), pegar (23, 44), furtar (17, 33), emprestar (12, 46), devolver (34), subornar (14, 31), coisa por coisa (13), cobrar (15, 32).

## 4. As perguntas numeradas (na 16: 5, nenhuma certa, uma repetida 3 vezes)

**Vieram 4** (f15, f38, f40, e uma ao clicar «Escolher» no desfecho: «A quem você devolve o chave? 1. Brannoc · 2. Godfrey · 3. Hilda · 4. Loras», com o gênero errado, porque o texto do cartão virou frase de troca). **Eram a pergunta certa: 0 de 4.** Cobrar virou «Dar / Emprestar / Vender»; «fica com o tônico, de presente» (já era dar) pediu desambiguação; ofensa virou pergunta sobre a corda.
- **Por número** (f16 «2»): fechou, mas virou «empresto 6 moedas a Jora» e «Não chega». **Por nome** (f39 «Dar»): fechou certo. **Nenhuma repetida** (melhora: na 16 foram 3 idênticas). **Custaram 3 frases** (16, 39, e a 41 para sair do laço; sair por frase nova funcionou, mas a pergunta anterior **acumulou** na 41).

## 5. Os cartões com preço

**Cartões de preço: 2 de troca** (compra ◉15 e venda ◉+3) mais 2 de viagem, o «Frente a frente» com chance e custo, e o de desfecho com GANHA/CUSTA. Os 2 de troca **bateram** com a bolsa (100→85, 85→88) e com a prosa («Três pelo retalho»). **Saíram sem eu ver o preço: 4 pagamentos** (7, 14, 37, 47: eu disse o valor, nenhum cartão) e **todos debitaram o dobro**; e o pão da f37 saiu sem preço nenhum.

## 6. As negativas (na 16: 12, das quais 5 um mestre real daria)

**11 linhas de negativa** (13, 16, 18, 20, 23, 27, 28, 32, 41, 43, 44). **Um mestre real também negaria 5** (13, 16, 28, 43, 44); **6 não**: 18 (desculpa), 20 («dessa»), 23 (a prosa tinha dado a vela), 27 (era pergunta de preço), 32 (a moeda estava na bota), 41 (negação lida como compra).

## 7. Silêncios (na 16: 8 puros e 31 pela régua da 15)

Frases de troca **sem resposta do sistema: 5** (9, 29, 30, 31, 46), mais **3 atos sem marca** (3 promessa, 40 ofensa, 41 ajuda). Pela régua da 15 (silêncio + leu errado + negou o que um mestre aceitaria): **21 trocas + 3 atos = 24 de 47** (na 16: 31 de 60).

## 8. Progressão e loot (na 16: 168 XP, 26 frases sem ponto antes do fecho e 26 depois)

- **XP em 10 pontos:** f1 0 · f5 34 · f10 68 · f11 85 · f18 102 · f22 119 · f26 119 · luta 191 (+72) · f27 291 (+100 do desfecho) · f33 nível 2 (XP 8 no nível novo). **308 XP no total.** Pontos de «risco enfrentado e vencido» em coisas sem risco (f10: beber a caneca; f18: voltar à cidade).
- **Maior sequência sem XP: 14 frases** (34 a 47, depois do nível 2); antes do fecho, 4 (23 a 26). Na 16: 26 e 26.
- **Níveis: 1** (nível 2 na f33, por um Atletismo de 19 ao tomar a corda): +1 ponto de habilidade, +2 de atributo e +1 de heroísmo, **não gastei** (o jogo avisa «▸ Talentos — você tem o que gastar»). Na 16: 0.
- **Moeda (10 pontos):** f1 25 · f7 15 · f14 3 · luta 3→63 (+34 espólio, +26 soldo) · fecho 100 · f35 85 · f36 88 · f37 86 · f47 82. Dos 14 perdidos a mais, nada voltou.
- **O que entrou na ficha, e de onde:** Rúnica Estrela de Prata do Inverno (rara, amuleto, da luta; foi para `equipamento`, o painel de itens não a mostra com os outros), Tônico Revigorante e Retalho de Couro (luta), Corda (tomada de Hilda, depois devolvida), Poção de Mana Pequena (comprada), +100 XP/+37 moedas do desfecho. **Ganhos reais: 5.**

## 9. Diálogo e eco (nota 0 a 2: voz, desejo, saber, utilidade)

| personagem | falas | voz | desejo | saber | utilidade | total |
|---|---|---|---|---|---|---|
| Hilda Passo-de-Gato / o Andarilho (as duas) | 8 | 2 | 1 | 2 | 2 | **7** |
| Brannoc Filho da Névoa | 10 | 2 | 2 | 2 | 1 | **7** |
| Morgane (fora de «Em cena») | 4 | 2 | 1 | 2 | 1 | **6** |
| Jora | 4 | 2 | 1 | 1 | 1 | **5** |
| Loras (companheiro) | 6 | 1 | 1 | 0 | 1 | **3** |
| vendedora do Cálice Amargo (sem nome) | 3 | 1 | 0 | 0 | 2 | **3** |

As vozes estão boas: Hilda («Procuras coisa, ou coisa te procura?»), Brannoc (cansado, «Aqui, até a fome se paga»), Morgane («Guarda não… Melhor mão vazia que mão marcada»). O saber é bom (o nome de Arno, a dívida «ao alto», a guilda), mas **a quest não o usa**: o passo 3 não nomeia ninguém e a luta é contra um nome que nenhuma voz disse.

**Ecos dos 5 atos:** promessa (f3) → imediato (pão de Brannoc, «Bom presságio», Loras), **nunca voltou**; mentira (f22, Enganação 27 contra 14, a folga «compra alguma coisa») → imediato (a vela preta) e **voltou na f26** (Brannoc reage à vela, 4 turnos depois), o melhor eco; presente (f38, o tônico a Loras) → imediato («vou guardar para quando a noite apertar»), não voltou; **ofensa (f40) → nenhum** (Hilda calada: a frase virou pergunta sobre a corda); ajuda (f41) → imediato e frio («A escada não foge»), sem XP nem nota. **4 de 5 ecoaram no mesmo turno ou no seguinte; 1 voltou 3 ou mais turnos depois; 1 sem eco algum.** Eco de sistema: só a moeda (e o XP «risco vencido» sem ligação).

## 10. O sistema na voz do Narrador, rótulos crus, texto cortado, PT-PT

- **Voz do sistema dentro da cena: 2 turnos.** f29 «As moedas seguem na sua bolsa.» (a poda do conferente cortou o pagamento e deixou esta frase no lugar, em cima de uma frase que já tinha desmentido); f18 o Narrador responde **duas vezes** na mesma frase.
- **Rótulos crus: 5.** «Ninguém aqui vende **dessa**» (f20), «não tem **pedaço** para dar» (f43), «Hilda **o Andarilho**» (papel virou sobrenome), «devolve **o chave**» (gênero), «Terreno: na boca da caverna…» numa feira. O cartão de viagem escreve «⚿ Não há caminho direto» (bom) e o botão «Partir» não faz nada.
- **Texto cortado: 0.** «[…]»: 0.
- **PT-PT: 7 turnos**, todos de «tu»/«tua» ou de futuro do subjuntivo: Fendrel «Tua mão foi mais rápida» (17), «E tu? O que trouxeste da Roda para mim?» (18), Morgane «tu não me conhece» (22), Hilda «se tu soubesse» (28), «de mão tua pra minha» (32), «da tua mão pra minha» (34), e o cartão do desfecho «para onde fores». Na 16 foram 0.

## Os dez pontos em que um mestre de mesa bom teria feito diferente (por impacto)

1. **Frases 7, 14, 37, 47: todo pagamento digitado debita o dobro.** O jogo: duas linhas por frase e a ficha cai 10 por 5, 12 por 6, 2 por 1, 4 por 2 (14 moedas a mais); com cartão, 0 de 2. O mestre: o que o jogador paga sai da bolsa uma vez, e é o número que ele disse.
2. **Frases 13 a 26 e a luta: o passo 3 pede «tirar quem paga» e ninguém diz quem.** O jogo: 14 frases perdido; o jeito de achar (o cartão «Frente a frente») morava dentro de «Em cena»; o vilão, Godfrey, apareceu sem uma fala e num terreno de caverna em plena feira. O mestre: alguém diz o nome, e a luta começa na cena que a história preparou.
3. **Frases 4, 19, 24 a 26: a prosa inventa para onde ir e o botão não acompanha.** O jogo: «a carroça partiu» (4) com Brannoc na frente duas frases antes; «Andar dos Ossos» (19, 25) descrito como feito e desfeito na frase seguinte (26); «Andar 21» e «Passagem do Sino» sem caminho. O mestre: o destino que ele diz é o destino que existe.
4. **Frases 27 a 47: a segunda quest nasce sem estrada.** O jogo: 0 de 1 por 21 frases; botão «Partir para Andar 21» que avisa «não há caminho» e um «Partir» morto. O mestre: o gancho que fecha a primeira quest já aponta uma porta que abre.
5. **Frase 12: o passo 2 virou por um dado sem relação.** O jogo: Persuasão falhada no empréstimo de um mapa cumpriu «saber quem paga a guarda», e Hilda só deu o nome na 7. O mestre: o passo vira quando o jogador **sabe** a coisa.
6. **Frases 22–23, 30, 31, 37: a prosa dá e tira item que o sistema não decidiu.** O jogo: a vela preta entregue (22) e negada (23); as flechas que não tenho (30); 15 moedas de suborno embolsadas só em prosa (31); o pão sem preço (37). O mestre: o que muda de mão está na ficha.
7. **Frases 15, 18, 40, 41: o ouvido lê pedido de desculpas, ofensa, «estou cobrando» e «deixa pra lá» como troca de objeto.** O jogo: «Fendrel não tem desculpa para dar», «O que você faz com a corda? Comprar·Pedir·Furtar» para uma ofensa, «Brannoc não vende corda» para uma negação. O mestre: nenhuma das quatro é troca.
8. **Perguntas numeradas: 0 de 4 certas, e a resposta «2» virou «empresto 6 moedas a Jora».** O jogo: a pergunta lista verbos de troca para frases que não são troca, e acumula com a frase seguinte (41). O mestre: pergunta só quando falta algo; a resposta é a que o jogador deu.
9. **Elenco: Morgane (4 falas), Mordecai e Brannoc (frases 1 a 4) falam fora de «Em cena»; duas Hildas; 4 objetos (corda, três mapas, poção) na lista de pessoas; Brannoc «catador de espólios» no sistema e capitão na prosa.** O mestre: a ficha da pessoa e a cena dizem a mesma coisa.
10. **PT-PT em 7 turnos e silêncio em 5 trocas (9, 29, 30, 31, 46).** Mais: ofensa sem eco (40), ajuda sem XP (41), 14 frases sem XP depois do nível 2, nível sem tela de gasto. (O que ficou bom: o cartão do desfecho com GANHA e CUSTA antes do clique, a compra e a venda por cartão 2 de 2 certas, e **0 frases sem leitura do ouvido**.)

## O que mudou frente à 16 (por número)

**Melhorou:** frases sem leitura do ouvido **5 → 0**; cartões mortos «O ela não está aqui» **2 → 0**; pergunta repetida **3× → 0**; segunda quest parada **26 → 21**; XP **168 → 308** e **nível 0 → 1**; compra, venda e dar por cartão: **0 erros em 4**; vilão como personagem da prosa **piorou** mas o vilão **do sistema** virou luta jogável com espólio (a luta nunca foi testada na 16).
**Igual:** concordância **30% → 32%**; negativas **12 → 11** (5 → 5 que um mestre daria); fechou a quest em 34 turnos nas duas.
**Piorou:** turnos perdido **21 → 36**; frases com duas respostas **3 → 5** (e agora **toda** frase de pagamento digitada debita o dobro); PT-PT **0 → 7 turnos**; elenco fora de «Em cena» **2 → 4**; ato sem eco **0 → 1**.

## O que não verifiquei

As outras duas cartas do desfecho (expulsar, manter); o que o Narrador recebeu na pauta (só vi a prosa e o quadro: não sei se o nome do vilão chegou a ele); gaveta «Talentos» e o gasto do ponto de nível; Códex e Grimório; as habilidades de Feiticeiro; se o débito duplo também ocorre em «dar» com item (dar tônico não debitou nada, só moeda); a luta além de 3 rodadas contra um inimigo; o Mercado das outras bancas; sensação visual (nenhuma captura); a mesma cena com outra semente; o custo real em chamadas (a sessão bateu no teto diário de 500 chamadas do servidor na frase 8, o que indica que as sessões do dia já o consumiram).
