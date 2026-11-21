# O Mestre vivo — sexta sessão jogada (21/11/2026)

Commit `23aa2b6` (v9.664), cópia limpa fora do repositório, `?mestre=1`, IA real. **Vionna** (meio-elfa, guerreira,
Cavaleiro, Órfã da Estrada; **Espada Longa equipada**, mochila com uma Faca herdada; 15 moedas) com **Dagny**
(ladino), num mundo de **Fantasia medieval · O Arquipélago · Mistério em Camadas**, começando em Ponta do Sal
(cais, depois a Feira do Saque e, no fim, a Casa do Vento Sul). 57 frases fora da luta (2 a 58 na tabela; a
abertura não conta); nenhuma luta começou. O roteiro pedia ~40: foram 57 porque os pontos de A (a prosa presa à
ficha) pediram repetição. Jogada por um testador em Sonnet, com a régua de 19/11: **não há cota de dado**; só contam a
ação arriscada sem dado e o dado onde um mestre real não pediria. Moedas e mochila foram lidas do save
(`localStorage`) antes e depois de todo turno. Ouvinte de console desde o primeiro carregamento (erros e avisos), mais um
ouvinte de `console.info` ligado no turno 43 (o Runtime repete as mensagens que o navegador guardou, então o log do
conferente cobre a sessão inteira, só sem a ordem por turno).

## Os totais

| | sessão 4 | sessão 5 | sessão 6 |
|---|---|---|---|
| frases | 31 | 45 | **57** |
| certos | 21 de 31 | 36 de 45 | **52 de 57** |
| faltou dado | 7 | 3 | **4** (28, 33*, 35, 36; *discutível) |
| dado indevido | 0 | 1 | **0** |
| leitura errada da frase / sem veredito | 2 + 1 | 5 | **1** (48), mais 1 parcial (27) |
| prosa que contradiz a ficha, o veredito ou o alvo (turnos) | não medido | ~9 (contagem retroativa da tabela: 5, 7, 10, 12, 14, 16, 19, 36, 38) | **19** (6, 7, 8, 9, 10, 14, 18, 22, 26, 28, 30, 31, 34, 36, 39, 44, 45, 51, 56) |
| turnos em que a pessoa errada respondeu | não medido | 4 (15, 19, 34, 37) | **2** (34, 37), mais 3 em que o ausente chamado aparece e fala apesar da linha «não está aqui» (14, 26, 56) |
| corte indevido (prosa truncada ou com «ele/ela» órfão) | — | — | **3 a 4** (16, 54, 55 e, talvez, 22) |
| turnos com português de Portugal | 5 de 31 | ~23 de 41 | **2** (34 «és», 53 «teu») |
| erros de console | não medido | 0 | **0** |

O que melhorou, em número: o PT-PT quase sumiu (23 turnos para 2), a revista da banca com o dono olhando agora rola,
a calha, o muro, a fuga, a mentira a estranho, a ameaça e o arrombamento rolam, o pagamento com quantia dita cobra
exato (1 e 2 moedas, sem a perda de 31 da sessão 5), a legenda do dado velho some, a pergunta de caminho não move o
herói, a dívida «me deve um favor» saiu na direção certa, a venda real passa pelo cartão com o veredito antes do
clique e o regateio baixa o preço que a compra cobra. Uma pessoa fixa (Morgane) já não toma a cena toda: Dagny entra em
~30 dos 57 turnos e Magnus em 12, mas a repetição de fala continua.

**O que não melhorou, e é o centro desta sessão: a prosa ainda vende, entrega, paga e dá o que a ficha não deu.** O
conferente da prosa **disparou 10 vezes** (console: 2 podas de «pagamento», 1 de «meio», 10 de «fala», 1 «frente», **0
trocas**) e **nenhuma linha seca do sistema («Nada passa para a sua mão.», «Nenhuma moeda sai da sua bolsa.») apareceu em
57 turnos**. As podas que se veem são cortes sem reposição, e deixaram prosa órfã («Ela espera a resposta, imóvel.» sem
«ela», «Não tira os olhos de você.» sem sujeito, «Os olhos dele varrem o salão» sem ele). Ao mesmo tempo, passaram
intactos: espada «estendida, cabo primeiro» e 50 moedas «embolsadas sem contar» (7), uma moeda que Dagny «estende» ao
estivador (8), corda posta ao lado e «a corda eu te dou» (9), a adaga de Dagny «entregue» (10), tochas «entregues» (31 e
34), duas moedas que Dagny enfia na mão da heroína (36) e uma bolsa «trocada de dono» no furto (45). Em todos, mochila
e moedas intactas.

## Turno a turno

A numeração é a das frases jogadas, na ordem (1 é a abertura, não conta como frase). Dados: perícia, total contra o
número a bater. «sem dado» = nenhum card de rolagem apareceu. Moedas (◉) e mochila saem do save: **mochila foi
«Faca herdada» a sessão inteira**, e «moedas» só aparecem na coluna quando mudam. Água, rações e tochas só quando mudam.

| # | frase | dado | o que a narração fez | veredito |
|---|---|---|---|---|
| 2 | olho em volta, o cais, as barracas e as pessoas | sem dado | descreve o cais; Dagny fala do «anão de sobretudo azul» | certo |
| 3 | pergunto a Dagny onde fica a taverna mais próxima | sem dado | Dagny responde: Casa do Vento Sul | certo |
| 4 | como chego ao mercado? | sem dado | Dagny explica o caminho; o lugar **não** mudou; «+17 XP · uma conversa que ficou» | certo |
| 5 | vou ao mercado | sem dado | chega à Feira do Saque; uma meio-orc prega preços | certo |
| 6 | compro uma espada curta | sem dado; tela: «espada compra-se nas bancas, com o preço de cada uma.» | a meio-orc da Âncora do Sul oferece uma espada curta **a «cinquenta moedas»** e pergunta «Vai querer?»; ◉ 15 → 15 | certo (o sistema não vendeu); preço inventado, banca sem espada |
| 7 | sim, levo a espada curta e pago | sem dado | «ela a estende, cabo primeiro. — Cinquenta moedas. Ela embolsa sem contar»; ◉ 15 → 15, mochila igual; sem linha seca | certo (dado); **venda fingida** |
| 8 | peço ao estivador do tabuleiro que me dê um peixe seco | sem dado | o estivador responde («dois pro freguês»); depois **Dagny «estende a mão com a moeda… Fica com o troco»**; «+17 XP · um risco enfrentado, e vencido» sem risco; ◉ 15 → 15 | certo (dado); pagamento fingido |
| 9 | peço à meio-orc da banca que me dê um pedaço de corda | sem dado | a meio-orc responde (a pessoa certa), «põe um pedaço de corda ao lado… Leva… a corda eu te dou»; mochila igual | certo (dado); entrega falada |
| 10 | peço a Dagny que me dê a adaga dela | sem dado | «puxa a adaga da bainha e a entrega, cabo primeiro. — Toma.»; mochila igual | certo (dado); **entrega fingida** |
| 11 | dirijo-me ao ceifador: pergunto quanto custa afiar uma lâmina | sem dado | o ceifador responde («Duas moedas») | certo; a pessoa certa |
| 12 | arrombo o cadeado de um caixote com a minha gazua | sem dado; tela: «Você não tem ferramentas de ladrão — talvez à força, no ombro.» | «O ferro range, a ponta escorrega. Não há o que fazer com isso»; entra **Magnus**, um draconato de jaqueta salgada, e fala | certo (o sistema nega); a prosa só meio usa a gazua |
| 13 | saco a minha lâmina de ferreiro e abro o lacre de uma arca | sem dado | «O lacre estala… Dentro, fardos de velas e um maço de cordas novas» (conteúdo inventado, não entra); Magnus repete quase a mesma fala do 12 | certo; fala repetida |
| 14 | pergunto a Magnus: quem é esse outro que anda perguntando da barca? | sem dado; linha **«Magnus não está aqui.»** | **Magnus responde mesmo assim** («Um de sobretudo azul. Anão…») | certo (dado); prosa contradiz a linha do sistema |
| 15 | pergunto à meio-orc da banca se o cutelo dela é de aço de Doca Seca | sem dado | a meio-orc responde (certa) e repete «Tá vendo aquele anão de sobretudo azul?» | certo; fala repetida (3.ª pessoa a dizê-la) |
| 16 | reviro os cestos de peixe seco ao lado das barracas | sem dado | «Nada além do que se vê»; fecha com «**Ela** espera a resposta, imóvel.», sem ela antes | certo; corte indevido |
| 17 | reviro os caixotes empilhados atrás de uma barraca | sem dado | «Nada além do que se vê»; a meio-orc pergunta «Você é um Pé-Leve?» | certo |
| 18 | remexo os sacos amontoados perto de uma tenda | sem dado | farinha, raízes; «e ao lado, a conta de uma espada que você não terminou de pagar» (dívida inventada) | certo (dado); invenção |
| 19 | vasculho a carroça parada no canto da praça | sem dado | «Nada escondido»; Dagny interrompe com a pergunta do anão | certo |
| 20 | reviro os barris encostados num canto do mercado | sem dado | «Só água parada… Nada escondido» | certo |
| 21 | revisto os sacos da vendedora enquanto ela me olha | **Prestidigitação 2+2=4 contra 15, falhou** | a mão é vista; o ceifador diz «Deixa quieto»; a banca a viu | certo (**rolou, o dono olhando**) |
| 22 | reviro os cestos do vendedor de peixe | sem dado | «Só escamas e sal»; Dagny «estende a mão: a adaga que você pediu»; Magnus «observa do outro lado da feira» | certo (dono não dito olhando); entrega repetida |
| 23 | chamo Magnus: Magnus, vem cá, preciso falar com você | sem dado, sem cartão de viagem | Magnus se aproxima e responde; nenhuma linha | certo (a frase foi ao Narrador) |
| 24 | falo com Magnus o Silencioso: Magnus, o que você sabe da barca? | sem dado | Magnus responde | certo |
| 25 | chamo o barqueiro da barca: barqueiro, vem cá! | sem dado | o barqueiro, que está na barca no rio, «sobe a rampa» e fala no mercado | certo (dado); ausente trazido sem linha |
| 26 | Ulric, vem cá! | sem dado; linha **«Ulric da Torre não está aqui.»** | **«Ulric da Torre se ergue atrás da banca de mapas» e responde** | certo (dado); prosa contradiz a linha |
| 27 | compro um cantil de couro | card «Comprar Odres de água ◉ 2», depois «a bolsa fica com ◉ 13»; ◉ 15 → 13, água 10 → 11, linha «Odres de água — ◉ 2 (restam ◉ 13).» | a compra real certa; **depois a prosa** diz «Cantil de couro? … Vinte e três moedas» e uma linha «◉ Não chega: Couro Batido custa ◉ 23, e a bolsa tem ◉ 13» | certo (venda real); prosa e linha leram «couro» como armadura (preço ≠ card) |
| 28 | regateio com a meio-orc da banca: as rações de viagem pela metade do preço | **sem dado** | a prosa concede: «rações pela metade do preço, e pronto. — Leva as dez»; nada na tela | **faltou dado** (a prosa decidiu o regateio) |
| 29 | regateio com a vendedora o preço do couro batido, quero pela metade | **Persuasão 16+2=18 contra 14, passou** | «Couro Batido: ◉ 23 → ◉ 20.»; a prosa diz «Leva por vinte» | certo (preço dito = preço da tela) |
| 30 | regateio de novo com a vendedora o couro batido, ainda acho caro | sem dado | «Vinte. E leva»; **a tela não avisa** que não baixa mais; «Dagny recolhe o couro»; «o peso do dinheiro que ficou menos» (◉ 13 → 13) | certo (o preço não baixou); sem aviso, prosa inventa troca |
| 31 | regateio com Dagny, que me deve um favor, o preço das tochas do balcão | sem dado | «Dagny entrega as tochas sem discutir, o favor pago no peso do maço»: a **dívida na direção certa**; tochas 5 → 5 | certo; tochas «entregues» |
| 32 | dou uma moeda ao estivador do tabuleiro e peço um peixe seco | card «Pagar pão, fruta ou peixe seco ◉ 1», depois «a bolsa fica com ◉ 12» | **◉ 13 → 12, exato**; o estivador embolsa, embrulha o peixe (não entra); fala da «sua lâmina de ferreiro» | certo (o card manda; a perda de 31 não repetiu) |
| 33 | dou duas moedas ao guarda e tento convencê-lo a me deixar passar | card «Pagar ◉ 2», «a bolsa fica com ◉ 10»; sem dado | **◉ 12 → 10, exato**; «o guarda desvia o corpo, e a passagem se abre» | **faltou dado** (discutível: «tento convencê-lo» ficou sem rolagem; a moeda cobrou certo) |
| 34 | minto ao estivador do tabuleiro: sou inspetora do porto e preciso ver os registros | Enganação 9+2=11 contra 10, passou | **quem responde é Dagny** («Fiz o trato por você. O estivador acha que **és** inspetora») e entrega tochas | certo (dado); alvo errado, PT-PT |
| 35 | minto ao ceifador: sou prima da governadora | **sem dado** | o ceifador acredita e fala de Doca Seca | **faltou dado** |
| 36 | minto a Dagny: perdi a minha bolsa de moedas na feira | **sem dado** | Dagny «tira duas moedas do próprio bolso e as enfia na sua mão»; ◉ 10 → 10 | **faltou dado**; moedas dadas e não entradas |
| 37 | ameaço a meio-orc da banca: se não baixar o preço do couro, quebro a sua banca | Intimidação 5+7=12 contra 10, passou («Isso fez barulho.») | **quem responde é Dagny** («entrega o favor cobrado: baixa o preço do couro»); entra Neirin da Torre | certo (dado); alvo errado |
| 38 | saco a minha espada e encosto a lâmina no pescoço do estivador: me diga onde o anão se hospeda | Intimidação 18+7=25 contra 14, passou; linha «com dez de folga — deu certo com folga, e a folga compra alguma coisa.» | o estivador responde certo («Casa do Vento Sul. Quarto do fundo»); «a sobra veio sem pressa… ele é primo da dona» (nonsense) | certo (arma na mão, perícia certa) |
| 39 | fujo do guarda armado de lança, correndo e pulando as caixas das bancas | Atletismo 7+7=14 contra 15, falhou; 5 de dano, PV 18 → 13 | «Você salta… a mão segura, o pé assenta, e você está do outro lado, de pé»; o guarda não aparece | certo (dado); **prosa conta sucesso na falha** |
| 40 | escalo a calha da casa ao lado até o telhado | Atletismo 4+7=11 contra 15, falhou; queda de 5 m, 6 de dano, PV 13 → 7, Caído | a queda é narrada certo; «o baque acordou alguma coisa» | certo |
| 41 | subo pela escada encostada na parede até o sótão do armazém | sem dado | sobe, Dagny sobe atrás; a atendente grita «Ei, curioso!» | certo |
| 42 | me escondo atrás das barracas para sumir de vista | Furtividade 14+4=18 contra 15, passou | «Escondido (furtividade 18)»; ninguém olha | certo |
| 43 | sento num caixote para cuidar dos meus ferimentos e tomar um fôlego | sem dado | descreve o descanso, sem cura (PV 7 → 7) | certo |
| 44 | forço a tampa da arca trancada atrás da banca com o ombro | Arrombamento 9+5=14 contra 17, falhou | a fechadura emperra; «a chave falsa torta no buraco» (ferramenta que a ficha não tem); entra um vigia da Doca Seca | certo (dado); prosa usa «chave falsa» |
| 45 | furto a bolsa de moedas de um homem distraído na multidão da feira | Prestidigitação 15+2=17 contra 15, passou | «o fio do que o homem carregava muda de dono»; ◉ 10 → 10, mochila igual | certo (dado); sucesso sem butim |
| 46 | peço a Dagny que vigie a rua enquanto olho as bancas | sem dado | Dagny vigia, mas a prosa põe na boca dela «— Vigia a rua por mim.» (a fala é da jogadora) | certo |
| 47 | pergunto a Dagny o que ela acha do anão de sobretudo azul | sem dado | Dagny responde | certo |
| 48 | vou até o cais | sem dado | **«"vou até o cais" serve para 2 lugares que você conhece. Qual deles? 1. Ilha das Ossadas 2. Recife Funda»**: outras ilhas; o herói já está no cais | **leitura errada** |
| 49 | procuro um compartimento escondido nas tábuas do cais | sem dado | «Nada cede, nada esconde»; Magnus desce da Casa do Vento Sul («o sobretudo azul aberto», o casaco do anão) e repete «Alguém também te procura» | certo (nada); Magnus de novo |
| 50 | entro na Casa do Vento Sul | cartão «Ir até Casa do Vento Sul · 5 min» (não cliquei) | sem prosa | certo (nome de lugar vira cartão) |
| 51 | olho debaixo das mesas e dos bancos da taverna procurando algo caído | sem dado | a prosa trata o herói como já dentro da taverna (o cartão do 50 estava aberto e se perdeu); «Nada escondido»; **«um selo de cera preta e uma chave torta» sobre o balcão**, não entra | certo (sem dado); objeto inventado |
| 52 | vou à Casa do Vento Sul | cartão «Ir · 5 min»; cliquei | entra na taverna; Magnus, que «trabalha aqui» no cartão, já espera e repete «Alguém mais também te procura» | certo |
| 53 | reviro os barris encostados no canto da taverna | **Percepção 1+1=2 contra 13, desastre**; «Conquista: Tropeço Memorável — o Desastrado»; «o lugar fica remexido» | «Você vira as bancas, os caixotes, as tábuas soltas. Nada.» (não os barris); Magnus «no teu encalço» | certo (**rolou**, barris da taverna); PT-PT |
| 54 | reviro os barris encostados no canto da taverna de novo | sem dado; linha **«↺ Desse jeito você já tentou aqui, e não deu…»** | «a madeira devolve o mesmo silêncio»; fecha com «Não tira os olhos de você.» sem sujeito | certo (não paga de novo); corte indevido |
| 55 | olho debaixo das mesas da taverna procurando algo caído | sem dado | «Você revira as **tábuas do cais** mais uma vez»; «Os olhos dele varrem o salão» sem ele | certo; objeto trocado, corte indevido |
| 56 | Neirin, vem cá, preciso falar com você | sem dado; linha **«Neirin da Torre não está aqui — está em Feira do Saque.»** | **Neirin «para no vão da porta… "Fala, então."»** e Magnus fala «forasteiro» | certo (a linha saiu inteira); prosa contradiz a linha |
| 57 | pergunto à atendente do balcão se ela viu o anão de sobretudo azul | sem dado | a atendente responde | certo |
| 58 | escalo o muro da muralha do porto, uns seis metros de pedra lisa | Atletismo 9+7=16 contra 15, passou | sobe, mas «Enfraquecido (3t) — Desvantagem e −2 no dano causado» no sucesso; linha «deu 23, e bastavam 12»; «à minha frente» | certo (dado); texto de regra e números trocados |

Contagem do roteiro: A1 (comprar o que ninguém vende) 6, 7; A2 (pedir objeto) 8, 9, 10; A3 (ferramenta sem a ficha) 12, 13, 44;
A4 (falar a uma pessoa) 8, 9, 11, 14, 15, 24, 34, 36, 37, 38, 47, 57; A5 (ação física) 40, 44, 45; B7 (buscas em coisas) 16, 17, 18, 19, 20, 22, 49, 51, 53, 54, 55 e o 21 (sob olhar); B8 21, 22; B9 14, 23, 25, 26, 56; B10 3, 4, 5, 48; B11 28, 29, 30, 31; B12 32, 33; B13 22; C mentiras 34, 35, 36, ameaças 37, 38, fuga 39, calha 40, muro 58, escada 41, esconder-se 42; D 2, 3, 46, 47, 5.

## O que a sessão mostra

### Os 13 pontos do roteiro

1. **Comprar o que ninguém ali vende (espada num cais): não confirmado.** A tela disse «espada compra-se nas bancas, com o
   preço de cada uma.» (6), e a prosa **inventou um preço («cinquenta moedas») e, na frase seguinte (7), fingiu a venda**: «Ela a
   estende, cabo primeiro… Ela embolsa sem contar». Moedas ◉ 15 → 15 e mochila igual. Nenhuma linha seca, nenhum corte.
   Em S5 a prosa fingiu a venda inteira; agora fingiu quase inteira.
2. **Pedir a um NPC que dê um objeto (3 vezes): não confirmado.** Os três (8 estivador, 9 meio-orc, 10 Dagny) saíram da
   prosa como entrega ou aceno de entrega, e a mochila não mexeu. Pior: a prosa **inventa quem paga** (Dagny paga a moeda no 8,
   dá duas moedas no 36, entrega tochas no 31 e 34, estende a adaga no 22).
3. **Ferramenta que a ficha não tem: parcial.** O sistema negou («Você não tem ferramentas de ladrão — talvez à força, no ombro»
   em 12) e a prosa deixou de dar o aço girando: «O ferro range, a ponta escorrega. Não há o que fazer com isso». Melhorou
   frente à S5 (a gazua «gira»). Mas «chave falsa torta no buraco» no 44, e «a minha lâmina de ferreiro» do 13 foi
   repetida pela prosa no 32 («sua lâmina de ferreiro») sem que ela tenha uma.
4. **Dirigir a fala a uma pessoa e ver se é ela quem responde: parcial, melhor.** Certo: 8, 9, 11, 14, 15, 24, 36, 38, 47, 57
   (10 de 12). Errado: **34** (o estivador não fala; Dagny responde e entrega tochas) e **37** (Dagny «entrega o favor cobrado»
   pela meio-orc). Dagny aparece em ~30 turnos (6 deles porque a frase a chamava), Magnus em 12; a fala de Magnus é quase
   a mesma em 12, 13, 49, 52, 56 («Outro também anda» / «Alguém mais também te procura» / «Andei atrás de você desde a
   feira») e a de «o anão de sobretudo azul» é repetida por Dagny, pela meio-orc e por Magnus em pelo menos 8 turnos (3, 4,
   15, 19, 22, 31, 47, 57). Ninguém «tomou» a cena como Morgane em S5.
5. **Três ações físicas com alvo claro: confirmado, com um erro.** 40 (calha, a prosa trata a queda), 44 (a arca continua arca:
   «a tampa da arca trancada atrás da banca da Âncora do Sul resiste») e 45 (o furto trata do homem distraído). A escalada
   passada (58) é narrada. Erro: **39** (fuga), em que o dado falhou e a prosa conta o sucesso.
6. **Linhas secas do sistema no meio da prosa: não confirmado, e é o resultado mais forte da sessão.** **Nenhuma** das
   linhas da tabela do conferente apareceu em 57 turnos. O console do conferente registra **10 disparos** (`podadas` de
   pagamento ×2, meio ×1, fala ×10; `troca: false` sempre; `frente: true` uma vez). **A troca nunca ocorreu** e a «frente»
   (linha do resultado à frente) só uma vez: o conferente só **corta**, não repõe. **Corte indevido (defeito tão grave
   quanto a invenção): 3 a 4 turnos.** 16 («Ela espera a resposta, imóvel.»: quem?), 54 («Não tira os olhos de você.»),
   55 («Os olhos dele varrem o salão» sem nenhum «ele» antes); no 22 talvez, na frase final. Em 13 e 12 a prosa também
   começa estranha com a fala repetida. Não consegui saber **qual frase foi podada** em cada disparo (o log só diz o
   motivo), então não consigo dizer se alguma frase **correta** foi cortada; mas uma prosa que chega à tela com «ela» órfão é
   sinal de corte sem reposição.
7. **Buscas em coisas (cestos, caixotes, sacos, barris, tábuas, mesas, carroça): 12 buscas; rolaram 2 (21 sob olhar, 53 barris
   da taverna); nenhuma achou.** Mercado: 16, 17, 18, 19, 20, 22 (cestos, caixotes, sacos, carroça, barris e cestos do
   vendedor): sem dado, todas «nada», **seis coisas distintas a 1 em 4 dão ~18% de chance de nada** (0,75 elevado a 6), então ainda cabe azar. Cais:
   49 (tábuas): sem dado, nada. Taverna: 51 (mesas) e 55 (mesas): sem dado; **53 (barris) rolou** (Percepção 2 contra 13).
   O efeito «o achado entra na bolsa uma vez» **não pôde ser testado** (nenhum achado); o «revirar de novo não paga» foi
   visto uma vez: **54** respondeu «↺ Desse jeito você já tentou aqui, e não deu» e não pagou nada. Atenção: a prosa
   continua a **inventar objetos fora da bolsa** nas buscas (51: «um selo de cera preta e uma chave torta»; 13: «fardos
   de velas e cordas novas»; 18: a conta da espada).
8. **«Revistar os sacos da vendedora enquanto ela me olha» e «os cestos do vendedor» sem dizer que ele olha: confirmado.**
   21 (dono dito olhando): **rolou** (Prestidigitação 2+2=4 contra 15, falhou, a mão é vista); 22 (sem o olhar): não rolou.
9. **Chamar alguém conhecido que não está: parcial.** O sistema **acertou a linha**: **56** «Neirin da Torre não está aqui —
   está em Feira do Saque.» (a forma inteira, sem artigo: «em Feira do Saque»); 26 e 14 também têm a linha «X não está aqui»
   (sem o «está em…»). Não virou cartão de viagem em nenhum dos 5 (14, 23, 25, 26, 56) e **não rolou o oráculo**. Mas
   **a prosa contradiz a linha em 14, 26 e 56**: o ausente aparece, fala e age («Neirin para no vão da porta… "Fala, então."»).
   Em 23 e 24 o chamado («Magnus») já estava em cena pela prosa e ninguém o contrapôs.
10. **Pergunta de caminho não move; «vou ao mercado» move: confirmado.** 3 e 4 não moveram o herói (o lugar do cabeçalho
    ficou); 5 moveu. **Defeito novo:** 48 («vou até o cais», já no cais) abriu «serve para 2 lugares que você conhece: Ilha
    das Ossadas, Recife Funda» (outras ilhas).
11. **Regatear com dado e pagar; regatear de novo; regatear com companheiro: parcial.** O regateio com dado **baixou o
    preço** (29: Couro Batido ◉ 23 → 20, e a prosa diz «vinte»: preço dito = preço da tela). **O regateio repetido (30)
    manteve 20 sem dado e sem dizer na tela que não baixa mais** (só a prosa diz «Vinte. E leva»). **Com o companheiro que
    deve favor (31): sem dado, a dívida na direção certa** («o favor pago no peso do maço»), e a prosa entrega tochas
    que a ficha não deu. **O 28 (rações pela metade) foi decidido pela prosa sem dado.** Não consegui **pagar** o couro
    desconto (a bolsa não chegava, ◉ 13 contra 20); a compra do cantil (27) cobrou ◉ 2 e a água subiu de 10 para 11.
12. **Pagar quantia dita: confirmado.** 32: «dou uma moeda ao estivador» → ◉ 13 → 12 (card «Pagar ◉ 1», «a bolsa fica com
    ◉ 12»). 33: «dou duas moedas ao guarda e tento convencê-lo» → ◉ 12 → 10 (card «Pagar ◉ 2»). **A perda de 31 moedas
    não repetiu.** Nos dois, a rolagem de «convencer» não veio.
13. **A legenda do dado anterior some nos turnos sem dado: confirmado.** Depois do 21 (Prestidigitação 4 contra 15), o 22
    mostrou só «A bandeja espera o dado.»; nos turnos sem dado seguintes a legenda do último lance não aparece junto da
    prosa. O histórico e a legenda do último lance só ficaram no turno do próprio lance.

### Os defeitos novos

1. **O conferente corta e não repõe, e deixa a prosa órfã.** Dez disparos, nenhuma troca, uma «frente»; prosa com «ela»,
   «dele» ou sujeito sem antecedente em 16, 54, 55 (e talvez 22). A tabela de linhas secas existe e não saiu uma vez.
2. **A prosa ainda vende, entrega, paga e dá o que a ficha não deu**, e agora **inventa quem paga**: 7 (espada e 50 moedas),
   8 (Dagny paga), 9 (corda), 10 (adaga), 22 (adaga de novo), 28 (rações concedidas), 30 (couro «recolhido»), 31 (tochas),
   34 (tochas), 36 (duas moedas), 45 (furto sem butim), 51 (selo e chave). Mochila e moedas intactas em todos.
3. **A linha «X não está aqui» é contrariada pela prosa seguinte** (14 Magnus, 26 Ulric da Torre, 56 Neirin), e o barqueiro
   que está na barca (25) sobe a rampa para falar no mercado sem linha nenhuma. O veto do sistema chega e o Narrador escreve
   contra ele.
4. **A prosa conta o contrário do dado** em 39 (a fuga falhou, o texto diz que saltou e está de pé) e mistura números na
   linha do muro em 58 («deu 23, e bastavam 12», com o dado 16 contra 15).
5. **Texto de regra/mecanismo na tela:** «com dez de folga — deu certo com folga, e a folga compra alguma coisa.» (38);
   «Salvaguarda de Destreza: d20 → 4 + 2 = 6 vs 13 · não resistiu» e «Caído (1t) — No chão: desvantagem até levantar.» (40);
   «Enfraquecido (3t) — Desvantagem e −2 no dano causado.» na escalada **passada** (58); «Isso fez barulho.» (37);
   «↯ Alguém na rua vê a minha mão onde ela não devia estar.» e «à minha frente» (58) em primeira pessoa.
6. **O preço da prosa não é o do card**: 27 («Cantil de couro? … Vinte e três moedas», contra o card de ◉ 2), mais uma
   linha «◉ Não chega: Couro Batido custa ◉ 23» da mesma frase (lê «couro» como armadura).
7. **Mistura de pessoa na prosa**: Magnus aparece com «o sobretudo azul» (49), que é do anão da trama; Dagny diz a fala da
   jogadora («— Vigia a rua por mim.», 46); «curioso» e «forasteiro» para uma heroína (41, 56).
8. **Texto de busca troca o objeto** (53 diz «as bancas, os caixotes, as tábuas» e a frase era barris; 55 diz «as tábuas do
   cais» e a frase era mesas, dentro da taverna).
9. **«+17 XP · um risco enfrentado, e vencido» sem risco** em 8 (pedir um peixe seco).
10. **Leitura errada de 48** (cais já no cais vira escolha entre duas ilhas).
11. **Sem aviso na tela de que o regateio não baixa mais** (30).
12. **O pedido de pouso («cuido dos meus ferimentos», 43) não curou nada** (PV 7 → 7).
13. **O que deu certo:** a revista com o dono olhando rola (21); a pergunta de caminho não move (3, 4); «chamo Magnus» não virou
    viagem (23, 24); a linha «não está aqui — está em Feira do Saque» saiu inteira (56); a fuga, a calha, a ameaça, a mentira
    a estranho, o arrombamento, o muro de seis metros e o esconder-se rolam; a escada sem dado; o pagamento com quantia dita
    cobra exato (32, 33); a legenda velha some (22); o «já tentou» saiu no 54; a venda real passa pelo cartão (27); o
    regateio baixa o preço que a compra cobra (29); o PT-PT quase sumiu (2 turnos); zero erros de console.

## O que não consegui verificar

- **O achado na coisa** (revirar uma vez só, entrar na bolsa): nenhuma das 12 buscas deu achado. **Não consegui provar se o
  mercado e o cais do arquipélago têm achado na semente**; a taverna rolou um dado (53) que falhou.
- **Quais frases foram podadas pelo conferente** em cada turno e se alguma era correta: o log dá só o motivo, e os cortes
  chegaram à tela já aplicados. Só vejo as prosas órfãs que sobraram.
- **Pagar o couro com desconto** (preço cobrado igual ao dito): a bolsa não chegava.
- **O silêncio do 30** (se a tela diz «não baixa mais» só em outros casos, como o «Já me deves um favor» da S5): só li o texto.
- **A ameaça sem arma à mão** (a heroína tem Espada Longa): 37 e 38 foram feitas com ela; nenhuma sem.
- **A luta:** nenhuma começou; a heroína chegou a 7/18 PV pelas quedas do 39 e do 40.
- **O tipo de mundo**: só o arquipélago (mar/porto) foi jogado; não houve tempo para outro.
- **A ordem exata dos disparos do conferente por turno**: o ouvinte de info só foi ligado no 43; as mensagens anteriores vieram
  repetidas, sem relógio por turno.
