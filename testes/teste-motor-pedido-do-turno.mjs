/* ============================================================
   O PEDIDO DO TURNO, NO MOTOR (Fase 4, trilha B, 29/10/2026) — testes/teste-motor-pedido-do-turno.mjs

   O trecho de `enviar` que monta o pedido ao Narrador (da pauta ao system,
   e a arrumação de `chamarMestre` antes da rede) ganhou peça em
   src/motor/pedido-do-turno.js: `oPedidoDoTurno(estado, entrada, portas)`.
   É o segundo passo da ordem do inventário (14bde83) para o `/api/turno`,
   no padrão da pauta (teste-motor-pauta-do-turno.mjs).

   Aqui a peça é provada contra o recorte à letra do App
   (`pedido-dourado.json`, de `gerar-pedido-dourado.mjs`) sobre os 275 casos
   de `pedido-bloco.mjs`: O PEDIDO QUE VAI À REDE byte a byte (o system, as
   mensagens da janela na ordem do cache, o teto, o formato, a tarefa), o
   que o resto de `enviar` lê depois (a pauta, a nota, o corpo, o histórico
   novo, a luta de antes), os refs do fim e a ordem das portas. A prova tem
   de morder — o recorte mordido (a nota mal juntada, a escuta que não
   corta, a estrada que não segura, a frase que não vai por último, o
   histórico-base esquecido, a janela sem âncora, a ordem do cache…) e o
   contrato mordido pelo lado de fora TÊM de mudar fotos —, e o escopo do
   recorte acusa todo nome sem dublê. A suíte não lê o texto de src/motor/
   (a catraca teste-assercoes-de-texto): a peça prova-se jogando.
   ============================================================ */
import { lerODourado, correrOsCasos, casosDoPedido, fotoGuardada, mesmaFoto, N_CASOS, osModulos, osPadroes } from "./pedido-bloco.mjs";
import { N_DA_PAUTA } from "./pauta-bloco.mjs";
import { oPedidoDoTurno, REFS_DO_PEDIDO, RENDER_DO_PEDIDO, ENTRADA_DO_PEDIDO, PEDIDO_AO_NARRADOR } from "../src/motor/pedido-do-turno.js";
import { rng, hashSemente } from "../src/semente.js";
import { morderEmParalelo } from "./mordidas-em-paralelo.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const D = lerODourado();
const CASOS = casosDoPedido();
const conta = (fotos) => fotos.reduce((a, f, i) => a + (mesmaFoto(fotoGuardada(f, i), D.fotos[i]) ? 1 : 0), 0);
/* as mordidas correm sobre um terço dos casos (um em cada três, mais os do
   histórico-base e os da estrada): o recorte leva ~50 ms por caso, e o
   rodar-tudo dá 120 s a cada suíte */
const PARA_MORDER = CASOS.filter((k) => k.i % 3 === 0 || k.i % 11 === 4 || k.i % 9 === 4);
/* MOVIDA (29/10, a 13.ª): as dezasseis mordidas (as treze do recorte e as
   três da chamada, secções 4 e 5) correm juntas, repartidas por
   trabalhadores (mordidas-em-paralelo.mjs) — os mesmos casos, a mesma conta
   de fotos que mudam, mordida a mordida; a suíte passava dos 120 s do
   corredor (~166 s numa linha só). */
const IDX = PARA_MORDER.map((k) => k.i);
const ONDE = { bloco: new URL("./pedido-bloco.mjs", import.meta.url).href, caso: "casoDoPedido",
  peca: new URL("../src/motor/pedido-do-turno.js", import.meta.url).href, nomeDaPeca: "oPedidoDoTurno" };

sec("1. O dourado: o recorte à letra, e o recorte de novo dá as mesmas fotos");
const R = await correrOsCasos(D, { lado: "recorte" });
/* MOVIDA (29/10, trilha B): a prova passa a correr também os 12 casos de
   cobertura da pauta (pauta-bloco.mjs, COBERTURA: ENTRETANTO e O QUE VOLTA),
   depois dos 275 — o dourado foi regenerado contra o mesmo commit e as 275
   fotos antigas ficaram iguais; só entraram casos */
t(`o dourado tem as ${N_DA_PAUTA} fotos, de um commit`, D.fotos.length === N_DA_PAUTA && /^[0-9a-f]{7,}$/.test(D.commit), D.commit);
t("o recorte corre de novo e dá as mesmas fotos (o dourado não é de outra árvore)", conta(R) === N_DA_PAUTA, `${conta(R)}/${N_DA_PAUTA}`);
t("o escopo do recorte não achou nome sem dublê (faltas: 0)", R.every((f) => f.faltas.length === 0), R.flatMap((f) => f.faltas).slice(0, 5).join());
const comRede = R.filter((f) => f.redeInteira);
t("o pedido chega à rede em quase todos (os que estouram são o lixo e a ficha torta)", comRede.length >= N_DA_PAUTA - 16, `${comRede.length}/${N_DA_PAUTA}`);
t("o pedido que vai à rede é o de chamarMestre: o teto, o formato, a tarefa e o cache são os da tabela",
  comRede.every((f) => f.redeInteira[2] === PEDIDO_AO_NARRADOR.maxTokens && f.redeInteira[3] === PEDIDO_AO_NARRADOR.formato && f.redeInteira[4] === PEDIDO_AO_NARRADOR.tarefa && f.redeInteira[5] === PEDIDO_AO_NARRADOR.comCache));
t("a frase do jogador vai na última mensagem", comRede.filter((f, j) => { const k = CASOS[R.indexOf(f)]; const m = f.redeInteira[1]; const u = m[m.length - 1]; return !k.entrada.conteudo || (u && u.role === "user" && String(u.content).includes(String(k.entrada.conteudo))); }).length === comRede.length);

sec(`2. A peça contra o recorte: ${N_DA_PAUTA}/${N_DA_PAUTA}`);
const P = await correrOsCasos(D, { lado: "peca", peca: oPedidoDoTurno });
const iguais = conta(P);
t(`peça = recorte em ${iguais}/${N_DA_PAUTA} — o pedido à rede byte a byte, a saída, os refs do fim e as portas`, iguais === N_DA_PAUTA);
t("os que estouram estouram igual (e entregam ao App o que já tinham escrito)", P.every((f, i) => (f.erro === null) === (D.fotos[i].erro === null)));
{
  const tam = comRede.map((f) => f.tamRede);
  console.log(`  (o pedido à rede: de ${Math.min(...tam)} a ${Math.max(...tam)} caracteres; o system de ${Math.min(...comRede.map((f) => f.system.length))} a ${Math.max(...comRede.map((f) => f.system.length))})`);
}

sec("3. O que os casos percorrem");
{
  const n = (p) => CASOS.filter(p).length;
  t("o pedido da escuta (o de verdade) em ≥200 casos, e sem ele em ≥20 (medido: 248)", n((k) => k.entrada.pedidoEsc) >= 200 && n((k) => !k.entrada.pedidoEsc) >= 20, String(n((k) => k.entrada.pedidoEsc)));
  t("o histórico-base vem em ≥20 casos, e o histórico salta a âncora (≥49 mensagens) em ≥80", n((k) => k.entrada.histBase) >= 20 && n((k) => k.render.historico.length >= 49) >= 80);
  t("a estrada (em viagem ou acampado) em ≥25 casos", n((k) => k.estado.jornada || k.estado.acampado) >= 25, String(n((k) => k.estado.jornada || k.estado.acampado)));
  t("a luta em ≥30, a masmorra em ≥20 (medido: 35 e 25)", n((k) => k.estado.combate) >= 30 && n((k) => k.estado.masmorra) >= 20);
  const portas = P.flatMap((f) => f.portas.map((p) => p[0]));
  t("as portas são vistas: o calou e o pushMsgs", portas.includes("calou") && portas.includes("pushMsgs"), [...new Set(portas)].join());
}

sec(`4. A prova morde: o recorte mordido muda fotos (em ${PARA_MORDER.length} casos)`);
const MORDIDAS_DO_RECORTE = [
  ["a nota juntada com espaço", 'const nota = [pauta, ...doTurno].filter(Boolean).join("\\n");', 'const nota = [pauta, ...doTurno].filter(Boolean).join(" ");'],
  ["a escuta que não corta", "doTurno = rEsc.ficam;", "doTurno = doTurno;"],
  ["a estrada que não segura", "if (fe.seguram.length || fe.amarrados.length) {", "if (false) {"],
  ["a frase que não vai por último", "if (fecho) pedidoFinal = ", "if (false) pedidoFinal = "],
  ["o QUEM É que nunca coube", "pauta.includes(pq.linha) ?", "false ?"],
  ["o rodapé à meia-noite", "oRodapeDoTurno({ dia: diaRef.current, minuto: minutoRef.current", "oRodapeDoTurno({ dia: diaRef.current, minuto: 0"],
  ["o histórico-base esquecido", "const base = histBase ?? historico;", "const base = historico;"],
  ["os sinais sem a frase", "emJogoNoTurno({ frase: conteudo,", 'emJogoNoTurno({ frase: "",'],
  ["a nota que não se esvazia", 'notaRef.current = "";', "notaRef.current = notaRef.current;"],
  ["a banca aberta na masmorra", 'const merc = masmorraRef.current ? "" : ', "const merc = false ? \"\" : "],
  ["o system sem o cânone", "canoneRef.current, { ...bancoNomesRef.current", "{}, { ...bancoNomesRef.current"],
  ["a rede fora da ordem do cache", "pedido = pedidoNaOrdemDoCache(system, pedido.messages);", "pedido = pedido;"],
  ["a rede sem a janela ancorada", "messages: janelaAncorada(historico)", "messages: historico"],
];
/* a chamada mordida (secção 5): o App sem `aplicar`, a entrada sem a escuta, o histórico-base vazio */
const DA_CHAMADA = [{ semAplicar: true }, { entradaExtra: { pedidoEsc: null } }, { entradaExtra: { histBase: [] } }];
const CONTAS = await morderEmParalelo(ONDE, [
  ...MORDIDAS_DO_RECORTE.map(([, de, para]) => ({ lado: "recorte", trocas: [[de, para]], casos: IDX })),
  ...DA_CHAMADA.map((opcoes) => ({ lado: "peca", opcoes, casos: IDX })),
]);
const MORDEU_R = {};
MORDIDAS_DO_RECORTE.forEach(([nome], j) => {
  const d = CONTAS[j];
  MORDEU_R[nome] = d;
  t(`mordida: ${nome} — muda ${d} fotos`, d > 0);
});

sec("5. A prova vê o que a peça promete (chamada e escopo, sem ler o texto dela)");
{
  const [semAplicar, semEscuta, semHist] = CONTAS.slice(MORDIDAS_DO_RECORTE.length);
  t(`o App sem \`aplicar\` não vê o que a montagem escreveu — muda ${semAplicar} fotos`, semAplicar > 0);
  t(`a entrada manda: sem o pedido da escuta, muda ${semEscuta} fotos`, semEscuta > 0);
  t(`o histórico-base manda: vazio, muda ${semHist} fotos`, semHist > 0);
  /* o escopo do recorte acusa o nome que nenhum dublê dá */
  const [f] = await correrOsCasos(D, { lado: "recorte", trocas: [["const grp = resumoGrupoPrompt(p.grupo || []);", "const grp = resumoGrupoDeOutroNome(p.grupo || []);"]], casos: [CASOS[1]] });
  t("o recorte com um nome sem dublê acusa-o em `faltas`", f.faltas.includes("resumoGrupoDeOutroNome"), f.faltas.join());
}

sec("6. O estado não se muta, e a mesma entrada dá o mesmo pedido");
{
  const gelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); for (const v of Object.values(x)) gelar(v); } return x; };
  let iguaisG = 0, erroG = "";
  for (const k of CASOS.filter((x) => x.i % 5 === 0)) {
    const e = JSON.parse(JSON.stringify({ ...k.estado, render: k.render }));
    const ent = JSON.parse(JSON.stringify({ frase: k.entrada.conteudo, ...k.entrada }));
    delete ent.conteudo;
    const antes = JSON.stringify(e);
    /* a pauta sorteia (o aliado que fala, a resposta da ameaça): as duas voltas com a mesma semente */
    const portas = { aplicar: () => {} };
    try {
      const a = oPedidoDoTurno(gelar(e), gelar({ ...ent, sorte: rng(hashSemente("gelo-" + k.i)) }), portas);
      const b = oPedidoDoTurno(JSON.parse(antes), { ...JSON.parse(JSON.stringify(ent)), sorte: rng(hashSemente("gelo-" + k.i)) }, portas);
      if (JSON.stringify(a.pedido) === JSON.stringify(b.pedido) && JSON.stringify(e) === antes) iguaisG++;
    } catch (x) { if (k.i < N_CASOS - 2 && !D.fotos[k.i].erro) erroG = erroG || `${k.i}: ${x.message}`; else iguaisG++; }
  }
  const n = CASOS.filter((x) => x.i % 5 === 0).length;
  t(`sobre o estado congelado até ao fundo, o mesmo pedido (${iguaisG}/${n})`, iguaisG === n && !erroG, erroG);
  const k = CASOS[7];
  const ent = { frase: k.entrada.conteudo, ...k.entrada, sorte: rng(hashSemente("pedido-7")) };
  const ent2 = { ...ent, sorte: rng(hashSemente("pedido-7")) };
  const a = oPedidoDoTurno(JSON.parse(JSON.stringify({ ...k.estado, render: k.render })), ent, {});
  const b = oPedidoDoTurno(JSON.parse(JSON.stringify({ ...k.estado, render: k.render })), ent2, {});
  t("a mesma semente dá o mesmo pedido, byte a byte", JSON.stringify(a.pedido) === JSON.stringify(b.pedido) && a.pedido.messages.length > 0);
  /* o system da rede é o da montagem arrumado na ordem do cache: o que vira a cada turno desce para a mensagem do turno */
  t("o system da montagem fica no ref, e o da rede é o começo dele, arrumado para o cache", typeof a.escritas.system === "string" && a.escritas.system.length > 1000 && a.pedido.system.length > 1000 && a.pedido.system.length <= a.escritas.system.length);
}

sec("7. O lixo: estoura onde o App estoura, e nunca antes de entregar o que escreveu");
{
  /* sem ficha nenhuma, o system não se monta — no App também não (`fichaTexto` lê os atributos), e é o caso que o dourado guarda como erro */
  for (const [nome, e, ent, p] of [["estado nulo", null, null, null], ["estado vazio", {}, {}, {}]]) {
    let erro = "";
    try { oPedidoDoTurno(e, ent, p); } catch (x) { erro = x.message; }
    t(`${nome}: só estoura onde o App estoura — o system sem ficha`, /forca|atributos/.test(erro), erro);
  }
  {
    const k = CASOS[3];
    let erro = "", r = null;
    try { r = oPedidoDoTurno({ ...JSON.parse(JSON.stringify(k.estado)), render: k.render }, { frase: "olá" }, null); } catch (x) { erro = x.message; }
    t("portas nulas e entrada mínima: o pedido sai na mesma", !erro && r && r.pedido.messages.length > 0, erro);
  }
  let entregues = null;
  try { oPedidoDoTurno({ mapa: { cidades: [] } }, { frase: "x" }, { aplicar: (x) => { entregues = Object.keys(x); } }); } catch { /* o system sem ficha */ }
  t("quando estoura, o que já escreveu chegou ao App", Array.isArray(entregues) && entregues.length > 0, String(entregues));
}

sec("8. As tabelas são as do App");
{
  const mods = await osModulos(D.imports), padroes = osPadroes(D, mods);
  const refsD = Object.entries(D.refs).filter(([ref]) => Object.values(REFS_DO_PEDIDO).some((r) => r.ref === ref));
  const tortos = Object.entries(REFS_DO_PEDIDO).filter(([c, r]) => !(D.refs[r.ref] && D.refs[r.ref].campo === c && D.refs[r.ref].salvo === r.salvo && JSON.stringify(r.padrao()) === JSON.stringify(padroes[r.ref]())));
  t("cada ref da peça é um ref do recorte, com o mesmo campo, salvo e valor de partida", tortos.length === 0, tortos.map(([c]) => c).join());
  t(`a peça lê ${Object.keys(REFS_DO_PEDIDO).length} dos ${Object.keys(D.refs).length} refs do recorte (o resto é da pauta, que é a peça dela)`, refsD.length === Object.keys(REFS_DO_PEDIDO).length && refsD.length < Object.keys(D.refs).length);
  t("o render da peça é o do recorte", JSON.stringify([...RENDER_DO_PEDIDO].sort()) === JSON.stringify([...D.render].sort()));
  t("a entrada da peça é o que `enviar` escreveu antes do trecho (a frase é `frase`)", JSON.stringify([...ENTRADA_DO_PEDIDO].sort()) === JSON.stringify(D.entrada.map((n) => (n === "conteudo" ? "frase" : n)).sort()), ENTRADA_DO_PEDIDO.join());
}

console.log(`\n${ok} ok, ${mal} mal`);
console.log(`(as mordidas do recorte: ${Object.entries(MORDEU_R).map(([k, v]) => `${k} ${v}`).join(" · ")})`);
process.exit(mal ? 1 : 0);
