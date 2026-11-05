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
   · IconeDeItem — o glifo do item por tipo (ICONES_DE_ITEM), em ink; com
     `raridade`, ganha a borda da cor e da forma dela (§3).
   · Encaixe — o quadrado de 56 de um item (§3, Figma 253:352): a raridade
     em cor E forma, o vazio tracejado com o glifo a 35%, o escolhido.
   · Disco — o atributo como peça (§2, Figma 253:383): repouso, ganhou,
     no teto.

   O TRANSBORDO É RESERVADO, NUNCA CORTADO (§1): a Moldura mede a caixa
   inteira de VB_DA_MOLDURA, e o rosto pousa na janela dela.

   A GEMA ACENDE SÓ QUANDO MUDA (§9): ao montar já vem acesa, sem teatro —
   a cinta monta de novo ao voltar da luta e não pode repetir nada.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { TAMANHOS_DA_MOLDURA, ESTADOS_DA_MOLDURA, ICONES_DE_ITEM, MOLDURA_POR_DEGRAU, ICONES_DE_ATRIBUTO, COR_DA_RARIDADE, ENCAIXE, DISCO_DE_ATRIBUTO, alfa } from "./estilo.js";
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
   família dos glifos de ui.jsx. Na cor ink. Com `raridade` (chave de
   COR_DA_RARIDADE) ganha a borda da cor e da forma dela — a mesma do
   Encaixe, em miniatura, para a linha da loja, do chão e do recibo. */
export function IconeDeItem({ nome, tamanho = 24, cor = T.ink, rotulo, raridade = null }) {
  const ds = ICONES_DE_ITEM[nome];
  if (!ds) return null;
  const svg = (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      role={rotulo ? "img" : undefined} aria-label={rotulo || undefined} aria-hidden={rotulo ? undefined : "true"} style={{ display: "block" }}>
      {ds.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
  const c = raridade ? COR_DA_RARIDADE[raridade] : null;
  if (!c) return svg;
  /* o ícone ocupa no quadro a mesma fração que no encaixe (32 em 56) */
  const lado = Math.round(tamanho * ENCAIXE.lado / ENCAIXE.icone);
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: lado, height: lado, borderRadius: ENCAIXE.raio * lado / ENCAIXE.lado, background: c.fundo }}>
      <MarcasDaRaridade raridade={raridade} lado={lado} />
      {svg}
    </span>
  );
}

/* A RARIDADE EM COR E FORMA (§3, a geometria do SVG do Figma 253:352, num
   quadro de 56): o fio por dentro (1 ou 2), a gota do raro, os quatro
   cantos do épico em diante, a estrela do único. O brilho do lendário e do
   único é do Encaixe (anima), não daqui. */
function MarcasDaRaridade({ raridade, lado }) {
  const c = COR_DA_RARIDADE[raridade];
  if (!c) return null;
  const E = ENCAIXE, L = E.lado, f = c.fio, m = E.marcas[raridade] || [];
  const { de, braco } = E.canto, fim = L - de;
  const cantos = [
    `M${de} ${de + braco}V${de}H${de + braco}`, `M${fim - braco} ${de}H${fim}V${de + braco}`,
    `M${fim} ${fim - braco}V${fim}H${fim - braco}`, `M${de + braco} ${fim}H${de}V${fim - braco}`,
  ];
  const { x, y, r, miolo } = E.estrela;
  const estrela = `M${x} ${y - r}L${x + miolo} ${y - miolo}L${x + r} ${y}L${x + miolo} ${y + miolo}L${x} ${y + r}L${x - miolo} ${y + miolo}L${x - r} ${y}L${x - miolo} ${y - miolo}Z`;
  return (
    <svg aria-hidden="true" width={lado} height={lado} viewBox={`0 0 ${L} ${L}`} fill="none" className="absolute inset-0 pointer-events-none">
      <rect x={f / 2} y={f / 2} width={L - f} height={L - f} rx={E.raio - f / 2} stroke={c.cor} strokeWidth={f} />
      {m.includes("gota") ? <circle cx={E.gota.x} cy={E.gota.y} r={E.gota.r} fill={c.cor} /> : null}
      {m.includes("cantos") ? cantos.map((d, i) => <path key={i} d={d} stroke={c.cor} strokeWidth={E.canto.espessura} strokeLinecap="round" />) : null}
      {m.includes("estrela") ? <path d={estrela} fill={c.cor} /> : null}
    </svg>
  );
}

/* O ENCAIXE (§3, §9): o quadrado de um item, alvo de 56 (≥ 44, WCAG 2.5.5).
   `raridade` null = vazio: tracejado em lineStrong, o `glifo` do que lá vai
   a 35% (GLIFO_DO_ENCAIXE). `escolhido`: o anel âmbar por fora e a sombra,
   o fundo fundoEscolhido. O foco (anel T.mundo) e o pressionado (0,96) são
   do CSS (.tv-encaixe). Lendário e único: o brilho de dentro respira
   (.tv-encaixe-brilho; parado a 0,45 com reduce). `rotulo` vai por baixo, a
   11; `canto` é a marca miúda do canto de baixo (a quantidade). Sem
   `aoTocar` é só figura. */
export function Encaixe({ raridade = null, icone = null, glifo = null, escolhido = false, rotulo = "", aoTocar = null, ariaLabel = "", lado = ENCAIXE.lado, canto = null }) {
  const E = ENCAIXE, k = lado / E.lado;
  const c = raridade ? COR_DA_RARIDADE[raridade] : null;
  const vazio = !c;
  const brilho = !vazio && (E.marcas[raridade] || []).includes("brilho");
  const sombras = [];
  if (escolhido) sombras.push(`0 ${E.sombraDoEscolhido.y}px ${E.sombraDoEscolhido.raio}px ${alfa(E.sombra, E.sombraDoEscolhido.alfa)}`);
  if (brilho) sombras.push(`0 0 ${E.brilho.fora}px ${alfa(c.cor, E.brilho.alfaDeFora)}`);
  const estilo = {
    width: lado, height: lado, borderRadius: E.raio * k,
    background: vazio ? T.panel : escolhido ? c.fundoEscolhido : c.fundo,
    border: vazio ? `${E.vazio.tracejado}px dashed ${T.lineStrong}` : "none",
    boxShadow: sombras.length ? sombras.join(", ") : "none",
    ...(escolhido ? { outline: `${E.anel.espessura}px solid ${T.amber}`, outlineOffset: E.anel.folga } : null),
  };
  const nome = vazio ? glifo : icone;
  const miolo = (
    <>
      {!vazio ? <MarcasDaRaridade raridade={raridade} lado={lado} /> : null}
      {brilho ? <span aria-hidden="true" className="tv-encaixe-brilho absolute inset-0 pointer-events-none" style={{ borderRadius: E.raio * k, boxShadow: `inset 0 0 ${E.brilho.raio}px ${c.cor}` }} /> : null}
      <span className="relative" style={{ opacity: vazio ? E.vazio.alfaDoGlifo : 1 }}>
        <IconeDeItem nome={nome} tamanho={Math.round(E.icone * k)} />
      </span>
      {canto != null ? <span className="absolute tv-mono" style={{ right: E.canto.de * k, bottom: 0, fontSize: E.rotulo * k, color: T.inkDim }}>{canto}</span> : null}
    </>
  );
  const quadrado = aoTocar ? (
    <button type="button" onClick={aoTocar} aria-label={ariaLabel || rotulo || undefined} aria-pressed={escolhido}
      className="tv-encaixe relative shrink-0 inline-flex items-center justify-center" style={estilo}>{miolo}</button>
  ) : (
    <span className="relative shrink-0 inline-flex items-center justify-center" style={estilo} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel || undefined}>{miolo}</span>
  );
  if (!rotulo) return quadrado;
  return (
    <span className="inline-flex flex-col items-center shrink-0" style={{ gap: E.rotulo / 2 }}>
      {quadrado}
      <span className="tv-body" style={{ fontSize: E.rotulo, color: T.inkDim, lineHeight: 1.1 }}>{rotulo}</span>
    </span>
  );
}

/* O ÍCONE DE ATRIBUTO (§2): os seis do mesmo traço, ICONES_DE_ATRIBUTO. */
export function IconeDeAtributo({ atributo, tamanho = DISCO_DE_ATRIBUTO.icone, cor = T.amberSoft }) {
  const ds = ICONES_DE_ATRIBUTO[atributo];
  if (!ds) return null;
  return (
    <svg aria-hidden="true" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      {ds.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

/* O DISCO DE ATRIBUTO (§2, §9; Figma 253:383): disco de 64 em panelSoft, o
   aro no metal do degrau do herói (a ficha sobe de degrau com ele), o ícone
   em amberSoft, o número em Cinzel 22, o rótulo e a linha por baixo.
   `estado`: "repouso" | "ganhou" (aro âmbar com halo, número amberSoft) |
   "teto" (não aceita ponto; a linha em inkDim). Com `aoTocar` é botão. */
export function Disco({ atributo, valor, rotulo = "", linha = "", estado = "repouso", degrau = "ferro", aoTocar = null, titulo = "" }) {
  const D = DISCO_DE_ATRIBUTO;
  const ganhou = estado === "ganhou";
  const metal = (MOLDURA_POR_DEGRAU[degrau] || MOLDURA_POR_DEGRAU.ferro).meio;
  const disco = {
    width: D.lado, height: D.lado, borderRadius: "50%", background: T.panelSoft,
    border: `${ganhou ? D.aroGanhou : D.aro}px solid ${ganhou ? T.amber : metal}`,
    boxShadow: ganhou ? `0 0 ${D.halo}px ${alfa(T.amber, D.alfaDoHalo)}` : "none",
  };
  const miolo = (
    <>
      <span className="tv-disco inline-flex flex-col items-center justify-center shrink-0" style={disco}>
        <IconeDeAtributo atributo={atributo} />
        <span className="tv-titulo" style={{ fontSize: D.numero, lineHeight: 1, color: ganhou ? T.amberSoft : T.ink }}>{valor}</span>
      </span>
      <span className="tv-body" style={{ fontSize: D.rotulo, color: T.inkDim, lineHeight: 1.1 }}>{rotulo}</span>
      {linha ? <span className="tv-mono" style={{ fontSize: D.linha, color: estado === "teto" ? T.inkDim : T.ok, lineHeight: 1.1 }}>{linha}</span> : null}
    </>
  );
  const caixa = { gap: D.folga, padding: D.folga / 2 };
  if (!aoTocar) return <span className="inline-flex flex-col items-center" style={caixa} title={titulo || undefined}>{miolo}</span>;
  return (
    <button type="button" onClick={aoTocar} aria-pressed={ganhou} title={titulo || undefined}
      aria-label={`${rotulo} ${valor}${linha ? ", " + linha : ""}`}
      className="tv-disco inline-flex flex-col items-center rounded-xl" style={caixa}>{miolo}</button>
  );
}
