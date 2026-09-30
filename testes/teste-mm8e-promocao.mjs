/* teste-mm8e-promocao.mjs (Fase MM · MM8e) — o figurante em quem se investe sobe

   A única subetapa da MM8 com campo de save: `elenco` no topo, NOVO e
   ignorado pela versão antiga. Os dias em que o herói viu cada pessoa
   (`vistos`), a promoção ao virar o dia pelo mesmo convívio do convite, e a
   saída de quem pesa menos, dita em voz de mundo. */
import {
  ELENCO_DO_SAVE_VERSAO, VISTOS, PROMOCAO, FONTES_QUE_NUNCA_SAEM, TAMANHO_DO_ELENCO,
  garantirElencoDoSave, diasVistosDe, registrarVisto, vistosDaNarrativa, promoverNoDia, saidaParaPauta, elencoDoMundo,
} from "../src/elenco.js";
import { criarNPC, firmarLaco, investimentoDe, resumoNPCsParaPrompt, FIGURANTE } from "../src/npcs.js";
import { indoleDe, pesarConvite, garantirConvivio } from "../src/indole.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { guildasDoMundo } from "../src/guildas.js";
import { oQueExisteAqui, matar, garantirBase } from "../src/mundo-base.js";
import { registoSimulado, CENARIOS } from "./registo-simulado.mjs";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const G = "Fantasia medieval";
const SEM = "Sonda da Gente|Fantasia medieval";
const MAPA = gerarGeografia(SEM, "sobremundo");
const ESPINHA = estenderEspinha({ semente: SEM, mapa: MAPA, genero: G, cidadeInicial: MAPA.cidades[0].nome });
const GUILDAS = guildasDoMundo(SEM, MAPA, G);
const CTX = { genero: G, espinha: ESPINHA, guildas: GUILDAS };
const EL = elencoDoMundo(SEM, MAPA, CTX);
const NO_ELENCO = new Set(EL.pessoas.map((p) => p.nome));
/* figurantes da base, fora do elenco */
const FIGS = MAPA.cidades.slice(0, 6).flatMap((c) => oQueExisteAqui(SEM, MAPA, c.nome, null, G).gente.map((p) => ({ ...p, cidadeDe: c.nome }))).filter((p) => !NO_ELENCO.has(p.nome));
const ficha = (p, conhecidoEm = 1, extra = {}) => criarNPC(p.nome, { papel: p.papel, local: p.cidadeDe, conhecidoEm, ...extra });
const vistoEm = (nome, ...dias) => dias.reduce((e, d) => registrarVisto(e, nome, d), null);

/* ============================================================ */
sec("1. o campo e as tabelas");
{
  const vazio = garantirElencoDoSave(null);
  t("null e lixo dão o campo vazio, com versão", [null, undefined, "x", 7, [], {}].every((x) => JSON.stringify(garantirElencoDoSave(x)) === JSON.stringify(vazio)) && vazio.versao === ELENCO_DO_SAVE_VERSAO);
  t("o campo tem as quatro partes", ["versao", "promovidos", "saidos", "vistos"].every((k) => k in vazio));
  const sujo = garantirElencoDoSave(JSON.parse('{"promovidos":{"Ana":3,"":2,"Zé":"x","Bia":-1,"__proto__":4},"saidos":{"Cid":"5"},"vistos":{"Ana":[3,3,1,"x",-2,9],"Nulo":null}}'));
  t("dias inválidos, nomes vazios e chaves perigosas saem", JSON.stringify(sujo.promovidos) === '{"Ana":3}' && sujo.saidos.Cid === 5 && JSON.stringify(sujo.vistos) === '{"Ana":[1,3,9]}' && Object.getPrototypeOf(sujo.promovidos) === Object.prototype);
  let e = null;
  for (let d = 1; d <= 30; d++) e = registrarVisto(e, "Ana", d);
  t(`o teto por pessoa guarda os ${VISTOS.porPessoa} dias mais recentes`, e.vistos.Ana.length === VISTOS.porPessoa && e.vistos.Ana[0] === 30 - VISTOS.porPessoa + 1);
  let g = null;
  for (let i = 0; i < VISTOS.pessoas + 20; i++) g = registrarVisto(g, `P${i}`, i);
  t(`o teto total guarda as ${VISTOS.pessoas} pessoas vistas por último`, Object.keys(g.vistos).length === VISTOS.pessoas && !g.vistos.P0 && !!g.vistos[`P${VISTOS.pessoas + 19}`]);
  t("garantir é idempotente", JSON.stringify(garantirElencoDoSave(garantirElencoDoSave(sujo))) === JSON.stringify(sujo));
  const antes = vistoEm("Ana", 2);
  const depois = registrarVisto(antes, "Ana", 5);
  t("registrar é imutável", antes.vistos.Ana.length === 1 && depois.vistos.Ana.length === 2);
  t("a promoção pede o mesmo piso de dias da índole, uma por dia", PROMOCAO.convivioMinimo === 3 && PROMOCAO.porDia === 1);
  t("a espinha e os chefes nunca saem", FONTES_QUE_NUNCA_SAEM.join() === "espinha,chefe");
  t("dois dias vistos contam como voltar", FIGURANTE.diasVistos === 2);
}

/* ============================================================ */
sec("2. a versão antiga ignora o campo, e um save sem ele joga igual");
{
  /* A PROVA PELO CÓDIGO: o load lê o save chave a chave e nunca percorre as
     chaves; o salvar monta o objeto de novo a partir dos refs. Uma chave de
     topo que ele não conhece não é lida nem validada — e some no primeiro
     autosave da versão antiga. */
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o load nunca percorre as chaves do save (Object.keys/entries/for-in de sv)", !/Object\.(keys|entries|values)\(sv\)|for \(const \w+ in sv\)/.test(APP));
  t("o salvar monta os dados de novo a partir dos refs (a chave desconhecida não sobrevive, nem parte nada)", /const dados = \{\s*nomeCampanha: nomeVivo, mundo, personagem,/.test(APP));
  /* um save sem o campo: tudo igual ao de antes */
  const semCampo = elencoDoMundo(SEM, MAPA, CTX);
  const campoVazio = elencoDoMundo(SEM, MAPA, { ...CTX, estado: garantirElencoDoSave(undefined), npcs: {} });
  t("sem o campo, o elenco é o mesmo de antes", JSON.stringify(semCampo) === JSON.stringify(campoVazio));
  const r = registoSimulado("medio");
  t("sem vistos, as PESSOAS CONHECIDAS são as mesmas", resumoNPCsParaPrompt(r.npcs) === resumoNPCsParaPrompt(r.npcs, undefined, { vistos: undefined }));
  t("e ninguém sobe sem o dia do encontro", promoverNoDia(SEM, MAPA, CTX, null, { npcs: { X: criarNPC("X", {}) }, dia: 50 }).promovidos.length === 0);
}

/* ============================================================ */
sec("3. a promoção: voltar a ele, o laço, o grupo");
{
  const [a, b, c, d] = FIGS;
  const pVisto = promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 4), { npcs: { [a.nome]: ficha(a, 1) }, grupo: [], dia: 6 });
  t("quem o herói viu em 2 dias sobe", pVisto.promovidos[0] === a.nome && pVisto.saidos.length === 1);
  const pLaco = promoverNoDia(SEM, MAPA, CTX, null, { npcs: { [b.nome]: firmarLaco(ficha(b, 1), "amizade", 2) }, grupo: [], dia: 6 });
  t("quem tem laço sobe", pLaco.promovidos[0] === b.nome);
  const pGrupo = promoverNoDia(SEM, MAPA, CTX, null, { npcs: { [c.nome]: ficha(c, 1) }, grupo: [{ nome: c.nome }], dia: 6 });
  t("quem anda no grupo sobe", pGrupo.promovidos[0] === c.nome);
  t("quem só foi visto num dia não sobe", promoverNoDia(SEM, MAPA, CTX, vistoEm(d.nome, 2), { npcs: { [d.nome]: ficha(d, 1) }, dia: 6 }).promovidos.length === 0);
  /* O MESMO CONVÍVIO DO CONVITE: menos de 3 dias desde o encontro, ninguém sobe */
  const cedo = promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 3), { npcs: { [a.nome]: ficha(a, 2) }, dia: 4 });
  t("com 2 dias de convívio, ainda não (o piso do convite)", cedo.promovidos.length === 0 && garantirConvivio({ dias: 2 }).dias < PROMOCAO.convivioMinimo);
  t("com 3, sim", promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 3), { npcs: { [a.nome]: ficha(a, 2) }, dia: 5 }).promovidos[0] === a.nome);
  const base = matar(garantirBase(null), a.nome);
  t("quem morreu não sobe", promoverNoDia(SEM, MAPA, { ...CTX, base }, vistoEm(a.nome, 2, 4), { npcs: { [a.nome]: ficha(a, 1) }, dia: 6 }).promovidos.length === 0);
  const dois = promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 4), { npcs: { [a.nome]: ficha(a, 1), [b.nome]: firmarLaco(ficha(b, 1), "amor", 2) }, dia: 6 });
  t("um por dia, e o de mais peso primeiro (o laço antes de dois dias vistos)", dois.promovidos.length === 1 && dois.promovidos[0] === b.nome);
  /* depois da promoção */
  const el2 = elencoDoMundo(SEM, MAPA, { ...CTX, estado: pVisto.estado, npcs: { [a.nome]: ficha(a, 1) } });
  t("o elenco continua com 24", el2.pessoas.length === TAMANHO_DO_ELENCO);
  t("com o promovido dentro e quem saiu fora", el2.pessoas.some((p) => p.nome === a.nome && p.fonte === "promovido") && !el2.pessoas.some((p) => p.nome === pVisto.saidos[0].nome));
  const semEnvolvidos = (el) => JSON.stringify(el.lacos.filter((l) => ![a.nome, pVisto.saidos[0].nome].includes(l.a) && ![a.nome, pVisto.saidos[0].nome].includes(l.b)));
  t("os laços de quem não tem nada com a promoção não mudam", semEnvolvidos(el2) === semEnvolvidos(EL));
  t("determinístico: o mesmo campo dá o mesmo elenco", JSON.stringify(el2) === JSON.stringify(elencoDoMundo(SEM, MAPA, { ...CTX, estado: JSON.parse(JSON.stringify(pVisto.estado)), npcs: { [a.nome]: ficha(a, 1) } })));
  t("e a mesma promoção", JSON.stringify(pVisto) === JSON.stringify(promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 4), { npcs: { [a.nome]: ficha(a, 1) }, grupo: [], dia: 6 })));
}

/* ============================================================ */
sec("4. quem nunca sai");
{
  /* vinte dias de promoções seguidas, com gente de laço e do grupo no elenco */
  const lacoNoElenco = EL.pessoas.find((p) => p.fonte === "doArco" || p.fonte === "recorrente");
  const grupoNoElenco = EL.pessoas.filter((p) => p.fonte === "doArco" || p.fonte === "recorrente").find((p) => p !== lacoNoElenco);
  const npcs = { [lacoNoElenco.nome]: firmarLaco(criarNPC(lacoNoElenco.nome, { conhecidoEm: 1 }), "amizade", 1) };
  let e = null;
  const promovidos = [];
  for (let i = 0; i < 20 && i < FIGS.length; i++) {
    npcs[FIGS[i].nome] = ficha(FIGS[i], 1);
    e = registrarVisto(registrarVisto(e, FIGS[i].nome, 2), FIGS[i].nome, 3);
  }
  const sairam = [];
  for (let dia = 10; dia < 30; dia++) {
    const r = promoverNoDia(SEM, MAPA, CTX, e, { npcs, grupo: [{ nome: grupoNoElenco.nome }], dia });
    e = r.estado; promovidos.push(...r.promovidos); sairam.push(...r.saidos.map((s) => s.nome));
  }
  const fonteDe = (n) => (EL.pessoas.find((p) => p.nome === n) || {}).fonte;
  console.log(`      20 dias: ${promovidos.length} subiram, ${sairam.length} saíram`);
  t("houve promoções", promovidos.length >= 10);
  t("ninguém da espinha nem nenhum chefe saiu", !sairam.some((n) => FONTES_QUE_NUNCA_SAEM.includes(fonteDe(n))));
  t("quem tem laço comigo não saiu", !sairam.includes(lacoNoElenco.nome));
  t("quem anda no grupo não saiu", !sairam.includes(grupoNoElenco.nome));
  const elF = elencoDoMundo(SEM, MAPA, { ...CTX, estado: e, npcs });
  t("o elenco continua com 24 depois de tudo", elF.pessoas.length === TAMANHO_DO_ELENCO);
  t("e cada promovido que ficou está lá", promovidos.filter((n) => !sairam.includes(n)).every((n) => elF.pessoas.some((p) => p.nome === n)));
}

/* ============================================================ */
sec("5. o convite igual, o registo e o Códex iguais");
{
  const a = FIGS[0];
  const npcs = { [a.nome]: ficha(a, 1) };
  const antes = JSON.stringify(npcs);
  const r = promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 4), { npcs, dia: 12 });
  t("o registo fica byte a byte igual (nada é escrito na ficha, nem o conhecidoEm)", JSON.stringify(npcs) === antes && npcs[a.nome].conhecidoEm === 1);
  const convivio = { dias: 12 - npcs[a.nome].conhecidoEm };
  const v1 = pesarConvite(indoleDe(SEM, npcs[a.nome]), { convivio, fama: 20 });
  const v2 = pesarConvite(indoleDe(SEM, { nome: a.nome }), { convivio, fama: 20 });
  t("o convite do promovido é exatamente o mesmo de antes de subir", r.promovidos[0] === a.nome && JSON.stringify(v1) === JSON.stringify(v2));
  for (const c of CENARIOS) {
    const s = registoSimulado(c);
    const n = Object.keys(s.npcs).length, texto = JSON.stringify(s.npcs);
    let e = vistosDaNarrativa(null, s.npcs, Object.keys(s.npcs).slice(0, 20).join(". "), 50);
    e = vistosDaNarrativa(e, s.npcs, Object.keys(s.npcs).slice(0, 20).join(". "), 60);
    promoverNoDia("mm8|mundo|0", s.mapa, { genero: G }, e, { npcs: s.npcs, dia: 70 });
    t(`${c.id}: o Códex conta o mesmo (${n}) e o registo não muda`, Object.keys(s.npcs).length === n && JSON.stringify(s.npcs) === texto);
  }
}

/* ============================================================ */
sec("6. os vistos, e o 'voltou' da MM8d");
{
  const npcs = { "Mira Vasconcelos": criarNPC("Mira Vasconcelos", {}), Bram: criarNPC("Bram", {}) };
  const e = vistosDaNarrativa(null, npcs, "Mira Vasconcelos serve a mesa; Bramido é o vento.", 3);
  t("a narração que cita o nome inteiro conta o dia", diasVistosDe(e, "Mira Vasconcelos") === 1);
  t("pedaço de palavra não conta (Bram dentro de Bramido)", diasVistosDe(e, "Bram") === 0);
  t("o mesmo dia não conta duas vezes", diasVistosDe(vistosDaNarrativa(e, npcs, "Mira Vasconcelos ri.", 3), "Mira Vasconcelos") === 1);
  const dois = vistosDaNarrativa(e, npcs, "Mira Vasconcelos volta.", 5);
  t("visto em 2 dias é investimento (fecha a MM8d)", investimentoDe(npcs["Mira Vasconcelos"], { vistos: dois.vistos }).includes("voltou"));
  t("visto num só, não", !investimentoDe(npcs["Mira Vasconcelos"], { vistos: e.vistos }).includes("voltou"));
  t("lixo nos vistos não derruba", [null, "x", 3].every((x) => Array.isArray(investimentoDe(npcs.Bram, { vistos: x }))));
}

/* ============================================================ */
sec("7. a saída em voz de mundo");
{
  const a = FIGS[0];
  const r = promoverNoDia(SEM, MAPA, CTX, vistoEm(a.nome, 2, 4), { npcs: { [a.nome]: ficha(a, 1) }, dia: 6 });
  const s = r.saidos[0];
  const na = (dia, cidade) => saidaParaPauta(SEM, MAPA, CTX, r.estado, { dia, cidade }).antes;
  t("na cidade de quem saiu, no dia seguinte, a pauta diz que ele deixou a cidade", na(7, s.cidade).length === 1 && na(7, s.cidade)[0] === `${s.nome} deixou ${s.cidade} ontem`);
  t("sem nome de mecanismo nenhum (nem elenco, nem promoção)", !/elenco|promov|sistema/i.test(na(7, s.cidade)[0]));
  t("noutra cidade, nada", na(7, "Cidade Nenhuma").length === 0);
  t(`passados ${PROMOCAO.saidaNaPauta} dias, a cena deixa de o dizer`, na(6 + PROMOCAO.saidaNaPauta + 1, s.cidade).length === 0);
  t("lixo não derruba", Array.isArray(saidaParaPauta(SEM, null, null, "x", null).antes) && Array.isArray(promoverNoDia(null, null, null, null, null).promovidos));
}

/* ============================================================ */
sec("8. a fiação no App.jsx (por texto, fim de linha normalizado)");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const linhaDe = (agulha) => { const i = app.indexOf(agulha); return i >= 0 ? app.slice(i, app.indexOf("\n", i)) : ""; };
  const blocoDe = (agulha, ateChars = 400) => { const i = app.indexOf(agulha); return i >= 0 ? app.slice(i, i + ateChars) : ""; };

  t("o import traz as quatro funções do elenco", app.includes('import { elencoDoMundo, elencoParaPovoar, garantirElencoDoSave, vistosDaNarrativa, promoverNoDia, saidaParaPauta } from "./elenco.js";'));
  t("o ref do save nasce vazio, ao lado do registo de pessoas", /const elencoSaveRef = useRef\(garantirElencoDoSave\(null\)\);/.test(app));

  const ctx = linhaDe("const contextoDoElenco = () =>");
  t("o contexto do elenco carrega o estado da promoção e o registo", ctx.includes("estado: elencoSaveRef.current") && ctx.includes("npcs: npcsRef.current"));
  const cacheChecagem = linhaDe("if (c && c.semente === semente");
  t("o cache por referência invalida quando o estado muda (senão o elenco fica velho depois de uma promoção)", cacheChecagem.includes("c.estado === ctx.estado"));
  const cacheGravacao = linhaDe("elencoCacheRef.current = { semente, mapa,");
  t("e a gravação do cache guarda esse mesmo estado", cacheGravacao.includes("estado: ctx.estado"));

  t("o save publica o campo novo `elenco`", app.includes("elencoMem: elencoMemRef.current, elenco: elencoSaveRef.current, aliados: aliadosRef.current,"));
  const sala = linhaDe("try { const { elenco: _elencoLocal, ...paraSala } = dados;");
  t("a sala recebe o save SEM a chave `elenco` — o protocolo da sala não muda nesta fase", sala.includes("publicarEstado(paraSala)") && !sala.includes("publicarEstado(dados)"));

  const load = linhaDe("elencoMemRef.current = garantirElenco(sv.elencoMem);");
  t("o load lê o campo pela mesma guarda que os outros (chave a chave, nunca por-in)", load.includes("elencoSaveRef.current = garantirElencoDoSave(sv.elenco);"));

  const capNovo = blocoDe("if (!cap) { canoneRef.current = {}; npcsRef.current = {}; setNpcs({});", 140);
  t("campanha nova zera o campo junto com o registo de pessoas", capNovo.includes("elencoSaveRef.current = garantirElencoDoSave(null);"));

  const vistoDoTurno = linhaDe('try { elencoSaveRef.current = vistosDaNarrativa(');
  t("uma vez por turno, o que a narração citou vira dia visto — calado se estourar", vistoDoTurno.includes("vistosDaNarrativa(elencoSaveRef.current, npcsRef.current, resp.narrativa, diaRef.current)") && vistoDoTurno.includes('calou("vistosDaNarrativa", e)'));

  const viradaDoDia = linhaDe("try { const r = promoverNoDia(");
  t("ao virar o dia, a promoção roda por dia passado — calada se estourar, nenhuma linha na tela", viradaDoDia.includes("promoverNoDia(sementeMundo(), mapaRef.current, contextoDoElenco(), elencoSaveRef.current,") && viradaDoDia.includes("elencoSaveRef.current = r.estado;") && viradaDoDia.includes('calou("promoverNoDia", e)') && !/pushMsgs/.test(viradaDoDia));

  const saidaNaPauta = linhaDe('try { p = porNaPauta(p, "antes", saidaParaPauta(');
  t("a saída entra na pauta antes do arquivista — calada se estourar", saidaNaPauta.includes("saidaParaPauta(sementeMundo(), mapaRef.current, contextoDoElenco(), elencoSaveRef.current,") && saidaNaPauta.includes('calou("saidaParaPauta", e)'));
  const iSaida = app.indexOf('try { p = porNaPauta(p, "antes", saidaParaPauta(');
  const iArquivista = app.indexOf('p = porNaPauta(p, "antes", arquivistaParaPauta(registroRef.current, {');
  t("nessa ordem: a saída antes do arquivista", iSaida >= 0 && iArquivista > iSaida);

  const chamadaGente = linhaDe("base: baseMundoRef.current, npcs: npcsRef.current, presentes: aqui,");
  t("genteParaPauta recebe o estado da promoção", chamadaGente.includes("estado: elencoSaveRef.current"));

  const rodape = linhaDe("const cena = resumoCenaPrompt(npcsRef.current, cidadeAtualRef.current, mapaRef.current,");
  t("o rodapé (resumoCenaPrompt) leva os dias vistos — investimento na cena", rodape.includes("vistos: elencoSaveRef.current.vistos"));
  const pessoasDoPrompt = linhaDe("resumoNPCsParaPrompt(npcsRef.current, undefined, {");
  t("as pessoas conhecidas (resumoNPCsParaPrompt) levam os mesmos dias vistos", pessoasDoPrompt.includes("vistos: elencoSaveRef.current.vistos"));

  t("nem a promoção nem a saída empurram mensagem para a tela (o sistema não fala de si mesmo — a saída só entra pela pauta)", ![viradaDoDia, saidaNaPauta].some((l) => l.includes("pushMsgs")));
}

console.log(`\nMM8e · a promoção: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
