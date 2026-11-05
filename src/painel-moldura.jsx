/* ============================================================
   AAA · AS PEÇAS DA MOLDURA VIVA (05/11/2026) — formas.md §AAA §1, §8, §9

   Aqui só se pinta: a conta (o degrau, a gema, o selo) e a geometria moram
   em src/moldura.js, provadas em Node. Todas as cores saem das tabelas de
   estilo.js — nenhum literal nasce neste arquivo.

   · Moldura — à volta do rosto, em três tamanhos de uma família: anel
     (36–44, a cinta), medalhão (64, o cartão e a ficha) e carta (160).
   · CamadaDaMoldura — uma das duas camadas (abaixo/acima), para o Anel da
     cinta meter o arco de vida entre elas (o arco é jogo e fica onde está).
   · Gema — a pedra da subclasse no seu engaste, sozinha.
   · IconeDeItem — o glifo do item por tipo (ICONES_DE_ITEM), em ink.

   O TRANSBORDO É RESERVADO, NUNCA CORTADO (§1): a Moldura mede a caixa
   inteira de VB_DA_MOLDURA, e o rosto pousa na janela dela.

   A GEMA ACENDE SÓ QUANDO MUDA (§9): ao montar já vem acesa, sem teatro —
   a cinta monta de novo ao voltar da luta e não pode repetir nada.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { TAMANHOS_DA_MOLDURA, ESTADOS_DA_MOLDURA, ICONES_DE_ITEM, MOLDURA_POR_DEGRAU } from "./estilo.js";
import { partesDaMoldura, partesDaCarta, molduraDe } from "./moldura.js";

/* as peças de moldura.js ([tag, atributos, filhos]) em elementos React */
function pintar(lista, chave = "p") {
  return lista.map(([tag, a, f], i) => React.createElement(tag, { key: chave + i, ...a }, Array.isArray(f) ? pintar(f, chave + i + "-") : f));
}

/* o prefixo dos gradientes: um por moldura, senão duas na mesma página
   pintavam-se com o metal uma da outra */
function useIdDaMoldura() {
  return "moldura" + React.useId().replace(/[^A-Za-z0-9]/g, "");
}

/* verdadeiro depois de a gema MUDAR (vazia → acesa, ou outra pedra); ao
   montar, falso. Nunca custa o turno: sem o efeito, a gema só não anima. */
function useAcendeu(chave) {
  const antes = React.useRef(chave);
  const [acendeu, setAcendeu] = React.useState(false);
  React.useEffect(() => {
    try {
      if (antes.current !== chave) { if (chave) setAcendeu(true); antes.current = chave; }
    } catch (e) { /* parada, a gema continua a dizer a subclasse */ }
  }, [chave]);
  return acendeu;
}

/* UMA CAMADA: o SVG da caixa inteira (com o transbordo), posto por cima do
   aro de `px` px. `k` = px por unidade; o aro ocupa 10..90 u. */
export function CamadaDaMoldura({ partes, px, camada = "abaixo", nivel = null, fonte = TAMANHOS_DA_MOLDURA.anel.numero, tombado = false, comDefs = false }) {
  const vb = partes.vb, k = px / 80;
  const n = partes.numero;
  return (
    <svg aria-hidden="true" width={vb[2] * k} height={vb[3] * k} viewBox={vb.join(" ")}
      className="absolute pointer-events-none"
      style={{ left: (vb[0] - 10) * k, top: (vb[1] - 10) * k, overflow: "visible", filter: tombado ? `grayscale(${ESTADOS_DA_MOLDURA.tombado})` : "none" }}>
      {comDefs ? pintar([partes.defs], "d") : null}
      {pintar(partes[camada], camada)}
      {camada === "acima" && n && nivel != null ? (
        <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" className="tv-titulo" fontSize={fonte / k} fill={n.cor}>{nivel}</text>
      ) : null}
    </svg>
  );
}

/* A MOLDURA DO ANEL DA CINTA: as peças para quem tem `ente`, ou null. Só a
   partir de TAMANHOS_DA_MOLDURA.anel.de px (§1 desenhou o anel para 36–44;
   abaixo disso os traços somem). O disco só se `comDisco` e a partir de
   discoDesde. Nunca lança: uma ficha torta dá um anel sem moldura. */
export function useMolduraDoAnel(ente, lado, px, comDisco = false) {
  const id = useIdDaMoldura();
  let m = null;
  try { m = ente && px >= TAMANHOS_DA_MOLDURA.anel.de ? molduraDe(ente, lado) : null; } catch (e) { m = null; }
  const acende = useAcendeu(m && m.gema ? m.gema.pedra : null);
  if (!m) return null;
  try {
    const disco = !!comDisco && px >= TAMANHOS_DA_MOLDURA.anel.discoDesde;
    return { ...m, comDisco: disco, partes: partesDaMoldura({ degrau: m.degrau, lado: m.lado, forma: "anel", gema: m.gema, selo: m.selo, comDisco: disco, retrato: false, acende, id }) };
  } catch (e) { return null; }
}

/* A MOLDURA. `tamanho`: "anel" | "medalhao" | "carta". `aro` muda o
   diâmetro do aro em px (o anel vai de 36 a 44). `children` pode ser uma
   função que recebe o diâmetro da janela, para o Retrato ter a medida certa. */
/* AS MARCAS DA MOLDURA (05/11, formas.md §AAA §12, aprovada pela pessoa): os
   feitos gravados no aro, como as horas de um relógio — o entalhe (chefe), a
   runa (missão cumprida), a cicatriz de ouro (voltou do chão). Cada uma leva
   a sua linha num <title>; a ficha lista-as por extenso. Só no medalhão e na
   carta: no anel da cinta não cabem. */
function MarcasNoAro({ marcas, cx, cy, r }) {
  if (!Array.isArray(marcas) || !marcas.length) return null;
  const tam = Math.max(3, r * 0.14);
  return (
    <svg aria-hidden="true" className="absolute pointer-events-none" style={{ left: 0, top: 0, overflow: "visible" }} width={cx * 2} height={cy * 2}>
      {marcas.map((m, i) => (
        <g key={i} transform={`rotate(${m.angulo} ${cx} ${cy})`}>
          <title>{m.linha}</title>
          {m.forma === "entalhe" ? <line x1={cx} y1={cy - r - tam} x2={cx} y2={cy - r + tam * 0.4} stroke={T.couroBaixo} strokeWidth={Math.max(1.5, tam * 0.45)} strokeLinecap="round" />
            : m.forma === "runa" ? <polygon points={`${cx},${cy - r - tam} ${cx + tam * 0.6},${cy - r} ${cx},${cy - r + tam} ${cx - tam * 0.6},${cy - r}`} fill={T.mundoSoft} stroke={T.couroBaixo} strokeWidth="0.8" />
            : <path d={`M ${cx - tam} ${cy - r - tam * 0.3} Q ${cx} ${cy - r + tam * 0.6} ${cx + tam} ${cy - r - tam * 0.3}`} fill="none" stroke={MOLDURA_POR_DEGRAU.ouro.claro || T.amberSoft} strokeWidth={Math.max(1.2, tam * 0.35)} strokeLinecap="round" />}
        </g>
      ))}
    </svg>
  );
}

export function Moldura({ degrau = "ferro", lado = "heroi", tier = null, tamanho = "medalhao", gema = null, selo = false, nivel = null, ca = null, aro = null, tombado = false, marcas = null, children }) {
  const id = useIdDaMoldura();
  const acende = useAcendeu(gema ? gema.pedra : null);
  const deg = MOLDURA_POR_DEGRAU[degrau] ? degrau : "ferro";
  if (tamanho === "carta") {
    const largura = aro || TAMANHOS_DA_MOLDURA.carta.largura, k = largura / 160;
    const p = partesDaCarta({ degrau: deg, lado, gema, selo, acende, id });
    const vb = p.vb, j = p.janela;
    const fonte = TAMANHOS_DA_MOLDURA.carta.numero / k;
    const caixa = { position: "absolute", left: 0, top: 0, overflow: "visible", filter: tombado ? `grayscale(${ESTADOS_DA_MOLDURA.tombado})` : "none" };
    return (
      <span className="relative inline-block shrink-0" style={{ width: vb[2] * k, height: vb[3] * k }}>
        <svg aria-hidden="true" width={vb[2] * k} height={vb[3] * k} viewBox={vb.join(" ")} className="pointer-events-none" style={caixa}>
          {pintar([p.defs], "d")}{pintar(p.abaixo, "b")}
        </svg>
        <span className="absolute" style={{ left: (j.x - vb[0]) * k, top: (j.y - vb[1]) * k, width: j.largura * k, height: j.altura * k, lineHeight: 0 }}>
          {typeof children === "function" ? children(Math.round(j.largura * k)) : children}
        </span>
        <svg aria-hidden="true" width={vb[2] * k} height={vb[3] * k} viewBox={vb.join(" ")} className="pointer-events-none" style={caixa}>
          {pintar(p.acima, "a")}
          {nivel != null ? <text x={p.numero.x} y={p.numero.y} textAnchor="middle" dominantBaseline="central" className="tv-titulo" fontSize={fonte} fill={p.numero.cor}>{nivel}</text> : null}
          {ca != null ? <text x={p.ca.x} y={p.ca.y} textAnchor="middle" dominantBaseline="central" className="tv-titulo" fontSize={fonte} fill={p.ca.cor}>{ca}</text> : null}
        </svg>
      </span>
    );
  }
  const anel = tamanho === "anel";
  const T_ = anel ? TAMANHOS_DA_MOLDURA.anel : TAMANHOS_DA_MOLDURA.medalhao;
  const px = aro || (anel ? T_.ate : T_.aro), k = px / 80;
  const comDisco = nivel != null && (!anel || px >= T_.discoDesde);
  const p = partesDaMoldura({ degrau: deg, lado, tier, forma: anel ? "anel" : "medalhao", gema, selo, comDisco, acende, id });
  const vb = p.vb, jan = p.janela;
  const diam = Math.round(2 * jan.r * k);
  return (
    <span className="relative inline-block shrink-0" style={{ width: vb[2] * k, height: vb[3] * k }}>
      <span className="absolute" style={{ left: -(vb[0] - 10) * k, top: -(vb[1] - 10) * k, width: px, height: px }}>
        <CamadaDaMoldura partes={p} px={px} camada="abaixo" comDefs tombado={tombado} />
        <span className="absolute" style={{ left: (jan.cx - jan.r - 10) * k, top: (jan.cy - jan.r - 10) * k, width: diam, height: diam, lineHeight: 0, borderRadius: "50%", overflow: "hidden" }}>
          {typeof children === "function" ? children(diam) : children}
        </span>
        <CamadaDaMoldura partes={p} px={px} camada="acima" nivel={comDisco ? nivel : null} fonte={T_.numero} tombado={tombado} />
        {!anel ? <MarcasNoAro marcas={marcas} cx={(jan.cx - 10) * k} cy={(jan.cy - 10) * k} r={jan.r * k} /> : null}
      </span>
    </span>
  );
}

/* A GEMA SOZINHA — o engaste no metal do degrau e a pedra (ou o furo
   vazio). `tamanho` é o diâmetro do engaste em px. */
export function Gema({ gema = null, degrau = "ferro", tamanho = 16 }) {
  const id = useIdDaMoldura();
  const acende = useAcendeu(gema ? gema.pedra : null);
  const p = partesDaMoldura({ degrau: MOLDURA_POR_DEGRAU[degrau] ? degrau : "ferro", forma: "anel", gema, comDisco: false, retrato: false, acende, id });
  /* a gema do anel mora em (50, 10) com raio 5,4 + 2,4 de engaste */
  const r = 7.8;
  const pedra = p.acima.filter(([tag, a]) => (a.cx === 50 && a.cy === 10) || tag === "g");
  return (
    <svg aria-hidden="true" width={tamanho} height={tamanho} viewBox={`${50 - r} ${10 - r} ${2 * r} ${2 * r}`} style={{ display: "block", overflow: "visible" }}>
      {pintar([p.defs], "d")}{pintar(pedra, "g")}
    </svg>
  );
}

/* O ÍCONE DE ITEM (§3): quadro 24, traço 1,5, pontas e juntas redondas, a
   família dos glifos de ui.jsx. Na cor ink dentro do encaixe; a borda da
   raridade é do Encaixe, não do ícone. */
export function IconeDeItem({ nome, tamanho = 24, cor = T.ink, rotulo }) {
  const ds = ICONES_DE_ITEM[nome];
  if (!ds) return null;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      role={rotulo ? "img" : undefined} aria-label={rotulo || undefined} aria-hidden={rotulo ? undefined : "true"} style={{ display: "block" }}>
      {ds.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
