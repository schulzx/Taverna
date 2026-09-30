/* teste-v6-compositor.mjs — o compositor e o dado, com V6a dentro (28/09/2026)

   A lei de V6a (o coordenador; o `jogo`, `mente/v6-jogo.md` §A): *o que se escreve
   nunca se perde; o que espera é o envio.* E o dado da pessoa (`126:117`) com o
   d20 de V3, um só na tela, cinco estados. O que esta suíte guarda:
   1. AS CONTAS, em Node: o estado e o nome do dado, a linha do teste, o rascunho
      (só volta à campanha que o escreveu).
   2. AS MEDIDAS em tabela, e o movimento com saída no reduced-motion.
   3. A PEÇA: o dado com cinco estados, a linha do veredito.
   4. A FIAÇÃO: o campo nunca fecha; o Enter e o toque esperam; nenhuma fila; o
      Rolar d20 e o Agir → aposentados; o rascunho guarda-se e apaga-se só quando
      o turno parte; a sala e a tela de combate intocadas. */
import { readFileSync } from "node:fs";
import { T, ALVOS, TIPOS, DADO, COMPOSITOR, MUDOU_AGORA, CAMPO_DO_TURNO } from "../src/estilo.js";
import { ESTADOS_DO_DADO, estadoDoDado, envioEspera, nomeDoDado, linhaDoTeste, chaveDoRascunho, rascunhoPara, rascunhoDe } from "../src/glifos.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
/* lê sem o CR: a suíte vale igual numa árvore em LF ou em CRLF */
const ler = (x) => readFileSync(x, "utf8").split(String.fromCharCode(13)).join("");
const UI = ler("../src/ui.jsx");
const APP = ler("../src/App.jsx");
const EST = ler("../src/estilo.js");
const trecho = (txt, ini, fim) => { const i = txt.indexOf(ini); return i < 0 ? "" : txt.slice(i, txt.indexOf(fim, i + ini.length)); };
const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

/* ============================================================ */
sec("1. as contas — em Node");
{
  t("cinco estados, na ordem da tabela do jogo", ESTADOS_DO_DADO.join() === "repouso,pronto,lancado,espera,rolar");
  t("campo vazio é Repouso; com texto é Pronto (espaços não contam)", estadoDoDado({ texto: "" }) === "repouso" && estadoDoDado({ texto: "   " }) === "repouso" && estadoDoDado({ texto: "vou" }) === "pronto");
  t("o Mestre respondendo é À espera — com ou sem texto", estadoDoDado({ texto: "vou", carregando: true }) === "espera" && estadoDoDado({ carregando: true }) === "espera");
  t("o teste pendente é Rolar, e a resposta do Mestre ganha dele", estadoDoDado({ rolagem: true }) === "rolar" && estadoDoDado({ rolagem: true, carregando: true }) === "espera");
  t("o quarto de volta ganha de tudo, e dura só o envio", estadoDoDado({ texto: "vou", lancado: true, carregando: true }) === "lancado");
  t("a espera do outro (a sala) existe na conta", estadoDoDado({ texto: "vou", aEsperaDoOutro: true }) === "espera");
  t("nulo não lança", estadoDoDado() === "repouso" && estadoDoDado(null || {}) === "repouso");
  t("o envio espera na espera, no teste e no quarto de volta — e só aí", envioEspera("espera") && envioEspera("rolar") && envioEspera("lancado") && !envioEspera("pronto") && !envioEspera("repouso"));
  t("o nome diz o que o toque faz", nomeDoDado("pronto") === "Agir" && nomeDoDado("repouso") === "Escrever a jogada" && nomeDoDado("espera") === "À espera do Mestre");
  t("e no Rolar diz o teste e a dificuldade", nomeDoDado("rolar", { teste: "Teste de Força", dificuldade: 12 }) === "Rolar o dado — Teste de Força — dificuldade 12");
  t("a linha do teste é a do cartão que saiu", linhaDoTeste({ atributo: "Força", dificuldade: 12, motivo: "a porta emperrada" }) === "Teste de Força · dif. 12 — a porta emperrada");
  t("e o rótulo ganha do atributo; sem nada, sorte", linhaDoTeste({ rotulo: "Percepção" }) === "Teste de Percepção" && linhaDoTeste({}) === "Teste de sorte" && linhaDoTeste(null) === "");
  t("a chave do rascunho é por modo, e fora do save", chaveDoRascunho("historia") === "taverna_rascunho_historia" && chaveDoRascunho("rapida") === "taverna_rascunho_rapida" && chaveDoRascunho() === "taverna_rascunho_historia" && !/taverna_save/.test(chaveDoRascunho("historia")));
  const bruto = rascunhoPara("empurro a porta", "Torre|fantasia");
  t("o rascunho volta à campanha que o escreveu", rascunhoDe(bruto, "Torre|fantasia") === "empurro a porta");
  t("e NÃO a outra (injetar outro save não o ressuscita)", rascunhoDe(bruto, "Outra|fantasia") === "");
  t("vazio não se guarda; lixo não volta", rascunhoPara("   ", "x") === null && rascunhoDe("{", "x") === "" && rascunhoDe(null, "x") === "");
}

/* ============================================================ */
sec("2. as medidas e o movimento");
{
  t("o dado mede o piso (48), o glifo 24 — o nó 126:117", ALVOS.piso === 48 && DADO.glifo === 24);
  t("o repouso passa os 3:1 de um gráfico: o glifo a 0,55", DADO.alfaApagado === 0.55);
  t("o quarto de volta dura no máximo 300 ms", DADO.lancado <= 300);
  t("o rascunho guarda-se a cada pausa de ~400 ms", DADO.pausaDoRascunho === 400);
  t("a pílula é a do nó: raio 24", COMPOSITOR.raio === 24);
  t("os três movimentos saem da tabela", /\.tv-dado-lancado \{ animation: tvDadoLancado \$\{DADO\.lancado\}ms ease-out 1 both; \}/.test(EST)
    && /\.tv-dado-pulso \{ animation: tvDadoPulso \$\{DADO\.pulso\}ms ease-out 1; \}/.test(EST)
    && /\.tv-dado-rolar \{ animation: tvDadoRolar \$\{MUDOU_AGORA\.pulso\}ms ease-in-out \$\{MUDOU_AGORA\.vezes\}; \}/.test(EST));
  t("nenhum é infinito, e os três têm saída no reduced-motion", !/tvDado\w+[^;]*infinite/.test(EST) && /@media \(prefers-reduced-motion: reduce\) \{\s*\.tv-dado-lancado, \.tv-dado-pulso, \.tv-dado-rolar \{ animation: none; \}/.test(EST));
  t("o Rolar pulsa as vezes de MUDOU_AGORA, e para", MUDOU_AGORA.vezes === 3);
}

/* ============================================================ */
sec("3. as peças");
{
  const DADO_TXT = trecho(UI, "export function Dado(", "\n}\n");
  const LINHA = trecho(UI, "export function LinhaDoVeredito(", "\n}\n");
  t("o dado é um botão de 48, redondo, com o d20 de V3", /width: ALVOS\.piso, height: ALVOS\.piso/.test(DADO_TXT) && /<Glifo nome="dado" tamanho=\{DADO\.glifo\}/.test(DADO_TXT) && !/dice-6|d6/.test(semComentario(DADO_TXT)));
  t("Pronto é o btn-send-d20: âmbar cheio, a sombra âmbar e o reflexo por dentro", /background: cheio \? T\.amber : "transparent"/.test(DADO_TXT)
    && /0 0 \$\{DADO\.brilho\}px \$\{alfa\(T\.amber, DADO\.alfaDoBrilho\)\}, inset 0 1px 1px \$\{alfa\(T\.ink, DADO\.alfaDoReflexo\)\}/.test(DADO_TXT));
  t("Repouso e À espera são contorno (âmbar · lineStrong)", /border: cheio \? "none" : `\$\{DADO\.borda\}px solid \$\{espera \? T\.lineStrong : T\.amber\}`/.test(DADO_TXT));
  t("À espera não é disabled: é aria-disabled, com nome e foco", /aria-disabled=\{espera \|\| undefined\}/.test(DADO_TXT) && !/\sdisabled=/.test(DADO_TXT));
  t("Rolar tem a dificuldade na face, na letra do piso", /e === "rolar" && dificuldade != null/.test(DADO_TXT) && /fontSize: TIPOS\.maquina, fontWeight: 700, color: T\.onAccent/.test(DADO_TXT) && TIPOS.maquina >= TIPOS.piso);
  t("o dado segura o foco do campo ao ser tocado", /onPointerDown=\{\(ev\) => \{ try \{ ev\.preventDefault\(\); \}/.test(DADO_TXT));
  t("na mesa, no Pronto, a palavra Agir ao lado (o telefone não a leva)", /\(e === "pronto" \|\| e === "lancado"\) && \(\s*<span aria-hidden="true" className="hidden md:inline/.test(DADO_TXT));
  t("a linha do veredito: 0 px sem veredito, e fala a quem usa leitor de tela", /if \(!texto\) return null;/.test(LINHA) && /aria-live="polite"/.test(LINHA) && /fontSize: TIPOS\.maquina/.test(LINHA));
}

/* ============================================================ */
sec("4. a fiação");
{
  const COMP = trecho(APP, "V6 · O COMPOSITOR — a pílula e o dado", "V6 · O CARTÃO DO TESTE SAIU DAQUI");
  const ORG = trecho(APP, "V6a · O QUE SE ESCREVE NUNCA SE PERDE", "const linhaDoCampo");
  t("V6a · o campo NUNCA fecha: nenhum disabled no textarea", /<textarea ref=\{campoRef\} value=\{entrada\}/.test(COMP) && !/<textarea[^>]*disabled=/.test(COMP));
  t("o Enter manda pelo dado, e o dado espera", /onKeyDown=\{\(e\) => \{ if \(gestoDoCampo\(e\) !== "mandar"\) return; e\.preventDefault\(\); lancarODado\(\); \}\}/.test(COMP)
    && /if \(envioEspera\(estadoDado\)\) \{ try \{ setPulsoDoDado\(\(n\) => n \+ 1\); \}/.test(ORG));
  /* nenhuma fila: o envio só nasce de dois gestos do jogador — o Enter e o toque no
     dado. Nenhum efeito o chama, e nada manda o texto guardado no ref. */
  const envios = semComentario(APP).match(/lancarODado\(\)/g) || [];
  t("nenhuma fila: nada envia sozinho quando a resposta chega", envios.length === 2 && /e\.preventDefault\(\); lancarODado\(\); \}\}/.test(COMP) && /if \(estadoDado === "pronto"\) lancarODado\(\);/.test(ORG) && !/partirOTurno\(entradaRef/.test(APP));
  t("o toque: Repouso foca, Rolar abre o véu, Pronto manda, À espera nada", /if \(estadoDado === "repouso"\) \{ if \(campoRef\.current\) campoRef\.current\.focus\(\); return; \}/.test(ORG)
    && /if \(estadoDado === "rolar"\) \{ if \(!dadoRolando\) setDadoRolando\(true\); return; \}/.test(ORG) && /if \(estadoDado === "pronto"\) lancarODado\(\);/.test(ORG));
  t("um dado só na tela principal: o Rolar d20 e o Agir → aposentados", !/Agir →<\/Botao>/.test(APP) && (APP.match(/>Rolar d20\{/g) || []).length === 1 && /const dadoDaBatalha = emBatalha/.test(APP));
  t("o teste pendente é a linha do veredito por cima do campo", /<LinhaDoVeredito texto=\{linhaDoCampo\} armado=\{!!\(rolagem && !carregando\)\} \/>/.test(COMP) && /<>\{linhaDoTeste\(rolagem\)\}\{modPend !== 0/.test(APP));
  t("a gaveta ✦ mora na pílula, e no telefone só com o campo aberto", /<div className="tv-turno-verbos tv-gaveta-no-canto flex shrink-0 items-end md:self-center"/.test(COMP) && /\.tv-turno-repouso \.tv-turno-verbos \{ display: none; \}/.test(EST) && COMP.indexOf("tv-turno-verbos") < COMP.indexOf("<textarea"));
  t("a borda da pílula continua semântica (violeta armada, âmbar milagre)", /solid \$\{milagreSel \? T\.amber : habsSel\.length \? T\.violet : T\.line\}/.test(COMP) && /borderRadius: COMPOSITOR\.raio/.test(COMP));
  t("Shift+Enter continua quebrando a linha (gestoDoCampo intocado)", /if \(e\.shiftKey \|\| e\.ctrlKey \|\| e\.altKey \|\| e\.metaKey\) return "quebrar";/.test(APP));
  t("o rascunho guarda-se na pausa e ao esconder, e só dentro do jogo", /setTimeout\(guardarORascunho, DADO\.pausaDoRascunho\)/.test(ORG) && /"visibilitychange"/.test(ORG) && /"pagehide"/.test(ORG) && /if \(!rascunhoDeQuemRef\.current\) return;/.test(ORG));
  t("volta ao entrar no jogo — e só o desta campanha", /setEntrada\(rascunhoDe\(localStorage\.getItem\(chaveDoRascunho\(modoRef\.current\)\), quem\)\);/.test(ORG));
  t("ir ao menu guarda, já não apaga", /setHabsSel\(\[\]\); guardarORascunho\(\); setDadoRolando\(false\);/.test(APP) && !/setHabsSel\(\[\]\); setEntrada\(""\)/.test(APP));
  /* MM14 (frontend, 30/09): quatro → cinco. A pergunta que não gasta a vez
     dentro da luta ("a quantos metros estão?") também parte para o
     Narrador — limpa a caixa e o rascunho como qualquer turno que parte,
     só que sem mexer no tabuleiro. É o mesmo idioma, um quinto lugar. */
  t("apaga-se quando o turno parte (os cinco que mandam) e quando se apaga o campo", (APP.match(/setEntrada\(""\); apagarORascunho\(\);/g) || []).length === 5 && /if \(!e\.target\.value\.trim\(\)\) apagarORascunho\(\);/.test(COMP));
  t("o campo abre-se com foco ou texto, também na espera", /const campoAberto = campoFocado \|\| !!entrada\.trim\(\);/.test(APP));
  t("a sala a dois: a faixa e a promessa de reescrever ficam", /O turno sai quando os dois escreverem\. Dá para reescrever a sua até lá\./.test(APP));
  t("e nada disto custa o turno", /calou\("guardar o rascunho", e\)/.test(ORG) && /calou\("o toque no dado", e\)/.test(ORG) && /calou\("devolver o rascunho", e\)/.test(ORG));
}

/* ============================================================ */
sec("5. os consertos da prova jogada (v6-jogo.md §7)");
{
  const COMP = trecho(APP, "V6 · O COMPOSITOR — a pílula e o dado", "V6 · O CARTÃO DO TESTE SAIU DAQUI");
  const ESTREITA = trecho(EST, "@media ${CAMPO_DO_TURNO.colunaEstreita} {", "A ORDEM É A REGRA, outra vez");
  t("1 · no telefone a gaveta mora no canto da pílula, sem coluna, e o texto começa a 16 px",
    /tv-pilula-do-campo relative flex-1/.test(COMP) && /tv-turno-verbos tv-gaveta-no-canto/.test(COMP)
    && /\.tv-gaveta-no-canto \{\s*position: absolute; left: 0; bottom: 0;/.test(ESTREITA)
    && /\.tv-campo-do-turno\.tv-campo-aberto \{ padding-bottom: \$\{ALVOS\.piso\}px; \}/.test(ESTREITA)
    && /px-4 py-2 min-w-0/.test(COMP));
  t("e só no telefone: na mesa a gaveta volta ao seu lugar (a regra vive na coluna estreita)", !/\.tv-gaveta-no-canto/.test(EST.replace(ESTREITA, "")));
  t("2 · o anel do foco da pílula é 2 px de lineStrong (não 3 de ink)", COMPOSITOR.anelDoFoco === 2
    && /\.tv-pilula-do-campo:focus-within \{\s*outline: \$\{COMPOSITOR\.anelDoFoco\}px solid \$\{T\.lineStrong\};/.test(EST));
  t("3 · o d20 rolando tem saída no reduced-motion, e ela não é só none", /\.tv-dice \{ animation: none; filter: brightness\(\$\{DADO\.rolandoParado\}\); \}/.test(EST.slice(EST.indexOf("@media (prefers-reduced-motion: reduce)", EST.indexOf(".tv-dice {")))) && DADO.rolandoParado > 0 && DADO.rolandoParado < 1);
}

console.log(`\nV6 · o compositor e o dado: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
