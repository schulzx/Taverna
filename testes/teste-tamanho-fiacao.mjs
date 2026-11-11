/* A FIAÇÃO DA EM2 (Fase EM, 11/11/2026) — a resposta do tamanho da pergunta,
   no App.jsx e no turno do servidor.

   A peça (src/tamanho-da-resposta.js) já estava provada em
   teste-tamanho-da-resposta.mjs; o que faltava era o pedido que vai à rede
   levá-la. Esta suíte lê os dois arquivos por âncora e prende as promessas:

     1. O TIPO DO TURNO SAI DO QUE O APP SABE ANTES DA RESPOSTA: a frase, o
        teste resolvido no turno (testeDoTurnoRef) e a luta que acabou — em
        calou; com erro, o tamanho é null e o pedido vai como ia.
     2. SÓ A CÓPIA QUE VAI À REDE MUDA: chamarMestre aplica comOTamanho
        depois de arrumar o pedido para o cache, e as duas chamadas (o turno
        e o reforço) levam o teto do pedido; sem ele, os 3600 de sempre. O
        histórico guardado (novoHist) não é tocado.
     3. O MODO ATOR leva o mesmo tamanho, no pedido do ator.
     4. O SERVIDOR aplica a mesma régua no mesmo ponto: na cópia que vai à
        rede (Mestre ou ator), nunca no pedido montado — esse continua o do
        motor, byte a byte o do caminho do App (teste-turno-no-servidor). O
        reforço leva o teto do pedido, e o protocolo não muda: o envio já lia
        p.maxTokens.
     5. O CONTRATO: o pedido montado como o App o monta troca a linha da
        etiqueta e o teto, e o que volta ao histórico continua igual. */
import fs from "node:fs";

const semComentarios = (x) => x.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const APP = semComentarios(fs.readFileSync("../src/App.jsx", "utf8"));
const SRV = semComentarios(fs.readFileSync("../src/turno-no-servidor.js", "utf8"));

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* o corpo da função de módulo chamarMestre: da assinatura à próxima função de módulo */
const doModulo = (nome) => {
  const i = APP.indexOf(`\nasync function ${nome}(`);
  if (i < 0) return "";
  const resto = APP.slice(i + 1);
  const m = /\n(?:async function |function |const |export )/.exec(resto.slice(10));
  return m ? resto.slice(0, m.index + 10) : resto;
};

sec("0. O APP E O SERVIDOR LEEM A PEÇA");
{
  t("o App importa oTamanhoDaResposta e comOTamanho", /import \{ oTamanhoDaResposta, comOTamanho \} from "\.\/tamanho-da-resposta\.js";/.test(APP));
  t("o servidor importa os dois", /import \{ oTamanhoDaResposta, comOTamanho \} from "\.\/tamanho-da-resposta\.js";/.test(SRV));
}

sec("1. O TIPO DO TURNO, ANTES DA RESPOSTA");
{
  const i = APP.indexOf("oPedidoDoTurno(estadoDoPedido(),");
  const j = APP.indexOf("const resp = pedidoDoAtor ?", i);
  const trecho = i > 0 && j > i ? APP.slice(i, j) : "";
  t("o tamanho monta-se entre o pedido do turno e a chamada", trecho.length > 0 && /tamanho = oTamanhoDaResposta\(\{/.test(trecho));
  t("com a frase, o teste do turno e a luta que acabou", /oTamanhoDaResposta\(\{ frase: conteudo, teste: testeDoTurnoRef\.current, luta: !!combateAntes && !combateRef\.current \}\)/.test(trecho));
  t("em calou: com erro, o tamanho é null", /catch \(e\) \{ calou\("o tamanho da resposta", e\); tamanho = null; \}/.test(trecho));
  t("a chamada do Mestre passa o tamanho", /await chamarMestre\(systemRef\.current, novoHist, tamanho\)/.test(APP));
}

sec("2. SÓ A CÓPIA QUE VAI À REDE MUDA");
{
  const cm = doModulo("chamarMestre");
  t("chamarMestre recebe o tamanho (por omissão null)", /^async function chamarMestre\(system, historico, tamanho = null\)/.test(cm));
  const a = cm.indexOf("pedidoNaOrdemDoCache(system");
  const b = cm.indexOf("comOTamanho(pedido, tamanho)");
  t("comOTamanho aplica-se DEPOIS da arrumação do cache", a > 0 && b > a);
  t("em calou", /try \{ if \(tamanho\) pedido = comOTamanho\(pedido, tamanho\); \} catch \(e\) \{ calou\("o tamanho no pedido", e\); \}/.test(cm));
  t("o teto é o do pedido, com os 3600 de sempre por reserva", /const teto = Number\(pedido\.maxTokens\) \|\| 3600;/.test(cm));
  t("o turno e o reforço levam o teto", /chamarModelo\(pedido\.system, pedido\.messages, teto, "json", "narrador", true\)/.test(cm) && /chamarModelo\(pedido\.system, reforco, teto, "json"\)/.test(cm));
  t("nenhum 3600 solto nas chamadas do Mestre", !/chamarModelo\([^)]*3600/.test(cm));
  t("o histórico guardado não passa pela peça", !/comOTamanho\([^)]*novoHist/.test(APP));
}

sec("3. O MODO ATOR");
{
  t("o pedido do ator leva o mesmo tamanho, em calou", /if \(pedidoDoAtor && tamanho\) \{ try \{ pedidoDoAtor = \{ \.\.\.pedidoDoAtor, pedido: comOTamanho\(pedidoDoAtor\.pedido, tamanho\) \}; \} catch \(e\) \{ calou\("o tamanho no pedido do ator", e\); \} \}/.test(APP));
  t("e chamarOAtor lê o teto do pedido (c.maxTokens)", /chamarModelo\(c\.system, c\.messages, c\.maxTokens, /.test(APP));
}

sec("4. O SERVIDOR");
{
  const i = SRV.indexOf('portas.calou("o pedido do ator", x)');
  const j = SRV.indexOf("for (const g of adiados.splice(0))", i);
  const montagem = i > 0 && j > i ? SRV.slice(i, j) : "";
  t("a montagem não toca no pedido (o hash do caminho do App)", montagem.length > 0 && !/comOTamanho/.test(montagem));
  t("a cópia que vai à rede leva o tamanho da frase, em calou", /try \{ pedidoNaRede = comOTamanho\(m\.pedido, oTamanhoDaResposta\(\{ frase: m\.frase \}\)\); \} catch \(x\) \{ calouT\("o tamanho no pedido"\); pedidoNaRede = m\.pedido; \}/.test(SRV));
  t("o ator e o Mestre do servidor recebem essa cópia", /aRespostaDoAtor\(pedidoNaRede, porta, /.test(SRV) && /oNarradorDoServidor\(pedidoNaRede, op\.chamar, /.test(SRV));
  t("o reforço do servidor leva o teto do pedido", /\.\.\.IA_DO_TURNO\.reforco, \.\.\.\(Number\(p\.maxTokens\) > 0 \? \{ maxTokens: Number\(p\.maxTokens\) \} : \{\}\)/.test(SRV));
  t("o protocolo não muda: o envio já lê p.maxTokens", /maxTokens: p\.maxTokens/.test(SRV));
}

sec("5. O CONTRATO COM A PEÇA");
{
  const M = await import("../src/tamanho-da-resposta.js");
  const E = await import("../src/escuta.js");
  const ultima = `[ESTADO]\n…\n${E.ETIQUETA_DO_PEDIDO}\nQuanto custa a cerveja?`;
  const hist = [{ role: "user", content: "a" }, { role: "assistant", content: "b" }, { role: "user", content: ultima }];
  const pedido = { system: "S", messages: hist.slice() };
  const tam = M.oTamanhoDaResposta({ frase: "Quanto custa a cerveja?", teste: null, luta: false });
  const novo = M.comOTamanho(pedido, tam);
  t(`a pergunta é pergunta (${tam.tipo}), com o teto dela`, tam.tipo === "pergunta" && novo.maxTokens === M.TAMANHO_DA_RESPOSTA.pergunta.maxTokens);
  t("a etiqueta da última mensagem troca a linha", novo.messages[2].content !== ultima && novo.messages[2].content.includes(tam.linha));
  t("as mensagens de antes ficam letra por letra (o prefixo do cache)", novo.messages[0] === hist[0] && novo.messages[1] === hist[1]);
  t("o histórico recebido não muda", hist[2].content === ultima && pedido.maxTokens === undefined);
  const tTeste = M.oTamanhoDaResposta({ frase: "Quanto custa a cerveja?", teste: { pericia: "saberes", sucesso: false }, luta: false });
  t("com o teste do turno, o tipo é teste", tTeste.tipo === "teste");
  t("sem tamanho, o pedido vai como ia (e o App cai nos 3600)", M.comOTamanho(pedido, null) === pedido);
}

console.log(`\ntamanho-fiacao: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
