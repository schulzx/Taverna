# Pendências

O que se sabe que falta, com o motivo de ainda não ter sido feito. Uma
linha por item, e quem resolver apaga a linha.

Este arquivo existe porque a alternativa é lembrar — e a varredura da
v9.44 mostrou onde isso dá: regra escrita, ninguém liga o código, e o
jogador descobre jogando.

## Masmorra

- **~~Uma em cada oito masmorras é impossível de terminar.~~** RESOLVIDO na
  v9.53. O gerador ligava cada camada à seguinte sorteando destinos e sobrava
  sala sem pai — 58% das masmorras tinham órfã, e em 12% a órfã era a sala da
  CHAVE, com o portão do chefe trancado. Agora toda camada é reparada assim
  que nasce, e `garantirCaminhos` confere no fim. Medido: 0 órfãs em mil
  masmorras, chave sempre alcançável, 200/200 concluíveis.

- **~~O sorteio nunca alcançava o primeiro item de nenhuma tabela.~~**
  RESOLVIDO na v9.53. `sortear = arr[d(arr.length)]`, com `d(n)` devolvendo
  1..n: o índice 0 era inalcançável e uma em cada `n` chamadas caía fora da
  lista. Em 500 masmorras, 500 tinham passagem com a pista vazia. O mesmo
  `sortear` estava em `loot.js`, onde comia o primeiro prefixo, o primeiro
  sufixo e o primeiro poder de cada tabela.

- **Mais da metade da masmorra é ignorável.** Andando sempre pela primeira
  saída, uma masmorra de 9 salas termina com o chefe morto tendo visitado 5.
  O tesouro, o santuário e a armadilha ficam para trás sem custo nenhum: não
  há porta que exija tê-los feito, nem recompensa por limpar tudo. Explorar
  é escolha sem consequência, dos dois lados.

- **As tochas acabam antes de um terço da masmorra.** A luz é a da mochila
  (v9.26) e o padrão da ficha são 5 tochas, uma por sala — numa masmorra de
  9 salas o herói fica no escuro a partir da quarta. Falta o mercado vender
  tocha e a entrada avisar quantas a expedição vai pedir.

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

- ~~**Ação bônus nomeada não faz o que o nome diz.**~~ RESOLVIDO na v9.54 pelo
  caminho honesto: as descrições passaram a dizer o que o sistema faz — um
  segundo movimento no turno, gasto numa habilidade. Não pelo caminho
  contrário (dar de verdade os dois socos ao Monge e a ação inteira ao
  Guerreiro), porque a ação bônus renasce a cada rodada aqui: um Surto de Ação
  que valesse uma ação inteira TODA rodada daria ao Guerreiro o dobro de
  golpes permanente, e o Surto do 5e é uma vez por descanso.

- ~~**`ACOES_BONUS` tem "Bárbaro", que não é classe deste jogo**~~ RESOLVIDO na
  v9.54: entrada morta removida. Mago, Caçador, Bruxo, Engenheiro e Invocador
  seguem SEM ação bônus, e agora por decisão escrita: a segunda ação é a
  alavanca de poder mais forte deste combate — mais que dano, mais que defesa
  — e distribuí-la para tapar buraco de progressão (o do Caçador é da onda 3)
  seria pagar a dívida errada com a moeda mais cara.

- ~~**Trinta habilidades prometem número e não têm quem o cobre.**~~ RESOLVIDO:
  a v9.53 pagou doze e a v9.54 pagou as dezoito restantes. As cinco famílias:
  - ~~**Defesa temporária**~~ RESOLVIDO na v9.53: as cinco erguem uma GUARDA
    que soma à CA e vence por rodada, como a forma e a invocação.
  - ~~**Controle de inimigo**~~ RESOLVIDO na v9.54 em `controle.js`, a única
    das cinco que precisou entrar no motor do turno dos inimigos. Três verbos:
    VIRAR (Marionete, Discórdia — o inimigo passa a bater nos próprios e
    continua podendo ser derrubado por quem o controla), PARAR e CALAR (Selo
    de Interdito, Corte de Marionetes, Silêncio Que Grita — viram CONDIÇÃO, que
    o jogo já sabia cobrar) e PROVOCAR (Palco Aberto — todo inimigo vem para o
    herói e os companheiros rolam com vantagem). Mentira Luminosa entrou pela
    porta das invocações, que já sabe pôr uma criatura em campo por N turnos.
    O silêncio morde só quem conjura, e não vira um atordoamento de dois
    turnos: isso já é o Corte de Marionetes, e faria duas habilidades
    diferentes serem a mesma coisa mais barata.
  - ~~**Invulnerabilidade temporária**~~ RESOLVIDO na v9.53: as quatro entram
    como GUARDA, com uma escada deliberada — só a de UM turno (Vazio Perfeito)
    é absoluta e faz o golpe errar antes do dado; as de três e quatro turnos
    viram desvantagem, porque um combate inteiro sem poder ser acertado não é
    uma habilidade, é o fim do combate. Nada Me Alcança só morde feitiço.
  - ~~**Movimento e alcance**~~ RESOLVIDO na v9.54, e era maior do que parecia:
    a varredura achou **sete** habilidades dizendo "ignora" (quatro furam
    armadura, três furam cobertura) e **três** prometendo agir duas vezes, e
    não as seis mapeadas. As de "ignora" caíam no mesmo poço da Colheita
    Final — "Ignora cobertura, penumbra e distância neste disparo" não tem uma
    só palavra de violência, então a régua de habilidade ofensiva as
    descartava antes de qualquer conta e o PM saía da ficha à toa. Agora o
    leitor é consultado ANTES dela. Quem fura armadura rola contra o corpo nu
    (os 10 de base); quem fura cobertura rola como em campo aberto — e as duas
    portas ficam separadas, porque furar a couraça de alguém não faz o muro na
    frente dele desaparecer. A PRESSA dá duas AÇÕES na rodada (não dois
    golpes: quem conjura não bate) pela economia de ação que já existia. E o
    Passo do Vento, que dobrava o passo desde sempre, enfim ignora o terreno
    difícil que a descrição dele promete com todas as letras.
  - ~~**Reerguer que faltou**~~ RESOLVIDO na v9.53: Refrão Teimoso,
    Renascimento e Grande Necrópole entraram na tabela do `reerguerDe`, e o
    Refrão devolve a metade que a descrição dele promete com todas as letras.

- ~~**"Céu Escuro" diz "toda a área inimiga" e não é reconhecida como área.**~~
  RESOLVIDO na v9.54: a régua de `ehArea` pedia a preposição ("em área") e não
  reconhecia a coisa dita direto. Uma nuvem de flechas sobre a área inimiga
  acertava um arqueiro só.

- ~~**O conjurador do sexo masculino ataca com dano físico.**~~ RESOLVIDO na
  v9.54, e apareceu por acidente: a tabela de perfis do bestiário tem
  "feiticeira" e "mago" e nunca teve "feiticeiro", "arcanista" nem
  "conjurador" — todos caíam no perfil padrão. Achado ao testar o Silêncio Que
  Grita, que precisa saber quem conjura para saber quem calar.

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

## Miudezas

- **A fama chega ao teto cedo e para.** "Lenda Viva" começa em 70 e vale
  igual para 70, 100 ou 200 — passado esse ponto, feito nenhum muda o que o
  mundo diz do herói. Ou entra um patamar acima, ou a fama vira outra coisa
  (reputação por região, por facção) depois do teto.

## O que a sonda passou — e não vira pendência

Registrado para ninguém gastar tempo reconferindo. Medido em v9.52:

- **Companheiros.** Entram com classe e duas habilidades do catálogo, chegam
  ao nível 5 com sete habilidades depois de 10 mil XP, e decidem de verdade
  em combate (200 decisões: 82 ataques, 118 habilidades — não é repetição).
- **Morte do herói.** Em 2.000 quedas a 0 PV: 39% morre, 43% estabiliza, 18%
  volta com o 20 natural. A curva está no lugar.
- **Descanso longo.** Limpa todas as doze condições ruins do catálogo e
  preserva Abençoado e Inspirado. O curto limpa só sangramento, cegueira e
  fogo, que é o desenho.
- **Mercado.** Estoque proporcional ao porte: 3 mercadores e 15 itens numa
  capital, 1 e 5 numa vila, com preço aferido pelo sistema.
- **Fuga do inimigo.** Um lacaio a 1 de 20 PV foge em 51% das rodadas.
- **Ascensão.** Deicídio e relíquia têm três provas cada; a Via da Fé não tem
  prova nenhuma **por desenho** — ali se sobe acumulando fiéis, e é isso que
  a torna "lenta, segura e legítima".
- **Diplomacia.** Os cinco tratados existem e estão ligados ao mapa.
- **Encontros de estrada.** Cinco variedades por bioma, em cinco tipos
  (perigo, achado, cena, viajante, tranquilo) — os oito biomas cobertos.
- **Relógios.** Quatro tipos (ameaça, caçada, oportunidade, obra), três
  tamanhos, gatilho por noite. **Missões**: catálogo de etapas completo com
  conferência automática. **Decretos, correio, reino, oráculo, sintonia,
  vínculos, legado, heroísmo**: catálogos cheios e funções no lugar.
- **Grimório**: 85 magias. **Conquistas**: 67 no catálogo.

## O que ainda não foi jogado de ponta a ponta

A sonda mede os módulos; ela não substitui a partida. Continua sem
verificação **na tela**:

- A masmorra jogada sala a sala pela interface (o painel, o ritmo, a busca).
- O acampamento e as conversas de vínculo.
- Comprar e vender de fato, com moeda saindo do bolso.
- A tela de tombamento do herói.
- Diplomacia e correio exercitados com uma facção real.

## Fora do jogo

- **Geração de imagem.** Adiado desde cedo. Exige `api/imagem.js` com a
  chave em variável de ambiente da Vercel (nunca no cliente) e IndexedDB ou
  URL externa para guardar — a cota do localStorage já está apertada.
