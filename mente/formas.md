# As formas

**Uma ação, uma forma.** Este arquivo é onde o `jogo` e o `desenho` se
encontram, e é a única fonte de verdade sobre a cara de cada coisa que o
jogador toca. Quem constrói (`aprendiz`, `frontend`) lê daqui — e para,
quando não acha.

Se a mesma ação aparece com duas caras no jogo, uma delas é defeito. Não é
questão de gosto: é a lei da casa aplicada à interface.

A verdade visual mora em **dois lugares que não podem divergir**: a
biblioteca no **Figma** (o desenho) e as tabelas em código (`T` e `FONT_CSS`
em `constantes.js`, as primitivas em `ui.jsx`). O Code Connect amarra os
dois. Este arquivo é o índice em prosa dos dois, com o *porquê* — que nenhum
dos dois guarda.

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

## Discordâncias resolvidas

Quando o `jogo` e o `desenho` divergem, a decisão fica aqui **com os dois
lados escritos** — nunca em dois códigos diferentes. Uma divergência
registrada é barata; duas implementações da mesma ação custam para sempre.

_(vazio)_
