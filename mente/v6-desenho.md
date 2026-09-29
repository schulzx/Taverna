# V6 · o compositor e o dado, com V6a dentro — a construção (`desenho`, 28/09)

A decisão está em `mente/formas.md` §V6; o momento é do `jogo` (`mente/v6-jogo.md`).
Aqui fica **a ordem para o `oficial`**, o que cada script toca, a prova e os números.

## 1 · A ordem — cinco scripts

Pasta: `C:\Users\clara\AppData\Local\Temp\claude\C--Users-clara-Desktop-Taverna\abe8407d-8980-431b-acd7-f819615f4634\scratchpad\v6-desenho\entrega\`

Todos usam `_arquivo.cjs`, que **aceita LF e CRLF** e falha se a âncora não bate ou
é ambígua. Os trechos longos moram em `.txt` ao lado (`2-glifos.txt`,
`3-pecas.txt`, `5-v6a.txt`, `5-compositor.txt`). Só o 5 toca o `App.jsx`: **o
bastão é preciso para ele**. De dentro da pasta, com `R` = a raiz do projeto:

```
node 1-estilo.cjs R
node 2-glifos.cjs R
node 3-ui.cjs R
node 5-app.cjs R
node 6-testes.cjs R        # copia teste-v6-compositor.mjs (ao lado) para testes/
npm run build && npm test
```

(Não há 4.)

**As linhas do `App.jsx`.** 24 442 → 24 527. Antes da linha **22 489** (o último
endereço que o `check-acoes-do-jogador` lê) há só **8 trocas na mesma linha**:
- os dois imports;
- os quatro `setEntrada("")` de quem manda, que passam a apagar também o rascunho;
- o `irMenu`, que guarda em vez de apagar;
- o `campoAberto`.

O 5 **confere** que o trecho da linha 22 489 continua na 22 489. **0 endereços
mexidos.**

**Provado** em duas cópias de `6805086` — LF (`git -c core.autocrlf=false archive`)
e CRLF (`core.autocrlf=true`) —: **build limpo, 218/218 suítes, 15/15 varredores
nas duas** (antes: 217/217 · 15/15). **A suíte da sala não foi tocada** (o
critério 12 do `jogo`), e a tela de combate também não (`dadoDaBatalha`,
`painel-batalha.jsx`, `grade-de-batalha.jsx` fora do diff).

**Commit** (`git commit -- <caminhos>`): `src/App.jsx` `src/estilo.js` `src/glifos.js`
`src/ui.jsx` `testes/teste-r3-campo-do-turno.mjs` `testes/teste-v3-glifos.mjs`
`testes/teste-v6-compositor.mjs` + `src/constantes.js` (o bump, por último).

## 2 · O que cada script toca

- **1-estilo.cjs** — as tabelas `DADO` (glifo 24, borda 1,5, brilho 8 a 0,25,
  reflexo 0,25, o apagado 0,55, a face 0,35, lançado 300 ms, pulso 400 ms, a pausa
  do rascunho 400 ms) e `COMPOSITOR` (raio 24, borda 1,5, fundo 20); na folha, os
  três movimentos do dado (`tv-dado-lancado`, `tv-dado-pulso`, `tv-dado-rolar`,
  com saída no reduced-motion) e o anel do foco da pílula (`tv-pilula-do-campo`).
  Os comentários da folha estão sem crase (vivem num template-literal).
- **2-glifos.cjs** — `ESTADOS_DO_DADO`, `estadoDoDado`, `envioEspera`,
  `nomeDoDado`, `linhaDoTeste`, `chaveDoRascunho`, `rascunhoPara`, `rascunhoDe`.
- **3-ui.cjs** — nascem `Dado` e `LinhaDoVeredito` (antes da tira da resposta).
- **5-app.cjs** — pela ordem:
  - os imports;
  - os quatro envios apagam o rascunho;
  - `irMenu` guarda;
  - `campoAberto` sem `bloqueado`;
  - o órgão de V6a (`5-v6a.txt`): o estado e o nome do dado, o rascunho que volta
    e se guarda, `lancarODado`, `tocarNoDado`, a linha do campo;
  - o convés a `COMPOSITOR.fundo`;
  - o compositor novo (`5-compositor.txt`);
  - o cartão do teste com o `Rolar d20` sai.
- **6-testes.cjs** — em `teste-r3-campo-do-turno` mudam sete asserções, **cada uma
  com o motivo escrito ao lado**:
  - o `<textarea>` com `ref`;
  - o Enter decidido por `gestoDoCampo`;
  - o Enter que não escreve linha em branco;
  - o gesto de agir é o dado;
  - o dado em Repouso;
  - a espera;
  - o campo que já não fecha.

  Em `teste-v3-glifos`, o teste pendente com a linha do veredito e o d20 no dado.
  E a suíte nova, `teste-v6-compositor.mjs`, com 48 checagens: as contas, as
  medidas e o movimento, as peças, a fiação.

## 3 · O harness — os estados e as letras sem gastar chamadas

`scratchpad\v6-desenho\medir-v6.mjs`: o jogo vivo no Chrome headless, perfil
temporário, o save do dia injetado com o jogo desmontado. O Narrador é simulado: o
pedido é segurado 3,5 s e respondido com prosa fixa, e nos outros casos 0,8 s —
**0 chamadas**. As cenas, a 375 × 812 e a 1280 × 800:
- Repouso, e o toque nele;
- Pronto, e Shift+Enter;
- Lançado aos 60 ms, e À espera;
- 20 letras a 60 ms durante a espera, e o Enter na espera;
- a resposta que chega, e 5 s sem envio;
- recarregar com texto;
- o teste pendente (o save com `rolagem`): 20 letras, o Enter e o toque;
- outra campanha, e voltar;
- enviar e recarregar;
- o Lançado com reduce.

Uso: `ORIGEM=http://localhost:<porta> ROTULO=antes|depois node medir-v6.mjs`.
Resultados: `v6-antes.json`, `v6-depois.json`; fotos em `fotos-antes\`,
`fotos-depois\`.

## 4 · Os números

Em `formas.md` §V6 ponto 5. Em uma linha: **20 de 20 letras na espera e no teste
(eram 0), 0 envios com Enter na espera e com teste, 0 envios automáticos em 5 s,
um dado na tela em todos os estados, o rascunho volta ao recarregar e só à mesma
campanha, e apaga-se ao enviar.**

## 5 · A conferência viva (depois do commit)

Aba nova. Salvar e restaurar os espaços de save antes de injetar. A 375 e a 1280:
1. **Campo vazio**: o dado em contorno; tocá-lo põe o cursor no campo.
2. **Escrever**: o dado acende (e **AGIR** aparece, na mesa); o Enter envia; Shift+Enter
   quebra.
3. **Escrever enquanto o Mestre responde**: as letras entram; o Enter não manda e o
   dado pulsa; aparece *"Fica guardado — você manda depois de ler."*; quando a
   resposta chega, o texto continua lá e o dado acende.
4. **Um teste pendente**: a linha `Teste de … · dif. …` por cima do campo, o dado com
   a dificuldade na face; escrever funciona; o Enter não rola; tocar no dado abre o
   véu.
5. **Recarregar a página** com texto no campo: o texto volta. **Ir ao menu e
   voltar**: volta.

## 6 · Figma

- **Biblioteca** `e5wJUzInAssoebx5npssKc`, página **`V6 · o compositor e o dado`**
  (`247:67`):
  - `O dado` (`247:85`, cinco estados);
  - `A pílula do campo` (`247:106`: repouso, com texto, armada, milagre, na espera);
  - `A linha do veredito` (`247:107`);
  - o par antes/depois: 375 em quatro estados; 1280 com texto e com teste.
- **Arquivo da pessoa** `ffWFqD7TueSb88Mkeg9bhW`, **`146:2`** (página `02 · Entrada`,
  abaixo de V5): o `126:112` clonado por cima de três faixas do código, com as
  marcas e **os 15 desvios escritos um por um** (D1–D8 do `jogo`, D9–D15 do
  `desenho`).

## 7 · O que fica para o `regente` e para o `jogo`

- **A linha do veredito de batalha** (`painel-batalha.jsx`, 11 px) é a mesma ideia
  que a peça nova (12 px). Passar a batalha a importá-la é um diff de duas linhas
  **no ramo de combate** — não o toquei. Fica à espera do sim do `regente`.
- **A sala a dois** (formas §V6.4): ficou a promessa da faixa, e a decisão volta ao
  `jogo`.
- **A largura do campo aberto no telefone** (formas §V6.6): 233 px. A alternativa
  está medida por escrito; a escolha é do `jogo`.
