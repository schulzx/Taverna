/* teste-fila-de-cerimonias.mjs (V9, 16/11/2026) — a fila de cerimônias que
   não trava (src/fila-de-cerimonias.js, src/palco-da-cerimonia.jsx), formas.md
   §F6 e analise-jogo.md P0-8 (o «Partir» morto da prova de 15/11).

   O que se prova:
   1. as tabelas do F6 com a forma que a seção dá (CERIMONIAS, VEU, a pena);
   2. a máquina: uma de cada vez, pela prioridade; cada uma UMA vez (a que já
      passou nunca volta); xp e moedas somam; o silêncio só para as que param;
   3. o teto, o salto e o movimento reduzido;
   4. a catraca do botão que nunca morre (texto do App e das peças): toda
      cerimônia que para a mesa sobe pelo palco (portal, a mesa inerte), tem
      teto de relógio, e o botão impedido diz o porquê com aria-disabled;
   5. as medidas do pé fixo (PE_DA_SUBIDA) a 768 e a 375 de altura. */
import { readFileSync } from "node:fs";
import {
  CERIMONIAS, FILA_DE_CERIMONIAS, VEU_DA_CERIMONIA, ESTADOS_DA_PENA,
  filaVazia, tabelaDe, paraAMesa, jaConhecida, enfileirar, haSilencio, avancar, pousar,
  tetoDe, faseNoTempo, teclaSalta, fraseDaEspera, conquistaPodeEntrar, estadoDaPena,
} from "../src/fila-de-cerimonias.js";
import { PE_DA_SUBIDA, ALVOS } from "../src/estilo.js";
import { SOM_DA_MESA, tocarDaCerimonia } from "../src/som-da-mesa.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  MAL " + nome); } };
const sec = (s) => console.log("\n" + s);
const ler = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

sec("1. as tabelas do F6");
{
  const param = ["queda", "buscaFechada", "nivel", "despertar", "espolioLendario", "espolioRaro", "encruzilhada", "fogueira"];
  const naoParam = ["conquista", "espolioIncomum", "espolioComum", "etapa", "xp", "moedas"];
  t("as catorze chaves, na ordem da prioridade (a queda primeiro)", CERIMONIAS.ordem.length === 14 && CERIMONIAS.ordem[0] === "queda" && CERIMONIAS.ordem.every((k) => CERIMONIAS[k]));
  t("só param a mesa as oito do F6 §1.1", param.every((k) => CERIMONIAS[k].para) && naoParam.every((k) => !CERIMONIAS[k].para));
  t("nenhuma segura a mesa mais de 4 s sem pedir escolha (F6 §5)", CERIMONIAS.ordem.every((k) => CERIMONIAS[k].teto <= 4000));
  t("os tetos do F6: busca 2400, nível 2800, lendária 3600, etapa 440, xp 900", CERIMONIAS.buscaFechada.teto === 2400 && CERIMONIAS.nivel.teto === 2800 && CERIMONIAS.espolioLendario.teto === 3600 && CERIMONIAS.etapa.teto === 440 && CERIMONIAS.xp.teto === 900);
  t("o lacre da busca desce de 120 a 440", CERIMONIAS.buscaFechada.fases.some(([n, de, ate]) => n === "lacreDesce" && de === 120 && ate === 440));
  t("as fases nunca começam antes de 0 nem terminam antes de começar", CERIMONIAS.ordem.every((k) => CERIMONIAS[k].fases.every(([, de, ate]) => de >= 0 && ate > de)));
  t("toda que para tem véu da tabela; as que não param, nenhum", param.every((k) => VEU_DA_CERIMONIA[CERIMONIAS[k].veu] > 0) && naoParam.every((k) => CERIMONIAS[k].veu === null));
  t("o véu: leve 0,35 · palco 0,80 · noite 0,90 · queda 0,92 · fim 0,94", VEU_DA_CERIMONIA.leve === 0.35 && VEU_DA_CERIMONIA.palco === 0.8 && VEU_DA_CERIMONIA.noite === 0.9 && VEU_DA_CERIMONIA.queda === 0.92 && VEU_DA_CERIMONIA.fim === 0.94);
  t("a página cai a 30 % (10 % no telefone) por baixo", VEU_DA_CERIMONIA.paginaPorBaixo === 0.3 && VEU_DA_CERIMONIA.paginaPorBaixoNoTelefone === 0.1);
  t("a camada do palco fica acima da maior da mesa (100)", FILA_DE_CERIMONIAS.camada > 100);
  t("a pena: molha até 2 s, escreve até 8 s", ESTADOS_DA_PENA.molha.ate === 2000 && ESTADOS_DA_PENA.escreve.ate === 8000);
  t("a falha diz que nada se perdeu e oferece «Tentar de novo»", /Nada se perdeu/.test(ESTADOS_DA_PENA.falhou.frase) && ESTADOS_DA_PENA.falhou.tentar === "Tentar de novo");
  t("nenhuma frase da fila fala da máquina", !/fila|cerim|estado|modal/i.test(JSON.stringify([FILA_DE_CERIMONIAS.frases, FILA_DE_CERIMONIAS.nomes, ESTADOS_DA_PENA])));
}

sec("2. a máquina: uma de cada vez, cada uma uma vez");
{
  let s = filaVazia();
  s = enfileirar(s, { tipo: "xp", quanto: 40 });
  s = enfileirar(s, { tipo: "nivel", chave: "nivel:3" });
  s = enfileirar(s, { tipo: "buscaFechada", chave: "espolio:q1" });
  t("entra pela prioridade da tabela (busca → nível → xp)", s.fila.map((c) => c.tipo).join() === "buscaFechada,nivel,xp");
  const s2 = enfileirar(s, { tipo: "buscaFechada", chave: "espolio:q1" });
  t("a mesma chave não entra duas vezes na fila", s2.fila.length === 3);
  const s3 = enfileirar(s, { tipo: "xp", quanto: 15 });
  t("xp soma numa nota só (40 + 15)", s3.fila.filter((c) => c.tipo === "xp").length === 1 && s3.fila.find((c) => c.tipo === "xp").quanto === 55);
  t("tipo que a tabela não conhece não entra", enfileirar(s, { tipo: "modal" }) === s && tabelaDe({ tipo: "modal" }) === null);
  t("o estado nunca é mutado", s.fila.length === 3 && Object.isFrozen(CERIMONIAS));

  const barulho = { lutaAberta: false, dadoEmVoo: true };
  t("com dado em voo não há silêncio", !haSilencio(barulho) && haSilencio({}));
  const a = avancar(s, barulho);
  t("sem silêncio, a que para espera — mas a que não para entra na vez (xp)", a.emCena && a.emCena.tipo === "xp" && a.fila.length === 2);
  t("com uma em cena, nada mais entra", avancar(a, {}) === a);
  const b = avancar(s, {});
  t("no silêncio, entra a de maior prioridade (a busca)", b.emCena.tipo === "buscaFechada" && paraAMesa(b.emCena));
  t("na luta aberta nada entra, nem as que não param", avancar(enfileirar(filaVazia(), { tipo: "xp", quanto: 1 }), { lutaAberta: true }).emCena === null);
  const c = pousar(b);
  t("pousar libera a mesa e guarda a chave", c.emCena === null && c.vistas.includes("espolio:q1"));
  t("A DA QUEST NUNCA VOLTA: a chave que pousou é recusada", enfileirar(c, { tipo: "buscaFechada", chave: "espolio:q1" }).fila.length === c.fila.length && jaConhecida(c, "espolio:q1"));
  const d = pousar(avancar(c, {}));
  t("a próxima entra depois (o nível) e pousa também", d.vistas.includes("nivel:3") && d.fila.map((x) => x.tipo).join() === "xp");
  let e = filaVazia();
  for (let i = 0; i < FILA_DE_CERIMONIAS.vistasGuardadas + 20; i++) e = pousar(e, "k" + i);
  t("as vistas têm teto (a memória não cresce sem fim)", e.vistas.length === FILA_DE_CERIMONIAS.vistasGuardadas);
  t("estado nulo vira fila vazia, nunca lança", avancar(null, null).emCena === null && pousar(null).vistas.length === 0 && enfileirar(null, null).fila.length === 0);
}

sec("3. o teto, o salto e o movimento reduzido");
{
  t("o teto é o da tabela", tetoDe({ tipo: "nivel" }) === 2800 && tetoDe({ tipo: "etapa" }) === 440);
  t("com menos movimento, um quadro só que entra em 120 ms", tetoDe({ tipo: "espolioLendario" }, { reduzido: true }) === FILA_DE_CERIMONIAS.reduzido.entra && FILA_DE_CERIMONIAS.reduzido.entra === 120);
  t("a fase no tempo: o lacre desce aos 200 ms", faseNoTempo({ tipo: "buscaFechada" }, 200) === "lacreDesce");
  t("depois do teto: «fim»; se pede toque, «espera» (o salto nunca pula a escolha)", faseNoTempo({ tipo: "buscaFechada" }, 5000) === "fim" && faseNoTempo({ tipo: "nivel" }, 5000) === "espera");
  t("Espaço, Enter e Esc saltam", ["Enter", " ", "Escape"].every((k) => teclaSalta(k, false)) && !teclaSalta("a", false));
  t("na escolha, Esc não fecha", !teclaSalta("Escape", true) && teclaSalta("Enter", true));
  const s = avancar(enfileirar(enfileirar(filaVazia(), { tipo: "buscaFechada", chave: "b" }), { tipo: "nivel", chave: "n" }), {});
  t("enquanto a mesa está parada, a linha diz por quê e o que vem", fraseDaEspera(s) === "o Mestre está batendo o lacre · toque para seguir · a seguir: nível novo");
  t("sem nada que pare, nenhuma frase", fraseDaEspera(filaVazia()) === null);
  t("a primeira conquista nunca antes do terceiro turno", !conquistaPodeEntrar(1, false) && conquistaPodeEntrar(3, false) && conquistaPodeEntrar(1, true));
  t("a pena: molha → escreve → demora; a frase faz escrever; a falha ganha", estadoDaPena(500) === "molha" && estadoDaPena(3000) === "escreve" && estadoDaPena(9000) === "demora" && estadoDaPena(500, { frases: 1 }) === "escreve" && estadoDaPena(500, { falhou: true }) === "falhou");
}

sec("4. a catraca: com cerimônia em cena, nenhum botão morre calado");
{
  const app = semComentario(ler("src/App.jsx"));
  const palco = ler("src/palco-da-cerimonia.jsx");
  const nivel = ler("src/painel-subida-de-nivel.jsx");
  const espolio = ler("src/painel-espolio.jsx");
  for (const peca of ["PainelSubidaDeNivel", "PainelEspolio", "PainelDespertar", "ModalNivel"]) {
    const usos = app.split("<" + peca + " ").length - 1;
    const noPalco = app.split(/<PalcoDaCerimonia>\s*/).slice(1).filter((x) => x.startsWith("<" + peca + " ")).length;
    t(peca + ": toda montagem no App sobe pelo palco (" + noPalco + "/" + usos + ")", usos > 0 && noPalco === usos);
  }
  t("o palco é portal no <body>, acima da mesa", /createPortal\(palco, document\.body\)/.test(palco) && /zIndex: FILA_DE_CERIMONIAS\.camada/.test(palco));
  t("o palco deixa o #root inerte e devolve-o ao descer (com contagem)", /setAttribute\("inert", ""\)/.test(palco) && /removeAttribute\("inert"\)/.test(palco) && /palcosDePe/.test(palco));
  t("as três cerimônias têm o relógio do teto (não só o animationend)", (espolio.match(/useTetoDaCerimonia\(/g) || []).length === 2 && /useTetoDaCerimonia\("nivel"/.test(nivel));
  t("a página que nasce oculta abre no último quadro", /paginaOculta\(\)/.test(espolio) && /paginaOculta\(\)/.test(nivel));
  t("o impedido não é disabled: é aria-disabled com o porquê no próprio botão", /aria-disabled=\{impedido \? "true"/.test(nivel) && /Confirmar · falta pôr 1 ponto/.test(nivel) && !/[^-]disabled=\{/.test(nivel.slice(nivel.indexOf("function PeDaSubida"), nivel.indexOf("export function PainelSubidaDeNivel"))));
  t("a paga da quest pergunta à fila se já passou, e pousa ao sair", /cerimoniaJaPassou\(\[\], chave\)/.test(app) && /cerimoniaPousou\(c\.chave\)/.test(app) && (app.match(/cerimoniaJaPassou\(f, chave\)/g) || []).length === 2);
}

sec("5. o pé fixo (PE_DA_SUBIDA)");
{
  t("88 px, botão de 320 × 56", PE_DA_SUBIDA.alto === 88 && PE_DA_SUBIDA.botao.largura === 320 && PE_DA_SUBIDA.botao.alto === 56);
  t("o botão passa o alvo mínimo (ALVOS.piso)", PE_DA_SUBIDA.botao.alto >= ALVOS.piso);
  t("a 768 de altura a folha tem 680 px e o pé fica todo à vista", 768 - PE_DA_SUBIDA.alto === 680);
  t("a 375 × 812 o pé ocupa 88 de 812 e é só botões (abaixo de telefone)", 375 < PE_DA_SUBIDA.telefone && 812 - PE_DA_SUBIDA.alto > 0);
  const nivel = ler("src/painel-subida-de-nivel.jsx");
  t("a folha rola por dentro e termina onde o pé começa", /style=\{\{ bottom: PE\.alto \}\}/.test(nivel) && /bottom: 0, height: PE\.alto/.test(nivel));
  t("o que mudou é dito de–para, por extenso", /" de " \+ sinal\(l\.antes\) \+ " para " \+ sinal\(l\.depois\)/.test(nivel));
}

sec("6. o som das cerimônias (SOM_DA_MESA.cerimonia, F6)");
{
  const K = SOM_DA_MESA.cerimonia;
  t("o lacre: o seno que cai de 96 a 48 em 120 ms", K.lacre[0].freq === 96 && K.lacre[0].ate === 48 && K.lacre[0].dura === 0.12);
  t("o nível: o lacre e três notas que sobem (392, 523, 784)", K.nivel.slice(2).map((v) => v.freq).join() === "392,523,784" && K.nivel[2].em < K.nivel[3].em && K.nivel[3].em < K.nivel[4].em);
  t("a moeda: 3,1 e 4,7 kHz, até quatro seguidas a 70 ms", K.moeda.map((v) => v.freq).join() === "3100,4700" && K.moedasSeguidas === 4 && K.entreMoedas === 0.07);
  t("sem som no Node (sem gesto, sem contexto): cala, nunca lança", tocarDaCerimonia("lacre") === false && tocarDaCerimonia("moeda", 9) === false);
  t("nome desconhecido cala", tocarDaCerimonia("modal") === false);
}

console.log(`\n${ok} ok · ${mal} falhas`);
if (mal) process.exit(1);
