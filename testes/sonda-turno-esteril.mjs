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
  NAO_CONTA_COMO_FRASE, SESSAO_A_PELA_FRASE, O_QUE_NAO_DEU_PARA_MEDIR,
  acoesDeCombateSemMotor, acoesComCliqueCondicional,
  contarPorClique, contarPorTexto, contarCombate,
  contarFunil, contarRecusas, recusasPorFamilia, vozQueNasceNoModulo,
} from "./acoes-do-jogador.mjs";
const G = await import("../src/grid.js");
const D = await import("../src/desafios.js");
/* X2: o módulo do veredito entra na sonda para a seção A′ — ele é puro e
   roda em Node como os outros três. A sessão A de X1 NÃO o usa: ela
   continua perguntando direto a `alcanca`, como perguntava. */
const GOLPE = await import("../src/golpe.js");

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
  else { estereis++; L(`  turno ${turno}  estéril  ${r.motivo} → recusa sem custo (App.jsx:11754)`); }
}
L(`\n  ${TURNO_ESTERIL.formula}`);
L(`  taxa_esteril = ${estereis} / ${P.turnos} = ${pct(estereis, P.turnos)}`);
L(`  rolagens: ${rolagens} · revides: 0 (a recusa não gasta a ação, logo a rodada não vira)`);

/* ============================================================
   SESSÃO A′ — O QUE X2 TORNOU MEDÍVEL, AO LADO E NUNCA POR CIMA

   A CONTA DE CIMA NÃO FOI TOCADA. Mesma política, mesmos sete turnos,
   mesma planta, mesmo inimigo, mesma fórmula: a linha de base de X1
   (7/7 estéreis, 0 rolagens, 0 revides) continua intacta e continua
   sendo o que X4 compara. Mudar a política mudaria os dois lados da
   comparação, e X4 perderia o instrumento.

   O QUE ESTA SEÇÃO ACRESCENTA, e por que ela não podia existir em X1:
   até X1 não havia como perguntar "o golpe alcança?" sem gastar o turno
   — a única resposta vinha DEPOIS do clique, como recusa. X2 criou
   `vereditoDoGolpe` (golpe.js), e com ele o botão passa a nascer
   IMPEDIDO em vez de aceitar o clique e responder que não dá.

   Então a sessão A′ mede a MESMA sessão A por um segundo ângulo: dos
   sete turnos, em quantos o jogador sequer consegue clicar. É a
   diferença entre sete turnos perdidos e sete turnos que o jogo avisou
   que seriam perdidos — e o número é o mesmo 7, o que é exatamente a
   medida honesta: X2 não encurtou a caminhada, tornou-a visível.
   ============================================================ */
barra();
L("SESSÃO A′ — a mesma sessão A, pelo ângulo que X2 abriu");
barra();
L("  (a conta da sessão A acima permanece intacta — esta é medida NOVA, ao lado)\n");
let impedidos = 0;
for (let turno = 1; turno <= P.turnos; turno++) {
  const vd = GOLPE.vereditoDoGolpe({ grade, meuLugar: eu, inimigos: [inim], alcanceM: G.alcanceNatural(eu) });
  const impedido = !vd.algumAoAlcance;
  if (impedido) impedidos++;
  const mp = vd.maisProximo;
  L(`  turno ${turno}  ${impedido ? "IMPEDIDO" : "liberado"}  ${mp ? `${mp.nome} a ${mp.distanciaM} m · razão: ${mp.razao || "—"} · faltam ${vd.faltaM} m` : "sem alvo"}`);
}
L(`\n  taxa_impedida = ${impedidos} / ${P.turnos} = ${pct(impedidos, P.turnos)}`);
L("  o clique não é gasto: o botão fica apagado e a linha diz quantos metros faltam.");
L(`  e a razão é "longe", não "parede" — nesta planta, ANDAR resolve (${ABERTURA_FORA_DE_ALCANCE.turnosAndandoAteOGolpe.minimo} a ${ABERTURA_FORA_DE_ALCANCE.turnosAndandoAteOGolpe.maximo} turnos, ver sessão B).`);

/* E a exceção do eixo do clique, impressa para não virar folclore: qual
   botão se comporta de dois jeitos, e qual é o jeito de cada mundo. */
const cond = acoesComCliqueCondicional();
L(`\n  ações com CLIQUE CONDICIONAL (X2): ${cond.length}`);
for (const a of cond) L(`    · ${a.rotulo.padEnd(10)} na luta → ${a.cliqueChega} · fora → ${a.cliqueChegaFora}`);

/* ============================================================
   SESSÃO A″ — A MESMA SESSÃO A, PELO EIXO DA FRASE (X4)

   AO LADO E NUNCA POR CIMA, como a A′ de X2. A sessão A acima não foi
   tocada: mesma planta, mesmo inimigo, mesmos sete turnos, mesma
   fórmula. Ela é a linha de base que X4 compara, e mudar a política
   mudaria os dois lados da comparação.

   O QUE ESTA SEÇÃO ACRESCENTA. X3b deixou por escrito um eixo que a
   régua não tinha: além de "quantos turnos terminam sem um número
   mudar", dá para contar "quantos terminam sem uma FRASE" — e as duas
   taxas não são a mesma. Deixou junto a correção que impede o número de
   mentir a favor: a voz do combate que o código já tem é, em boa parte,
   a voz de DIZER NÃO, e recusa não é narração de evento.

   O QUE ESTA SESSÃO NÃO SABE, e é a mesma confissão do topo do arquivo.
   Ela NÃO roda o `App.jsx` — é React, e não sobe em Node. O que roda de
   verdade aqui é `grid.js` (o `alcanca` que decide cada turno); a
   fiação que transforma esse veredito em LINHA foi lida como TEXTO e
   está modelada na tabela `FUNIL_DO_COMBATE`. Logo: a sonda conta o que
   o caminho de código PODE empurrar, nunca o que uma partida empurrou.
   É `check-acoes-do-jogador.mjs` quem guarda que o modelo ainda
   descreve o código — e, por isso, a linha de baixo é uma AFIRMAÇÃO
   sobre o código, não uma observação de tela.

   A sessão A é o pior caso de propósito: é o único caminho de combate
   curto o bastante para ser contado linha a linha sem executar o App.
   Todo turno em que o golpe SAI depende de quantos alvos, quantos
   ataques e quantos prazos vencem — e isso está em
   `O_QUE_NAO_DEU_PARA_MEDIR`.
   ============================================================ */
barra();
L("SESSÃO A″ — os mesmos sete turnos, pelo eixo da frase");
barra();
L("  (a conta da sessão A acima permanece intacta — esta é medida NOVA, ao lado)");
L("  (a sonda não roda o App.jsx: ela conta o caminho de código lido como texto)\n");
L("  O QUE NÃO CONTA COMO FRASE, E POR QUÊ:");
for (const n of NAO_CONTA_COMO_FRASE) L(`  · ${n.o}\n      ${n.porque}`);
L("");

let semNumero = 0, semLinha = 0, semNarracao = 0;
let linhasTotais = 0, ecos = 0, recusasDaSessao = 0, narracoes = 0;
for (let turno = 1; turno <= P.turnos; turno++) {
  const r = G.alcanca(grade, eu, inim, { alcanceM: G.alcanceNatural(eu) });
  /* A FIAÇÃO MODELADA, e ela é uma só: sem alcance, `resolverAtaqueJogador`
     devolve `semAlcance` (App.jsx:11783-11787) e `aplicarGolpeDoJogador`
     sai em :11869-11872 empurrando DUAS linhas — o eco do jogador e a
     recusa — e devolvendo `true` ANTES do `enviar(...)` de :11932. Com
     alcance, a mesma função desce até :11920 e empurra o telegrama do
     golpe, que é narração de evento. */
  const eco = 1;
  const recusa = r.ok ? 0 : 1;
  const narracao = r.ok ? 1 : 0;
  const nLinhas = eco + recusa + narracao;
  linhasTotais += nLinhas; ecos += eco; recusasDaSessao += recusa; narracoes += narracao;
  if (!r.ok) semNumero++;
  if (nLinhas === 0) semLinha++;
  if (narracao === 0) semNarracao++;
  L(`  turno ${turno}  sem número: ${r.ok ? "não" : "sim "}  ·  linhas: ${nLinhas} (${eco} eco + ${recusa} recusa + ${narracao} narração)  ·  ${r.ok ? "o golpe sai" : "recusa por alcance (App.jsx:11870)"}`);
}
L(`\n  ${TURNO_ESTERIL.formula}`);
L(`  taxa_esteril      = ${semNumero} / ${P.turnos} = ${pct(semNumero, P.turnos)}   (o eixo de X1)`);
L(`  ${SESSAO_A_PELA_FRASE.formula}`);
L(`  taxa_muda         = ${semLinha} / ${P.turnos} = ${pct(semLinha, P.turnos)}   (turnos que terminam sem UMA linha)`);
L(`  taxa_sem_narracao = ${semNarracao} / ${P.turnos} = ${pct(semNarracao, P.turnos)}   (turnos sem uma frase de EVENTO)`);
L(`\n  as linhas dos ${P.turnos} turnos: ${linhasTotais} — ${recusasDaSessao} recusa, ${narracoes} narração de evento, ${ecos} eco do jogador (fora da conta)`);
L("  A DIFERENÇA, numa linha: o turno estéril e o turno mudo são taxas OPOSTAS na");
L("  mesma sessão (100% contra 0%) — e a distância entre elas é inteira de recusa;");
L("  separada a recusa, a taxa que responde à pergunta volta a bater com a de X1.");
L(`  e o Mestre também se cala: ${SESSAO_A_PELA_FRASE.chamadasAoNarrador} chamada ao Narrador — ${SESSAO_A_PELA_FRASE.ondeSai}`);

/* ============================================================
   O FUNIL DO COMBATE — quem tem voz, e de que tipo
   ============================================================ */
barra();
L("O FUNIL DO COMBATE — os chamadores de pushMsgs (App.jsx:7504)");
barra();
const fun = contarFunil(), rec = contarRecusas(), nasce = vozQueNasceNoModulo();
L(`\n  funções que falam no turno de combate: ${fun.funcoes}`);
L(`    núcleo (mudas fora da luta) : ${fun.porAnel.nucleo}`);
L(`    borda  (falam nos dois)     : ${fun.porAnel.borda}`);
L(`  chamadas de pushMsgs no funil: ${fun.linhas}   (${fun.mistas} empurram lista misturada)`);
L(`    frase de mesa : ${fun.voz.frase}  (${pct(fun.voz.frase, fun.linhas)})`);
L(`    telegrama     : ${fun.voz.telegrama}  (${pct(fun.voz.telegrama, fun.linhas)})`);
L(`    recusa        : ${fun.voz.recusa}  (${pct(fun.voz.recusa, fun.linhas)})`);
L(`  e a voz nasce FORA do React em ${nasce.doModulo} das ${fun.linhas} — ${nasce.doApp} ainda só existem no App.jsx`);

L("\n  AS RECUSAS, À PARTE (a correção de escopo que X3b obriga):");
L(`    chamadas: ${rec.chamadas} · formas distintas: ${rec.formas} · famílias: ${rec.familias}`);
L(`    por anel: núcleo ${rec.porAnel.nucleo} · borda ${rec.porAnel.borda} · despachante ${rec.porAnel.despachante}`);
for (const [f, n] of Object.entries(recusasPorFamilia())) {
  L(`    ${f.padEnd(15)} ${String(n.chamadas).padStart(2)} chamada(s) · ${n.formas} forma(s)`);
}
L("\n  O QUE X4 NÃO CONSEGUIU MEDIR:");
for (const n of O_QUE_NAO_DEU_PARA_MEDIR) L(`  · ${n.o}\n      ${n.porque}`);

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
/* a linha de base de X1 é a de cima e só ela; A′ é acréscimo de X2 e
   compara-se consigo mesma, nunca com o número da sessão A */
L(`E, AO LADO (X2): ${impedidos}/${P.turnos} turnos com o clique IMPEDIDO — a sessão A′,`);
L("que mede o mesmo combate pelo ângulo do veredito antes do clique.");
/* e o terceiro ângulo, de X4: a mesma sessão pelo eixo da frase. Fica por
   último de propósito — é o acréscimo mais novo, e compara-se consigo
   mesmo, nunca com o número da sessão A. */
L(`E, AO LADO (X4): ${semNarracao}/${P.turnos} turnos sem uma frase de EVENTO, contra ${semLinha}/${P.turnos} sem uma linha`);
L("qualquer — a sessão A″, que mostra por que a recusa tem de ser contada à parte.");
barra();
