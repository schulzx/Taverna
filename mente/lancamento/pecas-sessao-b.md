# As peças — a prova jogada (sessão B) · transcrição bruta

Servidor: cópia do commit 95839d7, semente da mesa `mesa|9` (Fantasia medieval · Terras abertas · Jornada do Herói; herói Alaric Guarda-Portão, Invocador; companheira Petra, Guerreira; cidade Velha do Vigia). Quest: «O Que Desce ao Anoitecer». Pastora: Bryna. Curral: «Fole do Sal».

## RUN A — o jogador de mesa (peças LIGADAS)

### A01
- Frase: «Digo à mulher da praça que vou ao Fole do Sal, e pergunto o que ela sabe sobre o bicho que desce à noite.»
- [pecas] turno: etapa ver · tipo **livre** · solução null · abre null · cobrança null. Sem dado.
- [pecas] verdade: antes [Bryna] · depois [Bryna] · podadas 0 · cena [Petra]
- Estado: nada mudou (0 de 4).
- Narrador: «A mulher dá um passo para o lado, abrindo espaço sem tirar as mãos da cintura. 'Vai é te convencer a não ir', diz ela… 'O Fole do Sal é da Bryna, e a Bryna não quer conselho de quem chega da estrada.'» Nomes: Bryna (do gancho, não em cena). Pista visível: nenhuma.
- Leitura: (b-) respondeu ao que escrevi, sem avançar e sem pista nova; a mulher não é um retrato EM CENA.

### A02 (ir ao curral)
- Frase: «Sigo para o Fole do Sal com Petra, de olho nas traseiras e na lama.» → o jogo mostra a proposta «Ir até o Fole do Sal · 5 min · dentro dos muros» (o preço antes do clique); cliquei «Ir · 5 min» (dois cliques: o primeiro só expande).
- [pecas] turno: etapa ver · tipo livre · sem solução. [pecas] verdade: antes [Bryna] · depois [Bryna] · **podadas 2** · cena [Petra].
- Estado: **etapa 1 «Ver o que ficou no Fole do Sal» fechou SEM dado** (chegar = fato «esteve»); etapa 2 «Seguir o rastro até onde a besta dorme», PISTAS 0 de 2. Dia 08:10. Em cena entraram Loras (aprendiz de ferreiro) e Bryna.
- Dado aberto pelo Mestre: Percepção, precisa de 13, «Se falhar, você fica sabendo na mesma. Mas pode custar: as horas se vão nisso ou você sabe só a metade ou alguém te vê.» (preço dito antes).
- Narrador: «A forja cheira a carvão e ferrugem. 'Já soube. Chegou cedo demais…' Atrás de você, a porta range: arranhões na madeira, fundos, à altura de um ombro. Petra… 'Não foi gato.'» Nomes: Loras (agora em cena), Bryna (em cena). Pista visível: arranhões à altura de um ombro.
- Leitura: (a) avançou (a etapa fechou) mas sem dado.

### A03 (clique em «Rolar d20 + 1 · Percepção»; frase gerada pelo sistema: «Olho em volta com atenção.»)
- [pecas] turno: etapa rasto · tipo **solucao** · solução `revistar@curral`. [pecas] dado: passou **true**, tipo/fatos/preço null. [pecas] verdade: antes [] · depois [] · podadas 1 · cena [Petra, Bryna].
- Dado: **Percepção, d20 = 12 (13 a bater) → falhou por 1 → «o mundo negocia»: acha a pista, mas «o dobro do tempo se foi e ficou tudo fora do lugar»** (dia 08:10 → 08:35; +60 XP). Preço dito ANTES de rolar: «Se falhar, você fica sabendo na mesma. Mas pode custar: as horas se vão nisso ou você sabe só a metade ou alguém te vê.»
- Estado: PISTAS 1 de 2 (descobriu o curral). Etapa 2 continua.
- Narrador: «Você força os olhos pelo chão de terra batida… Húmus fresco, uma pegada larga demais para bota de gente. … o rasto está ali — e a forja está revirada. / Eu não posso entrar lá.' / Petra olha a porta arranhada. 'Alguma coisa anda pelo pátio. E voltou para o monte.'» (um fragmento de fala sem dono — «Eu não posso entrar lá.'» — sobrou da poda, sem aspa de abertura.) Nomes: Loras (em cena). Pista visível: pegada larga, voltou para o monte; botão novo «Ir até O Ossário do Corvo».
- Leitura: (a) respondeu e avançou (pista 1/2), com dado e preço pago em tempo.

### A04 (pergunta à pastora)
- Frase: «Pergunto a Bryna se ela viu a besta com os próprios olhos e para onde acha que ela volta de dia.»
- [pecas] turno: etapa rasto · tipo solucao · `fazer_falar@pastora` · abre null. Abriu dado: Persuasão d20+2, precisa de 15, preço dito: «Se falhar, só a bolsa abre essa boca.» (Uma pergunta simples a uma pessoa que já falava virou teste de 15.) 
- Rolei: **6 + 2 = 8 → falhou**. [pecas] dado: passou false · tipo falha · fatos [] · **para `pagar@pastora`** (a falha leva à solução «pagar»). [pecas] verdade: antes [] · depois [] · podadas 0.
- Estado: nada fechou (1 de 2). Dia 08:45 (+10 min).
- Narrador: «Você tenta o que sabe: meia voz, uma pausa, o nome do medo dela. Bryna cruza os braços e olha para o fole. 'Pergunta bonita. Só que a resposta custa.' Não há mais nada ali para você.» Nomes: nenhum novo. Pista: «a resposta custa» (aponta para pagar, sem botão).
- Leitura: (d) abriu um dado a uma pergunta (a pessoa não era hostil); a falha encaminhou para «pagar» de forma legível só pela frase «a resposta custa»; «Não há mais nada ali para você» soa parede.

### A05 (suborno à pastora, seguindo a seta da falha)
- Frase: «Tiro cinco moedas da bolsa e ponho no balcão: digo à Bryna que é por tudo que ela viu esta noite.» → proposta «Pagar ◉ 5» com «Reescrever»; confirmei «Pagar · ◉ 5».
- [pecas] turno: etapa rasto · tipo **aquecimento** · esquenta [`pagar@toca`, `pagar@pastora`] · sem dado. (A falha anterior apontava `pagar@pastora`; o suborno explícito à pastora NÃO acionou essa solução — ficou ambíguo com `pagar@toca` e virou aquecimento.) [pecas] verdade: antes [] · depois [] · podadas 0.
- Estado: **moedas 25 → 20 (5 pagas de verdade)**; PISTAS 2 de 2; o Livro passa a dizer «próximo passo: estar no Ossário do Corvo»; etapa 1 «cumprida no dia 1» (a nota do Livro: portas com prego novo, recibo no prego — «alguém lhe dá de comer»). Dia 08:50.
- Narrador: «Bryna olha o dinheiro sem tocar. 'Não vou cobrar por coisa que ainda me tira o sono.' **Empurra as moedas de volta**, mas deixa a mão pousada um instante a mais. Loras parou de varrer. 'Se quer pagar, vá ao Ossário do Corvo e pergunte ao coveiro por um gancho. Quem mexe lá sabe o preço de cada coisa.'» → **contradição prosa × sistema**: na prosa ela devolve o dinheiro; no sistema as 5 moedas saíram. Nomes: «o coveiro» (pessoa sem nome, fora da lista), «um gancho» (objeto; o Livro «A Mão por Trás» tem «prego dobrado em gancho», talvez coincida).
- Leitura: (a) avançou — a pista para o Ossário veio visível e clara. Preço real: 5 moedas, sem a pista «comprada».

### A06 (a tentativa criativa: armar uma armadilha)
- Frase: «Peço ao Loras um laço de ferro e uns dentes de arame, para armar uma armadilha na trilha que o rasto mostra.»
- [pecas] turno: etapa rasto · tipo **aquecimento** · esquenta [`escalar@toca`, `arrombar@toca`, `convencer@toca`] (três soluções sem relação com a frase) · sem dado. [pecas] verdade: antes [] · depois [] · podadas 0.
- Estado: nada fechou; +17 XP «uma conversa que ficou»; dia 08:55 (+5 min). **A Bolsa NÃO ganhou o laço** (só a Gazua de osso).
- Narrador: «Loras larga a vassoura e pega do depósito um laço de ferro e arame duro. 'Toma, e não diga que eu não avisei.' Bryna assiste, silenciosa, como quem já viu essa armadilha antes.» → o Narrador **deu um item** (laço de ferro, arame) que o sistema não tem. Nomes: Loras (em cena). Pista: nenhuma nova.
- Leitura: a mesa respondeu, o mundo não pesou nem custou; (b-) sem pista nova, mas sem parede; só que o item é fantasma.

### A07 (ir à toca: Ossário do Corvo)
- Frase: «Sigo para o Ossário do Corvo com Petra, devagar, o laço de ferro na mão.» → proposta «Ir até o Ossário do Corvo · 5 min»; confirmei.
- [pecas] turno: etapa rasto · tipo livre · sem solução (movimento). [pecas] verdade (duas medidas): antes [] / depois [] · podadas 2 e depois 1 · cena [Petra, Bryna].
- Estado: **etapa 2 fechou sem dado** («esteve na toca»; ✓ Seguir o rastro até onde a besta dorme), etapa 3 «Encarar o que desce ao anoitecer na toca», PISTAS 2 de 3, dia 09:05. Apareceu «Stiletto · comum» no chão (item da cena) e uma oferta lateral «Aceitar: ajudar a pagar o homem do porto — Mabel conta com você».
- **Surge o FRENTE A FRENTE (o confronto da quest):** «o que desce ao anoitecer — ainda não te viu — À VISTA · ESTÁ SÓ». Opções com preço antes do clique: Espreitar (Furtividade CD 13, 1 h, «se falhar: fui visto, e a luta vem direita a mim», 50%, d20+2) · Falar (Persuasão CD 15, «se falhar: a conversa acabou em aço, cara a cara», 40%) · Capturar (Atletismo CD 17, 1 h, «se falhar: a corda falhou, e veio direto para cima de mim», 35%, d20+3) · Lutar · Recuar (sem dado, 100%) · «ou escreva o que você faz — o campo continua aberto». Sem botão «Intimidar».
- Narrador: «O portão do Ossário do Corvo range quando você o empurra. Lápides tortas emergem da neblina baixa… Petra caminha ao seu lado. Aldric, o coveiro, levanta a pá e limpa a testa: 'Chegou cedo para enterrar alguém, Guarda-Portão?' Ulric, a carpideira, observa de longe.» + «'Pouca gente vem aqui de dia sem trazer luto.' O olhar dele desce ao chão, ao que está meio solto entre as raízes.» Nomes: Aldric (coveiro), Ulric (carpideira) — não estavam em cena antes (o sistema os pôs: «Em cena» passou a +1; `verdade` não os conta como fora da lista, o que sugere que vieram da pauta). Pista visível: o stiletto no chão, o coveiro olha para ele.
- Leitura: (a) avançou (a etapa 2 fechou e entrou o confronto); a oferta lateral e o stiletto são ruído bom.

### A08 (INTIMIDAR A FERA, com o FRENTE A FRENTE aberto)
- Frase: «Tento intimidar a fera: bato o laço de ferro no chão, grito e ergo a tocha na cara dela.»
- **NENHUMA linha [pecas] nesses três passos** (a frase, o dado, o continuar): com o confronto pendente o jogo entrega a frase ao jogo de hoje. Esse jogo abriu: «intimidar — dificuldade 14 (um favor que lhe custa pouco). Seu bônus: +3 · sem treino.» + Rolar d20+3 Intimidação, precisa de 14 + Mudar de ideia. **Sem preço de falhar dito.**
- Rolei: 11 + 3 = 14 vs 14, passou por 0 (oferecia «Refazer · gasta 1 de 1», o ponto de heroísmo). 
- Estado: dia 09:10; XP +17; a modal «FRENTE A FRENTE» continua aberta: a fera «ainda não te viu», «À VISTA · ESTÁ SÓ». Nada mudou na etapa (2 de 3). Em cena: Aldric, Brannoc Pé-Leve (novo), Ulric.
- Narrador (CONTINUAR): «Assim faz barulho. Aldric apoia-se na pá e olha para o chão, para o laço de ferro na sua mão. 'Cova velha. Seis anos.' Três palavras, e o vento as leva. Ninguém ouviu o barulho: só as lápides e a neblina baixa. Ele aponta além das cruzes tortas… 'Quer saber do que desce à noite? Venha.'»
- **A intimidação foi resolvida contra o coveiro, não contra a fera** (encaixe errado: a frase dizia «a fera»; o jogo de hoje intimida a pessoa mais à mão). A fera nem reagiu. O resultado foi uma pista boa (Aldric oferece levar ao covil), mas não o que escrevi.
- Leitura: (d) encaixe errado — leu a minha frase como outra coisa; e preço de falhar não dito. Aqui as peças nem estavam no jogo.

### A09 (segunda tentativa de intimidar a fera, com outras palavras)
- Frase: «Respiro fundo, aponto a tocha para a cabeça da fera e rujo para ela recuar, sem tirar os olhos dela.»
- **Nenhuma linha [pecas]. Nenhum dado.** Dia 09:15 (+5 min). 
- Narrador: «O urso não recua. A chama sacode, e os olhos dele acompanham o fogo sem medo. Petra desliza um passo à sua esquerda… 'Não vai.' … Aldric fica parado, a pá torta apertada contra o peito.» → **o Narrador decidiu o resultado** («não recua») sem dado, e **chamou a fera de «urso»** (o retrato da modal é um dragão de escamas). Fora da lista: «urso» (espécie).
- Leitura: (c)/(e) o jogo respondeu na prosa e o mecânico ficou parado: parede macia — a intimidação da fera falhou SEM rolar. Para onde a falha leva: a lugar nenhum (a modal segue igual).

### A10 (o FRENTE A FRENTE: Espreitar · 50% · 1 h — clique)
- Escolhi «Espreitar · 50% · 1 h» (radio + botão). **Nenhuma linha [pecas]**; o dado da Furtividade não ficou visível no texto da tela (não consegui ler o número); a cena virou LUTA em seguida: «O OSSÁRIO DO CORVO · RODADA 1 · Entre as mesas» — Alaric 10, **Dragão Jovem «o Lobo do Vau»** 8 (18 PV), Petra 3. A besta é um dragão jovem (a prosa A09 dizia «urso»). A grade é de taverna («JUNTO AO BALCÃO», «ENTRE AS MESAS», «AO PÉ DA ESCADA») dentro de um cemitério.
- Narrador: «Atrás de você, Ulric sussurra uma reza e some entre as cruzes. Petra encara a porta e espera.» («a porta» num cemitério.)
- Leitura: (a) avançou (a luta veio) mas (d) o dado de Espreitar não apareceu à vista.

### A11–A12 (a luta no Ossário: o confronto virou combate)
- Combate por grade (fora das peças; sem linhas [pecas]): ataquei 3x (as 3 primeiras rodadas erraram, 2 de dano em mim, depois **14 de dano em mim 5+11 → Alaric caiu a 0/13 PV, «CAÍDO · MORRENDO», testes de morte 0 de 3 sucessos · 1 de 3 falhas**), e a Petra + o meu último golpe (14 de dano) mataram o **Dragão Jovem «o Lobo do Vau» (18 PV)**. Vitória: +37 moedas, −13 PV, −4 PM, +72 XP, +3 essência; no chão: Poção de Cura Pequena, Essência Residual.
- Narrador durante a luta: «O urso não se move. No chão, ao alcance da mão, um frasco de vidro grosso rola e para contra a poção de cura.» → de novo «urso» (o sistema diz dragão jovem); «frasco de vidro grosso» não é item do sistema.
- O herói esteve em risco real (0 PV, morrendo).
- A luta aconteceu depois de: 2 intimidações sem dado (A08/A09, uma passou contra o coveiro) + Espreitar 50% (falhou/virou luta). 

### A13 (a encruzilhada final: «Decidir o que fica de Dragão Jovem o Lobo do Vau»)
- Estado: depois da luta a etapa «Encarar … na toca» fechou (✓), com a prosa da luta inteira escrita pelo Narrador: «O laço de ferro range quando você arremessa, mas a argola escapa…» (eu nunca arremessei nada), «o urso-dragão tomba de lado», «Ela… amarra o focinho do bicho» (a fera morta amarrada), «Teste de morte: 9 — enfraquece (falha)». Alaric ficou a **0 PV** (0/13) no fim da luta.
- A carta de escolha (preço dos dois lados ANTES do clique): entregar a besta à aldeia · levá-la **viva, de coleira, até à praça** · levá-la ao alto do monte e **soltá-la** · «Há outras maneiras. Faça do seu jeito». **Contradição: a besta morreu na luta (dragão jovem, 18 PV), e duas das três cartas pressupõem que está viva.**
- Escolhi «Entregar à aldeia» (clique + «Escolher: entregar…»). Quest **cumprida** às 09:20 do dia 1; +100 XP, +37 moedas, **Alaric nível 2**, a história passou a «O Pão que Sai de Noite». Sem linhas [pecas] neste passo (a carta de escolha é do sistema de antes).
- Totais da run A: **13 respostas do Narrador na quest** (A01, A02, A03, A04, A05, A06, A07, A08, A09, A10 + as da luta + a escolha). Tempo do jogo: 08:00 → 09:20.

## RUN B — o conversador (peças LIGADAS, mesma semente `mesa|9`, campanha nova com a página recarregada)
(Defeito achado pelo caminho: ao usar «Levantar da mesa → Nova aventura» SEM recarregar a página, a campanha nova abriu com o herói já no «Ossário do Corvo» e com Aldric/Stiletto em cena — o lugar da campanha anterior vazou. Com a página recarregada a abertura é a normal, em Velha do Vigia. A run B e a C começam recarregadas.)

### B00 — a abertura
- Narrador: «Velha do Vigia cheira a feno molhado e a ferradura fria. … Na porta, a guarda estende a mão. Você paga a medalha de cobre de visitante… Petra… ri baixo — 'Ha. Morreu.' …» e, antes do herói tocar em nada, o gancho da quest. (Sem linhas [pecas]: a abertura não é turno.)

### B01
- Frase: «Respondo à Petra que primeiro quero ouvir o que o povo da praça diz sobre o bicho, antes de ir às traseiras.»
- [pecas] turno: etapa ver · **aquecimento** · esquenta [`vizinhos@curral`] · sem dado. verdade: antes [] · depois [] · podadas 0 · cena [Petra].
- Estado: nada fechou; 08:05. A abertura tinha um dado de Percepção oferecido (que ignorei); ele sumiu da tela.
- Narrador: «Petra ri sem abrir a boca. Depois cospe no chão. "O povo diz que o bicho anda de pé." … "E que só entra onde alguém deixou a porta aberta." Baixa a voz… "É o que dizem. Agora anda."» Nomes: nenhum novo. **Pista visível**: o bicho só entra onde deixaram a porta aberta (e «Agora anda» empurra para o curral).
- Leitura: (b) aquecimento que funciona — respondeu ao que escrevi e deu uma pista; o «Agora anda» tem um leve (e).

### B02
- Frase: «Chego ao homem do pão, compro um pão e puxo conversa sobre o que aconteceu ontem à noite.»
- [pecas] turno: ver · aquecimento · esquenta [`vizinhos@curral`] · sem dado. verdade: antes [Bryna] · depois [Bryna] · podadas 0 (Bryna é do gancho).
- Estado: 08:10, +17 XP «uma conversa que ficou»; **moedas continuam 25: a compra do pão (duas peças) foi só prosa**, nada na Bolsa.
- Narrador: «O homem do pão aceita as duas peças sem contar. Enrola o pão num pano e entrega quente. "Ontem? O sino tocou antes da meia-noite. Depois, só o cão da forja a ganir." Olha para O Fole do Sal e baixa a voz. "A Bryna não abre a casa desde então."» Nomes: o cão da forja (animal), Bryna. Pista visível: Bryna se trancou; o cão da forja ganiu.
- Leitura: (b) aquecimento com pista, sem avançar.

### B03
- Frase: «Pergunto ao homem do pão se ele viu algum estranho pela praça nos últimos dias, e quem poderia ter deixado a porta da Bryna aberta.»
- **Sem [pecas] turno.** O jogo leu a frase como um MOVIMENTO e mostrou a proposta «Ir até a Balança Coxa · 5 min» (não rolou, não gastou o Narrador). «Reescrever» devolveu o meu texto ao campo, sem perda.
- Leitura: (d) encaixe errado (menor: recuperável com um clique, e o preço dele estava à vista). 

### B03b + dado (a mesma pergunta, reescrita)
- Frase: «Pergunto ao homem do pão se ele viu algum estranho nos últimos dias.»
- [pecas] turno: ver · tipo **solucao** · `vizinhos@curral` (a TERCEIRA conversa com o mesmo homem; o jogo abriu o dado que eu não pedi). Texto do veredito antes de rolar: «Persuasão. Precisa de 14, a conversa já preparou o pedido: +1. Se falhar, sobra ler o que ficou.» (o calor virou +1 no dado e foi dito).
- Rolei: **19 + 2 = 21 vs 14 → passou.** [pecas] dado: passou true · tipo sucesso · **fatos [esteve, lugar:curral]**. verdade: antes [Bryna] · depois [Bryna] · podadas 0.
- Estado: **etapa 1 «Ver o que ficou no Fole do Sal» fechou, sem o herói sair da praça** (o fato «esteve no curral» foi escrito pela conversa com o padeiro); etapa 2 «Seguir o rastro…», PISTAS 0 de 2; 08:20; +17 XP.
- Narrador: «O homem do pão baixa a voz e olha para O Fole do Sal. "Depois da meia-noite, o cão da forja ganhou. A Bryna não abriu a porta desde então. Mas hoje cedo, no mercado, ela vendia uma fechadura." Você percebe: ninguém fala em bicho. Falam de porta aberta, de sino, de cão a ganir. E há uma chave à venda por trinta e nove peças, sem fechadura conhecida.» Fora da lista: «uma chave por 39 peças» (item sem dono no sistema); «ela vendia uma fechadura» (Bryna, que não está em cena, vendendo no mercado — o Narrador moveu Bryna e contradiz «não abre a porta»).
- Leitura: (a) avançou com dado — mas a etapa «Ver o que ficou no curral» fechou sem o jogador ver o curral (arbitrário/errado para o jogador).

### B04
- Frase: «Pergunto à Petra o que ela acha dessa chave à venda, e se já viu um bicho entrar numa casa trancada.»
- [pecas] turno: etapa rasto · tipo solucao · `perguntar@curral` · dado aberto: «Persuasão. Precisa de 15. Se falhar, só a bolsa abre essa boca.» **Uma pergunta à minha companheira virou teste de Persuasão 15 com preço «só a bolsa»** — encaixe errado (Petra é do grupo, não uma testemunha). Cliquei «Mudar de ideia»: o texto voltou ao campo, sem custo.
- Leitura: (d) abriu um dado que eu não pedi, lido como outra coisa (perguntar@curral).

### B04b
- Frase: «Falo com a Petra sobre a chave à venda. O que ela pensa disso, só entre nós dois?»
- [pecas] turno: rasto · **aquecimento** · esquenta [`convencer@toca`, `perguntar@curral`] · sem dado. verdade: antes [] · depois [] · podadas 0.
- Estado: nada fechou; 08:20; a «chave» e «39 moedas» apareceram como objeto de cena (botão «chave»).
- Narrador: «Petra olha na direção do balcão de O Cálice Velho. "Essa chave não tem porta por aqui. Uma chave sem porta é uma pergunta. E perguntas custam caro." Cospe no chão. "Mas não custam tanto quanto ficar sem resposta."» Nomes: «O Cálice Velho» (lugar novo, fora da lista), a chave. Pista: pouca («uma chave sem porta é uma pergunta»), sem direção clara.
- Leitura: (b-) respondeu, deu clima, sem direção clara do que fazer a seguir.

### B05
- Frase: «Fico um tempo na praça, ouvindo as conversas e observando quem entra e sai pela muralha.»
- [pecas] turno: rasto · aquecimento · esquenta [`convencer@toca`, `perguntar@curral`] (as mesmas duas) · sem dado. verdade: [] / [] · podadas 0.
- Estado: 08:25 (+5 min); nada fechou.
- Narrador: «A praça fala baixo. Dois carroceiros descarregam sacos de grão; uma mulher vende nabos e fala do filho que foi para Casa valente. Perto do portão, a guarda examina uma carroça de sal. Petra encosta o ombro na muralha… "Estás à espera do quê? De que o bicho desça e se apresente?"» Nomes: Casa valente (lugar do mapa). Pista: **nenhuma**; o único empurrão é Petra impaciente.
- Leitura: (c)/(b-) respondeu à frase com cenário, mas sem pista; a resposta é «ambiente». 

### B06 (o jogo me tira da conversa)
- Frase: «Conto à Petra um pouco da minha vida antes da estrada, só para passar o tempo enquanto penso.»
- [pecas] turno: rasto · **aquecimento** · esquenta [`convencer@toca`, `perguntar@curral`] · **abre `convencer@toca`** (o calor encheu): o Mestre abriu «Persuasão. Precisa de 15. Se falhar, só a bolsa abre essa boca.» Uma frase de conversa pura com a minha companheira virou teste social de 15 contra «a toca».
- Rolei: **18 + 2 = 20 → passou.** [pecas] dado: passou true · sucesso · **fatos [esta_em lugar:toca, esteve lugar:toca]** — ou seja, o sistema passou a considerar que estive na toca (Ossário do Corvo) sem sair da praça. verdade: antes [Mabel] · depois [Mabel] · podadas 1 · cena [Petra].
- Estado: 08:35 (+10 min); o Livro mostra a etapa 2 «Seguir o rastro…» com «um lugar / uma pessoa / estar no Ossário do Corvo»; Mabel («mestra de recados da guilda») e o Stiletto apareceram em cena na praça; botão «Ir até o Ossário do Corvo».
- Narrador: «Aperta o ombro de Petra como se fosse despedir-se de uma dívida antiga. "Me ajuda a pagar o homem do porto. Depois disso, estou livre." Petra olha para você, depois para Mabel, e cruza os braços. Você vê, na pressa dela, o que antes não tinha visto: o portão sul tem uma guarita de tijolo apagado, e o cobrador só chega quando o sol baixa. Foi por ali que tudo começou.» → o Narrador fala por mim («Me ajuda a pagar o homem do porto» — o texto da oferta lateral), põe Mabel e o Stiletto na praça, inventa «guarita de tijolo apagado» e «o cobrador».
- Leitura: **(d)+(e)** — dado que não pedi, lido como convencer a toca; e o sucesso escreveu um fato falso. Aqui o conversador foi tirado da conversa no 6.º turno (3.º com calor cheio), de forma que pareceu arbitrária (a frase era sobre a minha infância).

### B07
- Frase: «Pergunto à Mabel que trabalho é esse, de pagar o homem do porto, e quanto ela pagaria por isso.»
- Sem [pecas] turno: lido como movimento («Ir até a Garça Velha · 5 min», por causa da palavra «porto»). «Reescrever» desfez. Leitura: (d) encaixe errado (2.ª vez; a palavra de lugar numa frase de conversa vira viagem).

### B07c + dado
- Frase: «— Mabel, que trabalho é esse que você me oferece? Conta mais, que eu só estou ouvindo.»
- [pecas] turno: rasto · tipo solucao · `perguntar@curral` (de novo; 4.ª vez que uma pergunta vira `perguntar@curral`, mesmo quando a interlocutora é a Mabel e quem fala é o herói). Veredito: «Persuasão. Precisa de 13, a conversa já preparou o pedido: +2. Se falhar, só a bolsa abre essa boca.»
- Rolei: **19 + 2 = 21 vs 13 → passou.** [pecas] dado: sucesso · **fatos [descobriu lugar:curral]**. verdade: [] / [] · podadas 0.
- Estado: PISTAS 1 de 2; +60 XP «um segredo arrancado ao lugar»; 08:45.
- Narrador: «O homem do pão desvia o olhar para o balcão de O Cálice Velho. "Quem vende essa chave não quer a chave. Quer que ela ande de mão em mão." … "Dizem que quem a compra fica marcado."» → **respondeu com o padeiro, não com a Mabel, a quem perguntei**. Nomes: O Cálice Velho; a chave (de novo). Pista: a chave que «anda de mão em mão», «quem a compra fica marcado» — **não tem relação visível com a besta nem diz o que fazer**.
- Leitura: (c) pareceu IGNORAR o que escrevi (a Mabel nunca respondeu) + (d) o fato «descobriu o curral» foi escrito por uma pergunta sobre trabalho de guilda.

### B08 + dado
- Frase: «Peço à Petra que repasse em voz alta o que já sabemos: a porta aberta, o sino, a chave, e o que isso quer dizer.»
- [pecas] turno: rasto · solucao · `convencer@toca` (um pedido a Petra → persuadir «a toca»). Veredito: «Persuasão, precisa de 13» (sem frase de preço neste turno).
- Rolei: **7 + 2 = 9 vs 13 → falhou.** [pecas] dado: passou false · falha · fatos [] · **para `pagar@toca`**. verdade: antes [Mabel] · depois [Mabel] · podadas 0.
- Estado: 08:55 (+10 min); PISTAS 1 de 2; nada pago de verdade (a falha só aponta `pagar@toca`).
- Narrador: «Você tenta convencer Mabel a soltar alguma palavra. Ela limpa um copo, olha para você, e o pano para. "Pago para recados, não para conversas." Volta a limpar o copo. E ao lado dela, sem que você peça, Petra aponta com o queixo para as portas ao redor do Fole. As que não têm arranhões têm um prego novo por cima da ombreira. "Alguém marca as portas." Petra quase não move a boca. "E alguém lhes dá de comer."» → **a falha escreveu o alvo errado (Mabel, a quem não me dirigi) e transformou a praça num balcão («limpa um copo»)**, mas entregou uma pista boa e verdadeira (a nota do Livro: portas com prego novo; «alguém lhe dá de comer»). Nomes: Mabel; a cena passou a «Em cena: Chave sem fechadura conhecida».
- Leitura: (d) dado não pedido e alvo trocado; mas a pista da falha foi a melhor do conjunto (visível, concreta) — aquecimento que funciona, escondido atrás de um dado desnecessário.

### B09
- Frase: «Mastigo o pão em silêncio, olhando o portão sul, sem dizer nada a ninguém.»
- [pecas] turno: rasto · aquecimento · esquenta [`seguir@toca`, `esgueirar@toca`] · sem dado. verdade: [] / [] · podadas 0. Estado: 09:00 (+5).
- Narrador: «O pão divide-se num estalo seco. O portão sul tem a guarita de tijolo apagado e a sombra certa de quem espera. Petra mastiga uma azeitona… "Sabes ficar quieto. Isso vale alguma coisa."» Nomes: azeitona (objeto de cena). Pista: a guarita do portão sul e «a sombra de quem espera» (reaproveita o invento de B06).
- Leitura: (b-) responde à frase, sem pista nova; sem dado — a conversa silenciosa funcionou como aquecimento puro.

### B10 (esperar duas horas)
- Frase: «Sento no banco junto à fonte da praça e espero duas horas, só ouvindo o que a cidade diz.» → proposta «Esperar · 2 h» (o preço, antes do clique); confirmei. Sem linha [pecas] turno (é uma ação do sistema); verdade: antes [Mabel] · depois [] · podadas 1.
- Estado: **08:55→11:00**; PISTAS 1 de 2; **nenhuma cobrança do mundo** (nada pago, nada mudou além do relógio).
- Narrador: «Você deixa 2 h passarem… Você abaixa e recolhe o stiletto — frio, sem bainha. Petra desvia o olhar. Duas horas passam na praça. A sombra gira. Uma carroça entra com sal; outra sai vazia. O portão sul range, e ninguém para de olhar para ele. "Leva isso longe daqui," diz Petra, sem nomear a lâmina. E do outro lado da praça, uma mulher entrega uma medalha de cobre ao guarda e desaparece atrás da muralha.» → o Narrador fez o herói **pegar o stiletto** (o sistema o deixou no chão: o botão «Stiletto · comum» continua) e o texto é o mesmo de uma pista dormente do portão sul.
- Leitura: (b-) cena de espera bonita, sem pista, sem preço.

### B11 (esperar mais seis horas)
- Frase 1: «Fico ali na praça o resto do dia, conversando com quem passar e olhando o portão, até o sol baixar.» → lida como movimento «Ir até a Balança Coxa · 5 min» (3.ª vez que uma frase de conversa/espera vira viagem; «Reescrever» resolve). Frase 2 (reescrita): «Espero mais seis horas sentado no banco, ouvindo.» → «Esperar · 6 h» (o preço antes do clique); confirmei.
- Sem [pecas] turno; verdade: antes [Brannoc Pé-Leve, Bryna] · depois [Brannoc Pé-Leve] · podadas 1 (**sobrou um nome fora da lista depois da poda**).
- Estado: **11:00→17:00** (9 h na praça desde as 08:00); rações 10, água 10 (nenhum custo pelo tempo); PISTAS 1 de 2; **sem cobrança do mundo**.
- Narrador: «Duas horas. O sol desce atrás das colinas… Petra voltou da forja com as mãos cheirando a carvão. E que ontem ninguém acendeu a lamparina do portão." Seis horas. A praça esvaziou. Brannoc Pé-Leve dorme encostado à parede; o pão esfriou. Petra acende a lanterna… "Vão fechar os portões. Onde passas a noite?"» (um fragmento de fala sem abertura, e «duas horas» e «seis horas» somadas: texto remendado). Nomes: **Brannoc Pé-Leve** (fora de cena, fora da lista).
- Leitura: (b-)/(c) bonita cena de ritmo, mas o relógio gasta sem custo e a pista fica a mesma; o herói pode esperar 9 horas sem que o mundo se mexa.

### B12–B14 (a noite, e o dia seguinte)
- Frase: «Digo à Petra que passamos a noite numa estalagem aqui perto, e que amanhã cedo eu decido o que fazer.» → proposta «Dormir · uma noite» (o preço antes do clique); confirmei. Sem [pecas] turno (é do sistema).
- A cena da noite («A NOITE · NUMA ESTALAGEM EM VELHA DO VIGIA») oferece «Com quem você se senta esta noite?»: Petra · Mabel · Aldric («quer falar com você») · Loras («quer falar com você») · Wystan · «Dormir já». Escolhi **Aldric** — o Narrador respondeu com **Petra a falar de Ulric Punho-de-Pedra, a carpideira** («Dizem que enterrou o marido duas vezes») e nenhuma palavra de Aldric: **ignorou a minha escolha (c)**, e pôs a carpideira (do covil) na praça.
- «Dormir até de manhã»: dia 2 · 07:00, descanso longo (PV/PM cheios), **rações 10→8, água 10→8** (o único custo do tempo em toda a run B), um «fio do mundo à vista», um sonho. O Narrador deu a mim «a medalha de cobre» e «o stiletto» («Nas suas mãos, ela põe duas coisas»): objetos que o sistema não pôs na Bolsa. verdade: antes [Mabel, Ulric Punho-de-Pedra] · depois [Ulric Punho-de-Pedra] (um nome fora de cena sobrou).
- **A run B termina aqui (14 passos, ~11 respostas do Narrador): PISTAS 1 de 2, etapa 1 fechada, etapa 2 aberta; em 23 h de jogo o mundo NÃO cobrou nada (`cobranca` sempre null), a besta não desceu, ninguém foi avisado.**

## RUN C — o jogo de hoje (`?pecas=0`; página recarregada; mesma semente; sem linhas [pecas] — confirmado)
Abertura: «A estrada deixou poeira na sua boca. Velha do Vigia cheira a ferradura nova e pão de manhã. Na porta, o guarda estende a medalha de cobre… Petra paga por vocês dois e ri, seca… Ontem, foi às traseiras do Fole do Sal. Bryna perdeu o rebanho inteiro…»

### C01
- Frase: «Digo ao guarda que vou ao Fole do Sal, e pergunto o que ele sabe sobre o bicho que desce à noite.»
- Sem dado, sem preço, sem [pecas]. 08:00 (o relógio não andou).
- Narrador: «O guarda devolve a medalha de cobre a Petra, mas não desvia o olhar de você. "O Fole do Sal fica a quatro horas a sudeste. Estrada de chão até a ruína." … "Sobre o bicho... não sei de nada. Ninguém sabe. Só que desce quando o sino acaba de tocar, e nunca repete a porta." … "Se você for, leve um ferro. E não conte com ninguém de lá." … Mas Bryna passa correndo, puxando uma carroça vazia, e ele se cala.» Nomes: Bryna (do gancho, **o Narrador a pôs na rua, correndo; o sistema a tem no curral**). **O Narrador decidiu a distância («a quatro horas a sudeste») — o sistema dá o Fole do Sal a 5 min, dentro dos muros.**
- Leitura: (b) respondeu, sem pista nova útil.

### C02 (ir ao curral)
- Frase: «Sigo para o Fole do Sal com Petra, de olho nas traseiras e na lama.» → «Ir até o Fole do Sal · 5 min»; confirmei. 08:10.
- Estado: **etapa 1 fechou sem dado** (igual a A); etapa 2, PISTAS 0 de 2. O Mestre abriu o MESMO dado de Percepção 13, com o MESMO texto de preço («Se falhar, você fica sabendo na mesma. Mas pode custar…») — logo esse dado e o preço são do jogo de hoje, não das peças.
- Narrador: «O Fole do Sal tem a porta entreaberta e a bigorna ainda quente. Bryna levanta os olhos quando você entra — ela mede você e Petra como quem mede ferro. "Você veio ver o que eu não quis vender." O aprendiz, Loras, segura um martelo perto do peito… Nas traseiras, a lama está remexida; sulcos largos, como se algo tivesse se arrastado.» Nomes: Bryna, Loras (em cena). Pista: sulcos largos na lama.
- Leitura: (a) avançou (etapa 1) com pista visível.

### C03 (dado de Percepção, sem as peças)
- Dado: Percepção **d20 = 9 (sem bônus) vs 13 → falhou**; preço pago: **08:10 → 09:05 (55 min)**, «o lugar fica remexido». Mesmo assim: **PISTAS 1 de 2, +60 XP «um segredo arrancado ao lugar»** — o sistema creditou a descoberta, enquanto a prosa diz «Nada».
- Narrador: «Você revira o chão das traseiras… Nada. A lama fica revirada, marcada por passos seus e de Petra. Loras te observa da porta… estende um papel dobrado, sujo de fuligem. "Leve esta carta à Casa de Ferros de Prata Velha, em Baixo Profundo. Eu não posso entrar lá." A pergunta vem seca… — Você vai?» → **inventou um item (a carta), um lugar («Casa de Ferros de Prata Velha») e uma missão nova**, e contradiz a descoberta que o sistema deu.
- Leitura: (a)/(e): avançou (pista 1/2), mas a prosa ignora o que o sistema decidiu e empurra para outra missão.

### C04 (a pergunta à pastora, a mesma de A04)
- Frase: «Pergunto a Bryna se ela viu a besta com os próprios olhos e para onde acha que ela volta de dia.»
- **Sem dado.** 09:10 (+5 min). PISTAS **2 de 2**.
- Narrador: «Bryna encara você, o rosto fechado. "Eu vi. Três noites atrás, pelos fundos do Fole. Não era bicho. Grande sim, mas de pé. Voltou para o monte." Ela olha para a bigorna, depois para as mãos. "O Fole está de portas abertas para quem quiser ver."» Nomes: nenhum novo. **Inconsistência com o gancho** («ontem» vs «três noites atrás»). Pista: grande, de pé, volta para o monte.
- Leitura: (a) respondeu e avançou, de graça e sem parede (na run A a mesma pergunta virou um teste de 15 que falhou e me mandou pagar).

### C05 (a armadilha, a mesma de A06)
- Frase: «Peço ao Loras um laço de ferro e uns dentes de arame, para armar uma armadilha na trilha que o rasto mostra.» Sem dado, sem [pecas]. 09:15.
- Narrador: «Loras hesita, mas assente. Some no depósito e volta com um laço de ferro forjado e meia dúzia de dentes de arame. Entrega sem pestanejar. "Faça boa conta disso. O ferro aqui é de qualidade."» → igual a A: o Narrador deu o item; **a Bolsa não ganhou nada**. 
- Leitura: (b-) igual à A06.

### C06 (ir ao Ossário do Corvo)
- Frase: «Sigo para o Ossário do Corvo com Petra, devagar, o laço de ferro na mão.» → proposta «5 min»; confirmei. 09:25. Etapa 2 fechou sem dado (igual a A). Etapa 3, PISTAS 2 de 3.
- **O mesmo FRENTE A FRENTE** (Espreitar 50% · Falar 40% · Capturar 35% · Lutar · Recuar + «ou escreva») — é o confronto de antes das peças, por isso igual em A e C.
- Narrador: «O Ossário do Corvo fica colado à muralha norte… Petra para no portão e não entra. Aldric, o coveiro, apoia uma pá no ombro… "Se for caçar rastro, foi por ali que passou." … sulcos largos, fundos, e… cravada no chão fofo, uma lâmina fina… "Essa aí é de alguém que já não precisa. Vai levar?"» Nomes: Aldric (em cena), Ulric, Sethr… (da lista), o Stiletto (item do chão, do sistema). Pista: a lâmina.

### C07 (intimidar a fera — o jogo de hoje, a mesma frase de A08)
- Frase: «Tento intimidar a fera: bato o laço de ferro no chão, grito e ergo a tocha na cara dela.» → o MESMO dado de A: «intimidar — dificuldade 14 (um favor que lhe custa pouco). Seu bônus: +3 · sem treino.» + Rolar d20+3. **Sem preço de falhar dito.**
- Rolei: **3 + 3 = 6 vs 14 → falhou por 8** (A tinha dado 11+3=14, passou).
- Narrador: «Assim faz barulho. O laço de ferro bate no chão e o som morre entre as pedras. Ninguém acode. Ninguém pergunta… Aldric se apoia na pá. "Não adianta gritar com o monte. Ele já escolheu o que desce e por onde." Ele aponta a lâmina fina cravada no barro. "Aquilo ficou de uma visita. Quem quiser, que apanhe."»
- **A falha NÃO levou a lugar nenhum**: 5 min, a besta nem reagiu, a modal «FRENTE A FRENTE» continua igual. A intimidação também foi resolvida contra o coveiro/o vento, não contra a fera. **A e C são iguais aqui: as peças não existem no covil** (nenhuma linha [pecas] em A08–A10).

### C08 (o FRENTE A FRENTE: Espreitar · 50% · 1 h)
- Escolhi «Espreitar» (radio + botão). **Furtividade d20 = 15 + 2 = 17 vs 13 → passou** (09:30 → 10:30). Sem linhas [pecas].
- Narrador: «Aldric se apoia na pá e encara você. "Você fala de bicho, mas anda armado como quem caça outra coisa." … "O forasteiro chegou cedo demais para ser só curioso." O coveiro inclina a cabeça para o canto fundo… "E então? O que você veio buscar aqui?"» → **a prosa não conta que espreitei nem o que vi da fera**: segue com o coveiro. O cartão da quest passa a dizer «Encarar Dragão Jovem o Lobo do Vau na toca» (o nome só aparece aqui).
- Leitura: o dado passou e o resultado não aparece na história (mesmo defeito de A, onde o dado ficou invisível).

### C09–C10 (a luta, depois do Espreitar passado)
- Frase: «Ataco o dragão pelas costas, aproveitando que ele ainda não me viu.» → proposta «Atacar Dragão Jovem o Lobo do Vau · abre a luta» (o preço, antes do clique); confirmei. 
- **A luta começou em vantagem: iniciativa 20 e o dragão com 12/12 PV** (em A, depois de um Espreitar falhado, tinha 18/18 e iniciativa 10 contra 8). O Espreitar passado teve efeito real. Narrador (frase da grade): «O dragão mede vocês dois, a cauda varrendo o cascalho. A bigorna ao fundo, calada. Ninguém na rua. A lâmina captura o que resta da manhã.» (a «bigorna» e «a rua» num cemitério; a grade é a mesma de taverna).
- C10: o primeiro golpe foi crítico (14) e o dragão (12 PV) caiu; apareceu **«O último golpe é seu. — Poupar (cai desacordado, vivo) / Matar (não se levanta mais)»**: o jogo de hoje já pergunta o destino da fera no golpe final (em A a fera morreu sem pergunta, com o herói a 0 PV). Escolhi **Poupar**. Herói a 13/13 PV (sem risco real em C).

### C11–C13 (poupar, a luta, a escolha)
- «Poupar» → «Vitória +8 +17 XP»; Narrador da luta: «A lâmina corta o ar e o Lobo do Vau tomba… Petra baixa a espada… "Não vai acordar cedo." No cinto da fera, o couro rasgado deixa ver um brilho seco — alguma essência presa entre as tiras.» A etapa 3 fechou («✓ Encarar Dragão Jovem o Lobo do Vau na toca»), no chão: Ataduras de Linho, Essência Residual (do sistema).
- Escolha final (as mesmas 3 cartas + «Há outras maneiras»): **Entregar à aldeia**. Quest **cumprida** às 10:35 (+100 XP, +37 moedas; a história passou para «O Pão que Sai de Noite»). Narrador: «Você puxa o corpo do Lobo do Vau pela coleira de couro até o portão do cemitério… A vila vê o bicho tombado na lama… Petra… "Bom. Que a aldeia decida rápido, porque o cheiro não vai esperar."» (a fera foi poupada e é «corpo»: o mesmo conflito da carta que fala de «viva».)
- Totais C: 12 respostas do Narrador na quest; 09:00→10:35 (com 1 h de espreitar); 4 dados (Percepção falhou −55 min, Intimidação falhou, Furtividade passou, ataque crítico); herói 13/13 PV até ao fim (sem risco real); 0 cobranças do mundo; 0 linhas [pecas]; 0 erros de console.

---
# MEDIDAS (A = peças + jogador de mesa, B = peças + conversador, C = jogo de hoje + jogador de mesa; mesma semente)

| | A | B | C |
|---|---|---|---|
| respostas do Narrador na quest | 13 | 11 (14 passos, não chegou ao fim) | 12 |
| chegou à encruzilhada final | sim (cumprida às 09:20) | não (etapa 1 de 4; 1 de 2 pistas) | sim (10:35) |
| linhas [pecas] | 7 turno · 2 dado · 8 verdade, **nenhuma** da intimidação nem da luta | 14 turno · 4 dado · 11 verdade | 0 |
| dados rolados (sem a luta) | 4 (Percepção, Persuasão, Intimidação, Furtividade) | 4 (todos Persuasão) | 3 (Percepção, Intimidação, Furtividade) |
| preço de falhar dito antes | 3 de 4 (Intimidação sem preço) | 3 de 4 | 2 de 3 (Intimidação sem preço) |
| preços pagos de verdade | 25 min, 5 moedas, 1 h; **herói a 0 PV (morrendo)** | 10 min ×4, rações −2 água −2 (dormir) | 55 min, 1 h; nenhum risco |
| etapas fechadas sem dado | 2 de 4 (as de chegar) | 0 (a 1 fechou com dado, por conversa) | 2 de 4 |
| mundo cobrou | 0 | 0 em 23 h de jogo e uma noite | 0 |
| nomes/itens fora da lista (distintos) | 5: coveiro, gancho, laço+arame, «urso» (×4), frasco | 10: cão da forja, chave 39, fechadura, O Cálice Velho, guarita, cobrador, azeitona, Brannoc, Ulric, medalha/stiletto «dados» | 5: carta, Casa de Ferros de Prata Velha, laço+arame, «a quatro horas» (distância), Bryna na rua |
| por 20 respostas | ~8 | ~18 | ~8 |
| o Narrador decidiu o que era do sistema | devolveu as moedas pagas; deu o laço; chamou de «urso» o dragão; decidiu «o urso não recua» sem dado; fez o herói arremessar o laço na luta | fez o herói comprar pão (0 moedas), recolher o stiletto, falou por mim | deu o laço e uma carta/missão; contradisse o «Nada» com +60 XP; pôs a distância |
| mesa/trilho dos turnos escritos (a/b/c/d/e) | 9 turnos: a4 b2 c1 d2 e0 | 12 intenções: a1 b7 c2 d7 e1 (d = 7 encaixes errados, 4 deles viraram viagem) | — |
