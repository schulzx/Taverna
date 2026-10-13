/* AS FICHAS E O CARTÃO (Fase F2 · F2b · F2c) — a tabela e o painel que os desenha

   Esta suíte não monta React: `painel-fichas.jsx` é tela, e tela se olha
   (`CLAUDE.md`). O que se prova aqui é o que a tela LÊ — a tabela `FICHAS`
   (`estilo.js`), a folha que a anima e esbate, as duas variantes novas do
   `VerboComPreco` (`ui.jsx`) — e o texto do painel nos pontos onde um
   descuido mentiria calado: uma cor nova solta, um nome de mecanismo na
   tela, uma animação sem saída, um componente nascido dentro do render, um
   toque que age em vez de escrever. A forma está em `mente/formas.md`
   § Fichas; as medidas vivas (1280×912, 800×451, 467×860) foram tomadas
   numa página de prova no navegador, e estão escritas na secção 9.
*/
import { readFileSync } from "node:fs";

const RAIZ = "../src/";
const { T, ALVOS, FICHAS, FOGUEIRA, PE_DA_PAGINA, VERBO_COM_PRECO, MOVIMENTO_CSS, SUPERFICIES_CSS, CINTA } = await import(RAIZ + "estilo.js");
/* As quebras de linha normalizam-se: um checkout com CRLF (o git archive no
   Windows) não pode ficar vermelho por uma régua que mede o fim de linha. */
const PAINEL = readFileSync(new URL(RAIZ + "painel-fichas.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const UI = readFileSync(new URL(RAIZ + "ui.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o contraste da norma (WCAG 2.1, 1.4.3 e 1.4.11) */
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/* o texto sem comentários — o contrato no topo do painel cita, de propósito,
   as palavras que a tela nunca diz */
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const CODIGO = semComentarios(PAINEL);
const CONTRATO = PAINEL.slice(0, PAINEL.indexOf("import React"));

sec("1. A tabela: o que é igual a T é T, e NENHUMA cor nova (§4)");
{
  t("fundo = T.panelSoft", FICHAS.fundo === T.panelSoft);
  t("fio = T.lineStrong", FICHAS.fio === T.lineStrong);
  t("escrita = T.rosa (a tua mão)", FICHAS.escrita === T.rosa);
  t("preço = T.amberSoft", FICHAS.preco === T.amberSoft);
  t("hostil = T.danger", FICHAS.hostil === T.danger);
  t("marcaFundo = T.panel", FICHAS.marcaFundo === T.panel);
  t("cartao.fundo = T.panel", FICHAS.cartao.fundo === T.panel);
  const cores = new Set(Object.values(T));
  const soltas = [FICHAS.fundo, FICHAS.fio, FICHAS.escrita, FICHAS.preco, FICHAS.hostil, FICHAS.marcaFundo, FICHAS.cartao.fundo].filter((c) => !cores.has(c));
  t("toda cor de FICHAS é uma cor de T", soltas.length === 0, soltas.join(", "));
  /* a escrita é a mesma mão da fogueira: uma ação, uma forma */
  t("a mão é a mesma da fogueira (FOGUEIRA.escolhido)", FICHAS.escrita === FOGUEIRA.escolhido);
}

sec("2. Os números de §4 e dos nós");
{
  t("altura = ALVOS.piso (48)", FICHAS.altura === ALVOS.piso && FICHAS.altura === 48);
  t("marca 32 · raio 12 · larguraMax 240 · max 4 · vão 8",
    FICHAS.marca === 32 && FICHAS.raio === 12 && FICHAS.larguraMax === 240 && FICHAS.max === 4 && FICHAS.vao === 8);
  t("cartão: 376 · marca 64 · raio 12 · folha até 62 % · coluna dos verbos 320",
    FICHAS.cartao.largura === 376 && FICHAS.cartao.marca === 64 && FICHAS.cartao.raio === 12 && FICHAS.cartao.folhaMax === 0.62 && FICHAS.cartao.colunaVerbos === 320);
  t("o pé é o de PE_DA_PAGINA (6 / 4), por alias", FICHAS.pe.cima === PE_DA_PAGINA.cima && FICHAS.pe.baixo === PE_DA_PAGINA.baixo);
  t("baixaAltura = 560", FICHAS.baixaAltura === 560);
  /* nó 210:50 (Repouso 170) e 210:66 (Escrita 190): a armada é 20 mais larga
     — o ⌄ (16) e o vão (10) entram, e a direita desce de 14 para 8 */
  const F = FICHAS.ficha;
  t("a armada é 20 mais larga que a Repouso, como no nó", (F.mais + F.entre + F.direitaArmada) - F.direita === 20);
  t("o × do cartão é alvo (48)", FICHAS.cartao.cabeca.fechar >= ALVOS.piso);
  t("arrastar a folha fecha a partir de um alvo", FICHAS.cartao.folha.arrasto === ALVOS.piso);
}

sec("3. O contraste que o desenho mediu (§6)");
{
  const casos = [
    ["nome ink / ficha", T.ink, FICHAS.fundo, 4.5],
    ["papel inkMeio / ficha", T.inkMeio, FICHAS.fundo, 4.5],
    ["preço amberSoft / ficha", FICHAS.preco, FICHAS.fundo, 4.5],
    ["hostis danger / ficha", FICHAS.hostil, FICHAS.fundo, 4.5],
    ["ink / cartão", T.ink, FICHAS.cartao.fundo, 4.5],
    ["inkMeio / cartão (o quem, o segredo)", T.inkMeio, FICHAS.cartao.fundo, 4.5],
    ["inkDim / cartão (os rótulos, o ×)", T.inkDim, FICHAS.cartao.fundo, 4.5],
    ["danger / cartão (a cabeça do hostil)", FICHAS.hostil, FICHAS.cartao.fundo, 4.5],
    ["danger / pagina (o preço sem volta)", T.danger, T.pagina, 4.5],
    ["inkDim / pagina (o preço do verbo)", T.inkDim, T.pagina, 4.5],
    ["contorno lineStrong / pagina (gráfico)", FICHAS.fio, T.pagina, 3],
    ["a mão rosa / pagina (gráfico)", FICHAS.escrita, T.pagina, 3],
    ["tracejado lineStrong / cartão (o impedido, gráfico)", T.lineStrong, FICHAS.cartao.fundo, 3],
    ["a pata inkMeio / o disco (gráfico)", T.inkMeio, FICHAS.marcaFundo, 3],
  ];
  for (const [nome, a, b, piso] of casos) {
    const c = contraste(a, b);
    t(`${nome}: ${c.toFixed(2)} ≥ ${piso}`, c >= piso);
  }
}

sec("4. O sistema não fala de si (§8) e a cor não nasce solta");
{
  /* as palavras que podem chegar à tela: as de PALAVRAS e os aria-label
     literais. (Os nomes de classe — `tv-ficha-entra` — não são tela.) */
  const bloco = (CODIGO.match(/const PALAVRAS = \{([\s\S]*?)\};/) || [])[1] || "";
  const tela = [...bloco.matchAll(/"([^"\n]*)"/g)].map((m) => m[1]);
  /* 12/10 (`aprendiz`): de quatro para cinco — a linha só da Baixa com oferta (§1)
     leva a região das ofertas com a MESMA etiqueta da `Soleira` (ui.jsx). O que se
     guarda não mudou: a lista é curta, fechada, e passa pela peneira das proibidas. */
  t("PALAVRAS tem as cinco da tela", tela.length === 5, tela.join(" | "));
  const PROIBIDAS = ["ficha", "fichas", "id", "em cena", "lista", "hostil", "segredo", "desconhecido", "papel", "mecanismo"];
  const achadas = tela.filter((l) => PROIBIDAS.some((p) => new RegExp("(^|[^\\p{L}])" + p + "($|[^\\p{L}])", "iu").test(l)));
  t("nenhuma palavra de mecanismo no que a tela diz", achadas.length === 0, achadas.join(" | "));
  const ariaLiterais = [...CODIGO.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]);
  t("nenhum aria-label literal solto (vêm de PALAVRAS ou do nome)", ariaLiterais.length === 0, ariaLiterais.join(" | "));
  t("«À vista» é o nome do grupo, não letra na tela", /role="group" aria-label=\{PALAVRAS\.aVista\}/.test(CODIGO));
  t("nenhuma cor literal no painel (tudo de T ou FICHAS)", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(CODIGO), (CODIGO.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) || []).join(", "));
  t("o painel lê FICHAS de estilo.js", /import \{[^}]*\bFICHAS\b[^}]*\} from "\.\/estilo\.js"/.test(PAINEL));
}

sec("5. Componentes fora do render (o foco) e o contrato no topo");
{
  /* todo componente (nome com Maiúscula seguida de minúscula) nasce na
     coluna 0 — um `function X` indentado é um componente dentro de outro */
  const dentro = [...CODIGO.matchAll(/^[ \t]+(?:function ([A-Z][a-z]\w*)|const ([A-Z][a-z]\w*) = (?:\(|React\.|function))/gm)].map((m) => m[1] || m[2]);
  t("nenhum componente declarado dentro de outro", dentro.length === 0, dentro.join(", "));
  for (const nome of ["FileiraAVista", "CartaoDaFicha", "VereditoDaFicha", "MarcaDaFicha"]) {
    t(`${nome} é exportado`, new RegExp("^export function " + nome + "\\(", "m").test(PAINEL));
  }
  t("Ficha é exportada (com ref, para o roving tabindex)", /^export const Ficha = React\.forwardRef\(function Ficha\(/m.test(PAINEL));
  for (const prop of ["itens", "escrita", "aberta", "onToque", "onAbrir", "onFechar", "onVerbo", "baixa", "veredito"]) {
    t(`o contrato no topo diz \`${prop}\`, e o painel recebe-o`, CONTRATO.includes(prop) && new RegExp("\\b" + prop + "\\b").test(CODIGO));
  }
  for (const campo of ["id", "tipo", "nome", "linha", "retrato", "frase", "sabe", "lembra", "pista", "verbos", "preco", "tom", "impedido"]) {
    t(`o contrato descreve o campo \`${campo}\``, new RegExp("\\b" + campo + "\\b").test(CONTRATO));
  }
  t("`= []` não cobre null: a lista passa por Array.isArray", /Array\.isArray\(itens\) \? itens : \[\]/.test(CODIGO));
  t("o teto da fileira é FICHAS.max", /\.slice\(0, FICHAS\.max\)/.test(CODIGO));
}

sec("6. O gesto (§2): toque escreve, segundo toque abre, terceiro fecha — e nada age");
{
  const tocar = (CODIGO.match(/const tocar = \(f\) => \{([\s\S]*?)\n  \};/) || [])[1] || "";
  t("na ficha aberta, o toque fecha", /f\.id === aberta\) return chamar\(onFechar\)/.test(tocar));
  t("na ficha escrita, o toque abre", /f\.id === escrita\) return chamar\(onAbrir, f\)/.test(tocar));
  t("noutra, fecha o cartão aberto antes e escreve", /aberta != null\) chamar\(onFechar\);\s*return chamar\(onToque, f\)/.test(tocar));
  t("a ordem é essa: aberta, escrita, o resto", tocar.indexOf("aberta)") < tocar.indexOf("escrita)") && tocar.indexOf("escrita)") < tocar.indexOf("onToque"));
  t("a ficha é <button> com o anel da casa", /<button ref=\{ref\}[\s\S]{0,400}tv-anel-foco/.test(CODIGO));
  t("a ficha diz que abre um diálogo, e se está aberto", /aria-haspopup="dialog" aria-expanded=\{estado === "aberta"\}/.test(CODIGO));
  t("o nome acessível é o nome e a linha, com a moeda falada", /const rotulo = \[ficha\.nome, falado\(ficha\.linha\)\]/.test(CODIGO) && /\$1 moedas/.test(CODIGO));
  t("o cartão é diálogo NÃO-modal com o nome no aria-labelledby", /role="dialog" aria-labelledby=\{nome\}/.test(CODIGO) && !/aria-modal="true"/.test(CODIGO));
  t("ao abrir, o foco entra no cartão", /caixa\.current\.focus\(/.test(CODIGO));
  t("Esc fecha e devolve o foco à ficha", /e\.key === "Escape"[\s\S]{0,400}chamar\(a\.onFechar\);\s*if \(dentro\) focar\(a\.fichaAberta\.id\)/.test(CODIGO));
  t("o toque fora fecha (e o cartão no portal conta como dentro)", /aoTocarFora[\s\S]{0,400}!a\.raiz\.contains\(e\.target\) && !\(cartao && cartao\.contains\(e\.target\)\)/.test(CODIGO));
  t("os atalhos 1–3 escrevem o verbo da posição, nunca o impedido", /\^\[1-3\]\$/.test(CODIGO) && /if \(!v \|\| v\.impedido\) return;/.test(CODIGO));
  t("os atalhos nunca roubam a tecla do campo", /deEscrever\(e\.target\) \|\| !\/\^\[1-3\]\$\/\.test\(e\.key\)/.test(CODIGO));
  t("as setas andam a fileira (roving tabindex)", /ArrowRight: i \+ 1, ArrowLeft: i - 1, Home: 0, End: lista\.length - 1/.test(CODIGO) && /tabIndex=\{!velha && f\.id === idParado \? 0 : -1\}/.test(CODIGO));
  t("os handlers não podem custar o turno (try/catch)", /const aoTeclar = \(e\) => \{\s*try \{/.test(CODIGO) && /const aoTocarFora = \(e\) => \{\s*try \{/.test(CODIGO) && /const chamar = [^\n]*try \{/.test(CODIGO));
  /* NADA NO CARTÃO AGE (§5): o painel não escreve no campo, não debita, não
     manda — só chama o App */
  t("o painel não escreve no campo nem manda o turno", !/\.value\s*=|enviar\(|localStorage/.test(CODIGO));
}

sec("7. Os três formatos do cartão (§5)");
{
  t("o formato: baixa → Baixa; ≥ 768 → Mesa; senão o telefone", /const formato = baixa \? "baixa" : mesa \? "mesa" : "telefone";/.test(CODIGO) && /useMesa\(\)/.test(CODIGO));
  t("o corte da Mesa é o da casa (768, CINTA.mesa)", CINTA.mesa === "(min-width: 768px)");
  const pos = (CODIGO.match(/function posicaoDoCartao[\s\S]*?\n\}/) || [""])[0];
  t("a Mesa: 376, 8 acima da fileira, presa à borda", /Math\.min\(C\.largura, R\.width\)/.test(pos) && /bottom: R\.height \+ FICHAS\.vao/.test(pos) && /Math\.min\(F\.left - R\.left, R\.width - largura\)/.test(pos));
  t("a Baixa toma a página marcada com data-tv-pagina", /closest\("\[data-tv-pagina\]"\)/.test(pos) && /left: P\.left - R\.left, top: P\.top - R\.top, width: P\.width, height: P\.height/.test(pos));
  t("o telefone: a folha fixa, largura inteira, até folhaMax, com o fundo no pé (nunca cobre o campo)", /position: "fixed", left: 0, width: vw, bottom: vh - fundo/.test(pos) && /C\.folhaMax \* vh/.test(pos) && /const fundo = R\.bottom \+ FICHAS\.pe\.baixo/.test(pos));
  t("a folha vai num portal (o cartão da página corta)", /createPortal\(cartao, document\.body\)/.test(CODIGO));
  t("a folha tem raio 16 só em cima, e a pega", /C\.folha\.raio\}px \$\{C\.folha\.raio\}px 0 0/.test(CODIGO) && /function Pega\(/.test(CODIGO));
  t("a Baixa: duas colunas, os verbos ao fundo na de 320", /width: C\.colunaVerbos/.test(CODIGO) && /justify-end/.test(CODIGO));
  t("os verbos ficam fixos; o que se sabe é que rola", /overflow-y-auto/.test(CODIGO) && /<div className="flex flex-col shrink-0" style=\{\{ gap: FICHAS\.cartao\.entreVerbos/.test(CODIGO));
  t("a posição mede-se no quadro seguinte quando a janela muda", /requestAnimationFrame\(calcular\)/.test(CODIGO));
}

sec("8. O movimento (§7) e o esbatimento: tudo da tabela, e tudo com saída");
{
  const M = FICHAS.movimento;
  t("entra 160, escalonado 40, teto 280, sai 120, cartão 160 + 4 de subida",
    M.entra === 160 && M.escalonado === 40 && M.tetoDoEscalonado === 280 && M.sai === 120 && M.cartao === 160 && M.subida === 4);
  t("a fileira de quatro cabe no teto (3 × 40 + 160 ≤ 280)", (FICHAS.max - 1) * M.escalonado + M.entra <= M.tetoDoEscalonado);
  const iMedia = MOVIMENTO_CSS.lastIndexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, iMedia), depois = MOVIMENTO_CSS.slice(iMedia);
  for (const c of ["tv-ficha-entra", "tv-ficha-sai", "tv-cartao-entra"]) {
    t(`.${c} anima, e tem saída no reduced-motion`, antes.includes("." + c + " {") && depois.includes("." + c));
    t(`o painel usa .${c}`, CODIGO.includes(c));
  }
  t("as durações na folha são as da tabela", antes.includes(`tvFichaEntra ${M.entra}ms`) && antes.includes(`tvFichaSai ${M.sai}ms`) && antes.includes(`tvCartaoEntra ${M.cartao}ms`) && antes.includes(`translateY(${M.subida}px)`));
  t("com reduced-motion a troca é seca (sem esperar os 120)", /reduzMovimento\(\)\) return;/.test(CODIGO));
  for (const c of ["tv-esbate-fim", "tv-esbate-baixo"]) {
    t(`.${c} existe, com a rampa da casa, e sai em alto contraste`, SUPERFICIES_CSS.includes("." + c + " {") && /forced-colors[\s\S]*tv-esbate-fim, \.tv-esbate-baixo/.test(SUPERFICIES_CSS));
    t(`o painel põe .${c} só quando há mais para ver`, new RegExp("haMais \\? \"" + c + "\" : \"\"").test(CODIGO));
  }
}

sec("9. As medidas vivas, contra o Figma (página de prova, 12/10)");
{
  /* MEDIDAS DO NAVEGADOR, escritas aqui porque Node não mede letra (página
     temporária de prova com os dados das telas do Figma, sem save):
     · 1280×912 — as fichas 126 · 164 · 189 (Aberta) · 178 de largo (nós
       127 · 164 · 190 · 178), todas 48 de alto; o cartão de Oren 376 × 490
       (nó `214:816`: 376 × 488), alinhado à esquerda da ficha, o fundo 8
       acima dela; o × 48, os verbos 55;
     · 800×451 — o cartão = a página (712 de largo), as colunas 342 e 320 a
       17 e 375 da borda (nó `216:1838`: as mesmas), os verbos no fundo, o
       campo e o veredito à vista;
     · 467×860 — a folha de 0 a 467, 502 de alto (≤ 0,62 × 860 = 533; nó
       `217:1739`: 499), a cabeça a 30 do topo (nó: 29 + o fio), o fundo no
       pé da página — 19 acima do veredito, 43 acima do campo. */
  const MEDIDO = { fichas: [126, 164, 189, 178], figma: [127, 164, 190, 178], cartao: [376, 490], figmaCartao: [376, 488], folha: 502, telefone: 860 };
  t("as fichas medem o nó a ±1 px", MEDIDO.fichas.every((w, i) => Math.abs(w - MEDIDO.figma[i]) <= 1));
  t("nenhuma ficha passa de larguraMax", MEDIDO.fichas.every((w) => w <= FICHAS.larguraMax));
  t("o cartão da Mesa mede o nó (376 de largo, ±2 de alto)", MEDIDO.cartao[0] === FICHAS.cartao.largura && Math.abs(MEDIDO.cartao[1] - MEDIDO.figmaCartao[1]) <= 2);
  t("a folha não passa de folhaMax", MEDIDO.folha <= FICHAS.cartao.folhaMax * MEDIDO.telefone);
}

sec("10. O verbo com preço ganha Impedido e Sem volta (F2c, ui.jsx)");
{
  const V = (UI.match(/export function VerboComPreco\([\s\S]*?\n\}/) || [""])[0];
  t("VerboComPreco recebe `impedido` e o papel semVolta", /impedido = null/.test(V) && /papel === "semVolta"/.test(V));
  t("o impedido é focável e com nome: aria-disabled, nunca disabled", /aria-disabled=\{impedido \? "true" : undefined\}/.test(V) && !/(?<![-\w])disabled=\{/.test(V));
  t("o impedido não toca, e o atalho cala", /onClick=\{impedido \? undefined : aoTocar\}/.test(V) && /atalho && !impedido/.test(V) && /const tecla = impedido \? undefined/.test(V));
  t("o impedido é oco e tracejado", /background: impedido \? "transparent"/.test(V) && /impedido \? "dashed" : "solid"/.test(V));
  t("a razão vem DEPOIS do preço", /const linhaDoVerbo = \(preco, impedido\) => \(impedido \? \[preco, typeof impedido === "string" \? impedido : ""\]\.filter\(Boolean\)\.join\(" · "\)/.test(UI) && /const linha = linhaDoVerbo\(preco, impedido\);/.test(V));
  t("o nome acessível do verbo diz «moedas» no lugar do ◉", /aria-label=\{nomeDoVerbo\(verbo, linha\)\}/.test(V) && /const nomeDoVerbo = [^\n]*\$1 moedas/.test(UI));
  t("o sem volta: contorno danger de 1,5 e a barra de 3", VERBO_COM_PRECO.fioSemVolta === 1.5 && VERBO_COM_PRECO.barraSemVolta === 3 && /width: V\.barraSemVolta, background: T\.danger/.test(V));
  t("o preço passa pela moeda da casa (sem ◉, a peça é a de ontem)", /<TextoComMoeda texto=\{linha\} \/>/.test(V));
  t("a altura continua ALVOS.piso", /minHeight: ALVOS\.piso/.test(V));
  t("o cartão usa o VerboComPreco de ui.jsx (uma ação, uma forma)", /import \{[^}]*\bVerboComPreco\b[^}]*\} from "\.\/ui\.jsx"/.test(PAINEL) && /<VerboComPreco /.test(CODIGO));
  t("o veredito é a LinhaDoVeredito da casa, armada", /<LinhaDoVeredito armado texto=\{<TextoComMoeda texto=\{texto\} \/>\} \/>/.test(CODIGO));
}

sec("11. Os acertos de 12/10 (aprendiz): a fera pintada, a linha só da Baixa, o nome que se encadeia");
{
  /* a fera com pintura mostra o recorte de cartão; a pata fica para quem não tem */
  const { retratoDe } = await import(RAIZ + "retratos.js");
  t("a tabela acha o lobo pelo nome da ficha (com artigo, minúscula)", !!retratoDe({ nome: "O lobo" }, null) && !!retratoDe({ nome: "Lobo atroz" }, null));
  t("e não acha o que não tem pintura (a pata fica)", retratoDe({ nome: "Três lobos" }, null) === null && retratoDe({ nome: "Corvo" }, null) === null);
  const marca = (CODIGO.match(/export function MarcaDaFicha\([\s\S]*?\n\}/) || [""])[0];
  t("a marca pergunta pela pintura ANTES da pata", marca.indexOf("feraPintada(ficha)") > -1 && marca.indexOf("feraPintada(ficha)") < marca.indexOf("DESENHO.pata"));
  t("a fera pintada vai no Retrato, recorte de cartão, com o anel do papel", /<Retrato semente=\{fera\.nome\} ente=\{fera\} semCarta tamanho=\{lado\} recorte="cartao" anel=\{hostil \? FICHAS\.hostil : T\.inkDim\} \/>/.test(marca));
  t("a hostil pintada leva a presa, como a de pata", /if \(fera\) \{[\s\S]*?hostil \? <Presa lado=\{grande\} \/> : null/.test(marca));
  t("a pergunta à tabela não custa a ficha (try)", /function feraPintada\(f\) \{[\s\S]*?try \{[\s\S]*?retratoDe\(ente, null\)[\s\S]*?catch/.test(CODIGO));

  /* a Baixa com oferta: numa linha só, a oferta primeiro (§1) */
  const fileira = (CODIGO.match(/export function FileiraAVista\([\s\S]*?\n\}/) || [""])[0];
  t("a fileira recebe `ofertas`", /ofertas = null \}\) \{/.test(fileira));
  t("com ofertas, a região delas vem ANTES do grupo das fichas, na mesma fila", /role="region" aria-label=\{PALAVRAS\.oferta\}[\s\S]*?role="group" aria-label=\{PALAVRAS\.aVista\}/.test(fileira));
  t("a fila que rola é uma só, com o esbatimento", (fileira.match(/overflow-x-auto/g) || []).length === 1 && /tv-esbate-fim/.test(fileira));
  t("sem ofertas, a fila É o grupo «À vista», como antes", /role=\{linhaSo \? undefined : "group"\} aria-label=\{linhaSo \? undefined : PALAVRAS\.aVista\}/.test(fileira));
  t("a etiqueta é a mesma da Soleira", /aria-label="O que o mundo oferece agora"/.test(UI) && /oferta: "O que o mundo oferece agora"/.test(PAINEL));
  t("o contrato diz ao App como ligar (e não desenhar a Soleira)", /ofertas  = \[<Oferta …\/>\] \| null/.test(CONTRATO) && /NÃO desenha a `<Soleira>`/.test(CONTRATO));

  /* o nome no cursor: o segundo nome tocado a seguir a outro junta-se por
     « e », e o terceiro faz do « e » uma vírgula. A função é pura: sai do
     painel e corre aqui. */
  const fonteJ = (PAINEL.match(/export function juntarNomeNoCampo[\s\S]*?\n\}\n/) || [""])[0];
  const juntarNomeNoCampo = new Function(fonteJ.replace("export ", "") + "\nreturn juntarNomeNoCampo;")();
  let r = juntarNomeNoCampo("Procuro", null, "Freya", []);
  t("o primeiro nome entra por espaço", r.texto === "Procuro Freya" && r.cursor === 13);
  r = juntarNomeNoCampo(r.texto, null, "Ondine", ["Freya"]);
  t("o segundo, a seguir ao primeiro, por « e »", r.texto === "Procuro Freya e Ondine");
  r = juntarNomeNoCampo(r.texto, null, "Isen o Silencioso", ["Freya", "Ondine"]);
  t("o terceiro: «Procuro Freya, Ondine e Isen o Silencioso» (era «Freya Ondine Isen»)", r.texto === "Procuro Freya, Ondine e Isen o Silencioso");
  t("o nome depois de um verbo entra seco: «ataco o rato e grito para Oren»", juntarNomeNoCampo("ataco o rato e grito para ", null, "Oren", ["o rato"]).texto === "ataco o rato e grito para Oren");
  t("no meio da frase, o resto não perde o espaço", juntarNomeNoCampo("Falo com Freya agora", 14, "Ondine", ["Freya"]).texto === "Falo com Freya e Ondine agora");
  t("o cursor fica logo depois do nome posto", juntarNomeNoCampo("Falo com Freya agora", 14, "Ondine", ["Freya"]).cursor === 23);
  t("lixo não estoura: null, cursor fora, nome vazio", juntarNomeNoCampo(null, 99, "Ana", null).texto === "Ana" && juntarNomeNoCampo("x", null, "", []).texto === "x");
  t("a função não lê nada de fora (a suíte corre-a sozinha)", !!fonteJ && !/\b(T|FICHAS|React|PALAVRAS)\b/.test(fonteJ.replace(/\/\*[\s\S]*?\*\//g, "")));
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
