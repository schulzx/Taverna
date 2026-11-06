# SQ2 · a fiação do portão no App.jsx (para o `oficial`)

O motor já está ligado (`src/portao-das-secundarias.js`; o figurante, a
proposta do Cronista, a trama, a petição do prelúdio e o veto da pauta, nos
`src/motor/*.js`). Falta o que só existe no `App.jsx`. Tudo por âncora, com o
bastão; nada aqui muda a principal nem a abertura.

## 0. O import e um ajudante (uma vez)

Junto do import de `./abertura.js` (âncora:
`import { abrirAbertura, garantirAbertura, pedidoDaAbertura, muralLiberado, sinosForaDeHora, tramaTemEspaco } from "./abertura.js";`):

```js
import { secundariasAbertas } from "./portao-das-secundarias.js";
```

E, no corpo do componente, perto de `garantirMural`, o ajudante. **Abre se
estourar**: um portão que estoura não pode fechar o jogo a quem já joga.

```js
const portaoAgora = () => {
  try { return secundariasAbertas({ abertura: aberturaMundoRef.current, espinha: espinhaRef.current, nivel: (personagemRef.current || personagem || {}).nivel }); }
  catch (e) { calou("o portão das secundárias", e); return { abertas: true, mural: true, porque: "erro" }; }
};
```

## 1. O mural do mundo: `garantirMural`

Âncora (a linha da MM13, **que fica como está**, porque `teste-mm13-abertura`
a lê à letra):

```js
    if (!muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })) return;
    if (!forcar && (muralRef.current || []).length > 0) return;
```

Entre as duas linhas, uma nova:

```js
    if (!portaoAgora().mural) return; /* SQ2: o mural só depois do portão e do nível do mural */
```

## 2. A soleira: `ofertasDaSoleira`

Âncora:

```js
      for (const c of (mural || []).filter((c) => c && c.oferecido && !cartazJaVenceu(c) && podeAceitarCartaz(c) && muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current }))) {
```

Condição: acrescentar ` && portaoAgora().mural` no fim do `filter` (ou, mais
barato, calcular `const muralDoPortao = portaoAgora().mural;` antes do `for`
e pôr `&& muralDoPortao`). **A asserção de texto muda:**
`teste-mm13-abertura.mjs`, a do "a soleira não oferece cartaz oferecido antes
do mural abrir" (procura `const soleira = corpoApos(app, "const ofertasDaSoleira`),
lê esta linha à letra. Mova-a para a linha nova **com o motivo num comentário**
(SQ2: o papel pregado espera também o portão da introdução).

## 3. A noite: o descanso longo

Âncora:

```js
      const r = processarDescansoLongoEventos(eventosRef.current, ctx, { dia: diaRef.current, secundariasAtivas: secundarias });
```

Para:

```js
      const r = processarDescansoLongoEventos(eventosRef.current, ctx, { dia: diaRef.current, secundariasAtivas: secundarias, secundarias: portaoAgora().abertas });
```

Com o portão fechado, a noite não sorteia missão (`questNova`) nem arco
regional (`globalNovo`, que impõe o `mis_global`); o fio local continua.

## 4. O correio do reino: `avancarDiasReino`

Âncora:

```js
      const pc = processarDiaCorreio(correioRef.current, { sorte: sorteDoTurno("correio"),
```

Acrescentar o campo (o prelúdio do motor já o passa):

```js
        peticoes: portaoAgora().abertas,
```

## 5. Os contratos da casa: `trabalhosDaMinhaCasa`

Âncora:

```js
  const trabalhosDaMinhaCasa = (() => {
    const g = minhaCasa(); if (!g) return [];
```

Depois dela: `if (!portaoAgora().mural) return [];` — os contratos da casa
são mural. **Nota para o `jogo`/`frontend`:** com a casa sem trabalho, o
painel dela precisa de uma linha da ficção ("ainda não há serviço para quem
chegou ontem"), nunca o nome do mecanismo.

## O que NÃO precisa de mão

- `talvezDarUmaTrama` do App (a cópia antiga, perto de `MM14: uma trama
  forçada só quando a principal deixou espaço`) só é chamada com
  `forcar: true` (a abertura), e o forçado fura o portão de propósito. A trama
  de todo turno é a do prelúdio, já ligada.
- O figurante, a proposta do Cronista e o veto da pauta: já no motor.
- O botão "📌 procurar cartazes" do painel do mural continua a chamar
  `garantirMural(true)`, que agora volta vazio antes do nível do mural. O que
  o painel mostra fechado é SQ4 (`frontend`).

## A prova

`cd testes && node teste-portao-das-secundarias.mjs && node teste-mm13-abertura.mjs && node teste-ligacao.mjs`
— e `teste-soleira-verbos.mjs`, que lê a soleira.
