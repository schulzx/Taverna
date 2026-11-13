/* teste-ne4-substitutos.mjs (13/11/2026, Fase NE · NE4 e NE5) — o sistema faz o que só a IA fazia

   A régua da fase, dita pela pessoa: «nenhuma IA escreve estado de jogo»
   (mente/plano-nada-entra.md). O modo `boca` fecha todas as portas do
   Narrador, e cada coisa que hoje só acontece porque a IA a declara ficaria
   muda. A NE4 dá a cada uma um substituto do SISTEMA — módulo puro, por
   tabela, provado aqui — e a NE5 tira do pedido todos os «mande isto em
   `mudancas`/`sinais`/cânone».

   §1 o golpe sem alvo (agressao.js#ALVO_PELO_SISTEMA)
   §2 o objeto do cartaz (ofertas.js#objetoDoCartaz)
   §3 o convite pela conversa (indole.js#conviteNaFrase)
   §4 a fé e o chamado (divindades.js#aFeDoSistema, meio-do-turno.js#aFeDoTurno,
      raids.js#chamadoNaFrase)
   §5 a viagem sem destino e o fim do arco maior (viagem.js, geradores.js,
      meio-do-turno.js#oFimDoEventoGlobal)
   §6 a palavra do herói (palavra-dada.js#sementeDaPalavra, prometido.js)
   §7 a gente da cena e a recência no `boca` (a ficha, registo-da-cena.js)
   §8 NE5: o pedido não pede — a catraca do texto, e o teto que não cresce */
import fs from "node:fs";
import * as A from "../src/agressao.js";
import { objetoDoCartaz, ofertasDaqui, propostaDaOferta, envelopeDoCartaz } from "../src/ofertas.js";
import { segredosDaCidade } from "../src/mundo-base.js";
import { gerarGeografia } from "../src/geografia.js";
import { garantirMissoes, etapaDef } from "../src/missoes.js";
import { conviteNaFrase, CONVITE_NA_FRASE } from "../src/indole.js";
import { aFeDoSistema, FE_PELO_SISTEMA, MAGNITUDE_FE, DIVINDADE_PROMPT, CAMINHOS_PROMPT } from "../src/divindades.js";
import { aFeDoTurno, oFimDoEventoGlobal, aplicarAsMissoes } from "../src/motor/meio-do-turno.js";
import { chamadoNaFrase, CHAMADO_NA_FRASE, NIVEL_MINIMO } from "../src/raids.js";
import { jornadaSemDestino } from "../src/viagem.js";
import { processarDescansoLongoEventos, ALVOS_DO_DESCANSO } from "../src/geradores.js";
import { oEnvelopeDoMundo, oEnvelopeDaViagem, oEnvelopeDaGente } from "../src/motor/envelopes-do-turno.js";
import { sementeDaPalavra, PALAVRA_DADA } from "../src/palavra-dada.js";
import { guardarSementes, TIPOS_DE_SEMENTE } from "../src/prometido.js";
import { aFichaDeAtor } from "../src/motor/ficha-de-ator.js";
import { oAceitoDoCronista } from "../src/motor/cronista-do-turno.js";
import { osVistosDaNarrativa } from "../src/motor/entrega-do-turno.js";
import { oCronistaChama, portaAberta } from "../src/motor/portas-do-narrador.js";
import { montarSystemPrompt } from "../src/prompt.js";
import { envelopeSemCriatura } from "../src/emboscada.js";

let ok = 0, mal = 0;
const t = (nome, cond, info) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (info ? "  — " + info : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };
const estoura = (f) => { try { f(); return false; } catch { return true; } };

/* ============================================================ */
sec("§1 o golpe sem alvo: o sistema escolhe entre quem pôs à vista, ou diz que não há ninguém");
{
  const RATO = [{ nome: "Rato Gigante", ameaca: "fraco" }];
  const lerB = (frase, extra = {}) => A.lerAgressao(frase, { presentes: [], grupo: [], conhecidas: RATO, modoDoNarrador: "boca", ...extra });
  const a = lerB("Ataco o rato com a espada.");
  t("a criatura que o sistema pôs à vista é o alvo, pela raiz («o rato» é o Rato Gigante), no `boca`", a && a.tipo === "agressao" && a.criatura === true && a.nome === "Rato Gigante" && a.ameaca === "fraco" && a.deOnde === "sistema", J(a));
  t("…a ameaça é a que o sistema lhe deu, e o porquê sai da tabela", a.porqueDoPeso === A.ALVO_PELO_SISTEMA.porqueDoPeso && a.porque === A.ALVO_PELO_SISTEMA.porque);
  t("…e é a mesma no `mestre` sem prosa (o substituto não depende do modo)", J(A.lerAgressao("Ataco o rato com a espada.", { presentes: [], conhecidas: RATO })) === J(a));
  t("por pronome, a única criatura à vista é o alvo", (lerB("Avanço para golpeá-lo.") || {}).nome === "Rato Gigante");
  const duas = [...RATO, { nome: "Lobo das Cinzas", ameaca: "comum" }];
  t("duas à vista e só o pronome: o sistema não escolhe", (lerB("Avanço para golpeá-lo.", { conhecidas: duas }) || {}).tipo === "semAlvoConhecido");
  t("duas à vista e o nome de uma: é essa", (lerB("Corto o lobo ao meio.", { conhecidas: duas }) || {}).nome === "Lobo das Cinzas");
  t("no `boca`, a criatura que SÓ a prosa mostrou continua sem alvo (a porta `alvoDaProsa` fechada)", (A.lerAgressao("ataco o lobo", { presentes: [], mostrado: ["Um lobo salta da sebe."], modoDoNarrador: "boca" }) || {}).tipo === "semAlvoConhecido" && !portaAberta("alvoDaProsa", "boca"));
  t("a trava da casa: o nome que o sistema não tem não nasce da frase («ataco o dragão»)", (lerB("Ataco o dragão ancião.") || {}).tipo === "semAlvoConhecido");
  t("a pessoa sozinha na cena continua a não ser o «lo» por eliminação", (A.lerAgressao("Avanço para socá-lo.", { presentes: [{ nome: "Iris", papel: "herborista" }] }) || {}).tipo === "semAlvoConhecido");
  /* os candidatos: quem o sistema tem à frente, para o envelope */
  const P = [{ nome: "Doran" }, { nome: "Kaelith" }, { nome: "Yorick" }, { nome: "Rufino" }];
  const s = A.lerAgressao("Ataco o dragão.", { presentes: P, grupo: [{ nome: "Kaelith" }], comigo: ["Yorick"], conhecidas: RATO });
  t("sem alvo, o veredicto leva quem está à frente — sem o grupo nem quem anda comigo, com a criatura à vista", s.tipo === "semAlvoConhecido" && J(s.candidatos) === J(["Doran", "Rufino", "Rato Gigante"]), J(s.candidatos));
  t("…no máximo os da tabela (ALVO_PELO_SISTEMA.candidatos)", A.lerAgressao("Ataco o dragão.", { presentes: Array.from({ length: 9 }, (_, i) => ({ nome: "Pessoa " + i })) }).candidatos.length === A.ALVO_PELO_SISTEMA.candidatos);
  const env = A.envelopeSemAlvo(s, "Ataco o dragão.");
  t("o envelope diz os nomes e o que dizer — a cena pergunta contra quem é", env.includes("Doran, Rufino, Rato Gigante") && /Faça a cena perguntar contra quem é o golpe/.test(env));
  t("…e já não pede ao Narrador que abra a luta (NE5)", !/combate_iniciar|mudancas|DECLARE/.test(env));
  const vazio = A.envelopeSemAlvo(A.lerAgressao("Ataco o dragão.", { presentes: [] }), "Ataco o dragão.");
  t("sem ninguém à frente, o envelope diz que não há ninguém", /NÃO há alvo aqui/.test(vazio) && !/À minha frente/.test(vazio));
  t("a tabela é congelada e tem números", Object.isFrozen(A.ALVO_PELO_SISTEMA) && A.ALVO_PELO_SISTEMA.letras >= 3 && A.ALVO_PELO_SISTEMA.candidatos >= 1);
  t("criaturaAVistaDoGolpe: lixo não estoura", [null, undefined, {}, [], "x", [null, {}, { nome: "" }]].every((c) => A.criaturaAVistaDoGolpe("ataco o rato", c, true) === null) && A.criaturaAVistaDoGolpe(null, RATO, false) === null);
  const ent = congelar({ presentes: P.map((x) => ({ ...x })), conhecidas: RATO.map((x) => ({ ...x })) });
  t("a entrada congelada corre, e a mesma frase dá o mesmo", !estoura(() => A.lerAgressao("Ataco o rato.", ent)) && J(A.lerAgressao("Ataco o rato.", ent)) === J(A.lerAgressao("Ataco o rato.", ent)));
}

/* ============================================================ */
sec("§2 o objeto do cartaz: a busca que acha o segredo entrega-o");
{
  /* um cartaz «O que há em …» de verdade, do mural de uma semente */
  let of = null, mapa = null, cidade = null, semente = "";
  for (let i = 0; i < 400 && !of; i++) {
    semente = `ne4-${i}`;
    mapa = gerarGeografia(semente, "sobremundo");
    for (const c of mapa.cidades.slice(0, 3)) {
      const x = ofertasDaqui({ semente, mapa, cidade: c.nome, base: null, nivel: 3, quantas: 8 }).find((o) => o.molde === "prova");
      if (x) { of = x; cidade = c; break; }
    }
  }
  t("há um cartaz «prova» numa das sementes", !!of, semente);
  const etapa = of.etapas[0];
  t("a etapa `achar` diz ONDE está o objeto (o lugar do segredo da base)", etapa.tipo === "achar" && etapa.alvo === of.objeto && typeof etapa.onde === "string" && etapa.onde.length > 0, J(etapa));
  const seg = segredosDaCidade(semente, cidade).find((s) => s.local === etapa.onde);
  t("…e esse lugar tem mesmo o segredo, na base", !!seg, J(segredosDaCidade(semente, cidade)));
  const achado = { ...seg, especie: "segredo", onde: `em ${seg.local}` };
  const ms = garantirMissoes([{ ...propostaDaOferta(of), status: "ativa", id: "m_prova" }]);
  t("a missão guarda o `onde` (campo que a etapa já tinha)", ms[0].etapas[0].onde === etapa.onde);
  const ent = objetoDoCartaz(ms, achado, []);
  t("a busca que acha esse segredo entrega o objeto do cartaz", ent && ent.item === of.objeto && ent.missao === "m_prova", J(ent));
  t("…e com ele na bolsa, a etapa fecha pela régua de sempre (achar)", etapaDef("achar").ver(ms[0].etapas[0], { inventario: [ent.item] }) === true && etapaDef("achar").ver(ms[0].etapas[0], { inventario: [] }) === false);
  t("já na bolsa, não volta", objetoDoCartaz(ms, achado, [ent.item]) === null && objetoDoCartaz(ms, achado, [{ nome: ent.item }]) === null);
  t("noutro lugar, não (o `onde` da etapa manda)", objetoDoCartaz(ms, { ...achado, local: "Outro Sítio" }, []) === null);
  t("o cartaz de antes, sem `onde`, aceita o achado do mesmo tipo", (objetoDoCartaz(garantirMissoes([{ titulo: "X", status: "ativa", etapas: [{ tipo: "achar", alvo: of.objeto }] }]), { ...achado, local: "Outro Sítio" }, []) || {}).item === of.objeto);
  t("sem missão ativa, com a etapa feita, ou com o achado que não é segredo: nada", objetoDoCartaz(garantirMissoes([{ ...propostaDaOferta(of), status: "concluida" }]), achado, []) === null
    && objetoDoCartaz(garantirMissoes([{ ...propostaDaOferta(of), status: "ativa", etapas: [{ ...etapa, feito: true }] }]), achado, []) === null
    && objetoDoCartaz(ms, { ...achado, especie: "tesouro" }, []) === null && objetoDoCartaz(ms, { ...achado, especie: "passo" }, []) === null);
  t("lixo não estoura", [[null, null, null], [undefined, undefined, undefined], [{}, {}, {}], ["x", "y", "z"], [[null, 3], { especie: "segredo" }, null]].every(([m, a, i]) => objetoDoCartaz(m, a, i) === null));
  t("a entrada congelada corre e não muda", !estoura(() => objetoDoCartaz(congelar(garantirMissoes([{ ...propostaDaOferta(of), status: "ativa" }])), congelar({ ...achado }), congelar([]))));
  const env = envelopeDoCartaz(of);
  t("o envelope do cartaz já não pede `adicionar_itens` (NE5): diz o nome, e que o sistema entrega", !/adicionar_itens|mande/.test(env) && env.includes(`"${of.objeto}"`) && /o sistema põe-no na minha bolsa/.test(env));
}

/* ============================================================ */
sec("§3 o convite pela conversa: a frase do jogador leva ao veredicto do convite");
{
  const P = [{ nome: "Marta Sal" }, { nome: "Doran" }];
  const c = (x, p = P, g = []) => conviteNaFrase(x, { presentes: p, grupo: g });
  t("«Marta, quer vir comigo?» convida a Marta (pelo primeiro nome)", J(c("Marta, quer vir comigo?")) === J({ nome: "Marta Sal", porNome: true }));
  t("«Junte-se a mim, Doran» e «convido o Doran para o meu grupo»", (c("Junte-se a mim, Doran.") || {}).nome === "Doran" && (c("Convido o Doran para o meu grupo.") || {}).nome === "Doran");
  t("«acompanhe-me», «venha comigo», «queres viajar connosco?»", ["Acompanhe-me até a torre.", "Venha comigo.", "Queres viajar connosco?"].every((f) => (c(f, [{ nome: "Ivo" }]) || {}).nome === "Ivo"));
  t("sem nome e uma pessoa só em cena: é ela", J(c("— Quer vir comigo?", [{ nome: "Doran" }])) === J({ nome: "Doran", porNome: false }));
  t("sem nome e duas em cena: ninguém (o sistema não escolhe)", c("Quer vir comigo?") === null);
  t("a negação e o «vou contigo» (a outra direção) não convidam", c("Não quero que venha comigo, Marta.") === null && c("Vou contigo, Marta.") === null && c("Nunca te juntes a mim, Doran.") === null);
  t("quem já anda com o herói não é convidado", c("Venha comigo, Ivo.", [{ nome: "Ivo" }], [{ nome: "Ivo" }]) === null);
  t("frase que não convida: nada", c("Pergunto à Marta o preço do quarto.") === null && c("Ataco o Doran.") === null);
  t("lixo não estoura", [null, undefined, "", 5, {}].every((x) => conviteNaFrase(x, null) === null) && conviteNaFrase("venha comigo", { presentes: [null, 3, {}], grupo: "x" }) === null);
  t("a tabela é congelada, com as formas e as negações", Object.isFrozen(CONVITE_NA_FRASE) && CONVITE_NA_FRASE.convida.every((r) => r instanceof RegExp) && CONVITE_NA_FRASE.naoE.length >= 2 && CONVITE_NA_FRASE.letras >= 2);
}

/* ============================================================ */
sec("§4 a fé pelo que o herói faz, e o chamado pela frase dele");
{
  const F = (e) => aFeDoSistema({ despertar: true, dia: 5, ...e });
  t("o gesto devoto da frase vale um sussurro", J(F({ frase: "Abençoo as crianças da praça." })) === J({ magnitude: "sussurro", de: "gesto", id: "gesto", motivo: `${FE_PELO_SISTEMA.gesto.o} — ${MAGNITUDE_FE.sussurro.desc}` }));
  t("…um por dia (o `ultimoFeitoDia` de hoje cala-o)", F({ frase: "Prego na praça.", ultimoFeitoDia: 5 }) === null && !!F({ frase: "Prego na praça.", ultimoFeitoDia: 4 }));
  t("a negação e a pergunta não contam", F({ frase: "Não abençoo ninguém." }) === null && F({ frase: "Abençoo-te?" }) === null && F({ frase: "Compro pão." }) === null);
  t("o feito que os contadores contaram vale a magnitude da tabela, o MAIOR do turno", F({ feitos: { missao: 1 } }).magnitude === "feito" && F({ feitos: { missao: 2, lendario: 1 } }).magnitude === "proeza" && F({ feitos: { marco: 1, missao: 1 } }).id === "marco");
  t("…e o feito não espera o dia (é raro, e é o que a cidade comenta)", F({ feitos: { missao: 1 }, ultimoFeitoDia: 5 }).de === "feito");
  t("quem não despertou não ganha fé, e lixo é nada", aFeDoSistema({ despertar: false, feitos: { marco: 1 } }) === null && [null, undefined, 3, "x", {}].every((x) => aFeDoSistema(x) === null));
  t("a tabela é congelada e cada magnitude existe em MAGNITUDE_FE", Object.isFrozen(FE_PELO_SISTEMA) && [...FE_PELO_SISTEMA.feitos.map((f) => f.magnitude), FE_PELO_SISTEMA.gesto.magnitude].every((m) => !!MAGNITUDE_FE[m]));
  /* o turno: a mesma conta do sinal (fieisPorFeito, ganhoDeFe) */
  const mapa = { cidades: [{ nome: "Vau", populacao: 1000 }] };
  const E0 = congelar({ divindade: { despertar: true, fieis: 50, pf: 3 }, devocao: null, mapa, cidadeAtual: "Vau", dia: 4, personagem: { nivel: 16 }, contadores: {} });
  const r = aFeDoTurno(E0, { frase: "Prego na praça em meu nome." });
  t("aFeDoTurno: o gesto dá fiéis em Vau e grava o dia", r.fe && r.fe.de === "gesto" && r.estado.divindade.ultimoFeitoDia === 4 && r.estado.divindade.fieis > 50 && r.msgs.some((m) => /fiéis em Vau/.test(m)), J(r.msgs));
  t("…os efeitos são os da porta do sinal (divindade, devoção)", r.efeitos.some((e) => e.tipo === "divindade") && r.efeitos.some((e) => e.tipo === "devocao"));
  t("…e o segundo gesto do dia não dá nada", aFeDoTurno({ ...r.estado }, { frase: "Prego de novo." }).fe === null);
  t("a entrada congelada não muda (o estado é novo)", E0.divindade.fieis === 50 && r.estado !== E0);
  t("sem fé desperta, ou com lixo, nada", aFeDoTurno({ divindade: { despertar: false } }, { frase: "Prego." }).fe === null && aFeDoTurno(null, null).fe === null);
  t("o prompt já não pede o sinal da fé, do milagre nem da ascensão (NE5)", !/fe:sussurro|mande em "sinais"|mande "milagre|sinal "ascender/.test(DIVINDADE_PROMPT + CAMINHOS_PROMPT) && /o SISTEMA conta a fé/.test(DIVINDADE_PROMPT));
  /* o chamado */
  const A1 = [{ nome: "Dragão de Cinza" }];
  t("«toco o sino e convoco todos contra o dragão» chama contra a ameaça que o sistema tem", J(chamadoNaFrase("Toco o sino da torre e convoco todos contra o dragão!", { nivel: NIVEL_MINIMO, ameacas: A1 })) === J({ chefe: "Dragão de Cinza", pode: true, motivo: "" }));
  t("abaixo do nível, o veredicto diz porquê (podeAbrirRaid)", (() => { const r2 = chamadoNaFrase("Convoco os aliados!", { nivel: NIVEL_MINIMO - 1, ameacas: A1 }); return r2 && r2.pode === false && r2.motivo.length > 10; })());
  t("sem ameaça conhecida, ou duas e nenhuma dita: não há chamado (o sistema não inventa o inimigo)", chamadoNaFrase("Convoco os aliados!", { nivel: 20, ameacas: [] }) === null && chamadoNaFrase("Convoco os aliados!", { nivel: 20, ameacas: [...A1, { nome: "Lich Velho" }] }) === null && (chamadoNaFrase("Convoco os aliados contra o lich!", { nivel: 20, ameacas: [...A1, { nome: "Lich Velho" }] }) || {}).chefe === "Lich Velho");
  t("a frase que não chama, a negada e a pergunta: nada; lixo não estoura", chamadoNaFrase("Ataco o dragão.", { nivel: 20, ameacas: A1 }) === null && chamadoNaFrase("Não convoco ninguém.", { nivel: 20, ameacas: A1 }) === null && chamadoNaFrase("Convoco os aliados?", { nivel: 20, ameacas: A1 }) === null && [null, 3, {}].every((x) => chamadoNaFrase(x, x) === null));
  t("a tabela do chamado é congelada", Object.isFrozen(CHAMADO_NA_FRASE) && CHAMADO_NA_FRASE.chama.every((r) => r instanceof RegExp) && CHAMADO_NA_FRASE.letras >= 3);
}

/* ============================================================ */
sec("§5 a viagem sem destino chega pelo sistema, e o arco maior acaba pelo sistema");
{
  const j = { de: "Vau", para: "", totalMin: 1440, andadoMin: 240, dias: 3 };
  t("a jornada sem destino já fechava pelo sistema, na cidade de onde se partiu (MM11)", (() => { const x = jornadaSemDestino(j); return x.para === "Vau" && x.semDestino === true; })());
  const trecho = (extra) => oEnvelopeDaViagem("trecho", { local: "estrada", clima: { rotulo: "c", nota: "n" }, encontro: { tipo: "x", detalhe: "y" }, meio: "", paraBoca: false, ultimoTrecho: false, alvo: null, paraCidade: "", ultimoTrechoCidade: false, destino: "", ritmo: { nome: "Normal", desc: "d" }, notaMarcha: "", notaErmos: "", notaAmbulante: "", extraTempo: "", ...extra });
  t("o trecho sem destino já não pede jornada_meio nem cidade_atual (NE5), e diz que a chegada é do sistema", [trecho({}), trecho({ destino: "Agulha" })].every((x) => !/jornada_meio|cidade_atual|registre/.test(x) && /A chegada é do sistema/.test(x)));
  /* o desfecho na última etapa */
  const g = { id: "gl", nome: "A Praga Cinzenta", semente: "s", etapas: ["a", "b", "Encruzilhada: cura, contenção ou catástrofe."], etapa: 2, desde: 1 };
  const cheio = [{ expiraEm: 99 }, { expiraEm: 99 }, { expiraEm: 99 }];
  const cai = (n) => () => (n - 1) / 20 + 0.001;
  const fim = processarDescansoLongoEventos({ locais: cheio, global: g, semGlobalDesde: 0, seq: 1 }, {}, { dia: 9, secundariasAtivas: ALVOS_DO_DESCANSO.secundariasMax, sorte: cai(ALVOS_DO_DESCANSO.desfecho) });
  t("na última etapa, no alvo do desfecho, o arco acaba: sai o global e o relógio da garantia recomeça hoje", fim.globalEncerrado && fim.globalEncerrado.nome === g.nome && fim.eventos.global === null && fim.eventos.semGlobalDesde === 9);
  t("…e o dado do desfecho fica no bastidor, com o alvo da tabela", fim.bastidor.some((b) => /Desfecho/.test(b.rotulo) && b.alvo === ALVOS_DO_DESCANSO.desfecho));
  const nao = processarDescansoLongoEventos({ locais: cheio, global: g, semGlobalDesde: 0, seq: 1 }, {}, { dia: 9, secundariasAtivas: ALVOS_DO_DESCANSO.secundariasMax, sorte: cai(ALVOS_DO_DESCANSO.desfecho - 1) });
  t("abaixo do alvo, o arco espera na última etapa", !nao.globalEncerrado && nao.eventos.global && nao.eventos.global.etapa === 2);
  const meio = processarDescansoLongoEventos({ locais: cheio, global: { ...g, etapa: 0 }, semGlobalDesde: 0, seq: 1 }, {}, { dia: 9, secundariasAtivas: ALVOS_DO_DESCANSO.secundariasMax, sorte: cai(20) });
  t("antes da última, é a escalada de sempre (nunca o desfecho)", meio.globalAvancou && !meio.globalEncerrado && meio.eventos.global.etapa === 1);
  const env = oEnvelopeDoMundo("globalFim", g);
  t("o envelope do desfecho diz o fato e a última etapa, e não pede campo", env.includes("A PRAGA CINZENTA · DESFECHO") && env.includes(g.etapas[2]) && !/mudancas|evento_global_encerrar/.test(env));
  const of = oFimDoEventoGlobal({ historia: null, eventos: fim.eventos }, fim.globalEncerrado, {});
  t("oFimDoEventoGlobal: o marco vira o arco da história, e a linha do jogador", of.msgs.some((m) => m.includes("A Praga Cinzenta: desfecho alcançado")) && of.efeitos.some((e) => e.tipo === "historia") && of.historia && of.historia !== null);
  t("sem arco, nada (lixo não estoura)", J(oFimDoEventoGlobal(null, null, null).msgs) === "[]" && J(oFimDoEventoGlobal({}, {}, {}).efeitos) === "[]");
  /* a porta do campo antigo (o `mestre`, até a NE7) corre pela mesma peça */
  const viaCampo = aplicarAsMissoes({ eventos: { locais: [], global: g, semGlobalDesde: 0, seq: 1 }, historia: null, dia: 9 }, { narrativa: "x", mudancas: { evento_global_encerrar: true } }, { modoDoNarrador: "mestre" });
  t("o campo antigo, no `mestre`, fecha pela MESMA peça (as mesmas linhas)", J(viaCampo.msgs) === J(of.msgs) && viaCampo.estado.eventos.global === null);
  t("e no `boca` o campo não fecha nada (a porta fechada)", aplicarAsMissoes({ eventos: { locais: [], global: g, semGlobalDesde: 0, seq: 1 }, historia: null, dia: 9 }, { narrativa: "x", mudancas: { evento_global_encerrar: true } }, { modoDoNarrador: "boca" }).estado.eventos.global === g);
}

/* ============================================================ */
sec("§6 a palavra que o herói dá é registada pela frase dele");
{
  const P = [{ nome: "Rosalina Vau" }, { nome: "Ivo" }];
  const s = sementeDaPalavra("— Prometo-te que trago a tua filha de volta, Rosalina.", { presentes: P });
  t("a promessa da frase vira semente do tipo da tabela, com a quem foi dada", s && s.tipo === PALAVRA_DADA.tipoDaSemente && s.quem === "Rosalina Vau" && /Prometo-te que trago a tua filha de volta/.test(s.texto), J(s));
  t("sem nome e uma pessoa em cena: é a ela", (sementeDaPalavra("Digo: \"juro que volto antes do inverno\".", { presentes: [{ nome: "Ivo" }] }) || {}).quem === "Ivo");
  t("sem destinatário reconhecido, a promessa vale na mesma (sem rosto)", (sementeDaPalavra("Prometo ao povo de Vau que a ponte fica de pé.", { presentes: P }) || {}).quem === "");
  t("o que não é promessa não entra: a negação, jurar que é verdade, o plano", sementeDaPalavra("Não prometo nada.", {}) === null && sementeDaPalavra("Juro que não fui eu!", {}) === null && sementeDaPalavra("Vou à torre amanhã.", {}) === null);
  t("lixo não estoura", [null, undefined, 5, {}].every((x) => sementeDaPalavra(x, x) === null));
  const tipo = TIPOS_DE_SEMENTE.find((x) => x.id === "palavra");
  t("o tipo «palavra» está na tabela do prometido, com prazos e o que volta", !!tipo && tipo.madura < tipo.vence && tipo.vence < tipo.expira && /cobra/.test(tipo.volta));
  const g = guardarSementes(null, [s]);
  t("o caderno do prometido guarda-a (guardarSementes, a mesma porta do Cronista)", g.guardadas.length === 1 && g.estado.sementes[0].tipo === "palavra" && g.estado.sementes[0].quem === "Rosalina Vau");
  t("…e a mesma palavra dita de novo não entra duas vezes", guardarSementes(g.estado, [s]).guardadas.length === 0);
}

/* ============================================================ */
sec("§7 a gente da cena e a recência no `boca`: a ficha, com o pedido do `mestre`");
{
  /* a pauta do pedido do `mestre` traz as mesmas linhas que a ficha lê (ONDE, EM CENA) */
  const BRAM = { nome: "Bram", grupo: [{ nome: "Leonor" }], inventario: [] };
  const PAUTA = "[PAUTA DO TURNO 4]\nONDE      Na Poça da Foz, dentro de Monte da Forca\nEM CENA   Inez do Prado Baixo (atendente) · Leonor (com você) · Lobo cinzento (fera)";
  const ficha = aFichaDeAtor({ frase: "Pergunto à Inez quanto custa um quarto.", nota: PAUTA, estado: { personagem: BRAM } });
  t("a ficha calcula-se da pauta do `mestre` (o pedido do `boca`): quem fala e com quem o herói falou", ficha.conversa.includes("Inez do Prado Baixo") && ficha.falam.includes("Inez do Prado Baixo"));
  t("no `boca` o Cronista não chama (é a ficha que regista)", oCronistaChama("boca") === false && oCronistaChama("mestre") === true);
  const efeitos = [];
  const E = { npcs: {}, canone: {}, missoes: [], personagem: BRAM, cidadeAtual: "Monte da Forca" };
  const ctx = new Proxy({ ler: () => E, aplicar: (x) => { for (const ef of x) { efeitos.push(ef); if (ef.tipo === "npcs") E.npcs = ef.npcs; } }, pers: BRAM, narrativa: "Um tal Zé Inventado entra a gritar.", testeDoTurno: null, rolagem: null, modoDoNarrador: "boca", fichaDoAtor: ficha, aceite: null, conferirCom: (p) => p }, { get: (o, k) => (k in o ? o[k] : () => undefined) });
  oAceitoDoCronista({}, [], {}, ctx);
  t("no `boca`, com a ficha, a Inez entra no registo (e o inventado da prosa não)", !!E.npcs["Inez do Prado Baixo"] && !Object.keys(E.npcs).some((n) => /Zé/.test(n)), J(Object.keys(E.npcs)));
  const r = osVistosDaNarrativa({ elenco: null, npcs: { "Inez do Prado Baixo": { nome: "Inez do Prado Baixo" }, "Zé Inventado": { nome: "Zé Inventado" } }, dia: 3 }, "Zé Inventado entra a gritar.", "boca", ficha.falam);
  t("a recência no `boca` vem de quem a ficha pôs a falar, nunca da prosa", r.elenco && r.elenco.vistos && J(r.elenco.vistos["Inez do Prado Baixo"]) === "[3]" && !r.elenco.vistos["Zé Inventado"], J(r.elenco && r.elenco.vistos));
}

/* ============================================================ */
sec("§8 NE5: o pedido não pede — nada no prompt nem nos envelopes solicita `mudancas`, sinais ou cânone");
{
  /* A CATRACA DO TEXTO. Lê cada linha de código (não de comentário) dos
     módulos do Narrador, frase a frase (o ponto e a crase partem), e procura
     o verbo que pede («mande», «envie», «registre», «declare», «preencha»)
     seguido de um campo entre aspas, de `mudancas`, de `sinais` ou do cânone.
     A negação («NÃO envie…») é a direção certa e não conta. Ficam de fora
     os pedidos das OUTRAS IAs (o Cronista, que a porta `cronista` fecha no
     `boca`): não são o pedido do Narrador. Provada contra a árvore de
     f1645f2 (antes da NE5): apanha as 14 frases que pediam, em sete módulos —
     o golpe sem alvo, a investida sem ficha e a desproporcional, o objeto do
     cartaz, a fé, o milagre, a ascensão (o sinal e o cânone), o chamado, o
     trecho sem destino e a relação formal. */
  const DO_CRONISTA = ["gatilho-do-cronista.js", "cronista-do-turno.js", "cronista.js", "prometido.js"];
  const PEDE = /\b(mande|envie|registre|declare|preencha)\b[^.;`]{0,80}?(["“][a-z_]{3,}(:[^"”]*)?["”]|\bmudancas\b|\bsinais\b|c[aâ]none)/i;
  const NEGA = /\b(n[aã]o|nunca|jamais|nem)\s+(\S+\s+){0,2}(mande|envie|registre|declare|preencha)\b/i;
  const varrer = (dir) => {
    const achados = [];
    const arqs = [...fs.readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => [f, dir + f]), ...fs.readdirSync(dir + "motor").filter((f) => f.endsWith(".js")).map((f) => [f, dir + "motor/" + f])];
    for (const [nome, cam] of arqs) {
      if (DO_CRONISTA.includes(nome)) continue;
      fs.readFileSync(cam, "utf8").split("\n").forEach((l, i) => {
        if (/^\s*(\/\*|\*|\/\/)/.test(l)) return;
        for (const frase of l.replace(/\\/g, "").split(/(?<=[.!?])\s+|`/)) if (PEDE.test(frase) && !NEGA.test(frase)) achados.push(`${nome}:${i + 1} ${frase.trim().slice(0, 90)}`);
      });
    }
    return achados;
  };
  const achados = varrer(new URL("../src/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  t(`nenhuma linha dos módulos do Narrador pede um campo${achados.length ? " — " + achados.join(" | ") : ""}`, achados.length === 0);
  t("a catraca morde: as seis frases de antes da NE5 seriam apanhadas", [
    `1) HÁ alvo aqui — então DECLARE em mudancas "combate_iniciar": [{"nome":"…"}] com ele agora`,
    `use exatamente esse nome quando eu encontrar, e mande-o com "adicionar_itens".`,
    `quando o herói fizer algo que mereça fé, mande em "sinais" a magnitude — "fe:sussurro"`,
    `O CHAMADO: diante de uma ameaça que ninguém derruba sozinho, mande em mudancas "sinais": ["raid:<nome da coisa>"]`,
    `Registre no cânone e trate como verdade absoluta daqui em diante.`,
    `O culto da divindade morta jura vingança eterna — registre isso no cânone e faça o mundo reagir`,
  ].every((f) => PEDE.test(f) && !NEGA.test(f)) && NEGA.test("NÃO envie \"adicionar_itens\" nem \"adicionar_equipamento\""));
  /* o prompt inteiro: só o formato fala de `mudancas`, e diz que é sempre null */
  const pers = { nome: "B", conceito: "d", historia: "", nivel: 20, raca: "Humano", classe: "Druida", atributos: { forca: 1, destreza: 1, vigor: 4, intelecto: 4, presenca: 1, percepcao: 1 }, vidaMax: 200, manaMax: 120 };
  const piorReal = { emCombate: true, emMasmorra: true, temChao: true, temGente: true, conjura: true, temGrupo: true, aflicao: true, temSintonia: true, temRegraPropria: true, temMissao: true, temGatilho: true, temDadiva: true, temEspecializacao: true, despertou: true, invoca: true, temLegado: true };
  const montar = (cena) => montarSystemPrompt("C", { genero: "Fantasia medieval" }, pers, {}, { elenco: [], cidades: [], tavernas: [] }, "", "", "", "", "", "", "Mortal", cena);
  const teto = montar(undefined), pior = montar(piorReal);
  t("o prompt já não pede o chamado nem campo nenhum, e diz que `mudancas` é sempre null", [teto, pior].every((p) => !/O CHAMADO: |raid:<nome|fe:sussurro|mande em|salvo o que este texto/.test(p) && /"mudancas" é sempre null/.test(p)));
  /* O TETO NÃO CRESCE. Medidos em f1645f2 (antes da NE4/NE5), com estas
     mesmas entradas: o prompt da pior cena real 61.433 e o de todas as
     portas 74.633; o DIVINDADE_PROMPT 2.620 e o CAMINHOS_PROMPT 1.092; o
     golpe sem alvo 840 (com «ataco o x»); o cartaz com objeto 543; a
     investida sem ficha 727. Só se tirou texto. */
  const ANTES = { pior: 61433, teto: 74633, divindade: 2620, caminhos: 1092, semAlvo: 840, cartaz: 543, semCriatura: 727 };
  t(`o prompt não cresce (pior cena ${pior.length} ≤ ${ANTES.pior}; todas as portas ${teto.length} ≤ ${ANTES.teto})`, pior.length <= ANTES.pior && teto.length <= ANTES.teto);
  t(`os blocos da fé encolhem (${DIVINDADE_PROMPT.length} ≤ ${ANTES.divindade}; ${CAMINHOS_PROMPT.length} ≤ ${ANTES.caminhos})`, DIVINDADE_PROMPT.length <= ANTES.divindade && CAMINHOS_PROMPT.length <= ANTES.caminhos);
  const semAlvo = A.envelopeSemAlvo({ tipo: "semAlvoConhecido" }, "ataco o x");
  const cartaz = envelopeDoCartaz({ titulo: "T", descricao: "d", dador: "Ana", paga: 10, prazo: 0, objeto: "livro-caixa", etapas: [] });
  t(`os envelopes que mudaram não crescem (sem alvo ${semAlvo.length} ≤ ${ANTES.semAlvo}; cartaz ${cartaz.length} ≤ ${ANTES.cartaz}; sem ficha ${envelopeSemCriatura().length} ≤ ${ANTES.semCriatura})`, semAlvo.length <= ANTES.semAlvo && cartaz.length <= ANTES.cartaz && envelopeSemCriatura().length <= ANTES.semCriatura);
  t("a relação formal diz que o sistema já a guardou, e não pede o cânone", (() => { const x = oEnvelopeDaGente("relacaoFormal", { nome: "Iris", rotulo: "Aliada", relacao: "aliado" }); return /O sistema já a guardou/.test(x) && !/Registre/.test(x); })());
}

console.log(`\nNE4 · os substitutos (e NE5): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
