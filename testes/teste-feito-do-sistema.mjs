/* teste-feito-do-sistema.mjs (13/11/2026) — o XP por feitos dados pelo sistema
   A Fase NE fechou a porta `feito` (o Narrador já não escreve estado) e,
   com ela, o XP de tudo o que não é luta. src/feito-do-sistema.js dá o grau
   a partir de factos do sistema (o teste que passou, o livro de factos, os
   marcos), e motor/aplicar.js paga-o quando o App passa `ctx.doSistema`.
   Esta suíte prova, JOGANDO (o aplicar e as quests, nunca o texto deles):
   §1 cada linha da tabela; §2 um grau por turno, o maior; §3 a repetição
   não paga; §4 o teto do dia; §5 a primeira vez e o lixo; §6 o aplicar no
   modo `boca`; §7 o modo `mestre` não paga em dobro; §8 o abate com a
   quest; §9 a catraca de ritmo (uma sessão típica fora da luta). */
import { FEITO_DO_SISTEMA, osFactosDoTurno, oFeitoDoTurno, lembrarOsFeitos } from "../src/feito-do-sistema.js";
import { GRAUS, grauValido, xpDoFeito, vaoDoNivel } from "../src/juiz.js";
import { aplicar, aplicarOTurno } from "../src/motor/aplicar.js";
import { oTurnoDasQuests, garantirQuestsDaEspinha } from "../src/motor/quests-do-turno.js";
import { BIBLIOTECA_DE_QUESTS } from "../src/biblioteca-de-quests.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { garantirHistoria } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); Object.values(x).forEach(congelar); } return x; };
const T = FEITO_DO_SISTEMA;
const peso = (g) => GRAUS[g].fracao;

/* ---------------- os factos, um de cada fonte ---------------- */
const marca = (dia = 1, turno = 1) => ({ de: dia, ate: dia, vezes: 1, turno });
const livroCom = (lugares = {}, pessoas = {}) => ({ v: 1, lugares, pessoas });
const TESTE_BUSCA = { desafio: "buscar", sucesso: true, facto: { fonte: "lugar", familia: "busca", texto: "x", de: { local: "Taverna do Sino", pessoa: "Joana" } } };
const TESTE_PASSO = { desafio: "buscar", sucesso: true, facto: { fonte: "passo", familia: "busca", texto: "x", de: {}, achado: { id: "passo|q1|e2|forja", especie: "passo", quest: "q1", etapa: "e2" } } };
/* cada linha da tabela, com a entrada que a produz — uma linha nova sem
   entrada aqui faz o §1 falhar: a tabela não cresce sem prova */
const DE_CADA_FONTE = {
  marco: { espinha: { atos: [{ ato: 1, marcos: [{ titulo: "a porta", feito: true }] }] } },
  passo: { teste: TESTE_PASSO, cidade: "Vau", lugar: { nome: "Forja" } },
  segredo: { factos: livroCom({ "vau|sitio|forja": { nome: "Forja", descobriu: { dia: 1 } } }) },
  cidade: { factos: livroCom({ "cidade|vau": { nome: "Vau", esteve: marca() } }) },
  teste: { teste: TESTE_BUSCA, cidade: "Vau", lugar: { nome: "Taverna do Sino" } },
  lugar: { factos: livroCom({ "vau|sitio|forja": { nome: "Forja", esteve: marca() } }) },
  conversa: { factos: livroCom({}, { "npc|Joana": { nome: "Joana", falou: marca() } }) },
};
const VAZIA = lembrarOsFeitos(null, [], null, { dia: 1 });

sec("§1 a tabela: cada linha vale o grau que diz");
{
  t("cada fonte tem um grau que o Juiz conhece, a origem e a linha do porquê", Object.values(T.fontes).every((f) => grauValido(f.grau) && ["teste", "livro", "espinha"].includes(f.de) && typeof f.porque === "string" && f.porque.length > 8));
  /* o sistema não fala de si mesmo: o porquê é o que o herói fez */
  t("o porquê é de mundo, nunca o nome do mecanismo", Object.values(T.fontes).every((f) => !/\b(xp|sistema|grau|feito|teste|livro|facto|miudez|tabela)\b/i.test(f.porque)), Object.values(T.fontes).map((f) => f.porque).join(" | "));
  t("o teto do dia e as memórias são inteiros positivos", Number.isInteger(T.pequenosPorDia) && T.pequenosPorDia > 0 && Number.isInteger(T.memoria.vistos) && Number.isInteger(T.memoria.testes));
  t("toda linha da tabela tem a sua entrada nesta suíte", Object.keys(T.fontes).every((k) => DE_CADA_FONTE[k]), Object.keys(T.fontes).filter((k) => !DE_CADA_FONTE[k]).join(","));
  for (const [fonte, entrada] of Object.entries(DE_CADA_FONTE)) {
    const fs = osFactosDoTurno(entrada);
    const f = oFeitoDoTurno(fs, VAZIA, { dia: 1 });
    t(`«${fonte}» dá o facto e paga ${T.fontes[fonte] && T.fontes[fonte].grau}`, fs.some((x) => x.fonte === fonte) && f && f.grau === T.fontes[fonte].grau && f.porque === T.fontes[fonte].porque && typeof f.chave === "string", J(f));
  }
  t("o teste que falhou não é facto", osFactosDoTurno({ teste: { ...TESTE_BUSCA, sucesso: false } }).length === 0);
  t("o mundo de esqueleto não paga o marco (a quest paga-o)", osFactosDoTurno({ espinha: { ...DE_CADA_FONTE.marco.espinha, esqueleto: {} } }).length === 0);
}

sec("§2 um grau por turno, o maior");
{
  const tudo = osFactosDoTurno({ ...DE_CADA_FONTE.teste, factos: livroCom({ "vau|sitio|forja": { esteve: marca(), descobriu: { dia: 1 } }, "cidade|vau": { esteve: marca() } }) });
  const f = oFeitoDoTurno(tudo, VAZIA, { dia: 1 });
  t("com miudezas e feitos no mesmo turno, paga um só — e é um feito", f && f.grau === "feito", J(f));
  t("dois feitos no mesmo turno: a ordem da tabela desempata (o segredo antes da terra)", f && f.fonte === "segredo");
  const comMarco = oFeitoDoTurno([...tudo, ...osFactosDoTurno(DE_CADA_FONTE.marco)], VAZIA, { dia: 1 });
  t("o marco passa por cima de tudo", comMarco && comMarco.grau === "marco");
  t("a ordem das fontes vai do grau maior ao menor (o desempate nunca inverte o grau)", Object.values(T.fontes).every((x, i, a) => i === 0 || peso(a[i - 1].grau) >= peso(x.grau)));
}

sec("§3 o mesmo facto não paga duas vezes");
{
  const fs = osFactosDoTurno(DE_CADA_FONTE.teste);
  const m1 = lembrarOsFeitos(VAZIA, fs, oFeitoDoTurno(fs, VAZIA, { dia: 1 }), { dia: 1 });
  t("a mesma busca, no mesmo sítio, já não paga", oFeitoDoTurno(fs, m1, { dia: 1 }) === null);
  const outroSitio = osFactosDoTurno({ ...DE_CADA_FONTE.teste, lugar: { nome: "Forja" } });
  t("a mesma busca noutro sítio paga", (oFeitoDoTurno(outroSitio, m1, { dia: 1 }) || {}).fonte === "teste");
  const escalar = osFactosDoTurno({ teste: { desafio: "escalar", sucesso: true }, cidade: "Vau", lugar: "Taverna do Sino" });
  t("outro desafio no mesmo sítio paga", (oFeitoDoTurno(escalar, m1, { dia: 1 }) || {}).fonte === "teste");
  /* os factos do turno que não pagaram também ficam lembrados: aconteceram */
  const junto = osFactosDoTurno({ ...DE_CADA_FONTE.lugar, ...DE_CADA_FONTE.teste, factos: livroCom({ "vau|sitio|forja": { esteve: marca(), descobriu: { dia: 1 } } }) });
  const pago = oFeitoDoTurno(junto, VAZIA, { dia: 1 });
  const m2 = lembrarOsFeitos(VAZIA, junto, pago, { dia: 1 });
  t("o sítio que entrou no turno do segredo não paga no turno seguinte", pago.fonte === "segredo" && oFeitoDoTurno(junto, m2, { dia: 2 }) === null);
  t("o livro com o mesmo lugar, dias depois, não paga outra vez", oFeitoDoTurno(osFactosDoTurno(DE_CADA_FONTE.lugar), m2, { dia: 9 }) === null);
  t("a memória guarda impressões curtas, nunca o nome do sítio", !J(m2).includes("forja") && m2.vistos.every((h) => h.length <= 8));
}

sec("§4 as miudezas têm teto por dia de jogo");
{
  let m = VAZIA, pagos = 0;
  for (let i = 0; i < 20; i++) {
    const fs = osFactosDoTurno({ teste: { desafio: "buscar", sucesso: true }, cidade: "Vau", lugar: `quarto ${i}` });
    const f = oFeitoDoTurno(fs, m, { dia: 3 });
    if (f) pagos++;
    m = lembrarOsFeitos(m, fs, f, { dia: 3 });
  }
  t(`vinte buscas em vinte quartos no mesmo dia pagam ${T.pequenosPorDia}`, pagos === T.pequenosPorDia, String(pagos));
  const amanha = osFactosDoTurno({ teste: { desafio: "buscar", sucesso: true }, cidade: "Vau", lugar: "quarto novo" });
  t("no dia seguinte o teto recomeça", (oFeitoDoTurno(amanha, m, { dia: 4 }) || {}).grau === "pequeno");
  t("o teto do dia não segura um feito", (oFeitoDoTurno(osFactosDoTurno(DE_CADA_FONTE.passo), m, { dia: 3 }) || {}).grau === "feito");
}

sec("§5 a primeira vez, o lixo, a imutabilidade, a semente");
{
  const livroAntigo = osFactosDoTurno({ factos: livroCom({ "cidade|vau": { esteve: marca() }, "vau|sitio|forja": { esteve: marca(), descobriu: { dia: 1 } } }), espinha: DE_CADA_FONTE.marco.espinha });
  t("sem memória (a campanha que já existia), o livro e a espinha são passado: não pagam", oFeitoDoTurno(livroAntigo, null, { dia: 5 }) === null);
  t("sem memória, o teste do turno paga", (oFeitoDoTurno([...livroAntigo, ...osFactosDoTurno(DE_CADA_FONTE.teste)], null, { dia: 5 }) || {}).fonte === "teste");
  const semeada = lembrarOsFeitos(null, livroAntigo, null, { dia: 5 });
  t("e, lembrado o passado, ele também não paga depois", oFeitoDoTurno(livroAntigo, semeada, { dia: 6 }) === null && semeada.pequenos === 0);
  for (const lixo of [null, undefined, 7, "x", [], {}, { teste: "x", factos: [], espinha: 3 }]) {
    let ok = true;
    try { ok = Array.isArray(osFactosDoTurno(lixo)) && oFeitoDoTurno(lixo, lixo, lixo) === null && Array.isArray(lembrarOsFeitos(lixo, lixo, lixo, lixo).vistos); } catch { ok = false; }
    t(`lixo (${J(lixo)}) não lança`, ok);
  }
  t("a memória torta é limpa (o que não é impressão cai)", J(lembrarOsFeitos({ vistos: [1, null, "abc", "abc", "x".repeat(40)], testes: "lixo", pequenos: -3 }, [], null, {})) === J({ v: 1, dia: null, pequenos: 0, vistos: ["abc"], testes: [] }));
  const entrada = congelar({ ...DE_CADA_FONTE.teste, factos: livroCom({ "cidade|vau": { esteve: marca() } }) });
  const mem = congelar(lembrarOsFeitos(null, [], null, { dia: 1 }));
  let vivo = true;
  try { const fs = osFactosDoTurno(entrada); lembrarOsFeitos(mem, fs, oFeitoDoTurno(fs, mem, { dia: 1 }), { dia: 1 }); } catch { vivo = false; }
  t("nada recebido é mutado (entrada e memória congeladas)", vivo);
  const a = lembrarOsFeitos(null, osFactosDoTurno(entrada), null, { dia: 1 }), b = lembrarOsFeitos(null, osFactosDoTurno(entrada), null, { dia: 1 });
  t("a mesma entrada dá a mesma memória (a impressão não depende da máquina)", J(a) === J(b) && a.testes.length === 1 && a.vistos.length === 1);
}

/* ---------------- o aplicar ---------------- */
const HEROI = { nome: "Ana", classe: "Guerreiro", nivel: 5, xp: 0, vida: 30, vidaMax: 30, mana: 10, manaMax: 10, moedas: 0, grupo: [{ nome: "Bento", nivel: 4, xp: 0 }], inventario: [], habilidades: [], equipamento: [], equipados: {}, efeitos: [], condicoes: [] };
const E0 = { personagem: HEROI, dia: 1, cidadeAtual: "Vau", lugar: { nome: "Taverna do Sino" }, espinha: null };
const SO_PROSA = { narrativa: "A taverna range.", mudancas: null };

sec("§6 o aplicar, no modo `boca` (o padrão)");
{
  const sem = aplicar(E0, SO_PROSA, {});
  t("sem `doSistema`, nada muda: nem XP, nem memória, nem `feitoDoTurno`", sem.estado.personagem.xp === 0 && !("memoriaDosFeitos" in sem.estado.personagem) && !("feitoDoTurno" in sem));
  const r = aplicar(E0, SO_PROSA, { doSistema: { teste: TESTE_BUSCA, factos: livroCom() } });
  const p = r.estado.personagem;
  t("a busca que passou paga a miudez", p.xp === xpDoFeito("pequeno", 5) && r.feitoDoTurno && r.feitoDoTurno.grau === "pequeno" && r.feitoDoTurno.nivel === 5, J(r.feitoDoTurno));
  t("a linha do relato diz o porquê, em voz de mundo", r.msgs.some((m) => m.includes(T.fontes.teste.porque) && m.includes(String(xpDoFeito("pequeno", 5)))), J(r.msgs));
  t("o companheiro sobe junto, pelo mesmo caminho do XP", p.grupo[0].xp > 0);
  t("a memória vai na ficha", p.memoriaDosFeitos && p.memoriaDosFeitos.testes.length === 1 && p.memoriaDosFeitos.pequenos === 1);
  t("a resposta podada continua só prosa (o feito não entra pela resposta)", r.podado.mudancas === null);
  const r2 = aplicar(r.estado, SO_PROSA, { doSistema: { teste: TESTE_BUSCA, factos: livroCom() } });
  t("a mesma busca no turno seguinte não paga", r2.estado.personagem.xp === p.xp && r2.feitoDoTurno === null);
  t("a ficha que entrou não foi tocada", HEROI.xp === 0 && !("memoriaDosFeitos" in HEROI));
  const v = aplicarOTurno({ ...E0, mapa: { cidades: [], faccoes: [], rotas: [] }, canone: {}, npcs: {}, npcTurno: 0 }, SO_PROSA, { doSistema: { teste: TESTE_PASSO, factos: livroCom() }, baseDoNome: { importantes: [], conhecidos: [], recentes: [], grupo: [], aqui: [], heroi: "Ana" } });
  t("o turno inteiro (aplicarOTurno) devolve o feito que pagou", v.feitoDoTurno && v.feitoDoTurno.grau === "feito" && v.estado.personagem.xp === xpDoFeito("feito", 5), J(v.feitoDoTurno));
}

sec("§7 o modo `mestre` não paga em dobro com o feito do Narrador");
{
  const ctx = (teste) => ({ modoDoNarrador: "mestre", doSistema: { teste, factos: livroCom() } });
  const a = aplicar(E0, { narrativa: "x", mudancas: { feito: "marco" } }, ctx(TESTE_BUSCA));
  t("o Narrador diz marco, o sistema miudez: paga o marco, uma vez", a.estado.personagem.xp === xpDoFeito("marco", 5) && a.feitoDoTurno.grau === "marco", String(a.estado.personagem.xp));
  t("e a miudez fica lembrada (aconteceu; o grau do turno já foi dado)", a.estado.personagem.memoriaDosFeitos.testes.length === 1 && a.estado.personagem.memoriaDosFeitos.pequenos === 0);
  const b = aplicar(E0, { narrativa: "x", mudancas: { feito: "pequeno" } }, ctx(TESTE_PASSO));
  t("o Narrador diz miudez, o sistema feito: paga o feito, uma vez", b.estado.personagem.xp === xpDoFeito("feito", 5) && b.podado.mudancas.feito === "feito" && b.feitoDoTurno.fonte === "passo", String(b.estado.personagem.xp));
  t("e só uma linha de XP no relato", b.msgs.filter((m) => /XP/.test(m)).length === 1, J(b.msgs));
  const c = aplicar(E0, { narrativa: "x", mudancas: { feito: "pequeno" } }, { modoDoNarrador: "mestre" });
  t("sem `doSistema`, o mestre de antes paga o seu, como sempre", c.estado.personagem.xp === xpDoFeito("pequeno", 5) && !("feitoDoTurno" in c));
}

/* ---------------- o mundo novo, com uma quest que fecha (o de teste-te9-motor) ---------------- */
const DA_PLANTA = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_salvo_conduto", "as_cinzas_de_ontem", "a_carta_que_nao_se_abre"].includes(q.id));
const VERA = { nome: "Vera", classe: "Guerreiro", nivel: 3, xp: 0, nivelPendentes: 0, vidaMax: 30, vida: 30, manaMax: 10, mana: 10, moedas: 100, grupo: [], inventario: [], habilidades: [], equipamento: [], equipados: {}, efeitos: [], condicoes: [] };
function mundoNovo(semente) {
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "soldado", grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "soldado", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: DA_PLANTA });
  return { mundo: { semente }, estado: { espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "jornada", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: VERA, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0, chao: { cena: "", itens: [] } } };
}
let nT = 1;
const N = (nome, local) => ({ nome, conhecidoEm: 1, local, relacao: "neutro", status: "vivo", consultas: 0 });
const registar = (E, ...ps) => ({ ...E, npcs: { ...E.npcs, ...Object.fromEntries(ps.map((p) => [p.nome, N(p.nome, p.cidade || E.cidadeAtual)])) } });
const falar = (E, ...nomes) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nT += 10), falouCom: nomes }).factos });
const lutar = (E, ...caidos) => ({ ...E, factos: anotarOLivro(E, { tipo: "factos", dia: E.dia, turno: (nT += 10), derrotados: caidosParaOLivro(caidos) }).factos });
const ir = (E, cidade, lugar) => { const E2 = { ...E, cidadeAtual: cidade, jornada: null, lugar: lugar || null }; return { ...E2, factos: anotarOLivro(E2, { lugar: lugar || null, dia: E2.dia, turno: (nT += 10) }).factos }; };
const turnoQ = (W, E, f, op = {}) => { const E1 = f ? f(E) : E; const r = oTurnoDasQuests(E1, { mundo: W.mundo, ...op }); return { E: r ? { ...E1, ...r.estado } : E1, r, antes: E1 }; };
/* a campanha de teste-te9-motor até ao turno do fecho (o estado ANTES das quests desse turno) */
function ateAoFecho(W) {
  nT = 1;
  let { E } = turnoQ(W, W.estado);
  const P = garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === "o_salvo_conduto").papeis;
  ({ E } = turnoQ(W, E, (e) => falar(registar(e, { nome: P.protegido.nome, cidade: P.origem.cidade }, { nome: P.guarda.nome, cidade: P.origem.cidade }), P.protegido.nome, P.guarda.nome)));
  const desvio = { nome: P.desvio.nome, chave: P.desvio.chave, cidade: P.desvio.cidade };
  ({ E } = turnoQ(W, E, (e) => ir(e, P.desvio.cidade, desvio)));
  ({ E } = turnoQ(W, E, (e) => ir(e, P.desvio.cidade, desvio)));
  ({ E } = turnoQ(W, E, (e) => ({ ...e, jornada: { para: P.destino.cidade }, lugar: null, personagem: { ...e.personagem, grupo: [{ nome: P.protegido.nome, vinculo: 30 }] } })));
  ({ E } = turnoQ(W, E, (e) => lutar(registar(e, { nome: P.tenente.nome }), { nome: P.tenente.nome, rendido: true })));
  return { antes: ({ ...ir(E, P.destino.cidade, null), dia: E.dia + 2 }) };
}

sec("§8 o abate com a quest: o turno do fecho vale a paga, não a soma");
{
  const W = mundoNovo("BQ7|0");
  const { antes } = ateAoFecho(W);
  const semFeito = oTurnoDasQuests(antes, { mundo: W.mundo });
  const esp = semFeito && semFeito.efeitos.find((x) => x.tipo === "espolio");
  const pagaCheia = esp ? esp.paga.xp : null;
  t("o fixture fecha a quest e paga (a medida do abate)", Number.isInteger(pagaCheia) && pagaCheia > 0, J(esp && esp.paga));
  /* o turno do fecho, como o App o corre: o aplicar (com o feito do sistema) e depois as quests, com o feito que ele pagou */
  const base = { ...antes, canone: {}, npcs: antes.npcs, npcTurno: 0 };
  const ap = aplicar(base, SO_PROSA, { doSistema: { teste: TESTE_BUSCA, factos: antes.factos } });
  const xpDoAplicar = ap.estado.personagem.xp - antes.personagem.xp;
  t("o aplicar pagou o feito e diz o grau e o nível de antes", ap.feitoDoTurno && xpDoAplicar === xpDoFeito(ap.feitoDoTurno.grau, ap.feitoDoTurno.nivel) && ap.feitoDoTurno.nivel === antes.personagem.nivel, J(ap.feitoDoTurno));
  const q = oTurnoDasQuests({ ...antes, personagem: ap.estado.personagem }, { mundo: W.mundo, feitoDoTurno: ap.feitoDoTurno });
  const pq = q && q.efeitos.find((x) => x.tipo === "espolio");
  const xpDaQuest = pq ? pq.paga.xp : null;
  t("a paga da quest abate o que o sistema já deu", xpDaQuest === Math.max(0, pagaCheia - xpDoAplicar), `${pagaCheia} − ${xpDoAplicar} → ${xpDaQuest}`);
  t("e o turno, somado, vale o maior dos dois — nunca a soma", xpDoAplicar + xpDaQuest === Math.max(pagaCheia, xpDoAplicar), `${xpDoAplicar} + ${xpDaQuest}`);
  /* o turno seguinte (o Narrador narra o fecho): o trinco da paga segura o feito do sistema */
  const depois = { ...antes, ...q.estado, canone: {}, npcTurno: 0 };
  const seg = aplicar(depois, SO_PROSA, { doSistema: { teste: { desafio: "escalar", sucesso: true }, factos: depois.factos } });
  t("no turno a seguir ao fecho o sistema não paga (a paga foi o feito)", seg.feitoDoTurno === null && seg.estado.personagem.xp === depois.personagem.xp);
}

sec("§9 a catraca de ritmo: uma sessão típica fora da luta");
{
  /* ~30 turnos em dois dias de jogo: 15 testes (10 passam — quatro deles a
     mesma Percepção no mesmo quarto), cinco sítios novos e uma cidade nova,
     quatro conversas, dois passos de quest (o primeiro com o segredo do
     sítio). Herói de nível 5, onde a pressa dos primeiros níveis já não
     conta: o XP é fração pura do vão. */
  const ROTEIRO = [];
  const teste = (desafio, lugar, extra = {}) => ({ teste: { desafio, sucesso: true, ...extra }, lugar });
  const falha = (desafio, lugar) => ({ teste: { desafio, sucesso: false }, lugar });
  for (let n = 1; n <= 30; n++) ROTEIRO.push({ dia: n <= 15 ? 1 : 2, cidade: n < 16 ? "Vau" : "Pedra Alta", lugar: "Taverna do Sino" });
  const em = (n, o) => Object.assign(ROTEIRO[n - 1], o);
  [2, 4, 7, 10].forEach((n) => em(n, teste("buscar", "Taverna do Sino", { facto: TESTE_BUSCA.facto })));
  em(3, { novoSitio: "Forja" }); em(5, teste("escalar", "Muralha")); em(6, { novoSitio: "Muralha" });
  em(8, { conversa: "Joana" }); em(9, { novoSitio: "Capela" }); em(11, teste("tranca", "Capela"));
  em(12, { novoSitio: "Cripta" }); em(13, falha("buscar", "Cripta")); em(14, { conversa: "Frei Duarte" });
  em(15, teste("convencer", "Capela", { quem: "Frei Duarte" }));
  em(16, { novaCidade: "Pedra Alta" }); em(17, falha("escalar", "Torre")); em(18, { conversa: "Marta" });
  em(19, falha("tranca", "Torre"));
  em(20, { ...teste("buscar", "Torre", { facto: TESTE_PASSO.facto }), segredo: "Torre" });
  em(22, teste("lembrar", "Torre", { facto: { fonte: "bestiario", de: { criatura: "Lobo" } } }));
  em(23, falha("furtar_se", "Mercado")); em(24, { novoSitio: "Mercado" }); em(25, { conversa: "Rui" });
  em(27, teste("rastrear", "Mercado", { facto: { fonte: "passo", de: {}, achado: { id: "passo|q1|e3|mercado|rasto", especie: "passo", quest: "q1", etapa: "e3" } } }));
  em(30, falha("buscar", "Mercado"));
  const testes = ROTEIRO.filter((x) => x.teste).length, passaram = ROTEIRO.filter((x) => x.teste && x.teste.sucesso).length;
  t("o roteiro é o de uma sessão típica (30 turnos, 15 testes, 2 passos, 1 segredo)", ROTEIRO.length === 30 && testes === 15 && passaram === 10, `${testes} testes, ${passaram} passaram`);

  const jogar = (comSistema) => {
    let E = { ...E0, personagem: { ...HEROI, grupo: [] } };
    let livro = livroCom({ "cidade|vau": { nome: "Vau", esteve: marca(1, 0) } });
    const pagos = [];
    ROTEIRO.forEach((x, i) => {
      const n = i + 1;
      const lug = { ...livro.lugares }, pes = { ...livro.pessoas };
      if (x.novoSitio) lug[`vau|sitio|${x.novoSitio.toLowerCase()}`] = { nome: x.novoSitio, esteve: marca(x.dia, n) };
      if (x.novaCidade) lug[`cidade|${x.novaCidade.toLowerCase()}`] = { nome: x.novaCidade, esteve: marca(x.dia, n) };
      if (x.segredo) lug[`pedra|sitio|${x.segredo.toLowerCase()}`] = { nome: x.segredo, esteve: marca(x.dia, n), descobriu: { dia: x.dia } };
      if (x.conversa) pes[`npc|${x.conversa}`] = { nome: x.conversa, visto: marca(x.dia, n), falou: marca(x.dia, n) };
      livro = livroCom(lug, pes);
      E = { ...E, dia: x.dia, cidadeAtual: x.cidade, lugar: { nome: x.lugar } };
      const r = aplicar(E, SO_PROSA, comSistema ? { doSistema: { teste: x.teste ? { ...x.teste, desafio: x.teste.desafio } : null, factos: livro } } : {});
      if (r.feitoDoTurno) pagos.push({ n, ...r.feitoDoTurno });
      E = r.estado;
    });
    return { xp: E.personagem.xp, nivel: E.personagem.nivel, pagos };
  };
  const antes = jogar(false), depois = jogar(true);
  const vao = vaoDoNivel(5);
  const fracao = depois.xp / vao;
  console.log(`      antes (porta fechada, sem o sistema): ${antes.xp} XP · depois: ${depois.xp} XP = ${(fracao * 100).toFixed(1)}% do nível 5 · ${depois.pagos.map((p) => p.grau[0]).join("")}`);
  t("antes, com a porta fechada, a sessão fora da luta não dava XP nenhum (o defeito que isto conserta)", antes.xp === 0);
  /* A FAIXA: GRAUS diz ~20 feitos por nível. Uma sessão fora da luta tem de
     valer entre 1/7 e 1/3 de nível — abaixo, o herói volta a não subir sem
     espada; acima, a sessão sem luta sobe mais do que a luta e a quest juntas */
  t("depois, a sessão fica entre 1/7 e 1/3 de nível", fracao >= 1 / 7 && fracao <= 1 / 3 && depois.nivel === 5, `${(fracao * 100).toFixed(1)}%`);
  t("os feitos da sessão são os do roteiro: a cidade e os dois passos", depois.pagos.filter((p) => p.grau === "feito").length === 3, J(depois.pagos));
  t("e as miudezas param no teto de cada dia", depois.pagos.filter((p) => p.grau === "pequeno").length <= 2 * T.pequenosPorDia);

  /* moer Percepção: cem buscas, de quarto em quarto, num só dia */
  let E = { ...E0, personagem: { ...HEROI, grupo: [] } };
  for (let i = 0; i < 100; i++) E = aplicar({ ...E, lugar: { nome: `quarto ${i}` } }, SO_PROSA, { doSistema: { teste: { desafio: "buscar", sucesso: true }, factos: livroCom() } }).estado;
  t(`cem buscas num dia rendem no máximo ${T.pequenosPorDia} miudezas — moer Percepção não sobe ninguém`, E.personagem.xp === T.pequenosPorDia * xpDoFeito("pequeno", 5), String(E.personagem.xp));
  let M = { ...E0, personagem: { ...HEROI, grupo: [] } };
  for (let i = 0; i < 50; i++) M = aplicar(M, SO_PROSA, { doSistema: { teste: { desafio: "buscar", sucesso: true }, factos: livroCom() } }).estado;
  t("e cinquenta buscas no mesmo quarto rendem uma", M.personagem.xp === xpDoFeito("pequeno", 5));
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
