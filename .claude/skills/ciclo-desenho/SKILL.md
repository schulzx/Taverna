---
name: ciclo-desenho
description: Roda um ciclo da segunda mente do Taverna — a do visual. Observar, semear a pauta do desenho, escolher por peso, decidir com o jogo e o desenho pelo Figma, construir com o aprendiz, provar, commitar, subir e registrar. Use quando a pessoa diz "roda um ciclo de desenho", "deixa os designers trabalharem", ou quando a tarefa agendada do desenho acorda.
---

Rode **um** ciclo da mente do desenho.

1. Leia `CLAUDE.md` (as seções "A mente", "As duas mentes" e "A mesa de
   design") e `.claude/agents/regente.md` — o roteiro está lá.
2. Chame o agente `regente` com a instrução: "Rode um ciclo completo pelo seu
   roteiro. Um item. Relate no fim: o que a dupla decidiu, o que foi
   construído, o número que prova, a versão, o hash, e o que ficou para a
   pessoa decidir."
3. Quando ele voltar, repasse à pessoa o relato em cinco linhas no máximo —
   e, se houver itens em "Para a pessoa decidir" na pauta do desenho, liste-os
   com uma linha cada, porque é a única coisa que precisa de resposta.

Não faça o trabalho do regente você mesmo: o ciclo tem de aparecer no painel
de tarefas, com cada mão nomeada, para a pessoa ver o processo.

Se a fila do sistema estiver com o bastão do `App.jsx` (`.claude/app-jsx`
recente), isso é normal — o regente escolhe um item que não precise dele.
