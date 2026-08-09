/* ============================================================
   PAINEL CÓDEX — conquistas, coleções, títulos e crônica (v8.8) — Taverna
   Extraído do App.jsx na modularização.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { CONQUISTAS, conquistaPorId } from "./conquistas.js";
import { criaturasDoGenero } from "./bestiario.js";
import { Retrato, sementeDe, Botao } from "./ui.jsx";
import { gerarCronica } from "./cronica.js";

const ROTULO_AMEACA = { fraco: "fraca", comum: "comum", competente: "competente", elite: "elite", lendario: "lendária" };
const CATEGORIAS_CONQUISTA = [
  { id: "lamina", rotulo: "Lâmina", ids: ["primeiro_sangue", "dez_abatidos", "cinquenta_abatidos", "cem_abatidos", "matador_elite", "cinco_elites", "matador_lendario", "tres_lendarios", "primeiro_critico", "dez_criticos", "primeiro_desastre", "cinco_vitorias", "quinze_vitorias", "fio_da_morte", "primeira_cicatriz", "cinco_cicatrizes"] },
  { id: "estrada", rotulo: "Estrada", ids: ["primeira_viagem", "dez_viagens", "vintecinco_viagens", "dez_perigos", "dez_criaturas", "vinte_criaturas", "primeira_masmorra", "cinco_masmorras", "primeiro_contrato", "dez_contratos", "trinta_dias", "ano_inteiro"] },
  { id: "coracao", rotulo: "Coração", ids: ["primeiro_companheiro", "tres_companheiros", "cinco_pessoas", "quinze_pessoas", "trinta_pessoas", "primeiro_presente", "cinco_presentes", "vinculo_amizade", "vinculos_tres", "vinculo_profundo"] },
  { id: "ouro", rotulo: "Ouro", ids: ["cem_moedas", "quinhentas_moedas", "mil_moedas", "cofre_gordo", "primeiro_forjado", "dez_desmontados", "item_lendario"] },
  { id: "coroa", rotulo: "Coroa", ids: ["fundador", "primeira_cidade", "tres_dominios", "cinco_dominios", "guilda_nv3", "guilda_nv5", "primeira_alianca", "tres_tratados", "primeiro_vassalo", "primeira_guerra", "primeiro_decreto", "cinco_decretos", "dez_eventos_reino"] },
  { id: "lenda", rotulo: "Lenda", ids: ["nv5", "nv10", "nv15", "nv20", "nome_conhecido", "lenda_viva", "nemesis_surgida", "nemesis_vencida", "primeiro_cronica"] },
];

export function PainelCodex({ conquistas, tituloAtivo, escolherTitulo, descobertas, contadores, mundo, npcs, mapa, personagem, nomeCampanha, guilda, reino, dia, nemesis, faccaoJogador, onExportarCronica }) {
  const [subCodex, setSubCodex] = React.useState("conquistas");
  const desb = (conquistas && conquistas.desbloqueadas) || {};
  const nDesb = CONQUISTAS.filter((c) => desb[c.id]).length;
  const criaturas = criaturasDoGenero((mundo || {}).genero || "Fantasia medieval");
  const descNomes = (descobertas || []).map((d) => d.toLowerCase());
  const achadas = criaturas.filter((c) => descNomes.some((d) => d.includes(c.nome.toLowerCase())));
  const descExtra = (descobertas || []).filter((d) => !criaturas.some((c) => d.toLowerCase().includes(c.nome.toLowerCase())));
  const cont = contadores || {};
  const REGISTROS = [
    ["☠ Abates", cont.inimigosDerrotados || 0], ["🐗 Elites", cont.elitesDerrotados || 0], ["🐉 Lendárias", cont.lendariosDerrotados || 0],
    ["🛡 Vitórias", cont.combatesVencidos || 0], ["🎯 Críticos", cont.criticos || 0], ["💥 Desastres", cont.desastres || 0],
    ["💀 Fio da morte", cont.quaseMorte || 0], ["🧭 Viagens", cont.viagens || 0], ["🌲 Perigos na estrada", cont.perigosEstrada || 0],
    ["⛺ Descansos", cont.descansos || 0], ["🎁 Presentes", cont.presentes || 0], ["⚑ Recrutados", cont.recrutados || 0],
  ];
  const SUBS = [{ id: "conquistas", rotulo: `Títulos ${nDesb}/${CONQUISTAS.length}` }, { id: "bestiario", rotulo: `Bestiário ${achadas.length}/${criaturas.length}` }, { id: "registros", rotulo: "Registros" }, { id: "cronica", rotulo: "📜 Crônica" }];
  return (
    <>
      <div className="flex flex-wrap gap-1.5 -mt-2">
        {SUBS.map((s) => (
          <button key={s.id} onClick={() => setSubCodex(s.id)}
            className="tv-mono text-[10px] px-2.5 py-1.5 rounded-full"
            style={{ background: subCodex === s.id ? T.amber : T.panelSoft, color: subCodex === s.id ? T.onAccent : T.inkDim, border: `1px solid ${subCodex === s.id ? T.amber : T.line}`, fontWeight: 600 }}>
            {s.rotulo}
          </button>
        ))}
      </div>

      {subCodex === "conquistas" && (
        <>
          <div className="rounded-xl px-4 py-3" style={{ background: T.panelSoft, border: `1px solid ${T.amber}` }}>
            <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Título equipado</div>
            <div className="tv-display text-xl leading-tight" style={{ color: T.amberSoft }}>{tituloAtivo ? `❝ ${tituloAtivo} ❞` : "nenhum — toque num título desbloqueado"}</div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panelSoft }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round((nDesb / CONQUISTAS.length) * 100)}%`, background: T.amber }} />
          </div>
          {CATEGORIAS_CONQUISTA.map((cat) => (
            <div key={cat.id}>
              <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.violetSoft }}>{cat.rotulo}</div>
              <div className="space-y-1.5">
                {cat.ids.map((id) => {
                  const c = conquistaPorId(id);
                  if (!c) return null;
                  const aberta = !!desb[c.id];
                  const equipado = aberta && tituloAtivo === c.titulo;
                  return (
                    <button key={c.id} disabled={!aberta} onClick={() => escolherTitulo(c.id)}
                      className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2.5"
                      style={{ background: equipado ? T.panelSoft : "transparent", border: `1px solid ${equipado ? T.amber : aberta ? T.line : T.panelSoft}`, opacity: aberta ? 1 : 0.55 }}>
                      <span style={{ fontSize: 18, filter: aberta ? "none" : "grayscale(1)" }}>{aberta || !c.segredo ? c.icone : "❔"}</span>
                      <span className="flex-1 min-w-0">
                        <span className="tv-body text-sm block truncate" style={{ color: aberta ? T.ink : T.inkDim }}>
                          {aberta || !c.segredo ? c.nome : "???"}
                          {aberta && <span className="tv-mono text-[10px]" style={{ color: T.amberSoft }}> · “{c.titulo}”</span>}
                        </span>
                        <span className="tv-body text-[11px] italic block truncate" style={{ color: T.inkDim }}>
                          {aberta ? (equipado ? "equipado — toque para desequipar" : "toque para equipar o título") : c.segredo ? "conquista secreta" : c.dica}
                        </span>
                      </span>
                      {aberta && <span className="tv-mono text-xs" style={{ color: equipado ? T.amber : T.ok }}>{equipado ? "★" : "✓"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {subCodex === "bestiario" && (
        <>
          <div className="tv-body text-xs" style={{ color: T.inkDim }}>
            Criaturas que você já enfrentou em combate. As desconhecidas aguardam na estrada…
          </div>
          <div className="space-y-1.5">
            {criaturas.map((c) => {
              const vista = descNomes.some((d) => d.includes(c.nome.toLowerCase()));
              return (
                <div key={c.nome} className="rounded-lg px-3 py-2 flex items-center gap-2.5" style={{ background: vista ? T.panelSoft : "transparent", border: `1px solid ${vista ? T.line : T.panelSoft}`, opacity: vista ? 1 : 0.5 }}>
                  <span style={{ fontSize: 18 }}>{vista ? ({ fraco: "🐀", comum: "🐺", competente: "🐗", elite: "🦖", lendario: "🐉" })[c.ameaca] || "👹" : "❔"}</span>
                  <span className="flex-1 min-w-0">
                    <span className="tv-body text-sm block" style={{ color: vista ? T.ink : T.inkDim }}>{vista ? c.nome : "???"}</span>
                    {vista && <span className="tv-body text-[11px] italic block truncate" style={{ color: T.inkDim }}>{c.desc}</span>}
                  </span>
                  {vista && <span className="tv-mono text-[9px] uppercase" style={{ color: c.ameaca === "lendario" ? T.amber : c.ameaca === "elite" ? T.violetSoft : T.inkDim }}>{ROTULO_AMEACA[c.ameaca] || c.ameaca}</span>}
                </div>
              );
            })}
            {descExtra.map((d) => (
              <div key={d} className="rounded-lg px-3 py-2 flex items-center gap-2.5" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <span style={{ fontSize: 18 }}>👹</span>
                <span className="flex-1 min-w-0">
                  <span className="tv-body text-sm block" style={{ color: T.ink }}>{d}</span>
                  <span className="tv-body text-[11px] italic block" style={{ color: T.inkDim }}>criatura única desta história</span>
                </span>
                <span className="tv-mono text-[9px] uppercase" style={{ color: T.amberSoft }}>única</span>
              </div>
            ))}
          </div>
        </>
      )}

      {subCodex === "registros" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {REGISTROS.map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-xl px-2.5 py-2.5 text-center" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                <div className="tv-mono text-lg font-semibold" style={{ color: T.amberSoft }}>{valor}</div>
                <div className="tv-mono text-[8px] uppercase tracking-wider" style={{ color: T.inkDim }}>{rotulo}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="tv-mono text-xs uppercase tracking-widest mb-2" style={{ color: T.inkDim }}>Mundo</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["👥 Pessoas conhecidas", Object.keys(npcs || {}).length],
                ["🚩 Potências", ((mapa || {}).faccoes || []).length],
                ["🏰 Cidades no mapa", ((mapa || {}).cidades || []).length],
                ["⚑ Companheiros", ((personagem || {}).grupo || []).length],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
                  <span className="tv-body text-xs" style={{ color: T.inkDim }}>{rotulo}</span>
                  <span className="tv-mono text-lg font-semibold" style={{ color: T.amberSoft }}>{valor}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {subCodex === "cronica" && (() => {
        /* CRÔNICA (v6.9): a saga formatada a partir dos registros — zero tokens. */
        const md = gerarCronica({
          nomeCampanha: nomeCampanha || "Campanha", mundo, personagem,
          conquistasIds: Object.keys(desb), contadores: cont, npcs, mapa,
          faccaoJogador, guilda, reino, dia: dia || 1, nemesis, tituloAtivo, descobertas,
        });
        return (
          <>
            <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>
              A sua saga inteira — herói, feitos, cicatrizes, companheiros, domínios, pessoas e números — formatada a partir dos registros do app. Nada é inventado: é a memória de verdade.
            </div>
            <button onClick={() => onExportarCronica && onExportarCronica(md)}
              className="w-full tv-mono text-xs px-3 py-2.5 rounded-lg font-semibold"
              style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}` }}>
              📜 baixar crônica (.md)
            </button>
            <div className="rounded-xl p-3 max-h-72 overflow-y-auto" style={{ background: T.panelSoft, border: `1px solid ${T.line}` }}>
              <pre className="tv-body text-[11px] whitespace-pre-wrap" style={{ color: T.ink }}>{md}</pre>
            </div>
          </>
        );
      })()}
    </>
  );
}
