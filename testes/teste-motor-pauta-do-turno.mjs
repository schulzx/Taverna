/* ============================================================
   A PAUTA DO TURNO, NO MOTOR (Fase 4, trilha B, 29/10/2026) — testes/teste-motor-pauta-do-turno.mjs

   A `pautaDoTurno` e as 50 funções do App que ela chama ganharam peça em
   src/motor/pauta-do-turno.js: `aPautaDoTurno(estado, entrada, portas)`. É
   o primeiro passo da ordem que o inventário de 14bde83 propôs para o
   `/api/turno` — a pauta montável em Node a partir do estado.

   Aqui a peça é provada contra o recorte à letra do App (`pauta-dourado.json`,
   de `gerar-pauta-dourado.mjs`) sobre os 275 casos de `pauta-bloco.mjs`: o
   texto que vai ao Narrador byte a byte, a pauta, os 82 refs do fim e a
   ordem das portas (o calou, a ficha, e o pushMsgs com a foto dos refs no
   instante em que o App recebe a palavra). E a prova tem de morder: o
   recorte mordido (o sino que não se apaga, o turno do juiz errado, a
   ordem trocada…) e o contrato mordido pelo lado de fora (a escrita que
   chega ao App depois do pushMsgs, o App sem `aplicar`, o render que não
   vem, o calou que não devolve a lista) TÊM de mudar fotos. A suíte não
   lê o texto de src/motor/ (a catraca teste-assercoes-de-texto): a peça
   prova-se jogando.

   Depois, o que só a peça promete: não muta o estado que recebe (corre
   sobre o estado congelado e dá o mesmo), o lixo não a derruba, a tabela
   dos refs é a do App, e o teto da pauta não mexeu.
   ============================================================ */
import { lerODourado, correrOsCasos, casosDaPauta, fotoGuardada, mesmaFoto, osModulos, osPadroes, N_CASOS, N_GRAVADOS } from "./pauta-bloco.mjs";
import { aPautaDoTurno, REFS_DA_PAUTA, RENDER_DA_PAUTA } from "../src/motor/pauta-do-turno.js";
import { SECOES, TETO_DA_PAUTA } from "../src/pauta.js";
import { semearACasa, rng, hashSemente } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const D = lerODourado();
const CASOS = casosDaPauta();
const conta = (fotos) => fotos.reduce((a, f, i) => a + (mesmaFoto(fotoGuardada(f, i), D.fotos[i]) ? 1 : 0), 0);
/* as mordidas correm sobre 193 dos 275 (os pares, os do aliado que vai embora e as lutas com golpes da rodada):
   a suíte inteira corre ~17 vezes os casos, e o rodar-tudo dá 120 s a cada uma */
const PARA_MORDER = CASOS.filter((k) => k.i % 2 === 0 || k.i % 10 === 1 || k.i % 10 === 7);
const diferem = (fotos) => fotos.reduce((a, f, j) => a + (mesmaFoto(fotoGuardada(f, PARA_MORDER[j].i), D.fotos[PARA_MORDER[j].i]) ? 0 : 1), 0);

sec("1. O dourado: o recorte à letra, e o recorte de novo dá as mesmas fotos");
t(`o dourado é de um commit (${D.commit}) e tem 275 fotos`, /^[0-9a-f]{7,}$/.test(D.commit) && D.fotos.length === N_CASOS && N_CASOS === 275);
t(`55 recortes: a pautaDoTurno, 50 funções do componente, os 2 valores do render e os 2 do módulo`, D.recortes.length === 55
  && D.recortes.filter((r) => r.de === "componente").length === 51 && D.recortes.filter((r) => r.de === "render").length === 2 && D.recortes.filter((r) => r.de === "modulo").length === 2);
t("o pushMsgs NÃO está no recorte (é porta)", !D.recortes.some((r) => r.nome === "pushMsgs"));
t(`82 refs, ${Object.values(D.refs).filter((r) => r.escreve).length} escritos pela pauta`, Object.keys(D.refs).length === 82);
t(`os casos: ${N_GRAVADOS} turnos gravados (sessões 8–10) e ${N_CASOS - N_GRAVADOS} só da prova`, N_GRAVADOS === 194);
const RECORTE = await correrOsCasos(D, { lado: "recorte", casos: CASOS });
t(`o recorte, corrido de novo com as dependências de hoje, dá as fotos do dourado (${conta(RECORTE)}/275 — se cair, regenere com gerar-pauta-dourado.mjs)`, conta(RECORTE) === N_CASOS);
t("nenhum nome do recorte ficou sem dublê (faltas vazias nos 275)", RECORTE.every((f) => f.faltas.length === 0));

sec("2. A peça contra o recorte: 275/275");
const PECA = await correrOsCasos(D, { lado: "peca", peca: aPautaDoTurno, casos: CASOS });
t(`as fotos da peça são as do dourado (${conta(PECA)}/275): o texto, a pauta, os refs do fim, as portas`, conta(PECA) === N_CASOS);
t("o texto ao Narrador é o mesmo, byte a byte, nos 275", PECA.every((f, i) => f.texto === RECORTE[i].texto));
t("os refs do fim são os mesmos, campo a campo", PECA.every((f, i) => JSON.stringify(f.refs) === JSON.stringify(RECORTE[i].refs)));
t("as portas na mesma ordem (calou, setPersonagem, pushMsgs com a foto dos refs)", PECA.every((f, i) => JSON.stringify(f.portas) === JSON.stringify(RECORTE[i].portas)));
t("os que estouram estouram igual (6, com a mesma mensagem)", PECA.filter((f) => f.erro).length === 6 && PECA.every((f, i) => f.erro === RECORTE[i].erro));

sec("3. O que os casos percorrem");
let comPush = 0, comCalou = 0, comFicha = 0;
for (const f of PECA) {
  if (f.portas.some((p) => p[0] === "pushMsgs")) comPush++;
  if (f.portas.some((p) => p[0] === "calou")) comCalou++;
  if (f.portas.some((p) => p[0] === "setPersonagem")) comFicha++;
}
const vivos = {};
for (const f of PECA) for (const s of Object.keys(f.pautaObj || {})) vivos[s] = (vivos[s] || 0) + 1;
const FALTAM = ["forma", "foraDeCena", "volta"];
const POUCOS = SECOES.map((s) => s.id).filter((s) => !FALTAM.includes(s) && !(vivos[s] >= 5));
t(`toda secção da pauta aparece em ≥5 casos, salvo ${FALTAM.join(", ")} (que pedem um mundo com mais estrada)${POUCOS.length ? " — poucos: " + POUCOS.join(",") : ""}`, POUCOS.length === 0,
  SECOES.map((s) => `${s.id} ${vivos[s.id] || 0}`).join(" · "));
t(`o pushMsgs (o aliado que vai embora) em ${comPush} casos, a ficha em ${comFicha}, o calou em ${comCalou}`, comPush >= 4 && comFicha >= 4 && comCalou >= 5);
t("o texto nunca passa do teto da pauta (TETO_DA_PAUTA, que não mexeu: 1400)", TETO_DA_PAUTA === 1400 && D.fotos.every((f) => f.tam <= TETO_DA_PAUTA));

sec(`4. A prova morde: o recorte mordido muda fotos (em ${PARA_MORDER.length} casos)`);
const MORDIDAS_DO_RECORTE = [
  ["o sino que não se apaga", `p = porNaPauta(p, "momento", sinoDoTurnoRef.current); sinoDoTurnoRef.current = "";`, `p = porNaPauta(p, "momento", sinoDoTurnoRef.current);`],
  ["o veto do juiz no turno de agora (sem o +1)", `vetosParaAPauta(vetosDoJuizRef.current, { turno: turnoDeRegistroRef.current + 1,`, `vetosParaAPauta(vetosDoJuizRef.current, { turno: turnoDeRegistroRef.current,`],
  ["o crime que não se limpa", `          crimeDoTurnoRef.current = null;\n`, ``],
  ["o fecho sorteado por outra semente", `"|fecho|" + turnoDeRegistroRef.current`, `"|fecho|" + (turnoDeRegistroRef.current + 1)`],
  ["a cobrança sem a nota", "notaRef.current = `${notaRef.current ? notaRef.current + \"\\n\" : \"\"}${envelopeDoMundo(r)}`;", ""],
  ["a economia sem a cidade", `envelopeDoComercio(cidadeDoMapa(cidadeAtualRef.current), diaRef.current)`, `envelopeDoComercio(null, diaRef.current)`],
  ["o EM CENA antes do cederNaCena (a ordem trocada)", `      p = cederNaCena(p, { luta: !!combateRef.current, masmorra: !!masmorraRef.current, arredores: fora });`, `      p = cederNaCena(pautaComEmCena(p, montarEmCena(contextoDoEmCena(acaoDoTurno, aqui)), { luta: !!combateRef.current, turno: turnoDeRegistroRef.current + 1 }), { luta: !!combateRef.current, masmorra: !!masmorraRef.current, arredores: fora });`],
  ["o aliado que vai embora sem dizer", "    pushMsgs([{ autor: \"sistema\", texto: `${quem} pegou as coisas dele e foi embora.` }]);\n", ""],
  ["a vista da luta sem os golpes da rodada", `golpes: gR && gR.rodada === (cV.rodada || 1) - 1 ? gR.golpes : [] });`, `golpes: [] });`],
  ["quem é: a ficha que não espera a vez", `ultimas: q.ultimas, cenas: q.cenas,`, `ultimas: {}, cenas: {},`],
];
const MORDEU_R = {};
for (const [nome, de, para] of MORDIDAS_DO_RECORTE) {
  const n = diferem(await correrOsCasos(D, { lado: "recorte", trocas: [[de, para]], casos: PARA_MORDER }));
  MORDEU_R[nome] = n;
  t(`${nome}: ${n} fotos mudam`, n > 0);
}

sec("5. A prova vê o que a peça promete (sem ler o texto dela: chamada e recorte mordido)");
/* a catraca teste-assercoes-de-texto proíbe suíte que leia src/motor/: o que
   a peça promete morde-se pelo lado de fora — o recorte mordido no mesmo
   ponto, ou a peça chamada com a porta/o estado de outro jeito */
const MORDIDAS_DO_CONTRATO = [
  ["a escrita que chega ao App DEPOIS de ele ter a palavra (o pushMsgs vê os refs)", "recorte", [
    ["mem[quem] = { ...mem[quem], saiu: true };\n    aliadosRef.current = mem;\n", "mem[quem] = { ...mem[quem], saiu: true };\n"],
    ["pegou as coisas dele e foi embora.` }]);\n", "pegou as coisas dele e foi embora.` }]);\n    aliadosRef.current = mem;\n"]]],
  ["o calou que não devolve a lista vazia", "recorte", [[`} catch (e) { return calou("pessoasDaCena", e); }`, `} catch (e) { calou("pessoasDaCena", e); return undefined; }`]]],
  ["o App que não recebe o que a pauta escreveu (sem portas.aplicar)", "peca", (e, en, p) => aPautaDoTurno(e, en, { ...p, aplicar: undefined })],
  ["o render que não vem (vale o do estado)", "peca", (e, en, p) => aPautaDoTurno({ ...e, render: {} }, en, p)],
  ["o campo ausente que chega nulo em vez do valor de partida", "peca", (e, en, p) => aPautaDoTurno({ ...Object.fromEntries(Object.keys(REFS_DA_PAUTA).map((c) => [c, null])), ...Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined)) }, en, p)],
];
const MORDEU_P = {};
for (const [nome, lado, x] of MORDIDAS_DO_CONTRATO) {
  const fotos = lado === "recorte" ? await correrOsCasos(D, { lado, trocas: x, casos: PARA_MORDER }) : await correrOsCasos(D, { lado, peca: x, casos: PARA_MORDER });
  const n = diferem(fotos);
  MORDEU_P[nome] = n;
  t(`${nome}: ${n} fotos mudam`, n > 0);
}

sec("6. O estado não se muta");
const fundo = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); for (const v of Object.values(x)) fundo(v); } return x; };
let iguais = 0, intactos = 0;
const mods = await osModulos(D.imports);
for (const [i, k] of CASOS.entries()) {
  const antes = JSON.stringify(k.estado);
  const congelado = fundo({ ...JSON.parse(antes), render: JSON.parse(JSON.stringify(k.render)) });
  let r = null, erro = null;
  semearACasa("pauta|" + k.i);
  try { r = aPautaDoTurno(congelado, { frase: k.frase }, {}); } catch (e) { erro = String(e && e.message); }
  const { render, ...sem } = congelado; void render;
  if (JSON.stringify(sem) === antes) intactos++;
  if ((erro === null) === (PECA[i].erro === null) && (!r || JSON.stringify(r.pauta) === JSON.stringify(PECA[i].pautaObj))) iguais++;
}
t(`sobre o estado congelado até ao fundo, a peça dá a mesma pauta (${iguais}/275) — nada se escreve por dentro do que entrou`, iguais === N_CASOS);
t(`e o estado que entrou sai como entrou (${intactos}/275)`, intactos === N_CASOS);
t("as escritas voltam inteiras, e só nos campos que a tabela diz que a pauta escreve", PECA.every((f) => !f.ret || Object.keys(f.ret.escritas).every((c) => REFS_DA_PAUTA[c] && REFS_DA_PAUTA[c].escreve)));
t("o que o aplicar recebeu, somado, é o que volta em escritas", PECA.every((f) => !f.ret || JSON.stringify([...new Set(f.aplicados)].sort()) === JSON.stringify(Object.keys(f.ret.escritas).sort())));

sec("7. O lixo não a derruba, e a mesma entrada dá a mesma pauta");
for (const [nome, args] of [["tudo nulo", [null, null, null]], ["nada", []], ["estado vazio", [{}, { frase: "olho em volta" }, {}]], ["entrada que é texto", [{}, "ataco", {}]], ["portas que são lixo", [{}, {}, { calou: 5, pushMsgs: "x", aplicar: null }]], ["render que é lixo", [{ render: 7 }, {}, {}]]]) {
  let r = null, erro = null;
  try { r = aPautaDoTurno(...args); } catch (e) { erro = e.message; }
  t(`${nome}: devolve pauta e escritas`, !erro && r && r.pauta && typeof r.pauta === "object" && r.escritas && typeof r.escritas === "object", erro);
}
{
  const k = CASOS.find((x) => x.i === 202);
  const um = (sorte) => JSON.stringify(aPautaDoTurno({ ...JSON.parse(JSON.stringify(k.estado)), render: k.render }, { frase: k.frase, sorte }, {}));
  semearACasa("x"); const a = um(); semearACasa("x"); const b = um();
  t("duas vezes o mesmo caso com a mesma sorte da casa: a mesma pauta e as mesmas escritas", a === b);
  /* a sorte injetada manda, e a da casa volta ao que era no fim */
  /* a casa semeada de dois jeitos diferentes, e a mesma sorte injetada: o mesmo resultado */
  semearACasa("p"); const comA = um(rng(hashSemente("semente-a")));
  semearACasa("q"); const comA2 = um(rng(hashSemente("semente-a")));
  t("com entrada.sorte semeada, a mesma semente dá a mesma pauta — seja qual for a sorte da casa", comA === comA2);
  const varia = CASOS.filter((x) => x.i >= N_GRAVADOS && x.i % 10 === 1).some((x) => {
    const r1 = JSON.stringify(aPautaDoTurno({ ...JSON.parse(JSON.stringify(x.estado)), render: x.render }, { frase: x.frase, sorte: rng(hashSemente("a")) }, {}).pauta);
    const r2 = JSON.stringify(aPautaDoTurno({ ...JSON.parse(JSON.stringify(x.estado)), render: x.render }, { frase: x.frase, sorte: rng(hashSemente("b")) }, {}).pauta);
    return r1 !== r2;
  });
  t("e a sorte entra mesmo: outra semente muda a pauta em algum caso (o aliado que fala)", varia);
}

sec("8. As tabelas são as do App");
const campos = Object.values(D.refs).map((r) => r.campo).sort();
t("REFS_DA_PAUTA tem um campo por ref do recorte, e mais nenhum", JSON.stringify(Object.keys(REFS_DA_PAUTA).sort()) === JSON.stringify(campos));
t("cada campo diz o ref do App, se o save o guarda e se a pauta o escreve", Object.entries(D.refs).every(([ref, r]) => REFS_DA_PAUTA[r.campo].ref === ref && REFS_DA_PAUTA[r.campo].salvo === r.salvo && REFS_DA_PAUTA[r.campo].escreve === r.escreve));
t(`o campo é o do save quando o save o guarda (contRef → contadores, aberturaMundoRef → abertura, elencoSaveRef → elenco)`, REFS_DA_PAUTA.contadores.ref === "contRef" && REFS_DA_PAUTA.abertura.ref === "aberturaMundoRef" && REFS_DA_PAUTA.elenco.ref === "elencoSaveRef");
const padroesDoApp = osPadroes(D, mods);
t("o valor de partida de cada campo é o do useRef do App", Object.entries(D.refs).every(([ref, r]) => JSON.stringify(REFS_DA_PAUTA[r.campo].padrao()) === JSON.stringify(padroesDoApp[ref]())));
t("o valor de partida nasce novo a cada pedido (não é o mesmo objeto)", REFS_DA_PAUTA.cobradas.padrao() !== REFS_DA_PAUTA.cobradas.padrao());
t(`RENDER_DA_PAUTA é o estado React que o recorte lê (${RENDER_DA_PAUTA.join(", ")})`, JSON.stringify([...RENDER_DA_PAUTA].sort()) === JSON.stringify(D.render.filter((n) => n !== "setPersonagem").sort()));
{
  /* o mercado do render manda: o App passa o do último render, e é ele que a pauta lê */
  const compra = CASOS.filter((x) => x.i >= N_GRAVADOS && /quanto custa|compro/.test(x.frase || "") && x.estado.cidadeAtual && !x.estado.masmorra);
  const mudou = compra.filter((k) => {
    semearACasa("m"); const comVazio = aPautaDoTurno({ ...JSON.parse(JSON.stringify(k.estado)), render: { ...k.render, mercadoAqui: [] } }, { frase: k.frase }, {});
    semearACasa("m"); const semNada = aPautaDoTurno({ ...JSON.parse(JSON.stringify(k.estado)), render: k.render }, { frase: k.frase }, {});
    return JSON.stringify(comVazio.pauta) !== JSON.stringify(semNada.pauta);
  }).length;
  t(`o mercadoAqui do render, quando vem, é o que a pauta lê; sem ele, refaz-se (${mudou} de ${compra.length} compras mudam com a banca vazia)`, compra.length > 0 && mudou > 0);
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
console.log(`(as mordidas do recorte: ${Object.entries(MORDEU_R).map(([k, v]) => `${k} ${v}`).join(" · ")})`);
console.log(`(as mordidas do contrato: ${Object.entries(MORDEU_P).map(([k, v]) => `${k} ${v}`).join(" · ")})`);
if (mal) process.exit(1);
