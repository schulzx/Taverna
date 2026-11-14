# O quadro da quest — a planta (Fase QQ, 13/11/2026)

Aprovado pela pessoa («pode seguir») na versão que corrige `mente/sessao-19.md` (a proposta ambiciosa): a carta que o caso precisa **nunca se perde**. Fundamento: GUMSHOE (Robin D. Laws — a pista essencial nunca depende do dado) e a «regra das três pistas» (Justin Alexander, *The Alexandrian*). O motor é `src/quadro-da-quest.js`; a prova, `testes/teste-quadro-da-quest.mjs`.

## 1. O modelo

- **Um quadro por quest ativa** (`osQuadrosDoEstado`: as mesmas quests que a pauta vê). A pergunta do caso é a etapa de agora. Sem cartas, sem quadro (a tela esconde-o).
- **Essenciais** saem das condições das etapas: cada átomo de `PISTAS_DO_PASSO` é uma carta — `descobriu` (lugar), `consultou` (pessoa), `tem` (objeto), e `conversou` (pessoa) só quando a etapa tem outra pista (no mistério, sempre). Contagem > 1 é laço, não carta. A biblioteca já escreve as investigações como «pelo menos 2 de 3»: cada um dos três é uma carta.
- **Extra** (`EXTRAS_DO_QUADRO`): a fraqueza do vilão (global: uma só para todos os quadros), o cúmplice (o papel `fio` que não é passo), uma vantagem (`VANTAGENS_DO_CONFRONTO`). Só no tipo 1 e fora do confronto; quantas, pela semente (`QUADRO_POR_ARCO`).
- **Estados**: `costas` (só a forma: «um lugar», «uma pessoa», «um objeto»), `virada` (o facto e de onde veio), `preco` (virada com o carimbo do preço), `perdida` (extra sem caminhos). Marcas: `futura` (etapa por vir, sem caminhos: a silhueta) e `sobra` (a etapa fechou por outras duas).
- **Caminhos**: `CAMINHOS_DA_CARTA` por forma (≥2 sempre; o lugar e o objeto têm ≥2 que não dependem de pessoa nenhuma), cada um com os desafios do catálogo que o viram e o custo dito antes do clique. Todo caminho de uma forma produz o facto da forma, e o livro não mente. As extra investigam (`CAMINHOS_DA_EXTRA`), e nunca dizem o nome do que escondem.

## 2. Quem vira

- **Só o dado do sistema** (`VEREDITO_DO_SISTEMA`: o desafio, o resultado e `total`/`dc`). A prosa não é veredito: `virarCarta` devolve `null`.
- **Essencial — sucesso:** vira limpa. **Falha:** vira com um preço de `PRECO_DA_FALHA`, escolhido pela semente (por pouco, ≤ `QUADRO_DA_QUEST.porPouco`: só os leves); no mistério, os números ×`peso`. Nos dois casos devolve `escreve` (o facto, pela `PORTA_DA_CARTA`) e, no lugar, o `achado` pronto para `oLivroDoAchado`.
- **Extra — sucesso:** vira, e o `ganho` vai a `quadro.ganhos`. **Falha:** queima o caminho (a régua do `jaTentou`: a mesma coisa do mesmo jeito não se repete); sem caminhos, perde-se.
- **O `jaTentou` e a essencial não brigam:** a falha já vira a carta, logo não há segunda tentativa a bloquear. Para a extra, o `jaTentou` e o caminho queimado dizem a mesma coisa.

## 3. A tabela do preço

| id | formas | leve | efeitos (×2 no mistério) | porta |
|---|---|---|---|---|
| tempo | lugar, pessoa, objeto | sim | minutos 120 | tempo-do-turno |
| incompleta | as três | sim | incompleta + minutos 30 | só a carta e a pauta |
| alerta | lugar, pessoa | não | avisa_vilao + relogio_do_fio 1 | quests-do-turno (EFEITOS_DA_QUEST) |
| cobra | pessoa | não | moedas −15 | idem |
| danificado | objeto | não | danificado | aplicar (a marca no item) |

## 4. Como o passo anda

O passo anda **só** pelo facto que a carta escreve no livro (o mesmo átomo que a etapa julga). A essencial virada por outra porta (o Cronista, a busca do passo) vê-se pelo próprio livro, sem memória.

## 5. O save

`estado.quadro` = `{ v: 1, cartas: { "<quest>|<carta>": { dia, como, caminho, preco?, queimados? } } }` — **campo novo, aditivo, ignorado pela versão antiga** (`garantirQuadro` limpa-o; teto 64, sai a mais velha). Guarda só o que o livro não sabe: como virou e os caminhos queimados.

## 6. A pauta

Pela **pauta dinâmica**, nunca bloco estático (o teto é sagrado). `oQuadroNaPauta(quadros)` → `{ linha, naoPode }`: o que já se sabe (até 3 faces por quadro, «pela metade» na incompleta) e o que falta pela forma, com teto de 260; o veto «não revelar o que está por saber» vai para o NÃO PODE. Proposta: uma secção `quadro` com prio 2,44 (junto do RUMO e do FECHO), a decidir na fiação contra a medida do teto.

## 7. O que pede ao App (o `oficial`)

1. **O resolver do teste** (`concluirRolagem`): com `osQuadrosDoEstado`, achar a carta e o caminho do teste (o lugar onde se busca, a pessoa com quem se fala) e chamar `virarCarta`; aplicar `escreve` pela porta, o `preco.efeitos` e o `custo`; guardar `memoria` em `estado.quadro`. Tudo em `calou(...)`.
2. **Save e load** de `estado.quadro` (ref no save, `garantirQuadro` no load).
3. **A pauta**: `oQuadroNaPauta` numa secção dinâmica, com o veto.

## 8. O que pede ao `desenho` (a peça)

A carta (costas pela forma, virada com face e origem, o carimbo do preço, a perdida riscada), o quadro (a pergunta e as cartas, as futuras em silhueta), e o momento de virar (som, peso, o nome de onde veio). Antes do clique: os caminhos e, na essencial, o preço possível (`seFalhar`). Nenhum nome de mecanismo na tela.

## 9. As etapas

- **Q1** (feita): o módulo puro, as tabelas, a suíte, este plano.
- **Q2** (backend): `aCartaDoTeste(quadros, veredito, onde)` — que carta e que caminho um teste do sistema vira (o lugar, a pessoa, o desafio), provado sobre o catálogo.
- **Q3** (oficial): a fiação defensiva da §7; a entrada sai da lista de espera da `teste-ligacao`.
- **Q4** (desenho + jogo + aprendiz): a peça da §8, no Figma primeiro.
- **Q5** (backend): o `ganho` das extra no confronto (o número, na tabela da luta) e a fraqueza conhecida na pauta do confronto.
- **Q6**: a prova jogada (uma sessão de mistério; a régua: ninguém preso por azar, e quantas cartas viram por sessão).
