# A biblioteca de quests — a planta da fase (BQ)

*O conselheiro, 08/11/2026, a partir da ideia que a pessoa trouxe nesse dia. Documento de
referência da Fase BQ em `mente/pauta.md`. Não tem código de produção.*

> **A ideia, numa frase.** O esqueleto da história deixa de sortear marcos soltos
> («Encontrar X», «O que Y esconde», «Acabar com Z») e passa a **escolher e ligar quests
> já desenhadas**: cada uma com etapas, soluções, consequências, reviravoltas e falha.
> Só o elenco, o vilão e os lugares saem da criação do mundo. Cada etapa fecha por um
> **predicado sobre factos que o sistema guarda**, e o sistema sabe sempre em que etapa
> está a quest e o que falta para a fechar. **O vilão é o fio** (§11): o esqueleto
> escolhe primeiro o plano dele, e cada quest física é um passo dele ou um passo contra
> ele.

Referências: a *Grande Lista de Enredos* do Dungeon Geek 21 (34 enredos, sem categorias,
cada um com reviravoltas; as três dicas finais «Dobre», «Surpreenda», «Dobre, parte dois»).
E o Matt Mercer: a régua da Fase MM, *a resposta é verdade?*

---

## As decisões da pessoa (08/11/2026) — valem sobre o resto desta planta

1. **A espinha dos mundos novos:** a biblioteca e o plano do vilão **substituem** o sorteio
   dos três verbos. O menu das quatro espinhas fica, como o tom. As campanhas em curso ficam
   como estão (a BQ2 só as destrava, não lhes muda a história).
2. **O vilão nasce na criação do mundo**, pela semente e pelo antecedente do herói. O lado
   «espelho» passa às reações: ele adapta-se ao que o herói faz.
3. **O pacto existe:** é o quarto desfecho do confronto (além de derrota, redenção, fuga).
4. **O companheiro pode sair ou morrer numa quest do coração — como consequência, nunca
   como condição.** Nas palavras dela: *«pode ter maneiras de sair vivo quanto maneiras de
   sair morto, no melhor desfecho fica tudo bem e no pior ele morre».* Logo, cada quest do
   tipo 2 declara um leque de desfechos, do melhor (tudo bem) ao pior (a morte), e cada um
   se alcança pelo que o herói fez (factos no livro); nenhuma quest tem a morte como passo
   obrigatório, e nenhum desfecho mau se sorteia sem causa no jogo. A morte de um companheiro
   é irreversível e mostra o veredito antes do clique onde houver clique (a lei da casa).
5. **O acervo não espera aprovação** (corrigido pela pessoa, 08/11): *«quero ler, mas não precisa
   aguardar minha aprovação, confio em você para criar quests maravilhosas, provocantes e intensas,
   quero ler apenas pra ciência, você tem minha aprovação imediata».* Cada lote escrito vai a ela para
   leitura, e o trabalho segue sem parar. A régua da voz: maravilhosas, provocantes, intensas.

---

## 1. O censo

### O que existe e serve (a fundação já está quase toda feita)

| peça | onde | o que dá à BQ |
|---|---|---|
| **10 tipos de etapa com `ver()`** | `missoes.js` `ETAPAS` | já são predicados: `ir_a`, `derrotar`, `achar`, `falar_com`, `levar_a`, `resgatar` (com `falha`), `revelar`, `concluir_masmorra`, `aguentar`, `vencer_relogio` |
| **o conferente** | `missoes.js` `conferir` | etapa atual, avanços, concluídas, falhadas, a etapa saltada «por caminho», `feitoEm` |
| **onde se faz o passo** | `distanciaDoPasso`, `rumoDaEtapa`, `motor/a-pessoa-do-passo.js`, `a-pista-como-cartao.js` | «o que falta» já tem casa na tela e na voz |
| **só pelo facto** | `saga.js` `fatosQueFecham` → `mundo.soPeloFato` | a regra já existe: certas pessoas e lugares fecham pelo facto, não pela presença |
| **os moldes da secundária** | `secundaria-planeada.js` (9 moldes) | **a semente da BQ**: papéis (`A`, `B`, `sitio`), atos, reviravolta com `apos`, prazo, fecho que muda o mundo. Zero campo de save |
| **o tipo 2 em embrião** | `subtramas.js` + `nucleo.js` | por pessoa do núcleo, três batidas (pedido, crise, escolha) com relógio, dois lados e a omissão. Os 6 papéis do núcleo (`companheiro`, `vilao`, `elo`, `voz`, `balanca`, `porta`) são papéis prontos |
| **factos por pessoa** | `npcs.js` | `relacao`, `laco {tipo, forca 1–3, rompido}`, `entre`, `consultas`, `status`, `conhecidoEm` |
| **afeição do companheiro** | `vinculos.js` | 0–100, quatro marcos (25 Confiança · 50 Amizade · 75 Lealdade · 100 Vínculo Profundo) |
| **factos do mundo** | `mundo-base.js` | `base.mortos`, `base.revelados`, `base.concluidas`, `base.situacoes` (livre, cativa, ferida, morta) |
| **o Cronista por turno** | `motor/cronista-do-turno.js` | `pessoas`, `falou_com`, `promessas`, `combate.mortes_narradas` |
| **o canal ao Narrador** | `pauta.js` | `SECOES` com prioridade, `TETO_DA_PAUTA = 1400`; `momento` (3, frente 2,475), `coracao` (2,46), `rumo` (2,42) |
| **reviravoltas e viradas** | `reviravoltas.js` (7 formas), `tramas.js` (4 viradas executadas pelo código) | o gatilho e o efeito já existem para «o aliado é agente do vilão» |

### O que existe e é vago

- **A espinha é uma roleta de três verbos** (`estenderEspinha`): `procurar`, `descobrir`,
  `enfrentar`, com «nunca dois iguais seguidos», mais o `confronto` no fim. Um marco não
  tem *porquê*, nem alternativa, nem consequência que dependa de **como** se cumpriu.
- **As `ESTRUTURAS` e os 8 episódios** guardam instruções em prosa para o Narrador
  («Estabeleça…», «Ponha na mesa duas perdas…»). O código não as consegue conferir. O
  episódio avança pelo tempo (`DIAS_ENTRE_MARCOS = 3`, `cenaResolvida`) e não pelo facto.
- **Cada etapa tem uma condição só.** Não há «OU» (falar com o informante **ou** arrombar
  o arquivo), nem «E em qualquer ordem» (duas de três pistas), nem uma solução que
  mude o que vem a seguir.
- **A falha** só existe pelo prazo e pela morte no `resgatar`.

### O que falta

1. **O facto persistente de conversa.** `falouCom` vive **um turno**: o App põe-no no
   mundo só na conferência que o Cronista dispara, e apaga-o logo a seguir. Nenhuma
   ficha guarda «já falámos, tantas vezes, desde o dia N».
2. **O facto persistente de encontro.** `conhecidoEm` grava-se quando o Cronista regista
   o nome, **e isso inclui quem foi só nomeado** (o próprio `missoes.js` o diz, no MM14).
   «Vimo-nos frente a frente» não existe.
3. **A identidade.** As etapas guardam **nomes** e comparam-nos **na hora de ler**
   (`norm`, `mesmaPessoa`, `includes`). É daqui que vêm metade das falhas abaixo.
4. **A afeição de quem não é companheiro, graduada e movida por factos.** O `laco.forca`
   só sobe no clímax de uma onda do compasso, e ajudar alguém não o move.
5. **Derrotar sem matar.** Os rendidos e os desacordados ficam em `derrotadosDaSessao`,
   que não vai para o save. Poupar alguém não deixa facto.
6. **Ainda não existem:** o predicado combinado (e, ou, não, pelo menos N), a ligação
   entre quests (um papel partilhado), o tipo 2 como quest de campanha, e a escolha
   registada como facto.
7. **Coisas que não achei:** a promessa do **herói** a uma pessoa (o `prometido.js` guarda
   as promessas do Narrador, não as do herói; o `cobrador.js` guarda moedas); e a entrega
   de um item a uma pessoa que não é do grupo. Não verifiquei se a bolsa-da-frase regista
   a quem se deu um item.

### As falhas de fecho, contadas

Contei **17 casos documentados**, nos comentários de `missoes.js`/`saga.js`, nos relatórios
de sessão (`mm11-sessao-2…8`, `sessao-13`, `16`, `17`) e no diário antigo. A conta não é
exaustiva. Dividem-se em duas famílias e quatro causas.

**Não fecha nunca (11 casos):** «Marl de Osso» (v9.195, nome exato); todos os marcos
`descobrir` (MM13: nome do lugar contra id `Cidade|tipo`); Inocência e Noé (4.ª sessão: o
herói estava fora do lugar da ficha, e o Noé ficou no cânone em vez do registo); «Encontrar
Elmo» (6.ª: a cidade de um lugar inventado); Osric «sem cara» (diário antigo); «O rasto de
Edric» (5.ª: o marco caiu e a missão ficou em 0/2); **«Encontrar Corrado»** (13.ª: o molde
do Cronista não tinha a chave `falou_com`, e a heroína falou com ele do T2 ao T5); o Largo do
Cardo (16.ª: o `revelar` com a porta da prosa fechada no modo ator); o 2.º passo da 17.ª
(20 turnos: a pessoa saiu de cena); o `ir_a` para um lugar (v9.117); o marco de entrega
impossível (retirado da espinha).

**Fecha cedo ou em falso (6 casos):** a Delfina no turno 5 (MM14, só nomeada); «O que o
Campo das Mães esconde» no turno 4 (dito de longe); Dário e o Fogão na porta (6.ª); o
`resgatar` que fechava ao chegar (v9.128); a quimera qualquer no lugar do chefe sem nome; a
chegada inferida a Sul Molhado (7.ª).

**As quatro causas:**
- **(a)** o nome é a chave e compara-se na hora de ler: 7 casos;
- **(b)** o facto dura um turno, ou depende de um canal que pode faltar (`falouCom`,
  `segredosRevelados`, os derrotados da sessão): 5;
- **(c)** a presença serve de prova do facto: 4;
- **(d)** o mundo não consegue produzir a condição: 2.

Cada remendo consertou um caso, e a classe ficou. A BQ ataca a classe: **resolver o nome
para id uma vez, quando o facto se escreve; guardar o facto; ler só factos**.

---

## 2. A ficha de uma quest

Uma quest é **dado**, nunca função. É isso que deixa a suíte lê-la de volta: provar que
cada predicado existe, que cada papel está declarado e que a quest se consegue concluir.
Os textos são modelos com `{papel}`.

```js
{
  id: "o_salvo_conduto",
  tipo: 1,                         // 1: o enredo do lugar · 2: o que acompanha o herói
  enredo: 10,                      // o número na Grande Lista (Serviço de escolta)
  quando: ["cedo", "meio"],        // em que ato o esqueleto a pode pôr
  afim: ["jornada", "reinado"],    // espinhas que a preferem (desempate, não exclusão)
  papeis: {                        // o que a criação do mundo preenche
    protegido: { de: "elenco", exige: ["vivo", "nao_e:vilao"] },
    origem:    { de: "cidade", e: "a do ato" },
    destino:   { de: "cidade", distancia: [2, 4] },          // dias de estrada
    passo:     { de: "lugar", entre: ["origem", "destino"] },
    tenente:   { de: "fio", papel: "tenente" },              // a mão do vilão da espinha
  },
  mao: { tipo: "tenente", contra: [1, 2] },   // a mão do vilão nesta quest (§11.3)
  pede: [],                        // premissas que outra quest tem de deixar
  deixa: ["aliado:protegido", "inimigo:tenente"],            // o que fica para as seguintes
  gancho: "{protegido} tem de chegar a {destino} vivo…",
  etapas: [
    { id: "aceitar", texto: "Ouvir {protegido}", conclui: ["conversou", "protegido"] },
    { id: "estrada", texto: "Sair de {origem} com {protegido}",
      conclui: ["e", ["acompanha", "protegido"], ["nao", ["esta_em", "origem"]]] },
    { id: "passo", texto: "Passar {passo}", conclui: ["ou",
        ["derrotou", "tenente"],                              // violenta
        ["escolheu", "passo", "portagem"],                    // social (veredito antes do clique)
        ["esteve", "desvio"]] },                              // furtiva
    { id: "chegar", texto: "Entregar {protegido} em {destino}",
      conclui: ["e", ["acompanha", "protegido"], ["esta_em", "destino"]] },
  ],
  solucoes: { /* por etapa: qual ramo do «ou» foi, e o que custa */ },
  reviravoltas: [ { id, gatilho: <predicado>, efeito: <da tabela de efeitos> } ],
  falha:   [["morto", "protegido"]],
  abandono: { semAvancar: 6 },     // dias sem etapa nova → fecha mal, com a frase
  fecho:   { laco: ["protegido", "divida"], relogio: ["fio", -1] },
}
```

**As regras da ficha.**
- **O predicado julga o resultado, não o método.** «Encontre fulano» fecha por
  `conversou(fulano)`, seja qual for o caminho. A solução que ninguém previu (a que o
  Matt premeia) fecha sozinha, porque produziu o facto. As `solucoes` servem só para
  dar **consequências diferentes** a ramos diferentes.
- **Etapas em sequência, por omissão.** `juntas: ["a", "b", "c"], basta: 2` declara
  etapas em qualquer ordem, das quais bastam N (as três pistas, das quais duas chegam).
- **A reviravolta tem gatilho e efeito, os dois de tabela.** O gatilho é um predicado,
  por exemplo `["e", ["etapa", "passo"], ["afeicao", "guarda", "<", 1]]`. O efeito sai de
  um catálogo fechado: trocar quem ocupa um papel, abrir uma etapa nova, subir um relógio,
  pôr uma pessoa em cativeiro, ou **trocar a quest** (a dica «Dobre» do site: o gancho de
  uma, a carne de outra).
- **O tipo 2 não falha: termina.** Tem `desfechos` (dois ou três), e cada um escolhe-se
  por predicado. Uma história do coração ignorada acaba mal, mas acaba. Nunca fica
  «falhada» no Diário.
- **O texto é de mundo.** Nenhum nome de mecanismo chega à tela.

---

## 3. O vocabulário fechado de predicados

Cada predicado diz **de onde lê**. `p` é um papel (que se resolve para o id de uma pessoa),
`l` um lugar, `i` um item. «Novo» quer dizer um campo novo, aditivo, no livro de factos
(§4), que a versão antiga ignora. A ordem de 28/09 permite-o.

| predicado | verdade quando | lê de | estado |
|---|---|---|---|
| `conheceu(p)` | estiveram frente a frente pelo menos uma vez | `factos.pessoas[id].visto` | **novo** |
| `conversou(p, n=1)` | falaram frente a frente pelo menos n vezes | `factos.pessoas[id].falou` (o `falou_com` do Cronista, guardado) | **novo** (hoje dura um turno) |
| `afeicao(p) ≥ g` | grau 0–4 | companheiro: o marco de `vinculos` (25/50/75/100 → 1–4); os outros: `laco.forca` (1–3), 0 sem laço, e o rompido conta 0 | existe (só falta a leitura que junta os dois) |
| `relacao(p) ∈ […]` | o lado em que a pessoa está | `npcs[*].relacao` | existe |
| `situacao(p) = s` | livre, cativa, ferida ou morta | `base.situacoes` | existe |
| `vivo(p)` · `morto(p)` | — | `npcs.status` + `base.mortos` | existe |
| `derrotou(p)` | caiu numa luta com o herói | `base.mortos` + `factos.pessoas[id].derrotado` | **novo** para o rendido e o desacordado |
| `poupou(p)` | caiu e ficou vivo | `factos.pessoas[id].derrotado.como ∈ {rendido, desacordado, fugiu}` | **novo** |
| `consultou(p, n)` | arrancou-lhe informação n vezes | `npcs[*].consultas` | existe |
| `acompanha(p)` | anda no grupo agora | o grupo / companheiros | existe |
| `esteve(l)` | o herói esteve no lugar (alguma vez) | `factos.lugares[id].esteve` | **novo** (hoje só há o instante, `lugarAtual`) |
| `esta_em(l)` | o herói está lá agora | `estaEm` (`missoes.js`) | existe |
| `descobriu(l)` | o segredo do lugar caiu com o herói lá | `factos.lugares[id].descobriu` (de `segredosReveladosNoTurno`) | **novo** (hoje dura um turno) |
| `concluiu(l)` | a masmorra chegou ao fundo | `base.concluidas` | existe |
| `tem(i)` | o item está na bolsa ou no corpo | inventário + equipamento | existe |
| `entregou(i, p)` | deu o item a essa pessoa | `factos.pessoas[id].recebeu` | **novo**; **não achei** quem o escreva hoje |
| `escolheu(ponto, opcao)` | o jogador escolheu, no veredito antes do clique | `quests[q].escolhas` | **novo** (é da própria BQ) |
| `dia ≥ N` · `dias_desde(etapa) ≥ N` | — | `dia` + o `feitoEm` da etapa | existe |
| `relogio(id) ≥ n` · `vencido(id)` | — | `relogios`, `relogioDoFio` | existe |
| `etapa(id)` · `quest(id) = estado` | uma etapa desta quest, ou outra quest, fechou | `quests` | **novo** (é da própria BQ) |
| `e` · `ou` · `nao` · `pelo_menos(n, …)` | os combinadores | — | **novo** |

**De fora do vocabulário, de propósito:** «a prosa disse», «o Narrador declarou», a
chave `missoes.global_encerrado` do Cronista. Nenhum predicado lê a narração. O Cronista
**relata factos** (com quem se falou, quem morreu), e nunca relata conclusões.

**A catraca deste vocabulário** (§9): cada predicado declara `escritoPor`, isto é, o
módulo e a função que escrevem o facto, e a suíte confirma que essa função existe e tem
leitor. Um predicado sem quem o escreva é a regra sem tracker, e quebra a suíte no dia
em que nasce.

---

## 4. O livro de factos por pessoa

É o «já nos encontrámos, conversámos…» da pessoa.

**Onde vive.** Num campo novo do save, `factos`, versionado e aditivo:

```js
factos: {
  v: 1,
  pessoas: { "<id>": { visto: [primeiroDia, ultimoDia], vezesVisto,
                       falou: [primeiroDia, ultimoDia], vezesFalou,
                       derrotado: { dia, como }, recebeu: ["<item>"] } },
  lugares: { "<id>": { esteve: [primeiroDia, ultimoDia], descobriu: dia } },
}
```

Tem teto de tabela (`LIVRO_DE_FACTOS = { pessoas: 120, lugares: 80 }`). Quando passa, sai
quem menos pesa e há mais tempo, **e nunca sai quem ocupa um papel de uma quest aberta**.
A versão antiga ignora o campo. Se a pessoa voltar a ela, perde o livro no primeiro
autosave e o jogo fica inteiro, como no precedente da `memoria` das fichas (F2d).

**O id.** Para a gente do mundo é o id da base (`Cidade|gente|Nome`). Para quem o Cronista
fez nascer é `npc|<nome do registo>`. **O nome resolve-se para id uma vez, quando o facto
se escreve** (`idDaPessoa`, com `mesmaPessoa` e a cidade), e quem lê compara ids. Quando a
resolução é ambígua (dois «Marl» na mesma cidade), **não se escreve nada** e fica uma nota.
Um fecho que não acontece aparece no «o que falta». Um fecho em falso não se desfaz.

**Quem o escreve, turno a turno.** Uma função pura, `anotarTurno(factos, ocorrido)`,
chamada uma vez no fim do turno (no motor do turno, com `calou`):

| facto | o que o produz hoje |
|---|---|
| `visto` | quem `montarEmCena` dá como presente **com fonte do sistema** (o lugar, o elenco, o grupo). Quem vem só da prosa (`SO_DA_PROSA`) não conta sozinho, mas passa a contar se o Cronista o puser em `falou_com` |
| `falou` | `falou_com` do Cronista, guardado em vez de apagado |
| `esteve` | `lugarRef` no fim do turno |
| `descobriu` | `segredosReveladosNoTurno` (`saga.js`) |
| `derrotado` | o fim da luta: `registrarMorte` e o filtro dos rendidos e desacordados (hoje em `derrotadosDaSessao`) |
| `recebeu` | não achei quem o escreva; nasce com a porta do «dar» (por verificar) |

**Como o Narrador o vê.** Nunca inteiro. Só a pessoa que está em cena **e** ocupa um papel
recebe meia linha na ficha de ator ou no `quemE`: «falaram duas vezes, a última no dia 3;
deve-lhe o caminho até Foz». É a resposta verdadeira à pergunta do jogador «ela lembra-se
de mim?». Cabe no teto, porque substitui a linha que hoje se inventa, e não se soma a ela.

---

## 5. Como o esqueleto escolhe e liga

**Quantas.** Por campanha, **uma quest do tipo 1 por ato da espinha** (jornada 6,
arquipélago 4, reinado 4, mistério 5; o último ato é sempre uma quest de família
«confronto», com o vilão), e **duas do tipo 2**, cada uma ao longo de dois ou três atos.
Só uma do tipo 2 tem a batida acesa de cada vez.

**Como as escolhe (determinístico por semente).**
0. **Primeiro o vilão** (§11). O esqueleto elege o vilão e o plano de seis passos dele,
   e cada ato recebe a quest cuja `mao` contesta o passo daquele ato. Os passos abaixo
   escolhem **entre** essas quests.
1. **A posição.** Cada quest declara em que ato pode entrar (`cedo`, `meio`, `fim`). O
   esqueleto enche os atos por ordem. A espinha continua a ir do perto para o longe
   (`cidadeDoAto`, já existe).
2. **Os papéis ligam as quests.** Um papel `de: "fio"` (o vilão, o tenente, a marca) é
   **o mesmo id em todas as quests**, e é assim que o vilão atravessa a campanha. A ligação
   explícita faz-se com `deixa` e `pede`: a quest A deixa `aliado:protegido`, e a quest B,
   que pede um `aliado`, recebe essa pessoa. O que se viveu numa volta na seguinte.
3. **A compatibilidade é uma tabela, não um juízo.** Nunca duas quests da mesma família
   seguidas (a lei «nunca dois iguais seguidos» da espinha). Nunca uma pessoa em dois
   papéis incompatíveis (o `protegido` não é o `tenente`, salvo por reviravolta). Quando
   um papel não encontra ninguém no mundo, a quest sai do sorteio e entra outra. **A
   espinha só aponta para o que existe**, e esta regra é de `saga.js`.
4. **A afinidade** com a espinha só desempata.

**Como o tipo 2 corre ao lado sem atrapalhar** (a dica «Dobre, parte dois»: um enredo
preso ao lugar, outro que acompanha o herói para onde for):
- **Nunca há porta trancada entre os dois tipos.** Nenhuma etapa do tipo 1 pede uma do
  tipo 2, e vice-versa. O tipo 2 só se **ancora** no progresso do tipo 1: `etapa(...)`
  ou `quest(...)` no gatilho da batida.
- **O tipo 2 vive com quem acompanha.** Os papéis dele saem do núcleo (`companheiro`,
  `elo`, `porta`) e as cenas acontecem onde essa pessoa está. Quando pede alguém de
  fora, o esqueleto põe essa pessoa **numa cidade por onde o tipo 1 já vai passar**.
  Assim não há desvio.
- **Uma linha por turno.** Na pauta, a linha do tipo 2 cede à do tipo 1, e as duas cedem
  à luta e ao peso da cena (`peso.js`). A prioridade sai de `SECOES`.
- **A mesma pessoa pode carregar as duas.** O exemplo do site é o príncipe escoltado para
  a cimeira (físico) que quer morrer (pessoal). Um papel partilhado entre uma quest do
  tipo 1 e uma do tipo 2 é a forma mais forte, e o esqueleto procura-a primeiro.

**E as subtramas.** `subtramas.js` continua para as pessoas do núcleo que não carregam
nenhuma quest do tipo 2. São batidas curtas, e não chegam a ser quests de campanha. Quem
carrega uma quest do tipo 2 deixa de ter subtrama, para não ter duas histórias a puxá-lo.

---

## 6. «Concluída», «em que etapa», «o que falta»: o código decide

Uma função pura, `estadoDaQuest(quest, factos, mundo)`, devolve:

```js
{ estado: "aberta" | "concluida" | "falhada" | "terminada",
  etapa: "passo", feitas: [{ id, dia, ramo }],
  falta: ["Passar o Vau Negro: vencer Brás, pagar a portagem, ou achar o desvio"],
  reviravolta: null | { id, efeito },
  desfecho: null | "perdoou" }
```

- **Corre a cada turno**, depois de `anotarTurno`, e nunca antes, porque o facto do turno
  tem de existir antes de ser julgado.
- **O «falta» deriva da árvore do predicado:** de um `e`, os filhos que ainda não se
  cumprem; de um `ou`, as opções. O texto sai de `TEXTO_DO_PREDICADO`
  (`conversou → "falar com {p}"`, `afeicao → "ganhar a confiança de {p}"`), em língua de
  mundo. **É o que o Diário mostra e o que a pessoa do passo sabe.** O AR2 já tem a casa.
- **Uma etapa nunca nasce cumprida.** Se, ao abrir, já está verdadeira com o livro
  vazio, a quest não entra (a mesma regra de `aceitarProposta`).
- **O Narrador não fecha nada, e o Cronista também não.** O Cronista diz com quem se
  falou. O código decide se isso fecha.
- **A ponte para o que existe.** A quest é a verdade. O `missoes` recebe uma
  **projeção** (`missaoDaQuest`) para o Diário, as recompensas e os envelopes continuarem
  a funcionar. Quando o predicado tem um tipo antigo equivalente (`falar_com`, `revelar`),
  a projeção usa-o. Quando não tem, usa um tipo novo, `quest`, que lê o estado. Uma
  versão antiga não reconhece o tipo novo e cai em `ir_a` sem alvo, que **não fecha**:
  fica presa, nunca fecha em falso.

---

## 7. O que o Narrador recebe por turno

**Nada estático.** O teto é sagrado. A BQ entra pela `pauta`, **no lugar** da linha que
hoje leva a batida da espinha, e não ao lado dela:

- **O PASSO** (a secção `momento`, que já existe; ≤ 220 caracteres): a etapa em frase de
  mundo, mais uma coisa que falta. Exemplo: «{protegido} tem de passar o Vau Negro; Brás
  guarda-o por conta de {vilão}».
- **QUEM É** (já existe): para a pessoa do papel que está em cena, meia linha do livro de
  factos (§4).
- **A reviravolta**, uma só vez, no turno em que o gatilho dispara, como frase fechada
  («é fato: entra nesta resposta»), igual à revelação do elo.
- **Os vetos** (`naoPode`): o que a quest guarda. Por exemplo: «o tenente não aparece
  morto fora de cena enquanto a etapa do passo estiver aberta».
- **O Narrador nunca vê** as soluções todas, o gatilho da reviravolta antes de ele
  disparar, nem o desfecho do tipo 2. Descobre ao mesmo tempo que o jogador, como na
  regra de `reviravoltas.js`.

Medida de prova (BQ7): o pior caso da pauta continua ≤ 1400, e o do prompt continua
≈ 82k.

---

## 8. A migração das campanhas em curso

- **A campanha viva nunca perde a espinha que escolheu** (lei da G2). Espinha, marcos e
  missões ficam como estão. O esqueleto da BQ só corre em **mundos novos**, e o campo
  `quests` só existe neles.
- **O livro de factos começa em todas**, vazio no primeiro load, e passa a ser escrito.
  Isto dá às campanhas em curso a melhor parte da BQ sem lhes mexer na história: as etapas
  antigas `falar_com` e `revelar` **ganham uma porta a mais**, que lê `factos.falou` e
  `factos.descobriu`. O «Encontrar X» preso há vinte turnos fecha na conversa seguinte,
  porque a conversa de ontem já está escrita. As portas de hoje ficam todas, e a nova
  só se soma.
- **Nenhuma conversão retroativa.** O livro não se reconstrói do histórico. O que
  aconteceu antes dele conta pelas portas de sempre.
- **Revert:** um commit desfaz tudo. O campo novo some no primeiro autosave da versão
  antiga, e não há dado de jogador a apagar.

---

## 9. O tamanho da biblioteca e como se escreve

**A proposta: 36 do tipo 1 e 16 do tipo 2 no lançamento (52).** Das 36 do tipo 1, 12
`cedo`, 14 `meio` e 10 `fim`/confronto. As 34 entradas do site dão o ponto de partida do
tipo 1. Os nossos 9 moldes de secundária, os 8 episódios e as 22 intenções de
`tramas.js` reaproveitam-se como matéria.

A conta (sorteio uniforme, campanha média de 5 atos e 2 quests do tipo 2):
- duas campanhas partilham, em média, **0,65 das 5 quests do tipo 1** (1,5²/12 + 2,25²/14
  + 1/10) e **0,25 das 2 do tipo 2**. Quase sempre, uma quest repetida aparece com outras
  pessoas, noutro lugar e com outra solução;
- a **sequência inteira** repete-se em menos de uma campanha em cem mil, antes ainda de
  contar o mundo;
- com 12 quests por espinha, ou com 4 do tipo 2, a repetição já se sentiria à segunda
  campanha. É a lei «nada de 4 ou 10 situações».

**Como se escreve.** Por lotes de seis, no mesmo formato, cada lote com a sua prova. A
ordem dos lotes: primeiro as famílias que o motor já sabe fechar inteiras (encontrar,
investigar, escoltar, limpar um lugar, a masmorra), depois as que dependem de factos
novos (entregar, poupar).

**A suíte `teste-biblioteca-de-quests.mjs`**, que prova cada quest:
1. **Vocabulário:** todo predicado está em `VOCABULARIO`; todo papel citado está
   declarado; todo `{modelo}` se preenche.
2. **Concluível:** para cada etapa e para cada ramo de um `ou`, um solucionador constrói
   o livro de factos mínimo que o satisfaz, e `estadoDaQuest` chega a `concluida`.
   O mesmo para cada falha (chega a `falhada`) e para cada desfecho do tipo 2.
3. **Nunca nasce feita:** com os papéis ligados e o livro vazio, a quest está na etapa 0.
4. **A menção não fecha:** um livro só com «nomeado» não fecha etapa nenhuma (a régua
   do MM14).
5. **Determinismo:** 50 sementes, duas vezes, dão as mesmas quests e os mesmos papéis.
6. **O esqueleto aponta para o que existe:** 200 sementes × 4 espinhas, num mundo real
   (`mundo-base`), e todo papel cai numa pessoa ou num lugar existente, ou a quest sai do
   sorteio.
7. **Escritores:** todo predicado tem `escritoPor`, e a função existe e tem leitor (a
   catraca de `teste-ligacao`, apontada aos factos).
8. **Variedade:** em 1000 sementes, a média de partilha entre duas campanhas fica abaixo
   de 1.
9. **Os 17 casos do censo** passam a casos de regressão, com os saves que temos
   (`testes/sessao-s13-fecho.json` e o resto): os presos fecham, os falsos não.

---

## 10. Três quests de exemplo

### 10.1 · O Salvo-Conduto (tipo 1 · Serviço de escolta, #10 · `cedo`/`meio`)

**Papéis:** `protegido` (elenco, vivo, não vilão), `origem` (a cidade do ato), `destino`
(cidade a 2–4 dias), `passo` (lugar na estrada entre as duas), `desvio` (lugar vizinho do
passo), `tenente` (do fio, a mão do vilão), `guarda` (elenco, próximo do protegido).

**Gancho:** «{protegido} tem de chegar vivo a {destino} antes da lua nova, com o que sabe
de {vilão}. Ninguém daqui faz a estrada com {protegido} ao lado.»

| etapa | conclui quando |
|---|---|
| 1 Ouvir {protegido} | `conversou(protegido)` |
| 2 A estrada | `e(acompanha(protegido), nao(esta_em(origem)))` |
| 3 Passar {passo} | `ou(derrotou(tenente), escolheu(passo, portagem), esteve(desvio))` |
| 4 Entregar em {destino} | `e(acompanha(protegido), esta_em(destino))` |

**Soluções e consequências (etapa 3):**
- **Violenta**, `derrotou(tenente)`: o relógio do fio sobe 1, porque o vilão sente a
  perda. Se o tenente foi **poupado** (`poupou`), fica um papel livre para uma quest
  seguinte («o homem que me deve a vida»).
- **Social**, a portagem: o preço em moedas aparece antes do clique. O vilão fica a saber
  a rota, e a quest seguinte começa com ele avisado (`deixa: "avisado:vilao"`).
- **Furtiva**, o desvio: mais um dia de estrada, e o relógio regional sobe 1, sem luta.

**Reviravoltas:**
- *O guarda é do vilão* (a forma que já existe em `reviravoltas.js`). Gatilho:
  `e(etapa(estrada), afeicao(guarda) < 1)`. Efeito: o `guarda` passa a ocupar o papel de
  `tenente` na etapa 3, e o verdadeiro tenente espera em {destino}.
- *O Dobre: o protegido não é quem diz.* Gatilho: `e(conversou(protegido, 3), consultou(protegido, 2))`: quem pergunta
  muito acaba por ouvir a mentira. Efeito: abre-se a etapa 3b, que é uma escolha com
  veredito: entregá-lo a quem o procura ou levá-lo na mesma.

**Falha:** `morto(protegido)`. **Abandono:** seis dias sem avançar fecha a quest com a
frase «{protegido} foi sozinho». **Fecho:** laço de dívida com o protegido; e o
protegido fica disponível como `aliado` para o esqueleto.

### 10.2 · As Cinzas de Ontem (tipo 1 · Ruínas Recentes, #26, com o Dobre «Como é que é?», #15 · `meio`)

**Papéis:** `lugar` (um sítio da cidade), `testemunha` (elenco do lugar), `suspeito`
(elenco, rival de alguém), `prova` (item que a quest põe no lugar), `mandante` (do fio).

**Gancho:** «{lugar} ardeu esta noite. {testemunha} viu alguém sair antes do fogo e não
quer dizer a mais ninguém.»

| etapa | conclui quando |
|---|---|
| 1 Ver o que ficou | `esteve(lugar)` |
| 2 As marcas (juntas, bastam 2) | `pelo_menos(2, descobriu(lugar), conversou(testemunha), tem(prova))` |
| 3 O nome | `ou(conversou(suspeito), derrotou(suspeito))` |
| 4 Justiça | `ou(escolheu(justica, guarda), escolheu(justica, soltar), escolheu(justica, cobrar))` |

**A reviravolta que é a quest:** na etapa 3 o suspeito **é inocente**, e quem pôs o fogo
procurava o herói. Gatilho: `etapa(marcas)`. Efeito: `mandante` entra na quest, a etapa 4
passa a pedir `conheceu(mandante)` antes da escolha, e o relógio do fio sobe 1. O que se
julgava um crime da cidade era um recado para o herói.

**Consequências da etapa 4** (as três com veredito antes do clique):
- **à guarda:** a cidade fica a dever um favor;
- **soltar:** a testemunha sobe um grau de afeição;
- **cobrar pela mão do herói:** um gesto de cobrança no razão (`gesto.js`), que volta
  quando a maré virar.

Se o suspeito foi `derrotou` sendo inocente, o laço com quem o defendia rompe-se.

**Falha:** `dias_desde(1) ≥ 6`: o rasto esfria e o suspeito some (`situacao`).
**Fecho:** `deixa: "inimigo:mandante"`, e a quest seguinte do tipo 1 recebe-o.

### 10.3 · A Carta Que Não Se Abre (tipo 2 · o coração · desfechos, não falha)

**Papéis:** `quem` (o companheiro, ou então o `elo`), `ferido` (elenco, numa cidade por
onde o tipo 1 vai passar no ato 2 ou 3), `carta` (item que nasce com o papel `quem`).

**O que é:** {quem} carrega uma carta de {ferido} que nunca abriu, de alguém a quem falhou
há anos. A técnica do Matt: a personagem tem uma ferida que vem à mesa quando a confiança
o permite, e não antes.

| batida | acende / conclui quando |
|---|---|
| 1 O sinal | acende com `e(acompanha(quem), afeicao(quem) ≥ 1, dias_desde(inicio) ≥ 3)`; conclui com `conversou(quem, 3)` depois de acesa |
| 2 A carta | `ou(escolheu(carta, abrir), escolheu(carta, guardar), escolheu(carta, queimar))`, com veredito: os dois lados ditos no mundo |
| 3 O nome na carta | `e(conheceu(ferido), conversou(ferido))`, no caminho do tipo 1, sem desvio |
| 4 Frente a frente | `e(acompanha(quem), conversou(ferido, 2))` |

**Desfechos** (o sistema decide pelo que o jogador investiu, e nunca por sorteio solto):
- **perdão:** `afeicao(quem) ≥ 3` e a carta aberta. O vínculo passa um marco, e {ferido}
  passa a ser `aliado`;
- **a ferida fica:** `afeicao(quem) < 2`, ou a carta queimada. {quem} continua no grupo,
  mais calado: o vínculo perde 10, e a linha de QUEM CARREGA muda de tom;
- **tarde demais:** `morto(ferido)` antes da batida 4. {quem} fica com a carta e com o
  silêncio, e isso entra no `quemE` dele até ao fim da campanha.

**Ancoragem no tipo 1:** a batida 3 só acende depois de `quest(ato1) = concluida`, e o
`ferido` mora numa cidade do ato 2 ou 3. A história do coração anda **com** a estrada e
nunca a trava.

---

## 11. O vilão: o fio que dá sentido à antologia

> A pessoa, 08/11: *«uma campanha que não tem vilão só parece várias histórias
> misturadas, temos que ter uma forma de colocá-lo no meio disso»*.

**A regra desta secção: cada quest do tipo 1 é um passo do vilão, ou um passo contra
ele.** O esqueleto deixa de escolher quests e pôr um vilão no fim. Primeiro escolhe o
vilão e o plano dele, e depois escolhe as quests que o plano pede.

### 11.0 · O que já existe (e é muito)

| peça | onde | o que já faz |
|---|---|---|
| **20 arquétipos** | `vilao.js` `ARQUETIPOS` | crença, `quer`, método, assinaturas; `nasceDe` lê o registo do jogador |
| **6 fases** | `vilao.js` `FASES` | rumor → marca → mão → rosto → guerra → queda, com `podeDizerNome` e `podeAparecer`. **É a revelação em camadas, já escrita** |
| **o plano** | `vilao.js` `PASSOS_DO_PLANO` | 9 passos, `custa` (sombra, voz, lugar, esperança, gente), `FASE_DO_PASSO`, `DIAS_POR_PASSO = 6`; os alvos saem do que o herói tem (`escolherAlvo`) |
| **5 corpos** | `antagonista.js` `CORPOS` | pessoa, conselho, bando, coisa antiga, instituição; cada um com ritmo, queda e confronto próprios |
| **a cabeça dele** | `antagonista.js` | um livro do que chegou até ele, com fonte e certeza (`chegouAteEle`, teto 12); 19 `LEITURAS` do herói, várias erradas de propósito; `RESPOSTAS` |
| **6 heranças** | `vilao.js` `HERANCAS` | o vilão seguinte nasce do buraco que a queda deste abriu |
| **o fio** | `saga.js` | antagonista, título, motivo e assinatura eleitos na criação; `FIO.sombra` por ato («alguém que…» → título → nome); `vilaoDoFio` junta a nêmesis ao fio (11/10); `oRostoEspera` guarda o nome para o último ato; `caiuOFio` |
| **o relógio do fio** | `batidas.js` `relogioDoFio` | 5 passos presos a marcos da espinha, com prazo. Se o herói chega a tempo, o passo fica **travado**; se não, fica **cumprido** e o mundo perde. Diz-se como obra, bilhete ou servos |
| **o vilão como pessoa** | `nucleo.js` | papel obrigatório do núcleo; 8 `FERIDA_DO_VILAO`, das quais 2 com teia ao companheiro ou à `porta`, que é a ponte para o tipo 2; `VILAO_POR_TAMANHO` |
| **os servos** | `mundo-base.js` `chefesDoMundo` | um chefe `principal` e os secundários, «os que o servem»: os tenentes já existem |
| **na pauta** | `pauta-do-turno.js` | `momento` leva a marca do relógio; `vilao` (prioridade 6) leva a resposta do antagonista; `resumoVilaoPrompt` leva a «SOMBRA NO MUNDO» sem nome; já existe a bandeira `maoDoVilao` |

**O que é vago.** Os 9 passos do plano são **os mesmos para os 20 vilões** («juntar
gente», «comprar o silêncio»…), e por isso o que ele fará se ninguém o parar é genérico.
A fase sobe **pelo tempo** (`FASE_DO_PASSO`), não pelo que o herói descobriu. Os marcos da
espinha não têm nada a ver com ele: o relógio só lhes empresta o prazo. **Não há
fraqueza** (`fraqueza` só existe no combate e no bestiário).

**O que as sessões mostram.**
- **5.ª (64 narrações):** o nome do antagonista e a assinatura foram ditos zero vezes; a
  sombra que o Mestre pôs («a ordem») era outra; o chefe que matou a heroína não tinha
  relação com o vilão; e havia três antagonistas diferentes em três tabelas.
- **6.ª (67 narrações):** a assinatura chegou em 6 respostas, de 11 pedidos; a obra
  em 2, de 7; o nome em 0, que é o certo; o relógio deu **um** acontecimento no mundo.
- **11.ª:** a assinatura só chegou pela boca do elo. O Mestre **inventou outro
  antagonista** e manteve-o durante cinco respostas, contra quatro correções do sistema.
- **8.ª:** uma aliada de quem o herói fugiu virou nêmesis.
- **13.ª a 17.ª e AR7:** os relatórios não falam do vilão. **Não está medido.**

O vilão existe no sistema e não chega à mesa, porque as quests não passam por ele.

### 11.1 · A ficha do vilão

A criação do mundo preenche-a, determinística pela semente. **É uma vista sobre o que já
existe, mais três campos novos**, todos dentro de `espinha.fio`, aditivos e ignorados pela
versão antiga.

| campo | sai de | estado |
|---|---|---|
| **quem** (nome, título, corpo) | `fio.antagonista`, `fio.titulo`, `CORPOS` | existe |
| **o que quer** e **crença** | `ARQUETIPOS[arq].quer` / `.crenca` | existe |
| **porquê** (a ferida que um jogador entenderia) | `FERIDA_DO_VILAO` (8) | existe |
| **o que fará se ninguém o parar** | `FIM_DO_PLANO[arq]`: uma frase que muda o mapa («a região inteira paga-lhe a proteção») e os efeitos concretos dela (§11.7) | **novo** (tabela, 20 entradas) |
| **os recursos** | tenentes: `chefesDoMundo` secundários (2–3); lugares: o covil e um lugar por passo do plano; **um segredo**: a reviravolta maior eleita (`reviravoltas.js`) ou o `esconde` do núcleo | existe; falta ligá-los aos passos |
| **a fraqueza** | `FRAQUEZAS` (tabela nova, em três famílias): **uma pessoa** (quem ele ainda ouve), **uma coisa** (o objeto sem o qual o plano não fecha), **uma verdade** (a prova que vira o mundo contra ele). Obtém-se **por uma quest**, e muda o confronto (§11.7) | **novo** |
| **a ponte ao herói** | a ferida com teia (`w_mesmo_mestre` ao companheiro, `w_filha` à porta), ou uma pessoa de uma quest do tipo 2 ligada a um passo dele | existe em parte; **novo**: a ponte declarada |
| **a assinatura** | `fio.assinatura` / `RELOGIO_DO_FIO.assinaturas` | existe |

### 11.2 · O plano como relógio (as frentes do Dungeon World)

A referência é o capítulo «Fronts» do *Dungeon World* (LaTorra & Koebel, 2012). Cada
**perigo** tem um **destino iminente** e uma lista de **presságios sombrios** (*grim
portents*): o que acontece, por ordem, se ninguém intervier. O Mestre faz um presságio
cumprir-se quando os jogadores o ignoram ou falham. A Grande Lista diz o mesmo pelo
avesso: o enredo #23, «Onças da Prevenção», é o da pista sobre um plano que é preciso
travar a tempo.

**O nosso: 6 passos por arquétipo**, numa tabela `PLANOS_DO_ARQUETIPO` (20 × 6). Os 9
passos genéricos ficam como recuo para quem ainda não tem plano próprio. Cada passo é:

```js
{ diz: "vender a proteção", muda: [<efeitos de tabela>], seTravado: "o passo desviado",
  contra: ["tenente", "recurso"], prazo: 1.0 }   // × DIAS_POR_PASSO × ritmo do corpo
```

Os efeitos saem de um catálogo fechado: um lugar muda de dono (`base`); uma pessoa muda
de lado (`relacao`); um relógio regional sobe; o preço da estrada sobe; uma porta fecha-se
ao herói; uma pessoa vai para cativeiro (`situacoes`); a postura do mundo vira (`posturas.js`).

**O relógio anda, recua ou desvia-se, e o juiz é sempre o livro de factos e o estado
das quests, nunca o Narrador:**

| o que acontece | o que o relógio faz | lido de |
|---|---|---|
| passa o prazo do passo | o passo **cumpre-se** e os efeitos aplicam-se | `dia` (existe: `relogioDoFio`) |
| a quest que contesta o passo **falha** ou é **abandonada** | o passo cumpre-se já, sem esperar o prazo | `estadoDaQuest` |
| a quest que contesta o passo é **ignorada** (oferecida e não aceite até ao prazo) | o passo cumpre-se, e o seguinte vem com o prazo × 0,75 | `quests` + `dia` |
| ele **sabe** do herói (certeza ≥ 3 no livro dele) | o passo seguinte escolhe um alvo do que o herói ama (`escolherAlvo`, existe) | `antagonista.js` |
| a quest que contesta o passo **conclui** antes do prazo | o passo fica **travado** e o plano **desvia-se**: o passo seguinte usa `seTravado` | `estadoDaQuest` (existe a ideia em `relogioDoFio`) |
| o herói **tira-lhe um recurso** (uma quest de mão `recurso`) | o passo seguinte atrasa (prazo × 1,5) | `estadoDaQuest` |
| o herói **derrota ou vira um tenente** | o passo que esse tenente servia **recua um** | `derrotou` / `poupou` / `relacao` |

Os números (0,75, 1,5) são uma tabela, `RITMO_DO_PLANO`, que a suíte lê de volta.

### 11.3 · A mão do vilão em cada quest

Cada quest do tipo 1 tem o campo `mao`, que diz onde é que ele está nela:

| `mao.tipo` | o que é | exemplo da Grande Lista |
|---|---|---|
| **tenente** | um servo dele ocupa um papel; vencê-lo, poupá-lo ou virá-lo | #10 Escolta, #21 «Ninguém sujou a ponte» |
| **recurso** | uma coisa de que o plano precisa (lugar, objeto, pessoa); tirá-la atrasa-o | #4 Arrombar e entrar, #14 «Quanto custa…» |
| **consequencia** | a quest existe **porque** um passo dele se cumpriu; o herói repara o estrago | #26 Ruínas Recentes, #24 Caixa de Pandora |
| **pista** | dá uma camada da revelação (§11.4) ou a fraqueza | #9 «Elementar…», #23 «Onças…» |
| **rosto** | encontrá-lo **sem lutar**: uma oferta, uma ameaça, uma demonstração | #16 «Garfo longo…», #17 «Olhe, não toque» |
| **confronto** | o fim | — |

`mao.contra` diz que passos do plano a quest contesta.

**O esqueleto escolhe por este campo** (BQ6), e a composição é uma tabela,
`COMPOSICAO_DA_MAO`, por número de atos. Para 5 atos: um `tenente`, um `recurso` **ou**
`consequencia`, uma `pista` (a que dá a fraqueza), um `rosto` no penúltimo ato e o
`confronto` no fim. As cinco quests físicas **desenham juntas o plano dele**: cada uma
contesta um passo, pela ordem do relógio, e uma delas entrega a fraqueza. Se nenhuma quest
da biblioteca contesta o passo k com a mão pedida, o esqueleto tenta a mão seguinte da
lista `contra` do passo. Se mesmo assim não houver, o passo fica **sem contestação**,
cumpre-se pelo tempo e a suíte conta-o. O alvo é zero.

**O tipo 2 não é sobre ele.** Toca-o pela ponte (§11.1): a pessoa da quest do coração mora
numa cidade que um passo dele vai atingir, ou é a ferida dele. É o que faz o jogador
sentir que a história pessoal e a grande são a mesma, sem uma trancar a outra.

### 11.4 · A revelação em camadas, pelo facto

As camadas são as `FASES` que já existem. A mudança é **o que as sobe: hoje é o
tempo, na BQ é o facto.** O tempo só faz o plano andar, e nunca revela nada.

| camada | sobe quando (no livro de factos) | o que o Narrador pode receber |
|---|---|---|
| **o rumor** | desde o dia 1 | a **obra**, sem dono: «na estrada de Foz sumiram duas carroças» |
| **o sinal** (a marca) | `esteve(lugar de um passo cumprido)`, ou `descobriu(...)` / `tem(...)` com a assinatura | mais a **assinatura**, sem explicação |
| **o tenente** (a mão) | `conheceu(tenente)` ou `derrotou(tenente)` | mais o tenente pelo nome; e «sabem quem é o herói», se ele já sabe |
| **o rosto** | a etapa da quest de mão `rosto` com `conversou(vilao)` | mais o **nome**, a crença e o que quer; e o veto «não há luta com ele nesta cena» |
| **a guerra** | `quest(rosto) = concluida` | mais o **plano**: o passo seguinte, em mundo |
| **a queda** | a quest de confronto aberta | tudo, incluindo a fraqueza, **se** o herói a tem |

**As regras:**
- **Uma camada por turno, no máximo**, e nunca o rosto antes do ato 1 (a regra de
  `ATO_DA_REVELACAO` estendida ao vilão).
- **O filtro é do código.** A linha do vilão monta-se só com os campos da camada atual.
  A suíte prova, para cada camada, que o texto da pauta não contém nenhum campo de uma
  camada acima: nem o nome antes do rosto, nem o plano antes da guerra, nem a fraqueza
  antes de o herói a ter. É a lei «o Narrador nunca vê a verdade eleita antes do turno
  da revelação».
- **A camada não desce**, e o facto que a subiu fica citado na linha do envelope.

### 11.5 · O vilão reage

Uma tabela, `REACOES_DO_VILAO`: um facto do livro gera uma reação no passo seguinte e uma
linha no livro **dele** (`chegouAteEle`, com fonte):

| o herói… | ele… | e fica a saber (fonte · certeza) |
|---|---|---|
| derrota um tenente | endurece: o passo seguinte ganha um tenente de guarda | o que o herói fez (`marca` · 3) |
| poupa um tenente | o tenente pode voltar como `balanca`, a pessoa que pode cair para um lado ou para o outro | **o nome do herói** (`viu` · 3); leitura «sentimental» (existe) |
| trava um passo | desvia o plano (`seTravado`) | onde o herói esteve (`deduziu` · 1) |
| tira-lhe um recurso | atrasa, e manda alguém olhar (`RESPOSTAS.manda_ver`, existe) | — |
| ignora duas quests da mão dele | acelera (leitura «ainda_nao», existe) | — |
| fica famoso numa cidade de um passo | o alvo seguinte é do que o herói ama | a fama (`fama` · 2) |
| aceita a oferta no rosto | o plano poupa o que o herói protege, e cobra-o mais tarde | tudo (`viu` · 3) |

**O vilão aprende o nome do herói, e antes disso não o tem.** Até haver uma linha
`sobre: "nome"` no livro dele, a voz dele e a dos servos tratam o herói por «o forasteiro
de Foz», e há um veto em `naoPode` que impede o Narrador de pôr o nome na boca deles. Isto
prova-se na suíte e sente-se à mesa. É o que o Matt faz quando o vilão diz o teu nome
pela primeira vez.

As `LEITURAS` já pedem bandeiras como `heroiPoupou` e `heroiMatou` (hoje vêm de
`contadores`). Passam a vir do livro de factos (`poupou`, `derrotou`).

### 11.6 · O que o Narrador recebe por turno

**Nenhum bloco novo.** Uma linha, «A MÃO DELE AQUI» (≤ 160 caracteres), **só quando a
cena tem o vilão**: um tenente em cena, um lugar dele, um passo cumprido nesta cidade, ou
a etapa atual de uma quest com `mao`. Entra **no lugar** da linha da marca do relógio
(`momento`, `marcaDaEtapa`), e não ao lado. A prioridade fica logo abaixo da frente do
`momento`, e cede à luta e ao peso da cena. O texto depende da camada (§11.4). A
`SOMBRA NO MUNDO` de `resumoVilaoPrompt` continua a ser a única coisa que ele recebe nas
cenas sem mão.

Medida de prova (BQ7): em 20 turnos de uma campanha nova, a mão dele chega à prosa pelo
menos uma vez em cada ato, e o nome nunca chega antes do rosto. É o contrário da 5.ª
sessão (zero em 64) e da 11.ª (um antagonista inventado).

### 11.7 · O fim

**Os desfechos do confronto**, cada um por predicado, e com a forma que o corpo dele dá
(`CORPOS.queda`, existe):

| desfecho | quando | depois |
|---|---|---|
| **derrota** | `derrotou(vilao)` | o plano morre; com corpo que sobrevive (conselho, bando, instituição), o plano continua mais lento, um passo atrás |
| **redenção** | a fraqueza é **uma pessoa**, `acompanha(essa pessoa)` ou `conversou(vilao, 2)` com ela presente, e `escolheu(confronto, poupar)` | ele larga o plano; a ferida dele fica dita; nasce um laço `rompido`, que pode reatar |
| **fuga** | `poupou(vilao)` sem redenção, ou corpo `coisa` sem rito | o capítulo seguinte herda-o (`HERANCAS`, existe) |
| **pacto** | `escolheu(rosto, aceitar)` e `escolheu(confronto, cumprir)` | ele ganha uma parte do que queria; a campanha continua, com o herói a dever-lhe |

**A fraqueza muda o confronto, e não só a narração:** com a fraqueza na mão
(`tem(coisa)`, `descobriu(verdade)` ou `acompanha(pessoa)`), a quest de confronto abre um
ramo `ou` a mais (a verdade dita na praça, a coisa destruída), e esse ramo fecha **sem
luta**. Sem ela, só há a luta.

**Se o relógio chega ao fim antes do herói, a campanha não acaba: muda de tom.** O
`FIM_DO_PLANO` aplica os efeitos dele (cidades viram dele, uma postura do mundo vira, um
relógio regional enche). O confronto troca de família, de «impedir» para «reconquistar»
(o episódio «Queda e Reconstrução» já existe como matéria), com um tenente a mais. Ele
continua vencível, agora no auge. O jogador perdeu uma corrida, não a campanha.

### 11.8 · As campanhas em curso

**Nada parte.** As campanhas de quem já joga mantêm o fio, a nêmesis, o `relogioDoFio`
e as fases pelo tempo. **A ficha nova, os planos por arquétipo, as camadas pelo facto e a
mão nas quests só existem em mundos novos**, junto com o esqueleto da BQ. A única coisa
que chega a todos vem das portas do livro de factos (BQ2): as bandeiras `poupou` e
`derrotou` passam a alimentar as `LEITURAS` que já existem. A leitura é do mesmo vilão;
só a fonte melhora.

### 11.9 · Um vilão inteiro, e as três quests ligadas a ele

**Ilídia Selamar, a Vendedora de Medo** (arquétipo `vendedor_de_medo`, corpo `pessoa`).
- **Quer** uma região inteira a pagar-lhe para se proteger do que ela própria solta.
- **Crença:** a segurança é a única mercadoria que o freguês compra a chorar e agradece.
- **Porquê** (`w_heroi_antes`): foi uma heroína, como este, e a cidade não lho agradeceu.
  Salvou Porto Velho de um incêndio há vinte anos e morreu pobre para os que salvou.
- **Se ninguém a parar:** a região inteira paga a proteção da Guarda Cinzenta, e quem não
  paga arde.
- **Recursos:** os tenentes **Brás do Vau** (a estrada) e **Mira Cinzenta** (a Guarda); o
  covil, a Alfândega de Porto Velho; um lugar por passo.
- **Segredo:** o incêndio que a fez heroína foi ela que o pôs.
- **Fraqueza** (uma verdade): o livro de contas da Guarda, com as datas dos ataques e as
  datas dos contratos, lado a lado.
- **Assinatura:** cera preta sem selo.
- **Ponte:** o `ferido` da quest do tipo 2 paga-lhe proteção.

| passo | diz | muda no mundo quando se cumpre | contestado por |
|---|---|---|---|
| 1 | soltar o perigo na estrada de Foz | encontros na estrada sobem; relógio regional +1 | **O Salvo-Conduto** (mão `tenente`: Brás no Vau) |
| 2 | vender a proteção | o preço da estrada sobe; a guarda de Foz passa para o lado dela | O Salvo-Conduto (o desvio e a portagem dizem-lhe quem é o herói) |
| 3 | queimar quem não paga | um lugar de Foz é destruído; a testemunha some | **As Cinzas de Ontem** (mão `consequencia` + `pista`: o `mandante` é Mira, e a assinatura dá a camada do sinal) |
| 4 | comprar a voz do conselho | as portas do conselho fecham-se ao herói | uma quest de mão `pista` do acervo, que entrega **o livro de contas** (a fraqueza) |
| 5 | provar que ninguém mais protege | a guarda da cidade debanda; o mundo entra em crise | uma quest de mão `rosto`: ela oferece ao herói o comando da Guarda |
| 6 | a região paga | `FIM_DO_PLANO` | a quest de confronto, na Alfândega |

**Como se encaixam as três quests da planta:**
- **O Salvo-Conduto** (ato 0) contesta os passos 1 e 2. Matar Brás faz o passo 1 recuar
  e ensina-lhe o que o herói faz. Poupá-lo dá-lhe o nome do herói e deixa Brás como
  balança. Pagar a portagem trava o passo 1 mas cumpre o 2 (ela vende-lhe a passagem). O
  desvio trava os dois e custa um dia.
- **As Cinzas de Ontem** (ato 1) existe porque o passo 3 se cumpriu. A reviravolta («o
  fogo era um recado para o herói») é o passo 3 a escolher um alvo do herói, porque ela já
  sabia dele. A testemunha falar sobe a camada para o sinal, e conhecer Mira sobe-a para o
  tenente.
- **A Carta Que Não Se Abre** (tipo 2) não é sobre ela. O ferido mora em Foz e paga-lhe
  proteção. Se o passo 3 se cumpre antes da batida 3, a casa dele é a que arde, e a quest
  do coração continua noutro tom. No desfecho «perdão», o ferido vira testemunha: um
  segundo caminho para a fraqueza, por um lado que ninguém procurou.

---

## 12. O que esta planta não decide

- **A voz dos ganchos em massa** (52 quests) é a voz do Narrador em massa. O primeiro lote
  passa por quem decide o pesado. Os lotes seguintes, no mesmo formato, são médios.
- **O que ainda não tem escritor** (`entregou`, a promessa do herói) espera a peça que o
  escreva. As quests que dependem disso entram nos últimos lotes.
