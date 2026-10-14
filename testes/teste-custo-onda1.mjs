/* teste-custo-onda1.mjs — a onda 1 do custo do turno (13/10/2026)

   A auditoria (mente/custo-do-turno.md) achou dois desperdícios que não
   compram nada para quem joga:

     1. o HISTÓRICO guardava, para cada fala antiga do jogador, a pauta
        inteira daquele turno — ~2.200 caracteres, dos quais ~150 de frase:
        73% do que o Narrador relia era ordem velha (janela.js,
        `memoriaDoTurno`);
     2. o CRONISTA lia todo turno, e voltava vazio em 114 de 197 leituras
        nas sessões 8–10 (gatilho-do-cronista.js, `decidirOCronista`).

   E um defeito de passagem: os VÍNCULOS saíam "Saoirse: 50/100
   (undefined)" no prompt (vinculos.js, `linhaDoVinculo`).

   As provas usam o que as sessões deram de verdade
   (`registo-s8-s10-cronista.json`: os 197 turnos que o Cronista leu, e as
   16 falas que o último pedido da 10.ª levava no histórico).

   Falha na árvore de antes (v9.469): `memoriaDoTurno`, o gatilho e
   `linhaDoVinculo` não existem; o App guarda `corpo` no histórico, chama o
   Cronista em todo turno e lê `m.rotulo`. */
import fs from "node:fs";
const J = await import("../src/janela.js");
const G = await import("../src/gatilho-do-cronista.js");
const V = await import("../src/vinculos.js");
const REG = JSON.parse(fs.readFileSync(new URL("./registo-s8-s10-cronista.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const PAUTA = "[PAUTA DO TURNO 64 — decidido pelo SISTEMA. É ETIQUETA DE SISTEMA.]\nONDE      em Nova clara\nNÃO PODE  Godfrey está em Monte Rasa\nO FECHO   termine em alguém em cena deixa uma fala a meio";
const TESTE = "[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA] Pedi um teste de Percepção (Percepção) para vasculhar o lugar. Sou treinado nisso. O sistema fixou a dificuldade em 13 e rolou: d20 4 + 6 = 10. Resultado: FALHA.";
const COMPRA = "[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei Botas de couro por ◉ 21, ao preço da banca. O que comprei já está comigo — não diga outro preço.";
const FORMA = "[A FORMA DESTA CENA — ESCOLHIDA PELO SISTEMA] Ponha na cena alguém de passagem com UM traço marcante.";

sec("1. A MEMÓRIA DO TURNO: a frase fica, a pauta sai");
{
  const m = J.memoriaDoTurno("Pergunto ao ferreiro quanto custa a espada.", `${PAUTA}\n${FORMA}`);
  t("a frase do jogador fica inteira", m.endsWith("Pergunto ao ferreiro quanto custa a espada."));
  t("e é a única coisa quando o sistema não decidiu número", m === "Pergunto ao ferreiro quanto custa a espada.", m);
  t("a pauta e o envelope de instrução saem", !/PAUTA|NÃO PODE|O FECHO|FORMA DESTA CENA/.test(m));
  const d = J.memoriaDoTurno("Vasculho o caixote.", `${PAUTA}\n${TESTE}\n${COMPRA}`);
  t("o teste e a compra ficam como marca, antes da frase", d === "[o sistema registou: teste de Percepção: FALHA · Comprei Botas de couro por ◉ 21]\nVasculho o caixote.", d);
  const tres = J.memoriaDoTurno("x", `${TESTE}\n${COMPRA}\n[DÉBITO — APLICADO PELO SISTEMA] Eu paguei 2 moedas, e o sistema JÁ TIROU.`);
  t("no máximo MEMORIA_DO_JOGADOR.marcasMax marcas", (tres.match(/ · /g) || []).length === J.MEMORIA_DO_JOGADOR.marcasMax - 1, tres);
  const longa = "[COMPRA — JÁ REGISTRADA PELO SISTEMA] Comprei " + "Espada longa de aço temperado com punho de osso ".repeat(3) + "por ◉ 45, ao preço.";
  const ml = J.memoriaDoTurno("x", longa).split("\n")[0].replace("[o sistema registou: ", "").replace(/\]$/, "");
  t("cada marca cabe em MEMORIA_DO_JOGADOR.letrasDaMarca", ml.length <= J.MEMORIA_DO_JOGADOR.letrasDaMarca, `${ml.length}`);
  t("nenhuma marca leva \"]\" por dentro (a etiqueta se lê até ao primeiro)", !J.MARCAS_DA_MEMORIA.some((x) => /\]/.test(String(x.ler(TESTE) || ""))));
  const rs = J.memoriaDoTurno("[RESPOSTA A Petra Guarda-Portão — DADA POR MIM] Pergunto a Petra Guarda-Portão porquê. Narre só a reação de Petra, em fala direta.", PAUTA);
  t("o turno do clique fica no título curto e na primeira frase", rs === "[RESPOSTA A Petra Guarda-Portão] Pergunto a Petra Guarda-Portão porquê.", rs);
  t("o clique que já é marca não se repete", J.memoriaDoTurno("[DÉBITO — APLICADO PELO SISTEMA] Eu paguei 2 moedas, e o sistema JÁ TIROU.", "") === "[o sistema registou: paguei 2 moedas]");
  t("nunca vazia (provedor recusa mensagem sem texto) e nunca estoura", J.memoriaDoTurno("", null) === "…" && J.memoriaDoTurno(undefined, undefined) === "…" && typeof J.memoriaDoTurno({}, 5) === "string");
  t("a frase longa corta em letrasDaFrase", J.memoriaDoTurno("a".repeat(2000), "").length === J.MEMORIA_DO_JOGADOR.letrasDaFrase);
  t("determinista", J.memoriaDoTurno("Vasculho.", `${PAUTA}\n${TESTE}`) === J.memoriaDoTurno("Vasculho.", `${PAUTA}\n${TESTE}`));
}

sec("2. NO HISTÓRICO REAL DA 10.ª: de ~2.200 caracteres para a frase");
{
  /* as falas em que a última linha do corpo é a frase do jogador (as outras
     terminam num envelope de várias linhas, e o corte delas não é o do App) */
  const doJogador = REG.historico.filter((c) => /^(Falo|Digo|Respondo|Entro|Seguro)/.test(c.split("\n").pop()));
  t("a amostra tem as falas do jogador", doJogador.length >= 8, `${doJogador.length}`);
  const pares = doJogador.map((c) => { const i = c.lastIndexOf("\n"); return { corpo: c, nota: c.slice(0, i), frase: c.slice(i + 1) }; });
  const mem = pares.map((p) => J.memoriaDoTurno(p.frase, p.nota));
  const antes = pares.reduce((a, p) => a + p.corpo.length, 0), depois = mem.reduce((a, m) => a + m.length, 0);
  t(`o histórico encolhe a menos de 15% (${antes} → ${depois} caracteres)`, depois < antes * 0.15, `${(depois / antes).toFixed(3)}`);
  t("e cada fala ainda termina na frase de quem jogou", mem.every((m, i) => m.endsWith(pares[i].frase.slice(0, J.MEMORIA_DO_JOGADOR.letrasDaFrase - 1).trim()) || m.length >= J.MEMORIA_DO_JOGADOR.letrasDaFrase - 1));
  t("sem pauta velha em nenhuma", mem.every((m) => !/PAUTA DO TURNO|NÃO PODE|O FECHO|REGRA DESTE ENVELOPE/.test(m)));
}

sec("3. O CACHE EXPLÍCITO CONTINUA ESTÁVEL ENTRE TURNOS");
{
  const SYS = "S".repeat(40541);
  const MOD = "gemini-3.8-flash";
  const narr = (i) => JSON.stringify({ narrativa: `narração ${i} ` + "n".repeat(900) });
  let hist = [];
  const turnos = Array.from({ length: 6 }, (_, i) => ({ conteudo: `Faço a coisa ${i}.`, nota: `${PAUTA.replace("64", String(i))}\n${i % 2 ? TESTE : FORMA}` }));
  let ficha = null, usos = 0, criados = 0;
  for (const [i, tu] of turnos.entries()) {
    const pedido = [...hist, { role: "user", content: `${tu.nota}\n[RODAPÉ]\n${tu.conteudo}` }];
    const d = J.decidirOCache({ ficha, system: SYS, mensagens: pedido, agora: i * 60e3, modelo: MOD });
    if (d.acao === "criar") { criados++; ficha = { nome: `c${i}`, modelo: MOD, m: d.m, impressao: d.impressao, expira: i * 60e3 + J.CACHE_EXPLICITO.ttlSegundos * 1000 }; }
    if (d.acao === "usar") usos++;
    hist = [...hist, { role: "user", content: J.memoriaDoTurno(tu.conteudo, tu.nota) }, { role: "assistant", content: narr(i) }];
  }
  t("depois do primeiro cache, os turnos usam o mesmo (a mensagem guardada nunca muda)", criados === 1 && usos === turnos.length - 2, `criados ${criados}, usos ${usos}`);
  const h2 = []; for (const tu of turnos) h2.push({ role: "user", content: J.memoriaDoTurno(tu.conteudo, tu.nota) });
  t("a mesma conversa dá a mesma impressão do prefixo (byte a byte)", J.impressaoDoPrefixo(SYS, h2, 6) === J.impressaoDoPrefixo(SYS, turnos.map((tu) => ({ role: "user", content: J.memoriaDoTurno(tu.conteudo, tu.nota) })), 6));
}

sec("4. O GATILHO DO CRONISTA: o que acende");
{
  const base = { conhecidos: ["Nyla Punho-de-Pedra", "Saoirse", "Monte Rasa"] };
  t("nome próprio novo no meio da frase acende", G.decidirOCronista({ ...base, narrativa: "Você vê que o ferreiro Brannoc da Foz guarda a porta." }).motivos.includes("nome"));
  t("o nome conhecido não acende (e o pedaço do nome também é dele)", !G.decidirOCronista({ ...base, narrativa: "Você olha e a Nyla responde, e Saoirse ri." }).corre);
  t("maiúscula de começo de frase ou de fala não é nome", G.nomesProprios("Cobram caro. — Passem, diz ela. Antes de tudo.").length === 0);
  t("os nomes compostos saem inteiros", JSON.stringify(G.nomesProprios("e então Petra Guarda-Portão chamou a Ordem dos Esquecidos")) === JSON.stringify(["Petra Guarda-Portão", "Ordem dos Esquecidos"]));
  t("a palavra comum de NAO_SAO_NOMES não é nome", G.nomesProprios("e Ela ficou, e Depois saiu").length === 0);
  t("a frase com destino acende o lugar", G.decidirOCronista({ ...base, frase: "Vou até a forja do Tomas.", narrativa: "x" }).motivos.includes("movimento"));
  t("\"vou perguntar\" não é movimento", !G.decidirOCronista({ ...base, frase: "Vou perguntar a Nyla o preço.", narrativa: "x" }).corre);
  t("o movimento que o sistema registou não acende (SISTEMA_MOVEU)", !G.decidirOCronista({ ...base, frase: "Desço a escada.", envelopes: ["[MOVIMENTO — REGISTRADO PELO SISTEMA] Eu me desloquei."], narrativa: "x" }).corre);
  t("o passo dado pela narração acende", G.decidirOCronista({ ...base, narrativa: "Você desce ao porão com Saoirse." }).motivos.includes("passo"));
  t("\"você\" com acento conta como palavra (o \\b do JavaScript não conta)", G.decidirOCronista({ ...base, narrativa: "— Vou com você até o fim — diz Saoirse." }).motivos.includes("grupo"));
  t("o trabalho oferecido acende", G.decidirOCronista({ ...base, narrativa: "Ela diz que tem um serviço para quem souber calar." }).motivos.includes("trabalho"));
  t("a promessa dita acende", G.decidirOCronista({ ...base, narrativa: "— Eu juro que volto por ti." }).motivos.includes("promessa"));
  t("a luta de pé acende sempre", G.decidirOCronista({ ...base, narrativa: "x", emLuta: true }).motivos.includes("luta"));
  t("o deus desperto acende sempre (a fé é por turno)", G.decidirOCronista({ ...base, narrativa: "x", fe: true }).motivos.includes("fe"));
  t("a abertura e a retomada acendem", G.decidirOCronista({ ...base, narrativa: "x", envelopes: ["[ABERTURA DA CAMPANHA] Primeiro turno."] }).motivos.includes("cena"));
  t("lixo não estoura", G.decidirOCronista(null, null).corre === false && G.decidirOCronista({ narrativa: 5, envelopes: "x", conhecidos: null }).corre === false);
}

sec("5. A FILA E A REDE: o que não lê agora, lê depois");
{
  let e = G.garantirLeitura(null);
  t("o estado vazio", JSON.stringify(e) === JSON.stringify({ pulos: 0, fila: [], vistos: [] }));
  e = G.pularALeitura(e, "narração um");
  e = G.pularALeitura(e, "narração dois");
  t("dois pulos e duas na fila", e.pulos === 2 && e.fila.length === 2);
  t(`no ${G.REDE_DO_CRONISTA.pulosMax + 1}.º turno a rede lê, mesmo sem gatilho`, G.decidirOCronista({ narrativa: "nada aqui" }, e).motivos.join() === "rede");
  const bloco = G.blocoDaFila(e);
  t("a leitura leva a fila, mais antiga primeiro, antes da narração do turno", /NARRATIVAS ANTERIORES AINDA NÃO LIDAS/.test(bloco) && bloco.indexOf("narração um") < bloco.indexOf("narração dois"));
  t("e diz que o lugar, o teste e a luta são só do turno", /"lugar", "teste_sugerido" e "combate" são SÓ da narrativa do turno/.test(bloco));
  e = G.lerALeitura(e, "Você conhece Brannoc da Foz e a mulher.");
  t("depois de ler, a fila zera e o nome passa a visto", e.pulos === 0 && e.fila.length === 0 && e.vistos.includes("brannoc da foz"));
  t("e o nome visto não acende de novo", !G.decidirOCronista({ narrativa: "Você vê que o ferreiro Brannoc da Foz sorri." }, e).corre);
  t("sem fila, sem bloco", G.blocoDaFila(e) === "");
  const sujo = G.garantirLeitura({ pulos: 99, fila: ["a", 3, "", "b", "c", "d"], vistos: [1, "x".repeat(99)] });
  t("o estado vindo de fora é cercado (pulos, filaMax, letrasDoNome)", sujo.pulos === G.REDE_DO_CRONISTA.pulosMax && sujo.fila.length === G.REDE_DO_CRONISTA.filaMax && sujo.vistos[0].length === G.REDE_DO_CRONISTA.letrasDoNome);
  t("a narração da fila corta em letrasPorNarrativa", G.pularALeitura(null, "y".repeat(9000)).fila[0].length === G.REDE_DO_CRONISTA.letrasPorNarrativa);
}

sec("6. NAS SESSÕES 8–10: o gatilho contra o que o Cronista registou de verdade");
{
  const rows = [];
  for (const ses of ["s8", "s9", "s10"]) {
    let est = G.garantirLeitura(null);
    for (const tu of REG.turnos.filter((x) => x.ses === ses)) {
      const d = G.decidirOCronista({ narrativa: tu.narrativa, frase: tu.frase, envelopes: tu.envelopes, conhecidos: tu.conhecidos, emLuta: tu.emLuta }, est);
      const naFila = d.corre ? G.blocoDaFila(est) : "";
      rows.push({ tu, corre: d.corre, rede: d.motivos.length === 1 && d.motivos[0] === "rede", naFila });
      est = d.corre ? G.lerALeitura(est, tu.narrativa) : G.pularALeitura(est, tu.narrativa);
    }
  }
  /* cada narração que não foi lida no turno tem de aparecer na fila da
     leitura seguinte da mesma sessão — é isso que faz da hora uma escolha
     sem perda */
  const perdidas = rows.filter((r, i) => {
    if (r.corre) return false;
    const prox = rows.slice(i + 1).find((x) => x.tu.ses === r.tu.ses && x.corre);
    return prox ? !prox.naFila.includes(r.tu.narrativa.slice(0, 200)) : false;
  });
  const U = rows.filter((r) => r.tu.util.length), A = rows.filter((r) => r.tu.agora.length);
  const lidas = rows.filter((r) => r.corre).length;
  const lidoUtil = U.filter((r) => r.corre).length, lidoAgora = A.filter((r) => r.corre).length;
  const semFim = rows.filter((r, i) => !r.corre && !rows.slice(i + 1).some((x) => x.tu.ses === r.tu.ses && x.corre));
  console.log(`      leituras ${lidas}/${rows.length} · útil lido no turno ${lidoUtil}/${U.length} · o que não pode esperar ${lidoAgora}/${A.length} · sem leitura depois (fim da sessão) ${semFim.length}`);
  t("nenhuma narração se perde: a que não leu entra na leitura seguinte", perdidas.length === 0, perdidas.map((r) => r.tu.ses + "#" + r.tu.k).join(" "));
  /* o recall que conta é o de TODO o útil: lido no turno ou na fila da
     leitura seguinte (no máximo REDE_DO_CRONISTA.pulosMax turnos depois) */
  const utilCoberto = U.filter((r) => r.corre || !semFim.includes(r)).length;
  t(`todo o útil é lido (${utilCoberto}/${U.length}), no turno ou até ${G.REDE_DO_CRONISTA.pulosMax} turnos depois`, utilCoberto / U.length >= 0.95);
  /* o que não pode esperar: 30 de 36 na medida de 13/10. Os seis que atrasam
     são o Cronista a rebatizar o lugar sem passo nenhum ("cidade" dentro da
     taverna, "posto na estrada" com o herói parado) e o companheiro que fala
     — lidos um ou dois turnos depois, sem perda */
  t(`o que não pode esperar é lido no turno em ≥ 80% (${lidoAgora}/${A.length})`, lidoAgora / A.length >= 0.8);
  t(`e o Cronista cala em boa parte dos turnos vazios (lê ${rows.filter((r) => r.corre && !r.tu.util.length).length} de ${rows.length - U.length})`, rows.filter((r) => r.corre && !r.tu.util.length).length / (rows.length - U.length) <= 0.55);
  t(`as leituras caem para ≤ 60% dos turnos (${lidas}/${rows.length})`, lidas / rows.length <= 0.6);
}

sec("7. O VÍNCULO DIZ O MARCO PELO NOME");
{
  t("\"Saoirse: 50/100 (Amizade)\"", V.linhaDoVinculo("Saoirse", 50) === "Saoirse: 50/100 (Amizade)");
  t("abaixo do primeiro marco, conhecidos", V.linhaDoVinculo("Falk", 10) === "Falk: 10/100 (conhecidos)");
  t("nenhum marco dá \"undefined\"", [0, 25, 50, 75, 100, null, "x"].every((v) => !/undefined/.test(V.linhaDoVinculo("A", v))));
}

sec("8. A FIAÇÃO NO App.jsx");
{
  t("o histórico guarda a memória do turno, com o corpo de rede", APP.includes("memoriaDoJogador = memoriaDoTurno(conteudo, nota) || corpo") && APP.includes('{ role: "user", content: memoriaDoJogador }'));
  t("o turno de agora continua com a pauta inteira e a frase por último (MM18)", APP.includes('const novoHist = [...base, { role: "user", content: pedidoFinal }];'));
  t("a leitura do Cronista vai ao save e volta no load", APP.includes("leituraDoCronista: leituraDoCronistaRef.current,") && APP.includes("garantirLeitura(sv.leituraDoCronista)"));
  const iG = APP.indexOf("gatilho = decidirOCronista("), iC = APP.indexOf('txt = await chamarModelo(sys, [{ role: "user", content: user }], 900, "json", "leve")');
  t("o gatilho decide antes da chamada, e a chamada só corre com ele", iG > 0 && iC > iG && APP.includes("if (gatilho.corre) {"));
  t("a fila entra no pedido ao Cronista, antes da narração do turno", APP.includes("${filaDoCronista}NARRATIVA DO TURNO:"));
  t("o turno entrega a frase e os envelopes ao gatilho", APP.includes("cronistaDoTurno(pers, narrativaFinal, doTurnoCr)"));
  const calados = ["a memória do turno", "o gatilho do Cronista", "a fila do Cronista", "o pulo do Cronista", "a leitura do Cronista", "a leitura do Cronista no load", "o turno para o gatilho do Cronista"];
  t("toda peça nova cala o próprio erro (nunca custa o turno)", calados.every((c) => APP.includes(`calou("${c}"`)), calados.filter((c) => !APP.includes(`calou("${c}"`)).join(", "));
  t("os vínculos saem pela linha do módulo", APP.includes("return linhaDoVinculo(c.nome, v);") && !APP.includes('(${m ? m.rotulo : "conhecidos"})'));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
