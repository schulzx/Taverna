/* Função de servidor (Vercel) — O TURNO PELO SERVIDOR, em ensaio
   (Fase 4 do plano do motor, trilha B, 29/10/2026).

   O plano (mente/plano-motor.md, Fase 4): `POST /api/turno` recebe
   `{ estado, frase }`, monta o pedido ao Narrador AQUI, e devolve a
   resposta — o prompt e o motor saem do bundle do navegador, e quem
   joga de fora do jogo joga com uma chave por licenciante.

   HOJE ELA MONTA E NÃO NARRA. O pedido ao Narrador monta-se aqui
   inteiro (src/turno-no-servidor.js: o estado do servidor, o prelúdio e o
   pedido, as três peças do motor provadas à letra contra o App), e a rota
   responde em ENSAIO: 200 com `{ ensaio: true, pedido: { tamanho, hash,
   … } }` — a medida e a impressão digital do pedido, NUNCA o pedido. O
   prompt é o segredo do motor, e é exatamente o que esta fase tira do
   navegador; devolvê-lo seria abrir pela porta da frente o que se fecha
   pela de trás. O hash (SHA-256 do JSON do pedido) basta para provar que
   o servidor montou o mesmo que o motor monta em Node.

   NÃO chama provedor nenhum e não gasta um centavo: a montagem não tem
   porta de rede (as bocas estão em BOCAS_POR_TURNO = 0, e sem porta a boca
   cala). Ligar o provedor de verdade — a chamada, a quota contada por
   turno, o eco e os soltos devolvidos — é o passo que a pessoa autoriza
   (está no diário de 29/10, trilha B). O cliente não muda: o jogo continua
   a falar com `api/narrador.js`.

   O DEPOIS, SÓ EM ENSAIO (29/10, trilha B). Com `resposta` no corpo — uma
   resposta do Narrador JÁ DADA (`{ narrativa, mudancas }`, das sessões
   gravadas) — a rota corre o resto do turno (src/turno-no-servidor.js,
   `oTurnoNoServidor`: o aplicar, o códex, a chegada, o Juiz e a correção,
   e o Cronista com a proposta que vier em `cronista`, também gravada) e
   devolve o ECO (para o cliente reenviar no turno seguinte), os SOLTOS
   (para o save) e a TELA, mais a impressão digital do estado do fim.
   ISTO É ENSAIO: `resposta` e `cronista` existem para provar o depois sem
   gastar um centavo, e deixam de ser aceites no dia em que a rota chamar
   o provedor ela mesma — a resposta passa a ser a dele, nunca a do cliente
   (um cliente que mandasse a resposta escolheria o turno).

   AS DUAS PORTAS, e por que duas:

   - COM CHAVE (`authorization: Bearer tav1.…`): é um licenciante, e quem
     chama é o servidor dele — sem `Origin`, que um navegador poria e um
     servidor não. A trava é a licença (src/licenca.js): o selo, a
     suspensão, a quota da chave. A origem não se olha, porque não prova
     nada fora de um navegador.
   - SEM CHAVE: é o jogo, e passa pelo mesmo portão das outras rotas
     (`_portao.js`: a origem e o teto diário por endereço). Nenhuma rota
     desta casa responde sem trava antes de qualquer custo.

   O QUE A PESSOA LIGA NA VERCEL quando decidir abrir a porta (nada disto
   é obrigatório hoje — sem elas, a rota diz o que falta e para):
   - LICENCA_SEGREDO: o segredo do servidor que sela as chaves (32+
     caracteres aleatórios). Trocá-lo invalida todas as chaves.
   - KV_REST_API_URL / KV_REST_API_TOKEN: o Redis que a sala e o portão
     já usam; os registos moram em `licenca:<licenciante>`. */
import { createHash } from "node:crypto";
import { deixarEntrar } from "./_portao.js";
import { LICENCA, autorizar, armazemDoUpstash, chaveDoPedido } from "../src/licenca.js";
import { oPedidoNoServidor, oTurnoNoServidor } from "../src/turno-no-servidor.js";

/* a forma do pedido: o teto da frase, o do estado (o mesmo da sala,
   `TETO_DO_MUNDO` em sala.js — o save inteiro de uma campanha) e o do eco
   e dos bilhetes juntos (memória de um turno: os vetos, os nomes à mão, os
   mortos da sessão até 120 — dezenas de KB, não centenas) */
const PEDIDO_DO_TURNO = Object.freeze({ fraseMax: 4000, estadoMax: 900 * 1024, extrasMax: 128 * 1024 });

/* o ensaio: o que a resposta diz do pedido montado, e com que impressão
   digital. Só medidas e os parâmetros da chamada — nenhum texto do prompt */
const ENSAIO_DO_TURNO = Object.freeze({ hash: "sha256", motivo: "provedor-por-ligar", casasDoTempo: 10 });

const credenciais = () => ({
  url: String(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, ""),
  token: String(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""),
});

const ehObjetoOuNada = (x) => x == null || (typeof x === "object" && !Array.isArray(x));

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ erro: "Use POST" }); return; }
  const chave = chaveDoPedido(req.headers);
  /* sem chave é o jogo: o portão de sempre, antes de tudo */
  if (!chave) { const p = await deixarEntrar(req); if (!p.ok) { res.status(p.status).json({ erro: p.erro, motivo: p.motivo, origem: p.origem }); return; } }
  let licenca = null;
  if (chave) {
    /* com chave é um licenciante: o que falta na Vercel diz-se pelo nome */
    if (!process.env[LICENCA.variavel]) { res.status(503).json({ erro: `a licença não está ligada: falta ${LICENCA.variavel} no projeto`, motivo: "sem-segredo" }); return; }
    const { url, token } = credenciais();
    if (!url || !token) { res.status(503).json({ erro: "a licença não está ligada: faltam KV_REST_API_URL e KV_REST_API_TOKEN no projeto", motivo: "sem-armazem" }); return; }
    const a = await autorizar({ chave, segredoDoServidor: process.env[LICENCA.variavel], armazem: armazemDoUpstash({ url, token }) });
    if (!a.ok) {
      const { ok, status, ...corpo } = a;
      if (status === 429) res.setHeader("retry-after", String(Math.ceil(a.reabreEm / 1000)));
      res.status(status).json(corpo);
      return;
    }
    licenca = { licenciante: a.licenciante, usos: a.usos, teto: a.teto, restam: a.restam };
  }
  const { estado, frase, eco, bilhetes, resposta, cronista } = req.body || {};
  if (!estado || typeof estado !== "object" || Array.isArray(estado)) { res.status(400).json({ erro: "pedido inválido: falta `estado` (o save do jogo, um objeto)" }); return; }
  if (typeof frase !== "string" || !frase.trim()) { res.status(400).json({ erro: "pedido inválido: falta `frase` (o que o jogador escreveu)" }); return; }
  if (frase.length > PEDIDO_DO_TURNO.fraseMax) { res.status(413).json({ erro: `a frase passa de ${PEDIDO_DO_TURNO.fraseMax} caracteres` }); return; }
  if (!ehObjetoOuNada(eco) || !ehObjetoOuNada(bilhetes)) { res.status(400).json({ erro: "pedido inválido: `eco` e `bilhetes`, quando vêm, são objetos" }); return; }
  /* o ensaio do depois: a resposta do Narrador já dada (e a proposta do Cronista) */
  if (resposta != null && (!ehObjetoOuNada(resposta) || typeof resposta.narrativa !== "string")) { res.status(400).json({ erro: "pedido inválido: `resposta` (só em ensaio) é { narrativa, mudancas }" }); return; }
  if (!ehObjetoOuNada(cronista)) { res.status(400).json({ erro: "pedido inválido: `cronista` (só em ensaio) é a proposta do Cronista, um objeto" }); return; }
  let peso = 0, pesoExtra = 0;
  try { peso = JSON.stringify(estado).length; pesoExtra = JSON.stringify([eco || null, bilhetes || null, resposta || null, cronista || null]).length; } catch { res.status(400).json({ erro: "pedido inválido: o `estado`, o `eco` ou os `bilhetes` não se serializam" }); return; }
  if (peso > PEDIDO_DO_TURNO.estadoMax) { res.status(413).json({ erro: `o estado tem ${Math.round(peso / 1024)} KB e o teto é ${Math.round(PEDIDO_DO_TURNO.estadoMax / 1024)} KB` }); return; }
  if (pesoExtra > PEDIDO_DO_TURNO.extrasMax) { res.status(413).json({ erro: `o eco e os bilhetes têm ${Math.round(pesoExtra / 1024)} KB e o teto é ${Math.round(PEDIDO_DO_TURNO.extrasMax / 1024)} KB` }); return; }
  /* A MONTAGEM: as peças do motor, sem tela, sem disco, sem rede. Onde o
     App estouraria, o servidor também — e diz só que estourou: a pilha é
     do motor, não de quem chama. */
  const t0 = performance.now();
  let m;
  try {
    m = resposta
      ? await oTurnoNoServidor({ estado, frase, eco, bilhetes, resposta }, { cronista: () => cronista || null })
      : await oPedidoNoServidor({ estado, frase, eco, bilhetes });
  } catch {
    res.status(422).json({ erro: "o turno não se montou com este estado", motivo: "montagem-estourou", ...(licenca ? { licenca } : {}) });
    return;
  }
  const montagemMs = Math.round((performance.now() - t0) * ENSAIO_DO_TURNO.casasDoTempo) / ENSAIO_DO_TURNO.casasDoTempo;
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
    ...(licenca ? { licenca } : {}),
  });
}
