/* A FIAÇÃO DO MESTRE VIVO (19/11/2026) — o Mestre que lê o momento, no App

   O desenho é mente/lancamento/o-mestre-vivo.md §15.4 e §16. A régua
   (motor/a-regua-do-momento.js) e a cena do jogo (a-cena-do-jogo.js) já
   estavam provadas; esta suíte prende a ponte nova (src/o-mestre-vivo-no-jogo.js)
   e lê o App como texto, no padrão de teste-chamado-fiacao:

     1. A CHAVE existe, nasce desligada e mora fora do save e fora da tela.
     2. O RETRATO sai só do que os refs dão, na forma de FORMA_DO_RETRATO.
     3. O MOMENTO vira uma de quatro portas, e as quatro situações da prova
        (a busca sem nada, a pergunta, o pedido com motivo para negar, o
        esgueirar-se com gente) saem como a régua promete.
     4. A PAUTA vai pelo canal de UM turno — nenhum bloco estático.
     5. COM A CHAVE DESLIGADA O CAMINHO DE HOJE NÃO MUDA: toda chamada nova
        vive dentro da guarda da chave, e toda guarda está em calou.
     6. As peças e o Mestre vivo não andam juntos (o Mestre vivo ganha). */
import fs from "node:fs";
import path from "node:path";
import {
  MESTRE_VIVO, lerAChaveDoMestreVivo, retratoDosRefs, PORTAS_DO_MOMENTO, oQueOMomentoFaz,
  O_QUE_ACONTECE, vereditoDoQueAcontece, PAUTA_DO_MESTRE_VIVO, pautaDoMomento, O_DESTINO_NA_MESA,
  lanceDoDestino, envelopeDoDestino, podeOMundoProvocar, MOTIVO_DO_ESPONTANEO, rolagemDoEspontaneo,
  O_ESPONTANEO_NA_MESA, ehDoMundo, envelopeDoEspontaneo, pautaDoEspontaneo, PEDIDOS_QUE_O_MESTRE_VIVO_CALA, oMestreVivoCalaOPedido,
  SEM_FIO_NO_MOMENTO, semFioNoMomento, marcarDoMomento, O_QUE_ACONTECE_SEM_DADO, oQueAconteceSemDado,
  O_SIM_SEM_DADO, envelopeDoSimSemDado, O_PRECO_NA_CENA,
  A_FALA_DA_MESA, falaDoVeredictoNaMesa, falaDoCustoNaMesa, falaDoBarulhoNaMesa, falaDosBlefesNaMesa,
} from "../src/o-mestre-vivo-no-jogo.js";
import { falaDoCusto, falaDoVeredicto, registrarTentativa } from "../src/desafios.js";
import { falaDosBlefes } from "../src/social.js";
import { REGUA_DO_MOMENTO } from "../src/motor/a-regua-do-momento.js";
import { QUANDO_O_MESTRE_CHAMA } from "../src/motor/o-mestre-chama.js";
import { tamanhoPorId } from "../src/social.js";
import { desfechoDaMargem, lerAcao, envelopeDoCusto } from "../src/desafios.js";
import { PODA_DO_AUSENTE } from "../src/motor/poda-do-ausente.js";
import { FORMA_DO_RETRATO, cenaDoJogo, chamadoDoMomento, chamadoQueOMundoProvoca, O_DADO_DO_MUNDO, O_CHAMADO_DA_CONVERSA } from "../src/a-cena-do-jogo.js";
import { RESPOSTAS_DA_PERGUNTA } from "../src/cena-do-momento.js";
import { periciaPorId } from "../src/pericias.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* um localStorage de brincar */
const caixa = (ini = {}) => {
  const m = new Map(Object.entries(ini));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};

sec("1. A CHAVE");
{
  t("a chave é taverna_cfg_mestre_vivo, e ?mestre=1 a liga", MESTRE_VIVO.chave === "taverna_cfg_mestre_vivo" && MESTRE_VIVO.parametros.includes("mestre") && MESTRE_VIVO.liga === "1");
  t("nasce desligada (sem configuração)", lerAChaveDoMestreVivo(caixa(), "") === false);
  t("sem storage, desligada (nunca lança)", lerAChaveDoMestreVivo(null, "?mestre=1") === false);
  const c = caixa();
  t("?mestre=1 liga e grava a configuração local", lerAChaveDoMestreVivo(c, "?mestre=1") === true && c.getItem(MESTRE_VIVO.chave) === "1");
  t("a configuração gravada vale sem o parâmetro", lerAChaveDoMestreVivo(c, "") === true);
  t("?mestre=0 apaga", lerAChaveDoMestreVivo(c, "?x=2&mestre=0") === false && c.getItem(MESTRE_VIVO.chave) === null);
  t("?mestrevivo=1 (o nome do roteiro de §15.4) também liga", lerAChaveDoMestreVivo(caixa(), "?mestrevivo=1") === true);
  t("outro valor não liga", lerAChaveDoMestreVivo(caixa({ [MESTRE_VIVO.chave]: "sim" }), "") === false);
  t("?mestre=10 não é ?mestre=1", lerAChaveDoMestreVivo(caixa(), "?mestre=10") === false);
}

sec("2. O RETRATO (só o que os refs dão)");
const npcs = { Marta: { nome: "Marta", papel: "taverneira", relacao: "amigo", status: "viva" } };
const crus = {
  lugar: { nome: "Taverna do Javali" }, cidade: "Vila", jornada: null, minuto: 14 * 60, clima: "limpo",
  presentes: [{ nome: "Marta", papel: "taverneira", deOnde: "sitio" }, { nome: "Rui", papel: "guarda" }],
  npcs, rotinas: { Marta: "a servir no balcão" }, grupo: [], inimigos: [], encontro: null, masmorra: null,
  achado: false, segredos: [], favorAqui: false, relogios: [], condicoes: [], passos: [], onde: null, quest: {},
};
{
  t("lixo devolve null", retratoDosRefs(null) === null && retratoDosRefs(7) === null && retratoDosRefs([]) === null);
  t("sem saber onde o herói está, null (o Mestre de hoje)", retratoDosRefs({ ...crus, lugar: null, cidade: "", jornada: null }) === null);
  const r = retratoDosRefs(crus);
  t("o retrato só tem chaves de FORMA_DO_RETRATO", !!r && Object.keys(r).every((k) => k in FORMA_DO_RETRATO), r && Object.keys(r).join(","));
  t("e tem todas elas", !!r && Object.keys(FORMA_DO_RETRATO).every((k) => k in r));
  const marta = r && r.pessoas.find((p) => p.nome === "Marta");
  t("a pessoa cruza o registo: papel, relação, status", !!marta && marta.papel === "taverneira" && marta.relacao === "amigo" && marta.status === "viva");
  t("a rotina de agora vem de fora (fichaDaPessoa), e o posto de deOnde", !!marta && marta.agora === "a servir no balcão" && marta.doPosto === true);
  const rui = r && r.pessoas.find((p) => p.nome === "Rui");
  t("quem não está no registo fica com o papel do elenco e sem relação inventada", !!rui && rui.papel === "guarda" && !("relacao" in rui) && rui.doPosto === false);
  t("a jornada é só um sim ou não", retratoDosRefs({ ...crus, jornada: { de: "A", para: "B" } }).jornada === true && r.jornada === false);
  const antes = JSON.stringify(crus);
  retratoDosRefs(crus);
  t("não mexe no que entra", JSON.stringify(crus) === antes);
  t("o retrato vira cena (a cena do jogo o lê)", !!cenaDoJogo(r));
  t("o mesmo retrato dá a mesma cena", JSON.stringify(cenaDoJogo(retratoDosRefs(crus))) === JSON.stringify(cenaDoJogo(r)));
  /* 21/11 (o-mestre-vivo.md §21): o que é do herói, o chão e o livro */
  const r21 = retratoDosRefs({ ...crus, inventario: ["Gazua"], chao: { cena: "x", itens: [{ nome: "Adaga", raridade: "comum" }] }, tentativas: { "taverna do javali|tranca|bau": { resultado: "sucesso" } } });
  const c21 = cenaDoJogo(r21);
  t("o retrato leva o inventário, o chão e o livro, e a cena os lê (do herói, comum, sem resistência)",
    r21.heroi.inventario[0] === "Gazua" && r21.chao.itens.length === 1 && !!r21.tentativas
    && ["Gazua:do_heroi", "Adaga:coisa_comum", "bau:sem_resistencia"].every((p) => { const [n, e] = p.split(":"); const x = c21.coisas.find((y) => y.nome === n); return !!x && x.estados.includes(e); }));
  t("sem eles, o retrato tem o vazio de cada um", r.heroi.inventario.length === 0 && r.chao === null && Object.keys(r.tentativas).length === 0);
}

sec("3. O MOMENTO: as quatro portas e as situações da prova");
const leitura = {
  semente: "prova", lugar: "Taverna do Javali", personagem: { nome: "Herói", atributos: {}, pericias: [] },
  pessoaDe: (x) => (/marta/i.test(x) ? { nome: "Marta", papel: "taverneira", relacao: "desconhecido" } : /rui|guarda/i.test(x) ? { nome: "Rui", papel: "guarda", relacao: "desconhecido" } : null),
  fama: 0, tentativas: {}, achadoDe: () => null, ehPessoaConhecida: (x) => /marta|rui/i.test(x), segredos: () => [], objetoEmCena: () => false,
};
const calmo = retratoDosRefs({ ...crus, npcs: {}, rotinas: {} });
{
  t("as portas são quatro, e a de hoje é a primeira", PORTAS_DO_MOMENTO.length === 4 && PORTAS_DO_MOMENTO[0] === "hoje");
  t("sem resposta ou sem cena, «hoje»", oQueOMomentoFaz(null) === "hoje" && oQueOMomentoFaz({ rola: true, cena: null }) === "hoje");
  t("a régua que estoura é «hoje»", oQueOMomentoFaz({ rola: false, cena: {}, porque: "erro" }) === "hoje");
  const busca = chamadoDoMomento("Procuro algo escondido no balcão", leitura, calmo, { bonus: 2 });
  t("a busca num lugar sem nada escondido não rola (acontece)", oQueOMomentoFaz(busca) === "acontece" && busca.veredito && busca.veredito.tipo === "teste", busca.porque);
  const pergunta = chamadoDoMomento("Pergunto à Marta onde fica o templo", leitura, calmo, { bonus: 2 });
  t("a pergunta a alguém não rola", oQueOMomentoFaz(pergunta) === "acontece" && pergunta.resposta === "franca", pergunta.porque);
  const pedido = chamadoDoMomento("Peço ao guarda Rui que me deixe entrar no quartel", leitura, calmo, { bonus: 2 });
  t("o pedido a quem tem motivo para negar rola, com o chamado", oQueOMomentoFaz(pedido) === "rola" && !!pedido.chamado, pedido.porque);
  t("e o chamado diz o preço antes do dado", !!pedido.chamado && pedido.chamado.aviso === O_CHAMADO_DA_CONVERSA.aviso && pedido.chamado.linha.includes(String(pedido.chamado.dc)));
  const esgueirar = chamadoDoMomento("Me esgueiro até os fundos sem ser visto", leitura, calmo, { bonus: 2 });
  t("esgueirar-se onde há gente rola", oQueOMomentoFaz(esgueirar) === "rola" && !!esgueirar.chamado, esgueirar.porque);
  const destino = chamadoDoMomento("Será que o frasco sobreviveu?", leitura, retratoDosRefs({ ...crus, lugar: null, cidade: "Vila", jornada: { de: "Vila", para: "Porto" }, clima: "tempestade", presentes: [] }), {});
  t("a pergunta pela sorte, sob a tempestade, é o destino", oQueOMomentoFaz(destino) === "destino" && destino.destino.faces === 6, destino.porque);
  const v = { tipo: "teste", id: "buscar", chave: "buscar|x", rotulo: "procurar" };
  const livre = vereditoDoQueAcontece(v, busca);
  /* MOVIDA em 19/11 (o-mestre-vivo.md §18), e o motivo: o porquê que vai ao
     Narrador era o `diz` da linha da régua — a regra em palavras («nada
     escondido nem perigo: o Mestre descreve») —, e o Narrador a repetia na
     cena (sessão mv-2: «o sucesso te garante o favor sem risco»). Agora é o
     fato de cena da linha (O_QUE_ACONTECE.naCena). A intenção fica: o «livre»
     do catálogo, com o porquê de ESTA linha da régua. */
  t("o que acontece vira o «livre» do catálogo, com o fato de cena da linha da régua", livre.tipo === "livre" && livre.porque === O_QUE_ACONTECE.naCena[busca.porque] && livre.chave === v.chave, livre.porque);
  t("sem porquê, o padrão da tabela", vereditoDoQueAcontece(v, {}).porque === O_QUE_ACONTECE.porquePadrao && vereditoDoQueAcontece(null, busca) === null);
}

sec("4. A PAUTA (o canal de um turno, nunca bloco estático)");
{
  const evasiva = { rola: false, resposta: "evasiva", porque: "naoETeste", cena: {} };
  const pa = pautaDoMomento(evasiva);
  const R = RESPOSTAS_DA_PERGUNTA.find((x) => x.id === "evasiva");
  t("a pergunta a quem esconde algo: a resposta sai evasiva", !!pa && pa.acabou.some((l) => l.includes(R.diz)));
  t("e o veto de entregar a verdade vai em naoPode", !!pa && pa.naoPode.includes(PAUTA_DO_MESTRE_VIVO.resposta.naoPode.evasiva));
  t("recusa e silêncio também ganham linha", !!pautaDoMomento({ rola: false, resposta: "recusa" }) && !!pautaDoMomento({ rola: false, resposta: "silencio" }));
  t("a resposta franca não ganha linha (responder é o normal)", pautaDoMomento({ rola: false, resposta: "franca" }) === null);
  t("o que rola não leva resposta", pautaDoMomento({ rola: true, resposta: "evasiva", porque: "comoSempre" }) === null);
  const pd = pautaDoMomento({ rola: true, porque: "destino", destino: { dado: 2, faces: 6, diz: "a sorte levou: não resistiu" } });
  t("o destino: só o diz, nunca o número", !!pd && pd.acabou.length === 1 && pd.acabou[0].includes("a sorte levou") && !/\d/.test(pd.acabou[0]));
  t("a frase encadeada: os outros atos acontecem", (pautaDoMomento({ rola: true, porque: "encadeada:alguemPodeNotar" }) || { acabou: [] }).acabou.includes(PAUTA_DO_MESTRE_VIVO.encadeada));
  t("lixo é null", pautaDoMomento(null) === null && pautaDoMomento({}) === null);
  /* nenhum bloco estático: as palavras da pauta só moram no módulo dela */
  const SRC = "../src";
  const todos = [...fs.readdirSync(SRC).filter((f) => /\.(js|jsx)$/.test(f)).map((f) => path.join(SRC, f)), ...fs.readdirSync(path.join(SRC, "motor")).filter((f) => /\.js$/.test(f)).map((f) => path.join(SRC, "motor", f))];
  const frases = [PAUTA_DO_MESTRE_VIVO.resposta.acabou.split("{")[0], PAUTA_DO_MESTRE_VIVO.destino.split("{")[0], PAUTA_DO_MESTRE_VIVO.encadeada, ...Object.values(PAUTA_DO_MESTRE_VIVO.resposta.naoPode)];
  const fora = todos.filter((f) => !f.endsWith("o-mestre-vivo-no-jogo.js") && frases.some((x) => fs.readFileSync(f, "utf8").includes(x)));
  t("as linhas da pauta não moram em prompt nem em bloco nenhum fora do módulo", fora.length === 0, fora.join(", "));
}

sec("5. O DESTINO NA MESA E O ESPONTÂNEO");
{
  const m = { rola: true, porque: "destino", cena: {}, destino: { dado: 5, faces: 6, id: "sim", diz: "a sorte ajudou: resistiu" } };
  const l = lanceDoDestino(m);
  t("o d6 cai na bandeja, com a cor da sorte", !!l && l.dados[0].faces === 6 && l.dados[0].valor === 5 && l.papel === O_DESTINO_NA_MESA.papel);
  const env = envelopeDoDestino(m);
  t("o envelope do destino diz o diz e nenhum número", env.includes("a sorte ajudou") && !/\d/.test(env));
  t("sem destino, nada", lanceDoDestino({ rola: true }) === null && envelopeDoDestino({}) === "");
  const ok = { antes: {}, emCombate: false, rolagem: null, chamado: null, escolha: null, carregando: false, encontro: null };
  t("a mesa livre deixa o mundo provocar", podeOMundoProvocar(ok) === true);
  t("sem retrato de antes (o save acabou de carregar), não provoca", podeOMundoProvocar({ ...ok, antes: null }) === false);
  t("nunca em luta", podeOMundoProvocar({ ...ok, emCombate: true }) === false);
  t("nunca com o pedido do encontro em aberto", podeOMundoProvocar({ ...ok, encontro: { pedido: { pericia: "percepcao" } } }) === false);
  t("nunca com teste, chamado, escolha ou o Narrador a falar", [{ rolagem: {} }, { chamado: {} }, { escolha: {} }, { carregando: true }].every((x) => podeOMundoProvocar({ ...ok, ...x }) === false));
  /* MOVIDA em 19/11 (o-mestre-vivo.md §17): a caçada ganhou nome — o
     espontâneo só é chamado quando o estado tem o que mostrar */
  const antes = { cidade: "Vila", jornada: true, relogios: [{ tipo: "cacada", nome: "os cães do Barão", segmentos: 4, cheios: 2 }] };
  const depois = { ...antes, relogios: [{ tipo: "cacada", nome: "os cães do Barão", segmentos: 4, cheios: 3 }] };
  const prov = chamadoQueOMundoProvoca(antes, depois);
  const r = rolagemDoEspontaneo(prov, periciaPorId(prov && prov.pericia));
  t("a caçada que fecha o cerco pede Percepção", !!prov && prov.pericia === "percepcao");
  t("a rolagem do espontâneo tem a dificuldade do chamado e o motivo da tabela", !!r && r.dificuldade === prov.chamado.dc && r.motivo === MOTIVO_DO_ESPONTANEO.percepcao && r.tipo === periciaPorId("percepcao").atributo);
  t("e diz o preço que falhar É (o risco de O_DADO_DO_MUNDO)", !!r && r.desafio.escolha.risco === O_DADO_DO_MUNDO.risco.percepcao);
  t("sem chave no desafio: o livro de tentativas não ganha o teste que o jogador não fez", !!r && !("chave" in r.desafio));
  t("lixo é null", rolagemDoEspontaneo(null, null) === null && rolagemDoEspontaneo(prov, null) === null);
}

/* ------------------------------------------------------------------ */
/* SEM COMENTÁRIO: as réguas procuram chamadas, e a história escrita nos
   comentários do App diria os mesmos nomes. */
const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(fs.readFileSync("../src/App.jsx", "utf8"));
const corpo = (nome) => {
  const i = APP.indexOf(`\n  const ${nome} = `);
  if (i < 0) return "";
  const resto = APP.slice(i + 1);
  const m = /\n  (?:const |useEffect\(|let |function )/.exec(resto.slice(10));
  return m ? resto.slice(0, m.index + 10) : resto;
};
/* o bloco entre chaves que abre no índice dado */
const bloco = (txt, i) => {
  const a = txt.indexOf("{", i);
  if (a < 0) return [i, i];
  let d = 0;
  for (let k = a; k < txt.length; k++) {
    if (txt[k] === "{") d++;
    else if (txt[k] === "}") { d--; if (d === 0) return [i, k + 1]; }
  }
  return [i, txt.length];
};

sec("6. O APP: a chave, os imports, o save e a tela");
{
  t("o App importa a cena do jogo (chamadoDoMomento e o espontâneo)", /import \{ chamadoDoMomento, chamadoQueOMundoProvoca \} from "\.\/a-cena-do-jogo\.js";/.test(APP));
  t("e a ponte nova", /from "\.\/o-mestre-vivo-no-jogo\.js";/.test(APP));
  t("a chave lê-se uma vez, pelo localStorage e pela URL", /mestreVivoRef\.current = lerAChaveDoMestreVivo\(window\.localStorage, window\.location\.search\)/.test(corpo("mestreVivoLigado")));
  t("e um erro a lê como desligada", /catch \(e\) \{ mestreVivoRef\.current = false; \}/.test(corpo("mestreVivoLigado")));
  /* o sistema não fala de si: a chave e o nome do mecanismo não vão à tela */
  const telas = fs.readdirSync("../src").filter((f) => /\.jsx$/.test(f) && f !== "App.jsx").map((f) => fs.readFileSync(path.join("../src", f), "utf8"));
  t("nenhum painel fala da chave ou do Mestre vivo", telas.every((x) => !/mestre_vivo|mestre vivo|mestrevivo/i.test(x)));
  const literais = (APP.match(/"[^"\n]*"/g) || []).filter((x) => /mestre vivo|mestre_vivo/i.test(x));
  t("no App, «Mestre vivo» só aparece no rótulo do calou (consola)", literais.every((x) => /^"Mestre vivo · /.test(x) || x === `"${MESTRE_VIVO.chave}"`), literais.join(" | "));
  /* o save: nem a chave, nem o retrato, nem o momento */
  const estado = fs.readFileSync("../src/estado.js", "utf8") + fs.readFileSync("../src/sessao.js", "utf8");
  t("o save não ganhou campo (estado.js e sessao.js não falam do Mestre vivo)", !/mestreVivo|mestre_vivo|retratoAntes|momentoDoTurno/i.test(estado));
  t("os refs novos não entram no salvar", !/salvar\(\{[^}]*(retratoAntes|momentoDoTurno|mestreVivo)/.test(APP));
  t("ao carregar e no jogo novo, o retrato de antes começa null", (APP.match(/retratoAntesRef\.current = null;/g) || []).length >= 2);
}

sec("7. COM A CHAVE DESLIGADA, O CAMINHO DE HOJE");
{
  /* as funções novas: só se chamam dentro da guarda da chave (ou dentro umas
     das outras). As regiões guardadas são: o corpo de cada uma delas, cada
     `if (mestreVivoLigado()) { … }`, o efeito do espontâneo depois da sua
     guarda e, em adjudicarAcao, os ramos do `m` (que só a guarda enche). */
  const NOVAS = ["retratoAgora", "momentoDaFrase", "momentoDaAdjudicacao", "acontecerSemDado", "destinoDoMomento",
    "chamadoDoMomento", "chamadoQueOMundoProvoca", "retratoDosRefs", "oQueOMomentoFaz", "vereditoDoQueAcontece",
    "pautaDoMomento", "lanceDoDestino", "envelopeDoDestino", "podeOMundoProvocar", "rolagemDoEspontaneo",
    /* 19/11 (§17): as funções do conserto; semFioNoMomento fica de fora de
       propósito — é lida no caminho de todo dado e devolve false para o
       desafio que o momento não marcou (a prova está na secção 9) */
    "ehDoMundo", "envelopeDoEspontaneo", "pautaDoEspontaneo", "oMestreVivoCalaOPedido", "marcarDoMomento", "oQueAconteceSemDado"];
  const regioes = [];
  for (const n of NOVAS) { const c = corpo(n); if (c) { const i = APP.indexOf(c); regioes.push([i, i + c.length]); } }
  for (let i = APP.indexOf("if (mestreVivoLigado()) {"); i >= 0; i = APP.indexOf("if (mestreVivoLigado()) {", i + 1)) regioes.push(bloco(APP, i));
  const iEf = APP.indexOf("if (carregando || !mestreVivoLigado()) return;");
  t("o efeito do espontâneo para logo sem a chave", iEf > 0);
  if (iEf > 0) regioes.push([iEf, APP.indexOf("}, [carregando]);", iEf)]);
  const ad = corpo("adjudicarAcao");
  const iAd = APP.indexOf(ad);
  for (const rx of [/if \(m && !m\.rola && v\.tipo === "teste"\) \{/g, /\n      if \(m\) \{/g]) for (const x of ad.matchAll(rx)) regioes.push(bloco(APP, iAd + x.index));
  const dentro = (i) => regioes.some(([a, b]) => i >= a && i < b);
  const soltas = [];
  for (const n of NOVAS) {
    const rx = new RegExp(`\\b${n}\\(`, "g");
    for (const x of APP.matchAll(rx)) {
      const antes = APP.slice(Math.max(0, x.index - 12), x.index);
      if (/const $/.test(antes) || /import \{[^}]*$/.test(APP.slice(Math.max(0, x.index - 400), x.index))) continue;
      if (!dentro(x.index)) soltas.push(n + "@" + APP.slice(0, x.index).split("\n").length);
    }
  }
  t("toda chamada nova vive dentro da guarda da chave", soltas.length === 0, soltas.join(", "));
  /* m e os refs do momento só se enchem na guarda */
  t("em adjudicarAcao, m nasce null e só a guarda o enche", /let m = null;\n    if \(mestreVivoLigado\(\)\) \{/.test(ad) && (ad.match(/\bm = momentoDaAdjudicacao\(acao\)/g) || []).length === 1);
  t("o veredito do momento só se escreve em momentoDaAdjudicacao", (APP.match(/momentoAdjudicadoRef\.current = \{/g) || []).length === 1 && /momentoAdjudicadoRef\.current = \{/.test(corpo("momentoDaAdjudicacao")));
  t("o chamado do momento só se escreve com m", (APP.match(/chamadoDoMomentoRef\.current = \{/g) || []).length === 1 && /if \(m\) \{\n\s*chamadoDoMomentoRef\.current = \{/.test(ad));
  t("o espontâneo só abre rolagem depois da guarda", APP.indexOf("rolagemDoEspontaneo(prov") > iEf && iEf > 0);
  /* o caminho de hoje, letra a letra, onde a chave desligada passa */
  t("sem o ref do momento, veredictoDaAcao é o catálogo de hoje", /let v = dm && dm\.frase === acao \? dm\.v : lerAcao\(acao, ctxDesafio\(\)\);/.test(corpo("veredictoDaAcao")));
  t("adjudicarAcao: a procura e o veredito de hoje continuam colados", /if \(procurarAlguem\(acao\)\) return true;\s*const v = veredictoDaAcao\(acao\);\n    if \(!v\) return false;/.test(ad));
  t("sem m, o Mestre de hoje concede como sempre", /const conc = m \? \{ segura: false \} : seguraOTeste\(v, mesaRef\.current, \{ emCombate: !!combateRef\.current \}\);/.test(ad));
  t("sem o chamado do momento, chamadoDoVeredito é o de hoje", /return oChamado\(v, ctxDoChamado\(mod\)\) \|\| null;/.test(corpo("chamadoDoVeredito")) && /if \(dm && v && dm\.id === \(v\.id \|\| ""\) && dm\.chave === \(v\.chave \|\| ""\)\) \{ chamadoDoMomentoRef\.current = null; return dm\.chamado; \}/.test(corpo("chamadoDoVeredito")));
  /* toda guarda está em try/catch com calou */
  const guardas = [];
  for (let i = APP.indexOf("if (mestreVivoLigado()) {"); i >= 0; i = APP.indexOf("if (mestreVivoLigado()) {", i + 1)) guardas.push(APP.slice(...bloco(APP, i)));
  /* MOVIDA em 19/11 (§17), e o motivo: o conserto pôs duas guardas novas — o
     espontâneo que pousa no seu envelope (na resolução do dado) e a oferta da
     chegada que o Mestre vivo cala. A intenção fica: cada caminho novo mora
     numa guarda contável, em try e calou. */
  /* MOVIDA em 22/11 (a décima terceira sessão, E1), e o motivo: o mundo fechado no envio é uma guarda nova
     (o veto «nada muda de mão» em todo turno do Mestre vivo). A intenção fica: guarda contável, em try e calou. */
  /* MOVIDA em 22/11 (QC1, a décima quinta sessão), e o motivo: o elenco fechado no envio é uma guarda nova
     (o figurante do sítio no registo e o veto de quem pode ter nome). A intenção fica: guarda contável, em try e calou. */
  t("há as sete guardas (o momento do turno, o destino e a resposta, a adjudicação, o espontâneo que pousa, a chegada calada, o mundo fechado, o elenco fechado)", guardas.length === 7, String(guardas.length));
  t("toda guarda abre em try e cala em calou", guardas.every((g) => /^if \(mestreVivoLigado\(\)\) \{\s*try \{/.test(g) && /catch \(e\) \{ calou\("Mestre vivo · /.test(g)));
  t("o efeito do espontâneo também", /if \(carregando \|\| !mestreVivoLigado\(\)\) return;\n    try \{[\s\S]*?catch \(e\) \{ calou\("Mestre vivo · o espontâneo", e\); \}/.test(APP));
  t("o retrato cala o que estoura e devolve null", /catch \(e\) \{ calou\("Mestre vivo · o retrato", e\); return null; \}/.test(corpo("retratoAgora")));
  t("o que acontece e o ato da pauta, em calou", /try \{ return acontecerSemDado\(v, m, acao\); \} catch \(e\) \{ calou\("Mestre vivo · o que acontece", e\); \}/.test(ad) && /catch \(e\) \{ calou\("Mestre vivo · a pauta do ato", e\); \}/.test(ad));
  /* a pauta: só pelo canal de um turno */
  const usos = APP.match(/pautaDoMomento\(/g) || [];
  const peloCanal = APP.match(/const pa = pautaDoMomento\((?:m|mv)\); if \(pa\) porNaPautaDoTurno\(pa\);/g) || [];
  t("a pauta do momento vai só pelo canal de um turno (porNaPautaDoTurno)", usos.length === peloCanal.length && peloCanal.length === 2, `${usos.length}/${peloCanal.length}`);
}

sec("8. AS PEÇAS E O MESTRE VIVO NÃO ANDAM JUNTOS");
{
  /* §16: as duas chaves pedem o dado da mesma frase; juntá-las é a etapa da
     quest que escuta (§5). Até lá, com as duas ligadas, ganha o Mestre vivo. */
  t("com as duas chaves ligadas, as peças ficam de fora", /return pecasLigadasRef\.current && !mestreVivoLigado\(\);/.test(corpo("pecasLigadas")));
  t("e o turno das peças continua a perguntar pelo interruptor como antes", /pecasLigadas\(\) && turnoDasPecas\(acao\)/.test(APP));
}

sec("9. O CONSERTO DEPOIS DA PRIMEIRA SESSÃO (19/11/2026, o-mestre-vivo.md §17)");
{
  /* 1. o espontâneo pousa no seu envelope: percebe, nunca age */
  const antes = { cidade: "Vila", jornada: true, relogios: [{ tipo: "cacada", nome: "os cães do Barão", segmentos: 4, cheios: 2 }] };
  const depois = { ...antes, relogios: [{ tipo: "cacada", nome: "os cães do Barão", segmentos: 4, cheios: 3 }] };
  const prov = chamadoQueOMundoProvoca(antes, depois);
  const r = rolagemDoEspontaneo(prov, periciaPorId("percepcao"));
  t("o desafio do espontâneo leva a marca do mundo e o que ele mostra", !!r && ehDoMundo(r.desafio) && r.desafio.mostra.oQue === "os cães do Barão");
  const semMostra = rolagemDoEspontaneo({ ...prov, mostra: null }, periciaPorId("percepcao"));
  t("sem o que mostrar, não há rolagem", semMostra === null);
  const envOk = envelopeDoEspontaneo(r && r.desafio, true), envMal = envelopeDoEspontaneo(r && r.desafio, false);
  t("o envelope diz que o herói não fez nada, e o que ele percebe (passou) ou não (falhou)", /Eu não fiz nada/.test(envOk) && envOk.includes("os cães do Barão") && /percebo a tempo/.test(envOk)
    && /não percebo a tempo/.test(envMal) && envMal.includes("os cães do Barão"), envMal);
  t("nunca o molde da busca: nem revirar, nem remexer, nem achar", ![envOk, envMal].some((x) => /revir|remex|revist|achad|encontr/i.test(x)));
  const busca = lerAcao("vasculho o baú", { personagem: { nivel: 1, inventario: [], habilidades: [], equipado: {}, moedas: 0 }, semente: "x", lugar: "Taverna", tentativas: {}, dia: 1 });
  t("a busca do jogador não é do mundo (o envelope dela segue o de sempre)", !ehDoMundo(busca) && envelopeDoEspontaneo(busca, true) === "");
  const pa = pautaDoEspontaneo(r && r.desafio, [{ nome: "Astrid", onde: "Sala das Cartas", morto: false }], PODA_DO_AUSENTE.linha);
  t("a pauta do espontâneo veta o gesto não escrito e o ausente, pela linha da poda", !!pa && pa.naoPode.some((x) => /revistei/.test(x)) && pa.naoPode.includes(PODA_DO_AUSENTE.linha("Astrid", "Sala das Cartas", false)) && pa.acabou.length === 0, JSON.stringify(pa));
  t("o envelope do espontâneo e a pauta em PT-BR (sem tu, teu, tua)", ![envOk, envMal, ...(pa ? pa.naoPode : [])].some((x) => /\b(tu|teu|tua|teus|tuas|sabes|queres)\b/i.test(x)));
  t("o Mestre vivo cala a oferta da chegada, e só ela", oMestreVivoCalaOPedido("chegada") && !oMestreVivoCalaOPedido("intencao") && !oMestreVivoCalaOPedido("sinal") && !oMestreVivoCalaOPedido(null));
  /* 2. falha nunca paga */
  const des = { id: "buscar", alvoDoCusto: "busca", chave: "buscar|x" };
  const antesDoConserto = desfechoDaMargem(des, { total: 11, dc: 13, comMeiaVerdade: true });
  const doMomento = { ...des, doMomento: true };
  const depoisDoConserto = desfechoDaMargem(doMomento, { total: 11, dc: 13, comMeiaVerdade: true, semMeio: semFioNoMomento(doMomento) });
  t("a busca que falha por 2 pagava («por tão pouco o mundo negocia», o achado de 168 moedas); no momento, não paga",
    !!antesDoConserto && antesDoConserto.porPouco === true && !!depoisDoConserto && depoisDoConserto.porPouco === false, JSON.stringify([antesDoConserto && antesDoConserto.faixa, depoisDoConserto && depoisDoConserto.faixa]));
  t("sem a marca do momento, o desfecho é o de sempre (semMeio só morde o que o momento julgou)", semFioNoMomento(des) === false
    && JSON.stringify(desfechoDaMargem(des, { total: 11, dc: 13, comMeiaVerdade: true, semMeio: semFioNoMomento(des) })) === JSON.stringify(antesDoConserto));
  t("a força e o corpo mantêm o «sim, pago»", !semFioNoMomento({ alvoDoCusto: "tranca", doMomento: true }) && !semFioNoMomento({ alvoDoCusto: "escalada", doMomento: true }) && SEM_FIO_NO_MOMENTO.includes("escuta"));
  const mv = marcarDoMomento({ id: "bater_carteira", tipo: "teste" }, { vantagem: "quem vai ser roubado não está atento" });
  t("o veredito do momento vai ao dado marcado, com a vantagem da cena", mv.doMomento === true && mv.vantagemDoMomento === "quem vai ser roubado não está atento" && !("vantagemDoMomento" in marcarDoMomento({ id: "x" }, {})));
  /* 4. sem dado, o sucesso aplicado pelo sistema */
  const J = (x) => JSON.stringify(x);
  const social = { tipo: "teste", id: "convencer", social: { tamanho: "favor" }, dc: 14 };
  const sim = oQueAconteceSemDado(social, { porque: "dispostoCede" });
  t("o sim de quem está disposto é sucesso, com o efeito social, e fecha no livro", sim.efeito === "social" && sim.desfecho === "sucesso" && sim.fecha === true && sim.conta === social.social);
  /* visto no jogo (19/11): a fala ouvida pela escuta chegava com a conta da
     frase-modelo («convencer o guarda» → «quebrar uma regra pequena»); o sim
     refaz a conta pela frase do jogador */
  const simDaFrase = oQueAconteceSemDado({ ...social, social: { tamanho: "risco" }, pessoa: { nome: "Wren", relacao: "aliado" }, quem: "o guarda" }, { porque: "dispostoCede" }, { frase: "peço à Wren que me arrume uma corda" });
  t("o sim refaz a conta pela frase do jogador, para a pessoa que a frase nomeia", simDaFrase.quem === "Wren" && simDaFrase.conta && simDaFrase.conta.tamanho === "favor", J([simDaFrase.quem, simDaFrase.conta && simDaFrase.conta.tamanho]));
  t("o curativo calmo é feito", oQueAconteceSemDado({ tipo: "teste", id: "estancar" }, { porque: "socorroCalmo" }).efeito === "socorro");
  t("a busca sem nada escondido narra-se, e não rende", J(oQueAconteceSemDado({ tipo: "teste", id: "buscar" }, { porque: "buscaVazia" })) === J({ efeito: "nenhum", desfecho: "falha", fecha: false }));
  t("as tabelas do conserto são congeladas", [O_ESPONTANEO_NA_MESA, PEDIDOS_QUE_O_MESTRE_VIVO_CALA, SEM_FIO_NO_MOMENTO, O_QUE_ACONTECE_SEM_DADO].every(Object.isFrozen));
  /* no App */
  const ac = corpo("acontecerSemDado");
  t("no App, o que acontece sem dado pergunta ao módulo o que aplicar, e o sim social é o envelope social", /oQueAconteceSemDado\(v, m, \{ frase: acao/.test(ac) && /envelopeSocial\(conta, \{ passou: true/.test(ac) && /fecharTentativa\(v, true\)/.test(ac));
  t("a resolução do dado tira o meio do desafio do momento", /comMeiaVerdade: true, semMeio: semFioNoMomento\(des\) \}/.test(APP));
  t("o espontâneo pousa antes de qualquer custo do catálogo, e vai pela pauta de um turno", APP.indexOf("envelopeDoEspontaneo(des, percebeu)") > 0 && APP.indexOf("envelopeDoEspontaneo(des, percebeu)") < APP.indexOf("semMeio: semFioNoMomento(des)")
    && /const pa = pautaDoEspontaneo\(des, aus, PODA_DO_AUSENTE\.linha\);\s*if \(pa\) porNaPautaDoTurno\(pa\);/.test(APP));
  t("a oferta da chegada cala só dentro da guarda", /if \(mestreVivoLigado\(\)\) \{\s*try \{ if \(oMestreVivoCalaOPedido\(p\.id\)\) return; \}/.test(APP));
  t("a vantagem do momento só vem do veredito marcado", /if \(v\.vantagemDoMomento && !vant && !desv\)/.test(corpo("rolarDesafio")));
}

sec("S18. o que vai ao Narrador é fato de cena (19/11/2026, o-mestre-vivo.md §18)");
{
  /* a sessão mv-2 viu a regra virar fala: «O sucesso te garante o favor sem
     risco» (T16) — o envelope do teste social num sim que não teve teste, e o
     «um favor de quem não arrisca nada» do degrau */
  const N = O_QUE_ACONTECE.naCena;
  const semRolar = [...REGUA_DO_MOMENTO.filter((r) => r.rola === false).map((r) => r.id), ...QUANDO_O_MESTRE_CHAMA.filter((r) => !["luta", "conversa"].includes(r.id)).map((r) => r.id)];
  t("toda linha da régua (e veto do Mestre de hoje) que não rola tem o seu fato de cena", semRolar.every((id) => typeof N[id] === "string" && N[id].length > 0), semRolar.filter((id) => !N[id]).join(", "));
  t("nenhum fato de cena fala da regra (dado, teste, sucesso, sorte, risco, Mestre, bônus, perícia)", Object.values(N).every((s) => !O_QUE_ACONTECE.proibidas.test(s)) && !O_QUE_ACONTECE.proibidas.test(O_QUE_ACONTECE.porquePadrao),
    Object.values(N).filter((s) => O_QUE_ACONTECE.proibidas.test(s)).join(" | "));
  t("e todos são PT-BR (sem tu, teu, tua, «a fazer»)", Object.values(N).every((s) => !/\b(tu|teu|tua|teus|tuas|contigo)\b|\ba (fazer|falar|sangrar|olhar)\b/.test(s)));
  t("a frase encadeada leva o fato da linha que decidiu", vereditoDoQueAcontece({ tipo: "teste", id: "x" }, { porque: "encadeada:ninguemVe" }).porque === N.ninguemVe);
  /* a pauta: o veto de explicar a regra, em todo turno que acontece sem dado */
  const pa = pautaDoMomento({ rola: false, porque: "dispostoCede", cena: {} });
  t("o turno que acontece sem dado leva em naoPode o veto de explicar a regra", !!pa && pa.naoPode.includes(PAUTA_DO_MESTRE_VIVO.semMecanica));
  t("o que rola e o destino não o levam (lá a bandeja já falou)", pautaDoMomento({ rola: true, porque: "comoSempre", cena: {} }) === null
    && !(pautaDoMomento({ rola: true, porque: "destino", cena: {}, destino: { dado: 3, faces: 6, diz: "em parte" } }) || { naoPode: [] }).naoPode.includes(PAUTA_DO_MESTRE_VIVO.semMecanica));
  t("as linhas da pauta não falam de dado nem de perícia", ![PAUTA_DO_MESTRE_VIVO.destino, PAUTA_DO_MESTRE_VIVO.encadeada].some((s) => /\b(dado|per[ií]cia|rol\w+)\b/i.test(s)));
  /* o envelope do sim sem dado */
  const favor = tamanhoPorId("favor");
  const env = envelopeDoSimSemDado(favor, { quem: "Seraphina", oQueEuDisse: "peço que guarde a caixa" });
  t("o sim sem dado tem envelope próprio: a pessoa aceita, o que ela faz e o que não faz", env.includes("Seraphina") && env.includes("O QUE ELA FAZ POR MIM") && env.includes("O QUE ELA NÃO FAZ"), env);
  t("sem «sucesso», «teste» nem «não arrisca»: a palavra da regra não chega ao Narrador como fato", !/SUCESSO COMPROU|o teste já foi|não arrisca/i.test(env), env);
  t("e guarda o «e CONSEGUI» que a ficha do ator e a janela leem", /\[SOCIAL — [^\]]*\][^[]*? e CONSEGUI\b/u.test(env));
  t("as moedas pagas entram na linha; lixo dá vazio", envelopeDoSimSemDado({ ...favor, custoEmMoedas: 5 }, {}).includes("5 moedas") && envelopeDoSimSemDado(null) === "" && envelopeDoSimSemDado({}) === "");
  const simEnv = oQueAconteceSemDado({ tipo: "teste", id: "convencer", social: favor, dc: 14 }, { porque: "dispostoCede" }, { frase: "peço à Wren que me arrume uma corda" });
  t("o sim de oQueAconteceSemDado já traz o envelope (o App o prefere ao do teste social)", typeof simEnv.envelope === "string" && simEnv.envelope.includes("CONSEGUI"));
  t("a tabela do sim é congelada e PT-BR", Object.isFrozen(O_SIM_SEM_DADO) && !/\b(tu|teu|tua)\b/.test(O_SIM_SEM_DADO.envelope));
}

sec("S19. a falha cobra o que a cena sabe (19/11/2026, o-mestre-vivo.md §19)");
{
  /* a sessão mv-3 (T25): «me escondo atrás da lona» falhou, e a narração disse
     que ninguém olhou — o envelope da falha dizia só que o corpo aparecia, e o
     Narrador escolheu quem via. Frases nossas. */
  const HEROI = { nivel: 1, inventario: [], habilidades: [], equipado: {}, moedas: 10 };
  const LEIT = { personagem: HEROI, semente: "s19", lugar: "Cais", tentativas: {}, dia: 1 };
  const ret = retratoDosRefs({ cidade: "Ilha", lugar: { nome: "Cais" }, minuto: 900, clima: "ensolarado", grupo: [{ nome: "Orla", vida: 9, vidaMax: 9 }], presentes: [{ nome: "Orin", papel: "capanga" }] });
  const m = chamadoDoMomento("me escondo atrás da lona", LEIT, ret, {});
  const v = marcarDoMomento(m.veredito, m);
  t("esgueirar com alguém que pode notar leva o preço da cena, com o nome de quem vê", m.rola && typeof v.secaDoMomento === "string" && v.secaDoMomento.startsWith("Orin "), v.secaDoMomento);
  const des = desfechoDaMargem(v, { total: 5, dc: 15 });
  t("a falha seca diz o fato (quem me vê), e não o genérico", !!des && des.diz === v.secaDoMomento, des && des.diz);
  const env = envelopeDoCusto(des, "Furtividade");
  t("o envelope da falha leva o fato e não promete um tempo que não se cobrou", env.includes(v.secaDoMomento) && !/cobrou o tempo/.test(env), env);
  t("e o preço da cena não fala da regra", Object.values(O_PRECO_NA_CENA).every((s) => !O_QUE_ACONTECE.proibidas.test(s) && !/\b(tu|teu|tua)\b/.test(s)) && Object.isFrozen(O_PRECO_NA_CENA));
  const quase = desfechoDaMargem(v, { total: 14, dc: 15 });
  t("o «quase» continua o preço dele (passa, mas faz barulho)", !!quase && quase.porPouco && quase.diz !== v.secaDoMomento);
  const furto = chamadoDoMomento("furto a bolsa do Orin", LEIT, ret, {});
  const vf = marcarDoMomento(furto.veredito, furto);
  t("a mão leve contra o dono presente: ele vê a mão", typeof vf.secaDoMomento === "string" && /^Orin vê a minha mão/.test(vf.secaDoMomento), vf.secaDoMomento);
  const vazio = retratoDosRefs({ cidade: "Ilha", lugar: { nome: "Beco", dentroDe: "Cais" }, minuto: 120, clima: "ensolarado", grupo: [{ nome: "Orla", vida: 9, vidaMax: 9 }], presentes: [] });
  const ninguem = chamadoDoMomento("me escondo atrás da lona", LEIT, vazio, {});
  t("sem ninguém que note, não rola, e nada de preço da cena", !ninguem.rola && !("secaDoMomento" in marcarDoMomento(ninguem.veredito || { tipo: "teste", id: "furtar_se" }, ninguem)), ninguem.porque);
  t("a busca não ganha preço de ser visto", !("secaDoMomento" in marcarDoMomento({ tipo: "teste", id: "buscar" }, m)));
}

sec("S20. a narração não desmente o veredito, e a tela não fala do mecanismo (21/11/2026, o-mestre-vivo.md §20)");
{
  const P = PAUTA_DO_MESTRE_VIVO;
  const HS = { nivel: 1, inventario: [], habilidades: [], equipado: {}, moedas: 15 };
  const CS = { personagem: HS, semente: "s20", lugar: "Largo do Sal", tentativas: {}, dia: 1 };
  const largo = (pessoas) => ({ cidade: "Andar 1", lugar: { nome: "Largo do Sal" }, minuto: 15 * 60, clima: "ensolarado", grupo: [{ nome: "Perrin", papel: "ladino", vida: 9, vidaMax: 9 }], pessoas });
  /* o alvo da conversa vai ao Narrador */
  const m = chamadoDoMomento("ameaço o velho: quebro a vara e a mão dele", CS, largo([{ nome: "Velho", papel: "velho que corta a vara" }]), {});
  const pa = pautaDoMomento(m);
  t("a ameaça ao velho rola e diz o alvo", m.rola && m.alvo === "Velho", JSON.stringify([m.porque, m.alvo]));
  t("a pauta diz a quem falei e proíbe outra boca e a reação contrária ao resultado", !!pa && pa.acabou.some((l) => /Velho/.test(l))
    && pa.naoPode.includes(P.outraBoca.replace("{alvo}", "Velho")) && pa.naoPode.includes(P.contraOResultado), JSON.stringify(pa));
  const semNome = pautaDoMomento({ rola: true, porque: "mentiraOuAmeaca", alvo: "mulher", cena: {} });
  t("o alvo dito pelo papel vai como «quem eu chamei de»", !!semNome && semNome.acabou.some((l) => l.includes("«mulher»")));
  t("sem alvo (a escalada), nenhuma linha de alvo", pautaDoMomento({ rola: true, porque: "riscoDoAto", cena: {} }) === null);
  /* o meio que a ficha nega */
  const gazua = pautaDoMomento({ rola: false, porque: "naoETeste", cena: {}, veredito: { tipo: "impossivel", porque: "você não tem ferramentas de ladrão" } });
  t("a gazua que a ficha nega vai como veto do turno", !!gazua && gazua.naoPode.some((l) => /ferramentas de ladrão/.test(l)));
  t("as linhas novas da pauta são PT-BR (sem tu/teu/tua)", [P.alvo, P.alvoSemNome, P.outraBoca, P.contraOResultado, P.semOQueNaoTem].every((l) => !/\b(tu|teu|tua|contigo)\b/.test(l)));
  /* a fala da mesa, com a chave: o que aconteceu, sem a regra */
  const F = A_FALA_DA_MESA;
  const desPorUm = { porPouco: true, faixa: "mas", diz: "ela cede, mas cede errado" };
  const desFaltou = { porPouco: true, faltou: 2, diz: "a coisa vem para a sua mão, mas vem tilintando" };
  const imposs = { tipo: "impossivel", porque: "você não tem ferramentas de ladrão", comoSeria: ["à força, no ombro"] };
  const jaT = { tipo: "jaTentou", rotulo: "passar sem ser visto", comoReabrir: ["por outro caminho"] };
  const falas = [falaDoCustoNaMesa(desPorUm), falaDoCustoNaMesa(desFaltou), falaDoVeredictoNaMesa(imposs), falaDoVeredictoNaMesa(jaT),
    falaDoVeredictoNaMesa({ ...jaT, apósSucesso: true }), falaDoVeredictoNaMesa({ tipo: "vasculhado" }), falaDoBarulhoNaMesa(),
    falaDosBlefesNaMesa({ blefes: [{ rotulo: "o aço à vista", porque: "você não tem uma arma à mão" }] })];
  t("toda fala da mesa existe e nenhuma fala do mecanismo (faltaram, por um fio, insistir, outro jeito, não contou, sem dado…)",
    falas.every((x) => typeof x === "string" && x.length > 3 && !F.proibidas.test(x)), JSON.stringify(falas));
  t("as falas de hoje eram as que a sessão listou (a régua da troca)", F.proibidas.test(falaDoCusto(desPorUm)) && F.proibidas.test(falaDoCusto(desFaltou))
    && F.proibidas.test(falaDoVeredicto(imposs)) && F.proibidas.test(falaDoVeredicto({ ...jaT, comoReabrir: ["por outro caminho"] }))
    && F.proibidas.test(falaDosBlefes({ blefes: [{ rotulo: "o aço à vista", porque: "você não tem uma arma à mão" }] })));
  t("o fato fica: o preço e o que falta continuam na tela", falas[0] === "⚖ Ela cede, mas cede errado." && /ferramentas de ladrão/.test(falas[2]) && /arma à mão/.test(falas[7]));
  t("o «já conseguiu — sem dado» some da tela (string vazia); o resto do catálogo fica com a fala de hoje (null)",
    falaDoVeredictoNaMesa({ tipo: "livre", porque: "Isso você já conseguiu aqui" }) === "" && falaDoVeredictoNaMesa({ tipo: "naoSePede" }) === null && falaDoVeredictoNaMesa(null) === null);
  t("lixo não lança", falaDoCustoNaMesa(null) === null && falaDosBlefesNaMesa({}) === null && falaDosBlefesNaMesa(null) === null);
  /* a fiação: atrás da chave, em calou, e com a de hoje como volta */
  const app = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "src", "App.jsx"), "utf8");
  t("o App usa as quatro falas da mesa só com a chave, e volta à de hoje", /const falaDaMesaOu = \(fazer, deHoje, nome\) => \{\s*if \(!mestreVivoLigado\(\)\) return deHoje\(\);/.test(app)
    && ["falaDoCustoNaMesa(custo)", "falaDoBarulhoNaMesa()", "falaDoVeredictoNaMesa(v)", "falaDosBlefesNaMesa(v.social"].every((x) => app.includes(x)));
  /* MOVIDA em 22/11 (a décima sessão, T16): a fala do blefe ganhou o segundo argumento (o suborno com quantia cala o blefe da moeda) — a intenção, a fala da mesa só com a chave, é a mesma */
  t("o contexto do desafio leva a chave fina do livro só com o Mestre vivo ligado", app.includes("chaveFina: (() => { try { return !!mestreVivoLigado(); }"));
  /* o sem-dado social leva o alvo da régua quando o elenco não achou ninguém */
  const sd = oQueAconteceSemDado({ tipo: "teste", social: { tamanho: "favor" }, dc: 10, pericia: "persuasao" }, { porque: "dispostoCede", alvo: "Perrin" }, { frase: "peço ao Perrin que vigie a rua" });
  t("o sim sem dado diz quem aceitou (o alvo da régua)", sd.quem === "Perrin", JSON.stringify(sd.quem));
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
