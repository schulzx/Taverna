/* ============================================================
   O PORTÃO (v9.155) — quem pode bater na porta — Taverna

   `api/narrador.js` estava aberto para a internet inteira: sem checagem
   de origem, sem limite, sem nada. Hoje só uma pessoa conhece a URL —
   mas num beta ela circula, e quem a encontrasse gastaria as chaves do
   DeepSeek e do Gemini de graça, sem nem precisar abrir o jogo. Um
   `curl` num laço faz isso a noite inteira.

   Duas travas, e elas resolvem coisas diferentes:

   A ORIGEM barra o uso FORA do jogo. Um navegador é obrigado a mandar
   `Origin` numa requisição destas, e não deixa a página mentir sobre ele
   — é a única coisa neste arquivo em que dá para confiar de verdade.

   O TETO barra o exagero DENTRO do jogo. Ele conta por endereço e por
   dia, no mesmo Redis que a sala já usa.

   ---------------- O QUE ISTO NÃO É ----------------

   Não é autenticação. Quem souber montar uma requisição à mão pode
   forjar `Origin` fora do navegador, e endereço se troca. O objetivo é
   proporcional ao risco real de um beta: impedir que a URL vazada vire
   uma API de graça para terceiros, e impedir que um laço acidental (ou
   um jogador entediado) queime a conta do mês numa madrugada.

   Autenticação de verdade é trabalho de quando houver conta de usuário.
   Fingir que isto é segurança seria pior do que não ter: a defesa que se
   acredita ser mais forte do que é vira o motivo de ninguém olhar de
   novo para ela.
   ============================================================ */

/* ---------------- A ORIGEM ----------------
   `VERCEL_URL` é o domínio deste deploy, posto pela própria Vercel.
   `ORIGENS_EXTRA` é para o domínio próprio, quando houver — uma lista
   separada por vírgula. E o localhost fica de fora da lista de propósito:
   ele é liberado só quando NÃO há domínio configurado, que é exatamente
   a situação de quem está desenvolvendo. */
export function origensPermitidas() {
  const out = [];
  if (process.env.VERCEL_URL) out.push(`https://${process.env.VERCEL_URL}`);
  for (const x of String(process.env.ORIGENS_EXTRA || "").split(",")) {
    const t = x.trim().replace(/\/+$/, "");
    if (t) out.push(t);
  }
  return out;
}

/* ---------------- A MÁQUINA DE QUEM DESENVOLVE (v9.171) ----------------
   A v9.155 deixou o localhost de fora "porque quem desenvolve não tem
   domínio configurado". A premissa estava errada, e custou caro: o
   `vite dev` NÃO TEM `/api` — ele repassa para a API que já está no ar
   (ver vite.config.js), e lá a Vercel sempre põe `VERCEL_URL`. Ou seja,
   a situação "sem domínio configurado" nunca acontece do lado que
   responde, e jogar localmente devolvia 403 SEMPRE.

   O estrago era maior do que parecia porque o léxico é uma chamada de IA
   como qualquer outra: ele morria no mesmo 403, em silêncio, e o mundo
   nascia genérico. Quem testava via duas coisas sem relação aparente —
   "o Mestre não responde" e "o léxico não agiu" — e eram a mesma.

   LIBERAR O LOCALHOST NÃO ENFRAQUECE O QUE ESTE PORTÃO DEFENDE. `Origin`
   só é confiável quando vem de navegador, e nenhum site de verdade mora
   em localhost: nenhuma PÁGINA hostil pode reivindicar essa origem. Quem
   monta a requisição à mão já podia forjar qualquer origem antes desta
   linha — contra esse, quem defende é o teto diário, que conta por
   endereço e não olha a origem. */
const ehDaMaquinaLocal = (origem) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origem);

export function origemAceita(req) {
  const permitidas = origensPermitidas();
  /* SEM DOMÍNIO CONFIGURADO, o portão fica aberto — é a máquina de quem
     desenvolve, e travar ali só ensinaria a desligar o portão inteiro. */
  if (!permitidas.length) return { ok: true, motivo: "sem domínio configurado" };
  const h = req.headers || {};
  const origem = String(h.origin || "").replace(/\/+$/, "");
  if (origem && ehDaMaquinaLocal(origem)) return { ok: true, motivo: "desenvolvimento" };
  /* Requisição sem `Origin` não veio de página nenhuma: é `curl`, script
     ou robô. Um navegador SEMPRE manda este cabeçalho num POST de outra
     origem, e manda também nas da mesma origem para `fetch`. */
  if (!origem) return { ok: false, motivo: "sem origem" };
  if (permitidas.includes(origem)) return { ok: true, motivo: "" };
  /* pré-visualizações da Vercel mudam de subdomínio a cada deploy, e
     recusá-las tornaria impossível testar o que se vai publicar */
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origem) && permitidas.some((p) => p.endsWith(".vercel.app"))) {
    return { ok: true, motivo: "pré-visualização" };
  }
  return { ok: false, motivo: `origem não autorizada` };
}

/* ---------------- QUEM É ----------------
   O endereço que a Vercel põe em `x-forwarded-for`. Imperfeito — casa
   inteira atrás de um roteador conta como uma pessoa, e celular troca de
   IP — e ainda assim é o melhor identificador que existe sem conta de
   usuário. O teto é generoso o bastante para que a imprecisão não
   atrapalhe quem está jogando de verdade. */
export function quemE(req) {
  const h = req.headers || {};
  const bruto = String(h["x-forwarded-for"] || h["x-real-ip"] || "").split(",")[0].trim();
  return bruto || "desconhecido";
}

/* ---------------- O TETO ----------------
   Quinhentas chamadas por dia. Uma sessão longa de verdade passa de
   cinquenta turnos e cada turno é uma chamada (mais as leves), então
   quinhentas dão folga para um dia inteiro de jogo pesado — e barram
   com sobra o laço que faria mil numa hora.

   Contado no Redis com `INCR` + `EXPIRE`: a primeira chamada do dia cria
   a chave e marca a validade; as outras só somam. Uma ida ao Redis por
   turno, no pipeline, como a sala já faz. */
export const TETO_DIARIO = Number(process.env.TETO_DIARIO || 500);

const credenciais = () => ({
  url: String(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, ""),
  token: String(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""),
});

const hoje = () => new Date().toISOString().slice(0, 10);

export async function dentroDoTeto(req) {
  const { url, token } = credenciais();
  /* SEM REDIS, O TETO NÃO EXISTE — e deixar passar é a decisão certa: um
     jogo que para de funcionar porque o contador caiu é pior do que um
     jogo sem contador. A origem continua barrando o principal. */
  if (!url || !token) return { ok: true, usos: 0, teto: TETO_DIARIO, medido: false };
  const chave = `uso:${hoje()}:${quemE(req)}`;
  try {
    const r = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify([["INCR", chave], ["EXPIRE", chave, 60 * 60 * 26]]),
    });
    if (!r.ok) return { ok: true, usos: 0, teto: TETO_DIARIO, medido: false };
    const dados = await r.json();
    const usos = Number(dados && dados[0] && dados[0].result) || 0;
    return { ok: usos <= TETO_DIARIO, usos, teto: TETO_DIARIO, medido: true };
  } catch {
    /* Redis fora do ar não pode derrubar a mesa de ninguém. */
    return { ok: true, usos: 0, teto: TETO_DIARIO, medido: false };
  }
}

/* ---------------- A PORTA ----------------
   Uma chamada só, para as rotas não repetirem a ordem das travas — e a
   ordem importa: a origem é barata e local, o teto custa uma ida ao
   Redis. Barrar o robô antes de pagar pela contagem dele. */
export async function deixarEntrar(req) {
  const o = origemAceita(req);
  /* v9.171: a recusa passa a DIZER o que aconteceu. A mensagem para quem
     joga continua a mesma — ela não é lugar de detalhe de infraestrutura —,
     mas `motivo` e `origem` viajam no corpo, e é isso que transforma "o
     Mestre não respondeu" numa linha que se lê no console e se conserta.
     Sem isso, a única pista era um 403 mudo.

     E NÃO VAI A LISTA DE PERMITIDAS. A primeira versão disto mandava, e
     seria desfazer a regra que este arquivo já tinha: a recusa não diz
     qual origem seria aceita, porque dizer é entregar a chave junto com o
     aviso de que a fechadura existe. `origem` é o que o próprio pedido
     mandou — devolvê-la não informa nada que quem pediu já não soubesse. */
  if (!o.ok) {
    return {
      ok: false, status: 403,
      erro: "Este endereço só responde ao jogo.",
      motivo: o.motivo,
      origem: String((req.headers || {}).origin || "(nenhuma)"),
    };
  }
  const t = await dentroDoTeto(req);
  if (!t.ok) {
    return {
      ok: false, status: 429,
      erro: `Limite diário alcançado (${t.teto} chamadas). Ele volta a zero à meia-noite — e se você chegou aqui jogando de verdade, me avise: o teto sobe.`,
    };
  }
  return { ok: true, usos: t.usos, teto: t.teto };
}
