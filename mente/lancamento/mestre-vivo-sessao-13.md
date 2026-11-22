# O Mestre vivo — décima terceira sessão jogada (22/11/2026)

Commit `a3519bb` (v9.671; `VERSAO` lida em `src/constantes.js` da cópia), cópia limpa fora do repositório (`git archive`, `node_modules` por junção, Vite na porta 5197), `?mestre=1` (chave ligada: `taverna_cfg_mestre_vivo = 1`, conferida), IA real, Edge headless dirigido por CDP com perfil próprio novo (`perfis-jogar/s13`).
**Ondine Rompe-Escudos** (Tiefling, Engenheira, nível 1; **Besta Leve e Couro Batido equipados**; mochila vazia; 30 moedas, 10 PV) com **Dagon Mão-Torta** (Bruxo, companheiro; Adaga e Gibão de Couro equipados, bolsa vazia), num mundo de **Fantasia medieval · A Torre · Mistério em Camadas** (voz «Sombrio»). Forma nova (a sessão 12 foi no Arquipélago; as 10 e 11, em Terras abertas).
Quest de abertura: **«O Livro dos Nomes»** (passos: «Ouvir Thalia», «Saber onde quem lê o livro à noite guarda o livro», «Tirar o livro das mãos de quem lê o livro à noite» → ao fim da luta «Tirar o livro das mãos de Kolvar Guarda-Portão, o Carrasco Manso», e a carta «Decidir o que fica do livro»). Cumprida na frase 37 (clique em «Escolher: devolver o livro a Thalia»); a quest seguinte, «As cinzas de ontem» («Ver o que o fogo deixou em Arco Pálido»), ficou aberta.
Lugares (todos em **Andar 1 — do Sino**): **Arco Pálido** (Thalia, Freya Queima-Campos, Gareth Sombravinda), **Balcão do Degrau** (mercado; Hakon o Silencioso, Corwin Cinza-Antiga, Runa), **A Última Brasa** (Aldric, Piotr Rompe-Escudos, Bjorn). O Andar 48 — da Chuva foi oferecido e negado (ver defeitos).
Preços: tocha ◉ 1 e ração ◉ 2 (cartões); Hakon vendeu-me só o que o cartão cobrou; venda de ração ◉ 1; Elixir de Intelecto ◉ 23. A poção de cura («cinquenta coroas», só na prosa) não foi conferida contra painel.

**60 frases enviadas, 56 viraram turno** (as quatro que não: **9** «ameaço Freya: … eu entrego você ao cobrador», lida como entregar o livro; **29** «ataco quem lê o livro à noite… e peço que Dagon lance um feitiço nele», lida como atacar Thalia; **38**, repetição da 37, engolida de novo; **45** venda «ao mercador do balcão», negada no cartão. A **37** também ficou engolida, mas foi processada junto com o clique da carta e virou turno ali). Limite duro respeitado (60/60; nenhuma frase de teste). Além das frases, **5 turnos por clique**: «4 h» no cartão de esperar; «Espreitar» (abre a luta); «Esperar» + «Agir»; «Atacar» + «Agir» + «Matar» (a luta); «Escolher: devolver o livro…». O total de narrações salvas é **61 textos de Mestre (60 chamadas + a abertura)**. Console capturado nos turnos enviados por frase (não nos cliques). **Dados do herói rolados nas frases: 8**; mais a luta (iniciativa; 1 ataque meu, 14 + 4 = 18, que matou).

Método: o da sessão 12 (testador em Sonnet; nenhuma cota de dado; só contam a ação arriscada sem dado e o dado onde um mestre real não pediria). Moedas, mochila, equipamento, suprimentos, lugar e bolsa de Dagon lidos do save antes e depois de cada turno; linhas do sistema e prosa, da lista de mensagens do save; tela (a lista «Em cena», lida do rótulo de acessibilidade), do texto da página; conferente, juiz e erros, do console. **Cartões de pagar/vender/comprar/ir tiveram os dois cliques dados** (veredito anotado antes do clique); cartão sem confirmação possível (45) foi dispensado por «Reescrever»; o cartão «Atacar Thalia» (29) foi **dispensado de propósito**, para não atacar uma aliada; o de rolar, clicado sempre. Diferença desta sessão: metade jogo livre (seguir a quest, conversar, explorar), não bateria de casos; os casos do roteiro saíram onde a história os pedia, o que deixou alguns **sem repetição** (ver «O que não verifiquei»).

## Na criação e na abertura

- **Nome ao trocar a forma do mundo:** a tela sorteou **Ondine Rompe-Escudos** («Tiefling · Engenheira · mulher»). Trocar a forma de «Terras abertas» para «A Torre» e voltar não mexeu no herói. **O jogo começou com «Ondine»** (o defeito da sessão 11 não se repetiu). Detalhe: a criação diz «Engenheira», o painel do jogo diz «Engenheiro · nível 1».
- **Abertura, concordância (item 8):** a tela nomeia **«Ouvir Thalia»** (e «Procurar Thalia»), o save (`abertura.sabe`) guarda **«Thalia é quem mais sabe do que está acontecendo; está em Arco Pálido»** (`pista.nome` = Thalia, `pista.local` = Arco Pálido), o título `abertura.titulo` é **«O Livro dos Nomes»** e a quest da tela é **«O Livro dos Nomes»**. **Os três concordam** (na sessão 12: Ulric × Ivarr × «O rasto de Joric»). **Pessoa: «você»** («Você sabe do livro. Um livro só…»). O texto do save (`chegada`, `razao`, `historia`) está em PT-BR neutro («mal terminada a subida da escada», «todo mundo daqui sabe disso»; sem «acabado de», sem «encontra-se»). Na prosa, Thalia está «lá em cima» no degrau da capela, e o save a põe em «Arco Pálido»; a tela, depois, a põe em Arco Pálido: coerente com o save, e a prosa trata o «degrau» como outro ponto (ver defeitos).

## Os totais

| | sessão 12 | sessão 13 |
|---|---|---|
| frases (viraram turno) | 60 (55 viraram turno, +5 sem turno) | **60** (**56** viraram turno, +4 sem turno: 9, 29, 38, 45; a 37 virou turno só depois, com o clique da carta) |
| certos no dado | 51 de 55 firmes (+2 discutíveis) | **56 de 56 firmes** (+2 discutíveis: 28 «espero… escondidos atrás de um escombro», 42 «examino a pedra… procurando o que o fogo deixou»: sem dado, enquanto o 35 «reviro as cinzas… procurando» rolou) |
| faltou dado | 3 firmes + 2 discutíveis | **0 firmes** + os 2 discutíveis acima |
| dado indevido | 1 firme | **0 firme** (o «tomo… coragem/paciência/atenção» não rolou nas 3 vezes) |
| leitura errada da frase | 10 | **9** (9 «entrego você» lido como entregar o livro; 13 «degrau da capela» → «Balcão do Degrau»; 29 «quem lê o livro à noite» → «Atacar Thalia», e o feitiço de Dagon ignorado; 37 e 38 «me devolve» → carta «Devolver o livro»; 40 «tomo… guardo para mim» → recolhe um elixir do chão de outro lugar; 45 «ao mercador do balcão» negado com Hakon à vista; 56 «atenção de Freya» → Dagon; 60 «bolso de Freya» → Thalia) |
| **turnos de troca em que linha, ficha e prosa concordam / total** | 22 de 33 sem tolerância | **13 de 23** sem tolerância (**10 discordam**: 7 firmes (7, 19, 37/38, 45, 49, 56, 60) + 3 leves (16, 24, 40)); tolerando os leves 16 de 23. **Pior em proporção** (57% contra 67%) |
| prosa contra ficha/veredito/linha nas trocas (total) | 5 firmes + 1 leve + 5 fora | **4 firmes nas trocas** (7, 16, 24, 49) **+ 2 de detalhe** (16, 19) **+ 22 fora das trocas** em 17 turnos (ver a seção própria) |
| trocas inventadas pela prosa (entrega, pagamento ou butim sem o sistema) | 3 + 1 | **4** (7 «a chave deslizou para a sua palma»; 16 pano seco e pederneira «sem pedir nada»; 24 Dagon «devolve» a tocha que a linha diz não haver; 49 «A bolsa está com você») **+ 2 leves** (6 «Você pega o pão»; 10 «A chave pesava no seu bolso») |
| prosa que **nega** uma troca que o sistema aplicou | 1 | **0** |
| ausente que aparece | 9 turnos | **7 turnos** (2 Thalia; 13 Thalia «com você»; 19 Gareth pega as moedas; 24 «a freira, da porta»; 25 Freya; 44 Freya e Thalia no Balcão; 51 «Aldric não se intimida») **+ 1 leve** (34) |
| conferente: turnos com corte / cortes / reposições | 6 / 12 / 1 | **3 turnos** (34, 40, 41) nos 56 registros capturados / **3 cortes** / **1 reposição** (34); `troca: false` em todos; `frente: true` no 51 |
| cortes indevidos | 1 firme + 1 discutível | **1 firme** (41: motivo `ausente` sobre a fala de Freya, que estava em cena: «— Quem ardeu, ardeu. — Freya ergue uma moeda…») |
| frases órfãs | 2 | **1** não cortada (28: «E estende o alaúde a você.», sem sujeito, objeto novo) |
| PT-PT (turnos de narração) | (a) «tu»: 11 de ~63; (b) 3 firmes + 4 discutíveis | **(a) «tu»: 6 de 61** (todos imperativos em fala, **0 com «tu/teu/tua/ti/contigo»**) **+ 5 só com «te» objeto**; **(b) outras marcas: 4 firmes + 1 discutível** |
| erros de console | 0 | **0** (só `debug`/`info`; `[taverna] juiz`: «nome 1» no 3, «preco 1» no 47, mais «distancia 1» no 28 e «preco 1» no clique de «Espreitar») |
| o que entrou na ficha | 0 achados; 0 ganhos sem dado | **0 achados do juiz**; **0 ganhos sem dado**; **0 furtos que renderam** (7 «por um fio», 49 «sucesso»: nada entrou, ver defeitos); 2 furtos falhados (20, 60); vendas 17 e 46 (◉ +1, ◉ +23); compras 16 (◉ −1) e 48 (◉ −2); pagamentos 18 (◉ −3) e 55 (◉ −3); **19 (◉ −10 sem linha)**; quest ◉ +37 e +100 XP; luta ◉ +10 e Elixir de Destreza; a bolsa de Dagon nunca foi alvo por engano |
| buscas livres com achado | 1 de 2 | **0 de 2** (35 falhou com dado, «lugar remexido»; 42 sem dado, sem achado) |
| viagem: chegada com duas narrações seguidas | 1 de 5 | **0 de 7** chegadas dentro dos muros; a viagem longa não saiu (52, sem caminho). **Um turno com duas narrações** (o 4, passo de quest concluído na conversa; não foi chegada; ver item 9) |

O que melhorou, em número: **o homônimo não pôde ser testado** (ver «O que não verifiquei»), mas **a presença decidida numa função só mostrou resultado onde foi medida:** a procura devolveu a linha certa em **3 de 4** casos fora do lugar (14 Gareth «está em Arco Pálido», 31 Aldric «está em A Última Brasa», e o 15 Hakon presente «está aqui — Balcão do Degrau»; o 2 Thalia saiu «está aqui — Arco Pálido»), e o pagamento a ausente foi negado com a linha certa em **3 de 4** (34 Freya, 53 Gareth; o 19 Gareth não). **«Tomar o que não se segura»: 3 de 3 negados sem dado** (8 coragem, 40 paciência, 56 atenção). **O furto dito de outro jeito rolou, 4 de 4** (7, 20, 49, 60 rolaram Prestidigitação; 20 «às escondidas» foi lido como furto e rolou). **A intimidação que abre com ameaça rolou, 2 de 2 quando a frase não tinha «entrego»** (10, 51), e não virou procura. **Pedido à companheira vira turno, 3 de 3** (12 «peço que Dagon distraia Freya», 30 «peço a Dagon que lance um feitiço de luz», 59 «peço que Dagon lance um feitiço sobre a marca»). **A venda diz a quem se vendeu, 2 de 2** (17 «Vendido: 1 ração a Hakon o Silencioso por ◉ 1», 46 «Elixir de Intelecto a Hakon o Silencioso por ◉ 23») **e a prosa conta**. **O suborno que falha, visto** (21: 9 + 2 = 11 contra 16; a moeda não saiu; a prosa nega). **A abertura concorda** (item 8). **A carta de decisão da quest está em «você»**, sem «tu» no corpo (só no rodapé, ver adiante).

O que não melhorou, ou apareceu: (1) **o abatido tratado como vivo, de novo, agora na carta** (item 7: 2 de 3 caminhos falam de Kolvar vivo depois do «Matar»; a lista «Em cena» o manteve até o turno seguinte). (2) **A carta aberta engole a frase** (37 e 38: «me devolve» casou com o caminho «Devolver o livro»; duas frases sem turno, processadas só quando a carta foi escolhida). (3) **Alvo trocado quando há mais de um nome** (29, 56, 60). (4) **A «presença» ainda deixa gente presa de um lugar a outro na prosa e no registro** (13, 19, 25, 44; registro com `quem`/`viu` = Dagon, Thalia, Freya, Hakon no Balcão; cartão de ataque «Hakon… Corwin… estão vendo» no Arco). (5) **O furto «sucesso» sem veredito** (49: 18 + 2 = 20, nenhuma linha, ficha igual; a prosa «A bolsa está com você»). (6) **◉ −10 sem linha** no pagamento a Gareth ausente (19), **não reproduzido** no 53 (mesma pessoa, mesma frase quase igual: linha certa). (7) **A lista «Em cena» ganhou objetos como se fossem gente** (11 «Chave sem fechadura conhecida»; 38 e depois «Elixir de Presença»; 47 «Poção de Cura Pequena») e o morto (30). (8) **A venda «ao mercador do balcão» no próprio Balcão onde Hakon vende** (45), o mesmo defeito do 44 da sessão 12. (9) **A prosa saiu da primeira pessoa** (19: «olha para as minhas moedas… antes de eu ver correr»).

## PT-PT, com critério fixo e separado

Contagem por expressão regular sobre os 61 textos de Mestre salvos (a abertura incluída) e **leitura à mão** de todos os trechos que casaram.

**(a) Turnos com segunda pessoa «tu» dirigida ao herói: 6 de 61. Todos em fala de NPC; nenhum de narrador; nenhum com «tu», «teu», «tua», «ti» ou «contigo».** São imperativos na forma de «tu» (num texto que trata o herói por «você»). Exemplos literais:
1. turno 3 (vou até Arco Pálido), fala de Freya: «— **Anda**, Chifre-Negro. **Anda**, Mão-Torta. O portal hoje dormiu de mau humor.»
2. turno 4, fala de Thalia: «— E **leva** o Mão-Torta, se quiser.»
3. turno 5, fala de Dagon: «— **Come**. Eu sei que você não parou para isso.» (e, no 17, «— **Come**. Você já pagou a pergunta.»)
4. turno 16 (dou 5 moedas a Hakon…), fala de Hakon: «— **Leva** o pano. Tocha pegando umidade enche a noite de fumaça.»
5. turno 31 (onde está Aldric?), voz: «**Sobe** a rua do portal e **procura** o cheiro de madeira queimada.»
Discutíveis (só «te» como objeto, comum no PT-BR falado): 11 Gareth «E o que **te** faz pensar que ele sabe o nome?»; 19 Gareth «eu **te** digo de graça»; 26 Freya «O medo não **te** deixa andar muito», e o narrador «Freya **te** vê primeiro»; 51 narrador «Dagon não **te** olha».
**Fora da contagem de turnos, a carta «UMA ESCOLHA · O LIVRO DOS NOMES»:** **quase toda em «você»** («VOCÊ GANHA», «VOCÊ GANHA… CUSTA…») com **uma marca**: «Ou **escreve** o que você faz — o campo continua aberto, e a sua frase pode ser uma destas cartas.» (tu; é a mesma frase de rodapé da sessão 12, que o conserto dos textos de carta ainda não pegou). A carta tem também «Pôr no lugar dele uma cópia de Aldric», e os passos estão em infinitivo, sem pessoa.

**(b) Turnos só com outras marcas de PT-PT: 4 firmes + 1 discutível.** Todas são ênclise («verbo-se») onde o PT-BR escreve «se» antes do verbo:
1. turno 2 (onde está Thalia?), **narrador**, firme: «uma voz anã **sobrepõe-se** ao chiado das brasas.»
2. clique de «Esperar»/passagem da frase 37, **narrador**, firme: «As chamas da Última Brasa **inclinam-se** para a porta.»
3. turno 44, **narrador**, firme: «Thalia **sentou-se** num degrau, o caderno fechado.»
4. turno 59, **narrador**, firme: «Dagon Mão-Torta **ajoelha-se** junto à marca.»
5. turno 26, **narrador**, discutível: «morde a ponta da luva, **puxando-a** com os dentes.»

Vazamento de inglês: **nenhum**. **Primeira pessoa no narrador: 1** (turno 19: «olha para as minhas moedas… antes de eu ver correr»). **«Até à», «estar a + infinitivo», «convosco», «a bordo»: nenhum.** O texto de abertura do save e a carta, fora o «escreve», estão em PT-BR.

## Os vereditos por item do roteiro

1. **Presença: parcial.** *A tela:* a lista «Em cena» bateu com o lugar em **todas as 7 chegadas** (Arco: Freya/Thalia/Gareth em 3 de 3; Balcão: Hakon/Corwin/Runa em 2 de 2; Brasa: Aldric/Piotr/Bjorn), e **ninguém ficou preso na lista** de um lugar a outro. **A procura:** 14 «onde está Gareth Sombravinda?» (no Balcão) → «🧭 Gareth Sombravinda está em Arco Pálido.» ✓; 31 «onde está Aldric?» (no Arco) → «🧭 Aldric está em A Última Brasa.» ✓; 15 «onde está Hakon?» (presente) → «🔎 Hakon o Silencioso está aqui — Balcão do Degrau.» ✓; **2 «onde está Thalia? Alguém aqui sabe dizer?» (no largo do Sino, antes de ir ao Arco) → «🔎 Thalia está aqui — Arco Pálido.»** (a linha diz «está aqui» de quem mora na cidade e está em outro prédio; a prosa a faz descer dois degraus e falar na hora). **O que quebrou: o registro e a prosa deixaram gente presa:** o `registro` do 18/19 guarda `quem`/`viu` = Dagon, Thalia, Freya, Hakon **no Balcão do Degrau** (Thalia e Freya eram do Arco); o cartão de ataque do 29 (no Arco) dizia **«Freya Queima-Campos, Hakon o Silencioso, Corwin Cinza-Antiga estão vendo»** (Hakon e Corwin são do Balcão); a prosa pôs **Freya «na porta»** do Balcão no 24 e 25 («— É Freya. Cobra o portal.») e **Freya e Thalia no Balcão** no 44; e **Gareth** (dado ausente pelo sistema) apareceu e recebeu moedas no 19. **Homônimo (mesmo primeiro nome): não havia** (o mais próximo, «Piotr Rompe-Escudos» tem o sobrenome do herói; não o testei, ver o fim).
2. **Furto dito de outro jeito: rolou 4 de 4, alvo certo 2 de 4.** **7 «tiro uma moeda do bolso de Gareth sem ele ver»**: Prestidigitação 11 + 2 = 13 contra 15, «por um fio — e paga», «⚖ A coisa vem para a sua mão, mas vem tilintando», «🔊 Isso fez barulho»; **nenhuma linha de ganho, ficha igual (◉ 30)**; a prosa deu «a chave deslizou para a sua palma» e Freya cobrou «Vinte e quatro coroas» (sem sistema). **20 «pego a bolsa de Hakon às escondidas, enquanto ele conversa com Corwin»**: 3 + 2 = 5 contra 15, falha, «↯ Hakon o Silencioso vê a sua mão onde ela não devia estar.»; alvo certo; a prosa concorda. **49 «tiro a bolsa de moedas do cinto de Corwin sem ele ver, enquanto Dagon puxa conversa com ele»**: 18 + 2 = 20, **sucesso, nenhuma linha, ◉ 85 → 85, a prosa «A bolsa está com você»**. **60 «pego uma moeda do bolso de Freya às escondidas, sem ela perceber»**: 9 + 2 = 11, falha, **«↯ Thalia vê a sua mão»** e a prosa leva a mão ao cinto de Thalia (alvo trocado para outra pessoa em cena; a ficha não mudou).
3. **Tomar o que não se segura: consertado, 3 de 3 sem dado.** **8 «tomo a coragem de Gareth e guardo comigo»**: «✋ A coragem de Gareth Sombravinda não é coisa que se pegue com a mão.», prosa «a coragem de Gareth não tem onde pegar». **40 «tomo a paciência de Aldric e guardo para mim»**: «✋ A paciência de Aldric não é coisa que se pegue com a mão.» (prosa concorda; **mas a mesma resposta traz «🤲 Você recolhe: Elixir de Intelecto»**, o elixir do chão do Arco, recolhido na Última Brasa, sem a prosa dizer nada). **56 «tomo a atenção de Freya e prendo ela em mim, para ela não ver o que Dagon faz»**: «✋ **A atenção de Dagon Mão-Torta** não é coisa que se pegue com a mão.» (negado, sem dado; **o alvo virou o companheiro**, e a prosa seguiu: «Sua mão fecha no ar, perto do ombro de Dagon»).
4. **Intimidação: rolou 2 de 2 (3 tentativas; 1 lida errado).** **9 «ameaço Freya: diga onde Gareth esconde o livro dos nomes, ou eu entrego você ao cobrador do portal»**: sem turno, tela «🎒 O livro dos nomes não está com você — não há o que entregar.» (**o «entrego» foi lido como dar o livro**). **10 «… ou eu quebro o seu arco de pedra»**: «🎯 Intimidação. Precisa de 16», 5 contra 16, falha, «🔊 Isso fez barulho»; não virou procura; a prosa «Eu não digo onde ele esconde o livro» (Thalia responde por Freya). **51 «ameaço Corwin: diga onde está Aldric agora ou eu conto a todos quem anda roubando bolsas»**: Intimidação, **d20 = 1, falha crítica** («😵 … Exausto. Desvantagem até um descanso longo.»); não virou procura de Aldric; a prosa abre com **«Aldric não se intimida»** (Aldric é o ausente; o alvo era Corwin).
5. **Pedir ação à companheira: vira turno, 3 de 3; a frase composta (29) não.** **12 «peço que Dagon distraia Freya enquanto eu converso com Thalia…»**: turno, sem dado, prosa Dagon «desce um degrau, sem pressa». **30 «peço a Dagon que lance um feitiço de luz sobre o corpo de Kolvar…»**: turno; prosa «Luz fria escorre dos dedos dele» (mas «Dagon ergue a mão sem que você peça»). **59 «peço que Dagon lance um feitiço sobre a marca…»**: turno; prosa Dagon passa o cajado, «Não há nome». Nenhum virou despedida. **29 «ataco quem lê o livro à noite com a besta, e peço que Dagon lance um feitiço nele»**: cartão **«Atacar Thalia»** («Thalia não é inimigo: atacar é um crime em Andar 1 — do Sino… há 30 moedas pela sua cabeça por 12 dias…»), dispensado; **a frase composta não virou um turno de ataque + pedido** (alvo errado). Dagon lançou **«Explosão Mística»** sozinho na rodada do mundo da luta (a linha e a prosa concordam: «errou»).
6. **«me devolve»: a prosa não recusou, mas a frase foi engolida duas vezes.** **23 «dou uma tocha a Dagon para ele carregar»**: «🤝 1 tocha para Dagon Mão-Torta (restam 5 tochas)», tochas 6 → 5; **24 «Dagon, me devolve a tocha que eu te dei»**: «🤝 As tochas do grupo estão na sua mochila: Dagon não carrega outras.» (contradiz a linha do 23), tochas 5 → 5, **a prosa «Dagon puxa a tocha da cintura e a devolve»** (deu o que a linha diz não haver). **36 «dou o Elixir de Destreza a Dagon»**: «🤝 Elixir de Destreza agora é de Dagon Mão-Torta.», ficha H[Elixir]. **37 e 38 «Dagon, me devolve o elixir que eu te dei»**: **duas vezes sem turno** (nenhuma mensagem salva; a carta «Decidir» aberta, e depois fechada por «Depois», reabria com **«Escolher: devolver o livro a Thalia, inteiro, como estava»** pré-selecionado). **Ao clicar nesse «Escolher», a quest foi cumprida e a frase 37 foi processada junto:** «🤝 Dagon passa a você: Elixir de Destreza.», prosa «Dagon franze a testa, mas enfia a mão no bolso de dentro e devolve o frasco» (linha, ficha e prosa concordam). Ou seja, o conserto da sessão 12 («Hilda recusa o que a linha aplicou») **não se repetiu**, mas **a carta aberta engoliu a frase** (era o defeito da sessão 11).
7. **Uma luta até o fim: parcial, três falhas depois dela.** Cheguei por «Espreitar» (clique) no painel «Frente a frente · quem lê o livro à noite»: «🗺 **Terreno: na boca da caverna: — | atrás das estalagmites: você, Dagon Mão-Torta, Kolvar Guarda-Portão, o Carrasco Manso | no poço escuro: —**» (**num Arco Pálido de pedra clara e escombros: terreno de outro lugar**), «🎲 Iniciativa — 1º Dagon (20) · 2º Kolvar Guarda-Portão (8) · 3º Ondine (5)», «○ Encontro fácil»; o painel dizia «quem lê o livro à noite» e o inimigo era «Kolvar Guarda-Portão, o Carrasco Manso». A primeira narração da luta **continuou a cena do alaúde de Gareth** («Gareth estende o alaúde a você…») e não falou da luta. «Esperar»+«Agir» (rodada do mundo: Kolvar acerta Dagon 8; Dagon «Explosão Mística» erra; a prosa concorda), «Atacar»+«Agir»: 14 + 4 = 18 contra 14, 12 de dano, «**Kolvar… 0/11 ☠**», «⚔ Todos os inimigos caíram», «◉ Espólios: +10 moedas · +31 XP», **«🧺 No chão: 🍷 Elixir de Destreza»** (depois, na linha 115, **«Elixir de Intelecto, no chão»**: dois elixires diferentes), escolhi «**Matar**». **Depois da luta:** (a) **a carta «Decidir o que fica do livro»** tem, no caminho 2, «**Kolvar Guarda-Portão, o Carrasco Manso já leu o livro todo, e sabe o caminho para a casa de Thalia**» e, no caminho 3, «**Kolvar Guarda-Portão, o Carrasco Manso continua a bater às portas — às portas erradas…**» (o abatido como vivo, **2 de 3 caminhos**; só o caminho 1 fala dele sem vida); (b) **a lista «Em cena» do turno 30 incluiu «Kolvar Guarda-Portão, o Carrasco Manso»** (o morto), e saiu da lista no turno 31; (c) a prosa do turno 30 trata «o corpo de Kolvar» e «o morto» certo, mas «**tira o elixir do cinto do morto**» (o elixir já tinha sido recolhido pelo botão «Recolher»); (d) o cartão de ir ao Arco, depois, ainda diz «**você viu Kolvar Guarda-Portão, o Carrasco Manso aqui hoje**» (verdade, mas ele está morto: o sistema o lembra como visto). **Uma só narração na luta inteira** (a primeira, a do alaúde; os cliques de «Agir» e «Atacar» não geraram prosa própria, só o clique do «Matar»/«Escolher»).
8. **A abertura: concordam.** Ver a seção «Na criação e na abertura»: tela «Ouvir Thalia», save «Thalia… está em Arco Pálido», título «O Livro dos Nomes» e quest «O Livro dos Nomes». **Pessoa «você».**
9. **Chegadas: 0 de 7 com duas narrações.** Chegadas: **3** (Arco Pálido; confronto na quest? ainda não), **13** (Balcão do Degrau; só a prosa pedida «com Thalia»), **26** (Arco; **o painel «Frente a frente» já estava aberto**: uma narração só), **32** (A Última Brasa), **41** (Arco; quest ativa), **44** (Balcão), **54** (Arco). **Uma narração em todas.** **Duas narrações seguidas ocorreram em outros turnos:** o **4** («pergunto a Thalia quem levou o livro…»), em que a conversa **concluiu dois passos da quest** («✓ Ouvir Thalia», «✓ Saber onde quem lê o livro à noite guarda o livro») e a segunda narração veio logo após as linhas de passo; (o clique de «Espreitar» que abriu a luta gerou a sua própria narração, mas é um turno por clique, sem frase do jogador, e já está descrito no item 7). Causa isolada para o 4: **passo de quest concluído durante a conversa** (não houve confronto nem chegada). A suspeita da seção 32 (o confronto narra logo depois de uma chegada) **não se confirmou nas chegadas jogadas**.
10. **Compra, venda, moeda na mesa, suborno, fiado: quase tudo certo; 3 falhas.** **Compra pelo cartão: 2 de 2** (16 «dou 5 moedas a Hakon por uma tocha»: «🛒 Tochas — ◉ 1 (restam ◉ 29)», 30 → 29, tochas 5 → 6, **mas a prosa «Hakon pega as cinco moedas… tira um pano seco e uma pederneira, e põe ao lado sem pedir nada»**: pagamento e itens que o sistema não fez; 48 «compro uma ração de viagem de Hakon»: ◉ 2, 87 → 85, rações 9 → 10, e o preço perguntado no 47 («Ração, duas») **bateu**). **Venda dizendo o comprador: 2 de 2** (17, 46) **e 1 negada onde não devia** (**45 «vendo o Elixir de Intelecto ao mercador do balcão»**, no Balcão do Degrau: «O mercador não está aqui para comprar, e o mercado fica longe daqui», com Hakon à vista; sem turno; **com «a Hakon» (46) vendeu**). **Moeda posta na mesa: presente 2 de 2** (18 Corwin, ◉ 30 → 27; 55 Gareth, ◉ 85 → 82; ambas «Pagar ◉ 3», dois cliques, prosa certa); **ausente 3 de 4** (34 Freya «🧭 Freya Queima-Campos não está aqui — está em Arco Pálido», ficha igual; 53 Gareth idem; **19 Gareth: nenhuma linha, ◉ 27 → 17**). **Suborno: 1 falhou** (21), nenhum passou. **Fiado: 22 «levo uma tocha do balcão e pago amanhã, fiado»** → «⛔ Fiado não: aqui se paga na hora.», prosa «A moeda, agora.» ✓. **Preço perguntado: 47** (poção de cura e ração): a prosa deu «cinquenta» e «duas»; só a ração foi conferida (cartão do 48).

## Medida central: troca por troca

Trocas (turno em que algo muda de mão, ou devia): **23**. **Concordam: 13** (8, 17, 18, 20, 21, 22, 23, 34, 36, 46, 48, 53, 55). **Discordam: 10** (7, 16, 19, 24, 37/38, 40, 45, 49, 56, 60).

| classe | total | onde |
|---|---|---|
| (i) sistema decidiu ou aplicou errado | **6** | 19 (◉ −10 sem linha a quem está ausente); 24 (a linha nega a própria linha de dois turnos antes); 40 (recolhe do chão de outro lugar o que ninguém pediu); 45 (nega a venda onde o vendedor está); 56 (alvo = o companheiro, não Freya); 60 (alvo = Thalia, não Freya) |
| (ii) sistema não devolveu veredito | **4** (5 frases) | 7 («por um fio — e paga», sem dizer o que veio nem o que custou); 19 (a moeda saiu sem linha); 37 e 38 (duas frases engolidas pela carta, sem veredito); 49 (sucesso, nenhuma linha) |
| (iii) prosa negou o que o sistema aplicou | **0** | — |
| (iv) prosa deu o que o sistema negou ou não decidiu | **4** | 7 (a chave); 16 (pano e pederneira); 24 (devolve a tocha); 49 (a bolsa) |
| (v) prosa trocou um detalhe | **2** | 16 («cinco moedas» contra ◉ 1); 19 («as três» contra ◉ 10) |

(O 19 conta em três classes, o 7 e o 16 e o 49 e o 24 em duas: o total de classes passa do número de trocas que discordam.)

## Segunda medida: prosa contra o sistema fora de troca

Turno e citação (22 ocorrências em 17 turnos):

- **Ausente que fala ou aparece (7 turnos + 1 leve):** **2** Thalia (em outro prédio): «— Thalia? Sou eu. Ela desce dois degraus»; **13** («vou até o degrau da capela com Thalia»): Thalia fala no Balcão, que a tela não lista; **19** Gareth: «Gareth estende a mão, pega as três»; **24** «— Eu não cobro por fogo — diz a freira, da porta»; **25** Corwin: «— É Freya. Cobra o portal.»; **44** «Freya está encostada no balcão… Thalia sentou-se num degrau» (Balcão: Em cena Corwin, Hakon, Runa); **51** «Aldric não se intimida.» (Aldric em A Última Brasa; o alvo era Corwin); **34 (leve)** «A mão de Freya não sai do bolso… ninguém viu para onde» (Freya está em Arco Pálido).
- **Lugar errado (2 turnos + a luta):** **5** e **12**: a prosa passa a cena para o «degrau» e «junto ao sino» no alto, e o sistema segue em Arco Pálido (a lista «Em cena» igual); **o terreno da luta** («na boca da caverna… estalagmites… poço escuro») num arco de cidade; a prosa da própria luta usa as estalagmites do terreno sorteado.
- **Morto tratado como vivo (2 ocorrências):** a carta «Decidir o que fica do livro» (2 de 3 caminhos); a lista «Em cena» do 30.
- **Fato do save contradito (4):** **10** «A chave pesava no seu bolso» (a mochila não tem chave); **30** «tira o elixir do cinto do morto» (já na mochila); **28** «E estende o alaúde a você.» (item novo, sem sujeito, que o conferente deixou passar) e, no clique de «Espreitar», a prosa continua o alaúde de Gareth numa cena que o sistema já pôs em luta; **6** «Você pega o pão» (de Dagon; as rações não mudaram).
- **Narrador em primeira pessoa (19):** «olha para as minhas moedas… antes de eu ver correr».

## O que o sistema negou

| turno | linha | soa como |
|---|---|---|
| 8, 40, 56 | «✋ A coragem/paciência de Gareth/Aldric não é coisa que se pegue com a mão.» / «A atenção de Dagon Mão-Torta…» | mesa (certa em 8 e 40; **alvo errado no 56**) |
| 22 | «⛔ Fiado não: aqui se paga na hora.» | mesa |
| 24 | «🤝 As tochas do grupo estão na sua mochila: Dagon não carrega outras.» | **erro** (contradiz o 23) |
| 29 | cartão «Atacar Thalia: não é inimigo: atacar é um crime em Andar 1 — do Sino» | mesa (o veredito antes do clique funcionou: dispensei) mas **alvo errado** |
| 34, 53 | «🧭 Freya Queima-Campos / Gareth Sombravinda não está aqui — está em Arco Pálido.» | mesa |
| 45 | «O mercador não está aqui para comprar, e o mercado fica longe daqui» | **erro** (Hakon vende ali) |
| 52 | «⚿ Não há caminho direto até Andar 48 — da Chuva — o portal deste andar leva ao seguinte, e só — para cima, o próximo é Andar 2 — das Cinzas.» | mesa, **mas depois de o cartão ter oferecido «Partir»** |
| 9 | «🎒 O livro dos nomes não está com você — não há o que entregar.» | **erro** («entrego você» era ameaça) |
| 2 | «🔎 Thalia está aqui — Arco Pálido.» | **erro** (a linha diz «aqui» de quem está em outro prédio) |

## Cortes do conferente

Registros capturados nos 56 turnos por frase (os 5 turnos por clique não passaram pelo console). Três com corte:

| turno | motivo | frase cortada (do log) | julgamento |
|---|---|---|---|
| 34 | pagamento | «Você estende as três moedas.» | certo (Freya ausente; o sistema negou); **reposição 1** |
| 40 | objeto | «Você estende a mão para tomar a paciência de Aldric, e ele apenas olha para ela, sem entender.» | certo (a paciência não é coisa de mão) |
| 41 | ausente | «— Quem ardeu, ardeu. — Freya ergue uma moeda entre os dedos. — Só o que queimou não desce mais.» | **indevido** (Freya estava em «Em cena») |

**Não cortou o que devia:** 7 («a chave deslizou»), 16 (pano e pederneira, «cinco moedas»), 19 (Gareth ausente pega as moedas; primeira pessoa), 24 (devolve a tocha), 44 (Freya e Thalia no Balcão), 49 («A bolsa está com você»), 51 («Aldric não se intimida»), 28 (frase órfã «E estende o alaúde a você.»).

## Turno a turno

Numeração = a das 60 frases enviadas, na ordem. ◉ = moedas. C = linha, ficha e prosa concordam; D = discordam; n/a = não é troca. Abaixo da tabela, os 5 turnos por clique.

| # | frase (resumo) | dado | linhas do sistema / cartão | ficha antes → depois | prosa (citação curta) | troca |
|---|---|---|---|---|---|---|
| 1 | olho a feira do degrau… | sem | «▸ Mercado — há quem venda por aqui.» | — | «Runa vigia a água… Hakon… Aldric sopra as brasas» | n/a |
| 2 | onde está Thalia? | sem | «🔎 Thalia está aqui — Arco Pálido.» | — | Thalia desce dois degraus e fala | n/a (linha e ausente) |
| 3 | vou até Arco Pálido | cartão «Ir · 5 min» | «📍 Você está em Arco Pálido.» | lugar muda | uma narração; «— **Anda**, Chifre-Negro. **Anda**, Mão-Torta.» | n/a |
| 4 | pergunto a Thalia quem levou o livro… | sem | «✓ Ouvir Thalia», «✓ Saber onde quem lê o livro à noite guarda o livro» | — | **duas narrações seguidas**; «E **leva** o Mão-Torta» | n/a |
| 5 | digo que sim, subo com ela até o degrau | sem | — | — | a prosa muda a cena para o alto, «sino rachado» (sistema: Arco Pálido); Dagon estende meio pão | n/a |
| 6 | aceito o pão de Dagon… | sem | — | rações 10 → 10 | «Você pega o pão» | n/a |
| 7 | tiro uma moeda do bolso de Gareth sem ele ver | **11 + 2 = 13 vs 15, «por um fio — e paga»** | «⚖ A coisa vem para a sua mão, mas vem tilintando», «🔊 Isso fez barulho» | ◉ 30 → 30 | «A chave deslizou para a sua palma… — Vinte e quatro coroas» | **D** (ii)+(iv) |
| 8 | tomo a coragem de Gareth… | sem | «✋ A coragem de Gareth Sombravinda não é coisa que se pegue com a mão.» | igual | «a coragem de Gareth não tem onde pegar» | **C** |
| 9 | ameaço Freya… eu entrego você ao cobrador (**sem turno**) | — | «🎒 O livro dos nomes não está com você — não há o que entregar.» | — | — | (sem turno) |
| 10 | ameaço Freya… eu quebro o seu arco de pedra | **5 vs 16, falha** | «🎯 Intimidação. Precisa de 16», «🔊 Isso fez barulho» | igual | «Thalia respondeu por ela… A chave pesava no seu bolso» | n/a |
| 11 | pergunto a Freya de quem é essa chave… | sem | — (Em cena: «Freya, **Chave sem fechadura conhecida**, Gareth e mais 1») | — | «A chave não tem dono há três luas» | n/a |
| 12 | peço que Dagon distraia Freya… | sem | — | — | «Dagon acena… desce um degrau… Você fica com Thalia junto ao sino» | n/a (pedido: virou turno) |
| 13 | vou até o degrau da capela com Thalia | cartão «Ir até **Balcão do Degrau**» | «📍 Você está em Balcão do Degrau.» | lugar muda | uma narração; Thalia fala (Em cena: Hakon, Corwin, Runa) | n/a |
| 14 | onde está Gareth Sombravinda? | sem | «🧭 Gareth Sombravinda está em Arco Pálido.» | — | Hakon e Corwin o viram | n/a (linha certa) |
| 15 | onde está Hakon? | sem | «🔎 Hakon o Silencioso está aqui — Balcão do Degrau.» | — | «Hakon está atrás da lona» | n/a (linha certa) |
| 16 | dou 5 moedas a Hakon por uma tocha | cartão «Comprar Tochas · ◉ 1», dois cliques | «🛒 Tochas — ◉ 1 (restam ◉ 29)» | ◉ 30 → 29; tochas 5 → 6 | «pega as **cinco moedas**… **um pano seco e uma pederneira, sem pedir nada**» | **D** (iv)+(v) leve |
| 17 | vendo uma ração de viagem a Hakon | cartão «Vender · ◉ +1», dois cliques | «🛒 Vendido: 1 ração a Hakon o Silencioso por ◉ 1 (bolsa: ◉ 30)» | ◉ 29 → 30; rações 10 → 9 | «Hakon pesa a ração… enfia as moedas no avental» | **C** |
| 18 | dou 3 moedas a Corwin pelo que ele sabe… | cartão «Pagar ◉ 3», dois cliques | «◉ −3 moedas» | ◉ 30 → 27 | «Você põe três moedas na mão de Corwin» | **C** |
| 19 | dou 3 moedas a Gareth Sombravinda… (**ausente**) | sem | **nenhuma linha** | **◉ 27 → 17** | «Gareth… pega as três»; «olha para as minhas moedas» | **D** (i)+(ii)+(v) |
| 20 | pego a bolsa de Hakon às escondidas, enquanto ele conversa com Corwin | **3 + 2 = 5 vs 15, falha** | «↯ Hakon o Silencioso vê a sua mão onde ela não devia estar.» | igual | «ele vira o corpo… “Aqui se troca. Não se tira.”» | **C** |
| 21 | ofereço 5 moedas a Hakon para ele esquecer… | **9 + 2 = 11 vs 16, falha** | «🎯 Persuasão. Precisa de 16» | ◉ 17 → 17 | «— Não. O que você pediu, ninguém pode vender.» | **C** |
| 22 | levo uma tocha do balcão e pago amanhã, fiado | sem | «⛔ Fiado não: aqui se paga na hora.» | igual | «A moeda, agora.» | **C** |
| 23 | dou uma tocha a Dagon para ele carregar | sem | «🤝 1 tocha para Dagon Mão-Torta (restam 5 tochas).» | tochas 6 → 5 | «Ele a segura… a acende no borralho» | **C** |
| 24 | Dagon, me devolve a tocha que eu te dei | sem | «🤝 As tochas do grupo estão na sua mochila: Dagon não carrega outras.» | tochas 5 → 5 | **«Dagon puxa a tocha da cintura e a devolve»**; «diz a freira, da porta» | **D** (i)+(iv) leve |
| 25 | pergunto a Corwin quem é a mulher da porta… | sem | — | — | «— É **Freya**. Cobra o portal.» | n/a (ausente aparece) |
| 26 | volto ao Arco Pálido | cartão «Ir · 5 min» | «📍 Você está em Arco Pálido.», «Conquista: Rosto Conhecido», «▸ Códex» | lugar muda | uma narração; Em cena certo; «Freya **te** vê primeiro» | n/a |
| 27 | pergunto a Thalia quando o leitor costuma chegar… | sem | — | — | «Ele chega quando a luz já foi» | n/a |
| 28 | espero o anoitecer com Dagon, escondidos… | cartão «Esperar · 1 h / 2 h / 4 h» (cliquei «4 h»; 09:52 → 13:52) | «🕐 Você deixa 4 h passarem…» | — | «Quatro horas passam… **E estende o alaúde a você.**» | n/a (juiz «distancia 1») |
| 29 | ataco quem lê o livro à noite com a besta, e peço que Dagon lance um feitiço nele (**sem turno**) | — | cartão «**Atacar Thalia**: Thalia não é inimigo: atacar é um crime… Hakon, Corwin estão vendo» (dispensado) | — | — | (sem turno) |
| 30 | peço a Dagon que lance um feitiço de luz sobre o corpo de Kolvar… | sem | — (Em cena: **Kolvar**, Thalia, Freya e mais 1) | — | «Luz fria escorre… **tira o elixir do cinto do morto**» | n/a |
| 31 | onde está Aldric? | sem | «🧭 Aldric está em A Última Brasa.» | — | «Aldric vive na última… **Sobe** a rua do portal e **procura**» | n/a (linha certa) |
| 32 | vou até A Última Brasa | cartão «Ir · 5 min» | «📍 Você está na Última Brasa.» | lugar muda | uma narração; Em cena: Aldric, Piotr, Bjorn | n/a |
| 33 | pergunto a Piotr se foi o nome dele que leram… | sem | — | — | «— Foi o meu nome. Eu ouvi do quartinho.» | n/a |
| 34 | dou 3 moedas a Freya pelo que ela viu do portal (**ausente**) | sem | «🧭 Freya Queima-Campos não está aqui — está em Arco Pálido.»; conferente corta (pagamento) | ◉ 27 → 27 | «As moedas seguem na sua bolsa… Ela não está aqui» | **C** |
| 35 | reviro as cinzas e os cantos da Última Brasa… | **3 + 3 = 6 vs 13, falha** | «🎯 Percepção. Precisa de 13», «↯ …o lugar fica remexido» | igual | «Você não achou nada.» | n/a |
| 36 | dou o Elixir de Destreza a Dagon | sem | «🤝 Elixir de Destreza agora é de Dagon Mão-Torta.» | mochila → bolsa de Dagon | «enfia no bolso de dentro do casaco» | **C** |
| 37 | Dagon, me devolve o elixir que eu te dei | — | **sem turno** (carta «Decidir» aberta); processada ao clicar «Escolher»: «🤝 Dagon passa a você: Elixir de Destreza.» | bolsa de Dagon → mochila | «devolve o frasco. O vidro está morno.» | **D** (ii) |
| 38 | (idem) (**sem turno**; carta fechada, reabriu) | — | — | — | — | (sem turno) (ii) |
| 39 | pergunto a Bjorn o que ele viu de noite… | sem | — | — | «Vi uma luz no Arco. E vi você, chifrudo.» | n/a |
| 40 | tomo a paciência de Aldric e guardo para mim | sem | «✋ A paciência de Aldric não é coisa que se pegue com a mão.», **«🤲 Você recolhe: Elixir de Intelecto»**; conferente corta (objeto) | + Elixir de Intelecto | «A paciência continua no gnomo» (nada do elixir) | **D** (i) leve |
| 41 | vou até o Arco Pálido ver o que o fogo deixou | cartão «Ir · 5 min» («você viu Kolvar… aqui hoje») | «📍 Você está em Arco Pálido.»; conferente corta Freya (ausente) | lugar muda | uma narração; Em cena Freya, Thalia, Gareth | n/a |
| 42 | examino a pedra enegrecida do Arco e a cinza… | sem | — | — | «Não há marcas novas, nada escondido sob o pó.» | n/a |
| 43 | pergunto a Thalia o que anda escrevendo no caderno… | sem | — | — | «— O que eu vi. O que o fogo não apagou.» | n/a |
| 44 | vou até o Balcão do Degrau | cartão «Ir · 5 min» | «📍 Você está em Balcão do Degrau.» | lugar muda | uma narração; **«Freya está encostada no balcão… Thalia sentou-se num degrau»** (Em cena: Corwin, Hakon, Runa) | n/a |
| 45 | vendo o Elixir de Intelecto ao mercador do balcão (**sem turno**) | cartão «Vender», sem valor | «O mercador não está aqui para comprar, e o mercado fica longe daqui» | igual | — | **D** (i) |
| 46 | vendo o Elixir de Intelecto a Hakon | cartão «Vender · ◉ +23», dois cliques | «🛒 Vendido: Elixir de Intelecto a Hakon o Silencioso por ◉ 23 (bolsa: ◉ 87)» | ◉ 64 → 87; sem o Intelecto | «O Elixir de Intelecto muda de mão… o guarda no colete» | **C** |
| 47 | pergunto a Hakon quanto custa uma poção de cura e uma ração | sem | — (Em cena: «Hakon, **Poção de Cura Pequena**, Corwin e mais 1») | — | «Poção de cura, cinquenta coroas. Ração, duas.» | n/a (preço da ração bateu no 48) |
| 48 | compro uma ração de viagem de Hakon | cartão «Comprar · ◉ 2», dois cliques | «🛒 Rações de viagem — ◉ 2 (restam ◉ 85)» | ◉ 87 → 85; rações 9 → 10 | «embrulha a ração num pano encardido» | **C** |
| 49 | tiro a bolsa de moedas do cinto de Corwin sem ele ver, enquanto Dagon puxa conversa | **18 + 2 = 20 vs 15, sucesso** | **nenhuma linha** | ◉ 85 → 85 | «A bolsa está com você.» | **D** (ii)+(iv) |
| 50 | pergunto ao viajante magro quem era o homem… | sem | — | — | «— Um de capuz. Não vi o rosto.» | n/a |
| 51 | ameaço Corwin: diga onde está Aldric agora ou eu conto… | **1 vs 16, FALHA CRÍTICA** | «🎯 Intimidação. Precisa de 16», «😵 Falha crítica… Exausto» | igual | **«Aldric não se intimida.»** | n/a |
| 52 | parto para o Andar 48 — da Chuva com Dagon | cartão «Partir» (confirmar só depois de clicar no cabeçalho do cartão) | «⚿ Não há caminho direto até Andar 48 — da Chuva…» | igual | «não há caminho direto… a passagem está fechada até o Elemental Menor cair» | n/a |
| 53 | dou 3 moedas a Gareth… (**ausente**) | sem | «🧭 Gareth Sombravinda não está aqui — está em Arco Pálido.» | ◉ 85 → 85 | «As moedas permanecem na sua mão» | **C** |
| 54 | vou até o Arco Pálido falar com Gareth | cartão «Ir · 5 min» | «📍 Você está em Arco Pálido.» | lugar muda | uma narração; Em cena Gareth, Thalia, Freya | n/a |
| 55 | dou 3 moedas a Gareth pelo que ele viu… | cartão «Pagar ◉ 3», dois cliques | «◉ −3 moedas» | ◉ 85 → 82 | «As moedas somem no bolso da capa» | **C** |
| 56 | tomo a atenção de Freya e prendo ela em mim… | sem | «✋ A atenção de **Dagon Mão-Torta** não é coisa que se pegue com a mão.» | igual | «Sua mão fecha no ar, perto do ombro de Dagon» | **D** (i) |
| 57 | pergunto a Thalia o que o fogo deixou… | sem | — | — | «A marca já estava antes do fogo.» | n/a |
| 58 | examino a marca na pedra do Arco… | sem | — | — | «três traços quebrados, como um V deitado» | n/a |
| 59 | peço que Dagon lance um feitiço sobre a marca… | sem | — | — | «passa a ponta do cajado… **ajoelha-se**» | n/a (pedido: virou turno) |
| 60 | pego uma moeda do bolso de Freya às escondidas | **9 + 2 = 11 vs 15, falha** | «↯ **Thalia** vê a sua mão» | igual | «Sua mão se move para o cinto de **Thalia**» | **D** (i) |

**Turnos por clique** (5): (A) «4 h» no cartão de esperar (o do 28); (B) «Espreitar» (painel «Frente a frente»): terreno de caverna, iniciativa, «Encontro fácil», uma narração que continua o alaúde; (C) «Esperar» + «Agir»: rodada do mundo (Kolvar acerta Dagon, Dagon «Explosão Mística» erra; a prosa concorda); (D) «Atacar» + «Agir» (14 + 4 = 18, 12 de dano, Kolvar 0/11) → o cartão «Poupar/Matar»: «Matar»; «Recolher» o elixir, «Respirar fundo»; (E) «Escolher: devolver o livro a Thalia»: quest cumprida, ◉ +37, +100 XP (27 → 64), mais a frase 37 pendente.

Ficha no fim: ◉ 82; mochila com **Elixir de Destreza**; equipados Besta Leve e Couro Batido; rações 10, água 10, tochas 5; bolsa de Dagon vazia (Adaga e Gibão de Couro equipados); nível 1 (XP 199 de 300); Exausto (51); lugar: Arco Pálido, 10/10 PV; Dagon 4 de 11 PV.

## Defeitos, por gravidade

### Defeitos do sistema (o sistema decidiu ou aplicou errado, ou não devolveu veredito)

**Graves** (mexem em dinheiro, inventário, ou bloqueiam uma ação que devia valer):
1. **Moeda saiu sem linha a quem está ausente** (19). **«dou 3 moedas a Gareth Sombravinda pelo que ele viu no Arco ontem à noite»**: nenhuma linha, ◉ 27 → 17 (−10; o quadro ganhou a carta `o_livro_dos_nomes|extra:vantagem` com `caminho: pagar`), a prosa faz Gareth, que o sistema dissera em Arco Pálido, aparecer e pegar «as três». **Não se repetiu** no 53 (linha certa, ficha igual).
2. **Furto com sucesso (ou «por um fio») sem veredito** (7, 49). 49: 18 + 2 = 20, nenhuma linha, ◉ 85 → 85, e a prosa «A bolsa está com você». 7: «por um fio — e paga», sem dizer o que veio nem o que custou, e a prosa entrega «a chave».
3. **A carta de decisão trata o abatido como vivo, e a lista «Em cena» o mantém** (30, carta). Dois de três caminhos falam de Kolvar vivo depois de «Matar». A seção 32 tirou da carta o caminho «viva», mas não cobre o que a carta diz do abatido.
4. **A carta aberta engole a frase** (37, 38). «me devolve o elixir que eu te dei» virou o caminho «Devolver o livro»; duas frases sem turno, processadas só quando a carta foi escolhida (na ordem do log, as linhas da carta vêm antes da frase).
5. **Venda negada onde o vendedor está** (45). **«vendo o Elixir de Intelecto ao mercador do balcão»** no Balcão do Degrau, com Hakon à vista (a quem comprei e vendi): «O mercador não está aqui para comprar, e o mercado fica longe daqui». Com «a Hakon», vendeu (46).
6. **Alvo trocado quando a frase tem mais de um nome** (29, 56, 60). 29 «quem lê o livro à noite» → «Atacar Thalia» (e o feitiço de Dagon ignorado); 56 «atenção de **Freya**» → «**Dagon**»; 60 «bolso de **Freya**» → «**Thalia** vê a sua mão». O 29 teve cartão com o crime, o que **evitou o dano**.
7. **«entrego você ao cobrador» lido como entregar o livro** (9). Sem turno; a frase abria com ameaça.

**Médios:**
8. **A lista «Em cena» mostra objetos como gente** (11 «Chave sem fechadura conhecida»; 38 e depois «Elixir de Presença»; 47 «Poção de Cura Pequena») **e o morto** (30).
9. **O cartão oferece uma viagem que o veredito nega depois do clique** (52). «Partir para Andar 48 — da Chuva»: o botão «Partir» aparece, e o clique devolve «⚿ Não há caminho direto…». Quebra «o veredito antes do clique». (E o botão de confirmar só aparece depois de um clique no cabeçalho do cartão.)
10. **O lugar** (13): «vou até o degrau da capela com Thalia» → «Ir até Balcão do Degrau»; **a prosa leva a cena a um «degrau»/«sino» no alto** (5, 12) enquanto o sistema segue em Arco Pálido.
11. **A luta: terreno de outro lugar** (clique «Espreitar»): «na boca da caverna… atrás das estalagmites… no poço escuro» num arco de cidade; o painel diz «quem lê o livro à noite», o inimigo é «Kolvar Guarda-Portão»; **a primeira narração da luta continua o alaúde de Gareth**.
12. **A linha de butim muda de elixir** (clique da luta): «🧺 No chão: Elixir de Destreza» e, depois, «✧ …Elixir de Intelecto, no chão»; e **«tomo… guardo para mim» (40) recolhe do chão de outro lugar o que não foi pedido**.
13. **A linha de devolução contradiz a linha anterior** (24): «🤝 As tochas do grupo estão na sua mochila: Dagon não carrega outras.» depois de «🤝 1 tocha para Dagon (restam 5)».
14. **A linha 🔎 diz «está aqui» de quem mora noutro prédio** (2).
15. **O conferente cortou a fala de uma presente** (41, Freya) e **deixou passar** 7, 16, 19, 24, 44, 49, 51 e a frase órfã do 28.
16. **Um turno com duas narrações** (4, ao concluir dois passos na conversa).

**Leves:**
17. «Engenheira» na criação e «Engenheiro» no painel.
18. «Em cena: … e mais 1», sem dizer quem.
19. A carta ainda tem «**escreve**» (tu) no rodapé; o cartão de ir ao Arco ainda lembra «você viu Kolvar… aqui hoje» depois de o ter matado.

### Prosa que desobedeceu a um fato dado

1. **49** «tiro a bolsa… do cinto de Corwin»: nenhum fato; a prosa «A bolsa está com você».
2. **24** «Dagon, me devolve a tocha»: o fato é «Dagon não carrega outras» e a prosa «a devolve».
3. **7** «tiro uma moeda do bolso de Gareth»: o fato é «por um fio — e paga»; a prosa dá «a chave» e faz Freya cobrar «Vinte e quatro coroas» (nada disso no sistema); **10** repete «A chave pesava no seu bolso».
4. **16** «dou 5 moedas a Hakon por uma tocha»: o fato é «◉ 1»; a prosa «pega as cinco moedas» e dá pano e pederneira.
5. **19** (ausente): o fato é nenhum; a prosa põe Gareth ali, pegando as moedas, em primeira pessoa.
6. **44, 13, 25, 24, 2, 51**: Freya, Thalia, a «freira», Aldric, onde o sistema diz que não estão.
7. **30** «tira o elixir do cinto do morto»: o fato é um elixir já recolhido; **a carta** dá o Kolvar morto por vivo.
8. **28** «E estende o alaúde a você.»: nenhum fato, sem sujeito, e o conferente não cortou.
9. **PT-PT:** 6 turnos com imperativo em «tu» em fala, 4 ênclises firmes no narrador; a carta tem «escreve».

## O que não verifiquei

- **O homônimo (mesmo primeiro nome):** o mundo sorteado **não tinha dois personagens com o mesmo primeiro nome**; o mais próximo é «Piotr **Rompe-Escudos**» (o sobrenome do herói). **O item 1 não pôde exercitar o ponto central do conserto da seção 32** (o nome sozinho com um presente e um ausente). A procura e o pagamento a ausente foram testados com nomes distintos.
- **O suborno que passa:** só vi o que falha (21); a moeda que sai no sim não foi vista.
- **A viagem longa até a chegada:** a única viagem pedida (52) foi negada; não contei narrações de chegada de viagem longa, só as 7 chegadas dentro dos muros.
- **Repetição exata de frases que deram certo** e **o «já tentou» em «tomar»**: não repeti (o jogo livre não pediu).
- **Conferente nos cliques:** os 5 turnos por clique não passaram pelo console; a luta, a carta e o clique de «4 h» ficaram sem registro do conferente.
- **O cartão «Poupar/Matar»:** só «Matar»; não vi o que a carta e a prosa dizem do abatido **poupado**.
- **Preço da poção de cura:** a prosa disse «cinquenta coroas»; não conferi com painel nem cartão.
- **A quest «As cinzas de ontem»** ficou aberta (0 de 3 pistas); não avaliei sua carta nem o confronto seguinte.
- **A causa do ◉ −10 do 19:** inferida do save (carta `extra:vantagem` `pagar`), não confirmada; não abri o quadro de pistas.
- **«Mais 1» em «Em cena»:** não abri o painel «Pessoas» para saber quem era.
- **Chamadas de IA:** «60 + a abertura» é a soma dos 61 textos de Mestre salvos; as chamadas pequenas do juiz/conferente não foram somadas à parte.
