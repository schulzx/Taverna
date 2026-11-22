/* teste-a-venda-da-bolsa.mjs (21/11/2026) — a venda que dizia «Vendido» e
   não vendia (mente/lancamento/mestre-vivo-sessao-7.md, T56–T58).

   A cena da sessão: Kaelith, sem arma, com a Bússola empenada e duas Ervas
   Amargas na mochila e ◉ 76 na bolsa, vende uma erva no mercado. A tela disse
   «(bolsa: ◉ 80)»; a ficha ficou com ◉ 76 e as duas ervas.

   Duas metades:
     1. a conta (src/a-venda-da-bolsa.js): a linha «Vendido» só nasce junto da
        ficha que a venda produziu; sem venda, a linha diz por quê e a ficha
        não muda;
     2. a fiação (App.jsx): a venda da frase corre dentro do turno, e o resto
        do turno lê a ficha viva — a venda tem de gravar ali (mudarFicha), ler
        dali (fichaViva) e ser a única a dizer «Vendido». A versão de antes
        lia `personagem` e gravava só por setPersonagem: esta metade falha
        nela. */
import fs from "node:fs";
import path from "node:path";
import { aVendaDaBolsa, O_TEXTO_DA_VENDA } from "../src/a-venda-da-bolsa.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");

const KAELITH = Object.freeze({
  nome: "Kaelith Punho-de-Pedra", moedas: 76,
  inventario: Object.freeze(["Bússola empenada", "Erva Amarga", "Erva Amarga"]),
  equipamento: Object.freeze([]), equipados: Object.freeze({}),
});
const RAIZ = { valor: 4, quem: { id: "m1", nome: "A Raiz Amarga" }, motivo: "" };

sec("1. a cena da sessão: vender uma Erva Amarga no mercado");
{
  const r = aVendaDaBolsa(KAELITH, { item: "Erva Amarga", origem: "inventario", oferta: RAIZ });
  t("a venda acontece", r.ok === true);
  t("a bolsa vai de ◉ 76 a ◉ 80", r.ficha.moedas === 80, r.ficha.moedas);
  t("sai UMA erva da mochila, e a bússola fica", r.ficha.inventario.filter((x) => x === "Erva Amarga").length === 1 && r.ficha.inventario.includes("Bússola empenada"), JSON.stringify(r.ficha.inventario));
  /* 21/11 (a nona sessão, T8): a quem se vende leva a contração da tabela («à Raiz Amarga», era «a A Raiz
     Amarga»). A intenção que fica: a linha nomeia o comprador e o número que a ficha tem. */
  t("a linha diz o número que a ficha tem", r.linha.includes("◉ 80") && r.linha.includes("Erva Amarga") && r.linha.includes("à Raiz Amarga"), r.linha);
  t("a ficha de antes não foi mexida (imutável)", KAELITH.moedas === 76 && KAELITH.inventario.length === 3);
  /* o turno seguinte da sessão (T57): vender a outra erva parte da ficha nova */
  const r2 = aVendaDaBolsa(r.ficha, { item: "Erva Amarga", origem: "inventario", oferta: RAIZ });
  t("a segunda venda parte da ficha da primeira: ◉ 84, nenhuma erva", r2.ok && r2.ficha.moedas === 84 && !r2.ficha.inventario.includes("Erva Amarga"), r2.ficha.moedas);
  const r3 = aVendaDaBolsa(r2.ficha, { item: "Bússola empenada", origem: "inventario", oferta: { ...RAIZ, valor: 7 } });
  t("e a bússola (T58): ◉ 91, mochila vazia", r3.ok && r3.ficha.moedas === 91 && r3.ficha.inventario.length === 0, r3.ficha.moedas);
}

sec("2. a venda que não pode acontecer diz por quê, e a ficha fica");
{
  const sem = aVendaDaBolsa(KAELITH, { item: "Erva Amarga", origem: "inventario", oferta: { valor: 4, quem: null, motivo: "ninguém aqui tem ◉ 4 hoje" } });
  t("sem comprador: não vende, e a linha traz o motivo", sem.ok === false && sem.ficha === KAELITH && sem.linha.includes("ninguém aqui tem ◉ 4 hoje") && !sem.linha.includes("Vendido"), sem.linha);
  const semMotivo = aVendaDaBolsa(KAELITH, { item: "Erva Amarga", origem: "inventario", oferta: null });
  t("sem oferta nenhuma: o motivo da tabela", semMotivo.ok === false && semMotivo.linha.includes(O_TEXTO_DA_VENDA.motivoPadrao), semMotivo.linha);
  const fora = aVendaDaBolsa(KAELITH, { item: "Espada Longa", origem: "inventario", oferta: RAIZ });
  t("o que não está na mochila: diz, e não vende", fora.ok === false && fora.ficha === KAELITH && fora.linha.includes("Espada Longa"), fora.linha);
  const vestido = { ...KAELITH, equipamento: ["Gibão de couro"], equipados: { torso: { nome: "Gibão de couro" } } };
  const eq = aVendaDaBolsa(vestido, { item: "Gibão de couro", origem: "equipamento", oferta: RAIZ });
  t("o que está vestido não vai para a banca", eq.ok === false && eq.ficha === vestido && /equipado/.test(eq.linha), eq.linha);
  t("ficha null não estoura", aVendaDaBolsa(null, { item: "x" }).ok === false && aVendaDaBolsa(KAELITH, null).ok === false);
}

sec("3. a fiação: a venda grava onde o turno lê, e é a única a dizer «Vendido»");
{
  /* 21/11 (a oitava sessão, T30): a porta ganhou a quantidade (a venda do que é de uso, que delega a venderOUso) — o corpo é o mesmo */
  const ini = app.indexOf("const venderNoMercado = (nomeItem, origem, quantos) => {");
  const corpo = ini >= 0 ? app.slice(ini, app.indexOf("\n  };\n", ini)) : "";
  t("a venda existe no App", !!corpo);
  t("lê a ficha VIVA (o espelho que o resto do turno lê), não o estado do React", /fichaViva\(\)/.test(corpo) && !/\bpersonagem\.(inventario|equipamento|moedas|equipados)/.test(corpo));
  t("grava por mudarFicha (o espelho e o estado de uma vez), nunca só por setPersonagem", /mudarFicha\(r\.ficha\)/.test(corpo) && !/setPersonagem\(/.test(corpo));
  t("a conta e a linha saem de aVendaDaBolsa", /aVendaDaBolsa\(base,/.test(corpo) && /r\.linha/.test(corpo));
  t("no App não há outra linha «Vendido» escrita à mão", !app.includes("🛒 Vendido"));
  t("a venda da frase entra no turno pela mesma porta, também quando não pode (a porta diz por quê)",
    /* 21/11: a mesma porta, com a quantidade do que é de uso (rações, água, tochas) */
    /if \(lado\.venda && lado\.venda\.item\) venderNoMercado\(lado\.venda\.item, lado\.venda\.origem, lado\.venda\.quantos\);/.test(app));
  t("a fiação está protegida (calou)", /calou\("a venda da bolsa", e\)/.test(corpo));
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
