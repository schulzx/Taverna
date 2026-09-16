/* check-endereco-do-tabuleiro.mjs (E2) — o endereço tem UMA gramática, e a
   casa tem UM nome.

   A DOENÇA QUE ESTE VARREDOR EXISTE PARA IMPEDIR, e ela é de TEXTO e não
   de comportamento — por isso é varredor e não suíte:

   1. A SEGUNDA TABELA DE LETRAS. `LETRAS_DA_GRADE` (`coordenadas.js:151`)
      já é a gramática do endereço no pergaminho desde a v9.118. O
      tabuleiro passou a escrever `K14` em E2. No dia em que alguém
      escrever `"ABCDEFGHIJ"` à mão dentro de um `.jsx` — porque é mais
      rápido do que importar —, o jogo passa a ter duas tabelas de letras
      sobre o mesmo chão, e elas concordam até ao dia em que uma delas
      ganhar a vigésima primeira letra. **Nenhum módulo prova isto:** a
      segunda tabela funciona perfeitamente; ela só é a segunda.

   2. O NOME ACESSÍVEL DUPLICADO. O `<title>` de SVG faz duas coisas ao
      mesmo tempo: nome acessível e balão do rato. E2 decidiu que ele SAI,
      não que ele acompanha — duas strings sobre a mesma casa seriam duas
      verdades, e a segunda é aquela que o navegador desenha por cima do
      campo tapando as casas para onde o jogador ia andar. Um `<title>`
      que volte a nascer ali não quebra nada e não dá erro nenhum.

   3. A CASA SEM `role`. `aria-label` num `<rect>` sem `role` é IGNORADO —
      em silêncio, por todos os leitores de tela. A casa impedida era
      exatamente a que não tinha `role`, e é a que mais precisa de ser
      lida: é a que explica por que não dá. Este é o defeito mais caro dos
      três porque é o único INVISÍVEL nas duas pontas: não falha em teste
      nenhum e não aparece na tela de quem tem olhos.

   POR QUE UM VARREDOR E NÃO UMA SUÍTE. Não há módulo para medir: a régua
   e o nome da casa são JSX dentro de uma componente que precisa de React,
   de uma grade montada e de um DOM para existir. O que se pode medir sem
   nada disso é o TEXTO — e o texto é onde estas três doenças vivem. Uma
   suíte prova um módulo; um varredor prova que um erro velho não voltou,
   em lugar nenhum.

   OS BURACOS, com número, porque buraco calado é mentira:

   - O DENTE 1 procura a SEQUÊNCIA `ABCDEFGHIJ` — dez letras SEGUIDAS,
     com o `I` lá dentro. Uma tabela escrita fora de ordem (`"ACBDEFGHIJ"`)
     ou partida em array (`["A","B",…]`) passa. É deliberado: o alfabeto
     seguido é a forma que alguém com pressa escreve, e um regex que
     tentasse apanhar qualquer conjunto de vinte letras morderia prosa.
     E o `I` é o que faz o dente medir a coisa certa e não o parecido:
     `ALFABETO_DO_CODIGO` (`sala.js:42`) começa por `ABCDEFGH` e é uma
     tabela LEGÍTIMA de outra mesa — o código de sala, dito em voz alta,
     que tira de propósito o `0/O/1/I/5/S` porque se confundem ao ser
     lidos. Uma grade nunca pode saltar o `I`: as colunas são contíguas.
     Medido hoje: 1 ocorrência no escopo inteiro, e é a tabela legítima.
   - O VEREDITO do nome da casa NÃO é medido palavra por palavra, e isso é
     dívida ESCRITA e não esquecimento: a lei de `formas.md` manda que ele
     seja a `curta` de `RECUSAS_DO_PASSO`, que é do `backend` e ainda não
     existe. Quando existir, este varredor ganha o dente que compara as
     duas — e a catraca dos 54 caracteres passa a proteger os dois canais.
     Até lá o que se mede é que o campo do veredito EXISTE e nunca fica
     vazio (um ramo final sem condição), que é o que hoje se pode provar.
   - O ROVING TABINDEX de E1 §6 fica fora: hoje cada casa alcançável ainda
     é um ponto de tabulação (E1 mediu 86 por luta). Não é dente porque a
     correção não é deste arquivo sozinho — a ordem de tabulação da tela
     inteira é do `App.jsx`, e o bastão dele não está nesta mão.

   Nada aqui sorteia e nada aqui depende de rede: o acervo é o texto do
   repositório. Duas rodadas dão a mesma saída, em qualquer máquina. */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* O `rodar-tudo.mjs` faz `process.chdir` para `testes/`, mas rodar
   `node testes/check-endereco-do-tabuleiro.mjs` da raiz também tem de
   funcionar. Quem decide a raiz é o diretório DESTE módulo. */
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

const ARQUIVO = "src/grade-de-batalha.jsx";
const DONA_DAS_LETRAS = "src/coordenadas.js";
const EXTENSOES = [".js", ".jsx", ".ts", ".tsx"];

/* ============================================================
   O ACERVO — `src/**`, e nunca `testes/`: `testes/render-teste.mjs` é
   bundle de esbuild commitado, e o que lá está dentro não é decisão de
   ninguém. É o mesmo recorte de `check-formas.mjs`, pelo mesmo motivo.
   ============================================================ */
const arquivos = [];
const andar = (rel) => {
  const abs = join(RAIZ, rel);
  if (!existsSync(abs)) return;
  for (const nome of readdirSync(abs).sort()) {
    const filho = rel + "/" + nome;
    if (statSync(join(RAIZ, filho)).isDirectory()) andar(filho);
    else if (EXTENSOES.some((e) => nome.endsWith(e))) arquivos.push(filho);
  }
};
andar("src");

/* O PISO DO ALCANCE, transplantado do `check-formas`: sem ele, um bug no
   andarilho que devolvesse lista vazia passaria VERDE medindo nada — e
   catraca verde por vazio é pior que catraca nenhuma. */
const PISO_DE_ARQUIVOS = 100;   /* ~150 módulos em `src/*` hoje */

const G = existsSync(join(RAIZ, ARQUIVO)) ? readFileSync(join(RAIZ, ARQUIVO), "utf8") : "";
/* O CÓDIGO SEM OS COMENTÁRIOS. Esta base já se queimou uma vez, em
   `teste-grade.mjs`: uma prova casou com a PROSA que explicava a remoção
   de uma coisa, e jurou que a coisa continuava no desenho. O que se mede
   aqui é o que roda — menos onde está escrito o contrário. */
const CODIGO = G.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

sec("0. o alcance — catraca verde por vazio é pior que catraca nenhuma");
console.log(`  ··  ${arquivos.length} arquivos de código em src/**`);
t(`a varredura alcança pelo menos ${PISO_DE_ARQUIVOS} arquivos`,
  arquivos.length >= PISO_DE_ARQUIVOS, `achou ${arquivos.length}`);
t(`e ${ARQUIVO} foi lido`, CODIGO.length > 1000, `leu ${CODIGO.length} caracteres`);

/* ============================================================
   1. NÃO NASCE UMA SEGUNDA TABELA DE LETRAS
   ============================================================ */
sec("1. a gramática do endereço é UMA — nenhuma segunda tabela de letras");
const donos = [];
for (const arq of arquivos) {
  const texto = readFileSync(join(RAIZ, arq), "utf8");
  const n = (texto.match(/ABCDEFGHIJ/g) || []).length;
  if (n > 0) donos.push(`${arq} ×${n}`);
}
console.log(`  ··  o alfabeto seguido aparece em: ${donos.join(" · ") || "lugar nenhum"}`);
t("só um arquivo do projeto escreve o alfabeto, e é o dono da tabela",
  donos.length === 1 && donos[0].startsWith(DONA_DAS_LETRAS),
  `esperava só ${DONA_DAS_LETRAS}, achou: ${donos.join(" · ")}`);
t(`e ${DONA_DAS_LETRAS} continua a exportar LETRAS_DA_GRADE`,
  /export const LETRAS_DA_GRADE = "[A-Z]+";/.test(readFileSync(join(RAIZ, DONA_DAS_LETRAS), "utf8")));

/* ============================================================
   2. O TABULEIRO IMPORTA A TABELA, E NÃO A REESCREVE
   ============================================================ */
sec("2. o tabuleiro pede a tabela emprestada em vez de fabricar a sua");
t("importa LETRAS_DA_GRADE de coordenadas.js",
  /import \{ LETRAS_DA_GRADE \} from "\.\/coordenadas\.js";/.test(CODIGO));
t("e é dela que sai a letra da régua", /LETRAS_DA_GRADE\[x\]/.test(CODIGO));
/* DOIS leitores da tabela, e o número é exato de propósito: a régua lê a
   LETRA sozinha (é o que ela desenha na calha) e `enderecoDaCasa` compõe o
   ENDEREÇO. São duas leituras da mesma tabela, que é o oposto de duas
   tabelas. O que não pode haver é uma segunda COMPOSIÇÃO — letra colada a
   número — porque é aí que nascem as duas verdades. */
t("a tabela tem dois leitores aqui — a régua lê a letra, o endereço compõe",
  (CODIGO.match(/LETRAS_DA_GRADE\[/g) || []).length === 2,
  "se subiu, alguém compôs o endereço num segundo sítio — deixe `enderecoDaCasa` ser a única.");
t("e a composição letra+número mora num sítio só",
  (CODIGO.match(/LETRAS_DA_GRADE\[x\] \|\| "\?"/g) || []).length === 1);
t("e ela é local, não exportada — sem leitor de fora, a catraca `teste-ligacao` mordia",
  /^const enderecoDaCasa = /m.test(CODIGO) && !/export const enderecoDaCasa/.test(CODIGO));
t("o número da linha é `y + 1`, como `gradeDe` faz no pergaminho",
  /enderecoDaCasa = \(x, y\) => `\$\{LETRAS_DA_GRADE\[x\] \|\| "\?"\}\$\{y \+ 1\}`/.test(CODIGO));

/* ============================================================
   3. A RÉGUA — aria-hidden, nas duas bordas, com três graus
   ============================================================ */
sec("3. a régua: muda o olho e não diz uma palavra ao ouvido");
/* Um leitor de tela a ler trinta e quatro letras e números seguidos não
   lê nada. A régua é desenho; o endereço mora no nome da casa. */
const reguas = (CODIGO.match(/<RotuloDaRegua\b/g) || []).length;
console.log(`  ··  ${reguas} rótulos declarados · ${(CODIGO.match(/aria-hidden="true"/g) || []).length} nós aria-hidden`);
t("existem as duas réguas — as letras em cima e os números à esquerda, nunca as quatro bordas",
  reguas === 2, `achou ${reguas} declarações de <RotuloDaRegua>`);
t("a das letras e a dos números estão dentro de nós aria-hidden",
  (CODIGO.match(/aria-hidden="true"/g) || []).length >= 3,
  "o canto e as duas calhas — três nós — são todos aria-hidden");
t("e o canto de 22×22 não leva rótulo", /\{\/\* o canto é `bg` e não leva rótulo/.test(G) || /<div aria-hidden="true" \/>/.test(CODIGO));

sec("4. os três graus existem, e o filete é o canal que não é cor");
t("a tabela dos graus tem os três",
  /repouso:\s*\{/.test(CODIGO) && /procurada:\s*\{/.test(CODIGO) && /realcada:\s*\{/.test(CODIGO));
t("Repouso é inkDim e não tem filete", /repouso:\s*\{ cor: T\.inkDim,\s*filete: null \}/.test(CODIGO));
t("Procurada é ink com filete de lineStrong", /procurada:\s*\{ cor: T\.ink,\s*filete: T\.lineStrong \}/.test(CODIGO));
t("Realçada é amberSoft com filete de amber", /realcada:\s*\{ cor: T\.amberSoft,\s*filete: T\.amber \}/.test(CODIGO));
t("o filete tem 2 px nos dois eixos", /height: 2 \}/.test(CODIGO) && /width: 2 \}/.test(CODIGO));
/* `procurada` não tem gatilho hoje — ela pertence à frase digitada, que
   espera `casaDoEndereco` do `backend`. O que a catraca exige é que ela
   seja um VALOR do mesmo `grau`, nunca um caminho separado: no dia em que
   o motor nascer, quem a chama é ele e nada muda de forma aqui. */
t("e `procurada` é valor do mesmo `grau`, nunca um caminho à parte",
  /GRAUS_DA_REGUA\[grau\]/.test(CODIGO) && !/grau === "procurada"/.test(CODIGO));
t("o movimento é 90 ms, o mesmo número da casa", /const MS_DA_REGUA = 90;/.test(CODIGO));
t("com saída no prefers-reduced-motion, e sem classe nova",
  /prefers-reduced-motion: reduce/.test(CODIGO) && /parado \? 0 : MS_DA_REGUA/.test(CODIGO));
t("rotula uma a cada N = ceil(30 / lado)",
  /Math\.ceil\(LADO_QUE_CABE_UM_ROTULO \/ /.test(CODIGO) && /const LADO_QUE_CABE_UM_ROTULO = 30;/.test(CODIGO));
t("e a calha mede 22 px", /const CALHA_DA_REGUA = 22;/.test(CODIGO));
/* Definido FORA do render: componente declarado lá dentro nasce outro a
   cada quadro e mata o foco — e aqui é o foco que acende o rótulo. */
t("o rótulo é componente de módulo, não de render",
  /^function RotuloDaRegua\(/m.test(CODIGO));

/* ============================================================
   5. O NOME ACESSÍVEL DA CASA — e o `<title>` não voltou
   ============================================================ */
sec("5. a casa tem UM nome, e ele não é um balão de rato");
t("não sobrou nenhum <title> no arquivo", !/<title>/.test(CODIGO),
  "o <title> de SVG é também o balão do rato — o balão que esta casa recusou, entregue pelo navegador em vez de por nós.");
t("toda casa é gridcell, alcançável ou não", /role="gridcell"/.test(CODIGO) && !/role=\{clicavel \? "button"/.test(CODIGO));
t("e a casca é o `grid` do WAI-ARIA, com as linhas", /<g role="grid"/.test(CODIGO) && /<g key=\{`li\$\{y\}`\} role="row">/.test(CODIGO));
t("o nome vai em aria-label, que não tem ambiguidade de suporte", /aria-label=\{nomeDaCasa\}/.test(CODIGO));
t("e ele tem os quatro campos, separados por ·",
  /const nomeDaCasa = \[end, quem, lugar, veredito\]\.filter\(Boolean\)\.join\(" · "\)/.test(CODIGO));
t("com o endereço à frente — é o único campo que muda sempre",
  /\[end, quem/.test(CODIGO));
/* O CAMPO DO VEREDITO NUNCA FICA VAZIO. Antes, quando a casa não dava, o
   `<title>` simplesmente acabava — e silêncio lê-se como "não há nada a
   dizer", nunca como "não dá". A prova é de FORMA: a cadeia de ternários
   termina num ramo SEM condição, logo não há caminho que devolva "". */
t("o veredito nunca fica vazio — a cadeia acaba num ramo sem condição",
  /: `não dá para andar até \$\{end\} agora`;/.test(CODIGO));
t("a casa impedida diz por que não dá", /fica fora do seu passo nesta rodada/.test(CODIGO));
t("a parede diz que é pedra, e não `ocupado`", /é pedra/.test(CODIGO));
t("a casa ocupada diz QUEM, não `ocupado`", /\$\{oc\.ent\.nome\} está em \$\{end\}/.test(CODIGO));
t("e o foco do teclado acende a régua como o dedo acende",
  /onFocus=\{\(\) => setFocada\(\{ x, y \}\)\}/.test(CODIGO) && /const apontada = focada \|\| sobre;/.test(CODIGO));

/* ============================================================
   6. O FUNDO DO CAMPO — o literal que E1 deixou pago de antemão
   ============================================================ */
sec("6. o fundo do tabuleiro saiu da cabeça de quem digitou e foi para a tabela");
/* Sobre `#141020` o vão de 2 px do anel de foco dava 1,04:1 e não se
   separava do fundo. Em `T.bg` ele volta a funcionar como desenhado — e a
   diferença é invisível a olho nu. */
t("o `#141020` não existe mais no arquivo", !/#141020/i.test(CODIGO),
  "o vão de 2 px do anel de foco dá 1,04:1 sobre ele, e não se separa.");
t("e o fundo do <svg> sai de T", /background: T\.bg, border: `1px solid \$\{T\.line\}`/.test(CODIGO));

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
