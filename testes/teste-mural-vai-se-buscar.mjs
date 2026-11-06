/* ============================================================
   O MURAL VAI-SE BUSCAR (Fase SQ · SQ4, 05/11/2026) — testes/teste-mural-vai-se-buscar.mjs

   A pessoa: «o mural pode continuar em funcionamento gerando mini quests
   pra caso o player deseje upar ou algo do tipo, mas também tem que ser
   liberado a partir de um certo lvl, quando já tiver sido inserido no
   mundo e na história, assim evitamos ruídos e confusões».

   O que se prova:
     1. o mural aberto não chama ninguém — a aba abre sem linha no relato,
        o encher do mural não escreve linha, e a soleira não oferece papel
        pregado;
     2. o mural fechado dá a linha da tabela (FALAS_DO_PORTAO), no painel
        dele e no trabalho da casa, e a aba abre (calada) para ela se ler;
     3. a linha não nomeia nenhum mecanismo.
   O App lê-se pelo texto (é tela, e a catraca só proíbe ler o motor).
   ============================================================ */
import fs from "node:fs";
import { PORTAO_DAS_SECUNDARIAS, FALAS_DO_PORTAO, falaDoPortao, secundariasAbertas } from "../src/portao-das-secundarias.js";
import { abrirAbertura } from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { MOLDES } from "../src/moldes.js";
import * as A from "../src/abas.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const GUILDA = fs.readFileSync(new URL("../src/painel-guilda.jsx", import.meta.url), "utf8");
const corpoApos = (txt, ancora, n = 4000) => { const i = txt.indexOf(ancora); return i < 0 ? "" : txt.slice(i, i + n); };
/* o corpo de uma arrow até ao fecho dela no mesmo recuo ("  };") */
const funcao = (ancora) => { const i = APP.indexOf(ancora); if (i < 0) return ""; const j = APP.indexOf("\n  };", i); return APP.slice(i, j); };

/* uma campanha nova, como o `iniciar` do App a monta (a de teste-portao) */
const semente = "Prova SQ4|mural";
const M = MOLDES[0];
const mapa = gerarGeografia(semente, M);
const cidade = mapa.cidades[0].nome;
const espinha = estenderEspinha({ semente, mapa, molde: M, estrutura: "jornada", cidadeInicial: cidade });
const abertura = (abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente: "", molde: M, nivel: 1, dia: 1 }) || {}).abertura;
const fechado = secundariasAbertas({ abertura, espinha, nivel: 1 });
const aberto = secundariasAbertas({ abertura, espinha, nivel: 3 });

sec("1. O mural aberto não chama ninguém");
{
  t("a campanha nova: mural fechado ao nível 1, aberto ao 3", fechado.mural === false && aberto.mural === true);
  const mural = A.SUBS_GESTAO.find((s) => s.id === "mural");
  t("a aba do mural é calada", !!mural && mural.calada === true);
  t("abrir o mural não dá linha no relato (novidades cala-o)", A.abrir([], { temMural: true }).includes("mural") && A.novidades([], A.abrir([], { temMural: true })).length === 0);
  t("e as outras abas continuam a dizer-se", A.novidades([], A.abrir([], { cartas: 1, temMural: true })).join(",") === "correio");
  /* o encher do mural (garantirMural, o descanso longo, o botão de procurar) */
  const gm = funcao("const garantirMural = (forcar = false) => {");
  t("o mural enche-se sem escrever no relato (garantirMural não tem pushMsgs)", gm.length > 300 && gm.includes("setMural(muralRef.current)") && !/pushMsgs/.test(gm));
  t("a tabela diz que a soleira não oferece papel pregado", PORTAO_DAS_SECUNDARIAS.naSoleira === false);
  const soleira = corpoApos(APP, "const ofertasDaSoleira = () => {", 40000);
  t("a soleira lê a tabela: aberto, o papel pregado não se oferece ali",
    soleira.includes("const muralDoPortao = portaoAgora().mural && PORTAO_DAS_SECUNDARIAS.naSoleira === true;")
    && soleira.includes("&& muralDoPortao)) {"));
}

sec("2. O mural fechado diz porquê, na voz do mundo");
{
  t("fechado: o painel do mural dá a linha da tabela", falaDoPortao("mural", fechado) === FALAS_DO_PORTAO.mural && FALAS_DO_PORTAO.mural.length > 12);
  t("fechado: o trabalho da casa dá a sua", falaDoPortao("casa", fechado) === FALAS_DO_PORTAO.casa && FALAS_DO_PORTAO.casa.length > 12);
  t("aberto: nenhuma linha — o painel mostra o de sempre", falaDoPortao("mural", aberto) === "" && falaDoPortao("casa", aberto) === "");
  t("lixo e lugar sem linha: nunca estoura, nunca inventa", [null, undefined, 7, "x", {}].every((p) => falaDoPortao("mural", p) === "") && falaDoPortao("praca", fechado) === "");
  t("a tabela não se muda por fora", Object.isFrozen(FALAS_DO_PORTAO));
  t("numa cidade, o mural fechado abre a aba (calada) para a linha se ler", A.abrir([], { muralFechado: true }).includes("mural") && A.novidades([], A.abrir([], { muralFechado: true })).length === 0);
  t("o App monta o sinal da aba com o portão de agora", /muralFechado: \(\(\) => \{ try \{ return !!cidadeAtualRef\.current && muralFechadoAgora\(\);/.test(APP));
  /* um «procurar cartazes» que volta vazio é botão morto: a linha fechada
     vale enquanto QUALQUER das duas portas do mural (MM13 e o portão) o fecha */
  const mf = funcao("const muralFechadoAgora = (p = portaoAgora()) => {");
  t("o mural fechado lê as duas portas: o portão e a MM13", mf.includes("!p.mural || !muralLiberado({ abertura: aberturaMundoRef.current, missoes: missoesRef.current })"));
  t("o App passa as duas falas ao painel", APP.includes('falaDoPortao("mural", { ...p, mural: !muralFechadoAgora(p) })') && APP.includes('falaDoPortao("casa", p)') && APP.includes("<PainelLateral portaoFechado={portaoFechadoAgora()}"));
  const pm = corpoApos(APP, "function PainelMural({", 20000);
  t("o painel do mural mostra a linha fechada no lugar do «procurar cartazes»", pm.includes('fechado = ""') && pm.includes("{fechado && doMundo.length === 0 ? ("));
  t("a casa mostra a sua no lugar do «nada para o seu posto»", GUILDA.includes('{trabalhosFechados || "Nada para o seu posto agora. Volte depois de uns dias."}'));
}

sec("3. A linha não nomeia nenhum mecanismo");
{
  /* o sistema não fala de si mesmo: nem o nome da regra, nem o número
     dela, nem a palavra de jogo que o jogador leria como trava */
  const MECANISMO = /n[ií]vel|lvl|\bxp\b|port[aã]o|desbloque|liberad|secund[aá]ri|miss[aã]o|quest|mural|introdu|\d/i;
  for (const [onde, f] of Object.entries(FALAS_DO_PORTAO)) t(`«${f}» (${onde}) não nomeia mecanismo`, !MECANISMO.test(f), f);
}

console.log(`\nmural-vai-se-buscar: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
