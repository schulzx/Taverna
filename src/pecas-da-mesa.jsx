/* ============================================================
   AS PEÇAS DA MESA DO MESTRE (V1 · F1 · 15/11/2026)

   formas.md §«A Mesa do Mestre · F1» §4 e mente/lancamento/figma/F1-pecas.png.
   «Se não poderia estar em cima de uma mesa, não aparece na tela.»

   Cada peça é pura de props: desenha o que recebe e o que
   mesa-do-mestre.js decide (quantos discos, a altura da vela, o estado da
   carta, o contorno do lacre). As medidas saem de PECAS_DA_MESA, as cores
   de T, as sombras de SOMBRA_DA_MESA e a letra de ESCALA_DA_MESA — nenhum
   número solto aqui.

   A LETRA: toda peça escreve o tamanho como
   max(piso, corpo × var(--tv-texto)) — o multiplicador do escudo vale
   sobre a escala inteira e o piso vale depois dele (12; 13 para nome).

   O MOVIMENTO: entra por Web Animations no efeito (o HTML do servidor já
   nasce no estado final) e NÃO corre com prefers-reduced-motion. Tocar
   não espera animação nenhuma: nada aqui segura o turno.

   Desde o V4 (16/11) pousam na tela principal (painel-mesa.jsx). Leitores:
   a mesa cheia, o relato (a nota e o lacre), o escudo e teste-pecas-da-mesa.
   ============================================================ */
import React from "react";
import { T, PECAS_DA_MESA, SOMBRA_DA_MESA, ESCALA_DA_MESA, PISOS_DA_MESA, TAMANHO_DO_TEXTO, VELA, alfa } from "./estilo.js";
import { letraDaMesa, pilhasDoRecurso, alturaDaVela, vigiliasQueFaltam, rotuloDaVela, contasAcesas, estadoDaCarta, contornoDoLacre } from "./mesa-do-mestre.js";
import { DesenhoDoObjeto } from "./painel-mesa-do-mestre.jsx";

const P = PECAS_DA_MESA;
const M = P.movimento;

/* a letra de um estilo da escala, com o multiplicador e o piso — mora em
   mesa-do-mestre.js desde V5 (a chegada usa-a sem carregar as peças); daqui
   continua a sair para quem já a lia */
export { letraDaMesa };

/* prefers-reduced-motion, lido na hora (nunca lança; no servidor é «parado») */
function poucoMovimento() {
  try { return !(typeof window !== "undefined" && window.matchMedia) || window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; }
}
/* uma entrada por Web Animations, só com movimento permitido */
function useEntrada(ref, quadros, opcoes, chave) {
  React.useEffect(() => {
    try {
      const el = ref.current;
      if (!el || !el.animate || !quadros.length || poucoMovimento()) return undefined;
      const a = el.animate(quadros, opcoes);
      return () => { try { a.cancel(); } catch (e) { /* segue */ } };
    } catch (e) { return undefined; }
  }, [chave]); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ============================================================
   A NOTA DO MESTRE — a voz do sistema, à margem, na letra dele.
   Sai a caixa escura e a mono. A frase já diz o tipo; a cor do traço só
   confirma (musgo · brasa · perigo).
   ============================================================ */
export function NotaDoMestre({ tipo = "regra", children }) {
  const ref = React.useRef(null);
  const cor = P.nota.cores[tipo] || P.nota.cores.regra;
  useEntrada(ref, [{ opacity: 0, transform: `translateY(${M.entraNota}px)` }, { opacity: 1, transform: "none" }], { duration: M.nota, easing: "ease-out" }, String(children));
  return (
    <p ref={ref} role="note" data-tipo={tipo} className="flex items-start" style={{ gap: P.nota.folga, margin: 0, color: P.nota.tinta, ...letraDaMesa("notaDoMestre") }}>
      <svg aria-hidden="true" width={P.nota.traco.largura} height={P.nota.traco.alto} viewBox="0 0 18 20" style={{ flex: "none" }}>
        <path d="M2 12c3-4 5-4 7-1s4 3 7-2" stroke={cor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

/* ============================================================
   O LACRE — o selo de cera que o Mestre bate na página. Só pousa em papel
   (no feltro mede 1,67:1). G 96 · M 56 · P 32; quest (estrela), nível
   (número em Spectral Bold), conquista (coroa).
   ============================================================ */
export function Lacre({ tamanho = "M", tipo = "quest", numero = null, rotulo = "", bate = false }) {
  const ref = React.useRef(null);
  const lado = P.lacre.tamanhos[tamanho] || P.lacre.tamanhos.M;
  const r = lado / 2;
  useEntrada(ref, bate ? [{ transform: `scale(${M.lacreEscala})`, opacity: 0 }, { transform: "scale(1)", opacity: 1 }] : [], { duration: M.lacreDesce, easing: "cubic-bezier(.2,.9,.3,1.2)" }, bate ? "bate" : "quieto");
  const padrao = tipo === "nivel" ? `Selo: nível ${numero == null ? "" : numero}`.trim() : tipo === "conquista" ? "Selo: conquista" : "Selo: quest cumprida";
  const miolo = r * P.lacre.aroInterno;
  const imp = T.lataoLume;
  const marca = tipo === "nivel"
    ? <text x={r} y={r} textAnchor="middle" dominantBaseline="central" fill={imp} style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: ESCALA_DA_MESA.numeroDoLacre.peso, fontSize: Math.round(lado * 0.42) }}>{numero == null ? "" : numero}</text>
    : tipo === "conquista"
      ? <path d={`M${r - miolo * 0.6} ${r + miolo * 0.35} L${r - miolo * 0.6} ${r - miolo * 0.3} L${r - miolo * 0.3} ${r} L${r} ${r - miolo * 0.45} L${r + miolo * 0.3} ${r} L${r + miolo * 0.6} ${r - miolo * 0.3} L${r + miolo * 0.6} ${r + miolo * 0.35} Z`} fill={imp} />
      : <path d={estrela(r, r, miolo * 0.62, miolo * 0.26)} fill={imp} />;
  return (
    <span ref={ref} role="img" aria-label={rotulo || padrao} data-tamanho={tamanho} className="inline-block" style={{ width: lado, height: lado, borderRadius: "50%", boxShadow: SOMBRA_DA_MESA.peca }}>
      <svg aria-hidden="true" width={lado} height={lado} viewBox={`0 0 ${lado} ${lado}`}>
        <path d={contornoDoLacre(lado)} fill={T.lacre} stroke={T.lacreSombra} strokeWidth={lado > 40 ? 2 : 1} />
        <circle cx={r} cy={r} r={miolo} fill="none" stroke={T.lacreLume} strokeOpacity="0.55" strokeWidth={lado > 40 ? 2 : 1} />
        {marca}
      </svg>
    </span>
  );
}
function estrela(cx, cy, fora, dentro) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? dentro : fora;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }
  return d + "Z";
}

/* ============================================================
   A PEÇA DE RECURSO — a pilha que se conta olhando. Um disco, uma
   unidade (moedas: dez); passou de dez nasce a pilha seguinte. O número
   escrito diz a verdade inteira.
   ============================================================ */
const NOME_DO_RECURSO = { racoes: ["ração", "rações"], agua: ["água", "água"], tochas: ["tocha", "tochas"], moedas: ["moeda", "moedas"] };
export function PecaDeRecurso({ tipo = "racoes", quantidade = 0, nome = null }) {
  const R = P.recurso;
  const conta = pilhasDoRecurso(tipo, quantidade);
  const [um, varios] = NOME_DO_RECURSO[tipo] || [tipo, tipo];
  const palavra = nome || (conta.quantidade === 1 ? um : varios);
  const metal = tipo === "moedas";
  const corpo = metal ? T.latao : T.osso;
  const lado = metal ? T.lataoSombra : T.ossoSombra;
  const topo = metal ? T.lataoLume : T.ossoLume;
  const altoDasPilhas = R.disco.alto + R.passo * (R.porPilha - 1);
  const passoX = conta.pilhas.length > 1 ? (R.alvo.largura - R.disco.largura) / (conta.pilhas.length - 1) : 0;
  return (
    <div role="img" aria-label={`${conta.quantidade} ${palavra}`} data-recurso={tipo} data-discos={conta.discos}
      className="inline-flex flex-col items-center" style={{ width: R.alvo.largura, minHeight: R.alvo.alto }}>
      <svg aria-hidden="true" width={R.alvo.largura} height={altoDasPilhas + 2} viewBox={`0 0 ${R.alvo.largura} ${altoDasPilhas + 2}`}>
        {conta.pilhas.map((n, k) => {
          const x = conta.pilhas.length > 1 ? k * passoX : (R.alvo.largura - R.disco.largura) / 2;
          return Array.from({ length: n }, (_, i) => {
            const y = altoDasPilhas - R.disco.alto - i * R.passo;
            return (
              <g key={`${k}-${i}`}>
                <rect x={x} y={y + R.disco.alto / 2 - 1} width={R.disco.largura} height={R.passo + 1} fill={lado} />
                <ellipse cx={x + R.disco.largura / 2} cy={y + R.disco.alto / 2 + R.passo / 2} rx={R.disco.largura / 2} ry={R.disco.alto / 2} fill={lado} />
                <ellipse cx={x + R.disco.largura / 2} cy={y + R.disco.alto / 2} rx={R.disco.largura / 2} ry={R.disco.alto / 2} fill={i === n - 1 ? topo : corpo} stroke={lado} strokeWidth="0.8" />
              </g>
            );
          });
        })}
      </svg>
      <span style={{ color: T.ink, ...letraDaMesa("contagem") }}>{conta.quantidade}</span>
      <span style={{ color: T.inkMeio, ...letraDaMesa("servico") }}>{palavra}</span>
    </div>
  );
}

/* ============================================================
   A VELA-RELÓGIO — a altura é a hora; as marcas são as vigílias que
   faltam. A chama tremula (1800 ms) e o halo respira (2300 ms); com
   prefers-reduced-motion, parada e halo fixo.
   ============================================================ */
export function VelaRelogio({ hora = 12 }) {
  const V = P.vela;
  const chama = React.useRef(null);
  const halo = React.useRef(null);
  const uid = "vr" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  React.useEffect(() => {
    if (poucoMovimento()) return undefined;
    const vivas = [];
    try {
      if (chama.current && chama.current.animate) vivas.push(chama.current.animate([{ transform: "scale(1,1)" }, { transform: "scale(.92,1.08)" }, { transform: "scale(1.04,.96)" }, { transform: "scale(1,1)" }], { duration: M.chama, iterations: Infinity }));
      if (halo.current && halo.current.animate) vivas.push(halo.current.animate([{ opacity: 1 }, { opacity: 0.8 }, { opacity: 1 }], { duration: M.halo, iterations: Infinity }));
    } catch (e) { /* segue parada */ }
    return () => vivas.forEach((a) => { try { a.cancel(); } catch (e) { /* segue */ } });
  }, []);
  const alto = alturaDaVela(hora);
  const W = V.caixa.largura;
  const desenho = V.caixa.alto - 24;          /* 24 de rótulo por baixo */
  const chao = desenho - V.prato.alto / 2;
  const topo = chao - alto;
  const cx = W / 2;
  const faltam = vigiliasQueFaltam(hora);
  const rotulo = rotuloDaVela(hora);
  return (
    <div role="img" aria-label={`A vela: ${rotulo}`} data-altura={Math.round(alto)} className="inline-flex flex-col items-center" style={{ width: W, height: V.caixa.alto }}>
      <svg aria-hidden="true" width={W} height={desenho} viewBox={`0 0 ${W} ${desenho}`}>
        <defs>
          <radialGradient id={`${uid}-h`}><stop offset="0" stopColor={T.haloDaVela} stopOpacity="0.45" /><stop offset="1" stopColor={T.haloDaVela} stopOpacity="0" /></radialGradient>
        </defs>
        <circle ref={halo} cx={cx} cy={topo - 10} r={34} fill={`url(#${uid}-h)`} />
        <ellipse cx={cx} cy={chao} rx={V.prato.largura / 2} ry={V.prato.alto / 2} fill={T.latao} stroke={T.lataoSombra} />
        <rect x={cx - V.cera / 2} y={topo} width={V.cera} height={alto} rx="2" fill={VELA.cor.cera} stroke={VELA.cor.ceraSombra} />
        {Array.from({ length: faltam }, (_, i) => {
          const y = chao - ((i + 1) * (V.curso / V.vigilias)) + V.base;
          return y > topo + 3 ? <line key={i} x1={cx - V.cera / 2 + 3} x2={cx + V.cera / 2 - 3} y1={y} y2={y} stroke={VELA.cor.ceraSombra} strokeWidth="1" /> : null;
        })}
        <line x1={cx} x2={cx} y1={topo} y2={topo - 4} stroke={VELA.cor.pavio} strokeWidth="1.4" />
        <g ref={chama} style={{ transformOrigin: `${cx}px ${topo - 4}px`, transformBox: "view-box" }}>
          <ellipse cx={cx} cy={topo - 11} rx="4" ry="8" fill={VELA.cor.chama} />
          <ellipse cx={cx} cy={topo - 9} rx="2" ry="4.5" fill={VELA.cor.nucleo} />
        </g>
      </svg>
      <span style={{ color: T.inkMeio, ...letraDaMesa("rotulo") }}>{rotulo}</span>
    </div>
  );
}

/* ============================================================
   A CARTA DE PÉ — o retrato do grupo a 140 px, com a vida e a magia como
   contas no pé (redondas e losangos). Repouso (aro latão) · a vez (âmbar,
   sobe 6) · ferido (lacreLume) · caído (sem cor, «ainda respira»).
   ============================================================ */
const ARO_DA_CARTA = { repouso: T.latao, vez: T.amber, ferido: T.lacreLume, caido: T.ossoSombra };
const PALAVRA_DO_ESTADO = { repouso: "", vez: ", é a vez dele", ferido: ", ferido", caido: ", caído — ainda respira" };
export function CartaDePe({ nome = "", legenda = "", retrato = null, vida = 0, vidaMax = 0, mana = 0, manaMax = 0, vez = false, aoTocar = null }) {
  const C = P.carta;
  const estado = estadoDaCarta({ vida, vidaMax, vez });
  const pv = contasAcesas(vida, vidaMax);
  const pm = contasAcesas(mana, manaMax);
  const [subiu, setSubiu] = React.useState(false);
  React.useEffect(() => { setSubiu(estado === "vez" && !poucoMovimento()); }, [estado]);
  const rotulo = `${nome}: ${vida} de ${vidaMax} de vida${manaMax ? `, ${mana} de ${manaMax} de magia` : ""}${PALAVRA_DO_ESTADO[estado]}`;
  const Casca = aoTocar ? "button" : "div";
  const casca = aoTocar ? { type: "button", onClick: aoTocar, className: "tv-anel-foco" } : { role: "img" };
  const contas = (n, acesa, apagada, forma) => (
    <svg aria-hidden="true" width={C.contas * (C.conta + 2)} height={C.conta + 2} viewBox={`0 0 ${C.contas * (C.conta + 2)} ${C.conta + 2}`}>
      {Array.from({ length: C.contas }, (_, i) => {
        const x = i * (C.conta + 2) + (C.conta + 2) / 2, y = (C.conta + 2) / 2, cor = i < n ? acesa : apagada;
        return forma === "losango"
          ? <path key={i} d={`M${x} ${y - C.losango / 2}L${x + C.losango / 2} ${y}L${x} ${y + C.losango / 2}L${x - C.losango / 2} ${y}Z`} fill={cor} />
          : <circle key={i} cx={x} cy={y} r={C.conta / 2} fill={cor} />;
      })}
    </svg>
  );
  return (
    <Casca {...casca} aria-label={rotulo} data-estado={estado}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", width: C.alvo.largura, minHeight: C.alvo.alto, padding: 0, background: "transparent", border: 0, cursor: aoTocar ? "pointer" : "default",
        transform: subiu ? `translateY(-${M.sobe}px)` : "none", transition: `transform ${M.vez}ms ease-out` }}>
      <span style={{ position: "relative", display: "block", width: C.largura, height: C.alto, borderRadius: C.raio, border: `${C.aro}px solid ${ARO_DA_CARTA[estado]}`, overflow: "hidden", background: T.couroBaixo, boxShadow: SOMBRA_DA_MESA.pousado, filter: estado === "caido" ? "grayscale(1) brightness(.7)" : "none" }}>
        {retrato ? <img src={retrato} alt="" draggable="false" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
        <span aria-hidden="true" style={{ position: "absolute", inset: C.fio - C.aro, borderRadius: C.raio - 2, border: `1px solid ${alfa(T.lataoLume, 0.4)}`, pointerEvents: "none" }} />
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 6px 6px", textAlign: "center", background: `linear-gradient(to top, ${T.couroBaixo}, ${alfa(T.couroBaixo, 0)})` }}>
          <span style={{ display: "block", color: T.ink, ...letraDaMesa("nome") }}>{nome}</span>
          {legenda ? <span style={{ display: "block", color: T.inkMeio, ...letraDaMesa("servico"), textTransform: "none" }}>{legenda}</span> : null}
        </span>
      </span>
      <span style={{ marginTop: 8, width: C.pe.largura, minHeight: C.pe.alto, borderRadius: 4, background: T.couroBaixo, border: `1px solid ${alfa(T.latao, 0.5)}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, padding: "4px 6px", boxShadow: SOMBRA_DA_MESA.peca }}>
        <span className="flex items-center justify-between" style={{ gap: 4 }}>{contas(pv, T.lacreLume, T.lacreSombra, "conta")}<span style={{ color: T.ink, ...letraDaMesa("rotulo") }}>{vida}</span></span>
        {manaMax ? <span className="flex items-center justify-between" style={{ gap: 4 }}>{contas(pm, T.violet, T.violetaSombra, "losango")}<span style={{ color: T.ink, ...letraDaMesa("rotulo") }}>{mana}</span></span> : null}
      </span>
    </Casca>
  );
}

/* ============================================================
   A ESTAMPA — a cena do lugar no alto da página, como ilustração de livro
   antigo. Aberta (212: 188 de pintura que esbate para o pergaminho nos
   últimos 96) · recolhida (48) · estreita (48, miniatura de 96).
   ============================================================ */
export function Estampa({ cena = "", lugar = "", sub = "", estado = "aberta" }) {
  const E = P.estampa;
  const src = cena ? (cena.includes("/") ? cena : `/cenas/${cena}.webp`) : null;
  const aberta = estado === "aberta";
  const reduz = poucoMovimento();
  const alto = aberta ? E.aberta : E.recolhida;
  return (
    <figure data-estado={estado} aria-label={[lugar, sub].filter(Boolean).join(", ")}
      style={{ margin: 0, position: "relative", height: alto, overflow: "hidden", transition: reduz ? "none" : `height ${aberta ? M.estampaAbre : M.estampaRecolhe}ms ease`, display: aberta ? "block" : "flex", alignItems: "center", gap: 12, borderBottom: aberta ? 0 : `1px solid ${alfa(T.tintaDoPergaminhoDim, 0.4)}` }}>
      {src ? (aberta ? (
        <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: E.pintura, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center",
          WebkitMaskImage: `linear-gradient(to bottom, ${T.couroBaixo} ${E.pintura - E.esbate}px, transparent ${E.pintura}px)`, maskImage: `linear-gradient(to bottom, ${T.couroBaixo} ${E.pintura - E.esbate}px, transparent ${E.pintura}px)` }} />
      ) : (
        <span aria-hidden="true" style={{ flex: "none", width: estado === "estreita" ? E.miniatura : E.miniatura * 1.2, height: E.recolhida - 6, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 2 }} />
      )) : null}
      <figcaption style={aberta ? { position: "absolute", left: 0, right: 0, top: E.pintura - 34, textAlign: "center" } : { minWidth: 0 }}>
        <span style={{ display: "block", color: T.brasaNoPergaminho, ...letraDaMesa(aberta ? "lugar" : "nome") }}>{lugar}</span>
        {sub ? <span style={{ display: "block", color: T.tintaDoPergaminhoDim, ...letraDaMesa("notaDoMestre") }}>{sub}</span> : null}
      </figcaption>
    </figure>
  );
}

/* ============================================================
   O OBJETO POUSADO — livro, carta, bolsa, grimório. Abrir é pegar: sob o
   dedo (ponteiro, foco, toque) ergue 6 px e a sombra passa de pousado a
   erguido; com prefers-reduced-motion, só a sombra.
   ============================================================ */
const DESENHO_DO_OBJETO = { livro: "diario", carta: "mapa", bolsa: "bolsa", grimorio: "codex" };
const NOME_DO_OBJETO = { livro: "O livro", carta: "A carta", bolsa: "A bolsa", grimorio: "O grimório" };
export function ObjetoPousado({ objeto = "livro", rotulo = null, aoAbrir = null, erguido = false, novo = false }) {
  const O = P.objeto;
  const [sob, setSob] = React.useState(false);
  const alto = erguido || sob;
  const reduz = poucoMovimento();
  const nome = rotulo || NOME_DO_OBJETO[objeto] || objeto;
  const on = (v) => () => setSob(v);
  return (
    <button type="button" onClick={aoAbrir || undefined} disabled={!aoAbrir} aria-label={nome} data-erguido={alto ? "sim" : "nao"} className="tv-anel-foco"
      onPointerEnter={on(true)} onPointerLeave={on(false)} onFocus={on(true)} onBlur={on(false)}
      style={{ width: O.alvo.largura, minHeight: O.alvo.alto, display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 4, padding: 0, background: "transparent", border: 0, cursor: aoAbrir ? "pointer" : "default" }}>
      <span style={{ display: "block", borderRadius: 8, boxShadow: alto ? SOMBRA_DA_MESA.erguido : SOMBRA_DA_MESA.pousado, transform: alto && !reduz ? `translateY(-${M.sobe}px)` : "none", transition: reduz ? "none" : `transform ${M.ergue}ms ease-out, box-shadow ${M.ergue}ms ease-out` }}>
        {/* V4: a novidade acende na porta da coisa (a gota do desenho, a de A1 · B6) */}
        <DesenhoDoObjeto chave={DESENHO_DO_OBJETO[objeto] || objeto} lado={O.desenho} novo={!!novo} />
      </span>
      <span style={{ color: alto ? T.ink : T.inkMeio, ...letraDaMesa("rotulo") }}>{nome.replace(/^(O|A) /, "")}</span>
    </button>
  );
}

/* ============================================================
   O CANTO DO ESCUDO — o objeto que abre o escudo do Mestre. 64 × 64,
   alvo 72 × 84, rótulo «ESC»; 46 no telefone. Sempre no canto.
   ============================================================ */
/* o desenho do escudo (três folhas de couro com o losango de latão) — o do
   canto e o da quinta porta da borda do telefone (V4b), um desenho só */
export function DesenhoDoEscudo({ lado = 64 }) {
  return (
    <svg aria-hidden="true" width={lado} height={lado} viewBox="0 0 64 64" style={{ filter: `drop-shadow(0 3px 4px ${alfa(T.couroBaixo, 0.9)})` }}>
      <path d="M6 14l16-4v44l-16 4z" fill={T.couro} stroke={T.latao} strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 10h20v44H22z" fill={T.couroAlto} stroke={T.latao} strokeWidth="2" strokeLinejoin="round" />
      <path d="M42 10l16 4v44l-16-4z" fill={T.couro} stroke={T.latao} strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 22l7 4v8l-7 4-7-4v-8z" fill="none" stroke={T.lataoLume} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M32 22v16M25 26l14 8M39 26l-14 8" stroke={T.lataoLume} strokeWidth="1" />
    </svg>
  );
}
export function CantoDoEscudo({ aoAbrir, telefone = false, aberto = false, refBotao = null }) {
  const C = P.canto;
  const lado = telefone ? C.telefone : C.lado;
  return (
    <button ref={refBotao} type="button" onClick={aoAbrir} aria-label="O escudo do Mestre: som, texto, preferências e sair (Esc)" aria-keyshortcuts="Escape" aria-haspopup="dialog" aria-expanded={aberto}
      className="tv-anel-foco" title="O escudo do Mestre (Esc)"
      style={{ width: telefone ? Math.max(lado, 44) : C.alvo.largura, minHeight: telefone ? Math.max(lado, 44) : C.alvo.alto, display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 0, background: "transparent", border: 0, cursor: "pointer" }}>
      <DesenhoDoEscudo lado={lado} />
      {telefone ? null : <span style={{ color: T.inkMeio, ...letraDaMesa("rotulo") }}>Esc</span>}
    </button>
  );
}

/* ============================================================
   A PROPOSTA — a tira de papel no pé da página. Se pede dado, a 2.ª linha
   diz a perícia, o número e o preço ANTES do toque (o veredito antes do
   clique). Repouso · foco (2 px de tinta) · pressionada (chão escurece,
   desce 1 px) · desabilitada (sem chão, tinta cheia, a razão escrita).
   ============================================================ */
export function Proposta({ texto = "", dado = null, aoTocar = null, razao = "" }) {
  const Pr = P.proposta;
  const [foco, setFoco] = React.useState(false);
  const [premida, setPremida] = React.useState(false);
  const impedida = !aoTocar;
  const linha2 = dado ? [dado.pericia, dado.cd != null ? `precisa de ${dado.cd}` : null, dado.preco ? `se falhar, ${dado.preco}` : null].filter(Boolean).join(" · ") : "";
  return (
    <span className="inline-flex flex-col" style={{ gap: 4, minWidth: 0 }}>
      <button type="button" onClick={aoTocar || undefined} disabled={impedida}
        onFocus={() => setFoco(true)} onBlur={() => { setFoco(false); setPremida(false); }}
        onPointerDown={() => setPremida(true)} onPointerUp={() => setPremida(false)} onPointerLeave={() => setPremida(false)}
        data-com-dado={dado ? "sim" : "nao"}
        style={{ minHeight: dado ? Pr.altoComDado : Pr.alto, borderRadius: Pr.raio, textAlign: "left", padding: "6px 12px", display: "flex", alignItems: "center", gap: 10, cursor: impedida ? "not-allowed" : "pointer",
          background: impedida ? "transparent" : premida ? T.pergaminhoBorda : T.ossoLume,
          border: foco ? `2px solid ${T.tintaDoPergaminho}` : `1px solid ${T.tintaDoPergaminhoDim}`,
          boxShadow: premida || impedida ? "none" : SOMBRA_DA_MESA.peca, transform: premida ? "translateY(1px)" : "none", outline: "none" }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none" }}>
          {dado ? <path d="M8 1.5l5.6 3.2v6.6L8 14.5l-5.6-3.2V4.7z M8 1.5v13 M2.4 4.7l11.2 6.6 M13.6 4.7L2.4 11.3" fill="none" stroke={T.tintaDoPergaminho} strokeWidth="1.1" strokeLinejoin="round" />
            : <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke={T.brasaNoPergaminho} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <span className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ color: T.tintaDoPergaminho, ...letraDaMesa("proposta") }}>{texto}</span>
          {linha2 ? <span style={{ color: T.brasaNoPergaminho, ...letraDaMesa("notaDoMestre") }}>{linha2}</span> : null}
        </span>
      </button>
      {impedida && razao ? <span style={{ color: T.tintaDoPergaminhoDim, ...letraDaMesa("notaDoMestre") }}>{razao}</span> : null}
    </span>
  );
}

/* ============================================================
   A LINHA DA PENA — o campo de escrever é uma linha da própria página.
   56 de altura; a regra engrossa ao escrever; «dizer» 44 × 44 âmbar com
   aro de brasa. Controlado: quem escreve é o dono do valor.
   ============================================================ */
export function LinhaDaPena({ valor = "", aoMudar = null, aoDizer = null, convite = "O que você faz?", refCampo = null }) {
  const Pe = P.pena;
  const escrevendo = !!(valor && String(valor).trim());
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (aoDizer && escrevendo) aoDizer(valor); }} data-estado={escrevendo ? "escrevendo" : "vazia"}
      className="flex items-center" style={{ minHeight: Pe.alto, gap: 10, borderBottom: `${escrevendo ? 2 : 1}px solid ${T.tintaDoPergaminhoDim}` }}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none" }}>
        <path d="M14 2c-5 1-8 5-10 10l-1 2 2-1c5-2 9-5 9-11zM4 12l3-3" fill="none" stroke={T.tintaDoPergaminhoDim} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <input ref={refCampo} value={valor} onChange={(e) => aoMudar && aoMudar(e.target.value)} placeholder={convite} aria-label={convite}
        className="tv-anel-foco-no-campo" style={{ flex: 1, minWidth: 0, minHeight: Pe.dizer, background: "transparent", border: 0, outline: "none", color: T.tintaDoPergaminho, ...letraDaMesa("falaDoJogador") }} />
      <button type="submit" disabled={!escrevendo} aria-label="Dizer" className="tv-anel-foco"
        style={{ width: Pe.dizer, height: Pe.dizer, flex: "none", borderRadius: "50%", background: T.amber, border: `2px solid ${T.brasaNoPergaminho}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: escrevendo ? "pointer" : "default" }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke={T.onAccent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </form>
  );
}
