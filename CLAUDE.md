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
4. **Bump** de `VERSAO` em `src/constantes.js` (hoje `v9.221`).
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

## Commits

Português, narrativo, o *porquê* antes do *o quê*. Terminar com:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

Só commitar/subir quando a pessoa pedir. `git push` faz deploy no Vercel.

---

## Memória do projeto

Estado longo e decisões vivem em
`C:\Users\clara\.claude\projects\C--Users-clara-Desktop-Taverna\memory\`
(índice em `MEMORY.md`). Consulte antes de grandes mudanças.
