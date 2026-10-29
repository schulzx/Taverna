/* Função de servidor (Vercel) — O TURNO PELO SERVIDOR
   (Fase 4 do plano do motor, trilha B, 29/10/2026).

   O plano (mente/plano-motor.md, Fase 4): `POST /api/turno` recebe
   `{ estado, frase }`, monta o pedido ao Narrador AQUI, e devolve a
   resposta — o prompt e o motor saem do bundle do navegador, e quem
   joga de fora do jogo joga com uma chave por licenciante.

   COM CHAVE, A ROTA JOGA DE VERDADE (29/10, a pessoa: «pode fazer o
   recomendado»). Um licenciante (`authorization: Bearer tav1.…`) manda
   `{ estado, frase, eco?, bilhetes?, cache? }` e recebe o turno inteiro:
   `{ estadoDoFim, eco, soltos, tela, narrativa, cronista, cache, uso, … }`.
   O pedido ao Narrador monta-se aqui (src/turno-no-servidor.js), vai ao
   provedor pela MESMA via do /api/narrador (api/_provedor.js: os planos,
   as reservas, o cache explícito, a conta do uso — uma chamada só, uma
   verdade só), e o depois corre aqui também (o aplicar, o fim do turno, o
   Juiz, o Cronista quando o gatilho acende, chamado pela mesma via). Com
   chave, `resposta` e `cronista` no corpo são RECUSADOS (400): a resposta é
   a do Narrador, nunca a do cliente — quem mandasse a resposta escolhia o
   turno. O prompt continua a não sair: a resposta leva o que o turno fez,
   não o que se pediu ao Narrador.

   A QUOTA: o turno inteiro conta UM uso (src/licenca.js, «um turno, um
   uso») — o Narrador, a segunda escrita dele e o Cronista do mesmo turno
   são um pedido a esta rota, e a licença conta um por pedido. A conta é
   feita antes da rede (vinte pedidos em paralelo não passam por baixo do
   teto), e o turno que o PROVEDOR não deu devolve-se ao contador
   (`devolverOUso`): 502, `motivo: "provedor-falhou"`, a conta já com a
   devolução. O corpo inválido (400) e o estado que não monta (422) contam,
   como contavam: não gastaram IA, e um laço deles não pode ser grátis.

   SEM CHAVE, A ROTA CONTINUA EM ENSAIO, como era: monta e não narra. 200
   com `{ ensaio: true, pedido: { tamanho, hash, … } }` — a medida e a
   impressão digital do pedido, NUNCA o pedido —, e com `resposta` no corpo
   (uma resposta do Narrador JÁ DADA, das sessões gravadas) corre o depois e
   devolve o eco, os soltos, a tela e a impressão do estado do fim. Sem
   chave ninguém gasta a IA da casa por aqui: o jogo continua a falar com
   `api/narrador.js`, e o portão de lá é o mesmo de cá.

   AS DUAS PORTAS, e por que duas:

   - COM CHAVE: é um licenciante, e quem chama é o servidor dele — sem
     `Origin`, que um navegador poria e um servidor não. A trava é a licença
     (src/licenca.js): o selo, a suspensão, a quota da chave. A origem não
     se olha, porque não prova nada fora de um navegador.
   - SEM CHAVE: é o jogo, e passa pelo mesmo portão das outras rotas
     (`_portao.js`: a origem e o teto diário por endereço). Nenhuma rota
     desta casa responde sem trava antes de qualquer custo.

   O QUE A PESSOA LIGA NA VERCEL para abrir a porta (sem elas, a rota com
   chave diz o que falta e para, sem gastar nada):
   - LICENCA_SEGREDO: o segredo do servidor que sela as chaves (32+
     caracteres aleatórios). Trocá-lo invalida todas as chaves.
   - KV_REST_API_URL / KV_REST_API_TOKEN: o Redis que a sala e o portão
     já usam; os registos moram em `licenca:<licenciante>`.
   - as chaves do provedor são as que o /api/narrador já usa: nenhuma nova. */
import { createHash } from "node:crypto";
import { deixarEntrar } from "./_portao.js";
import { chamarOProvedor } from "./_provedor.js";
import { LICENCA, autorizar, armazemDoUpstash, chaveDoPedido, devolverOUso } from "../src/licenca.js";
import { oPedidoNoServidor, oTurnoNoServidor, IA_DO_TURNO } from "../src/turno-no-servidor.js";

/* a forma do pedido: o teto da frase, o do estado (o mesmo da sala,
   `TETO_DO_MUNDO` em sala.js — o save inteiro de uma campanha) e o do eco
   e dos bilhetes juntos (memória de um turno: os vetos, os nomes à mão, os
   mortos da sessão até 120 — dezenas de KB, não centenas) */
const PEDIDO_DO_TURNO = Object.freeze({ fraseMax: 4000, estadoMax: 900 * 1024, extrasMax: 128 * 1024 });

/* o ensaio: o que a resposta diz do pedido montado, e com que impressão
   digital. Só medidas e os parâmetros da chamada — nenhum texto do prompt */
const ENSAIO_DO_TURNO = Object.freeze({ hash: "sha256", motivo: "provedor-por-ligar", casasDoTempo: 10 });

/* o turno de verdade: até onde o erro do provedor viaja (o mesmo corte do
   /api/narrador, que diz quem estava na fila e porque caiu) */
const TURNO_DE_VERDADE = Object.freeze({ detalheMax: 400 });

const credenciais = () => ({
  url: String(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, ""),
  token: String(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""),
});

const ehObjetoOuNada = (x) => x == null || (typeof x === "object" && !Array.isArray(x));
const aConta = (a, usos) => ({ licenciante: a.licenciante, usos, teto: a.teto, restam: Math.max(0, a.teto - usos) });

/* A PORTA DO PROVEDOR, como o turno a pede (oNarradorDoServidor): o corpo
   do /api/narrador entra, a resposta boa sai, e o que não for 200 lança —
   com a mensagem que o /api/narrador daria */
const chamar = async (corpo) => {
  const r = await chamarOProvedor(corpo);
  if (r.status !== 200) throw new Error((r.corpo && r.corpo.erro) || `HTTP ${r.status}`);
  return r.corpo;
};

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  const chave = chaveDoPedido(req.headers);
  /* sem chave é o jogo: o portão de sempre, antes de tudo */
  if (!chave) { const p = await deixarEntrar(req); if (!p.ok) { res.status(p.status).json({ erro: p.erro, motivo: p.motivo, origem: p.origem }); return; } }
  let licenca = null, autorizado = null, armazem = null;
  if (chave) {
    /* com chave é um licenciante: o que falta na Vercel diz-se pelo nome */
    if (!process.env[LICENCA.variavel]) { res.status(503).json({ erro: `a licença não está ligada: falta ${LICENCA.variavel} no projeto`, motivo: "sem-segredo" }); return; }
    const { url, token } = credenciais();
    if (!url || !token) { res.status(503).json({ erro: "a licença não está ligada: faltam KV_REST_API_URL e KV_REST_API_TOKEN no projeto", motivo: "sem-armazem" }); return; }
    armazem = armazemDoUpstash({ url, token });
    const a = await autorizar({ chave, segredoDoServidor: process.env[LICENCA.variavel], armazem });
    if (!a.ok) {
      const { ok, status, ...corpo } = a;
      if (status === 429) res.setHeader("retry-after", String(Math.ceil(a.reabreEm / 1000)));
      res.status(status).json(corpo);
      return;
    }
    autorizado = a;
    licenca = aConta(a, a.usos);
  }
  const comConta = () => (licenca ? { licenca } : {});
  const { estado, frase, eco, bilhetes, resposta, cronista, cache } = req.body || {};
  if (!estado || typeof estado !== "object" || Array.isArray(estado)) { res.status(400).json({ erro: "pedido inválido: falta `estado` (o save do jogo, um objeto)", ...comConta() }); return; }
  if (typeof frase !== "string" || !frase.trim()) { res.status(400).json({ erro: "pedido inválido: falta `frase` (o que o jogador escreveu)", ...comConta() }); return; }
  if (frase.length > PEDIDO_DO_TURNO.fraseMax) { res.status(413).json({ erro: `a frase passa de ${PEDIDO_DO_TURNO.fraseMax} caracteres`, ...comConta() }); return; }
  if (!ehObjetoOuNada(eco) || !ehObjetoOuNada(bilhetes)) { res.status(400).json({ erro: "pedido inválido: `eco` e `bilhetes`, quando vêm, são objetos", ...comConta() }); return; }
  /* com chave o turno é do Narrador: a resposta do cliente não entra */
  if (chave && (resposta != null || cronista != null)) { res.status(400).json({ erro: "pedido inválido: com chave a resposta é a do Narrador — `resposta` e `cronista` só existem no ensaio, sem chave", motivo: "resposta-do-cliente", ...comConta() }); return; }
  if (!ehObjetoOuNada(cache)) { res.status(400).json({ erro: "pedido inválido: `cache` é a ficha do cache que o turno anterior devolveu, um objeto", ...comConta() }); return; }
  /* o ensaio do depois: a resposta do Narrador já dada (e a proposta do Cronista) */
  if (resposta != null && (!ehObjetoOuNada(resposta) || typeof resposta.narrativa !== "string")) { res.status(400).json({ erro: "pedido inválido: `resposta` (só em ensaio) é { narrativa, mudancas }" }); return; }
  if (!ehObjetoOuNada(cronista)) { res.status(400).json({ erro: "pedido inválido: `cronista` (só em ensaio) é a proposta do Cronista, um objeto" }); return; }
  let peso = 0, pesoExtra = 0;
  try { peso = JSON.stringify(estado).length; pesoExtra = JSON.stringify([eco || null, bilhetes || null, resposta || null, cronista || null, cache || null]).length; } catch { res.status(400).json({ erro: "pedido inválido: o `estado`, o `eco` ou os `bilhetes` não se serializam", ...comConta() }); return; }
  if (peso > PEDIDO_DO_TURNO.estadoMax) { res.status(413).json({ erro: `o estado tem ${Math.round(peso / 1024)} KB e o teto é ${Math.round(PEDIDO_DO_TURNO.estadoMax / 1024)} KB`, ...comConta() }); return; }
  if (pesoExtra > PEDIDO_DO_TURNO.extrasMax) { res.status(413).json({ erro: `o eco e os bilhetes têm ${Math.round(pesoExtra / 1024)} KB e o teto é ${Math.round(PEDIDO_DO_TURNO.extrasMax / 1024)} KB`, ...comConta() }); return; }
  const t0 = performance.now();
  const ms = () => Math.round((performance.now() - t0) * ENSAIO_DO_TURNO.casasDoTempo) / ENSAIO_DO_TURNO.casasDoTempo;

  /* O TURNO DE VERDADE: só com chave. A montagem, o Narrador, o depois e o
     Cronista, numa chamada; a falha que é do provedor devolve o uso. */
  if (chave) {
    let m;
    try {
      m = await oTurnoNoServidor({ estado, frase, eco, bilhetes }, { chamar, cache });
    } catch (e) {
      if (e && e.motivo === IA_DO_TURNO.falhou) {
        const depois = await devolverOUso(autorizado, armazem);
        if (depois != null) licenca = aConta(autorizado, depois);
        res.status(502).json({ erro: "o Narrador não respondeu: o turno não aconteceu", motivo: IA_DO_TURNO.falhou, detalhe: String(e.message || "").slice(0, TURNO_DE_VERDADE.detalheMax), devolvido: depois != null, ...comConta() });
        return;
      }
      res.status(422).json({ erro: "o turno não se montou com este estado", motivo: "montagem-estourou", ...comConta() });
      return;
    }
    const ia = m.ia || { chamadas: 0, usos: [] };
    res.status(200).json({
      estadoDoFim: m.estadoDoFim,
      eco: m.eco,
      soltos: m.soltos,
      tela: m.tela,
      narrativa: m.narrativa,
      /* o que o turno decidiu do Cronista, e quantas idas à IA ele custou
         (o Narrador, a 2.ª escrita, o Cronista) — a conta do custo, turno a
         turno; a quota contou UM */
      cronista: m.cronista,
      chamadas: ia.chamadas,
      uso: ia.usos,
      /* a ficha do cache explícito: o cliente guarda-a e devolve-a no turno
         seguinte (null quando o cache morreu) */
      ...(ia.cache !== undefined ? { cache: ia.cache } : {}),
      calados: m.calados.length,
      turnoMs: ms(),
      ...comConta(),
    });
    return;
  }

  /* O ENSAIO (sem chave): as peças do motor, sem tela, sem disco, sem rede.
     Onde o App estouraria, o servidor também — e diz só que estourou: a
     pilha é do motor, não de quem chama. */
  let m;
  try {
    m = resposta
      ? await oTurnoNoServidor({ estado, frase, eco, bilhetes, resposta }, { cronista: () => cronista || null })
      : await oPedidoNoServidor({ estado, frase, eco, bilhetes });
  } catch {
    res.status(422).json({ erro: "o turno não se montou com este estado", motivo: "montagem-estourou" });
    return;
  }
  const montagemMs = ms();
  const { system, messages, ...parametros } = m.pedido;
  const texto = JSON.stringify(m.pedido);
  /* O ENSAIO: nenhum provedor é chamado. */
  res.status(200).json({
    ensaio: true,
    motivo: ENSAIO_DO_TURNO.motivo,
    pedido: {
      tamanho: texto.length,
      hash: createHash(ENSAIO_DO_TURNO.hash).update(texto).digest("hex"),
      system: typeof system === "string" ? system.length : JSON.stringify(system ?? "").length,
      mensagens: Array.isArray(messages) ? messages.length : 0,
      ...parametros,
    },
    calados: m.calados.length,
    montagemMs,
    /* o depois (só com `resposta`): o eco, os soltos e a tela; do estado do
       fim só a impressão digital — o cliente do ensaio confere, não aplica.
       E o que o turno decidiu do Cronista (`cronista.chamado`: houve uma
       2.ª chamada de IA neste turno) — é a conta do custo, turno a turno */
    ...(resposta ? {
      eco: m.eco, soltos: m.soltos, tela: m.tela, cronista: m.cronista,
      estado: { hash: createHash(ENSAIO_DO_TURNO.hash).update(JSON.stringify(m.estadoDoFim)).digest("hex"), tamanho: JSON.stringify(m.estadoDoFim).length, calou: m.calou.length },
    } : {}),
  });
}
