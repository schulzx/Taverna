/* ============================================================
   O NARRADOR SÓ NARRA — E3, a fiação (frontend, 12/10)

   A E3 (v9.423) tirou do Narrador o 2.º lote de escrivão. Ficaram três
   pontas no App, e esta suíte prova as três:

     1. O GÊNERO DAS PESSOAS. Sem o canal `npcs`, ninguém registava o
        gênero de quem entra na história — e a 6.ª e a 7.ª sessões já
        tinham trocado o gênero de gente na narração. O Cronista passa a
        dizer "ele"/"ela"; o registo guarda "homem"/"mulher"; quem já tem
        gênero não o perde por uma leitura errada; a linha das PESSOAS
        CONHECIDAS, que vai ao Narrador, leva-o como já levava.
     2. O ENVELOPE DO TRECHO DE ESTRADA. Com destino, a chegada é do
        sistema, e o trecho já não ensina os campos da cidade e do meio.
        Sem destino, ficam (é a única porta de chegada por palavras).
     3. O ACHADO DA ESTRADA. O ◉ entra na bolsa no rolar; o detalhe diz que
        já está lá; a cobrança lê a marca e não o paga duas vezes.

   Falha na árvore de v9.423 e passa nesta. */
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const S = new URL("../src/", import.meta.url).href;

const npcs = await import(S + "npcs.js");
const { criarNPC, mesclarNPC, resumoNPCsParaPrompt } = npcs;
const fichaDoCronista = npcs.fichaDoCronista || (() => { throw new Error("sem fichaDoCronista"); });
const enc = await import(S + "encontros.js");
const { rolarEncontro } = enc;
const moedasDoAchadoNoEnvelope = enc.moedasDoAchadoNoEnvelope || (() => { throw new Error("sem moedasDoAchadoNoEnvelope"); });
const { oQueFaltaCreditar } = await import(S + "cobranca.js");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const encontrosFonte = readFileSync(new URL("../src/encontros.js", import.meta.url), "utf8");
const tenta = (f) => { try { return f(); } catch (e) { return { erro: String(e && e.message) }; } };

/* ============================================================ */
sec("1. o gênero das pessoas: o Cronista diz, o registo guarda, o Narrador lê");
{
  const lia = tenta(() => fichaDoCronista({ nome: "Lia Cinzela", papel: "carpinteira", genero: "ela" }));
  const bento = tenta(() => fichaDoCronista({ nome: "Bento Vau", papel: "barqueiro", genero: "ele" }));
  t("«ela» do Cronista vira «mulher» (a forma do registo)", lia.genero === "mulher", JSON.stringify(lia));
  t("«ele» do Cronista vira «homem»", bento.genero === "homem", JSON.stringify(bento));
  t("o resto da ficha passa intacto", lia.papel === "carpinteira" && lia.nome === "Lia Cinzela");
  t("«Ela» com maiúscula e espaço também conta", tenta(() => fichaDoCronista({ genero: " Ela " })).genero === "mulher");
  t("a forma longa (mulher/homem) também é aceita", tenta(() => fichaDoCronista({ genero: "mulher" })).genero === "mulher" && tenta(() => fichaDoCronista({ genero: "homem" })).genero === "homem");
  t("sem gênero na cena («»), nada se chuta", !("genero" in tenta(() => fichaDoCronista({ nome: "X", genero: "" }))));
  t("valor que não diz gênero não entra", !("genero" in tenta(() => fichaDoCronista({ nome: "X", genero: "talvez" }))) && !("genero" in tenta(() => fichaDoCronista({ nome: "X", genero: "desconhecido" }))));
  const regLia = criarNPC("Lia Cinzela", { ...lia, conhecidoEm: 3 });
  t("criarNPC guarda o gênero vindo do Cronista", regLia.genero === "mulher");
  /* o defeito era este: um turno lê errado e troca quem a pessoa é */
  const errada = tenta(() => fichaDoCronista({ nome: "Lia Cinzela", genero: "ele" }, regLia));
  t("quem já tem gênero não o perde por uma leitura errada", !("genero" in errada) && mesclarNPC(regLia, errada).genero === "mulher", JSON.stringify(errada));
  t("e a mesma leitura repetida não muda nada", mesclarNPC(regLia, tenta(() => fichaDoCronista({ genero: "ela" }, regLia))).genero === "mulher");
  const semGenero = criarNPC("Ruy", { papel: "guarda" });
  t("quem estava sem gênero ganha-o quando o Cronista o lê", mesclarNPC(semGenero, tenta(() => fichaDoCronista({ genero: "ele" }, semGenero))).genero === "homem");
  const lixo = { ...criarNPC("Odo", {}), genero: "Fantasia medieval" };
  t("gênero-lixo de save antigo (o gênero do MUNDO) não conta como «já tem»", mesclarNPC(lixo, tenta(() => fichaDoCronista({ genero: "ele" }, lixo))).genero === "homem");
  const linhas = resumoNPCsParaPrompt({ "Lia Cinzela": regLia, "Bento Vau": criarNPC("Bento Vau", { ...bento, conhecidoEm: 3 }) });
  t("a linha das PESSOAS CONHECIDAS que vai ao Narrador leva o gênero", /Lia Cinzela[^\n]*mulher/.test(linhas) && /Bento Vau[^\n]*homem/.test(linhas), linhas);
  let estourou = false;
  for (const x of [null, undefined, 3, "ela", [], { genero: null }, { genero: 5 }, Object.freeze({ genero: "ela" })]) {
    try { fichaDoCronista(x); fichaDoCronista(x, x); } catch { estourou = true; }
  }
  t("lixo e objeto congelado não estouram", !estourou);
  t("determinístico", JSON.stringify(fichaDoCronista({ nome: "A", genero: "ela" })) === JSON.stringify(fichaDoCronista({ nome: "A", genero: "ela" })));
  /* a fiação, lida no fonte do App */
  t("o esquema do Cronista pede o genero (ele|ela) das pessoas", /\\"pessoas\\":\[\{[^\]]*\\"genero\\":\\"ele\|ela\\"/.test(app));
  t("a SEÇÃO pessoas diz como ler e proíbe o chute", /SEÇÃO pessoas:[^\n]*\\"genero\\": \\"ele\\" ou \\"ela\\"[^\n]*nunca chute/.test(app));
  /* MOVIDA na v9.449 (oficial): a chamada ganhou o terceiro argumento — o
     contexto { cidade, mapa } do paradeiro (e) da v9.447 —, e a régua passou a
     aceitá-lo; a intenção (a ficha passa por fichaDoCronista ANTES de mesclar
     ou criar) é a mesma. O contexto é provado em teste-pendentes-ligados.mjs. */
  t("o App passa a ficha do Cronista por fichaDoCronista antes de registar", /fichaDoCronista\(n, chave \? reg\[chave\] : null(?:, \{[^}]*\})?\)/.test(app) && /mesclarNPC\(reg\[chave\], nF\)/.test(app) && /criarNPC\(String\(nomeCerto\)\.slice\(0, 40\), \{ \.\.\.nF,/.test(app));
  t("e o líder do bando já não recebe o gênero do MUNDO como se fosse o dele", !/genero: mundo && mundo\.genero, notas:/.test(app));
}

/* ============================================================ */
sec("2. o envelope do trecho de estrada: com destino, a chegada é do sistema");
{
  const i = app.indexOf("const textoDaViagem = (");
  const linha = i > 0 ? app.slice(i, app.indexOf("\n    if (qr.chamadas) enviar(textoDaViagem", i)) : "";
  const comDestino = (linha.match(/paraCidade \? \((ultimoTrechoCidade \? [\s\S]*?)\) : `Se o meio/) || [])[1] || "";
  t("o trecho conhece o destino da jornada (paraCidade)", /const paraCidade = !paraBoca && jornadaRef\.current && jornadaRef\.current\.para/.test(app) && !!comDestino);
  t("com destino, não pede o campo da cidade", !!comDestino && !/cidade_atual/.test(comDestino));
  t("com destino, não pede o campo do meio", !!comDestino && !/jornada_meio/.test(comDestino));
  t("com destino, diz que a chegada é do sistema", /a chegada é do sistema/.test(comDestino) && /a chegada vem no envelope do sistema/.test(comDestino));
  const semDestino = (linha.match(/\) : (`Se o meio de viagem mudar[\s\S]*?)\} Termine me convidando/) || [])[1] || "";
  t("sem destino, as duas instruções ficam (a única porta de chegada por palavras)", /registre "jornada_meio"/.test(semDestino) && /registre "cidade_atual"/.test(semDestino));
  t("e a frase do meio já não vale para todos os trechos (só para o sem destino)", (linha.match(/registre "jornada_meio"/g) || []).length === 1);
  const boca = (linha.match(/\$\{paraBoca \? \(([\s\S]*?)\) : paraCidade/) || [])[1] || "";
  t("a estrada até à boca de uma masmorra já não cita o campo da cidade", !!boca && !/cidade_atual/.test(boca) && /a chegada à boca é do sistema/.test(boca));
}

/* ============================================================ */
sec("3. o achado da estrada: entra na bolsa no rolar, e não paga duas vezes");
{
  let achado = null;
  for (let i = 0; i < 3000 && !achado; i++) { const e = rolarEncontro("Fantasia medieval", 3, null); if (e && e.tipo === "achado" && e.moedas > 0) achado = e; }
  t("o achado rola com o ◉ em número", !!achado && Number.isFinite(achado.moedas));
  t("o detalhe já não pede o campo de moedas", !!achado && !/via "moedas"/.test(achado.detalhe) && !/via "moedas"/.test(encontrosFonte), achado && achado.detalhe);
  t("o detalhe diz que o dinheiro já está na bolsa", !!achado && /já na bolsa/.test(achado.detalhe));
  t("e a marca do detalhe devolve a mesma quantia", !!achado && moedasDoAchadoNoEnvelope(`[VIAGEM]\nENCONTRO DO TRECHO (achado): ${achado.detalhe}`) === achado.moedas);
  t("sem marca, zero", moedasDoAchadoNoEnvelope("[VIAGEM]\nCLIMA AGORA: chuva.") === 0);
  t("duas marcas somam", moedasDoAchadoNoEnvelope("◉ 4 já na bolsa (creditadas pelo sistema)\n◉ 7 já na bolsa (creditadas pelo sistema)") === 11);
  let estourou = false;
  for (const x of [null, undefined, 3, {}, [], "◉ x já na bolsa (creditadas pelo sistema)"]) { try { if (moedasDoAchadoNoEnvelope(x) !== 0) estourou = true; } catch { estourou = true; } }
  t("lixo dá zero e não estoura", !estourou);
  /* a cobrança: a narração do achado não o paga outra vez */
  const narr = "Debaixo de uma pedra solta você encontra 12 moedas embrulhadas num pano velho.";
  t("(a prova só vale se a cobrança lê este achado — ela lê 12)", oQueFaltaCreditar(narr, null).moedas === 12);
  t("com a marca contada como declarada, a cobrança não paga o achado de novo", !oQueFaltaCreditar(narr, { moedas: 12 }).temAlgo);
  t("o App credita o achado no rolar, em viajar()", /enc && enc\.tipo === "achado" \? Math\.max\(0, Math\.floor\(Number\(enc\.moedas\) \|\| 0\)\) : 0/.test(app) && /persV = \{ \.\.\.persV, moedas: \(persV\.moedas \|\| 0\) \+ nAchado \}/.test(app));
  t("e o crédito vai antes do envio (o Narrador recebe a ficha com o dinheiro)", app.indexOf("persV = { ...persV, moedas: (persV.moedas || 0) + nAchado }") > 0 && app.indexOf("persV = { ...persV, moedas: (persV.moedas || 0) + nAchado }") < app.indexOf("if (qr.chamadas) enviar(textoDaViagem, persV)"));
  /* asserção movida em v9.429 (8.ª sessão): desde a v9.428 quem lê a marca
     é o próprio `oQueFaltaCreditar`, pelos `envelopes` (cobranca.js). O App
     que somava a marca ao declarado E passava os envelopes descontaria o
     achado duas vezes — então a prova agora é: os envelopes vão por nome, e
     a soma à parte no App deixou de existir. */
  t("a cobrança do App passa os envelopes do turno (a marca é lida no módulo) e não soma o achado à parte",
    /oQueFaltaCreditar\(resp\.narrativa, resp\.mudancas, \{[^}]*envelopes: op\.envelopes \|\| ""/.test(app) && !/jaDoAchado/.test(app));
  t("e o módulo desconta a marca dos envelopes (o achado não credita de novo)", !oQueFaltaCreditar(narr, null, { envelopes: "◉ 12 já na bolsa (creditadas pelo sistema)" }).temAlgo);
}

console.log(`\nnarrador só narra (E3, a fiação): ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
