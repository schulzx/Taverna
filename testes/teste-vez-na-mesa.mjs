/* teste-vez-na-mesa.mjs (CB9, CB10, CB11 — Fase CB lote 2, 10/11/2026)

   As três perguntas do tabuleiro (a planta §3.4, §3.5, §3.2): de quem é a
   vez e quem vem a seguir; o que ainda posso fazer e quanto custa cada
   verbo; e se eu andar até ali, o que me custa. A fila diz a ordem em que o
   motor joga (a de `passosDoTurno`), a economia diz o recurso de cada verbo
   pela tabela, e o caminho é `caminhar` com o golpe livre pela regra do App
   (`moverPara`: quem está colado à casa de onde se sai). */
import { filaDaRodada, economiaDaVez, caminhoComProvocacoes, CUSTO_DOS_VERBOS, RECUSA_DO_VERBO } from "../src/vez-na-mesa.js";
import { passosDoTurno } from "../src/turno-contado.js";
import { montarGrade, caminhar, adjacentes, ocupacaoDe, DESLOCAMENTO_PADRAO, PASSO_NA_RODADA } from "../src/grid.js";
import { VERBOS_DE_COMBATE } from "../src/golpe.js";
import { VERBO_DE_ESPERA, VERBO_DE_FUGA } from "../src/tela-de-batalha.js";
import { pipsDaEconomia } from "../src/batalha-na-tela.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

const BRAN = { nome: "Bran", classe: "Guerreiro", nivel: 3, grupo: [{ nome: "Quorin", vida: 10 }, { nome: "Elma", vida: 0 }] };
const COMBATE = {
  rodada: 2,
  ordem: [{ nome: "Bandido 2", iniciativa: 18 }, { nome: "Bran", iniciativa: 15 }, { nome: "Bandido 1", iniciativa: 9 }],
  inimigos: [{ nome: "Bandido 1", vida: 5 }, { nome: "Bandido 2", vida: 8 }, { nome: "Bandido 3", vida: 0, derrotado: true }],
};

sec("1. CB9 · A FILA DA RODADA — a ordem em que o motor joga");
{
  const f = filaDaRodada(COMBATE, BRAN);
  t("o herói abre a rodada e é a vez dele (agir encerra o turno dele, depois o mundo responde)", f.rostos[0].nome === "Bran" && f.rostos[0].estado === "vez" && f.rostos[0].heroi);
  t("depois os inimigos pela ordem da lista da luta (a de turnoDosInimigos), não pela iniciativa", J(f.rostos.filter((r) => r.lado === "inimigo" && r.estado !== "caido").map((r) => r.nome)) === J(["Bandido 1", "Bandido 2"]));
  t("e o grupo por último, pela ordem do grupo", f.rostos.findIndex((r) => r.nome === "Quorin") > f.rostos.findIndex((r) => r.nome === "Bandido 2"));
  t("a iniciativa vai com cada rosto, para quem a quiser ler", f.rostos.find((r) => r.nome === "Bandido 2").iniciativa === 18 && f.rostos.find((r) => r.nome === "Quorin").iniciativa === null);
  t("os caídos vão para o fim, a «caido» (a Elma a 0, o Bandido 3 derrotado)", J(f.rostos.slice(-2).map((r) => [r.nome, r.estado])) === J([["Bandido 3", "caido"], ["Elma", "caido"]]));
  t("a marca da rodada seguinte diz quem a abre", f.rodada === 2 && f.seguinte.rodada === 3 && f.seguinte.abre === "Bran");
  const durante = filaDaRodada(COMBATE, BRAN, { vez: "Bandido 2", agiram: ["Bran", "Bandido 1"] });
  t("no turno contado: quem age é a vez, quem já agiu fica «agiu», o resto espera", J(durante.rostos.map((r) => r.estado)) === J(["agiu", "agiu", "vez", "espera", "caido", "caido"]));
  /* a fila e os passos contam a mesma ordem */
  const passos = passosDoTurno([
    { inimigo: "Bandido 2", alvoRef: "jogador", alvoNome: "Bran", r: { tipo: "ataque", d20: 12, dados: [12], bonus: 3, total: 15, ca: 14, dano: 4, resultado: "acerta" } },
    { inimigo: "Bandido 1", alvoRef: "jogador", alvoNome: "Bran", r: { tipo: "ataque", d20: 4, dados: [4], bonus: 3, total: 7, ca: 14, dano: 0, resultado: "erra" } },
  ], { antes: COMBATE.inimigos, depois: COMBATE.inimigos, vidas: { Bran: 20 } });
  t("a fila e os passos do turno contam os inimigos pela mesma ordem", J(passos.map((p) => p.quem)) === J(f.rostos.filter((r) => r.lado === "inimigo" && r.estado !== "caido").map((r) => r.nome)));
  t("lixo dá null, e o que recebe fica como veio", filaDaRodada(null, BRAN) === null && filaDaRodada(COMBATE, null) === null && filaDaRodada({}, { nome: "X" }).rostos.length === 1 && COMBATE.inimigos.length === 3);
}

sec("2. CB10 · A ECONOMIA DA VEZ — o que resta, e o custo de cada verbo");
{
  const ids = [...VERBOS_DE_COMBATE.map((v) => v.id), VERBO_DE_ESPERA.id, VERBO_DE_FUGA.id];
  t(`todo verbo da barra tem o seu custo na tabela (${ids.join(", ")})`, ids.every((id) => Object.prototype.hasOwnProperty.call(CUSTO_DOS_VERBOS, id)));
  const PIPS = new Set(pipsDaEconomia({ acao: 1, extra: 1 }, { reacao: true }, { acaoBonus: true }).map((p) => p.recurso));
  const e0 = economiaDaVez({ economia: { acao: 1, extra: 1 }, recursos: { reacao: true } }, BRAN);
  t("todo recurso que um verbo gasta é um pip da Economia, ou o passo", Object.values(e0.recursosDosVerbos).every((r) => PIPS.has(r) || r === "movimento"));
  t("a rodada inteira: tudo livre, o passo inteiro", e0.acao.resta === 1 && e0.bonus.tem && e0.bonus.resta === 1 && e0.reacao.resta && e0.movimento.restaM === DESLOCAMENTO_PADRAO && Object.values(e0.verbos).every((v) => v.pode));
  t("atacar gasta a ação, mover gasta o passo, a bolsa nada", e0.recursosDosVerbos.atacar === "acao" && e0.recursosDosVerbos.mover === "movimento" && !("bolsa" in e0.recursosDosVerbos) && e0.verbos.bolsa.gasta === null);
  const gasta = economiaDaVez({ economia: { acao: 0, extra: 1, [PASSO_NA_RODADA.campo]: 0 }, recursos: { reacao: false } }, BRAN, { passoTotalM: 9 });
  t("sem ação: atacar não pode, com a razão em palavras de jogo", gasta.verbos.atacar.pode === false && gasta.verbos.atacar.porqueNao === RECUSA_DO_VERBO.acao);
  t("e a habilidade passa a gastar a ação bónus (o App: `if (acao > 0) acao -= 1; else extra -= 1`)", gasta.verbos.habilidade.gasta === "bonus" && gasta.verbos.habilidade.pode && gasta.recursosDosVerbos.habilidade === "bonus");
  t("o passo acabou: mover não pode; a reação gasta: reagir não pode", !gasta.verbos.mover.pode && gasta.verbos.mover.porqueNao === RECUSA_DO_VERBO.movimento && !gasta.verbos.reagir.pode);
  const mago = economiaDaVez({ economia: { acao: 1, extra: 0 } }, { nome: "Ilsa", classe: "Mago", nivel: 1 });
  t("quem não tem ação bónus não a vê como recurso a gastar (o Mago de nível 1)", mago.bonus.tem === false && mago.verbos.acaoBonus.pode === false && mago.verbos.acaoBonus.porqueNao === RECUSA_DO_VERBO.semBonus);
  const ladino = economiaDaVez({ economia: { acao: 1, extra: 1 } }, { nome: "Sombra", classe: "Ladino", nivel: 5 });
  t("esconder-se é bónus para quem a classe o dá (o Ladino, `custoDeEsconder`)", ladino.verbos.esconder.gasta === "bonus" && BRAN.classe === "Guerreiro" && e0.verbos.esconder.gasta === "acao");
  const pressa = economiaDaVez({ economia: { acao: 2, extra: 0 } }, { nome: "Bran", classe: "Guerreiro", nivel: 1, pressa: { acoes: 2 } });
  t("a pressa conta duas ações (acoesPorRodada)", pressa.acao.total === 2 && pressa.acao.resta === 2);
  const sem = economiaDaVez({}, BRAN);
  t("sem economia ainda (a rodada 1 de uma luta antiga): a rodada inteira", sem.acao.resta === 1 && sem.movimento.restaM === DESLOCAMENTO_PADRAO);
  t("lixo dá null", economiaDaVez(null, BRAN) === null && economiaDaVez({}, null) === null);
}

sec("3. CB11 · O CAMINHO COM O CUSTO — a busca de caminhar, o golpe livre do App");
{
  const grade = montarGrade({});
  const r = rng(hashSemente("cb11"));
  let n = 0, mesmoCusto = 0, livresDoApp = 0, casaACasa = 0, alcance = 0;
  for (let i = 0; i < 300; i++) {
    const heroi = { nome: "Bran", x: 2 + Math.floor(r() * 10), y: 2 + Math.floor(r() * 10) };
    const inimigos = Array.from({ length: 1 + Math.floor(r() * 3) }, (_, k) => ({ nome: `Lobo ${k + 1}`, x: Math.floor(r() * 14), y: Math.floor(r() * 14), vida: 5 }))
      .filter((e) => !(e.x === heroi.x && e.y === heroi.y));
    const destino = { x: Math.max(0, Math.min(13, heroi.x + Math.floor(r() * 9) - 4)), y: Math.max(0, Math.min(13, heroi.y + Math.floor(r() * 9) - 4)) };
    const c = caminhoComProvocacoes(grade, heroi, destino, inimigos, {});
    const chk = caminhar(grade, heroi, destino, { ocupados: ocupacaoDe(inimigos, heroi), deslocamentoM: DESLOCAMENTO_PADRAO });
    if (!c || c.ok !== chk.ok) continue;
    if (!c.ok) { if (c.motivo === chk.motivo) { n++; mesmoCusto++; livresDoApp++; casaACasa++; alcance++; } continue; }
    n++;
    if (c.custoM === chk.custoM && c.casas.length && c.casas[c.casas.length - 1].custoM === chk.custoM && c.sobraM === Math.round((DESLOCAMENTO_PADRAO - chk.custoM) * 10) / 10) mesmoCusto++;
    if (J(c.golpesLivres) === J(adjacentes(heroi, inimigos).map((e) => e.nome)) && c.provoca === c.golpesLivres.length > 0) livresDoApp++;
    if (J(c.casas.map((q) => ({ x: q.x, y: q.y }))) === J(chk.caminho.map((q) => ({ x: q.x, y: q.y })))) casaACasa++;
    if (c.casas.every((q) => J(q.alcancadoPor) === J(adjacentes({ ...heroi, x: q.x, y: q.y }, inimigos).map((e) => e.nome)))) alcance++;
  }
  t(`o custo é o de caminhar, acumulado casa a casa, e a sobra é o que fica (${mesmoCusto}/${n})`, n > 200 && mesmoCusto === n);
  t(`as casas são as de caminhar, pela mesma ordem (${casaACasa}/${n})`, casaACasa === n);
  t(`o golpe livre é o do App: quem está colado à casa de onde se sai (${livresDoApp}/${n})`, livresDoApp === n);
  t(`cada casa diz quem a alcança, para a tela a tingir (${alcance}/${n})`, alcance === n);
  const lama = montarGrade({ texto: "um pântano de lama" });
  t("o terreno difícil diz-se na casa e paga o dobro (quando a planta o tem)", (() => {
    const c = caminhoComProvocacoes(lama, { nome: "Bran", x: 1, y: 1 }, { x: 4, y: 1 }, [], {});
    return !c || !c.ok || c.casas.every((q, k) => q.custoM - (k ? c.casas[k - 1].custoM : 0) === (q.dificil ? 3 : 1.5));
  })());
  const longe = caminhoComProvocacoes(grade, { nome: "Bran", x: 0, y: 0 }, { x: 10, y: 10 }, [], { deslocamentoM: 3 });
  t("longe demais: ok false, com o motivo de caminhar, sem casas", longe.ok === false && /longe/.test(longe.motivo) && longe.casas.length === 0);
  t("lixo dá null", caminhoComProvocacoes(null, {}, {}, []) === null && caminhoComProvocacoes(grade, { x: 1 }, { x: 2, y: 2 }, []) === null);
}

console.log(`\na vez na mesa: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
