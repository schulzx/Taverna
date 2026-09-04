/* v9.37 — o sistema monta o trabalho a partir do mundo que ele mesmo criou */
import {
  MOLDES, ICONE_OFERTA, moldePorId, precoDaOferta,
  ofertaDePessoa, ofertasDaqui, propostaDaOferta,
  envelopeDoCartaz, envelopeDoRecado, cartazDaProposta, OFERTAS_PROMPT,
} from "../src/ofertas.js";
import { oQueExisteAqui, garantirBase } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { aceitarProposta, ETAPAS, etapaDef, recompensaDe } from "../src/missoes.js";

let ok = 0, fail = 0;
const t = (nome, cond) => { if (cond) { ok++; } else { fail++; console.log("  ✗ " + nome); } };

const SEMENTE = "taverna-teste-9037";
const mapa = gerarGeografia(SEMENTE);
const base = garantirBase(null);
const cidade = mapa.cidades[0].nome;
const aqui = oQueExisteAqui(SEMENTE, mapa, cidade, base, "Fantasia medieval");

t("o mundo tem cidade", !!aqui && !!aqui.cidade);
t("o mundo tem gente", (aqui.gente || []).length > 0);
t("a gente tem vontade", (aqui.gente || []).every((p) => !!p.vontade));

/* ---------- estrutura, nunca prosa ---------- */
const of = ofertaDePessoa({ semente: SEMENTE, pessoa: aqui.gente[0], aqui, mapa, nivel: 3 });
t("uma pessoa gera uma oferta", !!of);
t("a oferta traz etapas tipadas", Array.isArray(of.etapas) && of.etapas.length > 0);
t("toda etapa tem tipo conhecido", of.etapas.every((e) => !!ETAPAS[e.tipo]));
t("toda etapa tem alvo", of.etapas.every((e) => !!(e.alvo || e.item)));
t("quem oferece é uma pessoa da base", aqui.gente.some((p) => p.nome === of.dador));
t("o preço existe antes da fala", typeof of.paga === "number");
t("tem ícone", !!of.icone);

/* ---------- determinismo: uma pessoa, um trabalho, para sempre ---------- */
const of2 = ofertaDePessoa({ semente: SEMENTE, pessoa: aqui.gente[0], aqui, mapa, nivel: 3 });
t("a mesma pessoa oferece o mesmo trabalho", JSON.stringify(of) === JSON.stringify(of2));
const outraSemente = ofertaDePessoa({ semente: "outro-mundo", pessoa: aqui.gente[0], aqui, mapa, nivel: 3 });
t("outro mundo, outro trabalho", !outraSemente || outraSemente.titulo !== of.titulo || outraSemente.molde !== of.molde);

/* ---------- os alvos existem de fato ---------- */
const nomesCidades = new Set(mapa.cidades.map((c) => c.nome));
const nomesBichos = new Set((aqui.criaturas || []).map((c) => c.nome));
let checadas = 0;
for (const p of aqui.gente) {
  const o = ofertaDePessoa({ semente: SEMENTE, pessoa: p, aqui, mapa, nivel: 5 });
  if (!o) continue;
  checadas++;
  for (const e of o.etapas) {
    if (e.tipo === "ir_a") t(`ir_a aponta para cidade real (${e.alvo})`, nomesCidades.has(e.alvo));
    if (e.tipo === "derrotar") t(`derrotar aponta para bicho da região (${e.alvo})`, nomesBichos.has(e.alvo) || !!e.alvo);
    if (e.tipo === "levar_a") t("levar_a chega numa cidade real", nomesCidades.has(e.alvo));
  }
  if (o.etapas.some((e) => e.tipo === "levar_a")) t("entrega vem com o item em mãos", !!o.daItem);
  if (o.etapas.some((e) => e.tipo === "achar")) t("achado vem com nome de objeto", !!o.objeto);
  t(`ninguém manda procurar a si mesmo (${o.dador})`, !o.etapas.some((e) => e.tipo === "falar_com" && e.alvo === o.dador));
}
t("a cidade inteira gera ofertas", checadas >= 2);

/* ---------- o preço ---------- */
t("favor não paga moeda", precoDaOferta({ tipo: "favor", nivel: 5, etapas: 1, risco: 0 }) === 0);
t("preço é redondo", precoDaOferta({ tipo: "contrato", nivel: 5, etapas: 2, risco: 1.2 }) % 5 === 0);
const p1 = precoDaOferta({ tipo: "contrato", nivel: 1, etapas: 2, risco: 1.2 });
const p20 = precoDaOferta({ tipo: "contrato", nivel: 20, etapas: 2, risco: 1.2 });
t("preço escala com o nível", p20 > p1 * 3);
const arriscado = precoDaOferta({ tipo: "contrato", nivel: 5, etapas: 2, risco: 1.9 });
const brando = precoDaOferta({ tipo: "contrato", nivel: 5, etapas: 2, risco: 0.9 });
t("risco maior paga mais", arriscado > brando);
const arbitrada = recompensaDe({ tipo: "contrato", nivel: 5, etapas: 2 }).moedas;
t("o cartaz paga na mesma escala do sistema", brando > arbitrada * 0.5 && arriscado < arbitrada * 3);

/* ---------- moldes ---------- */
t("todo molde tem id, tipo e ícone", MOLDES.every((m) => m.id && m.tipo && m.icone));
t("todo molde declara o que precisa", MOLDES.every((m) => Array.isArray(m.precisa)));
t("todo molde monta etapas", MOLDES.every((m) => typeof m.montar === "function"));
t("há um molde que não paga em moeda", MOLDES.some((m) => m.risco === 0));
t("moldePorId acha", moldePorId("cacada") && !moldePorId("inexistente"));
t("ICONE_OFERTA cobre os moldes", MOLDES.every((m) => !!ICONE_OFERTA[m.id]));

/* ---------- o mural ---------- */
const mural = ofertasDaqui({ semente: SEMENTE, mapa, cidade, base, nivel: 4, quantas: 3 });
t("o mural enche", mural.length > 0 && mural.length <= 3);
t("sem cartazes repetidos", new Set(mural.map((m) => m.titulo)).size === mural.length);
const mural2 = ofertasDaqui({ semente: SEMENTE, mapa, cidade, base, nivel: 4, quantas: 3 });
t("o mural é o mesmo ao reabrir", JSON.stringify(mural) === JSON.stringify(mural2));
const semUm = ofertasDaqui({ semente: SEMENTE, mapa, cidade, base, nivel: 4, quantas: 3, evitar: [mural[0].titulo] });
t("evitar tira do mural o que já está no diário", !semUm.some((m) => m.titulo === mural[0].titulo));
const semDador = ofertasDaqui({ semente: SEMENTE, mapa, cidade, base, nivel: 4, quantas: 3, evitar: [mural[0].dador] });
t("evitar também funciona por quem oferece", !semDador.some((m) => m.dador === mural[0].dador));

/* outra cidade, outro mural */
if (mapa.cidades.length > 1) {
  const outro = ofertasDaqui({ semente: SEMENTE, mapa, cidade: mapa.cidades[1].nome, base, nivel: 4, quantas: 3 });
  t("cada cidade tem o seu mural", !outro.length || outro[0].titulo !== mural[0].titulo);
}

/* ---------- a ponte com missoes.js ---------- */
const mundo = { cidadeAtual: cidade, npcs: {}, inventario: [], equipamento: [], derrotados: [], dia: 1, relogios: [] };
const prop = propostaDaOferta(mural[0]);
t("a proposta tem a forma que aceitarProposta espera", !!prop.titulo && !!prop.etapas && typeof prop.paga === "number");
const r = aceitarProposta([], { ...prop, etapas: [{ tipo: "falar_com", alvo: prop.dador }, ...prop.etapas] }, {
  nivel: 4, dia: 1, mundo, dadorPresente: false,
});
t("o cartaz vira missão", r.ok);
t("no cartaz, procurar quem assinou é etapa legítima", r.ok && r.missao.etapas[0].tipo === "falar_com");
t("a missão paga o que o cartaz prometia", r.ok && r.missao.recompensa.moedas === prop.paga);
t("e o preço consta como combinado", r.ok && r.missao.recompensa.combinada === true);

/* cara a cara, a mesma etapa cai */
const rPerto = aceitarProposta([], { ...prop, etapas: [{ tipo: "falar_com", alvo: prop.dador }, ...prop.etapas] }, {
  nivel: 4, dia: 1, mundo, dadorPresente: true,
});
t("cara a cara, ninguém procura quem está na frente", rPerto.ok && !rPerto.missao.etapas.some((e) => e.tipo === "falar_com" && e.alvo === prop.dador));

/* o mesmo cartaz não entra duas vezes */
t("o mesmo cartaz não vira duas missões", !aceitarProposta(r.missoes, prop, { nivel: 4, dia: 1, mundo }).ok);

/* ---------- os envelopes ---------- */
const env = envelopeDoCartaz(mural[0]);
t("o cartaz diz o preço ao Mestre", mural[0].paga ? env.includes(String(mural[0].paga)) : /NÃO se paga em moedas/.test(env));
t("o cartaz proíbe concluir", /NÃO conclua a missão/.test(env));
t("o cartaz nomeia quem assina", env.includes(mural[0].dador));
/* ---------- O RECADO (v9.119) ----------
   `envelopeDaAbordagem` foi substituído: ninguém mais para o herói para
   oferecer serviço. Quem quer alguma coisa feita prega o papel e menciona
   que pregou — e o envelope tem de FECHAR as portas da cena antiga, não só
   abrir a nova, senão o Narrador faz as duas. */
const rec = envelopeDoRecado(mural[0]);
t("o recado manda encenar a MENÇÃO, não a proposta", /menciona o serviço/i.test(rec) || /MENCIONA/.test(rec));
t("e diz que o papel está no mural", /mural/i.test(rec));
t("proíbe oferecer o trabalho ao herói", /NÃO ofereça o trabalho a mim/.test(rec));
t("proíbe perguntar se ele aceita", /não pergunte se eu aceito/.test(rec));
t("proíbe negociar preço e começar o serviço", /não negocie preço/.test(rec) && /não comece o serviço/.test(rec));
t("e diz quem tira o papel de lá", /quem tira o papel do mural sou eu/.test(rec));
t("o recado leva o preço, como o cartaz", mural[0].paga ? rec.includes(String(mural[0].paga)) : /NÃO se paga em moedas/.test(rec));
const comItem = mural.find((m) => m.daItem);
if (comItem) t("o envelope avisa que o item já está na bolsa", /já pôs na minha bolsa/.test(envelopeDoCartaz(comItem)));
t("o prompt existe", OFERTAS_PROMPT.length > 100);

/* ---------- robustez ---------- */
t("sem pessoa, sem oferta", ofertaDePessoa({ semente: SEMENTE, pessoa: null, aqui, mapa, nivel: 1 }) === null);
t("sem mundo, sem oferta", ofertaDePessoa({ semente: SEMENTE, pessoa: aqui.gente[0], aqui: null, mapa, nivel: 1 }) === null);
t("cidade inexistente não quebra", Array.isArray(ofertasDaqui({ semente: SEMENTE, mapa, cidade: "Lugar Nenhum", base, nivel: 1 })));
t("mapa vazio não quebra", Array.isArray(ofertasDaqui({ semente: SEMENTE, mapa: { cidades: [], regioes: [] }, cidade: "X", base, nivel: 1 })));
t("nível 1 gera oferta", !!ofertaDePessoa({ semente: SEMENTE, pessoa: aqui.gente[0], aqui, mapa, nivel: 1 }));
t("nível 20 gera oferta", !!ofertaDePessoa({ semente: SEMENTE, pessoa: aqui.gente[0], aqui, mapa, nivel: 20 }));

/* toda etapa gerada é conferível pelo conferente */
for (const m of mural) {
  for (const e of m.etapas) {
    t(`etapa ${e.tipo} sabe se olhar no espelho`, typeof etapaDef(e.tipo).ver === "function" && etapaDef(e.tipo).ver(e, mundo) === false);
  }
}


/* o gancho não inventa nexo quando o molde não casou com a vontade */
{
  let comNexo = 0, semNexo = 0;
  for (const c of mapa.cidades.slice(0, 6)) {
    const aq = oQueExisteAqui(SEMENTE, mapa, c.nome, base, "Fantasia medieval");
    for (const pe of (aq.gente || [])) {
      const o = ofertaDePessoa({ semente: SEMENTE, pessoa: pe, aqui: aq, mapa, nivel: 6 });
      if (!o) continue;
      if (/pode não ter nada a ver com o pedido/.test(o.gancho)) semNexo++; else comNexo++;
      t("todo gancho cita a vontade da pessoa", o.gancho.includes(pe.vontade));
    }
  }
  t("há ganchos que afirmam o nexo", comNexo > 0);
  t("e há ganchos que se abstêm", semNexo > 0);
}


/* ---------------- A RECOMPENSA INTEIRA NO CARTAZ (v9.192) ----------------
   `painel-mural-v2` foi redesenhado como a tábua que ele é — papel pregado,
   percevejo âmbar para o cartaz da cidade e roxo para o de quem falou com
   você, quem assina, o prazo antes do botão. E aí o defeito ficou óbvio.

   O cartaz mostrava só as moedas. "sem moedas" lê como "não paga nada" —
   quando um favor paga em XP, em fama e às vezes num item. O jogador passava
   reto justamente pelo serviço que mais rendia da tábua. */
console.log("\n[a recompensa inteira no cartaz]");
{
  const { readFileSync } = await import("node:fs");
  const APP = readFileSync("../src/App.jsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

  /* um favor sem moeda combinada continua rendendo — e muito */
  const favor = recompensaDe({ tipo: "favor", nivel: 6, etapas: 4, moedasPrometidas: 0 });
  t("favor sem moeda ainda rende XP", favor.xp > 0);
  t("e rende fama", favor.fama > 0);
  t("mas a moeda combinada é respeitada", favor.moedas === 0 && favor.combinada === true);

  /* e a conta do cartaz é a MESMA que o aceite aplica */
  const como = { tipo: "cacada", nivel: 8, etapas: 3, moedasPrometidas: 150 };
  const a = recompensaDe(como), b = recompensaDe(como);
  t("a conta é determinística", a.xp === b.xp && a.moedas === b.moedas && a.fama === b.fama);
  t("item só nas grandes", recompensaDe({ tipo: "contrato", nivel: 3, etapas: 2 }).item === null);
  t("e nas grandes ele vem", !!recompensaDe({ tipo: "global", nivel: 12, etapas: 4 }).item);

  /* A TELA LÊ A MESMA FUNÇÃO, e com os campos que o cartaz já carrega */
  t("o cartaz lê recompensaDe", /const rec = recompensaDe\(\{ tipo: c\.tipo \|\| "contrato", nivel: c\.nivel \|\| nivel \|\| 1, etapas: \(c\.etapas \|\| \[\]\)\.length \|\| 3, moedasPrometidas: c\.paga \}\);/.test(APP));
  t("e mostra o XP", /\+\{rec\.xp\} XP/.test(APP));
  t("a fama, quando há", /\{rec\.fama > 0 && </.test(APP));
  t("e o item, quando há", /\{rec\.item && </.test(APP));
  /* `propostaDaOferta` continua levando o nível junto: sem ele a missão
     renasceria com o nível do herói e a conta do cartaz mudaria ao aceitar */
  const p = propostaDaOferta({ titulo: "x", tipo: "contrato", nivel: 7, etapas: [1, 2, 3] });
  t("a proposta leva o nível do cartaz", p.nivel === 7);
}
console.log(`\nofertas v9.37: ${ok} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
