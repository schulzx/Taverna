# Plano de resolução

Ordem de ataque para o que está em [PENDENCIAS.md](PENDENCIAS.md), montado
depois da varredura da v9.52. Não é uma lista de desejos: é a sequência em
que as coisas devem ser feitas, com o motivo de cada uma vir antes ou depois
da outra.

**A régua de prioridade, nesta ordem:**

1. **O que impede de jogar.** Um bug que trava a partida vale mais que dez
   melhorias.
2. **O que quebra a promessa da ficha.** O jogador leu, escolheu, gastou
   ponto — e não recebeu.
3. **O que faz o jogo perder o sentido com o tempo.** Progressão que congela,
   conteúdo que ninguém tem razão de visitar.
4. **O que é adição.** Coisa nova, por melhor que seja, depois do que já foi
   prometido.

---

## Onda 1 — o que trava a partida ✅ FEITA (v9.53)

Uma coisa só, e era a mais urgente do projeto.

### 1.1 A masmorra impossível ✅ FEITO

Doze por cento das masmorras não podiam ser terminadas: a sala da chave ficava
num ramo sem caminho e a do chefe estava trancada.

O conserto foi no gerador, em `masmorras.js`, nas duas metades planejadas —
toda sala ganha um pai dentro do laço de geração, e `garantirCaminhos` faz a
segunda checagem no fim. E apareceu uma terceira causa que o plano não
previa: `sortear = arr[d(arr.length)]`, com `d(n)` devolvendo 1..n, tornava o
índice 0 inalcançável em toda tabela do jogo.

**Teste que ficou:** mil masmorras com caminho da entrada a cada sala, chave
sempre alcançável sem a chave, e 200 de 200 concluíveis andando de verdade.

---

## Onda 2 — as promessas que a ficha faz e o sistema não paga ✅ FEITA (v9.54)

O jogador gastou ponto de habilidade nisso. É dívida, não melhoria.

### 2.1 Os cinco resolvedores que faltam ✅ FEITO (v9.53 e v9.54)

Trinta habilidades prometiam número e ninguém cobrava. Eram **cinco famílias**,
cada uma um módulo pequeno no idioma dos que já existiam:

| família | quantas | onde ficou |
|---|---|---|
| Defesa temporária | 5 | `GUARDAS`, em `habilidades.js` (v9.53) |
| Invulnerabilidade | 4 | as mesmas `GUARDAS`, com escada de prazo (v9.53) |
| Reerguer que faltou | 3 | estendeu a tabela do `reerguerDe` (v9.53) |
| Movimento e alcance | 10 | `IGNORAM` + `PRESSAS` (v9.54) |
| Controle de inimigo | 6 | `controle.js`, módulo novo (v9.54) |

A ordem executada foi a planejada, e ela se pagou: as quatro primeiras eram
tabelas lidas na hora de um golpe, e a última foi a única que precisou entrar
no motor do turno dos inimigos — deixá-la por último manteve as outras quatro
longe do único trecho de código realmente delicado.

Duas surpresas. A família de movimento tinha **dez** habilidades, não seis: a
varredura por TEXTO achou quatro que ninguém havia mapeado. E quatro delas
caíam no mesmo poço da Colheita Final — descrição sem palavra de violência,
descartada antes de qualquer conta, com o PM saindo da ficha à toa.

### 2.2 A ação bônus que não faz o que diz ✅ FEITO (v9.54)

Resolvido pelo segundo caminho, que era o honesto: a descrição passou a dizer
o que o sistema faz. O primeiro (dar de verdade os dois socos) esbarra em algo
que só aparece olhando o código: **a ação bônus renasce a cada rodada aqui**.
Um Surto de Ação que valesse uma ação inteira toda rodada daria ao Guerreiro o
dobro de golpes permanente — e no 5e o Surto é uma vez por descanso.

`"Bárbaro"` saiu. Engenheiro e Invocador ficam sem, por decisão escrita: a
segunda ação é a alavanca de poder mais forte deste combate, e o buraco de
progressão do Caçador é assunto da onda 3.

### 2.3 "Céu Escuro" e a régua de área ✅ FEITO (v9.54)

A régua pedia a preposição ("em área") e não reconhecia a coisa dita direto.

---

## Onda 3 — o que faz o jogo esvaziar com o tempo ✅ FEITA (v9.54)

### 3.1 Cinco classes que param de crescer ✅ FEITO

A causa era estrutural, e a suspeita se confirmou medindo: **os dois eixos de
progressão passavam pela mesma porta**. Separados em `dadosDeDano`, o vão
entre um ganho e o seguinte caiu de **quinze níveis para seis**.

A nota do plano se pagou: fazer isto DEPOIS da 2.1 deixou a medição limpa. Com
as promessas soltas todas quitadas, o que sobrava de dano baixo num Monge
nível 20 era progressão de classe e nada mais — não havia segunda causa para
confundir o resultado.

**Teste que ficou:** a tabela de dano por turno do nível 1 ao 20, com dois
pisos que nenhuma classe pode furar — nunca mais de nove níveis parada, e o
dano do 20 sempre ao menos o dobro do dano do 5.

O Guerreiro mantém o dado, como o plano previa. E sobrou uma propriedade
bonita: bônus fixos por golpe (arma, dádiva) favorecem quem bate muitas vezes;
dados favorecem quem bate poucas. As duas classes puxam de lados diferentes.

### 3.2 A masmorra que não dá razão para explorar ✅ FEITO

Das três alavancas, entrou a terceira — a única que transforma explorar em
decisão em vez de zelo. Cada sala limpa tira 6% da vida do chefe, com teto em
40%. Como cada sala também queima tocha e tempo (3.3), as duas pontas puxam:
o jogador escolhe onde parar.

### 3.3 As tochas ✅ FEITO

Três partes: o número inicial olha o tamanho da masmorra, existe um feixe de
tochas para comprar e fabricar, e `tochaExtra` — que estava na tabela de
RITMOS desde a v8.4 sem ninguém ler — enfim cobra do passo cauteloso.

### 3.4 A essência da forja ✅ FEITO

Segunda fonte: o que o jogador já faz, que é matar coisa difícil. Comum e
fraco não deixam nada; elite deixa 3, lendário 8, chefe de masmorra 10 +
nível×1,5.

### 3.5 A fama que trava em 70 ✅ FEITO

Dois degraus novos, diferentes em natureza e não em grau.

---

## Onda 4 — o mundo que já existe e ninguém vê

### 4.1 A planta que responde ao lugar `médio` `médio`

Hoje a mesma muralha, as mesmas duas ruas e a mesma praça numa aldeia de 190
almas e numa capital de 54 mil. Falta: aldeia sem muro, porto com o mar de um
lado, fortaleza com muro grosso e uma rua só, montanha com a cidade
espremida.

**Depende de:** nada — a v9.51 já entregou a estrutura.

### 4.2 O cinturão que fica no mapa `baixo` `pequeno`

Sair de uma cidade apaga o moinho dela do pergaminho. Uma vez visitado,
devia ficar, apagado.

### 4.3 Um lugar DENTRO de outro `médio` `médio`

O andar da torre virou "nos arredores" com regra de horas. Falta a distância
`dentro` (minutos) e a régua que impede um andar de virar cidade no mapa.

### 4.4 Invocação fora de combate `médio` `pequeno`

`expiraEm` conta rodadas e fora da luta não há rodada. Decidir: some ao sair
da cena, vira prazo em minutos, ou não pode ser chamada fora de combate.

### 4.5 A exaustão que se reanuncia `baixo` `mínimo`

Avisa na virada e cala depois.

---

## Onda 5 — o que é adição, não dívida

### 5.1 O prompt que só manda o que a cena usa `médio` `grande`

Vinte e um mil tokens em todo turno. A faxina da v9.50 tirou o que era
contradição; daqui em diante é arquitetura: o bloco de masmorra só em
masmorra, o de diplomacia só com facção em jogo, o de ascensão só depois do
despertar (esse já é assim). Economia estimada: um terço.

### 5.2 Estágio 2 do mundo: as células do ermo `médio` `grande`

Dar coordenada real ao espaço entre assentamentos. É o que faria os
arredores, o ermo e a viagem falarem a mesma língua.

### 5.3 Estágio 3: o eixo extra por molde `baixo` `médio`

### 5.4 Geração de imagem `baixo` `grande`

Exige `api/imagem.js` com a chave em variável de ambiente e IndexedDB para
guardar. A cota do localStorage já está apertada.

---

## O que fica de fora, e por quê

**Testar pela interface** o que a sonda já mediu por baixo. Masmorra sala a
sala, acampamento, compra e venda, tela de tombamento, diplomacia com facção
real: os módulos passaram nas sondas, e o que falta é a partida de verdade —
que rende mais na sua mão do que na minha, porque o bug de interface aparece
para quem joga, não para quem chama a função.

---

## Ordem sugerida, em uma linha

~~**1.1**~~ → ~~**2.1**~~ → ~~**2.2, 2.3**~~ → ~~**3.1–3.5**~~ → **4.5** (a
exaustão que se reanuncia, o menor que sobrou) → **4.1–4.4** (o mundo
visível) → **5.x** (as adições).

As ondas 1, 2 e 3 estão pagas — tudo o que era **dívida** foi quitado: o que
travava a partida, o que a ficha prometia e o sistema não cumpria, e o que
fazia o jogo esvaziar com o tempo. O que resta é de outra natureza. A onda 4
é mundo que já existe e o jogador não vê; a 5 é adição. Nenhuma das duas tem
alguém esperando por elas com um ponto de habilidade gasto.
