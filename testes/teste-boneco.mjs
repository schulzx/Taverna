/* teste-boneco.mjs (AAA · 05/11/2026) — o boneco, a gaveta, a mochila
   e a ficha como carta.

   formas.md §AAA §2 e §3. Node não importa JSX: as peças
   (src/painel-equipamento.jsx, src/painel-ficha-carta.jsx e o Encaixe e o
   Disco de src/painel-moldura.jsx) leem-se aqui como texto — que leem as
   tabelas, que não têm cor solta, que o botão diz o preço e cala em luta.
   A conta (a comparação) é de teste-comparar-item.mjs; os discos da ficha,
   que são conta, provam-se aqui em Node (discosDaFicha, subida-de-nivel.js).
   E as tabelas: cada raridade com cor e forma, a geometria do Encaixe tirada
   do Figma (253:352), o Disco (253:383), a gaveta, a carta. */
import { readFileSync } from "node:fs";
import { ENCAIXE, GAVETA_DO_ENCAIXE, DISCO_DE_ATRIBUTO, FICHA_CARTA, COR_DA_RARIDADE, MOVIMENTO_CSS, TAMANHOS_DA_MOLDURA } from "../src/estilo.js";
import { discosDaFicha } from "../src/subida-de-nivel.js";
import { T } from "../src/constantes.js";
import { rgb, razao } from "./conta-da-luz.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, diz = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (diz ? "\n      " + diz : "")); } };
const sec = (s) => console.log("\n" + s);
const ler = (a) => readFileSync(new URL("../src/" + a, import.meta.url), "utf8");
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
const semCor = (s) => !/#[0-9A-Fa-f]{3,8}\b|rgba?\(/.test(semComentario(s));

sec("1. o Encaixe (Figma 253:352): 56, o fio por dentro, o anel de 3 a 5 px por fora");
{
  t("alvo de 56 (≥ 44, WCAG 2.5.5)", ENCAIXE.lado === 56 && ENCAIXE.lado >= 44);
  t("o ícone de 32 centrado (12 de cada lado)", (ENCAIXE.lado - ENCAIXE.icone) / 2 === 12);
  t("o anel do foco/escolhido: 2 px a 3 px de folga (de 3 a 5 px por fora, §9)", ENCAIXE.anel.espessura === 2 && ENCAIXE.anel.folga === 3);
  t("o vazio: glifo a 35%, tracejado", ENCAIXE.vazio.alfaDoGlifo === 0.35 && ENCAIXE.vazio.tracejado >= 1);
  t("o brilho respira de 0,35 a 0,55 em 2400 ms, e fica a 0,45 parado", ENCAIXE.brilho.de === 0.35 && ENCAIXE.brilho.ate === 0.55 && ENCAIXE.brilho.dura === 2400 && ENCAIXE.brilho.fixo === 0.45);
  t("pressionado a 0,96 em 80 ms", ENCAIXE.pressionado.escala === 0.96 && ENCAIXE.pressionado.dura === 80);
  t("a gota e a estrela cabem no quadro", ENCAIXE.gota.x - ENCAIXE.gota.r >= 0 && ENCAIXE.estrela.x + ENCAIXE.estrela.r <= ENCAIXE.lado);
  t("a mochila: 5 colunas no telefone, 6 na mesa (§3)", ENCAIXE.mochila.telefone === 5 && ENCAIXE.mochila.mesa === 6);
  t("5 encaixes cabem em 375 com 16 de margem", 5 * ENCAIXE.lado + 4 * ENCAIXE.mochila.folga <= 375 - 32);
}

sec("2. cada raridade: cor, fio e forma; e a borda passa 3:1 sobre o fundo do encaixe (§6)");
{
  for (const [r, c] of Object.entries(COR_DA_RARIDADE)) {
    const contra = razao(rgb(c.cor), rgb(c.fundo));
    t(`${r}: cor, fio ${c.fio}, marcas [${ENCAIXE.marcas[r].join(", ")}] · borda ${contra.toFixed(2)}:1`, /^#[0-9A-F]{6}$/.test(c.cor) && c.fio >= 1 && Array.isArray(ENCAIXE.marcas[r]) && contra >= 3);
  }
}

sec("3. o Disco de atributo (Figma 253:383) e a carta");
{
  t("disco de 64, aro 2,5 (ganhou 3), halo 14 a 0,55", DISCO_DE_ATRIBUTO.lado === 64 && DISCO_DE_ATRIBUTO.aro === 2.5 && DISCO_DE_ATRIBUTO.aroGanhou === 3 && DISCO_DE_ATRIBUTO.halo === 14 && DISCO_DE_ATRIBUTO.alfaDoHalo === 0.55);
  t("ícone 20, número 22, a troca em 180 ms", DISCO_DE_ATRIBUTO.icone === 20 && DISCO_DE_ATRIBUTO.numero === 22 && DISCO_DE_ATRIBUTO.dura === 180);
  t("o número ink sobre panelSoft passa 4,5:1", razao(rgb(T.ink), rgb(T.panelSoft)) >= 4.5);
  t("três discos cabem em 375 (3 × 64 + folgas)", FICHA_CARTA.colunas * DISCO_DE_ATRIBUTO.lado + 2 * FICHA_CARTA.folga <= 375 - 32);
  t("a carta da mesa é ×1,6 a do Figma (160 → 256)", FICHA_CARTA.carta.mesa === TAMANHOS_DA_MOLDURA.carta.largura * 1.6);
  t("a carta do telefone deixa lugar ao nome (com o transbordo, ≤ metade de 375)", FICHA_CARTA.carta.telefone * 212 / 160 <= 375 / 2);
  t("o nome em Cinzel 26 na mesa (§2)", FICHA_CARTA.nome.mesa === 26);
  t("a gaveta: sobe em 220, abre em 160, esvai em 120 (§9)", GAVETA_DO_ENCAIXE.sobe === 220 && GAVETA_DO_ENCAIXE.popover === 160 && GAVETA_DO_ENCAIXE.reduzido === 120);
}

sec("4. os discos da ficha: o preço do próximo ponto, o teto, o que o equipamento empresta");
{
  const p = { nivel: 10, pontosAtr: 2, atributos: { forca: 0, destreza: 1, vigor: 1, intelecto: 6, presenca: 2, percepcao: 2 }, equipados: { anel: { nome: "Anel", tipo: "anel", raridade: "comum", atributos: { presenca: 1 } } } };
  const d = discosDaFicha(p);
  const de = (id) => d.find((x) => x.id === id);
  t("seis discos, na ordem de ATRIBUTOS", d.length === 6 && d[0].id === "forca" && d[5].id === "percepcao");
  t("o valor com sinal", de("intelecto").texto === "+6" && de("forca").texto === "+0");
  t("no teto (+6 no nível 10): estado teto, «no teto», não aceita", de("intelecto").estado === "teto" && de("intelecto").linha === "no teto" && !de("intelecto").aceita);
  t("com pontos, a linha diz o preço («custa 1») e aceita", de("forca").linha === "custa 1" && de("forca").aceita);
  t("sem pontos, a linha diz o que o equipamento empresta", discosDaFicha({ ...p, pontosAtr: 0 }).find((x) => x.id === "presenca").linha === "+1 equip.");
  t("sem pontos, nada aceita toque", discosDaFicha({ ...p, pontosAtr: 0 }).every((x) => !x.aceita));
  t("ficha nula não lança", discosDaFicha(null).length === 6);
}

sec("5. as peças leem as tabelas (texto)");
{
  const eq = ler("painel-equipamento.jsx"), fc = ler("painel-ficha-carta.jsx"), pm = ler("painel-moldura.jsx");
  t("nenhuma cor solta no equipamento, na ficha-carta e na moldura", semCor(eq) && semCor(fc) && semCor(pm));
  t("exportam PainelEquipamento, RostoNaMoldura, caDoHeroi e PainelFichaCarta", /export function PainelEquipamento\b/.test(eq) && /export function RostoNaMoldura\b/.test(eq) && /export function caDoHeroi\b/.test(eq) && /export function PainelFichaCarta\b/.test(fc));
  t("o Encaixe, o Disco e o IconeDeAtributo nascem em painel-moldura.jsx", ["Encaixe", "Disco", "IconeDeAtributo"].every((n) => new RegExp(`export function ${n}\\b`).test(pm)));
  t("o IconeDeItem ganha a raridade (a borda)", /export function IconeDeItem\(\{[^}]*raridade = null/.test(pm) && /<MarcasDaRaridade raridade=\{raridade\}/.test(pm));
  t("as props do equipamento: personagem, emCombate, aoEquipar, aoDesequipar", /export function PainelEquipamento\(\{ personagem, emCombate = false, aoEquipar = [^,]+, aoDesequipar = /.test(eq));
  t("a gaveta só tem o que cabe (itensParaEncaixe) e compara antes do clique (compararItem)", eq.includes("itensParaEncaixe(p.inventario, slot)") && eq.includes("compararItem(p, escolhido, slot, { emCombate })"));
  t("o botão diz o preço (rotuloDoEquipar) e cala em luta (troca.ok)", eq.includes("rotuloDoEquipar(cmp.linhas)") && /desativado=\{!cmp\.troca\.ok\}/.test(eq));
  t("e diz porquê, e o tempo da troca (fraseDaTroca)", eq.includes("cmp.troca.motivo") && eq.includes("fraseDaTroca(slot)"));
  t("a Gaveta nasce fora do render do painel (lei do foco)", eq.indexOf("function Gaveta(") < eq.indexOf("export function PainelEquipamento("));
  t("a ficha-carta é uma tela só na mesa e duas abas no telefone", fc.includes("useMesa()") && /role="tablist"/.test(fc) && fc.includes("FICHA_CARTA.mesa"));
  t("toda a fiação de callback do App entra em try (nunca custa o turno)", (eq.match(/try \{ aoEquipar\(/g) || []).length === 1 && (eq.match(/try \{ aoDesequipar\(/g) || []).length === 1 && /try \{ aoSubirAtributo\(/.test(fc));
}

sec("6. o CSS do encaixe, da gaveta e do disco: durações da tabela e saída no reduce");
{
  const i = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  const antes = MOVIMENTO_CSS.slice(0, i), dentro = MOVIMENTO_CSS.slice(i);
  t("o brilho respira com a duração da tabela", antes.includes(`tvEncaixeBrilho ${ENCAIXE.brilho.dura}ms`));
  t("a gaveta sobe e abre com as durações da tabela", antes.includes(`tvGavetaSobe ${GAVETA_DO_ENCAIXE.sobe}ms`) && antes.includes(`tvGavetaAbre ${GAVETA_DO_ENCAIXE.popover}ms`));
  t("o foco do encaixe é o anel T.mundo", antes.includes(`.tv-encaixe:focus-visible { outline: ${ENCAIXE.anel.espessura}px solid ${T.mundo}`));
  t("no reduce: brilho fixo, gaveta e disco secos, a gaveta esvai em 120", dentro.includes(`.tv-encaixe-brilho { animation: none; opacity: ${ENCAIXE.brilho.fixo}; }`) && dentro.includes(".tv-gaveta-sobe, .tv-gaveta-abre { animation: none; }") && dentro.includes(".tv-encaixe, .tv-disco { transition: none; }") && dentro.includes(`tvCerimoniaEsvai ${GAVETA_DO_ENCAIXE.reduzido}ms`));
}

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
