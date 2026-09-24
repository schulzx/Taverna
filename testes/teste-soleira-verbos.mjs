/* OS QUATRO VERBOS DA SOLEIRA (R15) — e nenhum deles é regra nova

   O NÚMERO QUE ABRIU A ETAPA é do `jogo`, medido contra ele próprio em R6:
   **tomar uma oferta custa 990 ms; escrever uma frase custa 10,7 s** — um
   ganho de 10x que só disparava em **2 dos 20 turnos**, porque a soleira só
   sabia dois verbos. O censo ao contrário encontrou **5 turnos** com oferta
   legítima por nascer *com o motor de hoje* (um já pago por R13) e mais **4**
   que o motor não sabe ver (esses foram para `pedidos-ao-sistema.md`).

   A SOLEIRA NÃO TINHA UM PROBLEMA DE VOCABULÁRIO: TINHA DE ALCANCE.

   O que esta suíte protege é que os quatro verbos continuem a ser SURFACING —
   que o preço e o retorno saiam das MESMAS funções que o clique vai correr.
   Duas contas para o mesmo número seriam duas verdades, e o jogador tem
   direito à que o sistema vai mesmo aplicar.

   E ELA PRENDE UMA LINHA FRÁGIL DE PROPÓSITO (bloco 5): a divisão do veredito
   da petição em preço e retorno pelo " · " que `leituraDaPeticao` usa para
   juntar. É legítimo — é uma string construída para exibição — mas se a
   junção mudar, a tela mostra meio veredito sem avisar ninguém. *A casa já
   apanhou hoje uma asserção que passava por não achar nada; uma oferta que
   mostra meio preço é a mesma família.* */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const C = await import(S + "correio.js");
const V = await import(S + "viagem.js");
const { SOLEIRA, ALVOS } = await import(S + "estilo.js");
const APP = readFileSync("../src/App.jsx", "utf8");
const UI = readFileSync("../src/ui.jsx", "utf8");

let bons = 0, maus = 0;
const t = (n, c, porque = "") => {
  if (c) { bons++; console.log("  ok  " + n); }
  else { maus++; console.log("  XX  " + n + (porque ? "\n      → " + porque : "")); }
};
const sec = (s) => console.log("\n" + s);

const iSol = APP.indexOf("const ofertasDaSoleira = () => {");
const R = iSol < 0 ? "" : APP.slice(iSol, APP.indexOf('calou("montar a soleira"', iSol));

sec("0. a região foi encontrada");
t("a montagem da soleira existe e está em try/catch", R.length > 1000);

sec("1. `Seguir viagem` — o verbo que a tela ensinava o jogador a escrever de cor");
/* É O ÚNICO QUE NUNCA CAI (`r15-mesa.md` §8): sem ele a etapa é cosmética.
   A tela imprime `· escreva que segue viagem para avançar` no primeiro
   avanço — um verbo com custo calculado, determinístico, e ZERO portas de
   toque. Medido em R6: T10 e T19, duas viagens escritas no campo que não
   moveram o herói um metro; uma custou seis dias contra um prazo de quatro
   noites. */
t("a estrada é uma oferta", /id: "viagem\|seguir"/.test(R));
t("e o jogo continua a imprimir a senha que ela substitui",
  /escreva que segue viagem para avançar/.test(APP),
  "no dia em que esta frase sair da tela, esta oferta é a razão — e o dente cai junto");
t("o preço sai de `minutosPorAvanco`, que é o que `andar()` consome",
  /preco: emTempo\(minutosPorAvanco\(jornada\)\)/.test(R),
  "duas contas para o mesmo número seriam duas verdades");
t("o retorno usa a gramática de `linhaDaViagem`",
  /turnosRestantes === 1 \? "avanco" : "avancos"/.test(R));
t("o clique chama `viajar` com o destino do REF, não do estado",
  /aoClicar: \(\) => viajar\(\(jornadaRef\.current \|\| \{\}\)\.para \|\| ""\)/.test(R),
  "entre montar a lista e o dedo cair pode passar um turno");
t("não entra acampado, em combate, chegado nem pausado",
  /jornada && jornada\.para && !acampado && !combate/.test(R)
  && /!p\.chegou && p\.estado !== ESTADOS_VIAGEM\.pausada/.test(R));
/* a gramática do módulo, provada em Node e não lida do texto */
{
  const p = V.progressoDaViagem({ para: "Vila de Espinho", de: "Halda", totalMin: 960, andadoMin: 0, dias: 2 });
  t("`progressoDaViagem` dá turnosRestantes e chegou, que é o que a oferta lê",
    p && Number.isFinite(p.turnosRestantes) && p.chegou === false && typeof p.estado === "string");
  const fim = V.progressoDaViagem({ para: "X", totalMin: 100, andadoMin: 100 });
  t("e diz `chegou` quando chegou — a oferta some no fim da estrada", fim.chegou === true);
  t("`minutosPorAvanco` é determinístico: mesma jornada, mesmo custo",
    V.minutosPorAvanco({ totalMin: 960, dias: 2 }) === V.minutosPorAvanco({ totalMin: 960, dias: 2 }));
}

sec("2. `Pagar o que X pede` — e o `exige` deixa de ser botão morto");
/* O DEFEITO VIVO QUE R13 ESCREVEU E NUNCA CHEGOU AO CÓDIGO: filtrava-se
   `recusa` e deixava-se entrar `exige`. `Convidar Vero do Braseiro · tem
   preço` gastou um turno inteiro em T16 de R6. *Uma lei sem catraca é uma
   intenção.* */
t("quem recusaria continua fora", /if \(!v \|\| v\.resposta === "recusa"\) continue;/.test(R));
t("[a catraca de R13] o `exige` NÃO entra mais como `Convidar`",
  /if \(v\.resposta === "exige"\) \{/.test(R)
  && !/verbo: `Convidar \$\{n\.nome\}`,\s*\n\s*preco: \[\s*\n\s*v\.resposta === "exige"/.test(R),
  "era o botão morto de R6, e a lei que R13 escreveu nunca tinha chegado aqui");
t("quem exige e pode ser pago entra com o verbo certo",
  /verbo: `Pagar o que \$\{n\.nome\} pede`/.test(R));
t("o clique chama `bancarOConvite`, a função que já existia duas gavetas abaixo",
  /aoClicar: \(\) => bancarOConvite\(n\.nome\)/.test(R));
t("quem exige o que não se compra (tempo) não entra",
  /ex\.tipo !== "paga"/.test(R),
  "`bancarOConvite` recusa-a em voz alta: tempo não se compra");
t("quem exige mais do que há na bolsa não entra",
  /bolsa < \(Number\(ex\.moedas\) \|\| 0\)\) continue;/.test(R),
  "melhor uma soleira calada do que um botão morto");
t("e o saldo vai escrito ao lado do preço — o veredito com os dois lados",
  /◉ \$\{ex\.moedas\} · de \$\{bolsa\}/.test(R),
  "sem a cinta de R13 na tela, este preço seria outro `tem preço`");
t("o `Convidar` que sobra é só o `aceita`, e já não mente no retorno",
  /retorno: "aceitaria"/.test(R) && !/retorno: v\.resposta === "aceita"/.test(R));

sec("3. `Aceitar o que X pede` — a oferta mais perecível do jogo");
t("a petição é uma oferta", /id: `peticao\|\$\{p\.id\}`/.test(R));
t("só as pendentes", /p\.status !== "pendente"\) continue;/.test(R));
t("ordenadas pelo que fecha mais cedo",
  /daPeticao\.sort\(\(a, b\) => a\.fecha - b\.fecha\)/.test(R));
t("o que não se pode pagar não entra — bolso MAIS cofre, como `responderPeticao` confere",
  /ef\.moedas < 0 && bolso \+ cofre < -ef\.moedas\) continue;/.test(R));
t("o veredito sai de `leituraDaPeticao`, a função escrita para o dizer antes do clique",
  /const leitura = leituraDaPeticao\(p\)/.test(R));
t("e o que decide o saldo é `resolverPeticao(p, true)` — a MESMA que o clique corre",
  /const ef = resolverPeticao\(p, true\)/.test(R),
  "o ramo do aceite é puro; só o da recusa tem sorte dentro");
t("só o `aceitar` sobe — a soleira não é um formulário com duas caixas",
  /responderPeticao\(p\.id, true\)/.test(R) && !/responderPeticao\(p\.id, false\)/.test(R));

sec("4. a janela é `O selo de prazo`, não texto — e o motor conta as noites");
t("a oferta da petição leva janela", /janela: \{ quanto: noites, conta: "noites" \}/.test(R));
t("e as noites saem de `prazo - dia`, que é o que `processarDiaCorreio` usa",
  /const noites = Math\.max\(0, \(Number\(p\.prazo\) \|\| 0\) - dia\)/.test(R));
t("a tela passa a janela à peça", /janela=\{o\.janela\}/.test(APP));
t("`A oferta` aceita a janela como objecto OU número solto",
  /const j = typeof janela === "number" \? \{ quanto: janela \} : \(janela \|\| \{\}\)/.test(UI));
t("e desenha-a com `O selo de prazo`, não com uma segunda forma",
  /<SeloDePrazo noites=\{j\.quanto\}/.test(UI),
  "uma ação, uma forma");
/* O TETO DE CAMPOS É LEI E É VARRÍVEL: verbo · preço · retorno · janela.
   O quinto campo faz a oferta deixar de se ler de relance e passar a ser um
   formulário — e uma soleira de formulários é o point-and-click que a medida
   dos 990 ms existe para apanhar. */
t("o teto de campos é 4, e nenhuma oferta desta região passa dele", SOLEIRA.camposDaOferta === 4);
t("o teto da soleira não subiu: 1 no telefone, 2 na mesa",
  SOLEIRA.tetoNoTelefone === 1 && SOLEIRA.tetoNaMesa === 2,
  "pixels devolvem-se encolhendo a peça; atenção só se devolve acertando");
t("a fila do verbo é 48 e não 44", ALVOS.piso === 48);

sec("5. A LINHA FRÁGIL — a divisão do veredito, presa por um dente");
/* Se `leituraDaPeticao` deixar de juntar com " · ", a oferta passa a mostrar
   meio veredito e ninguém sabe. Estes dentes medem as SEIS entradas reais da
   tabela, não um caso inventado. */
t("o App divide pelo mesmo separador que a função usa para juntar",
  /String\(leitura\.aceitar \|\| ""\)\.split\(" · "\)/.test(R));
{
  const tipos = Object.keys(C.EFEITO_DA_PETICAO);
  t("a tabela tem as seis petições que esta divisão assume", tipos.length === 6, `tem ${tipos.length}`);
  let comSegunda = 0, todasInteiras = true, todasComPrimeira = true;
  for (const tipo of tipos) {
    const partes = String(C.leituraDaPeticao({ tipo }).aceitar).split(" · ");
    if (!partes[0]) todasComPrimeira = false;
    if (partes.join(" · ") !== C.leituraDaPeticao({ tipo }).aceitar) todasInteiras = false;
    if (partes.length > 1) comSegunda++;
  }
  t("toda petição dá uma primeira parte não vazia — nunca há preço em branco", todasComPrimeira);
  t("e a divisão não perde nenhum pedaço do veredito", todasInteiras);
  /* QUATRO DAS SEIS têm segunda parte. As duas que não têm — tributo e
     ameaça — não compram nada, e o retorno vazio ali é a verdade: paga-se
     para que nada aconteça. Se este número mudar, alguém mexeu na tabela e a
     tela passou a mostrar outra coisa. */
  t("quatro das seis têm retorno, e as duas sem retorno são as que não compram nada",
    comSegunda === 4, `têm segunda parte: ${comSegunda}`);
  t("a ameaça não compra nada — o retorno vazio ali é honesto",
    String(C.leituraDaPeticao({ tipo: "ameaca" }).aceitar).split(" · ").length === 1);
}

sec("6. as duas filas, e o desempate");
t("existem as duas e estão nomeadas", /const lista = \[\];/.test(R) && /const filaB = \[\];/.test(R));
t("a fila B é capada a uma", /const B = filaB\.slice\(0, 1\);/.test(APP));
t("a fila A ganha o primeiro lugar; a B o segundo",
  /return lista\.length \? \[lista\[0\], \.\.\.B, \.\.\.lista\.slice\(1\)\] : B;/.test(APP),
  "o que cobra está lá no turno seguinte; o que fecha, não");
t("e com a fila A vazia a B aparece sozinha",
  /: B;/.test(APP),
  "na estrada não há mural, nem mercado, nem quem pregue cartazes");

sec("7. nenhum verbo novo pediu número novo ao motor");
/* A etapa inteira é surfacing: toda função chamada pelos quatro verbos já
   existia e já era determinística. Se alguma tabela nova nascer aqui, é
   porque alguém inventou regra numa mesa que não é a do `backend`. */
for (const fn of ["viajar", "bancarOConvite", "responderPeticao", "setExaminando", "aceitarContrato", "responderMissao", "convidarNpc", "acampar"]) {
  t(`\`${fn}\` já existia — a soleira só lhe deu porta`,
    new RegExp(`(const ${fn} = |function ${fn}\\(|\\[${fn}, )`).test(APP) || new RegExp(`${fn}\\(`).test(APP));
}
t("e nenhuma tabela de regra nasceu nesta região",
  !/const [A-Z_]{4,} = \{/.test(R),
  "se é número, é tabela — e a tabela mora no motor, não na montagem da tela");

sec("8. o que continua FORA, e é metade da lei");
t("`Esperar` não voltou", !/id: "tempo\|esperar"/.test(R));
t("`ir a <lugar>` não entrou — é a tábua da cidade com outra roupa",
  !/id: `ir\|/.test(R) && !/verbo: `Ir a /.test(R),
  "está lá em todo turno de toda cidade e cresce com o mapa: mobília");
t("o mercado continua fora", !/id: "mercado\|aqui"/.test(R));
t("e a soleira continua a ser ZERO px quando não tem o que oferecer",
  /if \(!vivas\.length\) return null;/.test(APP),
  "região que reserva espaço para nada é mobília a mentir");

console.log(`\n${maus === 0 ? "TUDO VERDE" : "VERMELHO"} — ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
