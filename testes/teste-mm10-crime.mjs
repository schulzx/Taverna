/* teste-mm10-crime.mjs (Fase MM · MM10) — a violência que a cidade vê

   Atacar quem não é inimigo passa a ser crime: contra um figurante, a
   cidade reage (a lei da ficha da MM12, a recompensa, as portas fechadas,
   quem viu); contra alguém do elenco, é história (a casa e quem gosta
   dele). O procurado mora no campo novo `lei` do save e expira. */
import {
  GRAVIDADES, RECOMPENSA_POR_ESCALA, OLHOS_NA_RUA, GUARDA_QUE_VEM, TESTEMUNHAS_DITAS, LEI_VERSAO,
  lerCrime, consequenciaDoCrime, garantirLei, registrarCrime, agravarParaMorte, procuradoEm, fatorDePreco, servicoRecusado,
  procuradoParaPauta, guardaQueVem, envelopeDaGuarda, veredictoDoCrime, reacaoDoElenco,
} from "../src/crime.js";
import { lerAgressao } from "../src/agressao.js";
import { criarNPC, firmarLaco } from "../src/npcs.js";
import { elencoDoMundo, garantirElencoDoSave, foraDeCenaParaPauta } from "../src/elenco.js";
import { fichaDaCidade, ESCALA_DO_PORTE } from "../src/cidade-por-dentro.js";
import { SECOES, porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { registoSimulado } from "./registo-simulado.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const G = "Fantasia medieval";
const SEM = "Sonda da Gente|Fantasia medieval";
const MAPA = gerarGeografia(SEM, "sobremundo");
const CIDADE = MAPA.cidades.find((c) => c.porte === "cidade") || MAPA.cidades[0];
const ALDEIA = MAPA.cidades.find((c) => c.porte === "aldeia");
const mundo = (extra = {}) => ({ semente: SEM, mapa: MAPA, cidade: CIDADE, genero: G, noite: false, dia: 10, ...extra });
const AGR = { tipo: "agressao", nome: "Aldo Ferreira", papel: "taverneiro" };
const ctx = (extra = {}) => ({ npcs: { "Aldo Ferreira": criarNPC("Aldo Ferreira", { papel: "taverneiro" }) }, presentes: [{ nome: "Aldo Ferreira" }, { nome: "Mira" }, { nome: "Bram" }], grupo: [], elenco: [], ...extra });

/* ============================================================ */
sec("1. as tabelas");
{
  t("três gravidades, em ordem: roubar < ferir < matar", GRAVIDADES.roubar.ordem < GRAVIDADES.ferir.ordem && GRAVIDADES.ferir.ordem < GRAVIDADES.matar.ordem);
  t("quanto mais grave, mais cara a cabeça, mais longo o prazo e mais alto o preço", GRAVIDADES.roubar.recompensa < GRAVIDADES.ferir.recompensa && GRAVIDADES.ferir.recompensa < GRAVIDADES.matar.recompensa && GRAVIDADES.ferir.dias < GRAVIDADES.matar.dias && GRAVIDADES.ferir.preco < GRAVIDADES.matar.preco);
  t("toda gravidade diz o verbo nas duas pessoas", Object.values(GRAVIDADES).every((g) => g.o && g.eu));
  const escalas = [...new Set(Object.values(ESCALA_DO_PORTE))].filter((e) => e >= 1);
  t("a escala da recompensa, dos olhos e da guarda cobre todas as escalas da ficha (MM12)", escalas.every((e) => RECOMPENSA_POR_ESCALA[e] && OLHOS_NA_RUA[e] && GUARDA_QUE_VEM[e]));
  t("a guarda que vem é gente com nome e ameaça (o combate de sempre)", Object.values(GUARDA_QUE_VEM).every((g) => g.chance >= 0 && g.chance <= 1 && g.quem.every((q) => q.nome && ["fraco", "comum", "competente", "elite", "lendario"].includes(q.ameaca))));
  t("a aldeia não tem guarda que venha", GUARDA_QUE_VEM[1].chance === 0);
  t("de dia alguém sempre vê", Object.values(OLHOS_NA_RUA).every((o) => o.dia));
}

/* ============================================================ */
sec("2. o que é crime e o que não é");
{
  const c = lerCrime(AGR, ctx());
  t("atacar o taverneiro é crime (ferir)", c && c.vitima === "Aldo Ferreira" && c.gravidade === "ferir");
  t("quem estava presente é testemunha (a vítima não)", c.testemunhas.join() === "Mira,Bram");
  t("o inimigo declarado não é crime", lerCrime(AGR, ctx({ npcs: { "Aldo Ferreira": criarNPC("Aldo Ferreira", { relacao: "inimigo" }) } })) === null);
  t("legítima defesa não é crime (quem me atacou agora)", lerCrime(AGR, ctx({ hostis: ["Aldo Ferreira"] })) === null);
  t("o companheiro nunca é vítima de crime por aqui", lerCrime(AGR, ctx({ grupo: [{ nome: "Aldo Ferreira" }] })) === null);
  t("sem agressão, sem crime", [null, {}, { tipo: "companheiro", nome: "X" }, { tipo: "semAlvoConhecido" }].every((a) => lerCrime(a, ctx()) === null));
  /* parte do que lerAgressao devolve — não repeneira a frase */
  const lido = lerAgressao("Soco o Aldo Ferreira na cara", { presentes: [{ nome: "Aldo Ferreira", papel: "taverneiro" }, { nome: "Mira" }], grupo: [] });
  t("parte do que lerAgressao devolveu", lido && lido.tipo === "agressao" && lerCrime(lido, ctx()).vitima === "Aldo Ferreira");
  t(`no máximo ${TESTEMUNHAS_DITAS} testemunhas`, lerCrime(AGR, ctx({ presentes: ["A", "B", "C", "D", "E"].map((nome) => ({ nome })) })).testemunhas.length === TESTEMUNHAS_DITAS);
  t("o companheiro que viu não é testemunha contra mim", !lerCrime(AGR, ctx({ grupo: [{ nome: "Bram" }] })).testemunhas.includes("Bram"));
  t("roubar e matar existem como gravidade", lerCrime(AGR, ctx(), "roubar").gravidade === "roubar" && lerCrime(AGR, ctx(), "matar").gravidade === "matar" && lerCrime(AGR, ctx(), "inventada").gravidade === "ferir");
}

/* ============================================================ */
sec("3. o figurante chama a cidade");
{
  const c = lerCrime(AGR, ctx());
  const cons = consequenciaDoCrime(c, mundo());
  const ficha = fichaDaCidade(CIDADE, { semente: SEM, mapa: MAPA, genero: G });
  console.log(`      ${cons.linhas.acabou[0]}\n      ${cons.linhas.naoPode[0]}`);
  t("com testemunhas, a cidade sabe", cons.conhecido === true);
  t("quem vem atrás é a lei da ficha da cidade (MM12)", ficha.instituicoes.lei.startsWith(cons.cidade.quem) && cons.cidade.lei === ficha.instituicoes.lei);
  t("a recompensa é a da gravidade na escala da cidade", cons.cidade.recompensa === Math.round(GRAVIDADES.ferir.recompensa * RECOMPENSA_POR_ESCALA[ficha.escala]));
  t("as portas fecham: preço e pouso", cons.cidade.preco === GRAVIDADES.ferir.preco && cons.cidade.recusam.includes("pouso"));
  t("a linha diz quem viu, o que fiz e o preço da cabeça", cons.linhas.acabou[0].startsWith("Mira, Bram viram: eu ataquei Aldo Ferreira") && cons.linhas.acabou[0].includes(`${cons.cidade.recompensa} moedas`));
  t("e o veto da cena: ninguém me trata como um forasteiro qualquer", /ninguém me recebe como um forasteiro qualquer/.test(cons.linhas.naoPode[0]));
  t("sem mecanismo nomeado", !/sistema|procurado|crime|gravidade/i.test(cons.linhas.acabou[0] + cons.linhas.naoPode[0]));
  const semOlhos = consequenciaDoCrime({ ...c, testemunhas: [] }, mundo({ cidade: ALDEIA || CIDADE, noite: true }));
  t("sem testemunha, de noite, numa cidade sem ronda: a cidade não fica a saber", ALDEIA ? semOlhos.conhecido === false && semOlhos.cidade === null && semOlhos.linhas.acabou.length === 0 : true);
  if (ALDEIA) {
    const al = consequenciaDoCrime(c, mundo({ cidade: ALDEIA }));
    t("na aldeia sem lei de ofício, quem vem são os vizinhos que a ficha nomeia", !/^ningu/i.test(al.cidade.quem) && al.cidade.recompensa < cons.cidade.recompensa);
  }
  t("determinismo: a mesma consequência duas vezes", JSON.stringify(cons) === JSON.stringify(consequenciaDoCrime(lerCrime(AGR, ctx()), mundo())));
}

/* ============================================================ */
sec("4. o do elenco chama a história");
{
  const espinha = estenderEspinha({ semente: SEM, mapa: MAPA, genero: G, cidadeInicial: MAPA.cidades[0].nome });
  const guildas = guildasDoMundo(SEM, MAPA, G);
  const elCtx = { genero: G, espinha, guildas };
  const el = elencoDoMundo(SEM, MAPA, elCtx);
  const k = el.casas.find((x) => x.membros.some((m) => el.pessoas.some((p) => p.nome === m && p.casa === x.nome)));
  const vitima = el.pessoas.find((p) => p.casa === k.nome);
  const cidadeV = MAPA.cidades.find((c) => c.nome === vitima.cidade);
  const agr = { tipo: "agressao", nome: vitima.nome, papel: vitima.papel };
  const c = lerCrime(agr, { npcs: {}, presentes: [{ nome: vitima.nome }], grupo: [], elenco: el.pessoas.map((p) => p.nome) });
  const cons = consequenciaDoCrime(c, { semente: SEM, mapa: MAPA, cidade: cidadeV, genero: G, noite: false, elencoCtx: elCtx });
  t("a vítima é do elenco", c.doElenco === true);
  t("a casa dela entra na história", cons.historia && cons.historia.casa && cons.historia.casa.nome === k.nome && cons.linhas.acabou.some((l) => l.includes(k.nome)));
  t("quem gosta dela está nomeado (família, amizade, amor, aprendizado)", Array.isArray(cons.historia.quemGosta) && cons.historia.quemGosta.length >= 1);
  const e = reacaoDoElenco(garantirElencoDoSave(null), c, cons, 10);
  const feito = e.feitos[e.feitos.length - 1];
  t("quem gosta dela dá um passo fora de cena (MM8f)", feito && feito.com === vitima.nome && cons.historia.quemGosta.includes(feito.quem) && /jurou/.test(feito.o));
  t("e esse passo chega à cena de quem está na cidade dela", foraDeCenaParaPauta(e, { dia: 11, cidade: feito.cidade }).foraDeCena.length === 1);
  t("o figurante não chama história nenhuma", consequenciaDoCrime(lerCrime(AGR, ctx()), mundo()).historia === null);
}

/* ============================================================ */
sec("5. o procurado: registo, preço, pauta, guarda e prazo");
{
  const c = lerCrime(AGR, ctx());
  const cons = consequenciaDoCrime(c, mundo());
  let lei = registrarCrime(null, cons, c, 10);
  const e = procuradoEm(lei, CIDADE, 12);
  t("procurado na cidade do crime, com a recompensa e o prazo da tabela", e && e.recompensa === cons.cidade.recompensa && e.ate === 10 + GRAVIDADES.ferir.dias && e.vitima === "Aldo Ferreira");
  t("noutra cidade, não", procuradoEm(lei, { nome: "Outra" }, 12) === null);
  t("o procurado EXPIRA", procuradoEm(lei, CIDADE, 10 + GRAVIDADES.ferir.dias) && procuradoEm(lei, CIDADE, 10 + GRAVIDADES.ferir.dias + 1) === null);
  t("preço mais alto enquanto dura, e o normal depois", fatorDePreco(lei, CIDADE, 12) === GRAVIDADES.ferir.preco && fatorDePreco(lei, CIDADE, 40) === 1);
  t("o pouso recusa-se, o mercado não", servicoRecusado(lei, CIDADE, 12, "pouso") && !servicoRecusado(lei, CIDADE, 12, "mercado"));
  const p = procuradoParaPauta(lei, { cidade: CIDADE.nome, dia: 12 });
  t("a pauta leva o veto enquanto dura", p.naoPode.length === 1 && p.naoPode[0].includes(`${cons.cidade.recompensa} moedas`) && procuradoParaPauta(lei, { cidade: CIDADE.nome, dia: 40 }).naoPode.length === 0);
  /* o golpe que virou morte */
  const morte = agravarParaMorte(lei, "Aldo Ferreira", mundo({ dia: 11 }));
  const em = procuradoEm(morte, CIDADE, 12);
  t("se a vítima cai, o crime vira matar: mais caro e mais longo, sem pagar duas vezes", em.gravidade === "matar" && em.recompensa === Math.round(GRAVIDADES.matar.recompensa * RECOMPENSA_POR_ESCALA[fichaDaCidade(CIDADE, { semente: SEM, mapa: MAPA, genero: G }).escala]) && em.ate === 11 + GRAVIDADES.matar.dias);
  t("outra vítima na mesma cidade soma a recompensa", registrarCrime(lei, cons, { ...c, vitima: "Mira" }, 11).porCidade[CIDADE.nome].recompensa === 2 * cons.cidade.recompensa);
  /* a guarda que vem: uma vez por dia, pela semente, com o combate de sempre */
  let vezes = 0, l2 = lei;
  for (let d = 10; d <= 22; d++) {
    const g = guardaQueVem(l2, mundo({ dia: d }));
    if (g) { l2 = g.lei; if (g.inimigos.length) vezes++; t.ultima = g; }
    t.repetida = guardaQueVem(l2, mundo({ dia: d }));
  }
  console.log(`      12 dias procurado numa ${CIDADE.porte}: a guarda veio ${vezes} vez(es)`);
  t("a guarda vem às vezes, e nunca duas no mesmo dia", vezes >= 1 && t.repetida === null);
  t("fora do prazo, não vem", guardaQueVem(lei, mundo({ dia: 40 })) === null);
  t("o envelope da guarda diz que o painel já está aberto e proíbe outro combate_iniciar", /JÁ ESTÁ ABERTO/.test(envelopeDaGuarda(t.ultima.inimigos.length ? t.ultima : { inimigos: [{ nome: "Guarda" }], quem: "a guarda" }, CIDADE)) && /NÃO envie "combate_iniciar"/.test(envelopeDaGuarda({ inimigos: [{ nome: "G" }] }, CIDADE)) && envelopeDaGuarda({ inimigos: [] }, CIDADE) === "");
  t("determinística", JSON.stringify(guardaQueVem(lei, mundo({ dia: 12 }))) === JSON.stringify(guardaQueVem(lei, mundo({ dia: 12 }))));
  const nenhum = registrarCrime(null, consequenciaDoCrime({ ...c, testemunhas: [] }, mundo({ cidade: ALDEIA || CIDADE, noite: true })), c, 10);
  t("crime sem olhos não põe ninguém procurado", ALDEIA ? Object.keys(nenhum.porCidade).length === 0 : true);
}

/* ============================================================ */
sec("6. o veredito antes do clique");
{
  const v = veredictoDoCrime(AGR, ctx(), mundo());
  console.log(`      ${v}`);
  t("diz que é crime, onde, quem vem, o preço e quem está vendo", /não é inimigo: atacar é um crime em/.test(v) && v.includes(CIDADE.nome) && /moedas pela sua cabeça/.test(v) && /Mira, Bram estão vendo/.test(v));
  t("contra o inimigo, não há veredito de crime", veredictoDoCrime(AGR, ctx({ npcs: { "Aldo Ferreira": criarNPC("Aldo Ferreira", { relacao: "inimigo" }) } }), mundo()) === "");
  if (ALDEIA) t("sem olhos, diz que ninguém está vendo — e que um dia se cobra", /ninguém está vendo/.test(veredictoDoCrime(AGR, ctx({ presentes: [{ nome: "Aldo Ferreira" }] }), mundo({ cidade: ALDEIA, noite: true }))));
}

/* ============================================================ */
sec("7. o save, o Códex e o teto da pauta");
{
  t("null e lixo dão a lei vazia, com versão", [null, undefined, "x", 3, {}].every((x) => JSON.stringify(garantirLei(x)) === JSON.stringify({ versao: LEI_VERSAO, porCidade: {} })));
  const sujo = garantirLei({ porCidade: { "": { desde: 1, ate: 2 }, __proto__x: {}, X: { desde: 5, ate: 3 }, Y: { desde: 1, ate: 9, recompensa: "40", gravidade: "inventada" } } });
  t("entradas tortas saem; a gravidade inventada vira ferir", JSON.stringify(Object.keys(sujo.porCidade)) === '["Y"]' && sujo.porCidade.Y.recompensa === 40 && sujo.porCidade.Y.gravidade === "ferir");
  const lei = registrarCrime(null, consequenciaDoCrime(lerCrime(AGR, ctx()), mundo()), lerCrime(AGR, ctx()), 10);
  t("ida e volta pelo JSON dá o mesmo", JSON.stringify(garantirLei(JSON.parse(JSON.stringify(lei)))) === JSON.stringify(lei));
  t("um save antigo, sem `lei`, joga igual: ninguém é procurado", procuradoEm(undefined, CIDADE, 10) === null && fatorDePreco(undefined, CIDADE, 10) === 1 && procuradoParaPauta(undefined, { cidade: CIDADE.nome, dia: 10 }).naoPode.length === 0);
  const r = registoSimulado("medio");
  const antes = JSON.stringify(r.npcs);
  const nome = Object.keys(r.npcs)[0];
  const cr = lerCrime({ tipo: "agressao", nome, papel: "x" }, { npcs: r.npcs, presentes: [{ nome }, { nome: Object.keys(r.npcs)[1] }] });
  consequenciaDoCrime(cr, { semente: "mm8|mundo|0", mapa: r.mapa, cidade: r.cidade, genero: G, noite: false });
  t("o registo não muda e o Códex conta o mesmo", JSON.stringify(r.npcs) === antes);
  /* o teto: as linhas são dinâmicas, e a pauta cheia continua no teto */
  const cons = consequenciaDoCrime(lerCrime(AGR, ctx()), mundo());
  let cheia = {};
  for (const s of SECOES) cheia = porNaPauta(cheia, s.id, `${s.id} linha ` + "x".repeat(110));
  const tx = textoDaPauta(porNaPauta(porNaPauta(cheia, "acabou", cons.linhas.acabou), "naoPode", cons.linhas.naoPode));
  t("a pauta cheia com o crime continua no teto, e o veto entra", tx.length <= TETO_DA_PAUTA && tx.includes(cons.linhas.naoPode[0]));
  t("nenhuma linha do crime passa de 220 caracteres", [...cons.linhas.acabou, ...cons.linhas.naoPode, ...procuradoParaPauta(lei, { cidade: CIDADE.nome, dia: 12 }).naoPode].every((l) => l.length <= 220));
}

/* ============================================================ */
sec("8. lixo");
{
  let erro = "";
  for (const x of [null, undefined, "x", 7, {}]) {
    try {
      lerCrime(x, x); consequenciaDoCrime(x, x); consequenciaDoCrime({ vitima: "A", testemunhas: [] }, x);
      registrarCrime(x, x, x, x); agravarParaMorte(x, x, x); procuradoEm(x, x, x); fatorDePreco(x, x, x); servicoRecusado(x, x, x, x);
      procuradoParaPauta(x, x); guardaQueVem(x, x); veredictoDoCrime(x, x, x); reacaoDoElenco(x, x, x, x);
    } catch (e) { erro = `${JSON.stringify(x)}: ${e.message}`; }
  }
  t("nenhum lixo derruba", !erro, erro);
}

/* A FIAÇÃO — o crime ligado ao App, por texto (fim de linha normalizado):
   o veredito antes do clique (o cartão com as duas escolhas, a forma do
   golpe final), o crime que registra a lei e faz o elenco reagir, a pauta,
   o save/load/sala, o mercado, o pouso recusado, a guarda que vem e o
   golpe que agrava para morte pelos dois caminhos (o declarado ao Mestre e
   o mecânico do fecho da luta). */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const corpo = (ancora, n = 12000) => { const i = app.indexOf(ancora); return i >= 0 ? app.slice(i, i + n) : ""; };

  sec("9. a fiação no App.jsx");
  t("o App importa o crime", /import \{[^}]*lerCrime[^}]*veredictoDoCrime[^}]*reacaoDoElenco[^}]*\} from "\.\/crime\.js"/.test(app));
  t("a lei mora no ref, junto do elenco (v9165+MM8e)", app.includes("const leiRef = useRef(garantirLei(null));"));
  t("o crime do turno e a marca do confirmado, em ref", app.includes("const crimeDoTurnoRef = useRef(null);") && app.includes("const crimeConfirmadoRef = useRef(false);"));
  t("o cartão pendente é estado (pinta a tela)", app.includes("const [crimeVereditoPendente, setCrimeVereditoPendente] = useState(null);"));
  t("o save leva a lei", app.includes("elenco: elencoSaveRef.current, lei: leiRef.current,"));
  t("a sala publica SEM a lei (o procurado é do herói, não do convidado)", app.includes('const { elenco: _elencoLocal, lei: _leiLocal, ...paraSala } = dados; publicarEstado(paraSala);'));
  t("o load lê a lei do save antigo (sem o campo, dá vazia)", app.includes("leiRef.current = garantirLei(sv.lei);"));
  t("campanha nova começa sem procurado", app.includes("elencoSaveRef.current = garantirElencoDoSave(null); leiRef.current = garantirLei(null); }"));

  const agressao = corpo("const declararAgressao = (acao) => {", 8000);
  t("(a) o veredito é pedido antes de abrir a luta, fora de combate", agressao.includes("veredictoDoCrime(a, crimeCtx, mundoCtx)") && agressao.includes("!jaConfirmado && !combateRef.current"));
  t("(a) com veredito, o cartão nasce e a luta NÃO abre neste turno", /if \(veredito\) \{\s*pushMsgs/.test(agressao) && agressao.includes("setCrimeVereditoPendente({"));
  t("(a) confirmar marca o ref e volta à mesma função; deixar não gasta turno", agressao.includes("crimeConfirmadoRef.current = true; declararAgressao(acao);") && agressao.includes("aoDeixar: () => { setCrimeVereditoPendente(null); pushMsgs("));
  t("(a) a confirmação não duplica a fala do jogador no log", agressao.includes("...(jaConfirmado ? [] : [{ autor: \"jogador\", texto: acao }]),"));
  t("(b) o crime em si: legítima defesa não conta (hostis vazio é quem já me atacou)", agressao.includes('lerCrime(a, { npcs: npcsRef.current, presentes: elenco.aqui || [], grupo: p.grupo || [], hostis: [], elenco: nomesDoElenco() })'));
  t("(b) crime conhecido registra a lei e o elenco reage", agressao.includes("leiRef.current = registrarCrime(leiRef.current, cons, crime, diaRef.current);") && agressao.includes("elencoSaveRef.current = reacaoDoElenco(elencoSaveRef.current, crime, cons, diaRef.current);") && agressao.includes("crimeDoTurnoRef.current = cons.linhas;"));
  /* O BUG ACHADO NO JOGO VIVO (frontend, MM10, 30/09): "ataco Ivo" → "atacar
     mesmo assim" abria a luta, mas `lei.porCidade` ficava vazio no save. A
     relação virava "inimigo" ANTES de `lerCrime` rodar, e `lerCrime` recusa
     quem já é inimigo declarado — a própria mutação apagava o crime que
     acabara de acontecer. A ordem é o contrato: `lerCrime(a, ...)` tem de
     vir ANTES de `relacao: "inimigo"` no texto da função. */
  t("(b) a ordem protege o crime: lerCrime roda ANTES de a vítima virar inimigo", agressao.indexOf("lerCrime(a, {") < agressao.indexOf('relacao: "inimigo"'));

  const cartao = corpo("if (crimeVereditoPendente) {", 1200);
  t("(a) o cartão tem as duas escolhas, na forma do golpe final (painel âmbar, Botao corpo/primário)", /border: `1px solid \$\{T\.amber\}`/.test(cartao) && /Botao corpo className="flex-1" onClick=\{crimeVereditoPendente\.aoDeixar\}>Deixar/.test(cartao) && /Botao corpo primario className="flex-1" onClick=\{crimeVereditoPendente\.aoConfirmar\}>Atacar mesmo assim/.test(cartao));
  t("(a) nunca com a soleira ao mesmo tempo (mesmo slot, um só)", /if \(crimeVereditoPendente\) \{[\s\S]*?return \(\s*<PeDaPagina>/.test(cartao));

  const pauta = corpo('p = porNaPauta(p, "acabou", (propositosDoTurnoRef.current || []).map((x) => x.envelope).join("\\n"));', 900);
  t("(c) o crime do turno vai à pauta uma vez, e some", pauta.includes("crimeDoTurnoRef.current.acabou || []") && pauta.includes("crimeDoTurnoRef.current = null;"));
  t("(c) o veto do procurado vai à pauta todo turno em que durar", pauta.includes('procuradoParaPauta(leiRef.current, { cidade: cidadeAtualRef.current, dia: diaRef.current }).naoPode'));

  t("(d) o golpe declarado ao Mestre agrava para morte", corpo("const registrarMorteDeAlvo = (nome, causa,", 800).includes("agravarParaMorte(leiRef.current, alvo,"));
  t("(d) o golpe mecânico do fecho da luta TAMBÉM agrava (não passa por registrarMorteDeAlvo)", app.includes("agravarParaMorte no fecho da luta"));

  t("(e) o preço do mercado sobe para quem é procurado", app.includes("precoDeCompraPara(personagem, it.preco) * aj * fatorDePreco(leiRef.current, cidadeMercado, diaRef.current)"));
  t("(f) o pouso recusa a estalagem a quem é procurado, com a mesma forma do abrigo hostil", /servicoRecusado\(leiRef\.current, cidadeAtualRef\.current, diaRef\.current, "pouso"\)/.test(app) && /sitio = \{ \.\.\.sitio, tipo: "hostil"/.test(app));
  t("(g) a guarda pode vir ao virar o dia, só com o herói de fato na cidade", /if \(!jornadaRef\.current && cidadeAtualRef\.current\) \{\s*const vinda = guardaQueVem\(leiRef\.current,/.test(app));
  t("(g) a luta da guarda abre pela porta única, e o envelope entra no turno do descanso", app.includes("envelopeDaGuarda(vinda, cidadeAtualRef.current)") && app.includes("${localMsg}${climaMsg}${reinoMsg}${guardaMsg}${sonhoMsg}${eventosMsg}"));
}

console.log(`\nMM10 · o crime: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
