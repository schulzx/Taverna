# As formas

**Uma ação, uma forma.** Este arquivo é onde o `jogo` e o `desenho` se
encontram, e é a única fonte de verdade sobre a cara de cada coisa que o
jogador toca. Quem constrói (`aprendiz`, `frontend`) lê daqui — e para,
quando não acha.

Se a mesma ação aparece com duas caras no jogo, uma delas é defeito. Não é
questão de gosto: é a lei da casa aplicada à interface.

A verdade visual mora em **dois lugares que não podem divergir**: a
biblioteca no **Figma** (o desenho) e as tabelas em código — `T` (a paleta
semântica), `MATERIAIS` (a paleta física das superfícies) e a folha de
estilo, todas em **`src/estilo.js`** desde D2; as primitivas em `ui.jsx`.
`constantes.js` continua reexportando tudo, para quem importava de lá não
precisar saber da mudança. O Code Connect amarra os dois. Este arquivo é o
índice em prosa dos dois, com o *porquê* — que nenhum dos dois guarda.

---

## O formato de uma forma

```
### <a ação, no verbo do jogador>
- **quando** — o momento em que aparece (dono: `jogo`)
- **forma** — o que é, e os estados (dono: `desenho`)
- **movimento** — o que se move, quanto tempo, com que saída
- **onde vive** — o componente no Figma · o componente em código
- **por quê** — a razão, no tom da casa
- **peso** — leve / médio / pesado (ver `CLAUDE.md`)
```

---

## As formas decididas

_(vazio — a Fase D preenche este arquivo a partir do que já existe no jogo,
antes de qualquer coisa nova ser desenhada. Ver `mente/pauta.md`.)_

---

## As superfícies (decidido em D2 · 14/09)

As superfícies não são ações, então não cabem no formato acima: ninguém
*clica* numa cortiça. Mas elas têm forma, e a forma delas tinha virado
trinta e cinco números soltos dentro de uma string de CSS. Ficam aqui.

**A regra que as separa de `T`.** `T` é a paleta **semântica** — o que uma
cor *significa* (tinta, perigo, acerto, acento). `MATERIAIS` é a paleta
**física** — de que um objeto do mural é *feito* (madeira, papel, latão).
São dois tipos de decisão e não podem morar na mesma tabela fingindo ser o
mesmo tipo: uma muda quando o jogo muda de humor, a outra quando a tábua
deixa de ser tábua.

- **a cortiça** (`corticaFundo`, `corticaMoldura`, `corticaFilete`) — a
  tábua é o fundo escuro, a moldura é a madeira de sete pixels, o filete é
  o fio claro por dentro dela. Nenhum arquivo de imagem: gradiente, borda e
  sombra, e a `teste-arte` defende isso.
- **o cartaz** (`cartazTopo`, `cartazMeio`, `cartazPe`) — o papel é um
  degradê de três paradas, não uma cor chapada, porque papel pregado pega
  luz de um lado só.
- **o percevejo** (`percevejoBrilho`, `percevejoCorpo`, `percevejoBase`, e
  as três irmãs `percevejoRoxo*`) — brilho, corpo e base são a esfera de
  latão vista de cima. A cabeça roxa diz "isto foi oferecido a você" sem
  gastar uma palavra na tela.
- **a vinheta** (`vinhetaCanto`) — o canto escurece e o meio parece
  iluminado. A coisa mais barata que existe para dar profundidade.

**Sombra e brilho não são material.** `rgba(0,0,0,x)` e `rgba(255,255,255,x)`
não entram em `MATERIAIS`: são ausência e excesso de luz, e o que varia
entre os oito usos é só o alfa. Moram em dois moldes internos de
`estilo.js` — `sombra(a)` e `brilho(a)` — para que a decisão "a sombra da
casa é neutra" exista **num** lugar, e não em seis entradas que diferem no
último caractere.

**Os valores não moram aqui.** Moram em `src/estilo.js`, que é o único
lugar onde podem ser editados. Este parágrafo guarda o *porquê*; duplicar
treze hex em prosa seria criar a segunda verdade que este arquivo existe
para impedir.

**Dívida registrada, de propósito não paga em D2** (a linha de D2 era *zero
diferença na tela*, e cada uma destas mudaria pixel ou exigiria máquina
nova):

- `percevejoRoxoCorpo` é `#8A78D8` e `T.violet` é `#8B7BD8` — três de 255
  de diferença, invisível a olho nu. É quase certamente a mesma decisão
  escrita duas vezes, mas *quase* não basta: unificar é item futuro.
- `corticaFundo` está a três pontos de `T.panel`, e `cartazMeio` a sete de
  `T.panelSoft`. Mesma conversa.
- **treze** `rgba()` dentro da folha já são cores de `T` com alfa (sete no
  movimento, seis nas superfícies). Elas esperam o helper `alfa(cor, a)` do
  item *"os 67 literais que já são `T`"* — e quando ele vier, **o escopo
  daquele item é 80, não 67**.

---

## A biblioteca no Figma (decidido em D3 · 14/09)

**Onde ela mora.** Arquivo `Taverna — biblioteca`, na equipe de Eliabby
Moreira. `fileKey` **`e5wJUzInAssoebx5npssKc`** —
`https://www.figma.com/design/e5wJUzInAssoebx5npssKc`. **Um só**: quem vier
depois amplia este arquivo, não cria o segundo. Um segundo arquivo é a
mesma doença que esta mesa existe para impedir, um andar acima.

**A estrada é de mão dupla, e isso foi medido, não suposto.** As 27 cores
das duas tabelas entraram como variáveis; foram puxadas de volta por
`get_variable_defs` e comparadas com `src/estilo.js` **por máquina**, num
script que importa o módulo de verdade. Bateram **26 de 27**. Depois o
valor de `amber` foi trocado *dentro do Figma* para um verde impossível, a
volta trouxe o verde, e a comparação acusou a divergência sozinha — é esse
o teste que prova que a troca existe. O valor foi restaurado.

**A única divergência é de formato, e vale saber.** O Figma guarda alfa em
um byte. `vinhetaCanto` é `rgba(4,3,8,.45)` no código e volta como
`#04030873`: `0x73 / 255 = 0,45098`, um milésimo acima. `corticaFilete`
(`.4`) volta exata, porque `0,4 × 255 = 102` é inteiro. **Portanto: alfa
que não for múltiplo exato de 1/255 não sobrevive à ida e volta.** Quem
comparar isto por máquina um dia tem de comparar com tolerância de 1/255 no
alfa — nunca por igualdade de texto.

**A ponte tem nome de código.** Cada variável leva `codeSyntax` WEB igual
ao caminho real em JS — `T.bg`, `MATERIAIS.corticaFundo` — e não uma CSS
custom property, que o projeto não tem. É por isso que o que volta do Figma
já vem com a chave do código: a comparação não precisa adivinhar o par.

**E o que a volta NÃO prova, dito antes que alguém suponha.** Ela prova que
o valor vive no arquivo e é lido por chave + nó, **sem ninguém selecionar
nada** — `get_variable_defs(fileKey, nodeId)` responde a frio, e foi
repetido em sessão separada. Ela **não** prova que uma pessoa editando a
variável na interface do Figma chega ao código: o valor de prova foi escrito
pela API de plugin. É plausível que dê no mesmo (o valor mora no arquivo,
não no caminho da escrita), mas plausível não é medido, e esta casa não
escreve suposição como se fosse número.

**A armadilha que custou uma investigação: `get_metadata` sem `nodeId`
MENTE.** Pedida a listagem de páginas do arquivo por chave, ela devolve
**só `Page 1`** — a página original, vazia. As sete páginas existem: o
`use_figma` dentro do arquivo lista as sete, o `get_metadata` **com**
`nodeId` devolve a subárvore inteira, e o `get_variable_defs` lê as
variáveis delas. Quem conferir este arquivo pela listagem de páginas vai
concluir que ele está vazio, e vai estar errado. **Confira por nó, nunca
pela lista.** (E `get_variable_defs` apontado a uma PÁGINA — `0:1` — não
falha dizendo "página não serve": cai no caminho da seleção e responde
*"You currently have nothing selected"*, que faz parecer que a ferramenta
exige um humano no desktop. Não exige. Exige um nó que **use** variáveis.)

### As peças que entraram

Entram as primitivas com **leitor real** — uso fora de linha de `import`.
A contagem foi refeita: dos 49 exports de `ui.jsx`, **25 têm dois ou mais
usos reais**, 20 têm exatamente um, e **4 têm zero** (`IconeBandeira`,
`IconeGota`, `IconeCirculoX`, `IconeFrasco`) — os mesmos quatro que a pauta
já nomeava, agora confirmados. Ficam de fora.

- **Botão** (`Botao` de `ui.jsx`; 234 controles no jogo, 218 deles crus) —
  24 variantes: *Papel* (Chamada · Gesto · Recuo) × *Estado* (Repouso ·
  Foco · Esperando · Impedido) × *Tamanho* (Normal · Pequeno), mais três
  propriedades: `rotulo`, `a razao`, `mostrar a razao`.

  **A primeira versão desta peça estava errada e foi refeita.** Ela tinha
  um estado *Desativado* — e o `jogo` provou que "não pode agora" são
  **duas coisas diferentes que hoje saem com o mesmo cinza**:
  `bloqueado = carregando || !!rolagem` governa **15** controles, e "o
  Mestre está a escrever" e "há um dado à espera" apagam a barra de ação de
  forma idêntica. O `Agir →` carrega três razões na mesma cara.

  Então **Esperando** fica opaco, com a forma intacta e a razão em âmbar —
  *isto volta*. **Impedido** cai a 45% com a razão em cinza — *isto não
  volta agora*. A diferença lê-se sem ler.

  **E a razão é um nó, não um `title`.** Ela existe na árvore, no dedo e no
  leitor de tela. Nos dois estados ela **nasce acesa**: apagá-la é um gesto
  deliberado de quem monta a tela. Era isso que faltava aos 31 botões mudos
  de hoje — alguém *ter de escolher* o silêncio.

  *Papel* substituiu *Tom* porque a escolha real não é uma cor: é que tipo
  de ação aquilo é. E **Destrutivo saiu do Botão** — virou peça própria,
  porque faz o que nenhum botão faz: pergunta.
- **A consequência** — 4 tons (Impedimento · Espera · Preço · Estado) × 2
  fixações (Linha · Balão). É a peça que o `jogo` pediu por nome, e a razão
  é dura: hoje o jogo tem **um** lugar para dizer o que vai acontecer, e é
  o `title` — um atributo de rato. Por causa dele o preço do Destino é
  invisível no telemóvel, 13 bloqueios não dizem porquê, o interruptor das
  rolagens não tem estado legível, e o `⛺` termina uma luta sem avisar.
  **A regra que ela carrega: nunca só-hover.** *Linha* vive sempre na
  árvore; *Balão* abre no dedo **e** no rato — se só abrir no rato, não é
  esta peça, é o `title` outra vez.
- **O gesto que custa** — *Etapa* (Armado · Perguntando) × *Estado*
  (Repouso · Foco), com o preço como campo obrigatório. São 14 ações
  irreversíveis no jogo e **onze não confirmam nada**. A peça vira pergunta
  **no próprio lugar**: não é modal, porque um modal para "remover Brann do
  grupo" é caro demais — e é por ser caro que onze delas hoje não têm
  proteção nenhuma. *Armado* não grita (contorno, não preenchimento): um
  vermelho cheio a gritar o dia inteiro deixa de significar perigo na hora
  em que importa. O Confirmar repete o **verbo**, nunca "Sim". E
  `onAccent` sobre `danger` dá 5,34:1, contra os 3,42:1 do `#fff` que hoje
  está no único botão que apaga alguém.
- **Fechar** — sair sem decidir. Hoje o xis é escrito à mão em cada tela,
  em **8 formas visuais e 5 tamanhos**. Não é destrutivo e nunca pergunta.
  **E o `✕` é da saída e de mais nada:** hoje o mesmo glifo fecha um painel
  em nove lugares e **expulsa um membro da guilda** noutro — duas ações,
  uma forma, sendo uma delas irreversível. O que expulsa usa o gesto que
  custa.
- **Selo de estado** — diz em que estado uma coisa está, e não se clica.
  Quatro tons (Neutro · Bom · Aviso · Perigo), **ponto mais palavra**: a cor
  sozinha nunca carrega o sentido, porque quem não distingue vermelho de
  verde tem de ler a mesma coisa.
- **Barra de medida** (`BarraMini` de `ui.jsx`) — rótulo, trilho e o número
  escrito, porque a barra sozinha não diz *4 de 20*. Dois níveis, e o corte
  é a regra que o código já tem: **abaixo de um terço** a cor vira perigo, e
  o número vira perigo com ela.
- **Véu** — 3 pesos (Leve · Pesado · Sem retorno). São 15 sobreposições no
  jogo, com **quatro regras de fecho, oito tintas de fundo e seis
  larguras** — e `Escape` não fecha nenhuma. **O que muda entre os pesos
  não é a opacidade: é se existe porta.** Leve e Pesado têm a saída no
  canto; *Sem retorno* **não tem**, e a ausência é desenho, não
  esquecimento — hoje o jogador procura um `✕` que nunca existiu, e por
  isso a peça diz por escrito que não há. O véu é sempre o próprio `bg` com
  alfa (60% / 85% / 94%): oito tintas viram três, e as três são a mesma
  cor. **Esta peça está incompleta de propósito** — ver as Discordâncias.

- **Os glifos** — os **11** ícones de `ui.jsx` com dois ou mais usos reais
  (`IconeD20`, `IconeCaneca`, `IconeSeta`, `IconeLivro`, `IconeFaiscas`,
  `IconeCaveira`, `IconeEspada`, `IconeOlho`, `IconeDado`, `IconeCheck`,
  `PontoAtivo`). Geometria idêntica à do código, caractere por caractere; o
  que muda é que a cor é **variável ligada**, não hex. Entram como
  componentes e não como imagem pela mesma razão que no código: um ícone
  que é arquivo não herda o token.

  **Os 20 de um uso só NÃO entraram**, e é decisão, não esquecimento: eles
  passam na catraca de hoje porque a linha de `import` conta como o segundo
  leitor. Biblioteca não é lugar de registrar furo.

### O nó que não se pôde dar: o Code Connect

**Zero peças ficaram amarradas, e não pela razão que a pauta previa.** A
pauta esperava que faltasse componente de código a que amarrar. Faltou
outra coisa: **o plano da conta não permite a ferramenta.** Os três
caminhos — `list_file_components_for_code_connect`,
`get_code_connect_suggestions` e `add_code_connect_map` — respondem a mesma
frase: *"You need a Dev or Full seat on an Organization or Enterprise plan
to use Code Connect."* A conta é `pro` com assento Full; falta o plano, não
o assento.

Então **8 de 8 peças estão sem nó**, e enquanto estiverem, **o que impede a
biblioteca de divergir do código em silêncio é o script de comparação** —
que prova hoje e não protege amanhã. Isto é dívida nomeada, não fracasso:
é decisão de quem paga o Figma, e não de desenho.

### O anel de foco é DESENHO NOVO, e fica dito

`:focus-visible` tem **zero ocorrências no projeto**. Desenhar o estado de
foco não é espelhar o que existe: é inventar. Legítimo, e necessário — um
jogo que só se joga com o dedo exclui quem navega por teclado — mas é
desenho novo e entra declarado, não contrabandeado como se já fosse assim.

**A forma:** duas sombras de raio zero — a de dentro, 2px em `bg`, abre o
vão; a de fora, 4px em `ink`, é o anel. É exatamente um
`box-shadow: 0 0 0 2px T.bg, 0 0 0 4px T.ink`, e foi escolhido por isso: o
que está no Figma e o CSS que um dia o implementa são a mesma construção,
não duas aproximações uma da outra.

**Um anel só, em todos os tons.** `ink` sobre `bg` é o maior contraste que
a casa tem, e o anel assenta no fundo da página, não no botão — então
funciona igual no âmbar, no contorno e no vermelho. Um anel por tom seria
bonito e seria três decisões onde cabe uma.

### O que se achou pelo caminho, e ainda não tem dono

- **`MATERIAIS` tem 13 entradas, não 11.** A pauta de D3 dizia 11; o
  arquivo tem 13, e D2 já tinha escrito 13. Corrigido aqui porque a
  comparação por máquina conta sozinha.
- **`JetBrains Mono` não tem peso 600 no Figma.** `FONT_CSS` carrega
  `wght@400;600`; o Figma oferece Regular, Medium (500) e Bold (700) — não
  há SemiBold. Os rótulos da biblioteca usam Bold. É uma diferença real
  entre o que o navegador desenha e o que o Figma desenha, e quem comparar
  tela contra tela vai tropeçar nela.
- **O véu da sobreposição não tem token.** O preto do fundo escuro mora em
  `sombra()`, que é privado de `estilo.js` e não sai. A biblioteca resolveu
  com `bg` a 75%, que é melhor design *e* usa tabela — mas o código ainda
  escreve preto literal nesses lugares.
- **Um quadro de arranjo não tem cor.** `figma.createAutoLayout()` nasce
  branco, e um branco não declarado é a mesma doença que a casa caça em cor
  literal — só que invisível até alguém tirar a foto. Foram quatro, e
  saíram. Fica a regra: quadro que só organiza leva `fills = []`.

---

## Discordâncias resolvidas

Quando o `jogo` e o `desenho` divergem, a decisão fica aqui **com os dois
lados escritos** — nunca em dois códigos diferentes. Uma divergência
registrada é barata; duas implementações da mesma ação custam para sempre.

### A escala de cerimônia — ABERTA, à espera do `jogo` (D3 · 14/09)

**Isto não é uma discordância resolvida: é uma decisão deixada em aberto de
propósito**, porque o `jogo` pediu para desenhar junto e receber pronto
seria atropelá-lo.

**O que o `jogo` disse.** O modal do dado (`App.jsx:512`) é o único lugar da
sessão em que se sente que se está a jogar: escurece a tela, o d20 treme,
para, e só então aparece o veredito. *O tempo entre o número e o veredito é
o jogo.* E ao lado dele, com o mesmo mecanismo disponível, **a conclusão da
primeira missão da campanha é a quarta de seis pílulas cinzentas iguais**
no log. Ele pediu uma variante do véu que diga *isto foi importante* — **e
avisou que um modal por conquista seria pior que o silêncio.**

**O que eu respondo, e é a parte que precisa do aval dele.** O pedido não
cabe no véu, e é por isso que a peça foi entregue incompleta. Um véu **é**
uma interrupção: qualquer variante dele custa um clique, por mais leve que
seja o fundo. Se a resposta a "isto foi importante" for um véu, o jogo
ganha um véu por conquista — exatamente o que ele não quer.

**A minha proposta: a escala tem quatro degraus e só os dois de cima são
véu.**

1. **nota** — a pílula no log. Não interrompe. É o que tudo é hoje.
2. **realce** — *o degrau que falta.* A mesma entrada do log, marcada: um
   filete acima e abaixo, a tinta em âmbar, e o Selo *"mudou agora"*.
   Continua a não interromper e continua a não custar clique. **É aqui que
   a primeira missão e a conquista deviam viver**, e não num véu.
3. **véu leve / pesado** — toma a tela, e tem porta. O dado, o achado, a
   subida de nível.
4. **véu sem retorno** — toma a tela e exige decisão. A morte, a
   recalibragem.

**O que fica em aberto, e é dele:** *quais* momentos sobem de 1 para 2. Eu
sei fabricar o degrau; **quando ele aparece é momento, e momento é do
`jogo`.** O Selo *"mudou agora"* que o degrau 2 precisa também está na
lista dele como [NOVO] e ainda não foi feito — os dois nascem juntos ou
nenhum funciona.

**O risco que eu assumo por escrito:** se o degrau 2 não existir, o `jogo`
vai acabar por usar o véu leve para conquistas — porque é a única coisa que
a biblioteca lhe dá — e a taverna passa a interromper o jogador para lhe
dar os parabéns. Prefiro registrar isto agora do que descobri-lo montado.
