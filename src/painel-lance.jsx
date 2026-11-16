/* ============================================================
   O LANCE (V3 · 16/11/2026) — src/painel-lance.jsx

   O dado sai da bandeja, rola no centro da página a 160 px (128 no
   telefone), pousa, o bónus soma em letra que conta («13 → +1 → 14») e o
   veredito escreve-se COMO POSIÇÃO: o total acima ou abaixo da linha do
   «precisa de N», com selo (aro cheio × aro de traço interrompido) e
   palavra — três sinais, nenhum deles a cor (WCAG 2.2, 1.4.1). Depois o dado
   fica pousado com a conta enquanto a pena escreve, e volta à bandeja quando
   a primeira linha do Mestre chega (ou ao toque).

   A forma é do F2 (formas.md §«A Mesa do Mestre · F2» §3–§5; Figma
   283:1894 … 283:4828, 284:4887 … 284:6153). O tempo é LANCE e
   CERIMONIA_DO_DADO (estilo.js); a máquina e o teatro são de
   lance-do-dado.js, provados em Node. ESTA PEÇA NÃO DECIDE NADA: o lance
   chega pronto do sistema (a semente já falou), e a sequência de faces e o
   giro saem do resultado — nunca de Math.random.

   NUNCA CUSTA O TURNO: a narração já foi pedida no toque; isto é teatro por
   cima. Tocar (ou Enter, Espaço) pula para o veredito; com reduced-motion o
   veredito chega em 120 ms. Qualquer coisa que estoure aqui dentro cala-se
   e o veredito aparece parado.

   O 20 E O 1 (CERIMONIA_DO_DADO): o 20 acende a face âmbar, pulsa, abre
   dezasseis raios e corre uma onda de luz pelo feltro (um clarão só); o 1
   racha, tomba −4°, solta três lascas e a luz da mesa cai e volta. O som é
   sintetizado (som-da-mesa.js: o osso no feltro, o sino do 20, o tom grave
   do 1), e um som que estoura cala-se.
   ============================================================ */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { T, ESCALA_DA_MESA, LANCE, CERIMONIA_DO_DADO, TAMANHO_DO_DADO, alfa } from "./estilo.js";
import { DadoDeOsso } from "./ui.jsx";
import { vereditoDoLance, facesDoRolar, giroDoRolar, tempoDoLance, passosDaSoma, quadrosDoVoo, fraseDoVeredito, PALAVRAS_DO_LANCE } from "./lance-do-dado.js";
import { tocarDoLance } from "./som-da-mesa.js";

const W = PALAVRAS_DO_LANCE;
const C = CERIMONIA_DO_DADO;
const reduzidoAgora = () => {
  try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};
const soar = (m, v) => { try { tocarDoLance(m, v); } catch { /* um som que estoura cala-se */ } };
const letra = (k) => {
  const e = ESCALA_DA_MESA[k] || ESCALA_DA_MESA.titulo;
  return { fontFamily: `'${e.familia}', Georgia, serif`, fontWeight: e.peso, fontSize: e.corpo, lineHeight: `${e.entrelinha}px`, letterSpacing: `${e.entreletra || 0}em`, ...(e.caixaAlta ? { textTransform: "uppercase" } : null) };
};
const centroDe = (el) => {
  try { if (!el) return null; const r = el.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; } catch { return null; }
};

/* O selo do veredito (28): aro cheio no passou, aro de traço interrompido no falhou */
function SeloDoVeredito({ acima, cor }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="14" cy="14" r="11" fill="none" stroke={cor} strokeWidth="2.5" strokeDasharray={acima ? undefined : "5 4"} />
      {acima ? <path d="M8.5 14.5 L12.5 18.5 L19.5 10" fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M10 10 L18 18 M18 10 L10 18" fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" />}
    </svg>
  );
}

/* A CONTA CONTRA A LINHA (320 de largura; 300 no telefone). A linha do
   «precisa de» risca-se; a face e o bónus assentam nela; o total sobe acima
   (passou) ou afunda abaixo (falhou). */
/* `fio` (a margem do motor, desfechoDaMargem): "quase" = abaixo da linha mas
   conseguido pagando — a posição fica honesta (abaixo), e a palavra diz POR UM
   FIO, e paga; outra faixa = passou por um fio. */
function ContaContraALinha({ v, passo, rotulo, estado, telefone, fio = null }) {
  const mostraBonus = estado !== "rolando" && estado !== "saindo" && estado !== "pousado" && v.mod !== 0;
  const temVeredito = estado === "veredito" || estado === "esperando" || estado === "voltando";
  const corTotal = !temVeredito ? T.tintaDoPergaminho : v.acima ? T.tintaDoPergaminho : T.perigoNoPergaminho;
  const quase = fio === "quase" && !v.acima;
  const corSelo = quase ? T.brasaNoPergaminho : v.acima ? T.musgoNoPergaminho : T.perigoNoPergaminho;
  const largura = telefone ? 300 : 320;
  const total = temVeredito ? v.total : passo;
  const natural = v.veredito === "vinte" ? W.vinte : v.veredito === "um" ? W.um : "";
  const linhaY = 100;
  return (
    <div data-conta-do-lance={temVeredito ? (v.acima ? "acima" : "abaixo") : "somando"} style={{ position: "relative", width: largura, height: 200, color: T.tintaDoPergaminho }}>
      {temVeredito && natural ? (
        <span style={{ position: "absolute", left: 0, top: 0, ...letra("lugar"), color: v.veredito === "vinte" ? T.brasaNoPergaminho : T.perigoNoPergaminho }}>{natural}</span>
      ) : null}
      {/* a face e o bónus, sentados na linha */}
      <span style={{ position: "absolute", left: 0, top: linhaY - 46, display: "flex", alignItems: "flex-end", gap: 10 }}>
        <span style={{ ...letra("marca"), letterSpacing: 0, color: T.tintaDoPergaminho }}>{estado === "rolando" || estado === "saindo" ? "" : v.face}</span>
        {mostraBonus ? (
          <span className="tv-fade" style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ ...letra("rotulo"), color: T.brasaNoPergaminho, whiteSpace: "nowrap" }}>{rotulo}</span>
            <span style={{ ...letra("marca"), letterSpacing: 0, color: T.tintaDoPergaminhoDim }}>{v.mod > 0 ? `+${v.mod}` : `−${-v.mod}`}</span>
          </span>
        ) : null}
        {mostraBonus ? <span aria-hidden="true" style={{ ...letra("lugar"), color: T.tintaDoPergaminhoDim, paddingBottom: 8 }}>→</span> : null}
      </span>
      {/* a linha do «precisa de N» */}
      {v.alvo != null ? (
        <>
          <span className="tv-lance-linha" style={{ position: "absolute", left: 0, top: linhaY, width: largura, height: 2, background: T.tintaDoPergaminho, transformOrigin: "0 50%" }} />
          <span style={{ position: "absolute", right: 0, top: temVeredito && !v.acima ? linhaY - 22 : linhaY + 8, ...letra("rotulo"), color: T.tintaDoPergaminhoDim }}>
            {W.precisa} {v.alvo}
          </span>
        </>
      ) : null}
      {/* o total: acima ou abaixo da linha */}
      {estado !== "rolando" && estado !== "saindo" && estado !== "pousado" ? (
        <span data-total-do-lance="" style={{ position: "absolute", right: 0, top: temVeredito ? (v.acima ? linhaY - 70 : linhaY + 6) : linhaY - 70,
          ...letra("dado"), color: corTotal, transition: `top ${LANCE.veredito}ms ease-out`, minWidth: 64, textAlign: "right" }}>
          {total}
        </span>
      ) : null}
      {/* o selo, a palavra e a margem */}
      {temVeredito && v.alvo != null ? (
        <span className="tv-fade" style={{ position: "absolute", left: 0, top: v.acima ? linhaY + 30 : linhaY + 76, display: "flex", alignItems: "center", gap: 8 }}>
          <SeloDoVeredito acima={v.acima} cor={corSelo} />
          <span style={{ ...letra("lugar"), color: corSelo }}>{quase ? W.fio : v.acima ? W.passou : W.falhou}</span>
          {v.margem != null ? <span style={{ fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 16, color: T.tintaDoPergaminhoDim }}>{quase ? W.paga : fio && v.acima ? W.porUmFio : v.acima ? W.por(v.margem) : W.faltaram(v.margem)}</span> : null}
        </span>
      ) : null}
    </div>
  );
}

/* A ONDA DO 20: dois anéis de luz por baixo, a correr o feltro */
function OndaDoVinte({ alvo }) {
  const O = C.vinte.onda;
  return (
    <span aria-hidden="true" style={{ position: "fixed", left: alvo.x, top: alvo.y, width: 0, height: 0, pointerEvents: "none" }}>
      {O.raios.map((r, i) => (
        <span key={i} className="tv-lance-onda" data-raio={r} style={{ position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%",
          background: `radial-gradient(circle, ${alfa(O.cor, O.alfas[i])} 0%, ${alfa(O.cor, 0)} 70%)`, transform: "scale(0)", opacity: 0 }} />
      ))}
    </span>
  );
}

/* OS RAIOS DO 20: dezasseis traços âmbar, alternados */
function RaiosDoVinte({ lado }) {
  const R = C.vinte.raios;
  const k = lado / TAMANHO_DO_DADO.lance;
  const meio = lado / 2;
  return (
    <svg className="tv-lance-raios" aria-hidden="true" width={lado} height={lado} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {Array.from({ length: R.n }, (_, i) => {
        const a = (i / R.n) * Math.PI * 2;
        const ate = R.ate[i % 2] * k, de = R.de * k;
        return <line key={i} x1={meio + Math.cos(a) * de} y1={meio + Math.sin(a) * de} x2={meio + Math.cos(a) * ate} y2={meio + Math.sin(a) * ate} stroke={R.cor} strokeWidth={R.largura} strokeLinecap="round" />;
      })}
    </svg>
  );
}

/* AS LASCAS DO 1 */
function LascasDoUm({ lado }) {
  const L = C.um.tomba;
  return (
    <span aria-hidden="true" style={{ position: "absolute", left: lado / 2, top: lado * 0.8, width: 0, height: 0, pointerEvents: "none" }}>
      {L.lascas.map((p, i) => (
        <span key={i} className="tv-lance-lasca" data-dx={p.dx} data-dy={p.dy} style={{ position: "absolute", left: 0, top: 0, width: 6, height: 5, background: L.cor, clipPath: "polygon(0 0, 100% 30%, 60% 100%)" }} />
      ))}
    </span>
  );
}

/* A PENA QUE ESCREVE (a espera; sem relógio) */
function PenaQueEscreve() {
  return (
    <span className="tv-fade" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'Spectral', Georgia, serif", fontStyle: "italic", fontSize: 14, color: T.tintaDoPergaminhoDim }}>
      <svg width="130" height="10" viewBox="0 0 130 10"><path className="tv-lance-pena" d="M0 5 Q 8 0 16 5 T 32 5 T 48 5 T 64 5 T 80 5 T 96 5 T 112 5 T 128 5" fill="none" stroke={T.tintaDoPergaminhoDim} strokeWidth="1.5" pathLength="1" /></svg>
      {W.escreve}
    </span>
  );
}

/* O LANCE. Props:
     lance     — o lançamento da bandeja (motor/a-bandeja.js): n, dados, mod,
                 total, alvo, desfecho, rotulo. Já com o resultado.
     rotulo    — o nome da perícia, para a soma e o leitor de ecrã
     telefone  — 128 px e a conta por baixo do dado
     narrando  — a narração ainda não chegou (o App passa \`carregando\`)
     segura    — não volta sozinho depois do veredito (o Véu com «Refazer»)
     acoes     — o que vai por baixo da conta no veredito (Refazer, Continuar)
     aoVeredito — uma vez, quando o veredito assenta
     aoFim     — quando o dado volta à bandeja */
export function LanceDoDado({ lance, rotulo = "", telefone = false, narrando = false, segura = false, acoes = null, aoVeredito = null, aoFim = null, fio = null }) {
  const v = vereditoDoLance(lance);
  const dado = ((lance && Array.isArray(lance.dados) ? lance.dados : []).find((d) => d && !d.posto)) || { faces: 20, valor: v.face };
  const n = (lance && lance.n) || 0;
  const lado = telefone ? LANCE.lado.telefone : LANCE.lado.mesa;
  const [estado, setEstado] = useState("saindo");
  const [face, setFace] = useState(null);
  const [passo, setPasso] = useState(v.face);
  const dadoRef = useRef(null), corpoRef = useRef(null), raizRef = useRef(null), luzRef = useRef(null);
  const timers = useRef([]);
  const vooRef = useRef(null);
  const alvoRef = useRef(null);
  const estadoRef = useRef("saindo");
  const aoVereditoRef = useRef(aoVeredito); aoVereditoRef.current = aoVeredito;
  const aoFimRef = useRef(aoFim); aoFimRef.current = aoFim;
  const narrouRef = useRef(!narrando);
  const deRef = useRef(null);
  const reduzido = useRef(reduzidoAgora()).current;
  const ir = (e) => { estadoRef.current = e; setEstado(e); };
  const limpar = () => { timers.current.forEach((x) => clearTimeout(x)); timers.current = []; };
  const depois = (ms, f) => { timers.current.push(setTimeout(() => { try { f(); } catch { /* o teatro cala-se */ } }, ms)); };

  /* o veredito assenta (uma vez): a cerimónia, o som, e o aviso ao App */
  const vereditoFeito = useRef(false);
  const chegarAoVeredito = () => {
    if (vereditoFeito.current) return;
    vereditoFeito.current = true;
    limpar();
    try { if (vooRef.current) vooRef.current.finish(); } catch { /* sem voo, segue */ }
    setFace(v.face); setPasso(v.total);
    ir("veredito");
    if (v.veredito === "vinte") soar("vinte");
    else if (v.veredito === "um") soar("um");
    try { cerimonia(); } catch { /* a cerimónia cala-se; o veredito fica */ }
    try { if (typeof aoVereditoRef.current === "function") aoVereditoRef.current(); } catch { /* nunca custa o turno */ }
    depois(reduzido ? LANCE.semMovimento : LANCE.veredito, () => ir("esperando"));
  };

  /* a cerimónia do 20 e do 1, por WAAPI (só transform e opacity) */
  const cerimonia = () => {
    const raiz = raizRef.current;
    if (!raiz || typeof raiz.animate !== "function") return;
    if (v.veredito === "vinte") {
      if (corpoRef.current && !reduzido) corpoRef.current.animate([{ transform: "scale(1)" }, { transform: `scale(${C.vinte.pulso.escala})` }, { transform: "scale(1)" }], { duration: C.vinte.pulso.dura, easing: C.vinte.pulso.curva });
      const raios = raiz.querySelector(".tv-lance-raios");
      if (raios && !reduzido) raios.animate([{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.05)" }], { duration: C.vinte.raios.dura, easing: "ease-out", fill: "forwards" });
      if (!reduzido && luzRef.current) luzRef.current.querySelectorAll(".tv-lance-onda").forEach((el) => el.animate([{ transform: "scale(0)", opacity: 1 }, { transform: "scale(1)", opacity: 0 }], { duration: C.vinte.onda.dura, easing: "ease-out", fill: "forwards" }));
    } else if (v.veredito === "um") {
      raiz.querySelectorAll(".tv-fissura").forEach((el) => {
        el.style.strokeDasharray = "1";
        if (!reduzido) el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: C.um.fissura, easing: "ease-out", fill: "forwards" });
      });
      if (!reduzido && corpoRef.current) corpoRef.current.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${C.um.tomba.gira}deg)` }], { duration: C.um.tomba.dura, easing: "ease-out", fill: "forwards" });
      if (!reduzido) raiz.querySelectorAll(".tv-lance-lasca").forEach((el) => {
        const dx = Number(el.dataset.dx) || 0, dy = Number(el.dataset.dy) || 0;
        el.animate([{ transform: "translate(0,0)", opacity: 0 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 1 }, { transform: `translate(${dx * 1.2}px, ${Math.abs(dy) * 0.4}px)`, opacity: 1 }], { duration: C.um.tomba.dura, easing: "ease-out", fill: "forwards" });
      });
      const veu = luzRef.current ? luzRef.current.querySelector(".tv-lance-veu") : null;
      const L = C.um.luz;
      if (veu && !reduzido) veu.animate([{ opacity: 0 }, { opacity: 1, offset: L.desce / (L.desce + L.volta) }, { opacity: 0 }], { duration: L.desce + L.volta, easing: "ease-out", fill: "forwards" });
    }
  };

  /* o voo: da bandeja ao centro da arena */
  useLayoutEffect(() => {
    try {
      const pag = document.querySelector("[data-tv-pagina]");
      const r = pag ? pag.getBoundingClientRect() : null;
      const W0 = window.innerWidth, H0 = window.innerHeight;
      const cx = r && r.width ? r.left + r.width / 2 : W0 / 2;
      const cy = Math.min(H0 * 0.52, r && r.height ? r.top + Math.min(r.height, H0) * 0.5 : H0 / 2);
      alvoRef.current = { x: cx, y: cy };
      deRef.current = centroDe(document.querySelector("[data-bandeja-no-feltro]")) || centroDe(document.querySelector("[data-bandeja-em-coluna]")) || { x: W0 - 80, y: H0 - 60 };
      if (raizRef.current) { raizRef.current.style.left = `${cx}px`; raizRef.current.style.top = `${cy}px`; }
    } catch { alvoRef.current = { x: 0, y: 0 }; }
  }, []);

  useEffect(() => {
    if (reduzido) {
      setFace(v.face);
      depois(LANCE.semMovimento, chegarAoVeredito);
      return limpar;
    }
    const tempo = tempoDoLance({ mod: v.mod, narrou: false });
    /* o voo */
    try {
      const el = dadoRef.current, de = deRef.current, centro = centroDe(dadoRef.current);
      if (el && typeof el.animate === "function" && de && centro) {
        const quadros = quadrosDoVoo({ dx: de.x - centro.x, dy: de.y - centro.y, giro: giroDoRolar({ valor: v.face, faces: dado.faces, n }), escalaDe: TAMANHO_DO_DADO.bandeja / lado });
        vooRef.current = el.animate(quadros, { duration: tempo.pousado, easing: "linear", fill: "both" });
      }
    } catch { /* sem voo, o dado aparece no centro */ }
    /* as faces que passam */
    const seq = facesDoRolar({ valor: v.face, faces: dado.faces, n });
    for (const q of seq) depois(LANCE.sair.dura + q.em, () => setFace(q.face));
    depois(tempo.rolando, () => ir("rolando"));
    depois(tempo.pousado, () => {
      ir("pousado"); soar("osso", n);
      try { if (dadoRef.current && dadoRef.current.animate) dadoRef.current.animate([{ transform: `translateY(-${LANCE.pousar.ressalto}px)` }, { transform: "none" }], { duration: LANCE.pousar.dura, easing: "ease-out", composite: "add" }); } catch { /* sem ressalto */ }
    });
    /* a soma conta */
    depois(tempo.somando, () => {
      ir("somando");
      /* a narração já chegou no pouso: a soma colapsa (LANCE.soma.colapsada) */
      const t2 = tempoDoLance({ mod: v.mod, narrou: narrouRef.current });
      const passos = passosDaSoma(v.face, v.mod);
      const resto = t2.veredito - t2.somando;
      const dePasso = passos.length > 1 ? Math.max(1, (resto - LANCE.soma.bonus) / (passos.length - 1)) : 0;
      passos.slice(1).forEach((p, i) => depois(Math.min(resto, LANCE.soma.bonus + dePasso * i), () => setPasso(p)));
      depois(resto, chegarAoVeredito);
    });
    return limpar;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* a narração chegou: marca, e, se o dado já espera, volta */
  useEffect(() => {
    if (!narrando) narrouRef.current = true;
    if (!narrando && !segura && estado === "esperando") voltar();
  }, [narrando, estado]); // eslint-disable-line react-hooks/exhaustive-deps
  /* o teto de segurança: um Narrador que nunca chega não prende o dado */
  useEffect(() => {
    if (estado !== "esperando" || segura) return undefined;
    const x = setTimeout(() => { try { voltar(); } catch { /* segue */ } }, LANCE.esperaTeto);
    return () => clearTimeout(x);
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  const voltou = useRef(false);
  const voltar = () => {
    if (voltou.current) return;
    voltou.current = true;
    ir("voltando");
    const fim = () => { try { if (typeof aoFimRef.current === "function") aoFimRef.current(); } catch { /* nunca custa o turno */ } };
    try {
      const el = raizRef.current, de = deRef.current, a = alvoRef.current;
      if (!reduzido && el && typeof el.animate === "function" && de && a) {
        const anim = el.animate([{ opacity: 1, transform: "translate(-50%, -50%)" }, { opacity: 0, transform: `translate(calc(-50% + ${de.x - a.x}px), calc(-50% + ${de.y - a.y}px)) scale(${TAMANHO_DO_DADO.bandeja / lado})` }],
          { duration: LANCE.voltar.dura, easing: LANCE.voltar.curva, fill: "forwards" });
        anim.onfinish = fim;
        return;
      }
    } catch { /* sem volta animada */ }
    setTimeout(fim, reduzido ? LANCE.semMovimento : 0);
  };

  /* pular: o toque, o Enter, o Espaço */
  const tocar = () => {
    const e = estadoRef.current;
    if (e === "saindo" || e === "rolando" || e === "pousado" || e === "somando") chegarAoVeredito();
    else if ((e === "esperando" || e === "veredito") && !segura) voltar();
  };
  useEffect(() => {
    const k = (ev) => {
      try {
        const e = estadoRef.current;
        if ((ev.key === "Enter" || ev.key === " ") && (e === "saindo" || e === "rolando" || e === "pousado" || e === "somando")) { ev.preventDefault(); chegarAoVeredito(); }
      } catch { /* segue */ }
    };
    document.addEventListener("keydown", k, true);
    return () => document.removeEventListener("keydown", k, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const temVeredito = estado === "veredito" || estado === "esperando" || estado === "voltando";
  const estadoDoDado = temVeredito && v.veredito === "vinte" ? "aceso" : temVeredito && v.veredito === "um" ? "rachado" : estado === "saindo" || estado === "rolando" ? "vivo" : "pousado";
  const mostra = face == null ? "" : String(face);
  const alvo = alvoRef.current || { x: 0, y: 0 };
  return (
    <>
    {/* a luz da cerimónia mora FORA da raiz (que tem transform, e prenderia o fixed) */}
    <span ref={luzRef} aria-hidden="true" style={{ position: "fixed", left: 0, top: 0, width: 0, height: 0, zIndex: 44, pointerEvents: "none" }}>
      {v.veredito === "um" && temVeredito ? (
        <span className="tv-lance-veu" style={{ position: "fixed", inset: 0, background: alfa(T.veuDaNoite, C.um.luz.tetoDoVeu), opacity: 0, pointerEvents: "none" }} />
      ) : null}
      {v.veredito === "vinte" && temVeredito ? <OndaDoVinte alvo={alvo} /> : null}
    </span>
    <div ref={raizRef} data-lance={estado} data-veredito={temVeredito ? v.veredito : undefined} role="group" aria-label={rotulo || "O dado"}
      style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 45, pointerEvents: "none" }}>
      <div onClick={tocar} style={{ pointerEvents: "auto", cursor: "pointer", display: "flex", flexDirection: telefone ? "column" : "row", alignItems: "center", gap: telefone ? 12 : 32,
        padding: telefone ? "16px 18px" : "20px 28px", borderRadius: 14, background: temVeredito || estado === "somando" || estado === "pousado" ? alfa(T.pergaminho, 0.94) : "transparent",
        boxShadow: temVeredito ? `0 10px 30px ${alfa(T.veuDaNoite, 0.28)}` : "none", transition: `background ${LANCE.pousar.dura}ms ease-out` }}>
        <span ref={dadoRef} style={{ position: "relative", display: "inline-flex", width: lado, height: lado, willChange: "transform" }}>
          <span ref={corpoRef} style={{ display: "inline-flex", transformOrigin: "50% 50%" }}>
            <DadoDeOsso forma={dado.faces === 100 ? 100 : dado.faces} lado={lado} numero={mostra} estado={estadoDoDado} />
          </span>
          {v.veredito === "vinte" && temVeredito ? <RaiosDoVinte lado={lado} /> : null}
          {v.veredito === "um" && temVeredito ? <LascasDoUm lado={lado} /> : null}
        </span>
        {estado !== "saindo" && estado !== "rolando" ? (
          <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ContaContraALinha v={v} passo={passo} rotulo={rotulo} estado={estado} telefone={telefone} fio={fio} />
            {temVeredito && acoes ? <span style={{ display: "flex", gap: 10, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>{acoes}</span> : null}
            {estado === "esperando" && narrando && !segura ? <PenaQueEscreve /> : null}
          </span>
        ) : null}
      </div>
      <span aria-live="polite" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{temVeredito ? fraseDoVeredito(lance, rotulo) : ""}</span>
    </div>
    </>
  );
}
