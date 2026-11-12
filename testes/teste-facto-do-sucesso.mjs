/* O SUCESSO DÁ SEMPRE UM FACTO (11/11/2026, Fase MC · MC4) — src/facto-do-sucesso.js

   A 18.ª sessão: 25% dos sucessos chegavam vazios (o Matt: 1%), e o
   envelope delegava ao Narrador «revele UMA coisa concreta». A prova da
   planta (mente/plano-o-mestre-chama-o-dado.md, §5, MC4), com a catraca do
   estudo (mente/estudo-do-mestre.md, L2: ≥ 97%):
   §1 a tabela: as famílias são desafios do catálogo, as ordens só têm
      fontes que existem, o teto é o da planta (≤ 200);
   §2 em 1000 mundos, ≥ 97% dos sucessos de busca, investigação, rasto e
      saberes trazem facto COM FONTE;
   §3 nunca de outro prédio (a régua de `procuravelAqui`): a gente e o
      segredo são os do sítio onde o herói está; na rua e no ermo, nenhuma
      gente de prédio;
   §4 o passo primeiro: no lugar do passo, o facto é a pista dele;
   §5 a busca vazia só quando nenhuma fonte tem nada;
   §6 o envelope leva o facto no lugar de «revele UMA coisa», e o pior caso
      do prompt não cresce;
   §7 mesma semente, mesmo facto; §8 o lixo não lança. */
import {
  FACTO_DO_SUCESSO, oFactoDoSucesso,
} from "../src/facto-do-sucesso.js";
import { achadoDoPasso } from "../src/a-quest-manda.js";
import { lerAcao, DESAFIOS, envelopeDeBuscaVazia } from "../src/desafios.js";
import { envelopeDoTeste, TIPOS_TESTE } from "../src/testes.js";
import { gerarGeografia, rngDe } from "../src/geografia.js";
import { oQueExisteAqui, achavelAqui, garantirBase, criaturasDaRegiao } from "../src/mundo-base.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const semArtigo = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/^(o|a|os|as)\s+/, "").trim();
const G = "Fantasia medieval";
const FONTES = ["passo", "achado", "livro", "bestiario", "lugar"];

sec("§1 a tabela");
{
  const ids = new Set(DESAFIOS.map((d) => d.id));
  const fora = Object.keys(FACTO_DO_SUCESSO.familias).filter((id) => !ids.has(id));
  t("toda família é um desafio do catálogo", fora.length === 0, fora.join(", "));
  const fams = new Set(Object.values(FACTO_DO_SUCESSO.familias));
  t("toda família tem a sua ordem", [...fams].every((f) => Array.isArray(FACTO_DO_SUCESSO.ordem[f]) && FACTO_DO_SUCESSO.ordem[f].length));
  const tortas = Object.values(FACTO_DO_SUCESSO.ordem).flat().filter((f) => !FONTES.includes(f));
  t("as ordens só têm as cinco fontes da planta (§2.4)", tortas.length === 0, tortas.join(", "));
  t("o passo vem primeiro onde há lugar (busca, rasto, saber)", ["busca", "rasto", "saber"].every((f) => FACTO_DO_SUCESSO.ordem[f][0] === "passo"));
  t("o teto do facto é o da planta (§4: ≤ 200)", FACTO_DO_SUCESSO.teto > 0 && FACTO_DO_SUCESSO.teto <= 200);
  t("as quatro famílias da prova estão lá: busca, investigação, rasto, saberes",
    FACTO_DO_SUCESSO.familias.buscar && FACTO_DO_SUCESSO.familias.investigar && FACTO_DO_SUCESSO.familias.rastrear && FACTO_DO_SUCESSO.familias.lembrar && FACTO_DO_SUCESSO.familias.fraqueza);
}

/* ---------------- os mil mundos ----------------
   Cada mundo, uma cena: a cidade, o sítio (um prédio, um cómodo dele, a
   rua, o ermo), a família e a frase, tudo da semente. O achado vem como o
   App o dá (`achadoDe` → `achavelAqui` com o `onde`). */
const FRASES = {
  busca: ["Revisto o lugar com cuidado.", "Investigo o que aconteceu aqui."],
  rasto: ["Sigo o rastro.", "Sigo as pegadas."],
};
const N = 1000;
const casos = [];
for (let i = 0; i < N; i++) {
  const sem = `MC4|${i}`;
  const rnd = rngDe(`${sem}|cena`);
  const mapa = gerarGeografia(sem, G);
  const cidade = mapa.cidades[Math.floor(rnd() * mapa.cidades.length)];
  const base = garantirBase(null);
  const q = oQueExisteAqui(sem, mapa, cidade.nome, base, G);
  const r = rnd();
  const local = q.locais[Math.floor(rnd() * q.locais.length)];
  const onde = r < 0.6 ? { lugar: local.nome, cidade: cidade.nome, foraDosMuros: false }
    : r < 0.7 ? { lugar: "o quarto dos fundos", dentroDe: local.nome, cidade: cidade.nome, foraDosMuros: false }
      : r < 0.85 ? { lugar: "", cidade: cidade.nome, foraDosMuros: false }
        : { lugar: "a estrada velha", cidade: cidade.nome, foraDosMuros: true };
  const fam = ["busca", "rasto", "saber", "bicho"][i % 4];
  const bichos = (mapa.regioes || []).flatMap((reg) => criaturasDaRegiao(sem, reg, G));
  const gente = q.gente[Math.floor(rnd() * q.gente.length)];
  const bicho = bichos[Math.floor(rnd() * bichos.length)];
  let frase;
  if (fam === "busca" || fam === "rasto") frase = FRASES[fam][Math.floor(rnd() * 2)];
  else if (fam === "saber") {
    const sobre = [local.nome, gente && gente.nome, bicho && bicho.nome, "bichos assim", cidade.nome][Math.floor(rnd() * 5)];
    frase = `O que eu sei sobre ${sobre}?`;
  } else frase = "Qual o ponto fraco desse inimigo?";
  const ctxL = { personagem: { nivel: 3, atributos: {}, pericias: {} }, lugar: onde.lugar || cidade.nome, tentativas: {},
    achadoDe: (attr) => achavelAqui(sem, mapa, cidade.nome, base, G, attr, null, null, onde) };
  const v = lerAcao(frase, ctxL);
  const ctx = { semente: sem, mapa, cidade: cidade.nome, base, genero: G, onde, frase, alvo: fam === "bicho" && bicho ? bicho.nome : "" };
  casos.push({ i, sem, fam, frase, onde, v, ctx, q, f: v && v.tipo === "teste" ? oFactoDoSucesso(v, ctx) : null });
}

sec(`§2 em ${N} mundos, o sucesso traz facto com fonte`);
{
  const testes = casos.filter((c) => c.v && c.v.tipo === "teste");
  t("as frases da cena são testes do catálogo (a prova mede o que rola)", testes.length === N, `${testes.length} de ${N}`);
  const com = testes.filter((c) => c.f && FONTES.includes(c.f.fonte) && c.f.texto && c.f.de && Object.keys(c.f.de).length);
  const pct = (100 * com.length) / testes.length;
  t(`≥ 97% dos sucessos com facto e fonte (a catraca do estudo; a planta pedia 95%) — ${pct.toFixed(1)}%`, pct >= 97, `${com.length}/${testes.length}`);
  for (const fam of ["busca", "rasto", "saber", "bicho"]) {
    const d = testes.filter((c) => c.fam === fam);
    const k = d.filter((c) => c.f).length;
    console.log(`       ${fam}: ${k}/${d.length} (${((100 * k) / Math.max(1, d.length)).toFixed(1)}%) · ${FONTES.map((fo) => `${fo} ${d.filter((c) => c.f && c.f.fonte === fo).length}`).join(" · ")}`);
  }
  const vazios = testes.filter((c) => !c.f);
  if (vazios.length) console.log(`       sem facto (amostra): ${vazios.slice(0, 4).map((c) => `${c.fam} «${c.frase}» ${J(c.onde)}`).join(" | ")}`);
  t("todo facto cabe no teto", com.every((c) => c.f.texto.length <= FACTO_DO_SUCESSO.teto), J(com.map((c) => c.f.texto.length).sort((a, b) => b - a)[0]));
  t("o facto não fala do sistema (nem oráculo, nem teste, nem dado)", com.every((c) => !/sistema|or[aá]culo|\bteste\b|\bdado\b|rolagem/i.test(c.f.texto)), (com.find((c) => /sistema|or[aá]culo|\bteste\b|\bdado\b|rolagem/i.test(c.f.texto)) || {}).f?.texto);
  const achados = testes.filter((c) => c.v.achado);
  t("onde há achado, a busca dá o achado (a fonte 2, antes do registo)", achados.length > 0 && achados.every((c) => c.f && c.f.fonte === "achado"), `${achados.length} com achado`);
}

sec("§3 nunca de outro prédio");
{
  const tortos = casos.filter((c) => c.f && c.f.de && c.f.de.local).filter((c) => {
    const aqui = [c.onde.lugar, c.onde.dentroDe].map(semArtigo).filter(Boolean);
    return !aqui.includes(semArtigo(c.f.de.local)) && c.f.fonte !== "livro" && c.fam !== "saber";
  });
  t("a gente e o segredo do facto são os do sítio onde o herói está (ou do prédio do cómodo)", tortos.length === 0, tortos.slice(0, 2).map((c) => `${c.f.de.local} ≠ ${J(c.onde)}`).join(" | "));
  const naRua = casos.filter((c) => c.f && !c.onde.lugar && !c.onde.foraDosMuros && c.fam !== "saber" && c.fam !== "bicho");
  t("na rua, nenhuma gente de prédio (o rumor que corre)", naRua.length > 0 && naRua.every((c) => !c.f.de.pessoa && !c.f.de.local), `${naRua.length} na rua`);
  const noErmo = casos.filter((c) => c.f && c.onde.foraDosMuros && (c.fam === "busca" || c.fam === "rasto"));
  t("fora dos muros, nenhum segredo nem gente de prédio", noErmo.length > 0 && noErmo.every((c) => !c.f.de.pessoa && !(c.f.fonte === "achado" && c.f.achado && c.f.achado.especie === "segredo")), `${noErmo.length} no ermo`);
  const rastoErmo = noErmo.filter((c) => c.fam === "rasto");
  t("o rasto do ermo é de bicho da região", rastoErmo.length > 0 && rastoErmo.every((c) => c.f.fonte === "bestiario" || c.f.fonte === "lugar"), J(rastoErmo.map((c) => c.f.fonte).slice(0, 5)));
}

sec("§4 o passo primeiro");
{
  const c = casos.find((x) => x.fam === "busca" && x.onde.lugar && !x.onde.foraDosMuros && !x.onde.dentroDe);
  const passo = { quest: "q", etapa: "e", texto: "Descobrir o que o sítio esconde", especie: "segredo", escuta: false,
    descobrir: [{ id: "x|local|y", nome: c.onde.lugar, cidade: c.onde.cidade }],
    lugares: [{ id: "x|local|y", nome: c.onde.lugar, cidade: c.onde.cidade }, { id: "x|local|z", nome: "A Torre Velha", cidade: c.onde.cidade }],
    candidatos: { lugar: [{ tipo: "lugar", nome: "A Torre Velha", id: "x|local|z" }], pessoa: [], item: [] } };
  const f = oFactoDoSucesso(c.v, { ...c.ctx, passos: [passo] });
  t("no lugar do passo, a busca dá a pista do passo", f && f.fonte === "passo" && f.achado && f.achado.especie === "passo", J(f));
  t("e a pista aponta para o resto do passo (o outro lugar)", f && /Torre Velha/.test(f.texto), f && f.texto);
  t("a mesma pista que o achado do passo (uma régua só)", f && f.achado.id === achadoDoPasso([passo], c.onde).id);
  const longe = oFactoDoSucesso(c.v, { ...c.ctx, passos: [passo], onde: { ...c.onde, lugar: "Outro Sítio Qualquer" } });
  t("fora do lugar do passo, o passo não fala", !longe || longe.fonte !== "passo", J(longe && longe.fonte));
  const rasto = { ...passo, especie: "rasto", descobrir: [] };
  const vR = lerAcao("Sigo o rastro.", { lugar: "A Torre Velha" });
  const fR = oFactoDoSucesso(vR, { ...c.ctx, passos: [rasto], onde: { lugar: "A Torre Velha", cidade: c.onde.cidade } });
  t("o rasto dá a pista do passo de rasto em qualquer lugar dele, sem o descobrir", fR && fR.fonte === "passo" && fR.achado.semDescobrir === true, J(fR));
  const vS = lerAcao("O que eu sei sobre A Torre Velha?", { lugar: c.onde.lugar });
  const fS = oFactoDoSucesso(vS, { ...c.ctx, passos: [rasto] });
  t("lembrar o lugar do passo é lembrar a pista dele, sem o descobrir", fS && fS.fonte === "passo" && fS.achado.semDescobrir === true, J(fS));
}

sec("§4b o livro: o que já se sabe do assunto");
{
  const c = casos.find((x) => x.fam === "saber");
  const livro = { v: 1, pessoas: { "npc|maela corvo": { nome: "Maela Corvo", quemE: [{ o: "deve a vida a quem a tirou do poço", dia: 2 }], falou: { de: 1, ate: 3, vezes: 2 } } }, lugares: { "x|local|forja": { nome: "A Forja Torta", favor: { dia: 3, de: "q" } } } };
  const vP = lerAcao("O que eu sei sobre Maela Corvo?", { lugar: "x" });
  const fP = oFactoDoSucesso(vP, { ...c.ctx, livro });
  t("lembrar alguém que a história marcou: as linhas do QUEM É e a conversa", fP && fP.fonte === "livro" && /tirou do poço/.test(fP.texto) && /2 vezes/.test(fP.texto), J(fP));
  const vL = lerAcao("O que eu sei sobre a Forja Torta?", { lugar: "x" });
  const fL = oFactoDoSucesso(vL, { ...c.ctx, livro });
  t("lembrar um lugar que te deve um favor: o favor", fL && fL.fonte === "livro" && /favor/.test(fL.texto), J(fL));
}

sec("§5 a busca vazia só quando nenhuma fonte tem nada");
{
  const v = lerAcao("Revisto o lugar com cuidado.", { lugar: "Sala" });
  t("sem mundo, sem passo, sem achado: null (e o App manda a busca vazia)", oFactoDoSucesso(v, {}) === null);
  const c = casos.find((x) => x.fam === "busca" && x.onde.lugar && !x.onde.foraDosMuros && !x.onde.dentroDe && !x.v.achado);
  const f = oFactoDoSucesso(c.v, c.ctx);
  t("no prédio sem segredo, a busca não é vazia: é o rasto de quem usa o sítio", f && f.fonte === "lugar" && f.de.local === c.onde.lugar, J(f));
  const vazias = casos.filter((x) => x.fam === "busca" && !x.f);
  t(`a busca vazia é rara nos ${N} mundos (≤ 3%)`, vazias.length <= 0.03 * casos.filter((x) => x.fam === "busca").length, `${vazias.length}`);
}

sec("§6 o envelope leva o facto, e o pior caso não cresce");
{
  const base = { tipo: "percepcao", pericia: "percepcao", motivo: "", valor: 12, mod: 3, total: 15, dc: 13, resultado: "sucesso" };
  const f = { texto: "o que a Casa do Sal escondia: uma pista que aponta para a Torre Velha" };
  const com = envelopeDoTeste({ ...base, facto: f });
  t("com facto: o texto do facto está no envelope", com.includes(f.texto));
  t("com facto: adeus ao «revele UMA coisa»", !/Revele UMA coisa/.test(com), com);
  t("com facto: o sucesso sem castigo continua", /sem luta nem ferida que eu não tinha/.test(com));
  const sem = envelopeDoTeste(base);
  t("sem facto: o texto de sempre (quem ainda não o passa não muda)", /eu PASSEI\. Revele UMA coisa/.test(sem));
  const fio = envelopeDoTeste({ ...base, meio: { porPouco: true, faixa: "mas", margem: 1, diz: "o barulho chamou alguém" }, facto: f });
  t("por um fio: o facto e o preço, sem «revele»", fio.includes(f.texto) && fio.includes("o barulho chamou alguém") && !/Revele UMA/.test(fio));
  const falha = envelopeDoTeste({ ...base, resultado: "falha", total: 9, facto: f });
  t("na falha, o facto não vai (falhar não compra a verdade)", !falha.includes(f.texto));
  const gesto = envelopeDoTeste({ ...base, gesto: true, facto: f });
  t("no gesto, o facto não vai (passar é o gesto acontecer)", !gesto.includes(f.texto));
  /* o pior caso: o facto no teto, contra o envelope de sempre sem motivo
     (o mais curto que ele já foi) e contra a busca vazia */
  const maior = { texto: "x".repeat(FACTO_DO_SUCESSO.teto) };
  const piores = TIPOS_TESTE.map((tp) => ({ tp: tp.id, novo: envelopeDoTeste({ ...base, tipo: tp.id, pericia: null, facto: maior }).length, velho: envelopeDoTeste({ ...base, tipo: tp.id, pericia: null }).length }));
  t("com o facto no teto, o envelope nunca passa o de sempre (em todo tipo de teste)", piores.every((p) => p.novo <= p.velho), J(piores));
  const critico = envelopeDoTeste({ ...base, critico: true, facto: maior }).length;
  const criticoVelho = envelopeDoTeste({ ...base, critico: true }).length;
  t("e no crítico também", critico <= criticoVelho, `${critico} vs ${criticoVelho}`);
  console.log(`       a régua: com facto no teto ${piores[0].novo} · sem facto ${piores[0].velho} · busca vazia ${envelopeDeBuscaVazia("vasculhar o lugar").length}`);
}

sec("§7 mesma semente, mesmo facto");
{
  const amostra = casos.filter((c) => c.f).slice(0, 60);
  t("refeito do zero, o mesmo facto (60 cenas)", amostra.every((c) => J(oFactoDoSucesso(c.v, c.ctx)) === J(c.f)));
  const c = casos.find((x) => x.fam === "busca" && x.f && x.f.fonte === "lugar" && x.f.de.pessoa);
  const outros = Array.from({ length: 12 }, (_, k) => oFactoDoSucesso(c.v, { ...c.ctx, semente: `${c.sem}|outra${k}` }));
  t("outra semente pode dar outra pessoa (a escolha é semeada, não fixa)", outros.some((f) => !f || f.texto !== c.f.texto));
}

sec("§8 o lixo não lança");
{
  const v = lerAcao("Revisto o lugar com cuidado.", { lugar: "Sala" });
  let ok = true;
  for (const [a, b] of [[null, null], [{}, {}], [v, null], [v, { semente: 5, mapa: "x", cidade: {}, onde: 7, passos: "z", livro: 3 }], [{ tipo: "teste", id: "buscar" }, { passos: [null, 1, {}] }]]) {
    try { oFactoDoSucesso(a, b); } catch { ok = false; }
  }
  t("null, {}, e contextos tortos: nada lança", ok);
  /* S19 (12/11): o «saltar» saiu daqui. Dizia-se que o teste de ação não
     tinha facto — e era por isso que o sucesso dele chegava ao Narrador como
     «revele UMA coisa», a página em branco da 19.ª sessão. Agora o teste de
     ação do catálogo tem o EFEITO (fonte «efeito», EFEITO_DO_SUCESSO); o
     improviso (gesto) e o social continuam sem facto, com o envelope deles. */
  t("o improviso (gesto) e o social não têm facto", oFactoDoSucesso({ ...v, gesto: true }, {}) === null && oFactoDoSucesso({ ...v, social: {} }, {}) === null);
  const salto = oFactoDoSucesso({ ...v, id: "saltar" }, {});
  t("o teste de ação do catálogo tem o efeito, e não um facto do mundo", !!salto && salto.fonte === "efeito" && /outro lado/.test(salto.texto), JSON.stringify(salto));
  t("o veredito que não é teste não tem facto", oFactoDoSucesso({ tipo: "livre" }, {}) === null);
}

console.log(`\nfacto do sucesso: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
