/* teste-tamanho-da-resposta.mjs (Fase EM, EM2 · 11/11/2026) — a resposta do
   tamanho da pergunta.

   O estudo do Mestre (mente/estudo-do-mestre.md, L3): a uma pergunta de
   jogo, a mesa responde com 11 palavras de mediana (p75: 25); nós com 113,
   e nunca menos de 44. A peça (src/tamanho-da-resposta.js) dá a cada tipo
   de turno o seu tamanho e o seu teto, e troca a linha de tamanho que já ia
   colada à frase do jogador — nunca soma.

   O que se prova:
     §1 a tabela: cada tipo com alvo e teto; a pergunta cabe na prova da 19.ª
        (≤ 40), a chegada também (≥ 80); a abertura e a chegada leem as
        tabelas de onde vieram;
     §2 o teto: cada `maxTokens` cobre a folga e a reserva, e cabe na faixa
        que o servidor aceita (conferida contra api/_provedor.js);
     §3 o tipo do turno: a ordem dos sinais, a pergunta pela frase, a
        conversa pela frase, o lixo;
     §4 a linha substitui: nenhuma etiqueta nem ofício cresce (o pior caso
        da mensagem do turno não sobe), e o system do Mestre não lê a peça;
     §5 o pedido: troca na última mensagem, não muta, devolve igual sem
        tamanho; as réguas que leem a etiqueta (a fala do herói, a frase que
        paga) continuam a achar a frase;
     §6 determinismo. */
import fs from "node:fs";
import {
  TAMANHO_DA_RESPOSTA, REDE_DO_TAMANHO, TIPO_PADRAO_DO_TAMANHO, SINAIS_DA_CONVERSA,
  tipoDoTurno, oTamanhoDaResposta, comOTamanho,
} from "../src/tamanho-da-resposta.js";
import { TAMANHO_DA_NARRATIVA, LINHA_DO_TAMANHO, ETIQUETA_DO_PEDIDO, fechoDoPedido, lerOPedido } from "../src/escuta.js";
import { TAMANHO_DA_ABERTURA } from "../src/abertura.js";
import { REDE_DE_SAIDA } from "../api/_provedor.js";
import { oPedidoDoAtor } from "../src/motor/pedido-do-ator.js";
import { fraseDoPedido, semFalaInventada } from "../src/fala-do-heroi.js";
import { oQueFaltaDebitar } from "../src/cobranca.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };
const TIPOS = Object.keys(TAMANHO_DA_RESPOSTA);
const TODOS = ["abertura", "fecho", "luta", "chegada", "teste", "pergunta", "conversa", "acao"];
/* o turno que acende só o sinal de um tipo */
const turnoDe = (k) => (k === "teste" ? { teste: { pericia: "Atletismo", sucesso: true } }
  : k === "pergunta" ? { frase: "Quanto custa a cerveja?" }
  : k === "conversa" ? { frase: "— Boa noite, senhora." }
  : k === "acao" ? { frase: "Sento-me ao balcão." }
  : { [k]: true });

sec("§1 a tabela");
t("os oito tipos do pedido, nem mais nem menos", JSON.stringify([...TIPOS].sort()) === JSON.stringify([...TODOS].sort()), TIPOS.join());
for (const k of TIPOS) {
  const r = TAMANHO_DA_RESPOSTA[k];
  t(`${k}: alvo (de ${r.de} até ${r.ate}) e teto (${r.maxTokens}) — números, com o «até» acima do «de»`, Number.isFinite(r.de) && Number.isFinite(r.ate) && r.ate > r.de && r.de >= 0 && Number.isFinite(r.maxTokens) && r.folga >= 1 && typeof r.jeito === "string" && r.jeito.length > 0);
}
t("a ordem não empata (quem vence dois sinais juntos é uma só)", new Set(TIPOS.map((k) => TAMANHO_DA_RESPOSTA[k].ordem)).size === TIPOS.length);
t("a pergunta pede no máximo 40 palavras (a prova da 19.ª: mediana ≤ 40)", TAMANHO_DA_RESPOSTA.pergunta.ate <= 40);
t("a chegada pede pelo menos 80 (a prova: chegadas ≥ 80)", TAMANHO_DA_RESPOSTA.chegada.de >= 80);
t("a chegada é a faixa de sempre (TAMANHO_DA_NARRATIVA), lida e não copiada", TAMANHO_DA_RESPOSTA.chegada.de === TAMANHO_DA_NARRATIVA.min && TAMANHO_DA_RESPOSTA.chegada.ate === TAMANHO_DA_NARRATIVA.max);
t("a abertura é a de abertura.js (TAMANHO_DA_ABERTURA)", TAMANHO_DA_RESPOSTA.abertura.ate === TAMANHO_DA_ABERTURA.max);
t("a pergunta e a conversa pedem menos do que a ação; a ação menos do que a chegada", TAMANHO_DA_RESPOSTA.pergunta.ate < TAMANHO_DA_RESPOSTA.acao.ate && TAMANHO_DA_RESPOSTA.conversa.ate < TAMANHO_DA_RESPOSTA.acao.ate && TAMANHO_DA_RESPOSTA.acao.ate < TAMANHO_DA_RESPOSTA.chegada.ate);
t("o tipo padrão existe na tabela", !!TAMANHO_DA_RESPOSTA[TIPO_PADRAO_DO_TAMANHO]);
t("os sinais da conversa são réguas", SINAIS_DA_CONVERSA.length > 0 && SINAIS_DA_CONVERSA.every((rx) => rx instanceof RegExp));

sec("§2 o teto nunca corta uma resposta legítima, e cabe no servidor");
const R = REDE_DO_TAMANHO;
for (const k of TIPOS) {
  const r = TAMANHO_DA_RESPOSTA[k];
  const precisa = Math.ceil(r.ate * R.tokensPorPalavra * r.folga) + R.reserva;
  t(`${k}: ${r.maxTokens} ≥ ${r.ate}×${R.tokensPorPalavra}×${r.folga} + ${R.reserva} = ${precisa}, ou o piso`, r.maxTokens >= Math.min(R.rede, Math.max(R.piso, precisa)) && precisa <= R.rede);
  t(`${k}: dentro da faixa que o servidor aceita (${R.piso}–${R.rede})`, r.maxTokens >= R.piso && r.maxTokens <= R.rede);
}
t("a rede é a do servidor (api/_provedor.js, REDE_DE_SAIDA.narrador)", R.rede === REDE_DE_SAIDA.narrador);
{
  const fonte = fs.readFileSync(new URL("../api/_provedor.js", import.meta.url), "utf8");
  const m = fonte.match(/Math\.max\(Number\(maxTokens\) \|\| \d+, (\d+)\)/);
  t("o piso é o do servidor (chamarOProvedor: Math.max(…, piso))", !!m && Number(m[1]) === R.piso, m ? m[1] : "não achei o piso");
}
t("a maior saída de turno medida (453 tokens, 12.ª sessão) cabe em todo teto de turno", TIPOS.filter((k) => k !== "abertura").every((k) => TAMANHO_DA_RESPOSTA[k].maxTokens > 453));
t("a abertura medida (778 tokens) cabe no teto da abertura", TAMANHO_DA_RESPOSTA.abertura.maxTokens > 778);

sec("§3 o tipo do turno");
for (const k of TIPOS) t(`só o sinal de ${k} → ${k}`, tipoDoTurno(turnoDe(k)) === k, tipoDoTurno(turnoDe(k)));
t("a chegada vence a pergunta feita ao chegar (há o que ver)", tipoDoTurno({ chegada: true, frase: "Onde fica a forja?" }) === "chegada");
t("o teste resolvido vence a pergunta", tipoDoTurno({ teste: { pericia: "Intuição", sucesso: false }, frase: "Ele mente?" }) === "teste");
t("a luta que acabou vence a chegada", tipoDoTurno({ luta: true, chegada: true }) === "luta");
t("a abertura vence tudo", tipoDoTurno({ abertura: true, luta: true, fecho: true, chegada: true }) === "abertura");
t("um teste ainda por rolar (lerAcao: teste) não é pergunta, mesmo com «?»", tipoDoTurno({ frase: "Consigo abrir a tranca?", acao: { tipo: "teste" } }) !== "pergunta");
t("a pergunta pode vir já lida (lerOPedido)", tipoDoTurno({ pedido: lerOPedido("Quantas moedas tenho?") }) === "pergunta");
t("«pergunto ao taberneiro…» é curta (pergunta ou conversa)", ["pergunta", "conversa"].includes(tipoDoTurno({ frase: "Pergunto ao taberneiro quanto custa o quarto" })));
t("«digo à guarda que…» é conversa", tipoDoTurno({ frase: "Digo à guarda que venho em paz" }) === "conversa");
t("a fala entre aspas é conversa", tipoDoTurno({ frase: "«Sou do norte», respondo." }) === "conversa");
t("o App pode dizer que é conversa", tipoDoTurno({ conversa: true, frase: "Aceno." }) === "conversa");
t("a ação sem pergunta nem fala é ação", tipoDoTurno({ frase: "Ataco o goblin com a espada." }) === "acao");
t("lixo → o padrão (null, {}, string, número, lista)", [null, undefined, {}, "x", 7, []].every((x) => tipoDoTurno(x) === TIPO_PADRAO_DO_TAMANHO));
t("teste que não é objeto não acende", tipoDoTurno({ teste: true, frase: "Sento-me." }) === "acao");
{
  const o = oTamanhoDaResposta({ frase: "Quanto custa a cerveja?" });
  t("a saída tem a forma { tipo, palavras: { de, ate }, maxTokens, linha }", o.tipo === "pergunta" && o.palavras.de === 0 && o.palavras.ate === TAMANHO_DA_RESPOSTA.pergunta.ate && o.maxTokens === TAMANHO_DA_RESPOSTA.pergunta.maxTokens && typeof o.linha === "string");
  t("a linha diz o número da tabela", o.linha.includes(`até ${TAMANHO_DA_RESPOSTA.pergunta.ate} palavras`), o.linha);
  t("e a chegada diz a faixa", oTamanhoDaResposta({ chegada: true }).linha.includes(`${TAMANHO_DA_NARRATIVA.min} a ${TAMANHO_DA_NARRATIVA.max} palavras`));
  t("oTamanhoDaResposta(null) não lança e dá o padrão", oTamanhoDaResposta(null).tipo === TIPO_PADRAO_DO_TAMANHO);
}

sec("§4 a linha substitui, nunca soma (o pior caso não cresce)");
{
  const hoje = LINHA_DO_TAMANHO.replace("{palavras}", `${TAMANHO_DA_NARRATIVA.min} a ${TAMANHO_DA_NARRATIVA.max}`).replace("{jeito}", "termine antes do limite");
  t("a etiqueta de hoje é feita do molde, letra por letra", ETIQUETA_DO_PEDIDO.includes(hoje) && ETIQUETA_DO_PEDIDO === "[O QUE EU FAÇO AGORA — a narração abre por aqui. Responda em 80 a 140 palavras e termine antes do limite. Não ponha na minha boca fala que eu não escrevi, nem decida por mim.]");
  const frase = "Quanto custa a cerveja?";
  const msgHoje = `[PAUTA DO TURNO]\nalgo\n${fechoDoPedido(lerOPedido(frase))}`;
  const deltas = [];
  for (const k of TIPOS) {
    const tam = oTamanhoDaResposta(turnoDe(k));
    t(`${k}: a linha (${tam.linha.length}) não passa a de hoje (${hoje.length})`, tam.linha.length <= hoje.length, tam.linha);
    t(`${k}: sem «]» nem quebra (a régua da cobrança lê a etiqueta até ao «]»)`, !/[\]\n]/.test(tam.linha));
    const p = comOTamanho({ system: "S", messages: [{ role: "user", content: msgHoje }], maxTokens: 3600 }, tam);
    deltas.push(p.messages[0].content.length - msgHoje.length);
  }
  const pior = Math.max(...deltas);
  console.log(`       a mensagem do turno: hoje ${msgHoje.length} caracteres; pior tipo ${msgHoje.length + pior} (Δ ${pior}); o melhor ${msgHoje.length + Math.min(...deltas)}`);
  t("o pior caso da mensagem do turno não cresce (Δ ≤ 0 em todo tipo)", pior <= 0, String(pior));
  /* o ator: o tamanho mora no ofício (o system), e a troca não o alonga */
  const pa = oPedidoDoAtor({ nota: "", frase, estado: {} }).pedido;
  const dAtor = TIPOS.map((k) => comOTamanho(pa, oTamanhoDaResposta(turnoDe(k))).system.length - pa.system.length);
  console.log(`       o ofício do ator: hoje ${pa.system.length}; pior tipo ${pa.system.length + Math.max(...dAtor)}`);
  t("o ofício do ator diz o tamanho de hoje, e a troca acha-o", pa.system.includes(`de ${TAMANHO_DA_NARRATIVA.min} a ${TAMANHO_DA_NARRATIVA.max} palavras`) && comOTamanho(pa, oTamanhoDaResposta(turnoDe("pergunta"))).system.includes(`até ${TAMANHO_DA_RESPOSTA.pergunta.ate} palavras`));
  t("o ofício do ator não cresce com tipo nenhum", Math.max(...dAtor) <= 0, String(Math.max(...dAtor)));
  /* o system do Mestre (o teto de ~82k) não lê a peça: nada estático nasce */
  const src = (f) => fs.readFileSync(new URL("../src/" + f, import.meta.url), "utf8");
  t("o prompt fixo (prompt.js) e a pauta (pauta.js) não importam a peça", !/tamanho-da-resposta/.test(src("prompt.js")) && !/tamanho-da-resposta/.test(src("pauta.js")));
}

sec("§5 o pedido");
{
  const frase = "Quanto custa a cerveja?";
  const ped = congelar({ system: "S", messages: [{ role: "user", content: "velha\n" + ETIQUETA_DO_PEDIDO + "\nolho" }, { role: "assistant", content: "x" }, { role: "user", content: `[PAUTA]\n${fechoDoPedido(lerOPedido(frase))}` }], maxTokens: 3600, formato: "json", tarefa: "narrador", comCache: true });
  const tam = oTamanhoDaResposta({ frase });
  let n = null, lancou = false;
  try { n = comOTamanho(ped, tam); } catch { lancou = true; }
  t("não muta o recebido (congelado, e não lança)", !lancou && n !== ped);
  t("o teto é o do tipo", n.maxTokens === TAMANHO_DA_RESPOSTA.pergunta.maxTokens);
  t("a última mensagem leva a linha do tipo, no lugar da de hoje", n.messages[2].content.includes(tam.linha) && !n.messages[2].content.includes("80 a 140"));
  t("as mensagens de antes vão letra por letra (o prefixo do cache não muda)", n.messages[0] === ped.messages[0] && n.messages[1] === ped.messages[1]);
  t("o resto do pedido vai igual", n.system === "S" && n.formato === "json" && n.tarefa === "narrador" && n.comCache === true);
  t("sem tamanho, o pedido volta como veio", comOTamanho(ped, null) === ped && comOTamanho(ped, { tipo: "inventado" }) === ped);
  t("pedido lixo volta como veio", comOTamanho(null, tam) === null && comOTamanho("x", tam) === "x");
  t("sem etiqueta na última, só o teto muda", (() => { const p = comOTamanho({ system: "S", messages: [{ role: "user", content: "[abertura]" }] }, tam); return p.messages[0].content === "[abertura]" && p.maxTokens === tam.maxTokens; })());
  /* as réguas que leem a etiqueta */
  t("a fala do herói acha a frase depois da etiqueta nova", fraseDoPedido(n.messages[2].content) === frase);
  t("e ainda a acha na etiqueta de sempre", fraseDoPedido(`${ETIQUETA_DO_PEDIDO}\nAtaco.`) === "Ataco." && fraseDoPedido(null) === "");
  /* a guarda só poda o que deixa ≥ 40 palavras (FALA_DO_HEROI.minPalavras): a cena tem corpo */
  const narr = "O salão está cheio de gente que bebe e conversa alto sobre a colheita, o preço do trigo e a chuva que não veio. ".repeat(3) + "\n— Me dá a cerveja — você diz.\nO taberneiro serve.";
  const comNova = comOTamanho({ messages: [{ role: "user", content: `${ETIQUETA_DO_PEDIDO}\nOlho o taberneiro.` }] }, oTamanhoDaResposta({ frase: "Olho o taberneiro." }));
  t("e a guarda da fala do herói ainda corta com a etiqueta nova", semFalaInventada(narr, comNova.messages[0].content).cortadas.length === 1);
  const envNova = comOTamanho({ messages: [{ role: "user", content: `${ETIQUETA_DO_PEDIDO}\nPago os quatro cobres.` }] }, oTamanhoDaResposta({ frase: "Pago os quatro cobres." })).messages[0].content;
  t("a frase que paga é achada na etiqueta nova (cobranca.js)", oQueFaltaDebitar("Ele guarda.", null, { bolsa: 34, envelopes: envNova }).moedas === 4);
}

sec("§6 determinismo");
{
  const casos = [null, {}, { frase: "Quanto custa?" }, { chegada: true }, { teste: { pericia: "x" } }, { frase: "— Olá." }, { abertura: true }];
  t("mesma entrada, mesma saída", casos.every((c) => JSON.stringify(oTamanhoDaResposta(c)) === JSON.stringify(oTamanhoDaResposta(c))));
  t("a tabela é congelada", Object.isFrozen(TAMANHO_DA_RESPOSTA) && TIPOS.every((k) => Object.isFrozen(TAMANHO_DA_RESPOSTA[k])) && Object.isFrozen(REDE_DO_TAMANHO));
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
