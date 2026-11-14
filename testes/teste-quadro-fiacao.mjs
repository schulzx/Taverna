/* ============================================================
   QQ · Q3 — A FIAÇÃO DO QUADRO DA QUEST NO APP (oficial, 14/11/2026)

   O backend fez o motor (src/quadro-da-quest.js, provado em
   testes/teste-quadro-da-quest.mjs) e o aprendiz a peça
   (src/painel-quadro.jsx, testes/teste-quadro-na-tela.mjs). Nada disto
   chegava a quem joga até o App os chamar com o estado que só ele tem.
   Esta suíte prova (mente/plano-quadro.md §11):

     §1 o save: o ref, CAMPOS, o retrato, o load e a campanha nova em calou,
        a sala sem o campo, e o ref na tabela da pauta
     §2 o teste: os quadros antes do MC5, `passou` e não `bateu`, a memória,
        tudo em calou, no ramo do pedido
     §3 o que a carta virada faz: o facto pela porta, o preço e o custo pelas
        portas do fim do turno, os minutos fora da luta, o objeto na bolsa
     §4 o gesto sem dado, em agirInterno (depois do que a proposta pagou),
        sem cobrar duas vezes e sem custar o turno
     §5 o veredito antes do clique: o chamado diz o «se falhar» da carta
     §6 a tela: o sinal na barra, a gaveta, o momento — nada nasce no render
     §7 um turno de prova em ordem de App: a busca falhada no curral vira a
        carta com preço, o preço entra no estado, e o passo anda
     §8 a pauta: O CASO e o veto saem do motor da pauta com o estado do App
     §9 a medida contra o TETO_DA_PAUTA (500 cenas semeadas, com e sem luta)

   Falha na árvore de 9910e68 (o motor e a peça sem fiação) e passa nesta. */
import { readFileSync } from "node:fs";
import {
  osQuadrosDoEstado, virarCarta, aCartaDoTeste, aCartaEmJogo, aplicarPrecoDoQuadro, oQuadroNaPauta, oQuadroDaQuest,
  QUADRO_NA_PAUTA, PRECO_DA_FALHA,
} from "../src/quadro-da-quest.js";
import { BIBLIOTECA_DE_QUESTS, abrirQuest, PAPEIS_DA_QUEST } from "../src/biblioteca-de-quests.js";
import { garantirHistoria } from "../src/historia.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { oLivroDoAchado } from "../src/a-quest-manda.js";
import { garantirQuestsDaEspinha, oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto } from "../src/esqueleto.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo } from "../src/mundo-base.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { CAMPOS } from "../src/estado.js";
import { porNaPauta, textoDaPauta, cederNaCena, SECOES, SECOES_QUE_CEDEM, TETO_DA_PAUTA } from "../src/pauta.js";
import { aPautaDoTurno, REFS_DA_PAUTA } from "../src/motor/pauta-do-turno.js";
import { hashSemente, rng } from "../src/semente.js";

let ok = 0, mal = 0;
const t = (nome, cond, info) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (info ? "  — " + info : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const BARRA = readFileSync(new URL("../src/painel-mesa-do-mestre.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
/* o corpo de uma função do App, da âncora até ao fecho dela (a indentação de dois espaços) */
const corpo = (ancora) => { const i = APP.indexOf(ancora); return i < 0 ? "" : APP.slice(i, APP.indexOf("\n  };\n", i) + 5); };
const CONCLUIR = corpo("  const concluirRolagem = (valor, dadoAnterior = null) => {");
const PEDIDO = CONCLUIR.slice(CONCLUIR.indexOf('if (r.origem === "pedido") {'));
const APLICA = corpo("  const aplicarACartaVirada = (vira, quadro, o) => {");
const GESTO = corpo("  const aCartaDoGestoAgora = (acao, jaPagou = 0) => {");
const ADJ = corpo("  const adjudicarAcao = (acao) => {");
const iAgir = APP.indexOf("    let pagoNaProposta = 0;");
const AGIR = iAgir < 0 ? "" : APP.slice(iAgir, APP.indexOf('calou("Q3 · o gesto da frase", e); }', iAgir) + 40);
const CHAMADO = corpo("  const comACartaEmJogo = (ch, v, frase) => {");

/* ============================================================ */
sec("§1 o save — campo novo, aditivo, e a sala não cresce");
{
  t("o App importa o motor do quadro", /import \{[^}]*osQuadrosDoEstado[^}]*virarCarta[^}]*aCartaDoTeste[^}]*aCartaDoGesto[^}]*aCartaEmJogo[^}]*garantirQuadro[^}]*aplicarPrecoDoQuadro[^}]*\} from "\.\/quadro-da-quest\.js";/.test(APP));
  t("…e a peça (o sinal, a gaveta, o momento)", /import \{ SinalDoQuadro, GavetaDoQuadro, PistaQueVira \} from "\.\/painel-quadro\.jsx";/.test(APP));
  t("o ref nasce com garantirQuadro(null), ao lado do livro de factos", /const factosRef = useRef\(garantirFactos\(null\)\);[^\n]*\n(?:\s*\/\*[\s\S]*?\*\/\n)?\s*const quadroRef = useRef\(garantirQuadro\(null\)\);/.test(APP));
  const iF = CAMPOS.findIndex((c) => c.campo === "factos" || c.id === "factos" || c.nome === "factos");
  const nomes = CAMPOS.map((c) => c.campo || c.id || c.nome);
  /* depois do `saber`, e não logo depois de `factos` como o plano dizia: a teste-bq2-app lê «memoria, factos, saber» à letra no retrato */
  t("CAMPOS: `quadro` com a memória do herói (depois de `factos` e `saber`)", iF >= 0 && nomes[iF + 1] === "saber" && nomes[iF + 2] === "quadro", J(nomes.slice(iF - 1, iF + 3)));
  t("o retrato leva quadro na ordem de CAMPOS", /factos: factosRef\.current, saber: saberRef\.current, quadro: quadroRef\.current,/.test(APP));
  t("o load lê o quadro em calou, com o vazio no erro", APP.includes('try { quadroRef.current = garantirQuadro(sv.quadro); quadroVistoRef.current = null; } catch (e) { calou("o quadro do save", e); quadroRef.current = garantirQuadro(null); }'));
  t("a campanha nova começa o quadro vazio (o capítulo guarda-o, como o livro)", /if \(!cap\) factosRef\.current = garantirFactos\(null\); if \(!cap\) \{ try \{ quadroRef\.current = garantirQuadro\(null\);/.test(APP));
  /* tirado em publicarEstado, e não na desestruturação do salvar: cinco suítes leem essa linha à letra */
  t("a sala não leva o quadro (o protocolo não cresce)", APP.includes('const { quadro: _quadroDoHeroi, ...save } = dados && typeof dados === "object" ? dados : {};') && APP.includes("mandarRecado(RECADOS.estado, { sala: { ...m, versao: m.versao + 1 }, save });"));
  const R = REFS_DA_PAUTA.quadro;
  t("a tabela da pauta tem o ref (salvo, só lido) com o valor de partida do App", !!R && R.ref === "quadroRef" && R.salvo === true && R.escreve === false && J(R.padrao()) === J({ v: 1, cartas: {} }), J(R && R.padrao()));
  t("e o App dá-lhe o ref (refsDaPauta)", /const refsDaPauta = \(\) => \(\{[\s\S]*?\bquadroRef\b[\s\S]*?\}\);/.test(APP));
}

/* ============================================================ */
sec("§2 o teste do sistema vira a carta (concluirRolagem)");
{
  const iQ = PEDIDO.indexOf("quadrosDoTeste = des ? quadrosAgora() : [];");
  const iMC5 = PEDIDO.indexOf("escreverODescobriu((facto && facto.achado)");
  const iJuiz = PEDIDO.indexOf("aCartaDoTeste(quadrosDoTeste,");
  t("no ramo do pedido, os quadros são lidos ANTES do MC5 escrever o achado", iQ > 0 && iMC5 > iQ);
  t("…e o juiz corre DEPOIS dele", iJuiz > iMC5);
  t("o resultado é `passou` (o «sim, pago» do catálogo já cobrou: um preço só por dado)", /resultado: passou \? "sucesso" : "falha", passou, total, dc,/.test(PEDIDO) && !/aCartaDoTeste\([^)]*bateu/.test(PEDIDO));
  t("o onde é o do passo, com quem está à vista", /\{ \.\.\.ondeDoPasso\(\), emCena: presentesAgora\(\) \}/.test(PEDIDO));
  t("virarCarta com a memória do quadro e o dia", /virarCarta\(quadroQ, alvoQ\.veredito, \{ carta: alvoQ\.carta, caminho: alvoQ\.caminho, memoria: quadroRef\.current, dia: diaRef\.current \}\)/.test(PEDIDO));
  t("a carta virada vai à porta única, com o pago, o achado do MC5 e o informante já contado", /aplicarACartaVirada\(viraQ, quadroQ, \{ pago: !!alvoQ\.pago, achado: achadoDoTeste, jaConsultou \}\)/.test(PEDIDO));
  t("tudo em calou: um quadro que estoura nunca custa o turno", /\} catch \(e\) \{ calou\("Q3 · a carta do teste", e\); \}/.test(PEDIDO) && /\} catch \(e\) \{ calou\("Q3 · os quadros do teste", e\); \}/.test(PEDIDO));
}

/* ============================================================ */
sec("§3 o que a carta virada faz (a porta única)");
{
  t("a memória vai ao ref do save", /quadroRef\.current = vira\.memoria;/.test(APLICA));
  t("o nome para a porta é o do registo (o juiz), nunca a alcunha da face", /const nomeReal = String\(juiz\.nome \|\| ""\);/.test(APLICA) && !/escreve\.nome/.test(APLICA));
  t("descobriu: pelo livro do achado, salvo se o MC5 já o escreveu (mesma quest e etapa)", /a\.quest === vira\.achado\.quest && a\.etapa === vira\.achado\.etapa/.test(APLICA) && /if \(!ja\) escreverODescobriu\(vira\.achado\);/.test(APLICA));
  t("conversou: o livro com falouCom", /anotarNoLivro\("Q3 · a carta", \{ falouCom: \[nomeReal\] \}\);/.test(APLICA));
  t("consultou: registrarConsulta, salvo se a conta social já o fez", /registrarConsulta\(npcsRef\.current, nomeReal\)/.test(APLICA) && /op\.jaConsultou/.test(APLICA));
  t("o preço e o custo de uma vez, pelas portas do fim do turno", /aplicarPrecoDoQuadro\(estadoDasQuests\(\), vira\.preco, \{ custo: vira\.custo, pago: !!op\.pago,/.test(APLICA) && /aplicarAsQuests\(pr, "Q3 · o preço"\)/.test(APLICA));
  t("os minutos andam o relógio, e só fora da luta", /if \(pr && pr\.minutos > 0 && !combateRef\.current\) \{\s*const tx = avancarMinutos\(pr\.minutos\);/.test(APLICA));
  t("o objeto entra na bolsa (com a marca, se chegou partido)", /const item = \(pr && pr\.objeto\) \|\| objeto;/.test(APLICA));
  t("e o momento mostra-se com a carta para a tela (a lista branca), lida do quadro já com a memória nova", APLICA.includes("mostrarAPista(vira, quadro);") && APP.includes("const carta = fonte && aCartaNaTela(fonte);") && APP.includes("const q2 = quadrosAgora().find((q) => q.quest === (quadro && quadro.quest));"));
  t("cada porta no seu calou", ["Q3 · o facto da carta", "Q3 · o preço da carta"].every((n) => APLICA.includes(`calou("${n}", e)`)));
}

/* ============================================================ */
sec("§4 o gesto sem dado (agirInterno)");
{
  /* MOVIDA da receita (plano-quadro §11, 6, que o punha em adjudicarAcao no «sem teste»): o despachante só chama
     adjudicarAcao quando HÁ teste, logo ali o gesto nunca corria; e o «pago a quem sabe» passa antes pela proposta
     da frase, que já tira a moeda — visto no navegador (14/11): 15 → 5 moedas, e a carta não virou. */
  t("o gancho mora em agirInterno, depois do que a proposta pagou, e conta com isso", AGIR.includes("if (lado.pagar) pagoNaProposta = Number(lado.pagar.total) || 0;") && AGIR.includes("aCartaDoGestoAgora(acao, pagoNaProposta)"));
  t("só quando a frase não é um teste (o teste vira pelo dado) e fora da luta", AGIR.includes('if (!acao.startsWith("/") && !combateRef.current && !veredictoDaAcao(acao)) aCartaDoGestoAgora'));
  t("adjudicarAcao ficou como era (o gancho morto saiu)", ADJ.includes("const v = veredictoDaAcao(acao);\n    if (!v) return false;") && !ADJ.includes("aCartaDoGestoAgora"));
  /* Alargada a 14/11 (28cd0cd): o gesto passa também o `pago` da frase; a leitura da bolsa é a mesma. */
  t("o gesto lê a bolsa (mais o que a proposta já tirou), a pessoa chamada e quem está à vista", GESTO.includes("moedas: (Number((fichaViva() || {}).moedas) || 0) + pago, ...(pago > 0 ? { pago } : {}) }, { ...ondeDoPasso(), emCena: presentes })"));
  /* Movida a 14/11 (28cd0cd): o pagamento a menos passou a ser regra do motor (PAGAR_A_MENOS:
     a essencial vira incompleta, a extra não vira); o App só passa o que a frase já pagou e
     respeita o `pago` que o motor devolve — a intenção (nunca cobrar duas vezes) continua. */
  t("o App passa o que a frase pagou, e o custo não se cobra outra vez", GESTO.includes("...(pago > 0 ? { pago } : {})") && GESTO.includes("if (!g) return false;") && GESTO.includes("aplicarACartaVirada(vira, quadro, { pago: !!g.pago })"));
  t("em calou (os dois)", GESTO.includes('calou("Q3 · a carta do gesto", e); return false;') && AGIR.includes('calou("Q3 · o gesto da frase", e);'));
}

/* ============================================================ */
sec("§5 o veredito antes do clique — o chamado sabe que há carta em jogo");
{
  t("as duas portas do chamado passam por comACartaEmJogo, com a frase (chamadoDoVeredito fica como era)", APP.includes("const chamado = comACartaEmJogo(chamadoDoVeredito(v, op.mod), v, op.frase);") && APP.includes("chP = comACartaEmJogo(chamadoDoVeredito(v, mod), v, p.frase);") && APP.includes("return oChamado(v, ctxDoChamado(mod)) || null;"));
  t("a carta é a de aCartaEmJogo (a mesma que o dado virará)", /aCartaEmJogo\(qs, \{ \.\.\.v, frase: String\(frase \|\| ""\) \}, \{ \.\.\.ondeDoPasso\(\), emCena: presentesAgora\(\) \}\)/.test(CHAMADO));
  t("o «se falhar» sai das palavras do quadro (uma ação, uma forma)", /PALAVRAS_DO_QUADRO/.test(CHAMADO) && /fichasDoSeFalhar\(\[\{ seFalhar: c\.seFalhar \}\]\)/.test(CHAMADO));
  t("e a carta vai no chamado (aditivo: a bandeja pode pôr o leque)", /carta: Object\.freeze\(\{ forma: c\.forma, tipo: c\.tipo, seFalhar: c\.seFalhar/.test(CHAMADO));
  t("em calou, e o chamado de antes volta no erro", /calou\("Q3 · a carta no chamado", e\); return ch;/.test(CHAMADO));
}

/* ============================================================ */
sec("§6 a tela — o sinal, a gaveta e o momento");
{
  t("a Barra do Mestre tem a ranhura `pistas`, antes da hora", /emCena = null, pistas = null, children \}\) \{/.test(BARRA) && /\{pistas\}\n\s*<button type="button" onClick=\{aoAbrirTempo\}/.test(BARRA));
  t("o App põe o sinal nela, com a gota, o aceso e o aberto", /pistas=\{pistasDaTela && !fogueiraNaPagina \? \(/.test(APP) && /<SinalDoQuadro sinal=\{pistasDaTela\.sinal\} telefone=\{!mesaLarga\} novo=\{pistasDaTela\.novo\} aceso=\{sinalAceso\}/.test(APP));
  /* Alargada a 14/11 (as cartas no Diário): a gaveta abre na quest pedida pelo Diário se houver; do
     sinal, sempre na da vez (alternarOQuadro esquece a pedida). A intenção continua. */
  t("a gaveta abre do sinal; tocar num caminho escreve no campo e fecha", APP.includes("<GavetaDoQuadro quadros={pistasDaTela.quadros} questDaVez={(questDoQuadro && pistasDaTela.quadros.some((q) => q.quest === questDoQuadro)) ? questDoQuadro : pistasDaTela.daVez} aberta") && /const abre = !quadroAberto;[\s\S]{0,140}setQuestDoQuadro\(null\);/.test(APP) && /aoEscrever=\{escreverOCaminho\} devolverFocoA=\{sinalDoQuadroRef\}/.test(APP) && /setEntrada\(texto\);\s*setQuadroAberto\(false\);/.test(corpo("  const escreverOCaminho = (verbo) => {")));
  t("os quadros vão à tela pela lista branca (oQuadroNaTela)", /brutos\.map\(\(q\) => oQuadroNaTela\(q\)\)/.test(APP));
  t("o momento: PistaQueVira com o turno seguinte a saltar e o voo ao sinal", /<PistaQueVira vira=\{pistaQueVira\.vira\} misterio=\{pistaQueVira\.misterio\} alvoRef=\{sinalDoQuadroRef\} saltar=\{saltoDaPista\}/.test(APP) && /if \(pistaQueVira\) setSaltoDaPista\(\(n\) => n \+ 1\);/.test(APP));
  t("o sinal acende só no ganho (uma perda não acende)", /if \(p && p\.vira && !p\.vira\.perdeu\) \{\s*setSinalAceso\(true\);/.test(APP));
  t("cada peça calada pelo seu limite (uma que estoura não leva a cena)", (APP.match(/<LimiteDasFichas key=\{?"(?:pistas|quadro\||pista\|)/g) || []).length === 3);
  t("nenhuma peça do quadro nasce dentro do App (a lei do foco)", !/function (SinalDoQuadro|GavetaDoQuadro|PistaQueVira|CartaDePista)\b/.test(APP) && !/const (SinalDoQuadro|GavetaDoQuadro|PistaQueVira) =/.test(APP));
}

/* ============================================================
   O mundo de prova: o mistério de teste-quadro-da-quest §7 (a caçada do
   que desce ao anoitecer), agora pelas mãos do App.
   ============================================================ */
const semente = "QQ1|0";
const mundo = { semente };
const cat = BIBLIOTECA_DE_QUESTS.filter((q) => ["o_que_desce_ao_anoitecer", "o_ultimo_a_sair"].includes(q.id));
const mapa = gerarGeografia(semente, null, null);
const espinha0 = estenderEspinha({ semente, mapa, estrutura: "misterio", cidadeInicial: mapa.cidades[0].nome, antecedente: "soldado", dia: 1 });
const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "soldado", grupo: [] });
const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "soldado", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: cat });
let E = { espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "misterio", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: { nome: "Vera", grupo: [], inventario: [], moedas: 100 }, npcs: {}, canone: {}, factos: garantirFactos(null), saber: [], dia: 1, npcTurno: 0, quadro: null };
const turno = () => { const r = oTurnoDasQuests(E, { mundo }); if (r) E = { ...E, ...r.estado }; };
turno();
const Rq = () => garantirQuestsDaEspinha(E.espinha.quests).registos.find((r) => r.id === "o_que_desce_ao_anoitecer");

/* ============================================================ */
sec("§7 um turno de prova, em ordem de App: a busca falhada no curral");
{
  const R = Rq();
  const curral = R.papeis.curral, toca = R.papeis.toca;
  E = { ...E, cidadeAtual: curral.cidade, lugar: { nome: curral.nome, cidade: curral.cidade } };
  E = { ...E, factos: anotarOLivro(E, { lugar: E.lugar, dia: 1, turno: 20 }, { mundo }).factos };
  turno();
  /* o chamado, antes do dado: a mesma carta, e o «se falhar» dela */
  const des = { id: "buscar", pericia: "investigacao" };
  const antes = aCartaEmJogo(osQuadrosDoEstado(E, { mundo }), { ...des, frase: "reviro a palha" }, { lugar: curral.nome, cidade: curral.cidade, emCena: [] });
  t("antes do dado, o chamado sabe que a busca vira a carta do curral, com os preços possíveis", antes && antes.carta === "rasto:descobriu:curral" && antes.seFalhar.length > 0, J(antes));
  /* concluirRolagem: os quadros antes do MC5, o juiz, virarCarta, a porta */
  const quadrosDoTeste = osQuadrosDoEstado(E, { mundo });
  const passou = false, total = 4, dc = 16;
  const alvo = aCartaDoTeste(quadrosDoTeste, { ...des, resultado: passou ? "sucesso" : "falha", passou, total, dc, frase: "reviro a palha" }, { lugar: curral.nome, cidade: curral.cidade, emCena: [] });
  t("o juiz acha a mesma carta e o mesmo caminho que o chamado anunciou", alvo && alvo.carta === antes.carta && alvo.caminho === antes.caminho);
  const quadro = quadrosDoTeste.find((q) => q.quest === alvo.quest);
  const vira = virarCarta(quadro, alvo.veredito, { carta: alvo.carta, caminho: alvo.caminho, memoria: E.quadro, dia: E.dia });
  t("a falha vira a carta, com um preço que estava anunciado", vira && vira.carta.estado === "preco" && antes.seFalhar.some((s) => s.id === vira.preco.id), J(vira && vira.preco));
  /* a porta única: a memória, o facto (descobriu), o preço */
  E = { ...E, quadro: vira.memoria, factos: oLivroDoAchado(E.factos, vira.achado, { dia: 1, turno: 30 }) };
  const pr = aplicarPrecoDoQuadro(E, vira.preco, { custo: vira.custo, pago: !!alvo.pago });
  t("o preço sai pelas portas do fim do turno (a forma de oTurnoDasQuests)", pr && typeof pr.estado === "object" && Array.isArray(pr.linhas) && Array.isArray(pr.efeitos));
  const id = vira.preco.id;
  const minutosDaTabela = (PRECO_DA_FALHA[id].efeitos.find((e) => e.tipo === "minutos") || {}).n || 0;
  t("os minutos do preço voltam ao App para o relógio (×2 no mistério)", pr.minutos === minutosDaTabela * 2, `${id}: ${pr.minutos}`);
  if (id === "alerta") t("o alerta avisa o vilão (o saber) e adianta-lhe o relógio (a espinha)", !!pr.estado.saber && !!pr.estado.espinha);
  if (id === "cobra") t("a cobrança tira as moedas da ficha", pr.estado.personagem && pr.estado.personagem.moedas < E.personagem.moedas);
  E = { ...E, ...pr.estado };
  /* e o passo anda: com a carta e a toca */
  E = { ...E, cidadeAtual: toca.cidade, lugar: { nome: toca.nome, cidade: toca.cidade } };
  E = { ...E, factos: anotarOLivro(E, { lugar: E.lugar, dia: 1, turno: 40 }, { mundo }).factos };
  turno();
  t("ninguém fica preso por azar: o passo anda", (Rq().feitas || {}).rasto != null, J(Object.keys(Rq().feitas || {})));
  const q2 = osQuadrosDoEstado(E, { mundo })[0];
  const c2 = q2 && q2.cartas.find((c) => c.id === "rasto:descobriu:curral");
  t("e a carta fica com o carimbo, lida da memória do save", c2 && c2.estado === "preco" && c2.preco === id);
  t("a memória passa pelo garantirQuadro do load sem perder a carta", J(REFS_DA_PAUTA.quadro.padrao()) !== J(E.quadro) && Object.keys(E.quadro.cartas).length === 1);
}

/* ============================================================ */
sec("§8 a pauta: O CASO e o veto saem do motor da pauta, com o estado do App");
{
  /* a prio não é a 2,44 que o plano propôs: a §9 mediu-a (a 2,44 a linha tirava a planta em 30/500, mais de
     1 em 20; a 2,455 com o veto atrás tirava o QUEM CARREGA em 52; a 2,465 tirava o QUEM É de quem está em
     cena numa pauta cheia — teste-consequencias-caladas). Fica a 2,486: nenhuma secção que já existia perde. */
  const sQ = SECOES.find((x) => x.id === "quadro"), sV = SECOES.find((x) => x.id === "vetoDoCaso");
  const maisFracaDasAntigas = Math.max(...SECOES.filter((x) => x.prio < 2.49 && x.id !== "quadro" && x.id !== "vetoDoCaso").map((x) => x.prio));
  t("a secção existe, com a prio medida (2,486: depois de toda secção antiga até ao QUEM É)", !!sQ && sQ.prio === 2.486 && sQ.rotulo === "O CASO" && sQ.prio > maisFracaDasAntigas, String(maisFracaDasAntigas));
  t("o veto do caso tem secção própria no bloco do NÃO PODE, logo atrás da linha (o padrão do veto do Juiz)", !!sV && sV.rotulo === "NÃO PODE" && sV.prio > sQ.prio && sV.prio < 2.49
    && SECOES.indexOf(sV) === SECOES.findIndex((x) => x.id === "vetoDoJuiz") + 1);
  t("na luta, O CASO cede (o veto fica)", SECOES_QUE_CEDEM.luta.includes("quadro") && !SECOES_QUE_CEDEM.luta.includes("vetoDoCaso"));
  const r = aPautaDoTurno({ ...E, render: { personagem: E.personagem, mundo: { semente } } }, { frase: "olho à volta" }, {});
  const pauta = r && r.pauta;
  const esperado = oQuadroNaPauta(osQuadrosDoEstado(E, { mundo: null }));
  t("a pauta do turno leva a linha do caso", !!pauta && Array.isArray(pauta.quadro) && pauta.quadro.length === 1 && pauta.quadro[0].length <= QUADRO_NA_PAUTA.teto, J(pauta && pauta.quadro));
  t("…com o que já se sabe (a face da carta virada)", !!pauta && pauta.quadro[0].includes("já se sabe"));
  t("o veto vai à secção dele (e a naoPode da cena fica como estava)", !!pauta && esperado.naoPode.length > 0 && J(pauta.vetoDoCaso) === J(esperado.naoPode)
    && !(pauta.naoPode || []).some((v) => esperado.naoPode.includes(v)), J(pauta && pauta.vetoDoCaso));
  const txt = textoDaPauta(pauta, { turno: 1 });
  t("e o texto da pauta mostra-o dentro do teto", txt.includes("O CASO") && txt.length <= TETO_DA_PAUTA, String(txt.length));
  const antiga = aPautaDoTurno({ ...E, espinha: { ...E.espinha, esqueleto: null }, render: { personagem: E.personagem, mundo: { semente } } }, { frase: "olho à volta" }, {});
  t("a campanha antiga (sem esqueleto): nenhuma linha, nenhum veto novo", !(antiga.pauta.quadro || []).length && !(antiga.pauta.vetoDoCaso || []).length);
}

/* ============================================================
   §9 A MEDIDA CONTRA O TETO (a régua do plano-quadro §11, 7)
   As linhas e os vetos de verdade (o catálogo inteiro, etapa a etapa, um e
   dois quadros), em 500 cenas semeadas com e sem luta, no molde de
   teste-masmorra-na-pauta. A régua: O CASO não tira veto, desfecho, rumo nem
   fecho; se tirar a planta da masmorra ou o QUEM CARREGA em mais de 1 cena em
   20, a prio desce para 2,455.
   ============================================================ */
sec("§9 a medida contra o TETO_DA_PAUTA — 500 cenas, com e sem luta");
const DO_CATALOGO = (() => {
  const e0 = { npcs: {}, cidadeAtual: "Alto do Sal", lugar: null, personagem: { nome: "Vera", grupo: [], inventario: [] }, dia: 1, npcTurno: 0, factos: garantirFactos(null) };
  const out = [];
  for (const F of BIBLIOTECA_DE_QUESTS) {
    const papeis = {};
    for (const [k, d] of Object.entries(F.papeis)) {
      const tipo = (PAPEIS_DA_QUEST[d.de] || {}).tipo;
      papeis[k] = tipo === "lugar" ? { nome: `Casa dos ${k}`, cidade: "Alto do Sal" } : tipo === "item" ? { nome: `o ${k} de prata` } : { nome: `Mécia dos ${k}` };
    }
    const R = abrirQuest(F, { estado: e0, papeis });
    if (!R) continue;
    F.etapas.forEach((etapa, idx) => {
      const antes = F.etapas.slice(0, idx);
      const Ri = { ...R, feitas: Object.fromEntries(antes.map((e) => [e.id, { dia: 1 }])), acesas: Object.fromEntries([...antes, etapa].map((e) => [e.id, 1])) };
      const q = oQuadroDaQuest(Ri, e0, { arco: "misterio", semente: "Q3|" + F.id });
      if (q && q.cartas.length) out.push(q);
    });
  }
  return out;
})();
t(`o catálogo dá quadros de verdade para medir (${DO_CATALOGO.length})`, DO_CATALOGO.length > 50);
const PALAVRAS = "a taberneira serve vinho aguado enquanto o ferreiro discute com o guarda sobre a ponte velha que caiu na cheia do inverno e ninguém quer pagar o conserto da estrada do norte".split(" ");
const texto = (r, min, max) => { const alvo = min + Math.floor(r() * (max - min + 1)); let s = ""; while (s.length < alvo) s += (s ? " " : "") + PALAVRAS[Math.floor(r() * PALAVRAS.length)]; return s.slice(0, alvo).trim(); };
const talvez = (r, p) => r() < p;
function cena(i, luta) {
  const r = rng(hashSemente(`quadro-na-pauta|${luta ? "luta" : "fora"}|${i}`));
  let p = porNaPauta({}, "onde", texto(r, 60, 110), texto(r, 15, 25), "comporta: " + texto(r, 90, 180));
  if (talvez(r, 0.35)) p = porNaPauta(p, "desfecho", texto(r, 60, 140));
  p = porNaPauta(p, "naoPode", ...Array.from({ length: 1 + Math.floor(r() * 3) }, () => texto(r, 70, 170)));
  p = porNaPauta(p, "rumo", texto(r, 120, 220));
  p = porNaPauta(p, "fecho", texto(r, 60, 120));
  const mm = talvez(r, 0.3);
  if (mm) p = porNaPauta(p, "masmorra", texto(r, 80, 140), texto(r, 60, 120));
  if (talvez(r, 0.4)) p = porNaPauta(p, "coracao", texto(r, 90, 200));
  for (const [id, pr, min, max] of [["economia", 0.6, 150, 260], ["emCena", 0.6, 60, 160], ["momento", 0.4, 60, 160], ["volta", 0.2, 80, 160], ["boato", 0.15, 80, 160], ["quemE", 0.3, 80, 180], ["gente", 0.5, 40, 110], ["contra", luta ? 0.8 : 0, 50, 130], ["acabou", luta ? 0.5 : 0.1, 60, 160], ["fala", 0.2, 60, 160]]) if (talvez(r, pr)) p = porNaPauta(p, id, texto(r, min, max));
  const qs = talvez(r, 0.3) ? [DO_CATALOGO[Math.floor(r() * DO_CATALOGO.length)], DO_CATALOGO[Math.floor(r() * DO_CATALOGO.length)]] : [DO_CATALOGO[Math.floor(r() * DO_CATALOGO.length)]];
  const qp = oQuadroNaPauta(qs);
  let com = p;
  if (qp.linha) com = porNaPauta(com, "quadro", qp.linha);
  if (qp.naoPode.length) com = porNaPauta(com, "vetoDoCaso", ...qp.naoPode);
  const ceder = { luta, masmorra: mm, arredores: false };
  return { sem: cederNaCena(p, ceder), com: cederNaCena(com, ceder), qp };
}
const N = 500;
for (const luta of [false, true]) {
  const c = { entra: 0, veto: 0, cheio: 0, desfecho: 0, rumo: 0, fecho: 0, masmorra: 0, coracao: 0, teto: 0, vetoDoCaso: 0 };
  for (let i = 0; i < N; i++) {
    const { sem, com, qp } = cena(i, luta);
    const ts = textoDaPauta(sem, { turno: i + 1 }), tc = textoDaPauta(com, { turno: i + 1 });
    if (qp.linha && tc.includes(qp.linha)) c.entra++;
    if (qp.naoPode.every((v) => tc.includes(v))) c.vetoDoCaso++;
    if (tc.length <= TETO_DA_PAUTA) c.teto++;
    const perdeu = (id) => (sem[id] || []).some((l) => ts.includes(l) && !tc.includes(l));
    if ((sem.naoPode || []).some((l) => ts.includes(l) && !tc.includes(l))) c.veto++;
    for (const id of ["desfecho", "rumo", "fecho", "masmorra", "coracao"]) if (perdeu(id)) c[id]++;
  }
  const onde = luta ? "na luta" : "fora da luta";
  console.log(`      (${onde}: a linha do caso entra em ${c.entra}/${N}; o veto do caso chega em ${c.vetoDoCaso}/${N}; tira a planta em ${c.masmorra}, o QUEM CARREGA em ${c.coracao})`);
  t(`${onde}: O CASO não tira veto nenhum da cena (${c.veto}/${N})`, c.veto === 0);
  t(`${onde}: nem o desfecho (${c.desfecho}), o rumo (${c.rumo}) ou o fecho (${c.fecho})`, c.desfecho === 0 && c.rumo === 0 && c.fecho === 0);
  t(`${onde}: tira a planta da masmorra em no máximo 1 cena em 20 (${c.masmorra}/${N})`, c.masmorra <= N / 20);
  t(`${onde}: tira o QUEM CARREGA em no máximo 1 cena em 20 (${c.coracao}/${N})`, c.coracao <= N / 20);
  t(`${onde}: o teto nunca passa (${c.teto}/${N})`, c.teto === N);
  if (luta) t(`na luta, a linha do caso cede sempre (${c.entra}/${N})`, c.entra === 0);
  else t(`fora da luta, a linha do caso entra na maioria das cenas (${c.entra}/${N})`, c.entra >= N / 2);
}

sec("§10 as cartas no Diário (f211d9f): o App passa os quadros e a porta para a gaveta");
{
  t("o bq do Diário leva os quadros da tela e aoAbrirQuadro, em calou", APP.includes('bq={aba === "diario" ? (() => { try { const b = oDiarioDasQuests(); return b ? { ...b, quadros: (pistasDaTela && pistasDaTela.quadros) || [], aoAbrirQuadro: abrirOQuadroNa } : null; } catch (e) { calou("as cartas no Diário", e); return null; } })() : null}'));
  t("as duas montagens do PainelDiario passam quadros e aoAbrirQuadro", APP.split("quadros={(bq && bq.quadros) || []} aoAbrirQuadro={(bq && bq.aoAbrirQuadro) || null}").length - 1 === 2);
  t("tocar na carta fecha o Diário, marca vista e abre a gaveta nessa quest", /const abrirOQuadroNa = \(quest\) => \{\s*try \{\s*setAba\(null\);[\s\S]{0,160}setQuestDoQuadro\(quest \|\| null\);\s*setQuadroAberto\(true\);/.test(APP));
  t("a gaveta abre na quest pedida, se ela ainda tem quadro; senão na da vez", APP.includes("questDaVez={(questDoQuadro && pistasDaTela.quadros.some((q) => q.quest === questDoQuadro)) ? questDoQuadro : pistasDaTela.daVez}"));
  t("fechar a gaveta esquece a quest pedida", APP.includes("const fecharOQuadro = () => { try { setQuadroAberto(false); setQuestDoQuadro(null);"));
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
