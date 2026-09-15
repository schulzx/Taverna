/* AS AÇÕES DO JOGADOR (X1) — a suíte que lê a medição de volta

   O que esta suíte guarda: a régua de X1 não pode virar prosa. Ela
   afirma, com número, o que a tabela `acoes-do-jogador.mjs` declara, e
   RECALCULA a sessão estéril a partir dos motores puros — o "7 em 7" é
   afirmado aqui, não copiado de um relatório.

   A ASSERÇÃO QUE IMPORTA, e que é a catraca de X2: a lista de ações de
   COMBATE sem caminho ao motor é declarada e **só encolhe**. Quando X2
   fizer o botão chamar o motor, o número tem de BAIXAR e o teto tem de
   ser baixado junto, no mesmo commit — é assim que a conquista fica
   travada e a regressão fica vermelha.

   X1 mede, não conserta: nenhuma asserção de outra suíte foi tocada. */

const RAIZ = "../src/";
const G = await import(RAIZ + "grid.js");
const A = await import(RAIZ + "agressao.js");
const D = await import(RAIZ + "desafios.js");
const T = await import(RAIZ + "turno.js");
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8");

import {
  ACOES_DO_JOGADOR, MOTOR_SEM_CHAMADOR, TURNO_ESTERIL, ABERTURA_FORA_DE_ALCANCE,
  NUMERO_QUE_MUDA, NAO_CONTA_COMO_NUMERO,
  acoesDeCombateSemMotor, contarPorClique, contarPorTexto, contarCombate,
} from "./acoes-do-jogador.mjs";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   A CATRACA DE X2 — o teto que só pode descer

   Este número é a dívida medida em X1: das ações que o jogador tem em
   combate, quantas NÃO chegam ao motor. Hoje são 7, e entre elas está
   `Atacar` — o botão que não ataca.

   COMO MEXER NESTE NÚMERO (leia antes de editar):
   baixar é a vitória de X2, e baixar exige tirar o `id` da lista abaixo
   no mesmo commit que fez o botão chamar o motor. SUBIR é regressão:
   quer dizer que uma ação de combate perdeu o caminho ao motor, ou que
   nasceu um botão de combate que só escreve texto.
   ============================================================ */
const TETO_SEM_MOTOR = 7;
const SEM_MOTOR_HOJE = [
  "pronta_atacar",     // o botão que não ataca — o alvo número 1 de X2
  "pronta_esquivar",   // não casa leitor nenhum
  "pronta_empurrar",   // não casa leitor nenhum
  "pronta_derrubar",   // não casa leitor nenhum
  "pronta_correr",     // não casa leitor nenhum (e o grid tem deslocamento)
  "pronta_ajudar",     // a Ajuda do 5e não existe em código
  "texto_ataque",      // chega ao motor e morre no alcance
];

sec("1. a catraca — as ações de combate cujo CLIQUE não chega ao motor");
{
  const sem = acoesDeCombateSemMotor();
  const ids = sem.map((a) => a.id).sort();
  t(`hoje são ${TETO_SEM_MOTOR} e não mais que isso`, sem.length <= TETO_SEM_MOTOR,
    `medido ${sem.length}, teto ${TETO_SEM_MOTOR} — se subiu, uma ação de combate perdeu o motor`);
  t("e são exatamente as declaradas (nenhuma troca em silêncio)",
    ids.join() === [...SEM_MOTOR_HOJE].sort().join(),
    `medido: ${ids.join()}`);
  /* a que dá nome à fase: o clique de `Atacar` não dispara golpe nenhum */
  const atacar = ACOES_DO_JOGADOR.find((a) => a.id === "pronta_atacar");
  t("o clique de `Atacar` não chega ao motor", atacar.cliqueChega !== "motor");
  t("ele só enche a caixa de texto", atacar.cliqueChega === "caixa");
  t("e o handler confirma", /só setEntrada/.test(atacar.handler));
}

sec("2. os dois eixos — o clique e a frase contam histórias diferentes");
{
  /* EIXO DO CLIQUE — é daqui que sai a manchete de X1 */
  const clique = contarPorClique();
  t("11 cliques chegam ao motor (8 rápidas + mover + bolsa + heroísmo)",
    clique.motor === 11, JSON.stringify(clique));
  t("e as 12 prontas só enchem a caixa", clique.caixa === 12, JSON.stringify(clique));
  const prontasNoMotor = ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_PRONTAS" && a.cliqueChega === "motor");
  t("nenhuma das 12 prontas dispara o motor pelo clique", prontasNoMotor.length === 0);

  /* EIXO DO TEXTO — a frase vai mais longe que o clique, e isso é
     verdade ao mesmo tempo: 5 das prontas casam desafio quando enviadas */
  const txtFora = contarPorTexto("fora");
  const txtLuta = contarPorTexto("luta");
  t("enviada como frase, boa parte chega ao motor fora da luta",
    txtFora.motor > clique.motor - 3, `${txtFora.motor}`);
  t("e dentro da luta a frase chega menos longe que fora",
    txtLuta.motor < txtFora.motor, `${txtLuta.motor} vs ${txtFora.motor}`);

  /* O RECORTE QUE IMPORTA: o combate, nos dois eixos */
  const c = contarCombate();
  t("são 10 ações de combate", c.total === 10, JSON.stringify(c));
  t("e só 3 delas têm clique que chega ao motor", c.clique.motor === 3, JSON.stringify(c.clique));
  /* as 3 são mover, beber e heroísmo — NENHUMA é um golpe.
     É esta linha que resume a Fase X inteira. */
  const motorNaLuta = ACOES_DO_JOGADOR.filter((a) => a.combate && a.cliqueChega === "motor").map((a) => a.id).sort();
  t("e nenhuma das 3 é um golpe",
    motorNaLuta.join() === ["bolsa_consumivel", "grid_mover", "heroismo_gasto"].join(),
    motorNaLuta.join());
  t("nenhuma frase de combate chega ao motor dentro da luta",
    c.texto.motor === 0, JSON.stringify(c.texto));

  t("a tabela cobre as 12 prontas", ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_PRONTAS").length === 12);
  t("a tabela cobre as 8 rápidas", ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS").length === 8);
  t("e as 8 rápidas chegam ao motor pelo clique",
    ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS" && a.cliqueChega === "motor").length === 8);
  t("e nenhuma delas é de combate",
    ACOES_DO_JOGADOR.filter((a) => a.fonte === "ACOES_RAPIDAS" && a.combate).length === 0);
}

sec("3. o 7 em 7 — recalculado, não copiado");
{
  /* A sessão A refeita aqui, com os motores puros: combate aberto, herói
     corpo a corpo, jogador declara ataque todo turno e não faz mais nada.
     Se um dia isto deixar de dar 7/7, é porque X2 andou — e aí este bloco
     muda junto, com o motivo escrito. */
  const grade = G.montarGrade({ local: TURNO_ESTERIL.politicaDaSessaoA.planta });
  const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "Bandido", vida: 11 }] });
  const eu = pos.heroi, inim = pos.inimigos[0];
  let estereis = 0, rolagens = 0;
  for (let i = 0; i < TURNO_ESTERIL.politicaDaSessaoA.turnos; i++) {
    const ok = G.alcanca(grade, eu, inim, { alcanceM: G.alcanceNatural(eu) }).ok;
    if (ok) rolagens++; else estereis++;   // sem alcance: recusa sem dado e sem custo
  }
  t("7 turnos, 7 estéreis", estereis === 7, `estéreis=${estereis}`);
  t("e zero rolagens no combate inteiro", rolagens === 0, `rolagens=${rolagens}`);
  t("a tabela declara o mesmo que a conta acabou de medir",
    TURNO_ESTERIL.sessaoA_hoje.estereis === estereis && TURNO_ESTERIL.sessaoA_hoje.rolagens === rolagens);
  t("e a taxa da sessão A é 100%",
    TURNO_ESTERIL.taxas.find((x) => x.recorte === "sessão A").taxa === 100);
  t("a fórmula está escrita para X4 repetir", /turnos_sem_delta \/ turnos_totais/.test(TURNO_ESTERIL.formula));
  t("e o procedimento aponta a sonda permanente", /sonda-turno-esteril/.test(TURNO_ESTERIL.procedimento));
}

sec("4. a definição operacional de 'número que muda'");
{
  t("a lista do que conta é fechada e não-vazia", NUMERO_QUE_MUDA.length >= 7);
  t("PV/PM contam", NUMERO_QUE_MUDA.some((x) => /PV ou PM/.test(x)));
  t("posição no grid conta", NUMERO_QUE_MUDA.some((x) => /posição/.test(x)));
  t("um dado rolado conta", NUMERO_QUE_MUDA.some((x) => /dado rolado/.test(x)));
  /* a exclusão que mais mexe no resultado precisa estar escrita COM o porquê:
     sem ela a taxa daria 0% por construção */
  const relogio = NAO_CONTA_COMO_NUMERO.find((x) => /relógio/.test(x.o));
  t("o relógio de 45 min está excluído", !!relogio);
  t("e o porquê da exclusão está escrito", !!relogio && /por construção/.test(relogio.porque));
  t("e aponta a linha que avança o relógio", !!relogio && /12959/.test(relogio.porque));
}

sec("5. a abertura fora de alcance — o achado central");
{
  const F = ABERTURA_FORA_DE_ALCANCE;
  t("as 10 plantas estão medidas", F.aberturaPorPlanta.length === 10);
  t("e 10 de 10 recusam o golpe no turno 1", F.plantasQueRecusamNoTurno1 === 10 && F.plantasTotais === 10);
  t("nenhuma planta declarada abre com corpo a corpo válido",
    F.aberturaPorPlanta.every((p) => p.corpoACorpoOk === false));
  t("a menor abertura ainda é muito maior que o alcance do golpe",
    Math.min(...F.aberturaPorPlanta.map((p) => p.metros)) > F.alcanceCorpoACorpo * 4);

  /* e agora a medição de verdade, contra o grid: a tabela não pode
     declarar uma geometria que o módulo não produz mais */
  let recusaram = 0;
  for (const p of F.aberturaPorPlanta) {
    const grade = G.montarGrade(p.planta === "masmorra" ? { emMasmorra: true } : { local: p.planta });
    const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "X", vida: 9 }] });
    const d = G.distanciaM(pos.heroi, pos.inimigos[0]);
    const ok = G.alcanca(grade, pos.heroi, pos.inimigos[0], { alcanceM: G.alcanceNatural(pos.heroi) }).ok;
    if (!ok) recusaram++;
    t(`  ${p.planta}: abertura de ${p.metros} m confere`, Math.abs(d - p.metros) < 0.01, `medido ${d}`);
  }
  t("o grid confirma: 10 de 10 recusam", recusaram === 10, `recusaram=${recusaram}`);

  /* O REFINAMENTO: nem a arma de longe resolve. Com 36 m a distância
     deixa de pesar, mas a PAREDE continua — e é `alcanca` inteiro, não
     só a distância, que decide. X2 precisa disto para não prometer um
     botão de tiro que três plantas em dez recusam na abertura. */
  let recusamAte36 = 0;
  for (const p of F.aberturaPorPlanta) {
    const grade = G.montarGrade(p.planta === "masmorra" ? { emMasmorra: true } : { local: p.planta });
    const pos = G.posicionar(grade, { heroi: { nome: "Bram" }, grupo: [], inimigos: [{ nome: "X", vida: 9 }] });
    const ok = G.alcanca(grade, pos.heroi, pos.inimigos[0], { alcanceM: F.alcanceDeArmaLonge }).ok;
    if (!ok) recusamAte36++;
    t(`  ${p.planta}: a 36 m ${p.aLonge36mOk ? "acerta" : "ainda recusa"}`, ok === p.aLonge36mOk);
  }
  t("três plantas recusam mesmo a 36 m, por parede",
    recusamAte36 === F.plantasQueRecusamAte36m && recusamAte36 === 3, `medido ${recusamAte36}`);

  /* a armadilha que custou tempo às duas mentes: sem esta nota, X4 mede
     16,5 m onde são 25,5 m e não recebe aviso nenhum */
  t("a armadilha da grade está escrita para X4", /cai em `estrada` sem avisar/.test(TURNO_ESTERIL.armadilhaDaGrade.o));
  t("e diz como evitar", /conferir largura×altura/.test(TURNO_ESTERIL.armadilhaDaGrade.comoEvitar));
  /* e a prova de que a armadilha é real, não folclore */
  t("de fato montarGrade({planta}) cai em estrada",
    G.garantirGrade(G.montarGrade({ planta: "masmorra" })).altura === 12);
  t("e {emMasmorra:true} dá a masmorra de verdade",
    G.garantirGrade(G.montarGrade({ emMasmorra: true })).altura === 18);

  /* a recusa é de graça — e é isso que congela os PV do inimigo também */
  t("a recusa sai antes de gastar a ação", /if \(ataque && ataque\.semAlcance\) \{/.test(APP));
  t("e o porquê de não gastar está registrado na tabela",
    /nunca roda/.test(F.recusaDeGraca.logo));
  t("o par de suítes que nunca foi composto está citado",
    F.parQueNuncaFoiComposto.length === 2
    && F.parQueNuncaFoiComposto.some((x) => /teste-grid\.mjs:198/.test(x))
    && F.parQueNuncaFoiComposto.some((x) => /teste-alcance-e-achado\.mjs:45/.test(x)));
}

sec("6. as duas travas do ataque por texto");
{
  /* fora de combate: o alvo precisa estar no elenco, e nome próprio é o
     único jeito de entrar nele */
  const elenco = [{ nome: "Rufino", papel: "guarda", relacao: "neutro" }];
  const semAlvo = A.lerAgressao("Ataco o bandido", { presentes: elenco, grupo: [], emCombate: false });
  const comAlvo = A.lerAgressao("Ataco Rufino", { presentes: elenco, grupo: [], emCombate: false });
  t("alvo não registrado morre em semAlvoConhecido", semAlvo && semAlvo.tipo === "semAlvoConhecido");
  t("alvo registrado abre o combate", comAlvo && comAlvo.tipo === "agressao");
  /* e mesmo o que abre NÃO rola dado de ataque: abre a luta e devolve a vez */
  t("mas abrir a luta não é rolar um golpe", !("dano" in (comAlvo || {})));

  /* dentro de combate: a porta fecha, por desenho */
  t("dentro da luta lerAgressao se cala",
    A.lerAgressao("Ataco Rufino", { presentes: elenco, grupo: [], emCombate: true }) === null);
  const porta = T.PORTAS_DO_TURNO.find((p) => p.id === "agressao");
  t("porque a porta `agressao` exige estar fora de combate", porta.quando({ ehAgressao: true, emCombate: true }) === false);
  t("e abre fora dele", porta.quando({ ehAgressao: true, emCombate: false }) === true);
}

sec("7. os seis literais do painel que não casam leitor nenhum");
{
  /* medido contra o catálogo real: `lerAcao` é o mesmo leitor que o
     adjudicador usa (src/App.jsx:15624 → veredictoDaAcao) */
  const ctx = { personagem: { nivel: 3, atributos: {}, pericias: {} }, semente: "x1", lugar: "taverna",
    emCombate: false, tentativas: {}, dia: 1, pessoaDe: () => null, fama: 0,
    ehPessoaConhecida: () => false, achadoDe: () => null };
  const semLeitor = [];
  for (const a of ACOES_DO_JOGADOR.filter((x) => x.fonte === "ACOES_PRONTAS")) {
    const txt = a.texto.endsWith(" ") ? a.texto + "o bandido" : a.texto;
    const v = (() => { try { const r = D.lerAcao(txt, ctx); return (!r || (r.tipo === "livre" && !r.chave)) ? null : r; } catch { return null; } })();
    if (!v && !A.ehDeclaracaoDeAtaque(txt)) semLeitor.push(a.rotulo);
  }
  t("são seis", semLeitor.length === 6, semLeitor.join());
  t("e são Esquivar, Empurrar, Derrubar, Correr, Ajudar e Enganar",
    semLeitor.sort().join() === ["Ajudar", "Correr", "Derrubar", "Empurrar", "Enganar", "Esquivar"].join(),
    semLeitor.join());
  /* Das 12 prontas, SEIS são de combate e todas as seis viram frase:
     as cinco sem leitor nenhum (Esquivar, Empurrar, Derrubar, Correr,
     Ajudar) mais `Atacar`, que tem leitor e morre no alcance. É o
     coração do achado — o painel de combate inteiro é prosa. */
  const deCombate = ACOES_DO_JOGADOR.filter((x) => x.fonte === "ACOES_PRONTAS" && x.combate && x.textoLuta === "cena");
  t("as seis prontas de combate viram frase, sem exceção", deCombate.length === 6, String(deCombate.length));
}

sec("8. o motor que nenhum clique chama");
{
  const M = MOTOR_SEM_CHAMADOR;
  /* o achado duro: um export sem NENHUM leitor, que passa pela catraca
     porque a catraca conta o import como leitor */
  t("gastarRecurso está registrado como morto", M.morto.some((x) => x.nome === "gastarRecurso"));
  t("e o lugar dele está anotado", M.morto.some((x) => /combate\.js:745/.test(x.onde)));
  t("de fato o App importa gastarRecurso", /\bgastarRecurso\b/.test(APP));
  t("e nunca o chama", !/\bgastarRecurso\s*\(/.test(APP));
  /* combate.recursos: escrito toda luta, nunca consumido */
  t("combate.recursos consta como escrito e nunca lido",
    M.escritoENuncaLido.some((x) => x.campo === "combate.recursos"));
  t("e o App de fato escreve recursos ao abrir a luta", /recursos: novosRecursos\(\)/.test(APP));

  /* as três categorias existem separadas, e é essa separação que
     corrige o mapa que chegou: "sem chamador" misturava coisas
     diferentes, e só uma delas é dívida */
  t("as três categorias estão separadas",
    !!M.semClique && !!M.soInterno && !!M.morto);
  t("semClique de combate.js tem os 3 medidos",
    M.semClique["combate.js"].length === 3);
  t("e nenhum deles é chamado no App",
    M.semClique["combate.js"].every((n) => !new RegExp(`\\b${n}\\s*\\(`).test(APP)));
  /* maiorVaoSemGanho chegou no mapa como "sem chamador" e TEM leitor:
     fica fora das três listas de propósito, e este teste guarda o motivo */
  const todas = [...M.semClique["combate.js"], ...M.soInterno["combate.js"], ...M.morto.map((x) => x.nome)];
  t("maiorVaoSemGanho não é declarado sem chamador (tem leitor em teste-onda3)",
    !todas.includes("maiorVaoSemGanho"));
}

console.log(`\n${bons} ok, ${maus} falhas`);
process.exit(maus ? 1 : 0);
