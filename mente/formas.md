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

## Discordâncias resolvidas

Quando o `jogo` e o `desenho` divergem, a decisão fica aqui **com os dois
lados escritos** — nunca em dois códigos diferentes. Uma divergência
registrada é barata; duas implementações da mesma ação custam para sempre.

_(vazio)_
