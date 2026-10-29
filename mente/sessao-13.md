# A décima terceira sessão de prova — o Juiz fora do corpus, a mesa que fecha o buraco, o boato, e o custo (29/10/2026)

Jogada contra a IA real no dev-server `taverna` (5173), v9.576 (`d947805`), origem limpa (o localStorage estava vazio: nada a restaurar, e foi limpo no fim). Herói novo de Uma Vida, mundo padrão: **«A Estrada do Sal»**, Fantasia medieval, Terras abertas, Jornada do Herói. **Iara**, mulher, humana, Guerreira (Cavaleiro), Mercadora, Órfã da Estrada; companheiro Dunstan (Caçador).

**23 turnos registados, 40 chamadas pagas, US$ 0,268.** Parei aos 23 (o teto era ~30) por dois motivos: a minha história de agente chegou perto dos 200 mil tokens, e **a sessão gravada virou a página no turno 21 e perdeu os 21 primeiros turnos** (defeito 1). O relato abaixo vem das notas que tomei turno a turno, do save exportado (122 mensagens, o `fidelidade` do Juiz com os 23 vereditos, o `custo`) e da página que sobrou.

---

## 1. Os defeitos, por prioridade

| # | prio | turno | o defeito | a prova |
|---|---|---|---|---|
| 1 | **alta** | T21→22 | **A sessão gravada vira a página aos 21 turnos e deita fora os 21.** O teto (`SESSAO_GUARDADA.teto` 600 mil) foi medido a 28/10 com cabeça de 41 mil e turno de 14–15 mil (~40 turnos). Hoje a **cabeça pesa ~96 mil** e o turno **~28 mil**: a página vira à metade do previsto, e a anterior some do localStorage sem aviso nem exportação. O turno que provocou a virada (T22) também não ficou na página nova (0 turnos com a cabeça escrita). | `testes/sessao-s13.json` tem 1 turno (o T23) e cabeça de 126 mil caracteres. O replay só corre esse. |
| 2 | **alta** | T1–T23 | **O Juiz fora do corpus: 18 achados, 2 verdadeiros, 16 falsos (precisão 11%).** As causas são poucas e repetidas (ver §2). | `fidelidade` do save, um a um abaixo. |
| 3 | **alta** | T10–T19 | **O boato chegou 9 turnos depois da chegada, e o Narrador já o tinha decidido sozinho.** Cheguei à Fenda no T10 (luta: `oBoatoDaChegada` sai vazio com `combate`), acampei (T14–16), entrei e perguntei pela luz (T17, T18): nenhuma linha O BOATO. No T18 o Dunstan respondeu da imaginação — «Luz nenhuma… conversa mole de pastor». A linha só entrou no T19 (o botão «Procurar nesta sala»): «MENTIRA: era isca: alguém quis o herói aqui. Mostre, não anuncie.» — e a prosa **anunciou** («o boato do pastor foi só corda para puxar você para longe do burgo»). Calhou bater; com «verdade» no sorteio teria contradito o T18. | pautas T17, T18 (sem a secção), T19 (com ela). Falta saber se foi o corte do teto da pauta ou a porta de `ondeEsta` (verificável em Node com o save exportado). |
| 4 | **alta** | T2–T9 | **O RUMO da batida 1 repete «Corrado… diz ao herói o próprio nome logo que lhe fala» em todo turno**, e o Corrado apresenta-se **quatro vezes** («Sou Corrado», «Eu sou o Corrado», «Eu sou Corrado», «Eu me chamo Corrado»). O rumo não sabe que a apresentação já aconteceu. | pautas T3, T7, T18 («uma coisa só aponta para: Procurar Corrado» até dentro da masmorra). |
| 5 | **alta** | T5–T6 | **O pedido da pauta foi trocado pelo Narrador, e o Cronista canonizou a troca.** O PEDE do Corrado (pauta T2): «meio dia de desvio, uma campa que não visito há seis anos» — dito na prosa por «um sujeito de chapéu de couro». O cartão «Aceitar o que Corrado pede · Corrado conta com você · 5 min» **não diz o que é pedido** (o veredito antes do clique sem o objeto). Aceitei; o Narrador inventou outro pedido (achar um devedor da cota da liça), pôs o Dunstan e um Beraldo a agir fora do ESCOPO do envelope, inventou «a cova úmida do poço fundo» e «os homens do conselho» — e o Cronista gravou **«Tobias»** (o nome do irmão que eu disse) como «devedor da liça, procurado por Corrado». | T6: `cronista.juizo.aceito.canone.Tobias`. O Juiz só apanhou «duas noites». |
| 6 | média | T10–T13 | **Balanço: 3 ratos «fracos» (4 PV cada) deixam a guerreira de 20 PV a 0, «caiu», sangrando**, com teste de morte. Envelopes: 2, 6 (crítico), um aparado, sangria 3/turno. Para a primeira luta de uma heroína nível 1 é a morte por ratos. | T11–T13; save pós-luta `vida 0`, «Sangrando», «−20 PV». |
| 7 | média | T11–T13 | **O gênero da condição ainda escapa num sítio: o percentual do envelope** — «golpe leve (10% da vida **dele**)», «(30% da vida dele)» para a Iara. A frase do desfecho já sai no gênero do alvo (v9.571); esta parte do envelope não. | `entrada.toque.conteudo` dos turnos de luta. |
| 8 | média | T5, T13, T19 | **Gente fantasma de frase na faixa da cena**: «Cão da várzea · sozinha» (o cão da aposta, no feminino), «Cacador da lâmina · você não sabe o nome dele» (era o Dunstan, «limpando a lâmina de caça»), «Bicho de ponta · sozinho» («fende o bicho de ponta a ponta»), «Vulto de tochas», «Vulto de lâminas», «Homem de pele curtida · você não sabe o nome dele» — este é o Balduíno, que a prosa **nomeou**. | a faixa da cena em T5, T13, T19. |
| 9 | média | T16 | **O descanso longo diz «2 rações e 2 águas» e não as cobra**: 10/10 antes, 10/10 depois. | `personagem.suprimentos` antes e depois. |
| 10 | média | T7, T23 | **A mesa responde só à primeira de duas perguntas.** T7: «o poço fundo e a Fenda, quanto tempo?» → só o poço. T23: «prato quente e cama» → só a refeição (◉ 3). O Narrador disse honestamente «não sei» da segunda (o RUMO funciona). | pautas T7, T23. |
| 11 | média | T4, T9 | **A escuta lê a palavra, não a pergunta.** «Quanto custa a sua língua, Corrado?» → «A língua de todo mundo aqui é a comum dos andejos» (idioma). «Tem poção ou unguento para **feridas**?» (com «Corrado» na frase) → «PERGUNTOU Corrado: não traz cicatriz no rosto; o pior… fugiu de Burgo da Prata há 8 anos» — despejado na prosa, e a poção ficou sem resposta (quem vende poção na cidade é buraco da mesa). | pautas T4, T9. |
| 12 | baixa | T14 | A fogueira oferece «Margarida do Forno Velho quer falar com você» — gente de Porto das Pedras, a 4 h. E o painel diz «A NOITE» às 12 h com a faixa «DIA · CHUVA». | painel da fogueira. |
| 13 | baixa | T15 | À fogueira só há «Dormir»: o Osric entrega o melhor momento da sessão e o jogador não lhe pode responder. | botões depois do T15. |
| 14 | baixa | T11 | Atrito na grade: «Agir →» desativado sem dizer porquê quando o alvo está a 3 m; «Rato Gigante 1 **(12)** cai» com o número sem rótulo; Poupar/Matar oferecido para um rato e uma víbora; o registo da luta só lista os golpes da heroína, não os que ela levou. | texto da grade. |
| 15 | baixa | T17 | A pauta escreve «(aqui isto é **um** ruína selada)»; a prosa chama «forte soterrado» à Fenda que o mapa diz caverna. A faca do Osric («guardo comigo») não entrou no inventário. | pauta T17. |

---

## 2. O Juiz fora do corpus

**23 turnos julgados: 13 limpos, 18 achados** (preço 7, distância 7, pessoa 1, pauta 3). Rotulei cada um a olho de mesa:

| turno | achado | rótulo |
|---|---|---|
| T1 | «ensopado de nabo custa 2 estalos» — mesa sem refeição | **verdadeiro** (a mesa disse ◉ 3 no T23) |
| T1 | «quinze moedas de prata» como preço de comida | falso: é a **bolsa** da heroína (15) |
| T2 | «36» contra «◉ 6 quarto comum» | falso: a própria pauta dá «◉ 36 a semana» |
| T2 | «Largo da Liça 8 h» contra «meio dia de desvio» | falso: «meio dia de desvio» é a fala do PEDE da pauta; e o Largo fica na cidade |
| T2 | pauta: horário do Corrado esquecido | falso: «desde as oito… até as seis… folga um dia» (paráfrase) |
| T3 | «meia dúzia de pratas furadas» → «nenhum valor da mesa é 12» | falso: figura de fala (e meia dúzia são 6) |
| T6 | «faz duas noites» — o sistema não sabe | **verdadeiro** (menor) |
| T7 | «uma hora e **vinte**» lido como **preço 20** | falso |
| T7 | «5 km», «1 hora» — «o mapa não deu distância neste turno» | falso: a pauta deu «PERGUNTOU distância: o poço fundo (5,2 km, 1,3 h)» |
| T7 | «Fenda, quatro horas» | falso: o mapa diz 4 h |
| T7 | pauta: «diz o próprio nome» esquecido | falso: «Eu me chamo Corrado» |
| T8 | pauta: «não há escudo à venda» esquecido | falso: «escudo não tem nenhum à venda neste burgo» |
| T10, T16 | «quatro horas» de estrada | falso: é o mapa (4 h) |
| T14 | «dois estalos a mais pela cabeça do Tobias» | falso: hipótese de fala |
| T14 | «pessoa: Brumal age em cena» | falso: **Brumal é o mês** («o céu cinzento de Brumal») |
| T23 | «prato quente 3» — «a mesa não deu» | falso: a pauta deu «PERGUNTOU o preço daqui: refeição quente ◉ 3» |

**2 verdadeiros, 16 falsos: precisão 11%.** Os 3 «pedidos esquecidos» são todos falsos: **a pauta cumpriu 10 de 10**, não 7.

**As causas, por ordem de peso (todas no motor, todas de uma tabela de leitura):**
1. **O Juiz não lê as linhas `PERGUNTOU`** («PERGUNTOU distância: …», «PERGUNTOU o preço daqui: …») nem a cauda de `pouso` («◉ 36 a semana») — 6 falsos.
2. **A distância do mapa que a pauta do turno não repetiu** («quatro horas» da Fenda: está no mapa, no boato da abertura, na viagem) — 4 falsos.
3. **Números que não são preço**: a bolsa, «uma hora e vinte», «meia dúzia», a hipótese («dois a mais») — 4 falsos.
4. **O nome do mês como pessoa** — 1.
5. **O pedido cumprido por paráfrase** — 3 (na contagem da pauta).

**O que ele não apanhou** (as invenções que pesam): o pedido trocado e «a cova úmida do poço fundo» (T6, um lugar); «os homens do conselho»; e a verdade do boato decidida pela prosa no T18 — esta última nem tem classe.

**O veto chegou ao Mestre? Não, nenhum, em 23 turnos** (vi a pauta de T3, T5, T7, T8, T9, T17–T19, T23: nenhuma linha `vetoDoJuiz`). Os únicos achados com forma de contradição (T2: 36 contra 6, 8 h contra 0,5 dia) eram **falsos**, logo a ausência foi o resultado certo, mas não sei se foi o filtro (`especieDoAchado`) ou outra coisa: o `resumo` gravado no save não traz as listas por classe, e `vetosDoVeredito` sobre ele dá vazio de qualquer maneira. **Isto fica por provar em Node.** Se o filtro deixasse passar o T2, teria vetado «36» e «meio dia», que estavam certos.

**O eco curou-se?** O único número inventado que tinha verdade depois (o ensopado 2 do T1) **não voltou**: no T23 o Dunstan disse «três estalos», o número da mesa. Quem curou foi **a mesa**, não o veto.

---

## 3. O que entrou hoje, medido numa sessão nova

- **A mesa que fecha o buraco: funciona, e é o melhor do dia.** T2 «quanto custa uma cama?» → «pouso: quarto comum ◉ 6 a noite (◉ 36 a semana), bom ◉ 15, estábulo ◉ 2, 2 camas»; a prosa disse **os cinco números certos**. T8 → «não há escudo à venda em Porto das Pedras» e «a corda: já a carrego no kit», as duas obedecidas. T7 → o poço fundo ganhou distância do sistema (5,2 km, 1,3 h), e a prosa disse «cinco quilômetros e pouco, uma hora e vinte». T23 → refeição ◉ 3, dita certa. Falha: a segunda pergunta da frase (defeito 10) e a poção (11).
- **O boato que se confirma: disparou e foi cumprido, tarde** (defeito 3).
- **O herói novo nasce com o kit: sim.** Espada Longa empunhada, 10 rações, 10 águas, 5 tochas, kit, a faca herdada, 15 moedas. Na primeira luta, 3 golpes de 12, 14 e 8.
- **A luz do gênero:** não a pude julgar: o painel ficou oculto e as capturas de ecrã não saíram (a página não pintava). Sem prova, sem veredito.
- **A frase da condição no gênero do alvo:** o desfecho não teve condição a dizer; o envelope de combate ainda diz «da vida **dele**» para ela (defeito 7). E a prosa acertou o feminino da Iara sempre («você jaz deitada», «Olha ela aí»).

---

## 4. O custo

Do `custo` do save (a conta de `custo.js`, por chamada):

| tarefa | modelo | US$ |
|---|---|---:|
| Narrador | gemini-3.8-flash | 0,2231 |
| Léxico (uma vez, na criação) | gemini-3.8-flash | 0,0241 |
| Cronista («leve») | gemini-3.5-flash-lite | 0,0208 |
| **total, 40 chamadas** | | **0,2680** |

- **Tokens:** entrada 570.445 (dos quais **333.364 lidos do cache**, 58%), escrita de cache 33.608, saída 16.155.
- **Por turno** (23 turnos, sem o Léxico): **US$ 0,0106**, ~24,8 mil de entrada e ~700 de saída. Igual à 12.ª (0,0105). Um turno de conversa custa 0,006–0,010; a luta, 0,005 por rodada (a grade não chama a IA, só a narração); a viagem com emboscada 0,011; o acampamento + a fogueira + o sono, 0,039 juntos.
- **Em reais** (a régua da 12.ª: 5,45 × 1,13 = 6,16): **sessão de hoje R$ 1,65**, **R$ 0,065 por turno**. Uma sessão de 63 turnos: **~US$ 0,67, R$ 4,1**. Em 01/01/2027 o 3.8 Flash dobra (`custo.js`): ~R$ 8.
- **Latência:** 9 a 19 s por turno com resposta (mediana ~11 s).

---

## 5. A qualidade, com olho de mesa

A régua: *um jogador pergunta ao Mestre o que perguntaria ao Matt, e a resposta é verdade?*

- **Preço, pouso, caminho, «tem à venda?»: verdade.** Pela primeira vez as perguntas de mercador saem todas do sistema e a prosa não arredonda nenhum número. É a diferença mais visível contra a 11.ª e a 12.ª.
- **«O que há lá dentro? era verdade?»: imaginação**, durante 9 turnos (defeito 3).
- **«Quem é você? O que você quer de mim?»: confuso.** O Corrado apresenta-se quatro vezes, promete e desdiz, e o pedido dele muda entre a pauta e a prosa; o cânone saiu torto (defeitos 4 e 5). A espinha está certa (batida 1: «Corrado está do lado do herói, ou do lado de quem paga mais?»), mas a batida não anda, e tudo aponta para o Corrado, até um mendigo no fundo da masmorra.
- **O melhor momento:** a fogueira com o Osric (T15). O QUEM CARREGA da pauta (a faca gémea da faca herdada) entregue com detalhe, voz própria e consequência, e o Dunstan a socorrer a heroína caída (T14). Ali o jogo parece o Matt.
- **O pior momento:** a primeira luta. Três ratos quase matam a heroína, e logo a seguir chega um desconhecido a pedir um favor a quem está caída a sangrar.

**As notas, de 0 a 10:** verdade dos números **8** · coerência da gente **4** · a espinha a andar **4** · a voz e a cena **7** · a luta, como jogo **5** · o veredito antes do clique **6** (o acampamento é exemplar; o «Aceitar o que pede» sem o objeto, não).

---

## 6. O que correr em Node a seguir (grátis)

1. O boato (defeito 3): `oBoatoDaChegada` sobre o estado do T17 e do T18, para saber se foi o teto da pauta ou a porta de `ondeEsta`. O save está no scratchpad desta sessão, `sessao-13\save-s13.json`.
2. O veto (§2): `vetosDoVeredito` sobre o veredito **inteiro** do T2 (não o resumo), para saber se «36 contra 6» teria virado veto.
3. O teto da sessão guardada (defeito 1): medir a cabeça e o turno numa campanha de 20 turnos, e decidir entre subir o teto, exportar antes de virar a página, ou levar a página velha para uma segunda chave.

## 7. Onde olhar

- Página da sessão que sobrou: `testes/sessao-s13.json` (1 turno; o replay `--resumo`: o motor sem defeito, 4 campos da dívida do App, o Juiz igual em 1 de 1, 0 vetos).
- As notas turno a turno, o save completo (122 mensagens, os 23 vereditos), o `fidelidade`: a pasta `sessao-13` do scratchpad desta sessão (`diario-s13.md`, `save-s13.json`, `fidelidade-s13.json`). Ficam fora do repositório: o save tem a campanha inteira.
- A 12.ª, para comparar: `mente/mm11-sessao-12.md`.
