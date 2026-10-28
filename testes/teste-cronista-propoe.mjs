/* teste-cronista-propoe.mjs (Fase T1, trilha B · 27/10) — o Cronista
   propõe, o motor decide

   A auditoria do motor (mente/auditoria-do-motor.md, §2, a linha do
   Cronista; §7.3): "é o único sítio onde a IA ainda decide estado: lugar,
   quem entrou no grupo, mortes narradas, devoção e a paga de uma missão.
   O eco da 11.ª saiu daqui." `src/motor/cronista.js` passa a julgar a
   proposta contra o estado, por uma tabela (O_QUE_O_CRONISTA_PODE).

   O que esta suíte prova:
     1. a tabela cobre toda secção que o App pede ao Cronista;
     2. cada regra, uma a uma (o lugar, a morte, o pagamento, o grupo, a
        fé, a gente, os fatos ditos, o evento global);
     3. CONTRA OS REGISTOS REAIS (8.ª–10.ª): o que o Cronista registou e
        era certo continua a entrar (recall ≥ 95%, pelo efeito);
     4. CONTRA OS ERROS DOCUMENTADOS (a 11.ª e as anteriores): o eco, os
        quatro fios, o pagamento, a viagem fantasma, o herói como NPC —
        o que entrava errado passa a ser recusado ou marcado;
     5. lixo, determinismo, imutabilidade.

   O QUE OS REGISTOS NÃO GUARDAM, e por isso foi reconstruído: os
   registos (`registo-s8-s10-cronista.json`) não têm o JSON cru do
   Cronista — têm a narração, o que o registo conhecia antes e depois, e as
   secções que trouxeram coisa nova (`util`). A proposta de cada turno é
   refeita disso: os nomes novos no registo seguinte (pessoa, cânone), o
   lugar da pauta seguinte (só a 10.ª tem pautas: `registo-s10-cena.json`).
   As promessas (33 turnos) não têm texto no registo e não entram na conta
   do recall. Os casos errados da secção 4 são reconstruídos das citações
   de `mente/mm11-sessao-11.md` (e de onde cada um diz).

   FALHA em HEAD de 27/10 (v9.478): `src/motor/cronista.js` não existe. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

let C = null;
try { C = await import("../src/motor/cronista.js"); } catch (e) { console.log("  (o módulo não carrega: " + e.message + ")"); }
if (!C) { t("src/motor/cronista.js existe e carrega", false); console.log(`\ncronista-propoe: ${ok} passaram, ${mal + 1} falharam`); process.exit(1); }
const P = await import("../src/prometido.js");
const OF = await import("../src/ofertas.js");
const { julgarOCronista: julgar, O_QUE_O_CRONISTA_PODE: PODE, TABELA_DA_FE, feDaTabela, soNaFala, ditoNaFala } = C;

/* ============================================================ */
sec("1. A TABELA COBRE TODA SECÇÃO QUE O APP PEDE AO CRONISTA");
{
  /* lido do prompt do Cronista no App (`cronistaDoTurno`) e da secção das
     promessas (`prometido.js#SECAO_DO_CRONISTA`): uma secção nova sem
     linha na tabela é um canal da IA para o estado sem regra. Quando o
     prompt sair do App (Fase 2 do plano), esta leitura muda de sítio. */
  const APP = fs.readFileSync("../src/App.jsx", "utf8");
  const i0 = APP.indexOf("const cronistaDoTurno = async");
  const corpo = i0 >= 0 ? APP.slice(i0, APP.indexOf('].join("\\n");', i0)) : "";
  t("achei o prompt do Cronista no App", corpo.length > 2000);
  const secoes = new Set([...corpo.matchAll(/SEÇÃO (\w+)/g), ...P.SECAO_DO_CRONISTA.matchAll(/SEÇÃO (\w+)/g)].map((m) => m[1]));
  /* a secção do pedido → a linha da tabela que a rege */
  const LINHA = { lugar: "lugar", missoes: "global", canone: "canone", pessoas: "gente", fe: "fe", grupo: "grupo", teste_sugerido: "teste_sugerido", combate: "morte", missao_oferecida: "missao_oferecida", relogio_novo: "relogio_novo", falou_com: "falou_com", promessas: "promessas", promessas_pagas: "promessas_pagas" };
  const semLinha = [...secoes].filter((s) => !LINHA[s] || !PODE[LINHA[s]]);
  t(`as ${secoes.size} secções do pedido têm linha na tabela`, secoes.size >= 12 && semLinha.length === 0, semLinha.join(","));
  t("o pagamento tem linha própria (a paga da missão sai da tabela)", PODE.pagamento.quem === "tabela");
  const QUEM = ["sistema", "tabela", "porta", "cronista", "dito", "depois"];
  const tortas = Object.entries(PODE).filter(([, v]) => !QUEM.includes(v.quem) || typeof v.porque !== "string" || v.porque.length < 20).map(([k]) => k);
  t("toda linha diz quem decide e por quê", tortas.length === 0, tortas.join(","));
  /* `onde` é "arquivo:função" (não "arquivo#função": o "#ace" de
     "relogios.js#aceitarProposta" é uma cor para o varredor das formas) */
  const ondes = Object.values(PODE).filter((v) => v.onde).map((v) => v.onde);
  t("o que é \"depois\" diz onde se valida", Object.values(PODE).filter((v) => v.quem === "depois").every((v) => /^[a-z-]+\.js:\w+$/.test(v.onde)));
  const ondeFalso = ondes.filter((o) => { const [arq, fn] = o.split(":"); const f = "../src/" + arq; return !fs.existsSync(f) || !new RegExp(`export (?:function|const) ${fn}\\b`).test(fs.readFileSync(f, "utf8")); });
  t(`e cada «onde» é um export que existe (${ondes.length})`, ondes.length >= 7 && ondeFalso.length === 0, ondeFalso.join(","));
  t("as decisões de estado da auditoria são todas do sistema, da tabela ou da porta",
    ["lugar", "morte", "pagamento", "grupo", "fe"].every((k) => ["sistema", "tabela", "porta"].includes(PODE[k].quem)));
  t("gente nova é do Cronista (é o papel dele)", PODE.gente.quem === "cronista");
}

/* ============================================================ */
sec("2. AS REGRAS, UMA A UMA");
const MAPA = { cidades: [{ nome: "Bela do Rio", populacao: 4000 }, { nome: "Alto das Pedras", populacao: 900 }] };
const BASE = Object.freeze({
  personagem: { nome: "Quirino Vasco", nivel: 3, grupo: [{ nome: "Gualtério" }] },
  cidadeAtual: "Bela do Rio", lugar: null, mapa: MAPA,
  npcs: { "Berengária Passo Largo": { nome: "Berengária Passo Largo" }, "Beraldo Pau Seco": { nome: "Beraldo Pau Seco" } },
  divindade: { despertar: true },
});
{
  /* o lugar */
  const L = (dito, est = {}, ctx = {}) => julgar({ ...BASE, ...est }, { lugar: dito }, ctx);
  t("um sítio nomeado entra (a régua do lugar diz «novo»)", L("o Escudo Rachado").aceito.lugar === "o Escudo Rachado");
  t("outra cidade do mapa NÃO: mudar de cidade é viagem", !L("Alto das Pedras").aceito.lugar && L("Alto das Pedras").recusado[0].porque === "outraCidade");
  t("…nem «a estalagem em Alto das Pedras»", L("a estalagem em Alto das Pedras").recusado.some((r) => r.porque === "outraCidade"));
  t("…mas «uma estalagem em Bela do Rio» (a cidade onde está) entra", L("uma estalagem em Bela do Rio").aceito.lugar === "uma estalagem em Bela do Rio");
  t("na luta o lugar é do sistema: ignorado", !L("a ponte", { combate: { inimigos: [{ nome: "Lobo", vida: 3 }] } }).aceito.lugar);
  t("«cidade» sem lugar registado: nada a mudar (não é aceito, não acusa)", !L("cidade").aceito.lugar && L("cidade").recusado[0].acao === "nada");
  t("lixo no lugar não é lugar", !("lugar" in julgar(BASE, { lugar: 42 }).aceito) && !("lugar" in julgar(BASE, { lugar: null }).aceito));

  /* a morte */
  const luta = { combate: { inimigos: [{ nome: "Lobo Sarnento", vida: 4 }, { nome: "Batedor", vida: 0, derrotado: true }] } };
  const M = (nomes, est = luta, ctx = {}) => julgar({ ...BASE, ...est }, { combate: { mortes_narradas: nomes } }, ctx);
  t("o lobo de pé (4 PV) não morre pela prosa", M(["Lobo Sarnento"]).aceito.combate.mortes_narradas.length === 0 && M(["Lobo Sarnento"]).recusado[0].porque === "vivo" && M(["Lobo Sarnento"]).recusado[0].vida === 4);
  t("o batedor derrotado pelo sistema: a morte é confirmada", J(M(["batedor"]).aceito.combate.mortes_narradas) === J(["Batedor"]));
  t("quem não está na luta não morre pela prosa", M(["Berengária Passo Largo"]).recusado[0].porque === "foraDaLuta");
  t("…a não ser que o envelope do sistema deste turno o diga", J(M(["Berengária Passo Largo"], {}, { envelopes: ["[MORTE — DECLARADA PELO SISTEMA] Berengária Passo Largo cai e não se levanta."] }).aceito.combate.mortes_narradas) === J(["Berengária Passo Largo"]));

  /* o pagamento */
  const of = { titulo: "Levar a carta de Perrin", tipo: "favor", dador: "Perrin", etapas: [{ tipo: "levar_a", alvo: "Ponto Rasa", item: "carta" }] };
  const tabela = OF.precoDaOferta({ tipo: "favor", nivel: 3, etapas: 1, risco: PODE.pagamento.risco });
  const m45 = julgar(BASE, { missao_oferecida: { ...of, paga: 45 } });
  t(`a paga escrita pela IA (45) dá lugar à da tabela (${tabela})`, m45.aceito.missao_oferecida.paga === tabela && tabela !== 45);
  t("…e fica registada como recusa, com o número dos dois", m45.recusado.some((r) => r.secao === "pagamento" && r.o === 45 && r.vale === tabela));
  t("sem número, a tabela também (e não é recusa)", julgar(BASE, { missao_oferecida: { ...of, paga: null } }).aceito.missao_oferecida.paga === tabela && julgar(BASE, { missao_oferecida: { ...of, paga: null } }).recusado.length === 0);
  t("«paga: 0» é classificação (o combinado não é dinheiro): fica 0", julgar(BASE, { missao_oferecida: { ...of, paga: 0 } }).aceito.missao_oferecida.paga === 0);
  t("o cartaz do sistema monta com a paga da tabela", (OF.cartazDaProposta(m45.aceito.missao_oferecida, { cidade: "Bela do Rio", nivel: 3 }) || {}).paga === tabela);
  t("sem título não há missão", !("missao_oferecida" in julgar(BASE, { missao_oferecida: { paga: 30 } }).aceito));

  /* o grupo */
  const G = (nomes, ctx = {}, est = {}) => julgar({ ...BASE, ...est }, { grupo: { entraram: nomes } }, ctx);
  t("«vou com você» na prosa não põe ninguém no grupo sem a porta", G(["Beraldo Pau Seco"]).aceito.grupo.entraram.length === 0 && G(["Beraldo Pau Seco"]).recusado[0].porque === "semPorta");
  t("com a porta (o convite que o sistema aceitaria), entra", J(G(["Beraldo Pau Seco"], { aceitariam: ["beraldo pau seco"] }).aceito.grupo.entraram) === J(["Beraldo Pau Seco"]));
  t("quem não está no registo não entra", G(["Zé Ninguém"], { aceitariam: ["Zé Ninguém"] }).recusado[0].porque === "desconhecido");
  t("quem já anda com ele: nada a fazer", G(["Gualtério"]).recusado[0].porque === "jaNoGrupo");
  t("o herói não entra no próprio grupo", G(["Quirino Vasco"]).recusado[0].porque === "heroi");
  const cheio = { personagem: { ...BASE.personagem, grupo: Array.from({ length: PODE.grupo.max }, (_, i) => ({ nome: "C" + i })) } };
  t(`grupo cheio (${PODE.grupo.max}): não entra`, G(["Beraldo Pau Seco"], { aceitariam: ["Beraldo Pau Seco"] }, cheio).recusado[0].porque === "cheio");

  /* a fé */
  const F = (fe, est = {}) => julgar({ ...BASE, ...est }, { fe });
  const g = feDaTabela("gesto", "Bela do Rio", MAPA);
  t(`o gesto comum sai da tabela (${g.fieis} fiéis, ${g.pf} PF), não dos 300 da IA`, F({ fieis: 300, pf: 5 }).aceito.fe[0].fieis === g.fieis && F({ fieis: 300, pf: 5 }).recusado[0].porque === "numero");
  t("a conta é a da tabela: fixo + fração da população", g.fieis === Math.round(TABELA_DA_FE.gesto.fixo + 4000 * TABELA_DA_FE.gesto.frac) && g.pf === TABELA_DA_FE.gesto.pf);
  const lib = F({ acontecimento: { tipo: "libertacao", local: "Bela do Rio" } }).aceito.fe[0];
  t("o grande acontecimento: a tabela sobre a população do lugar", lib.fieis === Math.round(4000 * TABELA_DA_FE.libertacao.frac) && lib.pf === TABELA_DA_FE.libertacao.pf && lib.local === "Bela do Rio");
  t("acontecimento fora da tabela: recusado", F({ acontecimento: { tipo: "apoteose" } }).recusado[0].porque === "tipo");
  t("sem a fé desperta, nada", F({ fieis: 50 }, { divindade: null }).recusado[0].porque === "semFe" && !("fe" in F({ fieis: 50 }, { divindade: null }).aceito));
  t("o mínimo e o teto da tabela aparam", feDaTabela("pregacao", "lugar nenhum", MAPA).fieis === TABELA_DA_FE.minimo && feDaTabela("alianca_reino", "X", { cidades: [{ nome: "X", populacao: 1e9 }] }).fieis === TABELA_DA_FE.teto);
  t("fé zero não é sinal", !("fe" in F({ fieis: 0, pf: 0 }).aceito) && F({ fieis: 0, pf: 0 }).recusado.length === 0);

  /* a gente */
  const pe = julgar(BASE, { pessoas: [{ nome: "Venceslau", papel: "taverneiro d'A Coroa Torta", genero: "homem", local: "Bela do Rio" }, { nome: "Quirino Vasco", papel: "bardo" }, { nome: "" }] }, { narrativa: "Venceslau enxuga a caneca e olha para você." });
  t("gente nova entra, com o gênero e o ofício (homem → ele)", pe.aceito.pessoas.length === 1 && pe.aceito.pessoas[0].genero === "ele" && pe.aceito.pessoas[0].papel.startsWith("taverneiro") && pe.aceito.pessoas[0].local === "Bela do Rio");
  t("o herói não é NPC (a Tamsin da 6.ª)", pe.recusado.some((r) => r.porque === "heroi"));
  t("gênero que a prosa não diz fica vazio (nunca chute)", julgar(BASE, { pessoas: [{ nome: "Ulrico", genero: "talvez" }] }).aceito.pessoas[0].genero === "");
  t("quem diz o próprio nome está ali (\"Sou Wystan\")", !julgar(BASE, { pessoas: [{ nome: "Wystan", local: "Bela do Rio" }] }, { narrativa: "O velho ergue o queixo. \"Sou Wystan, e esta porta é minha.\"" }).aceito.pessoas[0].dito);

  /* os fatos ditos */
  t("a promessa com quem a disse é palavra dela", julgar(BASE, { promessas: [{ tipo: "ameaca", texto: "volto com os meus", quem: "Tristão" }] }).aceito.promessas[0].dito === "Tristão");
  t("o objeto não é fala (o «quem» carrega)", !julgar(BASE, { promessas: [{ tipo: "objeto", texto: "o caderno com o prego dobrado", quem: "Beraldo Pau Seco" }] }).aceito.promessas[0].dito);
  t("o herói prometer não é «dito por outro»", !julgar(BASE, { promessas: [{ tipo: "frase", texto: "volto antes da lua cheia", quem: "Quirino Vasco" }] }).aceito.promessas[0].dito);
  t("sem «quem», a frase que mora numa fala é dita", ditoNaFala("a corda de forca apodrece se pegar a chuva", "O guarda cospe. \"A corda de forca apodrece se pegar a chuva.\" E fecha a porta."));
  t("…e a que mora na narração não é", !ditoNaFala("a corda de forca apodrece na chuva", "A corda de forca apodrece na chuva, junto ao valo. \"Anda logo\", diz o guarda."));
  t("soNaFala: só na fala", soNaFala("Clarissa", "\"Quem manda é a Clarissa\", diz ele.") && !soNaFala("Clarissa", "Clarissa entra. \"Sou eu\", diz.") && !soNaFala("Clarissa", "Ninguém fala dela."));
  t("as aspas simples da 9.ª e o travessão da 10.ª também são fala", soNaFala("Tomas", "Ela aponta: 'Mas Tomas não atende antes do meio-dia.' E sai.") && soNaFala("Fiandeira", "O velho ri.\n— Antes que o diabo da Fiandeira lave a ponte.\nE cospe."));
  const linha = (() => {
    let e = P.guardarSementes(null, julgar(BASE, { promessas: [{ tipo: "ameaca", texto: "devolve na saída ou perde as orelhas", quem: "Branca Pau Seco" }] }).aceito.promessas).estado;
    for (let i = 0; i < 6; i++) { const r = P.cobrarNoTurno(e, { pedido: { doJogador: true } }); e = r.estado; if (r.linha) return r.linha; }
    return "";
  })();
  t("no Livro de Promessas, a volta diz «dito por…, não fato» e não pede ao mundo que a cumpra", linha.includes("dito por Branca Pau Seco, não fato") && linha.includes(P.VOLTA_DO_DITO) && !linha.includes("a ameaça dá um passo concreto"), linha);
  t("a semente sem «dito» continua como era (o save de antes não muda)", !("dito" in P.guardarSementes(null, [{ tipo: "frase", texto: "o rio guarda um segredo antigo" }]).estado.sementes[0]));

  /* o evento global */
  const ev = (etapa) => ({ eventos: { global: { nome: "A Peste Cinzenta", etapas: ["a", "b", "c"], etapa } } });
  t("o evento global não acaba antes da última etapa", julgar({ ...BASE, ...ev(1) }, { missoes: { global_encerrado: true } }).aceito.missoes.global_encerrado === false && julgar({ ...BASE, ...ev(1) }, { missoes: { global_encerrado: true } }).recusado[0].porque === "cedo");
  t("na última etapa, acaba", julgar({ ...BASE, ...ev(2) }, { missoes: { global_encerrado: true } }).aceito.missoes.global_encerrado === true);
  t("sem evento aberto, não há o que encerrar", julgar(BASE, { missoes: { global_encerrado: true } }).recusado[0].porque === "semEvento");

  /* o que passa e é validado adiante */
  const dep = julgar(BASE, { relogio_novo: { nome: "o ritual", segmentos: 6 }, teste_sugerido: { atributo: "Presença", perfil: "dificil" }, promessas_pagas: [2], falou_com: ["Berengária Passo Largo", 3, ""] });
  t("relógio, teste, promessas pagas e falou_com passam (o órgão do sistema valida adiante)", dep.aceito.relogio_novo.nome === "o ritual" && dep.aceito.teste_sugerido.atributo === "Presença" && J(dep.aceito.promessas_pagas) === "[2]" && J(dep.aceito.falou_com) === J(["Berengária Passo Largo"]));
}

/* ============================================================ */
sec("3. CONTRA OS REGISTOS REAIS (8.ª–10.ª) — o que era certo continua a entrar");
const RC = JSON.parse(fs.readFileSync("./registo-s8-s10-cronista.json", "utf8"));
const R10 = JSON.parse(fs.readFileSync("./registo-s10-cena.json", "utf8"));
/* "na Cabra Trêmula, dentro de Monte Rasa" → { lugar, cidade } */
const lerOnde = (onde) => {
  const s = String(onde || "").trim();
  let m = s.match(/^(?:na|no|nas|nos|em) (.+?), dentro de (.+)$/);
  if (m) return { lugar: m[1], cidade: m[2] };
  m = s.match(/^(.+?) em (.+)$/);
  if (m && !/^(na|no|em)$/.test(m[1])) return { lugar: m[1], cidade: m[2] };
  m = s.match(/^em (.+?)(?: \(.+\))?$/);
  if (m) return { lugar: null, cidade: m[1] };
  return { lugar: null, cidade: null, estrada: /estrada/.test(s) };
};
const MAPA10 = { cidades: [...new Set(R10.pautas.map((p) => p.cidade))].map((nome) => ({ nome })) };
{
  const T = RC.turnos;
  const certos = [], fora = [];
  /* pessoa e cânone: os nomes que o registo ganhou no turno seguinte */
  for (let i = 0; i < T.length; i++) {
    const a = T[i], b = T[i + 1];
    if (!b || b.ses !== a.ses) continue;
    const novos = [...new Set(b.conhecidos)].filter((x) => !a.conhecidos.includes(x));
    const temP = a.util.includes("pessoa"), temC = a.util.includes("canone");
    if (!temP && !temC) continue;
    for (const nome of novos) {
      const ficha = Object.values(R10.npcs).find((n) => sem(n.nome) === sem(nome));
      const pessoa = a.ses === "s10" ? !!ficha : (temP && !temC);
      const heroi = a.ses === "s10" ? R10.heroi : "";
      const prop = pessoa ? { pessoas: [{ nome, ...(ficha || {}), genero: ficha ? ficha.genero : "" }] } : { canone: { [nome]: { tipo: "artefato", descricao: "—" } } };
      const r = julgar({ personagem: { nome: heroi }, cidadeAtual: "" }, prop, { narrativa: a.narrativa });
      const entrou = pessoa ? (r.aceito.pessoas || []).some((p) => p.nome === nome) : !!(r.aceito.canone || {})[nome];
      const dito = r.ditoPor.length > 0;
      certos.push({ caso: `${a.ses}/${a.k} ${pessoa ? "pessoa" : "cânone"} ${nome}`, entrou, dito });
    }
  }
  /* o lugar: só a 10.ª tem as pautas (o lugar antes e depois) */
  for (const a of T.filter((x) => x.ses === "s10" && x.util.includes("lugar"))) {
    const antes = lerOnde(R10.pautas[a.k].onde), depois = lerOnde((R10.pautas[a.k + 1] || {}).onde);
    if (!depois.cidade) { fora.push(`s10/${a.k} lugar (a pauta seguinte diz «${(R10.pautas[a.k + 1] || {}).onde}»)`); continue; }
    const dito = depois.lugar || "cidade";
    const est = { personagem: { nome: R10.heroi }, cidadeAtual: R10.pautas[a.k].cidade, lugar: antes.lugar ? { nome: antes.lugar, distancia: "dentro" } : null, mapa: MAPA10 };
    const r = julgar(est, { lugar: dito }, { narrativa: a.narrativa, pedido: a.frase });
    /* o efeito de antes: a régua do lugar sozinha (o App de v9.478) */
    const L = await import("../src/lugar.js");
    const antesFazia = ["novo", "volta"].includes(L.lerLugarDito(dito, { lugar: est.lugar, cidade: est.cidadeAtual, pedido: a.frase, fonte: "cronista" }).acao);
    certos.push({ caso: `s10/${a.k} lugar ${dito}`, entrou: antesFazia ? r.aceito.lugar === dito : !r.aceito.lugar, dito: false });
  }
  for (const a of T.filter((x) => x.ses !== "s10" && x.util.includes("lugar"))) fora.push(`${a.ses}/${a.k} lugar`);
  /* a missão: a proposta passa (o cartaz é do sistema), com a paga da tabela */
  for (const a of T.filter((x) => x.util.includes("missao"))) {
    const r = julgar({ personagem: { nome: "", nivel: 2 } }, { missao_oferecida: { titulo: "o serviço do turno", tipo: "favor", etapas: [{ tipo: "levar_a", alvo: "Ponto Rasa" }], paga: null } }, { narrativa: a.narrativa });
    certos.push({ caso: `${a.ses}/${a.k} missão`, entrou: !!r.aceito.missao_oferecida && r.aceito.missao_oferecida.paga > 0, dito: false });
  }
  /* falou_com: a lista passa */
  for (const a of T.filter((x) => x.util.includes("falou_alvo"))) {
    const r = julgar({}, { falou_com: ["Alguém"] }, { narrativa: a.narrativa });
    certos.push({ caso: `${a.ses}/${a.k} falou_com`, entrou: J(r.aceito.falou_com) === J(["Alguém"]), dito: false });
  }
  const entraram = certos.filter((c) => c.entrou).length;
  const recall = entraram / certos.length;
  t(`recall do certo: ${entraram}/${certos.length} = ${(100 * recall).toFixed(1)}% (alvo ≥ 95%)`, certos.length >= 50 && recall >= 0.95, certos.filter((c) => !c.entrou).map((c) => c.caso).join(" | "));
  const ditos = certos.filter((c) => c.dito).map((c) => c.caso);
  /* MEDIDA (27/10): 13 dos 41 nomes novos só aparecem dentro de falas —
     "o Rei Emprestado acordou, dizem", "a Ordem dos Esquecidos", "a
     Fiandeira", o Tomas que a criada cita. Entram, marcados como palavra.
     O número é catraca: se a régua da fala mudar, ele muda à vista. */
  t(`${ditos.length} entram marcados como «dito por alguém» (a medida de 27/10: 13 — o rumor que virava cânone)`, ditos.length === 13, ditos.join(" | "));
  console.log("  ..  não reconstruíveis (o registo não guarda o nome): " + fora.length + " lugares; 33 turnos de promessa (sem texto)");
  t("a conta não reconstruível está dita (e não é escondida no recall)", fora.length >= 20);
}

/* ============================================================ */
sec("4. CONTRA OS ERROS DOCUMENTADOS — o que entrava errado passa a ser recusado ou marcado");
{
  const B11 = { personagem: { nome: "Quirino Vasco", nivel: 2, grupo: [{ nome: "Gualtério" }] }, cidadeAtual: "Bela do Rio", mapa: { cidades: [{ nome: "Bela do Rio" }, { nome: "Alto das Pedras" }] }, npcs: { "Branca Pau Seco": { nome: "Branca Pau Seco" } }, divindade: null };
  const erros = [];
  const caso = (nome, de, r, apanhado) => { erros.push({ nome, apanhado }); t(`${nome} (${de})`, apanhado, J(r).slice(0, 300)); };
  /* O ECO e os quatro fios (mm11-sessao-11.md, "O eco: o Mestre inventa,
     o Cronista regista, o sistema devolve"): as falas que o Mestre pôs na
     boca de alguém e voltaram como verdade */
  const ECO = [
    { m: "M8", quem: "Branca Pau Seco", tipo: "ameaca", texto: "devolve na saída ou perde as orelhas no pelourinho", nar: "Branca Pau Seco joga a medalha de Gualtério na mesa. \"Devolve na saída ou perde as orelhas no pelourinho.\"" },
    { m: "M9", quem: "a Ronda de Bela do Rio", tipo: "ameaca", texto: "a patroa mandou buscar as orelhas do bardo", nar: "Dois da Ronda param na porta, a medalha no peito e uma corda de forca no ombro. \"A patroa mandou buscar as orelhas do bardo.\"" },
    { m: "M11", quem: "a Ronda de Bela do Rio", tipo: "ameaca", texto: "a patroa mandou buscar a taxa ou o couro", nar: "O mais alto bate na mesa. \"A patroa mandou buscar a taxa ou o couro.\"" },
    { m: "M44", quem: "", tipo: "frase", texto: "a corda de forca apodrece se pegar a chuva", nar: "A forca balança à beira do valo. O guarda nem olha: \"A corda de forca apodrece se pegar a chuva.\"" },
  ];
  for (const e of ECO) {
    const r = julgar(B11, { promessas: [{ tipo: e.tipo, texto: e.texto, quem: e.quem }] }, { narrativa: e.nar });
    caso(`o eco ${e.m}: «${e.texto}» entra como palavra, não fato`, "mm11-sessao-11.md", r, !!r.aceito.promessas[0].dito && r.ditoPor.length === 1);
  }
  /* a Clarissa do Posto Velho (M13–M14): "pessoa nova com nome, sem
     fonte", do Brilho do crítico, que o Cronista registou "aqui" e o
     sistema passou a encontrar */
  const cla = julgar(B11, { pessoas: [{ nome: "Clarissa do Posto Velho", papel: "capitã", genero: "ela", local: "Bela do Rio" }] }, { narrativa: "O guarda guarda as pratas e baixa a voz. \"Quem manda recado pra lá não é a tropa, é a própria Clarissa do Posto Velho.\"" });
  caso("a Clarissa (M13): citada numa fala, entra marcada e sem «está aqui»", "mm11-sessao-11.md", cla, cla.aceito.pessoas[0].local === "" && !!cla.aceito.pessoas[0].dito);
  /* o pagamento: "cartaz no mural, com o número da recompensa inventado"
     (narrador-so-narra.md, a tabela dos canais: 4×). O caso real da 10.ª
     (s10/50): "Quem levar ganha quarenta e cinco." */
  const tab = OF.precoDaOferta({ tipo: "favor", nivel: 2, etapas: 1, risco: 1 });
  const pg = julgar(B11, { missao_oferecida: { titulo: "A carta de Perrin", tipo: "favor", dador: "Perrin", paga: 45, etapas: [{ tipo: "levar_a", alvo: "Ponto Rasa", item: "carta" }] } });
  caso(`o pagamento (s10/50, «ganha quarenta e cinco»): vale o da tabela, ${tab}`, "narrador-so-narra.md", pg, pg.aceito.missao_oferecida.paga === tab && pg.recusado.some((x) => x.secao === "pagamento"));
  /* a viagem fantasma ("duas frases com nome de lugar mudaram onde estou",
     11.ª, a agência; auditoria §2, a linha do mundo) */
  const vf = julgar(B11, { lugar: "Alto das Pedras" }, { pedido: "Pergunto a Venceslau quanto falta para Alto das Pedras." });
  caso("a viagem fantasma: o Cronista não leva o herói a outra cidade", "auditoria-do-motor.md §2", vf, !vf.aceito.lugar);
  /* o herói registado como NPC (mm11-sessao-6.md: "Tamsin — companheiro
     de jornada, aliado") */
  const he = julgar({ ...B11, personagem: { nome: "Tamsin" } }, { pessoas: [{ nome: "Tamsin", papel: "companheiro de jornada", relacao: "aliado" }] });
  caso("o herói como NPC (6.ª): recusado", "mm11-sessao-6.md", he, !he.aceito.pessoas && he.recusado[0].porque === "heroi");
  /* o grupo por «vou com você» (auditoria §2: "quem entrou no grupo") */
  const gr = julgar(B11, { grupo: { entraram: ["Branca Pau Seco"] } });
  caso("o grupo pela prosa: sem o convite do sistema, ninguém entra", "auditoria-do-motor.md §2", gr, gr.aceito.grupo.entraram.length === 0);
  /* a devoção chutada (auditoria §2: "fieis 10 a 500") */
  const fe = julgar({ ...B11, divindade: { despertar: true } }, { fe: { fieis: 500, pf: 10, motivo: "o povo canta o nome dele" } });
  caso("a devoção chutada (500 fiéis): vale a tabela", "auditoria-do-motor.md §2", fe, fe.aceito.fe[0].fieis !== 500 && fe.aceito.fe[0].de === "gesto");
  const apanhados = erros.filter((e) => e.apanhado).length;
  t(`o que entrava errado: ${apanhados}/${erros.length} recusados ou marcados (antes: 0/${erros.length} — o App aplicava a proposta)`, apanhados === erros.length);
}

/* ============================================================ */
sec("5. LIXO, DETERMINISMO, IMUTABILIDADE");
{
  const LIXO = [null, undefined, 0, "", "texto", [], {}, 42, true];
  let estourou = "";
  for (const a of LIXO) for (const b of LIXO) {
    try { const r = julgar(a, b, a); if (!r || typeof r.aceito !== "object" || !Array.isArray(r.recusado) || !Array.isArray(r.ditoPor)) estourou += `forma ${J(a)}/${J(b)}; `; } catch (e) { estourou += `${J(a)}/${J(b)}: ${e.message}; `; }
  }
  t("nada estoura com lixo, e a forma é sempre { aceito, recusado, ditoPor }", !estourou, estourou.slice(0, 200));
  t("proposta vazia → nada aceito, nada recusado", J(julgar(BASE, {})) === J({ aceito: {}, recusado: [], ditoPor: [] }));
  const lixoNasSecoes = { lugar: [], pessoas: "x", fe: "muito", grupo: { entraram: "Zé" }, combate: { mortes_narradas: {} }, missao_oferecida: 5, promessas: [null, 3, "x"], canone: [] };
  t("lixo dentro das secções também não estoura", () => { julgar(BASE, lixoNasSecoes, { envelopes: "x", aceitariam: 3 }); return true; });
  const fundo = (o) => { if (o && typeof o === "object") { Object.freeze(o); Object.values(o).forEach(fundo); } return o; };
  const est = fundo(JSON.parse(J({ ...BASE, combate: { inimigos: [{ nome: "Lobo", vida: 2 }] }, eventos: { global: { nome: "E", etapas: ["a"], etapa: 0 } } })));
  const prop = fundo({ lugar: "o Escudo Rachado", pessoas: [{ nome: "Venceslau", genero: "ele" }], promessas: [{ tipo: "ameaca", texto: "volto com os meus", quem: "Tristão" }], fe: { fieis: 9 }, grupo: { entraram: ["Beraldo Pau Seco"] }, combate: { mortes_narradas: ["Lobo"] }, missao_oferecida: { titulo: "X", paga: 99, etapas: [{ tipo: "ir_a", alvo: "Y" }] }, missoes: { global_encerrado: true }, canone: { "A Coroa": { tipo: "artefato" } } });
  const ctx = fundo({ narrativa: "Venceslau ri.", aceitariam: ["Beraldo Pau Seco"] });
  let r1 = null;
  t("estado, proposta e contexto congelados: não muta nada", () => { r1 = julgar(est, prop, ctx); return true; });
  t("mesma entrada, mesma saída (determinista)", J(julgar(est, prop, ctx)) === J(r1));
  t("a saída não partilha objetos com a proposta (a promessa marcada é cópia)", r1 && r1.aceito.promessas[0] !== prop.promessas[0] && !Object.isFrozen(r1.aceito.promessas[0]));
}

console.log(`\ncronista-propoe: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
