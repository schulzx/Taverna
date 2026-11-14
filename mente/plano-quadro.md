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
- **Q2b** (backend, pequena, ANTES da Q3): a porta do preço que falta — `avisa_vilao` e `relogio_do_fio` só se aplicam hoje dentro de `oTurnoDasQuests` (`aplicarUm`, quests-do-turno.js); a Q3 precisa de uma função exportada (§11, passo 5).
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
   - **o preço** (`vira.preco.efeitos`): `minutos` → `avancarMinutos(n)` fora da luta (e a linha que ele devolve ao chat); `moedas` → a ficha (`Math.max(0, …)`); `danificado` → a marca no objeto que entra; `incompleta` → nada (a carta e a pauta dizem-no); `avisa_vilao` e `relogio_do_fio` → **a porta da Q2b**, que ainda não existe;
   - **o custo** (`vira.custo`): as moedas saem da ficha, **salvo** `alvo.pago`;
   - **a voz**: `vira.preco.linha` é o carimbo da carta, para a peça da Q4 — não vai ao chat como mecanismo.
6. **O gesto** — em `adjudicarAcao`, na âncora `const v = veredictoDaAcao(acao);` / `if (!v) return false;`: antes do `return false`, `aCartaDoGesto(quadrosAgora(), { frase: acao, quem: <a pessoa chamada, como no pedido sem dado: aPessoaChamada(acao, { conhecidos: [], presentes })>, moedas: (fichaViva() || {}).moedas || 0 }, { ...ondeDoPasso(), emCena: presentes })` → `virarCarta(quadro, g.veredito, { carta: g.carta, caminho: g.caminho, memoria: quadroRef.current, dia: diaRef.current })` → o mesmo passo 5 (o custo cobra-se sempre: `pago` é `false`). O turno segue para o Narrador como antes. O custo já estava dito antes do clique: está no caminho da carta, à vista no quadro (Q4).
7. **A pauta** — `src/pauta.js`, `SECOES`: `{ id: "quadro", rotulo: "O CASO", prio: 2.44, o: "o que o herói já sabe do caso e o que falta, pela forma" }` (depois do rumo 2,42 e do fecho 2,43; antes da planta da masmorra 2,45). Em `aPautaDoTurno`, em `calou`: `const qp = oQuadroNaPauta(osQuadrosDoEstado(…)); p = porNaPauta(p, "quadro", qp.linha); p = porNaPauta(p, "naoPode", qp.naoPode);`. **Medir antes de fixar a prio**, contra `TETO_DA_PAUTA` (1400), no molde de `teste-masmorra-na-pauta` (500 cenas semeadas, com e sem luta): quantas vezes a linha entra, e que secções tira. A linha tem teto de 260 e o veto é uma linha por quadro (≤2) — mas cada veto empurra os outros 0,1. A régua: não tira veto, desfecho, rumo nem fecho; se tirar a planta da masmorra ou o QUEM CARREGA em mais de 1 cena em 20, desce para 2,455.
8. **A prova da Q3**: a `teste-estado` com o campo novo; um turno de prova (o mistério de `teste-quadro-da-quest` §7) com a busca falhada no curral pelo App; `npm run build` e `npm test` verdes.
