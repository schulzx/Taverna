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

## Onde o herói está

- **A planta da cidade é a mesma para todo mundo.** A v9.51 desenha muralha,
  duas ruas-mestras, praça no meio e quatro portões — bonito e legível, mas
  igual numa aldeia de 190 almas e numa capital de 54 mil. Falta a planta
  responder ao porte e ao bioma: aldeia sem muro, porto com o mar de um lado,
  fortaleza com o muro grosso e uma rua só.

- **Os arredores não estão no mapa-mundo das outras cidades.** Só o cinturão
  da cidade onde o herói está aparece no pergaminho — de propósito, para não
  poluir —, mas isso significa que sair de uma cidade apaga o moinho dela do
  mapa. Talvez devesse ficar, apagado, uma vez visitado.

- **Um lugar DENTRO de outro.** O sistema conhece cidade, viagem e um ponto
  *nos arredores* — e é só isso. Numa masmorra o Mestre escreveu o andar em
  `cidade_atual` e o andar seguinte em `lugar_atual`, e a tela ficou dizendo
  "Andar 2 (nos arredores de Andar 1 — da Ferrugem)", com a regra de que ir e
  voltar leva HORAS. Subir uma escada não é uma caminhada até a fazenda.
  Falta uma distância `dentro` (minutos, não horas) e uma régua que impeça um
  andar de virar cidade no mapa. *(v9.48 — as duas portas do teleporte foram
  fechadas; o modelo do lugar continua com dois andares só.)*

## Mestre e prompt

- **O prompt de sistema ainda passa de 75 mil caracteres** (~21 mil tokens) e
  vai inteiro em todo turno. A faxina da v9.50 tirou 9 mil caracteres — o que
  contradizia o código ou já era código. O que sobrou é regra viva, e cortar
  daqui em diante é escolha de produto, não limpeza: o candidato óbvio é
  mandar por turno só o que a cena usa (o bloco de masmorra só em masmorra, o
  de diplomacia só quando há facção em jogo), que é uma mudança de
  arquitetura, não de texto. `teste-prompt.mjs` guarda o tamanho e as regras
  que não podem voltar.

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
