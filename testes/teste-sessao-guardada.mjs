/* ============================================================
   A SESSÃO GUARDADA (T1-A, 7.ª fatia, 28/10/2026) — testes/teste-sessao-guardada.mjs

   `src/sessao-guardada.js` diz onde o arquivo da sessão mora e com que
   teto; o App grava-o turno a turno. Aqui: a tabela lida de volta, as
   quatro regras da casa (chave nova, o espaço do modo historia, o teto, e
   nunca lançar), a forma do turno que a fiação junta, a página que vira,
   e o arquivo que o jogo gravou de verdade — três turnos no 5199 com o
   Narrador falso (`sessao-navegador.json`) — lido pelo replay: válido, e
   tudo o que é do motor reproduz; o que diverge é só do App, e diz-se.
   ============================================================ */
import fs from "node:fs";
import { SESSAO_GUARDADA, chaveDaSessao, gravaNesteModo, estadoParaASessao, turnoParaASessao, guardarASessao, cederAoSave } from "../src/sessao-guardada.js";
import { abrirASessao, gravarOTurno, validarASessao, reproduzirASessao, estadoNoTurno } from "../src/sessao.js";
import { espacoDoSave, MODOS } from "../src/modos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

sec("1 · a tabela, lida de volta");
t("é congelada, e tem chave, teto, modos, o que fica de fora e a origem", Object.isFrozen(SESSAO_GUARDADA) && typeof SESSAO_GUARDADA.sufixo === "string" && SESSAO_GUARDADA.sufixo.length > 0
  && Number.isInteger(SESSAO_GUARDADA.teto) && Array.isArray(SESSAO_GUARDADA.modos) && Array.isArray(SESSAO_GUARDADA.foraDoArquivo) && typeof SESSAO_GUARDADA.origem === "string");
t("o teto fica abaixo de um quinto do que um navegador dá a uma origem (5 MB)", SESSAO_GUARDADA.teto > 100000 && SESSAO_GUARDADA.teto <= 1000000);

sec("2 · as regras da casa");
const espacoHistoria = espacoDoSave("historia");
t("a chave é nova, ao lado do save do modo historia", chaveDaSessao(espacoHistoria) === `${espacoHistoria}${SESSAO_GUARDADA.sufixo}` && chaveDaSessao(espacoHistoria) !== espacoHistoria);
t("e nenhuma chave de save de modo algum é a da sessão", (Array.isArray(MODOS) ? MODOS : Object.values(MODOS)).every((m) => m && chaveDaSessao(espacoHistoria) !== m.espaco && chaveDaSessao(espacoHistoria) !== m.espacoAnterior));
t("só Uma Vida grava (o beta é ela)", gravaNesteModo("historia") && !gravaNesteModo("rapida") && !gravaNesteModo("duelo") && !gravaNesteModo(undefined));
{
  const r = { personagem: { nome: "Vera" }, mensagens: [{ autor: "mestre", texto: "x" }], historico: [1], dia: 3 };
  const e = estadoParaASessao(r);
  t("o estado da sessão não leva o relato, e não toca no retrato", !("mensagens" in e) && !("historico" in e) && e.dia === 3 && e.personagem === r.personagem && r.mensagens.length === 1);
}
t("nada aqui lança com lixo", (() => {
  try { estadoParaASessao(null); turnoParaASessao(null); guardarASessao(null); guardarASessao({ turnos: "torto" }); chaveDaSessao(null); gravaNesteModo(null, null); return true; } catch { return false; }
})());

sec("3 · o turno que a fiação junta");
{
  const comFrase = turnoParaASessao({ frase: "Vou ao poço.", lugaresDaqui: [{ nome: "o poço", onde: "dentro" }], ponto: "1|480|3", contagem: { salvaguarda: 0 }, casa: "s|1|480|3", pauta: "P", envelopes: "E", nomesAMao: [{ nome: "Ilka", genero: "ela" }], moeda: "escamas", narrador: { narrativa: "N", mudancas: {} }, cronista: { proposta: {}, juizo: null }, juiz: { resumo: { turno: 1 } } });
  t("a frase do jogador vai como frase, com os sítios dali", comFrase.entrada.frase === "Vou ao poço." && comFrase.entrada.lugaresDaqui.length === 1 && !comFrase.entrada.toque);
  t("a sorte, o pedido, a resposta, o Cronista e o Juiz", comFrase.sorte.ponto === "1|480|3" && comFrase.sorte.casa === "s|1|480|3" && comFrase.sorte.contagem.salvaguarda === 0
    && comFrase.pedido.pauta === "P" && comFrase.pedido.envelopes === "E" && comFrase.pedido.nomesAMao[0].nome === "Ilka" && comFrase.pedido.moeda === "escamas"
    && comFrase.narrador.narrativa === "N" && comFrase.cronista.proposta && comFrase.juiz.resumo.turno === 1);
  const toque = turnoParaASessao({ frase: "", conteudo: "[ABERTURA DA CAMPANHA] " + "x".repeat(900), ponto: "1|0|0" });
  t("sem frase do jogador, o envelope que subiu vai como toque (aparado)", toque.entrada.toque && toque.entrada.toque.conteudo.startsWith("[ABERTURA") && toque.entrada.toque.conteudo.length === 400 && toque.cronista === null && toque.juiz === null);
}

sec("4 · a página vira");
{
  let A = abrirASessao({ semente: "s|Fantasia medieval", estado: { personagem: { nome: "Vera", vida: 10 }, dia: 1 }, origem: "prova" });
  for (let i = 1; i <= 3; i++) A = gravarOTurno(A, { ...turnoParaASessao({ frase: `turno ${i}`, ponto: `1|${i}|${i}`, pauta: "p".repeat(2000), narrador: { narrativa: "n", mudancas: {} } }), estado: { personagem: { nome: "Vera", vida: 10 - i }, dia: 1 } });
  const cabe = guardarASessao(A, { ...SESSAO_GUARDADA, teto: 1e6 });
  t("abaixo do teto, guarda-se como está", cabe.texto === JSON.stringify(A) && !cabe.virou && cabe.arquivo === A);
  const virou = guardarASessao(A, { ...SESSAO_GUARDADA, teto: 3000 });
  t("acima do teto, a página vira: arquivo novo, sem turnos, que começa no fim do último", virou.virou && virou.texto && virou.arquivo.turnos.length === 0
    && JSON.stringify(virou.arquivo.inicio) === JSON.stringify(estadoNoTurno(A, 3)) && virou.arquivo.semente === A.semente && virou.texto.length <= 3000);
  t("e o arquivo novo é válido", validarASessao(virou.arquivo).ok);
  const nem = guardarASessao(A, { ...SESSAO_GUARDADA, teto: 50 });
  t("se nem a cabeça cabe, não se guarda nada (a fiação apaga a chave)", nem.texto === null && nem.virou);
}

sec("5 · o arquivo que o jogo gravou (5199, Narrador falso, 28/10)");
{
  /* três turnos de verdade: a abertura (um toque), "caminho pelas ruas" e
     "vou até o poço"; gravados pela fiação do App, tirados do localStorage */
  const A = JSON.parse(fs.readFileSync(new URL("./sessao-navegador.json", import.meta.url), "utf8"));
  const v = validarASessao(A);
  t("é válido, com três turnos", v.ok && A.turnos.length === 3, JSON.stringify(v.erros.slice(0, 3)));
  t("a cabeça leva a semente, o mundo e o estado sem o relato", A.semente === "Prova da Sessao|Fantasia medieval" && A.mundo && A.mundo.genero === "Fantasia medieval" && (A.inicio.mensagens || []).length === 0 && (A.inicio.historico || []).length === 0); /* o save v2 põe todo campo, e o relato vem vazio */
  t("a abertura entrou como toque, e as duas frases como frase", A.turnos[0].entrada.toque && A.turnos[1].entrada.frase === "Caminho pelas ruas da vila, devagar, olhando as casas." && A.turnos[2].entrada.frase === "Vou até o poço e bebo um pouco de água.");
  t("cada turno leva a sorte, a pauta, a resposta crua, o Cronista e o Juiz", A.turnos.every((L) => /^\d+\|\d+\|\d+$/.test(L.sorte.ponto) && L.sorte.casa && L.pedido.pauta.length > 500 && L.narrador.narrativa.length > 60 && L.cronista && L.juiz && L.juiz.resumo));
  const pesos = A.turnos.map((L) => JSON.stringify(L).length);
  console.log(`      o arquivo ${JSON.stringify(A).length} caracteres; a cabeça ${JSON.stringify(A).length - pesos.reduce((a, b) => a + b, 0)}; os turnos ${pesos.join(", ")}`);
  t("e cabe no teto com folga para dezenas de turnos", JSON.stringify(A).length < SESSAO_GUARDADA.teto / 5);
  const r = reproduzirASessao(A, {});
  t("o replay lê-o e corre os três turnos sem estourar", r.valido && r.turnos.length === 3 && r.turnos.every((x) => !x.calou.length));
  /* O QUE É DO MOTOR REPRODUZ. Cada divergência deste arquivo é de um
     campo que nenhum passo do replay escreve — a mesa, o compasso, a
     memória da gente, o chão, o relógio: a parte do turno que ainda mora no
     App (DONO_DO_CAMPO). A ficha, a gente, o cânone e o mapa saem iguais. */
  const DO_MOTOR = ["personagem", "npcs", "canone", "mapa", "cidadeAtual", "combate", "missoes", "baseMundo", "npcTurno"];
  const doMotor = r.turnos.flatMap((x) => x.diferencas.filter((d) => DO_MOTOR.includes(d.caminho.split(/[.[]/)[0])));
  t("nenhuma divergência num campo que o motor escreve", doMotor.length === 0, JSON.stringify(doMotor.slice(0, 3)));
  t("e toda divergência diz de quem é", r.turnos.every((x) => x.igual || x.porque.length > 0));
  console.log(`      ${r.reproduzidos} de ${r.turnos.length} turnos reproduzem; o que diverge: ${[...new Set(r.turnos.flatMap((x) => x.diferencas.map((d) => d.caminho.split(/[.[]/)[0])))].join(", ")}`);
}

sec("6 · a fiação no App");
{
  const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const C = APP.replace(/\/\*[\s\S]*?\*\//g, "");
  t("o App importa o gravador e onde guardar", /import \{ abrirASessao, gravarOTurno \} from "\.\/sessao\.js";/.test(C) && /from "\.\/sessao-guardada\.js";/.test(C));
  t("a linha grava-se depois do Cronista, numa fila, em calou", /\.then\(\(\) => Promise\.resolve\(doCronista\)\.catch\(\(\) => null\)\)\s*\.then\(\(\) => \{ try \{ gravarOTurnoDaSessao\(juntado\); \} catch \(e\) \{ calou\("a sessão \(o turno\)", e\); \} \}\);/.test(C));
  t("a escrita que falha apaga a chave da sessão, e só ela", /catch \(e\) \{ try \{ localStorage\.removeItem\(chave\); \} catch \{ *\} calou\("guardar a sessão", e\); \}/.test(C) && /const chave = chaveDaSessao\(chaveDoSave\(\)\);/.test(C));
}

sec("a sessão cede ao save (28/10): o arquivo do replay é bastidor, o save é do jogador");
{
  /* um armazém que enche como um navegador: conta caracteres e lança ao passar da cota */
  const armazem = (cota) => {
    const m = new Map();
    const usado = () => [...m].reduce((a, [k, v]) => a + k.length + v.length, 0);
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => { const antes = m.get(k); m.set(k, String(v)); if (usado() > cota) { if (antes == null) m.delete(k); else m.set(k, antes); throw new Error("QuotaExceededError"); } },
      removeItem: (k) => { m.delete(k); },
    };
  };
  const esp = espacoHistoria;
  const A = armazem(1000);
  A.setItem(chaveDaSessao(esp), "s".repeat(700));
  let falhou = false; try { A.setItem(esp, "v".repeat(400)); } catch { falhou = true; }
  t("com a sessão cheia, o save não cabe (é o caso que se conserta)", falhou && A.getItem(esp) == null);
  t("cederAoSave larga a sessão e diz que largou", cederAoSave(A, esp) === true && A.getItem(chaveDaSessao(esp)) == null);
  let gravou = true; try { A.setItem(esp, "v".repeat(400)); } catch { gravou = false; }
  t("e o save, depois, cabe inteiro", gravou && A.getItem(esp).length === 400);
  t("sem sessão a largar, devolve false e não toca no save", cederAoSave(A, esp) === false && A.getItem(esp).length === 400);
  t("nunca apaga a chave do próprio save, nem com sufixo vazio", cederAoSave(A, esp, { ...SESSAO_GUARDADA, sufixo: "" }) === false && A.getItem(esp).length === 400);
  t("não lança com armazém nulo, torto, ou que estoura", cederAoSave(null, esp) === false && cederAoSave({}, esp) === false
    && cederAoSave({ getItem: () => { throw new Error("x"); }, removeItem: () => {} }, esp) === false);
  /* a fiação: o App cede a sessão antes de podar o histórico (lido no texto
     porque `salvar` mora no componente; sai quando o save for do motor) */
  const C = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const iCede = C.indexOf("cederAoSave(localStorage, chaveDoSave())"), iPoda = C.indexOf("for (const n of [120, 60, 30])");
  t("o App cede a sessão antes de podar o histórico, em calou", iCede > 0 && iPoda > iCede && /if \(!gravou\) \{ try \{ if \(cederAoSave\(localStorage, chaveDoSave\(\)\)\) gravou = gravar\(historicoEnxuto\(250\)\); \} catch \(e\) \{ calou\(/.test(C));
}

console.log(`\na sessão guardada: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
