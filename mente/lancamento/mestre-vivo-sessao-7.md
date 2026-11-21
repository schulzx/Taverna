# O Mestre vivo — sétima sessão jogada (21/11/2026)

Commit `8dfde2b` (v9.665), cópia limpa fora do repositório, `?mestre=1`, IA real, Edge headless por CDP. **Kaelith Punho-de-Pedra**
(gnoma, clériga, Náufrago; **sem arma** na ficha, mochila com uma Bússola empenada; 15 moedas, 16 PV) com **Brigid Cinza-Antiga**
(companheira), num mundo de **Fantasia medieval · Terras abertas · Ascensão do Reino** (escolhido de propósito: a sessão 5 e a 6 foram
em arquipélago). Lugares: Ponto Valente (praça), O Espinho Calado (taverna), O Rossio dos Andarilhos (mercado), O Baluarte Tortuoso e a
sala do capitão. **58 frases** fora de luta (2 a 59 na tabela; a abertura não conta), 54 mensagens do Mestre no save (≈ 54 chamadas ao
Narrador, mais o juiz em cada uma); 11 dados rolados; nenhuma luta começou. Jogada por um testador em Sonnet, com a régua de 19/11:
**não há cota de dado**; só contam a ação arriscada sem dado e o dado onde um mestre real não pediria. Moedas e mochila foram lidas do
save (`localStorage`) antes e depois de todo turno; os dados e as linhas do sistema, da lista de mensagens do próprio save; o conferente,
do console (ouvinte ligado desde o primeiro carregamento, esvaziado a cada turno).

## Os totais

| | sessão 5 | sessão 6 | sessão 7 |
|---|---|---|---|
| frases | 45 | 57 | **58** |
| certos | 36 de 45 | 52 de 57 | **53 de 58** |
| faltou dado | 3 | 4 (28, 33*, 35, 36) | **1 firme** (29) + **2 discutíveis** (28, 39) |
| dado indevido | 1 | 0 | **0** |
| leitura errada da frase | 5 | 1 + 1 parcial | **2** (38, 40) + **1 discutível** (10, «fiado» virou «Pagar ◉ 2») |
| turnos em que a prosa contradiz a ficha, o veredito ou a linha do sistema | ~9 | 19 | **17** (7, 12, 14, 25, 26, 29, 33, 35, 36, 43, 46, 47, 51, 56, 57, 58, 59) |
| pessoa errada respondeu | 4 | 2 (+3 ausentes) | **2** (29, 46) (+ **3 ausentes** que aparecem apesar da linha: 12, 14, 51) |
| conferente: turnos com corte / podas / reposições | — | 10 disparos, 0 reposições | **5 turnos** (8, 12, 19, 25, 49), **10 podas**, **1 reposição** (8); `troca: false` sempre; `frente: true` em 2 (26, 46) |
| corte que deixou prosa órfã | — | 3 a 4 | **4** (8, 12, 19, 49) |
| turnos com português de Portugal | ~23 de 41 | 2 | **2** (9 «a perguntar», «poisa»; 36 «tua trouxa») |
| erros de console | 0 | 0 | **0** |
| achado que entrou na mochila ou nas moedas | nunca visto | nunca visto | **1** (47: ◉ +68 e 2 Erva Amarga). **2** narrados que não entraram (25, 35) |

O que melhorou, em número: o pagamento com quantia dita cobrou exato nas **3** vezes (15 → 13, 13 → 11, 79 → 76), uma vez só cada; as
**5** falhas de dado (22, 42, 45, 54, 55) tiveram prosa coerente com a falha, nenhuma narrou êxito; «vou até X» estando em X (31, 32) não
abriu cartão nem escolha; a pergunta de caminho a um destino próximo (41) foi respondida sem mover o herói; e **um achado entrou pela
primeira vez** (47). A companheira recusou 3 de 6 pedidos de pagar/entregar (8, 13, 14).

O que não melhorou, ou apareceu: (1) a companheira ainda **paga, entrega e negocia pelo herói** em 3 de 6 pedidos (7 caneca paga,
29 frasco conseguido, 59 tocha entregue), sem linha seca e sem o conferente disparar; (2) a ausente chamada **aparece e fala** em 12 (Cora),
14 e 51 (Sable), com a linha «não está aqui» saída inteira; o conferente só disparou em 12; (3) **a venda de item não aplica**: três
vezes (56, 57, 58) a linha diz «Vendido… (bolsa ◉ 80)» e a prosa conta as moedas na mão, e a ficha segue com ◉ 76 e o item na mochila; (4) o
conferente que corta **deixa o «ela», o «ele» e o verbo sem dono**; (5) suborno de guarda e pergunta de caminho a destino distante viraram
**cartão de viagem** (38, 40).

## Turno a turno

A numeração é a das frases jogadas, na ordem. Dados: perícia, total contra o número a bater. «sem dado» = nenhum cartão de rolagem
apareceu. Moedas (◉) e mochila saem do save; só aparecem quando mudam. Conferente = linha `[conferente]` do console.

| # | frase | dado | o que a narração fez | veredito |
|---|---|---|---|---|
| 2 | olho em volta, a praça e as pessoas | sem dado | descreve três figuras (mulher de avental, muladeiro, menino) e Brigid | certo |
| 3 | pergunto a Brigid onde fica a taverna mais próxima | sem dado | Brigid responde: o Espinho Calado | certo |
| 4 | vou até a taverna, o Espinho Calado | sem dado; cartão «5 min» (cliquei 2x) | chega; conquista; Hakon, o moço da casa | certo (viagem) |
| 5 | olho as pessoas do salão | sem dado | descreve Hakon, a mulher de avental, o muladeiro, dois homens | certo |
| 6 | vendo a minha bússola empenada ao Hakon | sem dado; cartão «Vender Bússola ◉ +7» (não cliquei) | sem prosa | certo (veredito antes do clique) |
| 7 | peço a Brigid que pague uma caneca de cerveja para mim | sem dado | «Brigid se adianta, joga duas moedas no balcão… A cerveja desce diante de você»; ◉ 15 → 15; sem linha seca; «+17 XP · um risco enfrentado, e vencido» sem risco | certo (dado); **troca fechada pela prosa** |
| 8 | peço à Brigid que me dê uma moeda do bolso dela | sem dado; conferente `["objeto","orfa"]`, reposição 1 | «Por ora, nada passa para você. Cerveja paga, agora me diz o que viu lá fora.»» — **sem sujeito e sem a abertura das aspas**; ◉ 15 → 15 | certo (dado, ficha e prosa concordam); corte que mutilou a fala |
| 9 | ofereço a bússola empenada a Hakon em troca de um quarto | sem dado | Hakon recusa («Isto aqui não paga cama») e aponta Cora na Casa do Martelo Calada; «o seu amigo lá fora está a perguntar» | certo; PT-PT |
| 10 | peço a Hakon uma caneca de cerveja fiado, pago amanhã | sem dado; cartão «Pagar ◉ 2» (não cliquei) | sem prosa | certo (veredito); «fiado» lido como compra |
| 11 | dou duas moedas ao Hakon pela cerveja | cartão «Pagar caneca ◉ 2», «a bolsa fica com ◉ 13» | **◉ 15 → 13, exato**; Hakon apanha, testa uma nos dentes, enche a caneca | certo |
| 12 | chamo Cora Rompe-Escudos: Cora, venha aqui | sem dado; linha **«Cora Rompe-Escudos não está aqui — está na Casa do Martelo Calada.»**; conferente `["ausente"]` | «Sua voz corta o salão. Junta as mãos no avental e aproxima-se… — O que quer de mim?» (sem nome: o corte tirou o sujeito) | certo (dado); **prosa contradiz a linha** |
| 13 | peço a Brigid que me entregue a espada dela | sem dado | Brigid recusa: «Você tem duas mãos. Use as suas.» | certo |
| 14 | peço a Brigid que compre um pão com o dinheiro dela | sem dado | Brigid recusa; «**Cora, ainda na mesa**, desvia o olhar» | certo (dado); a ausente do 12 está em cena |
| 15 | vendo a minha maça de ferro ao Hakon (não tenho) | sem dado | linha seca «A maça de ferro não está na sua bolsa — não há o que vender.» | certo |
| 16 | chamo Gunnar, o ferreiro (inventado): Gunnar, venha cá! | sem dado | «Ninguém responde»; Hakon: «Não há Gunnar aqui… tente na Casa do Martelo Calada» | certo |
| 17 | pergunto a Brigid o que acha de Cora | sem dado | Brigid responde («Aprendiz. Orgulhosa.») | certo |
| 18 | olho debaixo das mesas e dos bancos do salão (busca 1) | sem dado | «serragem velha, uma moeda falsa cravada num vão, um fio de barbante»; Hakon observa | certo (dado); objeto inventado |
| 19 | reviro o monte de palha no canto perto da adega (busca 2) | sem dado; conferente `["fala"]` | nada; «O rato parado no vão da adega. "Não é a primeira a revirar…" diz ele» — **o «ele» não tem dono** | certo (dado); corte órfão |
| 20 | olho dentro dos barris atrás do balcão (busca 3) | sem dado | «três barris, um com a tampa solta»; «os olhos [de Hakon] acompanham sua mão»; nada | certo (dado); dono olhando, não dito pela frase |
| 21 | vou até o mercado | sem dado; cartão «5 min» (cliquei 2x) | chega ao Rossio dos Andarilhos; Sable (ervas), mulher de lenço | certo (viagem) |
| 22 | reviro os caixotes empilhados atrás da banca de ervas (busca 4) | **Prestidigitação 7 → total 8 contra 15, falhou**; «Sable vê a minha mão» | a tampa cede, Sable manda tirar a mão | certo (rolou); prosa coerente com a falha |
| 23 | vasculho a carroça parada no canto do largo (busca 5) | sem dado | sabugo, balde rachado, capa; nada | certo |
| 24 | remexo os sacos de grão junto a uma tenda (busca 6) | sem dado | casca e pó; Brigid «Aqui não tem armadilha» | certo |
| 25 | reviro os cestos de peixe defumado ao lado da banca (busca 7) | sem dado; conferente `["fala","fala","orfa","orfa"]` | «**E logo atrás, pendurada num gancho, uma chave de ferro com a alça quebrada.**» mochila só Bússola | certo (dado); **achado narrado que não entrou** |
| 26 | regateio com a vendedora de ervas: um maço pela metade do preço | **Persuasão +5 contra 14, passou** (natural 18, total 23); «Se deixam convencer.» | Sable «Leva», amarra o maço; ◉ 13 → 13; mochila igual; conferente `[]`, `frente: true` | certo (rolou); **entrega falada, sem pagamento nem item** |
| 27 | minto à mulher de lenço desbotado: sou a fiscal do mercado | **Enganação 10+5=15 contra 14, passou** | ela afasta a lona, mostra frascos | certo; a pessoa certa; legenda velha «Se deixam convencer.» sob o cartão novo |
| 28 | peço um favor ao muladeiro: que me leve até a ponte na carroça | sem dado | o muladeiro responde (a pessoa certa; mas ele estava na taverna e aparece no mercado) | certo; **favor sem dado, discutível** |
| 29 | (dupla, minha) o que Brigid acha da mulher de lenço? e regateio com o freguês dela: um frasco de graça | **sem dado** | Brigid opina e, **ela mesma**, «sussurra para o comerciante: "O frasco. Como gentileza…"»; o homem «desliza um vidro» «— Leva»; linha «🤝 Leve Stiletto: ◉ 88 → ◉ 77.» (de quem, não sei); mochila igual | **faltou dado** (regateio resolvido pela prosa); pessoa errada (o comerciante, e a Brigid agindo) |
| 30 | dou duas moedas a Sable pelo tomilho e alecrim | cartão «Pagar ◉ 2» (2 cliques) | **◉ 13 → 11, exato**; linha «◉ −2 moedas»; Sable empurra o maço (não entra); «Se a fiscal perguntar, fui eu que te ofereci» (a mentira do 27 na boca de outra pessoa) | certo (dado) |
| 31 | vou até o mercado (já no Rossio) | sem dado | descreve a praça; lugar igual; **sem cartão e sem escolha** | certo |
| 32 | vou até o Rossio dos Andarilhos (já nele) | sem dado | descreve o Rossio; lugar igual | certo |
| 33 | reviro as gavetas do banco virado na banca vazia dos cambistas (busca 8) | sem dado | «Vazias. Só pó e um fio de cobre»; a prosa diz que carrego «o maço de tomilho que Sable amarrou» e «a bússola desde o cais» | certo (dado); posse inventada |
| 34 | olho no fundo do poço e reviro o balde (busca 9) | sem dado | limo; nada; repete «a bússola e o maço pesam juntos… duas coisas custam» (3.º turno seguido) | certo |
| 35 | olho nas dobras da lona de uma tenda vazia perto do beco (busca 10) | sem dado | «**uma carta amarrada com fio de couro, úmida, amassada**»; sem linha; mochila, chão e quadro vazios | certo (dado); **achado narrado que não entrou** |
| 36 | pego a carta e guardo na mochila | sem dado | «Você enfia a carta na mochila»; mochila só Bússola; «a tua trouxa» | certo (dado); **prosa contradiz a ficha**; PT-PT |
| 37 | vou até o Baluarte Tortuoso | cartão «5 min» (cliquei 2x); linha «📍 Você está no Baluarte Tortuoso.» | sobe a escadaria; sargento: «O capitão não está» | certo (viagem de verdade) |
| 38 | dou duas moedas ao sargento para ele me deixar entrar na sala do capitão | sem dado | virou **cartão de viagem «Ir até a sala do capitão · 1 min»**; sem pagamento, sem prosa | **leitura errada** |
| 39 | ofereço duas moedas ao sargento para fechar os olhos e me deixar passar | sem dado, sem cartão de pagamento | «Olha as moedas… Não as pega. — Aqui não é porto»; ◉ 11 → 11 | ficha e prosa concordam; **recusa decidida sem dado, discutível** |
| 40 | pergunto ao sargento qual é o caminho até a Cripta dos Mil Bocas | sem dado | virou **cartão «Ir até Cripta dos Mil Bocas ● Difícil»**; a pergunta não foi respondida | **leitura errada** |
| 41 | sargento, como se chega ao mercado daqui? | sem dado | «Desce a ladeira, vira à esquerda no chafariz»; lugar igual | certo |
| 42 | minto ao sargento: sou enviada do capitão | **Enganação 3+5=8 contra 14, falhou** | o sargento ri: «Hoje não, Punho-de-Pedra»; linha «📍 Você está na sala do capitão» (antes do dado) | certo; prosa coerente com a falha; lugar mudou sem eu clicar o cartão do 38 |
| 43 | furto a bolsa de moedas do sargento sem ele ver | **Prestidigitação 16+1=17 contra 15, passou**; juiz «1 achado (preco 1)» | «Duas moedas escorregam para a palma da sua mão… Você guarda as moedas»; ◉ 11 → 11 | certo (dado); **sucesso sem butim** |
| 44 | tento saltar o parapeito da escada e cair no pátio, uns quatro metros | **Atletismo 17+2=19 contra 15, passou** | «O salto é limpo»; sem dano | certo |
| 45 | arrombo à força a porta de ferro com o ombro | **Arrombamento 4 contra 15, falhou**; «A fechadura emperra», «Isso fez barulho.» | «Nada cede» | certo; prosa coerente com a falha |
| 46 | minto ao guarda manco: sou a nova recruta mandada pelo capitão | **Enganação 18+5=23 contra 14, passou**; «Acreditam em você.» | **responde «O sargento manca até você»** (eu falei com o guarda manco); a porta que falhou no 45 agora está «entreaberta» | certo (dado); **pessoa errada**; prosa contradiz o 45 |
| 47 | reviro as gavetas da mesa do capitão (busca 11) | **Percepção 14+2=16 contra 13, passou**; linha **«📿 Achado: um relicário guardado longe dos olhos — ◉ 68 moedas · 🌿 Erva Amarga, 🌿 Erva Amarga»** | **◉ 11 → 79; mochila +2 Erva Amarga** (tela: «+68», «+ Erva Amarga × 2»); a prosa diz «moedas robustas e dois runas de mina» | certo (**o achado entrou**); a prosa troca o 2.º item (runas ≠ ervas) |
| 48 | olho de novo as gavetas da mesa do capitão (busca 12) | sem dado | «Vazias»; ◉ 79 → 79; sem a linha «já tentou» | certo (não paga de novo) |
| 49 | olho a estante de mapas e os armários do canto da sala (busca 13) | sem dado; conferente `["fala"]` | nada (rolos, cotas, botas); «"O capitão andou olhando para o mar. E tem pressa." **Ela** solta o pergaminho» sem antecedente | certo (dado); corte órfão |
| 50 | chamo Joric Lâmina-Rápida: Joric, venha cá | sem dado; linha «Joric Lâmina-Rápida não está aqui — está no Baluarte Tortuoso.» | Joric sobe a escada e fala («Estava no pátio») | certo (dado); **ambíguo** (o pátio é do mesmo prédio, mas a linha diz «não está aqui») |
| 51 | Sable, venha cá! Preciso falar com você | sem dado; linha **«Sable não está aqui — está no Rossio dos Andarilhos.»**; conferente sem disparo | **«Sable sobe a escada devagar… — Aqui em cima? … — Fala.»** | certo (dado); **prosa contradiz a linha** |
| 52 | Hakon, o moço da taverna, venha cá! | sem dado, sem linha | «Não há Hakon aqui»; Brigid: «Aqui em cima não tem moço de taverna» | certo |
| 53 | dou três moedas a Sable pelo tempo dela e peço que me conte o que sabe do capitão | cartão «Pagar ◉ 3» (2 cliques); juiz «1 achado (preco 1)» | **◉ 79 → 76, exato**; linha «◉ −3 moedas»; Sable embolsa e responde («Dizem que guarda um relicário que não é dela») | certo |
| 54 | ameaço Sable: se não me disser onde Ingrid está, quebro as suas ervas | **Intimidação 3 contra 15, falhou**; «Isso fez barulho.» | «Quebra minhas ervas e eu grito»; recua | certo; prosa coerente com a falha |
| 55 | escalo a parede de pedra lisa até a janela alta, uns cinco metros | **Atletismo 4+2=6 contra 15, falhou**; queda de 3 m, salvaguarda 21 contra 12, 2 de dano, 16 → 14 PV, Caído | «Você cai três metros e bate no chão»; Brigid «Fica no chão» | certo; prosa coerente com a falha; texto de mecanismo na tela |
| 56 | vendo uma Erva Amarga a Sable | cartão «Vender Erva Amarga ◉ +4» (2 cliques); linha «🛒 Vendido: Erva Amarga a A Raiz Amarga por ◉ 4 (bolsa: ◉ 80)» | «Serve. — Enfia na bolsa, tira as moedas»; **ficha 30 s depois: ◉ 76, as duas ervas na mochila** | **venda não aplicada** |
| 57 | vendo uma Erva Amarga a Sable (de novo) | mesmo cartão e mesma linha «(bolsa: ◉ 80)» | «As moedas caem na sua mão. Ela guarda a erva»; ◉ 76, duas ervas | **venda não aplicada** (reproduzido) |
| 58 | vendo a minha bússola empenada a Sable | cartão «Vender Bússola ◉ +7»; linha «Vendido… por ◉ 7 (bolsa: ◉ 83)» | prosa de venda feita; ficha: ◉ 76, bússola e 2 ervas na mochila | **venda não aplicada** (3.ª vez, outro item) |
| 59 | peço a Brigid que me entregue uma das tochas dela | sem dado | «Brigid não hesita. Puxa uma tocha do cinturão e a estende. — Leva.»; tochas 5 → 5, mochila igual; sem linha seca; sem conferente | certo (dado); **troca fechada pela prosa** |

Contagem do roteiro: 1 (trocas) 6, 7, 8, 9, 10, 13, 14, 15, 29, 56, 57, 58, 59; 2 (quantia dita) 11, 30, 53; 3 (ausentes) 12, 16, 50, 51, 52;
4 (falhas) 22, 42, 45, 54, 55; 5 (buscas) 18, 19, 20, 22, 23, 24, 25, 33, 34, 35, 47, 48, 49 (13); 6 (várias pessoas) 26, 27, 28, 29, 42, 46 e 30, 53 (pagamentos);
7 («vou até X» em X e viagem) 31, 32 e 4, 21, 37; 8 (suborno e caminho) 38, 39, 40, 41.

## O que a sessão mostra

### Os oito itens do roteiro

1. **Trocas que o sistema pode não dar: melhorou, não resolvido.** Treze frases de troca. Corretas: 6 e 10 (cartão com o preço antes do
   clique), 8, 9, 13, 14 (recusa, com ficha e prosa de acordo), 15 (linha seca «não há o que vender»). Fechadas pela prosa sem a ficha:
   **7** (Brigid paga a caneca), **26** (maço «Leva», sem pagamento nem item), **29** (a Brigid negocia e o comerciante entrega o frasco),
   **59** (a Brigid entrega a tocha): quatro, e três delas são companheira que paga ou entrega, o que o prompt novo proíbe. Na sessão 6 eram
   12 (7, 8, 9, 10, 22, 28, 30, 31, 34, 36, 45, 51). Pior, e novo: **a venda de item não aplica** (56, 57, 58), com linha e prosa dizendo
   «vendido». A **compra** aplicou nas três vezes (11, 30, 53). Dos 6 pedidos à Brigid (7, 8, 13, 14, 59 e 29), ela recusou 3 e cumpriu 3.
2. **Pagamento com quantia dita: resolvido.** 11 (duas moedas, 15 → 13), 30 (duas, 13 → 11), 53 (três, 79 → 76): exato e uma vez só,
   com a linha «◉ −N moedas» e o cartão antes do clique. Nenhuma perda de moedas.
3. **Chamar quem não está: igual.** Cinco chamados. A linha «não está aqui — está em…» saiu em 12, 50 e 51; em 16 (nome inventado) e 52 (Hakon, em
   outro lugar) a prosa disse «não há ninguém», certo. **Em 12 e 51 a ausente apareceu e falou** (Cora «aproxima-se», e no 14 está «na mesa»;
   Sable «sobe a escada… — Fala.»). O conferente cortou em 12 (`["ausente"]`, deixando a fala sem nome) e **não disparou em 51**. Em 50 (Joric) a
   linha diz «está no Baluarte Tortuoso» e ele sobe do pátio: ambíguo. Na sessão 6 eram 3 de 5 contradições; agora 2 firmes e 1 ambígua.
4. **Dado que falha: resolvido nas cinco vistas.** 22, 42, 45, 54 e 55 falharam e a prosa narrou a falha (a mão é vista, o sargento ri, nada cede,
   Sable recua, a queda com dano). Nenhuma narrou êxito. **Limite:** a fuga e o salto não falharam (o salto do 44 passou), então a família
   travessia do conferente («desfaz o êxito que o dado negou») só foi posta à prova por uma escalada (55), que a prosa já contava como queda.
5. **Buscas em coisas: melhorou (o achado entrou).** 13 buscas em três tipos de lugar: taverna (18, 19, 20), mercado (22 a 25, 33 a 35) e sala do
   capitão (47, 48, 49). **Rolaram 2**: 22 (caixotes atrás da banca com a dona perto: falhou) e 47 (gavetas da mesa do capitão: Percepção 16
   contra 13, passou). **47: o achado entrou**, com a linha «📿 Achado: …» e «+68 / + Erva Amarga × 2» na tela; ◉ 11 → 79 e a mochila ganhou as
   duas ervas (é a primeira vez que se vê). **48** (olhar de novo no mesmo lugar) voltou vazio e não pagou de novo. Mas **25** (uma chave de ferro) e
   **35** (uma carta) foram narrados como achados sem dado, sem linha e sem entrar; e no 36, pedir para pegar a carta fez a prosa dizer «enfia a
   carta na mochila» com a mochila intacta. Das 11 buscas que não rolaram, as de taverna e mercado com um dono olhando (20, 23, 24) terminaram sem dado; a regra
   da sessão 6 (dono dito olhando rola) não foi testada com o dono dito. No 47 a prosa disse «dois runas de mina» e a ficha deu duas ervas.
6. **Várias pessoas no mesmo lugar: melhorou, com um vazamento.** Seis figurantes por ofício, com a Brigid presente: vendedora de ervas (26, dado, passou),
   mulher de lenço (27, dado, passou), muladeiro (28, sem dado), comerciante/«freguês» (29), sargento (42, falhou) e guarda manco (46, passou).
   **Cada um foi julgado por si** (os resultados diferem; ninguém respondeu «isso você já conseguiu»). Pessoa errada respondeu em **29** (a Brigid
   agiu e o comerciante entregou) e em **46** (falei com o guarda manco e quem respondeu foi o sargento). **Vazamento:** a mentira do 27 («fiscal do
   mercado») apareceu na boca de outras duas pessoas («se a fiscal perguntar, não me viu», 29; «se a fiscal perguntar, fui eu que te ofereci», 30).
7. **«Vou até X» estando em X e a viagem de verdade: resolvido.** 31 e 32 não abriram cartão nem escolha e não moveram o herói; 4, 21 e 37 mostraram
   o cartão com «5 min» e, depois de confirmado, a linha «📍 Você está no…». **Uma ressalva:** no 42 o lugar passou a «A sala do capitão» sem eu
   confirmar o cartão do 38 (deduzo que a frase «entrar na sala dele» reativou o cartão pendente; não verifiquei).
8. **Suborno e caminho: pior no suborno, melhor no caminho.** 38 («dou duas moedas ao sargento para ele me deixar entrar») virou cartão de viagem, sem
   cartão de pagamento. 39 («ofereço duas moedas… fechar os olhos») não gerou cartão de pagamento nem dado: a prosa recusou («Aqui não é porto») e as
   moedas ficaram. O pagamento só apareceu como cartão quando o alvo era um figurante comum (30, 53). **Caminho:** 41 («como se chega ao mercado?») foi
   respondido sem mover; **40** (a Cripta dos Mil Bocas, destino distante) abriu o cartão «Ir… ● Difícil» e a pergunta ficou sem resposta.

### Os defeitos novos ou que voltaram

1. **A venda de item mostra «Vendido» e não aplica** (56, 57, 58): linha «🛒 Vendido: … (bolsa: ◉ 80)», prosa «as moedas caem na sua mão», e a ficha, 30 s
   depois, com ◉ 76 e os itens na mochila. Reproduzido com dois itens (Erva Amarga, Bússola). A compra aplicou. Não sei dizer se é a venda em geral, a venda
   para essa vendedora ou a venda dentro da sala do capitão.
2. **A companheira ainda paga, entrega e negocia pelo herói** (7, 29, 59), apesar do prompt novo. O conferente não disparou em nenhum dos três.
3. **O conferente corta e deixa prosa órfã** (8, 12, 19, 49): «Por ora, nada passa…»» sem sujeito nem aspas de abertura; «diz ele» do rato; «Ela solta o
   pergaminho» sem antecedente; «Junta as mãos no avental e aproxima-se» sem nome. A reposição apareceu uma vez (8); `troca: false` em todas.
4. **A ausente que aparece e fala contra a linha «não está aqui»** (12, 14, 51).
5. **Achado narrado fora do sistema** (25 chave, 35 carta, 36 «enfia a carta na mochila») e **butim narrado sem entrar** (43: «guarda as moedas», ◉ 11 → 11).
6. **Texto de mecanismo e de regra na tela:** «🪂 o muro — 3 m de queda (1d6)», «Salvaguarda de Destreza», «SUCESSO CRÍTICO», «Caído (1t) — No chão:
   desvantagem até levantar.» (55); «🔊 Isso fez barulho.» (45, 54); «O relógio não anda.» (48); «↯ Sable vê a minha mão onde ela não devia estar.» (22,
   em primeira pessoa); «+17 XP · um risco enfrentado, e vencido» num pedido de cerveja (7). Uma linha que não sei de quem é: «🤝 Leve Stiletto: ◉ 88 → ◉ 77.» (29).
7. **Legenda do dado anterior sob o cartão novo** (27: «Se deixam convencer.»; 46: «Acreditam em você.» logo após o 42): o contrário da sessão 6.
8. **Repetição de motivo:** «a bússola empenada e o maço de tomilho… duas coisas que custam» em 33, 34 e na busca 19 («a bússola e a dívida de quem paga o vinho»).
9. **PT-PT:** 9 («está a perguntar», «poisa a caneca»), 36 («a tua trouxa»). «dois runas» (47) é erro de gênero.
10. **O que deu certo:** pagamento exato (3 de 3); falhas coerentes (5 de 5); achado que entra (47); re-busca que não paga (48); «vou até X» em X (31, 32);
    viagem com cartão e linha (4, 21, 37); recusas de companheira com o prompt novo (8, 13, 14); mentira, ameaça, furto, arrombamento e escalada rolam;
    zero erros de console.

## O que não consegui verificar

- **Qual frase cada corte do conferente tirou.** O log só diz o motivo (`fala`, `orfa`, `objeto`, `ausente`); só vejo o que sobrou na tela.
- **Se o prompt novo, e não o acaso, fez a Brigid recusar 3 de 6.** Não há par A/B; foram uma sessão e uma semente.
- **A venda quebrada: a causa.** Só três tentativas na mesma cena; não tentei vender numa banca de mercado nem sem companheira.
- **A fuga e o salto que falham** (só o 55, uma escalada); a família travessia do conferente não foi posta à prova de verdade.
- **Busca com o dono dito olhando** (a regra da sessão 6): em nenhuma das 13 frases eu disse que alguém olhava.
- **Outros achados:** só um achado em 13 buscas (um em 13 não diz a taxa); não vi achado em taverna nem em mercado.
- **A ameaça sem arma à mão:** a heroína não tem arma, mas as duas ameaças (54) foram só de palavra e não há dado a comparar.
- **O painel de pessoas** (quem a tela dá como presente): só li a prosa e as linhas, não abri a ficha de gente.
- **O cartão que mudou o lugar sozinho (42):** deduzido, não confirmado.
- **Mundos:** só um (Terras abertas, continente); não houve luta nem outro cenário.
- **Ofícios de raça** («o estivador», «a meio-orc», «o ceifador»): esses figurantes não existiam neste mundo; usei a vendedora de ervas, a mulher de
  lenço, o muladeiro, o comerciante, o sargento e o guarda manco.
