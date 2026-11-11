/* ============================================================
   O SOCORRO — estancar quem caiu do grupo tem regra
   (11/11/2026, Fase MC · MC10 — «O Mestre chama o dado»)

   O DEFEITO, medido na 18.ª sessão de prova (mente/sessao-18.md, defeito
   8): a irmã caiu a 0 PV, o herói ajoelhou-se a estancar, e não houve
   teste de Medicina nem estado nenhum — o Narrador decidiu sozinho que «o
   sangue para de escorrer», e acrescentou febre e costelas quebradas.

   O ESTADO QUE JÁ EXISTIA, achado antes de escrever uma linha (a planta
   pedia isso primeiro — §5, MC10):
     · o HERÓI a 0 PV tem testes de morte e `morte.estavel`
       (combate.js `aplicarTesteMorte`, motor/entrega-do-turno.js);
     · o COMPANHEIRO a 0 PV é só `vida <= 0` — e `morrendo`, que se lê em
       companheiros.js (`decidirAcaoCompanheiro`: «alguém caindo») e no
       App (o «reviver», a cura), mas que nada põe a `true` num membro do
       grupo. Não rola testes de morte, não morre sozinho, e não tem
       «estável»: fica no chão até uma cura, sem diferença nenhuma entre
       sangrar e estar estancado. O caído do grupo não tinha estado.

   O QUE NASCE AQUI, aditivo e mínimo: o campo `estavel` NUM MEMBRO DO
   GRUPO A 0 PV — `{ horas }`, o tempo até acordar. Sem ele, o caído
   sangra (é o que a pauta diz, e o que o socorro pode mudar); com ele,
   está estancado e acorda com o PV do 5e quando as horas passam. É a
   mesma régua do herói estável na luta sem saída (SAIDA_DA_LUTA: 1d4
   horas, 1 PV) — uma regra, uma tabela. A versão antiga ignora o campo.

     caidosDoGrupo(grupo)            → [{ nome, conceito, estado }]
     oSocorro(veredicto, grupo)      → null | { alvo, estado }
                                       (null = não há chamado: ninguém
                                        caído, ou quem se nomeia não caiu)
     aplicarSocorro(grupo, { quem, sucesso, sorte })
       → { grupo, estabilizou, preco, linha }
     passarHorasNoGrupo(grupo, horas) → grupo   (o estável acorda)
     oSocorroNaPauta(grupo)          → { linha, naoPode }

   O PREÇO DA FALHA é o da linha `medicina` de CUSTO_DE_FALHAR
   (desafios.js) — o mesmo que o catálogo já cobra de quem trata mal.
   Puro, imutável, e a única sorte (as horas) entra pelo gerador semeado.
   ============================================================ */

import { SAIDA_DA_LUTA } from "./saida-da-luta.js";
import { custoPorAlvo } from "./desafios.js";

/* ---------------- AS FRASES ----------------
   Na voz do herói, como o resto de `naoPode`; a linha do estado vai à
   pauta por turno (nunca bloco fixo). `alvo` é o do custo em
   CUSTO_DE_FALHAR e o do desafio `estancar`. */
export const SOCORRO = Object.freeze({
  alvo: "medicina",
  teto: 200,
  linha: Object.freeze({
    sangrando: "{nome} está no chão, a 0 PV, e o sangue não para",
    estavel: "{nome} está no chão, sem sentidos, mas o sangue parou",
  }),
  naoPode: Object.freeze({
    sangrando: "que o sangue de {nome} pare sem um dado de Medicina que o decida",
    estavel: "que {nome} acorde ou se levante antes do tempo: o sangue parou, mas ainda está sem sentidos",
  }),
  estabilizou: "O sangue de {nome} para: sem sentidos, mas respira.",
  falhou: "O sangue de {nome} não para.",
});

/* ---------------- os ajudantes ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const encher = (m, v) => String(m).replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? "" : String(v[k])));
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
const caido = (m) => !!(obj(m) && m.nome && !m.morto && num(m.vida) <= 0);
const estavelDe = (m) => (caido(m) && obj(m.estavel) ? m.estavel : null);

export function caidosDoGrupo(grupo) {
  return arr(grupo).filter(caido).map((m) => ({
    nome: String(m.nome), conceito: typeof m.conceito === "string" ? m.conceito : "",
    estado: estavelDe(m) ? "estavel" : "sangrando",
  }));
}

/* quem a frase nomeia: o nome (ou o primeiro nome), ou o conceito («a
   minha irmã» → o membro cujo conceito é «irmã»). Sem ninguém nomeado,
   o único caído — com dois, a frase tem de dizer quem. */
function acharCaido(grupo, quem) {
  const caidos = caidosDoGrupo(grupo);
  const q = norm(quem);
  if (!q) return caidos.length === 1 ? caidos[0] : null;
  const palavras = q.split(/\s+/);
  return caidos.find((c) => {
    const n = norm(c.nome), primeiro = n.split(/\s+/)[0];
    const con = norm(c.conceito);
    return q === n || q.includes(n) || n.includes(q) || palavras.includes(primeiro) || (con && palavras.includes(con));
  }) || null;
}

/* ---------------- HÁ CHAMADO? ----------------
   Só para o `estancar` do catálogo, e só com alguém do grupo no chão e a
   sangrar. O estancado não se estanca outra vez; quem não caiu não se
   socorre por esta porta. */
export function oSocorro(veredicto, grupo) {
  const v = obj(veredicto);
  if (!v || v.id !== "estancar") return null;
  const c = acharCaido(grupo, v.quem);
  if (!c || c.estado !== "sangrando") return null;
  return { alvo: c.nome, estado: c.estado };
}

/* ---------------- O DADO DECIDIU ----------------
   Sucesso: o caído fica estancado, com as horas até acordar (da sorte
   semeada, a régua do herói). Falha: o estado fica, e o preço é a linha
   `medicina` de CUSTO_DE_FALHAR. Sem caído a sangrar, nada muda. */
export function aplicarSocorro(grupo, opcoes) {
  const o = obj(opcoes) || {};
  const lista = arr(grupo);
  const c = acharCaido(lista, o.quem);
  if (!c || c.estado !== "sangrando") return { grupo: lista, estabilizou: false, preco: null, linha: "" };
  if (o.sucesso !== true) {
    return { grupo: lista, estabilizou: false, preco: custoPorAlvo(SOCORRO.alvo), linha: encher(SOCORRO.falhou, { nome: c.nome }) };
  }
  const { min, max } = SAIDA_DA_LUTA.horasAteAcordar;
  const r = typeof o.sorte === "function" ? num(o.sorte()) : 0;
  const horas = min + Math.min(max - min, Math.max(0, Math.floor(r * (max - min + 1))));
  const novo = lista.map((m) => (obj(m) && m.nome === c.nome ? { ...m, vida: 0, morrendo: false, estavel: { horas } } : m));
  return { grupo: novo, estabilizou: true, preco: null, linha: encher(SOCORRO.estabilizou, { nome: c.nome }) };
}

/* ---------------- AS HORAS PASSAM ----------------
   O estancado acorda com o PV da régua quando as horas dele acabam; até
   lá, conta para baixo. Quem se levantou por outra porta (uma cura) perde
   a marca — `estavel` só vale a 0 PV. */
export function passarHorasNoGrupo(grupo, horas) {
  const h = Math.max(0, num(horas));
  return arr(grupo).map((m) => {
    if (!obj(m) || m.estavel == null) return m;
    const e = estavelDe(m);
    if (!e) { const { estavel, ...resto } = m; return resto; }
    const falta = Math.max(0, num(e.horas) - h);
    if (falta > 0) return { ...m, estavel: { horas: falta } };
    const { estavel, ...resto } = m;
    return { ...resto, vida: SAIDA_DA_LUTA.pvAoAcordar, morrendo: false };
  });
}

/* ---------------- NA PAUTA ----------------
   Uma linha (os caídos, cada um no estado dele) e um veto por caído. Sem
   caídos, nada. */
export function oSocorroNaPauta(grupo) {
  const caidos = caidosDoGrupo(grupo);
  if (!caidos.length) return { linha: "", naoPode: [] };
  let linha = caidos.map((c) => encher(SOCORRO.linha[c.estado], { nome: c.nome })).join("; ");
  if (linha.length > SOCORRO.teto) linha = linha.slice(0, SOCORRO.teto).replace(/\s+\S*$/, "") + "…";
  return { linha, naoPode: caidos.map((c) => encher(SOCORRO.naoPode[c.estado], { nome: c.nome })) };
}
