/* O DUELO (v9.219) — jogador contra jogador, o determinismo por juiz

   As leis desta suíte: o código de ficha faz ida e volta e o selo pega
   adulteração FALANDO; duas máquinas com a mesma dupla e semente chegam
   ao MESMO selo de resultado (é isso que dispensa juiz de servidor);
   justo é só entre prontos, o resto é amistoso declarado com os dois
   lados à vista; e o duelo NUNCA escreve em save (lei vi). */

const RAIZ = "../src/";
const D = await import(RAIZ + "duelo.js");
const P = await import(RAIZ + "prontos.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. o código de ficha e o selo");
{
  const f = P.montarPronto("chama");
  const cod = D.codigoDaFicha(f);
  t("a ficha vira código e volta inteira", (() => { const r = D.fichaDoCodigo(cod); return r.ok && r.ficha.nome === f.nome && r.ficha.vidaMax === f.vidaMax; })());
  t("adulterar o corpo quebra o selo, falando", (() => { const r = D.fichaDoCodigo(cod.slice(0, -6) + "XXXXXX"); return !r.ok && /selo/.test(r.motivo); })());
  t("prefixo estranho falha falando", !D.fichaDoCodigo("ZZZ9|abc|def").ok);
  t("lixo falha falando, nunca em silêncio", ["", null, "TVD1|só duas"].every((x) => D.fichaDoCodigo(x).ok === false && D.fichaDoCodigo(x).motivo));
  t("ficha sem corpo não vira código", D.codigoDaFicha(null) === null && D.codigoDaFicha({ nome: "x" }) === null);
}

sec("2. o determinismo dispensa juiz");
{
  const a = D.duelar(P.montarPronto("voz"), P.montarPronto("punho"), { semente: "juiz" });
  const b = D.duelar(P.montarPronto("voz"), P.montarPronto("punho"), { semente: "juiz" });
  t("duas execuções, o MESMO selo", D.versoesBatem(a.selo, b.selo));
  const c = D.duelar(P.montarPronto("voz"), P.montarPronto("punho"), { semente: "outra" });
  t("semente diferente, selo diferente (o selo diz algo)", a.selo !== c.selo);
  t("selo vazio nunca bate", !D.versoesBatem("", "") && !D.versoesBatem(null, null));
}

sec("3. a série narrada seca");
{
  const r = D.duelar(P.montarPronto("muralha"), P.montarPronto("sombra"), { semente: "seca" });
  t("o placar fala pela boca do vencedor (2×algo)", /^2×[01]$/.test(r.placar));
  t("o vencedor tem nome de gente", [P.montarPronto("muralha").nome, P.montarPronto("sombra").nome].includes(r.vencedorNome));
  t("cada queda tem terreno nomeado, rodadas e linhas", r.quedas.every((q) => q.nomeDoTerreno && q.rodadas >= 1 && q.linhas.length >= 2));
  t("a crônica fecha em uma linha", /venceu/.test(r.cronica) && /queda/.test(r.cronica));
}

sec("4. justo é do roster; o resto é amistoso declarado");
{
  const a = P.montarPronto("voto"), b = P.montarPronto("flecha");
  t("dois do roster = justo", D.tipoDoDuelo(a, b) === "justo");
  const campanha = { ...a }; delete campanha.pronto;
  t("ficha de campanha = amistoso", D.tipoDoDuelo(campanha, b) === "amistoso" && D.tipoDoDuelo(a, campanha) === "amistoso");
  const aviso = D.resumoParaAviso(a);
  t("o aviso mostra o que o aceite precisa ver", aviso.nivel === P.NIVEL_DO_PRONTO && aviso.vida > 0 && aviso.defesa >= 10 && aviso.arma && aviso.doRoster === true);
}

sec("5. a casa serve rival — e nunca o espelho");
{
  t("o rival da casa nunca é o próprio duelista", ["muralha", "voz", "voto"].every((id) => D.rivalDaCasa(id, "s").id !== id));
  t("determinístico por semente", D.rivalDaCasa("voz", "s1").id === D.rivalDaCasa("voz", "s1").id);
  t("vem com ficha montada e pronto", (() => { const r = D.rivalDaCasa("chama", "z"); return r.ficha.nome && r.pronto.linha; })());
}

sec("6. o duelo não deixa cicatriz (lei vi)");
{
  const src = readFileSync("../src/duelo.js", "utf8");
  t("duelo.js não toca localStorage nem save", !/localStorage|chaveDoSave|salvar\(/.test(src));
  const f = P.montarPronto("remendo");
  const antes = JSON.stringify(f);
  D.duelar(f, P.montarPronto("punho"), { semente: "cicatriz" });
  t("a ficha sai como entrou", JSON.stringify(f) === antes);
}

sec("7. ligado ao jogo (D2)");
{
  t("o App importa o duelo", /from "\.\/duelo\.js"/.test(APP));
  t("o menu tem a porta Duelo", /irDuelo/.test(APP) && /Duelo<\/span>/.test(APP));
  t("a tela existe e mostra o aviso do amistoso", /function TelaDuelo/.test(APP) && /ninguém confere o peso das luvas/.test(APP));
  t("o código do meu lado se copia para mandar", /codigoDaFicha\(minha\)/.test(APP));
  t("o selo aparece na tela (o juiz é visível)", /selo da luta/.test(APP));
  t("o duelo justo é anunciado quando é justo", /DUELO JUSTO/.test(APP));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
