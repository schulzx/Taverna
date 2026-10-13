/* ============================================================
   O MAPA VIVO — a faixa do rumo e a tela grande (MM17, a tela) — Taverna

   A forma: `mente/formas.md` § Mapa (o `desenho`, 10/10, com a assinatura
   do `jogo`); o Figma da pessoa `ffWFqD7TueSb88Mkeg9bhW`, página `07 ·
   Mapa` — a faixa `172:1466`, a tela grande `166:88` (mesa) e `173:1454`
   (telefone). Liberado para construir em 12/10: "também temos o mapa que
   ainda não foi codado e está pronto".

   O QUE ESTE ARQUIVO FAZ: desenha. Os dados são `dadosDoMapaVivo`
   (mapa-vivo.js) e `vereditoDaPartida` (partida.js); a projecção (rumo,
   profundidade, câmara, nomes sem colisão, o fundo) é `faixa-do-rumo.js`;
   as cores e medidas são `MAPA_VIVO` (estilo.js). Nenhuma regra nasce aqui.

   ---------------- O CONTRATO ----------------

   <FaixaDoRumo dados estadoDaPartida telefone recolhida aoTocarLugar />
     dados           — a saída de `dadosDoMapaVivo(mapa, estado)`, ou null
                       (o continente: a faixa não aparece);
     estadoDaPartida — o `estado` de `vereditoDaPartida` (o mesmo snapshot
                       que fez `dados`, com `mapa` e `ritmo`); opcional — sem
                       ele o alvo diz as horas da aresta, sem a rota;
     telefone        — 343×48, 140° à frente, só ícones;
     recolhida       — em combate recolhe a zero (a mesa de batalha precisa
                       da janela) e volta sem animar;
     aoTocarLugar(id)— tocar num ícone abre a tela grande COM o cartão desse
                       lugar (2 toques, não 3).
   Altura fixa (96 · 48), fora da área que rola; mede a própria largura.
   Lá dentro de uma masmorra (`heroi.onde === "masmorra"`) vira a descida.

   <TelaDoMapa dados estadoDaPartida telefone inicial aoPartir aoFechar />
     inicial         — o id do lugar cujo cartão abre (o da faixa); sem ele,
                       o alvo do feixe, e sem esse o sítio do herói;
     aoPartir(id, veredito) — o verbo do cartão (`O verbo com preço`). O
                       veredito vem inteiro (horas, chegada, noites, rota);
                       null quando o motor não o soube dar e o verbo mostrou
                       só as horas da ficha;
     aoFechar()      — o × de 44, `Esc` e `M`.
   Ocupa a janela inteira (`position: fixed`), por cima da cena; a câmara
   abre no herói e nunca voa. Setas andam de nó em nó; Enter é o verbo.

   ---------------- O QUE A TELA NUNCA DIZ (§5) ----------------
   O nome de mecanismo: o feixe é "para onde a história chama", o estado é
   "só se ouviu falar"; a contagem de ocultos não passa por aqui; o lugar
   do fim só aparece quando `dados` o traz. O fundo não lê o fim.
   ============================================================ */
import React from "react";
import { T, ALVOS } from "./constantes.js";
import { MAPA_VIVO, TIPOS, alfa } from "./estilo.js";
import { VerboComPreco } from "./ui.jsx";
import { PORTES } from "./geografia.js";
import { ESTACOES } from "./calendario.js";
import { PERIGO_POR_NIVEL } from "./regiao.js";
import { vereditoDaPartida } from "./partida.js";
import {
  itensDaFaixa, cristasDaFaixa, alvoDoFeixe, modoDaLuz, fundoDaCarta, camaraDaCarta, noEcra,
  curvaDaAresta, pontoNaCurva, colocarRotulos, vizinhoNaSeta, larguraDoTexto, textoDeHoras,
  rumoPorExtenso, quemEmTexto, chaosDosNos,
} from "./faixa-do-rumo.js";

const MV = MAPA_VIVO;
/* A máscara da névoa é de luminância, e o "branco" dela é a tinta mais
   clara da casa (`T.ink`, luminância ~0,78): um branco literal seria cor
   solta. O alfa do véu compensa, para a névoa fora dos furos dar o
   `nevoaAlfa` da tabela e não 78 % dele. */
const luminancia = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const ALFA_DA_NEVOA = Math.min(1, MAPA_VIVO.carta.nevoaAlfa / luminancia(T.ink));

/* ---------------- OS GLIFOS DO MAPA (`Mapa/Glifo`, `160:98`) ----------------
   Grade 24, traço 1,75. Um por porte e por tipo de lugar; a base usa o da
   capital; "?" é o que só se ouviu; a caveira é o perigo; o selo é o fim.
   O emoji do motor não entra: emoji não herda a cor da tinta. */
const CAMINHOS_DO_GLIFO = {
  capital: "M3 21H21M5 21V11L8 9V6H10V8H14V6H16V9L19 11V21M10 21V17C10 16.47 10.21 15.96 10.59 15.59C10.96 15.21 11.47 15 12 15C12.53 15 13.04 15.21 13.41 15.59C13.79 15.96 14 16.47 14 17V21M12 6V2L16 3.5L12 5",
  fortaleza: "M10 21V17H14V21M4 21V8H7V5H10V8H14V5H17V8H20V21H4Z",
  cidade: "M3 21V11L7 8L11 11V21V7L16 3L21 7V21M6 14H8M15 10H17M15 14H17M2 21H22",
  vila: "M2 21V13L7 9L12 13V21V15L17 11L22 15V21M5 21V18H9V21",
  aldeia: "M4 21V14C4 11.88 4.84 9.84 6.34 8.34C7.84 6.84 9.88 6 12 6M12 6C14.12 6 16.16 6.84 17.66 8.34C19.16 9.84 20 11.88 20 14V21M12 6V3M3 21H21M10 21V17H14V21",
  forte: "M3 21V9L5 7L7 9V21M10 21V9L12 7L14 9V21M17 21V9L19 7L21 9V21M2 14H22",
  ruina: "M3 21H21M6 21V8M10 21V12L9 9M14 21V15M18 21V6L17 8M5 8H7M17 6H19",
  caverna: "M9 20C9 18.94 9.32 17.92 9.88 17.17C10.44 16.42 11.2 16 12 16C12.8 16 13.56 16.42 14.12 17.17C14.68 17.92 15 18.94 15 20M2 20L9 6L13 10L15 8L22 20H2Z",
  torre: "M8 21V8L7 6V3H9V4.5H11V3H13V4.5H15V3H17V6L16 8V21M6 21H18M11 13H13",
  cripta: "M3 21H21M12 9V15M10 11H14M5 21V11C5 9.14 5.74 7.36 7.05 6.05C8.36 4.74 10.14 4 12 4C13.86 4 15.64 4.74 16.95 6.05C18.26 7.36 19 9.14 19 11V21H5Z",
  templo: "M5 9V19M9.5 9V19M14.5 9V19M19 9V19M3 21H21M3 9L12 3L21 9H3Z",
  mina: "M3 21H21M5 21V14L12 9L19 14V21M9 21V16M9 16H15V21L9 16Z",
  acampamento: "M12 4L3 20H21L12 4ZM12 4V20M8.5 20L12 13L15.5 20M2 20H22",
  boato: "M9 9C8.99 8.45 9.14 7.91 9.42 7.43C9.71 6.96 10.11 6.57 10.6 6.32C11.09 6.06 11.64 5.94 12.19 5.98C12.74 6.01 13.27 6.2 13.72 6.51C14.17 6.83 14.53 7.26 14.75 7.77C14.97 8.27 15.05 8.83 14.97 9.38C14.9 9.92 14.67 10.44 14.33 10.87C13.98 11.29 13.52 11.62 13 11.8C12.4 12.1 12 12.6 12 13.3V14M12 18H12.01",
  perigo: "M9.5 11.5H9.51M14.5 11.5H14.51M10.5 18V21M13.5 18V21M12 3C10.14 3 8.36 3.74 7.05 5.05C5.74 6.36 5 8.14 5 10C5 12.4 6.2 14.2 8 15.3V18H16V15.3C17.8 14.2 19 12.4 19 10C19 8.14 18.26 6.36 16.95 5.05C15.64 3.74 13.86 3 12 3Z",
  concluido: "M5 12.5L9.5 17L19 7.5",
};
/* o porte e o tipo do motor → o glifo (sem acento na chave: "ruína" do
   motor e "ruina" de PORTES caem no mesmo desenho) */
const GLIFO_DO_SUBTIPO = { metropole: "capital", "ruína": "ruina" };
function glifoDoNo(no) {
  if (!no) return "ruina";
  if (no.estado === "boato") return "boato";
  if (no.tipo === "base") return "capital";
  const s = String(no.subtipo || "");
  const k = GLIFO_DO_SUBTIPO[s] || s;
  return CAMINHOS_DO_GLIFO[k] ? k : no.tipo === "lugar" ? "ruina" : "vila";
}

/* ---------------- AS PALAVRAS (a voz do jogo: você) ---------------- */
const PALAVRA_DO_ESTADO = { boato: "só se ouviu falar", conhecido: "caminho conhecido", visitado: "você já esteve lá", concluido: "terminado" };
const PARA_ONDE_CHAMA = "para onde a história chama";
const PALAVRA_DA_FASE = { madrugada: "madrugada", amanhecer: "amanhecer", manha: "manhã", tarde: "tarde", entardecer: "entardecer", noite: "noite" };
const CHAO_EM_PALAVRAS = { floresta: "na mata", gelo: "no gelo", planicie: "no campo", colina: "nas colinas", costa: "na costa", pantano: "no pântano", deserto: "no deserto", montanha: "na montanha" };
/* a seta para fora, por rumo: a seta reta e o quanto ela roda (o `rotate`
   do tspan) — as diagonais desenhadas assim, e não com o caractere
   diagonal, que é emoji do sistema e não herda a tinta */
const SETA_DO_RUMO = { norte: ["↑", 0], nordeste: ["→", -45], leste: ["→", 0], sudeste: ["→", 45], sul: ["↓", 0], sudoeste: ["←", -45], oeste: ["←", 0], noroeste: ["←", 45] };
const ORDINAL = ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta", "sétima", "oitava"];
/* o que vence pelo caminho (`prazos` do veredito) — texto do `aprendiz`,
   à espera da assinatura do `jogo` (está no diário) */
const PALAVRA_DO_PRAZO = {
  exaustao: "o cansaço chega pelo caminho",
  invocacao: "uma conjuração se desfaz",
  peticao: "uma petição fica sem resposta",
  revolta: "um domínio se revolta",
  nemesis: "a ameaça dá um passo",
};
const SEM_FICHA = "Ninguém sabe. É o preço de não ter ido ver.";
const rotuloDoPerigo = (id) => (PERIGO_POR_NIVEL.find((p) => p.id === id) || {}).rotulo || "";
const nomeDaEstacao = (id) => ((ESTACOES.find((e) => e.id === id) || {}).nome || "").toLowerCase();
const capitular = (s) => { const t = String(s || "").trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?…]$/.test(t) ? "" : ".") : ""; };

function relogioEmTexto(rel) {
  if (!rel) return "";
  const est = nomeDaEstacao(rel.estacao);
  return [`Dia ${rel.dia}`, rel.hora, [PALAVRA_DA_FASE[rel.fase], est && `de ${est}`].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
}
function noPorId(dados, id) { return (dados && Array.isArray(dados.nos) && dados.nos.find((n) => n.id === id)) || null; }

function ondeEmTexto(dados) {
  const h = (dados && dados.heroi) || {};
  const no = noPorId(dados, h.noId);
  if (h.onde === "viagem" && h.jornada) {
    const j = h.jornada;
    const para = (noPorId(dados, j.paraId) || {}).nome || j.para;
    const feito = j.horasFeitas != null ? ` — ${textoDeHoras(j.horasFeitas).replace(" h", " h feitas")}` : "";
    const falta = j.horasQueFaltam != null ? `, faltam ${textoDeHoras(j.horasQueFaltam)}` : "";
    return `Na estrada para ${para}${feito}${falta}.`;
  }
  if (h.onde === "masmorra" && h.masmorra) {
    const p = h.masmorra.progresso || {};
    return `Você está dentro de ${h.masmorra.nome}${p.total ? ` — ${p.visitadas} de ${p.total} salas` : ""}.`;
  }
  if (h.onde === "boca" && no) return `Você está à porta de ${no.nome}.`;
  if (h.onde === "arredor") return `Você está em ${h.lugar}${h.cidade ? `, fora de ${h.cidade}` : ""}.`;
  if ((h.onde === "base" || h.onde === "povoado") && no) return `Você está em ${no.nome}.`;
  return "Você está longe de qualquer lugar que o mapa conheça.";
}

/* "forte · no gelo · 4 h ao sul de Casa do Martelo" */
function subtituloDoLugar(dados, no) {
  const base = (dados.nos || []).find((n) => n.tipo === "base");
  const tipo = no.tipo === "lugar" ? no.subtipo : (PORTES[no.subtipo] || {}).rotulo || no.subtipo;
  const chao = CHAO_EM_PALAVRAS[no.bioma] || "";
  const longe = base && base.id !== no.id && no.horasDaBase != null ? `${textoDeHoras(no.horasDaBase)} ${rumoPorExtenso(base, no)} de ${base.nome}`.trim() : "";
  return [tipo, chao, longe].filter(Boolean).join(" · ");
}

/* o preço escrito por baixo do verbo, a partir do veredito inteiro */
function precoDoVeredito(dados, v) {
  const via = (v.rota || []).slice(1, -1).map((id) => (noPorId(dados, id) || {}).nome).filter(Boolean);
  const como = via.length ? `por ${via.join(" e ")}` : v.modo === "a_pe" ? "a pé" : "de estrada";
  const partes = [`${textoDeHoras(v.horas)} ${como}`];
  const rel = dados.relogio;
  if (v.chegada) {
    const outroDia = rel && v.chegada.dia > rel.dia ? ` do dia ${v.chegada.dia}` : "";
    partes.push(`você chega às ${v.chegada.hora}${outroDia}${v.chegada.noite ? ", de noite" : ""}`);
  }
  if (v.noites != null) partes.push(v.noites === 0 ? "sem noite ao relento" : `${v.noites} ${v.noites === 1 ? "noite" : "noites"} ao relento`);
  for (const p of v.prazos || []) if (PALAVRA_DO_PRAZO[p.id]) partes.push(PALAVRA_DO_PRAZO[p.id]);
  return partes.join(" · ");
}
/* as horas do alvo na faixa: o veredito (com a rota), ou a aresta */
function horasDoAlvo(dados, alvo, v) {
  const h = dados.heroi || {};
  if (h.onde === "viagem" && h.jornada && h.jornada.horasQueFaltam != null) return `faltam ${textoDeHoras(h.jornada.horasQueFaltam)}`;
  if (v) {
    const via = (v.rota || []).slice(1, -1).map((id) => (noPorId(dados, id) || {}).nome).filter(Boolean);
    return `${textoDeHoras(v.horas)} ${via.length ? `por ${via[0]}` : v.modo === "a_pe" ? "a pé" : "de estrada"}`;
  }
  const a = (dados.arestas || []).find((x) => (x.de === h.noId && x.para === alvo.id) || (x.para === h.noId && x.de === alvo.id));
  return a ? `${textoDeHoras(a.horas)} ${a.modo === "a_pe" ? "a pé" : "de estrada"}` : "";
}
function vereditoSeguro(dados, id, estado) {
  if (!dados || !id || !estado) return null;
  try { return vereditoDaPartida(dados, id, estado); } catch { return null; }
}

/* ---------------- A LARGURA (a faixa mede-se) ---------------- */
function useLargura(ref, padrao, ativo) {
  const [w, setW] = React.useState(padrao);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => { const l = el.getBoundingClientRect().width; if (l > 0) setW(Math.round(l)); };
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, ativo]);
  return w;
}

/* ============================================================
   AS PEÇAS (SVG)
   ============================================================ */

/* `Mapa/Marcador de lugar` numa caixa de 44, centrado em (cx, cy) */
function Marcador({ no, cx, cy, escala = 1, opacidade = 1, nevoa, proximo = false }) {
  const M = MV.marcador;
  const boato = no.estado === "boato";
  const visitado = no.estado === "visitado" || no.estado === "concluido";
  const g = glifoDoNo(no);
  const lado = (boato ? M.boato.glifo : M.glifo) * escala;
  return (
    <g opacity={opacidade} aria-hidden="true">
      {proximo ? <circle cx={cx} cy={cy} r={M.anel.raio * escala} fill="none" stroke={MV.gancho} strokeWidth={M.anel.fio * escala} strokeDasharray={M.anel.traco} /> : null}
      {boato
        ? <circle cx={cx} cy={cy} r={M.boato.raio * escala} fill={nevoa} stroke={MV.tintaDim} strokeWidth={M.boato.fio * escala} strokeDasharray={M.boato.traco} />
        : <circle cx={cx} cy={cy} r={M.raio * escala} fill={visitado ? MV.painelAlto : MV.medalhao} stroke={visitado ? MV.tinta : MV.medalhaoBorda} strokeWidth={M.fio * escala} />}
      <svg x={cx - lado / 2} y={cy - lado / 2} width={lado} height={lado} viewBox="0 0 24 24" overflow="visible">
        <path d={CAMINHOS_DO_GLIFO[g]} fill="none" stroke={boato ? MV.tintaDim : MV.tinta} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {no.estado === "concluido" ? (
        <g>
          <circle cx={cx + M.selo.dx * escala} cy={cy + M.selo.dy * escala} r={M.selo.raio * escala} fill={MV.concluido} stroke={MV.halo} strokeWidth={M.selo.fio * escala} />
          <svg x={cx + (M.selo.dx - M.selo.glifo / 2) * escala} y={cy + (M.selo.dy - M.selo.glifo / 2) * escala} width={M.selo.glifo * escala} height={M.selo.glifo * escala} viewBox="0 0 24 24">
            <path d={CAMINHOS_DO_GLIFO.concluido} fill="none" stroke={MV.heroiTinta} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </g>
      ) : null}
    </g>
  );
}

/* `Mapa/Herói`: o losango âmbar com o halo */
function Losango({ cx, cy, escala = "mesa" }) {
  const H = MV.heroiForma[escala] || MV.heroiForma.mesa;
  const m = H.meio, i = H.miolo;
  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} r={H.halo} fill={MV.heroi} opacity={MV.heroiForma.haloAlfa} />
      <path d={`M${cx} ${cy - m}L${cx + m} ${cy}L${cx} ${cy + m}L${cx - m} ${cy}Z`} fill={MV.heroi} stroke={MV.heroiTinta} strokeWidth={H.fio} strokeLinejoin="round" />
      <path d={`M${cx} ${cy - i}L${cx + i} ${cy}L${cx} ${cy + i}L${cx - i} ${cy}Z`} fill={MV.heroiTinta} />
    </g>
  );
}

/* `Mapa/Feixe`: a coluna que sobe do alvo (gradiente do gancho) e o fio */
function Feixe({ id, cx, base, altura, largura, fio, alfaMax = MV.faixa.feixe.alfa }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`mv-coluna-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MV.gancho} stopOpacity="0" />
          <stop offset="1" stopColor={MV.gancho} stopOpacity={alfaMax} />
        </linearGradient>
        <linearGradient id={`mv-fio-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MV.gancho} stopOpacity="0" />
          <stop offset="1" stopColor={MV.gancho} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x={cx - largura / 2} y={base - altura} width={largura} height={altura} fill={`url(#mv-coluna-${id})`} />
      <rect x={cx - fio / 2} y={base - altura} width={fio} height={altura} fill={`url(#mv-fio-${id})`} />
    </g>
  );
}

/* `Mapa/Perigo` em SVG (o selo a meio da aresta) */
function SeloNaAresta({ cx, cy, nivel }) {
  const P = MV.perigoForma;
  const n = P.caveiras[nivel] || 0;
  if (!n) return null;
  const S = P.selo;
  const largura = 2 * S.lado + n * S.glifo + (n - 1) * S.entre;
  const cor = P.aCor.includes(nivel) ? MV.perigo : nivel === "baixo" ? MV.tintaDim : MV.tinta;
  const borda = P.aCor.includes(nivel) ? MV.perigo : MV.medalhaoBorda;
  return (
    <g aria-hidden="true">
      <rect x={cx - largura / 2} y={cy - S.altura / 2} width={largura} height={S.altura} rx={S.raio} fill={MV.medalhao} stroke={borda} />
      {Array.from({ length: n }, (_, k) => (
        <svg key={k} x={cx - largura / 2 + S.lado + k * (S.glifo + S.entre)} y={cy - S.glifo / 2} width={S.glifo} height={S.glifo} viewBox="0 0 24 24">
          <path d={CAMINHOS_DO_GLIFO.perigo} fill="none" stroke={cor} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" opacity={nivel === "baixo" ? P.apagada : 1} />
        </svg>
      ))}
    </g>
  );
}

/* `Mapa/Perigo` em HTML (o cartão, a legenda): Linha diz a palavra também */
function SeloDePerigo({ nivel, comPalavra = false }) {
  const P = MV.perigoForma;
  const n = P.caveiras[nivel] || 0;
  if (!n) return null;
  const S = P.selo;
  const quente = P.aCor.includes(nivel);
  return (
    <span className="inline-flex items-center shrink-0" style={{ height: comPalavra ? S.linha : S.altura, padding: `0 ${S.lado}px`, gap: S.entre, borderRadius: S.raio, background: MV.medalhao, border: `1px solid ${quente ? MV.perigo : MV.medalhaoBorda}` }}>
      {Array.from({ length: n }, (_, k) => (
        <svg key={k} width={S.glifo} height={S.glifo} viewBox="0 0 24 24" aria-hidden="true">
          <path d={CAMINHOS_DO_GLIFO.perigo} fill="none" stroke={quente ? MV.perigo : nivel === "baixo" ? MV.tintaDim : MV.tinta} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" opacity={nivel === "baixo" ? P.apagada : 1} />
        </svg>
      ))}
      {comPalavra ? <span className="tv-mono" style={{ fontSize: TIPOS.maquina, fontWeight: 500, color: MV.tinta, marginLeft: S.entre }}>{rotuloDoPerigo(nivel)}</span> : null}
    </span>
  );
}

/* ============================================================
   A FAIXA DO RUMO
   ============================================================ */
function Estrelas({ largura, opacidade }) {
  if (!opacidade) return null;
  const pts = [];
  for (let k = 0; k < MV.faixa.estrelas; k++) {
    const a = ((k * 7919) % 1000) / 1000, b = ((k * 104729) % 997) / 997;
    pts.push(<circle key={k} cx={a * largura} cy={2 + b * (MV.faixa.ceu.baixoY + 2)} r={k % 5 === 0 ? 1 : 0.6} fill={T.ink} />);
  }
  return <g opacity={opacidade} aria-hidden="true">{pts}</g>;
}

function Descida({ dados, largura, telefone }) {
  const D = MV.faixa.descida;
  const h = dados.heroi || {};
  const mm = h.masmorra || {};
  const camadas = Math.max(0, Number(mm.camadas) || 0);
  const atual = Math.max(0, Math.min(camadas, Number(mm.camada) || 0));
  const altura = telefone ? MV.medidas.faixaTelefone : MV.medidas.faixa;
  const prog = mm.progresso || { visitadas: 0, total: 0, pct: 0 };
  const nomeDoEstrato = (i) => (i === 0 ? "à entrada" : i === camadas ? "o fundo" : `${ORDINAL[i - 1] || `${i}ª`} descida`);
  let estratos = Array.from({ length: camadas + 1 }, (_, i) => i);
  if (estratos.length > D.maxEstratos) estratos = [...new Set([0, atual, Math.min(atual + 1, camadas), camadas])].sort((a, b) => a - b);
  if (telefone) estratos = [atual];
  const topo = telefone ? 0 : D.laFora;
  const alto = (altura - topo - D.vao * (estratos.length - 1)) / estratos.length;
  const x0 = telefone ? D.linhaXTelefone : D.linhaX, x1 = largura - (telefone ? D.linhaFimTelefone : D.linhaFim);
  const fr = Math.max(0, Math.min(1, (Number(prog.pct) || 0) / 100));
  const rel = dados.relogio;
  const modo = MV.modos[modoDaLuz(rel)];
  const lafora = rel ? ["lá fora", rel.hora, PALAVRA_DA_FASE[rel.fase]].filter(Boolean).join(" · ").toUpperCase() : "";
  return (
    <svg width={largura} height={altura} role="img" aria-label={`${mm.nome || "lá dentro"}: ${nomeDoEstrato(atual)}, ${prog.visitadas} de ${prog.total} salas`}>
      {!telefone ? (
        <g>
          <rect x="0" y="0" width={largura} height={D.laFora} fill={modo.ceuAlto} />
          {lafora ? <text x={largura - D.ladoDireito} y={D.laFora - 5} textAnchor="end" className="tv-mono" fontSize={TIPOS.maquina} letterSpacing="0.12em" fill={MV.tintaDim}>{lafora}</text> : null}
          {lafora ? <circle cx={largura - D.ladoDireito - larguraDoTexto(lafora, TIPOS.maquina, "mono", 0.12) - D.astro - 3} cy={D.laFora / 2} r={D.astro / 2} fill={modo.astro} /> : null}
        </g>
      ) : null}
      {estratos.map((i, k) => {
        const y = topo + k * (alto + D.vao);
        const aqui = i === atual;
        return (
          <g key={i}>
            <rect x="0" y={y} width={largura} height={alto} fill={aqui ? MV.painelAlto : MV.painel} opacity={aqui ? D.alfaDoAtual : i === camadas ? D.alfaDoFundo : 1} />
            <text x={D.rotuloX} y={y + alto / 2 + 4} className="tv-mono" fontSize={TIPOS.maquina} letterSpacing="0.12em" fill={aqui ? MV.tinta : MV.tintaDim}>{nomeDoEstrato(i).toUpperCase()}</text>
            {aqui ? (
              <g>
                <rect x={x0} y={y + alto / 2 - D.andada / 2} width={(x1 - x0) * fr} height={D.andada} fill={MV.heroi} />
                <rect x={x0 + (x1 - x0) * fr} y={y + alto / 2 - 0.5} width={(x1 - x0) * (1 - fr)} height={1} fill={MV.linha} />
                <Losango cx={x0 + (x1 - x0) * fr} cy={y + alto / 2} escala="faixa" />
              </g>
            ) : null}
          </g>
        );
      })}
      {!telefone ? <text x={largura - D.ladoDireito} y={D.nomeY + 14} textAnchor="end" className="tv-display" fontSize={MV.faixa.alvo.nome} fontStyle="italic" fontWeight="500" fill={MV.tinta}>{mm.nome}</text> : null}
      <text x={largura - D.ladoDireito} y={telefone ? altura / 2 + 4 : D.salasY + 12} textAnchor="end" className="tv-mono" fontSize={TIPOS.maquina} fontWeight="500" fill={MV.tintaMeio}>{`${prog.visitadas} de ${prog.total} salas`}</text>
    </svg>
  );
}

function Panorama({ dados, estadoDaPartida, largura, telefone, aoTocarLugar }) {
  const it = React.useMemo(() => { try { return itensDaFaixa(dados, { largura, telefone }); } catch { return null; } }, [dados, largura, telefone]);
  const cristas = React.useMemo(() => { try { return it ? cristasDaFaixa(dados, it) : null; } catch { return null; } }, [dados, it]);
  const alvo = it && it.alvoId ? noPorId(dados, it.alvoId) : null;
  const v = React.useMemo(() => (alvo ? vereditoSeguro(dados, alvo.id, estadoDaPartida) : null), [dados, alvo, estadoDaPartida]);
  if (!it) return null;
  const F = MV.faixa;
  const modo = MV.modos[it.modo];
  const meio = it.largura / 2;
  const h = dados.heroi || {};
  const viagem = h.onde === "viagem" && h.jornada;
  const lugarAlvo = it.lugares.find((l) => l.alvo);
  const horas = alvo && !telefone ? horasDoAlvo(dados, alvo, v) : "";
  const nevoa = modo.nevoa;
  return (
    <div className="relative" style={{ width: "100%", height: it.altura }}>
      <svg width={it.largura} height={it.altura} style={{ display: "block" }} aria-hidden="true">
        <defs>
          <linearGradient id="mv-ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={modo.ceuAlto} />
            <stop offset={String((F.ceu.baixoY + F.ceu.baixoAltura / 2) / MV.medidas.faixa)} stopColor={modo.ceuBaixo} stopOpacity={F.ceu.baixoAlfa} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={it.largura} height={it.altura} fill={modo.ceuAlto} />
        <rect x="0" y="0" width={it.largura} height={it.altura} fill="url(#mv-ceu)" />
        {!telefone ? <Estrelas largura={it.largura} opacidade={modo.estrelas} /> : null}
        {it.astro ? <circle cx={it.astro.x} cy={it.astro.y} r={it.astro.lado / 2} fill={modo.astro} /> : null}
        {cristas ? <path d={cristas.longe} fill={modo.cristaLonge} /> : null}
        {cristas ? <path d={cristas.perto} fill={modo.cristaPerto} /> : null}
        <rect x="0" y="0" width={it.largura} height={it.altura} fill={modo.veu} />
        {it.rumos.map((r) => (
          <text key={r.id} x={r.x} y={F.rumos.cima + 12} textAnchor="middle" className="tv-mono" fontWeight="500" fontSize={telefone ? F.rumos.letraTelefone : F.rumos.letra} fill={r.norte ? MV.tinta : MV.tintaDim}>{r.curto}</text>
        ))}
        {it.horizonte.filter((x) => !x.oculto).map((x) => (
          <text key={x.nome} x={x.x} y={x.y + 12} textAnchor="middle" className="tv-mono" fontSize={F.rumos.letra} letterSpacing={`${F.horizonte.rastreio}em`} fill={MV.tintaDim} opacity={F.horizonte.opacidade}>{x.texto}</text>
        ))}
        {it.lugares.filter((l) => !l.alvo).map((l) => (
          <Marcador key={l.id} no={noPorId(dados, l.id) || l} cx={l.x} cy={l.cy} escala={l.lado / MV.marcador.caixa} opacidade={l.opacidade} nevoa={nevoa} />
        ))}
        {lugarAlvo ? (
          <g>
            <Feixe id="faixa" cx={meio} base={lugarAlvo.cy} altura={lugarAlvo.cy - F.feixe.cima * it.escala} largura={F.feixe.largura * it.escala} fio={F.feixe.fio} />
            <circle cx={meio} cy={lugarAlvo.cy} r={(F.chaoAceso.lado / 2) * it.escala} fill={MV.gancho} opacity={F.chaoAceso.alfa} />
            <Marcador no={alvo || lugarAlvo} cx={lugarAlvo.x} cy={lugarAlvo.cy} escala={lugarAlvo.lado / MV.marcador.caixa} nevoa={nevoa} proximo />
          </g>
        ) : null}
        <path d={`M${meio - F.frente.largura / 2} 0L${meio + F.frente.largura / 2} 0L${meio} ${F.frente.altura}Z`} fill={MV.heroi} />
        {alvo && !telefone ? (
          <g>
            <text x={meio + F.alvo.dx} y={F.alvo.nomeY + 14} className="tv-display" fontSize={F.alvo.nome} fontStyle="italic" fontWeight="500" fill={MV.tinta} stroke={MV.halo} strokeWidth={MV.carta.rotulo.halo} paintOrder="stroke" strokeLinejoin="round">{alvo.nome}</text>
            {horas ? <text x={meio + F.alvo.dx} y={F.alvo.horasY + 12} className="tv-mono" fontSize={F.alvo.horas} fontWeight="500" fill={MV.gancho} stroke={MV.halo} strokeWidth={MV.carta.rotulo.halo} paintOrder="stroke" strokeLinejoin="round">{horas}</text> : null}
          </g>
        ) : null}
        {viagem ? (
          <g>
            <rect x="0" y={it.altura - F.estrada.andada} width={it.largura} height={F.estrada.fio} fill={MV.linha} />
            <rect x="0" y={it.altura - F.estrada.andada} width={it.largura * (Number(h.jornada.fracao) || 0)} height={F.estrada.andada} fill={MV.heroi} />
          </g>
        ) : <rect x="0" y={it.altura - 1} width={it.largura} height="1" fill={MV.linha} />}
      </svg>
      {/* os alvos de toque: 44 à volta de cada ícone, por cima do desenho */}
      {aoTocarLugar ? it.lugares.map((l) => (
        <button key={l.id} type="button" onClick={() => aoTocarLugar(l.id)}
          aria-label={`${l.nome} — ver no mapa`}
          className="tv-anel-foco absolute"
          style={{ left: l.x - MV.medidas.alvo / 2, top: Math.min(it.altura - MV.medidas.alvo, l.cy - MV.medidas.alvo / 2), width: MV.medidas.alvo, height: Math.min(MV.medidas.alvo, it.altura), background: "transparent", border: 0, borderRadius: MV.medidas.alvo / 2, cursor: "pointer" }} />
      )) : null}
    </div>
  );
}

export function FaixaDoRumo({ dados, estadoDaPartida = null, telefone = false, recolhida = false, aoTocarLugar = null }) {
  const ref = React.useRef(null);
  const largura = useLargura(ref, telefone ? 343 : 1142, !!dados && !recolhida);
  if (!dados || recolhida) return null;
  const altura = telefone ? MV.medidas.faixaTelefone : MV.medidas.faixa;
  const dentro = dados.heroi && dados.heroi.onde === "masmorra";
  return (
    <div ref={ref} role="group" aria-label="O horizonte a partir de onde você está" className="shrink-0 overflow-hidden" style={{ width: "100%", height: altura }}>
      {dentro
        ? <Descida dados={dados} largura={largura} telefone={telefone} />
        : <Panorama dados={dados} estadoDaPartida={estadoDaPartida} largura={largura} telefone={telefone} aoTocarLugar={aoTocarLugar} />}
    </div>
  );
}

/* ============================================================
   A TELA GRANDE — a carta
   ============================================================ */
function Carta({ dados, telefone, selecionado, aoSelecionar, alvoId }) {
  const C = MV.carta;
  const rebordo = telefone ? 0 : C.rebordo;
  const lado = telefone ? 375 : C.lado;
  const dentro = lado - 2 * rebordo;
  const zoom = telefone ? MV.medidas.zoomTelefone : MV.medidas.zoom;
  const escala = (telefone ? MV.medidas.medalhaoTelefone : MV.medidas.medalhao) / MV.medidas.medalhao;
  const modo = MV.modos[modoDaLuz(dados.relogio)];
  const h = dados.heroi || {};
  /* a câmara abre no herói e não voa; se o lugar tocado ficar fora da
     vista, ela salta para ele (sem animar) */
  const [centro, setCentro] = React.useState(() => (h.x != null ? { x: h.x, y: h.y } : null));
  const cam = camaraDaCarta(centro, { lado: dentro, zoom });
  const p = (x, y) => noEcra(cam, x, y);
  React.useEffect(() => {
    const n = noPorId(dados, selecionado);
    if (!n) return;
    const q = noEcra(cam, n.x, n.y);
    if (q.x < 0 || q.y < 0 || q.x > dentro || q.y > dentro) setCentro({ x: n.x, y: n.y });
  }, [selecionado]); // eslint-disable-line react-hooks/exhaustive-deps

  /* o fundo: uma vez por região (a mesma lista de chãos dá o mesmo fundo) */
  const chaveDoFundo = React.useMemo(() => JSON.stringify(chaosDosNos(dados)) + "|" + (dados.regiao && dados.regiao.nome), [dados]);
  const fundo = React.useMemo(() => { try { return fundoDaCarta(dados, { lado: dentro }); } catch { return null; } }, [chaveDoFundo, dentro]); // eslint-disable-line react-hooks/exhaustive-deps

  const nos = dados.nos || [];
  const pos = Object.fromEntries(nos.map((n) => [n.id, p(n.x, n.y)]));
  const estadoDe = Object.fromEntries(nos.map((n) => [n.id, n.estado]));
  const raio = MV.marcador.raio * escala;

  /* a névoa: abre à volta do que aparece (uniforme, §5.4) */
  const furos = nos.map((n) => ({ id: n.id, ...pos[n.id], r: (MV.medidas.nevoa[n.estado] || 0) * dentro * zoom }));
  if (h.onde === "viagem" && h.x != null) furos.push({ id: "heroi", ...p(h.x, h.y), r: MV.medidas.nevoa.heroiNaEstrada * dentro * zoom });

  /* as estradas */
  const jornada = h.onde === "viagem" ? h.jornada : null;
  const arestas = (dados.arestas || []).filter((a) => pos[a.de] && pos[a.para]);
  const curvaDe = (a) => { const pa = pos[a.de], pb = pos[a.para]; return { pa, pb, c: curvaDaAresta(pa, pb, a.id) }; };
  let heroiEm = null;
  if (jornada && jornada.arestaId) {
    const a = arestas.find((x) => x.id === jornada.arestaId);
    if (a) { const { pa, pb, c } = curvaDe(a); const t = a.de === jornada.deId ? jornada.fracao : 1 - jornada.fracao; heroiEm = pontoNaCurva(pa, c, pb, t); }
  }
  if (!heroiEm && h.noId && pos[h.noId]) heroiEm = { x: pos[h.noId].x - MV.heroiForma.encosto * escala, y: pos[h.noId].y - MV.heroiForma.encosto * escala };
  if (!heroiEm && h.x != null) heroiEm = p(h.x, h.y);
  const P = MV.perigoForma, PER = PERIGO_POR_NIVEL.map((x) => x.id);

  /* os nomes, por prioridade: a base, onde está o herói, o alvo, o tocado,
     os povoados, os lugares, os que só se ouviram */
  const R = C.rotulo;
  const ordem = (n) => (n.tipo === "base" ? 0 : n.aqui ? 1 : n.id === alvoId ? 2 : n.id === selecionado ? 3 : n.estado === "boato" ? 6 : n.tipo === "povoado" ? 4 : 5);
  const tamanho = (n) => (n.tipo === "base" ? R.base : n.estado === "boato" ? R.boato : n.tipo === "povoado" ? R.povoado : R.lugar);
  const rotulos = colocarRotulos([...nos].sort((a, b) => ordem(a) - ordem(b)).map((n) => ({
    id: n.id, x: pos[n.id].x, y: pos[n.id].y, raio, largura: larguraDoTexto(n.nome, tamanho(n)), altura: tamanho(n) * 1.2,
  })), { lado: dentro, vao: R.vao });
  const horasDoAlvoNaCarta = alvoId ? (() => { const n = noPorId(dados, alvoId); return n && n.horasDaBase != null && h.noId && (noPorId(dados, h.noId) || {}).tipo === "base" ? textoDeHoras(n.horasDaBase) : ""; })() : "";

  const reg = dados.quadro && dados.quadro.regua;
  const larguraDaRegua = reg ? reg.fracao * dentro * zoom : 0;
  const tocar = (id) => () => aoSelecionar && aoSelecionar(id);

  return (
    <svg viewBox={`0 0 ${lado} ${lado}`} role="img" aria-label={`A carta de ${(dados.regiao && dados.regiao.nome) || "a região"}`}
      style={{ display: "block", width: "100%", height: "auto", aspectRatio: "1 / 1" }}>
      <defs>
        <clipPath id="mv-quadro"><rect x="0" y="0" width={dentro} height={dentro} /></clipPath>
        <radialGradient id="mv-furo">
          <stop offset="0" stopColor={T.bg} stopOpacity="1" />
          <stop offset="0.55" stopColor={T.bg} stopOpacity="1" />
          <stop offset="1" stopColor={T.bg} stopOpacity="0" />
        </radialGradient>
        <mask id="mv-nevoa" maskUnits="userSpaceOnUse" x="0" y="0" width={dentro} height={dentro}>
          <rect x="0" y="0" width={dentro} height={dentro} fill={T.ink} />
          {furos.map((f) => <circle key={f.id} cx={f.x} cy={f.y} r={f.r} fill="url(#mv-furo)" />)}
        </mask>
      </defs>
      <rect x="0" y="0" width={lado} height={lado} fill={MV.moldura} />
      {/* o horizonte no rebordo, cada nome no seu rumo com a seta para fora */}
      {!telefone ? (dados.horizonte || []).map((z) => {
        const [seta, roda] = SETA_DO_RUMO[z.rumo] || ["", 0];
        const texto = <>{`${String(z.nome).toUpperCase()} `}<tspan rotate={roda || undefined}>{seta}</tspan></>;
        const meioR = rebordo / 2 + 4;
        if (z.y === 0 || z.y === 1) {
          const y = z.y === 0 ? meioR : lado - rebordo / 2 + 4;
          const x = z.x === 0 ? rebordo : z.x === 1 ? lado - rebordo : lado / 2;
          return <text key={z.nome} x={x} y={y} textAnchor={z.x === 0 ? "start" : z.x === 1 ? "end" : "middle"} className="tv-mono" fontSize={R.horizonte} letterSpacing="0.14em" fill={MV.tintaDim}>{texto}</text>;
        }
        const x = z.x === 0 ? meioR : lado - rebordo / 2 - 4;
        return <text key={z.nome} x={x} y={lado / 2} transform={`rotate(${z.x === 0 ? -90 : 90} ${x} ${lado / 2})`} textAnchor="middle" className="tv-mono" fontSize={R.horizonte} letterSpacing="0.14em" fill={MV.tintaDim}>{texto}</text>;
      }) : null}
      <g transform={`translate(${rebordo} ${rebordo})`}>
        <g clipPath="url(#mv-quadro)">
          {/* o chão, as matas, o gelo — no mundo, sob a câmara */}
          <g transform={`scale(${zoom}) translate(${-cam.x0} ${-cam.y0})`}>
            <rect x="0" y="0" width={dentro} height={dentro} fill={modo.chao[(dados.quadro && dados.quadro.chao) || "planicie"] || modo.chao.planicie} />
            {fundo ? Object.entries(fundo.chao).map(([b, d]) => <path key={b} d={d} fill={modo.chao[b]} />) : null}
            {fundo ? <path d={fundo.mata} fill={modo.mata} /> : null}
            {fundo ? <path d={fundo.picoSombra} fill={modo.picoSombra} /> : null}
            {fundo ? <path d={fundo.pico} fill={modo.pico} /> : null}
            {fundo ? <path d={fundo.arvore} fill={modo.arvore} /> : null}
            {fundo ? <path d={fundo.arvoreLuz} fill={modo.arvoreLuz} /> : null}
          </g>
          <rect x="0" y="0" width={dentro} height={dentro} fill={modo.nevoa} opacity={ALFA_DA_NEVOA} mask="url(#mv-nevoa)" />
          <rect x="0" y="0" width={dentro} height={dentro} fill={modo.veu} />
          {/* as estradas: a forma é o canal, não a cor */}
          {arestas.map((a) => {
            const { pa, pb, c } = curvaDe(a);
            const d = `M${pa.x} ${pa.y}Q${c.x} ${c.y} ${pb.x} ${pb.y}`;
            const fraca = estadoDe[a.de] === "boato" || estadoDe[a.para] === "boato";
            const E = C.estrada;
            return (
              <g key={a.id} opacity={fraca ? E.boato : 1}>
                {a.origem === "rota" ? <path d={d} fill="none" stroke={MV.estradaBorda} strokeWidth={E.casca} strokeLinecap="round" /> : null}
                {a.origem === "rota"
                  ? <path d={d} fill="none" stroke={MV.estrada} strokeWidth={E.rota} strokeLinecap="round" />
                  : a.modo === "a_pe"
                    ? <path d={d} fill="none" stroke={MV.trilha} strokeWidth={E.aPe} strokeDasharray={E.pontos} strokeLinecap="round" />
                    : <path d={d} fill="none" stroke={MV.trilha} strokeWidth={E.trilha} strokeDasharray={E.traco} />}
              </g>
            );
          })}
          {/* a estrada andada, em âmbar */}
          {jornada && jornada.arestaId ? (() => {
            const a = arestas.find((x) => x.id === jornada.arestaId);
            if (!a) return null;
            const { pa, pb, c } = curvaDe(a);
            const ida = a.de === jornada.deId;
            const pts = [];
            for (let k = 0; k <= 16; k++) { const t = (k / 16) * jornada.fracao; pts.push(pontoNaCurva(pa, c, pb, ida ? t : 1 - t)); }
            return <path d={`M${pts.map((q) => `${q.x} ${q.y}`).join("L")}`} fill="none" stroke={MV.heroi} strokeWidth={C.estrada.rota} strokeLinecap="round" />;
          })() : null}
          {/* o perigo da estrada: só nas arestas de onde se está e do tocado (§5.6) */}
          {arestas.filter((a) => PER.indexOf(a.perigo) >= PER.indexOf(P.noMapaDesde) && [a.de, a.para].some((id) => id === h.noId || id === selecionado)).map((a) => {
            const { pa, pb, c } = curvaDe(a);
            const m = pontoNaCurva(pa, c, pb, 0.5);
            return <SeloNaAresta key={`p-${a.id}`} cx={m.x} cy={m.y} nivel={a.perigo} />;
          })}
          {/* o feixe sobe do alvo */}
          {alvoId && pos[alvoId] ? <Feixe id="carta" cx={pos[alvoId].x} base={pos[alvoId].y} altura={C.feixe.altura} largura={C.feixe.largura} fio={C.feixe.fio} /> : null}
          {/* os lugares */}
          {nos.map((n) => (
            <g key={n.id} role="button" aria-label={`${n.nome}${PALAVRA_DO_ESTADO[n.estado] ? ", " + PALAVRA_DO_ESTADO[n.estado] : ""}`} onClick={tocar(n.id)} style={{ cursor: "pointer" }}>
              <circle cx={pos[n.id].x} cy={pos[n.id].y} r={MV.medidas.alvo / 2} fill="transparent" />
              <Marcador no={n} cx={pos[n.id].x} cy={pos[n.id].y} escala={escala} nevoa={modo.nevoa} proximo={n.id === alvoId} />
              {n.id === selecionado ? <circle cx={pos[n.id].x} cy={pos[n.id].y} r={(MV.marcador.anel.raio + 3) * escala} fill="none" stroke={MV.tinta} strokeWidth={1} /> : null}
            </g>
          ))}
          {heroiEm ? <Losango cx={heroiEm.x} cy={heroiEm.y} escala={telefone ? "telefone" : "mesa"} /> : null}
          {/* os nomes: a posição do nó não se mexe, o nome é que se afasta */}
          {nos.map((n) => {
            const r = rotulos[n.id];
            if (!r) return null;
            const tam = tamanho(n);
            const boato = n.estado === "boato";
            const x = r.x + r.largura / 2;
            return (
              <g key={`r-${n.id}`} aria-hidden="true">
                <text x={x} y={r.y + tam} textAnchor="middle" className="tv-display" fontSize={tam}
                  fontWeight={n.tipo === "lugar" ? 500 : 600} fontStyle={n.tipo === "lugar" || boato ? "italic" : "normal"}
                  fill={boato ? MV.tintaDim : MV.tinta} stroke={MV.halo} strokeWidth={R.halo} paintOrder="stroke" strokeLinejoin="round">{n.nome}</text>
                {n.id === alvoId && horasDoAlvoNaCarta ? (
                  <text x={x} y={r.y + tam + R.horasY} textAnchor="middle" className="tv-mono" fontSize={TIPOS.maquina} fill={MV.tintaMeio} stroke={MV.halo} strokeWidth={R.halo} paintOrder="stroke">{horasDoAlvoNaCarta}</text>
                ) : null}
              </g>
            );
          })}
          {/* a rosa dos ventos: o norte em cima */}
          {!telefone ? (() => {
            const L = C.rosa.lado, cx = dentro - C.rosa.dentro - L / 2, cy = C.rosa.dentro + L / 2 + 12, m = L / 2 - 4;
            return (
              <g aria-hidden="true">
                <text x={cx} y={cy - L / 2 - 2} textAnchor="middle" className="tv-display" fontSize={TIPOS.rotulo} fontWeight="600" fill={MV.tinta}>N</text>
                <circle cx={cx} cy={cy} r={L / 2 - 2} fill={MV.painel} stroke={MV.medalhaoBorda} />
                <path d={`M${cx} ${cy - m}L${cx + 4} ${cy}L${cx - 4} ${cy}Z`} fill={MV.tinta} />
                <path d={`M${cx} ${cy + m}L${cx + 4} ${cy}L${cx - 4} ${cy}Z`} fill={MV.tintaDim} />
                <path d={`M${cx - m} ${cy}L${cx} ${cy - 4}L${cx} ${cy + 4}Z`} fill={MV.tintaDim} />
                <path d={`M${cx + m} ${cy}L${cx} ${cy - 4}L${cx} ${cy + 4}Z`} fill={MV.tintaDim} />
              </g>
            );
          })() : null}
          {/* a régua diz km e horas, porque é em horas que o jogo cobra */}
          {reg ? (
            <g aria-hidden="true">
              {Array.from({ length: C.regua.segmentos }, (_, k) => (
                <rect key={k} x={C.regua.x + (k * larguraDaRegua) / C.regua.segmentos} y={dentro - C.regua.y - 22} width={larguraDaRegua / C.regua.segmentos} height={C.regua.barra}
                  fill={k % 2 === 0 ? MV.tinta : MV.halo} stroke={MV.tinta} strokeWidth="0.75" />
              ))}
              <text x={C.regua.x} y={dentro - C.regua.y} className="tv-mono" fontSize={TIPOS.maquina} fill={MV.tinta} stroke={MV.halo} strokeWidth={R.halo} paintOrder="stroke">{`${reg.km} km · ${textoDeHoras(reg.horas)} de marcha`}</text>
            </g>
          ) : null}
        </g>
        {!telefone ? <rect x="0" y="0" width={dentro} height={dentro} fill="none" stroke={MV.medalhaoBorda} strokeOpacity="0.5" /> : null}
      </g>
    </svg>
  );
}

/* ============================================================
   A TELA GRANDE — a coluna
   ============================================================ */
function OndeVoceEsta({ dados }) {
  const O = MV.coluna.onde;
  const j = dados.heroi && dados.heroi.onde === "viagem" ? dados.heroi.jornada : null;
  return (
    <div className="flex items-center" style={{ minHeight: O.altura, padding: `${O.lado - 4}px ${O.lado}px`, gap: O.entre, borderRadius: O.raio, background: MV.painel, border: `1px solid ${MV.linha}` }}>
      <svg width={MV.heroiForma.faixa.caixa} height={MV.heroiForma.faixa.caixa} className="shrink-0" aria-hidden="true"><Losango cx={16} cy={16} escala="faixa" /></svg>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 8 }}>
        <span className="tv-body" style={{ fontSize: TIPOS.corpo, color: MV.tinta }}>{ondeEmTexto(dados)}</span>
        {j ? (
          <span aria-hidden="true" style={{ display: "block", height: 4, borderRadius: 2, background: MV.linha, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${Math.round((Number(j.fracao) || 0) * 100)}%`, background: MV.heroi }} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Rotulo({ children }) {
  const K = MV.coluna.cartao;
  return <span className="tv-mono" style={{ fontSize: K.rotulo, letterSpacing: `${K.rastreio}em`, color: MV.tintaDim, textTransform: "uppercase" }}>{children}</span>;
}
function Bloco({ rotulo, children }) {
  return <div className="flex flex-col" style={{ gap: MV.coluna.cartao.entreLinhas }}><Rotulo>{rotulo}</Rotulo>{children}</div>;
}
function Selo({ children, quente = false }) {
  const K = MV.coluna.cartao;
  return (
    <span className="tv-mono inline-flex items-center" style={{ height: K.selo, padding: `0 ${K.seloLado}px`, borderRadius: K.seloRaio, fontSize: TIPOS.maquina, fontWeight: 500, color: quente ? MV.gancho : MV.tintaMeio, border: `1px solid ${quente ? MV.gancho : MV.medalhaoBorda}` }}>{children}</span>
  );
}

/* `Mapa/Cartão de lugar` (`164:179`): a ordem é a da decisão — o que é →
   quem anda lá → o preço → o que fica perto → o que se diz → o verbo */
function CartaoDoLugar({ dados, no, alvoId, veredito, telefone, aoPartir }) {
  const K = MV.coluna.cartao;
  const h = dados.heroi || {};
  const boato = no.estado === "boato";
  const aCaminho = h.onde === "viagem" && h.jornada && h.jornada.paraId === no.id;
  const aqui = no.aqui || h.noId === no.id;
  const vizinhos = (no.vizinhos || []).map((v) => {
    const n = noPorId(dados, v.id);
    const a = (dados.arestas || []).find((x) => (x.de === no.id && x.para === v.id) || (x.para === no.id && x.de === v.id));
    return n ? `${n.nome} · ${textoDeHoras(v.horas)}${a && a.modo === "a_pe" ? " a pé" : a ? " de estrada" : ""}` : null;
  }).filter(Boolean);
  const v = veredito;
  const aresta1 = v && v.pernas && v.pernas.length === 1 ? (dados.arestas || []).find((x) => (x.de === v.pernas[0].de && x.para === v.pernas[0].para) || (x.para === v.pernas[0].de && x.de === v.pernas[0].para)) : null;
  const idaEVolta = v ? [`ida ${textoDeHoras(v.horas)}`, v.horasDeVolta != null ? `volta ${textoDeHoras(v.horasDeVolta)}` : "", aresta1 && aresta1.km != null ? `${Math.round(aresta1.km)} km ${v.modo === "a_pe" ? "a pé" : "pela estrada"}` : ""].filter(Boolean).join(" · ") : "";

  /* o verbo: na estrada ou lá dentro, impedido; com o veredito, o preço
     inteiro; sem ele, as horas da ficha (e o `jogo` não assina essa metade) */
  let verbo = null;
  if (!aqui) {
    if (h.onde === "viagem") {
      verbo = { verbo: "Você já está na estrada", preco: h.jornada && h.jornada.horasQueFaltam != null ? `faltam ${textoDeHoras(h.jornada.horasQueFaltam)}` : "", impedido: true };
    } else if (h.onde === "masmorra") {
      verbo = { verbo: "Você está lá dentro", preco: "saia primeiro para partir", impedido: true };
    } else if (v) {
      verbo = { verbo: `Partir para ${no.nome}`, preco: precoDoVeredito(dados, v), papel: no.id === alvoId ? "armado" : "gesto" };
    } else if (no.horasDaBase != null) {
      verbo = { verbo: `Partir para ${no.nome}`, preco: `${textoDeHoras(no.horasDaBase)} de estrada`, papel: no.id === alvoId ? "armado" : "gesto" };
    }
  }
  return (
    <div className="flex flex-col" style={{ gap: K.entre, padding: telefone ? 16 : K.enchimento, borderRadius: K.raio, background: MV.painel, border: `1px solid ${MV.linha}` }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <span className="shrink-0 inline-flex items-center justify-center" style={{ width: K.medalhao, height: K.medalhao, borderRadius: K.medalhao / 2, background: boato ? MV.modos.dia.nevoa : MV.painelAlto, border: `${K.fio}px ${boato ? "dashed" : "solid"} ${boato ? MV.tintaDim : MV.tinta}` }}>
          <svg width={K.glifo} height={K.glifo} viewBox="0 0 24 24" aria-hidden="true">
            <path d={CAMINHOS_DO_GLIFO[glifoDoNo(no)]} fill="none" stroke={boato ? MV.tintaDim : MV.tinta} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
          <span className="tv-display" style={{ fontSize: K.titulo, lineHeight: K.tituloAltura, fontWeight: 600, color: MV.tinta }}>{no.nome}</span>
          <span className="tv-body" style={{ fontSize: K.sub, color: MV.tintaMeio }}>{subtituloDoLugar(dados, no)}</span>
        </div>
      </div>
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {aCaminho ? <Selo>a caminho</Selo> : PALAVRA_DO_ESTADO[no.estado] ? <Selo>{PALAVRA_DO_ESTADO[no.estado]}</Selo> : null}
        {no.id === alvoId ? <Selo quente>{PARA_ONDE_CHAMA}</Selo> : null}
      </div>
      {no.tipo === "lugar" ? (
        <Bloco rotulo="Quem anda lá">
          <span className="tv-body" style={{ fontSize: K.quem, lineHeight: 1.4, color: boato || !no.quem ? MV.tintaMeio : MV.tinta }}>{boato || !no.quem ? SEM_FICHA : quemEmTexto(no.quem)}</span>
        </Bloco>
      ) : null}
      {(no.perigo || (v && v.perigoDaEstrada) || idaEVolta) ? (
        <Bloco rotulo="O preço">
          {(no.perigo || (v && v.perigoDaEstrada)) ? (
            <span className="flex items-center flex-wrap" style={{ gap: 10 }}>
              {no.perigo ? <SeloDePerigo nivel={no.perigo} comPalavra /> : null}
              {v && v.perigoDaEstrada ? <span className="tv-body" style={{ fontSize: K.preco, color: MV.tintaMeio }}>{`a estrada: ${rotuloDoPerigo(v.perigoDaEstrada)}`}</span> : null}
            </span>
          ) : null}
          {idaEVolta ? <span className="tv-mono" style={{ fontSize: TIPOS.maquina, lineHeight: 1.4, color: MV.tintaMeio }}>{idaEVolta}</span> : null}
        </Bloco>
      ) : null}
      {vizinhos.length ? (
        <Bloco rotulo="Por perto">
          {vizinhos.map((t) => <span key={t} className="tv-body" style={{ fontSize: K.perto, lineHeight: 1.4, color: MV.tintaMeio }}>{t}</span>)}
        </Bloco>
      ) : null}
      {no.boato ? (
        <Bloco rotulo="O que se diz">
          <span className="tv-display" style={{ fontSize: K.dizem, lineHeight: 1.25, fontStyle: "italic", color: MV.tintaMeio }}>{`“${capitular(no.boato)}”`}</span>
        </Bloco>
      ) : null}
      {verbo ? (
        <div style={telefone ? { position: "sticky", bottom: 0, paddingTop: 8, paddingBottom: 8, background: MV.painel } : undefined}>
          <VerboComPreco verbo={verbo.verbo} preco={verbo.preco} papel={verbo.papel || "gesto"} impedido={verbo.impedido || null}
            atalho="↵" aoTocar={() => aoPartir && aoPartir(no.id, v || null)} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}

/* `Mapa/Legenda` (`165:58`): dez sinais na língua do jogador */
function Legenda({ aberta, aoAlternar }) {
  const L = MV.coluna.legenda;
  const amostra = (estado) => (
    <svg width={L.celula} height={L.linha} aria-hidden="true">
      <Marcador no={{ estado, tipo: "lugar", subtipo: "ruína" }} cx={L.celula / 2} cy={L.linha / 2} escala={L.linha / MV.marcador.caixa} nevoa={MV.modos.dia.nevoa} />
    </svg>
  );
  const linha = (tipo) => (
    <svg width={L.celula} height={L.linha} aria-hidden="true">
      {tipo === "estrada" ? <path d={`M2 ${L.linha / 2}H${L.celula - 2}`} stroke={MV.estrada} strokeWidth={MV.carta.estrada.rota} /> : null}
      {tipo === "trilha" ? <path d={`M2 ${L.linha / 2}H${L.celula - 2}`} stroke={MV.trilha} strokeWidth={MV.carta.estrada.trilha} strokeDasharray={MV.carta.estrada.traco} /> : null}
      {tipo === "aPe" ? <path d={`M2 ${L.linha / 2}H${L.celula - 2}`} stroke={MV.trilha} strokeWidth={MV.carta.estrada.aPe} strokeDasharray={MV.carta.estrada.pontos} strokeLinecap="round" /> : null}
    </svg>
  );
  const itens = [
    [amostra("boato"), PALAVRA_DO_ESTADO.boato], [amostra("conhecido"), PALAVRA_DO_ESTADO.conhecido],
    [amostra("visitado"), PALAVRA_DO_ESTADO.visitado], [amostra("concluido"), PALAVRA_DO_ESTADO.concluido],
    [<svg key="h" width={L.celula} height={L.linha} aria-hidden="true"><Losango cx={L.celula / 2} cy={L.linha / 2} escala="faixa" /></svg>, "você está aqui"],
    [<svg key="f" width={L.celula} height={L.linha} aria-hidden="true"><Feixe id="legenda" cx={L.celula / 2} base={L.linha - 2} altura={L.linha - 4} largura={MV.carta.feixe.largura} fio={MV.carta.feixe.fio} /></svg>, PARA_ONDE_CHAMA],
    [linha("estrada"), "estrada"], [linha("trilha"), "trilha"], [linha("aPe"), "a pé"],
    [<span key="p" style={{ width: L.celula, display: "inline-flex", justifyContent: "center" }}><SeloDePerigo nivel="alto" /></span>, "perigo (uma a três)"],
  ];
  return (
    <div className="flex flex-col" style={{ gap: L.entre, padding: `${L.cima}px ${L.enchimento}px ${L.enchimento}px`, borderRadius: L.raio, background: MV.painel, border: `1px solid ${MV.linha}` }}>
      <button type="button" onClick={aoAlternar} aria-expanded={aberta} className="tv-anel-foco tv-mono text-left"
        style={{ minHeight: ALVOS.piso, fontSize: TIPOS.maquina, letterSpacing: `${MV.coluna.cartao.rastreio}em`, color: MV.tintaDim, background: "transparent", border: 0, padding: 0, cursor: "pointer" }}>
        {aberta ? "LEGENDA" : "LEGENDA ▸"}
      </button>
      {aberta ? (
        <div className="grid" style={{ gridTemplateColumns: `repeat(${L.colunas}, minmax(0, 1fr))`, columnGap: L.vao, rowGap: L.entreLinhas }}>
          {itens.map(([sinal, texto]) => (
            <div key={texto} className="flex items-center" style={{ gap: 8, minHeight: L.linha }}>
              <span className="shrink-0 inline-flex items-center justify-center" style={{ width: L.celula }}>{sinal}</span>
              <span className="tv-body" style={{ fontSize: L.texto, color: MV.tintaMeio }}>{texto}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IconeFechar() {
  const F = MV.coluna.fechar;
  return (
    <svg width={F.glifo} height={F.glifo} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" fill="none" stroke={MV.tinta} strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}

export function TelaDoMapa({ dados, estadoDaPartida = null, telefone = false, inicial = null, aoPartir = null, aoFechar = null }) {
  const alvo = React.useMemo(() => { try { return alvoDoFeixe(dados); } catch { return null; } }, [dados]);
  const alvoId = alvo ? alvo.id : null;
  const primeiro = (inicial && noPorId(dados, inicial) ? inicial : null) || alvoId || (dados && dados.heroi && dados.heroi.noId) || ((dados && dados.nos && dados.nos[0]) || {}).id || null;
  const [selecionado, setSelecionado] = React.useState(primeiro);
  const [legenda, setLegenda] = React.useState(() => !telefone && (typeof window === "undefined" || window.innerHeight >= MV.coluna.legenda.abertaDesde));
  const no = noPorId(dados, selecionado);
  const veredito = React.useMemo(() => vereditoSeguro(dados, selecionado, estadoDaPartida), [dados, selecionado, estadoDaPartida]);
  const raiz = React.useRef(null);
  React.useEffect(() => { try { raiz.current && raiz.current.focus(); } catch { /* sem foco, sem drama */ } }, []);

  const aoTeclar = (e) => {
    const k = e.key;
    if (k === "Escape" || k === "m" || k === "M") { e.preventDefault(); if (aoFechar) aoFechar(); return; }
    const seta = { ArrowUp: "cima", ArrowDown: "baixo", ArrowLeft: "esquerda", ArrowRight: "direita" }[k];
    if (seta) { e.preventDefault(); const p = vizinhoNaSeta(dados.nos, selecionado, seta); if (p) setSelecionado(p); return; }
    if (k === "Enter" && e.target === raiz.current && no && aoPartir && veredito) { e.preventDefault(); aoPartir(no.id, veredito); }
  };
  if (!dados) return null;
  const titulo = (dados.regiao && dados.regiao.nome) || "";
  const C = MV.coluna;
  const fechar = (
    <button type="button" onClick={aoFechar || undefined} aria-label="Voltar à cena (Esc)" aria-keyshortcuts="Escape"
      className="tv-anel-foco shrink-0 inline-flex items-center justify-center"
      style={{ width: C.fechar.lado, height: C.fechar.lado, borderRadius: C.fechar.lado / 2, border: `1px solid ${MV.medalhaoBorda}`, background: "transparent", cursor: "pointer" }}>
      <IconeFechar />
    </button>
  );
  const cartao = no ? <CartaoDoLugar dados={dados} no={no} alvoId={alvoId} veredito={veredito} telefone={telefone} aoPartir={aoPartir} /> : null;

  if (telefone) {
    return (
      <div ref={raiz} tabIndex={-1} onKeyDown={aoTeclar} role="dialog" aria-modal="true" aria-label={`Mapa de ${titulo}`}
        className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: MV.moldura, outline: "none" }}>
        <div className="flex items-center shrink-0" style={{ height: MV.telefone.barra, padding: "0 6px", gap: 8, borderBottom: `1px solid ${MV.linha}` }}>
          {fechar}
          <span className="tv-display flex-1 min-w-0 truncate" style={{ fontSize: TIPOS.titulo, fontWeight: 600, color: MV.tinta }}>{titulo}</span>
          {dados.relogio ? <span className="tv-mono shrink-0" style={{ fontSize: TIPOS.maquina, color: MV.tintaMeio, paddingRight: 10 }}>{dados.relogio.hora}</span> : null}
        </div>
        <div className="shrink-0"><Carta dados={dados} telefone selecionado={selecionado} aoSelecionar={setSelecionado} alvoId={alvoId} /></div>
        <div className="flex-1 min-h-0 overflow-y-auto tv-scroll" style={{ background: MV.painel, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <div aria-hidden="true" className="flex items-center justify-center" style={{ height: MV.telefone.pega }}>
            <span style={{ width: 36, height: 4, borderRadius: 2, background: MV.medalhaoBorda }} />
          </div>
          <div className="flex flex-col" style={{ gap: 12, padding: "0 12px 12px" }}>
            <OndeVoceEsta dados={dados} />
            {cartao}
            <Legenda aberta={legenda} aoAlternar={() => setLegenda((x) => !x)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={raiz} tabIndex={-1} onKeyDown={aoTeclar} role="dialog" aria-modal="true" aria-label={`Mapa de ${titulo}`}
      className="fixed inset-0 z-50 overflow-auto tv-scroll" style={{ background: MV.moldura, outline: "none" }}>
      <div className="flex items-start justify-center" style={{ padding: MV.carta.margem, gap: C.vao, minHeight: "100%" }}>
        <div className="shrink" style={{ width: `min(${MV.carta.lado}px, calc(100vh - ${2 * MV.carta.margem}px), calc(100vw - ${C.largura + C.vao + 2 * MV.carta.margem}px))`, minWidth: 320 }}>
          <Carta dados={dados} telefone={false} selecionado={selecionado} aoSelecionar={setSelecionado} alvoId={alvoId} />
        </div>
        <div className="flex flex-col shrink-0" style={{ width: C.largura, gap: 16 }}>
          <div className="flex items-start" style={{ gap: 16 }}>
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: 4 }}>
              <h2 className="tv-display" style={{ fontSize: C.titulo, lineHeight: 1.2, fontWeight: 600, color: MV.tinta, margin: 0 }}>{titulo}</h2>
              {dados.relogio ? <span className="tv-body" style={{ fontSize: C.relogio, color: MV.tintaMeio }}>{relogioEmTexto(dados.relogio)}</span> : null}
            </div>
            {fechar}
          </div>
          <OndeVoceEsta dados={dados} />
          {cartao}
          <Legenda aberta={legenda} aoAlternar={() => setLegenda((x) => !x)} />
        </div>
      </div>
    </div>
  );
}
