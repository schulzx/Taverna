# O estudo das mesas — quando um grande mestre pede o dado (M1)

**18/11/2026 · etapa M1 de `o-mestre-vivo.md` (§7, §9).** Casos recortados de sessões reais, com a cena,
rotulados um a um. Aqui só há contagens, padrões descritos por nós e situações escritas por nós no
nosso mundo. **Nenhuma frase das transcrições entra neste arquivo**; os casos com o texto ficam na
bancada, fora do repositório (`C:\Users\clara\Taverna-bancada\casos.json`).

O estudo de 10/11 (`mente/estudo-do-mestre.md`) contou palavras-chave. Este responde a outra pergunta:
**dada a cena, o mestre rola?** — e conta os «não» com o mesmo cuidado que os «sim».

---

## 1 · As mesas

| mesa | sistema | material | casos rotulados | válidos | episódios |
|---|---|---|---:|---:|---:|
| **Critical Role**, campanhas 1 e 2 (CRD3) | D&D 5e | 159 episódios, já na bancada | 407 | 360 | 153 |
| **The Adventure Zone: Balance** (TAZ) | D&D 5e | 9 episódios, transcrições públicas em PDF (Maximum Fun) | 106 (todos os candidatos) | 67 | 9 |
| mesa em português | — | **não achada** (§7) | — | — | — |

## 2 · O método, e onde ele mente

1. **O recortador** (`Taverna-bancada/recortador.mjs`) passa por cada episódio, marca a luta como
   janela (do pedido de iniciativa até 60 falas sem vocabulário de luta) e, **fora da luta**, guarda dois
   tipos de candidato, cada um com 5 falas antes e 7 depois:
   - **«sim»** — fala do mestre que pede teste de perícia, de atributo ou de ferramenta (salvaguardas e
     iniciativa ficam de fora). Marca se houve ação declarada nas três falas de jogador anteriores.
   - **«não»** — fala de jogador com verbo de ação ou pergunta de jogo, a que o mestre responde nas três
     falas seguintes, sem nenhum dado nas seis seguintes.
   No CRD3 saíram 3.732 «sim» e 3.381 «não»; na TAZ, 26 e 80.
2. **A amostra** (`amostrar.mjs`) é estratificada por tipo × categoria automática, com alocação pela raiz
   do tamanho do estrato (para que estratos raros, como «furtar», tenham casos) e espalhada pelos
   episódios (no máximo 2–3 por episódio e estrato). Cada caso leva o seu **peso amostral** (candidatos
   do estrato ÷ sorteados), e as taxas da §3 são **reponderadas** por ele. Semente fixa: a amostra é
   reprodutível.
3. **A rotulagem foi feita por mim, à mão, lendo cada janela**, numa passada só, em lotes de 50, numa
   visão compacta (2 falas antes e 4 depois para os «sim», 1 antes e 3 depois para os «não», cortadas
   em 100–220 caracteres). Para cada caso: válido ou não, a nossa categoria, as marcas da cena
   (oposição, segredo, pressa, testemunha, perigo físico), o teste, a origem (espontâneo / após ação
   declarada / o jogador pediu), o que o sucesso deu, o que a falha custou e, nos «não», a razão.
4. **Onde mente — e quanto confio:**
   - *Rolou ou não rolou:* **alta** confiança (~95%). Vem do recortador e foi conferido; 14 «não» (12 no CRD3, 2 na TAZ) eram
     na verdade dados que o jogador lançou por conta própria e foram corrigidos para «sim».
   - *Categoria:* **boa** (~85%). Fala em personagem que tenta convencer foi posta em «convencer», não
     em «outro» — diferente do estudo de 10/11.
   - *Marcas da cena:* **média** (~70%), e com **viés circular**: quem lê um pedido de Intuição tende a
     ver «segredo» na cena. A janela curta esconde parte do contexto. As taxas «com/sem oposição»
     exageram a diferença, mas a direção é robusta (o efeito é grande demais para ser só isto).
   - *Resultado:* **fraca**. Na janela curta o desfecho aparece em só 104 de 199 sucessos e 47 de 199
     falhas; as distribuições de resultado são de uma amostra pequena e não aleatória.
   - **47 casos do CRD3 (12%) e 39 da TAZ (37%) eram inválidos** — luta que escapou da janela,
     conversa fora do jogo, anúncio, piada. A TAZ, comédia, tem muito mais disto.
5. **A assimetria do recortador, e por isso há dois números.** Um «sim» social entra mesmo quando o
   jogador fala em personagem (o mestre pede Persuasão a seguir); um «não» só entra se a fala tiver verbo
   de ação. Então a taxa de conversa sai **inflada**. Por isso cada célula traz dois números:
   - **todas** — todas as ações declaradas, reponderadas (teto);
   - **simétrica** — só os casos cuja declaração o mesmo detector acharia nos dois lados (piso).
   A verdade está entre os dois. Para as categorias físicas e de busca os dois quase coincidem; para a
   conversa, não.
6. **Unidade.** Um caso é *uma ação declarada fora da luta*. Não é o nosso turno (que junta duas ou três
   falas), e as taxas não somam ao «26,5%» de 10/11, que tinha no denominador todo verbo de ação,
   inclusive conversa de mesa.

---

## 3 · A tabela que a régua precisa

**Critical Role, ações declaradas fora da luta.** `n` = casos válidos (rolou), taxas reponderadas.

| cena | n (rolou) | **rola — todas** | **rola — simétrica** |
|---|---:|---:|---:|
| **conversa** (convencer/intimidar/enganar/ler pessoa) **com oposição ou segredo** | 52 (44) | **87%** | 66% |
| **conversa sem oposição nem segredo** | 12 (4) | 45% | **23%** |
| **pergunta** a uma pessoa ou ao mestre, **sem segredo** | 38 (0) | **0%** | 0% |
| pergunta, **com segredo** (a pessoa esconde algo) | 3 (0) | 0% | 0% |
| **busca com algo escondido** | 28 (26) | **98%** | 95% |
| **busca sem nada escondido** | 24 (6) | 37% | **23%** |
| **lembrar / saber** | 27 (15) | 69% | 58% |
| examinar magia (arcano) | 11 (6) | 73% | 66% |
| **travessia / força com perigo ou pressa** | 10 (7) | **84%** | 76% |
| **travessia / força sem perigo nem pressa** | 8 (3) | 51% | 45% |
| **esgueirar com alguém que possa notar** | 7 (7) | **100%** | 100% |
| esgueirar sem ninguém à vista | 9 (4) | 64% | 64% |
| rastrear | 8 (4) | 60% | 60% |
| furtar (bolso, fechadura, truque de mão) | 6 (5) | 95% | 94% |
| atuar (cantar, dançar, distrair) | 7 (3) | 80% | 73% |
| socorrer | 8 (3) | 63% | 54% |
| animal (falar, acalmar, chamar) | 6 (0) | 0% | 0% |
| encenação, logística, gesto («outro») | 35 (1) | 1% | 0% |
| qualquer ação **com testemunha** | 20 (13) | 77% | 64% |
| **todas as ações declaradas** | **299 (138)** | **48%** | **34%** |

**Ler pessoa** sozinho: 14 de 15 rolam (97% / 95%) — e 14 dos 14 foram **pedidos pelo jogador**
(«posso ver se está mentindo?»). O mestre quase nunca oferece Intuição; quando o jogador pede, dá.

**As razões de NÃO rolar** (161 «não» válidos, reponderados):

| razão | parte | n |
|---|---:|---:|
| **informação livre** — o mestre só responde o que o herói vê, ouve ou sabe | **37%** | 40 |
| **sem obstáculo** — a ação simplesmente acontece (subir num muro baixo, revistar um corpo sem pressa) | 19% | 35 |
| **pessoa disposta** — a conversa é com quem quer ajudar; o mestre responde em personagem | 18% | 22 |
| **magia ou regra própria** — feitiço, talento de classe, poção: a regra dela decide, não um teste | 17% | 35 |
| **encenação** — fala ou gesto sem resultado em jogo | 7% | 20 |
| o mestre aprova e o dado vem logo a seguir (fora da janela) | 2% | 5 |
| já resolvido — a vantagem foi ganha antes (o prisioneiro já está apavorado; o herói já tirou alto) | 1% | 4 |

**As marcas da cena nos «sim» e nos «não»:** oposição 36% vs 6%; segredo 36% vs 4%; perigo físico 23%
vs 8%; testemunha 10% vs 4%; pressa 6% vs 3%. **79% dos «não» não têm marca nenhuma na cena; só 21% dos
«sim» não têm** (e estes são quase todos saberes e testes oferecidos pelo mestre).

**Os pedidos (199 no CRD3):**

- **origem:** após ação declarada 50% · **espontâneo 31%** · o jogador pediu 19%. (O estudo de 10/11
  mediu 37% espontâneos por outra régua; batem na ordem de grandeza.)
- **espontâneos, por assunto:** procurar 18, esgueirar 11 (quase sempre «todos rolem furtividade» ao
  entrar em território alheio), lembrar 10 (o mestre oferece um teste de saber quando um assunto
  aparece), forçar 9, equilibrar 3, outros 10.
- **teste:** Percepção 15% · Investigação 10% · Furtividade 10% · Persuasão 9% · Intuição 7% ·
  Arcanismo, Atletismo 5% cada · saberes (Natureza, Religião, História, Inteligência) 12% somados.
- **o que o sucesso deu** (104 vistos): informação 60% · posição ou vantagem 20% · acesso ou
  consentimento 11% · **nada 10%** (quase sempre «não há nada aqui», o que também é informação).
- **o que a falha custou** (47 vistos): informação parcial ou errada 36% · posição 23% · **nada 17%** ·
  tempo 13% · alarme ou reação hostil 6% · dano 4%. O «nada» aqui é mais alto que os 7% de 10/11
  porque a amostra vista é pequena e enviesada para o desfecho curto; trate-o como teto.

---

## 4 · A outra mesa (TAZ: Balance), e o que muda

| medida | Critical Role | TAZ | leitura |
|---|---:|---:|---|
| ações declaradas que rolam (todas · simétrica) | 48% · 34% | **30% · 12%** | a TAZ rola bem menos fora da luta |
| pedidos espontâneos | **31%** | **5%** (1 em 21) | o mestre da TAZ quase não oferece dado; responde ao que o jogador faz |
| o jogador pediu o dado | 19% | **29%** | na TAZ o dado nasce mais do jogador («posso rolar?») |
| pergunta respondida sem dado | 41 de 41 | **24 de 24** | **igual: pergunta nunca rola** |
| travessia com perigo ou pressa | 84% | **82%** | **igual: perigo físico rola nas duas** |
| busca com algo escondido · sem | 98% · 37% | 75% · 25% | mesma direção, amostra pequena |
| conversa com oposição | 87% | 50% | a TAZ resolve muita conversa em encenação (é comédia) |
| teste de saber | 27 casos | **nenhum** | o mestre da TAZ conta o que o herói sabe sem rolar |
| razões de não rolar | informação livre 37% · sem obstáculo 19% · pessoa disposta 18% · magia 17% | informação livre 30% · **pessoa disposta 28%** · sem obstáculo 17% · magia 4% | |
| falha vista | parcial · posição · nada | **dano 3 · nada 3** · alarme 1 | amostra mínima |

**O que as duas mesas concordam** (e por isso pesa mais para a régua): perguntar nunca rola; o perigo
físico e a pressa fazem rolar; buscar o que está escondido rola e buscar à toa quase não; feitiço e
talento resolvem pela própria regra; encenação não rola.

**Onde discordam** (e é estilo, não regra): quanto o mestre oferece o dado por conta própria, e quanto a
conversa vira dado. O nosso Mestre fica mais perto da Critical Role — é a mesa que a pessoa citou e é a
que gera o «um dado a cada dois ou três turnos» da ordem de 04/11.

**A cautela de sempre:** as duas jogam D&D 5e. Aprende-se *quando* e *por que* rolar; perícia e número
traduzem-se para as nossas tabelas.

---

## 5 · O que surpreendeu

1. **A pergunta nunca rola — nem com segredo.** 65 perguntas nas duas mesas, zero dados. Quando a
   pessoa esconde algo, o mestre **responde em personagem e mente ou desconversa**; o dado só aparece
   se o jogador muda de ação: *ler a pessoa* (Intuição) ou *pressionar* (Intimidação/Persuasão).
   Para a régua do §3 de `o-mestre-vivo.md` isto pede um ajuste: o segredo não faz a *pergunta* rolar,
   faz a pergunta ganhar uma resposta falsa ou evasiva — e abre a porta para o jogador pedir o dado
   certo.
2. **Ler pessoa é dado do jogador.** 14 de 14 Intuições foram pedidas pelo jogador. O mestre não
   oferece; concede. Ao nosso Mestre basta reconhecer o pedido e honrá-lo.
3. **Uma em cada seis ações que não rolam é magia ou talento.** O feitiço tem regra própria e o mestre não
   pede teste em cima dele. Nós já temos isso no «o mundo resolve»; fica confirmado como razão de
   primeira linha.
4. **O teste de saber é oferecido, não pedido.** 10 dos 25 saberes que rolaram foram oferecidos pelo
   mestre quando um assunto apareceu («quem estudou religião, role»). Na outra metade, quando o herói
   tem o assunto no passado dele, a resposta vem de graça. A diferença entre os 78% de 10/11 (pergunta
   de saber respondida sem dado) e os 58–69% de rolagem daqui é o denominador: lá contavam todas as
   perguntas «eu sei…?», aqui só as declarações de lembrar, mais os testes oferecidos.
5. **Esgueirar em território alheio rola sempre, e em grupo.** Os 11 espontâneos de Furtividade são
   quase todos «todos rolem» ao entrar num lugar vigiado — o dado vem do lugar, não da frase.

---

## 6 · O que isto diz para a régua (M3)

| regra que a mesa real sustenta | força |
|---|---|
| **Pergunta não rola.** Responde-se; se há segredo, a resposta é evasiva ou falsa | 65 de 65 |
| **Busca rola se há algo escondido ou perigo; senão, o mestre descreve** | 95–98% vs 23–37% |
| **Conversa rola quando quem ouve tem motivo para negar**; com quem está disposto, não | 66–87% vs 23–45% |
| **Ler pessoa rola quando o jogador pede** (e quase só aí) | 14 de 14 pedidos |
| **Travessia rola com perigo ou pressa**; sem, metade das vezes (o mestre manda rolar «para ver como sai») | 76–84% vs 45–51% |
| **Esgueirar rola se alguém pode notar**, e o lugar vigiado chama o dado sozinho | 100% |
| **Magia, talento e item resolvem pela própria regra** | 17% dos «não» |
| **Encenação e logística não rolam** | 1 em 35 |
| **O dado espontâneo existe e é um terço**: Percepção quando algo se aproxima, Furtividade ao entrar, saber quando um assunto aparece | 31% dos pedidos |
| **A falha raramente é «nada»**: meia-informação, posição, tempo | «nada» ≤ 17% das falhas vistas |

---

## 7 · O que não se conseguiu

- **Mesa em português: não achada.** Procurei transcrições de *actual play* brasileiro (buscas por
  «transcrição sessão RPG actual play D&D português» e pela transcrição de *Ordem Paranormal*). Só
  apareceram metadados de episódios, trabalhos acadêmicos que talvez tenham trechos em anexo (não
  confirmado) e mesas pagas sem texto. Não há transcrição pública utilizável. Parei aí, como combinado.
  O caminho que resta seria transcrever áudio de mesas brasileiras (legendas automáticas do YouTube ou
  um transcritor), e isso pede baixar ferramenta e mídia — decisão da pessoa.
- **Dimension 20** não tem transcrição pública que eu conheça; não gastei busca nela.
- A TAZ deu menos casos que o alvo (106 candidatos em 9 episódios, 67 válidos): a mesa rola pouco fora
  da luta e conversa muito fora do jogo. Serve para comparar a direção, não para tabela por célula.
- Os desfechos (sucesso/falha) ficaram fracos pela janela curta; para M2 vale reabrir só os «sim» com
  janela de 12 falas depois.

---

## 8 · Sessenta situações e o veredito do mestre real

Escritas por nós, no nosso mundo, a partir dos padrões dos casos. **Rola**, **não rola** ou **depende**
(e de quê). A coluna «base» diz de onde vem a força do veredito: a tabela da §3 (número), casos
repetidos na amostra (padrão) ou um caso só (fraco). É a matéria-prima do exame da M2 — que deve
escrever as frases do jogador para cada uma, sem copiar estas descrições.

### Busca e percepção

| # | situação | veredito | base |
|---|---|---|---|
| 1 | O herói revista o quarto do mercador que fugiu, onde há uma carta escondida no forro do baú | **rola** (Investigação); o sucesso acha a carta, a falha acha só o baú vazio | número |
| 2 | O herói revista o mesmo quarto, mas não há nada escondido | **não rola**: o mestre descreve o que há | número |
| 3 | O herói procura armadilhas numa porta de cripta | **rola** (Investigação ou Percepção) | padrão |
| 4 | O herói revista o corpo de um bandido caído depois da luta, sem pressa | **não rola**: lista-se o que ele carrega | padrão |
| 5 | O herói revista o corpo enquanto um guarda se aproxima pelo corredor | **depende**: com pressa, o mestre corta a busca pela cena (não rola, mas o tempo cobra) | fraco |
| 6 | O grupo entra numa clareira onde lobos espreitam na mata | **rola, espontâneo** (Percepção de todos) | padrão |
| 7 | O herói pergunta se vê alguma marca nas pedras do altar, e há uma runa apagada | **rola** (Percepção); a falha não vê a runa | padrão |
| 8 | O herói escuta atrás da porta de uma taverna fechada | **depende**: se o som é claro, o mestre conta (não rola); se é abafado e importa, rola | padrão |
| 9 | O herói olha em volta de uma praça movimentada procurando um rosto conhecido | **rola** (Percepção); a falha não acha | padrão |
| 10 | O herói cheira a poção que o boticário lhe vendeu para ver se é falsa | **rola** (Percepção ou Medicina) | fraco |
| 11 | O herói procura na cidade uma loja que venda corda e lanternas | **depende**: loja comum não rola; se é coisa rara ou há pressa, rola (Investigação) e a falha custa tempo | padrão |
| 12 | O herói examina um baú que suspeita estar armadilhado, e não está | **rola** se ele declara procurar armadilha; o sucesso dá a certeza «está limpo» | padrão |

### Conversa

| # | situação | veredito | base |
|---|---|---|---|
| 13 | O herói pergunta ao taverneiro onde fica a ferraria | **não rola**: o taverneiro responde | número |
| 14 | O herói pergunta ao ferreiro há quanto tempo ele trabalha ali | **não rola** | número |
| 15 | O herói pergunta à viúva o que ela viu na noite do crime, e ela esconde que reconheceu o assassino | **não rola a pergunta**: ela responde evasiva; o dado só vem se o herói ler a pessoa ou pressionar | número |
| 16 | O herói quer saber se a viúva está mentindo | **rola** (Intuição); a falha dá uma impressão vaga | número |
| 17 | O herói pede ao capitão da guarda para deixar o grupo entrar na cela do preso | **rola** (Persuasão): o capitão tem motivo para negar | número |
| 18 | O herói pede um copo d'água à estalajadeira | **não rola** | número |
| 19 | O herói pede desconto ao vendedor de cavalos | **rola** (Persuasão); a falha é o preço cheio, sem perda além disso | padrão |
| 20 | O herói ameaça um ladrãozinho que já foi derrubado e está apavorado | **não rola**: o medo já fez o trabalho; ele fala | padrão |
| 21 | O herói ameaça um contrabandista na casa dele, cercado de capangas | **rola** (Intimidação); a falha deixa o contrabandista hostil | padrão |
| 22 | O herói mente ao guarda do portão, dizendo que vem a serviço do barão | **rola** (Enganação) | número |
| 23 | O herói conta ao amigo do grupo uma meia-verdade | **não rola**: entre heróis, o mestre deixa a encenação correr | padrão |
| 24 | O herói discursa à multidão aflita para que ela aceite fugir da vila | **rola** (Persuasão), com plateia | padrão |
| 25 | O herói se apresenta, todo galante, a uma estranha na festa | **depende**: se só quer conversar, não rola; se quer um favor dela, rola | padrão |
| 26 | O herói oferece bebida a um anão bêbado para fazer amizade | **rola** (Persuasão, com vantagem pela bebida): o resultado é incerto mesmo sem oposição | fraco |
| 27 | O herói pergunta ao preso, já convencido a colaborar, onde fica o covil | **não rola**: já resolvido antes | padrão |
| 28 | O herói tenta descobrir se o nobre que os contrata tem outro motivo | **rola** se o herói pede para ler a pessoa; se não pede, o mestre só descreve o que se vê | número |
| 29 | O herói usa um feitiço de amizade num mercador | **não rola teste**: o feitiço tem a própria regra | padrão |
| 30 | O herói canta na taverna para conseguir comida e cama | **rola** (Atuação) | padrão |
| 31 | O herói dança para distrair a capitã enquanto o grupo cochicha | **rola** (Atuação), com testemunha | fraco |
| 32 | O herói negocia com o chefe da milícia, em várias falas, a liberdade de dois companheiros | **rola, e mais de uma vez**: o mestre trata como uma disputa de várias rodadas | fraco |

### Saber

| # | situação | veredito | base |
|---|---|---|---|
| 33 | O herói, que cresceu no porto, pergunta se conhece a guilda dos estivadores | **não rola**: está no passado dele | padrão |
| 34 | O herói pergunta se reconhece o símbolo de um culto antigo | **rola** (Religião ou História) | número |
| 35 | Aparece uma planta estranha no caminho e ninguém perguntou nada | **rola, espontâneo**: o mestre oferece Natureza a quem tem o estudo | padrão |
| 36 | O herói pergunta se sabe que hora é, debaixo de neve fechada | **rola** (Sobrevivência); a falha é um palpite errado | fraco |
| 37 | Depois de um bom teste sobre dragões, o herói pergunta se eles temem raio | **não rola**: o teste anterior já cobre | padrão |
| 38 | O herói pergunta se lembra de um detalhe da própria sessão anterior | **não rola**: o mestre ou a mesa responde | padrão |
| 39 | O herói pergunta se sabe quem fabrica esse tipo de proteção mágica | **não rola** se é saber comum; rola se é obscuro | padrão |

### Magia e objetos

| # | situação | veredito | base |
|---|---|---|---|
| 40 | O herói examina o amuleto achado no covil para ver se é mágico | **rola** (Arcanismo); a falha diz só «parece mágico» | número |
| 41 | O herói lança Detectar Magia no corredor | **não rola**: o feitiço responde | padrão |
| 42 | O herói folheia um grimório escrito em sinais estranhos | **rola** (Arcanismo); a falha dá informação parcial | padrão |
| 43 | O herói dá ao ferido uma poção desconhecida e quer saber o efeito | **rola** (Arcanismo ou Medicina) | fraco |

### Corpo e travessia

| # | situação | veredito | base |
|---|---|---|---|
| 44 | O herói sobe um muro de três metros sem ninguém por perto e sem pressa | **depende**: costuma não rolar; rola se o muro é liso ou molhado | número |
| 45 | O herói desce um muro alto com guardas vindo | **rola** (Atletismo) | padrão |
| 46 | O herói salta de uma carroça em movimento | **rola** (Acrobacia); a falha custa dano | padrão |
| 47 | O herói atravessa uma ponte de corda sobre o abismo | **rola** (Acrobacia ou Atletismo) | padrão |
| 48 | O herói nada até um barco a vinte metros, em água calma | **não rola** | padrão |
| 49 | O herói força um portão trancado enquanto o grupo corre atrás de um fugitivo | **rola** (Atletismo); a falha custa tempo | padrão |
| 50 | O herói enfia a espada na fresta para abrir uma tampa emperrada | **rola** (Força) | padrão |
| 51 | O herói puxa um companheiro que escorrega pela borda | **rola** (Atletismo), com perigo | padrão |
| 52 | O herói queda de braço com um marinheiro na taverna | **rola, disputado**, várias vezes | padrão |

### Furtividade, mãos e rastros

| # | situação | veredito | base |
|---|---|---|---|
| 53 | O grupo se aproxima do acampamento de orcs à noite | **rola, espontâneo, em grupo** (Furtividade) | número |
| 54 | O herói sai de fininho da conversa enquanto os outros falam | **rola** (Furtividade) | padrão |
| 55 | O herói anda em silêncio por um corredor vazio | **depende**: sem ninguém para notar, o mestre costuma narrar | número |
| 56 | O herói tira a bolsa de um bêbado adormecido | **rola** (Prestidigitação) | número |
| 57 | O herói guarda uma ferramenta da oficina no próprio alforje, à vista do dono | **rola** (Prestidigitação); a falha é ser visto | padrão |
| 58 | O herói segue pegadas frescas na lama | **rola** (Sobrevivência) | número |
| 59 | O herói pergunta se há rastros no pomar, e há gente trabalhando à vista | **não rola**: o mestre mostra as pessoas | fraco |
| 60 | O herói acalma o próprio cavalo assustado | **rola** (Lidar com animais), com vantagem pelo convívio | fraco |
| 61 | O herói fala com um animal usando magia | **não rola**: o feitiço resolve | padrão |
| 62 | O herói enfaixa o braço de um companheiro depois da luta | **depende**: com magia ou sem pressa, não rola; um moribundo, rola (Medicina) | padrão |

### Gesto e logística

| # | situação | veredito | base |
|---|---|---|---|
| 63 | O herói veste a roupa nova atrás de um biombo | **não rola** | número |
| 64 | O herói compra suprimentos com o dinheiro que tem | **não rola** | número |
| 65 | O herói pergunta quanto falta para chegar à cidade | **não rola** | número |

---

## 9 · Os arquivos

| onde | o quê |
|---|---|
| `C:\Users\clara\Taverna-bancada\casos.json` | os 513 casos rotulados, com a janela de falas (**contém texto: nunca no repositório**) |
| `C:\Users\clara\Taverna-bancada\tabelas.json` | todas as contagens deste relatório |
| `C:\Users\clara\Taverna-bancada\recortador.mjs` · `amostrar.mjs` · `analisar.mjs` · `taz-para-json.mjs` | o método, refazível (semente fixa) |
| `C:\Users\clara\Taverna-bancada\rotulos\` | os rótulos à mão, um arquivo por lote |
| `C:\Users\clara\Taverna-bancada\crd3\` · `taz\` | os dados brutos |
