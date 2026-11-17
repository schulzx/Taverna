# As peças: Fase A, a prova em Node

**17/11/2026.** Esta é a prova que a pessoa aprovou para a arquitetura de `as-pecas.md`. Tudo o que
foi feito é arquivo novo. Nenhum arquivo existente foi editado, não houve IA, navegador nem servidor.

| arquivo | o que é |
|---|---|
| `src/pecas/moldes.js` | `MOLDE_DO_FATO` (os 12 predicados + `encontrou`, que o clímax exige), `FAMILIA_DA_ACAO`, `ACOES_SEM_CATALOGO` (lutar, fugir, capturar, pagar, trocar, escolher), `VANTAGEM_DA_SETA`, `numeroDaSolucao`, `problemasDoMolde` |
| `src/pecas/peca.js` | `aPecaDaEtapa`, `aPecaDoMolde`, `faltamNaEtapa`, `aCenaDaPeca`, `fechaComMoldes`, `PISTA_DA_ACAO` |
| `src/pecas/excecoes-da-prova.js` | as exceções da quest de abertura, no formato do campo opcional `pecas` |
| `src/pecas/encaixe.js` | `encaixar` → solução / aquecimento / livre; `SAIDAS_LIVRES`, `VERBOS_DA_PECA`, `PALAVRAS_DO_CALOR` |
| `src/pecas/calor.js` | `CALOR_DAS_PECAS`, `RELOGIO_DAS_PECAS`, `PRECO_DO_RELOGIO`, `aquecer`, `bonusDoCalor`, `oMundoCobra`, a memória `estado.pecas` |
| `src/pecas/andar.js` | `resolver`, `escreverFato`, `oQueONarradorRecebe` |
| `src/pecas/a-prova.js` | o mundo da prova, os três jogadores-roteiro, a medida do corpus e a da cobertura |
| `testes/teste-pecas-{moldes,peca,encaixe,calor,quest-da-prova}.mjs` | 44 + 49 + 38 + 34 + 55 asserções, todas verdes |

## 1. O encaixe no corpus (as 439 frases reais)

Cada frase foi testada contra a peça de cada etapa com dado da quest da prova: **ver** (no curral, com
a pastora), **rasto** (no curral) e **fera** (na toca, com o tratador e a besta). São 1317 encaixes.
A etapa **destino** é a carta de escolha e fica de fora: nela nenhuma frase vira solução.

Os nomes próprios do corpus são de outras campanhas. Por isso há duas leituras. Na **principal**, o nome
que a cena não conhece não conta como ninguém (é a frase transplantada para esta cena). Na **estrita**,
quem existe e não está aqui não aquece ninguém (a lista `conhecidos` do corpus).

| | solução | aquecimento que aquece ≥ 1 | aquecimento frio (não aquece nada) | livre | sem nada |
|---|---|---|---|---|---|
| **as três peças, principal** | **131** (9,9%) | **486** (36,9%) | **114** (8,7%) | **586** (44,5%) | **0** |
| ver | 42 | 152 | 50 | 195 | 0 |
| rasto | 59 | 161 | 29 | 190 | 0 |
| fera | 30 | 173 | 35 | 201 | 0 |
| as três, estrita | 86 | 234 | 388 | 609 | 0 |
| controlo: a peça-molde de 10 factos (4390 encaixes) | 243 | 1394 | 735 | 2018 | 0 |

O resultado de cada frase pelo rótulo do corpus (principal): os 88 **mover** dão 233 livres, 22
soluções e 6 frios. As 187 **conversa** dão 11 soluções, 164 livres, 354 aquecimentos que aquecem e
32 frios. Nos testes de **buscar/investigar/rastrear/lembrar**, a solução ganha com folga
(20/36, 20/30, 10/15, 10/15).

**Exemplos, de 40 em 40** (o 1.º, o 41.º, o 81.º… de cada lista. Não são os melhores):

- *solução* (só há 131, logo saem 4): «Cruzo os braços e sorrio para o Teodoro…» → `vizinhos@curral`
  (falso: a frase leva uma fala com pedido, e a família social encaixou); «Examino o rastro no chão.» →
  `ler@curral`; «O que sei de Alto Negro, da Agulha, de bichos assim?» → `lembrar@curral` (rasto) e
  `ler@tratador` (fera: «ler» é a ação `mentira`, da família «saber». Isto é um falso encaixe).
- *aquecimento*: «Abro a trouxa… pergunto: "Que língua…"» → aquece `vizinhos@curral`; «Respondo a
  Hakon…» → `vizinhos`; «fico em silêncio… olho as mãos de Lia» → `ler`, `revistar`; «Sento diante de
  Perrin e peço que conte tudo» → `vizinhos`; no rasto → `convencer@toca`, `perguntar@curral`
  (quatro vezes); «Falo com Drogo» → idem; na fera → `convencer@tratador`, `fazer_falar@tratador`.
- *livre*: «Sigo pela rua principal e pergunto ao menino…» (ir); «Pago a cerveja e pergunto baixo…»
  (comércio); «descemos juntos… em direção à voz» (ir); «Volto ao posto…» (ir); «sigo… até Nova
  Profundo» (ir); «saio do Sino Calado e vou à ferraria» (ir); «Não vou ao homem ainda. Sento na
  margem… pergunto a Hakon» (ir: **falso**, porque a frase nega); «saio com Jaco… para Sul Molhado»
  (ir); «espero até a gnoma aparecer» (espera); «quanto custa cada ração» (comércio).

**20 aquecimentos frios, com a leitura** (as razões, nas três peças: nada aponta / conversa 27,
família sem solução / ataque 14, nada aponta / livre 12, estancar 12, arrebentar 9):

1. «Passo a tocha… avanço sobre a coisa que se mexeu»: **o catálogo não leu** o ataque (avançar sobre).
2. «Inês entra na luta aberta: Atacar; erra; cai a 0 PV»: é log de combate, não frase de jogador.
3. «meu plano é ouvir tudo… a quem ela jurou»: intenção sem gesto. Nada aponta, e está certo.
4. «Não aceito o álibi, Petra…»: fala com quem não está. Na leitura principal o nome some, e a frase não tem palavra de conversa que aponte.
5. «Respondo que viemos falar com Nyla… Sigo com Saoirse»: **ir com companhia**, que o rx de ir não pega.
6. «Respondo a verdade: escrevi uma canção… Mostro a carta»: a família da arte, sem solução de arte nesta etapa.
7. «Rezo a Cura Leve»: **magia**. O molde não tem ação de magia.
8. «Arrebento as amarras»: **ação de cena sem solução** (arrebentar), um teste legítimo do catálogo.
9. «Pressiono o ferimento de Elowen com um pano»: **estancar**, o socorro de um companheiro. Teste legítimo, fora da etapa.
10. «Forço os pulsos contra as raízes…»: arrebentar, como em 8.
11. (rasto) o mesmo «avanço sobre a coisa», como em 1.
12. «Fico em guarda… deixo que ele venha»: postura de luta sem alvo da peça. Não há luta no rasto.
13. «Saco a arma e ataco Falk, o recruta»: **ataque a alvo fora da cena**. Está certo como frio.
14. (rasto) «viemos falar com Nyla…», como em 5.
15. «puxo o trinco do alçapão»: **gesto livre sem obstáculo**. O catálogo diz «livre», e a peça o põe no aquecimento.
16. «Faço um torniquete na perna de Elowen»: estancar, como em 9.
17. (fera) «Leio os cartazes do mural»: ler um sítio que não está nesta cena.
18. «toco o primeiro verso a Ambrósio»: arte (atuar), sem solução de arte na fera.
19. «Chega de mentir: diga o que é essa canção»: um fazer_falar dirigido a quem não está.
20. «Não aceito o álibi, Petra…», como em 4.

## 2. A cobertura dos moldes nas 214 etapas

Só com os moldes, sem nenhuma exceção escrita, e sobre um estado vazio:

- **213 de 214** etapas recebem uma peça válida. Dessas, **57 são cartas de escolha** (`escolheu`, sem dado).
- **0** etapas com dado ficam com menos de 3 soluções que fecham.
- **1 não fecha**: `o_convite_sem_selo / saida`, cujo `conclui` é só `["nenhum", ["esta_em", "lugar:salao"]]`
  (sair do salão). É um veto, sem facto a escrever. Ela fecha pela porta «ir», portanto sem dado.
- Os factos que as peças pedem: escolheu 188, conversou 92, esteve 50, acompanha 37, derrotou 37,
  encontrou 34 (o clímax), descobriu 27, afeição 19, consultou 18, esta_em 14, conheceu 13, tem 8.

## 3. Os três jogadores-roteiro na quest da prova

O dado vem da semente (hash), sem `Math.random`. Na tabela, «dados» são as rolagens feitas,
«com preço» são as rolagens com seta ou preço à espera, e «preços» são os pagos.

| | turnos | ver | rasto | fera | destino | preços pagos | o mundo cobrou |
|---|---|---|---|---|---|---|---|
| **direto** | 4 | 1 dado (1 com preço) | 2 (2) | 1 (1): a besta morre e a quest fecha ali (variante «matou») | — | 0 | 0 |
| **conversador** | 63 | 18 t, 1 dado imposto | 27 t, 2 impostos | 18 t, 1 imposto | — (matou) | 10 (tempo, incompleta, alerta) | 7 |
| **azarado** | 12 | 2 dados, 1 preço | 3, 2 preços | 6, 2 preços (perde a luta, o encontro fica escrito, fecha pelo assobio) | carta | 5 (incompleta, tempo, alerta, alerta, cobra) | 0 |

Nos três: toda etapa fecha por um facto que o sistema escreveu (dado, oferta, imposição ou carta).
Nenhuma etapa com dado fecha sem dado, e todo dado tem preço à espera. O conversador nunca acionou
uma solução pela frase: foram 56 aquecimentos. O calor abriu soluções e o relógio encheu nas três
etapas. A segunda cobrança impôs a forçada, e foi isso que o soltou. Ele não ficou preso.

## 4. O que tive de decidir sem a pessoa dizer

1. **Chegar ao lugar não escreve `esteve`** na peça: a solução é que o escreve, e o «ir» só põe o herói
   na cena. A alternativa era o livro de hoje (a chegada escreve), que faria «ver» fechar sem dado.
   *Risco da fase B*: o `anotarTurno` escreve `esteve` ao chegar.
2. **`pelo_menos` é combinador**: o molde dele é a junção dos moldes dos filhos. **`encontrou`** ganhou
   molde (o confronto do covil, `ESCOLHAS_DO_CONFRONTO`), porque o clímax o exige.
3. **Perder a luta contra a besta escreve `encontrou`, com o preço «alerta».** Sem isto o azarado ficava
   preso na fera para sempre. `derrotou` continua a só se escrever vencendo.
4. **Toda falha queima a solução** (a lei do catálogo: «a mesma via não volta a rolar»). A cobrança do
   relógio reabre tudo, pior.
5. **O pior tem teto** (dois degraus da situação, +4). **À segunda cobrança o mundo impõe a forçada**, e a
   forçada prefere a solução que escreve nas duas faces. É a garantia de «nunca preso». Sem teto, o
   conversador ficou 300 turnos preso: a CD subia além do d20.
6. **A família encaixa quando a ação exata não está**: «convencer» e «fazer falar» são a mesma conversa.
   A luta, a fuga e a troca não entram nesta regra. Alternativa: só a ação exata, o que dava muito mais
   frios.
7. **O nome vence.** Se a frase nomeia um alvo da cena, só as soluções dele contam. Uma frase sem nome
   que cabe em dois alvos aquece os dois (`duas`).
8. **O número do dado é o do molde** (a CD padrão do catálogo, ou a do encontro pela ameaça), e não a
   CD social que `lerAcao` calcula (esta vai em `dcDoCatalogo`). Assim a peça fica determinística e
   independente do texto.
9. **A ordem**: primeiro a solução que já se aciona, depois a saída livre, depois o aquecimento.
   Quem diz «vou à toca e procuro rastos» vai primeiro.
10. **«Pagar a conta» é do balcão** (livre), e o suborno é um verbo da peça («pago a X para…»).
11. **O preço não é conferido contra a `forma` do quadro**: «alerta» num objeto quer dizer «alguém viu».
12. **A cena fechada** é o `quemEstaAqui`/`quemAgeAqui`, mais a pessoa do papel cujo `local` é este
    sítio, mais a besta só no covil do clímax. Quem é do vilão e não foi visto entra pela alcunha.
13. **Os números**: `cheio` 3 (a régua de 04/11: um dado a cada 2–3 turnos), um passo a mais pelo nome,
    bónus até +2 (o teto da emboscada), relógio de 8/7/6/5 conforme a temperatura (8 = 2 × cheio + 2
    na brasa).

## 5. O que não coube

- A medida **«verdade»** (os nomes fora da lista em 40 respostas) precisa da sessão jogada, que é fase B.
  O `oQueONarradorRecebe` já entrega o `podeCitar`.
- A **poda** dos nomes fora da lista e a ligação ao turno do App.
- As exceções das outras 51 quests (só a da prova tem). A pontuação das pistas: o nome entra cru,
  e sai «de O Armazém», sem a contração da biblioteca, que não é exportada.
- Não houve teste de jogo: a pergunta «pareceu mesa ou trilho» só se responde jogando.

## 6. Os furos que a medida mostrou

1. **Ações de cena legítimas viram aquecimento frio**: estancar o sangue de um companheiro, arrebentar
   as amarras, rezar uma magia. A regra «só dois estados» engole testes que não são da etapa.
   **Proposta**: um 4.º resultado, ou um subtipo do livre, o «teste de cena», que rola como hoje e não
   gasta o relógio.
2. **O livre é largo demais** (44,5%). Frases compostas «vou até X e pergunto Y» saem pela porta de ir,
   e a conversa perde-se (164 das 187 conversas). Além disso, o rx de ir não conhece a negação («Não vou
   ao homem ainda…»). Isto pede a leitura por oração (a peneira `soODeclarado`), não por frase.
3. **A conversa raramente é solução** (11 em 187). Por desenho, ela vira solução pelo calor (3 frases).
   Isso só se valida jogando: se três turnos de conversa antes do dado parecerem lentos, `cheio` baixa
   para 2.
4. **Alvo por descrição**: «o tratador» não é descrição que o catálogo leia (`alvoDescrito` só conhece
   alguns ofícios), e a frase cai em quem está na cena. A suíte regista isto.
5. **Falsos encaixes pela família**: «O que sei de…» na fera virou `ler@tratador` (a ação `mentira`
   está na família «saber»). Ler a pessoa e lembrar um saber deviam ser famílias diferentes.
6. Uma etapa da biblioteca fecha **só por veto** (`saida`, «sair do salão»): na peça não tem dado.

## 7. O que a fase B precisa (a quest de abertura, ligada ao jogo)

- **Onde entra cada função** (números de linha de hoje, em `src/App.jsx`):
  - `encaixar` entra em `veredictoDaAcao` (~18700), antes do `lerAcao`. Com uma `solucao`, a peça dá
    a CD e o chamado sai pela mesma porta (`ctxDoChamado` / `oChamado`, ~19397). Com `aquecimento`,
    corre `aquecer` e a pista vai ao Narrador. Com `livre`, o turno de hoje.
  - `resolver` entra em `concluirRolagem` (~17582), onde hoje correm `aCartaDoTeste`/`virarCarta`
    (~17844). O preço vai pela mesma `aplicarPrecoDoQuadro`.
  - `oMundoCobra` corre no começo do turno, e `avancarQuest` pela de sempre, `correrAsQuests` (~7621,
    `oTurnoDasQuests`).
  - `oQueONarradorRecebe` entra em `src/motor/pauta-do-turno.js` (`aPautaDoTurno`) como secção da
    pauta, no lugar do bloco do quadro (`oQuadroNaPauta`). O `podeCitar` vai para `naoPode`, ao avesso.
- **O que sai do pedido ao Narrador** na etapa com peça: a lista do quadro (as cartas de costas e os
  caminhos), a escada do pedido social e a liberdade de escolher quem está. Entra a cena fechada, o
  desfecho já decidido e uma pista.
- **Save**: `estado.pecas` é um campo novo, aditivo e ignorado pela versão antiga. Precisa de ref, save e load.
- **Riscos**:
  1. o `anotarTurno` escreve `esteve` ao chegar (decisão 1);
  2. o quadro e a peça podem escrever o mesmo facto duas vezes: na etapa com peça, o juiz do quadro
     tem de calar;
  3. o furo 1 (testes de cena) aparece no primeiro turno de socorro;
  4. o furo 2 (a frase composta) aparece logo na abertura («vou ao curral e falo com…»).

## 8. A minha leitura

**A arquitetura sustenta-se, mas precisa de dois ajustes antes da fase B.** Por construção, ela prova o
que prometeu: nenhuma etapa fecha sem dado, toda falha leva a outro lado ou cobra, ninguém fica preso
(nem quem só conversa, nem quem falha tudo), e os moldes cobrem 213 das 214 etapas sem uma linha de
autoria. A ligação ao jogo esbarra em dois sítios:

1. a categoria **«teste de cena»**: o catálogo de hoje rola, fora da etapa, sem calor nem relógio;
2. a leitura **por oração**, para a frase composta não fugir pela porta de ir.

Sem estes dois, o jogador vai sentir a parede que a pessoa quis evitar: um em cada dez encaixes é frio,
e quase metade sai pela porta livre.
