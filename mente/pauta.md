# A pauta da mente

O que a mente pensou e ainda não fez. Cada item tem **peso** (ver a tabela em
`CLAUDE.md`, seção "A mente"): `leve` e `médio` o ciclo executa sozinho;
`pesado` espera a palavra da pessoa. Um item por ciclo. Feito vai para o
`diario.md` — daqui sai.

Formato de um item:

```
- [ ] **título curto** · peso · de: quem propôs · dd/mm
  o quê e por quê, em duas ou três linhas; qual lei da casa ele serve
  (ou qual suíte prova). Se médio: qual catraca garante que não regrediu.
```

---

## Para a pessoa decidir (pesado)

- [ ] **subir ao remoto o que já está local** · pesado · de: Claude · 13/09
  Os commits de `A mente e as maos` em diante (584a0cc, 60f639d, aae362c — e
  tudo o que a mente commitar daqui em diante) estão só locais. `git push` é
  deploy no Vercel — linha "git push" da tabela: decisão da pessoa, sempre.

- [ ] **o Narrador está sem saldo** · pesado · de: conselheiro · 13/09
  Jogado em 13/09: a Noite abriu, o primeiro turno chamou `api/narrador` e
  voltou 502 — "deepseek-v4-flash: 402 Insufficient Balance · gemini-3.6-flash:
  429 prepayment credits are depleted". Hoje ninguém consegue jogar Uma Vida
  nem o Capítulo; só o Duelo seco e a chave do Torneio rodam. Linha "custa
  dinheiro ou toca infra" — a pessoa decide qual provedor recarrega (ou se
  troca a ordem da fila em `api/narrador.js`).

- [ ] **a arena não porta os efeitos: toda queda abre com duas rodadas mortas** · pesado · de: conselheiro · 13/09
  Visto no Duelo (A Muralha × A Chama, 3 quedas): as rodadas 1 e 2 de CADA
  queda foram "A Muralha se guarda / A Chama se guarda", quatro linhas
  iguais antes do primeiro golpe. Caminho: `arena.js:112-116` traduz
  `buff`/`guarda` em "se guarda" sem efeito nenhum, e `companheiros.js:140-143`
  manda o piloto abrir com buff nas rodadas ≤ 2; o filtro de `meiaRodada`
  (`arena.js:137-139`) deveria tirar os buffs da mesa e aparentemente não
  tira todos. Corrigir de verdade é portar o sistema de efeitos do App à
  arena (o próprio módulo declara em `arena.js:133` que não porta) e refazer
  a catraca de equilíbrio 35–65% — mecânica que muda o que o jogador vive.
  Alternativa barata, também da pessoa: só o diagnóstico (teste em
  `teste-arena.mjs` que conta quantas rodadas de abertura são "se guarda").

- [ ] **metade das reviravoltas eleitas nunca nasce, e a maior nunca é lida** · pesado · de: conselheiro · 13/09
  `elegerReviravoltas` (`reviravoltas.js:195`) sorteia por semente uma forma
  MENOR entre quatro e uma MAIOR entre três. `alvoDaReviravolta`
  (`App.jsx:9894`) só tem detector para `aliado_agente` e `heranca_roubada`:
  num mundo que sorteou `trai_para_proteger` ou `informante_duplo` o alvo é
  `null` para sempre e a virada não acontece. E `mexerNaReviravolta`
  (`App.jsx:9919`) lê só `.menor` — as três formas maiores (patrono, cidade
  que paga dízimo, mestre de ofício) são acervo escrito e nunca vivido.
  Não achei tracker para `temCompanheiroComFamilia` (TIPOS_DE_LACO em
  `npcs.js:60` não tem "família"), `vezesQueUsouInformante` nem
  `antecedenteComOficio` (`antecedentes.js` não tem campo de ofício). As
  saídas mudam o que o jogador vive: (a) eleger só entre formas com
  detector — troca a verdade eleita de saves existentes; (b) ligar a maior
  — segunda reviravolta por campanha; (c) criar os trackers — órgão novo.
  A pessoa escolhe; qualquer uma vira fase com `teste-reviravolta.mjs`.

## Aberto (leve / médio — o ciclo pega daqui, o de maior valor primeiro)

- [ ] **acender os sinais baratos do snapshot do episódio** · médio · de: conselheiro · 13/09
  `snapshotDoEpisodio` (`App.jsx:9684`) entrega só `temLugarAmado`,
  `relogioRegionalAlto` e `pesoRecente`: dos oito episódios de
  `episodios.js:44`, só A Linha Escura e A Queda podem abrir numa campanha —
  os outros seis estão escritos e mudos. Trackers que JÁ existem, leitura
  barata: `cacandoAlguem` = missão ativa de tipo `cacada` em `missoesRef`
  (`missoes.js:213`); `posGuerra` / `aliancaFria` = potência com `tratado`
  "guerra" / "alianca" em `mapaRef.current.faccoes` (`diplomacia.js:326`,
  `gestao.js:98`); `antecedenteDivida` = `personagem.antecedente ===
  "nobre_caido"` (`antecedentes.js:23`, "atrai credores"); `itemMisteriosoDesperto`
  = item de classe "semente" no inventário — o mesmo detector de
  `alvoDaReviravolta` (`App.jsx:9906`). Ficam dormentes, sem tracker achado:
  `vinculoMortoPorAlguem`, `herdouAlgo`, `temDegraus`, `votoFeito`,
  `dominioPerdido`. Linha "ligar sinal dormente a tracker que já existe".
  Catraca: `teste-episodios.mjs` (episodioQueAbre com cada snapshot) e a
  regra de um-por-vez continua valendo; `mexerNoEpisodio` já está em
  `calou(...)`.

- [ ] **os temperos mudos do Termômetro** · médio · de: conselheiro · 13/09
  `termometro.js:105-117`: cada leitura carrega um `tempero`
  (`mao_estendida`, `vespera_forte`, `preco_cobra`, `prateleira_pesada`).
  `App.jsx:16053` consome só `prateleira_pesada` (→ `preferirTom: "pesado"`
  em `escolherAssunto`, `compasso.js:215`, que triplica assuntos `pesado`).
  Os outros três não têm leitor em `src/`. O tracker é o mesmo e já aceita
  `preferirTom`: ligar `mao_estendida` ao espelho — `preferirTom: "leve"`
  triplica os assuntos SEM `pesado` (o respiro depois da perda). Linha
  "ligar sinal dormente a tracker que já existe". `vespera_forte` e
  `preco_cobra` continuam dormentes até terem consumidor óbvio — dizer isso
  no diário. Catraca: `teste-compasso.mjs` (com sorte fixa, "leve" nunca
  escolhe pesado quando há alternativa) + `teste-termometro.mjs` (toda
  leitura com tempero não vazio tem leitor no App — regex, como faz
  `teste-ligacao`).

- [ ] **combate.js: três regras sem prova** · leve · de: conselheiro · 13/09
  `severidadeDano` + a tabela `SEVERIDADES` (`combate.js:515-523`),
  `ataquesDoInimigo` (`:677`) e `gastarRecurso` (`:706`) têm leitor único no
  App e zero linha de teste; `teste-dano.mjs` tem 42 linhas e só olha
  `danoDaClasse`. Provar: `SEVERIDADES` com `max` crescente; dano 0 → "erro";
  `vidaDepois <= 0` → "abate"; lendário nível 12 → 3 ataques, elite → 2,
  comum → 1; `gastarRecurso` consome uma vez, recusa a segunda e NÃO muta o
  objeto de entrada (imutabilidade). Linha "teste faltante para regra que
  existe". Vai em `teste-dano.mjs`.

- [ ] **calendario.js nunca foi provado** · leve · de: conselheiro · 13/09
  Nenhuma prova importa `src/calendario.js`, e ele guarda quatro tabelas
  (`MESES`, `ESTACOES`, `FESTIVAIS`, `SONHOS`) e o relógio do mundo. Provar:
  dia 1 = Brumal/primavera; dia 91 = verão E "Noite das Fogueiras"; dia 361
  = dia 1 (ciclo de 360); `FESTIVAIS.diaDoAno` únicos e dentro de 1..360;
  `SONHOS.efeito` ∈ {null, "inspirado", "perturbado"} — os dois nomes que
  `App.jsx:18170-18171` traduz em condição; `ehNoite(21*60)` e não
  `ehNoite(6*60)`. `rolarSonho` usa `Math.random` cru — aceitar `sorte`
  opcional (default igual) para a suíte provar sem sorte. Linha "teste
  faltante para regra que existe". Suíte nova `teste-calendario.mjs`.

- [ ] **"Em a arena às tochas": a contração que a arena não conhece** · leve · de: conselheiro · 13/09
  Visto no Duelo: "Em a arena às tochas: metade da luta é sombra." e "Em o
  fosso: paredes perto demais". `arena.js:159` monta `Em ${t.nome}` e os
  nomes de `TERRENOS_DA_ARENA` trazem artigo. `lugar.js:347` (`comEm`) já
  resolve isso para o acampamento. Bug com teste que prova (falha antes,
  passa depois): em `teste-arena.mjs`, nenhuma linha de queda começa com
  "Em a " / "Em o ". Linha "bug com teste que prova".

- [ ] **o acampamento em viagem repete o sítio na quarta noite** · médio · de: conselheiro · 13/09
  `acampamento.js`: `SITIOS_EMBARCADOS` tem 3 entradas, `SITIOS_DE_COMBOIO`
  3, `SITIOS_DE_ESTRADA` 4 — uma travessia de mar de uma semana dorme no
  convés, no porão, na cabine e no convés de novo. Ampliar cada lista para
  6–8 no mesmo formato `{ id, icone, abrigo, nome, dentro }` (o `dentro` é
  a coisa concreta que a narração toca; nada de substantivo solto). Lei
  "nada de 4 ou 10 situações"; linha "ampliar acervo numa tabela existente".
  Catraca: `teste-acampamento.mjs` (`escolherSitio`, `chaveDoSitio` —
  mesma chave, mesmo sítio), ids únicos por lista, `abrigo` ∈ 0..2.

- [ ] **o erro do provedor vaza para o jogador** · médio · de: conselheiro · 13/09
  Quando o Narrador cai, `App.jsx:19726` imprime `falha.motivo` cru — o
  jogador leu "deepseek (deepseek-v4-flash: 402: {"error":{"message":
  "Insufficient Balance"...". `falha.motivo` nasce em `App.jsx:10443` do
  `e.message`, que carrega a string de `api/narrador.js:238`. Lei "o
  sistema não fala de si mesmo": na tela fica "O Mestre não respondeu.
  Tentar de novo"; o motivo técnico vai ao `console` (e, se quiser, atrás
  de um "detalhes" discreto). Linha "ajuste pequeno de tela". Prova:
  helper puro `motivoParaOJogador(msg)` num módulo (ex.: `src/janela.js`
  ou módulo novo `src/falha.js`) que devolve "" para JSON/códigos HTTP e
  passa só frases humanas — provado em Node; o App só chama.

- [ ] **"roster" e o selo explicado na tela do Duelo** · médio · de: conselheiro · 13/09
  `App.jsx:4415` "Um do roster (o duelo justo)", `:4401` "· do roster",
  `:4460` "dois do roster" — palavra estrangeira e de bastidor no menu que
  a fase decidiu falar em voz de mundo ("Uma Noite", "Duelo"). Trocar por
  "um campeão da casa" / "da casa". E `:4490` explica o mecanismo ("duas
  máquinas com a mesma dupla e a mesma semente chegam a este mesmo selo"):
  o selo é gameplay (confere entre jogadores), a explicação vai para o
  `title`. Linha "ajuste pequeno de tela (texto)". Prova: o varredor do
  item seguinte.

- [ ] **varredor: palavra de bastidor em texto visível** · leve · de: conselheiro · 13/09
  Erro já visto (o "roster" acima, e a memória `sistema-nao-fala-de-si`):
  um `check-bastidor.mjs` que lê `App.jsx`, `ui.jsx`, `painel-*.jsx` e falha
  se uma string JSX visível (texto entre `>` e `<`, ou dentro de
  `title="..."` fora de comentário) contém `roster`, `postura`, `preset`,
  `tracker`, `snapshot`, `modo rápido`, `PvP`. Lista de perdão com motivo
  escrito, como em `teste-ligacao`. Linha "varredor novo para erro já
  visto". Entra em `rodar-tudo.mjs` como os outros `check-*`.

## Recusado (com o motivo — para a mente não propor de novo)

_(vazio)_

---

_Nota do conselheiro, 13/09: joguei o Duelo seco de ponta a ponta (casa
serve rival, 3 quedas, selo) e abri a Noite (A Muralha × A Linha Escura)
até o primeiro turno; o Narrador não respondeu por falta de saldo nos
provedores, então Uma Vida e o Capítulo narrado NÃO foram jogados — o que
está acima sobre eles vem do código e das suítes._
