/* ============================================================
   A SALA (v9.121) — o ponto de encontro entre dois aparelhos

   `sala.js` (no cliente) sabe o que é um turno a duas mãos.
   `transporte.js` sabe levar um recado de um lado ao outro.
   Esta rota é o LADO DE LÁ do transporte: a caixa onde os recados
   ficam enquanto o outro jogador não olha.

   Ela existe porque não havia jeito de duas máquinas conversarem sem
   um terceiro ponto. Uma função serverless não guarda estado entre
   chamadas; quem guarda é o Redis do Upstash, e o token dele fica AQUI,
   na variável de ambiente — nunca no navegador, exatamente como a chave
   do Mestre em `api/narrador.js`.

   ---------------- DUAS CHAVES, E POR QUE DUAS ----------------

   `sala:<código>:fila`  — uma LISTA de recados pequenos (quem entrou,
                           quem tem ficha, o que cada um faz neste turno).
   `sala:<código>:mundo` — o save inteiro, SOBRESCRITO a cada turno.

   Separar é o que mantém a conta pequena e o custo previsível. O mundo
   passa dos 80 KB; se ele entrasse na fila, uma sessão de sessenta turnos
   deixaria cinco megabytes de saves velhos que ninguém vai ler — e o
   convidado, que pergunta "mudou alguma coisa?" a cada dois segundos,
   estaria puxando o mundo inteiro para ouvir "não". Na fila vai um
   PONTEIRO de poucos bytes; o mundo só viaja quando de fato mudou.

   ---------------- O QUE ELA NÃO FAZ ----------------

   Não valida regra de jogo, não sabe o que é uma cadeira e não julga de
   quem é a vez. Tudo isso é do cliente, e precisa continuar sendo: uma
   segunda cópia da regra aqui seria a segunda verdade que o anfitrião
   único existe para evitar.
   ============================================================ */

/* Uma sala esquecida some sozinha. Um dia é mais do que qualquer sessão
   e menos do que um depósito de lixo permanente. */
const VIDA_DA_SALA = 24 * 60 * 60;
/* O REST do Upstash tem teto de requisição. O save cresce com a campanha,
   e um mundo que não cabe precisa falhar FALANDO — um turno que some em
   silêncio é o pior defeito possível numa mesa de dois. */
const TETO_DO_MUNDO = 900 * 1024;
const TETO_DA_FILA = 400;

const CODIGO = /^[A-Z0-9]{4,12}$/;

function credenciais() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  return { url: String(url).replace(/\/+$/, ""), token: String(token) };
}

/* Um comando, ou vários de uma vez. O pipeline existe para publicar em UMA
   ida: escrever o recado e renovar o prazo da sala são a mesma operação do
   ponto de vista de quem chama, e duas idas dobrariam a conta. */
async function redis(comandos) {
  const { url, token } = credenciais();
  if (!url || !token) throw new Error("sem-credenciais");
  const varios = Array.isArray(comandos[0]);
  const r = await fetch(varios ? `${url}/pipeline` : url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(comandos),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`upstash ${r.status}: ${txt.slice(0, 200)}`);
  let dados = null;
  try { dados = JSON.parse(txt); } catch { throw new Error("resposta ilegível do Upstash"); }
  if (varios) return dados.map((d) => (d && d.result !== undefined ? d.result : null));
  return dados && dados.result !== undefined ? dados.result : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  try {
    const { acao, sala, recado, mundo, desde } = req.body || {};
    const cod = String(sala || "").toUpperCase();
    if (!CODIGO.test(cod)) { res.status(400).json({ erro: "código de sala inválido" }); return; }
    const kFila = `sala:${cod}:fila`;
    const kMundo = `sala:${cod}:mundo`;

    const { url, token } = credenciais();
    if (!url || !token) {
      /* Diz QUAL é o problema. Um 500 mudo aqui manda o jogador procurar o
         erro no jogo, e o erro está no painel da Vercel. */
      res.status(503).json({ erro: "a sala não está ligada: faltam KV_REST_API_URL e KV_REST_API_TOKEN no projeto" });
      return;
    }

    /* ---- PUBLICAR: o recado entra na fila; o mundo, quando vem, sobrescreve ---- */
    if (acao === "publicar") {
      if (!recado || typeof recado !== "object") { res.status(400).json({ erro: "recado inválido" }); return; }
      const linha = JSON.stringify(recado);
      if (linha.length > 64 * 1024) { res.status(413).json({ erro: "recado grande demais para a fila" }); return; }
      const cmds = [["RPUSH", kFila, linha], ["EXPIRE", kFila, VIDA_DA_SALA]];
      if (mundo !== undefined && mundo !== null) {
        const corpo = typeof mundo === "string" ? mundo : JSON.stringify(mundo);
        if (corpo.length > TETO_DO_MUNDO) {
          res.status(413).json({ erro: `o mundo tem ${Math.round(corpo.length / 1024)} KB e o teto é ${Math.round(TETO_DO_MUNDO / 1024)} KB` });
          return;
        }
        cmds.push(["SET", kMundo, corpo], ["EXPIRE", kMundo, VIDA_DA_SALA]);
      }
      /* a fila não cresce para sempre: o que passou do teto já foi lido por
         quem estava aqui, e quem chegar depois recebe o mundo inteiro */
      cmds.push(["LTRIM", kFila, -TETO_DA_FILA, -1]);
      const out = await redis(cmds);
      res.status(200).json({ ok: true, total: Number(out[0]) || 0 });
      return;
    }

    /* ---- LER: só o que chegou depois do que eu já vi ----
       Uma ida por consulta, e ela devolve vazio quando não houve nada. É a
       pergunta barata que o convidado faz a cada dois segundos. */
    if (acao === "ler") {
      const de = Math.max(0, Math.round(Number(desde) || 0));
      const lista = await redis(["LRANGE", kFila, de, "-1"]);
      const recados = (Array.isArray(lista) ? lista : []).map((x) => {
        try { return JSON.parse(x); } catch { return null; }
      }).filter(Boolean);
      res.status(200).json({ recados, total: de + recados.length });
      return;
    }

    /* ---- MUNDO: o save inteiro, e só quando o ponteiro disse que mudou ---- */
    if (acao === "mundo") {
      const corpo = await redis(["GET", kMundo]);
      if (!corpo) { res.status(404).json({ erro: "esta sala ainda não tem mundo" }); return; }
      res.status(200).json({ mundo: typeof corpo === "string" ? JSON.parse(corpo) : corpo });
      return;
    }

    /* ---- FECHAR: quem termina a sessão não deixa lixo para trás ---- */
    if (acao === "fechar") {
      await redis([["DEL", kFila], ["DEL", kMundo]]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ erro: "ação desconhecida" });
  } catch (e) {
    const msg = String((e && e.message) || e);
    res.status(msg === "sem-credenciais" ? 503 : 502).json({ erro: msg.slice(0, 300) });
  }
}
