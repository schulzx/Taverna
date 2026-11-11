/* teste-corpus-das-situacoes.mjs (CS · 11/11/2026) — «os testes que as
   nossas sessões nunca viram».

   O corpus da mesa (teste-corpus-da-mesa.mjs) afinou o `lerAcao` com as 439
   frases reais das sessões de prova — mas, dos 40 rótulos de teste, 25 não
   tinham NENHUMA frase real (nadar, saltar, a tranca, desarmar, cavalgar,
   escalar, o equilíbrio, aguentar, acalmar o bicho, forçar, escapar,
   orientar-se, a heráldica, falsificar, ler o corpo, o arcano, a mão leve,
   mentir, a fraqueza, impressionar, seguir alguém, e quatro famílias do
   improviso). Nesses o catálogo só conhecia frases que nós imaginámos.

   A fonte é o estudo do Mestre (mente/estudo-do-mestre.md): contaram-se nos
   159 episódios os momentos em que o Mestre pede cada um desses testes, e os
   TIPOS de situação (a corrente do rio, a borda do telhado, o mecanismo da
   armadilha, a causa da morte…), em abstrato. As frases do corpus
   (testes/corpus-das-situacoes.json) são escritas do zero por nós, sobre o
   nosso mundo, com as quase-iguais que parecem pedir o dado e não pedem — e
   divididas por sorteio com semente em duas metades: A afinou o catálogo; B
   é a prova, e nunca guiou mudança nenhuma.

   O contexto é o da mesa, mais as duas coisas que estas situações supõem:
   o herói leva uma gazua (quem diz «uso a gazua» tem uma), e a armadilha
   está em cena nas frases de desarmar (OBJETO_DO_TESTE). A perícia certa da
   tranca é a da via (VIAS_DE_TRANCA): a gazua é Prestidigitação, o ombro é
   Arrombamento.

   Os números (11/11/2026), catálogo de 347320b → depois da CS:
     · metade A (afinou): intenção 115 → 240 de 258 · perícia 72 → 188 de
       202 · falsos «pede dado» 4 → 0 de 56;
     · metade B (a prova): intenção 104 → 176 de 240 · perícia 66 → 133 de
       193 · falsos «pede dado» 4 → 3 de 47.
   O corpus da mesa não mexeu (413, 58, 2).

   Catracas por metade: a intenção e a perícia não descem, os falsos não
   sobem. Quando um número melhorar, move-se o piso (ou o teto) para o novo
   valor, com a data — e só para esse lado. A metade B continua a não guiar:
   o que ela erra mede-se, não se conserta frase a frase. */
import fs from "node:fs";
import { lerAcao, DESAFIOS, viaDeclarada, viasAbertas } from "../src/desafios.js";
import { ehDeclaracaoDeAtaque } from "../src/agressao.js";
import { porQueNaoChama } from "../src/motor/o-mestre-chama.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const CORPUS = JSON.parse(fs.readFileSync(new URL("./corpus-das-situacoes.json", import.meta.url), "utf8"));
const MESA = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));

/* ---------------- AS CATRACAS ----------------
   Contagens inteiras, por metade (11/11/2026). */
const CATRACA_DAS_SITUACOES = {
  A: { intencao: 240, pericia: 188, falsosPedeDado: 0 },
  B: { intencao: 176, pericia: 133, falsosPedeDado: 3 },
};

/* ---------------- O CONTEXTO ---------------- */
const nrm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const CONHECIDOS = (CORPUS.conhecidos || []).map((n) => new RegExp("\\b" + nrm(n) + "\\b"));
const ehPessoaConhecida = (txt) => { const x = nrm(txt); return CONHECIDOS.some((rx) => rx.test(x)); };
const HEROI = { nivel: 1, inventario: ["Gazua"], habilidades: [], equipado: {} };
const ctxDe = (e) => ({
  personagem: HEROI, semente: "corpus-das-situacoes", lugar: "Largo do Cereal", tentativas: {}, dia: 1, ehPessoaConhecida,
  objetoEmCena: (tipo) => !!e && !!e.cena && tipo === e.cena,
});

/* o rótulo, e a perícia que ele rola */
const FAMILIA_PERICIA = { intelecto: "saberes", percepcao: "percepcao", presenca: "persuasao", vigor: "fortitude", destreza: "acrobacia", forca: "atletismo" };
const SEM_TESTE = ["conversa", "mover", "livre", "atacar", "naoSePede"];
const SEM_DADO = ["conversa", "mover", "livre"];
const ehTeste = (r) => !!r && !SEM_TESTE.includes(r);
const grosso = (r) => (r == null || SEM_DADO.includes(r) ? "semDado" : r);
function periciaDoRotulo(r, frase) {
  if (!r) return "";
  if (r.startsWith("imp_")) return FAMILIA_PERICIA[r.slice(4)] || "";
  if (r === "tranca") return (viaDeclarada(frase) || viasAbertas(HEROI)[0] || {}).pericia || "";
  return (DESAFIOS.find((d) => d.id === r) || {}).pericia || "";
}

/* a leitura da mesa (a mesma de teste-corpus-da-mesa.mjs) */
const ROLA_MESMO_SEM_CHAMADO = [null, "conversa"];
function lerNaMesa(e) {
  const frase = e && typeof e === "object" ? e.frase : e;
  let atk = false;
  try { atk = ehDeclaracaoDeAtaque(frase, { nomes: [] }); } catch { atk = false; }
  if (atk) return { rot: "atacar", pede: false, pericia: "" };
  let v = null;
  try { v = lerAcao(frase, ctxDe(e && typeof e === "object" ? e : null)); } catch { v = null; }
  if (!v) return { rot: null, pede: false, pericia: "" };
  if (v.tipo === "teste") {
    let rot = v.id;
    if (v.id === "improviso") { const p = String(v.chave || "").split("|"); rot = "imp_" + p[p.indexOf("improviso") + 1]; }
    return { rot, pede: ROLA_MESMO_SEM_CHAMADO.includes(porQueNaoChama(v, {})), pericia: v.pericia || "" };
  }
  return { rot: v.tipo === "naoSePede" ? "naoSePede" : "livre", pede: false, pericia: "" };
}

/* ---------------- A MEDIDA ---------------- */
const medida = {};
const porGrupo = {};
const erros = [];
for (const e of CORPUS.frases) {
  const m = (medida[e.metade] = medida[e.metade] || { n: 0, intencao: 0, nTeste: 0, pericia: 0, nSemTeste: 0, falsosPedeDado: 0 });
  const g = (porGrupo[e.grupo] = porGrupo[e.grupo] || { A: [0, 0], B: [0, 0] });
  const r = lerNaMesa(e);
  m.n++; g[e.metade][1]++;
  const certa = grosso(e.rotulo) === grosso(r.rot);
  if (certa) { m.intencao++; g[e.metade][0]++; }
  if (ehTeste(e.rotulo)) {
    m.nTeste++;
    if (r.pede && r.pericia === periciaDoRotulo(e.rotulo, e.frase)) m.pericia++;
  } else {
    m.nSemTeste++;
    if (r.pede) m.falsosPedeDado++;
  }
  if (!certa && e.metade === "A") erros.push(`${e.rotulo} → ${r.rot} · ${e.frase}`);
}

sec("1. o corpus é o que diz ser");
{
  const vocab = new Set([...DESAFIOS.map((d) => d.id), ...Object.keys(FAMILIA_PERICIA).map((f) => "imp_" + f), ...SEM_TESTE]);
  const fora = [...new Set(CORPUS.frases.flatMap((e) => [e.rotulo, e.grupo]).filter((r) => !vocab.has(r)))];
  t(`${CORPUS.frases.length} frases, ${Object.keys(porGrupo).length} grupos`, CORPUS.frases.length >= 450 && Object.keys(porGrupo).length === 25);
  t("toda frase tem grupo, metade, rótulo e frase", CORPUS.frases.every((e) => e.grupo && ["A", "B"].includes(e.metade) && e.rotulo && e.frase));
  t(`todo rótulo e todo grupo são do vocabulário fechado${fora.length ? " — fora: " + fora.join(", ") : ""}`, fora.length === 0);
  t("nenhuma frase repetida, e nenhuma do corpus da mesa", new Set(CORPUS.frases.map((e) => e.frase)).size === CORPUS.frases.length
    && !CORPUS.frases.some((e) => MESA.frases.some((f) => f.frase === e.frase)));
  /* os grupos são os rótulos de teste que o corpus da mesa não tem */
  const reais = new Set(MESA.frases.map((e) => e.rotulo));
  t("cada grupo é um rótulo de teste sem frase real no corpus da mesa", Object.keys(porGrupo).every((g) => ehTeste(g) && !reais.has(g)));
  t("as duas metades têm cada grupo, com positivas e quase-iguais", Object.keys(porGrupo).every((g) => ["A", "B"].every((h) =>
    CORPUS.frases.some((e) => e.grupo === g && e.metade === h && e.rotulo === g) && CORPUS.frases.some((e) => e.grupo === g && e.rotulo !== g))));
  t("a origem diz de onde vem (as situações contadas, as frases nossas) e a semente das metades", /CRD3/.test(CORPUS.origem) && /escritas do zero/.test(CORPUS.origem) && /semente/.test(CORPUS.metades));
  t("a gente conhecida é a do corpus da mesa", JSON.stringify(CORPUS.conhecidos) === JSON.stringify(MESA.conhecidos));
  t("desarmar só existe com a armadilha em cena", CORPUS.frases.filter((e) => e.grupo === "desarmar").every((e) => e.cena === "armadilha"));
}

sec("2. as catracas, por metade");
for (const h of ["A", "B"]) {
  const m = medida[h], c = CATRACA_DAS_SITUACOES[h];
  console.log(`     metade ${h}${h === "B" ? " (a prova)" : " (afinou)"}: intenção ${m.intencao}/${m.n} · perícia ${m.pericia}/${m.nTeste} · falsos «pede dado» ${m.falsosPedeDado}/${m.nSemTeste}`);
  t(`metade ${h}: a intenção certa não desce de ${c.intencao}`, m.intencao >= c.intencao, `${m.intencao}`);
  t(`metade ${h}: a perícia certa não desce de ${c.pericia}`, m.pericia >= c.pericia, `${m.pericia}`);
  t(`metade ${h}: os falsos «pede dado» não sobem de ${c.falsosPedeDado}`, m.falsosPedeDado <= c.falsosPedeDado, `${m.falsosPedeDado}`);
}
console.log("     por grupo (A · B): " + Object.entries(porGrupo).map(([g, o]) => `${g} ${o.A[0]}/${o.A[1]}·${o.B[0]}/${o.B[1]}`).join(" | "));
if (process.env.CORPUS_ERROS) console.log(erros.map((x) => "       " + x).join("\n"));

sec("3. as portas novas, uma a uma (frases que não estão no corpus)");
{
  const ve = (f, cena) => lerAcao(f, ctxDe({ cena }));
  const casa = (f, id, cena) => { const v = ve(f, cena); return !!v && v.tipo === "teste" && v.id === id; };
  const naoRola = (f) => { const v = ve(f); return !v || v.tipo !== "teste"; };
  t("«o que sei de bichos assim» é lembrar; «o que sei desse troll» é a fraqueza", casa("O que sei de bichos assim?", "lembrar") && casa("O que sei desse troll?", "fraqueza"));
  t("«sei que ele teme o pai» não é a fraqueza (a criatura tem de estar na frase)", !casa("Sei que ele teme o pai.", "fraqueza"));
  t("o pé na porta é a tranca pela força (Arrombamento)", (() => { const v = ve("Chuto a porta do armazém."); return v && v.id === "tranca" && v.pericia === "arrombamento"; })());
  t("comprar a gazua não é usá-la", naoRola("Compro duas gazuas ao ferreiro."));
  t("ver se ela foi envenenada é ler o corpo, não a intenção", casa("Vejo se a velha foi envenenada.", "diagnosticar"));
  t("sentir se há magia é o arcano", casa("Sinto se há magia no anel.", "arcano"));
  t("perguntar ao mago é conversa", naoRola("Pergunto ao mago que magia ele usa."));
  t("seguir alguém de longe é seguir, não esconder-se", casa("Sigo o mercador de longe pelo cais.", "seguir_alguem"));
  t("seguir o corredor sem ser visto continua a furtividade", casa("Sigo o corredor sem ser visto.", "furtar_se"));
  t("«salto do balcão para o lustre» continua o improviso de Destreza", (() => { const v = ve("Salto do balcão para o lustre"); return v && v.id === "improviso" && v.pericia === "acrobacia"; })());
  t("escutar a música do bardo não rola", naoRola("Escuto a música do bardo e bebo."));
  t("elogiar o pão é conversa; para cair nas graças é a boa impressão", naoRola("Elogio o pão da padeira.") && casa("Elogio o pão da padeira para cair nas graças dela.", "impressionar"));
  t("desarmar sem armadilha em cena não existe", !casa("Travo a placa de pressão.", "desarmar") && casa("Travo a placa de pressão.", "desarmar", "armadilha"));
}

sec("4. a medida não estoura com lixo");
{
  t("frase vazia, null e lixo devolvem sem dado", [null, "", "   ", 42, {}, { frase: null }].every((x) => lerNaMesa(x).pede === false));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
