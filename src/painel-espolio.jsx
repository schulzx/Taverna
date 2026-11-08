/* ============================================================
   OS ESPÓLIOS NA TELA (TE10 · 09/11/2026) — formas.md §TE
   Figma (página 334:2): as peças 334:325 (a carta), 334:24 (o fio do
   despertar), 334:40 (a linha do ganho), 335:119 (o veredito), 335:145 (a
   faixa do ganho), 335:166 (o chip do achado); as telas 336:63, 336:98,
   336:198 e 337:233 (a cerimónia), 337:368 (o despertar), 337:410 (a
   relíquia), 337:524 / 337:531 (o achado e o fecho pequeno).

   O ESPÓLIO APARECE NA PROPORÇÃO DO QUE VALE: a peça ganha uma cerimónia
   (PainelEspolio), a quest sem peça um chip no recibo (FaixaDoFecho), o
   achado do caminho outro chip (ChipDoAchado), a relíquia apaga a vela, e
   o artefacto que acorda tem a sua cerimónia irmã da subida (PainelDespertar).

   A cerimónia, quadro a quadro (§TE 2): o véu; «CONCLUÍDA» e o nome; a
   barra do XP enche por cima do que havia e as moedas contam; as cartas
   chegam de costas e viram uma a uma, da menos rara para a mais rara (a
   ordem é a de revelacaoDoEspolio — a tela nunca a refaz); a última, se é
   rara, treme e a luz vaza antes de virar; ao assentar fica escolhida e o
   veredito sobe por baixo, com os dois lados e «Equipar já» (o MESMO
   equipar da gaveta, pela prop aoEquipar).

   A SAÍDA, SEMPRE: o véu inteiro é o botão «Toque para saltar»; o primeiro
   toque (ou Esc) salta para o quadro final e nunca fecha; no quadro final,
   Esc fecha. Com prefers-reduced-motion só o quadro final, num esvanecer.

   Os tempos vivem no CSS (.tv-carta-*, .tv-reliquia-*, .tv-espolio-*); os
   atrasos saem de cronogramaDoEspolio (espolio-na-tela.js), que aplica o
   teto. Nenhum relógio de JavaScript: a face troca-se no animationend da
   primeira metade da viragem, e o fim do veredito é o fim da cerimónia.
   Tudo chega por props; nada se lê do App. Todos os componentes nascem
   FORA do render (a lei da casa: o que nasce dentro perde o foco).
   ============================================================ */
import React from "react";
import {
  T, alfa, COR_DA_RARIDADE, ENCAIXE, ICONES_DE_ITEM, CERIMONIA_DO_NIVEL, CERIMONIA_DA_TELA, ALVOS, TIPOS,
  REVELACAO_DO_ESPOLIO, LUZ_DA_RARIDADE, CARTA_DO_ESPOLIO, VEREDITO_DO_ESPOLIO, FIO_DO_DESPERTAR, FAIXA_DO_GANHO,
  FAIXA_DO_FECHO, CHIP_DO_ACHADO, DESPERTAR_DA_TELA, RELIQUIA_DA_TELA, PALAVRAS_DO_ESPOLIO,
} from "./estilo.js";
import { GLIFOS } from "./glifos.js";
import { Botao, Glifo } from "./ui.jsx";
import { IconeDeItem } from "./painel-moldura.jsx";
import { raridadeDoItem, iconeDoItem } from "./comparar-item.js";
import { RELIQUIAS } from "./relicas.js";
import {
  frase, cartasDoEspolio, ganhoDoEspolio, cronogramaDoEspolio, fioDoArtefacto, vereditoDoEspolio,
  nomeDaCarta, resumoDoEspolio, barraDoGanho, chipDoAchado, despertarNaTela,
} from "./espolio-na-tela.js";

const C = CARTA_DO_ESPOLIO, V = VEREDITO_DO_ESPOLIO, R = REVELACAO_DO_ESPOLIO, D = DESPERTAR_DA_TELA, Q = RELIQUIA_DA_TELA;
const W = PALAVRAS_DO_ESPOLIO, F = FIO_DO_DESPERTAR, CT = CERIMONIA_DA_TELA;
const atraso = (ms) => ({ animationDelay: `${Math.round(ms)}ms` });
const sombraDaCarta = `0 ${ENCAIXE.sombraDoEscolhido.y}px ${ENCAIXE.sombraDoEscolhido.raio}px ${alfa(ENCAIXE.sombra, ENCAIXE.sombraDoEscolhido.alfa)}`;
const ehForte = (r) => ["lendario", "unico"].includes(r);
const vazaDesde = (r) => ["raro", "epico", "lendario", "unico"].includes(r);

/* quem pediu menos movimento vê só o quadro final (§TE 2); nunca lança */
function querParado() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
}

/* a mesa da cerimónia é de 1024 para cima (VEREDITO_DO_ESPOLIO.mesaDesde, §TE 2):
   a coluna de 880 não cabe no corte de 768 da casa. Nunca lança. */
function useMesaDoEspolio() {
  const q = `(min-width: ${V.mesaDesde}px)`;
  const [mesa, setMesa] = React.useState(() => { try { return window.matchMedia(q).matches; } catch (e) { return true; } });
  React.useEffect(() => {
    try {
      const mm = window.matchMedia(q);
      const aoMudar = () => setMesa(mm.matches);
      mm.addEventListener("change", aoMudar);
      return () => mm.removeEventListener("change", aoMudar);
    } catch (e) { return undefined; }
  }, [q]);
  return mesa;
}

/* a estrela de quatro pontas na geometria do encaixe (ENCAIXE.estrela: r e
   miolo, na mesma razão), centrada em cx, cy com raio r */
function caminhoDaEstrela(cx, cy, r) {
  const m = r * ENCAIXE.estrela.miolo / ENCAIXE.estrela.r;
  return `M${cx} ${cy - r}L${cx + m} ${cy - m}L${cx + r} ${cy}L${cx + m} ${cy + m}L${cx} ${cy + r}L${cx - m} ${cy + m}L${cx - r} ${cy}L${cx - m} ${cy - m}Z`;
}

/* o losango oco do que ainda dorme (a mesma runa do fio, apagada) */
function LosangoOco({ lado = F.runa }) {
  return (
    <svg aria-hidden="true" width={lado} height={lado} viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <path d="M5 1L9 5L5 9L1 5Z" fill="none" stroke={T.inkDim} strokeWidth={F.traco} />
    </svg>
  );
}

/* ============================================================
   O FIO DO DESPERTAR (334:24): duas runas e a estrela do gesto. `novo`: o
   índice que acende agora (0, 1, ou "estrela"), animado no seu atraso.
   ============================================================ */
export function FioDoDespertar({ fio, k = 1, novo = null, atrasoDoNovo = 0 }) {
  if (!fio) return null;
  const casa = F.casa * k, runa = F.runa * k;
  return (
    <span aria-hidden="true" className="inline-flex items-center" style={{ gap: F.entre * k }}>
      {fio.runas.map((acesa, i) => (
        <span key={i} className="relative inline-flex items-center justify-center" style={{ width: casa, height: casa }}>
          <span style={{ width: runa, height: runa, transform: "rotate(45deg)", background: F.furo, border: `${F.traco}px solid ${F.aro}` }} />
          {acesa ? (
            <span className={`absolute ${novo === i ? "tv-runa-acende" : ""}`} style={{ width: runa, height: runa, transform: "rotate(45deg)", background: F.acesa, ...(novo === i ? atraso(atrasoDoNovo) : null) }} />
          ) : null}
        </span>
      ))}
      <svg width={casa} height={casa} viewBox={`0 0 ${F.casa} ${F.casa}`} className={novo === "estrela" ? "tv-estrela-acende" : ""} style={novo === "estrela" ? atraso(atrasoDoNovo) : undefined}>
        <path d={caminhoDaEstrela(F.casa / 2, F.casa / 2, F.casa / 2)} fill={fio.estrela ? F.acesa : F.furo} stroke={fio.estrela ? "none" : F.aro} strokeWidth={F.traco} />
      </svg>
    </span>
  );
}

/* AS MARCAS DA RARIDADE NA CARTA: a gota, os quatro cantos e a estrela do
   encaixe (ENCAIXE.gota, .canto, .estrela — a mesma geometria e a mesma
   tabela de quem leva qual, ENCAIXE.marcas), postas nos cantos da carta. */
function MarcasDaCarta({ raridade, k }) {
  const c = COR_DA_RARIDADE[raridade];
  const m = C.marcas[raridade] || [];
  if (!c || !m.length) return null;
  const E = ENCAIXE, Lx = C.lado, Ly = C.alto, { de, braco } = E.canto;
  const cantos = [
    `M${de} ${de + braco}V${de}H${de + braco}`, `M${Lx - de - braco} ${de}H${Lx - de}V${de + braco}`,
    `M${Lx - de} ${Ly - de - braco}V${Ly - de}H${Lx - de - braco}`, `M${de + braco} ${Ly - de}H${de}V${Ly - de - braco}`,
  ];
  const ex = Lx - (E.lado - E.estrela.x);
  return (
    <svg aria-hidden="true" width={Lx * k} height={Ly * k} viewBox={`0 0 ${Lx} ${Ly}`} fill="none" className="absolute pointer-events-none" style={{ left: -C.dentro.borda * k, top: -C.dentro.borda * k }}>
      {m.includes("gota") ? <circle cx={E.gota.x} cy={E.gota.y} r={E.gota.r} fill={c.cor} /> : null}
      {m.includes("cantos") ? cantos.map((d, i) => <path key={i} d={d} stroke={c.cor} strokeWidth={E.canto.espessura} strokeLinecap="round" />) : null}
      {m.includes("estrela") ? <path d={caminhoDaEstrela(ex, E.estrela.y, E.estrela.r)} fill={c.cor} /> : null}
    </svg>
  );
}

/* ============================================================
   A CARTA DO ESPÓLIO (334:325) — 120 × 168 de base, a `k` vezes.
   COSTAS: o couro com o filete e o selo rosa; do raro para cima a luz da
   raridade vaza pela borda (a antecipação, nunca o nome). FRENTE: o chão
   é COR_DA_RARIDADE.fundo, a borda e as marcas são as do encaixe, o nome
   em ink, a raridade escrita na placa. `escolhida`: o anel âmbar de 3.
   `luzViva`: o brilho que passa (raro) ao assentar; `antecipa`: o atraso
   da luz que vaza antes de virar (null = sem antecipação).
   ============================================================ */
export function CartaDoEspolio({ item, face = "frente", escolhida = false, k = 1, melhor = false, luzViva = false, antecipa = null, antecipaLonga = false, estrelaViva = false, novoNoFio = null, atrasoDoFio = 0 }) {
  const r = raridadeDoItem(item);
  const c = COR_DA_RARIDADE[r];
  const L = LUZ_DA_RARIDADE[r];
  const largura = C.lado * k, alto = C.alto * k, raio = C.raio * k, b = C.dentro.borda;
  const anel = escolhida ? { outline: `${C.escolhida.anel}px solid ${C.escolhida.cor}`, outlineOffset: C.escolhida.anel - 1 } : null;
  if (face === "costas") {
    const V2 = C.costas.vaza, vaza = vazaDesde(r), forte = ehForte(r);
    const halo = vaza ? `0 0 ${forte ? V2.raioForte : V2.raio}px ${alfa(c.cor, forte ? V2.alfaForte : V2.alfa)}` : null;
    const estrela = GLIFOS.estrela;
    return (
      <span aria-hidden="true" className="relative block" style={{ width: largura, height: alto, borderRadius: raio, background: C.costas.chao,
        border: `${b}px solid ${vaza ? c.cor : T.line}`, boxShadow: [sombraDaCarta, halo].filter(Boolean).join(", "), ...anel }}>
        <span className="absolute" style={{ inset: (C.costas.filete - b) * k, borderRadius: raio / 2, border: `1px solid ${T.lineStrong}` }} />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="relative flex items-center justify-center rounded-full" style={{ width: C.costas.selo * k, height: C.costas.selo * k, border: `${C.dentro.selo.traco}px solid ${T.rosa}` }}>
            {estrela ? (
              <svg width={C.costas.estrela * k} height={C.costas.estrela * k} viewBox="0 0 24 24"><path d={estrela.d} fill={T.rosa} /></svg>
            ) : null}
          </span>
        </span>
        {antecipa != null && vaza ? (
          <span className={`absolute pointer-events-none ${antecipaLonga ? "tv-luz-vaza-longa" : "tv-luz-vaza"}`}
            style={{ inset: -b, borderRadius: raio, boxShadow: `0 0 ${V2.raioForte * k}px ${c.cor}, inset 0 0 ${V2.raio * k}px ${alfa(c.cor, V2.alfa)}`, ...atraso(antecipa) }} />
        ) : null}
      </span>
    );
  }
  const halo = L && typeof L === "object" && L.halo ? L.halo : r === "unico" ? LUZ_DA_RARIDADE.lendario.halo : null;
  const lume = (L && typeof L === "object" && L.lume) || r === "unico";
  const D2 = C.dentro;
  const fio = fioDoArtefacto(item);
  return (
    <span aria-hidden="true" className="relative block" style={{ width: largura, height: alto, borderRadius: raio, background: c.fundo,
      border: `${b}px solid ${c.cor}`, boxShadow: [sombraDaCarta, halo ? `0 0 ${C.costas.vaza.raio}px ${alfa(c.cor, halo)}` : null].filter(Boolean).join(", "), ...anel }}>
      {halo ? (
        <span className={`absolute pointer-events-none ${lume ? "tv-encaixe-brilho" : ""}`}
          style={{ left: (D2.luz.x - b) * k, top: (D2.luz.y - b) * k, width: D2.luz.largura * k, height: D2.luz.alto * k, borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${alfa(c.cor, halo)}, ${alfa(c.cor, 0)} 70%)` }} />
      ) : null}
      {luzViva && L && typeof L === "object" && L.brilho ? (
        <span className="absolute pointer-events-none tv-brilho-passa" style={{ inset: -b, borderRadius: raio, boxShadow: `0 0 ${C.costas.vaza.raio * k}px ${c.cor}`, ...atraso(R.vira.abre) }} />
      ) : null}
      <span className="absolute" style={{ left: (D2.icone.x - b) * k, top: (D2.icone.y - b) * k }}>
        <IconeDeItem nome={iconeDoItem(item, ICONES_DE_ITEM)} tamanho={Math.round(C.icone * k)} />
      </span>
      <span className="absolute tv-titulo text-center" style={{ left: ((C.lado - D2.nome.largura) / 2 - b) * k, top: (D2.nome.y - b) * k, width: D2.nome.largura * k,
        fontSize: C.nome.tamanho * k, lineHeight: `${C.nome.entrelinha * k}px`, color: T.ink, letterSpacing: 0 }}>{item && item.nome}</span>
      {fio ? (
        <span className="absolute flex justify-center" style={{ left: 0, right: 0, top: (D2.fio.y - b) * k }}>
          <FioDoDespertar fio={fio} k={k} novo={novoNoFio} atrasoDoNovo={atrasoDoFio} />
        </span>
      ) : null}
      <span className="absolute flex items-center justify-center tv-body uppercase" style={{ left: -b, right: -b, bottom: -b, height: C.placa * k, background: T.panel,
        borderBottomLeftRadius: raio, borderBottomRightRadius: raio, color: c.cor, fontSize: C.rotulo * k, letterSpacing: `${D2.placa.espaco}em`, fontWeight: 500 }}>
        {W.raridade[r]}
      </span>
      {melhor ? (
        <span className="absolute tv-mono" style={{ left: (D2.melhor.x - b) * k, top: (D2.melhor.y - b) * k, fontSize: D2.melhor.tamanho * k, lineHeight: 1.4, padding: `${2 * k}px ${6 * k}px`,
          borderRadius: D2.melhor.raio * k, background: T.okFundo, border: `1px solid ${T.ok}`, color: T.ok, fontWeight: 600, whiteSpace: "nowrap" }}>{"▲ "}{W.melhor}</span>
      ) : null}
      <span className={estrelaViva ? "absolute inset-0 tv-estrela-acende" : "absolute inset-0"} style={estrelaViva ? atraso(Q.vira.abre) : undefined}>
        <MarcasDaCarta raridade={r} k={k} />
      </span>
    </span>
  );
}

/* ============================================================
   A LINHA DO GANHO (334:40): o rótulo, antes → depois, e ▲ ▼ em forma E
   cor; o leitor ouve «sobe» e «desce» em texto escondido.
   ============================================================ */
export function LinhaDoGanho({ linha }) {
  const l = linha || {};
  const sobe = l.sinal === "ok", desce = l.sinal === "danger";
  const cor = sobe ? T.ok : desce ? T.danger : T.inkDim;
  return (
    <div className="flex items-baseline gap-3 tv-body" style={{ fontSize: V.linha }}>
      <span className="flex-1" style={{ color: T.inkMeio }}>{l.rotulo}</span>
      <span className="tv-mono" style={{ color: T.ink }}>{l.antes} {"→"} {l.depois}</span>
      <span className="tv-mono text-right" aria-hidden="true" style={{ color: cor, minWidth: V.linha }}>{sobe ? "▲" : desce ? "▼" : "–"}</span>
      {sobe || desce ? <span className="sr-only">{sobe ? W.leitor.sobe : W.leitor.desce}</span> : null}
    </div>
  );
}

/* ============================================================
   O VEREDITO DO ESPÓLIO (335:119) — os dois lados antes do clique: as
   linhas da comparação, o que sai do corpo e para onde vai, e o botão que
   diz o preço (o da gaveta: âmbar, 48 de alto). «Guardar na mochila» é só
   a outra resposta: a peça já lá está.
   ============================================================ */
export function VereditoDoEspolio({ entrada, nivel = null, largura = V.largura.telefone, aoEquipar = () => {}, aoGuardar = () => {} }) {
  const idSai = React.useId();
  let v = null;
  try { v = vereditoDoEspolio(entrada, { nivel }); } catch (e) { v = null; }
  if (!v) return null;
  const c = COR_DA_RARIDADE[v.raridade];
  const outroLado = [v.sai, v.troca].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col w-full" style={{ maxWidth: largura, padding: V.enchimento, gap: V.vao, borderRadius: V.raio, background: T.panel,
      border: `1px solid ${v.raridade === "unico" ? c.cor : T.lineStrong}` }}>
      <div>
        <h3 className="tv-titulo" style={{ color: c.cor, fontSize: V.nome, lineHeight: 1.25 }}>{v.nome}</h3>
        <p className="tv-body" style={{ color: T.inkDim, fontSize: V.meta }}>{v.meta}</p>
      </div>
      {v.historia ? <p className="tv-body italic" style={{ color: T.inkMeio, fontSize: V.historia, lineHeight: 1.5 }}>{v.historia}</p> : null}
      {v.fio && v.estado ? (
        <div className="flex items-start gap-2">
          <FioDoDespertar fio={v.fio} />
          <span className="tv-body" style={{ color: T.amberSoft, fontSize: V.meta }}>{v.estado}</span>
        </div>
      ) : null}
      {v.gesto ? (
        <p className="tv-body flex items-start gap-2" style={{ color: c.cor, fontSize: V.meta }}>
          <span style={{ paddingTop: 2 }}><Glifo nome="estrela" tamanho={V.meta} cor={c.cor} /></span><span>{v.gesto}</span>
        </p>
      ) : null}
      {v.dorme ? <p className="tv-body" style={{ color: T.violetSoft, fontSize: V.meta }}>{v.dorme}</p> : null}
      {v.linhas.length ? <div className="flex flex-col gap-2">{v.linhas.map((l, i) => <LinhaDoGanho key={l.id || i} linha={l} />)}</div> : null}
      {v.porAcordar.map((t, i) => (
        <p key={i} className="tv-body flex items-start gap-2" style={{ color: T.inkDim, fontSize: V.meta }}>
          <span style={{ paddingTop: 4 }}><LosangoOco /></span><span>{t}</span>
        </p>
      ))}
      {v.naMochila ? <p className="tv-body" style={{ color: T.inkMeio, fontSize: V.meta }}>{v.naMochila}</p> : null}
      {outroLado ? <p id={idSai} className="tv-body" style={{ color: T.inkDim, fontSize: V.sai }}>{outroLado}</p> : null}
      {v.botao ? (
        <div className="flex flex-col gap-2">
          <Botao corpo primario desativado={!v.botao.pode} descritoPor={outroLado ? idSai : undefined}
            onClick={() => { if (v.botao.pode) aoEquipar(entrada.item, entrada.slot); }}>{v.botao.rotulo}</Botao>
          <Botao corpo onClick={aoGuardar}>{W.guardar}</Botao>
        </div>
      ) : null}
    </div>
  );
}

/* o número que conta (o --tv-n do CSS, sem relógio de JavaScript); o leitor
   ouve o número de chegada, uma vez */
function Conta({ n, classe, de, vivo }) {
  if (!vivo) return <>{n}</>;
  return (
    <>
      <span aria-hidden="true" className={`tv-conta ${classe}`} style={{ "--alvo": n, ...atraso(de) }} />
      <span className="sr-only">{n}</span>
    </>
  );
}

/* ============================================================
   A FAIXA DO GANHO (335:145): o XP como DIFERENÇA (o que já havia a 0,55,
   o que entra cheio), as moedas que contam e o favor com o lugar. Se passa
   o nível, o selo no fim da barra; a subida abre depois, pela fila.
   `barra`: de barraDoGanho, ou null (sem régua, sem barra).
   ============================================================ */
export function FaixaDoGanho({ xp = 0, moedas = 0, favores = [], barra = null, nivelNovo = null, vivo = false, largura = FAIXA_DO_GANHO.largura.telefone }) {
  const G = FAIXA_DO_GANHO;
  if (!(xp > 0) && !(moedas > 0) && !favores.length) return null;
  return (
    <div className="w-full flex flex-col" style={{ maxWidth: largura, gap: 8 }}>
      {xp > 0 ? (
        <div className="flex items-center">
          <span className="flex-1 tv-body uppercase" style={{ color: T.inkDim, fontSize: C.rotulo, letterSpacing: `${C.dentro.placa.espaco}em`, fontWeight: 500 }}>{W.experiencia}</span>
          <span className="tv-mono" style={{ color: T.amber, fontSize: TIPOS.rotulo, fontWeight: 600 }}>
            {"+"}<Conta n={xp} classe="tv-conta-xp" de={R.xp.de} vivo={vivo} />{barra && barra.subiu && nivelNovo ? ` · ${frase(W.nivel, { n: nivelNovo })}` : ""}
          </span>
        </div>
      ) : null}
      {xp > 0 && barra ? (
        <div className="relative w-full" style={{ height: G.barra, borderRadius: G.raio, background: T.panelSoft }}>
          <span className="absolute left-0 top-0 h-full" style={{ width: `${barra.havia * 100}%`, borderRadius: G.raio, background: alfa(T.amber, G.alfaDoQueHavia) }} />
          <span className={`absolute top-0 h-full ${vivo ? "tv-faixa-enche" : ""}`} style={{ left: `${barra.havia * 100}%`, width: `${barra.entra * 100}%`, borderRadius: G.raio, background: T.amber, ...(vivo ? atraso(R.xp.de) : null) }} />
          {barra.subiu ? (
            <span className="absolute" style={{ right: -G.moeda / 2, top: (G.barra - G.moeda - 2) / 2 }}><Glifo nome="estrela" tamanho={G.moeda + 2} cor={T.amberSoft} /></span>
          ) : null}
        </div>
      ) : null}
      {moedas > 0 || favores.length ? (
        <div className="flex items-center flex-wrap" style={{ gap: 12 }}>
          {moedas > 0 ? (
            <span className="inline-flex items-center tv-mono" style={{ gap: 8, color: T.ink, fontSize: TIPOS.rotulo, fontWeight: 600 }}>
              <Glifo nome="moeda" tamanho={G.moeda} cor={T.amber} />
              <span>{"+"}<Conta n={moedas} classe="tv-conta-moedas" de={R.moedas.de} vivo={vivo} />{" "}{frase(W.moedas, { n: "" }).trim()}</span>
            </span>
          ) : null}
          {favores.map((f, i) => (
            <span key={i} className={`tv-body ${vivo ? "tv-espolio-favor" : ""}`} style={{ color: T.inkMeio, fontSize: TIPOS.piso, border: `1px solid ${T.lineStrong}`, borderRadius: 10, padding: "3px 8px", ...(vivo ? atraso(R.favor.de) : null) }}>
              {f}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* a moldura de foco: Tab nunca sai do diálogo (WCAG 2.4.3); com a animação
   a correr, o único alvo é o véu-botão */
function prenderOFoco(e, raiz) {
  if (e.key !== "Tab" || !raiz) return;
  const alvos = [...raiz.querySelectorAll("button:not([disabled]), [tabindex='0']")].filter((x) => !x.closest("[aria-hidden='true']"));
  if (!alvos.length) return;
  const i = alvos.indexOf(document.activeElement);
  const prox = e.shiftKey ? (i <= 0 ? alvos.length - 1 : i - 1) : (i === alvos.length - 1 ? 0 : i + 1);
  e.preventDefault();
  try { alvos[prox].focus(); } catch (x) { /* sem foco, segue */ }
}

/* UMA CARTA NO GRUPO: as costas fora do grupo (sem nome), a frente um radio */
function CartaNoGrupo({ entrada, i, k, vivo, virada, escolhida, tempos, ehAUltima, aoVirar, aoEscolher, aoTeclar, reliquiaEscolhida }) {
  const t = tempos[i] || {};
  const item = entrada.item;
  const face = virada ? "frente" : "costas";
  const melhor = (entrada.linhas || []).some((l) => l.sinal === "ok");
  const vira = vivo ? (virada ? "tv-carta-vira-b" : "tv-carta-vira-a") : "";
  const carta = (
    <CartaDoEspolio item={item} face={face} escolhida={!vivo && escolhida} k={k} melhor={virada && melhor}
      luzViva={vivo && virada} antecipa={vivo && !virada && ehAUltima && t.antecipacao != null ? t.antecipacao : null} />
  );
  const fim = (e) => { if (e.target === e.currentTarget && e.animationName === "tvCartaViraA") aoVirar(i); };
  const opacidade = reliquiaEscolhida && !escolhida ? Q.outras : 1;
  return (
    <div className={vivo ? "tv-carta-chega" : ""} style={{ ...(vivo ? atraso(t.chega || 0) : null), opacity: opacidade }}>
      <div className={vivo && ehAUltima && t.antecipacao != null && !virada ? "tv-carta-treme" : ""} style={vivo && t.antecipacao != null ? atraso(t.antecipacao) : undefined}>
        {face === "frente" ? (
          <button type="button" role="radio" aria-checked={!vivo && escolhida} tabIndex={!vivo && escolhida ? 0 : -1} aria-label={nomeDaCarta(entrada)}
            className={`block tv-anel-foco ${vira}`} style={{ borderRadius: C.raio * k, background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
            onClick={() => aoEscolher(i)} onKeyDown={(e) => aoTeclar(e, i)} onAnimationEnd={fim}>{carta}</button>
        ) : (
          <span className={`block ${vira}`} style={vivo && t.vira != null ? atraso(t.vira) : undefined} onAnimationEnd={fim}>{carta}</span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   A CERIMÓNIA DO ESPÓLIO. Props, por extenso:
   · entradas — revelacaoDoEspolio(paga, heroi, { emCombate }), tal e qual;
   · titulo — o nome da quest (vem da ficha); · coracao — a quest do tipo 2
     que deixa lembrança («O QUE FICA», o título devagar, sem o clarão);
   · nivel — o nível do herói agora (a promessa do artefacto);
   · xpAntes, xpParaSubir, nivelNovo — a régua da barra (barraDoGanho); sem
     xpParaSubir, a barra cala-se e fica o número;
   · nomeDoFavor(papel) — o nome do lugar que fica a dever (sem ele, cala);
   · aoEquipar(item, slot) — O MESMO equipar da gaveta (PainelEquipamento),
     com devolverAMochila; a cerimónia fecha a seguir, como a gaveta;
   · aoFechar() — «Continuar», «Guardar na mochila», ou Esc no quadro final.
   A paga já foi aplicada antes de abrir: fechar nunca perde nada.
   ============================================================ */
export function PainelEspolio({ entradas = [], titulo = "", coracao = false, nivel = null, xpAntes = null, xpParaSubir = null, nivelNovo = null, nomeDoFavor = null, aoEquipar = () => {}, aoFechar = () => {} }) {
  const mesa = useMesaDoEspolio();
  const idTitulo = React.useId();
  const [estado, setEstado] = React.useState(() => (querParado() ? "parado" : "correndo")); /* correndo | final | parado */
  const vivo = estado === "correndo";
  const cartas = React.useMemo(() => cartasDoEspolio(entradas), [entradas]);
  const n = cartas.length;
  const reliquia = n > 0 && raridadeDoItem(cartas[n - 1].item) === "unico" ? n - 1 : null;
  const [viradas, setViradas] = React.useState(() => new Set());
  const [escolhida, setEscolhida] = React.useState(n ? n - 1 : null);
  const raiz = React.useRef(null);
  const veredito = React.useRef(null);
  const veu = React.useRef(null);
  const grupo = React.useRef(null);

  let passos = [];
  try { passos = cronogramaDoEspolio(entradas, { coracao, reduzido: !vivo }); } catch (e) { passos = []; }
  const tempos = {};
  const deDe = (nome) => { const p = passos.find((x) => x.passo === nome && x.carta == null); return p ? p.de : 0; };
  for (const p of passos) if (p.carta != null) { tempos[p.carta] = tempos[p.carta] || {}; tempos[p.carta][p.passo] = p.de; }
  const g = ganhoDoEspolio(entradas);
  let barra = null;
  try { barra = xpParaSubir != null ? barraDoGanho(xpAntes, xpParaSubir, g.xp) : null; } catch (e) { barra = null; }
  const favores = [];
  for (const papel of g.favores) {
    let nome = "";
    try { nome = typeof nomeDoFavor === "function" ? String(nomeDoFavor(papel) || "") : ""; } catch (e) { nome = ""; }
    if (nome) { const f = frase(W.favor, { nome }); favores.push(f.charAt(0).toUpperCase() + f.slice(1)); }
  }
  let resumo = "";
  try { resumo = resumoDoEspolio(entradas, { nomeDoFavor }); } catch (e) { resumo = ""; }

  const saltar = React.useCallback(() => setEstado((e) => (e === "correndo" ? "final" : e)), []);
  const fechar = React.useCallback(() => { try { aoFechar(); } catch (e) { /* nunca custa o turno */ } }, [aoFechar]);
  React.useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") { if (estado === "correndo") saltar(); else fechar(); } };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [estado, saltar, fechar]);
  /* o foco: no véu-botão enquanto corre; no quadro final, o «Equipar já» da
     escolhida (ou «Continuar», quando não há nada a vestir) */
  React.useEffect(() => {
    try {
      if (vivo) { if (veu.current) veu.current.focus(); return; }
      const b = veredito.current && veredito.current.querySelector("button:not([disabled])");
      const c = raiz.current && raiz.current.querySelector("[data-continuar]");
      (b || c) && (b || c).focus();
    } catch (e) { /* sem foco, segue */ }
  }, [vivo]);

  const virar = React.useCallback((i) => setViradas((s) => (s.has(i) ? s : new Set([...s, i]))), []);
  const escolher = (i) => { if (!vivo) setEscolhida(i); };
  const teclar = (e, i) => {
    const mapa = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    const j = (i + mapa[e.key] + n) % n;
    setEscolhida(j);
    try { const alvo = raiz.current && raiz.current.querySelectorAll("[role='radio']")[j]; if (alvo) alvo.focus(); } catch (x) { /* segue */ }
  };
  const equipar = (item, slot) => {
    try { aoEquipar(item, slot); } catch (e) { /* o App avisa; nunca custa o turno */ }
    fechar();
  };

  const k = mesa ? C.escala.mesa : C.escala.telefone;
  const entre = mesa ? C.entre.mesa : C.entre.telefone;
  const naFila = reliquia != null ? cartas.slice(0, reliquia) : cartas;
  const entradaEscolhida = escolhida != null ? cartas[escolhida] : null;
  const rel = reliquia != null ? cartas[reliquia] : null;
  const tr = reliquia != null ? tempos[reliquia] || {} : {};
  const relVirada = !vivo || viradas.has(reliquia);
  const cor = rel ? COR_DA_RARIDADE.unico.cor : null;
  const fimDoVeredito = (e) => { if (e.target === e.currentTarget && vivo) setEstado("final"); };

  const filaDasCartas = (
    <div ref={grupo} role="radiogroup" aria-label={W.pecas} className="flex flex-wrap justify-center relative" style={{ gap: entre }}>
      {naFila.map((e, i) => (
        <CartaNoGrupo key={i} entrada={e} i={i} k={k} vivo={vivo} virada={!vivo || viradas.has(i)} escolhida={escolhida === i} tempos={tempos}
          ehAUltima={i === n - 1} aoVirar={virar} aoEscolher={escolher} aoTeclar={teclar} reliquiaEscolhida={!!rel && escolhida === reliquia} />
      ))}
      {vivo && rel ? (
        <span aria-hidden="true" className="absolute pointer-events-none tv-reliquia-apaga" style={{ inset: -entre / 2, background: alfa(T.bg, 1 - Q.outras), ...atraso(tr.apaga || 0) }} />
      ) : null}
    </div>
  );

  const kRel = C.escala.reliquia;
  const cartaDaReliquia = rel ? (
    <div className="flex flex-col items-center" style={{ gap: CT.subida * 2 }}>
      <div className={`relative ${vivo ? "tv-reliquia-sobe" : ""}`} style={vivo ? atraso(tr.sobe || 0) : undefined}>
        <span aria-hidden="true" className={`absolute rounded-full pointer-events-none ${vivo ? "tv-anel-reliquia" : ""}`}
          style={{ left: "50%", top: "50%", width: C.alto * kRel * 1.15, height: C.alto * kRel * 1.15, marginLeft: -(C.alto * kRel * 1.15) / 2, marginTop: -(C.alto * kRel * 1.15) / 2,
            border: `2px solid ${cor}`, opacity: vivo ? undefined : Q.anel.alfa.ate, ...(vivo ? atraso(tr.anel || 0) : null) }} />
        <div className={vivo && !relVirada ? "tv-carta-treme-longa" : ""} style={vivo ? atraso(tr.antecipacao || 0) : undefined}>
          {relVirada ? (
            <button type="button" role="radio" aria-checked={!vivo && escolhida === reliquia} tabIndex={!vivo && escolhida === reliquia ? 0 : -1} aria-label={nomeDaCarta(rel)}
              className={`block tv-anel-foco ${vivo ? "tv-reliquia-vira-b" : ""}`} style={{ borderRadius: C.raio * kRel, background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
              onClick={() => escolher(reliquia)} onKeyDown={(e) => teclar(e, reliquia)}>
              <CartaDoEspolio item={rel.item} face="frente" k={kRel} escolhida={!vivo && escolhida === reliquia} melhor={(rel.linhas || []).some((l) => l.sinal === "ok")} estrelaViva={vivo} />
            </button>
          ) : (
            <span className={`block ${vivo ? "tv-reliquia-vira-a" : ""}`} style={vivo ? atraso(tr.vira || 0) : undefined}
              onAnimationEnd={(e) => { if (e.target === e.currentTarget && e.animationName === "tvCartaViraA") virar(reliquia); }}>
              <CartaDoEspolio item={rel.item} face="costas" k={kRel} antecipa={vivo ? tr.antecipacao || 0 : null} antecipaLonga />
            </span>
          )}
        </div>
      </div>
      <p className={`tv-body italic text-center ${vivo ? "tv-reliquia-frase" : ""}`} style={{ color: T.inkMeio, fontSize: V.historia, ...(vivo ? atraso(tr.frase || 0) : null) }}>
        {frase(W.reliquia, { n: RELIQUIAS.length })}
      </p>
    </div>
  ) : null;

  const vereditoVivo = (
    <div ref={veredito} className={`w-full flex justify-center ${vivo ? "tv-espolio-veredito" : ""}`} aria-hidden={vivo ? "true" : undefined}
      style={{ maxWidth: mesa ? V.largura.mesa : V.largura.telefone, pointerEvents: vivo ? "none" : "auto", ...(vivo ? atraso(deDe("veredito")) : null) }}
      onAnimationEnd={fimDoVeredito}>
      {entradaEscolhida ? (
        <VereditoDoEspolio key={escolhida} entrada={entradaEscolhida} nivel={nivel} largura={mesa ? V.largura.mesa : V.largura.telefone}
          aoEquipar={equipar} aoGuardar={fechar} />
      ) : null}
    </div>
  );

  return (
    <div ref={raiz} role="dialog" aria-modal="true" aria-labelledby={idTitulo} className="fixed inset-0 z-50 tv-cerimonia-reduzida" onKeyDown={(e) => prenderOFoco(e, raiz.current)}>
      <div aria-hidden="true" className={`absolute inset-0 ${vivo ? "tv-cerimonia-veu" : ""}`} style={{ background: alfa(T.bg, R.veu.opacidade) }} />
      {!coracao ? (
        <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${vivo ? "tv-cerimonia-luz" : ""}`}
          style={{ background: `radial-gradient(ellipse at 50% 100%, ${alfa(T.amber, CT.luz)}, ${alfa(T.amber, 0)} 70%)`, ...(vivo ? atraso(CERIMONIA_DO_NIVEL.luz.de) : null) }} />
      ) : null}
      {rel && (vivo || escolhida === reliquia) ? (
        <>
          <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${vivo ? "tv-reliquia-apaga" : ""}`} style={{ background: alfa(T.bg, Q.veu), ...(vivo ? atraso(tr.apaga || 0) : null) }} />
          <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${vivo ? "tv-reliquia-lume" : ""}`}
            style={{ background: `radial-gradient(ellipse at 50% 100%, ${alfa(Q.lume.cor, Q.lume.alfa)}, ${alfa(Q.lume.cor, 0)} 70%)`, ...(vivo ? atraso(tr.lume || 0) : null) }} />
        </>
      ) : null}
      <div className="relative h-full tv-scroll overflow-y-auto">
        {/* no telefone a margem é a do veredito (343 + 2 × 16 = 375, 336:198): com
            a de 24 da subida, as três cartas de 96 não cabiam numa fila */}
        <div className="flex flex-col items-center mx-auto" style={{ padding: mesa ? CT.enchimento : `${CT.enchimento}px ${V.enchimento}px`, gap: FAIXA_DO_GANHO.barra * 2, maxWidth: mesa ? V.coluna + 2 * CT.enchimento : undefined }}>
          <div className={`flex flex-col items-center text-center ${vivo ? (coracao ? "tv-espolio-rotulo-coracao" : "tv-espolio-rotulo") : ""}`} style={vivo ? atraso(R.rotulo.de) : undefined}>
            <span className="tv-titulo uppercase" style={{ color: T.amber, fontSize: TIPOS.rotulo, letterSpacing: `${CT.espacoDoRotulo}em`, fontWeight: 400 }}>{coracao ? W.coracao : W.concluida}</span>
            <h2 id={idTitulo} className="tv-titulo" style={{ color: T.ink, fontSize: TIPOS.display, lineHeight: 1.2 }}>{titulo}</h2>
          </div>
          <FaixaDoGanho xp={g.xp} moedas={g.moedas} favores={favores} barra={barra} nivelNovo={nivelNovo} vivo={vivo}
            largura={mesa ? FAIXA_DO_GANHO.largura.mesa : FAIXA_DO_GANHO.largura.telefone} />
          {mesa ? (
            <div className="flex items-start justify-center w-full" style={{ gap: 2 * entre }}>
              <div className="flex flex-col items-center" style={{ gap: 2 * entre }}>{filaDasCartas}{cartaDaReliquia}</div>
              {vereditoVivo}
            </div>
          ) : (
            <>{filaDasCartas}{cartaDaReliquia}{vereditoVivo}</>
          )}
          {!vivo ? (
            <button type="button" data-continuar="" onClick={fechar} className="tv-body tv-anel-foco rounded-lg px-5"
              style={{ minHeight: ALVOS.piso, color: T.inkMeio, fontSize: TIPOS.corpo, background: "transparent", border: 0, cursor: "pointer" }}>{W.continuar}</button>
          ) : null}
        </div>
      </div>
      {vivo ? (
        <button ref={veu} type="button" onClick={saltar} aria-label={W.saltar} className="absolute inset-0 flex items-end justify-center tv-anel-foco"
          style={{ background: "transparent", border: 0, cursor: "pointer", paddingBottom: CT.enchimento }}>
          <span className="tv-body italic" style={{ color: T.inkDim, fontSize: TIPOS.maquina }}>{W.saltar}</span>
        </button>
      ) : null}
      <p className="sr-only" aria-live="polite">{vivo ? "" : resumo}</p>
    </div>
  );
}

/* ============================================================
   O DESPERTAR DO ARTEFACTO (337:368) — irmã de PainelSubidaDeNivel: copia-se
   a estrutura, não se importa. O véu; a carta ao centro a ×1,6; a luz da
   raridade sobe de baixo; o anel abre-se; a runa nova acende (ou a estrela,
   ao exaltar) e saltam as faíscas; «DESPERTA» e o nome; os ganhos linha a
   linha. 2,1 s, sem escolha: o primeiro toque salta, o segundo fecha.
   Props: antes, depois (o artefacto antes e depois de despertarArtefacto),
   nivel (o do herói agora), aoFechar().
   ============================================================ */
export function PainelDespertar({ antes, depois, nivel = null, aoFechar = () => {} }) {
  const idNome = React.useId();
  const [estado, setEstado] = React.useState(() => (querParado() ? "parado" : "correndo"));
  const vivo = estado === "correndo";
  const botao = React.useRef(null);
  let d = null;
  try { d = despertarNaTela(antes, depois, nivel); } catch (e) { d = null; }
  const fechar = React.useCallback(() => { try { aoFechar(); } catch (e) { /* nunca custa o turno */ } }, [aoFechar]);
  const tocar = React.useCallback(() => { if (estado === "correndo") setEstado("final"); else fechar(); }, [estado, fechar]);
  React.useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") tocar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [tocar]);
  React.useEffect(() => { try { if (botao.current) botao.current.focus(); } catch (e) { /* segue */ } }, []);
  if (!d) return null;
  const c = COR_DA_RARIDADE[d.raridade];
  const k = C.escala.despertar;
  const novo = d.estado === "exaltado" ? "estrela" : 1;
  const linhas = [
    ...d.ganhos.map((g) => ({ cor: T.ok, gesto: g.gesto, texto: g.gesto ? `${g.nome}, ${W.porDia}${g.diz ? ` — ${g.diz}` : ""}` : `+ ${g.nome}${g.diz ? ` — ${g.diz}` : ""}` })),
    ...d.dormem.map((t) => ({ cor: T.inkDim, gesto: false, texto: t })),
  ];
  const ultimo = linhas.length - 1;
  const acabou = (e) => { if (e.target === e.currentTarget && vivo) setEstado("final"); };
  const lado = C.alto * k * D.anel.ate;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={idNome} className="fixed inset-0 z-50 tv-cerimonia-reduzida">
      <div aria-hidden="true" className={`absolute inset-0 ${vivo ? "tv-cerimonia-veu" : ""}`} style={{ background: alfa(T.bg, D.veu.opacidade) }} />
      <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${vivo ? "tv-cerimonia-luz" : ""}`}
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${alfa(c.cor, CT.luz)}, ${alfa(c.cor, 0)} 70%)`, ...(vivo ? atraso(D.luz.de) : null) }} />
      <div className="relative h-full tv-scroll overflow-y-auto">
        <div className="flex flex-col items-center text-center mx-auto" style={{ padding: CT.enchimento, gap: FAIXA_DO_GANHO.barra * 2, maxWidth: CT.largura }}>
          <div className="relative flex items-center justify-center" style={{ width: lado, height: lado }}>
            <span aria-hidden="true" className={`absolute rounded-full ${vivo ? "tv-anel-abre" : ""}`}
              style={{ width: C.alto * k, height: C.alto * k, border: `2px solid ${c.cor}`, opacity: vivo ? undefined : 0, ...(vivo ? atraso(D.anel.de) : null) }} />
            <div className={vivo ? "tv-despertar-carta" : ""} style={vivo ? atraso(D.carta.de) : undefined}>
              <CartaDoEspolio item={depois} face="frente" k={k} novoNoFio={vivo ? novo : null} atrasoDoFio={D.runa.de - D.carta.de} />
            </div>
            {vivo ? Array.from({ length: D.runa.faiscas }, (_, i) => (
              <span key={i} aria-hidden="true" className="absolute rounded-full tv-cerimonia-faisca pointer-events-none"
                style={{ left: "50%", top: "50%", width: CT.faisca, height: CT.faisca, marginLeft: -CT.faisca / 2, marginTop: -CT.faisca / 2, background: c.cor,
                  "--a": `${(360 / D.runa.faiscas) * i}deg`, "--d": `${Math.round(C.alto * k * CT.alcance / 2)}px`, ...atraso(D.runa.de) }} />
            )) : null}
          </div>
          <div className={`flex flex-col items-center ${vivo ? "tv-cerimonia-numero" : ""}`} style={vivo ? atraso(D.nome.de) : undefined}
            onAnimationEnd={ultimo < 0 ? acabou : undefined}>
            <span className="tv-titulo uppercase" style={{ color: T.amber, fontSize: CT.rotulo, letterSpacing: `${CT.espacoDoRotulo}em`, fontWeight: 400 }}>{d.estado === "exaltado" ? W.exalta : W.desperta}</span>
            <h2 id={idNome} className="tv-titulo" style={{ color: c.cor, fontSize: D.nome.tamanho, lineHeight: 1.2 }}>{d.nome}</h2>
          </div>
          <div className="flex flex-col" style={{ gap: 8, maxWidth: V.largura.telefone }}>
            {linhas.map((l, i) => (
              <p key={i} className={`tv-body ${vivo ? "tv-cerimonia-ganho" : ""}`} style={{ color: l.cor, fontSize: V.historia, ...(vivo ? atraso(D.ganhos.de + i * D.ganhos.passo) : null) }}
                onAnimationEnd={i === ultimo ? acabou : undefined}>
                {l.gesto ? <><Glifo nome="estrela" tamanho={V.historia} cor={l.cor} />{" "}</> : null}{l.texto}
              </p>
            ))}
          </div>
        </div>
      </div>
      <button ref={botao} type="button" onClick={tocar} aria-label={vivo ? W.saltar : W.continuarToque} className="absolute inset-0 flex items-end justify-center tv-anel-foco"
        style={{ background: "transparent", border: 0, cursor: "pointer", paddingBottom: CT.enchimento }}>
        <span className="tv-body italic" style={{ color: T.inkDim, fontSize: TIPOS.maquina }}>{vivo ? W.saltar : W.continuarToque}</span>
      </button>
      <p className="sr-only" aria-live="polite">{vivo ? "" : d.leitor}</p>
    </div>
  );
}

/* ============================================================
   O CHIP DO ACHADO (335:166) — o primeiro chip do recibo do turno em que o
   achado caiu; nunca a soleira (não pede decisão). Pousa (cai 8 e assenta);
   a peça passa um brilho na cor da raridade. Tocar abre o que o chão já
   abre (o exame, o recolher): `aoTocar` é esse caminho, nunca um segundo
   inventário. O achado escondido tem a mesma forma.
   Props: achado ({ diz, moedas? , item? }), heroi (para o «melhor»),
   aoTocar(), pousa (a primeira vez que aparece; depois, parado).
   ============================================================ */
export function ChipDoAchado({ achado, heroi = null, aoTocar = () => {}, pousa = true }) {
  let d = null;
  try { d = chipDoAchado(achado, heroi); } catch (e) { d = null; }
  if (!d) return null;
  const H = CHIP_DO_ACHADO;
  const peca = d.tipo === "peca" || d.tipo === "pecaMelhor";
  const cor = peca ? COR_DA_RARIDADE[d.raridade].cor : null;
  const item = achado && achado.item;
  return (
    <button type="button" onClick={() => { try { aoTocar(); } catch (e) { /* nunca custa o turno */ } }} aria-label={d.rotulo}
      className={`tv-chip-do-achado tv-anel-foco inline-flex items-center shrink-0 ${pousa ? "tv-achado-pousa" : ""}`}
      style={{ height: H.alto, borderRadius: H.raio, padding: "0 12px 0 10px", gap: 8, background: T.panel, cursor: "pointer",
        border: peca ? `${H.fioDaPeca}px solid ${cor}` : `1px solid ${T.lineStrong}` }}>
      {peca && pousa ? <span aria-hidden="true" className="absolute inset-0 pointer-events-none tv-achado-brilho" style={{ borderRadius: H.raio, boxShadow: `0 0 ${C.costas.vaza.raio}px ${cor}` }} /> : null}
      <span aria-hidden="true" className="inline-flex">
        {d.tipo === "moedas" ? <Glifo nome="moeda" tamanho={TIPOS.piso} cor={T.amber} /> : <IconeDeItem nome={iconeDoItem(item, ICONES_DE_ITEM)} tamanho={H.glifo} />}
      </span>
      <span aria-hidden="true" className="tv-mono whitespace-nowrap" style={{ color: T.ink, fontSize: TIPOS.maquina }}>{d.texto}</span>
      {d.melhor ? <span aria-hidden="true" className="tv-mono whitespace-nowrap" style={{ color: T.ok, fontSize: TIPOS.maquina, fontWeight: 600 }}>{"▲ "}{d.melhor}</span> : null}
    </button>
  );
}

/* ============================================================
   A FAIXA DO FECHO (337:531) — a quest fechada SEM peça: um chip de 32
   debaixo da prosa do turno do fecho. «✓ {quest}», a mini-barra (o ganho
   por cima do que havia), «+XP» em âmbar, a moeda e «+N». Entra com o
   .tv-fim-entra que já existe. Se o XP passa o nível, a subida abre pela fila.
   Props: quest (o nome), xp, moedas, barra (barraDoGanho, ou null).
   ============================================================ */
export function FaixaDoFecho({ quest = "", xp = 0, moedas = 0, barra = null }) {
  const H = FAIXA_DO_FECHO;
  if (!(xp > 0) && !(moedas > 0)) return null;
  return (
    <div className="inline-flex items-center tv-fim-entra" style={{ height: H.alto, borderRadius: H.raio, padding: "0 12px", gap: 8, background: T.panel, border: `1px solid ${T.lineStrong}` }}>
      <span className="tv-body whitespace-nowrap" style={{ color: T.ink, fontSize: TIPOS.rotulo }}><span aria-hidden="true">{W.feita}{" "}</span>{quest}</span>
      {barra ? (
        <span aria-hidden="true" className="relative inline-block" style={{ width: H.barra.largura, height: H.barra.alto, borderRadius: H.barra.alto / 2, background: T.panelSoft }}>
          <span className="absolute left-0 top-0 h-full" style={{ width: `${barra.havia * 100}%`, borderRadius: H.barra.alto / 2, background: alfa(T.amber, FAIXA_DO_GANHO.alfaDoQueHavia) }} />
          <span className="absolute top-0 h-full" style={{ left: `${barra.havia * 100}%`, width: `${barra.entra * 100}%`, borderRadius: H.barra.alto / 2, background: T.amber }} />
        </span>
      ) : null}
      {xp > 0 ? <span className="tv-mono" style={{ color: T.amber, fontSize: TIPOS.maquina, fontWeight: 600 }}>+{xp}</span> : null}
      {moedas > 0 ? (
        <span className="inline-flex items-center tv-mono" style={{ gap: 4, color: T.ink, fontSize: TIPOS.maquina, fontWeight: 600 }}>
          <Glifo nome="moeda" tamanho={TIPOS.piso} cor={T.amber} />+{moedas}
        </span>
      ) : null}
    </div>
  );
}

