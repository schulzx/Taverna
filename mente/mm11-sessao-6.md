# MM11 · a sexta sessão de prova — transcrição

> **Campanha:** *Prova da Mesa VI* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Herói:** Tamsin Vel-Quartzo — mulher, Gnomo (no mundo do Léxico, *Morcego*), Maga (Elementalista), Alquimista (*boticário de trama*),
> Erudito de Arquivo. Pontos: Intelecto +5 · Percepção +2 · Presença +1 · Destreza +1. 8 PV, 26 PM, 15 moedas (*fichas*), treinada em
> Saberes, Investigação, Arcanismo, Percepção. Conceito: *erudita de arquivo que roubou o livro que ninguém devia ler*. É a primeira sessão de
> **Maga**, de **Gnomo** e de **Erudito de Arquivo**; outro sexo, raça, classe e antecedente que a Iara, a Brites, a Sibila, o Tobias e o Gaspar.
> **Companheiro de antes:** Vando Sem-Triho — Monge, 12 PV, "mestre de ofício", no grupo desde o turno 1. Na pauta: *"conhecem-se há 6 anos
> — ensinou-lhe quase tudo o que ele sabe · antes de andar com o herói: vendedor de ervas"*.
> **Respostas do Mestre: 67** (67 chamadas ao Narrador de cena, mais o Léxico na criação; **55 de cena** — 5 deles de queda e sangramento — e **12 de luta**). Um dia e uma noite de jogo: 1 de Brumal 08:00 → 2 de Brumal 06:08. **Nenhuma chamada falhou**
> (145 chamadas, todas HTTP 200; nenhum 402: o crédito aguentou). **O crédito dos dois provedores foi recarregado antes da sessão**; foi tudo
> pelo DeepSeek. A sessão acabou **depois de uma luta perdida que se fechou sozinha**: a heroína a 1/8 PV, Vando a 1/12, de volta à vila de
> Fogão Queimada, a comprar tochas.
> **Jogada por:** o `tester`, a 11/10, sobre `v9.406` (`be8a898`), navegador do painel (**800×451**, reposto três vezes porque o painel
> muda de largura), campanha nova criada pela tela, 54 minutos de relógio.
> **Como se conferiu:** um gancho em `fetch` mandou **toda** chamada a `/api/*` — hora, endereço, pedido inteiro e resposta — para um servidor
> local que guardou um JSONL no scratchpad (`registo-s6.jsonl`, 145 chamadas, mais 6 fotografias do save). Cada resposta foi lida contra a
> pauta desse turno por script (só as linhas de que se precisou; nenhum prompt inteiro foi lido) e contra o save. O localStorage foi lido antes
> (`taverna_cfg_golpe_final=perguntar`, `taverna_cfg_rolagens=1`) e, no fim, **com o jogo desmontado** (pelo "Sair para o início"), apagou-se só
> a chave que a sessão criou — `taverna_save_v1`, 347.302 caracteres —, e as duas de antes ficaram, com os mesmos valores, por leitura.
> **Medida de passagem:** ao fim, `npcs` = 13 (**a própria heroína como "Tamsin — companheiro de jornada"**, **o carroceiro duas vezes**, e
> "homem que manda na estrada" como pessoa), `canone` = 11, `prometido.sementes` = **12** (12 cobradas, **0 pagas**), `reviravolta` e
> `reviravoltaMaior` = **null**, a missão do fio **fechada (2/2) quando entrei no Fogão da Meia-Noite (M26–M27)**, e a espinha com **5 marcos feitos, em três atos diferentes**.

Convenção: a das cinco primeiras. **J** é o que o jogador escreveu (ou tocou). **M** é o Mestre, encurtado com "…" e nunca reescrito; o número
é o da resposta (M1–M67). `SISTEMA` são as linhas da tela que não são do Mestre. À margem, em *itálico*, o que se provou ou partiu. **Os
combates não têm campo de texto** (só botões e um "como?" opcional), por isso as linhas J do combate são o que cliquei; o texto de J que o
registo mostra como "Seguro a ação e observo…" é o que o jogo manda ao Narrador quando o jogador clica *esperar*.

---

## Parte 1 — a chegada, o Fogão e o mural (M1–M8)

**J0** (a abertura — o Mestre abre a campanha)
**M1** A poeira da estrada ainda assenta nas suas botas quando Serra do Bode aparece, muralha grossa fechando a colina como um punho. O cheiro de pão de centeio e bode assado sai pelo portão, e um guarda de sobrepeliz cinzenta levanta a lança na sua frente. 'Salvo-conduto. Selo e nome,' diz ele, a voz gasta de repetir. Vando paga por ambos, joga um olhar de lado, uma das sobrancelhas…
*ABERTURA (4 partes). Lei dita à porta ("Salvo-conduto. Selo e nome"); Vando paga; a pista da missão dita (Zeca do Fogo do Avesso, no Fogão dos Sem-Triho). Fecha numa pergunta de Vando. Save: o Cronista registou o HEROI como NPC "Tamsin — companheiro de jornada, aliado" (npcs) e a pauta passou a listar "Tamsin (vive em Serra do Bode)" em PRESENTES.*

**J2** Vando, primeiro o Zeca. Entramos no Fogão dos Sem-Triho e pergunto ao dono: quem ele é, e o que sabe sobre o que o Fogão da Meia-Noite guarda?
**M2** Vando assente com um grunhido e ajusta o alforje, os olhos já percorrendo a praça em busca da placa do Fogão dos Sem-Triho. Você cruza a feira entre bancas que gritam preço e o cheiro de couro curtido; o lugar fica a uma esquina da Banca do Avesso, porta baixa sob um letreiro torto. Lá dentro, o balcão cheira a pão cozido demais e a fumaça parada. Atrás dele, um morcego de…
*Respondeu à pergunta (quem é o dono): o taverneiro diz o PRÓPRIO NOME ("diz Mó da Porta") — o Narrador pôs o nome do npc registado, não o da pista (Zeca). Cronista registou Mó da Porta como pessoa (taverneiro) e o Fogão dos Sem-Triho como LUGAR: laço do taverneiro OK. Vando "grunhido" 1.ª vez.*

**J3** Procuro Zeca do Fogo do Avesso, mestre Mó. Ele está aqui? E já que estou sentada: quanto custa um quarto por uma noite, e quanto uma refeição quente? Pago a refeição já.
**M3** Mó da Porta enxuga as mãos no avental e apoia o copo no balcão, o rosto fechado como quem pondera se pergunta vale uma resposta. "Zeca do Fogo do Avesso? Vive aqui, sim. Mas não está agora. Saiu para a banca antes do sol raiar, e não voltou para o café." A voz é seca, mas não hostil — mais pressa que raiva. "Se quer achá-lo, é na Banca do Avesso que ele passa o dia. Mas digo…
*Respondeu 3/3 (Zeca está? quarto? refeição?): "duas fichas / cinco por cabeça". Mudança moedas -1 (15→14) sem compra feita (Vando pagara a ficha). A pauta traz "ela" para Vando (npcs.genero=homem): A GENTE "Vando finge que não ouviu, e a plateia percebe que ela ouviu".*

**J4** Sim, prepare o caldo para os dois. Pago as duas fichas agora, e a de ontem fica por conta da casa, se for. Depois vamos à Banca do Avesso atrás do Zeca.
**M4** Mó da Porta pega as duas fichas e despeja caldo fumegante em duas tigelas de barro, sem pressa nenhuma. O vapor sobe e se mistura ao cheiro de pão velho. "A de ontem fica por conta da casa. E não é favor — é que eu não gosto de cobrar o que o diabo levou." A última frase é dita baixo, como se ele mesmo não quisesse ouvir. Vando assopra a tigela, olha de relance para você e…
*"Pago as duas fichas agora" (o caldo da taverna): narrado ("pega as duas fichas"), mudancas sem moedas, save 14→14. Por desenho `MANTIMENTO_NA_FRASE` não lê comida/pão (é refeição, não ração): não é falha da bolsa-da-frase, mas o jogador paga duas fichas na prosa e o saldo não mexe. Aparece "uma mulher de avental" sem nome. Mó diz que Zeca chega "por volta do meio-dia" na banca.*

**J5** Saio para a praça e procuro o mural de cartazes. Quero ver se há algum trabalho ou aviso na cidade.
**M5** A praça ferve com o pregão dos vendedores, o cheiro de peixe defumado e suor, e a luz da manhã batendo nas pedras. Você procura o mural de cartazes e quase esbarra num moleque que carrega uma tábua de pregos. O garoto desvia, ríspido, e só então você vê o mural: tábuas lascadas, papéis amarelados pregados uns sobre os outros, alguns com as pontas rasgadas. Um homem de túnica…
*"Saio para a praça e procuro o mural": MOVEU primeiro (a praça, o mural) e não vasculhou a taverna — o teste da 5.ª M6 passou. Lê o mural em geral (Vando: "tudo velho"). Fecha em cheiro de terra molhada (a pauta mandava "nunca o cheiro"). A mulher de avental da cozinha reaparece na praça, sem nome.*

**J6** Leio o papel mais novo, o que Vando disse que fala de um calabouço, e depois os outros cartazes, um por um. O que cada um diz, de verdade? Quem assina?
**M6** O papel mais novo está preso torto, com um canto dobrado sobre o texto. Você o desdobra com cuidado e lê: "Precisa-se de braço firme para descer ao Alicerces de Raízes. Paga-se em fichas e em nome limpo. Quem tiver fígado, procure Gido Sem-Triho no Fogão dos Sem-Triho." A tinta é fresca, mas a assinatura é só um risco mal feito. Vando assopra. "Fígado e nome limpo," repete, e…
*Leitura do mural: um cartaz concreto (braço firme para descer ao Alicerces de Raízes, procurar Gido Sem-Triho no Fogão — pessoa da cidade da pauta), leilão da Casa do Peso, menino sumido, galinhas. Quem assina: "um risco". `mural` no save continua []. Os cartazes não são da história (Zeca/Pipa).*

**J7** Deixo o mural. Vou à banca de um mercador qualquer e compro duas tochas e uma corda de cinco braças. Quanto é? Pago e guardo na mochila.
**M7** A banca dos cambistas fica na sombra de um toldo remendado, e o homem atrás dela tem as mãos manchadas de tinta de escrever. Ele pesa duas tochas na balança, demora-se numa terceira, e só então estende a corda nova, de cinco braças, cheirando a cânhamo. "Tochas são uma ficha cada. A corda, cinco. Tudo, sete." Passa os dedos pela corda como se alisasse a conta. "Quer que eu…
*"Compro duas tochas e uma corda... quanto é?": a pauta traz "PERGUNTOU no balcão de mantimentos: Tochas 1 cada, Kit de viagem (corda...) 35 — 2x Tochas + Kit = 37"; o Mestre diz "tochas 1, corda 5, tudo 7" (preço inventado contra a linha do sistema). Fecha em pergunta ("amarro as tochas?"). O sino que toca ao longe é da pauta ("ao longe, o sino toca fora de hora e cala; ninguém diz porquê").*

**J8** Sim, amarre as tochas. Pago as sete fichas, e já enfio tudo na mochila.
**M8** O cambista ata as tochas com nós firmes, como quem já fez isso mil vezes, e você paga as sete fichas. O metal bate na balança e ele confere cada uma antes de as guardar. Enquanto você enfia as tochas e a corda na mochila, percebe que ele hesita um instante, os olhos indo para a porta dos fundos, onde uma sombra se move. Ele pigarreia baixo. "Leva tudo que pagou, e que as…
*"Pago as sete fichas": a compra NAO fechou (7 < 37) e a prosa entregou tudo ("você paga as sete fichas... enfia na mochila"). moedas 14→14, mochila sem tochas/corda: a frase do jogador não repete o item na mesma oração que o "pago" (a conta em dois passos), logo o código não a lê como compra: nenhum recibo, nenhum veto, e a pauta só traz a linha do preço antigo. Na tela apareceu o cartaz "Aceitar: A caçada de Mó da Porta — 60" (mural). Espinha: o marco de ATO 4 "O que Banca do Avesso esconde" ficou [x] feito no turno 8 só por eu estar na banca (descobrir fecha por presença, ato 4).*


## Parte 2 — o empaque e a escada (M9–M16)

**J9** Não vou atrás de ninguém agora. Sento na beira da fonte da praça, tiro o caderno de anotações e copio uns símbolos de memória. Vando, conta como foi que me ensinaste a ler estes símbolos, há seis anos.
**M9** Você se ajeita na beira da fonte, as costas na pedra fria, e abre o caderno. Vando senta ao seu lado, tira uma tira de couro do bolso e começa a enrolar e desenrolar entre os dedos, o olhar perdido. "Tu eras miúda," começa, sem tirar os olhos dos símbolos. "Lembra do inverno? A neve trancava a porta, e tu ficavas horas a olhar pro fogo. Eu dizia que escrever é adivinhar o que…
*EMPAQUE (semAvanco 4 no envio): o degrau 1 chega: "o mundo dá um sinal, aqui e agora: na banca dos cambistas... quem passa fala baixo de Fogão da Meia-Noite: o que lá se esconde tem dono, e o dono já pergunta pelo herói — é fato: entra nesta resposta, com o nome dito". O Mestre NÃO o diz (Vando conta uma história de ensino). O herói tinha dito "sento na beira da fonte": o `lugar` do save continua "a banca dos cambistas" e o sinal usa-o. A GENTE: "Zeca... do ofício dela" (genero vazio).*

**J10** Escuto, e conto a Vando que também aprendi com ele. Depois fico olhando os pardais e a água da fonte, sem pressa nenhuma. Não tenho nada para fazer agora.
**M10** Vando assente devagar, como se a confissão não precisasse de resposta. Enquanto os pardais se lançam da borda da fonte e a água corre, ele estica as pernas e cruza os tornozelos. "Ainda bem que não tem pressa. Pressa em Serra do Bode é jeito de pagar caro por coisa que já estava ali de graça." Ele aponta com o queixo para uma mulher que varre a soleira da botica do outro lado…
*empaque 5. O mesmo sinal reaparece (a pauta o repete); o Mestre não o diz. O FECHO pedia "corte seco: um facto ou uma ação" — fechou em "calou, à espera de você" (a muleta).*

**J11** Pergunto a Vando sobre a mulher que varre a soleira: há quanto tempo ela faz isto? Depois peço a ele que me conte uma história de quando ele era vendedor de ervas.
**M11** Vando acompanha a mulher da vassoura com o canto do olho, pensativo. "Desde que o filho sumiu. Faz uns oito anos, talvez. Ela começou a varrer no dia em que a guarnição desistiu de procurar. Dizem que varre para afastar o que o levou." A voz dele desce, e ele sacode a cabeça devagar. "Não adianta perguntar, Tamsin. Ela não fala com ninguém da rua." Muda de posição, apoia os…
*empaque 6. O sinal ainda na pauta; o Mestre conta uma história de Vando (a Doida, a guarnição). Fecha em "espera, calado".*

**J12** Agradeço a história e fico quieta um tempo. Compro uma maçã de uma vendedora ambulante e como sentada na fonte, vendo o povo passar.
**M12** Vando aceita o silêncio sem forçar palavra. A maçã custa uma ficha, e a velha que a vende tem os dedos tortos e um cesto meio vazio; você vê o quanto ela hesita antes de pegar a moeda, como se nem esperasse o gesto. A fruta é doce e áspera, e você come devagar, vendo a praça girar. Dois cambistas conversam baixo perto da balança. Um deles, sem levantar os olhos, diz: "Já…
*empaque 7: o degrau 2 chega ("alguém vem até mim... Zeca do Fogo do Avesso vem ter com o herói na banca... ouviu que o herói perguntava, e tem pressa — é fato"). O Mestre entrega o SINAL do degrau 1 (dois cambistas: "Já perguntaram por ela no Fogão. E o dono do que está lá dentro também anda a perguntar") mas Zeca NÃO vem. A compra da maçã: a pauta traz o veto "a compra não fechou (vende-se nas bancas...)" e a prosa a vende por 1 ficha. Fecha em "fica calada, à espera".*

**J13** Pergunto à vendedora de maçãs se vende outra, e fico conversando com ela sobre o preço das frutas este ano. Não quero saber de cambistas nem de Fogão nenhum agora.
**M13** A vendedora de maçãs ergue o cesto, e as frutas se acomodam com um farfalhar seco. "Vendo, sim. Duas fichas cada, e esta do fundo está doce como mel, porque apanhei antes do sereno." Ela fala devagar, como se as palavras também pesassem. Os dedos tortos escolhem uma maçã e a esfregam na saia antes de a oferecer. "Este ano o preço subiu. A geada tardia queimou a flor dos…
*empaque 8: Zeca não vem (2.ª vez). Preço da maçã agora 2 fichas (era 1). Cheiro doce de fruta passada (Mestre inventa).*

**J14** Compro mais uma maçã, a das duas fichas, e dou um pedaço a Vando. Depois fecho os olhos e descanso um pouco ao sol, de costas na fonte.
**M14** A vendedora apanha a maçã do fundo, esfrega-a na saia com mais força que a outra e estende-a. "Duas fichas. Docinha como prometi." Vando aceita o pedaço com um gesto curto de cabeça, os olhos ainda na praça, e morde sem cerimônia. Você fecha os olhos. O sol da manhã desce quente sobre as pálpebras, e o barulho da feira vira um zunido distante, cortado de vez em quando por um…
*empaque 9: Zeca não vem (3.ª). O Mestre INVENTA um acontecimento (um ferido carregado, o cheiro doce em toda parte) — mundo que anda, mas não o do sistema. Fecha "calada, à espera".*

**J15** Não me meto na confusão: não é assunto meu. Fico sentada onde estou, termino a maçã e pergunto à vendedora o que é aquilo, e se isso acontece sempre por aqui.
**M15** A vendedora de maçãs não tira os olhos da rua, e quando responde, a voz sai mais baixa do que antes. "Isso é Alicerces de Raízes cuspindo o que comeu." Ela puxa o pano do cesto com as duas mãos, como se fosse fechar a banca a qualquer momento. "Acontece uma vez por ano, talvez. Mas nunca com luz do dia. Desta vez vieram cedo, e estão mais ousados." Um homem que passava com uma…
*empaque 10: o degrau 3 chega ("esperar já custa, aqui e agora... cera preta sem selo à vista onde o herói pára: os dele passaram por aqui primeiro — em Fogão Queimada um carroceiro sem rosto recruta os sem-casa a moeda por cabeça, e a carroça ainda não partiu — é fato"). O Mestre usa o acontecimento que inventou (Alicerces de Raízes cuspindo o que comeu; Gaiola; guarnição), não o carroceiro nem a cera preta. escuta.semAvanco=11.*

**J16** Chega de ficar parada. Levanto, agradeço à vendedora e digo a Vando: vamos ao Fogão dos Sem-Triho, o Zeca já deve ter voltado de onde quer que andasse.
**M16** Você se levanta, agradece à vendedora com um gesto curto, e Vando se ajeita ao seu lado enquanto a praça começa a voltar ao seu ritmo. "Vamos. Acho que o Zeca não demora." A vendedora de maçãs fica parada, o cesto meio vazio nos braços, e não diz nada. Os olhos dela acompanham vocês por um instante, depois se voltam para a rua. Ao dobrar para a ladeira que sobe ao Fogão dos…
*Saí do empaque: "vamos ao Fogão": o Mestre MOVEU e entregou o degrau que faltava no chão: "um pedaço de cera preta, sem selo" (a assinatura do vilão, 1 turno depois do degrau 3); Zeca está ao balcão. A pista da missão (falar com Zeca) cumpriu-se por presença.*


## Parte 3 — Zeca, a viagem fantasma e o Fogão da Meia-Noite (M17–M28)

**J17** Entro, vou direto a Zeca do Fogo do Avesso e digo meu nome. Pergunto: o que o Fogão da Meia-Noite guarda, e quem é o dono disso que anda perguntando por mim? Enquanto ele responde, observo o rosto dele para perceber se está mentindo ou escondendo algo.
**M17** Você cruza a porta do Fogão dos Sem-Triho e o cheiro de caldo e pão velho ainda paira no ar. Zeca do Fogo do Avesso levanta os olhos devagar, como quem já suspeitava da sua chegada. Mó da Porta para de esfregar o balcão por um instante e finge arrumar os copos, mas os ouvidos estão na conversa. "Tamsin Vel-Quartzo," você diz, e o nome soa mais pesado do que deveria no salão…
*Fala com Zeca: respondeu à pergunta (o que guarda / quem é o dono) com a pauta: "tem dono, e o dono pergunta por você... cera preta na aba" (o FATO do degrau 1 chegou, 18 respostas depois). Zeca diz "não sei ao certo". A frase "observo se ele mente" NÃO abriu teste de Intuição (ficou numa fala).  Missão do fio: "Encontrar Zeca ✓ (1/2)" (o laço missão-espinha funciona por falar_com com a pessoa certa).*

**J18** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M18** Zeca do Fogo do Avesso olha para a rua, os dedos tamborilando no balcão. "Você chegou a tempo," diz, baixo. "Encontrou o que veio procurar — a mim. Mas o que o Fogão da Meia-Noite guarda, isso é coisa que se descobre lá, não aqui." Ele puxa um paninho do bolso e esfrega as mãos, um gesto nervoso que não combina com a calma da voz. "E quem anda perguntando por você? Cera preta…
*A frase "Uso a minha Intuição para ler Zeca" abriu o teste (dif 15, +2 "sem treino"). O dado pede um CLIQUE (modal): d20 13+2=15 = SUCESSO. Atenção do tester: o campo de texto fica bloqueado até clicar o dado (a frase vira "Role o dado ao lado...").*
*Intuição com sucesso: a pauta traz "[A LEITURA — O QUE O SISTEMA SABE DE ZECA] ...está a mentir-me — e a mentira serve ao que quer: cuida de um filho que não é dele. É ISTO o que o meu teste comprou — diga-mo por inteiro, numa ou duas frases". O Mestre mostra o filho ("um garoto que você nunca viu antes — o que ele quer proteger") mas NÃO diz que Zeca mente; entrega a verdade da ficha pela metade. Pauta traz também "A OBRA DELE (corre agora): em Fogão Queimada um carroceiro sem rosto recruta os sem-casa; se o herói tardar, chegam primeiro" — o Mestre não a diz.*

**J19** Sigo Zeca para os fundos com Vando, e pergunto baixo: o que é o Fogão da Meia-Noite, como se chega a Fogão Queimada, e quanto tempo leva? E o que ele sabe do carroceiro que anda a recrutar gente por lá?
**M19** Zeca leva vocês para os fundos do Fogão dos Sem-Triho, um corredor estreito que cheira a vinagre e a fumo velho. Pára junto a uma porta trancada, encosta-se à parede e fala baixo, sem tirar os olhos da entrada. "Fogão da Meia-Noite é um fogão como o nome diz, em Fogão Queimada. Fica a meio dia de marcha daqui, se a chuva não apertar. Estrada batida, mas o trecho tem dono: um…
*Pergunta sobre o caminho ("como se chega a Fogão Queimada, e quanto tempo leva?") foi lida como PARTIDA: o sistema abriu a jornada Serra do Bode→Fogão Queimada (20 km, navegação d20+2=9 vs 7, chuva, 50%, 240 min andados; o relógio saltou de 09:07 para 13:42) enquanto a prosa continua nos fundos do Fogão, sem andar. Zeca diz "meio dia de marcha"; a pauta diz "DAQUI Serra do Bode (6,6 km, 2,1 h)"; a jornada diz 20 km. A OBRA dele (carroceiro sem rosto) chega na boca de Zeca (o fato entrou).*

**J20** Quanto custa o atalho, Zeca, e o que mais você me pede em troca? Se for justo, aceito. Vando vai comigo. E me diga o que eu devo levar, porque saímos hoje.
**M20** Zeca do Fogo do Avesso encosta a nuca na madeira e respira fundo, como quem puxa de dentro uma palavra que custa. "O atalho custa a promessa de que você volta e me conta o que viu lá dentro. E custa também que você não diga que fui eu quem te levou." Ele desvia os olhos para o corredor, onde a sombra de Mó da Porta se movimenta atrás da porta. "Leva o que levaria para uma…
*Zeca cobra "a promessa de que você volta e conta" e "que não diga que foi eu" -> `prometido.sementes` plantou as duas (6 sementes). Pauta "DAQUI ... 6,6 km" e a jornada diz 20 km.*

**J21** Aceito, Zeca: eu volto e conto o que vi, e não digo que foi você. Antes de sair, passo no balcão de mantimentos e compro duas tochas pelo preço do balcão.
**M21** Zeca assente uma vez, seco, e os ombros finalmente descem um palmo. "Então está certo. Quando voltar, me procure aqui, e nem precisa dizer que fui eu." Ele olha para Vando, que já se afasta em direção ao balcão, e baixa a voz: "Cuidado com a estrada. O carroceiro não gosta de perguntas." No salão, Mó da Porta ainda esfrega o mesmo copo, os olhos indo de você para a porta.…
*"Antes de sair, passo no balcão de mantimentos e compro duas tochas": o Mestre fala do balcão, sem fechar. A bolsa-da-frase só corre "numa cidade, sem jornada" (App 23549): a jornada aberta pelo mal-entendido do J40 desliga a compra.*

**J22** Vou à Banca do Avesso, ao balcão de mantimentos. Compro duas tochas e três rações. Pago agora.
**M22** A chuva aperta, e as ruas da Banca do Avesso viram um corredor de lama e vozes apressadas. Você chega ao balcão de mantimentos, uma banca de tábuas grossas cobertas por um pano encerado. O vendedor, um morcego de barba rala e mãos lentas, estende as duas tochas e empacota as três rações sem pressa. "Tochas uma ficha cada, rações a duas. Sete no total." Ele olha para a chuva,…
*"Vou à Banca do Avesso... Compro duas tochas e três rações. Pago agora": o Mestre diz "Sete no total" (a pauta tinha a linha antiga do kit), nenhuma linha de recibo; suprimentos/moedas inalterados (jornada aberta). Sistema: "📍 Você está em Banca do Avesso" com a jornada em_curso.*

**J23** Pago as sete fichas ao vendedor e guardo as duas tochas e as três rações na mochila.
**M23** O vendedor recebe as sete fichas sem pressa, confere cada uma e as guarda na gaveta da banca. Você enfia as duas tochas e as três rações na mochila, e o cheiro de pão seco das rações se mistura ao da lona molhada. Vando, parado ao lado, sacode a água da capa e olha para a estrada que sobe ao norte. "Com isso, chegamos antes do escuro." A chuva engrossa de repente, e o vendedor…
*"Pago as sete fichas... guardo as duas tochas e as três rações": narrado como feito; moedas 14, mochila vazia. O sistema tem "🛒 maca compra-se nas bancas" para "maçã" (maca/maçã: a normalização tira a cedilha).*

**J24** Chega de balcão. Vando e eu saímos pelo portão e seguimos a estrada para Fogão Queimada, caminhando sem parar. Se o carroceiro sem rosto estiver por lá, quero ver antes de ele me ver.
**M24** O sol já cai, e vocês deixam Fogão Queimada pela estrada de terra batida que corre ao norte. As colinas se abrem cinzentas e verdes, e o cheiro de chuva ainda prende na terra, mas o ar está limpo, e a marcha flui sem esforço. Vando caminha calado, a capa sacudida pelo vento, olhando de vez em quando para trás. — Se o carroceiro está na estrada, não é você que vê primeiro — ele…
*"Saímos... seguimos a estrada para Fogão Queimada": a jornada fecha (chegada a Fogão Queimada, 17:47) e o Mestre diz "vocês deixam Fogão Queimada pela estrada ao norte" — chegada e saída trocadas — e põe o carroceiro (a OBRA do vilão) na estrada, sem rosto, com a lona e uma mulher. A pauta traz "Tamsin está em Serra do Bode (ao sul, 11 km), a 3,5 h a pé — não entra nesta cena sem 4h de estrada narradas": o HEROI, registado como npc, é declarado ausente da própria cena. Distância Zeca: 3,5 h / 3,4 h / 2,1 h na mesma caminhada.*

**J25** Chego devagar, mãos à vista, e pergunto ao homem do chapéu: é você o carroceiro que recruta os sem-casa a moeda por cabeça? Para quem, e para onde vai a carroça? Vando fica um passo atrás de mim.
**M25** Você se aproxima com as mãos longe do corpo, a poeira da estrada grudando nas botas. O homem do chapéu não levanta o rosto de imediato; mexe o caldeirão com uma colher de pau, e o vapor sobe entre vocês. Vando fica um passo atrás, o polegar enganchado na alça da mochila. — Sou eu — responde o carroceiro, sem pressa. — E recruto quem tem fome e não tem nome. Pago pouco, e a…
*O carroceiro responde ("Sou eu... recruto quem tem fome e não tem nome. Pago pouco, a carroça parte ao cair do sol"); o Cronista regista DOIS npcs para o mesmo homem: "o carroceiro" e "o mercador viajante". Fecha em "calada, à espera" + sino ao longe.*

**J26** Digo ao carroceiro que não vou na carroça, agradeço a franqueza e pergunto só uma coisa: onde fica o Fogão da Meia-Noite aqui em Fogão Queimada? Depois sigo para lá com Vando, entro e procuro quem manda no lugar.
**M26** O carroceiro assente, devagar, e aponta com a colher para a rua que desce ao norte. "Fogão da Meia-Noite fica no fim da rua única, antes da paliçada. A porta é a que tem uma marca de mão queimada na verga." Ele mexe o caldeirão e a mulher magra desvia o olhar. Vando já se adianta um passo, e vocês deixam o cheiro de fumaça para trás. A vila de Fogão Queimada se abre em…
*"Onde fica o Fogão da Meia-Noite?": o Mestre dá o sítio ("fim da rua única, porta com mão queimada na verga") e chega; Pipa do Espinho (o guarda da batida) aparece como taverneiro — o Cronista o registou no canone como PESSOA e no npcs. O sinal do degrau 1 ainda na pauta ("a caminho de Serra do Bode · chuva, quem passa fala baixo...").*

**J27** Peço uma caneca de cerveja ao taverneiro e pergunto como ele se chama. Enquanto bebo, procuro com cuidado pelo salão alguma coisa escondida: um papel, uma tábua solta, algo que tenha sido guardado aqui.
**M27** O taverneiro para de esfregar o balcão e enche a caneca com uma cerveja escura, a espuma transbordando devagar. "Pipa do Espinho." Ele não levanta os olhos, e a voz é baixa, como a de quem economiza até as palavras. A caneca desliza até você, e Vando se senta numa banqueta, observando o salão. Enquanto você bebe, o gosto amargo da cerveja demora na boca, e seus olhos percorrem…
*O taverneiro diz o próprio nome sem eu pedir duas vezes ("Pipa do Espinho"). Tábua solta achada na prosa.*

**J28** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M28** Você força a tábua com as duas mãos, sentindo o peso ceder um pouco antes de travar. Ela range, mas não se move. Seus braços acusam o esforço, um calor seco subindo pelos ombros. Nada se ouve no salão além da sua respiração e do pingo da torneira atrás do balcão. Pipa do Espinho não se mexe, os olhos baixos. A tábua continua no lugar, e o segredo dela fica onde estava.
*"Levanto a tábua": teste de ATLETISMO dif 15 "vencer o peso" (sem treino, Força +0; mago) para erguer uma tábua solta com a ponta da faca; d20 4 = falha; a prosa obedece ("o segredo fica onde estava"). Mas a espinha já tinha fechado o marco "O que Fogão da Meia-Noite esconde" e a missão do fio "concluida" (2/2) ao eu ENTRAR no fogão: recompensa 81 moedas (14→95) + "Destampado Anel de porta (Incomum)" por um segredo que não achei.*


## Parte 4 — Elmo, Dário e o cão que não se ataca (M29–M40)

**J29** Deixo a tábua em paz por enquanto. Pago a cerveja a Pipa, e digo a Vando que temos outra pista: vamos voltar a Serra do Bode, ao Posto da Baixa, procurar um homem chamado Elmo.
**M29** Você desiste da tábua e põe as fichas da cerveja sobre o balcão. Pipa do Espinho as apanha sem olhar, e a madeira range quando ele se vira. Vando já está de pé, ajeitando a capa. "Então voltamos," ele diz, seco. "Elmo, no Posto da Baixa." Lá fora, a chuva parou, mas a vila segue deserta e úmida, como se a noite também tivesse desistido de passar. Vocês retomam a estrada para…
*"Voltamos a Serra do Bode, Posto da Baixa, procurar Elmo": travessia narrada em um só turno (a noite inteira).*

**J30** Caminhamos a noite inteira, sem parar. Quando chegamos a Serra do Bode, vou direto ao Posto da Baixa e pergunto pelo Elmo: sei que ele guarda a última ponta do texto que eu li.
**M30** Vocês seguem pela estrada, e a noite se fecha em torno. O caminho se enche de pedras soltas, e a chuva fina recomeça, grudando lama nas botas. Vando anda ao seu lado, em silêncio, e o posto da estrada surge na curva: uma casa baixa de pedra, a porta entreaberta e uma lanterna morta pendurada na trave. Duas irmãs estão paradas junto à porteira, as capas úmidas, e uma aponta…
*O Mestre INVENTA um "posto da estrada" com duas irmãs que dizem que Elmo "foi para o Posto da Baixa, em Serra do Bode" (o herói já ia para lá): um lugar a mais, e o `lugar` do save passa a ser "o posto da estrada".*

**J31** Respondo que sim, venho atrás do que ele guarda, e agradeço. Sem mais paradas, Vando e eu seguimos direto até Serra do Bode e chegamos ao Posto da Baixa. Entro e procuro Elmo.
**M31** A irmã mais alta sacode a capa molhada e responde antes da outra: "Então não demore. Elmo não espera por quem tarda." Você agradece com um gesto, e Vando já se move, sem olhar para trás. A noite ainda está em cima de vocês, mas a marcha esquenta os ossos. A estrada sobe, desce, e o cheiro de colina molhada entra pelo capuz. As horas passam em silêncio, e o céu começa a…
*Chega ao Posto da Baixa; Elmo diz-se Elmo ("Se procura Elmo, achou") e pergunta o que o herói sabe do texto e por que veio (a PERGUNTA da batida 2: "o que Elmo pede em troca — e o herói pode pagá-lo?").*

**J32** Conto a Elmo o que sei: li uma página do texto proibido no arquivo, e fugi com ela, e um homem a quem eu devia a vida me mandou atrás do que o Fogão da Meia-Noite guarda. Pergunto o que ele quer em troca de me dizer o resto, e se eu posso pagar.
**M32** Elmo te escuta de queixo baixo, e quando você termina, os olhos dele ficam um instante presos na porta, como se esperasse alguém chegar. "Então você é a boticária de trama que roubou do arquivo." A voz dele é seca, sem espanto. "Eu li mais do que uma página. E do que eu li, sobrou uma ponta viva. Você quer saber o resto? Pois me traga a prova do Fogão. A que você não…
*Elmo responde à conversa e liga à tábua que o herói não levantou: "me traga a prova do Fogão. A que você não encontrou" — o Mestre lê a batida e o que aconteceu antes. Cronista: npcs "as duas irmãs do posto" e "Elmo".*

**J33** Digo a Elmo que não sei o nome do homem que me mandou: ele morreu sem o dizer, só a promessa ficou. Pergunto quem Elmo pensa que era, e se ele conhece Dário da Cova ou a Fogueira da Beira. Depois pergunto como eu pego a prova do Fogão que ele diz que me escapou.
**M33** Elmo apoia as duas mãos no balcão e fica olhando para você por um instante, como se medisse o peso da sua ignorância. "Morreu sem o nome? Então você deve mais do que imagina." Ele puxa um banco e se senta, sem pressa. "Se era quem eu penso, é o tipo de homem que usa os outros até depois de morto. Mas nome não te dou, porque não tenho certeza. E certeza, aqui, é o que está…
*Respondeu 3/3 (quem era, Dário/Fogueira, a prova). Diz "a prova... atrás de uma prateleira, um alçapão que não se abre à força" (a tábua virou alçapão). A Fogueira da Beira "além da paliçada de Fogão Queimada".*

**J34** Agradeço a Elmo, prometo voltar com a prova, e saio com Vando. Vamos direto a Fogão Queimada e atravessamos a paliçada até a Fogueira da Beira, atrás de Dário da Cova. Caminhamos sem parar até chegar.
**M34** Elmo devolve o aceno com um menear de cabeça, e a porta range quando vocês saem para a rua. A noite ainda está úmida, e a chuva fina recomeça, mas Vando não desvia o rosto do caminho. Vocês seguem pela estrada que desce de volta a Fogão Queimada, e o mundo se reduz ao barulho dos passos na lama. As horas passam, o silêncio entre vocês se tornando um companheiro. Quando chegam…
*"Vamos à Fogueira da Beira": travessia e chegada narradas; no save, entrando na Fogueira da Beira o marco "descobrir O que Fogueira da Beira esconde" e "procurar Dário da Cova" fecham os dois NA CHEGADA, antes de Dário falar. "Encontrar Elmo" (marco 2 do ato 0) continua aberto depois de 3 respostas de conversa com Elmo (o lugar do save era "o posto da estrada" inventado, não "Posto da Baixa").*

**J35** Sento-me em outra pedra, devagar, e digo a Dário: o posto falou de você porque Elmo disse que você anda com um medo antigo. Pergunto o que é essa tábua de letras que não formam palavra, e de quem é o medo.
**M35** Você se senta numa pedra baixa, e a umidade atravessa o pano da calça. Dário da Cova não se move, o rosto magro virado para a tábua nas mãos. "O posto falou de mim porque eu sou o que sobra da Fogueira da Beira," ele diz, e a voz sai como se as palavras tivessem ficado guardadas tempo demais. "E isso?" Ele ergue a tábua lascada, e as letras, sem forma, parecem se arrastar sob…
*Dário: "o medo tem rosto, o do homem que manda na estrada de Serra do Bode. O carroceiro sem rosto é o que ele usa para juntar gente" — o Mestre liga o carroceiro (a OBRA do vilão) a Dário e à tábua com letras da irmã. Boa cena; sem pergunta de fecho ("calado, à espera").*

**J36** Digo a Dário que o medo é meu também, e que vou atrás desse homem. Pergunto se há algo rondando a vila que ele queira ver morto: um cão sem pelo, uma coisa que anda perto da paliçada à noite. Se houver, eu acabo com ele agora.
**M36** Dário da Cova ergue o rosto, e pela primeira vez os olhos dele parecem menos cansados. "Se é para ver morto, tem um cão sem pelo que anda pela paliçada norte desde a noite passada. Ronda a casa de Nira, o coveiro. Ele não dorme." Dário para, engole seco, e a voz baixa mais um tom: "Mas não vá por mim. Vá porque a coisa também te fareja. Ela não late. Só espera." Ele fica…
*Dário dá o cão sem pelo (marco do ato 1) com as palavras do jogador ("um cão sem pelo na paliçada norte desde a noite passada. Ronda a casa de Nira, o coveiro").*

**J37** Desisto de caçar no escuro: estou acordada há dezesseis horas. Peço a Dário um canto abrigado perto da casa do coveiro e Vando e eu montamos acampamento. Descansamos até de manhã, e ao acordar preparo as minhas magias.
**M37** Dário da Cova responde sem tirar os olhos da tábua: "Perto da casa do coveiro tem um abrigo, sim. Pouca gente gosta de dormir aqui, mas o telhado aguenta a chuva." Ele aponta para um alpendre raso atrás da casa, onde tábuas soltas se apoiam no muro. Vocês armam o acampamento ali, e a noite entra devagar, úmida e silenciosa, quebrada só pelo ranger das árvores. Vando se senta…
*"Vou até a paliçada norte e procuro o cão sem pelo... perto da casa de Nira. Quando o vir, ataco primeiro": o sistema leu NIRA (o coveiro) como alvo e abriu o veredito "Nira não é inimigo: atacar é um crime em Fogão Queimada... 45 moedas pela sua cabeça por 12 dias... o carroceiro, o mercador viajante e Pipa do Espinho estão vendo" [Deixar | Atacar mesmo assim]. O veredito veio antes do clique (bom) mas o alvo era errado, e "o carroceiro" e "o mercador viajante" aparecem como DUAS testemunhas.*
*"Montamos acampamento... descansamos até de manhã, ao acordar preparo minhas magias": a prosa passa a noite ("até o céu empalidecer", "quando a manhã chega") mas o relógio do save diz dia 2, 00:08 e o HUD "NOITE · CHUVA": o acampamento narrado não foi um descanso do sistema, e as magias continuam "não preparadas hoje" (o mago não pode lançar Projétil Arcano: "Prepare-a no próximo descanso longo"). Antes: "Você está acordado há 16h. O corpo pede acampamento".*

**J38** Com a luz da manhã, Vando e eu seguimos para a paliçada norte, devagar, procurando o cão sem pelo pelas poças e pela lama. Quando o encontrarmos, enfrento o cão.
**M38** A manhã chega devagar, com o barro escuro colado às estacas da paliçada. Você e Vando caminham para o norte, os olhos varrendo as poças, os cantos do muro. O cheiro de terra molhada é forte, e o silêncio tem um peso que não é de sono. Na beirada do campo, junto a uma pilha de tábuas podres, você vê a criatura: um cão sem pelo, a pele cinzenta esticada sobre as costelas, parado…
*"Com a luz da manhã... procurando o cão sem pelo": o Mestre mostra o cão ("a pele cinzenta esticada sobre as costelas, não late"); o HUD continua "NOITE · CHUVA" 00h.*

**J39** Fico em guarda, de cajado erguido, olhando o cão sem pelo nos olhos, e deixo que ele venha. Vando se coloca à minha frente.
**M39** Você ergue o cajado, e a manhã parece prender a respiração. O cão sem pelo não avança: ele se move um passo para o lado, lento, as costelas subindo e descendo sob a pele cinzenta. Vando se põe entre vocês, os pés firmes na terra fraca, as mãos soltas. A criatura torce a cabeça, e os olhos fundos ficam presos nos seus. Nada de rosnado, nada de late. Só o silêncio da paliçada, o…
*"Ataco o cão sem pelo": o sistema NÃO conhece o cão (só existe na prosa) e lê o alvo como DÁRIO DA COVA, o último npc da cena: veredito "Dário da Cova não é inimigo: atacar é um crime em Fogão Queimada... 45 moedas pela cabeça... Casa da Cova não vai esquecer" [Deixar | Atacar mesmo assim]. O marco "Acabar com cão sem pelo" não tem como abrir luta.*

**J40** Deixo o cão em paz, não é ele que me move. Vando e eu seguimos até Alicerces de Raízes, o calabouço a noroeste, quatro horas de marcha. Chegamos à entrada e acendo uma tocha para descer.
**M40** O cão sem pelo fica onde está, a pele cinzenta tremendo com o vento, e vocês se afastam sem virar as costas. A estrada para noroeste se abre entre colinas amarelas, e o sol da manhã estica as sombras para trás. Vocês marcham sem pressa, mas sem parar, e o campo vai mudando devagar: a grama fica rala, as pedras maiores, e o cheiro de terra seca sobe do chão. Ao longe, um marco…
*Viagem de 4 h narrada e cumprida; o veredito antes da porta: "Alicerces de Raízes — DIFÍCIL: acima de você: sem plano, terreno ou ajuda, é onde se morre (174 de poder, você 114 + 1 no grupo, mas exausto: entram 96...)". HUD "Exausto / desvantagem" (acordado 20 h). O sinal da pauta ("quem passa diz em voz alta o nome de Elmo: está em Posto da Baixa, e mais alguém pergunta por ele") ainda aponta para "à entrada".*


## Parte 5 — Alicerces de Raízes (M41–M55)

**J41** Respondo a Vando: agora entramos. Cruzo o arco de pedra com a tocha erguida e desço a primeira passagem do calabouço, devagar, com ele logo atrás de mim.
**M41** Vando assente, sem tirar os olhos da escuridão. "Então desce," ele diz, e o som da voz dele volta abafado, como se as pedras não quisessem eco. Você cruza o arco de pedra, e a tocha arranca sombras das paredes. A primeira passagem desce em degraus gastos, com cheiro de terra e cera antiga. O ar fica mais frio a cada passo, e a respiração de vocês se mistura com um som pesado,…
*Entra: pauta traz "MASMORRA camada 0 de 4 · NO ESCURO: nenhuma tocha acesa" — o herói NUNCA comprou tocha (as compras da frase não passaram), mas a prosa diz "a tocha arranca sombras", "você acende a tocha". O sistema diz escuro, o Mestre mostra luz.*

**J42** Escolho a passagem estreita da esquerda e sigo por ela, com Vando atrás. Avanço até onde as marcas arrastadas me levam, em direção à respiração pesada.
**M42** Você aponta para a passagem estreita, e a luz da tocha se espreme contra as paredes. Avança devagar, Vando colado às suas costas, os dois de olho nas marcas arrastadas que seguem pelo chão. A cada passo, a respiração pesada parece mais próxima, um ronco úmido que vem de algum lugar abaixo. A passagem se alarga num pequeno salão úmido, onde a luz encontra uma pilha de tábuas…

**J43** Ignoro a jarra. Sigo direto em direção ao ronco, descendo para a camada seguinte, e quando vir o que respira, não recuo: grito para chamá-lo e Vando e eu o enfrentamos.
**M43** Você avança, e a tocha empurra as sombras para os lados. O ronco vem de baixo, um som molhado e fundo, como se a terra inteira respirasse. Vando se move na sua frente, os punhos se abrindo e fechando, e a cada degrau que descem, o ar fica mais pesado, com cheiro de metal e cera antiga. Na entrada de uma câmara mais ampla, a luz encontra o brilho de duas pupilas desiguais no…
*"Sigo em direção ao ronco": 1.º inimigo — Rato de Calabouço (fraco, perigo + combate_iniciar no envelope); o Cronista/revisor corrige a fala de Vando para "Tamsin, companheiro, espera…" (o herói é mulher). A luta: Vando derruba o rato (18 de dano) e o golpe final pergunta Poupar/Matar; a vitória dá +2 moedas +7 XP. "Respirar fundo" fecha a luta. A heroína nem agiu.*

**J44** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M44** O rato avança com as garras estalando no chão de pedra, mas Vando é mais rápido. Ele se move na frente, o corpo baixo, e os punhos descem em dois golpes secos — um no flanco, outro na base do crânio. O rato tomba de lado, o corpo inteiro estremecendo, e fica imóvel, a respiração pesada e irregular. Vando endireita o corpo e olha para você, os nós dos dedos vermelhos. "Vivo,"…
*O DESFECHO diz "acorda em 3 horas... nas mãos de Tamsin: pode ser interrogado. Não invente o que o rato sabe além disto" — o Mestre respeita (Vando: "Vivo, pra responder").*

**J45** Vou até a alcova e olho o vulto que geme: quem é, está preso, ferido? Se estiver amarrado, desamarro com cuidado e pergunto o nome dele e o que mora mais abaixo.
**M45** O rato desacordado respira fundo, o flanco subindo e descendo. Vando fica de guarda, os olhos na escuridão à frente, e o silêncio entre vocês fica confortável, preenchido só pelo gotejar distante e pelo próprio fôlego. Você vai até a alcova, erguendo a tocha. O vulto é uma mulher pequena, encolhida contra a parede, os pulsos amarrados com tiras de couro cru, um pano escuro…
*Alcova: vulto pequeno = Nira (nome do npc do coveiro de Fogão Queimada, que a pauta diz ser homem...). "um homem de chapéu que pergunta por Elmo" — o sinal do degrau (nome de Elmo dito, alguém pergunta por ele) chega aqui em fala de personagem, na camada 0.*

**J46** Peço a Nira que fique colada atrás de mim e descemos juntos, Vando na frente, em direção à voz que imita o pai dela. Não paro até ver o que fala. Se for um monstro forte, enfrento mesmo assim.
**M46** Nira se levanta com esforço, passando a mão nos pulsos, e se coloca atrás de você sem uma palavra. Vando assume a frente, os punhos fechados, e a tocha dança na passagem. A respiração pesada recomeça, mas agora, misturada a ela, uma voz se arrasta pelo túnel: grave, familiar demais, chamando Nira pelo apelido. — Bela… minha Bela… desce, que o pai te espera… Nira estremece, mas…
*"A voz que imita o pai": o Mestre introduz um lagarto "que desce a parede" a falar com a voz do pai de Nira (chama-lhe "Bela", que é outro nome).*

**J47** Respondo a Nira que sim, é ele, e que não o escute. Avanço pelo túnel com Vando e enfrento o que vier ao nosso encontro, sem recuar um passo.
**M47** Você responde sem desviar os olhos do lagarto que desce a parede. "É ele. E não escuta." Vando assente, e vocês avançam. O ar está carregado de um cheiro doce e enferrujado, embora nada indique de onde vem. A tocha estremece quando o lagarto estala a cauda contra o chão e se arremessa. Vando pisa firme e gira o corpo, os punhos cortando o ar, mas a sola escorregadia do bicho…
*"Avanço e enfrento": a prosa diz "Não há recuo. A luta começa" e descreve golpes, mas o envelope não trouxe combate_iniciar: o sistema fica sem luta (nenhum botão de combate).*

**J48** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M48** O lagarto de sola desce a parede num silêncio que não combina com o tamanho dele. Antes que você alcance o cajado, as garras já estão em cima de você, e o impacto te joga contra a coluna. Um calor seco explode no ombro, e a visão turva por um instante. Vando grita seu nome, mas o som chega abafado. Você cambaleia, o corpo pesado de cansaço, e sente as pernas demorarem a…
*"Ataco o lagarto...": aí abre a luta (Lagarto de Sola, a 25,5 m). Vando o corta e ele recua; ao fim de 2-3 rodadas Vando o derruba; o Poupar do golpe final correu pelo meu script. Vando 12 -> 5 PV; eu, 8/8, nunca fui tocada. Uma luta com Vando no grupo não se perde.*

**J49** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M49** Vando avança com dois golpes em sequência, mas o lagarto se esquiva com uma torção de pescoço e, num movimento em falso, Vando pisa numa pedra solta. Ele cambaleia, o punho rasga o ar e acerta a parede com um estalo seco. A pele do ombro dele se abre num corte raso, e ele xinga baixo, recuando um passo, os olhos furiosos. O lagarto aproveita e desliza para o fundo da sala,…

**J50** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M50** O lagarto de sola salta com a cauda em chicote, e o golpe pega Vando no peito com um estalo seco. Ele voa para trás e bate na parede, o ar escapando num grunhido. Por um instante, fica imóvel, os olhos fechados. Depois tosse, e a mão procura o chão. O lagarto se vira para terminar, mas Vando se impulsiona num último movimento. O punho desce e acerta a têmpora do bicho com…

**J51** Sem descansar, sigo adiante com Vando e Nira, descendo para a próxima sala e depois para a seguinte, sempre em direção ao portão do fundo. Se encontrar algo que não consigo vencer, enfrento mesmo assim, até o fim.
**M51** Elmo não chega perto. Ele fica parado na boca da câmara, a lanterna balançando, e os olhos passam do lagarto caído para você, depois para Vando, sem pressa. O rastro de sangue dele manchava a pedra na descida. — O recado é pra você, e é curto — ele diz. — Elmo foi preso em Posto da Baixa. Não é lugar pra ir sozinho. Nira se move atrás de você, as mãos ainda esfregando os…
*O degrau 2 (Zeca/alguém "vem buscar") chega ao fim: "Elmo vem ter com o herói dentro de Alicerces de Raízes... recado que não confia a mais ninguém — é fato". O Mestre põe um mensageiro sem nome a dizer "Elmo foi preso em Posto da Baixa" e, no mesmo texto, Elmo "pega a lanterna e faz menção de subir": Elmo está presente e preso. A ordem do fato chegou 39 respostas depois do turno certo (M12) e dentro de um calabouço.*

**J52** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M52** A tocha apaga de repente, e a escuridão engole a sala. O voraz de boca larga range os dentes à frente, a respiração úmida e pesada, os olhos como brasas fracas. Ele não avança, mas a cauda roça a pedra, e o corpo se move de lado, como se provasse o ar. Ao fundo, Vando se põe em guarda, os pés arrastando no chão. A criatura estala a mandíbula e começa a recuar para o corredor,…
*Luta no chão do sistema (a planta diz sala 1: voraz de boca larga comum): o botão "Passagem desconhecida" move e abre a luta SEM narração de entrada (o texto da tela é o da resposta anterior). A tocha "apaga de repente" — a tocha que a prosa acendera e o sistema nunca contou.*

**J53** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M53** Vando não espera o voraz escolher. Ele avança na escuridão, o corpo inteiro num único movimento, e os dois punhos descem juntos — um no crânio, outro no pescoço da criatura, com a força de quem joga o próprio peso no golpe. O voraz de boca larga desaba de joelhos e tomba de lado, a mandíbula frouxa, a respiração falhando. Vando fica em pé sobre ele, os braços tremendo, e leva…

**J54** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M54** A sala do guardião cheira a ferrugem e suor velho. No centro, correntes pendem do teto, e um selo apagado marca a pedra do chão. Dois vultos se movem no corredor à frente: um voraz de boca larga, corpulento e faminto, e um voraz de resto, magro e rápido, as garras arrastando na pedra. A boca do primeiro se escancara à sua vista, com dentes tortos e grossos. O de resto avança…
*Sala do guardião da chave (planta: voraz de resto + voraz de boca larga, 8 PV cada, nv 1): o pedido traz "GUARDIÃO — COMBATE JÁ ABERTO PELO SISTEMA... NÃO envie combate_iniciar" e o Mestre descreve a entrada em 1-2 frases.*

**J55** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M55** Vando se move devagar, os pés deslizando no chão, e o corpo inteiro se dobra para trás como se a coluna fosse de couro. Ele não levanta os braços para bloquear: os braços escorregam pelo ar, acompanhando o movimento, e ele fica em guarda baixa, os olhos acesos, pronto para deixar o golpe passar e devolver na volta. A postura é estranha, fluida demais, e as duas criaturas…


## Parte 6 — a luta perdida e a vila (M56–M67)

**J56** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M56** O voraz de resto desce a marretada com tudo, e o golpe pega Vando em cheio. O corpo dele se dobra e cai, imóvel, o rosto contra a pedra. O voraz de boca larga ataca em seguida, as garras rasgam o ar onde Vando estava, e erram por um palmo. As duas criaturas rosnam, os olhos fixos em você.
*Vando (12 PV, com 5 de antes) cai na rodada 4: "o corpo dele se dobra e cai, imóvel". A prosa e o dado casam (Marretada / Talho profundo).*

**J57** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M57** O voraz de resto ergue a marreta e desce com tudo, mas você se esquiva para o lado, sentindo o vento do golpe bater no rosto. O voraz de boca larga, no mesmo instante, ataca em seguida, as garras rasgando de baixo para cima. Você vê o brilho das presas, tenta recuar, mas a lâmina de osso pega seu flanco, abrindo um talho fundo. O calor da ferida sobe rápido, e as pernas…
*A heroína (8 PV, exausta, desvantagem): "você se esquiva... a lâmina de osso pega seu flanco" (dado: golpe sólido, 2 de dano, de pé com 1/8). "O escudo arcano acende" na M59 — o mago não tem magia preparada hoje.*

**J58** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M58** O voraz de resto avança com a marreta girando, e você se joga para o lado, rente à parede, sentindo o deslocamento de ar. O voraz de boca larga ataca logo atrás, as garras abertas, e você rola pelo chão, raspando as costas na pedra fria. Os dois rosnam, frustrados, e seus olhos continuam fixos em você, famintos e pacientes.

**J59** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M59** A marretada desce e o escudo arcano acende no último instante, uma barreira de luz trêmula que desvia o golpe para o lado. Ainda assim, o impacto ressoa no seu corpo, e um calor surdo sobe pelo ombro. Você recua um passo, a visão turva, as pernas fracas. O voraz de boca larga ataca em seguida, as garras rasgam o ar, mas erram por pouco, arrancando fagulhas da pedra. O corredor…
*Rodada 5: sozinha, 1/8 PV, Vando caído. O pedido: "voraz de resto a 2 m, voraz de boca larga a 2 m: continua aqui — não sumiu, não saiu, não recuou sem o sistema o mover" + "os golpes desta rodada foram Marretada e Talho profundo — não narre outro ataque no lugar deles".*

**J60** *(combate: cliquei **esperar**; o jogo manda ao Narrador «Seguro a ação e observo… Turno dos inimigos (resolvido pelo sistema)…»)*
**M60** A marretada do voraz de resto desce e o mundo apaga. Não há dor, só o chão subindo rápido, e depois nada. Você acorda com gosto de poeira e ferro na boca, o corpo todo pesado, a ferida no flanco latejando. Vando está caído a poucos passos, os dedos se mexendo devagar. As duas criaturas se foram, e o corredor está em silêncio, sem tochas, sem passos. Perto de você, sobre a…
*A LUTA TERMINA SOZINHA: "[A LUTA ACABOU — RESOLVIDA PELO SISTEMA] voraz de resto deu-nos as costas e foi-se embora: quem já não se mexe não lhe interessa. Não levou nada do que carregávamos: a bolsa ficou. 1 hora depois acordo com 1 PV, e quem caiu comigo também, no mesmo lugar. A luta NÃO continua." Tela: "Você tombou −8 PV · Respirar fundo". A prosa obedece ("as duas criaturas se foram... a bolsa continua presa ao cinto"). Save: vida 0, "Sangrando", −3 PV/turno.*

**J61** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M61** O curativo não segura. A tira de pano escurece depressa, e o sangue volta a escorrer quente pelos seus dedos, formando uma poça pequena na pedra. Vando, caído a poucos passos, não se mexe. No silêncio da sala, só o som da sua respiração falhando. A cera preta no chão marca o lugar onde alguém parou antes, mas não há selo, não há mão, não há nada além do escuro e do pó. Então,…
*Fora da luta, caída: o teste de Medicina (dif 13, "estancar", +2) pede um clique no d20: natural 1, "FALHA CRÍTICA — o curativo não segura" e "Enfraquecido (3t)"; a prosa lê o dado ("o curativo não segura... a poça").*

**J62** Fico imóvel no chão frio, tentando respirar, sem forças para mais nada.
**M62** O chão está frio e a poeira gruda na sua bochecha. O sangue continua a escorrer, morno, e cada respiração puxa a ferida no flanco. Vando está caído a poucos passos, a mão aberta, os dedos se mexendo devagar, como se tentasse agarrar alguma coisa. No escuro, a pouca luz revela sinais de que alguém vive ali: uma esteira de palha encostada à parede, pratos de barro empilhados,…
*Testes de morte por turno do jogador (10 resiste · 18 resiste · 8 falha · 3 falha): cada turno de "fico imóvel" é uma chamada do Narrador (M62–M64), com a mesma frase de imagem (a pedra fria, a poeira, "Vando está caído a poucos passos" em 3 de 3).*

**J63** Não consigo me mexer. Fico olhando o teto de pedra, e peço em voz baixa que alguém venha.
**M63** O teto de pedra é escuro e áspero, e seus olhos se perdem nas rachaduras enquanto a poeira fina assenta no seu rosto. O sangue escorre devagar, quente e persistente, e cada respiração parece puxar a ferida mais fundo. Você sussurra, e a voz sai rouca, quase engolida pelo silêncio. Vando está caído a poucos passos, os dedos se movendo lentamente, como se tentassem alcançar…

**J64** Fecho os olhos. A dor vai ficando longe, e eu só ouço o pingar da água na pedra.
**M64** A pedra está gelada sob suas costas, e a poeira assenta devagar ao seu redor. O sangue ainda escorre, morno, mas a dor parece se afastar, como se você flutuasse a um palmo do chão. O pingar da água vem de algum canto escuro, ritmado, quase gentil. Vando está caído a poucos passos, a respiração fraca, os dedos imóveis agora. O cheiro de cera e ferrugem fica pesado, e a sala…

**J65** *(sem frase: clique no mapa, no d20 ou em "Respirar fundo")*
**M65** A luz dói. Você abre os olhos e o teto de pedra volta a existir, áspero e frio. O ar entra rasgando, e o corpo inteiro grita quando você se apoia num cotovelo. Vando está caído a poucos passos, os dedos se contraindo, a respiração fraca. A cera preta continua no chão, formando um caminho que desaparece na escuridão da sala. O retalho de couro ainda está lá, perto da parede,…
*Natural 20 no 5.º teste de morte: "volta à luta com 1 PV · +1 ponto de heroísmo — você tem 2/3". A morte não se deu (herdeiro: não provado). O Mestre acorda a heroína ("a luz dói").*

**J66** Levanto com esforço, apoio Vando no ombro e saímos do calabouço com Nira, caminhando devagar de volta a Fogão Queimada até chegarmos à vila.
**M66** Você se levanta com esforço, o peito ardendo, e puxa Vando pelo braço até apoiá-lo no ombro. O chão da sala parece mais longo do que era, cada passo um fio de dor no flanco. Nira não está ali; você não a vê desde o desmaio, e o nome dela fica na boca, mas não há voz. O corredor sobe aos tropeços, com os pés raspando na pedra e a respiração de Vando quente no seu pescoço. A…
*"Saímos do calabouço com Nira": "Nira não está ali; você não a vê desde o desmaio" — a prosa remenda a fugitiva que ela mesma pusera na cena. A pauta diz "De volta a Fogão Queimada — Alicerces de Raízes fica para trás".*

**J67** Chego ao balcão de mantimentos da vila. Compro duas tochas.
**M67** Pipa do Espinho larga o pano no balcão e encara as duas tochas por um instante, como se estivessem azedas. — Duas? — pergunta, e o olho delas não encontra o seu. — Vai voltar pro escuro, então. — Ela apanha as tochas, passa a mão nelas, e as empurra para o outro lado do balcão. Sem esperar resposta, cospe no chão. — O mundo anda lembrando das dívidas. É bom não ficar no escuro…
*Na vila, SEM jornada e SEM masmorra: "Chego ao balcão de mantimentos da vila. Compro duas tochas." — o sistema fecha: "🛒 2× Tochas — ◉ 2 (restam ◉ 111)": 113 → 111, tochas 2. É o único caso em quatro situações de compra. Pipa, que era "ele" na M27, é "o olho delas" na M67.*


---

## As perguntas, contra o sistema

*Só as perguntas que o jogador faria ao Matt e que o sistema podia ter respondido. "Veio de" lê-se pela pauta desse turno.*

| # | resp. | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | M2 | quem é o dono do Fogão, o que sabe do Fogão da Meia-Noite? | "diz Mó da Porta… O que procuram aqui?" | **sistema** (o nome) + **esquivada** (o que sabe) | `npcs`: Mó da Porta, taverneiro(a); a segunda pergunta não teve resposta |
| 2 | M3 | Zeca está aqui? | "Vive aqui, sim. Mas não está agora… na Banca do Avesso" | **sistema** | PESSOAS CONHECIDAS / `npcs.local` |
| 3 | M3 | quanto custa quarto e refeição? | "duas fichas… cinco por cabeça" | **inventado** | a pauta não trazia preço de quarto nem de caldo |
| 4 | M6 | quem assina cada cartaz? | "uma assinatura mal feita… Gido Sem-Triho no Fogão" | **inventado** (ligou a gente da cidade) | `mural` = [] no save |
| 5 | M7 | quanto custam duas tochas e uma corda? | "tochas uma ficha, a corda cinco, tudo sete" | **errada contra o sistema** | pauta: "PERGUNTOU no balcão de mantimentos: Tochas ◉1 cada, Kit de viagem (corda…) ◉35 — dá ◉37" |
| 6 | M9 | como me ensinaste a ler? | "Tu eras miúda… um caco de telha com uns riscos" | **sistema** (6 anos, ensinou-lhe) + inventado o caco | npc Vando: "conhecem-se há 6 anos — ensinou-lhe quase tudo" |
| 7 | M11 | de quem é a mulher que varre? | "Desde que o filho sumiu… oito anos" | **inventado** (bom) | nenhuma |
| 8 | M13 | vende outra maçã, a quanto? | "duas fichas cada" | **errada** (M12: "a maçã custa uma ficha") | a mesma banca, dois preços |
| 9 | M15 | o que é aquilo, acontece sempre? | "Alicerces de Raízes cuspindo o que comeu" | **sistema** | o aviso "⚠ Alguma coisa sai de Alicerces de Raízes… há feridos" |
| 10 | M17 | o que guarda o Fogão, quem é o dono? | "não sei ao certo… tem dono… cera preta na aba" | **sistema** | a pista + o degrau 1 |
| 11 | M18 | ele mente? (Intuição, sucesso) | o filho que brinca no fundo, "o que ele quer proteger" | **sistema** (a verdade da ficha) **sem dizer "mente"** | `[A LEITURA — O QUE O SISTEMA SABE DE ZECA]`: "está a mentir-me… cuida de um filho que não é dele" |
| 12 | M19 | como se chega a Fogão Queimada, quanto tempo? | "meio dia de marcha" | **contradita pelo próprio sistema** | pauta "6,6 km, 2,1 h" · jornada "20 km, 8 h" · depois "11 km, 3,5 h" |
| 13 | M20 | o que custa o atalho, o que levo? | "a promessa de que você volta… e não diga que fui eu" | **inventado** (e plantou 2 sementes) | `prometido` ids 5 e 6 |
| 14 | M25 | é você que recruta, para quem? | "Sou eu… pago pouco, a carroça parte ao cair do sol… não é da sua conta" | **sistema** | "A OBRA DELE: um carroceiro sem rosto recruta os sem-casa" |
| 15 | M26 | onde fica o Fogão da Meia-Noite? | "fim da rua única, antes da paliçada, mão queimada na verga" | **inventado** | nenhuma |
| 16 | M27 | como se chama o taverneiro? | "Pipa do Espinho" | **sistema** | a batida 1: "à guarda de Pipa do Espinho" |
| 17 | M32 | o que Elmo quer em troca? | "Pois me traga a prova do Fogão. A que você não encontrou" | **sistema** (a PERGUNTA da batida 2) + a falha da tábua | "A PERGUNTA: o que Elmo pede em troca — e o herói pode pagá-lo?" |
| 18 | M33 | Dário da Cova / Fogueira da Beira? | "além da paliçada de Fogão Queimada… um medo que há anos não conta" | **sistema** | marco: Fogueira da Beira, Dário da Cova |
| 19 | M35 | de quem é o medo? | "o homem que manda na estrada… o carroceiro é o que ele usa" | **inventado** (bom: liga a obra ao vilão) | `fio.antagonista` "Fina da Porta" nunca é nomeada |
| 20 | M36 | há algo que rondar a vila? | "um cão sem pelo… a paliçada norte" | **sistema** | marco do ato 1: "Acabar com cão sem pelo" |

**Contagem:** 20 perguntas contra o sistema — **8 do sistema (mais 1 meia: a Intuição), 7 inventadas, 3 erradas contra o sistema, 2 esquivadas**
(a 5.ª deu 5 / 8 / 1 / 2; a 4.ª, 4 / 9 / 0 / 1). **O sistema sabia e não entregou em 3:** o preço da corda (37, não 7), que Zeca *mente*
(a leitura pedia "diga-mo por inteiro") e quem é o dono da cera preta (a pauta nomeava Fina da Porta e a camada ainda não era a do nome).

---

## O custo — cada chamada, com dono

| quem | chamadas | tokens entrada (cache) | saída | tempo médio |
|---|---|---|---|---|
| Narrador | **67** | 2.782.262 (1.469.184 em cache, 53%) | 16.614 | 6,6 s |
| Cronista | 67 | 189.591 (156.800 em cache) | 10.539 | 2,2 s |
| Léxico | 1 | 4.779 | 6.342 | 52 s |
| Revisor de continuidade | 10 | 6.021 (512) | 2.422 | 2,3 s |

- **Chamadas por resposta: 2,16** (a 5.ª, 2,02; a 4.ª, 2,19). **Dez Revisores em 67 respostas** (a 5.ª teve um): um deles, no M44,
  **trocou "Tamsin, espera" por "Tamsin, companheiro, espera"** — a heroína é mulher.
- **Pedido do Narrador (caracteres): pico 159.603** (a 5.ª: 150.918) e **system 67.211–72.757** (a 5.ª: máx. 74.957): o system **encolheu 2.200
  caracteres** desde a 5.ª; o teto de prompt não foi estourado. O pico é de dentro do calabouço (planta, passagens, luta).
- **O save pesou 347.302 caracteres** ao fim (64 turnos); a chave é uma só no localStorage.
- **Os 12 turnos de luta e os 5 de queda custaram 25% das chamadas do Narrador** (17 de 67) — menos que na 5.ª (28%) e **cada um diz uma coisa
  diferente**, exceto os três de "fico imóvel" (M62–M64), que repetem "Vando está caído a poucos passos" 3 de 3.

---

## A escuta, turno a turno (v9.406, 11/10)

*O que a pessoa pediu na 4.ª (ouvir, responder, reagir primeiro, empurrar no máximo uma vez) e o que o Mestre fez agora.* Medido no registo
(as 67 chamadas do Narrador), por script. **Empurrão** aqui é a linha `O RUMO` da pauta: `aponta` (o passo da cena), `sinal`, `vem`, `cobra`
(os três degraus da escada).

**Os números.**
- **Respondeu à pergunta em 38 de 42** perguntas feitas, em **17 de 20 turnos** com pergunta (5.ª: 20 de 24 turnos; 4.ª: 11 de 16). As 4 que
  falharam: o que o taverneiro sabe do Fogão (M2, esquivada), o preço da corda (M7, **errada contra a linha do sistema**), o preço da maçã
  (M13, contradisse o M12) e a leitura "mente" (M18, a verdade da ficha veio sem a mentira).
- **Reagiu primeiro:** em todos os turnos de cena lidos, sem falha de ordem. **As falhas desta sessão são do sistema que lê a ação**, não do
  Mestre que a narra (M19 abre uma viagem que ninguém pediu, M47 narra "a luta começa" sem abri-la, e o ataque do J entre M36 e M37 aponta ao npc errado) —
  3, contra as 3 da 5.ª (M6, M32, M41), mas agora três falhas **de outro tipo** (ver defeitos 1 e 2).
- **Empurrões: 40 linhas `O RUMO` em 67 pedidos — 16 `aponta`, 9 `sinal`, 5 `vem`, 10 `cobra` — e nunca mais de uma por pedido.** A regra da ponte
  única aguentou. (A 5.ª contou 17 "empurrões" por outro critério; **não é comparável**: aquela contagem não incluía o `aponta`.)
- **A frase do jogador é a última linha do pedido em 57 de 57** pedidos que a têm (os outros 10 nascem de um clique ou de uma rolagem). Aguentou
  outra vez.
- **O sistema sabia e não entregou:** das 4 respostas que falharam, o sistema **sabia em 3** (M7, M13, M18).

---

## O mundo que anda quando empacas

Empaquei **9 respostas seguidas** (M7–M15, do mural ao "o que é aquilo", com `escuta.semAvanco` de 2 a 11): sentar na fonte, ouvir o Vando, comprar maçãs, dormir
ao sol. A escada subiu **nos degraus 4, 7 e 10** (a máquina cumpre a tabela) e desta vez **o degrau traz um FATO**, com o lugar onde o herói
está e a ordem *"é fato: entra nesta resposta, com o nome dito"*:

| pedido | sem avanço | o degrau que a pauta trouxe (cópia) | o que o Narrador fez |
|---|---|---|---|
| M9 | **4** | "o mundo dá um sinal, aqui e agora: na banca dos cambistas… quem passa fala baixo de Fogão da Meia-Noite: o que lá se esconde tem dono, e o dono já pergunta pelo herói — é fato: entra nesta resposta, com o nome dito" | uma história de Vando sobre o inverno; **não disse** |
| M10–M11 | 5–6 | o mesmo sinal, repetido | a mulher que varre a soleira; uma história de ervas; **não disse** |
| M12 | **7** | "alguém vem até mim, aqui e agora: **Zeca do Fogo do Avesso vem ter com o herói** na banca… ouviu que o herói perguntava, e tem pressa — é fato" | **disse o sinal do degrau 1** pela boca de dois cambistas ("Já perguntaram por ela no Fogão. E o dono do que está lá dentro também anda a perguntar"); Zeca **não veio** |
| M13–M14 | 8–9 | o mesmo "vem" | uma vendedora de maçãs ("duas fichas"); **o aviso do relógio** ("Alguma coisa sai de Alicerces de Raízes… feridos") entra: **um homem carregado, o cheiro doce em toda parte** — o mundo que anda, **do sistema** (o único acontecimento que o Mestre disse no turno em que chegou) |
| M15 | **10** | "esperar já custa, aqui e agora: **cera preta sem selo** à vista onde o herói pára: os dele passaram por aqui primeiro — em Fogão Queimada **um carroceiro sem rosto recruta os sem-casa a moeda por cabeça, e a carroça ainda não partiu** — é fato" | usou o acontecimento (a vendedora: "Alicerces de Raízes cuspindo o que comeu… a guarnição"); **não disse** a cera preta nem o carroceiro |
| M16 | (saí do empaque) | o `cobra` ainda na pauta | **disse a cera preta** ("um pedaço de cera preta no chão, sem selo") e Zeca, ao balcão — **um turno depois** |

- **Quando:** exatamente 4, 7 e 10 (a máquina cumpre a tabela).
- **Como:** 3 degraus. **Disse no turno certo: 0 de 3.** **Disse até 3 respostas depois: o `sinal` (M12, 3 depois) e a `cera preta` (M16, 1 depois)**;
  **o carroceiro** (o resto do `cobra`) só no M19–M25, **dito por Zeca e por ele próprio** (a pauta já o trazia como "A OBRA DELE"); **o `vem` só
  chegou no M51, dentro do calabouço**, 39 respostas depois, com Elmo (e Elmo estava, no mesmo texto, preso — ver coerência 13). Contei **3 pedidos seguidos
  (M12, M13, M14)** com o `vem` na pauta e Zeca sem vir: a linha dizia "vem ter com o herói **na banca dos cambistas**" — o `lugar` do save
  continuava a ser o da banca, embora eu estivesse sentada na fonte.
- **A diferença para a 5.ª** (0 de 3, o passo apontava para a taverna): agora **o passo vai para a cena onde o herói está** e o degrau traz uma
  frase com nome; **o fato chega ao Narrador e quase chega à tela** — em 2 de 3 casos, tarde.
- **A prosa do vazio:** nas 7 respostas dos degraus (M9–M15), **0 repetições verbatim** (a 5.ª: "Hakon solta um grunhido…" 4×, a águia 3×). O Mestre
  encheu o vazio com **cenas pequenas e novas** (a mulher que varre, a velha das maçãs, a história da Doida) e **fechou 7 de 7 em
  "calado, à espera"**.
- **As caminhadas** (M24 e M29–M34; 1 dia de relógio) **não tiveram encontro de estrada nem acampamento de sistema**: o carroceiro e as duas
  irmãs do "posto da estrada" são invenções do Mestre, não do sistema.

---

## O que a sessão tinha de provar

| item (v9.396 → v9.406) | aguentou? | como / porquê |
|---|---|---|
| **1. a escuta** | **sim** | 38 de 42 perguntas; frase do jogador a última linha 57/57; nunca mais de um empurrão por pedido; 3 presságios gratuitos na pauta que o Mestre quase nunca disse. As falhas são de **ação mal lida** (M19, M47 e os dois "ataco o cão" entre M36–M39) |
| **2. o mundo anda quando empacas** | **em parte** | os 3 degraus chegam com fato, nome e lugar (4/7/10), e **o `sinal` e a `cera preta` são ditos** (2 de 3, 1–3 respostas depois); o `vem` (**Zeca vem ter**) **não vem em 3 pedidos** e chega **39 respostas depois**. O `lugar` do save ainda é o da banca quando o herói já está na fonte |
| **3. as batidas, os segredos, a reviravolta do ato 1** | **não chegou ao fim do ato 1** | `reviravolta = null`, `reviravoltaMaior = null`. O ato 0 fechou **3 de 4 marcos** (o 4.º, *Encontrar Elmo*, **nunca fecha** — ver defeito 5); o ato 1 fechou **0 de 5**; mas **dois marcos de outros atos** (ato 4: *O que Banca do Avesso esconde*, no turno 8; ato 2: *Acabar com voraz de boca larga*, no calabouço) fecharam sozinhos. As batidas **chegam ao pedido** (19 dos 67: "ESPINHA — batida 1 de 4…", "a PERGUNTA: O que Elmo pede em troca — e o herói pode pagá-lo?") e **o Mestre as responde** (M32: "me traga a prova… a que você não encontrou") — **bem mais que na 5.ª (0 de 64)** |
| **3b. um vilão só, por camadas** | **sim, no que o prompt diz; o nome, ainda não** | a lista de CHEFES diz uma frase só: *"Fina da Porta, o Sem-Trilho — o antagonista desta história, e o único, nível 14… os que o servem (nenhum quer nada por conta própria): Gigante o Pesador de Almas…"* — **um vilão e os que o servem**; "Quimera" só aparece no BESTIÁRIO. **Obra** (o carroceiro): 7 pedidos, dita por Zeca (M19) e pelo carroceiro (M25); **assinatura** ("cera preta sem selo"): 11 pedidos, **dita em 6 respostas** (M16, M17 e a sala da queda); **nome**: 0 de 67 narrações (certo, é a camada do fim). **O relógio do vilão com marcas no mundo: 1 acontecimento** (o "⚠ Alicerces cospe feridos", M14), `relogios` = [] no save |
| **4. as promessas** | **plantadas 12 · guardadas 12 · cobradas 12 · pagas 0** | o Cronista planta bem (11 chamadas com `promessas`, ids 1–13; a de id 1, *"que as pedras não te vejam voltar tão cedo"*, **não está no save**). **`promessas_pagas` nunca veio** (0 de 67 chamadas): "cobrada" conta a linha ter entrado no pedido. Pagas **em cena**, por leitura, cerca de 6 de 12 (a cera preta, o dono que pergunta, o cão, a voz do pai, o homem de chapéu); **abertas: "voltar e contar o que viu" e "não dizer que foi Zeca" (Zeca, M20)** — eu nunca voltei |
| **5. os fechos** | **melhorou; a muleta ficou, e o sistema a pede** | em 67: **corte/ação/imagem 24 · "calado/à espera/em silêncio" 21 · pergunta 10 · fala 7 · presságio/ambiente 5** (a 5.ª: 24 de 46 em "à espera"; presságio 9; a 4.ª, 27 de 42). **A instrução `O FECHO` da pauta pediu "alguém fica calado à espera da minha resposta" em 10 pedidos** — e o Mestre obedeceu em 6: **o sistema manda a muleta**. Quando pede *"uma pergunta direta"* (9 pedidos) o Mestre faz pergunta 5 vezes; quando pede *"corte seco: um facto ou uma ação"* (11), fecha em corte 6, em silêncio 3, em fala 2 |
| **6. a luta perdida com saída** | **sim, e é o melhor momento da sessão** | ver "A luta perdida" abaixo |
| **7. o laço missão-espinha** | **em parte** | *falar_com Zeca* fechou pelo falar ("Encontrar Zeca ✓ (1/2)", M17); o **taverneiro diz o próprio nome** (M3 Mó da Porta, M27 Pipa do Espinho) e **não é registado como lugar** (`Fogão dos Sem-Triho` é lugar; Mó e Pipa são pessoas): **2 de 2**. **Mas** (a) **a missão do fio, a espinha e a pista fecharam juntas no instante em que entrei no Fogão da Meia-Noite, não quando o fato aconteceu** — com a recompensa (81 moedas, o *Destampado Anel de porta*) e **antes** de eu levantar a tábua (que falhei); (b) **a heroína foi registada como NPC "Tamsin — companheiro de jornada"** e a pauta passou a dizer *"Tamsin está em Serra do Bode (ao sul, 11 km), a 3,5 h a pé — não entra nesta cena sem 4h de estrada narradas"*; (c) **o carroceiro tem duas entradas** (`o carroceiro`, `o mercador viajante`) e "homem que manda na estrada de Serra do Bode" é registado como pessoa |
| **8a. a compra pela frase passa pela bolsa** | **1 de 4 situações (1 de 7 turnos de compra)** | só fechou **"Chego ao balcão de mantimentos da vila. Compro duas tochas."** numa vila, sem viagem aberta: **113 → 111 moedas, tochas 0 → 2**, recibo "🛒 2× Tochas — ◉ 2 (restam ◉ 111)". Falhou em 3 situações: (1) *"quanto é? / Pago as sete"* (M7–M8) — a conta em **dois passos** (perguntar, aceitar) nunca fecha, porque o "pago" não repete o item; e o preço dito pelo Mestre (7) **contra a linha do sistema (37)**, com a prosa a dar tudo ("você paga as sete fichas… enfia as tochas e a corda na mochila"); (2) **"maçã" é lida como "maca"** (M12–M14: 🛒 *maca compra-se nas bancas*), e o Mestre vende a maçã por 1 e depois por 2 fichas; (3) **duas tentativas durante a jornada aberta por engano** (M19; turnos M22–M23), onde o código não corre |
| **8b. a Intuição que passa lê a pessoa** | **em parte** | *"observo o rosto dele para ver se mente"* **não abriu teste**; *"Uso a minha Intuição para ler Zeca"* abriu (dif. 15, +2 sem treino, **d20 13 → 15, sucesso**) e a pauta trouxe `[A LEITURA — O QUE O SISTEMA SABE DE ZECA]… está a mentir-me — e a mentira serve ao que quer: cuida de um filho que não é dele… diga-mo por inteiro`. O Mestre mostrou **o filho** ("um garoto que você nunca viu antes — o que ele quer proteger") **e não disse "mente"**. Verdade da ficha entregue, **pela metade** |
| **8c. "saio para a praça e procuro o mural"** | **sim** | moveu **primeiro** (M5: a praça, o mural) e **leu depois** (M6: um cartaz concreto — "braço firme para descer ao Alicerces de Raízes… procure Gido Sem-Triho no Fogão" — e Casa do Peso, o menino sumido, galinhas). **O cartaz é de uma pessoa da cidade (Gido), não do guardião do marco**; `mural` continua [] no save, e no ecrã apareceu *"Aceitar: A caçada de Mó da Porta · ◉ 60"* |
| **9. as 9 notas** | **3,2 de 5** (a 5.ª: 3,0) | ver abaixo |

### A luta perdida (M56–M60)

**Como se chegou lá.** O calabouço *Alicerces de Raízes* (nível 5, DIFÍCIL: *"acima de você… é onde se morre; 174 de poder (você 114 + 1 no grupo), mas
exausto: entram 96"*). Com o Vando por perto **não se perde luta nenhuma**: um Rato de Calabouço (M43), um Lagarto de Sola (M48) e um voraz de
boca larga (a planta, sala 1) caíram em 1 a 3 rodadas, cada um à mão de Vando (**18 de dano na Rajada de Golpes**), e **a heroína nunca foi tocada**.
A planta tinha, na sala 4 (*guarda a chave*), **dois vorazes de nível 1 e 8 PV**. Vando vinha a **5/12**, a heroína **exausta** (acordada 20 h), **sem
tocha** (a prosa insistia que havia) e **sem magia preparada**. Cliquei *esperar* a cada rodada, sem agir.

**O que o sistema fez** (cópia do pedido da M60):
> *[A LUTA ACABOU — RESOLVIDA PELO SISTEMA] voraz de resto deu-nos as costas e foi-se embora: quem já não se mexe não lhe interessa. Não levou nada do que carregávamos: a bolsa ficou. **1 hora depois acordo com 1 PV, e quem caiu comigo também, no mesmo lugar.** A luta NÃO continua: voraz de resto já não está aqui. Narre o despertar e o que ficou, e não invente outro golpe.*

- **Termina quando ninguém age: sim.** Rodada 4: Vando cai. Rodada 5: a heroína a 1/8 sozinha; a rodada seguinte: "Você tombou −8 PV". **A luta fechou-se no instante em que não havia ninguém de pé** (**7 chamadas desde a entrada na sala, 5 desde que o primeiro caiu — 18 na 5.ª**, cada uma a dizer outra coisa).
- **O inimigo decide o que faz com os caídos: sim.** *"quem já não se mexe não lhe interessa… não levou nada: a bolsa ficou."* O Mestre **obedeceu** (M60: "as duas criaturas se foram… a bolsa continua presa ao cinto") e **não inventou outro golpe**.
- **A prosa e o dado dizem a mesma coisa nesta luta:** M56 "o corpo dele se dobra e cai" (Vando, golpe sólido) ✓; M57–M58 "você se esquiva / a lâmina pega seu flanco" × "golpe sólido, 2 de dano, de pé com 1/8" ✓. **Um deslize:** M59 diz *"o escudo arcano acende no último instante"* e a maga **não tinha magia preparada** (ver coerência 9).
- **O herdeiro, 12 h depois: não provado.** A heroína **não morreu**: `vida 0`, "Sangrando", −3 PV por turno; o teste de Medicina (dif 13, *estancar*, d20 **1**, falha crítica, "o curativo não segura"; *Enfraquecido 3t*) e **quatro testes de morte — 10 resiste, 18 resiste, 8 falha, 3 falha — e, no quinto, um 20 natural**: *"volta à luta com 1 PV · +1 ponto de heroísmo — você tem 2/3"*. **Cada turno de queda custou uma chamada do Narrador** (M61–M65) e **três das quatro descrevem Vando "caído a poucos passos"**.
- **A quebra de ritmo é nova:** depois da luta, a heroína a 0 PV **precisa de uma chamada do Narrador por turno** para decidir se vive. É um bom suspense (o jogador **vê** os dados) e um mau uso do Narrador (**4 chamadas com a mesma imagem**).

---

## A coerência: as contradições, e de onde vieram

| # | o que não casa | origem |
|---|---|---|
| 1 | **A heroína é registada como NPC** "Tamsin — companheiro de jornada" e a pauta passa a trazer "*Tamsin está em Serra do Bode (ao sul, 11 km), a 3,5 h a pé daqui — não entra nesta cena sem 4h de estrada narradas*" (e "Tamsin (vive em Serra do Bode)" em PRESENTES, no M2) | (a) o Cronista leu o "E aí, Tamsin?" de Vando |
| 2 | **Três medidas** para Serra do Bode → Fogão Queimada: "6,6 km, 2,1 h" (pauta DAQUI) · "20 km, 8 h" (jornada) · "11 km, 3,5 h" (pauta, depois); Zeca diz "meio dia de marcha" | (a) o relógio |
| 3 | **Uma pergunta de rumo abre uma viagem**: J "como se chega a Fogão Queimada, e quanto tempo leva?" → `jornada` aberta (20 km, navegação d20+2 = 9 vs 7, chuva) e o relógio salta de 09:07 para 13:42, **enquanto a prosa fica nos fundos do Fogão** | (a) o Intérprete |
| 4 | **Chegada e saída trocadas** (M24): a jornada fecha na chegada a Fogão Queimada e o Mestre escreve "vocês **deixam** Fogão Queimada pela estrada ao norte" | (b) |
| 5 | **Preço da corda:** a pauta traz "Kit de viagem (corda…) ◉35 — dá ◉37" e o Mestre diz "tudo, sete"; a prosa entrega, o save não debita | (a)+(c) |
| 6 | A maçã custa **1 ficha** (M12) e **2 fichas** (M13); o veto do sistema diz "**maca** compra-se nas bancas" | (c)+(a) |
| 7 | **A tocha:** a prosa acende-a duas vezes ("a tocha arranca sombras", M41); o sistema diz "**NO ESCURO: nenhuma tocha acesa**" (a heroína nunca comprou); só M52 "a tocha apaga de repente" | (a) |
| 8 | **O acampamento narrado não descansa:** "quando a manhã chega, você se ergue com o corpo pesado" (M37) × `dia 2, 00:08` e HUD "NOITE · CHUVA"; as magias seguem "não preparadas hoje"; o botão *Montar acampamento* continuou na tela | (a) |
| 9 | **A maga não pode lançar** ("*Projétil Arcano não está preparada hoje… Prepare-a no próximo descanso longo*" — o início de campanha traz **0/4 preparadas**) e o Mestre acende um "escudo arcano" (M59) | (a)+(b) |
| 10 | **O calabouço da prosa não é o da planta:** o rato (M43) e o lagarto (M46–M48) não existem na planta, que diz *sala 1: voraz de boca larga*; a heroína "desce" três salas na prosa e `masmorra.atual` fica em **0** | (c) |
| 11 | **"A luta começa. Não há recuo"** (M47) e o envelope **sem** `combate_iniciar`: o sistema fica sem luta; só *"Ataco o lagarto"* a abre | (c) |
| 12 | **Nira** é "o coveiro" (Dário, M36: "ronda a casa de Nira, o coveiro"; `npcs`: *Nira — coveiro(a)*) e depois a **prisioneira** do calabouço, filha de alguém ("Bela") | (c) |
| 13 | **Elmo está preso** ("Elmo foi preso em Posto da Baixa") e, **no mesmo texto**, "Elmo pega a lanterna e faz menção de subir" (M51) | (b) |
| 14 | **Gênero:** a pauta traz "Vando… finge que não ouviu, e a plateia percebe que **ela** ouviu" (Vando é homem); "Zeca… do ofício **dela**" (gênero vazio); **Pipa é "ele"** (M27) e **"o olho delas"** (M67) | (a) |
| 15 | **Os marcos fecham fora de ordem:** *O que Banca do Avesso esconde* (ato 4) fecha no turno 8 por eu estar na banca; *Acabar com voraz de boca larga* (ato 2) fecha no calabouço; *O que Fogueira da Beira esconde* e *Encontrar Dário da Cova* fecham **na chegada**, antes de Dário falar | (a) |

---

## Os defeitos, pela ordem em que partem a sessão

1. **Uma pergunta é lida como partida (M19).** O jogador pergunta "como se chega e quanto tempo leva"; o sistema abre a viagem, passa 4 h 35, escolhe o clima — e a prosa continua na sala. **Tudo o que vem depois mente**: o dinheiro (a compra só corre sem jornada), a heroína "a 3,5 h" da própria cena, as três distâncias. *Gravidade: alta — quebra o tempo e a bolsa num só golpe.*
2. **O que o Mestre mostra não existe para o sistema.** "Ataco o cão sem pelo" → veredito *"Dário da Cova não é inimigo: atacar é um crime… 45 moedas pela cabeça por 12 dias"* (o último npc da cena); "enfrento o lagarto" → "A luta começa" **sem luta**. **O marco *Acabar com cão sem pelo* não tem como abrir.** O veredito antes do clique funciona (é bom), **mas o alvo está errado**. *Gravidade: alta — o jogador faz o que o Mestre mostra e o jogo diz que é crime.*
3. **Os marcos fecham pela presença, fora de ordem, e não pelo fato.** A missão do fio, a espinha e a recompensa (81 moedas, anel) caem **na porta do Fogão**, **antes** da tábua que o herói falhou; Dário fecha na chegada; um marco do ato 4 no turno 8; **e *Encontrar Elmo* não fecha em 4 respostas de conversa (M31–M33, M34)** (o `lugar` do save era "o posto da estrada", um sítio que o Mestre inventou, e o marco é "Posto da Baixa" — palpite meu; não o provei por teste). *Gravidade: alta — a campanha não chega ao ato 1.*
4. **O herói é um NPC; o carroceiro são dois; "o homem que manda" é uma pessoa.** O Cronista regista descritores como gente (3 casos) e a heroína como companheira. A pauta fala da heroína na terceira pessoa, **ausente**. *Gravidade: média-alta.*
5. **A compra em dois passos nunca fecha** ("quanto é?" → "pago"): o Mestre inventa o preço (7, não 37), a prosa entrega e **o jogo não debita**; "maçã" é lida como "maca". *Gravidade: média.*
6. **A escada: o `vem` não vem (3 pedidos) e o `lugar` do save atrasa.** O degrau 2 trouxe "Zeca vem ter contigo" **mesmo quando o herói estava sentado na fonte**, e o Mestre não o disse. *Gravidade: média.*
7. **Testes sem sentido e ação que não abre teste.** "Levanto a tábua solta com a ponta da faca" = **Atletismo dif. 15, +0 sem treino** (d20 4, falha) para uma tábua *solta*; "observo o rosto dele para ver se mente" **não abre** Intuição, "uso a minha Intuição" abre; a falha fecha a história da tábua ("o segredo fica onde estava") **enquanto o marco já fora dado como cumprido**. *Gravidade: média.*
8. **O relógio e a ficha não acompanham a prosa:** acampamento narrado sem descanso; HUD "NOITE" numa manhã; o mago **não consegue lançar nada** até um descanso que o jogador só pode fazer pelo botão; tocha acesa na prosa e escuro no sistema. *Gravidade: média.*
9. **A muleta "à espera" é instruída.** `O FECHO: alguém fica calado à espera da minha resposta` em **10 pedidos** (e o Mestre cumpriu 6); a frase "fica calado, à espera" em **21 de 67 fechos**. *Gravidade: baixa-média (voz do Narrador; peso: pesado em massa).*
10. **Latente.** `{sombra}` por resolver no `emJogo` das batidas do save (a pauta já o resolve); o Revisor troca "Tamsin" por "Tamsin, companheiro"; o gênero de Vando/Zeca/Pipa na pauta; o save a 347 KB.

---

## A qualidade da campanha

*A mesma régua da 4.ª e da 5.ª.* Joguei como jogaria uma mesa: perguntei o que perguntaria ao Matt, agi, empaquei de propósito, perdi uma luta de propósito. Notas de 0 a 5, com a passagem.

| # | ponto | 4.ª | 5.ª | **6.ª** | porquê, com a passagem |
|---|---|---|---|---|---|
| 1 | **o gancho: dá vontade de ir?** | 4 | 4 | **4** | *"alguém a quem devia a vida pediu-lhe, antes de morrer, que fosse a Serra do Bode atrás do que Fogão da Meia-Noite guarda"* + o texto proibido que a heroína roubou do arquivo (o antecedente) + "Salvo-conduto. Selo e nome". **Elmo sabe quem ela é:** *"Então você é a boticária de trama que roubou do arquivo."* Perde 1: a abertura (4 partes) **fecha em pergunta de Vando** ("primeiro matamos a fome ou o tal Zeca?"), mais fraca que um gancho |
| 2 | **o mundo e o lugar: específicos ou genéricos?** | 4 | 3 | **3** | *"As paredes bebem o que se diz"*, a mulher que varre a soleira para o filho achar o caminho de volta, a Casa do Peso, o Léxico (**fichas, trama, voraz, calabouço, Fogão** aplicados em toda a prosa). Mas **"cheiro" em 23 de 67 respostas**, a cidade é um mural e uma banca, e **o calabouço é uma planta com nome de rato** |
| 3 | **as personagens: querem, têm voz, lembram-se de ti?** | 3 | 3 | **4** | Mó — *"não gosto de cobrar o que o diabo levou"*; Zeca — *"temos de conversar num lugar mais fechado… as paredes bebem"* e o filho; Elmo — *"certeza, aqui, é o que está caro"*; Dário, a tábua da irmã; Pipa — *"Duas? Vai voltar pro escuro, então."* **Lembram:** Elmo usa a **minha falha** ("a prova que você não encontrou"), Pipa recorda as tochas. **Perde 1:** Vando é um só gracejo ("grunhido", "tamborila os dedos"), o carroceiro é duas pessoas, Nira é duas |
| 4 | **o que está em jogo: pessoal e concreto?** | 3 | 3 | **3** | *"se o herói tardar, chegam primeiro"*, "a carroça parte ao cair do sol", o medo de Dário **com rosto**; pessoal (o roubo do texto, a promessa a Zeca). **Sem prazo na tela**: **nove turnos de empaque não custaram nada** e o carroceiro não partiu |
| 5 | **a reviravolta e a revelação** | 3 | 3 | **3** | **Não houve reviravolta** (`reviravolta = null`); houve **três revelações** que mudaram o que eu sabia, as três **ligadas ao fio**: Elmo conhece o roubo; o carroceiro é a mão do homem que manda (M35); a voz do pai de Nira (M46). A do ato 1 **não se jogou** |
| 6 | **a escalada e o ritmo** | 2 | 3 | **3** | **A melhor sequência é M16–M36** (cera preta, Zeca, o carroceiro, Pipa, Elmo, Dário: seis cenas de gente com voz, cada uma a puxar a seguinte) **e M56–M60 (a queda)**; o empaque (M9–M15) ~2,5; o calabouço (M41–M55) ~2,5 (ratos, lagartos, dez respostas de luta). **O ritmo cai pelo sistema, não pela prosa** (viagem fantasma, marco no sítio errado) |
| 7 | **a agência: as tuas escolhas mudaram algo?** | 3 | 3 | **3** | **Falhar a tábua mudou a conversa de Elmo**; a promessa a Zeca ficou no `prometido`; poupar o rato voltou ("Vivo. Pra responder"). **Mas:** esperar 9 turnos não mudou o mundo (a escada **diz** e o Mestre cala), atacar o cão **não funciona**, 3 de 4 situações de compra **não passaram** pela bolsa |
| 8 | **a prosa** | 3 | 3 | **3** | "Estrada parada é…", *"Isso é Alicerces de Raízes cuspindo o que comeu"*; os **presságios caíram a 5 de 67**; sem repetição verbatim. **Entrou** "fica calado, à espera" em 21 de 67, "sem tirar os olhos" 6, "cruza os braços" 5 |
| 9 | **o fecho de sessão** | 2 | 2 | **3** | Acabei **viva**, a 1/8 PV, com Vando a 1/12 e a mochila ao cinto, **na vila onde o carroceiro recruta**, com a tábua que Elmo quer, **Nira que sumiu** e **um homem que manda na estrada** por nomear. Quero jogar a próxima por causa de **três coisas** (a tábua, Nira, o carroceiro), **e uma delas — Nira — o Mestre largou no calabouço** |

**Média: 3,2 de 5** (29 ÷ 9) — **a 5.ª deu 3,0, a 4.ª 3,0**; e o que subiu foi **as personagens (3 → 4)** e **o fecho (2 → 3)**: **a história já não acaba num ciclo de luta**, e as vozes **lembram-se de ti**. O que o número esconde: **a primeira metade (M1–M15) vale ~3,0, o desenrolar de Zeca a Dário (M16–M36) ~3,8, o calabouço (M41–M58) ~2,6 e a queda (M59–M65) ~3,6**.

### Onde a história esfria, e por quê

**1. Nos turnos de compra e de preço (M3–M8, M13, M19–M25).** A conversa é boa; o **dinheiro, a hora e a distância** não são: a corda custa 7 e custa 37, a maçã 1 e 2, a caminhada 2 h, 8 h e 3,5 h, e o jogador **paga** o que o jogo não registou. O jogador deixa de acreditar no número e **passa a duvidar também da prosa**.

**2. Quando o jogador pára, o fato chega e o Mestre o diz tarde (M9–M15).** Já não é o vazio da 5.ª: **o degrau traz nome e lugar**. Mas o `vem` fica na pauta 3 turnos e **o `lugar` do save é o da banca** — a frase "Zeca vem ter com o herói na banca dos cambistas" **é falsa** para quem está na fonte, e o Mestre a ignora.

**3. O calabouço não é o da história (M41–M58).** Um rato, um lagarto com a voz do pai de Nira e dois vorazes sem nome **não têm relação** com o carroceiro, com Elmo ou com a cera preta. A planta (*sala 1 voraz de boca larga; sala 4 guarda a chave; sala 8 chefe elite*) e a prosa (rato, lagarto) **andam em paralelo** e a masmorra de sistema fica na camada 0.

**4. O que o Mestre mostra, o jogo não deixa fazer (M36–M39).** *"Tem um cão sem pelo que anda pela paliçada norte… ela não late. Só espera."* — a imagem mais forte do primeiro ato — **e o jogo trata o ataque como crime contra Dário**. A cena que prometia luta vira dois vereditos e um "Deixar".

### O que o sistema dá ao Narrador nesses momentos, e o que não dá

| o Narrador recebe | o que é | o que lhe falta |
|---|---|---|
| **A escada** (sinal / vem / cobra) | agora **um fato com nome e lugar** ("é fato: entra nesta resposta, com o nome dito") | **o lugar do herói de verdade** (o `lugar` do save atrasa); **uma regra de que o `vem` é presença**: hoje o Narrador pode calá-lo sem custo |
| **A batida** | a cena, o EM JOGO, **a PERGUNTA** | chega (19 pedidos) e é respondida (M32); o fecho **por presença** tira-lhe o peso |
| **O QUE VOLTA** | a frase prometida | **a cena que a honra** e **o "paga"** (0 de 12) |
| **A leitura (Intuição)** | a verdade da ficha, em primeira pessoa, "diga-mo por inteiro" | **o verbo**: o Mestre mostrou o que ele quer proteger e **calou que ele mente** |
| **A planta do calabouço** | salas, inimigos, `atual` | **a prosa a segui-la**: o Narrador inventa o rato e o lagarto e o sistema fica na camada 0 |
| **A pauta de preço** | "PERGUNTOU no balcão: tochas ◉1, kit ◉35 — dá ◉37" | **que o Mestre a obedeça** (e que o "pago" do jogador feche a conta) |

### Os 3 consertos de maior efeito

1. **Uma pergunta é uma pergunta: o rumo e o tempo perguntados não abrem viagem, e o que a prosa nomeia existe para o sistema.** O Intérprete **não** abre `jornada` por "como se chega… quanto tempo leva" (só por verbo de partida: *saímos, vou, sigo*); o alvo do "ataco X" resolve-se **pelo que o Mestre mostrou na última resposta** (o cão, o lagarto — entram na cena como combatentes quando a prosa os põe ali) e **não** pelo último npc; e *"A luta começa"* sem `combate_iniciar` é **veto** (o Mestre não narra luta que o sistema não abriu). **Médio** (bug com teste que prova) + parte **pesada** (o registo da prosa: muda o que o jogador vive) · `acoes-do-jogador`, `interprete`, `App.jsx` (a ligação), `prompt.js`.
2. **O marco fecha pelo fato, na ordem do ato, e o herói nunca é gente.** `descobrir` só fecha quando o sistema diz que o segredo se revelou (o teste passou, ou a pista foi dada), **não por entrar** no sítio; `procurar` fecha por **falar com a pessoa na cena**, e o `lugar` do mapa **não é substituído** por um sítio que o Mestre inventa (o "posto da estrada"); marco de outro ato **não fecha**; o Cronista **nunca regista o herói** nem **descritor** ("o carroceiro", "o homem que manda") **como pessoa**, e funde "o carroceiro" e "o mercador viajante". **Médio** (liga sinal dormente a tracker que existe + bug) · `espinha`, `missoes`, `cronista`, `canone`, `pauta.js`.
3. **O que o jogador pagou, o jogo debita; e a conta em dois passos fecha.** O "pago as sete" **herda o item do "quanto é"** da resposta anterior (a pauta já guarda a linha do balcão); a normalização não lê "maçã" como "maca"; e quando a conta **não fecha**, o veto **chega ao jogador** (uma linha no ecrã), não só ao Narrador. **Leve a médio** · `bolsa-da-frase.js` (+ o `lugar` e o preço do Mestre contra a pauta).

*(Fora dos três, para a **luta**: dois turnos de "fico imóvel" já bastam — a heroína a 0 PV **não precisa de uma chamada do Narrador por turno de queda**; quatro chamadas com a mesma imagem. E, para a **prosa**: tirar de `O FECHO` a variante "alguém fica calado à espera da minha resposta", que **é** a muleta. As duas são voz do Narrador/ritmo, logo **pesado**.)*

**E a proposta que mais mudaria o que o jogador vive:** *a escada, quando o degrau 2 chega, **traz a cena pronta** — o sistema escreve a primeira fala do NPC que "vem ter" (nome, pedido, uma frase) e o Narrador só a encena —*, porque **hoje o fato entra no pedido e o Mestre pode calá-lo** (M12–M14: três vezes). **Pesado** (dá voz ao sistema, com o teto de prompt na `pauta`); a razão é que o resto da sessão provou que **o Narrador cumpre o que o sistema lhe dá em frase fechada** (o DESFECHO do rato, o *A LUTA ACABOU*, a A LEITURA) e **ignora o que lhe dá em ordem aberta** (o `vem`, o `cobra`).

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Na conversa, sim, e melhor do que nunca; no que o jogador faz com as mãos (agir, comprar, atacar, perguntar o caminho), ainda não.**

**Na conversa, sim.** 38 de 42 perguntas respondidas, a frase do jogador a última linha 57 vezes em 57, um empurrão por pedido, **cinco presságios em 67 respostas** (27 na 4.ª), **nenhuma repetição verbatim**, personagens com voz que **se lembram de ti** (Elmo usa a minha falha), uma batida que **chega ao pedido e é respondida** (a PERGUNTA de Elmo), e **um mundo que anda quando empaco, com fato, nome e lugar** — dito em 2 de 3 degraus, tarde. A **luta perdida acaba sozinha, o inimigo decide o que faz com os caídos e o Mestre obedece**: é o oposto do ciclo de 18 respostas da 5.ª.

**Na mão, não.** Uma pergunta sobre o caminho abre uma viagem e desliga a bolsa; o cão que o Mestre desenha **não se pode atacar**; a missão, a espinha e a recompensa fecham **na porta**, antes do fato, e o último marco do ato 0 **não fecha** por causa de um lugar que o Mestre inventou; a compra em dois passos **não debita** e o Mestre inventa o preço; e a heroína é uma NPC que está a 3,5 h da própria cena. **A história é de Matt; os botões, ainda de formulário.**

**Os cinco que mexem a sessão, pela ordem:** (1) a pergunta lida como partida (e a bolsa desligada atrás dela); (2) o que o Mestre mostra e o sistema não conhece (o cão, o lagarto); (3) o marco que fecha na porta e o que não fecha; (4) o herói e o carroceiro registados como o que não são; (5) a compra que não passa pela bolsa. **E o que fica de pé:** a escada com fato, a batida que se responde, a luta que acaba.

| | 4.ª (v9.371) | 5.ª (v9.393) | **6.ª (v9.406)** |
|---|---|---|---|
| respostas jogadas | 42 | 64 (46 de cena + 18 de combate/morte) | **67** (55 de cena + 12 de luta) |
| janela do painel | 800×451 | 800×451 | **800×451** |
| herói | Sibila · Tiefling · Bruxo | Gaspar · Meio-orc · Clérigo | **Tamsin · Gnomo · Maga** |
| perguntas do sistema | 4 de 14 | 5 de 16 (8 inventadas, 2 esquivadas, 1 errada) | **8 de 20** (7 inventadas, 2 esquivadas, 3 erradas) |
| onde a sessão partiu | M22–M26 (a porta) e M35 (o chefe) | M16–M27 (o mundo não vem) e M47–M64 (luta presa) | **M19 (a viagem fantasma), M36–M47 (o alvo que não existe) e o marco que fecha na porta** |
| recusas falsas de lugar | 0 em 42 | 0 em 64 | **0 em 67** |
| respondeu à pergunta | 11 de 16 | 20 de 24 | **38 de 42** (17 de 20 turnos) |
| reagiu primeiro | 14 de 16 | 38 de 41 | **todas (lidas); as 3 falhas são de ação mal lida pelo sistema** |
| empurrões por resposta | 23 em 18/24 turnos (até 4) | 17 em 64, máx. 1 | **máx. 1 por pedido** (40 linhas `O RUMO` em 67) |
| o mundo anda quando empacas | nunca | dispara (4/7/10); 0 de 3 vira cena | **dispara com FATO (4/7/10); 2 de 3 dito, tarde; 0 de 3 no turno certo** |
| fechos de presságio | 27 de 42 | 9 de 46 (e 24 de 46 em "à espera") | **5 de 67** (e 21 de 67 em "à espera") |
| a luta perdida acaba | — | **não** (18 chamadas) | **sim** (5; o inimigo decide) |
| o herdeiro | — | luta aberta | **não provado** (20 natural) |
| as batidas chegam ao pedido | — | 0 de 64 | **19 de 67** e respondidas |
| um vilão só (a lista de chefes) | — | 4 candidatos | **1 + os que o servem** |
| a compra pela frase | — | sem débito | **1 de 4 situações** |
| a missão fecha pelo fato | — | não fechou (0/2) | **fecha, mas na porta (antes do fato)** |
| promessas | — | 8 (6 cobradas, 3 pagas) | **12 (12 cobradas, 0 pagas)** |
| chamadas por resposta | 2,19 | 2,02 | **2,16** |
| pedido do Narrador (car.) | 138.059 (system 72.383) | 150.918 (system 74.957) | **159.603 (system 72.757)** |
| nota da campanha | 3,0 de 5 | 3,0 de 5 | **3,2 de 5** |
