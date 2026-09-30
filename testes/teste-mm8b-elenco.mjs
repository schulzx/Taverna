/* teste-mm8b-elenco.mjs (Fase MM · MM8b) — o elenco de 24, com laços e casas

   A prova de `src/elenco.js` e da resposta de família em
   `gente-por-dentro.js#genteParaPauta`. As perguntas de mesa (sonda da
   mesa, C1E1) que ela responde:
     #60 "o que dizem por aí da gente que mora nesta casa?"  → a casa
     #61 "um deles é bem-visto, os outros nem tanto?"          → cada um
     #62 "essa família é popular no resto da cidade?"          → a casa

   E as duas conversas obrigatórias: o elenco NÃO entra no registo (o
   Códex fica igual) e NÃO dá data de encontro a ninguém (o convite não
   muda). Tudo por semente. */
import {
  TAMANHO_DO_ELENCO, CIDADES_DO_ELENCO, FONTES_DO_ELENCO, ESTREIA_POR_FONTE, LACOS_DO_ELENCO,
  LACOS_POR_PESSOA, CASAS_POR_PORTE, MEMBROS_DA_CASA, REPUTACAO_DA_CASA, REPUTACAO_POR_TRACO, REPUTACOES,
  reputacaoDe, elencoDoMundo, lacosDe,
} from "../src/elenco.js";
import { genteParaPauta, fichaDaPessoa, IDADE_DE_PAI } from "../src/gente-por-dentro.js";
import { TIPOS_DE_LACO, criarNPC } from "../src/npcs.js";
import { TRACOS, indoleDe, pesarConvite } from "../src/indole.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { oQueExisteAqui, matar, garantirBase } from "../src/mundo-base.js";
import { paraPauta as geografoParaPauta } from "../src/geografo.js";
import { envelopeDoComercio } from "../src/comercio.js";
import { porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { CASOS } from "./sonda-da-mesa-casos.mjs";
import { registoSimulado, CENARIOS } from "./registo-simulado.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const G = "Fantasia medieval";
const pergunta = (n) => CASOS.find((c) => c.n === n).pergunta;

/* um mundo como o App o cria: o mapa, a espinha e as guildas da criação */
const mundo = (semente) => {
  const mapa = gerarGeografia(semente, "sobremundo");
  const espinha = estenderEspinha({ semente, mapa, genero: G, cidadeInicial: mapa.cidades[0].nome });
  const guildas = guildasDoMundo(semente, mapa, G);
  return { semente, mapa, espinha, guildas, el: elencoDoMundo(semente, mapa, { genero: G, espinha, guildas }) };
};
const MUNDOS = Array.from({ length: 20 }, (_, i) => mundo(`mm8b|mundo|${i}`));
const M = mundo("Sonda da Gente|Fantasia medieval");

/* ============================================================ */
sec("1. as tabelas");
{
  t("o elenco tem 24 lugares", TAMANHO_DO_ELENCO === 24);
  t("as fontes vêm na ordem do plano: espinha, chefe, mestre, do arco, recorrente", FONTES_DO_ELENCO.map((f) => f.id).join() === "espinha,chefe,mestre,doArco,recorrente");
  t("toda fonte tem teto e porquê", FONTES_DO_ELENCO.every((f) => f.teto > 0 && f.porque));
  t("toda fonte tem faixa de estreia coerente", FONTES_DO_ELENCO.every((f) => ESTREIA_POR_FONTE[f.id] && ESTREIA_POR_FONTE[f.id].de >= 1 && ESTREIA_POR_FONTE[f.id].de <= ESTREIA_POR_FONTE[f.id].ate));
  t("todo laço do elenco é um tipo que o registo conhece (TIPOS_DE_LACO)", LACOS_DO_ELENCO.every((l) => TIPOS_DE_LACO.some((x) => x.id === l.tipo) && l.peso > 0));
  t("a família não é sorteada: nasce das casas", !LACOS_DO_ELENCO.some((l) => l.tipo === "familia") && TIPOS_DE_LACO.some((x) => x.id === "familia"));
  t("amizade, rivalidade e amor são dos dois; dívida e aprendizado têm sentido", ["amizade", "rivalidade", "amor"].every((x) => LACOS_DO_ELENCO.find((l) => l.tipo === x).simetrico) && ["divida", "aprendizado"].every((x) => !LACOS_DO_ELENCO.find((l) => l.tipo === x).simetrico));
  t("cada pessoa tem de um a dois laços; a mesma cidade pesa mais", LACOS_POR_PESSOA.de >= 1 && LACOS_POR_PESSOA.ate >= LACOS_POR_PESSOA.de && LACOS_POR_PESSOA.mesmaCidade > 0.5);
  t("aldeia não tem casa notável; capital tem duas", CASAS_POR_PORTE.aldeia === 0 && CASAS_POR_PORTE.capital === 2);
  t("uma casa tem de 2 a 4 pessoas", MEMBROS_DA_CASA.de === 2 && MEMBROS_DA_CASA.ate === 4);
  t("as reputações de casa têm id único, o que se diz e se é popular", new Set(REPUTACAO_DA_CASA.map((r) => r.id)).size === REPUTACAO_DA_CASA.length && REPUTACAO_DA_CASA.every((r) => r.o && r.popular));
  const tracos = new Set(TRACOS.map((x) => x.id));
  t("a reputação de cada um lê traços que existem, e nenhum dos dois lados", [...REPUTACAO_POR_TRACO.bem, ...REPUTACAO_POR_TRACO.mal].every((x) => tracos.has(x)) && !REPUTACAO_POR_TRACO.bem.some((x) => REPUTACAO_POR_TRACO.mal.includes(x)));
  t("três reputações para cada um", Object.keys(REPUTACOES).join() === "bem,mal,nada");
  t("a idade de pai é a do adulto, não a do irmão mais velho", IDADE_DE_PAI >= 14);
}

/* ============================================================ */
sec("2. 24, sempre os mesmos");
{
  const doze = MUNDOS.filter((m) => m.mapa.cidades.length >= CIDADES_DO_ELENCO);
  t(`24 pessoas em todos os ${MUNDOS.length} mundos`, MUNDOS.every((m) => m.el.pessoas.length === TAMANHO_DO_ELENCO), MUNDOS.map((m) => m.el.pessoas.length).join(","));
  t("ninguém repetido", MUNDOS.every((m) => new Set(m.el.pessoas.map((p) => norm(p.nome))).size === m.el.pessoas.length));
  const outra = MUNDOS.map((m) => JSON.stringify(elencoDoMundo(m.semente, m.mapa, { genero: G, espinha: m.espinha, guildas: m.guildas })));
  t("a mesma semente dá o mesmo elenco, laços e casas", MUNDOS.every((m, i) => JSON.stringify(m.el) === outra[i]));
  t("cada fonte respeita o seu teto", MUNDOS.every((m) => FONTES_DO_ELENCO.every((f) => m.el.pessoas.filter((p) => p.fonte === f.id).length <= f.teto)));
  t("e a ordem: ninguém de uma fonte vem antes de outra anterior", MUNDOS.every((m) => {
    const idx = m.el.pessoas.map((p) => FONTES_DO_ELENCO.findIndex((f) => f.id === p.fonte));
    return idx.every((x, i) => i === 0 || x >= idx[i - 1]);
  }));
  const daEspinha = MUNDOS.reduce((a, m) => a + m.el.pessoas.filter((p) => p.fonte === "espinha").length, 0);
  const mestres = MUNDOS.reduce((a, m) => a + m.el.pessoas.filter((p) => p.fonte === "mestre").length, 0);
  console.log(`      em ${MUNDOS.length} mundos: ${daEspinha} da espinha, ${mestres} mestres de guilda`);
  t("a espinha e as guildas entram quando o App as passa", daEspinha > 0 && mestres > 0);
  const semNada = elencoDoMundo(M.semente, M.mapa, { genero: G });
  t("sem espinha nem guildas, essas fontes não entram — nada é inventado para as substituir", !semNada.pessoas.some((p) => p.fonte === "espinha" || p.fonte === "mestre") && semNada.pessoas.length === TAMANHO_DO_ELENCO);
  /* seis cidades, ou todas as que o mundo tem, se tiver menos */
  t("o elenco espalha-se pelo mundo (seis cidades, ou todas se houver menos)", MUNDOS.every((m) => new Set(m.el.pessoas.map((p) => p.cidade).filter(Boolean)).size >= Math.min(6, m.mapa.cidades.slice(0, CIDADES_DO_ELENCO).length)));
  /* uma cidade que o Narrador acrescenta vai para o FIM da lista */
  const m = doze[0];
  const maior = { ...m.mapa, cidades: [...m.mapa.cidades, { nome: "Cidade Que o Narrador Criou", porte: "capital", tipo: "capital", regiao: m.mapa.cidades[0].regiao }] };
  t("uma cidade nova no fim do mapa não troca o elenco", JSON.stringify(elencoDoMundo(m.semente, maior, { genero: G, espinha: m.espinha, guildas: m.guildas })) === JSON.stringify(m.el));
}

/* ============================================================ */
sec("3. ninguém morto ao nascer — e quem morre continua do elenco");
{
  t("no dia em que o mundo nasce, ninguém do elenco está morto", MUNDOS.every((m) => m.el.pessoas.every((p) => p.morto === false)));
  const alvo = M.el.pessoas[5];
  const base = matar(garantirBase(null), alvo.nome);
  const depois = elencoDoMundo(M.semente, M.mapa, { genero: G, espinha: M.espinha, guildas: M.guildas, base });
  t("quem morre fica marcado, no mesmo lugar", depois.pessoas[5].nome === alvo.nome && depois.pessoas[5].morto === true);
  t("e os outros 23 não mudam", depois.pessoas.every((p, i) => i === 5 || (p.nome === M.el.pessoas[i].nome && !p.morto)));
  t("nem as casas nem os laços", JSON.stringify(depois.casas) === JSON.stringify(M.el.casas) && JSON.stringify(depois.lacos) === JSON.stringify(M.el.lacos));
}

/* ============================================================ */
sec("4. as casas: família coerente");
{
  let semCidade = 0, repetidas = 0, apelido = 0, total = 0, foraDaCasa = 0, familiaTorta = 0;
  for (const m of MUNDOS) {
    const nomes = new Set();
    for (const k of m.el.casas) {
      total++;
      if (nomes.has(k.nome)) repetidas++;
      nomes.add(k.nome);
      const q = oQueExisteAqui(m.semente, m.mapa, k.cidade, null, G);
      if (!k.membros.every((n) => q.gente.some((p) => p.nome === n))) semCidade++;
      /* o nome da casa é o sobrenome de quem a encabeça, quando ele tem um */
      /* quando o sobrenome da cabeça está livre no mundo; se outra casa já o
         tem, a segunda vai buscar outro ao banco — nome de casa não se repete */
      const sob = k.membros[0].split(/\s+/).slice(1).join(" ").replace(/^(o|a)\s+/i, "");
      const jaUsado = m.el.casas.slice(0, m.el.casas.indexOf(k)).some((x) => x.nome.endsWith(sob));
      if (sob && !jaUsado && !k.nome.endsWith(sob)) apelido++;
      if (k.membros.length < MEMBROS_DA_CASA.de || k.membros.length > MEMBROS_DA_CASA.ate) foraDaCasa++;
    }
    /* quem do elenco é da casa tem o nome da casa na ficha, e família com os outros dela */
    for (const k of m.el.casas) {
      const dela = m.el.pessoas.filter((p) => p.casa === k.nome);
      for (let i = 0; i < dela.length; i++) for (let j = i + 1; j < dela.length; j++) {
        if (!lacosDe(m.el, dela[i].nome).some((l) => l.com === dela[j].nome && l.tipo === "familia")) familiaTorta++;
      }
    }
  }
  console.log(`      ${total} casas em ${MUNDOS.length} mundos`);
  t("toda casa é gente da própria cidade", semCidade === 0, String(semCidade));
  t("nenhuma casa repete o nome no mesmo mundo", repetidas === 0, String(repetidas));
  t("a casa leva o sobrenome de quem a encabeça (o mesmo apelido de casa)", apelido === 0, String(apelido));
  t("toda casa tem de 2 a 4 pessoas", foraDaCasa === 0, String(foraDaCasa));
  t("quem é da mesma casa e do elenco tem laço de família, dos dois lados", familiaTorta === 0, String(familiaTorta));
  t("toda cidade grande tem casa; aldeia não tem", MUNDOS.every((m) => m.mapa.cidades.slice(0, CIDADES_DO_ELENCO).every((c) => {
    const n = m.el.casas.filter((k) => k.cidade === c.nome).length;
    return (c.porte === "aldeia" ? n === 0 : n >= 1);
  })));
  t("toda casa tem uma reputação da tabela", MUNDOS.every((m) => m.el.casas.every((k) => REPUTACAO_DA_CASA.some((r) => r.id === k.reputacao))));
  t("e uma sede (a casa de trabalho de quem a encabeça)", MUNDOS.every((m) => m.el.casas.every((k) => k.sede)));
}

/* ============================================================ */
sec("5. os laços");
{
  let proprio = 0, dobrado = 0, tipoErrado = 0, simetriaErrada = 0, n = 0;
  for (const m of MUNDOS) {
    const pares = new Set();
    for (const l of m.el.lacos) {
      n++;
      if (norm(l.a) === norm(l.b)) proprio++;
      const par = [norm(l.a), norm(l.b)].sort().join("|");
      if (pares.has(par)) dobrado++;
      pares.add(par);
      if (!TIPOS_DE_LACO.some((x) => x.id === l.tipo)) tipoErrado++;
      const tab = LACOS_DO_ELENCO.find((x) => x.tipo === l.tipo);
      if (tab ? tab.simetrico !== l.simetrico : !(l.tipo === "familia" && l.simetrico)) simetriaErrada++;
    }
  }
  console.log(`      ${n} laços em ${MUNDOS.length} mundos`);
  t("ninguém tem laço consigo", proprio === 0);
  t("cada par tem um laço só", dobrado === 0, String(dobrado));
  t("todo laço é de um tipo do registo", tipoErrado === 0);
  t("a simetria é a da tabela (família é dos dois)", simetriaErrada === 0);
  t("todo laço liga gente do elenco", MUNDOS.every((m) => m.el.lacos.every((l) => m.el.pessoas.some((p) => p.nome === l.a) && m.el.pessoas.some((p) => p.nome === l.b))));
  t("toda pessoa do elenco tem ao menos um laço", MUNDOS.every((m) => m.el.pessoas.every((p) => lacosDe(m.el, p.nome).length >= 1)));
  const sim = M.el.lacos.find((l) => l.simetrico && l.tipo !== "familia");
  const dir = M.el.lacos.find((l) => !l.simetrico);
  t("o laço dos dois lê-se dos dois lados", sim && lacosDe(M.el, sim.a).some((x) => x.com === sim.b && x.sentido === "dos dois") && lacosDe(M.el, sim.b).some((x) => x.com === sim.a && x.sentido === "dos dois"));
  t("o laço com sentido diz de quem é", dir && lacosDe(M.el, dir.a).some((x) => x.com === dir.b && x.sentido === "meu") && lacosDe(M.el, dir.b).some((x) => x.com === dir.a && x.sentido === "dele"));
}

/* ============================================================ */
sec("6. a estreia");
{
  const todos = MUNDOS.flatMap((m) => m.el.pessoas);
  t("nem todos estão no primeiro dia", todos.some((p) => p.estreia > 1));
  t("mas há gente no primeiro dia", MUNDOS.every((m) => m.el.pessoas.some((p) => p.estreia === 1)));
  t("a estreia fica na faixa da fonte", todos.every((p) => p.estreia >= ESTREIA_POR_FONTE[p.fonte].de && p.estreia <= ESTREIA_POR_FONTE[p.fonte].ate));
  t("o chefe nunca estreia no primeiro dia", todos.filter((p) => p.fonte === "chefe").every((p) => p.estreia >= ESTREIA_POR_FONTE.chefe.de && ESTREIA_POR_FONTE.chefe.de > 1));
}

/* ============================================================ */
sec("7. as três perguntas da família");
{
  const k = M.el.casas.find((x) => x.membros.length >= 3) || M.el.casas[0];
  const cena = (frase, extra = {}) => ({ semente: M.semente, mapa: M.mapa, cidade: k.cidade, genero: G, espinha: M.espinha, guildas: M.guildas, lugar: { nome: k.sede }, presentes: [], recentes: [], dia: 5, minuto: 600, frase, ...extra });
  const l = (n, extra) => genteParaPauta(cena(pergunta(n), extra)).pergunta;
  for (const n of [60, 61, 62]) console.log(`      #${n} ${pergunta(n)}\n         → ${l(n)[0] || "(nada)"}`);
  const rep = REPUTACAO_DA_CASA.find((r) => r.id === k.reputacao);
  t("#60 diz o que a cidade diz da casa de onde estou", l(60).length === 1 && l(60)[0].startsWith(k.nome) && l(60)[0].includes(rep.o));
  t("#62 diz se a família é popular no resto da cidade", l(62).length === 1 && l(62)[0].includes(`popular? ${rep.popular}`));
  t("#61 diz de cada um se é bem ou mal visto", l(61).length === 1 && l(61)[0].startsWith(k.nome) && k.membros.slice(0, 4).every((m) => l(61)[0].includes(m.split(/\s+/)[0])));
  /* a família da resposta concorda com o retrato: a cabeça é quem aparenta mais anos, e filho é quem tem 16 a menos */
  const linha = l(61)[0];
  const fichas = k.membros.slice(0, 4).map((m) => fichaDaPessoa(M.semente, AQUI(k).find((p) => p.nome === m) || { nome: m }, cena("")));
  const velho = [...fichas].sort((a, b) => b.aparencia.idade.anos - a.aparencia.idade.anos)[0];
  t("a cabeça da casa é quem o retrato mostra mais velho", new RegExp(`${velho.nome.split(/\s+/)[0]}[^;]*\\(cabeça\\)`).test(linha) || linha.includes(`${velho.nome} (cabeça)`), linha);
  const papelDe = (f) => ((linha.match(new RegExp(`${f.nome.split(/\s+/)[0]}[^(]*\\(([^,)]+)`)) || [])[1] || "");
  const tortos = fichas.filter((f) => f !== velho && /^filh/.test(papelDe(f)) && velho.aparencia.idade.anos - f.aparencia.idade.anos < IDADE_DE_PAI);
  const irmaosTortos = fichas.filter((f) => f !== velho && /^irm/.test(papelDe(f)) && velho.aparencia.idade.anos - f.aparencia.idade.anos >= IDADE_DE_PAI);
  t("e irmão é quem aparenta menos de 16 anos de diferença", irmaosTortos.length === 0);
  t("e só é filho quem aparenta 16 anos a menos que a cabeça", tortos.length === 0);
  /* nomeando um da casa, a resposta é a casa dele, em qualquer lugar */
  const r = genteParaPauta(cena(`E a família de ${k.membros[1]}, é popular?`, { lugar: null })).pergunta[0] || "";
  t("nomeando alguém da casa, a resposta é a casa dele", r.startsWith(k.nome), r);
  /* uma pessoa sem casa: a reputação dela */
  const semCasa = M.el.pessoas.find((p) => !p.casa && p.cidade === k.cidade) || M.el.pessoas.find((p) => !p.casa);
  const rs = genteParaPauta(cena(`${semCasa.nome} é bem-visto por aqui?`, { cidade: semCasa.cidade, lugar: null })).pergunta[0] || "";
  t("de uma pessoa só, a reputação dela", rs.startsWith(semCasa.nome) && rs.includes(reputacaoDe(M.semente, semCasa).o), rs);
  t("sem casa à vista nem nome, não sobe nada", genteParaPauta(cena(pergunta(61), { cidade: "Lugar Nenhum", lugar: null })).pergunta.length === 0);
  t("sem pergunta, custo zero", genteParaPauta(cena("Pego a caneca e bebo.")).pergunta.length === 0);

  /* A TAVERNA CHEIA: a maior linha de família dos vinte mundos entra na
     mesma cena de teste-mm8a-ficha e de teste-mm12-cidade */
  let maior = "";
  for (const m of MUNDOS) for (const c of m.el.casas) {
    const e = { semente: m.semente, mapa: m.mapa, cidade: c.cidade, genero: G, espinha: m.espinha, guildas: m.guildas, lugar: { nome: c.sede }, presentes: [], recentes: [] };
    for (const n of [60, 61]) { const x = genteParaPauta({ ...e, frase: pergunta(n) }).pergunta[0] || ""; if (x.length > maior.length) maior = x; }
  }
  const cidade = M.mapa.cidades.find((c) => c.porte === "cidade") || M.mapa.cidades[1];
  const g = geografoParaPauta({ espaco: { dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6, porte: "cidade" }, cidadeAtual: cidade.nome, mapa: M.mapa, semente: M.semente });
  let p = porNaPauta({}, "onde", g.onde);
  p = porNaPauta(p, "onde", envelopeDoComercio(cidade, 40));
  p = porNaPauta(p, "naoPode", g.naoPode);
  p = porNaPauta(p, "daqui", g.daqui);
  p = porNaPauta(p, "quem", "Aldo Ferreira, o taverneiro, atrás do balcão; Mira Vasconcelos, serviçal, entre as mesas");
  p = porNaPauta(p, "momento", "a chegada: o herói acaba de pisar numa cidade que não conhece, e alguém ali já sabe o nome dele");
  p = porNaPauta(p, "gente", "Aldo Ferreira limpa o mesmo copo há tempo demais", "Mira serve a mesa do canto", "um caravaneiro bêbado canta alto demais");
  p = porNaPauta(p, "fala", "Aldo Ferreira disse: \"Forasteiro? Paga adiantado.\"");
  const tx = textoDaPauta(porNaPauta(p, "pergunta", maior));
  console.log(`      a maior linha de família: ${maior.length} caracteres · a taverna cheia com ela: ${tx.length}/${TETO_DA_PAUTA}`);
  t("a maior linha de família dos vinte mundos entra na taverna cheia", tx.includes(maior) && tx.length <= TETO_DA_PAUTA);
  let maior157 = 0;
  for (const c of CASOS) for (const x of genteParaPauta(cena(c.pergunta)).pergunta) maior157 = Math.max(maior157, x.length);
  t(`e nenhuma resposta às 157 perguntas passa de 200 caracteres (${maior157})`, maior157 <= 200);
}
function AQUI(k) { return oQueExisteAqui(M.semente, M.mapa, k.cidade, null, G).gente; }

/* ============================================================ */
sec("8. o Códex não muda, e o convite também não");
{
  for (const c of CENARIOS) {
    const r = registoSimulado(c);
    const antes = JSON.stringify(r.npcs);
    const nAntes = Object.keys(r.npcs).length;
    const e = elencoDoMundo("mm8|mundo|0", r.mapa, { genero: G });
    for (const n of [60, 61, 62, 18, 106]) genteParaPauta({ semente: "mm8|mundo|0", mapa: r.mapa, cidade: r.cidade.nome, genero: G, npcs: r.npcs, frase: pergunta(n) });
    console.log(`      ${c.id}: Códex ${nAntes} antes · ${Object.keys(r.npcs).length} depois · elenco ${e.pessoas.length}, fora do registo`);
    t(`${c.id}: o Códex tem o mesmo número depois de o elenco nascer e responder`, Object.keys(r.npcs).length === nAntes && JSON.stringify(r.npcs) === antes);
  }
  t("ninguém do elenco nasce com data de encontro nem marca de registo", MUNDOS.every((m) => m.el.pessoas.every((p) => !("conhecidoEm" in p) && !("ultimaVez" in p))));
  /* o convite pesa a índole, e a índole é a da pessoa, não a do elenco */
  const p = M.el.pessoas.find((x) => x.fonte === "doArco") || M.el.pessoas[0];
  const ficha = criarNPC(p.nome, { papel: p.papel, conhecidoEm: 9 });
  const convivio = { dias: 12 - ficha.conhecidoEm };
  const v1 = pesarConvite(indoleDe(M.semente, ficha), { convivio, fama: 20 });
  const v2 = pesarConvite(indoleDe(M.semente, { nome: p.nome }), { convivio, fama: 20 });
  t("o convite de quem é do elenco é o mesmo de antes (a índole é pelo nome)", JSON.stringify(v1) === JSON.stringify(v2));
  t("e a data do encontro é a do encontro (a ficha tem o dia em que se conheceram)", ficha.conhecidoEm === 9);
}

/* ============================================================ */
sec("9. lixo, null e imutabilidade");
{
  let erro = "";
  const mapas = [null, undefined, {}, "x", 7, { cidades: null }, { cidades: [null, 3, { nome: "" }, { nome: "X" }] }, { cidades: [{ nome: "Y", porte: "inventado" }], regioes: "r" }];
  const ctxs = [undefined, null, {}, { espinha: "x", guildas: 5, base: "b", lex: 3, molde: "nenhum" }, { espinha: { atos: [null, { marcos: [null, { quem: 3, alvo: {} }] }] }, guildas: [null, { mestre: "" }, { mestre: "Zé" }] }];
  for (const m of mapas) for (const c of ctxs) {
    try { const e = elencoDoMundo("s", m, c); if (!Array.isArray(e.pessoas) || !Array.isArray(e.casas) || !Array.isArray(e.lacos)) erro = "forma"; lacosDe(e, "X"); } catch (x) { erro = `${JSON.stringify(m)}/${JSON.stringify(c)}: ${x.message}`; }
  }
  try { elencoDoMundo(null, null, null); lacosDe(null, null); reputacaoDe(null, null); reputacaoDe("s", { nome: 5 }); } catch (x) { erro = x.message; }
  t("nenhum lixo derruba o elenco", !erro, erro);
  t("sem mundo, elenco vazio", JSON.stringify(elencoDoMundo("s", null)) === JSON.stringify({ pessoas: [], lacos: [], casas: [] }));
  let erroP = "";
  for (const c of [{ frase: pergunta(60), espinha: "x", guildas: 7 }, { frase: pergunta(61), mapa: "x", cidade: 3 }, { frase: pergunta(62), mapa: { cidades: [null] }, cidade: "X", lugar: 5 }]) {
    try { const r = genteParaPauta(c); if (!Array.isArray(r.pergunta)) erroP = "forma"; } catch (x) { erroP = x.message; }
  }
  t("nenhum lixo derruba a resposta de família", !erroP, erroP);
  const congela = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congela(v); } return o; };
  const mapa = congela(JSON.parse(JSON.stringify(M.mapa)));
  const espinha = congela(JSON.parse(JSON.stringify(M.espinha)));
  const guildas = congela(JSON.parse(JSON.stringify(M.guildas)));
  let mudou = "";
  try { elencoDoMundo(M.semente, mapa, { genero: G, espinha, guildas }); genteParaPauta({ semente: M.semente, mapa, espinha, guildas, cidade: M.el.casas[0].cidade, frase: pergunta(61), lugar: { nome: M.el.casas[0].sede } }); } catch (x) { mudou = x.message; }
  t("o mapa, a espinha e as guildas recebidos não são tocados", !mudou, mudou);
}

/* A FIAÇÃO — pautaDoTurno passa a espinha e as guildas a genteParaPauta,
   para o elenco ter a gente da espinha e os mestres de guilda. Corpo por
   âncora; fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const i = app.indexOf("const gp = genteParaPauta({");
  const chamada = i >= 0 ? app.slice(i, app.indexOf("});", i)) : "";
  t("pautaDoTurno passa a espinha e as guildas ao elenco", chamada.includes("espinha: espinhaRef.current") && chamada.includes("guildas: guildasRef.current"), chamada.slice(0, 200));
}

console.log(`\nMM8b · o elenco: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
