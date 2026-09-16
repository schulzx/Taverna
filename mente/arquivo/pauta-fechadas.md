# Fases fechadas — mente/pauta.md

O texto inteiro das fases que já terminaram. Sai da pauta para a mente
não o reler a cada ciclo; fica aqui porque é a prova de como se chegou
aqui, e o diário aponta para ele.


### Fase X — o botão age (o jogador dispara o próprio combate)
Decisão da pessoa (15/09): começar por aqui, antes de balancear e antes da
Fase N. **E a premissa que a levou a decidir foi corrigida no código:** o
modo rápido **já é 1×1** (`arena.js` luta com `grupo: [eu]`, o pronto nasce
com `grupo: []`) e é o único combate do projeto com equilíbrio provado
(35–65%, amplitude 12,7). O desequilíbrio de 1,4% é de **Uma Vida**. A
pessoa decidiu também que **o grupo fica** na campanha: a causa medida não
é ele.

**O achado que põe esta fase na frente de tudo** (`jogo`, jogando, em D5):
dos 20 botões do painel de Ações, os 8 que entram direto no motor são
Vasculhar, Escutar, Lembrar… e **nenhum é de combate**. `Atacar` não ataca:
ele **digita `"Ataco "` na caixa de texto**. Três ataques declarados sem
ambiguidade num combate aberto deram **zero rolagens**, e 7 turnos fecharam
com os mesmos PV 20/20, PM 6/6, XP 89/300.

> A lei da casa está invertida no pior lugar: *o Mestre é código, e a IA só
> narra* — mas **quem decide se o golpe aconteceu é a IA**.

Por isso balancear antes seria afinar um instrumento que o jogador não
consegue tocar: a régua mede o motor, e o jogador não chega nele.

- [x] **X1 · o que chega ao motor, e o que vira frase** · de: pessoa · 15/09
  · **feito 15/09 · v9.253 · commit `bf9dd49`** — medido sem mexer em nenhuma
  regra, e a régua ficou:
  `testes/acoes-do-jogador.mjs` (a tabela), `teste-` e `check-` do mesmo
  nome (a catraca) e `testes/sonda-turno-esteril.mjs` (a régua que X4
  repete). **O 7 em 7 se reproduz, e a causa não era a que a fase supunha.**

  **A conta:** 20 botões no painel — 12 `ACOES_PRONTAS` que só fazem
  `setEntrada` (`App.jsx:20564`) e 8 `ACOES_RAPIDAS` que entram no motor
  (`:20593` → `declararAcaoRapida` → `adjudicarAcao`), **nenhuma das 20 de
  combate**. Fora do painel, só **mover no grid** e **beber da bolsa**
  chegam ao motor por clique. Dos 6 literais mortos das 12, **4 são ações
  de combate** (Esquivar, Empurrar, Derrubar, Correr). `habilidades.js`
  expõe 37 funções e **zero** têm chamador por clique; **21 funções dos três
  módulos não têm um único uso no corpo do `App.jsx`** (mais 16 tabelas na
  mesma situação). Dessas 21, a tabela separa o que é dívida do que não é:
  **3** o App importa e nunca chama (`semClique`, todas de `combate.js`), 12 só
  o próprio módulo chama (`soInterno`, que é encapsulamento e não dívida) e
  **1 é morta de verdade** — `gastarRecurso` (`src/combate.js:745`), **sem
  chamador em lugar nenhum do repositório**, e ainda assim aprovada pela
  catraca, porque a linha de `import` contou como leitor.

  **O achado central, que a fase não tinha:** o botão não é a única trava,
  nem a principal. `resolverAtaqueJogador` **existe e é bom**; o golpe morre
  antes, na geometria — `posicionar` (`src/grid.js:551-576`) abre a luta a
  **12,0 m (taverna) a 25,5 m (masmorra)**, o corpo a corpo alcança **1,5
  m**, e **10/10 plantas recusam no turno 1**. Pior: `semAlcance` recusa
  **de graça** (`App.jsx:11613-11617` → `:13218-13225`), sem gastar a ação —
  logo `resolverRevide` (`:14034-14038`) nunca roda e **a rodada nunca
  vira**. O jogador ataca sete vezes, o sistema recusa sete vezes, e nada
  se move: PV 20/20, PM 6/6, XP 89/300. São **2–3 turnos só andando** antes
  que qualquer golpe corpo a corpo possa rolar.

  **Duas honestidades que a medição obriga:** (a) a recusa **não é muda** —
  o jogador recebe a linha 📏 com a distância de cada inimigo e um *"Aproxime-se
  primeiro"* (`App.jsx:11616`); o turno é estéril, não silencioso, e a diferença
  importa para X2. (b) **A armadilha é sobretudo do corpo a corpo:** arma de
  longe alcança 36 m (`App.jsx:11609`), acima de todas as aberturas. A taxa
  medida é de um herói corpo a corpo nível 3, e X4 tem de repetir a mesma
  política para comparar.

  **Conferido pelo orquestrador, direto no motor** (`montarGrade` + `posicionar`
  + `alcanca`, as 10 plantas, 1 inimigo não-ágil): abertura de **12,0 m
  (taverna) a 25,5 m (masmorra)**, e **10/10 fora do alcance de 1,5 m no turno
  1** — o achado se sustenta, número a número. E um detalhe que refina (b): a
  **36 m, 3 das 10 plantas continuam recusando** — **taverna, caverna e
  navio**, por parede no caminho. Então nem o arco resolve sozinho, e X2 **não
  pode tratar "tem alcance" como sinônimo de "pode acertar"**: quem decide é
  `alcanca`, que também olha a parede.

  **Uma armadilha de medição, para X4 não cair nela:** `montarGrade({ planta })`
  **não** monta a planta pedida — `cenarioDe(ctx)` (`src/grid.js:286`) lê outras
  chaves e cai em `estrada` em silêncio. Na primeira conferência isto trocou a
  masmorra pela estrada e encurtou a abertura de 25,5 para 16,5 m sem um aviso
  sequer. Quem medir grade tem de **conferir a largura×altura que recebeu**.
- [x] **X2 · o golpe sai do botão** · de: pessoa · 15/09 · **reescrita por X1**
  · **feito 15/09 · v9.255 · commit `fc86e53`** — o pré-requisito garantido e
  mostrado, e a porta única do motor. **`Atacar`, com a luta aberta, ataca**:
  monta a frase canônica por `fraseDoGolpe`, passa pela porta única
  `declararGolpe` (`App.jsx:11851`), o módulo puro `src/golpe.js` decide antes de
  qualquer efeito, a frase entra no log depois de aceita e o turno se cobra —
  o molde dos 8, sem um segundo molde. A extração `aplicarGolpeDoJogador`
  (`:11749`) tem **dois chamadores e nenhum terceiro**: o teclado e o botão
  resolvem pelo **mesmo** código.
  **O alcance antes do clique, conferido vivo na campanha real:** com Halvard a
  3 m e alcance de 1,5 m, o botão vem `disabled` e a linha lê **"Longe demais —
  Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."** — o número bate com o que
  `vereditoDoGolpe` prevê em Node, casa a casa. As duas recusas são distintas:
  *longe demais* e *há parede no caminho* (andar resolve uma e não resolve a outra).
  **A catraca desceu: `TETO_SEM_MOTOR` 7 → 6**, com `pronta_atacar` fora da lista
  e as três asserções do bloco 1 invertidas, cada uma com o motivo escrito ao lado.
  **O `36` e o "+ um quadrado" saíram do meio do `App.jsx` para `ALCANCES`** — os
  mesmos números, agora em tabela que a suíte lê de volta. **Nada foi rebalanceado.**
  **As duas bifurcações foram para "Para a pessoa decidir"**, com proposta e
  porquê, e não foram decididas aqui.
  **O que X2 NÃO fez, e é honesto dizer:** não encurtou a caminhada — continuam
  **2 a 3 turnos andando** antes do primeiro golpe corpo a corpo. Ela tornou a
  caminhada **visível antes do clique**, que é outra coisa.

<details>
<summary>a redação de X2 como X1 a deixou</summary>

  A redação anterior dizia "as ações de combate passam a chamar o motor,
  e o dado rola porque o jogador clicou". **A medição corrigiu o alvo:** o
  caminho até `resolverAtaque` já existe e não precisa ser inventado — o
  que falta é **garantir o pré-requisito antes do clique**. Então X2 é:
  um controle de combate que só oferece o que é alcançável, que **mostra a
  distância e o alcance** (o veredito antes do clique, a lei inteira) e que
  chama o motor pelo molde dos 8 — id vira frase canônica, porta única com
  direito de recusar, módulo puro decide antes do efeito, o par de `pushMsgs`
  no fim, e a cobrança do turno explícita. Dois precedentes prontos dentro
  de casa, além dos 8: **mover no grid** e **a bolsa**.
  **Precisa do bastão do `App.jsx`.** A forma vem de `mente/formas.md` e da
  mesa — não se inventa botão aqui; o que falta de forma, pede-se (a Fase E
  do desenho está desenhando a tela de batalha agora). O texto livre continua
  existindo para tudo que não é golpe.
  **Duas bifurcações que X1 abriu e que são da pessoa, não do ciclo:**
  (a) **`semAlcance` é de graça** — se X2 passar a cobrar a ação de um golpe
  fora de alcance, o jogador que erra o alvo perde o turno, e isso muda o que
  ele vive; se continuar de graça, o botão tem de impedir o clique em vez de
  recusá-lo. (b) **Defender/Esquivar não existe no motor** — o botão escreve
  uma frase que ninguém lê; dar-lhe mecânica é mecânica nova, logo `pesado`.

</details>
- [x] **X3 · o turno guardado** · de: pessoa · 15/09 · **feito 15/09 · v9.257
  · dentro do commit `e430a12`** — o commit e da OUTRA mente e nao menciona
  nada disto: levou o X3 junto pelo indice compartilhado, no intervalo entre
  o `git add` e o `git commit`. O porque e o conserto estao no diario.
  **O coração da decisão, e vale sozinho mesmo que o resto não venha.** Se o
  motor chegou a rolar, o resultado **não se descarta**: fica guardado, e o
  Mestre narra quando voltar. O jogador não redigita, não re-rola, não perde
  o momento.
  **Por quê:** o defeito de hoje não é ficar sem prosa — é **a ação ser
  jogada fora**. E há uma razão mais dura: se o turno re-rola na tentativa
  seguinte, uma queda do Narrador vira **re-rolagem de um resultado ruim**.
  Guardar fecha essa porta. Determinismo por semente manda aqui: o guardado é
  o que aconteceu, não uma promessa de repetir.
  Junto vem o travar-bem que a pessoa já aprovou: a ação escrita não se
  perde, o jogo diz o que houve em voz de mundo e oferece tentar de novo, o
  motivo técnico vai **íntegro ao `console`** (foi o vazamento que permitiu
  diagnosticar as duas quedas desta sessão), e **nada fica pela metade**.
- [x] **X3b · o que a voz da casa cobre** · de: pessoa · 15/09 · **feito 16/09
  · v9.260** — retrato, nenhuma linha de produção escrita. **A medição encolheu
  a proposta, que era o resultado bom: X3c está CANCELADA (a razão abaixo).**

  **A cobertura, por tipo de evento.** Duas varreduras cruzadas: a oferta
  (`arena.js` e todo módulo puro com prosa de combate) e a demanda (o caminho
  de combate do `App.jsx`, de `declararGolpe` a `fecharSeTodosCairam`).

  | evento | a arena tem linha? | serve à campanha? | a campanha já tem? |
  |---|---|---|---|
  | 1 golpe que acerta | sim (`arena.js:255`) | **sim** | telegrama (`App.jsx:11914`) |
  | 2 golpe que erra | sim (`:293`) | **sim** | uma palavra ("errou") |
  | 3 crítico | sim (troca de palavra) | **sim** | prefixo "CRÍTICO!" |
  | 4 guarda erguida | sim (`:191`) | sim, mas **empresta** | **já usa a boa** (`habilidades.js:356`) |
  | 5 efeito que nasce | sim (`:216`) | **rala** — molde reflexivo | telegrama (`App.jsx:7978`) |
  | 6 efeito que vence | **emprestada** (`:362`) | sim, mas empresta | **já usa a mesma** (`regras-jogo.js:374`) |
  | 7 condição aplicada | **não** (zera `condicoes`, `:123`) | — | frase (`aflicoes.js:145`) |
  | 8 salvaguarda | **não** | — | parcial: a que passa fala, **a que falha é muda** |
  | 9 queda | **não** (sai do laço, `:345`) | — | herói sim, **companheiro em silêncio** |
  | 10 morte | **não** (devolve uma letra) | — | herói sim, inimigo é um `☠` |
  | 11 cura | sim (`:153`) | **rala** — reflexiva | telegrama (`App.jsx:14144`) |
  | 12 chegada de inimigo | **não** (1×1 não tem) | — | frase (`regras-jogo.js:393`) |
  | 13 reviravolta | **não** | — | virada de chefe (`masmorras.js:724`) |
  | 14 fim de luta | **não** (sem frase) | — | frase (`App.jsx:13744`) |

  **O número, e ele é o veredito.** A arena tem linha escrita em **10 dos 14**.
  Mas **molde reusável em campanha que a campanha ainda não tem: 3 de 14
  (21%)** — golpe que acerta, que erra e o crítico, que na verdade são **um
  molde só**, o do golpe. E **dos 5 que esta etapa perguntou por nome**
  (condição, queda, morte, reviravolta, chegada): **0 de 5.**

  **A razão é estrutural, e é o achado que fecha a fase.** A voz da arena não
  é uma fonte independente: dos 8 moldes que ela escreve, 2 são reflexivos
  (`se recompõe`, `firma`) e não sabem nomear um terceiro — e o caso normal da
  campanha é **grupo**; os outros 5 ela **empresta** de módulos da campanha
  (`tickEfeitos`, `expirarGuardas`, `absorverDano`, `testeConcentracao`,
  `firmarEfeito`) — e o `App.jsx` **já empurra exatamente os mesmos**. O
  empréstimo só existe onde a campanha já tinha escrito. **A cobertura da
  arena não é um retrato do que o duelo sabe: é o retrato da campanha,
  devolvido.**

  **A honestidade contrária, dita de propósito:** o golpe é o evento mais
  frequente do combate (3 a 6 por rodada), então em **volume de linhas** a
  cobertura não é 21%. Só que o golpe **já tem string no `App.jsx`** — trocar
  telegrama por frase é reescrever uma linha que existe, não é "o turno se
  completa quando o Mestre cala". É outra etapa, menor, e de forma.

  **Se o Mestre calasse hoje**, o jogador leria a contabilidade inteira e
  correta da luta, e leria frase de mesa só quando algo **muda de estado**
  (uma guarda que sobe, uma condição que pega, um efeito que se dissipa, ele
  mesmo caindo). A cena sobreviveria como extrato bancário; a luta, não.

- [x] **X3c · em combate, o turno se completa** · **CANCELADA 16/09 por X3b** ·
  de: pessoa · 15/09
  **A razão, em uma linha: a etapa se proibia de inventar prosa nova, e a
  medição diz que ela teria de inventar 11 das 14.** X3c prometia completar o
  turno *"reusando o que o Torneio e o Duelo já usam todo dia, **sem inventar
  uma linha de prosa nova**"*. O reuso disponível é de **um molde** (o do
  golpe), e ele já tem string. Nos 5 eventos que a pessoa nomeou a arena
  cobre **zero**. Cumprir a promessa seria escrever prosa nova sob o nome de
  reuso — e isso é o código fingindo ser a IA, que é o próprio limite que
  esta etapa escreveu para si.
  **A Fase X fecha em X4.** O que X3c queria de verdade não morre: virou
  itens próprios em "Aberto" (o telegrama do golpe e os quatro silêncios),
  cada um do tamanho que tem, e nenhum vestido de reuso.
  **O limite que era lei desta etapa continua valendo e não foi tocado:**
  isto valia **só em combate**; fora dele a prosa **é** o conteúdo e ali
  trava, como a pessoa decidiu.

- [x] **X4 · a conta do que mudou** · de: pessoa · 15/09 · **feito 16/09 ·
  v9.263** — medição, nenhuma linha de produção. **A FASE X FECHA AQUI.**
  *(Este bloco foi escrito por X4 e publicado dentro do commit `63e0667`, que é
  de W1 e da outra mente, pelo índice compartilhado — ver a nota no diário.)*

  **A resposta, e ela é um "não mudou" honesto.** Mesma política fixa de X1
  (estrada, 1 inimigo, herói corpo a corpo nível 3, 7 turnos declarando
  "Ataco &lt;nome&gt;", nada mais): **7/7 estéreis, 0 rolagens, 0 revides —
  idêntico a 15/09.** E tinha de ser: X2 escreveu que **não** encurtou a
  caminhada, e a régua confirma a palavra dela. O que mudou é a sessão A′:
  os mesmos 7 turnos com o clique **impedido antes de ser gasto**, a
  distância e os metros que faltam ditos na tela. **Sete turnos perdidos
  viraram sete turnos que o jogo avisou que seriam perdidos.**

  **E a honestidade que fecha o eixo do número:** a sessão B (o jogador que
  anda) dá **2 turnos andando + 5 golpes, 0% estéril, 5 rolagens** — e já dava
  em X1. Andar sempre funcionou; é geometria, não botão. **Nenhum dos dois
  números é um ganho de X2, e dizer que é seria a conta mentindo a favor.**

  **O eixo novo de X3b, medido (sessão A″):** `taxa_esteril` **7/7 = 100%** ·
  `taxa_muda` **0/7 = 0%** · `taxa_sem_narracao` **7/7 = 100%**. As duas
  primeiras são taxas **opostas na mesma sessão**, e a distância entre elas é
  **inteira de recusa**: das 14 linhas dos 7 turnos, 7 são eco do jogador, 7
  são recusa e **0 são narração de evento** — com **0 chamadas ao Narrador**
  (o `return true` de `:11871` antecede o `enviar` de `:11932`). O alerta de
  X3b estava certo e agora tem número: sem separar a recusa, a medida daria
  0% de turnos mudos onde a resposta honesta é 100% sem narração.

  **O funil, e X3b errou os dois números para menos.** `pushMsgs` é
  `App.jsx:7499` (o endereço confere). No caminho de combate são **14 funções
  e 57 chamadas** — 11 de núcleo (mudas fora da luta, por ponto fixo sobre o
  grafo de chamadas) e 3 de borda —, não 13. **Frase de mesa 36 (63,2%) ·
  telegrama 12 (21,1%) · recusa 9 (15,8%)**, e **22 das 57 nascem fora do
  React**. As recusas à parte: **18 chamadas, 25 formas, 7 famílias**, não 15
  formas — e duas famílias que a pauta não nomeava (*conjuração travada*,
  *condição que prende*). A maior é `alcance`, com 6 chamadas e 13 formas.
  Pelo precedente de X1, **a medição mandou na pauta**.

  **A régua de B1: o que ela não pode, dito em vez de inventado.** Ela **não
  tem tabuleiro** — não importa `grid.js` nem `golpe.js`, passa `grade: null`
  ao motor (`regua-combate.mjs:887`), e `grid.js:422` abre com
  `if (!g) return { ok: true }`. O herói dela golpeia toda rodada sem
  perguntar se alcança. **Logo a linha de 1,4% nunca mediu "o motor sozinho":
  ela sempre pressupôs um jogador que age todo turno.** A régua é o **limite
  otimista, e o jogo real é pior que ela, não melhor.** Medir o preço real
  exige grade dentro da régua — simulador de tabuleiro, **órgão novo, logo
  pesado, logo da pessoa**: escrito como proposta em
  `TABULEIRO_NA_REGUA.paraMedir`, **não construído**.

  **O que a régua conseguiu medir, e liga X1 a B1 pela primeira vez:** o
  **preço da caminhada**. `rodadasDeCaminhada = k` cala o herói nas primeiras
  k rodadas; `k = 0` é o default e é byte a byte. No `justo` com
  `comAdversario: false` (4 famílias × 500 = 2000 sementes por degrau):

  | k | vitória | PV do grupo | quedas |
  |---|---|---|---|
  | 0 | 51,8% ± 2,2 | 25,90 | 1,785 |
  | 1 | 39,6% ± 2,1 | 18,78 | 2,087 |
  | 2 | 29,8% ± 2,0 | 12,86 | 2,332 |
  | 3 | 22,7% ± 1,8 | 8,85 | 2,503 |

  **Uma rodada de caminhada custa ~9,7 pontos de vitória**, −5,68 PV de grupo
  e +0,24 queda. Na moeda de B2 (a escada de `CATRACA_DE_UMA_VIDA`, medida no
  mesmo molde, ~2,9 pontos por ponto de dano): **um turno andando ≈ 3,3 pontos
  de dano por golpe — quase todo o teto de +4 que aquela escada aponta.** Os
  degraus não foram escolhidos: a suíte importa `DESLOCAMENTO_PADRAO` e
  `ALCANCES` e **refaz** o "2 a 3 turnos" de X1, e fica vermelha se o passo ou
  o alcance mudarem em `src/`.

  **Não medi no jogo de hoje (Adversário ligado), e medi a razão em vez de a
  afirmar:** o `justo` está em 1,4–1,8%, **saturado no piso**, e com k ≥ 1 a
  vitória cabe dentro da própria margem (0,4 ± 0,6 · 0,0 ± 0,6 · 0,0 ± 0,6) —
  indistinguível de zero. Um limiar em cima de um piso não mede nada.

  **O contrapeso que baixa o preço, e é achado novo:** `moverPara`
  (`App.jsx:14500-14568`) **nunca chama `fecharMeuTurno`** — o próprio sítio
  escreve *"o que fecha o turno é AGIR"*, e os 4 chamadores de `fecharMeuTurno`
  (`:11929`, `:13453`, `:13543`, `:13594`) não incluem o movimento. Somado ao
  `semAlcance` de graça que X1 mediu: **enquanto o herói anda, a oposição
  também não age.** Então o preço real da caminhada está **entre zero e os 9,7
  pontos**, e 9,7 é a ponta cara. Fica `pendente`, não vira limiar.

  **Os dois achados de mecânica quebrada de X3b: X4 não os tocou**, e diz o
  que descobriu sobre cada um. O **reforço sem `x`/`y` nem iniciativa** é
  invisível para a régua **por construção** — sem grade, `alcanca` devolve
  sempre `ok`, e um combatente sem posição não tem como doer ali. A **queda de
  companheiro em silêncio** X4 **confirma por ausência**: o funil tem linha
  para a queda do herói (`:14218`) e para treze eventos de companheiro
  (`:14061`–`:14260`), e **nenhuma** para o companheiro que chega a zero. Os
  dois continuam em "Aberto", `médio`, intactos.

<details>
<summary>a redação de X4 como a pessoa a escreveu</summary>

  Quantas rolagens por turno antes e depois; quantos turnos terminam sem um
  número mudar. E a régua de B1 refeita **com o jogador agindo** — porque a
  linha de base de 1,4% mediu o motor sozinho, e o jogador que enfim dispara
  o próprio golpe é uma variável que nunca esteve na conta.
  **X1 deixou a régua pronta e a linha de base cravada**, para os dois
  números serem comparáveis: `node testes/sonda-turno-esteril.mjs`, política
  fixa (combate aberto, planta "estrada", 1 inimigo não-ágil, herói corpo a
  corpo nível 3, 7 turnos declarando "Ataco &lt;nome&gt;", nada mais),
  `taxa_esteril = turnos_sem_delta / turnos_totais`. **Hoje: 7/7 estéreis,
  0 rolagens, 0 revides.** No espaço fechado das ações: 12/42 pares estéreis
  (28,6%), 6/22 dentro do combate (27,3%). "Número que muda" está definido em
  `TURNO_ESTERIL`, e o relógio de 45 min (`App.jsx:12959`) fica de fora de
  propósito — um número que muda sempre não distingue turno que fez de turno
  que não fez.
  **X4 é agora o fecho da fase (X3c foi cancelada por X3b, 16/09), e X3b lhe
  deixou duas coisas:** (a) **o mapa do funil** — `pushMsgs` é `App.jsx:7499`
  e treze funções o chamam dentro do combate; é por elas que se conta linha
  por turno sem adivinhar; (b) **um segundo eixo que a régua não tinha** —
  além de *"quantos turnos terminam sem um número mudar"*, dá para contar
  **quantos terminam sem uma frase**, e as duas taxas não são a mesma. E uma
  correção de escopo que X3b obriga: **a voz do combate que o código já tem é,
  em boa parte, a voz de dizer não** — X3b contou **15 formas de recusa** com
  frase em português no caminho de combate (alcance, economia, teto,
  repetição, a trava do turno guardado), volume comparável ao de todas as
  frases de evento juntas. Recusa **não é** narração de evento, e X4 tem de
  contá-las à parte para não inflar o próprio número.

</details>

**A FASE X ESTÁ FECHADA** (X1 · X2 · X3 · X3b · X4; X3c cancelada por X3b).
O antes-e-depois inteiro — inclusive o que o jogador **continua** não
conseguindo fazer — está no `mente/diario.md`, no bloco de X4.


### Fase T — o relógio das condições, no sistema de D&D
Decisão da pessoa (14/09), com a lei ditada por ela: *"vamos usar o sistema de
D&D: cura normal apenas recupera PV mas não remove a condição; daí vêm magias,
habilidades de classe, itens e os testes de resistência para alguns venenos —
tipo, teste de salvaguarda de Constituição exigido pelo veneno no final do
turno."*

O buraco que a fase fecha: **seis** sítios escrevem condição em `pers.grupo`
(`App.jsx` 5353, 7455, 7764, 7849, 7851, 8643) e **zero** a decrementam —
`tickCondicoes` só tem dois sítios, o herói (`:8169`) e os inimigos (`:8185`).
Desde a **v9.2**: o veneno do companheiro é eterno, e a condição boa que
`buffDeCompanheiro` aplica é vantagem permanente. Nos dois sentidos.

> **CORRIGIDO POR T1 (14/09), e vale para T2 · T3 · T4:** a medição desmentiu
> metade desse parágrafo. **O veneno do companheiro não existe e nunca existiu** —
> `aplicarCondicoesDosGolpes` (`:7606`) só processa `alvoRef === "jogador"`, então
> golpe de inimigo **nunca** afligiu companheiro. As condições que chegam ao grupo
> são **sete, todas `tipo: "bom"`**; a única ruim é `amedrontado` da presença, que
> já tinha saída. E os sítios vivos são **5, não 6**: o de `:7543` é código morto
> (os dois chamadores de `aplicarCondicaoEm` passam `"você"` cravado).
> As etapas seguintes herdam esta verdade: **hoje o companheiro não tem de que ser
> curado** — o que T2/T3/T4 desenharem para ele nasce junto com a condição ruim que
> ainda não chega lá, não em cima de um buraco existente. Para o **herói** e para o
> **inimigo** o desenho da fase segue inteiro, sem uma vírgula a menos.

- [x] **T1 · o relógio alcança o grupo** · feito em v9.238 (`9ca2eb7`), 14/09
  **A etapa era pequena e fechou pequena, como C1: `src/*.js` intocado**, 41
  linhas de fiação em `App.jsx:8292–8332` (entre o tique do herói e o dos
  inimigos, em `try/catch` com `calou`) e a prova. `tickCondicoes` já servia
  como está — dar-lhe um `{ semDano: true }` só para o grupo seria API nova com
  um leitor só.
  **A pauta errava, e o erro virou o coração da etapa:** sem veneno eterno, **o
  dente inverso não é o efeito colateral — é a etapa inteira**. O relógio tira do
  grupo uma vantagem de trinta versões, e era isso o conserto.
  **Uma Vida, 1000 combates (`umavida|0..999`), instrumento de P3 validado por
  controle** (reproduz 563 quedas · 754 PV · 918 absorvido · 153 abrigos, byte a
  byte): **condições que vencem 0 → 727** no duro e **0 → 305** no brando, cada
  uma em **4,1 turnos**; companheiro-rodadas com condição **4040 → 2335 (−42%)**
  no duro e **5988 → 5601 (−6,5%)** no brando. Em mesa: quedas 560 → 563, PV
  restante 798 → 754 (−2,7%) no duro, **zero** no brando.
  **E a leitura honesta: quase não dói, e o motivo tem nome.** 94% do que estava
  de pé era `protegido`, que **não compra defesa para ninguém** (`defesaDe` não lê
  `condicoes`; defesa 11 com e 11 sem). A vantagem de trinta versões era real em
  contagem e quase inerte em efeito — virou achado em "Aberto", não conserto de
  carona.
  **O dano por turno ficou FORA, de propósito** (companheiro morrendo de veneno é
  jeito novo de perder um companheiro, e é da pessoa) **e não esconde nada**: as
  três que doem têm portador único e sempre `alvo: "alvo"` — **0 em 2000
  combates**, por simulação e por estrutura, com o zero guardado em `teste-afl.mjs`.
  **Save antigo não migra:** a instância carrega `turnos: N` cheio e nunca
  decrementou, então basta o relógio alcançá-la. Migrar seria **inventar um estado
  que o save não tem** — a marca de "condição antiga" nasceria só para ser lida uma
  vez. Lixo em `turnos` segue vivo, que é o comportamento de hoje.
  **O que o jogador lê:** `✓ Irmã Vela: Abençoado passou` — irmã exata da linha do
  inimigo, 0,73 por combate no duro. `teste-cond.mjs` 31 → **84**, `teste-afl.mjs`
  24 → **32**; **15 sabotagens, 15 mordendo** — e uma delas mordia pelo motivo
  errado (o recorte da âncora virava o App inteiro), endurecida antes de fechar.
  Ver o diário.
- [x] **T2 · a cura não limpa** · feito em v9.239 (o código em `a6a6473` por
  engano de varredura, o resto em `d064baa`), 14/09
  **A etapa foi conferência que passou — e o conserto estava na tabela, não no
  código.** Varridas **45 portas de cura** em 16 arquivos (poção, dado de vida,
  descanso curto e longo, profissão, magia de cura, milagre, Segundo Fôlego,
  relíquia `curaFracao`, companheiro que cura, Reerguer, arena/noite/duelo,
  santuário, volta da morte, vínculo, drenagem, chefe): **nenhuma porta de
  gameplay escreve em `condicoes`**. A única que limpa é o **`/curar` do console
  criativo** (`App.jsx:5449`, declarado em `godmode.js:31`) — chave do mundo,
  não cura normal; ficou de pé e **declarada** na tabela do varredor, com o
  motivo escrito.
  **O descanso ficou como está, e o código deu o motivo:** `descanso.js` — o
  módulo que calcula **toda** a metade de PV — **não tem uma linha tocando
  `condicoes`**. As duas metades já são separadas: a de PV obedece à lei
  sozinha, e a limpeza vem inteiramente da metade do **tempo**
  (`limparPorDescanso`, chamada de `regras-jogo.js:84–94`). Descanso é
  passagem de tempo, não cura — e é a única escolha que não deixa `exausto`
  (`turnos: null`, só sai com `"longo"`) sem saída nenhuma. Zero mudança no
  que o jogador vive.
  **A mentira estava no catálogo:** quatro condições declaravam
  `saiCom: ["cura"]` (`envenenado`, `sangrando`, `cego`, `enfeiticado`) e
  **ninguém lia o canal `"cura"`** — promessa morta que contradizia a lei.
  Virou **`"restauracao"`**, na tabela nova `CANAIS_DE_SAIDA`. **Renomear, não
  apagar, foi obrigatório:** `enfeiticado` só declarava esse canal, e apagá-lo
  o deixaria com `saiCom: []` — a regra implícita faria **a noite inteira
  passar a quebrar encantamento**. As quatro têm `turnos` (4/3/2/3) e seguem
  vencendo no relógio de T1: nenhuma ficou sem saída.
  **A porta do descanso foi trancada:** `limparPorDescanso` **recusa** canal
  que não seja de descanso — antes aceitava qualquer string, e
  `limparPorDescanso(c, "cura")` era o jeito mais fácil de uma cura futura
  apagar condição sem parecer que apagava. E `CONDICOES_PROMPT` dizia ao
  Narrador *"quem a tira é o relógio, o descanso **ou a cura**"* — ensinava o
  oposto da lei; hoje diz *"o relógio ou o descanso"* (**−10 chars**, teto
  intacto em 56.334).
  **Catraca permanente: `testes/check-cura-nao-limpa.mjs`** (33 asserções, no
  `npm test`): percorre o `src/` atrás de **toda** linha que sobe `vida` e
  falha se houver escrita em `condicoes` na vizinhança, com piso de alcance
  (35 portas / 8 arquivos, para não passar verde medindo lista vazia) e dente
  inverso. **7 sabotagens, 7 mordendo** — inclusive a sutil, o canal sumindo.
  `teste-cond.mjs` 84 → **102**, `teste-relicas.mjs` 98 → **103**,
  `teste-mercado.mjs` 27 → **29**; nenhuma asserção antiga movida. Ver o diário.
- [x] **T3 · a salvaguarda no fim do turno** · feito em v9.240 (`c6d290f`), 14/09
  **A etapa não era a lista de sete nomes — era o critério que os deduz.** A
  pauta pedia "cada condição declara se permite", e o risco dessa frase é virar
  lista de gosto que a suíte só prova copiando. `SALVAGUARDA_DO_FIM_DO_TURNO`
  (`condicoes.js`) nasceu no molde de `CONCENTRACAO_DA_MAGIA` com **três testes
  escritos e lidos de volta pela suíte**: (1) `turnos >= 2` — com prazo de um
  turno a chance chega no instante em que o relógio já vence, e corta `atordoado`
  e `caido`; (2) efeito **sustentado**, não ferimento — ferida aberta e fogo
  pegado são estrago em curso, e cortam `sangrando` e `queimando`; (3) só `ruim`
  — ninguém resiste à própria bênção, e corta as 8 boas de uma vez.
  **7 ganharam**, cada uma com âncora 5e na linha: `envenenado` vigor 12 (o
  exemplo da pessoa), `paralisado` vigor 14, `agarrado` forca 12, `amedrontado`
  presenca 12, `cego` vigor 12, `enfraquecido` vigor 12, `lento` vigor 12. **6
  ruins não**, com motivo por linha — `enfeiticado` porque dar-lhe saída aqui
  **apagaria em silêncio a decisão de T2** (é a única cuja única saída é
  `restauracao`). A convergência **7 + 6 + 8 = 21** é asserção.
  **A CD é herdada da `resistir.dif`, o atributo não** — o mesmo veneno não pode
  ter duas forças, uma para pegar e outra para sair; mas `resistir` usa
  `"agilidade"`/`"vontade"`, que não existem em `SALVAGUARDAS`. São **duas
  perguntas**: entrada (`aflicoes.js`) e saída. `cego` prova — não tem entrada e
  tem saída; quem CEGA é Percepção, quem DESCEGA é Vigor.
  **O efeito, por conta fechada e Monte Carlo de 60 mil (batem na 2ª casa):** as
  sete somavam **19 turnos** de prazo puro e passam a somar **12,33 (mod 0) a
  9,12 (mod +6) — corte de 35% a 52%**. `envenenado` 4t → **2,02t (−50%)** no dado
  cru, saindo antes do prazo em 83% das vezes; em PV, 8 → **4,05 (−49%)**. A faixa
  real do herói foi conferida nos oito prontos: salva de Vigor **+1 a +5**,
  mediana +3. O inimigo rola cru (`modSemFicha: 0`, com três motivos escritos); o
  companheiro fica no meio **sem ter um único atributo**, porque declara `classe`
  e a proficiência entra sozinha (Guerreiro nv5, +3).
  **A rolagem é inteiramente de `salvaguardas.js`** — nenhum d20 novo. **A frase
  nasce no módulo** e o App não monta uma sílaba (só o nome do dono):
  `🧪 O veneno afrouxa e sai do sangue — deu 20, e bastavam 12.` Nasce **só no
  sucesso** — é C2 pelo motivo inverso: lá a linha vinha só na queda para não
  virar ruído por rodada; aqui o evento é a saída. **Teto de prompt 81.927 →
  81.927 chars**, crescimento estático zero (o Mestre já recebe
  `resumoCondicoesPrompt` todo turno). **A ordem é contrato** — relógio primeiro,
  salvaguarda depois —, e a suíte roda **as duas ordens exigindo que discordem**.
  `teste-cond.mjs` 102 → **245**; **27 sabotagens, 27 mordendo** — e **duas
  nasceram verdes, as duas no teste e não na produção**: a varredura de
  `restauracao` pulava `condicoes.js` inteiro (onde o canal é declarado, e onde
  ele tem mais chance de ganhar leitor), e a peneira do `concentrado` aceitava
  qualquer `id:` na frente — ou seja, o **aplicador** passava verde. Ver o diário.
- [x] **T4 · as portas de saída declaradas** · feito em v9.241 (`79567ce`), 14/09
  **A promessa mais antiga do catálogo era a magia, e ninguém tinha ido cobrá-la.**
  Restauração Menor e Maior estão no grimório desde sempre, declaram
  `funcao: "curar_condicao"`, passam por `resolvidaPeloSistema` — e caíam no
  `return false` do fim de `usarFuncaoMagica`. Conjurá-las gastava a vez e **não
  tirava condição nenhuma**. O item e a relíquia, ao contrário, já funcionavam
  desde sempre, com o `remove`/`limpa` escrito.
  **A decisão que mais pesou foi NÃO deixar o canal mandar em tudo.** O desenho
  óbvio — quem declara `restauracao` sai por porta, quem não declara não sai —
  **apagaria seis comportamentos vivos em silêncio**: poção e relíquia removem hoje
  `atordoado`, `amedrontado`, `queimando`, `agarrado`, `lento` e `caido`, que o canal
  não declara. `PORTAS_DE_SAIDA` nasceu então com **três famílias de autoridade
  separada**: o canal é a autoridade da **magia e só dela**; a lista do frasco
  continua sendo a palavra final do frasco. `pocoes.js` e `relicas.js` intocados.
  **O alcance da magia sai de três testes, não de gosto** — declara o canal; é
  aflição e não ferimento (**o teste 2 de T3 reaproveitado**, e corta `sangrando`
  pelo mesmo motivo escrito lá); e o degrau, a Menor tira o que foi **posto** em
  você e a Maior também o que foi **tirado**. Menor: `envenenado`, `cego`,
  `paralisado`. Maior: `enfeiticado`, `exausto`, `enfraquecido` + tudo da Menor por
  `herdaDe` (divergência do 5e **declarada**: um 5º círculo que não faz o que o 2º
  faz é armadilha de ficha).
  **`paralisado` ganhou `["longo", "restauracao"]`, e o `"longo"` junto era
  obrigatório** — `saiCom` não-vazio **desliga** a regra implícita, e o canal
  sozinho lhe tiraria a noite que já tinha. É a armadilha exata que T2 mediu em
  `enfeiticado`, hoje travada por asserção. `enfraquecido` e `exausto` ganharam
  `+ "restauracao"`. A remoção é **função nova e própria**: passar a magia por
  `limparPorDescanso` seria arrombar a fechadura que T2 pôs de propósito.
  **`concentrado` foi RESOLVIDO, não perdoado:** `saiCom: ["curto", "longo"]` — no
  5e a concentração não sobrevive a um descanso, e uma hora de parada já é mais que
  o teto de uma concentração inteira. **Efeito em mesa zero, confirmado** (nada no
  `src/` nem no `App.jsx` a aplica). **A lista de perdão da catraca nasce vazia.**
  **A catraca que fecha a fase:** *toda condição tem ao menos uma saída*. **21
  condições · prazo 19 · descanso 13 · salvaguarda 7 · porta que resolve 13 · com
  mais de uma 13 · SEM SAÍDA 0.** Piso de alcance no molde do
  `check-cura-nao-limpa.mjs`, mais dois dentes que não são número (a cobertura lê o
  mesmo catálogo que o resto da suíte; a contagem de salvaguarda tem de bater com
  uma leitura independente).
  **O que o jogador lê**, sem `mostrarRolagens` e com a frase nascendo no módulo:
  `🧪 Vera: o veneno afrouxa e sai do sangue; a vista volta, embaçada primeiro.` E
  quando não há o que tirar, o sistema **recusa antes de cobrar** — molde da poção
  cheia: `✋ Restauração Menor: a mão se abre e não acha o que desfazer — os 3 PM
  ficam com você.` **Teto de prompt 56366 → 56366 chars**; `CONDICOES_PROMPT`
  **encolheu 2 chars** (dizia *"quem a tira é o relógio ou o descanso"*, já falso
  desde T3; hoje diz *"quem a tira é o sistema, nunca você"*).
  `teste-cond.mjs` 245 → **394**, `teste-ligacao.mjs` 20 → **21**; **13 sabotagens,
  13 mordendo, nenhuma nasceu verde**. Ver o diário.

  **A FASE T ESTÁ FECHADA.** A pessoa ditou a lei do 5e numa frase e o jogo hoje a
  cumpre dos quatro lados. Antes: o relógio das condições tinha **2 sítios** e não
  alcançava o grupo; quatro condições anunciavam no catálogo que a cura as tirava e
  **ninguém lia esse canal**; **nenhuma** condição tinha segunda chance no fim do
  turno; e **uma** não tinha saída nenhuma. Hoje: **3 sítios** no relógio (grupo
  incluído, e condições do grupo que vencem **0 → 727** em 1000 combates duros);
  **45 portas de cura varridas** e nenhuma de gameplay escrevendo em `condicoes`,
  com catraca permanente (`check-cura-nao-limpa.mjs`, 33 asserções); **7 das 13
  ruins** com salvaguarda deduzida por critério de três testes (as sete somavam 19
  turnos de prazo puro e passam a somar **12,33 a 9,12 — corte de 35% a 52%**);
  **4 portas declaradas por tabela** (2 vivas · 2 com `aguarda` escrito), **13 de
  21** condições saindo por porta que resolve, **13** com mais de uma saída e
  **ZERO sem nenhuma**. `teste-cond.mjs` **31 → 394**. **62 sabotagens na fase,
  todas mordendo** — e as duas que nasceram verdes estavam no teste, não na
  produção. **Teto de prompt: crescimento estático zero nas quatro versões**, e
  `CONDICOES_PROMPT` na verdade encolheu (−10 em T2, −2 em T4), porque as duas
  vezes em que ele mentia foram consertadas trocando palavra por palavra.
  **A próxima da fila aprovada é a Fase B; B1 fechou em v9.243, B1b consertou a
  régua em v9.245, e a vez é de B2.**


### Fase B — o bônus do companheiro, se for lícito e justo
Decisão da pessoa (14/09): *"se o bônus for lícito e justo não tem porque
deixarmos de lado, vamos fazer."* A condicional é a fase: **provar que é justo
faz parte do trabalho**, não é preâmbulo.

P3 deixou a simetria pela metade — o buff do companheiro nasce com `bonus: N`,
a metade defensiva vale (`absorverDano` a lê) e a ofensiva não, porque
`combate.js` **não contém a palavra `efeitos`** em linha nenhuma. Fechar isso
faz o dano do grupo crescer em Uma Vida **sem teto medido**: a catraca de
equilíbrio só existe para a arena.

- [x] **B1 · a régua que falta** · feito em v9.243 (`322dee7`), 14/09
  A régua existe e é permanente: `testes/regua-combate.mjs` (o instrumento) e
  `testes/teste-regua.mjs` (a catraca, 115 asserções). **Zero linha de `src/`
  mudou** — B1 não somou um ponto de dano. O molde de P3/T1 foi reconstruído a
  partir do `App.jsx` de hoje e bate nos dois números que T1 deixou escritos
  (1ª queda **4,41** contra 4,41; quedas **545** contra 566→563).
  **Nasceu um terceiro cenário, e é o que importa:** `duro` e `brando` estão
  saturados nas pontas (no duro caem 2,81 dos 3 e sobram 3 PV de 132; no brando
  ninguém cai nunca e sobram 94%) — mudança que passa nos dois extremos não
  prova nada. **`justo`** (4 elites nv6) põe a mesa em **49,8% de vitória, 1,82
  quedas e 19% de PV**, com folga nos dois sentidos.
  **Estável, não sortuda:** N = 1000 × 4 famílias independentes, que concordam
  nas treze métricas; a N = 2000 `danoSofrido` passa a discordar — a precisão
  ficou mais fina que a distância entre famílias, e 1000 é o maior N em que a
  régua ainda concorda consigo mesma.
  **Virou catraca**, com três dentes no `justo`: faixa de vitória **35–65%** (a
  mesma lei da arena, lida de `teste-arena.mjs` como texto), teto de PV do grupo
  **≤ 35** e piso de quedas **≥ 1,2** — folga mínima **3,70 margens**, e a folga
  ela mesma é asserção (`> 2 margens`), para a régua avisar que ficou não-confiável
  *antes* de ficar vermelha. **Quatro sabotagens, três mordendo e um controle
  verde** (4 elites nv7 → 34,2%; 3 elites nv9 → 76,2%; grupo nv7 → 90,2%).
  **O que B2 vai querer:** cada ponto de dano por golpe do grupo vale **~3,5
  pontos de vitória**, e a catraca fica vermelha por volta de **+4/+5**.
- [x] **B1b · a régua se corrige antes de medir** · feito em v9.245 (`2a818f9`), 14/09
  Nasceu de olhar a divergência que B1 mandou olhar — e o veredito é que **ela
  não existia**: a contagem de abrigos depende de dois parâmetros que o diário
  de P3/T1 nunca registrou (o kit do herói, 66 → **33** abrigos sozinho; e a
  ordem do grupo na rodada, que reproduz o "954/159" de P3 **com o molde que o
  App contradiz**), e esta régua ainda é mais nova que P3 (compõe C2b e C3, que
  derrubam abrigo). O cabeçalho que acusava a divergência foi reescrito com os
  números que a desmontam. **Mas o olhar achou um defeito de verdade ao lado:**
  a régua rolava o teste de morte do herói **antes** do turno do grupo, e o App
  faz o contrário (`App.jsx:13591` → `:13830` → `resolverQueda` em `:13940`). Não
  é cosmético — `decidirAcaoCompanheiro` lê a ficha que o teste de morte acabou
  de mexer, e a Clériga curava a pessoa errada. Retrato do `justo` depois do
  conserto: vitória **49,8 → 52,1%**, quedas 1,822 → **1,790**, PV do grupo
  24,98 → **25,88**, 1ª queda **4,30** (igual). `src/` intocado, `App.jsx` só
  lido. **Sabotagem 1 subiu de nv7 para nv8** (a de nv7 parou de morder — 36,4%
  contra o piso de 35%); o piso não se moveu, e a resolução perdida (dois níveis,
  não um) está escrita. Folga mínima **3,45 margens**, não comprada de volta.
- [x] **B2 · a simetria fechada** · feito em v9.247 (`c14532b`), 14/09 — **e a Fase B fecha aqui**
  `turnoDosCompanheiros` aprende a ler `efeitos`, e o bônus ofensivo passa a
  somar como o defensivo já soma. **A régua decide**: se o grupo ficar forte
  demais, o trabalho da etapa é ajustar a tabela até ficar justo — e o diário
  registra o número antes e depois. Se não der para ficar justo sem mexer em
  lei, a etapa devolve à pessoa em vez de forçar.
  **A régua está consertada e a mesa está posta** (B1b, v9.245). (a) A linha de
  base a bater: vitória **52,1%**, quedas **1,790**, PV do grupo **25,88**, 1ª
  queda **4,300**. (b) A escada re-medida: +1 → 55,1% · +2 → 58,4% · +3 → 61,3%
  · +4 → 64,0% · +5 → **66,6%, vermelho nos dois tetos**. Cada ponto de dano por
  golpe vale **~2,9** pontos de vitória, e o teto de PV do grupo continua sendo o
  dente mais sensível (+1 já sai da margem) enquanto a vitória é o mais estável.
  (c) **A divergência da absorção foi resolvida e não atrapalha mais**: a absorção
  inteira vale 3,6 pontos de vitória, e dobrá-la custa 1,2 — menos de uma margem.

  **O VEREDITO (v9.247):** é lícito, é justo, e **o preço medido é zero** — as
  quatro métricas do `justo` saíram idênticas ao dígito (52,10% · 1,790 · 25,88 ·
  4,300), nas quatro famílias, com a folga de 3,45 margens intacta.
  `BUFF_DA_HABILIDADE` **não precisou de ajuste**. `turnoDosCompanheiros` soma em
  `danoBase` antes do dado (a convenção do herói: dobra no crítico), e a
  compensação externa de `arena.js` saiu no mesmo commit — sem isso a arena
  contaria **duas vezes**. Arena: amplitude 11,9 → 11,8, margem mais fina 40,2 →
  40,1%, `teste-arena.mjs` 99 → 106 ok. **12 sabotagens, 12 mordendo.** O órgão
  morde isolado (+3,015 de dano médio por golpe, contra 2,857 se não dobrasse no
  crítico), e o abrigo não vira espada (11,566, byte a byte).
  **Por que o zero:** o gargalo não era este — é o nascimento do buff, e ele virou
  item novo em "Aberto".


### Fase A — a Arena passa a portar os efeitos · **FECHADA em v9.226, 13/09**
Decisão da pessoa (13/09): *"vamos corrigir e deixar funcionando como
deveria"* — o caminho caro, não o diagnóstico barato. As quatro etapas
verdes e commitadas; o antes-e-depois inteiro está no diário de A4.

- [x] **A1 · a prova que mede o buraco** · feito em v9.223 (`a44da9c`), 13/09
  Seção 7 de `teste-arena.mjs`, com `pendente(...)` e a tabela
  `MEDIDA_DO_BURACO`. **O número do "antes":** 420 quedas · 382 meias-rodadas
  mortas (0,91 por queda, 8,3% do total) · 20 quedas (4,8%) abrem com duas
  guardas · dano depois da guarda 1,034× o normal. Ver o diário.
- [x] **A2 · os efeitos viram módulo puro** · feito em v9.224 (`a137790`), 13/09
  Nasceu `src/efeitos.js` (6 tabelas, 11 funções); o `App.jsx` perdeu as seis
  duplicatas; `regras-jogo.js`, `pocoes.js` e `relicas.js` leem a mesma pilha.
  `teste-efeitos.mjs` com 168 asserções. **Regressão zero conferida:** as dez
  suítes de combate verdes e os dois números de A1 idênticos (20/420 = 4,8%;
  dano após guarda 1,034×). A GUARDA já era módulo (`habilidades.js` desde a
  v9.53) e ficou lá — para A3 a arena não precisa de código novo de guarda,
  só de chamar `erguerGuarda`. Cinco achados anotados abaixo. Ver o diário.
- [x] **A3 · a arena consome os efeitos** · feito em v9.225 (`6168a14`), 13/09
  As duas frentes, na ordem: `arena.js` passou a aplicar de verdade
  (`erguerGuarda` para quem casa com `GUARDAS`, `efeitoDeBuff`+`empilhar`
  para o resto, `bonusDeDano`/`bonusDeArma` no golpe, `tickEfeitos` e
  `expirarGuardas` uma vez por rodada) — e só então o filtro furado de
  `meiaRodada` caiu inteiro. **Os dois números de A1 fechados:** aberturas
  mortas 20/420 (4,8%) → **0 de 424**; meias-rodadas mortas 382 → **0**.
  Na mesa real: 791 buffs firmados, 329 golpes com o bônus dentro, 409
  efeitos vencendo o prazo. Ver o diário.
- [x] **A4 · o equilíbrio: conferir antes de mexer** · feito em v9.226 (`817f96f`), 13/09
  **Conferência, não reajuste — e a conferência passou.** 49 famílias de
  sementes independentes fora da amostra da suíte: **zero estouros** de
  35%/65%. Nenhum número de pronto mudou. A borda de `flecha` (61,9%) era
  viés de amostra — fora dela mede 49,5–57,6, e quem está no topo é `sombra`
  (58,1% no retrato de 480). O trabalho da etapa virou a **catraca**: de uma
  amostra para cinco (4 famílias de 30 + retrato de 120), tabela
  `CATRACA_DO_EQUILIBRIO`, e um dente novo — teto de amplitude (20 pts,
  medido 15,7) que pega o pronto dominante que não estoura o teto sozinho.
  Conferida contra arena mutante: `sombra` com +3 de vida passava na antiga,
  falha três vezes na nova. Ver o diário.

  **A FASE A ESTÁ FECHADA.** Meias-rodadas mortas 8,3% → 0; aberturas mortas
  4,8% → 0,0%; dano após guarda 1,034× → 0,699×; amplitude 24,8 → 20,0 pts.
  A próxima fase aprovada é a **R**, a partir de R1.

<details>
<summary>o texto original da etapa A4 (antes de ser executada)</summary>

  **Corrigido pelo orquestrador em 13/09, depois de A3:** a pauta previa
  que a catraca de 35–65% sairia da faixa com os efeitos valendo. **Não
  saiu** — os oito ficaram dentro, e a amplitude até APERTOU (36,2–61,0 =
  24,8 pts antes; 41,9–61,9 = 20,0 pts depois): muralha 42,9→50,5 · sombra
  47,1→54,3 · chama 36,2→42,4 · remendo 61,0→48,1 · voz 60,5→51,0 · flecha
  55,7→61,9 · punho 38,1→50,0 · voto 58,6→41,9. Logo A4 **não é mais
  "reajustar os prontos"**: é conferir se ainda há trabalho. Quem está na
  borda é `flecha` (61,9%) — e o Caçador é justamente um dos dois prontos
  (com `sombra`) que **não têm habilidade de buff nenhuma**, ou seja, foi o
  que menos ganhou com A3 e mesmo assim subiu. Olhar isso primeiro; se a
  conclusão for "nada a mexer", A4 fecha como conferência registrada no
  diário — equilíbrio é teste, não intenção, e teste verde também é
  resposta. Cuidado herdado: a sonda sintética de `teste-arena.mjs` seção 7
  nasce das fichas de `muralha` e `punho`; rebalancear essas duas move a
  razão (0,699 contra teto 0,9) e o ganho (1,95 contra piso 1). Se alguma
  ficar vermelha depois de um rebalanceamento, é sinal legítimo — não se
  afrouxa o limiar.
</details>

