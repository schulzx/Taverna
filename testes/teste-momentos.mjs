/* OS MOMENTOS QUE VALEM CENA (v9.163)

   O jogo tinha três acontecimentos raros que passavam como linha de
   sistema no rodapé: subir de nível abria uma nota fiscal ("Nível 7,
   dois números, um botão"), o item lendário chegava como "◆ Achado: …"
   entre outras dez linhas, e trocar de cidade era "🧭 Chegada: …". O
   tombamento, quarto momento do plano, já valia cena desde a v9.42 (os
   dados que decidiram + as duas saídas com preço) e não foi tocado.

   O QUE ESTA SUÍTE PROTEGE é a fronteira de sempre: os momentos
   ANUNCIAM o que o sistema fez — a carta que vira mostra o nível que a
   tabela já deu; a revelação mostra o item que gerarLoot já criou; a
   faixa mostra a cidade que cidade_atual já registrou. Nenhum deles
   decide nada, e cada um tem o peso certo: modal para o que o jogador
   precisa confirmar, faixa que se apaga para o que é passagem. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync(S + "App.jsx", "utf8");
const CARTA = readFileSync(S + "carta-taro.jsx", "utf8");
const CSS = readFileSync(S + "constantes.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. A VIRADA DA CARTA — o nível abre com a carta de costas");
{
  t("o verso existe", /export function CartaVerso\(\)/.test(CARTA));
  /* verso ÚNICO, sem semente e sem texto: verso que muda por pessoa
     entrega a carta antes da virada */
  const verso = CARTA.slice(CARTA.indexOf("export function CartaVerso"));
  t("e é um só para o baralho inteiro", !/semente|ente/.test(verso.slice(0, verso.indexOf("return"))));
  t("sem texto nenhum", !/<text/.test(verso));
  t("o modal põe a carta no palco da virada", /<div className="tv-vira-palco/.test(APP) && /<div className="tv-vira">/.test(APP));
  t("a frente é a carta do herói com o nível NOVO", /<CartaDeTaro ente=\{\{ \.\.\.personagem, nivel \}\} lex=\{lex\} \/>/.test(APP));
  t("e o dorso é o verso", /<div className="tv-vira-verso"><CartaVerso \/><\/div>/.test(APP));
  /* a animação respira antes de virar: o jogador precisa VER o verso */
  t("a virada espera o olhar", /\.tv-vira \{ [^}]*\.45s both/.test(CSS));
  t("as faces escondem o dorso", /\.tv-vira-face \{ backface-visibility: hidden/.test(CSS));
  t("e o verso nasce virado", /\.tv-vira-verso \{ [^}]*rotateY\(180deg\)/.test(CSS));
}

sec("2. O ESPÓLIO REVELADO — raro para cima, e só");
{
  /* revelar item comum ensinaria a fechar o modal sem ler — e aí o
     lendário passaria batido também */
  t("a revelação existe", /function RevelacaoDoEspolio\(\{ item, fechar \}\)/.test(APP));
  t("só raro para cima a abre", /if \(\["raro", "epico", "lendario", "unico"\]\.includes\(it\.raridade\)\) setEspolioRevelado\(it\)/.test(APP));
  t("a cor é a da raridade, da tabela de sempre", /const cor = RARIDADE_COR\[item\.raridade\]/.test(APP));
  /* v9.179 (`momento-loot-epico-v2`): a lista de poderes saiu de dentro do
     JSX para uma variável, porque a grade do desenho precisa CONTAR quantas
     cartas há para decidir uma ou duas colunas. A lei é a mesma: todo poder
     aparece com o `diz` dele. */
  t("os poderes entram com o `diz` deles", /const poderes = item\.poderes \|\| \[\];/.test(APP) && /poderes\.map/.test(APP) && /\{p\.diz\}/.test(APP));
  /* E A CONCESSÃO PASSOU A APARECER. `afixos.js` a chama de "o que faz o
     lendário ser lendário" — ela põe uma habilidade do catálogo na mão do
     herói, de graça — e a revelação não a mostrava: o jogador via os números
     e não via a única coisa que muda o que ele PODE FAZER. */
  t("e a concessão finalmente aparece", /\{item\.concede && \(/.test(APP) && /\{item\.concede\}<\/div>/.test(APP));
  t("dizendo que ela sai sem PM", /você usa sem gastar PM/.test(APP));
  /* o brilho de trás segue a raridade: violeta fixo mentiria no lendário */
  t("o brilho de trás é da cor da raridade", /radial-gradient\(circle, \$\{cor\}/.test(APP));
  t("e diz onde o item já está", /Já está na sua mochila/.test(APP));
  /* a revelação NÃO entrega nada: o item entrou na mochila ANTES dela —
     fechar o modal sem ler não pode custar o item */
  const iGuarda = APP.indexOf("setPersonagem((p) => ({ ...p, equipamento: [...(p.equipamento || []), it] }));");
  const iRevela = APP.indexOf("setEspolioRevelado(it)");
  t("o item entra na mochila antes da revelação", iGuarda > 0 && iGuarda < iRevela);
  t("o brilho pulsa pelo CSS da casa", /\.tv-reliquia \{ animation: tvReliquia/.test(CSS));
}

sec("3. A CHEGADA — faixa que se apaga sozinha");
{
  t("a faixa existe", /function FaixaDeChegada\(\{ chegada, limpar \}\)/.test(APP));
  /* chegada é cena de passagem, não modal: bloquear o jogador a cada
     viagem seria cobrar pedágio pelo cenário */
  t("não come toque nenhum", /className="tv-faixa fixed inset-x-0 top-16 z-40 flex justify-center pointer-events-none/.test(APP));
  t("e se apaga sozinha", /const tid = setTimeout\(limpar, 3600\);/.test(APP));
  t("com o timeout morrendo com o efeito", /return \(\) => clearTimeout\(tid\);/.test(APP));
  /* o tom do bioma vem da tabela do palco — a mesma do cabeçalho de cena */
  t("o tom é o do palco", /const tom = \(TONS\[chegada\.bioma\] \|\| TOM_PADRAO\)/.test(APP));
  t("importado da tabela única", /import \{ cabecalhoDaCena, TONS, TOM_PADRAO \} from "\.\/palco\.js"/.test(APP));
  /* só TROCAR de cidade chega — reafirmar a cidade em que já estou, não */
  const bloco = APP.slice(APP.indexOf("A FAIXA DE CHEGADA (v9.163)"), APP.indexOf("A FAIXA DE CHEGADA (v9.163)") + 600);
  t("só a troca de cidade dispara", /if \(trocouCidade\) \{/.test(bloco));
  t("com os dados da cidade do mapa", /cidadeDoMapa\(md\.cidade_atual\)/.test(bloco));
}

sec("4. OS MOMENTOS SÓ EXISTEM EM JOGO");
{
  t("a revelação só na fase de jogo", /\{fase === "jogo" && espolioRevelado && <RevelacaoDoEspolio/.test(APP));
  t("a faixa também", /\{fase === "jogo" && <FaixaDeChegada/.test(APP));
  /* e os fixtures de bancada não podem vazar para o commit */
  t("o espólio nasce vazio", /const \[espolioRevelado, setEspolioRevelado\] = useState\(null\);/.test(APP));
  t("a chegada também", /const \[chegada, setChegada\] = useState\(null\);/.test(APP));
}

console.log(`\nmomentos v9.163: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
