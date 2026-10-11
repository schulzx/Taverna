# O coração da campanha — C1 (o núcleo) e C2 (as subtramas)

*Desenho do `jogo`, 11/10/2026, para a Fase MM-C (`mente/pauta.md`, "Fase MM-C").
Especificação para o `backend`: tabelas e módulo puro. Nenhuma linha de código
de produção aqui — só o que o jogo vai viver, e porquê.*

---

## 0. Em três frases

A 6.ª sessão subiu onde havia **gente com voz** (M16–M36, ~3,8) e caiu onde
havia **sistema sem gente** (o calabouço, ~2,6). O Narrador cumpre **frase
fechada** e ignora **ordem aberta**. Então o coração é isto: **quatro a seis
pessoas que o sistema conhece por dentro** (o que querem, temem, escondem e
carregam, a linha que não cruzam, como falam), **cada uma com um arco de três
cenas amarrado a um ato**, e o segredo de uma delas — a que nasce do passado do
herói — **é a reviravolta do primeiro ato, com duas pistas plantadas antes**.
Ao Narrador chega **uma linha por turno, só de quem está em cena, em frase
fechada**; ao jogador nunca chega o nome de nada disto.

**O que muda para quem joga, em uma linha:** *o companheiro deixa de ser um
gracejo e passa a ter um irmão na carroça; o homem que sabia do roubo tem cera
preta no canto da carta; e a moça que sumiu no calabouço continua a puxar.*

> Nota de numeração: a pauta diz "reviravolta do ato 1" contando como gente;
> o código conta do zero (`REVIRAVOLTA_DO_ATO0`, `batidas.js`). É o **mesmo
> ato**: o primeiro.

---

## 1. C1 · o núcleo

### 1.1 Quem entra — `PAPEIS_DO_NUCLEO`

**Ninguém é gente nova.** O núcleo escolhe-se do que já existe (elenco, grupo,
fio do antagonista), pela semente, e **ordena-se por esta tabela**:

| ordem | papel | de que fonte | obrigatório | porquê |
|---|---|---|---|---|
| 1 | **o companheiro** | `companheiroInicial` (`companheiro-inicial.js`); sem ele, o primeiro convidado do grupo quando entrar | se houver | é o único sempre em cena — o que mais pesa na média das personagens |
| 2 | **o vilão** | `espinha.fio.antagonista` (`saga.js`, `FIO`; o `motivo` de `chefesDoMundo`) | sim | o Matt faz do vilão uma pessoa; o nosso é uma sombra que cresce, e a ficha dá-lhe o que mostrar em cada tamanho |
| 3 | **o elo** | elenco, fontes `doArco`/`recorrente`, cidade do ato 0, vivo, sem nome de marco da espinha | sim (com antecedente) | é o **antecedente com rosto**: a pessoa que o laço da abertura (`LACOS_DO_ANTECEDENTE`) prometeu. Guarda a reviravolta do ato 0 |
| 4 | **a voz** | a pessoa da **primeira batida `procurar`** do ato 0 (fonte `espinha`) | sim | é quem o jogador conhece primeiro por causa da história (o Zeca da 6.ª): a primeira subtrama curta, que ensina ao jogador que esta gente tem vida |
| 5 | **a balança** | o `{gente}` do relógio do fio no ato 0 ou 1 (`RELOGIO_DO_FIO.marcas`, "recebeu uma bolsa para calar…") | opcional | quem **está a ser comprado** pela sombra: a pessoa que pode cair para um lado ou para o outro conforme o herói chegue a tempo |
| 6 | **a porta** | elenco da cidade do ato 0 ou 1 com propósito `apaixonar`/`adotar`/`seguir`, ou traço `galanteador`/`compassivo` | opcional | o **romance possível** — que só abre se o jogador o abrir (C3). Existe para que haja a quem abrir |

**Mínimo 4, máximo 6.** Sem antecedente: o elo é "quem pôs o herói no caminho"
(linha `sem` em 1.5). Sem companheiro (sala de dois, save antigo): entram a
balança e a porta. **Um papel por pessoa** — se a voz e a balança caírem na
mesma, fica com o papel de ordem menor e o seguinte procura outra.

**Quando o companheiro e o elo têm a mesma ligação** (soldado com companheiro
`armas`: o mais provável, peso 6), **o elo é outra pessoa** — "o terceiro da
companhia" — e nasce **uma teia forçada** entre os dois (1.4, `t_morto_vivo`):
o companheiro julgava-o morto. A reviravolta deixa de ser só do herói e passa a
ser **a crise do companheiro também**. É o melhor caso do sistema, não o pior.

### 1.2 A ficha dramática — os seis campos

| campo | pergunta da mesa | de onde sai | o que o jogador vê |
|---|---|---|---|
| **quer** | o que esta pessoa quer **para si**, fora do herói | `QUER` (1.3.1); se a índole já tem um propósito que o diz, o propósito manda (`QUER_DO_PROPOSITO`) | ela pede, ela diz, ela age por isso |
| **teme** | o medo **de alma** (o do corpo já é `MEDOS`, `indole.js`) | `TEME` (1.3.2) | um **sinal** em cena, nunca a palavra "medo" |
| **esconde** | o segredo | `ESCONDE` (1.3.3) | **nada**, até as pistas; depois, a cena da crise |
| **carrega** | um objeto, uma dívida ou uma culpa | `CARREGA` (1.3.4) | o **objeto** à vista na primeira cena; a dívida e a culpa pela boca dela |
| **a linha** | o que não faz, nem por ordem nem por ouro | `LINHA` (1.3.5), com o **verbo** da índole que proíbe | o momento em que a crise a põe à prova |
| **como fala** | o tique de **voz** | `COMO_FALA` (1.3.6) | na primeira fala, e depois uma vez por cena |

**As quatro regras de combinação** (é o que impede o genérico):

1. **Nenhum campo repete categoria dentro do núcleo.** Seis pessoas, seis
   categorias de `quer` diferentes — senão todos "querem justiça".
2. **A índole filtra.** Cada entrada tem `briga` (traços com que não casa) —
   o mesmo mecanismo de `TRACOS.briga`. Um `calado` não ganha o tique
   "acaba as frases dos outros"; um `traidor` não ganha a linha "não vende um
   amigo"; um `cruel` não ganha "não levanta a mão a uma criança" (a não ser
   que seja **o vilão** — e aí é exactamente o que o torna lembrado).
3. **Cada pessoa aponta para outra do núcleo** — pelo menos um campo (o
   `esconde`, a `dívida`, a teia) nomeia outra pessoa do núcleo. É a teia do
   Matt: as histórias pessoais tocam-se, não correm em paralelo.
4. **Pelo menos um do núcleo carrega um pedaço do `{coisa}` do herói** (o
   `EM_JOGO.coisas` do antecedente, `batidas.js`) — o elo sempre; o
   companheiro às vezes. É assim que a história pessoal do herói tem mãos.

Semente: `${semente}|nucleo|${papel}|${campo}`. Mesma semente, mesmo núcleo,
em qualquer máquina.

### 1.3 As tabelas

Formato proposto: `{ id, cat, o, briga?, cabe?, ... }`. `cabe` diz que papéis a
podem ter (por omissão: todos menos o vilão). Os textos usam `{outro}` (outra
pessoa do núcleo, pela teia), `{sombra}` (enchida na hora, no tamanho do ato,
como em `batidas.js`), `{cidade}`, `{assinatura}` (`RELOGIO_DO_FIO.assinaturas`).

#### 1.3.1 `QUER` — 20 entradas, 5 categorias

| id | cat | o | briga |
|---|---|---|---|
| q_nome_limpo | reparar | limpar o nome que a cidade lhe sujou | — |
| q_devolver | reparar | devolver uma coisa que tirou a quem já não a pode receber | cruel |
| q_pazes_irmao | reparar | fazer as pazes com um irmão antes que um dos dois morra | rancoroso |
| q_reconstruir | reparar | reerguer o que ardeu — a oficina, a casa, o nome do pai | — |
| q_teto | ganhar | ter um teto seu, com uma porta que tranque por dentro | — |
| q_cadeira | ganhar | sentar-se na cadeira de quem o humilhou | humilde |
| q_mestria | ganhar | ser chamado mestre por quem lho negou | — |
| q_partir | ganhar | juntar o bastante para partir e nunca mais voltar | fiel |
| q_crianca | proteger | ver uma criança crescer longe disto | cruel |
| q_aldeia | proteger | que a aldeia onde nasceu passe o inverno | — |
| q_segredo_outro | proteger | guardar o segredo de {outro} até ao fim | tagarela |
| q_amor_vivo | proteger | manter vivo quem ama, custe o que custar | frio |
| q_divida_fim | libertar | pagar a última prestação de uma dívida que herdou | — |
| q_juramento | libertar | ver-se livre de um juramento que fez novo demais | — |
| q_comprar | libertar | comprar a liberdade de alguém | ganancioso |
| q_esquecer | libertar | esquecer uma noite — e não consegue | — |
| q_quem_matou | saber | saber quem matou alguém que amava | — |
| q_origem | saber | saber se o nome que usa é o seu | — |
| q_quem_partiu | saber | achar alguém que partiu sem dizer para onde | — |
| q_razao_guerra | saber | saber se a guerra em que lutou tinha razão | — |

**`QUER_DO_PROPOSITO`** — uma fonte só: quando a índole já diz o desejo, a
ficha lê-o. `recuperar_nome → q_nome_limpo` · `redimir → q_devolver` ·
`provar_ao_pai → q_mestria` · `esconder_filho → q_crianca` ·
`comprar_liberdade → q_comprar` · `encontrar_quem_partiu → q_quem_partiu` ·
`guardar_tumulo → q_quem_matou` · `nao_ser_esquecido → q_reconstruir`.
Os propósitos **sobre o herói** (`trair`, `apaixonar`, `seguir`, `proteger`…)
**não** são "quer": são o que a pessoa quer **do herói**, e convivem — é
exactamente a tensão que dá drama (quer comprar a irmã; para isso, vai
`vender_o_que_sabe` do herói).

#### 1.3.2 `TEME` — 18 entradas, 6 categorias

O medo do corpo (`MEDOS`: escuro, fogo, água funda) já existe e acorda por
regex. Este é o de dentro. Cada um traz o **sinal** — o que o Narrador mostra
em vez de dizer — e o **acorda**, a condição conferível que o backend liga a
sinais que já existem.

| id | cat | o | sinal (o que se mostra) | acorda |
|---|---|---|---|---|
| t_deixado | perder | ser deixado para trás outra vez | pergunta duas vezes por onde o grupo vai | o herói fala em partir, separar, ir só |
| t_ver_morrer | perder | ver morrer quem protege | põe-se entre o ferido e a porta | aliado a ≤ ¼ PV, ou a 0 |
| t_esquecer_rosto | perder | esquecer a cara de quem perdeu | pede que lhe descrevam pessoas que não conhece | um retrato, um rosto, um nome do passado |
| t_descoberto | ser visto | que se saiba o que fez | muda de assunto quando se fala de antes | Intuição bem-sucedida sobre ela |
| t_olhar_heroi | ser visto | que o herói o veja como ele se vê | conta as suas proezas antes que lhe perguntem | o herói elogia outro |
| t_cobarde | ser visto | ser chamado cobarde em voz alta | aceita desafios que devia recusar | ameaça, desafio, insulto em público |
| t_pai | tornar-se | tornar-se o pai | interrompe-se a meio de uma frase dura | ordem dada a gritar; castigo |
| t_voltar_matar | tornar-se | voltar a matar | demora a desembainhar, e depois não para | combate começa |
| t_gostar_poder | tornar-se | gostar de mandar | recusa a cadeira da cabeceira | oferta de comando, título, ouro grande |
| t_nada_feito | o que vem | morrer sem nada que se lembre | escreve o nome em sítios | perigo de morte; a palavra "lembrar" |
| t_guerra_volta | o que vem | que a guerra volte | conta soldados quando entra numa praça | gente armada em número |
| t_divida_filhos | o que vem | que a dívida passe aos filhos | conta moedas duas vezes | preço, cobrança, credor |
| t_velho_so | sozinho | envelhecer sozinho | fica para o fim da refeição | o herói vai dormir; despedida |
| t_ninguem_vem | sozinho | que ninguém venha quando chamar | responde a qualquer chamado, mesmo de estranhos | um grito; um pedido de ajuda |
| t_deuses_nao | fé | que os deuses não existam | reza mais alto quando corre mal | templo; morte; milagre que falha |
| t_deuses_viram | fé | que existam, e o tenham visto | não entra em templos | templo; sacerdote; juramento |
| t_saber_verdade | verdade | descobrir que tudo o que fez foi para nada | evita perguntas sobre o porquê | revelação, segredo achado |
| t_ser_usado | verdade | ser só uma peça no jogo de alguém | desconfia de favores | presente, favor, oferta sem razão |

#### 1.3.3 `ESCONDE` — 20 entradas, 4 gravidades

Cada segredo traz **duas formas de pista** (as categorias de
`FORMAS_DE_SEMENTE`, `promessas.js`: fala, comportamento, objeto, documento,
cenário, ausência), o que **muda quando se revela**, e se **pode ligar à
sombra** (`sombra: true` — os únicos que podem ser reviravolta).

| id | grav. | o | pista A | pista B | quando se revela | sombra |
|---|---|---|---|---|---|---|
| e_fugiu | vergonha | fugiu de uma luta e deixou morrer quem ficou | fala: "eu nunca corro" — sem ninguém perguntar (`negacao_nao_pedida`) | objeto: uma medalha com o nome de outro | pede ao herói uma luta que não deve fugir | não |
| e_nao_le | vergonha | não sabe ler, e finge há vinte anos | comportamento: pede que lhe leiam, "que a vista já não ajuda" | objeto: segura uma carta ao contrário | a carta que levava há anos diz outra coisa | não |
| e_titulo | vergonha | o título que usa foi comprado | fala: erra o nome do avô que diz ter tido | documento: o selo novo num pergaminho velho | perde a porta que o título abria — ou o herói a guarda | não |
| e_ama_proibido | vergonha | ama alguém da casa inimiga | ausência: some todo o fim de tarde | objeto: uma fita da cor da outra casa | arco `a_amor_proibido` | não |
| e_jogo | vergonha | perdeu ao jogo o dote da irmã | fala: sabe o preço de cada mesa de dados da cidade | cenário: um credor que o cumprimenta demais | arco `a_divida_volta` | não |
| e_matou | crime | matou um homem, e outro foi enforcado por isso | comportamento: não passa pela forca da praça | documento: o nome do enforcado no registo, sublinhado | a família do enforcado ainda vive em {cidade} | não |
| e_templo | crime | roubou do templo o cálice que agora o sustenta | comportamento: não reza onde há altar | objeto: prata de templo vendida ao peso | um sacerdote reconhece a prata | não |
| e_selos | crime | falsifica selos — e um deles abriu uma porta que não devia | fala: sabe de que cera é cada selo da cidade | objeto: um carimbo de cobre no fundo da bolsa | a porta que abriu era de {sombra} | **sim** |
| e_carga | crime | a carga que guarda não é o que diz | cenário: os cães não passam pelo armazém dele | objeto: um saco rasgado com pó que não é sal | quem compra a carga é gente de {sombra} | **sim** |
| e_desertor | crime | é desertor, e o regimento ainda o procura | fala: sabe toques de corneta de cor | objeto: o distintivo com o número raspado | o regimento chega a {cidade} | não |
| e_paga_sombra | lealdade | recebe dinheiro de {sombra} desde antes de conhecer o herói | fala: sabe o que o herói fez ontem, longe | objeto: moeda estrangeira, nova, no bolso (`moeda_estrangeira`) | o arco `a_revelacao` | **sim** |
| e_vendeu_nome | lealdade | deu o nome do herói a quem o procurava | fala: "soube que te saíste bem na estrada" (`elogio_que_vigia`) | documento: o nome do herói escrito na letra dele | arco `a_revelacao` | **sim** |
| e_irmao_lado | lealdade | tem um irmão a servir {sombra}, e manda-lhe notícias | ausência: falta a um encontro sem razão | objeto: uma carta por mandar, sem nome | arco `a_irmao_do_outro_lado` | **sim** |
| e_vigiar | lealdade | foi mandado vigiar o herói — e já não sabe por quem o faz | comportamento: está sempre onde o herói vai, um dia antes | documento: uma lista dos sítios do herói | arco `a_revelacao` (perdão possível) | **sim** |
| e_sabe_onde | lealdade | sabe onde {sombra} se esconde, e cala-o por medo | fala: corrige o herói sobre um caminho que nunca andou | cenário: evita um bairro inteiro | dá o caminho — a que preço | **sim** |
| e_nome_morto | identidade | o nome que usa é de um morto | fala: não responde à primeira quando o chamam | documento: a campa com o nome dele, numa aldeia | arco `a_nome_falso` | não |
| e_sangue | identidade | é do sangue de quem o herói procura | fala: diz uma alcunha de família que não devia saber | objeto: um objecto gémeo de um do herói | reviravolta do órfão | **sim** |
| e_dado_morto | identidade | foi dado como morto, e há quem o chore em {cidade} | ausência: não vai a {cidade}, mesmo quando é o caminho | cenário: uma cova recente sem nome (`cova_sem_nome`) | quem o chora ainda espera | não |
| e_outra_fe | identidade | serve um deus que aqui se queima | fala: reza com um nome trocado | objeto: um símbolo cosido por dentro da manga | o templo da cidade procura-o | não |
| e_marcado | identidade | foi dos de {sombra}, e traz a marca: {assinatura} | comportamento: nunca arregaça a manga | objeto: {assinatura} gravada por baixo de um cinto | arco `a_revelacao` | **sim** |

**Quem pode ter o quê:** o companheiro **nunca** recebe gravidade `lealdade`
com `sombra: true` — a não ser que `reviravoltas.js` tenha eleito **a máscara
do aliado** para esta campanha; aí o segredo dele é esse, e cai num ato **depois
do primeiro** (nunca duas revelações no mesmo ato). A voz e a porta recebem
vergonha ou identidade. O elo recebe o segredo do antecedente (1.5).

#### 1.3.4 `CARREGA` — três sub-tabelas; cada pessoa leva **uma** coisa de **uma**

**Objetos (16) — sempre visíveis; a prosa mostra-o na primeira cena.**

| id | o |
|---|---|
| c_carta | uma carta lacrada que nunca entregou |
| c_anel | um anel de noivado de alguém que morreu |
| c_chave | a chave de uma casa que já não existe |
| c_lamina_partida | a lâmina partida do pai, sem cabo |
| c_dente | um dente de leite numa bolsinha de couro |
| c_livro_riscado | um livro com o nome riscado na guarda |
| c_mapa_canto | um mapa a que falta um canto, rasgado à mão |
| c_moeda_furada | uma moeda furada, ao pescoço |
| c_lenco | o lenço de quem partiu, que já não cheira a nada |
| c_veneno | um frasco de veneno que nunca usou |
| c_sino | um sino de cabra da aldeia que ardeu |
| c_distintivo | o distintivo de um regimento que já não existe |
| c_retrato | um retrato a carvão de uma criança |
| c_corda_nos | uma corda com treze nós — um por cada dia que lhe resta para pagar |
| c_pedra | uma pedra da soleira da casa da mãe |
| c_tabua | uma tábua de oração com o nome de outra pessoa |

**Dívidas (10) — ditas por ela, quando o laço deixa.**

| id | o |
|---|---|
| d_vida | deve a vida a {outro}, e {outro} nunca lha cobrou |
| d_agiota | deve três anos de ganho a um agiota de {cidade} |
| d_guilda | deve um favor à guilda, e o favor ainda não tem nome |
| d_moribundo | prometeu a um moribundo levar uma coisa a alguém |
| d_casamento | deu a palavra de casar, e partiu antes |
| d_corpo | deve um corpo a uma família: não trouxe o morto para casa |
| d_voto | deve um ano de serviço a um templo |
| d_resposta | deve uma resposta a uma carta com dez anos |
| d_cancao | deve uma canção a um morto, e ainda não a acabou |
| d_heroi | deve ao herói, e detesta dever (só o companheiro `credor` ao contrário, ou a voz) |

**Culpas (10) — o que não diz, e o jogador vê no `teme`.**

| id | o |
|---|---|
| u_tarde | chegou tarde ao incêndio |
| u_irmao_lugar | mandou o irmão no seu lugar |
| u_calou | calou quando devia ter falado, e alguém pagou |
| u_ordem | deu a ordem que matou os que confiavam nele |
| u_riso | riu-se num funeral, e toda a aldeia viu |
| u_acusou | acusou a pessoa errada |
| u_mae | partiu sem se despedir da mãe, que morreu nessa semana |
| u_curou | curou o homem errado, e esse homem matou depois |
| u_deixou | deixou alguém para trás numa estrada de neve |
| u_vendeu | vendeu o que não era seu, e o dono ainda o procura |

#### 1.3.5 `LINHA` — 15 entradas, com o verbo que proíbe

O verbo é do vocabulário que a índole já tem (`nunca`/`puxa` de `TRACOS`:
ameaca, protege, aproxima, cala, cobra, entrega, esquiva, recua, observa,
oferece, testa). É o que torna a linha **conferível** em C3: a escolha que a
cruza tem custo no laço.

| id | o | verbo `nunca` | contexto | briga |
|---|---|---|---|---|
| l_crianca | não levanta a mão a uma criança, nem por ordem | ameaca | criança em cena | — (o vilão pode) |
| l_ferido | não deixa um ferido para trás | recua | aliado a 0 PV | medroso |
| l_palavra | não quebra a palavra dada, nem ao inimigo | entrega | promessa no `prometido` | traidor |
| l_templo | não derrama sangue em chão sagrado | ameaca | templo, capela | — |
| l_mentir | não mente ao herói — cala, mas não mente | (mentir) | Intuição | — |
| l_amigo | não vende um amigo, nem por ouro nem por medo | entrega | — | traidor, ganancioso |
| l_ajoelhar | não se ajoelha diante de quem tem coroa | recua | autoridade | humilde |
| l_veneno | não usa veneno: quem mata, olha nos olhos | — | veneno à mão | — |
| l_fogo | não põe fogo a casa com gente dentro | — | incêndio, tocha | cruel |
| l_cobrar_filhos | não cobra a dívida de um morto aos filhos | cobra | dívida, herança | ganancioso |
| l_voltar | não volta à cidade onde nasceu | — | o caminho passa lá | — |
| l_pobre | não tira a quem tem menos do que ele | — | furto, saque | ganancioso |
| l_rendido | não mata quem se rendeu | ameaca | inimigo rendido | cruel |
| l_mae | não jura pelo nome da mãe em vão | — | juramento | — |
| l_ordem_cega | não cumpre uma ordem que não entende — já cumpriu uma | — | ordem sem razão | — |

#### 1.3.6 `COMO_FALA` — 22 tiques **de voz**, e uma lista de proibidos

**O tique é de voz, não de corpo.** A 6.ª mediu o que acontece com gesto:
*"fica calado, à espera"* em 21 de 67 respostas, *"cruza os braços"* 5, *"sem
tirar os olhos"* 6, e o Vando reduzido a "grunhido" e "tamborila os dedos". O
gesto vira muleta porque serve a toda a gente; a frase não, porque é de
alguém. Cada tique traz um **exemplo** curto (≤ 50 caracteres) que vai **só nas
duas primeiras cenas** da pessoa — depois chega só o tique, para o exemplo não
se repetir à letra.

| id | o | exemplo | briga |
|---|---|---|---|
| f_dias | conta tudo em dias | "Três dias. É o que ela tem." | — |
| f_pergunta | responde com outra pergunta | "E tu, vieste porquê?" | — |
| f_oficio | chama cada um pelo ofício, nunca pelo nome | "Ó boticária, passa-me isso." | — |
| f_avo | cita a avó, e cita mal | "A minha avó dizia: quem cala, come." | calado |
| f_terceira | fala de si na terceira pessoa | "O Vando não gosta disto." | — |
| f_acaba | acaba as frases dos outros | "…e não voltou. Pois." | calado |
| f_jura_pequeno | jura por coisas pequenas | "Pela minha bota esquerda." | — |
| f_numeros | diz os números exactos | "Trinta e sete passos até à porta." | sonhador |
| f_comida | põe comida em toda a metáfora | "Esse plano ainda está cru." | — |
| f_nao_e | acaba tudo a pedir razão | "…não é? Diz que é." | — |
| f_desculpa | pede desculpa antes de discordar | "Perdoa. Mas não." | orgulhoso |
| f_mar | fala como marinheiro em terra firme | "Amarra isso, que vem vento." | — |
| f_proverbio | inventa provérbios | "Lobo que uiva não janta." | — |
| f_gramatica | corrige a gramática dos outros, até em perigo | "*Fugimos*, não *fugemos*. Corre." | — |
| f_sem_eu | nunca diz "eu" | "Cá se viu. Cá se cala." | tagarela |
| f_crianca | trata toda a gente por "criança", até velhos | "Senta-te, criança. Tens sessenta anos." | — |
| f_alcunha | dá alcunha a cada um na primeira frase | "Olá, Botas." | — |
| f_santos | reza a meio da frase a um santo de cada coisa | "…São Bento das portas, que não range…" | — |
| f_passado | fala de si no passado, como quem já morreu | "Eu era bom nisto." | brincalhao |
| f_ri | ri-se antes das más notícias | "Ha. Morreu." | compassivo |
| f_preco | pergunta o preço de tudo, até do silêncio | "Quanto custa isso que não disseste?" | generoso |
| f_curto | três palavras, nunca quatro | "Não. Amanhã. Sozinho." | tagarela |

**`TIQUES_PROIBIDOS`** (vão para o varredor e para o `naoPode` da pessoa,
nunca para a tabela): *fica calado à espera* · *sem tirar os olhos* · *cruza
os braços* · *tamborila os dedos* · *grunhe* · qualquer tique de **cheiro**.

### 1.4 A teia — `TEIA_DO_NUCLEO` (10)

Cada pessoa do núcleo ganha **pelo menos um fio para outra do núcleo** (não
para o herói — esse é o elo e o companheiro). O vilão ganha **pelo menos um**:
o antagonista do Matt é pessoal para alguém da mesa. A teia guarda-se como os
laços do elenco (`TIPOS_DE_LACO`) quando tem tipo; as que não têm são só ficha.

| id | o | laço | quem sabe |
|---|---|---|---|
| t_vida | {a} deve a vida a {b} | divida | os dois |
| t_noivos | {a} foi noivo(a) de {b}, e ninguém sabe porque acabou | amor (rompido) | os dois |
| t_denunciou | {a} denunciou {b} uma vez, e {b} não sabe | rivalidade | só {a} |
| t_ensinou | {a} ensinou {b} a lutar | aprendizado | os dois |
| t_sangue_calado | {a} e {b} são do mesmo sangue e não o dizem | familia | os dois |
| t_carta_fechada | {a} guarda uma carta de {b} que nunca abriu | — | só {a} |
| t_salvou_cobra | {a} salvou {b}, e cobra-o em silêncio | divida | os dois |
| t_matou_dele | {a} matou alguém de {b} | rivalidade | só {a} |
| t_fugiram | {a} e {b} fugiram juntos de um sítio, e contam histórias diferentes | amizade | os dois |
| t_morto_vivo | {a} julga {b} morto | amizade | só {b} — **forçada** quando o companheiro e o elo têm a mesma ligação |

### 1.5 O elo pessoal — como uma parte nasce do antecedente

O antecedente já dá três coisas: o laço da abertura (`LACOS_DO_ANTECEDENTE`), o
que está em jogo (`EM_JOGO.coisas`) e a verdade do fecho do ato 0
(`REVIRAVOLTA_DO_ATO0`). **Falta-lhes um rosto.** O elo é esse rosto: uma pessoa
do elenco que **carrega o pedaço físico** do passado do herói e **esconde a
verdade da reviravolta**. A frase da reviravolta não muda — passa a ter quem a
diga.

**`ELO_DO_ANTECEDENTE`** (13)

| antecedente | quem é o elo | carrega (visível) | quer | esconde (= a reviravolta) |
|---|---|---|---|---|
| orfao | alguém com o nome parecido com o da família | uma faca gémea da **faca herdada** do herói, a mesma marca no cabo | comprar a sua liberdade a {sombra} | é do sangue do herói, e serve {sombra} |
| soldado | o terceiro da companhia — outro camarada daquela guerra | o distintivo do mesmo regimento | pagar a dívida de jogo que o pôs nas mãos de {sombra} | recruta para {sombra}; deu o nome do herói |
| nobre_caido | o homem de negócios que comprou a dívida da casa | o livro de dívidas da família, com a letra do pai do herói | sentar-se na cadeira da família (q_cadeira) | cobra em nome de {sombra} |
| erudito | o copista que copiou o texto proibido | a página que falta, cosida no forro do casaco | esquecer o que leu (q_esquecer) | o texto foi escrito para {sombra}; ele sabe porque o copiou |
| ladrao | o mestre de recados da guilda | uma gazua gémea da **gazua de osso** do herói | pagar a última prestação à guilda | a guilda já vendeu o herói a {sombra}, e é ele quem leva os recados |
| acolito | a irmã de votos que ficou | o cordão da ordem com os nós dos votos | ver-se livre do juramento (q_juramento) | a ordem serve {sombra} e quer o herói de volta |
| pragado | o físico que passou pela aldeia na febre | um frasco de pó cinzento | que a aldeia passe o inverno (q_aldeia) — por remorso | a febre foi a primeira obra de {sombra}, e ele levou-a |
| artista | quem ensinou a canção ao herói | o caderno com a pauta, e o último verso | ser chamado mestre (q_mestria) | servia {sombra}; o último verso é um mapa |
| cacador | o antigo parceiro de caça | a ordem de caça com o nome do herói, dobrada no cinto | juntar para partir (q_partir) | o alvo antigo trabalha para {sombra}, e foi ele quem pôs a recompensa a correr |
| ferreiro | o aprendiz que ficou na forja quando a tomaram | o martelo do pai do herói | reerguer a forja (q_reconstruir) | a forja foi tomada por ordem de {sombra}, e ele forja para ele agora |
| ex_cultista | o irmão de culto que ajudou o herói a sair | a máscara do rito, partida ao meio | guardar o segredo do herói (q_segredo_outro) | os irmãos querem o herói de volta, e ele é o anzol |
| naufrago | o outro sobrevivente do naufrágio | a outra metade da bússola, empenada para o mesmo lado | saber se a culpa foi dele (q_razao_guerra, no mar) | o naufrágio foi obra de {sombra}; ele abriu o porão |
| sem | quem pôs o herói no caminho | a carta que trouxe o herói, em duplicado | ser livre de quem o mandou (q_juramento; teme `t_ser_usado`) | serve {sombra}, e trouxe o herói de propósito |

Três detalhes que fazem disto memória e não tabela:

- **O objecto do elo é gémeo de um objecto do herói** sempre que o antecedente
  dá item (`antecedentes.js`: a faca herdada, a gazua de osso, o distintivo, o
  caderno cifrado). O jogador vê na mão de outro **a coisa que traz na
  mochila** — é a pista B que se sente no corpo.
- **O `quer` do elo é simpático.** O jogador tem de **gostar dele antes** de
  saber. Por isso o pedido do elo vem cedo e é pequeno (2.3, `a_revelacao`):
  quem ajudou a pagar a dívida do terceiro da companhia sente a traição como
  sua.
- **O companheiro por ligação** (`COMPANHEIRO_POR_LIGACAO`) inclina a ficha do
  companheiro para o que a ligação já diz, sem a fixar:
  `armas` → esconde de vergonha da guerra (`e_fugiu`, `e_desertor`), carrega
  `c_distintivo` ou `u_ordem`; `sangue` → teme `t_pai`, esconde de identidade
  sobre a família; `estrada` → carrega `c_corda_nos` ou `d_vida`, quer
  `q_teto`; `oficio` → teme `t_olhar_heroi`, quer `q_mestria` ("que o aluno não
  o supere — e que o supere"); `credor` → carrega `d_heroi` ao contrário (é o
  herói que deve), quer `q_divida_fim` da própria dívida, que é maior.

### 1.6 O vilão — a mesma ficha, revelada em três tamanhos

A sombra já cresce em três tamanhos (`FIO.sombra`: início, meio, fim). A ficha
cresce com ela; o Narrador **só recebe o campo do tamanho do ato**:

| tamanho | o que chega | por onde |
|---|---|---|
| início ("alguém que {motivo}") | a `{assinatura}` e o **tique**, num bilhete ou na boca de um servo | o relógio do fio (`UM BILHETE DELE`) |
| meio ("{titulo}") | **a linha** — o jogador descobre o que ele não faz | uma cena: os servos dele recuam diante de uma criança, poupam um rendido |
| fim ("{nome}") | **a ferida** (o `esconde` dele) e o **quer** inteiro | o confronto — a PERGUNTA de `confronto` passa a ter conteúdo |

**`FERIDA_DO_VILAO`** (8) — o segredo do antagonista, nunca de lealdade (ele
**é** a sombra):

1. fez tudo isto por alguém que já morreu, e não sabe parar;
2. foi um herói, como este, e a cidade não lho agradeceu;
3. o exército dele é feito de gente que ele salvou;
4. está a morrer, e quer acabar antes;
5. foi traído pela cidade que agora quer tomar;
6. aprendeu com a mesma pessoa que ensinou o herói (só com companheiro `oficio` — teia `t_ensinou`);
7. quer que alguém o trave, e ninguém foi capaz;
8. tem uma filha que não sabe quem ele é (e a filha é **a porta**, se existir — teia `t_sangue_calado`).

A linha do vilão é **obrigatória** e vem da mesma `LINHA` (sem o filtro
`briga`): um vilão que não poupa crianças é um monstro; um que **poupa** é
lembrado. E dá ao jogador uma alavanca no confronto (2.3, `a_oferta`).

### 1.7 O que o módulo não faz

- **Não guarda a ficha.** Deriva-se da semente, da espinha, do elenco e do
  grupo — como o elenco (`elenco.js`, "não tem campo de save").
- **Guarda só o arco** (2.7): que batidas já aconteceram e que lado se
  escolheu. Campo **novo**, ignorado pela versão antiga — reversível, permitido
  pela ordem de 28/09.
- **Não escreve no registo** nem cria gente. Não muda números de combate.
- **Não decide romance** — a porta só existe; quem abre é o jogador (C3).

---

## 2. C2 · as subtramas

### 2.1 A forma: três batidas, e cada uma com um relógio

| batida | o que é | o que o jogador pode fazer | se o jogador não responde |
|---|---|---|---|
| **pedido** | a pessoa pede uma coisa concreta, pequena, ligada ao que **quer** ou **carrega** | aceitar · recusar · perguntar porquê (abre o `quer` e o tique, sem custo) · ignorar | o relógio corre: `ESPERA_DO_PEDIDO` (3 dias) e a crise chega na variante **pior** |
| **crise** | o que ela escondia, carregava ou temia chega à cena e cobra | agir, como em qualquer cena: falar, lutar, esconder, mentir — o sistema resolve pelos testes que já existem (Intuição para a mentira, combate para a luta) | a crise resolve-se sem o herói, e mal (a pessoa perde, parte ou cai) |
| **escolha** | dois lados, cada um com o seu preço, **visíveis antes** | escolher um lado. Uma acção livre que caiba no verbo de um lado conta como esse lado; um terceiro caminho só se a tabela o tiver | a escolha faz-se pela omissão — o lado `omissao` da tabela (sempre o mais caro para o laço) |

**É isto que a 6.ª pedia sem saber:** *"nove turnos de empaque não custaram
nada"*. Uma subtrama ignorada **custa** — e custa a uma pessoa com nome, não
ao "reino".

**`GATILHOS_DA_BATIDA`** — tudo conferível no estado que já existe:

| gatilho | lê | usado por |
|---|---|---|
| `emCena` | a pessoa está em `emCena` (ou anda no grupo e foi falada neste turno) | todas as batidas — **nenhuma batida acontece longe** |
| `atoMin` | o ato actual da espinha ≥ n | a âncora no ato (2.2) |
| `diasDesde` | dias desde a batida anterior ≥ n | crise do companheiro, crise da voz |
| `fechoDoAto` | o fecho do ato n cumprido (`conferirEspinha` grava o dia) | crise do companheiro; reviravolta |
| `relogio` | a etapa do relógio do ato caiu, `travada` ou `cumprida` (`relogioDoFio`) | a balança |
| `pistas` | as duas sementes da pessoa regadas (`promessas.js`: `regar` quando a linha da pista foi à pauta com ela em cena) | a crise do elo (a reviravolta) |
| `confrontada` | o jogador perguntou-lhe sobre a pista (Intérprete: o nome dela + o objecto da pista) | **reviravolta cedo** — a agência de quem repara |
| `aliadoCaido` | aliado a 0 PV num combate | crises de `t_ver_morrer`, `l_ferido` |

### 2.2 A âncora de cada papel nos atos

| papel | pedido | crise | escolha | tamanho |
|---|---|---|---|---|
| companheiro | ato 0, dia ≥ 2, depois da 1.ª batida da espinha | fecho do ato 1 — ou a reviravolta, se tem teia com o elo | ato 2, antes do fecho | longo, a campanha toda |
| elo | ato 0, na estreia dele | **a reviravolta**: fecho do ato 0, depois das 2 pistas — ou antes, se confrontado | ato 1, a primeira cena com ele depois | o ato 0 e o 1 |
| voz | na batida dela (`procurar`) | 2–4 dias depois, ou quando o relógio do ato 0 cai | ato 0 ou 1 | **curto** — a primeira subtrama que fecha, e ensina ao jogador que estas fecham |
| balança | quando o herói a encontra, com a etapa `travada` | no prazo da etapa | o herói chegou antes (escolhe ele) ou depois (escolheu ela) | um ato |
| porta | quando o herói lhe dá atenção duas vezes (C3 abre) | ato seguinte | C3 | aberto |
| vilão | **a oferta**, fase `marca` do relógio (ato do meio), por bilhete ou servo | **a linha posta à prova** | **o confronto** | a campanha toda |

**Nunca duas crises no mesmo dia; nunca duas escolhas no mesmo ato da mesma
pessoa; nunca duas revelações (`sombra: true`) no mesmo ato.** Se dois
gatilhos caem juntos, a ordem é a de `PAPEIS_DO_NUCLEO` e o outro espera um dia.

### 2.3 Os arcos-modelo — `ARCOS` (11)

Cada pessoa recebe o arco cujo `chave` casa com a ficha dela (o `esconde`, o
`carrega` ou o `quer`). Os lados usam **só efeitos que já existem**: `relacao`
(aliado, rival, inimigo, romance — `RELACOES_NPC`), `laco` (firmar, romper —
`npcs.js`), `convite`, `missao` (`tramas.js`), `furto`, `sai` (deixa a cidade —
`elenco.saidos`), `item` (dá ao herói o que carrega), `bolsa` (◉ debitado, com
o preço de tabela), `dias` (o relógio do fio corre). Os tons são os da C4.

**a_carta** — chave: `c_carta`, `d_moribundo`
- **pedido** (emoção): *"Leva esta carta a {destino} em {cidade}. Eu não posso entrar lá."*
- **crise** (suspense): o destinatário morreu — ou é gente de {sombra}; a carta é o que {sombra} procura. *Pior, se ignorado:* a carta foi roubada à pessoa.
- **escolha** (provação): **entregar** (a palavra cumpre-se; quem a recebe sabe o que o herói sabe — `missao`) · **abrir e queimar** (o que ela dizia fica com o herói; a pessoa perde a única coisa que a ligava ao morto — `laco` −1, `item` nenhum). Omissão: abrir sem queimar.

**a_divida_volta** — chave: `d_agiota`, `d_guilda`, `e_jogo`, `c_corda_nos`
- **pedido** (alívio): *"Faltam-me {preco} moedas. Treze dias."* — o objecto conta os dias à vista.
- **crise** (suspense): o credor leva alguém como penhor. *Pior:* leva-a a ela.
- **escolha** (batalha · provação): **pagar** (◉ {preco} debitado da bolsa, com o veredito antes — `laco` +1, firma `divida` para com o herói) · **ir buscá-lo à força** (combate com os homens do credor; ganha-se a pessoa e um inimigo na cidade — `relacao` inimigo com o credor). Omissão: o penhor fica.

**a_nome_falso** — chave: `e_nome_morto`, `e_dado_morto`, `e_titulo`
- **pedido** (suspense): *"Nesta cidade não digas o meu nome. Nenhum dos dois."*
- **crise** (emoção): alguém o reconhece e chama-o pelo nome verdadeiro, em público.
- **escolha** (provação): **cobri-lo** (o herói mente por ele — teste de Enganação; se falhar, os dois ficam mal-vistos na cidade) · **deixá-lo responder** (a verdade; ele fica — mais pequeno e mais leve — ou parte: `sai`). Omissão: ele responde sozinho, e não perdoa ao herói o silêncio.

**a_irmao_do_outro_lado** — chave: `e_irmao_lado`
- **pedido** (suspense): *"Se vires um homem com {assinatura} no braço, não o mates. Deixa-mo."*
- **crise** (batalha): o irmão está entre os servos de {sombra} — **na luta**. O sistema marca-o no combate (não morre ao primeiro golpe que o derrubaria; fica rendido).
- **escolha** (emoção): **poupá-lo** (foge e leva notícias à sombra; o laço com o herói vai ao máximo) · **não o poupar** (a luta fica mais fácil; o laço rompe-se e não volta). Omissão: o companheiro decide por si — e poupa-o, e o herói não o soube.

**a_culpa_tarde** — chave: `u_tarde`, `u_deixou`, `u_mae`, `u_irmao_lugar`
- **pedido** (emoção): *"É meio dia de desvio. Há uma campa que não visito há seis anos."*
- **crise** (provação): lá, quem ele deixou para trás está vivo, e não perdoa.
- **escolha** (alívio · provação): **ficar para reparar** (perdem-se `dias` — o relógio do fio corre e a etapa pode cair `cumprida`) · **seguir** (a culpa fica; a pessoa passa a carregar mais uma). Omissão: seguir.

**a_juramento** — chave: `d_voto`, `q_juramento`, `l_palavra`
- **pedido** (provação): *"Prometi rezar onde ele caiu. É no caminho."*
- **crise** (suspense): cumprir o voto obriga a **cruzar a linha de {outro}** do núcleo (a teia escolhe quem).
- **escolha** (emoção): **o voto** (o laço com {outro} baixa) · **{outro}** (o voto quebra-se; a pessoa muda de tique — passa a falar menos). Omissão: o voto, sem o herói.

**a_amor_proibido** — chave: `e_ama_proibido`
- **pedido** (romance): *"Leva isto à casa {casa}. Não perguntes a quem."*
- **crise** (suspense): são descobertos; a casa exige reparação (as casas do elenco já têm reputação — `REPUTACAO_DA_CASA`).
- **escolha** (provação): **ajudá-los a fugir** (a casa fica `inimigo`; os dois `sai` juntos — e voltam, um ato depois, com notícias) · **separá-los** (a casa fica `aliado`; o laço com a pessoa baixa e o tique dela muda para `f_curto`). Omissão: separados à força, sem o herói.

**a_guerra** — chave: `e_fugiu`, `e_desertor`, `u_ordem`, `t_guerra_volta`
- **pedido** (suspense): *"Se alguém do regimento perguntar, nunca me viste."*
- **crise** (provação): um velho camarada aparece e acusa-o em voz alta.
- **escolha** (emoção · batalha): **defender a versão dele** (o camarada desafia o herói — duelo) · **deixá-lo confessar** (a verdade: o camarada vai-se; a pessoa fica, mais leve, e o `teme` dela desliga). Omissão: confessa sem o herói ao lado.

**a_crianca** — chave: `q_crianca`, `c_dente`, `c_retrato`
- **pedido** (emoção): *"Há uma criança em {lugar}. Ninguém pode saber dela."*
- **crise** (suspense): alguém a procura — servos de {sombra}, ou a família verdadeira.
- **escolha** (provação): **levá-la com o grupo** (`convite` — um fardo e um laço; as lutas passam a ter quem proteger) · **entregá-la a quem a procura** (paz, e a pessoa nunca mais fala disso). Omissão: levam-na.

**a_oferta** — o arco do vilão, chave: `vilao`
- **pedido** (suspense): o bilhete com {assinatura}, ou um servo à mesa: *"Deixa {cidade} e nenhum dos teus sofre."* — e nomeia **alguém do núcleo**.
- **crise** (provação): o herói descobre **a linha** dele — e que pode usá-la (há uma criança, um rendido, um templo entre os dois).
- **escolha** (batalha · emoção, no confronto): **usar a linha** (ganha-se sem metade do sangue, e com vergonha: a crónica guarda-o assim) · **de frente** (a luta inteira). A PERGUNTA de `confronto` (`batidas.js`) passa a ter conteúdo: *quando ele disser o que quer, o herói ainda o quer morto?* — porque agora o jogador conhece a ferida.

**a_revelacao** — o arco do elo, e da reviravolta. Chave: `elo` (ou qualquer `esconde` com `sombra: true` num ato depois do primeiro)
- **pedido** (alívio · emoção): pequeno e simpático, do `quer` do elo — *"Ajuda-me a pagar ao homem do porto. Depois disso, estou livre."* O jogador **investe antes de saber**.
- **crise** (suspense): **a reviravolta.** A frase de `REVIRAVOLTA_DO_ATO0` dita **por ele** (ou achada no que ele carrega, se morreu antes — a variante `corpo` de `SEGREDO_DIZ`). Só depois das duas pistas; ou antes, se o jogador o confrontar com uma (2.5).
- **escolha** (emoção · provação): **perdoar** (ele fica do lado do herói por dentro — o propósito `sabotar_de_dentro`, que já existe: passa notícias falsas à sombra; e pode ser apanhado, um ato depois) · **entregá-lo / expulsá-lo** (volta para {sombra} e leva o que sabe: a etapa seguinte do relógio fica mais curta). Omissão: ele foge, e leva o que sabe.

### 2.4 O que o jogador sente nas escolhas — o veredito antes do clique

Os dois lados são **irreversíveis**, logo vêem-se **antes**. Duas coisas:

1. **Na prosa:** a linha da escolha (3.3, exemplo 3) obriga o Narrador a pôr
   **os dois lados na boca da pessoa**, e proíbe-o de fechar.
2. **No ecrã:** os lados entram como opções do turno, na forma **`A escolha`**
   que já existe (`mente/formas.md`, secção *"`A escolha` Forma=Pílula serve de
   alvo"*), cada uma com o preço dito **em mundo** — *"Vando vai só — e tu
   segues sem ele até à Serra"*, *"◉ 37 — e o agiota esquece-a"*. Nunca
   "Escolha da subtrama", nunca "lado A". **Peça nenhuma nova**: se o desenho
   achar que falta, é pedido ao `desenho` — e a ordem de 28/09 diz que o
   desenho espera a palavra da pessoa, por isso **a C2 funciona inteira só
   com a prosa e com a forma que já existe**.

### 2.5 A reviravolta do ato 0, e as duas pistas

**Quem:** o elo. **O quê:** a sua linha de `REVIRAVOLTA_DO_ATO0`, inalterada —
só ganha boca. **Quando:** a crise do elo; nunca antes de as duas pistas terem
ido à cena **com ele presente**, salvo se o jogador o confrontar.

**`PISTAS_DO_ELO`** — 13 × 2. A pista A é de **fala ou comportamento** (o
jogador ouve); a pista B é de **objecto** (o jogador vê), e usa a
`{assinatura}` do vilão sempre que pode — a mesma marca que o relógio do fio
deixa nas portas e nos poços. O jogador que viu "cera preta sem selo" numa
porta e a revê no canto de uma carta **liga sozinho**. É o momento que se
lembra.

| antecedente | pista A (ouve-se) | pista B (vê-se) |
|---|---|---|
| orfao | usa sem querer a alcunha de infância que só a família do herói dizia | a faca dele tem a mesma marca no cabo que a faca herdada do herói |
| soldado | trata o herói pelo posto antigo, que ninguém desta terra conhece | por baixo do esmalte do distintivo, {assinatura} riscada |
| nobre_caido | sabe o nome do criado da casa da família, morto há dez anos | um recibo com o selo da família do herói e {assinatura} ao lado |
| erudito | cita de cor uma linha do texto proibido — e corrige-se | {assinatura} no canto das cartas que ele guarda |
| ladrao | faz o sinal de mão da guilda que só os de dentro conhecem | uma moeda da guilda marcada com {assinatura} |
| acolito | reza a hora da ordem, baixinho, no minuto certo | o cordão dos votos tem um nó a mais, de outra cor |
| pragado | fala da febre como quem a viu começar: "começou pelo poço, não foi?" | um frasco de pó cinzento com {assinatura} na rolha |
| artista | trauteia a canção do herói com um verso que o herói nunca ouviu | o caderno da pauta, com {assinatura} no lugar da assinatura |
| cacador | sabe quanto vale a cabeça do herói, ao cobre | a ordem de caça no cinto, com {assinatura} no lacre |
| ferreiro | chama ao martelo do pai o nome que o pai lhe dava | as lâminas novas que leva têm a marca da forja da família |
| ex_cultista | despede-se com a saudação dos irmãos — e corrige-se | a máscara partida, com {assinatura} pintada por dentro |
| naufrago | sabe o nome do navio, que o herói nunca disse | a outra metade da bússola, empenada para o mesmo lado |
| sem | sabe de onde o herói vem, sem que ninguém lho tenha dito | a carta que trouxe o herói, a mesma letra, em duplicado |

**A catraca, pelo Livro de Promessas** (`promessas.js`, ligado e não
duplicado): as duas pistas **semeiam-se** na estreia do elo (`dona: "coracao"`,
`ato: 0`, `peso: "pesado"`); cada uma **rega-se** quando a sua linha foi à pauta
com o elo em cena; a revelação **colhe**. A mesma regra de
`reviravoltas.js`: **o Narrador planta sem saber de que são sementes** — a
linha da pista nunca diz o segredo.

**A agência de quem repara:** se o jogador **pergunta ao elo pela pista**
(*"de onde vem a cera preta?"*) — o Intérprete casa o nome dele e o objecto da
pista —, há teste de Intuição:
- **com uma pista regada:** ele mente, e a Intuição **diz que mente** (é a
  LEITURA que já existe, e que na 6.ª *"calou que ele mente"*: aqui ela tem o
  verbo). O segredo não sai — sai a dúvida;
- **com as duas:** a revelação **acontece já**, antes do fecho. O jogador que
  repara chega antes. Quem não repara recebe-a no fecho, como hoje.

**E o fecho do ato 0** deixa de depender só do marco: se o elo está em cena e
as pistas foram, a reviravolta joga-se com ele. A 6.ª acabou com *"a do ato 1
não se jogou"* — com cara, ela tem mais de uma porta.

**Se o elo morrer antes:** a revelação vem do que ele carregava (`SEGREDO_DIZ`,
variante `corpo`/`carta`): o objecto gémeo e a {assinatura} no forro. A perda
**torna-se** a revelação — o que é ainda mais Mercer.

### 2.6 Os tons de cada batida (para a C4)

| batida | tons possíveis | nunca |
|---|---|---|
| pedido | emoção · alívio · suspense · romance | batalha (um pedido com espada é ameaça, não pedido) |
| crise | suspense · provação · batalha · emoção | alívio |
| escolha | emoção · provação · batalha · romance | alívio (o alívio é o **depois** da escolha, e a C4 pode pô-lo na batida seguinte de outra pessoa) |

Os arcos em 2.3 já trazem o tom de cada batida. A C4 garante a alternância
entre pessoas (duas crises de suspense seguidas trocam de ordem); a C2 só
declara.

### 2.7 O campo de save novo

```
coracao: { v: 1, arcos: { [nome]: { pedido: dia|null, resposta: "aceitou"|"recusou"|"", crise: dia|null, escolha: "<id do lado>"|"", pistas: [dia, dia] } } }
```

Ignorado pela versão antiga (não lê o que não conhece); sem ele, ninguém tem
arco começado — e o núcleo continua derivável. **Reversível num commit**: é
exactamente o caso que a ordem de 28/09 deixa ao motor.

---

## 3. O que chega ao Narrador, e quando

### 3.1 As regras

1. **Só quem está em cena.** Ninguém do núcleo entra na pauta se não estiver
   em `emCena` — nem o vilão (esse tem o relógio do fio, que já existe).
2. **Uma linha de batida por turno, no máximo**, e só no turno em que a batida
   acontece (+ o seguinte, se o Narrador a calou — a contagem de cumprimento,
   em 5, diz se é preciso).
3. **A ficha não vai em todo turno.** O companheiro está sempre em cena; a sua
   ficha em todo turno seria **um bloco estático disfarçado de pauta**. A linha
   `QUEM É` vai: na **primeira fala** da pessoa em cada cena, e no máximo uma
   vez a cada 6 turnos por pessoa.
4. **Frase fechada.** Sujeito, verbo, objecto, e a ordem de que **é fato**. Nada
   de "pode", "se quiser", "considere". O que vai, entra.
5. **O segredo nunca vai antes da hora.** Nem o `esconde`, nem o id do arco,
   nem as palavras *subtrama*, *arco*, *pedido*, *crise*, *escolha*, *pista*,
   *núcleo*. O Narrador recebe verbos (PEDE, MOSTRE) e factos.

### 3.2 As duas secções novas, e onde cortam

| secção | rótulo | prio | tamanho máx. | porquê aí |
|---|---|---|---|---|
| `coracao` | QUEM CARREGA | **2,46** | 220 caracteres | depois de todo veto (`naoPode` 2…2,4), da planta (2,45); **à frente** do que volta (2,47) e da batida da espinha (2,475): quando uma pessoa do núcleo está a pedir, a escolher ou a ser revelada, **é ela o coração da cena** |
| `quemE` | QUEM É | **4,5** | 130 caracteres | depois de quem está (4) e de PERGUNTOU (4); à frente do contra e da forma (5) — é cor, não é verdade da cena |

Em `SECOES_QUE_CEDEM.luta` entra `quemE`. **`coracao` não cede na luta** quando
o tom da batida é batalha (o irmão do outro lado está **na** luta); nos outros
tons, cede.

**O orçamento por turno:** no máximo **220 + 130 = 350** caracteres (25 % do
`TETO_DA_PAUTA` de 1400), e na prática **uma** das duas (a batida e a ficha da
mesma pessoa no mesmo turno é redundante: a batida já traz o tique). O teto
não sobe; o que cede é o de prio mais baixa — a economia da praça (2,5), a
cidade, o daqui. **Nenhum bloco estático.** Catraca: nas 500 cenas semeadas
de `teste-masmorra-na-pauta`, a linha `coracao` **não tira veto nenhum nem
desfecho** em nenhuma.

### 3.3 Três exemplos reais da linha (medidos com `node`)

**1 · o pedido** — Dário, a voz da 1.ª batida, ato 0 (**204 caracteres**):

> QUEM CARREGA — Dário (é fato: entra nesta resposta, dito por ele): traz ao pescoço a tábua da irmã, num cordão de couro, e PEDE ao herói: "Se a carroça partir comigo, leva isto à Lia." Conta tudo em dias.

**2 · a pista B** — Elmo, o elo da erudita, ato 0 (**162 caracteres**):

> QUEM CARREGA — Elmo: no canto da carta que ele guarda há cera preta sem selo. Mostre-a nesta resposta, sem a explicar; se o herói perguntar, Elmo muda de assunto.

**3 · a escolha** — Vando, o companheiro (**203 caracteres**):

> QUEM CARREGA — Vando (a escolha é do herói: não a feche): o irmão dele vai na carroça do recrutador. Vando diz-lhe as duas saídas: ir com ele buscá-lo esta noite, ou deixá-lo ir só e seguir para a Serra.

**E a ficha, sem batida** — Nira, na primeira fala dela na cena (**120
caracteres**):

> QUEM É — Nira: quer achar o pai vivo; teme ficar outra vez sozinha no escuro; fala em perguntas curtas e nunca diz "eu".

Os modelos da linha (`LINHA_DO_CORACAO`, uma por batida + pista + ficha) são
tabela, com os buracos `{nome}`, `{carrega}`, `{fala}`, `{tique}`, `{ladoA}`,
`{ladoB}`; o módulo corta pelo fim da frase, nunca a meio, se passar do máximo.

---

## 4. O que o jogador sente — três momentos, no papel

*Com a gente da 6.ª sessão, para o antes ser verdade medida e o depois ser
comparável.*

### Momento 1 — o companheiro que era um gracejo

**Antes (6.ª, M2–M15):** *"Vando tamborila os dedos. — Primeiro matamos a fome
ou o tal Zeca?"* O Vando é uma piada que se repete; em 67 respostas não quis
nada. Nota 3 perdeu um ponto aqui.

**Depois:** na primeira cena, a prosa mostra **uma corda com treze nós ao
cinto** (o `carrega` visível). O jogador pergunta. *"Treze dias, Botas.
Depois conto-te."* (`f_alcunha`). No dia 3 há onze nós. No dia 4, a carroça
do recrutador — e **o irmão dele vai lá dentro**. A carroça que na 6.ª *"não
partiu"* sem custo agora **é pessoal**: se partir, vai o irmão do Vando. Na
escolha, as duas saídas na boca dele e no ecrã, com o preço. **O que se sente:**
o prazo que a 6.ª não pôs na tela está **ao cinto de alguém** e diminui à
vista. É a nota 4 (*sem prazo na tela*) a subir pela gente, não por um relógio.

### Momento 2 — a reviravolta que não se jogou

**Antes (6.ª, M33):** *"Então você é a boticária de trama que roubou do
arquivo."* — Elmo sabe, é bom, e nunca mais é nada. **A reviravolta do ato 1
não se jogou.**

**Depois:** M20, Elmo cita, de cor, uma linha do texto proibido — e corrige-se
(pista A). M28, há **cera preta sem selo** no canto da carta dele (pista B) — e
a jogadora viu cera preta no M16, na porta. Ela pergunta: *"de onde vem esta
cera?"*. Intuição: **ele mente, e ela sabe que ele mente**. No M31, confronta-o
outra vez — e ele diz: *"O texto que roubaste foi escrito para ele. Eu copiei-o.
A página que falta está no meu casaco."* Mas no M22 ela tinha-o ajudado a pagar
ao homem do porto. **O que se sente:** traição com nome, porque houve afecto
antes; e a sensação de ter **descoberto**, não de ter sido avisado. A escolha
(perdoá-lo para que minta à sombra por ela, ou entregá-lo) é a melhor cena da
sessão — e foi ela que a abriu, três turnos antes do fecho.

### Momento 3 — a moça que sumiu no calabouço

**Antes (6.ª, M46–M58):** um lagarto com a voz do pai de Nira; Nira some; *"o
Mestre largou-a no calabouço"*. O fecho tinha três razões para voltar e uma
estava morta.

**Depois:** Nira tem ficha desde a primeira fala (`QUEM É`, exemplo acima):
quer achar o pai, teme o escuro sozinha, nunca diz "eu". O pedido foi feito na
batida dela: *"Desce comigo. Uma vez."* A voz do pai no calabouço **é a crise
dela** — não um bicho solto. Se some, o relógio do arco continua: dois dias
depois, a pauta traz *"QUEM CARREGA — Nira: deixou na soleira do herói o lenço
do pai, molhado de água de poço"* (uma ausência que fala). A escolha é **descer
outra vez por ela, ou seguir o fio** — e os dois lados custam. **O que se
sente:** ninguém é largado; quem sai de cena continua a puxar. O calabouço
deixa de ser *"uma planta com nome de rato"* (6.ª, nota 2) e passa a ser **o
sítio onde Nira perdeu o pai**.

**Contado:** nos três momentos o jogador faz o mesmo número de acções que
fazia (perguntar, andar, escolher) — **nenhum clique a mais**; a diferença é
que cada acção encontra alguém que quer uma coisa. A leitura por turno sobe no
máximo uma linha de pauta (≤ 220 caracteres, para o Narrador; zero para o
jogador).

---

## 5. Como se mede, na 7.ª sessão

### As notas que devem subir (contra a 6.ª, média 3,2)

| # | nota | 6.ª | alvo | porque deve subir |
|---|---|---|---|---|
| 3 | as personagens | 4 | **5** | o "perde 1" foi o Vando de um só gracejo e o carroceiro/Nira em duplicado: o núcleo tem ficha e tique |
| 4 | o que está em jogo | 3 | **4** | o prazo passa a ter rosto (a corda, a carroça com o irmão); ignorar um pedido custa |
| 5 | a reviravolta | 3 | **4** | ela tem boca, duas pistas, e uma porta antes do fecho |
| 7 | a agência | 3 | **4** | escolhas com dois lados à vista, e a reviravolta que o jogador pode puxar |
| 9 | o fecho de sessão | 3 | **4** | as razões para voltar são **pessoas com arco a meio**, e nenhuma largada |

A 1 (gancho), a 2 (mundo), a 6 (ritmo) e a 8 (prosa) **não devem descer** —
se a 8 descer, é o tique a virar muleta, e corta-se.

### O que contar (com o registo, como na 6.ª)

1. **Cumprimento da frase fechada:** linhas `QUEM CARREGA` enviadas × honradas
   **na mesma resposta**. Alvo **≥ 85 %** (a 6.ª mediu o `vem` calado 3 vezes
   em 3 — M12–M14).
2. **Presença do núcleo:** cada pessoa do núcleo aparece ≥ 3 vezes; e de cada
   uma o jogador fica a saber ≥ 3 dos 6 campos **sem que lhos digam em
   etiqueta** (contados na prosa: ela pediu, mostrou, temeu).
3. **O tique:** presente em ≥ 60 % das falas da pessoa; o exemplo repetido à
   letra ≤ 2 vezes na sessão.
4. **As muletas não sobem:** *fica calado à espera* + *sem tirar os olhos* +
   *cruza os braços* ≤ 32 em 67 (a soma da 6.ª), alvo ≤ 15.
5. **A reviravolta:** jogou-se (sim/não); as 2 pistas foram à cena antes
   (2/2); e **o turno em que eu desconfiei** fica entre a pista B e a
   revelação — nem antes (óbvio demais), nem depois (não plantou).
6. **As escolhas:** ≥ 2 escolhas de subtrama, com os dois lados no ecrã antes;
   e a consequência volta à prosa ≥ 2 vezes nos turnos seguintes.
7. **O relógio pessoal:** ignorar um pedido de propósito (como na 6.ª se
   empacou de propósito) e ver a crise chegar **pior** — 1 caso testado.
8. **O fecho:** razões para jogar a próxima ≥ 3, das quais ≥ 2 são pessoas do
   núcleo com arco a meio; pessoas largadas: **0**.
9. **O custo:** a pauta nunca passa de 1400; nenhum veto cortado pela linha
   `coracao` (contado no registo); zero chamadas a mais por turno.

---

## 6. A proposta ambiciosa — **a fogueira**

*Para "Para a pessoa decidir".*

**O que é:** no descanso longo (`acampamento.js` já existe), antes de dormir,
o jogo abre **a fogueira**: as pessoas do núcleo que andam com o herói (ou que
estão na cidade, se é estalagem) estão lá, e o jogador **escolhe com quem se
senta**. Com quem se sentar, o sistema avança **a batida mais madura dessa
pessoa** — o pedido que ela ainda não fez, a culpa que só se diz de noite —,
ou, sem batida madura, ela conta **um campo da ficha na voz dela** (*"Sabes
porque é que a corda tem treze nós?"*). Uma cena, um turno, uma pessoa por
noite.

**Porquê:** as melhores cenas do Critical Role não são lutas — são **as
conversas à volta do fogo**, onde uma personagem diz uma coisa que não diria à
luz do dia. O nosso jogo tem o descanso como **um botão que passa o tempo**; a
fogueira faz dele **o sítio onde a campanha ganha coração**, e dá ao jogador uma
escolha que é só afecto: *quem quero conhecer melhor esta noite?* É também a
porta natural para o romance (C3) **aberto pelo jogador, nunca forçado** —
quem se senta três noites ao lado da mesma pessoa está a dizer alguma coisa.

**O peso:** o motor (que batida madura, que campo contar) cabe na MM-C e é
reversível — a mesa decide. **A tela** (o momento de escolher com quem se
senta) é **desenho**, e a ordem de 28/09 diz que *"o desenho espera a palavra
dela"*. Por isso é dela: a fogueira muda o que o descanso **é** para quem joga
(o jogador teria de aprender que dormir agora tem uma escolha antes).
Enquanto ela não decidir, a C2 funciona sem a fogueira — as batidas chegam em
cena, como ficou acima.

*(A segunda, mais pequena e também do desenho: **o retrato que se preenche** —
no Códex, cada pessoa do núcleo mostra só o que o jogador já descobriu, na voz
dela, e depois da pista A aparece uma linha em branco com um selo: "há uma coisa
que ela não diz". Suspense sem nomear o mecanismo. Fica anotada para quando a
pessoa reabrir o desenho.)*

---

## 7. Pesos, catracas e o que devolvo ao `backend`

**Peso:** C1 e C2 são **motor da Fase MM-C**, aprovada pela pessoa em 11/10
(*"Perfeito, faça como disse"*); o `pesado` do motor dentro da MM não espera
(ordem de 28/09). O que um commit revertido **não** desfaz não está aqui: o
campo `coracao` é novo e ignorado pela versão antiga; nenhum campo de save
existente muda. **A voz do Narrador em massa** (tiques, falas dos pedidos) é
`pesado` pela tabela da casa — mas dentro da MM é da mesa, e vai toda por
tabela, desfeita num commit.

**As catracas que esta especificação pede** (suíte dedicada, `teste-coracao.mjs`):

1. Determinismo: mesma semente → mesmo núcleo, mesmas fichas, mesmos arcos.
2. Núcleo com 4–6 pessoas em 200 sementes; **ninguém fora do elenco/grupo/fio**.
3. Nenhuma categoria repetida por campo dentro do núcleo; toda a pessoa com ≥ 1
   fio da teia; o vilão com ≥ 1.
4. `briga` respeitada (nenhum `calado` com `f_acaba`, nenhum `traidor` com
   `l_amigo` — fora o vilão).
5. Elo existe para cada um dos 13 antecedentes; o objecto gémeo existe quando o
   antecedente dá item.
6. **O segredo nunca está na pauta antes da crise** (varredura das linhas de
   200 sementes × 60 turnos simulados).
7. Linha `coracao` ≤ 220, `quemE` ≤ 130; nas 500 cenas semeadas, **nenhum veto
   nem desfecho** cortado por elas.
8. `COMO_FALA` não contém nenhum dos `TIQUES_PROIBIDOS`.
9. Nunca duas revelações no mesmo ato; a máscara do aliado e o elo nunca no
   ato 0 juntos.
10. Todos os exports com ≥ 2 leitores (`teste-ligacao`).

**Perguntas que devolvo, em vez de decidir:**

- **O elo é escolhido do elenco ou promovido?** Proponho do elenco (`doArco`
  ou `recorrente` da cidade do ato 0), com o papel do registo a dizer o que ele
  é ao herói — mas se o elenco de uma semente não tiver ninguém livre, a regra
  de `PROMOCAO` (`elenco.js`) é a porta certa, não gente nova.
- **Como se confirma que uma pista "foi à cena"?** Proponho: regar quando a
  linha foi à pauta **e** cabeu (não foi cortada) **e** o elo estava em cena.
  Contar o cumprimento real (o Narrador mostrou?) pede o Cronista, e é a medida
  5.1 da 7.ª, não a catraca.
- **A balança e o relógio:** o `{gente}` do relógio é um nome do elenco hoje?
  Se é só descritor ("o carroceiro"), a balança fica para quando o Cronista
  fundir descritor e pessoa (o conserto 2 da 6.ª, C0).
