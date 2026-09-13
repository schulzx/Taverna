---
name: ciclo
description: Roda um ciclo da mente do Taverna — observar, semear a pauta, escolher por peso, executar pelas mãos, provar, commitar local, registrar no diário. Use quando a pessoa diz "roda um ciclo", "deixa a mente trabalhar", ou quando a tarefa agendada acorda.
---

Rode **um** ciclo da mente do Taverna.

1. Leia `CLAUDE.md` (a seção "A mente" é a sua licença e o seu limite) e
   `.claude/agents/orquestrador.md` — o roteiro do ciclo está lá.
2. Chame o agente `orquestrador` com a instrução: "Rode um ciclo completo
   pelo seu roteiro. Um item. Relate no fim: o que fez, a versão, o hash do
   commit, o que ficou para a pessoa decidir."
3. Quando ele voltar, repasse à pessoa o relato dele em cinco linhas no
   máximo — e, se houver itens em "Para a pessoa decidir" na pauta, liste-os
   com uma linha cada, porque é a única coisa que precisa de resposta.

Não faça o trabalho do orquestrador você mesmo: o ciclo tem de aparecer no
painel de tarefas, com cada mão nomeada, para a pessoa ver o processo.
