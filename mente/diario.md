# O diário da mente

Um registro por ciclo, o mais recente no topo. É aqui que a pessoa vê o que
cada agente fez, e é aqui que a mente lê o próprio passado antes de agir.

Formato:

```
## dd/mm hh:mm · vX.YYY · <título do item> · commit <hash>
- **estado inicial:** suítes verdes/vermelhas, o que a pauta tinha
- **conselheiro:** o que propôs (ou "não chamado")
- **backend / frontend / testes:** o que cada um entregou, em uma linha cada
- **decisões médias tomadas:** cada uma com o motivo (é o que a pessoa audita)
- **o que ficou:** o que não coube, o que dormiu, o que foi para "pesado"
```

---
## 11/10 · v9.373 · MM18, a lei do mundo (a queixa de 11/10, tarefa 2) · este commit

- **quem:** `backend`, à mão. Nada em `App.jsx`: o App já manda `pedidoDaAbertura(ab.abertura, …)` e já guarda a abertura no save.
- **o que era:** duas leis, nenhuma jogável. (1) O pedido da abertura mandava dizer "uma lei daqui que não valeria noutro lugar" e
  não dava lei nenhuma — o Narrador inventava um lema: "A lei do lugar? Papel vale mais que ouro, e quem rasga um contrato dorme no
  Coice do Cão" (3.ª sessão), "a lei aqui é o Sino — cada entrada de marcado dobra uma vez" (4.ª). (2) A LEI DESTE MUNDO do Léxico
  (prompt fixo) é lore do mundo, coerente, mas sem nada que a cobre. Nenhuma das duas voltava a valer, e a ficha da cidade,
  perguntada depois ("como se reconhece quem é bem-vindo?"), respondia outra coisa (a medalha de cobre).
- **a decisão (pesado de motor, dentro da Fase MM):** a lei da abertura passa a ser do sistema e concreta — **a regra da porta**
  da cidade de partida (`cidade-por-dentro.js#RECONHECIMENTO`: o salvo-conduto que vale sete dias, a senha do dia, a medalha de
  visitante, a fita no pulso), guardada na abertura (`porta`, campo novo ignorado pela versão antiga) e mostrada a ACONTECER com o
  herói à chegada, na parte 2 ("À porta vale já a regra daqui: … — mostre-a acontecer, sem lema"). É a mesma que a pauta responde
  quando se pergunta: uma verdade só. A lei do Léxico fica no prompt (é a identidade do mundo e o Narrador usa-a bem: "Euzébio não
  tem marca. Ele passa sem som"), mas a abertura já não pede lei inventada. Save antigo (sem `porta`) abre sem lei.
- **o custo:** o pedido da abertura continua abaixo dos 1.500 da MM13 (maior 1.495 em 48 mundos; a frase nova paga-se com
  "uma lei daqui…" a sair e duas frases encurtadas).
- **a prova:** `testes/teste-mm18-lei.mjs` (15) — vermelho em HEAD ("uma lei daqui" no pedido, sem `porta`), verde agora, em 24
  mundos: a regra é a da ficha da cidade em 24/24, vai na parte 2, sem bastidor, determinística, save antigo sem lei.
- **o que a 5.ª sessão mede:** a abertura mostra a regra da porta a acontecer (quem a cobra, o que se dá); perguntada depois, a
  resposta é a mesma; nenhum lema de lei inventado.

## 11/10 · v9.372 · MM18, o Mestre que escuta (a queixa de 11/10, tarefa 1) · este commit

- **quem:** `backend`, à mão, a pedido da pessoa. Sem bastão: nada em `App.jsx`.
- **a medida (registo da 4.ª sessão, tabela inteira no fim de `mente/mm11-sessao-4.md`):** respondeu à pergunta em **11 de 16**
  (14 com as parciais); reagiu primeiro em 14 de 16. **23 empurrões em 18 dos 24 turnos do jogador**, 12 deles com o jogador em
  cima do fio; nenhum porque tivesse empacado. A GENTE: 25 linhas, 15 delas maneiras de não responder numa pergunta. Origem das 28
  coisas sem nexo: **19 prontas da pauta/prompt**, 4 de dois fatos que não casam, 5 inventadas. Das 10 perguntas que falharam o
  sistema **sabia 5** (3 não entregues, 2 entregues junto com o contrário).
- **o que já muda, sem fiação (módulos que o App já chama):** `interprete.js` — "?" é pergunta (vence pagar/agradecer/chegar) e,
  numa pergunta, **uma pessoa só age e nenhum dos 17 movimentos de não responder sai** (`QUANDO_ME_PERGUNTAM`); `pauta.js` — o
  cabeçalho manda abrir pelo que eu fiz (mesmos 95 caracteres), secção nova **O RUMO** (prio 2,42, a última na leitura) e, numa
  pergunta respondida, a economia, a rua e a vizinhança **cedem** (`SECOES_QUE_CEDEM.pergunta`: no J6 o preço do quarto era cortado
  pela linha "Cheira a cera, tinta…", que também abria 7 das 26 narrações); `mesa-posta.js` — sem chaves-substantivo (a "aposta"
  de escalar a muralha em 4 turnos sem escalada); `gente-por-dentro.js` / `cidade-por-dentro.js` — "quanto tempo leva" não é o
  passado de ninguém, "reconheço" não é a porta, "me chamam" não é gíria; `prompt.js` — PRIMEIRO EU no ofício da cena, o guia de
  cena só fecha com saídas quando se chega ou se pergunta, o turno do mundo deixa de mandar injetar (−44 caracteres no prompt).
- **o que espera a fiação (`escuta.js`, lista de espera em `teste-ligacao`):** a escada por turnos (0 · 4 · 7 · 10, as formas do
  `encalhe.js`), o corte a um empurrão por turno com o do fio primeiro, o adiado que espera uma vez, e a frase do jogador por último.
  **Mapa de chamada para o `frontend`** (âncoras de hoje):
  1. `import { lerOPedido, fioDaHistoria, garantirEscuta, andarAEscuta, contarOAvanco, degrauDaEscuta, seguraOMundo, linhaDoRumo, escutarOTurno, separarEnvelopes, fechoDoPedido } from "./escuta.js";`
     e `escutaRef = useRef(garantirEscuta(null))` + `adiadosEscutaRef = useRef([])`; save `escuta: escutaRef.current` (lista do
     save, ~8685), load `garantirEscuta(sv.escuta)` (~13284), zera na campanha nova (~11719, junto de `escadaRef`).
  2. `enviar`, antes de `const doCompasso = talvezAndarOCompasso(conteudo);` (~12220), em `try/calou`: `pedidoEsc = lerOPedido(conteudo)`,
     `fioEsc = fioDaHistoria({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })`,
     `degrauEsc = degrauDaEscuta(garantirEscuta(escutaRef.current).semAvanco)`, `segurarEsc = seguraOMundo(pedidoEsc, degrauEsc)`.
  3. `talvezAndarOCompasso(conteudo, { segurar: segurarEsc })` → no `avancarCompasso` (~20263) `segurar: segurarExtra || !!combateRef.current || …`;
     e `const formaDaCena = doCompasso || segurarEsc ? "" : talvezDarFormaACena(conteudo);`.
  4. `pautaDoTurno`, antes do `return p;` (~7272), fora da luta: `p = porNaPauta(p, "rumo", linhaDoRumo({ pedido: lerOPedido(acaoDoTurno), degrau: degrauDaEscuta(garantirEscuta(escutaRef.current).semAvanco), passo: proximoPasso({ abertura: aberturaMundoRef.current, missoes: missoesRef.current }), semente: diaRef.current }))`.
  5. A nota (~12267): `envs = [oficina, ...separarEnvelopes(umSoLugar(notaRef.current)), doCompasso, formaDaCena, daFrente, daVirada, daTrama]`;
     `r = escutarOTurno({ envelopes: envs, fio: fioEsc, semAvanco: …, adiadosAntes: adiadosEscutaRef.current })`;
     `nota = [pauta, ...r.ficam].filter(Boolean).join("\n")`; depois de `notaRef.current = ""`: `notaRef.current = r.adiados.join("\n"); adiadosEscutaRef.current = r.adiados;`.
  6. Depois da pauta: `escutaRef.current = andarAEscuta(escutaRef.current, { pedido: pedidoEsc, fio: fioEsc, ...contarOAvanco({ missoes: missoesRef.current, espinha: espinhaRef.current }), pausa: !!combateRef.current })`.
  7. O pedido (~12442): no turno do jogador, `content: \`${nota ? nota + "\n" : ""}${rodape}\n${fechoDoPedido(pedidoEsc)}\``;
     no do sistema, como hoje. O histórico (~12503) continua a guardar `corpo` (sem rodapé).
- **a prova:** `testes/teste-mm18-escuta.mjs` (102 asserções, com os casos do registo) — vermelho em HEAD (o módulo não existe;
  o Intérprete dava 3 linhas e esquivas numa pergunta; as 6 apostas falsas casavam), verde agora. 275/275 suítes, build limpo,
  o prompt continua abaixo de 82 mil (pior 80.667).
- **o que a 5.ª sessão mede:** (1) respondeu em X de Y (hoje 11/16) e reagiu primeiro em X de Y (14/16); (2) empurrões por resposta
  (hoje até 2 no turno do jogador e 4 no do sistema; meta: nunca mais de 1, e a maioria a tocar o fio); (3) turnos fora do fio
  antes de o mundo vir buscar (meta: o sinal ao 5.º, ninguém antes); (4) origem do que não faz sentido (hoje 19/28 da pauta).
- **o que ficou:** o seletor do turno (as três camadas: a verdade, o que o mundo sabe, o que o jogador viu) — "sabia e não
  entregou" é 5 de 10, metade, e a outra metade é matéria que nenhum órgão tem; e as 11 contradições entre órgãos, para a auditoria
  de coerência.

## 10/10 21:40 · v9.371 · a marcha única, a fiação (MM17, pendência nº 3) · este commit

- **quem:** `frontend`, à mão, sem maestro. Bastão do `App.jsx` tomado às 21:38 e devolvido ao fim.
- **o que mudou para quem joga:** a ida a uma povoação da região passa a custar o que a ficha, o Geógrafo e o mapa vivo dizem.
  Em 200 mundos semeados: **1.984 → 0** pares em que uma conta discordava da jornada, **858 → 0** viagens além da promessa (as
  858 povoações sem estrada, que caíam no piso de três dias: 24 h em vez de 8). Quando o direto passa de um dia, o jogador lê o
  caminho antes de andar ("🧭 Forte do Rei fica a oeste: o caminho direto leva 12 h…; por Casa das Águias, 8 h — é por lá que se
  vai") e a jornada anda pelo percurso (o ⌖ passa pela cidade do meio). Jogado no navegador (campanha nova de Uma Vida): Nova Seco
  → Forte do Rei abriu com 480 min (antes 1.440), percurso Nova Seco → Casa das Águias → Forte do Rei, a 50% o herói em Casa das
  Águias. O `localStorage` do painel: só `taverna_save_v1` nasceu (não existia), apagado com o jogo desmontado e conferido.
- **a fiação:** `import { partidaNaRegiao }`; `lugarDaPartida` guardado antes de limpar o lugar; com região e fora da ida a uma
  boca, `partidaNaRegiao` em try/`calou`, as `linhas` ao jogador, e `jIda || jM.jornada || abrirViagem(...)`. Mapa sem
  `regiao` não entra no ramo (322/322 partidas continentais iguais à de sempre).
- **a prova:** `testes/teste-marcha-na-viagem.mjs` (20 asserções) lê a fiação do App e mede com a jornada que ELE abre — vermelho
  em HEAD (o import não existe e a medida dá 1.984/858), verde agora. Endereços re-medidos: o import somou +1 a tudo abaixo da
  linha 156 — 146 em texto de dado de `acoes-do-jogador.mjs`, 2 em `check-acoes-do-jogador.mjs`, 4 em
  `teste-acoes-do-jogador.mjs` (96 divergências → 0); os endereços dentro de comentário ficaram como foram escritos.
- **o que ficou:** o **piso de 12 h por avanço não morre com esta fiação.** Uma jornada a pé de 97 min ainda anda um avanço inteiro
  (`minutosPorAvanco` tem piso de 240 min de estrada = 720 de relógio), e o veredito (`partida.js`) e a sua suíte travam esse
  piso como o que o jogo cobra. Tirá-lo é mexer em `viagem.js` + `partida.js` + duas suítes: do `backend`, como item próprio.
  O backend subiu a v9.370 (`0a60254`, o mercado) enquanto isto se fazia; esta fiação sobe como v9.371.

## 10/10 · v9.366 · MM17: a ficha é a planta · a marcha única · P3 e P2 do mapa · commits `1b7f1ee` (v9.363), `fb4d12b` (v9.364, parte pura), `c0703ae` (v9.365), `432c92e` (v9.366)

- **por que andou:** a pessoa escolheu duas pendências da MM17 (10/10) e o regente, que desenhou o mapa novo no Figma, pediu o P2 e o P3
  de `mente/pedidos-ao-sistema.md`. Uma versão cada. Lei nova da C2, cumprida em todas: **o HEAD verde num checkout limpo
  (`git archive HEAD`, fins de linha do repositório) ANTES de subir** — corri-o sobre o commit de cada versão, não só `npm test` na árvore.
  Código em Opus (`backend`); eu conduzi. O bastão do App.jsx esteve sempre com o regente (a A1): não o tomei.
- **v9.363 · a ficha é a planta:** `gerarMasmorra` ganha a opção `quem` (`FICHA_NA_PLANTA`, `bichosDaFicha`, `plantaDaFicha`): a planta sai
  como antes e só depois os nomes dos inimigos são trocados pelos da ficha, por regra fixa (o chefe é a criatura mais forte da ficha,
  elevada a pelo menos elite; a sala do guardião vem antes do chefe). Sem a opção, byte a byte a de HEAD (200 sementes × 2 géneros × 4
  níveis). 200 mundos, 1.285 lugares, 8.045 inimigos: nomeados pela ficha **15% → 100%**; plantas inteiras que batem **0 → 1.285**;
  toda criatura da ficha aparece numa sala **14% → 100%**; linha "quem está aqui" só com criaturas da ficha **365 de 4.811 → 4.811 de
  4.811**; com léxico 0% → 100%. Prompt sem crescer (a linha da ficha igual byte a byte; seção MASMORRA mediana 224 → 225).
- **v9.364 · a marcha única (PARTE PURA):** `marcha.js`; `PROMESSA_DA_REGIAO` = base→lugar 8 h, direta 8 h, ponta a ponta 16 h. 200 mundos,
  22.070 pares: jornada mediana/pior **8/24 h → 8/16 h**; povoação→povoação 12/24 → 8/16; lugar→lugar 8/20 → 8/16; pares em que uma conta
  discorda da jornada **3.309 → 0** (Geógrafo 3.109, ficha 1.032, mapa vivo 1.032); viagens além da promessa **891 → 0**; povoações
  cobradas pelo piso de 3 dias 858 → 0. **MAS ISTO SÓ VALE NO JOGO DEPOIS DA FIAÇÃO:** a viagem a uma POVOAÇÃO continua a passar pelo
  `abrirViagem` antigo até `viajar` (App.jsx) chamar `partidaNaRegiao`. **Sem a fiação sobram 1.984 discordâncias e 858 viagens além
  da promessa** (todas idas a povoação; as idas a lugares já saem certas). Dito sem rodeios: **a pendência da pessoa — "nenhuma viagem
  dentro da região pode passar da promessa" — está provada em Node e NÃO está ligada ao jogo.** Espera o bastão do App.jsx.
- **v9.365 · P3:** `dadosDoMapaVivo` → `nos[].quem` (nomes da ficha, sem nível; só onde a neblina mostra o perigo). 2.823 nós com ficha
  aberta: nó = ficha = planta em **2.823/2.823**; 632 nós calados, nenhum com `quem`; JSON +2,5% no pior mundo (9.382 → 9.510 mediana).
- **v9.366 · P2:** `partida.js`, `vereditoDaPartida(dados, destinoId, estado)`: horas, dias, noites, chegada, perigo do lugar (nulo se oculto),
  perigo da estrada, horas de volta, rota e pernas, desvio e motivo do chão, e os prazos. 22.070 pares: **0 contradições** com a jornada,
  a rota e o relógio; marcha mediana/pior base→lugar 4/8 h, povoado→lugar 8/16 h; saindo às 08:00, 4 h chegam às 20:05 e 8 h às 08:10
  do dia seguinte. **Prazo ou ameaça ao partir? Prazo de missão: NÃO (conta noites dormidas). Custos e ameaças: SIM** — exaustão (um dia
  sem dormir já deixa o herói Exausto), invocações que expiram, petições do correio, domínio em fúria, o passo do plano da ameaça.
- **achados:** o exemplo do pedido P2 (Torre Serena → Agulha de Ferro "por Pedra Serena") estava errado: é direta (8 h); o desvio vinha de
  não haver traço no mapa vivo porque a ficha da Agulha não lista a Torre como vizinha — a tela desenha a perna a partir de `pernas`. A
  jornada curta a uma povoação custa 12 h (97 min a pé, o relógio cobra 725) pelo piso do avanço de `viajar`: o veredito diz o que o jogo
  cobra; a incoerência morre com a fiação. A cor do traço do mapa vivo lê o chão de um sentido só (1.002 pares).
- **decisões médias, com o motivo:** (1) o P2 em módulo próprio (`partida.js`) e não em `marcha.js`: evita import circular com o mapa vivo;
  (2) o veredito não tem conta própria — repete a da jornada, para a tela nunca prometer o que o jogo não cobra; (3) o `quem` do P3 vem de
  `quemDoLugar`, a mesma função que dá a planta, para a verdade ser uma só; (4) `partida.js` e `mapa-vivo.js` na lista `AGUARDANDO` do
  `teste-ligacao`, datadas, com o credor (a tela do mapa, do regente/oficial); (5) um hash do mapa vivo em `teste-marcha-unica` lia a saída
  inteira: tirei o `quem` antes de contar em vez de o regravar (o hash voltou ao de HEAD).
- **à espera do bastão (App.jsx):** a fiação de `partidaNaRegiao` em `viajar`: (1) `import { partidaNaRegiao } from "./marcha.js"`; (2) guardar
  `lugarDaPartida = lugarRef.current` antes de limpar o lugar; (3) com `!jornadaRef.current && !(opcoes && opcoes.ida)` e mapa com `regiao`,
  calcular `jM = partidaNaRegiao(mapaRef.current, { cidadeAtual, lugar: lugarDaPartida, destino, dia })`, mostrar `jM.linhas` e abrir
  `jornadaRef.current = jIda || (jM && jM.jornada) || abrirViagem(...)`; (4) re-medir os endereços dos varredores com o cabeçalho
  "(v9.367 · a marcha única, a fiação)". Corrige de caminho o piso de 12 h. O botão "Partir" da tela chama
  `vereditoDaPartida(dados, no.id, { ...estado, mapa, ritmo })`.
- **o que ficou:** a linha "O QUE EXISTE EM" (mundo-base) diz a hora a partir da base mesmo com o herói numa povoação (import circular);
  a volta de uma boca à cidade segue narrada sem jornada; saves de região entre a v9.356 e a v9.362 em mundos com léxico têm fichas sem
  ameaça (91% adivinhada pelo nível; nomes 100%) e uma masmorra em curso mantém a planta velha; o App passa só `{nome, ameaca}` a
  `completarInimigo` (uma criatura renomeada pelo léxico entra ao nível do herói); o P1 e o P4 do mapa ficam na pauta. **Não comecei a
  quarta sessão de prova.**

## 06–07/10 · v9.362 · a luz · MM17 a região delimitada (A–D) · a Bolsa · o vermelho do HEAD · commits `2fb5355` (v9.354), `eff2882` (v9.355), `81b8bca` (v9.356), `fe92895` (v9.357), `311e0d4` (v9.358), `779d254` (v9.361), `87eeda8` (v9.362)

- **por que andou:** duas decisões da pessoa de 06/10, registadas em `mente/respondidas.md` com as palavras dela: (1) a luz — a mecânica
  nova que estava como pesado ("baixo a tocha e escondo-me na sombra"); (2) a região delimitada, **MM17**: *"agora nossa campanha tem
  estrutura, tem espinha, início, meio e fim… não precisamos de um mapa infinito"*. Modo manual (sem tarefa agendada). Modelos: Opus
  para quem programa, Sonnet só para quem testa. Bastão do `App.jsx` tomado só durante cada etapa e devolvido ao fim de cada uma; a
  trava devolvida no fim. Dois backends da C2 morreram (uma interrupção, um 401 de token) — a terceira mão retomou do diff.
- **a luz (v9.354):** `luz.js`, tudo por tabela (escuro/penumbra/clara; raios do 5e; quem enxerga no escuro; Elfo, Anão, Gnomo, Meio-elfo,
  Meio-orc e Tiefling a 18 m, o traço da criação passa a dizê-lo); a sombra esconde no escuro de qualquer distância, na penumbra de quem
  está a 6 m ou mais, na luz nunca; baixar/apagar a tocha não custa ação e acontece no gesto da frase; seção A LUZ na pauta (prio 5.5, ~90
  car.). `teste-luz-e-sombra`: 91 (64 falhavam no HEAD); 300 lutas semeadas, as quatro propriedades 300/300. Campos novos opcionais:
  `combate.tochaDoHeroi`, `sombra:true` na condição `escondido`.
- **MM17 A (v9.355):** `regiao.js` (`gerarRegiao`, `amarrarEspinha`) e a linha de base: da masmorra à cidade próxima, mediana 167,7 km (máx
  282,8), 60/60 mundos com uma masmorra a mais de um dia; masmorras com ficha 0/495; locais da cidade dentro da masmorra mediana 3.210. Depois
  (200 mundos): base→lugar mediana 3,5 h, pior 8 h; ponta a ponta 2 dias; marcos fora 0; fichas 100%. `teste-regiao`: 83 (54 falhavam).
- **MM17 B (v9.356):** a criação usa a região só em campanhas NOVAS de Uma Vida (`mapaDaCriacao`, pura): 60/60 nascem com região, 0/60 nos
  outros moldes e modos; saves antigos intocados (240/240, byte a byte no molde do beta); o cão de um passo dorme na região (acordaria em
  115 de 200 bases, agora 0). Masmorra mais longe: mediana 24,9 km (8 h) contra 950 km.
- **MM17 C1 (v9.357):** a espinha amarrada (`espinhaNaRegiao`): passo "descer" novo (`concluir_masmorra`, só da espinha), confronto final no
  clímax, atos sem peso 54/950 → 0; ganchos (abertura 200/200, mural 1343/1343, boatos 1285/1285); `masmorrasConhecidas` abre todos; a ida a
  pé respeita o chão só em região v2 (0/3855 contradições com a ficha). Hashes de HEAD iguais nos mapas continentais.
- **MM17 C2 (v9.358):** a masmorra sem a cidade (`DENTRO_DA_MASMORRA`) e o horizonte só quando perguntado. "Da cidade" no turno, mediana
  9.379 → 0 (região) e 7.466 → 0 (continente), na sala e na luta, em todos os mundos; turno inteiro na sala 69.656 → 60.457; fora da masmorra
  o prompt é IDÊNTICO ao de HEAD (2.800/2.800 e 840/840, hashes iguais); o horizonte custa 0 bytes a quem não pergunta (11.200/11.200); pior
  cena real 74.644 → 73.861. `teste-masmorra-sem-cidade`: 94.
- **a Bolsa (v9.361, `779d254`):** o nome inteiro na 1.ª linha, as ações na 2.ª em flex-wrap, "dar…" com 7 rem; medido no navegador a 1600 e a
  375 px: sem rolagem lateral, nenhum botão a cobrir o nome, tudo dentro da gaveta (a screenshot a 1600 saiu ilegível: ficam os números).
- **LEI QUEBRADA, dita:** a C2 (`311e0d4`) **subiu com `npm test` a 0 na árvore de trabalho e o HEAD ficou vermelho num checkout limpo**
  (`teste-mm5-margem`, 118/120). A causa: a suíte lê `concluirRolagem` numa janela de 20000 caracteres, e a chamada `envelopeDoCusto(` mora a
  19901 do começo da função com fins de linha LF (folga de 99) e a 20208 com CRLF, que é como o Git entrega o arquivo num checkout. O verde da
  árvore (LF) escondia o vermelho do repositório (CRLF). Consertado no commit da Bolsa (janela 40000 e CRLF→LF normalizado, com o porquê);
  provado por `bash mente/so-o-meu.sh` e por `npm test` a 0. **A lição para a casa:** uma suíte que lê o `App.jsx` por distância em
  caracteres depende dos fins de linha — o `so-o-meu.sh` copia o MEU arquivo (LF) por cima do archive (CRLF) e por isso não apanha isto; o
  que apanha é rodar a suíte num `git archive HEAD` puro. Fica na pauta como varredor (leve).
- **MM17 D (v9.362):** `mapa-vivo.js`, `dadosDoMapaVivo(mapa, estado)`: os dados para a tela do mapa em tempo real (quadro normalizado, nós
  com estado de neblina, arestas com horas, o herói num sítio só, o horizonte, o relógio). Região de 59 a 100 km de lado (mediana 78 km, 19 a
  30 h de marcha), 9 a 13 nós; 7.642 arestas sem contradição; o herói aparece num sítio só em 200/200 em oito estados; **o clímax e o segredo
  não aparecem na tela antes do ato** (200/200); continente antigo → `null`. `teste-mapa-vivo`: 79; o relato do que a tela pode mostrar está
  em `mente/mm17-regiao.md`, secção D. **Não desenhei a tela.**
- **um achado do D:** ao mutar o módulo de propósito para ver se a suíte mordia (9 mutações, todas apanhadas), uma ficou no arquivo (o rumo do
  horizonte lia `rosa[0]`); o `npm test` na árvore deu vermelho e foi corrigido no commit. Lição: mutar numa cópia.
- **decisões médias, com o motivo:** (1) a luz não inventa a tabela: raios e visão no escuro são os do 5e que a casa já usa; (2) a região
  escolhe horas, não km, e uma base capital com 3–4 povoados (com 2 o elenco completava em 20% dos mundos); (3) o clímax numa região é
  escondido da tela até o ato, pela lei do Narrador (não vê a verdade eleita antes do turno da revelação); (4) o horizonte só no turno em
  que se pergunta, para custar 0 ao prompt; (5) o mm5-margem: a janela alarga e normaliza, sem mudar a intenção das asserções.
- **o que ficou (na pauta, MM17):** a planta de um lugar da região sorteia os seus inimigos e a ficha diz os bichos do chão (o Narrador
  pode ouvir "Goblin, Lobo" numa cripta de Elementais); a ficha é a primeira linha a ceder ao teto em cenas sintéticas cheias; a ida direta
  entre dois lugares lentos chega a 20 h; o Geógrafo ainda anda a 4 km/h; os campos opcionais `baseMundo.visitadas`/`ouvidas` para o mapa
  vivo; o varredor de fins de linha; "dar uma vida" a quem acabou uma Noite usa o mundo da partida anterior; o load recalcula as rotas
  sem o molde; a região seguinte (continuação) em "Depois do beta". E nada disto foi jogado: a quarta sessão de prova (uma descida
  inteira, em região) é a prova que falta.


## 06/10 · v9.353 · MM16 nº 5, 2, 4 e 6 · o "como" chega · "vou à Nave" leva à Nave · a masmorra na pauta · esconder-se · commits `a914320` (v9.350), `148c1d5` (v9.351), `9e193d8` (v9.352), `015f9f0` (v9.353)

- **por que andou:** pedido da pessoa, via o coordenador, em modo manual (sem tarefa agendada): resolver as quatro pendências da
  MM16, uma de cada vez, cada uma numa versão. Ordem dada: o "como", a Nave, a masmorra na pauta, esconder-se. **Modelos:** Opus
  para quem programa (`backend`, `frontend`), Sonnet só para quem testa. A etapa v9.349 e todas estas correram em Opus,
  salvo o `testes` da v9.348 (Sonnet, antes da ordem).
- **estado inicial:** verde (`bf6ddf7`, v9.349), árvore limpa, sem fila pausada. Trava tomada; bastão do `App.jsx` tomado só
  durante cada etapa (para o `frontend`) e **devolvido ao fim de cada uma, nunca segurado entre etapas** — a pessoa desenha
  uma tela nova no Figma e outra mão vai codá-la no App. A outra mão fez o commit B1 (`427c93c`, "v9.352", a luta numa mesa
  só) no meio: o número de versão repetiu-se uma vez (o dela e o meu), a atual é v9.353.
- **nº 5 · o "como" (v9.350, `a914320`) — a causa PROVADA com o registo real:** remontadas as pautas das chamadas M21 e M30
  (batem byte a byte com as enviadas: 1369 e 1212 car.), o gasto antes da frase era 1149 e 1164 de um teto de 1400, e a frase
  pedia mais 310 e 287; entrou A GENTE (prio 6) no lugar dela. O gasto vinha de 264 car. da economia da cidade ("cheira a cera,
  tinta e perfume caro") dentro de uma masmorra, que passava à frente do DESFECHO. A MM14 provara que cabia — com um ONDE só do
  Geógrafo: o turno de prova não era o turno jogado. Conserto: `PRIO_DE_FERRO` (o fato e a frase e o veto de quem caiu cortam
  por último), a economia vira seção própria, `SECOES_QUE_CEDEM` por tabela. **500 de 500 lutas semeadas** (masmorra +
  companheira + "como" até 300) entregam a frase, o fato, o veto e o lugar (eram 82 com o App de antes); `teste-como-chega`, 62.
  **O cartão** deixa de nascer em y −119 a −51 (painel 374×310): campo em y 93–160 com foco, botões 191–295, no fluxo, no lugar
  da fileira de verbos, pela mesma peça. Provado numa página de prova temporária (apagada), não no jogo real.
- **nº 2 · a Nave (v9.351, `148c1d5`):** "vou à/sigo para X" com X masmorra conhecida é uma **ida** (`idaAMasmorra`, `boca.js`
  novo): dias da tabela de terreno, chegada à **boca** (nunca dentro), veredito na partida e à boca, "entro" de longe vira ida e
  só o segundo "entro" abre. **Uma frase, uma resposta** (`QUEM_RESPONDE`; o helper `umaSoResposta` do App): "Sigo viagem pela
  estrada." e "Encontrei uma entrada… Vou explorar." deixam de existir. Campo de save novo e opcional: `jornada.alvo`.
  `teste-nave-destino`: 94; 777 frases de ida em 24 mundos × 3 cidades chegam todas; 871 que não são ida não movem nada.
- **nº 4 · a masmorra na pauta e o lugar (v9.352, `9e193d8`):** os **12 recusados lidos no registo**: 1 do Mestre (`lugar_atual`
  null à boca, com o lugar vigente ainda no posto da estrada), **11 do Cronista** a repetir "câmara das correntes" — o lugar já
  registado — e o `registrarLugar` recusava tudo com o combate aberto antes de ver se era o mesmo sítio. Agora dentro da luta e
  da masmorra o lugar dito é ignorado em silêncio (`LUGAR_NA_CENA_DO_SISTEMA`; 2000 casos semeados). Seção `MASMORRA` (prio 2,45,
  308 car.): camada, salas da planta vistas, tochas, quem está, passagens, o portão do fundo. Medida a prioridade: 2,05 tirava o
  2.º e o 3.º veto em 84 de 500 lutas; 2,45 não tira nenhum. As "12 salas" vinham de `mundo-base.js` e a planta tinha 6:
  `gerarMasmorra` ganha `{ salas }`. `teste-masmorra-na-pauta`: 99 (71 falhavam no HEAD).
- **nº 6 · esconder-se (v9.353, `015f9f0`) — a hipótese do `jogo` estava errada:** o bloco da MM6 correu; o save da sessão guarda
  "👁 Não há onde sumir: Lobo tem você à vista, sem nada no meio" e o jogador não a viu. A regra do 5e estava certa (no fundo da
  sala não há cobertura). O defeito era o resto: o veredito vinha **depois** do dado, a recusa nunca chegava ao Mestre (que narrou
  o herói escondido), a ação nunca se gastava, "fico escondido" não rolava, e o rodapé de `enviar` lia a ficha do render.
  `teste-esconder-na-luta`: 54.
- **decisões médias, com o motivo:** (1) **no nº 6 não obriguei o estado a nascer de qualquer teste passado**, como a letra do
  pedido dizia: nascer sem cobertura seria quebrar uma regra do 5e que a casa já aplica e que o `jogo` não contestou; o jogador
  passa a ver a recusa ANTES de rolar e onde há abrigo — a luz como esconderijo vai à pauta como **pesado**, para a pessoa;
  (2) no nº 4 a seção da masmorra não cede ao ONDE de cidade (é a verdade do lugar), e a prioridade 2,45 saiu de medir três
  alternativas, não de achar; (3) no nº 2 o veredito vem na partida E à boca (o mesmo texto de hoje, só mudou QUANDO); (4) o
  cartão do "como" tira do ecrã, enquanto aberto, a faixa da vez, o veredito, o texto livre e (no telefone) a tira do herói,
  para caber a 310 px — voltam no clique que fecha; não é a batalha congelada em ecrã inteiro, essa continua à espera da
  pessoa; (5) `🌦` não tem lugar em `glifos.js` (do desenho): a linha do clima da viagem ficou com o ícone de `c.icone`.
- **para quem joga, em número:** o "como" escrito chega ao Mestre em **500 de 500** lutas semeadas (era 0 de 5 nas sessões jogadas;
  82 de 500 com o código de antes); o cartão passa de **fora do ecrã** (y −119) para **y 93** com foco; "vou à Nave" passa de
  **13 h de estrada sem destino e duas respostas** para uma ida com destino, uma resposta e o veredito **antes** da porta (777 de 777
  frases de ida resolvem); as recusas falsas de lugar na masmorra e na luta passam de **12 em 30** para **0** (2000 casos); a
  masmorra diz a sala, quem está e as passagens (308 car.) em 108 de 108 masmorras testadas; esconder-se numa luta diz **antes do
  dado** se há onde sumir, e gasta a ação.
- **o que ficou (na pauta, MM16):** a luz como esconderijo (**pesado**); a masmorra a 168 km em mediana (**pesado**, muda o mapa
  de todos os mundos); "volto a Vau Fincado" da boca; o Cronista antes dos 400 ms; o prompt dentro da masmorra ainda traz
  `resumoDaqui` e os arredores; o primeiro veto cai em 338 de 500 lutas com golpe final (já assim antes); e nada disto foi
  jogado — **a quarta sessão, uma descida inteira (entrar, guardião, chave, chefe, sair, com a companheira), é a prova.**


## 05/10 · v9.349 · fecho de MM11 (3) · a masmorra volta a acabar · a companheira com uma ficha só · commits `dceb455` (v9.348), `9737af7` (v9.349)

- **ciclo morto, e retomado:** o ciclo de 01/10 00:58 (a terceira sessão de prova) **morreu no limite semanal da API** —
  a sessão tinha sido jogada **inteira** (30 respostas) e a transcrição ficou em `mente/mm11-sessao-3.md`, sem commit; a trava
  `.claude/ciclo-em-curso` e as duas entradas de `mente/agora.json` ficaram postas. Retomado a 05/10: árvore só com a
  transcrição por commitar, `main` em `4dabfa5`, v9.347; **a sessão não se rejogou**. Trava tomada e devolvida; bastão do
  `App.jsx` tomado às 19:05 (para o `frontend`, as duas etapas) e **devolvido ao fim da v9.349**.
- **o veredito em números (da transcrição):** *"O nosso Mestre toca uma sessão à la Matt Mercer? Ainda não — e agora
  sabe-se onde."* 30 respostas; **2,27 chamadas por resposta** (era ~2,0 → 3,6 → 2,27; as bocas a zero aguentaram), ~220
  respostas por dia ao teto de 500; 69 de 69 com 200. Perguntas de mesa: **4 do sistema em 15** (3 de 7 na cidade, 1 de 8
  fora; 4 inventadas +1 contradita, 5 perdidas — 5 das 6 más fora da cidade). "[LUGAR — RECUSADO]" falso: **12 em 30**
  (0 na cidade, 12 na masmorra e na luta). O "como" do golpe final: **0 de 2** (0 de 5 em três sessões). O revide fere
  (1 de 1); a sala limpa **não** ficava limpa; esconder-se não esconde; o golpe final da companheira, **pela primeira vez, sim**.
  Os consertos de 30/09–01/10: v9.341, .342, .344, .346 aguentaram; v9.345 metade; v9.347 "está, e parte-se".
  **Onde partiu:** a masmorra (M12–M15, o guardião mudo), não a sessão.
- **o dono do ~1,1 chamadas por resposta (a pergunta aberta da MM15 nº 2):** é o **revisor de continuidade** (o portão,
  `passarPeloPortao`): 8 chamadas (0,27 por resposta, 2.052 car., 2,1 s), provado por duas vias na transcrição (no código,
  das chamadas leves por turno sem botão só sobra o revisor; e no registo é a única chamada leve que não é a do Cronista).
  **E as 8 foram todas pagas por defeito do sistema:** 5 pela companheira (ofício do registo ≠ ofício do grupo; a homónima),
  3 pelo lobo que o próprio sistema ressuscitou. Fechado em v9.348 (as 3 do lobo) e v9.349 (as 5 da companheira).
- **a pergunta pendente: que medida era "o pior caso 85.329 → 85.298", contra o `<82000` de `teste-prompt.mjs`?** São
  **duas medidas diferentes**. O 85.329 → 85.298 (diário de 30/09, v9.346) é a **soma sintética de todas as portas** do
  prompt (`tetoComLex` — todos os blocos opcionais acesos ao mesmo tempo, um teto que nenhuma cena real atinge); e a asserção
  `< 82000` (`teste-prompt.mjs` l.143 e a secção 7) é sobre a **PIOR CENA REAL** (herói de nível 20 desperto, com grupo,
  léxico cheio) — que no mesmo relato desceu **74.709 → 74.644** (com gente: 81.214 → 81.149, a asserção é `<= 82000`).
  Nunca se mediram uma contra a outra, e nunca houve ultrapassagem. E **72.618 de média** nesta sessão é o `system` real
  enviado ao Narrador em 30 chamadas — uma cena comum, abaixo das duas.
- **Parte B — o defeito 1 (v9.348, `dceb455`):** (a) a sala do Guardião (`chave`) não tinha ramo em `irParaSala`: agora
  `SALAS_DE_LUTA` (tabela, `masmorras.js`) diz que `combate`, `chefe` e `chave` abrem luta, e entrar no guardião abre a luta
  com quem o save lhe dá; vencer larga a chave **uma vez** (`desfechoDaLuta`, idempotente) e o portão do chefe abre — provado
  em **280 masmorras reais** (7 níveis × 40 sementes: entrar → guardião → chefe fecha em todas). (b) a sala vencida pelo
  fecho do sistema ficava `resolvida:false`: o fecho ("Todos os inimigos caíram") passa a chamar a mesma porta. **Achado do
  mesmo defeito:** o **chefe** vencido pelo golpe do sistema nunca concluía a masmorra (recompensa, essência, tochas de volta
  — só o ramo do Narrador o fazia, e ele depende de o combate ainda existir quando a resposta chega): o bloco virou
  `concluirMasmorraDoChefe`, chamado pelos dois caminhos, inócuo na segunda vez. Suíte `teste-masmorra-fim`: 102 asserções
  (11 falhavam antes do módulo, 19 antes da fiação). **Varredores:** os endereços de 84 entradas de
  `acoes-do-jogador.mjs` deslocaram (re-medidos, nenhuma asserção afrouxada, cabeçalhos "A MASMORRA QUE SE ACABA"), e a
  catraca do guardado (`check-guardado`) passou a **ler também o envelope que mudou de casa** (o total continua 9; **a
  catraca não desceu**).
- **Parte B — o defeito 3 (v9.349, `9737af7`):** a companheira com **uma** ficha: o registo grava o papel do grupo
  (`PAPEL_NO_REGISTO`: ligação + classe), o ofício do elenco passa a passado; o primeiro nome de quem anda no grupo resolve
  para essa pessoa e não para a homónima (`nomeComDono`, `mencionadosNaCena`, e o portão `detectarPapelTrocado` deixa de
  morder a ficha do grupo — também **cura os saves da v9.347** sem os tocar); quem anda no grupo sai da lista de quem
  trabalha no posto (`NO_GRUPO`); a procura segue um placar escrito (`PLACAR_DA_PROCURA`) e a escolha do companheiro evita
  xarás (11 em 24 mundos → 1). Suítes: companheiro-inicial 152 (21 vermelhas antes), nomes 80, procura 75. Fiação: 3 linhas
  no App, defensivas.
- **decisões médias, com o motivo:** (1) o chefe pelo caminho do sistema entrou **neste** item e não na pauta — é o mesmo
  buraco (duas portas de vitória, uma resolve), cabe em poucas linhas reaproveitando o bloco que já existia, e o jogador que
  mata o chefe pelo golpe e não recebe o tesouro perde a sessão tanto quanto o do guardião mudo; (2) a catraca do guardado
  **manteve o 9** em vez de descer para 8: uma catraca que desce sozinha aceita em silêncio que um envelope resolvido saia
  da vista da trava; (3) `fecharSeTodosCairam` só resolve a sala em curso **se for a atual** (guarda do frontend: uma fuga
  deixa `salaEmCursoRef` velho e resolveria a sala errada numa vitória posterior); (4) o ofício do elenco da companheira
  passou a nota de passado e **não foi apagado** — o que ela fazia é matéria de história, não de registo; (5) a procura
  segue um placar escrito em tabela em vez de uma regra solta (lei: se é número, é tabela).
- **correção de modelos, a meio do ciclo:** a pessoa ordenou (via o coordenador) **Opus para quem programa, Sonnet só para
  quem testa e quem joga**. A v9.348 (backend + frontend) correu em Sonnet, a etapa em curso quando a ordem chegou; **a v9.349
  correu em Opus**. Os três ficheiros de agentes e a linha do `CLAUDE.md` são do coordenador, fora destes commits.
- **para quem joga:** numa descida de masmorra, o guardião **luta** e larga a chave (antes nunca largava nenhuma, em 3
  sessões), o portão do chefe **abre** (280 de 280 masmorras geradas), a sala vencida **fica vencida** ao voltar (já não
  renasce o lobo de vida cheia) e o chefe vencido pelo golpe **paga** o tesouro. A companheira de antes deixa de ser
  "vendedor de ervas" para o registo e de ficar de turno no antigo posto: das 8 chamadas de conserto que a sessão pagou
  (~2 s cada, antes da narração), as 5 da companheira e as 3 do lobo não têm mais causa — esperado 8 → 0, **por provar na
  quarta sessão**.
- **o que ficou (na pauta, MM16):** o "como" do golpe final (0 de 5) — o próximo; "vou à Nave" que não leva à Nave
  (e o veredito antes da porta); a masmorra sem lugar na pauta (12 "[LUGAR — RECUSADO]" em 30); esconder-se; as perguntas
  inventadas fora da cidade; os miúdos. Para a pessoa: a proposta "Como você quer fazer isto?" (a batalha congela e a
  pergunta ocupa o ecrã). `decidirAcaoCompanheiro` ainda sorteia com `Math.random` (a semente não chega lá sem mexer no
  motor de combate).

## 01/10 00:49 · v9.347 · a campanha começa com alguém de antes ao lado · commit `170b735`

- **por que andou:** decisão da pessoa, 30/09: *"A campanha pode começar com um companheiro."* Sem ele, o golpe final do
  companheiro (MM3b) nunca se viu numa sessão: um companheiro pedia 13 dias de convívio. Sem chamadas pagas: provado em Node.
- **estado inicial:** verde (`5e3b1a1`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **quem (`src/companheiro-inicial.js`):** alguém do **elenco**, pela semente do mundo, que vive no mundo, vivo, sem
  propósito hostil, **nunca alguém que a história procura** (a pista, o alvo, a gente dos marcos — um homónimo da pista
  fecharia o primeiro passo sem encontro), de preferência de outra cidade (veio com o herói: 192 de 192). Cinco ligações
  ao passado (companheiro de armas, o mesmo sangue, companheiro de estrada, quem lhe ensinou o ofício, a pessoa a quem o
  herói deve), pesadas pelo antecedente (em 120 campanhas o soldado traz armas 90 vezes; o órfão nunca traz sangue).
- **o laço já feito, sem campo novo:** no grupo, a mesma ficha do convite (a suíte lê os números do App); no registo,
  conhecido desde o dia 0 e um laço com a força da ligação; no elenco, visto no dia 1. O convite passa a contar o convívio
  inteiro de quem é de antes (calculado, não gravado); a promoção nunca o tira.
- **a abertura:** uma frase na parte 2 — "…e não chegou só: Cedric Sombravinda, antigo companheiro de armas do herói, vem
  com ele — …; a razão que o trouxe é também dele" —, uma vez por campanha; sem companheiro, o pedido é igual letra a letra.
  O pior caso do prompt não muda.
- **a régua (a `simularCombate` da casa, níveis 1–3, três lutas de estrada):** herói só ganha 57/64/67% e cai 45/37/34%;
  com o companheiro de armas ganha 86/89/92% e cai 32/20/18%. Nenhuma das 13 fichas possíveis torna a luta trivial (≥98% e
  queda ≤5%), **menos o curandeiro**: um Clérigo ao lado dava 100% com o herói a cair 3,1% — a luta deixava de se poder
  perder. **Decisão (média):** o ajuste é na tabela das classes (`CURANDEIROS_DE_FORA`: Clérigo, Druida, Bardo, Invocador
  não vêm de antes), não no orçamento de encontro — que já cobra o companheiro (1 inimigo comum sozinho passa a 2 com ele).
- **o golpe final do companheiro (MM3b):** vale desde a primeira luta (estar no grupo e de pé).
- **os modos:** `historia` sim; `rapida` não (os pratos da Noite foram medidos com o herói só, e a Noite não passa pela
  abertura da MM13); `duelo` não (PvP); nem capítulo novo, nem sala de dois (o outro jogador já ocupa o lugar), nem save
  antigo.
- **frontend:** o nascimento em `iniciar` em try/`calou`; `convivioCom` passa por `convivioDaFicha` (idêntico para os
  outros, 21/21); o primeiro turno já vê o grupo (o `enviar` remonta grupo e cena a cada turno a partir da ficha);
  `teste-convite`, `teste-mm13-abertura` e as medidas das ações do jogador acompanharam, com o motivo.
- **a ver na sessão:** a base do mundo ainda põe o companheiro no seu antigo posto, na cidade dele — confirmar que não
  aparece "de plantão" lá.
- **para quem joga:** a campanha começa com alguém que já a conhece de antes, pela mesma razão — e com ele, a primeira luta
  é a dois.

## 30/09 23:45 · v9.346 · a voz do Mestre passa à segunda pessoa, como a do Matt · commit `5e3b1a1`

- **por que andou:** decisão da pessoa, 30/09: *"Vamos passar a voz do mestre pra segunda pessoa, assim como o Matt."* Era
  a voz do Narrador em massa, que a lei reservava a ela; agora dada. "Você", o português do Brasil dela. Sem chamadas pagas:
  provado pelo que o jogo envia; a jogada é a terceira sessão.
- **estado inicial:** verde (`cf0afe5`).
- **bastão:** tomado por mim para seis trocas de texto no `App.jsx` (deslocamento zero); devolvido com este commit.
- **backend — a causa:** nenhuma regra do prompt pedia a primeira pessoa; o que a empurrava era **a convenção da casa** — os
  envelopes falam como o "eu" do herói, e nenhum texto dizia ao Narrador que esse "eu" era o herói. E a abertura (o turno
  que dá o tom à campanha inteira) pedia literalmente "ONDE EU ESTOU", "como memória minha" — a causa direta do "aponta para
  minha trouxa" do M1 das duas sessões.
- **a regra dos envelopes (escrita no cabeçalho de `src/prompt.js`, provada nos dois sentidos):** no envelope, "eu" é o
  jogador a falar ao Mestre e "você" é o Narrador; o envelope pode contar na primeira pessoa o que o jogador fez, pediu,
  tem, sabe ou sofreu; mas todo texto que a narração possa copiar tal qual (exemplo, frase-modelo, sonho, achado, o pedido
  da abertura) vai na segunda, porque a narração devolve o "eu" do jogador como "você".
- **mudou:** uma frase de ligação no ofício do prompt (o herói é "você", "a guarda aponta para a sua trouxa", nunca
  "minha"); o pedido da abertura nos dois caminhos (`abertura.js` e o antigo no App); os exemplos das vozes (Febril, Épico);
  os 12 sonhos (na segunda, neutros de género) e o envelope do sonho; o achado vazio; "em primeira pessoa" dos NPCs → "em
  fala direta"; e a sala de dois ganha "o nome antes do você" ("Lia, você vê…") — com dois heróis, "você" sozinho não diz
  de quem é o corpo (texto do prompt, não o protocolo).
- **ficou (é o jogador a falar, marcado pelo colchete):** "Eu perguntei", "[CHEGADA] … AGORA ESTOU", "Procurei e ACHEI",
  "ONDE EU ESTOU:" da pauta, os capítulos, "NÃO NARRE O QUE EU SINTO".
- **a escolha de voz da criação é de tom, não de pessoa** (as oito vozes mudam tom e registo; a pessoa é a mesma) — nada a
  migrar, o save não muda. **Um só prompt de Narrador** para os três modos.
- **o teto, que só podia descer:** todas as portas **85.329 → 85.298**; pior cena real 74.709 → 74.644; com gente 81.214 →
  81.149; cada voz ~31 caracteres mais barata — a frase nova pagou-se com quatro cortes de texto que nada citava.
- **orquestrador:** apliquei as seis trocas do App e a secção de fiação da suíte; o `teste-sala` (v9.120) pedia "o que vim fazer aqui" e passou a "o que veio fazer aqui", com o motivo — a mesma intenção na voz nova.
- **fora do tema, à vista:** `rolarSonho` (`calendario.js:62`) usa `Math.random` cravado, contra a lei da semente — na pauta.
- **para quem joga:** o Mestre fala consigo — "você vê", "a guarda aponta para a sua trouxa" — como numa mesa.

## 30/09 23:17 · v9.345 · MM15 (5) · dois Túlios são duas pessoas, e "Lina," é a Lina do Sal · commit `dad3832`

- **por que andou:** o último da MM15 — no T5 da segunda sessão o "Túlio da Runa" do cartaz, sumido na estrada, fundiu-se com
  Túlio, o músico da cidade que a ficha põe em casa; daí em diante "Túlio ✓ conhecido" sem a heroína o ter visto.
  **Sem chamadas pagas hoje:** provado em Node.
- **estado inicial:** verde (`062d7f0`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend — a causa:** a fusão dava-se em `nomeComDono`: o músico vinha no elenco, nunca registado, e caía em "só um nome e
  o lugar bate → é ele". O lugar "batia" porque o `local` da ficha nova se juntava ao "aqui" da heroína; e a regra só
  perguntava "pode ser ela?", nunca "o que os separa?" — não lia sobrenome, paradeiro nem ofício, e o App nem os passava.
- **a regra afinada:** o primeiro nome igual só funde quando nada os distingue — sexo, sobrenome de família diferente,
  paradeiro (sumido/na estrada contra em casa), ofício de famílias diferentes, o local de quem está longe; separados, a gente
  do mundo deixa nascer o novo com o nome inteiro, e quem a história persegue continua a recusar. O nome inteiro que o mundo
  já conhece é da própria pessoa. O "Túlio" solto, havendo dois, decide pela conversa, o lugar, o ofício e o paradeiro; em
  empate, ninguém — e pede-se o nome inteiro. O que a v9.338 acertou fica (a Delfina da Névoa, a mescla de quem já está
  registado, o "Floripes do Sino").
- **em número (24 mundos, 75 cartazes de sumidos com o primeiro nome de alguém do elenco ou da espinha, 3 fichas cada):**
  fundidos na pessoa errada **3/3/5 → 0**; fusões certas mantidas **474 → 482 de 482**. E um defeito escondido que a medida
  achou: **72 dos 75** cartazes tinham o próprio nome recusado pelo registo, e o Narrador recebia a ordem de trocar o nome do
  cartaz → **0**.
- **frontend:** `contextoDoNome` passa o elenco com ofício, sexo e de onde vem, quem o mural procura, e a conversa recente.
  **Decisão (leve, alargada com motivo):** incluí o vizinho do item 4 — `pessoaNaFrente` só reconhecia o nome inteiro, e no
  T10 a persuasão foi contra "essa pessoa" em vez da Lina do Sal; agora usa `nomeProcurado` (o primeiro nome), com a guarda
  de não adivinhar quando dois presentes o partilham. É o mesmo defeito de nomes, na mesma sessão, com teste.
- **para quem joga:** o homem que sumiu na estrada não é o músico que está em casa; e "Lina, diz-me…" fala com a Lina.

## 30/09 22:25 · v9.344 · MM15 (4) · o que a história guarda só sai pelo sistema · commit `062d7f0`

- **por que andou:** o quarto da MM15 — no T10 da segunda sessão a jogadora pressionou a taverneira ("diz-me o que se
  passa no Fundo do Poço"), **não houve teste**, o Mestre fez da casa de banhos da base um poço maldito, e o Cronista
  gravou-o no cânone: o marco 2 da espinha ganhou uma verdade que o sistema não elegeu. O coordenador: nenhum segredo da
  história chega ao cânone sem passar pelo sistema. **Sem chamadas pagas hoje:** provado em Node.
- **estado inicial:** verde (`daf3c12`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend — as causas:** (b) a frase não tinha "?" (o "perguntar é de graça" nem foi consultado); o catálogo de persuasão
  só conhecia "convenço/argumento/insisto", e "não saio do balcão" casou com "deslocar-se e olhar" — sem dado, `livre`.
  (a) As duas portas do cânone (a do Narrador e a do Cronista) gravavam tudo o que chegava, sem olhar a espinha; e a espinha
  não elege o conteúdo de um marco "descobrir" — elege o lugar e o momento, e o marco cai quando o lugar entra em cena.
- **as regras (`src/segredo-guardado.js`, tabelas):** `peneirarCanone` recusa, em silêncio, a entrada que é o segredo de um
  marco de pé (o lugar, o que lá estaria) e a que reescreve a espécie de um local da base; com o marco feito, passa.
  **Decisão (média):** recusar e não guardar como boato — a figura de boato não existe (o cânone vai todo como fato) e
  criá-la mexeria no save e no prompt. Na persuasão, o desafio `fazer_falar` (Persuasão; Intimidação e Enganação ao mesmo
  preço) nasce só quando a frase arranca um segredo guardado; CD 16 na tabela, entre o favor (14) e quebrar uma regra (18) —
  a Lina do T10 dá 17; o sucesso compra o que a base sabe, nunca o que o lugar esconde. A pergunta de balcão continua de
  graça. E `vetoDoSegredo` vai ao `naoPode` sempre que o turno nomeia um segredo guardado (124–188 caracteres, pela pauta
  dinâmica — nada de bloco estático; o teto de prompt fica).
- **em número (24 mundos × 8 estruturas, 1155 marcos de pé):** frases de pressão sobre o segredo com teste ao preço do
  segredo **1155 de 5775 (e ao preço de favor) → 5775**; com veto **0 → 5775**; entradas de cânone sobre o segredo que entram
  **3465 → 0**; controles (gente da casa, promessas, locais pela própria espécie) recusados **0**. O T10 literal: `livre` →
  teste Persuasão CD 17, e "Fundo do Poço" recusado no cânone.
- **frontend:** o import, `mundoDaBase`, `segredos` no `ctxDesafio`, o veto depois dos da abertura, a peneira nas duas portas
  com recuo para a lista original se estourar; 93 endereços das ações do jogador re-medidos por conteúdo.
- **o que fica (na pauta):** "Lina," não acha a Lina do Sal (`pessoaNaFrente` só lê o nome inteiro); o "Fundo do Poço" já
  gravado num save fica (apagar é dado de jogador); e a proposta de o "o que X esconde" ser o segredo que a base já põe
  no local, eleito na criação do mundo.
- **para quem joga:** o que a história guarda tem de se arrancar a alguém — com dado, e com preço — e o Mestre já não o
  inventa nem o escreve na pedra.

## 30/09 21:12 · v9.343 · MM15 (3) · quando a ligação cai, o jogador lê que foi a ligação, e o mundo não anda · commit `daf3c12`

- **por que andou:** o terceiro da MM15, pedido pelo coordenador **para qualquer falha da API**: no T11 da segunda sessão o
  teto respondeu 429 e a tela disse "A porta não se abre para esta mão: o Mestre não conta esta história a quem bate
  assim" — o jogador lê que fez algo proibido, tenta outra coisa e gasta mais —, e o relógio andou 10 minutos num turno
  que não aconteceu.
- **estado inicial:** verde (`999ae0a`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend — a causa:** o 429 do teto e o 403 de origem caíam na mesma classe (`recusado`), com uma frase só, de recusa de
  conteúdo; e nada na classe era sobre o que o jogador escreveu. As recusas de conteúdo **verdadeiras** estavam noutra
  (o SAFETY do Gemini, o "Content Exists Risk" do DeepSeek), misturadas com o provedor caído. O relógio: 5 min em
  `agirInterno` e 5 em `talvezAndarNaCidade`, os dois antes da chamada; e o `catch` só repunha a nota. Antes da chamada o
  turno mexe em ~40 campos do save (relógio, lugar, ficha, missões, o reino inteiro pelo `avancarDiasReino`).
- **o conserto:** `MOTIVOS_DO_SILENCIO` — dez classes numa tabela, cada uma com a linha para o jogador e se há botão; nove
  são de ligação ("A ligação caiu antes de o Mestre ouvir você", "A mesa do Mestre fechou por hoje: a ligação só volta às
  21h do seu relógio") e uma é recusa de conteúdo, só quando **todos** os provedores recusaram. E o turno que falhou não
  aconteceu: uma foto do save no início do turno e outra no envio; na falha o mundo volta à foto (menos o custo e as
  marcas que sobrevivem), a frase volta à caixa, e o turno não fica guardado. A exceção de X3 fica de pé: o que os dados já
  rolaram não se desfaz (contra a re-rolagem).
- **frontend:** `retratoDoJogo()` extraído do `salvar` — **o save sai com as mesmas chaves**, provado contra o de HEAD;
  `aplicarRetrato` estreito (não reaproveitei `continuar` inteiro: redispararia recap, despertar e migração a cada falha);
  as fotos em `agirInterno`, no mapa e no topo de `enviar`; o `catch` desfaz, guarda ou não, grava **depois** de repor; a
  segunda linha da falha na tela, com a peça de texto que já existia.
- **a prova jogada (sem gastar: o teto devolve 429 ao nosso endereço de graça):** "Saio da taverna e vou ao mercado" → a tela
  diz "A mesa do Mestre fechou por hoje: a ligação só volta às 21h do seu relógio" e "Nada do que você fez chegou a acontecer:
  a sua frase espera por você", sem botão; relógio e lugar iguais; a frase na caixa; o histórico sem duplicar. Rede caída
  (fetch rejeitado) → "A ligação caiu antes de o Mestre ouvir você", com "Tentar de novo".
- **para a pessoa (infra, não mexi):** a mensagem da API diz "volta a zero à meia-noite", mas o teto conta pelo dia UTC — no
  Brasil reabre às 21h. A tela já diz a hora local. E fica corrigido um bloqueio que ninguém via: um golpe já rolado que
  apanhava o teto deixava a mesa trancada sem botão, mesmo depois de o teto reabrir.
- **para quem joga:** quando a ligação cai, lê-se que foi a ligação; o mundo não anda; e a frase fica à espera.


## Os ciclos anteriores

Os 63 ciclos mais antigos estão em `mente/arquivo/diario-antigo.md`,
inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo
ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.
