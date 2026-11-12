# A décima nona sessão de prova — o Mestre já chama o dado; o sucesso ainda não tem dono (11/11/2026)

> **A régua:** é a MC11 da Fase MC (*o Mestre chama o dado*), e mede também o que a Fase EM prometeu provar «na 19.ª». O método e o formato são os da 18.ª (`mente/sessao-18.md`), e as comparações de custo são com ela.

> **Campanha:** *Prova da Mesa XIX* · Uma Vida · Fantasia medieval · Terras abertas · **Mistério em Camadas** · voz **Taverneiro** · apresentação **Plural**.
> **Heroína:** Pipa Rabo-de-Junco, mulher, **Halfling, Ladina (caminho Trapaceiro), Herborista, Filha da Guilda dos Dedos** (Destreza +3, Percepção +2, Presença +1); 10 PV. Companheira: Brunilda do Moinho (mestra de ofício, Monge, 12 PV). Cidade: Ribeira das Areias. Quest de abertura: o livro de registos da comarca sumiu das mãos de Margarida, e um homem de luvas cinzentas anda a pagar dívidas alheias. Masmorra: o Forte Abandonado de Gelo Fundo. É a primeira sessão com Halfling, com Ladina, com Herborista, com a voz Taverneiro e com o arco Mistério em Camadas. O caminho também é outro: rua, furto, cadeia e só depois a estrada.
> **Jogada por:** o `jogo`, a 11/11 (01:30–02:06 UTC), sobre **`v9.640`** (conferida no bundle publicado, `index-pL4gIOv1.js`), no **jogo publicado**, no navegador do painel, com campanha nova criada pela tela.
> **A amostra:** **44 respostas do Narrador**, 30 do Cronista e 1 do Léxico: **75 chamadas a `/api/*`, todas HTTP 200.** 34 turnos fora da luta, 3 lutas (de 1, 1 e 2 rodadas), 1 viagem com encontro na estrada, 1 noite na estalagem com conversa à lareira e 4 das 7 salas da masmorra. Parei a 44 respostas e US$ 0,48, longe do teto (60 respostas ou US$ 1,00), porque as perguntas já tinham resposta. Ficaram por testar o cativeiro, nadar e cavalgar.
> **Como se mediu:** um gancho em `fetch` na própria aba guardou, por chamada, a hora, a latência, o `uso` inteiro, os tamanhos, a narrativa e **o texto inteiro da última mensagem** (a pauta do turno). As citações de pauta abaixo foram lidas da aba no próprio turno. **O `custo` do save (74 chamadas, US$ 0,48129) bate com a minha conta** quando se tira a 75.ª chamada, do Cronista, que chegou depois da última gravação (0,48129 + 0,00121 = 0,48250). A conta é a de `src/custo.js`.
> **O localStorage:** antes, só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1`. No fim recarreguei a aba para desmontar o jogo (ficou no ecrã inicial, com «Continuar aventura»), apaguei só `taverna_save_v1` e `taverna_save_v1_sessao` e reconferi 4 s depois: restam as duas `taverna_cfg_*`, com os mesmos valores. Fechei a aba.

---

## 1. O custo real

**Quem respondeu:** `gemini-3.8-flash` nas 44 respostas do Narrador e no Léxico (a reserva nunca entrou) e `gemini-3.5-flash-lite` nas 30 do Cronista.

| componente | US$ | % da sessão | porquê |
|---|---:|---:|---|
| Narrador: entrada **não cacheada** | 0,2742 | **56,8** | 365,6 mil tokens, **8.310 por turno**, a 0,75 |
| Narrador: **escritas** do cache (4: i=4, 38, 42 e 64) | 0,0494 | 10,2 | 65.923 tokens (13.442 · 19.702 · 15.950 · 16.829) |
| Narrador: leitura do cache | 0,0485 | 10,1 | 646,8 mil tokens a 0,075 |
| Narrador: saída | 0,0451 | 9,3 | 12.025 tokens; mediana de **168 palavras** por resposta |
| Narrador: guarda do cache | 0,0034 | 0,7 | 6.790 tokens·hora |
| **Cronista** (30 chamadas) | 0,0384 | 8,0 | 0,0013 por chamada |
| **Léxico** | 0,0235 | 4,9 | 5.387 tokens de saída; **55,9 s** |
| **Total medido** | **0,4825** | 100 | **US$ 0,0110 por resposta do Narrador** (só o Narrador: 0,0096) |

**Igual à 18.ª ao centavo:** US$ 0,0110 por resposta lá (0,362 em 33) e cá (0,483 em 44). O cache cobriu 64% da entrada, como na 18.ª e na 12.ª. A parte que cresce continua a ser a que se paga inteira: o prefixo cacheado ficou parado nos 13.442 tokens do i=4 ao i=37, enquanto a entrada subiu de 18,5 para 26,2 mil.

**A latência piorou outra vez:** mediana de **7,1 s** (a 18.ª teve 6,0 e a 12.ª 4,6), máximo de **22,2 s** (o furto das chaves, T16) e três turnos acima de 15 s.

**As projeções** (R$ a 5,45, mais 13% de impostos, dá × 6,16): **US$ 0,69 por sessão de 63 turnos (R$ 4,25)** e US$ 0,38 por hora (R$ 2,37), iguais às da 18.ª. O aviso continua de pé: o 3.8 Flash dobra de preço a 01/01/2027.

## 2. A régua dos dados (um dado a cada dois ou três turnos fora da luta)

**34 turnos fora da luta e 17 d20 pedidos à mesa dão um dado a cada 2,0 turnos. Contando as rolagens automáticas (duas salvaguardas de queda, a navegação e os mantimentos), são 21, um a cada 1,6 turnos. A régua cumpre-se, e desta vez também no sentido.**

| | 18.ª | **19.ª** |
|---|---:|---:|
| d20 fora da luta | 9 em 26 (1/2,9) | **17 em 34 (1/2,0)** |
| dados nascidos da frase do jogador | 1 | **14 (41% dos turnos)**; a EM1 pedia ≥ 20% |
| perícias diferentes | 2 (Percepção e Navegação) | **8**: Atletismo 3, Percepção 4, Prestidigitação 2, Furtividade 2, Saberes 2, Medicina 2, Intuição 1, Montaria 1 |
| peso da perícia mais pedida | Percepção 4 em 9 (44%) | Percepção 4 em 17 (24%) |
| sucessos | 3 vazios em 4 | 10, dos quais **só 3 com facto do sistema** (veja a secção 3) |

**O chamado (MC1–MC3) funciona e é a melhor mudança desde a 13.ª.** Depois da frase aparece na página *«Saberes. Precisa de 15. Se falhar, o símbolo não diz nada, ou diz errado.»*, e a bandeja de baixo diz *«Rolar d20 · Saberes · precisa de 15»*, com «Mudar de ideia» ao lado. O d20 espera pelo toque. Os avisos são concretos e quase sempre cumpridos: em *«Se falhar, você despenca lá de cima»* veio a queda de 5 m, com salvaguarda e 4 de dano à vista; em *«o pé sai antes da borda, e você cai»* veio a queda de 3 m e 1 de dano.

**Frases que pediam dado e não o tiveram (as exatas):**
- T1 · *«passo rente ao Anselmo e tento aliviar a bolsa dele sem ele sentir»*: não houve envelope nenhum, e o Narrador decidiu sozinho que a Beatriz viu. *«surrupio o molho de chaves… e escondo na manga»* (T16) já deu Prestidigitação.
- T11 · *«Passo a mão espalmada por cima do alçapão… Sinto alguma magia aqui, algum resíduo de feitiço?»*: não houve dado, e o Narrador respondeu «nada de formigamento».
- T17 · *«desço até a porta das celas. Antes de mexer, apalpo a fechadura atrás de alguma armadilha, agulha ou arame, e desarmo o que achar»*: virou o chip «Ir até as celas · 1 min», e o desarmar perdeu-se.
- T30 · *«…aguentando o frio sem bater os dentes»* deu **Furtividade** (com o aviso *«alguém na rua vê você»*, no ermo), em vez do teste de resistência.
- O **Negociar** do encontro na estrada (65%, 16 moedas) levou as moedas e não mostrou dado nenhum.

**Dado sem motivo:** nenhum. Houve, sim, um **dado que engoliu um gesto** (T9a): a oferta «Percepção 13» do Largo ficou pendente, e o Enter de *«vamos para o Terreiro Rouco»* não fez nada nem deu aviso.

## 3. A régua Matt Mercer (a resposta sai do sistema ou da imaginação?)

| pergunta | resposta | veredito |
|---|---|---|
| «Quem levou o livro?» (T3, a Margarida) | *«Não sei… tem um sujeito de luvas cinzentas batendo de venda em venda»* | **verdade** (é a premissa e a linha «A MÃO DELE») |
| «Está mentindo?» (T4, Intuição 18) | *«ela quer que você siga Anselmo»* | **imaginação**: o envelope era o genérico *«Revele UMA coisa concreta»* |
| «Você conhecia o Tobias?» (T8) | um «nunca vi» e a pista do Terreiro Rouco | **plausível**: o lugar existe, a ligação foi inventada |
| «Sinto alguma magia?» (T11) | *«nada de formigamento»* | **imaginação** (não houve teste) |
| «De quem são os nomes? Tem o Tobias?» (T20) | **sim/não do oráculo** (58%, saiu 71: «NÃO, MAS»), mais uma lista de dívidas de sangue | **oráculo e imaginação**: a pergunta aberta foi outra vez reduzida a sim/não |
| «O que eu sei do Forte de Gelo Fundo?» (T24, Saberes 13) | *«Ribeira das Areias: capital de Taverna do Sino Rachado, Largo dos Tropeiros…»* | **verdade com o objeto errado**, um sucesso que não serve |
| o mapa: «quem anda lá?» | *«Arqueiros furtivos dos bosques e lobos»* | **verdade, e cumprida** na masmorra |
| o quarto na estalagem | *«pagar quarto comum (◉ 6)»* | **verdade** (vem da tabela) |
| «Quem pagou vocês?» (T33, o arqueiro preso) | *«O sujeito das luvas cinzentas… trancou o portão do fundo»*, em 62 palavras | **verdade** (bate com o fio do vilão) |

**Contagem: 5 verdades, 1 oráculo, 4 respostas plausíveis ou inventadas e 1 verdade sobre a coisa errada.** O padrão é o da 18.ª: há verdade onde há tabela ou fio (preço, mapa, vilão) e há invenção onde há pergunta aberta ou sucesso sem facto.

## 4. O que cada fase nova fez na tela

**MC1–3 · o chamado.** Funciona, e o jogo mudou por causa dele (secção 2). Mas o preço não está onde está o dedo: a bandeja mostra só a perícia e o número, e o *«Se falhar…»* vem na linha da página, que no T2 ficou **abaixo da dobra**. Para o ler tive de rolar a página. Na luta o mesmo gesto tem outra cara: *«Teste de Medicina · dif. 16 — estancar · Rolar d20 (+2)»* vem sem preço e com CD 16, quando fora da luta o mesmo «estancar» pediu 13. São **duas formas para a mesma ação**. Na masmorra, «Procurar nesta sala» rola logo: *«Busca: d20=1+2=3 · nada além de poeira»* aparece sem chamado e sem toque. A Sorte pequena do Halfling (o 1 natural vira 2) não se aplicou.

**MC4 · o sucesso dá um facto.** Só se aplica a **vasculhar e lembrar**. Dos 10 sucessos, 3 trouxeram facto do sistema: o alçapão com 64 moedas (T10), a carcereira apaixonada (T15) e a cidade errada (T24). Os **outros 6** (Intuição, Medicina ×2, Prestidigitação ×2 e Furtividade) ainda vieram com *«Revele UMA coisa concreta e útil… algo que já existia na cena»*, e foi nesse vazio que o Narrador escreveu a sessão (defeito 1).

**MC5 · a quest manda.** O primeiro passo andou bem: *«✓ Ouvir Margarida»* apareceu logo a seguir à conversa. O segundo, *«Saber onde quem lê o livro à noite guarda o livro»*, **não tinha segredo plantado em lado nenhum que eu visitasse**. O RUMO do sistema disse quatro vezes *«Cadeia do Pelourinho: o que lá se esconde tem dono»*, e a busca bem-sucedida na Cadeia respondeu *«não há esconderijo»*. O passo acabou por avançar para *«Tirar o livro das mãos de quem lê o livro à noite»* **depois de o Narrador inventar o fólio** (defeito 2).

**MC6 · o Mestre pede onde há o que achar.** A oferta de Percepção apareceu duas vezes, ao chegar ao Largo e ao Terreiro, e a do Terreiro tinha mesmo coisa: alçapão e 64 moedas. Bom. Mas o Narrador escreveu *«O fundo sob o alçapão está vazio»* com as moedas já na bolsa (leu à letra o *«este esconderijo agora está VAZIO»* do envelope).

**MC7 · a alcunha.** **0 vezes em 44 pautas e em 44 narrações**, contra 25 em 33 na 18.ª. Ninguém chamou nome nenhum à heroína. Ressalva: o vilão nunca entrou em cena, por isso o «só com ele» não chegou a ser posto à prova.

**MC8 · o veredito antes de partir.** Cumpre. O mapa mostra *«DIFÍCIL · a estrada: perigo médio · Acima de você: sem plano, terreno ou ajuda, é onde se morre»* antes do Partir, igual na partida e igual no chip *«Entrar · ● Difícil»*. A régua é uma só. Ficam dois reparos: os números de bastidor estão à vista (*«179 de poder (você 118 + 1 no grupo) contra 354 — 2.0×»*), e o «Difícil» exagerou, porque a heroína ganhou três lutas sem perder um PV. Quem caiu foi a Brunilda, e o chefe fugiu com 2 PV.

**MC9 · o cativeiro.** Não aconteceu, porque não perdi nenhuma luta.

**MC10 · socorrer quem caiu.** O teste existe, dentro e fora da luta, e a falha cobra (*«o curativo não segura e a hemorragia recomeça pior»*). Mas **o estado do caído não existe para o jogador**: a Brunilda a 0/12 PV fala (*«Vai me deixar sangrar até o osso…»*), não há testes de morte à vista, e o 20 natural em Medicina não deu envelope de «estabilizada». A pauta seguinte continua a dizer *«0/12 PV»*.

**EM2 · o tamanho da resposta.** Não pegou. Nas respostas com *«em 10 a 60 palavras»* a mediana foi de **177** (nenhuma de 5 dentro). Com *«até 80»*, de **86** (3 de 9 dentro). Sem instrução (testes, viagem, luta), de 196. A da lareira teve 435. O `maxTokens` do pedido foi **800 em todas**, sem baixar nunca.

**EM3 · saber comum.** Falhou o único caso puro: *«o que eu sei do Forte»*, um lugar a 4 h, no mapa e no primeiro parágrafo da campanha, pediu Saberes 13.

**EM4 · a falha por pouco.** Pegou numa perícia e não pegou noutra. No T19 (Atletismo, faltou 1) a tela disse *«Faltaram 1 — e por tão pouco o mundo negocia: cede, mas cede alto»*, e é um momento muito bom. Só que o oráculo do mesmo turno (*«alguém ouviu? NÃO, MAS…»*) anulou o preço. No T5 (Furtividade, faltou 1) o envelope foi *«NÃO entrega meia-informação»*. Houve «nada» em 2 de 7 falhas (T2 e a busca da masmorra), contra a régua de no máximo 10%.

**A prosa, as ofertas e o encontro.** As ofertas com veredito (*«Recusar / Perguntar / Aceitar… · 5 min»*) e o painel do encontro (*«Contornar · Sobrevivência · CD 15 · 2 h · 30% · se falhar: fui visto, e a luta vem direita a mim»*, *«Negociar · 65% · ◉ 16»*, *«Voltar atrás · 50%»*) são as melhores peças da sessão: decisão com preço antes do clique, como manda a lei. Dormir também se resolve pela frase: *«Pago um quarto… e durmo até o dia raiar»* deu *«Dormir · uma noite · PV e PM cheios · pagar quarto comum (◉ 6)»* (o defeito 12 da 18.ª está corrigido). A forma de cena *«cena calma, uma coisa fora do lugar»* deu a maçã polida no cepo da cadeia, que é Matt puro.

**A luta.** O ataque furtivo saído da sombra mata o lobo num golpe, e vem a pergunta *«O último golpe é teu · Poupar / Matar»*. O contra-ataque aparece como reação («na mesma batida»). A intenção dos inimigos lê-se (*«3–12 → Brunilda do Moinho»*). O que **atrapalhou**: o aviso *«Arqueiro Furtivo dos Bosques cai · poupado · matar»* fica por cima das casas C8 a E8 e engole o toque, de modo que o Mover arma e desarma sem mexer. Provei-o com `elementFromPoint`, que devolve o SPAN do aviso, e só consegui mexer com um evento direto na casa.

## 5. Os defeitos, por gravidade

### Graves (mudam o que o jogador vive)

1. **O sucesso ainda é uma página em branco para o Narrador.** Em 6 de 10 sucessos o envelope foi o antigo *«Revele UMA coisa concreta e útil»*, e o Narrador encheu-o: com **o clímax do mistério** (T18: um teste de gazua num baú devolveu *«o canto carcomido de um fólio com o selo de cera que Margarida usava»* e *«o par de luvas cinzentas»*, e o baú desapareceu); com **um objeto** (T16: *«a chave mestra de ferro forjado»*, que o sistema não deu e que no turno seguinte entrou no **CÂNONE como artefato**); com **pistas** (*«o nome de Anselmo como fiador»*, T16; *«uma cunha de madeira… bota fina de montaria»*, T34); e com **custos em sucessos** (T16 *«Mas o movimento cobra o seu quinhão»*; T30 *«passar despercebido tem o seu preço»*). *Hipótese:* `oFactoDoSucesso` (MC4) só cobre vasculhar e lembrar, e Intuição, Prestidigitação, Medicina e Furtividade caem no envelope antigo.
2. **A quest seguiu o Narrador, e dois órgãos contradizem-se.** O RUMO repetiu quatro vezes (i=20, 22, 24, 25) *«Cadeia do Pelourinho: o que lá se esconde tem dono, e o dono já pergunta pelo herói»*. Na Cadeia, a busca com sucesso (T15, 15 contra 13) disse *«não há esconderijo, mas há o rasto… a carcereira está apaixonado sem retorno»*. O livro só apareceu porque o Narrador o pôs debaixo de uma laje (T18), e o passo avançou a seguir (T24). **Sucessos vazios no passo: 1, contra uma régua de 0.** E o passo foi resolvido pela imaginação. *Hipótese:* o passo *«Saber onde X guarda Y»* não planta Y num lugar, e o canal que avança o passo lê a narração.
3. **A escuta erra o verbo, e com uma negação quase me mata.** *«Não entro de sola. Me agacho… vigiando a entrada»* deu o chip **«Entrar em Forte Abandonado · ● Difícil»** (T28a). A lista completa das frases mal ouvidas: *«Seguimos para a Cadeia do Pelourinho»* deu *«DESTINO NÃO RECONHECIDO»*, com a Cadeia na lista de locais (T13); *«examino a guarita com cuidado»* deu «Ir até a guarita» (T15a); *«desço… e desarmo o que achar»* deu «Ir até as celas», e o desarmar perdeu-se (T17); *«Vou até a banca de couros»* deu DESTINO NÃO RECONHECIDO (T3); *«Enquanto espero»* deu «Esperar» (T4a). Os chips com «Reescrever» salvaram quatro destes casos, mas cada um custa um gesto e quebra o ritmo.
4. **Saberes responde sobre outra coisa.** *«O que eu sei do Forte Abandonado de Gelo Fundo?»* deu 13 contra 13, SUCESSO, e um facto sobre Ribeira das Areias, a cidade onde a heroína está (T24). É sucesso sem valor nenhum, e no assunto que a pessoa mais pediu.
5. **A mesa engole o gesto sem avisar.** Uma oferta de dado pendente engole o Enter da caixa (T9a), e o aviso do «poupado» engole o toque na grelha (luta 3). É a família do Empurrar da 18.ª: o jogador fez, e nada aconteceu, sem saber porquê.

### Médios

6. **O aviso nem sempre é o que se cobra.** No T5 o aviso foi *«a multidão se abre e ele vê você»*. O cobrado foi *«errou para o lado de perto»*, mais um oráculo (*«alguém viu? SIM»*), e foi outro homem que me travou. No mesmo turno, o envelope do CUSTO pede uma consequência e o do TESTE diz *«sem custo extra, só a ausência»*.
7. **O socorro não tem estado.** A companheira a 0 PV fala e não há testes de morte; o 20 natural não estabiliza na pauta (secção 4, MC10).
8. **O dado muda de forma conforme o sítio.** Fora da luta há bandeja e aviso; na luta, *«dif. 16»* sem aviso; na masmorra, a rolagem vem direta; no encontro, *«Negociar · 65%»* não mostra dado nem chega à pauta (i=52: os soldados *«somem»*, e só se vê o veto *«fazer Soldado voltar a aparecer»*). São quatro formas para «rolo um teste».
9. **O achado e a narração divergem**: 64 moedas na bolsa e *«o fundo… está vazio»* (T10). A fala do jogador é engolida: *«"Fala, Isolda. Você conhecia o Tobias?"»* deu *«esperando uma resposta que você não dá»* (T7).
10. **O tamanho da resposta** (EM2), na secção 4. A latência sobe: 7,1 s de mediana e 22 s de pico.
11. **O elenco cola-se à heroína.** A Isolda já estava no Terreiro antes de mim. A Beatriz (mercadora da fila do portão) aparece na taverna, recebe o pagamento do quarto, entra no quarto ao amanhecer, viaja até ao forte e está **«EM CENA» no forte segundo o próprio sistema**. Ao Partir houve **duas narrações no mesmo segundo** (i=48 e i=49), e a primeira põe a Beatriz no forte antes da viagem.
12. **Origem e ofício não pesam.** A Herborista falhou em reconhecer as ervas e tratou com tanchagem sem vantagem nenhuma. O 1 natural do Halfling não virou 2.

### Leves

13. **Nomes:** três Brunildas (do Moinho, da Torre Rachada, Perna-Torta) mais a Isolda do Moinho; Heloísa Pé-de-Lama vira Godiva Pé-de-Lama; *«tiene dono»* (castelhano); *«a carcereira… está apaixonado»*, *«o carcereiro»*; *«me encara»* (primeira pessoa); *«Margarida (campeão local)»*.
14. **O bastidor à vista ou trocado:** *«A APOSTA: ler a intenção na mesa de jogo»*; *«PAUTA DO TURNO 28»* repetida em três chamadas; *«O grupo está gasto»* no turno 1 com tudo cheio; *«quatro pontos de vigor»* na prosa; o poder em números no mapa; a iniciativa listada como 8 contra 15 e a heroína a agir primeiro; o aviso *«alguém na rua vê você»* no ermo.
15. **O Mover** alterna: tocar no verbo já armado desarma-o (custou-me duas tentativas). **O Léxico** ainda leva 55,9 s.

## 6. O veredito: isto já é um jogo?

**Fora da luta, agora sim: é um jogo de dados.** Em 34 turnos rolei 17 vezes, com 8 perícias, e quase todas as rolagens nasceram do que escrevi. Escalei, caí e sangrei; segui um homem, falhei por um e fui travada; cortei um molho de chaves de cima de uma mesa; tentei acalmar um mastim, e ele mostrou os dentes. É o salto mais claro desde a 13.ª, e a ordem de 04/11 (*«constantes rolagens pra ter o sentimento que você está jogando e arriscando algo»*) está cumprida no que o jogador sente.

**O que prende:**
- o chamado com o aviso concreto e o d20 à espera;
- as quedas com salvaguarda e dano à vista;
- o painel do encontro e as ofertas com veredito;
- o *«Faltaram 1 — e por tão pouco o mundo negocia»*;
- o furtivo que mata num golpe e o «Poupar / Matar»;
- a maçã polida no cepo;
- dormir dito por frase, com preço;
- o nome do vilão calado.

**O que ainda é um sistema a fingir de jogo:**
- o dado decide **se**, mas o Narrador decide **o quê** em 6 de cada 10 sucessos;
- o mistério foi resolvido por um teste de gazua num baú que não existia;
- a quest, o rumo e a busca dizem três coisas diferentes, e ganha quem escreve;
- a negação e o «examino» ainda são lidos como deslocação;
- a companheira morre e fala ao mesmo tempo.

**Um Mestre à Matt Mercer?** **Metade.** O Matt já estaria aqui no **quando**: pede Furtividade para seguir, Atletismo para saltar, Medicina para estancar e Intuição para ler a mentira. Esta mesa pediu exatamente isso. No **o quê** ainda não. O Matt nunca deixaria um teste de gazua revelar o culpado, porque o segredo dele está escrito antes da sessão, num sítio. Aqui o segredo é escrito na hora por quem narra.

**As três coisas que mais mudariam a próxima sessão:**
1. **Todo sucesso sai de uma tabela.** Intuição devolve o que a pessoa quer ou esconde, segundo o registo dela. Prestidigitação põe o objeto na bolsa pelo sistema (ou diz que não estava lá). Medicina muda o estado do corpo (estabilizada, +PV). Furtividade devolve uma posição. O envelope *«Revele UMA coisa»* desaparece de vez, e um sucesso sem facto vira «o caminho fica livre», nunca «invente».
2. **O segredo do passo tem morada**, e só o sistema a revela. O RUMO aponta para onde o segredo está, a busca lá encontra-o, e o Narrador fica proibido de pôr objeto ou pista da quest (uma linha no NÃO PODE). O passo avança por facto do sistema, nunca pela narração.
3. **Uma forma só para «rolo um teste»**: a mesma bandeja, com o aviso, dentro e fora da luta, na masmorra e no encontro, e com a mesma CD para o mesmo gesto.

**A proposta ambiciosa (para a pessoa decidir): *«O quadro do mistério.»*** No arco Mistério em Camadas, a mesa ganha à vista um quadro de cortiça com o caso. Lá está a pergunta (*«Quem lê o livro de Margarida à noite?»*) e **três a cinco cartas de pista viradas para baixo**, cada uma com a forma do que esconde (um lugar, uma pessoa, um objeto) mas sem o conteúdo. Cada sucesso que o sistema resolve vira uma carta, com som, peso e o nome de onde veio. O passo só anda quando as cartas certas estão viradas. As falhas por pouco viram meia carta (uma linha legível, outra riscada). O jogador vê a forma do caso a encher-se e sabe que há mais por achar, como o Matt quando diz *«you have two of the three pieces»*. A regra quase não muda (os passos da BQ e o `oFactoDoSucesso` da MC4 já existem): muda o **momento**, porque o sucesso passa a deixar coisa na mesa, e muda a **autoria**, porque o Narrador deixa de poder resolver o mistério. É peso `pesado`: é uma peça nova da tela principal (é preciso pedi-la ao `desenho`) e muda o que o jogador faz num arco inteiro.

## 7. Onde olhar

- A tabela por chamada (hora, latência, `uso`, custo, palavras e envelopes de cada pauta): `C:\Users\clara\AppData\Local\Temp\claude\d5096f640d890ce8\953734d9-f48f-4ab6-9fdf-7529c9232286\scratchpad\s19\registo-s19.csv`. As notas turno a turno, com as frases exatas: `C:\Users\clara\AppData\Local\Temp\claude\d5096f640d890ce8\953734d9-f48f-4ab6-9fdf-7529c9232286\scratchpad\s19\notas.md`. O localStorage de antes: `…\s19\localStorage-antes.json`.
- Os turnos dos defeitos, pelo índice `i` da tabela: o furto sem dado em i=4; os sucessos com envelope genérico em i=8, 15, 30, 33, 53 e 73; o fólio inventado em i=33; a chave no cânone em i=33 e 34; o RUMO contra a busca em i=20–25 contra i=29; a Saberes errada em i=42; a falha por um sem meia-verdade em i=10; a falha por um com preço em i=34; as duas narrações no Partir em i=48 e 49; a negociação muda em i=52; o socorro em i=70 e 73.
- A 18.ª: `mente/sessao-18.md` (a régua dos dados, a alcunha e o custo por resposta).
