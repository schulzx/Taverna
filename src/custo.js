/* ============================================================
   O CUSTO DO TURNO (v9.146) — a conta que ninguém tinha — Taverna

   "Custo de token é produto." A frase é da arquitetura do projeto, e
   até aqui ela não tinha número atrás: o prompt tinha 51 mil caracteres
   na v8.9, tem 54 mil hoje, e em nenhum momento entre uma coisa e outra
   alguém soube quanto isso custava de verdade numa partida.

   Caractere não é token, e token de entrada não custa o mesmo que token
   de saída. Uma cena comum manda 54 mil caracteres de prompt e recebe
   talvez 700 de narrativa — mas a saída custa o DOBRO por token, e o
   histórico de trinta turnos entra na entrada de novo a cada jogada.
   Nenhuma dessas três coisas se adivinha olhando o prompt.

   Este módulo não mede nada sozinho: quem conta os tokens é o provedor,
   que os devolve em toda resposta e que o jogo vinha jogando fora. Aqui
   ficam só a TABELA e a CONTA — que é exatamente o que a casa exige de
   um número: se sai de uma tabela, sai da tabela.

   ---------------- POR QUE NÃO TEM ABA ----------------

   O documento de arquitetura pede "uma aba de depuração com o contador
   acumulado". A casa decidiu depois disso que o sistema não fala de si
   mesmo na tela — só aparece ao jogador o que é gameplay, e o preço da
   API não é gameplay. Então o número vive onde quem investiga vai
   olhar: no save, no console, e no `/custo` do modo criativo, que é o
   canal que já existe para exatamente este tipo de pergunta.
   ============================================================ */

/* ---------------- A TABELA ----------------
   Dólares por MILHÃO de tokens, entrada e saída. Os nomes são os que o
   provedor devolve; um modelo que não estiver aqui não quebra a conta —
   entra como desconhecido e aparece na lista, que é como a tabela avisa
   que envelheceu. Preço muda; quando mudar, muda AQUI, num lugar só.

   O cache de prefixo do DeepSeek é a linha mais interessante da tabela:
   um token de entrada relido custa cerca de um décimo de um token novo.
   O prompt de sistema é o mesmo em todos os turnos de uma partida, e é
   ele que domina a entrada — então quase toda a conta de entrada de uma
   sessão longa deveria estar caindo no preço barato. Se não estiver, é
   sinal de que alguma coisa reescreve o começo do prompt a cada turno,
   e é um defeito de dinheiro que só este número denuncia. */
export const PRECOS = {
  "deepseek-v4-pro":   { entrada: 0.435, cache: 0.043, saida: 0.87 },
  "deepseek-v4-flash": { entrada: 0.056, cache: 0.006, saida: 0.11 },
  "gemini-3.1-pro-preview": { entrada: 1.25, cache: 0.31, saida: 10.0 },
  "gemini-3.5-flash":  { entrada: 0.30, cache: 0.075, saida: 2.50 },
  "gemini-3.6-flash":  { entrada: 0.30, cache: 0.075, saida: 2.50 },
  /* v9.466 — os dois planos do Narrador (api/narrador.js, PLANOS). Os
     preços são os que o OpenRouter publicou e cobrou no teste cego de
     13/10 (mente/ab-provedores.md). O Sol entra pelo preço de ESCRITA do
     cache (2,5, e não os 2,0 de lista): foi o que a conta cobrou de
     verdade pela entrada nova, e a tabela erra para o lado caro. */
  "gemini-3.8-flash":  { entrada: 0.75, cache: 0.075, saida: 3.75, armazenamento: 0.50 },
  /* MM11 · 11.ª sessão (13/10): o Cronista passa ao Flash-Lite do Google
     (api/narrador.js, CRONISTA), e o 3.8 Flash ganha o cache EXPLÍCITO —
     que cobra a GUARDA por milhão de tokens por hora (`armazenamento`).
     Preços da página oficial do Google em 13/10, nível padrão, até
     31/12/2026 (o 3.8 Flash dobra em 01/01/2027). */
  "gemini-3.5-flash-lite": { entrada: 0.30, cache: 0.03, saida: 2.50, armazenamento: 1.00 },
  "gemini-3.1-flash-lite": { entrada: 0.25, cache: 0.025, saida: 1.50, armazenamento: 1.00 },
  "gpt-5.6-sol":       { entrada: 2.50, cache: 0.20, saida: 10.0 },
};

/* Um modelo fora da tabela não pode custar zero: zero é uma afirmação, e
   a afirmação seria falsa. Ele custa o mais caro que conhecemos, para
   que a estimativa erre para o lado que não engana ninguém.

   v9.466: o "mais caro" passa a SAIR da tabela, campo a campo. Era um
   número escrito à mão (1,25 / 10), e o Sol, com entrada a 2,5, já o
   tinha passado no dia em que entrou — a constante solta envelhece calada.

   E O NOME QUE VOLTA NÃO É SEMPRE O DA TABELA: o OpenRouter devolve
   "openai/gpt-5.6-sol" (a casa na frente) e às vezes o id datado
   ("…-20260709"); o Google pode devolver um sufixo de revisão ("…-001").
   O preço é o mesmo modelo, então o nome se apara antes de procurar. */
const MAIS_CARO = ["entrada", "cache", "saida", "armazenamento"].reduce(
  (acc, k) => ({ ...acc, [k]: Math.max(...Object.values(PRECOS).map((p) => p[k] || 0)) }), {});
export const precoDe = (modelo) => {
  const m = String(modelo || "");
  const aparado = m.replace(/-(\d{8}|\d{3})$/, "");
  return PRECOS[m] || PRECOS[aparado] || PRECOS[aparado.split("/").pop()] || MAIS_CARO;
};

/* ---------------- A CONTA ----------------
   `entrada` do provedor JÁ inclui os tokens que vieram do cache — os dois
   campos se sobrepõem, e somar os dois cobraria o cache duas vezes.

   O CACHE EXPLÍCITO TEM DUAS LINHAS A MAIS (11.ª sessão): `escrita` são os
   tokens escritos num cache novo, que o Google cobra a preço de ENTRADA
   (é ela que faz refazer o cache a cada turno sair mais caro do que não
   ter cache); `guardado` são tokens×hora de guarda do cache que acabou
   de ser trocado e apagado, ao preço de `armazenamento`. Sem as duas, o
   cache pareceria de graça — e é o erro que engana. */
export function custoDaChamada({ modelo, entrada = 0, saida = 0, cache = 0, escrita = 0, guardado = 0 }) {
  const p = precoDe(modelo);
  const novos = Math.max(0, (Number(entrada) || 0) - (Number(cache) || 0));
  return (novos * p.entrada + (Number(cache) || 0) * p.cache + (Number(saida) || 0) * p.saida
    + (Number(escrita) || 0) * p.entrada + (Number(guardado) || 0) * (p.armazenamento || 0)) / 1e6;
}

/* ---------------- O ACUMULADO ----------------
   Guarda o mínimo que responde às perguntas que se faz de verdade:
   quanto esta campanha já custou, quanto custa um turno em média, e para
   onde o dinheiro está indo — entrada nova, entrada relida ou saída. */
export const CUSTO_ZERO = () => ({ chamadas: 0, entrada: 0, cache: 0, saida: 0, escrita: 0, dolares: 0, porTarefa: {}, porModelo: {} });

export function somarChamada(acc, uso) {
  const a = acc && typeof acc === "object" ? acc : CUSTO_ZERO();
  if (!uso || typeof uso !== "object") return a;
  const entrada = Number(uso.entrada) || 0, saida = Number(uso.saida) || 0, cache = Number(uso.cache) || 0;
  if (!entrada && !saida) return a;   /* provedor que não contou não vira zero na média */
  const escrita = Number(uso.escrita) || 0;
  const d = custoDaChamada({ modelo: uso.modelo, entrada, saida, cache, escrita, guardado: Number(uso.guardado) || 0 });
  const tarefa = String(uso.tarefa || "narrador");
  const modelo = String(uso.modelo || "?");
  /* 12.ª sessão: quantas respostas a rede de saída aparou (api/narrador.js,
     REDE_DE_SAIDA). Campo novo e só quando houve uma: a versão antiga
     ignora-o, e o acumulado sem aparo fica com a forma de sempre */
  const aparadas = (Number(a.aparadas) || 0) + (uso.aparado ? 1 : 0);
  return {
    ...(aparadas ? { aparadas } : {}),
    chamadas: a.chamadas + 1,
    entrada: a.entrada + entrada,
    cache: a.cache + cache,
    saida: a.saida + saida,
    /* campo novo (11.ª sessão): o save antigo não o tem, e a versão antiga o ignora */
    escrita: (Number(a.escrita) || 0) + escrita,
    dolares: a.dolares + d,
    porTarefa: { ...a.porTarefa, [tarefa]: (a.porTarefa[tarefa] || 0) + d },
    porModelo: { ...a.porModelo, [modelo]: (a.porModelo[modelo] || 0) + d },
  };
}

/* ---------------- A LEITURA ----------------
   Em dólar por turno o número é pequeno demais para caber na cabeça de
   alguém (0,0009 não quer dizer nada). Em centavos por cem turnos, sim. */
const cents = (d) => `${(d * 100).toFixed(2)}¢`;

export function linhasDoCusto(acc, { dia = 0 } = {}) {
  const a = acc && a1(acc) ? acc : CUSTO_ZERO();
  if (!a.chamadas) return ["nenhuma chamada medida ainda nesta campanha"];
  const porChamada = a.dolares / a.chamadas;
  const lidos = a.entrada + a.saida;
  const fatia = (n) => (lidos ? Math.round((100 * n) / lidos) : 0);
  const out = [
    `${a.chamadas} chamada(s) · US$ ${a.dolares.toFixed(4)} nesta campanha`,
    `${cents(porChamada)} por chamada${dia > 0 ? ` · ${cents(a.dolares / dia)} por dia de jogo` : ""}`,
    `entrada ${a.entrada.toLocaleString("pt-BR")} tokens (${fatia(a.entrada)}%), destes ${a.cache ? `${Math.round((100 * a.cache) / a.entrada)}% relidos do cache` : "NENHUM do cache"}`,
    `saída ${a.saida.toLocaleString("pt-BR")} tokens (${fatia(a.saida)}%)`,
  ];
  if (Number(a.aparadas) > 0) out.push(`${a.aparadas} resposta(s) aparada(s) pela rede de saída`);
  if (Number(a.escrita) > 0) out.push(`cache escrito ${Number(a.escrita).toLocaleString("pt-BR")} tokens (pago como entrada)`);
  const modelos = Object.entries(a.porModelo).sort((x, y) => y[1] - x[1]);
  if (modelos.length) out.push("por modelo: " + modelos.map(([m, d]) => `${m} ${cents(d)}`).join(" · "));
  const tarefas = Object.entries(a.porTarefa).sort((x, y) => y[1] - x[1]);
  if (tarefas.length > 1) out.push("por tarefa: " + tarefas.map(([t, d]) => `${t} ${cents(d)}`).join(" · "));
  /* O AVISO QUE JUSTIFICA O MÓDULO. Sem cache, o prompt de sistema é
     cobrado inteiro em todo turno, e ele é a maior parte da entrada. */
  if (a.entrada > 50000 && !a.cache) out.push("⚠ nenhum token veio do cache — o prompt de sistema está sendo cobrado por inteiro a cada turno");
  return out;
}

const a1 = (x) => x && typeof x === "object" && typeof x.chamadas === "number";

/* ---------------- A NORMALIZAÇÃO ----------------
   Cada provedor conta com nomes próprios. Isto é o único ponto do jogo
   que sabe disso, e é de propósito: dois lugares que traduzem o mesmo
   campo é como este projeto fabrica bug. */
export function lerUso(dados) {
  if (!dados || typeof dados !== "object") return null;
  /* OpenAI-compatível. O DeepSeek diz o cache em
     `prompt_cache_hit_tokens`; o OpenRouter (e a OpenAI) em
     `prompt_tokens_details.cached_tokens` (v9.466) — sem este segundo, o
     plano superior apareceria com cache 0 e o aviso de "nenhum token veio
     do cache" gritaria contra um cache que está a funcionar. Nos dois, o
     raciocínio já vem DENTRO de `completion_tokens`. */
  const u = dados.usage;
  if (u && (u.prompt_tokens != null || u.completion_tokens != null)) {
    const det = u.prompt_tokens_details && typeof u.prompt_tokens_details === "object" ? u.prompt_tokens_details : {};
    return {
      entrada: Number(u.prompt_tokens) || 0,
      saida: Number(u.completion_tokens) || 0,
      cache: Number(u.prompt_cache_hit_tokens) || Number(det.cached_tokens) || Number(u.cached_tokens) || 0,
    };
  }
  /* Gemini. O pensamento vem FORA da saída, em `thoughtsTokenCount`, e é
     cobrado como saída (v9.466): o 3.8 Flash não desliga o pensamento, só o
     baixa ao LOW — e sem somar aqui a conta do plano base sairia barata
     demais, que é o erro que engana. O `promptTokenCount` já inclui o
     cache, como no DeepSeek. */
  const g = dados.usageMetadata;
  if (g && (g.promptTokenCount != null || g.candidatesTokenCount != null)) {
    return {
      entrada: Number(g.promptTokenCount) || 0,
      saida: (Number(g.candidatesTokenCount) || 0) + (Number(g.thoughtsTokenCount) || 0),
      cache: Number(g.cachedContentTokenCount) || 0,
    };
  }
  return null;
}
