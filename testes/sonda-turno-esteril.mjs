/* ============================================================
   A SONDA DO TURNO ESTÉRIL (X1) — a régua que X4 vai repetir

   POR QUE ELA EXISTE. X1 mediu a taxa de turnos estéreis com sondas no
   scratchpad, e o scratchpad não sobrevive à sessão. X4 tem de refazer
   ESTA MESMA conta depois de X2, e dois números só são comparáveis se
   saírem do mesmo procedimento — por isso a medida vira régua
   permanente, no molde de `regua-combate.mjs`.

   COMO SE USA:
       node testes/sonda-turno-esteril.mjs

   Ela NÃO entra no `rodar-tudo.mjs` (que varre `teste-*` e `check-*`):
   é instrumento de medida, roda à mão, e imprime. Quem afirma os
   números é `teste-acoes-do-jogador.mjs`.

   DETERMINISMO. Não há aleatoriedade aqui: a sonda pergunta se o
   caminho de código PODE mudar um número, não qual número saiu. Mesma
   entrada, mesma saída, em qualquer máquina — que é o único árbitro que
   um sistema sem servidor tem.

   O QUE ELA NÃO FAZ. Não roda o `App.jsx` (é React). Ela compõe os
   módulos puros — `grid.js`, `desafios.js`, `agressao.js`, `turno.js` —
   e modela a fiação que foi LIDA COMO TEXTO. Essa é a limitação
   honesta da medição, e é `check-acoes-do-jogador.mjs` quem guarda que
   o modelo ainda descreve o código.
   ============================================================ */

import {
  ACOES_DO_JOGADOR, TURNO_ESTERIL, ABERTURA_FORA_DE_ALCANCE, MOTOR_SEM_CHAMADOR,
  NUMERO_QUE_MUDA, NAO_CONTA_COMO_NUMERO,
  acoesDeCombateSemMotor, contarPorClique, contarPorTexto, contarCombate,
} from "./acoes-do-jogador.mjs";
const G = await import("../src/grid.js");
const D = await import("../src/desafios.js");

const L = (...a) => console.log(...a);
const barra = (n = 72) => L("=".repeat(n));
const pct = (a, b) => ((a / b) * 100).toFixed(1) + "%";

barra();
L("A SONDA DO TURNO ESTÉRIL — Taverna, Fase X");
barra();

L("\nO QUE CONTA COMO 'UM NÚMERO MUDOU':");
for (const n of NUMERO_QUE_MUDA) L("  · " + n);
L("\nO QUE NÃO CONTA, E POR QUÊ:");
for (const n of NAO_CONTA_COMO_NUMERO) L(`  · ${n.o}\n      ${n.porque}`);

/* ============================================================
   SESSÃO A — a política fixa. É este número que X4 compara.
   ============================================================ */
const P = TURNO_ESTERIL.politicaDaSessaoA;
barra();
L("SESSÃO A — a política fixa de X1");
barra();
L(`  planta ${P.planta} · ${P.inimigos} inimigo${P.inimigos > 1 ? "s" : ""} (ágil: ${P.inimigoAgil})`);
L(`  herói: ${P.heroi}`);
L(`  a cada turno o jogador faz: ${P.acaoPorTurno} — e nada mais\n`);

const grade = G.montarGrade({ local: P.planta });
/* a armadilha: conferir a grade recebida antes de acreditar no número */
const g = G.garantirGrade(grade);
L(`  grade recebida: ${g.largura}x${g.altura} (cenário "${g.cenario}")`);
if (g.cenario !== P.planta) L(`  !! atenção: cenárioDe caiu em "${g.cenario}" — ver TURNO_ESTERIL.armadilhaDaGrade`);

const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "Bandido", vida: 11 }] });
const eu = pos.heroi, inim = pos.inimigos[0];
L(`  abertura: ${G.distanciaM(eu, inim).toFixed(1)} m · alcance do golpe: ${G.alcanceNatural(eu).toFixed(1)} m\n`);

let estereis = 0, rolagens = 0;
for (let turno = 1; turno <= P.turnos; turno++) {
  const r = G.alcanca(grade, eu, inim, { alcanceM: G.alcanceNatural(eu) });
  if (r.ok) { rolagens++; L(`  turno ${turno}  FÉRTIL   rola o d20, aplica dano, revide`); }
  else { estereis++; L(`  turno ${turno}  estéril  ${r.motivo} → recusa sem custo (App.jsx:13223)`); }
}
L(`\n  ${TURNO_ESTERIL.formula}`);
L(`  taxa_esteril = ${estereis} / ${P.turnos} = ${pct(estereis, P.turnos)}`);
L(`  rolagens: ${rolagens} · revides: 0 (a recusa não gasta a ação, logo a rodada não vira)`);

/* ============================================================
   SESSÃO B — o mesmo jogador, andando antes
   ============================================================ */
barra();
L("SESSÃO B — o jogador que descobre o grid");
barra();
let bEu = { ...eu }, bEst = 0, bFer = 0;
const ocup = new Set([`${inim.x},${inim.y}`]);
for (let turno = 1; turno <= P.turnos; turno++) {
  const podeBater = G.alcanca(grade, bEu, inim, { alcanceM: G.alcanceNatural(bEu) }).ok;
  if (podeBater) { bFer++; L(`  turno ${turno}  FÉRTIL   golpe: rola o d20`); continue; }
  /* anda o melhor passo do orçamento, pelo caminho real */
  const cands = [...G.alcancaveisDe(grade, bEu, { ocupados: ocup, deslocamentoM: G.DESLOCAMENTO_PADRAO })]
    .map((k) => { const [x, y] = k.split(",").map(Number); return { x, y }; });
  cands.sort((a, b) => G.distanciaM(a, inim) - G.distanciaM(b, inim));
  if (cands.length && G.distanciaM(cands[0], inim) < G.distanciaM(bEu, inim)) {
    bEu = { ...bEu, x: cands[0].x, y: cands[0].y };
    bFer++; L(`  turno ${turno}  FÉRTIL   andou até ${G.distanciaM(bEu, inim).toFixed(1)} m (x,y mudou)`);
  } else { bEst++; L(`  turno ${turno}  estéril  sem passo que aproxime`); }
}
L(`\n  taxa_esteril = ${bEst} / ${P.turnos} = ${pct(bEst, P.turnos)}   (férteis: ${bFer})`);
L("  o preço: 2 a 3 turnos inteiros só andando antes do primeiro golpe.");

/* ============================================================
   SESSÃO C — exploração e a repetição
   ============================================================ */
barra();
L("SESSÃO C — fora de combate, painel rápido, duas voltas no mesmo lugar");
barra();
let tent = {};
const ctx = (t) => ({
  personagem: { nome: "Bram", nivel: 3, atributos: { for: 15, des: 13, con: 14, int: 10, sab: 12, car: 11 }, pericias: {} },
  semente: "x1-semente-fixa", lugar: "taverna", emCombate: false, tentativas: t, dia: 1,
  pessoaDe: () => null, fama: 0, ehPessoaConhecida: () => false, achadoDe: () => null,
});
let cEst = 0, cTot = 0;
for (const volta of [1, 2]) {
  L(`\n  volta ${volta}:`);
  for (const a of D.ACOES_RAPIDAS) {
    const frase = D.fraseDaAcaoRapida(a.id, "");
    let v = null;
    try { const r = D.lerAcao(frase, ctx(tent)); v = (!r || (r.tipo === "livre" && !r.chave)) ? null : r; } catch { v = null; }
    const fertil = !!(v && v.tipo === "teste");
    cTot++; if (!fertil) cEst++;
    L(`    ${a.rotulo.padEnd(11)} ${String(v ? v.tipo : "nenhum").padEnd(10)} ${fertil ? "FÉRTIL" : "estéril"}`);
    if (v && v.chave) tent = D.registrarTentativa(tent, v.chave, { resultado: "falha", dia: 1, rotulo: v.rotulo, onde: "taverna" });
  }
}
L(`\n  taxa_esteril = ${cEst} / ${cTot} = ${pct(cEst, cTot)}`);
L("  a primeira volta rola tudo; a segunda bate no livro de tentativas.");

/* ============================================================
   O ESPAÇO DE AÇÕES — os dois eixos
   ============================================================ */
barra();
L("O ESPAÇO DE AÇÕES — o clique e a frase");
barra();
const clique = contarPorClique();
const tFora = contarPorTexto("fora"), tLuta = contarPorTexto("luta");
const comb = contarCombate();
L(`\n  ações medidas: ${ACOES_DO_JOGADOR.length}`);
L(`  CLIQUE  → motor ${clique.motor} · só enche a caixa ${clique.caixa} · sem botão ${clique.nada}`);
L(`  FRASE   fora da luta → motor ${tFora.motor} · cena ${tFora.cena}`);
L(`          na luta      → motor ${tLuta.motor} · cena ${tLuta.cena}`);
L(`\n  RECORTE COMBATE (${comb.total} ações):`);
L(`    clique chega ao motor : ${comb.clique.motor}  (${pct(comb.clique.motor, comb.total)})`);
L(`    clique só enche caixa : ${comb.clique.caixa}`);
L(`    frase chega ao motor  : ${comb.texto.motor}`);
L("\n  as de combate cujo CLIQUE não chega ao motor (a catraca de X2):");
for (const a of acoesDeCombateSemMotor()) L(`    · ${a.rotulo.padEnd(22)} ${a.onde}`);

/* ============================================================
   A ABERTURA — o achado central
   ============================================================ */
barra();
L("A ABERTURA FORA DE ALCANCE");
barra();
L(`\n  ${ABERTURA_FORA_DE_ALCANCE.regra}`);
L(`  alcance corpo a corpo: ${ABERTURA_FORA_DE_ALCANCE.alcanceCorpoACorpo} m · arma de longe: ${ABERTURA_FORA_DE_ALCANCE.alcanceDeArmaLonge} m\n`);
L("  planta      grade    abertura   corpo a corpo   a 36 m");
L("  " + "-".repeat(60));
let recusamCorpo = 0, recusam36 = 0;
for (const p of ABERTURA_FORA_DE_ALCANCE.aberturaPorPlanta) {
  const gr = G.montarGrade(p.planta === "masmorra" ? { emMasmorra: true } : { local: p.planta });
  const po = G.posicionar(gr, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "X", vida: 9 }] });
  const d = G.distanciaM(po.heroi, po.inimigos[0]);
  const corpo = G.alcanca(gr, po.heroi, po.inimigos[0], { alcanceM: G.alcanceNatural(po.heroi) }).ok;
  const longe = G.alcanca(gr, po.heroi, po.inimigos[0], { alcanceM: ABERTURA_FORA_DE_ALCANCE.alcanceDeArmaLonge }).ok;
  if (!corpo) recusamCorpo++;
  if (!longe) recusam36++;
  L(`  ${p.planta.padEnd(11)} ${p.grade.padEnd(8)} ${(d.toFixed(1) + " m").padStart(8)}   ${corpo ? "alcança" : "RECUSA "}         ${longe ? "alcança" : "RECUSA"}`);
}
L(`\n  corpo a corpo recusado no turno 1 : ${recusamCorpo}/10`);
L(`  recusado mesmo a 36 m (parede)     : ${recusam36}/10  — ter alcance não é poder acertar`);
L(`  turnos só andando até o golpe      : ${ABERTURA_FORA_DE_ALCANCE.turnosAndandoAteOGolpe.minimo} a ${ABERTURA_FORA_DE_ALCANCE.turnosAndandoAteOGolpe.maximo}`);
L(`\n  e a recusa é DE GRAÇA: ${ABERTURA_FORA_DE_ALCANCE.recusaDeGraca.naoGastaAcao}`);
L(`  logo ${ABERTURA_FORA_DE_ALCANCE.recusaDeGraca.logo}`);

barra();
L("O MOTOR QUE NENHUM CLIQUE CHAMA");
barra();
for (const m of MOTOR_SEM_CHAMADOR.morto) L(`  morto: ${m.nome} (${m.onde}) — ${m.porque}`);
for (const e of MOTOR_SEM_CHAMADOR.escritoENuncaLido) L(`  escrito e nunca lido: ${e.campo} (${e.escritoEm})`);
L(`  importado pelo App e nunca chamado: ${MOTOR_SEM_CHAMADOR.semClique["combate.js"].join(", ")}`);

barra();
L("PARA X4: repita a SESSÃO A com a mesma política e compare a taxa.");
L(`HOJE: ${estereis}/${P.turnos} estéreis, ${rolagens} rolagens.`);
barra();
