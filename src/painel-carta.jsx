/* ============================================================
   A CARTA — o mapa em pergaminho pousado na mesa (V8 · 18/11/2026)

   formas.md §«A Mesa do Mestre · F5» (decisão 5, §2 `AGUADA_DA_CARTA`,
   `TINTA_DA_CARTA`, `LUZ_DA_CARTA`, §4 «A carta») e as pranchas F5-8 (1440,
   dia) e F5-14 (375). Abre como todo objeto da mesa (`ObjetoAberto`, objeto
   «carta»): o pergaminho entre dois rolos, a mesa à vista sob o véu, «Pousar ·
   Esc»; no celular, tela inteira com «‹ A mesa» e a carta numa janela que
   arrasta com o dedo, o cartão do lugar por baixo.

   O QUE ESTE ARQUIVO FAZ: desenha. A conta (onde cada coisa pousa, as palavras,
   os mantimentos) é `carta-do-mapa.js`, provada em `teste-carta-do-mapa.mjs`;
   os dados são os do motor — `dadosDoMapaVivo` + `vereditoDaPartida` na região,
   `dadosDaCartaDoContinente` + `vereditoNoContinente` fora dela. O chão (as
   matas, os picos) é `fundoDaCarta` (faixa-do-rumo.js), o mesmo do mapa vivo,
   agora a tinta sépia e aguada. Os glifos dos lugares são os do mapa vivo.

   O que o herói não conhece não se desenha: o papel em volta do que ele sabe
   é pintado; o resto fica em branco, com hachura e «terra não vista».

   <PainelCarta dados estadoDaPartida chegada inicial aoPartir aoPousar
                heroi suprimentos bocas />
     dados           — a saída de `dadosDoMapaVivo` ou de
                       `dadosDaCartaDoContinente` (`continente: true`);
     estadoDaPartida — o estado de `vereditoDaPartida` (só na região);
     chegada         — na estrada, a hora a que se chega (`chegadaDaViagem`);
     inicial         — o lugar cujo cartão abre;
     aoPartir(id, v) — o verbo do cartão; v é o veredito inteiro (ou null);
     aoPousar()      — fecha (Esc, o disco, o feltro, «‹ A mesa»);
     heroi           — { semente, ente } para a peça do herói (o retrato);
     suprimentos, bocas — o que a bolsa leva e quantos comem (os mantimentos).
   ============================================================ */
import React from "react";
import { T, alfa, SOMBRA_DA_MESA } from "./estilo.js";
import { ObjetoAberto, letraDaMesa, useJanela } from "./pecas-da-mesa.jsx";
import { OBJETO_ABERTO } from "./objetos-abertos.js";
import { Retrato } from "./ui.jsx";
import { vereditoDaPartida } from "./partida.js";
import { alvoDoFeixe, modoDaLuz, fundoDaCarta, vizinhoNaSeta, textoDeHoras, quemEmTexto } from "./faixa-do-rumo.js";
import { CAMINHOS_DO_GLIFO, glifoDoNo } from "./painel-mapa-vivo.jsx";
import {
  CARTA_DO_MAPA, AGUADA_DA_CARTA, LUZ_DA_CARTA, desenhoDaCarta, partidaNaCarta, ondeEstaNaCarta, subtituloNaCarta,
  perigoNaCarta, vereditoNoContinente, estadoEmPalavras, preposicao, diasEmTexto,
} from "./carta-do-mapa.js";

const C = CARTA_DO_MAPA;
const TINTA = T.tintaDoPergaminho, TINTA_DIM = T.tintaDoPergaminhoDim, BRASA = T.brasaNoPergaminho, PERIGO = T.perigoNoPergaminho;
const arr = (x) => (Array.isArray(x) ? x : []);
const noPorId = (dados, id) => (dados && arr(dados.nos).find((n) => n && n.id === id)) || null;
const PALAVRA_DA_FASE = { madrugada: "madrugada", amanhecer: "amanhecer", manha: "manhã", tarde: "tarde", entardecer: "entardecer", noite: "noite" };
const PARA_ONDE_CHAMA = "É para onde a história chama.";

function relogioNaCarta(rel) {
  if (!rel) return "";
  return [rel.dia ? `Dia ${rel.dia}` : "", rel.hora || "", PALAVRA_DA_FASE[rel.fase] || ""].filter(Boolean).join(" · ");
}
function veredito(dados, id, estado) {
  if (!dados || !id) return null;
  try { return dados.continente ? vereditoNoContinente(dados, id) : (estado ? vereditoDaPartida(dados, id, estado) : null); } catch (e) { return null; }
}

/* ---------------- O PAPEL (o SVG) ---------------- */
function Glifo({ no, cx, cy, tamanho = C.glifo, cor }) {
  const k = tamanho / 24;
  return (
    <path d={CAMINHOS_DO_GLIFO[glifoDoNo(no)]} transform={`translate(${cx - tamanho / 2} ${cy - tamanho / 2}) scale(${k})`}
      fill="none" stroke={cor} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  );
}
function Lugar({ no, escolhido, dim }) {
  const r = C.disco / 2;
  const boato = no.estado === "boato";
  const visto = no.estado === "visitado" || no.estado === "concluido";
  return (
    <g aria-hidden="true">
      <circle cx={no.x} cy={no.y} r={r} fill={visto ? T.osso : T.pergaminho} stroke={boato ? dim : TINTA}
        strokeWidth={escolhido ? 2.5 : 1.5} strokeDasharray={boato ? "3 3" : undefined} />
      <Glifo no={no} cx={no.x} cy={no.y} cor={boato ? dim : TINTA} />
      {escolhido ? <circle cx={no.x} cy={no.y} r={r + 5} fill="none" stroke={TINTA} strokeWidth={1} /> : null}
    </g>
  );
}
function PecaDoHeroi({ x, y, heroi }) {
  const L = C.heroi;
  const id = "carta-heroi-recorte";
  return (
    <g aria-hidden="true" style={{ filter: `drop-shadow(0 2px 3px ${alfa(T.couroBaixo, 0.45)})` }}>
      <defs><clipPath id={id}><circle cx={x} cy={y} r={L / 2 - 2} /></clipPath></defs>
      <circle cx={x} cy={y} r={L / 2} fill={T.osso} />
      {heroi && heroi.semente ? (
        <g clipPath={`url(#${id})`}>
          <g transform={`translate(${x - L / 2 + 2} ${y - L / 2 + 2})`}>
            <Retrato semente={heroi.semente} ente={heroi.ente || null} semCarta tamanho={L - 4} anel={null} />
          </g>
        </g>
      ) : <path d={`M${x} ${y - 9}L${x + 7} ${y}L${x} ${y + 9}L${x - 7} ${y}Z`} fill={BRASA} />}
      <circle cx={x} cy={y} r={L / 2 - 1.5} fill="none" stroke={T.osso} strokeWidth={3} />
      <circle cx={x} cy={y} r={L / 2} fill="none" stroke={TINTA} strokeWidth={1} />
    </g>
  );
}

function Papel({ dados, desenho, selecionado, aoTocar, heroi, horasDaPilula, telefone }) {
  const L = desenho.lado;
  const luz = modoDaLuz(dados.relogio);
  const camada = LUZ_DA_CARTA[luz] || null;
  const dim = camada ? TINTA : TINTA_DIM;   // à tarde e à noite a letra fina sai
  const chaveDoFundo = JSON.stringify(arr(dados.nos).map((n) => [n.id, n.bioma, n.x, n.y]));
  const fundo = React.useMemo(() => { try { return fundoDaCarta(dados, { lado: L }); } catch (e) { return null; } }, [chaveDoFundo, L]); // eslint-disable-line react-hooks/exhaustive-deps
  const regua = dados.quadro && dados.quadro.regua;
  return (
    <svg viewBox={`0 0 ${L} ${L}`} role="img" aria-label={`A carta${dados.regiao && dados.regiao.nome ? " " + preposicao("de", dados.regiao.nome) : ""}`}
      style={{ display: "block", width: "100%", height: "100%" }}>
      <defs>
        <filter id="carta-aguada" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14" /></filter>
        <radialGradient id="carta-furo">
          <stop offset="0" stopColor={T.ossoLume} stopOpacity="1" />
          <stop offset="0.6" stopColor={T.ossoLume} stopOpacity="1" />
          <stop offset="1" stopColor={T.ossoLume} stopOpacity="0" />
        </radialGradient>
        <mask id="carta-conhecido" maskUnits="userSpaceOnUse" x="0" y="0" width={L} height={L}>
          <rect x="0" y="0" width={L} height={L} fill={T.veuDaNoite} />
          {desenho.conhecido.map((k, i) => <circle key={i} cx={k.x} cy={k.y} r={k.r} fill="url(#carta-furo)" />)}
        </mask>
        <mask id="carta-por-ver" maskUnits="userSpaceOnUse" x="0" y="0" width={L} height={L}>
          <rect x="0" y="0" width={L} height={L} fill={T.ossoLume} />
          {desenho.conhecido.map((k, i) => <circle key={i} cx={k.x} cy={k.y} r={k.r * 1.1} fill={T.veuDaNoite} />)}
        </mask>
        <pattern id="carta-hachura" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={TINTA_DIM} strokeWidth="0.8" strokeOpacity="0.5" />
        </pattern>
        {camada ? (
          <radialGradient id="carta-borda" cx="50%" cy="50%" r="70%">
            <stop offset="0" stopColor={T[camada.halo || camada.tom]} stopOpacity={camada.alfaHalo || 0} />
            <stop offset="0.55" stopColor={T[camada.borda]} stopOpacity="0" />
            <stop offset="1" stopColor={T[camada.borda]} stopOpacity={camada.alfaBorda} />
          </radialGradient>
        ) : null}
      </defs>
      <rect x="0" y="0" width={L} height={L} fill={T.pergaminho} />
      {/* o que se conhece: as aguadas por chão e a tinta do relevo */}
      {fundo ? (
        <g mask="url(#carta-conhecido)" opacity={0.8}>
          <g filter="url(#carta-aguada)">
            {Object.entries(fundo.chao).map(([b, d]) => (AGUADA_DA_CARTA[b] ? <path key={b} d={d} fill={T[AGUADA_DA_CARTA[b].cor]} fillOpacity={AGUADA_DA_CARTA[b].alfa} /> : null))}
          </g>
          <path d={fundo.picoSombra} fill={alfa(TINTA_DIM, 0.32)} stroke={TINTA_DIM} strokeWidth="0.9" strokeLinejoin="round" />
          <path d={fundo.pico} fill={T.pergaminho} stroke={TINTA_DIM} strokeWidth="1.2" strokeLinejoin="round" />
          <path d={fundo.arvore} fill={alfa(TINTA_DIM, 0.45)} stroke={TINTA_DIM} strokeWidth="0.7" strokeLinejoin="round" />
          <path d={fundo.arvoreLuz} fill="none" stroke={TINTA_DIM} strokeWidth="0.7" strokeLinejoin="round" />
        </g>
      ) : null}
      {/* o que não se conhece: papel em branco com hachura */}
      <rect x="0" y="0" width={L} height={L} fill="url(#carta-hachura)" mask="url(#carta-por-ver)" />
      {/* a luz pinta o papel por baixo da tinta */}
      {camada ? <rect x="0" y="0" width={L} height={L} fill={T[camada.tom]} fillOpacity={camada.alfa} /> : null}
      {camada ? <rect x="0" y="0" width={L} height={L} fill="url(#carta-borda)" /> : null}
      {desenho.cantoVazio ? (
        <text x={desenho.cantoVazio.x} y={desenho.cantoVazio.y} textAnchor="middle" style={{ ...letraDaMesa("notaDoMestre"), fontSize: 14 }} fill={dim}>terra não vista</text>
      ) : null}
      {/* as estradas */}
      {desenho.estradas.map((s) => (
        <path key={s.id} d={s.d} fill="none" stroke={TINTA_DIM} strokeOpacity={s.fraca ? 0.55 : 1} strokeLinecap="round"
          strokeWidth={C.traco[s.traco]} strokeDasharray={s.traco === "estrada" ? undefined : C.tracejado[s.traco]} />
      ))}
      {desenho.historia ? <path d={desenho.historia} fill="none" stroke={BRASA} strokeWidth={2} strokeDasharray={C.tracejado.historia} strokeLinecap="round" /> : null}
      {desenho.andado ? <path d={desenho.andado} fill="none" stroke={TINTA} strokeWidth={C.traco.rota} strokeLinecap="round" /> : null}
      {desenho.rota ? <path d={desenho.rota} fill="none" stroke={TINTA} strokeWidth={C.traco.rota} strokeLinecap="round" /> : null}
      {/* os lugares: o alvo de toque é 44 */}
      {desenho.nos.map((n) => (
        <g key={n.id} role="button" aria-label={`${n.nome}${estadoEmPalavras(n, dados.heroi) ? ", " + estadoEmPalavras(n, dados.heroi) : ""}`} onClick={() => aoTocar(n.id)} style={{ cursor: "pointer" }}>
          <circle cx={n.x} cy={n.y} r={C.alvo / 2 + (telefone ? 4 : 0)} fill="transparent" />
          <Lugar no={n} escolhido={n.id === selecionado} dim={dim} />
        </g>
      ))}
      {desenho.heroi ? <PecaDoHeroi x={desenho.heroi.x} y={desenho.heroi.y} heroi={heroi} /> : null}
      {/* os nomes, cada um no seu respiro de papel */}
      {desenho.nos.map((n) => {
        const r = desenho.rotulos[n.id];
        if (!r || r.oculto) return null;
        const boato = n.estado === "boato";
        const estilo = boato ? { ...letraDaMesa("notaDoMestre"), fontSize: C.boato } : { ...letraDaMesa("nome"), fontSize: C.nome };
        return (
          <g key={"r" + n.id} aria-hidden="true">
            <rect x={r.x} y={r.y} width={r.largura} height={r.altura} rx={2} fill={T.pergaminho} fillOpacity={0.82} />
            <text x={r.x + r.largura / 2} y={r.y + r.altura - C.respiro - 3} textAnchor="middle" style={{ ...estilo, lineHeight: 1 }} fill={boato ? dim : TINTA}>{n.nome}</text>
          </g>
        );
      })}
      {/* a pílula do tempo, por cima dos nomes: é o número que decide */}
      {desenho.pilula && horasDaPilula ? (
        <g aria-hidden="true">
          <rect x={desenho.pilula.x - 22} y={desenho.pilula.y - 11} width={44} height={22} rx={11} fill={T.osso} stroke={TINTA} strokeWidth={1.2} />
          <text x={desenho.pilula.x} y={desenho.pilula.y + 4.5} textAnchor="middle" style={letraDaMesa("rotulo")} fill={TINTA}>{horasDaPilula}</text>
        </g>
      ) : null}
      {/* a rosa dos ventos e a régua (na região, a régua mede) */}
      {!telefone ? (() => {
        const R = C.rosa / 2, cx = L - R - 18, cy = R + 30;
        return (
          <g aria-hidden="true">
            <text x={cx} y={cy - R - 6} textAnchor="middle" style={letraDaMesa("rotulo")} fill={TINTA}>N</text>
            <path d={`M${cx} ${cy - R}L${cx + 6} ${cy}L${cx} ${cy + R}L${cx - 6} ${cy}Z`} fill="none" stroke={TINTA} strokeWidth="1.2" />
            <path d={`M${cx - R} ${cy}L${cx} ${cy - 6}L${cx + R} ${cy}L${cx} ${cy + 6}Z`} fill="none" stroke={TINTA} strokeWidth="1.2" />
            <path d={`M${cx} ${cy - R}L${cx + 6} ${cy}L${cx - 6} ${cy}Z`} fill={TINTA} />
          </g>
        );
      })() : null}
      {regua && regua.fracao > 0 ? (
        <g aria-hidden="true">
          {Array.from({ length: C.regua.segmentos }, (_, k) => (
            <rect key={k} x={24 + (k * regua.fracao * L) / C.regua.segmentos} y={L - 44} width={(regua.fracao * L) / C.regua.segmentos} height={C.regua.altura}
              fill={k % 2 === 0 ? TINTA : T.pergaminho} stroke={TINTA} strokeWidth="0.8" />
          ))}
          <text x={24} y={L - 20} style={letraDaMesa("notaDoMestre")} fill={TINTA}>{`${regua.km} km · ${textoDeHoras(regua.horas)} de marcha`}</text>
        </g>
      ) : null}
      {/* o horizonte: os nomes do que fica além da borda, em versal */}
      {!telefone ? arr(dados.horizonte).map((z) => {
        if (z.y > 0 && z.y < 1) return null;   // os laterais não cabem sem rodar a letra; ficam os de cima e de baixo
        const y = z.y <= 0 ? 22 : L - 10;
        /* encostado à borda do seu lado; no alto à direita, antes da rosa */
        const fimDireito = z.y <= 0 ? L - C.rosa - 30 : L - 14;
        const ancora = z.x <= 0.2 ? "start" : z.x >= 0.8 ? "end" : "middle";
        const x = ancora === "start" ? 14 : ancora === "end" ? fimDireito : z.x * L;
        return <text key={z.nome} x={x} y={y} textAnchor={ancora} style={letraDaMesa("rotulo")} fill={dim}>{String(z.nome)}</text>;
      }) : null}
      <rect x="0.5" y="0.5" width={L - 1} height={L - 1} fill="none" stroke={TINTA_DIM} strokeOpacity="0.6" />
    </svg>
  );
}

/* ---------------- A COLUNA ---------------- */
function Rotulo({ children }) {
  return <div style={{ color: TINTA_DIM, margin: "0 0 6px", ...letraDaMesa("rotulo") }}>{children}</div>;
}
function Nota({ children, cor = TINTA_DIM }) {
  return <p style={{ color: cor, margin: "0 0 8px", ...letraDaMesa("notaDoMestre") }}>{children}</p>;
}
function Caveiras({ perigo }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 4 }} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24">
          <path d={CAMINHOS_DO_GLIFO.perigo} fill={i < perigo.cheias ? PERIGO : "none"} stroke={i < perigo.cheias ? PERIGO : TINTA_DIM} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          {i < perigo.cheias ? <><circle cx="9.5" cy="11" r="1.7" fill={T.ossoLume} /><circle cx="14.5" cy="11" r="1.7" fill={T.ossoLume} /></> : null}
        </svg>
      ))}
    </span>
  );
}
function BotaoDePartir({ partida, aoTocar, armado }) {
  if (!partida || !partida.verbo) return null;
  const impedido = !!partida.impedido;
  const amb = !impedido && armado;
  return (
    <div className="flex flex-col" style={{ gap: 6, marginTop: 6 }}>
      <button type="button" onClick={impedido ? undefined : aoTocar} aria-disabled={impedido ? "true" : "false"}
        className="tv-anel-foco w-full flex flex-col items-start justify-center text-left"
        style={{ minHeight: 56, padding: "12px 16px", borderRadius: 4, cursor: impedido ? "default" : "pointer", boxShadow: amb ? SOMBRA_DA_MESA.peca : "none",
          background: amb ? T.amber : impedido ? "transparent" : T.ossoLume, border: `1px solid ${amb ? BRASA : TINTA}`, color: amb ? T.onAccent : TINTA }}>
        <span style={letraDaMesa("rotulo")}>{partida.verbo}</span>
        {impedido ? <span style={{ ...letraDaMesa("notaDoMestre"), color: TINTA_DIM }}>{partida.impedido}</span> : null}
      </button>
      {!impedido && partida.preco ? <Nota cor={TINTA}>{partida.preco}</Nota> : null}
    </div>
  );
}

function CartaoDoLugar({ dados, no, v, alvoId, chegada, suprimentos, bocas, aoPartir }) {
  const h = dados.heroi || {};
  const boato = no.estado === "boato";
  const partida = partidaNaCarta(dados, no, v, { chegada, suprimentos, bocas });
  const perigo = perigoNaCarta(no, v);
  const estado = estadoEmPalavras(no, h);
  /* na estrada, o alvo é só o destino: a história não «chama» para onde já se vai */
  const chama = no.id === alvoId && h.onde !== "viagem";
  const vizinhos = arr(no.vizinhos).map((x) => {
    const n = noPorId(dados, x.id);
    if (!n) return null;
    return `${n.nome} · ${x.dias ? diasEmTexto(x.dias) : textoDeHoras(x.horas)}`;
  }).filter(Boolean);
  const idaEVolta = v && !dados.continente ? [`ida ${textoDeHoras(v.horas)}`, v.horasDeVolta != null ? `volta ${textoDeHoras(v.horasDeVolta)}` : ""].filter(Boolean).join(" · ") : "";
  return (
    <div className="flex flex-col" style={{ gap: 14, padding: 20, borderRadius: 4, background: T.ossoLume, boxShadow: SOMBRA_DA_MESA.peca }}>
      <div className="flex items-center" style={{ gap: 14 }}>
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style={{ flex: "none" }}>
          <circle cx="22" cy="22" r="20.5" fill={boato ? T.ossoLume : T.osso} stroke={boato ? TINTA_DIM : TINTA} strokeWidth="1.5" strokeDasharray={boato ? "3 3" : undefined} />
          <Glifo no={no} cx={22} cy={22} tamanho={22} cor={boato ? TINTA_DIM : TINTA} />
        </svg>
        <div className="flex flex-col min-w-0">
          <h3 style={{ color: TINTA, margin: 0, ...letraDaMesa("lugar") }}>{no.nome}</h3>
          {subtituloNaCarta(dados, no) ? <span style={{ color: TINTA_DIM, ...letraDaMesa("notaDoMestre") }}>{subtituloNaCarta(dados, no)}</span> : null}
        </div>
      </div>
      {estado || chama ? (
        <p style={{ margin: 0, color: chama ? BRASA : TINTA, ...letraDaMesa("servico") }}>
          {[estado ? estado.charAt(0).toUpperCase() + estado.slice(1) + "." : "", chama ? PARA_ONDE_CHAMA : ""].filter(Boolean).join(" ")}
        </p>
      ) : null}
      {no.tipo === "lugar" ? (
        <div>
          <Rotulo>Quem anda lá</Rotulo>
          <p style={{ margin: 0, color: boato || !no.quem ? TINTA_DIM : TINTA, ...letraDaMesa("servico") }}>{boato || !no.quem ? "Ninguém sabe. É o preço de não ter ido ver." : quemEmTexto(no.quem)}</p>
        </div>
      ) : null}
      {perigo || (partida && partida.perigo) || idaEVolta ? (
        <div>
          <Rotulo>O preço</Rotulo>
          {perigo ? (
            <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 4 }}>
              <Caveiras perigo={perigo} />
              <span style={{ color: TINTA, ...letraDaMesa("servico") }}>{perigo.palavra}</span>
            </div>
          ) : null}
          {idaEVolta ? <Nota>{idaEVolta}</Nota> : null}
        </div>
      ) : null}
      {partida && partida.verbo ? (
        <div>
          <BotaoDePartir partida={partida} armado={!partida.semPreco} aoTocar={() => { try { if (aoPartir) aoPartir(no.id, v || null); } catch (e) { /* partir nunca derruba a carta */ } }} />
          {partida.mantimentos ? <Nota cor={partida.mantimentos.falta ? PERIGO : TINTA}>{partida.mantimentos.falta ? "✕ " : ""}{partida.mantimentos.texto}</Nota> : null}
          {arr(partida.caminho).map((l) => <Nota key={l} cor={TINTA}>{l}</Nota>)}
        </div>
      ) : null}
      {vizinhos.length ? (
        <div>
          <Rotulo>Por perto</Rotulo>
          {vizinhos.map((t) => <p key={t} style={{ margin: "0 0 2px", color: TINTA, ...letraDaMesa("servico") }}>{t}</p>)}
        </div>
      ) : null}
      {no.boato ? (
        <div>
          <Rotulo>O que se diz</Rotulo>
          <Nota cor={TINTA}>{`“${String(no.boato).trim()}”`}</Nota>
        </div>
      ) : null}
    </div>
  );
}

function Legenda() {
  const linha = (traco) => (
    <svg width="28" height="12" aria-hidden="true"><path d="M2 6H26" stroke={TINTA_DIM} strokeWidth={C.traco[traco]} strokeDasharray={traco === "estrada" ? undefined : C.tracejado[traco]} strokeLinecap="round" /></svg>
  );
  const disco = (tracejado) => (
    <svg width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill={tracejado ? T.pergaminho : T.osso} stroke={tracejado ? TINTA_DIM : TINTA} strokeWidth="1.4" strokeDasharray={tracejado ? "3 3" : undefined} /></svg>
  );
  const itens = [[linha("estrada"), "estrada"], [linha("trilha"), "trilha"], [linha("aPe"), "a pé"], [disco(false), "você já esteve"], [disco(true), "só se ouviu falar"]];
  return (
    <div className="flex flex-wrap" style={{ gap: "6px 16px" }}>
      {itens.map(([s, txt]) => (
        <span key={txt} className="inline-flex items-center" style={{ gap: 6, color: TINTA_DIM, ...letraDaMesa("servico"), fontWeight: 400 }}>{s}{txt}</span>
      ))}
    </div>
  );
}

/* ---------------- A CARTA ---------------- */
export function PainelCarta({ dados, estadoDaPartida = null, chegada = null, inicial = null, aoPartir = null, aoPousar = null, heroi = null, suprimentos = null, bocas = 1 }) {
  const j = useJanela();
  const telefone = j.l < OBJETO_ABERTO.corteDoTelefone;
  const alvo = React.useMemo(() => { try { return alvoDoFeixe(dados); } catch (e) { return null; } }, [dados]);
  const alvoId = alvo ? alvo.id : null;
  const h = (dados && dados.heroi) || {};
  const primeiro = (inicial && noPorId(dados, inicial) ? inicial : null) || alvoId || h.noId || ((dados && arr(dados.nos)[0]) || {}).id || null;
  const [selecionado, setSelecionado] = React.useState(primeiro);
  const no = noPorId(dados, selecionado);
  const v = React.useMemo(() => veredito(dados, selecionado, estadoDaPartida), [dados, selecionado, estadoDaPartida]);
  const vHistoria = React.useMemo(() => (alvoId && alvoId !== selecionado ? veredito(dados, alvoId, estadoDaPartida) : null), [dados, alvoId, selecionado, estadoDaPartida]);
  const desenho = React.useMemo(() => {
    try { return desenhoDaCarta(dados, { lado: C.lado, rota: v ? v.rota : [], historia: vHistoria ? vHistoria.rota : [], destino: selecionado }); } catch (e) { return null; }
  }, [dados, v, vHistoria, selecionado]);
  const horasDaPilula = v ? (dados.continente && v.dias ? `${String(Math.round(v.dias * 10) / 10).replace(".", ",")} d` : textoDeHoras(v.horas)) : "";
  const janela = React.useRef(null);
  /* no celular a carta abre centrada no herói (a janela arrasta com o dedo) */
  React.useEffect(() => {
    try {
      const el = janela.current;
      if (!el || !desenho) return;
      const p = desenho.heroi || (no ? { x: no.x * C.lado, y: no.y * C.lado } : { x: C.lado / 2, y: C.lado / 2 });
      el.scrollLeft = Math.max(0, p.x - el.clientWidth / 2);
      el.scrollTop = Math.max(0, p.y - el.clientHeight / 2);
    } catch (e) { /* sem rolagem, a carta abre no canto */ }
  }, [telefone]); // eslint-disable-line react-hooks/exhaustive-deps
  const partir = (id, vv) => { try { if (aoPartir) aoPartir(id, vv); } catch (e) { /* nunca custa o turno */ } };
  const aoTeclar = (e) => {
    try {
      const seta = { ArrowUp: "cima", ArrowDown: "baixo", ArrowLeft: "esquerda", ArrowRight: "direita" }[e.key];
      if (seta) { e.preventDefault(); const p = vizinhoNaSeta(dados.nos, selecionado, seta); if (p) setSelecionado(p); return; }
      if (e.key === "Enter" && no && v && e.target === e.currentTarget) { e.preventDefault(); partir(no.id, v); }
    } catch (err) { /* a tecla nunca derruba a carta */ }
  };
  if (!dados || !desenho) return null;
  const titulo = (dados.regiao && dados.regiao.nome) || "O mundo conhecido";
  const papel = <Papel dados={dados} desenho={desenho} selecionado={selecionado} aoTocar={setSelecionado} heroi={heroi} horasDaPilula={horasDaPilula} telefone={telefone} />;
  const cartao = no ? <CartaoDoLugar dados={dados} no={no} v={v} alvoId={alvoId} chegada={chegada} suprimentos={suprimentos} bocas={bocas} aoPartir={partir} /> : null;
  const rodape = <Nota>O que a carta ainda não mostra fica em branco: ande, pergunte ou compre um mapa.</Nota>;

  if (telefone) {
    const Tf = C.telefone;
    return (
      <ObjetoAberto objeto="carta" titulo="A carta" aoPousar={aoPousar}>
        <div onKeyDown={aoTeclar}>
          <div ref={janela} className="tv-sem-barra" style={{ height: Tf.altura, overflow: "auto", background: T.pergaminho, touchAction: "pan-x pan-y", borderBottom: `1px solid ${alfa(TINTA_DIM, 0.5)}` }}>
            <div style={{ width: C.lado, height: C.lado }}>{papel}</div>
          </div>
          <div style={{ padding: "16px 12px 20px", background: T.pergaminho }}>
            <p style={{ margin: "0 0 4px", color: TINTA, ...letraDaMesa("servico") }}>{ondeEstaNaCarta(dados, chegada)}</p>
            <Nota>{relogioNaCarta(dados.relogio)}</Nota>
            {cartao}
            <div style={{ marginTop: 14 }}><Nota>A carta arrasta com o dedo; toque num lugar para ver o caminho.</Nota>{rodape}</div>
          </div>
        </div>
      </ObjetoAberto>
    );
  }
  return (
    <ObjetoAberto objeto="carta" titulo="A carta" aoPousar={aoPousar}>
      <div className="flex-1 min-h-0 flex" style={{ padding: 24, gap: 28 }} onKeyDown={aoTeclar}>
        <div style={{ height: "100%", aspectRatio: "1 / 1", maxWidth: "62%", flex: "none" }}>{papel}</div>
        <div className="flex-1 min-w-0 overflow-y-auto tv-scroll flex flex-col" style={{ gap: 14, paddingRight: 4 }}>
          <div>
            <h2 style={{ color: TINTA, margin: "0 0 4px", ...letraDaMesa("tituloObjeto") }}>{titulo}</h2>
            {relogioNaCarta(dados.relogio) ? <Nota>{relogioNaCarta(dados.relogio)}</Nota> : null}
            <p style={{ margin: 0, color: TINTA, ...letraDaMesa("servico") }}>{ondeEstaNaCarta(dados, chegada)}</p>
          </div>
          {cartao}
          {rodape}
          <Legenda />
        </div>
      </div>
    </ObjetoAberto>
  );
}
