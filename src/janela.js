/* ============================================================
   A JANELA ANCORADA (v9.162) — o histórico para de serrar o cache

   O prompt paga por byte, e o provedor cobra um décimo pelo que
   reconhece do turno anterior — desde que seja IDÊNTICO, byte a byte,
   do primeiro caractere em diante. A v9.153 arrumou o system prompt
   para isso (o volátil desceu todo para o fim). Sobrou a outra metade
   da conversa: o histórico.

   `slice(-30)` era uma serra: a cada turno a janela DESLIZAVA uma
   mensagem, o começo dela mudava, e tudo dali em diante — histórico
   inteiro — era cobrado cheio, todo turno, para sempre. Acrescentar no
   FIM preserva o prefixo; tirar do COMEÇO destrói.

   A âncora conserta isso: a janela começa num ponto FIXO e só cresce
   pelo fim. Quando fica comprida demais, a âncora salta de uma vez —
   o cache quebra UMA vez a cada salto, e não uma vez por turno.

   ---------------- A CONTA ----------------

   A âncora é função pura do comprimento: nada é guardado, nenhum save
   muda de formato, e a mesma conversa dá sempre a mesma janela.

     âncora(n) = ⌊(n − MIN) / SALTO⌋ × SALTO   (nunca negativa)

   Com MIN = 24 e SALTO = 24, a janela respira entre 24 e 47 mensagens
   e a âncora salta a cada 24 (≈ doze turnos, a duas mensagens por
   turno). A janela média fica em ~35 contra as 30 fixas de antes —
   maior no bruto, muito menor na fatura: o que antes era 30 mensagens
   cobradas cheias todo turno vira ~35 quase todas a um décimo.

   ---------------- POR QUE COMEÇAR NO JOGADOR ----------------

   Janela que abre com resposta do narrador é conversa começando pela
   metade — a primeira fala fica sem a pergunta que a causou, e há
   provedor que recusa histórico que não abre no usuário. O ajuste come
   no máximo uma mensagem, e só nos saltos.
   ============================================================ */

export const JANELA_MIN = 24;
export const SALTO_DA_ANCORA = 24;

export function janelaAncorada(historico) {
  const l = Array.isArray(historico) ? historico : [];
  const ancora = Math.max(0, Math.floor((l.length - JANELA_MIN) / SALTO_DA_ANCORA) * SALTO_DA_ANCORA);
  let corte = l.slice(ancora);
  while (corte.length && corte[0] && corte[0].role !== "user") corte = corte.slice(1);
  return corte;
}

/* ============================================================
   O CACHE EXPLÍCITO DO GEMINI (MM11 · 11.ª sessão, 13/10)

   A âncora acima foi feita para um provedor que relê QUALQUER prefixo
   já visto (o DeepSeek). O Gemini não: a 11.ª sessão mediu 25,4% de
   cache, e o que o Google creditou foi sempre o mesmo bloco de ~11,49
   mil tokens — o tamanho do `system` —, nunca a conversa atrás dele,
   embora 56–78% de cada pedido fosse byte a byte o anterior. E o
   dente de serra diz mais do que o número: 0 nas cinco primeiras
   chamadas e 0 em cada corte da janela, com o `system` IDÊNTICO nos
   dois casos. O implícito do Google não é "o prefixo que eu já vi";
   é um palpite dele, sem garantia (a doc diz isso com estas palavras:
   "no cost saving guarantee"), e o palpite parou no `system`.

   O que tem garantia é o EXPLÍCITO (`cachedContents`): a casa escreve
   o prefixo uma vez — o `system` e o histórico até ali — e, enquanto
   ele valer, cada turno manda só o que veio depois. A doc o recomenda
   para exatamente isto ("chatbots with extensive system instructions").

   O PREÇO DA GARANTIA, e é ele que decide quando refazer. Escrever o
   cache cobra os tokens dele a preço CHEIO (como entrada nova), e
   guardá-lo cobra por hora (US$ 0,50 por milhão por hora no 3.8 Flash).
   Refazer a cada turno seria pagar tudo cheio todo turno; nunca refazer
   deixa o rabo da conversa crescer cheio. O meio-termo saiu da conta
   sobre as 62 chamadas da 11.ª (o rascunho está no diário do ciclo):

     refazer quando o rabo passa de     cache   US$ do Narrador
       3.000 tokens                      70%      1,22
       6.000 tokens                      66%      1,07   ← a régua
      12.000 tokens                      60%      1,16
     (o implícito, medido)               25%      1,50

   A janela fica como está (24/24): com o explícito, janela maior paga
   mais escrita do que poupa (simulado: 32/16 e 40/24 saem mais caras).

   ---------------- A FICHA ----------------

   O servidor da Vercel não tem memória entre pedidos: quem lembra o
   nome do cache é o JOGO, numa ficha que o servidor lhe devolve e ele
   manda de volta no turno seguinte. A ficha diz QUE prefixo o cache
   guarda (a impressão do `system` e das `m` primeiras mensagens), e o
   servidor só a usa se o pedido de agora começar EXATAMENTE por esse
   prefixo — senão o Narrador leria uma conversa que não é a dele. A
   assinatura (no servidor, com a chave dele) impede que uma ficha
   inventada aponte para um cache que não é desta conversa.

   Tudo aqui é conta pura, sem rede e sem relógio: o `agora` entra por
   argumento, e a mesma conversa dá sempre a mesma decisão.
   ============================================================ */
export const CACHE_EXPLICITO = {
  /* o rabo (as mensagens depois do cache, sem a do turno) que faz
     valer a pena reescrever o cache — a régua da conta acima */
  raboMaxTokens: 6000,
  /* quanto o cache vive no Google. O turno seguinte de quem pensa devagar
     cabe com folga; o cache trocado é apagado na hora, então o TTL só se
     paga inteiro no último de cada sessão (~US$ 0,01) */
  ttlSegundos: 1800,
  /* não se usa um cache a menos disto do fim: o turno não pode morrer
     num 404 de cache que expirou entre o envio e a leitura */
  folgaSegundos: 120,
  /* a conta de tokens sem tokenizador: o `system` da 11.ª tinha 40.541
     caracteres e o Google contou ~11.490 tokens — 3,5 por token */
  charsPorToken: 3.5,
  /* abaixo disto o Google não guarda (o mínimo do implícito no 3.8
     Flash é 4.096; o explícito não diz o seu, e se usa o mesmo) */
  minTokens: 4096,
  /* o cache só nasce com ao menos uma troca inteira atrás do turno:
     um cache só de `system` é o que o implícito já dá de graça */
  minMensagens: 2,
};

const textoDe = (m) => String(m && m.content != null ? m.content : "");

/* A impressão do prefixo: FNV-1a de 32 bits em duas sementes (64 bits
   no total). Não é segredo nenhum — é só a pergunta "estas mensagens são
   as mesmas?", e a assinatura do servidor é que guarda a ficha. */
function fnv(s, semente) {
  let h = semente >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, "0");
}
export function impressaoDoPrefixo(system, mensagens, m) {
  const ms = Array.isArray(mensagens) ? mensagens : [];
  const n = Math.max(0, Math.min(ms.length, Math.floor(Number(m) || 0)));
  const s = [String(system == null ? "" : system), ...ms.slice(0, n).map((x) => `${x && x.role}\u0001${textoDe(x)}`)].join("\u0002");
  return fnv(s, 2166136261) + fnv(s, 0x811c9dc5 ^ 0x5bd1e995);
}

const tokensDe = (chars) => chars / CACHE_EXPLICITO.charsPorToken;

/* A DECISÃO DO TURNO. Devolve uma de três:
     { acao: "usar",  m }                     — o cache da ficha serve;
     { acao: "criar", m, impressao, apagar }  — escrever um novo com as
       `m` primeiras mensagens (todas menos a do turno) e apagar o velho;
     { acao: "nenhum", apagar }               — pedido inteiro, sem cache.
   `ficha` é a que o jogo trouxe (já com a assinatura conferida pelo
   servidor), ou nada. */
export function decidirOCache(pedido) {
  /* `= {}` não cobre null: o pedido nulo é tratado à mão */
  const { ficha, system, mensagens, agora = 0, modelo = "" } = pedido && typeof pedido === "object" ? pedido : {};
  const T = CACHE_EXPLICITO;
  const ms = Array.isArray(mensagens) ? mensagens : [];
  const f = ficha && typeof ficha === "object" ? ficha : null;
  const mMax = Math.max(0, ms.length - 1);
  const velho = f && typeof f.nome === "string" && f.nome ? f.nome : null;
  const valida = !!f && velho && f.modelo === modelo && Number.isInteger(f.m) && f.m >= 1 && f.m <= mMax
    && Number(agora) < Number(f.expira) - T.folgaSegundos * 1000
    && impressaoDoPrefixo(system, ms, f.m) === f.impressao;
  if (valida) {
    const rabo = ms.slice(f.m, mMax).reduce((a, x) => a + textoDe(x).length, 0);
    if (tokensDe(rabo) < T.raboMaxTokens) return { acao: "usar", m: f.m };
  }
  const chars = String(system == null ? "" : system).length + ms.slice(0, mMax).reduce((a, x) => a + textoDe(x).length, 0);
  if (mMax >= T.minMensagens && tokensDe(chars) >= T.minTokens) {
    return { acao: "criar", m: mMax, impressao: impressaoDoPrefixo(system, ms, mMax), apagar: velho };
  }
  return valida ? { acao: "usar", m: f.m } : { acao: "nenhum", apagar: velho };
}

/* ============================================================
   A MEMÓRIA DO TURNO (onda 1 do custo do turno, 13/10/2026)

   O histórico que vai ao Narrador guardava, para cada fala antiga do
   jogador, o `corpo` inteiro daquele turno: a PAUTA, os envelopes do
   sistema e, no fim, a frase. Na 10.ª sessão eram ~2.200 caracteres por
   fala, dos quais ~150 de frase — 73% de tudo o que o histórico relia
   eram ordens de um turno que já passou ("O FECHO termine em fala a
   meio", "NÃO PODE…", "REGRA DESTE ENVELOPE"). Custava US$ 0,30 por
   sessão e fazia o Narrador reler fecho velho como se fosse de agora
   (mente/custo-do-turno.md, desperdício 1).

   O que fica: a frase do jogador, inteira (é o que ele fez, e a
   continuidade é dele), e — quando o sistema decidiu um número que a
   narração pode não ter dito — uma marca curta do que ficou decidido
   (o teste e o resultado, a compra e o preço). O que sai: a pauta e os
   envelopes de instrução. Os vetos que ainda valem voltam na pauta nova,
   todo turno; o que aconteceu está na narrativa que segue a fala.

   O turno ATUAL não muda: leva a pauta inteira, e a frase por último
   (MM18). Só o que vai para o histórico é que encolhe — e encolhe uma
   vez, ao ser guardado: depois disso a mensagem nunca muda, e o prefixo
   do cache explícito continua idêntico byte a byte de um turno ao outro.
   ============================================================ */
export const MEMORIA_DO_JOGADOR = {
  /* a frase do jogador vai inteira até aqui (as da 10.ª tinham ~150) */
  letrasDaFrase: 800,
  /* o turno do sistema (o clique, sem frase): o título e a primeira frase */
  letrasDoEnvelope: 140,
  /* cada marca do que o sistema decidiu, e quantas por turno */
  letrasDaMarca: 60,
  marcasMax: 2,
};

const cortar = (s, n) => {
  const t = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, Math.max(0, n - 1)).trimEnd()}…`;
};
/* o corpo de um envelope: o que vem depois do primeiro "]" */
const corpoDe = (linha) => { const i = linha.indexOf("]"); return i < 0 ? "" : linha.slice(i + 1).trim(); };

/* As decisões do sistema que valem uma marca: as que trazem um número
   ou um resultado que a narração pode ter deixado de fora, e que o
   jogador pode perguntar três turnos depois ("quanto paguei?"). Cada uma
   lê a sua linha e devolve a marca, ou null. */
const M = (id, rx, ler) => ({ id, rx, ler });
export const MARCAS_DA_MEMORIA = [
  M("teste", /^\[TESTE /, (l) => {
    const a = l.match(/teste de ([^(.,]+?)\s*(?:\(|para\b|\.|,)/i);
    const r = l.match(/Resultado:\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ ]+?)\s*(?:\.|$)/);
    return a && r ? `teste de ${a[1].trim()}: ${r[1].trim()}` : null;
  }),
  M("compra", /^\[COMPRA/, (l) => (corpoDe(l).match(/^(Comprei .+? por [^,.]+)/) || [])[1] || null),
  M("venda", /^\[VENDA/, (l) => (corpoDe(l).match(/^(Vendi .+? por [^,.]+)/) || [])[1] || null),
  M("debito", /^\[DÉBITO/, (l) => (corpoDe(l).match(/(paguei [^,.]+)/i) || [])[1] || null),
  M("social", /^\[SOCIAL — RESOLVIDO/, (l) => (l.match(/(Tentei [^.]+)/) || [])[1] || null),
  M("vitoria", /^\[VITÓRIA/, (l) => { const m = l.match(/aplicou ([^\]]+)\]/); return m ? `vitória: ${m[1].trim()}` : "vitória"; }),
  M("missao", /^\[MISSÃO CONCLUÍDA/, (l) => { const m = l.match(/"([^"]+)"/); return m ? `missão "${m[1]}" concluída` : null; }),
];

function marcaDe(linha) {
  const l = String(linha || "").trimStart();
  if (!l.startsWith("[")) return null;
  const m = MARCAS_DA_MEMORIA.find((x) => x.rx.test(l));
  if (!m) return null;
  let s = null;
  try { s = m.ler(l); } catch { s = null; }
  return s ? cortar(s, MEMORIA_DO_JOGADOR.letrasDaMarca) : null;
}

/* O turno do sistema em uma linha: "[RESPOSTA A Petra] Pergunto a Petra
   porquê." — o título sem o "— DECIDIDO PELO SISTEMA" e a primeira frase. */
function envelopeCurto(c) {
  const linha = c.split("\n").find((l) => l.trim()) || "";
  const t = linha.match(/^\[([^\]]*)\]\s*(.*)$/);
  if (!t) return cortar(linha, MEMORIA_DO_JOGADOR.letrasDoEnvelope);
  const titulo = t[1].split(" — ")[0].trim();
  const frase = (t[2].match(/^.*?[.!?](?=\s|$)/) || [t[2]])[0];
  return cortar(`[${titulo}]${frase ? " " + frase : ""}`, MEMORIA_DO_JOGADOR.letrasDoEnvelope);
}

/* A mensagem do jogador como fica no histórico. `conteudo` é o que o
   turno recebeu (a frase, ou o envelope do clique); `nota` é a pauta com
   os envelopes do turno. Nunca vazia: um provedor recusa mensagem sem
   texto. A frase vem por último, como no turno em que foi dita. */
export function memoriaDoTurno(conteudo, nota) {
  const T = MEMORIA_DO_JOGADOR;
  const c = String(conteudo == null ? "" : conteudo).trim();
  const doSistema = c.startsWith("[");
  const linhas = [...String(nota == null ? "" : nota).split("\n"), ...(doSistema ? c.split("\n") : [])];
  const marcas = [];
  for (const l of linhas) {
    const m = marcaDe(l);
    if (m && !marcas.includes(m)) marcas.push(m);
    if (marcas.length >= T.marcasMax) break;
  }
  /* o clique que já virou marca (a compra, o débito) não se repete abaixo dela */
  const frase = !doSistema ? cortar(c, T.letrasDaFrase) : marcaDe(c.split("\n")[0]) && marcas.length ? "" : envelopeCurto(c);
  const marca = marcas.length ? `[o sistema registou: ${marcas.join(" · ")}]` : "";
  return [marca, frase].filter(Boolean).join("\n") || "…";
}
