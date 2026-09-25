/* teste-r2-pecas.mjs (R2) — A Oferta, A Soleira, A Voz existem com a
   forma que `mente/formas.md` fechou.

   POR QUE UM VARREDOR DE TEXTO E NÃO UMA SUÍTE QUE RENDERIZA. As três
   peças são JSX dentro de `src/ui.jsx`, e `check-endereco-do-tabuleiro.mjs`
   já documentou por que esta casa não roda JSX em Node puro: "a régua e
   o nome da casa são JSX dentro de uma componente que precisa de React,
   de uma grade montada e de um DOM para existir" — não há harness de
   render nesta suíte de testes, só varredores de texto. O que se pode
   provar sem DOM é o TEXTO do módulo, e é o texto onde a forma vive:
   os três eixos de cada peça, os tokens que ela lê (nunca um número à
   mão), e os nomes exatos que `formas.md` fixou.

   POR QUE ESTE ARQUIVO EXISTE, e não é só documentação: `teste-ligacao.mjs`
   (a catraca de export morto) cobra ≥2 leitores para toda regra
   exportada, e nenhuma das três peças tem consumidor no `App.jsx` ainda
   — é o `oficial` quem as liga, com o bastão, na etapa seguinte. Sem
   este arquivo, `Oferta`, `Soleira` e `Voz` ficariam mudas no dia em que
   nasceram, e a catraca quebraria a suíte por um motivo que não é bug —
   é só a ordem certa das duas mãos (o `aprendiz` fabrica, o `oficial`
   liga depois). Citar os três nomes aqui é o que os mantém vivos até lá. */
import { readFileSync } from "node:fs";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

const bruto = readFileSync("../src/ui.jsx", "utf8");
/* a mesma máscara de `check-formas.mjs`: comentário não é código, e um
   nome citado numa explicação não pode contar como a peça de verdade */
const semCom = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/g, (m, antes) => antes + m.slice(antes.length).replace(/[^\n]/g, " "));
const src = semCom(bruto);

console.log("== AS TRÊS PEÇAS NASCEM EXPORTADAS ==");
t("Oferta é exportada", /export function Oferta\(/.test(src));
t("Soleira é exportada", /export function Soleira\(/.test(src));
t("Voz é exportada", /export function Voz\(/.test(src));

console.log("\n== NENHUMA INVENTA NÚMERO: leem TIPOS/ALVOS/T da tabela ==");
/* 23/09 · R13 — A ASSERÇÃO ABRIU, E O MOTIVO FICA ESCRITO porque a lei
   da casa o exige. Ela travava a LISTA INTEIRA (`{ TIPOS, SOLEIRA }`,
   byte a byte), e o que ela existe para provar é outra coisa: que o
   `ui.jsx` pede a escala de letra e o teto de ofertas À FOLHA, e não a
   `constantes.js`. R13 trouxe `CINTA` — a geometria da cinta — pela
   mesma porta e pela mesma razão, e a lista fechada reprovou uma linha
   que a obedece. Uma catraca que proíbe a tabela de ganhar a entrada
   seguinte não guarda a lei: guarda o dia em que foi escrita.
   O que se guarda passa a ser o que importa: os dois nomes vêm de
   `estilo.js`, e continuam a NÃO vir de `constantes.js`. */
const importaDaFolha = /import \{([^}]*)\} from "\.\/estilo\.js"/.exec(bruto);
t("ui.jsx importa TIPOS e SOLEIRA de estilo.js",
  !!importaDaFolha && /\bTIPOS\b/.test(importaDaFolha[1]) && /\bSOLEIRA\b/.test(importaDaFolha[1]));
t("e não os vai buscar a constantes.js, que é a outra mesa",
  !/import \{[^}]*\b(?:TIPOS|SOLEIRA)\b[^}]*\} from "\.\/constantes\.js"/.test(bruto));
/* recorte de cada peça, do export até o próximo `export function`/EOF —
   mesma técnica de fatiar por texto que o resto da casa usa quando não
   há módulo para medir */
const recorte = (nome) => {
  const i = src.indexOf(`export function ${nome}(`);
  if (i < 0) return "";
  const prox = src.indexOf("\nexport function ", i + 1);
  return src.slice(i, prox < 0 ? src.length : prox);
};
const rOferta = recorte("Oferta"), rSoleira = recorte("Soleira"), rVoz = recorte("Voz"), rBotao = recorte("Botao");

t("Oferta usa ALVOS.piso (alvo mínimo, não número à mão)", /ALVOS\.piso/.test(rOferta));
t("Oferta usa TIPOS.rotulo para preço/retorno", /TIPOS\.rotulo/.test(rOferta));
t("Oferta usa TIPOS.corpo (o verbo é fala, não máquina)", /TIPOS\.corpo|corpo\b/.test(rOferta));
t("Soleira lê o teto de SOLEIRA (estilo.js), nunca 3/1 à mão", /SOLEIRA\.tetoNaMesa/.test(rSoleira) && /SOLEIRA\.tetoNoTelefone/.test(rSoleira));
t("Voz usa ALVOS.piso no alvo do botão de ouvir", /ALVOS\.piso/.test(rVoz));

console.log("\n== A OFERTA: os três eixos que formas.md fechou ==");
t("Tom tem os três valores (convite · preco · semVolta)", /tom = "convite"/.test(rOferta) && /"semVolta"/.test(rOferta) && /"preco"/.test(rOferta));
t("Tom decide a cor por T.mundo / T.amber / T.danger — nunca um quarto acento", /T\.mundo/.test(rOferta) && /T\.amber/.test(rOferta) && /T\.danger/.test(rOferta));
t("Estado tem impedida e tomada (a gramática de Botao, não uma segunda)", /estado === "impedida"/.test(rOferta) && /estado === "tomada"/.test(rOferta));
t("Estado NÃO inventa um valor 'foco' — foco é :focus-visible, não prop", !/estado === "foco"/.test(rOferta));
t("Chegada tem assentada/agora e decai por turno, não por relógio", /chegada = "assentada"/.test(rOferta) && /chegada === "agora"/.test(rOferta) && !/setTimeout|setInterval/.test(rOferta));
t("a chegada reusa tv-slide (a entrada lateral que já existe) — não inventa animação nova", /tv-slide/.test(rOferta));
t("os três campos obrigatórios existem como props (verbo, preco, retorno) — nenhum em title", /\bverbo\b/.test(rOferta) && /\bpreco\b/.test(rOferta) && /\bretorno\b/.test(rOferta));
t("nenhum deles vai para o atributo title (balão de rato, some no telefone)", !/title=\{(?:verbo|preco|retorno)/.test(rOferta) && !/title=\{`/.test(rOferta));
t("o verbo é uma instância de Botao — composta, não redesenhada", /<Botao\b/.test(rOferta));
t("Consequencia NÃO é duplicada aqui: a peça não existe em código, e a dívida está escrita no comentário", !/<Consequencia\b/.test(rOferta) && /Consequencia.{0,80}NÃO EXISTE/.test(bruto));

console.log("\n== R5c: no telefone o verbo cabe — composição, não corte de campo nem de letra ==");
t("o cartão quebra por flex-wrap puro (CSS), e volta a uma linha só a partir de md — nenhum matchMedia", /flex-wrap/.test(rOferta) && /md:flex-nowrap/.test(rOferta) && !/matchMedia/.test(rOferta));
t("o verbo continua por inteiro no DOM (o corte é só tinta) — a prop nunca é fatiada em código", /\{verbo\}/.test(rOferta) && !/verbo\.slice|verbo\.substring/.test(rOferta));
t("nenhuma letra desce de TIPOS.piso para caber: a peça não escreve um px de fonte à mão", !/fontSize:\s*\d/.test(rOferta));
/* A CONDIÇÃO CRESCEU EM 23/09 (R15) E O MOTIVO FICA ESCRITO: era
   `(preco || retorno)` e passou a `(preco || retorno || temJanela)`,
   porque a janela é o QUARTO campo e viaja nesta mesma linha. O QUE O
   DENTE GUARDA NÃO MUDOU UM MILÍMETRO — que nenhum dos campos vira
   condicional só-de-mesa: continua a ser a MESMA condição para todas as
   larguras, e continua sem um `md:hidden` a esconder informação no
   telefone. *Esconder o preço no aparelho onde ele mais importa é o
   defeito que esta peça nasceu para matar.* */
t("preço, retorno e janela continuam sempre na tela (nenhum vira condicional só-mesa): a mesma condição em toda a largura, sem md:hidden", !/md:hidden/.test(rOferta) && /\(preco \|\| retorno \|\| temJanela\)/.test(rOferta));
/* R15 — A JANELA É GRÁTIS E NÃO DEIXA BURACO: `Janela=Nenhuma` não
   reserva lugar para nada. É a diferença entre um campo opcional e uma
   mobília a mentir, e é medida no texto: o selo só se monta quando há
   contagem. */
t("`Janela=Nenhuma` não deixa buraco — o selo só nasce quando há contagem", /\{temJanela && \(/.test(rOferta));
/* E A JANELA NÃO É UM SEGUNDO SELO: é `O selo de prazo` que já existe,
   com o eixo `Conta`. *Uma ação, uma forma* — desenhar aqui uma
   contagem própria seria a mesma coisa com duas caras. */
t("a janela instancia `O selo de prazo`, não uma contagem própria",
  /<SeloDePrazo\b/.test(rOferta) && /conta=\{j\.conta \|\| "noites"\}/.test(rOferta));
/* `= {}` NO DESTRUCTURING NÃO COBRE `null` — lei escrita no CLAUDE.md, e
   esta peça recebe a prop de um `App.jsx` que monta a janela a partir de
   dois motores diferentes. */
t("e uma janela `null` não derruba a peça (o `= {}` não cobre null)", /janela \|\| \{\}/.test(rOferta));

console.log("\n== R5d: a linha só quebra quando o verbo precisa — sem w-full, sem min-width, sem estado ==");
t("o botão do verbo NÃO força w-full: nenhuma classe de largura própria nele — o flex-wrap do cartão decide sozinho", !/className="w-full md:w-auto"/.test(rOferta) && !/<Botao\b[^>]*w-full/.test(rOferta));
/* V3c (25/09) — ESTA ASSERÇÃO MUDOU, E O MOTIVO FICA ESCRITO. R5d proibia
   qualquer min-width na Oferta porque o defeito era o VERBO: um `w-full`
   que cobrava a linha inteira até de `Esperar`. Isso continua proibido (o
   dente de cima guarda o botão). O que V3c acrescenta é UM piso, e noutro
   item: `quem · onde` — que o `jogo` mediu a 375 com 1 px de largura,
   escrevendo *"a…"*. O piso sai da tabela (`SOLEIRA.quemMinimo`) e só decide
   para onde `quem` desce; medido: nenhuma oferta ganhou fila nem altura. O
   `md:min-w-[var(--janela-na-mesa)]` da janela não conta: vale só na mesa,
   onde a linha não quebra (`md:flex-nowrap`), e serve a coluna do dinheiro. */
t("nenhum min-width no verbo nem estado novo decide a quebra — o único piso é o de quem · onde, e sai da tabela (V3c)", (rOferta.match(/minWidth/g) || []).length === 1 && /minWidth: SOLEIRA\.quemMinimo/.test(rOferta) && !/useState/.test(rOferta));
t("o teto de duas linhas com reticências vem de STYLE inline (garantido), não da classe line-clamp-2 da CDN (que mediu display:flow-root ao vivo)", /WebkitLineClamp:\s*2/.test(rOferta) && /WebkitBoxOrient:\s*"vertical"/.test(rOferta) && /display:\s*"-webkit-box"/.test(rOferta) && !/line-clamp-2/.test(rOferta));
t("o corte é mesmo hermético: overflow hidden junto do -webkit-box (sem os três juntos não há reticência nenhuma)", /overflow:\s*"hidden"/.test(rOferta));

console.log("\n== R5d: o nome acessível do botão não pode depender de COMO os filhos estão organizados ==");
t("Botao aceita ariaLabel (padrão undefined — quem não passa não muda)", /export function Botao\(\{[^}]*ariaLabel[^}]*\}\)/.test(bruto));
t("Botao aplica aria-label no <button> de verdade, não só guarda a prop", /<button[^>]*aria-label=\{ariaLabel\}/.test(rBotao));
t("a Oferta passa o VERBO como nome acessível do botão — o mesmo texto que está na tela, nenhuma prosa própria", /<Botao\b[^>]*ariaLabel=\{verbo\}/.test(rOferta));

console.log("\n== A SOLEIRA: vazia não deixa buraco, e no telefone esvazia (não vira gaveta) ==");
t("lista vazia devolve null (zero altura, zero margem, zero borda)", /if \(lista\.length === 0\) return null;/.test(rSoleira));
t("a régua da mesa e do telefone são duas listas por CSS (hidden md:flex / flex md:hidden), nenhum JS de media query", /hidden md:flex/.test(rSoleira) && /flex md:hidden/.test(rSoleira) && !/matchMedia/.test(rSoleira));
t("o excedente da mesa e do telefone contam por fora, e não viram gaveta escondida", /foraDaMesa/.test(rSoleira) && /foraDoTelefone/.test(rSoleira) && !/details|<dialog/.test(rSoleira));

/* ------------------------------------------------------------
   ESTAS CINCO ASSERÇÕES MUDARAM DE CASA EM 23/09 (R15), E O MOTIVO FICA
   ESCRITO, que é a lei da casa — *ao mover uma asserção, escreva o
   porquê: a intenção tem de sobreviver à mudança.*

   Elas mediam a porta do `+N` DENTRO do recorte de `Soleira`, porque era
   lá que ela vivia: R5a montou-a à mão com peças já fechadas noutro
   lugar, e escreveu por que o fazia — `formas.md` ainda não nomeava esta
   forma, e o `aprendiz` recusou-se a inventá-la. A dívida ficou escrita:
   *"vai reaparecer — abas, inventário, bolsa —, e na segunda vez já não
   é composição, é forma por nomear."*

   R15 nomeou-a: **`A dobra`**. A porta saiu de dentro de `Soleira` e é
   agora uma peça própria, e por isso o recorte mudou — não a intenção.
   **Nenhuma das cinco afrouxou:** cada uma pergunta exactamente o mesmo,
   no sítio onde a resposta passou a viver. O que ficou em `Soleira` é o
   que é DELA e não da peça: quem decide o teto, e que aberta mostra a
   lista inteira.
   ------------------------------------------------------------ */
console.log("\n== R5a → R15: o \"+N\" é PORTA, e a porta agora tem nome — `A dobra` ==");
const rDobra = recorte("Dobra");
t("existe um <button> dentro de Dobra (não só o texto '+N')", /<button\b/.test(rDobra));
t("Soleira instancia `A dobra` em vez de voltar a compor uma porta à mão",
  /<Dobra\b/.test(rSoleira) && !/<button\b/.test(rSoleira));
t("a porta alterna o estado (abre/fecha), não é estática",
  /onClick=\{aoAlternar\}/.test(rDobra) && /setAberto\(\(a\) => !a\)/.test(rSoleira));
t("a porta declara aria-expanded — o estado aberto/fechado não é só visual", /aria-expanded=\{aberta\}/.test(rDobra));
t("a porta lê ALVOS.piso para o alvo (48px), não um px à mão", /minHeight: ALVOS\.piso/.test(rDobra));
t("fechada, a porta diz QUANTAS ofertas ficam atrás dela — e o SUBSTANTIVO, nunca só `+3`",
  /mais \$\{quantos\}/.test(rDobra) && /singular : plural/.test(rDobra));
/* R15 — os dois dentes que a peça nova traz e que a composição não
   tinha: a borda TRACEJADA (é a única porta da soleira que não abre
   para o mundo mas para a lista, e o tracejado di-lo sem uma palavra) e
   zero acento (dar-lhe cor viva seria pô-la a competir com as ofertas
   que ela esconde). */
t("a borda é tracejada — a porta da LISTA não se veste de porta do MUNDO",
  /border: `1px dashed \$\{T\.lineStrong\}`/.test(rDobra));
t("e não gasta acento nenhum: nem amber, nem violet, nem mundo, nem danger",
  !/T\.(amber|violet|mundo|danger|ok)\b/.test(rDobra));
t("aberta, a lista mostra o TOTAL (lista inteira), não só o teto — 'nada fica inalcançável'", /aberto \? lista : lista\.slice/.test(rSoleira));
t("nem <details> nem <dialog>: a porta é o mesmo <button> que o resto da casa usa, não uma segunda maneira de abrir algo", !/<details|<dialog/.test(rSoleira));
t("o estado 'aberto' nasce useState (React), fora de qualquer componente aninhado — Soleira já é o componente de topo", /React\.useState\(false\)/.test(rSoleira));

console.log("\n== R5a: o teto sai da tabela, com o número novo (2 na mesa, 1 no telefone) ==");
const estiloSrc = readFileSync("../src/estilo.js", "utf8");
t("SOLEIRA.tetoNaMesa é 2 na tabela (não 3 — R5a baixou o teto)", /tetoNaMesa:\s*2\b/.test(estiloSrc));
t("SOLEIRA.tetoNoTelefone continua 1 na tabela", /tetoNoTelefone:\s*1\b/.test(estiloSrc));
t("Soleira (ui.jsx) não escreve 2 nem 1 à mão — só lê SOLEIRA.tetoNaMesa/tetoNoTelefone", !/slice\(0,\s*2\)/.test(rSoleira) && !/slice\(0,\s*1\)/.test(rSoleira));

console.log("\n== A VOZ: os dois eixos, e o glifo de ouvir não é fixo aqui ==");
t("Quem tem os três valores que App.jsx de fato escreve (mestre · voce · mundo)", /quem = "mestre"/.test(rVoz) && /\bvoce:/.test(rVoz) && /\bmundo:/.test(rVoz));
t("Voz (o eixo) tem lendo/preparando, e muda não escreve nada extra", /lendo:/.test(rVoz) && /preparando:/.test(rVoz));
t("o glifo de ouvir chega por prop (glifoDeOuvir), não fixo — os 81 emoji são etapa própria", /glifoDeOuvir/.test(rVoz) && !/🔊/.test(rVoz));
t("o botão de ouvir cresce ao piso sem crescer a tinta: sem background nem borda visíveis", /width: ALVOS\.piso, height: ALVOS\.piso/.test(rVoz) && /background: "transparent", border: "none"/.test(rVoz));

console.log("\n== O BOTÃO GANHA A VARIANTE corpo (R2), SEM MUDAR O PADRÃO ==");
t("Botao aceita corpo, com padrão false — quem já chama Botao não muda", /corpo = false/.test(rBotao));
t("com corpo, usa tv-body (Spectral) em vez de tv-mono — nunca as duas juntas na mesma classe", /corpo \? "tv-body/.test(rBotao));
t("o tamanho de corpo sai de TIPOS.corpo, nunca de um px à mão", /corpo \? TIPOS\.corpo : undefined/.test(rBotao));

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
