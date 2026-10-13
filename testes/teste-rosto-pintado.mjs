/* O ROSTO PINTADO (Retratos §11–13 de `mente/formas.md`, 12/10)

   Até 12/10 todo rosto do jogo era a xilogravura da semente. A mesa pintou no
   Figma 18 feras e 164 heróis; a tabela de quem recebe qual pintura é do motor
   (`src/retratos.js`, provada em `teste-retratos.mjs`). Esta suíte prova o lado
   da TELA e dos ARQUIVOS — o que nenhuma das duas metades vê sozinha:

     1. todo arquivo que a tabela promete EXISTE em `public/retratos/`, é WebP
        320 × 320 (o contrato de §12) e cabe no peso medido de §6;
     2. o arquivo foi cortado com o MESMO `cx` que a tabela tem hoje. O canto
        do recorte da ficha sai de `cx`: se a tabela mudar um número sem que os
        arquivos se cortem de novo, o chip sai torto — e isto fica vermelho
        com o nome de quem mudou (`mente/figma/corte/cortados.json` guarda o
        `cx` de cada corte; a ferramenta escreve-o);
     3. em todos os tamanhos em que o jogo desenha um rosto, a imagem COBRE o
        disco (nunca uma lua de fundo à mostra), também no recorte forçado;
     4. o `rosto.jsx` nos pontos onde um descuido mentiria calado: a pintura
        antes do sinal e da xilogravura, o hook antes de qualquer `return`, a
        conta dentro de `try`, a imagem que falha a voltar ao rosto de hoje, o
        componente fora do render, a vinheta do ferido de tabela.

   FALHA ANTES: `public/retratos/` não existe, `rosto.jsx` não importa
   `retratos.js`, e `RETRATO_PINTADO` não está em estilo.js.
*/
import { readFileSync, existsSync, statSync } from "node:fs";

const RAIZ = new URL("../", import.meta.url);
const { RETRATOS, RETRATO, recorteDoRetrato, tamanhoDoRetrato } = await import("../src/retratos.js");
const { T, RETRATO_PINTADO } = await import("../src/estilo.js");
const { estadoDe } = await import("../src/semente.js");
const ROSTO = readFileSync(new URL("src/rosto.jsx", RAIZ), "utf8");
const UI = readFileSync(new URL("src/ui.jsx", RAIZ), "utf8");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const CODIGO = semComentarios(ROSTO);

/* o lado de um WebP, lido do cabeçalho (RIFF · WEBP · VP8 / VP8L / VP8X) */
function ladoDoWebp(b) {
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const tipo = b.toString("ascii", 12, 16);
  if (tipo === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (tipo === "VP8L") { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
  if (tipo === "VP8X") return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  return null;
}

sec("1. Os arquivos: cada promessa da tabela é um WebP 320 × 320 em public/");
const faltam = [], tortos = [], pesados = [];
let total = 0;
for (const r of RETRATOS) {
  const caminho = new URL("public" + r.arquivo, RAIZ);
  if (!existsSync(caminho)) { faltam.push(r.arquivo); continue; }
  const b = readFileSync(caminho);
  total += b.length;
  const lado = ladoDoWebp(b);
  if (!lado || lado[0] !== 320 || lado[1] !== 320) tortos.push(r.arquivo + " " + JSON.stringify(lado));
  /* §6 mediu 6,3–10,8 KB por ficha a q 0,75; o corte de 12/10 deu 5,0–13,4. O teto
     de 16 KB pega um arquivo cortado noutra qualidade ou noutro tamanho */
  if (b.length > 16 * 1024) pesados.push(r.arquivo + " " + Math.round(b.length / 1024) + " KB");
}
t(`os ${RETRATOS.length} arquivos da tabela existem`, faltam.length === 0, faltam.slice(0, 5).join(", "));
t("todos são WebP de 320 × 320 (§12)", tortos.length === 0, tortos.slice(0, 5).join(", "));
t("nenhum passa de 16 KB", pesados.length === 0, pesados.join(", "));
t(`o todo cabe em 2 MB (hoje ${Math.round(total / 1024)} KB, ${(total / RETRATOS.length / 1024).toFixed(1)} KB em média)`, total > 0 && total <= 2 * 1024 * 1024);
t("são as 18 feras e os 164 heróis", RETRATOS.filter((r) => r.chave.startsWith("especie:")).length === 18 && RETRATOS.filter((r) => r.chave.startsWith("gente:")).length === 164);
t("os nomes são os do contrato (minúsculas, sem acento, hífen)", RETRATOS.every((r) => /^\/retratos\/(especie|gente)\/[a-z0-9-]+\.webp$/.test(r.arquivo)));

sec("2. O corte e a tabela concordam no canto (cx)");
{
  const p = new URL("mente/figma/corte/cortados.json", RAIZ);
  const cortados = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
  const diferem = [];
  for (const r of RETRATOS) {
    const m = r.arquivo.match(/\/retratos\/(especie|gente)\/([a-z0-9-]+)\.webp$/);
    const k = m && m[1] + "/" + m[2];
    if (!k || cortados[k] !== r.cx) diferem.push(`${k}: tabela ${r.cx}, corte ${cortados[k]}`);
  }
  t("cada arquivo foi cortado com o cx que a tabela tem — se não, corte de novo (mente/figma/corte)", diferem.length === 0, diferem.slice(0, 4).join(" · "));
  /* o canto da ficha, a conta de §12, é o mesmo nas duas pontas: a ferramenta
     (cortar.html) e o motor (recorteDoRetrato) */
  const html = readFileSync(new URL("mente/figma/corte/cortar.html", RAIZ), "utf8");
  t("a ferramenta corta a 0,88, topo 0,03, folga 0,12, WebP 320 q 0,75 — o mesmo do motor",
    /LADO_FICHA = 0\.88, TOPO_FICHA = 0\.03, FOLGA = 0\.12, SAIDA = 320, QUALIDADE = 0\.75/.test(html)
    && RETRATO.recorte.ficha === 0.88 && Math.abs(RETRATO.ficha.alturaDoCentro - RETRATO.recorte.ficha / 2 - 0.03) < 1e-9 && Math.abs(1 - RETRATO.recorte.ficha - 0.12) < 1e-9);
  t("a ferramenta corta com o cx da TABELA (/corte.json), não com outro", /fetch\("\/corte\.json"\)/.test(html));
  t("a ferramenta não entra no bundle (fora de src/)", !existsSync(new URL("src/cortar.html", RAIZ)) && existsSync(new URL("mente/figma/corte/servir.cjs", RAIZ)));
}

sec("3. A imagem cobre o disco em todo tamanho em que o jogo desenha um rosto");
{
  /* 22 a casa da grade pequena, 28/32 os chips, 44 o padrão, 46–80 grupo/fichas/carta,
     120/160 a ficha do herói */
  const LADOS = [22, 28, 32, 40, 41, 44, 48, 64, 80, 100, 101, 120, 160];
  const furos = [];
  for (const r of RETRATOS) for (const lado of LADOS) {
    const c = recorteDoRetrato(r, lado);
    const tol = 0.01;
    if (!c || c.esquerda > tol || c.topo > tol || c.esquerda + c.largura < lado - tol || c.topo + c.largura < lado - tol) furos.push(`${r.arquivo}@${lado}`);
  }
  t(`${RETRATOS.length} × ${LADOS.length} recortes, nenhum deixa o fundo à mostra`, furos.length === 0, furos.slice(0, 4).join(", "));
  t("os limiares: 40 chip, 100 cartão, acima ficha", tamanhoDoRetrato(40) === "chip" && tamanhoDoRetrato(41) === "cartao" && tamanhoDoRetrato(100) === "cartao" && tamanhoDoRetrato(101) === "ficha");
  /* o recorte forçado (`recorte="cartao"` nas Fichas): o rosto pede ao motor no
     limiar e escala por 64/limiar — a mesma imagem, em qualquer disco */
  t("o recorte forçado sai dos limiares do motor, sem número novo",
    /chip: RETRATO\.limiar\.chip,\s*cartao: RETRATO\.limiar\.cartao,\s*ficha: RETRATO\.limiar\.cartao \+ 1,/.test(CODIGO));
  const lobo = RETRATOS.find((r) => r.chave === "especie:Lobo");
  const a = recorteDoRetrato(lobo, 64), b = recorteDoRetrato(lobo, RETRATO.limiar.cartao);
  t("a conta é linear no lado (é o que deixa escalar): 64 e 100 dão o mesmo em fração", Math.abs(a.largura / 64 - b.largura / 100) < 1e-3 && Math.abs(a.esquerda / 64 - b.esquerda / 100) < 1e-3);
}

sec("4. O rosto.jsx: a pintura primeiro, e nunca à custa do retrato");
{
  t("importa a conta do motor (retratoDe, recorteDoRetrato, RETRATO)", /import \{ retratoDe, recorteDoRetrato, RETRATO \} from "\.\/retratos\.js";/.test(CODIGO));
  const rosto = (CODIGO.match(/export function Rosto\([\s\S]*?\n\}/) || [""])[0];
  const iPintura = rosto.indexOf("retratoDe(ente");
  t("a pintura é perguntada ANTES do sinal do bicho e da xilogravura", iPintura > -1 && iPintura < rosto.indexOf("SinalDoRosto") && iPintura < rosto.indexOf("feicoes("));
  t("o hook vem antes de qualquer return (a ordem dos hooks não muda)", rosto.indexOf("React.useState(") > -1 && rosto.indexOf("React.useState(") < rosto.indexOf("return"));
  t("a conta da pintura está em try — estourar é o rosto de hoje", /try \{ pintura = retratoDe\(ente, \{ semente, apresentacao, fixo \}\); \} catch \(erro\) \{ pintura = null; \}/.test(rosto));
  t("a imagem que falha volta ao rosto de hoje (e não tenta de novo)", /onError=\{aoFalhar\}/.test(CODIGO) && /FALHARAM\.add\(arquivo\); repinta/.test(rosto) && /!FALHARAM\.has\(pintura\.arquivo\)/.test(rosto));
  t("a PinturaDoRetrato é definida fora do render", /^function PinturaDoRetrato\(/m.test(CODIGO) && !/^[ \t]+function PinturaDoRetrato/m.test(CODIGO));
  t("a imagem é <image> no disco de raio 32, decodificação assíncrona", /<clipPath id=\{id \+ "-disco"\}><circle cx=\{32\} cy=\{32\} r=\{32\} \/><\/clipPath>/.test(CODIGO) && /<image href=\{entrada\.arquivo\}/.test(CODIGO) && /decoding="async"/.test(CODIGO));
  t("o id do recorte é único por rosto (useId), nunca fixo", /React\.useId\(\)/.test((CODIGO.match(/function PinturaDoRetrato[\s\S]*?\n\}/) || [""])[0]));
  t("a bolinha passa o recorte ao rosto", /recorte = null \}\) \{/.test(UI) && /lex=\{lex\} recorte=\{recorte\} \/>/.test(UI));
}

sec("5. A vinheta do ferido (§5): de tabela, e para todo estado que existe");
{
  t("a cor é T.danger", RETRATO_PINTADO.vinheta.cor === T.danger);
  t("o miolo limpo até lado/3 = 2/3 do raio", Math.abs(RETRATO_PINTADO.vinheta.claro - 2 / 3) < 1e-9);
  t("grave mais forte que ferido, as duas entre 0 e 1", RETRATO_PINTADO.vinheta.ferido > 0 && RETRATO_PINTADO.vinheta.grave > RETRATO_PINTADO.vinheta.ferido && RETRATO_PINTADO.vinheta.grave <= 1);
  /* todo estado que `estadoDe` devolve tem uma entrada (o inimigo é furioso
     antes de grave; o herói é ferido antes de grave) */
  const estados = new Set();
  for (let v = 0; v <= 10; v++) { estados.add(estadoDe(v, 10)); estados.add(estadoDe(v, 10, true)); }
  t(`cada estado de estadoDe tem vinheta escrita (${[...estados].join(", ")})`, [...estados].every((e) => e in RETRATO_PINTADO.estado));
  t("o normal não pinta nada", !RETRATO_PINTADO.vinheta[RETRATO_PINTADO.estado.normal]);
  t("o componente lê a tabela, sem número solto", /const V = RETRATO_PINTADO\.vinheta;/.test(CODIGO) && /RETRATO_PINTADO\.estado\[estado\]/.test(CODIGO));
}

console.log(`\nrosto pintado: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
