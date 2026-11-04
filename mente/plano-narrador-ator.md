# O plano do Narrador ator

**Decisão da pessoa, 03/11/2026.** *"Me parece muito robotizado… um mestre que sabe
de tudo e orquestra a história entrega o que o narrador diz, e então o narrador com
aquilo que tem, atua e diz a frase com seu devido peso e impacto… o narrador é só a
boca, ele só fala, ou seja, só sai informação dali, nada entra por ele, tudo entra
pelo sistema e é devolvido pelo sistema."* Aprovou o plano inteiro, o conteúdo
**misto**, e o gasto do teste às cegas e da 14.ª sessão.

Os diagnósticos que o fundam: `mente/narrador-ator-anatomia.md` (o pedido: 54% é
regra de jogo, ~10% é o que um ator usa; 9 portas leem a prosa e a fazem estado) e
`mente/narrador-ator-voz.md` (os tiques e as suas causas: instrução de Mestre
escrita como frase de ator; todos falam com a mesma voz).

## As decisões

1. **O caminho de hoje fica de reserva** até o ator provar ser melhor. A troca é uma
   tabela (`MODO_DO_NARRADOR`: `mestre` | `ator`), e voltar é mudar uma palavra.
2. **O conteúdo é misto.** O SISTEMA decide os fatos, as ofertas, as promessas, as
   recusas e as revelações (por tabela, determinista). A conversa SEM consequência
   (cor, ambiente, conversa fiada) é livre para o ator — e, como nada entra pelo
   Narrador, o que ele improvisa nunca vira estado.
3. **O ator não cria gente com nome nem lugar.** Só fala quem está na ficha; o que
   não está na ficha não existe para o sistema, e inventá-lo contradiria o turno
   seguinte.
4. **Nada entra pelo Narrador.** No modo `ator`, nenhuma das portas que hoje leem a
   resposta ou a prosa muda o estado; o Cronista sai do turno.
5. **O gasto aprovado:** o teste às cegas (~US$ 1–2) e a 14.ª sessão com o ator.

6. **Aprovadas depois das sessões 14–16 (03/11/2026, «Aprovo as duas sugestões»):**
   - **O figurante que fala** (`mente/sessao-14.md` §7): por cena e por tabela, o
     sistema elege um figurante do «À mão», com uma voz sorteada, sem Sabe nem Quer,
     proibido de prometer, cobrar ou revelar; responde ao herói, nem que seja para
     não saber, e não deixa rasto no estado.
   - **A pista como cartão** (`mente/sessao-16.md`): com a pessoa do passo em cena,
     o jogador tem o cartão «Perguntar a X por Y», em vez de adivinhar a pergunta.

7. **Aprovados depois da 17.ª (04/11/2026, «Pode fazer os sítios como cartões»):**
   feitos e retirados no mesmo dia, antes de subir: diziam quem lá está, e o
   herói não tem como o saber. Substituídos pela decisão 8.
8. **A proposta da frase (04/11/2026, ordem da pessoa):** a frase que o
   sistema lê como ato que gasta tempo, estrada ou moeda vira um cartão que,
   tocado, mostra só o que o herói sabe e o botão (`src/motor/a-proposta-da-frase.js`,
   `src/painel-proposta.jsx`). Vale para os dois modos do Narrador.

## As etapas

1. **A ficha de ator** (motor): o que aconteceu (decidido), quem está (cada um com a
   sua voz, o seu registo de fala, como trata o herói, o que quer), o que cada um
   tem de transmitir — cada linha da pauta vira um fato de cena ou uma vontade de
   alguém presente, nunca uma ordem, uma razão ou um rótulo de sistema.
2. **O ator** (pedido novo, ~6 mil chars): o ofício (como dizer) + a ficha; a
   resposta é só prosa.
3. **Fechar as portas** no modo `ator`.
4. **O modelo:** o teste às cegas sobre turnos gravados (o modelo atual contra o
   mais barato), e a 14.ª sessão com o vencedor.
