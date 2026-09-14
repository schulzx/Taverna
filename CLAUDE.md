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
- `mente/diario.md` — um bloco por ciclo: quem fez o quê, cada decisão média
  com o motivo. É por aqui que a pessoa vê o processo.

Os agentes: `conselheiro` (pensa, escreve a pauta), `orquestrador` (rege o
ciclo), `backend` / `frontend` / `testes` (as mãos). O roteiro do ciclo está
em `.claude/agents/orquestrador.md`; `/ciclo` roda um.

---

## Commits

Português, narrativo, o *porquê* antes do *o quê*. Terminar com:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

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
