/* ============================================================
   O FECHO (Fase MM, a campanha que prende · item 2) — a última frase
   deixa de ser sempre um presságio

   A queixa da pessoa depois da 4.ª sessão: "achei a história de morna
   para frio". O registo dá a cadência que a explica: as respostas fecham
   quase todas numa linha de ambiente a pressagiar — "o som atravessa a
   feira como um aviso", "o cheiro de cera … tem gosto de recado", "o ar
   abafado aperta a rua como mão no pescoço", "o cheiro de chuva entra
   pela porta como um aviso". Pressagia sempre, cobra nunca, e uma sessão
   inteira de aviso lê-se como frio (mente/mm11-sessao-4.md, "Onde e por
   que a história esfria", ponto 4).

   ---------------- O QUE EMPURRAVA PARA LÁ ----------------

   Duas linhas do ofício da cena, no prompt fixo (`prompt.js`), lidas
   juntas: "Termine na imagem, não no resumo do que ela significa" e
   "Termine SEMPRE com uma situação aberta — a cena descrita, o silêncio
   depois dela". Imagem + cena descrita + silêncio = a linha de ambiente.
   E nada variava de turno para turno: a mesma ordem, quarenta e duas
   vezes, dá a mesma última frase. As duas linhas foram reescritas (sem
   crescer o prompt) e o COMO fechar passa a ser escolhido aqui, por
   momento, e dito na pauta (`O FECHO`, pauta.js).

   ---------------- A TÉCNICA ----------------

   Numa mesa, a última frase do Mestre é a que devolve a palavra, e o
   Matt devolve-a de cinco maneiras: alguém em cena pergunta-te uma coisa;
   a cena põe-te nas mãos duas coisas que não cabem juntas; corta seco
   num facto; mostra a consequência do que fizeste; ou alguém fica calado
   à espera de ti. Nunca a mesma duas vezes seguidas, e nunca o cheiro.

   ---------------- SEPARADO DA TELA ----------------

   Conta se prova. O módulo lê o momento (a frase do jogador, a luta, se
   há gente em cena, se o ato fecha) e o fecho anterior, e devolve a
   linha da pauta. Quem guarda o anterior e monta a pauta é o App.
   ============================================================ */
import { sorteDaCasa } from "./semente.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});

/* ---------------- OS CINCO FECHOS ----------------
   `gente`: só existe com alguém em cena para o fazer (o companheiro
   conta). `diz` é O QUE a última frase é — nunca o como (pauta.js). */
/* 12/10, a 8.ª sessão de prova — AS MULETAS DOBRARAM, e a pauta pedia-as.
   Medido no registo das 71 respostas (testes/registo-s8-pauta.json): com
   o fecho `silencio` — que dizia, à letra, "alguém fica calado à espera da
   minha resposta" — 14 de 17 respostas trouxeram a muleta (calado/à espera/
   braços cruzados/sem tirar os olhos); com `pergunta`, 10 de 15 (a pergunta
   e depois "Ela cruza os braços e espera sua resposta."); com os três
   fechos sem gente, 14 de 38. "Fica calado à espera" é o primeiro dos
   TIQUES_PROIBIDOS do núcleo (nucleo.js) — que não chegavam ao Narrador por
   canal nenhum: a lista só era lida por uma suíte. O fecho mandava fazer o
   que o núcleo proíbe. (A outra suspeita, a regra nova "quem fala não sabe,
   desconversa": só 6 das 71 respostas têm alguém a esquivar-se, 3 com a
   muleta — não é ela.)
   O conserto é no canal dinâmico, e a linha fica perto do tamanho que
   tinha (121 e 131 caracteres; agora 149 e 145, dentro de um teto de 1400
   que não sobe): o `silencio` deixa de ser "fica calado à espera" e passa a ser a
   FALA QUE NÃO ACABA (a mesma devolução da palavra, sem o corpo parado a
   esperar); a `pergunta` acaba NA pergunta; e os dois fechos de gente
   levam o veto do gesto (`VETO_DO_GESTO`) com o do ar em versão curta — 4
   das 17 respostas do `silencio` ainda acabaram em presságio com o veto
   inteiro, e ele não sai. O id `silencio` fica: é o que o App guarda. */
export const FECHOS = [
  { id: "pergunta", gente: true, diz: "alguém em cena faz-me uma pergunta direta, e acaba nela" },
  { id: "escolha", gente: false, diz: "a ficção põe-me nas mãos duas coisas que não cabem juntas, e as duas custam (sem lista de opções)" },
  { id: "corte", gente: false, diz: "um corte seco: um facto ou uma ação, numa frase curta" },
  { id: "consequencia", gente: false, diz: "a consequência do que eu fiz, visível agora" },
  { id: "silencio", gente: true, diz: "alguém em cena deixa uma fala a meio, e acaba nela" },
];
const fechoPorId = (id) => FECHOS.find((f) => f.id === id) || null;

/* ---------------- O FECHO POR MOMENTO ----------------
   O peso de cada fecho em cada momento. Os pesos saem do que o registo da
   4.ª sessão pedia em cada um:
   · `pergunta` (perguntei): a resposta é o turno; quem respondeu fica à
     espera (silêncio) ou devolve outra pergunta — 16 dos 22 turnos fora
     da luta foram assim, e era aí que o ambiente tomava a última frase;
   · `ato` (fiz alguma coisa): primeiro a consequência — "Acaba o que ias
     dizer" pedia a frase de Caetano, não o cheiro de cera;
   · `sistema` (viagem, chegada, acampamento): a estrada põe uma escolha
     (o desvio, o viajante, a porta), ou alguém do grupo pergunta;
   · `luta`: o corte e a consequência — o tabuleiro é que devolve a vez;
   · `fimDeAto`: a cena forte que vira o ato acaba numa escolha com preço
     (a mesma regra do fecho das batidas da espinha). */
export const FECHO_POR_MOMENTO = {
  pergunta: { silencio: 3, pergunta: 2, consequencia: 1, corte: 1 },
  ato: { consequencia: 3, pergunta: 2, corte: 2, escolha: 1, silencio: 1 },
  sistema: { escolha: 3, pergunta: 2, corte: 2 },
  luta: { corte: 3, consequencia: 2 },
  fimDeAto: { escolha: 1 },
};

/* o veto que acompanha todo fecho: o ambiente a pressagiar não fecha */
export const VETO_DO_FECHO = "nunca o cheiro, o som ou o ar a pressagiar";
/* e o dos fechos de gente: o corpo parado a esperar não fecha (os
   TIQUES_PROIBIDOS do núcleo que são gesto, ditos de uma vez).

   OS GESTOS GASTOS, MEDIDOS (12.ª sessão, 19/10). Depois de a v9.426 tirar
   os braços cruzados e o "à espera" do fim das respostas, a muleta mudou de
   espécie: na 11.ª, "cospe/cuspindo" em 34 de 62 respostas (55%), "olhos
   fixos/cravar/encarar" em 19; na 12.ª, "cospe" em 13 de 27 (48%) — todo
   NPC cospe, na taverna e na mina. O cuspe entra no veto. O veto ficou 9
   caracteres maior, e os dois fechos de gente 10 e 11 menores ("e acaba
   nela"): a linha do FECHO não cresce. */
export const GESTOS_GASTOS = [
  { id: "cuspe", diz: "cuspe", medido: "11.ª: 34 de 62 (55%) · 12.ª: 13 de 27 (48%)" },
  { id: "bracos", diz: "braços cruzados", medido: "a 4.ª: o tique do núcleo (TIQUES_PROIBIDOS)" },
  { id: "olhar", diz: "olhar fixo", medido: "11.ª: 19 de 62 (olhos fixos, cravar, encarar)" },
  { id: "espera", diz: "ninguém à espera", medido: "a 4.ª: o tique do núcleo; 11.ª: 4 de 62" },
];
export const VETO_DO_GESTO = `sem ${GESTOS_GASTOS.map((g) => g.diz).join(", ")} nem o ar a pressagiar`;

/* ---------------- O MOMENTO ----------------
   `ctx`: { pedido (escuta.js#lerOPedido), luta, fimDeAto }. Lixo = sistema. */
export function momentoDoFecho(ctx) {
  const c = obj(ctx);
  if (c.fimDeAto) return "fimDeAto";
  if (c.luta) return "luta";
  const p = obj(c.pedido);
  if (!p.doJogador) return "sistema";
  return p.pergunta ? "pergunta" : "ato";
}

/* ---------------- A ESCOLHA ----------------
   `ctx`: { pedido, luta, fimDeAto, gente (há alguém em cena, o
   companheiro conta), ultimo (o fecho do turno anterior — o escolhido,
   ou o que `fechoDaNarrativa` leu na resposta), sorte (gerador semeado) }.
   Nunca o mesmo de antes: se o momento só tem o anterior (o fim de ato
   depois de um fim de ato), cai para a tabela do ato. Devolve
   { id, momento, linha }. */
export function escolherFecho(ctx) {
  const c = obj(ctx);
  const sorte = typeof c.sorte === "function" ? c.sorte : sorteDaCasa;
  const ultimo = String(c.ultimo || "");
  const momento = momentoDoFecho(c);
  const validos = (m) => Object.entries(FECHO_POR_MOMENTO[m] || {})
    .filter(([id]) => id !== ultimo && fechoPorId(id) && (c.gente || !fechoPorId(id).gente));
  let cand = validos(momento);
  if (!cand.length) cand = validos(momento === "luta" ? "luta" : "ato");
  if (!cand.length) cand = [["corte", 1]];
  const total = cand.reduce((a, [, p]) => a + p, 0);
  let r = Math.max(0, Math.min(0.999999, Number(sorte()) || 0)) * total;
  let id = cand[cand.length - 1][0];
  for (const [k, p] of cand) { if (r < p) { id = k; break; } r -= p; }
  const f = fechoPorId(id);
  return { id, momento, linha: `termine em ${f.diz}; ${f.gente ? VETO_DO_GESTO : VETO_DO_FECHO}` };
}

/* ---------------- O QUE A RESPOSTA FEZ ----------------
   Lê a última frase de uma narração e diz que fecho foi: `pergunta` e
   `fala` (acaba dentro de aspas), `pressagio` (o ambiente: cheiro, ar,
   som, chuva, sino, escuro, ou a comparação "como um/como se/como quem"),
   `corte` (curta) ou `acao`. Serve à prova (quantas fechavam em presságio)
   e ao App, para o `ultimo` ser o que de facto se leu. */
const AMBIENTE = /\b(cheir|o ar\b|ar abafado|vento|chuv|trov|relamp|sino\b|badal|silenc|escurid|sombr|nevo|neblin|eco\b|corvo|gargant|respira|crepit|fumeg|fumac|estal|uiv|barulho|ruido|som\b)|\bcomo (um|uma|se|quem)\b/;
/* até quantas palavras a última frase conta como corte seco */
export const LEITURA_DO_FECHO = { palavrasDoCorte: 10 };

export function fechoDaNarrativa(texto) {
  const t = String(texto == null ? "" : texto).trim();
  if (!t) return "";
  if (/["”»]$/.test(t)) {
    const ab = Math.max(t.lastIndexOf(" \""), t.lastIndexOf("\n\""), t.lastIndexOf("“"), t.lastIndexOf("«"), t.startsWith("\"") ? 0 : -1);
    return /\?/.test(t.slice(ab + 1)) ? "pergunta" : "fala";
  }
  const frases = t.split(/(?<=[.!?…])\s+/).filter(Boolean);
  const u = frases[frases.length - 1] || "";
  if (/\?$/.test(u)) return "pergunta";
  if (AMBIENTE.test(norm(u))) return "pressagio";
  return u.split(/\s+/).length <= LEITURA_DO_FECHO.palavrasDoCorte ? "corte" : "acao";
}
