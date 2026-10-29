/* ============================================================
   O TEMPO DO TURNO, NO MOTOR (Fase T, trilha A, 28/10/2026) — testes/teste-motor-tempo-do-turno.mjs

   A conta do relógio (`avancarOsMinutos`: os minutos, os dias que viram, a
   invocação que vence, a vigília longa) e o passo na cidade
   (`moverParaLocal`: o lugar, os minutos da caminhada, a linha e a nota)
   saíram do App para src/motor/tempo-do-turno.js. Aqui são provados byte a
   byte contra os de antes: `tempo-dourado.json` é o que o App de 7a0d8b2
   fez — os dois órgãos recortados à letra — sobre os 275 casos de
   `tempo-bloco.mjs`; e esta suíte recorta do App de HOJE a fiação que
   ficou e corre-a, com as peças puras, sobre os mesmos casos.

   E a prova tem de morder: o dia que não vira, o corpo que lê o dia de
   antes, a fera desfeita no meio da luta, a Exaustão escrita só no ref, a
   caminhada calada, o lugar sem o mapa — as fotos TÊM de divergir.

   E a sessão que o jogo gravou (testes/sessao-navegador.json): o tempo
   da ação e o passo na cidade, corridos sobre o estado gravado do turno
   anterior, têm de dar o minuto que o App gravou — o campo que era dívida.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDoTempo, blocoComoFuncao, correrOBloco, fotoDoTempo, casosDoTempo, BLOCOS } from "./tempo-bloco.mjs";
import { osMinutosAndam, oCorpoNoRelogio, comAExaustao, oPassoNaCidade, aCidadeSobOsPes, oTempoDoTurno, oPassoDoReplay, minutoAbsoluto, RELOGIO_DO_DIA, TEMPO_DA_CAMINHADA, ESCALA_DE_PASSAR_O_TEMPO, aEscalaDoTempo, aChanceDoClimaAoPassar, CHANCES_DA_NOITE } from "../src/motor/tempo-do-turno.js";
import { lugarPedido } from "../src/lugar.js";
import { estadoNoTurno } from "../src/sessao.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./tempo-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDoTempo(N_CASOS);
const recorte = recorteDoTempo(APP);
const hoje = Object.fromEntries(BLOCOS.map((b) => [b, blocoComoFuncao(recorte[b])]));
const fotosDeHoje = (bloco, fn) => casos.map((k) => fotoDoTempo(correrOBloco(fn || hoje[bloco], k, { novo: true, bloco })));
const divergem = (bloco, novas) => novas.filter((f, i) => !igual(f, D.blocos[bloco][i])).length;
const trocado = (bloco, de, para) => {
  const r = recorte[bloco];
  if (r.orgaos.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  return blocoComoFuncao({ ...r, orgaos: r.orgaos.replace(de, para) });
};

sec("1 · os dois órgãos, byte a byte contra os de antes");
t(`o dourado é do commit de antes (7a0d8b2), ${N_CASOS} casos em cada bloco`, D.commit === "7a0d8b2" && BLOCOS.every((b) => (D.blocos[b] || []).length === N_CASOS));
for (const bloco of BLOCOS) {
  const fotos = D.blocos[bloco];
  const novas = fotosDeHoje(bloco);
  const batem = novas.filter((f, i) => igual(f, fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, fotos[i]));
  t(`${bloco}: ${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 400)} | antes ${JSON.stringify(fotos[primeira]).slice(0, 400)}` : "");
  t(`${bloco}: determinista`, igual(fotosDeHoje(bloco).slice(0, 60), novas.slice(0, 60)));
  t(`${bloco}: nenhum nome sem dublê, antes ou hoje`, [...fotos, ...novas].every((f) => !f.faltas.length), [...new Set(novas.flatMap((f) => f.faltas))].join(", "));
}
{
  const R = D.blocos.relogio, C = D.blocos.caminhada;
  const linhas = R.flatMap((x) => x.tela.flat());
  const conta = (re) => linhas.filter((l) => re.test(l)).length;
  const viraram = R.filter((x, i) => x.dia !== casos[i].dia).length;
  console.log(`      o dia vira ${viraram} · a Exaustão ${conta(/Exaustão/)} · o aviso do sono ${conta(/acordado há/)} · a fera desfeita ${conta(/desfa/)} · o festival ${conta(/Hoje é/)} · o reino ${conta(/👑/)} · o passo que houve ${C.filter((x, i) => !igual(x.lugar, casos[i].lugar)).length}`);
  t("percorre os ramos (o dia que vira, a Exaustão, o aviso, a invocação, o festival, o passo)", viraram > 40 && conta(/Exaustão/) > 20 && conta(/acordado há/) > 10 && conta(/desfa/) > 20 && conta(/Hoje é/) > 3 && C.filter((x, i) => !igual(x.lugar, casos[i].lugar)).length > 100);
  t("nenhum bloco estoura, antes ou hoje", BLOCOS.every((b) => D.blocos[b].every((x) => !x.erro)));
}

sec("2 · a prova morde");
{
  const semDia = divergem("relogio", fotosDeHoje("relogio", trocado("relogio", "for (const aoVirar of rel.aoVirar) {", "for (const aoVirar of []) {")));
  t(`o dia que não vira (sem a porta do reino): ${semDia} fotos divergem`, semDia > 40);
  const diaVelho = divergem("relogio", fotosDeHoje("relogio", trocado("relogio", "dia: diaRef.current, minuto: minutoRef.current", "dia: diaRef.current - rel.dias, minuto: minutoRef.current")));
  t(`o corpo que lê o dia de antes de virar: ${diaVelho} fotos divergem`, diaVelho > 20);
  const naLuta = divergem("relogio", fotosDeHoje("relogio", trocado("relogio", "combate: combateRef.current, ficha:", "combate: null, ficha:")));
  t(`a fera desfeita no meio da luta: ${naLuta} fotos divergem`, naLuta > 3);
  const soNoRef = divergem("relogio", fotosDeHoje("relogio", trocado("relogio", "naFicha(comAExaustao);", "mudarFicha(comAExaustao);")));
  t(`a Exaustão escrita fora da ficha do turno: ${soNoRef} fotos divergem`, soNoRef > 10);
  const calada = divergem("caminhada", fotosDeHoje("caminhada", trocado("caminhada", "if (passo.caminhadaNaTela && t)", "if (false && t)")));
  t(`a caminhada calada na tela: ${calada} fotos divergem`, calada > 20);
  const semMapa = divergem("caminhada", fotosDeHoje("caminhada", trocado("caminhada", "mapa: mapaRef.current }, alvo)", "mapa: null }, alvo)")));
  t(`o lugar sem o mapa (sem âncora): ${semMapa} fotos divergem`, semMapa > 40);
  const semTempo = divergem("caminhada", fotosDeHoje("caminhada", trocado("caminhada", "avancarMinutos(passo.minutos)", "avancarMinutos(0)")));
  t(`o passo que não cobra o tempo: ${semTempo} fotos divergem`, semTempo > 100);
}

sec("3 · as peças, sozinhas");
{
  t("o dia tem 1440 minutos, e vira quantas vezes for preciso", RELOGIO_DO_DIA.minutosDoDia === 1440 && igual(osMinutosAndam({ minuto: 1435 }, 10), { minuto: 5, dias: 1, aoVirar: [5] }) && igual(osMinutosAndam({ minuto: 0 }, 3000), { minuto: 120, dias: 2, aoVirar: [1560, 120] }));
  t("a caminhada é tabela (cômodo 1, dentro 5, arredor sem minutos 40)", TEMPO_DA_CAMINHADA.comodo === 1 && TEMPO_DA_CAMINHADA.dentro === 5 && TEMPO_DA_CAMINHADA.arredores === 40);
  const mapa = { cidades: [{ nome: "Vila", x: 10, y: 10 }] };
  const ler = { cidadeAtual: "Vila", lugar: null, dia: 3, mapa };
  const arr = oPassoNaCidade(ler, { nome: "o moinho", onde: "arredores", minutos: 33 });
  t("o arredor cobra os minutos dele e diz o relógio na tela", arr && arr.minutos === 33 && arr.caminhadaNaTela && arr.lugar.distancia === "arredores");
  const com = oPassoNaCidade(ler, { nome: "o quarto", onde: "comodo", dentroDe: "a taverna" });
  t("o cômodo é um minuto, e a nota diz o prédio", com && com.minutos === 1 && !com.caminhadaNaTela && com.nota.includes("dentro"));
  t("onde já está não é passo (o nome sem acento é o mesmo)", oPassoNaCidade({ ...ler, lugar: { nome: "A Forjá" } }, { nome: "a forja", onde: "dentro" }) === null);
  t("sem cidade ou sem alvo não há passo; leituras `null` não estouram", oPassoNaCidade(ler, null) === null && oPassoNaCidade({ ...ler, cidadeAtual: null }, { nome: "x" }) === null && oPassoNaCidade(null, null) === null && aCidadeSobOsPes(null) === null && !!oCorpoNoRelogio(null, 5) && !!osMinutosAndam(null, 5));
  t("a cidade sob os pés é a do mapa, sem caixa", aCidadeSobOsPes({ cidadeAtual: "vila", mapa }).nome === "Vila");
  const fera = { nome: "H", grupo: [{ nome: "Lobo", invocada: true, expiraMin: 100 }], condicoes: [] };
  const abs = (h) => minutoAbsoluto(1, h);
  t("a fera vence fora da luta, e não dentro dela", !!oCorpoNoRelogio({ ficha: fera, dia: 1, minuto: 200, acordouAbs: 150 }, 5).fim && !oCorpoNoRelogio({ ficha: fera, combate: {}, dia: 1, minuto: 200, acordouAbs: 150 }, 5).fim);
  const ex = oCorpoNoRelogio({ ficha: { condicoes: [] }, dia: 2, minuto: 0, acordouAbs: abs(0) - 1440 + 1440 - 21 * 60 }, 5);
  t("as 20 h trazem a Exaustão, e quem já está cansado não a ouve de novo", ex.exausto && !oCorpoNoRelogio({ ficha: comAExaustao({ condicoes: [] }), dia: 2, minuto: 0, acordouAbs: 1440 - 21 * 60 }, 5).exausto);
  t("o aviso das 16 h só no turno que as atravessa", oCorpoNoRelogio({ ficha: {}, dia: 1, minuto: 16 * 60 + 2, acordouAbs: 0 }, 5).aviso && !oCorpoNoRelogio({ ficha: {}, dia: 1, minuto: 16 * 60 + 10, acordouAbs: 0 }, 5).aviso);
  t("a Exaustão é uma só na ficha", comAExaustao(comAExaustao({ condicoes: [] })).condicoes.filter((c) => c.id === "exausto").length === 1);
  t("só a pergunta não anda o relógio (MM14), nem o envelope do sistema", oTempoDoTurno({ minuto: 100, dia: 1 }, { frase: "Quem é Doran?" }).minuto === 100 && oTempoDoTurno({ minuto: 100, dia: 1 }, { toque: { tipo: "envelope" } }).minuto === 100 && oTempoDoTurno({ minuto: 100, dia: 1 }, { frase: "vou à forja" }).minuto === 105);
  t("na luta o relógio do turno não anda (a rodada tem o seu)", oTempoDoTurno({ minuto: 100, dia: 1, combate: {} }, { frase: "vou à forja" }).minuto === 100);
  t("o replay vira o dia com o relógio", igual((({ minuto, dia }) => ({ minuto, dia }))(oTempoDoTurno({ minuto: 1438, dia: 4 }, { frase: "ando" })), { minuto: 3, dia: 5 }));
}

sec("4 · a sessão que o jogo gravou: o tempo do motor dá o minuto que o App gravou");
{
  const A = JSON.parse(fs.readFileSync(new URL("./sessao-navegador.json", import.meta.url), "utf8"));
  let batem = 0;
  const falhas = [];
  for (let n = 1; n <= A.turnos.length; n++) {
    const antes = estadoNoTurno(A, n - 1), depois = estadoNoTurno(A, n);
    const en = A.turnos[n - 1].entrada || {};
    let E = oTempoDoTurno(antes, en);
    const alvo = typeof en.frase === "string" && Array.isArray(en.lugaresDaqui) ? lugarPedido(en.frase, en.lugaresDaqui) : null;
    if (alvo) E = oPassoDoReplay(E, alvo);
    if (E.minuto === depois.minuto && E.dia === depois.dia) batem++; else falhas.push(`turno ${n}: ${E.dia}/${E.minuto} · gravado ${depois.dia}/${depois.minuto}`);
  }
  t(`o minuto e o dia nos ${A.turnos.length} turnos gravados: ${batem}/${A.turnos.length} iguais ao que o App gravou`, batem === A.turnos.length, falhas.join(" | "));
}

sec("5 · passar o tempo e a noite: a escala e as chances, contra a regra que estava no App");
{
  /* A REGRA DE ANTES, à letra (App de 48ce543, passarTempo e o fim do
     descanso): é o dourado destes números. A escala e as chances são
     comparadas em toda meia hora de -1 a 48, nas fronteiras de perto
     (2,999…, 3, 3,0001) e no que não é número. */
  const antigaEscala = (horas) => horas <= 3 ? "algumas horas (mudanças pequenas)" : horas <= 8 ? "boa parte do dia (mudanças perceptíveis)" : horas <= 16 ? "quase um dia inteiro (mudanças significativas)" : "um dia completo (o mundo se move bastante)";
  const antigaChance = (horas) => (horas >= 8 ? 0.65 : 0.35);
  const H = [];
  for (let h = -1; h <= 48; h += 0.5) H.push(h);
  for (const f of [3, 8, 16]) H.push(f - 1e-9, f + 1e-4);
  H.push(NaN, Infinity, -Infinity, 0, 24, 72);
  t("a escala de cada hora é a do App de antes (" + H.length + " horas)", H.every((h) => aEscalaDoTempo(h) === antigaEscala(h)), String(H.find((h) => aEscalaDoTempo(h) !== antigaEscala(h))));
  t("a chance do clima ao passar é a do App de antes", H.every((h) => aChanceDoClimaAoPassar(h) === antigaChance(h)));
  t("a noite longa: o clima a 0,6 e o sonho a 0,25, como no App de antes", CHANCES_DA_NOITE.clima === 0.6 && CHANCES_DA_NOITE.sonho === 0.25);
  t("a escala tem quatro degraus, do menor ao sem teto", ESCALA_DE_PASSAR_O_TEMPO.length === 4 && ESCALA_DE_PASSAR_O_TEMPO.map((e) => e.ateHoras).join() === "3,8,16,Infinity" && Object.isFrozen(ESCALA_DE_PASSAR_O_TEMPO));
  /* a prova morde: um degrau mudado de 8 para 9 h aparece nas horas comparadas */
  const mordida = (horas) => horas <= 3 ? antigaEscala(1) : horas <= 9 ? antigaEscala(5) : antigaEscala(horas);
  t("a prova morde: o degrau de 8 h posto em 9 muda " + H.filter((h) => mordida(h) !== aEscalaDoTempo(h)).length + " horas", H.filter((h) => mordida(h) !== aEscalaDoTempo(h)).length > 0);
  /* o App chama as peças: a escala e as chances já não são literais lá */
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o App pede a escala, a chance do clima e as da noite ao motor", APP.includes("const escala = aEscalaDoTempo(horas);") && APP.includes("talvezMudarClima(aChanceDoClimaAoPassar(horas))") && APP.includes("talvezMudarClima(CHANCES_DA_NOITE.clima)") && APP.includes("sorteDoTurno(\"sonho\")() < CHANCES_DA_NOITE.sonho"));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
