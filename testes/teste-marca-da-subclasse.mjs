/* A MARCA DA SUBCLASSE (05/11/2026) — src/marca-da-subclasse.js

   «não faz sentido escolher a subclasse no momento da criação se ela não vai
   fazer diferença até que você suba de lvl… e ainda assim tem que escolher
   de novo». Esta suíte prova:
   §1 a tabela: as 36 subclasses têm marca, e cada marca nomeia uma perícia
      que existe;
   §2 a escolha da criação é a escolha: a subclasse da árvore no rank 3 não
      pergunta de novo; a da árvore, se houver, ganha; só vale na classe de
      origem; lixo não estoura;
   §3 a marca pesa desde o nível 1: a perícia dela sobe um degrau de treino
      (nada → treinada; treinada → especialista), e só ela;
   §4 sem subclasse, nada muda. */
import { MARCA_DA_SUBCLASSE, subclasseDoHeroi, marcaDe, treinaPelaMarca } from "../src/marca-da-subclasse.js";
import { CLASSES, subclasseEscolhida, podeEscolherSubclasse } from "../src/classes.js";
import { PERICIAS, bonusDePericia } from "../src/pericias.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("§1 a tabela");
{
  const todas = CLASSES.flatMap((c) => c.subclasses.map((s) => s.nome));
  t(`as ${todas.length} subclasses têm marca`, todas.every((s) => MARCA_DA_SUBCLASSE[s]), todas.filter((s) => !MARCA_DA_SUBCLASSE[s]).join(", "));
  t("a tabela não tem subclasse que não existe", Object.keys(MARCA_DA_SUBCLASSE).every((s) => todas.includes(s)));
  const ids = new Set(PERICIAS.map((p) => p.id));
  t("toda marca nomeia uma perícia que existe", Object.values(MARCA_DA_SUBCLASSE).every((m) => ids.has(m.pericia)));
  t("toda marca diz o que é, numa frase curta", Object.values(MARCA_DA_SUBCLASSE).every((m) => m.diz && m.diz.length <= 60));
}

sec("§2 a escolha da criação é a escolha");
{
  const heroi = { classe: "Guerreiro", subclasse: "Bárbaro", nivel: 1 };
  t("a subclasse da criação é a da classe de origem", subclasseDoHeroi(heroi) === "Bárbaro" && subclasseEscolhida(heroi, "Guerreiro") === "Bárbaro");
  t("no rank 3, a árvore não pergunta de novo (já escolhida)", podeEscolherSubclasse({ ...heroi, ranks: { Guerreiro: 3 } }, "Guerreiro").pode === false);
  t("a da árvore, se houver, ganha da criação", subclasseEscolhida({ ...heroi, subclasses: { Guerreiro: "Cavaleiro" } }, "Guerreiro") === "Cavaleiro");
  t("a da criação não vale noutra classe (multiclasse)", subclasseEscolhida(heroi, "Mago") === null);
  t("uma subclasse da criação que não existe não conta", subclasseDoHeroi({ classe: "Guerreiro", subclasse: "Pirata" }) === null);
  t("lixo não estoura", [null, undefined, {}, 3, "x"].every((x) => subclasseDoHeroi(x) === null && marcaDe(x) === null && treinaPelaMarca(x, "atletismo") === false));
}

sec("§3 a marca pesa desde o nível 1");
{
  const semMarca = { classe: "Guerreiro", nivel: 1, pericias: { treinadas: [], especialistas: [] } };
  const comMarca = { ...semMarca, subclasse: "Bárbaro" };
  const b0 = bonusDePericia(semMarca, "intimidacao", 1), b1 = bonusDePericia(comMarca, "intimidacao", 1);
  t("o Bárbaro é treinado em Intimidação desde o nível 1", b0.nivelTreino === "nenhum" && b1.nivelTreino === "treinada" && b1.total > b0.total, `${b0.total} → ${b1.total}`);
  t("e só nela: Atletismo não muda", bonusDePericia(comMarca, "atletismo", 1).total === bonusDePericia(semMarca, "atletismo", 1).total);
  const jaTreinado = { ...comMarca, pericias: { treinadas: ["intimidacao"], especialistas: [] } };
  t("se já era treinado, fica especialista", bonusDePericia(jaTreinado, "intimidacao", 1).nivelTreino === "especialista");
  t("a marca diz a subclasse, a perícia e a frase", (() => { const m = marcaDe(comMarca); return m.subclasse === "Bárbaro" && m.pericia === "intimidacao" && m.diz.length > 0; })());
}

sec("§4 sem subclasse, nada muda");
{
  const p = { classe: "Mago", nivel: 3, pericias: { treinadas: [], especialistas: [] } };
  t("sem subclasse, nenhuma perícia muda", PERICIAS.every((x) => bonusDePericia(p, x.id, 0).nivelTreino === "nenhum"));
}

console.log(`\na marca da subclasse: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
