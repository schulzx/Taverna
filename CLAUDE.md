# Taverna — as leis da casa

RPG de navegador em português (React 18 + Vite). Um `src/App.jsx` de ~20 mil
linhas + ~150 módulos em `src/*.js`. Deploy no Vercel a partir de `main`.

**A filosofia:** *o Mestre é código, e a IA só narra.* Todo número sai de uma
tabela; toda regra tem um teste; o Narrador (a IA) liga os pontos, nunca
inventa mecânica. Código, comentários e commits em **português**.

---

## As leis (valem para todo agente)

- **Se é número, é tabela.** Nenhuma constante de regra solta no meio do
  código — sai de uma tabela nomeada, que a suíte pode ler de volta.
- **Export morto mente.** Toda função/const/classe exportada precisa de ≥2
  leitores no projeto (referência em teste conta). A catraca é `teste-ligacao`.
  Regra nova sem leitor quebra a suíte no dia em que nasce.
- **Conta se prova, tela se olha.** O módulo puro decide e é provado em Node;
  o `App.jsx` monta a tela e a fiação. Nunca misture os dois.
- **O sistema não fala de si mesmo.** Só aparece na tela o que é gameplay.
  Posturas, presets, modos, ritmos — bastidor. O jogador sente pelo efeito,
  nunca lê o nome do mecanismo.
- **O veredito antes do clique.** Toda ação irreversível mostra o resultado
  (o preço, os dois lados) antes de acontecer.
- **Determinismo por semente.** Mesma semente = mesmo resultado, em qualquer
  máquina. É o único árbitro que um sistema sem servidor tem.
- **Imutabilidade.** Estado é substituído, nunca mutado. `= {}` no destructuring
  NÃO cobre `null` — trate `null` explícito.
- **Nunca pode custar o turno.** Toda fiação nova no App entra em `try/catch`
  (o helper é `calou(...)`); um órgão que estoura não pode derrubar a cena.
- **O teto de prompt é sagrado.** Pior caso ~82k chars. **Proibido** somar bloco
  estático ao prompt. O canal por turno é a `pauta` dinâmica (SECOES com prio,
  TETO_DA_PAUTA); vetos vão em `naoPode`.
- **Ao mover uma asserção de teste, escreva o motivo** num comentário — a
  intenção tem de sobreviver à mudança.

---

## O padrão de fase (como um órgão novo nasce)

Uma etapa por versão, nesta ordem:

1. **Módulo puro** em `src/nome.js` — provável em Node, sem React.
2. **Fiação defensiva** no `App.jsx` — snapshot dos refs em `try/catch`,
   ref no save e no load.
3. **Suíte dedicada** em `testes/teste-nome.mjs`.
4. **Bump** de `VERSAO` em `src/constantes.js` — **leia o valor no arquivo,
   nunca daqui.** Esta linha já trouxe um número (`v9.221`) que envelheceu em
   trinta versões, e as mãos o copiaram para onze comentários de código como
   se fosse o de hoje. **Lei não guarda valor que apodrece:** onde a casa
   precisa de um número atual, ela aponta para onde ele vive.
5. `npm run build` limpo → `npm test` (todas as suítes + os varredores).
6. **Commit local narrativo** (explica o *porquê*, em português).

O `npm test` roda `testes/rodar-tudo.mjs`: todas as `teste-*.mjs` mais os
varredores (`check-*.mjs`, `varredura-*.mjs`). Verde = tudo passou.

---

## Patches em arquivo grande (o App.jsx)

Editar `App.jsx` por regex à mão erra silenciosamente. O padrão da casa é um
script `.cjs` no scratchpad, aplicado por `node`:

```js
const t = (de, para) => {
  if (!s.includes(de)) throw new Error("nao bate: " + de.slice(0, 70));
  if (s.split(de).length - 1 > 1) throw new Error("ambiguo: " + de.slice(0, 50));
  s = s.replace(de, para);
};
```

Ele **falha** se a âncora não bate ou é ambígua — nunca aplica no lugar errado.

**NUNCA** use crase (\`) dentro do conteúdo de template-literal de um `.cjs` —
o shell/parser mutila. Escape com `\\\`` ou reescreva sem crase. `node -e` só
para patch simples, e sempre com aspas simples.

---

## Armadilhas conhecidas (custaram caro)

- **PowerShell corrompe UTF-8.** Reescrita em massa só por `node`;
  `Set-Content` mata os acentos do arquivo.
- **Bash come crase e escape.** `node -e` via shell mutila regex e comentário,
  e não avisa. Prefira arquivo `.cjs` via Write.
- **A crase fecha a string do destino, não só a do patch.** A lei acima fala de
  crase dentro de um `.cjs`; em 24/09 (R17) a mesma crase custou um build pelo
  outro lado: um **comentário** escrito dentro de `SUPERFICIES_CSS` — que *é* um
  template-literal, e é o maior do projeto — fechou a string, e `estilo.js`
  deixou de compilar com `SyntaxError: Unexpected identifier 'ALVOS'`. **Vale
  para qualquer texto que vá parar dentro de um template-literal do projeto**, e
  a folha de estilo é onde isso mais acontece: o comentário parece prosa e é
  código. Escape, ou escreva sem crase.
- **Screenshot congela com painel oculto.** Cliques são vivos, a foto é velha —
  confie na árvore de acessibilidade (`read_page`), não na imagem.
- **HMR mente depois de rename.** Build limpo + suítes verdes, mas a aba cai no
  `LimiteErro`: é buffer velho do dev-server. Abra aba nova para confirmar.
- **Componente definido dentro do render mata o foco** do input (uma letra por
  vez). Defina fora.
- **Autosave sobrescreve injeção** no localStorage: injete só com o jogo
  desmontado, e restaure idem.

---

## A arquitetura em camadas (o diretor de histórias)

- **Espinha** (escolhida, 1 por campanha) > **Subestrutura/episódio** (acionada
  pelo sistema) > **Postura** (derivada, contínua). O Narrador nunca vê a
  verdade eleita antes do turno da revelação.
- **Modos** (`modos.js`): `historia` (Uma Vida, default absoluto — regressão
  zero), `rapida` (Uma Noite), `duelo`. Modo é lente sobre o mesmo motor,
  **nunca** um segundo jogo. Save é território: cada modo no seu espaço de
  localStorage; a campanha é intocável dos outros modos.

---

## A mente (autonomia por peso)

O projeto tem uma mente que pensa e mãos que fazem, e roda em ciclos sem a
pessoa presente. A pessoa só decide o **pesado**; o resto é decidido e feito
automaticamente. O que pesa cada coisa é lei — e está aqui, não na cabeça de
ninguém:

| peso | quem decide | o que é |
|---|---|---|
| **leve** | o ciclo, sem anúncio | bug com teste que prova (falha antes, passa depois) · teste faltante para regra que existe · comentário, nome, cabeçalho · export morto · varredor novo para erro já visto |
| **médio** | o ciclo, **com o motivo no diário** | rebalancear número dentro de tabela existente, com catraca provando · ampliar acervo numa tabela existente, no mesmo formato · ligar sinal dormente a tracker que já existe · refatorar módulo puro sem mudar comportamento · ajuste pequeno de tela (texto, ordem, botão morto que faltava esconder) |
| **pesado** | **só a pessoa** | mudar uma lei desta casa ou o teto de prompt · órgão/modo/mecânica que muda o que o jogador vive · remover ou desligar o que existe · formato de save ou protocolo da sala (`api/sala`) · qualquer coisa que custe dinheiro ou toque infra (Vercel, Redis, chaves) · a voz do Narrador em massa (assuntos, falas) · **`git push`** |

Na dúvida entre médio e pesado, é pesado. Os arquivos da mente:

- `mente/pauta.md` — o que foi pensado e não feito, com peso. "Para a pessoa
  decidir" no topo. "Recusado" no fim, com motivo — não se propõe de novo.
- **A mesa se arruma sozinha.** Em 17/09 a memória da mente virou o custo do
  trabalho: pauta 243 KB, diário 310 KB, formas 239 KB — **~140 mil tokens
  lidos por ciclo antes de escrever uma linha**, mais do que o código que ia
  tocar. `node mente/arquivar.mjs` move o que fechou para `mente/arquivo/`
  (fase fechada, ciclo com mais de oito de idade), deixando um índice que
  aponta para lá. **Nada se apaga** — o valor de uma fase fechada é de
  consulta, e consulta não precisa estar no bolso. Rode quando a mesa pesar;
  `--medir` mostra o ganho sem mover nada.
- **Continuar um agente é mais barato que criar outro.** Um agente retomado
  ainda tem na cabeça o `CLAUDE.md`, o roteiro e a pauta que já leu; um agente
  novo relê tudo. Quando a etapa seguinte é da **mesma fase**, ou quando um
  ciclo morreu no meio, **retome o mesmo agente** em vez de nascer um. É o que
  mais se aproxima de "manter o agente vivo" — não há processo que segure
  estado entre chamadas, mas há conversa que continua.
- `mente/diario.md` — um bloco por ciclo: quem fez o quê, cada decisão média
  com o motivo. É por aqui que a pessoa vê o processo.

Os agentes: `conselheiro` (pensa, escreve a pauta), `orquestrador` (rege o
ciclo), `backend` / `frontend` / `testes` (as mãos), e a mesa de design —
`jogo` (game design: o quê e quando), `desenho` (design e UX: a forma) e
`aprendiz` (a mão que constrói o simples e o médio da interface). O roteiro
do ciclo está em `.claude/agents/orquestrador.md`; `/ciclo` roda um.

---

## A ordem de 23/09 — o foco, a liberdade e o backup

A pessoa mudou o regime de trabalho desta casa, e a mudança tem três partes.
Está aqui e não na cabeça de ninguém, porque é ela que decide o que um ciclo
faz sem perguntar.

**1. O foco.** *"Vamos focar agora nossas energias no visual e na experiência
de jogo, a gameplay tem que ser interativa e interessante pra prender o
jogador, e o design e visual precisam ser estimulantes e chamativos como um
bom jogo... começando pela tela principal que é onde se passa 90% do jogo...
contemplando todos os detalhes como menus e telas ligadas. Vamos mudar também
o sistema de decisões."*

Enquanto esta ordem valer, **a fila do desenho é a única que anda**. A fila do
sistema (`mente/pauta.md`) fica **parada**, com uma exceção escrita: um item
do sistema anda **quando o desenho precisa dele** — aí é pedido, entra por
`mente/pedidos-ao-sistema.md`, e é do tema. Regra de bolso: *se o jogador não
vê nem sente, não é a vez disto.*

**2. A liberdade, e ela é maior do que a tabela de pesos.** *"Não me importo em
alterar desde que a nova versão for superior... não se acanhe em fazer o que
for melhor e ter boas ideias, não espere pelo meu comando... você tem total
liberdade pra trabalhar e ser criativo, assim como os grandes designers e
programadores... não tenha medo de se arriscar."*

Então, **no tema desta ordem, `pesado` de design deixa de esperar a pessoa.**
Paleta, tipografia, nomes de menu, posições, fluxo, telas que nascem e telas
que se aposentam: **a mesa decide e faz.** O que **não** muda é que *superior*
se demonstra — os três caminhos (medida, estudo citado, experiência jogada)
continuam de pé, e agora servem à mesa em vez de servirem ao pedido de
autorização. **Timidez passou a ser o defeito mais caro desta casa.**

**3. O backup, e é ele que paga a liberdade.** *"Vamos ter uma versão backup a
partir daqui... se por ventura tiver algo que eu não goste, te avisarei e então
só fazemos downgrade daquilo em específico buscando ele no backup."*

O backup é a tag **`backup-pre-redesign-2026-09-23`** e o ramo
**`backup-pre-redesign`**, os dois em `d6f1003` e os dois no remoto. Reverter
é pescar **uma coisa** de lá (`git show backup-pre-redesign-2026-09-23:<arquivo>`),
nunca voltar a árvore inteira.

**O limite, e ele sai do próprio modelo dela.** A liberdade é grande porque o
*rollback* a cobre. Logo **o que um rollback NÃO desfaz continua da pessoa**:

- **o formato do save** — desfazer o commit não devolve a ficha que o save
  já reescreveu na máquina de quem joga;
- **o que custa dinheiro ou toca infra** (Vercel, Redis, chaves);
- **apagar dado de jogador**, em qualquer forma.

Tudo o resto, no tema, é da mesa. **Na dúvida, a pergunta não é mais "isto é
pesado?" — é "um commit revertido conserta isto?".** Se conserta, faça.

**A régua de toda decisão, dita por ela:** *"Vamos fazer o melhor RPG de mesa
do mundo, tenha isso em mente e use isso para basear todas as suas decisões."*
Não é slogan: é o critério de desempate. Entre a opção segura e a que faria o
jogo ser lembrado, **escolhe-se a segunda** e prova-se depois.

**E ela pediu notícia:** *"quando puder, me atualize por aqui."* Todo ciclo
fecha com o que mudou para quem joga, em número — não com o que foi tocado.

## A fila pode ser pausada

A pessoa para as duas filas com uma frase, e parou em **16/09/2026** para
avaliar o que havia: *"suba e pause a fila, não comece outras até segunda
ordem"*. O mecanismo é um arquivo — **`.claude/fila-pausada`** —, e ele
guarda a data, a frase e o que falta religar.

**Enquanto ele existir, nenhum ciclo novo começa** — nem o agendado, nem o
chamado à mão. É a **primeira** coisa que se olha, antes da trava: se existe,
o ciclo diz que a fila está pausada, mostra a data e a razão escritas lá
dentro, e **termina sem tocar em nada**.

Um ciclo **já no ar** quando a pausa chega **termina**: fecha, prova, commita
e **sobe**. O que fica no disco não conta, e uma avaliação precisa do que está
no ar, não do que ficou pela metade.

Pausar também **desliga a tarefa agendada** (`taverna-ciclo`) — senão ela
acorda um ciclo a cada duas horas contra a ordem. Por isso retomar são
**duas** coisas: apagar o arquivo **e** religar a tarefa. Uma só, e a fila
anda pela metade.

## As duas mentes

Desde 14/09/2026 há **duas filas, correndo ao mesmo tempo na mesma árvore**:

| | conduz | fila | diário | trava |
|---|---|---|---|---|
| **sistema** | `orquestrador` | `mente/pauta.md` | `mente/diario.md` | `.claude/ciclo-em-curso` |
| **desenho** | `regente` | `mente/pauta-desenho.md` | `mente/diario-desenho.md` | `.claude/ciclo-desenho-em-curso` |

**Territórios, para não se pisarem:**

- **Sistema:** `src/*.js` (os motores), `testes/teste-*.mjs` de regra.
- **Desenho:** `ui.jsx`, `painel-*.jsx`, `rosto.jsx`, `carta-taro.jsx`,
  `grade-de-batalha.jsx`, `planta-cidade.jsx`, a tabela de estilo,
  `mente/formas.md`, o Figma, os varredores de forma.
- **`App.jsx` é de ninguém e dos dois** — veja o bastão.

**O bastão do `App.jsx`.** São 21 mil linhas e **63% da interface**; duas
mãos nele se apagam. Quem for tocá-lo cria `.claude/app-jsx` com data/hora e
nome. Existe e tem menos de 90 minutos: é do outro — **faça outra coisa da
sua fila**, nunca edite assim mesmo. Mais de 90 minutos: o dono morreu, tome
e registre. Apague ao terminar o arquivo, mesmo que o ciclo siga.

**O melhor uso do bastão é gastá-lo para não precisar mais dele:** cada tela
que sai do `App.jsx` para um painel próprio compra independência permanente
para as duas mentes. Mover vale mais que remendar.

**O bastão protege um arquivo, e o perigo é a suíte.** Duas mentes podem ficar
vermelhas uma por causa da outra sem nunca terem tocado no mesmo arquivo: basta
que uma esteja escrevendo um teste. Antes de julgar um vermelho que não é seu,
prove com **HEAD + só os seus arquivos**:

```bash
bash mente/so-o-meu.sh src/seu-modulo.js testes/teste-seu.mjs
```

Verde ali e vermelho na árvore = o vermelho é da outra mente. **Diga no
diário e siga** — não conserte, não espere.

**`git stash` e `git checkout --` são armas apontadas para o vizinho:**
tiram da árvore arquivos que a outra mente pode estar editando naquele
segundo. Para ler uma versão antiga, **`git show HEAD:<arquivo>`**, que não
toca em nada. Stash só com a árvore comprovadamente sua.

**Todo bastão deixa rastro.** Ao devolvê-lo, escreva no diário do ciclo que
o tomou, para quê e quando o devolveu — inclusive quando devolveu cedo.

**Subir com duas mentes.** Some os caminhos um a um (**nunca `git add -A`**:
a outra pode ter trabalho não commitado na árvore). Bump de `VERSAO` como a
**última** edição antes do commit. Push recusado por não estar à frente:
`git pull --rebase` e suba de novo; em conflito de `VERSAO`, fica o **número
maior**.

**Vermelho do outro território não se conserta** — avisa-se no diário e
escolhe-se outro item.

---

## A mesa de design

**Uma ação, uma forma.** `mente/formas.md` é a fonte da verdade sobre a cara
de cada coisa que o jogador toca; a biblioteca no **Figma** é a verdade
visual, e `T`/`FONT_CSS` (`constantes.js`) + `ui.jsx` são o espelho dela em
código. **Nenhuma decisão de design sai sem passar pelo Figma.** A mesma ação
com duas caras é defeito, não preferência.

**Cor é número, logo é tabela** — a primeira lei da casa vale para o visual.

**A fronteira que evita a briga (ajustada pela pessoa em 14/09):** o `jogo`
**compõe** as telas de jogo e é dono do momento (o tabuleiro, as barras, o
feedback, a tela de batalha); o `desenho` **fabrica** — mantém o sistema e
**toda peça** dele. Peça que falta é sempre do `desenho`, e nasce para
todos. Os dois trabalham no mesmo arquivo do Figma; o que não se divide é a
autoria da peça. Discordância se resolve escrita em `mente/formas.md`, com
os dois lados — nunca em dois códigos diferentes.

**Os dois executores:** `aprendiz` (Sonnet) constrói **fora** do `App.jsx`;
`oficial` (Opus) constrói **dentro** dele, com o bastão e por âncora.
**Nunca os dois no mesmo arquivo.**

**A pilha, dita de uma vez:** React 18 + Vite, JavaScript/JSX. Não há Java,
Swing nem janelas — há componentes React, `style={{}}` inline e Tailwind
pela CDN; tokens em `src/estilo.js`, primitivas em `src/ui.jsx`.

**Liberdade (decisão da pessoa, 14/09/2026):** *"podem criar livremente e
mudar o design quando preciso, seja paleta de cores ou o que for, desde que
seja a melhor opção comprovada, tanto para experiência visual quanto para
experiência jogável."* Nada é sagrado por ser antigo; *comprovada* é que é
caro — número e não adjetivo, o par antes/depois no Figma, a assinatura dos
dois, e a mudança saindo de tabela (logo, desfeita num commit).

**Os pesos do design:**

| peso | o que é |
|---|---|
| **leve** | espaçamento, alinhamento, contraste que corrige acessibilidade, cor literal virando token, microanimação de feedback com saída |
| **médio** | **criar o que não existe** — tela, painel, botão, ícone, componente, animação · **alterar ou aposentar a forma do que existe**, quando a nova é comprovadamente melhor · reorganizar uma tela sem mudar o fluxo · trocar paleta ou tipografia |
| **pesado** | **o que o jogador teria de reaprender** — mudar o fluxo (o que ele faz e em que ordem), tirar-lhe ou mudar de lugar algo de que ele depende, ou mexer no que o produto é. Ali o custo é a memória de quem joga, e nenhum número resolve |

**A liberdade, dita pela pessoa em 14/09/2026:** *"são livres para criar e
alterar tudo, podem fazer tudo o que for da parte visual — adicionar ou
remover, alterar o que já existe — desde que seja comprovado, seja por
estudo ou experiência, que aquilo é melhor. Não precisam ficar tímidos e
trabalhar apenas o que já existe."*

Então **a timidez é o defeito, não a ousadia.** Tela que não existe pode
nascer; forma que existe pode ser aposentada; a paleta inteira pode mudar.
O que não muda é que **"melhor" se demonstra**, e agora por três caminhos —
qualquer um serve, desde que **escrito**:

1. **Medida** — contraste, tamanho, cliques, tempo, densidade.
2. **Estudo citado** — diretriz de plataforma, norma de acessibilidade,
   pesquisa. *Citado*, com a origem: "é o padrão" sem fonte não é estudo.
3. **Experiência jogada** — o `jogo` jogou o antes e o depois e diz o que
   mudou. Vale tanto quanto número, e às vezes mais.

O que continua proibido é o quarto caminho: **achar**. "Ficou melhor" sem
nenhum dos três é opinião com confiança.

**E a ambição é dever, não licença.** Toda etapa de design entrega, além do
seu item, **ao menos uma proposta ambiciosa** em "Para a pessoa decidir" —
algo que mudaria de verdade o que o jogador vive — ou escreve no diário por
que naquele ciclo não havia nenhuma. Um ciclo que só faz o seguro está
cumprindo a letra e falhando o pedido.

**`aprendiz` e `frontend` nunca trabalham ao mesmo tempo** — dividem o mesmo
`App.jsx`, e o segundo a salvar apaga o primeiro.

---

## Commits

Português, narrativo, o *porquê* antes do *o quê*. Terminar com:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

**`git commit -- <caminhos>`, sempre. Nunca `git add` seguido de `git commit`
solto, e nunca `git add -A`.** Duas mentes trabalham na mesma árvore e
**dividem um índice só**: entre o seu `add` e o seu `commit` cabe o `add` da
outra, e o seu `commit` leva o trabalho dela junto. Passar os caminhos no
próprio `commit` fecha a janela — é a única forma que não depende de tempo.

A lei antiga dizia só "não use `add -A`", e não bastou: errou-se **duas
vezes**, e as duas foram de quem rege. Em 14/09 o commit `a6a6473` levou a
etapa T2 dentro de um commit sobre a mesa de design; em 15/09 o `e430a12`,
que fala de um relógio de 15 segundos, levou `src/guardado.js`, duas suítes e
166 linhas de `App.jsx` — a etapa X3 inteira, **sem commit próprio**.

Quando acontecer: **não reescreva história publicada.** `push --force` num
ramo que faz deploy para jogadores reais é arma apontada para o vizinho.
Reponha a verdade no diário e num commit seguinte, e siga.

**Commit local** fecha toda fase verde — automático, dentro do ciclo.

**`git push`** era da pessoa. Em 14/09/2026 ela disse *"pode ir fazendo e
subindo"*, e a lei mudou: **o ciclo sobe o que fechou**, com três condições
que não se negociam — `npm run build` limpo, `npm test` inteiramente verde, e
a árvore limpa. Vermelho não sobe, dúvida não sobe, e nada que esteja marcado
`pesado` sobe sem resposta. Push é deploy no Vercel para jogadores reais: se
alguma vez o ciclo hesitar, ele **não** sobe e diz por quê. A pessoa revoga
isto com uma frase, e esta linha volta ao que era.

---

## Memória do projeto

Estado longo e decisões vivem em
`C:\Users\clara\.claude\projects\C--Users-clara-Desktop-Taverna\memory\`
(índice em `MEMORY.md`). Consulte antes de grandes mudanças.
