/* O ENCALHE (v9.205) — o sábio percebe o aluno perdido

   A escada por onde o mundo vai buscar quem parou. As leis que esta suíte
   guarda são as do documento: exploração livre nunca dispara; os degraus
   sobem um por vez, sem pular; e o degrau 4 só cobra o que já estava
   prometido em tela. */

const RAIZ = "../src/";
const E = await import(RAIZ + "encalhe.js");
const { readFileSync } = await import("node:fs");
const semComentarios = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(readFileSync("../src/App.jsx", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. os 18 sinais e as 22 intervenções em 4 degraus");
{
  t("são 18 sinais", E.SINAIS.length === 18, String(E.SINAIS.length));
  t("ids de sinal únicos", new Set(E.SINAIS.map((x) => x.id)).size === 18);
  t("quatro degraus", E.DEGRAUS.length === 4);
  t("são 22 intervenções", E.INTERVENCOES.length === 22, String(E.INTERVENCOES.length));
  const cont = {};
  for (const i of E.INTERVENCOES) cont[i.degrau] = (cont[i.degrau] || 0) + 1;
  t("a divisão do documento: 5/7/6/4", cont[1] === 5 && cont[2] === 7 && cont[3] === 6 && cont[4] === 4, JSON.stringify(cont));
  t("toda intervenção aponta um degrau válido", E.INTERVENCOES.every((i) => E.degrauPorN(i.degrau)));
  t("intervencoesDoDegrau filtra", E.intervencoesDoDegrau(2).length === 7);
}

sec("2. A LEI: exploração livre NÃO dispara");
{
  t("mesa vazia não é encalhe", E.lerEncalhe({}).encalhado === false);
  t("um sinal só é vida normal, não encalhe", E.lerEncalhe({ missoesAbertas: 20 }).encalhado === false);
  t("o piso é dois sinais (repetição, não curiosidade)", E.MINIMO_DE_SINAIS === 2);
  const enc = E.lerEncalhe({ missoesAbertas: 20, diasSemDiario: 9 });
  t("dois sinais: encalhado", enc.encalhado === true && enc.quantos === 2);
  t("devolve os sinais que pesaram", enc.sinais.length === 2);
}

sec("3. a escada sobe um por vez, e desce ao mover-se");
{
  const parado = { missoesAbertas: 20, diasSemDiario: 9 };
  let e = E.garantirEscada(null);
  t("começa solta (degrau 0)", e.degrau === 0);
  let r = E.subirEscada(e, parado, { dia: 1 });
  t("encalhado: sobe ao degrau 1", r.escada.degrau === 1 && r.encalhado);
  t("e traz uma intervenção do degrau 1", r.intervencao && r.intervencao.degrau === 1);
  e = r.escada;
  /* no mesmo dia (ou antes de DIAS_ENTRE_DEGRAUS) não sobe outro */
  r = E.subirEscada(e, parado, { dia: 1 });
  t("não pula degrau no mesmo dia", r.escada.degrau === 1 && r.intervencao === null);
  /* passados os dias, sobe UM */
  r = E.subirEscada(e, parado, { dia: 1 + E.DIAS_ENTRE_DEGRAUS });
  t("passados os dias, sobe ao 2 (um por vez)", r.escada.degrau === 2);
  /* nunca passa do 4 */
  let alto = E.garantirEscada({ degrau: 4, mexeuEm: 0 });
  r = E.subirEscada(alto, parado, { dia: 99 });
  t("não passa do degrau 4", r.escada.degrau === 4);
  /* MOVER-SE derruba a escada a zero */
  r = E.subirEscada({ degrau: 3, mexeuEm: 0 }, {}, { dia: 50 });
  t("sem encalhe (o jogador moveu), a escada desce a zero", r.escada.degrau === 0 && r.encalhado === false);
}

sec("4. o degrau 4 só cobra o que já estava prometido");
{
  const quatro = E.intervencoesDoDegrau(4);
  t("as quatro consequências existem", quatro.length === 4);
  t("o relógio cobra o que anunciou", quatro.some((i) => /relógio|barra|anunciada/i.test(i.diz)));
  t("a oferta expira (já estava na pauta)", quatro.some((i) => /oferta|contrato|expira|porta fechada/i.test(i.diz)));
  t("nada no degrau 4 é punição inventada — tudo já estava em tela",
    quatro.every((i) => /relógio|fama|oferta|aliado|crédito|patamar|recompensa|contrato|barra|anunciada|porta/i.test(i.diz)));
  /* a intervenção é determinística pela semente que o App passa (o dia) */
  t("intervencaoDoDegrau é determinística", E.intervencaoDoDegrau(1, 7).id === E.intervencaoDoDegrau(1, 7).id);
  t("e varia com a semente", new Set([0, 1, 2, 3, 4].map((n) => E.intervencaoDoDegrau(1, n).id)).size > 1);
}

sec("5. ligado ao jogo");
{
  t("o App importa o Encalhe", /import \{ garantirEscada, subirEscada \}/.test(APP));
  t("há um ref da escada e ele entra no save", /escadaRef/.test(APP) && /escada: escadaRef\.current/.test(APP));
  t("o snapshot lê missões abertas e diário parado", /missoesAbertas/.test(APP) && /diasSemDiario/.test(APP));
  t("a escada sobe no turno", /subirEscada\(escadaRef\.current/.test(APP));
  t("o mundo vai buscar quando sobe um degrau", /O MUNDO VAI BUSCAR/.test(APP));
  t("resumoDoEncalhe condensa para o autor", E.resumoDoEncalhe({ missoesAbertas: 20, diasSemDiario: 9 }).encalhado === true && E.resumoDoEncalhe({}).encalhado === false);
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
