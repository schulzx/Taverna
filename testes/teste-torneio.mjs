/* O TORNEIO (v9.216) — a chave de oito

   A leitura honesta do battle royale: o campo encolhe até sobrar um.
   Esta suíte guarda as leis do prato: a chave é sorteada pela semente e
   sempre com os oito; as lutas fora de tela correm por simulação e viram
   rumor com nome de gente; a eliminação do jogador tem epílogo; e a
   chave inteira, sem jogador nenhum, SEMPRE termina — com o MESMO
   campeão para a mesma semente. */

const RAIZ = "../src/";
const T = await import(RAIZ + "torneio.js");
const P = await import(RAIZ + "prontos.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1. a chave nasce certa");
{
  const x = T.criarTorneio({ semente: "abre", meuPronto: "voz" });
  t("quatro lutas de quartas", x.lutas.length === 4 && x.fase === 0);
  t("os OITO do roster, cada um uma vez", (() => { const ids = x.lutas.flatMap((l) => [l.a, l.b]); return ids.length === 8 && new Set(ids).size === 8 && P.PRONTOS.every((p) => ids.includes(p.id)); })());
  t("o jogador está na chave", x.lutas.some((l) => l.a === "voz" || l.b === "voz"));
  t("a mesma semente sorteia a mesma chave", JSON.stringify(T.criarTorneio({ semente: "abre", meuPronto: "voz" })) === JSON.stringify(x));
  t("sementes diferentes sorteiam chaves diferentes", JSON.stringify(T.criarTorneio({ semente: "outra", meuPronto: "voz" }).lutas) !== JSON.stringify(x.lutas));
  t("pronto inválido cai no primeiro do roster", T.criarTorneio({ meuPronto: "ninguem" }).meu === P.PRONTOS[0].id);
  t("garantirTorneio saneia e rejeita lixo", T.garantirTorneio(null) === null && T.garantirTorneio({ lutas: [{ a: "x", b: "y" }] }) === null);
}

sec("2. as chaves que correm sozinhas");
{
  const x = T.criarTorneio({ semente: "sozinha", meuPronto: "punho" });
  const { torneio: x2, rumores } = T.correrForaDeTela(x);
  t("as três lutas alheias resolvem; a minha fica", x2.lutas.filter((l) => l.vencedor).length === 3 && T.minhaLuta(x2));
  t("cada rumor cita nomes de guerra reais", rumores.length === 3 && rumores.every((r) => P.PRONTOS.filter((p) => r.includes(p.nome)).length >= 2));
  t("o placar fala pela boca de quem venceu (2×algo)", rumores.every((r) => /\(2×[01]\)/.test(r)));
  t("correr de novo não re-simula o resolvido", JSON.stringify(T.correrForaDeTela(x2).torneio.lutas) === JSON.stringify(x2.lutas));
  t("o rival da vez tem nome, papel e índole na provocação", /índole/.test(T.provocacaoDoRival(x2)) && T.meuRival(x2));
}

sec("3. a minha luta só se registra — a mesa é que luta");
{
  let x = T.criarTorneio({ semente: "minha", meuPronto: "sombra" });
  x = T.correrForaDeTela(x).torneio;
  const venci = T.registrarMinhaLuta(x, true);
  t("vitória me põe na chave seguinte", T.faseCompleta(venci) && T.avancarFase(venci).lutas.some((l) => l.a === "sombra" || l.b === "sombra"));
  const cai = T.registrarMinhaLuta(x, false);
  t("derrota marca onde caí", cai.eliminadoEm === "quartas" && !T.minhaLuta(cai));
  t("a fase avança 4 → 2 → 1", (() => { const s = T.avancarFase(venci); return s.fase === 1 && s.lutas.length === 2; })());
}

sec("4. o campo encolhe até sobrar um");
{
  const a = T.simularTorneioInteiro("fim");
  const b = T.simularTorneioInteiro("fim");
  t("a chave inteira sem jogador SEMPRE termina", !!a.campeao);
  t("o campeão é o mesmo para a mesma semente", a.campeao === b.campeao);
  t("o histórico guarda as três fases", a.historico.length === 3 && a.historico.map((h) => h.fase).join(",") === "quartas,semifinal,final");
  t("sementes diferentes coroam campeões diferentes (alguma vez)", new Set(["f1", "f2", "f3", "f4", "f5", "f6"].map((s) => T.simularTorneioInteiro(s).campeao)).size >= 2);
  /* eliminado tem epílogo: a chave corre sem mim e alguém leva o cinto */
  let x = T.criarTorneio({ semente: "epilogo", meuPronto: "voto" });
  x = T.registrarMinhaLuta(T.correrForaDeTela(x).torneio, false);
  const ep = T.epilogar(T.avancarFase(x));
  t("caí, e mesmo assim alguém levanta o cinto", !!ep.torneio.campeao && ep.torneio.campeao !== "voto");
}

sec("5. para a tela e para o Narrador");
{
  const x = T.criarTorneio({ semente: "tela", meuPronto: "flecha" });
  t("o envelope mostra a chave inteira, com fase", /O TORNEIO — quartas/.test(T.envelopeDaChave(x)) && x.lutas.every((l) => T.envelopeDaChave(x).includes(P.prontoPorId(l.a).nome)));
  t("resumoDoTorneio condensa para o autor", (() => { const r = T.resumoDoTorneio(x); return r.fase === "quartas" && r.vivo === true; })());
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
