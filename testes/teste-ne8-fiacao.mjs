/* ============================================================
   NE8 — A FIAÇÃO DA MEMÓRIA DO INVENTADO NO APP (oficial, 13/11/2026)

   O backend fez a peça (src/motor/memoria-do-inventado.js, provada em
   testes/teste-memoria-do-inventado.mjs): o objeto que a prosa deu ao herói
   e o sistema não tem vira veto no livro do Juiz. A peça só age se o App a
   chamar, no turno, com o estado que só o App tem. Esta suíte prova:

     §1 o import e o lugar: em `enviar`, depois de aplicarResposta e do Juiz,
        FORA do «if (fotoDoJuiz)», antes do conferente das missões
     §2 o que o App passa: a resposta crua, o retrato do livro com o `pers`
        do turno, o turno e a cidade do Juiz, a frase do jogador, o lugar
     §3 em calou: a memória que estoura nunca custa o turno
     §4 o caminho até à pauta: o livro é vetosDoJuizRef, e a pauta já o lê
     §5 a sessão em ordem de App: o Juiz põe o seu veto, a memória soma o da
        chave mestra sem lhe tirar o dele; T17 sob NÃO PODE; T19 só se a frase
        falar da chave; com a chave na bolsa a linha some
     §6 nenhum campo de save novo

   Falha na árvore de 2b28d3a (a peça sem fiação) e passa nesta. */
import { readFileSync } from "node:fs";
import { lembrarOInventado, MEMORIA_DO_INVENTADO } from "../src/motor/memoria-do-inventado.js";
import { vetosParaAPauta } from "../src/motor/correcao-do-juiz.js";
import { porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { aPautaDoTurno, oEstadoDaPauta } from "../src/motor/pauta-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, info) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (info ? "  — " + info : "")); } };
const sec = (s) => console.log("\n" + s);
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const T = MEMORIA_DO_INVENTADO;

/* o corpo de `enviar`, e dentro dele o bloco da memória */
const iEnviar = APP.indexOf("  const enviar = useCallback(async (conteudo, persAtual, histBase) => {");
const ENVIAR = iEnviar < 0 ? "" : APP.slice(iEnviar, APP.indexOf("\n  }, [", iEnviar));
const iMem = ENVIAR.indexOf("vetosDoJuizRef.current = lembrarOInventado(");
const BLOCO = iMem < 0 ? "" : ENVIAR.slice(ENVIAR.lastIndexOf("try {", iMem), ENVIAR.indexOf('calou("NE8 · a memória do inventado", e); }', iMem) + 50);

/* ============================================================ */
sec("§1 o import e o lugar");
{
  t("o App importa lembrarOInventado da peça do motor", /import \{ lembrarOInventado \} from "\.\/motor\/memoria-do-inventado\.js";/.test(APP));
  t("a chamada está em enviar, uma vez só", iMem > 0 && ENVIAR.split("lembrarOInventado(").length - 1 === 1);
  const iAplica = ENVIAR.indexOf("let pers = aplicarResposta(resp, persAtual");
  const iJuiz = ENVIAR.indexOf('} catch (e) { calou("o juiz do turno", e); }');
  const iConferente = ENVIAR.indexOf("/* MISSÕES (v9.27): o conferente roda DEPOIS");
  t("depois de aplicarResposta: o item que o sistema deu neste turno já está na bolsa", iAplica > 0 && iAplica < iMem);
  t("depois do Juiz, e FORA do try dele (logo, fora do «if (fotoDoJuiz)»: sem foto, a memória corre)", iJuiz > 0 && iJuiz < iMem);
  t("antes do conferente das missões e do save do turno", iConferente > iMem);
}

/* ============================================================ */
sec("§2 o que o App passa à peça");
{
  t("os vivos são o livro do Juiz, e o livro volta para ele", /vetosDoJuizRef\.current = lembrarOInventado\(vetosDoJuizRef\.current, narrativaDoLivro,/.test(BLOCO));
  t("a prosa é a resposta CRUA (narrativaDoLivro = String(resp.narrativa))", /const narrativaDoLivro = String\(resp\.narrativa \|\| ""\);/.test(ENVIAR));
  t("o estado é o retrato do livro com o `pers` do turno (não o personagemRef da véspera)", /\.\.\.retratoDoLivro\(\), personagem: pers,/.test(BLOCO));
  t("…mais missões, quests, abertura e o núcleo (o motor lê nucleo.pessoas)", /missoes: missoesRef\.current, quests: questsRef\.current,/.test(BLOCO) && /abertura: aberturaMundoRef\.current, nucleo: \(nucleoCacheRef\.current \|\| \{\}\)\.nucleo/.test(BLOCO));
  t("o turno é o da pauta, o mesmo que o Juiz usa (turnoDeRegistro + 1)", /turno: turnoDeRegistroRef\.current \+ 1,/.test(BLOCO));
  t("a cidade é a da foto do Juiz quando ele correu; sem foto, a do instante", /cidade: fotoDoJuiz \? \(fotoDoJuiz\.cidadeAtual \|\| ""\) : \(cidadeAtualRef\.current \|\| ""\),/.test(BLOCO));
  t("a frase do jogador (o que ele nomeou não morde)", /frase: pedidoDaBolsa,/.test(BLOCO));
  t("o lugar do turno", /lugarDoTurno: \(lugarRef\.current && lugarRef\.current\.nome\) \|\| "",/.test(BLOCO));
}

/* ============================================================ */
sec("§3 nunca pode custar o turno");
{
  t("a chamada inteira está num try com calou próprio", BLOCO.startsWith("try {") && BLOCO.includes('} catch (e) { calou("NE8 · a memória do inventado", e); }'));
  /* a peça engole lixo: o App pode passar refs vazios ou nulos sem estourar */
  let L = null, estourou = false;
  try { L = lembrarOInventado(null, "Você pega a chave mestra.", { personagem: null, nucleo: undefined, factos: null }, { turno: 1, cidade: "" }); } catch { estourou = true; }
  t("com os refs nulos (save novo, núcleo ainda sem cache) a peça devolve um livro, não um erro", !estourou && Array.isArray(L));
}

/* ============================================================ */
sec("§4 o caminho até à pauta");
{
  t("o livro viaja à pauta pelos refs dela (vetosDoJuizRef em refsDaPauta)", /const refsDaPauta = \(\) => \(\{[\s\S]{0,4000}?\bvetosDoJuizRef\b/.test(APP));
  /* o motor prova-se jogando (teste-assercoes-de-texto): a pauta do turno
     corre com os refs como o App os passa (oEstadoDaPauta), e a linha da
     memória sai na secção vetoDoJuiz, sob NÃO PODE */
  const v = { especie: T.especie, alvo: "objeto:chave mestra", linha: "pôr em jogo «a chave mestra»: não existe, o herói não a tem", toques: ["chave", "mestra"], turno: 16, ate: 16 + T.vida, cidade: "" };
  const e = oEstadoDaPauta({ vetosDoJuizRef: { current: [v] }, turnoDeRegistroRef: { current: 16 }, cidadeAtualRef: { current: "Ribeira das Areias" } }, {});
  const { pauta } = aPautaDoTurno(e, { frase: "olho em volta" }, {});
  t("e a pauta do turno leva a linha à secção vetoDoJuiz", Array.isArray(pauta && pauta.vetoDoJuiz) && pauta.vetoDoJuiz.includes(v.linha));
  t("…que no texto do turno sai sob NÃO PODE", (() => { const x = textoDaPauta(pauta, { turno: 17 }); return x.includes("NÃO PODE") && x.includes(v.linha); })());
}

/* ============================================================ */
sec("§5 a sessão em ordem de App: o Juiz, depois a memória, depois a pauta");
{
  const cidade = "Ribeira das Areias";
  /* o estado como o App o monta: retratoDoLivro() + o pers do turno + o resto */
  const pers = { nome: "Pipa Rabo-de-Junco", inventario: ["Ferramentas de ladrão", { nome: "Adaga" }] };
  const estado = {
    factos: { pessoas: {} }, personagem: pers, cidadeAtual: cidade, jornada: null, npcs: { Margarida: { nome: "Margarida" } },
    canone: {}, dia: 3, mapa: { cidades: [{ nome: cidade }] }, lugar: { nome: "Cadeia do Pelourinho" }, masmorra: null, combate: null, espinha: null,
    missoes: [], quests: [], abertura: null, nucleo: undefined,
  };
  /* o Juiz, no mesmo turno, acabou de pôr um veto de preço desta cidade */
  const doJuiz = Object.freeze({ especie: "preco-contra-a-mesa", alvo: "preco:pao", linha: "dar a «pão» outro preço que não ◉ 2 (o 5 não vale)", toques: ["pao"], turno: 16, ate: 19, cidade });
  const t16 = "Num gesto só, você surrupia o molho de chaves e o esconde na manga. Entre elas, seus dedos encontram a chave mestra de ferro forjado.";
  const L = lembrarOInventado([doJuiz], t16, estado, { turno: 16, cidade, frase: "surrupio o molho de chaves", lugarDoTurno: "Cadeia do Pelourinho" });
  const v = L.find((x) => x.especie === T.especie);
  t("a memória soma o veto da chave mestra ao livro", !!v && v.linha === "pôr em jogo «a chave mestra»: não existe, o herói não a tem");
  t("…e não tira o veto que o Juiz acabou de pôr (a mesma cidade dele)", L.some((x) => x.alvo === "preco:pao"));
  /* o porquê da cidade da foto: se o herói viajou neste turno e o App
     passasse a cidade nova, o andarOsVetos tirava o veto de preço que o
     Juiz pôs há uma linha, lido na mesa da cidade velha */
  t("com a cidade nova o veto de preço do Juiz cairia — por isso a cidade é a da foto", !lembrarOInventado([doJuiz], t16, estado, { turno: 16, cidade: "Gelo Fundo" }).some((x) => x.alvo === "preco:pao"));
  const p17 = vetosParaAPauta(L, { turno: 17, cidade, frase: "desço até a porta das celas e apalpo a fechadura" });
  const txt = textoDaPauta(porNaPauta({}, "vetoDoJuiz", ...p17), { turno: 17 });
  t("T17: a pauta tem «NÃO PODE … «a chave mestra»», mesmo sem a frase falar da chave, dentro do teto", txt.includes("NÃO PODE") && txt.includes("pôr em jogo «a chave mestra»") && txt.length <= TETO_DA_PAUTA);
  t("T19: só volta se a frase falar da chave", !vetosParaAPauta(L, { turno: 19, cidade, frase: "olho em volta" }).includes(v.linha) && vetosParaAPauta(L, { turno: 19, cidade, frase: "abro o baú com a chave" }).includes(v.linha));
  /* o turno seguinte, em que a busca achou a chave: o App passa o pers novo */
  const comChave = { ...estado, personagem: { ...pers, inventario: [...pers.inventario, { nome: "Chave mestra" }] } };
  const L2 = lembrarOInventado(L, "Você olha em volta.", comChave, { turno: 17, cidade });
  t("com a chave na bolsa (a busca achou-a), a linha some do livro e da pauta", !L2.some((x) => x.especie === T.especie) && !vetosParaAPauta(L2, { turno: 18, cidade, frase: "abro com a chave" }).some((l) => l.includes("chave mestra")));
  t("o item que o sistema deu NESTE turno não morde (o pers vem depois de aplicarResposta)", !lembrarOInventado([], "Você pega a chave mestra.", comChave, { turno: 17, cidade }).some((x) => x.especie === T.especie));
}

/* ============================================================ */
sec("§6 nenhum campo de save novo");
{
  /* o livro do Juiz nunca foi do save (zera no load e na campanha nova); a
     memória vive nele, logo a versão antiga não vê nada de novo */
  t("vetosDoJuiz não entra no save do App", !/\bvetosDoJuiz\s*:/.test(APP));
  t("e o load zera o livro como sempre", /juizDoTurnoRef\.current = null; vetosDoJuizRef\.current = \[\];/.test(APP));
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
