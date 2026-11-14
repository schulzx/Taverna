# O quadro da quest — a planta (Fase QQ, 13/11/2026)

Aprovado pela pessoa («pode seguir») na versão que corrige `mente/sessao-19.md` (a proposta ambiciosa): a carta que o caso precisa **nunca se perde**. Fundamento: GUMSHOE (Robin D. Laws — a pista essencial nunca depende do dado) e a «regra das três pistas» (Justin Alexander, *The Alexandrian*). O motor é `src/quadro-da-quest.js`; a prova, `testes/teste-quadro-da-quest.mjs`.

## 1. O modelo

- **Um quadro por quest ativa** (`osQuadrosDoEstado`: as mesmas quests que a pauta vê). A pergunta do caso é a etapa de agora. Sem cartas, sem quadro (a tela esconde-o).
- **Essenciais** saem das condições das etapas: cada átomo de `PISTAS_DO_PASSO` é uma carta — `descobriu` (lugar), `consultou` (pessoa), `tem` (objeto), e `conversou` (pessoa) só quando a etapa tem outra pista (no mistério, sempre). Contagem > 1 é laço, não carta. A biblioteca já escreve as investigações como «pelo menos 2 de 3»: cada um dos três é uma carta.
- **Extra** (`EXTRAS_DO_QUADRO`): a fraqueza do vilão (global: uma só para todos os quadros), o cúmplice (o papel `fio` que não é passo), uma vantagem (`VANTAGENS_DO_CONFRONTO`). Só no tipo 1 e fora do confronto; quantas, pela semente (`QUADRO_POR_ARCO`).
- **Estados**: `costas` (só a forma: «um lugar», «uma pessoa», «um objeto»), `virada` (o facto e de onde veio), `preco` (virada com o carimbo do preço), `perdida` (extra sem caminhos). Marcas: `futura` (etapa por vir, sem caminhos: a silhueta) e `sobra` (a etapa fechou por outras duas).
- **Caminhos**: `CAMINHOS_DA_CARTA` por forma (≥2 sempre; o lugar e o objeto têm ≥2 que não dependem de pessoa nenhuma), cada um com os desafios do catálogo que o viram e o custo dito antes do clique. Todo caminho de uma forma produz o facto da forma, e o livro não mente. As extra investigam (`CAMINHOS_DA_EXTRA`), e nunca dizem o nome do que escondem.

## 2. Quem vira

- **Só o dado do sistema** (`VEREDITO_DO_SISTEMA`: o desafio, o resultado e `total`/`dc`). A prosa não é veredito: `virarCarta` devolve `null`.
- **Essencial — sucesso:** vira limpa. **Falha:** vira com um preço de `PRECO_DA_FALHA`, escolhido pela semente (por pouco, ≤ `QUADRO_DA_QUEST.porPouco`: só os leves); no mistério, os números ×`peso`. Nos dois casos devolve `escreve` (o facto, pela `PORTA_DA_CARTA`) e, no lugar, o `achado` pronto para `oLivroDoAchado`.
- **Extra — sucesso:** vira, e o `ganho` vai a `quadro.ganhos`. **Falha:** queima o caminho (a régua do `jaTentou`: a mesma coisa do mesmo jeito não se repete); sem caminhos, perde-se.
- **O `jaTentou` e a essencial não brigam:** a falha já vira a carta, logo não há segunda tentativa a bloquear. Para a extra, o `jaTentou` e o caminho queimado dizem a mesma coisa.

## 3. A tabela do preço

| id | formas | leve | efeitos (×2 no mistério) | porta |
|---|---|---|---|---|
| tempo | lugar, pessoa, objeto | sim | minutos 120 | tempo-do-turno |
| incompleta | as três | sim | incompleta + minutos 30 | só a carta e a pauta |
| alerta | lugar, pessoa | não | avisa_vilao + relogio_do_fio 1 | quests-do-turno (EFEITOS_DA_QUEST) |
| cobra | pessoa | não | moedas −15 | idem |
| danificado | objeto | não | danificado | aplicar (a marca no item) |

## 4. Como o passo anda

O passo anda **só** pelo facto que a carta escreve no livro (o mesmo átomo que a etapa julga). A essencial virada por outra porta (o Cronista, a busca do passo) vê-se pelo próprio livro, sem memória.

## 5. O save

`estado.quadro` = `{ v: 1, cartas: { "<quest>|<carta>": { dia, como, caminho, preco?, queimados? } } }` — **campo novo, aditivo, ignorado pela versão antiga** (`garantirQuadro` limpa-o; teto 64, sai a mais velha). Guarda só o que o livro não sabe: como virou e os caminhos queimados.

## 6. A pauta

Pela **pauta dinâmica**, nunca bloco estático (o teto é sagrado). `oQuadroNaPauta(quadros)` → `{ linha, naoPode }`: o que já se sabe (até 3 faces por quadro, «pela metade» na incompleta) e o que falta pela forma, com teto de 260; o veto «não revelar o que está por saber» vai para o NÃO PODE. Proposta: uma secção `quadro` com prio 2,44 (junto do RUMO e do FECHO), a decidir na fiação contra a medida do teto.

## 7. O que pede ao App (o `oficial`)

1. **O resolver do teste** (`concluirRolagem`): com `osQuadrosDoEstado`, achar a carta e o caminho do teste (o lugar onde se busca, a pessoa com quem se fala) e chamar `virarCarta`; aplicar `escreve` pela porta, o `preco.efeitos` e o `custo`; guardar `memoria` em `estado.quadro`. Tudo em `calou(...)`.
2. **Save e load** de `estado.quadro` (ref no save, `garantirQuadro` no load).
3. **A pauta**: `oQuadroNaPauta` numa secção dinâmica, com o veto.

## 8. O que pede ao `desenho` (a peça)

A carta (costas pela forma, virada com face e origem, o carimbo do preço, a perdida riscada), o quadro (a pergunta e as cartas, as futuras em silhueta), e o momento de virar (som, peso, o nome de onde veio). Antes do clique: os caminhos e, na essencial, o preço possível (`seFalhar`). Nenhum nome de mecanismo na tela.

## 9. As etapas

- **Q1** (feita): o módulo puro, as tabelas, a suíte, este plano.
- **Q2** (backend, feita 14/11): `aCartaDoTeste(quadros, veredito, onde)` — que carta e que caminho um teste do sistema vira (o lugar, a pessoa, o desafio), provado sobre o catálogo; e `aCartaDoGesto`, o irmão sem dado (§10).
- **Q2b** (backend, feita 14/11): a porta do preço (`aplicarPrecoDoQuadro`, pelas portas do fim do turno: `aplicarEfeitosNoEstado`), e o que a tela pede (formas.md §QQ 8, 1–5): o sinal, a perícia e os minutos dos caminhos, os números do preço no arco, `aCartaEmJogo` antes do dado, e a carta para a tela (§12).
- **Q3** (oficial): a fiação defensiva da §7; a entrada sai da lista de espera da `teste-ligacao`.
- **Q4** (desenho + jogo + aprendiz): a peça da §8, no Figma primeiro.
- **Q5** (backend): o `ganho` das extra no confronto (o número, na tabela da luta) e a fraqueza conhecida na pauta do confronto.
- **Q6**: a prova jogada (uma sessão de mistério; a régua: ninguém preso por azar, e quantas cartas viram por sessão).

## 10. A Q2 — o juiz do teste (feita, 14/11)

**`aCartaDoTeste(quadros, veredito, onde)` → `{ quest, carta, caminho, veredito, pago } | null`.** Um teste só vira a carta cujo caminho bate com ele nas três coisas (`CARTA_DO_TESTE`):

- **o desafio** é um dos do caminho (o `id` do catálogo; sem ele, a perícia, por `desafioPorPericia`);
- **o sítio** da âncora é onde o herói está — o lugar da carta (`revistar`) e o sítio onde o objeto se guarda (`procurar`) pela régua do passo (`noLugarDoPasso`: o sítio ou o prédio, e a mesma cidade); `cidade` quer uma cidade, e a da carta se ela a tem;
- **a pessoa** da âncora é o `quem` do veredito; sem `quem`, está em `onde.emCena`. Menção não é presença;
- **as âncoras abertas** (`cidade`, `nenhuma`: perguntar, pagar, lembrar, negociar, tirar, e todas as das extra) batem em qualquer sítio — por isso pedem que a frase (ou o `sobre` do catálogo) **nomeie** a coisa da carta; nas extra, o vilão (nome, título, a gente do fio). Sem isto, todo regatear na praça viraria a carta de um lugar.

**A escolha, determinística:** a essencial (da etapa de agora: só ela é `viravel`) antes da extra → o caminho mais preciso (âncora `lugar`/`pessoa`/`nasce` antes das abertas) → com moedas pagas no teste, o `pagar` → entre extra, a que a frase pede (`ASSUNTO_DA_EXTRA`) → a ordem da tabela (o quadro, a carta, o caminho). Nada de sorte.

**O resto:** o caminho queimado já não está na carta (o quadro traz a memória), logo não volta a contar; a carta virada não é `viravel`. O `pagar` só bate num teste em que o herói pagou (`social.custoEmMoedas > 0`), e então `pago: true` — o custo já saiu pela conta social. O veredito volta na forma de `virarCarta`, e é ela que decide: falha por pouco ou seca na essencial (o preço), a queima na extra. Para isto cada carta leva um `juiz` (o nome de verdade, a cidade, onde o objeto nasce) — **bastidor, nunca para a tela**.

**Os caminhos que não são teste:**

| caminho | quem já o cobre | |
|---|---|---|
| ir ao sítio | o livro (`esteve`, a porta da cena) | não é carta: é o átomo do passo. A carta `descobriu` não vira só por ir — pede revistar, perguntar, pagar ou lembrar (ou a busca do MC5, que escreve `descobriu`, e a carta vê-o pelo livro) |
| falar com quem sabe (`conversou`) | o livro (o Cronista escreve «falou») | coberto pela Q1, sem função nova |
| arrancar o que sabe (`consultou`) | `registrarConsulta`, quando o social passa com informante | o sucesso já está coberto; a falha é a Q2 (âncora pessoa) |
| ter o objeto (`tem`) | a bolsa | coberto: compra no mercado, saque, presente |
| **pagar a quem sabe, sem dado** | ninguém — «a mão que paga não erra» (`naoPedeDado`) e o teste nunca nascia | **`aCartaDoGesto`** (feita) |
| **comprar o objeto a quem o tem** | ninguém, se o mercado não o vende (o da quest quase nunca) | **`aCartaDoGesto`** (`comprar` → `negociar`) |

**`aCartaDoGesto(quadros, { frase, quem, moedas }, onde)`** → a mesma forma, com `gesto` (`GESTOS_DA_CARTA`: o gesto na frase, e os caminhos com custo que percorre). As âncoras e o assunto são os do teste; a bolsa tem de cobrir o custo. O veredito é o sucesso do sistema com o custo como número a bater (`total = dc = custo`), e `pago: false` — o `custo` de `virarCarta` cobra-se agora.

## 11. A receita da Q3 (o `oficial`, com o bastão)

Tudo em `calou(...)`: um órgão que estoura não custa o turno. Ler o `App.jsx` por âncora (as linhas são de 14/11 e andam).

1. **O import** (junto do de `./a-quest-manda.js`): `osQuadrosDoEstado, virarCarta, aCartaDoTeste, aCartaDoGesto, garantirQuadro, oQuadroNaPauta` de `./quadro-da-quest.js`. Na mesma leva, **tirar a entrada `quadro-da-quest.js` do `AGUARDANDO`** de `testes/teste-ligacao.mjs`.
2. **O save** — campo novo, aditivo, que a versão antiga ignora:
   - `const quadroRef = useRef(garantirQuadro(null));` ao lado de `const factosRef = useRef(garantirFactos(null));`;
   - `src/estado.js`, `CAMPOS`: `C("quadro", "memoria", "qualquer")` logo depois de `C("factos", …)` (a `teste-estado` lê o literal do retrato e falha se um nascer sem o outro);
   - `retratoDoJogo`: `quadro: quadroRef.current`, na ordem de `CAMPOS`;
   - o load (a linha do `try { factosRef.current = garantirFactos(sv.factos); }`): `try { quadroRef.current = garantirQuadro(sv.quadro); } catch (e) { calou("o quadro do save", e); quadroRef.current = garantirQuadro(null); }`;
   - a campanha nova (`if (!cap) factosRef.current = garantirFactos(null);`): o mesmo para `quadroRef`;
   - `src/motor/pauta-do-turno.js`, a tabela dos refs (ao lado de `espinha:`): `quadro: Object.freeze({ ref: "quadroRef", salvo: true, escreve: false, padrao: () => (garantirQuadro(null)) })`.
3. **Os ajudantes** (ao lado de `passosDasQuestsAgora`): `quadrosAgora()` = `osQuadrosDoEstado({ …o mesmo estado de passosDasQuestsAgora, quadro: quadroRef.current }, { mundo: mundoDaBase() })`, em `calou`, `[]` no erro; e `presentesAgora()` = os nomes de `elencoDaCena(npcsRef.current, cidadeAtualRef.current, mapaRef.current, { comGrupo: [] }).aqui` (a conta que o pedido sem dado já faz).
4. **O teste** — em `concluirRolagem`, ramo `r.origem === "pedido"`, **logo depois** de `escreverODescobriu(…)` (a âncora: `const facto = passou && des ? factoDoSucessoAgora(`):

   ```js
   try {
     const qs = des ? quadrosAgora() : [];
     const alvo = aCartaDoTeste(qs, { ...des, passou, total, dc, frase: r.frase || r.motivo || "" }, { ...ondeDoPasso(), emCena: presentesAgora() });
     const quadro = alvo && qs.find((q) => q.quest === alvo.quest);
     const vira = quadro && virarCarta(quadro, alvo.veredito, { carta: alvo.carta, caminho: alvo.caminho, memoria: quadroRef.current, dia: diaRef.current });
     if (vira) { quadroRef.current = vira.memoria; /* o passo 5 */ }
   } catch (e) { calou("Q3 · a carta do teste", e); }
   ```

   **`passou`, e não `bateu`:** o «sim, pago» do catálogo (`custo.porPouco`) já cobrou o preço dele; a carta vira limpa e não cobra outro. Um preço só por dado. A falha que o catálogo não paga (os sociais, a falha seca) cai no `virarCarta`, que dá o preço leve ou o pesado pela margem.
5. **O que a carta virada faz** (`vira`):
   - **o facto**, por `PORTA_DA_CARTA[vira.escreve.predicado]` — `descobriu`: `escreverODescobriu(vira.achado)`, **salvo** se o MC5 acima já escreveu o achado do mesmo `quest`/`etapa` (`facto.achado`); `conversou`: `anotarOLivro` (motor/livro-do-turno.js) com `falouCom`; `consultou`: `registrarConsulta(npcsRef.current, nome)` + `setNpcs`, salvo se a `consultaDeInformante` deste teste já o fez; `tem`: o objeto na bolsa pela porta do `aplicar`. **O nome para a porta é o do registo** (`vira.escreve.id`, ou `carta.juiz.nome`), nunca `escreve.nome`, que pode ser a alcunha de quem ainda não se viu;
   - **o preço e o custo, de uma vez** (Q2b): `const pr = aplicarPrecoDoQuadro(estadoDasQuests(), vira.preco, { custo: vira.custo, pago: !!alvo.pago, objeto: <o item que entra, no `tem`> });` → `aplicarAsQuests(pr, "Q3 · o preço")` (a forma é a de `oTurnoDasQuests`: o vilão avisado vai a `saberRef`, o relógio dele a `espinhaRef`, as moedas e o custo à ficha); depois `pr.minutos` → `avancarMinutos(pr.minutos)` fora da luta (e a linha que ele devolve ao chat); `pr.objeto` é o item a pôr na bolsa, já com a marca; `pr.incompleta` → nada (a carta e a pauta dizem-no). Importar também `aplicarPrecoDoQuadro` e `aCartaEmJogo`;
   - **a voz**: `vira.preco.linha` é o carimbo da carta, para a peça da Q4 — não vai ao chat como mecanismo.
6. **O gesto** — em `adjudicarAcao`, na âncora `const v = veredictoDaAcao(acao);` / `if (!v) return false;`: antes do `return false`, `aCartaDoGesto(quadrosAgora(), { frase: acao, quem: <a pessoa chamada, como no pedido sem dado: aPessoaChamada(acao, { conhecidos: [], presentes })>, moedas: (fichaViva() || {}).moedas || 0 }, { ...ondeDoPasso(), emCena: presentes })` → `virarCarta(quadro, g.veredito, { carta: g.carta, caminho: g.caminho, memoria: quadroRef.current, dia: diaRef.current })` → o mesmo passo 5 (o custo cobra-se sempre: `pago` é `false`). O turno segue para o Narrador como antes. O custo já estava dito antes do clique: está no caminho da carta, à vista no quadro (Q4).
7. **A pauta** — `src/pauta.js`, `SECOES`: `{ id: "quadro", rotulo: "O CASO", prio: 2.44, o: "o que o herói já sabe do caso e o que falta, pela forma" }` (depois do rumo 2,42 e do fecho 2,43; antes da planta da masmorra 2,45). Em `aPautaDoTurno`, em `calou`: `const qp = oQuadroNaPauta(osQuadrosDoEstado(…)); p = porNaPauta(p, "quadro", qp.linha); p = porNaPauta(p, "naoPode", qp.naoPode);`. **Medir antes de fixar a prio**, contra `TETO_DA_PAUTA` (1400), no molde de `teste-masmorra-na-pauta` (500 cenas semeadas, com e sem luta): quantas vezes a linha entra, e que secções tira. A linha tem teto de 260 e o veto é uma linha por quadro (≤2) — mas cada veto empurra os outros 0,1. A régua: não tira veto, desfecho, rumo nem fecho; se tirar a planta da masmorra ou o QUEM CARREGA em mais de 1 cena em 20, desce para 2,455.
8. **A prova da Q3**: a `teste-estado` com o campo novo; um turno de prova (o mistério de `teste-quadro-da-quest` §7) com a busca falhada no curral pelo App; `npm run build` e `npm test` verdes.

## 12. A Q2b — o que a tela pede, e o contrato da carta (feita, 14/11)

**O preço faz o que diz.** `aplicarPrecoDoQuadro(estado, preco, { custo, pago, objeto, arco })` → `{ estado, efeitos: [], notas: [], linhas: [], minutos, incompleta, danificado, objeto?, aplicados } | null`. `estado` traz só os campos que mudaram (`personagem`, `saber`, `espinha`) — a forma de `oTurnoDasQuests`, que `aplicarAsQuests` já aplica. Os efeitos de `QUESTS_DO_TURNO.semQuest` (`moedas`, `avisa_vilao`, `relogio_do_fio`) entram por `aplicarEfeitosNoEstado` (motor/quests-do-turno.js), as **mesmas** portas que `aplicarUm` usa no fim do turno (`comMoedas`, `avisarOVilao`, `adiantarOFio`: o comportamento de `oTurnoDasQuests` não mudou — teste-bq7-motor, 137 verdes). Os de `EFEITOS_DO_PRECO` voltam pelo campo `devolve`: `minutos` (somados, para `avancarMinutos` — o dia que vira é porta do App), `incompleta`, `danificado` (com `objeto`, o item volta com o campo `danificado: true`, novo e aditivo). O custo do caminho cobra-se **salvo** `pago`.

**Antes do dado.** `aCartaEmJogo(quadros, pedido, onde)` → `{ quest, carta, caminho, pago, tipo, forma, costas, seFalhar, restam? } | null` — o pedido do catálogo sem resultado. A carta e o caminho são os que `aCartaDoTeste` dará depois, com sucesso ou falha (o miolo é o mesmo, `oAlvoDoTeste`; provado nos 139 casos do catálogo). Para o leque na bandeja e o «se falhar» do chamado (formas.md §QQ 8, 5).

**Os campos novos do quadro** (nada no save): `quadro.sinal = { sabe, de }` (as essenciais viradas ou com preço, de quantas há sem futuras nem sobras; as extra não entram); em cada caminho `pericias` (os ids, sem repetir) e `minutos` (o menor dos desafios, de `DESAFIOS`); na carta `efeitos` (os do preço, × peso; `null` sem preço); `seFalhar: [{ id, leve, efeitos }]` com os números do arco (era `[id]`). `oSinalDosQuadros(quadros)` → `{ sabe, de }` somado.

**O contrato com a peça (`painel-quadro.jsx`).** A tela lê **só** isto — lista branca; o `juiz`, o `escreve`, a `chave`, o id da `etapa`, os `desafios` e o `ganho` nunca passam:

```
oQuadroNaTela(quadro) → null | {
  quest,          // o id (chave de React; não se mostra)
  tipo,           // Q4: 1 | 2 (TIPOS_DE_QUEST: o enredo do lugar, o que acompanha o herói); null fora da tabela
  titulo, pergunta,
  misterio,       // boolean: o arco pesa mais (o momento demora-se, §QQ 4)
  sinal: { sabe, de },
  cartas: [aCartaNaTela] }

aCartaNaTela(carta) → null | {
  id,             // estável: o mesmo de vira.carta.id (o momento acha a carta por ele)
  tipo,           // "essencial" | "extra" (o metal, o lacre; nunca texto)
  forma,          // "lugar" | "pessoa" | "objeto" (o glifo)
  costas,         // «um lugar», «uma pessoa», «um objeto»
  estado,         // "costas" | "virada" | "preco" | "perdida"
  viravel, futura, sobra,   // booleanos (o aro âmbar, a silhueta, «não fez falta»)
  etapa,          // Q4: chave OPACA ("e1mi0bsb") — só agrupa as cartas da mesma etapa; null na extra
  dia,            // Q4: inteiro, o dia de jogo em que virou (virada/preco); null de costas, perdida ou sem registo
  sobre,          // Q4: do que a extra trata («o que pode derrubar quem manda o convite»); "" na essencial
  face, de,       // "" de costas; virada, o facto e de onde veio (já com o nome visto)
  preco,          // null | "tempo" | "incompleta" | "alerta" | "cobra" | "danificado"
  linha,          // a frase da carta lida, "" sem preço
  efeitos,        // null | [{ tipo, n? }] — a conta do carimbo, já × peso
  caminhos: [{
    id, diz,      // diz: o caminho em mundo, para escrever no campo
    pericias,     // ["percepcao", "investigacao"]
    minutos,      // inteiro
    custa?,       // { moedas }
    seFalhar: [{ id, leve, efeitos }] }] }   // [] na extra
```

`face`, `de` e `diz` já escondem o nome de quem o herói não viu (a alcunha); provado nas 153 cartas do catálogo em que o juiz sabe outro nome.

**Os quatro campos da Q4 (14/11, o pedido do `aprendiz`)** — aditivos, nada no save (a memória guarda os mesmos campos; provado em teste-quadro-da-quest §14):

- **`etapa`**: um resumo (`hashSemente`) da quest e do id da etapa, em base 36 com um `e` à frente. Agrupa, e só: não contém o id da etapa nem o da quest, não diz a ordem, e é estável — a mesma etapa dá a mesma chave em todos os arcos, sementes e turnos, mesmo quando uma reviravolta abre outra antes dela (78 etapas do catálogo, 2949 pares). Resolve a gaveta do mistério: a carta virada de uma etapa feita já não cai em «agora». A **ordem** das etapas é a ordem das cartas no quadro (o motor dá-as etapa a etapa: feitas, a de agora, as por vir).
- **`sobre`** (só a extra): `SOBRE_DA_EXTRA[tipo]` com `{vilao}` — o papel do vilão na quest (o nome se o herói o viu frente a frente, a alcunha se não); sem papel, o nome do fio só depois de visto (`conheceu` pela mesma régua das condições); senão `SOBRE_DA_EXTRA.semNome`. O nome de verdade e o título do vilão nunca passam antes de ele se mostrar (provado no mundo de mistério de §13, antes e depois de visto). O `{vilao}` é sempre objeto direto — as alcunhas começam por artigo, e «chegar a o que…» não se escreve.
- **`dia`** (virada ou com preço): a memória do quadro (`estado.quadro`, virou pelo dado; `virarCarta` já o devolve em `carta.dia`, para o momento); sem ela, o facto do livro que a virou (`DIA_DA_CARTA`: `descobriu.dia` do lugar, `falou.de` da pessoa — o primeiro dia em que falaram); o que o livro não data (a consulta, o objeto na bolsa) cai no dia em que a etapa ficou feita; sem nada disso, `null`. **Para a tela:** `arrumarOQuadro` só ordena o fio pelo dia quando *todas* as viradas o têm — com uma `null` (raro: uma consulta na etapa de agora) cai na ordem do quadro, que é a das etapas.
- **`tipo`** no quadro de tela: o da quest, validado contra `TIPOS_DE_QUEST`.

## 13. Os três acertos da Q3 (backend, 14/11 — achados pelo `oficial` ao ligar o quadro)

- **A face da extra.** `virarCarta` devolvia a extra virada com `face: ""` (o momento dizia só «Sabes agora.»; o App contornava relendo o quadro). Agora a extra leva `revela` (bastidor, como o `juiz`: a lista branca de `aCartaNaTela` não o deixa passar), e `virarCarta` enche com ele a `face` e o `de` — os mesmos que o quadro seguinte mostra (provado nas 333 extra do catálogo). O cúmplice diz-se pelo **nome visto** (a alcunha antes de o herói o ver), também no quadro: antes a face dele usava o nome do registo.
- **Pagar a menos** (`PAGAR_A_MENOS`). `aCartaDoGesto` aceita `gesto.pago` — as moedas que a frase já deu (a proposta cobrou-as). Com ele manda o que se deu, não a bolsa, e `pago: true`. Deu menos do que o caminho pede: a **essencial** vira na falha com o preço `incompleta` (`veredito.preco`; `total` = o que deu, `dc` = o custo; `virarCarta` honra o preço e devolve `custo` = o que se deu) — ninguém fica preso numa carta que o caso pede por ter contado mal as moedas; a **extra** não é candidata (bónus só se ganha inteiro) e o caminho não se queima (não houve falha). Sem `pago`, a bolsa curta continua a não virar nada: ninguém paga o que não tem.
- **O sinal só com extras** (`SINAL_DO_QUADRO`). Sem nenhuma essencial à vista (217 dos 428 quadros do catálogo de prova na jornada e no mistério: a etapa de agora sem pistas, as de antes sobras), o sinal conta as extra ainda vivas (costas, virada); a perdida sai da conta. Com uma essencial à vista, as extra continuam fora do número — §QQ 3 inteiro («um 3 de 7 que nunca chega a 7»). Escolheu-se «só quando não há essenciais» e não «sempre» por isso mesmo: somar sempre as extra quebrava a promessa que §QQ 3 escreveu. Os 56 quadros que ficam com `de = 0` só têm cartas por vir ou sobras: nada que se alcance agora, e o silêncio é verdade.

**O que pede ao App** (não editado): em `aCartaDoGestoAgora`, passar `pago` no gesto — `aCartaDoGesto(qs, { frase, quem: …, moedas: … + pago, pago }, …)` — e tirar a guarda provisória `(pago > 0 && pago < g.veredito.total)` (com o `pago`, o motor já devolve o veredito certo; `aplicarACartaVirada(vira, quadro, { pago: g.pago })`). `mostrarAPista` pode voltar a ler `vira.carta` direto. A asserção de `teste-quadro-fiacao` §4 que lê a guarda muda com ela.
