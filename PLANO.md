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

Doze por cento das masmorras não podem ser terminadas: a sala da chave fica
num ramo sem caminho e a do chefe está trancada.

O conserto é no gerador, em `masmorras.js`, e tem duas metades:

- **Toda sala precisa de uma entrada.** Ao ligar a camada N à N−1, garantir
  que nenhuma sala fique sem quem aponte para ela — hoje os destinos são
  sorteados e sobra órfã em 58% dos casos.
- **A chave nunca atrás da própria porta.** Mesmo com a régua acima, uma
  segunda checagem no fim da geração: se a sala que guarda a chave não é
  alcançável sem a chave, religar. É o cinto além do suspensório, e aqui
  vale, porque o custo do erro é a partida inteira.

**Teste que fica:** gerar mil masmorras e provar que em todas existe caminho
da entrada a cada sala, e que a chave vem antes de qualquer porta trancada.

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

## Onda 3 — o que faz o jogo esvaziar com o tempo

### 3.1 Cinco classes que param de crescer `alto` `médio`

Caçador, Engenheiro, Clérigo, Bardo e Monge congelam no nível 5 ou 11. Um
Monge nível 20 bate como um nível 5.

A causa é estrutural: **quem não ganha ataque extra também não ganha dado
maior** — os dois eixos de progressão passam pela mesma porta. O conserto é
separar os eixos em `dadosDeDano`: quem fica com dois ataques ganha dado
crescente; quem ganha o terceiro e o quarto mantém o dado.

**Depende de:** nada, mas é melhor DEPOIS da 2.1 — muitas dessas classes têm
habilidades na lista de promessas soltas, e consertar as duas coisas ao mesmo
tempo mistura duas causas no mesmo teste.

**Teste que fica:** a tabela de dano por turno do nível 1 ao 20, com um piso
de crescimento que nenhuma classe pode furar.

### 3.2 A masmorra que não dá razão para explorar `médio` `médio`

Mata-se o chefe visitando 5 de 9 salas. Tesouro e santuário são puláveis sem
custo. Três alavancas, e dá para escolher uma:

- a porta do chefe exige mais que a chave (dois selos, dois guardiões);
- limpar tudo rende alguma coisa que se sente;
- o chefe fica mais fraco a cada sala limpa — o que transforma explorar em
  decisão tática em vez de zelo.

### 3.3 As tochas `médio` `pequeno`

`5 + d3` numa masmorra que pode ter 12 salas: dois terços dela no escuro por
padrão. O número inicial precisa olhar o tamanho da masmorra, e comprar tocha
no mercado precisa ser possível.

**Depende de:** 1.1 (mexer no gerador duas vezes é desperdício — fazer junto).

### 3.4 A essência da forja `médio` `pequeno`

Única fonte é desmontar equipamento. Quem nunca acha, nunca forja. Falta uma
segunda fonte: espólio de chefe, compra, ou o ofício da profissão rendendo.

### 3.5 A fama que trava em 70 `baixo` `pequeno`

"Lenda Viva" vale igual para 70 e para 200.

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

~~**1.1**~~ → ~~**2.1**~~ → ~~**2.2, 2.3**~~ → **3.1** (as classes que
congelam, a próxima) → **3.3** (tochas) → **3.4, 3.5, 4.5** (os pequenos, em
qualquer ordem) → **4.1–4.4** (o mundo visível) → **5.x** (as adições).

As ondas 1 e 2 estão pagas. A onda 3 começa pela 3.1, e agora ela pode ser
medida limpa: a nota dizia "melhor DEPOIS da 2.1, senão as duas causas se
misturam no mesmo teste" — com as promessas soltas todas pagas, o que sobrar
de dano baixo num Monge nível 20 é progressão de classe, e nada mais.
