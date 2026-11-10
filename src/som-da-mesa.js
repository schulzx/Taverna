/* ============================================================
   O SOM DA MESA (TE · decisão da pessoa, 09/11/2026) — formas.md §TE 9

   «Temos que usar todos os sentidos pra prender o player.» A pessoa disse
   sim ao som, ligado por omissão e em volume baixo, com o interruptor à
   vista no menu. Começa em TRÊS momentos só, e mais só depois de ouvido:

     1. a carta que vira — uma nota pentatónica por raridade, mais rica
        (mais camadas, cauda mais longa) quanto mais rara;
     2. o dado que pousa — duas batidas de madeira, a segunda mais fraca;
     3. o artefacto que desperta — um sino grave.

   SINTETIZADO por Web Audio: zero ficheiros, zero KB a descarregar, e
   todo número numa tabela (SOM_DA_MESA), como o resto da casa.

   AS LEIS DESTE MÓDULO:
   · o contexto de áudio só nasce no PRIMEIRO GESTO do jogador (a política
     de autoplay dos navegadores): antes dele, tocar é calar;
   · desligado na preferência, nada soa — nem o contexto nasce;
   · com prefers-reduced-motion o som FICA: reduzir movimento não é pedir
     silêncio (por isso este módulo nunca pergunta pelo movimento);
   · um som que estoura cala-se: toda função devolve true (soou) ou false
     (calou) e nunca lança. Em Node não há AudioContext, e calar é a regra;
   · todo o som repete o que a tela já mostra: sem ele, nada se perde.

   A preferência guarda-se como as outras da casa (taverna_cfg_rolagens,
   taverna_cfg_golpe_final): «1» ou «0» no localStorage, e a ausência é o
   valor por omissão. Quem a mostra é o InterruptorDoSom (ui.jsx).
   ============================================================ */

export const SOM_DA_MESA = Object.freeze({
  chave: "taverna_cfg_som",
  porOmissao: true,
  /* volume baixo: o teto de tudo o que soa, em dB (−18 ≈ 0,126 de ganho);
     as camadas de um som dividem este teto entre si, nunca o somam */
  volumeDb: -18,
  ataque: 0.008,                 /* s até ao pico: sem estalido */
  silencio: 0.0001,              /* o fundo da curva exponencial (não pode ser 0) */
  folga: 0.02,                   /* s depois da cauda até o oscilador parar */
  gestos: Object.freeze(["pointerdown", "keydown", "touchstart"]),
  /* A CARTA: a pentatónica de Dó a partir de Dó5 (Dó Ré Mi Sol Lá Dó), um
     degrau por raridade; `camadas` são múltiplos da nota (a riqueza), e a
     camada i soa a 1/(i+1) do pico. O lendário é a oitava com a quinta; a
     relíquia, o acorde maior com cauda de 1,2 s. */
  carta: Object.freeze({
    comum: Object.freeze({ nota: 523.25, camadas: Object.freeze([1]), dura: 0.22, onda: "sine" }),
    incomum: Object.freeze({ nota: 587.33, camadas: Object.freeze([1, 2]), dura: 0.3, onda: "sine" }),
    raro: Object.freeze({ nota: 659.25, camadas: Object.freeze([1, 2, 3]), dura: 0.45, onda: "sine" }),
    epico: Object.freeze({ nota: 783.99, camadas: Object.freeze([1, 2, 3, 4]), dura: 0.6, onda: "sine" }),
    lendario: Object.freeze({ nota: 880, camadas: Object.freeze([1, 1.5, 2, 3]), dura: 0.9, onda: "triangle" }),
    unico: Object.freeze({ nota: 1046.5, camadas: Object.freeze([1, 1.25, 1.5, 2]), dura: 1.2, onda: "triangle" }),
  }),
  /* O DADO: cada batida é um triângulo que cai de `de` a `ate` Hz em `dura`
     segundos (a madeira); a segunda, `em` segundos depois, é o ressalto */
  dado: Object.freeze({
    batidas: Object.freeze([Object.freeze({ em: 0, ganho: 1 }), Object.freeze({ em: 0.09, ganho: 0.45 })]),
    de: 260, ate: 90, dura: 0.07, onda: "triangle",
  }),
  /* O DESPERTAR: um sino grave (Sol3), parciais inarmónicos de sino */
  despertar: Object.freeze({
    nota: 196, parciais: Object.freeze([1, 2.76, 5.4]), ganhos: Object.freeze([1, 0.5, 0.25]), dura: 0.9, onda: "sine",
  }),
  /* A LUTA (CB7, 09/11 — formas.md §CB 5 e §CB 12). Cada momento é uma
     lista de vozes: `em` (s depois do toque), `freq` → `ate` Hz (a queda do
     tom; sem `ate`, fixo), `onda`, `dura`, e `ganho` — o peso da voz no
     momento. Os ganhos de um momento DIVIDEM o teto do volume entre si, como
     as camadas da carta: nenhum momento soa mais alto que o teto.
       golpe   — o acerto: uma pancada surda (o triângulo que cai, e o grave
                 por baixo);
       critico — o golpe e um sino curto por cima (parciais de sino, Dó6);
       erro    — o ar cortado: um sopro agudo que desce depressa;
       queda   — o abate: grave e longo;
       entrada — o tambor da entrada na mesa (§CB 7): três batidas;
       imune   — o erro com um tinido metálico.
     Nenhum dura mais que a queda (0,7 s), e o golpe e o erro cabem nos
     380 ms do golpe sentido. */
  luta: Object.freeze({
    golpe: Object.freeze([
      Object.freeze({ em: 0, freq: 180, ate: 70, onda: "triangle", dura: 0.12, ganho: 1 }),
      Object.freeze({ em: 0, freq: 90, ate: 50, onda: "sine", dura: 0.16, ganho: 0.6 }),
    ]),
    critico: Object.freeze([
      Object.freeze({ em: 0, freq: 180, ate: 70, onda: "triangle", dura: 0.12, ganho: 1 }),
      Object.freeze({ em: 0, freq: 90, ate: 50, onda: "sine", dura: 0.16, ganho: 0.6 }),
      Object.freeze({ em: 0.03, freq: 1046.5, onda: "sine", dura: 0.35, ganho: 0.5 }),
      Object.freeze({ em: 0.03, freq: 1046.5 * 2.76, onda: "sine", dura: 0.25, ganho: 0.2 }),
    ]),
    erro: Object.freeze([
      Object.freeze({ em: 0, freq: 900, ate: 300, onda: "sine", dura: 0.12, ganho: 1 }),
    ]),
    queda: Object.freeze([
      Object.freeze({ em: 0, freq: 110, ate: 45, onda: "sine", dura: 0.7, ganho: 1 }),
      Object.freeze({ em: 0.02, freq: 55, onda: "triangle", dura: 0.6, ganho: 0.5 }),
    ]),
    entrada: Object.freeze([
      Object.freeze({ em: 0, freq: 120, ate: 60, onda: "triangle", dura: 0.14, ganho: 1 }),
      Object.freeze({ em: 0.18, freq: 120, ate: 60, onda: "triangle", dura: 0.14, ganho: 0.7 }),
      Object.freeze({ em: 0.36, freq: 110, ate: 50, onda: "triangle", dura: 0.22, ganho: 1 }),
    ]),
    /* reacao — o chão que reage (CB15, 10/11: a explosão do óleo, a água
       que eletrifica): o estalo agudo que cai e o ronco grave por baixo.
       Mais curto que a queda: a queda continua a ser o som mais longo. */
    reacao: Object.freeze([
      Object.freeze({ em: 0, freq: 1400, ate: 200, onda: "sawtooth", dura: 0.1, ganho: 0.5 }),
      Object.freeze({ em: 0.02, freq: 80, ate: 40, onda: "sine", dura: 0.5, ganho: 1 }),
    ]),
    imune: Object.freeze([
      Object.freeze({ em: 0, freq: 900, ate: 300, onda: "sine", dura: 0.12, ganho: 1 }),
      Object.freeze({ em: 0.02, freq: 2093, onda: "sine", dura: 0.18, ganho: 0.4 }),
      Object.freeze({ em: 0.02, freq: 2093 * 2.4, onda: "sine", dura: 0.12, ganho: 0.2 }),
    ]),
  }),
  /* o desfecho do evento do golpe (`EVENTO_DO_GOLPE`, combate.js) → o
     momento; o abate manda sobre o desfecho; o impedido cala (não houve golpe) */
  somDoDesfecho: Object.freeze({ critico: "critico", acerto: "golpe", erro: "erro", imune: "imune", impedido: null, abate: "queda" }),
  /* o que o interruptor diz (ui.jsx). CB lote 2 (10/11): desde a CB7 o som
     soa também na luta (o golpe, o crítico, o erro, a queda, o tambor da
     entrada), e o interruptor calava-o — quem o desligava não sabia que
     desligava a luta. A frase diz agora o que de facto cala. */
  palavras: Object.freeze({
    rotulo: "Som da mesa", sim: "sim", nao: "não",
    diz: "a carta que vira, o dado que pousa, a arma que desperta, o golpe que acerta e quem cai",
  }),
});

const S = SOM_DA_MESA;
const G = () => globalThis;
let contexto = null;
let houveGesto = false;
let armado = false;

/* o ganho do teto: −18 dB → 0,126 */
const tetoDoVolume = () => Math.pow(10, S.volumeDb / 20);

/* A PREFERÊNCIA — «1» ligado, «0» desligado, ausente = por omissão. Nunca lança. */
export function somLigado() {
  try {
    const ls = G().localStorage;
    const v = ls && typeof ls.getItem === "function" ? ls.getItem(S.chave) : null;
    return v == null ? S.porOmissao : v === "1";
  } catch (e) { return S.porOmissao; }
}

/* liga ou desliga, e guarda. Ligar depois de um gesto acorda o contexto
   (o clique no interruptor é ele mesmo um gesto). Devolve o que ficou. */
export function ligarSom(ligado) {
  const v = !!ligado;
  try { const ls = G().localStorage; if (ls && typeof ls.setItem === "function") ls.setItem(S.chave, v ? "1" : "0"); } catch (e) { /* sem guardar, segue */ }
  if (v && houveGesto) acordar();
  return v;
}

/* o contexto nasce (ou retoma) — só chamado depois de um gesto */
function acordar() {
  try {
    if (contexto) {
      if (contexto.state === "suspended" && typeof contexto.resume === "function") contexto.resume();
      return contexto;
    }
    const Ctx = G().AudioContext || G().webkitAudioContext;
    if (typeof Ctx !== "function") return null;
    contexto = new Ctx();
    return contexto;
  } catch (e) { contexto = null; return null; }
}

/* O PRIMEIRO GESTO: a escuta arma-se uma vez, ao carregar, onde há janela */
function aoGesto() {
  houveGesto = true;
  if (somLigado()) acordar();
}
function armar() {
  if (armado) return;
  try {
    const g = G();
    if (typeof g.addEventListener !== "function") return;
    for (const ev of S.gestos) g.addEventListener(ev, aoGesto, { capture: true, passive: true });
    armado = true;
  } catch (e) { /* sem escuta, o userActivation ainda vale */ }
}
armar();

/* já houve gesto? A escuta, ou o navegador que o sabe (userActivation) */
function jaHouveGesto() {
  if (houveGesto) return true;
  try {
    const ua = G().navigator && G().navigator.userActivation;
    if (ua && ua.hasBeenActive) houveGesto = true;
  } catch (e) { /* segue calado */ }
  return houveGesto;
}

/* uma voz: o oscilador com o envelope (ataque curto, cauda exponencial) */
function voz(c, { freq, freqFim = null, onda, inicio, dura, pico }) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = onda;
  o.frequency.setValueAtTime(freq, inicio);
  if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, inicio + dura);
  g.gain.setValueAtTime(0, inicio);
  g.gain.linearRampToValueAtTime(Math.max(pico, S.silencio * 2), inicio + S.ataque);
  g.gain.exponentialRampToValueAtTime(S.silencio, inicio + dura);
  o.connect(g);
  g.connect(c.destination);
  o.start(inicio);
  o.stop(inicio + dura + S.folga);
}

/* tocar = preferência ligada + gesto + contexto; senão, calar. Nunca lança. */
function tocar(fazer) {
  try {
    if (!somLigado() || !jaHouveGesto()) return false;
    const c = acordar();
    if (!c) return false;
    fazer(c, Number(c.currentTime) || 0);
    return true;
  } catch (e) { return false; }
}

/* os picos das camadas: 1/(i+1), normalizados para somarem o teto */
function picos(n, teto) {
  const pesos = Array.from({ length: n }, (_, i) => 1 / (i + 1));
  const soma = pesos.reduce((a, b) => a + b, 0) || 1;
  return pesos.map((p) => (teto * p) / soma);
}

/* 1. A CARTA QUE VIRA — a nota da raridade (comum … unico); raridade
   desconhecida cala */
export function tocarCarta(raridade) {
  const n = S.carta[raridade];
  if (!n) return false;
  return tocar((c, t) => {
    const ps = picos(n.camadas.length, tetoDoVolume());
    n.camadas.forEach((k, i) => voz(c, { freq: n.nota * k, onda: n.onda, inicio: t, dura: n.dura, pico: ps[i] }));
  });
}

/* 2. O DADO QUE POUSA — as batidas de madeira */
export function tocarDado() {
  const d = S.dado;
  return tocar((c, t) => {
    const teto = tetoDoVolume();
    for (const b of d.batidas) voz(c, { freq: d.de, freqFim: d.ate, onda: d.onda, inicio: t + b.em, dura: d.dura, pico: teto * b.ganho });
  });
}

/* 4. A LUTA — um momento da tabela `luta`, pelo nome; nome desconhecido
   cala. As vozes dividem o teto pelos seus ganhos. */
export function tocarDaLuta(momento) {
  const vozes = Object.prototype.hasOwnProperty.call(S.luta, momento) ? S.luta[momento] : null;
  if (!vozes) return false;
  return tocar((c, t) => {
    const soma = vozes.reduce((a, v) => a + v.ganho, 0) || 1;
    for (const v of vozes) voz(c, { freq: v.freq, freqFim: v.ate || null, onda: v.onda, inicio: t + v.em, dura: v.dura, pico: (tetoDoVolume() * v.ganho) / soma });
  });
}

/* O golpe sentido: o som que o evento do golpe pede (`eventoDoGolpe`,
   combate.js). O abate soa a queda; o resto, pelo desfecho; o impedido e o
   lixo calam. */
export function tocarGolpe(evento) {
  const e = evento && typeof evento === "object" ? evento : null;
  if (!e) return false;
  const momento = e.abate === true ? S.somDoDesfecho.abate : S.somDoDesfecho[e.desfecho];
  return momento ? tocarDaLuta(momento) : false;
}

/* O tambor da entrada na mesa (§CB 7). */
export function tocarEntrada() { return tocarDaLuta("entrada"); }

/* 3. O ARTEFACTO QUE DESPERTA — o sino grave */
export function tocarDespertar() {
  const s = S.despertar;
  return tocar((c, t) => {
    const soma = s.ganhos.reduce((a, b) => a + b, 0) || 1;
    s.parciais.forEach((k, i) => voz(c, { freq: s.nota * k, onda: s.onda, inicio: t, dura: s.dura, pico: (tetoDoVolume() * (s.ganhos[i] || 0)) / soma }));
  });
}
