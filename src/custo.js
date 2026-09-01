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
};

/* Um modelo fora da tabela não pode custar zero: zero é uma afirmação, e
   a afirmação seria falsa. Ele custa o mais caro que conhecemos, para
   que a estimativa erre para o lado que não engana ninguém. */
const MAIS_CARO = { entrada: 1.25, cache: 0.31, saida: 10.0 };
export const precoDe = (modelo) => PRECOS[String(modelo || "")] || MAIS_CARO;

/* ---------------- A CONTA ----------------
   `entrada` do provedor JÁ inclui os tokens que vieram do cache — os dois
   campos se sobrepõem, e somar os dois cobraria o cache duas vezes. */
export function custoDaChamada({ modelo, entrada = 0, saida = 0, cache = 0 }) {
  const p = precoDe(modelo);
  const novos = Math.max(0, (Number(entrada) || 0) - (Number(cache) || 0));
  return (novos * p.entrada + (Number(cache) || 0) * p.cache + (Number(saida) || 0) * p.saida) / 1e6;
}

/* ---------------- O ACUMULADO ----------------
   Guarda o mínimo que responde às perguntas que se faz de verdade:
   quanto esta campanha já custou, quanto custa um turno em média, e para
   onde o dinheiro está indo — entrada nova, entrada relida ou saída. */
export const CUSTO_ZERO = () => ({ chamadas: 0, entrada: 0, cache: 0, saida: 0, dolares: 0, porTarefa: {}, porModelo: {} });

export function somarChamada(acc, uso) {
  const a = acc && typeof acc === "object" ? acc : CUSTO_ZERO();
  if (!uso || typeof uso !== "object") return a;
  const entrada = Number(uso.entrada) || 0, saida = Number(uso.saida) || 0, cache = Number(uso.cache) || 0;
  if (!entrada && !saida) return a;   /* provedor que não contou não vira zero na média */
  const d = custoDaChamada({ modelo: uso.modelo, entrada, saida, cache });
  const tarefa = String(uso.tarefa || "narrador");
  const modelo = String(uso.modelo || "?");
  return {
    chamadas: a.chamadas + 1,
    entrada: a.entrada + entrada,
    cache: a.cache + cache,
    saida: a.saida + saida,
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
  /* OpenAI-compatível (DeepSeek) */
  const u = dados.usage;
  if (u && (u.prompt_tokens != null || u.completion_tokens != null)) {
    return {
      entrada: Number(u.prompt_tokens) || 0,
      saida: Number(u.completion_tokens) || 0,
      cache: Number(u.prompt_cache_hit_tokens) || Number(u.cached_tokens) || 0,
    };
  }
  /* Gemini */
  const g = dados.usageMetadata;
  if (g && (g.promptTokenCount != null || g.candidatesTokenCount != null)) {
    return {
      entrada: Number(g.promptTokenCount) || 0,
      saida: Number(g.candidatesTokenCount) || 0,
      cache: Number(g.cachedContentTokenCount) || 0,
    };
  }
  return null;
}
