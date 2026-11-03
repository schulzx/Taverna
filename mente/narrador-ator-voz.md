# O Narrador ator — o diagnóstico da voz (03/11/2026)

A pessoa jogou a 13.ª e achou as falas «muito robotizadas», com vícios e rodeios. Quer um Narrador que seja **só ator**: recebe a ficha de quem está em cena e o que tem de ser dito, e diz a frase com o peso certo, sem tique, salvo os que o personagem tem.

Isto é **diagnóstico para ela decidir**. Não mexi em código. Li, medi e escrevi. Peso no fim (§5).

**O material.** 217 narrações: a 13.ª (23, do save exportado, `sessao-13/save-s13.json` do scratchpad da sessão de prova) e as gravadas da 8.ª, 9.ª e 10.ª (`testes/sessao-s8/s9/s10.json`: 70, 47 e 77). A 13.ª é a que pesa: foi ela que a pessoa leu, e é a versão de agora. As outras três servem para ver se o tique é novo ou antigo. A pauta inteira de um turno só ficou gravada no T22 (`testes/sessao-s13.json`), e é desse turno que sai o exemplo do §4. Os scripts estão em `scratchpad/voz/` (`tiques2.cjs`, `ngram.cjs`, `nucleo.mjs`, `sys.mjs`), e quem quiser recontar corre-os.

**Uma ressalva de ofício.** Não joguei a 13.ª. Li os 23 turnos inteiros, com as notas turno a turno de quem jogou (`diario-s13.md`). O que digo do que o jogador sente vem dessa leitura e dos números. Não é experiência jogada.

---

## 0. Numa tela

- **14 das 23 respostas (61%) acabam numa de três fórmulas**: a fala cortada a meio (6), a pergunta «Vai X ou Y?» (4) e o dilema narrado em duas metades (4). As três vêm de `fecho.js`, que **manda** acabar assim.
- **A mesma frase sai de bocas diferentes.** «Não sei» aparece em 8 das 23 respostas e na boca de 6 pessoas. «Mulher», como vocativo da heroína, aparece em 5 respostas e na boca de 3 pessoas. A pergunta «Vai… ou…?» saiu 4 vezes, do Corrado e do Dunstan. Para as duas primeiras achei a instrução que as provoca.
- **Corrado aparece em 16 das 23 respostas e o «Largo da Liça» em 10**, até dentro da masmorra e à fogueira. É o RUMO, que todo turno manda «uma coisa só aponta para: Procurar Corrado».
- **Os gestos gastos não morrem, trocam de nome.** Os que a casa vetou caíram: braços cruzados 27% (8.ª) → 4%, «inclina a cabeça» 11% → 0, «sem pressa» 11% → 0, «como quem» 22% → 4%. Nasceram outros: pigarro 4/23, resmunga 7/23, «dá (meio) passo» 7/23, «pesado» 9/23 (era 5%) e «carcaça» 7/23 (era 0). O olhar fixo virou «sem erguer os olhos» (10/23). Vetar a palavra não tira o pedido de gesto.
- **Em 7 das 23 respostas a pauta aparece traduzida em prosa**: o veto vira fala, o rótulo vira nome, a ficha vira diálogo. No T22, 5 das 6 linhas da pauta são reconhecíveis na resposta.
- **Só um personagem chegou com voz própria, e só pela metade.** A voz do Dunstan (marinheiro em terra firme) **nunca chega ao Narrador**: a linha QUEM É dele passa dos 130 caracteres e a função larga a voz para guardar o querer (medido em Node). 0 das ~12 falas dele soam a mar. A do Osric (pergunta o preço de tudo) aparece em 0 de 3 falas. A do Corrado (jura por coisas pequenas) aparece 3 vezes, e 2 delas são o Narrador **a descrever** o tique, não o Corrado a fazê-lo.
- **A voz do mundo pesa 12 vezes a voz de uma pessoa.** O bloco do Taverneiro, que diz como falam **todas** as pessoas, tem 1 611 caracteres em todo turno. A voz de uma pessoa tem 130 no máximo, num turno de cada seis, e cede em toda pergunta e em toda luta.
- **O system prompt tem 45 060 caracteres** (refeito em Node com este save), e só ~6,8 mil (15%) dizem *como dizer*. Os 85% restantes são regra que o código já aplica.
- **A ficha de ator do §4 tem ~1,1 mil caracteres.** Com o ofício e as duas últimas trocas, o pedido inteiro do ator fica perto de 6 mil caracteres. O pedido real de um turno da 13.ª tinha ~19 mil tokens de entrada, na casa dos 70 mil caracteres.

---

## 1. Os tiques, medidos

A régua conta **em quantas respostas** o tique aparece, não quantas vezes. As expressões regulares estão em `tiques2.cjs`. Os exemplos são curtos, entre aspas, com o turno (Tn = a enésima resposta da 13.ª; s8#n, a da 8.ª).

### 1.1 Como a resposta acaba — o tique maior

| o fecho | 13.ª (n/23) | exemplos |
|---|---|---|
| **fala cortada a meio**, com reticências | **6** (T1, T3, T6, T8, T17, T21) | T3 «a conversa não é aqui na poeira, é com…» · T8 «se você quer que eu desenrole a língua sobre o…» · T17 «se você veio atrás daquele tal de Corrado… ele…» |
| **pergunta «X ou Y?»** ao herói | **3** de 4 perguntas (T7, T20, T22) | T7 «Vai mesmo bater perna… ou vai ficar gastando sola…?» · T20 «Vai querer forçar passagem… ou a gente dá meia-volta…?» · T22 «Vai meter o pé na chuva… ou tem mais pedra pra chutar…?» |
| **dilema narrado**: as duas saídas postas em prosa | **4** (T0, T5, T13, T15) | T0 «gastar o que resta… ou guardar o metal…» · T13 «Se você fecha o olho… se força a perna…» · T15 «descer quatro horas… ou seguir a pista da lâmina…» |
| outro (gesto, corte, consequência) | 9 | T18 «Você baixa a tocha.» |

O Corrado, a pessoa que o jogador mais quis ouvir, **não acabou uma única resposta longa**: T3, T6 e T8 morrem a meio, e no T4 a resposta vira um gesto para a saída. O jogador pergunta, e o mundo responde com reticências. É daqui que vem o «rodeio» que a pessoa sentiu.

Nas sessões antigas: pergunta no fim em 10/70 (8.ª) e 18/77 (10.ª), fala cortada em 0 e 2. **O corte a meio é novo e é da versão de agora** (26% contra 0–3%).

### 1.2 As fórmulas da fala (a mesma frase em várias bocas)

| fórmula | 13.ª | quem a diz | exemplos |
|---|---|---|---|
| **«não sei» / «ninguém sabe»** | **8/23** (s8–s10: 8/194) | meirinho, Corrado, caixeiro, Beraldo, Balduíno, Dunstan | T1 «O resto, não sei. Anda logo, mulher» · T6 «O que tem lá dentro, ninguém daqui sabe» · T8 «eu não sei o preço nem se tem» |
| **«mulher»**, vocativo da heroína | **5/23** (s8–s10: 4/194) | meirinho, Corrado (2), caixeiro (2) | T3 «é a comum dos andejos, mulher» · T4 «Comigo é que não é, mulher» · T7 «aí no lombo, mulher» |
| **«Vai X… ou…?»** | 4 falas | Corrado (T7, T8), Dunstan (T20, T22) | ver 1.1 |
| **«Iara»**, vocativo na fala | 7 falas | Dunstan (6), Osric (1) | T17 «Luz nenhuma, Iara.» · T18 «Falei que era conversa fiada, Iara» · T21 «Entulho é pedra cega, Iara.» |
| **a apresentação repetida** | **4/23**, todas do Corrado | Corrado | T2 «Sou Corrado.» · T3 «Eu sou o Corrado, empresário desta liça» · T6 «Eu me chamo Corrado, empresário desta liça» |

### 1.3 O verbo de dizer e a rubrica antes da fala

| tique | 13.ª | s8–s10 | exemplos |
|---|---|---|---|
| resmunga / rosna / grunhe / murmura | **7/23** | 8/194 | T3 «— resmunga Corrado, limpando o suor» · T6 «— resmunga ele, baixando a voz» · T12 «— Carniça brava — resmunga o caçador» |
| «solta» como verbo de dizer | **5/23** | 0/194 | T7 «solta entre os dentes» · T12 «e solta sem rodeios» · T13 «solta o caçador, a voz rouca» |
| pigarreia | **4/23** | 3/194 | T3 «pigarreia grosso e começa» · T4 «Corrado pigarreia grosso com o alvoroço» · T6 «Corrado pigarreia forte» |
| «entre os dentes» | 4/23 | 3/194 | T11 «solta um palavrão entre os dentes» · T13 «xingando baixo entre os dentes» |
| voz rouca / corrida / apressada | 4/23 | 9/194 | T5 «com a voz rouca de quem mastiga poeira» · T14 «com a voz corrida de quem tem pressa» |
| «dá (meio) passo» antes de falar | **7/23** | 13/194 | T3 «Corrado dá meio passo para trás» · T4 «dá um passo de lado» · T6 «dá meio passo à frente na lama» |
| «sem rodeios» | 3/23 | 0/194 | T2 «Você encontra o homem sem rodeios» · T9 «puxa a conversa sem rodeios» |

Quase toda fala da 13.ª chega com um verbo de dizer e um gesto colados. A fala nunca entra sozinha.

### 1.4 Os gestos gastos, e como trocam de nome

| gesto | 13.ª | 8.ª–10.ª | exemplos |
|---|---|---|---|
| olhar: fixo, «sem erguer os olhos», «crava a vista», encarar | **10/23** | 59/194 (30%) | T2 «sem erguer os olhos para ninguém» · T3 «sem desgrudar a vista do chão batido» · T5 «crava a vista na fivela gasta» |
| cuspe / escarro | 6/23 (26%) | 18/194 (a 11.ª tinha 55%, a 12.ª 48%: `fecho.js`) | T0 «solta um escarro grosso no chão» · T12 «dá um passo à frente e cospe no barro» · T18 «resmunga ele, cuspindo de lado» |
| braços cruzados | 1/23 | 29/194 (s8: 19/70) | T5 «fecha a cara e cruza os braços» |
| inclina a cabeça | 0/23 | 22/194 | s9 «Sari inclina a cabeça, cita a avó» |
| «sem pressa» | 0/23 | 21/194 | s10 «a limpar a caneca, sem pressa» |
| «fica no ar» | 0/23 | 13/194 | s10 «A pergunta fica no ar» |
| «como quem» | 1/23 | 43/194 (22%) | T4 «como quem se livra de sarna» |

**A leitura.** Onde a casa pôs veto (braços, «sem pressa», o «à espera»), o gesto caiu. A vaga ficou, e encheu-se com outro: o pigarro, o meio passo, o resmungo, a vista no chão. A causa não é a palavra, é o pedido de gesto (§2, causa 7).

### 1.5 As imagens que voltam

| imagem | 13.ª | 8.ª–10.ª | exemplos |
|---|---|---|---|
| «pesado/pesada», e o peso que «pesa» | **9/23** | 10/194 | T20 «O silêncio desce pesado» · T22 «o silêncio pesado pesando nos ouvidos» · T9 «Quatro horas de marcha pesada» |
| «carcaça» (do bicho, do herói, do irmão) | **7/23** | 0/194 | T3 «desenterrar a carcaça desse teu Tobias» · T13 «Segura essa carcaça!» · T15 «esperando a sua carcaça acordar» |
| lama / barro / lodo | 16/23 | 34/194 | (a chuva e a masmorra explicam parte) |
| talho | 4/23 | 1/194 | T10 «abrindo um talho pesado» · T11 «num talho violento» |
| o rasto que «queima» | 3/23 | — | T13 «queima mais rápido do que a prata» · T15 «queima nos dois extremos da estrada» |
| **a pausa que pesa**: parágrafo de uma frase como batida | 3/23 | 9/194 | T14 «O ferro faisca fraco contra a cinza» · T18 «Você baixa a tocha.» · T5 «As palavras caem na lama e não se misturam» |

**Listas de três**: a régua automática confunde números («trinta e seis») e vocativos com a figura, e por isso **não dou número**. Na leitura não a achei como tique da 13.ª.

### 1.6 Tudo aponta para o mesmo homem

Corrado é nomeado em **16 das 23** respostas (T0–T9, T13, T15–T17, T21, T22), e o «Largo da Liça» em **10**. Dentro da masmorra, o mendigo escondido aponta para ele (T17, «se você veio atrás daquele tal de Corrado»). À fogueira, o Osric também (T15). Depois da luta, o Dunstan fecha com ele (T22).

### 1.7 A prosa que explica o sistema (a pauta traduzida)

Em **7 das 23** respostas uma linha da pauta ou do registo sai **reconhecível**, na boca de alguém ou do Narrador:

| turno | o que a prosa diz | de onde veio |
|---|---|---|
| T8 | «Corrado, o Organizador de lutas… escapou de Burgo da Prata… há oito invernos» | o papel do registo, com maiúscula e tudo, e o dossiê do PERGUNTOU que a escuta trocou (defeito 11 da 13.ª) |
| T12 | Osric: «Me ajude a juntar o que falta. Depois disso, sou livre.» | a ficha dele dita como fala: «quer comprar a sua liberdade» |
| T16 | «não dá para correr nem manobrar de lado» | o NÃO PODE: «o lugar não comporta: cercar…, correr» |
| T18 | «o boato do pastor foi só corda para puxar você para longe do burgo» | O BOATO «MENTIRA: era isca», **anunciado** onde a pauta dizia «mostre» |
| T21 | «Dunstan não sabe o que há atrás do entulho» | O RUMO: «o que ninguém aqui sabe, quem responde diz que não sabe» |
| T22 | «nessa ruína selada… primeiro a gente tem que vencer a boca dessa furna» | o ONDE «(aqui isto é um ruína selada)» e o NÃO PODE «de dentro da masmorra só se sai pela boca» |
| T0, T13 | «quatro anos comendo poeira», «há quatro invernos ao seu lado» | a nota do registo «conhecem-se há 4 anos», dita duas vezes |

**O T22 dissecado** (é a única pauta inteira gravada). A pauta tem 6 linhas: ONDE, MASMORRA, PERGUNTOU, NÃO PODE, O RUMO, O FECHO. Na resposta: a «ruína selada» é o ONDE; «prato quente… três estalos» é o PERGUNTOU; «primeiro a gente tem que vencer a boca dessa furna» é o NÃO PODE; «cama… eu não sei» e «caçar o Corrado no Largo da Liça» são o RUMO; a pergunta final é o FECHO. **Cinco de seis linhas estão visíveis.** O cabeçalho da pauta diz, à letra, que nenhuma palavra dela entra na narrativa. O Narrador obedeceu a tudo o que a pauta mandava fazer e deu a ver tudo o que ela proibia mostrar.

---

## 2. As causas

Separo as instruções em duas espécies:

- **de MESTRE** dizem o *quê*: regra, fato, mecânica, o que existe e o que não pode acontecer;
- **de ATOR** dizem o *como*: tom, forma da frase, gesto, fecho, registo.

O padrão que se repete é este: **uma instrução de Mestre escrita como frase pronta a dizer**. O ator, que só sabe dizer, diz.

| # | tique | a instrução que o pede ou provoca | arquivo · âncora | espécie |
|---|---|---|---|---|
| 1 | **fala cortada a meio** | O fecho `silencio`: «alguém em cena deixa uma fala a meio, e acaba nela». E num turno de **pergunta** ele é o mais provável: `FECHO_POR_MOMENTO.pergunta = { silencio: 3, pergunta: 2, consequencia: 1, corte: 1 }`, 3 em 7, 43%. Somam-se a voz Taverneiro, «deixe os personagens se interromperem», e a frase dela, «com interrupção e fala em cima de fala». | `src/fecho.js` `FECHOS` e `FECHO_POR_MOMENTO` · `src/vozes.js` voz `taverneiro` (`faz` 2, `frase`) | ATOR, dada como regra do sistema. **Briga com o RUMO** («responda primeiro»): o turno em que o jogador pergunta é o que tem mais chance de acabar sem resposta. |
| 2 | **«Vai X ou Y?»** | O fecho `pergunta` («faz-me uma pergunta direta, e acaba nela») sorteado **junto** com O RUMO, «uma coisa só aponta para: {passo}». A pergunta é onde o passo cabe, e ele entra como a segunda metade: «…caçar o Corrado no Largo da Liça ou…?». O system diz o contrário: «NUNCA ofereça opções… nem pergunte "o que você faz?" com alternativas prontas». | `src/fecho.js` `FECHOS[0]` · `src/escuta.js` `ponte` (l. ~297) · `src/prompt.js` `montarSystemPrompt`, linha «Termine SEMPRE devolvendo a palavra» | ATOR (fecho) + MESTRE (rumo), em choque com outra lei de ATOR. |
| 3 | **dilema narrado** | O fecho `escolha`: «a ficção põe-me nas mãos duas coisas que não cabem juntas, e as duas custam». Pesa 3 em 7 no momento `sistema` (viagem, chegada, acampamento): T13 e T15 são o acampamento. | `src/fecho.js` `FECHOS[1]`, `FECHO_POR_MOMENTO.sistema` | ATOR. É a lista de opções que o system proíbe, escrita em prosa. |
| 4 | **«não sei» em seis bocas** | O RUMO: «o que ninguém aqui sabe, quem responde diz que não sabe». E no system, O QUE É FATO: «quem fala na cena não sabe, desconversa ou diz sem número». | `src/escuta.js` `pergunta` (l. ~294) · `src/prompt.js` parágrafo «O QUE É FATO» | MESTRE (a verdade: o sistema não tem o número), **escrita como fala**. A regra está certa; a frase-modelo é que contagia. |
| 5 | **apresentação repetida** | A pista da batida 1: «…que diz ao herói o próprio nome logo que lhe fala», repetida pelo RUMO em todo turno. **Já consertado** em `c3e7c83` (v9.578, o passo lê quem já foi encontrado; `escuta.js` `fatoEmCena`: «já se apresentou, não diz o nome outra vez»). | `src/abertura.js` l. 827–828 | MESTRE disfarçado de rubrica |
| 6 | **Corrado em tudo** | O RUMO, com o passo da batida 1, «Procurar Corrado em Largo da Liça», em todo turno, mesmo de dentro da masmorra (pauta do T22). | `src/escuta.js` `ponte` · a espinha, batida 1 | MESTRE. O próximo passo da história chega ao ator como coisa a dizer, e ele põe-na na boca de quem estiver à mão: o mendigo, o Osric, o Dunstan. |
| 7 | **gestos gastos que trocam de nome** | (a) O ofício pede gesto antes da fala: «A cena, o gesto, o cheiro, o silêncio antes da resposta», e a LIBERDADE CRIATIVA, «calados que dizem tudo com um olhar». (b) A linha A GENTE é uma rubrica de gesto por pessoa, e às vezes sai copiada: «senta do lado sem pedir licença» virou, no T0, «senta num mourão… sem pedir licença». (c) O veto **nomeia** os tiques em todo turno, «sem cuspe, braços cruzados, olhar fixo», e só vale para a última frase. Nomear a palavra põe-na no contexto, e o meio da resposta fica livre. | `src/prompt.js` parágrafo do ofício e «LIBERDADE CRIATIVA» · `src/interprete.js` `faz` de cada gesto + `INTERPRETE_PROMPT` · `src/fecho.js` `VETO_DO_GESTO`, `GESTOS_GASTOS` · `src/nucleo.js` `TIQUES_PROIBIDOS` | ATOR. A prova da troca está em §1.4. |
| 8 | **todos falam igual** («mulher», «pra», «desgraçado», «bater perna» na boca do meirinho, do caixeiro, do Corrado e do Dunstan) | A voz do mundo diz como falam **as pessoas**, todas: «COMO AS PESSOAS FALAM: palavrão à vontade…, apelido…, gíria e a contração da fala viva ('tá', 'cê', 'pra')… Ninguém fala BONITO». São 1 611 caracteres em todo turno, contra os 130 da voz de uma pessoa (§3). | `src/vozes.js` voz `taverneiro` (`boca`, `faz` 3) · `vozPrompt` | ATOR, no sítio errado: o registo do **narrador** ficou a mandar na boca de **todos**. |
| 9 | **a pauta traduzida** (§1.7) | A pauta mistura o fato com a razão do fato, e escreve-os em frase pronta: «o sistema não abriu viagem nenhuma — de dentro da masmorra só se sai pela boca»; «(aqui isto é um ruína selada)»; «o lugar não comporta: cercar…, correr». O ator recebe a **razão do Mestre** e passa-a a diálogo («primeiro a gente tem que vencer a boca dessa furna»). | `src/pauta.js` `SECOES` (ONDE, NÃO PODE, O RUMO) · `src/motor/pauta-do-turno.js` (quem monta) · o léxico da cena | MESTRE no canal do ATOR |
| 10 | **o dossiê despejado** (T8) | O PERGUNTOU respondeu à pergunta errada (a escuta leu «Corrado» e «feridas»: defeito 11 da 13.ª), e o ator despejou a ficha inteira, dita pelo Narrador e não por alguém. | `src/escuta.js` · `src/cidade-por-dentro.js` | MESTRE |
| 11 | **«pesado», «carcaça», lama, «solta», pigarro** | **Causa não achada** em instrução nenhuma: nenhuma pede estas palavras. Ficam a voz Taverneiro («solto, sujo e falado»), a chuva e a masmorra (a lama), e a atração do próprio modelo. Defendo a hipótese da causa 7: tirado um gesto, o modelo põe outro na vaga. Não está provada. | — | — |
| 12 | **o tique contado e não feito** (Corrado «jurando baixo por um botão torto», T5) | O tique da pessoa chega como **descrição** («jura por coisas pequenas») e o ator descreve-o, em vez de o pôr dentro da fala. Só nas duas primeiras cenas a linha leva o exemplo entre aspas. | `src/nucleo.js` `VOZ_PRESA`, `QUEM_E.cenasComExemplo = 2` | ATOR |

**O tamanho da mistura, medido.** O system de um turno da 13.ª, refeito em Node com o save (`sys.mjs`, cena vazia), tem **45 060 caracteres**: 41 923 fixos e 3 084 na zona da cena e no estado. As partes que dizem *como dizer* somam **~6,8 mil (15%)**: o ofício (505), a voz (1 611), a LIBERDADE CRIATIVA (586), PERSONAGENS SEM AMARRAS (1 019), O OFÍCIO DA CENA (1 193), o «Termine SEMPRE» (347), ESTILO e VARIEDADE (728) e a A PAUTA DO TURNO (835). Os outros **~38 mil (85%)** são regra que o código já aplica antes de o Narrador ler uma linha: rolagens, 5e, combate, economia, mapa, tempo, cânone, correio, escopo, recarga. Na pauta do T22, das 6 linhas **uma** é de ator (O FECHO, ~160 dos 1 362 caracteres, 12%). As outras cinco são de Mestre.

O comentário de `prompt.js` já o tinha visto em v9.131: «91% do texto era proibição ou atribuição ao sistema». A casa foi tirando proibições. O que não fez foi tirar ao ator **as regras que não são dele**.

---

## 3. As falas dos NPCs: falam todos igual?

**Falam.** Na 13.ª o meirinho, o caixeiro, o Corrado, o Beraldo, o Dunstan, o Osric e o Balduíno usam o mesmo registo: «pra», «a gente», «bater perna», «desgraçado», «mulher». Põem o mesmo gesto antes da fala, fecham com o mesmo «Vai… ou…?» e confessam com o mesmo «não sei». Nas 61 falas da 13.ª, a única marca de uma pessoa só que achei foi o juramento do Corrado, dito uma vez.

### O que cada um leva hoje ao Narrador

Só **o núcleo** (4 a 6 pessoas por campanha, `nucleo.js`) tem voz: um campo `fala` tirado de `COMO_FALA`, 22 tiques. O resto da gente tem o papel e uma nota do registo. Refiz o núcleo da 13.ª em Node com o save (`nucleo.mjs`):

| pessoa | voz que o sistema tem | chega ao Narrador? | apareceu na prosa? |
|---|---|---|---|
| **Dunstan** (companheiro, 12 falas) | «fala como marinheiro em terra firme» | **Nunca.** `linhaQuemE` monta «Dunstan Machado Torto (voz só do Dunstan: …)», e o querer já não cabe nos 130. A função larga a voz para guardar o querer. Medido: com e sem o exemplo, sai «Dunstan Machado Torto (ele): quer ter um teto seu…» sem a voz. | 0 de 12 falas soam a mar. E o registo diz que ele **foi taverneiro**: nunca usado, nem quando a heroína pergunta o preço da taverna (T22). |
| **Corrado** (7 turnos) | «jura por coisas pequenas» | Na linha QUEM É, de seis em seis turnos, e **cede em toda pergunta**. Corrado esteve em cena do T2 ao T8, e 5 desses 7 turnos foram perguntas: a linha podia chegar 2 vezes, no máximo. | 3 vezes: 1 dita («pelos três pregos da forca») e 2 **narradas** («jurando baixo por um botão torto»). |
| **Osric** (3 falas) | «pergunta o preço de tudo, até do silêncio» | idem | 0 de 3. A pressa dele («voz corrida») é do Narrador. |
| **Margarida** | «nunca diz "eu"» | — | não entrou em cena |
| Beraldo, Anselmo, meirinho, caixeiro, Balduíno | **nenhuma**. O registo tem papel e notas: «sabe quem entra e sai»; «leal; quer quer ver o mar uma vez, só uma» (sic: o «quer quer» é um defeito do registo) | — | o registo do mundo (Taverneiro) |

### Quanto pesa a voz

- **A voz de uma pessoa**: a linha QUEM É, até 130 caracteres (`QUEM_E.max`), **uma pessoa por turno**, a mesma só de **seis em seis** turnos (`QUEM_E.intervalo`), com o exemplo entre aspas só nas **duas** primeiras cenas (`cenasComExemplo`). Cede na luta e na pergunta (`SECOES_QUE_CEDEM`). É no máximo **9% da pauta** (teto 1 400) e **~0,2% do pedido**.
- **A voz do mundo**: 1 611 caracteres, **em todo turno**, e a linha «COMO AS PESSOAS FALAM» vale para toda a gente.
- **A rubrica de cada um** (A GENTE, `interprete.js`): diz o que a pessoa **faz** («chama uma terceira pessoa para dentro da conversa»), nunca **como fala**. `INTERPRETE_PROMPT` diz-lhe, à letra, que a fala é toda dele.

Num turno comum, a voz da pessoa chega com 130 caracteres, quando chega, e a do mundo com 1 611 e sempre. Ganha a do mundo, e é por isso que todos soam ao mesmo taverneiro.

---

## 4. A ficha de ator

### O princípio

**O Mestre (código) decide, e escreve a ficha. O ator recebe só a ficha.** Na ficha cada instrução de Mestre chega **já traduzida em fato de cena** ou em **vontade de uma pessoa**. Nunca chega como ordem, razão ou rótulo. O ator não precisa saber *porquê* ninguém sai da gruta; precisa saber *que* ninguém sai. Não precisa de um RUMO; precisa saber que o Dunstan **quer** apertar o Corrado. Um querer, o ator interpreta. Uma ordem, repete.

**O que o ator recebe:**

1. **O ofício**, permanente e curto (~1,5 mil caracteres): segunda pessoa; mostrar sem explicar; cada pessoa fala com a sua ficha e com nenhuma outra; a fala entra sem gesto antes dela, salvo se o gesto diz alguma coisa; o que não está na ficha não existe; nenhum tique que a ficha não dê.
2. **A voz do mundo, só como registo do narrador** (~400 caracteres): como soa a prosa, nunca como falam as pessoas.
3. **A cena**: o lugar com o que se vê, a luz e o tempo, e o que acabou de acontecer.
4. **Quem está**, e por pessoa: quem é numa linha; **como fala** (registo, ritmo, como trata o herói, o tique só se tiver, com um exemplo dentro da fala); **o que sabe e o que não sabe neste turno**; **o que quer agora**; **o que quer para si e não diz** (o subtexto).
5. **O que é dito**: as intenções e os números exatos, nunca a frase.
6. **A última palavra**: de quem é e o que essa pessoa quer do herói. A forma é do ator, com uma regra só: uma coisa, sem «ou».
7. **Tom e tamanho**.
8. **As duas últimas trocas**, tal qual, para a continuidade.

**O que o ator NÃO recebe:** as regras que o código aplica (rolagens, 5e, combate, economia, cânone, tempo, escopo, correio, recarga: os ~38 mil do §2); a razão do Mestre («o sistema não abriu viagem»); rótulo de mecanismo (batida, rumo, pauta, camada, «⌖ J11 49,6», «ruína selada» entre parênteses); a lista de gestos proibidos (que só os semeia); quem não está em cena; o dossiê de quem não foi perguntado.

### O exemplo, montado do T22 (a única pauta inteira gravada)

O que o sistema decidiu, na pauta real: a heroína está dentro da Fenda; sai-se só pela boca, e a marcha não se narra; a refeição quente no burgo custa ◉ 3; o rumo é Corrado no Largo da Liça; o fecho é uma pergunta direta. Junto o registo do Dunstan e o núcleo. Os campos marcados **(novo)** não existem hoje e sairiam de uma tabela semeada. O que lá ponho mostra a forma, não é decisão.

```
CENA
Dentro da Fenda de Silêncio, perto da boca da gruta. Chove lá fora. Uma tocha acesa. A víbora jaz pregada à parede pela flecha do Dunstan.

ACABOU DE ACONTECER
Iara diz que quer voltar a Porto das Pedras e cear no Javali Empalhado. Ainda estão os dois cá dentro: nesta resposta ninguém sai da gruta.

QUEM ESTÁ
Dunstan Machado Torto — o companheiro, caçador, quatro anos de estrada com Iara; antes disso foi taverneiro.
  Fala: curto, de marinheiro em terra firme ("Amarre isso, que vem vento."). Trata-a por Iara.
  Sabe: no Javali, o prato quente custa 3 estalos de prata. Não sabe o preço da cama.
  Quer agora: sair antes que a chuva engrosse, e apertar o Corrado no Largo da Liça.
  Quer para si, e não diz: um teto seu, com uma porta que tranque por dentro.
Balduíno do Prado Salgado — mendigo escondido mais ao fundo. Não fala neste turno.

O QUE É DITO
Dunstan responde ao preço: o prato, 3 estalos; a cama, não sabe.

A ÚLTIMA PALAVRA
É do Dunstan: uma pergunta só, a Iara, sobre partir já, debaixo de chuva.

TOM E TAMANHO
Cansaço depois da luta, um alívio que ninguém confessa. Dois parágrafos curtos.
```

**1 118 caracteres.** Cada linha da pauta real foi parar a um sítio:

- o NÃO PODE da marcha virou «nesta resposta ninguém sai da gruta»: um fato, sem a razão;
- o NÃO PODE do lugar apertado não entra, porque ninguém luta neste turno;
- o ONDE e a MASMORRA viraram a CENA;
- o PERGUNTOU virou o que o Dunstan **sabe**;
- o «diz que não sabe» virou um fato da pessoa: «não sabe o preço da cama», que ele dirá à maneira dele;
- O RUMO virou um **querer** do Dunstan;
- O FECHO virou A ÚLTIMA PALAVRA, sem o «ou»;
- o veto do gesto saiu inteiro.

Entram duas coisas que a pauta não tinha e o sistema já sabia: a voz do Dunstan, perdida no corte dos 130, e o passado de taverneiro, que dá ao preço uma boca que o conhece.

### Um segundo exemplo: o turno em que o Corrado não acabou a frase (T4)

Este foi **reconstruído das notas** de quem jogou, porque a pauta do T4 não foi gravada. Os fatos são do sistema: o pedido do QUEM CARREGA estava na pauta do T2, a voz e o querer são do núcleo. Mostra o defeito 5 da 13.ª (o pedido trocado) evitado na origem: quem diz o pedido é o Corrado, e diz-o inteiro.

```
CENA
Largo da Liça, Porto das Pedras, de manhã. O fosso de areia, a plateia a gritar apostas. Anselmo aposta aos berros no parapeito.

ACABOU DE ACONTECER
Iara pergunta a Corrado com quem é a conversa sobre o irmão, Tobias, e onde encontrar essa pessoa.

QUEM ESTÁ
Corrado — organiza as lutas da liça. Já se apresentou: não diz o nome de novo.
  Fala: jura por coisas pequenas, dentro da própria fala ("Pela minha bota esquerda."). Frase de negociante: curta, sempre com um preço por trás. Trata-a por "forasteira".
  Sabe: que o rasto de Tobias passa por ele. Não dá nome nenhum hoje.
  Quer agora: trocar o que sabe por um favor — meio dia de desvio até uma campa que não visita há seis anos.
  Quer para si, e não diz: achar alguém que partiu sem dizer para onde.
Dunstan Machado Torto — ao lado de Iara, calado; desconfia do Corrado.
Anselmo — apostador; uma fala de fundo, no máximo, e diferente da de ontem.

O QUE É DITO
Corrado não dá o nome. Diz o preço inteiro, sem cortar a frase: o desvio, a campa, os seis anos.

A ÚLTIMA PALAVRA
É do Corrado, e acaba no pedido dito por inteiro.

TOM E TAMANHO
Negócio feito em voz baixa no meio da gritaria. Um a dois parágrafos.
```

**1 178 caracteres.** O «Frase de negociante» e o «Trata-a por "forasteira"» são os campos **(novo)**. O resto já existe no sistema.

### O tamanho, contra o pedido real

| | caracteres |
|---|---|
| **o pedido real de um turno da 13.ª** | ~19 mil tokens de entrada (medido no T2: 18,9 mil), na casa dos **70 mil caracteres** |
| · dentro dele, o system (refeito em Node com o save) | 45 060 |
| · dentro dele, a pauta do T22 + a frase do jogador | 1 558 |
| **o pedido do ator** | **~6 mil** |
| · o ofício + a voz do mundo como registo | ~1 900 |
| · a ficha | ~1 100–1 200 |
| · as duas últimas trocas, tal qual | ~2 500–3 000 |

Fica em ~8–9% do pedido de hoje. O teto de prompt não sobe, desce. O custo cai menos do que o tamanho, porque o system de hoje já vai quase todo em cache. O ganho que importa não é o dinheiro: **o ator deixa de ler 38 mil caracteres de regra que não pode cumprir e que só pode deixar escapar.**

**O risco, dito.** Sem as regras, o ator inventa mais quando a ficha falha. A guarda é a da casa: o Mestre que escreve a ficha já existe (a pauta e os envelopes), o Juiz lê a prosa depois, e o Cronista canoniza. Mas **a ficha passa a ser o único sítio onde a verdade chega ao ator**. Ficha incompleta é invenção certa, e por isso a ficha precisa de catraca própria (§5).

---

## 5. O peso, o que provar, e o que se pode fazer já

### O peso

**A ficha de ator é `pesado`.** É «a voz do Narrador em massa» e muda o contrato do prompt, dois itens da tabela de pesos. A ordem de 28/09 dá liberdade de motor dentro da Fase MM, e a pergunta de 23/09 («um commit revertido conserta isto?») responde que sim: não toca no save. Mesmo assim, foi a pessoa que pediu o diagnóstico para decidir, e a decisão é dela. Não a rebaixo.

### Para a pessoa decidir — a proposta ambiciosa

**O Narrador vira elenco.** Duas peças, e a segunda é a que faria o jogo ser lembrado.

1. **A ficha de ator no lugar do system.** O código escreve a ficha (§4) a partir do que já decide; o Narrador recebe só a ficha, o ofício e as duas últimas trocas. **Toda pessoa que fala ganha ficha de voz**, e não só o núcleo: registo, ritmo, como trata o herói, um tique ou nenhum, tirados de tabela pela semente (a lei «se é número, é tabela» vale para a voz). O meirinho fala como meirinho, e não como o Taverneiro.
2. **A fala marcada.** O ator devolve a resposta em falas com dono (`{ quem, fala }`, mais a prosa à volta), e não num bloco só. Para quem joga: cada fala ao lado do rosto de quem a diz (`rosto.jsx` já existe), como num RPG de computador bem feito, e o Corrado passa a *ter cara* quando fala. Para o sistema: a voz passa a ser **medível por pessoa**, e a catraca vê a mesma fórmula em três bocas no turno em que acontece, e não numa sessão de prova. Esta muda o formato da resposta do Narrador e a tela: é `pesado` duas vezes, e é a que eu faria.

### O que provar (as catracas possíveis)

- **Um varredor de tiques** sobre as sessões gravadas: as réguas deste documento (`tiques2.cjs`) passam a teste, com teto por tique. Por exemplo: fala cortada no fim ≤ 10%; «X ou Y?» no fim = 0; a mesma fórmula em ≥ 3 bocas numa sessão = 0; a apresentação = 1 por pessoa.
- **A ficha nunca leva palavra de bastidor**: a lista `QUEM_E.proibidas` estendida a rumo, pauta, sistema, camada, «⌖», o rótulo do léxico entre parênteses.
- **Toda pessoa com fala tem voz na ficha**: o teste que hoje falharia com o Dunstan.
- **O teto da ficha** em caracteres, numa tabela, e o pedido do ator nunca acima do de hoje.

### O que se pode fazer já, sem a decisão grande

Pesos da tabela, do mais barato ao mais caro:

1. **leve** — **a voz do Dunstan cai no corte dos 130** (`nucleo.js` `linhaQuemE`). É defeito com teste: o companheiro, a pessoa que mais fala no jogo, nunca leva a voz. Usar o primeiro nome na cabeça, como `vozPresa` já faz, ou deixar a voz passar à frente do «teme».
2. **médio** — em `FECHO_POR_MOMENTO.pergunta`, tirar o `silencio`, que hoje pesa 3: o turno de pergunta pede a resposta inteira. É número em tabela existente, com catraca. É o conserto mais barato para o «rodeio» que a pessoa sentiu.
3. **médio** — o fecho `pergunta` passa a dizer «uma coisa só, sem "ou"», no mesmo tamanho de linha, e acaba-se o choque com a linha «NUNCA ofereça opções» do system.
4. **médio** — o RUMO deixa de ser frase a dizer e vira o querer de alguém presente. Se ninguém presente o quer, não entra. Acaba o Corrado apontado pelo mendigo da masmorra.
5. **médio** — o veto do gesto deixa de **nomear** os tiques em todo turno. Troca-se por uma regra positiva, «a fala entra sem gesto antes dela, salvo se o gesto diz alguma coisa», e prova-se na sessão seguinte contra os números de §1.3 e §1.4.
6. **pesado (a voz em massa)** — a voz Taverneiro deixa de dizer «COMO AS PESSOAS FALAM», e esse campo passa a ser só o registo do narrador. As pessoas falam pela ficha delas. Sem a ficha de voz para todos (proposta 1), isto deixa os figurantes sem voz nenhuma, e por isso **anda junto com ela**.

O registo com «quer quer» (Osric, Anselmo) é defeito leve do registo de gente, fora do tema da voz, e fica anotado aqui para não se perder.
