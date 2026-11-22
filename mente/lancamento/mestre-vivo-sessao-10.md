# O Mestre vivo — décima sessão jogada (22/11/2026)

Commit `8584457` (v9.668), cópia limpa fora do repositório (`git archive`, `node_modules` por junção, Vite na porta 5191), `?mestre=1` (chave ligada: `taverna_cfg_mestre_vivo = 1`), IA real, Edge dirigido por CDP com perfil próprio.
**Ingrid Punho-de-Pedra** (tiefling, caçadora; **Arco Curto e Couro Batido equipados**; mochila vazia; 30 moedas, 13 PV) com **Isolde o Andarilho** (monge; companheira; Espada Curta equipada, bolsa vazia), num mundo de **Fantasia medieval · Terras abertas · Jornada do Herói** (a 8 foi A Torre, a 9 foi O Arquipélago). Quest de abertura: «O que desce ao anoitecer» (Kael perdeu o rebanho).
Lugares: a praça de **Ponte Brumoso** (a banca de ervas do elfo, que o Narrador passou a chamar de Kael, e a banca de **A Vela Silenciosa**; uma velha, um homem de capa, duas carroceiras), **A Feira Gorda** (Rhogar, mercador; a feirante Inga) e **A Guarnição Perdida** (Merek Rompe-Escudos, guarda; um mercador da guarnição).
**60 frases enviadas, 57 viraram turno** (as três que não viraram: 9 «vendo o couro…» e 47 «vendo o arco…», cujos cartões disseram «está em uso: desequipe antes de vender» e não foram confirmados; 11 «vendo a minha espada longa…», que só deu uma linha do sistema, sem narração).
**59 mensagens do Mestre** no save (uma abertura, 57 turnos, e uma segunda narração seguida na viagem à Guarnição) e **14 dados rolados**. **62 chamadas de IA** no console (58 narrações grandes + 4 pequenas), contra 60 frases: dentro do limite duro de 60 frases.
Preços lidos nos painéis do mercado antes de comprar: Balcão de mantimentos: ração ◉ 7, odre ◉ 3, tocha ◉ 1; A Vela Silenciosa: Dente ◉ 61, Clava de Ossos ◉ 88, **Antiga Rapieira ◉ 22**, Diário ◉ 66, Vela ◉ 88; A Bigorna do Vigia: **Rapieira ◉ 88**, Cimitarra ◉ 22; O Martelo Velho: Besta Leve ◉ 20, Grevas ◉ 21.

Método: igual ao da sessão 9 (testador em Sonnet; nenhuma cota de dado; só contam a ação arriscada sem dado e o dado onde um mestre real não pediria). Moedas, mochila, equipamento, equipados, suprimentos, lugar e bolsa de Isolde lidos do save antes e depois de cada turno; linhas do sistema e prosa, da lista de mensagens do save; a tela, do texto da página; o conferente, do console. **Cartões de pagar/vender/ir tiveram os dois cliques dados** (o veredito foi lido e anotado antes do clique; é por isso que o turno 4 abaixo foi confirmado mesmo errado). O cartão de rolar foi clicado sempre.

## Os totais

| | sessão 9 | sessão 10 |
|---|---|---|
| frases (viraram turno) | 59 (58 viraram turno, +1 sem turno) | **60** (**57** viraram turno, +3 sem turno) |
| certos no dado | 54 de 58 | **54 de 57** |
| faltou dado | 4 firmes + 1 discutível | **3 firmes** (15 suborno «esquecer», a Kael; 29 pedir de graça a Rhogar e entrar uma Maçã seca; 44 tomar a faca da mão da feirante e entrar uma Faca) + **0 discutíveis** |
| dado indevido | 0 | **0** |
| leitura errada da frase | 4 | **7** (4 «duas tochas» virou 2 tochas + 3 rações; 5 e 49 «Antiga Rapieira» e «a rapieira» somaram dois itens; 15 suborno a Kael não lido; 29 «amostra das ervas» virou Maçã seca; 55 «o escudo» (item de equipamento) não lido; 60 «o mercador da Guarnição» virou Merek, o guarda) |
| **turnos de troca em que linha, ficha e prosa concordam / total** | **20 de 39** | **30 de 41** (11 discordam: 4, 6, 10, 15, 18, 29, 31, 44, 55, 60 firmes + 53 discutível; se o 53 for tolerado, 31 de 41) |
| prosa contra ficha/veredito/linha (total) | 20 firmes + 2 discutíveis | **10 firmes** (4, 6, 10, 15, 18, 29, 31, 44, 55, 60) **+ 1 discutível** (53); nenhuma fora de troca |
| trocas inventadas pela prosa (entrega, pagamento ou butim sem o sistema) | 12 | **5 firmes** (6 missiva; 15 suborno aceito sem moeda; 18 escudo de Isolde; 55 entrega do escudo a Isolde; 60 «o escudo que você lhe deu») **+ 1 discutível** (53 prego apanhado por Isolde) |
| ausente que aparece | 2 | **2** (38 «chamo Kael, o vendedor de ervas da praça: venha cá!», aparece e fala sem linha «não está aqui»; 28 Kael já aparece na Feira Gorda, atrás de Isolde, sem ter vindo; depois fica em 34, 41, 43) |
| conferente: turnos com corte / cortes / reposições | 6 / 8 / 1 | **1 turno** (10) / **1 corte** / **1 reposição**; `troca: false`; capturei só 2 registros do conferente no console (10 e 14) |
| cortes indevidos | 2 de 8 | **1 de 1** (turno 10: cortou «Estende-lhe um punhado de coroas sem as contar em voz alta.», que era exatamente a venda que o sistema acabara de aplicar, e repôs «Nada muda de mão», falso) |
| frases órfãs | 1 | **0** vistas |
| PT-PT | 3 turnos | **28 de 57 turnos** com segunda pessoa do singular/plural na boca dos NPCs e de Isolde (contagem por expressão regular sobre as 57 narrações: «dizes», «vais», «queres», «sabes», «viste», «pediste», «escolhes», «levas», «tua/teu», «evitais», «acendei», «estás a vender»…). Não é comparável com a 9, que contou 3; a 9 provavelmente contou só o que viu |
| erros de console | 0 | **0** (só `debug`/`info`; `[taverna] juiz: N achados` com «preco 1» nos 15 e 16 e «nome 1» num turno de dado) |
| o que entrou na ficha | 0 achados; 5 butins; 1 item de graça | **0 achados**; **3 butins** (6 ◉ 5; 21 ◉ 6; 26 ◉ 4) e **1 furto bem-sucedido sem moeda** (52, Merek «quase vazia»); **2 itens ganhos sem dado e contra a narração** (29 Maçã seca; 44 Faca); **1 item pego do chão pelo sistema** (51 Escudo de Placas, legítimo) |
| buscas livres com achado | 0 de 6 | **0 de 2** (19 caixotes da praça; 54 palha do estábulo); a prosa pôs «prego de ferradura» à vista no 54 |

O que melhorou, em número: **a compra pela mão que paga cobra uma vez só: 4 de 4** (3 ◉ 7; 4 ◉ 23 (itens errados, ver abaixo); 25 ◉ 14; 53 ◉ 14 com o guarda Merek, personagem da quest, em cena), a bolsa caiu exatamente o que a linha disse. **O fiado agora é negado sem cobrar nem entregar** (7). **Suborno com quantia rola dado em 3 de 4** (14, 16, 58; a moeda saiu só no sim, 16: ◉ 13 → 9). **Vender e dar pelo nome encurtado funciona**: «o couro» abriu o cartão «Vender Couro Batido» com «está em uso: desequipe antes de vender» (9), «o arco» o mesmo (47), «a maçã» (30, 32), «a faca» (45, 48), «o escudo» (57). **O companheiro responde com o veredito certo em 8 de 8** (17 usa a Espada Curta e «não a tira de si para dar»; 18 «não tem isso consigo»; 8 e 33 «abre as mãos vazias: o dinheiro do grupo está na sua bolsa»; 30, 31, 45, 46 dar e devolver aplicam), **mas a prosa desobedece em 18 e 31**. **Pedir emprestado rola Persuasão** (28) e **tomar da mão rola Atletismo** (34). **O furto diz de quem é a bolsa** («Da bolsa do elfo», «do homem», «de Rhogar», «de Merek Rompe-Escudos»; nenhum «a vítima»). **O cartão da Intimidação** diz «Intimidação. Precisa de 15. Se falhar, a pessoa não se dobra.» (39; ficou o texto certo). **O conferente quase não aparece** e, quando aparece (10), erra.

O que não melhorou, ou apareceu: (1) **a regra «Desse jeito você já tentou aqui, e não deu» aplica o ganho sem dado e a prosa nega** (29 e 44: o sistema escreve «🎁 Rhogar lhe dá: Maçã seca» / «✋ Você arranca faca da mão da mulher» **junto** com «↺ Desse jeito você já tentou aqui, e não deu», a ficha ganha o item e o Mestre diz «Erva de graça, nem a sombra» / «Larga… Isto não é teu»). (2) **«dou o escudo à Isolde» (55): sem linha, sem mudança de ficha, prosa entrega.** (3) **O preço de dois itens que casam é somado** («◉ Não chega: Antiga Rapieira, Rapieira custa ◉ 110», 5 e 49; os preços reais eram ◉ 22 e ◉ 88; o Mestre repete «cento e dez coroas»). (4) **O turno 4**: «compro duas tochas do balcão de mantimentos» gerou o cartão «Comprar 2 × Tochas, 3 × Rações de viagem ◉ 23 · a bolsa fica com ◉ 0» e levou todo o dinheiro. (5) A prosa adiantou uma missiva (6), o escudo de Isolde (18, 60) e uma venda que «não muda de mão» (10). (6) PT-PT em quase metade dos turnos.

## Os vereditos por item do roteiro

Aviso de cobertura: o limite de 60 frases acabou antes de eu repetir alguns casos. Marco abaixo o que ficou com **menos de duas vezes**, ou **não** verificado.

1. **Comprar pela mão que paga, com personagem de quest em cena e carta de quest aberta: consertado no que consegui provar; o caso exato NÃO foi provado.** Compras 3 (ração, «dou 7 moedas ao elfo da banca por uma ração de viagem»: ◉ 30 → 23, rações 10 → 11), 25 («dou 14 moedas a Rhogar por duas rações de viagem»: ◉ 15 → 1, rações 12 → 14), 53 («dou 14 moedas ao mercador por duas rações de viagem»: ◉ 19 → 5, rações 14 → 16, **com Merek, o guarda da quest «O que desce ao anoitecer», em cena e a barra de pistas «1 de 2»**): em todas, cartão com o veredito «◉ N · a bolsa fica com ◉ M», linha com o mesmo N, ficha caiu exatamente N, uma vez só. **Não consegui abrir uma carta de quest**: `quadro.cartas` ficou `{}` do começo ao fim (a quest aparece só como «PISTAS · N DE 2»), então o defeito do turno 57 da sessão 9 (a carta «pagar a quem sabe» cobrando de novo) **não foi exercido de verdade**. **Erro novo no turno 4:** «compro duas tochas do balcão de mantimentos» virou «Comprar 2 × Tochas, 3 × Rações de viagem ◉ 23» (ver defeitos). Não testei N menor que o preço com saldo suficiente (a bolsa estava a ◉ 0 no 5; no 49, N não foi dito).
2. **Furtar a bolsa: consertado na linha e no butim; não consertado na prosa.** Sete furtos (6 elfo, 20 velha, 21 homem de capa, 22 carroceira, 26 Rhogar, 52 Merek, 60 «mercador» → Merek). Sucessos: 6 (20 + 2 = 22, crítico, **linha «Da bolsa do elfo: ◉ 5 (bolsa: ◉ 5)»**, ficha 0 → 5, prosa «cinco coroas»), 21 (22, crítico, «Da bolsa do homem: ◉ 6 (bolsa: ◉ 15)», ficha 9 → 15, prosa «seis moedas»), 26 (18 + 2 = 20, «Da bolsa de Rhogar: ◉ 4 (bolsa: ◉ 5)», ficha 1 → 5, prosa «quatro coroas»), **52, o «por um fio» (14 + 2 = 16 contra 15, sucesso): linha «⚖ A coisa vem para a sua mão, mas vem tilintando — e o tilintar tem ouvidos à volta.», «🔊 Isso fez barulho.», «🤲 A bolsa de Merek Rompe-Escudos estava quase vazia: nada que valha levar.», a bandeja «14 ✓ … 14 + 2 = 16 precisa de 15 — ✓ passou», ficha igual, prosa «quase vazia, afinal»: linha, bandeja, butim e prosa dizem a mesma coisa**. Falhas: 20 (3 + 2 = 5), 22 (2 + 2 = 4), 60 (8 + 2 = 10) com prosa coerente. **A linha diz de quem é a bolsa com nome ou papel, nunca «a vítima»**. Defeitos: a prosa inventou «uma missiva ordinária» que a ficha não tem (6); linhas de falha em primeira pessoa («Alguém na rua vê a minha mão onde ela não devia estar», 20 e 22; «Merek Rompe-Escudos vê a minha mão onde ela não devia estar», 60); **60 «furto a bolsa de moedas do mercador da Guarnição» foi lido como furto de Merek, o guarda**, e a prosa pôs Isolde segurando «o escudo que você lhe deu» (o escudo tinha sido vendido no 57). **Não vi uma falha por 1 ou 2** (a regra «falhar por pouco, conseguindo pagando» não foi exercida).
3. **Pedir fiado: consertado, mas só uma vez (a regra pedia duas).** 7 «levo um odre de água do balcão e pago amanhã, fiado»: linha «⛔ Fiado não: aqui se paga na hora.», nada cobrado (◉ 5 → 5), nada entregue (água 10 → 10), prosa «Fiado, não. Água da minha fonte custa agora.» A prosa, porém, pôs um «taverneiro» e um «balcão» na praça (e em 8 uma «estalagem»), sem o herói ir a lugar nenhum.
4. **Suborno com quantia: consertado em 3 de 4; não consertado em 1 (15).** 14 «ofereço 3 moedas ao elfo para ele ficar calado sobre a bolsa»: Persuasão precisa de 14, 3 + 2 = 5, falha, moeda não saiu (◉ 13 → 13), prosa recusa. 16 «ofereço 4 moedas ao vendedor para ele não gritar ladrão»: 14 + 2 = 16, sucesso, «◉ 4 moedas mudaram de mão», ◉ 13 → 9, prosa «As quatro moedas somem no avental do elfo». 58 «ofereço 5 moedas a Merek para ele esquecer que me viu perto da bolsa dele»: 5 + 2 = 7, falha, moeda não saiu (◉ 15 → 15), prosa devolve as cinco. **15 «ofereço 5 moedas a Kael para ele esquecer que me viu perto da bolsa»: sem dado, sem linha, a ficha igual, e a prosa aceita («Enfim, ele faz que sim… Kael não viu»)**. A diferença entre 15 e 58 é só o nome: Kael é, para o sistema, alguém que «não está aqui» (13). Em todos os dados do suborno aparece a linha «🗣 O que você pôs na mesa não paga o que está pedindo.», **inclusive no que passou (16)**.
5. **Vender e dar item pelo nome encurtado: consertado; o caso de dois itens que casam NÃO foi provado.** Vender: 9 «o couro» → «Vender Couro Batido… está em uso: desequipe antes de vender»; 47 «o arco» → o mesmo; 32 «a maçã» → «Vender Maçã seca ◉ +7», ◉ 5 → 12, mochila vazia, prosa «Sete coroas»; 48 «a faca» → ◉ +7, 12 → 19; 57 «o escudo» → «Vender Escudo de Placas ◉ +10», 5 → 15. Dar: 30 «dou a maçã à Isolde» («🤝 Maçã seca agora é de Isolde o Andarilho.», sai da mochila e entra na bolsa dela) e 45 «dou a faca à Isolde» (idem), prosa de acordo. **55 «dou o escudo à Isolde»: sem linha, sem ficha, prosa entrega (defeito).** **Dois itens que casam com a mesma palavra:** na mochila nunca tive dois itens que casassem; **no mercado, «a rapieira» casou com «Antiga Rapieira» (◉ 22) e com «Rapieira» (◉ 88) e o sistema não perguntou «qual?»: somou os dois e disse «custa ◉ 110»** (5, 49). Esse é o único caso de ambiguidade que vi, e não é o que a regra queria.
6. **Pedir ao companheiro: consertado na linha e na ficha; a prosa desobedece em 2 de 8.** O que ele veste (17): «🤝 Isolde usa Espada Curta e não a tira de si para dar.», prosa recusa, ficha igual. O que ele não tem (18 «o seu escudo de ferro»): «🤝 Isolde não tem isso consigo.», **a prosa inventa «a correia do escudo puxada contra o ombro»**. «Me devolve» (31 «Isolde, me devolve a maçã»): linha «🤝 Isolde passa a você: Maçã seca.», ficha devolvida (mochila: Maçã seca), **a prosa recusa («Agora não… Pediste para guardar. Guardei»)**; 46 «Isolde, me devolve a faca, por favor»: linha «Isolde passa a você: Faca.», ficha devolvida, prosa «Toma. Guarda bem.» (de acordo); 56 «Isolde, me devolve o escudo»: «Isolde não tem isso consigo.», prosa «Nunca o guardei» (de acordo com a ficha; contradiz a prosa do 55). Moeda: 8 «paga uma caneca de hidromel para mim» e 33 «me dá cinco moedas da sua bolsa»: «Isolde abre as mãos vazias: o dinheiro do grupo está na sua bolsa.», ficha igual, prosa recusa. (A linha agora fala como a mesa, e não como «a bolsa do grupo é a que você carrega».)
7. **Figurante de graça e emprestado: NÃO consertado.** Coisa que ele tem: 41 «peço de graça a Kael um punhado das ervas dele, para provar» rola Persuasão 15 (18 + 2 = 20, sucesso, «Kael deixa você provar ali mesmo», nada entra, prosa de acordo). Emprestado: 28 «peço emprestado a Rhogar um odre de água, devolvo amanhã» rola Persuasão 15 (9 + 2 = 11, falha), prosa nega. **Mas 29 «peço de graça a Rhogar uma amostra das ervas da banca» (a primeira vez que se pedia «de graça» depois da falha do 28) não rolou: «🎁 Rhogar lhe dá: Maçã seca.» + «↺ Desse jeito você já tentou aqui, e não deu.»; a ficha ganhou a Maçã seca; a prosa disse «Erva de graça, nem a sombra».** O mesmo erro da sessão 9 (turno 22). Coisa que ele não tem: 42 «peço a Rhogar uma das cordas da banca, de graça»: «🎁 Rhogar não tem das cordas para dar.» (linha mal formada) + «↺…»; 43 «peço emprestado a Kael o cavalo branco dele»: «🎁 Kael não tem cavalo branco para dar.», prosa «Não tenho cavalo». Esses dois estão certos.
8. **Tomar algo da mão de alguém: consertado em 1 de 2.** 34 «tomo o odre vazio da mão de Rhogar e guardo na mochila»: Atletismo 15, 4 + 2 = 6, falha, «🔊 Isso fez barulho.», «✋ Rhogar segura firme: a mão volta vazia.», prosa de acordo. **44 «tomo a faca da mão da mulher de avental de farinha e guardo no cinto»: sem dado; «✋ Você arranca faca da mão da mulher.» (sem artigo) + «↺ Desse jeito você já tentou aqui, e não deu.»; a ficha ganhou a Faca; a prosa diz «A lâmina não cede… Isto não é teu».** Mesmo defeito do 29: a regra «já tentou aqui» não impede o ganho.
9. **Vender o que não se tem; vender recurso; item equipado: consertado.** Não se tem (11 «vendo a minha espada longa ao elfo»): «🎒 A espada não está na sua bolsa — não há o que vender.» (só uma vez, **e a frase não virou turno, sem narração**). Recurso de uso: 10 «vendo duas rações ao elfo» (◉ +7, rações 14 → 12, ficha e linha de acordo; **prosa «Nada muda de mão»**, defeito) e 12 «vendo duas tochas ao elfo» (◉ +1, tochas 7 → 5, prosa de acordo). Equipado: 9 e 47, cartão «está em uso: desequipe antes de vender», o botão Vender sem efeito (verificado: o botão não apareceu como confirmável nas 3 leituras). Ressalva: o cartão diz «à Vela Silenciosa» (a banca) quando a prosa faz Rhogar ou o elfo comprar.
10. **Buscas, caminho, ausente, intimidação: parcialmente verificado.** **Buscas livres em dois lugares, não três** (19 caixotes atrás das bancas; 54 palha do estábulo): sem dado, 0 de 2 com achado, prosa «Nada escondido»; no 54, «prego de ferradura» à vista e, no turno 53, Isolde apanha um prego («prego dobrado em gancho») que a ficha não tem (discutível). **Perguntas de caminho** (37 Rhogar → Guarnição Perdida; 59 Merek → Alicerces de Ferro): respondidas, o herói não se moveu; a viagem real foi pelo cartão («vou até a Feira Gorda», «vou até a Guarnição Perdida»: «📍 Você está na…»). **Falar com ausente**: 38 «chamo Kael, o vendedor de ervas da praça: venha cá!»: aparece e fala, **sem linha «não está aqui»** (defeito conhecido; antes, 13 «pergunto a Kael o que aconteceu…» tinha dado «🧭 Kael não está aqui.» e a prosa o fez falar do mesmo jeito); 40 «chamo Bertrand, o ferreiro» (inventado): «O nome não acha dono na praça», ninguém vem (certo). **Intimidação** (39 «ameaço Rhogar: conta o que viu nas traseiras ou eu quebro a sua banca»): Intimidação 15, d20 9, falha, «🔊 Isso fez barulho.», cartão com o texto certo; a prosa fez Inga entrar em cena («Ouvi gritaria»). Uma só intimidação (a regra pedia duas).

Conversa pura (turnos 1, 2, 13, 24, 27, 35, 36, 37, 38, 40, 59): **11 turnos, não 15**, 0 dado, 0 dado indevido. Mais 2 buscas sem dado (19, 54).

## Cortes do conferente

Só capturei dois registros no console (turnos 10 e 14); nos outros turnos o console não trouxe `[conferente]`.

| turno | motivo | frase cortada (inteira, do log) | julgamento |
|---|---|---|---|
| 10 | objeto | «Estende-lhe um punhado de coroas sem as contar em voz alta.» | **indevido**: era o pagamento da venda que o sistema acabara de aplicar («🛒 Vendido: 2 rações à Vela Silenciosa por ◉ 7»); `troca: false` (devia ser `true`); **reposição: «Nada muda de mão.»**, que é falsa |

Do turno 14 (suborno com dado): `{"podadas":[],"cortes":[],"troca":false,"frente":true,"repostas":0}`. **Não cortou o que devia:** 6 (missiva), 18 (escudo), 31 (recusa de devolver), 55 (entrega do escudo), 60 («o escudo que você lhe deu») e as duas negativas que contradizem a linha (29, 44).

## O que o sistema negou

| turno | linha | soa como |
|---|---|---|
| 5, 49 | «◉ Não chega: Antiga Rapieira, Rapieira custa ◉ 110, e a bolsa tem ◉ N.» | **errada** (soma de dois itens; os dois números do veredito estão errados) |
| 7 | «⛔ Fiado não: aqui se paga na hora.» | mesa |
| 8, 33 | «🤝 Isolde abre as mãos vazias: o dinheiro do grupo está na sua bolsa.» | **mesa** (melhorou) |
| 17 | «🤝 Isolde usa Espada Curta e não a tira de si para dar.» | mesa |
| 18, 56 | «🤝 Isolde não tem isso consigo.» | mesa (certa) |
| 11 | «🎒 A espada não está na sua bolsa — não há o que vender.» | mesa |
| 9, 47 | «está em uso: desequipe antes de vender» (no cartão) | mesa (instrução) |
| 42 | «🎁 Rhogar não tem das cordas para dar.» | **erro** («das cordas») |
| 43 | «🎁 Kael não tem cavalo branco para dar.» | mesa |
| 29, 42, 44 | «↺ Desse jeito você já tentou aqui, e não deu. Com ajuda, outra ferramenta ou bem mais tempo, talvez.» | **erro** (fala do sistema, e em 29 e 44 contradiz o ganho da linha ao lado) |
| 34 | «✋ Rhogar segura firme: a mão volta vazia.» | mesa |
| 44 | «✋ Você arranca faca da mão da mulher.» | **erro** (sem artigo; positiva, contradita pela prosa) |
| 20, 22, 60 | «↯ Alguém na rua vê a minha mão onde ela não devia estar.» / «Merek Rompe-Escudos vê a minha mão…» | **erro** (primeira pessoa) |
| 14, 16, 58 | «🗣 O que você pôs na mesa não paga o que está pedindo.» | erro quando o suborno passa (16) |
| 15 | (nenhuma linha) | falta o veredito |
| 55 | (nenhuma linha) | falta o veredito |

## Turno a turno

Numeração = a das 60 frases enviadas, na ordem (as que não viraram turno: 9, 11, 47). ◉ = moedas. «troca» = turno que conta no placar. C = linha, ficha e prosa concordam; D = discordam; n/a = não é troca.

| # | frase | dado | linhas do sistema / cartão | ficha antes → depois | prosa (citação curta) | troca |
|---|---|---|---|---|---|---|
| 1 | olho a praça e as bancas dos mercadores | sem | «▸ Mercado» | — | praça, banca de ervas | n/a |
| 2 | pergunto ao vendedor da banca de ervas o que ele tem à venda e quanto custa | sem | — | — | «Tudo o que tenho está à vista» (sem preços) | n/a |
| 3 | dou 7 moedas ao elfo da banca por uma ração de viagem | cartão «Comprar Rações ◉ 7 · a bolsa fica com ◉ 23» | «🛒 Rações de viagem — ◉ 7 (restam ◉ 23)» | ◉ 30 → 23; rações 10 → 11 | «embrulho de lona»; PT-PT «evitais» | **C** |
| 4 | compro duas tochas do balcão de mantimentos | cartão «Comprar **2 × Tochas, 3 × Rações de viagem** ◉ 23 · fica com ◉ 0» | «🛒 2× Tochas, 3× Rações de viagem — ◉ 23 (restam ◉ 0)» | ◉ 23 → 0; tochas 5 → 7; **rações 11 → 14** | «duas tochas… embrulha-as»; (nada das rações); PT-PT «acendei» | **D**; leitura errada |
| 5 | dou 20 moedas ao elfo pela Antiga Rapieira | sem | «◉ Não chega: Antiga Rapieira, Rapieira custa ◉ 110, e a bolsa tem ◉ 0.» | igual | «Custa cento e dez coroas. Vinte não compram nem a bainha» | C (linha errada: ◉ 22 + ◉ 88) |
| 6 | furto a bolsa de moedas do elfo da banca sem que ele perceba | **Prestidigitação 20 + 2 = 22 vs 15, crítico** | «🤲 Da bolsa do elfo: ◉ 5 (bolsa: ◉ 5)», «Golpe de Sorte» | ◉ 0 → 5 | «cinco coroas… **uma missiva ordinária se desprende e escorrega para dentro da sua luva**» | **D** (missiva inventada) |
| 7 | levo um odre de água do balcão e pago amanhã, fiado | sem | «⛔ Fiado não: aqui se paga na hora.» | igual | «Fiado, não. Água da minha fonte custa agora.» | **C** |
| 8 | Isolde, paga uma caneca de hidromel para mim na estalagem | sem | «🤝 Isolde abre as mãos vazias: o dinheiro do grupo está na sua bolsa.» | igual | «Não guardo moeda, Ingrid. A bolsa do grupo é a tua.»; PT-PT | **C** |
| 9 | vendo o couro ao elfo da banca | sem turno; cartão «Vender Couro Batido» | «está em uso: desequipe antes de vender» | igual | — | (sem turno) |
| 10 | vendo duas rações ao elfo | cartão «Vender 2 rações ◉ +7» | «🛒 Vendido: 2 rações à Vela Silenciosa por ◉ 7 (bolsa: ◉ 12)»; conferente cortou «Estende-lhe um punhado de coroas…» | ◉ 5 → 12; rações 14 → 12 | **«Nada muda de mão.»** | **D** |
| 11 | vendo a minha espada longa ao elfo | sem turno | «🎒 A espada não está na sua bolsa — não há o que vender.» | igual | — | (sem turno) |
| 12 | vendo duas tochas ao elfo | cartão «Vender 2 tochas ◉ +1» | «🛒 Vendido: 2 tochas… por ◉ 1 (bolsa: ◉ 13)» | ◉ 12 → 13; tochas 7 → 5 | «As moedas tilintam uma única vez»; **o elfo agora é «Kael»** | **C** |
| 13 | pergunto a Kael o que aconteceu com o rebanho dele | sem | «🧭 Kael não está aqui.» | — | Kael responde («Meus carneiros se foram») | n/a; ausente que fala |
| 14 | ofereço 3 moedas ao elfo para ele ficar calado sobre a bolsa | **Persuasão 14, 3 + 2 = 5, falha** | «🗣 O que você pôs na mesa não paga o que está pedindo.» | igual | «Não vou jurar silêncio por três moedas» | **C** |
| 15 | ofereço 5 moedas a Kael para ele esquecer que me viu perto da bolsa | **sem dado** | sem linha (+17 XP «um risco enfrentado, e vencido») | igual | «Cinco moedas, dizes. — Enfim, ele faz que sim… Kael não viu» | **D**; faltou dado; PT-PT |
| 16 | ofereço 4 moedas ao vendedor para ele não gritar ladrão | **Persuasão 14, 14 + 2 = 16, sucesso** | «◉ 4 moedas mudaram de mão.» | ◉ 13 → 9 | «As quatro moedas somem no avental do elfo» | **C** |
| 17 | Isolde, me entrega a sua espada curta | sem | «🤝 Isolde usa Espada Curta e não a tira de si para dar.» | igual | «A espada fica comigo»; PT-PT «teu olhar» | **C** |
| 18 | Isolde, me entrega o seu escudo de ferro | sem | «🤝 Isolde não tem isso consigo.» | igual | **«a correia do escudo puxada contra o ombro. — O escudo fica comigo»** | **D** |
| 19 | reviro os caixotes e os sacos atrás das bancas procurando algo útil | sem | — | igual | «Nada escondido» | n/a (busca) |
| 20 | furto a bolsa de moedas da velha das lentilhas | **Prestidigitação 3 + 2 = 5, falha** | «↯ Alguém na rua vê a minha mão onde ela não devia estar.» | igual | «encontra o fundo — liso, gasto… os dedos da velha fecham no seu pulso» | **C** |
| 21 | furto a bolsa de moedas do homem de capa da mesa dos fundos | **20 + 2 = 22, crítico** | «🤲 Da bolsa do homem: ◉ 6 (bolsa: ◉ 15)» | ◉ 9 → 15 | «seis moedas» | **C** |
| 22 | furto a bolsa de moedas de uma das carroceiras | **2 + 2 = 4, falha** | «↯ … a minha mão…» | igual | «— Ei, a batedeira!» | **C** |
| 23 | vou até a Feira Gorda | cartão «Ir até a Feira Gorda · 5 min» | «📍 Você está na Feira Gorda.», «✓ Ver o que ficou na Feira Gorda» | lugar muda | Rhogar | n/a |
| 24 | pergunto a Rhogar se ele viu algo estranho ontem à noite nas traseiras da feira | sem | — | — | «Não me paga para contar o que os outros dizem de graça» | n/a |
| 25 | dou 14 moedas a Rhogar por duas rações de viagem | cartão «Comprar 2 × Rações ◉ 14 · fica com ◉ 1» | «🛒 2× Rações de viagem — ◉ 14 (restam ◉ 1)» | ◉ 15 → 1; rações 12 → 14 | «Desliza duas trouxas de lona» | **C** |
| 26 | furto a bolsa de moedas de Rhogar enquanto ele olha para a porta | **18 + 2 = 20, sucesso** | «🤲 Da bolsa de Rhogar: ◉ 4 (bolsa: ◉ 5)» | ◉ 1 → 5 | «quatro coroas» | **C** |
| 27 | digo a Rhogar que não vi nada, só quero saber o que levou o rebanho de Kael | sem | — | — | «Coisa que desce ao anoitecer. Só isso.» | n/a |
| 28 | peço emprestado a Rhogar um odre de água, devolvo amanhã | **Persuasão 15, 9 + 2 = 11, falha** | — | igual | «Não empresto odre»; PT-PT; **Kael aparece na feira** | **C** (ausente que aparece) |
| 29 | peço de graça a Rhogar uma amostra das ervas da banca | **sem dado** | «🎁 Rhogar lhe dá: Maçã seca.», «↺ Desse jeito você já tentou aqui, e não deu…» | **mochila ganha Maçã seca** | «Já disse que não. Erva de graça, nem a sombra» | **D**; faltou dado |
| 30 | dou a maçã à Isolde | sem | «🤝 Maçã seca agora é de Isolde o Andarilho.» | mochila → bolsa dela | «Isolde recebe a maçã… fruta some na algibeira» | **C** |
| 31 | Isolde, me devolve a maçã | sem | «🤝 Isolde passa a você: Maçã seca.» | bolsa dela → mochila | **«Agora não… Pediste para guardar. Guardei»** | **D** |
| 32 | vendo a maçã a Rhogar | cartão «Vender Maçã seca ◉ +7» | «🛒 Vendido: Maçã seca à Vela Silenciosa por ◉ 7 (bolsa: ◉ 12)» | ◉ 5 → 12 | «Sete coroas»; PT-PT «Estás a vender» | **C** |
| 33 | Isolde, me dá cinco moedas da sua bolsa | sem | «🤝 Isolde abre as mãos vazias…» | igual | «Não guardo moeda à parte» | **C** |
| 34 | tomo o odre vazio da mão de Rhogar e guardo na mochila | **Atletismo 15, 4 + 2 = 6, falha** | «✋ Rhogar segura firme: a mão volta vazia.», «🔊» | igual | «Rhogar puxa o odre de volta… Kael ergueu a cabeça. E começa a vir.» | **C** |
| 35 | peço desculpas a Rhogar pelo empurrão e ajudo a recolher as nozes | sem | — | — | «Ajuda a juntar e ninguém fala do empurrão» | n/a |
| 36 | Isolde, o que você acha de Rhogar e dessa feira? | sem | — | — | «A feira compra o que os outros perdem.» | n/a |
| 37 | pergunto a Rhogar qual é o caminho até a Guarnição Perdida | sem | — | lugar igual | «Duas viradas à esquerda…» | n/a (não moveu) |
| 38 | chamo Kael, o vendedor de ervas da praça: venha cá! | sem | sem linha «não está aqui» | — | Kael chega: «Estou aqui.» | n/a; **ausente que aparece** |
| 39 | ameaço Rhogar: conta o que viu nas traseiras ou eu quebro a sua banca | **Intimidação 15, d20 9, falha** | cartão «Se falhar, a pessoa não se dobra.», «🔊» | igual | Inga: «Ouvi gritaria» | n/a (dado coerente) |
| 40 | chamo Bertrand, o ferreiro: preciso de você aqui! | sem | — | — | «O nome não acha dono na praça» | n/a |
| 41 | peço de graça a Kael um punhado das ervas dele, para provar | **Persuasão 15, 18 + 2 = 20, sucesso** | «🎁 Kael deixa você provar ali mesmo.» | igual | «Mastiga e cospe» | **C** |
| 42 | peço a Rhogar uma das cordas da banca, de graça | sem | «🎁 Rhogar não tem das cordas para dar.», «↺ Desse jeito…» | igual | «Não tenho para dar. Se queres uma, pagas.» | **C** (linha mal formada) |
| 43 | peço emprestado a Kael o cavalo branco dele | sem | «🎁 Kael não tem cavalo branco para dar.» | igual | «Não tenho cavalo, Ingrid» | **C** |
| 44 | tomo a faca da mão da mulher de avental de farinha e guardo no cinto | **sem dado** | «✋ Você arranca faca da mão da mulher.», «↺ Desse jeito…» | **mochila ganha Faca** | «A lâmina não cede… Isto não é teu» | **D**; faltou dado |
| 45 | dou a faca à Isolde | sem | «🤝 Faca agora é de Isolde o Andarilho.» | mochila → bolsa dela | «Fico com ela.» | **C** |
| 46 | Isolde, me devolve a faca, por favor | sem | «🤝 Isolde passa a você: Faca.» | bolsa dela → mochila | «Toma. Guarda bem.» | **C** |
| 47 | vendo o arco a Rhogar | sem turno; cartão «Vender Arco Curto» | «está em uso: desequipe antes de vender» | igual | — | (sem turno) |
| 48 | vendo a faca a Rhogar | cartão «Vender Faca ◉ +7» | «🛒 Vendido: Faca à Vela Silenciosa por ◉ 7 (bolsa: ◉ 19)» | ◉ 12 → 19 | «— Sete. … Agora é minha.» | **C** |
| 49 | compro a rapieira | sem | «◉ Não chega: Antiga Rapieira, Rapieira custa ◉ 110, e a bolsa tem ◉ 19.» | igual | «Cento e dez… Com dezenove, levas o frio da manhã» | C (linha errada) |
| 50 | vou até a Guarnição Perdida | cartão «Ir… · 5 min» | «📍 Você está na Guarnição Perdida.», «✓ Seguir o rastro…», «✧ O escudo de um desertor… Escudo de Placas, no chão» | lugar muda; chão: Escudo de Placas | **duas narrações seguidas** (Merek e o escudo) | n/a |
| 51 | pego o escudo de placas do chão e guardo na mochila | sem | «🤲 Você recolhe: ✦ Escudo de Placas» | equipamento: Escudo de Placas | «prende à mochila» | **C** |
| 52 | furto a bolsa de moedas de Merek enquanto ele olha para o pátio | **Prestidigitação 14 + 2 = 16 vs 15, sucesso (por um fio)** | «⚖ A coisa vem para a sua mão, mas vem tilintando…», «🔊», «🤲 A bolsa de Merek Rompe-Escudos estava quase vazia: nada que valha levar.» | igual | «quase vazia, afinal… O tilintar de uma moeda escapa» | **C** |
| 53 | dou 14 moedas ao mercador por duas rações de viagem (Merek em cena) | cartão «Comprar 2 × Rações ◉ 14 · fica com ◉ 5» | «🛒 2× Rações de viagem — ◉ 14 (restam ◉ 5)» | ◉ 19 → 5; rações 14 → 16 | «Duas, como pediste»; **«um prego… Isolde o apanha»** | D (discutível) |
| 54 | reviro a palha velha do estábulo atrás de mais alguma coisa | sem | — | igual | «um prego de ferradura que cai»; Isolde «Vaza daqui, Ingrid» | n/a (busca) |
| 55 | dou o escudo à Isolde | sem | **sem linha** | **igual** (Escudo continua no equipamento; Isolde sem nada) | «Ela prende o escudo às costas… Mas fico com ele»; PT-PT | **D**; sem veredito |
| 56 | Isolde, me devolve o escudo | sem | «🤝 Isolde não tem isso consigo.» | igual | «Nunca o guardei. Ficou onde o puseste.» | **C** |
| 57 | vendo o escudo a Merek | cartão «Vender Escudo de Placas ◉ +10» | «🛒 Vendido: Escudo de Placas à Vela Silenciosa por ◉ 10 (bolsa: ◉ 15)» | ◉ 5 → 15 | «Conta as moedas na palma» | **C** |
| 58 | ofereço 5 moedas a Merek para ele esquecer que me viu perto da bolsa dele | **Persuasão 14, 5 + 2 = 7, falha** | «🗣 O que você pôs na mesa…» | igual | «Ele devolve as cinco moedas alinhadas sobre a madeira» | **C** |
| 59 | pergunto a Merek como se chega a Alicerces de Ferro | sem | — | lugar igual | «Sobe a estrada nordeste, quatro horas» | n/a (não moveu) |
| 60 | furto a bolsa de moedas do mercador da Guarnição | **Prestidigitação 8 + 2 = 10, falha** | «↯ Merek Rompe-Escudos vê a minha mão onde ela não devia estar.» | igual | «Belo gesto»; **«Isolde segura o escudo que você lhe deu»** | **D** (alvo trocado; escudo inventado) |

Observação sobre o turno 4: o jogo deu os dois cliques por protocolo; o cartão mostrava os 3 × Rações de viagem antes do clique. Um jogador de verdade poderia ter parado ali; o defeito é do cartão, não do clique.

## Defeitos, por gravidade

### Defeitos do sistema (o sistema decidiu ou aplicou errado, ou não devolveu veredito)

**Graves** (mexem no dinheiro ou no inventário do jogador, ou fazem a ficha mentir contra a narração):
1. **Ganho sem dado, contra a narração, depois de «↺ Desse jeito você já tentou aqui»** (29 e 44). Frases: **«peço de graça a Rhogar uma amostra das ervas da banca»** → «🎁 Rhogar lhe dá: Maçã seca.» e a mochila ganha a maçã; **«tomo a faca da mão da mulher de avental de farinha e guardo no cinto»** → «✋ Você arranca faca da mão da mulher.» e a mochila ganha a Faca. Nos dois, a mesma linha anterior diz que não deu. O Mestre obedece à regra «já tentou» e a ficha obedece ao ganho. É o defeito do turno 22 da sessão 9, com a causa à vista: a regra de repetição pula o dado e não pula o efeito.
2. **O cartão de compra leu mais do que a frase dizia** (4). Frase: **«compro duas tochas do balcão de mantimentos»** → «Comprar 2 × Tochas, 3 × Rações de viagem ◉ 23», todo o dinheiro. Não sei de onde veio a conta das 3 rações.
3. **O preço de dois itens que casam é somado e dito ao jogador** (5 e 49). Frases: **«dou 20 moedas ao elfo pela Antiga Rapieira»** e **«compro a rapieira»** → «Antiga Rapieira, Rapieira custa ◉ 110» (os preços reais, no painel, são ◉ 22 e ◉ 88). O sistema devia ter perguntado qual, ou ter lido só o de nome exato.
4. **Troca sem veredito: «dou o escudo à Isolde» (55)** — o escudo estava em `equipamento`, não em `inventario`, e o dar não olhou ali; sem linha, sem mudança de ficha, e o Mestre entregou e, no 60, «o escudo que você lhe deu» voltou. **E: «ofereço 5 moedas a Kael para ele esquecer que me viu perto da bolsa» (15)** — sem dado, sem linha, o Mestre aceitou; com Merek, a mesma frase (58) rolou. A diferença é o nome.

**Médios:**
5. **O alvo do furto foi trocado** (60). Frase: **«furto a bolsa de moedas do mercador da Guarnição»** → a linha fala do guarda Merek.
6. **Linhas cruas ou mal formadas:** «Você arranca faca da mão da mulher.» (sem artigo); «Rhogar não tem das cordas para dar.»; «Alguém na rua vê a minha mão onde ela não devia estar.» (20, 22) e «Merek Rompe-Escudos vê a minha mão…» (60), primeira pessoa; «🗣 O que você pôs na mesa não paga o que está pedindo.» também quando o suborno passou (16); «↺ Desse jeito você já tentou aqui, e não deu.» é fala do sistema sobre o sistema e aparece em primeiras tentativas (29, 42, 44).
7. **O ausente aparece e fala sem linha** (38 «chamo Kael, o vendedor de ervas da praça: venha cá!»; 28, 34, 41, 43 Kael já está na Feira Gorda). A origem é de prosa (o Narrador deu o nome Kael ao elfo no 12), mas o sistema, que no 13 disse «Kael não está aqui», deixou-o falar e ficou calado.
8. **O conferente cortou a frase que dizia a venda aplicada e repôs uma falsa** (10; `troca: false` com uma venda aplicada no turno). A regra «troca aplicada não é cortada» não foi exercida porque o conferente não viu a troca.
9. **Duas narrações seguidas do Mestre** na viagem à Guarnição (50).
10. **A carta de quest nunca virou carta:** `quadro.cartas` vazio do começo ao fim, mesmo com Merek em cena e «PISTAS · 1 DE 2» (o caso do turno 57 da sessão 9 ficou sem exercício).
11. **A venda diz «à Vela Silenciosa»** quando o jogador disse «a Rhogar» ou «ao elfo».

### Prosa que desobedeceu a um fato dado

1. **10** «vendo duas rações ao elfo»: o fato diz «🛒 Vendido… por ◉ 7», a prosa abre com «Nada muda de mão». (Esta saiu em parte da reposição do conferente.)
2. **31** «Isolde, me devolve a maçã»: o fato diz «Isolde passa a você: Maçã seca», a prosa diz «Agora não… Guardei».
3. **18** «Isolde, me entrega o seu escudo de ferro»: o fato diz «Isolde não tem isso consigo», a prosa dá a ela «a correia do escudo puxada contra o ombro».
4. **6** furto do elfo: o butim é ◉ 5; a prosa acrescenta «uma missiva ordinária» que escorrega para a luva.
5. **60** furto do «mercador»: a prosa põe Isolde segurando «o escudo que você lhe deu», escudo que o fato do 56 já tinha dito que ela não tem e que foi vendido no 57.
6. **4** o fato diz 2 tochas e 3 rações; a prosa só entrega «duas tochas».
7. **53** (discutível) «um prego dobrado em gancho… Isolde o apanha»: não há fato nenhum de pegar.
8. **PT-PT** em 28 dos 57 turnos (ver tabela), incluindo as falas de Isolde e de Rhogar para Ingrid («Pediste para guardar. Guardei.», «Se queres uma, pagas.», «Vais tratar disso como eu pediria»). **Foi a maior regressão desta sessão.**

## O que não verifiquei

- **Carta de quest aberta com compra** (item 1): não consegui abrir uma carta (o quadro ficou vazio), só estive com o guarda da quest em cena e a barra de pistas aberta. O defeito exato do turno 57 da sessão 9 está **sem prova jogada**.
- **Fiado**, **intimidação** e **vender o que não se tem**: **uma vez cada**, não duas.
- **Dois itens na mochila que casam com a mesma palavra**: nunca tive dois (só um por vez); só vi o caso de dois itens do mercado casando (rapieira).
- **Buscas em três lugares:** foram dois (praça, estábulo da Guarnição). **Conversa pura:** 11 turnos, não 15.
- **«Falhar por 1 ou 2, conseguindo pagando»** no furto: nenhum caso (o 52 foi sucesso por 1 sem moeda; as três falhas foram por 5 a 11).
- **Quanto «por um fio» ocorre na bandeja:** vi o 52 («✓ passou»), mas não consegui ler a bandeja de um turno só na tela fora do texto da página; a tela só trouxe «precisa de 15 — ✓ passou».
- O conferente: só 2 registros no console; **não sei se os outros 55 turnos passaram por ele sem corte ou se o log não saiu**.
- Por que o 4 leu 3 rações; por que «a Kael» não vira suborno; se «já tentou aqui» é por lugar ou por tipo de ação (vi nos dois casos que vale para ação do mesmo tipo no mesmo lugar, com alvo diferente).
- **Luta:** nenhuma abriu. **Outro mercado**, **outro mundo**: um só (Terras abertas).
- **Se o Narrador pôs o nome Kael no elfo por conta própria** ou por causa da quest «Kael perdeu o rebanho» (a quest abre falando em Kael): o Mestre usou o nome no 12 sem nenhum fato.
- Os painéis de pessoas e de ficha de gente não foram abertos.
