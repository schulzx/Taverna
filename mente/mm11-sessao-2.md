# MM11 · a segunda sessão de prova — transcrição (PARCIAL)

> **Campanha:** *Prova da Mesa II* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Heroína:** Brites Ferrolho — mulher, Anã (Montês), Guerreira (Cavaleiro), Médica de Campo, Soldado Reformado.
> Pontos: Força +2 · Vigor +1 · Presença +2 · Percepção +1 (e a raça: +2 Vigor, +1 Força). Conceito: *ex-soldada da guarda
> de fronteira que vende o escudo para pagar a dívida da irmã*. Outra classe, outra raça, outro antecedente que a Iara.
> **Respostas do Mestre: 10 de 25–30 pedidas. A sessão parou no turno 11** — não por defeito do jogo: a API em produção
> respondeu **HTTP 429, "Limite diário alcançado (500 chamadas)"**, ao Cronista e ao Narrador, no mesmo turno. Um dia de
> jogo: 1 de Brumal, 08:00 → 08:50.
> **Jogada por:** o `jogo`, a 30/09, sobre `v9.340` (`187b6f8`), navegador do painel (374×310), campanha nova criada pela tela.
> **Como se conferiu:** um gancho em `fetch` guardou cada chamada a `/api/narrador` (o pedido inteiro e a resposta) — 37
> chamadas: 1 Léxico, 11 ao Narrador (a última recusada pelo limite), 4 falas de personagem, 21 leves (o Cronista e
> outras). Cada resposta foi lida contra a pauta desse turno e contra o save. O localStorage foi lido antes
> (`taverna_cfg_golpe_final=perguntar`, `taverna_cfg_rolagens=1`) e, no fim, **com o jogo desmontado** (a aba levada a uma
> página do mesmo endereço sem o app), apagou-se só `taverna_save_v1` — as duas chaves de antes ficaram com os mesmos
> valores, conferido por leitura.
> **Medida de passagem (MM8):** ao fim das 10 respostas, `npcs` = 6 pessoas, `canone` = 4 entradas (a primeira: 9 e 13 ao
> fim de 49).

Convenção: a da primeira. **J** é o que a jogadora escreveu (ou tocou, entre parênteses). **M** é o Mestre, encurtado com
"…" e nunca reescrito. `SISTEMA` são as linhas da tela que não são do Mestre. À margem, em *itálico*, o que se provou ou
partiu. A hora do relógio vai entre parênteses retos, porque desta vez ela é prova.

---

## Parte 1 — a chegada

**M1** [08:00] — Runa do Poço te recebe pelo cheiro antes de qualquer outra coisa: cera quente, tinta fresca e um perfume
doce … Quem manda aqui é o conselho de marcas, e a lei deles é uma só: tudo vira gomo, até a alma, se tu não pagar o que
deve. … Dizem que perto daqui fica o Sepulcro de Cinzas, e que criança some quando a neblina desce. … Tu não veio por acaso.
Antes de morrer, alguém a quem devia a vida te pediu: acha Otávio do Sal. … Tudo que sabia: aprendiz, trabalha no Tesouro
sem Fio. … O Tesouro sem Fio fica no fim da rua da forja, onde o martelo não para nem na primavera.
*— A ABERTURA (MM13), no turno 1: a razão (a dívida de vida), a pista (Otávio, aprendiz, no Tesouro sem Fio) e o passo (a
rua da forja). Sem Aceitar, sem mural. Limpa, como na primeira.*
*— A voz veio na segunda pessoa ("tu vê", "te recebe") — a primeira sessão foi toda na primeira. Não é defeito a
consertar (a questão está com a pessoa); fica anotado que mudou, e que escorrega para a terceira em M5 ("Otávio encara
Brites").*

**J2** — Cumprimento a guarda com um aceno de soldada e pergunto-lhe: "Quem manda de facto nesta cidade? E esse Sepulcro de
Cinzas, a quanto tempo daqui fica?"
**M2** [08:00] — A guarda te encara com o cansaço de quem já viu soldado demais … "Quem manda? O conselho de marcas, e a
guarda fiel da coroa. As patrulhas de cada bairro respondem a eles. Mas manda mesmo é quem paga o tributo." … "O Sepulcro
fica a noroeste, passada a boca da mina. Umas duas horas a pé, se a neblina não descer." … Outra guarda, mais velha, corta:
"Pare de assustar a moça. …"
`SISTEMA` Mercado — há quem venda por aqui.
*— **PERGUNTAR É DE GRAÇA (v9.336): aguentou.** Duas perguntas, e o relógio ficou nas 08:00.*
*— PERGUNTA 1, quem manda: **do sistema.** O Léxico ("Manda o conselho de marcas") e a PERGUNTOU ("quem guarda a lei: a
guarda fiel da coroa, e as patrulhas de cada bairro").*
*— PERGUNTA 2, a quanto tempo o Sepulcro: **inventado.** A pauta só tinha "Masmorras da região: ⚰ Sepulcro de Cinzas
(cripta, nível 11, 11 salas)", sem rumo nem distância; a resposta de distância da v9.336 não disparou para uma masmorra. O
Mestre colou-lhe o rumo da boca da mina (a noroeste, 3,2 km) e inventou as horas.*

## Parte 2 — a forja

**J3** — Agradeço com a cabeça e subo a ladeira pela rua da forja até ao Tesouro sem Fio. Entro … e procuro um aprendiz
chamado Otávio.
`SISTEMA` Otávio do Sal está aqui — O Tesouro sem Fio. · Você está no Tesouro sem Fio. · 🔎 Encontrar Otávio do Sal
**M3** [08:05] — A porta do Tesouro sem Fio range como dobradiça de navio … uma tenaz largada ali por pressa, a boca ainda
quente … vês o aprendiz: Otávio do Sal, magro, as mãos escuras de fuligem … "Tu veio pela forja ou por mim?"
*— O marco da espinha ("Encontrar Otávio") ficou feito aqui, **estando com ele** — nem no portão (onde o nome se disse no
T1), nem antes. **As missões que fechavam sozinhas (v9.333): aguentou.***

**J4** — Tiro o capuz e sento-me num caixote, sem pressa. "Por ti. Um velho companheiro de armas mandou-me atrás de ti antes
de morrer, e eu devia-lhe a vida." … "Há quanto tempo trabalhas aqui, Otávio? E de onde vens?"
**M4** [08:10] — "Três anos. Herdei as ferramentas e as dívidas da família. Sou Vélios, se é isso que pergunta." … "Mas esse
seu velho companheiro... quem era ele?" …
`SISTEMA` O rasto de Otávio do Sal: Encontrar Otávio do Sal ✓ (1/1) · ★ MISSÃO CONCLUÍDA: O rasto de Otávio do Sal — +69
moedas · +108 XP · Mural — … · Aceitar: Quem Otávio do Sal perdeu (assina Otávio do Sal, 65, 8 noites)
*— PERGUNTA 3, há quanto tempo: **do sistema, palavra por palavra** ("PERGUNTOU Otávio do Sal está no posto há 3 anos:
herdou as ferramentas e as dívidas da família"). Nenhum d100: **o que a ficha sabe não se rola (v9.340): aguentou.***
*— PERGUNTA 4, de onde vens: **metade.** O povo da ficha (Vélios), não um lugar — e o Mestre esquivou-se às claras ("se é
isso que pergunta") em vez de inventar. É a melhor forma de não saber.*
*— A missão fechou **jogada**: estive com ele e falei-lhe. O mural abriu depois, e o cartaz ficou no mural — ninguém mo
empurrou.*
*— Na mesma pauta: "[CORREÇÃO DO SISTEMA — CÂNONE: QUEM É QUEM] … você o chamou de 'magro'" — um adjetivo lido como troca
de ofício (a família do "menina" da primeira).*

**J5** — "Um sargento da fronteira. Só me deu o teu nome e pediu que te encontrasse." … "E quem mais trabalha nesta forja,
além de ti? O mestre ferreiro não está?"
**M5** [08:15] — "O mestre desceu ao cais buscar remessa. Nero do Couro." … "Lino do Altar também passa por aqui, mas é
encomenda, não trabalho." — Otávio encara Brites por cima do balcão … "Túlio da Runa sumiu no caminho de Gomo do Ermo. Eu
queria notícia. Qualquer uma. Paguei um cartaz no mural, se te servir." … Lá fora, um sino de guarda tilinta uma vez …
`SISTEMA` Otávio do Sal tem um trabalho no mural.
*— PERGUNTA 5, quem trabalha aqui: **do sistema, nome a nome** ("Otávio do Sal (aprendiz), Nero do Couro (ferreiro(a)), Lino
do Altar (encomendante impaciente)"). Na primeira sessão esta pergunta pariu um cozinheiro surdo.*
*— PERGUNTA 6, o mestre não está?: **inventado** ("desceu ao cais") — a pauta não diz onde Nero está.*
*— O cartaz entra na cena como a pauta pede: mencionado, sem oferta. Bem.*
*— **"Túlio da Runa" e Túlio, o músico da cidade, viraram a mesma pessoa.** A partir daqui a lista da cidade traz
"Túlio ✓" (conhecido) sem eu o ter visto — e, dois turnos depois, a ficha dele diz "de folga hoje: em casa". O homem que
sumiu na estrada está em casa. É a regra nova dos nomes (v9.338: primeiro nome igual = a mesma pessoa) a acertar no alvo
errado.*
*— O "[LUGAR — RECUSADO PELO SISTEMA] Você me tirou de onde eu estava — O Tesouro sem Fio" chega nesta pauta pela primeira
vez. O Narrador não me tirou de sítio nenhum. Ver o defeito 2.*

**J6** — "Vou pensar no teu cartaz." Aponto com o queixo para o que está pendurado na parede. "Quanto custa um escudo aqui,
se tiverem algum à venda?"
**M6** [08:15] — "Escudo aqui não tem à venda, não. Nem na forja, nem em banca nenhuma." … "Se quiser, no pátio da têmpera
há meia dúzia deles, mas são encomenda já paga." …
*— PERGUNTA 7, o preço do escudo: **do sistema** ("não há escudo à venda em Runa do Poço, e nenhuma banca daqui vende
escudos"). A meia dúzia encomendada é enfeite do Mestre, e não vende nada.*
*— O relógio ficou nas 08:15: uma frase que diz uma coisa e pergunta outra é de graça. Certo.*

## Parte 3 — o mercado e a taverna

**J7** — Despeço-me do Otávio com um aceno e desço ao Tendal de Couro. Na primeira banca pergunto: "Que armas se vendem por
aqui, e a quanto?"
`SISTEMA` Otávio do Sal está aqui — O Tesouro sem Fio. · Você está no Tendal de Couro.
**M7** [08:20] — O Tendal de Couro ferve como panela sem tampa … uma velha a esfregar sal nas palmas de todos que passam …
"Armas? Aqui no Tendal só o Fio do Ermo, uma lâmina de folha curta, boa pra quem não quer barulho. Vinte e dois." — Outra
voz corta de trás …: "E o preço é esse de manhã. Depois do meio-dia, sobe." …
`SISTEMA` 🗝 O que O Tendal de Couro esconde — O Tendal de Couro
*— PERGUNTA 8, que armas e a quanto: **do sistema, no número** ("armas à venda: Fio do ermo ◉ 22"). Mas o Fio do ermo é um
**montante — 2D6 · FORÇA · PESADA, DUAS MÃOS** —, e o Mestre vendeu-o como "lâmina de folha curta": a PERGUNTOU leva nome e
preço, não o que a coisa é. "Depois do meio-dia sobe" é inventado. E a própria linha contradiz-se: "não há armas à venda
em Runa do Poço; armas à venda: Fio do ermo".*
*— "Otávio do Sal está aqui" no ecrã quando eu me **despedia** dele e saía: o "Despeço-me do Otávio" foi lido como procura,
e a pauta mandou narrar "[PROCURA — RESOLVIDA] Procurei Otávio do Sal e ELA ESTÁ AQUI (O Tesouro sem Fio)" na mesma pauta
que diz "AGORA estou no Tendal". O Mestre ignorou, bem.*
*— A GENTE, no Tendal: "Otávio do Sal responde em três palavras" (ficou na forja), "Túlio responde com outra pergunta, e a
pergunta dela é sobre mim" (nunca o vi; de folga em casa), "Nero do Couro responde com outra pergunta" (no cais, segundo o
próprio Mestre). Três ausentes na cena, dois deles com "dela".*

*(painel: Mercado → comprei o Fio do ermo, ◉ 22, e equipei-o na Bolsa. A Guerreira, como a Ladina da primeira, chega ao
mundo de mãos vazias: `equipados: {}`.)*

**J8** — Pendo o montante às costas e atravesso a praça até à taverna, O Último Gomo. Encosto-me ao balcão e pergunto a quem
serve: "Quanto é um quarto para esta noite?"
**M8** [08:30] — O Último Gomo te recebe com o cheiro de pão velho … Atrás do balcão, Lina do Sal seca uma caneca … "Quarto
comum são seis moedas. Se for bom, quinze. Se tiver pressa, o estábulo é dois, e o feno também serve de cobertor." … "Mas
fica sabendo que a cidade está contando as reservas em público, e o número não anda bonito." … Um serviçal cruza o salão
com um balde de água …
`SISTEMA` 🗝 O que O Último Gomo esconde — O Último Gomo
*— PERGUNTA 9, o quarto: **do sistema, número a número** ("pouso: quarto comum ◉ 6 … bom ◉ 15, estábulo ◉ 2"). **É a
mesma frase que na primeira sessão (T5) foi trocada por "causar boa impressão" e nunca chegou.** Desta vez não houve teste
social: o balcão respondeu. **O teste que comia a frase (v9.336): aguentou.***
*— Duas respostas numa pauta (quem trabalha no Último Gomo e o pouso) — o "até três" da v9.336 a funcionar.*
*— "[A UM PASSO] … As reservas foram contadas em público": o compasso dá-me um turno de aviso antes de acontecer. O Mestre
deu-o numa frase, sem o forçar. Isto é Matt.*
*— A mesma PERGUNTOU diz "Lina do Sal (taverneiro(a), de folga hoje …)", e o Mestre pô-la a servir. Ninguém da casa está de
turno às 08:30.*

**J9** — Pouso seis moedas no balcão pelo quarto comum e baixo a voz: "Quem é aquele que passou agora com o balde? E essas
reservas — de que é que a cidade está a ficar sem?"
**M9** [08:35] — Lina do Sal guarda as seis moedas num saco sujo e empurra a chave … "Aquele com o balde é o Máximo.
Serviçal, vai ao templo antes do turno." … "Contaram em público hoje cedo. Tá curto. Tá tudo curto: grão, sal, vela, carvão.
Se a caravana não chegar, a fome estoura em três dias …" — **O sino fora de hora corta a frase.** Lina levanta a cabeça, a
mão parada no pano. Ninguém no salão diz porquê. — "Quarto comum, escada no fundo, primeira porta à esquerda. Boa noite."
`SISTEMA` Começou a contar: A caravana que não chega ○○○○ — avança sozinha com o tempo — ignorar custa caro.
*— PERGUNTA 10, quem é aquele: **do sistema** (a ficha do turno anterior: "Máximo (serviçal, fora do turno: no templo)").*
*— PERGUNTA 11, as reservas: **metade.** O sistema diz "falta na cidade inteira" e "uma cidade que come de fora"; os quatro
bens e os três dias são do Mestre — e o Cronista pô-los no relógio, onde agora são verdade.*
*— **O SINO, o prenúncio (MM13): no turno 9, como na primeira**, depois de três lugares e seis pessoas, e cortando uma frase
— o melhor sino que ouvi até hoje. E o relógio da caravana à vista: a ameaça tem forma na tela sem dizer o mecanismo.*
*— As seis moedas "pousadas" não saíram da bolsa (◉ 62 antes e depois) — e o Mestre entregou a chave. "Boa noite" às 08:35.*

**J10** — Pego na chave mas não saio do balcão. "Lina, ouve. Sou soldada, sei calar o que ouço — e se essa caravana não
chegar, vais querer alguém de escudo à porta. Diz-me o que se passa no Fundo do Poço. Toda a gente baixa os olhos quando o
nome sai."
**M10** [08:40] — Lina do Sal estanca, a caneca no meio do caminho. … "O Fundo do Poço — repete, baixo, como quem prova o
nome. — Ninguém fala daquilo, soldada. Quem fala, some." … "Dizem que a água lá embaixo não reflete rosto. Que devolve
outro." … "Se a caravana não chegar, escudo na porta é o de menos. Vão querer é alguém que entre lá. E ninguém entra." …
"Teu quarto é em cima. Descansa."
`SISTEMA` De volta a Runa do Poço — O Último Gomo fica para trás.
*— **A persuasão não rolou.** Uma fala com argumento que pede um segredo foi lida como pergunta ao balcão (nenhum TESTE na
pauta), e Lina deu o que tinha de graça. Não provei se é o conserto do teste social que passou do ponto ou se a peneira só
ouve "convenço" — o limite parou-me antes da segunda tentativa.*
*— PERGUNTA 12, o que se passa no Fundo do Poço: **contradiz o sistema.** O Fundo do Poço é, na base do mundo, "💧 casa de
banhos"; é também o marco 2 da espinha ("O que O Fundo do Poço esconde"). O Mestre fê-lo poço maldito onde "ninguém entra",
e o Cronista gravou-o no cânone ("Poço temido sob Runa do Poço cuja água não reflete o próprio rosto"). O segredo de um
marco foi escrito por uma fala sem dado.*
*— **"De volta a Runa do Poço — O Último Gomo fica para trás"**, com a heroína ao balcão e a frase "não saio do balcão".
Ver o defeito 2.*

## Parte 4 — o limite

**J11** — Deixo a chave no bolso, saio do Último Gomo e vou direita ao Fundo do Poço, a casa de banhos. À porta, antes de
entrar, paro e olho: quem está de guarda, quantas saídas há, e se alguém me segue desde a taverna.
`SISTEMA` [08:50] · (topo) O ÚLTIMO GOMO · **A porta não se abre para esta mão: o Mestre não conta esta história a quem bate
assim.**
*— As três chamadas do turno (duas leves e o Narrador) voltaram **429 — "Limite diário alcançado (500 chamadas). Ele volta
a zero à meia-noite"**. A tela vestiu o erro de ficção: a jogadora lê que **a ação dela foi recusada**, não que o servidor
ficou sem fôlego. E o relógio andou dez minutos por um turno que não aconteceu.*
*— A pauta que não chegou a ser respondida dizia "[MOVIMENTO — REGISTRADO PELO SISTEMA] … AGORA estou no Último Gomo":
"saio do Último Gomo e vou ao Fundo do Poço" levou-me **para o sítio de onde eu saía.** Sem o limite, a sessão teria partido
aqui na mesma — eu chegava à taverna em vez da casa de banhos do marco.*

*(Fim da sessão às 08:50 do dia 1. Não há chamadas até à meia-noite; a campanha foi apagada com o resto, como o método manda.)*

---

## As perguntas, contra o sistema

| # | turno | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | 2 | quem manda de facto? | "o conselho de marcas, e a guarda fiel da coroa … as patrulhas" | **sistema** | Léxico + PERGUNTOU (quem guarda a lei) |
| 2 | 2 | a quanto tempo fica o Sepulcro? | "a noroeste, passada a boca da mina. Umas duas horas" | **inventado** | a masmorra vai à pauta sem rumo nem distância |
| 3 | 4 | há quanto tempo trabalhas aqui? | "Três anos. Herdei as ferramentas e as dívidas" | **sistema** | PERGUNTOU: o posto (MM8a), sem d100 |
| 4 | 4 | de onde vens? | "Sou Vélios, se é isso que pergunta" | **metade** | o povo da ficha; o lugar não chegou |
| 5 | 5 | quem mais trabalha nesta forja? | "Nero do Couro … Lino do Altar, mas é encomenda" | **sistema** | PERGUNTOU: quem trabalha na casa |
| 6 | 5 | o mestre ferreiro não está? | "desceu ao cais buscar remessa" | **inventado** | o paradeiro de Nero não vai à pauta |
| 7 | 6 | quanto custa um escudo? | "Escudo aqui não tem à venda … nem em banca nenhuma" | **sistema** | PERGUNTOU: o mercado |
| 8 | 7 | que armas se vendem, a quanto? | "só o Fio do Ermo … Vinte e dois" (e "lâmina curta") | **sistema**, o tipo contradito | PERGUNTOU: ◉ 22; é um montante de duas mãos |
| 9 | 8 | quanto é um quarto? | "seis … bom, quinze … o estábulo é dois" | **sistema** | PERGUNTOU pouso, número a número |
| 10 | 9 | quem é aquele do balde? | "o Máximo. Serviçal, vai ao templo antes do turno" | **sistema** | a ficha da casa, do turno anterior |
| 11 | 9 | de que a cidade fica sem? | "grão, sal, vela, carvão … três dias" | **metade** | "falta na cidade inteira"; os bens são do Mestre |
| 12 | 10 | o que se passa no Fundo do Poço? | "a água lá embaixo não reflete rosto … ninguém entra" | **contradiz** | é a casa de banhos da base, e o segredo de um marco |
| 13 | 11 | quem guarda a porta, quantas saídas? | (o limite) | — | não conta: a pergunta nunca foi respondida |

*Tenho cobertura?* e *a quantos metros?* não chegaram a perguntar-se: não houve luta.

**A conta:** das 12 perguntas com resposta no mundo, **7 saíram do sistema** (1, 3, 5, 7, 8, 9, 10), **2 pela metade** (4,
11), **2 foram inventadas** (2, 6), **1 contradisse o sistema** (12) e **nenhuma se perdeu**. Contra a primeira: **5/12 →
7/12** certas, **4 → 2** inventadas, **1 → 0** perdidas, **1 → 1** contradita. O "sino" não sequestrou nada — mas também não
houve casa com "sino" no nome para o tentar; a regra que a primeira tirou mantém-se afinada: **quando o fato chega, o Mestre
acerta.** As duas inventadas têm a mesma raiz: o fato **existe e não viaja** — a masmorra sem distância, o ferreiro sem
paradeiro. A contradita é outra coisa: um segredo que ninguém guardou.

---

## O que a sessão tinha de provar

| item | aconteceu? | como / porquê |
|---|---|---|
| **a abertura: porque estou aqui, o que sei, o próximo passo — sem Aceitar** | **sim** (T1) | as três limpas; e desta vez o mural só abriu **depois** do primeiro passo jogado (T4), não no T2 |
| **a história principal deixa-se jogar em vez de fechar sozinha** | **sim, até onde foi** | o passo 1 fechou estando com Otávio (T3–T4); o marco 2 (o Fundo do Poço) puxou a cena sem a forçar, e fui atrás dele no T11 |
| **perguntas como as do Matt (umas dez)** | **13 feitas** | 7 certas, 2 pela metade, 2 inventadas, 1 contradita, 0 perdidas; uma cortada pelo limite |
| **perguntar é de graça** | **sim, fora da luta** | T2 e T6 com o relógio parado; na luta, **não visto** |
| **o sino depois de explorar** | **prenúncio sim** (T9) | três lugares, seis pessoas, a cortar a fala de Lina; a escalada não chegou |
| **persuasão** | **não houve teste** (T10) | a fala com argumento foi balcão; o segredo saiu de graça, e inventado |
| **armadilha ou perigo com teste** | **não chegou** | o limite parou a sessão à porta do Fundo do Poço |
| **uma luta; esconder-se nela; um atirador; uma rendição; o golpe final** | **não chegou** | nada disto se jogou em 10 respostas |

---

## Os defeitos, pela ordem em que partem a sessão

1. **O limite diário da API (500 chamadas) partiu a sessão no T11 — e a tela disfarçou-o de recusa do Mestre.** *Visto:*
   três 429 no mesmo turno, e o ecrã a dizer "A porta não se abre para esta mão: o Mestre não conta esta história a quem bate
   assim". O teto é infra (é da pessoa: custa dinheiro). **O disfarce é do jogo:** um jogador real lê que fez uma coisa
   proibida, tenta outra, e gasta mais. E o turno recusado **andou o relógio** (08:40 → 08:50). **O gasto também é do jogo:**
   37 chamadas para 10 respostas (**3,6 por resposta; a primeira sessão fez 99 para 49, ~2,0**). Quatro delas foram **falas
   de personagem pagas e deitadas fora** — "Responda como Otávio do Sal", duas vezes; "Responda como Túlio", duas vezes, e
   Túlio nem estava na cena —, que saem ~1,5 s antes da chamada do Narrador e **não entram em nenhuma pauta nem na tela**
   (procurei as quatro frases nas pautas seguintes). Uma delas dizia "O do balde é Otávio do Sal": sorte que se perdeu.
2. **O lugar da heroína volta a separar-se — agora pelo Cronista.** *Visto, com a causa provável:* dentro de um prédio, o
   Cronista devolve `"lugar": "cidade"` a cada turno (chamadas #10, #13, #25, #29, #33); ao chegar, devolve o nome certo
   (#7, "o Tesouro sem Fio"). O sistema lê o "cidade" como o Narrador a tirar-me de lá, e **quatro vezes em dez respostas**
   (T5, T6, T9, T10) o Narrador recebeu "[LUGAR — RECUSADO] Você me tirou de onde eu estava…" **sem ter feito nada** — uma
   correção falsa, com as letras de uma acusação, numa pauta que tem teto. À quinta passou: "De volta a Runa do Poço — O
   Último Gomo fica para trás" com a heroína ao balcão (T10). E no T11, "saio do Último Gomo e vou ao Fundo do Poço" registou
   "AGORA estou no Último Gomo": **o destino foi o sítio de onde eu saía.** Sem o limite, era aqui que a sessão partia — no
   mesmo sítio da primeira, o passo para a história.
3. **Um segredo da espinha escreveu-se sem dado, e contra a base** (T10). O Fundo do Poço é a casa de banhos da cidade; a
   persuasão não rolou, o Mestre revelou "a água que devolve outro rosto" e "ninguém entra", e o Cronista gravou-o no cânone.
   O marco 2 tem agora uma verdade que o sistema não elegeu. *Visto:* a pauta sem TESTE, o cânone novo "Fundo do Poço".
4. **Dois nomes, uma pessoa errada** (T5). O cartaz fala de "Túlio da Runa", que sumiu na estrada; a regra nova dos nomes
   (v9.338) fundiu-o com **Túlio, o músico da cidade**, que a ficha põe "de folga hoje: em casa". Daí em diante Túlio é
   "✓ conhecido" sem eu o ter visto, entra em A GENTE e recebe falas pagas. *Visto:* `npcs` tem "Túlio" e não "Túlio da Runa".
5. **A gente da cidade segue a heroína pela cidade** (T7, T9, T10). No Tendal, A GENTE trouxe Otávio (na forja), Túlio (em
   casa) e Nero (no cais); na taverna, "Otávio do Sal pede um favor pequeno" e "chama uma terceira pessoa para a conversa".
   O conserto 9a (v9.338) só olhou a masmorra — o diário já o dizia ("na jornada, a gente da cidade continua presente"). O
   Mestre ignorou-os todos; o prejuízo foi só de pauta.
6. **A procura que ninguém fez** (T7): "Despeço-me do Otávio" pôs no ecrã "Otávio do Sal está aqui — O Tesouro sem Fio" e na
   pauta "Procurei Otávio do Sal e ELA ESTÁ AQUI", no turno em que eu saía. O "ELA" para Otávio, e "a pergunta dela" para
   Túlio e Nero, são o mesmo buraco de concordância.
7. **Miúdos, mas à vista:** a Guerreira começa sem arma (como a Ladina: é de todas as classes); o montante vendido como
   "lâmina curta" (a PERGUNTOU não diz o que a arma é) e a linha "não há armas à venda … armas à venda: Fio do ermo"; pagar o
   quarto por palavras não tira as moedas; Lina "de folga" ao balcão e ninguém de turno às 08:30; "Boa noite" às 08:35; a
   Médica de Campo sem treino em Medicina; a correção de cânone sobre "magro"; o "🗝 O que X esconde" nasce em cada casa onde
   entro (o Tendal, o Último Gomo) — a nota fica, é cedo para dizer se é pista ou ruído.

### Os consertos de 30/09 — aguentaram?

| conserto | aguentou? | visto |
|---|---|---|
| v9.333 — as missões não fecham sem se jogarem | **sim** | o passo fechou estando com Otávio (T3–T4); nenhum fecho por menção; a espinha não saltou de ato |
| v9.334 — o "como" chega, o revide fere, a sala limpa fica limpa | **não visto** | não houve luta |
| v9.335 — o lugar da heroína e o da narração | **não** | por outra porta: o "cidade" do Cronista (4 recusas falsas, 1 saída falsa) e "saio de X" que leva a X |
| v9.336 — perguntar é de graça, e a resposta que chega responde | **sim, fora da luta** | relógio parado em T2 e T6; o quarto respondido sem teste social (a frase exata que se perdeu na primeira); duas respostas numa pauta; 7/12. A distância a uma masmorra não veio |
| v9.337 — fios e contratos viram missões | **não visto** | não houve descanso longo |
| v9.338 — ninguém segue à masmorra; o "você mudou"; os nomes que colidem | **metade** | o "você mudou" **não apareceu nenhuma vez** (na primeira: T3, T12, T18, T20); a masmorra não se viu; os nomes fundiram mal (Túlio) |
| v9.339 — uma história de cada vez; quem pede nunca é o herói; só a palavra dada é promessa | **sim** | **zero** tramas forçadas em 10 respostas (na primeira, "Tirar Branca de lá" no T4); o cartaz de Otávio ficou no mural; ninguém veio cobrar promessa nenhuma |
| v9.340 — o que a ficha sabe não se rola | **sim** | "há quanto tempo trabalhas aqui?" → o posto da ficha, sem d100 |

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Ainda não se sabe — e é a primeira vez que a resposta não é "ainda não".**

As dez respostas que houve são as melhores dez que joguei nesta mesa. O que mudou desde o "ainda não", em número:

| | 1.ª sessão (v9.332) | 2.ª sessão (v9.340) |
|---|---|---|
| perguntas respondidas pelo sistema | 5 de 12 | **7 de 12** |
| perguntas inventadas / perdidas | 4 / 1 | **2 / 0** |
| turno em que a sessão partiu | **5** (a principal fechada sem se jogar) | **11** (o limite da API; e o lugar ia parti-la no mesmo turno) |
| missões fechadas sem se jogarem | 2 até ao T10 (3 em 49) | **0** em 10 |
| tramas forçadas | 1 até ao T10 (4 em 43) | **0** em 10 |
| "você mudou" no primeiro encontro | 1 até ao T10 (4 em 49) | **0** |
| perguntas que fizeram andar o relógio | andavam como qualquer jogada (e, na luta, gastavam a vez) | **nenhuma** das puras (T2, T6) |
| correções falsas ao Narrador sobre o lugar | — | **4** em 10 (nova) |
| chamadas pagas por resposta | ~2,0 | **3,6** (4 falas deitadas fora) |

A continuidade que faltou na primeira — a história que não fecha sozinha, a gente que não "mudou" sem me ter visto, o tempo
que não anda quando pergunto — **segurou-se dez turnos seguidos.** A história principal deixou-se jogar: achei Otávio
porque fui à forja, e o marco seguinte puxou-me para a casa de banhos sem me dar um cartaz.

**O que ainda falta:** (1) **metade da sessão nunca foi jogada** — a luta, o esconder, o atirador, a rendição, o golpe final
e o perigo com teste são o que a primeira deixou mais partido (o "como", o revide, a sala ressuscitada), e nenhum conserto
dessa família foi visto; não se assina um Matt sem uma luta. (2) **O lugar**, que era o defeito nº 2 e volta pela porta do
Cronista — no mesmo passo da primeira: o de ir para onde a história está. (3) **O segredo guardado**: a persuasão que não
rola e deixa o Mestre escrever o que a espinha esconde. (4) **O fôlego**: a 3,6 chamadas por resposta, o teto de 500 dá
~140 turnos por dia a toda a gente — e a casa gastou-o hoje a provar-se. **A terceira sessão tem de começar amanhã de
manhã, com o limite zerado, e ir direita à porta do Fundo do Poço** — a luta é o que há por provar.

---

## A proposta ambiciosa, para a pessoa decidir

**"A sala à vista": quem está aqui, em rostos, debaixo do nome do lugar.** Uma fila de retratos pequenos — os que o sistema
dá como presentes nesta cena, e só esses — logo abaixo do nome do sítio no topo do ecrã principal. Entrar alguém na cena é
um rosto que chega (com `prefers-reduced-motion`, aparece sem deslizar); sair é um rosto que se apaga. Tocar num rosto
começa a frase por ele ("Para Lina: …"), e a pergunta que sai dali é de graça, como já é.

**Porquê, e com que prova.** Numa mesa do Matt os jogadores sabem sempre quem está na sala, porque veem as miniaturas no
tabuleiro; aqui essa verdade vive só na pauta, onde ninguém a vê. Nesta sessão, **3 das 10 pautas puseram na cena gente
que não estava** (Otávio, Túlio e Nero no Tendal; Otávio na taverna, duas vezes), e **duas falas pagas foram para um
homem em casa** — com a fila à vista, a jogadora teria visto Túlio no mercado no T7 e escrito "quem é esse?", e o ciclo
teria um defeito à vista em vez de um defeito escondido. É a mesma verdade para os dois lados da mesa: o que o sistema
acha, a jogadora vê. E dá ao ecrã principal — os 90% do jogo — o que ele ainda não tem: **gente**, e não só texto.

**O peso:** criar peça e mudar a tela principal — da mesa, pela ordem de 23/09; mas toca o que o jogador faz a cada turno
(dirigir a fala por um toque), por isso vai também para "Para a pessoa decidir". A peça (o retrato em fila, o estado de
"acabou de chegar") é do `desenho`; eu desenho o momento.

---

*Observações que estão com a pessoa e não entram na lista de consertos:* a voz desta campanha saiu **na segunda pessoa**
("tu vê", "te recebe"), com escorregões para a terceira ("Otávio encara Brites") — a primeira foi na primeira pessoa; e a
Brites anda **sozinha**, sem companheiro, como a Iara.
