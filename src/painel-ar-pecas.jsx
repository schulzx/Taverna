/* ============================================================
   AS PEÇAS DA FASE AR (05/11/2026) — formas.md §AR, Figma «AR · 05/11» (268:2)

   As peças que o Diário estreia e que as telas seguintes da fase (os
   Talentos, o Grupo, o Mercado) vão partilhar. Moram fora de ui.jsx porque
   ui.jsx já é enorme, e fora do Diário porque não são só dele:

     GlifoAR           os glifos novos (etapa, talento, interface), vários
                       caminhos por glifo, quadro 24, traço da família
     CabecalhoDaTela   a barra de cima de toda tela aberta da mesa (271:214)
     AbaDaTela         a aba dentro de uma tela (271:151)
     EtapaDaMissao     feita · atual · silhueta · falhada (269:44)
     RelogioDoPrazo    um gomo por noite; o número é o que resta (269:100)
     LombadaDaEstante  a missão encerrada, um livro deitado (269:125)
     MissaoNoIndice    repouso · escolhida · oferta (269:171)

   Toda a medida e toda a cor saem de estilo.js (T e as tabelas de §AR 6).
   Nenhuma decide regra: recebem o que o painel já leu do jogo.
   ============================================================ */
import React from "react";
import {
  T, TIPOS, ALVOS, alfa, MOLDURA_POR_DEGRAU, MATERIAIS_DOS_OBJETOS, ENCAIXE,
  ICONES_DA_ETAPA, ICONES_DO_TALENTO, ICONES_DA_INTERFACE,
  CABECALHO_DA_TELA, ABA_DA_TELA, DIARIO_DE_MISSOES, ETAPA_DA_MISSAO, RELOGIO_DO_PRAZO,
} from "./estilo.js";
import { tracoNaGrelha } from "./glifos.js";

const OURO = MOLDURA_POR_DEGRAU.ouro;
const FERRO = MOLDURA_POR_DEGRAU.ferro;
const FAMILIAS = { etapa: ICONES_DA_ETAPA, talento: ICONES_DO_TALENTO, interface: ICONES_DA_INTERFACE };
const EM_LINHA = { display: "inline-block", verticalAlign: "-0.15em", flexShrink: 0 };

/* O GLIFO DA FASE: a mesma lei do Glifo de ui.jsx (cor omitida = a da letra
   ao lado; sem rótulo é aria-hidden), com vários caminhos por glifo. */
export function GlifoAR({ nome, familia = "interface", tamanho = 16, cor = "currentColor", rotulo }) {
  const tabela = FAMILIAS[familia] || ICONES_DA_INTERFACE;
  const caminhos = tabela[nome];
  if (!Array.isArray(caminhos)) return null;
  const a11y = rotulo ? { role: "img", "aria-label": rotulo } : { "aria-hidden": "true" };
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={cor}
      strokeWidth={tracoNaGrelha(tamanho)} strokeLinecap="round" strokeLinejoin="round"
      focusable="false" style={EM_LINHA} {...a11y}>
      {caminhos.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

/* O CABEÇALHO DA TELA: o objeto que se tocou, o título em Cinzel espaçado, o
   estado numa linha, e o fechar. Esc fecha também (§AR 7, «saída, sempre»). */
export function CabecalhoDaTela({ titulo, subtitulo = "", objeto = null, aoFechar = null, telefone = false }) {
  const C = CABECALHO_DA_TELA;
  const M = telefone ? C.telefone : C.mesa;
  React.useEffect(() => {
    if (!aoFechar) return undefined;
    const tecla = (ev) => { if (ev.key === "Escape") { try { aoFechar(); } catch { /* fechar nunca derruba a tela */ } } };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aoFechar]);
  return (
    <div className="flex items-center shrink-0" style={{
      minHeight: M.alto, padding: `0 ${M.lado}px`, gap: M.folga, background: T.couroBaixo,
      borderBottom: `${C.fio.espessura}px solid ${alfa(OURO.meio, C.fio.alfa)}`,
    }}>
      {objeto ? <span aria-hidden="true" className="flex items-center justify-center shrink-0" style={{ width: M.objeto, height: M.objeto }}>{objeto}</span> : null}
      <div className="flex flex-col min-w-0 flex-1">
        <h2 className="tv-titulo uppercase truncate" style={{ fontSize: C.titulo.tamanho, letterSpacing: `${C.titulo.espaco}em`, color: OURO.claro, margin: 0 }}>{titulo}</h2>
        {subtitulo ? <span className="tv-body truncate" style={{ fontSize: C.subtitulo, color: T.inkDim }}>{subtitulo}</span> : null}
      </div>
      {aoFechar ? (
        <button type="button" onClick={aoFechar} aria-label="Fechar" className="tv-anel-foco flex items-center justify-center shrink-0"
          style={{ minWidth: ALVOS.piso, minHeight: ALVOS.piso, background: "transparent", border: "none", padding: 0, color: T.ink }}>
          <span className="flex items-center justify-center rounded-lg" style={{ width: C.fechar, height: C.fechar, border: `1px solid ${T.lineStrong}` }}>
            <GlifoAR nome="fechar" tamanho={TIPOS.titulo} />
          </span>
        </button>
      ) : null}
    </div>
  );
}

/* A ABA DA TELA: ativa (o fio de ouro por baixo), repouso, novidade (a gota). */
export function AbaDaTela({ rotulo, ativa = false, novidade = false, aoTocar, controla }) {
  const A = ABA_DA_TELA;
  return (
    <button type="button" role="tab" aria-selected={ativa ? "true" : "false"} aria-controls={controla} onClick={aoTocar}
      className="tv-anel-foco tv-body flex items-center justify-center gap-2 relative flex-1"
      style={{
        minHeight: A.alto, background: "transparent", border: "none", fontSize: TIPOS.corpo,
        color: ativa ? T.ink : T.inkDim, fontWeight: ativa ? 600 : 400,
        boxShadow: ativa ? `inset 0 -${A.fio}px 0 ${OURO.meio}` : "none",
      }}>
      <span>{rotulo}</span>
      {novidade ? <span aria-label="novidade" role="img" style={{ width: A.gota, height: A.gota, borderRadius: A.gota, background: T.amber, display: "inline-block" }} /> : null}
    </button>
  );
}

/* A ETAPA DA MISSÃO. A forma diz o estado (✓, o glifo do tipo, o «?»
   tracejado, o ✗); a cor é a segunda leitura. A silhueta conta-se e não
   diz o quê. O fio desce até à seguinte e cala na última. */
export function EtapaDaMissao({ estado = "silhueta", tipo = "ir_a", texto = "", nota = "", ultima = false }) {
  const E = ETAPA_DA_MISSAO[estado] || ETAPA_DA_MISSAO.silhueta;
  const D = DIARIO_DE_MISSOES.etapa;
  const glifo = E.glifo === "tipo"
    ? <GlifoAR familia="etapa" nome={ICONES_DA_ETAPA[tipo] ? tipo : "ir_a"} tamanho={D.glifo} cor={E.corDoGlifo} />
    : <GlifoAR nome={E.glifo} tamanho={D.glifo} cor={E.aro} />;
  const tracejado = E.tracejado ? "dashed" : "solid";
  return (
    <li className="flex" style={{ gap: D.folga, listStyle: "none" }}>
      <span className="flex flex-col items-center shrink-0" style={{ width: D.medalhao }}>
        <span className="flex items-center justify-center shrink-0" style={{
          width: D.medalhao, height: D.medalhao, borderRadius: D.medalhao,
          background: E.chao || "transparent", border: `${E.espessura || 1}px ${tracejado} ${E.aro}`,
          boxShadow: E.halo ? `0 0 ${E.halo.raio}px ${alfa(T.amber, E.halo.alfa)}` : "none",
        }}>{glifo}</span>
        {ultima ? null : <span aria-hidden="true" className="flex-1" style={{ width: D.fio.largura, minHeight: D.fio.alto, background: alfa(E.fio, E.alfaDoFio) }} />}
      </span>
      <span className="flex flex-col min-w-0 pt-1" style={{ paddingBottom: ultima ? 0 : D.folga }}>
        <span className={`tv-body ${estado === "silhueta" ? "italic" : ""}`} style={{ fontSize: TIPOS.corpo, color: E.texto, fontWeight: estado === "atual" ? 600 : 400 }}>{texto}</span>
        {nota ? <span className="tv-body" style={{ fontSize: TIPOS.piso, color: E.nota }}>{nota}</span> : null}
      </span>
    </li>
  );
}

/* O RELÓGIO DO PRAZO. O gomo cheio é a noite que passou; o número ao meio é
   o que resta. Com restam <= apertaCom, aperta (danger). */
export function RelogioDoPrazo({ segmentos = 0, cheios = 0, lado = RELOGIO_DO_PRAZO.lado }) {
  const R = RELOGIO_DO_PRAZO;
  const n = Math.max(1, Math.round(Number(segmentos) || 0));
  const c = Math.max(0, Math.min(n, Math.round(Number(cheios) || 0)));
  const restam = n - c;
  const aperta = restam <= R.apertaCom;
  const corCheio = aperta ? R.cheio.aperta : R.cheio.calma;
  const meio = lado / 2;
  const raioFora = meio - 1;
  const raioDentro = raioFora * R.miolo;
  const passo = (Math.PI * 2) / n;
  const ponto = (r, a) => `${(meio + r * Math.sin(a)).toFixed(2)} ${(meio - r * Math.cos(a)).toFixed(2)}`;
  const gomo = (i) => {
    const a0 = i * passo + R.folga / 2;
    const a1 = (i + 1) * passo - R.folga / 2;
    const grande = a1 - a0 > Math.PI ? 1 : 0;
    return `M${ponto(raioFora, a0)}A${raioFora} ${raioFora} 0 ${grande} 1 ${ponto(raioFora, a1)}L${ponto(raioDentro, a1)}A${raioDentro} ${raioDentro} 0 ${grande} 0 ${ponto(raioDentro, a0)}Z`;
  };
  return (
    <svg width={lado} height={lado} viewBox={`0 0 ${lado} ${lado}`} role="img" focusable="false"
      aria-label={`faltam ${restam} ${restam === 1 ? "noite" : "noites"} de ${n}`} style={{ flexShrink: 0 }}>
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={gomo(i)} fill={i < c ? corCheio : R.vazio.chao} stroke={i < c ? corCheio : R.vazio.aro} strokeWidth="1" />
      ))}
      <text x={meio} y={meio} textAnchor="middle" dominantBaseline="central" className="tv-body"
        style={{ fontSize: TIPOS.maquina, fontWeight: 700 }} fill={aperta ? T.danger : T.ink}>{restam}</text>
    </svg>
  );
}

/* A LOMBADA DA ESTANTE: a espinha de couro do Diário com dois frisos de ouro
   (concluída) ou de ferro (falhada), o selo, o título, a linha e, à
   direita, o que se pagou ou porquê falhou. */
export function LombadaDaEstante({ estado = "concluida", titulo, linha = "", direita = null }) {
  const L = DIARIO_DE_MISSOES.lombada;
  const falhada = estado === "falhada";
  const friso = falhada ? FERRO.meio : OURO.meio;
  const couro = MATERIAIS_DOS_OBJETOS.couroDoDiario;
  return (
    <li className="flex items-center overflow-hidden relative" style={{
      minHeight: L.alto, listStyle: "none", background: T.panel, border: `1px solid ${T.lineStrong}`, borderRadius: ENCAIXE.raio,
    }}>
      <span aria-hidden="true" className="self-stretch relative shrink-0" style={{ width: L.espinha, background: `linear-gradient(90deg, ${couro.luz}, ${couro.meio} 55%, ${couro.sombra})` }}>
        {L.frisos.map((y) => <span key={y} className="absolute inset-x-0" style={{ top: y, height: L.friso, background: friso }} />)}
      </span>
      <span className="flex items-center justify-center shrink-0 mx-3" style={{
        width: L.selo, height: L.selo, borderRadius: L.selo,
        background: falhada ? T.perigoFundo : T.okFundo, border: `1px solid ${falhada ? T.danger : T.ok}`,
      }}>
        <GlifoAR nome={falhada ? "fechar" : "visto"} tamanho={TIPOS.maquina} cor={falhada ? T.danger : T.ok} rotulo={falhada ? "falhada" : "concluída"} />
      </span>
      <span className="flex flex-col min-w-0 flex-1 py-1.5">
        <span className="tv-body truncate" style={{ fontSize: TIPOS.corpo, color: T.ink }}>{titulo}</span>
        {linha ? <span className="tv-body truncate" style={{ fontSize: TIPOS.piso, color: T.inkDim }}>{linha}</span> : null}
      </span>
      {direita ? <span className="tv-mono shrink-0 px-3 flex items-center gap-1" style={{ fontSize: TIPOS.maquina, color: falhada ? T.danger : T.amberSoft }}>{direita}</span> : null}
    </li>
  );
}

/* A MISSÃO NO ÍNDICE: o medalhão do tipo (a forma diz o tipo), o título, o
   próximo passo, e o relógio mini quando há prazo. O índice escolhe. */
export function MissaoNoIndice({ estado = "repouso", glifo = "", titulo, passo = null, prazo = null, aoTocar }) {
  const I = DIARIO_DE_MISSOES.indice;
  const escolhida = estado === "escolhida";
  const oferta = estado === "oferta";
  const S = ENCAIXE.sombraDoEscolhido;
  return (
    <button type="button" onClick={aoTocar} aria-pressed={escolhida ? "true" : "false"}
      className="tv-anel-foco w-full flex items-center text-left gap-3 px-3 py-2 rounded-xl"
      style={{
        minHeight: I.alto,
        background: escolhida ? T.panelSoft : T.panel,
        border: escolhida ? `2px solid ${T.amber}` : oferta ? `1px dashed ${T.violet}` : `1px solid ${T.lineStrong}`,
        boxShadow: escolhida ? `0 ${S.y}px ${S.raio}px ${alfa(ENCAIXE.sombra, S.alfa)}` : "none",
      }}>
      <span aria-hidden="true" className="tv-body flex items-center justify-center shrink-0" style={{
        width: I.medalhao, height: I.medalhao, borderRadius: I.medalhao, background: T.couro,
        border: `1.5px solid ${oferta ? T.violet : OURO.meio}`, color: oferta ? T.violetSoft : OURO.claro, fontSize: TIPOS.corpo, fontWeight: 700,
      }}>{glifo}</span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="tv-body truncate" style={{ fontSize: TIPOS.corpo, color: T.ink, fontWeight: 600 }}>{titulo}</span>
        {passo ? <span className="tv-body truncate" style={{ fontSize: TIPOS.piso, color: oferta ? T.violetSoft : T.inkDim }}>{passo}</span> : null}
      </span>
      {prazo ? <RelogioDoPrazo segmentos={prazo.segmentos} cheios={prazo.cheios} lado={RELOGIO_DO_PRAZO.mini} /> : null}
    </button>
  );
}
