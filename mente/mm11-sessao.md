# MM11 · a sessão de prova — transcrição

> **Campanha:** *Prova da Mesa* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Heroína:** Iara do Vau — mulher, Meio-elfo ("Nascida na Encruzilhada"), Ladina (Assassino), Cartógrafa, Órfã da Estrada.
> Des +3 · Pre +4 · Per +2 · Vig +1. Conceito: *ladra de estrada que ainda procura quem a deixou*.
> **Respostas do Mestre: 49** (50 chamadas ao Narrador; a primeira é o Léxico). Um dia de jogo: 1 de Brumal, 08:00 → 17:46.
> **Jogada por:** o `jogo`, a 30/09, sobre `v9.332` (`5a269ea`), navegador do painel, campanha nova criada pela tela.
> **Como se conferiu:** um gancho em `fetch` guardou cada chamada a `/api/narrador` (o pedido inteiro e a resposta); cada
> resposta foi lida contra a pauta que o Narrador recebeu nesse turno e contra o save. O localStorage foi lido antes
> (`taverna_cfg_golpe_final=perguntar`, `taverna_cfg_rolagens=1`) e, no fim, com o jogo desmontado, apagou-se só
> `taverna_save_v1` — as duas chaves de antes ficaram com os mesmos valores, conferido por leitura.
> **Medida de passagem (pedida na MM8):** ao fim das 49 respostas, `npcs` = 9 pessoas, `canone` = 13 entradas.

Convenção: **J** é o que a jogadora escreveu (ou tocou, entre parênteses). **M** é o Mestre, encurtado com "…" e nunca
reescrito. `SISTEMA` são as linhas da tela que não são do Mestre. À margem, em *itálico*, o que esta fase tinha de provar.

---

## Parte 1 — a chegada

**M1** — A estrada desce até o portão e o vento traz o cheiro de cera quente e tinta fresca — Foz do Meio cheira a coisa
que se vende, não a coisa que se come. … a Guarda dos Portões olha cada rosto como quem conta moeda. Uma mulher de cabelo
preso em prego de osso aponta para minha trouxa: "Abre." … Dizem também do Poço de Sal, a sudeste daqui … ninguém que
entrou de noite voltou. … Eu vim por causa de uma carta sem assinatura … Dizia só "Delfina", e um nome que ardia por baixo
de tudo — um nome parecido com o que perdi … Quem mais pode saber de uma mulher de nome Delfina nesta cidade é Teodoro das
Tábuas, músico de canto, orgulhoso, sempre no Sino Calado. Então é para lá que eu vou …
`SISTEMA` Pessoas — o mundo começou a guardar quem você conhece. · (topo) 12 · 08:00 · 15
*— A ABERTURA (MM13), no turno 1: porque estou aqui (a carta), o que sei (Teodoro, no Sino Calado), o próximo passo (ir
lá). Sem nenhum Aceitar. As três, limpas.*
*— A narração inteira vem na primeira pessoa da heroína ("aponta para minha trouxa"). O Matt fala na segunda.*

**J2** — Abro a trouxa sem discutir e deixo a guarda revistar. Enquanto ela mexe, pergunto: "Que língua se fala mais por
aqui? A comum serve?"
**M2** — A guarda … tira a adaga de dentro da trouxa como quem desenterra uma raiz, gira uma vez entre os dedos e a devolve
sem cerimônia. "Serve, sim — a comum é o que se fala aqui. Mas você vai ouvir de tudo, porque todo mundo que chega traz a
própria língua na boca. Agora passa …" … quem pode saber mais dele está no Sino Calado.
`SISTEMA` O rasto de Delfina: Encontrar Teodoro das Tábuas ✓ (1/2) → agora: Procurar Delfina na Porta Aberta, em Alto do Sal
· Mercado — há quem venda por aqui. · Mural — … · **Aceitar: A estrada até Vila Maria** (Isolina do Lamento, 40)
*— PERGUNTA 1, a língua: **do sistema.** A pauta: "língua: a comum, e ouve-se de tudo — é a língua de quem vem de longe".*
*— **Defeito:** o passo "Encontrar Teodoro" fechou no portão. A pauta dizia "PRESENTES em Foz do Meio: Teodoro das Tábuas"
— a abertura registou-o como conhecido, e "presente" é quem vive na cidade. O mural abriu no turno 2, com Aceitar.*

**J3** — Sigo pela rua principal e pergunto ao menino do peixe seco onde fica o Sino Calado. Dou-lhe uma moeda se ele me
levar lá.
`SISTEMA` Floripes do Sino está em Campo das Cinco Torres. · Você está no Sino Calado.
**M3** — O menino … aponta o Sino Calado com o queixo e some … de dentro vem uma voz cantando sem pressa, errando a nota …
É mediano, e é da casa. … Teodoro das Tábuas está num canto, dedilhando o alaúde … "Você mudou alguma coisa desde a última
vez" … Isolina do Lamento, carpideira … "Fui eu que preguei um papel no mural das cinco torres. A estrada até Vila Maria.
Vê lá, se for do seu caminho." … **Pergunto a Teodoro por Delfina**, e ele franze a testa … "Delfina? Vive lá nas docas,
na Porta Aberta, em Alto do Sal. …"
`SISTEMA` Isolina do Lamento tem um trabalho no mural.
*— "Floripes do Sino": o sistema leu "Sino Calado" como procura de uma pessoa com esse sobrenome.*
*— O Mestre jogou por mim ("Pergunto a Teodoro por Delfina"). A pauta dizia que Teodoro "fala se lhe perguntarem".*
*— O mural entra na cena a pedido do sistema ("Encene em 1 ou 2 frases que a pessoa MENCIONA o serviço").*

**J4** — Sento-me ao lado do Teodoro e baixo a voz: "Quem é aquela mulher de preto que veio falar comigo? E desde quando o
senhor me conhece? Eu nunca pus os pés nesta cidade."
**M4** — "Aquela? Isolina do Lamento. Carpideira. Vive no Campo das Mães, mas anda por tudo quanto é canto. …" "Eu não
disse que te conhecia. Disse que você mudou." … "Branca não voltou da torre caída, ao sul daqui. Se topar, eu pago. Vivo,
de preferência."
`SISTEMA` 🔎 Encontrar Delfina — A Porta Aberta · 🗝 O que O Campo das Mães esconde — O Campo das Mães
*— PERGUNTA 2, quem é aquela: **do sistema** (registo: carpideira; o cartaz: em O Campo das Mães).*
*— O "você mudou desde a última vez" não é do Mestre: é a linha A GENTE da pauta ("repara em alguma coisa minha que mudou
desde a última vez") — um gesto de índole servido no primeiro encontro. Volta nos turnos 12, 18 e 20.*
*— Missão forçada: "Tirar Branca de lá" (de Teodoro), antes de a principal andar. Na pauta: "não voltou de a torre caída".*

## Parte 2 — a taverna

**J5** — Vou até o balcão e pergunto a quem está a servir: "Quanto custa um quarto para esta noite?"
`SISTEMA` causar boa impressão — dificuldade 8 (uma cortesia). Seu bônus: +4 · sem treino. → (Rolar) TESTE DE PERSUASÃO ·
DIFICULDADE 8 · SEM TREINO · ✦ VANTAGEM — PEGA O MAIOR · 16 · 17 · 17 + 4 = 21 · Sucesso → d20 → 17 + 4 = 21 vs dif. 8 ·
sucesso — com dez de folga — deu certo com folga, e a folga compra alguma coisa.
**M5** — Teodoro nota a minha expressão e larga o alaúde … "Branca da Troca. Estudante … Foi para a torre caída há dois
dias … Não voltou." … "Eu pago bem. Vinte moedas." … "Se for atrás dela, não se apresse a dar o seu nome. Dê primeiro
alguma coisa …" E depois, sem eu perguntar, acrescenta: "A torre caída fica a meio dia de caminhada daqui, para o
noroeste. …"
`SISTEMA` O rasto de Delfina: Encontrar Delfina ✓ (2/2) · **★ MISSÃO CONCLUÍDA: O rasto de Delfina — +81 moedas · +128 XP**
· Recompensa: Cuidadas Sandálias de Andarilho (Incomum) · Conquista desbloqueada: 📋 Primeiro Bico — título "o Mercenário"
*— **A PRINCIPAL DA CAMPANHA FECHOU NO TURNO 5.** Duas etapas "falar com" (Teodoro, Delfina), as duas `feito: true`. Delfina
está em Alto do Sal, a 146 km — a própria pauta diz "não entra nesta cena sem 120h de estrada narradas". Nunca a vi.*
*— PERGUNTA 3, o preço do quarto: **perdida.** A minha frase nunca chegou ao Narrador (nenhuma chamada contém "Quanto
custa"): o envelope social trocou-a por `Eu disse: "causar boa impressão"`. O Mestre respondeu a outra coisa.*
*— "Vinte moedas": inventado (a missão paga 57). "Meio dia, noroeste": contradiz o sistema (ao sul, 1,4 h) e o próprio M4.*

**J6** — Agradeço ao Teodoro e chamo a moça do pão: "Quanto é o quarto de cima, por uma noite?"
**M6** — A moça do pão para na escada … "O quarto de cima custa seis moedas por noite. Tem cama estreita, bacia e uma tranca
que geme, mas fecha. Comida à parte." … Isolina … "Vila Maria esta semana, se a estrada deixar." …
*— PERGUNTA 3, refeita: **do sistema, número a número.** PERGUNTOU pouso: "quarto comum ◉ 6 a noite, quarto bom ◉ 15 …"; a
planta: "o quarto de cima: cama estreita, bacia, tranca fraca". Quando a pergunta chega, o Mestre acerta.*

**J7** — Vou ao balcão, peço uma caneca de cerveja e pago. Pergunto à Rosalina: "Há quanto tempo a senhora tem o Sino
Calado?"
`SISTEMA` Floripes do Sino está em Campo das Cinco Torres.
**M7** — "O Sino Calado é mais meu que a minha própria sombra, faz uns nove anos. Comprei de um viúvo que só queria sumir.
Barato." … "A cidade mudou, mas o sino só toca na hora certa: seis da manhã, meio-dia, seis da tarde, nove da noite." …
"E não me chame de senhora. Rosalina, só Rosalina."
*— PERGUNTA 4, há quanto tempo tem a taverna: **inventado** ("nove anos", "um viúvo"). A PERGUNTOU casou a palavra "Sino" do
nome da casa e levou o sino das horas — que o Mestre usou, certo, mas não era a pergunta.*

**J8** — Bebo um gole e continuo com a Rosalina: "E quem mais trabalha aqui, além de você?"
**M8** — "Essa vadia não estava aqui ontem. Não me pergunte. Quem mais trabalha aqui? Eu, um cozinheiro surdo que me rouba
nos trocos, e um menino que varre e some. Às vezes o Teodoro faz de conta que ajuda." …
*— PERGUNTA 5, quem trabalha aqui: **inventado.** Nenhuma PERGUNTOU na pauta; o sistema sabe quem trabalha em cada casa
(MM8a) e não o mandou. O cozinheiro surdo passou a existir e voltou em M9 e M10.*

**J9** — Encosto-me ao balcão: "E quem é gente importante em Foz do Meio? Que família manda aqui, e o que se diz dela?"
**M9** — "Gente importante? A Casa da Água Alta. Já foi grande, hoje vive do nome e das dívidas. Os velhos ainda tiram o
chapéu …" Lá fora, **o sino toca uma vez, fora de hora, e cala de golpe.** Alguém na rua segura o passo, ninguém pergunta.
Teodoro … "Sino estranho, essa hora. Deve ser só o vento. Ou cobrança." …
*— PERGUNTA 6, a família: **do sistema, com a morada errada.** A PERGUNTOU trouxe "Casa da Água Alta (Campo Grande …)" — uma
casa de outra cidade; o Mestre deu-a como a de Foz do Meio.*
*— **O SINO, o prenúncio (MM13):** na pauta, "MOMENTO ao longe, o sino toca fora de hora e cala; ninguém diz porquê". Turno
9, depois de a heroína ter entrado, conversado e conhecido cinco pessoas. Bem narrado.*

**J10** — Volto para a mesa do Teodoro … "Eu vou à torre caída buscar a Branca. Mas não conheço o caminho nem a Branca.
Venha comigo — o senhor conhece-a, e ela confia em quem conhece." Olho-o nos olhos.
**M10** — "Você quer que eu vá buscar a Branca com você." … "E a torre caída fica a uma hora e meia a pé, sul daqui. Mas
eu não sou homem de estrada, do Vau. Sou de cadeira e corda." … "Vou com você até a metade do caminho." … "Espero um navio
que talvez não venha."
`SISTEMA` Tirar Branca de lá: Chegar a a torre caída ✓ (1/1) · **MISSÃO CONCLUÍDA: Tirar Branca de lá — +57 moedas · +89 XP**
*— **Defeito:** "Eu vou à torre" (dentro de um convite) foi registado como viagem — "[MOVIMENTO — REGISTRADO] AGORA estou na
torre caída", 08:35 → 09:59 — e a missão de uma etapa ("chegar") fechou. O Mestre ficou na taverna. Sistema e ficção
separaram-se aqui.*
*— "Uma hora e meia, sul": do sistema (1,4 h, ao sul).*

**J11** — Deixo uma moeda na mesa pela cerveja, pego a trouxa e saio com o Teodoro. Seguimos pelo atalho dos tanques de sal
em direção à torre caída.
`SISTEMA` O lance em O Sino Calado — entrou no diário.
**M11** — Teodoro paga as moedas com a mão seca … "Você trouxe a Branca. Isso paga o caminho. E o molhado." … A menina de
cesto senta-se no banco ao lado … e encosta a cabeça no ombro de Teodoro. … A noite vem chegando sem pressa …
*— **O mundo desfaz-se:** o sistema pôs-me de volta na cidade (10:04) e mandou narrar a missão paga; o Mestre obedeceu e
inventou que eu trouxe a Branca (a moça do pão virou Branca). Na mesma pauta: "[A HISTÓRIA VIROU] O arco saiu de 'O
Chamado' e entrou em 'A Travessia' … (concluí 'O rasto de Delfina'; concluí 'Tirar Branca de lá')"; "[O PASSADO VOLTA] …
reaparece: Delfina"; e uma terceira missão forçada. Anoitece às 10 da manhã.*

**J12** — Espera. Eu não saí daqui. Olho para a moça do cesto: "Tu és a Branca?"
**M12** — "Você mudou alguma coisa desde a última vez." … Isolina: "Não é hora de ir atrás de ninguém. É noite de feira …"
Branca da Troca ergue o queixo: "Não sou a que você procura. Eu sou a que sobrou."

*(fora da mesa: Gestão › Pessoas — Teodoro "recusaria", Isolina "recusaria", Delfina "recusaria", Branca "recusaria",
Rosalina "mais 13 dias de estrada juntos antes de decidir". Grupo: "Você viaja sozinho". A Ficha: "Nada equipado — de mãos
vazias". A Faca herdada é lembrança, não arma. Equipei as Sandálias.)*

## Parte 3 — a cidade

**J13** — Despeço-me com um aceno, saio do Sino Calado e vou à ferraria do Campo das Cinco Torres. Preciso de uma lâmina a
sério — a faca da minha mãe não é para usar.
**M13** — A forja … a ferreira, Carmela da Cripta, menina de braços queimados … "Está cedo para lâmina nova. Não me diga que
veio buscar a Branca." … "Se for para abrir o pacote do sino, ninguém abre. Se for para comprar, escolhe. Mas lâmina de
verdade, aqui, custa o que pesa." Ela indica a parede onde pendem facas, espadas curtas e um punhal …

**J14** — Aponto para as facas na parede: "Quanto custa uma adaga boa, equilibrada para lançar?"
**M14** — "Adaga equilibrada para lançar? Depende. Se você quer aço de verdade, falamos de doze moedas. Se quer ferro de
briga, seis." …
*— PERGUNTA 7, o preço da adaga: **inventado, e desmentido pelo painel.** A Ferraria não tem adaga nenhuma (sandálias,
elmos, botas, placas, escudo); a única arma da cidade é a Lâmina de Névoa, no Armazém, a ◉ 22. A pauta levava as bancas
cortadas em "e mais 4".*
*(painel: comprei a Lâmina de Névoa, ◉ 22, e 5 tochas, ◉ 5. "1D4 · FORÇA · LEVE" — a lâmina da Ladina bate pela Força.)*

**J15** — Pago a lâmina da feira, prendo-a à cintura e pergunto à Carmela: "O Poço de Sal, a sudeste — a quantos passos
daqui fica, e o que há lá dentro?"
**M15** — Carmela … entrega a Lâmina de Névoa … "Boa compra, do Vau." … Teodoro: "O lance em O Sino Calado. Você não
esqueceu o que disse que faria." … "O pôr do sol é a hora. …" "Você vem ou fica com a mão fechada?"
*— PERGUNTA 8, a quantos passos o Poço: **não respondida neste turno.** O sistema sabe que é uma mina de nível 4 com 9
salas; a PERGUNTOU levou outra vez o sino das horas. E "[O PASSADO VOLTA] alguém vem cobrar o que você disse que faria" —
eu nunca disse que faria nada.*

**J16** — Cruzo os braços e sorrio para o Teodoro, sem pressa: "Eu não prometi nada a ninguém, Teodoro. Mas conta-me o que
há nesse pacote e quem mais vai licitar, e talvez eu venha. Convence-me."
`SISTEMA` causar boa impressão — dificuldade 10 (… com tempo de sobra (−2)) … → TESTE DE PERSUASÃO · DIFICULDADE 10 · ✦
VANTAGEM · 20 · 19 · 20 + 4 = 24 · **Crítico!**
**M16** — Carmela: "Você não larga o osso, hein? … O Poço de Sal fica a sudeste, a uma hora e meia de lá. …" Teodoro:
"… Você fica de olho em quem aumentar a mão. Me diz quem são, e eu te pago o dobro do combinado." Isolina: "E eu, se você
fizer isso, durmo no quarto de cima uma noite, sem pagar." … Lino … "Cheirou a sal agora há pouco. Não era o mar."
`SISTEMA` 🔎 Encontrar Lino do Sino — Campo das Cinco Torres
*— A PERSUASÃO: a vantagem de Diplomata nato, o crítico, a cena abre-se. Mas o sistema reduziu a jogada a "causar boa
impressão", e o crítico não comprou o que eu pedi (o pacote continua sem conteúdo).*
*— PERGUNTA 8, um turno atrasada: "sudeste" do sistema; "uma hora e meia" inventado.*

**J17** — Deixo o Teodoro a falar sozinho e vou até à bancada de ervas. … "Cheirou a sal? O que queres dizer com isso — e
tu quem és?"
`SISTEMA` Você está no Cais do Sal.
**M17** — Teodoro … "O galpão do cais … Toda primavera chegam caixotes com selo de longe. Este ano, nenhum." Isolina: "O
mestre do porto é o Mafalda do Sino. …" (erra de propósito) … Não corrijo. … Lino: "Cheirou a sal fora do cais. Sal da
terra, não do mar. Alguém andou mexendo na mina." "Eu sou Lino, vendedor de raiz e folha. …"
*— Ir à banca ao lado mudou-me de bairro (o Cais do Sal). O "Não corrijo" é o Mestre a jogar a heroína (2.ª vez).*

**J18** — "Obrigada, Lino." Deixo-lhe uma moeda na banca. Tenho até ao pôr do sol. Saio pelo portão e vou a pé até ao Poço
de Sal, a sudeste, para ver com os meus olhos quem anda a mexer na mina.
`SISTEMA` O que A Porta Aberta guardava começa a sair, e a cidade toca a rebate.
**M18** — Lino: "… Foi a Delfina. Delfina da Névoa, que aqui ninguém quer nomear." … **o rebate começa. Um sino, três
pancadas**, e a cidade se lança às janelas. A Porta Aberta — o casco de um navio podre amarrado ao cais — range … um homem
de capa de lona … uma lanterna que queima um fogo cor de osso. … "Fechar as docas! O que a Porta guardava saiu!" …
"A cidade toca a rebate por tua causa, do Vau. O que vieste buscar, agora veio te buscar."
*— **O SINO, a escalada (MM13):** "[RELÓGIO COMPLETO] 'O rebate em Foz do Meio' (ameaça) encheu". Turno 18, depois de quatro
lugares e nove pessoas. Chegou como o mundo a empurrar. É o melhor momento da sessão.*
*— **Com a morada errada:** A Porta Aberta é em Alto do Sal (146 km); o Mestre inventou uma no cais. E "saio pelo portão"
foi recusado: "[LUGAR — RECUSADO] Você me tirou de onde eu estava … sem que eu tenha dito que saio."*

**J19** — Saco a Lâmina de Névoa e recuo para trás de uma pilha de caixotes, sem tirar os olhos do homem da lanterna. "Eu
não te conheço. Quem és tu, e o que saiu daquela porta?"
**M19** — "Quem eu sou não importa, do Vau. O que saiu daquela porta é antigo e estava preso com sal e ferrugem. …"
Teodoro: "É o recrutador. Delfina da Névoa. …" … "Se você quer achar quem mexeu na mina, comece ali dentro. É só você que
consegue entrar sem morrer."
*— O Cronista registou "Delfina da Névoa — recrutador" (um homem): um homónimo da Delfina da principal. O sistema aceitou-o
e, no turno seguinte, deu-lhe um cartaz no mural.*

## Parte 4 — o perigo

**J20** — Não guardo a lâmina. Vou até à porta do galpão e, antes de pôr o pé lá dentro, agacho-me e procuro armadilhas no
chão e no batente — fios, placas soltas, qualquer coisa.
`SISTEMA` Delfina da Névoa tem um trabalho no mural. · vasculhar o lugar — dificuldade 13 (obstáculo comum). Seu bônus: +2
· sem treino. → TESTE DE PERCEPÇÃO · 10 + 2 = 12 · Falha → ↯ Você revira o que dá e não encontra — e o lugar fica
remexido, o que qualquer um nota.
**M20** — Teodoro: "E você, do Vau, o que acha que saiu de lá? …" Branca: "Você mudou de novo. …" … Eu reviro o que posso
ali … Não encontro nada. …
*— Não havia armadilha (o galpão não é lugar da planta). Falhar por 1 foi falha por desenho (`semMeio: "falha"`).*

**J21** — Não respondo ao Teodoro. Entro no galpão devagar, com a lâmina à frente e as costas junto à parede, e deixo os
olhos habituarem-se ao escuro. O que há lá dentro?
`SISTEMA` Encontrei uma entrada: Santuário dos Sussurros. Vou explorar. · Você acende a primeira das suas 5 tochas. ·
◐ Santuário dos Sussurros — MÉDIO: é do seu tamanho: dá para ganhar, e vai doer. (122 de poder contra 131) · ENTRADA 1/7 ·
Cauteloso / Normal / Apressado · Procurar nesta sala · passagens: algo se move na escuridão · moedas soltas marcam o
caminho · algo importante foi guardado aqui · sair
**M21** — … caixotes com selo de longe empilhados até a viga, uma corrente no chão, e a marca de pés na poeira grossa, indo
da porta até uma arca de ferro no fundo. …
**M22** — (segunda resposta do mesmo turno) A porta do galpão pende, entreaberta, e atrás dela a escuridão respira como um
estômago. … Teodoro: "Se você for, eu desço contigo …" Isolina: "Eu espero aqui. Escuto." …
*— O galpão virou masmorra do sistema com outro nome, e a pauta dizia "NÃO invente o que há lá dentro"; o M21 inventou a
arca de ferro. O tamanho à vista antes de entrar (122 contra 131) é o veredito antes do clique — bom.*

**(J23: Cauteloso + "algo se move na escuridão")**
`SISTEMA` **a luta toma a tela** — CAMPO · 7×18 QUADRADOS DE 1,5 M · Slime a 25,5 m · Atacar Mover Esquivar Empurrar
Derrubar Saltar esperar Fugir · 1 GOLPE POR TURNO COM 1D6 (ATAQUE FURTIVO) · iniciativa Iara 12, Esqueleto 4, Slime 4
**M23** — O corredor do galpão afunila … um esqueleto de tíbia rinchando, armado de uma faca torta, e um slime que escorre
do vão da porta, mastigando restos de sal. …
*— No ecrã da luta não há caixa para perguntar ao Mestre: só "como? (opcional)", ao lado do "Agir →".*

## Parte 5 — a luta

**J24 (no "como?")** — Pergunto ao Mestre antes de agir: a quantos metros estão os dois de mim? E eles já me viram?
**M24** — O esqueleto e o slime não me veem. Estão virados para o fundo … A vinte passos de mim, o slime …; o esqueleto,
dezessete, meio encoberto por uma pilha de caixotes. Nenhum dos dois se mexe. …
*— PERGUNTA 9, a quantos metros: **do sistema, número a número** ("Slime a 20 m … Esqueleto a 17 m").*
*— PERGUNTA 10, eles viram-me: **do sistema** ("sem linha de visão, parede no meio"), e a cobertura do esqueleto também
("atrás de cobertura"). A MM2 chega e é usada.*
*— **Defeito:** a pergunta gastou a vez. A pauta levou "Turno dos inimigos (resolvido pelo sistema …)" e os dois andaram.*

**J25 (no "como?")** — Escondo-me atrás da pilha de caixotes, colada à sombra, sem fazer barulho.
`SISTEMA` TESTE DE FURTIVIDADE · DIFICULDADE 18 · ★ TREINADO · 16 + 7 = 23 · Sucesso
**M25** — (repete o parágrafo do M24 inteiro) … Minhas botas conhecem o chão do galpão: tábua que geme perto da dobradiça,
farpa de caixote solta, poça rasa no meio. As sombras têm corredor. … Eles não sabem que eu estou aqui. …
*— **ESCONDIDO (MM6):** o estado nasce (no save: "Fora da vista: vantagem no golpe contra quem não o viu …") e não gasta a
vez. A pauta não o diz ao Narrador neste turno; ele acertou pela prosa.*

**(J26: no "como?", "Avanço devagar pela sombra … na direção do esqueleto" → nada: o texto some, nenhuma chamada, a heroína
não se move. Depois: Mover → C12, "no fundo da sala, cobertura +2 · dá para chegar aqui"; e esperar.)**
**M26** — Teodoro me acompanha com os olhos … "Você voltou, mas não é a mesma. …" … O esqueleto … olha na minha direção, mas
não me vê. …
*— "esperar" preparou um contra-ataque sem o dizer: "[REAÇÃO — REVIDE RESOLVIDO] Meu contra-ataque acertou Esqueleto: 5 de
dano (ele está com 3 de 8)". O tabuleiro e o save continuaram a dizer 8 de 8. E atacar desfaz o escondido — perdi-o sem
saber.*
*— Teodoro dentro da masmorra, sem estar no grupo.*

**(J27: Atacar → Esqueleto)**
**M27** — … Eu aproveito a brecha e lanço a Lâmina de Névoa, mas a faca raspou no slime e caiu longe. … Meu golpe no
esqueleto passou por cima do ombro …
`SISTEMA` Slime erra o golpe · 🗡 contra-ataque · 0 PM — na mesma batida · deixar passar (e some antes de eu o tocar)
*— O Mestre fez-me atirar a lâmina, que continua empunhada.*

**(J28: Atacar → Esqueleto)**
`SISTEMA` Esqueleto (10 · crítico) cai sob o seu golpe. · **Como você faz isso? (opcional)** 0/240 · Poupar — cai
desacordado, vivo · Matar — não se levanta mais · Lembrar minha escolha
*(escrevi: "Saio da sombra colada às costas dele, meto a lâmina por baixo do crânio e torço até a cabeça se soltar da
espinha com um estalo seco." → Matar)*
**M28** — O esqueleto cai aos meus pés, os ossos se desfazendo em poeira e sal. No instante em que me endireito, o slime se
arremessa … e crava as presas no meu ombro … O veneno queima …
`SISTEMA` PV 12 → 5 · envenenado (falhou 6 + 2 = 8 vs 12)
*— **O GOLPE FINAL (MM3):** o cartão veio e a escolha valeu ("ACABOU DE Iara do Vau deu o golpe final em Esqueleto, e foi
para matar"). **O "como" não chegou**: nenhuma chamada contém a minha frase; o Mestre narrou outra morte.*

**(J29: Atacar → Slime · cartão)**
`SISTEMA` Slime (5) cai sob o seu golpe.
*(escrevi COM O TECLADO, o contador marcou 96/240: "Piso a massa com a bota e abro-a ao meio com a lamina, de cima a baixo,
como quem abre um peixe." → Matar)*
**M29** — A lâmina afunda no slime e ele se desmancha em poça cinzenta, cheirando a sal e limo. … No chão, perto da pedra
solta, alguma coisa brilha …: um frasco estreito de vidro escuro e um retalho de couro …
`SISTEMA` rodada 5 · 1 de pé contra você · Respirar fundo → · ◉ Espólios: +11 moedas · +24 XP · No chão: ⚗ Poção de Mana
Pequena, 🐗 Retalho de Couro — toque em EXAMINAR para recolher.
*— **O "como" não chegou pela segunda vez**, agora escrito à mão: procurei nas 99 chamadas gravadas; nenhuma tem "abre um
peixe". Não é o meu modo de escrever — é o caminho.*
*— "1 de pé contra você", com os dois mortos.*

**J30** — Examino o que caiu no chão e guardo o frasco e o couro. Depois encosto-me a um caixote, aperto o ombro e faço uma
pausa curta para recuperar o fôlego antes de seguir.
`SISTEMA` vasculhar o lugar — dificuldade 17 (**há algo escondido aqui**, e esta é a dificuldade dele). → 9 + 2 = 11 · Falha
**M30** — … Afasto a lona, reviro as tábuas soltas … Nada. Só poeira, sal grosso e um carretel de linha podre. …
*— Apanhar o espólio que o sistema anunciou virou procurar um segredo, a linha do dado denunciou que havia um, e o Mestre
disse que não havia nada no chão. A pausa curta foi engolida. Nunca achei o EXAMINAR.*

**(J31: passagem "silêncio bom demais para ser natural")**
`SISTEMA` Passo cauteloso: 2 tochas queimadas — restam 1. · ENIGMA · Teste de mecanismo · dif. 15 — abrir uma porta com três
alavancas e uma inscrição gasta · +5 → **1 + 5 = 6 · Desastre!**
**M31** — … Puxo a primeira, a segunda, e quando empurro a terceira, o pé escorrega numa poça que não vi. Caio feio … Enquanto
me levanto, noto: uma das alavancas está polida de tanto ser usada, o brilho diferente das outras duas.
*— **O PERIGO COM TESTE:** o 1 natural derruba (CAÍDO), e a sala ensina — "A sala me ensinou uma coisa", e o botão seguinte
diz "−2 na dificuldade". É o momento mais Matt da sessão: falhar abre caminho.*

**J32** — Levanto-me, limpo a mão nas calças e desta vez não toco nas outras duas: puxo só a alavanca polida, devagar, até
ao fim.
**M32** — A alavanca polida desce até o final com um estalo seco … Teodoro aparece à porta … Isolina, atrás, erra de
propósito: "O farol apagado fica a meio dia daqui, não é?" … A alavanca treme uma vez …
*— Usar a pista por palavras não mexe no enigma: fica "POR RESOLVER", sem dado. Só o botão resolve.*

**(J33: Tentar o mecanismo de novo)** `SISTEMA` DIFICULDADE 13 · 11 + 5 = 16 · Sucesso
**M33** — A tranca cede com um estalo que parece mastigar o silêncio. … um corredor de pedra se estende para a escuridão …
Isolina: "É melhor você ir na frente … A gente segura a porta." …

**(J34: Normal + voltar (Combate))**
**M34** — A última tocha estala e morre … Do fundo, dois vultos se descolam das sombras — o esqueleto range primeiro … e o
slime escorre atrás … Teodoro: "Eles não cansam …" Isolina puxa Branca para perto …
`SISTEMA` a mesma luta: Esqueleto 8/8 e Slime 4/4 a 25,5 m, iniciativa nova. PV 5/12.
*— **Voltar a uma sala limpa refaz a luta**: os mesmos dois que matei. E, no turno seguinte, o sistema contradiz-se:
"[CORREÇÃO DO SISTEMA — QUEM MORREU, MORREU] Você pôs slime, esqueleto agindo em cena. O registro … marca … como MORTA".*
*— Três "companheiros" atrás de mim (Teodoro, Isolina, Branca) que o Grupo diz não existirem.*

(teclei no "como?", sem enviar: "Grito para o escuro: rendam-se, ou acabo convosco como da outra vez!" → a linha do veredito:
**"Isto não tem medo nem razão para ouvir."** — *a MM9 diz antes do clique que esqueleto e slime não se rendem. Apaguei.*)

**J35 (no "como?")** — Encolho-me no escuro atrás dos caixotes e fico quieta, escondida.
**M35** — Branca …: "Fica quieta. Eles farejam. Deviam ter ficado mortos." …
*— "fico escondida" não esconde (nenhum teste) e gastou a vez.*

**J36 (no "como?")** — Escondo-me atrás dos caixotes. `SISTEMA` 16 + 7 = 23 · Sucesso
**M36** — Eu me encolho atrás dos caixotes, imóvel, e o escuro me esconde. … O slime … para a dois passos dos caixotes.
Nenhum me vê. …

**(J37: Esquivar)**
**M37** — … de repente a cabeça emplumada de sal vira na minha direção. Ele me viu. O slime … também me vê. …
*— O escondido caiu sem eu agir: "[ACHADO] Slime tem você à vista, sem nada no meio" — no escuro total e com "Slime a 14 m
(atrás de cobertura)" na mesma pauta. A escuridão não entra em quem me vê.*

**(J38: Mover → B14; Atacar → Esqueleto (erro desastroso); inimigos; contra-ataque)**
**M38** — Erro o golpe … revido na mesma batida, a faca entrando entre as costelas de osso, e ele estala, parte do ombro
solta. … O esqueleto me olha sem olhos, o peito fendido …
*— **O revide contado e não aplicado, segunda vez:** "acertou Esqueleto: 4 de dano (ele está com 4 de 8)", e o tabuleiro,
logo a seguir, "A13 · Esqueleto, 8 de 8 PV". O Mestre narra um peito fendido num esqueleto inteiro.*

**(J39: Atacar → Esqueleto · cartão, com o teclado, 103/240: "Agarro-o pela mandibula e esmago o cranio contra a quina de um
caixote ate a luz se apagar nas orbitas." → Matar)**
**M39** — O esqueleto se desfaz em pó de ossos e sal … Teodoro: "Ela fez o que a Porta não fez." …
*— **O "como" não chegou pela terceira vez.** Nesta pauta nem a linha ACABOU veio. A caixa do cartão fica acima do ecrã
(y −85) no painel de 310 px: escreve-se às cegas.*

**(J40: Atacar → Slime · cartão → Poupar, sem texto)**
**M40** — O slime se desfaz em poça cinzenta e não se mexe mais. … Teodoro: "Vai pegar? … Ou vai deixar para quem voltar?" …
*— Poupar um slime (e o cartão oferece "desacordado, vivo" a um esqueleto): o Mestre narrou-o morto.*

**(J41: sair)**
**M41** — A fuga é rápida: deixo o corredor escuro para trás … Teodoro aparece à soleira … "Boa hora para sair. A maré está
subindo." …
*— "sair" é "[MASMORRA — FUGA] Eu ESCOLHI fugir … abandono conscientemente as salas e tesouros" — sem o dizer antes do
clique. O espólio ficou no chão.*

## Parte 6 — a noite que não chega

**J42** — Volto ao Sino Calado a pé … "Quero o quarto de cima até ao pôr do sol. Aqui estão as seis moedas." E pouso-as no
balcão.
**M42** — … as seis moedas soam na madeira. Ela as arrasta para perto … "Tá limpo, e a tranca aguenta um empurrão, não dois.
Se quiser, tem água quente. Mas é mais uma lasca." Teodoro: "Já sabe o caminho, hein?" …
`SISTEMA` O lance em O Sino Calado: Chegar a O Sino Calado ✓ (1/1) · **MISSÃO CONCLUÍDA: O lance em O Sino Calado — +57
moedas · +89 XP** · Talentos — você tem o que gastar.
*— **A terceira missão fechou por entrar na taverna**, às 13:14; o lance era ao pôr do sol. As três missões desta sessão
fecharam todas sem se jogarem. Subi a nível 2 e a vida foi a 18.*
*— Na mesma pauta: "[LUGAR — RECUSADO] … continuo LÁ [no galpão]" e "[MOVIMENTO — REGISTRADO] … AGORA estou no Sino
Calado". Do galpão "nos arredores (ir e voltar leva HORAS)" à taverna: 10 minutos.*

**J43** — Antes de subir, viro-me para a Rosalina: "Hoje de manhã tocaram três pancadas fora de hora. Para que toca o sino
assim, aqui em Foz do Meio?"
`SISTEMA` A noite em claro em O Sino Calado — entrou no diário. Esta é do Mestre: não se recusa. · … De volta a Foz do Meio —
Sino Calado fica para trás.
**M43** — Antes de subir, viro-me para Rosalina e pergunto pelas três pancadas fora de hora. … "O sino das horas não toca
fora de hora há anos — e se tocou, é porque alguém puxou a corda." Teodoro: "Não é a corda. É o que vive atrás do sino. …"
Ele desliza seis moedas pelo balcão até mim. …
*— PERGUNTA 11, para que toca o sino: **contradiz o sistema.** O relógio do rebate tocou às 10:49 (o sistema disse-o; o
Mestre narrou-o no M18); a PERGUNTOU trouxe só o sino das horas, e a taverneira nega o que a cidade inteira ouviu.*
*— Quarta missão forçada em 43 respostas ("Esta é do Mestre: não se recusa" — o sistema a falar de si). A taverna passou,
por um turno, a ser "FORA DA CIDADE".*

**J44** — Guardo as moedas e olho o Teodoro de frente: "Há quanto tempo tocas aqui no Sino, Teodoro? E de onde vens?"
**M44** — "Toco aqui desde antes do rebate. E vim de onde o sal nasce, lá para o sul — da beira da névoa." … "Mas isso não é
da sua conta. Esta noite é." …
*— PERGUNTA 12, o passado de alguém: **inventado.** A PERGUNTOU levou, pela sexta vez, o sino das horas; o passado de Teodoro
(MM8a, "há N anos") existe e não foi.*

**J45** — "Fico esta noite", digo ao Teodoro. Subo ao quarto de cima, tranco a porta, deito-me de botas calçadas e durmo até
ao pôr do sol, com a lâmina ao alcance da mão.
**M45** — … O quarto de cima é apertado: uma cama estreita, uma bacia de água escura, uma veneziana … reparo na janela dos
fundos, aquela que dá para a escada externa. Eu podia ter subido por lá.
*— Dormir é um botão do relógio, não uma frase: nenhum tempo passou (13:30).*

**(J46: O tempo › Esperar 4h)**
**M46** — As quatro horas passam dentro do quarto de cima … Perto do pôr do sol, alguém para ao pé da escada e fica parado
um momento, sem subir. … O silêncio volta, e eu abro os olhos.

**J47** — Desço ao salão com a lâmina à cintura e sento-me num canto, de costas para a parede … Peço um caldo à Rosalina e
fico a ver quem entra.
`SISTEMA` ◐ Fortaleza da Serpente — MÉDIO … (150 de poder contra 179) · ENTRADA 1/6 · passagens …
**M47** — … Rosalina traz na caneca de sempre … "Tu paga quando quiser, ou quando eu lembrar." … Alguns homens na mesa do meio
ficam calados quando me veem … Teodoro … Ele está esperando alguém.
**M48** — (segunda resposta do mesmo turno) Desço ao salão … A entrada do porão, atrás do balcão, está agora coberta por um
pano grosso … "De noite, o salão cheira a maré, mesmo com a porta fechada."
*— **Descer ao salão da taverna abriu uma masmorra** ("[MASMORRA ABERTA PELO SISTEMA] Eu entrei no covil"). O salão passou a
ser "(aqui isto é um Cripta)".*

**J49** — Não me mexo do canto. Chamo a Rosalina com dois dedos e pergunto baixo: "Quem são aqueles da mesa do meio, que se
calaram quando eu desci?"
**M49** — O estalar da lenha no fogo corta o salão antes de qualquer palavra. … "Aqueles? … são os que pagam para não ter
nome." Teodoro afina a corda … Isolina …: "Você sempre escolhe o canto de onde vê todas as portas."
*— PERGUNTA 13: ficção livre (figurantes do próprio Mestre). Aceitável.*

*(Fim da sessão às 17:46 do dia 1. A noite em claro ficou por viver.)*

---

## As perguntas, contra o sistema

| # | turno | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | 2 | que língua se fala? | "a comum … você vai ouvir de tudo" | **sistema** | ficha da cidade (MM12), PERGUNTOU |
| 2 | 4 | quem é aquela? | "Isolina do Lamento. Carpideira. Vive no Campo das Mães" | **sistema** | registo + cartaz do mural |
| 3 | 5 | quanto custa o quarto? | (não respondeu — falou da Branca) | **perdida** | a frase foi trocada por "causar boa impressão" |
| 3b | 6 | quanto é o quarto de cima? | "seis moedas … cama estreita, bacia e uma tranca" | **sistema** | PERGUNTOU pouso (6) + planta do prédio |
| 4 | 7 | há quanto tempo tem a taverna? | "uns nove anos. Comprei de um viúvo" | **inventado** | a PERGUNTOU levou o sino das horas |
| 5 | 8 | quem trabalha aqui? | "um cozinheiro surdo … e um menino que varre" | **inventado** | nenhuma PERGUNTOU (MM8a sabe e não foi) |
| 6 | 9 | que família manda, o que se diz? | "Casa da Água Alta … vive do nome e das dívidas" | **sistema, morada errada** | a casa é de Campo Grande |
| 7 | 14 | quanto custa uma adaga? | "doze moedas … ferro de briga, seis" | **inventado, desmentido** | a Ferraria não tem adaga; a única lâmina é 22 |
| 8 | 15–16 | a quantos passos fica o Poço? | (um turno depois) "a sudeste, a uma hora e meia" | **metade** | rumo do cânone; a distância não chega ao Narrador |
| 9 | 24 | a quantos metros estão? | "a vinte passos … o esqueleto, dezessete" | **sistema** | linha da luta (MM2): 20 m, 17 m |
| 10 | 24 | eles viram-me? | "não me veem … meio encoberto por caixotes" | **sistema** | linha de visão e cobertura (MM2) |
| 11 | 43 | para que toca o sino (fora de hora)? | "não toca fora de hora há anos" | **contradiz** | o rebate tocou às 10:49; a PERGUNTOU só tinha o sino das horas |
| 12 | 44 | há quanto tempo tocas, de onde vens? | "desde antes do rebate … do sul, da beira da névoa" | **inventado** | a PERGUNTOU levou o sino outra vez |
| 13 | 49 | quem são aqueles? | "os que pagam para não ter nome" | ficção livre | figurantes do Mestre |

*Tenho cobertura?* não se perguntou por palavras: a resposta está no nome de cada casa do tabuleiro ("cobertura +2") e o
Mestre usou-a sem lha pedirem (M24).

**A conta:** das 12 perguntas com resposta no mundo, **5 saíram do sistema, número a número** (1, 2, 3b, 9, 10), **2 saíram
pela metade** (6, 8), **4 foram inventadas** (4, 5, 7, 12), **1 contradisse o sistema** (11) e **1 perdeu-se** (3). **A
regra que a sessão mostra é a da fase, afinada:** quando o fato certo chega à pauta, o Mestre acerta sempre; o que falha é
**o encaminhamento** — a palavra "sino" sequestra a PERGUNTOU seis vezes (está no nome da taverna), o envelope social come a
frase do jogador, e a PERGUNTOU leva uma coisa por turno e às vezes a de outra cidade.

---

## O que a sessão tinha de provar

| item | aconteceu? | como / porquê |
|---|---|---|
| **a abertura: porque estou aqui, o que sei, o próximo passo — sem Aceitar** | **sim** (T1) | as três no primeiro turno; mas o mural abriu no T2 porque o primeiro passo fechou no portão |
| **o sino depois de explorar** | **sim** | prenúncio no T9, rebate no T18, depois de quatro lugares e nove pessoas — mas apontado para A Porta Aberta de outra cidade |
| **o golpe final do companheiro (MM3b)** | **não apareceu** | não há companheiro possível numa sessão: quatro "recusaria" e a taverneira "mais 13 dias". O grupo que a narração mostra (Teodoro, Isolina, Branca) é fantasma |
| **o golpe final do herói (MM3)** | **meio** | o cartão veio 4 vezes e a escolha valeu; o "como" que a jogadora escreve **não chegou nenhuma vez em 3** |
| **uma rendição completa (MM9)** | **não apareceu** | os únicos inimigos foram esqueleto e slime. O veredito antes do clique funcionou: "Isto não tem medo nem razão para ouvir." |
| **escondido com vantagem numa luta (MM6)** | **não provado** | o estado nasce e não gasta a vez; o primeiro "esperar" disparou um contra-ataque que, pela regra (atacar desfaz), o terá gastado antes do meu golpe — não o vi acontecer; o segundo foi achado no escuro total, sem eu agir |
| **um atirador a manter distância (MM7)** | **não apareceu** | nenhum inimigo de distância nas duas lutas |
| **perguntas como as do Matt (umas dez)** | **13 feitas** | ver a tabela: 5 certas, 2 pela metade, 4 inventadas, 1 contradita, 1 perdida |
| **persuasão** | sim (T5, T16) | com vantagem de Diplomata, e um crítico; mas as duas reduzidas a "causar boa impressão" |
| **armadilha ou perigo com teste** | sim (T31–33) | o enigma das alavancas: o 1 natural derruba e ensina; a pista dita por palavras não conta |
| **uma luta** | sim, duas (a mesma, duas vezes) | T23–T29 e T34–T40 — a segunda é a primeira ressuscitada |

A sonda de MM1 não a corri: é do ciclo.

---

## Os defeitos, pela ordem em que partem a sessão

1. **As missões fecham sozinhas, e a história corre sem ser jogada.** A principal da campanha fechou no **turno 5** sem eu
   ver a Delfina (a 146 km): `falar_com` conta como feito quem a pauta dá como "presente". "Tirar Branca de lá" fechou no
   **T10** por uma frase no futuro; "O lance" fechou no **T42** por entrar na taverna horas antes do lance. No **T11** a
   espinha passou de "O Chamado" a "A Travessia" por essas missões. *Visto:* as linhas ✓ e MISSÃO CONCLUÍDA na tela, e
   `missoes[].etapas[].feito` no save. É o que parte a sessão primeiro: depois do T5 a campanha já não tinha o que procurar,
   e depois do T11 o Mestre narrava coisas que não aconteceram ("Você trouxe a Branca").
2. **O lugar da heroína e o da narração separam-se.** Uma intenção vira viagem (T10); "saio pelo portão" é recusado (T18); a
   taverna passa a ermo e volta (T43–T44); o galpão (T21) e **o salão da própria taverna (T47)** abrem masmorras; a mesma
   pauta traz "continuo LÁ" e "AGORA estou aqui" (T42). *Visto:* ONDE e RODAPÉ de cada pauta contra a jogada.
3. **Voltar a uma sala limpa ressuscita os inimigos** (T34), e o mesmo sistema avisa o Narrador de que estão mortos.
   *Visto:* a mesma luta, os mesmos PV, e a "[CORREÇÃO … QUEM MORREU, MORREU]" no turno seguinte.
4. **O "como você faz isso?" do golpe final não chega ao Narrador** — 3 em 3, duas delas escritas com o teclado. *Visto:*
   procurei a frase nas 99 chamadas gravadas. Hipótese para quem conserta, não verificada: a cena é a segunda linha do
   `acabou` (`envelopeDoGolpeFinal`) e o corte da pauta por prioridade leva-a; o `App.jsx` passa o texto certo.
5. **O revide do contra-ataque é contado ao Narrador e não é aplicado** — 2 em 2 (T26: "3 de 8"; T38: "4 de 8"; o tabuleiro
   dizia 8 de 8 nas duas). O Mestre narra feridas que o tabuleiro não tem.
6. **A pergunta perde-se no caminho.** O teste social substitui a frase do jogador (T5); a palavra "sino" sequestra a
   PERGUNTOU seis vezes; a casa notável sai de outra cidade (T9); o passado das pessoas (MM8a) e quem trabalha na casa não
   chegam (T8, T44). É a régua desta fase, e é aqui que ela falha.
7. **Perguntar ao Mestre numa luta gasta a vez** (T24), e no ecrã da luta não há outro sítio para perguntar; um movimento
   escrito é engolido em silêncio (T26); "esperar" é um contra-ataque que ninguém anuncia.
8. **O mundo empurra histórias em série:** quatro missões do sistema em 43 respostas, e "[O PASSADO VOLTA] … o que você disse
   que faria" duas vezes sem eu ter dito nada. É o cardápio da MM13 com outra roupa.
9. **As pessoas da cidade seguem a heroína.** As linhas A GENTE põem Teodoro, Isolina e Branca em cada cena, incluindo dentro
   da masmorra; "você mudou desde a última vez" no primeiro encontro (4 vezes).
10. **Nomes que colidem e moradas trocadas:** o homónimo "Delfina da Névoa" (T19), o sino apontado para A Porta Aberta de Alto
    do Sal (T18), "Floripes do Sino" e "Lino do Sino" a confundirem o detector de procura.
11. **Miúdos, mas à vista:** a Ladina começa sem arma; o espólio não se apanha por palavras e a linha do dado denuncia "há
    algo escondido aqui" (T30); o Mestre joga a heroína ("Pergunto a Teodoro por Delfina", "Não corrijo", "lanço a Lâmina");
    um parágrafo repetido palavra por palavra (M25); "fico escondida" não esconde; Poupar oferecido a esqueleto e slime; a
    caixa do cartão fora do ecrã a 310 px; "1 de pé contra você" com todos mortos; o passo cauteloso come 2 tochas sem o
    dizer; o "sair" da masmorra é fuga sem aviso; as correções de cânone disparam sobre "menina" e "que ninguém quer nomear".

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Ainda não.**

O que já é do Matt: **a voz** (sensorial, com gente que fala como gente, e prosa que não se repete), **a abertura** (razão,
pista e passo no turno 1, sem cardápio), **o sino** (prenúncio e rebate no tempo certo), **o tabuleiro dito em palavras**
(distância, linha de visão e cobertura, número a número), **a cidade por dentro** (a língua e o quarto, número a número),
**o falhar que ensina** (o enigma das alavancas) e **o veredito antes do clique** (a masmorra do meu tamanho, o bicho que
não se rende). Quando o fato certo chega, o Mestre nunca erra.

O que falta é o que o Matt nunca perde e nós perdemos a cada meia dúzia de turnos: **a continuidade.** Ele sabe onde os
jogadores estão, o que já aconteceu e o que lhe perguntaram. Aqui é o próprio sistema que a parte — fecha a história antes
de ela se jogar, muda a heroína de sítio, ressuscita os mortos, e deixa cair a frase do jogador no único momento em que ela
é a estrela. A sessão partiu no **turno 5** e não se recompôs.

**A proposta ambiciosa, para a pessoa decidir (pesado — muda o fluxo):** *a pergunta ao Mestre é uma jogada à parte.* Ao
lado da caixa de texto, um gesto "perguntar" que **nunca gasta tempo nem a vez** (na luta e fora dela), vai direto a um
encaminhador que junta **todas** as fichas que a pergunta toca (cidade, pessoa, casa, loja, tabuleiro, cânone) em vez de
uma por turno, e responde numa linha curta do Mestre, separada da narração — como quem responde do outro lado da mesa. É o
que o Matt faz 157 vezes em C1E1, e é o sítio exato onde esta sessão perdeu 7 das 12 perguntas.
