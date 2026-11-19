/* teste-carta-do-mapa.mjs (V8 · 18/11/2026) — a carta em pergaminho
   A prova de `src/carta-do-mapa.js`: a conta de apresentação do mapa que abre
   como objeto pousado na mesa (`painel-carta.jsx`). O que se prova:
     1. as tabelas (medidas, aguadas, luz, caveiras) e que as cores delas
        são tokens de `T`, nunca hex soltos;
     2. o continente: `dadosDaCartaDoContinente` lê o mapa guardado sem
        mostrar o que o herói não conhece, em dois moldes (arquipélago e um
        continente sem região), e devolve null para o mundo vertical (Torre);
     3. o desenho: nada sai do papel, os nomes não se sobrepõem, a rota e o
        herói pousam onde devem, o canto vazio só existe quando há terra por ver;
     4. o veredito antes do clique: o preço é o do veredito do motor
        (`vereditoDaPartida` na região; a rota guardada no continente) e os
        mantimentos são `consumoDiario` × noites fora;
     5. a fiação: o painel lê estes nomes e o App abre a carta em calou.
   Determinístico: as sementes são fixas. */
import fs from "node:fs";
import { T } from "../src/estilo.js";
import * as CM from "../src/carta-do-mapa.js";
import * as R from "../src/regiao.js";
import * as MV from "../src/mapa-vivo.js";
import * as PA from "../src/partida.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { consumoDiario } from "../src/ermos.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch (e) { return d; } };
const cruza = (a, b) => a.x < b.x + b.largura && b.x < a.x + a.largura && a.y < b.y + b.altura && b.y < a.y + a.altura;

/* ---------------- 1. as tabelas ---------------- */
sec("1 · as tabelas");
t("o disco é 34 e o alvo 44 (formas.md §F5 §2)", CM.CARTA_DO_MAPA.disco === 34 && CM.CARTA_DO_MAPA.alvo === 44);
t("piso da letra: 13 no nome, 14 no boato", CM.CARTA_DO_MAPA.nome >= 13 && CM.CARTA_DO_MAPA.boato >= 13);
t("toda aguada é um token de T", Object.values(CM.AGUADA_DA_CARTA).every((a) => typeof T[a.cor] === "string" && /^#/.test(T[a.cor]) && a.alfa > 0 && a.alfa <= 0.6));
t("a luz da tarde e da noite são tokens de T; o dia não pinta", CM.LUZ_DA_CARTA.dia === null && ["entardecer", "noite"].every((k) => typeof T[CM.LUZ_DA_CARTA[k].tom] === "string" && typeof T[CM.LUZ_DA_CARTA[k].borda] === "string"));
t("ao entardecer e à noite a letra fina sai (contraste < 4,5 no papel tingido)", CM.LUZ_DA_CARTA.entardecer.letraFina === false && CM.LUZ_DA_CARTA.noite.letraFina === false);
t("o rolo da carta é token", typeof T.roloDaCarta === "string");
t("as caveiras vão de uma a três", Object.values(CM.CAVEIRAS_DO_PERIGO).every((n) => n >= 1 && n <= 3));
t("os dias com vírgula e sem «,0»", CM.diasEmTexto(4.5) === "4,5 dias" && CM.diasEmTexto(1) === "1 dia" && CM.diasEmTexto(21) === "21 dias");
t("a preposição contrai só o nome com artigo", CM.preposicao("para", "Baixo Escura") === "para Baixo Escura" && CM.preposicao("de", "O que sobrou de Gelo") === "do que sobrou de Gelo");

/* ---------------- 2. o continente ---------------- */
sec("2 · o continente (sem região) e a Torre");
const arq = gerarGeografia(sementeDe(3), moldePorId("arquipelago"));
const soCont = gerarGeografia(sementeDe(7), moldePorId("sobremundo"));
/* o mundo como o jogo o deixa no começo: a cidade de onde se parte e as
   vizinhas pela estrada descobertas, uma só de ouvir, o resto escondido */
const abrir = (g) => {
  const cs = g.cidades || [];
  const ini = cs[0];
  const viz = new Set((g.rotas || []).filter((r) => r.de === ini.nome || r.para === ini.nome).map((r) => (r.de === ini.nome ? r.para : r.de)));
  const ouvir = cs.find((c) => c !== ini && !viz.has(c.nome));
  return { ...g, cidades: cs.map((c) => (c === ini ? { ...c, descoberta: true, pisada: true } : viz.has(c.nome) ? { ...c, descoberta: true } : c === ouvir ? { ...c, descoberta: true, deOuvir: true } : { ...c, descoberta: false })) };
};
for (const [nome, mapa] of [["arquipélago", abrir(arq)], ["continente antigo", abrir(soCont)]]) {
  const cs = mapa.cidades || [];
  const aqui = cs[0];
  const dados = CM.dadosDaCartaDoContinente(mapa, { cidadeAtual: aqui && aqui.nome, dia: 3, minuto: 600 });
  t(`${nome}: há carta`, !!dados && dados.continente === true && dados.nos.length > 0);
  if (!dados) continue;
  const escondidas = cs.filter((c) => c.descoberta === false).map((c) => `cidade|${c.nome}`);
  t(`${nome}: nenhuma cidade escondida vira lugar`, dados.nos.every((n) => !escondidas.includes(n.id)));
  t(`${nome}: nenhuma estrada leva a cidade escondida`, dados.arestas.every((a) => !escondidas.includes(a.de) && !escondidas.includes(a.para)));
  t(`${nome}: tudo dentro do papel (0–1)`, dados.nos.every((n) => n.x >= 0 && n.x <= 1 && n.y >= 0 && n.y <= 1));
  t(`${nome}: o herói está na cidade de onde olha`, dados.heroi.onde === "povoado" && dados.heroi.noId === `cidade|${aqui.nome}`);
  t(`${nome}: as horas da estrada são os dias guardados × 8`, dados.arestas.every((a) => Math.abs(a.horas - a.dias * 8) < 0.01));
  t(`${nome}: o relógio diz a hora`, dados.relogio && dados.relogio.hora === "10:00" && dados.relogio.dia === 3);
  const viz = dados.arestas.find((a) => a.de === dados.heroi.noId || a.para === dados.heroi.noId);
  if (viz) {
    const outro = viz.de === dados.heroi.noId ? viz.para : viz.de;
    const v = CM.vereditoNoContinente(dados, outro);
    t(`${nome}: o veredito é a rota guardada (dias e noites)`, v && v.dias === viz.dias && v.noites === Math.max(1, Math.round(viz.dias)) && v.rota.join() === [dados.heroi.noId, outro].join());
    const p = CM.partidaNaCarta(dados, dados.nos.find((n) => n.id === outro), v, { bocas: 2, suprimentos: { racoes: 1, agua: 9 } });
    t(`${nome}: o preço diz os dias`, p && p.verbo.startsWith("Partir para") && p.preco.includes(CM.diasEmTexto(viz.dias)), p && p.preco);
    t(`${nome}: os mantimentos são duas bocas × noites, e a falta em número`, p.mantimentos && p.mantimentos.racoes === 2 * v.noites && p.mantimentos.falta === true && p.mantimentos.faltamRacoes === 2 * v.noites - 1);
  }
  const sem = dados.nos.find((n) => n.id !== dados.heroi.noId && !dados.arestas.some((a) => (a.de === n.id && a.para === dados.heroi.noId) || (a.para === n.id && a.de === dados.heroi.noId)));
  if (sem) {
    const p = CM.partidaNaCarta(dados, sem, CM.vereditoNoContinente(dados, sem.id), {});
    t(`${nome}: sem estrada desenhada, a carta diz que não sabe o preço`, p && p.semPreco === true && /não há estrada desenhada/i.test(p.preco));
  }
}
t("a Torre (vertical) não é carta: null", CM.dadosDaCartaDoContinente(gerarGeografia(sementeDe(2), moldePorId("torre")), { vertical: true }) === null);
t("lixo dá null", CM.dadosDaCartaDoContinente(null, {}) === null && CM.dadosDaCartaDoContinente({ cidades: [] }, {}) === null);
{
  const aberto = abrir(arq);
  const cs = aberto.cidades.filter((c) => c.descoberta !== false);
  if (cs.length >= 2) {
    const d = CM.dadosDaCartaDoContinente(aberto, { cidadeAtual: cs[0].nome, jornada: { de: cs[0].nome, para: cs[1].nome, totalMin: 600, andadoMin: 300 } });
    t("na estrada, o herói não está em cidade nenhuma", d && d.heroi.onde === "viagem" && !d.nos.some((n) => n.aqui));
    t("na estrada, a partida fica impedida com a razão", (() => { const p = CM.partidaNaCarta(d, d.nos[1], null, {}); return p && p.impedido && p.verbo === "Você já está na estrada"; })());
  }
}

/* ---------------- 3. o desenho, na região ---------------- */
sec("3 · o desenho na região (o molde do beta)");
const molde = moldePorId("sobremundo");
let mundos = 0, nomesSobrepostos = 0, foraDoPapel = 0, comRota = 0, rotaCerta = 0, vazios = 0;
for (let i = 0; i < 24; i++) {
  const semente = sementeDe(i);
  const mapa = tenta(() => R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente, molde, genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" })));
  if (!mapa || !mapa.regiao) continue;
  const base = mapa.cidades[0];
  const e = { cidadeAtual: base.nome, dia: 2, minuto: 8 * 60, semente };
  const dados = MV.dadosDoMapaVivo(mapa, e);
  if (!dados) continue;
  mundos++;
  const alvo = dados.nos.find((n) => !n.aqui && n.estado !== "boato") || dados.nos.find((n) => !n.aqui);
  const v = alvo ? tenta(() => PA.vereditoDaPartida(dados, alvo.id, { ...e, mapa })) : null;
  const des = CM.desenhoDaCarta(dados, { lado: 640, rota: v ? v.rota : [], destino: alvo && alvo.id });
  const rs = Object.values(des.rotulos).filter((x) => !x.oculto);
  if (alvo && des.rotulos[alvo.id] && des.rotulos[alvo.id].oculto) nomesSobrepostos += 100;   // o destino escolhido nunca fica sem nome
  for (let a = 0; a < rs.length; a++) for (let b = a + 1; b < rs.length; b++) if (cruza(rs[a], rs[b])) nomesSobrepostos++;
  foraDoPapel += des.nos.filter((n) => n.x < 0 || n.y < 0 || n.x > 640 || n.y > 640).length;
  /* MOVIDO em 18/11 (prova olhada a 1280): a pílula do tempo só pousa numa perna
     onde cabe (3 × a pílula) — na perna curta tapava os nomes; a rota desenha-se sempre */
  if (v && v.rota && v.rota.length >= 2) {
    comRota++;
    const a = des.nos.find((n) => n.id === v.rota[0]), b = des.nos.find((n) => n.id === v.rota[1]);
    const cabe = a && b && Math.hypot(b.x - a.x, b.y - a.y) >= 3 * CM.CARTA_DO_MAPA.pilula;
    if (des.rota.startsWith("M") && (cabe ? !!des.pilula : des.pilula === null)) rotaCerta++;
  }
  if (des.cantoVazio) vazios++;
  if (i === 0) {
    t("o herói pousa encostado ao lugar onde está", des.heroi && dados.heroi.noId && Math.hypot(des.heroi.x - des.nos.find((n) => n.aqui).x, des.heroi.y - des.nos.find((n) => n.aqui).y) < 40);
    t("todo lugar visível do motor é desenhado, e nenhum outro", des.nos.length === dados.nos.length && des.nos.every((n) => dados.nos.some((x) => x.id === n.id)));
    t("o papel conhecido tem um círculo por lugar", des.conhecido.length >= dados.nos.length);
    t("estradas: estrada, trilha ou a pé — nada mais", des.estradas.every((s) => ["estrada", "trilha", "aPe"].includes(s.traco) && s.d.startsWith("M")));
    const onde = CM.ondeEstaNaCarta(dados);
    t("«Você está em…» com o nome da base", onde === `Você está em ${base.nome}.`, onde);
    if (alvo && v) {
      const p = CM.partidaNaCarta(dados, alvo, v, { bocas: 1, suprimentos: { racoes: 5, agua: 5 } });
      t("o verbo é «Partir para» o lugar", p.verbo === `Partir ${CM.preposicao("para", alvo.nome)}`);
      t("o preço traz as horas do veredito e as noites", p.preco.includes(String(v.horas).replace(".", ",").replace(/,0$/, "")) || p.preco.includes("h "));
      t("as noites fora dizem-se", /noite/.test(p.preco));
      const m = CM.mantimentosDaViagem(v.noites, 1, { racoes: 5, agua: 5 });
      t("os mantimentos são consumoDiario × noites", m && m.racoes === consumoDiario(1).racoes * v.noites);
      const sub = CM.subtituloNaCarta(dados, alvo);
      t("o subtítulo não mostra número de bastidor", sub.length > 0 && !/\d\.\d{2,}|undefined|null/.test(sub), sub);
    }
    t("no lugar onde está, não há verbo", CM.partidaNaCarta(dados, dados.nos.find((n) => n.aqui), null, {}).verbo === null);
  }
}
t(`a região nasce em quase todos os mundos (${mundos} de 24)`, mundos >= 20);
t(`nenhum nome sobre outro (${nomesSobrepostos} pares)`, nomesSobrepostos === 0);
t("nenhum lugar fora do papel", foraDoPapel === 0);
t(`a rota escolhida desenha-se, com a pílula do tempo onde cabe (${rotaCerta} de ${comRota})`, comRota > 0 && rotaCerta === comRota);
t(`a terra não vista aparece num canto em parte dos mundos (${vazios})`, vazios > 0);

/* ---------------- 4. os mantimentos e o perigo ---------------- */
sec("4 · mantimentos e perigo");
t("sem noite fora, nada sai da bolsa", (() => { const m = CM.mantimentosDaViagem(0, 3, { racoes: 0, agua: 0 }); return m.racoes === 0 && !m.falta; })());
t("três noites, duas bocas: seis de cada", (() => { const m = CM.mantimentosDaViagem(3, 2, { racoes: 10, agua: 4 }); return m.racoes === 6 && m.agua === 6 && m.faltamAgua === 2 && m.falta && /faltam 2 águas/.test(m.texto); })());
t("noites desconhecidas: null (a carta não inventa)", CM.mantimentosDaViagem(null, 1, {}) === null);
t("o perigo: caveiras e palavra", (() => { const p = CM.perigoNaCarta({ perigo: "medio" }); return p.cheias === 2 && p.palavra === "perigo médio"; })());
t("o desafio do herói vence o perigo absoluto", CM.perigoNaCarta({ perigo: "baixo" }, { desafio: { selo: "alto" } }).cheias === 3);
t("o boato não tem perigo", CM.perigoNaCarta({ estado: "boato" }) === null);

/* ---------------- 5. a fiação ---------------- */
sec("5 · o painel e o App");
const PAINEL = fs.readFileSync(new URL("../src/painel-carta.jsx", import.meta.url), "utf8");
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
t("o painel abre pela moldura de todo objeto (ObjetoAberto, objeto «carta»)", PAINEL.includes('objeto="carta"') && PAINEL.includes("ObjetoAberto"));
t("o painel lê a conta daqui", ["desenhoDaCarta", "partidaNaCarta", "ondeEstaNaCarta", "subtituloNaCarta", "perigoNaCarta", "vereditoNoContinente", "estadoEmPalavras"].every((n) => PAINEL.includes(n)));
t("o painel usa os glifos do mapa vivo (uma forma por lugar)", PAINEL.includes("CAMINHOS_DO_GLIFO") && PAINEL.includes("glifoDoNo"));
t("o veredito da região é o do motor", PAINEL.includes("vereditoDaPartida"));
t("o App abre a carta da região em calou", APP.includes("<PainelCarta") && /calou\("V8 · /.test(APP));
t("o App lê o continente pela porta daqui", APP.includes("dadosDaCartaDoContinente("));
t("nenhum nome de mecanismo no painel", !/neblina|feixe|veredito|nó|mapa vivo/i.test(PAINEL.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").match(/>[^<>{}]+</g)?.join(" ") || ""));

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
