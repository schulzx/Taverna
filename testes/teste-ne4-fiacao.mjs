/* ============================================================
   NE4 — A FIAÇÃO DOS SUBSTITUTOS NO APP (oficial, 13/11/2026)

   O backend fez os substitutos (testes/teste-ne4-substitutos.mjs): o sistema
   faz sozinho o que só a IA declarava. A peça só age se o App a chamar, com o
   estado que só o App tem. Esta suíte prova a fiação, item a item da nota do
   backend, e que o modo de hoje (`mestre`) não muda além do que o substituto
   acrescenta:

     §1 o golpe sem alvo: com `alvoDaProsa` fechada, a prosa não dá `conhecidas`
     §2 o objeto do cartaz: a busca que acha o segredo entrega-o
     §3 o convite pela frase: o caminho do botão, sem a linha «Convido…»
     §4 a fé do turno (os feitos contados) e o chamado pela frase (as três
        ameaças que o sistema tem)
     §5 o fim do arco maior pelo dado do descanso
     §6 a palavra do herói no caderno do prometido
     §7 a ficha da cena sem o Cronista (quem falou, a recência)

   Falha na árvore de 02bfad7 (os substitutos sem fiação) e passa nesta. */
import { readFileSync } from "node:fs";
import { portaAberta, oCronistaChama } from "../src/motor/portas-do-narrador.js";
import { conviteNaFrase } from "../src/indole.js";
import { chamadoNaFrase, NIVEL_MINIMO } from "../src/raids.js";
import { sementeDaPalavra } from "../src/palavra-dada.js";
import { guardarSementes, garantirPrometido } from "../src/prometido.js";
import { aFeDoTurno } from "../src/motor/meio-do-turno.js";
import { oEnvelopeDoMundo } from "../src/motor/envelopes-do-turno.js";

let ok = 0, mal = 0;
const t = (nome, cond, info) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (info ? "  — " + info : "")); } };
const sec = (s) => console.log("\n" + s);
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
/* o corpo de uma função do App, da declaração ao fecho da indentação dela */
const corpo = (abre, fecho = "\n  };") => { const i = APP.indexOf(abre); if (i < 0) return ""; const j = APP.indexOf(fecho, i); return j < 0 ? "" : APP.slice(i, j); };

/* ============================================================ */
sec("§1 o golpe sem alvo: a porta `alvoDaProsa` fechada tira o mostrado da lista");
{
  const L = corpo("  const leituraDaAgressao = (acao) => {");
  t("a lista do golpe lê a porta alvoDaProsa do modo da mesa",
    /montarEmCena\(portaAberta\("alvoDaProsa", MODO_DA_MESA\) \? ctxCena : \{ \.\.\.ctxCena, mostrado: \[\] \}\)/.test(L));
  t("e o contexto da cena é o de sempre (contextoDoEmCena), com o encontro e a sala dentro", /const ctxCena = contextoDoEmCena\(acao, elenco\.aqui \|\| \[\]\);/.test(L));
  t("a porta: aberta no `mestre` (o de hoje igual), fechada no `boca`", portaAberta("alvoDaProsa", "mestre") && !portaAberta("alvoDaProsa", "boca"));
}

/* ============================================================ */
sec("§2 o objeto do cartaz: a busca que acha o segredo entrega-o");
{
  t("o App importa objetoDoCartaz de ofertas.js", /import \{[^}]*\bobjetoDoCartaz\b[^}]*\} from "\.\/ofertas\.js";/.test(APP));
  const i = APP.indexOf("        registrarSaque(r.achado.id);");
  const bloco = i > 0 ? APP.slice(i, APP.indexOf("      /* ---------------- O BRILHO (v9.71)", i)) : "";
  t("logo depois de o achado pagar, a busca pergunta pelo cartaz", /objetoDoCartaz\(missoesRef\.current, r\.achado, persT\.inventario\)/.test(bloco));
  t("o objeto entra na bolsa da ficha do turno, e a ficha vai à tela", /persT = \{ \.\.\.persT, inventario: \[\.\.\.\(persT\.inventario \|\| \[\]\), doCartaz\.item\] \};\s*setPersonagem\(persT\);/.test(bloco));
  t("o envelope diz ao Narrador o nome exato, entregue pelo sistema", /\[O QUE O CARTAZ PROCURAVA — ENTREGUE PELO SISTEMA\][^\n]*\$\{doCartaz\.item\}/.test(bloco));
  t("em calou: o cartaz que estoura não custa o achado", /\} catch \(e\) \{ calou\("NE4 · o objeto do cartaz", e\); \}/.test(bloco));
}

/* ============================================================ */
sec("§3 o convite pela frase: o veredito do convite de sempre");
{
  t("o App importa conviteNaFrase de indole.js", /import \{[^}]*\bconviteNaFrase\b[^}]*\} from "\.\/indole\.js";/.test(APP));
  const ag = corpo("  const agirInterno = (texto) => {", "\n  const ");
  const iConv = ag.indexOf("const cv = conviteNaFrase(acao,");
  const iLaco = ag.indexOf("for (let i = 0; i < cascata.atalhos.length;)");
  const iSono = ag.indexOf('calou("o sono escrito", e)');
  t("o convite lê-se antes das portas (o oráculo comeria a pergunta) e depois do sono escrito", iConv > 0 && iSono > 0 && iSono < iConv && iConv < iLaco);
  t("com quem está em cena e o grupo (quem já anda comigo não é convidado)", /conviteNaFrase\(acao, \{ presentes: aquiC, grupo: pC\.grupo \|\| \[\] \}\)/.test(ag));
  t("vai pelo caminho do botão, marcado como da frase, e o turno acaba aí", /convidarNpc\(cv\.nome, \{ daFrase: true \}\);\s*return;/.test(ag));
  t("a frase do jogador sobe ao Mestre na nota (oQueEuEscrevi)", /if \(cv\) \{\s*pushMsgs\(\[\{ autor: "jogador", texto: acao \}\]\);\s*notaRef\.current = \[notaRef\.current, oEnvelopeDoJogador\("oQueEuEscrevi", \{ acao \}\)\]\.filter\(Boolean\)\.join\("\\n"\);/.test(ag));
  t("fora da luta, fora de comando e de escolha pendente", /if \(!acao\.startsWith\("\/"\) && !escolhaPendenteRef\.current\) \{/.test(ag) && /if \(!combateRef\.current\) \{\s*const pC = /.test(ag));
  t("em calou", /calou\("NE4 · o convite pela frase", e\)/.test(ag));
  const cn = corpo("  const convidarNpc = (nome, opcoes) => {");
  t("convidarNpc aceita `daFrase` (null-seguro), e o botão continua com a linha «Convido…»", cn.length > 0 && /const daFrase = !!\(opcoes && opcoes\.daFrase\);/.test(cn) && /if \(!daFrase\) pushMsgs\(\[\{ autor: "jogador", texto: `Convido \$\{nome\} para se juntar ao meu grupo\.` \}\]\);/.test(cn));
  t("o resto é o caminho de sempre: veredito, porNoGrupo, envelopeDoConvite", /const v = vereditoDoConvite\(nome\);/.test(cn) && /porNoGrupo\(nome\)/.test(cn) && /enviar\(envelopeDoConvite\(nome, v\), personagem\);/.test(cn));
  t("e a peça casa a frase com quem está em cena", (conviteNaFrase("Marta, quer vir comigo?", { presentes: [{ nome: "Marta Sal" }, { nome: "Doran" }], grupo: [] }) || {}).nome === "Marta Sal");
}

/* ============================================================ */
sec("§4a a fé do turno: o que os contadores contaram, depois do conferente");
{
  t("o App importa aFeDoTurno e oFimDoEventoGlobal do meio do turno", /import \{[^}]*\baFeDoTurno\b[^}]*\boFimDoEventoGlobal\b[^}]*\} from "\.\/motor\/meio-do-turno\.js";/.test(APP));
  const iRet = APP.indexOf("antesDaFe = retratoDaFe();");
  const iApl = APP.indexOf("let pers = aplicarResposta(resp, persAtual, {");
  const iConf = APP.indexOf("try { pers = conferirAsMissoes(pers) || pers; } catch { /* nunca derruba o turno */ }");
  const iFe = APP.indexOf("const dFe = aFeDoTurno(");
  t("o retrato é tirado antes de aplicar, e a fé conta-se depois do conferente", iRet > 0 && iRet < iApl && iApl < iConf && iConf < iFe);
  const bloco = iFe > 0 ? APP.slice(iConf, APP.indexOf('calou("NE4 · a fé do turno", e)', iFe) + 40) : "";
  t("os quatro feitos: missão, principal, lendário e marco, por diferença", /missao: novas\.length,/.test(bloco) && /principal: novas\.filter\(\(m\) => m\.tipo === "principal"\)\.length,/.test(bloco)
    && /lendario: Math\.max\(0, depois\.lendarios - antesDaFe\.lendarios\),/.test(bloco) && /marco: Math\.max\(0, depois\.marcos - antesDaFe\.marcos\),/.test(bloco));
  t("a missão da lista antiga não conta duas vezes (pagaDoFecho já lhe pagou a fé)", /m\.veiculo !== VEICULO_DA_TAREFA_ANTIGA/.test(bloco));
  t("a frase do turno vai como o gesto devoto", /\{ frase: pedidoDaBolsa, feitos \}/.test(bloco));
  t("os efeitos vão por aplicarOsEfeitos, e só com divindade desperta", /aplicarOsEfeitos\(\{ estado: \{\}, efeitos: dFe\.efeitos, paraOCronista: dFe\.paraOCronista \}\)/.test(bloco) && /divindadeRef\.current && divindadeRef\.current\.despertar/.test(bloco));
  const rf = corpo("  const retratoDaFe = () => ({", "\n  });");
  t("o retrato lê o contador dos lendários, as missões concluídas e os marcos feitos", /lendariosDerrotados/.test(rf) && /m\.status === "concluida"/.test(rf) && /m && m\.feito/.test(rf));
  /* e a conta: um lendário caído neste turno dá fé de proeza */
  const dv = { despertar: true, nome: "A Chama", fieis: 10, pf: 0 };
  const r = aFeDoTurno({ divindade: dv, devocao: null, mapa: null, cidadeAtual: "", dia: 4, personagem: { nivel: 5 }, contadores: {} }, { frase: "", feitos: { missao: 0, principal: 0, lendario: 1, marco: 0 } });
  t("a peça: um lendário caído vale fé de proeza", r.fe && r.fe.magnitude === "proeza" && r.efeitos.some((e) => e.tipo === "divindade"), JSON.stringify(r.fe));
  const nada = aFeDoTurno({ divindade: dv, dia: 4, personagem: { nivel: 5 }, contadores: {} }, { frase: "", feitos: { missao: 0, principal: 0, lendario: 0, marco: 0 } });
  t("…e um turno sem feito nem gesto não mexe na fé", nada.fe === null && nada.efeitos.length === 0);
}

/* ============================================================ */
sec("§4b o chamado pela frase, contra o que o sistema tem à frente");
{
  t("o App importa chamadoNaFrase de raids.js", /import \{[^}]*\bchamadoNaFrase\b[^}]*\} from "\.\/raids\.js";/.test(APP));
  const am = corpo("  const ameacasConhecidas = () => {");
  t("a nêmesis cujo rosto foi visto e que ainda anda", /n && n\.nome && n\.conhecido && n\.status !== "derrotada"/.test(am));
  t("o chefe do marco da espinha (confronto, ou enfrentar sem matilha) onde o herói está", /marcoAtual\(espinhaRef\.current, \(historiaRef\.current \|\| \{\}\)\.etapa \|\| 0\)/.test(am) && /m\.feitio === "confronto"/.test(am) && /m\.quantos == null/.test(am) && /\[m\.cidade, m\.onde\]/.test(am));
  t("o lendário (ou chefe) de pé na luta aberta", /\(e\.chefe \|\| e\.ameaca === "lendario"\) && !e\.derrotado && !e\.fugiu && \(e\.vida \|\| 0\) > 0/.test(am));
  t("nada da prosa entra (nem falasDoMestre nem a narrativa)", am.length > 0 && !/falasDoMestre|narrativa|mensagensRef/.test(am));
  const ag = corpo("  const agirInterno = (texto) => {", "\n  const ");
  const iCh = ag.indexOf("const ch = chamadoNaFrase(acao,");
  t("o chamado lê-se antes das portas (o sino cairia no desafio)", iCh > 0 && iCh < ag.indexOf("for (let i = 0; i < cascata.atalhos.length;)"));
  t("com o nível do herói e as ameaças conhecidas", /chamadoNaFrase\(acao, \{ nivel: pC\.nivel, ameacas: ameacasConhecidas\(\) \}\)/.test(ag));
  t("abre só quando abrirONossoChamado abriria (sem raid, luta, masmorra nem acampamento)", /const livre = !raidRef\.current && !combateRef\.current && !\(masmorraRef\.current && !masmorraRef\.current\.encerrada\) && !acampadoRef\.current;/.test(ag) && /if \(ch && ch\.pode && livre\) \{[\s\S]{0,300}abrirONossoChamado\(ch\.chefe\);\s*return;/.test(ag));
  t("abaixo do nível, o veredito diz porquê, e o turno segue", /if \(ch && !ch\.pode\) pushMsgs\(\[\{ autor: "sistema", texto: `⚑ O chamado não é para você ainda: \$\{ch\.motivo\}\.` \}\]\);/.test(ag));
  t("em calou", /calou\("NE4 · o chamado pela frase", e\)/.test(ag));
  const A = [{ nome: "Vael, a Rainha Cinza" }, { nome: "Dragão de Cinza" }];
  t("a peça: com duas ameaças, a dita pela frase", (chamadoNaFrase("Toco o sino e convoco todos contra o dragão!", { nivel: NIVEL_MINIMO, ameacas: A }) || {}).chefe === "Dragão de Cinza");
  t("…e sem ameaça conhecida, não há chamado", chamadoNaFrase("Convoco os aliados!", { nivel: 20, ameacas: [] }) === null);
}

/* ============================================================ */
sec("§5 o fim do arco maior: o dado do descanso decide, o App fecha");
{
  const i = APP.indexOf("      eventosRef.current = r.eventos; setEventos(r.eventos);");
  const bloco = i > 0 ? APP.slice(i, APP.indexOf("if (r.globalNovo) {", i)) : "";
  t("logo depois dos eventos da noite, o arco que acabou passa por oFimDoEventoGlobal",
    /if \(r\.globalEncerrado\) \{[\s\S]*oFimDoEventoGlobal\(\{ historia: historiaRef\.current, eventos: r\.eventos \}, r\.globalEncerrado, \{ motorDoArco \}\)/.test(bloco));
  t("os efeitos (a história, o prompt) vão por aplicarOsEfeitos, e o envelope globalFim sobe", /aplicarOsEfeitos\(\{ estado: \{\}, efeitos: fim\.efeitos, paraOCronista: fim\.paraOCronista \}\)/.test(bloco) && /partes\.push\(oEnvelopeDoMundo\("globalFim", r\.globalEncerrado\)\)/.test(bloco));
  t("em calou", /calou\("NE4 · o fim do arco maior", e\)/.test(bloco));
  t("a forma globalFim existe no motor e diz o desfecho", /DESFECHO/.test(oEnvelopeDoMundo("globalFim", { nome: "A Guerra das Marés", etapas: ["a", "o porto caiu."] })));
}

/* ============================================================ */
sec("§6 a palavra do herói entra no caderno pela frase dele");
{
  t("o App importa sementeDaPalavra", /import \{[^}]*\bsementeDaPalavra\b[^}]*\} from "\.\/palavra-dada\.js";/.test(APP));
  const ag = corpo("  const agirInterno = (texto) => {", "\n  const ");
  const iB = ag.indexOf('calou("a bolsa da frase", e)'), iP = ag.indexOf("const sp = sementeDaPalavra(acao,");
  t("depois da bolsa da frase, antes de qualquer porta (corre em qualquer modo)", iB > 0 && iP > iB && iP < ag.indexOf("const sinais = sinaisDoTurno(acao);"));
  t("com quem está em cena e o grupo, e guardada no prometidoRef", /sementeDaPalavra\(acao, \{ presentes: aquiP, grupo: pP\.grupo \|\| \[\] \}\)/.test(ag) && /if \(sp\) prometidoRef\.current = guardarSementes\(prometidoRef\.current, \[sp\]\)\.estado;/.test(ag));
  t("o comando de teste («/…») não promete nada", /if \(!acao\.startsWith\("\/"\)\) \{\s*const pP = /.test(ag));
  t("em calou", /calou\("NE4 · a palavra do herói", e\)/.test(ag));
  const sp = sementeDaPalavra("Prometo a Marta que volto com o remédio antes da lua cheia.", { presentes: [{ nome: "Marta Sal" }], grupo: [] });
  const g = sp ? guardarSementes(garantirPrometido(null), [sp]) : null;
  t("a peça: a promessa da frase vira semente aberta no caderno", !!(g && g.guardadas.length === 1 && g.estado.sementes.some((s) => s.estado === "aberta")), JSON.stringify(sp));
}

/* ============================================================ */
sec("§7 a ficha da cena sem o Cronista: quem falou e a recência");
{
  t("o App importa aFichaDeAtor e oCronistaChama", /import \{ aFichaDeAtor \} from "\.\/motor\/ficha-de-ator\.js";/.test(APP) && /import \{[^}]*\boCronistaChama\b[^}]*\} from "\.\/motor\/portas-do-narrador\.js";/.test(APP));
  t("a ficha da cena: a do ator, ou — com o Cronista calado — a calculada sem o pedido",
    /let fichaDaCena = pedidoDoAtor \? pedidoDoAtor\.ficha : null;/.test(APP)
    && /if \(!oCronistaChama\(MODO_DA_MESA\)\) fichaDaCena = aFichaDeAtor\(\{ nota, frase: conteudo, estado: estadoDoPedido\(\), teste: testeDoTurnoRef\.current \}\);/.test(APP));
  t("quem falou (a recência dos vistos) sai da ficha da cena", /quemFalou: fichaDaCena \? fichaDaCena\.falam : null \}\)/.test(APP) && !/quemFalou: pedidoDoAtor \?/.test(APP));
  t("e o Cronista/registo da cena recebe a mesma ficha", /fichaDoAtor: fichaDaCena \};/.test(APP) && !/fichaDoAtor: pedidoDoAtor \?/.test(APP));
  t("em calou", /calou\("NE4 · a ficha da cena", e\)/.test(APP));
  t("no `mestre` o Cronista lê (a ficha fica nula, como antes); no `boca` não lê", oCronistaChama("mestre") === true && oCronistaChama("boca") === false);
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
