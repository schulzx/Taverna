/* UM VILÃO SÓ (Fase MM, o laço da história, 11/10) — a 5.ª sessão de prova

   A 5.ª sessão contou quatro candidatos a vilão no mesmo prompt
   (mente/mm11-sessao-5.md, "5c. um vilão só" e coerência 7): o fio da
   espinha era "Dragão Jovem a Mão Fria"; a lista de CHEFES dizia "Golem de
   Pedra a Mão Fria — LINHA PRINCIPAL" (a mesma vaga, sorteada outra vez com
   um Léxico que proíbe dragões e que a espinha não tinha ao nascer); o ato 1
   prometia "Dragão Jovem a Viúva de Ferro" e a lista "Elemental Menor a
   Viúva de Ferro"; e cada um dos seis chefes trazia o seu querer próprio.

   O que esta suíte prova (mundo-base.js#resumoChefesPrompt):
     1. a sessão reconstruída — 24 campanhas de verdade, a espinha nascida
        sem o Léxico e a lista feita com ele: o topo da lista é o
        antagonista do fio em 24 de 24 (era o que o sorteio desse), e as
        vontades de vilão no prompt caem de 4–6 para 1;
     2. os secundários são dele: dizem a quem servem (uma vez), não trazem
        querer próprio, e o nome que a espinha já prometeu num marco é o
        nome deles;
     3. o teto: a lista com a espinha nunca é mais longa do que a de antes;
     4. sem espinha, com o fio cumprido ou com o antagonista morto: a lista
        de sempre, byte a byte (regressão zero);
     5. lixo, determinismo.

   FALHA em HEAD (v9.398): `resumoChefesPrompt` ignora a espinha — o topo
   é o "LINHA PRINCIPAL" do sorteio, e cada chefe traz o seu querer. */

const SG = await import("../src/saga.js");
const R = await import("../src/regiao.js");
const MB = await import("../src/mundo-base.js");
const { ESTRUTURAS } = await import("../src/historia.js");
const { moldePorId } = await import("../src/moldes.js");
const { sementeDe, generoDe } = await import("./medir-regiao.mjs");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d) => { try { return f(); } catch { return d; } };
const J = (v) => JSON.stringify(v);

/* uma campanha: o mapa da criação, a espinha estendida (sem Léxico, como
   nasceu a da sessão), amarrada na região */
function campanha(i) {
  const semente = sementeDe(i), genero = generoDe(i), estrutura = ESTRUTURAS[i % ESTRUTURAS.length].id, molde = moldePorId("sobremundo");
  const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero, estrutura, modo: "historia" }));
  let esp = SG.estenderEspinha({ semente, mapa, genero, molde, estrutura, cidadeInicial: mapa.cidades[0].nome });
  if (mapa.regiao) esp = R.espinhaNaRegiao(mapa, esp, { semente, genero, molde });
  return { semente, genero, mapa, esp };
}
const N = 24;
const CAMPANHAS = Array.from({ length: N }, (_, i) => campanha(i));
/* as vontades de vilão no texto: cada chefe cujo querer próprio lá está */
/* um chefe por segmento (" || "); conta o segmento que traz um querer */
const vontades = (txt, c, lex) => {
  const quereres = [...MB.chefesDoMundo(c.semente, c.mapa, c.genero, lex).map((x) => x.motivo), c.esp.fio && c.esp.fio.motivo].filter(Boolean);
  return (txt.split("NÃO invente outros): ")[1] || "").split(" || ").filter((seg) => quereres.some((q) => seg.includes(`; ${q}`))).length;
};
const topo = (txt) => (txt.split("NÃO invente outros): ")[1] || "").split(" — ")[0];

sec("1. a sessão reconstruída: um vilão só");
{
  let topoAntes = 0, topoDepois = 0, vAntes = [], vDepois = [], lexDiferente = 0;
  for (const c of CAMPANHAS) {
    /* o Léxico da sessão: a espécie do fio não existe neste mundo */
    const especie = (c.esp.fio && c.esp.fio.especie) || "";
    const lex = especie ? { gerado: true, naoExiste: [especie] } : null;
    const antes = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, lex);
    const depois = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, lex, { espinha: c.esp });
    if (topo(antes) !== c.esp.fio.antagonista) lexDiferente++;
    if (topo(antes) === c.esp.fio.antagonista) topoAntes++;
    if (topo(depois) === c.esp.fio.antagonista) topoDepois++;
    vAntes.push(vontades(antes, c, lex)); vDepois.push(vontades(depois, c, lex));
  }
  console.log(`      topo = antagonista do fio: ${topoAntes} → ${topoDepois} de ${N} · vontades de vilão por prompt: ${Math.min(...vAntes)}–${Math.max(...vAntes)} → ${Math.min(...vDepois)}–${Math.max(...vDepois)}`);
  t("o defeito existe no sorteio: com o Léxico, o topo da lista não é o do fio em quase todas", lexDiferente >= N / 2, `${lexDiferente} de ${N}`);
  t(`com a espinha, o topo é o antagonista do fio em ${N} de ${N}`, topoDepois === N, `${topoDepois}`);
  t("antes, cada prompt trazia 4 a 6 vontades de vilão", Math.min(...vAntes) >= 4);
  t("depois, uma só — a do fio", vDepois.every((v) => v === 1), J(vDepois));
}

sec("2. os outros servem-no");
{
  const c = CAMPANHAS[0];
  const txt = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: c.esp });
  t("o topo diz que é o antagonista, e o único (tabela UM_VILAO_SO)", txt.includes(`${c.esp.fio.antagonista} — ${MB.UM_VILAO_SO.principal}`));
  t("os secundários vêm depois de \"os que o servem\", uma vez", txt.split(MB.UM_VILAO_SO.servos).length === 2);
  t("nenhum diz \"LINHA PRINCIPAL\" nem \"secundário\"", !/LINHA PRINCIPAL|secundário/.test(txt));
  const cs = MB.chefesDoMundo(c.semente, c.mapa, c.genero);
  t("o \"LINHA PRINCIPAL\" do sorteio não aparece com outro nome ao lado do fio", cs[0].nome === c.esp.fio.antagonista || !txt.includes(cs[0].nome));
  /* o ato 1 da sessão: a espinha promete "Dragão Jovem a Viúva de Ferro"
     e a lista sortearia "Elemental Menor a Viúva de Ferro" */
  const sec2 = cs.find((x) => x.linha !== "principal" && !x.nome.includes(", "));
  if (sec2) {
    const titulo = sec2.nome.slice(sec2.especie.length).trim();
    const prometido = `${/drag/i.test(sec2.especie) ? "Elemental Menor" : "Dragão Jovem"} ${titulo}`;
    const esp = { ...c.esp, atos: [...c.esp.atos, { ato: 9, marcos: [{ id: "x", feitio: "enfrentar", alvo: prometido, titulo: `Acabar com ${prometido}`, condicao: { tipo: "derrotar", alvo: prometido } }] }] };
    const t2 = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: esp });
    t(`o secundário que a espinha prometeu tem o nome dela ("${prometido}")`, t2.includes(prometido) && !t2.includes(sec2.nome), sec2.nome);
  } else t("(nenhum secundário sem nome próprio nesta campanha)", true);
}

sec("3. o teto");
{
  let maior = 0, pior = 0;
  for (const c of CAMPANHAS) {
    const a = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero).length;
    const b = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: c.esp }).length;
    if (b > a) maior++;
    pior = Math.max(pior, b - a);
  }
  t(`a lista com a espinha nunca é mais longa (${maior} de ${N} mais longas; pior diferença ${pior})`, maior === 0);
}

sec("4. regressão zero");
{
  const c = CAMPANHAS[1];
  const sem = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero);
  t("sem opções: a lista de sempre (LINHA PRINCIPAL)", /LINHA PRINCIPAL/.test(sem));
  t("espinha sem fio: a lista de sempre", MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: { ...c.esp, fio: undefined } }) === sem);
  const cumprida = { ...c.esp, atos: c.esp.atos.map((a) => ({ ...a, marcos: a.marcos.map((m) => (m.feitio === "confronto" ? { ...m, feito: true } : m)) })) };
  t("confronto cumprido: a lista de sempre", MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: cumprida }) === sem);
  const base = { mortos: [c.esp.fio.antagonista] };
  t("antagonista morto: o fio já não manda na lista", !MB.resumoChefesPrompt(c.semente, c.mapa, base, c.genero, null, { espinha: c.esp }).includes(MB.UM_VILAO_SO.principal));
}

sec("5. lixo, determinismo");
{
  const c = CAMPANHAS[2];
  const sem = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero);
  for (const lixo of [null, 3, "x", {}, { espinha: null }, { espinha: { fio: { antagonista: "" } } }, { espinha: { fio: { antagonista: "X" }, atos: "y" } }]) {
    const r = tenta(() => MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, lixo), "estourou");
    t(`opções lixo (${J(lixo).slice(0, 40)}) não estoura`, typeof r === "string" && r !== "estourou");
  }
  const um = MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: c.esp });
  t("a mesma espinha dá a mesma lista", um === MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: c.esp }));
  const copia = J(c.esp); MB.resumoChefesPrompt(c.semente, c.mapa, null, c.genero, null, { espinha: c.esp });
  t("a espinha não é mutada", J(c.esp) === copia && sem.length > 0);
}

console.log(`\num vilão só: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
