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
conversa vira dado. O nosso Mestre fica mais perto da Critical Role — é a mesa que a pessoa citou. (Aqui
se lia que ela «gera o um dado a cada dois ou três turnos da ordem de 04/11»; a pessoa desfez essa
contagem em 19/11: o Mestre pede quando o momento pede, e a frequência é consequência, não meta.)

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

---

## 10 · A mesa em português

**18/11/2026 · complemento da M1.** A §7 dizia «não achada». Agora ela existe: **13 sessões jogadas de um
podcast brasileiro** (conjunto público de transcrições automáticas, licença MIT; o conteúdo é de quem
o produziu). São três cenários: **o de fantasia** (6 sessões), **o futurista** (3) e **o de horror**
(4), cerca de 38 horas e 35 mil trechos de ~2,7 s. Três mestres diferentes, todos com sistemas de d20 e
perícias, e termos de perícia em inglês misturados ao português. Como no resto deste arquivo, **não entra
aqui nenhuma frase das transcrições, nenhum nome de participante, de personagem ou de cenário**: os
exemplos da §10.4 e as situações da §10.5 foram escritos por nós, no nosso mundo.

### 10.1 · O método, e onde ele mente mais do que nas outras duas

O mesmo método da §2, com três adaptações:

1. **O recortador** (`Taverna-bancada/nerdcast/recortador-pt.mjs`) não tem locutor. Cada candidato é um
   trecho; a luta é marcada por densidade de vocabulário de luta (≥4 termos em ±15 trechos) ou pelos 60
   trechos depois de «iniciativa». Fora da luta:
   - **«sim»** — trecho com pedido ou menção de teste («rola», «teste de», «joga o dado», «d20»…). Os que
     falam de salvaguarda ou sanidade (50) ficaram fora da amostra, como na §2.
   - **«não»** — trecho com moldura de ação («eu vou», «vou tentar», «quero», «posso», «deixa eu», «dá
     pra», «eu + verbo de ação no presente») sem nenhum vocabulário de dado nos 3 trechos antes e nos 22
     depois (~1 minuto).
   Saíram 337 «sim» e 636 «não».
2. **A amostra** tem 9 «sim» e 9 «não» por sessão (menos onde não havia), em rodízio pelas categorias
   automáticas, com semente fixa e peso amostral por sessão e tipo: 229 casos. Rotulei todos à mão, lendo a
   janela (6 trechos antes e 9 depois para os «sim», 3 e 10 para os «não»), e decidi quem falava pelo
   conteúdo.
3. **Os mesmos campos e as mesmas marcas** da §2, mais duas razões de «não» que esta mesa pediu:
   **«o mestre narra»**, quando ele resolve pela cena uma ação disputada, sem dado, e **«o mundo
   decide»**, quando a ação é impossível ou a consequência já está posta (porta selada, carro sabotado,
   armadilha que dispara). Para ações e pedidos rotulei também a **moldura** da declaração (§10.4).

**Onde mente, e quanto confio:**

| campo | confiança | por quê |
|---|---|---|
| válido ou não | **média** (~80%) | **69 de 229 inválidos (30%)**. «Rolar» em português também quer dizer *acontecer* e *rodar* («está rolando uma festa»): 25 dos 112 «sim» eram isso, ou teste dentro da ficção. Mais 14 de luta que escapou da janela. A mesa futurista é a pior: 25 de 54 inválidos. |
| rolou ou não rolou | **alta** (~92%) | 3 dos 93 «não» válidos tinham dado (número dito sem a palavra «dado», «testes» no plural). Já foram corrigidos. |
| categoria | **boa** (~80%) | Sem locutor, o que é ação do jogador e o que é descrição do mestre se decide pelo conteúdo. |
| marcas da cena | **fraca a média** (~60%) | A janela de ~40 s é curta, a transcrição tem buracos e o viés circular da §2 continua lá. |
| origem (espontâneo / após ação / pedido) | **média** (~70%) | Sem locutor, «posso rolar?» e «pode rolar» se distinguem pelo sentido, não pela voz. |
| moldura | **boa** (~80%) para as formas, **fraca** para quem fala | As contagens do corpus inteiro (§10.4) incluem o mestre e os NPCs. |
| resultado | **muito fraca** | Sucesso visto em 35 casos, falha em 7. |

**A edição enviesa, e em direções que não se anulam.** As sessões vão ao ar editadas, sem boa parte da
conversa de mesa. A edição corta o que é lento (logística, compras, o «rolem todos percepção» de rotina) e
guarda o que é engraçado ou dramático. Por isso: (a) a taxa de «não» de encenação sai **inflada** (piada
fica, logística sai, e as duas caem em «outro»); (b) dados de rotina somem, e a taxa geral sai
**subestimada**; (c) o desfecho da falha vira corte de cena. Some-se que é um programa de humor com
convidados: muita conversa em personagem é piada que o mestre deixa correr. **Use os números desta mesa
para a direção, não para a calibragem.** A calibragem continua sendo a da §3.

### 10.2 · A tabela comparada

`n` = casos válidos desta mesa (quantos rolaram); taxas reponderadas. «Simétrica» aqui = só os casos em
que houve declaração de ação com moldura (o mesmo filtro do lado «não»).

| cena | n (rolou) | **PT · todas** | PT · simétrica | Critical Role (todas · sim.) | TAZ |
|---|---:|---:|---:|---:|---:|
| **todas as ações declaradas** | 155 (57) | **25%** | **15%** | 48% · 34% | 30% · 12% |
| · cenário de fantasia | 75 (27) | 24% | 15% | | |
| · cenário futurista | 29 (9) | 13% | 8% | | |
| · cenário de horror | 51 (21) | 34% | 21% | | |
| **pergunta a pessoa ou ao mestre** | 12 (0) | **0%** | 0% | 0% (41 de 41) | 0% (24 de 24) |
| pergunta que toca perícia do herói («eu conheço…?», «tem alguma coisa nele?») | 5 (5) | 100% | 100% | (contada em «saber») | — |
| **busca com algo escondido** | 16 (14) | **75%** | 36% (n=5) | 98% · 95% | 75% |
| **busca sem nada escondido** | 9 (1) | **4%** | 4% | 37% · 23% | 25% |
| lembrar / saber | 11 (11) | **100%** | 100% | 69% · 58% | nenhum caso |
| **conversa com oposição ou segredo** | 15 (6) | **28%** | **18%** | 87% · 66% | 50% |
| conversa sem oposição nem segredo | 3 (1) | 9% | 0% | 45% · 23% | |
| **travessia/força com perigo ou pressa** | 16 (9) | **50%** | 40% | 84% · 76% | 82% |
| travessia/força sem perigo nem pressa | 2 (0) | 0% | 0% | 51% · 45% | |
| **esgueirar com alguém que possa notar** | 7 (3) | **32%** | 32% | 100% | |
| furtar / mãos / máquina (fechadura, armadilha, invasão) | 9 (4) | 29% | 9% | 95% · 94% | |
| magia, item, fé | 10 (2) | 14% | 14% | 73% (examinar magia) | |
| animal | 2 (2) | (2 de 2) | — | 0% | |
| rastrear | 1 (1) | (1 de 1) | — | 60% | |
| socorrer | 3 (0) | 0% | 0% | 63% · 54% | |
| encenação, logística, gesto | 37 (3) | **3%** | 3% | 1% · 0% | |
| qualquer ação com testemunha | 24 (6) | 16% | 12% | 77% · 64% | |

| medida | PT | Critical Role | TAZ |
|---|---:|---:|---:|
| pedidos espontâneos (entre os rolados) | **28%** (16 de 57) | 31% | 5% |
| o jogador pediu o dado | **18%** (10 de 57) | 19% | 29% |
| após ação declarada | 54% (31 de 57) | 50% | — |
| espontâneos, por assunto | **busca/percepção 9**, saber 3, intuição 1, animal 1, rastrear 1, conversa 1 | procurar 18, esgueirar 11, lembrar 10… | |
| **o mestre rola pelo mundo** (o objeto sobreviveu? qual arma restou? a viagem foi tranquila?) | **5 casos** | não medido | não medido |

**As razões de não rolar** (98 «não» válidos, reponderados; entre parênteses, sem a encenação e a
logística):

| razão | PT | PT sem «outro» | Critical Role | TAZ |
|---|---:|---:|---:|---:|
| **encenação** | **32%** | 7% | 7% | — |
| **sem obstáculo** | 19% | 17% | 19% | 17% |
| **o mestre narra** (ação disputada resolvida pela cena) | **12%** | **20%** | — | — |
| **informação livre** | 12% | 16% | 37% | 30% |
| pessoa disposta | 8% | 13% | 18% | 28% |
| magia, item ou regra própria | 8% | 13% | 17% | 4% |
| **o mundo decide** (impossível, sabotado, armadilha já disparada) | 4% | 6% | — | — |
| já resolvido (preparo ou vantagem ganha antes: senha roubada, documento bom, explosivo de verdade) | 3% | 6% | 1% | — |
| o dado veio depois, fora da janela | 2% | 3% | 2% | — |

**As marcas nos «sim» e nos «não»:** algo escondido **33% vs 3%**; perigo físico **28% vs 9%**; pressa
**16% vs 3%**; oposição **18% vs 15%**; testemunha **11% vs 18%**; segredo 4% vs 4%. Sem marca nenhuma:
25% dos «sim», 61% dos «não». **O sucesso visto** (35): informação 22, posição 8, acesso 5. **A falha
vista** (7): posição 3, dano 2, alarme 1, meia-informação 1.

**Célula a célula, o que esta mesa diz das perguntas da §6:**

- **Pergunta nunca rola?** **Sim, de novo: 12 de 12.** Agora são 77 perguntas nas três mesas, e nenhum
  dado. Há duas nuances: (a) quando a pergunta toca uma perícia que o herói tem («eu conheço esse
  símbolo?», «o demônio carregava alguma coisa?»), ela **vira teste de saber ou de percepção**: 5 de 5. É a
  mesma regra de «lembrar» da §3, só que dita em forma de pergunta; (b) numa pergunta a quem escondia
  algo, o mestre **ofereceu** Intuição (1 caso), e a resposta veio falsa mesmo assim. Num caso o jogador
  pediu o dado para uma pergunta («dá pra rolar percepção pra saber…?») e **o mestre negou e respondeu**.
- **Busca com ou sem algo escondido:** a mesma direção, mais nítida: **75% vs 4%**. Revistar corpo,
  procurar o banheiro, olhar pela janela: o mestre descreve.
- **Conversa com ou sem motivo para negar:** **aqui as mesas discordam de verdade.** Com oposição, a mesa
  em português rola **28%** (piso 18%), contra 87% e 50%. A conversa disputada se resolve pela
  **alavanca** (o documento falso é bom, o explosivo é de verdade), pela **encenação** (a discussão
  continua em personagem) ou pelo **mestre que narra** (a mentira cola porque a ideia foi boa). Quando
  rola, é blefe ou diplomacia diante de autoridade hostil, ou intimidação nomeada pelo jogador. A oposição,
  sozinha, quase não separa «sim» de «não» (18% vs 15%).
- **Travessia com ou sem perigo:** com perigo, rola **50%** (contra 84% e 82%). A outra metade é
  correr, saltar ou nadar no meio do caos, e o mestre narra. Sem perigo, 0 de 2.
- **Esgueirar:** com alguém que possa notar, **32%** (contra 100%). O mestre decide muitas vezes pela cena
  quem nota e quem não nota. Quando rola, quase sempre o jogador pediu («posso me esconder?») ou a ação
  era aproximar-se de guardas para derrubá-los.
- **Dado espontâneo:** **28%**, perto dos 31% da Critical Role e longe dos 5% da TAZ. E é o mesmo
  dado: **Percepção de todos** quando algo se aproxima (9 de 16), saber quando um assunto aparece (3).
  O que esta mesa tem a mais é **o dado do destino**: o mestre rola sem perícia para decidir o que o
  mundo fez (5 casos).

**O que as três mesas concordam** e por isso pesa mais: perguntar não rola; buscar o escondido rola e
buscar à toa não; saber se oferece ou se responde pela perícia; o dado espontâneo é Percepção de grupo;
magia e item resolvem pela regra deles; encenação e logística não rolam. **Onde a mesa em português
discorda é estilo:** rola metade do que a Critical Role rola, e o que ela deixa de rolar é a ação
**disputada** (conversa, esgueirar, travessia no caos), que o mestre resolve pela ficção. Para o nosso
Mestre, que é código e não pode «achar» que a ideia foi boa, o que se aproveita é a parte que vira regra:
**alavanca resolve** (§10.5, nº 73, 74 e 76), **impossível não rola** (nº 84, 85 e 97) e **o dado do
destino existe** (nº 93).

### 10.3 · O que surpreendeu

1. **A moldura prevê o dado melhor que o verbo.** Entre as ações rotuladas, as que começam com
   **«posso…?»** rolaram **8 de 9**; as com **«vou tentar»**, 4 de 7; as com **«eu vou + verbo»**, só
   **3 de 54**; as no presente («eu pego»), 5 de 31; a fala em personagem sem moldura, 0 de 7. O jogador
   brasileiro **pede licença quando sabe que a ação é arriscada** e **anuncia no futuro quando sabe que
   ela simplesmente acontece**. Para o nosso juiz de frase é o sinal mais barato que existe.
2. **O jogador sabe pedir o dado e o mestre sabe negá-lo.** 10 dos 57 dados foram pedidos pelo
   jogador, a mesma proporção da Critical Role. Uma vez o mestre negou, porque a informação estava à vista.
3. **O mestre rola pelo mundo.** Cinco vezes ele rolou um dado sem perícia para saber o que a sorte fez
   (um objeto que sobreviveu, qual arma restou, como foi a viagem). Nas mesas de língua inglesa isso não
   apareceu na amostra.
4. **Ameaçar sem o verbo ameaçar** é a forma da intimidação aqui: um gesto, um objeto à mostra e uma
   condicional. Nos dois casos rotulados ela funcionou **sem dado**, porque a alavanca era real.

### 10.4 · Como o jogador brasileiro diz o que faz

Contagens em **trechos fora da luta** do corpus inteiro (33.177 trechos; «/mil» = por mil trechos), que
incluem também a fala do mestre e dos NPCs, e contagens **nos 155 casos rotulados**, em que quem fala
foi decidido lendo. **Nenhuma frase é transcrita:** cada exemplo foi escrito por nós.

| # | padrão | contagem | o que indica | exemplo nosso |
|---|---|---|---|---|
| 1 | **«(eu) vou + infinitivo»**, o futuro de perífrase | 1.272 trechos (38/mil), 732 com «eu»; **54 de 155 rotulados (35%)**, a moldura mais comum | ação anunciada, quase sempre logística ou encenação: **rolou 3 de 54** | «Vou até o balcão e peço o quarto dos fundos.» |
| 2 | **presente de 1ª pessoa** («eu pego», «eu olho», «eu encosto») | 417 (12,6/mil); 31 rotulados (20%) | narração da própria ação, um passo de cada vez; rolou 5 de 31 | «Eu encosto o ouvido na porta da cripta.» |
| 3 | **«aí eu…»** como conector | 133 (4/mil) | encadeia ações num turno só; o juiz deve partir a frase | «Aí eu pego a tocha e desço a escada.» |
| 4 | **tentativa** («vou tentar», «tento», «tentando») | 255 (7,7/mil); 9 rotulados | o jogador já sinaliza incerteza: **rolou 4 de 9** | «Vou tentar pular pro telhado do celeiro.» |
| 5 | **licença** («posso…?», «dá pra…?», «deixa eu…») | 133 + 77 + 51 = 261 (7,9/mil); 13 rotulados | o sinal mais forte de dado: **«posso…?» rolou 8 de 9**; «deixa eu» é mais declaração que pedido (0 de 3) | «Dá pra eu subir no muro sem os guardas verem?» |
| 6 | **desejo** («eu quero», «eu queria») | 143 + 22 (5/mil); 5 rotulados | «queria» é o pedido cortês, muito usado para ler pessoas e perguntar; «quero» costuma vir antes de perícia («quero tentar escutar») | «Eu queria ver se o anão está escondendo alguma coisa.» |
| 7 | **plural «a gente vai / a gente pode»** | 225 (6,8/mil); mais que o dobro na mesa futurista | decisão de grupo; quase sempre logística | «A gente vai pela estrada do moinho, não pela floresta.» |
| 8 | **fala em personagem**, marcada («eu falo», «eu digo» + fala) ou crua | 68 marcadas (2/mil); 7 rotulados crus | conversa; com quem quer ajudar, nunca rolou (0 de 7) | «Eu digo: "Viemos a pedido do conselho, senhor."» |
| 9 | **«eu vou chegar pro X e falar…»** | ~5 explícitas (o regex é estreito), recorrente na leitura | abre uma conversa com um alvo nomeado; o juiz deve tratar como conversa, não como deslocamento | «Vou chegar pro ferreiro e perguntar quem comprou a lâmina.» |
| 10 | **pergunta de mundo** («tem algum…?», «eu vejo…?», «eu sei…?», «eu lembro…?», «eu conheço…?») | 272 (8,2/mil) | pergunta; só rola se toca uma perícia do herói (5 de 5); senão, resposta livre (12 de 12) | «Eu conheço esse brasão na capa dele?» |
| 11 | **o jogador pede o dado** («posso rolar?», «preciso rolar alguma coisa?», «dá pra rolar X pra…?», «vou rolar um dado, não é possível?») | 33 explícitos (1/mil); **10 dos 57 dados** | pedido honrado quase sempre; uma vez negado com a resposta dada | «Preciso rolar alguma coisa pra abrir esse baú?» |
| 12 | **o jogador nomeia a perícia**, muitas vezes em inglês («jogo um intimidante», «mando uma percepção», «meu stealth») | 58 trechos com termo de perícia em inglês (1,7/mil; quase 3/mil no horror); o verbo «jogo/mando/dou + perícia» saiu pouco no regex e várias vezes na leitura | a perícia vem dita: o juiz deve ler «jogo/mando/dou uma X» como pedido da perícia X | «Mando uma Intimidação nele.» |
| 13 | **advérbio de modo como pedido de furtividade** («discretamente», «sorrateiramente», «devagar», «sem chamar atenção») | 4 nos casos rotulados | esgueirar dito sem o verbo «esconder» | «Vou devagarinho até a carroça, sem chamar atenção.» |
| 14 | **«vou fazer o seguinte»** abrindo um plano | 12 (0,4/mil) | plano com várias ações; o juiz deve julgar a ação arriscada do plano, não a primeira | «Vou fazer o seguinte: distraio o guarda e vocês passam pela cozinha.» |
| 15 | **barganha** («e se eu…», «pelo menos…», «me dá um…», «não dá pra…», «ganho bônus?») | 131 (3,9/mil) | o jogador negocia a dificuldade ou o resultado; uma vez o mestre deu bônus pela boa ideia | «E se eu oferecer metade do ouro, ele pelo menos me deixa passar?» |
| 16 | **ameaça sem o verbo ameaçar**: gesto, objeto à mostra e condicional («se você não…», «senão…», «ou você…») | 35 condicionais explícitas (1/mil); 2 de 2 ameaças rotuladas eram assim, e as duas sem dado | intimidação com alavanca real | «Eu ergo o machado ainda sujo e digo que o último que mentiu pra mim está lá fora, no chão.» |
| 17 | **tratamento** | «você» 2.987 (90/mil); **«tu» 2.252**, com 666 «tu + verbo na 3ª» («tu vê», «tu sabe») | dois dos três mestres usam «tu» com o verbo na 3ª pessoa; o futurista, «você». **A tela continua em «você» (lei da casa)**; o juiz tem de **aceitar** «tu vê» e «tu faz» na frase do jogador | (entrada do jogador) «Tu acha que dá pra eu subir?» |
| 18 | **gíria e tique** | «cara» 2.076 (63/mil), palavrão 552, «tipo» 448, «beleza/show/massa» 260, «mano/véi/brother» 131 | ruído para o juiz; «beleza» é consentimento; «tipo assim» anuncia uma descrição | — |

**O que falta ao nosso juiz de frase, em ordem de valor:** (1) ler a moldura antes do verbo: «posso/dá
pra» empurra para o dado e «eu vou + verbo» empurra para «acontece»; (2) partir as frases encadeadas por
«aí eu» e «vou fazer o seguinte»; (3) reconhecer o pedido de dado e a perícia nomeada, também em inglês;
(4) aceitar «tu + verbo na 3ª»; (5) reconhecer a ameaça por gesto e condicional e a furtividade pelo
advérbio; (6) tratar «e se eu…» como barganha (uma proposta, não uma ação).

### 10.5 · Trinta e duas situações que esta mesa sustenta ou contradiz

No formato da §8, com uma coluna a mais: o que a situação faz com as anteriores. Base: número (célula da
§10.2), padrão (casos repetidos) ou fraco (um caso).

| # | situação | veredito da mesa em português | base | contra a §8 |
|---|---|---|---|---|
| 66 | O grupo entra no salão do conselho; há fumaça vindo da ala fechada | **rola, espontâneo** (Percepção de todos); só quem passa nota | padrão | sustenta nº 6 |
| 67 | O herói pergunta ao estalajadeiro se o mercador já chegou, e ele chegou | **não rola**: resposta em personagem | número | sustenta |
| 68 | A mesma pergunta, mas a estalajadeira foi paga para esconder | **depende**: a resposta vem falsa; o mestre pode **oferecer** Intuição | fraco | matiza §5.2 (ali o jogador sempre pedia) |
| 69 | O herói pergunta se os ossos do pântano têm poder mágico, e ele estudou o arcano | **rola** (saber); sem a perícia, responde-se o que todo mundo sabe | padrão | sustenta nº 7 |
| 70 | Com os cavaleiros já à vista, o jogador pede Percepção para saber quantos são | **não rola**: o mestre dá a estimativa | fraco | nova |
| 71 | O herói revista os bolsos dos bandidos mortos, sem pressa | **não rola**: lista-se o que há | padrão | sustenta nº 4 |
| 72 | O herói vasculha um autômato à procura de um rastreador escondido | **rola** (o jogador pergunta se precisa) | padrão | sustenta nº 1 |
| 73 | O herói abre o cofre do tesoureiro com a senha que roubou na cena anterior | **não rola**: o preparo resolve | fraco | nova |
| 74 | O herói mostra ao guarda do portão um salvo-conduto bem falsificado | **não rola**: o documento convence | fraco | contradiz «conversa com oposição rola» |
| 75 | O herói mostra uma carta de permissão a um oficial que despreza estrangeiros | **rola** (Diplomacia); a falha é a carta rasgada na frente dele | fraco | sustenta |
| 76 | O herói ergue a cabeça do chefe dos bandidos diante do prisioneiro e diz que pode fazer o mesmo | **não rola**: o prisioneiro cede em parte | fraco | contradiz «intimidação rola» |
| 77 | O herói mente ao estalajadeiro que a filha dele está em apuros lá fora, para esvaziar o balcão | **não rola**: funciona pela cena | fraco | contradiz |
| 78 | Uma história bem armada para guardas que já desconfiam | **rola** (Enganação), com bônus pela boa ideia | fraco | sustenta |
| 79 | O herói discute com o boticário, que quer fugir da cidade, e o segura pelo braço | **não rola**: discussão em personagem | padrão | nova |
| 80 | O herói cumprimenta o abade que o convidou | **não rola** | número | sustenta |
| 81 | O herói corre pela muralha até a torre durante o alarme | **não rola**: o mestre narra | padrão | matiza «pressa rola» |
| 82 | O herói salta entre colunas enquanto o salão desaba | **rola** (Atletismo); a falha escorrega, agarra e repete o teste | padrão | sustenta |
| 83 | O herói nada até a rocha carregando o companheiro desacordado | **rola** | padrão | sustenta |
| 84 | O herói tenta arrombar com o ombro uma porta selada por magia | **não rola**: não abre; o mundo decide | fraco | nova |
| 85 | O herói tenta pôr em marcha a carroça mecânica que alguém sabotou | **não rola**: não anda | fraco | nova |
| 86 | O herói se aproxima discretamente da sacerdotisa no meio do cortejo | **não rola**: o mestre decide que ela nota | fraco | contradiz «esgueirar com testemunha rola» |
| 87 | Com o gigante atirando pedras, o jogador pergunta se pode se esconder atrás da rocha | **rola** | padrão | sustenta |
| 88 | O herói puxa o capuz para passar pelos soldados do inimigo sem ser reconhecido | **não rola** | fraco | nova |
| 89 | O herói usa o anel para conjurar água e derreter a neve sobre o abrigo | **não rola**: o item decide | padrão | sustenta nº 61 |
| 90 | O herói chama o martelo mágico que ficou do outro lado do salão | **rola**: um d20 contra o número da regra do item | fraco | nova (o item tem a sua rolagem) |
| 91 | O herói tenta seguir a trilha depois de beber demais na festa | **rola**, com penalidade; a falha perde a trilha | fraco | sustenta nº 58 |
| 92 | O herói assobia chamando a montaria enquanto o grupo foge pela janela | **rola** (Adestramento) | fraco | contradiz «animal 0%» da §3, sustenta nº 60 |
| 93 | O barco virou: o frasco frágil que o herói levava sobreviveu? | **o mestre rola** um dado de sorte, sem perícia | padrão | nova (o dado do destino) |
| 94 | O herói estanca o sangue do companheiro depois da luta, sem bolsa de curandeiro | **não rola**: efeito parcial, narrado | fraco | sustenta nº 62 |
| 95 | O herói monta uma armadilha de alarme na entrada do túnel do acampamento | **rola** (ofício ou Ladinagem) | fraco | nova |
| 96 | O jogador resolve o enigma do guardião da ponte com a própria cabeça | **não rola**: o enigma é do jogador | fraco | nova |
| 97 | Impaciente, o herói abre a porta do meio sem desarmar a armadilha | **não rola**: a armadilha dispara | fraco | nova |

### 10.6 · O que não se conseguiu

- **Quem fala.** Sem locutor, origem e moldura são leitura minha. A coluna de molduras das contagens do
  corpus inclui o mestre narrando («você vai…») e os NPCs.
- **Resultado.** Falha vista em 7 casos: não dá distribuição. A edição corta o desfecho.
- **Recall do recortador.** Ele perde o dado dito só como número e o teste no plural, e confunde
  «rolar» com acontecer. A precisão do «sim» foi de 60% (67 de 112).
- **Células finas.** Esgueirar sem ninguém, travessia sem perigo, animal, rastrear e socorrer têm de 0
  a 3 casos: servem de pista, não de número.
- **Sistemas.** Os três usam d20 com perícias. A mesa futurista é a mais caótica e a que mais vazou
  luta; ela pesa pouco nas conclusões.

### 10.7 · Os arquivos

| onde | o quê |
|---|---|
| `C:\Users\clara\Taverna-bancada\nerdcast\casos.json` | os 229 casos rotulados, com a janela de trechos (**contém texto: nunca no repositório**) |
| `C:\Users\clara\Taverna-bancada\nerdcast\rotulos-pt.txt` | os rótulos à mão |
| `C:\Users\clara\Taverna-bancada\nerdcast\tabelas-pt.txt` | todas as contagens desta seção |
| `C:\Users\clara\Taverna-bancada\nerdcast\extrair.mjs` · `recortador-pt.mjs` · `analisar-pt.mjs` · `molduras.mjs` | o método, refazível (semente fixa) |
| `C:\Users\clara\Taverna-bancada\nerdcast\sessoes.json` · `lotes\` | as 13 sessões extraídas e a visão de leitura (**contêm texto**) |
