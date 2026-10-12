# O Narrador só narra: a medição (etapa 1)

*12/10/2026 · o `backend` mediu, e só mediu: nenhuma linha de `src/` nem de `testes/` mudou.
Aprovado pela pessoa em 12/10 ("Pode fazer").*

**A pergunta dela:** *"Será que nosso narrador (ia) não comete erros às vezes porque foi treinado como um
mestre? E agora ele é só a boca do mestre… deveríamos trocar e ajustá-lo para ser apenas um narrador do
que o mestre o entrega?"*

**A resposta curta, com número:** em parte, sim, mas a causa principal não é "ele julga que é o Mestre". Das
**31 invenções** com número, nome ou consequência da 6.ª e da 7.ª sessões, **24 (77%) nascem do lado do
sistema**: 14 porque o sistema não tinha o dado, 6 porque o dado estava errado, contraditório ou incompleto,
e 4 porque o sistema tinha o dado e não o mandou (ou mandou-o como ordem aberta). Só **7 (23%)** são do
Narrador a ignorar um dado que recebeu. E três destas sete eram linhas de estado perdidas num rodapé de
9,6 mil caracteres. Quando o dado chega em **frase fechada**, ele obedece: distâncias 6 de 7, preços 3 de
4, `QUEM CARREGA` 10 de 10.

Ainda assim o prompt continua a tratá-lo como Mestre em três sítios. Primeiro, **13,8%** do prompt ensina-o
a ser escrivão, para um trabalho que ele faz em **7%** dos turnos e erra em **1 de cada 3 vezes**. Segundo,
o prompt dá-lhe **14 licenças para inventar** (preço "dentro da faixa", "na dúvida, ABRA o combate", "semeia-as
você", "invente à vontade") contra **13 "não invente"**. Terceiro, **17–20%** do texto ensina-lhe as regras
do jogo como se fosse ele a arbitrá-las.

---

## 0. Como medi (e a margem)

- **Prompts:** o system prompt real de cada turno do Narrador, tirado dos registos JSONL das duas sessões
  (`registo-s6.jsonl`: 67 turnos; `s7/registo-s7.jsonl`: 71). Medi a **mediana** e o **maior** de cada
  sessão, e mais os sintéticos da suíte: a cena típica de cidade (`montarSystemPrompt` com
  `emCidade, temGente, temMercado, temMissao, temTrama, temVilao`), a **PIOR CENA REAL** de
  `teste-prompt.mjs` (secção 2) e o **pior caso com gente** (secção 7, léxico cheio + registo simulado
  de 200 turnos).
- **Classificação:** frase a frase, por regras, com esta ordem de prioridade:
  - **ESCRIVÃO:** a frase cita um canal de saída (`"canone"`, `combate_iniciar`, `loot:`, "registre",
    "envie"…).
  - **PROIBIÇÃO:** tem NÃO/NUNCA/PROIBIDO/JAMAIS ou "não invente/narre/diga…".
  - **CONTRATO:** cita o sistema, o app, o envelope ou a pauta.
  - **OFÍCIO:** fala de cena, voz, gesto, prosa.
  - **REGRA:** o resto, isto é, a mecânica explicada ao Narrador.
  - **ESTADO:** tudo de `ESTADO DESTE TURNO`, o cabeçalho da campanha com o léxico e a tabela de preços.
  - **FORMATO:** o esqueleto `{narrativa, perigo, mudancas}`.

  Os cabeçalhos herdam a classe da maioria do bloco. **Acrescentei a REGRA às cinco categorias pedidas**:
  sem ela, um terço do texto caía em "ofício" sem o ser. Lido à mão numa amostra de 120 frases, o erro é de
  **±4 pontos por categoria**. A ordem também pesa: uma frase como "NUNCA envie mana negativa" conta como
  ESCRIVÃO, porque fala de um canal.
- **Invenções:** cruzei cada preço, distância ou tempo, nome próprio, arma ou luta da prosa com **tudo o
  que o Narrador recebeu naquele turno** (system + mensagens do jogador e do sistema) e com a prosa
  anterior dele (primeira aparição). Os números foram normalizados ("onze quilômetros" = "11 km"). Depois li
  à mão cada caso duvidoso. Os instrumentos estão no scratchpad desta sessão (`nsn/anat.cjs`, `inventa.cjs`,
  `numeros.cjs`, `nomes2.cjs`, `onde.cjs`, `saidas.cjs`, `canais.cjs`, `libera.cjs`). **Para a 8.ª sessão
  servir de prova, têm de ser promovidos** (ver §5).

---

## 1. A anatomia do prompt, em caracteres

| categoria | cena típica (sintética) | **real · mediana s6** | **real · mediana s7** | real · maior s7 | PIOR CENA REAL (sem gente) | **pior caso com gente** |
|---|---|---|---|---|---|---|
| total | 59.094 | **69.732** | **68.344** | 72.183 | 71.367 | **80.475** |
| OFÍCIO (como narrar) | 15,2% | 13,4% | 13,5% | 13,1% | 15,2% | 13,6% |
| REGRA (mecânica ensinada) | 19,0% | 18,1% | 17,3% | 17,5% | 20,4% | 18,9% |
| CONTRATO (sistema decide, você narra) | 20,2% | 18,0% | 17,5% | 17,5% | 24,4% | 21,7% |
| PROIBIÇÃO | 22,8% | 19,1% | 19,1% | 19,5% | 22,8% | 20,3% |
| **ESCRIVÃO** | **15,9%** | **13,7%** | **13,8%** | 13,4% | 13,2% | 11,7% |
| ESTADO (mundo e turno) | 5,6% | 16,7% | 17,8% | 18,0% | 2,7% | 12,9% |
| FORMATO (esqueleto) | 1,2% | 1,0% | 1,0% | 1,0% | 1,0% | 0,9% |

- **Em caracteres absolutos o escrivão é quase constante: 9,4–9,7 mil** em todos os casos. Não depende da
  cena, porque mora no corpo permanente e no `=== FORMATO ===` (4.314 chars, dos quais 3.613 são o exemplo
  de `mudancas` e a linha `SINAIS`).
- **Caixa alta** (NÃO, NUNCA, PROIBIDO, PROIBIDA, JAMAIS, TERMINANTEMENTE):
  - real mediana: **78–79** (40 NÃO · 33–34 NUNCA · 4 PROIBIDO · 1 TERMINANTEMENTE);
  - real maior: **84**;
  - pior com gente: **81**.

  Negações em qualquer caixa: **339–399**. A v9.131 tinha contado 46 "NÃO" e escreveu o contrato para os
  matar. Hoje há 40 NÃO, e o NUNCA (33) ocupou o lugar que eles deixaram.
- **Proibição que cita o sistema:** cerca de 30% das proibições ("você NUNCA X; quem faz X é o sistema").
  São contrato escrito em forma de proibição.
- **Comparado com a v9.131** ("91% proibição ou atribuição ao sistema, 3% de ofício"): hoje, proibição +
  contrato dão **36–37%** e o ofício **13–15%**. O classificador é outro, por isso a comparação vale como
  ordem de grandeza. O contrato da v9.131 funcionou: o ofício cresceu cerca de quatro vezes. O que sobrou
  em cima dele é **escrivão + regra: 31%**.
- **Quanto texto o Narrador lê por turno:** system ~68 mil + **última mensagem ~13 mil** (dos quais a
  `PAUTA` tem 1.349 de mediana, a **96% do `TETO_DA_PAUTA` de 1.400**, e o `RODAPÉ DO SISTEMA` tem
  **9.635**) + histórico ~47 mil. A pauta, que é o canal "frase fechada", está quase cheia. O rodapé,
  onde o Narrador "ignora", é sete vezes maior do que ela.

**Os blocos mais pesados** (mediana s7):

| bloco | chars |
|---|---|
| o corpo `ROLAGENS…` até ao `LIBERDADE CRIATIVA` | 11.353 |
| ESTADO DESTE TURNO | 8.069 |
| FORMATO DA RESPOSTA | 4.314 |
| O OFÍCIO DA CENA | 3.303 |
| FICHA DE INIMIGOS NO COMBATE | 3.248 |
| TURNO DO MUNDO | 2.361 |
| CONDIÇÕES | 1.609 |
| MISSÕES | 1.605 |
| TESTES | 1.454 |
| ARMAS E ARMADURAS | 1.431 |
| ECONOMIA (tabela de preços) | 1.322 |

---

## 2. O trabalho de Mestre que ainda é dele

### 2a. Os canais de saída que mudam o estado, e o que se fez com eles em 137 turnos

O Narrador mandou `mudancas` em **10 de 137 turnos (7,3%)**, num total de **15 campos**. **5 foram
nocivos**, e houve **1 omissão** que partiu a cena. O Cronista (a segunda chamada de IA, que lê a prosa
e regista) fez, no mesmo período: `lugar` 102×, `falou_com` 96×, `promessas` 24×, `canone` 13×,
`pessoas` 11×, `missao_oferecida` 4× e `grupo` 1×.

| canal | o que faz | uso s6+s7 | erro | quem já detecta/decide sem ele | custo no prompt |
|---|---|---|---|---|---|
| `canone` | regista fato durável | 2 | 0 (duplica o Cronista) | **Cronista** (`canone`, 13×) | ~890 (com `npcs`) |
| `npcs` | regista pessoa | 2 | 0 (duplica) | **Cronista** (`pessoas`, 11×) | (acima) |
| `moedas` | debita/credita | 3 | **2**: s6 M3 −1 pelo gesto de Vando, sem compra aceite; s7 M11 +8 com a prosa a dar a bolsa a Jaco | **`bolsa-da-frase.js`** (`compraNaFrase`, "pago X" contra o balcão) | ~420 (com `vida`/`mana`) |
| `cidade_atual` | muda a cidade | 2 | **1**: s7 M11 marcou Sul Molhado **à partida** | **jornada** (a chegada regista) · `geografia.js` | ~950 (com `mapa_*`) |
| `lugar_atual` | põe o herói num sítio | 1 | 0 | **Cronista** (`lugar`, 102×) · `lugar.js`/`arredores.js` | ~2.000 (com viagem; inclui a linha SINAIS) |
| `jornada_meio` | a pé, navio… | 1 | 0 | `viagem` (o meio pode sair do envelope) | (acima) |
| `combate_iniciar` | abre luta | 2 | **2**: rato e lagarto **fora da planta** da masmorra; a planta ficou na camada 0 | `agressao.js` ("ataco X"), `emboscada.js`, `encontros.js`, `masmorras.js`; criatura mostrada (v9.418) | ~770–1.360 (com os outros `combate_*`) |
| (omissão) | — | — | **1**: s6 M47 *"A luta começa"* sem `combate_iniciar` | — | — |
| `combate_atualizar/encerrar/inimigo_vida`, `dano_ambiental` | ameaça, fim, dano sem golpe | 0 | — | `combate.js` (fecha quando todos caem) | (acima) |
| `perigo` | "o mundo age contra o herói" | 2 | 0 | `salvaguardas.js` resolve, mas **ninguém o detecta sem a frase** | ~430 |
| `feito` (XP) | tamanho da conquista | **0** | — | `juiz.js` converte; **ninguém julga sem ele** (pode ir para o Cronista) | ~400 |
| `adicionar_itens`/`remover_itens`/`grupo_itens` | itens | 0 | — | `chao.js` (espólio), `ofertas.js`, mercado | ~650 |
| `loot:` | gera item de poder | 0 | — | espólio do sistema | (acima) |
| `grupo_*` | recruta/fere/expulsa companheiro | 0 | — | **Cronista** (`grupo.entraram`) · `companheiros.js` | ~230 |
| `mapa_cidades`/`mapa_faccoes` | cria cidade/facção | 0 | — | **o mundo é gerado** (`mundo-base`: "o sistema gerou o mundo inteiro") | (em `mapa`) |
| `missao_oferecida` + `"paga"` | cartaz no mural, **com o número da recompensa inventado** | 0 | — | **Cronista** (`missao_oferecida`, 4×) | ~740 |
| `evento_global_encerrar` | fecha o global | 0 | — | **Cronista** (`missoes.global_encerrado`) | (acima) |
| `relogio_novo` | propõe relógio | 0 | — | `relogios.js` | ~180 |
| `masmorra:` | abre masmorra | 0 | — | a entrada abre-a (`[MASMORRA — ENTRADA]`) | ~310 |
| `viagem:` | abre viagem | 0 | — | Intérprete (`rastro.js`, `VERBOS_DE_PARTIDA`) | (em `lugar`) |
| `fe:`/`milagre:`/`dominio:`/`patrono:`/`ascender:`/`raid:` | fé, milagres, ascensão | 0 | — | **Cronista** (`fe`), `divindades.js`, `raids.js` | ~230 + linha SINAIS 1.574 |
| `adicionar_habilidades` | (proibido; só o texto que o proíbe) | 0 | — | painel de talentos | ~160 |

**O saldo dos canais:** dos ~9,4 mil caracteres de escrivão,

| fatia | o que é | chars | % do prompt real |
|---|---|---|---|
| A | canais com **zero uso** e dono no sistema ou no Cronista | **~5.400–5.700** | ~8% |
| B | canais **usados com erro** ou duplicados (`moedas`, `cidade_atual`, `lugar_atual`, `jornada_meio`, `canone`, `npcs`) | **~1.640** | ~2,4% |
| C | combate | **~770 (fora da luta) a ~1.360 (na luta)** | — |
| fica | `perigo` e frases genéricas | ~1.070–1.330 | — |

### 2b. As decisões de Mestre que o texto ainda lhe dá (além dos canais)

- **Preço:** a `ECONOMIA_PROMPT` abre com *"qualquer preço que você citar na ficção DEVE respeitar estas
  faixas"*, e a base diz *"Mercadores com personalidade e preços coerentes"*. As duas **mandam inventar
  dentro da faixa**. Ao mesmo tempo, o rodapé diz *"BANCAS ABERTAS AQUI… estoque e preço estão no painel,
  não os invente"*. São duas ordens contrárias. Nas duas sessões o Narrador cumpriu a primeira: os preços
  inventados (2 cobres por caneca, 2 fichas por refeição) estão **dentro da faixa**.
- **A ameaça:** *"A ameaça é a sua alavanca de dificuldade"* e *"Ameaças novas devem ser escolhidas do
  patamar DIGNO"*.
- **A luta:** *"Se a cena tem inimigo hostil presente, o combate já deve estar aberto. Na dúvida, ABRA o
  combate"*.
- **O mundo escondido:** *"as áreas secretas… semeia-as você… e manda `masmorra:<nome>`"*, e *"ACHADOS
  ESPONTÂNEOS: ponha descobertas na cena — um guerreiro morto…, um baú…, um altar com uma relíquia"*. A
  segunda contradiz, no mesmo bloco, *"não invente achado que o envelope não listou"*.
- **A política:** *"A política é sua — negocie, ameace, traia… o líder daquela potência decide na ficção…
  e você registra o desfecho"* (`TURNO DO MUNDO`, 2.361 chars, em todo o turno fora da luta).
- **A recompensa:** *"DIGA O PREÇO NA CENA e mande o mesmo número no campo `paga`"* (`missoes.js`).
- **O relógio:** *"Você PODE PROPOR um relógio novo"* (`relogios.js`).
- **A licença geral:** *"Fora do que os envelopes governam, invente à vontade"* (`prompt.js`, abertura).

Contagem na mediana s7: **14 licenças para criar ou decidir** contra **13 "não invente"**; a palavra
"invent" aparece 31 vezes.

---

## 3. As invenções com número, nome ou consequência (6.ª e 7.ª sessões)

Conta cada afirmação **na primeira vez que aparece**. Exclui o que o Narrador repetiu porque o jogador
o tinha dito ("pago as sete") e os idiomas ("um dia", "por um instante").

| tipo | s6 | s7 | **total** | o sistema **não tinha** | **tinha e não mandou** (ou mandou como ordem aberta) | **mandou e ele ignorou** | **o sistema errou** (dado errado, contraditório, incompleto) | obedeceu quando tinha |
|---|---|---|---|---|---|---|---|---|
| **preço** | 6 | 4 | **10** | **8**: s6 pregão 3/5, refeição 2, maçã 1, tochas+rações 7; s7 pedágio 1, caneca 2, Pregado 5, peixe 3 | 0 | **1**: s6 M7, corda 5 / "tudo, sete" com a pauta a dizer ◉35/◉37 | **1**: s6 M13, a pauta dizia "não há **macas**" | **3 de 4**: s6 tocha ◉1, s7 ◉8, s7 quarto ◉3/estábulo ◉1 |
| **distância/tempo** | 3 | 1 | **4** | 1: s7 M2 "meia hora" dentro da cidade | 0 | **2**: s6 M30 "meio dia" com a pauta a dizer 6,6 km/2,1 h; s6 M37 "quando a manhã chega" com o relógio a 00:08 | 1: s6 M19, três medidas no sistema | **6 de 7** (4 h, 4 h, 11 km/4 h, 2 h, 3 h) |
| **pessoa com nome/papel** | 1 | 4 | **5** | **3**: Ambrósio, Pregado, **Dário** (o morto registado como vivo) | 0 | 1: s6 Nira (o nome do coveiro do sistema dado à prisioneira) | 1: s7 "um velho camarada" sem nome, que o Narrador chamou Marlo | — |
| **lugar** | 0 | 0 | **0** | 0 | 0 | 0 | **1**: s6 "Posto da Baixa" (espinha) × "o posto da estrada" (`arredores`), **dois sítios do próprio sistema** | — |
| **criatura / armado** | 3 | 2 | **5** | 1: s7 M18 "dois carregando tocha", que evaporam no M20 | **3**: s6 rato e lagarto (a planta tinha *sala 1: voraz de boca larga*; a pauta só dizia *"ouve-se respiração pesada"*); o cão sem pelo (o tipo está na lista da região, mas ninguém o instanciou) | 0 | **1**: s7 M60, o camarada **criado pelo sistema** (`QUEM CARREGA`) e o duelo prometido sem combatente; a faca é textura | — |
| **item / estado** | 2 | 1 | **3** | 0 | 0 | **3**: tocha acesa com *"NO ESCURO: nenhuma tocha acesa"*; escudo arcano com 0/4 preparadas; a bolsa do morto dada a Jaco (o sistema dava ◉8 ao herói) | 0 | — |
| **luta** | 1 | 1 | **2** | 1: s6 M47 *"A luta começa"*, sem luta e sem `combate_iniciar` | 0 | 0 | 1: s7 M60, o duelo do cartão | — |
| **revelação adiada** | 0 | 1 | **1** | 0 | **1**: s7 M45–55, o álibi inventado; o motor sabia quem é o elo e que o jogador tinha as duas pistas | 0 | 0 | — |
| **total** | **16** | **14** | **30** (+1 lugar) | **14** | **4** | **7** | **6** | |

**Origem, em proporção (31 casos):**

| origem | casos | % |
|---|---|---|
| o sistema não tinha | 14 | 45% |
| o sistema errou | 6 | 19% |
| tinha e não mandou | 4 | 13% |
| **subtotal do lado do sistema** | **24** | **77%** |
| o Narrador ignorou o que recebeu | 7 | 23% |

**Três correções à premissa:**

1. **"O posto da estrada" não é invenção do Narrador.** É um sítio de `arredores.js` (*"o posto da estrada,
   a noroeste, 1,1 h a pé; duas irmãs que herdaram a terra"*), e a pauta pô-lo no `ONDE` do M30. O defeito
   é o sistema ter **dois** postos: o da espinha (Posto da Baixa) e o dos arredores.
2. **"A pessoa armada que o sistema não conhecia" (s7 M60) foi criada pelo próprio sistema.** O
   `QUEM CARREGA` escreveu *"o camarada desafia você para um duelo"*, e o Narrador obedeceu à frase fechada.
   O sistema não registou o combatente.
3. **O rato e o lagarto existem no sistema**, na lista *"O QUE AMEAÇA AS PESSOAS"* do léxico. O que faltou
   foi mandar o ocupante **daquela sala**. O Narrador tirou-os da lista e, por cima, **abriu a luta pelo
   canal de escrivão** (`combate_iniciar`). Foi o escrivão que transformou uma textura numa luta paralela.

**O que o Narrador recebe e cumpre:**

| o que lhe chega | cumprimento |
|---|---|
| `QUEM CARREGA` em frase fechada (7.ª) | 10 de 10 |
| a mesma linha como verbo ("mente", "diz as saídas") | 0 de 2 |
| o `vem` da escada (6.ª) | calado 3 vezes |
| distâncias com número | 6 de 7 |
| preços com número | 3 de 4 |

**A regra que os números dão:** *quando o sistema diz, ele diz; quando o sistema cala, ele preenche, e
preenche como o prompt manda (dentro da faixa, "invente à vontade").*

---

## 4. A proposta, medida

### 4a. O contrato novo numa regra: como ficaria no prompt

Entra **no lugar** da frase *"Fora do que os envelopes governam, invente à vontade — gente de passagem,
boato, detalhe, o que há atrás de uma porta que ninguém abriu."* (136 chars), no parágrafo
`A DIVISÃO, EM UMA LINHA`:

> **O QUE É FATO, EM UMA LINHA: número, nome próprio e consequência vêm do sistema; a textura é sua.**
> Antes de escrever um preço, uma distância, uma hora, uma quantia, um nome que ainda não existe (pessoa,
> lugar, criatura, objeto) ou um acontecimento que muda alguma coisa (alguém ataca, saca uma arma, chega,
> parte, paga, morre, promete, revela), procure-o no envelope, na pauta ou no estado. Está lá: use-o como
> veio. Não está: quem fala na cena não sabe, desconversa ou diz sem número ("não sai barato", "um bom
> pedaço de estrada"), e quem precisa de nome leva um dos NOMES À MÃO. O resto é inteiro seu: gesto,
> cheiro, voz, o que cada um quer e esconde.

**~660 caracteres: +524 líquidos.** O teto é sagrado, por isso esta frase **só entra depois** de a etapa 2
ter tirado cinco mil. Nunca antes.

Tem de sair **no mesmo commit**, porque são o avesso dela:

| sai | de onde |
|---|---|
| a 1.ª linha da `ECONOMIA_PROMPT` ("qualquer preço que você citar… DEVE respeitar estas faixas") | `economia.js` |
| "Mercadores com personalidade e preços coerentes" | `prompt.js` |
| "Na dúvida, ABRA o combate" | `prompt.js` |
| "semeia-as você… manda `masmorra:<nome>`" | `prompt.js` |
| "ACHADOS ESPONTÂNEOS" | `prompt.js` |
| "DIGA O PREÇO NA CENA… `paga`" | `missoes.js` |
| "Você PODE PROPOR um relógio" | `relogios.js` |
| "A política é sua… você registra o desfecho" | `prompt.js` |

Cada uma tem de virar o oposto ou sair. Juntas pesam **~1.900 chars**.

### 4b. O que o sistema tem de passar a entregar ANTES (pela pauta, e por tipo)

A pauta está a 96% do teto (1.349/1.400). Cada linha nova **só aparece no turno em que é verdade** e entra
por prio, como manda a lei. Não há bloco estático.

| tipo | o que entregar | de que módulo | chars, só quando verdade | cobre (s6+s7) |
|---|---|---|---|---|
| **preço** | `O PREÇO` (ou o `PERGUNTOU` alargado): refeição, caneca, pedágio, serviço/informação de uma pessoa, a partir de uma tabela **`PRECOS_COMUNS`** com as faixas que hoje só existem em prosa na `ECONOMIA_PROMPT` (como o `PRECOS_DO_POUSO` já faz com o pouso, pelo porte da cidade). Mais o conserto do "maçã"→"maca" (`O_ACENTO_SEPARA`) | `economia.js` (tabela nova) · `cidade-por-dentro.js` (fator) · `bolsa-da-frase.js` | ~80–110, em cidade com gente a vender ou quando se pede preço | **9 de 10** (só o pregão de rua fica de fora) |
| **distância/tempo** | **uma medida só** por par de lugares (o Geógrafo manda e a jornada e o `lugar` leem dele), mais a distância **dentro da cidade** aos locais (min a pé) no `DAQUI` | `geografo.js` · `viagem.js` · `lugar.js` | ~0 (é conserto de valor) + ~40 | 3 de 4 (o M37 é o relógio: veto `naoPode` no acampamento narrado) |
| **pessoa** | todo o papel que o sistema cria (`QUEM CARREGA`: "um velho camarada") **chega com nome** do elenco e **já registado**; e `NOMES À MÃO`, dois nomes livres do elenco, por gênero, quando há gente em cena e o Narrador pode precisar de um figurante | `subtramas.js` · `elenco.js`/`nomes.js` · `pauta.js` | ~60 | 4 de 5 (Ambrósio e Pregado passam a vir da lista e ficam registados; o "Dário" morto também; Marlo vem com nome) |
| **lugar** | a espinha usa um sítio de `arredores` (ou cria-o lá): **um** posto | `espinha.js` · `arredores.js` | 0 | 1 de 1 |
| **criatura/armado** | a linha `MASMORRA` diz **o ocupante da sala** em frase fechada ("na sala: voraz de boca larga, dorme"); quem o sistema põe em cena com arma **entra no registo como alvo** (o conserto 3 da 7.ª) | `masmorras.js` · `agressao.js` · `subtramas.js` | ~50 | 4 de 5 |
| **item/estado** | o estado que decide a cena **sobe do rodapé para a pauta** em frase fechada quando a ação o toca ("a tocha está apagada", "nenhuma magia preparada", "◉8 foram para a sua bolsa") | `pauta.js` (`luz` já existe, prio 5,5; alargá-la à exploração) | ~50 | 3 de 3 |
| **luta** | `naoPode`: "não começa luta nesta resposta" sempre que não há `[COMBATE]` aberto e o sistema não abriu um | `pauta.js` · `agressao.js` | ~45 | 2 de 2 |
| **revelação** | a revelação do elo em frase fechada quando as duas pistas estão maduras (o conserto 2 da 7.ª) | `subtramas.js` | (já orçada na C2) | 1 de 1 |

**Cobertura projetada: 27 das 31 invenções** passam a ter um dado em frase fechada. Ficam de fora o pregão
de rua (textura), o "meio dia" do M19 (resolvido pela medida única) e as duas do relógio/rodapé, que
dependem de o Narrador obedecer.

### 4c. Que canais saem primeiro, e quanto liberam

| ordem | canais | critério | liberam (mediana s7) |
|---|---|---|---|
| **1.º** | `mapa_cidades`, `mapa_faccoes`, `loot:`, `adicionar_itens`/`remover_itens`/`grupo_itens`, `grupo_*`, `missao_oferecida`+`paga`, `evento_global_encerrar`, `relogio_novo`, `masmorra:`, `viagem:`, `fe:`/`milagre:`/`dominio:`/`patrono:`/`ascender:`/`raid:`, `adicionar_habilidades`, `feito` | **0 usos em 137 turnos** e um dono no código ou no Cronista | **~5.400–5.700** |
| **2.º** | `moedas`, `cidade_atual`, `lugar_atual`, `jornada_meio`, `canone`, `npcs` | usados, com **3 erros em 11 usos**, e com dono (`bolsa-da-frase`, jornada, Cronista) | **~1.640** |
| **3.º** | `combate_iniciar/atualizar/encerrar/inimigo_vida`, `dano_ambiental` | 2 aberturas em inventado + 1 omissão; **só depois** de o sistema abrir pelo que mostra | **~770–1.360** |
| fica | `perigo`, o esqueleto `narrativa` | o único caminho da ficção para a salvaguarda; 0 erros | — |

**Total liberado: ~7.800–8.700 chars**, cerca de 12% do prompt real. A mediana desce de ~68 mil para
**~60 mil** e o pior caso com gente de 80,5 para **~72 mil**, isto é, **~2.200 tokens a menos por
chamada**. A regra nova come 524. Os blocos do 4a que saem pagam-se a si mesmos (−1.900).

### 4d. As etapas, em ordem, cada uma com a medida que a prova

| etapa | o que faz | prova em Node / suíte | prova jogada |
|---|---|---|---|
| **E1 · o sistema entrega** (motor, sem tocar no prompt) | `PRECOS_COMUNS` + `O PREÇO`; o "maçã"; uma medida só de distância; o papel com nome e registado; `NOMES À MÃO`; o ocupante da sala; o estado decisivo em frase fechada; o veto "sem luta sem `[COMBATE]`" | cada módulo com suíte própria (determinismo, `null`/`{}`, teto da pauta); **reprodução offline**: passar as frases do jogador da 6.ª e da 7.ª pelos construtores da pauta e contar quantas das 31 passam a ter dado. **Hoje: 4 de 12 preços têm ◉ no turno; alvo ≥10 de 12. Invenções com dado: 7 → ≥27 de 31** | — |
| **E2 · o escrivão sem uso sai** | tirar do prompt os canais do 1.º lote (o parser do App continua tolerante: ignora, não quebra) e as licenças contrárias do 4a | `teste-prompt.mjs`: a PIOR CENA REAL desce cerca de 5,4 mil; o varredor "não oferece o que proíbe"; `teste-ligacao` verde (`feito` passa para o Cronista ou morre com motivo escrito) | — |
| **E3 · a regra entra, e o 2.º lote sai** | a frase `O QUE É FATO`, paga pela E2; `moedas`, `cidade_atual`, `lugar_atual`, `jornada_meio`, `canone`, `npcs` saem do Narrador; a fiação do App passa a confiar só em `bolsa-da-frase`, jornada e Cronista (hand-off para o `frontend`) | suíte da regra: a frase existe, o `invente à vontade` não; o prompt não cita nenhum canal do 1.º e do 2.º lote | **8.ª sessão contra a 7.ª**, por tipo (§5) |
| **E4 · o combate sai do Narrador** | depois de o `agressao.js` registar quem o sistema pôs armado em cena, e de a masmorra dizer o ocupante, saem os `combate_*` e o `dano_ambiental` | suíte de `agressao`: "ataco o camarada" abre luta; a frase "a luta começa" sem `[COMBATE]` cai no veto | **9.ª sessão**: luta sem luta = 0, criatura fora da planta = 0 |
| E5 · (mais tarde, opcional) a REGRA | dos 17–20% de mecânica ensinada, o que só importa quando o envelope traz o resultado passa a viajar **no** envelope | medir antes, bloco a bloco; só sai o que tem frase fechada a substituí-lo | — |

---

## 5. A 8.ª sessão: o que se mede e onde está a régua

| medida | 7.ª | alvo da 8.ª |
|---|---|---|
| preço inventado (sem dado) | 4 | **≤ 1** |
| preço com dado, cumprido | 2 de 2 | todos |
| distância/tempo fora do sistema | 1 | **0** |
| pessoa nomeada fora do sistema (sem `NOMES À MÃO`) | 3 | **≤ 1** |
| criatura/armado fora do sistema | 1 (+1 do sistema) | **0** |
| luta sem luta | 0 (+1 do sistema) | **0** |
| escrivão nocivo (`moedas`/`cidade`/`combate`) | 2 | **0** (o canal já não existe) |
| `mudancas` do Narrador por turno | 6 de 70 | ≤ 2 de 70 (só `perigo`) |
| **vigia contra o burocrático:** nota da **prosa** | 3 | **≥ 3** |
| **vigia:** nota do **mundo e lugar** | 3 | **≥ 3** |
| **vigia:** nota das **personagens** | 4 | **≥ 4** |
| **vigia:** respostas "não sei"/desconversa a uma pergunta que o sistema podia ter respondido | (não medido) | **≤ 1 em 10** |
| **vigia:** palavras por narrativa | (medir) | dentro de ±15% da 7.ª |

**Os instrumentos.** Os scripts de contagem estão hoje no scratchpad desta sessão, que é efémero. Para a
8.ª servir de prova, têm de ser **promovidos** para um sítio que sobreviva. Proposta:
`testes/ab-invencoes.mjs`, que lê um registo JSONL e conta por tipo, no formato dos `ab-*.mjs` que já
existem e sem exports, para não acordar a catraca. Fica para quem fizer a E1.

---

## 6. Riscos, e o que NÃO tirar

**Não tirar:**

- **O CONTRATO (17–24%).** As frases "o sistema já rolou, você narra; obedeça ao rótulo; se o envelope diz
  que resistiu, não aplique" são as que fazem o Narrador cumprir as frases fechadas. Os 82% de obediência
  com dado saem delas.
- **O OFÍCIO (13–15%) e as vozes** (`vozes.js`). São a nota da prosa e das personagens, e foi o que subiu
  da 4.ª para a 7.ª.
- **As proibições que guardam a coerência e não falam de canal:** o cânone "nunca contradito", as datas de
  encontro, o escopo do envelope, o tempo do sistema, quem está longe está longe. Da linha do CÂNONE (853
  chars) só sai a frase "registre em `canone`"; o resto fica.
- **O `perigo`.** É o único caminho da ficção para `salvaguardas.js`, com 2 usos e 0 erros. Reavalia-se
  depois da 8.ª.
- **O esqueleto `{narrativa, perigo, mudancas}`.** O parser do App aceita `mudancas` vazias. Tirar
  canais do prompt **não** obriga a tirar a leitura do App, e mantê-la tolerante deixa a reversão a um
  commit de distância.

**Riscos:**

1. **O mundo fica pobre e burocrático.** Ambrósio e Pregado, que o Narrador inventou, foram *"os mais
   vivos"* da 7.ª. Uma regra seca transforma-os em "um velho" sem nome. É por isso que o `NOMES À MÃO`
   entra **na E1, antes** da regra: o figurante continua a ter nome, só que o nome vem do sistema e fica
   registado. A vigia "não sei ≤ 1 em 10" e as notas de prosa e mundo existem para pegar isto.
2. **Mudar o escrivão para o Cronista muda o erro de sítio sem o apagar.** O Cronista também é IA e
   aparece como origem (a) em quatro linhas da coerência: a heroína registada como NPC, descritores como
   pessoas, o Dário morto como vivo, Otto e "o homem de capa de chuva". **Onde houver código
   determinístico, o canal vai para o código** (`bolsa-da-frase`, Intérprete/`rastro`, `agressao`,
   jornada). Para o Cronista vão só o cânone, as pessoas e o `feito`.
3. **O App pode depender de um canal num caso raro** (`grupo_adicionar` para recrutar; `mapa_faccoes` na
   gestão de reino, que não é do beta). Antes da E2, o `frontend` conta os leitores de cada campo no
   `App.jsx` (hoje: `combate_iniciar` 9, `cidade_atual` 17, `mapa_cidades` 2, `lugar_atual` 9…) e
   confirma que o dono no sistema cobre cada um.
4. **A pauta está a 96% do teto.** Cada linha nova da E1 entra por prio e pode empurrar outra. As linhas
   são condicionais (só no turno em que são verdade), e a suíte do teto da pauta tem de provar a pior cena
   com elas.
5. **O peso.** Tirar canais é "desligar o que existe" e a regra mexe na forma como o Narrador decide. As
   duas coisas são **pesadas** pela tabela da casa. Ficam dentro da liberdade da ordem de 28/09 (Fase MM)
   porque **um commit revertido desfaz tudo**: nenhum campo de save muda, nada custa dinheiro, nenhum dado
   de jogador se apaga.
6. **O que esta medição não prova.** Duas sessões e 137 turnos, jogadas por um agente: a margem de cada
   célula da tabela §3 é de ±1–2 casos. Os 77% do lado do sistema são robustos na direção, não na casa
   decimal. A troca da frase de identidade **não foi testada sozinha**. A recomendação é não a fazer
   sozinha: sem a E1, uma regra "não invente" diante de um sistema que cala só troca invenção por silêncio.
