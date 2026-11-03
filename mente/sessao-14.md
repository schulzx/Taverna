# A décima quarta sessão de prova — o Narrador ator contra a IA real (03/11/2026)

Jogada no dev-server `taverna-ator` (5188, `VITE_MODO_DO_NARRADOR=ator`), com o `/api` no Vercel de produção (v9.587, `bf3a1b0`). Origem limpa: o localStorage estava vazio no início (nada a restaurar) e foi limpo no fim, com o jogo desmontado. Herói novo de Uma Vida, mundo padrão: **«As Minas de Vel Dorran»**, Fantasia medieval, Terras abertas, Jornada do Herói, voz padrão (o save diz `taverneiro`). **Bram Pedra-Alta**, homem, **Goliath, Clérigo (Sacerdote)**, Herborista, Acólito Fugitivo; companheira Leonor (mestra de ofício, Engenheiro). Monte da Forca → Serra dos Frades → Forte Abandonado de Raízes.

**29 turnos com o Narrador (mais a abertura), 3 ações sem IA (uma compra, o aceite de um contrato do mural, armar uma magia). 31 chamadas pagas, US$ 0,0802.** Parei aos 29, abaixo do teto de 30. Houve duas lutas (um desertor, 1 rodada; um grifo, 2 rodadas, com a companheira a 2 PV), um descanso longo na estalagem, um descanso curto no forte, três viagens, uma masmorra até à quarta sala, uma compra, dois pedidos aceites e um contrato.

Para cada turno li **a ficha que o ator recebeu** (gravei os pedidos ao `/api` com um invólucro no `fetch`, só para ler) e confrontei-a com a prosa, a tela e o save. É isso que este relato tem e o da 13.ª não tinha: dá para dizer, defeito a defeito, se a culpa é do ator ou da ficha. **Quase sempre é da ficha.**

---

## 1. Os defeitos, por prioridade

| # | prio | turno | o defeito | a prova |
|---|---|---|---|---|
| 1 | **alta** | T5, T9, T25 | **A frase do herói vira fato na prosa sem o sistema a ter resolvido.** «Pago a sopa» → Leonor: «Três estalos ficaram na tábua» (bolsa 15→15). «Pago um quarto comum… durmo» → dormiu de graça (8→8). «Rezo a Cura Leve» em texto livre → «O calor da prece fecha a dor… Ela firma as duas botas na água rasa, sem cambalear», e a faixa continua a dizer **Leonor 2/12** (PM 8→8). **Nada entrou pelo Narrador, como manda o plano, mas a prosa contradiz a tela.** A causa está escrita: a ficha põe a frase crua em ACONTECEU, e o pedido do ator diz «ACONTECEU: a frase do herói e o que dela resultou. É coisa feita: conte a consequência, nunca a desdiga». Quando o sistema não resolveu nada, o ator inventa o resultado. | save: `moedas` 15 → 15 depois do T5, 8 → 8 depois do T9; `grupo` Leonor 2 e `mana` 8 depois do T25; a cura só aconteceu no T26, pelo botão Habilidades (+7 PV, PM 8→5). |
| 2 | **alta** | T0–T29 | **A voz da Leonor é uma máquina de inventar números.** A ficha dá-lhe «diz os números exatos ("Trinta e sete passos até à porta.")» e «frase de negociante… sempre com um preço por trás ("De graça, só o conselho.")»; o ator está proibido de inventar número. Resultado: ela diz um número em **todas** as falas, e quando a ficha não traz nenhum, inventa-o. **6 cópias literais do exemplo** «De graça, só o conselho»; **8 moedas que não existem** neste mundo (cobres, soldos, tostão, pratas: a moeda é o estalo de prata); a mesma costela custa «oitenta cobres» (T23), «quarenta cobres» (T25) e «doze moedas» (T26). Duas vezes o número vira fato que se pode seguir: **«A Inez prometeu quarenta moedas certas na Poça da Foz»** (T17: não há recompensa nenhuma) e «O homem de hábito não bota a cara aqui antes do meio-dia» (T6: horário do sacerdote que o sistema não tem). | 14 dos 24 achados do Juiz são falas dela (`fidelidade.ultimos`). Ficha de todos os turnos: a mesma linha `Fala:`. |
| 3 | **alta** | T1→T13 | **A Inez desdiz o próprio pedido.** T1: «Prometi rezar onde ele caiu. É no caminho.» T4: Bram aceita. T13: **«— A Inez não pediu que rezassem por ninguém, e menos ainda que gastem sola na lama da serra por alma alheia.»** O ator tem um turno de memória (o HÁ POUCO), e o pedido aceite não volta à ficha. O pedido também é **oco**: «ele» não tem nome, «onde caiu» não tem lugar; perguntei duas vezes (T2, T12) e ninguém pôde responder, porque o sistema não sabe. | `coracao.arcos["Inez do Prado Baixo"]` = `{pedido:1, resposta:"aceitou"}`; a ficha do T13 não tem linha nenhuma do pedido. |
| 4 | **alta** | T0–T13 | **Onde está a Inez: o sistema dá quatro respostas.** Abertura e T1: atrás do balcão às 8 h. T2: «de folga hoje, no templo» (e a prosa: «A mulher já não está ali»), com a faixa a dizer «Inez do Prado Baixo está aqui». T5–T6, no templo: não está. A CENA de T4 a T29: «Inez… está na Poça da Foz». Aparece à noite, à fogueira, e às 7 h do dia 2 ao balcão (o horário dela é 11 h–02 h). A personagem que é o alvo da missão principal fica inalcançável um dia inteiro, e o herói fica a andar entre dois sítios. | fichas T1, T2, T5, T8, T11; o «Sabe» da Leonor no T2 e no T8. |
| 5 | **alta** | T1–T29 | **O que se perdeu ao sair o Cronista.** (a) **Pessoas: só a Leonor.** A Inez (três conversas e um pedido aceite) e a Beatriz Sem-Pão (irmã de votos do passado do herói, pedido aceite) não entraram em `npcs`. (b) **A missão principal «Encontrar Inez do Prado Baixo» (`falar_com`) continua `feito:false`** depois de Bram falar com ela no T1, no T10 e no T12. (c) **O cordão da Beatriz não entrou no inventário**, e a prosa pô-lo na mesa (T11) e na mão do herói (T14). (d) O aceite de um pedido não deixa linha no registo da cena. | `Object.keys(npcs)` = `["Leonor"]`; `missoes[0].etapas[0].feito` = false; `inventario` sem cordão. |
| 6 | **alta** | T21 | **A sessão gravada virou a página outra vez e deitou fora 21 turnos** (o defeito 1 da 13.ª continua). A página que sobrou tem 8 turnos (n 1–8) e 620 mil caracteres; o `inicio` é o estado de quando o registo ia no t18. | `taverna_save_v1_sessao` exportado. |
| 7 | média | T3, T4, T13 | **Os botões não chegam ao ACONTECEU.** «Perguntar a Inez porquê» → ACONTECEU é uma memória truncada do T1. «Aceitar» (duas vezes) → ACONTECEU é um evento de mundo sem relação («em Serra dos Frades um carroceiro sem rosto recruta os sem-casa…»). **O sim do herói nunca chega à cena**: ninguém reage a ser ajudado. | fichas T3, T4, T13. |
| 8 | média | T20 | **O tesouro épico passa calado.** Sala do tesouro: +19 moedas e «✦ Consagrado Borzeguins amarrados do Cardo Bravo (Épico)». A ficha tem ACONTECEU vazio; a prosa fala de ossos e de «algo raspa na laje». O melhor achado da sessão não teve uma frase. | ficha T20; `equipamento` com os Borzeguins. |
| 9 | média | T6, T7, T12, T16 | **O mundo sem nome é mudo, e o ator enche o silêncio com ausências inventadas.** As FRONTEIRAS dizem «Falam só: Leonor»: os devotos não respondem («Ninguém ali responde»), os mascates não erguem os olhos, a rua de Serra dos Frades está trancada. Uma capital de 35 800 almas sem uma voz. No mercado, o ator inventa o vazio: «ninguém expõe cabo pesado nem folha verde para mezinha… só prego torto com peixe seco». **O painel Mercado desmente**: o Mercado da Corda Podre é uma casa de relíquias (anéis e amuletos de 81 a 298) e a botica da Praça das Sementes vende Poção de Cura Pequena a ◉ 33. | Gestão ▸ Mercado; ficha T7 («Não sabe responder a: quanto custa cada coisa»). |
| 10 | média | T16, T15 | **O dador do contrato está noutra cidade, e ninguém o diz.** O mural de Serra dos Frades traz a caçada de Estêvão da Cruz Quebrada, que mora no Claustro do Primeiro Prego, em Monte da Forca, a 20 km. A ficha **sabe** (CENA: «No mural: Estêvão… em Claustro do Primeiro Prego», e a linha vem cortada a meio: «Estêvão da Cr»); a Leonor «não sabe a resposta». O cartão «Aceitar: A caçada de Estêvão da Cruz Quebrada · ◉ 50» não diz o que se caça, onde, nem o perigo (a missão diz «Vagabundo de facão… Forte Abandonado de Raízes», nível 2). | ficha T16; `mural[2]`. |
| 11 | média | T17, T26 | **Uma instrução sem conteúdo obriga o ator a inventar.** «Agora: chama a conversa de volta para o que ficou combinado» sem dizer o que ficou combinado → «A Inez prometeu quarenta moedas». E a **afordância falsa**: «Arrombar isso a frio leva quarenta minutos de alavanca», quando a masmorra diz «portão lacrado — falta a chave». | fichas T17 e T26. |
| 12 | média | vários | **A ficha ainda dá ordens de Mestre e etiquetas de bastidor**, contra a etapa 1 do plano («nunca uma ordem, uma razão ou um rótulo de sistema»): o boato com «**decida** se ele é só fumaça ou o rastro de algo real» (T11; manda o ator decidir); «Dê a UM detalhe concreto mais atenção do que ele merece» (T5); «Beatriz Sem-Pão — **elo**.»; «sacerdote(isa)»; «Leonor fica protegid**o**»; «Em jogo, numa tentativa: se passa, aguentar a marcha forçada»; e uma linha em 1.ª pessoa sem dono, «Alguém me trata como pessoa e não como solução…» (T25). **O ator não vazou nenhuma delas para a prosa**, mas todas lhe pedem que decida ou adivinhe. | fichas citadas. |
| 13 | média | T29 | **A companheira não sabe a própria vida.** «Quem foi que te negou o título?» → «Não sabe responder a» na ficha da própria Leonor. O ator inventou (e bem): «Três homens na mesa da guilda… papel selado que eu mesma paguei quatro pratas para carimbar». Fica bonito e é falso, e como nada entra, o turno seguinte pode dizer outra coisa. | ficha T29. |
| 14 | baixa | T21–T24 | **Atrito na grade.** Com a Luz Sagrada armada (alcance 18 m) e o alvo a 12 m, «Agir →» fica desligado **sem dizer porquê** (o defeito 14 da 13.ª continua); só liga quando se escreve no «como? **(opcional)**». Um clique numa casa moveu o herói 4,5 m para longe do alvo. Tocar na grade desenha um disco branco e âmbar enorme por cima das peças. A abertura da luta diz «O vulto se joga com o peso todo contra o seu peito» com o desertor a 7,5 m. | capturas da grade; texto «Desertor faminto a 12 m — faltam 9 m». |
| 15 | baixa | T8–T11 | **Relógio e calendário.** «A NOITE · DENTRO DA POÇA DA FOZ» com o relógio nas 8 h (o defeito 12 da 13.ª continua); a ficha diz «De manhã» à fogueira; o mapa diz «amanhecer de **primavera**» em Brumal, com toda a gente a falar do inverno que vem. «Espero pela Inez até ela chegar» não passa o tempo (8 h → 8 h). | barra do topo; ficha T10; mapa. |
| 16 | baixa | vários | Texto de tela: «faltam 1 avan**c**o»; o botão «sair» da masmorra escreve «**Fujo** de Forte Abandonado de Raízes, deixando o resto para trás»; «procuro no mercado quem venda…» pediu um teste de Percepção (vasculhar), e o «Não era isso» resolveu; o traço da Leonor sai «teimos**o**». | tela. |

### O que a 13.ª deixou e hoje está curado

- **O boato chega na chegada** (o defeito 3 da 13.ª). No Forte, a ficha disse «a guarda proibiu a estrada… VERDADE… Mostre-o no que vê e acha: ninguém o anuncia», e a prosa mostrou: «toros aguçados barram o caminho sob correntes grossas, cravados com o sinete oficial da guarda entre pregos retorcidos e trapos vermelhos de aviso». Ninguém o anunciou.
- **O descanso longo cobra os mantimentos** (o 9 da 13.ª): rações 11→9, água 10→8, para duas bocas.
- **O cartão do pedido diz o objeto** (parte do 5 da 13.ª): «Aceitar: parar para rezar no caminho», «Aceitar: levar um cordão a um templo».
- **A luta é narrada como a grade a mostra** (o conserto da v9.587). Três rodadas narradas, três certas golpe a golpe (secção 3).

---

## 2. O ator: passa a padrão?

**Sim. Passa a padrão já, e com três consertos de ficha na mesma semana, antes de se chamar beta a isto.**

**As razões a favor, medidas nesta sessão:**

1. **Os tiques que a pessoa sentiu como «robotizado» sumiram.** Em 30 respostas: **0** perguntas finais («Vai X ou Y?»), **0** falas cortadas a meio, **0** «não sei» de fórmula, **0** dilemas enlatados, **0** caminhos oferecidos em prosa. Ninguém fala por quem não está em cena: a Beatriz caminhou muda dois turnos porque a ficha não a deixava falar.
2. **Cada pessoa tem a sua voz, e as vozes diferem.** A Inez fala de si na terceira pessoa e é seca. A Beatriz corrige a gramática dos outros, e o ator fez disso um modo de discordar («Partiram cedo, não antes do tempo»; «Caiu, não; tombaram-no»). A Leonor mede tudo. O medo e a vontade da ficha aparecem no gesto e não na boca: a Leonor nunca diz que quer ser chamada mestra, e acaba a dizê-lo ao herói no forte, porque a cena lho tirou.
3. **A luta ficou verdadeira e bonita** (secção 3).
4. **Nada entrou pelo Narrador.** Conferi no save: nenhuma moeda, item, pessoa, lugar ou cânone saiu da prosa. O único cânone novo é o boato, e veio do sistema. A 13.ª tinha canonizado «Tobias» como devedor por conta da prosa; isto acabou.
5. **Custa −82% por turno** (secção 4), e o pedido tem 5,5 mil caracteres em vez de 56 mil. O teto de prompt fica com folga de sobra.
6. **Voltar é uma palavra** (`MODO_DO_NARRADOR`). E o caminho antigo erra mais caro: quando o Mestre inventa, o Cronista grava; quando o ator inventa, a invenção morre no turno seguinte.

**As razões contra, e o que é preciso consertar:**

O ator inventa menos gente e lugares, mas **inventa números e consequências**, e quase sempre porque **a ficha lhe pede isso** sem lhe dar o fato. Uma mentira que não entra no estado continua a ser mentira para quem joga: o jogador que ouviu «a Inez prometeu quarenta moedas» volta a Monte da Forca para as cobrar. Contei **9 invenções com consequência em 29 turnos** (os defeitos 1, 2, 3, 9, 11 e 13). Pela régua da pessoa, «um jogador pergunta ao Mestre o que perguntaria ao Matt, e a resposta é verdade?»:

- **«Quanto custa? Quem é? Onde fica?»** Quando a ficha sabe, é **verdade** (pouso 6/36/15, sopa 3, o arco 22, as tochas, as quatro horas de estrada). Quando a ficha não sabe, **a Leonor responde na mesma**, de imaginação.
- **«O que aconteceu na luta?»** **Verdade**, golpe a golpe.
- **«Ela não me pediu isto?»** **Falso**: a memória é de um turno, e o pedido aceite não volta à ficha.
- **«Consegui?»** **Falso** sempre que o sistema não leu a frase (defeito 1).

**Os três consertos que pagam a passagem, todos no motor, todos de tabela:**

1. **ACONTECEU separa o que o herói quis do que resultou** (defeito 1). Quando o sistema não resolveu a frase, ela entra como «Bram quer / tenta», e o pedido do ator ganha uma linha: o que não está em «resultou» não aconteceu, e mostra-se só a intenção. Melhor ainda: o sistema passa a ler «pago a sopa / pago um quarto / rezo a Cura» e resolve-os.
2. **O traço de voz que exige um número só fala os números da ficha** (defeito 2). Na tabela de vozes, «diz os números exatos» passa a valer só para os números do «Sabe»; sem eles, a voz cai para outra marca. E os exemplos de fala deixam de ser frases prontas que se podem copiar, ou trocam a cada turno.
3. **Os compromissos vivos voltam à ficha de quem os tem** (defeitos 3, 5, 7 e 11): «Pediu a Bram: …, e ele aceitou». O aceite entra no ACONTECEU do turno em que acontece. «O que ficou combinado» só se escreve com o conteúdo. E falar com quem está em QUEM ESTÁ regista a pessoa em `npcs` e cumpre o `falar_com`, por porta do sistema e não pela prosa.

---

## 3. A luta, com olho de mesa

**Luta 1, o desertor faminto (8 PV, 1 rodada).** Luz Sagrada, d20 15+5 = 20 contra 11, 17 de dano sagrado: cai. A ficha disse «Bram acerta Desertor faminto com Luz Sagrada: Desertor faminto cai… A luta aqui já acabou», e a prosa: «O clarão estala contra a pedra e se apaga. O desertor faminto tomba na água rasa, soltando um último gorgolejo antes de aquietar de vez.» **Certo.** Só a abertura mentiu sobre a distância (defeito 14).

**Luta 2, o grifo do despenhadeiro (18 PV, 2 rodadas).** R1: Luz Sagrada 17 contra 12, 11 de dano (18→7). O grifo: talho em Leonor **falha**; cabeçada **acerta**, devastadora, Leonor 12→2; Leonor usa o Escudo Dobrável. A prosa:

> O clarão do seu símbolo queima as penas do grifo, que sibila com o estalo do ar. O monstro gira no mesmo palmo de chão: as garras varrem o vazio, mas o crânio pesado atinge Leonor em cheio no peito. O baque surdo de osso contra carne ecoa na pedra úmida, e ela cambaleia de joelhos na poça, quase entregue. Num estalo metálico, as placas do seu escudo desdobrável se armam entre ela e o bico recurvado da fera.

**Cinco fatos da grade, cinco na prosa, na ordem certa**, e o que falhou foi narrado a falhar. R2: crítico, 20+5 = 25, 24 de dano. A prosa disse «estoura contra o bico da besta com o estrondo de pedra rachando», à altura de um crítico. **É a melhor narração de luta que o Taverna já fez numa sessão de prova.** Os únicos defeitos foram as falas da Leonor depois do golpe («oitenta cobres com o cirurgião»: defeito 2).

**Como jogo:** a primeira luta de 1 golpe não é luta; a segunda foi tensa, com a companheira por um fio e o crítico a salvar. O que custou foi a grade (defeito 14): uma magia armada que não deixa agir sem se escrever qualquer coisa na caixa «opcional».

---

## 4. O custo

Do `custo` do save:

| tarefa | modelo | chamadas | US$ |
|---|---|---:|---:|
| Narrador (ator) | gemini-3.8-flash | 30 | 0,0577 |
| Léxico (uma vez, na criação) | gemini-3.8-flash | 1 | 0,0226 |
| Cronista | **não houve: saiu do turno** | 0 | 0 |
| **total** | | **31** | **0,0802** |

- **Por turno, sem o Léxico: US$ 0,0019.** A 13.ª custou US$ 0,0106: **−82%**, o número do teste às cegas (0,00204), confirmado em jogo.
- **Tokens:** entrada 52.335 (~1,7 mil por chamada; na 13.ª eram ~24,8 mil), saída 10.933, **cache 0**. O pedido do ator é pequeno e muda todo de turno para turno, por isso não há cache, e não faz falta.
- **O pedido do ator:** 4,3 a 6,3 mil caracteres (mediana 5,5 mil), com sistema de 2,7 mil. **Uma ordem de grandeza abaixo do teto** de ~82 mil.
- **Em reais** (a régua da 12.ª, 6,16): **sessão R$ 0,49**, **R$ 0,012 por turno**. Uma sessão de 63 turnos sai a ~US$ 0,14 com o Léxico, **~R$ 0,85** (a 13.ª dava R$ 4,1). Em 01/01/2027, quando o 3.8 Flash dobrar, ~R$ 1,7.
- **Latência:** não a medi com rigor (o meu relógio mediu o meu jogo, não a resposta). A olho, 8 a 15 s por turno, como na 13.ª.

---

## 5. As falas

**O melhor:**

> A porta da rua range e bate contra o batente. Beatriz Sem-Pão para sob a verga, a capa empapada de orvalho frio, os olhos fixos em você.
> — Partiram cedo, não antes do tempo — diz Beatriz. Ela caminha até a mesa, estende a mão fechada e solta um fio de cânhamo com nós sobre a tábua. — Leve este cordão a um templo longe daqui. Eu não posso.

(T11. A Inez acabara de dizer o boato, «os pássaros já partiram da várzea antes do tempo». A irmã de votos entra a corrigi-la, e é por aí que a conhecemos antes de saber quem é. O pedido do sistema chega inteiro, com as palavras dela.)

> — Trata-se de "caçar o vagabundo", não de "ir à caça". Mas quem foge da igreja perde a língua.

(T17. A semente da ficha, «reza a hora da ordem», virou uma oração murmurada à chuva, e a farpa vai direita ao acólito fugido.)

**O pior:**

> — A Inez não pediu que rezassem por ninguém, e menos ainda que gastem sola na lama da serra por alma alheia.

(T13. Doze turnos antes ela pedira exatamente isso, e o herói aceitara. É o defeito 3, e é da ficha.)

> — Seis léguas de brejo por um homem sem eira nem beira — diz Leonor. — A Inez prometeu quarenta moedas certas na Poça da Foz. Largamos o serviço inteiro por mato e goteira.

(T17. A estrada era de 16 km e não havia recompensa nenhuma. Foi a ficha que mandou «chamar a conversa de volta para o que ficou combinado» sem dizer o que fora combinado.)

---

## 6. O Juiz

Com o ator, **30 turnos julgados: 11 limpos, 24 achados** (preço 7, distância 14, pauta 3; pauta cumprida 7 de 10). Desta vez quase todos os achados são **verdadeiros como invenção**: são os números da Leonor (defeito 2). Falsos: «como um marco de pedra na estrada» lido como preço (T12), e dois «a pauta mandou e a prosa não disse» do pouso (T1) e do horário da Inez (T2), que a prosa disse. O Juiz não apanhou as invenções que pesam (defeitos 1, 3 e 9), porque nenhuma é número: são consequências.

---

## 7. Para a pessoa decidir (a proposta ambiciosa da mesa)

**«A gente sem nome fala.»** Hoje a cidade é muda: só fala quem tem ficha, e numa capital isso é a companheira e uma estalagem. O Matt Mercer dá voz ao devoto, ao mascate e ao guarda num instante, e é aí que o mundo parece cheio. A proposta: o sistema elege, por cena e por tabela, **um figurante** (do «À mão» que já existe, que hoje só serve de nome), com uma voz sorteada da tabela de vozes, **sem Sabe, sem Quer, proibido de prometer, cobrar ou revelar**, mas que responde ao herói, nem que seja para dizer que não sabe, à sua maneira. O ator ganha alguém com quem contracenar; o jogador deixa de ouvir «ninguém ali responde»; e como nada entra pelo Narrador, o figurante não deixa rasto no estado. É mecânica nova (quem fala é decisão do sistema), logo **pesado, e da pessoa**. A prova seria uma 15.ª sessão com o figurante ligado, a contar quantas perguntas ao mundo ficam sem resposta (hoje: 5 em 29 turnos, T2, T6, T7, T12 e T16; no T29 a resposta veio, mas inventada).

---

## 8. Onde olhar

Na pasta `sessao-14` do scratchpad desta sessão (fora do repositório, porque o save tem a campanha inteira):

- `save-s14.json`: o save completo no fim (135 mensagens, o `fidelidade`, o `custo`, o `coracao` com os dois aceites).
- `sessao-gravada-s14.json`: a página da sessão gravada que sobrou (8 turnos, defeito 6).
- `pedidos-ator-s14.json`: **os 29 pedidos ao `/api` com a ficha de ator e a resposta de cada turno**. É o banco certo para o próximo teste às cegas: é o jogo de hoje, com a cidade no estado.
- `notas.md`: as notas turno a turno.

Para correr em Node, grátis: a ficha do T13 contra `coracao.arcos` (defeito 3); a ficha do T2 contra o horário da Inez (defeito 4); e a ficha do T4 (o «Aceitar» que leva o carroceiro em vez do aceite, defeito 7).
