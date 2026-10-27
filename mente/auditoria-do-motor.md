# A auditoria do motor — o Taverna como tecnologia a licenciar

> **Pedido da pessoa (27/10/2026):** *"Quero vender o jogo como tecnologia, nada em mente. Olhando o que já temos, o que deve ser melhorado ou refeito? O que está perfeitamente funcionando e o que está ruim? O que mais conseguimos acrescentar ao motor do jogo?"*
> **Quem mediu:** o `conselheiro`, sobre `v9.475` (`eb4ad00`), árvore com só `mente/agora.json` e 4 PNG do Figma fora do commit. **Só medição e juízo:** nada em `src/`, `api/` ou `testes/` foi tocado, nenhuma chamada paga, nenhum navegador.
> **Como se mediu:** seis scripts no scratchpad da sessão (`acopla.cjs`, `cob.cjs`, `app.cjs`, `regiao.cjs`, `lingua.cjs`, `grupos.cjs`). Eles contam imports, suítes que citam cada módulo, linhas do `App.jsx` por região e por tipo, `Math.random`, regex e strings em português. Também `npm test` inteiro, e os relatórios das sessões 7, 10, 11 e 12, o `custo-do-turno`, o `ab-provedores` e o `narrador-so-narra`, lidos por âncora.
> **A margem:** as contagens por regex de linha são aproximadas (±10%). Onde o número é estimativa, está escrito.

---

## 0. O resumo, em uma tela

**A pergunta do comprador:** *"o que o motor decide sem a IA, e posso usá-lo sem o Taverna?"*

- **O que o motor decide é muito, e é real.** São 214 módulos puros, **93 mil linhas**, e **nenhum importa React** (0 de 214). Isso cobre combate em grade, economia com estoque, mundo, elenco, uma espinha de campanha com núcleo, subtramas e reviravolta escondida do Narrador, além da pauta por turno com teto. A prova são **354 suítes verdes com ~18,4 mil asserções, mais 16 varredores**, em 6 min 22 s. Medido nas sessões: o preço vem do sistema 5 de 5 vezes, a bolsa 5 de 5, e o Narrador escreve estado (`mudancas`) **0 vezes em 63 respostas**.
- **O motor não se usa sem o Taverna.** O *turno* não está num módulo. Está dentro do componente React `Taverna()`, num corpo de **22,3 mil linhas** antes do `return`: 13,7 mil de código e 7,7 mil de comentário. O estado vive em **240 `useRef`** e **170 `useState`** (5.198 leituras de `Ref.current`). Ali ficam também **115 dos ~300 envelopes do prompt** e o prompt inteiro do Cronista. **Não existe a função `turno(estado, frase) → resposta`**, e sem ela não há produto a licenciar: há um jogo com bibliotecas muito boas.
- **Uma lei da casa não se cumpre.** "Mesma semente = mesmo resultado" não vale no combate. O dado do jogo vivo rola em `Math.random`: há **103 chamadas diretas em 29 módulos** e 30 no `App`, e as três chamadas de `resolverAtaque` no `App` não passam `rolar`. Sem isso não há replay, nem auditoria, nem servidor que confira.
- **A IA ainda decide estado, pelo Cronista.** Ele lê a prosa e grava onde o herói está, quem entrou no grupo, quem morreu, quanto de fé houve e quanto paga a missão. Na 11.ª sessão foi **o eco**: o Mestre inventa, o Cronista regista, o sistema devolve. Isso explica 4 das 7 invenções de enredo.
- **A qualidade estabilizou.** As notas da 4.ª à 12.ª sessão foram **3,0 · 3,0 · 3,2 · 3,6 · 3,2 · 3,0 · 3,3 · 3,6 · 3,3**, em cerca de 100 versões (v9.371 → v9.472). Os consertos fecham o caso e a classe volta, como a viagem fantasma, que apareceu na 7.ª, na 12.ª e já em 24/09.
- **O custo é um argumento de venda.** São **US$ 0,0105 por turno, US$ 0,34 por hora (R$ 2,09)** no Gemini 3.8 Flash, com o cache a 64% e 4,6 s por resposta (12.ª). Isso dá −64% contra a 11.ª. **O aviso:** o modelo dobra de preço em 01/01/2027.

**Separar o motor do App é a obra.** São ~13,7 mil linhas de código no componente: estimo ~6–8 mil de orquestração de regra a mover, ~2 mil de prompt e envelopes a juntar ao `prompt.js`, e o resto fiação de tela legítima. Pelo ritmo da casa (837 commits em 100 dias) são **6 a 10 semanas**, e **as ~490 asserções que leem o texto do `App.jsx` vão partir no caminho**. É `pesado`: muda o que um commit revertido conserta (as suítes) e é a condição de tudo o que vem a seguir.

---

## 1. O mapa do motor

**O tamanho total.** São 214 módulos `.js` (93.069 linhas), 26 `.jsx` (42.259, dos quais o `App.jsx` tem 28.966), 4 rotas em `api/` (927 linhas), 354 suítes, 16 varredores, 6 varreduras e ~20 sondas/medidores. O primeiro commit foi a 19/07/2026, o atual é o v9.475, e são 837 commits.

**O acoplamento, medido:**

- **React no motor:** 0 de 214 módulos o importam, e nenhum `.js` importa `.jsx`. **A camada pura é real.**
- **O hub de entrada:** o `App.jsx` importa **213 módulos locais**. 45 módulos só são lidos pelo `App`. Os outros 27 são lidos só por módulos (o diretor e o combate falam entre si).
- **O hub de saída:** o `prompt.js` importa **69 módulos**. Toda a verdade passa por ele para chegar ao Narrador.
- **Os mais lidos:** `geografia` (41 importadores), `constantes` (31), `mundo-base` (19), `lugar`, `semente`, `estilo` (17), `condicoes` (16), `lexico` e `classes` (14).

Na tabela abaixo, "suítes" conta as suítes que citam algum módulo do sistema, e "t(" as asserções dessas suítes (há sobreposição entre sistemas).

| sistema | módulos · linhas | o que decide **sem IA** | suítes · t( | prova jogada (sessões) | depende do App para correr? |
|---|---|---|---|---|---|
| **Diretor de histórias** (espinha, batidas, núcleo, subtramas, reviravoltas, vilão, fecho, escuta, encalhe/escada, promessas) | 30 · 12.583 | Atos e marcos. A verdade eleita da reviravolta, que o Narrador não vê. O núcleo de 4–6 pessoas com ficha dramática por semente (quer, teme, esconde, carrega, linha que não cruza). Subtramas de 3 batidas. Tom da batida. Quando a revelação cai. O degrau do encalhe. Como a resposta fecha. | 114 · 6,6 mil | Frase fechada (`QUEM CARREGA`) cumprida 10/10 (7.ª) e 7/7 (11.ª). A revelação **não caiu** na 7.ª e **caiu** na 10.ª (resposta 47). Nota da reviravolta **3 em todas as sessões** (alvo 4). | **Sim.** `avancarCoracao`, a pauta e o envelope são chamados e costurados no `App` (`pautaDoTurno`, 415 linhas). |
| **Combate** (combate, grid, fuga, queda, golpe final, condições, efeitos, companheiros, degraus táticos, magias, habilidades) | 42 · 18.968 | d20 com vantagem, defesa, dano, crítico. Condições e aflições. Alcance e linha em grade. Fuga e golpe de oportunidade. A decisão tática do inimigo **sem LLM** (N1–N2). Concentração, PV temporário, quedas. | 113 · 7,5 mil | Luta sem luta: **0** (10.ª e 11.ª). "A prosa respeita o dado" (aparar 3 em vez de 7). As portas abrem 3/3 no alvo certo (10.ª). Retrato de arena: vitória 52,1%. | **Sim, na ordem.** Não há cursor de vez no `combate.js` (pedido aberto desde 16/09). A rodada corre no `App` (`correrORestoDaRodada` 270, `executar` 285, o alvo 252). |
| **Economia** (mercado, comércio, cobrança, bolsa da frase, loot, itens, oficina) | 20 · 6.204 | Preço por tabela e escala. Estoque. O que a frase paga. Recompensa. O veredito do que falta antes do clique ("faltam 46"). | 68 · 3,5 mil | Preço cumprido 11/11 (10.ª), 5/5 (11.ª). Bolsa: cada "pago N" desce N, 5/5 (11.ª), com 0 moedas perdidas. Preço inventado 8 → 1 → 3 → 1 (9.ª–12.ª). | Pouco: a bolsa é pura. |
| **Mundo e geografia** (mundo-base, geografia, região, mapa vivo, lugar, cidade por dentro, marcha, viagem, masmorras, raids, calendário, clima) | 27 · 13.001 | O mapa e a região delimitada. Distâncias e caminhos. A cidade por dentro. Encontros da estrada (`INVESTIDA_DA_ESTRADA`). Salas de masmorra. O relógio do mundo. | 145 · 8,0 mil | Distância ou tempo fora do sistema: **1, 2, 3, 5, 4, 1** da 7.ª à 12.ª (alvo 0, nunca atingido). **Viagem fantasma** na 7.ª (M50), na 12.ª (defeito 1) e no censo R21 (24/09). | **Sim:** `viajar` (275), `interceptarMovimento` (218), `acharCidade`. **Onde o herói está é decidido no App.** |
| **Elenco e social** (npcs, elenco, gente por dentro, índole, intérprete, social, crime, facções, guildas, domínios, devoção) | 29 · 11.592 | Quem existe e onde. A índole. O que uma pessoa *faz* quando o herói age (o Intérprete). Persuasão. Crime e lei. Diplomacia. | 111 · 6,5 mil | Pessoa inventada **0** (12.ª), 2 (11.ª). Personagens com nota 4 na 7.ª e na 11.ª, e 3 na 12.ª pelo tique "Sou Wystan" (5 em 27). Registro em confete: 8 nomes sem verbo (12.ª). | Médio. |
| **Cena, EM CENA, fichas, memória** | 13 · 4.343 | A lista de 1–4 coisas em cena, com ficha (id, papel, preço, distância, hostil). O reconhecimento por id. O Códice. | 40 · 2,5 mil | **5 de 13 toques de ficha mal lidos** (10.ª): *"a lista é a da prosa"*. Os consertos vieram depois. A 11.ª e a 12.ª não mediram toque a toque. | Sim (a montagem e o lugar vêm de refs). |
| **Narrador** (prompt, pauta, janela/cache, JSON, assuntos, estante, lei da forma, agressão, testes) | 15 · 8.646, **mais 469 linhas de rodapé e 115 envelopes no App** | O que o Narrador lê. A pauta com prioridade e `TETO_DA_PAUTA` = 1400. Os vetos (`naoPode`). **A poda:** `podarONarrador` arranca da resposta toda a ferida, a luta ou a vida negativa que a IA tentar. A janela ancorada para o cache. | 116 · 7,0 mil | `mudancas` 0 de 63 (11.ª). Vazamentos 0. Cache 25% → 64%. Pauta cumprida ~94% (11.ª). Pergunta direta sem resposta 3 em ~14 (12.ª). | **Sim, e em dobro:** o `prompt.js` monta o system, o `App` monta o rodapé e mais de um terço dos envelopes. |
| **Cronista** (gatilho, custo) | 2 · 408, **mais as 374 linhas de `cronistaDoTurno` no App, com o prompt dentro** | Só *quando* ler (o gatilho: 0,59 leituras por turno). **O que gravar decide a IA.** | 6 · 0,3 mil | O eco: 4 de 7 fios inventados (11.ª). 7% da conta (12.ª). | **Totalmente.** |
| **Roteamento e custo** (`api/narrador.js`, `custo.js`, `janela.js`) | 542 + 201 + 340 | Plano → modelo por variável de ambiente. A casa sai do id do modelo. Reserva em cadeia (DeepSeek → base → Cronista). Piso do pensamento por modelo. A conta por chamada. | (no grupo do Narrador) | O custo do save bateu com a conta à quinta casa (0,2847 contra 0,28467, 12.ª). | Não: a rota é servidor e o `custo.js` é puro. |
| **Sala a dois** (sala, transporte, `api/sala`) | 4 · 880 + 151 | Quem está sentado e a junção das duas ações num turno. O anfitrião manda: o save inteiro é sobrescrito no Redis a cada turno e o convidado consulta a cada 2 s. | 4 · 0,2 mil | **Não achei sessão de prova da sala.** `teste-sala.mjs` falha de forma intermitente (pedido aberto, R13, 23/09). | Sim. |
| **Voz** (`api/voz.js`) | 56 | Nada: é um proxy para o Fish Audio. | — | — | — |
| **Léxico** | 1 · 1.130 | Os nomes do mundo por gênero (7 gêneros, cada gerador resolve `OCUPACOES[g]`). Desde 20/10 é só camada de cor. | 17 · 0,6 mil | Morria no Gemini por `MAX_TOKENS`, com 57 s na criação (12.ª). Consertado no v9.473 (`redeDaTarefa`). | Pouco. |
| **Personagem** (classes, subclasses, antecedentes, atributos, moldes, companheiro inicial, descanso, acampamento) | 16 · 5.077 | A ficha, a progressão, o companheiro, o descanso, o que a fogueira cura. | 129 · 7,1 mil | O antecedente vira gancho: nota 4 em todas as sessões. | Médio. |
| **Save** (`guardado.js` + `retratoDoJogo`) | 1.187 + ~100 linhas no App | O turno se completa ou não começou (`travaODeclarar`: não se rola duas vezes por queda de rede). | 2 · 0,2 mil | Save de 396 KB (7.ª). | **Sim:** o save é a fotografia de **~186 refs** feita no `App`. **Não achei versão de esquema no save.** A migração é tolerância campo a campo no load (17 menções). |

---

## 2. O veredito por sistema

| sistema | **funciona bem** (com a prova) | **funciona, mas está ruim ou frágil** (o sintoma medido) | **tem de ser refeito** (a razão) |
|---|---|---|---|
| **Diretor de histórias** | **A ideia é a coisa mais vendável da casa.** A verdade eleita longe do Narrador, o núcleo com ficha dramática por semente e a frase fechada cumprida 10/10 e 7/7. | **A entrega depende de o Narrador obedecer.** A revelação não caiu na 7.ª, com as duas pistas maduras e o jogador a nomeá-las. A ordem aberta é ignorada, a frase fechada é cumprida. A reviravolta ficou em nota 3 em nove sessões. A pauta "cala" o coração em 68% das respostas (7.ª). | — (o desenho está certo: falta-lhe autoridade, e isso é do Narrador e da cena). |
| **Combate** | **As regras.** d20, defesa, dano, condições, grade, fuga, quedas e IA tática sem LLM, com 113 suítes e uma régua de arena com catraca. Luta sem luta: 0. | **Promessas sem leitor.** O "+2 de defesa" de **34 fichas** chega a zero na mesa desde 16/09 (`modAlvo.defesa` continua fora do `combate.js`), F4–F6 estão abertas e há números soltos (`Math.random() < 0.35` em `combate.js:509`, contra a lei "se é número, é tabela"). | **A orquestração.** A ordem da rodada, a vez, o golpe do jogador e o revide vivem no `App`. **E o dado sem semente:** o combate do jogo vivo não é reproduzível. |
| **Economia** | **O melhor sistema medido.** 5/5 preços, 5/5 bolsa, 0 moedas perdidas e o veredito antes do clique. | **Falta tabela.** O preço que o Mestre ainda inventa é de serviço sem tabela (cama, taxa, carroça: 3 na 11.ª). "maçã" foi lida como "maca" (7.ª): a leitura é por regex em português. | — |
| **Mundo e geografia** | O mapa, a região, a cidade por dentro e os encontros com semente. 145 suítes. | **A distância inventada nunca chegou a 0** em seis sessões. | **A autoridade do lugar.** Onde o herói está sai de uma regex sobre a frase, do Cronista e de `viajar` no `App`, e os três discordam. A viagem fantasma voltou três vezes em um mês. **O conserto não é mais um caso: a posição do herói precisa de um dono único, e a prosa que a contradiz tem de ser podada como já se poda a ferida.** |
| **Elenco e social** | Pessoa inventada 0 (12.ª). O Intérprete decide o que a pessoa *faz*. Nota de personagens 4 (7.ª, 11.ª). | **Os tiques** ("Sou Wystan" 5 em 27, *cospe* 48%). O registro em confete (o lugar decide a relevância, e não a cena). O nome e o gênero trocados (7.ª). | — |
| **EM CENA e fichas** | O contrato está certo: o sistema entrega e o Mestre usa. | **5 de 13 toques mal lidos** na última medida (10.ª). A lista nascia da prosa. Os consertos posteriores **não têm medida toque a toque** (11.ª e 12.ª não a fizeram). | — (falta prova, não desenho). |
| **Narrador** | **A poda** (`podarONarrador`): a IA *não consegue* ferir, abrir luta nem mudar vida. `mudancas` 0 de 63. O cache. O teto da pauta. | **O prompt é enorme e está em dois sítios.** O Narrador lê ~68 mil caracteres de system, ~13 mil da mensagem do turno e ~47 mil de histórico. A pauta anda a 96% do teto, e o rodapé é sete vezes maior que ela. Há 78 proibições em caixa alta (NÃO, NUNCA). O pior caso com gente chega a 80.475 caracteres, encostado ao teto de ~82 mil. | **A montagem.** O system no `prompt.js` e o rodapé com 115 envelopes no `App` têm de ser um módulo só, no servidor (ver §4: hoje o prompt viaja no navegador). |
| **Cronista** | O gatilho poupa (0,59 leituras por turno, 7% da conta). | — | **Refazer o papel.** É o único sítio onde a IA ainda decide estado: lugar, quem entrou no grupo, mortes narradas, devoção (números: "fieis 10 a 500") e a **paga** de uma missão. O eco da 11.ª saiu daqui. **Para quem compra, "a IA só narra" é a promessa, e este é o buraco dela.** O Cronista deve só *propor*, contra o EM CENA e o registro. O número nunca sai dele. |
| **Roteamento e custo** | **Pronto para licenciar.** Plano por variável, três casas, reserva silenciosa, piso de pensamento e a conta que fecha à quinta casa. | **Depende do preço de um fornecedor.** O Gemini 3.8 Flash dobra em 01/01/2027. A própria economia trouxe uma regressão (o Léxico com a rede de 1.200 tokens, v9.468). | — |
| **Sala a dois** | Liga e funciona entre abas (BroadcastChannel) e por Redis. | **Nunca foi provada numa sessão.** O teste é intermitente. O save inteiro (80–400 KB) sobrescrito por turno não escala. O anfitrião é a autoridade, e sem dado com semente o convidado não tem como conferir. | **Para vender "mesa a vários", sim:** o mundo tem de viver no servidor e viajar em diferenças. |
| **Voz** | Funciona. | **O plano gratuito do Fish Audio para uso comercial não está verificado** (não sei os termos). | — |
| **Léxico** | 7 gêneros parametrizados. Uma chamada por campanha. Camada de cor desde 20/10. | O nome "cozido" em português (§4). | — |
| **Save** | `guardado.js`: o turno não se rola duas vezes. | **Sem esquema e sem versão.** É uma fotografia de ~186 refs. 396 KB. O `nomeCampanha` já virou "Aventura" uma vez (pedido R13, *"custa dado de jogador"*). | **Junto com o turno:** o estado tem de ser um objeto, e o save a serialização dele com versão. |

---

## 3. O `App.jsx` — 28.966 linhas, e o que é cada coisa

**As três regiões** (`regiao.cjs`):

| região | linhas | comentário | código | JSX |
|---|---:|---:|---:|---:|
| 27 subcomponentes (linhas 1–5.434: `PainelLateral` 1.221, `FaixaDeChegada` 424, `TelaPersonagem`, `TelaMenu`, `TelaSala`…) | 5.434 | 1.397 | 3.768 | 1.848 |
| **o corpo de `Taverna()` antes do `return`** (5.435–27.705) | **22.271** | **7.750** | **13.680** | **28** |
| o `return` de `Taverna()` (27.706–fim) | 1.261 | 484 | 718 | 402 |

**A conclusão é mais forte do que "o App é grande".** O corpo de `Taverna()` tem **28 linhas de JSX em 22 mil**: não é tela. É o motor do turno, escrito como closures de React. A tela do `App` são ~4,5 mil linhas de código (os subcomponentes e o render), e o resto do visual já mora em `painel-*.jsx`.

**O que está dentro desse corpo**, das maiores funções:

| função | linhas | o que é |
|---|---:|---|
| `aplicarResposta` | **1.169** | aplica a resposta do Narrador ao estado: a poda, a cidade, a bolsa, os NPC, as missões… **o coração do turno** |
| o `rodapé` do prompt | 469 | prompt (o `[RODAPÉ DO SISTEMA]`) |
| `pautaDoTurno` | 415 | a pauta: costura dos conselheiros |
| `concluirRolagem` | 411 | o teste de dados e as consequências |
| `continuar` | 395 | o laço do turno |
| `cronistaDoTurno` | 374 | **o prompt do Cronista está aqui**, e a aplicação do que ele devolve |
| `executar`, `correrORestoDaRodada`, o alvo | 285 · 270 · 252 | a rodada de combate |
| `viajar`, `interceptarMovimento` | 275 · 218 | onde o herói está |
| `iniciar`, `avancarDiasReino`, `sairDoAcampamento`, `cobrar`… | 258 · 245 · 222 · 179 | o resto do turno |

**A composição, estimada por amostragem** (45 linhas sorteadas do corpo e os padrões contados):

- **Fiação legítima** (ler refs, chamar o módulo, `salvar`, `calou`): ~45%. São **3.164 linhas com `Ref.current`** e **452 `calou(`** no corpo.
- **Orquestração de regra**, a que impede licenciar: ~40%, ou **~5,5 mil linhas**. A ordem do turno, a ordem da rodada, os `if` que decidem o que acontece, e **251 linhas com aritmética e número literal** no arquivo inteiro (por exemplo `const custo = jaTinha ? 80 : 20;`, `Math.max(5, …)`).
- **Prompt**: ~15%, ou **~2 mil linhas**. São **115 envelopes distintos** (`[FESTIVAL — …]`, `[COMBATE — RESOLVIDO PELO SISTEMA]`…), 178 linhas de envelope, mais o rodapé e o Cronista. Os módulos têm 194: **37% da voz do Mestre ao Narrador está no `App`**.

**O esforço de separar**, em quatro passos, cada um verde antes do seguinte:

1. **O estado vira um objeto (1–2 semanas).** O começo é de graça: `retratoDoJogo` (linha 9.352) já enumera os ~186 campos. O passo é fazer do snapshot a fonte, com os refs a ler dele, e dar ao save um esquema com `versao`. **É pesado pela lei de 23/09:** muda o save, e um revert não desfaz o save reescrito. Aqui é campo novo, e o antigo continua a ser lido.
2. **O turno sai do componente (3–5 semanas).** `aplicarResposta`, `pautaDoTurno` com o rodapé, `cronistaDoTurno`, `continuar`, `concluirRolagem` e a rodada de combate vão para `src/motor/` como funções `(estado, entrada) → { estado, pauta, efeitos }`. Os `setX` passam a ser efeitos que o `App` aplica. São ~7–8 mil linhas movidas, e uma boa parte reescrita, porque são closures sobre refs.
3. **As suítes de texto viram suítes de comportamento (2–3 semanas, em paralelo).** **187 das 354 suítes leem o `App.jsx` como texto, 47 só fazem isso, e há ~490 asserções por `.test(app)`, `app.includes(` e `app.match(`.** Todas provam que *a linha está lá*, não que *o turno faz*. O passo 2 parte-as aos centos. Cada uma deve renascer como chamada ao motor, com o motivo num comentário (lei da casa).
4. **O prompt vai para o servidor (1 semana).** Hoje `POST /api/narrador` recebe `{ system, messages }` montados **no navegador**: o prompt inteiro e o motor inteiro vão no bundle para quem abrir o devtools. Para licenciar, a montagem tem de morar no servidor, e o cliente manda o estado e a frase.

**Total: 6 a 10 semanas** no ritmo da casa. **A incerteza maior é o passo 2.** Não sei quanto da ordem dos efeitos no `aplicarResposta` depende da ordem em que os refs são escritos; 1.169 linhas cheias de comentários de bug de ordem ("ANTES de montar `dados`, e a ordem é o conserto") dizem que depende muito.

---

## 4. O que falta para licenciar como tecnologia (e não como jogo)

| peça | hoje | o que falta | peso |
|---|---|---|---|
| **O contrato do motor** (entrada: estado e frase · saída: pauta, decisões e estado novo) | **Não existe.** O turno está em `Taverna()` (§3). | `motor.turno(estado, { frase, toque })` → `{ estado, pauta, envelopes, naoPode, efeitos }` e `motor.aplicar(estado, respostaDoNarrador)` → `{ estado, podado, paraOCronista }`. Uma suíte de integração que joga 20 turnos em Node, sem React e sem rede. | **pesado** |
| **Independência de React** | **Cumprida no motor** (0 de 214) e **falhada no turno**. | Os passos 1 e 2 do §3. | (o mesmo) |
| **Determinismo e replay** | O mundo, a abertura, o fecho e a fuga têm semente. **O combate e mais 28 módulos não:** 103 `Math.random()` diretos (`divindades` 16, `masmorras` 12, `correio` 8, `combate` 8, `encontros` 7…), mais 61 como valor padrão, mais 30 no `App`, incluindo o dado da tela (pedido aberto desde 24/09). | Todo dado por `rng(hashSemente(semente|turno|evento))`. Um varredor novo que proíba `Math.random()` em `src/*.js` (a casa já tem a forma: `check-*.mjs`). Depois, "a sessão é um arquivo": semente mais as frases reproduzem a campanha. | **médio** (é lei que existe e não se cumpre; a catraca é leve, a conversão médio) |
| **Outra língua** | **O português está cozido em dois níveis.** (a) **A leitura da frase do jogador é regex:** 572 das 1.700 regex do motor (34%) têm português. As maiores são `desafios.js` 89, `glifos` 25, `testes` 21, `condicoes` e `social` 20, `aflicoes`, `habilidades` e `rastro` 19, mais `agressao`, `interprete`, `bolsa-da-frase`, `escuta`. (b) **O conteúdo:** 8.419 strings de 12 ou mais caracteres com português (`assuntos` 583, `estante` 416, `nucleo` 391, `especializacoes` 318, `classes` 296…), além do prompt inteiro. | (b) é tradução de tabela, e a casa já a tem em tabela: caro mas mecânico. **(a) é o problema.** Ou se reescreve a leitura por língua (um módulo `ouvido-<língua>.js` por trás de uma interface), ou se troca a regex por um classificador de intenção, o que é uma IA a decidir e choca com a filosofia. **Proposta:** um "intérprete" por língua com um contrato de saída fixo (`{ verbo, alvoId, objeto, quantia }`), provado pela mesma bateria de frases traduzidas. | **pesado** |
| **Outro modelo de IA** | **Já parametrizado.** Três casas, plano por variável, reserva. O A/B de 12 pautas e 7 modelos está feito (`ab-provedores.md`). | O prompt está **afinado para o Gemini** (cache explícito do Google, piso de pensamento). O A/B mostra que a obediência muda muito por modelo (Haiku e Qwen piores que o DeepSeek em "cumprir" e "não inventar"). **O licenciante precisa de uma régua automática** que diga se o modelo dele obedece (ver adição 2). | médio |
| **Outro cenário** | O Léxico com 7 gêneros, e cada gerador resolve por gênero. O `mundo-base`, os moldes e o núcleo saem de tabelas. | **O formato do cenário como arquivo** (JSON: gêneros, ocupações, bestiário, preços, nomes, deuses), carregado em vez de importado. Hoje acrescentar um gênero é editar 10 ou mais módulos. | médio, a pesado se mexer no save |
| **Documentação** | Os comentários são riquíssimos (**33% do `App.jsx` é comentário**, 9,6 mil linhas, e os módulos abrem com o porquê). Mas são a história de cada bug, não um manual. | Uma página por sistema: entrada, saída, tabelas, invariantes. O mapa do §1 é o começo. | leve |
| **Testes de integração** | Há registos reais (`registo-s4…s10*.json`) contra os quais suítes conferem. `npm test` não corre o turno. **As 6 `varredura-*.mjs` não correm no `npm test`** (`rodar-tudo.mjs` só apanha `check-*`), ao contrário do que o `CLAUDE.md` diz. Hoje passam as seis. | O "jogo em Node" do contrato. Pôr as varreduras no corredor (é leve). | leve, e médio para o de integração |
| **Segurança e IP** | O portão é por origem e teto por IP no Redis. **O próprio comentário diz: "Não é autenticação."** O prompt e o motor vão no bundle. | O motor e o prompt no servidor. Uma chave por licenciante. Uma quota por chave. | **pesado** (infra) |
| **O que é segredo da casa** | Nada está separado. | O que vale a pena fechar: **o prompt e a pauta** (é ali que está o saber da obediência), **a régua das sessões** e **as tabelas do diretor** (núcleo, subtramas, batidas). O que pode abrir: o combate, a economia e a geografia, que são parecidos com o que já existe no mercado. | — |

---

## 5. O que mais se pode acrescentar ao motor

Pela ordem de valor para quem licencia. Para cada uma: o que já existe, o esforço e o valor.

1. **O contrato do motor, com "o jogo em Node"** · *pesado* · **valor máximo, é a condição das outras.** Já existe a camada pura inteira e o snapshot do save. O esforço é o §3 (6 a 10 semanas). Sem ele, vende-se código-fonte, e não tecnologia.

2. **O Juiz de fidelidade: a régua das sessões de prova virada módulo** · *pesado (órgão novo)* · **o que nenhum concorrente tem.**
   - **O que já existe:** uma taxonomia medida durante nove sessões (preço inventado, distância fora do sistema, pessoa fora do sistema, criatura armada, lugar novo, consequência inventada, escrivão) e as peças que já podam (`podarONarrador`, `semFalaInventada`, a peneira).
   - **A ideia:** a cada resposta de *qualquer* modelo, o motor confere a prosa contra o EM CENA, o mapa e o mercado, e devolve `{ preçosInventados, distânciasFora, pessoasNovas }`. Depois corrige (a ficha manda) ou volta a pedir.
   - **O valor:** quem quiser pôr um LLM a narrar o seu jogo compra *a prova de que ele não mente sobre o estado*. É a filosofia "o Mestre é código" vendida como produto, e serve também ao licenciante que traz outro modelo (§4).
   - **O que custa:** é o mesmo problema de língua do §4 (ler a prosa) e precisa da suíte sobre os registos reais que já existem.

3. **O pacote de cenário e o modo autor** · *pesado* · **valor alto para detentores de IP** (editoras, adaptações de obra). O Léxico, os 7 gêneros, as tabelas do núcleo e das batidas, e a espinha por semente já existem. A ideia é que o licenciante escreva um arquivo (o mundo, 4–6 pessoas do núcleo com quer, teme e esconde, a reviravolta, os atos) e o motor dirija; a semente sorteia o resto. Inclui "a campanha a partir de uma obra", que é o pedido da Solo Leveling que fez nascer o Léxico. O esforço é o formato do cenário (§4) mais a validação do arquivo.

4. **A sessão como arquivo: replay e auditoria determinística** · *médio* · **valor alto e barato.** Já existem a `semente.js`, o `guardado.js` (o turno não se rola duas vezes) e os registos usados como prova. O esforço são as 133 chamadas de `Math.random()` (§4) e o registo de frases. **O valor:** QA do licenciante ("o bug da sessão X reproduz-se"), anti-batota, servidor autoritativo e mesa a vários (a seguinte).

5. **A mesa a vários, servidor autoritativo** · *pesado (infra e protocolo da sala)* · **valor alto: é o que o RPG de mesa é.** Já existem a `sala.js`, o `transporte.js`, a `api/sala` e o grupo com companheiros na iniciativa. O esforço é o mundo no servidor, as diferenças por turno (hoje vai o save inteiro) e a vez de cada jogador. Depende de 1 e 4.

Mais abaixo, com menos valor por esforço:

6. **O livro da campanha.** `cronica.js` já existe (120 linhas, zero tokens, exporta em Markdown a saga a partir dos registros) e **não tem suíte**. Isso é leve e se faz já, para prová-lo. Com o núcleo e as subtramas, pode virar um livro com capítulos por ato. Valor médio (retenção, partilha).
7. **O Mestre que aprende o jogador.** Existe `posturas.js` (262 linhas), mas é lente de modo (Uma Noite), não um perfil. **Não achei tracker de preferência do jogador** (quanto luta, quanto fala, quanto pergunta). A ideia: o diretor pesa as batidas pelo que o jogador escolhe. É pesado e difícil de provar sem jogadores reais.
8. **Mapa, retratos e voz como módulos vendáveis.** O `painel-mapa-vivo` e o `mapa-vivo.js`, os retratos por semente (com pedidos R1–R7 abertos) e a voz (um proxy de terceiro, logo **não** é tecnologia da casa). Valor médio-baixo: há concorrência e são telas.
9. **A API para terceiros** (*o motor como serviço*). É a consequência de 1 e do §4 (servidor e chave). Não é uma adição: é a forma de entrega.

---

## 6. Os números para o pitch

**O que o motor decide sozinho, de forma determinística quando há semente:**

- **Combate:** o dado, o acerto, o dano, o crítico, as condições, o alcance em grade, a iniciativa, a fuga, o golpe de oportunidade, a queda e a morte, a decisão tática do inimigo e do companheiro.
- **Economia:** o preço, o estoque, o débito pela frase, a recompensa e o veredito de quanto falta.
- **Mundo:** o mapa, a região, as distâncias, a cidade por dentro, as salas de masmorra, os encontros da estrada e as suas chances, o relógio, o clima, os prazos.
- **Gente:** quem existe, a índole, o que uma pessoa *faz* quando o herói age, a persuasão, o crime, as facções.
- **História:** os atos, os marcos, a verdade da reviravolta (escondida do Narrador até à revelação), o núcleo de 4–6 pessoas com ficha dramática, as subtramas de 3 batidas, o tom da batida, quando a revelação cai, como a resposta fecha.
- **A conversa com a IA:** o que o Narrador lê em cada turno (com teto), o que ele está proibido de fazer, e **a poda do que ele tenta mudar**: ferida, luta, vida, dinheiro.

**O que a IA faz:**

- **O Narrador** (Gemini 3.8 Flash) escreve a prosa.
- **O Cronista** (Gemini 3.5 Flash-Lite) lê a prosa e propõe o registo. **Hoje também decide** o lugar, o grupo, as mortes narradas, a devoção e a paga: isto tem de mudar antes do pitch (§2).
- **O Léxico** dá nomes ao mundo, numa chamada por campanha.

**Os números** (todos medidos, com a fonte):

| | |
|---|---|
| Código | 214 módulos puros (93 mil linhas), **0 com React**, mais 26 de interface (42 mil) |
| Prova | **354 suítes verdes, ~18,4 mil asserções, 16 varredores limpos**, `npm test` em 6 min 22 s (27/10) |
| Sessões de prova jogadas | 12 (MM11), de 27 a 78 respostas cada; notas de 0 a 5 em 9 critérios: **3,0 → 3,6, média ~3,3** (4.ª–12.ª) |
| Preço vindo do sistema | 11/11 (10.ª), 5/5 (11.ª) |
| Bolsa certa a cada "pago N" | 5/5, 0 moedas perdidas (11.ª) |
| A IA a escrever estado (`mudancas`) | **0 de 63** respostas (11.ª), 0 de 78 (10.ª) |
| Pessoa inventada | 0 (12.ª) |
| Luta inventada pela IA | 0 (10.ª, 11.ª) |
| Custo | **US$ 0,0105 por turno · US$ 0,63 por sessão de 63 turnos · US$ 0,34 por hora** (R$ 2,09), cache a 64% (12.ª) |
| Latência | 4,6 s por resposta, 142 palavras (12.ª) |
| Ganho da economia de tokens | −64% de custo e −41% de tempo entre a 11.ª e a 12.ª, com a nota dentro do ruído |
| Ritmo | 837 commits e 475 versões em 100 dias |

**Porque custa o que custa:** 57% da conta é a entrada não cacheada, ~8 mil tokens por turno (o histórico e a mensagem do turno). O system de ~68 mil caracteres está cacheado. A saída custa ~10%, e o Cronista 7%. **Com o preço de 2027, a mesma sessão projeta-se em ~US$ 0,95** (`custo-do-turno.md` §0). Para quem licencia, a frase é: *"cada hora de jogo custa menos de meio dólar, e sabemos para onde vai cada cêntimo."*

---

## 7. As cinco maiores fragilidades

1. **O motor não tem contrato.** O turno vive em 22,3 mil linhas de um componente React, sobre 240 refs, com 115 envelopes e o Cronista lá dentro. Nada roda sem o `App`. **(§3)**
2. **O determinismo está prometido e não se cumpre.** São 133 `Math.random()` diretos, e o combate vivo não tem semente. Não há replay, não há auditoria, e a sala não tem como conferir. **(§4)**
3. **A IA ainda decide estado pelo Cronista, e onde o herói está não tem dono único.** O eco explica 4 de 7 invenções (11.ª). A viagem fantasma voltou três vezes. **(§2)**
4. **A qualidade estabilizou em ~3,3, e por um avaliador só.** As nove notas são do `tester` da casa, com a régua da casa: **para um comprador isto não é prova independente.** Os consertos fecham a instância e não a classe (a C0 fechou a *pergunta* e não o *verbo*; a viagem fantasma voltou). A reviravolta ficou em 3 em todas as sessões. A distância inventada nunca chegou a 0.
5. **A prova mede o texto do código.** 187 suítes leem o `App.jsx` e ~490 asserções provam que uma linha está escrita. O refactor que o licenciamento exige vai parti-las aos centos. As 6 varreduras não correm no `npm test`. `teste-sala` é intermitente. **A catraca que hoje dá confiança vai, no dia da separação, dar ruído.**

Logo abaixo destas: **o português cozido na leitura da frase** (572 regex), **o prompt a 80,5 mil caracteres no pior caso, com o teto em ~82 mil**, e **o save sem esquema** (~186 campos, 396 KB).

---

## 8. O que eu não sei

- **Não joguei.** A tarefa era medição sem chamadas pagas, e o jogo vivo pede o Narrador. O que digo da experiência vem das 12 sessões, não de mim.
- **Não medi o bundle** (`npm run build`) nem o tempo de carga.
- **Não achei sessão de prova da sala a dois.** Pode ter havido fora da série MM11.
- **Não verifiquei os termos comerciais** do plano gratuito do Fish Audio (a voz).
- **Não achei versão de esquema no save.** Se ela existir com outro nome, o §2 sobre o save abranda.
- **A divisão 45/40/15 do §3 vem de amostra** (45 linhas sorteadas e padrões contados). Tem margem larga, e o número que pesa (as ~13,7 mil linhas de código no corpo de `Taverna()`) é exato.
- **A pauta do turno nunca foi gravada ao lado da resposta** (a ressalva da 12.ª). As hipóteses sobre os tiques (`escuta.js:387`) continuam por confirmar.
