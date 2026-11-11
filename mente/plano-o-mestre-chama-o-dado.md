# O Mestre chama o dado — as causas, o momento e a Fase MC

*O `conselheiro`, 10/11/2026. A fonte é a 18.ª sessão de prova
(`mente/sessao-18.md`, v9.635, IA real, 33 respostas do Narrador). As causas
abaixo foram lidas no código por âncora e **provadas em Node** com as frases da
sessão (os scripts estão no scratchpad desta sessão, `md/frases.mjs`,
`md/queimado.mjs`, `md/pedido.mjs`, `md/socorro.mjs`, `md/cobertura.mjs`). As
linhas de `src/App.jsx` foram lidas na árvore de 10/11 com um `oficial` a
trabalhar nele (o Empurrar): **o nome da função é a âncora, o número é o de
hoje.***

## 0 · A palavra dela

À pergunta *«depois da frase do jogador e antes da narração, a mesa responde
"Sobrevivência. Precisa de 14. Se falhar, a chuva apaga o rasto." e o d20 fica
na bandeja à espera de um toque, com saída para quem tem pressa — vira o centro
da próxima fase, junto com a busca que encontra, a quest que manda no oráculo,
o epíteto do vilão e a luta honesta (veredito antes de partir, cativeiro como
estado)»*, a pessoa respondeu, a 10/11/2026: **«Sim, faça.»**

E a régua de 04/11, que esta fase existe para cumprir no **sentido** e não só
no número: *«um rpg precisa de constantes rolagens pra ter o sentimento que
você está jogando e arriscando algo, além de que são diferentes dados
jogados.»* — **um dado a cada dois ou três turnos fora da luta, dados
diferentes, o Mestre pede e a bandeja mostra.**

A sessão 18 cumpriu a razão (9 dados em 26 turnos, 1 a cada 2,9) e falhou o
sentido: quatro vezes a mesma Percepção depois de andar, três sucessos vazios,
e **nenhum** dado nos cinco momentos que o pediam (o corte na carcaça, o
rasto, o que se sabe, estancar a irmã, as amarras). *O jogador aprende em dez
minutos que o dado é ritual e a ficção é de graça.*

**O peso.** A aprovação de hoje mais a liberdade das ordens de 23/09 e 28/09.
O limite é o de sempre — o que um commit revertido não desfaz. Os dois campos
novos desta fase (`cativeiro` no save; a preferência «o Mestre rola por mim»
em `taverna_cfg_*`) são **aditivos e ignorados pela versão antiga**. O chamado
pendente **não** vai ao save: recarregar devolve a frase à caixa, e nada
aconteceu.

---

## 1 · As causas no código

### 1.1 A oferta «Olhar à volta» aparece depois de cada deslocação, e queima o lugar

- **De onde vem.** `O_MESTRE_PEDE.pedidos`, o pedido `chegada`
  (`src/motor/o-mestre-pede.js:32`, frase *«Olho em volta com atenção.»*).
  `oQueOMestrePede` (`o-mestre-pede.js:61`) devolve-o sempre que há `onde`
  (`:73-78`) e a chave ainda não foi pedida; a chave é
  `chegada|onde|dia` (`aChaveDoPedido`, `:51`). **Sítio novo = chave nova =
  oferta nova.** Nada pergunta se o lugar tem alguma coisa.
- **Quem a dispara.** O efeito «O MESTRE PEDE O DADO» do App
  (`App.jsx:25235-25285`): quando a mesa assenta, `onde` é o lugar ou a cidade
  (`:25274`). Daí a oferta igual depois de cada deslocação.
- **O que o sucesso faz.** A frase cai no desafio `buscar`
  (`desafios.js:341`, «olho em volta com»), Percepção CD 13. Com sucesso e sem
  achado, o veredito traz `fechaDepois` (`desafios.js:1779`), o App manda
  `envelopeDeBuscaVazia` (`App.jsx:17326`; o texto em `desafios.js:2440-2443`:
  *«AQUI NÃO HÁ NADA ESCONDIDO… NÃO invente um achado»*) e o lugar fica limpo.
- **A prova de que a oferta come o dado do jogador** (`md/queimado.mjs`):
  depois de a oferta passar no Largo do Cereal, *«Examino o corte na
  carcaça.»* e *«Procuro o que o Largo do Cereal esconde.»* dão
  **`vasculhado`** (`desafios.js:1649-1651`), com a **mesma chave**
  `largo do cereal|busca` (`chaveDaTentativa`, `desafios.js:1246`). Só
  *«Investigo o que aconteceu aqui.»* ainda rola, porque a chave é outra.

### 1.2 O catálogo que julga a frase: os cinco momentos que não viraram dado

`lerAcao` (`desafios.js:1460`) foi corrido em Node sobre as frases da sessão e
as suas variantes (`md/frases.mjs`, `md/socorro.mjs`, `md/pedido.mjs`):

| o momento | a frase | o que o catálogo devolve | a causa |
|---|---|---|---|
| o rasto | «Sigo o rasto.» (a palavra do próprio passo da quest) | **null** | `rastrear` (`desafios.js:581-582`) conhece «rastro», «pegadas», «farejo», e não conhece **«rasto»** nem «marcas no chão» |
| o rasto | «Sigo o rastro até onde a besta dorme.» | teste de Sobrevivência 15, **com oportunidade `haRastro`** | rola só se o oráculo disser que há (§1.4), e disse que não |
| a carcaça | «Examino o corte na carcaça.» | `buscar` / **Percepção** 13 | «examino o» está em `buscar` (`:341`), não em `investigar` (`:375`): examinar um vestígio é vasculhar o lugar, e o lugar já estava queimado pela oferta (§1.1) |
| o que se sabe | «O que sei de Alto Negro, da Agulha, de bichos assim?» | **null** | `fraqueza` (`:394-395`) só conhece «o que (eu) sei **sobre**», e só de criatura; o catálogo tem Saberes em dois desafios (`fraqueza` `:402`, heráldica `:732`) e **nenhum para lugar ou gente**. «O que eu sei sobre a Agulha de Sal?» rola *«lembrar o que se sabe da criatura»* |
| estancar | «Cuido das feridas de Elowen.» · «Faço um torniquete…» · «Pressiono o ferimento…» · «Enfaixo…» · «Socorro a minha irmã.» | **null** (as cinco) | `estancar` (`:590-591`) só conhece «estanco, estabilizo, trato/cuido **do** ferimento, faço um curativo»; «Deito Elowen… e cuido das feridas dela» dá `livre` |
| as amarras | «Forço os pulsos contra as raízes para arrebentá-las.» | Atletismo 13 (improviso) | **rola** — a frase limpa funciona |
| as amarras | «**Rolo** de lado e forço os pulsos com toda a **força**…» | **`naoSePede`** | `detectarPedidoDeTeste` (`testes.js:142`) procura `rolo\|rolar\|teste…` **sem fronteira de palavra**, e `VERBO_PEDIDO` (`testes.js:61`) tem o objeto opcional: «rolo» (o corpo que rola) + «força» (`MAPA_PALAVRA`, `testes.js:67`) = «pedi um teste de Força». Com pedido, o improviso é saltado (`desafios.js:1534`) e sai `naoSePede` (`:1555`), o envelope *«rolagem não se pede»* (`:1832-1834`) |

**O que não sei.** O receptor da sessão foi bloqueado e as frases exatas não
ficaram em disco. A das amarras chegou com «…» no meio: o mecanismo está
provado com a variante, a palavra exata que o disparou não. A de estancar não
ficou: as cinco formas comuns de o dizer falham, e isso basta. E mesmo quando
`estancar` rola, **não achei leitor** de `alvo: "medicina"` que mude o
companheiro caído (só `desafios.js:592` e o preço em `:1951`): o sucesso não
estabiliza ninguém.

### 1.3 «[BUSCA CONCLUÍDA] … NÃO invente um achado», e o passo que não planta nada

- O passo *«descobrir o que X esconde»* é a condição `descobriu`
  (`src/condicoes-da-quest.js:240-243`), que lê o facto `descobriu` do livro.
  A única porta que o escreve é a do Cronista (`PORTA_DO_CRONISTA`,
  `condicoes-da-quest.js:171`): `anotarTurno` marca `descobriu` só a partir de
  `o.segredos` (`src/livro-de-factos.js:625-630`), e esses vêm de
  `segredosReveladosNoTurno(E.espinha, …)` (`src/motor/cronista-do-turno.js:426`)
  — os segredos **da espinha**, não os da quest.
- A busca pergunta ao mundo por `achadoDe` (`App.jsx:17554`) →
  `achavelAqui` (`src/mundo-base.js:696-707`), que lê só `oQueExisteAqui`
  (os segredos da base pelo prédio e os baús do ermo). **Não lê o passo
  ativo.** No Largo do Cereal, com o passo a mandar descobrir o que o Largo
  esconde, a busca passou, não achou, e o envelope fechou o lugar para
  sempre: **o sistema tornou o passo impossível de cumprir por ele.**
- E quando o teste passa noutros desafios, o envelope comum manda *«Revele UMA
  coisa concreta e útil… nunca uma novidade inventada agora»*
  (`src/testes.js:206`): o facto do sucesso é delegado ao Narrador. Sai
  plausível, não verdade — o oposto da régua Matt Mercer.

### 1.4 «O MUNDO RESPONDE — PERGUNTADO PELO PRÓPRIO SISTEMA» não lê o passo

- `rastrear` traz `oportunidade: { pergunta: "haRastro" }` (`desafios.js:587`).
  O App pergunta-a em `perguntarOportunidade` (`App.jsx:19120-19143`), com um
  contexto todo de lugar (movimento, noite, cidade, chuva, masmorra) e
  **nenhum campo da quest**; `perguntarPeloSistema` (`src/oraculo.js:554`)
  aplica os ajustes de `haRastro` (`oraculo.js:504-517`): em cidade **−25**,
  e a chance dá os **25%** que a sessão viu. Rolou 84: NÃO, com o *seNao*
  *«não plante uma pegada de consolo»* (`:517`) e o envelope de `:565-570`.
- O facto fica registado (`App.jsx:19142`, `registrarFato`): o NÃO prende a
  cena e o dia.
- O passo vive em `aMesaDasQuests` (`src/motor/quests-do-turno.js:973-1001`,
  o campo `passo`), e **só vai para a pauta do Narrador**. Nenhuma regra o
  lê. Por isso a quest diz «segue o rasto» e o oráculo diz «não há rasto», e
  o Narrador fica a escolher entre duas verdades (escolheu a da quest duas
  respostas depois, sem dado).

### 1.5 O epíteto do vilão em todas as pautas

- O veto nasce em `LINHA_DO_VILAO.vetos.nome` (`src/plano-do-vilao.js:822-824`):
  *«que {quem} diga o meu nome: ainda não o sabe, e chama-me «{alcunha}»»*.
- `oVilaoNaPauta` (`plano-do-vilao.js:1515`) empurra-o (`:1566-1571`)
  **sempre que o vilão não sabe o nome do herói**, esteja ele ou um servo em
  cena ou não. O retorno cedo (`:1539`) deixa passar quatro casos, e um deles
  é `maoAqui` — que `aMesaDasQuests` liga (`quests-do-turno.js:1007-1016`)
  **sempre que o herói está numa cidade dos papéis da quest do ato**. Em Alto
  Negro, toda a pauta levou o veto.
- Um veto que **escreve a alcunha** é uma instrução para a usar: o modelo leu
  «chama-me o forasteiro de Alto Negro» como o nome do herói e pô-lo na boca
  de toda a gente (14 de 33 respostas).
- E a alcunha usa `f.cidadeInicial` (`:1568`), que é a cidade onde o herói
  **está**: «o forasteiro de Alto Negro», dito em Alto Negro.

### 1.6 O veredito de perigo chega depois de Partir, e falta no «Entrar»

- O mapa e o cartão da partida dizem o perigo pelo **nível absoluto** do lugar:
  `vereditoDaPartida` (`src/partida.js:350`) tira `perigoDoLugar` do nó
  (`partida.js:426`), que sai de `PERIGO_POR_NIVEL` (`src/regiao.js:157-162`):
  nível 4–7 é «perigo médio», seja o grupo qual for.
- O veredito **relativo** ao grupo (`avaliar`, `src/dificuldade.js:148`; a
  linha *«DIFÍCIL… 5,1× menos do que isto pede»*, `dificuldade.js:183`) só é
  pedido por `vereditoDaMasmorra` (`src/boca.js:226-235`), e este só à
  **chegada à boca** (`boca.js:289`, por `chegadaABoca`, `App.jsx:13624`) e à
  **entrada** (`App.jsx:19924`). O comentário de `boca.js:221-224` diz que a
  função existe para ser lida antes; o mapa nunca a lê.
- A proposta «Entrar» / «Ir até» de uma masmorra
  (`src/motor/a-proposta-da-frase.js:267`) nasce com `preco: ""` e sem linha de
  veredito. A lei *o veredito antes do clique* falha no clique que mais custa.

### 1.7 O cativeiro não é estado

- A derrota com captura é o desfecho `prisioneiros`, `presos: true`
  (`src/saida-da-luta.js:106-109`). O `presos` só é lido para **texto**: o
  captor estabiliza (`:285`) e o envelope diz *«de mãos atadas… não há golpe a
  dar agora»* (`:314-316`). Não há campo no save, nem ref, nem leitor no App
  (o único `presos` de `App.jsx`, `:10823`, é outra coisa).
- Daí o que a sessão viu: a tela da masmorra com «sair» à mão; o catálogo sem
  saber que há amarras (o desafio `escapar` existe, `desafios.js:678`, e nada
  lhe diz que há de que escapar); e o turno seguinte sem envelope nenhum
  (i=45), em que o Narrador soltou o herói e lhe deu uma chave que o sistema
  não tem.

---

## 2 · O desenho do momento

### 2.1 O compasso

1. **A frase.** O jogador escreve *«Sigo o rasto até à mata.»* e envia.
2. **O Mestre chama.** Antes de chamar a IA, o sistema julga a frase (o
   catálogo, como hoje). Se é teste e passa a régua de §2.3, a mesa responde
   numa linha só, na voz do Mestre, e pousa o dado:
   > **Sobrevivência.** Precisa de **14**. *Se falhar, a chuva apaga o rasto.*
   > [ d20 à espera ] · *mudar de ideia*
   A linha diz três coisas e só três: a perícia (o nome da ficha), o número a
   bater e o preço de falhar. A CD vem da tabela; o preço, da linha de
   `CUSTO_DE_FALHAR` do alvo.
3. **O toque.** Tocar no d20 (ou Enter, ou espaço) lança-o pela bandeja de
   sempre. O número assenta, o desfecho diz-se (`NOME_DO_DESFECHO`), e só então
   o turno segue para o Narrador, com o envelope de hoje.
4. **A narração.** Chega com o resultado já visto. O Narrador conta o que o
   dado decidiu; não decide nada.

### 2.2 A saída para quem tem pressa

- **«O Mestre rola por mim»** (preferência local, `taverna_cfg_*`, ao lado de
  `taverna_cfg_rolagens`): o chamado aparece igual, e o dado lança-se sozinho
  ao fim de um tempo de tabela (`O_CHAMADO.esperaSozinho`), o bastante para
  ler a linha. O chamado nunca é saltado: é o veredito antes do clique.
- **«Mudar de ideia»**: a frase volta à caixa, nada aconteceu, nenhum minuto
  passou, nenhuma tentativa ficou registada. Ver o preço e recuar é a lei a
  funcionar, não uma fuga.
- **Nunca custa o turno.** Se o chamado estoura (`calou`), o teste rola como
  hoje, sem espera.

### 2.3 Quando o Mestre NÃO chama — a régua contra o dado-ritual

O Matt pede dado onde falhar e passar dão mundos diferentes. A tabela
`QUANDO_O_MESTRE_CHAMA` diz quando não:

| não chama quando | porque | o que acontece em vez |
|---|---|---|
| o catálogo diz `livre` ou a CD é trivial | não há obstáculo | narra-se acontecendo (como hoje) |
| o bónus torna o resultado certo (`testes.js:199`) | o acaso não importa | sucesso ou falha automáticos, ditos na linha |
| o mundo respondeu NÃO antes do dado — **depois de ler o passo** (§1.4) | não se rola contra o que não existe | o envelope do vazio, uma frase |
| o lugar já foi revirado do mesmo jeito | repetir não é nova chance | o «já revirei» de hoje |
| a mesa está em luta | a luta tem o seu d20 e a sua previsão | o tabuleiro |
| é conversa | conversa não se rola; ler quem fala, sim | o turno normal |

E a **oferta** (o Mestre pede sem a frase) passa a ter a mesma régua: só onde
há o que achar (um achável, o segredo do passo) ou, num lugar vazio, **uma vez
em N** por sorte semeada (`O_MESTRE_PEDE.vazioUmEm`), nunca duas vazias
seguidas, e com chave **própria**: a oferta que dá vazio não fecha os verbos do
jogador (examinar, investigar, lembrar). A uma em N existe para que a oferta
não denuncie o segredo — se só aparecesse onde há, aparecer seria a resposta.

### 2.4 O sucesso dá sempre um facto

Passar compra uma verdade do sistema, nunca uma invenção. `oFactoDoSucesso`
procura, por ordem de tabela (`FACTO_DO_SUCESSO`):

1. **o passo ativo** — se este lugar ou esta pessoa é o do passo, a pista que
   o passo planta (§MC5);
2. **o achável** — o segredo do prédio ou o baú do ermo (`achavelAqui`, com a
   régua de onde se procura que já existe);
3. **o livro de factos** — quem esteve aqui, quem caiu aqui, o favor devido;
4. **o registo do lugar** — o que a base sabe dele (dono, quem o frequenta, o
   rumor);
5. para **Saberes**: a ficha do bestiário (os sinais, `SINAIS_DO_BESTIARIO`,
   da CB2) ou do lugar.

O envelope do teste leva o facto escrito e deixa de pedir *«revele UMA coisa
concreta»*. A busca vazia (*«aqui não há nada»*) fica só para quando nenhuma
das cinco fontes tem nada, e aí é ela própria o facto.

### 2.5 A falha tem preço, dito antes

O preço do chamado é o que `desfechoDaFalha` cobra depois — **o mesmo efeito,
a mesma linha**. Cada linha de `CUSTO_DE_FALHAR` ganha um `aviso` curto (≤ 60
caracteres) e uma etiqueta de `efeito` (tempo, barulho, pele, perde o rasto,
alerta alguém, fecha a via); o aviso escolhe a variante pelo contexto
(chuva, noite, cidade) e a suíte prova que o efeito avisado é o cobrado.
**A falha que morde rola o dado da mordida à vista** (`MORDIDA_POR_DEGRAU`,
`desafios.js:2297`: 1d4 no comum, mais no difícil) — são os «dados
diferentes» da ordem de 04/11 sem regra nova.

### 2.6 O número não denuncia o segredo

Hoje, quando há achado, a CD vem dele e a etiqueta diz *«há algo escondido
aqui, e esta é a dificuldade dele»* (`desafios.js:1709-1710`). Se o chamado
mostrar isso, o número conta o segredo antes do dado. Regra: **a CD de uma
busca com e sem achado sai da mesma tabela (a dureza do lugar), e a linha do
chamado é igual nos dois casos.** O achado só decide o que o sucesso dá.

---

## 3 · As tabelas

Todo número desta fase sai de uma tabela nomeada que a suíte lê de volta.

### 3.1 A perícia pelo verbo — o catálogo (`DESAFIOS`), ampliado

| a frase | hoje | depois | onde |
|---|---|---|---|
| sigo o rasto · as marcas · as pegadas · por onde foi | null / só «rastro» | `rastrear` · Sobrevivência | rx de `:582` |
| examino o corte · a ferida · a marca · a carcaça · o vestígio | `buscar` · Percepção (queimado) | `investigar` · Investigação, chave própria | rx de `:376`, `naoSe` em `buscar` |
| lembro · o que sei de/sobre ‹lugar · gente · bicho› | null ou «criatura» | `lembrar` · Saberes, alvo pelo nome (lugar → base/livro; bicho → bestiário) | desafio novo, mesmo formato |
| cuido das feridas · torniquete · enfaixo · pressiono a ferida · socorro ‹alguém› | null | `estancar` · Medicina, **com quem** (a pessoa caída) | rx de `:591` |
| arrebento · rompo · parto · forço as amarras/cordas/raízes | improviso (rola) ou `naoSePede` | `escapar` · Atletismo (ou Acrobacia, «me contorço») | rx de `:679` |
| rolo de lado · enrolo · controlo · «com toda a força» | `naoSePede` | a frase lida como ação | `testes.js:61` e `:142`: fronteira de palavra e o objeto do pedido obrigatório («rolo **um teste**», não «rolo de lado») |

A catraca é a tabela inteira como suíte: cada linha, frase → desafio e
perícia. As frases da sessão 18 são as primeiras.

### 3.2 A CD pela situação — `DIFICULDADES` (`desafios.js:216`) e `SITUACAO_DA_CD`

A régua de degraus existe (trivial 5 · fácil 10 · comum 13 · incomum 15 ·
difícil 18 · árduo 21 · heroico 25). Nasce `SITUACAO_DA_CD`, com `{ quando,
delta, diz }`, e o `diz` entra no chamado quando pesa:

| quando | delta | diz |
|---|---:|---|
| em luta, num desafio que não é de luta | +3 | «no meio da luta» — **hoje é número solto** (`desafios.js:1723`) |
| chuva, no rasto | tabela | «a chuva de ontem» |
| noite, sem luz, na busca e no rasto | tabela | «no escuro» |
| com tempo, com ferramenta, com ajuda | os de `bonusDoQueMudou` | o que a frase disse (`RX_TEMPO`, `RX_FERRAMENTA`, `RX_AJUDA`, `:1319-1321`) |
| o passo ativo pede isto aqui | a CD do passo | nada (a CD não conta que é o passo) |

Os deltas novos sobem com a régua a medir (MC2): a taxa de sucesso por degrau
não pode cair abaixo da de hoje com o herói do nível 1.

### 3.3 O preço de falhar — `CUSTO_DE_FALHAR` (`desafios.js:1885`), com `aviso` e `efeito`

Medido (`md/cobertura.mjs`): 32 desafios, 32 alvos, 33 linhas de custo; **os
27 alvos não sociais têm todos linha**. Os cinco sociais (persuasão, segredo,
impressão, intimidação, enganação) têm a consequência noutra mesa
(`social.js`); a MC2 decide se o aviso deles sai de lá ou nasce aqui. Cada
linha ganha:

| campo | o que é | a prova |
|---|---|---|
| `aviso` | a frase do chamado, «Se falhar, …», ≤ 60 caracteres, com variantes por contexto | todo alvo com chamado tem aviso |
| `efeito` | a etiqueta do que se cobra: `tempo`, `barulho`, `pele`, `perde`, `alerta`, `fecha` | o efeito avisado = o que `desfechoDaFalha` cobra, em 10 000 rolagens semeadas |

### 3.4 As tabelas do momento

- `O_CHAMADO` — a linha (o molde «{Pericia}. Precisa de {CD}. {aviso}»), o
  glifo, os rótulos («mudar de ideia»), `esperaSozinho` (ms).
- `QUANDO_O_MESTRE_CHAMA` — a régua de §2.3.
- `O_MESTRE_PEDE.vazioUmEm` — a oferta em lugar vazio, uma em N.
- `FACTO_DO_SUCESSO` — as fontes de §2.4, por alvo e por ordem.
- `SAIDAS_DO_CATIVEIRO` — as portas de saída (amarras · guarda · esperar
  quem está fora · pagar), cada uma com a perícia, a CD pelo captor e o preço.
- `O_PASSO_NO_ORACULO` — como o passo ativo pesa nas perguntas do sistema
  (`haRastro` no lugar do passo de rasto; `haOQueOuvir` onde o passo manda
  escutar): o mundo não desmente a quest.

---

## 4 · O que vai pela pauta dinâmica

**Nenhum bloco estático.** O teto de prompt é sagrado.

- **O chamado não vai ao Narrador.** Resolve-se antes da chamada; o Narrador
  recebe o envelope do teste de hoje, um por turno.
- **O facto do sucesso entra no envelope do teste**, no lugar da frase
  genérica de `testes.js:206` (+≤ 200 caracteres). Nos lugares do passo sai o
  envelope de busca vazia (~700). Líquido ≤ 0 no pior caso — medido.
- **O passo ativo já vai na pauta** (`aMesaDasQuests`, `passo`). O que muda é
  que as regras o lêem: zero caracteres.
- **O veto do epíteto sai** de todas as pautas, exceto quando ele ou um servo
  está em cena: a pauta **encolhe** ~140 caracteres na maioria dos turnos da
  cidade da quest.
- **O cativeiro**: enquanto o estado vive, uma linha em `onde` (prio 1: «de
  mãos atadas em X, guardado por Y», ≤ 120) e um `naoPode` («soltar-me, dar-me
  chave ou arma, ou tirar-me daqui sem que o sistema o diga»). Só nesses
  turnos.
- **O veredito de perigo**: nada novo; o Narrador já recebe
  `envelopeDaDificuldade` à entrada.

A prova: a régua do pior caso (~82k) não cresce, em cada etapa que toca a
pauta.

---

## 5 · As etapas da Fase MC

Cada etapa no padrão da casa: **módulo puro → fiação defensiva → suíte**.
Quem faz: **B** `backend` (motor), **O** `oficial` (App.jsx, com o bastão),
**A** `aprendiz` (fora do App), **D** `desenho` (a peça, no Figma antes do
código), **J** `jogo` (o momento, e a sessão jogada). Por ordem de retorno — o
dado na frase primeiro.

| etapa | o quê | quem | a prova |
|---|---|---|---|
| **MC1** · o catálogo ouve a frase | a tabela de §3.1: o rasto, examinar → investigar (chave própria), `lembrar` (Saberes de lugar, gente e bicho), estancar com quem, arrebentar as amarras; o detector de pedido com fronteira de palavra e objeto obrigatório (`testes.js:61`, `:142`). | B | `teste-a-frase-que-rola.mjs`: as frases da sessão 18 (§1.2) viram o teste certo, com a perícia certa; «Rolo de lado e forço…» deixa de ser `naoSePede`; «peço um teste de Força» continua a sê-lo; o catálogo e as suítes de hoje ficam verdes. |
| **MC2** · o chamado, o módulo | `src/motor/o-mestre-chama.js`: `oChamado(v, ctx)` → `null` ou `{ pericia, dc, aviso, efeito, dado, chave }`; `O_CHAMADO`, `QUANDO_O_MESTRE_CHAMA`; `aviso` e `efeito` em `CUSTO_DE_FALHAR`; `SITUACAO_DA_CD` (o +3 solto entra nela). | B | `teste-o-mestre-chama.mjs`: todo alvo com chamado tem aviso; o efeito avisado é o cobrado (10 000 rolagens); a CD e a linha de uma busca com e sem achado são indistinguíveis (§2.6); não chama em livre, trivial, automático, luta, conversa; mesma semente = mesmo chamado. A régua de sucesso por degrau não cai. |
| **MC3** · o chamado na mesa | a peça `ChamadoDoMestre` (a linha, o d20 à espera, «mudar de ideia») no Figma; a fiação: o teste da frase pára antes do lançamento (ref, não save), o toque lança pela bandeja de sempre, a preferência «o Mestre rola por mim», `calou` = rola como hoje. | D → O (+A na peça) | `teste-chamado-fiacao.mjs` (lê o App por âncora: o resolver do teste não lança sem toque ou preferência; com erro, lança); jogado: frase → chamado → toque → narração, a 375 e a 1905; movimento reduzido; «mudar de ideia» não regista tentativa nem passa tempo. |
| **MC4** · o sucesso dá um facto | `oFactoDoSucesso` e `FACTO_DO_SUCESSO`; o envelope do teste leva o facto (adeus ao «revele UMA coisa», `testes.js:206`). | B | `teste-facto-do-sucesso.mjs`: em 1000 mundos, ≥ 95% dos sucessos de busca, investigação, rasto e saberes trazem facto **com fonte**; nunca de outro prédio (`procuravelAqui`); a busca vazia só quando nenhuma fonte; o pior caso do prompt não cresce. |
| **MC5** · a quest manda | o passo planta: `descobriu X` põe o segredo do passo achável em X, e a busca que o acha escreve `descobriu` no livro (porta do sistema, não do Cronista); `perguntarOportunidade` lê o passo (`O_PASSO_NO_ORACULO`): no lugar do passo de rasto, há rasto. | B → O | `teste-a-quest-manda.mjs`: em todas as quests do catálogo com etapa `descobriu` ou de rasto, a busca no lugar acha, o oráculo não diz NÃO ao que o passo pede, e o passo fica ✓ sem o Cronista. |
| **MC6** · o Mestre pede onde há o que achar | `oQueOMestrePede` pergunta se há (achável, passo, ou uma em N semeada); a chave da oferta é própria; a oferta vazia não fecha os verbos do jogador. | B → O | `teste-o-mestre-pede.mjs` cresce: em 1000 lugares, ofertas em lugar vazio ≤ 1/N e nunca duas seguidas; depois de uma oferta vazia, «examino o corte» e «lembro» ainda rolam (a prova de `md/queimado.mjs` invertida). |
| **MC7** · o epíteto só na boca dele | `oVilaoNaPauta` emite o veto do nome só com ele ou um servo presente; a alcunha nunca nomeia a cidade onde o herói está (a terra de onde veio, ou «o forasteiro»). | B | `teste-plano-do-vilao.mjs` cresce: na cidade da quest sem servo, `naoPode` sem alcunha; com servo, com; a alcunha ≠ cidade atual em 1000 mundos. Medido: a fração de pautas com a alcunha numa sessão simulada (hoje: todas as da cidade da quest). |
| **MC8** · o veredito antes de partir | `vereditoDaPartida` lê `avaliar` para destino com nível: o patamar relativo e o porquê no cartão da partida e no selo do mapa; a proposta de masmorra (`a-proposta-da-frase.js:267`) leva a linha do veredito. | B → A (o painel do mapa) + O (a proposta) | `teste-veredito-da-partida.mjs` cresce: para o mesmo herói e o mesmo lugar, o patamar do mapa é o da boca (uma régua só); nenhuma proposta de masmorra sem veredito. |
| **MC9** · o cativeiro como estado | `src/cativeiro.js`: `abrirCativeiro`, `SAIDAS_DO_CATIVEIRO`, `oCativeiroNaPauta`; campo novo `cativeiro` (aditivo). Fiação: `prisioneiros` abre o estado; a masmorra esconde «sair» enquanto preso; o catálogo (`escapar`) lê a CD do captor e o chamado mostra-a; o sucesso fecha o estado. | B → O | `teste-cativeiro.mjs`: todo desfecho `prisioneiros` abre estado; nenhuma saída sem preço; o `naoPode` vai à pauta enquanto dura; mesma semente = mesmo cativeiro; save antigo abre sem o campo. |
| **MC10** · socorrer quem caiu | `estancar` com quem: o sucesso estabiliza o companheiro a 0 PV (estado que a luta já conheça, se existir), a falha tem o preço da linha `medicina`. **Primeiro passo: achar o estado do companheiro caído** — eu não o achei. | B → O | suíte do socorro: estabilizar muda o estado; sem pessoa caída, não há chamado. |
| **MC11** · a régua medida | `medir-dados.mjs` (o corpus das frases de fora da luta das sessões 12–18, pelo catálogo e pela régua) e a **19.ª sessão de prova** com IA real. | J (+ `testes` no medidor) | 1 dado a cada 2–3 turnos fora da luta; ≥ 5 perícias diferentes; 0 sucessos vazios no lugar do passo; alcunha só com servo; quantos «mudar de ideia»; o custo por resposta não sobe. |

**A ordem:** MC1 → MC2 → MC3 (o dado na frase: o que a pessoa aprovou) ·
MC4 → MC5 → MC6 (a busca que encontra e a quest que manda) · MC7 (barato; pode
correr ao lado de MC2, outro arquivo, desde que só dois agentes no ar) · MC8 →
MC9 (a luta honesta) · MC10 · MC11 fecha.

**O Figma antes do código:** MC3 (`ChamadoDoMestre`, o d20 à espera) e MC8 (o
patamar no cartão da partida e no selo). O `desenho` fabrica a peça; o `jogo`
compõe o momento, com o tempo declarado (quanto o dado espera, como assenta).

**O que se prova em toda a etapa de tela:** o chamado respeita
`prefers-reduced-motion` e tem saída; o controle existe numa forma só
(`mente/formas.md`); o teto de prompt não cresce; nada custa o turno
(`calou(...)` em toda a fiação nova); o sistema não fala de si (nada de
«oráculo», «CD», «chance» na tela — a linha diz *precisa de 14*, a palavra da
pessoa).

---

## 6 · A proposta ambiciosa — *a inspiração do Mestre*

**O que mudaria.** Quando o jogador joga o herói — o orgulho do Goliath que
não pede ajuda, o soldado reformado que reconhece a formação inimiga, o
ferreiro que olha para a lâmina antes de olhar para quem a traz —, o Mestre dá
uma **inspiração**: uma peça na mesa, ao lado dos recursos, uma de cada vez.
Gastá-la é dizer, no chamado, *«com tudo o que tenho»*: lançam-se **dois d20
e fica o melhor**, os dois à vista. É o gesto que define a mesa do Matt — a
recompensa por interpretar —, e dá ao dado uma decisão antes do toque, que é
o que ainda falta ao chamado: hoje o jogador só pode rolar ou recuar.

**Porque é a que faria o jogo ser lembrado.** Liga a ficha (raça, classe,
ofício, antecedente) à ficção e à sorte num só objeto. Ensina o jogador a
escrever o herói em vez de escrever comandos, e paga-o com um dado que ele
escolheu gastar.

**O custo e a prova.** Motor médio: os gatilhos são tabela (`INSPIRACAO_DO_MESTRE`:
o traço da ficha × o verbo da frase, julgado pelo catálogo, nunca pela IA), no
máximo uma guardada, ritmo medido (uma por hora de jogo). Tela média: a peça e
os dois d20 na bandeja. Save: campo novo, aditivo. Provável: os gatilhos por
suíte, o ritmo pela régua de MC11. **O que não sei:** se a ficha guarda hoje
um traço de personalidade legível por tabela além de raça, classe, ofício e
antecedente; se não, os gatilhos nascem só destes quatro.

---

## 7 · Para a pessoa decidir (no máximo duas)

1. **O ritmo: o Mestre completa a régua quando a frase não pede?** A régua dela
   é um dado a cada dois ou três turnos. Com esta fase o dado nasce da frase e
   da oferta honesta; um jogador que só conversa pode ficar abaixo da régua.
   **(a)** A régua é medida e não forçada: se a 19.ª sessão ficar abaixo de
   1 em 3, abre-se uma etapa para isso. **(b)** O Mestre completa-a: passados
   três turnos sem dado, pede um (a oferta, uma salvaguarda do ambiente), mesmo
   em lugar vazio — cumpre o número e arrisca o ritual que a sessão 18 mostrou.
   A minha escolha é **(a)**: a sessão 18 provou que o número sem sentido é
   pior do que menos dados com sentido.
2. **A inspiração (§6) entra nesta fase?** É a peça que dá ao chamado uma
   decisão, e mexe na economia da sorte (dois d20 é muito no nível 1). A minha
   proposta: fechar MC1–MC6, jogar a 19.ª sessão, e decidir com o chamado na
   mão.
