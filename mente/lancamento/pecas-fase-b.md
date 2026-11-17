# As peças: Fase B, o motor ligado ao jogo (17/11/2026)

**O que esta fase entregou, e o que ficou por fazer.** O motor está ligado ao turno do App atrás de um
interruptor, os falsos encaixes caíram, e a quest percorre-se em Node, sem IA, com as frases da sessão de
15/11. **A prova jogada com o Narrador real (as duas passagens no navegador) NÃO foi feita**: o orçamento
desta mão acabou na fiação e na prova em Node. As medidas de **verdade** e de **mesa ou trilho** pedem essa
partida e continuam em aberto. Nada abaixo é medido com IA.

Commits: `c10a67f` (os falsos encaixes, as exceções), `51cc69b` (o interruptor, a ponte, a fiação).

## 1. O interruptor

`PECAS_LIGADAS` (`src/pecas/no-jogo.js`): só `o_que_desce_ao_anoitecer`, e só com `taverna_cfg_pecas = "1"` no
localStorage, que `?pecas=1` grava e `?pecas=0` apaga. Fica desligado em produção. Desligado, `aPecaEmJogo` e
`oTurnoDaPeca` devolvem null para as 439 frases do corpus. Cada porta do App está atrás do interruptor ou da
marca que só a peça põe (`v.peca`, `des.peca`, `um.peca`), e a suíte `teste-pecas-no-jogo.mjs` §2 prova isso.
O campo `pecas` do save é novo e aditivo, e grava-se `null` com o interruptor desligado.

## 2. Os falsos encaixes

Releitura pelo sorteio da semente `A2-60`, sobre as soluções da versão de partida (`e82dc57`). O guião da A2
não ficou no repositório, por isso a amostra foi reconstruída: tem a mesma população (as 97 soluções sem o
«sondar» novo) e a mesma semente, mas pode não ser exatamente a mesma lista.

| amostra | erradas antes | erradas agora |
|---|---|---|
| as 60 da semente A2-60 | **10/60 pelas categorias da A2** (3 rumo/preço, 2 olhar a pessoa, 2 acampamento, 2 vulto, 1 paliçada); 14/60 pela minha leitura, mais estrita (+ esconder-se do lobo, + atacar «o homem da tocha» e «o rato gigante», + «Abro um olho e pergunto») | **1/60** («Abro um olho e pergunto: alguma coisa mudou?», uma pergunta ao grupo lida como conversa da etapa) |
| as outras soluções, sorteadas pela semente B-60 | — | **2/51** (só havia 51 fora das 60 primeiras; é a mesma frase de cima, em duas peças) |

Os sete tipos estão em `FALSOS_ENCAIXES` (encaixe.js), e as frases ficam em catraca na §5 da suíte nova. As
soluções do corpus caíram de 101 para 95, e o livre subiu para 423. As duas asserções movidas trazem o motivo
escrito.

## 3. A quest em Node (o jogo, sem IA)

O mesmo dado da semente e o mesmo limiar para os dois jogadores. A luta resolve-se com 11+ no d20.

| | turnos | dados por etapa (ver · rasto · fera) | preços pagos | o mundo cobrou | etapas sem facto do sistema |
|---|---|---|---|---|---|
| **de mesa** (as frases de 15/11) | 36 | 2 · 7 · 7 | 10 | 3 | **0** |
| **conversador** | 27 | 2 · 6 · 4 | 3 | 3 | **0** |
| sessão de 15/11 (o jogo de hoje) | 13 ações | 1 · 0 · 0 (fechou ao chegar e pela conversa) | 0 riscos | — | 3 de 4 |

Nenhuma etapa fechou sem dado. A carta de escolha continua com o jogo de hoje. A chegada já não fecha a
etapa: `semAChegadaDaPeca` tira o «esteve» que o Cronista escreve, e o facto passa a ser escrito pela solução.

## 4. O tamanho do pedido ao Narrador

Medido nas secções que mudam, com três frases na abertura:

- **hoje**: o caso (`quadro`) e o veto dele somam 196 caracteres; o rumo (a ponte para o próximo passo) tem
  cerca de 150; o fecho tem 60 em média (43 a 97). Ao todo, cerca de 406.
- **com peças**: a cena fechada, a pista e os dois vetos somam 324 a 326; o rumo e o fecho saem.
- **Δ ≈ −80 caracteres por turno** (−20 % nestas secções). No pedido inteiro (63–70 mil), isto é cerca de
  −0,1 %. **Não sobe.** `teste-prompt.mjs` continua verde (67/67). A medida no pedido real, turno a turno,
  ficou para a partida jogada.

## 5. O que não funcionou, ou ficou de fora

1. **A partida com o Narrador real** (as duas passagens, as 40 respostas, as capturas `PB-*`): não foi
   feita. Por isso não há números de **verdade** (nomes fora da cena por resposta, antes e depois da poda)
   nem a leitura de **mesa ou trilho**. A medida já está ligada: com o interruptor ligado, o App escreve na
   consola `[pecas] turno`, `[pecas] dado` e `[pecas] verdade {antes, depois, podadas}`.
2. **A fera é do cartão do confronto.** Com o cartão no ecrã (`encontroPendente`) as peças não leem a frase,
   e a luta (a solução `lutar`, a seta «é luta», a luta imposta pelo mundo) segue pelo confronto de hoje. Em
   Node a luta resolve-se pela semente. No jogo, a falha da peça que leva à luta só o diz na pauta: não abre
   o combate sozinha fora do covil.
3. **O rasto foi caro no jogador de mesa** (7 dados, 36 turnos). Foi o azar da semente, mais o relógio que
   cobrou duas vezes. O ritmo só se julga jogando.
4. «Abro um olho e pergunto: alguma coisa mudou?» ainda vira conversa da etapa. É a pergunta sem
   destinatário a quem anda no grupo.
