# Pendências

O que se sabe que falta, com o motivo de ainda não ter sido feito. Uma
linha por item, e quem resolver apaga a linha.

Este arquivo existe porque a alternativa é lembrar — e a varredura da
v9.44 mostrou onde isso dá: regra escrita, ninguém liga o código, e o
jogador descobre jogando.

## Balanceamento — achado na varredura da v9.52

- **Cinco classes param de crescer no meio do caminho.** Medindo o dano POR
  TURNO (dano médio × ataques do turno, 400 rolagens por ponto), do nível 1 ao
  20:

  | classe | nv1 | nv5 | nv11 | nv20 | cresceu |
  |---|---|---|---|---|---|
  | Ladino | 7 | 13 | 24 | 41 | ×5,9 |
  | Guerreiro | 7 | 15 | 22 | 30 | ×4,3 |
  | Bruxo | 8 | 14 | 20 | 25 | ×3,1 |
  | Druida | 7 | 12 | 16 | 21 | ×3,0 |
  | Mago / Feiticeiro | 9 | 14 | 19 | 25 | ×2,8 |
  | Invocador | 8 | 12 | 16 | 21 | ×2,6 |
  | **Caçador / Engenheiro** | 7 | 15 | **15** | **15** | ×2,1 |
  | **Clérigo** | 8 | 15 | **15** | **15** | ×1,9 |
  | **Bardo / Monge** | 7 | 7–13 | 13 | **13** | ×1,9 |

  Caçador, Engenheiro, Clérigo, Bardo e Monge **congelam no nível 5 ou 11** e
  não sobem mais nada até o 20. Um Monge nível 20 bate como um nível 5,
  enquanto o Ladino ao lado dele triplica. A causa: quem não ganha o terceiro
  e o quarto ataque também não ganha dado maior — os dois eixos de progressão
  passam pela mesma porta. Cabe dar dado crescente a quem não ganha ataque.

- **Ação bônus nomeada não faz o que o nome diz.** `ACOES_BONUS` promete
  "Rajada de Golpes — dois ataques desarmados extras" ao Monge e "Surto de
  Ação — uma ação inteira a mais" ao Guerreiro. O sistema só libera o SLOT
  extra do turno: a rajada não dá dois golpes, ela deixa usar outra
  habilidade. Ou a descrição vira verdade, ou ela deve dizer o que é.

- **`ACOES_BONUS` tem "Bárbaro", que não é classe deste jogo** — entrada morta.
  E Mago, Caçador, Bruxo, Engenheiro e Invocador não têm ação bônus nenhuma;
  para o Engenheiro e o Invocador (que vivem de máquinas e criaturas) isso
  parece esquecimento, não desenho.

- **Trinta habilidades prometem número e não têm quem o cobre.** A varredura
  separou por família, e cada família é um resolvedor:
  - **Defesa temporária** (Casca de Carvalho, Pele Arcana, Forma Dracônica,
    Enxerto Mecânico, Elixir de Combate): "aumenta a defesa por N turnos" —
    ninguém soma nada à CA.
  - **Controle de inimigo** (Marionete, Discórdia, Selo de Interdito, Silêncio
    Que Grita, Mentira Luminosa, Palco Aberto): virar um inimigo contra o
    outro, calar a conjuração, criar uma cópia. Nenhum tem código.
  - **Invulnerabilidade temporária** (Vazio Perfeito, Dança Sem Vulto, Nada Me
    Alcança, Improvável): "por N turnos nada te atinge" — a promessa mais
    perigosa de todas para ficar solta.
  - **Movimento e alcance** (Passo do Vento, Mais Rápido que o Olho, Cano
    Longo, Olho que Mede o Vento, Mira do Batedor, Punho que Rompe): dobrar
    deslocamento, agir duas vezes, ignorar cobertura e armadura.
  - **Reerguer que faltou** (Refrão Teimoso, Renascimento, Grande Necrópole):
    a família do `reerguerDe` existe desde a v9.47 e estas três ficaram de
    fora do casamento.

- **"Céu Escuro" diz "toda a área inimiga" e não é reconhecida como área.**
  As irmãs dela (Chuva de Flechas, Cem Passos, Corrente Viva, Caos Puro) caem
  certo numa esfera de 6 m; essa cai como alvo único. Régua de `ehArea` a
  ajustar.

- **A exaustão se reanuncia todo turno.** "🥱 Exaustão: 44h acordado. Você
  está Exausto" aparece de novo às 48h, às 52h — a condição já está na ficha e
  a linha repete. Deve avisar na virada e calar depois.

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

## Craft e economia

- **Essência só vem de desmontar.** A forja pede ⚗ 4 para o item mais barato e
  ⚗ 130 para o lendário, e a única fonte de essência é desmontar equipamento
  que você já tem. Quem nunca acha equipamento nunca forja, e quem forja
  precisa destruir para construir. Falta uma segunda fonte: espólio de chefe,
  compra no mercado, ou o ofício da profissão rendendo essência.

- **A bancada não avisa que está pronta.** As receitas ficam atrás de um
  acordeão fechado dentro do inventário; o contador "N prontas" só aparece
  depois de abrir a bolsa e reparar. Colher uma erva na estrada devia
  acender alguma coisa.

## O que ainda não foi testado

Registro honesto do que a varredura da v9.52 NÃO cobriu, para ninguém supor
que está verificado:

- **Masmorra** (sala a sala, chefe, tesouro) — nunca joguei uma inteira.
- **Ascensão e deicídio** — o rito tem provas e nunca as encarei.
- **Diplomacia, correio e decretos** — painéis abertos, nunca exercitados.
- **Descanso longo e acampamento** — as conversas de acampamento, o mundo que
  para, o que o descanso limpa.
- **Companheiros em combate** — o motor decide por eles e nunca vi uma luta
  com o grupo cheio.
- **Morte do herói** e a tela de tombamento.
- **Mercado**: comprar e vender de verdade, com o preço aferido.

## Fora do jogo

- **Geração de imagem.** Adiado desde cedo. Exige `api/imagem.js` com a
  chave em variável de ambiente da Vercel (nunca no cliente) e IndexedDB ou
  URL externa para guardar — a cota do localStorage já está apertada.
