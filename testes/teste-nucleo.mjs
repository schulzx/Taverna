/* teste-nucleo.mjs — o núcleo da campanha (Fase MM-C, C1)

   A prova de `src/nucleo.js`: as quatro a seis pessoas que o sistema
   conhece por dentro, escolhidas do que já existe, com a ficha de seis
   campos e a teia entre elas. A especificação é `mente/coracao-c1-c2.md`
   §1, e as catracas são as do §7.

   O que esta suíte tranca:
     1. as tabelas, inteiras e coerentes com o resto da casa (os traços da
        índole, os propósitos, os laços do registo, as formas de semente,
        os antecedentes, as ligações do companheiro);
     2. o determinismo: a mesma semente dá o mesmo núcleo;
     3. quem entra: 4 a 6 pessoas, ninguém de fora do elenco, do grupo ou
        do fio, um papel por pessoa;
     4. as quatro regras anti-genérico: categorias que não repetem, a
        índole que filtra, a teia que liga todos (o vilão também), o elo
        que carrega um pedaço do herói;
     5. o elo para cada antecedente, com o gémeo do item do herói;
     6. as decisões da etapa: o companheiro e o elo da mesma ligação, e as
        revelações que nunca caem no mesmo ato;
     7. a linha QUEM É: ≤ 130, frase fechada, nunca o segredo, nem palavra
        de bastidor, e a pauta que não perde veto nem desfecho por ela;
     8. o campo `coracao` do save, o lixo e a imutabilidade.

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import {
  PAPEIS_DO_NUCLEO, NUCLEO, QUER, QUER_DO_PROPOSITO, TEME, ESCONDE, ESCONDE_POR_PAPEL, ESCONDE_DA_MASCARA, CARREGA, LINHA, COMO_FALA,
  TIQUES_PROIBIDOS, TEIA_DO_NUCLEO, ELO_DO_ANTECEDENTE, PISTAS_DO_ELO, COMPANHEIRO_POR_LIGACAO, FERIDA_DO_VILAO, VILAO_POR_TAMANHO,
  ATO_DA_REVELACAO, QUEM_E, CORACAO_DO_SAVE, FOGUEIRA_CONTA, GENERO_NA_FICHA,
  nucleoDaCampanha, revelacaoPermitida, linhaQuemE, quemEParaPauta, garantirCoracaoDoSave, fichaNaVoz, generoDaPessoa, noGenero,
} from "../src/nucleo.js";
import { sexoDoNome } from "../src/nomes.js";
import { TRACOS, PROPOSITOS, indoleDe } from "../src/indole.js";
import { TIPOS_DE_LACO } from "../src/npcs.js";
import { FORMAS_DE_SEMENTE } from "../src/promessas.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { LIGACOES_AO_PASSADO, companheiroInicial } from "../src/companheiro-inicial.js";
import { REVIRAVOLTA_DO_ATO0, EM_JOGO } from "../src/batidas.js";
import { abrirAbertura } from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { MOLDES } from "../src/moldes.js";
import { guildasDoMundo } from "../src/guildas.js";
import { elencoDoMundo } from "../src/elenco.js";
import { SECOES, SECOES_QUE_CEDEM, TETO_DA_PAUTA, porNaPauta, textoDaPauta, secaoPorId, cederNaCena } from "../src/pauta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };
const unicos = (l) => new Set(l).size === l.length;

/* ---------------- os mundos ---------------- */
const G = "Fantasia medieval";
const ANTS = ["", ...ANTECEDENTES.map((a) => a.id)];
const MUNDOS = [];
const N_MUNDOS = 120;
for (let i = 0; i < N_MUNDOS; i++) {
  const M = MOLDES[i % MOLDES.length];
  const semente = `Sonda Nucleo|${i}`;
  const mapa = gerarGeografia(semente, M);
  const cidade = mapa.cidades[0].nome;
  const guildas = guildasDoMundo(semente, mapa, G, null);
  const antecedente = ANTS[i % ANTS.length];
  const espinha = estenderEspinha({ semente, mapa, genero: G, molde: M, estrutura: "jornada", cidadeInicial: cidade, antecedente, dia: 1 });
  const ab = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente, genero: G, molde: M, nivel: 1, dia: 1 });
  const ci = ab && ab.abertura ? companheiroInicial({ semente, mapa, genero: G, molde: M, espinha, guildas, cidade, antecedente, heroi: { nome: "Brann", nivel: 1, classe: "Guerreiro" }, abertura: ab.abertura }) : null;
  const ctx = { genero: G, molde: M, espinha, guildas, antecedente, grupo: ci ? [ci.comp] : [] };
  MUNDOS.push({ semente, mapa, ctx, ci, espinha, nucleo: nucleoDaCampanha(semente, mapa, ctx) });
}
const W0 = MUNDOS[1];

/* ============================================================ */
sec("1. as tabelas");
{
  const tracos = new Set(TRACOS.map((x) => x.id));
  const brigaOk = (l) => l.every((x) => Array.isArray(x.briga) ? x.briga.every((b) => tracos.has(b)) : true);
  t("PAPEIS_DO_NUCLEO: seis papéis, na ordem 1..6", PAPEIS_DO_NUCLEO.length === 6 && PAPEIS_DO_NUCLEO.every((p, i) => p.ordem === i + 1));
  t("NUCLEO: no mínimo 4, no máximo 6", NUCLEO.min === 4 && NUCLEO.max === 6);
  t("QUER: 20 entradas, 5 categorias, 4 por categoria", QUER.length === 20 && new Set(QUER.map((q) => q.cat)).size === 5 && [...new Set(QUER.map((q) => q.cat))].every((c) => QUER.filter((q) => q.cat === c).length === 4));
  t("TEME: 18 entradas, com sinal e o que acorda", TEME.length === 18 && TEME.every((x) => x.sinal && x.acorda && x.cat));
  t("o sinal nunca diz a palavra medo", TEME.every((x) => !/medo/i.test(x.sinal)));
  t("ESCONDE: 20 segredos, 4 gravidades, duas pistas cada", ESCONDE.length === 20 && new Set(ESCONDE.map((e) => e.grav)).size === 4 && ESCONDE.every((e) => e.pistas.length === 2));
  const cats = new Set(FORMAS_DE_SEMENTE.map((f) => f.categoria));
  const formas = new Set(FORMAS_DE_SEMENTE.map((f) => f.id));
  t("as pistas são das categorias do Livro de Promessas", ESCONDE.every((e) => e.pistas.every((p) => cats.has(p.forma))));
  t("a semente que a pista cita existe no Livro", ESCONDE.every((e) => e.pistas.every((p) => !p.semente || formas.has(p.semente))));
  t("o segredo da lealdade é sempre de sombra (o vilão nunca o tem)", ESCONDE.filter((e) => e.grav === "lealdade").every((e) => e.sombra));
  t("CARREGA: 16 objetos, 10 dívidas, 10 culpas", CARREGA.objeto.length === 16 && CARREGA.divida.length === 10 && CARREGA.culpa.length === 10);
  t("LINHA: 15, e o verbo é do vocabulário da índole", LINHA.length === 15 && LINHA.every((l) => l.nunca === "" || l.nunca === "mentir" || TRACOS.some((x) => x.nunca.includes(l.nunca) || x.puxa.includes(l.nunca))));
  t("COMO_FALA: 22 tiques, cada exemplo ≤ 50 caracteres", COMO_FALA.length === 22 && COMO_FALA.every((f) => f.exemplo && f.exemplo.length <= 50), COMO_FALA.filter((f) => f.exemplo.length > 50).map((f) => f.id).join(","));
  t("nenhum tique é um dos proibidos (nem de cheiro)", COMO_FALA.every((f) => !TIQUES_PROIBIDOS.some((p) => norm(f.o + " " + f.exemplo).includes(norm(p)))));
  t("os ids não repetem em nenhuma tabela", [QUER, TEME, ESCONDE, LINHA, COMO_FALA, TEIA_DO_NUCLEO, FERIDA_DO_VILAO, Object.values(CARREGA).flat()].every((l) => unicos(l.map((x) => x.id))));
  t("todo `briga` é um traço que existe", [QUER, TEME, ESCONDE, LINHA, COMO_FALA].every(brigaOk));
  t("QUER_DO_PROPOSITO: propósitos que existem, para quer que existe", Object.entries(QUER_DO_PROPOSITO).every(([k, v]) => PROPOSITOS.some((p) => p.id === k) && QUER.some((q) => q.id === v)));
  t("TEIA: 10 fios, o laço é do registo (ou nenhum), e só um forçado", TEIA_DO_NUCLEO.length === 10 && TEIA_DO_NUCLEO.every((x) => x.laco === "" || TIPOS_DE_LACO.some((l) => l.id === x.laco)) && TEIA_DO_NUCLEO.filter((x) => x.forcada).map((x) => x.id).join() === "t_morto_vivo");
  t("ELO: um por antecedente, e o `sem`", Object.keys(ELO_DO_ANTECEDENTE).sort().join() === [...ANTECEDENTES.map((a) => a.id), "sem"].sort().join());
  t("o quer do elo aponta uma entrada de QUER", Object.values(ELO_DO_ANTECEDENTE).every((e) => QUER.some((q) => q.id === e.quer)));
  t("o gémeo existe exatamente quando o antecedente dá item", ANTECEDENTES.every((a) => !!ELO_DO_ANTECEDENTE[a.id].gemeo === !!a.item) && !ELO_DO_ANTECEDENTE.sem.gemeo);
  t("a ligação do elo é uma ligação do companheiro (ou nenhuma)", Object.values(ELO_DO_ANTECEDENTE).every((e) => e.ligacao === "" || LIGACOES_AO_PASSADO.some((l) => l.id === e.ligacao)));
  t("PISTAS_DO_ELO: 13 × 2", Object.keys(PISTAS_DO_ELO).length === 13 && Object.values(PISTAS_DO_ELO).every((p) => p.length === 2) && Object.keys(PISTAS_DO_ELO).every((k) => ELO_DO_ANTECEDENTE[k]));
  t("toda reviravolta do ato 0 tem um elo que a diga", Object.keys(REVIRAVOLTA_DO_ATO0).every((k) => ELO_DO_ANTECEDENTE[k]));
  const todosIds = new Set([...QUER, ...TEME, ...ESCONDE, ...Object.values(CARREGA).flat()].map((x) => x.id));
  t("COMPANHEIRO_POR_LIGACAO: as cinco ligações, e só ids que existem", Object.keys(COMPANHEIRO_POR_LIGACAO).sort().join() === LIGACOES_AO_PASSADO.map((l) => l.id).sort().join()
    && Object.values(COMPANHEIRO_POR_LIGACAO).every((o) => Object.values(o).flat().every((id) => todosIds.has(id))));
  t("FERIDA_DO_VILAO: 8, nenhuma de lealdade, e as que obrigam fio apontam a TEIA", FERIDA_DO_VILAO.length === 8 && FERIDA_DO_VILAO.every((w) => !w.teia || TEIA_DO_NUCLEO.some((x) => x.id === w.teia.id)));
  const masc = ESCONDE.find((e) => e.id === ESCONDE_DA_MASCARA);
  t("o segredo da máscara é de lealdade e de sombra", !!masc && masc.grav === "lealdade" && masc.sombra);
  t("a voz e a porta: vergonha ou identidade", ["voz", "porta"].every((p) => ESCONDE_POR_PAPEL[p].join() === "vergonha,identidade"));
  t("o vilão revela-se em três tamanhos, e o segredo só no fim", Object.keys(VILAO_POR_TAMANHO).join() === "inicio,meio,fim" && !VILAO_POR_TAMANHO.inicio.includes("esconde") && !VILAO_POR_TAMANHO.meio.includes("esconde") && VILAO_POR_TAMANHO.fim.includes("esconde"));
  t("o elo revela no ato 0; a máscara nunca antes do 1", ATO_DA_REVELACAO.elo === 0 && ATO_DA_REVELACAO.mascara >= 1);
  t("QUEM_E: 130 caracteres, de seis em seis turnos", QUEM_E.max === 130 && QUEM_E.intervalo === 6 && QUEM_E.cenasComExemplo === 2);
}

/* ============================================================ */
sec("2. o determinismo");
{
  const a = JSON.stringify(nucleoDaCampanha(W0.semente, W0.mapa, W0.ctx));
  const b = JSON.stringify(nucleoDaCampanha(W0.semente, W0.mapa, { ...W0.ctx }));
  t("a mesma semente dá o mesmo núcleo, as mesmas fichas e a mesma teia", a === b && a === JSON.stringify(W0.nucleo));
  const outra = JSON.stringify(nucleoDaCampanha(W0.semente + "!", W0.mapa, W0.ctx));
  t("outra semente, outro núcleo", outra !== a);
  /* o elenco já derivado entra sem mudar nada (o App pode poupar a conta) */
  const el = elencoDoMundo(W0.semente, W0.mapa, { genero: G, molde: W0.ctx.molde, espinha: W0.espinha, guildas: W0.ctx.guildas });
  t("com o elenco já derivado, o mesmo núcleo", JSON.stringify(nucleoDaCampanha(W0.semente, W0.mapa, { ...W0.ctx, elenco: el })) === a);
}

/* ============================================================ */
sec(`3. quem entra (${N_MUNDOS} mundos)`);
{
  const tam = MUNDOS.map((w) => w.nucleo.pessoas.length);
  t(`4 a 6 pessoas em todos (${Math.min(...tam)}–${Math.max(...tam)})`, tam.every((n) => n >= NUCLEO.min && n <= NUCLEO.max));
  let fora = [];
  for (const w of MUNDOS) {
    const el = elencoDoMundo(w.semente, w.mapa, { genero: G, molde: w.ctx.molde, espinha: w.espinha, guildas: w.ctx.guildas });
    const marcos = w.espinha.atos.flatMap((a) => a.marcos);
    const conhecidos = new Set([...el.pessoas.map((p) => p.nome), ...w.ctx.grupo.map((g) => g.nome), (w.espinha.fio || {}).antagonista, ...marcos.map((m) => m.quem), ...marcos.map((m) => (m.relogio || {}).gente)].filter(Boolean).map(norm));
    fora = fora.concat(w.nucleo.pessoas.filter((p) => !conhecidos.has(norm(p.nome))).map((p) => p.nome));
  }
  t("ninguém de fora do elenco, do grupo ou do fio", fora.length === 0, fora.slice(0, 5).join(", "));
  t("um papel por pessoa, e um papel de cada", MUNDOS.every((w) => unicos(w.nucleo.pessoas.map((p) => norm(p.nome))) && unicos(w.nucleo.pessoas.map((p) => p.papel))));
  t("vilão e elo em todos (obrigatórios)", MUNDOS.every((w) => ["vilao", "elo"].every((r) => w.nucleo.pessoas.some((p) => p.papel === r))));
  /* a voz falta só quando todo `procurar` dos atos 0 e 1 já é de alguém do
     núcleo (o vilão que a espinha manda procurar pelo nome curto, por
     exemplo): um papel por pessoa, e a seguinte procura-se — nunca se inventa */
  const curto = (n) => norm(String(n).split(",")[0]);
  t("a voz em todos os que têm um procurar livre nos atos 0 e 1", MUNDOS.every((w) => {
    const livres = w.espinha.atos.slice(0, 2).flatMap((a) => a.marcos).filter((m) => m.feitio === "procurar" && m.quem && !w.nucleo.pessoas.some((p) => p.papel !== "voz" && (norm(p.nome) === norm(m.quem) || curto(p.nome) === norm(m.quem))));
    return !livres.length || w.nucleo.pessoas.some((p) => p.papel === "voz");
  }));
  t("a voz é a primeira batida procurar do ato 0 quando ninguém a ocupa", MUNDOS.every((w) => {
    const m = w.espinha.atos[0].marcos.find((x) => x.feitio === "procurar" && x.quem && x.batida);
    const v = w.nucleo.pessoas.find((p) => p.papel === "voz");
    return !m || !v || w.nucleo.pessoas.some((p) => p !== v && (norm(p.nome) === norm(m.quem) || curto(p.nome) === norm(m.quem) || norm(p.nome).split(" ")[0] === norm(m.quem).split(" ")[0])) || norm(v.nome) === norm(m.quem);
  }));
  t("o companheiro é o do grupo, e vem primeiro", MUNDOS.filter((w) => w.ci).every((w) => w.nucleo.pessoas[0].papel === "companheiro" && w.nucleo.pessoas[0].nome === w.ci.nome));
  t("a ordem é a dos papéis", MUNDOS.every((w) => w.nucleo.pessoas.every((p, i, a) => i === 0 || PAPEIS_DO_NUCLEO.find((x) => x.id === a[i - 1].papel).ordem < PAPEIS_DO_NUCLEO.find((x) => x.id === p.papel).ordem)));
  t("o elo está vivo e não é nome de marco", MUNDOS.every((w) => { const e = w.nucleo.pessoas.find((p) => p.papel === "elo"); return e && !w.espinha.atos.flatMap((a) => a.marcos).some((m) => norm(m.quem) === norm(e.nome)); }));
  /* sem companheiro (sala de dois, save antigo): a balança e a porta entram */
  const sem = MUNDOS.map((w) => nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, grupo: [] }));
  t("sem companheiro, ainda 4 a 6", sem.every((n) => n.pessoas.length >= NUCLEO.min && n.pessoas.length <= NUCLEO.max), sem.map((n) => n.pessoas.length).join(""));
  t("as invocações não são gente: não viram companheiro", nucleoDaCampanha(W0.semente, W0.mapa, { ...W0.ctx, grupo: [{ nome: "Lobo Espectral", invocada: true }] }).pessoas.every((p) => p.papel !== "companheiro"));
}

/* ============================================================ */
sec("4. as quatro regras que impedem o genérico");
{
  let catRep = [], idRep = [], brigaMal = [], semFio = [], espalho = [], nulos = 0;
  for (const w of MUNDOS) {
    const ps = w.nucleo.pessoas;
    const naoVilao = ps.filter((p) => p.papel !== "vilao");
    for (const campo of ["quer", "teme"]) {
      const c = naoVilao.map((p) => p.ficha[campo]).filter(Boolean).map((x) => x.cat);
      if (!unicos(c)) catRep.push(`${w.semente}:${campo}`);
    }
    for (const campo of ["quer", "teme", "esconde", "carrega", "linha", "fala"]) {
      const ids = ps.map((p) => p.ficha[campo]).filter(Boolean).map((x) => x.id);
      if (!unicos(ids)) idRep.push(`${w.semente}:${campo}`);
    }
    for (const [campo, chave, k] of [["esconde", "grav", 4], ["carrega", "tipo", 3]]) {
      const c = naoVilao.map((p) => p.ficha[campo]).filter(Boolean).map((x) => x[chave]);
      const maior = Math.max(0, ...[...new Set(c)].map((x) => c.filter((y) => y === x).length));
      if (maior > Math.ceil(c.length / k)) espalho.push(`${w.semente}:${campo}`);
    }
    for (const p of ps) {
      const tr = indoleDe(w.semente, { nome: p.nome }).tracos;
      const tabela = { quer: QUER, teme: TEME, esconde: ESCONDE, linha: LINHA, fala: COMO_FALA };
      for (const [campo, tab] of Object.entries(tabela)) {
        if (p.papel === "vilao" && campo === "linha") continue; /* a linha do vilão escapa ao filtro, de propósito */
        const x = p.ficha[campo];
        const row = x && tab.find((r) => r.id === x.id);
        if (row && (row.briga || []).some((b) => tr.includes(b))) brigaMal.push(`${p.nome}:${row.id}`);
      }
      if (!w.nucleo.teia.some((f) => f.a === p.nome || f.b === p.nome)) semFio.push(`${p.papel}:${p.nome}`);
      for (const campo of ["quer", "teme", "esconde", "carrega", "linha", "fala"]) {
        if (p.papel === "vilao" && (campo === "teme" || campo === "carrega")) continue;
        if (!p.ficha[campo]) nulos++;
      }
    }
  }
  t("1. o quer e o teme nunca repetem categoria no núcleo", catRep.length === 0, catRep.slice(0, 3).join(" "));
  t("1. nenhum campo repete entrada no núcleo", idRep.length === 0, idRep.slice(0, 3).join(" "));
  t("1. o esconde e o carrega espalham as categorias o mais que dá", espalho.length === 0, espalho.slice(0, 3).join(" "));
  t("1. ninguém fica com campo vazio (o vilão não tem teme nem carrega)", nulos === 0, String(nulos));
  t("2. a índole filtra: nenhuma entrada que briga com um traço da pessoa", brigaMal.length === 0, brigaMal.slice(0, 4).join(" "));
  t("3. toda pessoa tem ≥ 1 fio para outra do núcleo, o vilão também", semFio.length === 0, semFio.slice(0, 4).join(" "));
  t("3. os fios ligam só gente do núcleo, e nunca alguém a si mesmo", MUNDOS.every((w) => w.nucleo.teia.every((f) => f.a !== f.b && [f.a, f.b].every((n) => w.nucleo.pessoas.some((p) => p.nome === n)))));
  t("3. o fio forçado só nasce por regra", MUNDOS.every((w) => w.nucleo.teia.filter((f) => f.id === "t_morto_vivo").length === (w.nucleo.pessoas.some((p) => p.julgadoMorto) ? 1 : 0)));
  t("4. o elo carrega sempre um pedaço do que está em jogo para o herói", MUNDOS.every((w) => { const e = w.nucleo.pessoas.find((p) => p.papel === "elo"); return e && (EM_JOGO.coisas[w.nucleo.antecedente || "sem"] || []).includes(e.ficha.carrega.pedacoDe); }));
  /* o caso que a regra 2 nomeia: nenhum calado com "acaba as frases dos outros" */
  t("nenhum calado acaba as frases dos outros", MUNDOS.every((w) => w.nucleo.pessoas.every((p) => !(p.ficha.fala && p.ficha.fala.id === "f_acaba" && indoleDe(w.semente, { nome: p.nome }).tracos.includes("calado")))));
  t("nenhum texto da ficha fica com buraco por encher (fora a sombra, que é da hora)", MUNDOS.every((w) => w.nucleo.pessoas.every((p) => !/\{(outro|cidade|assinatura|a|b)\}/.test(JSON.stringify(p.ficha)))));
}

/* ============================================================ */
sec("5. o elo, para cada antecedente");
{
  const w = MUNDOS[0];
  let falhas = [];
  for (const a of ANTS) {
    const n = nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, antecedente: a });
    const e = n.pessoas.find((p) => p.papel === "elo");
    const k = a || "sem";
    const row = ELO_DO_ANTECEDENTE[k];
    const item = (ANTECEDENTES.find((x) => x.id === a) || {}).item || "";
    /* a reviravolta é a da tabela, com a cidade cheia (a da espinha, quando o antecedente é o dela) */
    const molde = REVIRAVOLTA_DO_ATO0[k].split("{")[0];
    const okElo = e && e.ficha.carrega.o === row.carrega && e.ficha.esconde.revela.startsWith(molde) && !/\{cidade\}/.test(e.ficha.esconde.revela)
      && e.ficha.esconde.sombra && e.ficha.esconde.pistas.length === 2 && e.ficha.quer.id === row.quer
      && (row.gemeo && item ? e.ficha.carrega.gemeo === item : !e.ficha.carrega.gemeo);
    if (!okElo) falhas.push(k);
  }
  t("os 13: o elo carrega o objeto da tabela, esconde a reviravolta, tem duas pistas e o gémeo do item", falhas.length === 0, falhas.join(","));
  const semAnt = nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, antecedente: "" , espinha: { ...w.espinha, fio: { ...w.espinha.fio, antecedente: undefined } } });
  const eSem = semAnt.pessoas.find((p) => p.papel === "elo");
  t("sem antecedente, o elo é quem pôs o herói no caminho, e teme ser usado", !!eSem && eSem.eraDoHeroi === ELO_DO_ANTECEDENTE.sem.quem && eSem.ficha.teme.id === "t_ser_usado");
  t("o antecedente pelo NOME também serve (a ficha guarda o nome)", nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, antecedente: "Soldado Reformado" }).antecedente === "soldado");
  t("as pistas do elo trazem a assinatura do antagonista, cheia", MUNDOS.filter((x) => x.nucleo.antecedente === "soldado").every((x) => x.nucleo.pessoas.find((p) => p.papel === "elo").ficha.esconde.pistas[1].o.includes(x.espinha.fio.assinatura)));
}

/* ============================================================ */
sec("6. as decisões da etapa");
{
  /* (a) companheiro e elo com a mesma ligação: o elo é OUTRA pessoa, e o
     companheiro julgava-o morto */
  const w = MUNDOS[0];
  const grupo = [{ nome: "Vando Tiago", conceito: "companheiro de armas" }];
  const n = nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, antecedente: "soldado", grupo });
  const e = n.pessoas.find((p) => p.papel === "elo");
  const f = n.teia.find((x) => x.id === "t_morto_vivo");
  t("(a) soldado com companheiro de armas: o elo é outra pessoa", !!e && e.nome !== "Vando Tiago" && e.julgadoMorto === true);
  t("(a) e nasce o fio forçado: o companheiro julga-o morto, só o elo sabe", !!f && f.a === "Vando Tiago" && f.b === e.nome && f.sabe === "b");
  const n2 = nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, antecedente: "soldado", grupo: [{ nome: "Vando Tiago", conceito: "irmão" }] });
  t("(a) com outra ligação, nada se força", !n2.teia.some((x) => x.id === "t_morto_vivo") && !n2.pessoas.some((p) => p.julgadoMorto));
  const nArt = nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, antecedente: "artista", grupo: [{ nome: "Mira Sol", conceito: "mestra de ofício" }] });
  t("(a) artista com a mestra de ofício: o mesmo caso", nArt.teia.some((x) => x.id === "t_morto_vivo" && x.a === "Mira Sol"));

  /* (b) a máscara do aliado nunca no mesmo ato que o elo */
  const nm = nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, grupo, reviravolta: { forma: "aliado_agente", alvo: "Vando Tiago" } });
  const comp = nm.pessoas.find((p) => p.papel === "companheiro");
  const elo = nm.pessoas.find((p) => p.papel === "elo");
  t("(b) com a máscara eleita, o segredo do companheiro é o da máscara", comp.ficha.esconde.id === ESCONDE_DA_MASCARA && comp.revelaNoAto === ATO_DA_REVELACAO.mascara);
  t("(b) sem a máscara, o companheiro nunca leva segredo de sombra", MUNDOS.every((x) => x.nucleo.pessoas.filter((p) => p.papel === "companheiro").every((p) => !p.ficha.esconde.sombra && p.revelaNoAto == null)));
  t("(b) só o elo e a máscara guardam segredo de sombra", MUNDOS.every((x) => x.nucleo.pessoas.filter((p) => p.ficha.esconde && p.ficha.esconde.sombra).every((p) => p.papel === "elo")));
  t("(b) a máscara de outro (não o companheiro) não toca na ficha dele", nucleoDaCampanha(w.semente, w.mapa, { ...w.ctx, grupo, reviravolta: { forma: "aliado_agente", alvo: "Outro Fulano" } }).pessoas[0].ficha.esconde.id !== ESCONDE_DA_MASCARA);
  t("(b) a máscara nunca no ato 0", !revelacaoPermitida(nm, comp.nome, 0, []));
  t("(b) o elo pode no ato 0, a máscara no 1", revelacaoPermitida(nm, elo.nome, 0, []) && revelacaoPermitida(nm, comp.nome, 1, [{ nome: elo.nome, ato: 0 }]));
  t("(b) nunca duas no mesmo ato: o elo atrasado e a máscara no ato 1, só uma", !revelacaoPermitida(nm, comp.nome, 1, [{ nome: elo.nome, ato: 1 }]) && !revelacaoPermitida(nm, elo.nome, 1, [{ nome: comp.nome, ato: 1 }]));
  t("(b) quem já se revelou não se revela outra vez", !revelacaoPermitida(nm, elo.nome, 2, [{ nome: elo.nome, ato: 0 }]));
  t("(b) quem não tem segredo de sombra não se revela", nm.pessoas.filter((p) => !["elo", "companheiro"].includes(p.papel)).every((p) => !revelacaoPermitida(nm, p.nome, 2, [])));

  /* as feridas que obrigam fio */
  let mestre = 0, filha = 0, malF = [];
  for (const x of MUNDOS) {
    for (const lig of ["mestre de ofício", "companheiro de estrada"]) {
      const nn = nucleoDaCampanha(x.semente, x.mapa, { ...x.ctx, grupo: [{ nome: "Ilsa Var", conceito: lig }] });
      const v = nn.pessoas.find((p) => p.papel === "vilao");
      if (!v || !v.ficha.esconde) continue;
      if (v.ficha.esconde.id === "w_mesmo_mestre") { mestre++; if (lig !== "mestre de ofício" || !nn.teia.some((f) => f.id === "t_ensinou" && f.a === "Ilsa Var" && f.b === v.nome)) malF.push("mestre"); }
      if (v.ficha.esconde.id === "w_filha") { filha++; const po = nn.pessoas.find((p) => p.papel === "porta"); if (!po || !nn.teia.some((f) => f.id === "t_sangue_calado" && f.a === v.nome && f.b === po.nome)) malF.push("filha"); }
    }
  }
  t(`as feridas com condição só nascem com ela, e com o fio (mesmo mestre ${mestre}, filha ${filha})`, malF.length === 0 && mestre > 0, malF.join(","));
}

/* ============================================================ */
sec("7. a linha QUEM É");
{
  let longas = [], segredo = [], bastidor = [], abertas = [];
  const PROIB = new RegExp(`(?<![\\p{L}])(${QUEM_E.proibidas.join("|")})(?![\\p{L}])`, "iu");
  for (const w of MUNDOS) {
    const ultimo = w.espinha.atos.length - 1;
    for (const p of w.nucleo.pessoas) {
      for (const ato of [0, 1, ultimo]) {
        for (const cenas of [0, 1, 2, 5]) {
          const tamanho = ato <= 0 ? "inicio" : ato >= ultimo ? "fim" : "meio";
          const l = linhaQuemE(p, { tamanho, fio: w.espinha.fio, cenas });
          if (!l) continue;
          if (l.length > QUEM_E.max) longas.push(l);
          if (!/[.!?…]"?$/.test(l)) abertas.push(l);
          if (PROIB.test(l)) bastidor.push(l);
          const esc = p.ficha.esconde;
          const segredoPode = p.papel === "vilao" && tamanho === "fim";
          /* o segredo é o que se esconde e o que muda quando se revela. As
             pistas não entram aqui: o objeto que o elo carrega É, por desenho,
             o que se vê dele (a faca gémea, a outra metade da bússola) — o que
             faz dele pista é a assinatura do antagonista, e essa nunca vai. */
          if (esc && !segredoPode) {
            const textos = [esc.o, esc.revela].filter((x) => x && x.length > 8).map((x) => x.replace(/\{sombra\}/g, ""));
            if (textos.some((x) => l.includes(x.slice(0, 24)))) segredo.push(l);
            if (p.papel !== "vilao" && w.espinha.fio && w.espinha.fio.assinatura && l.includes(w.espinha.fio.assinatura)) segredo.push(l);
          }
        }
      }
    }
  }
  t("nenhuma linha passa de 130 caracteres", longas.length === 0, longas[0]);
  t("toda linha é frase fechada", abertas.length === 0, abertas[0]);
  t("nenhuma diz palavra de bastidor (subtrama, arco, pedido, crise, escolha, pista, núcleo)", bastidor.length === 0, bastidor[0]);
  t("o segredo nunca vai antes da hora (só o do vilão, no fim)", segredo.length === 0, segredo[0]);

  /* o vilão em três tamanhos */
  const v = W0.nucleo.pessoas.find((p) => p.papel === "vilao");
  const li = linhaQuemE(v, { tamanho: "inicio", fio: W0.espinha.fio, cenas: 3 });
  const lf = linhaQuemE(v, { tamanho: "fim", fio: W0.espinha.fio, cenas: 3 });
  t("o vilão no início: só a voz, nem a linha nem a ferida", li.includes(v.ficha.fala.o) && !li.includes(v.ficha.linha.o) && !li.includes(v.ficha.esconde.o));
  t("o vilão no fim: a ferida e a linha", lf.includes(v.ficha.esconde.o.slice(0, 20)) || lf.includes(v.ficha.linha.o));

  /* o exemplo só nas duas primeiras cenas */
  const c = W0.nucleo.pessoas.find((p) => p.papel !== "vilao" && p.ficha.fala);
  const l0 = linhaQuemE(c, { cenas: 0, fio: W0.espinha.fio }), l3 = linhaQuemE(c, { cenas: 3, fio: W0.espinha.fio });
  t("o exemplo da fala só nas primeiras cenas; depois, só o tique", !l3.includes(c.ficha.fala.exemplo) && (l0.includes(c.ficha.fala.exemplo) || l0.includes(c.ficha.fala.o)));
  /* no ato 0 a sombra não tem nome — nem na ficha de quem a tem por "outro" */
  t("no início, o nome do vilão não aparece na ficha de ninguém", MUNDOS.every((w) => { const v = w.nucleo.pessoas.find((p) => p.papel === "vilao"); return !v || w.nucleo.pessoas.filter((p) => p !== v).every((p) => !linhaQuemE(p, { tamanho: "inicio", fio: w.espinha.fio }).includes(v.nome.split(",")[0])); }));
  t("o motivo do vilão não diz \"quer quer\"", MUNDOS.every((w) => w.nucleo.pessoas.every((p) => !/^quer\s/i.test((p.ficha.quer || {}).o || ""))));
  t("{sombra} chega cheia, no tamanho do ato", MUNDOS.every((w) => w.nucleo.pessoas.every((p) => !linhaQuemE(p, { fio: w.espinha.fio }).includes("{"))));

  /* só quem está em cena, uma por turno, e de seis em seis turnos */
  const n = W0.nucleo;
  const nomes = n.pessoas.map((p) => p.nome);
  t("ninguém em cena, nada", quemEParaPauta(n, { emCena: [], turno: 1 }).quemE.length === 0 && quemEParaPauta(n, { emCena: ["Ninguém Daqui"], turno: 1 }).quemE.length === 0);
  const r1 = quemEParaPauta(n, { emCena: nomes, ato: 0, ultimoAto: 3, turno: 10, fio: W0.espinha.fio });
  t("todos em cena: UMA linha, a do primeiro papel", r1.quemE.length === 1 && r1.quem === n.pessoas[0].nome);
  const r2 = quemEParaPauta(n, { emCena: nomes, ato: 0, ultimoAto: 3, turno: 12, ultimas: { [r1.quem]: 10 }, fio: W0.espinha.fio });
  t("a mesma pessoa não volta antes de seis turnos: vai a seguinte", r2.quemE.length === 1 && r2.quem === n.pessoas[1].nome);
  const r3 = quemEParaPauta(n, { emCena: [r1.quem], ato: 0, turno: 16, ultimas: { [r1.quem]: 10 }, fio: W0.espinha.fio });
  t("e volta ao sexto turno", r3.quem === r1.quem);
  t("o primeiro nome em cena basta (\"Vando\" é o Vando do núcleo)", quemEParaPauta(n, { emCena: [n.pessoas[0].nome.split(" ")[0]], turno: 1 }).quem === n.pessoas[0].nome || !n.pessoas[0].nome.includes(" "));

  /* simulação: 60 turnos com gente a entrar e sair — o segredo nunca vai */
  let vazou = 0, linhasSim = 0;
  for (const w of MUNDOS.slice(0, 40)) {
    const ultimas = {}, cenas = {};
    for (let turno = 1; turno <= 60; turno++) {
      const emCena = w.nucleo.pessoas.filter((p, i) => (turno + i * 7) % 5 < 2).map((p) => p.nome);
      const r = quemEParaPauta(w.nucleo, { emCena, ato: turno < 30 ? 0 : 1, ultimoAto: w.espinha.atos.length - 1, turno, ultimas, cenas, fio: w.espinha.fio });
      if (!r.quem) continue;
      linhasSim++;
      ultimas[r.quem] = turno; cenas[r.quem] = (cenas[r.quem] || 0) + 1;
      const p = w.nucleo.pessoas.find((x) => x.nome === r.quem);
      if (p.papel !== "vilao" && p.ficha.esconde && r.quemE[0].includes(p.ficha.esconde.o.replace(/\{sombra\}/g, "").slice(0, 20))) vazou++;
    }
  }
  t(`40 mundos × 60 turnos: ${linhasSim} linhas, nenhuma com o segredo`, vazou === 0 && linhasSim > 0);

  /* a pauta: a secção existe, corta onde a especificação diz, cede na luta */
  const s = secaoPorId("quemE");
  /* MOVIDA NA C2 (11/10), com o motivo: era "prio 4,5 — depois de QUEM e
     de PERGUNTOU". A prova viva da C1 (v9.410) mediu a pauta de um turno de
     cidade em ~1323 de 1400 e a linha QUEM É a cair primeiro, vencida pela
     economia da praça (2,5) e pela cauda do ONDE (2,49) — decoração. A
     intenção que fica: nunca à frente de um veto, do desfecho, do coração
     nem da batida; sempre à frente da decoração; e numa pergunta cede à
     resposta (a lei da escuta). */
  t("a secção QUEM É existe, com prio 2,485 — depois dos vetos, do coração e da batida; à frente da cauda do ONDE e da economia", !!s && s.rotulo === "QUEM É" && s.prio === 2.485
    && secaoPorId("naoPode").prio < s.prio && secaoPorId("coracao").prio < s.prio && secaoPorId("momento").frente.every((x) => x < s.prio)
    && secaoPorId("onde").cauda.prio > s.prio && secaoPorId("economia").prio > s.prio);
  t("numa pergunta, o QUEM É cede (a resposta passa à frente)", SECOES_QUE_CEDEM.pergunta.includes("quemE") && !(cederNaCena({ quemE: ["x: y."], pergunta: ["quanto custa? três moedas."] }, {}).quemE || []).length);
  t("na luta, o QUEM É cede", SECOES_QUE_CEDEM.luta.includes("quemE") && !(cederNaCena({ quemE: ["x: y."] }, { luta: true }).quemE || []).length);
  t("o teto da pauta não subiu", TETO_DA_PAUTA === 1400);
  let cortou = 0;
  for (const w of MUNDOS) {
    let cheia = {};
    for (const x of SECOES) if (x.id !== "quemE") cheia = porNaPauta(cheia, x.id, `${x.id} linha ` + "x".repeat(110));
    const r = quemEParaPauta(w.nucleo, { emCena: w.nucleo.pessoas.map((p) => p.nome), ato: 0, ultimoAto: 3, turno: 1, fio: w.espinha.fio });
    const com = textoDaPauta(porNaPauta(cheia, "quemE", ...r.quemE));
    const sem = textoDaPauta(cheia);
    for (const id of ["naoPode", "vetoDoDesfecho", "desfecho"]) if (sem.includes(`${id} linha`) && !com.includes(`${id} linha`)) cortou++;
    if (com.length > TETO_DA_PAUTA) cortou++;
  }
  t(`${N_MUNDOS} pautas cheias: a linha QUEM É não tira veto nem desfecho, e o teto aguenta`, cortou === 0);
}

/* ============================================================ */
sec("7b. a ficha na própria voz (a peça que a fogueira vai chamar)");
{
  const PROIB = new RegExp(`(?<![\\p{L}])(${QUEM_E.proibidas.join("|")})(?![\\p{L}])`, "iu");
  t("a ordem da noite: o que traz, o que quer, a linha, o que tira o sono — nunca o esconde", FOGUEIRA_CONTA.ordem.join() === "carrega,quer,linha,teme" && !FOGUEIRA_CONTA.ordem.includes("esconde"));
  t("há modelo para cada tipo do carrega e cada campo", [...Object.keys(CARREGA), "quer", "linha", "teme"].every((k) => FOGUEIRA_CONTA.modelos[k]));
  let longas = [], vazou = [], bastidor = [], semNome = [], repetiu = 0, noites = 0;
  for (const w of MUNDOS) {
    for (const p of w.nucleo.pessoas) {
      if (p.papel === "vilao") { if (fichaNaVoz(p, { fio: w.espinha.fio }) !== null) vazou.push("vilão"); continue; }
      const contados = [];
      for (let noite = 0; noite < 6; noite++) {
        const r = fichaNaVoz(p, { contados, fio: w.espinha.fio });
        if (!r) break;
        noites++;
        if (contados.includes(r.campo)) repetiu++;
        contados.push(r.campo);
        if (r.linha.length > FOGUEIRA_CONTA.max) longas.push(r.linha);
        if (PROIB.test(r.linha)) bastidor.push(r.linha);
        if (!r.linha.startsWith(p.nome)) semNome.push(r.linha);
        const esc = p.ficha.esconde;
        if (esc && [esc.o, esc.revela].filter((x) => x && x.length > 8).some((x) => r.linha.includes(x.replace(/\{sombra\}/g, "").slice(0, 24)))) vazou.push(r.linha);
        if (/\{/.test(r.linha)) vazou.push(r.linha);
      }
      if (contados.length > FOGUEIRA_CONTA.ordem.length) repetiu++;
    }
  }
  t(`${noites} noites contadas: cada campo uma vez só, e a pessoa acaba por se calar`, repetiu === 0 && noites > 0);
  t("toda linha cabe em 220 e começa pelo nome de quem conta", longas.length === 0 && semNome.length === 0, longas[0] || semNome[0]);
  t("nunca o segredo, nunca buraco por encher, e o vilão não se senta ao fogo", vazou.length === 0, vazou[0]);
  t("nenhuma palavra de bastidor", bastidor.length === 0, bastidor[0]);
  t("lixo: nada estoura, e devolve null", [null, undefined, "x", 7, {}].every((x) => fichaNaVoz(x, x || undefined) === null));
  const p0 = W0.nucleo.pessoas.find((p) => p.papel !== "vilao");
  t("a primeira noite conta o que a pessoa traz", fichaNaVoz(p0, { fio: W0.espinha.fio }).campo === "carrega");
}

/* ============================================================ */
sec("7c. o género de quem fala (C2: a teia dava \"noivo(a)\", a fogueira \"dito por ele\" da Perrine)");
{
  /* a tabela não envelhece: cada frase que ela flexiona existe mesmo nas tabelas */
  const fonteC1 = JSON.stringify([QUER, TEME, ESCONDE, CARREGA, LINHA, ELO_DO_ANTECEDENTE, PISTAS_DO_ELO, FERIDA_DO_VILAO, REVIRAVOLTA_DO_ATO0]);
  const velhas = [...GENERO_NA_FICHA.feminino, ...GENERO_NA_FICHA.masculino].map(([de]) => de).filter((de) => !fonteC1.includes(de));
  t("toda frase que GENERO_NA_FICHA troca existe nas tabelas (nenhuma morta)", velhas.length === 0, velhas.join(" | "));
  t("os pronomes dos dois géneros, com as mesmas chaves", Object.keys(GENERO_NA_FICHA.pronomes.homem).join() === Object.keys(GENERO_NA_FICHA.pronomes.mulher).join());
  t("noGenero: \"noivo(a)\" vira noiva para ela, noivo para ele", noGenero("{a} foi noivo(a) de {b}", "mulher").includes("foi noiva de") && noGenero("{a} foi noivo(a) de {b}", "homem").includes("foi noivo de"));
  t("noGenero: sem género, o masculino genérico, e nunca \"(a)\"", noGenero("julga-o morto(a)", "") === "julga-o morto");
  t("noGenero: os pronomes", noGenero("dito por {ele}; {Ele} sabe; o nome {dele}; chama-{o}; {sozinho}", "mulher") === "dito por ela; Ela sabe; o nome dela; chama-a; sozinha");
  t("noGenero: a frase do outro, não — \"e ela forja para ele\" (o segundo é a sombra)", noGenero("a forja foi tomada, e ele forja para ele agora", "mulher") === "a forja foi tomada, e ela forja para ele agora");
  t("generoDaPessoa: o da base primeiro", generoDaPessoa({ nome: "Yorick", genero: "mulher" }) === "mulher" && generoDaPessoa({ nome: "x", genero_pessoa: "homem" }) === "homem");
  t("generoDaPessoa: o vilão pelo primeiro nome — e o artigo do título NÃO conta (\"a Mão Fria\" é dele)", generoDaPessoa({ nome: "Yorick Ventoforte, a Mão Fria" }) === "homem" && generoDaPessoa({ nome: "Petra, a Boca da Cova" }) === "mulher");
  t("generoDaPessoa: o que não é nome de gente fica sem género (o Golem)", generoDaPessoa({ nome: "Golem de Pedra a Viúva de Ferro" }) === "" && generoDaPessoa(null) === "");
  t("sexoDoNome: o nome dos dois bancos não decide", sexoDoNome("Nyx") === "" && sexoDoNome("Aldric Vale") === "masc" && sexoDoNome("Dahlia") === "fem" && sexoDoNome(null) === "");

  /* 120 mundos: tudo o que o núcleo produz, por pessoa */
  const errados = [], comA = [], pron = [];
  let noivos = 0, mortos = 0, mulheres = 0, homens = 0;
  for (const w of MUNDOS) {
    for (const f of w.nucleo.teia) {
      if (/\(a\)/.test(f.o)) comA.push(f.o);
      const g = (n) => generoDaPessoa(w.nucleo.pessoas.find((p) => p.nome === n));
      if (f.id === "t_noivos") { noivos++; if (f.o.includes(g(f.a) === "mulher" ? "foi noivo de" : "foi noiva de")) errados.push(f.o); }
      if (f.id === "t_morto_vivo") { mortos++; if (/ morto$/.test(f.o) === (g(f.b) === "mulher")) errados.push(f.o); }
    }
    for (const p of w.nucleo.pessoas) {
      const g = generoDaPessoa(p);
      if (g === "mulher") mulheres++; else homens++;
      const fi = p.ficha || {};
      const linhas = [p.eraDoHeroi || "", ...["quer", "teme", "esconde", "carrega", "linha", "fala"].flatMap((k) => fi[k] ? [fi[k].o, fi[k].revela || "", ...(fi[k].pistas || []).map((x) => x.o)] : [])];
      for (const tam of ["inicio", "meio", "fim"]) for (const cenas of [0, 3]) linhas.push(linhaQuemE(p, { tamanho: tam, fio: w.espinha.fio, cenas }));
      const contados = [];
      for (let k = 0; k < 5; k++) { const r = fichaNaVoz(p, { contados, fio: w.espinha.fio }); if (!r) break; contados.push(r.campo); linhas.push(r.linha); if (/dito por (ele|ela)/.test(r.linha) && !r.linha.includes(g === "mulher" ? "dito por ela" : "dito por ele")) pron.push(r.linha); }
      const outro = g === "mulher" ? GENERO_NA_FICHA.feminino.map(([de]) => de) : GENERO_NA_FICHA.masculino.map(([de]) => de);
      for (const l of linhas) {
        if (/\(a\)/.test(l)) comA.push(l);
        const x = outro.find((de) => l.includes(de));
        if (x) errados.push(`${p.nome} (${g || "?"}): ${x}`);
      }
    }
  }
  t(`${N_MUNDOS} mundos (${mulheres} mulheres, ${homens} homens ou sem género): nenhuma linha com "(a)"`, comA.length === 0, comA[0]);
  t(`nenhuma frase no género do outro (a teia: ${noivos} noivados, ${mortos} julgados mortos)`, errados.length === 0, errados.slice(0, 3).join(" | "));
  t("a fogueira diz \"dito por ela\" dela e \"dito por ele\" dele", pron.length === 0, pron[0]);
}

/* ============================================================ */
sec("8. o campo `coracao` do save, o lixo e a imutabilidade");
{
  const vazio = garantirCoracaoDoSave(null);
  t("do nada, o campo vazio na versão 1", vazio.v === CORACAO_DO_SAVE.v && Object.keys(vazio.arcos).length === 0);
  const lixo = [undefined, null, "x", 7, [], {}, { arcos: null }, { arcos: [1, 2] }, { arcos: "z" }];
  t("o lixo dá o campo vazio, sem estourar", lixo.every((x) => { try { const g = garantirCoracaoDoSave(x); return g.v === 1 && Object.keys(g.arcos).length === 0; } catch { return false; } }));
  const cru = { v: 9, arcos: { Vando: { pedido: "3", resposta: "aceitou", crise: -1, escolha: "ir_com_ele", pistas: [4, "x", 6, 9] }, Elmo: { resposta: "talvez", escolha: 7 }, "__proto__": { pedido: 1 } } };
  const g = garantirCoracaoDoSave(cru);
  t("o arco guarda o que a C2 escreve, limpo", g.arcos.Vando.pedido === 3 && g.arcos.Vando.resposta === "aceitou" && g.arcos.Vando.crise === null && g.arcos.Vando.escolha === "ir_com_ele");
  t("duas pistas no máximo, só dias", g.arcos.Vando.pistas.join() === "4,6");
  t("resposta que não existe e escolha que não é texto ficam vazias", g.arcos.Elmo.resposta === "" && g.arcos.Elmo.escolha === "" && g.arcos.Elmo.pedido === null && g.arcos.Elmo.pistas.length === 0);
  t("a chave venenosa não entra", !Object.prototype.hasOwnProperty.call(g.arcos, "__proto__"));
  t("passar duas vezes não muda nada", JSON.stringify(garantirCoracaoDoSave(g)) === JSON.stringify(g));
  const muitos = { arcos: Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`P${i}`, { pedido: i }])) };
  t(`no máximo ${CORACAO_DO_SAVE.arcosMax} arcos`, Object.keys(garantirCoracaoDoSave(muitos).arcos).length === CORACAO_DO_SAVE.arcosMax);
  const antes = JSON.stringify(cru);
  garantirCoracaoDoSave(cru);
  t("o recebido fica intacto", JSON.stringify(cru) === antes);

  /* o núcleo não muta o que recebe (strict mode: escrever num congelado estoura) */
  const ctxC = congelar(JSON.parse(JSON.stringify({ ...W0.ctx, molde: undefined })));
  const mapaC = congelar(JSON.parse(JSON.stringify(W0.mapa)));
  let estourou = "";
  try { nucleoDaCampanha(W0.semente, mapaC, { ...ctxC, molde: W0.ctx.molde }); } catch (e) { estourou = e.message; }
  t("o núcleo não muta o contexto nem o mapa", estourou === "", estourou);
  const nuC = congelar(JSON.parse(JSON.stringify(W0.nucleo)));
  try { quemEParaPauta(nuC, { emCena: nuC.pessoas.map((p) => p.nome), turno: 1 }); linhaQuemE(nuC.pessoas[0]); revelacaoPermitida(nuC, nuC.pessoas[0].nome, 1, []); } catch (e) { estourou = e.message; }
  t("a linha e as revelações não mutam o núcleo", estourou === "", estourou);
  t("a tabela da ferida não é mutada pelo sorteio", FERIDA_DO_VILAO.every((w) => !w.teia || ["a", "b"].includes(w.teia.vilaoE)));

  let erro = "";
  for (const x of [null, undefined, "x", 7, {}, []]) {
    try {
      const n = nucleoDaCampanha(x, x, x);
      if (!n || !Array.isArray(n.pessoas) || !Array.isArray(n.teia)) erro = "forma";
      quemEParaPauta(x, x); linhaQuemE(x, {}); revelacaoPermitida(x, x, x, x);
    } catch (e) { erro = e.message; }
  }
  t("lixo em tudo: nada estoura, o núcleo vem vazio", erro === "", erro);
  t("lixo dá linha vazia e revelação recusada", linhaQuemE(null) === "" && revelacaoPermitida(null, "x", 0, null) === false && quemEParaPauta(null, null).quemE.length === 0);
  t("espinha sem fio (save antigo): o vilão sai do confronto", (() => {
    const e = { ...W0.espinha, fio: undefined };
    const n = nucleoDaCampanha(W0.semente, W0.mapa, { ...W0.ctx, espinha: e });
    const conf = W0.espinha.atos.flatMap((a) => a.marcos).filter((m) => m.feitio === "confronto" && m.alvo).pop();
    const v = n.pessoas.find((p) => p.papel === "vilao");
    return conf ? !!v && v.nome === conf.alvo : true;
  })());
}

console.log(`\n${ok} ok, ${mal} mal`);
process.exit(mal ? 1 : 0);
