# A pauta do desenho

A fila da **segunda mente** — a do visual. O `regente` pega daqui, uma etapa
por ciclo, independente da fila do sistema (`mente/pauta.md`).

Mesmos pesos do `CLAUDE.md`, com a tabela de design: `leve` e `médio` o ciclo
executa sozinho; `pesado` espera a pessoa. **Fluxo do jogo e mover o que o
jogador já usa são sempre `pesado`** — ali o custo é a memória de quem joga,
e nenhum número resolve. Paleta e tipografia são `médio` **se comprovadas**
pela régua dos quatro dentes.

A forma de cada coisa mora em `mente/formas.md`; o feito, em
`mente/diario-desenho.md`.

---

## Para a pessoa decidir (pesado)

_(vazio)_

## Aprovado pela pessoa — executa como fase, UMA etapa por ciclo

### Fase D — a casa ganha um desenho (a mesa de design nasce)
Decisão da pessoa (14/09): três agentes novos — `jogo`, `desenho`, `aprendiz`
— trabalhando pelo Figma, com liberdade para mudar o que for preciso **desde
que comprovado**. Meta declarada: *"o melhor jogo de RPG com a melhor
experiência e qualidade de um AAA."*

Esta fase **não faz nada bonito ainda**, e é de propósito: ela constrói o
chão que impede o defeito que a pessoa nomeou (a mesma ação com duas caras).
Medir antes de mexer, como a Fase A ensinou — aqui aplicado ao visual.

- [ ] **D1 · o inventário honesto** · de: pessoa · 14/09
  Levantar o que existe, sem mudar nada: as 15 cores de `T` e onde cada uma
  é usada; as **30 cores literais no `App.jsx`** que passam por fora da
  tabela (e as dos `painel-*.jsx`); as 3 famílias e 7 animações de
  `FONT_CSS`; as primitivas de `ui.jsx`; e — o mais importante — **as ações
  que hoje aparecem com mais de uma forma**. Entregue como medição, no
  diário, com número. Dono: `desenho` com o `jogo`.
- [ ] **D2 · o estilo ganha casa própria** · de: regente · 14/09
  `T` e `FONT_CSS` moram em `constantes.js`, que é território do sistema —
  e a tabela de estilo é a mesa de design em pessoa. Levá-los para um
  módulo próprio (`src/estilo.js`) com reexport compatível, para que as
  duas mentes parem de disputar o mesmo arquivo. Linha "refatorar sem mudar
  comportamento": **zero diferença na tela**, provada por build limpo e
  pelas suítes. É a etapa que compra independência para todas as seguintes.
- [ ] **D3 · a biblioteca no Figma** · de: pessoa · 14/09
  Criar o arquivo do Taverna no Figma e nele a biblioteca: **variáveis
  primeiro** (espelhando a tabela de estilo e as medidas), **componentes
  depois** (as primitivas de `ui.jsx`, com estados e variantes de verdade —
  repouso, foco, pressionado, desabilitado). Carregar `figma-generate-library`
  junto de `figma-use`; `figma-create-new-file` é pré-requisito obrigatório
  do `create_new_file`. Ao fim, **Code Connect** amarrando componente do
  Figma a componente de código, para que não possam divergir em silêncio.
- [ ] **D4 · as formas escritas** · de: pessoa · 14/09
  `mente/formas.md` deixa de estar vazio: toda ação que o jogador toca hoje
  ganha sua forma declarada (quando, forma, movimento, onde vive, por quê,
  peso), a partir de D1 e D3. Onde D1 achou duas caras para a mesma ação, a
  dupla decide **uma** e escreve a discordância resolvida.
- [ ] **D5 · a catraca do desenho** · de: pessoa · 14/09
  `check-formas.mjs` (entra no `rodar-tudo.mjs`): nenhuma cor literal fora
  da tabela de estilo nos arquivos de tela; nenhum controle sem forma
  declarada em `mente/formas.md`; toda animação com saída
  (`prefers-reduced-motion`). Lista de perdão com motivo escrito, no molde
  de `teste-ligacao`. É o que faz a Fase D valer para sempre em vez de
  valer hoje.

  **Depois de D5**, a mesa propõe livremente pela pauta — a animação do
  dado, a batalha que toma a tela (essa é `pesado`, da pessoa), a paleta, o
  que for. Antes de D5, cada melhoria custaria o dobro e apodreceria na
  metade do tempo.

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **a interface sai do App.jsx, uma tela por vez** · médio · de: regente · 14/09
  Medido em 14/09: `App.jsx` tem **21.295 linhas e 939 `style={{}}`** —
  **63% da interface do jogo**. Fora dele vivem 4.994 linhas e 580 estilos
  (11 painéis, `ui.jsx`, e os quatro desenhos). Enquanto a tela morar no
  `App.jsx`, toda etapa de design disputa o bastão com a mente do sistema.
  Cada tela levada para um `painel-*.jsx` próprio compra independência
  permanente — **prefira mover a remendar no lugar**. Não é uma etapa: é um
  hábito, e vale como meia-etapa em qualquer ciclo que já segure o bastão.
  Catraca: build limpo, suítes verdes, e a tela idêntica no navegador.

## Recusado (com o motivo — para a mente não propor de novo)

_(vazio)_
