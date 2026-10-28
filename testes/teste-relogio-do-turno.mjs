/* ============================================================
   O RELÓGIO DENTRO DO TURNO (T1-A, 5.ª fatia, 28/10/2026) — testes/teste-relogio-do-turno.mjs

   O defeito que a 4.ª fatia deixou anotado: `avancarMinutos` (o relógio do
   mundo, órgão do App) escreve na ficha por conta própria — a invocação
   cujo prazo acaba sai do grupo, a vigília longa demais vira Exaustão — e
   escrevia pelo `mudarFicha`, que lê a ficha do REF. Dentro do
   `aplicarResposta` o ref é a ficha de ANTES do turno: o débito, o dano, o
   achado vivem no `pers` local, que é o que o turno devolve e o save grava.
   Então:
     - o relógio tirava a invocação de uma ficha velha (o ref) e o `pers`
       local, ainda com ela, gravava-se por cima — a fera que se desfez
       voltava no save;
     - e no intervalo o ref (que o resto do turno lê) era a ficha velha sem
       as mudanças do turno.
   É a forma do defeito do achado (4.ª fatia, 6b1a45b) noutro sítio.

   Como se prova sem React: o código do App, à letra, corre em Node (o
   `mudarFicha`, o relógio e o bloco da chegada do `aplicarResposta`), com
   os refs trocados por objetos simples, as funções dos módulos de verdade,
   e dublês declarados para o que é tela (os `setX`, o `pushMsgs`) e para o
   motor da chegada (devolve 30 minutos de travessia).
   ============================================================ */
import { readFileSync } from "node:fs";
import { expirarPorMinuto } from "../src/invocacoes.js";
import { criarCondicao } from "../src/condicoes.js";
import { HORAS_AVISO_SONO, HORAS_EXAUSTO } from "../src/calendario.js";
import { notaComOTurno } from "../src/motor/aplicar.js";
/* (Fase T, trilha A) a conta do relógio e o que o tempo faz ao corpo saíram para o motor (src/motor/tempo-do-turno.js, provados byte a byte em teste-motor-tempo-do-turno); o recorte do App chama-os, e esta suíte dá-lhos no escopo — a intenção (a ficha do turno, não o ref) é a mesma */
import { osMinutosAndam, oCorpoNoRelogio, comAExaustao } from "../src/motor/tempo-do-turno.js";

const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const corte = (de, ate) => {
  const i0 = APP.indexOf(de);
  const i1 = APP.indexOf(ate, i0 + de.length);
  if (i0 < 0 || i1 < 0) throw new Error("não está onde estava: " + de.slice(0, 60));
  if (APP.indexOf(de, i0 + 1) >= 0) throw new Error("ambíguo: " + de.slice(0, 60));
  return APP.slice(i0, i1);
};
const MUDAR = corte("  const mudarFicha = (fn) => {", "  const [mensagens, setMensagens]");
const RELOGIO = corte("  const avancarMinutos = ", "  const mostrarRolagensRef = useRef(true);");
const CHEGADA = corte("    /* ---------------- A CHEGADA, NO MOTOR (T1-A, 4.ª fatia, 28/10) ----------------", "    /* ---------------- O PORTÃO, NO MOTOR");
/* (movido, T1-A 8.ª fatia: o trabalho, a queda e a entrega moram em src/motor/entrega-do-turno.js;
   a fiação da queda no aplicarResposta é a mesma — o `resolverQueda` sobre a ficha do turno, que
   volta ao ref e à tela quando muda —, e é ela que se recorta) */
const QUEDA = corte("    {\n      const antes = pers;\n      pers = resolverQueda(pers, msgs);", "    {\n      const daEntrega = aEntrega(");

const correr = new Function("S", `with (S) {
${MUDAR}
${RELOGIO}
${CHEGADA}
${QUEDA}
}`);

/* um caso: a ficha de antes do turno (o ref) tem 40 moedas e a fera; a do
   turno (o `pers` local) já pagou 10 — o débito do turno. A fera expira no
   minuto 500 do dia 1; o relógio está no 480 e a travessia leva 30. */
const montar = ({ acordouAbs = 470, expira = 500 } = {}) => {
  const fera = { nome: "Lobo Espectral", invocada: true, expiraMin: expira, vida: 12 };
  const antes = { nome: "Vera", nivel: 3, moedas: 40, vida: 20, vidaMax: 20, grupo: [fera], condicoes: [] };
  const doTurno = { ...antes, moedas: 30 };
  const ref = (v) => ({ current: v });
  const S = {
    expirarPorMinuto, criarCondicao, HORAS_AVISO_SONO, HORAS_EXAUSTO, notaComOTurno, osMinutosAndam, oCorpoNoRelogio, comAExaustao,
    personagem: antes, personagemRef: ref(antes), setPersonagem: () => {},
    minutoRef: ref(480), diaRef: ref(1), reinoRef: ref({}), combateRef: ref(null), notaRef: ref(""), acordouAbsRef: ref(acordouAbs),
    cidadeAtualRef: ref("Porto"), lugarRef: ref(null), mapaRef: ref({}), jornadaRef: ref(null),
    setMinuto: () => {}, setReino: () => {}, pushMsgs: () => {}, checarConquistas: () => {},
    avancarDiasReino: () => [], envelopeEventosReino: () => "", festivalDe: () => null, dataTxt: () => "",
    absMin: () => (S.diaRef.current - 1) * 1440 + S.minutoRef.current,
    fichaViva: () => S.personagemRef.current || S.personagem,
    aplicarAChegada: () => ({ estado: {}, efeitos: [], paraOCronista: [], msgs: ["🧭 Você está em Vila do Sul."], minutos: 30 }),
    aplicarOsEfeitos: () => {}, calou: (onde, e) => { S.calados.push(onde + ": " + (e && e.message)); },
    resolverQueda: (p) => p,
    resp: { narrativa: "Chegamos a Vila do Sul." }, pers: doTurno, msgs: [], calados: [],
  };
  return S;
};

sec("1 · a invocação que expira na travessia sai da ficha DO TURNO");
{
  const S = montar();
  correr(S);
  const nomes = (p) => ((p && p.grupo) || []).map((g) => g.nome);
  t("o relógio correu sem calar", S.calados.length === 0, S.calados.join(" | "));
  t("o turno devolve a ficha SEM a fera (é ela que o save grava)", !nomes(S.pers).includes("Lobo Espectral"), JSON.stringify(nomes(S.pers)));
  t("e com o débito do turno (30 moedas, não 40)", S.pers.moedas === 30, String(S.pers.moedas));
  t("o ref, que o resto do turno lê, é a ficha do turno (30 moedas)", (S.personagemRef.current || {}).moedas === 30, String((S.personagemRef.current || {}).moedas));
  t("o ref também já não tem a fera", !nomes(S.personagemRef.current).includes("Lobo Espectral"));
  t("a nota ao Narrador conta o desmanche", /INVOCAÇÃO ENCERRADA PELO SISTEMA/.test(S.notaRef.current));
}

sec("2 · a vigília longa vira Exaustão na ficha DO TURNO");
{
  /* acordado desde o minuto −800 do dia 1: 21h30 quando o relógio passa de 480 a 510 */
  const S = montar({ acordouAbs: -800, expira: 99999 });
  correr(S);
  const exausto = (p) => ((p && p.condicoes) || []).some((c) => c.id === "exausto");
  t("o turno devolve a ficha Exausta", exausto(S.pers));
  t("com o débito do turno", S.pers.moedas === 30, String(S.pers.moedas));
  t("e a fera, que ainda não expirou, fica", ((S.pers.grupo) || []).some((g) => g.nome === "Lobo Espectral"));
}

sec("3 · fora do turno, o relógio continua a escrever pelo `mudarFicha`");
{
  /* os outros ~30 sítios que andam o relógio (viagem, descanso, masmorra)
     não têm ficha de turno na mão: lá o ref é a verdade, e o relógio
     escreve nele como sempre */
  const S = montar();
  new Function("S", `with (S) {
${MUDAR}
${RELOGIO}
avancarMinutos(30);
}`)(S);
  t("sem ficha de turno, a fera sai do ref", !((S.personagemRef.current || {}).grupo || []).some((g) => g.nome === "Lobo Espectral"));
  t("e o ref conserva o que tinha (40 moedas)", (S.personagemRef.current || {}).moedas === 40);
}

sec("4 · dentro do aplicarResposta, nenhum relógio anda sem a ficha do turno");
{
  const corpo = semComentarios(corte("  const aplicarResposta = useCallback(", "  const mundoDasMissoes = "));
  const soltos = corpo.match(/avancarMinutos\(/g) || [];
  t("nenhuma chamada a `avancarMinutos` no corpo do turno", soltos.length === 0, soltos.length + " soltas");
  const comFicha = corpo.match(/avancarOsMinutos\([^)]*,\s*(pers|p2)\)/g) || [];
  /* (movido, T1-A 6.ª fatia: o rescaldo da luta (`avancarOsMinutos(MINUTOS_POS_COMBATE, p2).ficha`) saiu do App com o bloco do combate, para `aLutaDaResposta` (src/motor/luta-do-turno.js), que esta suíte não lê como texto — a catraca de teste-assercoes-de-texto. A intenção é a mesma, agora JOGADA pela luta de bolso de combate-bloco.mjs.) No App fica a chegada (1); o rescaldo joga-se: o relógio recebe a ficha do turno, e a que ele devolve é a que segue. */
  const { lutaDeBolso } = await import("./combate-bloco.mjs");
  const bolso = lutaDeBolso({ pers: { nome: "Vera", nivel: 2, moedas: 0, grupo: [] }, mudancas: { combate_encerrar: true }, combate: { inimigos: [{ nome: "Lobo", ameaca: "comum", vida: 0, vidaMax: 10, derrotado: true }] } },
    { avancarOsMinutos: (n, ficha) => ({ texto: "", ficha: { ...ficha, marcaDoRelogio: n } }) });
  const rel = bolso.chamou("avancarOsMinutos")[0];
  t("o rescaldo da luta e a chegada andam o relógio com a ficha do turno", comFicha.length >= 1 && !!rel && rel.args[1].moedas > 0 && bolso.saida.pers.marcaDoRelogio === rel.args[0], String(comFicha.length));
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
