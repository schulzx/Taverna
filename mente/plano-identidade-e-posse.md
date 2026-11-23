# Identidade e posse — a planta (23/11/2026)

**A ordem da pessoa, 23/11:** «Em algumas vezes você resolve um erro em escala individualizando a
situação… ele acaba não funcionando para todas as outras possibilidades, e sim só para aquele exemplo.
Precisamos criar sistemas funcionais que identifiquem e resolvam os problemas, e não apenas exemplos.
Se a troca não está funcionando, vou criar um sistema que identifica e realiza trocas; se os
personagens estão duplicando, em vez de proibir duplicidade naquele nome, vou criar um sistema de tags
ou numeração que vai na ficha do personagem, então mesmo que tenha dois fulanos, o sistema vai saber
qual é que está em cena.»

O sistema não modela duas coisas, e é delas que saem os sintomas das sessões 9 a 17:

- **Quem é quem.** Pessoa é identificada pelo nome. Convivem cinco esquemas de id e nenhum é dono.
- **Quem tem o quê.** Só o herói e o companheiro têm posse; não há registro de dívida; cada caminho
  que muda posse aplica do seu jeito.

Esta planta saiu de um levantamento só de leitura no código (arquivo e linha conferidos em 23/11; as
linhas andam, ache por Grep). **Regra desta fase: o relatório de uma etapa descreve um mecanismo, nunca
uma lista de frases ou de nomes consertados.** Regra por palavra ou por nome é defeito.

## 1. O inventário

**Onde pessoa é identificada por nome**
- `src/npcs.js` `criarNPC`: o registo `npcs` tem como chave o nome; `registrarConsulta` acha pelo nome
  em minúsculas; `nomeComDono` **recusa** o segundo homônimo.
- `src/livro-de-factos.js` `montarElenco`/`resolverCom`: ids `npc|<chave>` e `Cidade|gente|Nome`
  (via `idDaGente` de `src/mundo-base.js`), com fusão `para`; não escreve quando o nome é ambíguo.
  `src/motor/livro-do-turno.js` deixa de fora a gente da base e o núcleo, de propósito.
- `src/mundo-base.js` `genteDoLocal`: já cria `id: ${local.id}|${i}`, posicional e estável pela
  semente, e ninguém o lê.
- `src/em-cena.js` `idDe`: hash de `semente|pessoa|nome normalizado` (o esquema da tela).
- `src/quem-esta-aqui.js`: `quemEstaAqui` todo por nome; `quemONomeDiz` prefere o presente;
  `aCasaNaBase` funde registo e base pelo nome.
- `src/missoes.js` `mesmaPessoa`: compara só o primeiro nome. `src/procura.js` `nomeProcurado`: o nome
  mais longo ganha e casa por sobrenome.
- `src/o-ouvido.js` `pessoaEm`, `src/motor/a-cena-do-ouvido.js` (deduplica por nome),
  `src/o-veredito-da-troca.js` (`quemDaFrase`, o ausente pelo primeiro nome).
- `src/esqueleto.js`: papéis de quest são `{nome, cidade}`. `src/condicoes-da-quest.js` usa
  `idDaPessoa`/`pessoaDoLivro`.
- `src/elenco-do-lugar.js` (figurante) e `src/motor/o-batismo.js` (batizado): criam pessoa sem id.
- `src/App.jsx` calcula a presença de quatro jeitos: `pessoasDaCena`, `presentesAgora`,
  `presentesDaTela`, `ausentesAgora`; o retrato do ouvido junta os resultados à mão.

**Onde a posse muda**
- `src/App.jsx`: `mudarFicha` (a porta de escrita da ficha), `aplicarOVereditoDaTroca` (grava a ficha
  inteira), `darABaixaNaBanca` (`mercado.comprados`), `venderOUso`/`venderNoMercado`
  (`mercado.gastos`), e cerca de 35 escritas diretas de `moedas:` (espólio, pagar, tarefas, balcão e
  banca, achado).
- Puros: `src/o-veredito-da-troca.js` (`oVereditoDaTroca`, `oButimDoFurto`, `aVendaDoUso`),
  `src/a-venda-da-bolsa.js`, `src/motor/a-cena-do-ouvido.js` (`aTrocaDoOuvido`),
  `src/motor/uma-porta-so.js`, `src/bolsa-da-frase.js`.
- Lidos da prosa: `src/cobranca.js` alimenta `src/motor/aplicar.js`; a defesa contra o débito em dobro
  é uma lista de frases (`JA_PAGO_PELO_SISTEMA`).
- Recompensa, luta e chão: `src/motor/quests-do-turno.js`, `src/espolios.js` (`pagaDaQuest`),
  `src/motor/luta-do-turno.js`, `combate-do-turno.js`, `depois-do-turno.js`, `preludio-do-turno.js`,
  `src/saida-da-luta.js`, `src/chao.js`.

**O que já serve de base (não reinventar)**
- Os ids do livro já estão gravados em `factos`, e a fusão `para` já é resolução de identidade.
- O registo já aceita chave diferente do nome (`f.nome || chave`).
- Os fatos `recebeu`/`entregas` existem no livro com a porta «ainda por fazer».
- `src/comercio.js` `caixaDe`/`podePagar`: caixa base pela semente menos o delta gravado. É o padrão
  certo para a posse de personagem do mundo.
- `src/nucleo.js`: `CARREGA` e `divida` dão posse narrativa ao núcleo.
- O `mudou: {de, para}` do veredito já é meia transação.
- O ouvido já extrai pessoa (com estado), coisa (minha, dele, solta, e o dono), moeda e quantia, a
  preposição, o pedido dirigido, o «sem pagar» e o fiado.

## 2. Identidade — `src/quem-e-quem.js` (puro)

- **Forma do id: mantêm-se os do livro**, porque já estão no save. Base: `Cidade|gente|Nome`, e o
  homônimo na mesma cidade leva `~2` pela ordem determinística de `locaisDaCidade`. Registo, grupo e
  batizado: `npc|<chave>`. Figurante: `Cidade|figurante|<tipo>`. Banca: `banca|<id>`. Herói: `heroi`.
  Num save antigo tudo isso se deriva do que ele já tem.
- **Funções:** `idDe(registro, fonte, ctx)`; `oCatalogo(estado, {mundo, gente}) → {porId, porNome}`
  (a lista única de quem existe, já com as fusões); `candidatos(dito, catalogo, presenca) →
  [{id, estado: "aqui"|"longe"|"morto", rotulo, porque}]`; `presenca(estado, catalogo) → {aqui, longe,
  grupo, doSitio, doPasso}`; `rotuloDe(id, catalogo, cena)` (só distingue quando há outro de mesmo
  primeiro nome por perto: ofício, depois lugar, depois sobrenome); `fundir(pessoas, idDeBaixo,
  idDeCima)`.
- **Save, só aditivo:** `pessoas: {v, alias: {id → id}, fichas: {id: {nome, origem, chave, cidade,
  local}}}`, guardando só o que não se deriva (fusões e homônimos). `id` opcional na ficha do registo;
  quando falta, vale `npc|chave`. O segundo homônimo entra no registo com chave `Hilda~2` e
  `nome: "Hilda"`.
- **Falam por id primeiro:** livro, condições, papéis de quest, presença, procura e posse.
- **Ficam atrás de adaptador por nome** (mesma assinatura, delegando a `candidatos`): `idDaPessoa`,
  `quemONomeDiz`, `aCasaNaBase`, `nomeProcurado`, `mesmaPessoa`, `npcsRef.current[nome]`.

## 3. Posse e transação — `src/quem-tem-o-que.js` e `src/a-forma-da-troca.js` (puros)

- **Registro:** `posses: {v, delta: {id: {moedas, entrou: [item], saiu: [nome]}}, dividas: [{id, de,
  para, oQue, quanto, dia, prazo, estado}], aplicadas: [chave]}`, com teto. O herói continua na ficha
  e o companheiro em `grupo[].inventario`; o registro guarda só o delta de quem foi tocado.
- **Posse inicial derivada, sem save:** `posseInicial(id, ctx)` — moedas pela tabela de classe do
  butim com uma chave nova de semente (`${semente}|posse|${id}`; nenhum sorteio existente muda), itens
  pelo ofício e pelo `carrega` do núcleo. A banca é lida por adaptador (estoque menos `comprados`,
  caixa por `caixaDe`). `posseDe(id) = inicial + delta`. Do morto, `posseDe` é o que cai no chão.
- **Transação:** `{de, para, oQue: {tipo: "moedas"|"item"|"uso", nome, quantos}, contra: null|oQue,
  consentimento: "pedido"|"dado"|"tomado"|"devido", prazo?, origem, chave}`. `de` e `para` aceitam id,
  `chao|<cena>`, `mundo` (fonte do sistema: quest, loot) ou `nada` (consumo).
- **Uma função:** `aplicarTransacao(posses, ficha, t, ctx) → {ok, motivo, ficha, posses, chao,
  mercado, mudou, fato}`. Confere que `de` tem a coisa e que o consentimento `tomado` traz o dado. A
  `chave` já aplicada não aplica de novo (é o que mata o débito em dobro pela estrutura). Escreve
  `entregas` no livro e abre ou fecha dívida.
- **O tipo sai da forma, numa tabela** — `aFormaDaTroca({gesto, de, para, contra, divida, prazo})`:
  - herói → outro, sem contrapartida: **dar**; com prazo, **emprestar**; com dívida aberta da coisa,
    **devolver**; moeda contra dívida ou serviço, **pagar**.
  - herói → outro, com contrapartida: moeda do outro, **vender**; coisa do outro, **escambo**; um
    favor, **subornar**.
  - outro → herói, com contrapartida em moeda do herói: **comprar**.
  - outro → herói, sem contrapartida: pedido, **pedir** (com prazo, pedir emprestado); tomado,
    **furtar** ou tomar; dívida do outro com o herói, **cobrar**.
  - chão ou mundo → herói: **pegar**.
- **O que o ouvido entrega:** as entidades com ids (`candidatos`), a coisa ligada a `posseDe`, a
  quantia, o papel das preposições, e o **gesto** (o verbo reduzido a oferecer, pedir, tomar, apelar à
  dívida, propor troca), mais prazo, consentimento, negação, condicional e fala.
- **O que o ouvido deixa de decidir:** o subtipo. Saem as regras por verbo e por construção de troca
  (`jeitosDeDizer` de troca, `ofertaImperativa`, `vendaPorPreco`, o mapa de `pedidoDirigido`, o menu
  de `dinheiroNaFrase`). O texto só desempata a direção quando os dois lados têm a coisa. O campo
  `subtipo` continua na leitura, com o mesmo vocabulário, porque a bancada e o exame o leem.

## 4. As etapas (um agente cada, uma versão cada)

1. **Catálogo e ids.** `quem-e-quem.js`; `montarElenco`/`resolverCom` delegam; campo `pessoas` em
   `estado.js`. Nada muda para quem joga. *Prova:* suíte inteira verde, `teste-livro-de-factos` sem
   mudança, os replays de sessão byte a byte, e duas Hildas que dão dois ids.
2. **Presença por id.** `quemEstaAqui` ganha `id` por entrada; as quatro presenças do App viram uma
   `presencaAgora()`; os comparadores por nome vão para os adaptadores. Atrás da chave. *Prova:* a
   bancada nunca abaixo de hoje; casos para dois homônimos, um presente e um longe.
3. **Rótulo e homônimo.** `rotuloDe` no «qual», na tela e na pauta (trocando o nome, sem linha nova);
   `nomeComDono` registra `~2` em vez de recusar. Atrás da chave. *Prova:* duas Hildas no mesmo sítio
   dão um «qual» com rótulos distintos; a pauta dentro do teto.
4. **Quest e fatos por id.** Os papéis ganham `id`; as condições leem o id primeiro e o nome como
   recuo. *Prova:* um save antigo acaba a quest.
5. **Registro e `aplicarTransacao`**, ainda sem chamadores. *Prova:* dar 15 moedas e receber 5 de
   volta funciona; a mesma chave duas vezes não muda nada; o que o morto levava aparece.
6. **A troca da frase passa por transação.** `aTrocaDoOuvido` e `oVereditoDaTroca` devolvem
   `transacoes`; o App chama `aplicarTransacao` uma vez. Atrás da chave. *Prova:* a bancada nunca
   abaixo de hoje, deltas de ficha idênticos, e frases novas sobre a posse do outro lado.
7. **Os outros caminhos** (dois agentes): loja, cobrança da prosa, paga de quest, espólio, luta, chão,
   furto, dízimo. *Prova:* uma catraca que conta as escritas diretas de `moedas:`/`inventario:` no App
   e só deixa o número descer.
8. **A forma da troca.** `a-forma-da-troca.js` roda **em sombra** ao lado do subtipo do ouvido, no
   corpus, na bancada e no exame; troca-se subtipo a subtipo quando concorda tanto quanto hoje ou
   mais. *Prova:* exame selado e bancada sem cair, e os lotes inéditos subindo.
9. **Dívidas na mesa.** Emprestar, fiado, cobrar, devolver e pagar sobre o registro, e uma linha
   dinâmica «X te deve Y» só com X em cena.

## 5. O que ficou decidido (por quem rege, em 23/11; tudo reversível por commit)

1. **Forma do id:** os do livro, com tabela de alias e sufixo `~2`. Os fatos já gravados continuam
   válidos sem migração.
2. **Gente da base no catálogo:** entra por alias (`npc|X` ↔ `Cidade|gente|X`, refeita pela semente),
   sem regravar chave de fato.
3. **Mundo fechado só na troca da frase, por enquanto:** recompensa de quest e loot saem de `mundo`,
   senão o camponês pobre deixa de pagar a quest.
4. **Caixa do mercador:** lido por adaptador; `mercado.gastos` e `mercado.comprados` não mudam.
5. **O exame selado:** a etapa 8 é a única que mexe no que ele mede; vai em sombra e por subtipo. O
   gesto fica como pista de consentimento, nunca como tabela de tipo.

**O limite de sempre:** campo de save novo e aditivo pode; campo existente não muda nem sai; um save
antigo tem de abrir e jogar. Tudo o que muda o que o jogador vive fica atrás da chave do Mestre vivo
até ser provado jogando.

**As réguas:** a bancada `testes/bancada-da-troca/` (jogo real, sem IA paga; três arquivos de frases)
e o exame selado (`testes/teste-o-ouvido.mjs`; o arquivo do exame não se abre).
