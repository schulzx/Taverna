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

## 11/10 18:40 · v9.409 · MM-C · C1, o núcleo (`backend`) · este commit
- **estado inicial:** HEAD verde. O `frontend` ligava a C0 no App.jsx ao mesmo tempo (subiu `2ac051c`, v9.408) — não toquei no App nem nos arquivos da C0; provado com `so-o-meu.sh` (HEAD + `nucleo.js`, `pauta.js`, `teste-nucleo.mjs`, `teste-ligacao.mjs`: 314/314 suítes, 16/16 varredores).
- **backend:** `src/nucleo.js` — as tabelas do §1 de `mente/coracao-c1-c2.md` transcritas inteiras (PAPEIS, QUER 20, QUER_DO_PROPOSITO, TEME 18, ESCONDE 20, CARREGA 16/10/10, LINHA 15, COMO_FALA 22, TIQUES_PROIBIDOS, TEIA 10, ELO 13, PISTAS_DO_ELO 13×2, COMPANHEIRO_POR_LIGACAO, FERIDA 8); `nucleoDaCampanha` (4–6 pessoas do grupo/fio/elenco, fichas de seis campos, teia), `linhaQuemE`/`quemEParaPauta` (≤ 130, uma por turno, a mesma pessoa de 6 em 6 turnos, o exemplo da fala só nas duas primeiras cenas), `revelacaoPermitida`, `garantirCoracaoDoSave` (campo novo `coracao`, §2.7). `pauta.js`: secção `quemE` (QUEM É, prio 4,5) e `quemE` em `SECOES_QUE_CEDEM.luta`; o teto não subiu. `teste-ligacao`: `nucleo.js` na lista de espera, credor o frontend (sai quando o App o importar).
- **testes:** `teste-nucleo.mjs`, 108 asserções em 120 mundos semeados (as catracas do §7: determinismo, 4–6 sem gente de fora, categorias, briga, teia, os 13 elos com o gémeo, o segredo nunca na linha em 40 × 60 turnos, ≤ 130, pautas cheias sem perder veto nem desfecho, save, lixo, imutabilidade).
- **decisões médias tomadas:** · (a, da pessoa pelo orquestrador) companheiro e elo da mesma ligação → o elo é outra pessoa e nasce `t_morto_vivo` (o companheiro julga-o morto); ligações que casam: soldado/caçador ↔ `armas`, artista ↔ `oficio`. · (b) a traição nunca no ato do elo: `ATO_DA_REVELACAO` (elo 0, máscara ≥ 1) + `revelacaoPermitida` (nunca duas no mesmo ato) — é o que a C2 chama. · **só o elo e a máscara levam segredo `sombra: true`**: as duas únicas revelações, e "nunca duas no mesmo ato" vira regra de duas pessoas. · "nenhuma categoria repete" é estrito no `quer` (o do vilão é o motivo do chefe, fora das 5) e no `teme`; no `esconde` (4 gravidades) e no `carrega` (3 tipos) para até 5 pessoas não cabe — os ids nunca repetem e as categorias espalham-se pela menos usada. · O vilão não tem `teme` nem `carrega` (o `cabe` da tabela exclui-o; o §1.6 só revela tique, linha, ferida e quer). · Quando o "outro" de alguém é o vilão, a ficha guarda `{sombra}`: no ato 0 ninguém lhe sabe o nome. · O xará do vilão (nome curto) não entra noutro papel; a voz passa ao `procurar` seguinte. · **Ferreiro:** a tabela dava ao elo "o martelo do pai do herói", que o antecedente já põe na mochila do herói; ficou o PAR desse martelo (a regra do gémeo, §1.5). · O elo prefere candidatos cujos traços não briguem com o `quer` fixo da tabela dele. · As perguntas do §7: o elo vem do elenco (doArco/recorrente, cidade do ato 0), sem promoção; a balança é o `{gente}` do relógio, que já é nome (o `quem` de um `procurar`); "a pista foi à cena" fica para a C2.
- **o que ficou:** o ritmo da linha (quem foi quando, quantas cenas) vive num ref do App, não no save (o §2.7 não o tem). A fiação toda é do `frontend` (lista no relato). A secção `coracao` (QUEM CARREGA, 2,46) e as batidas são da C2.
- **e a fogueira (aprovada pela pessoa, §6), só a peça do motor:** `fichaNaVoz(pessoa, { contados, tamanho, fio })` + `FOGUEIRA_CONTA` — o próximo campo da ficha que a pessoa conta na voz dela (o que traz → o que quer → a linha → o que a tira do sono; nunca o esconde, nunca o vilão), uma frase fechada ≤ 220 com o tique. A fogueira em si (a escolha no descanso, a tela) NÃO foi construída. Commit seguinte ao da C1, na mesma versão (a etapa é a mesma e nada subiu).

## 11/10 18:30 · v9.408 · MM-C · C0, as mãos — a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `0f4cede` verde; o `backend` escrevia ao mesmo tempo `src/nucleo.js` + `teste-nucleo.mjs` (e mexia em `pauta.js` e `teste-ligacao.mjs`) — não toquei nesses.
- **bastão do App.jsx:** tomado 18:01 ("frontend C0"), devolvido 18:29, ao fim das edições do App; só para esta fiação.
- **frontend (App.jsx, por âncora, tudo em `calou`):** (1) `declararAgressao` passa `mostrado` (as duas últimas falas do Mestre, `falasDoMestre`) a `lerAgressao`; (2) no `agirInterno`, junto da bolsa, `vetoDaLutaSemPainel` soma ao `naoPodeDoTurnoRef` — e, se o próprio turno abriu o combate (a agressão declarada), o veto é tirado antes da pauta, para não pedir `combate_iniciar` com o painel já aberto; (3) `conferirEspinha(…, { ato: historia.etapa })`; (4) `mundoDasMissoes` leva `soPeloFato: fatosQueFecham(espinha)` e `segredosRevelados` — o molde do `falouComRef`: uma secção nova no Cronista, depois do `falou_com`, com o teste do turno (`testeDoTurnoRef`, posto pelo dado e pela concessão, lido antes da espera do Cronista) e a narrativa, limpo logo a seguir; (5) `registrarLugar` passa `doMarco` (o `onde` dos marcos de pé) e regista `lido.nome` quando o pedido aponta o sítio do marco; (6) `contextoDoNome` leva `heroi`; (7) a bolsa lê a frase anterior do jogador por `fraseAnteriorRef` (posto no começo do turno, de `mensagensRef`). Nenhum ref novo vai ao save.
- **testes:** três asserções de texto movidas com o motivo escrito (`teste-espinha` — o 4.º argumento; `teste-masmorra-na-pauta` — o `doMarco`; `teste-mm15-nomes` — o `heroi` no fim do retorno), mais duas novas que mordem a fiação; os 146 endereços de `acoes-do-jogador.mjs` re-medidos pelo diff contra o HEAD, e os nus à mão (`ondeSai`, o relógio, o `pushMsgs` do bloco 6).
- **prova:** build limpo; na árvore, 314/314 suítes e 15/16 varredores — o vermelho é `check-imports` em `nucleo.js` (`catDe()` indefinido), do `backend` em voo; `so-o-meu.sh` com os meus 7 arquivos: 313/313 e 16/16. Vivo: aba nova no dev-server, o menu monta, sem `LimiteErro` e sem erro no console. Nenhuma chave de save tocada (não havia campanha neste navegador; não comecei uma).
- **decisões médias tomadas:** · `conhecidas` ficou de fora do alvo do golpe: o marco "enfrentar" guarda só o nome do bicho, e a ameaça pediria `criaturasDaRegiao` no App — o bicho da prosa entra com a ameaça comum do motor. · A frase anterior sai de `mensagensRef` (sobrevive ao recarregar), guardada num ref de turno.
## 11/10 · v9.407 · MM-C · C0, as mãos — o motor (`backend`) · este commit
- **estado inicial:** suítes verdes (313); a 6.ª sessão (`mm11-sessao-6.md`, 3,2) com os três consertos escritos. O `jogo` trabalhava ao mesmo tempo só em `mente/coracao-*.md` — não toquei lá. **App.jsx não tocado**: a ligação é do `frontend`, na lista que segue no relato.
- **backend:** (1) `rastro.js` — `VERBOS_DE_PARTIDA` (tabela, com o plural) e `PERGUNTA_NAO_PARTE`: o período com "?" não parte nem dá destino; o J19 já não abre a jornada. `agressao.js` — `criaturaMostrada` + a ordem nova em `alvoDaAgressao` (opção `mostrado`): a pessoa citada na oração do golpe, senão o bicho que o Mestre mostrou e o jogador nomeou, senão o de sempre; `lerAgressao` devolve `criatura: true` e `crime.lerCrime` não a julga crime. `vetoDaLutaSemPainel` + `LUTA_SEM_PAINEL` (canal `naoPode`). (2) `saga.js` — `conferirEspinha(…, { ato })` não fecha marco de ato posterior; `fatosQueFecham` e `segredosReveladosNoTurno` (+ `PERICIAS_QUE_ACHAM`, `PISTA_DADA`); `missoes.js` — `revelar`/`falar_com` leem `mundo.soPeloFato`, `segredosRevelados`, e a conversa vale pela `cidadeAtual` também. `lugar.js` — `doMarco` em `lerLugarDito` (`LUGAR_DO_MARCO`). `npcs.js` — `nomeComDono` recusa o herói (`contexto.heroi`) e a descrição (`ehDescritor`, `QUEM_NAO_E_GENTE`), e funde "o carroceiro" no único carroceiro da cena. (3) `bolsa-da-frase.js` — `compraNaFrase(…, { anterior })`: o "pago" sem item herda o "quanto é"; `O_ACENTO_SEPARA` (a maçã não é a maça).
- **testes:** `teste-mm-c0.mjs`, 72 asserções com as frases reais (J19, J37, J39, J47/M47, J8, J12, J23, J31, M36, M39). Na árvore de HEAD (`git archive` no scratchpad) falha no 1a e estoura no 1b.
- **decisões médias tomadas:** · o "pela presença" só sai para a espinha com cena — `descobrir` com `segredo` e `procurar` com `batida`; espinha antiga e tarefas de guilda ficam na régua de sempre, porque é onde o defeito foi medido e onde a conversa (`falou_com`) existe. · O bicho da prosa entra como combatente com ameaça "comum" (ou a do marco/bestiário, via `conhecidas`): a trava "o sistema não inventa o alvo" fica — quem o pôs ali foi o Mestre. · `pedeOSitio` não passa pela peneira inteira: o "Respondo que sim," do J31 apagava (`falaDita`) a frase toda até ao fim — anotado como achado, não mexido (a peneira é de todos). · "vamos" não entrou nos verbos de partida ("vamos conversar sobre X"). · Descrição = nome sem nenhuma palavra com maiúscula; o nome minúsculo que já está no registo continua a casar.
- **o que ficou:** a fiação toda (relato ao orquestrador). `mercadoParaPauta` (mercado.js) ainda lê "quanto custa a maçã?" como a maça — `O_ACENTO_SEPARA` está pronta para ele, mas mercado.js não importa de bolsa-da-frase (circular); fica para quem ligar. A peneira `falaDita` apaga do "respondo que" até ao fim do texto — vale um item na pauta.

## 11/10 · v9.397–v9.405 · MM11 #5: o jogo regista o que o jogador fez (`frontend`, à mão) · 22b6ec8, 4709c21, 0ca1f4d e este

- **bastão:** `.claude/app-jsx` tomado ao começar, devolvido (apagado) ao fechar. O backend andou em paralelo no laço
  da história (missoes/saga/abertura/ofertas) — não toquei nesses; o vermelho de `teste-missoes` a meio era dele
  (provado com `so-o-meu.sh`: HEAD + só os meus, tudo verde).
- **J6 (v9.397):** "saio para a praça e procuro o mural" rolava Percepção na taverna. Mural/cartaz entram em
  `PROCURAR_PARA_IR`; e quando a frase tem destino E um ato que o catálogo julgaria, `adjudicarAcao` move primeiro
  (o passo morava só no envio, que corre depois do desafio). Suíte `teste-passo-antes-do-ato` (falha 11× em HEAD).
- **M10 + M35 (v9.400, juntos porque partilham a fiação):** `bolsa-da-frase.js` — a compra declarada de mantimento ao
  preço do balcão (a quantia dita é teto; a pergunta de preço nunca compra) e a dádiva de ração/água/tocha a quem está
  na cena. Corre antes do despachante (o oráculo tinha ganho o M10). Fecha → débito + envelope de compra registada;
  não fecha → a linha do porquê + veto em `naoPode` (`naoPodeDoTurnoRef`, um turno). Dar: mochila desce, companheiro
  ganha vínculo, quem não é do grupo grava `meDeve` (campo novo do npc; acende o sinal do Intérprete que ninguém
  dava). O preço do balcão perguntado (J9) entra na ficha do mercado da pauta.
- **M32 (v9.403):** a Intuição de "ele" rolou sem pessoa (Hakon + Edric em cena). `pessoaNaFrente` escolhe o único de
  fora do grupo; o "sim, mente" do mundo viaja com o dado; `leitura-de-pessoa.js` dá ao envelope do sucesso UMA
  verdade da ficha (mente / quer / sabe de um marco / esconde / dívida / quem é), duas no crítico; o conteúdo do que
  se esconde só no crítico, o que a espinha guarda nunca.
- **"paper" (item 5):** veio do modelo — aparece primeiro na RESPOSTA da chamada 15 do registo, não está em pedido
  nenhum nem em tabela/léxico do projeto. Anotado, sem conserto (não há filtro de anglicismo na prosa; seria órgão novo).
- **prova viva (v9.405):** campanha nova no dev server. "Agradeço, termino a cerveja e saio para a praça. Procuro o
  mural" → nenhum dado, o herói saiu do Punhal Solitário e o Mestre narrou o mural na praça. "Compro rações para dois
  dias e duas tochas" com ◉ 15 → "◉ Não chega … ◉ 16", bolsa intacta, o vendedor não entregou. "Compro duas tochas" →
  fechou, mas comprou TRÊS (o "as tochas" de antes, plural sem número, ganhava) — corrigido aqui: a menção com número
  vence, e a suíte tem o caso. "Entrego uma tocha a Wren" → tochas 3 → 2, vínculo dela subiu. A Intuição ficou só na
  suíte (não montei a cena com NPC).
- **localStorage:** antes só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens` (guardados em scratchpad); a prova
  criou `taverna_save_v1`; removido com o jogo desmontado e conferido por leitura (as duas cfg intactas).
- **decisões médias:** o kit é "a corda" do balcão (é o único lugar com corda); plural sem número = 3 (tabela
  `QUANTIDADE_DA_FRASE`); mercadoria de banca não fecha pela frase (fica o veto) — o painel continua a porta dela.
- **pedido do coordenador (v9.406):** as duas fiações do laço da história na mesma vez do bastão — `espinha` em
  `mundoDasMissoes` (a missão fecha pelo marco que a espinha fechou) e `chefesDoFio` (o prompt e o `/chefes` passam
  `{ espinha }` a `resumoChefesPrompt`, com recuo à lista de antes em try/calou). Asserções no §9 de `teste-fiacao-prende`;
  a sonda da mesa ganhou `chefesDoFio` como vizinha de `enviar` (com o motivo).
- **o que ficou:** a compra de banca pela frase; Edric precisa de estar no registo para a dívida gravar (só grava em npc
  registado); o 📍 do passo-antes aparece acima da fala do jogador quando há dado.

## 11/10 · v9.404 · MM, o laço da história (6/6): a lei da cidade é uma só (`backend`) · este commit

- **tocados:** `cidade-por-dentro.js` (`leiDaCidade`, tabela `LEI_DA_CIDADE`; as respostas "lei" e "reconhecer"),
  `abertura.js` (a lei da porta lê `leiDaCidade`), `lexico.js` (`ROTULO_DA_REGRA`); suíte `teste-lei-uma-so` (18);
  `teste-lexico` §… asserção movida com o motivo escrito (o rótulo mudou, o campo continua a entrar sempre).
- **o defeito (sessão 5, coerência 8):** o guarda cobrou o salvo-conduto à porta; o taverneiro, perguntado pela lei, citou
  "mantenha seu juramento" — a regra do MUNDO do Léxico, rotulada "A LEI DESTE MUNDO". A resposta da ficha à lei dizia só quem a guarda.
- **o que muda:** perguntar pela lei responde "quem guarda a lei: …; e a lei, à porta: <a mesma regra que a abertura
  cobrou>"; perguntar pela porta diz "— é essa a lei daqui"; o Léxico chama à regra do mundo "A REGRA DO MUNDO" (1 caractere
  mais curto: o bloco fixo não cresce).
- **números:** a frase do J4 em 24 campanhas — a resposta à lei traz a regra da porta da abertura **0 → 24 de 24**.
- **fiação do App:** nenhuma. Nota para o desenho: `falaDoLexico` (a frase da mesa ao criar o mundo) ainda diz "📖 A lei
  deste mundo" ao jogador — texto de tela, não mexi.

## 11/10 · v9.402 · MM, o laço da história (5/6): os guardiões do marco não pregam no mural (`backend`) · este commit

- **tocados:** `ofertas.js` (`genteDaHistoria`, `casaDaHistoria`, `ofertasDaqui`), `batidas.js` (`GUARDA_NA_CENA`, a frase do
  guardião num sítio só); suíte `teste-guardioes-do-marco` (30).
- **o defeito (sessão 5, defeito 6):** o único cartaz foi "A caçada de Corwin o Silencioso", o arquivista que a espinha põe "à
  guarda" d'A Biblioteca do Peregrino (marco 2). O filtro da v9.374 só lia quem um marco procura.
- **o que muda:** entram na gente da história o alvo de "acabar com" e do confronto, quem a cena de um marco diz que o guarda,
  e a casa de cada marco de lugar ("Lugar, em Cidade"), de onde o mural tira o guardião quando a cena não o nomeou (o
  primeiro da gente da casa, o mesmo que batidas.js escolhe). Só o guardião se cala; a outra gente da casa continua a pregar.
- **números (24 campanhas, 126 marcos de descobrir):** o guardião no mural **99 → 0**; murais vazios nas cidades desses marcos
  3 → 4. **Decisão média:** calar a casa inteira esvaziava 10 de 111 murais (eram 2) e tirava 33% das ofertas — ficou só o guardião.
- **fiação do App:** nenhuma (`historiaDoMural` já passa a espinha a `genteDaHistoria`).

## 11/10 · v9.401 · MM, o laço da história (4/6): um vilão só (`backend`) · este commit

- **tocados:** `mundo-base.js` (`resumoChefesPrompt(…, lex, { espinha })`, tabela `UM_VILAO_SO`); suíte `teste-um-vilao-so` (23).
- **o defeito (sessão 5, "5c" e coerência 7):** quatro candidatos — o fio "Dragão Jovem a Mão Fria", a lista "Golem de Pedra a
  Mão Fria — LINHA PRINCIPAL" (a mesma vaga sorteada outra vez com o Léxico que proíbe dragões, que a espinha não tinha ao
  nascer), "Dragão Jovem/Elemental Menor a Viúva de Ferro", e seis chefes cada um com o seu querer.
- **o que muda:** com a espinha, o topo da lista é o antagonista do fio (nome e querer da espinha, covil e nível do chefe
  principal); os outros vêm UMA vez sob "os que o servem (nenhum quer nada por conta própria)", sem querer próprio, e o
  secundário que a espinha prometeu num marco tem o nome dela. Sem espinha, fio cumprido ou antagonista morto: a lista de sempre.
- **números (24 campanhas, a espinha sem Léxico e a lista com ele, como na sessão):** topo = antagonista do fio **10 → 24 de
  24**; vontades de vilão por prompt **4–6 → 1**; a lista nunca cresce (1222 → 1056 caracteres na 1.ª campanha).
- **a fiação que fica para o App (duas chamadas):** `resumoChefesPrompt(sementeMundo(), mapaRef.current, baseMundoRef.current,
  generoMundo(), (mundoAtual() || {}).lexico, { espinha: espinhaRef.current })` — a do prompt (~l. 12592, `const chefes = …`) e
  a do `/chefes` do modo deus (~l. 6446). Sem isto, a lista é a de sempre: o ganho só chega ao Narrador com a fiação.

## 11/10 · v9.399 · MM, o laço da história (3/6): o passo sai de onde o herói está (`backend`) · este commit

- **tocados:** `abertura.js` (`proximoPasso` com `aqui`: a pessoa da etapa atual, ou de uma adiante por cima de caminho, que
  está no sítio onde o herói está; `PASSO_AQUI.pessoa`); suíte `teste-passo-de-onde-estou` (26), sobre `registo-s5-pauta.json`.
- **o defeito (sessão 5, defeito 3):** O RUMO disse "Procurar Osric Pé-Leve na Candeia Faiscante" em 22 pautas com o herói em
  Ponte Lenta, à espera do Edric que a missão procurava.
- **números (as pautas reais da sessão, recalculadas):** na Ponte Lenta a apontar para a Candeia **22 → 0** (as 22 passam a
  "falar com Edric, que está aqui"); dentro da Candeia a "procurar" **3 → 0**. Fora dos sítios da missão (a estrada, o mercado,
  a Boca) o passo continua o da missão — com a v9.396 ligada, a missão fecha na ponte e esse passo deixa de existir.
- **fiação do App:** nenhuma (`linhaDoRumo` já recebe `mundo.aqui`).

## 11/10 · v9.398 · MM, o laço da história (2/6): um lugar não é gente (`backend`) · este commit

- **tocados:** `npcs.js` (`nomeComDono`, `notaDoHomonimo`, tabela `LUGAR_NAO_E_GENTE`), `abertura.js` (`proximoPasso` lê
  `aqui`, tabela `PASSO_AQUI`), `escuta.js` (`linhaDoRumo` recalcula o passo com `mundo.aqui`); suíte `teste-lugar-nao-e-gente` (41).
- **o defeito (sessão 5, coerência 1):** o Cronista registou o taverneiro como "Taverna Candeia Faiscante"; a pauta mandava
  "Procurar Osric Pé-Leve na Candeia Faiscante" com o herói lá dentro; o Osric nunca teve cara, e "falar com Osric" nunca fechou.
- **o que muda:** um nome que abre por um tipo de lugar (ou que é, sem artigo, a casa de quem importa) não nasce pessoa: se a
  casa é de UMA pessoa que importa e o herói está lá, é ela (o Osric entra no registo e a etapa fecha); senão, recusa com a
  linha "é o nome de um lugar, não de uma pessoa". E com o herói na casa da pista, O RUMO diz "falar com Osric Pé-Leve,
  taverneiro daqui, que diz ao herói o próprio nome logo que lhe fala" — o nome e o ofício da ficha.
- **números:** a ficha da sessão: "nova" → resolvida para o Osric; missão 0/2 → 1/2 na Candeia; 3000 nomes do gerador, 0
  lidos como lugar; dentro da Candeia, 3 pautas a "procurar" quem estava à frente → 0.
- **fiação do App:** nenhuma — o registo já passa por `nomeComDono` com `aqui` no contexto, e `linhaDoRumo` já recebe o
  `mundo` (fiação do MM19).

## 11/10 · v9.396 · MM, o laço da história (1/6): o fio é um só (`backend`) · este commit

- **quem:** `backend`, à mão, sem o bastão (o `frontend` está no `App.jsx` com as ações que o jogo não regista). Tocados:
  `missoes.js` (`conferir`), `abertura.js` (`aindaSoUmNome`); suíte nova `teste-fio-um-so` (32).
- **o defeito (sessão 5, defeito 4):** "O rasto de Edric" em 0/2 depois de dez respostas com o Edric, a espinha com "Encontrar
  Edric" fechado no mesmo turno. Duas causas: o conferente só pergunta a etapa atual (o Osric, que nunca disse o nome), e a
  etapa e o marco perguntam o mesmo fato com moradas diferentes ("A Ponte Lenta" × "…, em Rio Profundo", o herói "nos arredores
  de Casa da Fonte").
- **o que muda:** (a) o caminho salta-se — uma etapa de caminho (`ETAPAS_DE_CAMINHO`: falar_com, ir_a, revelar) não segura uma
  etapa de caminho adiante que já se cumpriu; a saltada fica `feito`+`pulada` (campo novo, só aditivo); derrotar/achar/levar
  nunca se saltam nem saltam; (b) o marco que a espinha já fechou cumpre a etapa das missões da história com o mesmo tipo e o
  mesmo alvo (e o mesmo lugar, se o primeiro nome é o que casa) — lido de `mundo.espinha`; (c) o alvo da abertura no lugar
  dele deixa de ser "só um nome".
- **números:** a sessão reconstruída — 0/2 → **2/2** (com a espinha no mundo); mesma cidade, alvo sem a pista: 0/2 → 2/2 já
  sem fiação nenhuma.
- **a fiação que fica para o App (uma linha, `mundoDasMissoes`, ~l. 11011):** acrescentar `espinha: espinhaRef.current,` ao
  objeto devolvido. `conferirAsMissoes` chama `mundoDasMissoes(p)` de novo DEPOIS de gravar a espinha conferida, então a
  missão lê o marco fechado no mesmo turno. Sem esta linha só vale a porta (a); com ela, o caso da sessão fecha. Prova da
  fiação: `teste-fio-um-so` §1 já usa o formato.
- **decisão média:** o salto exige caminho dos DOIS lados — "matar os três antes de chegar não pula a chegada" (teste-missoes
  §3) continua de pé, sem mover asserção.

## 11/10 11:40 · v9.395 · MM, a luta tem saída (`frontend`) · este commit

- **quem:** `frontend`, à mão, com o bastão do `App.jsx` (tomado 10:40, devolvido ao commit). Tocados: `saida-da-luta.js` (novo),
  `combate.js` (`testeDeMorte` aceita o gerador), `legado.js` (o envelope do herdeiro sabe da luta), `painel-batalha.jsx` (a
  frase do fim), `App.jsx`; suítes novas `teste-saida-da-luta` (51), `teste-herdeiro-luta-fechada` (18), `teste-vista-da-luta` (16).
- **o defeito (sessão 5, defeito 1):** o Dragão a 3/29 não tinha em quem bater (`turnoDosInimigos` só mira quem tem PV) e o
  "esperar" girou 18 vezes; o estável voltava a rolar testes (o ramo `estavel` deixava `morrendo` ligado e zerava tudo).
- **item 1:** a luta em que ninguém pode agir acaba — o meu lado todo no chão, o herói morto com o grupo de pé (recuo), ou 3
  rodadas paradas. Quem ficou de pé decide por tabela (cabeça × sangrando, a intenção do Adversário manda primeiro): foge,
  abandona, saqueia, leva prisioneiros, acaba com eles. Fecha por uma porta própria (`fecharSemSaida`), **não** pela da
  vitória (que daria o tesouro do chefe a quem o chefe deixou no chão). A tela do fim ganha o título "Derrota" e a frase.
- **item 2:** "Passar o fio" fecha a luta aberta (`forcar`) antes da herança; o herdeiro chega 12 h depois (tabela), numa
  cena nova, com a frase do fim no envelope; a mesa de batalha sai com o fio.
- **item 3:** a vista da luta entra na pauta (QUEM, o veto, NÃO PODE): quem está de pé e a que distância, quem está no chão
  não age, quem está de pé não sumiu, os golpes que o sistema nomeou. Pauta da luta medida: 1141 → 1365 de 1400.
- **e a fiação do MM19** pedida pelo backend: `linhaDoRumo` recebe `mundo: { aqui, … }` (asserção em `teste-fiacao-prende`).
- **decisões médias:** (a) `terminar`/`acabar_o_ferido` **não** mandam executar — na 1.ª prova viva dois salteadores
  executaram o grupo, porque essas intenções disparam em toda luta perdida; (b) "Derrota" e não "Vocês caíram" (a 2.ª prova
  tinha uma heroína só); (c) as três etapas vão numa versão só: dividem a fiação do `App.jsx` e as tabelas de endereço dos
  varredores, e partir em três commits deixaria dois deles vermelhos.
- **prova viva:** campanha nova no navegador, três lutas perdidas — abate (morte → herdeiro "doze horas depois", luta
  fechada), saque (a bolsa vai, os dados de quem ficou a morrer rolam até ao fim), prisioneiros ("Derrota", acorda com 1 PV
  de mãos atadas, 2 h depois). Só `taverna_save_v1` nasceu e foi apagado com o jogo desmontado; as duas `taverna_cfg_*`
  conferidas iguais ao que estava. Endereços de `acoes-do-jogador` re-medidos pelo diff (133).
- **o que ficou:** o golpe em quem já está no chão (`GOLPE_NO_CAIDO`, queda.js) continua por ligar; a linha do inimigo a
  "CAIU" antes da Fúria/Aparar corrigirem ainda nasce em `linhaParaMestre` — a vista do fim da rodada é que a desmente.


## Os ciclos anteriores

Os 22 ciclos mais antigos estão em `mente/arquivo/diario-antigo.md`,
inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo
ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.
