/* ============================================================
   AS PEÇAS · NO JOGO (17/11/2026, Fase B) — testes/teste-pecas-no-jogo.mjs

   A ponte entre o motor das peças e o turno (src/pecas/no-jogo.js):
   §1 o interruptor (PECAS_LIGADAS): desligado, nada;
   §2 desligado = o jogo de hoje (nenhuma porta das peças responde, e o App
      só as chama atrás do interruptor);
   §3 o estado novo no save e no replay (estado.js, sessao.js);
   §4 a fiação: as frases da sessão de 15/11 e do conversador percorrem a
      quest em Node, sem IA, e nenhuma etapa fecha sem facto escrito pelo
      sistema;
   §5 os falsos encaixes da A2, em catraca;
   §6 o chamado, a pauta e a régua da poda.
   ============================================================ */
import fs from "fs";
import { mundoDaProva, d20DaSemente, asPecasDaProva, FRASES_DO_CONVERSADOR } from "../src/pecas/a-prova.js";
import {
  PECAS_LIGADAS, lerOInterruptor, aPecaEmJogo, oTurnoDaPeca, resolverNoJogo, semAChegadaDaPeca,
  FALA_DA_SETA, FALA_DO_CALOR, avisoDaSeta, oChamadoDaSolucao, oVereditoDaSolucao, oChamadoDaPeca,
  PAUTA_DA_PECA, aPautaDaPeca, oQueAconteceu, ausentesDaPeca, foraDaCenaNaProsa,
} from "../src/pecas/no-jogo.js";
import { encaixar, FALSOS_ENCAIXES } from "../src/pecas/encaixe.js";
import { FALAS_DA_SETA, EXCECOES_DA_PROVA } from "../src/pecas/excecoes-da-prova.js";
import { oTurnoDasQuests, garantirQuestsDaEspinha } from "../src/motor/quests-do-turno.js";
import { CAMPOS } from "../src/estado.js";
import { NASCERAM_DEPOIS_DA_GRAVACAO } from "../src/sessao.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const raiz = new URL("..", import.meta.url);
const ler = (p) => fs.readFileSync(new URL(p, raiz), "utf8");

/* um localStorage de mentira */
const caixa = (ini) => { const m = new Map(Object.entries(ini || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };

sec("§1 o interruptor");
t("só a quest da prova joga por peças", J(PECAS_LIGADAS.quests) === J(["o_que_desce_ao_anoitecer"]));
t("sem configuração, desligado", lerOInterruptor(caixa(), "") === false);
t("sem storage, desligado (nunca lança)", lerOInterruptor(null, "?pecas=1") === false);
const c1 = caixa();
t("?pecas=1 liga e grava a configuração local", lerOInterruptor(c1, "?pecas=1") === true && c1.getItem(PECAS_LIGADAS.chave) === "1");
t("a configuração gravada vale sem o parâmetro", lerOInterruptor(c1, "") === true);
t("?pecas=0 apaga", lerOInterruptor(c1, "?x=2&pecas=0") === false && c1.getItem(PECAS_LIGADAS.chave) === null);
t("outro valor não liga", lerOInterruptor(caixa({ [PECAS_LIGADAS.chave]: "sim" }), "") === false);

sec("§2 desligado = o jogo de hoje");
const W = mundoDaProva();
const corpus = JSON.parse(ler("testes/corpus-da-mesa.json"));
const frases = (corpus.frases || corpus).map((x) => (typeof x === "string" ? x : x.frase || x.texto)).filter(Boolean);
t("aPecaEmJogo sem o interruptor é null", aPecaEmJogo(W.E, { mundo: W.mundo }) === null && aPecaEmJogo(W.E, { ligado: "1", mundo: W.mundo }) === null);
t("nenhuma das 439 frases do corpus passa pelas peças desligadas", frases.every((f) => oTurnoDaPeca(f, W.E, { mundo: W.mundo }) === null));
t("resolverNoJogo sem marca é null", resolverNoJogo(null, true, W.E, {}) === null);
const app = ler("src/App.jsx");
/* a régua «byte a byte»: cada porta das peças no App está atrás do
   interruptor ou da marca que só a peça põe (v.peca, des.peca, um.peca) */
t("o turno só chama as peças com o interruptor ligado", /pecasLigadas\(\) && turnoDasPecas\(acao\)/.test(app));
t("o dado só resolve a peça com a marca dela, e o quadro cala só aí", app.includes("if (des && des.peca) resolverAPeca(des, passou)") && app.includes("if (des && !des.peca && quadrosDoTeste.length)"));
t("o chamado só muda com a marca da peça", app.includes("v && v.peca ? oChamadoDaPeca("));
t("a poda só muda com o pacote da peça do turno", app.includes("const ausPP = pacP ? ausentesDaPeca(ausP, conhecP, pacP) : ausP;"));
t("a chegada só se tira com o interruptor ligado", /pecasLigadas\(\) && !pecaEscreveuRef\.current/.test(app));
t("o desafio e o oráculo só calam no aquecimento da peça", app.includes("if ((faz === \"desafio\" || faz === \"oraculo\") && pecaCalaRef.current) return false;"));
const pauta = ler("src/motor/pauta-do-turno.js");
t("a pauta só troca o caso pela cena da peça quando o canal a traz", pauta.includes("if (typeof um.peca === \"string\" && um.peca.trim()) aCenaDaPeca = um.peca;") && pauta.includes("if (aCenaDaPeca) {"));

sec("§3 o estado novo no save e no replay");
t("o campo `pecas` está na tabela do estado, no grupo historia", CAMPOS.some((c) => c.campo === "pecas" || c.id === "pecas" || c.nome === "pecas" || (Array.isArray(c) && c[0] === "pecas")) || ler("src/estado.js").includes("C(\"pecas\", \"historia\", \"objeto\")"));
t("e nasceu depois da gravação (o replay não o inventa)", typeof NASCERAM_DEPOIS_DA_GRAVACAO.pecas === "string");
t("o App grava, zera e lê a memória", app.includes("pecas: pecasRef.current,") && app.includes("pecasRef.current = null;") && app.includes("pecasRef.current = sv.pecas && typeof sv.pecas === \"object\""));

sec("§4 a fiação: a quest em Node, sem IA");
/* joga a quest com uma lista de frases (em roda), o dado da semente, o
   preço do relógio e a chegada que não fecha; devolve o relatório */
function jogar(lista, semente) {
  let E = W.E;
  const mundo = W.mundo;
  const reg = () => garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === "o_que_desce_ao_anoitecer");
  const P = reg().papeis;
  const rel = { turnos: 0, fechos: [], semFato: 0, dados: {}, precos: 0, cobrou: 0, tipos: {} };
  let n = 0, rol = 0;
  for (let turno = 1; turno <= 80; turno++) {
    const R = reg();
    if (!R || R.estado !== "aberta") break;
    const pe = aPecaEmJogo(E, { ligado: true, mundo });
    if (!pe) break; /* a carta de escolha: o jogo de hoje */
    rel.turnos++;
    const quem = (pe.peca.cena.quem.find((q) => q.deOnde !== "covil") || {}).nome || "alguém";
    const f = lista[n++ % lista.length].replace("{quem}", quem).replace("{curral}", P.curral.nome).replace("{toca}", P.toca.nome);
    const r = oTurnoDaPeca(f, E, { ligado: true, mundo });
    if (!r) continue;
    rel.tipos[r.tipo] = (rel.tipos[r.tipo] || 0) + 1;
    E = r.estado;
    if (r.cobranca) { rel.cobrou++; rel.precos++; }
    let escreveu = false;
    const sol = r.tipo === "solucao" ? r.solucao : r.abre && r.abre.solucao;
    const ch = r.tipo === "solucao" ? r.chamado : r.abre && r.abre.chamado;
    /* a luta é do tabuleiro (o confronto do covil); aqui só se precisa de um
       desfecho com as duas faces: vence com 11+ no d20 da prova (A_PROVA) */
    if (r.tipo === "luta" && r.solucao) {
      const d = d20DaSemente("fiacao|" + semente, ++rol);
      const z = resolverNoJogo({ quest: pe.peca.quest, etapa: pe.peca.etapa, solucao: r.solucao.id }, d >= 11, E, { mundo, dia: 1, turno });
      if (z) { E = z.estado; escreveu = z.escreveu; rel.dados[pe.peca.etapa] = (rel.dados[pe.peca.etapa] || 0) + 1; if (z.resultado.preco) rel.precos++; }
    }
    if (sol && ch) {
      const d = d20DaSemente("fiacao|" + semente, ++rol);
      const z = resolverNoJogo({ quest: pe.peca.quest, etapa: pe.peca.etapa, solucao: sol.id }, d + 3 >= ch.dc, E, { mundo, dia: 1, turno });
      if (z) { E = z.estado; escreveu = z.escreveu; rel.dados[pe.peca.etapa] = (rel.dados[pe.peca.etapa] || 0) + 1; if (z.resultado.preco) rel.precos++; }
    }
    if (r.tipo === "livre" && /Vou até/.test(f)) E = { ...E, lugar: { nome: P.toca.nome, cidade: P.toca.cidade }, cidadeAtual: P.toca.cidade };
    if (!escreveu) { const f2 = semAChegadaDaPeca(E, { mundo }); if (f2) E = { ...E, factos: f2 }; }
    const antes = Object.keys(reg().feitas || {}).length;
    const q = oTurnoDasQuests(E, { mundo });
    if (q) E = { ...E, ...q.estado };
    if (Object.keys(reg().feitas || {}).length > antes) { rel.fechos.push(pe.peca.etapa); if (!escreveu) rel.semFato++; }
  }
  rel.feitas = Object.keys(reg().feitas || {});
  return rel;
}
/* o jogador de mesa: as frases da sessão de 15/11 (sessao-de-hoje.md), postas na quest */
const DE_MESA = [
  "O que é que eu sei sobre o que desce do morro?",
  "Pergunto a {quem} se ouviu o sino ontem à noite.",
  "Examino as marcas na lama de {curral}.",
  "Comento que a noite promete ser fria.",
  "Sigo as pegadas na lama até {toca}, com cuidado para não perder o rasto.",
  "Vou até {toca}.",
  "Olho em volta com atenção.",
  "Tento intimidar a fera, batendo o escudo e gritando.",
  "Ataco a fera com a espada.",
];
const mesa = jogar(DE_MESA, "mesa");
console.log("     de mesa: " + J(mesa));
t("o jogador de mesa chega à encruzilhada (ver, rasto, fera)", J(mesa.feitas) === J(["ver", "rasto", "fera"]), J(mesa.feitas));
t("nenhuma etapa fecha sem facto escrito pelo sistema", mesa.semFato === 0, String(mesa.semFato));
t("toda etapa com peça rolou ao menos um dado", ["ver", "rasto", "fera"].every((e) => (mesa.dados[e] || 0) >= 1), J(mesa.dados));
/* a régua é um jogador e uma semente: 36 turnos com o rastro azarado (7 dados).
   O teto diz «não preso», não «rápido» — o ritmo mede-se jogando (fase B) */
t("em menos de 45 turnos", mesa.turnos < 45, String(mesa.turnos));
/* o conversador: só conversa e olha — o mundo tem de cobrar */
const CONVERSA = [...FRASES_DO_CONVERSADOR, "Vou até {toca}."];
const conv = jogar(CONVERSA, "conversa");
console.log("     conversador: " + J(conv));
t("o conversador não fica preso: chega à encruzilhada", J(conv.feitas) === J(["ver", "rasto", "fera"]), J(conv.feitas));
t("e o mundo cobrou dele", conv.cobrou >= 1, String(conv.cobrou));
t("e nenhuma etapa fechou sem facto", conv.semFato === 0, String(conv.semFato));
t("o mesmo jogo, a mesma semente: o mesmo relatório", J(jogar(DE_MESA, "mesa")) === J(mesa));

sec("§5 os falsos encaixes da A2, em catraca");
const [ver, rasto, fera] = asPecasDaProva();
const NAO_SAO_SOLUCAO = [
  [rasto, "Pergunto à mulher do pão onde fica a estalagem mais barata e quanto custa uma cama para a noite."],
  [ver, "Pergunto à mulher do pão onde fica a estalagem mais barata e quanto custa uma cama para a noite."],
  [fera, "Pergunto à mulher do pão onde fica a estalagem mais barata e quanto custa uma cama para a noite."],
  [rasto, "Olho com atenção o que ela traz no avental e nas mãos, sobretudo qualquer distintivo … \"Quem é você de verdade, Petra?\""],
  [ver, "Olho com atenção o que ela traz no avental e nas mãos, sobretudo qualquer distintivo … \"Quem é você de verdade, Petra?\""],
  [rasto, "Monto acampamento no telheiro com Freya, Petra e Ursa, acendo o fogo …"],
  [fera, "Monto acampamento no telheiro com Freya, Petra e Ursa, acendo o fogo …"],
  [rasto, "Com a luz da manhã, Vando e eu seguimos para a paliçada norte, devagar, procurando o cão sem pelo pelas poças e pela lama."],
  [rasto, "Vou até a alcova e olho o vulto que geme: quem é, está preso, ferido?"],
  [fera, "Vou até a alcova e olho o vulto que geme: quem é, está preso, ferido?"],
  [fera, "Ataco o rato gigante da frente com a minha faca."],
  [rasto, "Recuo para a sombra do canto e tento esconder-me do lobo."],
];
for (const [p, f] of NAO_SAO_SOLUCAO) { const r = encaixar(f, p.peca, p.estado); t(`${p.nome}: «${f.slice(0, 60)}…» não abre dado`, r && r.tipo !== "solucao", J(r)); }
t("a pergunta de preço continua a ser o balcão", encaixar("Quanto custa uma corda?", ver.peca, ver.estado).qual === "comercio");
t("a besta pela descrição continua a ser a solução dela", encaixar("Tento intimidar a fera.", fera.peca, fera.estado).solucao === "intimidar@fera");
t("as tabelas dos falsos encaixes dizem porquê", typeof FALSOS_ENCAIXES.porque === "string" && FALSOS_ENCAIXES.dentroDoSitio.length > 5);

sec("§6 o chamado, a pauta e a régua da poda");
const intim = fera.peca.solucoes.find((s) => s.id === "intimidar@fera");
t("a seta da fera em palavras de Mestre: «é luta»", /é luta/.test(avisoDaSeta(intim, fera.peca)) && avisoDaSeta(intim, fera.peca) === FALAS_DA_SETA.o_que_desce_ao_anoitecer.intimidar);
const ler1 = ver.peca.solucoes.find((s) => s.id === "ler@curral");
t("a falha com preço diz o preço", avisoDaSeta(ler1, ver.peca) === "Se falhar, fica com a metade.");
t("sem falha escrita, o tempo passa", avisoDaSeta({ id: "x" }, null) === FALA_DA_SETA.continua);
const ch = oChamadoDaSolucao(ler1, { dc: 15, bonus: 2 }, ver.peca);
t("o calor entra no número e é dito em palavras", ch.dc === 13 && ch.diz === `${FALA_DO_CALOR.olhar}: +2`, J(ch));
const v = oVereditoDaSolucao(ler1, ch, ver.peca, null);
t("o veredito leva a marca da peça e larga a conta social e o oráculo", v.peca.solucao === "ler@curral" && v.social === null && v.oportunidade === null && v.dc === 13 && Array.isArray(v.mudou));
const cp = oChamadoDaPeca(null, v.peca, v);
t("o chamado nasce sem o do catálogo, com a seta no aviso e o calor no porquê", cp.aviso === ch.aviso && cp.linha.includes("Precisa de 13") && cp.linha.includes(ch.diz) && cp.linha.includes(ch.aviso), cp.linha);
t("o chamado de hoje mantém-se, com o aviso trocado", oChamadoDaPeca({ periciaNome: "Investigação", efeito: "fecha", dado: {}, aviso: "x" }, v.peca, v).aviso === ch.aviso);
const r0 = oTurnoDaPeca("Comento que a noite promete ser fria.", ver.estado, { ligado: true, mundo: W.mundo });
t("o aquecimento põe a cena fechada no lugar do caso, e o veto no NÃO PODE", r0 && r0.tipo === "aquecimento" && r0.pauta.quadro.startsWith("CENA FECHADA") && !r0.pauta.quadro.includes("Há: " + r0.pacote.cena.onde.nome) && r0.pauta.naoPode.length === 2);
t("a pauta da peça é curta (o teto é sagrado)", J(r0.pauta).length < 900, String(J(r0.pauta).length));
t("o molde da pauta diz porquê", typeof PAUTA_DA_PECA.porque === "string");
t("aPautaDaPeca de lixo é null", aPautaDaPeca(null) === null);
t("o que aconteceu em palavras", /falhou\. Você tem a metade/.test(oQueAconteceu(ver.peca, { solucao: "ler@curral", passou: false, tipo: "falha", preco: { linha: "Você tem a metade que importa; o resto ficou por ler." } })));
const pac = r0.pacote;
const aus = ausentesDaPeca([{ nome: "Morgane", onde: "longe" }], ["Teodoro", pac.podeCitar.quem[0]], pac);
t("a régua da poda: quem não está na cena fechada é ausente; quem está nunca", aus.some((a) => a.nome === "Teodoro") && aus.some((a) => a.nome === "Morgane") && !aus.some((a) => a.nome === pac.podeCitar.quem[0]));
t("a medida da verdade acha o nome de fora na prosa", J(foraDaCenaNaProsa("Teodoro entra no curral.", ["Teodoro", pac.podeCitar.quem[0]], pac)) === J(["Teodoro"]));
t("as exceções são só da quest da prova", J(Object.keys(EXCECOES_DA_PROVA)) === J(["o_que_desce_ao_anoitecer"]) && J(Object.keys(FALAS_DA_SETA)) === J(["o_que_desce_ao_anoitecer"]));
t("a toca tem o «olhar» (sondar), que não fecha", fera.peca.solucoes.some((s) => s.id === "sondar@fera" && s.fecha === false));

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
