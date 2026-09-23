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
t("preço e retorno continuam sempre na tela (não viram condicional só-mesa): a mesma condição de sempre, sem md:hidden neles", !/md:hidden/.test(rOferta) && /\(preco \|\| retorno\)/.test(rOferta));

console.log("\n== R5d: a linha só quebra quando o verbo precisa — sem w-full, sem min-width, sem estado ==");
t("o botão do verbo NÃO força w-full: nenhuma classe de largura própria nele — o flex-wrap do cartão decide sozinho", !/className="w-full md:w-auto"/.test(rOferta) && !/<Botao\b[^>]*w-full/.test(rOferta));
t("nenhum min-width nem estado novo foi inventado para decidir a quebra — é o tamanho natural do conteúdo (regra de sempre do flex-wrap)", !/minWidth/.test(rOferta) && !/useState/.test(rOferta));
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

console.log("\n== R5a: o \"+N\" é PORTA — um <button> de verdade, não um <div> de texto ==");
t("existe um <button> dentro de Soleira (não só o texto '+N')", /<button\b/.test(rSoleira));
t("a porta tem onClick que alterna o estado (abre/fecha), não é estática", /onClick=\{?\(?\)? *=> *setAberto/.test(rSoleira));
t("a porta declara aria-expanded — o estado aberto/fechado não é só visual", /aria-expanded=\{aberto\}/.test(rSoleira));
t("a porta lê ALVOS.piso para o alvo (48px), não um px à mão", /minHeight: ALVOS\.piso/.test(rSoleira));
t("fechada, a porta ainda diz QUANTAS ofertas ficam atrás dela", /\+\$\{n\}.*oferta/.test(rSoleira));
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
