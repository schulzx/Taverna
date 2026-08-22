/* ============================================================
   A PLANTA DA CIDADE (v9.51) — a segunda escala do mapa

   O mundo já era gerado inteiro na criação: vinte cidades com bioma,
   região e estrada, e dentro de cada uma a taverna, a forja, o
   cemitério, a gente com nome e vontade. Nada disso o jogador via. O
   painel de mapa mostrava o continente — pontos e estradas — e a
   cidade era um ponto entre outros.

   Aqui o mesmo pergaminho ganha a segunda escala. É uma PLANTA, não um
   mapa: muralha, portões, a rua que corta, a praça no meio, e os
   locais que a base já tinha inventado ocupando os quarteirões.

   TRÊS DECISÕES:

   1) A CIDADE NÃO TEM NÉVOA. Quem passa uma tarde numa vila sabe onde
      é a forja — não é descoberta, é paisagem. O que continua escondido
      é o que está DENTRO dela (quem, o quê, o segredo), que é a
      matéria do teste de percepção e do achado.

   2) A PLANTA É DETERMINÍSTICA. Mesma semente, mesma cidade, mesma
      planta para sempre — a forja fica onde ficava na primeira visita,
      e é isso que faz a cidade virar lugar em vez de cenário.

   3) OS ARREDORES ENTRAM AQUI. A fazenda e o moinho não são cidade nem
      viagem: são o cinturão em volta, a minutos de caminhada. Ficam
      fora da muralha, ligados por trilha, e é daqui que o jogador
      descobre que eles existem.
   ============================================================ */

import React from "react";
import { T } from "./constantes.js";
import { rngDe, formaDaCidade } from "./geografia.js";
import { locaisDaCidade } from "./mundo-base.js";
import { arredoresDaCidade, tempoDeIda } from "./arredores.js";
import { comodosDoLocal } from "./comodos.js";

/* A muralha: um polígono irregular deterministicamente amassado, para
   nenhuma cidade sair redonda de compasso. */
/* v9.54: o contorno passa a receber a FORMA. `aperto` espreme o eixo
   vertical (montanha), e o lado do mar é cortado fora — a cidade de costa
   termina na água, não numa parede sobre o mar. */
function muralha(rnd, forma) {
  const raio = forma.raio;
  const pontos = [];
  const lados = 11;
  for (let i = 0; i < lados; i++) {
    const a = (i / lados) * Math.PI * 2;
    const r = raio * (0.86 + rnd() * 0.26);
    let x = 50 + Math.cos(a) * r * 1.18;
    let y = 50 + Math.sin(a) * r * forma.aperto;
    /* o mar entra pelo oeste: o contorno não passa da linha d'água */
    if (forma.agua) x = Math.max(x, 50 - raio * 0.42);
    pontos.push([x, y]);
  }
  return "M " + pontos.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z";
}

/* ---------------- A LINHA D'ÁGUA (v9.55) ----------------
   O mar entra pelo oeste, e nada da cidade pode cair dentro dele. Achado
   numa partida: o pomar cercado e o moinho de cima boiavam a oeste de Rio
   das Águias, e o cais ficava no meio da praça.

   `xDaAgua` é a mesma conta que desenha o mar, exportada para quem PÕE as
   coisas — a linha do desenho e a linha da regra precisam ser a mesma, ou
   volta a aparecer coisa flutuando. */
const xDaAgua = (forma) => (forma.agua ? 50 - forma.raio * 0.42 : -Infinity);

/* Dobra um ângulo para longe do mar. Espelha no eixo vertical (o mar é
   sempre a oeste) e, se ainda molhar, empurra na horizontal — nunca
   devolve um ponto na água. */
function emTerra(ang, raio, forma) {
  const limite = xDaAgua(forma);
  if (limite === -Infinity) return ang;
  const molha = (a) => 50 + Math.cos(a) * raio * 1.15 < limite + 2;
  if (!molha(ang)) return ang;
  const espelhado = Math.PI - ang;           // oeste vira leste, altura preservada
  if (!molha(espelhado)) return espelhado;
  /* caso raro (mar muito adentro): joga para o leste franco */
  return Math.sin(ang) >= 0 ? Math.PI / 4 : -Math.PI / 4;
}

/* Onde cada local se planta. A praça fica no meio; o resto se distribui
   em dois anéis, para uma capital de sete locais não virar uma fila.
   v9.54: os anéis encolhem com o assentamento — numa aldeia de raio 15 os
   locais ficavam fora do próprio casario. */
function plantarLocais(rnd, locais, forma) {
  const n = locais.length;
  const dentro = forma.raio * 0.75;
  const limite = xDaAgua(forma);
  return locais.map((l, i) => {
    if (l.tipo === "mercado") return { ...l, x: 50, y: 50, praca: true };
    /* v9.55: quem vive da água mora NA água — o cais no meio da praça foi
       o que denunciou que ninguém consultava o mar ao plantar. */
    if (forma.agua && /doca|porto|cais|embarcad|estaleiro|ancorad/i.test(`${l.tipo} ${l.nome}`)) {
      return { ...l, x: limite + 3, y: 50 + (rnd() - 0.5) * forma.raio * forma.aperto, naAgua: true };
    }
    const anel = (i % 2 === 0 ? 0.5 : 0.84) * dentro;
    /* v9.55: era `i / (n - 1)`, e com isso o PRIMEIRO e o ÚLTIMO local
       caíam no mesmo ângulo (0 e 2π) — dois nomes escritos um por cima do
       outro, que foi o que apareceu na tela ("Feira Baixa" colada em
       "Javali Cambaleante"). Dividir por `n` fecha a volta sem repetir. */
    const a = emTerra((i / Math.max(1, n)) * Math.PI * 2 + rnd() * 0.35, anel, forma);
    return { ...l, x: 50 + Math.cos(a) * anel * 1.15, y: 50 + Math.sin(a) * anel * forma.aperto };
  });
}

export function PlantaCidade({ semente, cidade, genero, molde, lex = null, lugar, aoSelecionar, selecionado, aoIr = null }) {
  if (!cidade || !cidade.nome) {
    return <div className="tv-body text-sm italic" style={{ color: T.inkDim }}>Você não está em cidade nenhuma agora — o mapa do mundo mostra onde você anda.</div>;
  }
  const rnd = rngDe(`${semente}|planta|${cidade.nome}`);
  /* v9.54: a forma vem da POPULAÇÃO e do BIOMA, não de uma constante. Uma
     aldeia de 190 almas deixa de ter a mesma muralha de uma capital. */
  const forma = formaDaCidade(cidade);
  const locais = plantarLocais(rnd, locaisDaCidade(semente, cidade, genero, molde, lex), forma);
  const dMuro = muralha(rngDe(`${semente}|muro|${cidade.nome}`), forma);
  const R = forma.raio, Ay = forma.aperto;
  /* v9.55: o cinturão também sai da água. O ângulo do arredor vem de
     `arredores.js`, que não sabe (nem deve saber) onde está o mar desta
     cidade — quem sabe é a forma, e é aqui que as duas coisas se encontram.
     O raio 44 é o mesmo que o desenho usa logo abaixo. */
  const fora = arredoresDaCidade(semente, cidade).map((a) => ({ ...a, ang: emTerra(a.ang, 44 / 1.15, forma) }));
  /* onde o herói está: dentro dos muros, ou num dos arredores */
  const igual = (a, b) => String(a || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim()
    === String(b || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const noArredor = lugar && fora.find((a) => igual(a.nome, lugar.nome));
  /* v9.55: E DENTRO DOS MUROS TAMBÉM. O marcador "você" só sabia sair da
     praça para um arredor; um local DE DENTRO — a taverna, a forja, o
     templo — deixava o herói desenhado no centro, e foi o que apareceu em
     jogo: "fui até o Javali Cambaleante e o mapa não me moveu". */
  const noLocal = !noArredor && lugar && locais.find((l) => igual(l.nome, lugar.nome));
  /* v9.58: e num CÔMODO de um local. Quem está no quarto de cima continua
     dentro da taverna — o ponto no pergaminho é o da taverna, porque a planta
     desenha a cidade, não o prédio. O prédio se lê na lista, aberto. */
  const noComodo = !noArredor && !noLocal && lugar && lugar.dentroDe ? locais.find((l) => igual(l.nome, lugar.dentroDe)) : null;
  const aqui = lugar ? lugar.nome : "";
  const botaoIr = (alvo, rotulo) => (aoIr && !igual(alvo.nome, aqui) ? (
    <button onClick={(e) => { e.stopPropagation(); aoIr(alvo); }}
      className="tv-mono text-[9px] px-2 py-1 rounded-full shrink-0"
      style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}`, fontWeight: 700 }}>
      {rotulo}
    </button>
  ) : null);

  return (
    <div>
      {/* ONDE VOCÊ ESTÁ, e como sair daqui. Sem esta linha o único caminho de
          volta ao meio da cidade era escrever a frase certa — e o jogador que
          entrou na adega clicando não deveria precisar do teclado para subir. */}
      {lugar && lugar.nome && (
        <div className="rounded-xl px-3 py-2 mb-3 flex items-center gap-2" style={{ background: T.panelSoft, border: `1px solid ${T.amberSoft}` }}>
          <span style={{ fontSize: 13 }}>📍</span>
          <span className="tv-body text-sm" style={{ color: T.ink }}>{lugar.nome}{lugar.dentroDe ? <span className="tv-body text-xs" style={{ color: T.inkDim }}> · dentro de {lugar.dentroDe}</span> : null}</span>
          {aoIr && (
            <button onClick={() => aoIr({ nome: cidade.nome, onde: "cidade" })}
              className="tv-mono text-[9px] px-2 py-1 rounded-full ml-auto shrink-0"
              style={{ background: "transparent", color: T.amberSoft, border: `1px dashed ${T.amberSoft}`, fontWeight: 600 }}>
              ▸ voltar ao meio de {cidade.nome}
            </button>
          )}
        </div>
      )}
      <div className="relative rounded-xl mb-3" style={{ border: `1px solid ${T.line}`, aspectRatio: "1 / 1", overflow: "hidden", background: "#dcd0ae" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <filter id="tvPapelC"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0.24 0" /></filter>
          </defs>
          {/* campo em volta */}
          <rect x="0" y="0" width="100" height="100" fill="#cfc49f" />
          {/* trilhas até os arredores — saem do centro e furam a muralha */}
          {fora.map((a, i) => {
            const px = 50 + Math.cos(a.ang) * 47, py = 50 + Math.sin(a.ang) * 47;
            return <line key={`tr-${i}`} x1="50" y1="50" x2={px} y2={py} stroke="#a08a5e" strokeWidth="0.7" strokeDasharray="2 1.6" opacity="0.75" />;
          })}
          {/* v9.54: O MAR, quando há. Entra pelo oeste e a cidade termina
              nele — é por isso que o porto não tem muro daquele lado. */}
          {forma.agua && (
            <>
              <rect x="0" y="0" width={50 - R * 0.42} height="100" fill="#8fa8ac" opacity="0.75" />
              <path d={`M ${50 - R * 0.42} 0 Q ${50 - R * 0.42 + 2.5} 50 ${50 - R * 0.42} 100`} fill="none" stroke="#6f8c90" strokeWidth="0.6" opacity="0.8" />
            </>
          )}
          {/* dentro dos muros — a espessura é a do assentamento */}
          <path d={dMuro} fill="#eadfc1" stroke="#6d5c40" strokeWidth={Math.max(0.5, forma.muro.espessura)} strokeDasharray={forma.muro.id === "nenhum" ? "1.4 1.6" : forma.muro.id === "palicada" ? "2.4 0.9" : ""} strokeOpacity={forma.muro.id === "nenhum" ? 0.5 : 1} />
          {forma.muro.espessura >= 1.4 && <path d={dMuro} fill="none" stroke="#8d7a56" strokeWidth="0.4" />}
          {/* as ruas-mestras: uma só num povoado, duas quando há dois destinos */}
          <line x1="50" y1={50 - R * Ay * 1.05} x2="50" y2={50 + R * Ay * 1.05} stroke="#c8b98f" strokeWidth={forma.pop >= 20000 ? 3.6 : 2.8} />
          {forma.ruas > 1 && <line x1={50 - R * 1.24} y1="50" x2={50 + R * 1.24} y2="50" stroke="#c8b98f" strokeWidth={forma.pop >= 20000 ? 3.6 : 2.8} />}
          {/* o anel viário só existe em cidade grande */}
          {forma.anelViario && <ellipse cx="50" cy="50" rx={R * 0.78} ry={R * Ay * 0.78} fill="none" stroke="#c8b98f" strokeWidth="2" opacity="0.85" />}
          {/* praça — ou o largo de terra batida de quem não tem mercado */}
          <circle cx="50" cy="50" r={forma.pracaR} fill="#c8b98f" opacity={forma.praca ? 1 : 0.55} />
          <circle cx="50" cy="50" r={forma.pracaR} fill="none" stroke="#a08a5e" strokeWidth="0.3" strokeDasharray={forma.praca ? "" : "1 1"} />
          {/* portões: onde a rua encontra o muro. Sem muro, sem portão. */}
          {forma.portoes > 0 && [
            [50, 50 - R * Ay * 1.0], [50, 50 + R * Ay * 1.0],
            ...(forma.ruas > 1 ? [[50 - R * 1.18, 50], [50 + R * 1.18, 50]] : []),
          ].map(([x, y], i) => (
            <rect key={`pt-${i}`} x={x - 2} y={y - 1.2} width="4" height="2.4" fill="#6d5c40" opacity="0.9" rx="0.5" />
          ))}
          {/* o cais: a cidade de água entra no mar por uma língua de pedra */}
          {forma.agua && forma.agua.cais && (
            <rect x={50 - R * 0.42 - 5} y="48.4" width="7" height="3.2" fill="#a08a5e" stroke="#5c4a30" strokeWidth="0.3" rx="0.4" />
          )}
          <rect x="0" y="0" width="100" height="100" filter="url(#tvPapelC)" opacity="0.5" />
          <rect x="0.8" y="0.8" width="98.4" height="98.4" fill="none" stroke="#5c4a30" strokeWidth="0.7" opacity="0.8" />
        </svg>
        {/* os locais de dentro */}
        {locais.map((l, i) => {
          const aberto = selecionado === l.id;
          return (
            <div key={l.id} style={{ position: "absolute", left: `${l.x}%`, top: `${l.y}%`, transform: "translate(-50%,-50%)", textAlign: "center", cursor: "pointer" }}
              onClick={() => aoSelecionar && aoSelecionar(aberto ? null : l.id)}>
              <div style={{ fontSize: l.praca ? 15 : 13, lineHeight: 1, filter: aberto ? "drop-shadow(0 0 5px #c9a45a)" : "drop-shadow(0 1px 1px #00000030)" }}>{l.icone}</div>
              <div className="tv-mono" style={{ fontSize: 6.5, color: "#3a2e1c", marginTop: 1, whiteSpace: "nowrap", fontWeight: 600, textShadow: "0 1px 2px #f0e6cc, 0 -1px 2px #f0e6cc" }}>{l.nome}</div>
            </div>
          );
        })}
        {/* o cinturão de fora */}
        {fora.map((a, i) => {
          const px = 50 + Math.cos(a.ang) * 44, py = 50 + Math.sin(a.ang) * 44;
          const aberto = selecionado === a.id;
          return (
            <div key={a.id} style={{ position: "absolute", left: `${px}%`, top: `${py}%`, transform: "translate(-50%,-50%)", textAlign: "center", cursor: "pointer" }}
              onClick={() => aoSelecionar && aoSelecionar(aberto ? null : a.id)}>
              <div style={{ fontSize: 12, lineHeight: 1, opacity: 0.92, filter: aberto ? "drop-shadow(0 0 5px #c9a45a)" : "none" }}>{a.icone}</div>
              <div className="tv-mono" style={{ fontSize: 6, color: "#4a3c26", marginTop: 1, whiteSpace: "nowrap", textShadow: "0 1px 2px #dcd0ae" }}>{a.nome}</div>
            </div>
          );
        })}
        {/* VOCÊ — na praça, num local de dentro, ou num arredor */}
        {(() => {
          const dentroDeAlgo = noLocal || noComodo;
          const p = noArredor ? { x: 50 + Math.cos(noArredor.ang) * 44, y: 50 + Math.sin(noArredor.ang) * 44 }
            : dentroDeAlgo ? { x: dentroDeAlgo.x, y: dentroDeAlgo.y }
            : { x: 50, y: 50 };
          return (
            <div style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", pointerEvents: "none", textAlign: "center" }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f0e6cc", border: "2.5px solid #b4322e", boxShadow: "0 0 9px #b4322e", margin: "0 auto" }} />
            </div>
          );
        })()}
        {/* o nome da cidade, em cima */}
        <div style={{ position: "absolute", left: "50%", top: 6, transform: "translateX(-50%)", pointerEvents: "none" }}>
          <div className="tv-display" style={{ fontSize: 13, color: "#5c4a30", letterSpacing: "0.08em", whiteSpace: "nowrap", textShadow: "0 1px 2px #f0e6cc" }}>{cidade.nome}</div>
        </div>
      </div>

      {/* v9.54: a planta passa a DIZER o que ela é. Sem esta linha o jogador
          vê a muralha encolher e não sabe se é desenho ou informação. */}
      <div className="tv-mono text-[10px] mb-2 px-2 py-1.5 rounded-lg" style={{ background: T.panelSoft, border: `1px solid ${T.line}`, color: T.inkDim }}>
        {cidade.porte ? `${cidade.porte} · ` : ""}{forma.pop ? `${forma.pop.toLocaleString("pt-BR")} almas · ` : ""}{forma.nota}
      </div>

      <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>{forma.muro.id === "nenhum" ? `No casario (${locais.length})` : `Dentro dos muros (${locais.length})`}</div>
      <div className="space-y-1.5 mb-3">
        {locais.map((l) => {
          const estouAqui = igual(l.nome, aqui);
          const comodos = comodosDoLocal(semente, l, genero, molde);
          const aberto = selecionado === l.id;
          return (
            <div key={l.id} className="rounded-lg px-3 py-2" onClick={() => aoSelecionar && aoSelecionar(aberto ? null : l.id)}
              style={{ background: T.panelSoft, border: `1px solid ${aberto ? T.amber : estouAqui || (noComodo && noComodo.id === l.id) ? T.amberSoft : T.line}`, cursor: "pointer" }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14 }}>{l.icone}</span>
                <span className="tv-body text-sm" style={{ color: T.ink }}>{estouAqui ? "📍 " : ""}{l.nome}</span>
                <span className="tv-mono text-[9px] ml-auto shrink-0" style={{ color: T.inkDim }}>{l.tipo}</span>
                {botaoIr({ ...l, onde: "dentro" }, "▸ ir")}
              </div>
              {/* v9.58: OS CÔMODOS. A pergunta era se "quartos numa taverna"
                  funcionava — funcionava meio: a distância existia e o sistema
                  não sabia de cômodo nenhum. Agora o prédio tem planta, ela é
                  fixa, e daqui se entra nela. */}
              {aberto && comodos.length > 0 && (
                <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${T.line}` }}>
                  {comodos.map((q) => {
                    const noQuarto = lugar && igual(q.nome, aqui);
                    return (
                      <div key={q.id} className="flex items-center gap-2">
                        <span style={{ fontSize: 11 }}>{q.icone}</span>
                        <span className="tv-body text-xs" style={{ color: noQuarto ? T.amber : T.ink }}>{noQuarto ? "📍 " : ""}{q.nome}</span>
                        {q.restrito && <span className="tv-mono text-[8px] px-1 rounded shrink-0" style={{ color: T.danger, border: `1px solid ${T.danger}` }}>restrito</span>}
                        <span className="tv-body text-[10px] ml-auto shrink-0" style={{ color: T.inkDim }}>{q.nota}</span>
                        {botaoIr({ ...q, onde: "comodo", dentroDe: l.nome }, "▸ entrar")}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {fora.length > 0 && (
        <>
          <div className="tv-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Fora dos muros ({fora.length})</div>
          <div className="space-y-1.5">
            {fora.map((a) => (
              <div key={a.id} className="rounded-lg px-3 py-2" onClick={() => aoSelecionar && aoSelecionar(selecionado === a.id ? null : a.id)}
                style={{ background: T.panelSoft, border: `1px solid ${selecionado === a.id ? T.amber : noArredor && noArredor.id === a.id ? T.amberSoft : T.line}`, cursor: "pointer" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{a.icone}</span>
                  <span className="tv-body text-sm" style={{ color: T.ink }}>{noArredor && noArredor.id === a.id ? "📍 " : ""}{a.nome}</span>
                  <span className="tv-mono text-[9px] ml-auto shrink-0" style={{ color: T.violetSoft }}>{tempoDeIda(a)}</span>
                  {botaoIr({ ...a, onde: "arredores" }, "▸ ir")}
                </div>
                {selecionado === a.id && <div className="tv-body text-xs mt-1" style={{ color: T.inkDim }}>Mora lá: {a.dono}.</div>}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="tv-mono text-[10px] mt-3 px-2 py-1.5 rounded-lg" style={{ background: T.panelSoft, border: `1px dashed ${T.line}`, color: T.inkDim }}>
        A planta não tem névoa: uma tarde na cidade basta para saber onde ficam as coisas. O que há DENTRO delas — quem, o quê, o segredo — continua sendo descoberta sua.
      </div>
    </div>
  );
}
