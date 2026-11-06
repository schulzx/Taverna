# SQ3 · a fiação da secundária planeada (para o `oficial`)

O motor está pronto e provado (`src/secundaria-planeada.js`,
`testes/teste-secundaria-planeada.mjs`). A noite (`processarDescansoLongoEventos`,
geradores.js) **só planeia quando recebe o mundo**; sem ele faz, letra por letra,
o de antes. Ligar são três toques, todos dentro de `calou`/`try`.

## 1. A noite recebe o mundo (App.jsx, o descanso longo)

Âncora (única):

```js
const r = processarDescansoLongoEventos(eventosRef.current, ctx, { dia: diaRef.current, secundariasAtivas: secundarias, secundarias: portaoAgora().abertas });
```

Passa a:

```js
const r = processarDescansoLongoEventos(eventosRef.current, ctx, { dia: diaRef.current, secundariasAtivas: secundarias, secundarias: portaoAgora().abertas, mundo: mundoDasTarefas(), missoes: missoesRef.current || [], historia: contextoDoElenco() });
```

`contextoDoElenco()` já existe (App.jsx ~5954) e é exatamente a forma que
`historia` lê (`espinha`, `guildas`, `base`, `npcs`, e o elenco do save em
`estado`): passa-se tal qual, e o elenco da secundária é o mesmo das subtramas.

Nada mais muda neste bloco: `r.questNova` sai com `titulo`, `descricao` e
`objetivo` (o envelope `questGerada` e a linha «📜 Fio de história» ficam
iguais), e com a missão inteira em `r.questNova.planeada`. A chamada seguinte,

```js
const mFio = tarefaParaMissao({ ...r.questNova, tipo: "secundaria", status: "ativa", nota: "", sorteada: true }, mundoDasTarefas());
```

já a entrega tal qual (`tarefaParaMissao` reconhece `planeada`).

## 2. O prazo conta (o mesmo bloco)

A planeada traz `prazo` (4, 6 ou 8 noites) — é o custo de falhar. O caminho da
noite nunca chamou `iniciarPrazo` (App.jsx ~15787), e sem ele o diário mostra
um prazo que nada faz andar. Logo depois do `mFio`:

```js
const mFio0 = tarefaParaMissao(...);
const mFio = mFio0 && mFio0.prazo > 0 ? iniciarPrazo(mFio0) : mFio0;
```

(`iniciarPrazo` já lida com a lista de relógios cheia.) O fio antigo tem
`prazo: 0`, logo não muda.

## 3. O fecho muda o mundo (motor/depois-do-turno.js, `conferirAsMissoes`)

No laço `for (const m of r.concluidas)`, junto da paga (depois do bloco de
`pagaDoFecho`), em `try { … } catch (e) { calou("o fecho da secundária", e); }`:

```js
const L = lerSecundaria(m);            // import de ../secundaria-planeada.js
if (L && L.fecho) {
  if (L.fecho.tipo === "laco") {       // quem pediu: firmarLaco (npcs.js)
    const k = Object.keys($ref.npcs || {}).find((n) => mesmaPessoa(n, L.fecho.quem));
    if (k) { const npcs = { ...$ref.npcs, [k]: firmarLaco($ref.npcs[k], L.fecho.laco, $ref.dia) }; $ref.npcs = npcs; setNpcs(npcs); }
  } else if (L.fecho.tipo === "lugar" && L.fecho.chave) {   // revelar (mundo-base.js)
    const b = revelar($ref.baseMundo, L.fecho.chave); $ref.baseMundo = b; setBaseMundo(b);
  } else if (L.fecho.tipo === "porta") {                    // descobrirVizinhanca (geografia.js)
    const d = descobrirVizinhanca($ref.mapa, L.fecho.cidade);
    if (d.novas.length) { $ref.mapa = d.mapa; setMapa(d.mapa); linhas.push(`🧭 Para lá de ${L.fecho.cidade}: ${d.novas.join(", ")}.`); }
  }
}
```

Se quem pediu ainda não está no registo (`npcs`), o laço espera: não se cria
gente pelo fecho.

## O Narrador

Nada novo no prompt nem na ficha do ator. A planeada entra pelos canais de toda
missão: o envelope `questGerada` na noite em que nasce, o diário/pauta depois,
e a virada pelo prelúdio (`viradaDevida`, que já corre para toda missão ativa).

## A catraca

`lerSecundaria` tem hoje como leitor a suíte; com o passo 3 passa a ter o
motor. `planearSecundaria` e `podeNascerSecundaria` são lidas por geradores.js.
