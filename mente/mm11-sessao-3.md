# MM11 · a terceira sessão de prova — transcrição

> **Campanha:** *Prova da Mesa III* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz por omissão
> **Herói:** Tobias Varzim — homem, Halfling, Caçador (Arqueiro), Curtidor, Náufrago. Pontos: Destreza +3 · Vigor +1 ·
> Percepção +2 (e a raça: +2 Destreza, +1 Presença). Conceito: *náufrago que caça recompensas para pagar a passagem de volta
> para casa*. Outra raça, outra classe, outro sexo e outro antecedente que a Iara e a Brites.
> **Companheira de antes:** Iracema Sousa — Monge, "antiga companheira de armas do herói; conhecem-se há 8 anos", vínculo
> 50/100 (amizade), no grupo desde o turno 1 (O GRUPO DE AVENTURA · 2 DE 5). No elenco do mundo é **vendedora de ervas na
> Praça da Panela, em São da Onça**.
> **Respostas do Mestre: 30** (30 chamadas ao Narrador; mais o Léxico na criação). Um dia de jogo: 1 de Brumal, 08:00 →
> 23:33. Nenhuma chamada falhou (69 de 69 com 200; nenhum 429).
> **Jogada por:** o `jogo`, a 01/10, sobre `v9.347` (`4dabfa5`), navegador do painel (374×310), campanha nova criada pela tela.
> **Como se conferiu:** um gancho em `fetch` guardou **toda** chamada a `/api/*` — a hora, o endpoint, quem a fez (pelo
> prompt de sistema: `Você é o NARRADOR`, `Você é o CRONISTA`, `Você é o REVISOR DE CONTINUIDADE`, `Você é o Léxico`,
> `Você É <nome>` para as bocas, o pedido de rede de segurança pela última mensagem), o tamanho do pedido e a resposta
> inteira — e mandou cada uma, ao fechar, para um arquivo JSONL no scratchpad (`registo-s3.jsonl`, 69 chamadas + duas fotos
> do save), ao longo da sessão. Cada resposta foi lida contra a pauta desse turno e contra o save; o que pedia causa foi lido
> no código (e uma coisa provada em Node, com o save da sessão e as funções do jogo: o "de plantão"). O localStorage foi lido
> antes (`taverna_cfg_golpe_final=perguntar`, `taverna_cfg_rolagens=1`) e, no fim, **com o jogo desmontado** (a aba levada a
> `/@vite/client`, uma página do mesmo endereço sem o app), apagou-se só `taverna_save_v1` — as duas chaves de antes ficaram,
> com os mesmos valores, conferido por leitura.
> **Medida de passagem (MM8):** ao fim das 30 respostas, `npcs` = 5 pessoas (Iracema Sousa, **Iracema**, Lourdes, **Lourdes
> Ferreira**, Manuel), `canone` = 9 entradas (a primeira: 9 e 13 ao fim de 49; a segunda: 6 e 4 ao fim de 10).

Convenção: a das duas primeiras. **J** é o que o jogador escreveu (ou tocou, entre parênteses). **M** é o Mestre, encurtado
com "…" e nunca reescrito; o número é o da resposta (M1–M30). `SISTEMA` são as linhas da tela que não são do Mestre. À
margem, em *itálico*, o que se provou ou partiu. A hora do relógio vai entre parênteses retos.

---

## Parte 1 — a chegada

**M1** [08:00] — … Vau Fincado não cheira a cidade: cheira a cera de lacre, a tinta fresca de pergaminho e a perfume caro …
A lei do lugar? Papel vale mais que ouro, e quem rasga um contrato dorme no Coice do Cão. Você chega com a poeira da estrada
ainda na garganta. **Iracema vem meio passo atrás, como sempre veio — não para te proteger, mas para que o mundo veja que você
não está sozinho.** … Perto fica A Nave de Ferro — ninguém sabe bem o que é, só que a guarda proibiu a estrada que leva até
lá … A carta sem assinatura ainda queima no teu bolso, ou talvez seja a bússola empenada que gira e aponta para cá desde o
naufrágio. … a única pessoa que sabe mais do que isso é Lourdes, **taverneiro(a)** do Rabo do Diabo.
`SISTEMA` Conquista desbloqueada: 🍻 Ombro Amigo · Pessoas — o mundo começou a guardar quem você conhece. · (topo) 08:00
*— **A VOZ NA SEGUNDA PESSOA (v9.346): aguentou.** "Você chega", "te envolve" — trinta respostas sem um "eu" do herói nem
um "Tobias olha" (as duas primeiras escorregavam para a primeira e para a terceira). Mistura o "você" com o "te/teu/ti" do
português falado do Brasil (12 vezes em 30 respostas); não é defeito, fica dito.*
*— **O COMPANHEIRO (v9.347): está lá, e no grupo do ecrã no turno 1** (Iracema Sousa, Monge, NV 1, PV 14/14, vínculo
50/100). A pauta pedia "serviram lado a lado noutra guerra, e ela não o deixou partir sozinho; **a razão que o trouxe é
também dela**"; o Mestre deu o "como sempre veio" e deixou cair a guerra e a razão partilhada. Ela ganha a razão dela mais
tarde, sozinha (M7, M8: "quando isso acabar, a gente volta para casa. Juntos").*
*— A ABERTURA (MM13): o mundo, onde estou, a pequena história (a Nave e a estrada proibida), porque estou aqui (a carta, a
bússola) e o passo (Lourdes, no Rabo do Diabo). Limpa, como nas duas primeiras. O rótulo "taverneiro(a)" da ficha passou
para a prosa.*
*— **Nesse mesmo turno o Cronista registou "Iracema"** — a serviçal do Rabo do Diabo, gente da base de Vau Fincado — como
conhecida no dia 1: o Mestre chamou a companheira pelo nome curto, e o registo casou-o com a homónima da cidade. Daqui
em diante há duas Iracemas no `npcs`. Ver o defeito 3.*

**J2** — Aceno ao meirinho que conta as sacas e pergunto-lhe: "Quem manda de facto em Vau Fincado? E essa Nave de Ferro, a
quanto tempo daqui fica?"
**M2** [08:00] — Um velho de queixo torto … — Aqui manda o imperador — e o imperador não pisa em Vau Fincado faz onze anos.
… Aqui, quem manda é o açougue. … — E a Nave de Ferro? — **Iracema deu um passo à frente, sem te consultar.** — Fica a quanto
daqui? … — A pé, seguindo a estrada do poente, umas duas horas. Mas ninguém vai. …
*— **PERGUNTAR É DE GRAÇA: aguentou** (08:00 antes e depois).*
*— PERGUNTA 1, quem manda: **inventado.** Não houve linha PERGUNTOU nenhuma nesta pauta — na segunda sessão a mesma pergunta
("quem manda de facto nesta cidade?") veio do Léxico e da ficha. O Cronista gravou "o açougue" no cânone.*
*— PERGUNTA 2, a quanto tempo a Nave: **inventado.** A base só dizia "🛕 A Nave de Ferro (templo, nível 6, 12 salas — a
guarda proibiu a estrada)"; nem rumo nem distância, como o Sepulcro da segunda sessão.*
*— A companheira faz a pergunta comigo. É o primeiro sinal de que há duas pessoas do meu lado da mesa.*

## Parte 2 — o Rabo do Diabo

**J3** — Atravesso a praça com a Iracema ao lado e entro no Rabo do Diabo. Procuro a Lourdes ao balcão.
**M3** [08:05] — O Rabo do Diabo tem cheiro de cerveja azeda e madeira velha, mas o que te prende é o silêncio. … Atrás do
balcão … você vê Lourdes — e vê que ela já te olhava antes. — Você veio pela carta — diz ela, e não é pergunta. … — Três
cacos só para eu te dizer o que sei. …
`SISTEMA` O que Praça da Panela guarda: Encontrar Lourdes ✓ (1/2) → agora: Descobrir o que Praça da Panela esconde, em São
do Meio · Mural — há um mural … · Aceitar: Quem Iracema perdeu (assina Iracema, ◉ 65, 8 noites)
*— O primeiro passo da história fechou **estando com ela** (v9.333: aguentou).*
*— **A PROCURA ERRADA:** a pauta dizia "[PROCURA — RESOLVIDA PELO SISTEMA] Procurei **Lourdes Ferreira** e ELA ESTÁ AQUI
(**Livraria do Santo**), estudante", na mesma pauta que me punha no Rabo do Diabo. Outra Lourdes, homónima, noutra casa. O
Mestre ignorou-a, bem — neste turno.*

**J4** — Sento-me ao balcão ao lado da Iracema e pouso a bússola entre nós. "Sou o Tobias, e o mar comeu-me o navio. …" …
"Antes do que sabes: há quanto tempo tens esta casa, Lourdes? E quanto é um quarto para esta noite?"
**M4** [08:10] — … — Casa? — ela repete … — Isso aqui nunca foi casa, Varzim. … — Quarto comum, seis cacos a noite. Bom,
quinze. Estábulo, dois por animal. … Iracema — **a outra, a serviçal**, com o xale desbotado — levanta-se … — Se quiser
serviço, deixei um papel no mural. Procura "Quem Iracema perdeu". É o Manuel. … Iracema Sousa — **a sua, a que viaja
contigo** — franze a testa … **Lourdes Ferreira, a estudante da Livraria do Santo, ouve tudo da ponta do balcão** … — Você
quer o que Praça da Panela guarda? … Vai pra São do Meio. … Eu não sei o que é. Mas sei quem viu de perto.
*— PERGUNTA 3, há quanto tempo tens esta casa: **perdida.** A PERGUNTOU trouxe só o pouso; o posto da ficha (que na segunda
sessão veio palavra por palavra) não veio, e o Mestre esquivou-se.*
*— PERGUNTA 4, o quarto: **do sistema, número a número** ("quarto comum ◉ 6 … bom ◉ 15, estábulo ◉ 2").*
*— **A homónima entrou em cena.** A estudante que o sistema "achou" na livraria no turno anterior está agora ao balcão, e
dá-me uma pista que ninguém elegeu. O Mestre separou as duas Iracemas à força de aposto ("a outra", "a sua") — fez o
melhor que podia com um registo que lhe deu duas pessoas para um nome.*
*— O cartaz do mural vem pela pauta ("Encene … que a pessoa MENCIONA o serviço … NÃO ofereça o trabalho a mim"); "Se quiser
serviço, deixei um papel" fica no limite da oferta. E a pauta planta um julgamento (PREPARAÇÃO), sem o começar.*

**J5** — Inclino-me sobre o balcão e baixo a voz para a Lourdes, a taverneira. "Não tenho cacos para te dar, mas tenho
palavra de náufrago, e essa não se afunda. Convence-te: diz-me o que a Praça da Panela esconde e eu calo o teu nome até ao
fim da estrada."
`SISTEMA` fazer falar — dificuldade 16 (o que a cidade cala). Seu bônus: +1 · sem treino. · TESTE DE PERSUASÃO ·
DIFICULDADE 16 · 9 + 1 = 10 · Falha
**M5** [08:20] — Lourdes solta o pano no balcão … — Palavra de náufrago — repete, sem deboche. — Bonito. Mas aqui, Varzim,
palavra não compra nem um gole d'água. … — Quem fala do que a Praça guarda amanhece com a língua pregada no balcão. …
**Tenho medo de dormir, não de morrer.** … Iracema pousa a mão no seu ombro. … — A gente devia procurar a estudante. Lourdes
Ferreira. A moça que foi embora dali. Ela não falou, mas ouviu.
*— **O SEGREDO SÓ SAI POR TESTE (v9.344): aguentou.** A pressão pediu teste (Persuasão, "fazer falar", CD 16 da tabela); a
falha foi respeitada com o motivo dela — "tem medo de dormir", que é a ficha; a pauta levou o veto ("revelar o que Praça da
Panela esconde … quem fala não sabe"); e o cânone ficou sem "Praça da Panela". Na segunda sessão, a mesma pressão fez da
casa de banhos um poço maldito, na pedra.*
*— A envelope da recusa proíbe "um terceiro que faça o favor no lugar dela", e a companheira aponta um: a homónima. A pista
falsa que o sistema plantou no M3 passou a ser o plano do grupo.*
*— O SOCIAL diz "Tentei fazer falar **essa pessoa**" — com "a Lourdes, a taverneira" escrito na frase.*

**J6** — Recolho a bússola e não insisto. "Justo." … "Lourdes, quem mais trabalha nesta casa? E São do Meio, a quantos dias
de marcha fica daqui?"
**M6** [08:25] — … — Iracema. Serve aqui, mas hoje não está. Coisa de família. Eu, você já viu. E a adega tem um barriqueiro
que só aparece quando a lua some. … — São do Meio fica longe. Com chuva, três dias de marcha. Sem chuva, dois e meio …
*— PERGUNTA 5, quem trabalha: **do sistema** ("Iracema (serviçal, fora do turno: a tratar de família), Lourdes"); o
barriqueiro é enfeite.*
*— PERGUNTA 6, São do Meio: **inventado.** A distância a uma cidade nomeada não veio (a v9.336 prometia "a distância a um
lugar nomeado").*

**J7** — Deixo uma moeda pelo caneco, aceno à Lourdes e saio do Rabo do Diabo com a Iracema; vou à Viela da Fome. Na primeira
banca de armas pergunto: "Que arcos se vendem aqui, e a quanto?"
**M7** [08:30] — A Viela da Fome fede a peixe frito e suor … — Arco? Aqui, não. Caiu um montante de padre na Viela, polido,
oitenta e oito cacos. … Arco, procura no Terreiro do Chocalho, talvez. … — Se formos confiar em alguém nesta cidade, que
seja na estudante. Mas eu quero uma coisa em troca: quando isso acabar, a gente volta para casa. Juntos. … Lourdes Ferreira
passou por aqui — você viu o vulto dela dobrando a esquina …
*— **"SAIO DE X E VOU A Y" (v9.341): aguentou.** "[MOVIMENTO] … AGORA estou em Viela da Fome."*
*— PERGUNTA 7, que arcos: **do sistema** ("não há arcos à venda em Vau Fincado; armas à venda: Polido Montante de padre ◉ 88").
O Terreiro do Chocalho existe (casa de relíquias); não tem arcos.*
*— **A procura que ninguém fez, outra vez:** "aceno à Lourdes" deu "[PROCURA — RESOLVIDA] Procurei Lourdes Ferreira e ELA
ESTÁ AQUI (Rabo do Diabo)", no turno em que eu saía de lá. O "vulto na esquina" é isso.*
*— O Caçador, como a Ladina e a Guerreira, chega de mãos vazias; a cidade não vende arco e a arma mais barata custa ◉ 88 a
quem tem ◉ 15. A moeda "deixada" pelo caneco não saiu da bolsa.*

*(painel: Mercado → 5 tochas, ◉ 5. No pé do Mercado: "O Narrador conta a conversa; quem cobra é o sistema." — o sistema a
falar de si na tela.)*

## Parte 3 — a estrada que não leva à Nave

**J8** — "Sem arco, então." Compro tochas e viro-me para a Iracema: "Não vamos esperar pela estudante. A Nave de Ferro está
perto, e quem proíbe uma estrada guarda alguma coisa nela." Saio da Viela da Fome e vou à Nave de Ferro, pela estrada do
poente.
**M8** [→ posto da estrada] — A estrada do poente sobe devagar … O posto da estrada é uma ruína sem telhado … — Quando isso
acabar, você me leva para ver o mar. Não daqui. De onde a gente veio. …
`SISTEMA` Navegação em deserto: d20+4 = 16 vs 10 → rota mantida · VOCÊ **Sigo viagem pela estrada.** · Você está em posto
da estrada.
**M9** [21:29] — O calor faz da estrada uma chapa … **Você e Iracema seguem o caminho para São do Meio** … À beira da
estrada, um caititu de armadura … desaparece entre as moitas, sem atacar.
*— **Um toque, duas respostas, treze horas.** "Vou à Nave de Ferro" não abriu a masmorra: abriu uma VIAGEM sem destino
(`jornada.para: ""`, três dias) pela direção ("do poente"); o lugar ficou "o posto da estrada"; e o próprio sistema
escreveu por mim "Sigo viagem pela estrada.", que é a segunda resposta. O relógio foi de 08:30 a 21:29. O Mestre, sem
destino, seguiu a espinha: "o caminho para São do Meio". Ver o defeito 2.*

**J10** — "Iracema, isto não é o caminho da Nave." Paro, acendo uma tocha e pergunto-lhe: "A quantas horas estamos de Vau
Fincado, e há quanto tempo não comemos?"
**M10** [21:34] — — Não é o caminho da Nave — repete … — É o caminho de São do Meio. … — Saímos de Vau Fincado ainda de dia.
… Faz umas seis, sete horas. Talvez oito. …
*— PERGUNTA 8, a quantas horas: **contradiz o relógio** (foram 13 h). PERGUNTA 9, há quanto tempo não comemos: **inventado.**
Fora da cidade não corre ficha nenhuma (as três fichas da mesa só correm com cidade, sem jornada, sem masmorra, sem luta).*
*— O topo passou a "ESTRADA DE SÃO DO MEIO": o Cronista batizou a estrada que o Mestre inventou.*

## Parte 4 — a Nave de Ferro

**J11** — "Não volto, e também não vou a São do Meio hoje." Viro para o poente, sigo o rasto da estrada proibida e **entro
na Nave de Ferro** com a Iracema, de tocha erguida.
**M11** — A Nave de Ferro não é uma nave: é um templo tombado, cravado no chão como uma quilha ao contrário. … Iracema entra
atrás de você, os pés leves, a mão no arco que não tem. …
`SISTEMA` VOCÊ **Encontrei uma entrada: A Nave de Ferro. Vou explorar.** · Você acende a primeira das suas 5 tochas. ·
● A Nave de Ferro — **DIFÍCIL: acima de você: sem plano, terreno ou ajuda, é onde se morre. (174 de poder (você 114 + 1 no
grupo) contra 671 — 3.9× menos do que isto pede)** · Você está na Nave de Ferro.
**M12** [22:43] — A fogueira estala baixo … O posto da estrada é um esqueleto de pedra … — Isso aqui já foi posto, sim — diz
**Iracema, a serviçal da taverna**, agachada perto da porta. … — Por mim, a gente não desce agora. Mas sei que você vai.
`SISTEMA` Você está no posto da estrada. · ENTRADA 1/6 · PASSAGENS: correntes penduradas balançam sem vento · um brilho
fraco reflete lá no fundo
*— "Entro na X" abre a masmorra pelo nome do mundo, de onde quer que se esteja (regra 1 de `portaDaMasmorra`); "vou à X" não.
Um jogador não sabe isto, nem devia.*
*— **Outra vez duas respostas num toque** (a minha e a de "Encontrei uma entrada", que o sistema escreveu por mim). A
segunda levou "[LUGAR — RECUSADO PELO SISTEMA] Você me tirou de onde eu estava — o posto da estrada — sem que eu tenha dito
que saio" — uma acusação falsa, porque quem abriu a masmorra foi o sistema — e o Mestre obedeceu: voltou-me à fogueira do
posto. A tela diz "Você está na Nave de Ferro" e, oito linhas abaixo, "Você está no posto da estrada".*
*— **O REVISOR PAGO TROCOU A COMPANHEIRA.** O Mestre escreveu "diz Iracema, agachada perto da porta"; o portão disse "Iracema
está no registro como serviçal da taverna" e o conserto (uma chamada paga) reescreveu "diz Iracema, a serviçal da taverna".
A companheira de armas de oito anos é, na tela, a criada de Vau Fincado. Ver o defeito 3.*
*— O veredito da masmorra é bom, e chega **depois** da porta. A base dizia "12 salas"; a planta tem 6.*

*(passagem "correntes", passo cauteloso: 2 tochas, restam 3 · `SISTEMA` GUARDIÃO · POR RESOLVER · 2/6. Nenhuma chamada,
nenhuma luta.)*

**J13** — Paro à soleira, de tocha baixa, e pergunto ao Mestre antes de dar um passo: o que há nesta câmara? Quantos são, a
quantos metros de mim, e há alguma coisa atrás da qual me possa esconder?
**M13** [23:03] — … a âncora de briga do posto, ali do lado de fora, não está no gancho. … — Devia estar ali — diz **Iracema,
que trabalha na taverna**. … Mais adiante, o fundo do primeiro salão se abre em três rasgos de pedra …
*— Relógio parado: a pergunta é de graça. **Mas a pauta não tinha a sala.** ONDE dizia "no posto da estrada · (aqui isto é um
forte)"; nem GUARDIÃO, nem quem lá está (o save tem um Goblin e um Lobo), nem distâncias. PERGUNTAS 10 a 13: **perdidas, as
quatro.** O Mestre contou o posto outra vez e inventou salões.*
*— Desta vez foi **o próprio Mestre** que escreveu "Iracema, que trabalha na taverna" — leu o histórico já consertado e o
lembrete da pauta ("[GUARDA DE CONTINUIDADE] O papel de cada pessoa está no registro"). E o portão consertou de novo.*

**J14** — Avanço para dentro da câmara das correntes, devagar, tocha à frente e a Iracema à minha esquerda.
**M14** — … Correntes grossas descem do teto … — Isso não é salão de rezar — sussurra Iracema … — É onde se prendia animal de
carga. … alguma coisa se moveu devagar, como quem muda de apoio atrás da pedra.
**J15** — Passo a tocha para a mão esquerda, fecho o punho direito e avanço sobre a coisa que se mexeu atrás da pedra …
**M15** — … e encontra um homem encolhido, ocupado com uma corrente presa ao tornozelo. … — Não fui eu que tirei a âncora …
*— **A SALA DO GUARDIÃO NÃO EXISTE PARA O JOGO.** Três turnos ali, e nada: nem luta, nem chave, nem o Narrador a saber o que
lá está. No código, `irParaSala` só abre combate para "combate" e "chefe"; a sala "chave" não tem ramo — não luta, não
narra, não se resolve, e **a chave nunca cai, logo o portão do chefe nunca abre.** Vem de antes do backup (a mesma linha está
em `backup-pre-redesign-2026-09-23`). Ver o defeito 1.*

## Parte 5 — a luta

*(passagem "cheiro de bicho e ferro velho", ritmo Normal)*
**M16** — A tocha estremece quando o lobo salta do rasgo de pedra à direita. Ele não veio para matar — vem com o corpo
baixo, testando o vão da porta … O animal tem uma pata dianteira quebrada …
`SISTEMA` (a batalha toma o painel) agora: Tobias Varzim · CAMPO 7×18 QUADRADOS DE 1,5 M · NO CORREDOR / NO VÃO DA PORTA / NO
FUNDO DA SALA · Lobo a 12 m — faltam 10,5 m · Atacar Mover Esquivar Empurrar Derrubar Saltar esperar Fugir · Agir → ·
Lobo 4/4
*— A batalha toma a tela, a ordem (Tobias 23, Lobo 7, Iracema 5) e a distância à vista. O "CONTRA: Lobo: sair inteiro daqui,
e briga só com quem impedir" é a intenção dele, e o Mestre honrou-a em todas as respostas.*

**J17 (no "como?")** — Pergunto ao Mestre, sem me mexer: a quantos metros está o lobo, e tenho alguma coisa entre mim e ele
que me sirva de cobertura?
**M17** — … Ele está a doze passos de distância, escondido atrás de uma pilha de pedras soltas, no vão da porta — coberto,
mas não invisível. …
*— **A vez continuou minha** ("[PERGUNTA AO MESTRE — não é ação: a vez continua minha e ninguém se move]"). Na primeira
sessão a mesma pergunta gastou a vez.*
*— PERGUNTA 14, a quantos metros: **do sistema** ("Lobo a 12 m"; os "doze passos" são a tradução solta). PERGUNTA 15, tenho
cobertura: **metade** — a pauta trazia a cobertura dele ("atrás de cobertura"), não a minha, e foi essa que veio.*
*— "[LUGAR — RECUSADO PELO SISTEMA] Você mudou o meu lugar no meio de um combate." Falso, e daqui em diante **em 11 das 14
respostas da luta**. Ver o defeito 4.*

**J18 (no "como?")** — Baixo a tocha atrás das costas e escondo-me na sombra, colado à parede do fundo, sem fazer barulho.
`SISTEMA` Teste de Furtividade · dif. 18 — passar sem ser visto · ★ TREINADO · 18 + 7 = 25 · Sucesso
**M18** — Você prende o fôlego e some na sombra de um pilar caído … O lobo fareja … Não vê. …
*— **ESCONDER-SE NA LUTA: rolou e não escondeu.** Nenhuma linha "🌠 Você está escondido", `condicoes: []`, a ação não foi
gasta (`economia.acao: 1`), e a pauta tratou-o como um teste qualquer ("Revele UMA coisa concreta e útil"). Na primeira
sessão a mesma frase fazia nascer o estado. A prosa diz que estou escondido; o sistema não.*

**(J19: esperar)** **M19** — … O lobo salta — e erra … — Lembra da noite da salina? — Iracema fala sem olhar para você …
**(J20: esperar)** **M20** — O golpe do lobo acerta Iracema Sousa em cheio no ombro. … gira os braços em um movimento fluido,
a Defesa Fluida já em ação …
*— A companheira ergue a guarda nas duas primeiras rodadas (é a tabela: apoio primeiro, 70%), e o lobo bate nela, não em mim
— não houve brecha para o revide. "A noite da salina" é a A GENTE a pedir "uma coisa que fizemos juntos"; o rodapé do mesmo
pedido proíbe "passado compartilhado que não esteja no cânone". O Mestre obedece ao primeiro e repete a mesma frase três
vezes (M19, M25, M26).*

**(J21: Atacar → Lobo)**
`SISTEMA` Lobo (7) cai sob o seu golpe. · [Como você faz isso? (opcional)] 0/240 · Poupar — cai desacordado, vivo · Matar —
não se levanta mais · Lembrar minha escolha
*(a caixa nasce **acima do ecrã** — y −85, "entirely outside the viewport" — no painel de 310 px, como na primeira sessão.
Escrevi por código: "Agarro o lobo pelo cachaço quando ele salta, rolo com ele no chão e aperto-lhe a garganta com o antebraço
até a pata quebrada parar de arranhar a pedra." → Matar)*
**M21** — **Seu golpe final acerta o lobo no flanco, profundo.** O animal tomba … Perto da carcaça … uma poção de cura …
`SISTEMA` Tobias Varzim → Lobo: d20 10+2=12 vs 12 · acerta, 7 de dano · Lobo 0/4 ☠ · Todos os inimigos caíram — o combate
termina. · ◉ Espólios: +2 moedas · +7 XP · No chão: 🧪 Poção de Cura Pequena · rodada 3 · **1 de pé contra você** · Lobo 4/4
*— **O GOLPE FINAL DO HERÓI:** a escolha chegou ("DESFECHO Tobias Varzim deu o golpe final em Lobo, e foi para matar").
**O "como" não chegou:** nenhuma das chamadas contém "antebraço". (Aqui o método tem uma ressalva: escrevi por código e não
conferi o contador. No golpe da companheira, mais abaixo, escrevi com o teclado e conferi.) E o Mestre disse "golpe final"
em voz alta — a etiqueta da pauta na boca da narração.*
*— A mesma pauta: "[CORREÇÃO DO SISTEMA — CÂNONE: QUEM É QUEM] **Iracema Sousa está no registro como vendedor de ervas**, e
você o chamou de 'golpe do lobo acerta'". A companheira tem duas fichas: no grupo é Monge de armas; no registo é a vendedora
de ervas do elenco. Cada vez que luta, o portão acusa.*

**J22** — Ajoelho-me junto do lobo, apanho a poção de cura do chão e guardo-a no cinto. Depois olho para a Iracema: "O ombro,
como está?"
**M22** — Você se ajoelha, ergue o frasco do chão e o prende no cinto. … — Dói feito faca cega, Tobias. Mas não caiu. …
*— A poção ficou no chão (`chao.itens`); "apanho" por palavras não apanha, e o Mestre diz que sim. O EXAMINAR é que apanha
("abaixar-se não gasta o turno") — e apanhou, sem chamada.*

**(voltar (Guardião); depois "⚔ Combate — deixada pela metade")**
**M23** — A tocha se apaga num estalo … — Tobias... — ela sussurra … O lobo morto ainda está ali, no escuro … **o lobo não foi
embora.** Ele recuou, e agora espera …
`SISTEMA` Lobo 4/4 · a mesma luta, iniciativa nova (Tobias 17, Lobo 14, Iracema 7) · NO ESCURO
*— **VOLTAR A UMA SALA LIMPA (v9.334): não aguentou.** A sala de combate vencida ficou `resolvida: false` — o painel
chamou-lhe "deixada pela metade" — e voltar refez a luta, com o mesmo lobo de vida cheia. A peça de MM14 que guarda a sala
limpa só olha `resolvida`, e a vitória de uma luta fechada pelo sistema ("Todos os inimigos caíram") nunca a marca:
`resolverSalaAposCombate` só corre no ramo que lê a resposta do Narrador. Ver o defeito 1. Três consertos pagos neste
combate foram "lobo está MORTO(A) no cânone".*

*(teclei no "como?", sem enviar: "Encosto-me à parede para lhe abrir caminho e grito para o escuro: rende-te ou vai-te
embora, que eu não te sigo!" → a linha do veredito: **"Lobo: dificilmente cedem — fogem."** — antes do clique, como a MM9
quer. Enviei.)*
`SISTEMA` Teste de Intimidação · dif. 18 — intimidar · SEM TREINO · 7 · Falha
**M24** — Você grita para o escuro, a voz batendo nas pedras e voltando vazia. … O lobo não aceitou rendição, não foi embora.
*— **A RENDIÇÃO:** o veredito antes do clique, o teste, a recusa firme. Não houve rendição — um lobo não é quem se rende, e o
sistema disse-o antes. Não apareceu inimigo que se pudesse render.*

**(J25: esperar)** **M25** — O golpe do lobo rasga seu ombro … — Ainda lembra da noite da salina? …
**(J26: esperar)** **M26** — O golpe do lobo pega Iracema Sousa no ombro, e ela cai de joelhos … — Ainda lembra da salina,
Tobias?
**(J27: esperar — "Lobo erra o golpe · 🗡 contra-ataque · 0 PM — na mesma batida · deixar passar")**
*(a janela fechou-se antes de eu a tocar: a minha ferramenta demora mais que o relógio dela. Não é defeito do jogo.)*
**M27** — … A lâmina dela corta o ar, mas erra … — Iracema usou Rajada de Golpes … errou.
**(J28: esperar)** **M28** — Iracema Sousa espera, o sangue escorrendo do ombro … PV 6/13.

**(J29: esperar → "🗡 contra-ataque", tocado a tempo)**
**M29** — Seu braço revida quase sozinho, a lâmina cortando o ar no instante em que o lobo recua. O golpe pega de raspão na
pata dianteira … O lobo se vira … e **foge mancando para o corredor escuro.** …
`SISTEMA` Lobo 1/4 · Lobo a 1,5 m — ao alcance.
*— **O REVIDE É APLICADO (v9.334): aguentou.** "[REAÇÃO — REVIDE RESOLVIDO PELO SISTEMA] Meu contra-ataque acertou Lobo: 3 de
dano (ele está com 1 de 4)", e o tabuleiro diz 1/4. Na primeira sessão foi contado duas vezes e aplicado nenhuma.*
*— Mas o Mestre fê-lo fugir, e o tabuleiro tem-no a 1,5 m. E "a lâmina" de um herói sem arma.*

**(J30: esperar → "deixar passar")**
`SISTEMA` **Iracema Sousa derruba Lobo.** · [Como Iracema Sousa faz isso? (opcional)] · Poupar · Matar
*(a caixa nasce a y −118, fora do ecrã. Pus o foco nela e **escrevi com o teclado**: "Iracema deixa-o vir, gira por baixo da
mordida e quebra-lhe o pescoço com o calcanhar, num estalo seco que a câmara inteira ouve." — o contador marcou **129/240**.
→ Matar)*
**M30** [23:33] — **O golpe de Iracema Sousa acerta o lobo no flanco**, e o bicho cai de uma vez … — Ele não queria... — a voz
falha. — Só queria sair. … — A gente precisa decidir: pega o que sobrou e segue, ou volta. Mas eu não volto sozinha. Não aqui.
*— **O GOLPE FINAL DA COMPANHEIRA (MM3b): a primeira vez que se viu.** O cartão sobe com o nome dela na pergunta, a escolha
chega ("DESFECHO Iracema Sousa deu o golpe final em Lobo, e foi para matar"), e o Mestre deu-lhe a fala certa — "Ele não
queria... Só queria sair." É o melhor momento da sessão.*
*— **O "como" não chegou, pela segunda vez — agora escrito ao teclado, com o contador a 129/240.** Nenhuma chamada contém
"calcanhar"; o DESFECHO trouxe só a primeira frase. A causa provável é o teto da pauta: esta pauta tinha 1212 caracteres de
1400, e a linha do "como" (~230) é a que não cabe — enquanto o ONDE gastava ~550 a dizer que "Vau Fincado é de corte … falta
pouca coisa" dentro de uma masmorra. O Mestre narrou o mesmo "no flanco" das duas vezes.*

*(Fim da sessão às 23:33 do dia 1, com 30 respostas: o herói a 6/13, a companheira a 5/14, a Nave com a sala do guardião
por resolver e o portão do chefe lacrado para sempre.)*

---

## As perguntas, contra o sistema

| # | resp. | pergunta | o que o Mestre disse | veio de | onde |
|---|---|---|---|---|---|
| 1 | M2 | quem manda de facto? | "o imperador … quem manda é o açougue" | **inventado** | nenhuma PERGUNTOU; o Cronista gravou "o açougue" |
| 2 | M2 | a quanto tempo fica a Nave? | "seguindo a estrada do poente, umas duas horas" | **inventado** | a base só tem "templo, nível 6, 12 salas" |
| 3 | M4 | há quanto tempo tens esta casa? | "Isso aqui nunca foi casa" | **perdida** | o posto da ficha não veio |
| 4 | M4 | quanto é um quarto? | "seis cacos … Bom, quinze. Estábulo, dois" | **sistema** | PERGUNTOU pouso, número a número |
| 5 | M6 | quem mais trabalha nesta casa? | "Iracema. Serve aqui, mas hoje não está" (+ um barriqueiro) | **sistema** | PERGUNTOU quem trabalha |
| 6 | M6 | São do Meio, a quantos dias? | "três dias com chuva, dois e meio sem" | **inventado** | a distância a uma cidade não viaja |
| 7 | M7 | que arcos se vendem, a quanto? | "Arco? Aqui, não. … montante … oitenta e oito" | **sistema** | PERGUNTOU mercado |
| 8 | M10 | a quantas horas de Vau Fincado? | "umas seis, sete horas. Talvez oito" | **contradiz** | o relógio andou 13 h; na estrada não corre ficha |
| 9 | M10 | há quanto tempo não comemos? | (a mesma conta) | **inventado** | idem |
| 10–13 | M13 | o que há na câmara? quantos? a quantos metros? onde me esconder? | o posto da estrada, salões inventados | **perdidas (4)** | a sala da masmorra não vai à pauta fora da luta |
| 14 | M17 | a quantos metros está o lobo? | "a doze passos" | **sistema** | "Lobo a 12 m" do tabuleiro |
| 15 | M17 | tenho cobertura? | "coberto, mas não invisível" (ele) | **metade** | a pauta só traz a cobertura dele |

**A conta:** das 15 perguntas, **4 saíram do sistema** (4, 5, 7, 14), **1 pela metade** (15), **4 foram inventadas** (1, 2,
6, 9), **1 contradisse** o relógio (8) e **5 perderam-se** (3, 10–13). Contra as anteriores: **5/12 → 7/12 → 4/15**.

Não é a mesma régua que piorou — é a sessão que saiu da cidade. **Dentro dos muros** (as 7 primeiras): 3 do sistema, 3
inventadas, 1 perdida — pior que a segunda (as duas que lá eram certas, "quem manda" e "há quanto tempo", vieram vazias
desta vez), mas da mesma família: quando o fato chega, o Mestre acerta (4 de 4, desta vez, número a número). **Fora dos
muros** (as 8 últimas): 1 do sistema, e só porque a luta tem tabuleiro. Na estrada e na masmorra, fora de combate, **as
fichas da mesa não correm** (`fichasDaMesa` exige cidade, sem jornada, sem masmorra, sem luta) e **a sala onde estou não vai
à pauta** — é aí que moram as 5 perdidas e a contradita. A regra que as duas primeiras tiraram mantém-se, e esta sessão
acrescenta-lhe a outra metade: **onde o fato não viaja, o Mestre inventa; e fora da cidade quase nenhum fato viaja.**

---

## O custo — cada chamada, com dono

| quem chamou | chamadas | por resposta | pedido médio | tempo médio | o que é |
|---|---|---|---|---|---|
| **Narrador** | 30 | 1,00 | 126.675 car. (system 72.618; janela de 1 a 47 mensagens) | 7,8 s | a resposta do Mestre |
| **Cronista** | 30 | 1,00 | 7.876 car. | 1,6 s | o juiz do turno (leve, JSON) |
| **Portão — o REVISOR DE CONTINUIDADE** | 8 | 0,27 | 2.052 car. | 2,1 s | o conserto da narração (leve, texto) |
| Léxico | 1 | — | 15.379 car. | 60,5 s | só na criação do mundo |
| bocas (falas de personagem) | 0 | 0 | — | — | desligadas na v9.342 |
| rede de segurança | 0 | 0 | — | — | não foi precisa |
| voz, sala, arquivista, crónica | 0 | 0 | — | — | não usados |
| **total** | **69** | **2,27** (68/30, sem o Léxico) | | | 69 de 69 pelo DeepSeek; nenhum erro |

**Tokens:** 1.295.242 de entrada (802.688 do cache, **62%**) e 21.121 de saída, nas 69.

**Contra as duas primeiras:** ~2,0 → 3,6 → **2,27 chamadas por resposta.** O corte das bocas (v9.342) aguentou: zero falas
pagas. Ao teto de 500 por endereço, isto dá **~220 respostas por dia** (eram ~138 na segunda sessão).

**O dono das ~1,1 chamadas por resposta que na segunda sessão não o tinham:** **o portão — o REVISOR DE CONTINUIDADE**
(`passarPeloPortao`, `App.jsx` ~11164: `pedidoDeConserto` → `chamarModelo(…, "texto", "leve")`). Provado por duas vias:
(1) no código, as chamadas ao modelo são onze, e só três correm por turno sem botão — o Cronista, a boca e o revisor (as
outras são o Narrador e a rede de segurança, o Léxico na criação, três arquivistas e a crónica, todos por botão); com as
bocas contadas à parte, **o único leve por turno que sobra é o revisor**; (2) neste registo, que guarda o prompt de cada
uma, **é a única chamada leve que não é do Cronista**. A segunda sessão teve mais (~1,1 contra 0,27) porque disparou mais
correções (o "magro", o "menina", os nomes fundidos).

**E as 8 desta sessão foram todas pagas por um defeito do próprio sistema** — nenhuma corrigiu um erro do Mestre:

| conserto | quantos | a "contradição" que o portão viu | o que é de verdade |
|---|---|---|---|
| "Iracema está no registro como serviçal da taverna" | 3 | o Mestre a falar da companheira pelo nome curto | a homónima de Vau Fincado que o Cronista registou no M1 |
| "Iracema Sousa está no registro como vendedor de ervas" | 2 | a companheira a lutar | a ficha do registo (o ofício do elenco) contra a do grupo (Monge de armas) |
| "lobo está MORTO(A) no cânone" | 3 | o lobo de volta | a sala limpa que o próprio sistema ressuscitou |

Cada uma custa uma chamada e ~2 s **antes** de a narração chegar à tela — e duas delas estragaram o texto (a companheira virou
"a serviçal da taverna"). Consertar os três defeitos de baixo corta este quarto de chamada por resposta sem tocar no revisor.

---

## O que a sessão tinha de provar

| item | aconteceu? | como / porquê |
|---|---|---|
| **a voz na segunda pessoa** | **sim** (M1–M30) | "você", com o "te/teu" do Brasil; nenhum escorregão para o "eu" do herói nem para a terceira |
| **o companheiro está lá, com a razão partilhada; no grupo do ecrã no turno 1** | **está; a razão não** | no grupo e na ficha no turno 1; a guerra e "a razão é também dela" caíram da prosa no M1 |
| **direito à porta da masmorra, com poucas paragens** | **sim, mas por acaso** | "vou à Nave" abriu uma viagem sem destino (13 h); só "entro na Nave" abriu, e de longe |
| **6–8 perguntas de mesa** | **15 feitas** | 4 do sistema, 1 metade, 4 inventadas, 1 contradita, 5 perdidas |
| **pressão por um segredo: teste, e nada no cânone sem ele** | **sim** (M5) | Persuasão CD 16, falha respeitada, veto na pauta, cânone limpo |
| **"saio de X e vou a Y"** | **sim** (M7) | Rabo do Diabo → Viela da Fome |
| **o golpe final do herói e o "como"** | **o golpe sim; o "como" não** (M21) | a escolha chega; a frase não; a caixa nasce fora do ecrã |
| **o golpe final do companheiro (MM3b)** | **sim, pela primeira vez** (M30) | o cartão, a escolha e a fala dela; o "como" não chegou, escrito ao teclado |
| **o revide do contra-ataque é aplicado** | **sim** (M29) | 3 de dano, Lobo 1/4 na pauta e no tabuleiro |
| **esconder-se numa luta, com vantagem** | **não** (M18) | o teste passou (25 vs 18) e o estado não nasceu |
| **um atirador a manter distância** | **não apareceu** | a Nave tinha lobo, goblin, quimera e soldado |
| **uma rendição** | **o veredito sim; a rendição não** (M24) | "Lobo: dificilmente cedem — fogem." antes do clique; teste falhado; nenhum inimigo que se renda |
| **voltar a uma sala limpa** | **não fica limpa** (M23) | o mesmo lobo, 4/4, no escuro |
| **o "de plantão" do companheiro no antigo posto** | **sim, aparece** (provado em Node) | ver abaixo |

**O "de plantão", e como se confirmou.** A viagem a São da Onça custaria dias de estrada e respostas que a sessão não tinha,
por isso confirmei pelo save, com as funções do jogo, em Node (`scratchpad/s3-plantao.mjs` e `s3-plantao2.mjs`): o elenco
(`elencoDoMundo`, a mesma semente) põe **Iracema Sousa, vendedora de ervas, em São da Onça, na Praça da Panela**; e
`genteParaPauta` — a ficha que o jogo manda ao Narrador — com a cidade São da Onça, a heroína no mercado, **o grupo com a
Iracema dentro** e a pergunta "quem trabalha na Praça da Panela?", devolve **"Iracema Sousa (vendedor de ervas), Francisca
Alves (mercador(a), de folga hoje: na praça)"** — ela, de turno, sem folga, no posto que deixou, enquanto anda comigo. A
pergunta "quem está de plantão aqui?" devolve a mesma linha. **Aparece.**
E há um pormenor que vale mais que o defeito: **o antigo posto da companheira tem o nome do lugar do segredo.** Há duas
"Praça da Panela" no mapa — a de São da Onça, onde ela trabalhava, e a de São do Meio, que a espinha esconde. Uma companheira
que vem do lugar com o nome do mistério é a melhor ponta de história que o sistema podia dar ao Mestre, e hoje é um acaso que
ninguém lê.

---

## Os defeitos, pela ordem em que partem a sessão

1. **A masmorra não se pode acabar, e a sala vencida não fica vencida.** *Visto e lido no código.* (a) A sala do **Guardião**
   (tipo `chave`) não tem ramo em `irParaSala` (`App.jsx` ~20282–20411): entrar não abre luta, não manda nada ao Narrador e
   não se resolve; o Goblin e o Lobo que o save lhe dá nunca aparecem, **a chave nunca cai e o portão do chefe nunca abre**
   (M12–M15). Vem de antes do backup. (b) **A sala de combate vencida fica `resolvida: false`**: `resolverSalaAposCombate` só
   corre no ramo que lê a resposta do Narrador, e a luta que o sistema fecha ("Todos os inimigos caíram — o combate termina")
   não passa por lá. Daí "Combate — deixada pela metade", e **voltar refaz a luta** com o mesmo lobo de vida cheia (M23) — o
   defeito 3 da primeira sessão, vivo por outra porta, e mais três consertos pagos ("lobo está MORTO"). Numa sessão real, o
   jogador fica a andar entre a sala do guardião morta e a do lobo que renasce, de tocha a acabar, sem saída para o chefe.
2. **"Vou à masmorra que a cidade aponta" não leva à masmorra.** *Visto* (M8–M10): a frase abriu uma viagem **sem destino**
   pela direção ("do poente"), o sistema escreveu por mim "Sigo viagem pela estrada.", o relógio saltou **13 horas** (08:30 →
   21:29) e o Mestre levou-me pela estrada de São do Meio. A masmorra da região não é destino de viagem nem está no mapa; só
   "**entro** na Nave" a abre — e abre-a de onde quer que se esteja. Duas vezes um toque deu duas respostas do Mestre (M8+M9,
   M11+M12), a segunda escrita pelo sistema na boca do herói.
3. **A companheira tem duas fichas e uma homónima, e o revisor pago apaga-a.** *Visto.* No grupo é "companheira de armas,
   Monge"; no registo é "vendedor de ervas" (o ofício do elenco — `companheiroInicial` grava `papel: pessoa.papel`); e no M1
   o Cronista registou a **Iracema serviçal** de Vau Fincado pelo nome curto. O portão vê contradição sempre que ela fala ou
   luta: **5 das 8 chamadas de conserto**, e duas reescreveram-na "a serviçal da taverna" (M12, M13) — a seguir, o próprio
   Mestre passou a chamar-lhe assim. É o pior defeito da peça nova: a pessoa que a v9.347 traz para dar peso à campanha é a
   que o sistema mais desfaz.
4. **A masmorra não chega à pauta, e o lugar volta a acusar o Mestre.** *Visto.* Fora da luta, ONDE diz "no posto da estrada
   · (aqui isto é um forte)", sem a sala, sem quem lá está, sem distâncias: 4 perguntas perdidas (M13) e salões inventados. E
   "[LUGAR — RECUSADO PELO SISTEMA]" voltou: **12 vezes em 30 respostas** — 1 ao abrir a masmorra ("Você me tirou de onde eu
   estava — o posto da estrada", M12, o que me devolveu à fogueira) e 11 nas 14 respostas da luta ("Você mudou o meu lugar no
   meio de um combate"). **Na cidade: zero** — a v9.341 fechou a porta do "cidade"; esta é outra, a da masmorra e da luta.
5. **O "como" não chega — 0 de 2, e 0 de 5 em três sessões.** *Visto.* No golpe do herói (M21) e no da companheira (M30, ao
   teclado, contador a 129/240): a escolha chega, a frase não. A caixa nasce **acima do ecrã** (y −85 e −118 no painel de 310
   px), como na primeira sessão. Causa provável, não provada: o teto da pauta (1212 de 1400 sem a linha; a linha tem ~230), com
   o ONDE a gastar ~550 caracteres de economia da cidade dentro de uma masmorra.
6. **Esconder-se na luta rola e não esconde** (M18). Furtividade 25 contra 18, e nenhum estado, nenhuma linha, nenhuma ação
   gasta. *Visto; a causa não a achei* — o bloco que faz nascer o estado (`concluirRolagem`, MM6) não deixou rasto.
7. **Os homónimos que o sistema traz para a cena.** *Visto.* Uma "procura" que ninguém fez achou **Lourdes Ferreira**, a
   estudante, duas vezes (M3 "na Livraria do Santo", M7 "no Rabo do Diabo", sempre noutro sítio que o meu); no M4 estava ao
   balcão, dava pistas, e no M5 a companheira propôs procurá-la. Uma pista falsa feita de um erro de registo.
8. **O companheiro de plantão no antigo posto** (provado em Node, acima). Ninguém o viu ainda; o primeiro jogador que vá a
   São da Onça vê-la a vender ervas enquanto ela lhe segura a tocha.
9. **As perguntas que inventam na cidade.** "Quem manda" sem PERGUNTOU (M2), a distância à masmorra e a uma cidade (M2, M6),
   o posto que não veio (M4). A v9.336 prometia a distância "a um lugar nomeado"; para a masmorra e para São do Meio não viajou.
10. **O veredito da masmorra chega depois da porta** (M11): "DIFÍCIL … é onde se morre … 3.9×" — a melhor frase de perigo do
    jogo, dita a quem já entrou. A base só o dizia na pauta ("nível 6"), que o jogador não lê.
11. **Miúdos, mas à vista:** "taverneiro(a)" na prosa (M1); "rodada 3 · 1 de pé contra você" e "Lobo 4/4" com o lobo morto
    (M21, M30); a poção "apanhada" por palavras fica no chão (M22) e a moeda "deixada" não sai (M7); o Caçador sem arma, numa
    cidade sem arcos, com ◉ 15 para um montante de ◉ 88; o Feixe de Tochas recolhido não acende (a masmorra fica "às escuras"
    com 5 tochas na mochila); "a lâmina" de um herói desarmado (M29); o lobo "foge" na prosa e fica no tabuleiro (M29); a
    A GENTE repete "a noite da salina" três vezes; "Seguro a ação e observo, pronto para responder Turno dos inimigos" (duas
    frases coladas); o rodapé do Mercado "O Narrador conta a conversa; quem cobra é o sistema" (o sistema a falar de si); a
    base diz "12 salas" e a planta tem 6; a companheira nunca ataca nas duas primeiras rodadas (é a tabela) e
    `decidirAcaoCompanheiro` sorteia com `Math.random`, fora da semente (`companheiros.js` ~276 e ~280).

### Os consertos de 30/09–01/10 (v9.341–v9.347) — aguentaram?

| conserto | aguentou? | visto |
|---|---|---|
| v9.341 — o "cidade" do Cronista não tira ninguém da taverna; "saio de X e vou a Y" vai a Y | **sim, na cidade** | "saio do Rabo do Diabo… vou à Viela" foi à Viela (M7); **zero** recusas de lugar nos 7 turnos de cidade (eram 4 em 10). Fora dela a recusa falsa voltou por outra porta: 12 na masmorra |
| v9.342 — as bocas desligadas | **sim** | 0 falas pagas; 3,6 → **2,27** chamadas por resposta |
| v9.343 — a falha da API diz que foi a ligação | **não visto** | 69 de 69 com 200 |
| v9.344 — o segredo só sai por teste e não entra no cânone | **sim** | M5: Persuasão CD 16, falha, veto, cânone limpo; a única mancha é a companheira a sugerir um terceiro |
| v9.345 — os nomes que se fundiam | **metade** | nenhum Túlio fundido; mas o registo casou o nome curto da companheira com a serviçal (M1), a "procura" achou a homónima Lourdes Ferreira duas vezes, e o SOCIAL disse "essa pessoa" com "a Lourdes" na frase |
| v9.346 — a segunda pessoa | **sim** | 30 de 30 |
| v9.347 — o companheiro de antes | **está, e parte-se** | no grupo no turno 1, com voz própria e o melhor golpe final da sessão; mas a razão partilhada caiu do M1, o registo dá-lhe outro ofício, a homónima apaga-a, e está de plantão em São da Onça |
| *(de antes)* v9.334 — o revide fere; o "como" chega; a sala limpa fica limpa | **1 de 3** | o revide **sim** (M29); o "como" **não** (0/2); a sala limpa **não** (M23) |
| *(de antes)* v9.336 — perguntar é de graça | **sim** | relógio parado em M2, M13; na luta a vez ficou minha (M17) |
| *(de antes)* v9.333 / v9.339 — missões e tramas | **sim** | o passo 1 fechou estando com Lourdes; nenhuma trama forçada; o cartaz da serviçal ficou no mural |

---

## O veredito

**O nosso Mestre toca uma sessão à la Matt Mercer? Ainda não — e agora sabe-se onde.**

**Na cidade, sim, ou quase.** A voz fala comigo, a companheira tem vontade própria, o balcão responde com números, o segredo
fecha-se a quem não o sabe arrancar, e "saio daqui e vou ali" vai ali. **Fora dela, não**: a estrada leva para onde a espinha
quer, a masmorra não se acaba, a sala vencida renasce, o "como" nunca chega, e o sistema paga para transformar a companheira
de armas numa criada. A luta propriamente dita — o tabuleiro, a vez que não se gasta a perguntar, o revide que fere, o golpe
final do grupo — é a melhor que joguei aqui; é **à volta** dela que a mesa se desfaz.

| | 1.ª (v9.332) | 2.ª (v9.340) | 3.ª (v9.347) |
|---|---|---|---|
| respostas jogadas | 49 | 10 (o teto) | **30** |
| perguntas do sistema | 5 de 12 | 7 de 12 | **4 de 15** (3 de 7 na cidade; 1 de 8 fora) |
| inventadas / perdidas | 4 / 1 | 2 / 0 | **4 (+1 contradita) / 5** (5 das 6 más fora da cidade) |
| onde a sessão partiu | T5 (a história fechou sozinha) | T11 (o teto da API) | **não partiu; partiu a masmorra** (M12–M15: o guardião mudo) |
| missões fechadas sem jogar · tramas forçadas · "você mudou" | 3 · 4 · 4 | 0 · 0 · 0 | **0 · 0 · 0** |
| recusas falsas de lugar | — | 4 em 10 | **12 em 30** (0 na cidade, 12 na masmorra) |
| o "como" do golpe final chega | 0 de 3 | — | **0 de 2** |
| o revide é aplicado | 0 de 2 | — | **1 de 1** |
| a sala limpa fica limpa | não | — | **não** |
| esconder-se na luta faz nascer o estado | sim | — | **não** |
| golpe final do companheiro | — | — | **sim, pela primeira vez** |
| chamadas por resposta | ~2,0 | 3,6 | **2,27** (e 8 de 8 consertos pagos por defeito do sistema) |

**O que ainda falta**, pela ordem: (1) **a masmorra como jogo** — o guardião que luta e larga a chave, a sala vencida que fica
vencida, e a sala onde estou na pauta, com quem lá está; (2) **a companheira inteira** — uma ficha só (o ofício do registo
é o do grupo enquanto ela anda comigo), o nome curto que não casa com a homónima da cidade, e fora do antigo posto; (3) **o
"como"** — cinco em cinco perdidos em três sessões é o defeito mais antigo da fase, e é o momento mais Matt que existe; (4)
**o caminho para onde a cidade aponta** — "vou à Nave" tem de ir à Nave, com o veredito **antes** da porta; (5) **os fatos
fora dos muros** — a estrada e a masmorra sem ficha nenhuma; (6) **esconder-se**. A quarta sessão devia ser **uma descida
inteira**: entrar, guardião, chave, chefe, sair — com uma companheira que continua a ser quem é.

---

## A proposta ambiciosa, para a pessoa decidir

**"Como você quer fazer isto?" — o momento que para a mesa.** Quando um golpe derruba o último de pé (ou um chefe, ou um
nomeado), **a batalha congela**: o tabuleiro escurece, quem caiu fica no centro a meio da queda, e a pergunta ocupa o ecrã
inteiro — "Como você quer fazer isto?" (ou "Como a Iracema faz isto?"), com o foco já na caixa e o teclado aberto, e dois
botões por baixo. Com `prefers-reduced-motion`, sem o escurecer: a pergunta aparece no lugar. Nada corre enquanto ela está
aberta, e fechá-la sem escrever é o mesmo clique de hoje — nunca custa o turno. **E a frase do jogador não passa pelo teto**:
entra na pauta com prioridade de ferro (acima de tudo, como o veto), e o Mestre recebe a ordem de abrir a narração por ela.
Se o jogador escreveu, a primeira coisa que lê a seguir é a sua própria morte, contada.

**Porquê, e com que prova.** É a frase do Matt — a que os jogadores dele esperam a sessão inteira por ouvir — e é a peça
que mais falhou nesta fase: **0 de 5 "como" chegaram em três sessões** (1.ª: 0/3, um deles ao teclado; 3.ª: 0/2, um ao
teclado com o contador a 129/240). A caixa nasce **acima do ecrã** no painel de 310 px (y −85, y −118): hoje, em telemóvel,
escreve-se às cegas ou não se escreve. Medida de entrada: a caixa passa de fora do ecrã para o centro dele (0 → 1 toque até
escrever); a frase passa de cortável a incortável. E joguei os dois golpes finais desta sessão: o da Iracema, com a fala
"Ele não queria... Só queria sair", foi o melhor momento das 30 respostas — e o Mestre narrou-o "no flanco", porque a
frase que escrevi para ela nunca lhe chegou.

**O peso:** muda o momento da luta (a batalha para enquanto se escreve) e a prioridade de uma linha da pauta — o tema da
ordem de 23/09, e um commit revertido desfá-lo; mas é o fluxo da batalha, e por isso vai também a "Para a pessoa decidir".
A peça (o cartão em ecrã inteiro, o estado "a meio da queda") é do `desenho`; o momento e o tempo são meus; a prioridade da
linha é do `backend`.

---

*Observações para a pessoa, fora da lista de consertos:* a companheira de antes vem **do lugar com o nome do segredo** (a
Praça da Panela de São da Onça; o segredo está na Praça da Panela de São do Meio) — é a melhor ponta de história que o
sistema deu nesta sessão, e ninguém a lê; e o Náufrago trouxe uma "companheira de armas", que a tabela das ligações permite
mas que soa a soldado — um náufrago pede mais "o mesmo barco" que "a mesma guerra".
