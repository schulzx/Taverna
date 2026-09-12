/* ============================================================
   O DUELO (v9.219) — jogador contra jogador, o determinismo por juiz

   O terceiro modo das Duas Mesas. O núcleo é o CÓDIGO DE FICHA: um
   herói vira um texto curto que viaja por qualquer canal — colado numa
   conversa, mandado pela fila da sala (D4), guardado num arquivo. Quem
   recebe o código luta contra a ficha PILOTADA PELA CASA (os mesmos
   pilotos da arena: perfilCombate no gesto, o cérebro de companheiro na
   decisão), e o determinismo é o árbitro: mesma dupla + mesma semente =
   mesmo duelo, em qualquer máquina — é isso que permite conferir o
   resultado sem juiz no servidor.

   ---------------- O HASH E A CONFERÊNCIA ----------------

   O código carrega o hash da própria ficha: adulterar o texto quebra o
   selo na hora da leitura ("este código não fecha com o próprio selo").
   E dois lados que rodam a mesma série publicam o hash do RESULTADO —
   se divergirem, o duelo encerra falando: "as versões da luta não
   batem". Sem acusação, sem ranking: o Duelo é amistoso por desenho, e
   não se promete o que não se pode cumprir.

   ---------------- O QUE ELE NUNCA FAZ ----------------

   Nada aqui escreve em save nenhum (lei vi: o duelo não deixa
   cicatriz). Ler a ficha da campanha para gerar um código é LEITURA;
   o herói volta para a vida dele sem um arranhão, vença ou caia.
   ============================================================ */

import { simularSerie, TERRENOS_DA_ARENA } from "./arena.js";
import { montarPronto, prontoPorId } from "./prontos.js";
import { defesaDe } from "./combate.js";

/* ---------------- O SELO ---------------- */
export function hashCurto(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/* ---------------- O CÓDIGO DE FICHA ----------------
   TVD1|<hash>|<base64url do JSON>. O prefixo diz a versão do formato —
   um código velho falha FALANDO, nunca em silêncio. */
const PREFIXO = "TVD1";
function paraBase64(s) {
  const utf8 = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(s) : Buffer.from(s, "utf8");
  let bin = "";
  for (const b of utf8) bin += String.fromCharCode(b);
  const b64 = typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function deBase64(b64url) {
  const b64 = String(b64url || "").replace(/-/g, "+").replace(/_/g, "/");
  const bin = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return typeof TextDecoder !== "undefined" ? new TextDecoder().decode(bytes) : Buffer.from(bytes).toString("utf8");
}

export function codigoDaFicha(ficha) {
  if (!ficha || !ficha.nome || !ficha.classe) return null;
  const json = JSON.stringify(ficha);
  return `${PREFIXO}|${hashCurto(json)}|${paraBase64(json)}`;
}
export function fichaDoCodigo(codigo) {
  const partes = String(codigo || "").trim().split("|");
  if (partes.length !== 3 || partes[0] !== PREFIXO) return { ok: false, motivo: "isto não é um código de duelo" };
  let json;
  try { json = deBase64(partes[2]); } catch { return { ok: false, motivo: "o código está rasgado" }; }
  if (hashCurto(json) !== partes[1]) return { ok: false, motivo: "este código não fecha com o próprio selo" };
  let ficha;
  try { ficha = JSON.parse(json); } catch { return { ok: false, motivo: "o código está rasgado" }; }
  if (!ficha || !ficha.nome || !ficha.classe || !(ficha.vidaMax > 0)) return { ok: false, motivo: "a ficha dentro do código não é um herói" };
  return { ok: true, ficha, hash: partes[1] };
}

/* ---------------- O AVISO ANTES DO ACEITE ----------------
   O veredito antes do clique: nível, vida, defesa e arma dos dois à
   vista. É com isto que o amistoso declara a diferença (D3). */
export function resumoParaAviso(ficha) {
  if (!ficha || !ficha.nome) return null;
  return {
    nome: ficha.nome, classe: ficha.classe || "?", nivel: ficha.nivel || 1,
    vida: ficha.vidaMax || 0, defesa: defesaDe(ficha, false),
    arma: (ficha.equipados && ficha.equipados.arma && ficha.equipados.arma.nome) || "mãos nuas",
    doRoster: !!ficha.pronto,
  };
}
/* o duelo é JUSTO quando os dois vêm do roster (mesmo nível, mesmo
   orçamento — provado pela catraca da arena); qualquer outra mistura é
   AMISTOSO declarado. */
export function tipoDoDuelo(fichaA, fichaB) {
  return (fichaA && fichaA.pronto && fichaB && fichaB.pronto) ? "justo" : "amistoso";
}

/* ---------------- A SÉRIE, NARRADA SECA ---------------- */
export function duelar(fichaA, fichaB, { semente = "duelo" } = {}) {
  if (!fichaA || !fichaB) return null;
  const r = simularSerie(fichaA, fichaB, { semente });
  const nomeA = fichaA.nome, nomeB = fichaB.nome;
  const quedas = r.quedas.map((q, i) => ({
    numero: i + 1,
    terreno: q.terreno,
    nomeDoTerreno: (TERRENOS_DA_ARENA.find((t) => t.id === q.terreno) || {}).nome || q.terreno,
    vencedor: q.vencedor === "A" ? nomeA : nomeB,
    rodadas: q.rodadas,
    linhas: q.linhas,
  }));
  const vencedorNome = r.vencedor === "A" ? nomeA : nomeB;
  const placar = r.vencedor === "A" ? r.placar : r.placar.split("×").reverse().join("×");
  return {
    vencedor: r.vencedor, vencedorNome, placar, quedas,
    tipo: tipoDoDuelo(fichaA, fichaB),
    cronica: `${vencedorNome} venceu ${r.vencedor === "A" ? nomeB : nomeA} por ${placar}, fechando na ${quedas.length}ª queda.`,
    /* o selo do resultado: é isto que os dois lados comparam no D4 —
       divergiu, "as versões da luta não batem" */
    selo: hashCurto(`${r.vencedor}|${r.placar}|${quedas.map((q) => q.terreno + q.rodadas).join(",")}|${semente}`),
  };
}

/* dois lados rodaram a mesma série: os selos têm de bater */
export function versoesBatem(seloMeu, seloDoOutro) {
  return !!seloMeu && seloMeu === seloDoOutro;
}

/* ---------------- O TREINO DA CASA ----------------
   Sem código de ninguém, a casa oferece um rival do roster — o mesmo
   duelo, com a casa nos dois lados do balcão quando preciso. */
export function rivalDaCasa(meuProntoId, semente = "casa") {
  const outros = ["muralha", "sombra", "chama", "remendo", "voz", "flecha", "punho", "voto"].filter((id) => id !== meuProntoId);
  let h = 2166136261;
  const s = String(semente);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const id = outros[(h >>> 0) % outros.length];
  return { id, ficha: montarPronto(id), pronto: prontoPorId(id) };
}
