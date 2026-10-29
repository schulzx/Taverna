/* Função de servidor (Vercel) — O TURNO PELO SERVIDOR, o esqueleto
   (Fase 4 do plano do motor, trilha B, 29/10/2026).

   O plano (mente/plano-motor.md, Fase 4): `POST /api/turno` recebe
   `{ estado, frase }`, monta o pedido ao Narrador AQUI, e devolve a
   resposta — o prompt e o motor saem do bundle do navegador, e quem
   joga de fora do jogo joga com uma chave por licenciante.

   HOJE ELA NÃO NARRA. A montagem do pedido ainda mora no App (o
   inventário do que falta está no diário de 29/10, trilha B): enquanto
   ela não corre em Node, esta rota faz tudo MENOS o turno — a porta, a
   licença, a quota, a forma do pedido — e responde 501. NÃO chama
   provedor nenhum e não gasta um centavo. O cliente não muda: o jogo
   continua a falar com `api/narrador.js`.

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
import { deixarEntrar } from "./_portao.js";
import { LICENCA, autorizar, armazemDoUpstash, chaveDoPedido } from "../src/licenca.js";

/* a forma do pedido: o teto da frase e o do estado (o do estado é o mesmo
   da sala, `TETO_DO_MUNDO` em sala.js — o save inteiro de uma campanha) */
const PEDIDO_DO_TURNO = Object.freeze({ fraseMax: 4000, estadoMax: 900 * 1024 });

const credenciais = () => ({
  url: String(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, ""),
  token: String(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""),
});

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
  const { estado, frase } = req.body || {};
  if (!estado || typeof estado !== "object" || Array.isArray(estado)) { res.status(400).json({ erro: "pedido inválido: falta `estado` (o save do jogo, um objeto)" }); return; }
  if (typeof frase !== "string" || !frase.trim()) { res.status(400).json({ erro: "pedido inválido: falta `frase` (o que o jogador escreveu)" }); return; }
  if (frase.length > PEDIDO_DO_TURNO.fraseMax) { res.status(413).json({ erro: `a frase passa de ${PEDIDO_DO_TURNO.fraseMax} caracteres` }); return; }
  let peso = 0;
  try { peso = JSON.stringify(estado).length; } catch { res.status(400).json({ erro: "pedido inválido: o `estado` não se serializa" }); return; }
  if (peso > PEDIDO_DO_TURNO.estadoMax) { res.status(413).json({ erro: `o estado tem ${Math.round(peso / 1024)} KB e o teto é ${Math.round(PEDIDO_DO_TURNO.estadoMax / 1024)} KB` }); return; }
  /* O TURNO AINDA NÃO MORA AQUI: a porta abriu, o pedido tem forma, e
     nenhum provedor é chamado. */
  res.status(501).json({
    erro: "o turno pelo servidor ainda não está montado: a montagem do pedido ao Narrador ainda corre no navegador. Use /api/narrador por enquanto.",
    motivo: "turno-por-montar",
    ...(licenca ? { licenca } : {}),
  });
}
