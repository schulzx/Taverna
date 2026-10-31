/* ============================================================
   O CRONISTA E O PEDIDO ACEITO (31/10/2026, a 13.ª sessão) — testes/teste-cronista-contra-o-pedido.mjs

   Na 13.ª a heroína aceitou o pedido de Corrado — o do sistema, «meio dia de
   desvio a uma campa» (045b26b pôs-lho no cartão e no envelope) —, e o
   Narrador inventou outro: achar um devedor da cota da liça. O Cronista, que
   só lia a prosa, gravou no registo «Tobias, devedor da liça, procurado por
   Corrado»; Tobias era o irmão da heroína, o nome que ELA tinha dito. O
   cânone ficou com a invenção como fato.

   Duas peças, uma por ponta:
   1. o PEDIDO ao Cronista (src/motor/cronista-do-turno.js#oPedidoAoCronista)
      leva, no turno do aceite, o pedido que o sistema tem — e só nesse turno;
   2. o JUÍZO (src/motor/cronista.js#julgarOCronista, a gente): quando a prosa
      não diz o pedido aceito (`O_QUE_O_CRONISTA_PODE.gente.contraOPedido`), a
      pessoa NOVA que o pedido trocado amarra a quem pediu entra como palavra
      dele («dito por Corrado, não fato») e sem o papel que ele lhe deu.

   A fiação do App (o aceite do clique até ao Cronista) prova-se no dourado
   do Cronista (teste-motor-cronista-do-turno, o segundo conserto declarado
   em gerar-cronista-dourado.mjs). E o turno do aceite lê sempre (§7): o
   gatilho acende "aceite", porque o aceite não viaja na fila.
   ============================================================ */
import fs from "node:fs";
import { julgarOCronista, O_QUE_O_CRONISTA_PODE } from "../src/motor/cronista.js";
import { oPedidoAoCronista, oGatilhoDoCronista } from "../src/motor/cronista-do-turno.js";
import { decidirOCronista, garantirLeitura } from "../src/gatilho-do-cronista.js";
import { recorteDeHoje, blocoComoFuncao, correrOBloco, casoDoCronista } from "./cronista-bloco.mjs";
import { criarNPC } from "../src/npcs.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* a narração do T6 da 13.ª, à letra (o save da sessão), e o registo de então */
const T6 = "Corrado passa a manga pelo nariz, jurando baixo por um botão torto do próprio gibão enquanto mede as suas mãos. Ele não olha nos seus olhos — crava a vista na fivela gasta do seu cinturão e solta o ar pelos dentes:\n\n— Pois que seja, pelos três pregos da forca. Eu não fico devendo favor a andejo nenhum. Mas você vai ter que me tirar um espinho da carne primeiro: tem um sujeito que desceu a estrada sem me pagar a cota da liça, e eu preciso desse rasto achado antes que o meirinho-mor sinta o cheiro da falta. Quer ouvir de Tobias? Acha quem me deve.\n\nAntes que você responda, a mão pesada de Dunstan cai no seu ombro. Ele não espera: dá dois passos largos na lama do fosso, estica o braço e puxa Beraldo Pés-de-Lama pela gola do casaco puído, arrancando o homem do meio da roda de apostas e largando-o de frente para vocês.\n\n— Esse daqui sabe quem entra e quem sai da vala — resmunga Dunstan, com a voz rouca de quem mastiga poeira desde a aurora. — Abre a goela, Beraldo.\n\nBeraldo engole em seco, olhando do empresário para você, com os dedos sujos tremendo na altura da cintura:\n\n— O sujeito que o Corrado procura cruzou a cancela do burgo faz duas noites, jurando que ia desovar o lote nas colinas. Mas se você quer sangue do seu sangue... o rapaz que chamavam por esse nome não foi pras colinas. Desceu amarrado pr'aquela cova úmida do poço fundo a mando dos homens do conselho, e a cota dele vence no cair da tarde.\n\nAs palavras caem na lama e não se misturam. Corrado fecha a cara e cruza os braços, exigindo o devedor na cidade para abrir a boca sobre o passado, enquanto o rastro vivo de Tobias puxa você para fora dos muros antes que a tarde feche a terra.";
const FIEL = "Corrado baixa a voz: — É meio dia de desvio, nada mais. Há uma campa no alto da várzea que não visito há seis anos. Leva-me lá antes que a tarde feche, e Tobias, o teu irmão, ouve de mim o que sei.";
const E = {
  personagem: { nome: "Iara", grupo: [{ nome: "Dunstan Machado Torto" }] },
  npcs: Object.fromEntries(["Corrado", "Beraldo Pés-de-Lama", "Anselmo"].map((n) => [n, criarNPC(n, { papel: "gente do largo", ultimaVez: 5, conhecidoEm: 1 })])),
  cidadeAtual: "Porto das Pedras", lugar: { nome: "Largo da Liça" },
};
const ACEITE = { de: "Corrado", objeto: "meio dia de desvio a uma campa", pede: "É meio dia de desvio. Há uma campa que não visito há seis anos." };
const TOBIAS = { nome: "Tobias", papel: "devedor da liça", relacao: "neutro", genero: "ele", local: "Porto das Pedras", notas: "procurado por Corrado" };
const P = { pessoas: [TOBIAS], falou_com: ["Corrado", "Beraldo Pés-de-Lama"] };
const julgar = (narrativa, aceite, proposta = P, estado = E) => julgarOCronista(estado, proposta, { narrativa, ...(aceite !== undefined ? { aceite } : {}) });
const tobiasDe = (j) => (j.aceito.pessoas || []).find((p) => p.nome === "Tobias");

sec("1 · a 13.ª: o pedido que a prosa trocou");
{
  const antes = julgar(T6);
  t("sem o aceite (a chamada de antes), Tobias entra como o Cronista o deu — o defeito da 13.ª", igual(tobiasDe(antes), TOBIAS) && !antes.ditoPor.length);
  const j = julgar(T6, ACEITE);
  const tb = tobiasDe(j);
  t("com o aceite, Tobias entra como palavra de Corrado, não fato", tb && tb.dito === O_QUE_O_CRONISTA_PODE.fatos.marca("Corrado"), JSON.stringify(tb));
  t("e sem o papel que o pedido inventado lhe deu («devedor da liça»)", tb && tb.papel === "");
  t("o resto da ficha fica (o nome, o gênero, o sítio)", tb && tb.nome === "Tobias" && tb.genero === "ele" && tb.local === "Porto das Pedras");
  t("o ditoPor diz quem e porquê", j.ditoPor.some((d) => d.secao === "gente" && d.o === "Tobias" && d.quem === "Corrado" && d.porque === "contraOPedido"));
  t("o que a proposta trouxe não é tocado", igual(P.pessoas[0], TOBIAS));
}

sec("2 · onde a prosa diz o pedido, nada muda");
{
  const j = julgar(FIEL, ACEITE);
  t("a narração que diz o desvio e a campa: Tobias entra como o Cronista o deu", igual(tobiasDe(j), TOBIAS) && !j.ditoPor.some((d) => d.porque === "contraOPedido"));
  /* a régua, lida da tabela: a fração das palavras do objeto que moram na prosa */
  const T = O_QUE_O_CRONISTA_PODE.gente.contraOPedido;
  t("a régua é tabela: letras, raiz e fração", T.letras === 4 && T.raiz === 5 && T.fracao === 0.5);
  /* na T6, das três palavras que contam («meio», «desvio», «campa») só «meio»
     mora na prosa («do meio da roda»): 1/3, abaixo da metade */
  const umaDeTres = "Corrado ri: — O meio da tarde é teu. " + T6;
  t("uma palavra de três (abaixo da fração) não diz o pedido", tobiasDe(julgar(umaDeTres, ACEITE)).papel === "");
  const duasDeTres = "Corrado ri: — O desvio é meio dia. " + T6;
  t("duas de três (acima da fração) diz", tobiasDe(julgar(duasDeTres, ACEITE)).papel === "devedor da liça");
  t("a palavra só conta inteira no começo: «descampado» não é «campa»", tobiasDe(julgar(T6 + " Um descampado.", { ...ACEITE, objeto: "a campa" })).papel === "");
}

sec("3 · só a pessoa nova que o pedido trocado amarra a quem pediu");
{
  const conhecido = { ...E, npcs: { ...E.npcs, Tobias: criarNPC("Tobias", { papel: "irmão da heroína", ultimaVez: 2, conhecidoEm: 1 }) } };
  t("quem o registo já conhece não é tocado (a mescla é de outro órgão)", igual(tobiasDe(julgar(T6, ACEITE, P, conhecido)), TOBIAS));
  const comDador = { pessoas: [{ nome: "Corrado", papel: "agenciador da liça" }, TOBIAS] };
  t("quem pediu não é tocado", (julgar(T6, ACEITE, comDador).aceito.pessoas || []).find((p) => p.nome === "Corrado").papel === "agenciador da liça");
  const solta = { pessoas: [{ nome: "Wystan Pedra", papel: "ferreiro", notas: "forja na rua" }] };
  const comWystan = T6 + "\n\nNo fundo do largo, Wystan Pedra bate o ferro e não levanta os olhos.";
  const w0 = julgar(comWystan, ACEITE, solta);
  t("a pessoa nova que o pedido não amarra (nem fala de Corrado, nem notas dele) entra como veio", w0.aceito.pessoas[0].papel === "ferreiro" && !w0.aceito.pessoas[0].dito && !w0.ditoPor.length);
  const soNasNotas = { pessoas: [{ nome: "Wystan Pedra", papel: "cobrador", notas: "trabalha para Corrado" }] };
  t("amarrada só pelas notas do Cronista («trabalha para Corrado»): palavra dele, sem papel", (() => { const w = julgar(comWystan, ACEITE, soNasNotas).aceito.pessoas[0]; return w.papel === "" && /Corrado/.test(w.dito); })());
  /* sem notas que o amarrem, vale a fala: a primeira que diz o nome é de quem
     pediu (quemDisse, pela etiqueta). Na T6 a fala de Corrado não tem etiqueta
     (ele é o sujeito do parágrafo de antes), e quemDisse não lha dá: ali quem
     amarra é a nota do Cronista («procurado por Corrado») */
  const semNotas = { pessoas: [{ ...TOBIAS, notas: "" }] };
  const comEtiqueta = "— Acha-me o Tobias, que me deve a cota da liça — diz Corrado, sem erguer os olhos do tabuado.";
  t("amarrada pela fala: a primeira que diz «Tobias» é a de Corrado", tobiasDe(julgar(comEtiqueta, ACEITE, semNotas, { ...E, npcs: { ...E.npcs } })).papel === "");
  t("e sem fala nem nota que o amarre, entra como veio", tobiasDe(julgar(T6, ACEITE, semNotas)).papel === "devedor da liça");
}

sec("4 · o aceite que não é aceite");
{
  const base = julgar(T6);
  for (const lixo of [null, "Corrado", 7, [], {}, { de: "Corrado" }, { de: "Corrado", objeto: "" }, { objeto: "meio dia de desvio a uma campa" }, { de: "Corrado", objeto: "a de" }]) {
    t(`aceite ${JSON.stringify(lixo)}: o juízo de antes`, igual(julgar(T6, lixo), base));
  }
}

sec("5 · o pedido ao Cronista leva o pedido aceito, e só no turno dele");
{
  const ler = { npcs: E.npcs, missoes: [], canone: {} };
  const sem = oPedidoAoCronista(ler, { narrativa: T6, fila: "" });
  const com = oPedidoAoCronista(ler, { narrativa: T6, fila: "", aceite: ACEITE });
  t("com o aceite, o bloco do pedido aceito está lá: quem pede, o objeto e a fala",
    /PEDIDO QUE O HERÓI ACEITOU NESTE TURNO/.test(com.user) && com.user.includes("- Corrado pede: meio dia de desvio a uma campa — \"É meio dia de desvio. Há uma campa que não visito há seis anos.\""));
  t("e diz que o outro pedido é palavra, não fato", /OUTRO pedido, isso é palavra de quem fala, não fato/.test(com.user));
  t("antes da narrativa, depois do elenco (a narrativa fica no fim)", com.user.indexOf("PEDIDO QUE O HERÓI") > com.user.indexOf("ELENCO") && com.user.indexOf("PEDIDO QUE O HERÓI") < com.user.indexOf("NARRATIVA DO TURNO") && com.user.endsWith(T6));
  t("o resto do pedido é o de sempre: tirar o bloco devolve o texto sem aceite", com.user.replace(/PEDIDO QUE O HERÓI ACEITOU NESTE TURNO[^\n]*\n[^\n]*\n\n/, "") === sem.user);
  t("o sys não muda (o molde é o de sempre)", com.sys === sem.sys);
  const semFala = oPedidoAoCronista(ler, { narrativa: T6, fila: "", aceite: { de: "Corrado", objeto: "meio dia de desvio a uma campa" } });
  t("sem a fala, só o objeto", semFala.user.includes("- Corrado pede: meio dia de desvio a uma campa\n\n"));
  for (const lixo of [null, "x", {}, { de: "Corrado" }, { de: "Corrado", objeto: "   " }]) {
    t(`aceite ${JSON.stringify(lixo)}: o pedido de antes, byte a byte`, oPedidoAoCronista(ler, { narrativa: T6, fila: "", aceite: lixo }).user === sem.user);
  }
}

sec("6 · o save da 13.ª, se estiver à mão (a prova viva, opcional)");
{
  const SAVE = process.env.TAVERNA_SAVE_S13;
  if (SAVE && fs.existsSync(SAVE)) {
    const s = JSON.parse(fs.readFileSync(SAVE, "utf8"));
    t("a narração desta suíte é a do save, à letra", s.mensagens[18].texto === T6);
  } else console.log("  (sem TAVERNA_SAVE_S13: a narração está aqui à letra)");
}

sec("7 · o turno do aceite lê: o aceite não vai para a fila");
{
  /* O que o fio-13 não soube (o ponto 3): o gatilho (onda 1 do custo) deixa
     ler mais tarde a narração que não acende nada, e ela vai para a fila —
     mas o aceite só viaja no `doTurno` do clique, e o juízo compara o pedido
     com a narração DESSE turno. Na fila, o aceite perdia-se. Agora o aceite
     com objeto acende o gatilho ("aceite"), e o turno do clique lê sempre. */
  const QUIETA = "A tarde arrasta-se devagar sobre o largo, e o vento traz o cheiro do rio e da lama seca.";
  const ACEITE7 = { de: "Corrado", objeto: "meio dia de desvio a uma campa", pede: "" };
  const semNada = decidirOCronista({ narrativa: QUIETA, frase: "aceito" }, null);
  t("a narração quieta, sem aceite, não acende nada (iria para a fila)", !semNada.corre, JSON.stringify(semNada.motivos));
  const comAc = decidirOCronista({ narrativa: QUIETA, frase: "aceito", aceite: ACEITE7 }, null);
  t("com o aceite, lê agora, e o motivo é o aceite", comAc.corre && igual(comAc.motivos, ["aceite"]), JSON.stringify(comAc.motivos));
  for (const lixo of [null, "x", 5, {}, { de: "Corrado" }, { de: "Corrado", objeto: "  " }, { objeto: 7 }]) {
    t(`aceite ${JSON.stringify(lixo)}: não acende`, !decidirOCronista({ narrativa: QUIETA, aceite: lixo }, null).corre);
  }
  t("o gatilho do motor passa o aceite do turno (doTurno.aceite)",
    oGatilhoDoCronista(E, { narrativa: QUIETA, doTurno: { frase: "", envelopes: [], aceite: ACEITE7 } }, null).motivos.includes("aceite")
    && !oGatilhoDoCronista(E, { narrativa: QUIETA, doTurno: { frase: "", envelopes: [] } }, null).corre);

  /* e o App de hoje (o cronistaDoTurno recortado à letra, com os dublês de
     cronista-bloco.mjs): o caso do aceite com a narração quieta e sem pulos.
     Sem o aceite, a narração vai para a fila e a rede não é chamada; com ele,
     a rede é chamada uma vez e a fila fica vazia */
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const hoje = blocoComoFuncao(recorteDeHoje(APP));
  const base = casoDoCronista(6);
  /* sem pulos e sem o deus desperto (a fé acende por turno): só o aceite pode acender */
  const caso = (doTurno) => ({ ...base, narrativa: QUIETA, divindade: { ...base.divindade, despertar: false }, leitura: garantirLeitura({ pulos: 0, fila: [], vistos: [] }), doTurno });
  const { aceite: _a, ...turnoSem } = base.doTurno;
  t("o caso 6 de cronista-bloco é um caso com aceite", !!_a && typeof _a.objeto === "string");
  const fSem = await correrOBloco(hoje, caso(turnoSem), { novo: true });
  const fCom = await correrOBloco(hoje, caso(base.doTurno), { novo: true });
  const filaDe = (f) => garantirLeitura(f.refs.leituraDoCronistaRef).fila.length;
  t("no App, sem o aceite: a rede não é chamada e a narração fica na fila", fSem.log.rede.length === 0 && filaDe(fSem) === 1, `rede ${fSem.log.rede.length}, fila ${filaDe(fSem)}`);
  t("no App, com o aceite: a rede é chamada no próprio turno e a fila fica vazia", fCom.log.rede.length === 1 && filaDe(fCom) === 0, `rede ${fCom.log.rede.length}, fila ${filaDe(fCom)}`);
  t("e nada estoura nem cala", !fCom.erro && !fSem.erro && !(fCom.log.calados || []).length, JSON.stringify(fCom.log.calados));
}

console.log(`\n${ok} ok, ${mal} falhas`);
if (mal) process.exit(1);
