/* ============================================================
   COORDENADAS (v9.118) — o mundo passa a ter endereço

   Este jogo sempre teve posição. O que ele nunca teve foi UMA posição.

   As cidades nascem com `x,y` no pergaminho de cem por cem desde a
   v7.5, e uma unidade vale vinte e cinco quilômetros. Os arredores
   nascem com `x,y` desde a v9.51 — mas sorteados entre 6 e 11 unidades
   da cidade, o que dá de CENTO E CINQUENTA A DUZENTOS E SETENTA E CINCO
   QUILÔMETROS de distância para um moinho que o próprio registro diz
   ficar a trinta e cinco minutos a pé. O mapa e o texto discordavam em
   cinquenta vezes, e discordavam em silêncio. Os lugares do `lugar.js`
   não têm posição nenhuma: têm "dentro", "arredores" e "perto", que são
   três palavras onde deveria haver um número. E o herói, no meio de uma
   viagem, era desenhado eternamente no MEIO do trecho, com a fração
   cravada em 0.5, andasse ele dez por cento ou noventa.

   Nada disso é erro de cálculo. É a falta de um vocabulário: cada
   módulo inventou o seu jeito de dizer onde uma coisa está, e um mundo
   com seis jeitos de dizer "onde" não sabe onde nada está.

   ---------------- DUAS ESCALAS, E ELAS SÃO HONESTAS ----------------

   Uma coordenada aqui tem duas partes, e a separação é deliberada:

   - `x,y` são o PERGAMINHO: unidades de 0 a 100, vinte e cinco
     quilômetros cada. É a escala do continente.
   - `mx,my` são METROS a partir daquele ponto. É a escala de dentro do
     assentamento — o quarto de cima da taverna, o balcão, o portão sul.

   Poderiam ser um número só, e não podem: doze metros valem 0,00048
   unidade, e um float que carrega o continente e a mesa do canto perde
   a mesa do canto na terceira casa decimal. Duas escalas separadas
   dizem a verdade nas duas pontas; uma escala só mente numa delas.

   ---------------- A GRADE É PARA SER LIDA ----------------

   O par (34,2 · 61,7) é exato e ninguém o lê. Por isso toda coordenada
   também sabe dizer a sua CASA na grade — "H13" —, e a grade não é nova:
   é a mesma malha de vinte por vinte que as células do ermo usam desde
   a v9.54. Uma grade nova seria uma segunda verdade sobre o mesmo chão.

   ---------------- O NORTE É PARA CIMA ----------------

   No SVG o `y` cresce para BAIXO, e a rosa dos ventos do pergaminho põe
   o N em cima desde a v9.55. Os rumos daqui obedecem a mesma convenção,
   e é obrigatório que obedeçam: se o mapa aponta para um lado e o texto
   para o outro, o jogador vê a contradição antes de ver qualquer coisa.

   ---------------- SEM POSIÇÃO É `null`, NUNCA O CENTRO ----------------

   `garantirCoord` devolve `null` para o que não tem posição. A tentação
   é devolver o meio do mapa, e o meio do mapa é uma mentira que ninguém
   percebe: põe um NPC de paradeiro desconhecido a uma distância exata
   de tudo. Vale aqui a régua do portão — na dúvida, não morde.
   ============================================================ */

import { KM_POR_UNIDADE } from "./geografia.js";
import { coordDaCelula } from "./celulas.js";

export const LADO_DO_MUNDO = 100;
export const METROS_POR_UNIDADE = KM_POR_UNIDADE * 1000;
/* marcha de gente com carga em terreno bom. É a mesma régua dos
   arredores, e agora é a ÚNICA: minutos a pé e distância no mapa
   passam a ser dois nomes do mesmo número. */
export const KMH_A_PE = 4;

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const preso = (v) => Math.max(0, Math.min(LADO_DO_MUNDO, v));

/* ---------------- A CATRACA ----------------
   Todo campo que um leitor daqui usa é normalizado aqui e entregue por
   quem chama. Sem `x` e `y` não há coordenada — e não há palpite. */
export function garantirCoord(c) {
  if (!c || typeof c !== "object") return null;
  if (!Number.isFinite(Number(c.x)) || !Number.isFinite(Number(c.y))) return null;
  return {
    x: preso(num(c.x)),
    y: preso(num(c.y)),
    z: num(c.z, 0),      // o eixo dos moldes que o declaram (a Torre, o Braço)
    mx: num(c.mx, 0),    // metros a leste do ponto (negativo é oeste)
    my: num(c.my, 0),    // metros ao sul do ponto (negativo é norte)
  };
}

/* Uma coordenada a partir de qualquer coisa que tenha x,y — uma cidade,
   um arredor, um ponto do mapa. Sem cópia de campo por campo em cinco
   módulos, que é como as duas verdades nascem. */
export function coordDe(fonte, extras = {}) {
  if (!fonte || typeof fonte !== "object") return null;
  return garantirCoord({ x: fonte.x, y: fonte.y, z: fonte.z, mx: fonte.mx, my: fonte.my, ...extras });
}

/* As duas escalas viram uma só na hora da conta, e só na hora da conta. */
const aplainar = (c) => ({ x: c.x + c.mx / METROS_POR_UNIDADE, y: c.y + c.my / METROS_POR_UNIDADE });

/* ---------------- DISTÂNCIA ----------------
   Plana, sempre. O `z` fica de fora de propósito: na Torre o andar já
   está codificado no `y`, e somar os dois contaria a mesma subida duas
   vezes. Quem tem eixo vertical fala em DEGRAU, não em quilômetro, e
   quem traduz isso é o Geógrafo. */
export function kmEntre(a, b) {
  const p = garantirCoord(a), q = garantirCoord(b);
  if (!p || !q) return null;
  const u = aplainar(p), v = aplainar(q);
  return Math.hypot(u.x - v.x, u.y - v.y) * KM_POR_UNIDADE;
}

/* ---------------- RUMO ----------------
   Zero é o norte, e o norte é para cima — a mesma convenção da rosa dos
   ventos do pergaminho e da recusa de nome cardeal fora de lugar. */
export const RUMOS = [
  { id: "norte",    curto: "N",  rotulo: "ao norte" },
  { id: "nordeste", curto: "NE", rotulo: "a nordeste" },
  { id: "leste",    curto: "L",  rotulo: "a leste" },
  { id: "sudeste",  curto: "SE", rotulo: "a sudeste" },
  { id: "sul",      curto: "S",  rotulo: "ao sul" },
  { id: "sudoeste", curto: "SO", rotulo: "a sudoeste" },
  { id: "oeste",    curto: "O",  rotulo: "a oeste" },
  { id: "noroeste", curto: "NO", rotulo: "a noroeste" },
];

export function grausEntre(a, b) {
  const p = garantirCoord(a), q = garantirCoord(b);
  if (!p || !q) return null;
  const u = aplainar(p), v = aplainar(q);
  const dx = v.x - u.x, dy = v.y - u.y;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;   // o mesmo ponto não tem rumo
  return (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
}

export function rumoEntre(a, b) {
  const g = grausEntre(a, b);
  if (g == null) return null;
  return { ...RUMOS[Math.round(g / 45) % 8], graus: Math.round(g) };
}

/* Andar `km` numa direção. É a única porta para "ponha um ponto a tantos
   quilômetros daqui, naquele lado" — os arredores nascem por aqui. */
export function deslocar(c, graus, km) {
  const p = garantirCoord(c);
  if (!p) return null;
  const r = num(graus) * Math.PI / 180;
  const u = num(km) / KM_POR_UNIDADE;
  return garantirCoord({ ...p, x: p.x + Math.sin(r) * u, y: p.y - Math.cos(r) * u });
}

/* ---------------- A GRADE QUE SE LÊ ----------------
   Vinte por vinte, a mesma malha das células do ermo. Letra na
   horizontal, número na vertical — como todo mapa de papel. */
export const LETRAS_DA_GRADE = "ABCDEFGHIJKLMNOPQRST";

export function gradeDe(c) {
  const p = garantirCoord(c);
  if (!p) return "";
  const { cx, cy } = coordDaCelula(p.x, p.y);
  return `${LETRAS_DA_GRADE[cx] || "?"}${cy + 1}`;
}

/* ---------------- O PÉ E O RELÓGIO ----------------
   Uma caminhada de quarenta e cinco minutos são três quilômetros, e
   três quilômetros são 0,12 unidade do pergaminho. Enquanto essas três
   frases moravam em três módulos, elas discordavam. */
export function kmAPe(minutos) { return Math.max(0, num(minutos)) / 60 * KMH_A_PE; }
export function minutosAPe(km) { return Math.round(Math.max(0, num(km)) / KMH_A_PE * 60); }
export function unidadesAPe(minutos) { return kmAPe(minutos) / KM_POR_UNIDADE; }

/* Quanto tempo de pé, escrito. É a única forma desta frase no jogo: os
   arredores diziam a mesma coisa com o mesmo arredondamento num
   `tempoDeIda` próprio, e duas formatações da mesma verdade é meio
   caminho para duas verdades. */
export function aPeEmTexto(minutos) {
  const m = Math.max(1, Math.round(num(minutos)));
  if (m < 60) return `${m} min a pé`;
  const h = m / 60;
  return `${(h < 10 ? h.toFixed(1) : String(Math.round(h))).replace(".0", "").replace(".", ",")} h a pé`;
}

/* ---------------- COMO SE ESCREVE ----------------
   Abaixo de um quilômetro a conta é em metros, porque "0,3 km" é a
   forma de não dizer trezentos metros. */
export function formatarDistancia(km) {
  const k = num(km, -1);
  if (k < 0) return "";
  if (k < 1) return `${Math.round(k * 1000 / 10) * 10} m`;
  if (k < 10) return `${k.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(k)} km`;
}

export function formatarCoord(c) {
  const p = garantirCoord(c);
  if (!p) return "";
  const f = (v) => v.toFixed(1).replace(".", ",");
  return `${f(p.x)} · ${f(p.y)}`;
}

/* O endereço completo: a casa da grade e o par exato. É esta linha que
   o Mestre recebe todo turno, e é ela que o jogador vê no mapa. */
export function enderecoDe(c, { z = false } = {}) {
  const p = garantirCoord(c);
  if (!p) return "";
  const local = (p.mx || p.my) ? ` (${Math.round(Math.hypot(p.mx, p.my))} m do centro)` : "";
  return `${gradeDe(p)} ${formatarCoord(p)}${z && p.z ? ` · nível ${p.z}` : ""}${local}`;
}

/* ---------------- O QUE ESTÁ PERTO ----------------
   Recebe pontos já com coordenada e devolve os mais próximos com a
   distância e o rumo prontos. Genérica de propósito: quem sabe o que é
   uma cidade, um arredor ou uma pessoa é quem chama. */
export function maisPertoDe(coord, pontos = [], { raioKm = Infinity, quantos = 4, exceto = "" } = {}) {
  const p = garantirCoord(coord);
  if (!p) return [];
  const fora = String(exceto || "").toLowerCase();
  const out = [];
  for (const it of pontos || []) {
    if (!it || !it.nome) continue;
    if (fora && String(it.nome).toLowerCase() === fora) continue;
    const q = garantirCoord(it.coord || it);
    if (!q) continue;
    const km = kmEntre(p, q);
    if (km == null || km > raioKm) continue;
    out.push({ ...it, coord: q, km, rumo: rumoEntre(p, q) });
  }
  return out.sort((a, b) => a.km - b.km).slice(0, Math.max(0, quantos));
}

/* Uma linha por ponto, do jeito que o Mestre lê: nome, rumo, distância — e
   o tempo de pé quando ele significa alguma coisa. Acima de quinze
   quilômetros ninguém vai andando, e "trinta e sete horas a pé" é uma
   conta certa que informa menos do que "cento e quarenta quilômetros". */
export const KM_ATE_ONDE_SE_VAI_A_PE = 15;

export function linhaDePonto(p) {
  if (!p || !p.nome) return "";
  const r = p.rumo ? `${p.rumo.rotulo}, ` : "";
  const pe = p.km <= KM_ATE_ONDE_SE_VAI_A_PE ? `, ${aPeEmTexto(minutosAPe(p.km))}` : "";
  return `${p.nome} (${r}${formatarDistancia(p.km)}${pe})`;
}
