# Pendências

O que se sabe que falta, com o motivo de ainda não ter sido feito. Uma
linha por item, e quem resolver apaga a linha.

Este arquivo existe porque a alternativa é lembrar — e a varredura da
v9.44 mostrou onde isso dá: regra escrita, ninguém liga o código, e o
jogador descobre jogando.

## Combate e habilidades

- **Invocação fora de combate.** `criarInvocacoes` põe a criatura na ficha
  em qualquer lugar, mas `expiraEm` conta RODADAS e fora da luta não há
  rodada nenhuma — a invocação feita no acampamento não tem posição no
  tabuleiro e não tem relógio que a vença. Decidir se ela some ao sair da
  cena, se vira prazo em minutos, ou se simplesmente não pode ser chamada
  fora de combate. *(v9.46 — verificado só em combate.)*

- **Gatilho `atacar` da invisibilidade, em jogo.** Coberto por teste e pelo
  caminho gêmeo (`conjurar`, esse verificado no navegador), mas nunca vi um
  golpe de arma derrubar a invisibilidade numa partida de verdade — nas
  tentativas o inimigo estava sempre fora de alcance. *(v9.45)*

- **Propriedade `sutil` e o resto do catálogo de armas.** Feito para as
  armas do catálogo; armas geradas pelo loot com nomes inventados caem na
  dedução por nome (`PISTAS_ARMA`), que não conhece "sutil". Uma rapieira
  lendária chamada "Presságio" vira arma marcial comum.

## Mestre e prompt

- **O prompt de sistema passa de 90 mil caracteres** (~25 mil tokens) e vai
  inteiro em todo turno. Pesa na coerência e no custo. Muita regra lá dentro
  já virou código e pode sair — vale uma sessão só de enxugar.

- **Temperatura em 0.85** (v9.45, era 1.1). Escolhida contra a prosa
  quebrada que apareceu em jogo; se ficar previsível demais, `DS_TEMPERATURA`
  ajusta pela Vercel sem redeploy. Falta jogar o suficiente para saber.

## Mundo

- **Estágio 2 da geração de mundo: as células do ermo.** Dar coordenada real
  ao espaço entre assentamentos (`${semente}|celula|${x},${y}` com bioma,
  perigo e feição), que é onde `lugar.js` ganharia posição em vez de um nome
  solto. Combinado como etapa, nunca começado.

- **Estágio 3: o eixo extra por molde**, só onde significar alguma coisa.

## Fora do jogo

- **Geração de imagem.** Adiado desde cedo. Exige `api/imagem.js` com a
  chave em variável de ambiente da Vercel (nunca no cliente) e IndexedDB ou
  URL externa para guardar — a cota do localStorage já está apertada.
