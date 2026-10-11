# MM11 · a quarta sessão de prova — transcrição

> **Campanha:** *Prova da Mesa IV* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Heroína:** Sibila Navarro — mulher, Tiefling (no léxico do mundo: *Portadores de Marca*), Bruxo (Pacto Infernal), Escriba
> (*Escrivão do Sino*), Ex-Cultista Arrependido. Pontos: Intelecto +2 · Percepção +2 · Destreza +1 · Presença +1. 10 PV, 20 PM,
> sem treino em Furtividade. Conceito: *escriba que fugiu de um culto e copia às escondidas os livros dele para provar o que ele
> fez*. Outra raça, outra classe e outro antecedente que a Iara, a Brites e o Tobias (o sexo repete: só há dois).
> **Companheiro de antes:** Euzébio — Ladino, "credor", no grupo desde o turno 1 (12 PV). Na pauta: *"dívida comigo · o homem a
> quem o herói deve mais do que dinheiro; conhecem-se há 3 anos · antes de andar com o herói: recruta"*.
> **Respostas do Mestre: 42** (42 chamadas ao Narrador; mais o Léxico na criação). Três dias de jogo: 1 de Brumal 08:00 → 4 de
> Brumal 07:50. Nenhuma chamada falhou (93 de 93 com 200). A sessão acabou **na morte da heroína e na passagem do fio** (M39–M42).
> **Jogada por:** o `tester`, a 10/10, sobre `v9.371` (`78c3a7a`), navegador do painel (**800×451**; as três primeiras sessões
> foram a 374×310), campanha nova criada pela tela.
> **Como se conferiu:** um gancho em `fetch` mandou **toda** chamada a `/api/*` — hora, endereço, tamanho, o pedido inteiro e a
> resposta — para um servidor local que guardou um JSONL no scratchpad (`registo-s4.jsonl`, 93 chamadas). Quem chamou saiu do
> prompt de sistema (`Você é o NARRADOR`, `Você é o CRONISTA`, `Você é o REVISOR DE CONTINUIDADE`, `Você é o Léxico`). Cada
> resposta foi lida contra a pauta desse turno (só os números e as linhas de que se precisou; nenhum prompt inteiro foi lido) e
> contra o save. O localStorage foi lido antes (`taverna_cfg_golpe_final=perguntar`, `taverna_cfg_rolagens=1`) e, no fim, **com
> o jogo desmontado** (a aba levada a `/@vite/client`), apagaram-se só as duas chaves que a sessão criou — `taverna_save_v1` (294
> KB) e `taverna_rascunho_historia` — e as duas de antes ficaram, com os mesmos valores, por leitura.
> **Medida de passagem (MM8):** ao fim, `npcs` = 14 pessoas, `canone` = 29 entradas, 250 mensagens no save, `promessas.sementes`
> = **[]**, `reviravolta` e `reviravoltaMaior` = **null**, `espinha`: 2 marcos feitos, de 6 atos de 4–5 marcos cada.

Convenção: a das três primeiras. **J** é o que o jogador escreveu (ou tocou). **M** é o Mestre, encurtado com "…" e nunca
reescrito; o número é o da resposta (M1–M42). `SISTEMA` são as linhas da tela que não são do Mestre. À margem, em *itálico*, o
que se provou ou partiu.

---

## Parte 1 — a chegada, o Sino e o mercado (M1–M11)

**M1** — … **O cheiro de cera derretida e tinta seca gruda na garganta antes mesmo de você ver a muralha.** Alto do Sal vive do
que os outros trazem … a lei aqui é o Sino — cada entrada de marcado dobra uma vez, e a praça inteira para para contar. Euzébio
assovia baixo, as mãos nos bolsos, os olhos quietos demais para quem só acompanha. "Bonita a gaiola, hein? … Pena que a gente
entra sem convite." … O portão range aberto, e um sino pequeno, desafinado, dobra uma vez — para você. **Euzébio não tem marca.
Ele passa sem som.** … A oito horas de marcha a sudeste fica o forte de Muralha Quebrada, e ninguém aqui diz esse nome em voz
alta — falam "o lugar", baixando o tom, fazendo o sinal do badalo com os dedos. Você sabe que Inocência Bordão, músico de canto,
está no Sino Quieto. … A carta sem assinatura que te trouxe aqui está dobrada no seu bolso, e a letra é dos antigos irmãos …
*— A ABERTURA: a melhor das quatro. Mundo, onde estou, a lei (o Sino que conta os marcados), o segredo que ninguém diz (o
nome da Muralha), o passo (Inocência) e uma ponta de passado (os antigos irmãos). Segunda pessoa, limpa. O "ele" de "Inocência
… ele é a única pessoa" não sobrevive: ela é mulher já no M3.*
*— O COMPANHEIRO: está lá e é um homem que ninguém conhece. "Euzébio não tem marca" é a melhor linha de companheiro que o jogo
escreveu — o sistema sabia que ele é recruta, credor e Ladino; o Mestre fez dele um sem-marca num mundo que conta os marcados.*

**J2** — Olho para o Euzébio, sem baixar a voz: "De onde é que a gente se conhece, afinal? E por que é que tu vieste comigo?"
**M2** — Euzébio nem pisca. **"Ah, essa a gente conta depois do almoço, Navarro. Agora eu preciso de um favor."** … Uma mulher
baixa, de capa verde, para o que está fazendo e encara você. Ela carrega um alaúde nas costas … "Caetano, chega aqui. Esse marcado
acabou de entrar e já veio procurar o Sino Quieto." …
*— PERGUNTA 1, "de onde nos conhecemos": **esquivada, sem inventar.** A pauta tinha os três anos e a dívida (em PESSOAS
CONHECIDAS, não em PERGUNTOU) e o Mestre não os gastou: adiou. É a blindagem de memória a funcionar — e a primeira vez que o
adiamento é uma cena.*
*— O REVISOR disparou (1.ª de 8): "Caetano está no registro como arquivista, e você o chamou de 'chega aqui'". Há dois Caetanos
no elenco (o arquivista e o batedor Caetano Bronze) e o Cronista registou o nome curto como o arquivista. Ver o defeito 4.*

**J3** — "Vim. Procuro Inocência Bordão, o músico de canto. Sabe onde o encontro?" E pergunto: "Quem manda de facto nesta cidade,
o Sino ou a guarda?"
**M3** — A mulher do alaúde te olha como se a pergunta fosse a coisa mais boba do mercado. **"O Sino manda em ninguém, moço. Ele
só dobra. Quem manda é a guarda, e a guarda se finge de surda até a hora de cobrar."** … "Inocência é eu, e você veio bem na hora
do ensaio." … Caetano Bronze … "Mas o Belmira ali no balcão conhece quem paga para calar." …
*— PERGUNTA 2, quem manda: **sistema** (PERGUNTOU "quem guarda a lei: Os Portadores do Sino da coroa, e as patrulhas de cada
bairro") **e frase do Mestre por cima** — "o Sino só dobra" é melhor que a tabela. "Moço" a uma heroína (3 vezes na sessão).*

**J4** — Sento no banco, em frente a Inocência, e tiro a carta … "Reconheço esta letra. É dos meus antigos irmãos. O que sabes de
Noé Laminado, e onde ele está?"
**M4** — Inocência sorri com a ponta da boca … "Não me chama de músico. Eu canto, que é coisa bem diferente." … "Era viualho."
O rapaz magro, Caetano Bronze, chega perto e se debruça, o apelido
*— **A RESPOSTA CHEGOU CORTADA, E O JOGADOR NÃO SABE.** O Narrador devolveu uma narrativa de ~1.700 caracteres em que uma aspa
interna não vinha escapada (`o apelido "Navarro" já no ar como fumaça`). O JSON interno ficou inválido; a leitura tolerante
devolveu o que havia antes da aspa, e a tela mostrou **o primeiro terço e acabou a meio da frase**. O que não chegou: "Noé
Laminado … visto perto do Cálice Magro … e também dizem que ele nunca mais saiu da vala", **"só que a tua metade da dívida,
Navarro, não vai se pagar com lenda de homem morto"**, e "Isso aqui não pede pra você virar herói. Pede pra você lembrar". O
Revisor ainda "corrigiu" o toco ("Caetano Bronze, batedor de carteiras, chega perto e se debruça, o apelido") — pago para
consertar a coisa que já estava partida. Ver o defeito 3.*

**J5** — Olho para o Caetano, que ficou a meio da frase. "Acaba o que ias dizer. Que apelido, e o que sabes de Noé Laminado?"
**M5** [08:15] — Caetano Bronze pisca … "Apelido? Ah, isso é coisa de quem te conhece. Eu chamo de meio-fio, e você nem sabe por
quê." … "Noé Laminado… **ele entrou na Muralha Quebrada faz três luas e de lá não saiu. E quem procurou, também não.**" Inocência …
"Mas a Muralha não perdoa língua solta. E a guarda já anda de olho em quem pergunta demais." Na rua, dois guardas … de lata no
peito, cochicha algo ao outro. …
*— PERGUNTA 3, o que sabes de Noé: **inventado, e contradito dois turnos depois** (M11: "na Rua dos Retalhos, com a Botica").
Mas o jogador **reage ao corte** como jogaria com um Mestre de mesa — "acaba o que ias dizer" — e o Mestre acaba. É o melhor
instante da primeira hora: a mesa se conserta sozinha, e Caetano devolve a única pista que a história tinha ("a Muralha").*

**J6** — Pergunto a Inocência, baixinho: "Quanto tempo leva a pé daqui até à Muralha Quebrada? E onde posso dormir esta noite, e a
quanto fica um quarto?"
**M6** — … "Daqui até lá são oito horas de perna boa. Mas ninguém vai a essa hora, e se for, não volta a tempo de explicar." …
"Dormir? Aqui no Sino Quieto tem quarto. **O meu é vinte lâminas** …" A mulher do balcão, de colete de couro, ri antes de terminar
a frase … Euzébio se levanta devagar … "Eu vou ver o que os de lata tanto olham. Se eu não voltar, vocês bebem por mim." …
*— PERGUNTA 4, quanto tempo: **sistema** (a base dizia "oito horas de marcha a sudeste"). PERGUNTA 5, o quarto: **inventada**
(nenhuma linha PERGUNTOU de pouso; a interlocutora não era a taverneira). "O Belmira" foi "um homem de colete de couro" no M3 e é
"a mulher do balcão, de colete de couro" aqui: o género muda. Erro de escrita: "enququanto".*

**J7** — Pago a bebida … saio do Sino Quieto. Vou ao Mercado da Cinza e pergunto a um vendedor de papel quanto custa uma resma e
um frasco de tinta.
**M7** — O Mercado da Cinza tem o cheiro de tinta fresca … "Resma e frasco de tinta? **Dez lâminas a resma, cinco o frasco.** Mas
se quiser papel de carta, esse aí é o dobro — e o que sai dele ninguém esquece." … Euzébio cutuca seu cotovelo … Inocência Bordão
surge por trás de uma pilha de fardos … "Antes de confiar em mim com esse nome, quero ver se você tem estômago. … **Conte a
verdade na frente dela.**" Ela joga o queixo para uma mulher de capa verde parada na esquina, que acena levemente e espera. …
`SISTEMA` 🗝 O que Mercado da Cinza esconde — Mercado da Cinza
*— PERGUNTA 6, preço do papel: **inventada** (a pauta diz "nunca invente preço"; nenhum PERGUNTOU de mercado).*
*— **"O que Mercado da Cinza esconde" fechou só por eu ter entrado.** Nada foi escondido nem revelado nesta cena: um vendedor de
papel e um preço. O título promete um segredo e a etapa se cumpre por presença. Ver "a qualidade da campanha".*
*— **O MESTRE PARTE INOCÊNCIA EM DUAS.** A mulher do alaúde (M2–M3) é Inocência; no M7 Inocência "joga o queixo para uma mulher de
capa verde" — a mesma, que o Cronista regista como **pessoa nova** ("mulher de capa verde — figura que Inocência quer que ouça a
verdade"). A pauta tinha duas linhas de A GENTE para o mesmo nome curto (a Inocência coveira do elenco e a Bordão) e uma delas,
"quer ver antes de aceitar, e conta na frente de mim", foi lida como ordem para ela exigir a minha confissão diante de terceiros.*

**J8** — Respiro fundo e conto a verdade a Inocência, diante da mulher de capa verde: fui escriba de um culto, copiei os livros
dele durante anos, fugi, e ainda copio às escondidas … A carta é dos meus antigos irmãos, e não sei se me chamam para me perdoar
ou para me calar.
**M8** — Inocência ouve em silêncio, o maxilar duro, os olhos fixos na mulher de capa verde, **que Inocência quer que ouça a
verdade.** … "Então é isso. Você copiou os livros deles. **E agora eles te mandam carta com nome de morto para te trazer de
volta.**" Ela não pergunta. Ela crava. … "O julgamento começa quando o sino tocar. E hoje, quem sobe no banco dos réus não é quem
roubou." … Dois guardas sobem a escada carregando um homem de capuz … Euzébio … "Acharam o batedor. O de apelido meio-fio." …
*— O ANTECEDENTE (o gancho: "os antigos irmãos o querem calado ou de volta") **entrou na cena, e foi a única vez em 42 respostas**:
"nome de morto" é uma ótima linha, e dá ao Noé uma sombra. Depois a história foi para o couro do Euzébio e as chaves, e os
"antigos irmãos" nunca mais voltaram.*
*— **VAZAMENTO:** "os olhos fixos na mulher de capa verde, que Inocência quer que ouça a verdade" — a nota do registo, colada na
prosa.*

**J9** — Abro caminho pela multidão até ao pé do coreto e pergunto em voz alta … de que é que o Caetano é acusado e quem o acusa. …
**M9** — A praça inteira vira quando você fala. **O voz alta** corta o murmúrio como lâmina … "Acusado de bater carteira … A banca
dos cambistas fechou cedo, e o dono dela diz que foi ele." … **o Belmira, encomendante impaciente,** bate o pé no chão. …
Euzébio … "Se for defender, fala agora." …
`SISTEMA` Mural — Aceitar: O que há em O Campo Trêmulo · assina Caetano Bronze · 50
*— PERGUNTA 7, de que o acusam: **inventada**, e vazamento de rótulo outra vez ("o Belmira, encomendante impaciente"). O cartaz
de Caetano — que está na corda — ficou à vista no rodapé até ao fim da sessão (ver os defeitos).*

**J10** — Subo os degraus do coreto e digo à praça: quem fecha a banca cedo e depois acusa o primeiro batedor que apanha é quem
tem pesos falsos a esconder. Peço que se confira a balança coberta do cambista …
**M10** — … "Confere a balança coberta dele. Se tiver peso de mentira, a corda sobra pro pescoço errado." … Mas quando puxam a
lona, **as balanças de prato estão limpas** … E o lugar do meio-fio no coreto está vazio. Só a corda balança … Euzébio sobe os
degraus devagar … **"Isso não foi julgamento. Foi ensaio."** E ninguém ri.
*— A MELHOR CENA DA PRIMEIRA HORA. A minha tese estava **errada** e o mundo não me corrigiu: a balança estava limpa, o preso
sumiu, ninguém o diz. Um Mestre de verdade parava aqui para o jogador sentir que apostou e perdeu. Aqui, o sistema só registou
um assunto gasto (`compasso.usados = [julgamento, intriga_de_corte]`) — e nada ficou: Caetano, o ensaio, a corda não voltam. Sem
dado de Persuasão: falar à praça não pediu teste.*

**J11** — Deixo a praça e sigo para O Livro Morto, a biblioteca. Procuro quem lá guarda os registos e pergunto se há alguma entrada
com o nome de Noé Laminado …
**M11** — O Livro Morto cheira a papel velho, cera de selar … Caetano, o arquivista, levanta os olhos … "Ela não cruza esta porta.
… **na Rua dos Retalhos, com a Botica.** Lá, talvez. Aqui, não." … Euzébio … **"A dívida não dorme, Navarro."** …
`SISTEMA` 🗝 O que O Livro Morto esconde — O Livro Morto · Noé Laminado está em Rua dos Retalhos.
*— PERGUNTA 8, Noé: **sistema** ([PROCURA — RESOLVIDA PELO SISTEMA]: "Noé Laminado NÃO está aqui. … ela está em Rua dos
Retalhos") — e a "botica" é invento do Mestre que o mapa depois confirma ("Rua dos Retalhos — mercado").*
*— **"O que O Livro Morto esconde" fechou só por eu ter entrado.** Segundo marco "descobrir" fechado sem nada descoberto: dois
em onze minutos de jogo, e são os dois únicos marcos da espinha que a sessão cumpriu.*
*— Do M1 ao M11 o relógio andou 25 minutos (08:00 → 08:25): perguntar foi de graça.*

## Parte 2 — o couro, a botica e as chaves (M12–M21)

**J12** — Saio com Euzébio para a rua, longe dos ouvidos, e encosto-o à parede: "Já falaste três vezes numa dívida. Que dívida é
essa, Euzébio? Quanto te devo, e desde quando?"
**M12** — **Fora, o sol da manhã doura a poeira da rua dos Retalhos.** Euzébio caminha um passo à frente … Você o puxa para
debaixo de um toldo … e cravou: "Já falaste três vezes numa dívida. …" … "A dívida? Ah, a dívida." Ele enfia a mão no bolso e saca
um pedaço de couro escuro … **"Isso aqui foi achado no teu cinto, na noite em que te tiraram da estrada. Tu não tinhas ferida,
não tinhas marca. Só isto, e o meu irmão no chão."** …
*— PERGUNTA 9, que dívida: **inventada** (a pauta só dizia "mais do que dinheiro; conhecem-se há 3 anos"), e **contra** a regra
da casa — "NUNCA invente passado compartilhado": "a noite em que te tiraram da estrada" e "o meu irmão no chão" não estão em
nenhuma ficha. Como cena, é a melhor da sessão.*
*— O Mestre põe a cena em **"a rua dos Retalhos"** — a rua de Rio Cinzento, a um dia de marcha; eu estou no Livro Morto. Cola o
meu pedido na prosa ("e cravou: 'Já falaste …'"), no tempo errado.*

**J13** — Estendo a mão e pego o couro. … "O teu irmão. Como se chamava, e o que lhe aconteceu nessa noite?" Depois abro o couro
devagar e leio o que lá está escrito.
**M13** — … Dentro, uma única linha foi escrita com letra miúda e apressada: **"O primeiro que ler, que diga a Noé que a chave do
Sino está na gaveta errada."** … "Meu irmão se chamava Norberto. Era dos que carregavam o badalo pequeno, nas manhãs de véspera.
… disse que tinha visto um vulto na Rua dos Retalhos, perto da botica. No outro dia, não acordou." … "E agora tu sabes por que eu
não te largo: quem escreveu isso estava atrás de ti, não dele." Inocência … "Se vais à Rua dos Retalhos, convém não ir só." …
*— PERGUNTAS 10 e 11 (o nome do irmão, o que lhe aconteceu): **inventadas** — e a única linha do jogo todo que **muda o que eu
sabia**: a carta não era para mim, era para Noé; e o irmão do meu credor morreu por causa dela. É a revelação que a campanha
tinha de ter tido, e o Mestre a inventou de cabeça. O Cronista registou "Norberto" — como **pessoa viva em Alto do Sal** (o mapa o
põe a 15 km a nordeste, com o título "Norberto").*

**J14** — "Vamos. Vou à Rua dos Retalhos, em Rio Cinzento, procurar Noé Laminado e a botica." Parto a pé com Euzébio, e deixo a
mulher de capa verde seguir connosco se quiser.
**M14** — **A estrada corta as colinas a sudoeste** … três pedras antigas fincadas à beira do caminho … Euzébio anda um passo à
frente, a mão no coldre vazio … Num desvio … uma pequena bolsa de couro entre as raízes, a boca arrombada … "Dezesseis lâminas.
E aqui, ó, um fio de latão com um dente pendurado." … A mulher de capa verde se aproxima, e pela primeira vez ela pede uma coisa
… "Se encontrar uma botica na Rua dos Retalhos, pergunta se ainda vendem o óleo de mirra. Pra mim faz diferença." …
`SISTEMA` Navegação em floresta: d20+2 = 20 vs 10 → rota mantida · Conquista desbloqueada: 🧭 Andarilho · 🦴 a carcaça grande —
ossos de algo maior que um boi · Seguir para Rio Cinzento · 4 h · faltam 1 avanço
*— A ESTRADA É O MELHOR TRECHO DE PROSA: bolsa, colar, óleo de mirra — **a mulher de capa verde ganhou um querer**, pequeno,
concreto e que o jogo cobra três turnos depois. Uma coisa que o sistema não deu e a mesa ganhou.*

**M15** [toque em "Seguir para Rio Cinzento"] — Navegação: d20+2 = 11 vs 10 … `SISTEMA` 🆘 A Câmara do Dragão pede auxílio … ·
**Exaustão: 24h acordado. Você está Exausto (desvantagem) até um descanso longo.** · Alto do Sal → Rio Cinzento · chegando · **Fim da
estrada: depois de 1 dia de marcha e 20 km** … "Ar de trovoada." … **Rio Cinzento é uma rua só, sem muralha, sem portão, sem
guarda. As casas de adobe se enfileiram como dentes tortos** … "É aqui. E a botica é ali no fim da rua. Vai devagar que eu quero
te ver entrar primeiro." `SISTEMA` Correio — chegou correspondência. · Aceitar: A caçada de Noé Laminado, assina Noé Laminado · 50
*— 20 km a pé (4 h) custaram **um dia de relógio** e o herói chega **Exausto**, com desvantagem: é o piso de 12 h por avanço
(defeito já conhecido, não investigado). Registo o efeito, que é o que pesa: a primeira chegada da campanha dá uma condição.*
*— **O TEXTO DA CHEGADA APARECE DUAS VEZES NA TELA**, uma antes e outra depois da linha "Correio — chegou correspondência"; o
Narrador devolveu uma só (conferido no registo). Idem o texto do acampamento (M23–M24).*

**J16** — Vou pela rua até à botica … e entro primeiro … Pergunto ao boticário pelo óleo de mirra … e depois, em voz baixa, por Noé
Laminado.
**M16** — A botica no fim da Rua dos Retalhos cheira a ervas secas, enxofre e cera velha. … um homem de mãos manchadas de
verde-escuro … "Chegou o sal na língua? Aqui é botica, não taverna." Ele se apresenta como Noé Laminado … "E Noé Laminado? Já
estás falando com ele. Mas a tua voz veio mais baixa agora, como quem pergunta por dívida." …
`SISTEMA` mulher de capa verde está em Alto do Sal — 13 km para a nordeste.
*— **Encontrar Noé** acontece no turno 16 de 42 e é um anticlímax tranquilo: um boticário atrás do balcão. Mas o marco "Encontrar
Noé Laminado" **não se cumpre** (ver o defeito 5). "sal na língua" (mentira) vem usado como cumprimento.*

**J17** — Pouso o couro escuro no balcão, diante de Noé, e leio-lhe em voz baixa a frase … "Foi Norberto, o irmão do Euzébio, quem a
escreveu? E o que quer dizer a gaveta errada?"
**M17** — Noé Laminado não pega o couro. **Ele o olha como se aquilo mordesse.** … "A gaveta errada é esta, moço. A que fica atrás do
balcão, junto aos frascos de óxido. **Norberto guardava os restos de toda a gente que a Muralha devolveu.** Chave de Sino… Há
coisas que se enterram, outras que se escondem da própria mão que as guardou." … Noé enfia a mão sob o balcão e puxa uma caixinha
de madeira … com um molho de chaves pequenas e pretas. "Vês? A gaveta errada. Norberto voltou com isto, três noites antes de não
acordar. **Eu devia ter queimado.**" … Dois vultos param na frente da botica … Um deles carrega um badalo de bronze embaço; o
outro, uma fita vermelha no braço. …
*— O MELHOR TURNO DA SESSÃO. Objeto (a caixinha), verso (a gaveta errada), mundo (a Muralha "devolve" gente), culpa (Noé), ameaça
(os dois vultos). Cada pergunta minha abriu uma porta. Isto é um Mestre. Nada disto estava na pauta.*

**J18** — Pego a caixinha de chaves pretas e guardo-a no cinto. Depois espreito pelo vidro opaco os dois vultos à porta … Quantas
chaves são, e há alguma marca gravada nelas?
**M18** — Você enfia a caixinha no cinto … Euzébio segura o ar. … Lá fora, alguém grita … **A porta da botica é escancarada por uma
mulher de túnica rasgada … Noé Laminado entra atrás dela, ferido no flanco, a respiração curta, e pergunta como quem diz um nome:
"Quem anda a perguntar por mim?"** Os dois vultos se afastam da vitrine …
`SISTEMA` Chega a notícia de Alto do Sal, trazida por quem fugiu: Noé Laminado chega a Alto do Sal às pressas, ferido(a), com gente
atrás — e pergunta por quem anda a perguntar por si.
*— **O SISTEMA ESCREVE UM SEGUNDO NOÉ.** Um boato automático diz que Noé chega ferido a Alto do Sal; Noé está à minha frente em
Rio Cinzento. O Mestre obedece e faz entrar outro Noé ferido na botica, **sem reparar que o boticário está no balcão**. A minha
pergunta (quantas chaves?) ficou sem resposta. Ver o defeito 4.*

**J19** — Olho para o homem ferido … e para o boticário atrás do balcão: "Quem de vocês é Noé Laminado, afinal?" …
**M19** — … "Esse aí atrás do balcão é o Noé Laminado das ervas. Eu sou **Noé Cantoneiro, mercador**, e não vinha atrás de ti. Vinha
atrás dele." … "Trouxe o aviso. **A Muralha deu um nome, e o nome é o teu.**" Euzébio passa a te chamar de Sibi, baixinho … "Sibi, a
caixinha. Quantas chaves?" Você puxa o molho do cinto: são **cinco chaves pretas, frias, sem brilho, cada uma com uma marca
gravada no anel — uma espiral, um triângulo, um olho vazado, uma língua e um badalo.** …
*— **O Mestre se salva** do segundo Noé com uma emenda de mesa: dá-lhe outro nome, outro ofício, outra razão — e responde à
pergunta das chaves que tinha ignorado. É improviso de Matt Mercer. Custou ao sistema o próprio boato, mas **o registo guardou
"Noé Cantoneiro, mercador(a)" e o Revisor disparou por causa dele** (a 43.ª chamada do registo).*
*— **"Sibi"** nasce aqui, na boca de Euzébio, e a partir daqui **entra na narração**: "capa de Sibi", "Sibi dá o primeiro passo".
Ver o defeito 6.*

**J20** — Viro-me para o boticário … "O que é que a Muralha quer de ti, Noé Laminado? E o que abrem estas cinco chaves? Quem as pode
usar, e onde fica a porta?"
**M20** — "A Muralha quer o que sempre quis: silêncio. E essas chaves… abrem o que Norberto escondeu antes de morrer. Mas a porta
certa não fica em Rio Cinzento. **Fica na botica velha, na Rua dos Retalhos de Alto do Sal.**" … A porta da rua range, e um vulto de
fita vermelha entra, sem pressa … "Que conversa demorada, Laminado. E com tantas chaves na mão do estranho." …
*— PERGUNTA 13: **inventada** — e a "Rua dos Retalhos de Alto do Sal" é uma segunda Rua dos Retalhos (o mapa só tem a de Rio
Cinzento). "Do estranho" para uma heroína (4.º tratamento no masculino).*

**J21** — Fecho a mão sobre o molho de chaves e dou um passo para ficar entre o homem da fita vermelha e o balcão. "Quem és tu, quem
te manda, e o que queres de um boticário e de um ferido?" …
**M21** — A mão de Euzébio pousa no ombro de Sibi … **"Eu? Eu sou o recado. A Muralha escolheu um nome, e o nome não é teu.
Ainda."** … "Quero o que todo mundo quer: ver a dívida cobrada. O boticário guarda chaves que abrem portas que deviam continuar
fechadas." …
*— Um vilão em duas frases ("Eu sou o recado") com **uma agenda** e **um nome que ainda não é o meu**. É o fecho de cena que uma
campanha pede. É também a última cena de história antes da Muralha: o homem da fita vermelha não volta à história — fica na
botica, e o Cronista o regista como "emissário da Muralha".*

## Parte 3 — a estrada que se repete (M22–M26)

**J22** — Não respondo ao homem da fita. … saio da botica sem pressa. **Vou à Muralha Quebrada de Silêncio**, procurar o que Norberto
escondeu.
**M22** — `SISTEMA` **Muralha Quebrada de Silêncio fica a sudeste, a 21 km — 0,5 dias de marcha por campo aberto.** · **● Muralha
Quebrada de Silêncio — DIFÍCIL: acima de você: sem plano, terreno ou ajuda, é onde se morre. (172 de poder (você 112 + 1 no grupo)
contra 372 — 2.2× menos do que isto pede)** · Navegação em planície: d20+2 = 16 vs 5 → rota mantida · Na estrada: tempestade — visão
ruim, raios … · Fim da estrada: depois de 0,5 dias de marcha e 21 km, você está diante de Muralha Quebrada de Silêncio. · (o
veredito repetido) … A tempestade desce em cortinas de chuva … **o forte se agiganta: paredes de pedra negra rachadas de alto a
baixo, como se um deus tivesse mordido e cuspido.** … "Isso é o que chamam de muralha? Tá mais pra ferida aberta." **A corte de
Rio Cinzento já escolheu o teu lado: … "o marcado das chaves."** … Noé Laminado fechou a botica mais cedo. Ninguém veio se despedir.
*— **"VOU À MASMORRA" LEVA À BOCA, E O VEREDITO VEM ANTES DA PORTA** — a promessa da v9.347 cumprida: a frase abriu a viagem
certa, o relógio andou meio dia, e a linha "DIFÍCIL … é onde se morre … 2.2× menos" chegou **antes** de eu entrar, com a conta.
O mundo reage ao que fiz ("o marcado das chaves"). A viagem corre inteira num só turno, sem pausa para desistir (o veredito sai
duas vezes, ao partir e ao chegar, mas a decisão já foi tomada).*

**M23** [toque em "Montar acampamento"] — … `SISTEMA` **ACAMPAMENTO — O TEMPO ESTÁ PAUSADO** · ⛺ dentro de forte da Muralha
Quebrada · **Descanso longo — custa uma noite inteira · 2 rações e 2 águas — devolve PV e PM cheios · cura Exausto** · Descanso
curto — custa cerca de uma hora … · Sair sem descansar — custa 20 minutos …
*— O PREÇO ANTES DO CLIQUE, em três linhas, com o que devolve e o que custa: o melhor painel de custo da casa. Mas "2 rações e 2
águas": o herói não as tem e **ninguém o avisou**; ver M24.*

**M24** [toque em "Descanso longo"] — … `SISTEMA` Descanso longo — PV e PM cheios para você e o grupo. ✓ Passou com o descanso:
Exausto. · **Comida acabou — 2 boca(s) passam fome hoje. Água acabou — 2 boca(s) passam sede hoje.** · Evento global: O Torneio das
Coroas — a região começa a mudar. · Fio de história: O pedido de Ondine · … · Pesadelo: você caía sem fim, e algo embaixo esperava
de boca aberta. … "Sonhaste com a queda outra vez, não foi? Acordaste a tremer **como no dia em que pulei no rio atrás de ti.** E
aquela vez **em Rio Cinzento**, quando bebeste da bilha errada?" … **Belmira, a encomendante impaciente, surge na entrada** … "Mudaste.
Ainda ontem carregavas a caixinha de chaves como quem carrega um sapato. … Inocência anda atrás de ti. **O Torneio das Coroas mexeu
com ela. E contigo?**" …
*— A noite traz **três fios novos** (o Torneio das Coroas, o pedido de Ondine, a Câmara do Dragão) que nada têm a ver com Noé, as
chaves nem a Muralha. E Euzébio inventa duas memórias — **uma delas em Rio Cinzento, onde eu estive pela primeira vez há dois
dias**. Belmira, a taverneira, chega à porta da Muralha de manhã, a mais de 20 km de Alto do Sal, só para repetir uma linha
da pauta ("O Torneio das Coroas mexeu com ela").*

**J25** — Respondo a Belmira … peço-lhe que volte para Alto do Sal. Depois acendo uma tocha, faço sinal ao Euzébio e **entro na
Muralha Quebrada de Silêncio**, passo a passo, com as chaves prontas.
**M25** — `SISTEMA` **Muralha Quebrada de Silêncio fica a leste, a 22 km — 0,5 dias de marcha por campo aberto.** · ● … DIFÍCIL …
· Navegação em planície: d20+2 = 12 vs 5 → rota mantida · … · **Fim da estrada: depois de 0,5 dias de marcha e 22 km, você está
diante de Muralha Quebrada de Silêncio.** … O vento ergue a capa de Sibi … **Sibi faz sinal a Euzébio.** … Dois soldados surgem na
sombra, lado a lado, com a fita vermelha da Muralha no braço. … "Essas aí abrem o que tens de enterrar. E nós viemos ver se enterras
mesmo." …
*— **"ENTRO" REFEZ A VIAGEM.** Eu já estava junto da Muralha (acampei "dentro de forte da Muralha Quebrada") e o jogo me mandou
andar **outro meio dia** desde Rio Cinzento, outra vez com chuva, outra vez "diante de". A causa está na pauta do turno anterior:
o sítio do acampamento é **"forte da Muralha Quebrada (nos arredores de Rio Cinzento)"** — um lugar novo, a 2,8 km da aldeia,
inventado pelo Cronista a partir da palavra "forte" do Mestre — e dele "entro na Muralha" é, para o sistema, uma ida de 22 km. O
relógio saltou 12 h e o herói voltou a ficar Exausto.*

**J26** — Passo entre os dois soldados … e atravesso o arco: **entro na Muralha Quebrada de Silêncio** com o Euzébio, a tocha à frente.
**M26** — `SISTEMA` Muralha … fica a leste, a 22 km — 0,5 dias de marcha … (mesmo veredito, mesma conta) · **Exaustão: 24h acordado.
Você está Exausto (desvantagem) até um descanso longo.** · … **Fim da estrada: depois de 0,5 dias de marcha e 22 km, você está
diante de Muralha Quebrada de Silêncio.** … "Esse lugar não tem silêncio nenhum. Tem é pulmão." …
*— **A SEGUNDA REPETIÇÃO, IDÊNTICA.** Três viagens à mesma boca (M22, M25, M26) = **36 horas de relógio**, duas noites de fome e
sede, Exausto de novo, e eu nunca entrei. Foi preciso trocar as palavras ("desço para dentro da masmorra, para as salas") para a
frase não bater na ida.*

## Parte 4 — a Fortaleza (M27–M35)

**J27** — Respiro fundo e desço para dentro da masmorra, para as salas, com a tocha à frente. Euzébio vem logo atrás.
**M27** — `SISTEMA` **Você não tem uma única tocha. Vai entrar no escuro — desvantagem em tudo, e o que mora lá enxerga melhor que
você.** · **◐ Fortaleza das Brasas — MÉDIO: é do seu tamanho: dá para ganhar, e vai doer. (172 de poder … contra 131 — 1.3× o que
isto pede)** … A tocha de Sibi traça um arco e revela o primeiro salão da **Fortaleza das Brasas** … "Isto não é muralha. É tripa."
… Por onde se vai primeiro? …
*— **ABRIU OUTRA MASMORRA.** A que eu paguei três viagens para ver, a "Muralha Quebrada de Silêncio — DIFÍCIL (372)", **não é a que
abriu**: abriu a **Fortaleza das Brasas — MÉDIO (131)**, a mais próxima das coordenadas do "forte" inventado. O Mestre, que dois
turnos antes narrava a Muralha, passa a narrar a Fortaleza sem notar ("Isto não é muralha"). O veredito da porta ("MÉDIO … dá para
ganhar") é, ele próprio, a promessa que a sessão não cumpre.*
*— "Você não tem uma única tocha" — o preço do escuro dito com todas as letras **antes** de entrar, e depois "acendo uma tocha"
da J25 fica desmentido pelo sistema. É o jogo a falar a verdade.*

[toque em "Passagem desconhecida — correntes penduradas balançam sem vento"]
**M28** — `SISTEMA` FORTALEZA DAS BRASAS · RODADA 1 · No fundo da sala · PARTICIPANTES Sibila Navarro, Lobo, Euzébio … Euzébio já está ao
lado de Sibi … **"Ele não quer briga. Quer sair inteiro. Deixa?"** O lobo dá outro passo para trás, a cauda rente ao chão, e a porta
do guardião chia atrás dele.
*— A MESA DE BATALHA cabe nos 800×451: tabuleiro, a vez, a barra de ação, os inimigos, as distâncias ("Lobo a 12 m — faltam 10,5
m"). Entrar na sala do guardião **abre a luta** (na terceira sessão era mudo) e o guardião é o lobo. O Mestre dá a Euzébio uma
fala de companheiro que **propõe poupar** antes de eu decidir.*

[toque em "esperar"] **M29** — O lobo dispara num salto baixo, as presas rasgando o ar onde Euzébio estava. Mas Euzébio já não está ali —
o corpo inteiro se dobra para o lado, ágil como se a lâmina fosse um pensamento. …

**J30** — Recuo para a sombra do canto e tento esconder-me do lobo.
`SISTEMA` Teste de Furtividade · dif. 18 — passar sem ser visto · Rolar d20 (+1) → 16 + 1 = 17 · Falha · ✧ Refazer · 1 ponto → **9 + 1 = 10
· Falha · ✧ REFEITO — O PRIMEIRO DADO DEU 16**
**M30** — A tocha desenha seu arco de sombras enquanto Sibi tenta escorregar para a lateral … Por um instante, parece que vai sumir
atrás da pilha de caixas — mas o pé esbarra numa corrente caída, e o ruído se espalha pela sala como toque de sino invertido.
**Ninguém viu, mas o som ficou.** O lobo ergue a cabeça, orelhas em riste, sem procurar; sabe que Sibi está ali. …
*— **ESCONDER-SE, METADE.** O que aguentou: a falha é fato ("[ESCONDER — FALHOU] … Lobo continua a ver-me. Não narre que sumi") e o
Mestre a narra bem; o **✧ Refazer · 1 ponto** é um bom momento (e o "O PRIMEIRO DADO DEU 16" é memória honesta: o segundo, que vale,
foi pior); a ação foi gasta (o chip "ação" apaga). O que não aguentou: **o veredito antes do dado diz a dificuldade e o bônus
("dif. 18 … d20 +1") mas não diz que custa a ação, nem que a sombra é o abrigo** — a pauta dava "comporta: sumir sem se esforçar,
passar por quem está a dois passos", o jogador não. Sem tocha, "sombra" é a sala toda e o lobo estava a 1,5 m: 18 era honesto.*

**J31** — [Atacar] + "com o cabo da tocha apagada, por baixo da guarda, para o deitar sem o matar"
**M31** — o lobo estaca, atento; Euzébio pronto … *(121 caracteres, começa em minúscula)*
*— **O "como" do ataque comum não vai a lado nenhum.** Tocar em "Atacar" **dispara o ataque na hora** (d20 15/5+5+2 = 7 vs 12 · erra) e
o texto que escrevi depois foi lido como "ação livre"; a pauta traz a frase como declaração e a luta segue. O "como?" só pesa no
golpe final. É a regra; mas a caixa "como? (opcional)" está acima do botão e **parece** valer para o ataque.*

**M32** [a luta volta ao meu turno com um cartão] — `SISTEMA` **Euzébio derruba Lobo. Como Euzébio faz isso? (opcional)** · **Poupar — cai
desacordado, vivo** / Matar — não se levanta mais · Lembrar minha escolha.
**J32** — [no cartão] "Uma rasteira baixa, e depois prende-lhe o focinho com o cinto, sem lhe fazer sangue" · Poupar
**M32** — **Euzébio deixa o lobo desacordado com uma rasteira baixa e prende o focinho com o cinto, sem tirar sangue.** … "Pronto. Fica
o bicho, fica a dívida em aberto." Ele se agacha … "A chave?" A tocha pende da mão de Sibi … no chão, entre os restos do guardião, um
colar de dentes escuros reluz brevemente. **Não é a chave.** Mas no molho que Sibi carrega, uma das cinco chaves pretas parece
mais quente que as outras.
`SISTEMA` Vitória · +4 · +7 XP · −1 heroísmo · NO CHÃO: Colar de Dentes de Assombro · Recolher · Respirar fundo → · **A luta · Lobo caiu · 3 rodadas**
*— **O "COMO" DO GOLPE FINAL CHEGA, 1 DE 1** (cartão à vista, dentro da janela, a meio da tela): a pauta traz "COMO Euzébio FEZ, nas
palavras do jogador: … Abra a narração por isto, ampliado, sem copiar nem desmentir. Quem manda é a escolha, não a frase" e o
Mestre **abre a resposta por ela**, quase palavra por palavra, e ainda a transforma em fala dele. Na 1.ª sessão 0 de 3, na 3.ª 0
de 2. Aguentou.*
*— **A CHAVE DO GUARDIÃO CHEGOU À PAUTA E O MESTRE DISSE QUE NÃO.** A pauta: "[MASMORRA] Achei a chave do portão do chefe entre os
restos do guardião. Mencione isso na narração." A narração: "Não é a chave." — e liga o colar, por conta própria, ao molho de
chaves pretas ("uma das cinco … parece mais quente que as outras"): uma boa ligação a um fio que o sistema não sabe que existe.
O portão abriu mesmo assim (M33–M34).*
*— O recibo "A luta · Lobo caiu · 3 rodadas · +4 · +7 XP · −1 heroísmo" fica **debaixo da prosa**, onde a pessoa lê.*

[toque em "Passagem desconhecida — há uma inscrição gasta na verga da porta"; toque no dado] **M33** — `SISTEMA` Teste de inscrição ·
dif. 13 — abrir runas frias que piscam numa sequência que se repete · +5 → 12 + 5 = 17 · Sucesso · A inscrição cede na 1ª
tentativa. A tranca range, ferrugem velha e pedra se soltando, e a porta cede como quem engole. … "Agora o portão do fundo. E a
chave?" Sibi olha para o molho de chaves no cinto. A de badalo parece pesar mais. …
*— **A masmorra anda em silêncio:** entrar em salas e passar pela inscrição não pediu nenhuma chamada ao Narrador (só o portão, no
fim). É barato e é rápido; é também uma masmorra **sem narrador entre as salas**.*

[toque em "Passagem desconhecida — um portão pesado, lacrado"] **M34** — A tocha se apaga no instante em que a sala do chefe se abre à
frente. A escuridão tem cheiro de enxofre e pelo queimado. No fundo, **um vulto de três cabeças se ergue entre as pedras: a Quimera,
com os olhos faiscando, e ao lado um cultista de manto ensebado, afiando uma faca no próprio sapato.** Euzébio estaca … "Chegou o
chefe. E o chefe nos viu primeiro." …
*— O PORTÃO DO CHEFE ABRIU COM A CHAVE, e atrás dele está **o chefe**: uma Quimera de 18 PV e um Cultista de 8. O chefe é a "criatura
mais forte da ficha, elevada a elite" (v9.363): a ficha é a planta. A frase do cultista — "um cultista de manto ensebado" — é a
única ponta que liga a Fortaleza à minha história, e o Mestre a dá de graça.*

**J35** — [Habilidades → Chama Menor, alcance 18 m; alvo: Quimera; como: "uma língua de fogo preto da minha mão, rente ao chão, para
a Quimera"]
**M35** — A Chama Menor falha — a língua de fogo preto morre no ar antes de tocar a Quimera. A criatura reage com fúria: o sopro
incandescente engole a sala … Uma marretada de pata quase o derruba de uma vez … *(527 caracteres)*
`SISTEMA` Sibila Navarro → Quimera: d20 1/15 → 1+5 = 6 vs 16 · desastre (errou feio) · Quimera te acerta · PM 19 · 🛡 **escudo arcano · 2 PM —
corta o grosso · deixar passar** → "A barreira subiu por você · 8 evitado · 13 vira 5 · −2 PM"
*— O PREÇO NA HORA DO GOLPE: o escudo arcano, que **corta o grosso** por 2 PM, é oferecido **antes** do dano, com o que custa e o
que evita (e depois mostra a conta: "8 evitado · 13 vira 5"). É bom jogo. Mas o cartão aparece **por cima do tabuleiro** e o
"deixar passar" fica rente à borda; e quando não clico a tempo, a barreira sobe **sozinha**.*
*— Um natural 1 com desvantagem: a Explosão Mística, a 1,5 m, era o ataque certo e eu escolhi a de 18 m; a de 18 m falhou. Um
herói de **10 PV** que leva 13 num golpe fica em 3 e, com "−4 PV/turno" que ninguém explica, em 0 na rodada seguinte.*

## Parte 5 — a queda e o herdeiro (M36–M42)

**M36** — A Quimera avança sobre Euzébio e o derruba com um golpe brutal; o ladino cai no chão, o corpo imóvel … **Sibi já está no
chão, a visão em túnel, o fogo mordendo as roupas.** A última coisa que vê é o cultista se aproximando, a faca brilhando na
escuridão, e o cheiro de enxofre e pelo queimado se fechando como uma mão. A chuva lá fora engrossa …
**M37–M39** — "Lá fora, a chuva para por um instante, e o silêncio que se segue é pior que qualquer rugido. Euzébio não se mexe." ·
"Sibi está caído, à beira da morte, a Quimera e o Cultista a um passo, Euzébio imóvel no chão." *(93 caracteres)* · "A escuridão
engole o último suspiro. Sibi não se mexe. … **Dentro, a sala do chefe fica quieta, como quem engole o que nunca mais vai cuspir.**"
*— **O LIMBO DO CAÍDO.** Com a heroína a 0 PV e o companheiro a 0/12, a tela continua a mostrar Atacar, Agir → e o alvo ("Quimera ·
1,5 m"), a barra diz **"você está desacordado — não pode agir"** só **depois** de eu tentar; e cada "esperar" custa **duas chamadas**
(Narrador + Cronista) e uma prosa em que a chuva "lá fora" continua a engrossar numa sala de masmorra. Foram quatro respostas (M36–M39),
todas pagas, até a morte aparecer.*
*— A MORTE, SIM, É BEM FEITA: **"Narrativa interrompida — Sibila Navarro tomba."**, os cinco dados da salvaguarda contra a morte
(7, 8, 12, 12, 4: "2 sucessos · 3 falhas — três falhas encerram, e o 1 natural conta por duas"), "CAIU EM FORTALEZA DAS BRASAS ·
CAMADA 3 · 0 TOCHAS", e duas portas — **Pagar para voltar** ("custa ◉ 120 — você não tem") e **Passar o fio** ("Alguém pega a
espada e continua — no mesmo mundo … Começa no nível 3 com ◉ 11"). É o melhor ecrã de "perdi" que joguei: diz **como** morri.
Mas as duas escolhas ficam **abaixo da dobra** a 800×451 (é preciso rolar) e a página só mostra o título e os dados.*

**J40** — [Passar o fio: "Tomé Navarro"]
**M40** — Tomé Navarro chega à boca de Fortaleza das Brasas com a chuva batendo nas costas … **Ele não é Sibila Navarro, e o mundo
sabe: os mesmos pés, outra sombra. Herdou o fio da história pela metade — uma dívida, um nome, um irmão desaparecido —** e a
primeira pessoa que encontra é Euzébio, caído de bruços no limo … e mais nada. A Quimera e …
*— A ABERTURA DO HERDEIRO usa o que a campanha tem (a dívida, o nome, o irmão) em três palavras: ótimo. Mas a **tela** põe Tomé
(22/22 PV, nível 3) **dentro da luta, na rodada 6, a 1,5 m da Quimera e do Cultista**, com a iniciativa a dizer "AGORA: QUIMERA", a
Sibila morta ainda na ordem e o texto a falar de "a boca de Fortaleza". Entrar noutro corpo no meio do golpe é o pior sítio do
mundo para passar o fio.*

**M41–M42** — Tomé avança contra a Quimera, mas o golpe abre apenas o ar. … ergue Escudo Arcano no último instante … Tomé ataca de
novo e erra … `SISTEMA` Tomé Navarro → Quimera: d20 10+2 = 12 vs 14 · erra · d20 2+2 = 4 vs 14 · erra · **PV 3/22**
*— Parei aqui: **o Tomé não atravessa o chefe.** Dois golpes e um escudo gastos, 3/22 PV, a Quimera a 18/18. Cada toque em
"Atacar" **rola na hora**, sem confirmar. Fim da sessão: **42 respostas, nenhuma descida acabada, nenhuma saída.***

---

## As perguntas, contra o sistema

| # | resp. | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | M2 | de onde nos conhecemos, e por que vieste? | "conta depois do almoço, Navarro" | **esquivada** | a pauta tinha 3 anos e a dívida; o Mestre não inventou |
| 2 | M3 | quem manda de facto? | "o Sino manda em ninguém … quem manda é a guarda" | **sistema** | PERGUNTOU "quem guarda a lei: Os Portadores do Sino" |
| 3 | M4–M5 | o que sabes de Noé, onde está? | "entrou na Muralha faz três luas" | **inventado** (e **contradito** no M11) | nenhuma linha; a pauta só trouxe "gíria" |
| 4 | M6 | a quanto tempo a Muralha? | "oito horas de perna boa" | **sistema** | a base: "a oito horas de marcha a sudeste" |
| 5 | M6 | onde dormir, a quanto o quarto? | "o meu é vinte lâminas" | **inventado** | nenhum PERGUNTOU de pouso; falou Inocência, não a taverneira |
| 6 | M7 | quanto custa a resma e a tinta? | "dez lâminas a resma, cinco o frasco" | **inventado** | a lei do prompt é "nunca invente preço" |
| 7 | M9 | de que acusam o Caetano, quem acusa? | "bater carteira … o dono da banca" | **inventado** | cena do assunto "julgamento" |
| 8 | M11 | Noé está nos registos? | "na Rua dos Retalhos, com a Botica" | **sistema** | [PROCURA — RESOLVIDA]; a botica é do Mestre |
| 9 | M12 | que dívida, quanto, desde quando? | "achado no teu cinto … o meu irmão no chão" | **inventado** | a pauta: "mais do que dinheiro; 3 anos" |
| 10 | M13 | o nome do irmão, o que lhe aconteceu | "Norberto … não acordou" | **inventado** | nenhuma |
| 11 | M18–M19 | quantas chaves, que marca? | ignorada; no M19 "cinco … espiral, triângulo, olho vazado, língua, badalo" | **inventado** | nenhuma |
| 12 | M19 | quem de vós é Noé Laminado? | "Noé Cantoneiro, mercador" | **inventado** (emenda ao boato do sistema) | o boato dizia só "Noé chega ferido(a)" |
| 13 | M20 | o que quer a Muralha, o que abrem as chaves? | "silêncio … a botica velha, na Rua dos Retalhos de Alto do Sal" | **inventado** | contradiz o mapa (uma só Rua dos Retalhos) |
| 14 | M22 | a que distância e a quanto custa a Muralha? | "21 km — 0,5 dias … DIFÍCIL … 2.2×" | **sistema** | jornada + veredito |

**A conta:** das 14 perguntas, **4 saíram do sistema** (2, 4, 8, 14), **1 foi esquivada** sem inventar (1) e **9 foram
inventadas** (3, 5, 6, 7, 9, 10, 11, 12, 13), 1 delas depois contradita (3). Contra as anteriores: **5/12 → 7/12 → 4/15 → 4/14.**

A régua mudou de mão. **Os 3 factos de mundo** (quem manda, distância, preço de quarto/papel) **saem ou do sistema ou do vazio** —
como na 3.ª: onde o número viaja, o Mestre acerta; onde não, inventa (preço do papel e do quarto: duas vezes). Mas **a maior parte
das 9 inventadas são de enredo, não de mundo** — o irmão, a gaveta, as chaves, o segundo Noé — e **essas são as melhores linhas da
sessão**. Esta sessão pergunta mais ao Mestre por **história** (o que sabe, o que esconde) do que por **fato**; para a história, o
sistema não dá nada, e o Mestre, sozinho, dá. A pergunta é se isso é uma boa notícia (o Mestre toca a mesa) ou uma má (a campanha
é o que o Mestre improvisa, e o save não guarda: `promessas.sementes = []`).

---

## O custo — cada chamada, com dono

| quem chamou | chamadas | por resposta | pedido médio | tempo médio | o que é |
|---|---|---|---|---|---|
| **Narrador** | 42 | 1,00 | 138.059 car. (system 72.383, de 67.947 a 76.450; janela de 1 a 47 mensagens; pior pedido 178.759) | 8,4 s | a resposta do Mestre |
| **Cronista** | 42 | 1,00 | 9.096 car. | 2,1 s | o juiz do turno (leve, JSON) |
| **Portão — o REVISOR DE CONTINUIDADE** | 8 | 0,19 | 2.213 car. | 2,4 s | o conserto da narração (leve, texto) |
| Léxico | 1 | — | 15.379 car. | 58,7 s | só na criação do mundo |
| bocas, rede de segurança, voz, sala, arquivista, crónica | 0 | 0 | — | — | não usados |
| **total** | **93** | **2,19** (92/42, sem o Léxico) | | | 93 de 93 pelo DeepSeek; nenhum erro |

**Tokens:** 1.973.472 de entrada (1.028.352 do cache, **52%**) e 29.995 de saída, nas 93.

**Contra as três primeiras:** ~2,0 → 3,6 → 2,27 → **2,19 chamadas por resposta.** Ao teto de 500 por endereço, **~228 respostas
por dia**. O pedido do Narrador **cresceu 9%** (126.675 → 138.059), e **o prompt de sistema não** (72.618 → 72.383; o teto de
~82k aguentou: o pior caso foi 76.450). O que cresce é a **janela de mensagens** (até 47) e a pauta (mediana 2.468, pior 5.226).

**O Portão e o que ele pagou:** oito chamadas, e **sete foram pagas por defeito do próprio sistema** (seis falsos alarmes sobre o ofício
de alguém e um morto que o registo pôs vivo), a mesma família da 3.ª (8 de 8):

| conserto | quantos | a "contradição" que o portão viu | o que é de verdade |
|---|---|---|---|
| "Caetano está no registro como arquivista" / "Caetano Bronze … batedor" | 2 | o Mestre a chamar um deles por uma ação ("chega aqui", "chega perto") | dois Caetanos no elenco; o registo casou o nome curto com o errado |
| "Belmira está … encomendante impaciente" | 2 | "sobe a escada devagar", "mulher de túnica rasgada" | o Revisor lê a **frase seguinte ao nome** como um ofício que o Mestre deu |
| "mulher de capa verde está no registo como figura que Inocência quer que ouça a verdade" | 1 | "que não se move" | a nota do registo virou ofício |
| "Noé Cantoneiro está … mercador(a)" | 1 | "e não vinha atrás de ti" | idem |
| "Norberto está em Alto do Sal, a 1 dia" | 1 | ele "entra pela porta" | **verdadeiro** — o Cronista registara um morto como vivo; o conserto apagou a cena |
| "Quimera NÃO morreu e NÃO caiu" | 1 | um golpe narrado como se tivesse caído | **verdadeiro** (este era o trabalho dele) |

**Zero das oito foi sobre Euzébio** (na 3.ª, cinco foram sobre a companheira). A família que sobra é a dos **homónimos e das notas
de registo lidas como ofício** — e uma delas (M4) foi paga para consertar um toco que **o próprio sistema tinha partido**.

---

## O que a sessão tinha de provar

| item (v9.347 → v9.371) | aguentou? | como / porquê |
|---|---|---|
| **a masmorra pode acabar: o guardião luta e larga a chave** | **o guardião e a chave, sim; o fim, não** | a sala do guardião abre a luta (M28); o lobo cai; a pauta diz "Achei a chave do portão do chefe" (M32) e o portão abre (M33–M34). O Mestre diz "Não é a chave" contra a ordem. O chefe (Quimera 18 + Cultista 8) derruba a heroína de nível 1 em 3 rodadas e o herdeiro de nível 3 em 3 rodadas: **"o chefe conclui" não se viu** |
| **a sala vencida fica vencida** | **não provado** | nunca voltei à sala do guardião; o recibo "A luta · Lobo caiu · 3 rodadas" ficou; a lista oferece "voltar (Guardião)" |
| **a companheira de antes é uma pessoa só** | **sim** | uma ficha ("credor, Ladino · anda comigo"), um nome, **zero** chamadas do Portão por causa dela (eram 5 em 8) e uma voz própria ("Sibi", "a dívida não dorme") |
| **o "como" do golpe final chega ao Mestre; o cartão nasce à vista** | **sim, 1 de 1** | cartão "Como Euzébio faz isso? (opcional)" a meio da tela, a pauta traz a frase com "abra a narração por isto", o Mestre abre por ela (M32). O golpe final do **herói** não se deu |
| **"vou à <masmorra>" leva à boca, com o veredito antes da porta** | **o veredito sim; a boca, três vezes** | M22 abre a viagem certa e o "DIFÍCIL … 2.2×" chega antes de eu entrar. Mas "entro" refaz a viagem (M25, M26) e a descida abre **outra** masmorra (defeito 1) |
| **a masmorra chega à pauta; dentro dela o prompt não traz a cidade** | **sim** | ONDE "dentro de Fortaleza das Brasas, na sala do guardião da chave · (aqui isto é um Sítio Maldito)", MASMORRA "camada 1 de 3 · 2 das 7 salas da planta já vistas · NO ESCURO", CONTRA "Lobo: sair inteiro daqui, e briga só com quem impedir"; nenhuma linha de A GENTE nem de A CIDADE. Sobram as distâncias a Inocência e Caetano ("em Alto do Sal, a 4 h … não entra nesta cena sem 4h narradas") |
| **esconder-se: o veredito antes do dado; a sombra conta como cobertura** | **metade** | dificuldade e bônus à vista; a falha é facto e é bem narrada; o **custo** (a ação) e a **razão** (a sombra) não vêm antes do dado |
| **a campanha nasce numa região delimitada** | **em parte** | quatro povoações, **as distâncias à pauta** ("oito horas", "21 km — 0,5 dias") e os ganchos nos lugares da ficha (Rua dos Retalhos = mercado de Rio Cinzento; Sino Quieto; a Muralha). Mas 20 km a pé custaram **um dia** e a Muralha dada ao Mestre não é a que abre (defeito 1) |
| **cada ato da espinha num lugar dela** | **sim, e vazio** | os seis atos têm lugares (O Livro Morto, O Fio Cego, Casa da Patrulha, A Forja do Escombro …). Os dois "descobrir" que cumpri fecharam **por eu entrar** |
| **a ficha é a planta** | **sim** | planta de 7 salas; chefe = Quimera (a mais forte da ficha, elite) + Cultista; guardião = lobo; "quem está aqui" só com criaturas da ficha |
| **a marcha única** | **sim, e o piso fica** | `Alto do Sal → Rio Cinzento · 1 dia de marcha e 20 km` (a promessa era 8 h); `Rio Cinzento → Muralha · 0,5 dias · 21 km` (12 h). O piso de 12 h por avanço (já conhecido) deu **Exausto** na primeira chegada, **e em cada uma das três idas** |
| **a auditoria da tela: um recibo debaixo da prosa** | **sim** | "A luta · Lobo caiu · 3 rodadas · +4 · +7 XP · −1 heroísmo", "A inscrição cede na 1ª tentativa", "Descanso longo — PV e PM cheios para você e o grupo" |
| **a dobra da luta e o fim da luta na mesa** | **sim** | o preço (DIFÍCIL/MÉDIO) à vista antes da porta; "Vitória +4 +7 XP −1 heroísmo · NO CHÃO · Recolher · Respirar fundo →" dentro da mesa |
| **o sistema calado sobre si** | **quase** | sem postura, preset ou modo. Escapam: **"Navegação em floresta: d20+2 = 20 vs 10 → rota mantida"** (a roda do sistema à vista), **"Você está Exausto (desvantagem)"** (é efeito), as notas do registo no mapa e na prosa (**"figura que Inocência quer que ouça a verdade"**), **"−1 heroísmo"** (nome de recurso, sem dizer o que é) |
| **a nova mesa de batalha cabe na janela** | **sim** | a 800×451: tabuleiro, vez, barra de ação, inimigos e distâncias, sem rolar. A reação do escudo arcano cobre o tabuleiro; o ecrã da morte tem as duas escolhas abaixo da dobra |
| *(de antes)* a segunda pessoa (v9.346) | **partiu** | 24 das 42 respostas são limpas; **18 chamam a heroína "Sibi" em terceira pessoa** depois que Euzébio inventa o apelido (M19): "capa de Sibi", "Sibi dá o primeiro passo" (defeito 6) |
| *(de antes)* o lugar não é recusado (v9.341) | **sim** | **0** recusas falsas de lugar em 42 (eram 12 em 30) |
| *(de antes)* perguntar é de graça (v9.336) | **sim** | o relógio andou 25 minutos nas 11 primeiras respostas |
| *(de antes)* o segredo só sai por teste (v9.344) | **sem teste a provar** | nenhuma pressão por segredo; o "Escondido" da pauta (alçapão em O Cálice Magro, carta lacrada em O Campo Trêmulo) nunca foi procurado |

---

## Os defeitos, pela ordem em que partem a sessão

1. **Entrar na masmorra não entra: refaz a viagem três vezes e abre outra masmorra.** *Visto e lido na pauta.* O acampamento da M23
   é "em forte da Muralha Quebrada (nos arredores de Rio Cinzento)" — um **lugar novo**, a 2,8 km da aldeia, nascido da palavra
   "forte" do Mestre — e dali "entro na Muralha" (M25) e "atravesso o arco: entro" (M26) são, para o sistema, uma ida de 22 km:
   0,5 dias, outra chuva, outra Exaustão, "diante de". Só "desço para dentro da masmorra" (M27) fura — e abre a **Fortaleza das
   Brasas (MÉDIO 131)**, a masmorra mais próxima das coordenadas do "forte", não a **Muralha Quebrada de Silêncio (DIFÍCIL 372)**
   que a história, o veredito e três viagens me tinham prometido. O Mestre passa a narrar a Fortaleza no turno seguinte, sem notar.
   Custo: 36 h de relógio, duas noites sem comida, o herói de nível 1 e 10 PV a entrar numa masmorra que **o próprio veredito
   dá como "do seu tamanho: dá para ganhar"** — e que o mata em 3 rodadas. É o defeito 2 da 3.ª sessão (a viagem sem destino) numa
   porta nova, e ainda **o pior da sessão**: partiu a única cena que a campanha tinha ao fundo.
2. **O veredito da porta mente — e nada o corrige.** *Visto.* "MÉDIO … 172 de poder (você 112 + 1 no grupo) contra 131 — 1.3×"
   soma a ficha e o grupo, e **não conta o que a própria tela acabava de dizer**: Exausto (desvantagem em tudo), sem uma única
   tocha ("desvantagem em tudo, e o que mora lá enxerga melhor que você"), 10 PV. A heroína acertou **0 de 2** golpes (7 contra
   12 no lobo; 6 contra 16 na Quimera, com um natural 1); com 10 PV, um golpe de 13 a deixou em 3 e um "−4 PV/turno" inexplicado a zerou. O
   jogador viu o preço **antes** do clique — é a lei — e o preço estava errado.
3. **A narração do Mestre pode chegar cortada ao jogador, e o Portão a "conserta" pagando.** *Visto e lido no registo.* M4: uma aspa
   interna sem escape no JSON do Narrador (`o apelido "Navarro" já no ar`) fez a leitura tolerante devolver o que havia antes da
   aspa; o jogador leu 449 de ~1.690 caracteres, **a frase acabou a meio**, e o terço que faltava tinha "**a tua metade da dívida,
   Navarro, não vai se pagar com lenda de homem morto**" e a briga antiga dos padeiros com os moedores. 1 resposta em 42 (2,4%) — numa
   sessão de 30 respostas por dia, uma por dia. O Revisor, ainda por cima, **recebeu o toco** como se fosse a narração e foi
   pago para o "corrigir".
4. **Os homónimos e as notas de registo ainda dão pessoas a mais e rótulos na prosa.** *Visto.* 3 pares de homónimos nas 8 primeiras
   pessoas (Inocência/Inocência Bordão, Caetano/Caetano Bronze/meio-fio, Belmira); o Mestre, com duas linhas de A GENTE para o
   mesmo nome, **parte Inocência em duas** (a mulher do alaúde e "a mulher de capa verde", que o registo guarda como terceira
   pessoa); o registo guarda **Norberto, um morto, como pessoa viva a 15 km**; um boato do sistema ("Noé chega ferido a Alto do
   Sal") faz o Mestre pôr **um segundo Noé** no balcão ao lado do primeiro (a emenda "Noé Cantoneiro" foi do Mestre, e o
   Revisor a perseguiu); e três vezes uma nota do registo entra na prosa ("**que Inocência quer que ouça a verdade**", "o Belmira,
   **encomendante impaciente**"). 7 das 8 chamadas do Portão são deste defeito. É o 3 da 3.ª sessão (homónimos), v9.345 "metade".
5. **A espinha não anda quando se cumpre, e anda quando não se cumpre.** *Visto no save.* Ao fim: **"O rasto de Noé Laminado" —
   `Inocência Bordão: false · Noé Laminado: false`**, depois de quatro turnos a falar com Inocência e de o ter encontrado no
   turno 16 (o Cronista não pôs Noé em `pessoas`: pô-lo no `canone`, e a etapa `falar_com` lê `pessoas`). O marco "Encontrar Noé
   Laminado" também. Em compensação **os dois únicos marcos que se cumpriram — "O que Mercado da Cinza esconde" e "O que O Livro
   Morto esconde" — fecharam por eu ter entrado** no sítio: o título promete um segredo e a etapa `revelar` lê "o lugar entrou
   em cena com o herói lá" (`missoes.js`, `revelar.ver`). A espinha dá a quem joga o oposto do que diz.
6. **A segunda pessoa partiu: 18 de 42 respostas chamam o herói "Sibi".** *Visto.* Nenhuma das 24 primeiras; **18 das últimas 23**.
   O apelido nasce na boca de Euzébio (M19) e passa à narração em terceira pessoa ("capa de Sibi", "Sibi dá o primeiro passo",
   "A tocha de Sibi levanta a escuridão"). A prosa também **encolhe**: de ~1.100 caracteres de mediana nas 20 primeiras a ~500 nas
   de luta (121, 93, 431). E o género: a heroína é "moço" (3×) e "o estranho" (1×) na boca de personagens.
7. **O limbo do caído, e o herdeiro no meio da luta.** *Visto.* A 0 PV a tela mostra os controlos vivos e só diz "você está
   desacordado" depois do toque; cada "esperar" paga **duas chamadas** e uma prosa que ainda traz chuva "lá fora" a uma sala
   de masmorra (M36–M39). A morte em si é um bom ecrã. Mas **"Passar o fio" põe o herdeiro na rodada 6, a 1,5 m do chefe**, com a
   morta ainda na iniciativa e "AGORA: QUIMERA" — e Tomé, de nível 3, perde em dois turnos.
8. **O relógio ainda cobra o piso.** *Visto, já conhecido, não investigado.* 20 km a pé (4 h) = **um dia** → Exausto à chegada; 21 km
   = 12 h, três vezes. O piso de 12 h por avanço pesa aqui mais do que na 3.ª porque **cada** chegada rende uma condição. Dois
   dias depois, o "descanso longo" pede "2 rações e 2 águas" a um herói que **nunca as comprou** ("Comida acabou — 2 bocas
   passam fome") — e o preço de comer não estava no painel.
9. **O ecrã.** (a) O **texto de chegada e o do acampamento aparecem duas vezes** (uma antes, outra depois da linha de "Correio —
   chegou correspondência"; o Narrador devolveu um só). (b) **O cartaz do mural ("Aceitar: O que há em O Campo Trêmulo · assina
   Caetano Bronze") fica fixo no rodapé durante 26 turnos** — assinado por um preso que desapareceu na cena 10 — e, junto com "Montar
   acampamento · mais 1 oferta", **ocupa ~40% do painel de leitura** a 800×451 (a prosa tem ~210 px). (c) A reação do escudo
   arcano cobre o tabuleiro e o "deixar passar" fica rente à borda. (d) A caixa "como? (opcional)" fica acima de "Atacar" mas **só
   vale no golpe final**; tocar em "Atacar" rola na hora. (e) O ecrã da morte tem as duas portas abaixo da dobra.
10. **A masmorra anda em silêncio, e quando fala, fala pouco.** *Visto.* Mover entre salas e abrir a inscrição não chama o Narrador (0
    chamadas); a luta dá-lhe ~400 caracteres por resposta e o chefe, ~460; o escuro sem tochas **nunca é descrito** (o Mestre
    chega a pôr "a tocha que Sibi ergue" depois de o sistema dizer que não há tochas, e a chuva "lá fora" entra na sala do chefe).
11. **Miúdos, mas à vista:** o "ele" de Inocência na abertura contra a mulher do M3; "O Belmira" (homem) que vira "a mulher do
    balcão"; "Noé Laminado … ela" (pauta) contra "o vendedor de ervas" (prosa); **"Rua dos Retalhos" em duas cidades** (Alto do Sal
    no M12 e M20, Rio Cinzento no mapa); "Chegou o sal na língua?" usado como cumprimento de botica; o Mestre põe Belmira, de Alto
    do Sal, **à porta da Muralha** à primeira hora da manhã; o "chegou o aviso" do correio ("Câmara do Dragão") e dois fios novos
    (o Torneio das Coroas, o pedido de Ondine) que não têm nada a ver com Noé; "A última coisa que vê" (M36, uma heroína dita
    "ele" no M41); erros de escrita ("enququanto", "O voz alta", "Uma marretada de pata").

---

## A qualidade da campanha

*A pedido da pessoa: "se temos uma campanha que prende, com reviravoltas e histórias que merecem ser lidas … em um pequeno teste
achei a história de morna para frio, não prendeu muito."* Joguei como jogaria uma mesa: perguntei o que perguntaria ao Matt,
agi, reagi ao que me deram. Notas de 0 a 5, com a passagem.

| # | ponto | nota | porquê, com a passagem |
|---|---|---|---|
| 1 | **o gancho: dá vontade de ir?** | **4** | "A carta sem assinatura que te trouxe aqui está dobrada no seu bolso, e a letra é dos antigos irmãos"; **"Euzébio não tem marca. Ele passa sem som"** num mundo que conta os marcados; a Muralha que ninguém nomeia em voz alta ("falam 'o lugar', fazendo o sinal do badalo"). Dá vontade de ir à Muralha. Perde 1 porque o gancho que a ficha me deu — "os antigos irmãos o querem calado ou de volta" — **usa-se uma vez** (M8, "nome de morto") e nunca mais |
| 2 | **o mundo e o lugar: específicos ou genéricos?** | **4** | O Sino que dobra uma vez por marcado e para a praça; "os de lata"; "pés-de-lama"; "sal na língua"; **"Rio Cinzento é uma rua só, sem muralha, sem portão, sem guarda. As casas de adobe se enfileiram como dentes tortos"**; "Oferenda pra não levar. Tem lugar que a gente nem devia olhar." É um lugar de verdade com vocabulário seu. Perde: duas Ruas dos Retalhos, uma Muralha que vira Fortaleza, chuva dentro de uma masmorra |
| 3 | **as personagens: querem coisas, têm voz, lembram-se de ti?** | **3** | Voz, sim: Inocência — **"Não me chama de músico. Eu canto, que é coisa bem diferente"**; Noé — **"Eu devia ter queimado"**; o homem da fita — **"Eu sou o recado"**; Euzébio — "a dívida não dorme", "Sibi". Querem: a mulher de capa verde pede óleo de mirra ("pra mim faz diferença"); Euzébio cobra; Caetano está na corda. Lembram: Inocência usa a minha confissão ("carta com nome de morto"), Belmira vê "mudaste". Mas: Inocência é duas, há dois Noés, um morto vivo (Norberto), "o Belmira, encomendante impaciente" na prosa, e o óleo de mirra da mulher de capa verde **ficou comigo e a entrega nunca volta** |
| 4 | **o que está em jogo: pessoal e concreto?** | **3** | A dívida a um homem que perdeu o irmão **por uma carta que não era para mim**; "A Muralha deu um nome, e o nome é o teu"; cinco chaves com cinco marcas. É concreto, e a **primeira** metade é pessoal. A segunda metade — a Muralha, a Fortaleza, o chefe — não é: **Quimera e Cultista** não têm nada que ver com Norberto, nem comigo, nem com os antigos irmãos. E nada do que está em jogo **tem prazo** na tela: nenhuma noite que se perde, nenhuma pessoa em risco |
| 5 | **a reviravolta e a revelação: houve, chegou na hora, mudou o que sabias?** | **3** | **Houve três, e as três foram do Mestre:** (1) a carta não era para mim — "O primeiro que ler, que diga a Noé que a chave do Sino está na gaveta errada" (M13); (2) o julgamento era um ensaio e o preso sumiu (M10); (3) o segundo Noé e "o nome é o teu" (M19). Chegaram quando eu perguntei. Mudaram o que eu sabia. **O sistema não deu nenhuma:** `reviravolta = null`, `reviravoltaMaior = null`, e os dois marcos "descobrir" fecharam por presença, com um vendedor de papel e um preço |
| 6 | **a escalada e o ritmo: a tensão sobe? há cenas que só gastam tempo?** | **2** | Sobe até ao M21 (praça → couro → botica → vultos → "Eu sou o recado") e **desce a pique**: três viagens e um acampamento (M22–M26, 5 respostas e 36 h) que **não acrescentam uma frase de história** (três fios novos que nada têm a ver — o Torneio, Ondine, a Câmara do Dragão); uma masmorra que anda em silêncio e que o Mestre descreve em 400 caracteres; um chefe que não tem nada que ver com o que me trouxe; e a morte por dado, não por decisão |
| 7 | **a agência: as tuas escolhas mudaram algo?** | **3** | Mudaram a cena, nunca o mundo. "Acaba o que ias dizer" → Caetano acaba; mostrar o couro → as chaves; perguntar as chaves → cinco marcas; "poupar" → o lobo vive e "fica a dívida em aberto"; pedir a Belmira que volte → volta. **O mundo não guardou nenhuma:** o preso sumido, a minha acusação errada, o lobo poupado, a tese do cambista — nada volta. A pergunta de maior peso — quem fez o quê a Norberto — **não tem resposta em lado nenhum do sistema** |
| 8 | **a prosa: dá vontade de ler, ou é morna e repetida?** | **3** | Linhas que ficam ("Aqui até o vento pede abrigo", "o sino que dobra para outro marcado na fila", "A gaveta certa é a que nunca devia ter sido aberta"). E uma cadência que mata: **todas as respostas (24 de 28) fecham numa linha de ambiente a pressagiar** — "o som atravessa a feira **como um aviso**", "o cheiro de cera … tem **gosto de recado**", "o ar abafado aperta a rua **como mão no pescoço**", "o cheiro de chuva entra pela porta **como um aviso**"; "como quem/como se" 40× em 42 respostas; "cheiro" em 19; "o sino dobra" a fechar 18. Pressagia sempre, cobra nunca |
| 9 | **o fecho de sessão: acabou com vontade de jogar a próxima?** | **2** | Acabei com **3/22 PV, uma Quimera a 18/18, o companheiro morto e uma heroína morta**; o herdeiro tem uma dívida e um irmão, e **não tem as chaves** (nunca estiveram na bolsa: o inventário só tem um amuleto). A passagem do fio é um grande ecrã e uma má cena. Quero jogar a próxima por causa de **uma coisa só**: a carta de Norberto. E isso é a minha memória, não a do jogo (as sementes guardadas: zero) |

**Média: 3,0 de 5.** Que é o que a pessoa disse — **morna** —, com uma assimetria que o número esconde: **a primeira metade (M1–M21) vale ~3,7; a segunda (M22–M42) vale ~1,6.** A história não esfria devagar: **esfria no instante em que acaba o recado do Noé**, e dali em diante não há mais história, há infraestrutura (viagem, acampamento, masmorra, luta).

### Onde e por que a história esfria

**1. Em M16–M21, quando o recado se cumpre e o sistema não tem o passo seguinte.** O Narrador recebe uma missão de duas linhas
("falar com Inocência Bordão; falar com Noé Laminado", `missoes[0]`) e, cumprida, **nada vem a seguir** na espinha: o próximo
marco do ato 0 é "Encontrar Clóvis Sombra" (O Fio Cego), com a mesma forma. Tudo o que fez M12–M21 bom — o couro, Norberto, a
gaveta errada, as cinco chaves, "o nome é o teu" — **saiu do Mestre**, e **nenhum desses fios ficou guardado como promessa**
(`promessas.sementes = []`; o `canone` tem 29 entradas, incluindo "cinco chaves pretas", "aviso da Muralha" e "dívida de Noé
Cantoneiro", mas nada as cobra). A semente existe; ninguém a rega.

**2. Em M22, quando a história é largada na porta.** O Mestre acaba M21 com um vilão ("Eu sou o recado. A Muralha escolheu um nome,
e o nome não é teu. Ainda.") e **o sistema o esquece**: o homem da fita vermelha não volta (o Cronista o regista como
"emissário da Muralha" e acabou), os "antigos irmãos" não aparecem, e a Muralha — o sítio que a história construiu em 20 turnos —
é substituída pela Fortaleza das Brasas, cujo chefe (uma Quimera) **não tem relação nenhuma** com Norberto, nem com as chaves, nem com
o culto. "Um cultista de manto ensebado" é a única ponta que o Mestre pôde improvisar (M34) para ligar o fundo à história.

**3. Em M15, M24, M26: os fios que o sistema acrescenta nada têm a ver.** Uma viagem, um acampamento e um correio trazem **três
fios novos** (a Câmara do Dragão pede auxílio; o Torneio das Coroas; o pedido de Ondine). Cada um é uma "missão" que o jogador
não pediu e que não toca Noé, a carta nem o culto. O Mestre, obrigado a "tocar" os fios, faz Belmira atravessar 20 km para dizer
"o Torneio das Coroas mexeu com ela. E contigo?" (M24). **Fios sem ligação ao herói não são tensão: são ruído** — e dispersam a
única linha que se tinha.

**4. Em todas as respostas, na última frase.** Os envelopes do sistema (PREPARAÇÃO — "isto é PLANTIO, não acontecimento"; APERTA —
"use o material que você já plantou, sem material novo. Isto ainda NÃO é o desfecho"; AGORA; O QUE FICOU) mandam **plantar e
apertar, nunca revelar**. O Mestre obedece à letra: fecha cada turno com um **pressagio** (o sino, o cheiro, o ar abafado) e
nunca com um **facto**. É o que a pessoa leu como "frio": uma sessão inteira de aviso.

### O que o sistema dá ao Narrador nesses momentos, e o que não dá

| o Narrador recebe | o que é | o que lhe falta |
|---|---|---|
| **MISSÕES** (a etapa atual) | uma tarefa de duas linhas | um **porquê** (quem a quer, o que acontece se falhar) e um **passo seguinte** quando se cumpre |
| **A GENTE** (uma linha por pessoa) | desejos de molde: "lembra do que eu devo, sem levantar a voz", "quer ver antes de aceitar, e conta na frente de mim", "repara em alguma coisa minha que mudou" | uma coisa que a pessoa **sabe** ou **esconde** sobre o que me trouxe aqui; os desejos não têm objeto |
| **PESSOAS CONHECIDAS** | ofício, relação, "dívida comigo · mais do que dinheiro; 3 anos" | o **que** é a dívida: o Mestre a inventa, e **contra** a blindagem de memória (M12) |
| **Envelopes** PREPARAÇÃO / APERTA / AGORA / O QUE FICOU / O MUNDO SE MEXE / O PASSADO VOLTA | o ritmo (plantar, apertar, acontecer, cobrar) | **matéria** — o envelope diz "use o que já plantou" e o que foi plantado está em `canone`, não em `promessas` |
| **Assunto** do compasso (`julgamento`, `intriga_de_corte`, `torneio`) | uma cena de biblioteca | ligação ao marco ou ao antecedente: o julgamento de Caetano (M8–M10) é um assunto sorteado que o Mestre fez render e a pauta abandonou |
| **Escondido** | "🕳 em O Cálice Magro: um alçapão … (percepção 16) · ✉ em O Campo Trêmulo: uma carta lacrada (intelecto 14)" | uma razão para o herói **procurar**: nunca foi procurado |
| **Antecedente-gancho** | "os antigos irmãos o(a) querem calado(a) — ou de volta" (uma linha na ficha) | uma **agenda** dos antigos irmãos (um nome, um relógio, uma ação por semana): `vilaoAgiu = -99`, `nemesis = null` |
| **Espinha** | 6 atos, 4–5 marcos cada: "Encontrar X", "O que Y esconde", "Acabar com Z" | o que cada marco **entrega**: `revelar` lê "o lugar entrou em cena com o herói lá" |

### Os 3 consertos de maior efeito na sensação de "campanha que prende"

1. **Cada marco "descobrir" tem de entregar uma revelação, e o ato 0 tem de ter uma reviravolta marcada, ligada ao antecedente.**
   Quando o herói chega ao sítio de um marco `descobrir`, a pauta traz uma **linha de segredo** do `Escondido` do lugar (um nome, um
   objeto, uma mentira) em vez de fechar a etapa por presença; e o ato 0 marca uma `reviravolta` cuja matéria é o gancho do
   antecedente (os "antigos irmãos"). **Pesado** (muda o que o jogador vive, dentro da Fase MM e sem mexer no formato do save) ·
   `saga.js` (`FEITIOS.descobrir.consequencia`), `missoes.js` (`revelar.ver`), `mundo-base.js` (`Escondido`), `reviravoltas.js` e
   `pauta.js` (a seção).
2. **Um antagonista com rosto e relógio, nascido do antecedente-gancho.** Os "antigos irmãos" ganham um nome, uma agenda de três
   passos e uma ação a cada tantos turnos na pauta (o homem da fita vermelha **volta** com um recado e um prazo); o `vilao.js`
   passa a ler `antecedenteGancho` e o homem do "Eu sou o recado" deixa de ser um emissário solto. **Pesado** (órgão novo na pauta,
   voz do Narrador em massa) · `vilao.js`, `tramas.js`, `prompt.js` (`antecedenteGancho`), `pauta.js`.
3. **As sementes que o Mestre planta voltam cobradas.** O Cronista já grava "cinco chaves pretas", "aviso da Muralha", "dívida
   de Noé Cantoneiro" no `canone`; ligue-as ao `promessas.js` (`sementes`) e ao envelope `O PASSADO VOLTA`/`APERTA`, para que o
   fio plantado no M13 (a gaveta errada) seja **a coisa que aperta** no M20, e não um aviso solto. **Médio** (ligar um sinal dormente
   a um tracker que já existe) · `promessas.js`, o Cronista (o JSON do `canone` → `sementes`), `compasso.js`, `pauta.js`.

*(Fora dos três, mas do mesmo tamanho para a **prosa**: o Mestre fecha 24 de 28 respostas com um presságio de ambiente. Uma
linha de regra no prompt — "termine num facto, num pedido ou numa pergunta, nunca num cheiro" — corta a cadência; é voz do
Narrador em massa, logo **pesado** e da pessoa decidir; `prompt.js`.)*

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Em meia sessão, sim; na outra meia, o sistema o desfaz.**

**Durante vinte respostas, sim.** O gancho, o mundo, a carta que não era para mim, o couro, Norberto, as chaves com cinco marcas,
"Eu sou o recado": cada pergunta minha abriu uma porta, e o Mestre respondeu como quem mestra. Duas das cenas (o ensaio no coreto
e a gaveta errada) são as melhores que joguei aqui em quatro sessões — e **nenhuma estava na pauta**. A mesa se conserta sozinha
(M5), o companheiro tem voz e uma dívida, o veredito do preço chega antes da porta, o recibo aparece onde se lê, e o "como" do golpe
final do companheiro **chega e abre a narração**. Os cinco defeitos da 3.ª que eram do sistema (a masmorra sem fim, o "como", a
companheira partida, a viagem sem destino, a sala sem pauta) **mexeram quase todos**.

**Nas outras vinte e duas, não.** Entrar na Muralha custou três viagens, 36 horas e uma masmorra trocada; o preço que o jogo
dava da porta estava errado por muito; a espinha não registou o que cumpri e registou o que não cumpri; e a morte — que é um
belo ecrã — veio por dado, num sítio que a história não tinha. **A campanha que prendia era a que o Mestre improvisava, e o
sistema não guardou nada disso.** Para a pessoa que escreveu "morna para frio": a frieza **não é da prosa** (que é boa, e tem um
tique), **é do que o sistema entrega depois do primeiro recado** — nenhum passo seguinte, nenhuma revelação, nenhum vilão com
relógio, e três fios novos sem relação com ninguém.

**Os cinco que mexem a sessão, pela ordem:** (1) a porta da masmorra (entrar não entra; a que abre não é a que se prometeu);
(2) o veredito do preço, que ignora o que a própria tela diz; (3) o corte da narração, que a leitura tolerante deixa passar
(e o Revisor paga); (4) a espinha que fecha o que não se fez e abre o que se fez; (5) o Sibi em terceira pessoa. **E a proposta
que mais mudaria o que o jogador vive** é o conserto 1+2 da secção acima: *um segredo por marco e um vilão com relógio.*

| | 1.ª (v9.332) | 2.ª (v9.340) | 3.ª (v9.347) | 4.ª (v9.371) |
|---|---|---|---|---|
| respostas jogadas | 49 | 10 (o teto) | 30 | **42** |
| janela do painel | 374×310 | 374×310 | 374×310 | **800×451** |
| perguntas do sistema | 5 de 12 | 7 de 12 | 4 de 15 | **4 de 14** (1 esquivada; 9 inventadas, quase todas de enredo) |
| inventadas / perdidas | 4 / 1 | 2 / 0 | 4 (+1 contradita) / 5 | **9 (+1 contradita) / 0** |
| onde a sessão partiu | T5 (a história fechou sozinha) | T11 (o teto da API) | M12–M15 (o guardião mudo) | **M22–M26 (a porta da masmorra: 3 viagens, outra masmorra) e M35 (o chefe)** |
| missões fechadas sem jogar · tramas forçadas · "você mudou" | 3 · 4 · 4 | 0 · 0 · 0 | 0 · 0 · 0 | **2 marcos "descobrir" fechados por presença · 0 · 0** |
| recusas falsas de lugar | — | 4 em 10 | 12 em 30 | **0 em 42** |
| o "como" do golpe final chega | 0 de 3 | — | 0 de 2 | **1 de 1** (o do herói não se deu) |
| o revide é aplicado | 0 de 2 | — | 1 de 1 | (não foi preciso) |
| a sala limpa fica limpa | não | — | não | **não provado** |
| esconder-se na luta | sim (nasce o estado) | — | não | **a falha é facto; o custo e a sombra não vêm antes do dado** |
| golpe final do companheiro | — | — | sim (1.ª vez) | **sim, e é narrado primeiro** |
| a masmorra acaba (guardião, chave, chefe) | — | — | não (o guardião mudo) | **o guardião e a chave sim; o chefe matou** |
| a companheira é uma pessoa só | — | — | não (duas fichas, uma homónima) | **sim** |
| a segunda pessoa | — | — | 30 de 30 | **24 de 42 (18 em "Sibi")** |
| chamadas por resposta | ~2,0 | 3,6 | 2,27 (8 de 8 consertos pagos por defeito do sistema) | **2,19** (7 de 8 por defeito do sistema) |
| pedido do Narrador (car.) | — | — | 126.675 | **138.059** (system 72.383; teto aguenta) |
| nota da campanha | — | — | — | **3,0 de 5 (3,7 na 1.ª metade; 1,6 na 2.ª)** |


---

## A escuta, turno a turno (MM18, 11/10)

*A pedido da pessoa: "muitas frases e diálogos sem sentido, alguns nem respondem a pergunta … o mestre não parece estar
interessado em reagir ou responder o player e sim somente em sair jogando informações".* Medido no registo (as 42 chamadas do
Narrador), por script, sem ler o registo inteiro. **Empurrões** = envelopes que puxam história que ninguém pediu (compasso, forma
da cena, mural, trama, evento global, o mundo que se mexe, o passado que volta, boato, correio, sonho, relógio aberto), contados por
`escuta.js#empurraoDe`; "depois" = o que `escutarOTurno` + `seguraOMundo` deixariam passar no mesmo turno. **Origem** de cada coisa
sem nexo: **(a)** veio pronta da pauta ou do prompt; **(b)** o modelo juntou dois fatos do sistema que não casam; **(c)** inventou sem base.

| T | o jogador | perg. | reage 1.º | respondeu | empurrões | o que não faz sentido · origem | o sistema sabia? · entregou? |
|---|---|---|---|---|---|---|---|
| 1 | (abertura) | — | — | — | 0→0 | "A lei aqui é o Sino", sem consequência nenhuma (a: `abertura.js` pede "uma lei daqui" + a lei do Léxico) · "Inocência Bordão, músico … ele" (a: abertura, ofício no masculino) | — |
| 1b | de onde nos conhecemos? por que vieste? | sim | sim | **não** ("depois do almoço") | 0→0 | a esquiva veio pronta: A GENTE "Euzébio encontra um serviço urgente" (a: `interprete.js#atrasa`, que dispara com `euDevo` — o movimento de quem foge de uma dívida, dado ao credor) | **sabia** (PESSOAS CONHECIDAS: 3 anos, a dívida) · entregou, e outra linha mandou esquivar |
| 2 | onde encontro Inocência? quem manda? | sim | sim | sim, 2/2 | 1→0 | Euzébio "pago, se me disseres onde arranjar um serviço urgente" (a: `atrasa` outra vez) · "o Belmira" que vira "a mulher do balcão" (b: homónimos da base) | sistema (PERGUNTOU) · entregou |
| 3 | o que sabes de Noé, onde está? | sim | **não** (abre pelo "músico" do turno anterior) | parcial, inventado ("perto do Cálice Magro") (c) | 1→0 | a briga dos padeiros e moedores (a: compasso PREPARAÇÃO julgamento) · PERGUNTOU "como se reconhece quem é bem-vindo" (a: `cidade-por-dentro`, por "Reconheço esta letra") | **sabia**: Noé Laminado é gente da base em Rua dos Retalhos, Rio Cinzento (`oQueExisteAqui`; `abertura.alvo.onde`), e Inocência é a pista que o sabe · **não entregou**: nenhuma secção diz o que a pista sabe do alvo, e a pergunta foi lida como outra |
| 4 | que apelido? o que sabes de Noé? | sim | sim | sim, inventado ("entrou na Muralha"), contradito no T10 (c) | 1→0 | os guardas a olhar (a: compasso APERTA) | igual ao T3 · PERGUNTOU deu a gíria pelo "apelido" |
| 5 | quanto tempo à Muralha? onde dormir, a quanto o quarto? | sim | sim | 3/3, o preço inventado (20 lâminas) (c) | 0→0 | o sino fora de hora (a: o SINO da abertura, a contar turnos "sem avanço" com o jogador a falar com a pista) | distância: sistema · **pouso: sabia** (`PRECOS_DO_POUSO`) · **não entregou**: cortado pelo teto (a economia de 274 caracteres ficou) e a pergunta lida como o passado de Inocência ("quanto tempo") |
| 6 | quanto custa a resma e a tinta? | sim | sim | sim, inventado (10 e 5) (c) | 1→0 | Inocência aparece no mercado (a: PROCURA "procurei Inocência" — "agradeço a Inocência" lido como procura) · "conte a verdade na frente dela" (a: A GENTE `quer_ver`, "Pago a bebida" lido como PAGUEI) · o julgamento (a: compasso A UM PASSO) | **sabia** que nenhuma banca vende papel (mercado) · não entregou: nenhuma secção diz "aqui não há" |
| 7 | (a confissão) | — | sim | — | 1→1 | "o julgamento começa" (a: compasso AGORA) · PERGUNTOU gíria (a: "me chamam" lido como gíria) | — |
| 8 | de que acusam Caetano? quem? | sim | sim | sim, inventado (c) | 2→1 | o preso é Caetano (a: o assunto do compasso sem matéria; o Narrador escolheu o homónimo) | **não sabia**: o assunto "julgamento" não traz quem nem de quê |
| 9 | defendo Caetano | — | sim | — | 2→1 | o preso no coreto "já pregou o cartaz no mural" (a: `ofertas.js` × compasso no mesmo turno; à vista no rodapé 26 turnos) | — |
| 10 | Noé nos registos? livros do Sino? | sim | sim | 1/2 (os livros, evasiva) | 0→0 | "Caetano, o arquivista" (b: o registo casou o nome curto com o homónimo, e o Portão corrigiu para o ofício errado) · "Rua dos Retalhos" sem cidade (a: PROCURA) | Noé: sistema · livros: não sabia |
| 11 | que dívida, quanto, desde quando? | sim | sim | parcial (o couro; quanto e desde quando, não) | 1→0 | o couro que "fala sozinho" (a: forma da cena — virou a resposta) | sabia "mais do que dinheiro; 3 anos" · entregou; o quanto não existe |
| 12 | o nome do irmão? | sim | sim | sim, inventado (Norberto) (c) | 1→0 | Filhos do Sino de fita, "cortesia exagerada" (a: compasso PREPARAÇÃO intriga) · Inocência chama "a mulher de capa verde" (b: duas linhas de A GENTE para duas Inocências — partiu-se em duas) | não sabia |
| 13 | parto para Rio Cinzento | — | sim | — | 0→0 | — | — |
| 14 | (o correio) | — | — | — | 2→1 | "a Câmara do Dragão" num mundo onde os dragões das histórias antigas NÃO EXISTEM (a: correio × Léxico) | — |
| 15 | o óleo; e Noé? | sim | sim | sim (é ele) | 2→1 | cartaz "A caçada de Noé Laminado", assinado por Noé (a: `ofertas.js` — o alvo da principal a oferecer trabalho) | sistema |
| 16 | foi Norberto? a gaveta errada? | sim | sim | sim, inventado (c) | 2→1 | "Hildebrando Cobre, A Boca do Mundo" (a: o mundo se mexe; o epíteto é também o do Dragão Ancião — b) | não sabia |
| 17 | quantas chaves? que marca? quem são? | sim | sim | **não** | 0→0 | Noé Laminado entra ferido, com o herói ao lado dele (a+b: o SINO tocou "Noé chega a Alto do Sal ferido" porque a etapa `falar_com` nunca fechou) | chaves: não sabia · atropelada pelo acontecimento |
| 18 | quem de vós é Noé? | sim | sim | sim, inventado "Noé Cantoneiro" (c, a remendar o T17) | 1→0 | "Sibi" nasce (a: A GENTE `usa_o_nome` — "passa a me chamar pelo apelido que só ela usa": a origem do defeito 6) | **sabia** (o boticário é Noé, base) · entregou, e entregou o contrário (o sino) |
| 19 | o que quer a Muralha? onde fica a porta? | sim | sim | sim, inventado; "Rua dos Retalhos de Alto do Sal" (b: PROCURA sem cidade × mapa) | 1→0 | o homem da fita (a: compasso AGORA) | não sabia |
| 20 | quem és, quem te manda? | sim | **não** (abre pela dívida) | sim, inventado ("eu sou o recado") | 1→1 | Euzébio à frente (a: A GENTE `lembra_a_divida`) · O PASSADO VOLTA "Inocência reaparece" com o ONDE a dizer "Inocência está a 8 h, não entra sem 8 h narradas" (a: dois órgãos contraditórios no mesmo pedido) | não sabia |
| 21 | vou à Muralha | — | sim | — | 1→1 | "a corte de Rio Cinzento já escolheu o teu lado" numa aldeia pastoril de uma rua, sem guarda (a: compasso O QUE FICOU, intriga de corte × a ficha do lugar) | — |
| 22–23 | (acampamento, manhã) | — | — | — | 4→1 | Euzébio "pulei no rio atrás de ti" (a: A GENTE `lembra_de_antes` × o rodapé "NUNCA invente memórias") · Belmira à porta da Muralha, a 20 km (a: A GENTE contou-a presente) · "o Torneio das Coroas mexeu com ela" (a: evento global, que toma a DIREÇÃO do arco no lugar de Noé) | — |
| 24–25 | entro na Muralha | — | sim | — | 3→2 | — | — |
| 26 | desço | — | sim | — | 1→1 | abre a Fortaleza das Brasas, não a Muralha (a: a porta da masmorra, defeito 1) | — |

**Os números.**
- **Respondeu à pergunta em 11 de 16** turnos com pergunta (14 de 16 contando as 3 parciais; sem resposta: T1b e T17).
  **Reagiu primeiro em 14 de 16** (T3 e T20 abrem por outra coisa — nos dois, uma linha de A GENTE).
- **Empurrões: 23 em 18 dos 24 turnos do jogador**, e 4 de uma vez num turno do sistema. **12 dos 18 chegaram com o jogador em
  cima do fio** (a perguntar por Noé ou a ir à Muralha); **nenhum** chegou porque o jogador tivesse empacado — a escada do encalhe
  conta dias e nunca disparou. Com a escuta: **10 empurrões em 10 turnos, nunca mais de 1**, e 6 dos 10 tocam o fio (a ponte sai
  da própria história).
- **A GENTE: 25 linhas**; nos 16 turnos de pergunta, **15 eram maneiras de não responder** (responder com outra pergunta, o serviço
  urgente, a troca sem nada a ver, lembrar a dívida, chamar terceiro, calar o que sabe). Agora: uma pessoa só, e nenhuma destas.
- **A frase do jogador** ia a 7–14 mil caracteres do fim do pedido (debaixo da base do mundo). Com a fiação, é a última linha.
- **Turnos sem avanço da espinha antes de o mundo empurrar:** antes, **0** (empurrava de qualquer maneira); com a escada, o maior
  desvio do fio desta sessão (o julgamento, 4 turnos seguidos) chega ao degrau do sinal no 5.º.
- **Origem das 28 coisas sem nexo:** **(a) 19** vieram prontas da pauta ou do prompt · **(b) 4** o modelo juntou dois fatos que não
  casam · **(c) 5** inventou — e em 2 destas 5 (o quarto, o paradeiro de Noé) o sistema **sabia** a resposta.
- **Sabia e não entregou:** das **10 perguntas que falharam** (sem resposta, esquivadas ou inventadas), o sistema **sabia em 5**
  (de onde nos conhecemos; onde está Noé; o quarto; o papel; quem é Noé). Em 2 entregou, e outra linha mandou o contrário (A GENTE a
  esquivar; o sino a trazer outro Noé); em 3 **não entregou** — uma por nenhuma secção tratar "o que a pista sabe do alvo", uma por o
  fato ser cortado pelo teto e a pergunta mal lida, uma por nenhuma secção dizer "aqui não há". **As outras 5 eram matéria que o
  sistema não tem** (a acusação do julgamento, o irmão, as chaves, o que quer a Muralha, quanto é a dívida) — todas de fios que o
  próprio sistema abriu sem conteúdo (o assunto do compasso) ou que o Narrador inventou e ninguém guardou.
- **A C2 (a cidade fora do prompt dentro da masmorra)** não deixou nenhuma pergunta sem resposta nesta sessão: dentro da Fortaleza
  não se perguntou nada da cidade.

**As contradições entre órgãos** (para a auditoria de coerência que vem a seguir — só a 12 foi consertada aqui):
1. **O sino da abertura × a missão × a cena:** a etapa `falar_com` não fecha (o Cronista põe Noé no cânone, não em `pessoas`), o sino
   conta turnos "sem avanço" e toca "Noé chega ferido a Alto do Sal" com o herói ao lado dele em Rio Cinzento → um segundo Noé.
2. **O compasso × a ficha do lugar:** o assunto "intriga de corte" numa aldeia pastoril de uma rua só → "a corte de Rio Cinzento".
3. **O passado que volta × o Geógrafo:** "Inocência reaparece agora" e "Inocência está a 8 h, não entra sem 8 h narradas", no mesmo pedido.
4. **A GENTE × o rodapé:** "menciona uma coisa que fizemos juntos" e "NUNCA invente memórias", no mesmo pedido.
5. **O mural × a principal:** o alvo da principal (Noé) prega "A caçada de Noé Laminado"; o preso (Caetano) prega um cartaz no turno
   do julgamento dele.
6. **O Léxico × os chefes × o correio:** dragões "não existem neste mundo", e há um Dragão Ancião, uma Câmara do Dragão, e dois chefes
   com o mesmo epíteto (A Boca do Mundo).
7. **O evento global × a espinha:** depois do Torneio, a DIREÇÃO DO MOMENTO passa a ser o Torneio, e Noé sai das peças na mesa.
8. **A procura × o mapa:** "Noé está em Rua dos Retalhos", sem cidade; o Narrador pôs a rua em Alto do Sal duas vezes.
9. **O Intérprete × a ficha:** `atrasa` ("encontra um serviço urgente") dispara com `euDevo` e é dado ao credor.
10. **A base × o registo × o Portão:** três pares de homónimos nas oito primeiras pessoas; 7 das 8 chamadas do Portão.
11. **O género:** "Inocência Bordão, músico … ele" (abertura) contra a mulher do alaúde; "Noé … ela" (procura) contra "o vendedor de ervas".
12. **A Mesa Posta × a ação:** "escalar a muralha na chuva" em 4 turnos em que ninguém escalava — **consertado na MM18** (as chaves
    eram substantivos: "muralha" estava no nome da masmorra, "parede", "bolso", "seguir").
