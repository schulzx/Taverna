# mente/diario.md — os ciclos antigos

O registro inteiro, do mais recente para o mais antigo.

## 15/09 22:16 · v9.259 · N2 · a escada da inteligência · commit `dab5caa`

- **estado inicial:** HEAD `25cd20f`, VERSÃO **v9.258** lida do arquivo;
  `npm test` verde, build limpo, **árvore limpa**. **Sem trava — pus a minha.**
  **Não tomei o bastão do `App.jsx`:** N2 não liga nada, e a etapa inteira
  coube em `src/*.js` e `testes/`. A outra mente rodou **E2** (o endereço do
  tabuleiro) na mesma árvore o ciclo inteiro, em `grade-de-batalha.jsx`,
  `formas.md` e `check-formas.mjs` — **nenhum vermelho de lado nenhum**, e o
  commit levou só os meus seis caminhos.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/degraus.js` (a escada, as seis tabelas, `degrauDaFicha`,
  `degrauDaCriatura`, `intencoesAte`, `enxerga`), `degrauMinimo` nas 46
  intenções, campo novo no bestiário com transporte em `completarInimigo`.
  Provou a inércia contra `git show HEAD:` em **42.093 casos, 0 divergências**.
- **testes:** `testes/teste-degraus.mjs` (**113 asserções**), três sabotagens
  que mordem, e a absorção do que o backend deixara provisoriamente em
  `teste-adversario.mjs` — com o motivo escrito no arquivo, como manda a lei.
- **medição:** a previsão com a régua de N1b, 3 cenários × 4 famílias × 1000,
  pelo caminho que o App usa. Instrumento validado contra a régua do projeto
  (600 combates, 0 divergências).

### O que N2 é, e o que N2 deliberadamente não é

A escada **existe e não decide nada**. Quem passa a decidir por ela é N4, e
isso não é timidez: ligar a escada é mudar o combate de campanha viva, e a
pessoa pediu a tabela antes do motor. A suíte prova a inércia **como
propriedade**, não como sorte — **832 situações em que filtrar por degrau daria
outra resposta, e não deu**.

O desenho é da pessoa (15/09) e foi cumprido letra a letra: `pensa` virou
degrau, cada intenção declara o nível mínimo, e **o peso deixou de ser ranking
global** (está escrito no comentário da tabela; a troca em `consultarAdversario`
é de N4). Cinco degraus, as 46 em **13 / 12 / 13 / 6 / 2**, e no topo só as
duas que a pessoa nomeou.

### Decisões médias, com o motivo

- **A escala 0–3 resolveu-se por FAIXAS, não por um degrau por valor.** N1 mediu
  que os oito prontos ocupam 0, 1 e 3, com o 2 vazio — um degrau por valor
  nasceria com metade da escada inalcançável. A definição que ficou escrita no
  código: **um degrau só é morto quando fonte nenhuma o alcança**, e a fonte da
  criatura alcança os cinco. `ATRIBUTO_MAX` ganhou com isso o **primeiro leitor
  de verdade** que tem desde que existe — o item aberto que previa exatamente
  isto está fechado.
- **O companheiro não ganhou campo novo, e isso foi escolha de peso.** Ele não
  tem `atributos` nenhum; criá-los é campo em ficha viva e em todo save, que é
  **pesado** e não cabia numa etapa de tabela. Ele recua pelo `atributoChave` da
  classe — que já separa Mago de Guerreiro sem campo novo —, por tabela
  nomeada, e pelas **mesmas** faixas. Nenhuma das 12 classes chega ao topo pelo
  recuo, o que é a leitura honesta: cabeça de companheiro não é cabeça de chefe.
- **`brilhante` não se herda, declara-se** — e esta é de princípio, não de
  número. `ameaca` mede **perigo**, não **cabeça**: o Golem de Pedra é `elite` e
  não pensa. Herdar o topo é **exatamente** como `calar_a_magia` virou tirano:
  todo nome que o Narrador inventa nascia com a mente mais afiada da mesa.
  Dez das 27 declararam; o Comandante herda `treinado` e a Sentinela declara
  `bruto`, e **as duas `elite` deixam de ser a mesma cabeça** — o buraco que N1
  apontou nominalmente.
- **`menteDaCriatura` não foi substituída, e a convivência ficou escrita.** Ela
  responde **que tipo** de mente (besta · morto · pensa, que alimenta
  `ehBicho`/`ehMorto`); o degrau responde **quanta**; e existe **um único
  sítio** que computa degrau. Duas classificações de cabeça em dois lugares é a
  doença que esta casa já conhece, e a saída não foi apagar uma — foi dar a
  cada uma a sua pergunta.
- **Três comentários voltaram ao backend porque descreviam um mecanismo que a
  medição mostrou ser outro** (peso leve, zero lógica): o do Colosso em
  `bestiario.js`, que explicava a declaração por um caminho que só existe **com
  o `desc`** — e `degrauDaCriatura` roda com nome + ameaça; o teto da ficha, que
  dizia "custa 5" quando `tetoAtributo` chega a **8 no nível 20**; e o da
  convivência, que agora carrega o limite medido. **Comentário que mente é pior
  que comentário que falta** — quem o lê decide com ele.

### O número que julga a fase, e ele não é o que a fase esperava

**No `justo`, a vitória iria de 1,40–1,80% para 86,70–87,70%.** É **boa demais**:
10,8 margens acima do teto de 65%, e **mais generosa com o grupo do que o
inimigo não ter piloto nenhum** (51–54%). Os três dentes da
`CATRACA_DE_UMA_VIDA` ficam vermelhos, agora todos pelo lado do excesso — e
**nenhum limiar foi afrouxado**. `duro` 0,0% → ~31% (as famílias **discordam**
ali a n=1000: esse número ainda mede resorteio); `brando` continua 100%, e as
12 quedas em 4000 de N1b viram 0. **A saturação continua** — era 0,0 · 1,6 ·
100, passa a 31 · 87 · 100: o `justo` não volta a ter resolução nos dois
sentidos, **muda de encosto**. A ressalva de N1b segue de pé.

**E a promessa de que distribuir por degrau "acorda o acervo morto" está
desmentida nesta régua: o acervo encolhe** — de 8 intenções eleitas para **2**.
A causa é estreita e está medida: **na rodada 1 do `justo` só 2 das 46 disparam**
— a do topo e a da rede, sem nada entre elas. Tirar o topo entrega a rodada ao
chão, que mira o primeiro da lista, que é o herói — o único que não morre ao
cair. Não é que o inimigo fique burro: **ele passa a bater onde o dano se
perde.** E quem tranca o acervo é a **aderência**, não a escada: sem a memória,
a eleição por degrau daria **8 distintas**.

**Medir antes de ligar era o ponto.** Se N2 tivesse entregado a tabela e
seguido, N4 nasceria acreditando que tirar o tirano resolve — e a régua só
diria o contrário depois de o combate de campanha já ter mudado.

### O que ficou

- **Para a pessoa:** a pergunta de N1b — *quanto do alvo tático você quer
  manter?* — passa a ter número nas três saídas, e está escrita em "Para a
  pessoa decidir". **N4 não anda sem ela.**
- **Aberto, novo:** `resist: ["fisico"]` está declarado em quatro criaturas e a
  mesa **nunca o vê** (`danos.js:73` curto-circuita antes de olhar `resist`) —
  0 de 300 combates de diferença. É o padrão do Troll da v9.152. **Não foi
  consertado de carona:** ligar resistência física endurece o combate, e a Fase
  N está exatamente a medir dureza — entra sozinho ou some dentro de outro
  número.
- **Aberto, atualizado:** o `desc` que `completarInimigo` não copia deixou de
  ser estimativa — **com `desc` são 18/27 em `pensa`; sem, são 19**, e o
  Colosso é a única diferença.
- **Herdado por N4, escrito no código:** `pensa` é binário e **vence a
  declaração do bestiário** — o Lich, `brilhante` declarado, não corta a magia e
  é o inimigo mais fácil da régua inteira (97–98% de vitória do grupo). A
  escada deixa passar; quem barra é a porta antiga.

## 15/09 17:03 · v9.257 · X3 · o turno guardado · commit `e430a12` (ver a nota do fim)

- **estado inicial:** HEAD `0a5972f`, VERSÃO **v9.255**; `npm test` verde,
  build limpo. A árvore tinha só arquivos da outra mente (o `regente` fechando
  **K1**). **Sem trava — pus a minha.** **Tomei o bastão do `App.jsx`** às
  19:31 UTC, para a mão do `frontend`; devolvido ao fechar este bloco.
  A outra mente bumpou a VERSÃO para **v9.256** no meio do ciclo (K1), então a
  minha é a **v9.257** — lida do arquivo, como manda a lei.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/guardado.js` — a tabela dos sete silêncios, o selo do turno
  já resolvido, a impressão determinística do envelope, a trava e a conta das
  tentativas. 82 asserções na prova dele, zero rede.
- **frontend:** a fiação em `App.jsx`, toda em `calou` — o guardado no save e
  no load, o retry mandando o envelope preso, as **três** portas do declarar
  travadas, o técnico fora da tela e íntegro no console.
- **testes:** `testes/teste-guardado.mjs` (102 asserções) e
  `testes/check-guardado.mjs` (a catraca, cravada em **9** envelopes).

### O que passa a ser guardado, e por que isto é regra e não conforto

O motor rola **antes** de a IA falar: o dado cai, o dano entra, a ação se cobra,
e só então o envelope sai para narrar. O defeito de hoje não era ficar sem
prosa — era **a ação ser jogada fora**. Mas a razão dura é outra: se o turno
**re-rolasse** na tentativa seguinte, uma queda de rede viraria **re-rolagem de
um resultado ruim**. Numa casa cuja primeira lei é determinismo por semente,
isso é um buraco que não parece exploit — **parece azar**.

Por isso a suíte não prova que o módulo guarda; prova que **não se re-rola**:
o envelope narrado depois tem a **mesma impressão** do que o motor produziu
antes, byte por byte, e o **contador de rolagens continua em 1** depois de três
tentativas. E a contraprova, que é a que fecha o argumento: re-rolar sobre o
estado **já alterado** (inimigo ferido, ação cobrada) **não repete** — sorteia
outra vez. Está escrita com todas as letras no bloco 3 da suíte.

### O que o jogador lê quando o Mestre cala

A voz é de mundo, e o nome do mecanismo não aparece. No silêncio, a frase da
classe (sete delas, uma por tipo de queda). Ao esbarrar na trava:
*"⏳ O que você acabou de fazer ainda não foi contado, e a mesa não anda sem a
palavra do Mestre. Peça a ele que conte, e então siga."* — a segunda sentença
só vem quando insistir resolve. O **"Tentar de novo" só aparece quando insistir
resolve**: oferecê-lo contra falta de crédito seria mentir duas vezes.

O motivo técnico desce **íntegro ao console**, como argumento separado para não
ser aparado, com o id do silêncio, a conta de tentativas e a marca do turno.
Foi esse vazamento que permitiu diagnosticar duas quedas — **quem apaga o
motivo fica cego**.

### Decisões médias, com o motivo

- **A catraca nasceu mordendo, e era o ponto.** Pegou um envelope resolvido que
  escapava do selo: `[MASMORRA — … COMBATE JÁ ABERTO PELO SISTEMA]`, que sai
  **depois** de `abrirCombate` ter trocado a ficha e **rolado a iniciativa**.
  Decidi que **trava**, e a régua ficou escrita para o caso seguinte: *trava
  quando o sistema mexeu na ficha, não quando apenas anotou um fato.*
- **A terceira porta.** A fiação travou `declararGolpe` e `agirInterno`; a mão
  que as fiou **achou uma terceira** — `declararAcaoRapida`, o painel de Ações,
  que chama `adjudicarAcao` direto. Com ela aberta o painel ainda rolava, e o
  buraco continuaria de pé. Fechada, com o texto do jogador devolvido à caixa.
- **A conta das tentativas voltou para o módulo.** Tinha ficado dentro do
  `catch` de `enviar`, à mão. *Conta se prova, tela se olha:* uma regra que só
  existe dentro de um `catch` de vinte mil linhas é uma regra que ninguém pode
  provar. `guardarTurno` passou a aceitar `anterior`, sem export novo.
- **`irMenu` solta o turno preso** (fora da minha lista, e mantive): sem isso um
  guardado sobrevive à volta ao menu e **trava a primeira ação de uma campanha
  nova** na mesma aba.

### O que ficou

- **O envelope sem selo de `App.jsx:13029`** (invisibilidade/voo/luz): sai
  **depois** de o PM ser descontado e a pilha de efeitos trocada, com um
  cabeçalho que é só o nome da magia — então não trava, e o jogador pode pagar
  o PM duas vezes. Não é linha faltando na tabela: **falta selo**, e o conserto
  é batizar o envelope no App (o irmão dele, `:13041`, já sai selado). Foi para
  a pauta como **leve**, com o diagnóstico pronto, porque subir a catraca de 9
  para 10 toca três arquivos e este ciclo já teve duas voltas de correção.
- **Comentários sem acento** nos trechos novos do `App.jsx`: o script `.cjs` de
  âncora evita acento para não ser mutilado pelo shell, e o resto do arquivo é
  acentuado. Pauta, **leve**.
- **X3b e X3c não foram tocadas**, como combinado. X3 vale sozinha.

### A nota que importa mais que o resto: o commit não é meu, e o índice é compartilhado

**O X3 inteiro está dentro de `e430a12`, um commit da outra mente** — cujo
título fala de um relógio de 15 segundos e não menciona nada disto. Aconteceu
no intervalo entre o meu `git add` (caminho a caminho, como manda a lei) e o
meu `git commit`: nesse instante o `regente` commitou, e o índice levou junto
`src/guardado.js`, os dois arquivos de teste, o meu `App.jsx` e o meu bump.
Quando fui commitar, a árvore estava limpa e o meu commit não tinha o que
dizer. `e430a12` **já estava em `origin/main`** quando descobri.

**Não reescrevi história**, e a razão é a mesma que proíbe `git stash` aqui:
seria uma arma apontada para o vizinho, e ainda por cima um `push --force` num
ramo que faz deploy para jogadores reais. O código está em `main`, verde e no
ar; o que se perdeu foi a honestidade do registro, e é este bloco que a repõe.

**E o achado é de lei, não de azar:** o `CLAUDE.md` manda somar os caminhos um
a um e proíbe `git add -A` — mas **o índice do git é compartilhado pelas duas
mentes**, então nem o `add` disciplinado protege: existe uma janela entre
somar e commitar em que o commit do outro leva o que você somou. O conserto é
não usar o índice: **`git commit -- <caminhos>`**, que commita os caminhos
direto e não deixa janela nenhuma. Foi assim que este bloco entrou. Está na
pauta para a pessoa, porque mexe numa lei da casa.


## 15/09 17:05 · v9.255 · X2 · o golpe sai do botão · commit `fc86e53`

- **estado inicial:** HEAD `628e70f`, VERSÃO **v9.254** (o ciclo E1 do `regente`
  já a tinha bumpado — o meu é o v9.255), `npm test` **183/183 suítes + 11/11
  varredores** verde, build limpo, árvore limpa. **Sem trava — pus a minha.** A
  outra mente roda **K1** ao lado, só no Figma. **Tomei o bastão do `App.jsx`**
  às 15:19 e o devolvi ao fechar este bloco; foi usado pelo `frontend` e por
  mim (a correção dos comentários de versão).
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, e a etapa estava
  escrita. Pauta com itens de sobra.
- **backend:** `src/golpe.js` — o veredito do golpe, puro: `ALCANCES`,
  `alcanceDoGolpe`, `vereditoDoGolpe`, `fraseDoGolpe`, `VERBOS_DE_COMBATE`; mais
  `testes/teste-golpe.mjs`, 64 asserções.
- **frontend:** a fiação — `resolverAtaqueJogador` passou a ler `golpe.js`, a
  extração `aplicarGolpeDoJogador` nasceu com **dois chamadores**, e o botão
  `Atacar` virou chamada com o alcance mostrado antes do clique.
- **testes:** a catraca desceu de **7 para 6**, as asserções que inverteram
  ganharam o motivo escrito, e o varredor foi **reapontado, não apagado**.

### O que a etapa era, e por que não era o botão

A redação original de X2 dizia *"o botão passa a chamar o motor"*. **X1 provou
que isso sozinho teria produzido um jogo pior:** a luta abre a **12,0–25,5 m**,
o corpo a corpo alcança **1,5 m**, e **10 de 10 plantas recusam no turno 1**.
Clicar `Atacar` daria *"longe demais"* dez vezes seguidas, e pareceria que o
conserto falhou. Então X2 foi **o pré-requisito garantido e mostrado**, e a
porta única do motor — nessa ordem.

**O molde, seguido e não reinventado** (é o dos 8 que já funcionavam): o id vira
a frase canônica (`fraseDoGolpe`, nunca string à mão) → porta única com direito
de recusar (`declararGolpe`, `App.jsx:11851`) → o módulo puro decide antes de
qualquer efeito → a frase entra no log **depois** de aceita → o turno se cobra
explicitamente. A extração `aplicarGolpeDoJogador` (`:11749`) tem **dois
chamadores e nenhum terceiro**: o teclado e o botão resolvem pelo mesmo código.
Um golpe que resolvesse por dois códigos seria o defeito que a fase existe para
matar.

### A conferência viva, na campanha de verdade (e sem gastar o Narrador)

Não foi preciso injetar nada: **os dois espaços de save já tinham luta aberta
com grade**. Com Halvard a 3 m e alcance de 1,5 m, o botão veio `disabled` e a
linha leu **"Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."**
— exatamente o que `vereditoDoGolpe` prevê em Node. Aba nova, porque **HMR mente
depois de rename** e houve extração; console limpo, sem `LimiteErro`.

**O que eu NÃO consegui conferir vivo, e é honesto dizer:** o ramo aceso. A
campanha estava na **vez do mundo**, e virar o turno custaria uma chamada ao
Narrador. O ramo aceso está provado em suíte (o veredito vira para permitido
depois de 2 passos, medido com `alcancaveisDe`), não na tela. **X4 fecha isso.**

E o save da campanha voltou **byte a byte**: só `sessao` e `salvoEm` tinham
mudado (contadores de sessão e o carimbo do autosave), e os dois foram
restaurados — hash conferido contra a cópia feita antes de tudo.

### Decisões médias tomadas (com o motivo)

- **O `36` e o "+ um quadrado" saíram do meio do `App.jsx` para `ALCANCES`.**
  Eram constantes de regra soltas dentro de `resolverAtaqueJogador` — a primeira
  lei da casa. **Os valores são idênticos:** mover número para tabela sem mudar o
  número era o objetivo, e **nada foi rebalanceado** nesta etapa.
- **O status quo da recusa de graça foi mantido, e por isso o botão impede o
  clique em vez de recusá-lo depois.** Passar a cobrar mudaria o que o jogador
  vive, e isso é da pessoa — está na pauta, com proposta e porquê.
- **Os comentários novos diziam `v9.222`, e eu os corrigi para `v9.255`.** As
  mãos leram o *"hoje v9.221"* do `CLAUDE.md` e inferiram o número seguinte — mas
  **v9.222 já existiu**, e é de outra coisa (a conta sazonal de `encontros.js`).
  Um comentário que mente sobre quando um órgão nasceu é pior que comentário
  nenhum. Corrigido por `node`, com catraca no próprio script, e só onde o texto
  dizia Fase X — o `v9.222` legítimo continua onde estava.
- **A asserção de `teste-golpe.mjs` que o `backend` escreveu "para mudar de lado
  em X3" mudou de lado agora**, porque a fiação veio em X2 e não em X3; e a
  dívida `AGUARDANDO` de `teste-ligacao.mjs` foi paga no mesmo dia em que nasceu,
  pelo mesmo motivo. As duas com o motivo escrito ao lado.

### O que ficou

- **Duas bifurcações foram para "Para a pessoa decidir"**, com recomendação e
  porquê, e **não foram decididas aqui**: (a) a recusa fora de alcance continua
  de graça ou passa a custar o turno — a mente recomenda **continuar de graça**,
  e observa que isso só fecha quando o **teclado** ganhar o mesmo aviso que o
  botão tem (é a W2, já aprovada); (b) **`Esquivar`, `Empurrar`, `Derrubar` e
  `Ajudar` não têm motor nenhum** — não é fiação que falta, é mecânica, e a
  ordem recomendada é `Empurrar`/`Derrubar` primeiro, `Esquivar` depois,
  `Ajudar` por último.
- **X2 não encurtou a caminhada.** Continuam 2 a 3 turnos andando antes do
  primeiro golpe corpo a corpo; o que mudou é que agora ela é **visível antes do
  clique**. Quem quiser encurtá-la mexe em `posicionar`, e isso é outra conversa.
- **A tela de batalha por toque é a Fase W**, do desenho, e **não foi
  antecipada**. X2 usou as formas que a mesa já tinha decidido em E1 — a
  Consequência *Linha* (nunca balão), o estado *Impedido* com a razão, o botão
  que não escreve preço. O que faltava de forma não foi inventado aqui.
- **A régua de X1 ficou intacta para X4:** a política da sonda não mudou (mesma
  planta, mesmos 7 turnos, mesma fórmula), para os dois números continuarem
  comparáveis. O `testes` acrescentou uma medição **ao lado**, sem tocar na velha.

---

## 15/09 15:20 · v9.253 · X1 · o que chega ao motor, e o que vira frase · commit `bf9dd49`

- **estado inicial:** HEAD `c3f4fd3`, VERSÃO v9.252, `npm test` **182/182 suítes
  + 10/10 varredores** verde, build limpo. **Sem trava — pus a minha.** O
  `regente` roda **E1** ao lado (a tela de batalha no Figma); a árvore tinha
  `mente/e1-jogo.md` e `mente/e1-desenho.md` dele, que não toquei. **O bastão do
  `App.jsx` não foi tomado: X1 mede, e leitura não precisa de bastão.** Nenhuma
  linha de `src/` mudou nesta etapa, nem o bump — que é de `constantes.js`.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, e a etapa estava
  escrita.
- **backend:** mapeou o caminho de cada ação do jogador e o inverso — o que o
  motor expõe e nenhum clique chama —, tudo com arquivo e linha, sem editar nada.
- **testes:** mediu a taxa de turnos estéreis com sondas determinísticas sobre
  os módulos puros, **achou a causa verdadeira do 7-em-7**, e depois transformou
  a medição em régua permanente: a tabela, a suíte, o varredor e a sonda.

### A conta que a etapa pediu

**1. Cada ação do jogador, e para onde ela vai.** São **20 botões** no painel de
Ações: **12 `ACOES_PRONTAS`** (`App.jsx:1071-1084`) com **um handler único que
só faz `setEntrada`** (`:20564`) — o botão não dispara nada, só enche a caixa —
e **8 `ACOES_RAPIDAS`** (`desafios.js:621-633`) que entram no motor pelo
despachante (`:20593` → `declararAcaoRapida` → `adjudicarAcao`). **Nenhuma das
20 é de combate.** Fora do painel, só **mover no grid** (`moverPara`,
`App.jsx:14229`), **beber da bolsa** (`usarConsumivelUI`, `:19265`) e o
**heroísmo** (`:14902`) chegam ao motor por clique — e nenhum dos três é um
golpe. Das 12 prontas, **6 escrevem frases que leitor nenhum lê**, e **4 dessas
6 são ações de combate** (Esquivar, Empurrar, Derrubar, Correr).

**2. O motor sem chamador.** Dos três módulos de combate, **21 funções não têm
um único uso no corpo do `App.jsx`** — 10 de `combate.js`, 8 de `habilidades.js`,
3 de `efeitos.js`. **Conferi por conta própria e o número bate exatamente**; e
achei mais **16 tabelas/consts** na mesma situação, que não estavam na conta.
**E o `testes` refinou a conta, que é melhor do que eu a tinha pedido:** "sem
chamador" misturava três coisas diferentes, e agora são três listas separadas —
`semClique` (o App importa e nunca chama: **3** em `combate.js`, e **0** em
`habilidades.js` e `efeitos.js`), `soInterno` (só o próprio módulo chama: 5 + 4 +
3) e `morto` (ninguém chama, em lugar nenhum). A distinção importa: `soInterno`
não é dívida, é encapsulamento. Um nome saiu das listas por mérito —
`maiorVaoSemGanho` tem leitor em `teste-onda3.mjs:33` —, com o motivo escrito e
uma asserção guardando a exceção.
`habilidades.js` expõe 37 funções e **zero** têm chamador por clique. O caso
extremo: **`gastarRecurso` (`combate.js:745`) não tem chamador nenhum no
repositório** — o App faz a conta da economia à mão (`eco.acao -= 1`, `:13234`),
e `combate.recursos`, escrito ao abrir a luta (`:5230`), **nunca é lido**.

**3. Turnos sem um número mudar: o 7 em 7 se reproduz** — deterministicamente,
sem IA. Mas **a causa não era a que a fase supunha**, e este é o achado da etapa.

### O achado: a trava é geométrica, e ninguém a tinha nomeado

O botão não é o obstáculo principal. `resolverAtaqueJogador` **existe e é bom**.
O golpe morre antes: `posicionar` (`grid.js:551-576`) abre a luta com o herói em
`y = altura-1` e o inimigo em `y = 0`. **Medi as 10 plantas: abertura de 12,0 m
(taverna) a 25,5 m (masmorra), e 10/10 recusam o alcance de 1,5 m no turno 1.**
Pior: `semAlcance` recusa **de graça** (`App.jsx:13219-13225`, deliberado desde
a v9.20), sem gastar a ação — logo `resolverRevide` (`:14034-14038`) nunca roda
e **a rodada nunca vira**. O jogador ataca sete vezes, o sistema recusa sete
vezes sem cobrar nada, e o inimigo também não age. PV 20/20, PM 6/6, XP 89/300 —
exatamente o que o `jogo` viu. São **2–3 turnos só andando** antes que um golpe
corpo a corpo possa rolar.

**Duas honestidades que a medição obriga:** a recusa **não é muda** (o jogador
recebe a linha 📏 com a distância e um *"Aproxime-se primeiro"*); e a armadilha
é sobretudo do corpo a corpo — mas **nem o arco escapa**: a 36 m, **3 das 10
plantas continuam recusando** (taverna, caverna, navio), por parede no caminho.
X2 **não pode tratar "tem alcance" como "pode acertar"**.

**E o par que nunca foi composto.** Duas suítes verdes provavam isto juntas:
`teste-grid.mjs:198` garante que o herói começa a mais de 6 m — **como feature**
—, e `teste-alcance-e-achado.mjs:45` garante que longe é recusado. Ninguém nunca
afirmou que existe caminho do começo da luta até um dado rolado. Conferi as duas
citações: estão exatas. **Não as toquei** — X1 mede, não conserta.

**4. O padrão dos 8 que funcionam** (o molde que X2 copia): o botão lê a caixa
como *alvo*, limpa e chama um despachante; o `id` vira **a frase canônica que um
jogador escreveria** (`fraseDaAcaoRapida`); **porta única com direito de
recusar** (`if (adjudicarAcao(frase)) return;` — `false` devolve o turno à IA);
o **módulo puro decide antes de qualquer efeito** (`veredictoDaAcao`, e o App não
calcula dificuldade); a frase só entra no log **depois** de a porta aceitar, no
par `pushMsgs([jogador, sistema])`; e **o turno se cobra explicitamente**.

### Decisões médias tomadas (com o motivo)

- **A régua de X1 mora em `testes/`, não em `src/`.** Precedente de N1
  (`ADVERSARIO_NA_REGUA`): instrumentação não é regra de jogo, e um módulo de
  `src/` que a aplicação nunca importa é export morto esperando para acontecer.
- **X1 deixa catraca, e não só relatório.** `testes/acoes-do-jogador.mjs` (a
  tabela), `teste-` e `check-` do mesmo nome, e `testes/sonda-turno-esteril.mjs`
  — porque **o scratchpad não sobrevive à sessão e X4 tem de repetir esta conta
  com o mesmo procedimento**. A asserção que importa é um teto que **só
  desce**: `TETO_SEM_MOTOR = 7`, a lista nomeada das ações de combate sem
  caminho ao motor. X2 baixa o número no mesmo commit em que faz o botão
  chamar o motor; subir é regressão.
- **Separei dois eixos que estavam colapsados num só** na primeira versão da
  tabela: *o clique chega ao motor* e *a frase enviada chega ao motor*. São
  coisas diferentes — `Saltar` alcança o motor pelo texto, mas o clique só
  enche a caixa —, e a manchete de X1 depende de qual dos dois se conta.

### O que corrigi na pauta (a medição manda na pauta, não o contrário)

- **X2 reescrita.** O alvo mudou: o caminho até `resolverAtaque` já existe e não
  precisa ser inventado; o que falta é **garantir o pré-requisito antes do
  clique** e mostrar distância e alcance (o veredito antes do clique). Registrei
  os dois precedentes de dentro de casa (mover e bolsa) além do molde dos 8. E
  deixei **duas bifurcações que são da pessoa, não do ciclo**: (a) se `semAlcance`
  passar a cobrar a ação, o jogador que erra o alvo perde o turno — muda o que
  ele vive; (b) **Defender/Esquivar não existe no motor**, e dar-lhe mecânica é
  mecânica nova, logo `pesado`.
- **X3 eu corrigi e a correção caducou no mesmo ciclo** — e isso merece ficar
  escrito. Eu tinha posto debaixo dela o achado de que **a economia do turno não
  é do motor**; enquanto o ciclo rodava, **a pessoa reescreveu X3 noutra sessão**
  (passou a ser *"o silêncio do Mestre é honesto"*: sem narrador, sem turno,
  declarado provisório) e a minha redação foi por cima. A decisão dela manda —
  **eu não a desfiz**; mudei o achado de lugar, para "Aberto", com a nota de que
  o dono natural dele é X2. Um achado medido não pode morrer porque a etapa que
  o hospedava trocou de assunto.
- **X4 ganhou a régua e a linha de base cravadas**, com a política fixa escrita,
  para os dois números serem comparáveis.
- **Três itens novos em "Aberto"**, todos achados desta medição: a catraca do
  export morto **conta ocorrências, não leitores** (uma linha de `import` não
  lida vale como leitor — `App.jsx:7` tem 9 imports mortos de `combate.js`, e é
  por essa fresta que `gastarRecurso` passou); a reação escolhe por
  **`Math.random()`** (`reacoes.js:96`), **fora da semente**, contra a lei do
  determinismo, e o jogador nunca escolhe nenhuma das 6; e os **seis literais
  mortos** do painel, dois deles conserto de uma linha (`enganar` não casa
  porque a regex tem `engano` — **o mesmo bug já consertado para a fileira de
  baixo em `desafios.js:629-631` e nunca para esta**; `Correr` não casa porque
  `RETIRADA` exige `corro para (fora|longe)`).

### O que ficou

- **X1 não consertou nada, de propósito** — nem os dois literais de uma linha.
  Consertar sem a catraca junto é como a terceira frase morta nasce no ciclo
  seguinte, e o varredor novo já tem onde morar.
- **Uma armadilha de medição, escrita para X4 não cair nela:**
  `montarGrade({ planta })` **não** monta a planta pedida — `cenarioDe`
  (`grid.js:286`) lê outras chaves e cai em `estrada` **em silêncio**. Na minha
  primeira conferência isso trocou a masmorra pela estrada e encurtou a abertura
  de 25,5 para 16,5 m sem um aviso. Quem medir grade tem de conferir a
  largura×altura que recebeu.
- **Nada foi para "pesado"** além das duas bifurcações de X2, que ficaram
  escritas na própria etapa para a pessoa responder quando ela chegar.
- **Um aviso de convivência, sem culpa e sem conserto:** enquanto este ciclo
  rodava, **outra sessão commitou `mente/pauta.md` com as minhas edições de X1
  dentro** — `184bf1c` e `9b7aa61`, cujas mensagens falam de outro assunto. É
  exatamente o que a lei *"nunca `git add -A` com um ciclo em curso"* previne: a
  história passa a não dizer o porquê de parte do que carrega. **Não desfiz
  nada** — o conteúdo está certo, só está guardado sob o título errado —, e
  registro aqui para quem for ler o `git log` depois não procurar X1 num commit
  que não fala dele. Por isso este commit leva `diario.md`, as quatro peças da
  régua e o bump, e a pauta só com o que escrevi depois daqueles dois.

## 15/09 13:45 · v9.251 · N1b · a régua enxerga o Adversário · commit `061c5bf`

- **estado inicial:** HEAD `c8da685`, VERSÃO v9.250, `npm test` **182/182
  suítes + 9/9 varredores** verde, build limpo. Sem trava — pus a minha. O
  `regente` roda **D5** ao lado; a árvore tinha `mente/pauta-desenho.md` e
  `mente/agora.json` dele. **Nenhum arquivo dividido:** meu território foram
  duas suítes, e o **bastão do `App.jsx` não foi tomado** — nenhuma linha de
  `src/` mudou nesta etapa, fora o bump.
- **conselheiro:** **não chamado** — fase aprovada, e a pessoa pediu hoje
  *"consertar e re-medir tudo"*.
- **testes:** ligou a intenção à régua pelo caminho que o App usa
  (`lutaDaMesa` → `intencaoDaVez` com memória por combate → `prioridade` no
  `turnoDosInimigos`), pôs o porquê inteiro em `ADVERSARIO_NA_REGUA`
  (tabela nomeada, com os campos de mundo que a régua não tem e as 34
  intenções que por isso ficam inalcançáveis), e re-mediu os três cenários
  em 4 famílias × 1000.

### O defeito, e o que ele custou

A régua passava `prioridade: ""` (`regua-combate.mjs:612`) e `combate.js:279`
só consulta `escolherAlvo` quando a prioridade existe. O jogo passa a intenção
(`App.jsx:13606`). **B1, B1b, B2 e T1 mediram Uma Vida com o Adversário fora do
circuito** — mediram o sorteio de 35% e mais nada. Nenhuma suíte ficou vermelha
por isso, porque a suíte provava o instrumento contra ele mesmo. **Um
instrumento que difere do jogo em silêncio é pior que nenhum instrumento**, e
agora isso está escrito nos dois arquivos, no sítio onde a prioridade nasce.

### A linha de base nova (4 famílias × 1000, os três cenários)

| cenário | métrica | desligado (B1/B2/T1) | **ligado (o jogo)** |
|---|---|---|---|
| justo | vitória | 51,1–54,2% | **1,4–1,8%** |
| justo | PV do grupo (de 132) | 25,88–28,05 | **0,41–0,64** |
| justo | quedas (de 3) | 1,740–1,790 | **2,978–2,986** |
| justo | TPK | 45,8–48,9% | **98,2–98,6%** |
| justo | 1ª queda | rodada 4,30 | **rodada 1,05** |
| justo | duração | 7,70–7,75 rodadas | **6,01–6,12** |
| duro | vitória | 8,8–9,9% | **0,0%** |
| duro | PV / quedas | 3,11–3,53 / 2,80–2,82 | **0,00 / 3,000** |
| brando | vitória | 100% | **100%** |
| brando | quedas | **0** em 4000 | **12** em 4000 (2 · 6 · 0 · 4) |
| brando | PV do grupo | 124,34–125,01 | **115,56–115,91** |

`estourouTeto` continua **0** nos três. O molde antigo é reproduzível byte a
byte com `comAdversario: false`, e a suíte **afirma** que ele reproduz 52,1% ·
25,88 · 1,790 — para a história de B1/B2/T1 não passar a mentir.

### A estimativa de N1: **confirmada, e cravada**

A reconstrução no scratchpad previu **52,1% → 1,8%** no `justo`. A régua
consertada mede **1,8%** na família do retrato. No `duro`, o destino confere
(0,0%); só o ponto de partida estava um pouco abaixo na reconstrução (8,4%
contra os 8,8% de régua).

### Por que, em uma linha, e o número que explica

**Em 100% dos combates a rodada 1 elege `calar_a_magia`**, e a aderência por
combate (a memória `antes`) mantém o fogo no conjurador; depois vem
`matar_o_remendo` (782 dos 1000 combates). A oposição concentrada desperdiça
**cinco vezes mais** golpe em corpo caído (0,94 → 4,99 por combate) e ainda
assim varre a mesa: o desperdício é barato perto do que a concentração compra.

### A catraca: **vermelha no primeiro dente, e não afrouxada**

Vitória 1,4–1,8% contra o piso de 35% — folga **−46,1 margens**.
`pisoDeVitoria`, `tetoDeVitoria`, `tetoDePvDoGrupo` e `pisoDeQuedas` estão
**intactos**. O dente 1 virou `pendente(...)` — imprime em todo `npm test` e
não derruba a suíte — pelo roteiro desta casa: **dívida conhecida entra como
pendente, não como vermelho**, e esta dívida é de BALANCEAMENTO, que é decisão
da pessoa. Os dentes 2 e 3 continuam asserção e ficaram verdes **por
saturação**, não por equilíbrio (0,5 PV de 132 contra teto 35; 2,98 de 3
contra piso 1,2) — e está escrito ao lado deles que é assim que se lê o verde.

### O achado que a Fase N tem de ler antes de seguir

**O `justo` deixou de ser o cenário com resolução nos dois sentidos** — era a
razão inteira de ele existir. Os três estão saturados hoje (duro 0,0% · justo
1,6% · brando 100%), e uma mudança de combate julgada neles não prova nada em
direção nenhuma. **Não recalibrei**, e isso é a trava que a pessoa pediu: a
régua mede, ela não escolhe o jogo.

- **decisões médias tomadas:**
  - **converter o dente 1 em `pendente` em vez de deixar a suíte vermelha.**
    Motivo: o roteiro do ciclo diz que dívida conhecida entra como
    `pendente(nome, motivo)`; e vermelho na árvore bloqueia toda etapa
    seguinte por uma dívida que **só a pessoa** pode quitar. O limiar não se
    moveu um dígito, e a razão da conversão está escrita no lugar da asserção.
  - **o guarda do `brando` ("ninguém cai") também virou `pendente`.** 12 em
    4000, com uma família ainda medindo zero: um limiar aí mediria resorteio
    (lição de A4 e C2b). Ficou no lugar a asserção de que **sem** Adversário
    continua sendo zero — a prova de que a queda nova vem da intenção e não de
    regra mexida.
  - **as três sabotagens da seção 7 foram remedidas e trocadas de cenário**
    (nv8 → o próprio `justo`; 3 elites nv9 → 1 elite nv6; grupo nv7 → nv12), e
    o **controle inverteu de papel**: passou a ser 4 elites nv3, o único que a
    régua mede verde nos três dentes hoje. Motivo: dente que não morde não é
    dente, e um controle vermelho não controla nada. **Nenhum limiar mudou.**
  - **`primeiraQueda` no `brando` foi generalizada, não apagada:** vale agora
    para os dois casos (n = 0 com margem infinita, ou uma rodada de verdade).
    O que ela sempre quis provar — a régua não inventa média sem amostra —
    ficou mais forte, e deixou de depender de qual família cai no índice 0.
- **o que ficou, e é da pessoa:** **o número catastrófico, e eu parei nele.**
  Não toquei em dificuldade, bestiário nem prontos. A pergunta pesada que já
  estava em *Para a pessoa decidir* continua lá, agora com número de régua no
  lugar da reconstrução. Para informar a decisão e nada mais, a régua mediu
  que **4 elites de nível 3 põem a mesa de volta em 41,8–50,0%** de vitória
  (PV 17,8–21,3, quedas 2,42–2,49: os três dentes verdes), e **3 elites de
  nível 6 dão 36,4–42,0%**.
- **e um aviso para B2, se ela voltar:** a escada do bônus ofensivo escrita em
  `CATRACA_DE_UMA_VIDA` (~2,9 pontos de vitória por ponto de dano, vermelho em
  +5) foi medida sem Adversário e **não vale mais**. Remedi-la é fase, não
  conserto de instrumento — não foi feita aqui.

---
## 15/09 01:30 · v9.250 · a contagem das 148 habilidades · commit `bc74f1e`

- **estado inicial:** HEAD `8dd1579`, VERSÃO v9.249, `npm test`
  **182/182 suítes + 9/9 varredores** verde, build limpo. **Havia um ciclo
  morto:** `mente/agora.json` estava sujo com os itens deste mesmo item e
  **sem trava** — alguém começou esta contagem e morreu antes do primeiro
  passo. Nada de `src/` ficou pela metade (a árvore só tinha o `agora.json`),
  então não desfiz nada: pus a trava e assumi o item.
- **conselheiro:** **não chamado** — a pessoa pediu esta medição diretamente
  e está esperando o número.
- **backend:** classificou as **148** `HAB()` uma a uma contra a cadeia real
  de resolução, com script que roda os detectores de verdade ao lado do
  julgamento; depois re-triou o balde 3 em três degraus.
- **testes:** inventariou o caminho existente — `FUNCOES_DO_SISTEMA` (11
  verbos, saturada), os 11 ramos de `usarFuncaoMagica`, e quais famílias de
  `habilidades.js` são tabela aberta.
- **decisões médias tomadas:** **nenhuma no código. O ciclo é um retrato e
  não consertou uma linha** — nem as duas que T4 já conhecia. O único código
  que mudou foi o bump.

### O item: o número que a pessoa pediu

Ela devolveu a pergunta em 14/09 — *"não vejo utilidade pra um órgão cuidar
de somente duas habilidades"* — e pediu o número antes de decidir. Ele é:

**Balde 1 (cumpre na mesa) 56 · Balde 2 (é só prosa) 26 · Balde 3 (promete e
não cumpre) 66.** Soma 148.

O critério está escrito e é reproduzível, e o de fronteira que mais move o
número é este: **dano sozinho é prosa**. "Extra", "massivo", "devastador" são
adjetivos sem tabela — nenhuma das 148 tem `danoBase`. Contá-los no balde 1
inflaria; no balde 3 encheria de vinte e cinco quase-iguais que não pedem
motor nenhum.

### A divisão que decide, e ela desmente a pergunta

O balde 3 em três degraus: **(a) LINHA 21 · (b) LIGAÇÃO 33 · (c) NOVO 12**.
**54 das 66 não precisam de mecânica nova.**

O achado que reorganiza tudo não estava na pergunta: **os motores já existem,
eles apenas leem outra fonte.** `amortecerDano` (`tracos.js:161`) já corta o
dano recebido e roda vivo em `App.jsx:13635` — lendo o **traço racial**. O
piso de 1 PV existe com número. `removerPelaPorta` tem **um** chamador (a
magia do grimório); `curarAliado`, **um** (a poção). Raça tem despachante,
dádiva tem, magia tem, poção tem, relíquia tem. **A habilidade de classe é a
única fonte de poder do jogo que não tem despachante.** Não é um buraco de
mecânica: é um buraco de **fiação**.

Por isso a recomendação da mente não é órgão **nem** "duas ligações avulsas":
é **uma porta só** — `porHabilidadeDeClasse` no laço que já existe
(`App.jsx:13067` e `:13187`) + o nome em `temRegraPropria`. Ela não inventa
mecânica; faz a habilidade de classe alcançar o que todos os outros já
alcançam. Os 12 restantes são **sete assuntos** (marca, zona persistente,
cura-por-turno, clima, aura reativa, contra-conjuração, PM de volta) — cada um
uma fase pequena, nenhum urgente.

### A divergência entre as duas mãos, e como a resolvi

As duas mãos discordaram exatamente onde a decisão mora. O `backend` marcou
`Postura Defensiva` e `Corpo de Ferro` como **(c) NOVO**, argumentando que
"mitigação do dano recebido não tem motor — absorção come valor fixo e guarda
faz errar". **Overruled, e a razão está medida:** nenhuma das duas mãos tinha
olhado `tracos.js`. `amortecerDano` corta o golpe ao meio, é porta única do
dano que chega ao herói, e roda em produção. Pela nossa própria regra escrita
("o motor existe e lê outra fonte" = LIGAÇÃO), as duas são **(b)**. É a
diferença entre dizer à pessoa "precisa de mecânica nova" e "precisa de uma
linha de fiação" — e ela está decidindo com base nisso.
O `backend` me corrigiu de volta em `Mente Serena` (é `imuneA`, não `GUARDAS`,
e é (b)) e eu aceitei. As duas correções estão no `degraus.cjs`.

- **o que ficou:** duas descobertas que **não são** esta decisão e viraram
  item próprio em "Aberto": os **10 falsos positivos ativos** (três fazem o
  inverso do que prometem; cinco nascem de substring dentro de palavra —
  `aranha` em *Emaranhar*, `maça` em *Fumaça*) e as **7 habilidades de ataque
  que nem chegam ao motor** (`HAB_OFENSIVA_RX` tem `ataca`, não `ataque`).
  Nenhuma foi consertada: o ciclo era o retrato, e consertar durante a
  medição é a maneira mais rápida de o número deixar de ser verdade.
  A decisão do órgão **continua com a pessoa** — agora com o número na mão.

---

## 14/09 22:30 · v9.248 · N1 · o que os dois lados já sabem · commit `9f04a18`

- **estado inicial:** árvore limpa (só `mente/agora.json` modificado), HEAD
  `107440f`, VERSÃO v9.247, `npm test` **182/182 suítes + 9/9 varredores**
  verde. Trava posta por mim; não havia trava morta. **Duas mentes:** o
  `regente` roda D4 ao mesmo tempo, em `mente/formas.md` e no território de
  desenho — **o bastão do `App.jsx` não foi tomado por mim, e nem precisou
  ser**: N1 não editou uma linha de código.
- **conselheiro:** não chamado (etapa aprovada já escrita, e a pauta tem mais
  de 5 itens em "Aberto").
- **backend:** mediu os dois pilotos, o `intelecto` e o bestiário — quatro
  frentes, instrumento só no scratchpad.
- **testes:** instrumentou uma **cópia** da régua de B1 (`instrumentar.cjs`
  por âncora, no molde da casa) e produziu a linha de base — **0 divergências**
  contra a régua original em 600 combates comparados por id, e os números de
  B1b/B2 reproduzidos ao dígito.
- **decisões médias tomadas:** nenhuma no código. **N1 não muda nada: mede.**
  A única coisa que este ciclo escreveu foram os três arquivos da mente e o
  bump.

### O item: a medição, e o que ela desmentiu

**A Fase A ensinou que o inventário honesto é o que impede a fase seguinte de
nascer errada, e N1 repetiu a lição de D1: quase todo número que a pauta
escrevia estava errado.** Sete das oito afirmações mensuráveis das etapas
N2–N7 foram corrigidas na pauta, cada uma com o número que a obriga.

**Os dois lados, e com que entrada decidem.** `escolherAlvo`
(`adversario.js:155`) é **puro e sem sorte nenhuma** — nenhum `Math.random`
no arquivo — e enxerga **13 bandeiras**; desempata pelo primeiro da lista, e a
lista começa sempre pelo jogador (`combate.js:245`), de modo que empate exato
entrega o herói. `INTENCOES` tem **46 entradas** e **14 nunca vencem** em
200 000 situações, porque oito campos são lidos e nunca escritos; na mesa,
**8 das 46** são eleitas alguma vez, e `sair_vivo` ocupa 48,6% das rodadas.
Do outro lado, `decidirAcaoCompanheiro` (`companheiros.js:183`) lê **sete
coisas** e **não lê inimigo nenhum além de "está vivo?"**: 100,00% dos 11 889
ataques vão no inimigo de menor PV absoluto.

**Por que o buff é `Escudo da Fé` — 347 de 358 (96,93%) —, e a causa é tripla,
não simples.** Por ordem de peso: **(1) o acervo** — 7 habilidades ofensivas
de apoio em **148**, e do nível 8 em diante **1 classe em 12** carrega uma na
ficha; **(2) a janela** `rodada <= 2`, comida pela cura no combate duro (1 457
curas contra 358 buffs no `justo`; **1 380 buffs contra 20 curas** no
`brando`, mesma ficha — teto medido de 358 ações por 1000 combates); **(3) a
precedência** `guarda || abrigo || buff`, que é **decisão medida de P3/v9.233
com o motivo no comentário**, e a primeira-que-casa dentro do balde. **Só a
(3) é cegueira de escolha** — e o `brando` prova que nem ela é cega, com a
`Bênção` saltando para 28,84% quando o escudo sobrevive. **A frase de N5,
"dar cabeça ao piloto faz a ofensiva nascer", estava errada na causa:** (1)
não se resolve com cabeça, é tabela.

**O `intelecto`, e o buraco que ninguém tinha visto.** Escala real **0–3 na
criação** (`ATRIBUTO_MAX = 5` é importado em `App.jsx:43` e **nunca lido**).
Nos oito prontos: **0, 1 e 3** — mediana 1, média 1,13, três em zero e o
**valor 2 vazio**; uma escada de cinco degraus nasceria com dois mortos. E
**a ficha de companheiro não tem `atributos`** — `garantirFichaCompanheiro`
nunca os sintetiza, e os três da régua os têm escritos à mão em
`CENARIOS_DA_REGUA`. A pauta dizia *"o companheiro e o herói tiram o degrau
do `intelecto` da ficha"*: metade dessa frase não tem onde pousar, e é o
buraco de desenho mais caro que N1 achou. **E `intelecto` já faz mais do que
a pauta supunha:** decide o **PM máximo** (`manaBase + intelecto*2`) — o
recurso que o piloto gasta em toda decisão —, pesa 18 em `poder.js` e é recuo
em `aflicoes.js`. Ele não ganha o segundo leitor: ganha o quinto.

**O inimigo não tem grau de inteligência — confirmado dos dois lados**, nas
**27** entradas do bestiário e em `completarInimigo`. A âncora que serve é
**`ameaca`** (5 valores fechados, já ordinal, sobrevive a `completarInimigo`,
e com recuo `"comum"` para o nome que o Narrador inventa) — e **sozinha não
basta**: Comandante (*"perigoso e tático"*) e Sentinela Blindada (*"muralha
ambulante"*) são as duas `elite`. **Já há uma classificação de cabeça, e não
mora no bestiário:** `menteDaCriatura` põe **18 das 27** em `pensa` e o
**Colosso** em `besta` porque `RX_BICHO` casa a palavra "besta". Duas
classificações em dois lugares é a doença que esta casa conhece — N2 herda o
problema, e a pauta não o mencionava.

**Quem apanha: 60,06% · 57,27% · 64,48% — não 65%.** Os 65% são a taxa do
sorteio **quando ele roda**, e ele mede exatamente isso quando roda (64,85% ·
64,69% · 64,48%). Deixa de rodar em **7,88% (`justo`) e 12,43% (`duro`)** dos
golpes porque `vivosAlvo` (`combate.js:267`) **tira o herói caído da lista de
alvos** — e no `brando`, onde ele nunca cai, a medida é 64,48% cravado. As
quatro famílias concordam dentro do IC95 por combate. **E o achado que a fase
não tinha:** a lista de alvos é uma **foto tirada uma vez** por turno
(`combate.js:245`), então **13,40% (`justo`) e 18,03% (`duro`) do dano dos
inimigos cai em quem já está no chão** — 38,15 ± 1,80 e 62,19 ± 2,16 PV por
combate. Um inimigo com cabeça que apenas pare de desperdiçar endurece o
combate por essa margem **antes** de mirar papel nenhum, e N7 tem de medir
esse eixo **separado** do eixo "quem é mirado", senão a pessoa não consegue
decidir sobre a dureza.

### O achado grande: a régua mede o combate com o Adversário desligado

**`regua-combate.mjs:612` passa `prioridade: ""`**, sem uma linha de
comentário dizendo por quê, e `combate.js:279` só consulta `escolherAlvo`
quando a prioridade existe. Logo **toda a linha de base de B1, B1b, B2 e T1
para Uma Vida foi medida com o órgão fora do circuito** — o que essas etapas
mediram foi o sorteio de 35% e mais nada. No jogo, `App.jsx:13606` passa a
prioridade da intenção a todo turno.

Uma **reconstrução** de `lutaDaMesa` no scratchpad, ligando a prioridade ao
mesmo laço, dá **vitória 52,10% → 1,80%** no `justo` e **8,40% → 0,00%** no
`duro`, robusta em 8 variantes do lugar (1,6% a 13,6%) e com a eleição
atrasada uma rodada (3,2%). **É reconstrução, não a régua, e está dito assim
na pauta** — o número exato tem de sair do instrumento certo. A causa está
medida prioridade a prioridade: o herói é o único combatente que **não morre
ao cair** e de quem os inimigos **desistem** ao vê-lo no chão, então bater
nele é dano desperdiçado, e **toda prioridade que aprende a evitá-lo vira
TPK** (`o_conjurador` 0,6% · `quem_nao_e_o_heroi` 0,4% · `o_mais_forte` 0,4%
· `o_curandeiro` 1,2%, contra 51,2% do sorteio cego).

**Duas consequências, e as duas foram registradas em vez de resolvidas.**
Nasceu **N1b · a régua mede o combate que existe** — instrumento, no molde
exato de B1b, que a autorização da fase cobre e que **vem antes de N4 e N5**,
senão o antes e o depois da Fase N inteira são medidos com o órgão desligado.
E foi para **"Para a pessoa decidir"** a pergunta que N7 escrevia errada: não
é *"aceita o combate mais duro?"* — é **"o alvo tático já está ligado no jogo
e a régua nunca o mediu; quanto dele você quer manter?"**, com as três saídas
escritas.

### O que ficou

- **Nenhum conserto de carona.** Nem um alvo, nem um buff, nem um comentário.
  Foi pedido assim e é a disciplina da etapa: N1 mede, N2 em diante mexe.
- **Cinco achados foram para "Aberto"** em vez de virarem trabalho deste
  ciclo: os oito campos lidos e nunca escritos (que custam 14 intenções);
  `ehOfensiva("Escudo da Fé") === true`, que faz a Clériga disparar o escudo
  como golpe 16 vezes em 1000 combates; `alvoDoAdversario` sem leitor de
  produção com um cabeçalho que afirma o contrário; `ATRIBUTO_MAX` importado
  e nunca lido; e `completarInimigo` não copiando o `desc` da base — o mesmo
  erro que a v9.152 consertou para `perfil` e `des`.
- **O que N1 não conseguiu medir:** o número da reconstrução. Ele é robusto na
  direção e não na casa decimal, e por isso a decisão da pessoa foi escrita
  **com** essa ressalva, não sem ela.
- **Vermelho da outra mente:** nenhum. `npm test` fechou verde antes e depois.

---

## 14/09 21:05 · v9.247 · B2 · a simetria fechada, e a Fase B com ela · commit `c14532b`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.

- **estado inicial:** árvore limpa, HEAD `5a170c3`, VERSÃO v9.246, `npm test`
  **182/182 suítes + 9/9 varredores** verde. Trava posta por mim. **Duas mentes:**
  o `regente` fechou D3 durante este ciclo e **tomou a v9.246 em voo** — B2 sai em
  **v9.247**, e as sete citações de versão que as mãos tinham escrito foram
  corrigidas antes do commit (comentário que cita versão errada é comentário que
  mente). **O bastão do `App.jsx`** foi tomado duas vezes e devolvido nas duas:
  pelo `frontend`, para um parágrafo de comentário, e por mim, para a citação de
  versão dentro dele. Nenhuma linha de comportamento do `App.jsx` mudou.
- **conselheiro:** não chamado (etapa aprovada já escrita; a pauta tem mais de 5
  itens em "Aberto").

### O item: a simetria fechada, e o veredito da régua

A condicional da pessoa era a etapa — *"se o bônus for lícito e justo, vamos
fazer; buffs e tudo mais devem funcionar de verdade"*. **É lícito, é justo, e o
preço medido é zero** — mas não pelo motivo que a pauta esperava.

- **backend:** `turnoDosCompanheiros` (`combate.js`) passou a ler `efeitos` pelos
  leitores que já existiam (`bonusDeDano` / `bonusDeArma`, de `combos.js`) e a
  somar em `danoBase` **antes do dado** — a convenção do herói (`App.jsx:11827`),
  que faz o bônus dobrar no crítico e escalar pela resistência. O bônus é lido
  **antes** de `d(4)`, então nenhum dado a mais é consumido e a ordem da semente é
  idêntica à de HEAD.
- **A armadilha que o desenho tinha de resolver:** `arena.js` **já somava o bônus
  por fora**, depois do golpe pronto, exatamente porque `turnoDosCompanheiros` não
  conhecia os efeitos de quem bate. Somar dentro sem tirar de fora faria a arena
  contar **duas vezes**. A compensação externa saiu junto, o número passou a
  viajar na ação (`bonus`/`fontes`), e os dois comentários que passariam a mentir
  foram reescritos.
- **frontend:** o parágrafo de `buffDeCompanheiro` (`App.jsx:7974`) dizia que
  `turnoDosCompanheiros` "nao toca em `efeitos`" e que "so `absorve` tem leitor".
  As duas metades caíram no mesmo minuto. Reescrito preservando a decisão que
  **continua viva** (só a frase do abrigo vai à tela) e dizendo o porquê novo:
  hoje é **escolha de tela**, não consequência de um número inexistente.
- **testes:** `teste-comp.mjs` **28 → 43** asserções (a suíte do órgão que mudou)
  e `teste-arena.mjs` **99 → 106** (a metade que acontece depois da ação mora onde
  estava a porta que somava). **12 sabotagens, 12 mordendo, nenhuma nascida
  verde** — inclusive a asserção-chave da etapa: *a arena volta a somar por fora*
  → 3 vermelhas.

### Os números — antes e depois, na mesma versão e com a régua consertada

| cenário `justo` (n=1000) | antes | depois | catraca B1 |
|---|---|---|---|
| vitória | **52,10%** | **52,10%** | 35–65% |
| quedas | **1,790** | **1,790** | ≥ 1,2 |
| PV do grupo | **25,88** | **25,88** | ≤ 35 |
| 1ª queda | **4,300** | **4,300** | — |

**Idênticas ao dígito, e nas quatro famílias independentes** (`aa` 51,10% · `bb`
52,70% · `cc` 54,20%). A única coisa que se moveu no retrato inteiro foi
`danoDesferido`: **261,53 → 261,54**. Folga mínima **3,45 margens** antes e
depois — nada comprado, nada gasto. **A tabela não foi ajustada**, porque não
houve o que corrigir: `BUFF_DA_HABILIDADE` e `ABSORCAO_DO_BUFF` estão como
estavam, e o comentário que cita "o dobro da força ofensiva" continua verdadeiro.

**A arena reagiu do tamanho que se esperava**, e para cima: o bônus agora dobra
no crítico também lá (antes era somado depois do golpe pronto). Amplitude do
retrato **11,9 → 11,8** pontos (teto 20), margem mais fina punho/`cc` **40,2% →
40,1%** (5,1 pontos da parede), `teste-arena.mjs` **99 ok · 0 falhas** antes e
depois. O ganho mínimo do buff no golpe, medido, subiu de **1,95 para 2,10** — a
fatia de crítico da amostra — e **o piso continua 1**, nem afrouxado nem apertado.

### A descoberta da etapa, e é ela que importa mais que o zero

**O órgão morde, e está provado isolado e determinístico:** companheiro com
efeito `+3` de `aplica: "dano"` sobe o dano médio por golpe de **11,566 para
14,582** (+3,015). O número tem explicação fechada, e é ela que prova a convenção
do herói: com 1054 críticos e 17993 acertos na amostra, dobrar no crítico prevê
**3,015** e não dobrar preveria **2,857**. O mesmo efeito com o rótulo trocado
para `"protecao"` deixa o dano em **11,566**, byte a byte — **o abrigo não vira
espada**.

**Então por que a régua não se moveu?** Porque o gargalo não era
`turnoDosCompanheiros` — **é o nascimento do buff**. Em 300 combates `justo`:
**3.571 golpes de companheiro e 2 com bônus ofensivo (0,06%)**. As 119 ações de
`buff` que o piloto escolheu produziram, no instante do golpe, **2 presenças de
`Bênção` contra 10 de `Escudo da Fé`** — que é `protecao`, bônus 0, e que
`efeitoNoGolpe` veta com razão. No `duro`, **zero**. No `brando`, 66 de 1.828.
**A metade ofensiva quase nunca chega a existir na mesa dura.**

- **decisões médias tomadas:**
  - **Somar em `danoBase`, antes do dado, e não depois** — motivo: é a convenção
    do herói (`App.jsx:11827`), e a lei da simetria é "como o defensivo já soma",
    não "de um jeito novo". O preço é o bônus dobrar no crítico também na arena;
    medido, é um décimo de ponto de amplitude, e está no diário para ninguém
    precisar descobrir sozinho.
  - **Tirar a compensação externa de `arena.js` no mesmo commit** — motivo: sem
    isso a arena contaria duas vezes, e a etapa nasceria com um defeito que a
    catraca de equilíbrio pegaria só de lado. A asserção que impede a volta dela
    é a mais importante da etapa (sabotagem 6, 3 vermelhas).
  - **Não ajustar `BUFF_DA_HABILIDADE`** — motivo: a régua não pediu. Mexer numa
    tabela que a medição aprovou seria rebalancear às cegas.
  - **Corrigir sete citações de versão antes do commit** — motivo: o `regente`
    tomou a v9.246 com B2 em voo, e as mãos tinham escrito v9.246 nos cabeçalhos.
- **o que ficou:** **a Fase B fecha aqui** (B1 · B1b · B2). E ela fecha deixando
  um item novo e honesto na pauta: **o mecanismo está armado e hoje custa zero,
  mas no dia em que o companheiro firmar ofensiva com regularidade ele vale até
  +2 por golpe** — e a escada de B1b diz que +2 leva a vitória a 58,4% e que o
  dente do PV sai da margem já em +1. Quem fizer a ofensiva nascer de verdade
  **terá de reabrir `BUFF_DA_HABILIDADE`**. Fica também uma pergunta de tela para
  a pessoa: em Uma Vida ninguém narra o `bonus`/`fontes` (só a arena o faz, no
  Duelo) — o jogador sente pelo dano maior, e anunciar "+N" seria gameplay
  visível, logo dela.

---
## 14/09 19:25 · v9.245 · B1b · a régua se corrige antes de medir · commit `2a818f9`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.

- **estado inicial:** árvore limpa, HEAD `41f0faa`, VERSÃO v9.243, `npm test`
  **182/182 suítes + 9/9 varredores** verde. Trava posta por mim. **Duas mentes:**
  o `regente` rodava D2 ao lado **com o bastão do `App.jsx` na mão** — e este
  ciclo **não tocou o `App.jsx` em linha nenhuma**, só o leu (foi ele que provou
  a ordem da rodada). Durante o ciclo o regente commitou D2 (`5cf555c`, `49a494f`,
  `e46b7f2`) e bumpou para v9.244; esta etapa sai em **v9.245**, pela lei do
  número maior. Nenhum conflito: os dois arquivos deste commit são de testes.
- **conselheiro:** não chamado (etapa aprovada já escrita; a pauta tem mais de 5
  itens em "Aberto").

### O item que ia ser, e o que ele virou

O ciclo era **B2 · a simetria fechada** — ensinar `turnoDosCompanheiros` a ler
`efeitos` para que o bônus ofensivo do companheiro somasse como o defensivo já
soma. A condicional da pessoa (*"se o bônus for lícito e justo"*) manda medir
antes, e B1 tinha deixado um aviso na mesa: a absorção medida em **63 abrigos
contra os 153 de P3** — duas medições do mesmo fenômeno discordando pela metade,
**na porta exata que B2 encosta**. Olhar antes era ordem. **Olhar mudou o item.**

**Nenhuma das duas medições estava errada: a comparação é que era inválida** — e
a régua tinha um defeito de fidelidade *outro*, que ninguém procurava.

- **A divergência era um fantasma, e ele custou o ciclo.** A contagem de abrigos
  depende de dois parâmetros de fiação que o diário de P3/T1 **nunca registrou**,
  e cada um sozinho move mais do que a diferença toda: **o kit do herói** (é
  escolha desta régua, não herança — tirando o kit, o duro vai de 66 para **33**
  abrigos) e **a ordem do grupo na rodada** (com o grupo agindo antes dos
  inimigos, a mesma régua mede **159 abrigos e 954 PV** — que é exatamente o
  "954/159" que P3 registrou como sua **primeira** medição). O molde que alcança
  o número perdido é **o que o App contradiz**: `resolverRevide` roda
  `turnoDosInimigos` (`App.jsx:13591`) e só então `turnoDosCompanheiros`
  (`:13830`). Some-se que esta régua é **mais nova que P3** — compõe o
  `efeitos.js` de hoje, com C2b e C3, que não existiam em v9.233 e derrubam
  abrigo (custo medido: no brando, 40 viram 30).
- **O defeito verdadeiro estava ao lado: a ordem do teste de morte.** A régua
  rolava a morte do herói **entre** os inimigos e o grupo; o App faz o contrário
  — `resolverQueda` é chamada em `App.jsx:13940`, **depois** do turno dos
  companheiros, e o cabeçalho de `resolverRevide` (`:13497`) diz isso com todas
  as letras. **E não é cosmético:** o teste de morte mexe na ficha que o grupo
  lê. Um `revive` põe o herói em 1 PV, e `decidirAcaoCompanheiro` decide pela
  fração de vida do pior ferido — com a morte antes, a Clériga via um herói de pé
  onde o App lhe mostra um herói no chão, **e curava outra pessoa**.

### A linha de base corrigida — o retrato novo contra o qual B2 será julgada

N = 1000, família `umavida`, cenário `justo`. Valor ± meia-largura do IC de 95%.

| métrica | antes (v9.243) | **depois (v9.245)** |
|---|---|---|
| vitória | 49,80% ± 3,10 | **52,10% ± 3,10** |
| quedas (de 3) | 1,822 ± 0,08 | **1,790 ± 0,080** |
| PV do grupo (de 132) | 24,98 ± 1,90 | **25,88 ± 1,90** |
| PV do herói (de 42) | 5,58 ± 0,55 | **5,795 ± 0,556** |
| primeira queda (rodada) | 4,30 ± 0,13 | **4,300 ± 0,127** |
| rodadas | 7,73 ± 0,10 | **7,701 ± 0,105** |
| dano desferido | 260,62 ± 4,94 | **261,53 ± 4,97** |
| dano sofrido | 274,74 ± 3,69 | **272,25 ± 3,71** |
| PV parados no abrigo | 1,75 ± 0,18 | **1,752 ± 0,178** |
| abrigos | — | **0,292 ± 0,030** |
| queda do herói | 98,10% | **98,10%** |
| TPK | 50,20% | **47,90%** |
| estourou o teto | 0,00% | **0,00%** |

As quatro famílias independentes concordam nas treze. **Duro:** 8,8% de vitória ·
2,82 quedas · 3,11 PV. **Brando:** 100% · 0 quedas · 94,2% de PV. E o retrato de
200 combates no duro, contra o de T1: 1ª queda **4,72** (T1: 4,41 → 4,64), quedas
**556** (T1: 566 → 563), PV do grupo **835** (T1: 675 → 754) — **três dos cinco
caem em cima, e caíram depois do conserto**: o acordo de 4,41 que a régua antiga
exibia era acordo por engano.

### Decisões médias tomadas (com o motivo)

- **O item do ciclo mudou de B2 para o conserto da régua, e B2 espera.** Motivo:
  uma régua com defeito conhecido não pode medir o antes e o depois de B2. Se o
  conserto e a mudança saíssem na mesma versão, o par antes/depois que a pessoa
  pediu no diário estaria **confundido** — não se saberia quanto do movimento foi
  do bônus e quanto foi do instrumento. Régua primeiro, uma etapa por ciclo.
- **A sabotagem 1 subiu de 4 elites nv7 para nv8, e o piso não se moveu um
  dígito.** Depois do conserto, a sabotagem antiga passou a medir **36,4%** contra
  um piso de 35%: **parou de morder**, e dente que não morde não é dente. A saída
  não foi mexer no piso (35%–65% é lei da casa, herdada da arena) e sim tornar a
  sabotagem uma sabotagem de novo. **O que se perdeu está escrito no comentário**,
  porque perder resolução em silêncio é pior do que perdê-la: a menor mudança de
  dureza que a faixa pega hoje é de **dois** níveis, não de um.
- **A folga mínima caiu de 3,70 para 3,45 margens e NÃO foi comprada de volta.**
  Subir o teto de PV de 35 para 36 devolveria os dois décimos que o conserto
  custou — e seria afrouxar um dente por cosmética. A lei escrita é "mais de 2
  margens", e 3,45 passa longe.
- **Uma asserção mudou de rótulo, nenhuma mudou de condição.** A linha "a 2000 as
  famílias discordam em `danoSofrido`" afirmava uma discordância que o conserto
  **desfez** (a 2000 as quatro agora concordam nas treze). A condição é a mesma
  (`n < maior degrau`); o que mudou é o motivo, e ele está reescrito no
  comentário, como a lei da casa exige de toda asserção mexida.

### O que ficou

- **B2 segue aberta, e agora com escada nova.** Medida depois do conserto: +0
  **52,1%** · +1 55,1% · +2 58,4% · +3 61,3% · +4 64,0% · +5 **66,6% — vermelho
  nos dois tetos**. Cada ponto de dano por golpe do grupo vale **~2,9** pontos de
  vitória (era ~3,5 na medida velha), e a catraca fecha em **+5**.
- **E a divergência não pode mais envenenar B2, caia para que lado cair:** a
  absorção inteira, de zero a cheia, vale **3,6 pontos de vitória e 2,10 PV** no
  `justo`; **dobrá-la** — o tamanho exato da disputa 378 × 918 — custa **1,2 ponto
  e 1,02 PV**, menos de uma margem em cada. Está escrito no cabeçalho do módulo.
- **`src/` intocado outra vez.** Como em B1, esta etapa não somou um ponto de
  dano: os dois arquivos do commit são `testes/regua-combate.mjs` e
  `testes/teste-regua.mjs` (mais VERSÃO, pauta e diário). `App.jsx` não foi
  aberto para escrita em momento nenhum — o bastão era do regente.

---

## 14/09 18:05 · v9.243 · B1 · a régua que falta · commit `322dee7`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.

- **estado inicial:** árvore limpa, HEAD `85c23e8`, VERSÃO v9.241, `npm test`
  181/181 suítes + 9/9 varredores verde. Sem trava de ciclo (posta por mim).
  **Duas mentes na mesma árvore:** o `regente` rodava D1 ao lado; durante o
  ciclo ele commitou e bumpou para v9.242, então esta etapa saiu em **v9.243**
  (a lei do número maior, e nenhum conflito — B1 não tocou território nenhum
  do desenho). **O bastão do `App.jsx` não foi tomado porque não foi preciso:**
  B1 é motor e medida, e fecha sem uma linha de tela.
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **o item:** **B1 · a régua que falta**, primeira etapa da Fase B, aprovada pela
  pessoa com uma condicional que é a fase inteira — *"se o bônus for lícito e
  justo"*. **Provar que é justo faz parte do trabalho**, e até hoje não havia com
  o que provar: a catraca de 35–65% só existia para a arena, e **toda mudança de
  combate em Uma Vida foi julgada por argumento, não por número.**
- **backend:** `testes/regua-combate.mjs` (756 linhas) — o simulador determinístico
  de combates de Uma Vida, compondo os motores reais (`turnoDosInimigos`,
  `turnoDosCompanheiros`, `resolverAtaque`, `absorverDano`, `tickCondicoes`,
  `erguerGuarda`, `testeConcentracao`…). 13 exports, cenários e amostra em tabela
  nomeada, média e margem de erro saindo do módulo e não de conta à mão.
- **testes:** `testes/teste-regua.mjs` (578 linhas, **115 asserções**, 9 seções) —
  a catraca. **Quatro sabotagens: três mordendo e um controle verde.** A suíte
  custa 12,3 s dos 122 s de `npm test`.
- **B1 não somou um ponto de dano.** `src/` inteiro intocado, `App.jsx` intocado;
  os dois únicos arquivos do commit são a régua e a sua suíte (mais VERSÃO, pauta
  e diário). Era a promessa da etapa e está cumprida byte a byte.

### A linha de base de hoje — o retrato contra o qual B2 será julgada

N = 1000, família `umavida`. Valor ± meia-largura do IC de 95%.

| métrica | duro | **justo** | brando |
|---|---|---|---|
| quedas (de 3) | 2,81 ± 0,04 | **1,82 ± 0,08** | 0,00 ± 0,00 |
| primeira queda (rodada) | 4,65 ± 0,13 | **4,30 ± 0,13** | — (ninguém cai) |
| PV do grupo (de 132) | 3,34 ± 0,77 | **24,98 ± 1,90** | 124,34 ± 0,43 |
| PV do herói (de 42) | 0,48 ± 0,18 | **5,58 ± 0,55** | 31,93 ± 0,45 |
| rodadas | 8,05 ± 0,15 | **7,73 ± 0,10** | 2,94 ± 0,02 |
| dano desferido | 249,22 ± 6,33 | **260,62 ± 4,94** | 142,60 ± 1,67 |
| dano sofrido | 319,69 ± 3,65 | **274,74 ± 3,69** | 18,51 ± 0,60 |
| PV parados no abrigo | 1,74 ± 0,18 | **1,75 ± 0,18** | 0,79 ± 0,13 |
| vitória | 8,70% ± 1,75 | **49,80% ± 3,10** | 100,00% ± 0,30 |
| queda do herói | 100,0% ± 0,30 | **98,10% ± 0,85** | 0,00% ± 0,30 |
| TPK | 91,30% ± 1,75 | **50,20% ± 3,10** | 0,00% ± 0,30 |
| estourou o teto | 0,00% | **0,00%** | 0,00% |

**O molde de P3/T1, reconstruído.** O script original morreu com o scratchpad —
sobreviveu a descrição no diário, e foi dela que a fiação voltou. Contra o retrato
de T1 (200 combates, `umavida|0..199`, duro): 1ª queda **4,41** contra 4,41, e
quedas **545** contra 566→563. Uma peça foi **recuperada por medição**: o PV do
inimigo sai do nível **do próprio inimigo**, não do nível do herói — com 59 PV a
régua mediria 289 quedas e 1ª queda 3,73, e nenhum número de T1 ficaria de pé.
Está escrito no cabeçalho do módulo com o motivo de desenho (senão `nivel: 9` não
decidiria nada).

### Decisões médias tomadas (com o motivo)

- **Nasceu um terceiro cenário, `justo`, e é o que importa.** `duro` e `brando`
  estão **saturados nas duas pontas**: no duro caem 2,81 dos 3 e sobram 3 PV de
  132 (não há para onde descer); no brando ninguém cai nunca e sobram 94% (não há
  para onde subir). É a mesma leitura honesta que P3 já tinha escrito ("mede uma
  base de 2,6% do máximo"). Motivo: **uma mudança que passa nos dois extremos não
  provou nada** — uma régua que não se mexe não é régua. `justo` (4 elites nv6) põe
  a mesa em 49,8% de vitória, 1,82 quedas e 19% de PV, com folga nos dois sentidos,
  e foi calibrado **pela própria régua** (4 elites nv9 = 9% · nv7 = 34% · nv6 = 50%;
  3 elites nv9 = 78%) em vez de por palpite. É item de tabela, no formato dos dois
  que já existiam — nenhuma regra de jogo mudou.
- **A amostra é 1000, e o teto tem motivo, não é número redondo.** As médias param
  cedo (entre 500 e 2000 as quedas mexem 0,04). Quem decide o N é a **margem**: a
  N=1000 as quatro famílias independentes **concordam nas treze métricas**; a
  N=2000 `danoSofrido` passa a **discordar** (5,23 de distância contra margens que
  somam 5,18). A amostra maior não achou diferença de jogo — achou o próprio
  resorteio, porque a precisão ficou mais fina que a distância entre famílias.
  **1000 é o maior N em que a régua ainda concorda consigo mesma**, e é a lição de
  A4 e C2b aplicada antes de doer, não depois.
- **A régua mora em `testes/`, não em `src/`.** Foi pedida em `src/regua-combate.js`
  e o `backend` recusou com razão: `teste-ligacao` exige que todo módulo de `src/`
  seja importado por outro módulo de `src/`, e **nada no jogo importa (nem deve
  importar) um simulador de balanceamento** — ali ela nasceria vermelha no dia em
  que nascesse. `testes/` tem precedente farto (`medir-*`, `sonda-*`, `p1..p4`,
  `calibra-poder`). Como `teste-ligacao` só varre `src/`, a suíte carrega a catraca
  que faltava: a **seção 9** prova que os 13 exports têm leitor, e que nada de
  produção a importa. Preferir `src/` custaria um perdão escrito, e perdão em lei é
  preço alto para mudar uma pasta.
- **A faixa 35–65 não é número novo: é a lei da arena, lida como texto.** A suíte
  abre `teste-arena.mjs` e confere que `piso: 0.35` / `teto: 0.65` continuam lá.
  Motivo: se o mesmo limiar existisse escrito em dois lugares, um dia divergiriam em
  silêncio — assim, o dia em que alguém mexer num dos dois, este dente morde.
- **O que NÃO virou limiar, e por quê.** `absorvido`/`abrigos` (ralos e oscilantes),
  `danoSofrido` (a única que discorda quando N cresce), `pvHeroi`/`quedaDoHeroi` no
  duro e no justo (saturados em 98–100% — limiar em cima de um teto não mede nada) e
  `primeiraQueda` no brando (conjunto vazio). Ficaram como `pendente(...)`, que
  imprime e não falha. Motivo: **afirmar o instável é pior que não afirmar** — uma
  catraca que pisca sozinha ensina a gente a ignorá-la. No brando a honestidade
  virou asserção: `n === 0 && margem === Infinity`, para a régua nunca inventar
  número onde não houve queda.

### Virou catraca — três dentes e um aviso

Cenário `justo`, 4 famílias × 1000 sementes, tudo lido de `CATRACA_DE_UMA_VIDA`:

| dente | limiar | retrato (4 famílias) | folga |
|---|---|---|---|
| faixa de vitória | **35% – 65%** (a lei da arena) | 49,8 · 51,7 · 52,8 · 52,6% | 3,94–5,75 margens |
| teto de PV do grupo | **≤ 35** (de 132) | 24,98 · 25,35 · 27,24 · 27,70 | 3,70–5,28 margens |
| piso de quedas | **≥ 1,2** (de 3) | 1,822 · 1,798 · 1,749 · 1,725 | 6,41–7,79 margens |
| guarda | `estourouTeto === 0` nos três cenários | 0 em todas | — |

**A folga mínima (3,70 margens) é ela mesma uma asserção** (`> 2 margens`): se a
folga encolher, a régua deixou de ser confiável **antes** de ficar vermelha, e
descobrir isso quando já está piscando é tarde demais.

**Ela morde** — quatro sabotagens, todas por cenário (nunca por `src/`): controle
50,0% **verde** · 4 elites nv7 → **34,2%** (derruba *só* o piso de vitória, por oito
décimos de ponto) · 3 elites nv9 → **76,2%** (derruba os três) · grupo nv7 → **90,2%**
(derruba os três). O controle existe para que as outras não possam estar vermelhas
por o caminho ter quebrado algo, e bate com a medida por id até 1e-12.

### O que ficou

- **Para B2, o número que ela vai querer:** cada ponto de dano por golpe do grupo
  vale **~3,5 pontos de vitória** (+1 → 52,5% · +2 → 56,5% · +3 → 60,3%), e a catraca
  fica vermelha por volta de **+4/+5**. O **PV do grupo é o dente mais sensível**
  (+1 já sai da margem); a **vitória é o mais estável**. A escada foi medida no
  `regua-combate.mjs` e **não** foi reproduzida na suíte — somar dano fixo por golpe
  exigiria mexer no motor (`bonusArmaComp` vem de `equipados.arma.atributos.dano`, e
  `fichaDoGrupo` monta `equipados: {}` cravado), e B1 prometeu não mexer.
- **A absorção divergiu de P3 pela metade, e é a mesma porta que B2 encosta.**
  Esta régua mede **378 PV parados em 63 abrigos**; T1 mediu **918 em 153**. O escudo
  nasce menos da metade das vezes. Ou o molde perdido tinha mais nascimentos, ou algo
  mudou entre P3 e hoje — **olhar antes de B2, não depois**. Escrito na pauta, em B2.
- **Para a pessoa decidir (pesado), um achado que a régua não foi buscar:** o herói
  cai em **98,1%** dos combates do `justo` e **100,0%** dos do `duro`, quase sempre na
  rodada 1 ou 2, porque `turnoDosInimigos` manda 65% dos golpes nele e oito golpes de
  elite por rodada contra 42 PV e defesa 16 não têm resposta. Depois disso a cena é
  "três companheiros lutando sozinhos". **Pode ser exatamente a tensão desejada, ou o
  protagonista sendo apagado da própria luta** — e nenhum número resolve a diferença.
  Está na pauta, em "Para a pessoa decidir".
- **Não avançou para B2**, como pedido. A vez seguinte da fila aprovada é B2.

---

## 14/09 17:05 · v9.241 · T4 · as portas de saída declaradas · commit `79567ce`
- **estado inicial:** árvore limpa, HEAD `acc62ff`, VERSÃO v9.240, `npm test`
  181/181 suítes + 9/9 varredores verde. Sem trava de ciclo (posta por mim). A vez
  era **T4**, a última etapa da Fase T, com a lei da pessoa por inteiro: *"se a cura
  não limpa, a limpeza vem de magia, habilidade de classe e item — e isso tem de
  existir de verdade, não virar condição sem saída."*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de 5
  itens em "Aberto").
- **backend:** a tabela `PORTAS_DE_SAIDA` em `condicoes.js`, no molde de
  `SALVAGUARDA_DO_FIM_DO_TURNO` — três famílias com autoridade declarada, critério
  de três testes para o alcance da magia, e `porque` por linha. Mais
  `portaDeSaida`, `removerPelaPorta`, `linhaDaPortaDeSaida` e
  `coberturaDasCondicoes`. **Nenhum módulo novo**, de propósito: um `src/portas.js`
  ficaria mudo até a fiação e acenderia o `teste-ligacao`.
- **frontend:** 63 linhas em `App.jsx:12712–12773` — o ramo `curar_condicao` que
  faltava em `usarFuncaoMagica`, ao lado do de `cura`, em `try/catch` com
  `calou("porta-de-saida-da-magia")`. Zero regra e zero frase no App: só o nome do
  dono.
- **testes:** `teste-cond.mjs` 245 → **394**; `teste-ligacao.mjs` 20 → **21**.
  **13 sabotagens, 13 mordendo, nenhuma nasceu verde.** Quatro asserções movidas,
  cada uma com o motivo escrito no comentário.

### A promessa mais antiga do catálogo, enfim cobrada

**Restauração Menor e Maior nunca fizeram nada.** As duas estão no grimório desde
sempre (`grimorio.js:130` e `:173`), declaram `funcao: "curar_condicao"`,
`resolvidaPeloSistema` devolve `true` para elas e `magiaDeFuncaoNaAcao` já as
entregava — e **não existia um ramo para `curar_condicao`** em `usarFuncaoMagica`.
Conjurá-las caía no `return false` do fim: gastava a vez, não tirava condição
nenhuma. Ninguém tinha cobrado a promessa porque ninguém tinha ido conferir.

### Três autoridades, não uma — e essa foi a decisão que mais pesou

O desenho óbvio era fazer o canal `restauracao` mandar em tudo: quem o declara
sai por porta, quem não o declara não sai. **Ele teria apagado seis comportamentos
vivos em silêncio.** Poção e relíquia removem hoje **seis ids que o canal não
declara** — `atordoado`, `amedrontado`, `queimando`, `agarrado`, `lento`, `caido`
— e os dois removedores (`pocoes.js:151`, `relicas.js:281`) funcionam desde sempre.

Então a tabela declara **três famílias com autoridade separada**, e diz por escrito
qual é a de cada uma: **o canal `restauracao` é a autoridade da MAGIA e só dela**;
a lista `remove`/`limpa` do frasco continua sendo a palavra final do frasco. As
linhas de item **não** aparecem na tabela — duplicá-las seria ter duas verdades
sobre o mesmo objeto. `pocoes.js` e `relicas.js` seguem byte a byte.

**O alcance da magia sai de três testes, não de gosto:** (1) declara o canal;
(2) é aflição, não ferimento — é o **teste 2 de T3 reaproveitado**, e corta
`sangrando` pelo mesmo motivo escrito lá; (3) o degrau — a Menor tira o que foi
**posto** em você, a Maior tira também o que foi **tirado** de você. Menor (2º):
`envenenado`, `cego`, `paralisado` (a lista literal do 5e). Maior (5º):
`enfeiticado`, `exausto`, `enfraquecido` **mais tudo da Menor** por `herdaDe` —
divergência do 5e **declarada**, porque um 5º círculo que não faz o que o 2º faz é
armadilha de ficha.

### Decisões médias, com o motivo (é o que a pessoa audita)

- **Três `saiCom` mudaram, e o `"longo"` junto era obrigatório.** `paralisado`
  `—` → `["longo", "restauracao"]`, `enfraquecido` e `exausto` `["longo"]` →
  `+ "restauracao"`. O `"longo"` em `paralisado` **não é enfeite**: `saiCom`
  não-vazio **desliga** a regra implícita de `limparPorDescanso`, e um
  `["restauracao"]` sozinho tiraria dele a noite que ele já tinha. É a armadilha
  exata que T2 mediu em `enfeiticado`, e agora ela é asserção.
- **A remoção é função nova e própria, não a do descanso.** T2 trancou
  `limparPorDescanso` contra canal que não seja de descanso, de propósito. Passar a
  magia por ali seria arrombar a fechadura da etapa anterior.
- **`quantasPorVez: null` (todas as que a porta alcança), e é lido.** Divergência do
  5e ("escolha uma") escrita: lá há jogador para escolher; aqui seria diálogo no meio
  do turno, e o acervo já limpa lista inteira — Sais Aromáticos tiram duas num gole.
- **Quando não há o que tirar, o sistema recusa ANTES de cobrar.** `r.mudou ===
  false` → linha de recusa, PM intactos, o turno não vai ao Mestre. É o molde da
  poção cheia (`pocoes.js:153`, `gastou: false`) e do `identificar` do próprio App.
- **`Purificar` e `Palavra de Coragem` entram na tabela com `resolve: false` e um
  `aguarda` escrito — e a cobertura NÃO as conta como saída.** Contá-las seria a
  catraca passando verde numa promessa vazia, que é a doença que esta fase inteira
  foi curar.

### `concentrado` — resolvido, não perdoado

Era a única condição do jogo **sem saída nenhuma**: `turnos: null`, `tipo: "bom"`,
`saiCom: []`. Não vence no relógio, o descanso longo não a pega (a regra implícita
só vale para `ruim`) e T3 não lhe deu salvaguarda — ela cai no teste 3 do critério,
porque ninguém rola para se livrar da própria bênção.

Ganhou `saiCom: ["curto", "longo"]`, com o motivo no catálogo: **no 5e a
concentração não sobrevive a um descanso**, e uma hora de parada já é mais que o teto
de uma concentração inteira. **O efeito em mesa é zero, confirmado:** nada no `src/`
nem no `App.jsx` aplica essa condição — a maquinaria de concentração vive em
`efeitos.js`, sobre `pers.efeitos`. Resolver custou zero e é mais honesto que abrir
exceção; **a lista de perdão da catraca nasce vazia**, e é assim que ela deve morrer.

### A catraca que fecha a fase

`[T4 · A CATRACA QUE FECHA A FASE] toda condição tem ao menos uma saída`
(`teste-cond.mjs`): prazo, salvaguarda ou porta. O dente é
`coberturaDasCondicoes().semSaida` filtrado pelo perdão, contra `tetoSemSaida: 0`.
**Uma condição nova amanhã sem saída quebra a suíte no dia em que nascer.**

**Piso de alcance** no molde do `check-cura-nao-limpa.mjs` de T2, para a catraca não
passar verde medindo lista vazia — catálogo 21 · ruins 13 · boas 8 · prazo 19 ·
descanso 13 · salvaguarda 7 · porta 13 · com mais de uma 13 · magia 6 · item 10. Mais
dois dentes que não são número: a cobertura lê **o mesmo catálogo** que o resto da
suíte (`cob.total === listaCondicoes().length`), e a contagem de salvaguarda tem de
bater com uma leitura independente de `salvaguardaDeSaida` — se as duas discordarem,
uma está medindo nada. A lista de perdão cobra **motivo escrito por linha**.

### O que o jogador lê (ao vivo, sem `mostrarRolagens`)

```
🌿 Restauração Menor · −3 PM
🧪 Vera: o veneno afrouxa e sai do sangue; a vista volta, embaçada primeiro.

🌿 Restauração Maior · −9 PM
💜 A vontade volta a ser sua, e o que você fez ainda está lá; o corpo lembra o
   que é ter fôlego; o veneno afrouxa e sai do sangue.

✋ Restauração Menor: a mão se abre e não acha o que desfazer — os 3 PM ficam
   com você.
```

A frase nasce no módulo, ao lado do número, como `testeConcentracao.linha` (C2) e
`linhaDaSalvaguarda` (T3). O App não monta uma sílaba, e o dente que prova isso está
na suíte: **nenhum id do catálogo aparece no bloco novo do App** — nem `remove`, nem
`saiCom`, nem `restauracao`, nem `PORTAS_DE_SAIDA`.

**Teto de prompt:** `CONDICOES_PROMPT` **1650 → 1648 chars (−2)**, palavra por
palavra e não bloco novo. A frase final dizia *"quem a tira é o relógio ou o
descanso"* — já era falsa desde T3 e ficaria mais falsa com T4; hoje diz *"quem a
tira é o sistema, nunca você"*, mais curta e verdadeira para os quatro caminhos. A
pior cena do turno: **56366 → 56366 chars**, crescimento estático **zero**.

### Regressão em Uma Vida: zero, provada e não afirmada

As listas do que o descanso **curto** e o **longo** limpam estão escritas por extenso
na suíte como **ANTES** (`ANTES_CURTO` 3 ids, `ANTES_LONGO` 12 ids) e são idênticas
às de hoje — `concentrado` é a única diferença nos dois canais, e nada o aplica. As
três declarações novas de `"restauracao"` são inertes por estrutura:
`limparPorDescanso` é o único leitor de `saiCom` no projeto e recusa canal que não
seja de descanso. `pocoes.js` e `relicas.js` intocados.

---

## A FASE T ESTÁ FECHADA — o antes e o depois inteiro

A pessoa ditou a lei de D&D 5e em uma frase (*"cura normal apenas recupera PV mas não
remove a condição; daí vêm magias, habilidades de classe, itens e os testes de
resistência"*), e quatro etapas depois o jogo a cumpre dos quatro lados. O que havia
antes, em número:

**1. O relógio não alcançava o grupo (T1 · v9.238).** `tickCondicoes` tinha **dois**
sítios — o herói e os inimigos — e **zero** no `pers.grupo`. Em 1000 combates de Uma
Vida: **condições do grupo que vencem 0 → 727** no cenário duro e **0 → 305** no
brando, cada uma em 4,1 turnos; companheiro-rodadas com condição **4040 → 2335
(−42%)**. E a medição desmentiu a própria pauta: **o veneno eterno do companheiro
nunca existiu** — `aplicarCondicoesDosGolpes` só processa `alvoRef === "jogador"`. O
que o relógio tirou foi uma **vantagem** de trinta versões, e 94% dela era
`protegido`, que não compra defesa para ninguém. Real em contagem, quase inerte em
efeito — e virou achado, não conserto de carona.

**2. A cura dizia limpar e não limpava (T2 · v9.239).** Quatro condições declaravam
`saiCom: ["cura"]` — `envenenado`, `sangrando`, `cego`, `enfeiticado` — e **ninguém
lia esse canal**: promessa morta que contradizia a lei no próprio catálogo. Varridas
**45 portas de cura em 16 arquivos** e **nenhuma de gameplay escreve em `condicoes`**
(só o `/curar` do console criativo, que é chave do mundo e ficou declarado). O canal
foi **renomeado, não apagado** — apagá-lo deixaria `enfeiticado` com `saiCom: []` e
faria **a noite inteira passar a quebrar encantamento**. Catraca permanente:
`check-cura-nao-limpa.mjs`, 33 asserções, com piso de 35 portas / 8 arquivos.

**3. A salvaguarda não existia (T3 · v9.240).** Das 13 ruins, **0 → 7** ganharam
segunda chance no fim do turno, deduzidas por **critério de três testes** que a suíte
lê de volta — não por lista de gosto. As sete somavam **19 turnos** de prazo puro e
passam a somar **12,33 (mod 0) a 9,12 (mod +6) — corte de 35% a 52%**; `envenenado`
4t → **2,02t (−50%)**, e em PV 8 → **4,05 (−49%)**. As 6 que não ganharam têm o motivo
escrito por linha, e a convergência **7 + 6 + 8 = 21** é asserção.

**4. As portas não existiam (T4 · v9.241).** A magia que limpa estava no grimório e
era **inerte desde sempre**: **0 → 2** portas de magia vivas, alcançando **6**
condições. O item já funcionava e agora está declarado e contado: **10** condições.
A habilidade de classe tem **2** portas declaradas e honestamente **não resolve** —
está escrito na tabela, com o que falta. E o fecho:

| | antes da Fase T | hoje |
|---|---|---|
| sítios do relógio de condição | 2 (herói, inimigos) | **3** (+ o grupo) |
| condições com salvaguarda de fim de turno | 0 | **7** |
| portas de saída declaradas por tabela | 0 | **4** (2 vivas · 2 com `aguarda` escrito) |
| condições que saem por porta que resolve | — (não havia tabela) | **13 de 21** |
| condições com mais de uma saída | — | **13** |
| **condições sem saída nenhuma** | **1** (`concentrado`) | **0** |
| canais de saída | 2 implícitos | **3** declarados, com `porDescanso` lido |
| catracas permanentes da fase | 0 | **2** (`check-cura-nao-limpa` · a catraca da saída) |
| `teste-cond.mjs` | 31 asserções | **394** |

**Teto de prompt nas quatro versões: crescimento estático zero.** A fase inteira
entregou relógio, lei da cura, salvaguarda e portas sem somar um byte de bloco fixo ao
Mestre — `CONDICOES_PROMPT` na verdade **encolheu** (−10 chars em T2, −2 em T4),
porque as duas vezes em que ele mentia foram consertadas trocando palavra por palavra.
E o jogador lê as quatro novidades **em voz de mundo, sem `mostrarRolagens`**, com as
frases nascendo no módulo ao lado do número: `✓ Irmã Vela: Abençoado passou` (T1),
`🧪 O veneno afrouxa e sai do sangue — deu 20, e bastavam 12` (T3), `🧪 Vera: o veneno
afrouxa e sai do sangue; a vista volta, embaçada primeiro` (T4).

**Sabotagens da fase: 15 + 7 + 27 + 13 = 62, todas mordendo** — e as **duas** que
nasceram verdes (em T3) estavam **no teste, não na produção**, que é exatamente o
achado que uma escada de sabotagem existe para produzir.

- **o que ficou / foi para a pessoa:**
  - **Um resolvedor de habilidade de classe** — medido: o único caminho que o sistema
    executa sozinho é `magiaPorNome` + `resolvidaPeloSistema` + `usarFuncaoMagica`, e
    habilidade de classe **não passa por lá** (`Purificar` e `Palavra de Coragem`
    aparecem **0 vezes** no `App.jsx`). É órgão novo, e sobe para a pessoa.
  - **PV temporário** — a outra metade de `Palavra de Coragem`. Não existe em lugar
    nenhum do código. Mecânica nova.
  - **Acervo faltando (item de pauta, leve):** `doença` e `surdez` (que a Restauração
    Menor promete) e `maldição` (que a Maior promete) **não existem no catálogo de
    condições**. A `petrificação` está coberta como alias de `paralisado`.
  - **O alcance visível antes do clique** — `portaDeSaida(m.nome).remove` já entrega
    a lista pronta, mas mostrá-la é mudança no painel de habilidades, fora do escopo
    da etapa. O veredito que importa está de pé por outro caminho: sem nada ao
    alcance, o sistema recusa e não cobra.
  - **O `/curar` do console criativo** segue com o nome que tem. É cosmética de
    bastidor, não gameplay.
  - **A próxima fase é a B** — o bônus do companheiro, se for lícito e justo,
    começando por **B1 · a régua que falta**.

### Registro honesto: a casa mudou de regra no meio deste ciclo

Este ciclo começou com `HEAD` em `acc62ff` e terminou commitando sobre `b9c3df2`
— *"A segunda mente: o desenho ganha fila, regente e bastão"* —, que a **pessoa
commitou às 13:36, quinze minutos depois de eu pôr a trava**. Não houve ciclo
morto e não houve colisão: aquele commit toca `mente/` e `.claude/`, e T4 tocou
`src/` e `testes/`. Mas ele muda o mundo em que T4 fechou, e o registro fica:

- A **Fase D** saiu de `mente/pauta.md` para `mente/pauta-desenho.md` — a fila da
  segunda mente. A `pauta.md` é do sistema agora, e é onde este item foi fechado.
- **O `App.jsx` passou a ter bastão** (`.claude/app-jsx`), e o `frontend` editou
  `App.jsx` **sem tomá-lo** — porque a regra nasceu depois de o ciclo começar.
  Não houve dano (a fila do desenho ainda não rodou uma vez, e nenhuma outra mão
  esteve no arquivo), mas é dívida de procedimento, dita e não escondida. **Do
  próximo ciclo em diante o bastão vale**, e quem tocar o `App.jsx` o toma.
- O procedimento de subir mudou junto: caminhos um a um (que esta casa já fazia),
  `VERSAO` como última edição antes do commit, e `git pull --rebase` em push
  recusado — com o número **maior** vencendo em conflito de `VERSAO`.

---

## 14/09 13:05 · v9.240 · T3 · a salvaguarda no fim do turno · commit `c6d290f`
- **estado inicial:** árvore limpa, HEAD `ace9c60`, VERSÃO v9.239, `npm test`
  181/181 suítes + 9/9 varredores verde. Sem trava de ciclo (posta por mim). A vez
  era **T3**, terceira etapa da Fase T, com a lei da pessoa: *"os testes de
  resistência para alguns venenos — tipo, teste de salvaguarda de Constituição
  exigido pelo veneno no final do turno."*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **backend:** a tabela `SALVAGUARDA_DO_FIM_DO_TURNO` em `condicoes.js`, no molde
  de `CONCENTRACAO_DA_MAGIA` — regra geral + **critério de três testes que a suíte
  lê de volta** + 7 exceções que permitem e 6 que não, cada uma com o motivo. Mais
  `salvaguardaDeSaida`, `linhaDaSaidaDeCondicao` e `tentarSaidaNoFimDoTurno`. A
  rolagem é **inteiramente** de `salvaguardas.js` — nenhum d20 novo. `App.jsx`
  intocado.
- **frontend:** 89 linhas nos três sítios do relógio de T1 (herói `:8293`, grupo
  `:8364`, inimigos `:8414`), cada um em `try/catch` com `calou`, **sempre depois
  de `tickCondicoes`**. Zero regra e zero frase de regra no App: o único texto que
  ele fornece é o nome do dono.
- **testes:** `teste-cond.mjs` 102 → **245**; `teste-sala.mjs` 123 → **125**.
  **27 sabotagens em T3, 27 mordendo** (duas nasceram verdes e foram consertadas),
  3 no `teste-sala`, 3 mordendo. Nenhuma asserção antiga movida.

### O critério é que era a etapa, não a lista

A pauta pedia "cada condição declara se permite salvaguarda". O risco dessa frase
é virar lista de gosto — sete nomes escolhidos a dedo, que a suíte só prova
copiando. O que nasceu no lugar foi **um critério de três testes**, escrito na
tabela e lido de volta pela suíte, que deduz sozinho a posição de uma condição
nova:

1. **`turnos >= 2`** — com prazo de um turno a segunda chance chega no mesmo
   instante em que o relógio já vence; rolar ali nunca muda nada. Corta
   `atordoado` e `caido`.
2. **Efeito sustentado, não ferimento** — a salvaguarda expulsa o que continua
   agindo; ferida aberta e fogo pegado são estrago em curso, e a saída deles é
   cura ou porta declarada. Corta `sangrando` e `queimando`.
3. **Só ruim** — ninguém resiste à própria bênção (no 5e é literal: pode-se
   falhar de propósito). Corta as 8 boas de uma vez.

**7 ganharam**, cada uma com âncora 5e escrita na linha: `envenenado` vigor CD12
(o exemplo da pessoa), `paralisado` vigor CD14 (Imobilizar), `agarrado` forca CD12
(Golpe Enredante), `amedrontado` presenca CD12 (Medo), `cego` vigor CD12
(Cegueira/Surdez), `enfraquecido` vigor CD12 (Raio do Enfraquecimento), `lento`
vigor CD12 (Lentidão). **6 ruins não ganharam, com motivo por linha.** A
convergência **7 + 6 + 8 = 21** é asserção: é o que transforma "ninguém ficou sem
posição" em "a tabela fala do catálogo que existe".

### A CD é herdada, o atributo não — e `cego` é a prova

A CD sai da `resistir.dif` da própria condição onde existe (envenenado 12,
paralisado 14, agarrado 12, amedrontado 12), e 12 onde não existe. **O mesmo
veneno não pode ter duas forças, uma para pegar e outra para sair.** Mas só o
número é herdado: `resistir` usa `"agilidade"` e `"vontade"`, que **não existem**
em `ATRIBUTOS` nem em `SALVAGUARDAS`. São **duas perguntas diferentes** —
entrada (`aflicoes.js`, "o veneno pega?") e saída ("o corpo expulsa?"). `cego` é
o caso que prova: não tem entrada e tem saída; a porta que CEGA é Percepção, a
que DESCEGA é Vigor.

### O efeito, medido em número

Conta fechada `E[D] = (1−(1−p)^N)/p` **e** Monte Carlo de 60 mil execuções pelo
código real, semeado — os dois batem na segunda casa.

| condição | prazo puro | CD | mod +0 | mod +2 | mod +4 | mod +6 |
|---|---|---|---|---|---|---|
| envenenado | 4t | 12 | **2,02t (−50%)** | 1,74t | 1,52t | 1,33t |
| amedrontado · enfraquecido · lento | 3t | 12 | 1,85t (−38%) | 1,65t | 1,47t | 1,31t |
| paralisado | 2t | 14 | 1,65t (−18%) | 1,55t | 1,45t | 1,35t |
| agarrado · cego | 2t | 12 | 1,55t (−22%) | 1,45t | 1,35t | 1,25t |

**As sete somavam 19 turnos de prazo puro; passam a somar 12,33 (mod 0) a 9,12
(mod +6) — corte de 35% a 52%.** As seis ruins que não ganharam somam 10 turnos e
não mudam um dado. Onde a condição dói (`envenenado`, 2/turno, 8 PV de prazo
puro): mod +0 → **4,05 PV (−49%)**, saindo antes do prazo em **83%** das vezes.

**A faixa do herói é a real, e foi conferida nos oito prontos:** salva de Vigor
**+1 a +5**, mediana +3 (Muralha +5, Sombra +1). O `frontend` levantou alarme de
que o herói passaria quase sempre — era artefato de ficha sintética com `vigor:
15`; os atributos desta casa **já são modificadores** (0–3 em `prontos.js`). O
inimigo rola dado cru (`modSemFicha: 0`, declarado com três motivos, o principal
sendo que derivar bônus de `nivel`/`ameaca` seria um segundo sistema de atributos
invisível). **O companheiro fica no meio sem ter um único atributo**, porque
declara `classe` e a proficiência de salvaguarda entra sozinha: Guerreiro nv5
rola com **+3**.

### O que o jogador lê

Voz de mundo, os dois números, sem nomear o mecanismo, sem depender de
`mostrarRolagens`, e **nascida no módulo** — o App não monta uma sílaba:

```
🧪 O veneno afrouxa e sai do sangue — deu 20, e bastavam 12.
😨 Irmã Vela: o medo solta a garganta — deu 18, e bastavam 12.
🕸 Ogro Sarnento: o corpo se arranca do que o prendia — deu 17, e bastavam 12.
```

**Nasce só no sucesso, e é C2 pelo motivo inverso:** lá a linha só vem na queda
porque uma a cada golpe aguentado seria ruído; aqui o evento é a saída, e uma
linha a cada falha (sete condições × todo turno × todos os portadores) seria o
mesmo ruído multiplicado. **Teto de prompt 81.927 → 81.927 chars**, crescimento
estático zero — e o Mestre não precisou de nota nova, porque
`resumoCondicoesPrompt` já viaja em todo turno e a condição que saiu some de lá
sozinha. Fica dito que a folga contra o teto é de **73 caracteres**.

### Decisões médias, com o motivo

- **A ordem é contrato: relógio primeiro, salvaguarda depois.** Invertida, passar
  na salvaguarda apagaria retroativamente o dano de um turno em que a vítima
  esteve envenenada. O veneno cobra no turno; a chance vem no fim dele. A suíte
  roda **as duas ordens e exige que discordem** (2 PV × 0 PV).
- **O grupo virou passagem à parte, não embutida no `map` de T1.** Embutida, ela
  obrigava a renomear `return { ...g, condicoes: t.condicoes }` — a linha exata
  que uma asserção de T1 guarda. Em vez de mexer na asserção, o bloco ficou logo
  depois, com `try/catch` próprio: mesma ordem, T1 byte a byte intocado, e um
  estouro da salvaguarda não leva junto o tique que já rodou.
- **`teste-sala.mjs` foi semeado** (item de "Aberto", `leve`, resolvido dentro
  deste ciclo). A asserção `vistos.size > 480` sobre 500 `novoCodigo()` **sem
  semente** é colisão de aniversário — 30⁶ ≈ 729 milhões, 124.750 pares, ~1 rodada
  em **5.800** —, e já ficou vermelha duas vezes sem reproduzir (R2 e o meio de
  T2). Hoje roda com `rng(hashSemente("taverna|sala|codigo"))` pelo parâmetro `rnd`
  que já existia: **500/500, sempre**. **O 480 não desceu um dígito** — o número
  estava certo; quem estava errado era a aposta. Duas asserções novas fecham o
  buraco que semear sozinho deixaria (a mesma semente devolve os mesmos 500, e
  `criarSala` repassa a costura).

### O achado do ciclo: as duas sabotagens que nasceram verdes

Das 27, duas passaram — e as duas estavam **no teste, não na produção**, que é o
lugar mais perigoso de um verde falso.

- **A varredura do canal `restauracao` pulava `condicoes.js` inteiro.** Um leitor
  nascido dentro do próprio catálogo passava verde — e o arquivo que **declara** o
  canal é justamente onde ele tem mais chance de ganhar leitor. É o mesmo vício do
  recorte largo que T1 registrou, com outra roupa.
- **A peneira do `concentrado` aceitava "qualquer `id:` na frente"**, e
  `{ id: "concentrado" }` é exatamente como alguém **aplica** a condição: o
  aplicador passava verde. Hoje a entrada do catálogo é reconhecida pela forma
  inteira (`concentrado: { id:`).

Ambas consertadas e re-sabotadas: **27/27**.

### O que ficou

- **`concentrado` NÃO ganhou salvaguarda, e segue problema de T4** — cai no teste
  3 do critério (é `tipo: "bom"`). Continua `turnos: null`, `saiCom: []`, e nada o
  aplica. **O zero está guardado na suíte**, junto com o do canal `restauracao`
  (que **segue sem leitor**, de propósito — é T4): se qualquer um dos dois ganhar
  leitor sem T4 ter acontecido, é vermelho. É o que impede T4 de nascer de carona.
- **Não medido em mesa.** O instrumento de Uma Vida de T1 (`umavida|0..999`) não
  sobreviveu no scratchpad, e reconstruí-lo exigiria pilotar o `App.jsx`. A conta
  fechada e o Monte Carlo pelo código real concordam na segunda casa; a medição em
  combate de verdade fica para quem precisar dela. Dito, não escondido.
- **`protegido`/`defesaDe` não tocado** (segue em "Aberto"), nada consertado de
  carona.
- **Sete suítes com o mesmo vício do `teste-sala`, relatadas e não consertadas** —
  vão para "Aberto". Rodadas 20× cada, zero vermelhas; nenhuma é da classe do
  `teste-sala` (~1 em 5.800). A mais frágil é `teste-onda3.mjs:52` (`mult >= 1.9`,
  Invocador medindo **1,990**, colado no limiar): qualquer ajuste de tabela que
  leve o multiplicador a ~1,93 vira falha intermitente sem defeito real.
- **Três achados de produção, nenhum de T3** — o principal: `tentarSaidaNoFimDoTurno(p, null)`
  estoura, porque `= {}` no destructuring não cobre `null`. Padrão pré-existente em
  quase toda a casa; nenhum dos três sítios passa `null` e os três estão em
  `try/catch`. Vai para "Aberto".
- **Para a pessoa:** `envenenado` cai pela metade (4t → 2,02t no dado cru) já no
  inimigo, e é a maior mexida do lote — justamente na condição que ela citou. É o
  5e ao pé da letra (o veneno de uma aranha gigante raramente gruda quatro
  rodadas) e a CD **não foi afrouxada por gosto**: 12 é a `resistir.dif` que a
  própria condição já declarava. Se ela quiser o veneno mais grudento, o lugar é
  uma linha da tabela — CD ou prazo —, e a suíte lê a mudança de volta.

## 14/09 12:10 · v9.239 · T2 · a cura não limpa · commit `a6a6473` + este
- **estado inicial:** árvore limpa, HEAD `7ae4ba1`, VERSÃO v9.238, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo (posta por mim). A vez
  era **T2**, a segunda etapa da Fase T, com a lei da pessoa: *cura normal só
  devolve PV; quem limpa é magia, habilidade de classe, item ou salvaguarda.*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **backend:** varreu as **45 portas de cura** em 16 arquivos, decidiu o descanso
  com o número que o sustenta, renomeou o canal morto `"cura"` → `"restauracao"`
  em `CANAIS_DE_SAIDA`, trancou `limparPorDescanso` contra canal que não seja de
  descanso, e escreveu a catraca `check-cura-nao-limpa.mjs` (7 sabotagens, 7
  mordendo). Não tocou no `App.jsx`.
- **frontend:** **não chamado, de propósito** — a medição não achou fiação para
  consertar no App, e chamar a mão só para ela olhar seria trabalho inventado.
- **testes:** feitos pelo backend junto com o módulo (as asserções são da mesma
  medição): `teste-cond.mjs` 84 → **102**, `teste-relicas.mjs` 98 → **103**,
  `teste-mercado.mjs` 27 → **29**, mais o varredor novo com **33**. Nenhuma
  asserção antiga movida nem reescrita.

### A etapa era conferência, e a conferência passou — 45 portas, zero vazando

Não foi suposição: cada porta foi lida e contada. Poção (`pocoes.js:124`), dado
de vida e descanso curto/longo (`descanso.js` 72, 109, 156, 169), profissão no
descanso (`regras-jogo.js` 102, 107), magia de cura (`App.jsx:12614`), milagre
(`App.jsx:9664` + `divindades.js:259`), Segundo Fôlego (`App.jsx` 8067 e 13632 +
`dadivas.js:174`), relíquia `curaFracao` (`relicas.js:268`), companheiro que cura
(`App.jsx:7900`, `combate.js:382`), Reerguer e Reescrever o Instante
(`habilidades.js` 156–196), arena/noite/duelo (`arena.js:150`,
`uma-noite.js:117`), santuário (`App.jsx:17458`), volta da morte, vínculo,
drenagem e chefe. **Todas sobem `vida` e nenhuma escreve `condicoes`.**

A **única** que limpa é o **`/curar` do console criativo** (`App.jsx:5449`,
declarado em `godmode.js:31` como "PV e PM cheios, condições e exaustão
limpas"). Não é cura normal: é a chave do mundo, interceptada antes do Mestre.
Ficou de pé e **declarada** na tabela do varredor, com o motivo escrito — exceção
que se lê é exceção que se audita.

### O descanso: decidido, e o próprio código deu o argumento

Era o caso difícil, e o cuidado do briefing estava certo: em 5e o descanso longo
cura muita coisa por regra. A decisão é **o descanso fica como está — ele é
passagem de tempo, não cura normal**, e o motivo é estrutural, não de gosto:

**`descanso.js`, o módulo que calcula TODA a metade de PV do descanso, não tem
uma única linha tocando `condicoes`** (provado na seção 3 do varredor). As duas
metades já moram separadas no código: a de PV obedece à lei sozinha, e a limpeza
vem inteiramente da metade do **tempo**, em `limparPorDescanso` chamada de
`regras-jogo.js:84–94`. Não há uma cura que limpa — há horas que passam, e o
relógio de T1 já é o irmão menor disso.

E a conta do que morreria: **`exausto` (`turnos: null`, `saiCom: ["longo"]`) é a
única condição do catálogo cuja única porta é o descanso.** Tirá-la deixaria
exaustão perpétua — T2 abriria o buraco que T4 existe para fechar. A escolha
conservadora é também a única coerente: **zero mudança no que o jogador vive**, e
as duas asserções antigas do descanso em `teste-cond.mjs` continuam literalmente
como estavam — continuarem verdes é metade da prova.

### A mentira estava na tabela, e ela contradizia a lei da pessoa

Quatro condições declaravam `saiCom: ["cura"]` (`envenenado`, `sangrando`,
`cego`, `enfeiticado`) e **ninguém lia o canal `"cura"`**: `limparPorDescanso` é o
único leitor de `saiCom` e só recebe `"curto"`/`"longo"`. Promessa morta — e
promessa que dizia o oposto da lei recém-ditada. Virou **`"restauracao"`**, na
tabela nova `CANAIS_DE_SAIDA`, com o porquê escrito no módulo.

**E renomear, não apagar, foi obrigatório — é o achado do ciclo.** `enfeiticado`
declarava **só** esse canal. Apagá-lo o deixaria com `saiCom: []`, e a regra
implícita de `limparPorDescanso` (*longo limpa toda condição ruim sem canal*)
faria **a noite inteira passar a quebrar encantamento**: mudança silenciosa no
que o jogador vive, nascida de uma limpeza de tabela. As quatro têm `turnos`
(4/3/2/3) e seguem vencendo no relógio: **nenhuma ficou sem saída**.

Duas trancas a mais, ambas contra o erro de amanhã:
- **`limparPorDescanso` recusa canal que não seja de descanso.** Antes aceitava
  qualquer string — `limparPorDescanso(c, "cura")` era o jeito mais fácil de uma
  cura futura apagar condição sem parecer que apagava.
- **`CONDICOES_PROMPT` ensinava o oposto da lei ao Narrador:** *"quem a tira é o
  relógio, o descanso ou a cura"*. Hoje diz *"o relógio ou o descanso"* — **10
  chars a menos**, teto de prompt intacto (56.334).

### A catraca, e as sete sabotagens

`testes/check-cura-nao-limpa.mjs` percorre o `src/` atrás de **toda** linha que
sobe `vida` e falha se houver escrita em `condicoes` na vizinhança. Dois dentes
que a impedem de passar verde à toa: **piso de alcance** (35 portas / 8 arquivos —
lista vazia é vermelho) e **dente inverso** (exceção declarada que para de casar
fica vermelha). Nenhum export novo inventado para a suíte ler.

Sete sabotagens em cópia, sete mordendo: descanso longo zerando condições; poção
de cura cortando veneno de carona; catálogo voltando a dizer `"cura"`; a porta do
descanso reaceitando qualquer canal; o antídoto declarado apagado de carona;
relíquia nova limpando de carona; e a sutil — **o canal sumindo**, que é a que
pegou a mudança silenciosa do encantamento.

### Decisões médias tomadas (com o motivo)

- **O descanso fica como está.** Motivo acima: as duas metades já são separadas no
  código, e é a única escolha que não deixa `exausto` sem saída. Zero mudança no
  que o jogador vive — por isso não subiu para a pessoa.
- **O canal foi renomeado, não apagado.** Apagar mudaria o jogo em silêncio
  (encantamento quebrando na noite). Renomear mantém o comportamento idêntico e
  deixa a porta pronta para T4 ligar.
- **O `/curar` do console ficou de pé e declarado.** É bastidor de criador, não
  gameplay; apagá-lo seria tirar a chave do mundo por causa do nome dela.
- **O frontend não foi chamado.** Nada a fiar no App.
- **Não consertei `protegido`/`defesaDe`** (o Aberto de T1) nem antecipei T3/T4.

### O que ficou

- **Para T4, três coisas, escritas na pauta:** `concentrado` é a única condição
  **sem saída nenhuma** hoje (`turnos: null`, `tipo: "bom"`, `saiCom: []`) —
  armadilha latente, porque nada a aplica, e T2 **não** a criou; o canal
  `"restauracao"` nasce **sem leitor de propósito**, esperando as três portas; e o
  nome do `/curar` a decidir.
- **Um vermelho intermitente, pego ao vivo e registrado em "Aberto":** no meio do
  ciclo o `npm test` deu **180/181 · teste-sala.mjs (122 passaram, 1 falharam)** e
  na corrida seguinte deu verde, com a árvore byte a byte igual. O sítio é
  `teste-sala.mjs:32` — 500 chamadas de `novoCodigo()` **sem semente** e a
  asserção `vistos.size > 480`: colisão de aniversário. **É a lei do determinismo
  por semente quebrada dentro da própria suíte**, e o preço é caro — vermelho que
  não reproduz ensina a mente a ignorar vermelho. **Não afrouxei o 480**, virou
  item leve na pauta. O `npm test` da subida foi conferido verde duas vezes.

### E a nota que o `git log` precisa para não mentir

**Parte do trabalho de T2 viajou no commit anterior, e o erro não foi da mão que
o escreveu.** Enquanto o `backend` ainda media, a pessoa rodou `git add -A` para
commitar arquivos dela (os agentes da mesa de design), e a varredura levou junto
`src/condicoes.js`, `testes/teste-cond.mjs`, `testes/teste-mercado.mjs`,
`testes/teste-relicas.mjs` e `testes/check-cura-nao-limpa.mjs`. Eles estão em
**`a6a6473` — "A mesa de design"**, que é um título que não os descreve. Nada
quebrado subiu (build limpo, 181/181 + 9/9 conferidos depois), e **não se
reescreveu história**: está publicado, e reescrever seria pior que a confusão.
Este commit carrega o resto — o bump de `VERSAO`, o diário e a pauta — e esta
nota. A lição é da casa e já está no `CLAUDE.md` (`73e438b`): **nunca `git add -A`
com uma trava de ciclo posta**, nem duas mãos na mesma árvore sem olhar.

---

## 14/09 11:35 · v9.238 · T1 · o relógio alcança o grupo · commit `9ca2eb7`

> **NOTA DE N1b (15/09, v9.251) — os números de Uma Vida deste bloco foram
> medidos com o Adversário FORA DO CIRCUITO.** A régua passava
> `prioridade: ""` ao `turnoDosInimigos` (`regua-combate.mjs:612`), e
> `combate.js:279` só consulta `escolherAlvo` quando ela existe — o jogo
> passa a intenção da luta (`App.jsx:13606`). A MESMA régua, com o
> Adversário ligado, mede no `justo` **1,4–1,8% de vitória (era 51,1–54,2%), 0,41–0,64 PV de grupo de 132 (era 25,88–28,05) e 2,978–2,986 quedas de 3 (era 1,740–1,790)** e no `duro` **0,0% de vitória (era 8,8–9,9%), 0,00 PV e 3,000 quedas**.
> **Este bloco não foi reescrito de propósito.** Os números dele continuam
> reproduzíveis byte a byte com `medir(..., { comAdversario: false })`, e a
> suíte afirma isso em toda rodada de `npm test`.
- **estado inicial:** árvore limpa, HEAD `2faf58f`, VERSÃO v9.237, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A Fase C fechada e
  a pauta com quatro fases novas aprovadas (**T → B → F → I**). A vez era **T1**,
  a primeira etapa da Fase T, com a lei de desenho ditada pela pessoa: *sistema
  de D&D — cura normal só devolve PV e não remove condição; quem limpa é magia,
  habilidade de classe, item, ou a salvaguarda no fim do turno.*
- **conselheiro:** não chamado (etapa já escrita e aprovada; a pauta tem mais de
  5 itens em "Aberto").
- **backend:** mediu e **não escreveu uma linha em `src/*.js`** — a medição
  provou que `tickCondicoes` já servia como está. Entregou o raio contado, a
  medição nos dois sentidos em Uma Vida, a decisão do save antigo com o motivo, e
  o bloco desenhado para o `frontend` fiar.
- **frontend:** as 41 linhas em `App.jsx:8292–8332`, entre o tique do herói e o
  dos inimigos, em `try/catch` com `calou("prazo-da-condicao-do-grupo", e)`.
  Script `.cjs` com o helper `t(de, para)`, âncora única. Build limpo.
- **testes:** `teste-cond.mjs` 31 → **84** asserções (a catraca do prazo, o dente
  inverso, o save antigo, a âncora no App no molde da seção 15 de
  `teste-efeitos.mjs`) e `teste-afl.mjs` 24 → **32** (a fronteira do zero, onde
  mora `PORTADORES`). **15 sabotagens, 15 morderam.**

### A medição desmentiu metade da pauta, e a etapa ficou mais honesta

**O veneno eterno do companheiro NÃO EXISTE, e nunca existiu.**
`aplicarCondicoesDosGolpes` (`:7606`) só processa `alvoRef === "jogador"` — golpe
de inimigo **nunca** afligiu companheiro. Das condições que chegam ao grupo,
**as sete são `tipo: "bom"`** (inspirado, protegido, abençoado, enfurecido,
apressado, furtivo, fortalecido); a única ruim é `amedrontado` da presença, e ela
já tinha saída em `:13226`. Logo **o dente inverso não é o efeito colateral desta
etapa — é a etapa inteira**: o relógio tira do grupo uma vantagem de trinta
versões, e era isso o conserto.

**São 5 sítios vivos, não 6.** O sexto (`:7543`, o ramo do grupo de
`aplicarCondicaoEm`) é **código morto**: os dois chamadores passam `"você"`
cravado, `ehEu` é sempre verdadeiro e o ramo nunca roda.

**Uma Vida, 1000 combates (`umavida|0..999`), nos dois sentidos.** O instrumento
é o de P3, e o controle o valida: sem condição nenhuma ele reproduz os
563 quedas · 754 PV · 918 absorvido · 153 abrigos de P3, byte a byte.

| | hoje | T1 |
|---|---|---|
| condições que vencem (duro / brando) | **0 / 0** | **727 / 305** |
| turnos até vencer | — | **4,11 / 4,09** |
| companheiro-rodadas com condição (duro) | 4040 | **2335** (−42%) |
| companheiro-rodadas com condição (brando) | 5988 | **5601** (−6,5%) |
| quedas (duro, 200 combates) | 560 | **563** |
| PV restante do grupo (duro) | 798 | **754** (−2,7%) |

**E a leitura honesta, que é a que vale: em mesa isso quase não dói, e o motivo
tem nome.** 94% do que estava de pé no duro era `protegido` — e `protegido` não
compra nada para ninguém: `defesaDe` (`combate.js:39`) não lê `condicoes`, e
`mecanicaDe().defesa` só chega ao HUD. Provado direto: defesa **11 com e 11 sem**.
A única condição do grupo que morde em Uma Vida é `abencoado`, e o Clérigo a
relança tanto que o relógio mal a alcança (−0,4% no brando, −16% no duro). **A
vantagem de trinta versões era real em contagem e quase inerte em efeito** — o
jogador vai ler a linha muito mais do que vai sentir o número.

### Decisões médias tomadas (com o motivo)

- **O dano por turno fica FORA de T1.** `tickCondicoes` devolve `dano`/`fontes`,
  e o herói e os inimigos os cobram; o grupo não. Motivo: companheiro morrendo de
  veneno é um **jeito novo de o jogador perder um companheiro** — consequência
  que muda o que ele vive, e isso é da pessoa, não de etapa aprovada. E a
  fronteira **não esconde nada**: as três que doem (`envenenado`, `sangrando`,
  `queimando`) têm portador único e sempre `alvo: "alvo"`, que escreve no herói
  ou no inimigo e nunca no grupo — **0 em 2000 combates**, por simulação e por
  estrutura. A suíte guarda o zero: portador novo que aponte para condição com
  `danoTurno` acende em `teste-afl.mjs`, em vez de o companheiro começar a morrer
  em silêncio.
- **Save antigo: vence pelo prazo, sem migração.** A instância carrega
  `turnos: N` cheio (nunca decrementou, então N é o valor de catálogo, idêntico ao
  de uma condição recém-lançada); basta o relógio alcançá-la. Motivo escrito:
  **migrar seria inventar um estado que o save não tem** — distinguir "condição
  antiga" de "condição de agora" exigiria uma marca que não existe em ficha
  nenhuma, nascida só para ser lida uma vez e apagada. Conferido dos dois lados:
  nenhum dos 5 sítios escreve `turnos: null`, e `git log -S` mostra que as
  condições alcançáveis nunca tiveram `null` em versão nenhuma; se mesmo assim
  carregar lixo (`null`/`NaN`), `tickCondicoes:248` a mantém viva — que é o
  comportamento de hoje, sem regressão.
- **A condição boa também anuncia.** `✓ ${g.nome}: ${c.nome} passou`, irmã exata
  da linha do inimigo (`:8304`), com o nome na frente porque não sou eu. Motivo:
  a irmã do herói já anuncia, e calar só para o grupo seria uma terceira regra
  para o mesmo evento — além de tornar invisível justamente a mudança que o
  jogador vai sentir, que é ele **perdendo** algo que tinha. Some-se que
  `resumoCondicoesPrompt` manda as condições do grupo ao Narrador: sem a linha,
  ele seguiria descrevendo uma bênção que acabou. Volume: **0,73 linha por
  combate no duro, 0,31 no brando**. Voz de mundo, sem nomear o mecanismo.
- **Não filtra por vida**, diferente do irmão dos inimigos: o inimigo derrotado
  sai de cena, o companheiro caído continua nela e pode ser erguido — o tempo
  passa para ele também.
- **`src/*.js` intocado.** Dar a `tickCondicoes` um `{ semDano: true }` só para o
  grupo seria API nova com um leitor só e um segundo caminho para o mesmo número.
  **T1 é fiação + suíte, como C1** — nenhum export novo, nada para o `teste-ligacao`.

### O achado da suíte, e é a lição de C3 outra vez

A sabotagem que derruba o `try/catch` **mordeu pelo motivo errado**: sem a linha
do `calou`, o `iFim` da âncora vinha `−1` e o `slice(iTry, -1)` entregava quase o
**App inteiro** como se fosse o bloco — as provas de ausência acendiam por acharem
`t.dano` em qualquer outro lugar do arquivo. **Vermelho pelo motivo errado hoje é
verde pelo motivo errado amanhã**: com o bloco ausente e o recorte vazio, elas
passariam vazias. Endurecido com um `achou` que toda asserção do recorte — presença
e ausência — agora exige, com o porquê no comentário. As 15 re-rodadas contra a
versão endurecida: **15/15**.

### O que ficou (foi para a pauta, não foi feito)

- **`protegido` não defende ninguém, nem o herói** — 15 habilidades do acervo
  prometem abrigo, entram como `protegido` e compram **+0 de defesa**. É a forma
  exata das quatro famílias da Fase F, e pertence a ela ou a B. Achado da medição.
- **O sonho dá vantagem eterna ao herói** (`App.jsx:18759`): `"Inspirado"` escrito
  **sem `id` e sem `turnos`** casa com o catálogo, concede vantagem em toda rolagem
  e `tickCondicoes` a preserva com `turnos: null` **para sempre**. É a única
  condição genuinamente eterna do jogo hoje — e é do herói, não do grupo.
- **`aplicarCondicaoEm`, ramo do grupo (`:7543`), é código morto.**
- **Os seis `varredura-*.mjs` não entram no `npm test`.** O `CLAUDE.md` diz que
  entram; `rodar-tudo.mjs` só varre `^teste-` e `^check-`. Rodados à mão, os seis
  passam — nada vermelho escondido, mas não estão guardando ninguém.

---

## 14/09 03:55 · v9.237 · C3 · uma de cada vez · commit `aec84fe`
- **estado inicial:** árvore limpa, HEAD `243d0de`, VERSÃO v9.236, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A vez era **C3**,
  a última etapa da Fase C — que a pauta já dizia ser **conserto, não
  conferência**: C1 mediu o herói segurando duas concentrações, C2b acrescentou
  o companheiro e o risco de `efeitoEmConcentracao` derrubar a errada.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada, e a pauta
  tem mais de 5 itens em "Aberto").
- **backend:** mediu antes de escrever. `CONCENTRACAO_DA_MAGIA` ganhou o teto
  (`quantasAoMesmoTempo: 1`) e `efeitos.js` ganhou **`firmarEfeito`**, irmã de
  `absorverDano` — `{ pers, linha, cedeu }`. `arena.js` passou por ela e largou
  o import de `empilhar`.
- **frontend:** os três sítios do `App.jsx` por **uma porta só**,
  `firmarOuCeder` (`:6634`), terceira irmã de `passarPeloAbrigo` e
  `segurarOuPerder`; os sítios ficaram em `:7878` (herói), `:7993` (companheiro)
  e `:12598` (magia de duração). Teto de prompt medido nas duas pontas.
- **testes:** seção 19 de `teste-efeitos.mjs` e seção 11 de `teste-arena.mjs`,
  com escada de **23 sabotagens** — e uma delas estava verde na entrega.

### A medição que fez a etapa (e desmentiu "canto raro")

**Não era exceção, era um caso em cada quatro.** Em 2094 quedas: 3864 efeitos
firmados, **1352 de concentração**, e **316 deles eram uma segunda por cima de
outra — 23,4%**. O raio real, contado e não suposto: das 85 magias do catálogo
**34 concentram**, mas só **3** chegam à porta de `efeitoDeMagia` (Invisibilidade,
Voo, Invisibilidade Maior); das 148 habilidades **8 são magia e 5 concentram**,
**3** viram efeito no herói. **5 das 12 classes** podem colidir por nome distinto
(Mago 3, Feiticeiro 3, Clérigo 2, Bardo 2, Bruxo 2) — sete nunca colidem. No
companheiro é **1 classe de 12** (o Clérigo, Bênção + Escudo da Fé); na arena,
**2 dos 8 prontos** (remendo e voto).

### Decisões médias tomadas, com o motivo

- **O teto mora na tabela, e a função o conta.** `firmarEfeito` derruba as **mais
  antigas até caber** (`antigas.slice(0, antigas.length - (teto-1))`) em vez de
  cravar "derruba a anterior". Motivo: é a lei "se é número, é tabela" levada até
  o fim — um teto 2 amanhã funciona sem uma linha nova, e a suíte sabota o teto
  para provar que ele é lido de volta, não decorado.
- **`empilhar` ficou genérico e intocado.** Quatro chamadores (frasco, relíquia,
  canal do Mestre, milagre) nunca produzem concentração — conferido, não suposto.
  Ensinar concentração à pilha genérica poria a regra num lugar onde ninguém a
  procuraria.
- **`efeitoEmConcentracao` deixou de ser sorte: fica a ÚLTIMA a entrar.** Era
  `.find(...)` — ordem de chegada. O motivo da escolha está escrito no código: a
  última é exatamente a que `firmarEfeito` teria mantido se o save tivesse
  passado por ela; escolher a primeira faria um save velho **quebrar a magia
  recém-erguida e ainda guardar o fantasma da anterior** — perder duas vezes pelo
  mesmo defeito. Nenhuma das 7 asserções existentes virou de lado (em todas a
  marcada já era a última), e o dente novo trava **os dois sentidos**.
- **Uma porta só no App, com recuo de propósito.** `firmarOuCeder` tem um
  `try/catch` que, se o motor estourar, cai em `empilhar` puro — o comportamento
  de antes desta versão. Motivo: "nunca pode custar o turno" tem um irmão aqui —
  devolver a ficha intocada tiraria do jogador o PM que ele acabou de pagar. O
  recuo está declarado como proposital na suíte, para ninguém o "consertar".
- **A frase nasce no módulo e o App não monta uma sílaba.** Molde de
  `testeConcentracao.linha` (C2). O único direito da tela é o dono na frente no
  companheiro, pelo molde exato de C2b.

### O que o jogador lê (sem `mostrarRolagens`, sem nome de mecanismo)

- herói, buff: `💢 Bênção escapa dos dedos — Invisibilidade toma o lugar dela.`
- companheiro: `💢 Irmã Vela — Bênção escapa dos dedos — Escudo da Fé toma o lugar dela.`
- magia de duração: `💢 Voo escapa dos dedos — Invisibilidade toma o lugar dela.`
- o fio solto que C2b deixou, fechado: magia de duração **+** buff de habilidade
  → `💢 Voo escapa dos dedos — Bênção toma o lugar dela.`
- controle de regressão: **Luz do Dia** não concentra → linha vazia, e ela
  empilha ao lado sem derrubar nada.

### O teto de prompt: intocado, e a nota que não coube

**Pior cena real 81935 → 81935 chars** (teto 82.000, margem 65). Crescimento
estático **zero**. A nota do Mestre **não coube e não foi forçada**: a nota de C2
mede 289 chars, uma irmã mediria 279, e mesmo comprimida a uma cláusula colada na
que já existe mede 48 — 74% da margem inteira, com **três** sítios podendo
dispará-la e `notaRef` acumulando até o `enviar` seguinte. Mesma decisão de C2b,
pelo mesmo motivo. **Consequência escrita na pauta:** o Narrador recebe a magia
nova e continua achando que a antiga está de pé.

### O preço, declarado como fato: o piloto ficou burro

**Mordidas do abrigo 245 → 202, pontos comidos 980 → 808 (−17,6%)** na amostra da
suíte, e a causa está nomeada: as **60 cessões de 420 quedas são todas "Escudo da
Fé → Bênção"** — Remendo e Voto firmam o escudo e na rodada seguinte o jogam
fora. **A regra está certa** (o 5e concorda: Bless e Shield of Faith não
coexistem); quem está errado é o **piloto**, que não sabe que o teto existe.
Ensiná-lo mexe no que o jogador vive e por isso **é outra etapa** — vai para
"Aberto". O número entrou no molde de P3, como fato datado e não como limiar, e o
piso das metades ficou em 40 de propósito: um piso colado no dígito de hoje
**reprovaria justamente esse próximo conserto**.

**A catraca de equilíbrio não saiu da faixa e a margem mais fina abriu:**
`punho`/"cc" 38,9% → **40,2%** (5,2 pt do piso). Amplitude **11,9 pts** (sombra
55,1 · voz 43,2), 8,1 pt sob o teto de 20 — encolheu pelo resorteio do fluxo, não
por equilíbrio. **Nenhum limiar tocado, nenhum pronto reajustado.**

### O achado do ciclo: uma sabotagem que passava verde

A escada tem **23 degraus e nenhum ficou verde** — mas **S21 estava verde na
entrega**. Uma arena que chamasse `firmarEfeito`, empurrasse `fe.linha` e depois
**remendasse `eu.efeitos` à mão** passava em todas as âncoras *e enganava a
própria contagem de duplas* — porque a contagem lê as linhas, e a linha mentia.
É a lição de R4 uma camada abaixo: âncora prova que a linha existe, e nem a
medição salva quando o que se mede é o texto. O fio que a sabotagem não corta é o
**prazo** — um efeito que fica na ficha acaba vencendo —, e daí saiu o dente do
**fantasma**: nenhuma magia cedida pode depois vencer prazo ou cair pela queda de
C2. **S17** (a porta do App que imprime a troca e devolve a ficha de entrada)
também estava verde até a forma dos dois `return` ser travada.
Os degraus mais fundos: S22 (teto afrouxado para 2) acende **16**, S8 (a frase
dizendo o mecanismo) **10**, S2 (arena de volta ao `empilhar`) **6**, S1 (App de
volta) **5**.
E uma **ponte que ninguém tinha pedido**: a suíte extrai a palavra "UMA" de
`ECONOMIA_ACAO_PROMPT` e exige que a tabela cumpra esse número. C3 nasceu porque
promessa e código discordavam — **agora discordar é vermelho**.

### As três âncoras que o frontend teve de mover (e o motivo conferido)

`teste-efeitos.mjs` exigia **literalmente** `empilhar(p.efeitos, buff.efeito)` e
`empilhar(g.efeitos, buff.efeito)` no App: a letra antiga passou a **proibir o
conserto desta etapa**, e não havia como o código cumpri-la sem desfazer C3. O
`testes` conferiu as três e **concordou**: as duas primeiras ficaram mais fortes
(dois controles negativos novos proíbem a pilha genérica nesses sítios, e S1/S18
provam que mordem); a terceira perdeu o `{ ...g }` que provava não-mutação, e essa
intenção migrou para asserções **por chamada** em vez de regex. Aperto, não folga.
Observação anotada e não consertada: o controle negativo do sítio do herói lê o
arquivo **cru**, então um comentário futuro que cite a linha antiga o acende por
engano — os testes novos usam um `soCodigo(...)` que tira comentários antes de
toda prova de ausência.

### A FASE C ESTÁ FECHADA — o antes e o depois inteiro

**Antes (v9.233):** a regra de concentração existia por escrito nos dois lados e
não acontecia em lugar nenhum. `testeConcentracao` (`combate.js:797`) — a regra
ditada pela pessoa, `Math.max(10, dano/2)` — estava pronta **desde sempre** e
**nunca rodava**, porque nenhum dos três nascimentos de efeito copiava
`concentracao`. O campo existia em `condicoes.js` e no catálogo, e o meio
faltava: o herói segurava Invisibilidade, apanhava, e **não havia o que perder**.
Zero magias marcadas em tabela nenhuma; zero quebras; o `ECONOMIA_ACAO_PROMPT`
prometia duas coisas ao Narrador — que a magia quebra e que só se segura uma — e
**nenhuma das duas acontecia**.

**Hoje (v9.237):**
- **34 das 85 magias marcadas** e trancadas por `CONCENTRACAO_DA_MAGIA` — a regra
  mais **10 exceções, cada uma com o motivo escrito**, conferidas uma a uma
  contra o 5e. Lista de exceção, nunca de permissão: magia de duração nova amanhã
  não nasce sem marca em silêncio. **0** marcadas que sejam instantâneas.
- **Dois nascimentos alimentam a regra**, e ambos perguntam ao **catálogo**, nunca
  à ficha: `efeitoDeMagia` (C1) e `efeitoDeBuff` (C2b). `efeitoDeMilagre`
  continua mudo **por prova** — não existe tabela de milagre que declare
  concentração.
- **Quebras por queda, medidas:** de **0** para **10 em 168 quedas** na arena
  (todas de Bênção — Remendo 6, Voto 4), com Escudo da Fé nunca quebrando porque
  `absorverDano` já o consumiu antes de o dano restante chegar ao teste. Sobre o
  golpe de mediana 13 de P3, a magia aguenta **2,2 a 2,9 rodadas apanhando** antes
  de cair.
- **Trocas por teto:** de **0** para **60 em 420 quedas**, e **0 momentos com duas
  de pé** — onde antes 23,4% dos efeitos de concentração firmados eram uma
  segunda por cima de outra.
- **O jogador lê os dois acontecimentos**, em voz de mundo e **sem
  `mostrarRolagens`**, com o dono na frente quando é do grupo:
  `💢 Voo escapa dos dedos — o corpo aguentou 6, e era preciso 10.` e
  `💢 Irmã Vela — Bênção escapa dos dedos — Escudo da Fé toma o lugar dela.`
  Antes ele lia **que** perdeu; agora lê **por quê**. As duas frases nascem no
  módulo, ao lado do número — o App não monta uma sílaba de texto de regra.
- **A escolha deixou de ser sorte.** `efeitoEmConcentracao` era `.find(...)`;
  hoje é regra escrita, travada nos dois sentidos.
- **Duas portas únicas novas no App** — `segurarOuPerder` (C2b) e `firmarOuCeder`
  (C3) —, irmãs de `passarPeloAbrigo`, ambas com recuo que não custa o turno.
- **Teto de prompt: 81935 chars nas quatro versões.** A fase inteira entregou
  quebra, leitura, companheiro e teto com **crescimento estático zero** — o sinal
  do Mestre passou pela nota dinâmica, só no turno em que há o que dizer.
- **A suíte da fase:** `teste-efeitos.mjs` **387 → 421 → 463 → 482 → 543**;
  `teste-grimorio.mjs` 89 → **142**; `teste-arena.mjs` ganhou as seções 10 e 11.
  E a catraca de equilíbrio **nunca saiu da faixa em nenhuma das quatro etapas**,
  com **nenhum pronto reajustado** — a margem mais fina, `punho`/"cc", foi de
  32,9% (falso positivo) → 38,9% → **40,2%**.

**O instrumento também foi consertado no caminho** (C2b): famílias de 30 sementes
davam ~10% de vermelho falso a cada mexida no código; hoje são **120**, com piso,
teto e teto de amplitude intocados.

### O que ficou

- **Não há mais fase aprovada na fila.** A Fase C fecha a última; o próximo ciclo
  pega de "Aberto".
- **Três itens novos em "Aberto"** (ver a pauta): o piloto que não sabe do teto e
  joga fora o abrigo; o Narrador que continua achando que a magia trocada está de
  pé (é o mesmo furo de C2b, agora com um terceiro dono); e os comentários novos
  do `App.jsx` **sem acento**, que cresceram de novo nesta versão.
- **C2c (o inimigo conjurador) intocado**, como mandado — segue em "Para a pessoa
  decidir".
- **O relógio quebrado das condições do grupo: não consertado, e o endereço está
  dito.** O `frontend` esbarrou nele em **`App.jsx:7897-7901`**, dentro do mesmo
  `buffDeCompanheiro` que ele mexeu — é ali que `g.condicoes` é escrito. A mão
  entrou só em `g.efeitos`. O item segue em "Para a pessoa decidir".
- Nenhuma dívida entrou como `pendente` — não houve nenhuma.

## 14/09 03:09 · v9.236 · C2b · o companheiro segura o que já conjura · commit `0f96fd6`
- **estado inicial:** árvore limpa, HEAD `3791b26`, VERSÃO v9.235, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A vez era **C2b**,
  a etapa que o próprio C2 escreveu na pauta ao medir e se desfazer em três.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** mediu o raio **antes** de escrever comportamento, depois ligou
  `efeitoDeBuff` (`efeitos.js`) ao catálogo — `magiaPorNome` + `exigeConcentracao`,
  um import novo — e pôs a cobrança em `arena.js:235-267`.
- **frontend:** as três chamadas do `App.jsx` por **uma porta só**,
  `segurarOuPerder` (`:6593`), irmã de `passarPeloAbrigo`; os sítios andaram
  (`:13436`, `:11756`, `:17284`). Conferência viva sem tocar em save nenhum.
- **testes:** consertou a catraca de equilíbrio que ficou vermelha, e o conserto
  foi no **instrumento**; `teste-arena.mjs` ganhou a seção 10 (a arena *cobra* a
  concentração). `teste-efeitos.mjs` 463 → **482** (seção 18, do backend).

- **A MEDIÇÃO VEIO PRIMEIRO PORQUE A PORTA É A MESMA DO HERÓI, e ela corrigiu
  dois números da pauta.** `aplicarBuffDeHabilidade` serve os dois, então ligar o
  companheiro liga o herói junto — C2 avisou, e o aviso valeu. **"Cinco
  habilidades do herói" são três:** Bênção, Escudo da Fé e Invisibilidade. Voo e
  Marca do Caçador casam com o catálogo mas **não abrem condição nenhuma** em
  `aflicaoDe`, então `efeitoDeBuff` nunca é chamado por elas — o raio do herói é
  3, e está travado nominalmente na suíte. **"13 escolhíveis" nos prontos são
  quatro:** 13 é quantas o piloto *enxerga*, 5 entram só pelo ramo ofensivo (viram
  golpe, nunca efeito) e 4 por cura; só Bênção e Escudo da Fé, no Remendo e no
  Voto, chegam a `efeitoDeBuff`. `chama` e `voz` carregam 8 e 7 magias de
  concentração e **nenhuma** vira efeito. Colisão de nome: **zero**.

- **DECISÃO MÉDIA: a porta é o catálogo, nunca a habilidade.** `exigeConcentracao`
  aceita o objeto que recebe; passar `h` (a ficha) direto responderia **`false` em
  silêncio** para tudo, e o bug seria invisível — a magia nasceria sem concentrar
  e ninguém saberia. Pior: abriria um **segundo lugar** para a regra morar, contra
  a lei "se é número, é tabela". `magiaPorNome(h.nome)` primeiro, a pergunta
  depois. A chave nasce só quando é verdade (ausente, nunca `false`).

- **A CATRACA FICOU VERMELHA, E A MEDIÇÃO MOSTROU QUE A CULPA ERA DELA.** Uma
  asserção só: `[cc] punho vence entre 35% e 65% (32,9%)`. **`punho` não tem uma
  magia na ficha nem um efeito de concentração para segurar** — não pode ser
  afetado pela regra nova. A prova que fechou o caso: uma cópia da arena de C2b
  com o **saque mantido na condição e na frequência exatas** e **toda consequência
  de jogo apagada** (nada quebra, nenhuma linha nasce) mede os **mesmos 32,9%**,
  dígito por dígito. A sorte da arena é um fluxo global travado por semente: um
  d20 a mais reembaralha tudo o que vem depois dele. O retrato de baixa variância,
  que não sente isso, não se moveu — `punho` 45,4 → 45,6.

- **DECISÃO MÉDIA: o conserto é do instrumento, e é um número só — 30 → 120
  sementes por família.** A cegueira foi medida antes de ser consertada: 40
  famílias independentes de 30 sementes/par sobre a arena **sã** dão σ de 3,3–4,3
  pts e **1 em 40 já traz um pronto fora da faixa sem nada ter quebrado** — com
  quatro famílias por rodada, **~10% de vermelho falso a cada mexida no código**.
  A 120 sementes: σ 1,5–2,2 e **0 em 20**. Piso 35, teto 65, as quatro famílias, o
  retrato e o teto de amplitude **intocados**: subiu a precisão do estimador,
  nunca a severidade do dente. 120 é o número que a própria tabela já chamava de
  baixa variância duas linhas abaixo — a família herda a fronteira em vez de
  inventar uma segunda. Custo: `teste-arena.mjs` 11,1 s → 25,9 s; `npm test`
  ~80 s → 95 s.
- **E a prova de que os dentes continuam mordendo, que era a trava desta decisão.**
  A escada de sabotagem (`sombra` ganhando vida) foi refeita com a **suíte
  inteira**, nos dois instrumentos — vermelhos de 30 → de 120: +2 `1→0` · +3
  `1→0` · +5 `3→2` · +8 `7→6`. **O vermelho que some é sempre o mesmo, `[cc]
  punho` — e ele acende idêntico na árvore sã.** Um vermelho que aparece com e sem
  a sabotagem não é detecção, é o ruído da página; descontado ele, os dois
  instrumentos pegam exatamente as mesmas sabotagens. A sabotagem registrada no
  diário de A4, rodada na árvore em que foi registrada, fica vermelha **nos dois**,
  pelo mesmo dente e com o mesmo dígito.
- **DUAS SAÍDAS MAIS FÁCEIS FORAM RECUSADAS, e o motivo é o mesmo nas duas.**
  (a) **Trocar a família "cc"** por outra semente: as três irmãs foram escolhidas
  **antes** de medir, e está escrito na tabela de propósito; trocar justamente a
  que saiu vermelha é catar a semente **depois** de ver o resultado — a família
  nova ficaria verde porque foi catada para ficar, e o dente passaria a medir a
  sorte de quem escolhe. (b) **Crescer o retrato junto:** ali mais precisão
  **afrouxaria**. Amplitude é máximo menos mínimo, ruído infla essa distância, e o
  teto de 20 foi calibrado a 120 sementes/par — amostra maior mediria amplitude
  menor pelo mero sumiço do ruído e daria folga nova debaixo do mesmo teto, sem
  ninguém ter equilibrado nada. **Nenhum número de pronto foi reajustado.**
- **A margem mais fina, honesta:** `punho` em "cc" com **38,9% — 3,9 pt do piso**
  (era 36,2%/1,2 pt a 30 sementes, e 32,9% no dia em que quebrou). Mesmo pronto,
  mesma família: os 2,7 pts que apareceram são ruído indo embora, não parede
  andando. Amplitude do retrato **12,6** (teto 20).

- **DECISÃO MÉDIA: a cobrança entra por uma porta só, não por três.** Três
  `try/catch` soltos nos três sítios seriam três chances de a regra nascer
  diferente em cada um — o vício que a Fase A veio matar. `segurarOuPerder(quem,
  dano, nome)` é `calou("concentracaoDoCompanheiro", ...)` e devolve `linha: ""`
  como único sinal de que nada aconteceu. Nos quatro sítios (os três do App mais o
  da arena) a conta é a mesma: sobre a ficha **pós-abrigo** (o escudo que comeu a
  batida já pagou por ela — testar sobre a ficha velha devolveria o escudo já
  consumido), só em quem fica **de pé**, só quando o golpe **tirou PV**.
- **O que o jogador lê é a frase de C2, palavra por palavra.** O App não monta uma
  sílaba — `grep "escapa dos dedos" src/App.jsx` volta vazio; ele põe só o dono na
  frente, pelo mesmo molde de `passarPeloAbrigo`, para o 🛡 e o 💢 do companheiro
  saírem irmãos na cena. E **independe de `mostrarRolagens`**, como a do herói:

  `💢 Irmã Vela — Bênção escapa dos dedos — o corpo aguentou 9, e era preciso 10.`

  Na arena, com o nome do duelista: `O Remendo — Bênção escapa dos dedos — …`
- **O efeito no combate, medido:** em 168 quedas na arena, **10 quebras**, todas de
  **Bênção**, só no Remendo (6) e no Voto (4) — 0,06 por queda. **Escudo da Fé
  nunca quebra**, e por um motivo correto: `absorverDano` já o consumiu antes de o
  dano restante chegar ao teste.

- **DECISÃO MÉDIA: o companheiro NÃO ganha nota ao Narrador na quebra, e é o que
  mais quero registrado.** C2 mediu a pior cena real em **81935 chars, margem 65**
  para o teto de 82.000. A nota do herói custa ~370 chars no turno da queda, e
  herói e companheiro podem cair **na mesma rodada de inimigos** — uma segunda
  nota ali **estoura o teto**, e o teto de prompt é sagrado. A conta não fecha
  sozinha e o canal não estava no recorte da etapa: fica na pauta como item, não
  como dívida silenciosa.
- **DECISÃO MÉDIA: o companheiro não ganha a linha 🎲 de `mostrarRolagens`.** Dar
  uma exigiria inventar o formato da voz de bastidor com o dono prefixado, e a
  frase de C2 já é independente do portão — o jogador lê o porquê de qualquer
  jeito. Assimetria consciente com o herói, não esquecimento.
- **DECISÃO MÉDIA: a conferência viva foi bancada determinista + montagem, não
  combate real.** Todo caminho até uma quebra de companheiro na mesa passa por
  `enviar` (o Narrador): uma dezena de turnos de IA, e **"qualquer coisa que custe
  dinheiro" está na coluna pesado** da tabela da casa. A bancada (27 asserções, d20
  travado) prova os números e a frase; a montagem em aba nova prova que o arquivo
  não caiu (sem `LimiteErro`). A queda ao vivo na mesa fica para um "sim" da pessoa.
- **UMA ASSERÇÃO DE C1 FOI MOVIDA, COM O MOTIVO ESCRITO** (lei da casa). A linha
  que exigia `efeitoDeBuff(magiaPorNome("Voo"))` **mudo** era C1 travando o estado
  de então — e virou a suíte **proibindo o conserto** desta etapa. A intenção
  mudou de endereço e ficou mais forte: a seção 18 confere **as 85 magias** contra
  `exigeConcentracao` nas duas direções, em vez de uma.

- **A CORREÇÃO DE PROCESSO DESTE CICLO: o save de uma pessoa não é material de
  teste.** Em C2 a conferência viva **sobrescreveu um save real** da pessoa
  (`taverna_rapida_v1`) — a memória da casa já avisa que *autosave sobrescreve
  injeção*, mas o aviso só falava do lado que perde o boneco de teste, não do lado
  que perde a partida de alguém. Virou seção obrigatória em
  `.claude/agents/frontend.md`: guardar o valor de toda chave que for tocar **em
  arquivo no scratchpad** (a aba recarrega), injetar com o jogo desmontado,
  restaurar idem, **confirmar por leitura** e dizer no relato quais chaves tocou.
  Funcionou no mesmo dia: o `frontend` gravou comprimento + SHA-256 de tudo antes
  e depois, e **não escreveu em chave nenhuma** — `taverna_rapida_v1` saiu com o
  mesmo hash com que entrou, e `taverna_save_v1`/`taverna_duelo_v1` continuam
  ausentes como estavam.

- **o que ficou:**
  - **Não esbarramos no relógio quebrado das condições do grupo** — nenhuma mão
    escreveu em `pers.grupo[].condicoes`. O caminho desta etapa é
    `pers.grupo[].efeitos`, cujo tique existe e roda (`App.jsx:8204`). O item
    segue em **"Para a pessoa decidir"**, intocado.
  - **C2c (o inimigo conjurador) não foi tocado, nem parcialmente** — é `pesado` e
    está com a pessoa.
  - **Achado novo, e é de equilíbrio, não de instrumento:** o aperto da sabotagem
    `sombra +3` **vem encolhendo sozinho a cada ciclo** — 3 vermelhos em A4, 1 na
    árvore de antes de C2b (amplitude 20,8), **0** depois (amplitude **19,6, a
    0,4 pt do teto**). Nenhum limiar mudou e nenhum pronto foi reajustado: é a
    amplitude sendo resorteada a cada mexida na arena, que é o que
    `tetoDeAmplitude` já avisava. Mexer no teto é afrouxar/apertar limiar, e
    rebalancear pronto não estava autorizado — **vai para a pauta**.
  - **Um fio solto que é de C3, não desta etapa:** o herói agora pode ter buff *e*
    magia de duração concentrando ao mesmo tempo, e `efeitoEmConcentracao` devolve
    o **primeiro** — pode cair a errada. É exatamente o "uma de cada vez" que C3 já
    tem escrito, e agora com um caso a mais.
  - **A nota ao Narrador na quebra do companheiro** vai para a pauta com a conta
    (margem de 65 chars) já feita.

## 14/09 02:10 · v9.235 · C2 · a quebra acontece na mesa · commit `086d035`
- **estado inicial:** árvore limpa, HEAD `0b04b30`, VERSÃO v9.234, `npm test`
  181/181 suítes + 8/8 varredores verde. Sem trava de ciclo. A vez era **C2**,
  a segunda etapa da Fase C, aprovada pela pessoa.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend (duas chamadas):** a primeira foi **medição pura**, sem escrever uma
  linha — o tamanho real de companheiro e inimigo conjurador. A segunda fez a
  frase da quebra nascer no módulo: `testeConcentracao` (`combate.js`) ganhou o
  campo `linha` e a tabela `RESISTENCIA_DA_CONCENTRACAO`.
- **frontend:** trocou a fiação em `App.jsx:13376-13408` (o nome desce, `tc.linha`
  sobe, o bloco entrou em `try/catch` com `calou`), escreveu a nota dinâmica ao
  Narrador e conferiu vivo — com a queda de verdade na mesa.
- **testes:** não chamado como mão própria; as provas vieram dentro das duas
  entregas. `teste-efeitos.mjs` 421 → **463** (seção 17 nova): 29 asserções de
  regra + 13 âncoras de fiação, com quatro sabotagens medidas.

- **O CORTE FOI A DECISÃO DO CICLO, E ELE VEIO DE NÚMERO, NÃO DE PALPITE.** A
  etapa C2, como estava escrita, tinha duas metades de tamanhos incomparáveis.
  Mandei o `backend` medir **antes** de prometer qualquer coisa, e a medição
  desfez a etapa em três. **A metade do herói encolheu:** a pauta dizia que a
  linha da quebra inteira dependia de `mostrarRolagens`, e é meia verdade — a
  linha `💢 Concentração quebrada` (`:13383`) sempre foi **incondicional**; o que
  estava atrás do portão era só o **🎲 com a CD e o dado** (`:13381`). Ou seja: o
  jogador já lia *que* perdeu e *qual* magia, e não lia **o porquê**. Isso é
  bem menor do que a pauta supunha — e continua sendo o coração da etapa, porque
  perder a magia que se pagou sem entender o que a derrubou é perder duas vezes.

- **DECISÃO MÉDIA: a linha nova nasce SÓ NA QUEDA.** Considerei mostrar também o
  teste que a magia aguenta — o argumento a favor é que o jogador saberia que a
  magia está sob risco. Recusei: seria uma linha de sistema **a cada golpe**
  sofrido, por rodada, e o que se ganha em aviso se perde em ruído na cena. Quem
  quer ver o teste mantido continua tendo a 🎲 de `mostrarRolagens`, intacta. A
  frase da queda explica o porquê no instante exato em que ele importa. Travado
  na suíte dos dois lados (`linha` vazia na mantida, com controle negativo).

- **DECISÃO MÉDIA: a frase é conta, então mora no módulo.** A lei "conta se
  prova, tela se olha" mandou: o texto que carrega número nasce em `src/` e é
  provado em Node, no molde exato que `absorverDano` já usa (`efeitos.js:353`).
  O `App.jsx` não monta uma sílaba — só empurra `tc.linha`. Consequência boa e
  não planejada: a CD teve de sair do meio do `Math.max` e virar tabela
  (`RESISTENCIA_DA_CONCENTRACAO`), porque agora o **texto** carrega a
  dificuldade, e número escrito à mão é número que a suíte só prova copiando —
  duas cópias divergem em silêncio, e aí a frase mente sobre a própria regra.

- **A LEI IRMÃ FOI RESPEITADA NAS DUAS DIREÇÕES.** "O sistema não fala de si
  mesmo": o jogador lê **a magia se desfazendo e o número que decidiu**, nunca o
  rótulo do mecanismo. O que ele lê agora, capturado ao vivo com `mostrarRolagens`
  **desligado**: `💢 Voo escapa dos dedos — o corpo aguentou 6, e era preciso 10.`
  A voz de ficha (`Concentração: d20+2=9 vs CD 11 → QUEBRADA`) ficou **palavra
  por palavra** onde estava, atrás do portão, e a suíte trava isso por regex
  exata — a lista de palavras de bastidor tem controle negativo (reprova o
  `texto` de depuração), senão não estaria medindo nada.

- **O NARRADOR ENFIM RECEBE O SINAL, E SEM GANHAR UM BYTE DE PROMPT.**
  `ECONOMIA_ACAO_PROMPT` promete há versões *"quando quebrar, narre o efeito se
  desfazendo na hora"* — e o Mestre nunca ficava sabendo que a magia tinha caído:
  promessa sem sinal. A nota vai por `notaRef`, o canal **dinâmico**, e só no
  turno da queda. **Pior cena real medida: 81935 chars antes, 81935 depois** (teto
  82.000, margem 65). Crescimento estático: **zero**. `ECONOMIA_ACAO_PROMPT` não
  foi tocado, e há asserção de controle cravando que ele não cresceu.

- **O QUE A MEDIÇÃO ACHOU, E É O ACHADO DO CICLO: o companheiro JÁ CONJURA magia
  de concentração — ela é que não sabe.** A pauta supunha que dar magia a ele
  seria órgão novo. Não é: **8 das 148 habilidades de classe são magias do
  catálogo pelo nome, e 5 concentram** — um Clérigo companheiro de nível 3 sai da
  ficha com **Bênção** e **Escudo da Fé**, e o piloto já as escolhe. Nos oito
  prontos da arena são **28 magias de concentração** na ficha, 13 delas
  escolhíveis. O que falta não é a magia: é o efeito **nascer sabendo**
  (`efeitoDeBuff` perguntando ao catálogo pelo nome). 0 tabela nova, 0 sítio novo
  de nascimento, 1 import novo. Virou **C2b** na pauta, com o cuidado que a
  medição também deu: a porta é a **mesma do herói**, então o raio é herói+
  companheiro e precisa ser medido antes, não depois.

- **E o inimigo é o oposto exato: órgão novo, e volta para a pessoa.** A ficha de
  inimigo (27 entradas em `bestiario.js`) não tem habilidade nem magia; **0 sítios**
  escrevem `efeitos` em inimigo em todo o `src/`; `tickEfeitos` **não roda** sobre
  eles; `turnoDosInimigos` tem **um verbo só** (bater), sem estrutura de plano; e
  o inimigo apanha em **dez sítios** espalhados, sem porta única. O pré-requisito
  honesto é essa porta — e a irmã dela no herói (`sofrerNaPele`) foi a v9.66
  inteira, sozinha. Virou **C2c**, marcado `pesado`, na seção da pessoa.

- **O CHEQUE BARATO QUE RENDEU MAIS QUE A ETAPA: o herói apanha em seis sítios e
  o teste roda em um.** Pedi de passagem que a medição olhasse se há outro lugar
  onde ele sofre dano sem que a concentração seja testada. Há **cinco**, e um
  deles é regra explícita do 5e: `App.jsx:8173` (dano de condição — veneno,
  sangramento), `:8069` (`sofrerNaPele`, a porta única, e com ela salvaguarda,
  queda, armadilha e o preço do esforço), `:12970` e `:13907` (os dois ataques de
  oportunidade) e `regras-jogo.js aplicarMudancas` (dano do Narrador fora de
  combate). **Não liguei nenhum**, de propósito: C1 mediu o raio da quebra com
  cuidado justamente para não estourá-lo, e ampliar o raio hoje não estava
  autorizado pela etapa. Está na pauta com os endereços.

- **Conferido vivo, e com a queda de verdade — não só "monta sem erro".** Aba
  nova, árvore de acessibilidade em vez de foto. Uma Noite → Torneio → A Chama,
  luta contra O Voto: rodadas 2 e 4 apanharam 14 e 4 e o teste **aguentou em
  silêncio** (a decisão de não falar quando aguenta está certa na prática);
  rodada 5, 23 de dano, o teste **caiu** e as duas frases saíram — a do jogador
  na tela, a do Mestre no envelope. `efeitos: []` depois, ou seja
  `quebrarConcentracao` continua no caminho.

- **Duas coisas honestas.** (1) Para chegar ao combate, o `frontend` entrou numa
  Noite nova e **sobrescreveu o save de "Uma Noite" do ciclo M6**
  (`taverna_rapida_v1`, a sessão "A Muralha"). Era save de teste e a campanha
  (`taverna_save_v1`) nem existia, mas é perda real e fica registrada. O resto do
  `localStorage` foi restaurado — as mesmas três chaves do início,
  `taverna_cfg_rolagens` de volta em `"1"`. (2) Os comentários novos nasceram
  marcados `v9.222` (versão de outra fase, que existe de verdade em
  `App.jsx:19365`); corrigidos para `v9.235` por script `.cjs` via `node`, âncora
  inteira e única, com **0** caracteres de substituição nos três arquivos depois.

- **o que ficou:** **C2b** (o companheiro segura o que já conjura) e **C2c** (o
  inimigo conjurador, `pesado`, para a pessoa) escritos na pauta; **C3** intocado
  e ainda válido como conserto (C1 já provou que o jogo não cumpre o "uma de cada
  vez"); item novo em Aberto para os **cinco sítios** onde o herói apanha sem
  teste; e um achado de passagem do `backend`, também em Aberto: `RX_CURA`
  (`companheiros.js:91`) não tem fronteira de palavra, então **"proCURA"** e
  **"obsCURA"** casam — `Localizar Objeto` e `Adivinhação` são classificadas como
  cura, e os quatro prontos que carregam `Localizar Objeto` sentem isso de fato.

---
## 14/09 01:35 · v9.234 · C1 · o campo nasce e viaja · commit `a57b1b2`
- **estado inicial:** árvore limpa, HEAD `436afb9`, VERSÃO v9.233, `npm test`
  181/181 suítes + 8/8 varredores verde. A Fase P estava fechada; a vez era
  **C1**, a primeira etapa da Fase C, aprovada pela pessoa com a regra ditada
  por ela.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** `CONCENTRACAO_DA_MAGIA` + `exigeConcentracao` em `grimorio.js`
  (a tabela e a fachada), `fichaDaMagiaTexto` passando a ler a fachada, e a
  linha que faltava em `efeitoDeMagia` (`efeitos.js`).
- **frontend:** **não chamado, de propósito** — ver abaixo.
- **testes:** `teste-grimorio.mjs` 89 → **142** (seção 12) e `teste-efeitos.mjs`
  387 → **421** (seção 16). 87 asserções novas, seis sabotagens medidas.

- **A ETAPA ERA PEQUENA DE VERDADE, E FOI FECHADA PEQUENA.** Venho de três
  fases seguidas (A3, P1, P3) em que a etapa era maior do que a pauta dizia, e
  por isso a primeira coisa que fiz foi medir o tamanho antes de distribuir
  trabalho. O resultado: **um arquivo de motor com uma linha de comportamento,
  uma tabela de conferência, e nenhuma fiação nova**. O `App.jsx` **não foi
  tocado** e não havia o que tocar nele — o caminho da quebra já estava inteiro
  lá desde antes (`:13377` acha quem concentra, `:13379` roda o teste, `:13383`
  escreve a linha que o jogador lê, `:13434` tira o efeito da ficha). Faltava
  só o campo. Inflar a etapa para justificar o ciclo seria o oposto da lei da
  casa, então o `frontend` não foi chamado.

- **A PAUTA ERRAVA NUM PONTO, E A ETAPA O CORRIGIU: são três nascimentos, mas
  só UM tem fonte.** A pauta dizia "nenhum dos três nascimentos o copia", o que
  sugeria três consertos. Medido: `efeitoDeBuff` (habilidade) e
  `efeitoDeMilagre` (milagre) **não têm de onde copiar** — `concentracao` não
  existe em tabela de habilidade nem de milagre em lugar nenhum da casa. O
  campo atravessa **um** nascimento, `efeitoDeMagia`, e os outros dois
  continuam mudos **por prova**, não por esquecimento: há asserção exigindo que
  nem `true` nem `false` saiam deles.

- **A MARCAÇÃO É TABELA, E A CONFERÊNCIA PASSOU SEM MEXER EM NADA.** O catálogo
  já carregava a verdade por entrada (`concentracao:` na fábrica `M(...)`); o
  que faltava era a **catraca**. `CONCENTRACAO_DA_MAGIA` declara a regra
  ("magia de duração exige concentração") e nomeia as **10** exceções **cada uma
  com o motivo escrito** — lista de exceção, nunca de permissão, no molde de
  `APLICACAO_DO_BUFF` (P1) e com o dente de `GUARDAS` (P2): magia de duração
  nova amanhã **não nasce sem marca em silêncio**. Os números: **85** magias ·
  **44** de duração · **34** marcadas · **10** de duração sem marca · **0**
  marcadas que sejam instantâneas (não há a mentira do outro lado) · e o fecho
  `marcadas + exceções === deDuração`. **Nenhuma entrada de catálogo mudou de
  valor**: conferidas uma a uma contra o 5e, as dez estão certas. Foi
  conferência registrada, como A4 — e teste verde também é resposta.

- **DECISÃO MÉDIA: A QUEBRA COMEÇA A ACONTECER NESTE CICLO, E FOI DE PROPÓSITO.**
  C1 não fazia a quebra acontecer — isso é C2 —, mas com o caminho do App já
  inteiro, o campo chegando **dispara a quebra sozinho**. Decidido com o
  `backend`, que concordou, e a razão principal é de lei: segurar não seria
  "não ligar ainda", seria **desligar um caminho que já está ligado** — e
  "remover ou desligar o que existe" é pesado, não está aprovado, e o que está
  aprovado é exatamente o contrário. Toda forma de segurar custaria um portão
  novo sem tabela, cujo único propósito seria desligar o que a pessoa pediu, e
  que alguém teria de lembrar de remover em C2: dívida escondida.
  **O raio está medido e é minúsculo.** `efeitoDeMagia` tem **um** chamador de
  produção em todo o projeto (`App.jsx:12453`), restrito a
  `funcao ∈ {invisibilidade, voo, luz}` = **4** magias: Invisibilidade, Voo,
  Invisibilidade Maior (as três concentram) e Luz do Dia (não concentra, e está
  certo). **Só o herói** — nenhum NPC, nenhum companheiro, nenhum piloto de
  arena faz nascer esses efeitos. Nenhuma das três soma dano.

- **O EFEITO MEDIDO, EM NÚMERO.** A conta é fechada (d20 uniforme), então não há
  simulação: há probabilidade exata. O teste roda **uma vez por rodada**, sobre
  o dano **total** da rodada (`danoNoJogador`), e não uma vez por golpe.
  CD = `max(10, dano/2)` → **a metade do dano só começa a morder a partir de 22**
  (com 21 a CD ainda é 10). Sobre o golpe de mediana **13** que P3 mediu em Uma
  Vida, a CD é 10, e a chance de **quebrar** numa rodada em que se apanha é
  **45% com modVigor +0 · 40% com +1 · 35% com +2**. Em outras palavras: a magia
  de duração aguenta em média **2,2 a 2,9 rodadas apanhando** antes de cair. Com
  dano de rodada 30 a quebra vai a 65% (+1), e com 40, a 90%. É uma forma nova
  de o jogador perder a magia que pagou, ela é sensível e o número diz isso — foi
  o que a pessoa autorizou ao ditar a regra, e é o que C2 vai fazer o jogador
  **ler direito**.

- **AS SABOTAGENS, EM NÚMERO** (feitas em cópia, nunca na árvore). Apagar a linha
  nova de `efeitoDeMagia` derruba **11** asserções; trocá-la por um
  `concentracao = true` incondicional derruba **14**; tirar uma exceção da tabela,
  **4**; marcar uma magia hoje não marcada, **5**; ampliar a lista de `funcao` da
  porta do App, **4**; tirar de `exigeConcentracao` a linha em que o campo manda,
  **2**. Duas lições vieram daí: a primeira sabotagem fazia a suíte **estourar**
  em vez de contar (o vício que a pauta já nomeia num item aberto), consertada
  nas duas linhas com o motivo em comentário; e a lista da porta do App estava
  **redigitada** na suíte, medindo a própria cópia — passou a ser **lida do
  `App.jsx`**, e a sabotagem foi de 1 para 4 asserções derrubadas.

- **O QUE C2 HERDA, JÁ MEDIDO.** (a) A quebra do **herói** já acontece — C2 não
  a liga, C2 confere o caminho inteiro e faz o jogador **ler** o que houve (hoje
  a linha da rolagem só aparece com `mostrarRolagens` ligado, e a CD/rolagem é
  metade do que ele precisa saber). (b) **Companheiro e inimigo conjurador
  continuam fora**: nenhum deles faz nascer efeito de magia, então para eles não
  há o que quebrar — é trabalho de C2 e é maior do que parecia. (c) **O herói
  pode segurar DUAS concentrações ao mesmo tempo** (Voo e depois Invisibilidade:
  `empilhar` só substitui por nome igual) e `efeitoEmConcentracao` devolve a
  **primeira**, então uma batida derruba uma só — achado do `backend`, é
  exatamente o assunto de **C3**, e a forma natural é `CONCENTRACAO_DA_MAGIA`
  ganhar o teto, que é onde a regra já mora.

- **O QUE FICOU** (e virou item novo na pauta, `leve`): as duas portas discordam
  sobre valor não-booleano — `exigeConcentracao({concentracao: "sim"})` ignora o
  campo e cai na regra, `efeitoDeMagia` o aceita por verdade. Para as 85 do
  catálogo nunca diverge (todas têm booleano, e há asserção cravando isso), mas
  magia digitada pelo Mestre passa pelas duas. Os `testes` travaram o
  comportamento atual dos **dois** lados em vez de julgar qual está certo — que
  é o certo a fazer numa etapa que prometeu não decidir regra.

## 14/09 01:05 · v9.233 · P3 · a proteção enfim protege (A FASE P FECHA) · commit `99500c7`
- **estado inicial:** árvore limpa, HEAD `a2bfe6e`, VERSÃO v9.232, `npm test`
  181/181 suítes + 8/8 varredores verde. A vez era **P3**, a última etapa da
  Fase P — e a pauta já dizia, corrigida depois de P2, que a etapa tinha virado
  outra coisa: **a proteção ainda não protegia ninguém**, e enquanto não
  protegesse o piloto não podia procurá-la.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend (duas mãos):** a absorção com número e com leitor
  (`ABSORCAO_DO_BUFF` + `absorverDano` em `efeitos.js`, consumo em `arena.js`);
  depois o recorte do piloto (`ehAbrigo` em `companheiros.js`, o terceiro
  degrau) e as duas medições de Uma Vida.
- **frontend (duas mãos):** a porta única `passarPeloAbrigo` e os 7 sítios de
  dano do herói e do grupo; depois o **nascimento** do abrigo no companheiro
  (`buffDeCompanheiro` passando a chamar `efeitoDeBuff`) e o irmão no relógio
  (`tickEfeitos` sobre `pers.grupo`). Tudo em `calou(...)`.
- **testes:** 193 asserções novas — `teste-efeitos.mjs` 201 → **387** (seções
  13, 14 e 15), `check-protecao.mjs` 38 → **45** — mais o conserto do dente da
  mesa real em `teste-arena.mjs` (76 → **79**).

- **O QUE MUDOU EM UMA FRASE.** Desde sempre, *"absorve o próximo dano"* tirava
  **zero** de dano de quem quer que fosse: P1 tirou a mentira do golpe (o Escudo
  Arcano parou de narrar "+2 de dano mágico"), mas a defensiva nasceu com força
  **zero** e sem leitor. Hoje ela **come do golpe e se gasta** — na mesa de Uma
  Vida, na arena, no herói e no companheiro —, e o jogador lê quanto parou ali.

- **O DESENHO ADOTADO CONTRA O DA PAUTA, e os números que decidiram.** A pauta
  previa `absorve: N` numa entrada de `pers.guardas`, reusando `expirarGuardas`.
  O backend mediu e adotou a **porta irmã**: `absorve: N` no próprio **efeito**
  que `efeitoDeBuff` já cria, consumido por `absorverDano`.
  - **Alcance.** A família `absorve` é **25 das 64** defensivas do acervo de 593
    — a maior das cinco. Na arena, `GUARDAS` pega **0 dos 8 prontos** (fato que
    P2 já cravara com teto 0); `absorve` pega **3** — Chama, Remendo e Voto —, e
    os três estavam **abaixo de 50%** na catraca, que é onde a proteção deve
    pesar.
  - **Sítios novos de nascimento: zero.** `efeitoDeBuff` já era chamado nas duas
    portas que ligam abrigo a ficha. Pela porta da guarda, as duas teriam de
    aprender a rotear — e uma delas mora no App, ou seja metade da proteção
    ficaria escura até a mão seguinte.
  - **A convivência se dissolve:** há **1 colisão** no acervo inteiro (Forma
    Dracônica casa com as duas tabelas), e a precedência que a resolve já estava
    escrita e testada — `guardaDe` primeiro.
  - **A seta de dependência não se mexe.** `habilidades.js` continua a única
    folha do motor, com zero imports; o desenho da guarda exigiria
    `habilidades.js → combos.js`.

- **DE ONDE SAI O NÚMERO — e por que o teto é a parte que importa.**
  `ABSORCAO_DO_BUFF` = `{ porPM: 2, custoPadrao: 2, minimo: 2, teto: 12 }`. A
  régua sai do **custo**, como em `BUFF_DA_HABILIDADE`: 2 de golpe por PM, o
  dobro da força ofensiva, porque um bônus de dano cobra em **todo** golpe dos
  três turnos e este cobra **uma vez só**. Escudo Arcano (2 PM) come 4 · Muralha
  de Gelo (5) come 10 · Pele de Pedra (7) come 12.
  **O teto 12 foi medido, não escolhido:** um golpe na arena tem mediana **13** e
  média 13,76, sobre duelistas de 24–36 PV, e uma queda dura 4,85 golpes
  acertados. 12 é o maior número que ainda fica **abaixo** de um golpe mediano —
  nem Globo de Invulnerabilidade (11 PM, 22 sem teto) apaga uma batida. É a
  mesma lei que o comentário de `GUARDAS` já escrevera para a defesa: nada que
  zere o golpe, porque defesa alta é a estatística que mais rápido quebra um
  combate. **Prova na mesa real:** em 241 mordidas, **0 vezes** o abrigo comeu o
  golpe inteiro.

- **O RECORTE DO PILOTO: uma família, e o motivo é o fracasso de P2.** P2 mediu
  a ampliação inteira e a catraca reprovou — `ehBuff` 33 → 75, `sombra` de 60,2
  para **32,9** (piso 35), amplitude 15,8 → **25,7** (teto 20), +150 linhas de
  abrigo **todas inertes**. A causa não era o tamanho: era a **força zero**. O
  que mudou entre P2 e hoje foi **uma** família. Logo o recorte é o número: das
  42 defensivas que o regex nunca viu, entram as **12** que compram alguma
  coisa; as outras 30 (amortece 8 · nao_cai 5 · intocado 18 · protege 8) ficam
  de fora até terem o que comprar. **`sombra` é a prova de que o recorte está no
  lugar certo:** quem o derrubou em P2 foi "Esquiva Ágil", e Esquiva Ágil é
  `intocado` — fora daqui. `ehBuff` no acervo: 33 → **45**.

- **A CATRACA VOLTOU — e APERTOU, sem reajustar pronto nenhum.** Retrato de 120:
  amplitude **15,0 → 12,7** pts (teto 20), os oito dentro de 35–65 nas quatro
  famílias e no retrato. Quem subiu foi quem devia (os três donos de abrigo,
  todos abaixo de 50: chama 49,9 → 54,4 · remendo 48,6 → 54,6 · voto 43,9 →
  **52,0**); quem desceu foi o topo (sombra 58,9 → 54,2 · flecha 54,2 → 49,0).
  **Nenhum pronto foi reajustado em toda a Fase P** — a licença de reajuste
  existia e não precisou ser gasta. Conferido pelo orquestrador em corrida
  própria da suíte, não só pelo relato.
  **Margem fina registrada como fato:** `punho` na família `cc` mede 36,2%, a
  1,2 pt do piso 35. Entrou na suíte como linha declarada, **sem virar
  limiar** — folga convertida em teto seria um segundo teto por cima do 35–65.

- **O EFEITO EM UMA VIDA, EM NÚMERO** (200 combates, sementes `umavida|0..199`,
  Mago+Clérigo+Engenheiro nv5 + herói, teto 20 rodadas; medido **duas vezes**, a
  segunda contra o caminho real do App, com os três portões de
  `buffDeCompanheiro` e o prazo da condição no lugar do padrão):
  - **cenário duro** (4 elites nv9): quedas de companheiro 566 → **563**; rodada
    da 1ª queda 4,41 → **4,64**; PV restante do grupo 675 → **754** de 26400;
    **918 pontos de dano parados em 153 abrigos**.
  - **cenário brando** (3 comuns nv5): 0 quedas nos dois; PV restante 91,7% →
    **93,3%**; **431 pontos parados em 75 abrigos**.
  - **A leitura honesta, e ela é a que vale:** o "+11,7% de PV restante" do
    cenário duro é real mas mede uma base de 2,6% do máximo — o grupo é quase
    varrido nos dois casos. O par que não depende de quão letal é o cenário:
    **918 e 431 pontos de dano que passam a parar no escudo em 200 combates**
    (4,6 e 2,2 por combate), e **91% dos escudos nascidos chegam a morder** (153
    de 168). A primeira medição dizia 954/159; a honesta é 918/153, 4% menor — o
    backend trouxe a correção **contra si mesmo**, e é esta que fica.
  - **E o controle que separa o crédito:** `companheiros.js` de HEAD mais o sítio
    novo do App dá 563 quedas · 754 PV · 918 absorvido · 153 abrigos, **byte a
    byte igual**. Ou seja: **o ganho inteiro de Uma Vida vem da absorção e do
    nascimento; o recorte do piloto contribui zero em Uma Vida** — ele paga na
    arena, onde os abrigos que morderam foram de **83 → 241** e o dano parado de
    **332 → 964**.

- **decisões médias tomadas (com o motivo):**
  - **O nascimento do abrigo no companheiro foi fiado, e o portão que o
    autorizou era um risco nomeado.** `buffDeCompanheiro` (`App.jsx`) **nunca**
    chamava `efeitoDeBuff`: o companheiro escolhia o abrigo, a mesa consumia
    abrigo, e o abrigo **nunca nascia** — o efeito medido em Uma Vida era
    **zero**. O perigo de fiar era o de P2 (a guarda sem relógio virando +4
    permanente), e por isso a mão só passou depois de **enumerar os leitores**:
    `combate.js` não contém a palavra `efeitos` em linha nenhuma;
    `bonusDeDano`/`bonusDeArma` só são chamados com a ficha do herói; `defesaDe`
    não lê `efeitos`. O único leitor vivo é `absorverDano`, que **remove o efeito
    ao gastá-lo**. Não há "+4 permanente" aqui.
  - **Nasceu o irmão no relógio** (`tickEfeitos` sobre `pers.grupo`), porque o
    que faltava era o prazo: sem ele o escudo atravessaria a porta da luta e
    comeria o primeiro golpe da luta seguinte, inclusive depois de carregar o
    save. Mora no tique do herói e **não** em `limparConjuracoesDaLuta`: guarda
    vence por **rodada**, que só existe na luta; efeito vence por **turno**, que
    é toda resposta do Mestre.
  - **Só a cláusula da absorção vai à tela.** Anunciar "+N de dano" no
    companheiro seria anunciar número que ninguém lê — a mesma recusa de P1.
  - **O efeito fica em quem conjurou**, mesmo com `port.alvo === "aliados"` (é o
    que `aplicarBuffDeHabilidade` já faz para o herói). Somar um abrigo por
    companheiro seriam três escudos na mesma pele: é o número sem teto que esta
    escolha evita.
  - **O preço do esforço não gasta o abrigo** (`abriga: false`, por parâmetro
    nomeado e não por adivinhação de string): dano auto-infligido não é golpe
    chegando de fora, não há nada para um escudo encontrar. **A queda gasta** —
    cair é o chão batendo em você.
  - **Uma porta única no App** (`passarPeloAbrigo`) em vez de sete `try/catch`
    soltos: sete catches são sete chances de um nascer diferente.
  - **Os envelopes do Narrador passaram a dizer o que o corpo pagou**, não o que
    a fonte rolou. Com o abrigo mordendo, "já cobrou X · NÃO mude o número"
    viraria ordem para mentir.
  - **O comentário que exagerava foi corrigido, e o achado foi do próprio
    backend contra si.** O degrau "o abrigo de pé não se re-firma" dizia que
    re-firmar "compra ZERO"; `empilhar` casa por nome e portanto **renova o
    prazo**. O comentário passou a dizer as duas metades medidas: perde-se a
    renovação (82 de 278 turnos, 6 PV em 200 combates, 0,02% — ruído) e ganha-se
    o turno que volta a render na arena (golpes com bônus 42 → 75, e 1 pt de
    folga para `punho` em `cc`).

- **O DENTE DA MESA REAL: o proxy envelheceu, e o conserto não foi afrouxar.**
  `teste-arena.mjs` ficou vermelho — `comPeso >= 100` medindo **75** (era 329 em
  A3). A causa é a Fase P funcionando: P1 tirou a defensiva do golpe de propósito
  (329 → 108) e P3 fez o piloto trocar bônus por abrigo. O número **migrou de
  moeda**, e `comPeso` conta só a metade ofensiva.
  **O piso 100 não desceu um dígito.** A parcela virou a **soma** que a frase
  sempre quis medir — `rendeu = comPeso + abrigos` = **316** (75 + 241) contra os
  329 de A3 —, e cada metade ganhou dente próprio com piso **40**, herdado do
  `golpesMinimosDaSonda` que a **mesma tabela** já escolhera (abaixo disso a
  prova passa vazia), em vez de inventar um segundo limiar.
  **Provado por sabotagem, em cópia:** a arena parando de consumir efeito nenhum
  dá **13 falhas**; a metade ofensiva zerada com a defensiva intacta dá **3** — e
  é o caso que decide, porque a soma ficaria **verde** em 244 e quem morde é o
  dente da metade. Sem ele, essa regressão passaria.

- **A LIÇÃO DE R4 APLICADA AO QUE ACABOU DE NASCER.** O nascimento do abrigo no
  companheiro é `const` local do `App.jsx` e portanto **invisível ao
  `teste-ligacao`**: apagar as três linhas deixava a casa inteira verde, o mesmo
  `mexerNaReviravolta()` de novo. A seção 15 mede **definição E sítio de
  chamada**, conta ocorrências (`=== 1`) em vez de perguntar "existe?" — porque o
  comentário logo acima repete os mesmos nomes e foi assim que uma âncora andou —
  e recorta o ramo `aliados` **dentro** de `buffDeCompanheiro`, já que
  `aplicarBuffDeHabilidade` tem um ramo homônimo 500 linhas acima que **tem**
  `efeitos:`. **Quatro sabotagens, quatro vermelhos certeiros:** o nascimento
  apagado (4 falhas), o irmão no relógio removido (3), a recusa de P1 caindo (1),
  o abrigo se espalhando pelo grupo (1). Nenhuma passou, nenhuma gritou por
  engano.
  **Conferido em cópia pelo orquestrador**, de forma independente: a defensiva
  voltando a nascer com força zero — o estado exato de P1/P2 — dá **16 falhas**
  em três arquivos.

- **A FASE P ESTÁ FECHADA. O antes-e-depois inteiro:**
  - *"Absorve o próximo dano"* tirava **0** de dano de qualquer um, em qualquer
    mesa → tira **918** pontos em 200 combates de Uma Vida e **964** na mesa dos
    28 pares da arena.
  - **Escudo Arcano narrava "+2 de dano mágico"** — uma defensiva que somava no
    golpe → narra o abrigo, com o número que ele aguenta. 391 buffs defensivos
    deixaram de somar em P1.
  - **Companheiro e duelista nunca erguiam guarda:** 0 das 9 entradas de
    `GUARDAS` era reconhecida pelo piloto → **9 de 9**, com **0 falsas guardas**
    sobre as 593 habilidades do acervo.
  - **O buff do companheiro em Uma Vida nunca chegava a `comp.efeitos`** —
    nenhuma classificação de P1 o tocava, nem rótulo, nem frase → nasce pelo
    caminho único do herói, com relógio próprio.
  - **Abrigos que morderam na arena: 0 → 241.** Turnos de apoio que compram
    alguma coisa: 329 (só ofensiva) → **316** (75 ofensiva + 241 defensiva).
  - **A catraca de equilíbrio nunca saiu da faixa e apertou:** amplitude 20,0
    (A4) → 15,8 (P1) → 15,8 (P2) → 15,0 → **12,7**. **Nenhum número de pronto
    foi reajustado nas três etapas.**
  - **A prova:** `teste-efeitos.mjs` 168 → 201 → **387**; `check-protecao.mjs`
    nasceu em P1 com 38 e está em **45**; `teste-guardas.mjs` ganhou a seção 6 em
    P2; `teste-arena.mjs` 64 → 69 → 76 → **79**, com o dente da mesa real medindo
    as duas moedas.

- **o que ficou (e por quê):**
  - **As condições do grupo nunca vencem — e isto é anterior à Fase P.** Seis
    sítios escrevem condição em `pers.grupo` e **zero** a decrementam: o
    companheiro que leva veneno fica envenenado **para sempre**, e a condição boa
    do próprio `buffDeCompanheiro` (que `turnoDosCompanheiros` **lê**, via
    `condAtacante`) é vantagem permanente desde a v9.2. O efeito ganhou relógio
    nesta etapa; a condição continua sem. Foi para a pauta, e é o maior dos
    restos.
  - **`turnoDosCompanheiros` não lê `efeitos`**, então o `bonus` de dano do
    companheiro nasce e é inerte. Medido e confirmado com grep: `combate.js` não
    contém a palavra em linha nenhuma. Foi para a pauta — ligá-lo faz número
    crescer sem teto medido, e isso é etapa com catraca própria.
  - **Quatro das cinco famílias de P1 seguem com força zero** (amortece 8 ·
    nao_cai 5 · intocado 18 · protege 8 = 39 habilidades). `amortece` tem molde
    pronto (`amortecerDano` já corta pela metade); `intocado` e `nao_cai` colidem
    com `estaIntocavel` e com o teste de morte. Cada uma é a sua própria etapa.
    Foi para a pauta.
  - **Não há prova de COMPORTAMENTO do nascimento**, só âncora de texto:
    `buffDeCompanheiro` é `const` dentro do componente e não se importa em Node.
    O caminho, se um dia valer, é o backend extrair o miolo para `src/` — aí vira
    export com leitor e o `teste-ligacao` passa a guardá-lo sozinho. Registrado.
  - **O piso `minimo: 2` é inalcançável pelo catálogo** (as 25 da família medem
    4–12): ele guarda a porta de fora — relíquia, poção —, não o acervo.
    Registrado, não é defeito.
  - **A forma "nada chega" nunca disparou** na mesa real (0 de 241): existe no
    código, tem dente se aparecer, e por isso `danoParado` é um **piso** do que
    foi parado, nunca o total.
  - **Dívida pequena, registrada:** os comentários novos do `App.jsx` foram
    escritos **sem acento** (a mão escolheu a segurança contra o vício de
    codificação da casa). O arquivo está íntegro — 0 caracteres de substituição,
    11.293 acentos — mas o estilo destoa dos vizinhos. Não vale um ciclo; vale a
    nota.

## 14/09 00:05 · v9.232 · P2 · o piloto reconhece as nove guardas · commit `bdf94f4`
- **estado inicial:** árvore limpa, HEAD `9bafcd4`, VERSÃO v9.231, `npm test`
  181/181 suítes + 8/8 varredores verde. A vez era **P2**, segunda etapa da
  Fase P — aprovada pela pessoa sabendo que muda Uma Vida **e** o Duelo.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** `ehGuarda` em `companheiros.js` (a pergunta à tabela, com nome);
  o passo 3 do piloto ergue guarda antes de buff; `RX_BUFF` partido em
  `RX_APOIO` + `RX_ABRIGO`; `turnoDosCompanheiros` (`combate.js`) passou a
  carregar `habilidade` e `custo` na ação `guarda`. `arena.js`: zero linhas.
- **frontend:** o ramo `ac.tipo === "guarda"` no turno do grupo (`App.jsx`),
  mais o prazo das guardas do grupo no relógio do herói e o `baixarGuardas`
  do grupo no fim da luta. Os três em `try/catch` com `calou(...)`.
- **testes:** 51 asserções novas — seção 6 de `teste-guardas.mjs` (a catraca
  permanente, tabela `MEDIDA_DO_PILOTO`, sorte travada), 10 em
  `teste-comp.mjs` e a seção 9 de `teste-arena.mjs`. Nenhuma asserção
  existente foi movida.

- **O QUE MUDOU EM UMA FRASE.** `guardaDe(hab)` decidia pela tabela `GUARDAS`
  desde a v9.53 e ninguém perguntava a ela: `decidirAcaoCompanheiro` adivinhava
  por `RX_BUFF`, um regex de nome. **Nenhuma das 9 guardas casava** — companheiro
  e duelista nunca erguiam guarda, e a família defensiva era promessa que só o
  herói de carne cumpria. Hoje o piloto **pergunta**, e enxerga **9 de 9**.

- **A MEDIÇÃO, nos dois sentidos.** Sobre o acervo inteiro de **593**
  habilidades (12 classes + subclasses + especializações + grimório):
  - **9 de 9** entradas de `GUARDAS` são escolhidas pelo piloto quando ele as
    tem na ficha (antes: 0). **0 falsas guardas** — nada que `guardaDe` não
    reconhece vira guarda, e esse zero é lei na suíte.
  - **Deixou de enxergar 4 por engano:** `Dissipar Magia` (o achado de P1 — um
    dispel que narrava "+2 de dano mágico" por conter "barreira"),
    `Tiro Perfurante`, `Punho de Pedra` e `Linha da Lâmina`. `ehBuff` no acervo:
    **37 → 33**.
  - **Onde a mudança pisa de verdade é Uma Vida:** de 60 fichas de companheiro
    (12 classes × 5 níveis), **6 passam a erguer guarda** onde nenhuma erguia —
    Druida nv5/8/12 (Casca de Carvalho) e Engenheiro nv5/8/12 (Elixir de
    Combate). Na arena são **0**: nenhum dos 8 prontos carrega qualquer das 9,
    e isso entrou na suíte como fato declarado com teto 0, não como exigência.

- **decisões médias tomadas (com o motivo):**
  - **`RX_BUFF` sobrevive, encolhido — e é a resposta à pergunta da etapa.**
    Ele tinha dois vocabulários dentro. A metade de ABRIGO (escudo, barreira,
    proteção) **já tem tabela**: quem responde por ela é `aplicacaoDoBuff`
    (`combos.js`), a tabela de P1 com o veto `RX_NAO_E_PROTECAO` dentro — é ele
    que separa "Escudo Arcano" de "Tiro Perfurante". A metade de APOIO (bênção,
    inspiração, grito, canção, hino, postura, fúria) é a única que **nenhuma
    tabela descreve**, e por isso a única que continua sendo palpite. Duas
    tabelas primeiro, regex só para o resto.
  - **A guarda vem antes do buff, com UM sorteio só.** O passo 3 tinha um
    `Math.random() < 0.7`; manter dois portões faria o companheiro gastar mais
    turnos em apoio do que gastava — mudança de ritmo que a etapa não pediu.
    Assim o **número** de turnos de apoio não muda, só **o que** é escolhido.
  - **O piloto pula a guarda que já está de pé** (`guardasAtivas`, leitor que já
    existe). Sem isso, a fiação nova criaria um turno queimado novo:
    `erguerGuarda` recusa a repetida. Isto resolve a METADE da guarda do item
    aberto "o companheiro re-firma o buff que já está de pé" — o item fica na
    pauta com a metade do buff, que continua valendo.
  - **A ação `guarda` passou a carregar a habilidade.** `turnoDosCompanheiros`
    empurrava `{tipo:"guarda"}` e **jogava a habilidade fora**. A ação seca (sem
    inimigo de pé) continua chegando sem ela — é a presença do campo que separa
    as duas, e `arena.js` já dependia disso.
  - **O prazo do grupo mora junto do prazo do herói.** `defesaDe` já soma
    `defesaDeGuarda` em qualquer ficha, então a guarda do companheiro passou a
    valer sozinha contra os inimigos. Sem o irmão no relógio, Casca de Carvalho
    viraria **+4 de defesa permanente** — bug pior que o silêncio que a etapa
    veio fechar. Fim da luta idem.

- **A VOLTA QUE A ETAPA DEU, e o número que ela comprou.** O primeiro desenho
  (meu, não do backend) usava o veto de P1 como **portão solto** sobre `ehBuff`.
  A medição mostrou que ele derrubava **5 buffs honestos** junto — Fúria de
  Batalha, Hino de Guerra, Fúria Sangrenta, Hino da Vitória, Sangue dos
  Antigos —, porque o veto é desambiguador de linguagem de abrigo e só faz
  sentido **dentro** de `aplicacaoDoBuff`. O segundo desenho errou para o outro
  lado: deixar `aplicacaoDoBuff` **ampliar** a lista do piloto, e aí a catraca
  de equilíbrio **estourou** — está medido abaixo. O terceiro é o que ficou:
  `aplicacaoDoBuff` **filtra** o que o regex já via, nunca amplia.

- **A CATRACA DE EQUILÍBRIO: byte-a-byte com a linha de base de P1.** Família
  `rr`: muralha 49,0 · sombra 54,8 · chama 41,4 · remendo 48,6 · voz 51,4 ·
  flecha 61,9 · punho 49,0 · voto 43,8. Retrato de 120: **amplitude 15,8** pts
  (teto 20), todos dentro de 35–65. Mesa real idêntica em cada dígito: 416
  quedas · 5562 linhas · 772 buffs firmados · 108 golpes com bônus · 403 prazos
  vencidos. **Nenhum número de pronto foi reajustado** — a medição de P3 fica
  intacta. O único número que se move na suíte inteira é a sonda sintética da
  guarda: razão **0,699 → 0,739** (teto 0,9), e move pelo motivo certo — a sonda
  usa "Postura de Casca de Carvalho", que agora vira plano `guarda` e deixa de
  ser re-erguida enquanto está de pé.

- **O ACHADO QUE VALE UMA ETAPA: a ponte medida e descartada.** Ligar
  `aplicacaoDoBuff` como AMPLIAÇÃO de `ehBuff` (o piloto passando a reconhecer
  a família defensiva inteira de P1) foi medido e **reprovado pela catraca**:
  - `ehBuff` 37 → **75** (+42 defensivas: Esquiva Ágil, Corpo de Ferro, Pele de
    Pedra, Intervenção, Indomável, Armadura Sombria, Elo Vital…)
  - `sombra` — o topo do retrato, e um dos dois prontos que nunca gastavam turno
    em apoio — ganha "Esquiva Ágil" e despenca de **60,2 para 32,9** (piso 35);
    `[aa]` 34,8; `[cc]` 31,9. Amplitude **15,8 → 25,7** (teto 20). `flecha`, que
    segue sem buff, sobe a 58,6 — o espelho do mesmo fenômeno.
  - buffs firmados 772 → **943**; linhas de abrigo 394 → **544** (+150, **todas
    inertes**); `npm test` 180/181, `teste-arena.mjs` com 4 falhas.
  A causa em uma frase: **a defensiva de P1 nasce com força zero e sem leitor**,
  então o turno gasto nela compra nada — e a catraca mede exatamente isso. Esta
  é a prova, em número, de que o desenho que P1 deixou escrito (a família
  `absorve` virando **guarda de uma batida**, campo `absorve: N` em
  `pers.guardas`, consumido ao ser gasto, reusando `expirarGuardas`) **tem de
  vir ANTES** de o piloto procurar a defensiva. **Não foi feito aqui de
  propósito:** P2 é o reconhecimento, e a proteção de verdade é obra de outra
  etapa. Quem recebe é **P3**, e a pauta foi corrigida para dizer isso.

- **o que ficou (e por quê):**
  - **Dois falsos positivos do `RX_APOIO` sobrevivem, sem regra nova:** `Fúria de
    Gaia` ("Terremoto que atinge todos os inimigos" — casa por "fúria") e
    `Comando: Atacar` ("Sua invocação ataca com fúria redobrada"). Nenhuma tabela
    os descreve e inventar regra para dois casos seria trocar um palpite por
    outro. Foram para a pauta como item leve.
  - **A guarda de pé não aparece em tela nenhuma** — nem a do herói. `guardas` só
    é lido no instante em que sobe e no instante em que cai; no meio o jogador
    não tem onde conferir. Para o companheiro pesa mais, porque ele não tem
    painel de ficha aberto. Foi para a pauta.
  - **O Narrador não sabe da guarda depois do turno em que ela sobe:**
    `resumoGrupoPrompt` não carrega `guardas`. O herói tem o mesmo furo — é
    decisão de família, não bug do grupo. Foi para a pauta.
  - **Três dos nove `conceito` de `GUARDAS` falam em segunda pessoa** ("o que vem
    em **sua** direção"). O frontend ajustou os pronomes da cláusula de efeito na
    linha do companheiro; o conceito vem pronto da tabela e sai meio torto sob o
    nome de outro. Foi para a pauta.
  - **Aviso registrado, sem conserto:** `evoluirCompanheiro` (`App.jsx:8613`)
    preserva `guardas` por spread hoje, mas é um sítio que remonta a ficha do
    companheiro sem saber que ela passou a ter prazo em rodadas.
  - **Margem fina herdada de P1, medida e não tocada:** `m.comPeso` na seção 7 da
    arena está em **108** contra o piso 100, e o comentário inline ainda cita os
    329 da v9.225. A queda é de P1 (a defensiva parou de somar no golpe), não de
    P2 — conferido que a amostra de buffs dos oito prontos é idêntica sob o
    `ehBuff` antigo e o novo. Fica como está até P3 medir.

## 13/09 22:55 · v9.231 · P1 · o Escudo Arcano deixa de dar dano · commit `3dcf61f`
- **estado inicial:** árvore limpa, HEAD `8e536ee`, VERSÃO v9.230, `npm test`
  181/181 suítes + 7/7 varredores verde. A Fase R fechou no ciclo anterior; a
  vez era **P1**, a primeira etapa da Fase P — aprovada pela pessoa sabendo que
  muda o combate de Uma Vida **e** do Duelo.
- **conselheiro:** não chamado (a etapa já estava escrita e aprovada).
- **backend:** a tabela `APLICACAO_DO_BUFF` (5 famílias: absorve, amortece,
  não cai, intocado, protege) + `aplicacaoDoBuff`, `APLICA_FORA_DO_GOLPE` e
  `efeitoNoGolpe`, em `combos.js`. `efeitoDeBuff` consulta a tabela; os
  leitores do dano passam a respeitar o rótulo.
- **frontend:** um sítio só (`App.jsx:7740`): a nota do Narrador para de
  farejar a palavra "físico" dentro da frase e pergunta a `efeitoNoGolpe`.
- **testes:** varredor novo `check-protecao.mjs` (38 asserções, 7→8
  varredores), seção 8 nova em `teste-arena.mjs` (64→69) e seção 9 nova em
  `teste-efeitos.mjs` (168→201). **Nenhuma asserção existente foi invertida.**

- **O ACHADO QUE MUDOU O TAMANHO DA ETAPA.** A pauta descrevia P1 como
  correção de rótulo e de frase. Não era: **`bonusDeDano` e `bonusDeArma`
  (`combos.js`) nunca leram `aplica`** — filtram só por escopo. Trocar o
  rótulo sozinho não mudaria número nenhum: a frase ficaria honesta e o golpe
  continuaria somando, e a casa acharia que tinha consertado. Por isso a
  correção tem duas metades, e a segunda (ensinar os leitores do dano a
  respeitar o que o efeito declara) é a que faz o número mudar.

- **O SEGUNDO ACHADO, na própria prova.** O diff do backend **não deixou
  nenhuma asserção vermelha** — e isso era o diagnóstico, não o alívio: a
  suíte nunca cravou o que uma defensiva faz. `teste-efeitos.mjs:297` e
  `:301-307` usavam só habilidades ofensivas, e a sonda da arena usava uma
  defensiva inventada ("Postura de Ferro") que não promete proteção nenhuma.
  O comportamento errado sobreviveu porque **nenhuma prova o media**. Daí a
  suíte ter *acrescentado* catraca em vez de inverter asserção.

- **decisões médias tomadas (com o motivo):**
  - **A tabela mora em `combos.js`, não em `efeitos.js`.** `efeitos.js` já
    importa `combos.js` (`naturezaDaHabilidade`); a volta criaria o ciclo que
    a casa evita. A seta continua num sentido só: efeitos → combos → classes.
  - **O campo `tipo` do catálogo não é a espinha da classificação.** Ele erra
    nos dois sentidos ("Segundo Fôlego" é `defesa` e é cura; "Postura de
    Vigília" é `defesa` e dá um golpe de graça) e **falta** em relíquia,
    poção, grimório e no que o piloto da arena escolhe. Classifica-se pelo
    TEXTO, que é o que o jogador lê.
  - **Lista de exceção, não de permissão.** Só o que está em
    `APLICA_FORA_DO_GOLPE` deixa de somar. Uma lista de permissão emudeceria
    save antigo (sem `aplica`), milagre (`todos`) e canal do Mestre — provado
    que os três continuam somando os mesmos números.
  - **Um veto antes da tabela (`RX_NAO_E_PROTECAO`).** "Escudo" aparece dos
    dois lados da briga: sem o veto, "Tiro Perfurante", "Punho de Pedra",
    "Linha da Lâmina" e "Marcha Sem Recuo" perderiam o golpe que a ficha
    promete. Varredura final: **0 habilidades de `tipo: "ataque"` viraram
    proteção** — e esse 0 virou dente.
  - **A defensiva nasce com força zero, e a frase perde o número junto.**
    Gravar uma força que ninguém lê seria trocar uma mentira por outra mais
    quieta; anunciar "+N" de um número que não existe, idem. Mesmo motivo
    pelo qual `EFEITO_DA_MAGIA` nasce com `bonus: 0`: vale pelo estado.

- **A REGRESSÃO, MEDIDA E NÃO PROMETIDA.** O "antes" não saiu da memória: a
  catraca foi rodada contra uma árvore mutante que **reproduziu o retrato de
  A4 exato**, então a diferença é toda de P1.
  - **O que deixou de somar:** 391 buffs defensivos firmados na amostra da
    arena (262 Postura Defensiva + 129 Escudo Arcano). Golpes com o bônus
    dentro **329 → 108 (−67%)**; buffs firmados 791 → 772.
  - **A catraca de equilíbrio ficou dentro da faixa em tudo.** Família `rr`:
    muralha 50,5→49,0 · sombra 54,3→54,8 · chama 42,4→41,4 · remendo
    48,1→48,6 · voz 51,0→51,4 · flecha 61,9→61,9 · punho 50,0→49,0 · voto
    41,9→43,8. Retrato de 120: **amplitude 15,7 → 15,8 pts**, contra teto 20.
    Nada saiu de 35–65%. **Nenhum número de pronto foi reajustado** — isso é
    P3, e a medição dele fica intacta. O que se mexeu é interno ao retrato:
    muralha −3,1, punho −2,8, remendo +3,2, e a ordem do topo trocou.

- **o que ficou (e por quê):**
  - **A defensiva ainda não protege ninguém.** P1 parou na classificação e na
    narração honesta, de propósito. O desenho investigado, para P2/P3:
    `reacoes.js:40` (`escudo_arcano`, gatilho `sofre_dano`) **já é o dono
    legítimo** de "absorve o próximo dano", mas é permanente por ter a
    habilidade, não armado por usá-la. Rotear para ele exigiria
    `escolherReacao` passar a ler `pers.efeitos` (muda combate em campanha
    viva); a alternativa, ensinar `defesaDe` a somar efeito, colide com
    `defesaDeGuarda`, que já faz isso com prazo por rodada. **O desenho que o
    backend faria:** a família `absorve` vira guarda de UMA batida — campo
    `absorve: N` na lista `pers.guardas`, consumido e apagado ao ser gasto,
    reusando `expirarGuardas`. Não foi escrito; é achado para P2/P3.
  - **O acervo real é 593 habilidades, não 508.** A varredura do teste
    alcançou 85 magias do grimório que ninguém tinha contado, e nelas duas
    proteções que **só existem lá**: `Proteção contra Energia` e `Globo de
    Invulnerabilidade`. As cinco do grimório classificam certo.
  - **As ambíguas (classificadas pelo texto, não por palpite):** *Postura de
    Vigília* ficou **dano** (o texto promete "um golpe de graça", embora seja
    `tipo: defesa`) · *Muralha de Gelo* e *Muralha de Espinhos* ficaram
    **proteção**, mas as duas também ferem · *Muralha Erguida* e *Muralha de
    Pedra* ficaram **dano** (terreno puro; "muralha" ficou FORA da tabela de
    propósito, senão "Muralha de Fogo" virava defensiva) · *Escudo do Aliado
    Caído* ficou **proteção** (é resgate, não barreira) · *Bênção do Bosque*
    ficou **proteção** por "resiste a", embora "Bênção" seja universal por
    direito em `UNIVERSAIS` · *Manto Flamejante* e *Esfera Prismática* ficaram
    **dano** (auras ofensivas com nome de abrigo) · *Contramágica* ficou
    **dano** (não é absorção, e a reação `contramagia` já é a dona).
  - **Bug vizinho, não consertado porque é P2:** `Dissipar Magia` casa com
    `RX_BUFF` (`companheiros.js:89`) por conter "barreira" e chega a
    `efeitoDeBuff` — um dispel narrando "+2 de dano mágico". O veto o mantém
    em `dano`; o conserto é no vocabulário do piloto, que é exatamente P2.
  - **Aspereza herdada, registrada e não tocada:** `res.cond.efeito` já vem
    com ponto final de `aflicoes.js`, então a linha sai "+2 de defesa. · o
    próximo golpe encontra…". Era assim antes também.

## 13/09 21:30 · v9.230 · R4 · a suíte da fase, e a Fase R fechada · commit `a1e5ba6`
- **estado inicial:** árvore limpa, HEAD `dde2c45`, VERSÃO v9.229, `npm test`
  181/181 suítes + 7/7 varredores verde. A vez era **R4**, a última etapa da
  Fase R — e ela nascia **credora**: o orquestrador já tinha corrigido a pauta
  depois de R3 dizendo que as quatro provas pedidas provavelmente já existiam.
  Por isso o ciclo **começou por uma conferência**, não por escrever.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **testes (a conferência, primeiro):** leu a suíte inteira contra o que R2 e
  R3 alegam, e o veredito confirmou a suspeita — **as quatro provas da pauta
  já estavam feitas e nenhuma foi reescrita**: eleição determinística por
  semente (seções 2 e 9i, 300 mundos, as 7 formas alcançáveis), forma→detector
  (seção 8 e 8b–8g), a ordem menor→maior (seção 9d, exaustivo de 560
  combinações), e o Narrador só na revelação (seção 9k). **R4 não repetiu
  nada disso.** A catraca forma→detector de R2 também foi conferida por
  sabotagem e **morde**: forma sem `achaAlvo` → 6 falhas; sem linha em
  `MUNDOS_DE_PROVA` → 5; detector quebrado → 10.
- **testes (a escrita):** cinco dentes novos, **290 → 332 asserções**, tudo em
  `teste-reviravolta.mjs`. **Nada em `src/` mudou** — nenhum dente ficou
  vermelho por culpa do código.

- **O ACHADO DA ETAPA, e a razão de ela existir.** A conferência sabotou o
  `App.jsx` em cópia e encontrou o defeito que esta casa inteira existe para
  caçar, um andar acima do normal — **na própria prova**:
  - **apagar a ÚNICA chamada de `mexerNaReviravolta()` (`App.jsx:10251`)
    deixava `npm test` inteiro VERDE** — 181/181 suítes, 7/7 varredores. R1,
    R2 e R3 podiam sair do jogo em silêncio, e três etapas de trabalho viravam
    acervo sem que nada mordesse.
  - `if (maiorPodeNascer(...) && false)` — idem, **verde**.
  - O motivo é estrutural, e vale para além das reviravoltas: **toda âncora de
    "ligado ao jogo" media a DEFINIÇÃO** (`/mexerNaReviravolta/`), nunca o
    sítio de chamada; e `mexerNaReviravolta` é const local do App, não export,
    logo **invisível ao `teste-ligacao`**. "Escrito e nunca acontece" é
    exatamente o defeito que a Fase R gastou três etapas curando.

- **os cinco dentes, na ordem do estrago que deixavam passar:**
  1. **a chamada, e não a definição.** Exige `mexerNaReviravolta()` como
     *instrução*, **uma vez por turno**, na ordem entre `dispararPropositos` e
     `colherAsFalas`. Lê a **condição inteira do `if`** fechando parênteses por
     contagem — é isso que mata o `&& false`, que uma regex perdoaria por pegar
     só o prefixo.
  2. **o ciclo com dias que passam.** A fase vista de fora, que a pauta pediu e
     nunca teve prova: a condição de `cuidarDasSementes`
     (`dia - regadaEm >= diasEntreRegasDe`) **roda pela primeira vez em teste**,
     contra o `promessas.js` real — menor madura em 9, maior em 18, folga de 3
     no meio, nenhuma caindo duas vezes.
  3. **as duas pontas se encontram.** `elegerReviravoltas` nunca recebia um
     mundo e `MUNDOS_DE_PROVA` nunca entrava num ciclo.
  4. **o bilhete do `fecharAto`** — a asserção que falha no dia em que ele
     ganhar chamador em `src/`, com o vínculo e as duas saídas no comentário.
  5. **todo `porte` ∈ `PORTES`** — uma oitava forma com `porte: "medio"`
     passava pela catraca de 4 menores / 3 maiores e virava acervo inerte.

- **decisões médias tomadas:**
  - **a ordem do turno é medida por ÍNDICE no texto normalizado, não por
    vizinhança de linha.** Motivo: âncora que exige as três chamadas coladas
    fica vermelha no dia em que um órgão novo nascer entre elas — seria uma
    catraca que pune crescimento legítimo. Por índice, ela guarda só o que
    importa (a virada depois dos propósitos, antes das bocas).
  - **exigir UMA chamada, e não `>= 1`.** Motivo: duas chamadas por turno
    dobrariam o ritmo de `RITMO_DAS_VIRADAS` — as sementes regariam duas vezes
    por dia — e **nenhuma asserção de ritmo acusaria**, porque todas medem a
    tabela, não a frequência de uso.
  - **o laço de dias é declarado como RÉPLICA da condição do App**, com a lista
    do que copia e o aviso escrito. Motivo: é a honestidade do dente — ele não
    roda o `App.jsx`, roda uma cópia da regra, e no dia em que
    `cuidarDasSementes` mudar a réplica tem de ser revista junto. Fingir que é
    o App seria a mentira que a etapa veio caçar.
  - **os números de R4 saem todos de `RITMO_DAS_VIRADAS` e de
    `sementes.length`**, nenhum cravado na suíte — lei "se é número, é tabela",
    e é o que impede a prova de concordar consigo mesma em vez de com o código.

- **a catraca morde (conferido pelo orquestrador em cópia, não prometido pelo
  agente):** o mesmo rascunho de sabotagem rodado de novo contra o arquivo
  final, com o projeto intocado —

  | sabotagem | antes (290) | depois (332) |
  |---|---|---|
  | apagar `mexerNaReviravolta();` | **VERDE 290·0** | **VERMELHA 328·4** |
  | `maiorPodeNascer(...) && false` | **VERDE 290·0** | **VERMELHA 331·1** |
  | oitava forma sem linha em `MUNDOS_DE_PROVA` | 6 falhas | **16 falhas** |
  | oitava forma com `porte: "medio"` | passava na catraca do porte | **13 falhas** |

- **A FASE R, FECHADA — o antes e o depois inteiro** (conferido contra o
  código de `9d2902f`, não contra o diário):
  - **antes de R1, 5 das 7 formas eram inertes.** O detector morava no
    `App.jsx` e cobria **2 formas** (`aliado_agente`, `heranca_roubada`); o
    resto era `return null`, e o comentário de lá dizia isso com todas as
    letras. As **3 maiores** somavam dois motivos — sem detector *e* sem
    ninguém lendo `.maior`. Como a eleição distribui uniforme entre as 4
    menores, **metade das campanhas nascia com a menor muda, e 100% delas sem
    maior nenhuma.**
  - **depois de R3:** `achaAlvo` nas **7/7**, e a catraca de R2 impede a oitava
    nascer sem um. As três maiores acontecem, com ritmo próprio (rega a cada 6,
    amadurece em 18, contra os 12 do episódio mais longo) e a ordem
    menor→maior garantida por estrutura (`quemPodeRevelar` devolve **um** nome).
  - **depois de R4:** o número que sobrava — **1 sítio de produção podia sumir
    sem que a casa notasse** — virou **0**. Apagar a chamada agora derruba a
    suíte da casa (`180/181 · FALHARAM: teste-reviravolta.mjs`).
  - **a suíte da fase: 41 → 131 (R2) → 290 (R3) → 332 (R4).** Quatro etapas,
    quatro versões, zero regressão na menor.
  - e o que nasceu no caminho: o sexto tipo de laço e as três pontes de R1
    (`familia`, `oficioDoAntecedente`, o razão do informante), `achaAlvo` +
    `garantirMundo` + `alvoDaForma` e as tabelas `LIMIARES_DA_VIRADA` /
    `PAPEIS_DO_MESTRE` (R2), `RITMO_DAS_VIRADAS` + `quemPodeRevelar` + a tranca
    do alvo dividido (R3), e `teste-antecedentes.mjs` inteiro (R1).

- **o que ficou:**
  - **um achado novo para a pauta, visto durante a sabotagem:** uma forma com
    semente que não existe no Livro faz a **seção 1b estourar** (exceção, não
    falha) — e suíte que morre de exceção **esconde os outros 300 dentes
    justamente no dia em que eles têm o que dizer. É herdado do G7**, não de
    R4, e vale para qualquer suíte da casa. Entra em "Aberto" como `leve`.
  - **o item mais valioso de "Aberto" NÃO foi feito e continua lá:** a
    **varredura de `Math.random` nas provas**. O orquestrador mediu de
    passagem: **14 suítes citam `Math.random` diretamente**, e o vício pior nem
    aparece nesse grep — `teste-sala.mjs` cai no `Math.random` **por omissão**,
    deixando o parâmetro `rnd` no padrão. Numa casa cuja lei é "determinismo
    por semente", é o defeito mais grave que pode haver numa prova.
  - **um tropeço de processo, dito porque custou tempo:** o orquestrador
    encerrou um turno esperando a notificação de uma mão, e a mão morreu ali —
    **o mesmo erro do primeiro ciclo**, e o roteiro já avisa. Pior: a mão
    ressuscitou depois e escreveu a etapa **em paralelo** com a segunda, e por
    um momento o arquivo teve dois blocos R4. O segundo agente mesclou os dois
    ficando com a metade mais forte de cada, e **o arquivo commitado tem uma
    série só** (conferido: as seções `10`–`10e` aparecem uma vez na saída).
  - os **dois itens pesados** da Fase A continuam esperando a pessoa (a
    concentração inerte e a família defensiva), e **nenhuma fase aprovada
    sobrou**: com a R fechada, a lista "Aprovado pela pessoa" está vazia. O
    próximo ciclo pega de "Aberto".

## 13/09 22:05 · v9.229 · R3 · a maior enfim acontece · commit `e50eb43`
- **estado inicial:** árvore limpa, HEAD `c0f026b`, VERSÃO v9.228, `npm test`
  181/181 verde. A etapa aprovada da vez era a **R3**, já encolhida por R2 para
  só consumo: as três formas **maiores** (`contratante_servia`, `cidade_dizimo`,
  `mestre_treinou`) tinham detector desde R2 e seguiam inertes porque
  `mexerNaReviravolta` lia só `.menor`. Metade da prateleira era acervo escrito
  e nunca vivido.
- **conselheiro:** não chamado (a etapa já estava escrita, e a pauta cheia).
- **backend:** `reviravoltas.js` ganhou a tabela `RITMO_DAS_VIRADAS`,
  `diasEntreRegasDe(forma)`, `quemPodeRevelar({menor, maior, livro,
  episodioAberto, dia})`, `maiorPodeNascer` + `menorPodeNascer` e o campo
  `reveladaEm` em `garantirReviravolta`. `DIAS_ENTRE_REGAS` deixou de ser um `3`
  cravado e passou a **ler a tabela**.
- **frontend:** `App.jsx` — `reviravoltaMaiorRef` (declaração, save `:7346`,
  load `:10975`, reset `:9744`), e `mexerNaReviravolta` quebrado em
  `cuidarDasSementes` + `revelarAVirada` + o árbitro. O "um gesto por turno"
  saiu de três `return` no meio do corpo e virou valor de retorno, visível em
  quem chama. `TRAICAO` intocado, zero na tela, nada somado ao prompt.
- **testes:** `teste-reviravolta.mjs` de **131 para 290 asserções** (+159), em
  nove seções novas — incluindo um exaustivo de **560 combinações** de estado
  para a lei da cena única, e o cenário de ponta a ponta do alvo dividido nos
  dois mundos (com e sem a tranca).

- **como a maior se distingue da menor, e por quê** (a decisão de ritmo que a
  pessoa pediu que fosse escrita):
  - **rega a cada 6 dias, contra os 3 da menor.** O número não é "o dobro
    porque soa maior": 3 sementes × 6 = **18 dias** de amadurecimento, e o
    episódio mais longo do catálogo (4 marcos × `DIAS_ENTRE_MARCOS`) vive
    **12**. Como a lei 4 **adia** a maior enquanto houver episódio aberto, um
    adiamento que durasse mais que a espera seria cancelamento disfarçado. A
    menor fica nos 3 porque 3 é o compasso do episódio: ela amadurece em 9
    dias, a vida de um episódio.
  - **folga de 3 dias entre uma queda e a outra** — um marco de episódio de
    digestão. O mundo vive uma batida inteira do `oDiaSeguinte` da primeira
    antes de a segunda poder cair.
  - **a ordem é menor → maior**, e ela é a virada da campanha, não um evento a
    mais: não cai por cima de uma menor em curso nem de um episódio aberto.

- **decisões médias tomadas:**
  - **`quemPodeRevelar` devolve UM nome, e não dois booleanos.** "As duas não
    estouram na mesma cena" vira **estrutural**: não existe resposta em que as
    duas caibam, e o App não pode errar mesmo querendo. O `livro` entra dentro
    da função pelo mesmo motivo — se a maturidade viesse de fora, o App podia
    ouvir `"maior"` e só depois descobrir que ela não estava madura, e a menor,
    que estava, perderia o turno em silêncio.
  - **a maior tem escape de prazo; a menor não.** Sem escape, a maior ficaria
    trancada **para sempre** em toda campanha cujo detector da menor nunca acha
    alvo (o herói que anda sem grupo, a bolsa sem item de origem vaga) — seria
    reescrever, um andar acima, o bug que R3 veio desfazer. Então: enquanto a
    menor não nasceu, o campo é dela por `diasDeEsperaPelaMenor` = **9** (o
    amadurecimento inteiro dela: se em todo esse tempo o mundo não deu alvo
    vivo, não vai dar); depois disso a maior nasce sozinha.
  - **episódio aberto adia só a maior; a menor continua caindo com episódio
    aberto.** Blocar a menor seria regressão em campanha viva — dias de jogo
    tirados de quem já estava jogando, e ninguém veria, porque a virada
    simplesmente demoraria mais. Está guardado por asserção, com o motivo
    escrito no comentário.
  - **fora do que a etapa pedia: a tranca do alvo dividido, nas duas pontas.**
    `elegerReviravoltas` garante formas diferentes, **não alvos diferentes** — e
    o companheiro traidor (`aliado_agente`) pode ser também quem encomendou a
    primeira missão (`contratante_servia`). O filtro do Livro é `dona`+`alvo`:
    as sementes das duas se somariam, uma pagaria a catraca da outra ("pesado"
    pago com dinheiro alheio, dois dias antes do devido) e a outra ficaria
    **trancada para sempre** — o defeito de R2 com roupa nova. Entrou no
    escopo porque *é* a lei de convivência da etapa, não um órgão novo.
    **Quem cede é a menor, e o motivo é físico, não de culpa:** ceder é
    devolver o alvo, e a maior não consegue — no turno em que nasce ela já
    plantou, e as três sementes estão no Livro com aquele nome; uma maior que
    "cedesse" sairia deixando exatamente a herança que causou o problema.
    A menor, que ainda não plantou nada, cede de graça — e não fica refém,
    porque não há prazo: o detector dela roda de novo no turno seguinte, e o
    alvo vem do mundo, não do contrato. A assimetria está na assinatura
    (`maiorPodeNascer` tem `dia`, `menorPodeNascer` não), e há asserção que
    acusa o dia em que alguém acrescentar um prazo ali.
  - **a tranca vale com a maior já revelada.** Ao revelar, o App paga só as
    sementes **maduras**; as imaturas ficam no Livro com aquele alvo, e a rega
    da menor (`dona`+`alvo`+imatura) regaria as sobras da maior como se fossem
    dela. O alvo da maior é dela antes e depois de a máscara cair.

- **o que muda num save antigo** (o cuidado que a pessoa pediu): ele não tem o
  campo `reviravoltaMaior` — lê `null`, e a maior **passa a poder nascer** dali
  em diante. Simulado em seis cenários, 60 dias cada, contra o módulo de
  verdade: com a **menor em curso e não revelada**, ela cai no dia 11 exatamente
  como cairia sem a maior existir, e a maior só se apresenta depois; com
  **episódio aberto até o dia 30**, a menor cai no 11 igual e a maior adia para
  o 31; com a **menor já revelada e `reveladaEm: 0`** (o campo não existia), a
  folga já está vencida e ninguém é punido por ter revelado antes de o campo
  nascer. Nenhum caminho em que a maior atropele. E o caso que era morto — a
  menor que nunca acha alvo — agora tem história: a maior nasce no dia 9.
- **o Narrador:** nada de bloco novo no prompt. As duas catracas de teto
  continuam de pé e conferidas: `teste-prompt.mjs` mede a pior cena real em
  **81 935** chars (limite 82 000) e `teste-geografo.mjs` corta a pauta em
  **1 265** (`TETO_DA_PAUTA` 1 400). R3 não moveu nenhum dos dois. A verdade
  eleita só sai por `revelarAVirada`, num bloco só, e o `motivo` do árbitro
  nunca chega à tela — provado por regex sobre o `App.jsx`.
- **uma âncora de teste movida, com motivo:** `/podeRevelar\(rev\.forma/`
  deixou de existir — o App agora faz **uma** pergunta em vez de uma por
  virada. Exigir a âncora antiga de volta seria exigir de volta o turno em que
  as duas podem estourar juntas. Ficaram duas asserções no lugar (o ciclo segue
  genérico por forma; a revelação sai de uma pergunta só) e uma negativa para a
  antiga não voltar sorrateiramente.
- **o que ficou:**
  - **o `teste-ligacao` conta menção em comentário como leitor.** Os três
    agentes esbarraram nisso de forma independente nesta etapa
    (`maiorPodeNascer` e `menorPodeNascer` passavam por falso positivo). A suíte
    de R3 se defendeu sozinha exigindo **chamada de verdade** (`if
    (menorPodeNascer(` e até o ref certo dentro dela — trocar os refs passaria
    em qualquer teste de comportamento e desligaria as duas trancas em
    silêncio), mas o varredor da casa continua com o buraco. **Vai para a
    pauta.**
  - **`fecharAto` de `promessas.js` não tem chamador em lugar nenhum** — e se
    ganhar um, ele murcha as sementes não pagas de um ato: uma menor com as
    sementes murchas nunca mais amadurece, e trancaria a maior sem prazo (o
    ramo ② de `quemPodeRevelar` não tem escape temporal). Não é alcançável
    hoje; fica escrito para o dia em que for ligado. **Vai para a pauta.**
  - **R4** (a suíte da fase) é a próxima etapa aprovada — e nasce credora: R3
    já provou eleição determinística, detector por forma, a ordem menor→maior e
    o Narrador só sabendo no turno da revelação. R4 deve conferir o que sobrou,
    não repetir.

---

## 13/09 20:10 · v9.228 · R2 · toda forma eleita tem detector · commit `b0b561b`
- **estado inicial:** árvore limpa, HEAD `5a7731d`, VERSÃO v9.227. A etapa
  aprovada da vez era a **R2**, e ela nasceu credora: R1 cavou três sinais e
  não gastou nenhum. `alvoDaReviravolta` (`App.jsx:9891`) sabia achar alvo para
  **duas** das sete formas de `reviravoltas.js`; as outras cinco eram eleitas
  pela semente e mudas para sempre.
- **conselheiro:** não chamado (a etapa já estava escrita, e a pauta cheia).
- **a decisão de arquitetura, e o porquê.** A pauta deixou a escolha em aberto:
  o mapa forma→detector desce para módulo puro, ou a prova lê o `App.jsx` como
  texto? **Desceu para módulo puro** — e foi morar **na própria forma**, como
  campo `achaAlvo(mundo)` ao lado do `soNasceSe`. Dois motivos. (1) "Conta se
  prova": decidir quem é o alvo é regra, e regra que mora na tela é regra que
  não se prova — era a lei sendo burlada no lugar exato onde ela importa.
  (2) A catraca fica **estrutural, não vigilante**: provar por texto do
  `App.jsx` pega a forma que ninguém ligou, mas não impede ninguém de escrever
  um detector que nunca acha nada; com o detector dentro da forma, `for (const
  f of FORMAS)` já é a varredura, e não há como acrescentar forma sem passar
  por ela. O `App.jsx` ficou com o que é dele: junta os refs e pergunta.
- **backend:** `reviravoltas.js` ganhou `garantirMundo(m)` (o snapshot que
  nasce do nada e do lixo), `alvoDaForma(forma, mundo)` (a fachada, com o
  `try/catch` dentro) e **`achaAlvo` nas sete formas** — os dois antigos
  portados do App sem mudar de comportamento, os cinco novos escritos sobre o
  que R1 deixou. Desempate explícito e comentado em todo lugar onde a ordem de
  inserção decidiria.
- **frontend:** `App.jsx:9894-9909` — o miolo virou montagem de snapshot +
  `alvoDaForma`. Os dois `find` (a índole do grupo, a classe do item) foram
  apagados, não copiados. `classeDoItem` saiu do import (ficou sem uso no App;
  segue com ≥2 leitores fora dele). Zero na tela, nenhum campo novo de save,
  `mexerNaReviravolta` intocado.
- **testes:** `teste-reviravolta.mjs` de 41 para **131 asserções** (+90), em
  seis seções novas.
- **decisões médias tomadas:**
  - **as três formas MAIORES também ganharam detector**, fora do que a pauta
    escreveu para R2. Motivo: a catraca desta etapa é *"para **cada** forma
    existe detector"*, e uma catraca que nasce com três exceções não é catraca
    — seria afrouxar a asserção para caber no código, que é justamente o que o
    roteiro proíbe. Não é roubo de R3: elas seguem **inertes no jogo**, porque
    `mexerNaReviravolta` só lê `.menor`, e o trabalho de R3 (ligar a maior, com
    a regra de convivência) continua inteiro. Zero mudança no que o jogador
    vive hoje.
  - **`LIMIARES_DA_VIRADA`** (tabela nomeada): o `3` do informante estava
    cravado no `soNasceSe` e ia ser copiado para o detector. Duas metades do
    mesmo portão que podem discordar é bug esperando data. A tabela é a lei
    "se é número, é tabela", e uma asserção varre de 0 a limiar+2 provando que
    as duas metades nunca divergem.
  - **`PAPEIS_DO_MESTRE`** (tabela nomeada), achado do backend: `mesmoPapel`
    **não servia** para `mestre_treinou`. O ofício vem como "a forja" e o papel
    como "ferreiro" — nunca compartilham palavra; e pior, `mesmoPapel` devolve
    `true` quando um lado não tem palavra informativa, o que daria o mestre do
    herói a qualquer figurante de papel vazio. A tabela é a ponte ofício→papel.
- **a correção que a etapa revelou (e a pauta estava errada).** A pauta dizia,
  para `trai_para_proteger`: *"o parente achado é o refém, ou seja o alvo"*.
  **Não é.** O `oDiaSeguinte` da própria forma escreve *"o vilão revela o refém
  que forçava a mão de {alvo}"* e *"o vínculo com {alvo} decide se ele fica ou
  parte"*; e o `App.jsx:9958` põe `registrarGesto(..., gesto: "delatou")`
  contra `rev.alvo`. O alvo é **o companheiro que traiu**; o parente é o refém.
  Seguir a pauta ao pé da letra teria posto o refém como delator na Fúria. A
  asserção que trava esse sentido tem o motivo escrito ao lado.
- **a catraca, e como ela quebra.** Três dentes, e eles mordem dos dois lados:
  toda forma tem `achaAlvo` (*"sem detector: espelho_que_mente"*); toda forma
  tem linha em `MUNDOS_DE_PROVA` provando que o detector **acha alguém de
  verdade** (*"sem mundo de prova: espelho_que_mente"*); e toda linha da tabela
  é de uma forma que existe (*"linha órfã: forma_apagada"*), senão a tabela
  apodrece. Mais o avesso, que pesa igual: nos seis mundos vazios e de lixo as
  **sete** devolvem `null` — detector que acha alvo no nada é pior que detector
  nenhum. Uma forma nova amanhã, sem detector, quebra no dia em que nascer.
- **o que acontece com um save antigo.** Um save que já elegeu
  `trai_para_proteger` vivia com o detector devolvendo `null` — ou seja, **nunca
  guardou reviravolta nenhuma** (`mexerNaReviravolta` só grava depois de achar
  alvo). Agora o detector acha, e a virada **elege hoje**, com `eleitaEm` no dia
  corrente. As leis seguem de pé, e conferi uma a uma: ela **semeia no Livro de
  Promessas antes de qualquer coisa** (o passo 2 do `mexerNaReviravolta` faz
  `return` depois de semear), rega no ritmo de `DIAS_ENTRE_REGAS`, e só revela
  quando `podeRevelar` deixa (as sementes maduras para o peso da colheita).
  **Nada retroage e nada estoura na cara do jogador**; o Narrador continua sem
  ver a verdade eleita antes do turno da revelação, porque nenhum bloco novo
  entra na pauta — o alvo só vive dentro do Livro, com `material: null`.
- **a dívida de R1, paga:** `vezesQueUsouInformante` ganhou o leitor de
  produção que faltava — `reviravoltas.js` agora **chama a função**, e não só
  cita o nome dela como propriedade, que era o que o `teste-ligacao` não sabia
  distinguir.
- **o que ficou:**
  - **um vermelho intermitente em `teste-sala.mjs`**, visto **uma vez**
    (`122 passaram, 1 falharam`) e **não reproduzido em quatro rodadas
    seguintes** do `npm test` inteiro, nem rodando a suíte sozinha (123/0).
    Território que R2 não tocou. Procurei a causa: o runner é **sequencial**
    (`spawnSync` em laço), então não é cross-talk entre suítes; `sala.js` não
    tem `Date.now` nem `setTimeout`; a suspeita que sobra é sorte não semeada
    (`novoCodigo`/`criarSala` caem em `Math.random` quando ninguém injeta
    `rnd`). Não fechei o diagnóstico e **não vou fingir que fechei** — foi para
    a pauta como item aberto, com a evidência.
  - **`trai_para_proteger` não exige vilão** (achado do `testes`): nem no
    `soNasceSe` nem no `achaAlvo` — as duas metades concordam, que é a lei
    desta etapa, então ficou verde. Mas o `oDiaSeguinte` dela escreve *"o vilão
    revela o refém"*, e sem nêmesis de pé não há quem revele nem quem segure o
    refém. É incoerência de texto contra portão, não bug de detector. Foi para
    a pauta.
  - **R3 não foi tocada.** Uma etapa por ciclo.

## 13/09 19:40 · v9.227 · R1 · os três sinais que o mundo não sabia dar · commit `9d2902f`
- **estado inicial:** 180/180 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `c9813f9`. A Fase A fechada; a vez era a **primeira etapa da
  Fase R**, aprovada pela pessoa. Sete formas em `reviravoltas.js`, e três
  delas com `soNasceSe` lendo sinal que **não existe no mundo**:
  `temCompanheiroComFamilia`, `vezesQueUsouInformante >= 3`,
  `antecedenteComOficio`.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **a palavra da pessoa virou desenho.** *"Que o sistema de reviravoltas
  funcione em harmonia com todos os sistemas"* — e é ela que decide **onde**
  cada sinal nasce. Não um módulo `trackers.js` com os três juntos (que seria
  o órgão à parte, e o contrário do pedido): cada um **dentro do sistema que
  já o tocava**. O orquestrador mapeou o terreno antes de delegar; o dono de
  cada sinal foi achado no código, não escolhido por conveniência.
- **backend (os módulos puros):**
  - **o sangue → `npcs.js`**, porque o laço é de npcs. `TIPOS_DE_LACO` ganha
    o sexto tipo `familia`. As seis funções da máquina de laço (`garantirLaco`,
    `firmarLaco`, `romperLaco`, `comLaco`, `firmarEntre`, `paresEntre`) já
    operam por catálogo — nenhuma foi tocada.
  - **o ofício → `antecedentes.js`**, o catálogo que já diz de onde a pessoa
    veio. Campo **opcional** `oficio` em 8 das 12 entradas + `oficioDoAntecedente`.
  - **o informante → `social.js` + `npcs.js`.** O informante já vivia no
    `social.js`: é ele que sabe o tamanho do pedido (a escada `cortesia` /
    `conversa` = informação) e o papel de quem está na frente. Lá ficou o
    **julgamento** (`PAPEIS_DE_INFORMANTE`, `ehInformante`,
    `PEDIDOS_QUE_SAO_CONSULTA`, `consultouInformante`); no registro de pessoas
    ficou o **razão** (`registrarConsulta`, `vezesQueUsouInformante`), que já
    atravessa o save inteiro.
- **frontend (a fiação):** `App.jsx:14410-14428`, dentro do bloco
  `if (des && des.social)`, depois do envelope / do ouro / da alavanca suja,
  embrulhada em `try/catch` com `calou("consultaDeInformante", e)`. **Zero na
  tela** — nenhum `pushMsgs`, nenhum badge, nenhum número. Nenhum campo novo
  de save: `consultas` mora dentro da ficha do NPC, e `npcs` já vai inteiro
  no save (`App.jsx:7335`) e volta inteiro no load (`:10769`).
- **testes:** 172 asserções novas, cada sinal provado na casa do seu sistema —
  `teste-laco.mjs` seção 9 (25) + `teste-lacos.mjs` seção 6 (5) para o sangue,
  `teste-social.mjs` seção 12 (74) para o informante, e a suíte nova
  `teste-antecedentes.mjs` (68) para o ofício, **porque o catálogo de
  antecedentes nunca teve suíte de comportamento** — pendurar a prova em
  `teste-prontos.mjs` seria medir uma coisa na casa de outra.
- **decisões médias tomadas:**
  - **um assunto novo em `assuntos.js`** (`dois_do_mesmo_sangue`, `pede:
    "duas"`, `firmaEntre: "familia"`). Motivo: um tipo de laço que **nenhum
    assunto cria** é exatamente a regra sem código atrás que esta casa passou
    versões caçando — o sinal nasceria morto. É "ampliar acervo numa tabela
    existente, no mesmo formato" (um, no molde exato dos três vizinhos), e
    não "a voz do Narrador em massa", que é pesado.
  - **`PESO_DO_PAPEL` NÃO ganhou linha de informante.** Motivo: aquela tabela
    mede o que a pessoa **tem a perder**; ser informante diz o que ela
    **vende**. Uma linha lá mudaria a DC de toda conversa em campanha viva —
    rebalanceamento, e não desta etapa. A suíte agora **prova** que a tabela
    nova não mexe no preço (`pesoDoPapel` nulo para os 18 papéis, e
    `dificuldadeSocial` idêntica com e sem informante).
  - **`oficioDoAntecedente` lê id OU nome**, e não passa por
    `antecedentePorId`. Motivo: o desenho do orquestrador dizia "o save guarda
    o id" e **estava errado** — `App.jsx:3964` e `prontos.js:183` gravam o
    **nome** ("Herdeiro da Forja"). Um leitor só por id responderia `""` para
    toda ficha que existe. Precedente de `pericias.js:106-115`. E
    `antecedentePorId` cai no primeiro da lista quando não acha, o que daria o
    ofício do Órfão (que não tem) a qualquer id errado.
  - **uma asserção antiga cedeu — do lado certo.** `teste-laco.mjs`, "nenhum
    tipo do catálogo sem criador", montava `criados` só de `a.firma` e
    **ignorava `firmaEntre`**: cega a uma das duas portas de nascimento desde
    a v9.98. Passou a unir as duas, **com o motivo escrito na linha** (lei da
    casa). Cego estava o varredor, não o catálogo — afrouxar a asserção ou
    tirar o sangue da lista apagaria a lei em vez de cumpri-la.
- **compatibilidade (campanha viva não perde nada):** antecedente sem ofício
  continua com bônus, item, PV, PM e gancho idênticos — provado pelo caminho
  real (`montarPronto`), não contra número escrito à mão; ficha de save antigo
  sem `consultas` vale 0 e sobrevive a `mesclarNPC`; um tipo a mais em
  `TIPOS_DE_LACO` **não soma bloco ao prompt** (o objeto `lacos` de
  `App.jsx:15858` é lido só por `compasso.js:178` e `:277`, nunca serializado
  — o teto de prompt está intacto).
- **o que ficou:** **a lista de espera do `teste-ligacao` ficou VAZIA** — não
  foi preciso usá-la. Os sete exports novos são exercitados de verdade pelas
  provas, e a catraca passou sozinha (2487 regras varridas). Fica dito, com
  honestidade, que **o leitor de produção de `vezesQueUsouInformante` é R2**:
  hoje quem o "referencia" fora da prova é `reviravoltas.js:112`, mas como
  nome de propriedade (`c.vezesQueUsouInformante`), não como import — a
  catraca conta por palavra e não distingue. R2 é o credor, e ele é a próxima
  etapa da fase.
- **nada de reviravolta foi ligado.** `reviravoltas.js` e `alvoDaReviravolta`
  não foram tocados — R1 só cria os sinais e deixa o mundo rico. A vez de R2 é
  a próxima: detector para `trai_para_proteger` e `informante_duplo`, lendo o
  que nasceu aqui.
- **prova final:** `npm run build` limpo, **181/181 suítes verdes, 7/7
  varredores limpos**.

---

## 13/09 19:05 · v9.226 · A4 · o equilíbrio conferido, e a catraca que prova estabilidade · commit `817f96f`
- **estado inicial:** 180/180 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `08f9527`. A vez era A4 — a última etapa da Fase A, e desde a
  correção feita depois de A3 ela não era mais "reajustar os prontos": era
  **conferir se ainda há trabalho**. A pergunta, com número e não com opinião:
  a faixa de 35–65% se sustenta **fora da amostra** que a suíte usa?
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **testes (a medição):** replicou o laço de `roundRobin` no scratchpad, sem
  tocar em `src/`, e rodou **49 famílias de sementes independentes** (prefixos
  novos e deslocamentos do índice), 30 sementes por par cada — o mesmo tamanho
  de amostra da suíte —, mais um retrato de 480 sementes/par.
- **A RESPOSTA: a faixa se sustentou. Zero estouros em 49 de 49 famílias.**
  Nenhum pronto passou de 65% nem caiu de 35% em nenhuma delas. Logo **nada
  foi rebalanceado neste ciclo**: nenhum número de pronto, de ficha ou de
  tabela de arena mudou. Equilíbrio é teste, não intenção — e teste verde
  também é resposta.
- **e a medição desmentiu o suspeito.** A borda de `flecha` (61,9% na suíte)
  **não é estrutural**: é o máximo do próprio intervalo dela. Fora da amostra
  `flecha` mede 49,5–57,6, e 55,7% no retrato de 480. Quem está de fato no
  topo é **`sombra` (58,1%)** — e é também o mais estável (7,1 pts de variação
  entre famílias). O piso estrutural é `voto` (44,2%) e `voz` (45,4%);
  `chama`, que na suíte marcava 42,4%, sobe para 46,5% no retrato. Ou seja: o
  retrato que o diário vinha registrando era **enviesado por uma amostra só**.
- **decisões médias tomadas:**
  - **`roundRobin` ganhou o parâmetro `prefixo`** (`src/arena.js`), padrão
    `"rr"`. Motivo: sem ele a catraca só sabe pedir UMA família, e uma família
    é uma amostra. Padrão conferido ao dígito contra o retrato antigo — objeto
    byte a byte igual. Refator de módulo puro sem mudar comportamento.
  - **a catraca do equilíbrio foi ampliada de uma amostra para cinco**, com
    tabela nomeada (`CATRACA_DO_EQUILIBRIO`: piso, teto, famílias, tamanhos,
    teto de amplitude). Motivo, medido: com 30 sementes/par o desvio-padrão de
    cada pronto é **σ ≈ 3,4 pts**, e nas 49 famílias os extremos chegaram a
    63,8% (`flecha`, 1,2 pt do teto) e 37,1% (`voz`/`voto`, 2,1 pts do piso).
    A catraca antiga provava **sorte**, não estabilidade. **O limiar 35–65 não
    afrouxou** — é o mesmo piso e o mesmo teto, agora valendo em cinco
    amostras em vez de uma.
  - **nasceu um segundo dente: o teto de amplitude do retrato (20 pts).**
    Motivo: a faixa sozinha não pega o pronto que vira dominante **sem**
    estourar 65% — ele sobe, os outros descem, e cada um continua dentro
    enquanto a distância topo–fundo abre. A folga está declarada no arquivo:
    o retrato mede 15,7 pts hoje; a amplitude estrutural é ~13,9; oito
    famílias de 120 sementes/par deram 13,0 ± 2,3. Teto colado em 16 ficaria
    vermelho na primeira brisa (qualquer mexida na arena reembaralha o RNG e
    re-sorteia a amplitude); 20 é ~3σ acima da média e ainda morde — topo em
    64% (verde na faixa!) contra fundo em 42% dá 22 pts e fica vermelho.
- **a catraca morde (conferido, não prometido):** o `testes` rodou a seção
  contra cópias mutantes de `arena.js` no scratchpad. Com `sombra` ganhando
  **+3 de vida**, a catraca ANTIGA ficaria **verde** (mede 59,5% na família
  "rr"); a nova fica vermelha **três vezes** — 67,6% em "aa", 66,2% em "bb" e
  amplitude 22,1 no retrato. Com +14 de vida e +4/+3 de atributo, `sombra` vai
  a 94–97% e as quatro famílias mordem juntas. O limite honesto também está
  escrito: +2 de vida (62,1%, amplitude 18,8) ainda passa.
- **o preço, medido:** a seção 6 foi de ~0,5 s para 3,59 s; o `npm test`
  inteiro, de 56,7 s para 59,6 s (**+2,9 s**). Pago de bom grado: é a única
  catraca que guarda o equilíbrio do roster.
- **A FASE A, FECHADA — o antes e o depois inteiro:**
  - meias-rodadas mortas: **382 de 420 quedas (8,3% do total) → 0**;
  - quedas que ABREM com duas meias-rodadas mortas: **20 de 420 (4,8%) → 0 de
    424 (0,0%)**;
  - dano depois da guarda: **1,034× o normal → 0,699×** (contra teto 0,9);
  - amplitude do equilíbrio: **24,8 pts → 20,0 pts** na família "rr"
    (15,7 pts no retrato de baixa variância, que é a medida honesta);
  - e o que nasceu no caminho: `src/efeitos.js` (A2, 6 tabelas e 11 funções),
    a arena consumindo os módulos que já existiam (A3), `teste-efeitos.mjs`
    (168 asserções), a seção 7 de `teste-arena.mjs` (o veredito) e a catraca
    de cinco amostras (A4). Quatro etapas, quatro versões, zero regressão.
- **o que ficou:** nada novo foi para a pauta neste ciclo — A4 não abriu
  frente, fechou. Os **dois itens pesados** da Fase A continuam esperando a
  pessoa, e não são deste ciclo: a **concentração inerte** (regra 5e escrita e
  que nunca acontece) e a **família defensiva que nenhum não-jogador cumpre**
  (nenhum dos 9 nomes de `GUARDAS` casa com `RX_BUFF`). A próxima fase
  aprovada é a **R — as reviravoltas**, começando por R1.

## 13/09 18:40 · v9.225 · A3 · a arena consome os efeitos · commit `6168a14`
- **estado inicial:** 180/180 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `3fc1a5a`. A vez era A3 — o **veredito** da Fase A: a etapa em
  que as duas provas pendentes de A1 tinham de virar asserção de verdade.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **backend:** `src/arena.js`, e só ele. A guarda primeiro (`guardaDe` +
  `erguerGuarda`, de `habilidades.js`), o buff depois (`efeitoDeBuff` +
  `empilhar`, de `efeitos.js`), o bônus no golpe por `bonusDeDano` /
  `bonusDeArma` (`combos.js`) e o prazo correndo uma vez por rodada
  (`tickEfeitos` + `expirarGuardas`). **Nenhuma fórmula nova** — a lei-mãe da
  arena é "nenhuma regra nova", e cada peça foi chamada de onde já morava. Só
  então o filtro furado de `meiaRodada` caiu inteiro, e os imports
  `ehCuraDeGrupo`/`ehOfensiva` saíram com ele.
- **frontend:** não chamado — `arena.js` é módulo puro e a tela não mudou.
- **testes:** `testes/teste-arena.mjs` — 22 ok · 1 falha → **28 ok · 0
  falhas**. As duas pendentes de A1 promovidas, a asserção do filtro
  reancorada, a medição renomeada (`m.meias` → `m.linhas`) e o retrato de
  v9.222 preservado ao lado do de v9.225.
- **os dois números de A1, fechados:**
  - quedas que ABREM com duas meias-rodadas mortas: **20 de 420 (4,8%) → 0 de
    424 (0,0%)**, contra `tetoDeAberturasMortas: 0`;
  - dano depois da guarda: **1,034× → 0,699×**, contra
    `razaoMaximaDeDanoAposGuarda: 0.9` — mas por sonda nova, ver abaixo;
  - e a medição da mesa real: 791 buffs firmados, 329 golpes com o bônus
    dentro, 409 efeitos vencendo o prazo. Meias-rodadas mortas: 382 → **0**.
- **decisões médias tomadas:**
  - **a pendente (2) foi reancorada, não promovida como estava — e o motivo
    está escrito no arquivo.** A sonda de A1 media o dano do golpe seguinte a
    uma linha `/ se guarda$/`, e essa linha **morreu junto com a coisa que ela
    media**: era a prosa vazia que A3 matou. Promovê-la literalmente daria 0
    golpe medido, razão 0,000 e verde automático — dívida visível trocada por
    prova vazia, que é pior. O limiar **não** afrouxou (continua `0.9`, e
    continua saindo de `MEDIDA_DO_BURACO`); o que mudou foi a âncora: dupla
    sintética determinística, uma habilidade que casa com `GUARDAS` **e** com
    `RX_BUFF`, medindo dano por golpe **tentado** (o erro conta zero, porque a
    guarda de defesa mexe na chance de acertar e não no tamanho do dano — era
    a outra metade do porquê de A1 dar 1,034). Razão 0,699. E o buff ganhou
    sonda própria, com piso novo `ganhoMinimoDoBuffNoGolpe: 1` — ganho 1,95.
  - **a asserção do filtro (seção 5) saiu de regex-no-fonte para prova de
    comportamento**, com o motivo escrito: regex em fonte morre com o próximo
    refatorador. A nova exige que a arena **firme** um buff que o filtro morto
    barrava (Bênção e Inspiração aparecem na amostra).
  - **`projecaoDe` passou a levar `guardas` junto** (decisão do backend, além
    da letra do brief): duas das três famílias de guarda não somam defesa — a
    de esquiva entorta o dado e a de intocável faz o golpe errar, e quem as lê
    é `resolverAtaque`, no alvo. Sem isso, erguer uma delas não faria nada.
    Conferido que não duplica número: `defesaDe(ent, true)` devolve
    `ent.defesa` explícita e não re-soma.
  - **o bônus entra DEPOIS do crítico**, e está escrito no código: somar antes
    exigiria duplicar `resolverAtaque` dentro da arena, que é a regra copiada
    que a lei-mãe proíbe. O buff sai um pouco mais barato aqui que na mesa da
    campanha — declarado, não escondido.
- **a prova morde (conferido, não prometido):** o `testes` rodou a suíte
  contra três arenas mutantes no scratchpad — voltar o buff a prosa dá 6
  falhas; erguer a guarda sem a projeção enxergá-la dá razão 1,071; empilhar o
  efeito sem somar ao dano dá ganho 0,04. Nenhuma asserção nova passa de
  qualquer jeito.
- **a catraca do equilíbrio NÃO saiu da faixa** — e a pauta previa que sairia.
  muralha 42,9→50,5 · sombra 47,1→54,3 · chama 36,2→42,4 · remendo 61,0→48,1 ·
  voz 60,5→51,0 · flecha 55,7→61,9 · punho 38,1→50,0 · voto 58,6→41,9. A
  amplitude APERTOU: 24,8 pts → 20,0 pts. Nada foi reajustado neste ciclo (era
  A4 de propósito), e nenhuma suíte precisou virar `pendente`. **A4 foi
  corrigido na pauta**: deixou de ser "reajustar os prontos" e virou "conferir
  se ainda há trabalho", com `flecha` (61,9%) como quem está na borda.
- **o que ficou:** três achados foram para a pauta. Um **pesado, para a
  pessoa**: a família defensiva é promessa que nenhum não-jogador cumpre —
  nenhum dos 9 nomes de `GUARDAS` casa com `RX_BUFF`, então companheiro e
  duelista nunca erguem guarda, e `BUFF_DA_HABILIDADE.aplica` é `"dano"` para
  tudo, o que faz "Escudo Arcano" virar `+1 de dano mágico` na narração. Um
  **médio**: o companheiro re-firma o buff que já está de pé (o comentário de
  `companheiros.js:139` já diz "uma vez, não todo turno" — é fazer o código
  cumprir o comentário). E o item leve **"Em o fosso"**, que já estava aberto,
  foi visto em toda queda olhada — continua esperando a vez.
- **nota de higiene:** `CLAUDE.md` ainda diz "hoje `v9.221`" no padrão de
  fase, quatro versões atrás. Não toquei — mexer na lei da casa sem pedido não
  é do ciclo.

## 13/09 18:05 · v9.224 · A2 · os efeitos viram módulo puro · commit `a137790`
- **estado inicial:** 179/179 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `8fd6cbd`. A vez era a etapa A2 da Fase A — a segunda do bloco
  aprovado, e a mais delicada, porque mexe no que a campanha já usa.
- **conselheiro:** não chamado (pauta cheia, e a etapa já estava escrita).
- **backend:** nasceu `src/efeitos.js` — puro, sem React, só depende de
  `combos.js`. Seis tabelas nomeadas no lugar de constantes soltas
  (`LIMITES_DO_EFEITO`, `BUFF_DA_HABILIDADE`, `EFEITO_DO_MILAGRE`,
  `EFEITO_DA_MAGIA`, `APLICA_UNIVERSAL`, `APLICA_NA_NOTA`) e onze funções —
  o nascimento (`efeitoDeBuff`, `efeitoDeMilagre`, `efeitoDeMagia`), a pilha
  (`empilhar`, `retirar`), a leitura (`efeitosDe`, `buffsNaRolagem`,
  `notaDosBuffs`) e a concentração (`efeitoEmConcentracao`,
  `quebrarConcentracao`). `regras-jogo.js`, `pocoes.js` e `relicas.js`
  passaram a ler a mesma pilha.
- **frontend:** as seis trocas do mapa no `App.jsx`, por script `.cjs` com
  âncora única — 26 linhas viraram 18, sem variável órfã e sem import morto.
  A nota "(inclui bônus de ...)" sai byte a byte igual.
- **testes:** `testes/teste-efeitos.mjs`, 168 asserções em 11 seções —
  duração, decaimento (ponte com `tickEfeitos`), pilha, os dois casamentos,
  imutabilidade, 25 casos de lixo, a conta do buff, a nota da rolagem, a
  concentração, e a seção "ligado ao jogo". `npm test` 180/180 + 7/7.
- **a catraca de regressão (o que esta etapa prometeu):** as dez suítes de
  combate verdes sem uma asserção afrouxada, e **os dois números de A1
  idênticos** — 20 de 420 aberturas mortas (4,8%) e dano depois da guarda
  1,034×. As duas `pendente(...)` continuam pendentes: A2 não as promove,
  elas são o veredito de A3. **Regressão zero em Uma Vida confirmada.**
- **decisões médias tomadas:**
  - **O que já era módulo ficou onde estava.** A GUARDA inteira já vive em
    `habilidades.js` desde a v9.53 (`erguerGuarda`, `expirarGuardas`,
    `defesaDeGuarda`) e `combate.js` já a lê — no `App.jsx` não sobrou guarda
    solta, só chamadas. O relógio (`tickEfeitos`) e o modificador
    (`bonusEfeito`, `atributoEfetivo`) ficaram em `regras-jogo.js`: movê-los
    seria refazer `aplicarMudancas` inteira, risco grande e ganho zero para
    A3. O alvo de A2 era o que estava **solto no App**, e é isso que desceu.
  - **Três módulos vizinhos foram tocados de propósito.** `regras-jogo.js`,
    `pocoes.js` e `relicas.js` repetiam a mesma pilha à mão. Fazê-los ler
    `empilhar` é o que impede `efeitos.js` de nascer módulo mudo — a lei do
    export morto vale no dia em que a regra nasce.
  - **A pilha tinha duas regras convivendo sem ninguém saber**, e agora têm
    nome: o canal do Mestre casa o nome **sem caixa** (`casamento: "solto"`),
    o App, as poções e as relíquias casam **exato**. Portado como era — só
    deixou de ser duas linhas parecidas em arquivos distantes.
  - **Nada entrou em `calou(...)`, e é decisão, não esquecimento.** Os seis
    sítios já estavam fora de `try/catch` antes, e a superfície de exceção
    só diminuiu (o módulo trata `null` onde o código antigo estourava).
    Embrulhar agora exigiria decidir o que vale `p`, `extraEscopo` e `pers`
    quando falha — isso é desenho, não refatoração, e a promessa da etapa era
    regressão zero. Fica anotado na pauta como item próprio.
- **o que ficou:** cinco achados, todos **portados como estão** (a etapa era
  refatoração; consertar é A3 ou item novo) e todos já na pauta como abertos.
  Nenhuma etapa foi promovida a pesado, nada voltou vermelho, nenhuma
  devolução foi necessária.

## 13/09 17:45 · v9.223 · A1 · a prova que mede o buraco · commit `a44da9c`
- **estado inicial:** 179/179 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `e35dfca`. Pauta com 4 etapas aprovadas (Fase A) + 4 (Fase R) +
  9 abertos. A vez era da Fase A, etapa A1 — a primeira do bloco aprovado.
- **conselheiro:** não chamado (pauta cheia: 8 etapas aprovadas e 9 abertos;
  pensar de novo com pauta cheia é ruído).
- **backend / frontend:** não chamados. A1 só mede — nada em `src/` mudou fora
  do bump de `VERSAO`.
- **testes:** seção 7 nova em `testes/teste-arena.mjs` (+128 linhas), com o
  helper `pendente(nome, motivo)` que imprime "· pendente (A3)" e não toca
  `bons`/`maus`; a tabela `MEDIDA_DO_BURACO` (sementes, molde de semente, e os
  dois limiares que A3 tem de cumprir); a medição do round-robin dos oito; e as
  duas provas pendentes, cada uma com o `t(...)` exato que a promove escrito no
  comentário. 23 ok · 0 falhas; `npm test` 179/179 + 7/7.
- **o número medido (o "antes" da fase, v9.222/223):** 420 quedas · 4584
  meias-rodadas · **382 mortas ("se guarda") = 8,3% do total, 0,91 por queda** ·
  **20 quedas (4,8%) abrem com duas meias-rodadas mortas** · dano sofrido logo
  depois da guarda **1,034×** o normal (guardar não desconta nada) · 6 buffs no
  repertório dos oito, 2 furam o filtro do piloto. Custo: 143ms.
- **decisões médias tomadas:**
  - **Confirmei o diagnóstico no código antes de escrever a prova, e ele tem
    uma nuance que a pauta não dizia.** `meiaRodada` (`arena.js:137-139`)
    *tenta* tirar o buff da visão do piloto com `ehCuraDeGrupo || ehOfensiva`,
    mas o filtro é **furado**: `ehOfensiva` (`companheiros.js:~95`) casa
    `RX_OFENSIVA` contra nome **+ descrição**, e "Postura Defensiva" e "Escudo
    Arcano" dizem "absorve o próximo dano" — a palavra *dano* as faz passar.
    Aí `decidirAcaoCompanheiro` testa `ehBuff` no passo 3, antes da ofensiva,
    com 70% de chance nas rodadas 1–2. A causa-raiz da pauta (os efeitos não
    são portados) continua certa; o que muda é que **A3 tem duas frentes**, não
    uma: portar o efeito *e* consertar o filtro (ou deixá-lo cair, como o
    comentário de `arena.js:136` já prevê). Acrescentei essa frente à descrição
    de A3 na pauta.
  - **A prova (2) mede um número observável, não o campo interno.** Não há como
    espiar `efeitos` de fora (`simularQueda` cria o duelista por dentro, e o
    `JSON.parse(JSON.stringify(...))` de `prepararDuelista` mata qualquer
    proxy), e comparar um `prepararDuelista` avulso seria tautologia. A prova
    compara o **dano sofrido logo depois da guarda** com o dano no resto das
    meias-rodadas: hoje a razão é 1,034; quando a guarda valer, ela cai. É a
    formulação que A3 promove com a menor reescrita — uma linha.
  - **Nenhuma asserção contável nova nesta seção, de propósito.** Todo número
    aqui (quedas, mortas, aberturas, razão) muda quando A3 consertar a arena;
    travar um deles agora seria plantar asserção que A3 teria de apagar. Os
    dois limiares de A3 (`tetoDeAberturasMortas: 0`,
    `razaoMaximaDeDanoAposGuarda: 0.9`) já estão na tabela, esperando.
  - **O molde de semente ficou travado na tabela** (`m|a|b|s`, 6 sementes por
    par): outros moldes dão 413–431 quedas, e o número do "antes" tem de ser o
    mesmo em qualquer máquina (lei v).
- **o que ficou:** as duas pendentes são dívida visível até A3 — `rodar-tudo`
  decide só pelo código de saída, então as linhas `··` não podem deixar a
  árvore vermelha por acidente. A2 (os efeitos viram módulo puro) é o próximo
  ciclo. Nada novo foi para "pesado"; nada novo para a pessoa decidir.

## 13/09 16:30 · v9.222 · o clima sazonal desce ao módulo · commit (ver `git log -1`)
- **estado inicial:** 178/178 suítes verdes, 7/7 varredores limpos, árvore
  limpa, HEAD `aae362c`. Pauta com um só item em "Aberto" — e era pesado
  (`git push`), fora de lugar.
- **conselheiro:** semeou 10 itens abertos (5 médios, 5 leves) e 4 pesados em
  "Para a pessoa decidir". Jogou o Duelo seco de ponta a ponta e abriu a Noite
  até o primeiro turno; o Narrador caiu por falta de saldo nos provedores, então
  Uma Vida e o Capítulo narrado não foram jogados.
- **backend:** `src/encontros.js` ganhou `pesosDoClima(estacaoId)` (o peso
  efetivo por estação, puro) e `rolarClima(atualId, { estacao, sorte })` com a
  conta que antes vivia no App; `POOL_CLIMA` morreu sem leitor; bump v9.222.
- **frontend:** `rolarClimaEstacao` no `App.jsx` virou uma linha que só passa a
  estação do dia; imports mortos `CLIMAS` e `BIAS_CLIMA` retirados; build limpo;
  preview abriu em aba nova sem `LimiteErro`.
- **testes:** `testes/teste-encontros.mjs` novo (32 asserções: tabela,
  `pesosDoClima`, determinismo/re-rolagem de `rolarClima`, "ligado ao jogo").
  `teste-ligacao` 21/21 sem perdão novo. Final: 179/179 suítes, 7/7 varredores.
- **decisões médias tomadas:**
  - Escolhi este item por ser o de maior valor da pauta (regra na tela → módulo
    provado) e peso médio pela linha "refatorar módulo puro sem mudar
    comportamento": a distribuição do clima que o jogador vê é idêntica.
  - Fidelidade ao App na re-rolagem: se o sorteio cai no clima atual, re-rola
    UMA vez do mesmo bolso (pode repetir com chance p²). O backend apontou que
    "nunca repete" seria mudança de distribuição; mantive o comportamento
    antigo — mudar isso é decisão de jogo, não de refatoração.
  - A guarda da re-rolagem passou de `pool.length > 1` (App) para "mais de um
    clima distinto" (módulo). Com a tabela real (12 climas, mult 0 só no calor
    do inverno) as duas guardas dão o mesmo resultado; a nova é a correta para
    um bolso degenerado de um clima só.
- **o que ficou:** a suíte nova foi escrita duas vezes (o primeiro `testes`
  demorou e o segundo entrou em paralelo com o frontend; a versão em disco é a
  segunda, 32 asserções, verde). Dormentes sem tracker seguem na pauta. Para a
  pessoa decidir: 4 itens (`git push`, saldo do Narrador, efeitos na arena,
  reviravoltas).

## 13/09 · v9.221 · a mente nasce · commit "A mente ganha cabeca e peso"
- **estado inicial:** 178 suítes verdes, 7/7 varredores limpos, pauta vazia.
- **o que se fez:** CLAUDE.md ganhou a seção "A mente" (a tabela de pesos);
  nasceram `mente/pauta.md`, `mente/diario.md` e o agente `conselheiro`; o
  orquestrador passou a decidir por peso em vez de perguntar em toda
  bifurcação.
- **o que ficou:** o primeiro ciclo real ainda não rodou — a pessoa liga.

## 30/09 19:32 · v9.342 · MM15 (2) · a boca que se pagava e nunca falava · commit `0a0f71e`

- **por que andou:** o segundo da MM15 — a segunda sessão gastou 3,6 chamadas pagas por resposta (a primeira ~2,0), quatro
  delas falas de personagem que não chegaram a lado nenhum. É dinheiro de cada jogador a cada turno, e o teto de 500 por
  endereço conta todas. **Sem chamadas pagas hoje:** provado em Node.
- **estado inicial:** verde (`fab6d06`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend — a causa, que não era a suposta:** as falas não se perdiam numa corrida nem no corte da pauta; **nenhuma chegou
  nunca ao Narrador desde que nasceram, na v9.135 (27/08).** `colherAsFalas` lia a resposta da boca com `extrairJSON`, que é
  o parser do Narrador e só devolve os campos dele — o campo `fala` morria ali, o envelope A FALA saía vazio. Provado em
  Node nas três formas (limpo, entre crases, truncado), e pelo commit que criou a fala.
- **o orçamento de um turno:** a boca 0–2 (antes do Narrador, que esperava ~1,5 s por ela) · o Narrador 1 · a rede de
  segurança 0–1 · o portão 0–1 · o Cronista 1. Antes 2–6 chamadas por turno; agora 2–4; um turno típico com gente, 4 → 2.
- **decisão (média, com o motivo):** `BOCAS_POR_TURNO = 0` numa tabela, e a leitura consertada (`falaDaResposta`). Porquê
  zero e não "consertar e manter as duas bocas": ligá-las seria dar ao jogador uma coisa que ele nunca teve, pagando duas
  chamadas a mais por turno — mudar o que ele vive, e mais caro. Com zero, **o jogador não perde nada que tenha tido** (as
  duas sessões de prova, "as melhores dez respostas" incluídas, foram jogadas sem nenhuma fala a chegar), e o Narrador
  começa ~1,5 s mais cedo. "Só a quem está na cena" não resolvia: as bocas já saíam do "aqui" (o Túlio estava no "aqui"
  por outro defeito, o nº 4/5). Na tabela, "desligar o que existe" é pesado; pesei-o pela régua da ordem de 23/09 — um commit
  revertido conserta isto, e voltar é trocar um número, agora com a leitura a funcionar — e porque o coordenador pediu o
  corte deste gasto. Fica dito aqui para a pessoa auditar.
- **em número:** sessão 2, **3,6 → 3,2 chamadas por resposta** (3,0 se as duas leves do T11 que voltaram 429 eram bocas, como
  o código indica; não provado, o registo das chamadas não ficou). Com o teto de 500: **138 → 156 respostas por dia** por
  jogador. Sessão 1: ~2,0 antes e depois (não teve bocas). **Fica por explicar:** 11 das 21 chamadas leves da sessão 2 não são
  do Cronista — ~1,1 por resposta; é o próximo corte, e precisa do registo das chamadas na terceira sessão.
- **frontend:** o import, `bocasDoTurno(mov, { conteudo })` com saída imediata sem rede, `falaDaResposta(bruto)`; `garantirFala`
  e `MAX_BOCAS` saem do App e ficam com leitores nas suítes; +2 linhas re-medidas.
- **para quem joga:** o Mestre responde mais depressa em cada turno com gente, e cada jogador tem ~18 respostas a mais por
  dia no mesmo teto.

## 30/09 18:51 · v9.341 · MM15 (1) · o "cidade" do Cronista não tira a heroína da taverna, e "saio de X" vai a Y · commit `fab6d06`

- **por que andou:** a ordem do coordenador — a MM15 pela sua ordem, e o lugar à frente, porque é o que parte a sessão.
  **Sem chamadas pagas hoje** (o teto do nosso endereço esgotou-se): provado pela suíte e pelo que o jogo faria.
- **estado inicial:** verde (`865c9ff`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend — as causas:** (a) o prompt do Cronista manda-o dizer "a palavra exata cidade" quando a heroína está dentro da
  cidade — regra de quando o único lugar com nome era fora dos muros; numa taverna ele cumpre, e `registrarLugar` lia-o como
  "voltei" e, sem pedido, recusava ("[LUGAR — RECUSADO]"). (b) A saída falsa do T10: "pego na chave mas **não saio** do
  balcão" contava como pedido de volta — a negação não apanhava "não saio". (c) O T11: em "saio do Último Gomo e vou ao
  Fundo do Poço" os dois nomes pesavam o mesmo e o empate ia para o primeiro da lista — a régua não sabia que "saio de X"
  diz de onde se sai.
- **o conserto:** `lerLugarDito` (`src/lugar.js`) decide por quem diz: o "cidade" do Cronista com a heroína num prédio é
  "nada de novo" (não move nem acusa); fora dos muros e vindo do Mestre continua recusa, como a v9.48 e a v9.335 queriam;
  "não saio" trava a ida; o que vem depois de "saio de / deixo / vindo de" é a origem e sai da disputa. O prompt do
  Cronista não mudou (o teto de prompt fica igual).
- **em número (24 mundos, o módulo de HEAD contra o novo):** "cidade" do Cronista dentro de um prédio, recusas falsas
  **3720 de 4092 → 0**, saídas falsas **372 → 0**; fora dos muros as recusas ficam **144 de 144**; "saio de X e vou a Y" e
  irmãs que não levavam a Y **1440 de 2304 → 0**. A sessão J2–J11 reproduzida: 4 recusas + 1 saída falsa → 0 + 0, e acaba
  no Fundo do Poço.
- **frontend:** `registrarLugar(nome, fonte)` delega a `lerLugarDito` em try/`calou` (estourar é não mover), com os textos
  de cada ramo iguais; o Cronista passa `"cronista"`. `pediuParaVoltar` saiu do import do App (continua com leitores no
  módulo e nas suítes). +5 linhas; as medidas das ações do jogador re-medidas por conteúdo.
- **para quem joga:** ao balcão, a heroína fica ao balcão — e quando diz "saio daqui e vou ali", vai ali.

## 30/09 17:58 · v9.340 · MM11 (2) · a segunda sessão de prova — parcial, cortada pelo teto diário · commit `c6646b6`

- **por que andou:** a ordem do coordenador — fechados os três restos da MM14 (v9.338, v9.339, v9.340), jogar a
  segunda sessão, 25 a 30 respostas, pelo mesmo método, e responder de novo "o Mestre toca uma sessão à la Matt?".
- **estado inicial:** verde (MM14 (8) no ar, `187b6f8`).
- **jogo:** campanha nova (Brites Ferrolho, anã, Guerreira, Médica de Campo), 13 perguntas. **Só 10 respostas:** no T11 a
  API respondeu 429 — o teto diário de 500 chamadas **por endereço** (`api/_portao.js`), que as sessões e provas de hoje
  esgotaram. Não é o jogo, e mexer no teto é da pessoa (custa dinheiro); por isso a sessão fica **parcial** e está marcada
  assim no arquivo. Os jogadores reais não foram barrados: o teto conta por endereço.
- **em número, contra a primeira:** perguntas do sistema 5/12 → **7/12**; inventadas/perdidas 4/1 → **2/0**; a sessão partiu
  no T5 → **T11** (o teto; e o lugar ia parti-la no mesmo turno); missões fechadas sem se jogarem, tramas forçadas e "você
  mudou" → **0** em 10. Pior: **3,6 chamadas pagas por resposta** (eram ~2,0), com quatro falas de personagem deitadas fora.
- **os consertos:** aguentaram v9.333 (missões), v9.336 (perguntar de graça, fora da luta), v9.339 (tramas), v9.340 (a
  ficha antes do d100) e o "você mudou" de v9.338; **não aguentaram** o lugar (v9.335 — agora pela porta do Cronista, que
  devolve "cidade" dentro de um prédio) e os nomes (v9.338 fundiu "Túlio da Runa" com o músico). A luta não se jogou.
- **veredito do jogo:** *ainda não se sabe* — a primeira vez que não é "ainda não"; as melhores dez respostas desta mesa,
  mas metade da prova (a luta) nunca se jogou.
- **decisão (média):** não consertei nada neste ciclo — o coordenador pediu relato ao fim da sessão, e o que ela partiu
  vai à pauta como **MM15**, pela ordem, com o lugar à frente. A proposta "A sala à vista" foi para "Para a pessoa decidir".
- **para quem joga:** nada mudou nesta etapa; é a medida do que as três anteriores mudaram.

## 30/09 17:36 · v9.340 · MM14 (8) · o que a ficha sabe não se rola · commit `187b6f8`

- **por que andou:** o terceiro e último dos restos da MM14 — uma pergunta fechada que a ficha sabe responder
  ("há quanto tempo a senhora tem esta taverna?") ainda ia ao oráculo, e um d100 decidia o que o mundo já tinha
  escrito.
- **estado inicial:** verde (MM14 (7) no ar, `5aa4ed4`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend:** o sinal `ehPerguntaAoMundo` passa a perguntar primeiro às fichas (`A_FICHA_DECIDE`): se a cidade, a
  gente ou o mercado respondem, a pergunta não é ao mundo. E a pessoa da casa onde a heroína está é achada pelo
  tratamento ("a senhora", "o senhor") ou pelo ofício ("taverneira"), entre a gente da base e do registo que
  trabalha ali — nunca na cidade inteira; quem responde pela casa é o primeiro ofício do lugar. Chamar um nome que
  ninguém conhece não se adivinha. Medido na sonda: das 157 perguntas, as que iam ao oráculo tendo resposta na
  ficha **15 → 3**; a sonda fica em 92.
- **frontend:** o cálculo das três fichas saiu de `pautaDoTurno` para `fichasDaMesa` (o mesmo código, com a frase e
  os presentes por parâmetro), que a pauta e o sinal agora partilham; a pauta sai igual. As provas de fiação por
  texto (MM8a §10, MM12 §7, MM14-perguntas §4/§7, a sonda MM1, MM8e) acompanharam, com o motivo; as linhas
  deslocaram +18 e as medidas das ações do jogador foram re-medidas por conteúdo.
- **a prova jogada:** numa taverna, "Helena, há quanto tempo a senhora tem esta taverna?" levou ao Narrador o posto
  da taverneira ("está no posto há 1 ano: deve o lugar a alguém e ainda paga") e nenhum d100; "vai chover
  amanhã?" continuou a ir ao oráculo (33, sim).
- **para quem joga:** o que o mundo já sabe responde-se pelo mundo; o dado fica para o que ninguém decidiu.

## 30/09 16:31 · v9.339 · MM14 (7) · uma história de cada vez, quem pede nunca é o herói, e só a palavra dada é promessa · commit `5aa4ed4`

- **por que andou:** o segundo dos restos da MM14 — quatro histórias forçadas em 43 respostas, uma delas antes
  do primeiro passo da principal, com o próprio herói a contratar, e "alguém vem cobrar o que você disse" sem
  promessa nenhuma.
- **estado inicial:** verde (MM14 (6) no ar, `92875d0`).
- **bastão:** tomado por mim para a fiação (deslocamento zero); devolvido com este commit.
- **as tramas em série:** a trama forçada passava pela mesma porta do mural, que se abre ao fim de 6 turnos —
  certo para um cartaz opcional, errado para uma história que não se recusa; e "uma de cada vez" fazia nascer a
  seguinte no turno logo a seguir a uma fechar. Agora (`tramaTemEspaco`) só nasce com a anterior fechada, **o
  primeiro passo da principal feito**, pelo menos um dia desde a última história forçada, e a principal parada
  há 3 turnos (depois do sino, não espera). Medido: a sessão MM11 tinha 3 tramas forçadas → 0; uma campanha
  de 10 dias, 13 (até 2 num dia) → 9 (no máximo 1 por dia, nenhuma logo a seguir a um passo da principal).
- **"Varek paga para trazer de volta":** quem pedia era o mais antigo do registo de pessoas — e o registo não
  recusa o nome do próprio herói, que na primeira pessoa aparece logo no turno 1. Agora quem pede nunca é o
  herói nem um morto. **As contrações** ("de o casarão", "Chegar a o") passam por uma função só, a que a
  abertura já tinha, movida para o módulo comum (em 200 tramas, 161 costuras → 0). **"Vivo" para Anya:** o texto
  concorda com o sexo de quem sumiu ("viva, se der").
- **"alguém vem cobrar o que você disse":** não vinha do Livro de Promessas — "a promessa em aberto" era **o
  título da primeira missão ativa**, e no turno da cobrança era uma trama forçada que ninguém prometera.
  Agora (`src/palavra-dada.js`) **promessa é uma frase da heroína, dita a alguém, com compromisso** ("prometo",
  "juro", "tens a minha palavra"), pela peneira; as 28 frases da sessão dão 0 promessas, 7 em 7 promessas de
  verdade são lidas.
- **orquestrador:** a linha "Esta é do Mestre: não se recusa" saiu — era o sistema a falar de si.
- **o que fica:** o registo de pessoas não recusa o nome do próprio herói (a trama já está protegida) — na pauta.
- **para quem joga:** uma história de cada vez, e só depois de a principal ter andado; ninguém lhe pede para
  resgatar alguém em nome dela; e só cobra uma promessa quem ouviu uma.

## 30/09 16:03 · v9.338 · MM14 (6) · ninguém segue a heroína à masmorra, e ninguém "mudou" sem a ter visto · commit `92875d0`

- **por que andou:** o primeiro dos restos da MM14, retomado depois do limite de uso — agora uma mão de cada
  vez, em primeiro plano.
- **estado inicial:** verde (`8c40c74`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **9a · a gente da cidade dentro da masmorra:** "quem está aqui" decidia-se só pela cidade — quem vive em Foz do
  Meio estava "aqui" em qualquer sítio de Foz, **incluindo dentro de uma masmorra aberta na cidade**, e quem não
  tinha paradeiro estava "aqui" em todo o lado. Agora, com masmorra aberta, o "aqui" é o grupo e quem está na
  masmorra; o resto fica "lá fora". Na prova com os dados da sessão: Teodoro, Isolina e Branca, que desciam com
  a heroína, → ninguém.
- **9b · "você mudou desde a última vez" no primeiro encontro:** era um movimento do Intérprete que valia
  **sempre** (`quando: () => true`) — 84 em 600 primeiros encontros. Agora exige que a pessoa a tenha visto antes
  (conhecida antes de hoje e com dias vistos): 0 em 600.
- **10a · nomes que colidem:** as três portas do registo só comparavam o nome inteiro. Agora um nome novo que
  partilha o primeiro nome com alguém que importa (a pista, a espinha, o elenco com a cidade dele, o grupo, quem
  a missão procura) é a mesma pessoa — e mescla na ficha dela, sem apagar o laço — ou é recusado pelo motivo
  (outro sexo, outro lugar) e dito ao Narrador nesse turno. A "Delfina da Névoa" da sessão é recusada: a
  Delfina está noutro lugar.
- **10b · "Floripes do Sino":** não veio do Narrador — é gente do gerador, com o sobrenome de lugar que o léxico
  dá; o que falhava era **a procura**, que casava qualquer pedaço de 4 letras, e "sino" apanhou "o Sino Calado"
  (e numa das vezes ganhou à própria taverneira). Um pedaço depois de partícula ("do", "das") já não procura
  ninguém.
- **frontend:** as três ligações de 9a, o `viuAntes` de 9b (sem ele a frase calava-se para todos), as três portas e
  o mural de 10a; **uma correção à especificação**: na porta do cânone, uma pessoa já registada mescla em vez de
  ser recriada — recriá-la apagava o laço a cada turno.
- **a prova jogada:** a pessoa foi registada; a ruína próxima dessa campanha não era uma masmorra estruturada, por
  isso o "ninguém desce" está provado pela suíte com os dados da sessão, não jogado.
- **o que fica:** na jornada, a gente da cidade de origem continua "presente" — a mesma regra, fora do pedido.
- **para quem joga:** na masmorra estão os que desceram; quem nunca o viu não diz que ele mudou; e o mundo deixa de
  inventar uma segunda Delfina ou uma pessoa com o nome da taverna.

## 30/09 15:08 · v9.337 · os restos da MM14 — interrompidos pelo limite de uso · sem código

- **o que aconteceu:** as três mãos dos restos da MM14 (as pessoas que seguem a heroína, o "você mudou",
  os nomes que colidem; as missões forçadas em série; a pergunta que vai ao oráculo) foram lançadas em
  paralelo e **morreram as três ao mesmo tempo no limite de uso da sessão** ("session limit", HTTP 429),
  antes de escreverem uma linha. **A árvore ficou limpa**: nada a desfazer, nada meio escrito.
- **o que ficou feito neste ciclo:** a pauta do desenho recebeu as duas peças do sistema para quando a
  fila reabrir (`81e52f6`).
- **o que falta, pela ordem:** os três restos da MM14 (os pedidos estão escritos, iguais, na MM14 da
  pauta) e depois a segunda sessão de prova (`mente/mm11-sessao-2.md`, 25–30 respostas).
- **a lição, para o próximo ciclo:** três mãos pesadas em paralelo gastam o limite três vezes mais depressa;
  quando o limite apertar, uma de cada vez.

## 30/09 14:48 · v9.337 · MM14 (5) · os fios e os contratos viram missões, e os dois canais antigos saem · commit `fc23d35`

- **por que andou:** decisão do coordenador (a opção (a)). O Narrador (`quest_atualizar`) e o Cronista
  (`missoes.concluidas`) fechavam as tarefas da lista antiga **só pelo título, sem conferir nada** — a
  mesma família de defeito que a MM14 pagou nas missões. Mas eram a única via de fechar dois tipos de
  tarefa, por isso: primeiro converter, depois remover.
- **estado inicial:** verde (`031bd26`, `e52c863`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend:** `src/tarefas-antigas.js` — **os fios do descanso longo** (o único tipo que ainda nasce)
  passam a nascer missões com etapas que se conferem (encontrar a pessoa num lugar da cidade dela, por
  semente — 380 fechavam só porque o Narrador dizia o nome); **os contratos** (só existem em saves
  anteriores à v9.37) viram missões cujo fecho **paga exatamente o mesmo — 1152 contratos comparados, 0
  diferenças** em moedas, XP, fé, heroísmo e contagem. **A migração ao carregar** leva as tarefas ativas
  da lista antiga para as missões, idempotente (carregar duas vezes não duplica), e marca a antiga como
  `migrada` — o mesmo campo, o mesmo tipo, só um valor novo, que todos os leitores já ignoram (filtram
  "ativa"): num rollback continua invisível, e a missão fica. **E um gémeo que ninguém tinha visto**: os
  saves sem missões, desde a v9.27, copiavam cada tarefa ativa para uma missão "de legado" que nunca
  fechava, deixando a tarefa ativa também — é trocado pela missão convertida.
- **decisão média tomada (orquestrador):** **o fio paga o que pagava** (só a fé e o heroísmo). O backend
  propôs que passasse a pagar como um favor (◉62 · 96 XP no nível 3); mudar a economia não era desta
  etapa. Fica uma diferença pequena e escrita: o fio fechado soma agora em "contratos concluídos", como
  toda missão.
- **frontend:** a migração no load (com a semente do save que se carrega), o fio do descanso nascido
  missão, a fé e o heroísmo pagos no fecho, e **os dois canais fora** — e o prompt do Cronista encurtou
  (só o "global encerrado" fica). Ficam inertes, sem mexer: o bloco "contratos ativos" do mural e o
  "abandonar contrato", que só serviam a saves pré-v9.27.
- **a prova:** um save antigo feito à mão, com um fio e um contrato ativos e sem missões, injetado com o
  jogo desmontado — as duas viraram missões com etapas reais e a lista antiga marcou-as `migrada`;
  recarregar não duplicou; o localStorage foi restaurado ao de antes.
- **a sonda:** não se move (92/157).
- **para quem joga:** nenhuma tarefa acaba porque o Mestre disse que acabou; um contrato paga quando se faz
  o que ele pede, e paga o mesmo de sempre.

## 30/09 13:26 · v9.336 · MM14 (4) · perguntar é de graça, e a resposta que chega é a que responde · commit `031bd26`

- **por que andou:** duas decisões do coordenador da fase — **perguntar ao Mestre é de graça** (numa mesa
  do Matt, "ele está a ver-me?" nunca custa a vez; foi onde a sessão perdeu 7 de 12 perguntas) — e **a
  medida muda**: não chega a informação estar na pauta; tem de lá estar **a que responde à pergunta**.
- **estado inicial:** verde (MM14 (3) no ar, `4d721eb`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend:** `src/perguntas.js` — `soPergunta` separa a pergunta do que age, pela peneira (os gestos de
  quem pergunta — virar-se, chamar, apontar — também são de graça). E o caminho:
  - **o "sino" do Sino Calado sequestrava a resposta** — a ficha da cidade lia a frase inteira e casava o
    nome da taverna; agora o assunto procura-se numa frase **sem nomes próprios** e sem a parte que age;
  - **o teste social comia a frase** — "vou até X e pergunto" era Persuasão; uma fala que só pergunta é
    balcão, não dado (a cantada continua a ser teste);
  - **um fato só por turno, às vezes de outra cidade** — até três respostas, pela ordem da frase, dentro do
    teto (duas cabem na taverna cheia; a terceira entra quando há lugar); "que família manda aqui?" só
    aceita casas daqui (o erro da sessão era um homónimo);
  - **as quatro inventadas** passam a sair do sistema: o posto com data, quem trabalha na casa (com a gente
    do registo), **o preço de uma arma pelo mercado** ("não há adaga à venda; armas à venda: …"), a
    distância a um lugar nomeado ("Poço de Sal, a sudeste, 90 km — mina, perigo 4, 9 salas");
  - **o rebate que o Mestre desmentia** — o sino da MM13 guarda quando tocou (campos novos, aditivos), e a
    resposta ao sino diz "às 10:49, tocou a rebate".
- **A RÉGUA NOVA — as 12 perguntas da sessão, refeitas sem chamadas pelo que o jogo enviaria (o mundo
  reconstruído pela semente): antes 5 de 13 levavam a resposta certa; agora 13 de 13**, e em cada uma a
  errada (o sino das horas, a casa do homónimo) não está.
- **frontend:** a pergunta não faz andar o relógio, os relógios nem o sino; **na luta, quem só pergunta é
  respondido e a vez continua dele** (o `enviar` em luta não corre o turno dos inimigos — só o `fecharMeuTurno`
  o faz); a pauta junta as respostas numa linha; o teste social leva a frase do jogador e não o rótulo.
- **a prova jogada:** "quanto custa o quarto na taverna daqui?" → a pauta levou o preço da ficha, e **o
  relógio ficou nas 08:00** em três perguntas seguidas. **E um resto:** "Maren, há quanto tempo tem essa
  taverna?" foi ao oráculo (d100) em vez da ficha, porque a taverneira ainda não estava registada — a
  pergunta fechada que a ficha sabe responder ainda pode ir ao oráculo; na pauta.
- **a sonda:** 92/157, não se move (nenhum "ninguém decide" passa honestamente).
- **para quem joga:** perguntar ao Mestre deixa de custar a vez e o tempo, e a resposta é a verdade do
  mundo — o preço da ficha, a idade do retrato, a distância do mapa — e não o sino das horas.

## 30/09 12:04 · v9.335 · MM14 (3) · o lugar da heroína e o da narração voltam a ser um · commit `4d721eb`

- **por que andou:** o defeito nº 2 da sessão de prova, o maior que restava — a continuidade partia-se
  no turno 5.
- **estado inicial:** verde (`b7aed23`). A mesma mão das missões, retomada.
- **bastão:** tomado por mim para cinco pontos (deslocamento zero); devolvido com este commit.
- **os casos da sessão, com a causa:**
  - **"Eu vou à torre" viajou sozinho; ir à banca levou ao Cais do Sal** — a leitura do "para onde vou"
    lia a fala entre aspas (já consertado na MM14 (1); provado outra vez).
  - **"Saio pelo portão" foi recusado** — "saio" não era verbo de ir; casou só o "sal" do Cais do Sal,
    onde ela já estava. Agora sai: ao arredor nomeado, senão "o lado de fora dos portões"; se a frase
    pede estrada, decide a estrada. Nenhuma lei nova fecha o portão (seria mecânica nova).
  - **O galpão e o salão da taverna abriram masmorras — e as duas nasceram da faca da heroína:** em
    JavaScript o `\b` só conhece ASCII, e "lâmina" contém "mina", que é palavra de covil. "Desço ao
    salão com a lâmina à cintura" abria uma masmorra. Agora o detector lê sem acento, **nunca abre
    num prédio ou cômodo**, e abre sempre a masmorra do mundo pelo nome dela. **O sinal "masmorra:"
    do Narrador abria sem pergunta nenhuma** — passa pela mesma porta, e a recusa diz-se ao Narrador.
  - **"Continuo lá" e "agora estou aqui" no mesmo turno** — a recusa do turno anterior ficava na nota e
    juntava-se ao movimento novo. Agora só sobe o último envelope de lugar.
  - **A taverna ficou "fora da cidade"** — o Mestre escreveu "Sino Calado" sem artigo, a comparação era
    letra a letra, e o lugar "novo" caiu em "arredores". Agora compara sem artigo, e **"arredores" só
    fora dos muros**. (Isto pesa: o baú do ermo e o crime da MM10 dependem dele.)
- **a varredura (24 mundos), antes → depois:** masmorras num cômodo pela frase 192/384 → 0, pelo sinal
  do Narrador 96 → 0; saídas pelo portão perdidas 96/144 → 0; masmorras do mundo que não abriam com o
  nome delas 13/16 → 0; "arredores" dentro dos muros 328/708 → 0; turnos com duas versões do lugar
  96/168 → 0; passos na cidade que viraram viagem 0 → 0; perguntas "onde fica?" que movem 0 → 0.
- **o que fica:** ir a pé até à boca de uma masmorra do mundo, que pode estar a centenas de km, não tem
  caminho — é mecânica nova, na pauta.
- **para quem joga:** onde ele está é onde a história está — descer ao salão é o salão, sair pelo portão
  sai, e a taverna fica dentro dos muros.

## 30/09 11:26 · v9.334 · MM14 (2) · o "como" chega, o revide fere, a sala limpa fica limpa · commit `14f0bd6`

- **por que andou:** os defeitos nº 3, 4 e 5 da sessão de prova.
- **estado inicial:** verde (MM14 (1) no ar, `dc0fd9d`).
- **bastão:** tomado por mim para três apêndices em linhas existentes e três imports (deslocamento
  zero); devolvido com este commit.
- **nº 4 — o "como você faz isso?" nunca chegava ao Narrador (3 em 3):** a hipótese do `jogo`
  confirmou-se — **o corte da pauta por prioridade**. A cena era a segunda linha de ACABOU DE (prio
  3,1) com ~470 caracteres, e o ONDE e o NÃO PODE sozinhos já enchiam o teto; o CONTRA (prio 5)
  entrava no lugar dela. Numa das vezes caiu também o fato, empurrado por outras linhas de ACABOU.
  Conserto: uma secção nova, **DESFECHO (prio 2, como A FALA)**, para o golpe final, e os vetos dele à
  frente do NÃO PODE. As três frases da sessão passam a chegar (1349, 1369, 1319 de 1400). No pior caso
  de todos, quem cede é a cena; o fato e o veto nunca. O teto não subiu.
- **nº 5 — o dano do contra-ataque contado e nunca aplicado (2 em 2):** o revide era aplicado num
  objeto novo do combate, e o turno dos inimigos, que trabalha na sua própria cópia, publicava-a por
  cima — o Narrador ouvia "3 de 8" e o tabuleiro voltava a 8 de 8. Agora o revide aplica-se na cópia
  do turno.
- **nº 3 — voltar a uma sala limpa ressuscitava os inimigos (T34):** a entrada numa sala decidia só pelo
  tipo e nunca olhava se já fora resolvida. **O mesmo buraco pagava o tesouro outra vez (ouro
  infinito), curava no santuário outra vez, disparava a armadilha e reabria o enigma.** Agora a sala
  limpa fica limpa, e o Narrador ouve quem caiu ali e que não se levanta.
- **orquestrador:** uma asserção do `teste-golpe-final` guardava o caminho que cortava a cena — movida,
  com o motivo. **E achei a correr as suítes uma prova instável que já existia**: "ids de participante
  não se repetem" (`teste-sala`) falha ~7% das vezes (2 em 30) — sorteio sem semente na própria prova,
  o mesmo defeito que a v9.240 consertou para os códigos. Não é desta etapa; consertado a seguir, num
  commit à parte.
- **o que fica (na pauta):** o PV do envelope do revide sai do campo antigo; um inimigo morto pelo revide
  ainda age nessa rodada; a sala abandonada a meio de uma luta volta com todos.
- **para quem joga:** o que ele escreve no golpe final chega ao Mestre; o contra-ataque fere de verdade; e
  uma sala que ele limpou fica limpa — sem mortos que se levantam nem tesouros que se repetem.

## 30/09 11:14 · v9.333 · MM14 (1) · as missões deixam de fechar sem se jogarem · commit `dc0fd9d`

- **por que andou:** o defeito nº 1 da sessão de prova — o que a partiu no turno 5.
- **estado inicial:** verde (`1323b58`, a transcrição). Em paralelo, noutra mão, os defeitos 3, 4 e 5.
- **bastão:** tomado por mim para três linhas (deslocamento zero); devolvido com este commit.
- **backend — os quatro fechos da sessão, cada um reproduzido em Node (falha antes, passa depois):**
  - **"Encontrar Teodoro ✓" no portão, e a principal fechada com a Delfina a 146 km:** a etapa "falar
    com" lia "está no registo", e quem é só nomeado entra no registo (a secção de pessoas do
    Cronista não passava pela guarda da MM13b). Agora **encontrar exige estar com a pessoa** — no
    lugar dela; um cômodo conta como o prédio; nome parecido ou cidade errada reprovam.
  - **"Tirar Branca de lá" fechado por uma frase no futuro:** a leitura do "para onde vou" lia o texto
    inteiro, incluindo a fala entre aspas; agora só o que a heroína declarou (a peneira), e o futuro
    dito com todas as letras e a fala com destinatário não movem ninguém. E o veículo era um "ir a"
    só: passa a chegar **e** resgatar, com a emboscada à chegada.
  - **"O lance" fechado por entrar na taverna:** as tramas de uma etapa fechavam no mesmo instante, e a
    virada prometida nunca acontecia (em 10 veículos, desde a v9.117). Agora a última etapa segura a
    missão até a virada vir, e só então fecha.
  - **"O Chamado" → "A Travessia" no turno 11:** as missões falsas empurraram o arco; o ato **não vira
    com marcos da espinha por cumprir**.
- **e um defeito do App, provado em Node e consertado na fiação:** cada marco da espinha cumprido
  **gravava o objeto de retorno no lugar do arco**, e o arco voltava a "jornada", ato 0 — **toda a
  história principal reiniciava a cada marco**. Uma asserção de `teste-espinha` guardava a linha do
  defeito; foi movida, com o motivo.
- **a varredura (24 mundos × 8 estruturas):** frases que não são ida e moviam a heroína 2016/2016 → 0;
  principais com um passo fechado só por menção 192/192 → 0; marcos caídos por menção 2511/2511 → 0;
  tramas fechadas antes da virada 10/10 → 0; idas declaradas perdidas 0 → 0; principais jogadas que
  ficam presas 0 → 0.
- **o que fica (na pauta, com o nº 8):** o Narrador e o Cronista ainda fecham as quests antigas por
  título, sem conferir — não foram a causa, e fechá-los é remover o que existe; a secção de pessoas
  do Cronista ainda regista nomes de passagem; "volto para a mesa" casa "A Mesa Honesta".
- **para quem joga:** uma missão só acaba quando acontece — encontrar alguém é estar com ele, chegar é
  estar lá, e a história não salta de ato por conversa. As tramas curtas ganham a virada que sempre
  prometeram (a emboscada, o encontro, a revelação).

## 30/09 10:38 · v9.332 · MM11 · a sessão de prova — veredito: ainda não · sem código (só a mente e a transcrição)

- **quem jogou:** o `jogo`, uma sessão inteira à maneira de C1E1 numa campanha nova de *Uma Vida*
  (Iara do Vau, Meio-elfo Ladina; Foz do Meio), **49 respostas do Mestre**, um dia de jogo. A
  transcrição, turno a turno, com as anotações, está em `mente/mm11-sessao.md` — é o documento para
  a pessoa ler.
- **O VEREDITO: o nosso Mestre ainda não toca uma sessão à la Matt Mercer.** A voz já é de mesa, e
  quando o fato certo chega à pauta ele acerta sempre, número a número (o quarto: seis moedas, como a
  ficha; a distância na luta: 20 m e 17 m; "não me veem, ele meio encoberto"). **O que falta é a
  continuidade, e é o próprio sistema que a parte**: a sessão partiu no turno 5 e não se recompôs.
- **as perguntas contra o sistema (12 que o mundo sabe responder):** 5 certas, 2 pela metade, 4
  inventadas, 1 contradita, 1 perdida. O defeito não é o Narrador, é o caminho da pergunta até à
  pauta — a palavra "sino" do nome da taverna sequestrou a resposta seis vezes; o teste social comeu a
  frase de quem perguntava; um fato por turno, às vezes de outra cidade. **A sonda estática diz 92/157;
  a sessão jogada mostra que chegar à pauta não basta — a pergunta tem de ser a que chega.**
- **o que aconteceu do que a fase tinha de provar:** a abertura (turno 1, as três respostas, sem
  Aceitar — mas o primeiro passo fechou logo no portão, e o mural abriu no turno 2); **o sino — o
  melhor momento da sessão**: prenúncio no turno 9, rebate no 18, depois de explorar (mas aponta para
  um lugar a 146 km); o cartão do golpe final veio 4 vezes e a escolha valeu — **mas o "como você faz
  isso?" nunca chegou ao Narrador**; o aviso antes de falar a um esqueleto funcionou; o enigma das
  alavancas foi o momento mais Matt. Não apareceram: o golpe do companheiro, a rendição, o escondido
  na luta, o atirador.
- **os defeitos que partem a sessão, por ordem** (na pauta como MM14, à frente de tudo): as missões
  fecham sem se jogarem; o lugar da heroína e o da narração separam-se; voltar a uma sala limpa
  ressuscita os inimigos; o "como" do golpe final não chega; o dano do contra-ataque é contado e nunca
  aplicado. Mais seis de peso menor, e os miúdos.
- **a proposta ambiciosa do `jogo`, para a pessoa decidir:** "perguntar ao Mestre" como jogada à parte,
  que nunca gasta tempo nem a vez — é onde a sessão perdeu 7 das 12 perguntas.
- **o que isto muda na fase:** a Fase MM mediu-se até aqui pela sonda (a pergunta chega à pauta?). A
  sessão jogada mede outra coisa, e mais dura: **o mundo aguenta uma sessão inteira sem se contradizer?**
  Hoje não. É por aí que o beta passa.

## 30/09 09:40 · v9.332 · MM10 · o crime · commit `f5dd2e6`

- **por que andou:** atacar o taverneiro abria uma luta e não um crime — ninguém chamava a guarda,
  não havia recompensa, a porta não fechava, as testemunhas não contavam.
- **estado inicial:** verde (MM9 no ar, `f6820cf`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend:** `src/crime.js` — é crime atacar quem não é inimigo, não atacou o herói agora e não
  anda com ele; três gravidades (roubar, ferir, matar). A cidade só fica a saber com testemunhas
  nomeadas ou com a rua vigiada (a `VIGILANCIA` da MM12): de noite, sem testemunhas, numa cidade sem
  ronda, ninguém sabe. **Contra um figurante, a cidade reage**: a lei da ficha da cidade vem atrás,
  há recompensa pela cabeça (maior nas cidades grandes), os preços sobem ×1,15 a ×1,6 e deixam de
  lhe dar pouso (no matar, também o templo), e quem viu conta. **Contra alguém do elenco, é
  história**: a casa dele não esquece, e quem gosta dele dá um passo fora de cena ("jurou que isso
  não fica assim"), que chega pela linha ENTRETANTO da MM8f. **O procurado** vive num campo novo e
  aditivo, `lei`, por cidade, e expira no prazo da tabela; se a vítima morre, o crime passa a
  matar, sem cobrar duas vezes. **A guarda vem** no máximo uma vez por dia, com o combate que já
  existe (numa cidade grande, 6 vezes em 12 dias; numa aldeia, nunca). Reusa o que existia — a
  agressão, o cobrador que cobra a memória dias depois — sem o duplicar.
- **O VEREDITO ANTES DO CLIQUE — decisão do orquestrador, pela lei da casa:** atacar quem não é
  inimigo é irreversível, e o preço aparece antes: "Ivo não é inimigo: atacar é um crime em
  Poço-Pequeno… 90 moedas… 12 dias… nem pouso", com **atacar mesmo assim / deixar**. Na forma do
  cartão do golpe final (os mesmos botões, o mesmo painel), no sítio da soleira — sem peça nova.
- **frontend:** o save (e **a sala publicada sem `lei`**, como sem `elenco`), o crime na pauta, o
  procurado em "não pode" enquanto dura, a morte da vítima pelos dois caminhos (a narrada e o fecho da
  luta), o preço no mercado, a estalagem que recusa o pouso, e a guarda depois de um descanso na
  cidade.
- **um defeito achado a jogar, e consertado:** o App marcava a vítima como "inimigo" **antes** de ler
  o crime — e o crime recusa inimigos declarados, por isso **todo crime era engolido em silêncio**. A
  ordem inverteu-se, e uma asserção guarda-a.
- **a prova jogada:** na Brasa Viva, "ataco Ivo" mostrou o preço antes; "deixar" não abriu luta nem
  gastou o turno; "atacar mesmo assim" abriu a luta — e foi essa jogada que expôs o defeito acima.
  Depois do conserto, a cadeia (o procurado, o preço no mercado) está provada pela suíte, não jogada.
- **o que fica escrito:** render-se à guarda e pagar a multa (pedem um cartão e uma regra de
  pagamento); a legítima defesa completa ("quem me atacou nesta cena" pede um ref que o App não tem).
- **a sonda:** não se move (92/157) — nenhuma das 157 era de crime.
- **para quem joga:** bater em quem não é inimigo passa a ter preço, e o preço vê-se antes — a guarda,
  a recompensa, as portas que fecham; e bater em alguém que importa ao mundo tem uma casa e amigos
  que se lembram.

## 30/09 08:27 · v9.331 · MM9 · a luta sem espada · commit `f6820cf`

- **por que andou:** a vontade da oposição só virava pela vida. No Honey Heist o clímax
  resolveu-se pela conversa; aqui, intimidar, convencer, envergonhar não mudava nada.
- **estado inicial:** verde (`5734383`, `8b56d7a`). Em paralelo, noutra mão e noutros arquivos,
  a MM10 (o crime), por commitar.
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend:** `src/sem-espada.js` — **a tabela por inteligência** (`DEGRAUS`): o animal não se
  convence com palavras (a ameaça fá-lo fugir, não render-se); o bruto ouve a ameaça; **o astuto é
  o que a persuasão move mais barato**; o treinado aguenta a ameaça; o brilhante não se intimida; os
  mortos-vivos nunca; **o fanático** — que não existia como traço — ganhou uma tabela de nomes e só
  ouve a persuasão **depois de a causa cair** (o chefe tombado, a coisa que guardava quebrada): o
  "talvez nunca". Uma escada de dois degraus (firme → vergado → rendido, ou o bicho foge); quem a
  vida já vergou rende-se à primeira palavra certa — a espada e a palavra somam-se. A CD sai de
  tabela (15, menos a vida que falta, os companheiros caídos, e se o herói acabou de impressionar).
  A frase passa pela peneira ("posso intimidá-lo?" não rola). **A palavra gasta a ação**, como o
  golpe (o furo que a MM4 deixou escrito): bater ou falar. O rendido fica vivo, fora da luta, e a
  pauta diz ao Narrador que pode ser interrogado e **só o que ele sabe** (para que veio, e quem o
  mandou quando há nome).
- **medido (200 lutas):** o orador contra astutos acaba a luta **15% mais cedo com o mesmo dano**
  (99% das lutas acabam com rendidos); contra bichos, nada muda (um lobo foge em 43%); contra
  fanáticos, nem uma palavra. Tudo dentro de ±20%, fixado como catraca.
- **frontend:** o veredito antes do clique (a chance, no mesmo sítio da fuga, enquanto se digita),
  a ação gasta, o bando que verga depois do dado, os prisioneiros na pauta. **E um defeito antigo:
  o poupado da MM3 era riscado como morto no registo do mundo** ao fechar a luta — o rendido e o
  desacordado deixam de o ser. Sem emoji novo.
- **orquestrador:** a prova de fiação por texto que faltava na suíte da MM9.
- **a prova jogada:** contra Sérgio, "baixem as armas e rendam-se, ou morrem aqui!" → o veredito
  apareceu antes ("podem ceder — a vontade deles verga"), rolou Intimidação contra 15, gastou a ação;
  a falha (7) não mudou nada. A rendição inteira não foi jogada (custo); a suíte cobre-a.
- **a sonda:** não se move (92/157) — nenhuma das 157 era de rendição.
- **para quem joga:** numa luta, falar passa a ser uma jogada — com a chance à vista, a gastar a
  vez — e um inimigo rendido é um prisioneiro, não um cadáver.

## 30/09 06:50 · v9.330 · MM8f · o elenco age fora de cena — o MM8 completo · commit `5734383`

- **por que andou:** a sexta e última subetapa do elenco, a proposta da pessoa: o elenco **age fora
  de cena** no relógio do mundo, e a pauta leva quem mexe os pauzinhos neste turno.
- **estado inicial:** verde (MM8e no ar, `c69f814`).
- **bastão:** tomado por mim para duas linhas (apêndices às linhas da promoção e da saída —
  deslocamento zero); devolvido com este commit.
- **backend:** a cada dia, **0 a 2 pessoas do elenco dão um passo pela agenda da índole** (em 200
  dias: 83 sem passo, 85 com um, 32 com dois) — os hostis têm rixas, dívidas, conversas baixas com
  gente de fora; os de afeto fazem as pazes, aprendem um ofício, ajudam os vizinhos; os que guardam
  alguma coisa fecham a porta; os comuns zangam-se por dinheiro ou têm um dia bom. **Os passos com
  outra pessoa mudam o laço entre as duas**, e o elenco passa a lê-lo; a família nunca muda. Nunca
  age quem morreu, quem anda no grupo, os chefes, nem quem ainda não estreou. Guarda-se dentro do
  campo `elenco` da MM8e (os 12 passos mais recentes, até 40 laços mudados); a validação não os
  apaga; um save da v9.329 joga igual; um revert perde o que o mundo fez e não parte nada.
- **o que o Narrador ouve:** uma linha "ENTRETANTO" (prioridade 6) **só quando toca a cena** — na
  cidade do herói, alguém presente, ou alguém com laço com ele — até 2 dias depois ("ontem: Kaelith e
  Dagon desentenderam-se por causa de dinheiro"). **De longe, pelo canal de rumor que já existia**
  ("🗞 Corre a boca miúda"), só para gente da história e mestres de guilda, no máximo um a cada 3 dias
  (8 boatos em 120 dias). Nada no fixo: a folga do prompt continua 603.
- **o que não entrou, e é decisão:** mudar alguém de cidade. O jogo lê a cidade de uma pessoa no
  registo e, para quem ainda não se conhece, na base derivada, que o save não guarda; mudar de
  verdade pede escrever `npcs[x].local` (campo que já existe) e um campo novo de paradeiros que a base
  leia. Ficou como está — ninguém se muda; na pauta, para o coordenador.
- **orquestrador:** três asserções da MM8e liam a linha inteira da promoção e da saída, e a MM8f pôs
  código na mesma linha (para não deslocar endereços); passam a ler só o statement delas, até ao seu
  `calou`, com o motivo. **O vermelho foi visto antes do commit, pelo código de saída do `npm test`.**
- **o critério de pronto do MM8 — as 12 perguntas de "pessoas por dentro": 11 chegam** (#18, #26,
  #42, #54, #60, #61, #62, #90, #103, #105, #106). **Falta a #29** — "como o teu amigo se feriu desse
  jeito?": é a ferida de agora, mostrada na cena; o sistema decide a cicatriz do retrato, e a ferida
  que o Narrador narra continua de ninguém. Um passo "ferido numa briga" não a responderia — seria o
  sistema a decidir uma ferida que a cena nunca mostrou. A sonda: **92/157**.
- **o elenco, de ponta a ponta (MM8a–f):** a ficha por dentro, 24 com laços e casas, os tetos, quem
  importa, o figurante de passagem, a promoção pelos dias do convite, e o mundo a mexer-se sozinho —
  sem nada no registo nem no Códex à nascença, e com a lei do teto a valer.
- **para quem joga:** as pessoas do mundo passam a ter vida entre as visitas — brigam, fazem as pazes,
  ficam a dever —, e o que acontece perto dele ou a quem lhe importa chega-lhe; o resto, às vezes, como
  boato na taverna.

## 30/09 06:27 · v9.329 · MM8e · a promoção, pelos dias do convite · commit `c69f814`

- **por que andou:** a quinta subetapa do elenco — o figurante em quem o jogador investe sobe ao
  elenco, e o elenco de tamanho fixo perde alguém. A proposta da pessoa, nas palavras dela.
- **estado inicial:** verde (`904c935`, e o `27efcb8` do coordenador no roteiro: o verde é o código
  de saída do `npm test`). Todas as provas desta etapa foram lidas pelo código de saída.
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit. **A mão
  encerrou o turno a meio**, a "esperar a notificação de um monitor" — foi retomada com a ordem de
  correr tudo em primeiro plano, e fechou.
- **backend — o único campo novo do MM8:** `elenco` no topo do save (promovidos, saídos, e os dias
  em que o herói viu cada pessoa — até 10 por pessoa e 150 pessoas). **A versão antiga ignora-o**:
  o load lê o save chave a chave e o salvar monta o objeto de novo a partir do estado, por isso
  quem voltar a uma versão antiga perde as promoções no primeiro autosave e o jogo segue inteiro —
  o "reversível" da lei. **Um save sem o campo joga igual.** Os dias vistos fecham o "visto em dois
  dias" que a MM8d não podia medir.
- **a promoção:** ao virar o dia, sobe quem está no registo, vivo, fora do elenco e com investimento
  (dois dias vistos, um laço ou o grupo) — **e só com o convívio do convite** (os dias desde o
  encontro, lidos do mesmo `conhecidoEm`, nunca reescrito; piso 3). Um por dia. Sai quem pesa menos;
  **nunca** quem é da história, um chefe, quem tem laço ou está no grupo; se ninguém pode sair,
  ninguém sobe. A saída diz-se pelo mundo ("Aelith deixou Forte do Rei ontem"), só na cidade dela e
  por 3 dias. O registo, o convite e o Códex ficam iguais; nada no fixo do prompt.
- **a sala — o limite que se respeitou:** o salvar publica o save na sala de dois (`api/sala`), e o
  protocolo da sala é da pessoa. **A sala passa a ser publicada sem a chave nova** — tudo o resto
  byte a byte igual; o convidado não precisa das promoções do anfitrião. Uma asserção do
  `teste-sala` re-ancorada, com o motivo.
- **o cache do elenco** (MM8c-2) passou a ter o estado na chave — sem isso, depois de uma promoção o
  elenco ficava velho.
- **a prova jogada:** "Gael da Colina" citado → `elenco.vistos` cresceu um dia por turno no save;
  três "Esperar 24h" até ao dia 4 → **promovido no dia 4** (convívio de exatamente 3 dias, o piso),
  com uma saída no mesmo dia; recarregar duas vezes — o campo sobreviveu byte a byte; nenhum nome de
  mecanismo na tela.
- **para quem joga:** a gente a quem ele volta passa a ficar — o Mestre lembra-a, conta com ela, e
  alguém que ele nunca procurou abre-lhe lugar, deixando a cidade.

## 30/09 05:18 · v9.328 · **subi vermelho, e o conserto** · commit (este)

- **o que aconteceu:** o commit da MM8d (`8f95b4d`) **subiu com duas suítes vermelhas**
  (`teste-mm8c1-tetos`, `teste-mm8c2-quem-importa`: 235/237). A fiação que eu mesmo fiz em
  `enviar` acrescentou `missao:` ao fim de duas chamadas cujo texto literal essas duas suítes
  liam; e a minha cadeia de comandos era `npm test | tail -4 && git commit` — **o `&&` lia o
  código de saída do `tail`, não o do teste**, e o commit e o push seguiram. Foi falha minha: li a
  linha "235/237" já depois do push. **Violou a lei do push** (build limpo, `npm test`
  inteiramente verde) durante uns minutos, com o jogo publicado a correr código são — o vermelho
  era de suíte, não de jogo — mas a lei não distingue, e não devia.
- **o conserto:** as duas asserções passam a ler o começo das chamadas (o que sempre quiseram
  provar: o `emCena` e o grupo/elenco a chegar), com o motivo escrito; 237/237.
- **o que muda na forma de trabalhar:** o teste corre para um ficheiro e o **código de saída do
  próprio `npm test`** decide o commit; nunca mais por um `tail`. Revi os commits anteriores
  desta fase: em todos a linha impressa era verde antes do push; este foi o único.

## 30/09 05:11 · v9.328 · MM8d · o figurante é de passagem · commit `8f95b4d`

- **por que andou:** a quarta subetapa do elenco. Com a MM8c-2 o figurante já pesava 0, mas ainda
  ocupava os lugares vazios das PESSOAS CONHECIDAS e da lista de longe.
- **estado inicial:** verde (MM8c-2 no ar, `c3b9a7a`).
- **bastão:** tomado por mim para duas linhas em `enviar` (deslocamento zero); devolvido com este
  commit.
- **backend:** quem não tem investimento, não é do elenco e não está em cena **deixa de ocupar
  lugar**, mesmo com lugar vazio. Investimento, só com o que a ficha já guarda: laço (rompido
  também), consultas, relação que não seja neutra, um segredo registado; e do contexto, o grupo, a
  missão ativa, o elenco. "Presente" é quem a cena cita agora ou o Mestre anotou nos últimos 3
  turnos. **"Visto em dois dias ou mais" não se mede honestamente** (o registo só guarda o primeiro
  dia e um contador sem data): fica para a MM8e, com o campo dela. **Nada se apaga**: o registo fica
  byte a byte igual e o Códex conta o mesmo. E **o cânone deixa de repetir** a pessoa cuja linha nas
  PESSOAS CONHECIDAS já diz tudo o que ele diz, campo a campo — nunca sai um fato.
- **orquestrador:** a fiação que o backend deixou como opcional não era — sem ela, **quem a missão
  ativa procura (o Orin da pista da MM13, o dador) sairia das pessoas conhecidas** por não ter laço.
  O App passa agora a cena e a missão às duas listas.
- **o ganho (200 turnos):** campanha contida — PESSOAS CONHECIDAS 22 → 6 pessoas, 2 947 → 890
  caracteres; lista de longe 542 → 354. Média: 22 → 5, 3 009 → 694; 586 → 268. **Cerca de 2,1 a 2,6
  mil caracteres a menos por turno nas campanhas comuns.** Na solta quase nada muda (muita gente
  com segredo), e o pior caso do prompt fica igual (81 397 com o orçamento cheio). O cânone
  duplicado: onde o App copia a pessoa do cânone para o registo com os mesmos campos, 735 → 0 /
  1 771 → 0 / 2 388 → 2 354.
- **decisões médias tomadas:**
  - **O segredo registado conta como investimento** — é "a memória do enredo", e é o Narrador que
    o anota quando importa.
  - **A lista dobrada em Gestão › Pessoas não se tocou** — é tela, e a mesa de design espera a
    palavra da pessoa.
- **a sonda:** não se move (92/157).
- **para quem joga:** o Mestre deixa de gastar a memória com quem passou uma vez, e guarda-a para
  quem importa — e para quem a história manda procurar.

## 30/09 04:56 · v9.327 · MM8c-2 · quem importa, e não quem foi visto por último · commit `c3b9a7a`

- **por que andou:** a terceira subetapa do elenco. O Narrador recebia as 22 pessoas vistas
  mais recentemente; o vilão ausente há duas semanas saía da memória e o padeiro de ontem ficava.
- **estado inicial:** verde (MM8b no ar, `76a374a`, `c7698c2`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **backend:** uma tabela de peso — anda com o herói 100, laço com ele 60 (rompido também, é
  história), inimigo 50, rival/romance/cônjuge 45, família 40, aliado/amigo 30, do elenco 25,
  morto −40; o desempate é a recência consertada da MM8c-1. Serve às PESSOAS CONHECIDAS, ao LONGE
  do rodapé e às pessoas do cânone. **Os tetos não mudam: muda quem entra, não quantos.** Numa
  campanha de 200 turnos com 8 pessoas com história, pela recência entravam 2 das 8 nas 22; pela
  importância entram as 8. O "ELENCO DIVERSO PRONTO", que saía de `Math.random` e era refeito a
  cada load, passa a ser **o elenco ainda por conhecer, já estreado e vivo** — da cidade primeiro;
  a lista vai no fim do prompt, com o estado do turno, para não partir a cache a cada viagem.
- **as duas contradições antigas do prompt, resolvidas pelo que o código faz:** (1) **o PV que o
  Narrador manda não é ignorado** — o código usa-o como sugestão, dentro da faixa da criatura, e
  honra a vida já reduzida; o prompt passa a dizê-lo, e sai o "liste o PV de cada inimigo ao abrir
  a luta"; (2) **nenhum código regista chefes que o Narrador invente**, mas as áreas secretas sim
  (`masmorra:<nome>`) — o prompt diz que os chefes são os do sistema, que podem vir escondidos, e
  que as áreas secretas se semeiam por esse sinal.
- **UMA CORREÇÃO HONESTA SOBRE A MM8c-0:** a catraca dela media o pior caso com o **banco de nomes
  vazio**, mas no jogo ele leva 8 cidades, 4 tavernas e 6 pessoas. **Com o banco cheio, a MM8c-0
  deixava o orçamento cheio a 82 165 — ainda acima do teto**, e a folga de 819 que relatei era
  falsa. Esta etapa pôs o banco cheio na catraca e encurtou prosa do fixo sem tirar regra: agora
  a campanha solta mede **81 215** (folga 785) e o orçamento cheio **81 397** (folga 603). A lei do
  teto passa a valer de facto a partir desta versão, não da anterior.
- **frontend:** a fiação, e um cache por referência (o cálculo do elenco custa ~40 ms e corria três
  vezes por turno; a imutabilidade da casa garante que a mesma referência é o mesmo conteúdo).
- **a prova jogada (payload real):** a linha "GENTE POR CONHECER" leva "Línio da Capa; Ada Semente;
  Vênia; Jasco da Lareira; Cina do Muro; Zaira do Bando" — **byte a byte** o `elencoParaPovoar`
  calculado em Node com a semente do save; e a parte fixa não mudou de tamanho entre listas.
- **a sonda:** não se move (92/157).
- **para quem joga:** o Mestre deixa de esquecer o rival e o vilão por não os ver há dias, e a
  gente nova que ele põe em cena passa a ser gente deste mundo, a mesma em todas as sessões.

## 30/09 03:45 · v9.326 · MM8b · o elenco de 24, com laços e casas · commit `76a374a`

- **por que andou:** a segunda subetapa do elenco (a proposta da pessoa), depois de a MM8c-0 ter
  devolvido espaço ao prompt.
- **estado inicial:** verde (`3d0fc5b`). A mesma mão do estudo do MM8.
- **bastão:** tomado por mim para uma linha em `pautaDoTurno` (deslocamento zero); devolvido com
  este commit.
- **backend:** `src/elenco.js` — **24 pessoas, sempre, pela semente**, escolhidas de quem o mundo
  já tem, por esta ordem: a gente dos marcos da espinha (até 8), os chefes com cara de gente (até
  3), os mestres de guilda (até 4), e da base os "do arco" e os que voltam, cidade a cidade, para o
  elenco se espalhar. Só contam as 12 cidades geradas com o mundo — uma cidade que o Narrador
  acrescente não troca ninguém. Quem morre fica no lugar, marcado. **Estreia por semente**: há
  sempre gente no dia 1, nunca toda; os chefes a partir do dia 15. **Laços** com os tipos que o
  registo já conhece, um ou dois por pessoa, a maioria na mesma cidade, dos dois lados quando é
  de dois. **Casas notáveis** (uma por cidade, duas nas capitais, nenhuma nas aldeias), de 2 a 4
  pessoas, com o sobrenome de quem as encabeça ("Casa Punho-de-Pedra"); o papel na família sai da
  **idade que o retrato mostra** (a cabeça é quem aparenta mais anos; filho quem aparenta 16 a
  menos). A reputação da casa (amada, respeitada, decadente, suspeita, nova) e a de cada um.
- **o que o jogador ouve (pela PERGUNTOU, só quando pergunta):** "Casa Olho-de-Corvo (3 na
  família): a cidade gosta dela: é a porta a que se bate quando falta pão; popular? muito" e
  "bem-vistos: Quorin (cabeça), Petra (irmã); mal-vista: Sable (irmã)". A maior linha (138) cabe
  na taverna cheia (1364/1400). Nada fixo.
- **as duas conversas obrigatórias:** **o Códex fica igual** (58 → 58, 96 → 96, 187 → 187 nos três
  mundos simulados; o elenco não escreve em lado nenhum); **o convite dá exatamente o mesmo** —
  ninguém do elenco nasce com data de encontro (testado nos 480 do elenco dos 20 mundos).
- **a sonda:** **89 → 92/157 chega** (#60 o que dizem da casa, #61 quem é bem e mal visto, #62 se a
  família é popular). Ressalva escrita no caso: numa capital, fora das sedes e sem nome, "nesta
  casa" não sobe nada — uma linha a menos, nunca uma errada.
- **o que não foi jogado:** esta subetapa não teve prova no jogo; o canal é o da MM8a, provado
  byte a byte pelo payload real. Fica para a sessão de prova (MM11).
- **para quem joga:** as cidades passam a ter famílias com nome e fama, e perguntar por elas tem
  resposta — a mesma amanhã.

## 30/09 03:20 · v9.325 · MM8c-0 · a parte fixa do prompt emagrece, e a lei do teto volta a valer · commit `3d0fc5b`

- **por que andou:** a MM8c-1 mediu que o teto de 82k **nunca contou as pessoas**, e que qualquer
  campanha com gente já passava dele na pior cena (85–93 mil). O coordenador da fase decidiu:
  **encolher o fixo, nunca subir o teto** — subir é mais caracteres em todos os turnos de todos
  os jogadores, custo em dinheiro, e isso é da pessoa. Encolher cumpre a lei em vez de a mudar.
- **estado inicial:** verde (`496037a`, `456e09c`). A mesma mão do estudo do MM8, retomada.
- **o pior caso (a pior cena de luta), antes → depois:** sem gente 81 945 → 75 563; campanha
  contida 85 754 → 79 372; média 86 852 → 80 470; **solta (187 pessoas) 87 563 → 81 181**; com o
  orçamento de pessoas cheio 81 363; a paz mais cheia 84 346 → 80 532. **E a cena comum, a de
  quase todos os turnos, desce de 59 154 para 55 361 — menos 3,8k em cada turno de cada jogador.**
- **de onde saiu, tudo de `prompt.js`, sem tocar em nenhum bloco de módulo:** regras ditas duas
  vezes (o "perigo" e o "não antecipe o desfecho", que as condições já dizem frase a frase;
  "nunca conceda habilidades"; o mundo que pára no acampamento; o espólio; o loot); regra que só
  vale numa cena desceu às portas que só entram quando a cena as pede (o "onde estou é fato" da
  viagem; uma porta nova `foraDaLuta` para o turno do mundo, a agenda, a gestão e a diplomacia —
  dentro de uma luta aberta nada disso acontece); o bloco fixo do descanso foi, compacto, para a
  porta do descanso (e a frase "aplique os ganhos", que contradizia a regra do descanso, saiu);
  uma regra morta (o `[RESUMO DE SESSÃO]`, que nenhum código envia desde que o resumo é do
  sistema); e prosa mais curta para a mesma regra.
- **o corte que merece olhos:** a "iniciativa própria" dos companheiros ("companheiro calado é
  mobília: proibido") saiu, porque contradizia a regra do aliado desde a v9.108 ("um por turno, os
  outros calados — deliberado"). O comportamento que pedia já era o que o sistema proíbe.
- **a prova:** a catraca do prompt passa a ser a lei inteira — a pior cena **com gente** ≤ 82 000
  nos três mundos, o orçamento cheio, e a paz mais cheia. Nenhuma asserção lia uma regra cortada.
  **A sonda não desceu (89/157): nenhum fato saiu.**
- **o que não se fez, com o motivo — na pauta:** o teto dos lugares e itens do cânone (com 819 de
  folga, faria o Narrador esquecer o que é "verdade imutável": decisão, não emagrecimento); **as
  descrições que o Cronista regista nunca chegam ao Narrador** — um artefacto sobe só como "Nome —
  artefato, em X" (um "sabe e não conta" novo); o Cronista a receber o cânone inteiro; e duas
  contradições antigas do prompt.
- **folgas curtas, para a próxima mão:** 819 caracteres nos 82k; o guarda do cache a 0,9093 —
  sobram ~480 de regra fixa que ainda se podem descer para portas.
- **para quem joga:** nada que se veja — o Mestre recebe as mesmas regras em menos 6 mil
  caracteres na pior cena e menos 3,8 mil em cada turno comum.

## 30/09 02:55 · v9.324 · os defeitos do primeiro dia: a taverna que dava um baú, as moedas que não saíam, o d20 à vista · commit `496037a`

- **por que andou:** três dos defeitos que o `jogo` viu de passagem na prova de MM13, promovidos
  pelo coordenador — **o jogador vê-os no primeiro dia, e um fura a economia**.
- **estado inicial:** verde (MM13b no ar, `aead5c1`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **"procuro uma taverna" → Percepção e 168 moedas.** Duas causas. (1) **O catálogo**: o desafio
  `buscar` tinha "procur" na regra, e qualquer "procuro" virava "vasculhar o lugar" — o improviso
  da MM4 nem chegava a entrar. Procurar um sítio, um serviço, alguém por ofício, ou "procuro
  saber/comprar" é ir ou perguntar; vasculho, reviro, revisto, "procuro pistas/armadilhas" e
  "procuro NA taverna" continuam a ser busca. Corpus de 56 frases, 100%. (2) **O baú não era dali**:
  `achavelAqui` juntava os segredos de todos os prédios da cidade com os baús do ermo da região e
  dava o mais fácil — o herói, dentro de uma taverna, achava um baú que está fora dos muros (em 11
  de 22 cidades do mundo de teste). Agora só acha o que está onde procura.
- **as moedas narradas que não saíam:** o canal existia (`mudancas.moedas` negativo) e o Narrador
  não o usava — 15 iniciais + 168 do baú = 183, e nenhum dos três pagamentos narrados desceu. Pior:
  o leitor de ganhos da narração creditava a frase da compra ("paga 3 moedas" dava **+3**).
  `cobranca.js` passa a ler também o pagamento feito pelo herói e debita o que foi narrado menos
  o que o Narrador já declarou; não debita o que o painel já cobrou neste turno; sem fundos, a compra
  não acontece e o Narrador sabe. Corpus de 18 frases, 100%.
- **"d20 = 16 vs 10 → acontece" no descanso:** a linha respeitava a preferência "mostrar rolagens",
  mas essa preferência é dos dados **do jogador**, e "Fio local", "Nova missão", "Arco regional" são
  nomes de mecanismo. O registo virou bastidor, e os alvos soltos do descanso viraram tabela.
- **a prova jogada:** "procuro uma taverna" → foi direto à Coruja Sonolenta, sem teste nem baú;
  "pago 5 moedas ao taverneiro por um quarto" → "Ingrid aceita as cinco moedas…" e **◉ −5** (15 →
  10, no painel); "ela desliza três moedas" (a taverneira a pagar) **não** debitou, como deve; descanso
  longo sem nenhum dado à vista.
- **decisões médias tomadas:**
  - **"procuro pela taverna do Corvo" conta como ir** (o lado seguro de não rolar).
  - **O pouso que ninguém cobra fica proposto**, não feito: o acampamento na cidade descreve "um
    quarto pago" e nunca o cobra; cobrar pede ao `jogo` a decisão de quem não tem dinheiro.
- **para quem joga:** procurar onde ir deixa de dar tesouro; pagar o que se narra custa; e o
  descanso deixa de mostrar as engrenagens. A sonda não se move (89/157).

## 30/09 02:21 · v9.323 · MM13b · a pista tem morada · commit `aead5c1`

- **por que andou:** a prova jogada de MM13 viu a pista e o sino a apontar para lugares que não
  estão na planta da cidade — "o Círculo Rachado" que a planta chamava "Picadeiro Central", e
  "a Corda Velha" que não existia em lado nenhum da tela.
- **estado inicial:** verde (`74a4b61`, `77351b6`). Em paralelo, noutra mão e noutros arquivos, os
  defeitos do primeiro dia.
- **bastão:** tomado por mim para quatro linhas em `lerOMundo` (deslocamento zero); devolvido
  com este commit.
- **a causa — não eram duas fontes, era uma com dois léxicos:** a mesma `locaisDaCidade` nomeia
  os lugares pelo léxico do mundo. **A leitura do mundo corre enquanto o jogador monta a ficha,
  e o jogo não espera por ela**: quando chega depois de o mundo nascer, a planta passa a usar os
  nomes do léxico e o que já foi gravado (o mapa, a espinha, a abertura, as missões) fica com os
  da nascença. O mesmo lugar, dois nomes.
- **backend:** `soOVocabulario` (`lexico.js`) — do léxico que chega tarde, só o vocabulário
  (como as coisas se chamam, a lei, o passado); os nomes do que já nasceu ficam. Nenhum campo de
  save muda; 355 gerações provadas iguais aos nomes da nascença. E mais duas causas com a mesma
  cara: **o passo noutra cidade sem a dizer** (57% das aberturas!) — agora "A Corda Velha, em Vila
  Clara"; e **o homónimo**: "🔎 Encontrar Orin — O Armazém Velho" era o marco de *outro* Orin,
  adiante na espinha, fechado por conhecer o Orin da pista — a pista passa a evitar os nomes da
  espinha.
- **o passo "procurar":** passa a ser **encontrar a pessoa** (fecha quando se está com ela, no
  mesmo turno, e o ✓ diz "Encontrar Orin"), não "chegar ao lugar".
- **o mínimo do próximo passo:** a linha do ✓ traz agora **"→ agora: Procurar Petra na Corda
  Velha, em Vila Clara"**, para todas as missões; o diário e o ✓ dizem a mesma coisa. A peça "o
  rumo" no ecrã principal continua pedida ao desenho.
- **órfãos (576 aberturas):** passo noutra cidade sem a dizer 330 → 0; sino de outra cidade 172 → 0;
  léxico tardio — pistas / passos / sinos 144 / 288 / 206 → 0; pista com homónimo 65 → 11 (cidades
  onde toda a gente tem homónimo; aí uma pista com homónimo é melhor que nenhuma).
- **o que fica da pessoa:** os saves já partidos (o da prova jogada) não se reparam — repará-los
  reescreveria o léxico gravado do jogador. E uma proposta ao desenho: o "Começar" esperar pela
  leitura do mundo.
- **para quem joga:** a pista, o passo seguinte e o sino passam a ter morada no mapa que ele vê.
  A sonda não se move (89/157).

## 30/09 01:53 · v9.322 · MM13 · a prova jogada do `jogo` · sem código (só a mente)

- **quem jogou:** o `jogo`, a pedido do ciclo do sistema, sem desenhar nem editar (a mesa de
  design continua parada). Duas campanhas novas, ~19 respostas pagas.
- **o veredito:** a etapa funciona para quem joga. **No turno 1, as três perguntas têm resposta
  na tela, sem nenhum Aceitar** — "uma carta sem assinatura, de um antigo companheiro de armas";
  "Orin sabe mais; o Círculo Rachado fica a leste da praça"; "procurar Orin". O mundo repetiu o
  nome da pista três vezes em doze turnos, sem ninguém lho pedir.
- **o mural:** o primeiro Aceitar chegou no turno 8 (o fecho de 6 turnos), e na campanha que
  seguiu a pista abriu no turno 3, no mesmo turno do primeiro passo. Como desenhado.
- **o sino:** prenúncio no turno 6 ("ao longe, o sino toca uma vez, fora de hora, e cala") — e
  **o Narrador pegou-o sozinho**: no turno 10 um guarda "não volta desde o sino", no 11 o
  sargento "se o sino tocar de novo…". O sino tocou depois da 12.ª jogada, com o herói fora dos
  muros: feridos a gritar "A coisa saiu do Círculo! Corre!". **Chegou depois de explorar oito
  lugares e cinco pessoas, e pareceu o mundo a empurrar, não o sistema a castigar.** (Uma noite de
  sono pelo meio deve tê-lo enchido; um jogador faria o mesmo.)
- **o que falha — e é da MM13:** **a pista e o sino apontam para lugares que não estão na planta**
  (o Círculo Rachado da base do mundo é o Picadeiro Central na planta; a Corda Velha do segundo
  passo não existe em lado nenhum da tela). Duas fontes de nomes para os mesmos lugares. Vira a
  MM13b, à frente de tudo.
- **o próximo passo:** na abertura, encontra-se sem ajuda. **Depois do primeiro passo, não**: a
  linha do ✓ diz o que fechou e cala o que abriu, e o `jogo` ficou sem rumo no turno 3. É a
  prova, por experiência jogada, de que falta **"o rumo"** no ecrã principal — peça do desenho,
  para quando a pessoa reabrir a fila dele; o mínimo sem peça (a linha do ✓ com o passo
  seguinte) é do sistema e vai com a MM13b.
- **mais nove defeitos vistos de passagem**, para "Aberto": o sistema a falar de si no descanso
  ("d20 = 16 vs 10 → acontece"); uma missão "do Mestre" antes do primeiro passo, com o próprio
  herói como contratante e erros de texto; a 🗝 de um segredo com cara de principal; o relógio que
  não segue a narração; "procuro uma taverna" a dar Percepção e 168 moedas; moedas narradas que
  não descem; o herói "nos arredores" de dentro dos muros; "de volta a" sem ter saído; o Guerreiro
  sem arma nem comida; e o "Continuar" do dado fora do ecrã a 310 px.
- **para quem joga:** começar uma campanha passou a ser chegar a um sítio com uma razão e alguém
  para procurar; o que ainda falta é que esse alguém esteja no mapa, e que o rumo não se perca
  depois do primeiro passo.

## 30/09 01:29 · v9.322 · MM13 · o mundo puxa o herói · commit `74a4b61`

- **por que andou:** pedido da pessoa, com peso grande, e corrigido por ela antes de começar:
  *"ele diz o mundo, onde o personagem está, e uma pequena história do local… conforme o mestre
  trabalha o mundo, vai induzindo o player para a quest."* O coordenador conferiu no C1E1: o
  Matt abre com **o propósito antes da cena** (uma memória, não uma oferta), **a chegada, o lugar
  e uma pista concreta**, e **o mundo aperta muito depois** — o sino.
- **estado inicial:** verde (MM8c-1 no ar, `4e28aef`, `f41b32d`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **o que havia:** a casa forçava a principal no papel, mas com uma trama sorteada por
  `Math.random` que não lia a espinha nem o antecedente; a abertura convidava o Narrador a
  oferecer um trabalho; e **logo depois da resposta da abertura, `oferecerTrabalhoDaqui`
  pregava um cartaz com Aceitar no dia 1** — o cardápio que a pessoa viu.
- **backend:** `src/abertura.js` — a razão de estar ali sai da estrutura da história e do
  antecedente (por tabela), e **a pista sai do primeiro marco da espinha**: se o marco é uma
  pessoa nesta cidade, é ela; se é descobrir, alguém dessa casa; senão, um informante num lugar
  de conversa — gente e lugares que o mundo já tem, nada inventado ao lado. A principal nasce
  ativa com dois passos (ir ao lugar da pista; o que o marco pede). O pedido ao Narrador segue a
  ordem mundo → chegada → a pequena história → porque estou aqui e o que sei, e diz que ninguém
  oferece trabalho. O mural fica fechado 6 turnos ou até o primeiro passo. **O sino**: enche com
  o tempo, com cada lugar e pessoa novos, e quando a principal pára 8 turnos; **nunca antes do
  turno 12**; um prenúncio antes ("o sino toca fora de hora e cala"); toca uma vez, por tabela,
  ligado ao marco e à masmorra perto; longe, vira notícia. Nunca bloqueia.
- **três defeitos que já estavam no ar, consertados no caminho:**
  - **A — os marcos "descobrir" nunca se cumpriam:** a etapa comparava o nome do local com ids
    da forma "Cidade|tipo". **58% das principais ficavam presas** (192 da varredura; 75% em
    ficção científica, horror e pós-apocalíptico) → **0%**. Prendia também as tarefas de guilda
    de furto, escuta, relíquia, selo. O formato do save não mudou: a etapa aceita a chave e uma
    ponte nome→id.
  - **B — toda campanha nova ficava com a espinha da estrutura anterior** (a primeira, sempre
    "jornada").
  - **C — uma campanha nova na mesma sessão herdava as missões da anterior.**
- **frontend:** a abertura nova (e o caminho antigo, se não houver pista); o save `abertura`
  (campo novo, aditivo; save sem ele é legado — mural aberto, sino desligado); o mural fechado
  em cinco sítios; "dizer o nome não é conhecer" (a pista só conta quando se chega a ela); o
  sino a andar; um fio por turno de quem está em cena; e **o próximo passo no cartão da
  principal do diário**, sem peça nova (2 cliques do ecrã principal). Um `ReferenceError` só
  apareceu a jogar (a prop do diário vive noutro componente) e foi consertado.
- **a prova curta (payload real ao Narrador):** turno 1 com a razão ("uma carta sem assinatura…
  um nome parecido com o da família que perdeu"), a pista ("Generosa… encontra-se em Feira dos
  Ossos"), a principal ativa, e "ninguém me oferece trabalho". **Nenhum Aceitar** na tela. O
  diário: "Procurar Generosa em Feira dos Ossos".
- **o custo:** o pedido de abertura custa 1 188–1 350 caracteres e substitui ~1 920 (o texto
  antigo mais o envelope da trama). Nada vai para a parte fixa.
- **decisões médias tomadas:**
  - **O sino é escondido até tocar** (fora da lista de relógios), como o do Matt, que não foi
    anunciado.
  - **O próximo passo vai para o diário e não para uma peça nova**: 2 cliques. Se a prova
    longa mostrar que o jogador não o encontra, pede-se a peça ao desenho.
- **para quem joga:** a campanha começa com uma razão e alguém para procurar, sem cardápio; o
  mural só abre quando ele já sabe o que está a fazer; e, se ele vaguear, a história vem ter
  com ele — mais tarde, não no primeiro minuto.

## 29/09 23:55 · v9.321 · MM8c-1 · as listas de pessoas ganham teto, e a recência deixa de zerar · commit `4e28aef`

- **por que andou, à frente da MM8b:** reordenado pelo coordenador da fase a partir do que o
  estudo do MM8 achou — **o teto de prompt é lei da casa**, e duas listas de pessoas o violavam
  ao vivo em campanhas longas. Não precisava do elenco para se consertar.
- **estado inicial:** verde (MM8a no ar, `bb1474d`). A mente do desenho commitou R21k
  (`0c68ecd`, v9.320) a meio deste ciclo; os territórios não se cruzaram, e este commit leva
  v9.321.
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
  O App cresceu ~20 linhas; endereços de `acoes-do-jogador` re-medidos por faixa, conferidos
  contra os que o varredor re-deriva.
- **backend:** tetos por tabela, cortados pela recência (o critério de hoje; a importância é
  da MM8c-2): as PESSOAS CONHECIDAS — as 22 de sempre, e agora também 3200 caracteres (notas
  longas faziam as mesmas 22 custar o dobro); o QUEM do rodapé — 12 pessoas/700 aqui, 8/600
  longe, e quem anda comigo ou está em cena nunca sai; as pessoas do CÂNONE — 20/2400, e sem
  opções o cânone sai igual (o Cronista e o Arquivista continuam a recebê-lo inteiro). Numa
  campanha solta de 200 turnos: QUEM do rodapé 10 428 → 1 239; cânone de pessoas 8 256 → 2 388.
- **os dois defeitos da recência, consertados e provados:** (a) o contador voltava a zero em
  cada load — agora retoma do maior valor abaixo de mil milhões (um contador de turnos nunca lá
  chega; o relógio passou-o doze dias depois de 1970); (b) o vilão e quem mudava de relação no
  painel levavam `Date.now()` num campo que é contador e ficavam no topo para sempre — no load
  passam a contador, e **o App deixou de os escrever** (eram três, não dois: a frontend achou o
  terceiro, o líder de bando que aceita um decreto). A gente nova do Cronista entrava com
  contador 0 e, com o corte, sairia sempre primeiro — passa a entrar com o de agora.
- **a prova jogada:** seis pessoas conhecidas, recarregar a página, um turno a citar Eldric —
  **ele subiu ao topo** (`ultimaVez` de 1 para 3, acima do máximo de antes do load), no save e
  no painel. Antes, teria caído para o fim.
- **A DECISÃO QUE FICA — é da lei do teto de prompt, e não a tomei:** medida como a suíte a mede
  hoje (sem ninguém no registo nem no cânone), a pior cena tem **81 945 de ~82 000**. Com gente,
  as pessoas custam até ~5,8k — **o teto de 82k nunca contou as pessoas**, e qualquer campanha
  com gente já passava dos 82k na pior cena antes desta etapa. Nenhum teto de pessoas cabe em
  55 caracteres. O que esta etapa garante é que **a gente deixou de crescer com a campanha**
  (187 pessoas custam o mesmo que 50: 93 557 → 87 563 na campanha solta). Fechar os 82k é
  encolher o prompt fixo ~5,8k ou escrever na lei "82k de fixo + 5,8k de gente". Levado ao
  coordenador; escrito na pauta.
- **também crescem sem teto:** os lugares e itens do cânone, e a chamada do Cronista (o cânone
  inteiro e todos os nomes do registo). Não tapados — ditos.
- **a sonda:** não se move (89/157).
- **para quem joga:** o Narrador deixa de esquecer quem se viu antes de recarregar, o vilão
  deixa de ocupar o topo da memória para sempre, e uma campanha longa deixa de engordar o
  prompt a cada pessoa nova.

## 29/09 22:33 · v9.319 · MM8a · a gente por dentro · commit `bb1474d`

- **por que andou:** a primeira das seis subetapas do elenco (MM8), a proposta da pessoa.
  Antes de construir, um estudo e o plano, escritos na pauta (`a6418f2`). O que o estudo
  achou muda o tamanho do problema: o mundo já tem, por semente, ~122 pessoas com índole
  — **o elenco é escolher e aprofundar essa gente**; e dos três canais de pessoas ao
  Narrador só um tem teto, e nenhum é contado no teto de 82k.
- **estado inicial:** verde (MM12 no ar, `f950165`, `eeac762`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
  O App cresceu 17 linhas; endereços de `acoes-do-jogador` re-medidos por conteúdo.
- **backend:** `src/gente-por-dentro.js` — a ficha de uma pessoa: **idade e compleição
  lidas do mesmo sorteio que desenha o retrato** (cabelo grisalho nunca abaixo de 45, branco
  nunca abaixo de 62, maxilar largo é robusto, a cicatriz dita é a desenhada; conferido em
  3000 caras), o jeito, 1–2 passados com "há N anos" que citam chefes, criaturas e cidades
  **deste** mundo, o motivo do posto, a rotina (turno, folga, onde está a esta hora), quem
  trabalha em cada casa. O registo manda na identidade. Vai à pauta só quando a frase
  pergunta por alguém (secção PERGUNTOU, uma resposta por turno, 0 caracteres sem pergunta).
  O `RELEVANTE` da índole, que passava na catraca só porque a palavra aparecia na prosa do
  prompt, ganhou um leitor de verdade (o segundo passado é só de quem volta).
- **o teto:** a primeira versão juntava passado, adversário e cicatriz numa linha de 304
  caracteres e não cabia na taverna cheia; partiu-se em três perguntas. Taverna cheia com a
  pergunta pela gente: 1370/1400. Preço e passado na mesma frase: o passado espera o turno
  seguinte, sem empurrar nada de prio alta — medido, não suposto.
- **a prova jogada (pelo payload real enviado ao Narrador):** Ceia do Cego, Tiber dos Três.
  "Que idade você tem?" → a pauta levou "aparenta uns 39 anos, cabelo negro, compleição
  esguia" — **byte a byte a ficha** calculada em Node com a semente do save, e o retrato
  tem o cabelo negro e o queixo esguio. "Quem mais trabalha aqui?" → "Tiber (de folga hoje:
  no templo), Doran (fora do turno: no templo), Greta (de folga)", e o Mestre usou-a quase
  literal: "A Ceia tem três que trabalham: eu, o Doran e ela… Doran tá no templo". Na idade,
  o fato estava lá duas vezes e o Narrador escolheu fugir à pergunta com drama — narração,
  não fiação.
- **o Códex:** a MM8a não põe ninguém no registo — a ficha é derivada e só se lê. Antes e
  depois, o mesmo número. A medida de base (20 mundos, a taxa de nomes do Narrador suposta):
  50 / 107 / 168 pessoas no registo a 200 turnos. É a MM8c/MM8d que o encolhem à vista do
  Narrador; a lista do jogador é tela e espera a palavra da pessoa.
- **a sonda:** **81 → 89/157 chega** (#18, #26, #42, #54, #90, #103, #105, #106) · 0 sabe e
  não conta · 60 ninguém decide. O #29 ("como o teu amigo se feriu desse jeito?") fica: é a
  ferida de agora, na cena, e o sistema só decide a cicatriz do retrato.
- **para quem joga:** perguntar por alguém tem resposta — a idade que o retrato mostra, o
  passado neste mundo, porque está naquele posto, onde anda a esta hora, quem trabalha na
  casa — e a mesma amanhã.

## 29/09 21:10 · v9.318 · MM12 · a cidade por dentro · commit `f950165`

- **por que andou:** a sonda deixou nove perguntas sobre a cidade que ninguém decidia —
  a língua, o preço do pouso, quem estuda magia, a gíria, o distintivo, o sino, a rua
  vigiada — e o Narrador inventava cada vez uma coisa. O segundo maior bloco das que
  ninguém decide, e o único sem dono.
- **estado inicial:** verde (`cd309db` no ar).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
  O App cresceu 14 linhas; endereços de `acoes-do-jogador` re-medidos por conteúdo.
- **backend:** `src/cidade-por-dentro.js` — a ficha de cada cidade **por semente, sem
  campo de save**: a língua da rua e quem fala a comum (as cidades de fronteira entendem a
  vizinha), o pouso (quarto comum, bom, estábulo, a semana que paga seis noites), as
  instituições (magia, cura, lei), a vigilância de dia e de noite e a brecha, o
  reconhecimento, o costume com o que se dá, a gíria (o apelido dos vizinhos pelo mapa, o
  de um ofício, uma expressão) e **o hoje** (festa, luto, feira, o sino da hora). **O
  preço do pouso não é uma segunda economia**: as faixas já viviam no `ECONOMIA_PROMPT`, e a
  suíte relê-o para provar que a ficha não sai delas. Duas secções novas na pauta: "A
  CIDADE" (prio 7: o hoje e a língua, sempre) e "PERGUNTOU" (prio 4: só a resposta ao que
  a frase perguntou; na 3 tirava da pauta o próprio taverneiro a quem se perguntou).
- **o teto:** numa taverna cheia de verdade, com a pergunta do preço, a pauta dá 1316/1400
  e ficam QUEM, ONDE, a fala, o momento e o veto. Para caber, a linha do comércio perdeu
  106 caracteres que o cabeçalho da pauta já dizia ("isto é FATO do mundo…") — médio, com
  o motivo no código.
- **frontend:** a chamada em `pautaDoTurno`, só na cidade (fora de jornada, masmorra e
  luta), com os mesmos argumentos que `locaisDaCidade` usa — os prédios têm o mesmo nome.
- **a prova jogada:** Sal Velho, capital. "Quanto custa a diária?" → o taverneiro: "quarto
  comum, seis ferros; bom, quinze; uma semana, trinta e seis; no estábulo, dois por bicho".
  `fichaDaCidade` em Node, com a semente do save: **6, 15, 2, 36 — número a número**. "Há
  quem estude magia?" → "duas escolas de sopro, rivais… os livros ficam no Quarto dos
  Nomes" — a ficha, palavra por palavra no que importa.
- **a sonda:** **72 → 81/157 chega** (#6, #14, #15, #31, #37, #38, #70, #107, #110) · 0
  sabe e não conta · 68 ninguém decide. O #80 ("ela me dá isso de graça?") **fica**: o
  costume da cidade não é a decisão daquela pessoa sobre aquele item. O #110 teve o fato
  reescrito para o que a pergunta pede ("o que o sino da cidade marca agora").
- **para quem joga:** perguntar pela cidade passa a ter resposta — e a mesma amanhã. O
  preço da noite não muda de uma pergunta para a outra, e cada cidade tem o seu sino.

## 29/09 21:03 · v9.317 · o arqueiro mira pela cabeça que tem · commit `cd309db`

- **por que andou:** a pergunta que este diário deixou em v9.316 (o grupo a +39% contra o
  "antes" sem pilha) foi decidida pelo coordenador da fase com uma lei da pessoa, de
  setembro: **a tabela de intenções por nível de inteligência** — o arqueiro astuto ou
  acima mira no mais frágil; o animal ou bruto, no mais perto ou em quem o feriu.
- **estado inicial:** verde (`f17e60f`, `d3268a0`). Em paralelo, noutra mão e noutros
  arquivos, a MM12.
- **o que havia:** nenhuma escolha de alvo por degrau, nem para quem luta de perto. Sem
  intenção do bando, **um sorteio de 35%** mandava o tiro a um companheiro ao acaso — era
  isso o +39%. E "quem me feriu" só existia como leitura: nada o escrevia.
- **backend:** a coluna `mira` em `DEGRAUS` — bruto e animal: quem me feriu, senão o mais
  perto; astuto e treinado: o mais frágil; brilhante: quem conjura, quem cura, o mais
  frágil. **"O mais frágil" é quem cai com menos golpes** (a vida a dividir pela chance de
  ser acertado, com defesa e cobertura) — pela vida sozinha, o astuto ia no guerreiro já
  gasto; assim vai no mago de túnica. As duas prioridades entram na tabela que já existia
  (`PRIORIDADES`), só com quem está à vista (MM6). Só quem dispara usa a mira, e só quando o
  bando não deu um alvo com nome; o sorteio sai e não há sorte nenhuma.
- **medido (140 lutas, contra o "antes" sem pilha, que passou a ser o do retrato):** dupla
  −7,4%; conjurador **+19,3%** (a margem de sempre); bando: herói −0,6%, grupo +2,6%, total
  +0,3%. Paredes: 0 travas, 0 sobreposições, pior planta a floresta +9,3% (nova catraca).
- **a decisão que fica pendente — levada ao coordenador, não tomada por mim:** o App ainda
  não escreve `feridoPor`. Ligado, o bruto dispara só no herói (é quem mais o fere, no
  golpe de oportunidade do recuo) e **o grupo do bando cai a −30,8%**: a catraca de ±20%
  acende. Não se alargou limite nenhum: o retrato mede o jogo como está ligado, e as
  linhas com `feridoPor`, do astuto (grupo 19,78, total +24%) e do brilhante ficam
  escritas como registo. O §14 prova em unidade que "quem me feriu" funciona.
- **decisões médias tomadas:**
  - **Medir o jogo que existe** em vez de ligar `feridoPor` e pedir o limite alargado.
  - **Os lutadores de perto ficam como estavam**: dar-lhes mira mexe na régua de Uma Vida
    (sem grade, todos alcançam todos) e pede medida própria.
- **para quem joga:** o arqueiro deixa de atirar ao acaso; um bruto atira no que tem à
  frente, um esperto no mago. Hoje nenhum arqueiro do bestiário é astuto — mas os que o
  Narrador inventa "competentes" são.

## 29/09 20:08 · v9.316 · ninguém termina na casa de outro (e o "Golpe consagrado") · commit `f17e60f`

- **por que andou:** promovido pelo coordenador da fase, com o motivo que este diário deu:
  **desde o MM2 as posições são verdade contada ao Narrador**, e três soldados na mesma
  casa é o sistema a dizer ao Mestre uma coisa impossível.
- **estado inicial:** verde (`af1b489`, `cb96d7d`). A mesma mão `backend` das paredes,
  retomada — já tinha a bateria na cabeça.
- **backend:** `moverInimigos` passa a ver a casa nova de quem já andou no mesmo turno (a
  ordem é a da lista do combate, logo determinística); criatura grande ocupa as suas quatro
  casas; quem caiu não ocupa. Vale para o atirador e para o grupo do jogador.
- **o tamanho do defeito:** na bateria (10 plantas × 5 lutas × 4 jogadores × 30), **7390 de
  42 937 rodadas — 17% — acabavam com dois corpos na mesma casa**, em todas as plantas.
  Agora 0, e o 0 é catraca (também medido ao vivo, 1600 lutas).
- **o equilíbrio:** o dano ao herói mexe no máximo 1,2% por planta (masmorra); vitórias
  iguais; travas 0. A maior luta isolada: masmorra, bando, +5,9%.
- **a margem do conjurador do MM7 aguentou sem mexer: +19,3%** (nessa luta há um só corpo
  de perto; nunca empilhava).
- **um achado de equilíbrio, não da pilha — para a pauta:** o "antes" do bando do MM7 também
  empilhava. Remedido sem a pilha, **o herói fica a −8,9% e o grupo a +39%**: os atiradores
  do MM7 espalham os tiros pelo grupo. O total do bando mexe +3,6%. Mantive o "antes" gravado
  (a asserção do grupo mede contra ele, +6,8%) e escrevi as duas contas no retrato; a pergunta
  — o arqueiro que mira no mais frágil é o que se quer? — foi para "Aberto".
- **o "Golpe consagrado":** a lâmina é que é consagrada, e o golpe fere com luz; o portador de
  bênção passa a ler só o verbo ("consagra o chão"). **O mesmo defeito estava no jogador**: o
  "Golpe Consagrado" do Paladino abençoava o grupo a cada ataque, sem a ficha o prometer —
  deixa de o fazer. E "silencioso" caía em atordoar antes de furtividade: Passos
  Silenciosos, Bote Silencioso e Toque do Fim passam a dar furtividade a quem os usa; o
  "Silêncio" (magia) e "Silêncio Que Grita", que nunca faziam nada por causa do acento, passam
  a atordoar. 7 mudanças, nomeadas em `teste-afl`.
- **decisões médias tomadas:**
  - **O "antes" do bando fica o gravado**, com as duas contas escritas: trocá-lo mudava o que
    a catraca mede no meio de uma etapa que não era sobre isso.
  - **O Paladino perde a bênção que o nome prometia e a ficha não** — é a correção, não um
    nerf; está no diário para quem sentir a diferença.
- **para quem joga:** o Mestre deixa de receber (e de narrar) inimigos uns em cima dos
  outros; o Paladino deixa de abençoar o grupo a cada golpe; os golpes silenciosos escondem
  quem os dá. A sonda não se move (72/157).

## 29/09 19:43 · v9.315 · o convite para o grupo anda: era o caso geral · commit `af1b489`

- **por que andou:** promovido pelo coordenador da fase — *se nunca abrir, nenhum
  companheiro novo entra no grupo*. A primeira pergunta era se é o caso geral ou de canto.
- **a resposta: geral.** O convite **nunca andava para ninguém conhecido na sessão, em
  nenhuma campanha**. O App manda o dia do encontro em oito sítios, mas `criarNPC`
  (`npcs.js`) montava a ficha campo a campo e **descartava o `conhecidoEm`**, e
  `mesclarNPC` também não o copiava: `dias = hoje − hoje = 0` para sempre. O "mais 5 dias"
  da prova jogada era `max(1, 5 − 0)`. Ao recarregar, a blindagem do load dava 0 a todos e o
  convívio saltava para a campanha inteira. No mesmo defeito: a etapa de missão
  "falar com" não fechava na sessão, e os propósitos secretos nunca amadureciam.
  (A mão anterior tinha dito que o `conhecidoEm` "nunca era escrito"; era escrito e deitado
  fora. Certo o sintoma, errado o sítio.)
- **o segundo defeito, também geral — a promessa mentia:** "mais 5", depois "mais 1", "mais
  1"… Numa varredura de 1500 pessoas, **só 5,2% das promessas de dias viravam "sim" no dia
  prometido**, e metade vinha de quem nunca aceitaria só com tempo. Agora a promessa é o
  número exato de dias que leva ao "sim" (100% cumprem-se), e quem nem com o teto de dias
  aceitaria recebe a condição nova **"um laço de verdade com você — só estrada não basta"**.
  Comparado com HEAD em 1 116 000 casos: nenhuma resposta nem "porquê" diferente; só o texto.
- **o terceiro, no App — o laço nunca contava:** `convivioCom` lia `n.forcaDoLaco`, um campo
  que a ficha nunca tem; o laço valia 0 no convite para sempre. Passou a `garantirLaco`, como
  o resto do App. `primeiraVez` tratava o dia 0 como "nunca vi" (quem veio de save antigo
  era estranho para sempre). E a recusa de pagar distingue tempo de laço.
- **os números (1500 pessoas, sem laço, fama 0):** aceitam 1,7% no dia 0, 3,3% ao 5.º, 10,7%
  ao 10.º, 54,3% ao 20.º; com laço 2 e fama 30, 48,5% ao 5.º. 5% nunca aceitam só com tempo
  (72 de 75 são medrosos) — é desenho, não se mexeu.
- **a prova jogada:** Gareth, conhecido no dia 1: no dia 6 pedia "mais 9 dias", no dia 7
  "mais 8" — **desce um por dia**, o contrário do defeito. O convite mostrou "quer mais 8 dias
  de estrada" e o Narrador disse "me dá mais oito dias de estrada juntos". O "sim" não foi
  jogado (mais oito dias de chamadas pagas); a suíte prova que toda promessa se cumpre.
- **decisões médias tomadas:**
  - **A condição `laco` nova** em vez de deixar a promessa mentir — a soleira já a mostra
    (lê o texto da exigência); o botão de pagar continua só para o que se paga.
  - **O "desenho" ficou:** os medrosos que só com tempo não vêm, e o teto de 20 dias.
- **para quem joga:** o grupo passa a poder crescer. Quem convida alguém ouve quantos dias
  faltam, e o número desce a cada dia até ao sim — ou ouve que é preciso um laço.

## 29/09 19:12 · v9.314 · nenhuma luta trava atrás de uma parede (e o "assombrado") · commit `cc126b9`

- **por que andou:** promovido pelo coordenador da fase, com o critério *numa sessão à
  Matt, o que parte a sessão vem antes do que a enriquece*: uma luta que não pode acabar é
  o jogo parado.
- **estado inicial:** verde (MM3b no ar, `92158be`, `d32bc54`). Duas mãos `backend` em
  paralelo, em arquivos separados (esta e a do convite), cada uma provada com o seu
  `so-o-meu.sh`.
- **o diagnóstico:** `moverInimigos` era busca gulosa em linha reta — topo falso: na
  taverna, de um lado e do outro do balcão, a volta tem 7 casas e o passo 6, e nenhuma casa
  ao alcance fica mais perto em linha reta, logo ninguém se mexe (seis pares de posições
  presos na taverna, quatro no beco). **E move também o grupo do jogador**, pela mesma
  função. Segunda causa: "já alcança" não pedia linha de visão — o ogro de 3 m colado a um
  muro, com o herói do outro lado, ficava parado para sempre, e `alcanca` não o deixava
  bater. O mesmo no atirador que procura ver.
- **backend:** `passoAteAlcancar` — um mapa de passos (BFS) a partir das casas de onde se
  alcança o alvo (distância **e** linha de visão), contornando paredes e respeitando o
  tamanho; do que o passo cobre nesta rodada, a casa com menos passos. Em campo aberto,
  idêntica à antiga em mais de 3000 passos. A sonda de MM7 passou a ler esta função em vez
  de ter a sua.
- **a prova (10 plantas × 5 lutas × 4 jogadores × 30):** taverna, lutador, com o
  companheiro a andar: **30/30 lutas travadas → 0**. **Travas depois: 0 em todas as
  plantas.** Os empates que sobram são de desenho (o herói que fica parado contra quem o
  alcança de mais longe) e estão numa tabela com o motivo. Balanço dentro de ±10% em todas
  as plantas; duas lutas isoladas passam, e nenhuma é trava (a ruína com conjurador, −25%:
  antes o soldado ficava preso do lado errado do muro e o herói dava a volta debaixo de
  fogo).
- **catracas movidas, com o motivo:** o retrato do MM7 (o "depois" +2 a 3%; o conjurador
  fica a +19,3% do antes, com o limite em 20% — **margem curta, anotada**); a amostra viva
  do MM7 de 40 para 70 lutas (as plantas rodam de sete em sete, e 40 não fecha a volta).
- **o "assombrado":** os portadores de `aflicoes.js` passam a casar só no começo de palavra
  (`(?<!\p{L})`, porque o `\b` do JavaScript não conhece "é" nem "ç"). Num acervo de 716
  golpes e habilidades, **36 mudaram de portador**, revistos um a um: Sussurro assombrado,
  de inspirar o bando a aterrorizar; Emaranhar, de veneno a prender; os seis "Chamado", os
  três "Coração", as três "Cobrança", "Disparo Calibrado", "Adivinhação", "O Bosque Acorda"
  deixam de ganhar fogo, oração, cobra, brado, vinha, corda.
- **achados para "Aberto":** os inimigos empilham na mesma casa (a ocupação é a de antes
  do turno); "Golpe consagrado" abençoa o bando do monstro (é o nome, não um pedaço).
- **para quem joga:** nenhuma luta fica presa atrás de um balcão, e os golpes deixam de
  fazer coisas que o nome não diz.

## 29/09 18:16 · v9.313 · MM3b · o golpe final é do grupo · commit `92158be`

- **por que andou:** decisão do coordenador da fase, pela liberdade da ordem de 28/09,
  sobre a questão que este diário deixou na etapa da peneira: nas provas jogadas, o
  companheiro com mais iniciativa acabava os inimigos e o momento do MM3 nunca chegava ao
  jogador. **O golpe final é do grupo**: quando é um companheiro a derrubar, o cartão
  aparece e o jogador narra como o companheiro o faz — como o Matt dá o momento a quem fez
  o golpe. Os companheiros **não** passam a evitar o último golpe: pioraria as lutas para
  enfeitar um momento.
- **estado inicial:** verde (MM7 no ar, `32dbb8b`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com este commit.
- **frontend:** `quedasComEscolhaNaRodada` (pura, em `golpe-final.js`, provada em Node)
  simula a rodada dos companheiros golpe a golpe sem aplicar nada e marca a primeira queda
  de cada alvo com escolha de verdade — o corpo antes do golpe, o defeito do MM3 não volta.
  Com "perguntar", **a rodada suspende como a janela da reação (K3)** e o mesmo cartão
  lista as quedas ("Bram derruba o Bandido.") com "Como Bram faz isso?"; a resposta aplica
  a escolha e só então o envelope da rodada sai, com o nome do companheiro no envelope. Uma
  escolha por rodada. **O ☠ só sai depois da escolha.** Se a rodada estourar depois de
  escolher, a cena é entregue na mesma. Com "sempre matar/poupar", byte a byte o de antes.
- **o golpe de oportunidade do herói ficou de fora** (MM3c, na pauta): acontece antes da
  janela da reação, com saídas próprias; juntá-lo pedia uma segunda suspensão coordenada
  com esta, em código delicado. Preferi o seguro e a dívida escrita.
- **A PROVA DO POUPAR, PAGA:** herói de teste, luta aberta pela frase, e no golpe que levou
  Nádia do Ouro a 0 **o cartão apareceu**; cena escrita, **Poupar** → "Kael → Nádia do Ouro:
  7 de dano · 0/4 (poupado)", "Todos os inimigos caíram", sem ☠, e o Narrador narrou a cena
  sem a matar ("o corpo dela tomba de lado, imóvel"). O despertar não foi visto (Q4 não
  está feita). **O golpe do companheiro não foi jogado**: não houve companheiro no grupo.
- **um achado corrigido antes de entrar na pauta:** a mão atribuiu a falta de companheiro a
  um `conhecidoEm` "nunca escrito" e abriu uma tarefa com isso. É falso — o App escreve-o
  em vários sítios; ela só procurou nos módulos. Retirei a tarefa. O sintoma é real (o
  convite não andou em 8 dias de jogo) e foi para "Aberto" com a descrição certa.
- **decisões médias tomadas:**
  - **Uma escolha e um cartão por rodada**, como no MM3 uma por sequência.
  - **"Como isso acontece?"** quando caem por mãos diferentes na mesma rodada.
  - **Edit com âncora em vez de `.cjs`** para código cheio de `${}` e crases: a mesma
    garantia de falhar se não bate, sem a armadilha do template-literal.
- **para quem joga:** o momento do golpe final deixa de depender de quem tem mais
  iniciativa. A sonda não se move (72/157).

## 29/09 16:45 · v9.312 · MM7 · os atiradores atiram · commit `32dbb8b`

- **por que andou:** achado da fuga (v9.294) — o inimigo de distância era atirador na fuga
  e lutador colado dentro da luta. Pior: o Atirador do bestiário andava até ficar colado e
  "atirava" Rasteira e Marretada, porque o alcance de 36 m só valia para invocações.
- **estado inicial:** verde (`c06d904` no ar).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com
  este commit. Endereços de `acoes-do-jogador` re-medidos por conteúdo, com o motivo.
- **backend:** `src/atirador.js` (a tabela `QUEM_ATACA_DE_LONGE` saiu de `fuga.js` para
  não criar ciclo de imports); `postoDoAtirador` — vê o herói, a ≤ 9 m, preferindo
  cobertura; nunca termina colado; colado, recua um passo. O disparo em `turnoDosInimigos`
  paga a mesma penalidade por faixa que o arco do herói; colado a um hostil, desvantagem;
  herói escondido, dispara noutro visível ou às cegas. Golpes de distância com nome de
  distância (`golpeDeLonge`). A voz da intenção do atirador (`VOZ_DE_QUEM_ATIRA`): o
  Narrador não ouve "vem para cima de você" de quem fica atrás.
- **medido antes de mudar (140 lutas por cenário, antes sobre a árvore de HEAD):** dano ao
  herói dupla 13,0 → 11,6 (−11%), conjurador 10,6 → 12,0 (+13%), bando 16,4 → 13,7 (−16%);
  vitórias iguais. O posto a 12 m deixava o atirador mais fraco do que o lutador colado
  que era (−22%, −30%); a faixa sem custo (7,5 m ideal) acertou-o. **Sem o golpe de
  oportunidade no recuo, o conjurador ia a +29%** — por isso a fiação era obrigatória.
- **frontend:** o golpe de oportunidade do herói em quem recua para disparar, num auxiliar
  comum às fugas e aos recuos (`golpeDeOportunidadeDoHeroi`, a mesma conta, byte a byte,
  no ramo das fugas); "recua" em vez de "avança" na linha do passo. O cartão do golpe
  final **não** se levanta no golpe de oportunidade — nem hoje na fuga; é tema de MM3b.
- **um acidente, e como se pagou:** a mão `frontend` sobrescreveu a suíte do backend, ainda
  não commitada. O backend reescreveu-a com toda a cobertura, preservando a secção de
  fiação da frontend. Duas mãos, um arquivo novo sem commit: é o bastão do `App.jsx` em
  pequeno, e vale a mesma regra — quem escreve um arquivo que não fez, lê-o antes.
- **a prova jogada:** um homem com arco numa clareira sumiu antes da luta; nenhuma luta
  contra atirador apareceu no orçamento de chamadas. Provado pela suíte e pela simulação.
  **O Poupar continua sem prova jogada** — MM3b, a seguir, aumenta a chance de o ver.
- **achados para "Aberto":** "Sussurro assombrado" inspira o bando ("assombrado" contém
  "brado"); `moverInimigos` trava atrás de paredes; o herói colado que atira não paga, e há
  duas regras para o mesmo arco (fuga e luta).
- **as horas deste diário, corrigidas:** os cabeçalhos de v9.304 a v9.311 levavam horas
  que eu escrevi de cabeça e não batiam com o relógio (até cinco horas à frente). Passam
  a ser a hora do commit de cada etapa (`git log`), e as horas de bastão que eu não
  tinha medido saíram. Um diário que a pessoa audita não pode ter hora inventada.
- **decisões médias tomadas:**
  - **O atirador fica na faixa sem custo** (≤ 9 m), não no limite: medido, é o único posto
    em que ele não fica mais fraco do que o lutador que era.
  - **Sem glifo novo** para o disparo (🏹): o teto de emoji é do desenho; pedido a ele.
- **para quem joga:** o arqueiro fica atrás, dispara, e recua se o herói se cola — e leva o
  golpe ao recuar. Fechar distância ou procurar cobertura passa a ser a decisão da luta.

## 29/09 15:27 · v9.311 · "escondo-me" esconde: a ênclise no catálogo · commit `c06d904`

- **por que andou:** item de "Aberto" promovido pelo coordenador — o mesmo defeito da
  peneira da agressão, agora no catálogo de desafios, que foi todo escrito em próclise.
- **estado inicial:** verde (MM6 no ar, `b4ca492`, `98d4e80`).
- **backend:** duas causas. (1) o catálogo só conhecia "me escondo"; nem "tento me
  esconder" casava. (2) **o catálogo era a única porta que age pelo jogador sem passar
  pela peneira** — no ar, "posso me esgueirar até a porta?" e "não me escondo" rolavam
  Furtividade. `emProclise` e a tabela `ENCLISE` em `peneira.js` desfazem a ênclise sem
  mudar o tamanho da frase — o reflexivo e o "lhe" para antes do verbo, o objeto para
  depois, que é como o catálogo escreve quem sofre a ação —, e `lerAcao` passa a ler só
  o que o herói declarou. Seis desafios cuja pergunta é o próprio gesto (investigar,
  heráldica, arcano…) continuam a ler tudo: "de quem é esse brasão?" rola. A agressão não
  passa pela troca (já lê a ênclise): veredito idêntico em 11 709 frases.
- **corpus:** 63 frases, 100% (44 pares ênclise/próclise, 19 que não podem rolar), mais 21
  hífens que não são ênclise (guarda-roupa, pé-de-cabra, corpo-a-corpo) intactos.
- **decisões médias tomadas:**
  - **Três jeitos novos de se esconder** (misturar-se na multidão, aproximar-se sem ruído,
    agachar-se atrás de algo): o item citava-os e nem a próclise deles casava.
  - **Cinco alternativas que nunca casaram** ("convenço", "calço a placa", "trenó",
    "encalço"): a frase chega sem acento e a regra tinha a letra acentuada solta. "Convenço
    ele" nunca tinha sido Persuasão.
  - **O "se" depois de preposição deixou de ser condição** na peneira ("convencer o guarda
    a se matar por mim").
- **orquestrador:** a suíte de MM6 falhava no HEAD puro (o `so-o-meu.sh` tira a árvore
  por `git archive`, que com `core.autocrlf` traz o App.jsx em CRLF, e as âncoras de
  várias linhas só casavam em LF). Normalizado o fim de linha na leitura, com o motivo.
  Era defeito meu, da etapa anterior.
- **achado:** "empurro o guarda contra a parede" rola Atletismo em vez de disputa — juntou-se
  ao item do dado improvisado dentro da luta, que é quem liga `disputa.js`.
- **para quem joga:** "escondo-me", "esgueiro-me", "equilibro-me", "tento esconder-me" fazem
  o que dizem; "posso esconder-me?" e "não me escondo" deixam de rolar. A sonda não se
  move (72/157).

## 29/09 15:01 · v9.310 · MM6 · escondido é um estado · commit `b4ca492`

- **por que andou:** o teste de furtividade existia e o estado não — no turno seguinte
  nada lembrava que o herói estava escondido, e o Narrador não sabia quem o via. É a
  resposta a *"o anão está me vendo?"*.
- **estado inicial:** verde (a peneira no ar, `28f788c`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido com
  este commit. O `App.jsx` cresceu 122 linhas; os endereços de `acoes-do-jogador` foram
  re-medidos pelo próprio varredor e conferidos à mão, com o motivo.
- **backend:** `src/escondido.js` e a condição `escondido` em `condicoes.js` — viaja no
  save por `pers.condicoes` (três campos novos e aditivos), cai ao atacar ou conjurar pelo
  `romperPorGatilho` que já existia (o molde da invisibilidade de v9.45) e no descanso.
  Nasce de uma furtividade passada — na luta, só com cobertura ou sem linha de visão.
  Acaba ao revelar-se (voz, luz, correr para o aberto — a frase passa pela peneira: "posso
  gritar?" não revela) ou ao ser achado (Percepção passiva acima do total, linha de visão
  sem cobertura, procura que bate o total). Dá vantagem contra quem não viu, e quem não
  achou ataca com desvantagem.
- **o furtivo, medido antes de mudar:** hoje o Ladino somava-o em 100% dos golpes, por
  classe. Pela regra do 5e (vantagem, ou aliado a 1,5 m do alvo, nunca com desvantagem):
  com grupo quase nada muda (−1,8% no justo); **sozinho, −21% de dano e a vitória de 91% a
  61%**. Passou do limite, e a compensação é do próprio 5e: **Ação Ardilosa** (esconder-se
  com a ação bônus, nível 2+) — sozinho fica −5% e 84% de vitória; com grupo, +4,6%. A
  suíte trava cada modo entre −12% e +20% do antes. O Ladino passa a jogar diferente
  (esconde-se, flanqueia), não pior.
- **frontend:** onze pontos de fiação (nasce depois do teste, cobra a ação bônus na luta,
  vantagem e furtivo no golpe, a linha do furtivo ao Narrador, cai por ato, é achado no
  revide, "quem me vê" na linha da luta, `naoPode` fora dela); o golpe de oportunidade e o
  contra-ataque da reação passam pelo mesmo veredito do furtivo.
- **dois defeitos achados a jogar, e consertados:** (1) o veredito do desafio não tem
  `alvo`, tem `alvoDoCusto` — o estado nunca nascia; (2) **um defeito antigo**: o ramo da
  declaração livre em `agirInterno` usava `let persG = personagem`, a ficha do render,
  capturada antes de qualquer `mudarFicha` do mesmo turno — o jogo dizia "escondido cai" e
  o save guardava-o vivo. Passou a `fichaViva() || personagem`, como no resto do arquivo,
  com asserção que o trava. Vale para toda mudança de ficha feita no começo desse ramo.
- **a prova jogada (Ladina de teste, save apagado no fim):** "Eu me escondo atrás de uma
  árvore" → 15 contra 15 → "🌠 Você está escondido (furtividade 15)", a condição no save; a
  mulher da porta ouviu o barulho (o oráculo) e nunca se dirigiu a ela; "Berro por
  socorro!" → "✧ Escondido cai — você levantou a voz", confirmado no save. A luta não
  apareceu (o hostil não era gente registrada), por isso vantagem e furtivo em combate
  ficam provados pela suíte e pela simulação de 140 lutas, não jogados. **O Poupar de MM3
  continua sem prova jogada.**
- **achado:** "escondo-me" não casa o catálogo (só "me escondo") — a ênclise outra vez,
  agora no catálogo de desafios. Para "Aberto", leve.
- **pedido ao desenho, para quando a fila dele voltar:** a linha de nascimento usa 🌠
  (o glifo "a favor"); um glifo próprio para "escondido" é decisão de `glifos.js`.
- **decisões médias tomadas:**
  - **O estado é uma condição**, não um campo novo: save, pauta e queda vêm de graça.
  - **Empate na passiva fica com o herói**; na procura ativa, com quem procura.
  - **O contra-ataque da reação** só teve o dano passado pelo veredito; o acerto dele não
    lia vantagem antes e continua a não ler.
- **a sonda:** **69 → 72/157 chega** (#74 quem me vê, #124 o flanco, #153 caído e escondido)
  · 0 sabe e não conta · 77 ninguém decide. O #70 ("a rua é vigiada?") é da MM12.
- **para quem joga:** esconder-se passa a durar e a valer — vantagem no primeiro golpe, o
  mundo não reage a quem não viu —, e o Ladino ganha um motivo para se esconder a cada
  turno em vez de somar o furtivo sem pensar.

## 29/09 13:26 · v9.309 · a peneira da agressão: a ênclise abre a luta, a pergunta não · commit `28f788c`

- **por que andou, antes de MM6:** o coordenador da fase promoveu o item de "Aberto".
  "Socá-lo", "ataco-o", "golpeio-a" são a forma normal de um brasileiro escrever que
  bate em alguém: uma mesa à Matt em que o ataque declarado não abre a luta falha no
  primeiro minuto da primeira briga. E o avesso — "posso atacar o guarda?" abrir uma
  luta — pune quem pergunta, que é o que a própria `agressao.js` diz que não pode.
- **estado inicial:** verde (MM5 no ar, `d2688b4`, `7ef0124`).
- **bastão:** tomado em nome deste ciclo para a mão `frontend`; devolvido
  com este commit.
- **as duas causas:** `RX_AGRESSAO` só conhecia a primeira pessoa do presente; e
  `NAO_E_AGRESSAO` não tinha trava de pergunta, lendo o texto inteiro de uma vez. Medido,
  a mordida era pior do que a pauta sabia: "desço a escada até o salão", "corto o pão",
  "chuto a porta", "acerto a conta com o taverneiro", "levo um soco no queixo", "não
  ataco o guarda" — todas davam ataque.
- **backend:** `src/peneira.js` (novo) — **uma peneira só** para a agressão e o
  improviso de MM4 (o `desafios.js` perdeu as cinco travas que duplicava): lê oração a
  oração (`soODeclarado`), apaga pergunta, licença, hipótese, condição, negação, passado,
  figura e fala; "Posso? Ataco o guarda." é ataque, "Ataco o guarda. Posso?" não.
  `VERBOS_DE_GOLPE` (os que batem sozinhos e os que só batem com alguém do outro lado,
  `QUEM_APANHA`), com ênclise, mesóclise, próclise e "lhe". O alvo do pronome: o último
  citado entre os presentes; senão o único hostil; senão não abre — nunca por eliminação.
- **frontend:** o golpe em combate (`resolverAtaqueJogador`) tinha o mesmo defeito na sua
  própria regex; passou a pedir o veredito à peneira, sem perder nenhum verbo que já
  atacava. Uma pergunta em combate volta a ir ao Narrador sem gastar a ação. `lerAgressao`
  recebe as quatro últimas falas da mesa (`mensagensRef`, nenhum estado novo). Endereços
  de `acoes-do-jogador` re-medidos um a um, com o motivo.
- **o corpus:** 135 frases, 100% (64 abrem, 71 não). Fora dele, numa varredura de 94, fica
  um erro que não se consertou: "sento-lhe o braço" (gíria; pôr "braço" na lista morderia
  "dou-lhe a mão"). Nenhuma asserção antiga mudou de veredito.
- **a prova jogada:** "Posso atacar Corwin?" → o Mestre respondeu "Não", e nenhuma luta
  abriu. "Saco minha espada e avanço para atacá-la" → "você parte para cima de Cora — o
  combate está aberto": a ênclise e o alvo pelo pronome (a última citada), vivos. "Saco a
  espada e ataco-o" resolveu para o companheiro Bram, e o sistema recusou por ser do grupo.
- **o Poupar de MM3, ainda aberto — e porquê desta vez:** houve lutas, mas nunca foi o
  golpe do herói a derrubar: o alvo fugia antes, ou o companheiro, com iniciativa mais
  alta, acabava o inimigo primeiro. Não se forçou com injeção. Fica para MM11, e fica um
  achado de desenho de jogo: **o golpe final só é do jogador quando é o golpe dele** — um
  companheiro que finaliza por conta própria rouba o momento. Vale pensar em Q2/MM11.
- **decisões médias tomadas:**
  - **"golpeá-lo-ia" não morde:** o condicional é hipótese, e hipótese é da peneira.
  - **'Digo: "vou te socar"' é fala, não ato** — a ameaça tem casa na intimidação.
  - **Duas listas de "alguém"** (`UM_SER` em desafios.js e `QUEM_APANHA`) ficam por agora,
    para não mexer no improviso; unificar é trabalho leve para depois.
- **para quem joga:** "acerto-lhe um soco", "ataco-o", "avanço para socá-lo" abrem a luta;
  "posso atacar?" é respondido como pergunta, fora e dentro da luta. A sonda não se move
  (69/157). *(Correção: no relato ao coordenador de MM4/MM5 escrevi "70"; o número
  certo sempre foi 69 — 68 depois de MM2, 69 depois de MM4, e o diário já o dizia.)*

## 29/09 12:10 · v9.308 · MM5 · o sucesso com preço · commit `d2688b4`

- **por que andou:** a etapa que lê o dado que MM4 deu a toda ação. *A Aposta*
  preparava duas versões; o Matt usa três — na runa de C1E1, um 15 é "recuas a
  tempo, mas levas 8".
- **estado inicial:** verde (MM4 no ar, `263b4b6`).
- **bastão:** tomado às 11:48 em nome deste ciclo para a mão `frontend`; quatro
  linhas reescritas no lugar (24 689 linhas antes e depois); devolvido com este commit.
- **o "por pouco" de antes:** existia só de um lado — falhar por 1–2 em 17 linhas de
  `CUSTO_DE_FALHAR` virava "consigo, pagando"; passar por 0 saía de graça. O degrau era
  torto (falhar por 1 custava, passar por 0 não) e havia dois defeitos: um 1 natural
  a 1–2 da CD virava sucesso pago, e uma busca vazia falhada por pouco ouvia "você
  acha, mas…" colado a "aqui não há nada".
- **backend:** `FAIXAS_DA_MARGEM` — +2 ou mais limpo; 0/+1 "consegue, mas…"; −1/−2 "por
  um fio — e paga"; −3 ou menos falha. O meio são sempre 4 faces em 20 (20%, 10% de cada
  lado) para qualquer CD − bônus entre 4 e 18; no caso típico (CD 13 contra +3), limpo
  45% · mas 10% · quase 10% · falha 35%. É o *Success at a Cost* do DMG 5e (2014, cap. 8,
  p. 242), que a casa já seguia do lado de baixo, espelhado. O preço do meio sai de
  tabela e **o sistema cobra-o**: barulho (vira a pergunta ao oráculo), mordida por
  degrau da CD (`MORDIDA_POR_DEGRAU`: 1d4 até comum … 1d10 heroico, por semente),
  condição, tempo. Sem meio: a luta, o que só revela informação, a busca vazia, a
  conversa. *A Aposta*: 25 das 40 situações ganham a terceira linha; é a primeira a
  cair numa pauta cheia (1365 → 1365 chars).
- **frontend:** `concluirRolagem` chama `desfechoDaMargem` com `critico` e `desastre`;
  o envelope do teste leva o `meio` e o custo não vai duas vezes ao Narrador (a queda
  `envQueda` preservada no sim pago); a `mesa` leva `noMeio`. **Achado e consertado:**
  o código antigo nunca passava `desastre` ao custo, e um 1 natural podia sair "sim pago".
- **a prova jogada (campanha de teste criada pela tela, apagada no fim):** "salto o
  chafariz entupido" → 🎯 Atletismo, dif. 15 → 14 contra 15, margem −1 → "Faltaram 1 — a
  mão alcança a beira e o resto do corpo bate contra ela", 1 de dano cobrado, e o
  Narrador narrou as duas metades sem promover nem rebaixar. MM4 e MM5 vistos no mesmo
  lance.
- **o Poupar de MM3, ainda aberto:** a mão seguiu um encapuzado até um beco e avançou
  para o socar; **a luta não abriu** — o soco virou acidente de cena. Parou aí, sem forçar.
  O achado vale mais do que a prova: "socá-lo" não é lido como agressão (a ênclise), e
  foi para "Aberto" junto do seu avesso ("posso atacar o guarda?" abre luta). A prova do
  Poupar fica para MM11.
- **decisões médias tomadas:**
  - **Uma faixa só, simétrica, 2 pontos de cada lado**: é a que dá 20% certo em toda CD
    e acaba com o degrau torto; um meio maior tirava peso ao dado.
  - **A mordida do difícil passou de 1d8 a 1d6** depois de a prova mostrar 8 de dano num
    herói de nível 1 por um *sim*.
  - **Asserções movidas com o motivo:** `teste-social` ("dano === 2" → um dado do
    degrau) e `teste-mm4-improviso` (as cinco famílias com meio; a Percepção sem).
- **para quem joga:** um resultado a um ou dois pontos da dificuldade deixa de ser tudo
  ou nada — consegue e paga, ou quase e paga, e o preço é real e visível. Uma em cada
  cinco rolagens fora da luta passa a ter esse meio.
- **a sonda:** não se move (69/157) — nenhuma das 157 perguntas era sobre o raspão.

## 29/09 11:29 · v9.307 · MM4 · toda ação ganha um dado · commit `263b4b6`

- **por que andou:** Fase MM, a etapa seguinte. O Matt nunca diz "isso não dá" nem
  decide de cabeça: escolhe o atributo, diz a CD e manda rolar. Aqui, a frase que
  o catálogo não conhecia virava ficção sem dado e o Narrador decidia sozinho.
- **estado inicial:** verde (MM3 no ar, `9cf6e16`; o mapa das perguntas, `d8e6fd7`).
- **bastão:** tomado por mim para uma linha em `concluirRolagem`
  (deslocamento zero); devolvido com este commit.
- **backend:** `FAMILIAS_DO_IMPROVISO` — seis famílias de verbo, uma por atributo
  da casa, com perícia quando a há; `CD_DO_IMPROVISO` — o degrau comum (13), e uma
  palavra de ousadia ("de costas", "no escuro", "com uma mão só") sobe a 15, sem
  acumular. `lerAcao` devolve o improviso com a mesma forma de um desafio do
  catálogo, por isso o App rola, mostra ("🎯 saltar do balcão para o lustre —
  dificuldade 13") e manda à pauta sem saber que ele existe. A peneira reusa as
  travas de `NAO_E_AGRESSAO` e estende-as: pergunta, hipótese, negação, passado,
  figura de linguagem, fala, rotina. Seis custos de falha `improviso_*`.
- **orquestrador:** a marca `gesto` passa de `concluirRolagem` a `envelopeDoTeste`:
  sem ela, o sucesso de um salto recebia "revele UMA coisa concreta" e o Narrador
  inventava um achado em cima do gesto. Com ela: "o que declarei ACONTECE, nem mais
  nem menos". Uma asserção por âncora prova a fiação.
- **o corpus:** 92 frases reais, 100%: 32 ganham dado, 49 não, 11 são do catálogo. A
  varredura de rotina achou 14 falsos positivos da primeira versão (o brinde, "ergo a
  espada em saudação", "salto da cama") e **três do catálogo antigo** — "levanto a
  caneca e brindo" rolava Atletismo contra 15, "vasculho a memória" virava revistar o
  lugar, "subo a escada até o quarto" virava escalar. Os 17 consertados e no corpus.
- **decisões médias tomadas:**
  - **Desligado em combate.** Um desafio rolado dentro da luta hoje não gasta a ação
    — o catálogo já tem esse furo com escalar e saltar; ligar o improviso lá alargava-o
    a quase toda frase. "Atiro a cadeira no bandido" já é ataque (com a arma
    equipada); "derrubo a mesa em cima dele" continua sem dado. Os três consertos que
    faltam para o ligar foram para "Aberto".
  - **A intimidação é da Força nesta casa**, e ficou no catálogo, não numa família de
    Presença: uma mesma ação não ganha duas regras.
  - **#33 conta, #102 não:** o "que teste é este?" responde-se declarando (v9.64,
    teste não se pede); o #102 pergunta antes de declarar e fica.
- **achado fora do escopo:** "posso atacar o guarda?" é lido como declaração de
  ataque e abre luta se o guarda estiver presente. Para "Aberto", leve.
- **a sonda:** **68 → 69/157 chega** · 0 sabe e não conta · 80 ninguém decide. Só o
  #33 mudou; #76, #78, #93, #102, #152 ficaram, cada um com o porquê na nota.
- **para quem joga:** fora da luta, toda ação que ele inventa — saltar para o lustre,
  lembrar o brasão, acalmar o cavalo — ganha um dado, um atributo e uma dificuldade
  ditos antes, e o resultado é o que o Mestre narra.
- **o que ficou:** MM5 (o sucesso com preço) lê a margem que este dado já produz. A
  prova jogada do Poupar (MM3) continua aberta: fica para a sessão jogada no fim de
  MM5, se houver luta.

## 29/09 10:52 · v9.306 · MM3 · o golpe final é seu (Q3 + Q5) · commit `9cf6e16`

- **por que andou:** a etapa que a pessoa aprovou há duas semanas (Q3 em 14/09,
  Q5 em 15/09) e o momento mais famoso do Critical Role — o *"how do you want to
  do this?"*. É o único instante em que o jogador **dirige** em vez de agir, e cai
  onde a emoção já está no pico; o sistema já decidiu tudo (o golpe acerta, o
  dano mata), por isso a prosa pode ser livre.
- **estado inicial:** verde, MM2 no ar (`98d6f63`).
- **bastão:** tomado às 09:26 pela mão `frontend` em nome deste ciclo; devolvido
  por ela ao fim da fiação; retomado às 10:29 para o conserto; devolvido às ~10:45.
- **backend:** `src/golpe-final.js` — `haEscolhaNoGolpe` (só há escolha quando o
  golpe leva um alvo vivo a 0, não em área, não em morte instantânea, não quando
  não fere), `decidirGolpeFinal` (perguntar · sempre matar · sempre poupar),
  `aplicarEscolha` (poupado = desacordado, vivo, fora da luta, acorda em 1d4 horas
  por semente; campos novos e aditivos no inimigo, nenhum campo de save mudou) e
  `envelopeDoGolpeFinal` (o fato em `acabou`, a cena do jogador em segunda linha,
  o "não pode morrer" do poupado em `naoPode`). Suíte com 100 asserções.
- **frontend:** `src/painel-golpe-final.jsx`, no mesmo sítio e com as mesmas peças
  do cartão da reação (K3) — uma decisão que suspende a luta não ganha segunda
  cara. "Como você faz isso?" com 240 caracteres; **Poupar — cai desacordado,
  vivo** / **Matar — não se levanta mais**, cada um aplicando de imediato (pular
  é um clique); "lembrar a minha escolha", e a troca das três na ficha, ao lado
  de "Quando um golpe chega". A preferência vive fora do save
  (`taverna_cfg_golpe_final`). `aplicarGolpeDoJogador` dividiu-se em três:
  pergunta, retoma (`continuarGolpeDoJogador`) e responde. O chat e a linha para
  o Mestre nunca dizem ☠ de quem foi poupado.
- **a devolução, e porquê:** a mão contou, na prova jogada, um "Poupar sem efeito"
  e uma morte sem cartão que atribuiu à regra. Li o código: em
  `resolverAtaqueJogador` o `alvo` é o mesmo objeto que a cópia local que o dano
  decrementa, e o `push` copiava o corpo **depois** do golpe — o golpe que matava
  chegava já "caído" e a escolha nunca era oferecida (só aparecia por acaso). O
  conserto captura o corpo antes do decremento, em duas linhas reescritas no
  lugar; a suíte crava a ordem no texto-fonte. **Uma devolução, verde.**
- **o que não está provado:** depois do conserto, **o clique em Poupar não foi
  jogado ao vivo** — a campanha de teste ficou sem luta à mão e parei antes de
  gastar mais chamadas pagas. O cartão foi visto ao vivo antes do conserto, com
  os rótulos certos; a lógica depois do conserto está provada por leitura e
  suíte. Fica para a sessão de prova (MM11) ou para o próximo ciclo que tiver
  luta à mão.
- **decisões médias tomadas:**
  - **Uma escolha por sequência de ataques**, não um cartão por alvo: dois
    cartões seguidos no pico da cena seriam formulário, não momento.
  - **Escolha ou preferência torta → letal / perguntar**: o comportamento de
    hoje e a pergunta a mais são os erros baratos; um desacordado que ninguém
    escolheu seria uma semente de Q4 que o jogador não plantou.
  - **240 caracteres para a cena**: o exemplo da pessoa tem 187; com 280 a linha
    empurrava para fora QUEM e CONTRA numa luta que pode continuar.
  - **O poupado sem emoji novo** (" (poupado)" em texto): o varredor D5h trava a
    contagem de emoji do sistema, e a mesa de design está parada.
  - **Endereços re-medidos** em `acoes-do-jogador.mjs` (+52 e +150 linhas), com o
    motivo em cada um; nenhuma asserção afrouxada.
- **para quem joga:** quando o golpe vai derrubar alguém, o jogo pára e pergunta
  se mata ou poupa, e *como* — e o que ele escrever é o que o Mestre narra. Poupar
  deixa um corpo vivo e desacordado por 1 a 4 horas. **A sonda não se move
  (68/157)**: nenhuma das 157 perguntas era desta, porque a pergunta é do Matt.
- **o que ficou:** Q4 (o desacordado como fato do mundo: prender, interrogar,
  acordar e voltar) — hoje o corpo poupado existe no combate e na pauta do turno,
  mas nada no mundo se lembra dele depois da luta.

## 29/09 09:25 · v9.305 · MM2 · o Narrador vê o tabuleiro · commit `98d6f63`

- **por que andou:** a etapa seguinte da Fase MM, com o escopo que a sonda
  corrigiu: a distância já chegava, a cobertura e a linha de visão não.
- **estado inicial:** verde (MM0 no ar, `c65c755`). A fila do desenho parada à
  espera da palavra da pessoa; a árvore só com o que é meu.
- **bastão:** tomado às 09:09 para uma linha em `enviar` (a ordem da rodada);
  a mão `backend` escreveu-a com o bastão em nome deste ciclo, por âncora e com
  deslocamento zero (24527 linhas antes e depois). Devolvido com este commit.
- **backend:** `resumoGridPrompt` diz, na mesma linha das distâncias, quem está
  **atrás de cobertura** (a mesma pergunta que `bonusDefesaEm` faz, logo o que o
  Narrador lê é o bônus que o dado aplicou), quem está **sem linha de visão**,
  se **eu** estou coberto, e a **ordem da rodada** só com quem está de pé. Só a
  exceção ocupa caractere: em campo aberto e sem `ordem`, a linha é idêntica à
  de antes, letra por letra (a suíte prova com a string literal). Rótulos em
  `ROTULOS_DO_TABULEIRO`.
- **o #142, e por que entrou aqui:** a sonda tinha-o posto em *ninguém decide*
  por não conseguir provar o caminho. Conferido: a iniciativa é rolada uma vez e
  guardada em `combate.ordem`, e o Narrador só a ouvia na abertura — era um *sabe
  e não conta* disfarçado. Reclassificar e deixar o teto subir seria honesto;
  fechá-lo na mesma linha era melhor e custava uma linha. Fechei.
- **o custo:** +439 caracteres no pior caso (6 inimigos, todos com as duas
  exceções, sete nomes na fila), travado abaixo de 480. Vive no rodapé do turno
  de luta, não no system prompt: `teste-prompt` segue em 81 934 < 82 mil.
- **a sonda:** **66 → 68/157 chega · 1 → 0 sabe e não conta** · 81 ninguém
  decide · 8 código resolve. `PISO_CHEGA = 68`, `TETO_SABE_E_NAO_CONTA = 0`.
  A linha de visão não moveu nenhum caso: a única pergunta de "quem vê quem"
  (#70) é fora de luta, onde não há grade — não forcei.
- **decisões médias tomadas:**
  - **O herói entra sempre na fila da rodada**, mesmo caído, porque caído ele
    ainda faz o teste contra a morte na vez dele.
  - **A asserção "há ao menos um *sabe e não conta*" mudou** para "todo caso
    desse tipo tem `ondeVive`": a antiga quebrava por mérito no dia em que o
    último fosse fechado. O motivo está escrito no teste.
- **para quem joga:** em luta, o Mestre passa a saber quem está protegido, quem
  está fora da vista e de quem é a vez — e deixa de ter de adivinhar as três.
- **o que ficou:** MM3 (o golpe final é seu), cujo módulo já está a ser escrito
  em paralelo, em arquivos separados.

## 29/09 00:16 · v9.304 · MM0 · Uma Vida é o único modo do beta · commit `c65c755`

- **por que andou:** ordem da pessoa de 28/09, item 1: *Uma Noite* e *Duelo*
  saem do menu. Ficou para depois de MM1 porque o bastão do `App.jsx` estava com
  o desenho (V6); ele fechou V6 (`445ef0b`) e devolveu-o às ~23:50.
- **bastão:** tomado às 23:58 de 28/09 em nome deste ciclo, para a fiação do
  menu; devolvido às ~00:30 de 29/09, com o commit.
- **estado inicial:** verde (MM1 acabava de subir, `be7e2d9`).
- **backend:** `MODOS_DO_BETA = ["historia"]` e `modoNaPorta(id)` em
  `src/modos.js`. `MODOS`, `garantirModo`, `modoDoSave` e os espaços de save
  intocados; a suíte `teste-modos` fixa os quatro nomes de chave de
  `rapida`/`duelo` por extenso, para que nenhum save mude de sítio sem a suíte
  gritar.
- **frontend:** os dois cartões do `TelaMenu` guardados por `modoNaPorta`, na
  mesma linha que já abria e fechava cada botão — deslocamento zero, porque
  `acoes-do-jogador.mjs` guarda ~130 endereços literais de linha abaixo do menu
  e uma primeira versão com linhas novas derrubou 84 deles. `TelaNoite`,
  `TelaDuelo` e todo o código dos dois modos ficaram; a sala de dois ficou.
  Menu vivo (aba nova, árvore de acessibilidade): *Começar a jogar*, *Jogar em
  dois*, *A campanha em arquivo*; sem *Uma Noite*, sem *Duelo*.
- **os saves antigos:** o boot lê só `espacoDoSave(modoRef.current)` com
  `modoRef` sempre em `historia` nesse instante; nenhum caminho abre sozinho numa
  noite ou num duelo (não há rota por hash, e os dois únicos `setFase` para lá
  são os cartões escondidos). Um save de *Uma Noite* ou *Duelo* não é lido,
  escrito nem apagado — fica onde está, à espera da tabela.
- **decisões médias tomadas:**
  - **A porta é uma função, não um `if` com nome de modo**, para a volta ser uma
    linha na tabela e para qualquer outra porta futura perguntar ao mesmo sítio.
  - **`modoNaPorta` diz `false` ao lixo**, ao contrário de `garantirModo`, que o
    faz `historia`: uma pergunta "este modo tem porta?" não pode responder por
    outro modo.
- **para quem joga:** o menu passa de 5 entradas a 3 (mais *Continuar* quando há
  campanha). **A sonda não se move nesta etapa: 66/157** — é porta, não Mestre.
- **o que ficou:** MM2 (cobertura e linha de visão na linha da luta), sem bastão
  para o motor.

## 28/09 23:55 · v9.303 (sem bump) · MM1 · a sonda da mesa · commit `be7e2d9`

- **por que andou:** Fase MM, aprovada pela pessoa na ordem de 28/09 — a primeira
  etapa, porque é a régua de todas as outras. O bastão do `App.jsx` estava com o
  desenho (V6) e esta etapa não precisa dele.
- **estado inicial:** HEAD verde (217/217 suítes, 15/15 varredores, provado por
  `so-o-meu.sh` com o desenho em voo na árvore). A fila do sistema estava parada
  desde 24/09; este é o primeiro bloco desde então.
- **conselheiro:** não chamado — a fase está escrita e aprovada.
- **testes:** as 157 perguntas que os jogadores fizeram ao Matt em C1E1,
  **traduzidas, parafraseadas e transpostas** para o Taverna (nenhum texto
  original no repositório), cada uma com o fato que a responde, onde ele vive e
  por onde chega ao Narrador. A suíte prova sem IA: para *chega*, que a função
  que carrega o fato é chamada no corpo de `pautaDoTurno`/`enviar` (extraído por
  âncora, não por linha); para *sabe e não conta*, que não é — e avisa no dia em
  que passar a ser. Amostra comportamental por tipo.
- **o número de hoje:** **66/157 chega · 1 sabe e não conta · 82 ninguém decide ·
  8 código resolve.** Por tipo: mundo 39 chega / 29 ninguém; regra 21 / 13 / 8
  código; posição 6 / 1 sabe-e-não-conta / 1 ninguém; cenário 36 ninguém; licença 3
  ninguém. Dos 82 *ninguém decide*, **46 são defeito** (os 36 de cenário são sabor).
- **o achado que muda MM2:** a leitura à mão supunha que quase toda pergunta de
  posição seria *o sistema sabe e não conta*. Não é: `resumoGridPrompt` (grid.js)
  já manda ao Narrador a região e a distância de cada inimigo a cada turno de
  luta. O que o sistema calcula e esconde é a **cobertura** (`temCobertura`, só
  vira bônus de defesa) e a **linha de visão** (`linhaDeVisao`, só vira aviso de
  tela). MM2 fica mais estreita e mais certeira; escrevi isso na pauta.
- **decisões médias tomadas:**
  - **Sem bump de `VERSAO`.** A etapa não muda nada que o jogador tenha na mão
    (dois arquivos em `testes/`, nenhum `src/`); subir o número seria um deploy
    que diz que algo mudou quando nada mudou, e a colisão com o bump do desenho
    é o único risco que ele traria.
  - **Os casos em arquivo próprio sem prefixo `teste-`**, para o `rodar-tudo`
    não os correr como suíte e para as etapas seguintes mudarem um veredito sem
    tocar na prova.
  - **Na dúvida, *ninguém decide*, nunca *chega*:** a iniciativa entre rodadas
    (#142) e "que perícia testo?" antes de agir (#33, #102) ficaram de fora do
    *chega* porque a suíte não conseguia provar o caminho. Inflar a régua no dia
    em que nasce é perder a régua.
- **o que ficou:** para cada etapa seguinte, subir `PISO_CHEGA` e descer o teto
  com o motivo escrito. MM0 a seguir: o bastão do `App.jsx` libertou-se às
  ~23:50, quando o desenho fechou V6.

## 24/09 22:40 · v9.294 · nenhuma fuga sai de graça · commit `561ff65`

- **por que andou:** item da pessoa, o segundo dos dois de hoje. *"Faça tanto a
  dos arqueiros quanto de qualquer outra fuga, nada sai de graça, tudo tem
  consequência, mas lembre-se de que existem as rolagens de dado… o arqueiro
  pode errar o tiro, mas ele pode se fortalecer e ir atrás do personagem… a
  consequência pode não ser dano."*
- **estado inicial:** verde; o desenho em V3, na mesma árvore, sem tocar no que
  é meu, e commitou V1 (v9.293) no meio deste ciclo. Tomei o bastão às 23:04 e
  devolvi-o às 23:50.
- **a tensão, e como ficou:** a fuga nasceu sem dado, para o preço caber
  inteiro antes do clique; a pessoa pediu dados. **A corrida continua
  determinística (quem alcança, alcança); o que ela custa passou a ser rolado,
  por semente; e o que se mostra antes do clique é a chance, não o desfecho.**
  Numa mesa, é o que se diz antes de alguém correr: "ele tem boa mira".
- **backend:**
  - **Quem ataca de longe não segura: cobra.** `atacaDeLonge` (tabela
    `QUEM_ATACA_DE_LONGE`: atirador, arqueiro, besteiro, fundibulário; mago,
    feiticeiro, bruxo, xamã, necromante, lich…) sai de quem alcança e faz **um
    disparo** enquanto se corre, até 36 m (`ALCANCES.armaDeLonge`), com
    desvantagem acima de 18 m. Colado, é golpe e não disparo, nunca os dois.
  - **A chance, exata:** `chanceDeAcerto` foi conferida face a face contra o
    próprio `resolverAtaque` em 112 combinações, e `ladosDoDado` saiu de dentro
    dele, para a chance mostrada e o dado rolado passarem pela mesma regra.
    Na tela vira voz de mundo (`FAIXAS_DA_CHANCE`: "quase não erra", "deve te
    acertar", "pode te acertar", "dificilmente acerta").
  - **Por semente:** `d`, `d20` e `resolverAtaque` aceitam uma fonte de sorte
    opcional. Sem ela, é o `Math.random` de sempre: regressão zero, provada com
    o `Math.random` substituído. `rolarOCustoDaFuga` rola golpes e disparos
    com a semente do mundo + dia + rodada.
  - **A consequência que não é dano (`consequenciaDaFuga`).** Toda fuga que
    escapa tem uma, sorteada pela semente e pesada pelo degrau do mais esperto
    de quem ficou: **perseguição** (reagrupam e voltam reforçados: vida cheia,
    +1 do mesmo tipo a partir de bruto, a ameaça sobe um degrau a partir de
    treinado; 8/6/4 noites), **território** (o lugar fica deles: voltar lá
    reabre a luta; em 4 noites sossegam, sem luta) e **rasto** (seguem-no pela
    estrada; em 6 viagens alcançam-no). Recusada: "largar moedas ou item",
    que seria dano com outro nome. Por cima, e sempre: a fama que já existia
    (`bumpCont("fugas")` → o antagonista, "que eu corro quando aperta"; o
    `cobrador` com testemunhas, `a_fuga_correu`). Relógios cheios (6) → a
    consequência cai na fama, com linha própria. Nunca uma fuga sem consequência.
- **frontend:** `fugirDaLuta` rola o custo por `rolarOCustoDaFuga` (a semente
  sai de `sementeDaFuga`, a mesma função que a prévia usa, para o aviso e o clique
  nunca divergirem), com uma linha própria para o disparo (`🏹`). Depois do
  escape, a consequência vira relógio. `tiquear` trata `fuga:`: ao encher, abre
  a luta com o bando. `talvezVoltarAoTerritorio` reabre a luta de quem guarda o
  lugar, e vencê-la tira o relógio. O botão e a frase mostram, antes do clique,
  a chance e o aviso juntos na linha do veredito que já existe, sem peça nova.
- **as três cenas, em número:**
  - **(a) os javalis do R15** (animal, comum, 19,5 m): perseguição nunca sai
    (0 em 600 sementes); **território 83%**, rasto 17%. Com a semente da prova:
    território — antes do clique *"Não vão esquecer este lugar."*, depois
    *"Javali-de-pedra ×3 não esquecem este lugar."*; voltar lá nas 4 noites
    seguintes reabre a luta.
  - **(b) um Atirador a 19,5 m** (a casa mais próxima de 20): não segura, e
    dispara com desvantagem. **Chance 0,36**, "pode te acertar"; medido em 4000
    sementes: 0,354. Numa semente, 3 e 18 → fica o 3 → **erra**; noutra, 12 e 19 →
    15 contra 12 → **acerta, 5**. Consequência: perseguição, 8 noites.
  - **(c) um Comandante (elite, treinado) com dois Soldados:** perseguição sai
    56% das vezes. **Em 4 noites voltam quatro**: o Comandante (elite, o teto) e
    três Soldados, agora competentes. A suíte leva o relógio ao JSON e de volta
    e ele enche na 4ª noite com esses mesmos quatro.
- **jogado:** campanha de teste, Atirador a 7,5 m. Antes do clique: *"Escapa,
  mas Atirador deve te acertar. Vai seguir o seu rasto."* No clique: *"🏹 Disparo
  — Atirador erra o tiro"*, *"Você escapa — Atirador fica para trás."*, *"Atirador
  segue o seu rasto."* Uma viagem depois: *"🐺 Atirador segue o seu rasto ●○○○○○
  (1/6)"*. O save de teste foi apagado com o jogo desmontado.
- **decisões médias, com o motivo:**
  - **o save:** o relógio ganhou um campo **opcional e aditivo** (`fuga: { efeito,
    bando, lugar, degrau }`), aparado por `LIMITES_DA_FUGA`, que nunca nasce onde
    não existe. Nenhum campo existente mudou. Código antigo que abra o save
    descarta-o e o relógio segue narrado; perde só a luta ao encher. **Um commit
    revertido conserta isto.**
  - **relógio de fuga que enche durante outra luta (ou sono, masmorra, raide)
    adia-se sem fila:** a marca avisou, e emendar duas lutas é pior do que uma
    consequência que evapora num turno raro.
  - **um Comandante sozinho volta com um segundo Comandante** ("+1 do mesmo
    tipo", à letra). O `jogo` pode querer outro reforço; fica escrito.
- **o que ficou:**
  - **não se viu a luta voltar a jogar**, porque o atalho `/relogio ++` do modo
    criativo enche por outro caminho. A volta está provada em suíte (o relógio
    enche na 4ª noite com o bando reforçado); falta um `jogo` que viaje e durma.
  - **o Atirador do bestiário continua a lutar corpo a corpo dentro da luta:**
    `distancia` só nasce em invocações. A fuga já o trata como atirador; o
    combate não. É outro item, que muda o que o jogador vive em toda luta.
  - a fiação do App não ganhou asserção de fonte nova; a prova está no motor
    (`teste-fuga`, 126 → 228) e no jogo jogado.

---
## 24/09 21:43 · v9.292 · o save e a vida: não há trancamento, mas havia dois defeitos · commit `a441fe9`

- **por que andou:** item da pessoa, o primeiro de dois (*"vamos arrumar também
  a questão do save e da vida"*). O save com `vida 0/18`, `combate: true` e
  `nível 1` ao dia 14 é *A Prova do Depois · Halda*, **a campanha de teste do
  `jogo` (R6)**, e não de jogador. Por isso a pergunta não era reparar a ficha,
  mas saber se os sintomas acontecem a jogadores reais.
- **estado inicial:** árvore limpa, 211/211 suítes. Bastão tomado às 21:47 e
  devolvido às 22:37. O desenho abriu V3 às 22:16 e escreveu três pedidos novos
  em `mente/pedidos-ao-sistema.md` **enquanto eu trabalhava**. Por isso esse
  arquivo não vai neste commit: marcar o pedido do XP como atendido levaria o
  trabalho dele junto. Fica para quando o arquivo estiver limpo.
- **1. `vida 0` com combate salvo — NÃO há trancamento, provado jogando.** O
  `frontend` injetou, com o jogo desmontado, uma ficha a 0/18 com `morrendo` e um
  combate salvo, recarregou numa aba nova e jogou. A tela abriu, `esperar` fez a
  rodada andar e o teste de morte rolou (`resolverQueda`, a única porta da
  queda). Todo save caído tem saída.
- **mas o heroi desacordado AGIA.** A 0 PV, `Atacar` resolvia um golpe de
  verdade (4 de dano num javali), contra o próprio envelope que diz ao Narrador
  "eu não vejo, não ouço e não ajo". **Consertado nos dois caminhos:** no botão,
  `impedimentosDaFileira` recusa `atacar`/`mover`/`fugir` a quem está
  desacordado. No texto, `convertePraTurnoDoCaido` **converte, não recusa**:
  qualquer frase digitada a 0 PV vira o turno de quem caiu (o mesmo caminho de
  `esperar`) e o Narrador recebe a frase de `esperar`, nunca a intenção. Recusar
  seria o trancamento que a investigação queria descartar, porque o `esperar` do
  painel também passa por `agirInterno`. Jogado: "ataco o javali" a 0 PV → *"você
  está desacordado — o mundo segue sem você"*, a rodada andou, o teste de morte
  rolou e o javali ficou nos 10/24.
- **2. `nível 1` ao dia 14 — NÃO é defeito.** A campanha recebeu **~89 XP** pagos
  ("Tirar Sara de lá"), contra 300 para o nível 2. As outras duas missões só
  foram aceitas, e a única luta acabou com a heroína caída: 0 XP. Doze dos
  catorze dias vieram de duas frases de viagem.
- **mas o pedido do XP (oferta ≠ recibo) era defeito real, e foi fechado.** A
  soleira prometia +80 e o diário pagava 94. A "correção" de v9.195 contava
  `prop.etapas.length` **já com a etapa de procurar quem assinou**, que os dois
  chamadores somam antes. `aceitarProposta` ganhou `etapasPrometidas` explícito,
  passado por `App.jsx` e `veredito-do-cartaz.js`. **Decisão média:** isto baixa
  o XP pago em ~15% nos contratos de mural, porque o número pago passa a ser o
  prometido. Motivo: a promessa escrita é o veredito antes do clique, e um
  recibo que a desmente é pior do que a promessa escondida de antes. A suíte
  endossava o número errado (`etapas: 2`); a asserção mudou, com o porquê ao lado.
- **3. o save de teste:** não existe no navegador de preview (o `localStorage` só
  tinha a configuração das rolagens). Onde o `jogo` o guardou não é alcançável
  daqui; não há nada a reparar deste lado.
- **prova:** `so-o-meu.sh` (HEAD + os meus 10) → 211/211, 15/15; build limpo.
  Provas novas em `teste-tela-de-batalha.mjs` (o desacordado, nos dois
  caminhos) e `teste-missoes2.mjs` (80 promete, 80 paga; e sem o parâmetro, o
  comportamento de antes). A suíte de endereços foi re-medida por conteúdo.

---
## 24/09 19:08 · v9.291 · a fuga, segunda volta: o que a prova jogada de R21 achou · commit `9d82ed8`

- **por que andou:** ainda é o item da pessoa (*"Pode arrumar o sistema de
  fugir"*). O desenho jogou a fuga de `7a2b00b` no R21 (`a28e8eb`) e escreveu
  quatro achados em `mente/pedidos-ao-sistema.md`. Os arqueiros ficaram de fora
  de propósito: é proposta do desenho à pessoa ("o arqueiro não segura,
  cobra"), sem resposta — não lhe toquei.
- **estado inicial:** árvore limpa, sem pausa, sem trava, bastão livre. Tomei
  o bastão às 19:17 e devolvi-o às 20:15.
- **1. a fuga abriu uma luta pior — e o diagnóstico era outro.** O pedido dizia
  "menção tomada por presença"; medido, a linha *"Estavam aqui."* é da caçada
  da missão (`talvezCacar`), que corre **dentro do mesmo `enviar`** da fuga e
  encontrou o combate já zerado. **backend:** o fôlego da fuga em `fuga.js`
  (`folegoDaFuga`, `folegoSegura`, `folegoDepoisDoTurno`): na resposta da fuga
  nenhuma luta abre (caçada, virada ou emboscada do perigo); enquanto o herói
  fica no lugar, a caçada e a emboscada de quem ficou para trás seguram; outra
  criatura passa; saindo do lugar, o fôlego acaba. **frontend:** os três
  portões consultam-no, e ele avança no fim de cada resposta, depois deles.
- **2. o campo não esvaziava:** a tela de batalha passa a desarmar o verbo e
  limpar o campo quando a luta acaba — fuga, vitória ou fim declarado, pelo
  mesmo sinal `fim`.
- **3. o texto:** `linhaDoEscape` concorda (*"Aranha do Fosso fica"*, *"A, B e
  C ficam"*); `notaDaFuga` lista com "e" e deixou de dizer "Não os mate" a uma
  criatura só; o fim da tela diz que se fugiu, em vez de *"3 de pé contra
  você"*.
- **4. a lei — a frase escrita mostra o preço antes:** `precoDaFrase` (a mesma
  conta que `fugirDaLuta` faz ao enviar) vai para a linha do veredito enquanto
  o texto casa `ehFuga`, a cada tecla. Precedência em `vereditoDaTela`: recusa
  do verbo > armado > preço da fuga > linha do golpe > fugiu > a contagem.
- **decisões médias, com o motivo:**
  - **o fôlego não vai ao save** — é memória de uma cena. Reabrir o jogo no
    covil devolve a caçada; é aceitável e está dito no cabeçalho do módulo.
    Mudar o save seria da pessoa.
  - **a emboscada segurada cai em nada**, sem nota extra ao Narrador: a nota
    do escape já lhe disse que ninguém alcança o herói nesta cena.
  - **o lugar que conta é o mais interno onde se fugiu**: fugir na praça não
    protege o mercado da mesma cidade.
- **prova, antes e depois:** `teste-fuga.mjs` contra o `fuga.js` de HEAD dá 6
  falhas (três funções que não existiam e três textos errados); agora 126/126.
  `teste-tela-de-batalha.mjs` ganhou 9 provas, que falhavam antes. `npm test`
  211/211 suítes, 15/15 varredores; build limpo. Suíte de endereços re-medida
  (141 endereços), com o motivo ao lado.
- **jogado:** o `frontend` criou uma campanha nova e lutou contra um Morcego
  Chato (IA de produção, pelo proxy de sempre). Viu, a cada tecla de "recuo
  depressa e fujo", *"Morcego Chato te alcança — não dá para fugir."* antes do
  Enter, e o campo vazio no fim da luta. O save de teste foi apagado com o jogo
  desmontado e o `localStorage` conferido de volta ao estado inicial.
- **o que ficou:** **o fôlego não foi visto a jogar** (o morcego voa, e
  alcançou sempre: uma fuga bem-sucedida não aconteceu), nem a linha "você
  escapou" do fim. Os dois estão provados em suíte; o próximo `jogo` que fugir
  de uma luta fecha a prova. O T13 fora de combate (a frase que fica no campo
  principal) não foi reproduzido. Os arqueiros esperam a pessoa.

---
## 24/09 16:50 · v9.289 · o sistema de fugir (item da pessoa, pedido #33) · commit `7a2b00b`

- **por que este ciclo andou com a fila parada:** a pessoa escreveu hoje
  *"Pode arrumar o sistema de fugir."* É a exceção que a ordem de 23/09 prevê
  (é do tema — o jogador sente, e sente a 3 PV — e foi pedida). Nenhum outro
  item de `mente/pauta.md` foi tocado. Mecânica que muda o que o jogador vive
  (seria `pesado`), autorizada pela frase.
- **estado inicial:** árvore limpa, 209/209 suítes, 15/15 varredores. Sem
  pausa, sem trava do sistema. A trava do desenho (R21, o `regente`) estava
  viva — renovada às 16:55 — e o bastão do `App.jsx`, livre: tomei-o às 17:09
  e **devolvi-o às 18:01**, com a fiação fechada.
- **o que o R15 escondia, medido e não suposto:** os três golpes que levaram a
  heroína de 18 a 3 PV (`20/14/17 vs 12`, 5 cada) **não foram a rodada dos
  javalis — foram golpes "de oportunidade" fantasmas.** `App.jsx:14260` cobrava
  `oportunidadesContraOJogador` com a lista INTEIRA de inimigos de pé, a
  qualquer distância. Javalis-de-pedra são corpo a corpo (1,5 m) e andam 9 m
  (`deslocamentoDeCriatura`): a 19,5 m, na vez deles, só chegavam a 10,5 m e
  não podiam bater. O outro sítio que faz a mesma conta (o Mover, `:15472`) já
  passava só os `colados`. **Antes: 3 golpes de quem nem a alcançava. Agora: 0
  — só quem está colado golpeia ao sair.**
- **backend:** `src/fuga.js` — `vereditoDaFuga` (sem dado: é uma corrida de uma
  rodada; quem está colado golpeia ao sair; o herói cobre 2× o passo correndo
  ou 1× de guarda erguida, sem golpe; cada inimigo persegue a 2× o passo dele,
  cortado pela condição — `PERSEGUICAO_POR_CONDICAO`: caído e lento à metade,
  agarrado/paralisado/atordoado/amedrontado parados; alcança se a distância
  final ≤ o alcance dele), `quemGolpeiaAoSair`, `ehFuga`, `linhaDaFuga` (≤ 54),
  `notaDaFuga`. `combate.js` exporta `pedeDesengajar`, e `ehRetirada` passa a
  usá-la (a lista das frases de cuidado continua uma só).
- **testes:** `testes/teste-fuga.mjs`, 82 provas, com o R15 rejogado em número
  como primeiro bloco.
- **frontend:** uma porta só, `fugirDaLuta`, para a frase e para o botão (lei de
  X2). O verbo `Fugir` na fileira da batalha, `Papel=Recuo` ao lado de
  `esperar` (a mesma peça `Verbo` — uma ação, uma forma). O fantasma
  consertado na retirada. `bumpCont("fugas")`: o contador que o antagonista lê
  desde sempre (*"que eu corro quando aperta"*) e **ninguém escrevia** — um
  sinal dormente que acordou. Suítes de endereço (`acoes-do-jogador`) e da tela
  re-medidas, cada asserção movida com o porquê ao lado.
- **decisões médias, com o motivo:**
  - **O veredito não rola dado.** Porque só assim ele pode ser mostrado inteiro
    antes do clique — uma fuga com d20 escondido só poderia prometer "talvez".
    Determinismo por semente cumprido pela raiz: não há sorte na decisão.
    Os golpes de oportunidade rolam como todo ataque do combate já rola.
  - **Fuga que o sistema já sabe que falha não gasta o turno.** A frase
    digitada recebe a linha do veredito ("Bandido te alcança — não dá para
    fugir.") e a rodada segue intacta; o botão fica impedido com a mesma razão.
    Tentar o que é certo falhar seria um turno roubado — o defeito exato do R15.
  - **Fugir arma e o segundo toque executa** — exceção consciente à regra de W1
    ("o segundo toque nunca é confirmação"), porque fugir é irreversível e a
    lei da casa "o veredito antes do clique" manda. O primeiro toque mostra o
    preço; a linha não diz "para desistir" no botão que vai fazer o oposto.
  - **Escapar acaba a luta sem espólio, sem XP, sem morte registrada**: os
    inimigos seguem vivos no mundo, e o Narrador é proibido de os fazer
    alcançar o herói nessa cena.
  - **"fuja" saiu das frases de fuga** (tirei eu, uma linha): "grito para Elma:
    fuja!" encerraria a luta do herói por uma fala dele. Ordem dada a outro
    ("mando/grito/digo ... fugir") é veto. O portão morde só o necessário.
  - **Formato de save: intocado.** `contadores` já era um objeto aberto.
- **a regra, jogada em número (a mesa que ela desenha):** colado a um bicho tão
  rápido quanto você, nem correndo (1,5 + 18 − 18 = 1,5 ≤ 1,5). Derrubá-lo antes
  (caído persegue à metade) abre a fuga, pagando o golpe dele. Colado a um
  zumbi (6 m): foge correndo, com um golpe. **Empurrar e Derrubar ganharam uma
  razão de ser que não é dano.**
- **prova:** `bash mente/so-o-meu.sh` (HEAD + os meus 13 arquivos) → 210/210
  suítes, 15/15 varredores; `npm run build` limpo na árvore inteira. Na árvore
  cheia o desenho (R21) tem trabalho em voo — `estilo.js`, `ui.jsx`,
  `painel-alforje.jsx`, `marca-da-porta.js`, `formas.md`, `pauta-desenho.md` —
  e o `frontend` viu vermelho **dele** a meio (uma crase em `SUPERFICIES_CSS`,
  `marca-da-porta.js` sem leitor); não toquei, não esperei.
- **o que ficou, escrito para não virar surpresa:**
  - **não joguei a fuga no navegador.** O `frontend` abriu o app (sem erro no
    console) mas não montou um combate posicionado até à frase. A prova é a
    suíte e o R15 rejogado em Node. Um `jogo` que jogue a próxima emboscada
    fecha isto.
  - **atiradores perseguem como corpo a corpo:** a 20 m de um arqueiro o herói
    "escapa limpo" — no mundo, levaria flechas nas costas. Consertar pede
    decidir se fugir de arqueiros deve ser quase impossível; ficou para a mesa.
  - **a corrida é em uma dimensão:** ignora paredes e inimigos dos dois lados;
    o herói encurralado numa masmorra lê o mesmo veredito do campo aberto.
  - **o passo já gasto na rodada é ignorado:** a fuga usa o passo inteiro.
  - **a fila do sistema continua parada**; nenhum item novo aberto.

---
## 23/09 · v9.281 · decisão de sequenciamento, sem ciclo, sem commit

- **não é um ciclo — é uma pausa da automação, com o motivo escrito**, porque
  a pessoa entregou o julgamento a quem regia e pediu que ficasse registrado.
- **o que mudou:** a fila foi retomada mais cedo hoje (`.claude/fila-pausada`
  removido, `taverna-ciclo` religado) e, minutos depois, a pessoa pediu foco
  total em visual/gameplay e levantou um risco de sequenciamento: o ciclo
  automático do sistema e o `regente` (redesign da tela principal) podem
  decidir a mesma coisa de dois jeitos, sem um saber do outro.
- **a decisão: `taverna-ciclo` volta a DESLIGADO** (só ele — `.claude/fila-pausada`
  não foi recriado, e o `regente` segue rodando normal). Motivo: o risco não é
  hipotético. Os dois alvos que a pessoa deu hoje ao redesign —
  **a tela principal** e **o sistema de decisões** — moram exatamente no
  território do ciclo automático (`src/turno.js`, o despachante de turno;
  `src/cena.js`, a estrutura de cena; `src/*.js` em geral). Um ciclo
  automático que pegasse um item de `mente/pauta.md` tocando decisão ou cena
  — sem saber que o `regente` está a meio de decidir a forma e o fluxo dessas
  mesmas telas — arriscava exatamente o retrabalho que a pessoa disse não
  querer: a fila resolve de um jeito, o `regente` decide diferente dias
  depois, e o primeiro trabalho vira lixo.
- **o que não mudou:** `mente/pauta.md` continua como está — nada foi
  arquivado, adiado item a item, nem marcado. Religar é rápido (só o
  `enabled: true` da tarefa) e não perde nada; por isso não houve necessidade
  de tocar na fila em si, só no gatilho automático dela.
- **para retomar:** quando o `regente` entregar a primeira análise/plano da
  tela principal (o que já está em andamento), reavaliar — provavelmente dá
  para religar o ciclo automático restringido a itens que não tocam decisão
  nem cena/tela, ou religar cheio se o plano do `regente` não encostar em
  `turno.js`/`cena.js`. Quem religar, decida com o plano em mãos, não às
  cegas.

---
## 16/09 22:55 · v9.280 · F3 · a família `intocado` chega à escada · commit `f706cf2`

- **estado inicial:** este ciclo **morreu uma vez** — o `backend` foi cortado a
  meio do veredito por um limite de sessão, sem escrever nada no disco — e foi
  **retomado** em vez de renascido, que é a lei nova da casa. A trava foi tomada
  às 22:28Z por um ciclo agendado (que herdou uma trava morta de 18:36Z) e ficou
  comigo; limpei a linha morta do `backend` em `mente/agora.json`.
- **a árvore estava suja, e a sujeira não era minha:** 743 linhas do **E4**,
  vivo, com o bastão do `App.jsx` renovado às 22:32Z — incluindo **`src/grid.js`**,
  que ele estava a mudar naquele minuto. Não lhe toquei, não usei `stash` nem
  `checkout --`, e o meu veredito saiu de `bash mente/so-o-meu.sh`.
- **conselheiro:** **não chamado** — fase aprovada, etapa escrita. *(E não semeei
  a pauta: a pessoa pediu pausa depois deste ciclo.)*
- **backend:** `ESCADA_DA_GUARDA` e as 5 linhas novas de `GUARDAS`
  (`habilidades.js`), o veredito em comentário, as 3 trocas de dívida
  (`poder-de-classe.js`) e a correção da conta de colisões (`efeitos.js`).
- **testes:** `testes/teste-intocado.mjs` — **106 asserções**, nova; a §10 de
  `check-protecao`; e **uma asserção movida com o motivo escrito** em
  `teste-arena.mjs`.
- **prova:** build limpo. `so-o-meu.sh` com os meus 7: **202/202 suítes · 14/14
  varredores**. Árvore inteira, com o E4 dentro: **203/203 · 15/15**.
  **Zero linhas de `App.jsx`.**

### O VEREDITO — desenho antes de código, e a colisão não existia

**`intocado` não é uma família: são três promessas debaixo de um rótulo.**

| | o que promete | quantas | onde mora |
|---|---|---|---|
| 1 | **o golpe que erra** | 8 | a escada de `GUARDAS` — é a que F3 paga |
| 2 | **imunidade a condição** | 5 | o catálogo de condições — endereço abaixo |
| 3 | **zona e fuga** | 5 | o lugar e o movimento |

`estaIntocavel` responde à promessa **de prazo**, e a v9.53 já a respondeu:
absoluta por 1 turno (8 PM), entortada por 3–4. **O que a família traz não é uma
segunda resposta à mesma pergunta — é o degrau de baixo, que a escada nunca
teve: 2 e 4 PM.** Sustentam-no o comentário de `GUARDAS` (*"quanto mais absoluta
a promessa, mais curto o prazo"*), a precedência `guardaDe` antes de
`aplicacaoDoBuff` já escrita em `arena.js:220` e `App.jsx:7622`, e os dois
leitores vivos de `combate.js`. **Nada esbarrou em lei; nada subiu como pesado.**

**E a régua já estava escrita, sem ninguém a ter lido.** As três esquivas da
v9.53 obedecem, sem exceção, a `floor(PM / 2)` — 7→3, 7→3, 8→4 — e as cinco de
`tipo: "defesa"` **não** obedecem, o que confirma a régua: lá o preço é a CA,
aqui é o prazo. Virou `ESCADA_DA_GUARDA`, lida de volta por duas provas.
`turnosDoAbsoluto: 1` é a outra metade: Vazio Perfeito compraria 4 turnos pela
conta e leva 1, **porque é absoluto**. O absoluto barato foi **recusado de
propósito**: entregar *"anula o golpe"* a 2 PM desfaria a escada pelo degrau
mais barato.

### As 18

**Passam a cumprir — 5:** Esquiva Ágil, Defesa Fluida, Dança das Sombras,
Antevisão, Corte de Espelhos. **Já cumpriam e ninguém sabia — 3:** Vazio
Perfeito, Dança Sem Vulto, Nada Me Alcança — **o rótulo `intocado` de P1 nasceu
por cima de mecânica viva.** **Não passam — 10**, cada uma com o motivo nomeado
em asserção.

### Decisões médias, com o motivo

1. **Subir as cinco, e não quatro.** A catraca fica **inteiramente verde** (32
   células, amplitude 12,5 contra teto 20, margem mais fina a melhorar de 5,1
   para 6,1 pt) — e a lei é *meça e não reequilibre*. **Mas `sombra` desce 55,1 →
   46,5 % no retrato**, e o dígito fica escrito na pauta para a avaliação da
   pessoa, com a alavanca nomeada: desligar **uma** linha (`esquiva_agil`)
   devolve a catraca a HEAD byte a byte e deixa 4 de 18 — ao preço de perder a
   única que a arena vê.
2. **A causa não é a tabela, é a política do piloto** (`companheiros.js:273`):
   `guarda` vence de tudo **sem perguntar quanto vale**, e `sombra` troca um
   turno de rodada 1–2 por uma compra de 2 PM. A sensibilidade **confirma** a
   régua em vez de a acusar: com 3 turnos — o que a régua **proíbe** a 2 PM —
   `sombra` sobe a 58,6 % e a amplitude a 15,8.
3. **A asserção do teto de guardas mudou de FORMA, não de severidade**, com o
   motivo ao lado: `tetoDeGuardasNosProntos: 0` virou **lista nomeada**
   (`["sombra:Esquiva Ágil"]`). Um teto que sobe é a doença — no dia seguinte
   sobe para 2 e ninguém vê; uma lista obriga quem acrescentar a segunda a
   escrever o que ela fez ao equilíbrio.
4. **A conta de colisões estava a falar de duas coisas** e foi corrigida em
   `efeitos.js`: contra `absorve` eram 1 e **continuam 1**; contra a tabela
   inteira já eram **4** na v9.233, e depois de F3 são **9** — todas da mesma
   família e resolvidas pela mesma precedência de uma linha.
5. **Um bug achado de passagem, com teste que o prova** (leve):
   `esquivaDeGuarda(pers, null)` estourava no destructuring — a armadilha que a
   própria lei nomeia (`= {}` não cobre `null`).

### Onde morde, e o que as réguas não veem

**600 golpes contra o mesmo alvo:** 68,5 % de acerto nu → **47,2 %** com
qualquer esquiva de pé (−21,3 pontos de acerto, −35,8 % de dano). O absoluto, no
mesmo banco: **0/600**. É a escada inteira em dois números, e a paridade fecha
em ~4 de dano evitado por 2 PM — o que `absorve` compra a 2 PM.

**Esta é a primeira etapa da Fase F que a arena realmente vê:** guarda **não**
passa por condição, logo a cegueira que F2 mediu (`prepararDuelista` zera
`condicoes`) **não se aplica aqui**. Em compensação, **a régua de Uma Vida é
cega por ROSTER, não por mecanismo** — o grupo dela é Guerreiro, Mago, Clérigo e
Engenheiro, e as cinco são de Ladino, Monge, Andarilho e duas subclasses que ela
nem alcança. **Nenhuma das duas mede a mesa de campanha com um herói Ladino ou
Monge**, que é exatamente onde o jogador vai sentir isto.

- **o que ficou, com endereço:** (1) **a imunidade temporária** — e a dívida é
  **maior** do que se pensava: `imuneA` só é consultada em **dois** sítios, e os
  dois são **autoinfligidos**; a aflição que um **inimigo** impõe entra por
  `rolarAflicao`, que **não pergunta a `imuneA` coisa nenhuma** — nem a
  imunidade **permanente** do elmo Sem Medo protege hoje de um medo lançado
  contra você. Não é etapa de prazo: é a porta única da aflição, e vem antes.
  (2) **o degrau da CARGA** — *"o próximo golpe erra"*, gasto na primeira
  batida, molde de `absorverDano`; é o único absoluto que não acaba o combate, e
  precisa de um escritor **em cada mesa** (o `App.jsx`, com bastão, e
  `arena.js`) — meia ligação faria as duas mesas divergirem. (3) **a política do
  piloto**.
- **`AGUARDAM` fica em 38:** nada pago, **três dívidas trocadas e escritas**.
  Dizer que desceria seria a contabilidade a mentir — a escada paga
  *desvantagem*, e as fichas dizem *"anula"*: a mesma distância que
  `AMORTECIMENTO_DO_BUFF` mantém entre a "metade" da ficha e o quarto que cobra.
- **para a pessoa decidir:** o **−8,6 de `sombra`** é o único dígito desta etapa
  que pode querer os olhos dela, e está na pauta com a alavanca de uma linha.

---

## 16/09 20:45 · v9.279 · os dois pedidos da mesa · commit `e112017`

- **estado inicial:** trava posta às 20:10 (não existia). Árvore limpa fora de
  `mente/pedidos-ao-sistema.md`, que o **E4 estava a escrever naquele minuto**.
  `npm test` **200/200 · 14/14** de entrada.
- **o item não foi uma fase, e é o passo 2 do roteiro a valer literalmente.**
  F3 estava disponível, mas `mente/pedidos-ao-sistema.md` tinha um pedido **com
  relógio**: o E4 escreveu-o no **começo** do ciclo dele, de propósito, e
  avisou por escrito que sem resposta a marca de borda cairia para E5 *"por
  falta de três campos num objeto que já os tem"*. **Um pedido parado trava uma
  fase inteira do outro lado.**
- **conselheiro:** **não chamado** — a fila dos pedidos estava cheia.
- **backend:** `lugarDaAcao`/`LUGAR_NA_ACAO` (`combate.js`) e a peça pura do
  passo (`PASSO_NA_RODADA`, `passoQueResta`, `podeDarUmPasso`, `passoAposAndar`
  em `grid.js`).
- **testes:** `testes/teste-onde-foi.mjs` — nova; `teste-grid` 160 → **182 ok**.
- **prova:** build limpo, `npm test` **201/201 suítes · 14/14 varredores** na
  árvore inteira. **Não precisei de `so-o-meu.sh`: não havia vermelho de
  ninguém.** **Zero linhas de `App.jsx`** — o bastão é do E4 desde as 18:05Z e
  o dono esteve vivo o ciclo inteiro.

### A primeira pergunta era se são a mesma ferida — e não são

| | pedido 1 | pedido 2 |
|---|---|---|
| laço | `turnoDosInimigos` (`combate.js:299`) | `moverPara` (`App.jsx:14570`) |
| função do grid | `alcanca` — **mede**, não move | `caminhar` — **move**, devolve `custoM` |
| quem age | o inimigo | o herói |
| onde a ferida mora | **no motor**: a medida existe e é deitada fora | **só no `App.jsx`** |

Partilham `grid.js` como módulo e **nada mais** — nenhum estado, nenhuma
chamada em comum. **Um conserto cada**, e perguntar primeiro custou dez minutos
e evitou um conserto que não existia.

### Pedido 1 — pago

A ação passa a levar **`onde`**, **`alvoOnde`** e **`metros`**: a conta que o
laço já fazia em `alcanca`, usava para decidir o golpe e **deitava fora antes
de voltar**. Nenhum nome é novo — `onde` é o vocabulário que o próprio laço usa
nos alvos, `metros` é o que `alcanca`, `moverInimigos` e
`detectarAlcanceImpossivel` já devolvem.

**Aditivo por construção**, que era a condição imposta pelo leitor no `App.jsx`
que eu não podia editar: `lugarDaAcao` devolve `{}` quando não há o que dizer, e
espalhar `{}` não acrescenta chave. **Sem grade nenhum dos três nasce** — e a
distinção importa: *"não sei onde ele está"* não pode parecer *"está a 0 m"*.
Zero metros **medido** continua a nascer, porque colado é medida de verdade.
**Teto de prompt intocado.**

### Pedido 2 — não era o que o pedido dizia, e essa é a parte que vale

**Não falta desconto em `movimento.js`: a luta nasce sem `economia`.**
`equiparCombate` (`App.jsx:4929`, a porta única de `abrirCombate`) monta a mesa
com `rodada: 1` e `recursos`, **e sem `economia`** — ela só nasce na virada de
rodada. E o desconto do passo faz `eco ? { ...eco, movM: sobra } : eco`: **sem
`eco`, evapora**. A rodada 1 inteira é de graça, que é exatamente os 21 m com a
marca parada em `9 de 9`.

**E a mesma linha em falta tem um segundo sintoma:** a guarda da ação está
atrás de `if (eco)`, logo o aviso *"você já usou sua ação nesta rodada"*
**nunca dispara na rodada 1** — e isso **bate com a medição de W2**, que contou
**zero chamadas** àquele literal e não soube dizer porquê. Uma linha em falta,
dois sintomas, e um deles estava medido há duas fases sem diagnóstico.

**A peça pura ficou feita e provada**, em `grid.js` colada a `alcancaveisDe` —
que é onde `METROS_POR_QUADRADO` e `custoM` já vivem; uma segunda cópia de 1,5 m
noutro módulo seria o `PISO_DO_GOLPE` outra vez. `passoQueResta` devolve `null`
para *"ninguém andou ainda"* (nunca `0`) e **nunca mais que o total de hoje**:
passo que encolhe não é burlável por saldo antigo.

**A asserção que falha antes e passa depois NÃO foi entregue verde, e é
honesto dizer porquê:** o defeito vive em **seis linhas do `App.jsx`**, e
escrever a catraca agora deixaria a suíte **vermelha por trabalho que não é
meu**. As seis substituições ficaram endereçadas uma a uma no pedido, e **a
primeira delas paga sozinha os 21 m e o aviso da ação**.

- **o que ficou:** as seis linhas de fiação (bastão), e o pedido marcado `[~]`
  com o diagnóstico inteiro em vez de `[ ]` com a queixa.
- **decisão média:** responder a fila dos pedidos **antes** de F3. A razão é de
  relógio, não de valor: F3 espera sem custo, o pedido de E4 tinha prazo escrito
  e uma fase do outro lado dependia dele.
- **para a pessoa decidir:** nada novo. O +2 de defesa (F2) continua onde está.

---

## 16/09 19:50 · v9.278 · F2 · o abrigo cai no corpo certo · commit `3bac9b6`

- **estado inicial:** trava posta às 19:00 (não existia). Árvore com o E3 a
  trabalhar ao lado; ele **fechou durante o ciclo** (commits `512b944` e
  `b7b9812`, v9.277) — por isso os comentários da mão, que datavam v9.277,
  foram **redatados para v9.278** antes do commit: a versão mudou debaixo dela.
  `npm test` verde de entrada e de saída.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o portador `amparo` (`aflicoes.js`) com `alvo: "aliados"`, os
  dois comentários de `combate.js` que trancam a moeda desligada, e `AGUARDAM`
  reescrito.
- **testes:** `testes/teste-protege.mjs` — **47 asserções**, 7 seções, nova;
  mais a §9 de `check-protecao` (57 → 65 ok) e `teste-afl`.
- **prova:** `npm run build` limpo, `npm test` **200/200 suítes · 14/14
  varredores** na árvore inteira; `so-o-meu.sh` com os 7 arquivos, o mesmo.
  **Zero linhas de `App.jsx`** — o bastão nunca esteve comigo, e o dono estava
  vivo o ciclo inteiro (a regra dos 90 minutos é para dono morto).

### O que a família paga não é quanto, é EM QUEM

`absorve` compra pontos, `amortece` compra proporção — e `protege` promete
**um corpo que não é o de quem usou**. Quatro entradas de `AGUARDAM` já o
diziam com todas as letras: *"a guarda sobe em QUEM USA"*, *"a condição
`protegido` cai em quem usou, não no aliado"*, *"o mesmo abrigo no corpo
errado"*.

**E a máquina já existia** — é a terceira etapa seguida em que procurar paga
mais que escrever. `PORTADORES` tem a coluna `alvo` com `"aliados"` **vivo e
com três leitores** (App `:7725` e `:7825`, `regua-combate.mjs:747`). Nasce o
portador `amparo`, e **6 das 8** passam a cair no corpo certo: Muralha, Círculo
Sagrado, Espírito Guardião, Muralha Viva, Espírito Vigia, Totem de Guarda.
Armadura Sombria fica em `proprio` porque promete o **próprio** corpo — está
certa onde está; Bênção do Bosque não tem verbo de proteger e é apanhada antes
pela linha 0 (`veneno`).

**Quatro das seis não tinham portador NENHUM por uma letra:** `prote[çc]` casa
"proteção" e **não casa "protege"**, que é o verbo que a ficha usa. É a
armadilha exata que H1 apanhou em "protetoras", e estava de pé há versões.

### O achado que reenquadra a etapa: a moeda vale zero

`protegido` é a **única** condição do catálogo com o campo `defesa`, a
descrição que o jogador lê diz **"+2 de defesa"**, e o campo **nunca foi lido
por ninguém**: `mecanicaDe` soma-o desde a v9.0, `modificadoresDeCondicao` não
o devolve e `resolverAtaque` nunca o viu. **34 defensivas do acervo** prometem
esse +2 e entregam zero.

**Provado, não afirmado:** com o corpo corrigido e a moeda morta, a régua de
Uma Vida sai **idêntica ao byte**. As duas metades são **um pagamento só**.

**A mão ligou-a, mediu e desligou-a** — e essa é a decisão que eu confirmo:
são duas linhas em `combate.js`, mas o preço é **balanceamento**, e na dúvida
entre médio e pesado é pesado. Vitória **52,1 → 54,7 %** · PV do grupo
**25,88 → 27,57** · quedas **1,790 → 1,720** · sofrido **240,61 → 235,48** ·
desferido **120,74 → 131,90** · `duro` **8,8 → 10,8 %**, e **caem três
asserções de `teste-regua.mjs`**, uma delas a que garante que o retrato de
B1/B1b/B2/T1 continua alcançável. **Subiu para "Para a pessoa decidir"** com o
preço inteiro escrito, e ficou trancado numa asserção que **acende** se alguém
ligar as duas linhas sem passar por lá.

### Decisões médias, com o motivo

1. **O recorte exige DUAS coisas na frase** — o verbo *proteger* **e** um corpo
   declarado (`aliad` / "o grupo" / "quem estiver perto") — e **não** as
   palavras de abrigo. Medido: trocar uma pela outra leva o recorte de **9 para
   12**, e as três que entrariam não protegem ninguém (uma arrasta um caído,
   outra transfere PV, outra cresce entre o grupo e o perigo). **As três estão
   nomeadas em asserção**, mais o teto `tetoDeAmparos` no varredor. É o cuidado
   que H4 comprou, aplicado antes de custar.
2. **"Aliados" (eu + o grupo) em vez de alvo único**, e o argumento não foi o
   esperado: das 9 frases que mudam de lado, **seis** dizem "um aliado"
   (sobre-entrega) mas **três** dizem "o grupo" e são entregues **exatamente**.
   O estado anterior era pior que sobre-entregar: era **disjunto** da promessa
   — o abrigo caía só no corpo que a ficha **exclui**. Alvo único é mecânica
   nova e pede o bastão; ficou escrito com endereço.
3. **`AGUARDAM` fica em 38, nada pago, quatro dívidas trocadas** — e uma delas
   estava **factualmente errada**: *Elixir de Combate* dizia *"é guarda desde a
   v9.53"*, e não é (`aflicaoDe` devolve `null`, portador nenhum, a condição
   nem nasce). `SEM_DONO_HOJE` **subiu** 2 → 3 pela primeira vez, e a subida é
   uma linha a sair do **silêncio** — expôs de passagem um buraco do contador
   (`comDono` filtrava `a.dono !== null`, e entrada **sem a chave** passava).

- **o que ficou:** o alvo único (bastão); *Bênção do Bosque*, que só passaria
  se `amparo` subisse acima dos debuffs de arma; e um cuidado que vale para
  **F3 e F4** e ficou escrito na pauta — **`prepararDuelista` (`arena.js:128`)
  zera `condicoes` e nada volta a escrevê-las**, logo a arena é
  **estruturalmente cega** a toda família que passe por condição. A identidade
  da catraca **não** é prova de inocuidade; quem mede estas etapas é a régua.
- **para a pessoa decidir:** o item novo no topo da pauta — o +2 que 34 fichas
  prometem entra, e o retrato se recalibra à volta dele; ou a ficha deixa de o
  prometer?

---

## 16/09 18:20 · v9.276 · H4 · a marca pesa no golpe · commit `408a841`

- **estado inicial:** trava posta às 13:55 (não existia). Árvore suja só do
  lado do E3 (a tela da batalha, com o bastão do `App.jsx`). O vermelho de
  `check-formas` que o ciclo anterior deixou declarado **já tinha saído**
  quando fui provar: `npm test` fechou **199/199 suítes · 14/14 varredores**.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o campo `danoRecebidoExtra` e a condição `marcado`
  (`condicoes.js`), os dois lados da conta em `combate.js`, o portador `marca`
  (`aflicoes.js`) e `AGUARDAM` reescrito.
- **testes:** `testes/teste-marca.mjs` — **64 asserções**, 8 seções, nova;
  mais `teste-cond` e `teste-poder-de-classe`.
- **prova:** `npm run build` limpo, `npm test` **199/199 · 14/14** na árvore, e
  `bash mente/so-o-meu.sh` com os meus 7 arquivos: **198/198 · 13/13**.
  **Zero linhas de `App.jsx`** — o bastão nunca esteve comigo.

### O buraco era maior e mais antigo do que a pauta dizia

A pauta pedia *"ler o espelho que falta"* do lado do alvo. Medindo, o defeito
não era uma falta, era uma **confusão de línguas**: `danoExtra` e
`danoReduzido` falam do dano que o portador **causa** — e a prova não é o
comentário de `condicoes.js:87`, que mente por omissão, mas **a descrição que
o jogador lê**: *"fortalecido: +2 no dano causado"*, *"enfraquecido: −2 no dano
causado"*. `combate.js:127` lia `modAtk.danoExtra` do lado certo e
`modAlvo.danoReduzido` do lado errado; `modAtk.danoReduzido` e
`modAlvo.danoExtra` **não eram lidos em lugar nenhum**.

**O número que decidiu:** golpe de 10 pela fórmula velha — **10** sem a
Maldição do Patrono, **8** com ela. Amaldiçoar o inimigo **endurecia-o**.

**Ler o espelho de `danoExtra` do lado do alvo teria empilhado a segunda
confusão sobre a primeira.** O que entrou foi a separação das duas perguntas:
quanto o portador **causa** e quanto o portador **recebe**, em campos que não
se confundem, cada um lido no lado certo.

### Decisões médias, com o motivo

1. **Nasceu UM campo, não dois.** `danoRecebidoExtra` entra; o espelho
   `danoRecebidoReduzido` **não** — *"apanhar menos"* já tem **dois donos
   vivos** (o abafo de F1 e o abrigo de P3), os dois na fila do dano com régua
   e prazo próprios. Um terceiro campo seria a mesma regra em três cabeças com
   uma só paga. Ficou **ponteiro** no catálogo e uma asserção que **acende** se
   alguém o criar.
2. **A marca entra PLANA**, e essa era a convenção que o arquivo já praticava
   sem a dizer (`modAlvo.danoReduzido` já ficava fora do parêntese): o do
   atacante soma em `danoBase` e **dobra** no crítico, o do alvo não. Base 10,
   quem bate `fortalecido`, alvo `marcado` → **14**; em crítico **26**, não 28.
3. **O regex é frase inteira.** Doze frases do acervo contêm "marca" e **onze**
   começam por *"Marca um alvo"* prometendo coisas sem relação entre si. Há
   asserção a impedir que a próxima mão alargue a linha para "resolver" a
   segunda metade por atalho.
4. **O conserto da inversão** (leve, bug com teste que prova) entrou junto, e a
   suíte corre os dois lados **com a mesma semente** — a primeira versão dela
   "provou" o contrário porque comparava dados diferentes, e isso ficou escrito
   no cabeçalho do helper.

### Onde a marca entra na fila do dano

**A montante de tudo.** `resolverAtaque` produz o número **antes** de
`amortece → invocação → abrigo → PV temporário → PV real → a queda`: a marca
não é uma estação da fila, é **o golpe que chega mais pesado à primeira**.

### O veredito de tamanho da segunda metade: ficou escrita, com medida

*"Dano extra SEU"* pede um campo de **dono** que não existe: `criarCondicao`
grava `origem`, e origem é o nome da **habilidade**, não de quem a usou. O dono
atravessaria **5 assinaturas**, e as **duas do meio** (`mecanicaDe`,
`modificadoresDeCondicao`) decidem **só pelo catálogo** — não têm por onde
receber quem ataca. A ponta boa: `resolverAtaque` **já tem `atacante` em
mãos**. A medição está trancada em asserções (§8) que acendem no dia em que
alguém puser dono na instância. É a mesma jogada de H3 com a porta `aflicaoDe`.

### Medido e não reequilibrado

Arena **idêntica número a número** (sombra 55,1 · remendo 54,4 · chama 53,6 ·
voto 51,5 · flecha 49,6 · muralha 46,8 · punho 45,6 · voz 43,3) e régua de Uma
Vida idem (240,61 ± 3,65 sofrido, 120,74 ± 3,44 desferido) — **as duas causas
trancadas na suíte**: `prepararDuelista` zera `condicoes`, e a régua só aplica
aflição que não cai no alvo. Viva onde morde: 600 golpes de 12 contra o mesmo
alvo dão **7 416 sem a marca e 8 568 com ela (+15,5 %)**.

**E o que as réguas NÃO veem, dito aqui em vez de escondido:** `enfraquecido`
chega ao jogo por **6 frases do acervo** mais o bestiário, e o conserto **vira
o sinal** — quem o carrega apanhava −2 e passa a bater −2, **4 pontos de troca
por golpe**, e nenhuma das duas réguas o enxerga. Não toquei em número de
tabela nenhum.

- **o que ficou:** o **dono** da marca (a segunda metade), a pílula do HUD —
  `App.jsx:21603` mostra `mec.danoExtra` e não tem irmã para `danoReduzido` nem
  para `danoRecebidoExtra`, logo quem está enfraquecido ou marcado **não lê o
  número na barra**; é da mesa de desenho e do bastão, e fica dito.
- **`AGUARDAM` 39 → 38:** saiu **Julgamento**, a única que paga inteiro. Marca
  do Caçador e Maldição do Patrono ficam com a dívida **trocada e escrita**;
  `SEM_DONO_HOJE` 4 → 2 (sobram Coração Tempestuoso/H5 e Mina Oculta/H6).
- **para a pessoa decidir:** nada novo foi para "pesado" neste ciclo.

---

## 16/09 17:05 · v9.275 · H3 · a cura tem relógio · commit `7bd9291`

- **estado inicial:** trava posta às 16:05 (não existia). Árvore suja só do
  lado da outra mente (E3, a tela da batalha, com o bastão do `App.jsx` desde
  as 12:58Z). `npm test` com um vermelho que não era meu.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `REGENERACAO_DO_BUFF` + `regeneracaoDaHabilidade` (`efeitos.js`),
  o ramo `cura`/`fontes` em `tickEfeitos` e `pousarCura` (`regras-jogo.js`), o
  pouso e a porta única `firmarNaArena` (`arena.js`), `textoDaHabilidade`
  público (`combos.js`), o ponteiro em `condicoes.js` e `AGUARDAM` reescrito.
- **testes:** `testes/teste-cura-turno.mjs` — **92 asserções**, nova; mais a
  §8 de `check-protecao` e a §7 de `check-cura-nao-limpa`.
- **prova:** `npm run build` limpo. `bash mente/so-o-meu.sh` com os meus 10
  arquivos: **197/197 suítes · 13/13 varredores**. Na árvore, `check-formas`
  acusa uma pílula em `src/painel-habilidades.jsx` — arquivo que a outra mente
  **criou no E3 naquele minuto**. Não consertei e não esperei.

### A pergunta que decidiu a etapa, e quem a respondeu foi a contagem

**Onde mora o espelho de `danoTurno`: na condição ou no efeito?** As duas eram
defensáveis, e o que decidiu foi um número:

| relógio | chamadores vivos | alcançáveis sem o bastão |
|---|---|---|
| `tickCondicoes` | 3 (`App.jsx:8347`, `:8418`, `:8471`) | **0** |
| `tickEfeitos` | 4 (3 no App + **`arena.js:360`**) | **1** |

Um `curaTurno` em `CONDICOES` nasceria **inerte neste ciclo** — e inerte é
exatamente o pecado que a Fase F existe para pagar. **Um sítio contra zero:**
o campo mora no efeito, e a cura pousa em PV **hoje**, com **zero linhas de
`App.jsx`**. É a mesma jogada de F1, e pela mesma razão: procurar quem já
roda antes de escrever quem ainda não. Ficou um **ponteiro** ao lado da
documentação de `danoTurno` para ninguém refazer a pergunta nem criar a régua
duas vezes. **O campo não foi posto nos dois** — seria a mesma regra em duas
cabeças com só uma paga.

### Onde a cura entra na fila — a pergunta que o ciclo tinha de responder

**Fora dela.** A fila do dano (o abafo de F1 → a invocação → **abrigo → PV
temporário → PV real → a porta da queda**) corre no **meio** do turno; o
relógio corre no **fim**, no mesmo instante em que o irmão cobra o veneno.

Provado, um turno inteiro: teto 20, vida 9, veneno 2, regeneração 3, golpe de
6 → o golpe morde 9→3, o veneno 3→1, o relógio devolve 1→**4**. E o
contrafactual é o que a ordem compra: com **3 de vida e um golpe de 4**, curar
antes **apagaria a queda**. Curar no meio da rodada e curar no fim dela são
jogos diferentes, e este escolheu o fim.

**O relógio não levanta os caídos** — guarda espelhada de `App.jsx:8350`.
Invertê-la toca a porta da queda (Fase Q), e isso é da pessoa: declarado, não
feito.

### Decisões médias, com o motivo

1. **O espelho no efeito e não na condição** — pela tabela de chamadores acima.
2. **`textoDaHabilidade` passou a público** em `combos.js`: os dois
   classificadores passam a ler **a mesma régua**. Duas leituras do mesmo texto
   é a forma de divergirem daqui a três versões.
3. **`firmarNaArena`** extraído das 5 linhas duplicadas de `arena.js` — mesma
   lei de porta única que `passarPeloAbrigo` cumpre no App.
4. **`AGUARDAM` continua 39, e devia mesmo.** As três dívidas foram
   **trocadas, não apagadas**: Círculo Sagrado fica com a zona (H6), Renovação
   com o ramo do grupo, Chamado da Chuva com o clima sem leitor. Duas ganharam
   `dono` medido, e **`SEM_DONO_HOJE` desceu de 6 para 4** com o motivo na
   asserção, como F1 fez. Meia promessa paga não sai da lista — encolhe nela.

### Medido e não reequilibrado

Catraca da arena **idêntica número a número** contra HEAD puro (sombra 55,1 ·
remendo 54,4 · chama 53,6 · voto 51,5 · flecha 49,6 · muralha 46,8 · punho
45,6 · voz 43,3 · amplitude 11,8), 420 quedas e 5 848 linhas iguais — e a
**causa está trancada na suíte**: nenhum dos 8 prontos regenera. A régua idem.

Que é viva, é: um duelista com **Chamado da Chuva** dá **8 prazos firmados, 14
pousos e 27 PV devolvidos** em 6 quedas; sem a habilidade, zero de tudo.

- **o que ficou:** a fiação dos três tiques do `App.jsx` (uma linha de
  `pousarCura` em cada, dentro de `calou(...)`) e a porta `aflicaoDe`, que
  continua a sair **antes** de `efeitoDeBuff` — o mesmo portão que F1 mediu.
  A suíte imprime a medição em vez de a travar: *"App.jsx: 3 chamadas ao
  relógio dos efeitos, 0 pousos de cura"*. Mais a cura de **grupo** e a zona
  do Círculo Sagrado (H6).
- **para a pessoa decidir:** se o relógio deve levantar quem caiu. Hoje não
  levanta, por espelho fiel do irmão que cobra o dano.

---

## 16/09 13:40 · v9.274 · F1 · a família `amortece` passa a cobrar · commit `c1038e5`

- **estado inicial:** trava posta às 09:25 (não existia). Árvore limpa fora de
  `mente/agora.json` e dos rascunhos de K4 da outra mente. `npm test` **194/194
  suítes** mas **12/13 varredores**: `check-imports` acusava
  `constantes.js: usa "ALVOS" sem importar`. Nunca se constrói sobre vermelho,
  então foi o primeiro item — e era **falso positivo do próprio varredor**.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `AMORTECIMENTO_DO_BUFF` (`src/efeitos.js`, colada à irmã
  `ABSORCAO_DO_BUFF`), a chave `amortece` a nascer em `efeitoDeBuff`, e a
  **estação nova** dentro de `amortecerDano` (`src/tracos.js`). Mediu a arena e
  **não** a ligou. Comentários de `companheiros.js` e `poder-de-classe.js`
  corrigidos; `AGUARDAM` de 40 para 39.
- **testes:** `testes/teste-amortece.mjs` — **193 asserções**, 9 seções,
  0 falhas; e `check-protecao.mjs` ganhou a seção 7 e o dente
  `amorteceForaDaFamilia`.
- **prova:** `npm run build` limpo. Na árvore, `npm test` dá **195/196** com
  `teste-ligacao` vermelha por `estilo.js:TELA_DE_BATALHA` — **export da outra
  mente, do E3, em edição naquele minuto**. Provado com
  `bash mente/so-o-meu.sh` (HEAD + só os meus 8 arquivos): **196/196 suítes e
  13/13 varredores**. Não consertei e não esperei, como manda a lei.

### Onde a família entra na ordem do dano — o coração da etapa

A fila do herói é `amortecerDano` (origem) → `repartirDano` (invocação) →
`passarPeloAbrigo`, e este último é **abrigo → PV temporário → PV real → a
porta da queda**. O abafo entra na **primeira estação, sobre o golpe cheio**,
antes do abrigo e do poço: quem reduz por **proporção** tem de morder o número
cheio, senão o mesmo buff vale metade contra quem tem escudo e o dobro contra
quem não tem; quem come um valor **fixo** morde o que sobrou, porque para ele a
ordem não muda o total.

Dentro de `amortecerDano`, **depois das duas metades de origem e antes da
redução fixa**, por três razões que são regressão se invertidas: (i) a redução
fixa continua a última, regra que o cabeçalho já escrevia antes de F1 existir;
(ii) a porta `d >= 4` da Pele de Pedra passa a ver **o mesmo número que vê
hoje** — se o abafo cortasse antes, um Goliath com o buff deixaria de gastar a
Pele em golpes que hoje a gastam, mudança de traço racial por causa de uma
habilidade, e silenciosa; (iii) a Pele é um **gasto** e rende mais sobre o
número cheio, enquanto o abafo não se gasta e pode esperar a vez.

Provado com a fila inteira: Goliath com abafo de 25% e escudo de 6 contra um
golpe de 20 → Pele 20→10 → abafo 10→8 → invocação 8 → abrigo 8→**2**.

### Decisões médias, com o motivo

1. **A moeda é porcentagem, não pontos.** `absorve` compra pontos porque o
   abrigo morre na primeira batida; `amortece` vale em **todo** golpe do prazo,
   então a régua é medida no total. A paridade está escrita degrau a degrau no
   cabeçalho e cobrada pela suíte: 2 PM → 10% → ~3 no total contra os 4 que a
   irmã come; 4 PM → 20% → ~9 contra 8. Quem paga 4 PM por proteção recebe
   proteção de 4 PM, venha ela de uma vez ou repartida.
2. **O teto é 25%, e é onde a tabela recusa a letra da ficção.** As fichas
   dizem "metade". Metade **durante turnos** seria a Pele de Pedra — um gasto
   de uma vez por luta — ligada a toda a cena por 3 PM. A lei que `GUARDAS` e
   `ABSORCAO_DO_BUFF` já escreveram é *nada que zere o golpe*, e ela vale aqui.
   **A ficção diz metade; o sistema paga um quarto, e paga em todo golpe.**
   É a decisão mais discutível do ciclo e está declarada de propósito — se a
   pessoa quiser a metade literal, é mudar um número de tabela.
3. **A arena foi medida e NÃO foi ligada.** Ligar `amortecerDano` em
   `arena.js` faria a família cumprir nas duas mesas, mas acenderia junto os
   **traços raciais** que a catraca nunca mediu: **3 dos 8 prontos** têm origem
   que ele lê (A Muralha/Goliath, A Chama/Tiefling, O Punho/Anão). Numa cópia
   descartável a catraca **quebra**: muralha 46,8 → 62,5 no retrato, 66,9 em
   "bb", três famílias fora da faixa, amplitude 21,8 contra teto 20. Não é
   zero, então não liguei — o número fica escrito para F2.
4. **`AGUARDAM` 40 → 39.** `Postura Defensiva` saiu (atravessa a porta
   inteira). `Corpo de Ferro` ficou, com a dívida **trocada** de "a mecânica
   não existe" para "a porta não abre", e com `dono` escrito. O motivo da
   mudança do teto está no comentário da asserção, como a lei pede.
5. **O varredor deixou de acusar quem reexporta** (commit `2b99c79`, antes do
   item). `check-imports` não conhecia `export { X } from`, e quem levava a
   acusação era decidido pela **ordem alfabética**: há dois reexports no
   projeto, e `portao.js` escapava só porque vem depois de `cena` no alfabeto.
   Um varredor que grita por engano perde o único valor que tem.

### O achado honesto, e é o que F2 herda

**As 8 da família nascem com número; só 2 atravessam a porta de produção de
hoje** (`Postura Defensiva` e `Proteção contra Energia`). As outras 6 não casam
com `aflicaoDe`, e `aplicarBuffDeHabilidade` (`App.jsx:8136`) sai **antes** de
`efeitoDeBuff` — o efeito nunca chega à ficha. Isso é `App.jsx`, cujo **bastão
esteve com a outra mente o ciclo inteiro** (E3, a tela da batalha), e fica
declarado em vez de meio-feito. É a mesma lição de W2: meia troca é a mesma
regra em dois caminhos.

- **o que ficou:** a porta `aflicaoDe`; a arena, com o número que a proíbe
  hoje; o piloto dos companheiros **intocado de propósito** (P2 provou que
  procurar vem depois de cumprir); e `protege`, `intocado` e `nao_cai` ainda
  com força zero — **mas o molde está estabelecido**, que era o que F1
  prometia: tabela irmã + chave que só nasce quando existe + estação na fila
  do dano + seção no varredor.
- **para a pessoa decidir:** nada novo foi para "pesado" neste ciclo. A única
  coisa que pede o olho dela é a decisão 2 — o quarto em vez da metade.

---

## 16/09 09:25 · v9.272 · Z1 · o recálculo, e a prova de que ele não se mexe · commit `400748a`

- **estado inicial:** trava `.claude/ciclo-em-curso` **não existia** — mas
  `mente/agora.json` tinha, por commitar, duas linhas de um Z1 **que morreu
  antes de escrever uma linha de código** (`orquestrador` e `backend`, com
  `desde` marcado às 22:00Z, hora que ainda não aconteceu). **Registo de ciclo
  morto**, como manda o roteiro: nada no disco além daquelas duas linhas, que
  reaproveitei com a hora certa. Árvore de resto limpa, `npm test` verde de
  entrada. A outra mente estava viva ao lado no K4 (trava
  `.claude/ciclo-desenho-em-curso` das 08:47, `mente/k4-desenho.md` por
  commitar) — **nada disso entrou no meu commit**, e o bastão do `App.jsx`
  nunca esteve comigo.
- **A versão não mudou debaixo de mim desta vez** — reli `src/constantes.js`
  imediatamente antes de bumpar, como Y1 ensinou, e ainda dizia `v9.271`.
  Fui para `v9.272`. A releitura continua a ser barata e a suposição continua
  a ser cara.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/recalculo.js` (4 exports) e a extração da fórmula de PV/PM
  de `src/prontos.js:171-173` para `corpoDaFicha`.
- **testes:** `testes/teste-recalculo.mjs` — **54 asserções**, 0 falhas, e a
  medição de divergência impressa em vez de travada.
- **prova:** `npm run build` limpo, `npm test` **194/194 suítes verdes**.
  Não precisei de `mente/so-o-meu.sh`: não havia vermelho de ninguém.

### As três propriedades, e como cada uma ficou provada

1. **Idempotente** — n = 1..10 sobre **1 008 fichas** (12 classes × 7 níveis,
   escolhidos nos degraus onde `bonusProficiencia` vira, × 2 configurações de
   atributos × 3 antecedentes × {certa, torta}). A asserção é tripla: `mudou`
   falso na 2.ª passagem, igualdade profunda 2.ª↔10.ª, e `recalc^n ===
   recalc^1` ficha a ficha. *"Abrir o jogo dez vezes não move um ponto"* é
   literalmente esta asserção, e está escrito assim no comentário.
2. **Mudo quando não é preciso** — a asserção é **identidade referencial**
   (`r.ficha === pers`), não só `JSON.stringify` igual. **É a diferença que
   importa:** um clone com as mesmas chaves passa num teste de JSON e continua
   a ser uma escrita. Só a identidade prova que nem sequer houve cópia.
3. **Deriva das tabelas** — a suíte **remonta** a fórmula de `vidaBase`/
   `manaBase`, `pv`/`pm` do antecedente e `PV_POR_NIVEL`/`PM_POR_NIVEL`, e o
   teto de nível sai de `XP_ACUMULADO.length` em vez de um `20` escrito à mão.
   Nenhum número na asserção; é o que a faz sobreviver a uma mudança de tabela.

### As decisões médias, com o motivo

- **O recálculo NÃO sobe de nível pelo XP — e esta é a decisão pesada da
  etapa.** Subir exige **gastar** o XP; `xp` não é campo governado; logo um
  nível movido sem o XP gasto sobe outra vez na leitura seguinte. Medido com a
  própria tabela: nível 1 com 100 000 XP daria **1 → 12 → 16 → 18 → 20 em
  quatro aberturas** — literalmente o *"status diferente em cada gameplay"*
  que a pessoa proibiu. O dono da subida continua a ser `aplicarNivel`
  (`regras-jogo.js:37`), que roda a cada ganho de XP e por isso garante
  `xp < custo(nivel)` em toda ficha bem formada. Aqui o nível é **saneado**
  (`floor`, nunca `round` — arredondar para cima daria meio degrau de graça) e
  serve de entrada para os outros três. **O desenho errado ficou escrito no
  teste pelo nome e pelo número** (§5b), no molde do "desenho A" de
  `teste-trava-da-reacao`, com uma asserção a provar que ele move mesmo a
  ficha: senão a catraca não saberia reconhecer o erro no dia em que voltasse.
- **Ausência não é divergência.** Campo `null`/`undefined` não discorda.
  Nenhuma ficha de hoje guarda `proficiencia` — deriva-a na leitura — e
  escrevê-la em todo save seria mudar dado do jogador **sem necessidade**, que
  é metade da ressalva. Quem guarda o campo e o guarda errado é corrigido. E
  **`0` não é ausência**: `vidaMax: 0` é ficha partida e é consertada.
- **`vida`/`mana` correntes ficaram de fora.** A lei da etapa é *nada fora de
  `CAMPOS_DO_RECALCULO` é tocado, nunca*. Se um teto cair, uma ficha pode
  ficar com `vida > vidaMax` — **quem apara o corrente é quem aplica na tela,
  com o veredito antes do clique.** É hand-off explícito para Z2.
- **Não passa por `antecedentePorId`.** Aquele leitor cai no primeiro da lista
  quando não acha — serve à criação, que precisa sempre de um antecedente, e
  aqui daria o corpo do Órfão a qualquer nome escrito errado. Quem pergunta
  pelo corpo quer a verdade ou o silêncio, nunca um palpite.
- **Duas asserções do `testes` ficaram vermelhas contra o módulo e foram
  reescritas — nenhuma afrouxada, e o motivo está em comentário nas duas.** A
  mão de testes tinha presumido que o recálculo derivaria o nível do XP; o
  contrato nunca o disse e o `backend` decidiu o contrário com razão medida.
  A segunda exigia que o recálculo escrevesse por cima de campo ausente, e
  virou a §7b — a asserção da lei que ela estava a contrariar.

### O achado: quantas fichas divergem, e quanto

**Do recálculo novo: nenhuma.** 0 de 8 prontos e 0 de 504 fichas certas; nem
um PV nem um PM se move. Os oito prontos saíram **idênticos byte a byte** à
extração — medido por snapshot `JSON.stringify` da ficha inteira antes e
depois, não só dos dois campos.

**Da recalibração de hoje, sobre o mesmo corpus de 144 fichas: quase todas.**
O PV mexeria em **120 de 144** (erro médio 4,5 PV; pior caso um Mago nível 20,
128 → 145, **+17**) e o PM em **138 de 144** (erro médio **19,7 PM**; pior
caso o mesmo Mago, 90 → 46, **−44**). A razão está nomeada: ela usava
`pvEsperadoJogador` (`combate.js:465`), que é a **régua do balanceamento** —
estimativa de classe média — e nunca foi a ficha de ninguém; e inventava o PM
numa linha solta (`App.jsx:20853`) que não batia nem com `prontos.js` nem com
a tela de criação. **Nada foi ajustado para caber:** é achado, e é ele que
justifica Z2.

**A honestidade da medição:** o corpus é *construído*, não é um save real de
uma partida real — não há fixture de save no projeto. Os 0/8 dos prontos são
fichas de verdade; os 0/504 são fichas montadas como o jogo as monta (criação
no nível 1 + `aplicarNivel` pagando o XP exato de cada degrau). **Quantas
fichas de jogador de verdade divergem, só Z2 saberá**, ao correr o recálculo
num load a sério.

### O que já existia e foi reusado em vez de reescrito

A lição de H2 (6 dos 12 assuntos já tinham dono) e de Y1 (3 das 4 peças já
existiam) pagou-se a terceira vez: **os quatro números já tinham dono.**
`bonusProficiencia` (`regras.js:12`), `XP_ACUMULADO` (`regras.js:38`),
`PV_POR_NIVEL`/`PM_POR_NIVEL` (`regras-jogo.js:34-35`), `vidaBase`/`manaBase`
(`classes.js`), `pv`/`pm` (`antecedentes.js`). **Não nasceu tabela nova** — o
que nasceu foi o **lugar único** onde se lê todas elas. E a extração pagou-se
já: a fórmula tinha **três donos** (prontos, criação, recalibração) e o
terceiro já tinha divergido dos outros dois sem ninguém dar por isso.

### O que ficou

- **Z2 herda três coisas:** as três portas por fechar (save, mundo, ascensão,
  incluindo o botão que diz *"⚖ Recalibrar com a IA"* em
  `painel-ascensao.jsx:35` e `:229`), **o aparo de `vida`/`mana` correntes**
  quando um teto cai, e a medição real contra saves de jogador. Precisa do
  bastão do `App.jsx`.
- **Uma armadilha latente, já com catraca.** `corpoDaFicha` usa
  `(cObj && cObj.vidaBase) || 10` — um `||`, não um `??`. Hoje as 12 classes
  têm `vidaBase`/`manaBase` verdadeiros; uma classe futura com `vidaBase: 0`
  cairia no default de 10 em silêncio. A §6 fica vermelha nesse dia. Não é bug
  hoje, e não foi mexido para não mudar número.
- **Nada para a pessoa decidir** neste ciclo.

---

## 16/09 08:00 · v9.271 · Y1 · `Empurrar` e `Derrubar` ganham motor · commit `384c3d5`

- **A VERSÃO MUDOU DEBAIXO DE MIM, e é registo de processo.** Abri o ciclo com
  `v9.269` lido em `src/constantes.js` e planeei `v9.270`. Quando fui bumpar,
  ao fim do ciclo, o `constantes.js` **já dizia `v9.270`**: a outra mente
  fechou K3 (`9901996`) enquanto eu trabalhava e levou o número. Reli o
  arquivo em vez de aplicar o que tinha planeado, e fui para **`v9.271`** — a
  lei diz que em conflito de `VERSAO` fica o número maior. **É exatamente o
  motivo por que o `CLAUDE.md` manda ler a versão no arquivo e nunca de um
  exemplo escrito**, e desta vez o exemplo que envelheceu era o meu, com meia
  hora de idade. Três textos meus já diziam `v9.270` e foram corrigidos.
- **estado inicial:** árvore com a outra mente (K3) viva ao lado — `App.jsx`,
  `estilo.js`, `ritmo-da-reacao.js`, `formas.md` e dois `k3-*.md` modificados,
  mais `painel-reacao.jsx` e `palavras-da-reacao.js` por commitar. **Nada
  disso era meu e nada disso entrou no meu commit.** A trava
  `.claude/ciclo-em-curso` **não existia** (o ciclo de V1 fechou-a); pus a
  minha. O bastão do `App.jsx` estava com o `regente`/`oficial` desde as
  07:42 — **menos de 90 minutos, logo vivo: não lhe toquei**.
- **o vermelho que me foi anunciado e que já não existia:** o briefing avisava
  de um `teste-ligacao` sobre `ritmo-da-reacao.js`, arquivo da outra mente.
  No meu `npm test` de fecho ele estava **verde** — a outra mente fechou-o e
  commitou K3 durante o meu ciclo. Não precisei de `so-o-meu.sh`.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** `src/disputa.js` (7 exports), três nomes novos em `src/grid.js`
  e o buraco de X2 fechado em `src/golpe.js`.
- **testes:** `testes/teste-disputa.mjs` (163 asserções), a asserção movida em
  `testes/teste-golpe.mjs` e a sonda `testes/sonda-empurrao.mjs`.

### As decisões médias, com o motivo

- **UM módulo para os dois verbos, não dois.** `Empurrar` e `Derrubar` são o
  **mesmo teste oposto com dois desfechos**; dois módulos seriam dois motores
  da mesma regra, e o dia em que um mudasse o outro mentiria. O nome
  `disputa.js` é o que o próprio código já usava para a ausência:
  `golpe.js:245` dizia *"o motor não tem disputa entre duas fichas"*.
- **O deslocamento forçado ficou em `grid.js`, não em `disputa.js`.** A lei da
  etapa era *não criar um segundo motor de movimento*, e quem é dono da
  posição, da parede e da casa ocupada é o tabuleiro. `disputa.js` decide
  **quem ganha**; `grid.js` decide **para onde o corpo vai**.
- **Empate ganha quem resiste.** O empurrão é de graça em consequência — não
  custa vida, não erra crítico. Uma ação barata que ganhasse empates seria
  clicada todo turno.
- **A resistência tem duas portas (Força/Atletismo ou Destreza/Acrobacia, a
  melhor).** Sem a segunda, uma ficha de Destreza alta e Força zero não teria
  defesa nenhuma contra um botão.
- **Vitória com destino bloqueado NÃO causa dano.** Dano de parede seria
  mecânica nova, e mecânica nova é da pessoa. O resultado diz `bloqueio` e o
  alvo fica onde estava — está escrito no cabeçalho que foi deliberado.
- **A força de quem não tem ficha saiu da linha para a tabela.** O inimigo do
  bestiário não tem `atributos`; o precedente de produção (`aflicoes.js:99`)
  resolve-o pelo nível. A **forma e o número são dele** — só a régua mudou de
  casa, e agora a suíte lê-a de volta.

### O que já existia e foi reusado em vez de reescrito

A lição de H2 (dos 12 assuntos, 6 já tinham dono) pagou-se outra vez: **três
das quatro peças já existiam.** A condição prono é o `caido` de
`condicoes.js:120` — **não nasceu condição nova**; o portão de tamanho é a
`ESCADA` de `grid.js:95`, cujo comentário já dizia, literalmente, que é ela
que dá sentido a *"empurrar um degrau"*; e a perícia estava escolhida desde
sempre, porque a descrição de `atletismo` em `pericias.js:40` já continha a
palavra **"empurrar"**. O que faltava mesmo era só o **teste oposto** e o
**passo forçado numa direção**.

**E uma armadilha de nome que quase custou caro:** `src/queda.js` (Q1) tem
`GOLPE_NO_CAIDO`, mas ali "caído" quer dizer **inconsciente a 0 PV**, não
prono — mecânicas opostas com o mesmo nome. Há agora uma asserção que prova
que `disputa.js` **não importa `queda.js`**, para que a próxima pessoa não as
funda.

### A asserção que se moveu, e por que não foi afrouxamento

`teste-golpe.mjs` dizia `"esquivar,empurrar,derrubar"` continuam sem motor.
Ficou mentira no dia em que Y1 nasceu. Foi movida para `"esquivar"` com ~25
linhas de motivo escrito por cima — e **ganhou um segundo dente**: a tabela
nomeia `disputa.js`, e uma asserção nova importa-o e prova que as funções
nomeadas **existem mesmo**. Sem isso, fechar o buraco seria escrever uma
string no campo `motor`.

### O efeito na distância, medido — e a régua que não servia

**A régua de B1 não pode medir isto, e está provado no próprio arquivo:** ela
roda com `grade: null` (`regua-combate.mjs:935`, declarado em `:484-486`), e
`TABULEIRO_NA_REGUA` lista `"distancia"`, `"posicao"` e `"deslocamento"` em
**`naoMede`** — além de os três cenários estarem **saturados** (duro 0,0% ·
justo 1,6% · brando 100%). Foi a ressalva de Q1 confirmada por leitura, e não
por suposição. Então a medida foi feita por **sonda** sobre as `PLANTAS`
reais: 10 plantas × 2000 empurrões, com sorte semeada.

- **1,50 m por empurrão bem-sucedido, sem dispersão nenhuma.** A hipótese
  escrita **antes** de medir era que a diagonal desse menos (Chebyshev);
  **estava errada**, e a sonda di-lo — que é toda a razão de se medir.
- **Bloqueio: 22,1% das vitórias** em bruto; **5,6%** contando só alvos que não
  começavam encostados à moldura (a colocação uniforme infla a `borda`; os
  dois números estão declarados).
- **E o terreno importa de forma diferente em cada planta:** masmorra 10,5% ·
  taverna 10,4% · cidade 8,0% · ruína 7,5%, contra floresta 1,2% · deserto
  1,7% · estrada 2,0%. É o que um verbo de posição devia fazer.
- **Contra a caminhada de W1** (1,4 rodadas = 12,6 m por luta): um empurrão
  vale **0,167 rodada (11,9%)**, e um turno de empurrão devolve **16,7%** do
  que um turno de corrida devolve. **Empurrar não é uma forma barata de fazer
  distância — e não devia ser:** gasta o turno inteiro para mover uma casa
  alguém que resiste. O que ele compra é posição.
- **Nada foi reequilibrado**, como a etapa mandava.

### O que ficou

- **A fiação é Y2, e não foi por escolha:** o bastão do `App.jsx` esteve com a
  outra mente o ciclo inteiro. Os dois botões continuam a só escrever uma
  frase na caixa. Entrou na pauta como **Y1b**, médio.
- **O reforço entra na luta sem `x`/`y`** (X3b/X4) — **esbarrei e não
  consertei**, como mandado. `deslocarForcado` e `destinoDoEmpurrao` tratam-no
  defensivamente (não estouram, devolvem motivo), e o achado **continua
  aberto**.
- **Para a pessoa, se quiser:** dar ao bicho a destreza real (`des`, que o
  bestiário já traz) na resistência ao empurrão, em vez de só o `nível/4`. A
  linha está pronta na tabela, com o motivo — mas é mecânica nova, logo dela.
- **Nota de processo:** as duas mãos correram em paralelo contra um contrato
  que eu pinei, e mesmo assim ele derivou quatro vezes (`{dx,dy}`↔`{x,y}`, o
  campo `total`, `destinoDoEmpurrao` a sair e voltar). O paralelo poupou
  tempo, mas **o contrato pinado não bastou**: com módulo novo e suíte nova ao
  mesmo tempo, vale sequenciar ou pinar até o formato de retorno.

---

## 16/09 07:55 · v9.269 · V1 · o poço que apanha por você · commit `056dcd2`

- **HOUVE UM CICLO MORTO, e é a primeira coisa que este bloco regista.** A
  trava `.claude/ciclo-em-curso` estava posta às **05:09** com o meu nome e
  este item (`orquestrador · V1 · o PV temporario`), e o ciclo **morreu no
  limite de uso da API — não por falha**. Às 07:38 ela tinha 2h29, muito
  acima dos 90 minutos do roteiro: assumi-a em vez de esperar por ela, e
  reescrevi-a com a hora nova e a nota `(assumido de um ciclo morto)`. **Não
  desfiz nada do que ele deixou**, e a razão é que o que ele deixou estava
  quase todo de pé: `src/temporario.js` (414 linhas), `testes/teste-temporario.mjs`
  (967 linhas, 212 asserções) e `src/efeitos.js` ligado. Desfazer teria
  queimado uma etapa inteira por causa de uma linha de comentário.
- **estado inicial:** `npm test` **190/191**, e a única vermelha era
  `teste-regua.mjs` — a catraca da seção 9, *"e nada do jogo importa a régua
  — nem sequer a menciona"*, com `temporario.js` a nomeá-la. Árvore com a
  outra mente viva ao lado (K3): `mente/formas.md`, `mente/k3-jogo.md`,
  `mente/k3-desenho.md` e `mente/agora.json` são dela e **não entraram no meu
  commit** — `git commit -- <caminhos>`, como a lei manda.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **UM VERMELHO QUE NÃO É MEU, e a prova de que não é.** No fecho, `npm test`
  acendeu `teste-ligacao.mjs` em `ritmo-da-reacao.js:TEMPOS_DO_CARTAO` — um
  export sem leitor num arquivo **da outra mente**, que apareceu na árvore no
  meio do meu ciclo (K3, com `src/estilo.js`). Não o consertei e não esperei
  por ele: `bash mente/so-o-meu.sh src/temporario.js src/efeitos.js
  src/constantes.js testes/teste-temporario.mjs` dá **HEAD + só os meus =
  191/191 suítes verdes · 13/13 varredores limpos**. Verde ali é verde meu, e
  foi com isso que subi. A catraca de K3 morde quem a pôs, e é assim que ela
  tem de funcionar.
- **o bastão do `App.jsx`: NÃO TOMADO.** É da outra mente (K3). V1 é só
  motor; V2 (a tela) fica para quem tiver o bastão, e o que ela vai precisar
  está **escrito** no cabeçalho de `src/temporario.js`, não por descobrir.
- **backend:** uma coisa só, e a certa — tirou o nome do instrumento de
  medida do comentário de `src/temporario.js`. Três frases reescritas: *"a
  régua tem de ser a de cima um degrau acima"* → *"a **medida** tem de ser"*;
  a abertura que citava o arquivo e o caminho virou *"**MEDIDO, e não
  estimado** — a medição inteira (N, cenários, intervalos) está escrita no
  diário desta versão; aqui fica só o que justifica o número"*; e a ressalva
  de Q1 virou *"**a medição correu com `grade: null`**"*. Os números da
  tabela **não foram tocados**.
- **testes:** nenhuma suíte escrita neste ciclo — as do ciclo morto já
  cobriam tudo (212 asserções em 10 seções). `grep -rn "regua-combate" src/`
  sai **vazio**; `teste-regua.mjs` fechou **150 ok · 0 falhas**.

- **decisões médias tomadas** (cada uma com o motivo, que é o que se audita):
  1. **A catraca não foi afrouxada — o código é que passou a cumpri-la.** A
     saída fácil era pôr `temporario.js` numa lista de exceções de
     `teste-regua.mjs`. Seria a casa a escrever que *às vezes* o jogo pode
     falar do instrumento que o mede, e a próxima exceção viria de graça. O
     dente da seção 9 fica com os dentes todos.
  2. **O número medido fica, o nome de quem mediu sai.** O comentário de um
     número de tabela é o que torna a lei *"se é número, é tabela"*
     auditável — apagar o **porquê** de `teto: 9` para calar a catraca teria
     trocado um vermelho por uma regra sem razão escrita. Então ficou o fato
     (9,69 de dano por corpo por rodada; **9 é o maior inteiro abaixo**) e
     saiu a proveniência, que passou a morar aqui, no diário — que é o lugar
     do registo de medição.
  3. **Não desfiz o ciclo morto, assumi-o.** O roteiro manda desfazer *"se a
     árvore estiver pela metade"*; esta não estava — estava a uma linha de
     comentário do verde, com build limpo e 212 asserções de pé.

- **A MEDIÇÃO, POR EXTENSO** (é aqui que ela mora agora, e é o que
  `src/temporario.js` quer dizer com *"o diário desta versão"*):
  instrumento `testes/regua-combate.mjs`, **300 combates por cenário**,
  herói equipado (arma, armadura, escudo) e o trio de nível 5.
  · `justo` — **6,30 ± 0,25 rodadas**, **243,91 ± 6,82** de dano no grupo
    inteiro (quatro corpos) → ~38,7 por rodada → **9,69 por corpo por rodada**.
  · `duro` — 5,09 rodadas, 223,92 de dano → **11,00** por corpo por rodada.
  · `brando` — 2,95 rodadas.
  Daí os dois números da tabela: **`teto: 9`** é o maior inteiro abaixo de
  **9,69** (manda o menor dos dois, porque é na luta mais branda que uma
  rodada de graça é mais barata de comprar) — o poço mais caro que o sistema
  pode dar **nunca compra uma rodada inteira de impunidade**, que é a mesma
  lei que o teto 12 escreveu para o golpe. E **`turnosPadrao: 7`** é o
  primeiro inteiro acima da margem de cima de 6,30 ± 0,25, porque um poço que
  expira no meio da luta é o mesmo que não existir.
  **MEDIDO, E NÃO REEQUILIBRADO:** nenhum número do jogo mudou neste ciclo.
  **E COM A RESSALVA QUE Q1 IMPRIMIU:** a medição corre com **`grade: null`**
  — sem tabuleiro, todo golpe alcança toda gente e ninguém gasta rodada a
  andar. É **limite otimista, não o jogo**. Com grade a luta é mais longa (X1
  mediu 2 a 3 rodadas só de caminhada), logo **7 é piso da duração real e não
  o retrato dela** — o poço cobre a luta medida, e na luta de verdade pode
  acabar antes. Se um dia a régua ganhar grade, é este 7 que se remede.

- **A ORDEM DO DANO, COM A QUEDA NO MEIO** (o cuidado que Q1 tornou
  necessário, e a pergunta que a pessoa fez):
  `abrigo (família absorve) → TEMPORÁRIO → PV real → a porta da queda`
  · **O temporário é consumido ANTES de `quedaAoChegarAZero` ser perguntada
    — e não por uma regra nova.** Sai por **composição**: `absorverDano`
    (efeitos.js) é a **única** porta por onde o dano passa antes de virar PV,
    e a porta de Q1 só é perguntada quando o **PV real** chega a zero. Q1
    ficou **intocada — nem uma linha**.
  · **O abrigo vem primeiro por regressão**, não por gosto: ele gasta-se
    inteiro assim que toca num golpe, e pôr o poço à frente mudaria *quando*
    ele se gasta — o escudo passaria a render mais do que rende hoje. Com o
    abrigo primeiro, a fase é **puramente aditiva**: ficha sem temporário
    devolve byte a byte o que devolvia antes.
  · **Provado, e não afirmado** (`teste-temporario.mjs` §7): um herói com 3 de
    vida apanha um golpe que **sem** o poço o levaria a 0 — e a 0 a porta de
    Q1 decide se ele cai. **Com** o poço consumido antes, o PV real fica
    acima de zero e *"a porta da queda NUNCA chega a ser perguntada"*; sem
    ele, a porta responde que o herói cai — e o desfecho é **lido de volta**
    de `quedaAoChegarAZero`, não escrito à mão, para acompanhar sozinho o dia
    em que "cai" mudar de palavra. **Ninguém cai com escudo de pé.**

- **"FICA O MAIOR", PROVADO NOS DOIS SENTIDOS** (§3, §4 e §9):
  `POUCO depois MUITO` e `MUITO depois POUCO` dão **MUITO** nos dois casos, e
  a asserção **nega a soma explicitamente** (`!== POUCO + MUITO`) para dizer o
  que impede, não só o que espera. Três lançamentos seguidos do mesmo poço
  continuam a dar **um** poço. A oferta menor **não é aceite, não escreve
  linha nenhuma** e devolve a **mesma** ficha que entrou (o empate idem — um
  objeto novo faria a fiação de cima piscar por uma mudança que não existe),
  mas ainda diz **porquê** para o log. E **não cura**: `vida` e `vidaMax` saem
  intocados nos dez caminhos, inclusive com o maior poço possível sobre um
  corpo moído. O "fica o maior" tem **um dono só** (`vereditoDoTemporario`), e
  §9 compara as duas pontas (`absorverDano` e `gastarTemporario`) nos mesmos
  seis pares e cobra o mesmo número, o mesmo resto e a mesma frase — sem
  espiar o código.

- **o que ficou (o que V2 herda, escrito e não por descobrir):**
  1. **`tickTemporario` não é chamado por ninguém** — o relógio da rodada é
     de V2, ao lado de `tickEfeitos` (`regras-jogo.js:369`). **Enquanto não
     andar, o poço dura para sempre.** É a dívida declarada desta etapa.
  2. **`ganharTemporario` também não tem quem o chame** — a torneira (poção,
     milagre, habilidade) é de V2/V3. O módulo nasce com a regra pronta e a
     torneira fechada, de propósito.
  3. **`vereditoDoTemporario` é a tela de V2**: `haEscolha: true` é o sinal de
     que o jogador tem uma decisão de verdade (4 contra 10) e de que ela deve
     aparecer **antes do clique**.
  4. **O furo de `arena.js:249`**: ela escreve de volta só `outro.efeitos`
     quando `absorvido > 0`, e o poço vive em `pers.temporario`, que essa
     linha não copia — num duelo, o temporário seria gasto e esquecido a cada
     golpe. **Hoje não morde ninguém** (nada põe temporário num duelista); no
     dia em que puser, é essa linha que mente. `App.jsx` (`passarPeloAbrigo`)
     já devolve `ab.pers` inteiro e não tem o problema.
  5. E o par disso: `ab.linha` é `""` quando o `absorvido` vem só do poço, e a
     arena empurraria `"Nome — "` para o log. **`linhaDoTemporario` existe
     para V2 ter o que pôr ali.**

---
## 16/09 08:20 · v9.268 · Q1 · quem cai, e quem só morre · commit `7a519be`

- **estado inicial:** trava `.claude/ciclo-em-curso` **ausente** — pus a
  minha. Árvore só com `mente/agora.json` e dois documentos da outra mente
  (K2), que ela commitou durante o ciclo. `npm test` **verde de saída**.
  `VERSAO` relida em `src/constantes.js` antes de datar: `v9.266` no início,
  e a outra mente subiu `v9.267` (`ae1be0b`, `d5b9569`) **no meio do ciclo**
  — **releio antes de fechar e redatei 7 comentários** de `v9.266` para
  `v9.268`. É exatamente a armadilha que custou 32 redatações em H1, e desta
  vez a segunda leitura apanhou-a.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **o bastão do `App.jsx`: NÃO TOMADO.** `.claude/app-jsx` era da outra
  mente (W2/K2, 06:40). A etapa foi desenhada para caber **só no motor**: o
  App foi lido e não tocado, e a fiação ficou **escrita** no cabeçalho de
  `src/queda.js` para Q2 a aplicar de uma vez.
- **backend:** `src/queda.js` (novo) — `DONOS_DA_QUEDA` (herói **sempre**,
  companheiro **sempre**, inimigo **se importante**), `quedaAoChegarAZero`
  como porta única que nunca lança e nunca devolve `null`,
  `APELIDOS_DO_LADO` (cobre o `ref` de `combate.js` sem tradução à mão),
  `ehImportante` que só aceita `importante === true`, e `GOLPE_NO_CAIDO`.
  Em `src/bestiario.js`, o campo declarado `importante` no molde do
  `degrau` de N2, e `completarInimigo` a carregá-lo até à ficha que chega à
  luta — pela terceira vez que esta casa paga por uma tabela que a mesa não
  vê (`perfil` v9.152, `degrau` v9.259).
- **testes:** `testes/teste-queda.mjs` (novo, 81 asserções em 8 seções) e
  `testes/sonda-queda.mjs` (novo, medição). A suíte deriva a expectativa da
  **coluna `testa` da própria tabela** em vez de repetir 1/2/3 à mão, varre
  22 entradas tortas e 16 valores falsos de `importante`, e prova o contrato
  com `aplicarTesteMorte` empurrando falhas pelo motor real até `morto`.
  `teste-ligacao` **20/1 → 21/0** e `check-mortas` **1 → 0 exports sem
  leitor**: `falhasDoGolpeNoCaido` nasceu sem leitor e a suíte fechou-o no
  mesmo dia, que é o que a catraca existe para forçar.

- **decisões médias tomadas** (cada uma com o motivo, que é o que se audita):
  1. **O módulo chama-se `queda.js` e não reescreve `testeDeMorte`.** A
     decisão ("cai ou morre?") e a sorte ("resiste ou enfraquece?") são duas
     perguntas; misturá-las tornaria Q1 improvável sem semente. `combate.js`
     ficou **intocado**.
  2. **O padrão de quem não se declarou é MORRER DIRETO.** Um lado
     desconhecido que caísse ganharia imortalidade por acidente, e o nome
     inventado pelo Narrador é o caso comum, não o raro.
  3. **5 das 27 criaturas declaram `importante`** — Dragão Jovem, Lich,
     Dragão Ancião, Comandante, Horror. Critério escrito: aparece sozinha e
     nomeada, e o jogo perde o fim dela se acontecer sem cena. Deixei duas
     exceções de propósito — o **Comandante** é `elite` e declara, o
     **Colosso** é `lendario` e não — porque são a prova viva de que o campo
     **não** sai da `ameaca`, que é a adivinhação que a pauta proíbe.
  4. **`e.importante` vindo da IA é ignorado.** O Narrador nomeia; quem
     declara mecânica é a tabela. Torna `completarInimigo` idempotente.
  5. **O golpe em quem já caiu custa 1 falha (2 no crítico) e 0 em quem não
     testa.** O ciclo exigia que a tabela dissesse o que faz com os 13,4%-18%
     de N1; a alternativa — deixá-lo evaporar — premia o azar de quem já
     perdeu alguém. `falhasAteMorrer: 3` espelha o literal de
     `aplicarTesteMorte`, com a suíte a provar que os dois concordam.
  6. **Contadores de diagnóstico no retorno de `simularCombate`**
     (`danoEmCaidos`, `golpesEmCaidosPorNome` e mais cinco). Somar campo ao
     retorno não muda veredito: **`CATRACA_DE_UMA_VIDA` intacta**, nenhum
     limiar tocado, nenhum cenário alterado.
  7. **Corrigi o cabeçalho de `queda.js` eu mesmo** depois da medição, em
     dois pontos: os números de N1 e a frase "o herói escapa por acidente".
     Comentário que mente é pior que comentário ausente, e este ia para Q2
     como instrução.

- **a medição, e ela diverge de N1 — não se forçou o número antigo.**
  1000 sementes, família `umavida`, IC 95%, Adversário ligado:

  | | justo | duro |
  |---|---|---|
  | golpes em corpo caído | 4,97 ± 0,13 | 5,43 ± 0,14 |
  | dano em corpo caído | 61,20 ± 1,65 PV | 67,18 ± 1,83 PV |
  | fração do dano inimigo | **20,02%** | **22,68%** |
  | *projeção Q1:* quedas que virariam morte | **0,868 ± 0,047** | **0,990 ± 0,050** |

  N1 escreveu 13,40%/18,03%; mediu-se **20,02%/22,68%**. A causa está no
  próprio diário: N1 mediu **antes de N1b** (o conserto da ordem da rodada) e
  com parte da conta vinda de uma reconstrução de scratchpad que o diário já
  marcava como reconstrução. Com o Adversário **desligado** os mesmos
  contadores dão 3,78%/6,59% — nenhuma das duas pontas reproduz 13,40%, e
  quem gera a sobra é quem concentra fogo.
  **Duas ressalvas que viajam com todo número acima:** (a) a régua corre com
  `grade: null` (X4) — **não tem tabuleiro**, todo golpe alcança, logo isto é
  o **limite otimista** do desperdício e nunca "o jogo"; (b) tudo na metade de
  baixo é **projeção**, porque Q1 não liga nada e a mesa de verdade reagiria
  (quem morre deixa de ser alvo).
  **Registado e NÃO reequilibrado**, como o ciclo mandou: balancear é da
  pessoa, e a régua está saturada até ela responder sobre o alvo tático.

- **o que Q1 achou e muda o alcance de Q2:** a frase do cabeçalho que dizia
  que **o herói escapa** do desperdício por acidente de referência foi medida
  e **desmentida** — são **2,03 (`justo`) e 1,86 (`duro`)** golpes por combate
  em herói **já** no chão. O filtro de `combate.js:267` tira quem estava
  caído no **início** do passo; quem cai **durante** o passo apanha, herói
  incluído. O conserto da foto é dos **três lados**, e está escrito na pauta
  em Q2.

- **o que ficou:** **Q2 não foi tocada** (o ciclo mandou um item). Continuam
  na fila, e Q1 **não** os tocou porque são fiação: a **queda e a morte de
  companheiro são silêncio absoluto** (`App.jsx:13967`, achado de X3b) e o
  **reforço entra sem `x`/`y` nem iniciativa** (X4). `mente/pedidos-ao-sistema.md`
  foi lido: **nada atendido neste ciclo** — os nove abertos são de `turno.js`,
  `falas.js`, `desafios.js` e do `App.jsx`, e nenhum cabia numa etapa que se
  proibiu o App para não tomar o bastão da outra mente.
- **fechamento:** `npm run build` limpo, `npm test` **190/190 suítes · 13/13
  varredores**. Não houve vermelho da outra mente para separar — K2 e W2
  estavam verdes. `bash mente/so-o-meu.sh` (HEAD + só os nossos) deu
  **189/189 · 13/13**, 189 porque `teste-trava-da-reacao.mjs` da outra mente
  ainda não estava em HEAD quando se provou.

## 16/09 07:10 · v9.266 · H2 · de quem já são os 12 · commit `59dab1e`

- **estado inicial limpo, pela primeira vez em três ciclos.** Trava ausente —
  pus a minha. `git status` só com `mente/agora.json` (o painel), a outra mente
  com o `App.jsx` já commitado (`eadef55`, D3). `npm test` **verde de saída:
  188/188 suítes, 13/13 varredores.** `VERSAO` relida em `src/constantes.js`
  **antes** de datar qualquer comentário — `v9.265` em HEAD e na árvore, logo
  esta etapa sai **v9.266**. (H1 teve de redatar 32 comentários por não fazer
  isto; desta vez a outra mente não subiu no meio, mas a releitura custou nada.)
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **o bastão do `App.jsx`: NÃO TOMADO.** A etapa era medição e registro em
  `src/poder-de-classe.js`; o App só foi **lido**. A outra mente (K2) precisava
  dele para aplicar as quatro frases que W2 deixou prontas e transbordando —
  deixá-lo livre custou zero a esta etapa e destrava a dívida do outro lado.
- **backend (medição):** mediu os 12 contra o projeto inteiro, com um script
  descartável no scratchpad que corre os despachantes reais sobre as `HAB(...)`
  de `classes.js`. Cita arquivo e linha em cada veredito.
- **backend (registro):** as 12 entradas de `AGUARDAM` ganharam o campo `dono`
  e o `motivo` reescrito; o cabeçalho perdeu a lista dos sete assuntos e ganhou
  o resultado. **40 12 6** confere. Não tocou no App, nem em `constantes.js`,
  nem nos testes.
- **testes:** seção 9 de `teste-poder-de-classe.mjs` — exatamente 12 com `dono`,
  nenhuma das outras 28, forma `src/<arquivo>.js · <algo>`, **o arquivo nomeado
  existe no disco** (`existsSync`, resolvido por `import.meta.url` e não pelo
  cwd), e `semDono <= SEM_DONO_HOJE` (6), local ao teste. 196 asserções, 0
  falhas. Nenhuma asserção de H1 movida nem afrouxada.

### O número, e por que ele é menor

Dos 12: **6 já têm dono** (2 vivo, 4 parcial), **6 não têm**. Dos **sete**
assuntos, **quatro caíram**, e nenhuma linha de mecânica foi escrita para
descobrir isso:

- **contra-conjuração já acontece** — a reação `contramagia` (`reacoes.js:35`)
  é concedida por nome na ficha e a fiação está viva. **Contramágica cumpre
  hoje.** O que não existe é o inimigo *conjurar* — e isso é **decisão
  escrita** em `controle.js:26`, não buraco;
- **PM de volta tem dono vivo, mas não o que a linha dizia:**
  `sacrificarInvocacao` (`invocacoes.js:197`), não `gastarRecurso`
  (`combate.js:745`) — que é **export morto**, e a suíte já o travava;
- **clima tem motor vivo e semeável** (`rolarClima`), **sem leitor de número**:
  `palco.js` e `geografo.js` só o narram. Falta leitor, não mecânica;
- **a metade mental da Contra-Canção sai pela porta** que já existe
  (`removerPelaPorta`).

**Ficam quatro assuntos e seis habilidades:** marca, cura por turno, zona
persistente, e aura reativa sozinha na família.

### Decisões médias, com o motivo

1. **`dono` é campo, não prosa** — *"se é número, é tabela"* vale para endereço
   também. Motivo: um veredito escrito só no `motivo` não é legível pela suíte,
   e o que a suíte não lê apodrece. Com o campo, a catraca prova que o arquivo
   citado **existe no disco** — que é o que um rename silencioso quebra.
2. **A catraca dos sem-dono é `<=`, não `===`.** Motivo escrito no teste: um
   `===` ficaria **vermelho no commit que PAGA a dívida**. A suíte tem de
   aplaudir a descida e morder só a subida.
3. **As 40 continuam 40 — nenhuma saiu.** Contramágica cumpre e Foco Interior
   tem molde, mas **`dono` não autoriza ligar nada**: é endereço medido. Sair
   de `AGUARDAM` exige a ligação feita **e provada**, e isso é etapa própria.
   Afrouxar aqui seria usar o campo novo como porta dos fundos para esvaziar a
   lista sem pagar.
4. **A Fase H não fecha em H2 — encolhe.** A pauta autorizava fechar "se sobrar
   pouco". **Sobrou pouco, mas não sobrou nada:** quatro assuntos de mecânica
   real não cabem na fila automática, porque mecânica que muda o que o jogador
   vive é `pesado` pela tabela do `CLAUDE.md`. Escrevi **H3–H6**, uma por
   assunto, na ordem do mais barato ao mais caro — e o que de fato tinha dono
   virou item de "Aberto", não etapa de fase. Sete assuntos viraram quatro
   etapas: **a fase termina menor do que começou, que era o bom sinal.**
5. **H6 (zona persistente) leva trava escrita: não começa sem a palavra da
   pessoa.** Motivo: ela precisa de escrever em `grade.paredes`, e a grade
   **viaja no save** — formato de save é `pesado` explícito na lei da casa. A
   autorização da fase não cobre o que a etapa revelou de novo e grande.

### O que ficou (e virou item da fila, não etapa)

- **Quatro regras que apanham a habilidade errada**, apanhadas na medição e
  **não consertadas de propósito** — a etapa era medir. Uma delas **inverte a
  promessa**: a Maldição do Patrono aplica `enfraquecido`, e `combate.js:127`
  desconta o `danoReduzido` do dano que o alvo **recebe** — amaldiçoar um
  inimigo hoje deixa-o **2 mais duro**. As outras três são regex a apanhar
  palavra dentro de palavra: `chama` em "**Chama**do da Chuva" (põe
  `queimando`), `oração` em "C**oração** Tempestuoso" (abençoa o grupo), e
  `prote[çc]` que **não** casa "prote**gi**da" — esta última é a **mesma
  família** do defeito "protetoras" que a v9.265/H1 corrigiu, o que diz que a
  correção de lá tratou o caso e não a raiz.
- **Três ligações de uma linha**, medidas e não feitas (Foco Interior,
  Contra-Canção mental, Chamado da Chuva) — com o aviso de medir o que a
  terceira compra antes de a escrever: clima que ninguém lê é cenário.
- **Contramágica sai de `AGUARDAM` quando tiver prova**, e aí
  `TETO_DE_AGUARDAM` desce para 39. De quebra, um campo morto a enterrar:
  `funcao: "contramagia"` (`grimorio.js:142`) não está em `FUNCOES_DO_SISTEMA`.
- **Para a pessoa:** a única pergunta que é dela é a trava de H6 — se a zona
  persistente pode escrever na grade que viaja no save.

## 16/09 06:20 · v9.265 · H1 · a porta das habilidades de classe · commit `d99bab3`

- **estado inicial — e ele começa com um ciclo morto.** A trava
  `.claude/ciclo-em-curso` estava posta desde `00:25` (mais de cinco horas), e a
  árvore não estava limpa: **um ciclo H1 anterior morreu no meio, por limite de
  uso da API — não por falha.** `npm test` **vermelho em duas suítes**
  (`teste-arena.mjs`, `teste-guardas.mjs`, 4 asserções). Apaguei a trava velha,
  pus a minha, e tomei o bastão do `App.jsx` (ninguém o tinha). A outra mente
  fechou **W2** enquanto este ciclo corria (`cf91c7a`, `b92ffc0`) e subiu a
  `VERSAO` para **v9.264** — por isso H1 sai como **v9.265**, e não v9.264 como
  as três mãos dataram os comentários. Redatei os 32 comentários antes do
  commit: é exatamente a armadilha que o `CLAUDE.md` nomeia, e ela mordeu de novo.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.

### O que o ciclo morto deixou, e por que foi DESFEITO

Ele deixara **+43 linhas em `src/habilidades.js`**: uma forma nova (`abissal`) e
sete entradas em `GUARDAS`, com comentários bem escritos defendendo três coisas
novas — `valor` negativo como **preço**, `tipo: "amortece"` para dano recebido, e
`escopo` para guarda que cai no aliado. Terminar era uma saída legítima. **Não
era a certa, e as suítes vermelhas é que estavam com a razão:**

1. **`guardaDe` é classificador EXCLUSIVO.** `ehBuff` (`companheiros.js:161`)
   devolve `false` para quem é guarda, e o piloto escolhe guarda **antes** de
   buff. Pôr *Fúria de Batalha* em `GUARDAS` com `valor: -2` **apagaria o +2 de
   dano** que ela já entregava por `aplicarBuffDeHabilidade` e deixaria só a
   penalidade de defesa: a habilidade ficaria **estritamente pior**. A premissa
   escrita no comentário — *"um número com sinal trocado é o preço que faltava,
   sem uma linha de código nova"* — era justamente o erro. O DENTE 4 de
   `teste-guardas.mjs` diz isso em voz alta **desde a v9.232, com o motivo**.
2. **Quatro das sete linhas prometiam motor que ninguém escreveu.** O comentário
   afirmava que `amortecerDano` "passou a ler esta lista por `corteDeGuarda`" e
   que `erguerGuarda` "RECUSA quem tem escopo" — **`corteDeGuarda` não existe em
   lugar nenhum do projeto**, e nenhuma das duas fiações foi escrita. `muralha`,
   `contra_cancao`, `postura_defensiva` e `corpo_de_ferro` seriam erguidas e não
   fariam nada. Isto é *promete na ficha e falha na mesa* — **a própria doença
   que H1 existe para curar**, instalada dentro do remédio.
3. **`amortece` e `escopo` são mecânica nova** — dano recebido, alvo que não é o
   herói. Território de **H2**, que mede antes de construir. Terminar ali seria
   fazer H2 por dentro de H1, sem medição.

`git checkout -- src/habilidades.js`, suíte verde de novo (187/187), e H1
recomeçou limpo. **A forma `abissal` era a única parte sadia do lote e foi
embora junto** — ela volta barata como item de acervo quando alguém quiser.

### A etapa, em três mãos e na ordem certa

- **backend:** `src/poder-de-classe.js` (novo, 392 linhas) — `PODERES_DE_CLASSE`
  (8 entradas), `poderDe`, `temPassivoDeClasse`, `aplicarPoder(pers, hab, ctx)`
  e **`AGUARDAM`**. Mais as linhas de tabela nas casas que já existiam:
  `PRESSAS` (habilidades.js), `CONTROLES` (controle.js), `PORTADORES`
  (aflicoes.js), `resolve: true` nas duas portas de `condicoes.js`, e
  `dobraMovimento`/`ignoraTerrenoDificil` lendo **duas** fontes (dadivas.js).
  `temRegraPropria` ganhou a sétima família.
- **frontend:** `porHabilidadeDeClasse(h, pers, frase)` (`App.jsx:7941`), em
  `try/catch` com `calou`, e nos **DOIS** sítios do laço (`:13448` painel,
  `:13592` citada). Consertou de quebra os 90 endereços que as 87 linhas novas
  envelheceram em `check-acoes-do-jogador.mjs` e nas três suítes vizinhas.
- **testes:** `testes/teste-poder-de-classe.mjs` (novo, **177 asserções**), com
  a régua em tabela (`MEDIDA_DA_PORTA`) e os dentes dos dois lados — nenhuma
  linha órfã, nada fora da tabela vira poder (varrendo 593 habilidades), recusa
  por identidade de objeto, imutabilidade byte a byte, determinismo do alvo.

### O número honesto, e ele é menor do que a pauta previa

A pauta prometia **54 de 66**. A porta derruba **17 agora e provadas** (+3 de
subclasse de brinde, pelas mesmas linhas), e **`AGUARDAM` declara 40**. A conta
fecha porque a medição de v9.250 errou para mais: **9 das 66 já cumpriam** por
leitores que ela não enxergava (`seguraEmPe`, `temVozDeComando`,
`limiteDeInvocacoes`, `RX_SACRIFICIO`). 9 + 17 + 40 = 66.

**Uma porta que derruba 20 e declara 40 vale mais que uma que alega 54 sem
prova** — é a lição da Fase T, e é por isso que a etapa fecha assim em vez de
esticar o número. Das 40: **12 são os de H2** (mecânica nova, intocados de
propósito), **7 caem pela régua do golpe do App** (`HAB_OFENSIVA_RX` procura
palavras de violência e "sopro elemental em cone" não tem nenhuma — já é item
próprio na pauta), **5 são famílias de força zero**, e **16 pedem número que
nenhuma tabela cobra ainda**.

### A catraca — é o que sobra quando a etapa envelhecer

`TETO_DE_AGUARDAM = 40`, com folga **zero**: hoje `AGUARDAM.length === 40`.
Quem escrever amanhã uma habilidade que promete e não cumpre **fica vermelho no
dia em que a escreve**; quem pagar uma dívida **abaixa o número no mesmo
commit**. A suíte também exige que toda entrada tenha motivo (≥25 chars) e
data, que nenhum nome seja fantasma (todos existem no acervo) e que a classe
declarada seja a real. **A lista só encolhe.**

### Decisões médias, com o motivo

- **Desfazer em vez de terminar** o lote do ciclo morto — os três motivos acima.
  A parte sadia (`abissal`) foi junto porque separá-la custaria mais que
  reescrevê-la, e ela não é da fase.
- **Fechar H1 em 17 em vez de esticar para 54.** O resto exige ou mecânica (H2),
  ou consertar `HAB_OFENSIVA_RX` (item próprio), ou números que nenhuma tabela
  cobra — cada um é outra etapa, e enfiá-los aqui produziria exatamente a
  promessa vazia que a catraca existe para impedir.
- **Cinco asserções viradas do avesso, não afrouxadas.** Diziam que *Purificar*
  e *Palavra de Coragem* aguardavam resolvedor; o resolvedor chegou. Cada uma
  passou a exigir o **cumprimento** com o motivo e a data escritos, a sabotagem
  de T4 ganhou **dois** substitutos (uma que prova que `coberturaDasCondicoes`
  lê o campo, outra que prova que `removerPelaPorta` o lê também), e o controle
  negativo de `temRegraPropria` **trocou de habilidade** (Passo do Vento →
  *Palma dos Sete Ventos*, dano puro) em vez de sumir.
- **`Palavra de Coragem` fica nas duas listas, de propósito** — o medo sai por
  esta porta, o PV temporário não existe. Meia promessa cumprida é meia dívida.
  Em vez de afrouxar a não-sobreposição, a suíte trancou a exceção por
  **igualdade** (`MEIA_DIVIDA`): qualquer outra sobreposição fica vermelha, e no
  dia em que o PV temporário nascer esta linha cobra a saída da entrada.
- **Sem bloco de prompt novo.** `PODER_DE_CLASSE_PROMPT` não existe de
  propósito: `HABILIDADES_PROMPT` já diz "o sistema resolve, você narra" e cada
  resolução devolve a `nota` por turno. **O teto de prompt é sagrado** e somar
  bloco estático é proibido.

### O que ficou

- **H2 espera**, com os 12 já nomeados e datados dentro de `AGUARDAM` — a
  medição da próxima etapa começa com a lista na mão, não do zero.
- **As 7 da régua do golpe** (`HAB_OFENSIVA_RX` com `ataca` e sem `ataque`) já
  eram item da pauta e continuam lá; agora com os nomes ao lado.
- **Bastão do `App.jsx` devolvido** ao fim da etapa 2. A outra mente não foi
  tocada: nenhum vermelho dela, nenhum arquivo dela no commit.

---
## 16/09 03:10 · v9.263 · X4 · a conta do que mudou · **a Fase X fecha** · commit `8d402ed`

- **estado inicial:** HEAD `4619533`, VERSÃO **v9.261** lida do arquivo.
  **Sem trava do sistema — pus a minha.** `npm test` **187/187 suítes verdes ·
  13/13 varredores limpos**, build limpo. A outra mente está rodando **W1** (a
  frase que se monta) com a trava dela posta; **não tomei o bastão do
  `App.jsx`** — X4 é medição, e leitura não pede bastão.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **testes (duas mãos, em arquivos separados, no mesmo turno):** a primeira, o
  **eixo da frase** — `acoes-do-jogador.mjs`, `sonda-turno-esteril.mjs` e o par
  `teste-`/`check-`; a segunda, a **régua de B1** — `regua-combate.mjs` e
  `teste-regua.mjs`. Nenhuma tocou no arquivo da outra.
- **nenhuma linha de produção escrita.** O único arquivo de `src/` tocado foi
  o bump de `VERSAO`.

### A resposta, e ela é um "não mudou" honesto

Mesma política fixa de X1 — estrada, 1 inimigo não-ágil, herói corpo a corpo
nível 3, 7 turnos declarando "Ataco &lt;nome&gt;" e nada mais:

| | 15/09 (X1) | 16/09 (depois de X2) |
|---|---|---|
| turnos estéreis | **7/7** | **7/7** |
| rolagens | **0** | **0** |
| revides | **0** | **0** |

**E tinha de dar isso.** X2 escreveu, com todas as letras, que **não encurtou
a caminhada** — *"ela tornou a caminhada visível antes do clique, que é outra
coisa"*. A régua confirma a palavra dela em vez de a contradizer, e uma régua
que confirma o que a etapa prometeu vale mais do que uma que encontra um ganho.

**O que mudou está na sessão A′, e é medível:** os mesmos 7 turnos agora com o
clique **impedido antes de ser gasto**, com a distância, o alcance e os metros
que faltam ditos na tela. **Sete turnos perdidos viraram sete turnos que o
jogo avisou que seriam perdidos.**

**E a honestidade que fecha este eixo:** a sessão B — o jogador que anda em vez
de insistir — dá **2 turnos andando + 5 golpes, 0% estéril, 5 rolagens**. Só
que **já dava isso em X1**. Andar sempre funcionou: é geometria, não botão.
**Nenhum dos dois números é ganho de X2**, e vendê-lo como ganho seria a conta
mentindo a favor — que é exatamente o que X3b mandou X4 não fazer.

### O eixo novo de X3b: estéril e mudo são taxas OPOSTAS

A sessão A″ mede os mesmos sete turnos pelo eixo da frase:

- `taxa_esteril` = **7/7 = 100%** (turnos sem um número mudar) — o eixo de X1
- `taxa_muda` = **0/7 = 0%** (turnos sem **uma linha** sequer)
- `taxa_sem_narracao` = **7/7 = 100%** (turnos sem uma frase de **evento**)

As duas primeiras são **opostas na mesma sessão**, e **a distância entre elas é
inteira de recusa**. Das 14 linhas dos 7 turnos: **7 eco do jogador, 7 recusa,
0 narração de evento** — e **0 chamadas ao Narrador** (o `return true` de
`:11871` antecede o `enviar` de `:11932`). O jogador lê o tempo todo e nada
lhe é narrado.

**O alerta de X3b estava certo, e agora tem número:** sem separar a recusa, a
medida daria **0% de turnos mudos** onde a resposta honesta é **100% sem
narração**. Por isso nasceu `NAO_CONTA_COMO_FRASE`, irmão do
`NAO_CONTA_COMO_NUMERO` de X1, com cinco exclusões e o motivo de cada uma — a
recusa, o eco do jogador, o telegrama, a rolagem `🎲` (que sai atrás de
`mostrarRolagens`, desligado por omissão) e a nota ao Narrador.

### O funil — e X3b errou os dois números, para menos

`pushMsgs` é `App.jsx:7499`: **o endereço confere**. O resto não:

| | X3b disse | X4 mediu |
|---|---|---|
| funções que falam no combate | 13 | **14** (11 de núcleo + 3 de borda) |
| formas de recusa | 15 | **18 chamadas · 25 formas · 7 famílias** |

As 57 chamadas do funil: **frase de mesa 36 (63,2%) · telegrama 12 (21,1%) ·
recusa 9 (15,8%)**, e **22 das 57 nascem fora do React** (35 ainda só existem
dentro do `App.jsx`). A maior boca é `resolverRevide` sozinha, com 29 das 57.
A maior família de recusa é `alcance`, com 6 chamadas e 13 formas — e apareceram
**duas famílias que a pauta não nomeava**: *conjuração travada* (armadura, forma
animal, grimório) e *condição que prende*.

O núcleo dos 11 não foi contado no olho: saiu de **ponto fixo sobre o grafo de
chamadas**, a partir das guardas explícitas de `combateRef.current`. Pelo
precedente de X1, **a medição mandou na pauta**.

### A régua de B1: o que ela NÃO pode medir, dito em vez de inventado

A pessoa pediu *"a régua de B1 refeita com o jogador agindo"* e acrescentou a
única instrução que importava mais que o número: **se não der para simular
honestamente, diga em vez de inventar.**

Não dá, e a razão é estrutural. **A régua não tem tabuleiro:**

- não importa `src/grid.js` nem `src/golpe.js` (imports em
  `regua-combate.mjs:193-206`);
- passa **`grade: null`** ao motor (`:887`), e `grid.js:422` abre com
  `if (!g) return { ok: true, penalidade: 0 }` — **sem grade, os dois lados
  alcançam sempre**;
- o passo 1 do laço era `if ((heroi.vida || 0) > 0)`: a única pergunta era
  *"está de pé"*, nunca *"alcança"*.

**Logo a linha de 1,4% nunca mediu "o motor sozinho": ela sempre pressupôs um
jogador que age todo turno.** A régua é o **limite otimista**, e o jogo real é
**pior** que ela — não melhor, que era a suposição embutida na pergunta.
Está escrito como bloco exportado `TABULEIRO_NA_REGUA`, no molde do
`ADVERSARIO_NA_REGUA` que N1b deixou para o mesmo tipo de buraco.

**Medir o preço real exige a grade dentro da régua** — montar planta,
posicionar, caminhar com orçamento em metros, `alcanca` antes de cada golpe
**dos dois lados**. Isso é um **simulador de tabuleiro: órgão novo, logo
`pesado`, logo da pessoa.** Ficou como proposta em
`TABULEIRO_NA_REGUA.paraMedir`, **não construída**.

### O preço da caminhada — a primeira ponte entre X1 e B1

O que **deu** para medir honestamente foi o custo de o herói não poder golpear.
`rodadasDeCaminhada = k` cala o herói nas primeiras k rodadas; **`k = 0` é o
default e é byte a byte** (dente próprio em 4 famílias, e a asserção existente
de 52,1% · 25,88 · 1,790 continua verde). No `justo` com
`comAdversario: false`, 4 famílias × 500 = **2000 sementes por degrau**:

| k | vitória | PV do grupo | quedas |
|---|---|---|---|
| 0 | 51,8% ± 2,2 | 25,90 | 1,785 |
| 1 | 39,6% ± 2,1 | 18,78 | 2,087 |
| 2 | 29,8% ± 2,0 | 12,86 | 2,332 |
| 3 | 22,7% ± 1,8 | 8,85 | 2,503 |

**Uma rodada de caminhada custa ~9,7 pontos de vitória**, −5,68 PV de grupo e
+0,24 queda (degraus −12,3 · −9,8 · −7,0, com rendimento decrescente). Na moeda
de B2 — a escada de `CATRACA_DE_UMA_VIDA`, medida no mesmo molde, ~2,9 pontos
por ponto de dano — **um turno andando ≈ 3,3 pontos de dano por golpe, quase
todo o teto de +4 que aquela escada aponta.** É a primeira vez que a geometria
que X1 achou aparece na moeda do balanceamento.

**Os degraus não foram escolhidos, foram derivados:** a suíte importa
`DESLOCAMENTO_PADRAO` (`grid.js`) e `ALCANCES` (`golpe.js`) e **refaz** o "2 a
3 turnos" de X1 — (12,0−1,5)/9 → 2 e (25,5−1,5)/9 → 3. Se o passo ou o alcance
mudarem em `src/`, o dente fica vermelho sozinho.

**Não medi no jogo de hoje (Adversário ligado), e medi a razão em vez de a
afirmar:** o `justo` está em 1,4–1,8%, **saturado no piso**. Com k ≥ 1 a
vitória cabe dentro da própria margem (0,4 ± 0,6 · 0,0 ± 0,6 · 0,0 ± 0,6) —
**indistinguível de zero**. Isso virou dente; a escada de lá é `pendente`.

**E o contrapeso, que é achado novo e baixa o preço:** `moverPara`
(`App.jsx:14500-14568`) **nunca chama `fecharMeuTurno`** — o próprio sítio
escreve *"o que fecha o turno é AGIR"*, e os quatro chamadores de
`fecharMeuTurno` (`:11929`, `:13453`, `:13543`, `:13594`) não incluem o
movimento. Somado ao `semAlcance` de graça que X1 mediu: **enquanto o herói
anda, a oposição também não age.** Então o preço real está **entre zero e os
9,7 pontos**, e 9,7 é a **ponta cara**. Está dito na tabela, no cabeçalho, e
ficou `pendente` — não virou limiar.

---

## A FASE X DE PONTA A PONTA — o que o jogador não conseguia, e o que consegue

**Em 15/09, quando a fase abriu**, o `jogo` jogou e contou: dos 20 botões do
painel de Ações, **nenhum era de combate**. `Atacar` não atacava — **digitava
`"Ataco "` na caixa de texto**. Três ataques declarados sem ambiguidade num
combate aberto deram **zero rolagens**, e sete turnos fecharam com os mesmos
PV 20/20, PM 6/6, XP 89/300. A lei da casa estava invertida no pior lugar:
*o Mestre é código, e a IA só narra* — **mas quem decidia se o golpe
acontecera era a IA.**

**O que ele NÃO conseguia fazer, e hoje consegue:**

1. **Disparar o próprio golpe.** `Atacar`, com a luta aberta, **ataca**: monta a
   frase canônica, passa pela porta única `declararGolpe` (`:11851`), e
   `src/golpe.js` — módulo puro, provado em Node — **decide antes de qualquer
   efeito**. A catraca desceu com o fato: `TETO_SEM_MOTOR` **7 → 6**. *(X2)*
2. **Saber o preço antes de pagar.** O botão nasce **impedido** e a linha lê
   *"Longe demais — Halvard a 3 m, faltam 1,5 m. Aproxime-se primeiro."* — o
   número conferido vivo na campanha e casa a casa contra `vereditoDoGolpe` em
   Node. Antes, a recusa só chegava **depois** do clique. É a lei do veredito
   antes do clique, aplicada ao combate. *(X2)*
3. **Não perder o turno quando o Mestre cai.** Se o motor rolou, **o resultado
   não se descarta**: fica guardado e é narrado quando o Narrador voltar. Antes,
   uma queda da IA jogava a ação fora — e, pior, uma retentativa **re-rolava um
   resultado ruim**. *(X3)*
4. **Ter uma régua que não evapora.** Antes, cada medição de combate morria no
   scratchpad. Hoje a fase deixa quatro instrumentos permanentes:
   `acoes-do-jogador.mjs` (a tabela), `sonda-turno-esteril.mjs` (a régua),
   `check-acoes-do-jogador.mjs` (o varredor que impede a tabela de apodrecer,
   agora com 11 dentes) e `teste-acoes-do-jogador.mjs` (**155 asserções**,
   eram 108). *(X1, X4)*

**E o que a fase descobriu que ninguém tinha nomeado** — o achado que vale mais
que qualquer das quatro linhas acima: **a trava não era o botão, era a
geometria.** `posicionar` abre a luta a **12,0 m (taverna) a 25,5 m
(masmorra)**, o corpo a corpo alcança **1,5 m**, e **10 de 10 plantas recusam
no turno 1**. `resolverAtaqueJogador` sempre existiu e sempre foi bom; o golpe
morria antes dele. Consertar só o botão teria dado ao jogador um *"longe
demais"* dez vezes seguidas — e **pareceria que o conserto falhou**.

### O que ele CONTINUA não conseguindo fazer

1. **Chegar perto sem gastar 2 a 3 turnos andando.** X2 tornou a caminhada
   visível; não a encurtou, e disse isso. **Agora ela tem preço medido:
   ~9,7 pontos de vitória por rodada** — e é o número que falta a esta casa
   decidir se aceita.
2. **Andar pelo tabuleiro escrevendo.** Não há **porta do campo em `turno.js`
   — 17 portas, nenhuma delas do tabuleiro**. Hoje `vou até K14` numa luta cai
   na porta `destino` (`:238`), que **não tem guarda `!emCombate`**, vai ao
   resolvedor de cidades do mapa-múndi, escreve `[DESTINO NÃO RECONHECIDO]` e
   entrega à IA: **ninguém anda, e gasta-se uma chamada ao Mestre para não
   andar.** Pedido por E2 e de novo por W1; continua em "Aberto".
3. **`Esquivar`, `Empurrar`, `Derrubar`, `Ajudar`.** Quatro botões de combate,
   **zero motor**. X2 deixou-os de fora **de propósito**: ali não falta fiação,
   **falta mecânica**, e enfiá-los na porta de `Atacar` seria fingir que
   existem. São a **Fase Y**, já aprovada, na ordem Empurrar/Derrubar →
   Esquivar → Ajudar.
4. **Passar a vez sem chamar o Mestre.** Não há botão de esperar desde a v9.13
   (`App.jsx:3133`) — e é o que W1 mediu como o item mais barato e que mais
   paga. Continua em "Aberto".
5. **Ouvir a luta.** Nos sete turnos da sessão A o jogador lê **catorze linhas
   e zero narração de evento**. X3b já tinha mostrado por que: **se o Mestre
   calasse hoje, a cena sobreviveria como extrato bancário; a luta, não.**

### Os dois achados de mecânica quebrada de X3b — X4 não os tocou

Confirmado que **não são desta etapa**, e os dois continuam em "Aberto" como
`médio`, intactos. Mas X4 tem algo a dizer sobre cada um:

- **o reforço entra na luta sem `x`/`y` nem iniciativa** — é **invisível para a
  régua por construção**: sem grade, `alcanca` devolve sempre `ok`, e um
  combatente sem posição não tem como doer ali. Só o jogo o sente.
- **a queda de companheiro é silêncio absoluto** — X4 o **confirma por
  ausência**: o funil tem linha para a queda do herói (`:14218`) e para **treze**
  eventos de companheiro (`:14061` a `:14260`), e **nenhuma** para o
  companheiro que chega a zero.

### Decisões médias tomadas (com o motivo)

- **Corrigi dois números da pauta para cima** (13 → 14 chamadores, 15 → 18/25
  recusas). **Motivo:** os de X3b eram prosa de diário, não número provado — e o
  precedente de X1 é explícito, *"a medição manda na pauta, não o contrário"*.
- **`k = 0` como default da caminhada na régua, e byte a byte provado.**
  **Motivo:** mudar a régua muda **os dois lados** de toda comparação passada;
  a história de B1/B2/T1 não pode passar a mentir por causa de X4.
- **Medi a saturação do piso em vez de a afirmar.** **Motivo:** *"um limiar em
  cima de um teto não mede nada"* já é lei do cabeçalho da régua — mas dizer que
  algo está saturado sem medir é a mesma opinião com confiança que a casa proíbe.
- **O custo da caminhada ficou `pendente`, não virou limiar.** **Motivo:** o
  achado de `moverPara` mostra que 9,7 é a ponta cara de uma faixa, e faixa não
  vira catraca.
- **Não tomei o bastão do `App.jsx`.** **Motivo:** X4 é leitura; a outra mente
  está em W1 e o bastão livre vale mais que a comodidade.

### O que ficou

- **Um achado novo, `leve`, para "Aberto":** a recusa de alcance imprime **"está
  a 17 m, em na vala — longe demais"** (`grid.js:428` põe `em ` antes de um
  `nomeDoLugar` que já traz a preposição; sem nome, ficam dois espaços). Saiu
  sete vezes seguidas na sonda. **Não a consertei de carona** — ela é a mesma
  frase de `LINHAS_DO_GOLPE` e da catraca dos 54 caracteres que W1 pediu, e
  consertá-las em separado criaria a segunda cara da mesma linha.
- **Uma proposta `pesada` para a pessoa:** a grade dentro da régua — o
  simulador de tabuleiro que mediria o preço real da caminhada. Escrita em
  `TABULEIRO_NA_REGUA.paraMedir`, **não construída**.
- **Três coisas que X4 não conseguiu medir**, declaradas na tabela e impressas
  pela sonda: quantas linhas saem num turno **real** (a sonda não roda React);
  a voz das **5 chamadas mistas** (listas montadas em tempo de execução); e
  **quanto a IA de fato narra** — isso seria medir a rede, e a Fase X mede o que
  o código diz sozinho.
- **Nada foi rebalanceado, nada foi ligado, nenhuma catraca foi afrouxada.** O
  dente 1 de `CATRACA_DE_UMA_VIDA` continua `pendente`, como N1b o deixou.
### A nota que a casa exige: o meu bloco de pauta saiu no commit da outra mente

**Aconteceu a terceira vez, e desta vez do outro lado.** Enquanto eu media, a
outra mente fechou **W1** e commitou `mente/pauta.md` — onde ela tinha escrito,
legitimamente, o pedido de W1 ao motor (a pauta do sistema **é** o canal por
onde o desenho pede regra). Só que o meu bloco de X4 já estava no arquivo, e
**`63e0667` — um commit que fala do turno como gesto — levou dentro o veredito
inteiro da Fase X**, sem o mencionar.

**Não reescrevi a história:** `origin/main` já estava em `2afce4c` quando
descobri, e `push --force` num ramo que faz deploy para jogadores reais é arma
apontada para o vizinho. A lei da casa diz o que fazer nesse caso e foi o que
fiz — **repor a verdade no diário e num commit seguinte, e seguir**. O bloco de
X4 na pauta agora traz uma linha dizendo onde ele foi publicado.

**E a lição, porque as três vezes têm a mesma forma e nenhuma foi por `add -A`:**
`git commit -- <caminhos>` fecha a janela entre o *seu* `add` e o *seu* `commit`,
mas **não** protege um arquivo que as duas mentes editam ao mesmo tempo — ali o
caminho nomeado leva tudo o que estiver dentro dele. `mente/pauta.md` é o único
arquivo da casa nessa situação por desenho: é meu, e é onde o desenho me pede
coisas. **O bastão resolveu o `App.jsx`; a pauta não tem bastão.** Fica como
achado para a pessoa decidir — talvez um `mente/pedidos-ao-sistema.md`, que o
desenho escreve e o ciclo consome, custe menos que uma trava nova.

- **O que ficou meu neste commit, e é o que sobrou de `pauta.md`:** o fecho da
  Fase X, a correção da versão e o item novo do *"em na vala"*.

---

## 16/09 02:25 · v9.261 · X3b · o que a voz da casa cobre · commit `30a6b3d`

- **estado inicial:** HEAD `4221f16`, VERSÃO **v9.260** lida do arquivo (a
  outra mente a bumpou em E2 durante este ciclo; bumpei para **v9.261** em
  cima do que estava no disco, não do que a pauta dizia). **Sem trava — pus a
  minha.** `npm test` **187/187 suítes verdes · 13/13 varredores limpos**,
  build limpo. A outra mente rodou **E2** (o endereço do tabuleiro) e fechou
  no meio do ciclo (`e192188`, `e791646`); a árvore voltou limpa antes do meu
  commit e **não precisei de `so-o-meu.sh`** — nenhum vermelho de lado nenhum.
  **Não tomei o bastão do `App.jsx`:** X3b é retrato, e leitura não pede bastão.
- **conselheiro:** **não chamado** — fase aprovada pela pessoa, etapa escrita.
- **backend:** o retrato da **oferta** — `arena.js` inteiro mais 22 módulos
  puros com prosa de combate, os 14 eventos com arquivo:linha e a frase
  literal. Achou três que não estavam na lista (`masmorras.js`,
  `adversario.js`, `grid.js`).
- **frontend:** o retrato da **demanda** — o funil de `pushMsgs`
  (`App.jsx:7499`) e as treze funções que o chamam dentro do combate, os 14
  eventos classificados em **código-frase / código-telegrama / IA**, mais a
  contagem à parte das **15 formas de recusa**.
- **nenhuma linha de produção escrita.** X3b é medição; o único arquivo de
  `src/` tocado foi o bump de `VERSAO`.

### O número, e ele decidiu a fase

A arena tem linha escrita em **10 dos 14** eventos. Mas **molde reusável em
campanha que a campanha ainda não tem: 3 de 14 (21%)** — e os três (acerta,
erra, crítico) são **um molde só**, o do golpe. **Dos 5 que a pessoa perguntou
por nome** — condição, queda, morte, reviravolta, chegada de inimigo —
a arena cobre **0 de 5**.

A razão é estrutural, e é o achado do ciclo: **a voz da arena não é uma fonte
independente.** Dos 8 moldes que ela escreve, 2 são reflexivos (`se recompõe`,
`firma`) e não sabem nomear um terceiro — e o caso normal da campanha é
**grupo**. Os outros 5 ela **empresta** de módulos da campanha (`tickEfeitos`,
`expirarGuardas`, `absorverDano`, `testeConcentracao`, `firmarEfeito`), e o
`App.jsx` **já empurra exatamente os mesmos**. O empréstimo só existe onde a
campanha já tinha escrito. A cobertura do duelo é o retrato da campanha,
devolvido.

- **decisão tomada, e ela encolhe a proposta: X3c está CANCELADA.** A razão
  não é o número sozinho, é a contradição que o número revela: **X3c se
  proibia de inventar prosa nova** (*"sem inventar uma linha de prosa nova"*),
  e o reuso disponível cobre **um** dos 14. Cumprir a promessa seria escrever
  prosa nova sob o nome de reuso — o código fingindo ser a IA, que é o
  próprio limite que a etapa escreveu para si. **A Fase X fecha em X4.**
- **a honestidade contrária, registrada de propósito:** o golpe é o evento
  mais frequente (3 a 6 por rodada), então em **volume de linhas** a cobertura
  não é 21%. Só que o golpe **já tem string** no `App.jsx`
  (`⚔ Halvard → Bandido: 9 de dano · Bandido 11/20`) — trocar telegrama por
  frase é reescrever uma linha que existe, não é *"o turno se completa quando
  o Mestre cala"*. É outra etapa, menor, e de forma. Não estiquei X3c para
  caber nisso.
- **o limite que era lei de X3c continua valendo e não foi tocado:** valia
  **só em combate**; fora dele a prosa **é** o conteúdo e ali trava, como a
  pessoa decidiu.

### O que ficou

**Sete achados novos foram para "Aberto"**, cada um do tamanho que tem e
nenhum vestido de reuso — dois deles são mecânica quebrada, não prosa:

- **médio ·** o **reforço entra na luta sem lugar no tabuleiro**: `montarGrid`
  não roda de novo com a luta aberta (`App.jsx:8928`, `:9007`), e `alcanca` /
  `moverInimigos` passam a receber um combatente sem `x`/`y` nem iniciativa.
- **médio ·** a **queda e a morte de companheiro são silêncio absoluto**
  (`App.jsx:13967`) — o herói que cai tem quatro frases; o aliado ao lado
  dele, nenhuma, nem nota ao Narrador.
- **leve ·** a **salvaguarda de fim de turno que falha é muda**, e
  `condicoes.js:576` **já calcula** a linha que ninguém consome.
- **leve ·** a **virada de chefe nunca dispara para um herói de arma** —
  `virarChefeSePreciso` só é chamada de `resolverHabilidadeOfensiva`.
- **leve ·** **`ultimoDano` escrito em nove sítios sem um leitor**.
- **leve ·** a **arena descarta a linha boa da guarda** (`habilidades.js:356`,
  que o App usa) e escreve outra por cima — duas frases para o mesmo evento.
- **leve ·** a **condição tem prosa de saída e não tem prosa de entrada**.

**Para X4**, deixei o mapa do funil (`pushMsgs` e os treze chamadores), um
eixo novo (*turnos sem uma frase*, que não é a mesma taxa de *turnos sem um
número*) e uma correção de escopo: **15 formas de recusa** têm frase no
caminho de combate, e recusa **não é** narração — X4 tem de contá-las à parte
para não inflar o próprio número.

**Nada foi rebalanceado, nada foi ligado, nenhuma lei foi afrouxada.**

---


## Os ciclos anteriores

Os 31 ciclos mais antigos estão em `mente/arquivo/diario-antigo.md`,
inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo
ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.

## 11/10 · v9.394 · MM19, o que já existe chega à cena (`backend`) · este commit

- **quem:** `backend`, à mão; sem bastão (o `App.jsx` e o combate são de um `frontend` no ar). Tocados: `pauta.js`,
  `saga.js`, `escuta.js`, `batidas.js`, a suíte nova `teste-batida-na-cena.mjs` (+ a fixture `registo-s5-pauta.json`, 24 KB,
  as 66 pautas enviadas na 5.ª sessão) e sete suítes antigas com asserções movidas, cada uma com o motivo.
- **faltou por quê (medido no registo da 5.ª sessão, linha a linha):**
  | o quê | chegou | porque não |
  |---|---|---|
  | a batida da espinha | **0 de 66** | uma linha só de 650–910 caracteres (batida + fio + regra), prio 3; antes dela o teto já ia em 897–1398 de 1400. **Teto, sempre** — e o corte guloso metia a economia (2,5) e o "comporta" do ONDE (1,2) no lugar |
  | a obra do antagonista (MOMENTO) | **24 de 46** fora da luta, **20 de 20** na luta | os 22 que faltaram: **todos teto** (gasto ≥ 1176 antes da prio 3,1); na luta com o Dragão gastava 223 por turno sem mudar um golpe |
  | o degrau (sinal 4.º, vem buscar 7.º, cobra 10.º) | **9 de 9** turnos levaram a linha (o rumo é 2,42) | não a prio: **a cena**. A forma do encalhe ("um presságio — clima, ave, sonho", "um NPC procura o herói NA TAVERNA", "desabamento, enchente"), e o passo "Procurar Osric na Candeia" com o herói em Ponte Lenta |
  Médias fora da luta: ONDE 322, NÃO PODE 210, RUMO 192, FECHO 133, cabeça 293.
- **o conserto:** (1) o envelope da espinha é **só a batida** (cena, em jogo, pergunta; ~240–320); o fio e a regra foram para a
  última linha de `momentoDoFio` — o App já põe as duas na mesma secção, **sem fiação nova**. (2) `SECOES.momento.frente`
  [2,475; 2,48]: a batida e a obra passam à frente da cauda do ONDE e da economia, atrás dos vetos, do rumo, do fecho, da planta
  e do que volta. (3) `SECOES.onde.cauda`: da 3.ª linha do ONDE em diante (o lugar repetido) corta com 2,49. (4) a planta da
  masmorra sobe um milésimo por linha (inteira antes da batida). (5) o momento **cede na luta** e **numa pergunta que uma ficha
  respondeu** (a resposta passa à frente; o único empurrão é a ponte). (6) `escuta.js#cenaDoDegrau` + `DEGRAU_EM_CENA`: cada
  degrau é um fato com nome e lugar **onde o herói está** (`batidas.js#fatoDaEtapa` dá ao "cobra" o mesmo fato do MOMENTO).
- **decisão média, com o motivo — a cabeça da pauta encurtou (293 → 228), a mesma regra.** Com a batida a caber, a obra do
  antagonista caía de 24 para 11 de 46: as duas (~270 + ~223) não cabem com o lugar, os vetos, o rumo e o fecho. Medi a folga
  que faltava (+40 → 23; **+70 → 29**; +120 → 31) e tirei-a do maior custo fixo, pago em todo turno — só a repetição
  ("Estas palavras… nenhuma delas… — ninguém neste mundo fala em rótulo"). O teto (1400) não se mexeu; o pior caso do prompt
  só desce. Se a pessoa preferir a frase longa, é um commit — e a obra volta a 11.
- **a prova (a 5.ª sessão reconstruída com as funções do jogo):** batida **41 de 46** turnos fora da luta (era **0 de 66**);
  obra do antagonista **29 de 46** (era 24), e onde falta só a história lhe tirou o lugar; na luta, momento **0 de 20** (eram
  20) e o CONTRA em todos; degraus com fato e lugar certos **3 de 3** (9 de 9 turnos: "em Ponte Lenta, ouve-se o nome de
  Edric…", "Edric vem ter com o herói em Ponte Lenta…", "em Ponte Lenta, um prego dobrado em gancho à vista…"), nunca "na
  taverna" nem a Candeia; nenhuma linha de veto, rumo, fecho, planta, volta ou resposta que chegou na sessão deixa de chegar.
  `teste-batida-na-cena.mjs` (51; em HEAD falha). `npm test` 303/303 + 16/16.
- **A FIAÇÃO QUE FICA PARA O APP (frontend), e só esta:** sem ela o degrau continua a ser a forma de antes (a batida e o
  momento já chegam sem nada). Em `pautaDoTurno`, no bloco "MM18: O RUMO", a chamada de `linhaDoRumo` ganha **um campo**:
  ```js
  mundo: { aqui: (g.onde || [])[0] || "", abertura: aberturaMundoRef.current, missoes: missoesRef.current,
           espinha: espinhaRef.current, ato: historiaRef.current.etapa, dia: diaRef.current, vilao: nemesisRef.current },
  ```
  (`g` é o `paraPauta(...)` do topo de `pautaDoTurno`; `g.onde[0]` é a linha de ferro do ONDE, o sítio onde o herói está.) Já
  dentro do `try/calou` que lá está. Prova: uma asserção em `teste-fiacao-prende.mjs` que leia `mundo: { aqui:` no App.
- **o que ficou:** a PONTE (degrau 0) continua a apontar para o passo da missão, que na 5.ª sessão era a Candeia já deixada — é
  o defeito 4 do relatório (o fio que parte em três), não este. O fio da peça (linha 3,x) chega só quando sobra lugar.

## 11/10 · v9.393 · MM, a campanha que prende: a fiação no App (`frontend`) · este commit

- **quem:** `frontend`, à mão, com o bastão do `App.jsx` (tomado no início, devolvido no fim). Liga o que os dois `backend`
  fecharam em v9.386–v9.392, pelas receitas deste diário; nenhum módulo do motor tocado.
- **o que liga:** `prometido.js` (o ref no save e no load, a secção e as abertas no Cronista, `pagar`/`guardar` depois do
  parse, `cobrarNoTurno` uma vez por turno em `pautaDoTurno`, fora da Noite); `fecho.js` (`escolherFecho` depois do RUMO, com
  `fimDeAto` lido da batida do marco atual e sorte semeada; `fechoDaNarrativa` depois da resposta); `fios-da-estrada.js` (o
  encontro de cena da viagem, a conversa da noite no envelope do sítio, o fio novo filtrado no fim do acampamento e em `enviar`,
  antes da escuta — o seguro volta à nota); a espinha nasce com `antecedente` e `dia`; `momentoDoFio` logo depois do envelope
  da espinha; `vilaoDoFio` com `dia`; `montarTrama` com a `amarra` (a abertura forçada passa sem porta). Tudo em `try/calou`.
  Os três módulos saíram da lista de espera da `teste-ligacao`.
- **o pedido real, numa campanha nova de Uma Vida (6 turnos ao Narrador, `vite dev`, lido por gancho no `fetch`):** O FECHO em
  todos (corte → silêncio → silêncio → escolha → escolha → consequência); MOMENTO com a obra do antagonista ("um carroceiro sem
  rosto recruta os sem-casa…") nos turnos de ato; o Cronista guardou "Greta sabe o que o Altar guarda, mas não diz aqui" no
  turno 2 do relógio, e no turno 5 a pauta levou **O QUE VOLTA** com ela, e o save fechou-a como `cobrada`. O EM JOGO da batida
  1 já é o do antecedente (o órfão: "a ponta do último rasto da família"). O save ganhou `prometido`.
- **decisões médias:** (a) na abertura e nos turnos densos o MOMENTO (prio 3) cai pelo teto da pauta — o envelope da espinha
  já caía antes; a linha curta do momento do fio entra quando a longa não cabe. Não mexi em prioridades (são do motor). (b) Os
  endereços de `acoes-do-jogador` (151, nenhum em linha mudada), o `pushMsgs` do varredor (8658 → 8702) e três asserções de
  `teste-acoes-do-jogador` re-medidos pelo diff de App.jsx contra o HEAD, cada um com o motivo ao lado.
- **a prova:** `teste-fiacao-prende.mjs` (50 asserções; em HEAD 11 ok e 39 falham). Build limpo, `npm test` verde.
- **a arrumação:** as entradas de v9.386 a v9.392 estavam dentro do bloco de código do "Formato"; o bloco fecha agora logo
  depois do modelo, e o texto delas não mudou.
- **localStorage:** só `localhost:5173`; antes havia `taverna_cfg_golpe_final` e `taverna_cfg_rolagens`. Nasceu
  `taverna_save_v1` (a campanha de prova), apagado com o jogo desmontado; as duas de antes conferidas por leitura.

## 11/10 · v9.389–v9.392 · MM, a campanha que prende: a espinha — batidas, segredos, o relógio do antagonista, a trama amarrada (`backend`) · 1bc1375 · ee3d3fc · 872ea11 · este commit

- **quem:** `backend`, à mão, sem tocar no `App.jsx` nem no que é do outro `backend` (`promessas.js`, `compasso.js`, `fecho.js`, os
  fios das viagens). Módulo novo `src/batidas.js`; `saga.js`; `regiao.js` (uma linha: as batidas releem-se sobre a forma final do ato);
  `mundo-base.js` (`SEGREDOS` passa a ser exportada). `pauta.js` não foi tocado.
- **o diagnóstico (a pessoa: "de morna para frio"):** com nexo, a espinha ainda era lista de tarefas — 280 marcos em 12 campanhas, 4,9
  por ato, nenhum com algo em jogo nem pergunta; os "descobrir" guardavam "uma carta" sem conteúdo e fechavam por presença; a
  reviravolta do sistema era nula; o antagonista não mexia até a fama o fazer nascer (na 4.ª sessão, nunca).
- **v9.389 · as batidas:** de 3 a 5 por ato (211 em 12 campanhas, 3,70 por ato, 57/57 atos na faixa), cada uma com a cena (quem, ofício,
  onde), o que está em jogo para ESTE herói (`EM_JOGO`: a coisa do antecedente, três jeitos por antecedente) e a pergunta da cena
  (`PERGUNTAS`), sem o mesmo modelo duas vezes seguidas. O fecho do ato é a cena que o vira (o confronto; a descida ao lugar do ato, ou
  o chefe que espera depois dela; a última cena forte) e pede "uma escolha com preço, não um presságio". O resto é caminho, e o
  envelope diz para que cena leva. Os marcos não mudam (sem o campo novo, o hash da espinha é o de antes, byte a byte).
- **v9.390 · o segredo e a reviravolta:** todo "descobrir" guarda uma coisa do Escondido (a do lugar, quando a cidade a pôs lá; senão
  da mesma tabela) e o que ela PROVA, a apontar para a peça seguinte (`SEGREDO_DIZ`): 64/64. O teste diz o preço, não se se acha. O
  fecho do ato 0 colhe o laço que a abertura planta (`REVIRAVOLTA_DO_ATO0`, uma por laço + uma sem antecedente): 12/12, sem nome nem
  título do antagonista.
- **v9.391 · o relógio do antagonista:** o antagonista do fio anda desde o dia 1 pelos passos do plano de `vilao.js` antes do rosto
  (rumor → marca → mão: a obra dele, um bilhete dele, os servos dele), uma etapa por ato a mirar o fecho dele, prazo =
  `DIAS_POR_PASSO` + 2 dias por ato desde a etapa anterior (`RELOGIO_DO_FIO`). Chegar antes trava-a; demorar deixa a marca. 45 etapas,
  43 com sítio no mundo; o herói ligeiro trava as 45, o lento encontra as 45 cumpridas. `conferirEspinha` grava o dia em que o marco
  cai; `momentoDoFio` dá a linha à parte (a marca do momento, o JÁ SE SABE do segredo/reviravolta que acabou de cair, o que o mundo
  lembra de quem chegou a tempo), calada quando a nêmesis do fio já fala; a nêmesis que a fama faça nascer herda o passo do relógio.
- **v9.392 · a trama amarrada (o pedido do outro `backend`, v9.388):** `montarTrama` ganha a porta `amarra` ({ fio, prometido, nomes },
  o contexto de `fiosNovosNaEstrada`): com ela, a trama que não toca a gente do fio, uma promessa aberta nem um nome que importa
  (`amarraDoFio`) não nasce; a que toca nasce com `amarra`, e o envelope diz "Isto amarra-se a X: traga-o por aí". Sem a porta
  (a trama forçada da abertura, o App de hoje), a mesma trama, byte a byte. Suíte `teste-trama-amarrada` (12).
- **a régua das 9 (sessão 4) sobre o texto que o motor monta, 12 campanhas (`prende.mjs`, no scratchpad):** antes **1,95** → depois
  **3,72** — gancho 4→5, lugar 3,5→4, gente 2→3, em jogo 1,1→4,5, reviravolta 1→4, escalada 2→3,5, agência 1→3, prosa 2→3, fecho
  de ato 1→3,5. É teto do motor, não da mesa: a 5.ª sessão diz quanto disto o Narrador entrega.
- **decisões médias:** (a) o envelope da batida troca a regra longa da espinha por uma curta (`FIO.dizCurto`,
  `ENVELOPE_DAS_BATIDAS.regra`) — o teto da pauta é um só; mediana do envelope ~700 como antes, máximo ~930 em 80 campanhas (teto da suíte, 1000); a
  marca e o JÁ SE SABE vão em linhas à parte, que cortam sozinhas; (b) duas asserções movidas, com o motivo escrito
  (`teste-espinha`: "marco 1 de" → "batida 1 de"; `teste-fio-da-espinha`: o objeto do lugar passa a ser o segredo), e o hash da
  espinha do continente (`teste-regiao-historia`) três vezes, cada uma medida: tirando os campos novos, volta a f8252233ebb5614e;
  (c) a pista central não fica atrás do dado — o teste decide o preço (Gumshoe).
- **a prova:** `teste-batidas` (55), `teste-relogio-do-fio` (41) e `teste-trama-amarrada` (12), todas vermelhas em HEAD. Cada versão
  sobre HEAD limpo: verde (312, 312, 313, 314 suítes).
  Build limpo.
- **a fiação que fica para o App (frontend, com o bastão), exata:**
  1. em `iniciar` (~13050), no `estenderEspinha({ ... })`: `antecedente: pers.antecedente, dia: diaRef.current,` — sem isto o que está
     em jogo é "o que trouxe o herói até aqui", a reviravolta do ato 0 é a genérica, e o relógio conta do dia 1.
  2. em `pautaDoTurno` (~7077), logo depois do `porNaPauta(p, "momento", envelopeDaEspinha(...))`, em `try/calou`:
     `p = porNaPauta(p, "momento", momentoDoFio(espinhaRef.current, historiaRef.current.etapa, { dia: diaRef.current, vilao: nemesisRef.current }));`
     (`momentoDoFio` de `./saga.js`; devolve uma lista, que `porNaPauta` aceita).
  3. em `tentarSurgirNemesis` (~21760): `vilaoDoFio(n0, espinhaRef.current, { derrotados: ..., dia: diaRef.current })`. Sem `dia` já
     funciona pelo último dia que a espinha conhece.
  4. em `talvezDarUmaTrama` (~17710): `montarTrama({ situacao: situacaoDaTrama(), material: materialDaTrama(), amarra: forcar ? null : { fio, prometido: prometidoRef.current, nomes: [nome da nêmesis, se houver] } })`
     — o mesmo `fio` (`fioDaHistoria`) e o mesmo contexto do item 4 da fiação do v9.388; `forcar` (a abertura sem pista) passa sem porta.
  5. para o `fecho.js` do outro `backend`: `fimDeAto` é `!!(marcoAtual(espinhaRef.current, etapa) || {}).batida?.fecho`.
- **o que ficou:** a 5.ª sessão deve medir se o Narrador entrega o segredo no turno da chegada e a reviravolta inteira; e as entradas
  deste diário desde a v9.386 estão dentro do bloco de código do "Formato" — arrumar numa passada.

## 11/10 · v9.388 · MM, a campanha que prende, item 3: os fios das viagens (`backend`) · este commit

- **o defeito:** três viagens e um acampamento (M22–M26, 36 h) sem uma frase de história, e três fios novos sem relação com ela
  (a Câmara do Dragão pelo correio no M15; o Torneio das Coroas e o pedido de Ondine na manhã do acampamento, M24), mais o boato
  das luzes no pântano (M15). Os encontros de cena saíam de uma tabela solta ("um marco de pedra com oferendas recentes").
- **o módulo:** `src/fios-da-estrada.js`. `temaDaEstrada` tira o tema do que a história já tem, por ordem (`ORDEM_DO_TEMA`): a
  promessa aberta que toca o fio, outra promessa (a mais pesada, pela tabela de `prometido.js`), a pessoa do fio, o lugar do fio;
  o tema anterior cede ao seguinte. `encontroComFio` reescreve o detalhe dos encontros de CENA (`COMO_O_FIO_ENTRA`: o viajante, o
  sinal, o trecho calmo); o perigo e o achado ficam com a tabela (são mecânica, e amarrar um lobo a Noé seria inventar).
  `linhaDoAcampamento` dá o tema à conversa da noite pela boca de quem anda comigo (sozinho, nada: seria narrar o que eu sinto).
  `fiosNovosNaEstrada`: na estrada e no acampamento, o envelope que abre fio novo (`FIOS_NOVOS`: correio, arco maior, missão
  gerada, mural, boato) só entra se se amarra (`amarraDoFio`, `O_QUE_AMARRA`: a pessoa do fio, a promessa aberta — a sua pessoa
  dita inteira ou duas palavras de cinco letras em comum —, um nome que o App dê; o lugar sozinho não amarra), e entra com a amarra
  dita; o resto fica seguro.
- **os números, contra o registo:** **os 4 fios novos que entraram na estrada ficam seguros, 0 amarrados** (nenhum tocava Noé,
  Inocência, a carta ou o culto). Dos 5 trechos, os 2 de cena ganham tema da história — o M15 (o sinal toca "a carta com nome de
  morto", de Inocência) e o M22 (a conversa volta às chaves pretas de Noé) —, sem repetir; o achado (M14) e os dois perigos (M25,
  M26) ficam com a tabela; a noite do M23 volta a uma promessa pela boca de Euzébio.
- **decisões médias:** (a) a pessoa da promessa casa INTEIRA: na primeira prova "a mulher de capa verde" amarrava Ondine ("anão
  mulher") pela palavra "mulher". (b) O lugar não amarra: Ondine é "em Rio Cinzento", a cidade onde se dorme, não a história.
- **a prova:** `testes/teste-fios-da-estrada.mjs` (42 asserções, vermelha em HEAD), com os quatro envelopes do registo embutidos.
- **a fiação que fica para o App (frontend, com o bastão), exata:**
  1. `import { encontroComFio, linhaDoAcampamento, fiosNovosNaEstrada } from "./fios-da-estrada.js";` e `const ultimoTemaRef = useRef("");`
     — e tirar `fios-da-estrada.js` de `AGUARDANDO` em `teste-ligacao.mjs`. Precisa do `prometidoRef` do item 1.
  2. Na viagem (~23536), depois de `rolarEncontro`, em `try/calou`: `const encV = encontroComFio(enc, { fio: fioDaHistoria({ abertura: aberturaMundoRef.current, missoes: missoesRef.current }), prometido: prometidoRef.current, ultimoTema: ultimoTemaRef.current }); if (encV.tema) ultimoTemaRef.current = encV.tema.texto;`
     e o envelope usa `encV.detalhe` em "ENCONTRO DO TRECHO"; `enc.tipo` continua a contar as conquistas.
  3. No acampamento (~22468, `enviar(envelopeDoSitio(sitio), …)`): juntar ao envelope
     `linhaDoAcampamento({ fio, prometido: prometidoRef.current, grupo: (personagemRef.current || {}).grupo, ultimoTema: ultimoTemaRef.current })` (vazia sem grupo ou sem tema).
  4. No fim do acampamento (~22625, antes de `partes.join`): `const fe = fiosNovosNaEstrada(partes, { naEstrada: true, fio, prometido: prometidoRef.current, nomes: [nome da nêmesis, se houver] });`
     — `partes` passa a `fe.ficam`, e `fe.seguram` vai a `notaRef` (o turno seguinte). E em `enviar` (~12343), antes de
     `escutarOTurno`, a mesma chamada sobre os envelopes, com `naEstrada: !!jornadaRef.current || acampadoRef.current`; o que fica seguro
     volta a `notaRef` — na estrada continua seguro, e depois da chegada a escuta decide como sempre (adia uma vez, depois cai).
- **o que ficou:** o portão ideal é na GERAÇÃO (a missão de Ondine já nasce registada no diário quando o envelope chega): quem
  sorteia a trama e o arco maior pode perguntar `amarraDoFio(descrição, ctx)` antes de registar. `tramas.js` é do outro `backend`
  nesta leva; fica como pedido, não como edição.

## 11/10 · v9.387 · MM, a campanha que prende, item 2: o fecho variado (`backend`) · este commit

- **o que empurrava o fecho para o presságio:** duas linhas do ofício da cena no prompt fixo, lidas juntas — "Termine na imagem,
  não no resumo do que ela significa" e "Termine SEMPRE com uma situação aberta — a cena descrita, o silêncio depois dela".
  Imagem + cena descrita + silêncio = a linha de ambiente; e nada variava de turno para turno. As duas foram reescritas sem
  crescer o prompt (a PIOR CENA REAL desce de 73.979 para 73.971): a última frase é um fato, uma fala ou um gesto, e devolve a
  palavra "nunca no cheiro, no som ou no ar que pressagia (O FECHO da pauta diz como)". O "CORTE ANTES DE EXPLICAR" e o veto às
  listas de opções ficam.
- **o módulo:** `src/fecho.js` — cinco fechos (`FECHOS`: a pergunta de alguém em cena, a escolha posta pela ficção, o corte seco,
  a consequência, o silêncio que espera), pesados por momento (`FECHO_POR_MOMENTO`: pergunta, ato, sistema, luta, fim de ato —
  este, a escolha com preço, a mesma regra do fecho das batidas da espinha), nunca o anterior, sem gente nunca pergunta nem
  silêncio, sorte por gerador semeado. `fechoDaNarrativa` lê a última frase de uma resposta (pergunta, fala, presságio, corte,
  ação). A pauta ganha `O FECHO` (prio 2,43), a última na leitura, depois do RUMO.
- **os números, contra o registo:** **27 das 42 respostas fechavam em presságio (21 das 30 fora da luta)**. A escolha nova para
  os mesmos 42 turnos: consequência 13, corte 12, silêncio 7, pergunta 5, escolha 5 — zero repetições seguidas, nenhum passa de
  um terço, e nas perguntas quem respondeu fica à espera ou devolve a pergunta na maioria.
- **decisões médias:** (a) a voz do Narrador em massa (as duas linhas do ofício) era "pesado e da pessoa" na nota da sessão 4; a
  ordem de 28/09 dá à Fase MM liberdade igual à do desenho, e um commit revertido desfaz isto — fez-se. (b) `teste-mm18-escuta`
  dizia "O RUMO é a última na leitura"; com O FECHO depois dele, a asserção passou a "depois do RUMO só O FECHO", com o motivo no
  comentário.
- **a prova:** `testes/teste-fecho.mjs` (48 asserções, vermelha em HEAD), com as 42 últimas frases da sessão embutidas.
- **a fiação que fica para o App (frontend, com o bastão), exata:**
  1. `import { escolherFecho, fechoDaNarrativa } from "./fecho.js";` — e tirar `fecho.js` de `AGUARDANDO` em `teste-ligacao.mjs`.
  2. `const fechoRef = useRef("");` (não vai ao save: é o fecho de um turno).
  3. Em `pautaDoTurno`, logo depois do RUMO e antes de `cederNaCena`, em `try/calou`:
     `const fx = escolherFecho({ pedido: lerOPedido(acaoDoTurno), luta: !!combateRef.current, gente: pessoasDaCena().length > 0 || ((personagemRef.current || {}).grupo || []).length > 0, ultimo: fechoRef.current, sorte: rng(hashSemente(sementeMundo() + "|fecho|" + turnoDeRegistroRef.current)) }); fechoRef.current = fx.id; p = porNaPauta(p, "fecho", fx.linha);`
     — e `fimDeAto: true` quando a batida do ato em curso for o fecho do ato (o outro `backend`, `batidas.js`, quando subir).
  4. Depois da resposta (onde `narrativaFinal` existe, ~12700): `const lido = fechoDaNarrativa(narrativaFinal); if (lido === "pergunta" || lido === "corte") fechoRef.current = lido;`
     — o "anterior" passa a ser o que se leu quando o Narrador fechou de outro jeito.

## 11/10 · v9.386 · MM, a campanha que prende, item 1: as promessas do Narrador, cobradas (`backend`) · este commit

- **a queixa:** *"achei a história de morna para frio, não prendeu muito"*. Na 4.ª sessão o couro de Norberto, a gaveta errada, as
  cinco chaves e "Eu sou o recado" saíram do Narrador e morreram lá: `promessas.sementes` vazio do primeiro ao último turno.
- **o módulo:** `src/prometido.js` (e não `cobranca.js`, que já é a cobrança das moedas). O Cronista ganha uma secção curta
  (`SECAO_DO_CRONISTA`: `promessas` e `promessas_pagas`) e vê as abertas (`abertasParaOCronista`); `guardarSementes` filtra o
  lembrete de cena (`NAO_E_SEMENTE`: a tarefa, o estado, o presságio de ambiente) e guarda; `cobrarNoTurno` anda o relógio só nos
  turnos do jogador fora da luta e escolhe pela tabela de prazos (`TIPOS_DE_SEMENTE`: madura, vence, expira, peso) no máximo UMA
  madura, nunca num turno de pergunta (`lerOPedido`, escuta.js); cobrada fecha, a que a narração pagou fecha como `paga`, a que passa
  do prazo, perde quem a fazia ou cede o lugar no caderno cheio fecha como `expirada`. A pauta ganha a secção `volta` ("O QUE VOLTA",
  prio 2,47: depois dos vetos, do rumo e da planta; antes da economia da praça), antes do RUMO na leitura.
- **os números, contra o registo:** em 22 turnos do jogador fora da luta, **16 foram perguntas** — sobram 6 turnos de ato numa
  sessão inteira, e é por isso que a escolha pesa. Com as sementes que um Cronista com a secção devolveria (18 oferecidas, lidas à mão
  das narrações): **13 guardadas** (antes: 0), 3 recusadas por lembrete (a tarefa, o sino, o cheiro), 1 por repetida ("Eu sou o
  recado" é a mesma promessa que "o nome é o teu"); **voltam 4, em M8, M10, M22 e M26** (a carta dos antigos irmãos, "Euzébio passa
  sem som", "A dívida não dorme", a mulher de capa verde e o óleo de mirra — esta antes da masmorra, quando na sessão nunca voltou);
  2 pagas pela própria narração (o couro no M13, a gaveta no M19) e por isso nunca cobradas; 2 cederam o lugar; 5 abertas no fim,
  nenhuma pendurada. O cânone real do Cronista, mapeado como proxy, guardaria 8 e devolveria 3 — e guardaria "a lei do Sino" como
  promessa: é por isso que a secção é própria e não um mapa do cânone.
- **decisões médias:** (a) um cofre separado do Livro (`promessas.js`): o Livro esconde do Narrador a verdade da semente; aqui o
  Narrador sabe o que disse — juntar obrigava a inventar uma das 39 formas para cada frase. (b) Caderno de 6 com troca por peso: na
  primeira prova o caderno encheu no M14 com frases menores e recusou as chaves e "Eu sou o recado". (c) "nome" sozinho não faz duas
  promessas iguais (`comuns: 2`).
- **a prova:** `testes/teste-prometido.mjs` (61 asserções, vermelha em HEAD: o módulo e a secção não existem), com a sessão 4
  turno a turno embutida (a forma de cada turno do registo). `teste-ligacao` ganha a entrada de espera de `prometido.js`.
- **a fiação que fica para o App (frontend, com o bastão), exata:**
  1. `import { garantirPrometido, guardarSementes, pagarSementes, cobrarNoTurno, abertasParaOCronista, SECAO_DO_CRONISTA } from "./prometido.js";`
     — e tirar a entrada `prometido.js` de `AGUARDANDO` em `testes/teste-ligacao.mjs`.
  2. `const prometidoRef = useRef(garantirPrometido(null));` · no save (~8715) `prometido: prometidoRef.current` · no load (~13377)
     `prometidoRef.current = garantirPrometido(sv.prometido);` · na campanha nova, `garantirPrometido(null)`. Campo novo, a versão
     antiga ignora.
  3. No Cronista (`cronistaDoTurno`, ~10964): `SECAO_DO_CRONISTA` entra no array `sys` antes da "REGRA GERAL"; o molde JSON ganha
     `"promessas":[],"promessas_pagas":[]`; no `user`, depois do CÂNONE ATUAL, `abertasParaOCronista(prometidoRef.current)`. Depois do
     parse, em `try/calou`: `let e = pagarSementes(prometidoRef.current, r.promessas_pagas).estado; prometidoRef.current = guardarSementes(e, r.promessas).estado;`
  4. Em `pautaDoTurno` (~7282, ao lado do RUMO, antes de `cederNaCena`), em `try/calou`, fora da Noite:
     `const rv = cobrarNoTurno(prometidoRef.current, { pedido: lerOPedido(acaoDoTurno), luta: !!combateRef.current, fio: fioDaHistoria({ abertura: aberturaMundoRef.current, missoes: missoesRef.current }), mortos: (baseMundoRef.current || {}).mortos || [] }); prometidoRef.current = rv.estado; if (rv.linha) p = porNaPauta(p, "volta", rv.linha);`
     — uma vez por turno (`pautaDoTurno` só é chamada em `enviar`, ~12330), porque anda o relógio.
- **o que ficou:** o vermelho de `teste-regiao-historia.mjs` na árvore é do outro `backend` (saga.js/regiao.js/batidas.js em voo);
  com HEAD + só os meus caminhos a suíte inteira é verde (`so-o-meu.sh`).

## 11/10 · v9.385 · MM, as três fiações da auditoria de coerência e da 4.ª sessão (`frontend`) · este commit

- **quem:** `frontend`, com o bastão do `App.jsx` (tomado no início, devolvido no fim deste trabalho), e a regra em `missoes.js` e
  `saga.js`; sem tocar em `viagem.js`, `partida.js`, masmorra nem `json.js` (o `backend` em paralelo). Este bloco e uma `VERSAO = "v9.383"`
  subiram varridos da árvore no `11fb9ad` (a entrada do `backend` di-lo) e o `6b3fd24` levou a v9.384; o código desta
  entrada só sobe agora, e na colisão fica o maior: v9.385.
- **1 · a principal nas peças do arco (contradição 7, fechada):** `motorDoArco` passa `principal` (o título da missão principal), e
  ela sai de `impostas` para não ir duas vezes à mesma linha.
- **2 · um antagonista por campanha:** a nêmesis da fama nasce do fio da espinha (`vilaoDoFio`, saga.js) — o nome pelo qual a
  espinha casa o chefe, o título e o motivo do fio; o plano, o corpo e as fases continuam os do vilão. Em 48 campanhas, 48/48 com o
  nome que fecha o confronto final. O rosto (a revelação do nome, passo 5 de 9) espera o último ato, que é onde o fio diz o nome
  (`oRostoEspera`); e o chefe do fio caído EM COMBATE cai em qualquer fase (`caiuOFio`) — "ele escapa" seria mentira. Save sem
  fio, confronto feito ou antagonista morto: o de sempre. Campo novo `daEspinha` no vilão, só aditivo.
- **3 · "falar com" fecha pela conversa (defeito 5 da 4.ª sessão):** o Cronista devolve `falou_com` (quem falou com o herói frente
  a frente; citar, lembrar e procurar não contam), e a conferência que ele dispara fecha a etapa mesmo fora do lugar da ficha e sem
  ficha no registo (`conversouCom`, missoes.js) — na cidade da pessoa, quando se sabe qual é (o marco empresta a sua `cidade`).
- **4 · as duas linhas do `backend` (v9.380, v9.384):** o veredito à porta de uma masmorra do mundo recebe a ficha com as tochas
  que levo (`{ ...persIn, suprimentos: supIn }`) — dizia "sem uma tocha" a quem levava cinco; e a carroça da estrada sai da
  semente (o mundo, o trecho e o já andado), a mesma em toda máquina. Uma linha por uma linha: nenhum endereço andou.
- **decisões médias:** (a) o nome da nêmesis só vai ao Narrador depois do rosto — o arco, a mente da ameaça, o prisioneiro dos
  capangas e o fio do oráculo levavam-no desde o dia em que ela nascia, contra a regra do próprio `vilao.js`; com a nêmesis do fio
  entregariam o nome que a espinha guarda para o último ato. O oráculo perde o movimento "nêmesis" antes do rosto (a sombra já está
  na pauta por `resumoVilaoPrompt`). (b) O chefe sem nome próprio ("Quimera o Colecionador") fica com o título do arquétipo, para
  "nome, título" não dizer o epíteto duas vezes.
- **a prova:** três suítes, vermelhas em HEAD e verdes agora — `teste-arco-com-principal` (9; 3 falham em HEAD),
  `teste-nemesis-do-fio` (37; 26 falham), `teste-falar-com-em-cena` (24; 12 falham), `teste-tochas-e-carroca` (11; 4 falham). Build limpo, `npm test` e os varredores verdes. O
  App andou +5/+24 linhas: endereços de `acoes-do-jogador` re-medidos pelo diff, os nus à mão, com o motivo ao lado. A aba nova
  abre no menu, sem `LimiteErro` (sem tocar em save nenhum).
- **o que ficou:** a 5.ª sessão deve medir: a etapa "falar com" fecha no turno da conversa? a nêmesis aparece só como sombra até
  ao último ato?

---
## 11/10 · v9.380–v9.384 · MM, os defeitos da 4.ª sessão de prova, um por versão (`mente/mm11-sessao-4.md`) · 62115e8 · 51786f5 · 11fb9ad · este commit

- **quem:** `backend`, à mão, sem tocar no `App.jsx` (o `frontend` tem o bastão), nem em `missoes.js`/`saga.js`.
- **v9.380 · a masmorra certa (lugar.js, boca.js, dificuldade.js):** a causa não era a ida nem a escolha da masmorra — era o
  **Cronista**. À boca da Muralha ele devolveu `lugar: "forte da Muralha Quebrada"` três vezes (chamadas 51, 58, 60); o nome não
  casava letra a letra com o da boca, virou um sítio novo ancorado na cidade (2,8 km de Rio Cinzento), e o herói recuou 20 km
  sem andar. Dali "entro na Muralha" era uma ida (2 × 12 h), e "desço para dentro da masmorra" não tinha boca nenhuma: abriu um
  covil GERADO com nome sorteado, a "Fortaleza das Brasas". Agora: ao longe o mesmo sítio por outro nome não move
  (`NUCLEO_DO_NOME`, `mesmoSitioPeloNome`), o Cronista não muda o herói de sítio sem o pedido do jogador
  (`sitioNovoAoLonge`), e um save que já tem o forte reconhece-o como a boca. O veredito à porta passa a contar o corpo que
  entra (`ESTADO_NA_PORTA`: desvantagem ×0,55, sem tocha ×0,8, PV com piso 0,4): a Fortaleza da sessão deixa de ler MÉDIO
  (1,16×) e lê DIFÍCIL (0,51×) para a heroína Exausta e às escuras. Suíte `teste-masmorra-certa.mjs` (50; 28 falham em HEAD).
  A semente do mundo não está no registo; o mundo é reconstruído com os nomes e os números da tela (131 e 372 batem).
- **v9.381 · a aspa na prosa (json.js):** a resposta do turno da chamada 9 trazia `o apelido "Navarro" já no ar` sem escape; o
  resgate de `extrairJSON` levava "até à primeira aspa" (449 de 1.650 caracteres), e o Revisor recebeu o toco. Agora uma aspa só
  fecha a string quando o que vem a seguir é estrutura de JSON (`ASPA_QUE_FECHA`): repara-se e lê-se; se nem assim abrir, o
  resgate leva o campo inteiro. A resposta real chega com 1.650 caracteres, a fala de Euzébio e o fim da cena. Nenhuma das 42
  respostas bem formadas do registo muda. Suíte `teste-aspa-na-prosa.mjs` com a resposta real como fixture (21; 11 falham em HEAD).
- **v9.382 · o relógio da marcha (viagem.js):** cada avanço custava o passo inteiro × 3 com piso de 4 h — 12 h, sempre: a
  caminhada de 97 min gastava 12 h, e a ida de 4 h à Muralha também (×3 na sessão = 36 h). Agora `relogioDoAvanco` cobra o
  que se anda neste avanço mais as noites que a estrada atravessa (8 h de marcha por dia; a noite custa as 16 h que não se
  andam; quem chega no fim da marcha não paga a noite seguinte). 97 min → 97 min; 4 h → 4 h; 2 dias → 32 h (era 48); 37 dias
  → 36 noites e 8 h. O passo não muda. **Asserções movidas, com o motivo escrito:** `teste-veredito-da-partida.mjs` (a conta
  "de outra maneira" passa a ser a forma fechada; meio dia chega às 12:05 e não às 20:05; a jornada curta cobra os minutos;
  a secção dos prazos parte às 20:00 para atravessar a meia-noite). Suíte `teste-relogio-da-marcha.mjs` (16; 11 falham em HEAD).
- **v9.384 · a carroça semeada (mercado.js):** `talvezAmbulante` decidia com dois `Math.random` cravados. Agora a sorte entra
  por argumento: `semente` vira um gerador semeado (as duas tiradas, pela mesma ordem), senão a `sorte` de quem chama; sem
  nenhuma, a de sempre (é a chamada que o App ainda faz). Frequência medida em 3.000 sementes: 12,1% contra 12% da tabela. As
  opções `null` deixaram de estourar. Suíte `teste-ambulante-semeado.mjs` (12; 4 falham em HEAD).
- **fiação que fica para o `frontend` (duas linhas, nenhuma urgente):** (1) em `entrarMasmorra`, `vereditoDaMasmorra(doMapa ||
  mm, persIn)` passa a ficha com as tochas já tiradas da mochila — para a masmorra do mundo a cuja boca não se está, passe
  `{ ...persIn, suprimentos: supIn }`; (2) em `viajar`, `talvezAmbulante(dia, nivel, { lex, semente:
  ``${sementeMundo()}|${j.de}>${j.para}|${j.andadoMin}`` })`, com `j` a jornada depois de `andar` — e o determinismo fecha.
- **a verdade sobre o 11fb9ad:** entre o meu bump da v9.382 e o commit, o `frontend` escreveu a entrada dele neste diário e subiu
  `VERSAO` para v9.383 na mesma árvore; o `git commit -- src/constantes.js mente/diario.md` levou as duas coisas. O 11fb9ad diz
  v9.382 e traz `VERSAO = "v9.383"` e a entrada dele (o código dele não: só os seis caminhos meus). Não se reescreve — fica
  dito aqui. Na colisão fica o maior: este commit leva a v9.384.

---
## 11/10 · v9.376–v9.379 · MM, a auditoria de coerência: a espinha primeiro (a pessoa, 11/10) · 2b8f781 · c1ca0ad · 849a904 · este commit

- **quem:** `backend`, à mão, sem tocar no `App.jsx` (bastão do `frontend`), na `escuta.js` nem na `ofertas.js`.
- **a leitura de editor:** 12 campanhas novas de Uma Vida (sementes `nexo|0..11`), escritas como roteiro e julgadas por uma régua
  explícita (o script e as 12 histórias, antes e depois, ficaram no scratchpad da sessão). **Nota de nexo média 0,31 → 3,94 de 5.**
  A espinha era uma lista de chamada: 280 marcos sem porquê, 64 "o que X esconde" sem conteúdo, o antagonista ausente de todo
  envelope antes do fim em 9/12, o covil dele numa cidade e o confronto no clímax em 12/12.
- **v9.376 · a gente (interprete.js):** `lembra_de_antes` só com passado real (`viuAntes`) e só o que a ficha diz; `atrasa` e
  `pede_desculpa` passam a quem deve (`meDeve`); `usa_o_nome` sem apelido inventado ("Sibi"). Contradições 4 e 9, e o defeito 6.
- **v9.377 · o compasso tem chão (compasso.js):** o assunto que não cabe no lugar de agora espera que eu volte; 6 turnos e
  dissolve. Contradição 2 ("a corte de Rio Cinzento").
- **v9.378 · a abertura (abertura.js):** o sino nunca move quem se procura (contradição 1, o segundo Noé); o laço do soldado já não
  diz quem mandou a carta sem assinatura; o ofício da pista no género dela (contradição 11).
- **v9.379 · o fio da espinha (saga.js, mundo-base.js, regiao.js, procura.js, mestria.js, historia.js):** cada marco diz ao
  Narrador o que dá (aponta para a peça seguinte) e a sombra do antagonista no tamanho do ato; o chefe sem nome próprio casa pelo
  nome inteiro (o fim fechava ao matar qualquer bicho da espécie); o covil do principal é o clímax; os nomes de um mundo novo sem
  epíteto repetido nem espécie que o Léxico proíbe (`regiao.nomes`, só aditivo); o marco guarda a cidade e a procura diz-a
  (contradição 8); o passado volta por notícia (3); a principal abre as peças do arco (7, falta a fiação).
- **as contradições da lista:** de 12, a 12 já estava; ficam consertadas 1, 2, 3, 4, 6, 8, 9, 11 (oito); a 7 tem a regra e espera a
  fiação; a 5 é da `ofertas.js` (parte feita na v9.374); a 10 (homónimos na base) ficou — só a procura passou a preferir o nome
  inteiro.
- **a prova:** seis suítes novas, todas vermelhas em HEAD e verdes agora (`teste-gente-sem-invencao`, `teste-compasso-no-chao`,
  `teste-abertura-com-nexo`, `teste-fio-da-espinha`, `teste-nomes-do-mundo`, `teste-um-fato-um-lugar`). Teto de prompt: pior
  caso real 73979, igual a HEAD.
- **decisões médias:** três asserções antigas movidas, com o motivo ao lado (o nome curto do chefe sem nome próprio, o covil do
  principal, a linha de base 54 → 53); os hashes do continente que mudaram vêm com a conta que os devolve ao de HEAD.
- **para o frontend (não feito — é App):** `motorDoArco` passar `principal: (ms.find((m) => m.tipo === "principal") || {}).titulo`;
  e a nêmesis da fama (`tentarSurgirNemesis`) nascer do antagonista da espinha (`espinhaRef.current.fio`) em vez de um nome novo —
  hoje há dois antagonistas em toda campanha.
- **o que ficou:** a gente do fio quer coisas que não tocam a história (12/12, as VONTADES da base); atos de mais de 6 peças (9);
  4 pares de homónimos entre as peças.
- **a 5.ª sessão deve medir:** quantas respostas do Narrador sobre um marco casam com o FIO dele (a pessoa disse o que sabe? o lugar
  guardou o objeto dito?); se o antagonista aparece antes do fim como sombra e só no fim pelo nome; quantas contradições entre
  órgãos sobram no mesmo pedido; e se a nêmesis e o antagonista da espinha se cruzam.

---
## 11/10 · v9.375 · MM18, a fiação: o Mestre que escuta e o mural sem a gente da história · este commit

- **quem:** `frontend`, à mão. Bastão `.claude/app-jsx` tomado às 00:56 para isto e devolvido no fim.
- **o que liga (`App.jsx`, tudo em `try/calou`):** `escuta.js` em `enviar` — o pedido lido antes do compasso; numa pergunta, no
  degrau da escuta, compasso e forma da cena seguram (`talvezAndarOCompasso(conteudo, { segurar })`); a nota passa por
  `escutarOTurno` (no máximo 1 empurrão, o do fio primeiro; o que adia volta à nota uma vez); a escada anda depois da pauta; a frase
  do jogador fecha o pedido, depois do rodapé (o histórico guarda o `corpo` de sempre). O RUMO entra em `pautaDoTurno`, fora da luta,
  antes de `cederNaCena`. Campo novo `escuta` no save (retrato, load, turno desfeito), ignorado pela versão antiga. O mural:
  `historia: genteDaHistoria(...)` nos dois sorteios e na proposta do Mestre; o cartaz nasce com `pregadoEm` e o vencido sai do
  mural renovado e do rodapé. A Noite fica de fora (a escuta é de Uma Vida).
- **a prova:** `testes/teste-mm18-fiacao.mjs` (38) — vermelho em HEAD (28 falham: nada ligado), verde agora. Lê a fiação e repassa
  `testes/registo-s4-escuta.json` (os 23 turnos do jogador da 4.ª sessão, tirados do registo): **23 empurrões em 18 turnos → 10
  em 10, nunca mais de 1**; 200 mundos novos com os argumentos do App: **149 → 0** com gente da história no mural (os 156 do
  backend eram outro lote de sementes; o zero é o mesmo). `escuta.js` saiu da lista de espera da `teste-ligacao`.
- **jogado (vite preview, origem 4173, campanha nova "Prova MM18"):** a abertura mostra a regra da porta a acontecer (o guarda pede
  o salvo-conduto). Pergunta ao taverneiro por Wystan e pelo quarto: a última linha do pedido é a minha frase (etiqueta a 14.190 de
  14.401 caracteres, o rodapé a 1.838), O RUMO na pauta ("responda primeiro … uma coisa só aponta para: Procurar Wystan na Coroa
  Pálida"), zero empurrões; o save tem `escuta`. O mural da cidade de partida, no mesmo mundo: sem a lista, "Dagny o Manco" (pelo
  primeiro nome de um marco) pregava; com a lista, ninguém — e o mural ainda está fechado no começo (MM13).
- **localStorage:** origens 4173 e 5173, antes só `taverna_cfg_golpe_final`/`taverna_cfg_rolagens` (guardadas em arquivo no
  scratchpad). Nasceu `taverna_save_v1` em 4173; tirado com o jogo desmontado, e as duas origens conferidas por leitura iguais a antes.
- **decisões médias:** as asserções literais da nota e do compasso (`teste-biblioteca`, `teste-compasso`, `teste-mm13-abertura`)
  aceitam a forma nova, com o motivo escrito ao lado; o RUMO entra antes de `cederNaCena` para não mexer na régua de `teste-como-chega`
  (ele não cede). Os endereços da tabela das ações re-medidos pelo diff contra 7452e3a, só em texto de dado (94 → 0).
- **o que ficou:** o mural só se vê depois de a principal orientar o herói; a prova viva do cartaz que vence (3 dias) fica para a 5.ª sessão.

## 11/10 · v9.374 · MM18, a história não se oferece (a queixa de 11/10, tarefa 3) · este commit

- **quem:** `backend`, à mão. O conserto inteiro precisa do `App.jsx`: a parte do motor está feita e provada; a fiação fica
  descrita abaixo para o `frontend`.
- **a causa:** não eram principais a nascer como oferta — a principal nasce ATIVA (`abrirAbertura`). Era o **mural**: ele prefere
  quem o herói já conhece (`oferecerTrabalhoDaqui`, v9.37), e no começo quem se conhece é a gente da história. Na 4.ª sessão o
  alvo da principal ("O rasto de Noé Laminado") pregou **"A caçada de Noé Laminado"**, e Caetano, preso no coreto, pregou "O que há
  em O Campo Trêmulo" — que ficou **26 turnos** no rodapé com "Aceitar". Para quem joga, a história a pedir aceite. Medido em 200
  mundos novos: em **156** o estoque do mural da cidade de partida tem gente da história (a pista, o alvo, quem os marcos nomeiam);
  em 93 a própria pista ou o próprio alvo.
- **o motor (`ofertas.js`):** `genteDaHistoria` (a pista e o alvo da abertura, dador e alvos das missões que não se recusam, quem os
  marcos por fazer nomeiam); `ehDaHistoria` (pelo nome, ou pelo título do diário que o App já manda em `evitar`); `ofertasDaqui` e
  `cartazDaProposta` recusam a gente da história (`historia`); `cartazVencido` + `CARTAZ_ESPERA` (3 dias desde `pregadoEm`).
  **Sem a fiação** já sai quem está no título da principal (93 → 79 em 200); **com a fiação, 156 → 0.**
- **Mapa de chamada para o `frontend`** (âncoras de hoje):
  1. linha 24: somar `genteDaHistoria, cartazVencido` ao import de `./ofertas.js`.
  2. `oferecerTrabalhoDaqui` (~17931) e `garantirMural` (~21320): `ofertasDaqui({ …, historia: genteDaHistoria({ abertura: aberturaMundoRef.current, missoes: missoesRef.current, espinha: espinhaRef.current }) })`.
  3. a proposta do Mestre (~10989): `cartazDaProposta(…, { cidade, nivel, historia: genteDaHistoria({…}) })` — `null` quando é da história.
  4. `pregarNoMural` (~21346): o cartaz entra com `pregadoEm: diaRef.current`; e `garantirMural` e o rodapé (~24546, o
     `filter` dos oferecidos) passam a deixar de fora `cartazVencido(c, diaRef.current)`.
- **a prova:** `testes/teste-mm18-missoes.mjs` (22) — vermelho em HEAD (o alvo pelo título continuava no mural; não havia
  `historia` nem validade), verde agora; o mural de quem não é da história fica igual byte a byte.
- **o registo em `respondidas.md`:** a decisão "a principal é induzida pelo mundo, por bem ou por mal" não está lá — o briefing
  dizia que estava. Fica a pedir uma linha da pessoa (ou de quem a ouviu) com a data.
- **o que a 5.ª sessão mede:** nenhum cartaz assinado por alguém da história; nenhum "Aceitar" no rodapé mais de três dias.

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

## 28/10 · v9.497 · T4-B, o cenário, 1.ª fatia: preços e ocupações saem do motor (`backend`) · af612a9
- **o pedido:** o começo do modo autor (`mente/plano-motor.md`, Fase 4-B): um mundo novo entra sem editar módulo. Formato, carregador com validação, o cenário padrão, dois ou três catálogos lendo dele, dourado de antes.
- **o formato (decisão média):** objeto de dados puro e JSON-compatível. O padrão mora em `src/cenario-padrao.js` (um `.js` de dados, porque importar `.json` pede `with { type: "json" }` no Node e não no Vite); o arquivo de um autor pode ser `.json` de verdade (`carregarCenario(JSON.parse(texto))`), e a suíte faz essa volta. A regex é o texto dela. O cenário é completo (o que falta é recusado com o caminho, nunca herdado do padrão) e o campo que o motor não lê também é recusado.
- **como os catálogos leem:** `aoTrocarDeCenario(fn)`; as tabelas continuam com o mesmo nome, agora `export let` (a ligação viva do ESM), e o App não muda. `usarCenario` valida antes de avisar e volta tudo se um catálogo estourar. Trocar é ato de arranque: quem copiou a tabela no import fica com a antiga.
- **passaram:** os preços (`economia.js`: a escala do `ECONOMIA_PROMPT`, o valor por raridade, a miudeza, os 11 preços comuns; leitores: App, mercado, regras-jogo, prompt, juiz-de-fidelidade, bolsa-da-frase, em-cena, fichas) e as ocupações (`classes.js PROFISSOES`; leitores: App, profissoes, prontos). Ficou no código o que é regra (a revenda a metade, a faixa da compra, o teto do porte, a língua).
- **não passaram, e porquê:** `nomes.js` e `divindades.js` são lidos por `src/motor/` (fim-do-turno, meio-do-turno), e o motor é da trilha A; `bestiario.js` entra no motor por `mundo-base.js`; `PROFISSOES_DO_SISTEMA` (lexico.js) repete os doze nomes e fica para a próxima fatia (num mundo de outras ocupações o léxico gerado as perde).
- **a prova:** `testes/cenario-dourado.json`, 578 casos tirados do f0a9fae por `git archive` (`gerar-cenario-dourado.mjs`): 500 bancas semeadas, os preços comuns por 14 fatores, a pauta do preço perguntado, as doze ocupações em todas as funções. Depois da mudança: 0 diferentes. A prova morde: caneca a 2 → 7 casos; raro a 221 → 106; comum a 16 → 301; Mercador com 25% → 3. `teste-cenario.mjs` (58): um mundo de teste (a Estação Órbita Sete) muda os preços e os ofícios sem tocar em módulo, 19 cenários inválidos recusados com o caminho, congelado a fundo, a mesma semente dá a mesma banca, e o esquema lê de volta as raridades do loot e o vocabulário que `profissoes.js` consome.
- **verde:** build limpo; `npm test` 367/367 e 23/23; `so-o-meu.sh` com HEAD mais os 8 arquivos: 366/366. A trilha A subiu a v9.496 no meio; nenhum arquivo dela tocado.
- **o que ficou:** a próxima fatia (nomes, deuses e bestiário, quando o motor da trilha A os libertar), o `PROFISSOES_DO_SISTEMA` e quem chama `usarCenario` no arranque (o frontend, com o arquivo do autor).

---

## 28/10 · v9.495 · Fase T3, trilha B (1.ª fatia): o Juiz de fidelidade mede (`backend`) · e46914e
- **o pedido:** o Juiz de `mente/plano-motor.md` (Fase 3), adiantado: a prosa contra EM CENA, mapa, mercado e pauta → veredito com trecho e motivo; só mede. Corpus rotulado das sessões 6–12, meta ≥ 90% apanhados e ≤ 5% de falsos positivos.
- **o nome:** `src/juiz.js` já existe (o XP, v9.154) e `testes/teste-juiz.mjs` é a suíte dele: nasceu `src/juiz-de-fidelidade.js` + `testes/teste-juiz-de-fidelidade.mjs`; o corpus em `testes/juiz-rotulado.json`, como pedido.
- **o corpus:** não há registo bruto das 6.ª, 7.ª, 11.ª e 12.ª no disco (os `.jsonl` viviam em scratchpads apagados). Prosa real: as 197 narrações das 8.ª–10.ª (`registo-s8-s10-cronista.json`) e, das 6.ª/7.ª/11.ª, só os excertos que os relatórios citam entre aspas. A 12.ª não entra (resumo sem transcrição; diz 0 pessoas inventadas). O estado de cada turno sai do disco: o registo do Cronista, o EM CENA das 78 pautas da 10.ª, as 16 pautas inteiras do fim dela, as pautas dos confrontos da 8.ª e o mundo da 9.ª **refeito pela semente** (`oQueExisteAqui`, com a semente da espinha); onde o disco não chega, das linhas da transcrição (`PERGUNTOU caneca ◉ 2`) com o M citado.
- **decisões médias:** (1) **dois rótulos contestados pelo disco**, fora das contas com a prova: o "acorda em três horas" do Dolmen (a 10.ª conta-o; o DESFECHO do turno 58 dizia "acorda em 3 horas") e a Ursa que "só veio em M33" (a narração de M26 a traz). (2) os '+1' dos relatórios e as repetições do mesmo sítio inventado (a banca dos cambistas em M15 e M20 é UMA invenção) são `marginais`. (3) as classes que o Juiz não mede (consequência, armado, hora do dia) contam-se à parte. (4) `teste-ligacao`: entrada datada na lista de espera, credor a trilha A (a linha do Juiz no custo do turno, depois de `aplicar`).
- **a medida:** 53 de 55 rotulados (96,4%) — preço 20/20, distância 12/12, pessoa 9/9, pauta 4/4, lugar 8/10; 2 de 158 limpas acusadas (1,3%) — ambas "há duas/três noites" que, lidas, são tempo inventado que os relatórios não contaram (ficaram como acusação, não viraram rótulo). Sem o estado do sistema, as mesmas limpas: 37 acusadas.
- **o que ficou:** o Juiz não vê o sítio sem marca ("o fundo da taverna", "a banca à frente", o poço das Celas, a pensão que é só "uma porta baixa"), a hora do dia, a consequência, a pessoa armada, o nome certo na pessoa errada (Nira, Godofredo). **A régua foi afinada sobre o mesmo corpus em que mede:** a 13.ª sessão é a primeira prova fora dele. Para corrigir/repedir, a fiação precisa de entregar por turno a pauta enviada (texto), o registo de gente e lugares, o estoque das bancas da cena, a bolsa, os tempos vivos (desacordado, prazos) e as narrações anteriores da sessão.
- **o bastão do número:** o meu bump para v9.494 subiu dentro do 702cedf da trilha A (árvore partilhada; o título dela diz v9.493). Este commit ficou com v9.495.

## 28/10 · v9.487–v9.490 · Fase T1, trilha A (3.ª fatia): o meio do turno sai do componente, e o turno corre numa ordem só dentro do motor (`oficial`) · bd9e60f · 48579a9 · aeeabdc · bdf1abd
- **o pedido:** a 3.ª fatia da T1-A de `mente/plano-motor.md`: `registrarLugar` puro e o bloco do mapa no motor; as missões e os sinais; as duas peças do motor fundidas numa ordem só; se sobrasse, o combate, o códex, a chegada e o portão; e uma suíte para a frase do grupo cheio. Em paralelo, o `backend` na T1-B 3 (subiu 299a384 entre o meu início e o meu 1.º commit; não toquei nos arquivos dele). Nenhuma chamada paga: `taverna-sem-ia` (porta 5199, endereço morto) e o Narrador falso por gancho em `fetch`.
- **1. o mapa e o lugar dito (bd9e60f, v9.487):** `src/motor/meio-do-turno.js` (novo) com `registrarOLugar` (a régua do `registrarLugar`, que o Mestre e o Cronista dividem; o App ficou com a fiação), `nevoaDaVizinhanca` e `aplicarOMapa` (as cidades e facções, a porta da masmorra deste turno, o lugar dito, a cidade pisada com a jornada que acaba, a névoa e a cerimónia — a chave `Date.now()` da faixa põe-na o App —, o meio da jornada, a facção, a geografia e a devoção). A `casarDevocaoComMapa` do App saiu (o único chamador). **Prova:** `gerar-meio-dourado.mjs` corre, lido do git (d776408), o meio inteiro (dádiva, mapa, missões, sinais) e as closures que ele chama, sobre as 275 narrações com mapa de verdade, e fotografa depois de cada bloco; o mapa no motor dá **275/275 ao byte**; morde (sem jornada 91, outro nome na ficha 88, outro dia 34, outra semente 14).
- **2. as missões, os sinais, a fé e o milagre (48579a9, v9.488):** `dadivasConcedidas`, `arcoComOMarco`, `ganhoDeFe`, `milagreInvocado` (puras; o App ficou com quatro fiações com os mesmos nomes, porque os botões, o descanso, as missões e o Cronista também as chamam), `aplicarAsMissoes` e `aplicarOsSinais`. O `motorDoArco` do App aceita `sobre.eventos` (o bloco encerra o evento ANTES de o marco virar o arco). **Prova:** as quatro peças em fila contra as quatro fotos — **275/275 ao byte** (o estado, o que cada prompt remontado leu no instante, a tela, a nota); percorre dádiva 31, evento global 33, fé 54, milagre 12 e a recusa 35, ascensão 21, achado 44, arco que vira 18, ficha do milagre 7.
- **3. a fusão (aeeabdc, v9.489):** `aplicarOTurno` (src/motor/aplicar.js) corre aplicar → dádiva → mapa → missões → sinais → registo, com o estado de peça em peça, e devolve os efeitos todos na ordem; o App faz **uma** chamada e **um** `aplicarOsEfeitos`. **Sim, as peças fundiram-se.** A cola tinha dois furos que a fila escondia: a base do nome e o mundo da peneira do segredo liam os REFS, que dentro do motor ainda não têm o mapa, a cidade, o lugar e a ficha que o meio acabou de escrever — o registo passa-os agora (`baseDoNome(sobre)`, e o mapa do estado no mundo da peneira). **Prova:** `gerar-turno-dourado.mjs` corre do git (48579a9) o aplicarResposta do começo ao registo, o `aplicarOsEfeitos` e o motor do mesmo commit (copiado para src/motor/ com nome de rascunho, importado e apagado) sobre 275 turnos que somam as três famílias de casos: **275/275 ao byte** (estado, prompts, travas, resposta podada, tela, nota); morde (base do nome dos refs de antes do turno: partem 2). Peça do meio que estoura → `calou`, o turno segue.
- **5. a frase do grupo cheio (bdf1abd, v9.490):** régua `frasesDoGrupoCheio` no motor e `teste-grupo-cheio.mjs` (11), jogando o juízo de verdade.
- **4. não coube:** o combate, o códex, a chegada e o portão seguem no `aplicarResposta`.
- **as linhas do `aplicarResposta`:** 1.160 → 807 (início desta fatia) → **565**. O App tem 28.306 linhas (eram 28.726); `aplicar.js` 623, `meio-do-turno.js` 671.
- **no navegador, sem Narrador:** campanha nova (Vera, Fantasia, Terras abertas); um turno com cidade nova (`cidade_atual`), `mapa_cidades`, `evento_global_encerrar`, cânone com uma pessoa e `loot:raro`: a cidade registrada entrou no mapa, o Oswin entrou na gente pelo cânone, o achado teve a linha e a revelação, a cerimónia do lugar novo abriu, nenhum `calou`. **O evento global não pôde ser provado aqui:** injetei-o no save com o jogo desmontado e o load não o trouxe (`semGlobalDesde` ficou 0) — não investiguei porquê; está provado em Node. Espaços de save da origem 5199 guardados antes e repostos depois (só as duas preferências).
- **testes movidos, com o motivo escrito:** de texto para comportamento (o motor não se lê pelo texto): momentos (a faixa, a cerimónia, a revelação e a ordem do achado), masmorra-na-pauta, mm14-lugar, mm15-lugar, narrador E2/E3, efeitos (o milagre em `empilhar`; `efeitoDeMilagre` saiu da lista dos imports do App), bestiário, mm14-canais, mm8c2; de texto para texto (o App mudou de forma): arco-com-principal e nêmesis-do-fio (a âncora do `motorDoArco`), companheiro-inicial, mm14-gente, mm15-nomes (a `baseDoNome`). Endereços de acoes-do-jogador re-medidos pelo diff, uma vez por commit, com o degrau escrito na tabela; os nus à mão.
- **decisões médias, com o motivo:** (1) **mover sem consertar** — os defeitos abaixo foram reproduzidos byte a byte de propósito: a prova de um movimento é que nada muda, e um conserto no mesmo commit apaga a prova; ficam como itens leves, cada um com teste. (2) **a única troca no código de antes** foi o nível em `ganharFe` (ver o defeito 1), declarada e contada nos dois dourados. (3) **as travas em `aplicarOsEfeitos` só voltam quando o estado as traz** — o registo não as leva, e o `undefined` desarmava a trava do dano que o aplicar deixara armada (regressão da 2.ª fatia, achada nesta). (4) **o varredor `check-acoes-do-jogador` lia a guarda do relógio no sítio errado** (casava com as portas dos sinais; a guarda verdadeira ganhou um 4.º termo na MM14) — agora lê as linhas à frente do avanço.
- **a nota da trilha B:** `aplicarORegisto` sobre estado sem `npcTurno` gravava NaN — deriva-se das fichas como o load deriva (`retomarContador`), com teste que falha antes (bd9e60f).
- **build/test:** `npm run build` limpo nos quatro; `npm test` **364/364 suítes + 23/23 varredores, A=0** no último (363/363 nos três primeiros; HEAD + só os meus arquivos, 363/363 + 23/23, no 1.º — no 2.º ao 4.º a árvore só tinha os meus).
- **bastão:** tomei `.claude/app-jsx` ("oficial T1-A3") às 00:15 e devolvi-o às 02:10, depois do 4.º commit.
- **o que não soube / o que fica (os achados primeiro):**
  - **defeito 1, consertado na 2.ª etapa:** o `aplicarResposta` é um `useCallback` com `[pushMsgs]` e nasce no primeiro render, com `personagem` nulo; o `ganharFe` que ele fechava lia `personagem.nivel` — todo sinal "fe:" com o deus desperto derrubava o turno inteiro. Não o vi a acontecer no navegador (não há deus desperto numa campanha nova); é leitura do código mais o dourado, que estoura sem a troca.
  - **defeito 2, achado e NÃO consertado — o achado do sinal some:** o `loot` entra por `setPersonagem(p => …)` e, mais abaixo, o `aplicarResposta` faz `setPersonagem(pers)` com a ficha que não o tem: o React aplica as duas na ordem e o item perde-se. **Visto no navegador:** a linha "◆ Achado" e a revelação dizem "Já está na sua mochila", e o save tem `equipamento: []`. O mesmo vale para a cura/efeito do milagre pelo sinal (`ficha` sobre o ref, sobrescrita pela ficha do turno). Conserto: o motor põe o achado (e o milagre) na ficha DO TURNO; um teste do turno fundido que o exija.
  - **defeito 3, achado e NÃO consertado — a cidade pisada volta à névoa:** com `mapa_cidades` e `cidade_atual` no mesmo turno, o bloco do mapa escreve no fim a cópia do mapa feita no começo, por cima da descoberta, da pisada e da névoa da cidade nova. **Visto no navegador:** o herói em Baixo do Vigia, e no save a cidade com `descoberta: false`, sem `pisada`, depois da linha "entrou no seu mapa" — a cerimónia vai abrir de novo na próxima chegada. Provado em Node (com e sem `mapa_cidades`). Conserto: as cidades do Mestre fundem-se no mapa de AGORA (ou levam as marcas do pé); muda o dourado do mapa nos casos que juntam os dois campos, e é isso que o teste tem de dizer.
  - **defeito 4, achado e NÃO consertado — a fama dos sinais é sempre a do nível 1:** pela mesma razão do defeito 1, o `famaAtual` do `aplicarResposta` lê `personagem && personagem.nivel` → 1. Reproduzido de propósito (`nivelDaFama` no estado do turno, com o comentário); muda quanta fé um feito dá — é número de jogo, por isso não o mudei calado.
  - **a fiação de antes no App que o turno fundido ainda tem por baixo:** o combate, o códex, a chegada e o portão (o resto do `aplicarResposta`, 565 linhas). O combate é o maior (`processarCombate`, `abrirCombate`, a presença divina, os espólios).
  - **a nota da trilha B, item 2 (o recibo e `gestoDoCampo`, ~21 asserções de texto):** não coube; `gestoDoCampo` está em App.jsx:4043, o recibo do turno já é `reciboDoTurno` (glifos.js) — falta ver quais das 21 provam regra pura pelo texto do App.
  - **as fiações dos botões** (`ganharFe`, `invocarMilagre`) passaram a ler o nível da ficha do ref e a remontar o prompt pelo `aplicarOsEfeitos` (com `nomeCampanhaRef` e `mundoAtual()`), em vez do `personagem`/`nomeCampanha`/`mundo` do render — melhor nos caminhos de closure velha, igual nos frescos; não há dourado desses caminhos.

## 28/10 · v9.486 · Fase T1, trilha B (3.ª fatia): o jogo em Node passa pelo registo e pelo sítio da frase, e as 2.069 provas de texto do App classificadas uma a uma (`backend`) · este commit
- **o pedido:** a 3.ª fatia da T1-B de `mente/plano-motor.md`. Em paralelo, o `oficial` na T1-A3 (`App.jsx`, `src/motor/aplicar.js`, `aplicar-casos.mjs`, `teste-motor-aplicar.mjs`, `src/motor/meio-do-turno.js` novo; bastão dele desde 00:15); não toquei em nenhum. Nenhuma chamada paga.
- **1. o jogo em Node passa por tudo o que já é motor (`jogar-em-node.mjs`, 24 → 28 asserções):** depois do `aplicar`, o **registo** (`aplicarORegisto`, na posição do App: antes do Cronista) com a resposta como os registos a guardam (`mudancas: {}` — a prosa só; anda o `npcTurno`, 0 → 20 em 20 turnos, e corre a blindagem da PESSOA do cânone); a **sorte do turno** (`sorteNoPonto(…, "salvaguarda")` no `ctx.sorte` do `aplicar`, como o App); os **nomes à mão** (`nomesAMaoNaProsa` sobre a linha "a quem não tem nome" da pauta da 10.ª — a narração nunca usou os oferecidos: 0 nomes, mas o passo corre); e **o sítio pela frase** (`lugarPedido` + `definirLugar`, com as guardas do `alvoLocalPedido`), a metade pura do passo 1. A lista de sítios a pé é a **planta do registo** (os sítios que a 10.ª pisou por cidade): no App ela sai de `locaisDaCidade(semente do mundo…)` e o registo não guarda a semente. Se a régua pura levar o herói a outro sítio, o turno **DIFERE** (não fica pendente). **Medido: a 10.ª, 20 turnos: 15 → 17; a 10.ª inteira: 62 → 68 de 77, 0 diferem; s8 62/70 e s9 45/47 como antes. Somando: 169 → 175 de 194. A maior sequência igual ao registo na 10.ª (a régua inteira, o lugar também): 11 → 17.** Os 6 sítios que a frase move (M4, M15, M30, M37, M43, M47) batem todos com o registo; ficam 5 viagens e 4 sítios que a frase do turno não pede (a estrada de M17, a saída da Cabra em M9, a chegada da viagem em M42, a estalagem do "continuar" em M69). As catracas sobem com a medida (17, 68, 17).
- **o que o jogo em Node achou, para o oficial:** `aplicarORegisto` sobre um estado v2 recebe `npcTurno` indefinido (o estado de `estado.js` não tem o campo; o App guarda-o num ref à parte) e faz `npcTurno += 1` → `NaN`, que vai para o `ultimaVez` das fichas. No App não acontece (o ref vai sempre). O jogo em Node dá-lhe 0 na partida. Ou o campo entra no estado, ou a peça trata o ausente (`Number.isFinite`) — arquivo teu.
- **2. as 2.069 provas de texto do App, uma a uma:** duas réguas por script e a leitura à mão das maiores.
  - **a sonda** (scratchpad, não sobe): cada suíte corrida com cada asserção de texto instrumentada, a anotar os recortes que ela lê. **As 2.069 foram alcançadas; nenhuma lê recorte vazio, índice −1 ou nada.** Logo **(c) = 0**: nenhuma prova algo que já não existe. As guardas negativas ("o que saiu do App não volta") guardam coisas que existem noutro módulo e que o App ainda poderia recopiar — não são (c); caem sozinhas quando o App for só tela.
  - **a régua de classe** (`CLASSES_DE_T2`, em `teste-assercoes-de-texto.mjs`, decisão média): a primeira que casa leva a asserção — `regraNoApp` (corre código lido do App por `new Function`), `saida` (guarda negativa), `tela` (JSX, estilo, hooks — um piso), `fiacao` (o resto: import, chamada, ref, calou, save, ordem). O `--gravar` escreve as classes por suíte no JSON; a secção 4 confere que somam a lista, suíte a suíte, e que a régua morde (um caso de cada).
  - **à mão:** a1-relato, momentos, r3-campo-do-turno, efeitos, sala, convite, soleira-verbos, companheiro-inicial, guardado, juiz, veredito-da-partida, v4-cinta (o achado de cada uma em `classificacao.lidas`). **Quase tudo é (b)**: o App ainda é onde a fiação mora, e quase toda asserção pergunta ao App se ele chama, em que ordem, com que ref — nenhuma chamada a módulo responde isso.
  - **(a) convertidas: 1** — `teste-guardado` §5, o turno que ROLOU era montado com o recorte do App; a trava é de `guardado.js` e o selo mora em `SELOS_DO_RESOLVIDO.medidos`: passa a ser montado com o selo da tabela, e o contrato (o App manda o selo) fica no texto. **Partidas: 4** (a metade do módulo vira comportamento e sobrevive à T2; a do App fica): `r3` (estadoDoDado), `v4-cinta` (GLIFOS.coroa), `veredito-da-partida` (o veredito sem os minutos do turno), `juiz` §9 (a nota do motor). **Mal medidas: 8** — `r3-campo-do-turno` tinha `extrair(nome, F = APP)`, e a régua via o App em cada extração; as oito da porta e da seta leem `painel-relato.jsx`. O texto passou a argumento obrigatório.
  - **(b) para T2: 2.060 no HEAD** (2.063 na árvore, com as +3 do oficial em voo em `teste-motor-aplicar`): **fiação 1.767, saída 140, tela 132, regra pura no App 21**. A conta passou a ser por leva, encadeada (`levas` no JSON: T1-B 2 → T1-A 2 do oficial → esta), porque a lista desce por mais de uma mão.
  - **o que mais converteria, e é do oficial:** as 21 `regraNoApp` correm código puro do topo do App — o bloco do recibo (`DESFECHOS_DA_LUTA` … `portaDoAceite`, 12 em a1-relato) e `gestoDoCampo` (r3). Mudados para um módulo, viram import sem mudar uma linha da prova. E `fichaDeCompanheiro` monta o convidado com números literais que `teste-companheiro-inicial` confere contra `FICHA_DO_COMPANHEIRO`: a regra está duplicada no App.
- **3. a 11.ª e a 12.ª:** **não há fixture possível.** As duas tabelas do pedido (`…/scratchpad/s12/registo-s12.csv`, `…/scratchpad/s11/narrador-por-chamada.csv`) **já não estão no disco** (as pastas `s11/`, `s12/` e `s12f/` do scratchpad estão vazias; nenhum `.csv` em Temp nem no projeto). E mesmo se estivessem: a da 11.ª guardava só índice, latência, tokens e palavras (`mm11-sessao-11.md`, "o registo bruto não foi para o disco"); a da 12.ª, hora, uso, tamanhos, latência e a narrativa, **sem o corpo do pedido** (`mm11-sessao-12.md`). Nenhuma tem a frase com a pauta, as mudanças do Narrador nem o estado. **O que a 13.ª tem de gravar para servir** (um JSONL, uma linha por turno, no projeto e não no scratchpad): na linha 0, a **semente do mundo**, o gênero, o molde, o léxico e o **save de partida inteiro** (`retratoDoJogo()`); em cada turno, a **frase** (ou o clique: `{ porta: "mapa"|"botao", alvo }`), o **ponto da sorte** (dia, minuto, falas), o **corpo do pedido** (a pauta e os envelopes, como foram), os **nomes oferecidos**, a **rolagem** (chave e face), a **resposta crua do Narrador** (o JSON com `mudancas`, não só a prosa), a **proposta crua do Cronista** e o juízo, e **o estado depois** (cidade, lugar, jornada, a luta, os nomes da gente e do cânone, a ficha resumida, `npcTurno`) com a impressão do save. Com isso o jogo em Node deixa de precisar da planta do registo (sai da semente), dos nomes refeitos e do oráculo do lugar.
- **decisões médias, com o motivo:** (1) **a régua de classe por script** em vez de anotar 2.069 linhas à mão: o destino de cada asserção é derivável do código dela, e uma régua que corre de novo a cada `--gravar` não envelhece; a leitura à mão fica para as maiores e para o que a régua não vê (está escrita no JSON). (2) **partir em vez de converter** as mistas: a metade do App ainda prova uma fiação que existe; tirá-la seria (c) sem motivo. (3) **a planta do registo** como lista de sítios no jogo em Node: é dado que o save teria (a cidade e os sítios dela), não a escolha — a escolha é da régua pura, e se ela errar o turno difere.
- **build/test:** ver o commit.
- **o que fica:** as 21 `regraNoApp` e o `fichaDeCompanheiro` (do oficial); a `tela` é um piso (a régua só a vê pelo padrão; texto de componente sem JSX cai em `fiacao`); os 19 pendentes do jogo em Node — 5 viagens e 4 sítios (o `turno` do oficial e a fiação do lugar do Mestre), 6 nomes que entraram por outra porta e 4 combatentes da luta na 8.ª e na 9.ª.

## 27/10 · v9.482–v9.485 · Fase T1, trilha A (2.ª fatia): o Cronista só pelo juízo, o cânone e a gente no motor, a salvaguarda pela sorte do turno (`oficial`) · e9c0851 · 2fdb7e4 · este commit
- **o pedido:** a 2.ª fatia da T1-A de `mente/plano-motor.md`: a fiação que a trilha B pediu (o juízo do Cronista e o `aplicarRetrato`), o par seguinte do `aplicar` (cânone + gente) e a salvaguarda do fim do turno pela sorte do turno. Em paralelo, o `backend` na T1-B 2 (`regras-jogo.js` e a conversão das suítes de texto, que subiu em ffbcbe0 entre o meu 1.º e o meu 2.º commit). Nenhuma chamada paga: dev-server à parte (`taverna-sem-ia`, porta 5199, `TAVERNA_API=http://127.0.0.1:9`; o proxy respondeu `ECONNREFUSED`), e o Narrador, o Revisor e o Cronista falsos por um gancho em `fetch` na página.
- **1. o Cronista só pelo juízo (e9c0851, v9.482):** `cronistaDoTurno` chama `julgarOCronista` logo depois do parse (o convite como porta: `vereditoDoConvite(n).resposta === "aceita"`), em `calou`, e **toda secção lê `ac.X`** — as únicas leituras de `r` que ficam são as que o juízo precisa como entrada (o grupo proposto, para a porta; o lugar recusado, para a nota de correção de sempre). **Falha fechada:** sem juízo, `ac` é `{}`. Saíram do App `TABELA_FE`, `populacaoDe` e `fePorAcontecimento` (a tabela mora em `motor/cronista.js#TABELA_DA_FE`) e o `precoNoTexto(narrativa)` do cartaz (a paga é a da tabela da oferta). A correção de coesão lê as mortes recusadas por `vivo`; o "grupo cheio" continua dito ao jogador (lido do `recusado`). E `aplicarRetrato` repõe `desdeMundo` e o Livro de Promessas: as duas listas de espera (`teste-ligacao` §2b, `teste-mm15-ligacao`) voltam a ficar vazias. `teste-cronista-propoe` ganhou o §6 (a fiação).
- **2. o registo no motor (2fdb7e4, v9.484):** `src/motor/aplicar.js#aplicarORegisto(estado, resposta, ctx) → { estado, efeitos, paraOCronista, msgs }` — o cânone (a peneira do segredo, a rede do mapa) e a gente (as fichas do Narrador e as PESSOAS do cânone sem ficha, com a porta do homónimo e a menção que não é presença). **O corpo é o do App linha por linha**, na mesma posição do turno; os refs viraram estado, as escritas efeitos (`canone`, `mapa`, `npcTurno`, `npcs`), e **as duas remontagens do prompt viram um efeito `remontarPrompt` no fim** (decisão média, abaixo). O `contextoDoNome` partiu-se: `baseDoNome` (a metade do jogo, no App) + `contextoDoNomeCom` (a do nome, no motor); o App soma as duas e o objeto que chega a `nomeComDono` é o mesmo.
  - **a prova byte a byte:** `gerar-registo-dourado.mjs` corre os dois blocos de 4617715 (lidos do git, com o `contextoDoNome` de antes copiado à letra como dublê) sobre `casosDoRegisto()` — as 275 narrações reais, com cânone e gente variados pelos NOMES dos registos (os `conhecidos` de cada turno do Cronista): **275/275 iguais ao byte** (o cânone, o mapa, a gente, o contador, a nota, as linhas, se o prompt remontou). Percorre: 98 casos com linha na tela, 31 com a nota do homónimo, 244 que remontam e 31 que não. **Morde:** sem a espinha diferem 9, sem a abertura 12, com outro dia 202.
  - **no navegador, sem Narrador:** campanha nova (Vera, Fantasia), turno com cânone `Torre do Vigia Velho` (ruína) e `Oswin Malho` (pessoa) e a ficha `Hilda Corvo`: a torre **surgiu no mapa**, a Hilda entrou pela ficha, o Oswin pelo cânone (ultimaVez 2, conhecidoEm 1). No turno seguinte o Cronista falso propôs Tobias Sal, 300 fiéis, a Hilda no grupo e "a estalagem em Casa Rasa": **entrou o Tobias** (gênero "ele" → "homem"), **a Hilda não entrou no grupo** (sem porta), **o herói ficou na Ponte das Velas** (a viagem fantasma recusada) e a fé não andou (sem despertar). Nenhum `calou`. Os espaços de save da origem 5199 foram guardados antes e repostos depois (só as duas preferências; o save de prova saiu).
- **3. a salvaguarda pela sorte do turno (este commit, v9.485):** `aplicar` aceita `ctx.sorte` e os três sítios da segunda chance (eu, o grupo, os inimigos) rolam o d20 por esse fio (`1 + floor(sorte·20)`, a conta de `rolarSalvaguarda`); o App passa `sorteDoTurno("salvaguarda")`. Sem `ctx.sorte`, rola como rolava (pela casa) — por isso o dourado de sempre segue 275/275 e foi regerado idêntico. **O dourado novo:** `gerar-aplicar-dourado.mjs --sorte` corre o bloco de b9e6e20 com a `tentarSaidaNoFimDoTurno` de verdade a receber o d20 de `dadoDo(semente, "salvaguarda")` e a casa semeada com outra semente → `aplicar-dourado-sorte.json`; o motor dá **275/275**. O ganho, medido: com a sorte do turno as linhas da salvaguarda são as mesmas com duas casas diferentes em 275/275; sem ela, 166 casos mudavam com a casa. Não provei no navegador (a mudança no App é um argumento; a prova é a de Node).
- **as linhas do `aplicarResposta`:** 1.160 (b9e6e20) → 872 (4617715) → **807** agora; nesta fatia saíram 65 líquidas (os dois blocos, 85 linhas, viraram 17 de fiação). O App tem 28.727 linhas (eram 28.780); `aplicar.js` tem 559.
- **testes movidos, com o motivo escrito:** de texto para comportamento (a catraca nova da trilha B proíbe ler o texto do motor): `teste-mm14-gente` (as três portas, o nome certo, a mescla, a nota), `teste-mm13-abertura` (a menção que não é presença, nas duas portas), `teste-mm15-segredo` (a peneira do Narrador, e o fallback quando estoura), `teste-narrador-so-narra-e3` §5 (canone, npcs); de texto para texto (a forma mudou no App): `teste-falar-com-em-cena`, `teste-fiacao-prende`, `teste-mm15-segredo` (a porta do Cronista lê `ac.canone`), `teste-mm15-nomes` e `teste-companheiro-inicial` (`baseDoNome`). O §6 de `teste-cronista-propoe` normaliza o fim de linha (a cópia do `git archive` sai em CRLF e o recorte ia até ao fim do arquivo — foi o vermelho que a trilha B viu no HEAD). Endereços de `acoes-do-jogador` re-medidos pelo diff, uma vez por commit; os nus à mão. A contagem de asserções de texto do App desceu de 2073 para 2068.
- **decisões médias, com o motivo:** (1) **uma remontagem do prompt em vez de duas** — a segunda lia tudo o que a primeira lia, já atualizado, e entre as duas só mudavam o contador da gente e a nota, que o prompt não lê (medido: `npcTurnoRef` não tem leitor em `montarSystemPrompt` nem nos resumos); o dourado guarda SE remontou, e bate. (2) **o registo é uma segunda peça e não a continuação do `aplicar`** — entre os dois, no App, ainda correm as dádivas, o mapa, as missões e os sinais, que mexem no mapa, no lugar e na ficha que o registo lê; juntá-los agora mudaria a ordem. (3) **o d20 da salvaguarda num fio só** para os três sítios (um evento, a contagem da sorte do turno separa-o do resto).
- **bastão:** tomei `.claude/app-jsx` ("oficial T1-A2") às 22:33 e devolvi-o depois deste commit.
- **atenção, trilha B:** editei `teste-narrador-so-narra-e3.mjs` (§5, canone e npcs) enquanto ele estava em voo do teu lado — uma troca ancorada, num instante; o teu ffbcbe0 levou-a junto (está no HEAD, e lá estava vermelha até o meu 2fdb7e4 trazer o `aplicarORegisto`). Não houve perda, mas foi o mesmo arquivo nas duas mãos: fica dito.
- **build/test:** build limpo nos três; `npm test` **363/363 suítes + 23/23 varredores, A=0** na árvore; e HEAD + só os meus arquivos, 363/363 + 23/23, nos dois primeiros.
- **o que não soube / o que fica:**
  - **o mapa, as missões e os sinais** (as linhas logo antes do registo) chamam closures do App que ainda não são puras: `registrarLugar` (escreve a nota e o lugar), `abrirNevoaDaVizinhanca`, `casarDevocaoComMapa`, `marcarNoArco`, `setLugarNovo`/`setChegada` (a cerimônia da chegada), `portaDaMasmorra` com `masmorrasDoMundo`. A próxima fatia é mover `registrarLugar` (a régua já é `lerLugarDito`, pura; falta a nota virar `paraOCronista`) e então o bloco do mapa entra no motor; com ele, as duas peças fundem-se numa ordem só.
  - **o combate, o códex, a chegada, o portão** seguem no App; o combate é o maior (`resolverCombateDoTurno` com refs da luta).
  - **o `jogar-em-node`** (da trilha B) não passa ainda pelo `aplicarORegisto` — é arquivo do backend; o gancho seria chamar o registo depois do `aplicar` em cada turno, com `baseDoNome` vazia. Não o toquei.
  - **o "grupo cheio", achado ao escrever este diário:** com o grupo cheio, `vereditoDoConvite` recusa todos e o juízo diz `semPorta` (ou `desconhecido`) antes de chegar a `cheio` — a frase "o grupo está cheio" teria sumido da tela. Reposta no 3.º commit (lida do `recusado` com o grupo cheio), como saía antes do juízo para todo nome que não fosse já do grupo. Não está coberta por suíte (é fiação do Cronista no App); fica para quando o Cronista sair (Fase 2).
  - **o `contextoDoNome` partido** muda nada para quem chama, mas `baseDoNome` corre agora uma vez por turno do registo (antes, uma vez por nome); se nenhum nome precisar, não corre (é pedido na primeira vez).

## 27/10 · v9.483 · Fase T1, trilha B (2.ª fatia): a ficha incompleta não derruba o turno, as provas do motor viram jogo, a 8.ª, a 9.ª e a 10.ª em Node, e o replay começa (`backend`) · este commit
- **o pedido:** a 2.ª fatia da T1-B de `mente/plano-motor.md`. Em paralelo, o `oficial` na T1-A2 (`App.jsx`, `src/motor/aplicar.js`, bastão dele desde 22:33, e várias suítes de fiação em voo); não toquei em nenhum dos arquivos dele. Nenhuma chamada paga.
- **1. o defeito que o jogo em Node achou (`regras-jogo.js#aplicarMudancas`):** a ficha sem `inventario`/`habilidades`/`grupo` estourava em `[...pers.inventario]`, e as mudanças nulas em `m.dano_ambiental`. Agora: lista ausente ou `null` = lista vazia (numa cópia: a ficha que entra não ganha as listas); mudanças nulas = nenhuma; ficha que não é objeto volta como veio (inventar um herói seria pior); PV/PM sem número ficam como estavam (antes saía `NaN`), sem máximo não têm teto; moedas e XP sem número contam de zero. A ficha completa passa pelos mesmos caminhos: **`teste-motor-aplicar` segue 275/275 byte a byte**. Suíte nova `teste-ficha-incompleta.mjs` (34): **22 falham no `regras-jogo.js` de HEAD, 0 no novo**. E `jogar-em-node` tirou as listas do save de partida — é ele que o prova a jogar.
- **2. as provas de texto, medidas e classificadas:** a régua nova (`teste-assercoes-de-texto.mjs`) conta a asserção cuja condição DEPENDE do texto de `App.jsx` ou de `src/motor/*.js` — lido ou derivado (recorte, índice, contagem), seguindo os bindings com escopo (`@babel/traverse`, o parser que o Vite já traz; o `so-o-meu.sh` passou a exportar `NODE_PATH` para a cópia limpa o achar). **Antes: 2121 asserções de texto em 182 suítes** (2073 do App, 50 do motor, 2 dos dois). A auditoria dizia ~490: ela contou `.test(app)` direto; a régua de hoje conta também o que se deriva do texto (as posições, as contagens, os recortes), que parte igual no refactor.
  - **(a) convertidas em comportamento: 46** — todas as que liam o motor (`src/motor/aplicar.js`): `teste-cond` T1 e T3 "ligado ao jogo" (36: o relógio do grupo e os três sítios da salvaguarda, agora JOGADOS com `aplicar` e o d20 travado por `comSorte` — 20 passa, 1 falha), `teste-efeitos` §15.2 (6), `teste-juiz` §9 (2, mais a assinatura de `aplicarMudancas`, que lia `regras-jogo.js` e partiu com o conserto 1), `teste-frase-que-paga`, `teste-narrador-so-narra-e3`, `-e3-fiacao`, `teste-prova-viva-e4` (1 cada). O motivo está escrito em cada secção ("MOVIDA (27/10, T1-B fatia 2)"). Duas tinham metade no App: a do motor virou jogo, a do App ficou.
  - **(c) retiradas: 2**, com o motivo no `teste-cond`: o teto do recorte (guardava o próprio recorte de texto) e o "sem re-render de graça" (pergunta de React; o motor devolve sempre estado novo).
  - **(b) para T2: 2073 em 181 suítes**, contadas por suíte em `testes/assercoes-de-texto.json` (`paraT2`). Provam fiação que ainda mora no App. Não as classifiquei uma a uma entre (a) e (c): verdes, o texto existe (não são (c)); e as que provam regra de módulo puro pelo texto do App são a próxima leva (ver "o que fica").
  - **a catraca, decisão média:** nenhuma suíte lê o texto de `src/motor/` (o motor é puro: prova-se jogando), salvo a `esperaDoMotor` datada no JSON (vazia). **Atenção, oficial:** o padrão da T1-A ("a asserção segue o código: o nome APP ficou, o arquivo é o do motor") deixa de passar — ao mover um bloco do App para o motor, a asserção vira chamada (modelos: `teste-cond` T1/T3, `teste-efeitos` §15.2), ou entra na espera com data e dono. A contagem do App só é impressa contra a lista (deve descer); não morde, para não pôr vermelho quem escreve fiação nova antes da T2.
- **3. o jogo em Node cresce (`jogar-em-node.mjs`, 24 asserções):** (§1) M1–M20 da 10.ª: **15 de 20 batem**, os 5 pendentes do `turno` (sítio pela frase, viagem); (§4) **a 10.ª inteira, M1–M77: 62 de 77 batem, 0 diferem**, os 15 pendentes todos do passo antes do Mestre (10 `moverParaLocal`, 5 `viajar`) — e um conserto da régua: o "+1." da linha LONGE (marca de transbordo) era lido como gente e fazia M63–M77 diferirem por ninguém; (§5) **a 8.ª e a 9.ª pelo registo do Cronista** (`aplicar` + `julgarOCronista` turno a turno, e o estado tem de conhecer a gente e o cânone que o registo conhecia no turno seguinte, nem mais nem menos): **s8 62 de 70, s9 45 de 47, 0 diferem**; os pendentes são do App (6 nomes à mão da pauta, 4 combatentes da luta — estes vivem à parte do registo de gente e saem quando a luta acaba). **Somando: 169 de 194 turnos jogam em Node sem o oráculo, 0 diferem.** A meta da fase (20 seguidos iguais ao registo) **é batida na 8.ª (22) e na 9.ª (29)** com a régua da gente e do cânone; na 10.ª, com a régua inteira (o lugar também), a corrida mais longa é 11 — o que a parte é o `turno`.
- **4. `teste-replay-em-node.mjs` (14, novo):** a sessão como arquivo — `{ semente, turnos: [{ frase, narrativa, mudancas, rolagem? }] }`, 24 turnos da 10.ª com mudanças e testes de uma tabela (`MUDANCAS_DO_ARQUIVO`), condições no herói, no grupo e nos lobos. O turno como o App: o ponto da sorte, a casa semeada por envio com o ponto, o d20 por `chaveDaRolagem`, o `aplicar`, o relato. **Duas corridas, o mesmo estado byte a byte e o mesmo turno a turno** (12 faces do d20, 9 saídas de condição antes do prazo); outra semente, outros dados; correr outra sessão no meio não vaza sorte. **Interrompida e retomada pelo save** (`saveDoEstado` → JSON → `estadoDoSave`) **em cada um dos 23 cortes: o mesmo fim e os mesmos turnos.** E a prova de que a peça que segura isto é a semeadura POR ENVIO: semeada uma vez só, a retomada sai diferente em 3 de 23 cortes — é isto que o `replay.mjs` da T3 tem de manter.
- **build/test:** `npm run build` limpo; `npm test` na árvore (com a T1-A2 do oficial em voo) **363/363 suítes + 23/23 varredores, A=0**; depois o oficial subiu `e9c0851` e seguiu com a T1-A2 em voo (o cânone e a gente a sair do App), e a árvore ficou vermelha por ela (`teste-companheiro-inicial`, `teste-mm13-abertura`, `teste-mm14-gente`, `teste-mm15-nomes`, `teste-mm15-segredo`, `teste-narrador-so-narra-e3` §5 cânone/npcs, `check-acoes-do-jogador` — todas leem o App em voo). **HEAD `e9c0851` + só os meus 14 arquivos: 362/363 + 23/23**; o vermelho é `teste-cronista-propoe` §6 ("nenhuma secção aplica a proposta crua"), que **falha igual no HEAD puro** (`git archive HEAD src testes`, sem nada meu) e passa na árvore — é do oficial, fica dito aqui e não o toquei.
- **VERSAO:** o oficial subiu v9.482 (`e9c0851`) durante esta fatia; este leva **v9.483** (o maior + 1).
- **o que fica:**
  - **a próxima leva de (a):** as suítes que provam pelo texto do App uma regra que já mora num módulo puro (a contagem por suíte está no JSON; as maiores: `teste-a1-relato` 69, `teste-momentos` 63, `teste-r3-campo-do-turno` 55, `teste-efeitos` 54, `teste-sala` 51). Classificar cada uma pede ler a secção; não coube nesta fatia.
  - **os 25 pendentes do jogo em Node** são todos do App: o `turno` do oficial (15), os nomes à mão da pauta (`nomesAMaoNaProsa` depende dos nomes que a pauta ofereceu, que o registo não guarda), a luta (4). Os registos futuros deviam guardar os nomes oferecidos e o lugar de cada turno.
  - **a 11.ª e a 12.ª não têm registo de turnos em `testes/`** (só a prosa em `mente/mm11-sessao-1x.md`); entram quando houver o JSON.
  - **a salvaguarda do fim do turno ainda rola pela casa** (o diário da T1-A1 já o dizia); o replay prova que, semeada por envio, isso basta para retomar — mas o fio explícito (`d20` em `tentarSaidaNoFimDoTurno`) segue a ser o certo.

## 27/10 · v9.481 · Fase T1, trilha A (1.ª fatia): nenhum dado fora da semente no App, e o coração do turno começa a sair do componente (`oficial`) · b9e6e20 · este commit
- **o pedido:** a primeira fatia da T1-A de `mente/plano-motor.md` (aprovado pela pessoa): a semente no App, `src/motor/aplicar.js` com prova byte a byte, e o App a chamar o motor e aplicar os efeitos num lugar só. Em paralelo, o `backend` na T1-B (`src/motor/cronista.js`, `jogar-em-node.mjs`); não toquei nesses. Nenhuma chamada paga: dev-server à parte (porta 5199, `TAVERNA_API=http://127.0.0.1:9`; o proxy respondeu `ECONNREFUSED`), e o Narrador falso por um gancho em `fetch` na página.
- **1. a semente no App (b9e6e20, v9.479):** os 37 `Math.random` do App são **zero**, e a exceção do App saiu de `EXCECOES_DO_ACASO` (`check-sem-random`; a tabela fica vazia, à espera da próxima com data e dono). Todo sorteio do turno pede `sorteDoTurno(evento)` = `dadoDo(semente do mundo, ponto, evento, n)`; a regra mora em `src/motor/sorte-do-turno.js` (pura). **O ponto é o instante que o save guarda** (dia, minuto, falas do relato): a mesma semente e as mesmas ações rolam iguais, e **recarregar não compra outro dado**; `n` separa dois pedidos do mesmo evento no mesmo instante. O d20 do teste (`OverlayDado`) era `Math.random` e é o dado do jogo: a face sai de `dadoDo(chave da rolagem, "d20")`, a animação de outro fio (o número de quadros depende do relógio da máquina e nunca pode mudar a face). Passam a sorte do turno as chamadas a iniciativa, ataque, dano, aflição, morte, espólio, loot, consumível, despojos, inimigos, fuga, oportunidade, divindade, evento divino, correio, masmorra, encontro, sonho, cicatriz, habilidade única, chefe, reação, vilão e herdeiro. A casa é semeada ao nascer o mundo, ao iniciar, ao abrir o save e a cada envio (depois da foto, que é a primeira coisa do envio).
- **decisão média — `entropia()` para a ORIGEM de semente:** duelo, noite e o id do canal (portas fechadas no beta) não são dados, são de onde nasce uma semente que ainda não existe; vêm de `crypto.randomUUID` num lugar só (`entropia`, App.jsx). Um id que se repetisse entre duas abas seria defeito. O varredor não a vê (não é `Math.random`), e por isso está escrita aqui.
- **2. `src/motor/aplicar.js` (este commit):** `aplicar(estado, resposta, ctx) → { estado, efeitos, paraOCronista, podado, msgs }`. **Saíram 316 linhas do `aplicarResposta`** (entraram 27 de fiação + 20 de `aplicarOsEfeitos`): a porta da luta (E4) e as duas travas anti-duplo, o relógio dos efeitos e das condições (eu, o grupo, os inimigos; a segunda chance T3 depois do relógio), as recargas, as mudanças declaradas com as notas do Juiz, a cobrança e o débito. **O corpo é o do App linha por linha**, com seis trocas (o ref da luta → `combate` e um efeito; as travas → `travas` no estado; `ultimoDesfecho`; a nota → `paraOCronista`; a textura → efeito; `calou` → efeito), e as mutações da resposta passaram a cair numa cópia. Os nomes locais ficaram os de lá de propósito: as suítes que guardam a ordem leem o texto.
- **3. o App chama o motor:** `aplicarResposta` monta o estado (a ficha nunca nula, a luta, as travas, o último desfecho), chama `aplicar`, e `aplicarOsEfeitos` (antes dele, um só) devolve as travas aos refs, cresce a nota (`notaComOTurno`), põe a luta no ref e na tela, a textura na mesa, e entrega ao `calou` o que o motor engoliu — cada um em `calou`. O resto do `aplicarResposta` segue com a ficha e a resposta que o motor devolve.
- **a prova byte a byte:** `teste-motor-aplicar.mjs` (22). `gerar-aplicar-dourado.mjs` lê o `aplicarResposta` de b9e6e20 do git, recorta o bloco, corre-o em Node com os módulos reais e grava `aplicar-dourado.json`: **275 respostas reais** (as narrações das sessões 8–10, com a frase e os envelopes do turno), cada uma com ficha, luta e mudanças variadas pelo índice, e a sorte da casa semeada por caso. **275/275 estados iguais ao byte** (531 KB de retrato: ficha, linhas, nota, luta, travas, textura, resposta podada). A prova morde: com outra sorte, 137 diferem. **E pegou um defeito meu no caminho:** a lista dos efeitos chamava-se `efeitos`, e o bloco do relógio declara o seu `efeitos` (o do herói) — o push caía na ficha, 86 de 275 estados saíram com a luta escrita entre as bênçãos. Chama-se `efeitosDoTurno`, e o porquê está no cabeçalho.
- **a prova no navegador, sem Narrador:** um save injetado com o jogo desmontado (Sangrando 3t, uma bênção de 2t, uma recarga de 2, 40 moedas), a frase "Abro o baú velho", o teste de Arrombamento (d20 → **16**), e o Narrador falso a dizer "você encontra 15 moedas de ouro e uma poção de cura". Depois do turno: Sangrando 2t e −3 PV (24 → 21), a bênção a 1t, a recarga a 1, **55 moedas e a Poção de Cura Pequena** na bolsa, nenhum `calou`, 1 chamada ao `/api` (a falsa). **Repeti a campanha inteira do zero:** o mesmo 16, e a ficha e o relato com a mesma impressão digital (`27d283f0…`, `b7592623…`). Os espaços de save da origem 5199 foram guardados antes e repostos depois (só as duas preferências; não havia campanha).
- **testes movidos, com o motivo escrito:** `teste-cond` (as secções T1 e T3 "ligado ao jogo" leem o motor), `teste-efeitos` (o irmão no relógio), `teste-juiz` (as notas do Juiz no motor, as do combate no App), `teste-frase-que-paga`, `teste-narrador-so-narra-e3`/`-e3-fiacao` (a cobrança), `teste-prova-viva-e4` (a porta da luta); e no 1.º commit `teste-mm6-escondido`, `teste-mm7-atiradores`, `teste-ficha-e-planta`, `teste-masmorra-na-pauta` (o argumento novo da sorte). Os endereços de `acoes-do-jogador` re-medidos pelo diff contra o HEAD, uma vez por commit, os nus à mão.
- **bastão:** tomei `.claude/app-jsx` ("oficial T1-A") às 20:57 e devolvi-o depois deste commit.
- **build/test:** build limpo nos dois; `npm test` **360/360 suítes + 23/23 varredores, A=0** na árvore (com a T1-B do backend já no HEAD). No 1.º commit a árvore estava vermelha pelo `check-formas` do backend em voo; HEAD + só os meus 11 arquivos: 357/357 + 23/23.
- **VERSAO:** v9.479 no 1.º commit; o backend subiu v9.480 entre os dois (3df46d5); este leva v9.481.
- **o que não soube / o que fica:**
  - **Até onde o `aplicar` chegou: 316 de ~1.160 linhas.** Os blocos seguintes (as dádivas, o mapa e a cidade, as missões, os sinais, o cânone, a gente, o combate, o códex, a chegada, o portão) chamam closures do App que ainda não são puras (`registrarLugar`, `abrirNevoaDaVizinhanca`, `casarDevocaoComMapa`, `ganharFe`, `invocarMilagre`, `marcarNoArco`, e o `montarSystemPrompt` com onze leitores de ref). Para saírem é preciso decidir se o prompt remontado vira efeito (`{ tipo: "remontarPrompt" }`) e mover essas closures antes. O par seguinte que vejo é **cânone + gente** (10.834–10.918 de hoje; o `aplicarResposta` tem agora 871 linhas): só módulos, mais a remontagem do prompt como efeito.
  - **A salvaguarda do fim do turno rola pela reserva da casa** (semeada a cada envio), não por `sorteDoTurno`: trocar o fio do dado no mesmo commit que move o código quebraria a prova byte a byte. É a primeira coisa a ligar na fatia seguinte (`tentarSaidaNoFimDoTurno` aceita `d20`), com um dourado novo.
  - **Os sorteadores de padrão `sorteDaCasa`** (oráculo, compasso, biblioteca, nomes do interpretador, encontros do aliado…) ficaram na reserva da casa, semeada a cada envio: deterministas pela ordem dentro do turno, não pelo evento. Explicitá-los é trabalho mecânico, sem urgência.
  - **O dado do teste com a mesma chave cai igual** — é a regra (o mesmo teste no mesmo instante é o mesmo teste); se a pessoa repetir a mesma frase sem que o relato ande, o dado repete. Não vi como acontecer no jogo (a frase entra no relato), mas não provei que não acontece.
  - **Os pedidos do backend ao App** (a fiação do `julgarOCronista` em `cronistaDoTurno`, os onze passos no bloco dele, e o `aplicarRetrato` a repor `desdeMundo`/`prometido`) não são desta fatia; ficam para a próxima do `oficial`.

## 27/10 · v9.480 · Fase T1, trilha B: o Cronista propõe, o motor decide; o jogo em Node (`backend`) · este commit
- **o pedido:** a T1-B de `mente/plano-motor.md`. Em paralelo, o `oficial` na T1-A (`App.jsx`, `src/motor/aplicar.js`, bastão dele); não toquei em nenhum dos dois. Nenhuma chamada paga.
- **estado inicial:** HEAD `b9e6e20` (v9.479, do oficial). A árvore deu `check-formas` vermelho por um literal meu (o `#ace` de `"relogios.js#aceitarProposta"` lido como cor — os `onde` passaram a `arquivo:função`); o resto verde.
- **`src/motor/cronista.js` (novo):** `julgarOCronista(estado, proposta, ctx) → { aceito, recusado, ditoPor }`, regido por `O_QUE_O_CRONISTA_PODE` (uma linha por secção do pedido do Cronista; `quem` decide: sistema, tabela, porta, cronista, dito, depois). **Não se chama `decidirOCronista`** porque o nome já é de `gatilho-do-cronista.js` (decide SE o Cronista lê), importado pelo App — dois exports homónimos obrigariam a um `as` e confundiriam a catraca, que conta leitores por nome.
  - **lugar** — só o que a régua do lugar (`lerLugarDito`) diz `novo`/`volta`, e **nunca outra cidade do mapa** (a viagem fantasma: mudar de cidade é viagem);
  - **morte** — só o combatente que o sistema já derrotou, ou com o envelope `… PELO SISTEMA` do turno; o resto sai em `recusado` com o PV, para a correção de coesão de sempre;
  - **pagamento** — `precoDaOferta` (risco 1), nunca o número da IA; `paga: 0` fica (é classificação: o combinado não é dinheiro);
  - **grupo** — só quem está no registo E o convite do sistema aceitaria (`ctx.aceitariam`, de `vereditoDoConvite`); "vou com você" na prosa não basta;
  - **fé** — `TABELA_DA_FE` (a do App, trazida para o motor, + a linha `gesto`: 20 + 0,1% da população, 1 PF) no lugar dos "fieis 10 a 500" chutados;
  - **gente nova** — entra (é o papel dele), com o gênero normalizado (`homem`→`ele`; o que não é gênero fica `""`) e o ofício; o herói não;
  - **o dito** — promessa de `frase`/`ameaca`/`volta` com `quem` (ou sem `quem`, se as palavras moram numa fala da narração) sai com `dito`; pessoa e cânone que **só aparecem dentro de falas** entram marcados, e a pessoa perde o "está aqui" quando o paradeiro era a cidade do herói. Quem diz o próprio nome ("Sou Wystan") está ali.
  - **o evento global** só fecha na última etapa.
- **`prometido.js`:** a semente guarda `dito` (campo novo, só presente quando há — o save de antes não muda, a versão de antes ignora-o), e a volta dela diz `(dito por X, não fato)` com `VOLTA_DO_DITO` ("quem o disse volta a isso… o mundo não o confirma sozinho") em vez de "a ameaça dá um passo concreto". É o fecho do eco no Livro; a estrada já o tinha (`O_ECO`, 13/10).
- **os números, contra os registos:** `teste-cronista-propoe.mjs` (75 asserções). Os registos **não guardam o JSON cru do Cronista**: a proposta foi refeita do que o registo ganhou de um turno para o outro e do lugar da pauta seguinte. **Recall do certo: 57/57 = 100%** (41 nomes de pessoa e cânone, 7 lugares da 10.ª, 3 missões, 6 `falou_com`), medido pelo efeito (o que a régua de ontem movia, a de hoje move). **13 dos 41 nomes entram marcados como palavra** — "o Rei Emprestado acordou, dizem", a Ordem dos Esquecidos, a Fiandeira, o Tomas que a criada cita: é o rumor que virava cânone; o número é catraca. Não reconstruíveis, ditos e fora da conta: 23 lugares da 8.ª/9.ª e as 33 promessas (sem texto). **Os erros documentados: 10/10 recusados ou marcados (antes 0/10)** — os quatro do eco da 11.ª (M8, M9, M11, M44, das citações de `mm11-sessao-11.md`), a Clarissa do Posto Velho, o pagamento (o "ganha quarenta e cinco" de s10/50 → 60 da tabela), a viagem fantasma, o herói como NPC (a Tamsin da 6.ª), o grupo pela prosa, os 500 fiéis.
- **`testes/jogar-em-node.mjs` (novo, no `npm test`):** a 10.ª sessão, M1–M20, sem React e sem rede: o save de partida em `estadoDoSave`, a frase do jogador, a resposta gravada do Narrador, e os passos puros encadeados (a escuta, o EM CENA com a lista de antes, o Cronista julgado e aplicado). Compara com a pauta que foi ao Narrador: cidade, sítio, a gente que o sistema conhece, o EM CENA sem gente de LONGE. **15 de 20 turnos jogam em Node; 0 diferem; 5 pendentes**, todos do passo antes do Mestre (três sítios pela frase — `moverParaLocal` —, a estrada, e a viagem Monte Rasa → Nova Profundo): ali o registo serve de oráculo. Os ganchos do oficial entram sozinhos quando os arquivos existirem: `src/motor/turno.js` (`turno(estado, { frase }) → { estado }`) e `src/motor/aplicar.js` (`aplicar(estado, { narrativa, mudancas }, { pedido, envelopes }) → { estado }`, a forma do `aplicar` que o oficial tem em voo); se o `aplicar` estourar, o passo avisa e o turno segue sem ele — o número de turnos jogados é a catraca (≥ 15). **Com o `aplicar` em voo na árvore, os 20 turnos já passam por ele**, mas só depois de a ficha do save de partida trazer `inventario` e `habilidades`: sem as listas, `regras-jogo.js#aplicarMudancas` estoura (`[...pers.habilidades]`) — para o oficial, um `= []` que o App nunca precisou porque a ficha dele as tem sempre. Determinista: duas partidas, o mesmo log.
- **o achado do T0-A (desdeMundo e prometido andam num turno desfeito):** **a causa está no App.** `aplicarRetrato` não repõe `desdeMundo` nem `prometido` (as outras 36 linhas da tabela são repostas — medido). No módulo puro, o que faltava era a verdade da tabela: as duas linhas entram em `O_QUE_O_TURNO_ANDA` (guardado.js), e `teste-mm15-ligacao` ganha a catraca "todo campo que o turno anda é reposto por `aplicarRetrato`", com os dois numa **lista de espera datada** (credor: o oficial) que tem de esvaziar quando ele os repuser.
- **a catraca da ligação desce a `src/motor/`:** `teste-ligacao` só lia a raiz de `src/`; a secção 2b mede módulos e exports de `src/motor/` com a mesma régua, e `cronista.js` está na ESPERA DO MOTOR (credor: o oficial, `cronistaDoTurno`). Atenção para o oficial: `aplicar.js` passa a ser medido também (precisa de ser importado por alguém em `src/` e de ter leitor em cada export).
- **build/test:** `npm run build` limpo na árvore. **A árvore inteira está vermelha pela T1-A em voo** (`teste-motor-aplicar`, `teste-narrador-so-narra-e3`/`-e3-fiacao`, `teste-prova-viva-e4`, `check-acoes-do-jogador` — arquivos do oficial, não commitados); provado com `mente/so-o-meu.sh` — HEAD `b9e6e20` + só os meus nove arquivos: **359/359 suítes + 23/23 varredores, `A=0`**.
- **decisões médias, com o motivo:** (1) **a linha `gesto` da fé** (20 + 0,1% da população, 1 PF) troca o chute da IA — é número novo numa tabela, e a escolha é conservadora (a IA dava até 500); (2) **o juízo falha fechado**: se `julgarOCronista` estourar, o App não aplica nada de estado nesse turno (a IA nunca decide sozinha); (3) **a pessoa citada numa fala guarda o paradeiro que a fala deu**, e só perde o "está aqui" — apagar todo o paradeiro custaria o Tomas da Ferraria do Leste.
- **A FIAÇÃO PARA O APP (o oficial, na fatia seguinte), em `cronistaDoTurno`:**
  1. `import { julgarOCronista } from "./motor/cronista.js";` — e sai da ESPERA DO MOTOR em `teste-ligacao` (secção 2b).
  2. Logo depois de `const r = gatilho.corre ? parseObjetoTolerante(txt) : {};` e da guarda de `r` nulo: `let juizo = null; try { const aceitariam = ((r.grupo && r.grupo.entraram) || []).filter((n) => { try { return vereditoDoConvite(n).resposta === "aceita"; } catch { return false; } }); juizo = julgarOCronista({ ...retratoDoJogo(), personagem: pers || personagemRef.current || personagem, combate: combateRef.current, masmorra: masmorraRef.current, lugar: lugarRef.current, cidadeAtual: cidadeAtualRef.current, mapa: mapaRef.current, npcs: npcsRef.current, divindade: divindadeRef.current, eventos: eventosRef.current, espinha: espinhaRef.current }, r, { narrativa, pedido: ultimoPedidoRef.current, envelopes: (doTurno && doTurno.envelopes) || [], aceitariam }); } catch (e) { calou("o juízo do Cronista", e); } const ac = juizo ? juizo.aceito : {};` — **e toda secção lê `ac.X` em vez de `r.X`**.
  3. promessas: `pagarSementes(prometidoRef.current, ac.promessas_pagas)` e `guardarSementes(pg, ac.promessas)`.
  4. lugar: `if (typeof ac.lugar === "string") registrarLugar(ac.lugar, "cronista")`; e, para a nota de recusa de sempre, `if (juizo && juizo.recusado.some((x) => x.secao === "lugar" && x.acao === "recusa")) registrarLugar(r.lugar, "cronista")`.
  5. missão: `const prop = ac.missao_oferecida;` e `cartazDaProposta(prop, …)` **sem** o `precoNoTexto(narrativa)` (a paga já é a da tabela).
  6. relógio, teste, `falou_com`, cânone, pessoas: `ac.relogio_novo`, `ac.teste_sugerido`, `ac.falou_com`, `ac.canone`, `ac.pessoas`.
  7. evento global: `ac.missoes && ac.missoes.global_encerrado === true`.
  8. fé: a secção inteira passa a `for (const g of ac.fe || []) msgs.push(...ganharFe(g.fieis, g.pf, String(g.motivo || g.rotulo).slice(0, 80), g.local || ""))`, com a nota `[FÉ — REGISTRO DO SISTEMA]` quando `g.de === "acontecimento"`; e `TABELA_FE`, `populacaoDe`, `fePorAcontecimento` saem do App (a tabela mora em `motor/cronista.js#TABELA_DA_FE`).
  9. combate: o laço da correção de coesão passa a `juizo.recusado.filter((x) => x.secao === "morte" && x.porque === "vivo")`, com `x.o` (o nome) e `x.vida`.
  10. grupo: `ac.grupo ? ac.grupo.entraram : []`.
  11. e em `aplicarRetrato`: `desdeMundoRef.current = Number.isFinite(r.desdeMundo) ? r.desdeMundo : desdeMundoRef.current;` e `prometidoRef.current = r.prometido !== undefined ? garantirPrometido(r.prometido) : prometidoRef.current;` — e as duas entradas saem de `ESPERAM_O_APLICAR_RETRATO` (`teste-mm15-ligacao`).
  Com a fiação, `teste-cronista-propoe` deve ganhar a secção "a fiação" por texto, e o `jogar-em-node` troca o `aplicarOCronista` dele pelo do motor quando o Cronista sair do App (Fase 2).
- **o que fica:** o `formatarCanone` e a `procura` ainda não leem o `dito` (o Narrador vê o cânone marcado só quando a fiação passar a marca ao texto); os registos futuros deviam guardar o JSON cru do Cronista (sem ele a prova reconstrói); o `turno` do oficial é o que leva o "jogar em Node" de 15 a 20.

---

## 27/10 · v9.478 · Fase T0, trilha A: o estado do jogo, um objeto só, e o save com versão (`oficial`) · 9089c41 · 90c4f0d · este commit
- **o pedido:** a T0-A de `mente/plano-motor.md` (aprovada pela pessoa em 27/10, save versionado incluído): o estado vira um objeto, o save ganha esquema com versão, os refs passam a ler do estado um grupo por commit. Ao mesmo tempo, o `backend` na T0-B (a semente nos módulos), só em `src/*.js` e testes. Nenhuma chamada paga: dev-server à parte (porta 5199, `TAVERNA_API=http://127.0.0.1:9`; o proxy respondeu `ECONNREFUSED`).
- **o estado v2 (`src/estado.js`):** o mesmo objeto plano do save v1, mais `versao: 2`. Os 99 campos de `retratoDoJogo` numa tabela (`CAMPOS`: campo, grupo, tipo, padrão), em doze grupos (campanha, ficha, relógio, cena, mundo, economia, história, coração, memória, códex, modos, bastidor). **Decisão: plano, não aninhado** — um save v2 aninhado abriria vazio na versão de ontem; plano, um revert continua a abrir o save da pessoa (o `versao` a mais é ignorado). A sala e o arquivo exportado não mudam de forma.
- **como o v1 é lido:** `estadoDoSave` migra só na leitura — campo que existe com o tipo certo passa intacto, pela mesma referência; o que falta ganha o padrão; lixo vira o padrão; o que a tabela não conhece atravessa. **O padrão é quase sempre `null`, e isso é medida:** o leitor do App usa a AUSÊNCIA como sinal (`missoes` ausente migra as quests antigas; `abasAbertas` ausente abre as abas a quem já jogava; `nevoaVersao` ausente revela o mapa). Um `[]` apagaria essas migrações. A suíte prova que `null` = ausente para cada leitor: nenhum lê por `=== undefined`/`in`; os campos que `aplicarRetrato` lê por `!== undefined` são todos repostos depois em `continuar`; e as 41 garantias dos módulos que `continuar` chama devolvem o mesmo para os dois. O tipo de cada campo é o que o leitor exige (por isso trocar lixo pelo padrão é o que o leitor já faria).
- **no App:** o retrato abre com `versao: ESTADO_VERSAO`; o disco recebe `saveDoEstado(d)` na mesma chave (`taverna_save_anterior` segue a rede de sempre); toda leitura (abertura, importar, desfazer) passa por `lerSave` = `estadoDoSave` + `migrarPersonagem`, fora do componente; a sala tira a `versao` antes de publicar (o protocolo não cresce); o carimbo do backup grava v2.
- **os grupos que já leem do estado:** nasce `estadoRef` (o estado v2, vazio) no topo de `Taverna()` e, fora dele, `useVistaDoEstado(estadoRef, campo, inicial)` — um objeto com a cara de `useRef` cujo `.current` mora no estado (`vistaDoCampo`, substitui, nunca muta). **Ficha** (`personagemRef`, commit 2) e **relógio** (`diaRef`, `minutoRef`, `acordouAbsRef`, `diaLutaRef`, commit 3). Os outros dez grupos seguem nos seus refs; a fotografia completa continua a ser `retratoDoJogo()`.
- **a prova com saves antigos:** `teste-estado.mjs` (novo, 103 asserções): três saves v1 — de antes do mapa, da v9.1xx com um campo desconhecido, e um de hoje com a ficha, o mapa, a espinha e a gente reais da 9.ª sessão — viram v2 e voltam sem mudar o JSON de nenhum campo; o v2 regravado sai byte a byte; `null`, string, número, lista não estouram. **Vivo, no navegador:** injetei um v1 de 16 campos (a ficha e o mapa da 9.ª, uma quest antiga, `acordouAbs = 0`, sem missões/abas/névoa) com o jogo desmontado, abri, salvei: o gravado é v2 com 100 campos, **nenhum dos 16 perdido**; os que mudaram são as migrações do próprio App, e elas correram — a quest virou missão, as 9 abas abriram, as 4 cidades revelaram, o `acordouAbs` foi corrigido (v9.5). Reabri o v2 e regravei: os mesmos campos, na mesma ordem, só o `salvoEm` mudou. Um turno com a ligação morta foi desfeito ("nada do que você fez chegou a acontecer") e o relógio voltou às 10h (610).
- **testes movidos, com o motivo escrito:** `teste-arquivo` (a migração da ficha mudou-se para `lerSave`), `teste-sala`, `teste-mm10-crime`, `teste-mm8e-promocao` (a desestruturação da sala tira também `versao`; o `return` do retrato abre com ela), `teste-porta-de-entrada` (o carimbo grava `saveDoEstado(sv2)`), `teste-mm15-ligacao` (o ref nasce por `useRef` ou pela vista). Os endereços de X1 re-medidos pelo diff, uma vez por commit, os nus à mão.
- **bastão:** tomei `.claude/app-jsx` ("oficial T0-A") às 19:40 e devolvi-o depois do commit 3.
- **build/test:** build limpo nos três. **A árvore está vermelha pela T0-B em voo** (21 suítes do backend, a meio da conversão do `Math.random`); provado com `mente/so-o-meu.sh` — HEAD + só os meus arquivos: 355/355 + 16/16, `A=0`, nos três commits.
- **VERSAO:** o backend tinha `v9.476` na árvore; subi para `v9.477` (o maior) como última edição — e o commit da T0-B (`ccc6e30`), que entrou entre a minha prova e o meu commit, levou o `constantes.js` com o meu `v9.477` dentro. Para este commit ter número próprio, `v9.478`. Nada a desfazer: a casa só pede que fique o maior.
- **o que não soube / o que fica:**
  - **Campo que nenhuma versão de hoje grava continua a cair no primeiro save**, como já caía: `estado.js` preserva-o, mas o `salvar` grava o retrato dos refs. Não juntei os desconhecidos ao save de propósito — um campo aposentado que o leitor ainda lê (uma entrada de migração) ressuscitaria a cada load. "Nada se perde nunca" seria uma decisão sobre zumbis, não um conserto.
  - **A ficha no estado é a ficha VIVA (`personagemRef`), e o save grava a do estado React (`personagem`)** — como sempre (a corrida que a v9.41 documenta). Os dois podem divergir num instante; unificá-los é da T1, quando o motor for quem escreve.
  - **Achado de passagem, não meu:** um turno cuja ligação cai é desfeito, mas `desdeMundo` e `prometido` andam assim mesmo (não estão em `O_QUE_O_TURNO_ANDA` nem em `SOBREVIVEM_AO_DESFEITO`). Um turno que não houve conta para a cadência do mundo. Para a pauta do sistema.
  - **`heroiDoSave`** (o Duelo, porta fechada no beta) ainda lê o save cru; ficou, porque o modo dorme.
  - **Os pedidos da T0-B ao App** (`semearACasa(sementeMundo())` ao abrir, os 30 sorteios do App) não são deste passo; ficam para o próximo do `oficial`.

## 27/10 · v9.476 · Fase T0, trilha B: nenhum dado fora da semente, as varreduras no corredor, o +2 de defesa vale 2 (`backend`) · este commit
- **o pedido:** a trilha B da Fase 0 do plano do motor (`mente/plano-motor.md`, aprovado pela pessoa em 27/10). Em paralelo, o `oficial` na trilha A (estado único, `App.jsx`, `estado.js`, `guardado.js`, `regras-jogo.js`); não toquei em nenhum deles.
- **estado inicial:** 354/354 suítes, 15/16 varredores (o vermelho era `check-imports` sobre `estado.js`, da trilha A; ao fim já estava verde).
- **a semente em todo sorteio:** os 171 `Math.random` de código de 53 módulos (167 por troca mecânica em 51, mais as trocas do global em `arena` e `ritmo-da-reacao` e o dado de `reacoes`) (os 103 diretos e os 61 de valor padrão da auditoria, mais os que ela não contou) passaram à **sorte da casa** (`semente.js`): `dadoDo(semente, ...partes)` = `rng(hashSemente("s|turno|evento"))`, o padrão; `sorteDaCasa`, a reserva que a função usa quando ninguém lhe deu sorte — um gerador semeado, determinista pela ordem, NÃO o `Math.random`; `semearACasa`, `comSorte`, `trocarACasa`, `sorteDe`. 40 funções que sorteavam sem porta ganharam o parâmetro `sorte` (opcional, no fim ou no objeto de opções; o corpo corre dentro de `comSorte`, que sem sorte só chama o corpo — assinatura compatível). A arena e a régua deixaram de trocar o `Math.random` global: trocam a casa, e rolam os MESMOS dados. `escolherReacao` recebeu `sorte`, e o `ritmo-da-reacao` deixou de trocar o global (o dia que o comentário dele esperava).
- **decisão média — a reserva em vez de uma semente fixa por chamada:** sem sorte, cada função deriva da corrente da casa, que avança. Uma semente fixa por função daria o mesmo deus, o mesmo nome e o mesmo saque a cada chamada sem semente do App — regressão para quem joga. O preço, escrito: até o `oficial` chamar `semearACasa(sementeMundo())`, duas campanhas novas numa página acabada de abrir começam com a mesma sequência nos sorteios sem semente. É o primeiro item da lista dele.
- **o varredor `check-sem-random.mjs`:** lê `src/` inteiro (subpastas incluídas), apaga comentário e texto, e falha num `Math.random` por ponto ou colchete. Exceção única, com data e dono: `App.jsx` (37 ocorrências em 34 linhas; teto 37) até a Fase T1. O teto só desce; a exceção que zera fica vermelha até sair.
- **os testes de determinismo:** `teste-semente-em-tudo.mjs` (77 asserções): as peças de `semente.js`, e 32 funções de 19 módulos (combate, masmorras, encontros, divindades, nomes, loot, correio, decretos, fama, reino, unicas, regras, danos, pocoes, geradores, calendario, reacoes, vilao, companheiros) — a mesma semente dá o mesmo resultado, e 20 sementes não dão uma resposta só. Toda a suíte corre com o `Math.random` global a estourar: zero chamadas.
- **as suítes que trocavam o `Math.random`** (24 arquivos) passaram a trocar a casa (`trocarACasa`), 1 por 1 — a mesma sequência de dados, logo os mesmos números. Asserções que mudaram de texto, cada uma com o motivo escrito: `teste-disputa` (o padrão do parâmetro chama-se `sorteDaCasa`), `teste-juiz` (a assinatura do espólio ganhou `sorte`), `teste-regua` §3 e `teste-recalculo`/`teste-ritmo`/`teste-trava` (o rolador reposto é o da casa).
- **as catracas de equilíbrio NÃO mexeram com a semente:** MM6, MM7, MM9, a régua, a arena e a sonda do furtivo deram os números de antes — a troca é de um para um. Só as sondas tinham dois `Math.random()` próprios dentro da trava (`sonda-do-furtivo`, `sonda-sem-espada`), e passaram à casa.
- **as varreduras no `npm test`:** `rodar-tudo.mjs` passa a apanhar `varredura-*.mjs` com os `check-*`. As seis são relatórios e saem 0; o corredor cobra que corram. 23/23.
- **o +2 de defesa:** `modificadoresDeCondicao` devolve `defesa`, e ela soma em `ca` fora do ternário (o abrigo fica de pé quando o golpe fura a armadura, o argumento de F2). O veredito da fuga lê a mesma defesa (`defesaDaFuga`). O preço é o que F2 escreveu e a régua mediu ao byte: Uma Vida (molde histórico) 52,1% → **54,7%** de vitória, PV do grupo 25,88 → 27,57, quedas 1,790 → 1,720, `duro` 8,8% → 10,8%. As três asserções de `teste-regua` e as duas de `teste-protege` §5 que esperavam o zero foram movidas com o motivo escrito; nasceram o "furar a armadura não apaga o abrigo" e "a chance da fuga cai protegida". O `motivo` de "Muralha" em `AGUARDAM` deixou de dizer que a moeda vale zero.
- **o que ficou (para o `oficial`, trilha A):** (1) `semearACasa(sementeMundo())` ao abrir e ao nascer o mundo; (2) passar `dadoDo(sementeMundo(), turno, "<evento>")` nas chamadas do App aos 30 sorteadores — lista na resposta do backend de 27/10 (`gerarEspolios`, `rolarIniciativa`, `turnoDosInimigos`, `rolarAflicao`, `gerarLoot`, `gerarMasmorra`, `gerarDivindade`, `processarDiaCorreio`…); (3) os 34 `Math.random` do próprio App. Fora da trilha: as 4 entradas de `AGUARDAM` com a dívida da moeda — a moeda paga, falta medir se saem (a "Muralha" promete 2 turnos e `protegido` dá 4).
- **prova:** `npm run build` limpo; `npm test` 356/356 suítes, 23/23 varredores, A=0; `so-o-meu` sobre os meus 90 caminhos.

## 20/10 · v9.475 · o caminho A do cache (o tempo de vida ao ritmo de quem joga) e a mesa da 12.ª: a irmã que não era, a cidade que não está à mesa (`backend`) · este commit
- **o pedido:** a decisão da pessoa em `mente/pauta.md` ("A foto do estado fica para perto de janeiro"): só o ajuste sem risco do cache — QUANDO se grava, nunca o que o Narrador lê — e a qualidade da 12.ª. Nenhum outro agente na árvore. Nenhuma chamada paga.
- **o caminho A, medido antes de mexer:** um simulador com a `janelaAncorada` e o `decidirOCache` reais e os preços de `custo.js` (63 turnos, 5 sementes, dois tamanhos de narração, cinco ritmos), contra a cota inferior — programação dinâmica sobre todas as escritas possíveis, sabendo o futuro. **A régua do rabo e a guarda do corte já estão no ótimo:** a 0–1,5% dele até 2,5 min por turno; 3.000, 4.500, 9.000, "nunca reescrever" e a regra do ponto de equilíbrio (rabo × turnos até ao corte ≥ prefixo) não batem a de hoje na média (−0,5% a +1,7% conforme a cena). **A régua fica em 6.000.** A queda do cache de 74% a 55% dentro do ciclo é a mensagem do turno (~4,7 mil tokens, nunca cacheável) mais o rabo a crescer ~300 por turno: reescrever a meio do ciclo para a subir custa mais do que poupa (rabo 3.000: cache 72%, +4% na conta).
- **o que sobrava era o relógio (decisão média):** o cache de 30 min morria a meio do ciclo de quem joga devagar (12 turnos a 3,5 min = 42 min), e o prefixo inteiro voltava a ser escrito a preço cheio. Agora `decidirOCache` devolve `ttl` no `criar`: os turnos até ao corte × o ritmo medido pela ficha que veio (os turnos contam-se das mensagens; prefixo que não confere = um salto da âncora) × `folgaDoRitmo` 1,25, entre `ttlSegundos` (1.800, o de sempre) e `ttlMaxSegundos` (3.600). `api/narrador.js` cria o cache com esse `ttl` e grava o `expira` dele. **Medido, US$ do Narrador por sessão:** 0,7 e 1,7 min/turno idêntico (as mesmas decisões, turno a turno); 2,5 min +0,3% (a guarda do último cache); **3,5 min 0,516 → 0,493 (−4,5%, 10 → 6 escritas); 5 min 0,533 → 0,511 (−4,3%)**; narração longa −1,6% e −2,5%. O pedido ao Google é byte a byte o mesmo.
- **e um erro de conta, de passagem:** a guarda do cache trocado cobrava-se até ao turno de agora, e um cache que expirou (o Google apaga-o) cobrava as horas todas de quem saiu da mesa; agora cobra-se até ao `expira`.
- **a. "a sua irmã" para Aelith:** o pedido da 12.ª não foi gravado; a casa varrida tem uma só fonte de "irmã" para quem anda com o herói — a ligação "sangue" do companheiro de antes —, e a ficha do grupo dizia-a companheira de armas. Invenção pela lacuna: a ficha diz o que ela é e cala o que ela não é. **Conserto:** nas PESSOAS CONHECIDAS, quem anda no grupo leva a frase fechada "não é parente do herói" (`PARENTESCO_NO_GRUPO`, `npcs.js`), salvo laço de família ou relação família/cônjuge. Dentro do teto de caracteres da lista.
- **b. o registo como confete:** a causa estava no rodapé. Na cidade, `resumoCenaPrompt` punha em **PRESENTES** toda a gente que o registo diz viver em Ponte Rasa (e quem não tem paradeiro), "(vive em Ponte Rasa)", sob "QUEM ESTÁ EM CENA (do sistema — obedeça)" — o Mestre obedeceu e sentou a cidade na taverna. Na mina, a lista era aberta, e Magnus (de passagem, ou fora do teto do LONGE) desceu. **Conserto (`LUGAR_NAO_E_CENA`, `cena.js`):** PRESENTES é o grupo, quem as duas últimas narrações já puseram aqui e quem a ficha diz estar neste prédio (o App passa o `lugar`, a última opção da chamada, por âncora); a lista **fecha** ("e mais ninguém do registro"); o resto de quem vive cá vai para **NA CIDADE**, só com o nome. O pior caso desce: 693 → 526 caracteres com sessenta moradores.
- **c. a bolsa:** a 12.ª não guardou a bolsa por turno, e o registo da tabela não a tem. O que dá para conferir: a frase real do ganho ("você acha quatro lascas na terra") credita 4 com a moeda do mundo; o preço inventado do remendo não debita nada. Os dois "mal cobrados" da 10.ª (M6, a carta devolvida; M45, o "posso" de outra oração) estão fechados desde 13/10 (`RECUSA_DA_CENA`, `ORACAO_DO_PAGAMENTO`) e continuam a passar. **Achado e deixado:** com a moeda de sempre, o ganho por extenso ("você acha quatro moedas") não credita — o algarismo sim. Não mexi: nenhuma frase das sessões o mostrou, e o extenso abriria crédito falso em "você guarda as três moedas que restam".
- **bastão:** tomei `.claude/app-jsx` ("backend qualidade") duas vezes por minutos — pôr o `lugar` na chamada do `resumoCenaPrompt` e depois movê-lo para o fim, para não quebrar as âncoras de `teste-mm14-gente`/`teste-mm8c1-tetos` — e devolvi as duas.
- **testes:** `teste-cache-ritmo.mjs` (novo: a tabela, o ttl do ritmo, a sessão simulada antes/depois), `teste-sessao-12-mesa.mjs` (novo: a, b, c), duas asserções de servidor em `teste-cache-explicito.mjs`; `teste-mm8c1-tetos` e `teste-mm8d-figurante` com as asserções do PRESENTES movidas para a linha da cidade, com o motivo escrito. Build limpo, `npm test` 354/354 + 16/16.
- **o que ficou:** a GENTE DA CIDADE da pauta ("são estas as pessoas da cidade", curta) é a outra porta por onde nomes podem entrar como figurantes — a 13.ª deve gravar `messages[-1].content` para se ver se o confete acabou com o PRESENTES fechado.

## 20/10 · v9.474 · o Léxico vira camada de cor: o nome do sistema na ficha, a moeda com um nome só (`frontend`) · este commit
- **o pedido:** a decisão da pessoa em `mente/pauta.md` ("O Léxico vira camada de cor"): *o nome do sistema é universal, o nome do mundo é único.* Os casos: o humano "Filho da Palha" na ficha; a moeda que mudou de nome numa campanha (9.ª: "moedas"/"marcos"; 12.ª: "cobres" na abertura, "lascas" depois). Nenhum outro agente na árvore. Nenhuma chamada paga.
- **bastão:** tomei `.claude/app-jsx` ("frontend léxico") às 10:30 para quatro fiações por âncora (`.cjs`) e devolvi ao fechar o commit.
- **o nome do sistema ganha** — `lexico.js` ganha `racaNaFicha`/`profissaoNaFicha` (o nome do catálogo; o do mundo entre parênteses só num mundo de gênero próprio) e `generoProprio(mundo)` (os três gêneros futuristas, ou a descrição que cita obra/tempo moderno — tabela de marcas, sem acento e sem caixa). Ligados: o cabeçalho e o cartão de raça da ficha (`painel-ficha.jsx`), as opções de raça e profissão da criação e do trocar caminho (`App.jsx`), a crônica, a linha do descanso do ofício (`regras-jogo.js`), e a carta de tarô (sempre o do sistema: ela não sabe o gênero). Classe, subclasse, perícias, atributos e condições já eram do catálogo — o léxico nunca os renomeou. `chamadoDaRaca`/`chamadoDaProfissao` ficam: são o **apelido**, que a prosa lê.
- **o apelido vira cor:** a FICHA DE CAMINHO do pedido dizia `Filho da Palha (o sistema chama de Humano)`; agora diz `Humano (a rua diz "Filho da Palha")` — o Narrador tem o apelido para a boca da rua, nunca no lugar do nome. No mundo de gênero próprio: `Caçador Desperto (Humano)`.
- **a moeda tem um nome só:** `nomeDaMoeda(lex)` (o do léxico, ou "moedas"). A linha estática **ECONOMIA: moeda com nome do mundo** — que mandava o Narrador batizar a moeda sem lhe dizer o nome, a causa provável de "marcos" e "cobres" — passa a **ECONOMIA: a moeda é «X», nenhuma outra**, e "Começa com N X". O mesmo nome vai à rua, ao PERGUNTOU, ao balcão e à abertura (o `moedaDoMundo` da App e a bolsa passam por `nomeDaMoeda`). O léxico que **chega tarde** (`soOVocabulario`) já não troca a moeda da nascença. A cobrança continua a aceitar a palavra do jogador (não tocada). Na tela: o glifo ◉ e o número, como era.
- **mundos de gênero próprio:** a decisão de quais são (média, com o motivo): os `GENEROS_FUTURISTAS` da casa + marcas na descrição (obra citada: "inspirado em", "universo de", Solo Leveling, anime/mangá/manhwa/isekai; tempo moderno ou futuro: moderno, metrô, nave, planeta…). Steampunk e horror cósmico ficam fantasia salvo a descrição dizer outra coisa — a pauta só nomeia sci-fi, cyberpunk e obra. Classe **não** ganha nome do mundo: o léxico não a gera (o porquê está no comentário v9.195 de `garantirLexico`).
- **saves antigos:** nada se reescreve. O léxico salvo guarda os apelidos; muda a leitura — um save com "Filho da Palha" mostra "Humano". Nenhum campo novo no save.
- **o pedido não cresceu:** medido contra HEAD (cópia por `git archive`), pedido fixo de uma cena de cidade: sem léxico 41.330 → 41.328; com léxico (raças e moeda renomeadas) 42.074 → 42.048; cyberpunk 42.066 → 42.028. A moeda saiu do "COMO AS COISAS SE CHAMAM" do bloco do léxico (a ECONOMIA a diz uma vez).
- **testes:** `teste-lexico-cor.mjs` novo (30): 60 mundos de fantasia com as dez raças, as doze profissões e a moeda renomeadas — 600/600 raças e profissões com o nome do sistema na ficha e no pedido, o apelido só como "a rua diz"; a moeda com um nome só nas quatro linhas (pedido, rua, PERGUNTOU, abertura), nenhuma das outras 19 palavras de moeda; o léxico tardio não a troca; os três gêneros futuristas e a descrição de obra com parênteses; o save antigo "Filho da Palha"/"escamas" mostra Humano e escamas. Asserção movida, com o motivo ao lado: `teste-frase-que-paga` (a bolsa lê `nomeDaMoeda`). A fiação da App ficou com o mesmo número de linhas, de propósito: os 96 endereços de `check-acoes-do-jogador` não se mexem.
- **prova viva, sem Narrador:** dev-server à parte (porta 5199, `TAVERNA_API=http://127.0.0.1:9`). O localStorage dessa origem estava **vazio** antes (anotado no scratchpad); injetei `taverna_save_v1` com o jogo desmontado (numa página da mesma origem que não monta o jogo), com o humano "Filho da Palha" e a moeda "escamas". A ficha: `HUMANO · GUERREIRO · CAMPEÃO` e o cartão `RAÇA Humano`; nenhum "Palha" nem "escamas" na tela; a bolsa é o glifo ◉ (`aria-label="moedas"`) e 37. Restauro, de novo com o jogo desmontado: apaguei as três chaves que nasceram (`taverna_save_v1` e as duas `taverna_cfg_*` que o jogo criou ao montar) e a leitura confirmou 0 chaves. As partidas da pessoa (porta 5173) não foram tocadas. *Nota para os próximos briefings:* o espaço de Uma Vida é `taverna_save_v1`, não `taverna_v1`.
- **para quem joga:** a ficha volta a dizer Humano, Elfo, Ferreiro — os nomes que qualquer jogador de mesa conhece —, e a rua continua a chamar-lhe o que o mundo chama; a moeda é uma palavra só, do primeiro turno ao último.
- **o que ficou:** o pedido do Léxico (a criação) ainda pede as raças como "NOME DE POVO"; podia passar a pedir o apelido de rua — é a voz da criação, deixei como está. A carta de tarô não põe o nome do mundo entre parênteses em mundos de gênero próprio (não conhece o mundo).
---

## 19/10 · v9.473 · os consertos da 12.ª sessão: o Léxico sem a rede do Narrador, o cache sem escrita dupla, a viagem que não houve, a pergunta com resposta (`backend`) · este commit
- **o pedido:** os oito consertos de `mente/mm11-sessao-12.md` (a tabela por chamada no scratchpad, `s12/registo-s12.csv`), com o turno barato e sem perder a mesa. Nenhum outro agente na árvore. Nenhuma chamada paga: tudo provado em Node, o servidor com a rede de mentira de `teste-cache-explicito`.
- **bastão:** tomei `.claude/app-jsx` ("backend s12") às 20:31 para sete fiações por âncora (`.cjs` da casa) e devolvi ao acabá-las, antes das suítes.
- **1. o Léxico morria por MAX_TOKENS** — confirmado: `maxOutputTokens: Math.min(teto, (!leve && 1200) || teto)` dava 1200 a toda tarefa não-leve, e o Léxico pensa ~5 mil. `REDE_DE_SAIDA` passa a ser por tarefa (`redeDaTarefa`): só o Narrador de turno tem rede; o App manda `tarefa: "lexico"`. E a tentativa que falha volta em `perdidos` (com resposta ou no 502), que o App soma ao `custo` — a chamada falhada da 12.ª estava fora da conta.
- **2. os finais em "…" (22%) não são a rede:** a maior saída de turno foi 453 tokens, a abertura 778, contra 1200 — nunca cortou. São o fecho `silencio` ("deixa uma fala a meio, e acaba nela"), que o sistema pede: é desenho, não defeito, e **ficou**. Para a 13.ª poder separar as duas coisas, a resposta que a rede aparar chega com `uso.aparado`, e `custo.js` conta `aparadas` (campo novo, só quando há; o /custo diz quantas).
- **3. a escrita dupla do cache** — `decidirOCache` escrevia na janela de 47 (o rabo passou da régua) e outra vez na de 25 (a âncora saltou). `corteVemAi` (o passo da janela, `CACHE_EXPLICITO.mensagensPorTurno: 2`, é tabela): quando a janela do turno seguinte já passa do teto, não se escreve — usa-se o cache que há, e o novo nasce do lado de lá do corte. A 12.ª reconstruída na suíte: escritas em 3 e 25 mensagens, nunca duas seguidas (HEAD: 3, 47 e 25). Menos ~US$ 0,016 por ciclo de janela.
- **4. a viagem fantasma** — a frase da sessão ("volto com Aelith a Ponte Rasa, direto à Ferradura") **parte** à boca da masmorra, e "voltamos para a cidade" também: as regras de partida não apertaram. A resposta seguinte abre na sala de ENTRADA ("a lama da entrada da Cova… Não há balcão aqui"), logo a heroína estava DENTRO da masmorra, e de lá nada parte por frase (`podeAbrirModulo`) — o que está certo: sai-se pela boca, com o veredito no botão. O buraco era o silêncio: nenhum veto dizia ao Mestre que a estrada não abriu. `vetoDaViagemQueNaoHouve` (rastro.js, `VIAGEM_QUE_NAO_HOUVE`): com a porta fechada (masmorra, luta, acampamento), a frase que pede outra cidade do mapa, ou a volta que diz a cidade, leva ao NÃO PODE o destino, a razão e onde a cena continua; "volto pelo corredor" lá dentro não veta. De passagem: "não volto a Ponte Rasa" abria a volta (a negação só se procurava antes de verbo de PARTIDA, e "volto" não é) — `partidaNegada` lê a volta.
- **5. as perguntas sem resposta** — duas eram do sistema: (a) "O que ronda a adega?" caía em `PERGUNTAS_DA_CIDADE.vigia` por "ronda", e a pauta respondia com a ronda da guarda — o Corpo de Paz que o Mestre disse. A patrulha agora é o NOME ("a ronda", "há ronda", "quantas rondas"); o verbo não pergunta pela guarda. (b) "Leio o pergaminho" (×2) era ato para a escuta ("reaja ao que eu fiz"), e o RUMOS.pergunta diria "quem não sabe diz que não sabe" — que é o "ninguém decifra letra aqui". `LER_E_PERGUNTAR` (escuta.js) faz da leitura uma pergunta com rumo próprio (`RUMOS.ler`: diga o que lá está). (c) o rastro T8→T9 é conduta do Mestre dentro de 2 turnos com o histórico inteiro — não achei sistema por trás, e sem a pauta gravada não se prova.
- **6. o tique "Sou Wystan"** — confirmado: Wystan é a pista da abertura (o primeiro nome do fio), o degrau da escada trazia-o a cada turno sem avanço, e `DEGRAU_EM_CENA.rumo.fato` mandava "com o nome dito". O rumo recebe `mostrado` (as duas últimas respostas do Mestre): quem lá está nomeado já está em cena — `fatoEmCena` ("não diz o nome outra vez"), e o sinal/vem-buscar não o apontam como quem chega.
- **7. a abertura** — `TAMANHO_DA_ABERTURA` (220 palavras, um parágrafo curto por parte) no próprio pedido da abertura, que não tem frase do jogador onde a etiqueta cole. O pedido não cresceu: 1.495 caracteres antes e depois (pago com redundâncias do texto).
- **8. o cuspe e a moeda** — `GESTOS_GASTOS` (tabela com a medida de cada um) gera o `VETO_DO_GESTO`, agora com "cuspe" (55% na 11.ª, 48% na 12.ª); os dois fechos de gente encurtaram ("e acaba nela") e a linha do FECHO não cresce. A rua (`precosDaRua`) e a abertura levam a moeda do Léxico (`moedaDoMundo()`): a abertura disse "cobres" a um mundo de lascas.
- **testes:** `teste-sessao-12.mjs` novo (61; em HEAD, 19 vermelhas e cai na secção 4). Asserções movidas, com o motivo ao lado: `teste-narrador-so-narra` (a rua leva a moeda), `teste-mm13-abertura` (o pedido leva a moeda), `teste-fiacao-prende` (o mundo do rumo ganhou `mostrado` depois da nêmesis). Endereços re-medidos pelo diff contra o HEAD 806ef83 (+4 em `chamarModelo`, +2 no rumo, +7 no veto): 142 em `acoes-do-jogador.mjs` e 3 em `teste-acoes-do-jogador.mjs` com prefixo, os nus à mão (`:14676→:14682`, `:14824→:14830`, `pushMsgs` 9298 → 9304 no varredor, o relógio 16445 → 16458).
- **decisões médias, com o motivo:** (1) o fecho `silencio` fica — os "…" são ele, e mexer no peso é mexer no que a 4.ª sessão mediu como devolução da palavra; (2) de dentro da masmorra a volta não sai por frase — o botão "sair" tem o preço à vista ("o resto fica para trás"), e a lei do veredito antes do clique ganha do atalho; (3) a abertura a 220, não a 140: são quatro partes, e o mundo precisa de entrar.
- **para quem joga:** a criação deixa de esperar ~57 s pela reserva (o Léxico volta ao Gemini, e com o mundo escrito pelo modelo da casa); menos uma escrita de cache por ciclo de janela; a abertura de ~519 para ≤220 palavras; o taverneiro deixa de se apresentar a cada fala; ler um papel dá o que lá está; perguntar o que ronda a adega já não traz a guarda; o Mestre deixa de narrar uma viagem que o sistema não fez.
- **o que ficou:** o registo-confete (8 nomes sem verbo — relevância de lugar, não de cena) e "sua irmã" para Aelith; a história fora do cache (57% da conta) — o caminho para os US$ 0,50 é cachear a história por blocos, e não está aqui. A 13.ª deve gravar `messages[-1].content` de cada chamada do Narrador.

## 14/10 · v9.472 · a onda 3 do custo do turno: a gente, o cânone, as masmorras e os esconderijos pela relevância (`frontend`) · este commit
- **o pedido:** a onda 3 de `mente/custo-do-turno.md` (pessoas, cânone e masmorras pelo lugar e pela missão) e o defeito que a onda 2 achou (a porta do acampamento). Nenhum outro agente na árvore. Nenhuma chamada paga: o dev-server subiu com `TAVERNA_API=http://127.0.0.1:9` e um gancho em `fetch` respondia o Narrador e o Cronista com texto falso.
- **bastão:** tomei `.claude/app-jsx` ("frontend onda 3") às 00:45 e devolvi ao fechar, com o App pronto.
- **o órgão (`src/relevancia.js`, novo, puro):** uma régua só — o que está EM JOGO entra inteiro. Em jogo é o que o turno cita pelo nome (a frase, a pauta e os envelopes, as missões, as duas últimas narrações, o arco e o fio da espinha), quem a cena tem (o grupo, quem está aqui, quem a missão pede, o núcleo, o antagonista) e o lugar (a cidade, o prédio, a masmorra). `relevanciaDoTurno` monta o retrato uma vez por turno, no App, junto dos sinais da onda 2; sem ele (fora de um turno, ou se estourar), toda função devolve o comportamento de antes, letra por letra.
- **o que passou a ir pela relevância:**
  · **PESSOAS CONHECIDAS** (`npcs.js`): quem está em jogo, e dos outros só o punhado que o herói conhece e pode citar (`RELEVANCIA.citaveis`: 4 pessoas, 700 caracteres, pela ordem da importância). O LONGE continua a dizer onde está quem saiu. "relação: neutro" calado como o "desconhecido" (`FIGURANTE.relacoesSemPeso`).
  · **o CÂNONE** (`formatarCanone` com `relevancia`): entra por uma de quatro portas — o turno cita, é do lugar, é pessoa em jogo, é o que o herói carrega. O antagonista do fio nunca sai. O Cronista e o Arquivista continuam a ler o cânone inteiro.
  · **a GENTE DA CIDADE** (`resumoDaqui`): quem as PESSOAS CONHECIDAS já dizem vai só com o que a linha do registo ainda não diz (cada fato uma vez no pedido); quem está em jogo (citado, no prédio onde estou, o prédio ou o ofício dele na frase/pauta) vai inteiro; o resto vai **curto** — nome, povo, ofício e traço —, e continua lá como gente da cidade que o Narrador pode chamar à cena.
  · **as MASMORRAS da região**, quando a porta da onda 2 abre: as citadas e as 3 mais perto pelas horas da ficha, com "+N mais longe".
  · **os ESCONDERIJOS**: a régua de onde se acha saiu de dentro do `achavelAqui` (`procuravelAqui`) e é lida também pelo rodapé — o Narrador sabe do segredo do prédio onde o herói está e do baú do ermo fora dos muros, e não do de outro prédio. Na 9.ª (s9 8) o herói, na Ferraria do Leste, perguntou "o que está escondido aqui?" e o Tomas contou o livro-caixa d'O Malho da Ponte Torta: segredo de outro prédio revelado sem teste, e o fio dos quinze turnos seguintes nasceu dele.
  · **a GENTE POR CONHECER** (`genteParaPovoarAqui`): só a daqui (ou a que o turno cita), sem repetir a gente da cidade; `elencoParaPovoar` passa a dizer a cidade de cada um.
  · **o bloco A GENTE EM CENA** (porta `gente`, `genteNaPauta`): ensina a cumprir a linha A GENTE da pauta, e ia em 98% dos turnos com a linha em 26%. Abre com a linha; sem o campo, a porta de antes. O PORTE continua a ler só se há gente.
- **o defeito de passagem:** `cenaDoPrompt` passa `acampado` — a porta do acampamento (ACAMPAMENTO_PROMPT) nunca abria.
- **decisões médias, com o motivo:** (1) a gente da cidade fora do jogo vai curta e não sai: tirá-la era convite a inventar gente (a "Clarissa do Posto Velho" da 11.ª); (2) o ofício conta pela palavra sem a vogal do gênero — a prova viva viu a raiz de seis letras ("tavern") abrir a taverneira toda vez que a pauta dizia "taverna"; (3) a GENTE EM CENA entrou nesta onda por ser bloco de pessoas, e pela régua da porta do Cobrador (a pauta é montada antes do prompt); (4) **não** cortei o O QUE EXISTE em viagem, embora 64 turnos o levassem com o herói "EM VIAGEM": nas 8.ª e 10.ª o "em viagem" estava errado (o herói na praça, a falar com a Petra, com a jornada presa), e era esse bloco que segurava a cena; (5) a BANCAS ABERTAS AQUI e o DESCANSO (543 car. em 92% dos turnos) são portas da onda 2, não relevância de lista — ficam para quem pegar a próxima.
- **a fiação no App, sem somar linha:** os imports, os refs (`relevanciaRef`, `genteNaPautaRef`, `genteDaquiRef`, fora do save), a cena, a relevância (na linha dos sinais, cada órgão no seu try), as PESSOAS do turno montadas uma vez antes do rodapé (`npcsDoTurno`, lidas pelo system e pelo O QUE EXISTE), o O QUE EXISTE e o system — tudo em linhas que já existiam. O App ficou com as mesmas 28.953 linhas, e nenhum endereço do `check-acoes-do-jogador` andou.
- **a prova de que nada usado some (os 201 pedidos reais das 8.ª a 10.ª, as funções do módulo sobre as listas lidas do texto):** pessoas do registo citadas numa narração — 305, **0** perderam a linha. Cânone citado — 41, **1** fica sem a entrada: "Alicerces de Silêncio — lugar, em Alicerces de Silêncio" (s8 7), cuja linha não diz nada além do nome, e o nome estava na lista das masmorras do mesmo pedido; a outra que caía (o "Rei Emprestado", s10 63) entra pelo fio. Masmorras citadas com a porta aberta — 8, **1** fora da lista (s8 71, o Ossuário como cor de estrada: a Freya escolheria outra das três). Gente da cidade citada — 264: 249 inteira ou dita pelo registo, 15 só curta; destas, 10 estavam dentro de um prédio (sem a base o texto não diz de que prédio é cada um, e quem é do prédio vai inteiro) e as outras (s9 3 Halden, s9 4 Ilar, s10 20 Torvald, s10 64 Varek) são o Narrador a escolher da lista alguém que ninguém pôs em jogo: chega com nome, povo, ofício e traço, e no turno seguinte inteiro.
- **o tamanho da mensagem do turno (o modelo por bloco da onda 2, sobre o texto real):** mediana 20.872 → **18.866** caracteres, p90 24.707 → **22.523**, média 21.091 → 18.957 (−10%). Por turno, em média: a gente da cidade −706 e o que o registo já dizia −148, os esconderijos −427, a GENTE EM CENA −366, o cânone −332, a gente por conhecer −128 (só o que repetia a cidade; o filtro da cidade não se mede no texto), as masmorras −82, as pessoas −47 e o "neutro" −46. **O alvo (≤18 mil na mediana) não chegou: faltam ~870 caracteres.** Nestas sessões curtas o registo tem ~7 pessoas e o cânone ~5 entradas, e a lista quase toda está em jogo; o que esta onda compra de verdade é o teto numa campanha longa (o registo ia a 22 pessoas/3.200 caracteres, o cânone sem teto nos lugares).
- **o custo (o simulador da auditoria, `custo/sim2.cjs` com as quebras de `sim3`, 63 turnos):** US$ 0,695 → **0,667** por sessão com a saída de hoje (R$ 4,28 → 4,11); 0,682 com quatro quebras do cache. Se o 80–140 pegar: 0,570 → 0,542. **O alvo da onda (US$ 0,62) não chegou**: pedia ~6 mil caracteres a menos por turno, e o que resta de grande na mensagem não é lista de relevância — é regra de porta larga (o DESCANSO em 92%, a BANCAS em 95%, o TURNO DO MUNDO em 92%) e a pauta.
- **prova viva, sem Narrador:** campanha de teste criada; três turnos. Na rua ("Olho a praça e pergunto a Fendrel…") a mensagem foi 12.478 caracteres (14.602 no turno parecido da onda 2): da gente de Ponte Valente, 6 inteiras (a Lysa e o Yorick porque a pauta apontava A Vela do Trigo; o Aldric Mão-Torta pela missão; a Kaelith porque o MOMENTO dizia "vendedor de ervas"; o Merek e o outro Aldric pelo primeiro nome nos NOMES À MÃO e na missão — errar para mais) e 14 curtas, a GENTE EM CENA com a linha A GENTE. Dentro d'A Vela do Trigo, com "peço uma caneca à taverneira", 17.722 com o MERCADO aberto. "Que ruínas e cavernas perigosas há por perto" abriu as masmorras: 3, com "+4 mais longe". A frase do jogador por último nos três; nenhum `calou` no console. **localStorage:** a origem tinha só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens` (guardados em arquivo antes); o teste criou `taverna_save_v1`; com o jogo desmontado (aba em `/src/relevancia.js`) apaguei-a e repus as duas — conferido por leitura, igual ao de antes. `.claude/launch.json` voltou ao que era.
- **asserções movidas, com o motivo ao lado:** `teste-custo-onda2` (o import ganhou `linhasJaDitas`; a relevância vive na linha dos sinais; o objeto do `resumoDaqui` ganhou a relevância), `teste-mm8c1-tetos` e `teste-mm8c2-quem-importa` (o objeto do cânone ganhou a relevância; a gente por conhecer passa por `genteParaPovoarAqui`). Suíte nova `teste-custo-onda3.mjs` (82).
- **o que ficou:** (a) a medida real (US$ por sessão no `/custo`, nome inventado por sessão, "PROCURA acha quem existe") é da 12.ª sessão; (b) os ~870 caracteres que faltam para os 18 mil e o caminho para os US$ 0,62 são portas, não listas: o DESCANSO, a BANCAS ABERTAS AQUI e o TURNO DO MUNDO abrem em mais de 90% dos turnos; (c) o O QUE EXISTE em viagem só pode encolher depois de a jornada presa (a "viagem fantasma") estar provada morta.

## 14/10 · v9.471 · a onda 2 do custo do turno: o fixo sobe para o cache, as portas só abrem com a coisa em jogo, sem duplicados (`frontend`) · este commit
- **o pedido:** a onda 2 de `mente/custo-do-turno.md` (desperdícios 3, 4, 6 e 7). Nenhum outro agente na árvore. Nenhuma chamada paga: o dev-server subiu com `TAVERNA_API=http://127.0.0.1:9` e um gancho em `fetch` respondia o Narrador e o Cronista com texto falso.
- **bastão:** tomei `.claude/app-jsx` ("frontend onda 2") no começo e devolvi ao fechar, com o App pronto.
- **1. o que subiu para o system (em cache), com a frequência de mudança medida** em 201 pedidos reais das 8.ª a 10.ª sessões (pares de turnos seguidos): a ficha do herói — nome, COMO SE CHAMA, atributos, PV/PM máx, a FICHA DE CAMINHO e o PATAMAR (0–1%); as regras que só mudam com o nível e o App colava ao título — ECONOMIA DE AÇÃO, AÇÕES BÔNUS, AÇÃO DE TURNO, PROGRESSÃO e ESCALAS (0%); as DUAS PROIBIÇÕES do arco (0%, saíram de `resumoHistoria` para `PROIBICOES_DO_ARCO`); do rodapé, a FORMA DESTE MUNDO, o treino das PERÍCIAS e a PROFISSÃO (0%); da zona, as regras de MISSÕES e do mural e QUEM ANDA COMIGO (a porta delas virou em ~1% dos pares). ~6,6 mil caracteres por turno. `tituloInfo` passou a aceitar `{ vivo, fixo }`.
- **o que NÃO subiu, e porquê (decisão média):** o título, os suprimentos e os vínculos (mudam com o jogo); os PASSIVOS (somam bênção e equipamento — `resumoPericiasPrompt` ganhou `parte`), o TRAÇO (diz o que já foi gasto), o DESLOCAMENTO e o EQUIPAMENTO (mudam com condição e item: o ganho de centésimos não paga uma reescrita do cache); o ESTADO ÉPICO (conta o XP do nível 20 a cada vitória: saiu de `infoRegras` para `infoEpico`, no vivo). **E o Inviolável ficou no rodapé**, contra a sugestão da auditoria: são as regras do tempo e do lugar — o teleporte e a viagem fantasma que esta onda vigia — e a MM11 provou que o Gemini 3.8 Flash obedece ao que lê colado à frase do jogador e ignora o meio do system (foi por isso que o TAMANHO saiu de lá). 578 caracteres, ~US$ 0,007 por sessão; não vale o risco.
- **2. o que passou a abrir por condição** (`emJogoNoTurno` + a tabela `SINAIS_DO_TURNO`, prompt.js — a frase, a pauta e os envelopes com a lista das missões, e as duas últimas narrações, contra o nome de quem existe): a tabela de preços e o MERCADO E COMÉRCIO (abriam em 96% dos turnos; agora em 40% — `temMercado` é cidade E comércio); o governo — agenda do rei, gestão, diplomacia — (92% → 4%; porta `governo`, abre também com o que governar: facção, cidade sua, governo, tomada, guilda de que é membro); COMPANHEIROS EM COMBATE (99% → 7%, porta `grupoEmLuta`); o FIM DO ACAMPAMENTO (92% → 3%, porta `fimDoAcampamento`); os CHEFES inteiros (99% → 13%; fora disso vai só o antagonista e um `+N`, `soOAntagonista`); as masmorras da região (todo turno de cidade → 19%, `semMasmorras`).
- **a prova de que nada usado deixou de chegar (as narrativas reais):** um nome de chefe saiu em 11 das 197 narrativas — em 10 o bloco abre inteiro; a 11.ª é o antagonista evocado sem nome no turno ("o Sem-Rosto enterrou lá", s8 58), e é por ela que o antagonista nunca sai. Uma masmorra saiu em 9 — em 8 a porta abre; a 9.ª (s8 7) tinha o nome no cânone. Das narrativas com preço e número, as 9 com o comércio fechado são idioma ("como quem passa uma moeda"), número da história ("paga uma moeda por cabeça") ou número que já vinha do sistema na pauta (a dívida de 23 moedas do Perrin) — nenhuma tirava o número da tabela; é a tabela fechada que vai mostrar, na 12.ª, se o preço inventado desce.
- **3. sem duplicados:** quem a pauta já veta no NÃO PODE não volta no LONGE (`naPauta`, cena.js — na 10.ª era a mesma pessoa a "1 dia" no LONGE e a "4 h" na pauta); a cauda "Trate as etapas…" da lista das missões (a regra mora em `MISSOES_PROMPT`); os ATRIBUTOS do rodapé (a ficha já os diz).
- **e um defeito de passagem:** a porta do mercado fechada deixava um "- " solto na zona (`- ${so("mercado", …)}`); agora o hífen é do bloco.
- **o tamanho da mensagem do turno (os 201 pedidos, por bloco sobre o texto real):** mediana 32.837 → **20.872** caracteres, p90 35.775 → **24.707**, média 32.831 → 21.091 (−36%): 6,6 mil sobem, 4,7 mil fecham por condição, 0,4 mil eram duplicados. O alvo do plano (≤18 mil) é da onda 3 (pessoas, cânone, O QUE EXISTE pela relevância).
- **o custo (o simulador da auditoria, `custo/sim2.cjs`, 63 turnos; com as quebras de cache forçadas):** US$ 0,832 → **0,695** por sessão com a saída de hoje (R$ 5,12 → 4,28); **0,710** se o fixo virar quatro vezes na sessão (duas subidas de nível e uma porta do fixo), 0,721 com oito. Se o 80–140 pegar: 0,707 → 0,570 (0,588 com quatro quebras). Só fechar e tirar duplicados, sem subir nada, daria 0,763.
- **prova viva, sem Narrador:** campanha de teste criada; a 1.ª fiação **calou no turno vivo** — o App já tinha uma `sinaisDoTurno` local (a do adjudicador), que sombreou a importada: build limpo, suítes verdes, e no turno "acao.startsWith is not a function" com todas as portas abertas. A leitura passou a chamar-se `emJogoNoTurno`, e a suíte prova o nome. Numa aba nova: o mesmo turno sem comércio ("Falo com Saoirse… sobre a guerra") foi de 19.842 (tudo aberto) para **14.602** caracteres na mensagem; o de comércio ("quanto custa um quarto") 16.861, com a tabela de preços; o system ficou idêntico byte a byte entre os dois turnos (45.168, com a ficha, o patamar, as proibições, a forma, as perícias e a profissão), e a frase do jogador por último nos dois. **localStorage:** a origem tinha só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens` (guardados em arquivo antes); o teste criou `taverna_save_v1`; com o jogo desmontado (aba em `/src/janela.js`) apaguei-a e repus as duas — conferido por leitura, igual ao de antes. `.claude/launch.json` voltou ao que era.
- **asserções movidas, com o motivo ao lado:** `teste-arco` e `teste-capitulo` (as proibições em `PROIBICOES_DO_ARCO`, e a prova de que moram no fixo uma vez só), `teste-missoes` (o spoiler proibido em `MISSOES_PROMPT`), `teste-reordem` (a ficha subiu de propósito; o título vivo continua em baixo), `teste-onda5` (governo e fim do acampamento no par que se exclui com a luta), `teste-narrador-so-narra-e4` (os limites descontam exatamente o texto das proibições, que a medida com o arco vazio passou a contar), `teste-fiacao-prende` e `teste-mm1-sonda-da-mesa` (a assinatura nova de `chefesDoFio`). Endereços re-medidos pelo diff contra o HEAD 2b9e82b (+72 abaixo de `infoTitulo`): 123 em `acoes-do-jogador.mjs` pelo remedir, os nus do `ondeSai` à mão, `pushMsgs` 9275 → 9298 no varredor, o relógio 16373 → 16445. Suíte nova `teste-custo-onda2.mjs` (78).
- **o que ficou:** (a) a medida real (US$ por sessão no `/custo`, o preço inventado, o teleporte e a viagem fantasma, a nota "cumpre a pauta") é da 12.ª sessão; (b) a porta `acampamento` nunca abre no App — `cenaDoPrompt` não manda `acampado` (defeito antigo, de outra fila; o fim do acampamento abre pelo envelope); (c) a onda 3 — pessoas, cânone e O QUE EXISTE pela relevância — é a próxima.

## 13/10 · v9.470 · a onda 1 do custo do turno: o histórico guarda a frase, o Cronista lê por gatilho (`frontend`) · este commit
- **o pedido:** a onda 1 de `mente/custo-do-turno.md` (desperdícios 1 e 5) e o defeito de passagem dos vínculos. Nenhum outro agente na árvore. Nenhuma chamada paga: o dev-server subiu com `TAVERNA_API=http://127.0.0.1:9` e um gancho em `fetch` respondia o Narrador e o Cronista com texto falso.
- **bastão:** tomei `.claude/app-jsx` ("frontend onda 1") no começo e devolvi ao fechar, com o App pronto.
- **1. o histórico guarda a frase (`janela.js`, `memoriaDoTurno`):** a fala antiga do jogador deixa de levar a pauta e os envelopes daquele turno; fica a frase inteira e, quando o sistema decidiu um número que a narração pode não ter dito, uma marca de ≤60 caracteres (no máximo duas): o teste e o resultado, a compra/venda e o preço, o débito, o social, a vitória, a missão concluída (`MARCAS_DA_MEMORIA`). O turno do clique fica no título curto e na primeira frase. O turno de agora não muda (pauta inteira, a frase por último — MM18). No histórico real da 10.ª: corpo médio 2.169 → memória 134 caracteres (6,2%), ~49 tokens por fala contra os 60 do plano. O cache explícito continua estável: a mensagem guardada nunca muda depois de escrita, e a suíte refaz seis turnos com um cache criado e quatro usados.
- **2. o Cronista por gatilho (`gatilho-do-cronista.js`, novo):** decide por código se lê AGORA — nome próprio que o registo não conhece (só no meio da frase: maiúscula de começo de frase não conta), a frase com destino ("vou até a forja"; "vou perguntar" não), o passo que a narração deu ("você desce"), a luta de pé, a fé do deus desperto, grupo/trabalho/promessa ditos, a abertura e a retomada. **O que não lê não se perde:** a narração entra numa fila e vai junto na próxima leitura, que a rede força no terceiro turno. **Decisão média:** o movimento que o próprio sistema já registou (`SISTEMA_MOVEU`: MOVIMENTO, VIAGEM, CHEGADA…) não acende — a rede do lugar existe para o passo que ninguém registou, e era isto que levava as leituras a 68%. Sem leitura, o resto da função corre com a resposta vazia (o segredo revelado é só código e continua). Campo novo do save `leituraDoCronista` (`{pulos, fila, vistos}`), ignorado pela versão antiga.
- **a prova do gatilho (sessões 8–10, 197 leituras reais, `testes/registo-s8-s10-cronista.json`):** lê em 112/197 turnos (57%, contra 100%); **todo o útil é lido — 83/83 — no turno (55) ou na fila da leitura seguinte (28), nenhuma narração perdida**; o que não pode esperar (o lugar que o sistema não registou, a pessoa nova com nome, o grupo, o trabalho, a morte na luta) é lido no turno em 30/36. Os seis que atrasam um ou dois turnos são o Cronista a rebatizar o lugar sem passo nenhum ("cidade" dentro da taverna, "posto na estrada" com o herói parado) e o companheiro que fala — escrito na suíte. O recall ≥95% do pedido vale para o útil inteiro (100%); o do turno sozinho é 66% e não chega lá sem acender em quase todo turno, porque a semente que o Cronista guarda é uma fala qualquer — por isso a fila, e não um gatilho mais largo.
- **3. o vínculo:** `linhaDoVinculo` (`vinculos.js`) — "Saoirse: 50/100 (Amizade)"; o App lia `marco.rotulo`, campo que nunca existiu.
- **o custo (o simulador da auditoria, `custo/sim2.cjs`, 63 turnos):** US$ 1,166 → **0,832** por sessão com a saída de hoje (R$ 7,18 → 5,12); 0,991 → 0,707 se o 80–140 pegar. O histórico enxuto sozinho dá 0,862 (as escritas do cache caem de 0,327 para 0,074); o Cronista, de 0,076 para 0,046 por sessão.
- **asserções movidas, com o motivo ao lado:** `teste-mm18-fiacao.mjs` (o histórico guarda a memória, não o corpo), `teste-fiacao-prende.mjs`, `teste-falar-com-em-cena.mjs`, `teste-mm13-abertura.mjs` e `teste-narrador-so-narra-e3.mjs` (a âncora segue a assinatura nova do Cronista). Endereços re-medidos pelo diff contra o HEAD 4b72a82 (+44 acima de `enviar`): 128 em `acoes-do-jogador.mjs` pelo remedir, os nus do `ondeSai` à mão, `pushMsgs` 9270 → 9275 no varredor e o relógio 16329 → 16373.
- **prova viva, sem Narrador:** campanha de teste criada; turno 1 sem gatilho — só o Narrador foi chamado; turno 2 com "o ferreiro Brannoc da Foz" na narração — o Cronista leu, com a narração do turno 1 na fila. O pedido do turno 2 levava no histórico "[ABERTURA DA CAMPANHA] Primeiro turno." (38) e "Pergunto ao padeiro quanto custa um pão." (40), e a mensagem do turno 26.754 caracteres com a pauta e a frase por último. **localStorage:** a origem tinha só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens` (guardados em arquivo antes); o teste criou `taverna_save_v1`; com o jogo desmontado (aba em `/src/janela.js`) apaguei-a e repus as duas — conferido por leitura, igual ao de antes. `.claude/launch.json` voltou ao que era.
- **o que ficou:** (a) o estado da leitura depois de o Cronista ler só vai ao save no turno seguinte (o Cronista só grava quando registra algo): num recarregamento logo a seguir, a fila de antes é relida uma vez — custa uma leitura, não perde nada; (b) a medida real (US$ por sessão no `/custo`, escritas de cache de ~12 para ~6, a nota "não inventa" e a continuidade) é da 12.ª sessão de prova; (c) a onda 2 (o estático para o cache, as portas) é a próxima.

---

## 13/10 · v9.469 · a fiação do acampamento honesto e do grupo no mural: o que o v9.467 deixou dormente (`oficial`) · este commit
- **o pedido:** ligar no `App.jsx` as quatro peças do v9.467 que dormiam (`descanso.js`: `ofertaDoAcampamento`, `VEREDITO_DO_DESCANSO`, `reciboDoDescanso`; `ofertas.js`: `genteDaHistoria` com `grupo`). Nenhum outro agente na árvore.
- **bastão:** tomei `.claude/app-jsx` ("oficial 467") no começo da tarefa e devolvi às 17:41, com o App fechado.
- **o que ligou:** (1) a oferta "Montar acampamento" da soleira lê `ofertaDoAcampamento(personagem, dia, { cura })` — com a noite livre "uma noite · PV e PM cheios", com ela gasta "uma hora · já dormiu hoje: só um curto", e **nenhuma oferta** quando nem o curto dá nada; (2) `contasDoLongo` (o `🌙 Descanso longo`) lê `VEREDITO_DO_DESCANSO.longo/curto.retorno` em vez das duas strings; (3) os dois envelopes `FIM DO ACAMPAMENTO` leem `reciboDoDescanso` — o do descanso com `pedido` (longo que virou curto diz porquê) e a ficha ao montar o acampamento, o SEM DESCANSO com `tipo: "nenhum"`; `fichaAoAcamparRef` é novo, transitório, **fora do save**, gravado em `acampar()` e limpo em toda saída, no começo de campanha e no load; (4) `historiaDoMural` passa `grupo` a `genteDaHistoria` (os dois Gualtérios). Tudo em `calou`, com a frase antiga como recaída.
- **decisão média (forma do App):** o ref nasceu na **mesma linha** do `definirAcampado`, com o comentário junto do `acampar()`. Com ele em 6 linhas, o `check-acoes-do-jogador` acusava 90 endereços andados (lê o App por número de linha até ~23,6 mil); assim nenhuma linha acima de `acampar` andou e a tabela continua certa sem re-medir.
- **asserções movidas, com o motivo escrito ao lado:** `teste-mm18-fiacao.mjs` §5 (a lista da história soma o grupo) e `teste-r3-campo-do-turno.mjs` §7 (a manchete da oferta sai de `ofertaDoAcampamento`, não de strings à mão — a régua continua a ser "a oferta escreve pela função que a vai cobrar").
- **prova viva, sem Narrador:** campanha nova de teste, save injetado com o jogo desmontado. Herói a 1/20 que já dormiu hoje, com 1 dado de vida: a soleira dizia "uma hora · já dormiu hoje: só um curto" (antes do conserto, com o mesmo estado, "uma noite · PV e PM cheios"); o `Descanso longo` dizia "devolve já dormiu hoje: só um curto"; ao sair pelo longo, o envelope: *"Foi só um descanso CURTO (já tinha dormido a noite inteira hoje); o PV NÃO subiu — continuo com 1/20 PV; NÃO narre cura…; o PM ficou como estava (6/6 PM)"*. Acampar de novo, queimar o dado (1 → 16) e sair sem descansar: *"NÃO houve descanso; o PV subiu de 1 para 16/20 PV"* — a frase velha dizia "PV e PM continuam exatamente como estavam", e era mentira. Sem dados nem PM a ganhar: **nenhuma oferta**. Sem `LimiteErro`. Chaves criadas apagadas no fim (só `taverna_save_v1`; as duas `taverna_cfg_*` já lá estavam).
- **o que não soube / o que custou:** o briefing dizia que o dev-server local não tinha chave (502). **Não é assim:** o `vite.config.js` faz proxy de `/api` para `taverna-sooty.vercel.app` — a criação da campanha de teste gastou **três chamadas reais** do Narrador publicado (abertura e afins) antes de eu o ver. Daí em diante a prova correu num dev-server com `TAVERNA_API=http://127.0.0.1:9` (entrada temporária no `.claude/launch.json`, já desfeita), e a API morta não custou nada. **Para quem vier:** prova sem Narrador pede `TAVERNA_API` apontado para o vazio. A migração de `regras-jogo.js` zera `ultimoLongo` sem `dadosVidaVersao >= 1` — quem injetar "já dormiu hoje" num save precisa dos dois campos.
- **o que ficou:** o `Descanso longo` com a noite gasta ainda diz "custa uma noite inteira · 2 rações e 2 águas" ao lado de "devolve só um curto"; se o curto convertido de facto cobra a noite e as rações, a conta é honesta mas dura — não conferi o que o `sairDoAcampamento` cobra nesse caso (é do motor).

---

## 13/10 · v9.468 · o Narrador novo no custo e no tamanho: cache explícito do Gemini, Cronista no Flash-Lite, o tamanho colado à frase do jogador (`backend`) · este commit
- **o pedido:** os quatro defeitos de dinheiro e de forma da 11.ª sessão (`mente/mm11-sessao-11.md`, "Os defeitos" 3 e 4, e o tamanho/a fala do herói): cache 25,4%, US$ 1,73 por sessão, mediana de 262 palavras, DeepSeek sem saldo. Outro `backend` na árvore ao mesmo tempo (os seis consertos de motor, v9.467); a etiqueta de `escuta.js` (o tamanho e a voz do herói) subiu antes, dentro do commit dele (`a681dfe`), porque o arquivo era dos dois e ele o commitou inteiro — entre os dois commits a regra do tamanho esteve nos dois lugares; este commit a tira do system.
- **a causa do cache baixo:** o implícito do Google NÃO é "o prefixo que já vi". O dente de serra prova-o: 0 nas cinco primeiras chamadas e 0 em cada corte da janela **com o `system` idêntico**, e ~11.490 tokens fixos no resto — o palpite do Google parou no `system` e nunca creditou a conversa (56–78% de cada pedido era byte a byte o anterior). A doc diz-o: o implícito é "no cost saving guarantee"; o explícito (`cachedContents`) tem garantia e é recomendado para "chatbots with extensive system instructions".
- **o que mudou:** (1) **cache explícito** — `janela.js` (`CACHE_EXPLICITO`, `decidirOCache`, `impressaoDoPrefixo`): o servidor escreve o `system` + o histórico menos a mensagem do turno, relê-o enquanto o rabo não passar de 6.000 tokens, e troca-o (apagando o velho na hora) no corte da janela, no fim do prazo ou quando o rabo cresce. O jogo guarda a ficha (`fichaDoCacheRef`, fora do save) e devolve-a; o servidor a sela com HMAC da chave do Google. Tudo o que falha no cache cai no pedido inteiro de sempre (404/400 → inteiro; criação recusada → o explícito descansa 10 min). `GM_CACHE_EXPLICITO=0` desliga sem redeploy. (2) **a conta**: escrever o cache custa a preço de entrada e guardá-lo por token-hora — `custo.js` passa a cobrar as duas (`escrita`, `guardado`, `armazenamento` na tabela). (3) **o Cronista** passa a `gemini-3.5-flash-lite` (o Flash-Lite estável mais novo da doc, 0,30/2,50, pensamento MINIMAL por `PISO_DO_PENSAMENTO`); o DeepSeek fica reserva. Um **402 risca a casa inteira** por 10 min (`SEM_SALDO`) — sem segunda ida nem no mesmo pedido. O Narrador ganha o Flash-Lite no fim da fila de reserva (outra cota, para o 429 com a DeepSeek morta). (4) **o tamanho**: o "TAMANHO DAS RESPOSTAS" saiu INTEIRO do system e foi para a etiqueta do pedido (`escuta.js`, `TAMANHO_DA_NARRATIVA` 80–140), uma linha antes da frase do jogador, com a voz do herói ("Não ponha na minha boca fala que eu não escrevi, nem decida por mim") — mudou de lugar, o system encolheu ~290 caracteres. `REDE_DE_SAIDA` 1.200 tokens (o pensamento conta dentro, pela doc; a 11.ª teve 647 no máximo); se cortar, `repararJsonTruncado` (`json.js`) apara na última frase ou o turno vai à reserva. (5) **a fala do herói**: `fala-do-heroi.js` tira a fala atribuída ao herói ("— … — você rosna") só quando o jogador NÃO falou no turno, só pela forma da língua, e nunca mais de um terço do texto. Nas 339 narrativas das sessões 6–10, com a frase real: 0 cortes.
- **a medida (offline, sem chave do Google na máquina):** a sessão da 11.ª reconstruída (62 turnos, system 11.490 tokens, ~560 por mensagem, ~10 mil na mensagem do turno, janela 24/24) dá **cache 66,5%** e a entrada do Narrador a **US$ 0,93 contra 1,78 sem cache** (o implícito medido: 1,34). Com saída mais curta e a guarda (~US$ 0,03), o Narrador fica ~**US$ 1,03** e a sessão ~**US$ 1,10–1,15** (era 1,73) — o Cronista no Flash-Lite ~US$ 0,08 (era 0,205). **Não chega aos 0,60–0,85**: o que sobra é a mensagem do turno (~10 mil tokens de portas, ESTADO, rodapé e pauta, cheia todo turno, ~US$ 0,47 por sessão), que nenhum cache de prefixo alcança. É a próxima alavanca, e é de prompt (pesada: mexe no que o Narrador lê).
- **decisões médias:** a régua de 6.000 tokens saiu da conta (3.000 → US$ 1,22; 6.000 → 1,07; 12.000 → 1,16), e a janela ficou 24/24 (32/16 e 40/24 saem mais caras com o explícito). O `App.jsx` (bastão tomado e devolvido nesta leva) mudou sem mudar de tamanho — o varredor das ações do jogador lê o App por número de linha.
- **o que ficou:** a medida real (cache creditado, latência da escrita do cache, palavras por resposta, falas cortadas) é da próxima sessão de prova. Na Vercel: `CRONISTA_MODELO`, se existir com o DeepSeek, sai ou passa a `gemini-3.5-flash-lite`.

## 13/10 · v9.467 · os consertos de motor da 11.ª sessão: a viagem, o eco, o acampamento, as fichas, o raspão e o antagonista sem nome (`backend`) · este commit
- **o pedido:** os seis consertos de motor de `mente/mm11-sessao-11.md`, cada um com teste que falha antes e passa depois, com a frase real. Outro `backend` na árvore (o custo do Narrador: `api/`, `prompt.js`, `custo.js`, `janela.js`, `json.js`, `fala-do-heroi.js`) e alguém no `App.jsx` — não toquei em nenhum. A suíte da árvore ficou vermelha só em `check-acoes-do-jogador.mjs` (endereços de linha do `App.jsx` em voo, não meus); `bash mente/so-o-meu.sh` com os meus 10 arquivos: **346/346 suítes, 16/16 varredores**.
- **1. a viagem lida de palavras (rastro.js, resolver.js):** as duas frases eram *"Ainda nem saímos de Bela do Rio quando eu a deixei com a sentinela"* (M10) e *"Vou até o batedor de Bela do Rio"* (M24) — as duas pela `detectarPartida`, verbo de partida + nome de cidade na mesma oração. Nova tabela `CIDADE_COMO_DESTINO`: o nome só é destino logo depois de uma preposição de rumo (para, até, a/à, rumo a, de volta a, "às portas de"); a oração negada não parte; a fala entre aspas não é ação. O resolver (a porta do "vou até") lê a mesma régua, e o cânone (a pessoa, o sítio) só aponta cidade quando a oração fala do lugar dela ("a cidade onde mora o batedor"), nunca quando a pessoa é o alvo. **Decisão média:** "Vou ao Peixe Cego" (uma casa de outra cidade) deixa de viajar sozinho — cai no aviso de destino não reconhecido, que não move ninguém; o falso negativo devolve o turno, o positivo custou 8 h e 8 turnos.
- **2. o eco (fios-da-estrada.js):** a ameaça que o Mestre pôs na boca de Branca (M8) voltava como `ENCONTRO DO TRECHO`. Tabela `O_ECO`: o encontro que AFIRMA (o viajante com notícia, o sinal na estrada) só toma tema do sistema (a pessoa e o lugar do fio); a conversa (o trecho calmo, a noite) pode voltar à promessa, marcada *"(dito por X: palavra, não fato)"*; o fio novo amarrado a uma promessa diz o mesmo e "sem dar o dito por verdade". Duas asserções de `teste-fios-da-estrada.mjs` mudaram, com o motivo escrito. **Não mexi** em `cobrarNoTurno` (prometido.js): o Mestre pagar o que ele próprio plantou é a técnica que a pessoa aprovou na Fase MM; o defeito era o mundo confirmá-lo.
- **3. o acampamento (descanso.js):** `ofertaDoAcampamento` (o que o botão promete: a noite, "já dormiu hoje: só um curto" a uma hora, ou nada quando nem o curto dá) e `reciboDoDescanso` (a frase da pauta, lida da ficha antes e depois: "o PV NÃO subiu — continuo com 1/12 PV; NÃO narre cura"), tabela `VEREDITO_DO_DESCANSO`. **Dormente até à fiação do App** (abaixo).
- **4. fichas duplicadas (npcs.js, ofertas.js):** "Sujeito de braço magro", "Vulto da faca", "Homem de lâmina" passavam pela maiúscula do começo da frase; tabela `GENTE_SEM_NOME` — o substantivo comum à cabeça não é nome, e a descrição segue a regra do descritor (funde-se em quem tem o ofício, ou fica sem ficha). Os dois Gualtérios: `genteDaHistoria` aceita `grupo`, e `ehDaHistoria` já tira do mural o homónimo — **dormente até à fiação**.
- **5. o raspão (desafios.js):** *"Arrasto o barril"*, Atletismo dif. 15, 15 = 15, −3 PV — e o cartão dizia "falhar fere: até 6 PV" quando, na linha `peso`, a falha seca não fere: quem fere é o raspão. `ESCOLHA_DO_TESTE.quando` diz quem paga: "passar por um fio fere: até 6 PV", "falhar ou passar por um fio fere" quando são os dois, e a espécie diferente ao lado ("falhar é cair 3 m… · passar por um fio deixa o corpo enfraquecido"). O sucesso continua a custar — o veredito antes do clique é que deixou de mentir.
- **6. o antagonista (escuta.js):** confirmado no código: no ato 0 a camada dá "quem está por trás de tudo" (`FIO.curta`, saga.js) — o nome Tristão não devia sair, e não saía. A margem era o degrau "cobra" da escuta: a linha não tem nome ("os dele", "a marca dele") e acabava em *"— é fato: entra nesta resposta, com o nome dito"*. Agora `rumo.semNome`/`fatoSemNome`: *"…, sem nome (não lhe dê um)"*. **Sem o registo bruto** (a sessão não o guardou) não dá para jurar que foi esta a linha da M50; é a única do motor que pedia nome sem o dar. Medido em `teste-batida-na-cena.mjs`: batida 41/46, momento 29/46, degraus 9/9 — o mesmo da HEAD.
- **o que ficou:** a fiação do App (para o `frontend`, com a forma exata na resposta ao orquestrador): a oferta "Montar acampamento" e o `contasDoLongo` lerem `ofertaDoAcampamento`/`VEREDITO_DO_DESCANSO`; os dois envelopes `FIM DO ACAMPAMENTO` lerem `reciboDoDescanso` (com a ficha guardada ao montar o acampamento); `genteDaHistoria` receber `grupo`. Fora desta etapa: o `CORREÇÃO — NOMES` repetido 4 vezes (é do App), a colisão de sobrenomes do gerador ("Cruz Caída" ×3).

## 13/10 · v9.466 · o Narrador por plano: o base é o Gemini 3.8 Flash, o superior (GPT-5.6 Sol) dorme até haver assinatura (`backend`) · este commit
- **o pedido:** a pessoa, depois do teste cego (`mente/ab-provedores.md`): *"colocamos o modelo barato na de entrada e o gpt sol na superior; entretanto agora nos testes e desenvolvimento vamos trabalhar apenas com a base."* Nenhum outro agente na árvore; `App.jsx` não foi tocado (sem bastão).
- **o que mudou em `api/narrador.js`:** o modelo deixa de estar escrito no código. Tabelas exportadas `PLANOS` (base `NARRADOR_BASE` = `gemini-3.8-flash`; superior `NARRADOR_SUPERIOR` = `openai/gpt-5.6-sol`, com a trava `PLANO_SUPERIOR_LIGADO`), `CRONISTA` (`CRONISTA_MODELO` = `deepseek-v4-flash`), `RESERVAS` e `REGUA_DA_REDE`; `rotaDoPedido(pedido, env)` é pura e dá a fila de `{provedor, modelo}`. A casa sai do nome do modelo (barra = OpenRouter, `gemini-` = Google, `deepseek-` = DeepSeek). Nasce `chamarOpenRouter` (OpenAI-compatível, `HTTP-Referer` + `X-Title`, `reasoning: {enabled:false}`, `OR_PROVEDORES` opcional), usado só pelo superior.
- **a trava:** o superior só responde com `plano: "superior"` no pedido **e** a chave da casa dele **e** `PLANO_SUPERIOR_LIGADO=1`. Sem a variável, o pedido cai no base em silêncio — ninguém liga o caro pelo console do navegador. **Quando houver assinatura de verdade**, o plano tem de vir de uma identidade verificada no servidor, não do corpo do pedido: com a trava ligada, hoje, qualquer um que mande `plano: "superior"` o tem. Isso é trabalho do dia da assinatura (infra/dinheiro: da pessoa).
- **a reserva:** o modelo do plano que falha (erro, 402, 429, vazio) passa ao DeepSeek v4-pro, depois ao base, depois ao v4-flash; o jogador não vê (o App só regista a troca no console). **Decisão média:** o 429 deixou de ter retentativa (só os 5xx a têm, 1 vez, 1,2 s): limite de taxa não passa em 1,2 s e a reserva responde antes. Os formatos de erro que o `guardado.js` lê ficaram iguais (`Todos os provedores falharam — casa (modelo: status: corpo) · …`, `Nenhuma chave configurada`, `sem texto (motivo)`).
- **o Gemini, conferido na doc do Google (13/10):** o id é `gemini-3.8-flash` (estável, sem `-preview`). O 3.8 Flash aceita só pensamento LOW/MEDIUM/HIGH — o MINIMAL dos Flash anteriores ele recusa, e a família 3 não desliga. Fica `thinkingLevel: "LOW"` (o chão), por `GM_PENSAMENTO`. **Decisão média:** `frequencyPenalty` só viaja se `GM_PENALIDADE` for diferente de zero — o teste cego correu sem ela, o OpenRouter não a lista para este modelo, e um 400 por campo recusado mandaria todo turno para a reserva sem ninguém ver. Temperatura 0,85 (a do teste).
- **o uso (`src/custo.js`):** `lerUso` lê o cache do OpenRouter (`prompt_tokens_details.cached_tokens`) e soma o `thoughtsTokenCount` do Gemini à saída (é cobrado como saída; sem isto o base sairia barato demais na conta). `PRECOS` ganhou `gemini-3.8-flash` (0,75 / 0,075 / 3,75) e `gpt-5.6-sol` (2,5 / 0,20 / 10 — entrada ao preço de escrita do cache, que foi o que a conta cobrou). `precoDe` apara a casa (`openai/`) e o sufixo de data/revisão. **Decisão média:** o "mais caro que conhecemos" para modelo fora da tabela deixa de ser número à mão e passa a sair da tabela, campo a campo — o Sol já o tinha passado.
- **removido:** o `provedor` do corpo do pedido e a variável `PROVEDOR` (v9.115). O App não os mandava; o plano os substitui. Se `PROVEDOR` estiver na Vercel, passa a ser ignorada (pode apagar-se).
- **o tamanho, anotado e não tocado:** no teste cego o Gemini 3.8 Flash ficou dentro das 60–140 palavras em **1 de 12** respostas (o DeepSeek em 6 de 12). O prompt não mudou. **A primeira sessão com o base deve medir as palavras por resposta**; se não couber na tela, aperta-se o tamanho no prompt, não no modelo.
- **as variáveis da Vercel para ligar o base (nomes e valores; a chave é a da pessoa, nunca escrita aqui):** `GEMINI_API_KEY` = a chave do Google AI Studio (é a única obrigatória); `NARRADOR_BASE` = `gemini-3.8-flash` e `PLANO_PADRAO` = `base` são os padrões e podem ficar de fora; `DEEPSEEK_API_KEY` fica como está (Cronista e reserva). Sem a `GEMINI_API_KEY` o jogo segue com o DeepSeek v4-pro, como hoje.
- **para o dia da assinatura superior:** `OPENROUTER_API_KEY` = a chave do OpenRouter; `PLANO_SUPERIOR_LIGADO` = `1`; `NARRADOR_SUPERIOR` = `openai/gpt-5.6-sol` (padrão). Opcionais: `OR_TEMPERATURA` (0.85), `OR_PROVEDORES` (lista para fixar as casas do OpenRouter). E o App passa a mandar `plano` no pedido (hoje não manda: frontend).
- **prova:** `testes/teste-narrador-planos.mjs` nova (71 asserções, `fetch` falso, rede nenhuma): a rota por plano, a trava (sem `=1`, sem chave, `PLANO_PADRAO`), a reserva (402, 429 sem retentar, vazio, 503 com uma retentativa, todos a cair no 502 que o `guardado.js` lê, sem chave no 500), o corpo do Gemini (LOW, 0,85, sem penalidade, JSON) e do OpenRouter (cabeçalhos, raciocínio desligado, sem `require_parameters`), o `lerUso` das três casas, os preços, e nenhuma chave no código. `teste-custo`: a contagem de `lerUso(data)` passou de 2 a 3 com o motivo escrito. `npm run build` limpo; `npm test` A=0.
## 13/10 · v9.465 · o pedido do Narrador na ordem do cache: o histórico deixa de pagar cheio (`frontend`) · este commit
- **o pedido:** a pessoa, preocupada com o custo (10 dólares de DeepSeek não chegaram a uma semana). Medir onde o prefixo do pedido quebra e arrumá-lo para o cache do provedor, sem bloco novo no prompt. Um agente de A/B de provedores trabalhava ao mesmo tempo, só no scratchpad e em `mente/ab-provedores.md` — não toquei nisso.
- **bastão:** tomei `.claude/app-jsx` às 11:35 e devolvi ao fechar o commit.
- **a medida antes (registo real da 10.ª sessão, 79 chamadas do Narrador, por script):** prefixo comum entre turnos seguidos de **51,0%** (system + mensagens serializados como o `api/narrador.js` os manda ao DeepSeek), contra **47,4%** de cache medido no `uso` — bate. O Narrador custou **US$ 1,16 em 79 turnos = US$ 0,0147 por turno** (as 83 chamadas leves, US$ 0,01 no total). **Onde quebrava:** dentro do system em 58 dos 78 pares — no ESTADO DESTE TURNO (o «TEMPO DA CAMPANHA», sozinho, em 33) ou numa porta da zona que virou (A GENTE EM CENA 11, COMPANHEIROS EM COMBATE 9). A v9.153/v9.162 tinha posto o ESTADO no FIM do system, mas o fim do system não é o fim do pedido: atrás dele vem o histórico (~60 mil caracteres), e ele — igual — era cobrado cheio todo turno.
- **o conserto, só de lugar (decisão média: nenhuma linha nova, o mesmo conteúdo, provado ±0 caracteres nos 79 pedidos):** `prompt.js#pedidoNaOrdemDoCache` corta o system na marca `═══ REGRAS DA CENA ABERTA ═══` e desce a zona + o ESTADO para a mensagem do turno, **antes do rodapé** — a frase do jogador continua a ser a última linha (MM18). `chamarMestre` passa o pedido por ele dentro de `calou` (se estourar, vai como vinha), e o reforço reaproveita o pedido já arrumado. Duas frases do texto fixo mudaram para dizer a verdade do lugar novo («que chega com as regras da cena aberta na minha mensagem mais recente»; «O texto de sistema é permanente»). Em minúsculas no topo de propósito: a marca em maiúsculas é a âncora de quem corta, e a primeira versão, em maiúsculas, fez a suíte achar a zona no topo (4% em vez de >90%) — a suíte pegou.
- **a medida depois (os mesmos 79 pedidos refeitos pela função real):** prefixo **68,7%** → custo estimado **US$ 0,0094 por turno** (−36% sobre o medido; o modelo dava 0,0138 antes, −32%). Os 10 dólares passam de ~680 para ~1060 turnos do Narrador. O cortar mais fino (as portas que viram pouco ficarem no system, por grupo ou por bloco) foi medido e não paga: 69,2% no melhor corte da zona, ~71% no melhor por bloco (medido dentro da própria amostra, logo otimista) — não vale a cirurgia.
- **o alvo de 85% não se alcança só com ordem, e o número diz porquê:** depois do conserto, a mensagem do turno (pauta + zona + ESTADO + rodapé com a base do mundo) é ~28% do pedido e é nova por construção; o teto desta arrumação é ~72%. Só ~18% desse bloco (6,1 mil de 33 mil caracteres) muda de facto de um turno para o outro.
- **o histórico (item 3), medido e não tocado:** já cacheado, ele é metade da entrada e custa ~US$ 0,0006 por turno (a 0,022/M); os saltos da âncora (5 em 79 turnos) somam ~US$ 0,001 por turno. Uma janela com resumo pouparia menos de 10% do custo e arriscaria a memória do Narrador — não compensa.
- **para a pessoa decidir (pesado: muda o que o Narrador lê e o pior caso do teto):** *a fotografia na âncora*. A zona, o ESTADO e a base do mundo ficam congelados numa fotografia logo antes do histórico, refeita só quando a âncora da janela salta (quando o cache já quebra de qualquer jeito); a mensagem do turno leva só os blocos que mudaram desde a fotografia, com a regra de que o mais novo vale. Estimado sobre o mesmo registo: **~86% de cache, ~US$ 0,005 por turno** (−63% sobre hoje). O preço: blocos repetidos (velho e novo) e o teto de ~82 mil a rever.
- **prova:** `npm run build` limpo; `npm test` **A=0** (344/344 suítes, 16/16 varredores). `teste-cache` ganhou o bloco 5 (16 asserções: system igual entre cenas e horas, zona e ESTADO na mensagem do turno nesta ordem, frase do jogador por último, nada perdido, fallback calado, App abre o rodapé pela marca); `teste-cache` bloco 4 e `teste-reordem` bloco 3 tiveram as asserções movidas com o motivo escrito. Endereços: 142 com prefixo re-medidos pelo diff contra `842adc7` (+8: chamarMestre mora na linha ~500, todos os endereços estão abaixo dela), os nus à mão com o motivo (`check-acoes-do-jogador` 9262→9270; `ondeSai` :14552→:14560, :14700→:14708; o relógio 16321→16329).
- **prova viva (dev-server, uma aba, gancho em `fetch` que responde falso — zero chamadas pagas):** localStorage antes: só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens` (guardado em ficheiro no scratchpad). Campanha nova «Prova do Cache», três chamadas do Narrador: o system saiu **igual** nas três (38.524 caracteres, sem zona nem ESTADO), a zona e o ESTADO na mensagem do turno, e a última linha foi a frase digitada nas duas jogadas. Prefixo vivo 61% já no 2.º e 3.º turno (histórico ainda curto). Depois, com o jogo desmontado (aba num ficheiro do mesmo domínio): o autosave tinha criado `taverna_save_v1` — apagado; os dois `cfg` repostos e conferidos por leitura numa aba recarregada. A medida real do cache vem do `uso` depois do deploy.

## 13/10 · v9.464 · o motor de v9.463 ligado no App: o vendedor sem nome é alvo, a luta na cidade sai da rua, o recrutado nasce armado, o grupo avisado salta da armadilha (`oficial`) · este commit
- **estado inicial:** HEAD `d299d6c` (v9.463), nenhum outro agente na árvore (só `mente/agora.json` e quatro png do Figma por commitar, que não são meus e ficaram de fora).
- **bastão:** tomei `.claude/app-jsx` às 10:59 («oficial pendências 462») e devolvi às 11:20, com o App fechado.
- **1. o vendedor:** `declararAgressao` passa `apontado` a `lerAgressao` (a pessoa que `alvoDoEnvio` acha na lista do EM CENA, com o `faz`), no mesmo `try` do bicho. **2. a planta:** `montarGrid` dá a `montarGrade` `emViagem` (`!!jornadaRef.current`), `cidade` e `lugar` (`lugarRef.current`), lidos num `calou`. **3. o recrutado:** `fichaDeCompanheiro` devolve `equiparKitInicial(garantirFichaCompanheiro(...))`. **4. a armadilha:** no ramo do companheiro, `grupoNaArmadilha({ avisou: !!vantagem })` em `calou`; avisado, a salvaguarda do herói (a mesma fonte, a mesma CD) com a ficha e os atributos dele, a metade/zero antes de `passarPeloAbrigo`, a linha «Greta: …» e o número que chegou na linha e no envelope (que diz também se passou). A mensagem ficou com um 🪤 só em vez de dois. **5. o preço:** as duas chamadas de `opcoesDaArmadilha` no painel levam `{ comGrupo }`.
- **um defeito que a prova viva achou, e consertei (leve: medido antes e depois):** o dano da armadilha no companheiro **nunca ficava**. O ramo aplicava-o por um atualizador (`setPersonagem((p) => …)`) e mandava `eu` — a ficha de ANTES — ao `enviar`: a foto do envio (`fichaViva()`, a ref ainda sem o dano) e o `aplicarResposta(resp, persAtual)` partiam dela. Vivo, antes do conserto: «Greta sofre 8 de dano» e Greta 12/12 na barra e no save (o Mestre local falha e a foto repõe). Agora a ficha nova (`euC`) vai à ref e ao estado antes do envio, e é ela que o envio leva — o padrão de `sofrerNaPele`. Era assim desde a v9.233, pelo menos; não há suíte que o prove (é tempo de React, não regra), a prova é a viva.
- **prova:** `npm run build` limpo; `npm test` **A=0**. Endereços: 126 re-medidos pelo diff contra `d299d6c` em `acoes-do-jogador.mjs` (+6, tudo acima), e os nus à mão com o motivo escrito (`check-acoes-do-jogador` 9256→9262; `acoes-do-jogador` ondeSai :14546→:14552 e :14694→:14700; `teste-acoes-do-jogador` 14545→14551, 14678→14684, 16315→16321, 14694→14700). Três asserções de texto movidas, com o motivo no comentário: `teste-abertura-no-app` (o kit: uma chamada → duas, e uma asserção nova de que a segunda é a do recrutado; o load continua sem kit), `teste-retratos` (a regex aceita o kit à volta da ficha), `teste-sessao-9-bolsa` (`conhecidas` pode vir seguida de `apontado`).
- **prova viva (dev-server, uma aba, zero chamadas pagas: o `/api/narrador` local dá 502):** localStorage antes: só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens`. Campanha nova «Prova 463» (Ume, Guerreira): a Greta do começo nasceu com Arco Curto e a Ume com Espada Longa. Com o jogo desmontado injetei uma fala do Mestre («Um vendedor de peixe grita os preços…»); «ataco o vendedor» → «Vendedor de peixe não é inimigo: atacar é um crime em Pedra das Velas. A guarda da coroa vai atrás de você, há 90 moedas pela sua cabeça por 12 dias…» com Deixar / Atacar mesmo assim; atacar abriu a luta contra o Vendedor de peixe com `grade.cenario === "cidade"` (no meio da praça · sob a arcada · no beco estreito). Depois, desmontado, uma masmorra do motor com a sala de armadilha (fios que derrubam potes de fogo, 8 de dano, CD 15) armada e atual: o preço dizia «você e o grupo, avisado, saltam com vantagem»; Passar assim mesmo com o primeiro `Math.random` forçado a 0,1 (para cair no ramo do companheiro, que é 30%): «Greta: Salvaguarda de Destreza ★ com vantagem: d20 → 18 + 2 = 20 vs 15 · resistiu» / «Greta sofre 4 de dano», e Greta 8/12 na barra e no save (antes do conserto acima, na primeira volta: falhou, 8, e 12/12). Sem `LimiteErro`; o console só tem os 502 do Narrador. No fim, desmontado, apaguei `taverna_save_v1` e a minha cópia `prova463_copia`; as duas `cfg` ficaram.
- **o que não soube / ficou:** (1) o recrutado armado (`fichaDeCompanheiro`) **não provei vivo**: recrutar pede o Mestre, que local não responde; a prova é a asserção de texto e o `equiparKitInicial` da suíte do `backend`. (2) não medi se o companheiro que passa a salvaguarda com 0 de dano (fonte sem metade) devia ter outra linha que não «sofre 0 de dano». (3) a pergunta do bloco v9.462 continua: o companheiro só é apanhado em 30% das vezes, e esse sorteio continua com `Math.random`, fora da semente — é do `jogo`/`backend`, não mexi.

## 13/10 · v9.463 · as quatro pendências das provas vivas v9.460 e v9.462, no motor (`backend`) · este commit
- **o pedido:** a pessoa, *«Pode prosseguir e consertar essas 4 pendências.»*, com as decisões do coordenador. Nenhum outro agente na árvore. Não toquei `App.jsx`. Suíte nova: `teste-prova-viva-462.mjs` (52; **29 falham na árvore de v9.462**, provado por `git archive HEAD src`).
- **1. o vendedor sem nome (`agressao.js#ALVO_PELA_CENA`, `QUEM_APANHA`, `PESO_DO_PAPEL`):** o vendedor estava no EM CENA (a gente que a prosa apresenta de mãos vazias) e `quemNaFrase` já o achava; a leitura da agressão só conhecia o nome do registo, o bicho e a gente armada, e respondia «sem alvo». `lerAgressao` ganha a opção `apontado` (a coisa da lista que a frase aponta, com o `faz`): gente da cidade abre a luta e o veredito do crime vem antes (`veredictoDoCrime` já lia qualquer nome); o armado da prosa continua luta sem crime; quem anda comigo, apontado pelo papel, é recusado como o grupo; o do registo pelo papel («ataco o peixeiro» → Joran Vale). Os ofícios da prosa entraram em `QUEM_APANHA` — «dou um soco no vendedor» nem era golpe — e em `PESO_DO_PAPEL` (vendedor e companhia: `fraco`; pescador, carpinteiro, cocheiro: `comum`). A trava fica: quem a cena não tem, não abre.
- **2. a estrada na cidade (`grid.js#PLANTA_DO_LUGAR`) — a causa:** não era jornada velha. Na cidade, sem sítio, `localAtualTxt()` dá «em Monte Escura»: o NOME da cidade não traz palavra nenhuma da tabela de `cenarioDe`, o bioma (colina, montanha) também não, e caía no `"estrada"` do fim. E as duas linhas do sítio mentiam pela mesma porta da E4: a do interior diz «não estou no SALÃO principal nem na RUA» (toda sala interna virava taverna) e a de fora diz «FORA DA CIDADE» (a clareira virava praça); Porto Velho punha a luta num convés. `cenarioDe` passa a ler `lugar` (o objeto de lugar.js) e `cidade` quando o App os dá: o sítio pelo nome (e pela casa em que fica), o cômodo sem palavra é interior, o sítio de fora sem palavra é o chão do bioma, e a cidade sem sítio é a rua; a estrada só com a jornada aberta (`emViagem: false` às claras cala a marca). Sem `lugar` nem `cidade`, a leitura de sempre (as asserções da E4 intactas).
- **3. o companheiro desarmado:** `equiparKitInicial` na ficha que nasce — `companheiroInicial` (companheiro-inicial.js) e o `grupo_adicionar` de `aplicarMudancas` (regras-jogo.js); o load (`garantirFichaCompanheiro`, `migrarPersonagem`) nunca arma, e a arma na mão nunca troca. **O equilíbrio (mesmas sementes, o grupo da régua — Mago, Clériga, Engenheiro — armado pelo kit contra `equipados: {}`):** MM7, o bando a 140 lutas: cena herói 12,23 → 12,26 · grupo 11,25 → 11,24 · total 23,48 → 23,50; declarada 9,36 → 9,39 · 16,79 → 16,69 · 26,14 → 26,09; vitória 100% nas duas, rodadas 3,88 → 3,87 e 3,84 → 3,80. MM6, com grupo, a 140: o furtivo da regra justo/brando cena 88,1 → 88,0 · 71,3 → 70,9, declarada 93,7 → 93,6 · 90,3 → 89,7; a queda da regra 4,2 → 3,0 · 10,1 → 10,9 (cena), 4,6 → 5,2 · 1,4 → 1,8 (declarada); a vitória do justo sobe 67,1 → 71,4 (cena) e 67,9 → 72,1 (declarada). Tudo dentro de `TOLERANCIA_DO_FURTIVO` e das faixas do MM7: **nenhuma catraca saiu, nenhuma se moveu**. **Decisão média, com o motivo:** as sondas continuam a medir o grupo da régua desarmado — é o grupo dos saves de antes, e o kit muda o grupo da campanha nova em menos de um ponto (o grupo da régua luta quase todo por habilidade; a arma é +1 ou +2 no golpe simples). O justo do MM6 ganha ~4 pontos de vitória, o único número que mexe.
- **4. a armadilha e o grupo (`masmorras.js#grupoNaArmadilha`, `ARMADILHA_DA_SALA.grupo`):** avisado (o herói notou e passa assim mesmo) → o companheiro faz a mesma salvaguarda do herói, com vantagem e a mesma metade; surpresa → como hoje. O preço do «Passar assim mesmo» diz o grupo quando há grupo (`opcoesDaArmadilha(mm, { comGrupo })`, `precoComGrupo`).
- **prova:** `npm run build` limpo; `npm test` **A=0** (344/344, 16/16).
- **para o `oficial` (App.jsx — sem isto, 1, 2 e 4 não chegam ao jogo; o 3 chega já pelo companheiro inicial):** (1) `declararAgressao`: no `try` do `alvoDoEnvio`, `if (alvo && alvo.tipo === "pessoa") { const it = lista.find((x) => x.id === alvo.id); if (it) apontado = { ...it, faz: alvo.faz }; }` (com `let apontado = null` antes) e `apontado` na chamada de `lerAgressao`. (2) `montarGrid`: `montarGrade({ emMasmorra, emViagem: !!jornadaRef.current, cidade: cidadeAtualRef.current || "", lugar: lugarRef.current, local: localAtualTxt(), bioma })`. (3) `fichaDeCompanheiro`: `equiparKitInicial(garantirFichaCompanheiro({ ...f, genero }))`. (4) `dispararArmadilha`, ramo do companheiro: `grupoNaArmadilha({ avisou: !!vantagem })`; com `salvaguarda`, `rolarSalvaguarda({ pers: alvo, salva: fonte.salva, vantagem, dc: (a do herói), modDe: (a) => atributoEfetivo(alvo, a) })`, o dano cheio vira a metade/zero como no herói ANTES de `passarPeloAbrigo`, a linha da salvaguarda com o nome dele, e o envelope diz o número que chegou. (5) as duas chamadas de `opcoesDaArmadilha` no painel: `{ comGrupo: (personagem.grupo || []).length > 0 }`.
- **o que não soube / ficou:** a prova viva da v9.460 não guardou a fala do Mestre que trouxe o vendedor; se ele veio só com artigo definido («o vendedor grita»), não nasce no EM CENA (a régua da apresentação morde só «um»/«uma» de propósito) e o golpe continua sem alvo — é a trava, não a pendência. O `/companheiro` do modo criativo também nasce desarmado (é teste, não mexi).

## 13/10 · v9.462 · o motor de v9.461 ligado no App: quem está longe fica longe, e a armadilha vê-se antes de morder (`oficial`) · este commit
- **estado inicial:** HEAD `69ad49f` (v9.461), verde; o `testes` mexia ao mesmo tempo nas sondas e nas suítes MM6/MM7 (subiu `bd3a634` no meio, sem bump) — não toquei nesses arquivos.
- **bastão:** tomei `.claude/app-jsx` às 04:44 («oficial longe e armadilha») e devolvi às 05:21, com o App fechado.
- **1. quem está longe:** `contextoDoEmCena` leva `espinha` e `lugares` (os sítios daqui, `lugaresDaqui`, num `vale`). O coração e o QUEM É leem a mesma conta por `elencoDoCoracao()` (o `.longe`/`.aqui` de `elencoDaCena` + o grupo, em `calou`) e `cidadeDoCoracao()` (a cidade vazia em viagem e na masmorra aberta, que antes era um literal dentro de `contextoDoCoracao`); a chamada de `quemEParaPauta` passa `longe`, `presentes`, `grupo`, `espinha` e `cidade`.
- **2. a armadilha:** o ramo de dano que morava dentro de `irParaSala` saiu, igual, para `dispararArmadilha(sala, { pos, depois, vantagem })` (o herói lido do ref, a salvaguarda com `vantagem`). Ao entrar numa sala de armadilha: `notarArmadilha` (ou, se a sala já estava armada de uma visita de antes, a linha `aVista` da tabela); notada, a sala fica armada e por resolver, sem dano, e o envelope pede ao Narrador que pare antes do disparo; não notada, o de sempre. As três saídas no painel da masmorra, na forma dos botões de ação da sala (Procurar, Tentar de novo), com o preço de `opcoesDaArmadilha` e piso de alvo `ALVOS.piso`: Desarmar → `agir(op.frase)` e o fecho do teste (`fecharArmadilhaDoTeste`, nos dois caminhos: o dado e o automático) chama `fecharArmadilha(passou ? "desarmada" : "disparou")`; Contornar → `fecharArmadilha("contornada")` + `avancarMinutos(r.minutos)` (a tocha sai no motor); Passar assim mesmo → fecha primeiro e dispara com vantagem. A passagem adiante com a armadilha à vista diz o preço na própria pista («pela armadilha: …»), e clicá-la é o Passar assim mesmo.
- **decisão média, com o motivo:** seguir pela passagem com a armadilha armada **dispara e não anda**: o herói fica do outro lado dela, na mesma sala, e o passo seguinte é outro clique. Andar no mesmo clique mandaria dois envelopes no mesmo fôlego (o do disparo e o da sala nova), e o resto de `irParaSala` lê o `personagem` do render, que ainda não tem o dano (o tesouro reescreveria a vida). A linha que o diz vai **antes** do disparo: depois do envio, ela sumia quando o Narrador falha (medido vivo).
- **prova:** `npm run build` limpo; `npm test` **A=0** (343/343, 16/16). Endereços: 126 re-medidos pelo diff contra `69ad49f` em `acoes-do-jogador.mjs` (+19, tudo acima), os nus à mão com o motivo escrito (`check-acoes-do-jogador` 9237→9256; `teste-acoes-do-jogador` 14526→14545, 14659→14678, 14675→14694, 16296→16315), e +1 duas vezes para as duas linhas novas mais abaixo. `teste-sessao-9-historia`: a asserção da cidade do coração passou a ler `cidadeDoCoracao` (motivo no comentário). O fecho do desarmar ficou numa linha própria depois de `if (des) { fecharTentativa(…) }` para não mexer na âncora de `teste-mm6-escondido` (território do `testes`). Três emoji novos saíram (D5h: teto 549).
- **prova viva (campanha de teste, dev-server, uma aba):** localStorage antes: só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens`; criei a campanha «Prova da Armadilha», injetei com o jogo desmontado. (a) masmorra gerada pelo motor, a sala de armadilha (cd 14) adiante: passiva 19 → «Percepção passiva 19 vs 14 — chão que desaba sobre estacas, armada à sua frente», 18/18 PV, e as três saídas com o preço; Desarmar rolou o teste (Prestidigitação, dif. 18): 16+3=19, por um fio → «A armadilha daqui está desarmada» e 2 de dano do gatilho, os botões somem; Contornar: tochas 4→3, relógio +20 min, «Você conhece o caminho rente à armadilha»; Passar assim mesmo (pelo botão e pela passagem): «Salvaguarda de Destreza com vantagem … resistiu», 4 de 8. (b) fora da masmorra, a fala do Mestre nomeia Bryna (a história põe-na em Ponte da Fonte) e Sigrun da Urze (daqui), as duas a agir: fichas da cena só Sigrun e Isolde; no corpo do envio, o EM CENA tem Sigrun e não Bryna, e não há QUEM CARREGA nem QUEM É dela (Bryna só no bloco da ESPINHA, que é dela). Sem `LimiteErro`. No fim, jogo desmontado, apaguei só `taverna_save_v1` e `taverna_rascunho_historia`; as duas `cfg` ficaram como estavam.
- **o que não soube / o que ficou:** (1) os sítios no EM CENA (a Serpente Rouca) **não provei vivo**: `locaisDaCidade` deu lista vazia para a cidade da campanha de teste quando o chamei à mão, e não insisti — a prova é a suíte do `backend`. (2) numa das voltas, dois cliques por coordenada no «Contornar» não fizeram nada e o `click()` pela árvore fez; o mesmo ponto, noutra volta, funcionou no «Passar assim mesmo». Não achei causa (o elemento no ponto era o botão); fica dito, não consertado. (3) com o Mestre fora do ar (local), o envio falha e a mesa diz «Nada do que você fez chegou a acontecer» — mas o que os dados decidiram (a sala, a tocha, a vida) ficou, como deve. (4) o companheiro ainda leva a armadilha em 30% das vezes mesmo no Passar assim mesmo (o ramo de hoje, igual): se a vantagem devia ser só de quem viu, é pergunta para o `jogo`.

---

## 13/10 · v9.461 (sem bump: só prova) · as réguas de equilíbrio passam a medir a abertura perto (`testes`) · este commit
- **a decisão (do coordenador, 13/10, pela ordem de 28/09):** os números do bloco v9.460 são ACEITOS — a luta declarada a 1–2 casas é como numa mesa; o herói apanhar menos do conjurador e do bando é o efeito de lutar perto; o furtivo do Ladino cai na cena e sobe na declarada. As catracas deixam de medir a fila contra fila e passam a medir `cena` e `declarada`; a abertura antiga fica como registo sem asserção (o inverso de v9.460).
- **furtivo (`sonda-do-furtivo.mjs`, `teste-mm6-escondido.mjs` §11):** `RETRATO_DO_FURTIVO` ganha `cena` e `declarada` (os 9 pares cenário × modo, a 140 lutas) e a abertura de 29/09 vai para `antiga`; nasce `TOLERANCIA_DO_FURTIVO` (furtivo ±6 pontos, queda da regra ±5). Os limiares soltos de antes (com grupo: furtivo > 85%, queda < 8%) saem; entra a faixa em volta do retrato: brando/regra cena 71,3% · 10,1% (era 88,1% · 5,3%, e a faixa antiga não cabia), declarada 90,3% · 1,4%; justo cena 88,1% · 4,2%, declarada 93,7% · 4,6%. As promessas da fase ficam como estavam, nas duas aberturas (sozinho: 0% e queda > 15%; ardilosa: esconde-se > 1x, furtivo > 25%, queda < 12% e > −20%). **Motivo da amostra 40 → 70:** a 40, a queda da ardilosa do justo na cena deu −19,5% contra −7,4% do retrato, a meio ponto do limite de −20%; 70 são dez voltas do rodízio de sete plantas (+ ~7 s na suíte).
- **atiradores (`sonda-dos-atiradores.mjs`, `teste-mm7-atiradores.mjs` §10 e §12):** `RETRATO_DOS_ATIRADORES` ganha `cena`, `declarada` e `semOportunidade` por abertura; o `depois` e o `semOportunidade` antigos vão para `registo.antiga`, e o `registo.abertura` do `oficial` vira o retrato. Dano no herói (antes 13,03 · 10,64 · 15,30 → cena · declarada): dupla 11,91 · 11,10, conjurador 8,59 · 7,97, bando 12,23 · 9,36 (grupo 5,35 → 11,25 · 16,79). **Limites movidos, cada um com o motivo na tabela:** `variacao` 0,20 → 0,40 (o pior caso era 19,3% e passa a 38,8%: a mesma folga de ~1 ponto); `vitoriaCai` 0,02 → 0,04 (a dupla perde 2,2 pontos perto, 99,3% → 97,1%); nascem `totalDoBando` 0,35 (o total sobe +13,7% · +26,6%), `oportunidadePesa` 0,15 (sem o golpe de oportunidade o conjurador fere o herói +19% · +26% — a asserção antiga, "passa do limite de 20%", era da abertura de antes) e `aoVivo` 0,35 (o mesmo número de antes, 0,20 + 0,15, agora em volta do retrato da abertura e não do `antes`).
- **a prova de que a catraca tem dente** (cópias temporárias das duas suítes com `situacao: undefined`, apagadas): na abertura de antes o MM6 falha 3 asserções (cena, com grupo: furtivo 97,8% e 87,4% contra 88,1% e 71,3%; a ardilosa) e o MM7 falha 10 (o conjurador mede 12,69 contra 8,59 · 7,97; o grupo do bando 5,49 contra 11,25 · 16,79; ao vivo +58% e +70% contra a folga de 35%). `npm test` na árvore deu 342/343 com a falha numa asserção de TEXTO do App em `teste-mm6-escondido` (o `oficial` tinha o bastão e editava o App naquele minuto; a mesma suíte passou no rerun seguinte), e `so-o-meu.sh` com os meus cinco arquivos deu **A=0, 343/343 + 16/16**. Dentro da suíte do MM6 ficou ainda uma asserção de dado: a faixa da cena distingue o retrato novo do antigo (para ninguém alargar a tolerância até aceitar as duas aberturas).
- **o que ficou:** a declarada, sozinha, não distingue a abertura de antes no furtivo (90,3% contra 88,1%) — quem a distingue é a cena e o MM7 inteiro. `RETRATO_DO_FURTIVO.antiga` guarda o retrato de 29/09, que já não é o que o motor de hoje mede na abertura de antes (brando/regra 88,1% e 5,3%, não 99,7% e 0,3%): é história, sem asserção.

## 13/10 · v9.461 · os três defeitos de motor da prova viva da v9.458: quem está longe fica longe, o bicho fica onde foi visto, a armadilha vê-se antes de morder (`backend`) · este commit
- **estado inicial:** HEAD `341e2cd` (v9.459), verde; no meio do ciclo o `oficial` subiu `d874ac3` (v9.460, a abertura e o kit no App) sem tocar nos meus arquivos. Não toquei `App.jsx`, `painel-*.jsx`, `grid.js` nem `kit-inicial.js`. Esta leva é **v9.461** (o maior +1).
- **1. quem a história põe noutra cidade (`nucleo.js#longeDaHistoria`, `LONGE_DA_HISTORIA`; `cena.js#QUEM_ESTA_AQUI`):** a lista de longe junta o registo (que manda quando SABE: o `longe` dele inteiro, e quem ele põe aqui com paradeiro), o núcleo (`pessoas[].cidade`) e a espinha (`marcos[].quem` + `cidade`); o grupo nunca está longe, e se alguma voz da história põe a pessoa aqui, fica aqui. O "paradeiro não registrado" passou a tabela (byte a byte). Lêem-na o EM CENA (sem fiação nova para o núcleo: o contexto já o leva), o `avancarCoracao` (QUEM CARREGA; já recebe `cidade` e `espinha`) e o `quemEParaPauta` (QUEM É; precisa da fiação). A porta do elo fica aberta — só abre na cidade dele, e a linha diz que ele *vem ter com o herói*. Medido no núcleo da 9.ª: o Oren citado em Rio do Rio dava `QUEM CARREGA Oren (… entra nesta resposta…)` e a ficha QUEM É; agora nenhuma das duas, e em Buraco Norte as duas como antes.
- **2. a Serpente que viajou (`em-cena.js#BICHO_DO_SITIO`):** dois furos. (a) A «Serpente» era a **Serpente Rouca**: os nomes de sítio conhecidos (o lugar, as saídas, o perto, o `local` de quem está no registo, e `ctx.lugares`) saem do texto antes de procurar bicho, e a cabeça de bicho com maiúscula seguida de outra maiúscula logo depois de um locativo («na Serpente Rouca», «no Javali Cambaleante») é nome de casa. (b) As duas falas da janela de `falasDoMestre` atravessavam a viagem e faziam o bicho nascer de novo carimbado no sítio novo (e a memória levava-o 6 turnos). **Decisão média, com o motivo:** a lista guarda a cidade em que foi montada e as falas de fora como **propriedades do próprio array** (`naCidade`, `falasDeFora`), não como campo de cada coisa — a forma dos itens não muda (fichas, pauta, suítes), e uma lista vazia também se lembra; o App já guarda o array inteiro em `emCenaRef`. Só os bichos: a gente da prosa tem a régua dela.
- **3. o desarmar que nunca rolava (`masmorras.js#ARMADILHA_DA_SALA`, `cdDaArmadilha`, `notarArmadilha`, `opcoesDaArmadilha`, `fecharArmadilha`, `armadilhaNoCaminho`):** ao entrar, Percepção passiva contra a dificuldade (a da armadilha oculta da sala, ou 12 + camada, teto 18); o cauteloso rola também d20 + Percepção (sorte semeada) e fica com o melhor. Notada: `armada: true`, por resolver — o `objetoEmCena("armadilha")` do App já a lê e o «desarmo a armadilha» rola; as três saídas com o preço antes do clique (Desarmar · Contornar: 20 min e 1 tocha · Passar assim mesmo: até N de dano, salvaguarda com vantagem). Não notada: dispara como hoje. A volta e a pauta dizem como acabou (desarmada, contornada, disparada; o save de antes continua «já disparou»).
- **suíte:** `teste-prova-viva-458.mjs` (81; **46 falham na árvore de v9.459**, provado por `git archive HEAD src`). `npm run build` limpo; `npm test` **A=0** na árvore e em `so-o-meu.sh` com os meus seis arquivos.
- **para o `oficial` (App.jsx — sem isto, o 3 não chega ao jogo e o 1 só chega pela metade):** (1) `contextoDoEmCena`: `espinha: espinhaRef.current` e `lugares: vale("EM CENA · os sítios", () => lugaresDaqui().map((l) => l.nome), [])`. (2) `contextoDoCoracao`: `longe`, `presentes` (o `.longe` e o `.aqui` de `elencoDaCena(npcsRef.current, cidadeAtualRef.current, mapaRef.current, { comGrupo: grupo, masmorra: masmorraRef.current })`) e `grupo`. (3) a chamada de `quemEParaPauta` (~7720): os mesmos `longe`/`presentes`/`grupo`, mais `espinha: esp` e `cidade` (a mesma do coração: vazia em viagem e na masmorra aberta). (4) `irParaSala` (~22084): logo depois de `checarPassiva`, se `sala.tipo === "armadilha"`, `const n = notarArmadilha(masmorraRef.current, { passiva, mod: modPerc, ritmo: mm2.ritmo })`; com `n && n.notou`, guarda `n.mm`, `pushMsgs(n.linha)`, mostra `opcoesDaArmadilha(n.mm)` e envia o envelope da sala SEM `marcarResolvida` e sem dano — e `return`; sem, o caminho de hoje. Os botões: «Desarmar» manda `op.frase` pelo despachante (o teste); no fecho do teste, `fecharArmadilha(mm, passou ? "desarmada" : "disparou")` (a falha já foi cobrada por desafios.js); «Contornar» → `fecharArmadilha(mm, "contornada")` + `avancarMinutos(r.minutos)`; «Passar assim mesmo» → o ramo de dano de hoje com `vantagem: true` na salvaguarda, e `fecharArmadilha(mm, "disparou")`. (5) no começo de `irParaSala`: `armadilhaNoCaminho(mm, id)` → é o «Passar assim mesmo» antes de andar.
- **o que ficou:** o `(d)` da prova viva (o envelope do sítio e o do fim do descanso na mesma chamada) não era deste pedido.

## 13/10 · v9.460 · a luta abre pela situação e a classe nasce armada, ligadas no App (`oficial`) · este commit
- **estado inicial:** HEAD `341e2cd` (v9.459), verde. Um `backend` na mesma árvore (`em-cena.js`, `fichas.js`, `masmorras.js`, `companheiro-inicial.js`, e no meio do ciclo também `nucleo.js`, `cena.js`, `subtramas.js`) — não toquei nenhum. **Bastão `.claude/app-jsx` tomado às 04:04 («oficial luta e kit») e devolvido às 04:22**, depois da prova viva (a última edição do App foi antes dela). Patch por `.cjs` com o `t(de, para)`.
- **1. a abertura:** `montarGrid(pers, inimigos, situacao = "cena")` passa a `posicionar` a `situacao` e a `sorte` = `rng(hashSemente(sementeMundo()|abertura|turnoDeRegistro))` — a mesma semente no mesmo turno abre à mesma distância. `equiparCombate` e `abrirCombate` levam a situação (padrão `"cena"`, em `calou`). **Quem diz o quê:** `declararAgressao` e a luta prometida do coração → `"declarada"` (o comentário dela já dizia «pela mesma porta da agressão declarada»); a investida da estrada, a emboscada do perigo, a emboscada devida da virada e os dois bandos da fuga (território e perseguição, que o envelope já narra como emboscada) → `"emboscada"`; o resto (o Mestre que abre, a caçada, a masmorra, o raid, a guarda, o modo criativo, o torneio) → `"cena"`, que na masmorra dá a porta da sala (3–5) e fora dela o encontro (2–4).
- **2. o kit:** `concluir(equiparKitInicial(comDom({...})))` na tela de criação, e em mais lado nenhum; `kit-inicial.js` saiu de AGUARDANDO em `teste-ligacao`.
- **3. o equilíbrio (re-medido, 140 lutas, mesmas sementes):** os dois heróis das sondas JÁ tinham arma (o Guerreiro da régua com a Espada Longa, que é a do kit; o Ladino de MM6 com a Adaga do pronto) — o kit aproxima o jogo do que elas mediam; a Espada Curta do kit no Ladino sobe o dano ~2–3% e não mexe nas frações. **A geometria mexe.** MM6, com grupo, `regra`, brando: furtivo 88,1% → **71,3%** (cena) / 90,3% (declarada), queda 5,3% → **10,1%** / 1,4% — a cena sai da catraca (furtivo > 85%, queda < 8%): perto, o Ladino chega ao alvo antes do grupo. MM7, dano no herói contra o antes: dupla −8,6% / −14,8%, conjurador **−19,2% / −25,1%**, bando **−20,1% / −38,8%** (cena / declarada), com o grupo do bando a levar 11,25 / 16,79 (era 5,49): o herói apanha menos e o dano muda de mão; total do bando +13% / +26%. **Decisão, com o motivo:** as faixas NÃO se afrouxaram e as catracas seguem a medir a abertura de antes (as sondas ganharam a opção `situacao`, que omitida dá a luta byte a byte); os números novos ficaram como REGISTO sem asserção (`RETRATO_DO_FURTIVO.abertura`, `RETRATO_DOS_ATIRADORES.registo.abertura`), porque passar a catraca para a geometria nova é aceitar estes números, e isso é da pessoa.
- **testes:** `teste-abertura-no-app.mjs` nasce (17: a fiação por texto, a conta do App refeita em Node com determinismo e faixas, o kit só na criação). `teste-sessao-7`: a âncora da luta prometida ganhou `situacao: "declarada"` (motivo escrito). Endereços re-medidos pelo diff contra `341e2cd` (+15 abaixo de ~6320): 147 com prefixo em `acoes-do-jogador.mjs`/`check`/`teste`, e os nus à mão (pushMsgs 9222→9237, relógio 16281→16296, ondeSai :14512→:14527 e :14660→:14675), cada um com o degrau escrito.
- **prova viva** (dev-server, uma aba, fechada no fim; localStorage anotado antes — só as duas `taverna_cfg_*` — e, com o jogo desmontado, apagada só a `taverna_save_v1` criada): Guerreira nova → o save tem `equipados.arma` = Espada Longa e a luta mostra «1 ataque por turno de 1d8»; «ataco o guarda de elmo» abriu a luta com o guarda a 2 casas (3 m, `[9,6]` contra `[9,4]`); `/encontro facil Lobo` (cena, planta da estrada) abriu os dois lobos a 2 casas. Sem `LimiteErro`. **O que não provei vivo:** a investida da estrada (é sorte de viagem) — está provada pela âncora e pela conta em Node.
- **o que não soube / ficou:** (a) a 1.ª tentativa «ataco o vendedor com a espada» NÃO abriu luta (o Mestre narrou «não há ninguém para atacar») — o vendedor sem nome não casou como alvo; é anterior a isto, da leitura da agressão. (b) Na cidade (Monte Escura) a planta foi a «estrada» — `localAtualTxt` não dá a cidade a `montarGrade`; anterior também. (c) Na declarada a 2 casas o herói ainda não alcança («faltam 1,5 m»): é a tabela (1–2), e a 1.ª ação vira um passo. (d) O companheiro inicial nasce desarmado (`companheiro-inicial.js`, do backend).

## 13/10 · v9.459 · S10a e S10b: o feixe aponta a missão de agora, a luta abre perto, a classe nasce armada (`backend`) · este commit
- **estado inicial:** HEAD `5561eb0` (v9.458), verde. O `oficial` no App; não toquei `App.jsx` nem `painel-*.jsx`.
- **S10a (o feixe):** `dadosDoMapaVivo` marca `chama: true` (e `momento: "agora"` se não tinha) no nó do PRÓXIMO marco de pé do ato atual que tenha lugar visível (`onde` → `cidade` → a cidade da `chave` da condição; tabela `ONDE_MORA_O_MARCO`); `alvoDoFeixe` (faixa-do-rumo.js) lê a frente antes do gancho e, se o herói já lá está, não aponta para fora. Antes: na semente 0, com a missão noutra cidade, o feixe ia à «Muralha Quebrada de Prata Podre» (o ato seguinte). Medido em 200 mundos × 2 atos: 400 frentes, uma por mapa, 114 «aqui». `teste-painel-mapa-vivo`: o mundo dos números do Figma passa a ter o ato 0 cumprido (motivo escrito na suíte) — os números são do feixe no gancho.
- **S10b (a abertura):** `ABERTURA_DA_LUTA` (grid.js): declarada 1–2 casas (sem sorte: 1, corpo a corpo), encontro 2–4 (3), emboscada 2–4 (2), masmorra 3–5 (4); `situacao: "cena"` deixa a planta decidir (masmorra/encontro). 400 aberturas (10 plantas × 5 situações × 4 sortes × com/sem grupo, com grandão e ágil): ninguém fora do tabuleiro nem em cima de outro, o mais perto sempre na faixa. **Decisão média:** SEM situação, `posicionar` dá a abertura de antes byte a byte (120 casos comparados com HEAD) — mudar o padrão por baixo deixava vermelhos o X1 (`acoes-do-jogador`, `teste-golpe`) e as sondas de equilíbrio do MM6 (furtivo) e MM7 (atiradores: o conjurador passava a −23%), que mediram a geometria velha. Quem abre a luta de verdade passa a situação; a re-medida das sondas é um passo à parte.
- **S10b (a arma):** não havia kit. A tela de criação de Uma Vida monta `equipados: {}` para as **doze** classes, e sem arma o golpe é 1d2 «desarmado». Nasce `src/kit-inicial.js` (`KIT_INICIAL`, `armaInicial`, `equiparKitInicial`): a arma de banca da classe (Guerreiro: Espada Longa, marcial), sem penalidade de treino em nenhuma das 12; nunca troca a arma já na mão; o load não a chama. Espera a fiação da criação (lista de espera em `teste-ligacao`).
- **o que ficou (fiação para o App, oficial/frontend):** (1) `montarGrid`: `posicionar(grade, { ..., situacao })` com `"declarada"` quando a luta abre por golpe do jogador num alvo (o alvo em `inimigos[0]`), `"emboscada"` quando é emboscada, e `"cena"` no resto; (2) criação: `concluir(equiparKitInicial(comDom({...})))` — só aí, nunca no load; (3) nada na tela do feixe: `alvoDoFeixe` já lê `chama`. **Para o `testes`:** quando (1) entrar, re-medir as sondas do MM6/MM7 com `situacao: "cena"`. Os companheiros iniciais também nascem desarmados (`companheiro-inicial.js`) — não mexi: é o equilíbrio do grupo.

## 13/10 · v9.458 · os consertos da 10.ª sessão ligados no App (`oficial`) · este commit
- **estado inicial:** HEAD `cc0770a` (v9.456), verde. O `aprendiz` na mesma árvore, fora do App (`estilo.js`, `painel-fichas`, `painel-mapa-vivo`, `painel-batalha`, `painel-golpe-final`, suítes dele, e o bump dele a v9.457 em `constantes.js`, não commitado). **Bastão `.claude/app-jsx` tomado às 02:55 («oficial s10») e devolvido às 03:22**, depois da prova viva (a última edição do App foi antes dela). Patch por `.cjs` com o `t(de, para)`.
- **1. o EM CENA (v9.455):** `contextoDoEmCena` passa `longe` (o `elencoDaCena(...).longe`, a mesma conta da linha LONGE). **2. a procura:** `sinaisDoTurno` ganha `ehProcuraDeGente` (`procuraDeGente` de procura.js, com `nucleoAgora`, `nomesConhecidos`, `pessoasDaCena`); a porta `desafio` abre-se e `adjudicarAcao` já corre `procurarAlguem` antes do catálogo — nada mais a ligar. **3. a luta aberta (verificado):** o golpe final zera `combateRef` (`notarFechoDaLuta`, ~9038) e as falas M62–M63 foram cenas, não luta; a M64 não correu a procura por falta do sinal, não por luta aberta. Não achei caminho que deixe a luta aberta depois da Vitória. **4. o ambulante:** a carroça guarda `trecho` (de>para da jornada, campo NOVO dentro de `mercado.ambulante`, ignorado pela versão antiga) e `mercadoAqui` só a mostra com a jornada aberta e o mesmo trecho — logo `bancasDaCena`, a pauta e o painel concordam. **Decisão média, com o motivo:** o filtro mora em `mercadoAqui`, e não só em `bancasDaCena`, porque o painel vender uma carroça que a pauta diz ausente seria a mesma ação com duas caras. Save antigo sem `trecho`: só na estrada.
- **5. o objeto do teste:** `ctxDesafio.objetoEmCena("armadilha")` = a sala atual da masmorra é de armadilha, não `resolvida` e sem `disparou`. **O que não soube resolver:** a armadilha dispara (e a sala fica `resolvida`) no instante em que se entra (`irParaSala`, ~22060) — hoje não há momento em que a armadilha esteja em cena e por disparar, logo o desarmar nunca rola. É o lado seguro; dar-lhe vida é regra (ver a armadilha antes de entrar), do `backend`.
- **6. o veredito do teste:** a linha do veredito diz o risco (`Teste de Atletismo · dif. 15 — escalar · falhar é cair 9 m: até 18 PV · +7`) e, à direita dela, por cima do dado, o Recuo da casa (`VerboComPreco papel="recuo"`, a forma de `formas.md` § recusar o teste de dado) com `escolha.desistir`. O toque consome a rolagem (a mesma guarda por identidade de `concluirRolagem`), fecha o teste sem rolar e manda a frase ao Mestre como cena: nenhuma tentativa, nenhum desfecho, nenhum tempo cobrado. Fora da batalha só.
- **7. o sono escrito:** antes da cascata de portas, `descansoDaFrase(acao, { emCombate })` → `acampar({ calado: true })` e `descansoLongo()` / `sairDoAcampamento("curto")`, o caminho do botão. **Decisão média, com o motivo:** `acampar` ganhou `calado` — o sítio vai na nota do turno em vez de chamar o Mestre, porque o caminho do botão eram DUAS chamadas seguidas (o sítio e o fim do descanso) a correr juntas. A frase do jogador sobe na nota (`[O QUE EU ESCREVI]`). Com gente para a fogueira, abre a roda (como o botão) e a nota espera a chamada seguinte.
- **testes:** `teste-v6-compositor` — a linha do veredito ganhou o segmento do risco entre o teste e o modificador; a asserção prende a ordem nova, com o motivo escrito. Endereços re-medidos pelo diff contra `cc0770a`: `acoes-do-jogador.mjs` 125 com prefixo (nenhum em linha mudada) e os nus à mão (`:14508→:14512`, `:14656→:14660`, `12809→12813`), `check-acoes-do-jogador` (pushMsgs 9218→9222), `teste-acoes-do-jogador` (16254→16281, 14656→14660), cada um com o degrau escrito.
- **prova:** `npm run build` limpo; `npm test` **A=0, 340/340 + 16/16** na árvore (com o trabalho do `aprendiz`) e em `so-o-meu.sh` com os meus cinco arquivos. **Viva:** o dev-server recarregava a página a cada gravação do `aprendiz` (`estilo.js` → *page reload*), e a criação de personagem caía no menu; parei-o e servi o build por `vite preview` (o mesmo proxy de `/api`), uma aba. localStorage anotado antes (só `taverna_cfg_golpe_final`=perguntar e `taverna_cfg_rolagens`=1). Campanha de teste «Prova S10», Hilda; o Narrador respondeu. «Estou desarmada, então olho a praça…» → nenhum teste. «Procuro Neirin, o vendedor de ervas.» → *Neirin está em O Pregão das Três Luas, em Ponto da Fonte — 9,7 km ao norte, 8 h* (linha e envelope `PROCURA`). «Escalo a muralha…» → a linha com o risco e «Não era isso»; o toque fechou o teste, o campo voltou («Pode ir escrevendo…»), a frase foi ao Mestre sem `[TESTE`, `tentativas` vazio. «Pago os dois cobres…» → bolsa **15 → 13**, `−2`. «…e durmo até o amanhecer.» → a fogueira abriu (três à roda), «Dormir já» → **dia 1 08:10 → dia 2 07:00**, uma chamada só, com a frase na nota. Em Ponto da Fonte, uma frase que nomeia o Cedric (registo: Nova do Norte) → a prosa nomeia-o e **nenhuma ficha dele**; o EM CENA da pauta sem ele e a linha LONGE com ele. «Pergunto à mulher de avental onde posso encontrar o Cedric.» → a procura respondeu (Serpente Rouca, 8 h ao sul). Zero erros na consola, sem `LimiteErro`. No fim, jogo desmontado (aba numa imagem estática), apaguei só `taverna_save_v1`; as duas chaves conferidas iguais. Aba fechada, servidor parado.
- **o que a prova viva achou (para o `backend`):** (a) quem a espinha põe noutra cidade e o registo ainda não tem (o **Neirin**, em Ponto da Fonte) entrou no EM CENA e nas fichas de Nova do Norte quando a prosa o nomeou («Neirin está em…») — o `longe` só lê o registo; (b) uma ficha **«Serpente · sozinha»** acompanhou o herói de Nova do Norte a Ponto da Fonte (parece a Serpente Rouca lida como gente); (c) `QUEM CARREGA Neirin (é fato: entra nesta resposta, dito por ele)` numa pauta em que o Neirin está a 8 h; (d) com o sono escrito, o envelope do sítio («a partir de agora é uma pausa segura…») e o do fim do descanso («o mundo VOLTA a correr») vão na mesma chamada — lidos em ordem, contam a noite; se o Mestre os achar contraditórios, `envelopeDoSitio` precisa de uma forma «já dormido».
- **VERSAO:** o `aprendiz` tinha v9.457 por commitar; esta leva **v9.458** (o maior +1), e o bump dele fica por cima disto no próximo commit dele.

## 13/10 · v9.456 · a frente da MÃO da 10.ª sessão: o que se paga sai, a estrada tem destino, o estado não rola dado, o sono escrito dorme (`backend`) · este commit
- **estado inicial:** HEAD v9.454 + o trabalho não commitado do outro `backend` (a frente da CENA: `em-cena`, `procura`, `npcs`, `nucleo`, `turno`), que não toquei. Sem bastão: nenhum `.jsx` tocado.
- **1. o dinheiro (`cobranca.js`):** as travas da frase do jogador (pergunta, condição, oferta, negação) passam a ler só a oração do verbo de pagar (`ORACAO_DO_PAGAMENTO`; fronteira = pontuação, conjunções, e o "e" antes de outro verbo do herói — nunca o de "vinte e três" nem o de "conto … e pago"); a condição que é oração própria vale para a frase inteira ("Pago dois cobres, se ele quiser" não paga). A recusa da cena só conta na oração em que o dinheiro está, ou por pronome numa frase que o nomeia (`RECUSA_DA_CENA`). "Pago a dívida de Perrin: vinte e três moedas" entra (`PAGAR_COM_DOIS_PONTOS`, só 1.ª pessoa). **As seis frases da sessão: 0, 0, 23, 23, 23, 0 → 2, 23, 23, 23, 23, 23** (as 25 moedas da M6 e da M45). A prosa do Narrador continua lida pela frase inteira.
- **2. a estrada (`rastro.js`, `viagem.js`, `mapa-vivo.js`):** **decisão média, com o motivo:** a direção sozinha deixa de abrir estrada (`PARTIDA_SEM_DESTINO.abre = false`, reversível numa linha) — é a 3.ª sessão que a estrada sem destino custa (a 3.ª: 13 h; a 8.ª: 720 min; a 10.ª: 4 h + "Partir 0 h" morto). "Sigo com Saoirse para o sul, até o Rossio Torto" → nada (era: jornada Nova Profundo → "", +4 h). "Sigo para o sul" sem nome cai no destino por descrição (o resolver tenta os cardeais) ou no aviso de destino não reconhecido, que não move ninguém. A jornada sem destino de um save fecha JÁ na cidade de onde saiu, com o andado como trecho (`JORNADA_SEM_DESTINO.espera = false`). Nenhum nó do mapa fica a "0 h" (`horasDaBase` ≤ 0 → null). **Cinco asserções antigas mudaram de lado** (`teste-rastro`, `teste-mm-c0`, `teste-mm14-lugar`, `teste-nave-destino`, `teste-sessao-8-lugar` ×3), cada uma com o motivo escrito; o hash de `teste-marcha-unica` (v1:mapaVivo) devolve o 0 só à base antes de medir e bate com o antigo — prova de que foi a única mudança.
- **3. o teste que ninguém pediu (`desafios.js`):** o `desarmar` deixa de ser a raiz "desarm": pede o verbo com o objeto ("desarmo a armadilha", "tento desativar o mecanismo") **e** uma armadilha conhecida em cena (`precisaDe`, `OBJETO_DO_TESTE`, `ctx.objetoEmCena(tipo)`; sem ela o desafio não concorre). O estado sai da frase antes do catálogo (`ESTADO_NAO_E_ACAO`: "estou desarmada", "estou cansado", "sou cuidadosa"; o gerúndio fica). Todo teste devolve `escolha` (`escolhaDoTeste`, `ESCOLHA_DO_TESTE`): "Rolar o dado" / "Não era isso", e o risco em pele pela mesma tabela que o cobra ("falhar fere: até 12 PV", "falhar é cair 4 m: até 6 PV"). **M65 → nenhum teste** (era: dif. 18, −11 PV). Três suítes antigas passaram a medir o desarmar diante da armadilha, com o motivo.
- **4. o sono (`descanso.js`):** `descansoDaFrase(texto, { emCombate })` → `{ tipo: "longo"|"curto", ate }` ou null, pela peneira da casa (`DESCANSO_DA_FRASE`). "…e durmo até o amanhecer" → longo; "durmo um pouco" → curto; pergunta, negação, fingir, "deixo X dormir", "antes de dormir", fala e luta → null.
- **suíte:** `teste-sessao-10-mao.mjs` (79; **35 falham na árvore de v9.454**, provado por `git archive HEAD src`). `npm run build` limpo; `npm test` 339/339 + 16/16.
- **para o `frontend` (App.jsx — sem isto, o 3 e o 4 não chegam inteiros ao jogo):** (1) `ctxDesafio` (~19587): `objetoEmCena: (tipo) => { try { return tipo === "armadilha" && <a sala atual da masmorra é tipo "armadilha" e não disparou>; } catch { return false; } }` — sem isto o desarmar nunca rola (o lado seguro). (2) `rolarDesafio`/o painel do dado: mostrar `v.escolha.risco` junto da dificuldade e um segundo botão `v.escolha.desistir` que fecha o teste **sem rolar**, devolve o campo de escrever e manda a frase ao Mestre como cena (sem `ultimoDesfecho`/tentativa registada). (3) no despachante, antes das portas de movimento: `const d = descansoDaFrase(acao, { emCombate: !!combateRef.current })`; se `d`, `acampar()` e depois `d.tipo === "longo" ? descansoLongo() : sairDoAcampamento("curto")` (o mesmo caminho do botão: um longo por dia, o abrigo, o relógio ao amanhecer), com a frase a subir ao Mestre — dentro de `calou`. (4) nada a fazer na viagem: `detectarPartida` já devolve null, e `talvezChegarSozinho` já fecha a jornada sem destino pelo `jornadaSemDestino`.
- **o que ficou:** a peneira mascara "respondo que …" até ao FIM do texto (`semAFala`, peneira.js), e por isso a frase do M17 também não chega a `lugarPedido` — fora desta frente, anotado aqui. O aviso de mantimentos no cartão do mapa (o preço antes do clique) é da tela.

## 13/10 · v9.455 · a frente da CENA da 10.ª sessão: o EM CENA nasce do lugar, a procura chega à pessoa, o registo não guarda a heroína (`backend`) · este commit
- **estado inicial:** HEAD v9.454 + o trabalho não commitado do outro `backend` (dinheiro, viagem, teste, sono — `cobranca`, `rastro`, `desafios`, `descanso`, `viagem`, `mapa-vivo`), que não toquei. Sem bastão: nenhum `.jsx` tocado.
- **a medida de partida, nas pautas reais:** 9 das 78 pautas enviadas listavam em EM CENA alguém que a própria pauta punha em LONGE (M19, M21, M49, M51–M53, M55–M57). Refeitas com o motor de antes (o simulador lê `registo-s10-cena.json`): 15 na linha e 14 nas fichas. A causa não era o registo (`presentes` já vinha certo): era o **núcleo citado pelo primeiro nome** (o "Nyla" do Mestre trazia a Punho-de-Pedra, que o núcleo põe em Nova Profundo e o registo em Monte Rasa, e a Pé-Leve, outra pessoa do núcleo) e a **prosa que só nomeia** ("Nyla Punho-de-Pedra não está aqui. Saiu…").
- **conserto 1, `em-cena.js` (`EM_CENA_DO_LUGAR`):** (a) `ctx.longe` — quem lá está não entra na lista (nem à vista, nem para a frase, nem como ficha; o grupo nunca); (b) o primeiro nome partilhado é de quem o sistema sabe mais (grupo › registo/longe › núcleo), e empatado no topo ninguém o leva; (c) menção não é presença: o nome na fala de outra pessoa, depois de "por/de/sobre" ou num aposto não põe ninguém à frente; o registo pede ainda verbo de cena ou o nome como sujeito; (d) a memória (`antes`) guarda o sítio onde viu (`onde`) e não muda de sítio com o herói; (e) os ofícios da casa dos papéis e os povos (`arquivista`, `tiefling`, …) entram em `APRESENTADO_NA_PROSA`. **Depois: 0 de 78 na linha, 0 de 78 nas fichas, ninguém de LONGE na lista.** O arquivista (M37) e o ferreiro tiefling (M66) ganham ficha.
- **conserto 2, a procura (`procura.js`, `nucleo.js`, `turno.js`):** a procura de gente mora na porta do desafio e a porta só abria quando o CATÁLOGO via um desafio — "Procuro Nyla Punho-de-Pedra" (Códice, M26), "procuro meu antigo companheiro de armas" (M22) e "onde posso encontrá-la" (M64) nunca chegavam a `procurarAlguem`. Novo sinal `ehProcuraDeGente` (porta `desafio`) e `procuraDeGente(texto, { nucleo, nomes, perto })`. `papelProcurado` lê só a frase com o verbo da procura e nunca a coisa procurada (M38 achava a Helga entre os papéis — o falso "ESTÁ AQUI"); o soldado ganhou `["antig","companheir"]` e `["serv","comigo"]`. `nomeProcurado`: quem OUVE a pergunta perde para outro nome dito (`naoOuve` à frente do placar; sozinho continua a ser ele — a J7 da MM14 segue verde). **Decisão média, com o motivo:** a regra do ouvinte entrou como chave do placar e não como exclusão, porque a MM14 provou de propósito que "Pergunto à Rosalina: …" procura a Rosalina.
- **conserto 3, o registo (`npcs.js`, `POSTO_E_OFICIO`, `ehOficioDaCasa`):** "Sargenta Barbaforte" (o posto antigo + o sobrenome da heroína) é a heroína e não entra; "Taverneiro da Fivela & o Trigo" (ofício + partícula + casa) é descrição — vira o Perrin quando ele é o único taverneiro na cena, senão fica sem ficha até ter nome. Um nome que já está no registo assim continua (o save antigo não perde nada).
- **os 5 fios do Mestre (o item 4):** a Nyla no Rossio — **fecha** (a lista do lugar); a Helga "vista com o Varek" (M64) — **fecha** com a procura (a resposta é "em Monte Rasa, 25 km a sudeste"), depois da fiação; o papel entre os tomos (M38) — a lista não o fecha (é invenção do Mestre), mas o falso "Helga ESTÁ AQUI" desse turno sai; a banca da chave (M16) — **não fecha**: é o ambulante que `bancasDaCena` (App) continua a dar depois da estrada; "Perrin foi para a ferraria" — **não fecha** (prosa sobre quem está longe; a linha LONGE já o dizia).
- **suíte:** `teste-cena-do-lugar.mjs` (58) — a sessão refeita pauta a pauta, os casos um a um, as procuras com as frases reais, o registo. Na árvore de antes falha em 20+ asserções (provado num worktree de HEAD, já removido). `npm run build` limpo. `npm test` na árvore: 339/340 — o vermelho é `teste-marcha-unica` (`v1:mapaVivo`), do `mapa-vivo.js` em voo do outro `backend`; `bash mente/so-o-meu.sh` com os meus oito caminhos: **339/339 suítes e 16/16 varredores, A=0**. Não consertei o vizinho.
- **para o `frontend` (App.jsx — sem isto, o conserto 1 e o 2 não chegam ao jogo):** (1) `contextoDoEmCena` (~7315): `longe: vale("EM CENA · quem está longe", () => elencoDaCena(npcsRef.current, cidadeAtualRef.current, mapaRef.current, { comGrupo: p0.grupo || [], masmorra: mm }).longe || [], [])`. (2) `sinaisDoTurno` (~15993): `ehProcuraDeGente: ler(() => procuraDeGente(acao, { nucleo: nucleoAgora(), nomes: nomesConhecidos(), perto: pessoasDaCena() }))` (importar `procuraDeGente` de procura.js). (3) a ver: `procurarAlguem` sai cedo com `combateRef.current` — se a luta de M56–M63 ainda estava aberta em M64, a procura não correria nem com o sinal. (4) `bancasDaCena` (~24568): o ambulante só enquanto a jornada do trecho dele está aberta — é a chave da banca inventada de M16.

## 13/10 · v9.453 · o companheiro ganha povo, e o Brannoc ganha pintura (`backend`) · este commit
- **estado inicial:** HEAD v9.452, verde. Pedido do coordenador, a partir do achado (a) do `oficial` na v9.450: o companheiro nascia `{ nome, classe }` sem `raca`, `retratoDe` exige raça para gente com classe, e o Brannoc ficava desenhado ao lado do herói pintado. Sem bastão: nenhum `.jsx` tocado.
- **o povo (`src/companheiros.js`):** `racaDeCompanheiro(comp)` — o que a ficha já diz ganha (forma do catálogo: «anã» → Anão por `RACA_DO_REGISTO`; povo fora do catálogo, como «sintético», fica a palavra do registo e a pintura recusa); sem nada, a semente (`sementeDe`, a mesma do rosto e da variante) sobre `RACAS_DO_COMPANHEIRO`. `garantirFichaCompanheiro` põe `raca` só onde falta — logo os saves antigos a derivam no load (`migrarPersonagem` já o chama) como campo NOVO, e nenhum campo que existia é reescrito. Invocação e quem declara `especie` não ganham povo (o lobo do domador tem classe de molde e viraria um humano pintado).
- **decisão média, com o motivo:** a tabela do povo é a MESMA demografia com que o mundo povoa as cidades (`RACAS_POR_GENERO` de nomes.js: humano, elfo, anão com peso 2; halfling, meio-orc, tiefling, gnomo, draconato com 1; sem Meio-elfo nem Goliath, que o mundo também não sorteia). Um companheiro sorteado é tão provável de ser anão quanto o ferreiro da praça. Medido em 2000 nomes: 91 % ganham pintura hoje (os outros caem em células ainda por pintar — Gnomo sem ser mago, etc. — e ficam desenhados, como o manifesto promete).
- **o companheiro inicial (`src/companheiro-inicial.js`):** a ficha do grupo leva a `raca` da pessoa do elenco (o registo, que o Narrador já lê na lista da cidade) e o `genero` dela (o mesmo que a abertura e o NPC do registo usam). **Decisão média:** sem o `genero`, o sexo do rosto — pintado e desenhado — saía do sorteio de `feicoes` e podia desmentir o «ele/ela» da abertura. `teste-companheiro-inicial` afrouxou a régua «nenhuma chave a mais que o convidado» numa chave só, `genero`, com o motivo escrito ao lado; a `raca` não precisou (o convidado também a ganha no load).
- **o elenco/núcleo:** vilão, elo e voz não têm `classe` em parte nenhuma (nucleo.js, vilao.js, elenco.js) — continuam desenhados até haver matrizes de ofício (F3 dos retratos, à espera de créditos). Nada a fazer.
- **suítes:** `teste-retratos` §5 (17 novas: Brannoc cru null → pela ficha não-null; mesma semente, mesma raça; save antigo deriva a mesma no load; o que existe não se reescreve; lixo; invocação e espécie sem povo); `teste-companheiro-inicial` (+3: o género do registo, a raça do catálogo, o sexo da pintura).
- **para o `frontend` (opcional, App.jsx):** (1) `fichaDeCompanheiro` (~24289) monta o recrutado sem passar por `garantirFichaCompanheiro` — ele só ganha classe e povo no próximo load. Embrulhar o retorno em `garantirFichaCompanheiro(...)` e passar `genero: fichaElenco && fichaElenco.genero || ""` dá-lhe a pintura no mesmo turno e o sexo do registo. (2) saves antigos: o companheiro inicial de antes de hoje não tem `genero` na ficha do grupo; no load, `{ ...g, genero: g.genero || generoNoRegisto(g.nome) }` (a partir de `npcsRef`) acertaria o sexo do rosto com o registo — muda a cara de quem já joga, logo é decisão de tela.

## 13/10 00:25 · v9.450 · os pendentes das v9.445–v9.448 ligados no App e no mapa vivo (`oficial`) · este commit
- **estado inicial:** HEAD `24c893e` (v9.448), verde. O `backend` na mesma árvore em `src/retratos.js` e `public/retratos/` (subiu `b5c1140`, v9.449, durante o ciclo — nenhum arquivo em comum além deste diário). **Bastão `.claude/app-jsx` tomado às 23:55 («oficial pendentes») e devolvido às 00:20**, logo depois da prova viva (a última edição do `App.jsx` foi antes dela).
- **1. o paradeiro do Cronista (e):** `fichaDoCronista(n, existente, { cidade, mapa: mapaRef.current })`, com `cidade` vazia na estrada (`jornadaRef`) e numa masmorra aberta (`!encerrada`), senão `cidadeAtualRef`. Dentro do mesmo `calou`.
- **2. fichas e ofertas numa linha na janela baixa:** as `<Oferta>` montam-se uma vez (`ofertasDoPe`); com fichas E ofertas E `alturaDaJanela < FICHAS.baixaAltura`, vão em `ofertas` da `FileiraAVista` e a `<Soleira>` não se desenha. **Decisão média:** o `LimiteDasFichas` ganhou `reserva` — se a fileira estoura na linha só, a soleira de sempre volta no lugar dela (as fichas podem calar; o que o mundo oferece, não). O cartão do coração continua entre a fileira e a soleira; na linha só fica por baixo das ofertas.
- **3. os nomes tocados em seguida:** `tocarFicha` monta o texto por `juntarNomeNoCampo(atual, pos, nome, tq.nomes)`, e o registo do toque guarda `nomes` (o 1.º toque, o verbo do cartão e a página do Códice registam o nome da sua ficha). **Decisão média, sem a qual o item não funcionava:** a regra de antes trocava a frase INTEIRA quando o campo era igual ao último toque — e depois de uma menção o campo É igual ao toque, logo o 2.º nome apagava a frase do jogador. O toque que pôs um nome marca-se `mencao` e não conta como «frase de ficha intacta» (§2: com texto do jogador no campo, entra só o nome). E o cursor do toque guarda-se (`cursor` de `juntarNomeNoCampo`): o input controlado manda o cursor ao fim quando o valor muda, e o nome seguinte sairia do sítio.
- **4. o mapa vivo com os dados novos (f):** «no gelo» já vinha de `no.bioma` (o `aprendiz` deixou-o pronto). «o gelo sobe um degrau»: `motivoEmTexto` põe em palavras `veredito.motivoDoPerigo` (ou o `perigoMotivo` da aresta única) quando `subiu` — a tela não refaz a régua (a suíte prova que o painel não lê `kmDiaDoChaoDuro` nem `TERRENO_VIAGEM`); o plural concorda («as colinas sobem»). «chega às 13:12»: no App, `chegadaDaViagem(dadosMapaVivo, { jornada: jornadaRef.current, ritmo: fichaViva().ritmoViagem })` num memo em `calou` (null = sem hora), passado como `chegada` à faixa e à tela grande; aparece no alvo da faixa («faltam 4 h · chega às 16:00»), em «onde você está» («…; você chega às 16:00.») e no verbo impedido («Você já está na estrada · faltam 4 h · você chega às 16:00»). O contrato no topo de `painel-mapa-vivo.jsx` cresceu com a prop.
- **testes:** `teste-pendentes-ligados.mjs` nova (27): os quatro fios presos no sítio, `motivoEmTexto` e `chegadaEmTexto` corridos em Node, e a sequência «Aceno para » + três toques. **Asserções movidas, com o motivo escrito ao lado:** `teste-narrador-so-narra-e3-fiacao` (a chamada do Cronista aceita o 3.º argumento), `teste-painel-mapa-vivo` (o contrato com `chegada`), `teste-r3-campo-do-turno` (as ofertas montadas em `ofertasDoPe`), `teste-v5-pagina` (duas etiquetas `<Soleira` exclusivas — a de sempre com `!numaLinha` e a `reserva` — e nunca duas na tela). **Endereços re-medidos** pelos hunks do diff contra `24c893e`: 147 com prefixo (`acoes-do-jogador.mjs` 142, `check-` 2, `teste-` 3) e os nus à mão (`9214→9218`, `:14498→:14508`, `:14646→:14656`, `16244→16254`), cada um com o degrau escrito.
- **prova:** `npm run build` limpo; `npm test` **A=0, 338/338 + 16/16**. **Viva** (dev-server, uma aba; localStorage anotado antes — só `taverna_cfg_golpe_final` = «perguntar» e `taverna_cfg_rolagens` = «1»; campanha de teste «Prova dos Pendentes», herói Brann, humano guerreiro; o Narrador respondeu): a tela grande diz de Muralha Quebrada de Prata Podre «forte · no gelo» e «a estrada: perigo médio · o gelo sobe um degrau»; partir para Torre clara (8 h) deixou a jornada em curso às 12:00 e a faixa disse «faltam 4 h · chega às 16:00», a coluna e o verbo impedido idem — e **o turno seguinte chegou às 16:00** (minuto 960), a hora prometida. A 800×451, a oferta «Seguir para Torre clara» e as quatro fichas na MESMA linha (y 301, a oferta à esquerda, as fichas a rolar de lado), uma região de oferta só. «Aceno para » + Guarda + Carroceiro → «Aceno para Guarda da espada e Carroceiro»; + Magnus → «…Guarda da espada, Carroceiro e Magnus»; o foco ficou na ficha. **O retrato pintado** (`humano-m-guerreiro-1.webp`) no chip do cabeçalho (32 px) e na ficha da Gestão (64 px). Zero erros na consola, sem `LimiteErro`. No fim, com o jogo desmontado (no menu), apaguei só `taverna_save_v1`; as duas chaves de antes conferidas iguais. Aba fechada, servidor parado. Fotos em `pendentes/1…6` no scratchpad do oficial.
- **o que não soube / para quem:** (a) **`backend`:** o companheiro inicial é `{ nome, classe: "Caçador" }` SEM `raca`, e `retratoDe` exige raça para gente com classe — Brannoc fica com o rosto desenhado no grupo e no cabeçalho; e as pessoas das fichas (guarda, carroceiro, Magnus) não têm classe nem ofício+raça, logo nenhuma ficha de gente se pintou nesta prova. Não decidi dar raça a ninguém (é regra). Fera pintada numa ficha não se viu viva: nenhuma criatura entrou em cena. (b) **o paradeiro (e) vivo ficou inconclusivo:** Magnus ficou «Nova das Águias», mas não sei distinguir o carimbo novo do local que o Cronista já dava; a fiação está presa pela suíte, a conta pela do `backend`. (c) **`desenho`:** com vários nomes tocados, a linha do veredito diz só o último («Magnus») e o contorno rosa fica na primeira ficha — o §2 não diz o que mostrar com uma lista; e os nomes entram sem artigo («Aceno para Guarda da espada»), porque o nome da ficha não o traz. (d) na primeira tentativa, um clique num ícone da faixa a 1280 (logo depois de mudar a janela) levou ao menu em vez de abrir a tela grande; não se repetiu nas seguintes, não achei a causa — pode ser o clique por coordenada do painel a cair no cabeçalho durante o redimensionar.

---

## 13/10 · v9.449 · os retratos com as medidas reais dos rostos, cortados de novo (`backend`) · este commit
- **estado inicial:** HEAD `24c893e` (v9.448). O `oficial` com o bastão do `App.jsx` desde 23:55 (pendentes) — não toquei `App.jsx`, `painel-*.jsx`, `rosto.jsx`, nem o dev-server.
- **1. A tabela é a medida:** `RETRATOS` (`src/retratos.js`) passa a ter o `cx`/`olhos` de `mente/figma/retratos-medidos.json` (144 pela malha do MediaPipe, 38 à régua) — **161 das 182 entradas mudaram**, média 0,013 no `cx` e 0,011 nos olhos, máx. 0,04 (o Goblin: cx 0,49 → 0,45; no chip de 32 px eram 3,2 px de rosto torto). O cabeçalho do manifesto diz agora que os valores são medidos e que mudar um pede corte novo.
- **2. O corte de novo:** a ferramenta do `aprendiz` (`mente/figma/corte/`), apertada pelo Edge sem interface via protocolo de depuração (um script no scratchpad; o Edge fecha no fim). **182 WebP, 1 654 KB no todo (1 693 622 B), 9,1 KB de média, 5,1–13,4 KB**; `cortados.json` reescrito pela própria ferramenta, e `teste-rosto-pintado` (o elo corte ↔ tabela) 29/29.
- **3. As matrizes fora do scratchpad:** as 182 PNG 1024 copiadas para **`mente/figma/matrizes/<arquivo>.png` (243 MB)**, no `.gitignore`. `lista.mjs` procura lá sem argumento; `lista.json` regenerado aponta para lá. Um corte futuro não depende mais de uma sessão viva (o original continua no Figma, página 08).
- **testes:** `teste-retratos` 45/45 (+1: as 182 entradas têm o valor medido — vermelho no HEAD, 161 fora); duas asserções movidas com o motivo escrito (os três olhos fora da faixa: Ogro 0,32 · Quimera 0,46 · Dragão Ancião 0,47; o chip do Lobo à mão, topo −17,6 → −19,2), e a do olhar do chip lê o Lobo da tabela em vez de literal.
- **a prova:** build limpo. `npm test` na árvore: A=1 — 333/337 + `check-acoes-do-jogador`, **todos do `App.jsx`/`painel-mapa-vivo.jsx` do `oficial` em voo** (endereços do App deslocados, `teste-narrador-so-narra-e3-fiacao`, `teste-r3-campo-do-turno`, `teste-v5-pagina`, `teste-painel-mapa-vivo`). `so-o-meu.sh` com HEAD + os meus 189 caminhos: **16/16 varredores, 336/337 suítes**; a única, `teste-painel-fichas`, cai também no HEAD puro extraído por `git archive` (CRLF, `juntarNomeNoCampo is not defined`) e passa na árvore — artefato da extração, não meu.
- **decisões médias:** rebalancear números numa tabela existente, com catraca provando (a nova asserção do valor medido e o elo `cortados.json`).
- **o que ficou:** o push espera o `oficial` fechar e a árvore inteira ficar verde.

## 12/10 · v9.445 e v9.447 · a tabela dos retratos, R7, e os pendentes das provas vivas da v9.442/v9.443 (`backend`) · `dd0d3d9` + este commit
- **estado inicial:** HEAD `8ebb0ee` (v9.444), verde. O `aprendiz` na mesma árvore a exportar as pinturas e a trocar `rosto.jsx` (não toquei `App.jsx`, `rosto.jsx`, `painel-*.jsx`, `estilo.js`, `public/`). Um `teste-taro` vermelho no meio era o `rosto.jsx` dele em curso: `so-o-meu.sh` com HEAD + os meus 9 arquivos deu 336/336 + 16/16.
- **1. `src/retratos.js` (v9.445, `dd0d3d9`, commitado logo para o `aprendiz`):** `RETRATOS` = 182 entradas (as 18 feras de `CRIATURAS_FANTASIA` + os 164 heróis de §13), `retratoDe(ente, { semente, apresentacao, fixo })`, `recorteDoRetrato(entrada, lado)`, `tamanhoDoRetrato`, a tabela `RETRATO` (recortes 0,40/0,62/0,88; limiares 40/100) e `SINAIS_DE_GENTE`. O sexo sai de `feicoes` (a mesma conta do rosto desenhado — 200/200 de acordo); espécie pelo nome mais longo e por palavra inteira (Hobgoblin ≠ Goblin); pessoa sem classe nunca vira bicho. **R7:** `completarInimigo` acha a base pelo nome mais longo — Lobo Atroz luta comum/3 (era fraco/1); as 27 bases varridas. `teste-retratos.mjs` (44). `retratos.js` entrou em AGUARDANDO de `teste-ligacao` à espera do `rosto.jsx` do `aprendiz`.
- **2. os pendentes (v9.447 — a v9.446 ficou para o `aprendiz`, que a tinha na árvore por commitar; `teste-pendentes-da-prova-viva.mjs`, 47):**
  - (a) **«Conheceram-se no dia 0»** → `fichas.js`: quem tem `conhecidoEm: 0` lembra «Conhecem-se há N anos» pelo `desde` CRU do laço (`garantirLaco` põe 0 e daria um ano falso), «há um ano», ou «de antes da estrada».
  - (b) **o guarda, a mulher das enguias e o mercador de mulas** → `em-cena.js`, `apresentadosNaProsa` + `APRESENTADO_NA_PROSA`: cabeça de gente ou ofício logo depois de «um/uma» (ou número), com uma palavra de complemento (a segunda é quase sempre o verbo: «enguias grita»). Cala com comparação/negação, aposto de nome conhecido («Freya, uma mulher…»), cabeça-adjectivo («um velho barco»), e quando alguém à vista já tem a cabeça no papel ou na arma. Teto 3 por turno. Entram na lista como `deOnde: "prosa"`, à vista, e a frase acha-os.
  - (c) **12:05 contra 12:00:** divergência, não atraso. As seis portas de viagem saem de `agirInterno` em `interceptarMovimento`, ANTES de `extraTempo = avancarMinutos(MINUTOS_POR_TURNO)`: o turno que viaja nunca pagou os 5 min, e o veredito somava-os. **Decisão média:** uma conta só, a do que se cobra — `VEREDITO_DA_PARTIDA.minutosDoTurno: 0`; a asserção de `teste-veredito-da-partida` que só via a linha existir passou a provar a ORDEM no App (movida, com o motivo escrito).
  - (d) **«Vila clara → Vila clara»** → `viagem.js`: `origemDaViagem` (o `de`; se igual ao destino, a primeira escala do percurso; senão nada) e `ROTULO_DA_ROTA` — «de volta a Vila clara» na linha e na pauta.
  - (e) **o paradeiro «cidade»** → `npcs.js`: `fichaDoCronista(pessoa, existente, { cidade, mapa })` — local que não nomeia cidade do mapa ganha a cidade onde o herói está («cidade» → «Vau Seco»; «a taverna do Pato» → «…, Vau Seco»; vazio → a cidade), e a ficha velha repara-se quando volta a ser vista. Quem a ficha põe longe (`PARADEIRO.fora`) não se carimba. Sem `ctx`, ou `cidade: ""`, como antes.
  - (f) **o mapa vivo:** `nos[].bioma` (P1, o chão do nó; o clímax escondido nem chega à lista); `perigoDaEstradaComMotivo` = a régua das arestas numa função só, que `dadosDoMapaVivo` e `vereditoDaPartida` chamam — `arestas[].perigoMotivo` e `veredito.motivoDoPerigo` = `{ ponta, chao, subiu }` (a cor refeita bate em 456/456 arestas e 80/80 vereditos; o hash v1 de `teste-marcha-unica` tira os dois campos novos e fica igual — prova de que a régua não mudou); `chegadaDaViagem(dados, { jornada, ritmo })` em `partida.js` — a hora de chegada da viagem em curso, pelo laço de `viajar`. **P4 (rios) não feito:** é médio e toca a pauta (uma linha por `SECOES` quando o herói está perto), não cabe sem crescer — fica no pedido.
- **prova:** `npm run build` limpo; `npm test` A=0, 337/337 + 16/16.
- **para o `frontend`/`oficial` (a fiação):** (e) `App.jsx` ~11748: `fichaDoCronista(n, chave ? reg[chave] : null, { cidade: (jornadaRef.current || masmorra aberta) ? "" : cidadeAtualRef.current, mapa: mapaRef.current })` — sem isto o defeito (e) continua no jogo. (f) o painel (`painel-mapa-vivo.jsx`): «no gelo» de `no.bioma`; «o gelo sobe um degrau» de `aresta.perigoMotivo`/`veredito.motivoDoPerigo` (`subiu && chao`); «chega às 13:12» de `chegadaDaViagem(dados, { jornada: jornadaRef.current, ritmo: personagem.ritmoViagem })` no memo do veredito (`calou`), com `null` = não dizer hora. (a)–(d) não pedem fiação.
- **para o `aprendiz` (retratos):** `import { retratoDe, recorteDoRetrato, RETRATO } from "./retratos.js"`; `retratoDe(ente, { semente, apresentacao, fixo })` → `{ chave, arquivo: "/retratos/especie/lobo.webp" | "/retratos/gente/anao-f-clerigo-1.webp", cx, olhos }` ou `null`; `recorteDoRetrato(r, lado)` → `{ tamanho, largura, esquerda, topo }` em px (a `<img>` com essa largura e esse `left`/`top` dentro do disco `overflow:hidden`). Quando o `rosto.jsx` o importar, sai a entrada de AGUARDANDO. Se `retratos-medidos.json` corrigir `cx`/`olhos`, é mudar números em `FERAS`/`HEROIS` — a suíte não fixa os valores, salvo os três extremos de §11 (Ogro, Quimera, Dragão Ancião).

## 12/10 21:51 · v9.443 · MM17 · o mapa vivo ligado no App: a faixa do rumo e a tela grande (`oficial`) · este commit
- **estado inicial:** HEAD `f058d3a` (v9.442), 334/334 + 16/16. O `desenho` só no Figma; eu o único em `src/` e com dev-server. **Bastão `.claude/app-jsx` tomado às 21:29 ("oficial mapa") e devolvido às 21:51**, logo depois da última edição do `App.jsx`.
- **o que o jogador vê:** com região (toda campanha nova de Uma Vida), o topo do papel ganha, por baixo do cabeçalho e fora da área que rola, **a faixa do rumo** (96 px na mesa, 48 no telefone): os oito rumos, o horizonte, os lugares, e a frente com nome e horas (vivo: «O que sobrou de Gelo Fundo · 4 h de estrada»). Tocar um ícone abre **a tela grande** com o cartão daquele lugar (2 toques); `M` e a aba **Mapa** (trilho, fita do alforje, a porta que a linha do sistema anuncia) abrem-na também; `Esc`, `M` e o × fecham. O cartão mostra o preço antes do clique («Partir para O que sobrou de Gelo Fundo · 4 h de estrada · você chega às 12:05 · sem noite ao relento») e partir viaja. Sem região (saves de antes da MM17), nada muda: sem faixa, e a aba Mapa é o pergaminho de sempre.
- **a fiação:** `dadosDoMapaVivo` memorizado pelos estados que mexem no mapa (mapa, lugar, masmorra, jornada, dia, minuto, base, cidade, etapa) e lido dos refs, dentro de `calou` — estoura, dá null, e null é o continente. O estado do veredito num segundo memo (o mesmo retrato + `mapa`, `ritmo` = `ritmoViagem` da ficha viva, `acordouAbs`, `ficha`, `correio`, `governos`, `nemesis`), para a faixa não se refazer a cada turno em que só a ficha mudou. A faixa e a tela dentro de `LimiteDoMapa` (novo, como `LimiteDasFichas`: cala-se em null; a tela fecha-se). **A aba Mapa** é interceptada no próprio `setAba` (o estado passou a `setAbaCrua`; a função que abre chega por ref do render): uma porta só, para nenhuma das três continuar a abrir o pergaminho. **`M`** num ouvinte de `window`: nunca com foco em campo de texto, modificador, repetição, na luta, nem com `defaultPrevented` (a tecla que a tela usou para fechar não a reabre). **Partir** chama as portas que já existem: povoado/base → `viajarPeloMapa` (o mesmo do pergaminho); lugar da região → `partirOTurno("Vou a X.")`, a frase que `idaAMasmorra` lê — **a mesma que `teste-veredito-da-partida.mjs` prova par a par contra o preço do cartão** — e o turno parte como se o jogador a tivesse escrito: uma resposta do Mestre, e o preço visto é o pago.
- **testes:** `teste-ligacao` — `mapa-vivo.js` e `partida.js` saíram de AGUARDANDO (comentário com o porquê). `teste-a1-relato` (B6) prende `trilhoAVista` colado a `estadoDaPorta`: o bloco do mapa mudou-se para depois dos dois, sem tocar na asserção. `check-acoes-do-jogador`: 95 endereços andaram +25 (os imports, o `LimiteDoMapa` e o `setAba`, ACIMA) — 128 com prefixo pelo remedir do diff contra `f058d3a`, os nus à mão (`:14473→:14498`, `:14621→:14646`, `9189→9214`, `16219→16244`), cada um com o motivo escrito.
- **prova:** `npm run build` limpo; `npm test` **A=0, 334/334 + 16/16**. **Viva** (dev-server, uma aba; localStorage anotado antes — só `taverna_cfg_golpe_final` = "perguntar" e `taverna_cfg_rolagens` = "1"; campanha de teste «Prova do Mapa», o Narrador respondeu): faixa a 1280×912 em 133–229, frente com nome e horas; tocar «O que sobrou de Gelo Fundo» abriu a tela com o cartão dele e o foco nela; `Esc` fechou, `m` abriu, `m` fechou (sem reabrir), a aba Mapa abriu a tela e não o pergaminho; **Partir** → «Fim da estrada: depois de 0,5 dias de marcha e 17 km, você está diante do que sobrou de Gelo Fundo», `lugar` = a boca, relógio 08:00 → 12:00. À chegada nasceu uma luta (um zumbi): a tela de batalha substituiu a página, e a faixa com ela. Zero erros na consola. **Fotos** (Edge sem cabeça pelo protocolo de depuração, num perfil descartável, outra campanha de teste, apagado inteiro no fim) no scratchpad, `capturas/1…6`: mesa, Baixa e telefone, faixa e tela grande. No fim, com o jogo desmontado (aba numa rota sem App), apaguei só `taverna_save_v1`; as duas chaves de antes conferidas iguais. Aba fechada, servidor parado.
- **a soleira, medida (o pedido do regente):** a 800×451, com a faixa e as fichas presentes (Cobra, Aelith; 56 px), **a prosa fica com 69 px — 2 linhas** (Spectral 20/27). Sem a faixa: 165 px, **6 linhas**. Mesa 1280×912: 531 px, 19 linhas; telefone 467×860 (faixa de 48): 547 px, 20 linhas. **Abaixo das ~5 linhas na Baixa: é do `desenho` decidir** (recolher a faixa abaixo de uma altura, usar a de 48 na Baixa, ou nada). Não inventei a forma.
- **decisões médias tomadas:** (1) partir para um lugar ESCREVE a frase em vez de chamar `irAoLugarPeloMapa` — esse é para os sítios dentro da cidade (`moverParaLocal`, 5 minutos), e a boca de uma masmorra a horas daqui abre pela ida de `idaAMasmorra`; a frase é a que a suíte do veredito prova contra o preço; (2) a faixa fica também com a fogueira aberta (a roda é uma noite num sítio, e o horizonte é o mesmo) — reversível numa linha.
- **o que não soube / ficou:** (a) o cartão disse «chega às 12:05» e o relógio do save ficou em 12:00 — não sei se os 5 minutos são o turno que o veredito soma e o laço de `viajar` ainda não tinha cobrado quando li, ou uma divergência; a luta nasceu na chegada e não segui; (b) `recolhida` em combate não se viu viva: na luta a tela de batalha toma a página inteira, e só um convite recusado deixaria a página com a luta — não o provoquei; (c) a faixa corta o nome do rumo na borda («EIRAS QUEBRADAS») — é o panorama a dar a volta, do painel, não da fiação; (d) a tela não devolve o foco ao que estava antes de abrir.

## 12/10 · v9.442 · F2b · F2c · F2d · as fichas, o cartão e a memória com rosto, ligados no App (`oficial`) · este commit
- **estado inicial:** HEAD `7a890f3` (v9.440); durante o ciclo o `aprendiz` subiu `7c39f4c` (v9.441, o mapa vivo, fora do App — nenhum arquivo em comum). **Bastão `.claude/app-jsx` tomado às 20:25 ("oficial fichas") e devolvido às 21:15**, logo depois da última edição do `App.jsx`.
- **o que o jogador vê:** no pé da página, por cima da soleira, até quatro fichas do que está à vista (na ordem da prosa; 0 px sem elas). Toque escreve a frase no campo (editável, não manda, não foca o campo); com texto do jogador no campo, entra só o nome no cursor. Segundo toque abre o cartão (Mesa 376 por cima da ficha; Baixa < 560 de alto toma a página em duas colunas; telefone, folha fixa num portal ao `body`, z 30). Verbo do cartão troca a frase e fecha. Por cima do campo, a linha do veredito: quem a frase aponta e o preço (◉ 66; «◉ 77 · faltam ◉ 43»; «é crime aqui» vai no verbo). No Códex, a sub **Lembranças N** com as páginas de quem/o que teve o cartão aberto; o verbo da página («Procuro X», «Vou até X») escreve a frase com o id e fecha o painel.
- **a fiação:** `fichasDaCena` com o contexto pedido (bolsa, grupo, npcs, vistos do `elencoSaveRef`, núcleo, coração, dia, memória, e o crime com os MESMOS `crimeCtx`/`mundoCtx` de `declararAgressao`), num `calou` por fonte. O estado `{ id, ids, texto, ficha, verbo }` ao lado de `entrada` (nunca no save); parte com o turno em `agirInterno` (depois da trava e da foto do início) para `toqueDoEnvioRef`. `alvoDoEnvio` → `quemNoEnvio`: o golpe (`declararAgressao`), a compra à banca (`bancasDoToque` + `lembrarCompra`) e a procura (`procuraNaMemoria` → `procurarPessoa({ daMemoria })`). Save: `memoria` (depois de `aliados`); load `garantirMemoriaDoSave(sv.memoria)`; campanha nova zera (capítulo novo guarda, como o registo); **a sala não a recebe** (sai na mesma desestruturação de `elenco` e `lei` — o protocolo não cresce). `LimiteDasFichas` (cala-se com null, chave por resposta) em volta da fileira e do veredito.
- **decisões médias:** (1) **as fichas não se montam em `pautaDoTurno`** como pedia o briefing: aquela lista é lida ANTES da resposta, e a fileira apontaria a cena de antes (a ordem da prosa da fala velha, e o bicho que a resposta trouxe a faltar). Montam-se com a lista refeita quando chega a fala do Mestre (a chave é a última fala), com a última frase do jogador — o mesmo `contextoDoEmCena`, ids deterministas, e a lista que o jogador viu entra no envio se a refeita não tiver a ficha tocada. (2) **A bolsa não é chave** — medido vivo: com ela, a compra tocada (que fecha antes do Narrador) trocava a fileira no meio da espera; o impedido acerta na resposta seguinte. (3) `ids` no toque (a menção do §2: «ataco o rato e grito para Oren» leva os dois). (4) A Baixa com oferta empilha (fichas por cima da soleira), não «numa linha só, a oferta primeiro, rola de lado» do §1 — o painel não tem esse modo; é dívida para o `aprendiz`/`desenho`. (5) Toquei `src/painel-codex.jsx` (território do `aprendiz`, que estava no mapa): a sub Lembranças com `Ficha` e `CartaoDaFicha` do painel, sem peça nova (§9: «sem uma linha nova de forma»). (6) A altura da janela mede-se também ao montar — medido vivo: uma janela que muda durante o carregamento não dispara resize, e o cartão abria como Mesa a 451.
- **testes:** `teste-ligacao`: `fichas.js` sai de AGUARDANDO. `teste-fichas` +1: `FICHAS.max` (tela) === `FICHAS_NA_FILEIRA.max` (motor), a catraca que o `backend` deixou pendente. **Asserções movidas, com o motivo escrito ao lado:** `teste-em-cena` (a agressão lê por `alvoDoEnvio`), `teste-sessao-9-bolsa` (as bancas passam por `bancasDoToque`), `teste-soleira-verbos` (zero px sem soleira, coração **e fichas**), `teste-v5-pagina` (a fileira antes do coração e da soleira, uma soleira só), `teste-mm10-crime`/`teste-mm8e-promocao`/`teste-sala` (a desestruturação da sala tira também `memoria`). **Endereços re-medidos** pelo diff contra o HEAD: `acoes-do-jogador.mjs` (125 números nas strings de código, nenhum em linha mudada; ondeSai :14347→:14473, :14495→:14621), `check-acoes-do-jogador` (pushMsgs 9064→9189) e `teste-acoes-do-jogador` (4 âncoras) — todos com o degrau escrito.
- **prova viva** (dev-server, uma aba; localStorage anotado antes — só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens`; campanha de teste «Prova das Fichas»; o Narrador respondeu, sem 429): na abertura a fileira mostra Freya (150×48); toque → «Falo com Freya», contorno rosa, campo sem foco, veredito «Freya»; segundo toque → cartão 376×409 com o foco nele; tecla 2 → «Peço ajuda a Freya» e fecha; «Aceno para » + toque → «Aceno para Freya». Turno ao mercado: durante a espera ficou Freya, na resposta trocou para Isen, Ondine, Ingrid, O Pátio Mudo. «Pergunto pelo Tônico Revigorante» (bolsa 100 por `/moedas`) → **duas fichas, ◉ 73 (O Sino Amargo) e ◉ 66 (O Martelo de Ferro)**; tocar a de 66, abrir, tecla 1 → «Compro o tônico revigorante», veredito «Tônico Revigorante · ◉ 66»; enviado: **bolsa 100 → 34**, a de 66 saiu do estoque, o Narrador narrou «sessenta e seis». Save com `memoria` (Freya; Tônico com `compras: [{ dia: 1, preco: 66 }]`); recarregado pela HMR, o load devolveu as fichas e o Códex. Códex → Lembranças 2 → Freya («Vista pela última vez em Porto valente, no dia 1») → Procurar → «Procuro Freya» no campo, painel fechado. 800×451: o cartão de Isen toma a página (664×269, `row`), «Atacar · é crime aqui». 467×860: folha no `body`, fixa, z 30, 0–467, fundo a 673 (o campo a 701). Zero erros na consola. No fim, com o jogo desmontado (no menu), apaguei só `taverna_save_v1` e `taverna_rascunho_historia`; aba fechada, servidor parado.
- **prova:** `npm run build` limpo; `npm test` na árvore: 334/334 suítes, 16/16 varredores (A=0; o `check-formas` vermelho do meio do ciclo era o `estilo.js` do `aprendiz` em curso — `so-o-meu.sh` com HEAD + os meus 14 arquivos deu 333/333 + 16/16).
- **o que não soube / para quem:** (a) **`backend`:** a companheira inicial lembra «Conheceram-se no dia 0» — o dia 0 não existe para o jogador; (b) **`backend`:** na abertura, o guarda que pede o nome, a mulher das enguias e o mercador de mulas não viraram fichas (só Freya) — a leitura da prosa da F2a talvez peça «armado»/nome; (c) **`desenho`:** a menção encadeia mal quando o campo já tem uma frase de ficha editada («Procuro Freya Ondine Isen o Silencioso») — o §2 não diz o que fazer com várias menções sem verbo; (d) a animação `tvCartaoEntra` fica parada em `translateY(4)` com o painel oculto (documento `hidden`) — artefacto do painel, não visto num ecrã visível; (e) as fotos do painel a 1280×912 saem minúsculas (o painel escala a vista emulada) — as medidas acima são do DOM.

## 12/10 · v9.439 · F2b · F2c · F2d · as fichas, o cartão e a memória com rosto, o motor (`backend`) · este commit
- **estado inicial:** HEAD `82b6e2c` (v9.438). Na árvore, de outros: `mente/agora.json`, `mente/figma/` e o trabalho do `aprendiz` em curso (`src/painel-fichas.jsx`, `src/estilo.js`, `src/ui.jsx`) — não toquei, não vão neste commit. **Não toquei o `App.jsx`.**
- **o que nasceu:** `src/fichas.js`. `fichaParaTela(item, ctx)` dá, de cada coisa da lista da F2a, a ficha e o cartão: `{ id, tipo, peca, nome, linha, retrato, frase, sabe, lembra, pista, verbos[{ id, verbo, frase, preco, tom, impedido, veredito? }] }`. A compra leva o preço do ESTOQUE e o impedido diz quanto falta; o golpe numa pessoa leva o veredito de `veredictoDoCrime` (o mesmo texto do cartão de confirmação; «é crime aqui», `semVolta`); quem anda com o herói rompe-se, sem volta; o grupo não tem «atacar». A `pista` diz que HÁ um segredo quando uma pista do núcleo já foi vista (`coracao.arcos[nome].pistas`) e ele não caiu — nunca qual. `lembra`: o último dia visto antes de hoje (`elenco.vistos`), o dia em que se conheceram, o laço (a dívida), o pedido do arco, as compras. `fichasDaCena` dá as quatro do pé na ordem da última fala do Mestre. Tudo por tabela: `FRASE_DO_TOQUE`, `VERBOS_DA_FICHA`, `PRECO_NA_TELA`, `SABE_NA_TELA`, `LEMBRA_NA_TELA`, `PISTA_DO_SEGREDO`, `GENERO_DA_PALAVRA`, `LUGAR_COM_ARTIGO`, `FICHAS_NA_FILEIRA` (4 · 3 verbos · 5 sabe · 4 lembra).
- **o id no envio:** `quemNoEnvio({ id | ids, texto }, lista, memoria)` — a ficha tocada vem à frente (`pelo: "toque"`) enquanto a frase ainda a nomeia (lida só contra ela, dá o `faz`); nome apagado ou trocado → leitura livre de `quemNaFrase`, sem adivinhar. `bancasDoToque` reduz as bancas à entrada do estoque tocada: com duas bancas de Ataduras (◉ 29 e ◉ 35), fecha a tocada, e só ela.
- **F2d:** campo de save NOVO `memoria` (`garantirMemoriaDoSave`, versão 1, 80 páginas, 5 sabidas, 5 compras; sai a mais antiga, e na mesma idade a coisa antes da gente). `lembrarFicha` ao abrir o cartão, `lembrarCompra` ao fechar uma compra tocada, `paginaDoCodice`/`paginasDoCodice` com a forma da ficha (o verbo é «Procuro X» / «Vou até X»), `procuraNaMemoria` → `procura.js#procurarPessoa` ganhou `ctx.daMemoria`: só responde ao «ninguém» (o registo ganha sempre). «Procuro Oren» em Vau de Pedra: antes «ninguém»; agora «Oren Trançado está em Buraco Norte — 7,8 km a sudoeste, 8 h de marcha».
- **acerto de passagem:** `em-cena.js` dizia «onde estás» → `EM_CENA_TRATO.ondeEsta` («onde você está»). A catraca do trato em `teste-em-cena` passa a ver o verbo na 2.ª pessoa (estás, és, tens…) e a varredura dos 120 mundos ganhou lugar, saída e perto — na árvore de antes, cai.
- **testes:** `teste-fichas.mjs`, 89 asserções: as ataduras ◉ 29 com bolsa 93 e 20 (faltam ◉ 9), os ratos («Ataco o rato gigante da frente», «abre a luta contra os três»), Oren com segredo meio descoberto (a pista sim, o segredo e a revelação em campo nenhum), o guarda (veredito idêntico ao de crime.js), a Ursa e a Freya da 8.ª, «procuro Oren» fora de cena, a ordem da prosa, o id que cai quando o nome sai, memória (teto, imutável, lixo, ida e volta), e 540 fichas e páginas de 24 mundos sem id, «ficha», «segredo», «desconhecido», molde por encher nem tu/teu. `teste-ligacao`: `fichas.js` em AGUARDANDO até o `oficial` o importar.
- **decisões médias:** (1) sem o contexto do crime o preço do golpe numa pessoa **cala** em vez de dizer «abre a luta» — um preço que não se sabe não se escreve; (2) o lugar onde o herói está e quem anda com ele vão para o fim da fileira — estão sempre lá, e o pé tem quatro; (3) a memória responde só ao «ninguém» do mundo, para nunca contradizer o registo.
- **prova:** `npm run build` limpo. `npm test` na árvore: A=1 — `teste-painel-fogueira` («a altura do verbo é ALVOS.piso») e `check-formas` D5h.2 (◉ de fonte em `painel-fichas.jsx` e `ui.jsx`): **os dois são do `aprendiz`, em curso, não meus**. `bash mente/so-o-meu.sh` com HEAD + os meus seis arquivos: **A=0, 332/332 + 16/16.**
- **o que ficou:** a fiação (`oficial`); o `jogo` assinar `FRASE_DO_TOQUE` e os verbos; `FICHAS.max` da folha de estilo e `FICHAS_NA_FILEIRA.max` são o mesmo 4 — uma catraca que os ligue quando o painel subir.

## 12/10 · v9.438 · F2a · o "já dito" da EM CENA lê o texto, não a pauta (`backend`) · este commit
- **estado inicial:** HEAD `8f9b2ff` (v9.437); só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. App.jsx não tocado.
- **o defeito:** `pautaComEmCena` tirava da linha EM CENA quem a QUEM É / QUEM CARREGA / PERGUNTOU já nomeavam lendo a PAUTA. A QUEM É corta a 2,485, depois da EM CENA (2,477): numa pauta cheia caía no teto e a pessoa sumia das duas — na abertura viva, o companheiro Lucan. Medido nas 137 pautas de fora da luta da 6.ª/7.ª com uma QUEM É dele por cima: sumia em 76.
- **o conserto:** só conta como dita a linha que CHEGA ao texto (em todo turno conferido). Monta-se com as que chegavam sem a EM CENA; se alguma deixou de chegar com ela, sai do dito e monta-se de novo (o dito só encolhe, logo acaba). A montagem passou a `montarLinha` (interna, sem export).
- **testes:** 5 asserções novas em `teste-em-cena` sobre as pautas enviadas (6.ª–8.ª) com a QUEM É do companheiro por cima: onde ela não chega e a linha dele cabia sem tirar nada guardado, ele está na EM CENA (antes: some em 46/53; agora 0); onde ela chega, ele não se repete; o teto nunca passa; nenhum veto/desfecho/resposta sai; e um caso à mão. As 30 em que nem a linha sozinha cabia são do teto, não do defeito.
- **o App:** nenhuma fiação nova — a assinatura é a mesma.

## 12/10 · v9.437 · F2a · EM CENA, a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `e6edf61` (v9.436), 331 suítes verdes; só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. **Bastão** `.claude/app-jsx` tomado ("frontend F2a") para esta fiação e devolvido ao fechar.
- **a fiação:** `import { montarEmCena, pautaComEmCena, quemNaFrase }` e `emCenaRef` (ao lado de `criaturaAVistaRef`, sem save — a lista refaz-se das fontes que já se salvam). `contextoDoEmCena(frase, aqui)` é UM contexto para a pauta e para o golpe: grupo, `quemAndaComigo` (o leitor da 8.ª, agora comum — `declararAgressao` passou a chamá-lo em vez de o repetir), o registo daqui, `nucleoEmCena(nucleoAgora())`, `falasDoMestre`, a criatura à vista só no mesmo trecho, o combate, a sala atual (masmorra aberta), `bancasDaCena()`, `moedaDoMundo()`, a frase, o lugar e a lista de antes — cada fonte num calou próprio. Em `pautaDoTurno`, depois do `cederNaCena`, em `calou("EM CENA")`: monta, guarda, `pautaComEmCena`. `criaturaAVistaRef` guarda `quantos`. Em `declararAgressao`, a frase lê-se contra uma lista **refeita na hora** (a do turno passado foi montada antes da última fala do Mestre — o rato que ele acabou de pintar não estaria nela): o bicho que a oração do golpe aponta (`faz === "golpe"`) vai à frente em `conhecidas`, com o nome e a ameaça da lista.
- **o acerto no motor (permitido no briefing):** a linha dizia "Sari (contigo)" e a lista "anda contigo" / "do teu passado" — o jogo trata por você. `EM_CENA_TRATO` (tabela em `em-cena.js`): "com você", "anda com você", "do seu passado". Catraca nova em `teste-em-cena` §5: nenhum tu/teu/contigo na linha nem no `sabe`, em 120 mundos (120 linhas, 119 com o companheiro "(com você)"). **A moeda:** "marcos" na suíte é a moeda do léxico da 9.ª (`campanha.lexico.chamado.moeda`) — não é defeito; no App a palavra vem de `comoChamam(lex, "moeda")`.
- **asserções movidas, com o motivo escrito:** `teste-em-cena` (M33 "(com você)"; a asserção de espera virou seis de fiação). `teste-ligacao`: `em-cena.js` saiu de AGUARDANDO. Endereços: +48 acima de `enviar` (import +1, contexto +38, linha EM CENA +9); `acoes-do-jogador.mjs` re-medido pelo diff contra `e6edf61` (141 números nas strings de código, nenhum em linha mudada; ondeSai :14299→:14347, :14447→:14495), check (pushMsgs 9016→9064), teste-acoes-do-jogador (16039→16087, 14431→14479, 14298→14346).
- **prova:** `npm run build` limpo; `npm test` A=0, 331/331 + 16/16. **Viva, sem Narrador** (18:58 UTC, a quota ainda não voltou: 429 em tudo, como o briefing previa): campanha de teste "Prova Em Cena", três envios capturados por gancho em `fetch`. Abertura: `EM CENA   a quem não tem nome: Piotr da Torre (ele) · Mabel (ela)`. Turno "Quanto custa o elixir de destreza?": `EM CENA   Lucan (com você)` — o elixir foi para PERGUNTOU (`à venda em Alto do Sul: Elixir de Destreza ◉ 145 moedas`), e a linha não o repete; a pauta inteira 1240/1400. Sem `LimiteErro`, nenhum erro além dos 429. **localStorage:** antes só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens` (guardado em ficheiro no scratchpad); o teste criou `taverna_save_v1` e `taverna_rascunho_historia`, apagados com o jogo desmontado (aba numa rota sem App), e a leitura final é igual à de antes. Dev-server parado.
- **o que a prova viva achou (para o `backend`):** `pautaComEmCena` tira da linha quem já está noutra secção (`jaDito`) lendo a **pauta**, não o **texto** — se essa secção é cortada pelo teto (o QUEM É do companheiro, que cede antes de EM CENA), a pessoa some das duas. Reproduzido em Node: QUEM É de 500 caracteres que não cabe + Lucan no grupo → nenhuma linha EM CENA. Na abertura viva, o Lucan não entrou na linha (só os nomes). Conserto: `jaDito` a partir do que chega a `textoDaPauta`.
- **o que ficou:** a prova viva com Narrador (o rato e a frase do golpe contra a lista) quando a quota voltar; a F2b e a F2c.

## 12/10 · v9.436 · F2a · EM CENA, o motor (`backend`) · este commit
- **estado inicial:** HEAD `80153d2` (v9.435), 331 suítes verdes; só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. **Não toquei o `App.jsx`** (a fiação é do `frontend`, abaixo).
- **o que nasceu:** `src/em-cena.js` — `montarEmCena(ctx)` junta numa lista o que estava espalhado (o grupo e quem anda comigo, o registo de quem vive aqui, o núcleo em cena e o que vive na cidade, a luta, a sala, a criatura da estrada, a banca à vista, o chão, o lugar, as saídas, o que fica perto), cada coisa com id estável pela semente (FNV, nunca na tela), `aqui` (à vista agora) e `sabe` (o papel, a relação, o laço, o passado do elo; o segredo só depois de revelado; a Intuição pelo `ctx.sabe`). E o que o Mestre mostrou e ninguém registou entra uma vez, com nome, por `agressao.js#vistosNaProsa` (a mesma régua das leituras do golpe: o bicho pela raiz, a pessoa pela arma que a prosa lhe pôs na mão; "Sari segura o cajado" não arma ninguém, "uma coisa que só eu sei" não é bicho). A lista de antes (`ctx.antes`, ref do App, não vai ao save) guarda o que a prosa mostrou por 6 turnos (`EM_CENA_MEMORIA`). **Sem campo de save novo:** a lista refaz-se a cada turno das fontes que já se salvam.
- **a linha da pauta:** secção `emCena` ("EM CENA", prio 2,477, a que era dos nomes; cede na luta). `pautaComEmCena` põe a linha e **engole os NOMES À MÃO** (a linha deles vai inteira no fim — o App continua a confirmá-los por `pauta.includes(np.linha)`), não repete o que PERGUNTOU, a planta, o coração ou a ficha já dizem, e **encolhe-se até não tirar nada** (`EM_CENA_NAO_TIRA`: vetos, desfecho, resposta, fala, rumo, fecho, coração, o que volta, planta, batida, lugar, nomes). Exemplo real (9.ª, M33): `EM CENA  Sari (contigo); Rato Gigante ×2 (hostil)` — 40 caracteres.
- **a medida, nas 141 pautas enviadas da 6.ª à 8.ª:** teto nunca passa (a maior: 1376/1400 típica, 1378 pior); nada do que chegava deixa de chegar; entra em 112 de 140 fora da luta (os nomes sozinhos entravam em 75), 104 com gente, bicho ou coisa dentro; custa em média +44 caracteres ao texto, pagos pela decoração (cauda do ONDE, economia, ficha, A GENTE, DAQUI).
- **a frase contra a lista:** `quemNaFrase(frase, lista)` → `[{ id, tipo, nome, como, quantos, faz }]`, o principal à frente (a oração que golpeia, compra ou procura). Reaproveita a raiz do bicho (agressao), `nomeiaACoisa` (economia) e `papelProcurado` (procura). **Mal lidos: 0 de 10** nas frases reais (na sessão, 10 de 10): o cão sem pelo (6.ª M37 e J37, não Dário nem Nira), o homem da tocha (7.ª M20, não Tônia), o pescador de barba ruiva (7.ª M61, "sem faca" não arma), a que leva a corrente (8.ª M39, a Ursa nem aparece; M41 duas falas depois, pela lista de antes), o rato gigante da frente (9.ª M33, um dos dois), o anel e as ataduras (9.ª M43), a compra das ataduras (9.ª M44, a do estoque), o mestre de recados (9.ª M47 → Oren). E "um frasco de cura" já não é o Frasco com terra vermelha (o complemento desmente).
- **decisões médias, com o motivo:** (1) `ehProcura` (procura.js) não entra na força da oração: lê "atrás" como procurar, e "mando Tônia ficar atrás de mim" passava à frente do golpe — a régua da procura é a da tabela `ACAO_QUE_APONTA`. (2) O pronome só aponta com UM candidato à vista que não ande com o herói (o "ela" da 8.ª). (3) Na cidade, só a coisa que a frase nomeia fica à vista; a banca inteira fica na lista para a frase a achar.
- **o Narrador limitado à lista:** o parêntese de O QUE É FATO passou a "(EM CENA é o que existe e dá nome a quem não tem; o preço, em PERGUNTOU e O PREÇO)" — um caractere a menos: o prompt fixo não cresce, o teto da pauta não sobe.
- **asserções movidas, com o motivo escrito:** `teste-narrador-so-narra-e3` (a regra aponta EM CENA no lugar dos NOMES À MÃO). **Lista de espera:** `em-cena.js` em AGUARDANDO (`teste-ligacao`), até o App o importar.
- **testes:** nova `teste-em-cena.mjs` (98). `npm run build` limpo; `npm test` 331/331 + 16/16.
- **a fiação (para o `frontend`), por Grep no App:** (1) `import { montarEmCena, pautaComEmCena, quemNaFrase } from "./em-cena.js";` e `const emCenaRef = useRef(null);` ao lado de `criaturaAVistaRef`. (2) Em `pautaDoTurno`, logo DEPOIS do `cederNaCena(p, …)` (Grep `calou("cederNaCena"`), num `try/calou("EM CENA")`: `const lista = montarEmCena({ semente: sementeMundo(), turno: turnoDeRegistroRef.current + 1, cidade: cidadeAtualRef.current || "", presentes: aqui, grupo: p0.grupo || [], comigo: <os companheiros, como em declararAgressao>, emCena: <nomes de nucleoEmCena(nucleoAgora())>, nucleo: nucleoAgora(), mostrado: falasDoMestre(mensagensRef.current), encontro: <criaturaAVistaRef no mesmo trecho, com quantos>, combate: combateRef.current, sala: <a sala atual da masmorraRef>, bancas: bancasDaCena(), moeda: moedaDoMundo(), frase: acaoDoTurno, lugar: lugarRef.current, antes: emCenaRef.current }); emCenaRef.current = lista; p = pautaComEmCena(p, lista, { luta: !!combateRef.current, turno: turnoDeRegistroRef.current + 1 });` (o `aqui` é o de `elencoDaCena` no topo da função). (3) `criaturaAVistaRef` passa a guardar `quantos: inv.quantos` (Grep `criaturaAVistaRef.current = (inv`). (4) Em `declararAgressao` (Grep `a criatura à vista para a agressão`): `const alvo = quemNaFrase(acao, emCenaRef.current || [])[0]; if (alvo && alvo.tipo === "criatura" && alvo.faz === "golpe") conhecidas = [{ nome: alvo.nome, ameaca: … }]` — o bicho da lista dá o nome e a ameaça. Depois, tirar `em-cena.js` de AGUARDANDO.
- **o que ficou:** a F2b (as fichas tocáveis: o `id` já existe para o toque) e a F2c (o cartão com `sabe`). Ambição: com a lista à mão, o Cronista pode deixar de registar gente da prosa — quem não está na lista não existe; é a prova de 10 sessões que o diz.

## 12/10 · v9.435 · a 9.ª sessão: a fiação das duas frentes (`frontend`) · `80153d2`
- **estado inicial:** HEAD `7419ced` (v9.434), só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. **Bastão** `.claude/app-jsx` tomado às 11:01 ("frontend s9") para esta fiação, devolvido ao fechar.
- **A1** `contextoDoCoracao` leva `cidade` — vazia em viagem e na masmorra aberta (a porta do elo só o traz na cidade dele). **A2** `procurarAlguem`: `papelProcurado(acao, nucleoAgora())` num calou ANTES do `nomeProcurado`; o papel ganha ao nome; `porPapel: pp` no ctx de `procurarPessoa`.
- **B1** `criaturaAVistaRef` (ao lado do `mercadoRef`, sem save): o rolar da estrada guarda a criatura que não investiu (ou que o fôlego segurou), com o trecho `de>para`; `declararAgressao` passa-a a `lerAgressao` em `conhecidas`, só no mesmo trecho. **B2** `bancasDaCena()` (na cidade, as bancas; na estrada, **só a carroça do ambulante** — `mercadoAqui` em viagem ainda traz as da cidade de partida, e o preço delas na pauta seria mentira; na masmorra aberta, nenhuma) e `moedaDoMundo()`; `mercadoParaPauta(bancas, frase, { onde, moeda })`, e a moeda também no balcão e no preço comum. **B3** em `registarABolsaDaFrase`, num calou próprio: `compraNaBanca` → fecha: moedas, corpo/mochila (`VAI_AO_CORPO`, a lista que o botão do painel também passou a ler), `comprados`, `pressoes` (e o mapa, se for mapa), `salvar`, `envelopeDaCompra`; não fecha: `vetoDaCompra`; o recibo nos dois. `compraNaFrase` recebe `bancas`. Conferido: o veto vai em `naoPode` da pauta, a pauta entra em `nota`, e `aplicarResposta` recebe `envelopes: conteudo + "\n" + nota` — a cobrança vê o envelope e o "a compra não fechou".
- **asserções movidas, com o motivo escrito:** teste-mm14-perguntas (a linha do mercado e a âncora da ordem), teste-narrador-so-narra (o preço comum com a moeda), teste-comercio (`apertarProcura` em 3 pontos: botão, frase, venda), teste-mm15-nomes (o import da procura ganhou `papelProcurado`). Endereços: +12 acima de `enviar`; `acoes-do-jogador.mjs` re-medido pelo diff contra `7419ced` (146 números nas strings de código, nenhum em linha mudada), check (pushMsgs 9004→9016) e teste-acoes (16027→16039, 14435→14447, 14419→14431, 14286→14298). Fiação provada em suíte: 3 asserções em teste-sessao-9-historia, 8 em teste-sessao-9-bolsa.
- **prova:** `npm run build` limpo com o App.jsx deste commit (os builds seguintes caíram por **falta de memória da máquina** — 750 MB livres de 24 GB de commit, esbuild e node em OOM; o App.jsx só mudou antes do build limpo, depois só testes, e o esbuild transforma o App.jsx final sem erro). `npm test` A=0, 330/330, 16/16. **Prova viva não feita:** quota de IA esgotada (sem Narrador) e o dev-server morre ao subir (0xC0000409, a mesma falta de memória), duas vezes; não insisti. localStorage só lido (2 chaves de configuração, nenhum save), nada escrito, nada a restaurar.
- **o que ficou:** a prova viva do M44 (a frase compra à banca, a bolsa desce 29, as Ataduras na mochila, a narração não as credita) e do rato com ameaça, quando houver memória e quota. Em viagem o painel de Mercado ainda mostra as bancas da cidade de partida (pré-existente; a frase e a pauta já não as usam) — item de tela para o desenho.

## 12/10 · v9.434 · a 9.ª sessão: a história — o elo que vem, a voz que é só de um, o registo de gente (`backend`) · este commit
- **estado inicial:** HEAD `e7c4022` (v9.433, a frente do dinheiro, do outro `backend`). Sem prova viva (quota de IA esgotada): prova pela suíte, com o save final e a sequência real dos 42 turnos recortados em `testes/registo-s9-historia.json`. `App.jsx` não tocado.
- **1a. o elo pelo papel** (nucleo.js + procura.js): `PROCURA_DO_ELO` (tabela, um conjunto de raízes por antecedente: "mestre de recados", "recados"+"guilda", "camarada", "copista"…) e `papelProcurado(frase, nucleo)` → `{ nome, papel, cidade }`. `procurarPessoa(..., { porPapel })`: o envelope diz "Quem procuro — o mestre de recados da guilda, do meu passado — chama-se Oren Trançado (é fato…)"; quem o mundo não acha está na cidade que o núcleo lhe dá (de Rio do Rio: "noutro lugar, Buraco Norte", com rumo — antes "ninguém passou por aqui"). Na sessão, acha o Oren nas 4 perguntas pelo papel (M16, M19, M21, M47) e em mais nenhuma frase.
- **1b. a porta do elo** (subtramas.js): `PORTA_DO_ELO` — com o herói na cidade do elo (`ctx.cidade`), do turno 6 em diante e de 6 em 6 turnos sem linha dele, a batida devida do elo (pedido, pistas, revelação, enquanto a verdade não caiu) entra sem esperar que o Mestre o cite, e a linha di-lo a chegar ("vem ter com o herói"); na estreia, diz quem ele é ("o mestre de recados da guilda, do passado do herói"). Na sequência real: antes, 0 linhas do Oren em 42 turnos; agora, estreia no T6, pista A no T12, pista B no T18. Sem `ctx.cidade` o comportamento é byte a byte o de antes.
- **2. a voz só de um** (nucleo.js): `VOZ_PRESA.marcador` passou a "(voz só da " — o "criança" da Brina (14 de 48) não dizia que era só dela. O nome da voz é o primeiro, salvo quando outra pessoa à volta (núcleo, elenco, gente da cidade dela) divide o primeiro nome: aí o inteiro (`vozNome`; a Brina Pedra tinha uma Brina serviçal em Buraco Norte). **Decisão média, medida:** o nome inteiro + ", só dela" custava a voz em 28% das QUEM É e 30% das fogueiras nos 120 mundos da suíte (tetos 130/220); o "só" + nome inteiro só onde é preciso custa 7% e 9%. A asserção do marcador em teste-subtramas mudou com o motivo escrito.
- **3. o registo de gente:** (a) `nomeComDono` (npcs.js): qualquer palavra do nome do herói dita sozinha é o herói — "Tamanqueiro" deixa de virar taverneiro; (b) `mencionadosNaCena` (mundo-base.js): a gente cujo nome é o começo do de outra da mesma cidade não acorda quando a longa já está em cena ou nesta prosa — "Brina Pedra encosta na parede" acordava as duas; (c) a Kira do Vale **chegou à pauta**, na lista da gente, mas como "taverneiro(a)", e o Mestre pôs "um homem magro" ao balcão: `resumoDaqui` diz agora o ofício no género ("taverneira"; mais curto, o bloco estático não cresce). `OFICIO_NO_GENERO`/`oficioNoGenero` mudaram-se de abertura.js para nomes.js (mundo-base não pode ler da abertura, que lê dele); a abertura re-exporta. O hash `daqui` de teste-regiao-historia mudou só por isso (provado: com `p.papel` volta ao de antes, byte a byte).
- **4. o piso de turnos da espinha: não feito, anotado.** O número existe (3 batidas em 10 turnos), mas as duas que fecharam cedo fecharam pela mão do jogador (entrou na forja; encontrou a Brina) — um piso teria o sistema a ignorar o que ele fez. O que faltava ao ato 0 era a pessoa (o elo), e a porta dá-a. Medir "batidas por 10 turnos" e o elo em cena na 10.ª antes de mexer na espinha.
- **prova:** `testes/teste-sessao-9-historia.mjs` (51): 21 falham em v9.432, 0 aqui. `npm run build` limpo; `npm test` 330/330, 16/16; `so-o-meu.sh` com os meus 11 arquivos: 329/329.
- **o que ficou — a fiação (`frontend`, App.jsx):** (a) `contextoDoCoracao`: `cidade: (jornadaRef.current || masmorra aberta) ? "" : cidadeAtualRef.current`; (b) `procurarAlguem`: `const pp = papelProcurado(acao, nucleoAgora())` ANTES do `nomeProcurado`; `const nome = (pp && pp.nome) || nomeProcurado(...)`; e `porPapel: pp` no ctx de `procurarPessoa`. (c) Fora do motor: o Cronista registou a Kira com `local: "cidade"` e sem papel, e quem tem `local` que não é cidade fica "paradeiro não registrado" — presente em qualquer cidade (Tomas, Ilar e Dara "em Rio do Rio"): `elencoDaCena`, cena.js — próximo item.

## 12/10 · v9.433 · a 9.ª sessão: o golpe e o dinheiro (`backend`) · este commit
- **estado inicial:** HEAD `5f41141` (v9.432). Outro `backend` em voo no elo/tique (`nucleo.js`, `subtramas.js`, `npcs.js`, `pauta.js`, `mundo-base.js`, `procura.js`) — não tocados nem commitados aqui. Sem prova viva (quota de IA esgotada): prova pela suíte e pelos `s9/*.mjs` do registo.
- **1. o rato** (agressao.js): `NUMERO_DO_BICHO` (plural → singular escrito, fêmea → macho), a cabeça casa pela raiz; e a régua "nome não é bicho" passou a ser pela raiz — o "'Rato de esgoto…'" da fala da Sari fazia de TODO "rato" um nome. M33 → `Rato` (sem `conhecidas`) ou `Rato Gigante`/comum (com a criatura da estrada); "um dos ratos" abre um. 21 plurais novos em `cabecas`.
- **2. a frase que paga** (cobranca.js): `PREPARAR_E_PAGAR` ("conto/separo/tiro N … e pago/entrego/deixo", e "você conta N … e as deixa") e `RELATIVA_DO_PRECO` ("que ele pediu/cobrou/queria" sai antes das travas; com "não" dentro, fica). As 7 da sessão: 7 de 7 nas formas com moeda; **"escamas" num mundo de moedas continua a não pagar** (decisão: só a moeda do mundo ou a comum — moedas, pratas, ouros, cobres). A prosa do M17 ("você conta sessenta moedas… e as deixa na palma") passa a debitar 60.
- **3. a compra de graça** (cobranca.js + bolsa-da-frase.js): a causa era a COBRANÇA — "Você pega as ataduras de linho e entrega as cinco moedas" creditava as Ataduras como achado. `COMPRA_NAO_E_ACHADO`: frase em que o herói paga/compra não dá item. O item que a compra da frase já registou não volta pela narração; `COMPRA_RECUSADA_PELO_SISTEMA` ("a compra não fechou") não debita o "pago" da frase recusada (o buraco valia também para o balcão). Nova `compraNaBanca(frase, { bancas, bolsa })`: a frase que compra coisa do estoque, pelo preço do estoque; a quantia dita é teto (M44: "pago as cinco" contra ◉ 29 → não fecha, "◉ 5 não paga"). `falaDaCompra`/`envelopeDaCompra`/`vetoDaCompra` servem às duas (`PALAVRAS_DA_COMPRA`). E o "vinte e nove" dito era lido 20 — corrigido nas duas compras.
- **4. o preço da banca na pauta** (mercado.js + economia.js): `nomeiaACoisa`/`NOME_DA_COISA` (a cabeça do nome do item, antes do conector) e `APONTA_OU_COMPRA`: a coisa do estoque nomeada numa oração que pergunta, compra ou aponta sobe "à venda aqui: Anel com nome gravado por dentro ◉ 100 moedas (…), Ataduras de Linho ◉ 29 moedas (…)". `nomeDaMoeda` + opção `moeda` em `mercadoParaPauta`, `precoComumParaPauta` e `balcaoParaPauta` — contra os "marcos". "Pago" sozinho não aciona (o T15 da distância fica sem preço).
- **decisões médias:** "pouco" vale para a banca como vale para o balcão (o sistema não vende a 5 o que o estoque diz 29; com o preço agora na pauta, o Mestre diz 29); `= {}` → nulo tratado em `compraNaFrase`, `balcaoParaPauta`, `mercadoParaPauta` (estouravam com `null`).
- **prova:** `testes/teste-sessao-9-bolsa.mjs` (61): 44 falham em v9.432, 0 aqui. `npm run build` limpo; `npm test` na árvore: 328/329 — o vermelho é `teste-regiao-historia` ("daqui", hash do continente), da outra mente (`mundo-base.js`/`nucleo.js` em voo); **`bash mente/so-o-meu.sh` com os meus 6 arquivos: 329/329, 16/16.**
- **o que ficou — a fiação (`frontend`, App.jsx):** (a) `lerAgressao` recebe `conhecidas: [{ nome: enc.criatura, ameaca: enc.ameaca }]` da criatura da estrada que ficou à vista (não investiu); (b) `mercadoParaPauta` corre também na estrada quando há ambulante (`mercadoAqui.length`), com `{ onde, moeda }`; `precoComumParaPauta`/`balcaoParaPauta` com `moeda`; (c) `registarABolsaDaFrase`: `compraNaBanca(txt, { bancas: mercadoAqui, bolsa })` fora da luta e da masmorra, na cidade e na estrada — fecha → a compra do painel (moedas, mochila/equipamento, `comprados`, `pressoes`) + `envelopeDaCompra(c)`; não fecha → `vetoDaCompra(c)`; e `compraNaFrase` com `bancas: mercadoAqui`.

## 12/10 · v9.432 · três consertos da prova viva da E4 (`backend`) · este commit
- **estado inicial:** HEAD `280b86a` (v9.431), só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. `App.jsx` não tocado.
- **1. o chão da luta na estrada** (grid.js): a causa não era só a cidade de partida — durante a jornada o `local` que chega a `cenarioDe` é a linha "EM VIAGEM: … — não estou em cidade nenhuma", e a palavra "cidade" da negação casava a planta da cidade (um destino "Porto clara" casaria o convés). `PLANTA_DA_ESTRADA` (tabela): na viagem (`emViagem: true`, ou a `marca` da linha que o App já monta) os nomes da linha não contam; o chão sai do `chao` da rota (`maritima` → navio) ou do bioma (planície/colina/montanha/costa → estrada, floresta/pântano → floresta, deserto, gelo, mar → navio), senão estrada. `cenarioDe(null)` deixou de estourar. **Já vale sem fiação** (pela marca), com o bioma da cidade de partida.
- **2. o alvo do teste social** (social.js + desafios.js): `OFICIOS_DO_ALVO` (16 ofícios), `alvoDescrito(texto)` → `{ oficio, descricao }`, `quemADescricaoAponta(texto, candidatos)` → o único da cena que veste o ofício. Em `lerAcao`, a pessoa achada que a frase não nomeia e cujo papel não veste o ofício descrito sai: "Tento convencer o guarda do portão a me deixar passar." com Lysa (mercadora) na cena dá **"🎯 convencer o guarda do portão"**, `pessoa: null`, a conta da cena vazia (sem a amizade de Lysa), e a chave da tentativa sem Lysa. Nome dito vence; frase sem ofício ("convencê-la", "o homem") mantém a única da cena. **Já vale sem fiação.**
- **3. os vetos redundantes:** saiu o "NÃO envie combate_iniciar" dos quatro envelopes de luta já aberta (agressão, emboscada, a guarda do crime, a sala da masmorra) — nenhum deles traz o pedido do golpe sem alvo, logo a guarda corta sempre. **227 caracteres** poupados (715→628, 567→486, 276→247, 287→257). Quatro asserções movidas, cada uma com o motivo escrito (teste-agressao, teste-emboscada, teste-mm10-crime, teste-masmorra-fim — nesta a referência de regressão zero perde só esse trecho).
- **prova:** `testes/teste-prova-viva-e4.mjs` (46) falha em v9.431 (o chão: "no meio da praça · sob a arcada · no beco estreito"; o Porto: "navio") e passa aqui. `npm run build` limpo; `npm test` A=0, 328/328 + 16/16.
- **a fiação, para o `frontend`** (opcional, o conserto já vive): (a) em `montarGrid` (~6221), passar `emViagem: !!jornadaRef.current`, `chao: (jornadaRef.current || {}).terreno`, e como `bioma` o do trecho (`(trechoAtual(jornadaRef.current) || {}).bioma`) antes do da cidade de partida; (b) em `pessoaNaFrente` (~19328), antes do `vivos.length === 1`, `const d = quemADescricaoAponta(t, vivos); if (d) return d;` — assim o guarda REGISTADO na cena ganha mesmo com outras pessoas ao lado.
---

## 12/10 · v9.431 · o Narrador só narra, E4 — a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `35c92c3` (v9.430, não subido), só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. Bastão `.claude/app-jsx` tomado livre ("frontend E4"), devolvido depois do commit.
- **1. os imports:** `podarONarrador` (agressao.js); `investidaDaEstrada`, `envelopeDaInvestida` (encontros.js).
- **2. a guarda**, no topo de `aplicarResposta`, logo depois de `const op`: `resp = podarONarrador(resp, { envelopes: op.envelopes || "" }).resp || resp`, em `calou("a porta da luta")`. `resp` é parâmetro (reatribuível); a guarda devolve objeto novo, e tudo abaixo lê o podado — o `combate_iniciar` do Narrador só chega a `processarCombate` quando é o pedido do golpe sem alvo e o teste não passou.
- **3. a estrada que investe**, em `viajar`: **não** logo depois do `encontroComFio` como o relatório dizia, e sim depois da marcha forçada e do achado — porque `persV` nasce de `personagem` (closure) mais abaixo e é reposto com `setPersonagem(persV)`; aberta antes, a ficha que `abrirCombate` devolve (os traços da luta) seria apagada pela marcha. Molde da sala: `abrirCombate(inv.inimigos, { pers: persV })`, ficha/ref/estado, `ab.msgs` ao chat, `ab.nota` na nota, a textura de luta (como a emboscada), e `encV.detalhe = envelopeDaInvestida(inv)`. Respeita o fôlego da fuga (`folegoSegura`, origem emboscada), como a emboscada que ela substitui. Em `calou("a investida da estrada")`.
- **4. o que ainda dependia do Narrador (Grep):** `dispararPerigo` (armadilha e elemento pelo `perigo`, ~11240) fica sem porta pela prosa — o `perigo` sai sempre; a armadilha da masmorra é da sala, e em 209 respostas nenhum `perigo` foi armadilha (E4). A emboscada (`montarEmboscada`) e os seus envelopes ficam inertes, como o `backend` já anotou. O `combate_iniciar` em `aplicarResposta` (~10827) segue vivo só para o pedido. Nada de que o jogador precise ficou sem porta.
- **prova:** `npm run build` limpo; `npm test` A=0, 327/327 + 16/16. Endereços re-medidos pelo diff contra `35c92c3` (+9 a partir de ~10154, +21 a partir de ~24834): 89 nas strings de código de `acoes-do-jogador.mjs`, os dois nus do `ondeSai` à mão (:14278 -> :14287, :14426 -> :14435) e quatro literais de `teste-acoes-do-jogador` (o relógio 16018 -> 16027, 14410 -> 14419, 14277 -> 14286, 14426 -> 14435) — cada um com o motivo escrito.
- **prova viva** (campanha nova "Prova E4", Ponto do Sul, aba do preview): **(a)** "Saco a espada e ataco o guarda do portão." abriu a luta pela agressão (Guarda do portão 8/8, iniciativa, terreno) — a porta do jogador viva. **(b)** um teste de Percepção **SUCESSO 19 vs 13** com a resposta real do Narrador **acrescida do M64** por um embrulho do `fetch` só nessa chamada (`perigo` "dois lobos saltam", `combate_iniciar` 2 Lobos, `vida: -1`, `combate_inimigo_vida`): sem luta, vida 20/20, nenhum lobo na tela. **(c)** sete trechos naturais (Ponto do Sul → Monte do Sul → Porto clara → Ponto do Sul): um perigo (Esqueleto) ficou à vista, sem luta; para não gastar mais chamadas, um trecho com `Math.random` enviesado para baixo por 2,5 s (valores variados, `r^4`, restaurado — o código é o mesmo) deu **2× Goblin investem**: painel aberto com iniciativa e o envelope trocado ("o painel de combate JÁ ESTÁ ABERTO… me passe a vez"), vida 20. Sem `LimiteErro`; o console só tinha os erros velhos (conexão recusada, prova-fogueira).
- **localStorage:** antes só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1` (guardados no scratchpad). Com o jogo desmontado (aba em `/@vite/client`) apagou-se só a `taverna_save_v1` que a prova criou; as duas ficaram com os mesmos valores, por leitura (e 8 s depois, nada a recriou).
- **o que fica:** (1) **o terreno da investida** diz "no meio da praça · sob a arcada · no beco estreito" — a luta na estrada sai com o terreno da cidade de onde se partiu (a jornada não muda `cidadeAtual`); a emboscada antiga tinha o mesmo defeito. É do `backend`/terreno (o lugar da luta na jornada), vai à pauta. (2) O teste de persuasão contra o guarda leu o alvo como "convencer Lysa" (o nome da pauta, não quem está à frente) — não é deste item, anoto. (3) Os "NÃO envie combate_iniciar" dos envelopes de luta já aberta são agora redundantes com a guarda ligada — a poda é do `backend` (o relatório E4 já o diz).
---

## 12/10 · v9.430 · o Narrador só narra, E4: a luta e o dano saem do Narrador (`backend`) · este commit
- **estado inicial:** HEAD `5dc899c` (v9.429), só `mente/agora.json` na árvore (não é meu, não vai). Nenhum outro agente. `App.jsx` não tocado.
- **os usos, por script** nos três registos (209 respostas): 5 — 6.ª T42 (masmorra: o Narrador abriu um rato e mordeu), 6.ª T47 (o pedido do golpe sem alvo: abrir certo, ferir pelo `perigo` nocivo), 7.ª T60 (`null`, certo), 8.ª T24 (o zumbi da estrada investiu pelo `perigo`), 8.ª M64 (SUCESSO 21 vs 13 → dois lobos e vida −1). Zero usos de combate_inimigo_vida/atualizar/encerrar, dano_ambiental e mana; dos 4 `perigo`, nenhum foi armadilha.
- **a porta que faltava:** `investidaDaEstrada` + `INVESTIDA_DA_ESTRADA` (encontros.js) — a criatura da estrada investe por tabela (1/3, a medida das sessões 6–8; a neblina pesa), com a matilha aparada pelo orçamento; senão fica à vista e o primeiro gesto é do jogador. O encontro passa a levar `criatura`/`ameaca`/`quantos` e o detalhe já não ensina `combate_iniciar`.
- **a regra:** `podarONarrador` + `O_NARRADOR_NAO_ABRE` (agressao.js) — da resposta saem o `perigo`, `combate_iniciar` (salvo o pedido do golpe sem alvo), o dano e a ficha do inimigo, `dano_ambiental` e a vida/mana negativas; **um sucesso nunca é castigado** (`sucessoNoTurno`: nem com pedido). Os três envelopes do sim dizem "sem luta nem ferida que eu não tinha" (`SUCESSO_SEM_CASTIGO`, testes.js). O veto da luta sem painel já não manda abrir: manda parar antes do golpe. O envelope do golpe sem alvo leva o formato consigo.
- **o prompt:** saíram ABERTURA NO MESMO TURNO, o dano anterior à abertura, o BESTIÁRIO de abrir combate (e o import), DANO AMBIENTAL, o `perigo` (formato e CONDIÇÕES), o exemplo de `mudancas`, o DANO DE GOLPE, combate_atualizar/encerrar, o GD no combate_iniciar, a COBRANÇA ÚNICA da mana. **Típica 51.880 → 49.048 (−2.832); pior real 64.824 → 61.122 (−3.702); inteiro 78.019 → 74.317; pior com gente ≈ 70,2 mil.** Canais citados no texto fixo 15/20 → 0. Relatório: "E4 — medida" em `mente/narrador-so-narra.md`.
- **testes:** nova `teste-narrador-so-narra-e4.mjs` (81; falha em v9.429, o M64 é a primeira). Movidas com o motivo escrito: teste-agressao (1), teste-consequencias (2), teste-mm-c0 (1), teste-mm8c2-quem-importa (2), teste-narrador-so-narra-e2 (3), -e3 (3), teste-porta-combate (6), teste-prompt (4). `npm run build` limpo; `npm test` A=0, 327/327 + 16/16.
- **decisões médias→pesadas da Fase MM** (mudam o que o jogador vive; um commit desfaz): · **o `perigo` sai inteiro**, não restrito — o que fazia de certo (o zumbi da estrada) tem agora porta, e armadilha não houve nenhuma em 209 respostas; a da masmorra é da sala. · **o pedido do golpe sem alvo fica** ao Narrador: a luta já é do jogador, ele só nomeia o alvo, e tirá-lo faria o golpe evaporar. · **o BESTIÁRIO sai do prompt**: servia para o Narrador abrir luta com nome da base; o bicho da prosa abre pela agressão com a ameaça de gente comum. · **a cura e o `combate_encerrar` ficam aceites** (não abrem luta nem ferem; 0 usos).
- **para o `frontend` (três linhas, a fiação exata no relatório):** os imports; `resp = podarONarrador(resp, { envelopes: op.envelopes || "" }).resp` no topo de `aplicarResposta`; e a investida da estrada em `viajar` (abrirCombate + o detalhe trocado por `envelopeDaInvestida`). Sem elas o prompt já não ensina, mas a guarda dorme e a estrada nunca investe.
- **o que fica:** a masmorra não anda por palavras (só pelo botão); o golpe numa matilha abre contra um (passar o encontro à vista em `conhecidas`); a emboscada pelo `perigo` e os seus dois envelopes ficam inertes no código.

## 12/10 · v9.429 · a fiação dos consertos da 8.ª sessão (`frontend`) · este commit
- **estado inicial:** HEAD `c5142cf` (v9.428), só `mente/agora.json` na árvore (não é meu, não vai). Bastão `.claude/app-jsx` tomado livre ("frontend s8"), devolvido depois do commit.
- **1. a cobrança do ganho** (`aplicarResposta`): `oQueFaltaCreditar(resp.narrativa, resp.mudancas, { moeda, envelopes })` — a moeda do mundo é a mesma `op.moeda` (`comoChamam(lex, "moeda")`) que o débito já usa; a soma do achado à parte (`jaDoAchado`) saiu, porque o módulo já desconta a marca pelos envelopes e as duas juntas descontariam o achado duas vezes. O import de `moedasDoAchadoNoEnvelope` saiu do App (segue lido por cobranca.js e pelas suítes).
- **2. seguir viagem com destino:** `seg = detectarSeguirViagem(...)` → `viajar(jornada.para || seg.destino || "")`. Em `viajar`, quando `rotaEntre` dá nulo (a volta à cidade de onde se partiu não tem rota para si mesma), a jornada guarda `totalMin`, `dias`, `km` e `terreno` que já tinha — antes recomeçava com 3 dias e 0 km.
- **3. chegar sozinho:** `talvezChegarSozinho` lê `jornadaSemDestino(jornadaRef.current)` (em `calou`): a jornada sem destino andada até ao fim fecha na origem.
- **4. quem anda comigo:** não há no App um dado de "caminha comigo" (procurei acompanh/convid/comitiva/seguem — só a comitiva da raid, que entra no grupo). Não inventei campo de save. Ligou-se o que o sistema já sabe: o registo de pessoas com `relacao === "companheiro"`, vivo e fora do grupo → `comigo` em `lerAgressao`. O `nucleoEmCena` ficou de fora de propósito: "em cena" inclui o vilão e o elo, e marcá-los "comigo" recusaria o pronome contra quem de facto ameaça. **O que fica:** a Ursa da 8.ª sessão só entra se o Narrador a registar como companheiro; um sinal próprio de "vem comigo" é `backend` + campo novo (pauta).
- **prova:** `npm run build` limpo; `npm test` A=0, 326/326 + 16/16. A asserção da E3 que exigia a soma `jaDoAchado` no App foi reescrita com o motivo (agora prova os envelopes por nome e que a soma à parte não existe, e que o módulo desconta a marca). Endereços re-medidos pelo diff contra `c5142cf` (degraus +3 ~8563, +3 ~15452, +11 ~19943, +6 ~24741): 134 nas strings de código de `acoes-do-jogador.mjs`, os dois nus do `ondeSai`, o `pushMsgs` 9001→9004 do varredor, o relógio 16012→16018 e dois literais de `teste-acoes-do-jogador` — cada um com o motivo escrito.
- **prova viva** (campanha nova "Prova S8", Baixo das Velas): partida para Vila Clara com achado na estrada — bolsa **15 → 34** (19, uma vez só, sem crédito em dobro); chegada a Vila Clara. Depois, com o jogo desmontado, a jornada foi posta sem destino a meio (240/480 min, de Vila Clara) e "Recuso o pedido do rapaz e voltamos para Vila Clara." deu `para` = Vila clara, guardou 1 dia/20 km e chegou no turno ("Fim da estrada… você chega a Vila clara"). E uma jornada sem destino andada até ao fim (480/480, de Baixo das Velas) fechou sozinha no turno seguinte ("…você chega a Baixo das Velas"). Sem `LimiteErro`; o console só tinha erros velhos de outras sessões (conexão recusada, prova-fogueira). A linha "Vila clara → Vila clara" no progresso da volta é feia mas verdadeira — é do `backend` (linhaDaViagem), anoto aqui.
- **localStorage:** antes só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1` (guardados no scratchpad); fechei as seis abas velhas do localhost para nenhuma autosalvar por cima. Injeções e restauro com o jogo desmontado (aba em `/@vite/client`): apagou-se só a `taverna_save_v1` que a prova criou, e as duas ficaram com os mesmos valores, por leitura (8 s depois, nada a recriou).

## 12/10 · v9.428 · o ganho do mundo, o lugar que não se lê de palavras e a volta com destino (`backend`) · este commit
- **estado inicial:** HEAD `95077d9` (v9.427), só `mente/agora.json` na árvore (não é meu, não vai). Nova `teste-sessao-8-lugar.mjs` (64), frases reais do registo: **24 falham com o `src/` do HEAD**, todas passam depois. `App.jsx` não tocado.
- **1. o ganho com a moeda do mundo:** `lerGanhos`/`oQueFaltaCreditar` aceitam `{ moeda }` (a mesma `raizDaMoeda` do débito) — "Você acha 10 escamas" = 10, por extenso também; a régua antiga das moedas de sempre fica como era (algarismo) para nada que hoje não credita passar a creditar. O trecho em que o herói paga sai com as réguas da moeda do mundo ("recebe o pão e paga dez escamas" = 0). **Sem crédito em dobro:** `{ envelopes }` desconta a marca do achado (`moedasDoAchadoNoEnvelope`) dentro do módulo. M46/M11 reais: 0.
- **2. o lugar não se lê de palavras (M21–M23):** `PARTE_DO_LUGAR` (lugar.js) — poço, guarita, cela, porta, balcão, escada… são parte do lugar onde o herói está. `lerLugarDito`: com o herói num lugar, o nome dito que só casa com o pedido pela palavra de parte (o resto do nome não está no pedido nem no lugar) é ignorado (`parteDoLugar`: M21 "Poço de Silêncio"); o pedido que fala do lugar onde está sem sair nem nomear o dito também (`ficaAqui`: M22 "Alicerces de Silêncio"). `lugarPedido`: a palavra de parte não é tipo ("até a guarita" deixa de ser o posto da estrada, M23). **A procura** (`PROCURA_NAO_E_AQUI`, procura.js): a frase que vai a outro sítio antes de procurar não resolve "aqui" (M13: Nyla na taverna), e "Deixo Ursa" não procura Ursa (M8); o nome continua conhecido para a guarda do vasculhar.
- **3. a volta tem destino (M35–M69):** `VOLTA_TEM_DESTINO` + `cidadeDeOrigem` (rastro.js) — longe da cidade (a meio dia, a boca da masmorra) "viajamos de volta para Ponte Brumoso" tem destino Ponte Brumoso (era ""), e o envelope da volta já não diz "saí de X rumo a X… não me devolva para lá". Na estrada sem destino, `detectarSeguirViagem` devolve `destino` quando a frase o nomeia (M37, M43, M44). E `jornadaSemDestino` (viagem.js): andada até ao fim, fecha na cidade de onde partiu (a saída dos saves que já a têm). **Médio→pesado da Fase MM** (muda o que o jogador vive; um commit desfaz).
- **prova:** `npm run build` limpo; `npm test` A=0.
- **o que fica para o `frontend` (três linhas de fiação):** (a) a cobrança (~10422) passa `{ moeda: op.moeda, envelopes: op.envelopes }` a `oQueFaltaCreditar` e tira a soma de `jaDoAchado` (senão desconta duas vezes); (b) o "seguir viagem" (~15448) usa `seg.destino` quando a jornada não tem `para`; (c) `talvezChegarSozinho` (~8563) lê `jornadaSemDestino(jornadaRef.current)`. Sem elas: a escama não credita, e a jornada sem destino já aberta continua sem saída (a volta nova, a do M35, já nasce com destino sem fiação).

## 12/10 · v9.427 · a frase que paga debita (`frontend`, urgente) · este commit
- **o defeito (8.ª sessão, no ar em v9.425):** 6 pagamentos, 27 moedas, 0 debitadas (M6, M11, M13, M36, M46, M48). **Duas causas, não uma:** (1) o App passava a `oQueFaltaDebitar` `conteudo + nota`, sem a etiqueta `[O QUE EU FAÇO AGORA…]` que `gastoDoPedido` procurava — a etiqueta só vai em `pedidoFinal`; (2) **a moeda do mundo**: o léxico chamou-lhe "Escamas", e "Pago as dez escamas" / "Pago as oito escamas" (18 das 27) não tinham régua nem com a etiqueta — pelo caminho do tester só o M11 se provava.
- **o conserto, na origem (`cobranca.js` + uma linha de fiação):** a frase do jogador passa **por nome** (`opcoes.pedido`), lida pela mesma `lerOPedido` da escuta (só o que é do jogador; envelope `[...]` do sistema nunca paga). A etiqueta fica como recurso de quem não passa o nome. **Porquê na função e não só no App:** uma porta que depende de uma etiqueta que outro módulo escreve noutro sítio fecha-se calada no dia em que esse texto muda — foi o que aconteceu, com a suíte da E3 verde. E `opcoes.moeda` = `comoChamam(lex, "moeda")`: `raizDaMoeda` (export novo) faz da palavra do mundo a raiz com plural opcional, e as duas réguas do gasto são fabricadas por moeda (cache). Sem palavra, a régua é a de antes.
- **não paga duas vezes:** o mesmo pagamento dito pelo jogador e pelo Narrador conta o maior dos dois (J49/J51: "Você paga as dez escamas" + "Pago as dez escamas" = 10); o nome vence a etiqueta (não somam); `JA_PAGO_PELO_SISTEMA` (a compra da frase, o balcão, o mapa, a venda) continua a fechar a porta; o campo antigo `moedas` negativo desconta. O crédito (o achado da estrada) não foi tocado.
- **as seis, pelo registo real (`registo-s8.jsonl`, frase + narração de cada chamada):** antes 0/0/0/0/0/0; agora M6 "Pago duas moedas ao guarda…" **−2** · M11 "Pago os quatro cobres." **−4** · M13 "…deixo uma gorjeta de uma moeda…" **−1** · M36 "Compro um pão para Ursa. Pago os dois cobres." **−2** · M46 "Pago as dez escamas…" **−10** · M48 "Pago as oito escamas…" **−8** = **27**. Nenhuma das seis era oferta nem condição. Varridas as **49 frases do jogador** da sessão: só estas seis debitam (a pergunta do preço do M5 não).
- **prova:** `teste-frase-que-paga.mjs` (33; com o `cobranca.js` do HEAD as seis dão 0 e a suíte nem importa). A asserção da E3 que dizia "a frase chega pelos envelopes" passava e mentia — reescrita com o motivo, e a nova prova `pedido: pedidoDaBolsa`. Endereços de `acoes-do-jogador.mjs` re-medidos pelo diff (+9 a partir de ~13035; 96 nas strings de código, os nus do `ondeSai` e dois literais de `teste-acoes-do-jogador` à mão). `npm run build` limpo; `npm test` A=0, 325/325 + 16/16; `so-o-meu.sh` com HEAD + os seis arquivos, verde.
- **prova viva:** campanha nova pela tela (Pedra Profundo), "compro uma caneca… Quanto é?" ("Duas de cobre") → "Pago os dois cobres.": a bolsa **15 → 13** na tela e no save, a linha `−2`, e o Narrador também narrou "joga os dois cobres" — desceu 2, não 4. O léxico ainda não tinha renomeado a moeda nesse mundo; a escama está provada na suíte com as frases reais. **localStorage:** antes só `taverna_cfg_golpe_final=perguntar` e `taverna_cfg_rolagens=1` (guardados no scratchpad); com o jogo desmontado (aba fora do app) apagou-se só a `taverna_save_v1` que a prova criou, e as duas ficaram com os mesmos valores, por leitura (e 8 s depois, nada a recriou).
- **bastão `.claude/app-jsx`:** tomado às 05:36 (livre) para estas duas linhas de fiação; devolvido ao fechar, depois do commit.
- **o que fica:** o **crédito** pela narração (`lerGanhos`) também não conhece a moeda do mundo ("você acha 10 escamas" não entra) — mesmo remédio, mas é `backend` e muda o que entra na bolsa: vai à pauta, não a este conserto. E o pedido do `backend` (passar `comigo` a `lerAgressao` em `declararAgressao`) não foi feito aqui — não é deste item.

## 12/10 · v9.426 · os consertos de motor da 8.ª sessão (`backend`) · este commit
- **estado inicial:** HEAD `309c6b0` (v9.425); o `frontend` a consertar o pagamento ao mesmo tempo (`App.jsx`, `cobranca.js` e as suítes dele — não tocados, não vão no commit). Nova `teste-sessao-8.mjs` (57) com o registo recortado em `registo-s8-pauta.json`: **28 falham no HEAD**, todas passam depois.
- **1. a revelação não cede à pergunta (M59–M61):** `FICA_NA_PERGUNTA` (pauta.js) — numa pergunta, a linha do coração que é fato ("é fato: entra nesta resposta") fica; a escolha cede; a cauda do ONDE dá-lhe lugar; e se nem assim a resposta coubesse, o fato cede como na C2. Pautas reais: a revelação entra no M59 e no M61 (1356 e 1362 de 1400), sai só o "comporta:"; nas 500 semeadas a resposta nunca sai e o fato entra em 396 (eram 0). **Médio** (rebalanceio de tabela existente, com catraca); a asserção da C2 em teste-subtramas mudou, com o motivo escrito.
- **2. o golpe na companheira (M39–M42):** a causa provada é outra que a da transcrição — "Ursa" é cabeça de bicho e nome do banco; o "ela" da frase foi ao único bicho da última resposta, que era a palavra "Ursa". `NOME_NAO_E_BICHO` (maiúscula sem artigo, ou nome de gente, não é bicho); `armadoDescrito` ("a que leva a corrente" → "Sombra da corrente", a pessoa armada que o Mestre mostrou); o recuo (`NAO_E_AGRESSAO` "recuo": "foi engano", "eu queria atacar", "peço desculpa" não reabrem); e `comigo` em `lerAgressao` + `VEREDITO_DE_QUEM_ANDA_COMIGO` (crime.js): quem anda comigo só é alvo pelo nome, e com o cartão antes, mesmo fora da cidade. **Médio→pesado da Fase MM** (muda o que o jogador vive; um commit desfaz).
- **3. as muletas, com número:** o fecho `silencio` mandava à letra "fica calado à espera", o 1.º dos `TIQUES_PROIBIDOS` (que não chegavam ao Narrador por canal nenhum): 14 de 17 respostas com muleta; o `pergunta` 10 de 15; os outros 14 de 38. A "desconversa" da E3 não é a causa (6 respostas esquivas, 3 com muleta). O `silencio` passa a "deixa uma fala a meio", a `pergunta` acaba nela, e os dois levam `VETO_DO_GESTO` (149/145 caracteres, eram 121/131; teto intocado). A prosa curta (106) está dentro dos 60–140 do prompt — não se forçou comprimento.
- **4.** `{"total":8}` sai da fala (`JSON_NA_PROSA`, json.js — o modelo imitou o canal; nada no pedido o mostrava); o "rito não abre: você ainda não despertou" vinha de `gd: 0` lido como deus (`e.gd != null`) e de dizer a quem não despertou porquê — `identificarDivindadeAbatida` cala as duas.
- **o que fica para o `frontend`:** passar `comigo` a `lerAgressao` em `declararAgressao` (App.jsx ~19934) — sem isso, a regra do cartão de quem anda comigo dorme (os pontos 1, 3, 4 e o M39 já valem sem App).

## 12/10 · v9.425 · o nome com epíteto é a mesma pessoa (`backend`) · este commit
- **o defeito da prova viva de v9.424, com teste que falhava (13 de 28 no HEAD):** o Cronista registou "Ivarr" ao lado de "Ivarr o Exilado" — `nomeComDono` só comparava o primeiro nome com quem a história persegue. Agora o nome curto e o mesmo primeiro nome com epíteto (tabela nova `EPITETO`: artigo/partícula logo depois do nome, a vírgula, o composto com hífen) são a mesma ficha quando ela é a **única** portadora do primeiro nome (registo, quem importa, conhecidos, grupo) e `contraODono` não os separa (sexo, ofício, lugar, paradeiro); separados, o figurante novo nasce. Dois Ivarr não se fundem; "Ivarr Mendes" (sobrenome sem marca) nasce próprio; MM15 intacta. Nova `teste-nome-com-epiteto.mjs` (28). `App.jsx` não tocado.

## 12/10 · v9.424 · o Narrador só narra, E3: a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `5e9a925` (v9.423), suítes verdes; só `mente/agora.json` na árvore (não é meu, não foi no commit). **Bastão** `.claude/app-jsx` tomado 03:42 ("frontend E3") para as três pontas abaixo, devolvido ao fim do commit.
- **o gênero das pessoas (a perda da E3):** o esquema do Cronista ganhou `"genero":"ele|ela"` e a SEÇÃO pessoas diz como ler (pronome, artigo, senhor/senhora; sem saber, `""`, nunca chute). `fichaDoCronista` (npcs.js) passa a ficha a `homem`/`mulher` — a forma que o registo, os NOMES À MÃO e a fogueira já usam — e **não reescreve** quem já tem gênero (a troca da 6.ª e da 7.ª era exatamente uma leitura errada a vencer). A linha das PESSOAS CONHECIDAS que vai ao Narrador já o levava. De passagem: o líder de um bando de decreto recebia `genero: mundo.genero` ("Fantasia medieval") — passou a vazio.
- **o envelope do trecho de estrada:** com destino na jornada (`para`), já não ensina `cidade_atual` nem `jornada_meio`: "aproxime-me… a chegada é do sistema", e no último trecho "a chegada vem no envelope do sistema". A estrada até à boca de masmorra deixou de citar o campo. **Sem destino, fica como estava** — é a única porta de chegada por palavras (`detectarSeguirViagem` não lê o destino da frase); quando ler, o ramo sem destino pode sair.
- **o achado da estrada:** o ◉ entra na bolsa no rolar (`viajar`, antes do envio, linha de sistema sem emoji: o teto do D5h não sobe); o detalhe (encontros.js) diz "já na bolsa (creditadas pelo sistema)" e a cobrança lê essa marca nos envelopes (`moedasDoAchadoNoEnvelope`) e conta-a como declarada — senão "você acha 12 moedas" pagava duas vezes. O "via moedas" saiu: a espera com data da suíte da E3 esvaziou.
- **testes:** nova `teste-narrador-so-narra-e3-fiacao.mjs` (38; falha no HEAD). **Asserções movidas, com o motivo escrito:** `teste-narrador-so-narra-e3` (a espera → sem espera), `teste-mm14-gente` (2), `teste-mm8c1-tetos`, `teste-mm15-nomes` (o `n` → `nF`, o import com mais um nome); `acoes-do-jogador` 89 endereços re-medidos pelo diff (+6/+12/+26/+34), os dois nus do `ondeSai` à mão, e 3 em `teste-acoes-do-jogador`. `npm run build` limpo; `npm test` 322/322 + 16/16.
- **prova viva** (aba nova; o localStorage tinha só `taverna_cfg_golpe_final` e `taverna_cfg_rolagens`, guardados em arquivo antes): campanha de teste, no Sino dos Andarilhos o Cronista devolveu `"genero":"ele"` para Ivarr (registado `homem`, papel taverneiro) e `"genero":"ela"` para Astrid (já registada `mulher` pelos NOMES À MÃO, mantida). Viagem a Baixo do Vigia: a cidade mudou pelo sistema ("Fim da estrada… você chega"), com o Narrador a devolver `mudancas: null`. Console sem erro, sem `LimiteErro`. Ao fim, jogo desmontado: `taverna_save_v1` (criado por mim) apagado, as duas chaves de antes conferidas iguais. O achado não saiu no sorteio (16%); fica provado na suíte.
- **decisões médias tomadas:** · **o gênero não se reescreve** — a correção de um gênero errado já registado fica para a mão (o painel), não para o Cronista. · **a marca do achado mora em encontros.js, escrita e lida no mesmo módulo** — as duas pontas nunca discordam.
- **o que ficou:** visto na prova, não meu: o Cronista registou "Ivarr" ao lado de "Ivarr o Exilado" (dos NOMES À MÃO) — `nomeComDono` não os juntou; é do `backend` (a régua do homónimo com epíteto). O ramo sem destino do trecho, até o destino dito virar `para`.

## 12/10 · v9.423 · o Narrador só narra, E3: a regra O QUE É FATO entra e o 2.º lote de escrivão sai (`backend`) · este commit
- **estado inicial:** HEAD `ecd843c` (v9.422), suítes verdes; ninguém mais na árvore (só `mente/agora.json`, que não é meu e não foi no commit). `App.jsx` não tocado.
- **a regra** (prompt.js, no lugar do "invente à vontade", no mesmo commit; 649 caracteres, sem caixa alta): *número, nome próprio e consequência vêm do sistema; a textura é sua* — preço, distância, hora, quantia, gente com nome e papel, armado, lugar novo, item e "a luta começa" só existem na pauta/envelope/estado (PERGUNTOU, O PREÇO, NOMES À MÃO); sem eles, quem fala não sabe, desconversa ou diz sem número; a textura (cheiro, gesto, voz, figurante sem nome, boato vago) inteira e ousada. A LIBERDADE CRIATIVA fica; a ousadia aponta à textura e às vozes.
- **saíram os seis canais**, cada um com o dono provado contra os 11 usos da 6.ª e da 7.ª: `moedas` (cobranca.js lê agora a frase do jogador depois da etiqueta do pedido: o M9 "Pago os dois cobres" desce 2, os dois nocivos ficam em 0, e apanha duas omissões que o canal deixava — M14 e a gorjeta do M18), `cidade_atual` (a jornada chega sozinha; um passo é ratificado; SAÍDAS DAQUI e a nota da chegada já não pedem o campo), `lugar_atual` (o Cronista; LUGAR_PROMPT, o ONDE EU ESTOU e os arredores já não o pedem), `jornada_meio` (`TERRENO_VIAGEM.maritima.meio`, lido pelo acampamento), `canone` e `npcs` (o Cronista corre depois e vê o CÂNONE e o ELENCO; os nomes inventados vêm dos NOMES À MÃO). Os bilhetes da bolsa deixaram de pedir o campo. **Medida:** típica 52.971 → **51.880**; real mediana s7 62.264 → **61.305**; pior com gente 75.025 → **73.934**. Escrivão 7,4% → **4,2%** (típica), 6,3% → 4,2% (real). Caixa alta 63 → 61, 73 → 71. Relatório e protocolo da 8.ª: "E3 — medida" em `mente/narrador-so-narra.md`.
- **testes:** nova `teste-narrador-so-narra-e3.mjs` (98: a regra, os lotes fora do prompt e dos módulos, o que fica, cada dono no caso medido, os leitores do App, a catraca do tamanho). `ab-invencoes.mjs` (modo registo) ganhou as vigias: escrivão por campo, palavras por narrativa, "não sei" por pergunta. **Asserções movidas, com o motivo escrito:** `teste-chegada` (2), `teste-cobranca` (1), `teste-primeiro-dia` (1), `teste-harmonia` (2), `teste-prompt` (o piso de campos 8 → 6), `teste-narrador-so-narra-e2` (o exemplo do formato, o "invente à vontade", o 2.º lote do FICA, a guarda da ECONOMIA). `npm run build` limpo; `npm test` 321/321 + 16/16.
- **decisões médias tomadas:** · **a frase do jogador paga, mas só a 1.ª pessoa com quantia** — pergunta, condição e oferta não; a cena que recusa o dinheiro ganha; o pagamento dito dos dois lados conta uma vez (o maior). · **o meio sai do terreno da rota, não da frase** — o mar é o caso que muda o acampamento; a caravana fica sem dono (textura). · **o achado da estrada fica com o "via moedas"** até o App o creditar no rolar (o achado já leva `moedas` em número); é a única espera da suíte. · **a ECONOMIA guarda a regra que importa** ("só narre um pagamento que eu fiz ou aceitei"): a cena que paga desce a bolsa.
- **o que ficou (hand-off ao `frontend`, nada obrigatório):** o envelope do trecho de estrada ainda diz "registre jornada_meio" e "se chegarmos, registre cidade_atual" (com destino, tirar; sem destino, até o destino dito virar `para`); creditar `enc.moedas` do achado; opcional, `genero` nas `pessoas` do Cronista. A prova é a 8.ª sessão, pelo protocolo do relatório.

## 12/10 · v9.422 · o Narrador só narra, E2: o escrivão sem uso sai, e os dois defeitos da E1 (`backend`) · este commit
- **estado inicial:** HEAD `c0f9465` (v9.421), suítes verdes; ninguém mais na árvore (só `mente/agora.json`, que não é meu e não foi no commit). `App.jsx` não tocado.
- **os dois defeitos da prova viva (primeiro, com teste que falhava):** **(1) "Dois paes?"** — `GRAFIA_DA_RUA` (economia.js): a palavra da linha perguntada sai com o acento da tabela ("2× pães ◉ 1"), com ou sem til na frase. **(2) NOMES À MÃO** — a secção passou de 2,488 para **2,477** (logo depois da batida, à frente da marca do fio e da ficha) e a linha encurtou 9 ("a quem não tem nome:"); o passo dos vetos desceu de 0,1 para 0,05 (o 6.º veto cortava em 2,5, atrás dos nomes). Provado com as 138 pautas ENVIADAS da 6.ª e da 7.ª, em fixture nova (`testes/registo-s6-s7-pauta.json`): nos turnos de batida a linha cabe em **47/65 (eram 25)**, fora da luta e sem pergunta em 80/124 (eram 55), e nenhum veto, desfecho, resposta, fala, rumo, fecho, coração, o que volta, planta, batida ou lugar sai. A 5.ª sessão continua 45/45.
- **a E2:** saíram do texto fixo as instruções dos canais com 0 usos e dono (mapa_*, adicionar_habilidades, evento_global_encerrar, adicionar/remover_itens, loot:, grupo_*, feito, missao_oferecida+paga, relogio_novo, a linha SINAIS) e as oito licenças do §4a (preço "dentro da faixa", "Mercadores… preços coerentes", "Na dúvida, ABRA o combate", "semeia-as você", ACHADOS ESPONTÂNEOS, "DIGA O PREÇO NA CENA", "PODE PROPOR um relógio", "A política é sua… registra o desfecho"). Leitores no App contados antes (ficam, inertes). **Medida:** típica 59.094 → **52.971** (−6.123); real mediana s7 68.344 → **62.264**; pior com gente 80.475 → **75.025**. Escrivão 15,9% → **7,4%** na típica (13,8% → 6,3% na real). Caixa alta 68 → 63 (típica), 78 → 73 (real). Relatório: secção "E2 — medida" em `mente/narrador-so-narra.md`.
- **testes:** nova `teste-narrador-so-narra-e2.mjs` (59: o lote fora, as licenças fora, o que fica, O CHAMADO, os leitores do App, a catraca do tamanho); `teste-narrador-so-narra` §14 (12, os dois defeitos). **Asserções movidas, com o motivo escrito:** `teste-narrador-so-narra` (a linha dos nomes e a prio), `teste-juiz` (as 4 do `feito` viraram o avesso), `teste-mm8c2-quem-importa` (o CONTEÚDO ESCONDIDO), `teste-mural-do-mestre` (o campo saiu dos blocos), `teste-prompt` (a viagem, o piso de campos 10 → 8, o loot, o essencial "sinais" → O CHAMADO). `npm run build` limpo; `npm test` 320/320 + 16/16.
- **decisões médias tomadas:** · **O CHAMADO fica, com porta** — a raid só se abre pelo sinal `raid:` (App, `sinalRaidRef`); tirá-lo era desligar a raid. Fica uma linha de 180, só a partir do `NIVEL_MINIMO` de raids.js (abaixo dele o sistema recusava). · **NOMES À MÃO passa à frente da ficha e da marca do fio, não da batida** — as duas são cor de quem já tem nome; a batida move a história. · **a linha dos nomes encurta mas guarda o "a quem"** — sem ele, dois nomes soltos sob a etiqueta leem-se como gente em cena. · **o "feito" morre com motivo** (0 em 137) em vez de ir ao Cronista — ligar o Cronista é fiação do App. · **a DIPLOMACIA diz quem decide** em vez de sair: o envelope `[DIPLOMACIA — RESOLVIDA PELO SISTEMA]` existe desde a v9.142 e o prompt dizia o contrário. · **o "invente à vontade" fica para a E3**, que o troca pela regra no mesmo commit.
- **o que ficou:** para o `frontend`, nada obrigatório (o App continua a ler tudo); opcional: o `feito` julgado pelo Cronista. Para a E3: a regra O QUE É FATO no lugar do "invente à vontade", e o 2.º lote (moedas, cidade_atual, lugar_atual, jornada_meio, canone, npcs). As 18 de 65 batidas em que nem a linha curta dos nomes cabe (pauta cheia de vetos + batida).

## 12/10 · v9.421 · o Narrador só narra, E1: a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `5398c7b` (v9.420), suítes verdes; ninguém mais na árvore (só `mente/agora.json`, que não é meu e não foi no commit). Bastão `.claude/app-jsx` tomado no começo ("frontend E1"), devolvido no fim, antes do commit.
- **frontend (App.jsx), tudo em `calou`:** **(1)** `precoComumParaPauta(frase, { fator })` é a 5.ª ficha de `fichasDaMesa` (`preco: pc`) e a 5.ª fonte de `juntarRespostas`; o fator é o `pouso.fator` de `fichaDaCidade` (`fatorDoPouso`, 1 sem cidade). **(2)** `precosDaRua(fator)` na secção O PREÇO, só com rua (cidade, sem jornada, masmorra nem luta). **(3)** NOMES À MÃO: `nomesAMao({ semente, dia, cidade, genero, lex, usados })` com `usados` = registo + `nomesDoElenco()` + grupo + o herói; a linha fica pendente e só conta como oferecida se chegou ao texto (o molde do QUEM É); em `aplicarResposta`, `nomesAMaoNaProsa` regista o usado (`criarNPC`, e `status: "morto"` quando a oração o pôs morto; se já está no registo vivo e a prosa o mata, passa a morto). Os dois refs vivem no turno — **o save não mudou**. **(4)** `fichaParaPauta(…, { aqui: meuPonto() })`. **(5)** `procurarPessoa(…, { coord: meuPonto(), lugar, jornada })`. **(6)** `confirmarCoracao`: com a linha no texto, a `inst.figura` da batida entra no registo se a linha a nomeia. **(7)** `fichasDoOraculo`: o oráculo lê as fichas por chave (`A_FICHA_DECIDE`) e não conhece "preco" — o preço comum soma-se à ficha do mercado para ele calar o d100.
- **prova viva** (campanha nova "Prova E1", Pedra Branco; `localStorage` anotado antes num arquivo do scratchpad: só as duas chaves de configuração): **T1** "quanto custa uma caneca de cerveja?" → `PERGUNTOU o preço daqui: caneca de cerveja ◉ 2`; o Mestre: *"Duas coroas"*. **T7** (Mercado do Sol) → `NOMES À MÃO para quem ainda não tem nome: Aldric (ele) · Alba da Pedra (ela)`, pauta 1334/1400. **T8**, a linha dos nomes já cortada pelo teto, o Mestre respondeu "quem é a pregoeira?" com *"Alba da Pedra, a viúva do peixeiro"* — o nome oferecido na véspera. **T9** "compro dois pães" → `2× paes ◉ 2 cada, dá ◉ 4`; o Mestre: *"Dois paes? Quatro coroas."* Pautas entre 1311 e 1381, nenhuma acima de 1400. Nenhum erro do jogo no console, nenhum `LimiteErro` (o T9 numa aba nova, depois de o dev-server cair por um erro do vigia de arquivos do Windows e ser reposto). No fim, com o jogo desmontado, apaguei a única chave criada (`taverna_save_v1`) e conferi as duas de antes (`taverna_cfg_golpe_final` = "perguntar", `taverna_cfg_rolagens` = "1").
- **o que a prova ensinou, e mudou a fiação no mesmo ciclo:** os oferecidos **não se limpam** a cada turno — num turno cheio o teto corta a linha dos nomes e o Narrador ainda usa os da véspera (Alba, acima); ficam até a linha voltar com outros, e o usado sai da lista seguinte por estar no registo.
- **testes:** `teste-narrador-so-narra` §13 (12 asserções da fiação, lendo o App). **Asserções movidas, com o motivo escrito:** `teste-masmorra-sem-cidade`, `teste-mm14-perguntas`, `teste-mm8a-ficha` (a mesa ganhou a 5.ª fonte, `pc`, depois do horizonte), `teste-mm14-oraculo` (o sinal lê `fichasDoOraculo`, que parte de `fichasDaMesa`; mais uma asserção prova que parte). Endereços re-medidos pelo diff contra o HEAD em `acoes-do-jogador` (os `App.jsx:N` das strings de código; o `ondeSai` da sessão A à mão, :14180/:14181/:14329 → :14253/:14254/:14402), `check-acoes-do-jogador` (pushMsgs 8949 → 9001) e `teste-acoes-do-jogador` (o relógio 15918 → 15991, o enviar 14329 → 14402). Nada saiu de AGUARDANDO (os módulos já eram lidos). `npm run build` limpo; `npm test` 319/319 + 16/16.
- **decisões médias tomadas:** · **o preço comum fala ao oráculo pela ficha do mercado** — é do mesmo naipe, e tocar `A_FICHA_DECIDE` era mexer no motor por causa da tela. · **a figura entra no registo só se a linha que coube a nomeia** (e não por toda batida da pessoa): é a mesma régua do `confirmarCoracao`, e a escolha que vem depois já a encontra registada.
- **para o `backend` (vistos vivos, não consertados — território do motor):** · **"paes" sem til na boca do Mestre** — `precoComumParaPauta` usa, para `porPalavra`, a palavra da frase SEM acento (`m[0]` de `t`), e o Narrador copiou-a ("Dois paes?"). · **NOMES À MÃO perde o teto para o MOMENTO e o QUEM CARREGA** — nos turnos 2–6 desta campanha (pauta a 1311–1360 com a batida 1 da espinha, ~330 caracteres) a linha nunca coube, e o Narrador inventou Jaina, Dren e Jorik exatamente nesses turnos. A prio 2,488 corta antes da frente (2,475) e do coração (2,46); reproduzi o corte com `textoDaPauta` na página. O "45/45 onde pode" das pautas da 5.ª sessão não se viu aqui.

## 12/10 · v9.420 · o Narrador só narra, E1: o sistema entrega (`backend`) · este commit
- **estado inicial:** HEAD `a17a175` (a medição), suítes verdes; ninguém mais na árvore (só `mente/agora.json`, que não é meu e não foi no commit). `App.jsx` não tocado.
- **backend:** **(1) os preços comuns** — `PRECOS_COMUNS` (economia.js; as faixas do `ECONOMIA_PROMPT` em tabela, a base no meio, o porte pelo fator do pouso), `precoComumParaPauta` (PERGUNTOU, quando a frase pergunta ou pede/compra) e `precosDaRua` (secção nova O PREÇO, 6,5). **(2) a maçã** — `O_ACENTO_SEPARA`/`semConfusao` mudaram-se para economia.js (sem importações: acabou o círculo bolsa-da-frase ↔ mercado), e o `mercadoParaPauta` lê-a: o "não há macas à venda" do M13 morreu. **(3) dentro dos muros com número** — `linhaDentroDosMuros` (cidade-por-dentro.js): "130 m a nordeste daqui, 2 min a pé" em vez de "minutos a pé". **(4) NOMES À MÃO** — `nomesAMao`/`linhaDosNomesAMao`/`nomesAMaoNaProsa` (nomes.js): dois nomes livres da cultura, semeados pelo dia e pela cidade; o registo reconhece o usado e se a oração o põe morto. Secção nova NOMES À MÃO (2,488). **(5) quem espera à frente** — `masmorraParaPauta` ganha a última linha "à frente, só à vista de quem entra: voraz de boca larga, pela «ouve-se respiração pesada»". **(6) a figura com nome** — `FIGURA_DO_ARCO` (subtramas.js): o velho camarada e o irmão nascem com nome (`inst.figura`), a crise abre por ele, e o duelo do cartão é com ele. **(7) uma medida só** — a procura deixou a conta própria (`hypot × 25`, do centro da cidade) e usa `kmEntre` + a conta única do Geógrafo, do ponto do herói: a procura e o "não entra nesta cena" dizem o mesmo número (12/12 regiões). **(8) os dois postos** — `lugarPedido`: a palavra de tipo dentro do nome próprio de OUTRO sítio ("Posto da Baixa") já não acha o posto daqui.
- **testes:** nova `teste-narrador-so-narra.mjs` (95; falha à primeira linha na árvore de v9.419); nova régua `ab-invencoes.mjs` (sem exports; modo offline com o fixture `invencoes-s6-s7.json`, e modo registo JSONL para a 8.ª sessão). **As 31 invenções com o dado em frase fechada: 27** (eram 7 nas sessões; 10 em v9.419, com a C0 e a v9.418). Ficam de fora: o pregão (textura), o pedágio da abertura, os dois da tocha na ladeira e o cão sem pelo. **Asserções movidas, com o motivo escrito:** `teste-mm-c0` (a tabela do acento segue para economia.js); `teste-masmorra-na-pauta` (o fundo deixou de ser a última linha — acha-se pelo que diz); `teste-sessao-7` (a luta do cartão é com o nome da figura, não "Velho camarada").
- **o teto:** TETO_DA_PAUTA intocado (1400). Custo com etiqueta: nomes 81, rua 82, preço perguntado 88, à frente (só na masmorra) 148. Nas 66 pautas reais da 5.ª sessão: o teto nunca passa, nenhum veto/desfecho/fala/resposta/rumo/lugar sai, NOMES À MÃO entra em 45/45 onde pode, a rua em 10/40 (é decoração); pauta maior 1375. Nas 600 semeadas de estresse: idem, nenhum veto sai.
- **decisões médias tomadas:** · **a rua é decoração, a 6,5** — entra quando há folga; o preço perguntado é que é resposta (PERGUNTOU, 4). · **NOMES À MÃO cede quando PERGUNTOU tem linha** — com 2,488 tirava a resposta da mesa; quando o sistema não sabe responder ("quem era o velho?") fica, que é onde faz falta. · **o pedágio fica fora da linha da rua** — pô-lo em toda cidade inventaria a regra que não existe. · **o veto da luta sem painel já cobria M47**; o M43 é plano condicional ("quando vir…") e o conserto ali é o ocupante da sala, não o veto. · **"para ao sul" → "ao sul"** no envelope da procura (o rótulo já traz a preposição).
- **o que ficou (o App, hand-off ao `frontend`):** ligar `precoComumParaPauta(acao, { fator: ficha.pouso.fator })` como 5.ª fonte de `juntarRespostas`; `porNaPauta(p, "preco", precosDaRua(fator))` em cidade; `porNaPauta(p, "nomes", linhaDosNomesAMao(nomesAMao({ semente, dia, cidade, genero, lex, usados })))` com `usados` = npcs + elenco + grupo, e `nomesAMaoNaProsa(narrativa, oferecidos)` ao fim do turno para registar (com `status: "morto"` quando `morto`); `fichaParaPauta(…, { aqui })` com o ponto do herói; `procurarPessoa(…, { coord, lugar, jornada })`; registar `inst.figura` (subtramas) no elenco quando a crise entra. A cobrança dos preços comuns (o sistema debitar a caneca) não é desta etapa.

## 12/10 · v9.419 · os consertos da 7.ª sessão de prova, a fiação (`frontend` C0b) · este commit
- **estado inicial:** HEAD `5f51baf` (v9.418), suítes verdes; ninguém mais na árvore (só `mente/agora.json`, que não é meu e não foi no commit). Bastão `.claude/app-jsx` tomado às 23:50 de 11/10 ("frontend C0b"), devolvido no fim, antes do commit.
- **frontend (App.jsx):** **(1)** `querPartir` recusa `NAO_E_PARTIDA` (rastro.js): "me volto para Lia" já não chega ao resolver. **(2)** o `naoParte` do `resolverLugar` devolve `false` à cascata sem o envelope "DESTINO NÃO RECONHECIDO". **(3) a chegada inferida:** a viagem do ramo "achei" vai com `inferida: true`; o `viajar` marca a jornada nova (`jornadaInferidaRef`) e apaga a chegada anterior; a chegada guarda a cidade em `chegadaInferidaRef` só se a jornada era inferida; o `mundoDasMissoes` leva `chegadaInferida`; a frase do jogador que nomeia a cidade ou um lugar dela (`chegadaConfirmada` + `lugaresDaqui`) apaga a marca, no começo do turno, antes do Cronista conferir. Os dois refs vivem na sessão — **o save não mudou**. **(4) a fogueira:** com `sentado.revela`, a manhã é `"revelacao"` e o Livro paga as sementes maduras do elo (`pagarSementesDoElo`, a mesma conta de `confirmarCoracao`); ficar com a porta depois de uma revelação também paga. **(5) a luta do lado:** `escolherNoCoracao` e `escolherAoFogo` dão ao motor `presentes` (`elencoDaCena(...).aqui`) e `mostrado` (`falasDoMestre`); com `r.luta`, `abrirLutaPrometida` abre pelo `abrirCombate` como a agressão (ficha, mensagens, textura, nota) e nunca por cima de uma luta aberta. À fogueira a luta abre antes de a noite fechar. **(6) o mural:** `favorJaPedido` antes de `pregarNoMural` (variável `semPedido` ao lado de `semHomonimo`). Tudo em `calou`.
- **prova viva** (campanha de teste nova, Ponto Rasa; o `localStorage` anotado antes: só as duas chaves de configuração): **(a)** "Depois me volto para Wystan e aponto a placa de latão do mesmo lugar onde a mulher conta moedas." — nenhuma viagem, nenhum "Entendi", a cidade continuou Ponto Rasa e o Narrador respondeu à cena. **(b) a fogueira numa noite real** (12 h a passar, acampamento na estalagem, Descanso longo com "· uma conversa à fogueira" no botão), **a 800×451**: a roda (Wystan, Quilla) em 237–285 px, «Dormir já» em 293–348, a área do relato acaba em 357 e o campo de escrita começa em 366 — **18 px de folga, nada por cima**. **A 467×812**: uma coluna só, botões de 363 px, os nomes inteiros (`scrollWidth` = `clientWidth` em «Wystan», «Quilla», «Barba-Ruiva»), «Dormir já» acaba em 423 e o campo começa em 743. Sentei-me com Wystan (fala na voz dele), Dormir → o ladrilho «Ficou com você, da noite, o que Wystan contou ao pé do fogo.» + o recibo. Sem erro no console. **(c) não provada viva:** a escolha com lado de duelo pede a batida da decisão (dias de pedido); a fiação está e a suíte lê-a. No fim, com o jogo desmontado, apaguei a única chave criada (`taverna_save_v1`) e conferi as duas de antes (`taverna_cfg_golpe_final` = "perguntar", `taverna_cfg_rolagens` = "1").
- **testes:** `teste-sessao-7` §5 (12 asserções da fiação, lendo o App). **Asserções movidas, com o motivo escrito:** `teste-mm14-gente` (a porta do mural ganhou o segundo porteiro, `semPedido`). Endereços re-medidos pelo diff contra o HEAD em `acoes-do-jogador`, `check-acoes-do-jogador` e `teste-acoes-do-jogador` (+16 em `pushMsgs`, +24 no enviar da recusa, +36 no relógio). Nada saiu de AGUARDANDO (as peças eram de módulos já ligados). `npm run build` limpo; `npm test` 318/318 + 16/16.
- **decisões médias tomadas:** · **a chegada inferida não vai ao save** — um recarregar no meio devolve o comportamento antigo para aquela chegada só; persistir pedia campo novo, e o ganho não paga o risco. · **a confirmação lê a frase no começo do turno**, antes de qualquer porta: nomear a cidade em qualquer frase é estar lá. · **à fogueira, a luta prometida abre antes do descanso** — o Narrador recebe a nota da luta no mesmo turno da manhã, e o descanso corre sobre a ficha que já está na luta.
- **o que ficou:** a escolha com lado de luta jogada viva (c); a revelação ao fogo jogada viva (pede as duas pistas do elo).

## 11/10 · v9.418 · os 3 consertos da 7.ª sessão de prova, o motor (`backend`) · este commit
- **estado inicial:** HEAD `5fc026e` (v9.416); o `aprendiz` na árvore com `painel-fogueira.jsx`/`estilo.js` e a `VERSAO` em v9.417 por commitar — não toquei nesses, e a minha `VERSAO` é a maior +1. App.jsx NÃO tocado (a ligação é de um `frontend`).
- **backend:** **(1) "me volto para Lia" não é partida** — a viagem de M50 não veio de `detectarPartida`, veio da régua `querPartir` do App ("volto para") + `resolverLugar`, que achou Sul Molhado porque o Peixe Cego do cânone tem tipo "lugar" e a frase dizia "do mesmo lugar" noutra oração. `NAO_E_PARTIDA` (rastro.js, o reflexivo de virar-se e o olhar dirigido) + `DESTINO_NA_ORACAO` (resolver.js: só a oração do verbo dá destino; termos de classe não apontam cidade; palavra inteira); a frase de M50 devolve `naoParte`. E **a chegada inferida não paga**: `CHEGADA_INFERIDA` em `conferir` (ir_a/levar_a esperam enquanto `mundo.chegadaInferida` é a cidade de agora) + `chegadaConfirmada(texto, cidade, lugares)`. **(2) a revelação cai** — a causa, em três camadas: M50 tinha o nome e as duas pistas, e a viagem fantasma engoliu o turno (o elo ficou LONGE); M55 citou as duas pistas mas disse "dela", e `confrontou` exigia o primeiro nome; e M55 caiu no dia 3, o mesmo da crise de Tônia (M52), e "nunca duas crises no mesmo dia" vetava-a. `CONFRONTO.semNome` (com o elo em cena e um sinal de cada pista, o nome não é preciso) e `CONFRONTO.furaODia` (a revelação ganha pelo confronto não espera o dia). **A fogueira é a segunda porta** (a proposta, aprovada): `REVELACAO_AO_FOGO` — com as duas pistas e a revelação permitida, o elo à roda tem um gesto que não diz a coisa, e `sentarAoFogo` devolve a revelação (`revela: true`, `voz: "ficha"`), a mesma linha (`linhaDaRevelacao`) e o mesmo `crise`/`ato` do confronto: a que abre primeiro fecha a outra. **(3) o alvo existe** — `PESSOA_NA_PROSA` + `pessoaMostrada` (agressao.js): a gente que o Mestre pôs ARMADA à frente do herói e o jogador nomeia no golpe é combatente, com o nome da frase ("Homem da tocha", "Pescador de barba ruiva"), e `lerCrime` recusa `armadoNaProsa`. **O cartão cobra:** `escolherLado` devolve `luta: { nome, ameaca, duelo, deOnde }` para o lado combate/duelo, por `alvoPrometido` (o registo da cena pelo papel → o que o Mestre mostrou → o próprio `contra`; `LUTA_PROMETIDA`) — nunca vazio. **Extra (M27):** `favorJaPedido(dador, coracao, nucleo)` — quem do núcleo já pediu não tem cartaz no mural.
- **testes:** nova `teste-sessao-7.mjs` (70), cada defeito com a frase real; contra a árvore de v9.416 (os 6 módulos do HEAD numa cópia) **42 asserções falham** nas quatro secções. **Asserção movida, com o motivo escrito:** `teste-subtramas` §4 — "nunca duas crises no mesmo dia" deixa de contar a revelação `porConfronto`. `npm run build` limpo; `npm test` 318/318 + 16/16.
- **decisões médias tomadas:** · **a fogueira fala com `voz: "ficha"` e `revela: true`**, não uma voz nova — a roda e a manhã de hoje já a leem e o que dizem é verdade ("o que X contou ao pé do fogo"); a manhã própria (`MANHA_DA_FOGUEIRA.revelacao`) espera a ligação. · **a linha "à volta do fogo" cai na de pé quando passa de 220** (a verdade inteira vale mais do que dizer onde; o envelope da fogueira já diz o sítio). · **a pessoa da prosa só vira alvo com arma na prosa E a cabeça ou o complemento vistos nas falas do Mestre** — "Ele tira uma faca" sem o pescador nomeado não basta: a trava "o jogador não escreve o inimigo" fica. · **`velho` está nas cabeças** (é como a prosa chama gente); sem arma, "ataco o velho" continua sem alvo.
- **a verdade do índice:** o `aprendiz` commitou `11cc6be` ("… (v9.417)") entre o meu bump e o meu commit, e o `constantes.js` dele levou o **v9.418** que eu já tinha escrito na árvore; por isso o meu commit `a6aeb2d` não traz `constantes.js`. O número no ar (v9.418) é o desta etapa; nada a reescrever.
- **o que ficou (para o `frontend`, no App):** ver a resposta do backend — `querPartir`/`naoParte`, `chegadaInferida` no `mundoDasMissoes`, `mostrado`/`presentes` no ctx do `escolherLado` e abrir `r.luta`, o Livro e a manhã na fogueira com `revela`, `favorJaPedido` antes de `pregarNoMural`.

## 11/10 · v9.416 · C6 · F2, a fogueira ligada no App (`oficial`) · este commit
- **estado inicial:** HEAD `42b2cb1` (v9.414); o `backend` fechou a v9.415 (`a6c696f`) em paralelo, sem tocar no App. Bastão `.claude/app-jsx` tomado às 21:23 ("oficial fogueira"), devolvido no fim deste ciclo, antes do commit.
- **oficial (App.jsx):** **(1) o «Descanso longo» passa pela fogueira** — `descansoLongo` pergunta ao motor (`quemAoFogo`) quem está junto: o grupo sem invocações e, numa cidade fora de viagem, quem do núcleo mora nela. Ninguém → corre como sempre; ninguém com voz → corre, e a manhã abre com a linha de E; alguém com voz → a roda (A) toma o lugar do relato, com «A noite · <sítio>» no cabeçalho, a página ao topo e a soleira calada. **(2) sentar** = `sentarAoFogo` + um turno do Narrador: a linha do motor vai pela pauta (`coracaoFalaRef`, secção CORAÇÃO, `proprio`), a frase do turno só pede a fala; enquanto ele escreve, o lugar fica marcado; a resposta vira a fala de B/C/B2. **(3) fechar a noite** — Dormir (ou «Dormir já»), um lado (C: `escolherLado`, custo debitado antes, a reação dela e a manhã no mesmo turno) ou ficar (B2, só com `portaAberta` e só para quem é a porta) chamam `sairDoAcampamento("longo", { antes })`; o que o motor devolveu ao sentar **só se grava ao fechar** (um Mestre que cala no meio não deixa nada "contado"). **(4) a manhã** — `fraseDaManha` + o recibo da noite (da mesma `contasDoLongo` que escreve o botão) num ladrilho ancorado no índice do relato onde a manhã começa: o relato parte-se em dois ali. **(5) a linha devolve** ganha «· uma conversa à fogueira». **(6) o defeito antigo** — `responderPeticao` chamava `enviar` sem ficha e o CÓDEX de `aplicarResposta` lia `persAtual.grupo/vida` cru: agora a ficha vai, e o CÓDEX lê `persDoEnvio` (nunca nula). **(7) a pedido do regente:** o delta −1 do coração chama `afrouxarLaco` (v9.415).
- **prova viva** (campanha de teste nova, Forte do Vigia): o botão disse «devolve PV e PM cheios · metade dos dados de vida · uma conversa à fogueira»; a roda abriu com três (Ceridwen, a companheira, «conta moedas que não chegam»; Jarl e Gareth, «quer falar com você»); sentei-me com Jarl e o Narrador respondeu na voz dele, o pedido inteiro, sem dizer mecanismo (*"Me ajude a juntar o que falta. Depois disso, sou livre."*); Dormir; a manhã abriu com o ladrilho «Jarl lhe pediu uma coisa à volta do fogo, e a manhã ainda a traz.» + «uma noite inteira · PV e PM cheios · metade dos dados de vida», e a soleira trouxe Aceitar/Recusar. O save gravou Jarl `noites: 1, pedido: 1`. Mesa 1280×912 e Baixa 800×451, sem `LimiteErro` nem erro no console. Save de teste apagado; as duas chaves de configuração da pessoa ficaram.
- **decisões médias tomadas:** · **a roda é a página, não um cartão por baixo dela** — o Figma (A–C) é o `126:5` com a página trocada; por baixo do relato a fala sairia em dobro (no relato e no painel). · **o que o motor muda ao sentar grava-se ao fechar a noite**, não ao sentar (o C2 grava no envio porque a linha entra na pauta; aqui a noite inteira é o turno). · **escrever com a roda aberta fecha a roda** (a frase é do jogador); depois da fala dela, escrever é responder-lhe e a fogueira fica. · **a soleira cala com a roda aberta** — a noite é a decisão do turno. · **`LimiteDaFogueira`**: um limite que se cala (null) em vez de tapar a tela como o `LimiteErro`; estourou uma vez, a roda não volta nessa sessão e o descanso corre como hoje. · **`contasDoLongo`**: a conta do botão saiu do corpo do botão para o recibo da manhã ler a mesma.
- **testes:** nova `teste-fogueira-ligada.mjs` (36; a petição e o `persAtual` cru falham contra o HEAD e passam agora). **Asserções movidas, com o motivo escrito:** `teste-a1-relato` (o relato inteiro continua UMA chamada; as duas metades da manhã passam as mesmas seis props), `teste-r3-campo-do-turno` (a conta do longo vive em `contasDoLongo`, e o botão lê-a). `teste-palco` ficou como estava (o cabeçalho continua a ler `lugarDaCena()`; a noite sobrepõe-se depois). `check-formas` D5e.3: o topo da página usa `setTimeout`, não `requestAnimationFrame`. Endereços re-medidos pelo diff contra o HEAD em `acoes-do-jogador`, `check-acoes-do-jogador` e `teste-acoes-do-jogador` (+23 em `pushMsgs`, +27 na recusa/enviar, +30 no relógio).
- **o que ficou:** · **o painel a 467 px (telefone)**: a grade de duas colunas de Baixa corta o nome numa letra («C», «J») — o lugar Baixa foi desenhado para 336 de largura; é do `painel-fogueira.jsx` (aprendiz/desenho), não mexi. · **não provado vivo:** C (escolha com lados), B2 (a porta, que pede duas noites), E (presentes sem voz), o topo da página ao abrir (entrou depois da prova) e o campo fechando a roda — o motor dá-os, a fiação está, e a suíte lê-os; falta jogá-los. · a fala da fogueira vem num parágrafo só quando o Narrador não parte o texto. · `presentes` na estalagem: decidi pela `cidade` da pessoa do núcleo; se a casa quiser só o grupo, é uma linha.

## 11/10 · v9.415 · C2, as três pendências da prova viva (`backend`) · este commit
- **estado inicial:** HEAD `42b2cb1` (v9.414). App.jsx e `painel-fogueira.jsx` NÃO tocados (o `oficial` liga a fogueira, bastão dele). A árvore fica vermelha em 3 suítes + 1 varredor de endereços do App (`teste-a1-relato`, `teste-palco`, `teste-r3-campo-do-turno`, `check-acoes-do-jogador`) — trabalho do `oficial` em curso; `so-o-meu.sh` com os meus 5 arquivos deu 316/316 e 16/16.
- **backend:** **(1) a voz presa ao nome** — `VOZ_PRESA`/`vozPresa` (nucleo.js): o tique vai sempre como `(voz da Dora: pergunta o preço de tudo, até do silêncio)`, nas três linhas que o levam: QUEM É (à cabeça, "Dora (voz da Dora: …): quer …"), QUEM CARREGA (depois da fala) e a fogueira (era " Fala assim: …"). Saiu `LINHA_DO_CORACAO.tique`. **(2) o género** — `GENERO_NA_LINHA`, `temGenero`, `comGenero`: o artigo do marcador já diz o género de graça ("voz da"/"voz do", zero caracteres a mais); onde a linha não leva nada que o diga (crise, pistas, decisão, "decidido"), entra "(ela)"/"(ele)" depois do nome; a QUEM É só na estreia. Mais duas flexões que faltavam a `GENERO_NA_FICHA` ("de quem o mandou", "pelo armazém dele" — a sonda deu "quer ser livre de quem o mandou" à Lysa). **(3) `afrouxarLaco`** + `AFROUXAR_LACO` (npcs.js): −1 de força, para no piso 1 (partir é `romperLaco`), o rompido não afrouxa, devolve o mesmo objeto quando nada muda.
- **decisões médias tomadas:** · **parênteses, não "Fala assim:"** — o parêntese é o sinal da casa para o que é dito ao Narrador ("(é fato: …)"); frase com maiúscula é o que ele narra. · **o género pelo artigo** ("voz da Dora") antes da marca: a primeira tentativa pôs "(ela)" à cabeça da QUEM É e, a 130, empurrou a voz para fora na estreia — o artigo resolveu sem gastar. · **a marca entra em ~65% das linhas do coração** (1150 de 1768 nos 120 mundos): +6 caracteres nas que não diziam o género; zero nas que já o diziam. · **o piso do afrouxar é 1, não romper**: "falar menos" e "não falar mais" são lados diferentes nos ARCOS.
- **testes:** `teste-subtramas.mjs` §12 (14 asserções, 120 mundos: 5049 QUEM É, 478 QUEM CARREGA e 1783 fogueiras com voz — todas presas ao nome pelo marcador do género, nenhuma solta; 1768 linhas do coração todas com género; a marca nunca dobrada; a QUEM É com género na estreia e sem marca depois). `teste-laco.mjs` §1b (9 asserções do afrouxar). A linha-fixture da pauta (§8) passou à forma nova, com o motivo. Build limpo.
- **o que ficou (para o `frontend`, no `aplicarEfeitosDoCoracao` ~22874):** o ramo `else if (e.delta === -1) novo = afrouxarLaco(npc);` (e o import de `afrouxarLaco` de `./npcs.js`). Os outros efeitos sem aplicação continuam só como fato (lista no relato ao orquestrador).

## 11/10 · v9.414 · MM-C · C2, as subtramas — a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `0f11527` (v9.413) verde. Bastão `.claude/app-jsx` tomado ("frontend C2") e devolvido ao fim do commit. A fogueira NÃO foi ligada (é do `oficial`).
- **frontend:** `subtramas.js` importado (saiu de `AGUARDANDO`; as peças da fogueira ficam com o leitor da suíte). `subtramasAgora` (cache pelo núcleo, o elenco dá as casas) e `contextoDoCoracao` (dia, ato, turno, em cena, ritmo, luta, mortos, a máscara já caída em `reveladas` com o ato em que caiu). Em `pautaDoTurno`: `maoDoVilao` = a assinatura do fio no MOMENTO ou a ameaça que agiu; QUEM CARREGA antes do QUEM É (`jaCarrega`), `r.longe` no ENTRETANTO; a batida fica pendente e `confirmarCoracao` (depois de `textoDaPauta`) só a guarda se a linha COUBE — então o ritmo, os efeitos e o Livro (as duas pistas do elo semeadas na estreia dele, regadas na batida `pista`, pagas na revelação). Na tela: o pedido entra na **soleira** como a petição ("Aceitar o que Dora pede · Dora conta com você · 5 min"; recusar e porquê na dobra) e a **decisão** num cartão por cima dela, com os dois lados em `VerboComPreco` e o preço antes do clique (o lado que a bolsa não paga não aparece). O porquê vai em PERGUNTOU; a decisão debita a bolsa, aplica laço/relação e leva a linha "decidido" à pauta do próprio turno. O coração volta com o Livro em `aplicarRetrato` (o turno que o Mestre não respondeu desfaz os dois juntos).
- **decisões médias tomadas:** · **o pedido na soleira, não num cartão** — a prova viva mostrou o cartão de três opções a deixar UMA linha de prosa no telefone; o pedido não é irreversível, e a soleira já sabe caber (1 no telefone, o resto na dobra). A decisão (irreversível, os dois lados juntos) ficou em cartão. · **o turno que o próprio coração envia não traz outra batida** — o envelope pede só a reação de quem pediu (SO_ISSO), e a pauta mandava Dora pedir no mesmo fôlego. · **efeitos aplicados pelo App:** bolsa (no clique), laço +1 / firma / ao máximo / rompe (`firmarLaco`/`romperLaco`) e relação com quem está no registo. O resto (laço −1, luta, duelo, teste, missão, dias, tique, medo, propósito, crónica, sai) chega ao Narrador como fato na linha "decidido": **não há função de "afrouxar" um laço em `npcs.js`**, e inventá-la no App seria regra na tela — pedido ao `backend`.
- **prova viva** (campanha sintética "Teste C2 Subtramas", Tarn): QUEM CARREGA chegou à pauta em turno comum — `Adélia do Cão (é fato: entra nesta resposta, dito por ela): PEDE ao herói: "Nesta cidade não diga o meu nome. Nenhum dos dois." Jura por coisas pequenas.` e, dois turnos depois, `Dora … PEDE ao herói: "Faltam-me 29 moedas. Treze dias."` (o Mestre disse-o: "Faltam-me vinte e nove moedas. Treze dias."). O QUEM É foi para a Olívia (não repetiu quem carregava). "Perguntar a Dora porquê" levou `PERGUNTOU Dora (…): diz porquê — quer manter vivo quem ama, custe o que custar.`; "Aceitar" gravou `resposta: aceitou`. Com a decisão posta por injeção no save sintético: o cartão mostrou `Pagar ◉ 29 — ◉ 29 da sua bolsa — e o credor esquece Dora` e `Ir buscá-lo à força — uma luta com os homens do credor — e um inimigo nesta cidade`; o clique debitou 40 → 11, firmou o laço `divida` com Dora e a linha `o herói decidiu, e é assim — …` foi à pauta. Pauta 1037/1400; system 67,6k (nada estático somado); pedido até 98,8 kB. Sem `LimiteErro`, sem erro no console. **Chaves:** só `taverna_save_v1` nasceu, e foi apagada com o jogo desmontado; `taverna_cfg_golpe_final` ("perguntar") e `taverna_cfg_rolagens` ("1") conferidas iguais por leitura.
- **o achado da prova (defeito antigo, não meu):** `aplicarResposta` lê `persAtual.grupo` sem rede (~11122); todo `enviar(...)` sem a ficha estoura DEPOIS da resposta ("reading 'grupo'", o Mestre "cala" com a resposta na mão). As duas chamadas do coração passam `fichaViva()`; **`responderPeticao` continua a chamar `enviar` sem ficha** — a petição aceite tem o mesmo defeito. Para um ciclo: `(persAtual || pers)` ali, com teste.
- **testes:** 147 endereços de `acoes-do-jogador.mjs` re-medidos pelo diff contra o HEAD (+ os nus do `ondeSai`, `pushMsgs` 8850 → 8910 no varredor, o relógio 15788 → 15852), e duas âncoras de texto MOVIDAS com o motivo (`teste-soleira-verbos`: zero px sem soleira E sem coração; `teste-v5-pagina`: o cartão no mesmo pé, uma soleira só). Build limpo; 316/316 suítes, 16/16 varredores.
- **o que ficou (para o `backend`):** · o tique colado à linha como frase solta ("Jura por coisas pequenas.") foi lido como prosa — o Mestre repetiu-o literal e uma vez deu o tique da Dora ao Irineu. · `afrouxarLaco` (o −1 de quinze lados) não existe. · a Dora é "ela" na ficha e "um homem" na narração. **Para o `desenho`:** o cartão da decisão no telefone (dois `VerboComPreco` empilhados + a soleira) ainda come metade da página — se a forma `A escolha` ganhar variante compacta, é aqui que se usa.

## 11/10 · v9.412 · a C2 trata o jogador por você (`backend`) · este commit
- **backend:** 45 textos passaram de "tu" a "você" — 35 em `src/subtramas.js` (preços dos lados, falas dos pedidos e do elo, respostas ao pedido, frase da manhã, `SEM_NOME.alvo`, "Levá-la convosco" → "com vocês") e 10 em `src/nucleo.js` (8 exemplos de `COMO_FALA` e a fala da pista do `e_vendeu_nome`). **Decisão:** a fala de NPC dirigida ao herói também diz você — o registo da personagem mora no tique, não no pronome; um exemplo em "tu" ensinava o Narrador a tratar o herói por tu. **testes:** secção 7b em `teste-subtramas.mjs` (128 ok; 4 vermelhas no HEAD antigo): 8 625 textos de tela e 4 473 linhas ao Narrador em 120 mundos sem tu/teu/contigo/convosco/-te. `teste-ligacao` vermelho na árvore (perdão `itens.js:PROPS` com leitor) é do `aprendiz` em `painel-fogueira.jsx` — `so-o-meu.sh` deu 315/315 verde.

---

## 11/10 21:00 · v9.411 · MM-C · C2, as subtramas — o motor (`backend`) · este commit
- **estado inicial:** HEAD `9a59990` (v9.410, a C1 ligada pelo frontend) verde. App.jsx NÃO tocado.
- **backend:** `src/subtramas.js` (novo) — o §2 de `mente/coracao-c1-c2.md` em tabela: `ARCOS` (os 11), `ANCORA_DO_PAPEL`, `GATILHOS_DA_BATIDA`, `RELOGIO_DAS_BATIDAS` (ESPERA_DO_PEDIDO 3), `TONS_DA_BATIDA`, `EFEITOS_DO_LADO`, `PEDIDO_DO_ELO`, `LINHA_DO_CORACAO`; `subtramasDoNucleo` (um arco por pessoa, a porta espera a C3), `avancarCoracao` (uma batida por turno, só de quem está em cena; as duas pistas do elo e a reviravolta na boca dele, com `revelacaoPermitida`; quem confronta o elo com uma pista apanha-o a mentir, com as duas tem a verdade já; o elo morto revela pelo que levava; a omissão no prazo; a crise pior do pedido ignorado; na luta só o tom de batalha), `escolhasAbertas`/`escolherLado`/`opcoesDoPedido`/`responderPedido` (o veredito antes do clique, preço em mundo), `sementesDoElo` (o Livro de Promessas), e a fogueira: `quemAoFogo`, `gestoAoFogo`, `aguentaANoite`, `portaAberta`, `sentarAoFogo`, `fraseDaManha`. `nucleo.js`: a concordância de género (`GENERO_NA_FICHA`, `generoDaPessoa`, `noGenero` — a teia já não diz "noivo(a)", a fogueira diz "dito por ela" dela), `jaCarrega` em `quemEParaPauta`, o save `coracao` guarda também `posta`, `ato`, `porque`, `contados`, `noites`. `nomes.js`: `sexoDoNome`. `pauta.js`: secção `coracao` (QUEM CARREGA, 2,46); `quemE` de 4,5 para 2,485; `quemE` e `coracao` cedem na pergunta.
- **testes:** `teste-subtramas.mjs` (124, em 120 mundos × 60 turnos: ordem, segredo, bastidor, género, uma por turno, crises e revelações, luta, a cidade cheia de ~1323, as 500 cenas); `teste-nucleo.mjs` 7c (o género, 120 mundos) e a asserção da prio do QUEM É MOVIDA com o motivo. `teste-ligacao`: `subtramas.js` na lista de espera, credor o frontend.
- **decisões médias tomadas:** · **o achado da prova viva da C1** (pedido do orquestrador): a QUEM É caía primeiro no turno de cidade — perdia para a economia (2,5) e a cauda do ONDE (2,49), decoração. Passou a 2,485 (depois dos vetos, do coração e da batida da espinha; à frente da decoração). Na cidade medida (~1323) entra; as duas linhas juntas (350) entram na cena de conversa, e na cidade cheia a ficha cede sem tirar nada da história (o §3.2 diz que na prática vai uma). · numa pergunta, `coracao` e `quemE` cedem: medido, a batida de 220 tirava PERGUNTOU e deixava a cauda do ONDE; a batida não se perde (o App só a conta quando entrou). · a batida só conta se a linha COUBE: `avancarCoracao` devolve o coração novo e o App fica com ele se `textoDaPauta` a incluir (a pergunta do §7, "regar quando cabeu"). · o género do vilão sai do primeiro nome (bancos de nomes), não do artigo do título ("Yorick Ventoforte, a Mão Fria" é ele). · a máscara do aliado continua das `reviravoltas.js`: o companheiro com segredo de sombra não leva a_revelacao; o App passa essa revelação em `reveladas` e a do elo não cai no mesmo ato. · `ARCO_DE_RESERVA` (culpa → a_culpa_tarde, dívida → a_juramento, objeto → a_carta): sem ela 83 de 599 pessoas ficavam sem história. · a_irmao_do_outro_lado está transcrito mas não nasce (o `e_irmao_lado` é de sombra, e na C1 só o elo e a máscara têm sombra). · desvios da tabela escritos no módulo: a_culpa_tarde sem "alívio" na decisão (o §2.6 proíbe), "à {casa}" (o elenco já diz "Casa X"), peso "leve" no Livro (com "pesado" a pista, regada uma vez, nunca amadurecia). · prazos que a spec não deu: a omissão 2 dias depois de posta; 3 turnos entre duas linhas da mesma pessoa; a porta abre com 2 noites.
- **o que ficou:** a fiação toda (relato ao orquestrador). A linha "porque" deve ir na secção PERGUNTOU (é resposta). A crise que marca o irmão rendido na luta é efeito para o motor de combate.

## 11/10 19:40 · v9.410 · MM-C · C1, o núcleo — a fiação (`frontend`) · este commit
- **estado inicial:** HEAD `309c8b1` verde; o `backend` escrevia ao mesmo tempo a `fichaNaVoz` (subiu `f1e024c`) e o `desenho` a fogueira (`d69c5e4`) — nenhum dos dois tocou no App.jsx. Bastão `.claude/app-jsx` tomado às 18:45 ("frontend C1") e devolvido ao fim.
- **frontend:** `nucleo.js` importado (saiu de `AGUARDANDO`). `nucleoAgora()` deriva o núcleo com o contexto do elenco + grupo + antecedente + reviravolta eleita, memorizado pela identidade dos refs (o critério do cache do elenco) e pela chave companheiro/antecedente/reviravolta. `nucleoEmCena()`: quem do núcleo está nas duas últimas falas do Mestre (nome inteiro ou primeiro, sem acento) ou anda no grupo. QUEM É entra em `pautaDoTurno` junto da saída do elenco, em `calou`. Save: `coracao` (garantido no load, zerado em campanha e capítulo novos; só a C2 escreve).
- **decisão média:** o ritmo da linha (`quemERef`, fora do save) **só conta quando a linha chega ao texto**. Na prova viva, a abertura gerou a ficha do Magnus, o teto cortou-a, e o ritmo antigo já a dava por dita — seis turnos de silêncio sem ela nunca ter ido. Agora `pautaDoTurno` deixa-a pendente e o envio confirma-a com `pauta.includes(linha)`.
- **prova viva** (aba nova, campanha sintética "Teste C1 Nucleo"): núcleo Magnus Sem-Medo (companheiro) / Dragão Ancião a Viúva de Ferro / Runa (elo) / Ceridwen / Yorick o Exilado / Bjorn da Torre. Turno 3 ("Magnus, quanto custa um quarto?") levou `QUEM É    Magnus Sem-Medo: quer ser chamado mestre por quem lho negou; diz os números exatos: "Trinta e sete passos até à porta."` — pauta 1363/1400, system 67.347 (igual: nada estático somado), pedido 93.077 bytes. Sem erro no console, sem LimiteErro. Chaves: só `taverna_save_v1` nasceu, e foi apagada com o jogo desmontado; `taverna_cfg_golpe_final`/`taverna_cfg_rolagens` conferidas iguais.
- **testes:** 145 endereços de `acoes-do-jogador.mjs` re-medidos pelo diff contra o HEAD (+55 acima de `enviar`, +57 abaixo de `iniciar`), mais `:8795 -> :8850` no varredor e três asserções de endereço em `teste-acoes-do-jogador.mjs`, todos com o motivo escrito. `coracao` foi para depois de `saber` no objeto do save para não partir as âncoras de texto de `teste-mm8e-promocao` e `teste-mm10-crime`. Build limpo; 314/314 suítes, 16/16 varredores.
- **o que ficou (para o `backend`):** num turno comum de cidade a linha **não cabe**: o turno 2 tinha 1323 caracteres de pauta (ONDE, MOMENTO com a obra do vilão, NÃO PODE, RUMO, FECHO) e a do Magnus tem 129 — com prio 4,5 ela é a primeira a cair. Só entrou na cena de pergunta, onde o MOMENTO cede. A prio da `quemE` (ou o `max` da linha, ou o exemplo da fala) é do `pauta.js`/`nucleo.js` — não mexi.

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
