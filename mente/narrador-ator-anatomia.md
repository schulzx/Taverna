# O Narrador como ator — a anatomia do pedido, medida

*Diagnóstico para uma decisão da pessoa, 03/11/2026. Nada de código foi mudado.*

A pergunta: se o Narrador deixar de ser «mestre de mesa» e passar a **ator** —
recebe a ficha de quem está em cena e o que tem de ser dito, e só fala; nada do
que ele diz entra no sistema; ele não sabe regras —, quanto do pedido de hoje
sobra, quanto custa, e o que o sistema tem de passar a decidir sozinho?

**Como se mediu.** As cinco sessões gravadas (`testes/sessao-s8`, `s9`, `s10`,
`navegador`, `s13`), cada turno com frase remontado pelo caminho do servidor
(`oPedidoNoServidor`, `src/turno-no-servidor.js`) sobre o código de HEAD
(`9cd7b0f`): **147 turnos reais**. As sessões não gravam o histórico de
mensagens, então ele foi refeito como o App o guarda (`App.jsx`, o `histFinal`
do fim do turno): a fala do jogador pela `memoriaDoTurno` (`src/janela.js`) e a
resposta como `{"narrativa": …}`, cortado pela `janelaAncorada`. Token =
caractere ÷ 3,5 (`CACHE_EXPLICITO.charsPorToken`, medido na 11.ª). Os scripts
estão no scratchpad da sessão (`anatomia/coletar.mjs`, `anatomia/anatomia.mjs`).

**Ressalva:** as cinco sessões quase não têm luta (as regras de golpe e
salvaguarda abriram em 1 dos 147 turnos) nem masmorra (1). O pior caso medido
(79,5 mil) fica abaixo do teto teórico da casa (~82 mil), que é o da luta.

---

## 1. A anatomia

### O pedido inteiro

| | média | mediana | pior |
|---|---:|---:|---:|
| **pedido ao Narrador** | **65.637** chars (~18,8 mil tokens) | 65.992 | 79.491 (s10, turno 28) |
| system (o fixo) | 42.413 | 42.339 | 46.624 |
| histórico (janela) | 11.697 em 28 mensagens | 12.179 | 23.461 em 46 mensagens |
| mensagem do turno | 11.527 | 10.711 | 16.240 |
| *a resposta (narrativa)* | *678* | *663* | *1.914* |
| *a frase do jogador* | *144* | *125* | *551* |

### Por rótulo, sobre o pedido inteiro (média)

| rótulo | chars | % | onde |
|---|---:|---:|---|
| **REGRA DE JOGO** que o ator não precisa | **32.126** | **48,9%** | system |
| REGRAS DA CENA ABERTA (regra, por porta) | 3.328 | 5,1% | mensagem do turno |
| CONTRATO DO PAPEL (quem decide o quê) | 4.617 | 7,0% | system |
| VOZ E ESTILO | 3.786 | 5,8% | system |
| FATO DO MUNDO (campanha, ficha, cenário) | 1.436 | 2,2% | system |
| FORMATO DE SAÍDA | 449 | 0,7% | system |
| histórico (falas antigas + narrativas) | 11.697 | 17,8% | mensagens |
| ESTADO DESTE TURNO (fato + direção) | 3.080 | 4,7% | mensagem do turno |
| RODAPÉ (ficha, lugar, chefes, invioláveis) | 3.528 | 5,4% | mensagem do turno |
| PAUTA + envelopes (o que acontece agora) | 1.275 | 1,9% | mensagem do turno |
| o fecho (tamanho + a frase) | 316 | 0,5% | mensagem do turno |

**A conta que importa:** regra de jogo, contando a da cena aberta, é **54%** do
pedido. O que um ator usaria — a pauta, a frase, a voz, a ficha de quem está
ali — é **~10%**. No texto do turno 60 de s8 aparecem 27 «NUNCA», 32 «NÃO», 7
«PROIBIDO» e 116 vezes a palavra «sistema». Um ator que lê isso tudo antes de
falar fala como quem lê um regulamento. É daí que vem a voz robótica.

### O system, bloco a bloco (média sobre os 147; quase igual em todos)

| bloco | chars | rótulo |
|---|---:|---|
| ROLAGENS (com arco, missões, mapa, elenco, cânone, colchetes, recusa, datas, escopo do envelope, tempo, guia, correio) | 7.097 | REGRA |
| FICHA DE INIMIGOS NO COMBATE | 1.749 | REGRA |
| A VOZ É A BOCA, NÃO O MUNDO | 1.740 | CONTRATO |
| TESTES | 1.497 | REGRA |
| ARMAS E ARMADURAS | 1.490 | REGRA |
| CONDIÇÕES DE ESTADO + CONDIÇÕES E EFEITOS | 1.400 | REGRA |
| HABILIDADES E EFEITOS TEMPORÁRIOS | 1.238 | REGRA |
| BASE DO MUNDO | 1.236 | REGRA |
| ECONOMIA DE AÇÃO | 1.205 | REGRA |
| O OFÍCIO DA CENA | 1.193 | VOZ |
| PESO DOS ENCONTROS | 1.169 | REGRA |
| PERÍCIAS | 1.143 | REGRA |
| ONDE O HERÓI ESTÁ | 1.125 | REGRA |
| PRESENÇA E CONHECIMENTO | 970 | REGRA |
| ATRIBUTOS E MULTICLASSE | 938 | REGRA |
| MUNDO ESCALÁVEL | 913 | REGRA |
| A PAUTA DO TURNO (como ler a pauta) | 837 | CONTRATO |
| abertura «Você é o NARRADOR…» | 759 | CONTRATO |
| TRAÇOS DE ORIGEM | 740 | REGRA |
| O ESPAÇO | 723 | REGRA |
| PROFISSÃO DO HERÓI | 719 | REGRA |
| PATAMAR DE COMBATE | 713 | REGRA |
| VARIEDADE DE LINGUAGEM | 688 | VOZ |
| POÇÕES E CONSUMÍVEIS | 675 | REGRA |
| O QUE É FATO | 650 | CONTRATO |
| PONTOS DE HEROÍSMO | 644 | REGRA |
| DESTINOS POR DESCRIÇÃO | 599 | REGRA |
| A LEI DA FORMA | 589 | REGRA |
| DESFECHOS TÊM PESO | 586 | REGRA |
| QUEM ANDA COMIGO | 521 | REGRA |
| A FORMA DO MUNDO | 517 | REGRA |
| FORMA DESTE MUNDO | 508 | FATO |
| O PREÇO DE FALHAR | 497 | REGRA |
| FORMATO DA RESPOSTA | 449 | FORMATO |
| PERGUNTAS AO MUNDO | 413 | REGRA |
| A SUA VOZ — DE ONDE VEM A GRAÇA (6 blocos da voz) | 1.477 | VOZ |
| RELÓGIOS DE PROGRESSO | 393 | REGRA |
| RITMO DA HISTÓRIA | 388 | VOZ |
| O QUE MUDA A CADA TURNO | 373 | CONTRATO |
| COMPANHEIROS VIVOS | 350 | REGRA |
| COMBATE, ESPÓLIOS E ACHADOS | 277 | REGRA |
| PERSONAGEM DO JOGADOR + FICHA DE CAMINHO | 320 | FATO |
| A DIVISÃO, EM UMA LINHA | 258 | CONTRATO |
| ECONOMIA (o nome da moeda) | 174 | FATO |
| CAMPANHA | 116 | FATO |
| COMO ESTE MUNDO FUNCIONA, ESTILO | 129 | FATO/VOZ |
| raros: TRABALHO DO MUNDO (4 turnos, até 6.501), MISSÕES, PROFISSÃO, o cenário (O MUNDO É ESTE, COMO AS COISAS SE CHAMAM…) | 0–11.285 | FATO |

Os blocos «CONTRATO» existem para conter um narrador que podia mexer no
sistema. Para um ator, quase tudo isso vira uma linha: *«você só fala; o que
existe é o que está abaixo»*.

### A mensagem do turno, zona a zona

| zona | média | pior | rótulo |
|---|---:|---:|---|
| PAUTA + envelopes | 1.275 | 1.801 | **o que o ator precisa** |
| REGRAS DA CENA ABERTA | 3.328 | 6.921 | REGRA |
| ESTADO DESTE TURNO | 3.080 | 3.950 | FATO (mapa, cidades, caminhos, tempo, título) + DIREÇÃO (ritmo, momento do arco) |
| RODAPÉ | 3.528 | 9.030 | invioláveis + ficha (passivos, heroísmo, fôlego, deslocamento) + lugar + chefes |
| fecho | 316 | 727 | tamanho pedido + a frase |

**A pauta, secção a secção** (média sobre os 147 / quando aparece):

| secção | turnos | média | quando aparece |
|---|---:|---:|---:|
| ONDE | 147 | 239 | 239 |
| a moldura «[PAUTA DO TURNO…]» | 147 | 228 | 228 |
| NÃO PODE | 147 | 224 | 224 |
| O FECHO | 147 | 143 | 143 |
| A GENTE | 120 | 121 | 148 |
| QUEM É | 122 | 107 | 129 |
| O RUMO | 146 | 90 | 91 |
| EM CENA | 139 | 59 | 63 |
| PERGUNTOU | 23 | 21 | 136 |
| A APOSTA | 8 | 14 | 255 |
| MOMENTO | 3 | 7 | 362 |
| A CIDADE | 18 | 5 | 41 |
| O PREÇO | 5 | 3 | 90 |
| MASMORRA | 1 | 2 | 337 |

Envelopes nestas sessões: raros (MOVIMENTO 2, ABERTURA 1, A FORMA DESTA CENA 1).
A pauta já é, hoje, **a forma do pedido de um ator**: quem está, quem é, o que a
gente faz, o que se perguntou, como acaba. Ela tem 1,9% do pedido.

**A cena aberta, por porta:** DESCANSO 594 (em todo turno), O ESPAÇO ENTRE OS
LUGARES 783 (95 turnos), TURNO DO MUNDO 463, A GENTE EM CENA 504, PORTE 244, e o
pacote do mercado em cidade (33 turnos: MERCADO 812, LUGAR DENTRO DO LUGAR 721,
ESCALA DE RIQUEZA 351, PREÇOS 255, COMPRA E VENDA 252, …, ~3,3 mil juntos).

**O rodapé, por bloco:** os invioláveis 743, CHEFES QUE JÁ EXISTEM 359 (até
1.151), QUEM ESTÁ EM CENA 273, MEU GRUPO 266, PASSIVOS 227, FÔLEGO 196, HEROÍSMO
152, DESLOCAMENTO 144, EQUIPAMENTO 90, e o lugar quando há cidade: O QUE EXISTE EM
<cidade> 1.200–2.600 + FORA DOS MUROS 630–800.

### O cache

- O system ficou **byte a byte igual ao do turno anterior em 142 de 147** (as 5
  quebras são o começo de sessão e o TRABALHO DO MUNDO que entra e sai).
- A parte estável (system + histórico) é **54,1 mil, 82%** do pedido. A parte que
  se paga cheia em todo turno é a mensagem do turno, **11,5 mil (18%)**, mais o
  rabo do histórico depois do último cache (até 6 mil tokens, `raboMaxTokens`).
- Na vida real o cache dá menos: a 13.ª mediu **58%** contando o Cronista. Só do
  Narrador, a fatura da 13.ª (US$ 0,2231 em 23 turnos) bate com ~11,9 mil tokens
  lidos do cache, ~6,9 mil novos, ~1,5 mil escritos e ~700 de saída por turno.
  Isso dá **~63% de cache**.

---

## 2. A superfície de controle — o que o «ator» tem de perder

**O formato pedido:** `{ "narrativa": "…", "mudancas": null }`. O parser
(`sanearResposta`, `src/json.js:177`) guarda só `narrativa`, `perigo`, `mudancas`
e `sugestoes`, força `rolagem: null` e joga fora todo o resto. Depois, a poda
(`podarONarrador`, `src/agressao.js:1185`, chamada em `src/motor/aplicar.js:107`)
corta `perigo` sempre, corta dano e vida de inimigo, e corta `combate_iniciar`,
salvo no caso «ATAQUE DECLARADO — SEM ALVO».

**O uso real:** nas 198 respostas gravadas (s8 70, s9 47, s10 77, s13 1,
navegador 3), **nenhuma** trouxe `mudancas` com alguma chave. Medidas antigas
nos comentários de `prompt.js` dão 10 em 137 nas sessões 6–7. **O canal JSON já
está praticamente morto. O controle de verdade passa pelo texto.**

### Os campos do topo

| campo | quem lê | classe |
|---|---|---|
| `narrativa` | App (a entrega) | (b) tela, e é a fonte das portas de texto abaixo |
| `perigo` | `fecho-da-resposta.js:79` | (a): a poda zera antes |
| `rolagem` | — | (a): sempre null |
| `sugestoes` | ninguém | (a) |
| qualquer outro | `json.js` | (a): descartado |

### `mudancas`: 29 portas do tipo (c), ou 37 contando cada sinal

| grupo | campos | quem aplica | o que decide |
|---|---|---|---|
| ficha (17) | `vida`/`mana` (só cura), `moedas`, `adicionar_itens`, `remover_itens`, `adicionar_equipamento`, `remover_equipamento`, `remover_habilidades`, `efeitos_adicionar`, `efeitos_remover`, `feito`, `grupo_adicionar`, `grupo_remover`, `grupo_vida`, `grupo_xp`, `grupo_itens`, `grupo_atualizar` | `aplicarMudancas` (`src/regras-jogo.js:139`, de `aplicar.js:348`) | PV, PM, ouro, inventário, equipamento, buffs, XP e nível (`feito`), companheiros |
| luta (2) | `combate_iniciar` (só SEM ALVO), `combate_encerrar` | `processarCombate` (`regras-jogo.js:536`, de `luta-do-turno.js:139`) | abre a luta; **fecha a luta e paga o espólio — a poda não o cobre** |
| mundo (7) | `mapa_cidades`, `mapa_faccoes`, `lugar_atual`, `cidade_atual`, `jornada_meio`, `faccao_jogador`, `evento_global_encerrar` | `meio-do-turno.js:178–527` | cria cidade e facção, muda o lugar e a cidade, encerra a viagem e o evento global |
| sinais (1 campo, 9 sub-portas) | `fe`, `milagre`, `viagem`, `masmorra`, `raid`, `ascender`, `loot`, `dominio`, `patrono` | `meio-do-turno.js:577–670` | fé, milagre, raid, ascensão divina, … |
| memória (2) | `canone`, `npcs` | `aplicar.js:481`, `:529` | cânone (com peneira), cidade no mapa, NPC novo |

Ignorados de propósito (a): `xp`, `adicionar_habilidades`, `dano_ambiental`,
`combate_inimigo_vida`, `combate_atualizar`, `combate_remover`, `quest_nova`,
`quest_atualizar`, `historia_avancar`.

### O texto que vira estado: 9 portas do tipo (c)

| leitor | onde | o que faz |
|---|---|---|
| `oQueFaltaCreditar` | `aplicar.js:377` → `cobranca.js:460` | credita moeda e consumível que a prosa citou |
| `oQueFaltaDebitar` | `aplicar.js:408` → `cobranca.js:600` | debita o pagamento que a prosa citou |
| `mencionadosNaCena` | `fim-do-turno.js:73` | revela a base do mundo e cria NPC |
| `nomesAMaoNaProsa` | `fim-do-turno.js:105` | cria NPC; marca-o morto se a frase o matou |
| `detectarChegada` | `fim-do-turno.js:171` | muda a cidade e avança o relógio |
| `aNemesisNaNarrativa` | `entrega-do-turno.js:40` | encerra a nêmesis |
| `osVistosDaNarrativa` | App (a entrega) | recência do elenco (quem está «em cena») |
| `segredosReveladosNoTurno` | `cronista-do-turno.js:351` | fecha segredos da espinha |
| **o Cronista** (2.ª IA) | `cronista-do-turno.js:102`, julgado em `cronista.js:718`, aplicado em `cronista-do-turno.js:173` | lê a narrativa e propõe ~13 coisas: `lugar`, `canone`, `pessoas`, `falou_com`, `fe`, `grupo.entraram`, `teste_sugerido`, `combate.mortes_narradas`, `missao_oferecida`, `relogio_novo`, `promessas`, `promessas_pagas`, `missoes.global_encerrado` |

Guardas que leem a narração mas só **cortam** ou pedem conserto, e que não
contam como porta: o Portão (`fim-do-turno.js:232`), o Juiz (`julgarOTurno`, que
vira veto na pauta seguinte), `semFalaInventada`, `fechoDaNarrativa`.

**Total: 29 portas JSON (c) + 9 portas de texto (c)**, e a do Cronista vale
por ~13.

**Fáceis de fechar**, porque o sistema já decide por outro caminho:
`mapa_*`, `lugar_atual`/`cidade_atual`/`jornada_meio` (a rota e o Intérprete),
`canone`/`npcs` (o Cronista e os nomes à mão), `evento_global_encerrar`,
`grupo_*` (a tela), `moedas` (a cobrança), `feito` (zero usos), `combate_encerrar`
(o sistema já fecha a luta quando todos caem; basta pô-lo na poda),
`adicionar_equipamento` (o chão e o espólio), e os sinais `viagem`, `masmorra`,
`loot`, `dominio` e `patrono`.

**Difíceis, porque hoje só o Narrador sabe:**
- o sinal `raid` (a única porta da raid);
- `ascender` e `milagre` (divindades);
- `fe`, que tem duas portas: o sinal e o Cronista;
- `combate_iniciar` no caso SEM ALVO;
- `adicionar_itens` do objeto de missão, que `ofertas.js:525` ainda pede;
- cura, item gasto na ficção e buff narrado.

E as **portas de texto inteiras**: elas existem justamente porque o Narrador
inventa gente, lugar, preço e chegada na prosa, e o sistema corre atrás para
registrar.

---

## 3. O que o sistema já decide, e o que ainda é do Narrador

**Já é do sistema:**
- todo dado, teste, vantagem, crítico e salvaguarda;
- a luta inteira (a grade, os golpes, o dano, o espólio, o XP);
- preço, compra e venda (a bolsa e a cobrança);
- o tempo e o relógio;
- o lugar e o que ele comporta (ONDE, NÃO PODE);
- quem existe e quem está em cena (EM CENA, QUEM ESTÁ EM CENA);
- quem é cada um e o que quer (QUEM É);
- **o que cada pessoa FAZ** (o Intérprete, `src/interprete.js`, que por lei não diz o que ela diz);
- o que o herói sabe sem rolar (passivos);
- a resposta factual a uma pergunta (PERGUNTOU, O PREÇO);
- o ritmo e o momento do arco (o compasso, a espinha);
- como a cena acaba (O FECHO);
- as opções do jogador (os botões vêm do sistema; `sugestoes` do Narrador ninguém lê).

**Ainda é do Narrador:**
1. **O conteúdo da fala.** O que o NPC diz, oferece, promete, recusa, revela.
   O Intérprete diz o gesto, a pauta diz o motivo, mas *a promessa do Corrado*
   (13.ª, defeitos 4–5: «promete e desdiz, e o pedido dele muda entre a pauta e
   a prosa») nasce na prosa, e o Cronista a transforma em promessa e missão.
   **Este é o buraco central do «ator».**
2. **A gente nova e o lugar novo.** Figurante que ganha nome, sala, objeto,
   «o que há lá dentro» (13.ª, defeito 3: nove turnos de imaginação). Hoje entram
   no sistema por `nomesAMaoNaProsa`, `mencionadosNaCena` e o Cronista.
3. **A chegada** a um destino narrado (`detectarChegada`).
4. **O ouro e o item na ficção**: «ele lhe atira duas moedas», o pão comido
   (a cobrança credita e debita o que a prosa disse).
5. **O que move a espinha por fora do código**: segredos revelados lidos da prosa,
   a nêmesis que cai, a missão oferecida, o relógio novo, a raid, a ascensão, o milagre.
6. **O começo de luta sem alvo declarado** (a emboscada que a prosa abre).

No modelo do ator, cada um destes passa a ser **decidido antes da chamada** e
entregue como linha da pauta («Corrado PEDE: escoltar a carroça até o vau,
paga 30 moedas, não diz por quê»). O que a prosa disser a mais morre na tela.
As 9 portas de texto e o Cronista deixam de ter função.

---

## 4. A estimativa

### O pedido do ator

O que entraria, medido sobre os mesmos 147 turnos:

| peça | chars |
|---|---:|
| voz e estilo, curto (a voz da casa sem os blocos de ofício) | 1.500–2.000 |
| contrato e formato em uma linha («só fale; texto puro; 80–140 palavras») | ~150 |
| ficha de quem está em cena (herói em 2 linhas + quem é e voz de cada NPC) | 300–800 |
| a pauta de hoje + o envelope do que aconteceu (já decidido) | 1.275 (até 1.801) |
| o que cada um tem de dizer (linha nova por pessoa) | +200–500 |
| a frase do jogador e o tamanho | 316 |
| memória curta: as duas últimas trocas, só para não repetir | 0–1.565 (até 3.331) |

| variante | média | pior |
|---|---:|---:|
| enxuto (sem memória) | 3.391 | 3.882 |
| **típico** (voz de 2 mil + duas trocas) | **5.655** (~1,6 mil tokens) | 7.460 |
| rico (voz inteira de hoje + duas trocas) | 7.755 | 9.560 |

Comparado com os **65.637 de hoje**, o pedido típico tem **8,6%** do tamanho: é
**11,6 vezes menor**. No pior caso, 7,5 mil contra 79,5 mil.

**O cache deixa de existir, e não faz falta.** O Google não guarda prefixo
abaixo de 4.096 tokens (`CACHE_EXPLICITO.minTokens`), e ~1,6 mil não chega lá.
Todo token é pago cheio, mas são 1,6 mil em vez de 6,9 mil novos + 11,9 mil
relidos + 1,5 mil escritos. Também some a guarda por hora e toda a engenharia
da janela ancorada e da ficha do cache.

### O custo por turno

Preços de `src/custo.js`, em US$ por milhão de tokens (entrada / cache / saída):
gemini-3.8-flash 0,75 / 0,075 / 3,75; gemini-3.5-flash-lite 0,30 / 0,03 / 2,50;
gemini-3.1-flash-lite 0,25 / 0,025 / 1,50.

| | entrada | saída | Narrador/turno | + Cronista | **turno** | vs. hoje |
|---|---|---|---:|---:|---:|---:|
| **hoje** (13.ª, medido) | 6,9 mil novos + 11,9 mil cache + 1,5 mil escrita | ~700 (com o pensamento LOW) | 0,0097 | 0,0009 | **0,0106** | — |
| ator no **3.8 Flash** | 1,6 mil | 400–700 (o pensamento LOW continua; a narrativa ~200) | 0,0027–0,0038 | 0 | **~0,0030** | **−65% a −75%** |
| ator no **3.5 Flash-Lite** (pensamento MINIMAL) | 1,6 mil | ~250 | ~0,0011 | 0 | **~0,0011** | **−90%** |
| ator no 3.1 Flash-Lite | 1,6 mil | ~250 | ~0,0008 | 0 | ~0,0008 | −92% |

Em sessão de 63 turnos: hoje ~US$ 0,67. Ator no 3.8, ~0,19. Ator no Flash-Lite,
~0,07. E em 01/01/2027 o 3.8 Flash dobra de preço (`custo.js`), o que torna o
modelo menor ainda mais atraente.

**Duas coisas mudam de natureza:**
1. **A saída passa a ser o custo maior.** No 3.8 Flash o pensamento é pago como
   saída e o piso dele é LOW: com 1,6 mil de entrada, ~70% da conta é pensar e
   falar. Por isso o modelo menor ganha tanto: o Flash-Lite aceita MINIMAL, e
   um ator não precisa raciocinar sobre regra nenhuma.
2. **O Cronista sai do turno.** Se nada do que o ator diz entra no sistema,
   não há o que transcrever. Saem os ~US$ 0,0009 e a segunda chamada (latência).

### A ressalva honesta

O preço baixo vale **se o sistema souber escrever «o que cada um tem de dizer»**.
Hoje ele sabe o gesto (o Intérprete), o motivo (QUEM É), o fato (PERGUNTOU,
O PREÇO) e o fim (O FECHO). **Ele não sabe o conteúdo da fala**: a oferta, a
promessa, a recusa, o segredo que escapa. São as portas do item 3, e é trabalho
de motor, não de prompt.

Há duas saídas:
- **Em código** (tabelas de intenção de fala por papel e momento). É o
  determinismo da casa, e custa fases.
- **Um «diretor» de IA antes do ator**, que lê o estado e escreve as intenções.
  Num Flash-Lite com ~5–8 mil tokens de estado, sai a ~US$ 0,002–0,003 por
  turno. Isso devolve parte do ganho e põe a imaginação de volta, só que
  noutro lugar. Se o diretor for IA, a resposta dele tem de passar pelo mesmo
  juízo que hoje o Cronista passa.

Também se perde o que hoje só chega pela prosa: gente que nasce na cena, sala
que se descobre, chegada narrada. A troca é a régua da Fase MM levada ao fim:
**toda resposta é verdade, porque a imaginação não tem porta para o estado.**
Mas o mundo só cresce pelo que o sistema gera, e a geração (gente, salas,
objetos, falas-intenção) tem de estar pronta antes.

**O ganho que não é dinheiro:** metade do pedido é regulamento com 27 «NUNCA»,
e isso some. O ator recebe ~5,6 mil caracteres, dos quais ~2 mil são voz. Hoje a
voz é 5,8% do que ele lê; no ator passaria a ~35%. É a aposta mais direta contra
a fala robótica que o projeto tem à mão.
