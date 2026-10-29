/* ============================================================
   A LICENÇA (Fase 4 do plano do motor, trilha B, 29/10/2026) — Taverna

   O plano (mente/plano-motor.md, Fase 4) diz que o turno vai para o
   servidor — `POST /api/turno` recebe `{ estado, frase }` — e que quem o
   chama de fora do jogo chama com UMA CHAVE POR LICENCIANTE, com quota por
   chave. A pessoa aprovou o servidor; as chaves, as variáveis da Vercel e o
   Redis de produção continuam dela. Este módulo é a regra, e só a regra:
   o formato da chave, a verificação, a conta da quota. Quem guarda e quem
   lê é injetado — a suíte usa um armazém de memória, a rota usa o Redis
   que o `api/` já usa. Nada aqui abre rede sozinho.

   ---------------- A CHAVE ----------------

   `tav1.<licenciante>.<segredo>`: a versão do formato, o nome do
   licenciante (público — é por ele que se acha o registo, sem varrer
   nada) e 32 bytes aleatórios em base64url. O segredo é o que se vende,
   e por isso NUNCA é guardado: o armazém guarda só o selo, um HMAC-SHA256
   da chave inteira com o segredo do servidor (`LICENCA_SEGREDO`, na
   Vercel). Duas razões para o HMAC em vez do hash nu:

   1. Um despejo do Redis sem o segredo do servidor não serve nem para
      testar chaves candidatas fora daqui — o selo só se confere onde o
      segredo mora.
   2. O selo cobre o nome do licenciante junto: um selo copiado para o
      registo de outro licenciante não abre a porta dele.

   O preço, escrito para não se descobrir tarde: TROCAR `LICENCA_SEGREDO`
   INVALIDA TODAS AS CHAVES. É a forma de revogar tudo de uma vez — e o
   motivo para nunca o trocar por engano.

   A comparação é em tempo constante (`timingSafeEqual`): quem mede o tempo
   da recusa não aprende quantos caracteres acertou.

   ---------------- A QUOTA ----------------

   Janela fixa, como o teto diário do portão (`_portao.js`): o índice da
   janela é `floor(agora / janela)`, o contador é `INCR` numa chave que
   leva o índice, e a validade é a janela mais uma folga. Cada licenciante
   pode ter teto e janela próprios no registo; sem eles vale a tabela. Toda
   chamada autenticada conta, a recusada também: um laço que bate no teto
   não fica a bater de graça.

   UM TURNO, UM USO (29/10, o /api/turno joga de verdade). A rota autoriza
   uma vez por pedido, e o pedido é o turno inteiro: o Narrador, a segunda
   escrita dele quando a primeira vem sem narrativa, e o Cronista do mesmo
   turno contam UM. A conta é feita ANTES da rede, e de propósito: contar
   no fim deixava vinte pedidos em paralelo passarem todos por baixo do
   teto. E O TURNO QUE O PROVEDOR NÃO DEU DEVOLVE-SE (`devolverOUso`): se a
   fila inteira de modelos caiu, ou nem a segunda escrita trouxe narrativa,
   o licenciante não recebeu turno nenhum, e a culpa é do lado de cá — o
   uso volta ao contador. O que NÃO se devolve é o que é do pedido: o corpo
   inválido (400) e o estado que não monta (422) contam, como contavam,
   porque não gastaram um centavo de IA e um laço deles não pode ser grátis.

   ---------------- FALHA FECHADA, AO CONTRÁRIO DO PORTÃO ----------------

   O portão deixa passar quando o Redis cai, e tem razão: ali o contador é
   uma cortesia, e um jogo parado por causa dele é pior. Aqui é o oposto.
   Sem o armazém não há como saber se a chave existe, e o turno de um
   licenciante gasta a conta de quem paga — então armazém fora, segredo do
   servidor ausente ou registo ilegível RECUSAM, com o motivo dito.

   A recusa não distingue "licenciante que não existe" de "segredo
   errado": dizer qual dos dois é ensinar a quem tenta quais nomes valem.
   ============================================================ */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const LICENCA = Object.freeze({
  /* a versão do formato abre a chave: um formato novo nasce `tav2` e o
     velho continua a ser lido enquanto houver quem o use */
  prefixo: "tav1",
  separador: ".",
  /* o nome do licenciante: minúsculas, dígitos e hífen, sem hífen nas
     pontas. Vai em chave do Redis e em log, logo não leva espaço nem ponto */
  licenciante: /^[a-z0-9](?:[a-z0-9-]{1,30})[a-z0-9]$/,
  /* 256 bits de sorte: o segredo não precisa de hash lento, porque não é
     senha de gente — é número que ninguém adivinha */
  bytesDoSegredo: 32,
  segredo: /^[A-Za-z0-9_-]{43}$/,
  algoritmo: "sha256",
  /* o segredo do servidor: a variável, e o mínimo que se aceita dela */
  variavel: "LICENCA_SEGREDO",
  minimoDoSegredoDoServidor: 32,
  /* onde o registo mora no armazém */
  registo: "licenca:",
  /* onde a chave vem no pedido: `authorization: Bearer <chave>` */
  cabecalho: "authorization",
  esquema: "Bearer",
});

export const QUOTA = Object.freeze({
  /* sem nada no registo, um dia e mil turnos: o dobro do teto diário que
     o portão dá a um endereço (500, `_portao.js`), porque um licenciante é
     uma casa inteira de jogadores, não um */
  janelaPadrao: 24 * 60 * 60,
  tetoPadrao: 1000,
  /* o que um registo pode pedir: janela de um minuto a um mês */
  janelaMin: 60,
  janelaMax: 31 * 24 * 60 * 60,
  tetoMin: 1,
  tetoMax: 1000000,
  /* o contador vive a janela mais isto, para o relógio do Redis e o
     nosso não discutirem a fronteira */
  folga: 60,
  contador: "quota:",
});

const ehTexto = (x) => typeof x === "string";
const inteiroEntre = (x, min, max, padrao) => {
  const n = Number(x);
  return Number.isInteger(n) && n >= min && n <= max ? n : padrao;
};

/* a chave, lida: `{ licenciante, segredo }`, ou null para o que não é */
export function lerChave(chave) {
  if (!ehTexto(chave)) return null;
  const partes = chave.trim().split(LICENCA.separador);
  if (partes.length !== 3 || partes[0] !== LICENCA.prefixo) return null;
  const [, licenciante, segredo] = partes;
  if (!LICENCA.licenciante.test(licenciante) || !LICENCA.segredo.test(segredo)) return null;
  return { licenciante, segredo };
}

/* o selo de uma chave: o que o armazém guarda no lugar dela */
export function seloDaChave(chave, segredoDoServidor) {
  return createHmac(LICENCA.algoritmo, String(segredoDoServidor)).update(String(chave).trim()).digest("hex");
}

const segredoDoServidorServe = (s) => ehTexto(s) && s.length >= LICENCA.minimoDoSegredoDoServidor;

/* o registo que veio do armazém (texto JSON ou objeto), com a quota já
   dentro dos limites; null para o que não é registo */
function registoLido(bruto) {
  let r = bruto;
  if (ehTexto(r)) { try { r = JSON.parse(r); } catch { return null; } }
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  if (!ehTexto(r.selo) || !/^[0-9a-f]{64}$/.test(r.selo)) return null;
  return {
    selo: r.selo,
    ativa: r.ativa !== false,
    teto: inteiroEntre(r.teto, QUOTA.tetoMin, QUOTA.tetoMax, QUOTA.tetoPadrao),
    janela: inteiroEntre(r.janela, QUOTA.janelaMin, QUOTA.janelaMax, QUOTA.janelaPadrao),
  };
}

const selosIguais = (a, b) => {
  const x = Buffer.from(String(a), "hex"), y = Buffer.from(String(b), "hex");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
};

/* EMITIR: a chave nova e o registo que vai para o armazém. A chave sai
   daqui uma vez e só uma — quem emite a entrega ao licenciante; o registo
   guarda o selo. A sorte é injetável para a suíte provar sem acaso. */
export function emitirChave(pedido, segredoDoServidor, opcoes) {
  /* `= {}` não cobre null: o null explícito vira vazio aqui */
  const { licenciante, teto, janela, nome } = pedido || {};
  const { aleatorio = randomBytes, agora = Date.now() } = opcoes || {};
  if (!ehTexto(licenciante) || !LICENCA.licenciante.test(licenciante)) throw new Error("licenciante inválido: minúsculas, dígitos e hífen, 3 a 32");
  if (!segredoDoServidorServe(segredoDoServidor)) throw new Error(`falta ${LICENCA.variavel} (no mínimo ${LICENCA.minimoDoSegredoDoServidor} caracteres)`);
  const bytes = Buffer.from(aleatorio(LICENCA.bytesDoSegredo));
  if (bytes.length !== LICENCA.bytesDoSegredo) throw new Error("a sorte não deu os bytes do segredo");
  const chave = [LICENCA.prefixo, licenciante, bytes.toString("base64url")].join(LICENCA.separador);
  const registo = {
    selo: seloDaChave(chave, segredoDoServidor),
    ativa: true,
    teto: inteiroEntre(teto, QUOTA.tetoMin, QUOTA.tetoMax, QUOTA.tetoPadrao),
    janela: inteiroEntre(janela, QUOTA.janelaMin, QUOTA.janelaMax, QUOTA.janelaPadrao),
    ...(ehTexto(nome) && nome.trim() ? { nome: nome.trim().slice(0, 80) } : {}),
    emitida: new Date(agora).toISOString(),
  };
  return { chave, onde: LICENCA.registo + licenciante, registo };
}

/* a chave que o pedido trouxe, ou "" — `authorization: Bearer <chave>` */
export function chaveDoPedido(cabecalhos) {
  const h = cabecalhos && typeof cabecalhos === "object" ? cabecalhos : {};
  const bruto = String(h[LICENCA.cabecalho] || h[LICENCA.cabecalho[0].toUpperCase() + LICENCA.cabecalho.slice(1)] || "").trim();
  const [esq, ...resto] = bruto.split(/\s+/);
  return esq === LICENCA.esquema && resto.length === 1 ? resto[0] : "";
}

/* A CONTA DA JANELA: pura. Em que janela `agora` cai, e quanto falta
   para ela reabrir. */
export function janelaDe(agora, janela) {
  const ms = janela * 1000;
  const indice = Math.floor(Number(agora) / ms);
  return { indice, reabreEm: (indice + 1) * ms - Number(agora) };
}

const recusa = (status, motivo, erro, extra = {}) => ({ ok: false, status, motivo, erro, ...extra });

/* AUTORIZAR: a porta inteira, numa chamada. O armazém é
   `{ ler(chave) → texto|null, somar(chave, validadeSeg) → número }`,
   os dois assíncronos. Devolve `{ ok: true, licenciante, usos, teto,
   restam, reabreEm }` ou `{ ok: false, status, motivo, erro }`. */
export async function autorizar(entrada) {
  const { chave, segredoDoServidor, armazem, agora = Date.now() } = entrada || {};
  if (!segredoDoServidorServe(segredoDoServidor)) {
    return recusa(503, "sem-segredo", `a licença não está ligada: falta ${LICENCA.variavel} no projeto (no mínimo ${LICENCA.minimoDoSegredoDoServidor} caracteres)`);
  }
  if (!armazem || typeof armazem.ler !== "function" || typeof armazem.somar !== "function") {
    return recusa(503, "sem-armazem", "a licença não está ligada: falta o armazém");
  }
  const lida = lerChave(chave);
  if (!lida) return recusa(401, "chave-malformada", `chave ausente ou fora do formato (${LICENCA.esquema} ${LICENCA.prefixo}.<licenciante>.<segredo>)`);
  let bruto;
  try { bruto = await armazem.ler(LICENCA.registo + lida.licenciante); } catch {
    return recusa(503, "armazem-fora", "o armazém das licenças não respondeu");
  }
  const reg = bruto == null ? null : registoLido(bruto);
  if (bruto != null && !reg) return recusa(503, "registo-ilegivel", "o registo desta licença está ilegível no armazém");
  if (!reg || !selosIguais(reg.selo, seloDaChave(chave, segredoDoServidor))) return recusa(401, "chave-recusada", "chave recusada");
  if (!reg.ativa) return recusa(403, "licenca-suspensa", "esta licença está suspensa");
  const { indice, reabreEm } = janelaDe(agora, reg.janela);
  const contador = `${QUOTA.contador}${lida.licenciante}:${reg.janela}:${indice}`, validade = reg.janela + QUOTA.folga;
  let usos;
  try { usos = Number(await armazem.somar(contador, validade)); } catch {
    return recusa(503, "armazem-fora", "o armazém das licenças não respondeu");
  }
  if (!Number.isFinite(usos)) return recusa(503, "armazem-fora", "o armazém das licenças respondeu sem número");
  const conta = { licenciante: lida.licenciante, usos, teto: reg.teto, restam: Math.max(0, reg.teto - usos), reabreEm };
  if (usos > reg.teto) return recusa(429, "quota-esgotada", `quota esgotada (${reg.teto} por janela); reabre em ${Math.ceil(reabreEm / 1000)} s`, conta);
  /* o contador e a validade dele vão junto, para quem quiser devolver o
     uso (devolverOUso) — são do servidor: a rota não os põe na resposta */
  return { ok: true, ...conta, contador, validade };
}

/* DEVOLVER O USO: o turno que o provedor não deu volta ao contador (o
   porquê está no cabeçalho, «um turno, um uso»). Recebe o que `autorizar`
   devolveu e o armazém; o armazém precisa de `descontar(chave, validade)`.
   Nunca lança e nunca custa o turno: sem armazém que desconte, ou com ele
   fora, devolve `null` e o uso fica gasto — falha para o lado da casa, como
   a licença falha (fechada), nunca para um contador negativo. Devolve os
   usos depois da devolução, ou null. */
export async function devolverOUso(conta, armazem) {
  const c = conta && typeof conta === "object" ? conta : {};
  if (!c.ok || !ehTexto(c.contador) || !c.contador.startsWith(QUOTA.contador)) return null;
  if (!armazem || typeof armazem.descontar !== "function") return null;
  try {
    const n = Number(await armazem.descontar(c.contador, Number(c.validade) || QUOTA.janelaPadrao + QUOTA.folga));
    return Number.isFinite(n) ? Math.max(0, n) : null;
  } catch { return null; }
}

/* O ARMAZÉM DO UPSTASH: o mesmo REST que `_portao.js` e `sala.js` usam,
   com o `fetch` injetável. Lança quando falha — `autorizar` transforma o
   lançamento em recusa fechada. */
export function armazemDoUpstash(ligacao) {
  const { url, token, buscar = globalThis.fetch } = ligacao || {};
  const base = String(url || "").replace(/\/+$/, "");
  const ir = async (rota, corpo) => {
    if (!base || !token) throw new Error("sem-credenciais");
    const r = await buscar(base + rota, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(corpo),
    });
    if (!r || !r.ok) throw new Error(`upstash ${r ? r.status : "sem resposta"}`);
    return r.json();
  };
  return {
    ler: async (chave) => { const d = await ir("", ["GET", chave]); return d && d.result !== undefined ? d.result : null; },
    somar: async (chave, validade) => {
      const d = await ir("/pipeline", [["INCR", chave], ["EXPIRE", chave, validade]]);
      return Number(d && d[0] && d[0].result);
    },
    /* a devolução: DECR com a mesma validade (um contador que a janela já
       apagou renasceria em -1 sem prazo; com o EXPIRE, morre como os outros) */
    descontar: async (chave, validade) => {
      const d = await ir("/pipeline", [["DECR", chave], ["EXPIRE", chave, validade]]);
      return Number(d && d[0] && d[0].result);
    },
  };
}
