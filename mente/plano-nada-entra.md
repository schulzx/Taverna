# Nada entra pela IA — a Fase NE (13/11/2026)

**A palavra da pessoa:** *«Consegue conferir se ainda existe alguma opção de entrada pelo narrador ou pela
IA? Ela não deve ter entrada de informações ou controle algum sobre o sistema… isso deve evitar objetos
inventados.»* Depois da auditoria: *«Perfeito, aprovo as duas sugestões, pode começar»* — tirar o Arquivista
e trocar o Léxico por tabelas nossas.

**A régua:** nenhuma IA escreve estado de jogo. Os envelopes e a pauta (sistema → IA) continuam: são a
direção certa. A prova é uma suíte que corre o turno com a resposta da IA cheia de declarações e confere
que o save sai igual ao de uma resposta só com prosa.

## O que a auditoria achou (13/11)

- O jogo publicado corre em `MODO_DO_NARRADOR.mestre` (`src/motor/portas-do-narrador.js`): as 46 portas da
  tabela abertas. `MODO_DA_MESA` (App.jsx ~533) só lê `VITE_MODO_DO_NARRADOR` em dev.
- **O Cronista** (`src/motor/cronista-do-turno.js`; o gatilho ~85, o cânone ~479–513): 30 chamadas em 44
  respostas na 19.ª; 13 secções sob uma porta só; o molde aceita `"tipo":"artefato"` e `julgarCanone`
  (`cronista.js` ~671) não confere se o objeto existe. É o caminho da «chave mestra».
- **Nove portas fora da tabela:** o livro de factos lido da prosa (facto `visto`, que satisfaz `conheceu` da
  quest: App ~11196 → `livro-do-turno.js` ~91 → `em-cena.js` ~516); o alvo do ataque tirado da prosa (App
  ~18445, `agressao.js` ~577); a luta prometida (App ~21953); o núcleo em cena lido das falas (App ~6131);
  os marcadores `__vitoriaAuto`/`__inimigosFinais` (`luta-do-turno.js` ~129, 260); `resp.perigo` (App
  ~10481, podado sempre); **o Arquivista** — três IAs atrás de «recalibrar save antigo» (App ~2576,
  ~24333–24520) e «Recalibrar ascensão» (`painel-ascensao.jsx` ~36, 229); **o Léxico** (App ~6041).
- O modo não chega a `portasDaLuta` (App ~10276) nem a `aMesaDoTurno` (~10523).
- O prompt e os envelopes ainda PEDEM declarações: `raid:` (`prompt.js` ~602), `combate_iniciar` no ataque
  sem alvo (`agressao.js` ~1072), `fe:`/`milagre:`/`ascender:` (`divindades.js` ~230, 391), o objeto do
  cartaz «mande-o com adicionar_itens» (`ofertas.js` ~525), `jornada_meio`/`cidade_atual` na viagem sem
  destino (`envelopes-do-turno.js` ~265), «registre no cânone» na ascensão (`meio-do-turno.js` ~653).
- O pedido do `ator` (`pedido-do-ator.js`) parou em 03/11; a ficha (`ficha-de-ator.js`) acompanhou até 11/11
  mas perde o facto do sucesso. Logo o modo novo é **o pedido do `mestre` com as portas fechadas**.
- A prosa volta ao Narrador pelo histórico: fechar as portas tira o inventado do estado, não da conversa.

## As etapas

- **NE1 · o Cronista não escreve o que não existe.** A porta `cronista` parte-se por secção na tabela; o
  cânone (artefato/lugar/gente) fecha já, ou só aceita o que a base, a espinha, as quests e o inventário
  conhecem.
- **NE2 · a tabela conta tudo.** As nove portas de fora entram em `PORTAS_DO_NARRADOR`, com a sua peça
  fechando; os `__*` filtram-se em qualquer modo; o modo chega a `portasDaLuta` e `aMesaDoTurno`;
  `teste-nada-entra-pelo-ator.mjs` cobre-as.
- **NE3 · o Arquivista sai.** Saem os dois botões; o código fica (voltar é uma linha).
- **NE4 · os substitutos.** O sistema faz o que só a IA fazia: o alvo do ataque sem alvo (escolhe entre
  quem está em cena, ou «não há ninguém»); o objeto do cartaz; o recrutamento pela conversa; a fé, o
  milagre, a ascensão e a raid; a chegada da viagem sem destino; o fim do evento global; as promessas.
- **NE5 · o pedido não pede.** Saem do prompt e dos envelopes todos os «mande isto em `mudancas`».
- **NE6 · o Léxico vira tabela.** Vocabulário do mundo por tabela nossa, por semente.
- **NE7 · o modo novo é o padrão.** Pedido do `mestre`, portas fechadas, a ficha calculada sempre (o registo
  da cena e a recência dependem dela).
- **NE8 · a memória não guarda o inventado.** Objeto citado na prosa que não existe no sistema vira veto
  (`naoPode`) no turno seguinte.
- **NE9 · a prova.** Sessão de teste paga: objetos inventados no cânone = 0; passos de quest só por facto do
  sistema; o que partiu.
