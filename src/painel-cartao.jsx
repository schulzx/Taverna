/* ============================================================
   O CARTÃO DA SESSÃO, PINTADO — e a tela «Levantar da mesa» (V10, 16/11)

   A metade que se OLHA de cartao-da-sessao.js: recebe os campos já
   compostos e pinta-os num <canvas> 1080 × 1350 (formas.md F6 §3). Nada
   aqui decide o que entra no cartão; só onde e com que tinta.

   Três cuidados que custam a exportação se faltarem:
   · as fontes do jogo (Cinzel, Spectral) são pedidas a document.fonts
     ANTES de pintar — um canvas com fonte por carregar sai em letra do
     sistema e não avisa;
   · as imagens (o retrato, a cena) são da mesma origem (public/); uma de
     fora sujaria o canvas, e o toBlob recusaria;
   · nada sai do aparelho sem o toque do jogador: o PNG é feito aqui, o
     «Compartilhar» abre a folha do próprio aparelho, e só aparece onde
     ela aceita arquivos. Nenhuma rede, nenhuma IA.
   ============================================================ */
import React from "react";
import { T, SOMBRA_DA_MESA, alfa } from "./estilo.js";
import { letraDaMesa } from "./mesa-do-mestre.js";
import { retratoDe } from "./retratos.js";
import { noSexo } from "./criacao-da-mesa.js";
import { BotaoDaMesa, Vinculo, useTelefone } from "./painel-chegada.jsx";
import { CARTAO_DA_SESSAO, LEVANTAR_DA_MESA, quebrarEmLinhas } from "./cartao-da-sessao.js";

const C = CARTAO_DA_SESSAO;
const K = C.tinta;
const CINZEL = `'${C.letra.cinzel}', Georgia, serif`;
const SPECTRAL = `'${C.letra.spectral}', Georgia, serif`;

/* ---------- as fontes e as imagens, antes de pintar ---------- */
export async function prepararOCartao(cartao) {
  try {
    if (typeof document !== "undefined" && document.fonts) {
      await Promise.all([
        document.fonts.load(`700 40px ${CINZEL}`),
        document.fonts.load(`italic 400 40px ${SPECTRAL}`),
        document.fonts.load(`500 34px ${SPECTRAL}`),
      ]);
      await document.fonts.ready;
    }
  } catch { /* sem fontes: pinta com o que houver */ }
  const carregar = (src) => new Promise((ok) => {
    if (!src) { ok(null); return; }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = src;
  });
  const h = cartao.heroi || {};
  let retrato = null;
  try { const r = retratoDe({ raca: h.raca, classe: h.classe, genero: h.sexo, feicoesFixas: true, semente: h.semente || h.nome }, { fixo: true }); retrato = r && r.arquivo; } catch { retrato = null; }
  const [imgRetrato, imgCena] = await Promise.all([carregar(retrato), carregar(cartao.cena ? `/cenas/${cartao.cena}.webp` : null)]);
  return { retrato: imgRetrato, cena: imgCena };
}

/* ---------- utilidades de pincel ---------- */
function retanguloRedondo(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function cobrir(ctx, img, x, y, w, h) {
  const e = Math.max(w / img.width, h / img.height);
  const iw = img.width * e, ih = img.height * e;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function girar(ctx, cx, cy, graus, f) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate((graus * Math.PI) / 180); ctx.translate(-cx, -cy); f(); ctx.restore();
}
function letra(ctx, { familia, peso = 400, italico = false, tamanho, cor, alinha = "left", base = "middle", espaco = 0 }) {
  ctx.font = `${italico ? "italic " : ""}${peso} ${tamanho}px ${familia}`;
  ctx.fillStyle = cor; ctx.textAlign = alinha; ctx.textBaseline = base;
  try { ctx.letterSpacing = `${espaco}px`; } catch { /* navegador sem letterSpacing */ }
}
/* o d20 de osso: hexágono com o triângulo da face, e o número */
function d20(ctx, cx, cy, r, { chao, aro, numero, corDoNumero, rachado = false }) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = chao; ctx.fill(); ctx.lineWidth = Math.max(2, r * 0.06); ctx.strokeStyle = aro; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.62); ctx.lineTo(cx + r * 0.6, cy + r * 0.38); ctx.lineTo(cx - r * 0.6, cy + r * 0.38); ctx.closePath();
  ctx.lineWidth = Math.max(1.5, r * 0.035); ctx.stroke();
  if (rachado) { ctx.beginPath(); ctx.moveTo(cx + r * 0.7, cy - r * 0.5); ctx.lineTo(cx + r * 0.45, cy - r * 0.1); ctx.lineTo(cx + r * 0.62, cy + r * 0.15); ctx.lineTo(cx + r * 0.4, cy + r * 0.55); ctx.stroke(); }
  letra(ctx, { familia: CINZEL, peso: 700, tamanho: Math.round(r * 0.62), cor: corDoNumero, alinha: "center" });
  ctx.fillText(String(numero), cx, cy + r * 0.08);
  ctx.restore();
}
/* as peças dos números da noite */
function peca(ctx, tipo, cx, cy, d) {
  const r = d / 2;
  if (tipo === "vinte") { ctx.save(); ctx.shadowColor = alfa(K.halo, 0.8); ctx.shadowBlur = 24; d20(ctx, cx, cy, r * 0.92, { chao: T.amberSoft, aro: K.latao, numero: 20, corDoNumero: K.naPagina }); ctx.restore(); return; }
  if (tipo === "um") { d20(ctx, cx, cy, r * 0.92, { chao: T.osso, aro: T.ossoSombra, numero: 1, corDoNumero: K.naPagina, rachado: true }); return; }
  ctx.save();
  if (tipo === "lacre") {
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2); ctx.fillStyle = K.lacre; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2); ctx.strokeStyle = alfa(K.lataoLume, 0.7); ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.2 : r * 0.45; const px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fillStyle = K.lataoLume; ctx.fill();
  } else if (tipo === "moedas") {
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.45 - i * r * 0.26, r * 0.7, r * 0.26, 0, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? K.lataoLume : K.latao; ctx.fill(); ctx.strokeStyle = T.lataoSombra; ctx.lineWidth = 2; ctx.stroke(); }
  } else {
    /* a peça de osso: a caveira, o cadeado ou a vela */
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.fillStyle = T.osso; ctx.fill(); ctx.strokeStyle = T.ossoSombra; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = K.naPagina; ctx.strokeStyle = K.naPagina;
    if (tipo === "caveira") {
      ctx.beginPath(); ctx.arc(cx, cy - r * 0.08, r * 0.4, Math.PI, 0); ctx.lineTo(cx + r * 0.32, cy + r * 0.3); ctx.lineTo(cx - r * 0.32, cy + r * 0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = T.osso; ctx.beginPath(); ctx.arc(cx - r * 0.16, cy - r * 0.02, r * 0.1, 0, Math.PI * 2); ctx.arc(cx + r * 0.16, cy - r * 0.02, r * 0.1, 0, Math.PI * 2); ctx.fill();
    } else if (tipo === "cadeado") {
      ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(cx, cy - r * 0.1, r * 0.25, Math.PI, 0); ctx.stroke();
      ctx.fillRect(cx - r * 0.38, cy - r * 0.1, r * 0.76, r * 0.5);
    } else {
      ctx.fillRect(cx - r * 0.12, cy - r * 0.2, r * 0.24, r * 0.6);
      ctx.fillStyle = T.amber; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.38, r * 0.1, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------- O DESENHO (F6 §3, campo a campo) ---------- */
export function desenharOCartao(canvas, cartao, imagens) {
  const ctx = canvas.getContext("2d");
  const W = C.largura, H = C.altura;
  const vez = cartao.noite ? "noite" : "dia";
  ctx.clearRect(0, 0, W, H);
  /* o fundo: o feltro, o halo da vela, a penumbra, a borda de couro e o fio de latão */
  ctx.fillStyle = K.feltro[vez]; ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(C.halo.x, C.halo.y, 0, C.halo.x, C.halo.y, C.halo.raio);
  g.addColorStop(0, alfa(K.halo, C.halo.alfa[vez])); g.addColorStop(1, alfa(K.halo, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${C.penumbra[vez]})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = C.borda.couro; ctx.strokeStyle = K.couro; ctx.strokeRect(C.borda.couro / 2, C.borda.couro / 2, W - C.borda.couro, H - C.borda.couro);
  ctx.lineWidth = C.borda.fio; ctx.strokeStyle = K.latao; ctx.strokeRect(C.borda.fioEm, C.borda.fioEm, W - 2 * C.borda.fioEm, H - 2 * C.borda.fioEm);

  /* a marca: o lacre com o d20, e TAVERNA */
  const L = C.marca.lacre;
  ctx.beginPath(); ctx.arc(L.x + L.d / 2, L.y + L.d / 2, L.d / 2, 0, Math.PI * 2); ctx.fillStyle = K.lacre; ctx.fill();
  d20(ctx, L.x + L.d / 2, L.y + L.d / 2, L.d * 0.3, { chao: K.lacre, aro: K.lataoLume, numero: "", corDoNumero: K.lataoLume });
  letra(ctx, { familia: CINZEL, peso: 700, tamanho: C.marca.texto.tamanho, cor: K.ink, base: "top", espaco: C.marca.texto.tamanho * 0.16 });
  ctx.fillText("TAVERNA", C.marca.texto.x, C.marca.texto.y);
  /* o título da noite */
  letra(ctx, { familia: CINZEL, peso: 700, tamanho: C.titulo.tamanho, cor: K.ink, alinha: "right", base: "top", espaco: 2 });
  ctx.fillText(cartao.titulo, C.titulo.x, C.titulo.y);

  /* a estampa: a cena do lugar (sem cena, o feltro com o halo) */
  const E = C.estampa;
  ctx.save(); retanguloRedondo(ctx, E.x, E.y, E.w, E.h, E.raio); ctx.clip();
  if (imagens.cena) cobrir(ctx, imagens.cena, E.x, E.y, E.w, E.h);
  ctx.fillStyle = alfa(K.veu, E.veu[vez]); ctx.fillRect(E.x, E.y, E.w, E.h);
  ctx.restore();
  retanguloRedondo(ctx, E.x, E.y, E.w, E.h, E.raio); ctx.lineWidth = E.aro; ctx.strokeStyle = K.latao; ctx.stroke();

  /* a silhueta do vilão (só se há vilão eleito; o nome só se o herói o sabe) */
  if (cartao.vilao) {
    const V = C.vilao;
    girar(ctx, V.x + V.w / 2, V.y + V.h / 2, V.rodada, () => {
      retanguloRedondo(ctx, V.x, V.y, V.w, V.h, 8); ctx.fillStyle = K.couro; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = K.latao; ctx.stroke();
      const cx = V.x + V.w / 2;
      ctx.fillStyle = K.silhueta;
      ctx.beginPath(); ctx.ellipse(cx, V.y + 120, 70, 82, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(V.x + 30, V.y + V.h - 8); ctx.quadraticCurveTo(V.x + 40, V.y + 200, cx, V.y + 196); ctx.quadraticCurveTo(V.x + V.w - 40, V.y + 200, V.x + V.w - 30, V.y + V.h - 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = K.latao; ctx.beginPath(); ctx.arc(cx - 22, V.y + 118, 5, 0, Math.PI * 2); ctx.arc(cx + 22, V.y + 118, 5, 0, Math.PI * 2); ctx.fill();
      letra(ctx, { familia: CINZEL, peso: 700, tamanho: V.tamanho, cor: K.ink, alinha: "center" });
      const nome = cartao.vilao.nome;
      let t = V.tamanho; while (t > C.pisoDaLetra - 0.5 && ctx.measureText(nome).width > V.w - 24) { t -= 1; ctx.font = `700 ${t}px ${CINZEL}`; }
      ctx.fillText(nome, cx, V.y + V.h - 56);
    });
  }

  /* a carta do herói: a pintura, o pé de couro, o nome, o lacre do nível */
  const P = C.carta;
  girar(ctx, P.x + P.w / 2, P.y + P.h / 2, P.rodada, () => {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    retanguloRedondo(ctx, P.x, P.y, P.w, P.h, 14); ctx.fillStyle = K.couro; ctx.fill(); ctx.restore();
    ctx.save(); retanguloRedondo(ctx, P.x, P.y, P.w, P.h, 14); ctx.clip();
    if (imagens.retrato) { ctx.globalAlpha = cartao.tira ? C.tiraDaQueda.pintura : 1; cobrir(ctx, imagens.retrato, P.x, P.y, P.w, P.h); ctx.globalAlpha = 1; }
    const gp = ctx.createLinearGradient(0, P.y + P.h * 0.55, 0, P.y + P.h);
    gp.addColorStop(0, alfa(K.couro, 0)); gp.addColorStop(0.55, alfa(K.couro, 0.92)); gp.addColorStop(1, K.couro);
    ctx.fillStyle = gp; ctx.fillRect(P.x, P.y, P.w, P.h);
    ctx.restore();
    retanguloRedondo(ctx, P.x, P.y, P.w, P.h, 14); ctx.lineWidth = 4; ctx.strokeStyle = K.latao; ctx.stroke();
    retanguloRedondo(ctx, P.x + 10, P.y + 10, P.w - 20, P.h - 20, 8); ctx.lineWidth = 1; ctx.strokeStyle = alfa(K.lataoLume, 0.5); ctx.stroke();
    const h = cartao.heroi;
    letra(ctx, { familia: CINZEL, peso: 700, tamanho: C.pisoDaLetra, cor: K.ink, alinha: "center", espaco: 1 });
    let t = C.pisoDaLetra; const nome = String(h.nome || "").toUpperCase();
    while (t > 24 && ctx.measureText(nome).width > P.w - 40) { t -= 1; ctx.font = `700 ${t}px ${CINZEL}`; }
    ctx.fillText(nome, P.x + P.w / 2, P.y + P.h - 110);
    ctx.fillStyle = K.latao; ctx.fillRect(P.x + P.w / 2 - 40, P.y + P.h - 82, 80, 1.5);
    const linha = [noSexo(h.raca, h.sexo), noSexo(h.classe, h.sexo)].filter(Boolean).join(" · ");
    letra(ctx, { familia: SPECTRAL, italico: true, tamanho: C.pisoDaLetra, cor: K.inkMeio, alinha: "center" });
    ctx.fillText(linha, P.x + P.w / 2, P.y + P.h - 48);
    ctx.beginPath(); ctx.arc(P.x + 50, P.y + 50, 30, 0, Math.PI * 2); ctx.fillStyle = K.lacre; ctx.fill();
    letra(ctx, { familia: SPECTRAL, peso: 700, tamanho: C.pisoDaLetra, cor: K.sobreLacre, alinha: "center" });
    ctx.fillText(String(h.nivel || 1), P.x + 50, P.y + 52);
    /* a tira da queda */
    if (cartao.tira) {
      const Q = C.tiraDaQueda;
      girar(ctx, P.x + P.w / 2, P.y + P.h * 0.45, 4, () => {
        ctx.fillStyle = K.papel; ctx.fillRect(P.x + P.w / 2 - Q.w / 2, P.y + P.h * 0.45 - Q.h / 2, Q.w, Q.h);
        letra(ctx, { familia: CINZEL, peso: 700, tamanho: Q.tamanho, cor: K.perigo, alinha: "center", espaco: 2 });
        ctx.fillText(cartao.tira, P.x + P.w / 2, P.y + P.h * 0.45 + 2);
      });
    }
  });

  /* a etiqueta do lugar */
  if (cartao.lugar) {
    const G = C.etiqueta;
    letra(ctx, { familia: CINZEL, peso: 700, tamanho: G.tamanho, cor: K.naPagina, alinha: "right", espaco: 1 });
    const w = Math.min(ctx.measureText(cartao.lugar).width + G.folga, 1020 - 520);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 10; ctx.fillStyle = K.osso; ctx.fillRect(G.direita - w, G.y, w, G.h); ctx.restore();
    ctx.fillStyle = K.naPagina; ctx.fillText(cartao.lugar, G.direita - G.folga / 2, G.y + G.h / 2 + 2, w - G.folga);
  }

  /* os números da noite, ou o d20 grande do vinte */
  if (cartao.vinte) {
    const V = C.vinte;
    const gv = ctx.createRadialGradient(V.x, V.y, 0, V.x, V.y, V.d);
    gv.addColorStop(0, alfa(K.halo, 0.45)); gv.addColorStop(1, alfa(K.halo, 0));
    ctx.fillStyle = gv; ctx.fillRect(V.x - V.d, V.y - V.d, V.d * 2, V.d * 2);
    ctx.save(); ctx.shadowColor = alfa(K.halo, 0.9); ctx.shadowBlur = 40;
    d20(ctx, V.x, V.y - 30, V.d * 0.36, { chao: T.amberSoft, aro: K.latao, numero: 20, corDoNumero: K.naPagina });
    ctx.restore();
    letra(ctx, { familia: SPECTRAL, peso: 500, tamanho: V.linha, cor: K.ink, alinha: "center" });
    ctx.fillText(cartao.vinte.linha, V.x, V.linhaY, 480);
  } else {
    const N = C.numeros;
    cartao.numeros.forEach((n, i) => {
      const cy = N.y + i * N.passo + N.passo / 2;
      peca(ctx, n.peca, N.pecaX + N.peca / 2, cy, N.peca);
      letra(ctx, { familia: CINZEL, peso: 700, tamanho: N.numero, cor: K.ink, alinha: "center" });
      ctx.fillText(n.mostra, N.numeroX + 65, cy + 4, 130);
      letra(ctx, { familia: SPECTRAL, peso: 500, tamanho: N.rotulo, cor: K.ink });
      ctx.fillText(n.rotulo, N.rotuloX - 30, cy + 2, 1020 - N.rotuloX + 30);
    });
  }

  /* a melhor frase: a do jogador, num papel */
  const F = C.frase;
  girar(ctx, F.x + F.w / 2, F.y + F.h / 2, F.rodada, () => {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = K.papel; ctx.fillRect(F.x, F.y, F.w, F.h); ctx.restore();
    letra(ctx, { familia: SPECTRAL, italico: true, tamanho: F.tamanho, cor: K.naPagina, base: "top" });
    const linhas = quebrarEmLinhas(cartao.origem ? `«${cartao.frase}»` : cartao.frase, F.w - 80, F.linhas, (s) => ctx.measureText(s).width);
    const ult = linhas.length - 1;
    if (cartao.origem && ult >= 0 && !linhas[ult].endsWith("»") ) linhas[ult] = linhas[ult].endsWith("…") ? linhas[ult] + "»" : linhas[ult];
    linhas.forEach((l, i) => ctx.fillText(l, F.x + 40, F.y + 28 + i * F.entrelinha));
    if (cartao.origem) {
      letra(ctx, { familia: SPECTRAL, italico: true, tamanho: F.origem, cor: K.naPaginaDim, base: "alphabetic" });
      ctx.fillText(cartao.origem, F.x + 40, F.y + F.h - 26, F.w - 80);
    }
  });

  /* o pé */
  letra(ctx, { familia: SPECTRAL, peso: 500, tamanho: C.pe.tamanho, cor: K.inkMeio, base: "top" });
  ctx.fillText(cartao.pe, C.pe.x, C.pe.y, 640);
  letra(ctx, { familia: SPECTRAL, italico: true, tamanho: C.pe.tamanho, cor: K.ink, alinha: "right", base: "top" });
  ctx.fillText(cartao.assinatura, C.pe.direita, C.pe.y);
}

/* ---------- o cartão na tela: o canvas inteiro, mostrado à escala ---------- */
export function CartaoDaSessao({ cartao, largura, aoPronto = null }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const imagens = await prepararOCartao(cartao);
        if (!vivo || !ref.current) return;
        desenharOCartao(ref.current, cartao, imagens);
        if (typeof aoPronto === "function") aoPronto(ref.current);
      } catch { /* o cartão que não pinta não derruba a tela */ }
    })();
    return () => { vivo = false; };
  }, [cartao]);
  const alto = Math.round((largura * C.altura) / C.largura);
  return (
    <canvas ref={ref} width={C.largura} height={C.altura} role="img"
      aria-label={`${cartao.titulo}. ${cartao.heroi.nome}. ${cartao.origem ? `«${cartao.frase}» — ${cartao.origem}.` : ""} ${cartao.pe}.`}
      style={{ width: largura, height: alto, display: "block", boxShadow: SOMBRA_DA_MESA.erguido, borderRadius: 4, flexShrink: 0 }} />
  );
}

/* ---------- guardar e partilhar: só com o toque, só no aparelho ---------- */
const emBlob = (canvas) => new Promise((ok) => { try { canvas.toBlob((b) => ok(b), "image/png"); } catch { ok(null); } });
function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- A TELA «LEVANTAR DA MESA» (F6 §3) ---------- */
export function LevantarDaMesa({ cartao, fio = null, aoVoltar, aoSair }) {
  const telefone = useTelefone();
  const Lv = LEVANTAR_DA_MESA;
  const [canvas, setCanvas] = React.useState(null);
  const [partilha, setPartilha] = React.useState(false);
  const [aviso, setAviso] = React.useState("");
  const nome = String((cartao.heroi && cartao.heroi.nome) || "").split(" ")[0];
  const aoPronto = React.useCallback(async (cv) => {
    setCanvas(cv);
    try {
      const b = await emBlob(cv);
      const f = b ? new File([b], cartao.nomeDoArquivo, { type: "image/png" }) : null;
      setPartilha(!!(f && navigator.canShare && navigator.canShare({ files: [f] })));
    } catch { setPartilha(false); }
  }, [cartao]);
  const guardar = async () => {
    try {
      const b = canvas ? await emBlob(canvas) : null;
      if (!b) { setAviso("A imagem ainda está a ser feita. Tente de novo num instante."); return; }
      baixar(b, cartao.nomeDoArquivo); setAviso("");
    } catch { setAviso("A imagem não saiu desta vez. Nada se perdeu."); }
  };
  const partilhar = async () => {
    try {
      const b = canvas ? await emBlob(canvas) : null;
      if (!b) return;
      await navigator.share({ files: [new File([b], cartao.nomeDoArquivo, { type: "image/png" })], title: "Taverna" });
    } catch { /* o jogador fechou a folha: nada a dizer */ }
  };
  React.useEffect(() => {
    const k = (e) => { if (e.key === "Escape") aoVoltar(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [aoVoltar]);
  const rotulo = { ...letraDaMesa("rotulo"), textTransform: "uppercase", letterSpacing: ".12em" };
  const gancho = fio && fio.pergunta ? (
    <div style={{ background: T.pergaminho, color: T.tintaDoPergaminho, padding: "22px 26px", transform: `rotate(${Lv.gancho.rodada}deg)`, boxShadow: SOMBRA_DA_MESA.pousado, width: telefone ? "100%" : Lv.gancho.largura, boxSizing: "border-box" }}>
      <div style={{ ...rotulo, color: T.brasaNoPergaminho }}>Fica por dizer</div>
      <div style={{ ...letraDaMesa("titulo", telefone), margin: "6px 0 6px", color: T.tintaDoPergaminho }}>{fio.pergunta}</div>
      {fio.passo ? <div style={{ ...letraDaMesa("notaDoMestre"), color: T.tintaDoPergaminhoDim }}>{`Da próxima vez: ${fio.passo}`}</div> : null}
    </div>
  ) : null;
  const coluna = (
    <div style={{ display: "flex", flexDirection: "column", gap: telefone ? 16 : 22, width: telefone ? "100%" : Lv.coluna, maxWidth: "100%" }}>
      <div>
        <div style={{ ...rotulo, color: T.inkMeio }}>Levantar da mesa</div>
        <h2 style={{ ...letraDaMesa("titulo", telefone), margin: "8px 0 0", color: T.ink }}>{nome ? `Até a próxima, ${nome}.` : "Até a próxima."}</h2>
      </div>
      {gancho}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
        <BotaoDaMesa principal largura="100%" onClick={guardar}>Guardar imagem</BotaoDaMesa>
        {partilha ? <BotaoDaMesa largura="100%" onClick={partilhar}>Compartilhar</BotaoDaMesa> : null}
        <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>A imagem é feita aqui, no seu aparelho. Nada é enviado a lugar nenhum sem você mandar.</span>
        {aviso ? <span role="status" style={{ ...letraDaMesa("notaDoMestre"), color: T.amberSoft }}>{aviso}</span> : null}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
        <Vinculo onClick={aoSair}>Só levantar</Vinculo>
        <Vinculo onClick={aoVoltar}>Voltar à mesa</Vinculo>
      </div>
      <span style={{ ...letraDaMesa("notaDoMestre"), color: T.inkMeio }}>Nada se perde: a campanha fica guardada neste aparelho.</span>
    </div>
  );
  return (
    <div role="dialog" aria-modal="true" aria-label="Levantar da mesa"
      style={{ position: "fixed", inset: 0, zIndex: 80, background: alfa(T.veuDaNoite, Lv.veu), overflowY: "auto", display: "flex", justifyContent: "center", alignItems: telefone ? "flex-start" : "center" }}>
      <div style={{ display: "flex", flexDirection: telefone ? "column" : "row", alignItems: telefone ? "center" : "center", gap: telefone ? 20 : Lv.vao, padding: telefone ? "24px 16px 40px" : "40px", boxSizing: "border-box", width: telefone ? "100%" : "auto" }}>
        <CartaoDaSessao cartao={cartao} largura={telefone ? Lv.cartao.telefone : Lv.cartao.mesa} aoPronto={aoPronto} />
        {coluna}
      </div>
    </div>
  );
}
