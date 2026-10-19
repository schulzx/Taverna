# MM11 · a décima segunda sessão de prova — o custo e a qualidade depois das ondas 1–3

> **Campanha:** *Prova da Mesa XII* · Uma Vida · Fantasia medieval · Terras abertas · Jornada do Herói · voz taverneiro · apresentação clássica.
> **Herói:** Zéfira Karn — mulher, Draconato, Caçadora (caminho Rastreador), Herborista, Sobrevivente da Praga (Destreza +2, Percepção +2, Vigor +1, Intelecto +1); 15 PV. Companheira: Aelith (guerreira, 14 PV). A cidade: Ponte Rasa; o taverneiro: Wystan (*Ferradura & a Viúva*); a masmorra: o Poço de Sangue Velho. Primeira sessão de Draconato, de Caçador e de Herborista.
> **Jogada por:** o `tester`, a 19/10, sobre `v9.472` (`4f8c5db`), no **jogo publicado**, no navegador do painel (painel oculto, janela emulada 1280×912), campanha nova criada pela tela.
> **A amostra é curta, por ordem da pessoa:** **27 respostas do Narrador** (1 abertura, 1 luta de 2 rodadas, 1 teste de dados, 2 toques) + o Léxico + 16 do Cronista = **44 chamadas a `/api/*`, todas HTTP 200.** Sem acampamento por menu, sem Partir pelo mapa (viajei por frase, duas vezes), sem a espinha: **a sessão não chegou nem perto da batida 1.**
> **Como se mediu:** um gancho em `fetch` na própria aba guardou, por chamada, hora, `uso` inteiro, tamanho do pedido, latência e a narrativa. A tabela por chamada está em `…/scratchpad/s12/registo-s12.csv`. **O que o gancho NÃO guardou: o corpo do pedido** (a pauta do turno) — só os tamanhos. Por isso o que atribuo à pauta abaixo é hipótese. **A bolsa não foi conferida turno a turno.** O `custo` do save (44 chamadas, US$ 0,2847) **bate com a minha conta a quinta casa** (0,28467): a conta é a de `src/custo.js`.
> **O localStorage:** antes `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1`; no fim, com o jogo desmontado (aba recarregada, "Continuar aventura" no ecrã inicial), apaguei só `taverna_save_v1`, e as duas de antes ficaram iguais. Reconferido 4 s depois: o autosave não a trouxe de volta. Aba fechada, janela emulada reposta.

---

## 1. O custo real

**Quem respondeu.** `gemini-3.8-flash` nas **27 respostas do Narrador** (nenhuma da reserva); `gemini-3.5-flash-lite` nas **16 do Cronista**; **o Léxico respondeu `deepseek-v4-pro`** (ver defeito 3: o Gemini morreu com `MAX_TOKENS` e a reserva o refez).

| componente | US$ | % da sessão | por quê |
|---|---:|---:|---|
| Narrador — entrada **não cacheada** (história + mensagem do turno) | 0,1621 | **57,0** | 216 mil tokens, **8.000 por turno**, a 0,75 |
| Narrador — **escritas** do cache (3: turnos 2, 24 e 25) | 0,0390 | 13,7 | 51.952 tokens a 0,75 |
| Narrador — leitura do cache | 0,0288 | 10,1 | 383 mil tokens a 0,075 |
| Narrador — saída | 0,0278 | 9,8 | 7.414 tokens (mediana ~235 por resposta; a abertura sozinha 778) |
| Narrador — guarda do cache | 0,0010 | 0,3 | |
| **Cronista** (16 chamadas) | 0,0204 | **7,2** | 0,0013 por chamada; entrada 2,6 mil, saída 160 |
| **Léxico** (DeepSeek, a reserva) | 0,0057 | 2,0 | 6.297 tokens de saída; **o Gemini que falhou antes não está na conta** (≤ US$ 0,01 estimado) |
| **Total medido (27 turnos)** | **0,2847** | 100 | **US$ 0,0105 por turno** |

**O gatilho do Cronista:** **16 chamadas em 27 turnos (0,59 por turno)**; 11 turnos sem nenhuma, 1 turno com duas. Fica nos 7% da conta (a 11.ª: 12%, e a 10 vezes o preço por chamada que o DeepSeek teria).

**As projeções** (R$ a 5,45 e +13% de impostos = × 6,16):

| cenário | US$/turno | **US$/sessão de 63** | R$/sessão | **US$/hora (35 turnos)** | R$/hora |
|---|---:|---:|---:|---:|---:|
| **linear sobre o medido** (0,2847 ÷ 27, com o Léxico e a abertura diluídos) | 0,0105 | **0,66** | 4,08 | 0,37 | 2,27 |
| **ciclo do histórico repetido** (turnos 24–27 como regra: escreve, corta, escreve) | 0,0097 | **0,63** | 3,88 | 0,34 | 2,09 |
| **ciclo bom** (sem a escrita dupla antes do corte) | 0,0086 | **0,56** | 3,45 | 0,30 | 1,85 |
| a 11.ª, medida (v9.466) | 0,0276 | 1,73 | 10,65 | 0,97 | 5,92 |

**Central: US$ 0,63 por sessão (R$ 3,88), US$ 0,34 por hora (R$ 2,09).** **Menos 64% contra a 11.ª.** O custo-do-turno previa 0,67 com a saída de hoje e **0,54 com o tamanho cumprido** (e 0,50 como alvo da onda 3): **o tamanho foi cumprido em boa parte (mediana 142 palavras) e o custo ficou em 0,56–0,66 — no teto da previsão, não no piso.** A diferença para o 0,50 é a entrada: ver a secção do cache. **Aviso que continua de pé:** o 3.8 Flash dobra de preço em 01/01/2027 (`custo.js`): a mesma sessão vira **~US$ 1,2** (R$ 7,4).

## 2. O cache, turno a turno

| | 11.ª | **12.ª** | alvo |
|---|---|---|---|
| cache do Narrador | 25,4% | **64,0%** (383.463 de 599.575; **65,9% sem a abertura**) | ≥ 65% (**na borda**) |
| chamadas a 0% depois da 1.ª | 9 | **0** | 0 ✓ |

A forma da curva é o que importa:

- **Turno 1 (abertura): 0%** (o cache nasce no turno 2).
- **Turnos 2–23: o cache é FIXO em 14.155 tokens e a entrada cresce** — a % **desce** de 74% a 55%. O cache explícito guarda **só o `system`**: a história (que cresce 2 mensagens por turno) paga-se inteira, a 0,75, todo turno. **É por isso que o turno custa 0,0056 no 3.º e 0,0105 no 23.º.**
- **Turno 24 (47 mensagens): o cache é reescrito com 20.669 tokens** (US$ 0,0217 nesse turno, o dobro de um turno normal).
- **Turno 25: o histórico corta de 47 para 25 mensagens e o cache é reescrito outra vez, com 17.128** (US$ 0,0178). **A escrita do turno 24 durou um turno** (US$ 0,016 + guarda, jogados fora). Depois do corte: **84% → 79%** e o turno custa 0,0055.
- Só **3 escritas em 27 turnos** (esperado ~6 por sessão de 63, pelo custo-do-turno): **o histórico enxuto cumpriu.**

## 3. O tamanho

| | 11.ª (63) | **12.ª (27)** | alvo |
|---|---|---|---|
| mediana de palavras | 262 | **142** (sem a abertura também 142) | 80–140 |
| p90 | 349 | **252** (273 com a abertura) | — |
| mínimo / máximo | 108 / 414 | **77 / 519** (o 519 é a abertura) | — |
| dentro de 80–140 | 2 de 62 (3%) | **11 de 27 (41%)**; 17 de 27 até 160 | — |
| acima de 300 | 15 | **1** (a abertura) | 0 |

**O tamanho colado à frase do jogador funcionou:** a 11.ª mediu 262; esta, 142. **As quatro respostas acima de 250** (273, 252, 284 + a abertura) foram o teste de dados com "por um fio" (273), o descanso de fogueira (284), a luta que acabou (252): **momentos grandes**, o que é certo. **A abertura (519 palavras, 3,7× o teto, 9,3 s) escapa à regra** — a regra está colada à frase do jogador e a abertura não tem frase (defeito 6).

## 4. A latência

| | 11.ª | **12.ª** |
|---|---|---|
| Narrador, mediana | 7,8 s | **4,6 s** |
| p90 / máx | 9,7 / 14,9 s | **7,2 / 10,8 s** |
| Cronista, mediana | 4,4 s | **1,4 s** (em paralelo; o jogador não o espera) |
| Léxico | 50,6 s | **57,1 s** (com a tentativa falhada do Gemini antes) |

**Menos 41% de espera por resposta, e menos palavras para ler** (142 contra 262): **o turno ficou quase pela metade**, no tempo e na leitura. É a melhor notícia da sessão para quem joga.

## 5. A qualidade (a régua da 11.ª)

**Memória: o histórico enxuto e o filtro por relevância custaram memória? Não vi.**
- **Lembrou** a promessa de Wystan **10 turnos depois**, com as palavras certas (*"calar a boca sobre as aduelas e entregar quem comprou o remédio"*), o pergaminho que tirei do fogo (Aelith: *"o papel que você tirou do fogo de Wystan"*, T24), a caneca da ferradura (de T20 a T26), o Corpo de Paz, quem estava na taverna. **O Mestre não esqueceu ninguém que devia lembrar.**
- **Esqueceu ou contradisse, mas dentro de 1–3 turnos** — onde o histórico estava inteiro, logo **não é corte de memória, é a conduta do modelo ou da pauta**: (a) T8 *"a marca funda na lama… carne podre arrastada"* → T9 *"chão intocado, nenhum rastro"*; (b) *"nem pederneira sobrou"* → o Mestre arma a fogueira duas respostas depois; (c) recolho o rolo de ataduras e ele **volta ao chão** na resposta seguinte e na outra; (d) **"sua irmã"** para Aelith (companheira, sem parentesco) ×2.
- **O filtro por relevância não inventou nome:** as 15 pessoas do save são todas do registro; **pessoa nova com nome inventada: 0** (a 11.ª: 2). **Mas** o registro virou **confete**: *Ivarr Sombravinda, Greta, Yorick, Sigrun, Jarl, Rowena Rompe-Escudos, Rhogar, Ylva Mão-Torta, Ondine* aparecem **sem verbo** em T4–T14 (dançam, cochicham, riem), e **Magnus o Exilado "cospe sangue na pedra"** dentro da mina, sem corpo. É relevância de *lugar* (a taverna), não de *cena*.

| critério | 11.ª | **12.ª (27 respostas)** |
|---|---|---|
| **prosa viva e específica** | sim | **sim, e mais enxuta.** *"O cheiro de gordura de porco queimada e esterco de mula bate na cara antes mesmo do portão"* (a **mesma fórmula da 11.ª**: "cheiro de X bate na cara antes mesmo do portão"); a **caneca de estanho com a ferradura**, achada no lodo da mina — **o melhor momento: um objeto que liga Wystan ao poço, nascido da prosa**; *"a trama do linho é alva, macia… lavada e dobrada com capricho recente — coisa fina demais para a lama fétida desta cova"*; *"a têmpora escamosa contra as tábuas da porta"* (o draconato entra no corpo). |
| **cumpre a pauta** | ~94% | **O PREÇO / PERGUNTOU:** T2 (caneca 2 lascas, ração 7) ✓; **a pergunta direta sem resposta 3 vezes em ~14**: T5 (*o que ronda a adega?* → falou do Corpo de Paz), e **leio o pergaminho ×2** (*"ninguém decifra letra aqui"*, depois nada). A viagem por frase (T17, *"parto para o Poço"*) ✓ **4 h, igual ao dito na abertura**; a luta ✓ fiel ao dado (flecha erra, Aelith segura, Poupar/Matar, "Respirar fundo"); **o teste de Atletismo com "por um fio"** virou consequência (os barris desabam, a vila inteira ouve) ✓. |
| **não inventa** | 3 preços, 4 tempos, 2 pessoas, 2 lore, 7 fios | **1 preço** (*"cinco lascas por um remendo de boldrié"*), **1 distância** (*"quatorze quilômetros"*), **1 ganho** (*"você acha quatro lascas na terra"*, bolsa não conferida), **0 pessoas novas**, **0 lore**, **3 fios** (os frascos desviados; a caneca; *"quem manda o bicho"*) — **todos bons, e a caneca é do ofício da história**. |
| **português e 2.ª pessoa** | sim | **sim** ("cê", "tá", Aelith xinga). *Draconato* e a praga entram. |
| **a fala do herói não posta** | 16 de 62 (26%) | **2 de 27 (7%)** (*"— … — você diz"*, T10 e T21). **Melhorou muito.** |
| **muletas** | *cospe* 55% | ***cospe* 13/27 (48%)**, **termina na fala da companheira 18/27 (67%)**, **seis respostas acabam cortadas em "…" (22%)**, *ferro/manopla* de Aelith 16/27 (59%), palavrão 5/27 (19%; a 11.ª: 10%) |
| **vazamentos** | 0 | 0 |

**O tique novo e pior: *"Sou Wystan" / "Wystan. É assim que me chamo" / "Meu nome é Wystan, Karn"* — 5 vezes em 27**, **na boca de um homem que já se apresentara e a quem eu já chamara pelo nome.** Hipótese (**não confirmada: o gancho não guardou a pauta**): `escuta.js:387` manda a pessoa "entrar nesta resposta, **com o nome dito**" (`rumo.fato`) **a cada turno em que ela vem à cena**, e o Mestre obedece à letra, fazendo-a dizer o nome outra vez. A 11.ª já mostrou o mesmo vício ao contrário (a pauta mandava um nome que o sistema calava). **Pede um guarda: "com o nome dito" só na 1.ª vez; depois, "pelo nome" ou nada.**

### As 9 notas (a ressalva: 27 respostas, até o primeiro ato mal começado; a 11.ª foram 63)

| # | ponto | 11.ª | **12.ª** | porquê |
|---|---|---|---|---|
| 1 | **o gancho** | 4 | **4** | *"Quem fechou os olhos para sempre e te arrancou das garras da praga sussurrou um único nome antes do último suspiro: Wystan"* — **o antecedente (Sobrevivente da Praga) é o gancho, com nome e sítio.** Perde 1: 519 palavras e a fórmula da abertura repetida. |
| 2 | **o mundo e o lugar** | 4 | **4** | Ponte Rasa *"muralha de pedra bruta, sem reboco, erguida para aguentar aríete"*, *"farinha velha virou moeda de troca"*, a medalha de visitante, a mina de *"escoras de carvalho podre"*. Perde: a moeda muda de nome (*cobres* na abertura, *lascas* depois), a distância inventada. |
| 3 | **as personagens** | 4 | **3** | Wystan **quer e negocia** (*"escolhe qual das duas pontas você quer largar, caçadora"*), Aelith **tem fome e voz**; mas **Wystan repete o nome 5 vezes**, todos cospem, a companheira vira "irmã". |
| 4 | **o que está em jogo** | 4 | **3** | A cura que não chegou à aldeia e a dívida de sangue são **pessoais**; a caneca amarra tudo. Perde: o preço do silêncio de Wystan nunca se paga, e **o que ronda a adega nunca aparece**. |
| 5 | **a reviravolta** | 3 | **3** | Nenhuma em 27 turnos (a ressalva); **a caneca no poço é a pista de uma**. |
| 6 | **a escalada e o ritmo** | 3 | **3** | **T5–T14 (10 respostas) em torno do balcão e da adega**, Wystan a adiar; depois **a melhor sequência: o dado, a mina, o lobo, a caneca**; depois **a cena volta atrás** (defeito 1). O tamanho menor **ajuda o ritmo**: 4,6 s e 142 palavras por resposta. |
| 7 | **a agência** | 3 | **3** | **Mudaram:** o **"por um fio"** (os barris), **Poupar** o lobo, a viagem por frase, o toque de Aceitar. **Não mudaram:** **as três perguntas diretas**, **"volto a Ponte Rasa"** (o Mestre narrou a volta, o sistema não a fez), o pedido de Wystan (aceitei por toque **e** por frase). |
| 8 | **a prosa** | 4 | **4** | As imagens acima; **142 palavras são mais prosa por palavra** que 262. Perde: *cospe* 48%, os finais em "…", a fala da companheira como ponto final em 67%. |
| 9 | **o fecho de sessão** | 4 | **3** | Parei por orçamento, no meio de uma escolha (*"mata quem tá na nossa frente ou dá meia-volta"*), **com a cena errada** (a mina, quando eu já "voltara" a Ponte Rasa). Fios: a caneca, o pergaminho que ninguém lê, Wystan, o soldado e as correntes. |

**Média: 30 ÷ 9 = 3,3** (a 11.ª: 3,6; a 10.ª: 3,3). **Dentro do ruído de uma amostra de 27 contra 63** — a 11.ª teve trechos de 2,6 e de 4,3, e a minha média de **M1–M7 da 11.ª (3,7)** é a comparável: **a 12.ª, nas mesmas primeiras 27 respostas, está pouco abaixo.** O que desceu: **personagens (4→3) e o que está em jogo (4→3)**, pelo **tique do nome** e pelas **perguntas sem resposta**. O que subiu: nada nas notas, **tudo no resto** (custo, tempo, tamanho, fala do herói).

## 6. Os defeitos, por gravidade

**ALTA**
1. **A viagem fantasma: o Mestre narra a volta, o sistema não a faz, e na resposta seguinte a cena é a mina.** *"volto com Aelith a Ponte Rasa, direto à Ferradura"* → o Mestre escreve a marcha, a chegada, o balcão, Wystan de olhos arregalados; no turno seguinte (*"fico calada, encarando Wystan"*) → *"Você firma o pé na lama da entrada da Cova… Não há balcão aqui"*. **A frase de volta não abriu viagem (a de ida, "parto para o Poço de Sangue Velho", abriu).** É o espelho do defeito da 11.ª (o teletransporte para trás por um nome de lugar): lá o sistema viajava sem eu querer, aqui o Mestre viaja sem o sistema. **O jogador é mentido por uma resposta inteira.**
2. **A pergunta direta sem resposta: 3 em ~14, e uma contradição de si mesmo.** *O que ronda a adega?* → Corpo de Paz. *Leio o pergaminho* (×2) → "ninguém decifra". **Quem pergunta e não recebe aprende a não perguntar.** Mais o rastro (T8 existe, T9 não).
3. **O Léxico morre no Gemini por `MAX_TOKENS` — sempre.** `api/narrador.js:319`: `maxOutputTokens: Math.min(teto, (!leve && REDE_DE_SAIDA.narrador) || teto)` — **a rede de saída de 1200 tokens, nascida da v9.468 para o Narrador, vale para qualquer tarefa que não seja `leve`, e o Léxico (tarefa `narrador`) pensa 5 mil tokens.** Resultado medido: **57 s de espera na criação** (a 11.ª: 50,6 s, mas **no Gemini**), o mundo escrito pelo **DeepSeek v4 pro** (a reserva, e o texto do Léxico "com o modelo forte" é outro), e **uma chamada falhada ao Gemini que o `custo` não vê** (≤ US$ 0,01). Conserto: o teto vale só para o Narrador de turno. Peso: leve.

**MÉDIA**
4. **O tique "Sou Wystan / É assim que me chamo" (5 em 27).** Hipótese em `escuta.js:387` (acima). Confirmar gravando a pauta do turno. Peso: médio (a linha é da pauta dinâmica, não do prompt estático).
5. **A abertura escapa ao tamanho: 519 palavras, 9,3 s, US$ 0,016.** Uma linha de "abertura em 3 parágrafos curtos" na mensagem do turno de abertura.
6. **O cache escreve duas vezes colado ao corte** (T24: 20.669; T25: 17.128; ~US$ 0,016 jogados fora por ciclo, **uns 14% do custo do Narrador se repetir a cada ciclo**). E **a história não está no cache**: 8.000 tokens novos por turno são 57% da conta. As duas contas fecham o caminho para o 0,50: **cachear a história por blocos (renovar a cada ~12 turnos, no corte) vale mais que qualquer enxugamento de pauta que sobre.**
7. **O registro como confete:** 8 nomes sem verbo (T4–T14) e *Magnus* a cuspir sangue na mina. A relevância é do lugar, não da cena.
8. **"Sua irmã" ×2** e os pequenos retrocessos (pederneira, ataduras).

**BAIXA**
9. **Muletas:** *cospe* 48%, final na fala da companheira 67%, seis finais cortados em "…" (22%), palavrão 19%, a moeda que muda de nome (*cobres* → *lascas*), *ferro/manopla* de Aelith 59%.
10. **Invenções pequenas:** *quatorze quilômetros*, *cinco lascas por um remendo*, *quatro lascas achadas*.

## 7. O veredito: as ondas baratearam sem perder qualidade?

**Sim, baratearam, e a qualidade ficou onde estava.**
- **Custo:** **US$ 1,73 → ~0,63 por sessão (−64%)**, **R$ 10,65 → ~3,88**; **R$ 2,09 por hora.** Cache **25% → 64%**, zero chamadas a 0% depois da 1.ª, 3 escritas em 27 turnos, Cronista a 7% da conta.
- **Tempo:** **7,8 s → 4,6 s** por resposta, **262 → 142 palavras**: o turno quase pela metade.
- **Qualidade:** **3,3 contra 3,6, dentro do ruído de 27 contra 63 turnos.** **Nenhuma falha de memória atribuível ao histórico enxuto** (a promessa de 10 turnos antes, o pergaminho, a caneca, lembrados); **0 pessoas inventadas** (a 11.ª: 2); **a fala do herói posta caiu de 26% para 7%.** Perdeu em **personagens e o que está em jogo**, por defeitos que **não vêm da economia** (o tique do nome, as perguntas sem resposta).
- **O que a economia ainda não deu:** a meta da onda 3 (US$ 0,50). **Os 0,13 que faltam são a história fora do cache (57% da conta) e a escrita dupla.** O próximo ganho barato **não está na pauta**.
- **Dois defeitos novos que a pessoa vê e não pagou para ver:** **a viagem fantasma** (1) e **o Léxico que falha no Gemini e faz a criação esperar quase um minuto** (3). O segundo é um erro de uma linha e foi **trazido pela própria economia** (a rede de 1200 tokens da v9.468).

**Uma ressalva de método:** esta sessão não gravou o corpo do pedido; as hipóteses do tique (4) e do registro-confete (7) pedem **a pauta do turno** ao lado da resposta. Se houver 13.ª, o gancho deve guardar `messages[-1].content` (o texto inteiro) de cada chamada do Narrador.

## 8. Onde olhar

- Tabela por chamada: `C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\953734d9-f48f-4ab6-9fdf-7529c9232286\scratchpad\s12\registo-s12.csv`.
- `api/narrador.js:319` (a rede de saída aplicada ao Léxico) · `src/escuta.js:387` (o "nome dito") · `src/custo.js` (a conta, que bateu com o save).
- A 11.ª: `mente/mm11-sessao-11.md` (a régua, as 9 notas, o cabeçalho de custo) · o plano das ondas: `mente/custo-do-turno.md` §7.
