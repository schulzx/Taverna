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

## Onda 4 — o mundo que já existe e ninguém vê ✅ FEITA (v9.54)

### 4.1 A planta que responde ao lugar ✅ FEITO

A forma sai da POPULAÇÃO e do BIOMA, não do porte — são dezenove portes em
cinco moldes, e uma tabela por nome seria uma lista para esquecer de
atualizar. População é um número, e número compara sozinho.

Tudo o que o plano pedia entrou: aldeia sem muro, porto com o mar de um lado,
fortaleza com muro grosso e uma rua só, montanha espremida. E o Mestre passou
a receber a mesma linha — ele narrava portão e guarda numa aldeia que não tem
nenhum dos dois.

Uma lição de tamanho na tela: a primeira versão usava logaritmo da população
e entregava uma aldeia de raio 27 ao lado de uma capital de 37 — correto e
visualmente inútil. Virou uma escada de cinco degraus. Quando o objetivo é
"o jogador vê a diferença", a régua é o olho, não a proporção.

### 4.2 O cinturão que fica no mapa ✅ FEITO

A marca `pisada`, que é diferente de `descoberta`: ouvir falar revela o ponto,
ter dormido lá revela o que fica em volta. Toda cidade pisada guarda o
cinturão dela, apagado.

### 4.3 Um lugar DENTRO de outro ✅ FEITO

A distância `dentro`, lida do nome por uma lista curta e literal. O texto do
prompt muda junto: um andar de torre não é "fora da cidade", e sair dele leva
minutos.

### 4.4 Invocação fora de combate ✅ FEITO

Dos três caminhos, o prazo em minutos — o único que não mente. Proibir
contradiria a ficção (chamar um batedor para vasculhar a mata é uso legítimo)
e sumir na troca de cena é um prazo invisível, que ninguém pode planejar.

### 4.5 A exaustão que se reanuncia ✅ FEITO

E a causa não era a que a pendência supunha. A condição não estava na ficha:
quem a aplicava escrevia só no estado do React e deixava o espelho para trás,
e a escrita seguinte a apagava. A mesma armadilha que a v9.13 documentou nos
espólios — quem escreve em um dos dois lugares escreve em nenhum.

---

## Onda 5 — o que é adição, não dívida ✅ FEITA (v9.54), menos a imagem

### 5.1 O prompt que só manda o que a cena usa ✅ FEITO

Dezoito portas em `PORTAS_DA_CENA`, cada uma com a pergunta que a abre e o
motivo escrito ao lado. A régua tem duas perguntas, e as duas precisam de
"sim": o bloco fala de uma situação que ou está acontecendo ou não está? e o
sistema sabe dizer se ela está acontecendo, sem adivinhar? O oráculo falha na
segunda e por isso ficou.

**Economia estimada: um terço. Medida: um quarto** — 25% numa cena de taverna
ou de estrada, 15% em combate. A diferença é que boa parte do peso está no
corpo do prompt (as regras-mestras que valem sempre) e não nos blocos.

O achado que quase virou bug: o prompt era remontado em ONZE eventos e não a
cada turno. Isso bastava quando ele era o mesmo em toda cena; com as portas,
um combate aberto depois da última remontagem subiria sem as regras de
terreno. Agora ele se refaz antes de cada chamada — e os onze pontos antigos
continuam onde estavam, para o caso em que o prompt muda sem haver turno.

### 5.2 Estágio 2 do mundo: as células do ermo ✅ FEITO

`celulas.js`: o pergaminho vira uma grade de 20 por 20, e cada célula sabe
que terreno é, quão longe da gente está e o que há nela de notável. O bioma é
HERDADO do assentamento mais próximo e não sorteado — sortear daria um mundo
de retalhos, que é pior do que nenhum mundo porque contradiz o mapa.

Os três sistemas passam a falar a mesma língua, como o plano previa: a viagem
narra o trecho, o ermo tem distância e perigo reais, e um lugar fora da
cidade tem posição em vez de um nome solto.

### 5.3 Estágio 3: o eixo extra por molde ✅ FEITO

Dentro do 5.2, que era onde ele significava alguma coisa — o critério
combinado. A Torre e o Braço Estelar declaravam `z` desde a v9.40 e o eixo
nunca passou de rótulo; agora a célula o carrega e o perigo cresce com a
altura, pela `fatorDePerigo` que o molde já declarava e ninguém chamava.

### 5.4 Geração de imagem — ADIADA (decisão do autor)

Fica isolada, para depois. Exige `api/imagem.js` com a chave em variável de
ambiente e IndexedDB para guardar: a cota do localStorage já está apertada.

---

## O que fica de fora, e por quê

**Testar pela interface** o que a sonda já mediu por baixo. Masmorra sala a
sala, acampamento, compra e venda, tela de tombamento, diplomacia com facção
real: os módulos passaram nas sondas, e o que falta é a partida de verdade —
que rende mais na sua mão do que na minha, porque o bug de interface aparece
para quem joga, não para quem chama a função.

---

## Ordem sugerida, em uma linha

~~**1.1**~~ → ~~**2.1**~~ → ~~**2.2, 2.3**~~ → ~~**3.1–3.5**~~ →
~~**4.1–4.5**~~ → ~~**5.1, 5.2, 5.3**~~ → **5.4** (geração de imagem, adiada
por decisão do autor: fica isolada, para depois).

**O plano está cumprido.** O que travava a partida, o que a ficha prometia
sem cumprir, o que esvaziava o jogo com o tempo, o mundo que já existia sem
ninguém ver, e a arquitetura do prompt. Fora a geração de imagem — que é uma
integração externa e foi separada de propósito —, não há mais item aberto
neste plano.

O que sobra em [PENDENCIAS.md](PENDENCIAS.md) daqui em diante é de outra
espécie: coisas que só a partida de verdade revela. A lista de "o que ainda
não foi jogado" continua lá, e ela rende mais na mão de quem joga do que na
de quem chama a função.
