/* ============================================================
   A FICHA VISUAL (v9.13) — Taverna

   A ficha era uma lista vertical: dava para ler, não dava para
   BATER O OLHO. Numa mesa você olha a ficha e já sabe três coisas
   sem ler nada — quanto aguenta, o quanto é difícil te acertar, e
   em que você é bom. Era isso que faltava.

   O desenho segue a lógica das fichas de mesa modernas (blocos de
   atributo com o MODIFICADOR grande e o valor pequeno embaixo, a
   linha de vitais em destaque), mas com a paleta e o tipo da casa:
   âmbar e violeta sobre roxo escuro, serifa no nome, monoespaçada
   nos números.

   Zero decisão nova aqui dentro. Tudo o que aparece já era
   calculado pelo sistema — esta camada só mostra. Se um número
   estiver errado, o erro está no módulo que o produziu, não aqui.
   ============================================================ */

import React from "react";
import { T, ATRIBUTOS, XP_POR_NIVEL } from "./constantes.js";
import { poderDe, poderDoGrupo, formatarPoder, contaDoPoder } from "./poder.js";
import { Retrato } from "./ui.jsx";
import { sementeDe, estadoDe } from "./semente.js";
import { bonusProficiencia, ehProficiente } from "./regras.js";
import { PERICIAS, garantirPericias, bonusDePericia, passivoDe, limiteTreinadas, limiteEspecialistas, lequeDaClasse, periciasDoAntecedente } from "./pericias.js";
import { garantirDadosVida } from "./descanso.js";
import { chamadoDaRaca } from "./lexico.js";
import { fichaDoItem } from "./itens.js";
/* v9.159: os leitores dos escudos do corpo e do passo. Nenhum deles decide
   nada aqui — tracos.js, dadivas.js, danos.js e movimento.js já calculavam
   tudo isto para o combate; a ficha só passou a MOSTRAR o que sempre valeu. */
import { efeitoDe, textoDoTraco } from "./tracos.js";
import { imunidadesDe } from "./dadivas.js";
import { resistenciasEquipadas, rotuloDano, iconeDano } from "./danos.js";
import { CONDICOES } from "./condicoes.js";
import { deslocamentoDe } from "./movimento.js";

const sinal = (n) => `${n >= 0 ? "+" : ""}${n}`;

/* ---------------- peças ---------------- */

/* O bloco de atributo virou MEDALHÃO (v9.159): o hexágono das fichas de
   mesa modernas, com o modificador grande dentro e o valor bruto num
   selo que morde a ponta de baixo. A proficiência continua sendo a
   borda âmbar — a forma mudou, a linguagem não.

   O botão de gastar ponto mora FORA do hexágono: clip-path corta os
   filhos junto com a caixa, e um botão cortado ao meio é um botão que
   ninguém acha. */
const HEXAGONO = "polygon(50% 0%, 100% 26%, 100% 74%, 50% 100%, 0% 74%, 0% 26%)";
function BlocoAtributo({ id, nome, valor, mod, proficiente, onSubir, podeSubir }) {
  return (
    <div className="relative pb-2.5"
      title={`${nome}${proficiente ? " — proficiente: soma o bônus de classe nas rolagens" : ""}`}>
      <div style={{ clipPath: HEXAGONO, background: proficiente ? T.amber : T.line, padding: "1.5px" }}>
        <div className="flex flex-col items-center justify-center py-2.5"
          style={{ clipPath: HEXAGONO, background: T.panel, minHeight: "72px" }}>
          <div className="tv-mono text-[8px] uppercase tracking-widest" style={{ color: proficiente ? T.amberSoft : T.inkDim }}>{nome.slice(0, 3)}</div>
          <div className="tv-display text-2xl leading-none" style={{ color: T.ink, fontWeight: 700 }}>{sinal(mod)}</div>
        </div>
      </div>
      <div className="absolute left-1/2 bottom-0 tv-mono text-[9px] px-1.5 py-px rounded-full"
        style={{ transform: "translateX(-50%)", background: T.panelSoft, border: `1px solid ${proficiente ? T.amber : T.line}`, color: T.inkDim }}>{valor}</div>
      {podeSubir && (
        <button onClick={() => onSubir && onSubir(id)} title={`Gastar ponto em ${nome}`}
          className="absolute -top-1.5 -right-1 tv-mono text-[10px] w-5 h-5 rounded-full leading-none"
          style={{ background: T.amber, color: T.onAccent, border: `1px solid ${T.amber}`, fontWeight: 700 }}>+</button>
      )}
    </div>
  );
}

/* Um vital: rótulo pequeno, número grande. É a linha que o jogador
   consulta no meio de um turno, então não pode ter enfeite. */
function Vital({ rotulo, valor, sub, cor = T.ink, titulo }) {
  return (
    <div className="rounded-xl px-2 py-2 text-center" style={{ background: T.panel, border: `1px solid ${T.line}` }} title={titulo}>
      <div className="tv-mono text-[8px] uppercase tracking-widest" style={{ color: T.inkDim }}>{rotulo}</div>
      <div className="tv-display text-xl leading-tight" style={{ color: cor, fontWeight: 700 }}>{valor}</div>
      {sub ? <div className="tv-mono text-[8px]" style={{ color: T.inkDim }}>{sub}</div> : null}
    </div>
  );
}

/* `forte` é a barra que se olha primeiro (v9.159): a vida ganha o dobro
   de altura e o número em display — na referência de mesa, o PV é a
   coisa mais gorda da ficha, porque é a pergunta que se faz com a
   espada já no ar. */
function Barra({ atual, max, cor, rotulo, forte = false }) {
  const pct = Math.max(0, Math.min(100, ((atual || 0) / (max || 1)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>{rotulo}</span>
        <span className={forte ? "tv-display text-lg leading-none" : "tv-mono text-[11px]"} style={{ color: cor, fontWeight: forte ? 700 : 400 }}>{atual}<span className={forte ? "tv-mono text-[10px]" : ""} style={{ color: T.inkDim, fontWeight: 400 }}>/{max}</span></span>
      </div>
      <div className={`${forte ? "h-3.5" : "h-2"} rounded-full overflow-hidden`} style={{ background: T.panel, border: forte ? `1px solid ${T.line}` : "none" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: forte ? `linear-gradient(90deg, ${cor}, ${cor}CC)` : cor, transition: "width .3s ease" }} />
      </div>
    </div>
  );
}

/* ---------------- a ficha ---------------- */

/* ---------------- A LISTA DE PERÍCIAS (v9.15) ----------------
   O bloco que faz a ficha parecer uma ficha. Três estados visuais e
   nada mais: especialista (★★, âmbar cheio), treinada (★, âmbar
   fraco), leiga (apagada). O número da direita é o que entra na
   rolagem — é o único que o jogador precisa ler no meio de um turno.

   Clicar treina ou destreina, respeitando o limite. É respec livre,
   igual ao que a casa já faz com atributos e talentos: o jogo não
   pune quem escolheu antes de entender o sistema. */
function LinhaPericia({ per, mod, nivelTreino, onClick, travada }) {
  const esp = nivelTreino === "especialista";
  const tre = nivelTreino === "treinada";
  const cor = esp ? T.amber : tre ? T.amberSoft : T.inkDim;
  return (
    <button
      onClick={onClick} disabled={travada && !esp && !tre}
      title={`${per.nome} — ${per.desc}${travada && !esp && !tre ? "\n\n(sem espaço: destreine outra antes)" : "\n\nclique para treinar / especializar / limpar"}`}
      className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-left"
      style={{
        background: esp || tre ? T.panel : "transparent",
        border: `1px solid ${esp ? T.amber : tre ? T.line : "transparent"}`,
        opacity: travada && !esp && !tre ? 0.45 : 1,
      }}>
      <span className="text-[11px] w-4 text-center" style={{ opacity: esp || tre ? 1 : 0.4 }}>{per.icone}</span>
      <span className="tv-body text-[11px] flex-1 truncate" style={{ color: esp || tre ? T.ink : T.inkDim }}>{per.nome}</span>
      <span className="tv-mono text-[9px]" style={{ color: T.amber, minWidth: "18px", textAlign: "right" }}>{esp ? "★★" : tre ? "★" : ""}</span>
      <span className="tv-mono text-[11px]" style={{ color: cor, fontWeight: esp || tre ? 700 : 400, minWidth: "26px", textAlign: "right" }}>{sinal(mod)}</span>
    </button>
  );
}

function BlocoPericias({ personagem, modDe, onAlternarPericia }) {
  const p = personagem || {};
  const { treinadas, especialistas } = garantirPericias(p);
  const maxT = limiteTreinadas(p);
  const maxE = limiteEspecialistas(p.nivel || 1);
  const leque = lequeDaClasse(p.classe);
  const doPassado = periciasDoAntecedente(p.antecedente);
  const cheio = treinadas.length >= maxT;
  const passivos = ["percepcao", "intuicao", "investigacao"];
  return (
    <div className="pt-2" style={{ borderTop: `1px solid ${T.line}` }}>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.violetSoft }}>Perícias</div>
        <div className="tv-mono text-[9px]" style={{ color: cheio ? T.amber : T.inkDim }}>
          {treinadas.length}/{maxT} treinadas{maxE ? ` · ${especialistas.length}/${maxE} especialista${maxE > 1 ? "s" : ""}` : ""}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {ATRIBUTOS.map((a) => (
          <div key={a.id} className="mb-1">
            <div className="tv-mono text-[8px] uppercase tracking-widest mb-0.5 px-1.5" style={{ color: T.inkDim }}>{a.nome}</div>
            {PERICIAS.filter((x) => x.atributo === a.id).map((per) => {
              const b = bonusDePericia(p, per.id, modDe ? modDe(a.id) : 0);
              return (
                <LinhaPericia key={per.id} per={per} mod={b.total} nivelTreino={b.nivelTreino}
                  travada={cheio} onClick={() => onAlternarPericia && onAlternarPericia(per.id)} />
              );
            })}
          </div>
        ))}
      </div>
      <div className="tv-mono text-[9px] mt-1.5 px-1.5 flex flex-wrap gap-x-3 gap-y-0.5" style={{ color: T.inkDim }}>
        <span title="o que você nota sem rolar dado nenhum">PASSIVOS:</span>
        {passivos.map((id) => {
          const per = PERICIAS.find((x) => x.id === id);
          return <span key={id} style={{ color: T.ink }}>{per.nome} {passivoDe(p, id, modDe ? modDe(per.atributo) : 0)}</span>;
        })}
      </div>
      <div className="tv-body text-[10px] italic mt-1 px-1.5" style={{ color: T.inkDim }}>
        {leque.escolhas} da classe + {doPassado.length} do passado{(p.classesExtras || []).length ? ` + ${(p.classesExtras || []).length} de multiclasse` : ""}.
        Clique para treinar (★), de novo para especializar (★★, dobra o bônus), de novo para limpar.
      </div>
    </div>
  );
}

export function FichaVisual({
  personagem, mundo, divindade, tituloAtivo, tituloInfo, famaInfo, patamarNome,
  defesa, iniciativa, ataques = 1, modDe, penalidades = [], proficiencias = null,
  onSubirAtributo, pontosAtr = 0, onAlternarPericia,
  /* v9.54: o golpe da vez e o próximo degrau. Enquanto o dado do marcial era
     sempre 1, mostrar só o número de ataques bastava; agora que ele cresce,
     essa pílula escondia metade da progressão de cinco classes. E `proximo`
     existe porque foi a queixa por trás da 3.1: não é só que o Monge parava
     de crescer — é que ele não tinha como saber que tinha parado. */
  golpe = null, proximo = null,
}) {
  const p = personagem || {};
  const nivel = p.nivel || 1;
  const prof = bonusProficiencia(nivel);
  const condicoes = p.condicoes || [];
  const efeitos = (p.efeitos || []).filter((e) => e && e.nome);
  const equipados = p.equipados || {};
  const armas = Object.entries(equipados).filter(([slot]) => slot === "arma" || slot === "escudo");
  const defesas = Object.entries(equipados).filter(([slot]) => slot !== "arma" && slot !== "escudo");

  return (
    /* `shrink-0` é lei aqui (v9.159): este contêiner vive como filho
       direto de um flex-col rolável, e overflow-hidden zera o min-height
       de item de flex — sem o shrink-0 ele é o ÚNICO filho disposto a
       encolher, e encolhe até virar uma linha de 2px. */
    <div className="rounded-2xl overflow-hidden shrink-0" style={{ border: `1px solid ${T.line}`, background: T.panelSoft }}>
      {/* ---- cabeçalho: quem é (v9.159, no desenho das fichas de mesa) ----
          O retrato vira CARTA: moldura própria com o escudo de nível
          mordendo a base — o nível deixa de ser um "nv 10" perdido no
          meio de uma linha e vira a insígnia que toda ficha de mesa põe
          embaixo do rosto. E a experiência sobe para cá, porque nome,
          nível e o quanto falta para o próximo são a MESMA pergunta. */}
      <div className="p-3" style={{ background: `linear-gradient(135deg, ${T.panel} 0%, #1B1528 100%)`, borderBottom: `1px solid ${T.line}` }}>
        <div className="flex items-center gap-3">
        <div className="relative shrink-0 pb-2">
          <div className="rounded-xl p-1" style={{ background: T.panelSoft, border: `1.5px solid ${tituloInfo && tituloInfo.divino ? T.violet : T.amber}` }}>
            <Retrato semente={sementeDe(p)} ente={p} lex={(mundo || {}).lexico} legenda={(tituloInfo && tituloInfo.titulo) || ""} tamanho={64} anel={T.line} estado={estadoDe(p.vida, p.vidaMax)} />
          </div>
          <div className="absolute left-1/2 bottom-0 w-6 h-6 flex items-center justify-center"
            title={`Nível ${nivel}`}
            style={{ transform: "translateX(-50%) rotate(45deg)", background: T.amber, borderRadius: 5, border: `2px solid ${T.panelSoft}` }}>
            <span className="tv-mono text-[10px]" style={{ transform: "rotate(-45deg)", color: T.onAccent, fontWeight: 700 }}>{nivel}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="tv-display text-2xl leading-tight truncate" style={{ color: T.ink }}>{p.nome}</div>
          <div className="tv-mono text-[10px] uppercase tracking-widest truncate" style={{ color: T.amberSoft }}>
            {/* o nível saiu desta linha: ele mora no escudo sob o retrato */}
            {[chamadoDaRaca((mundo || {}).lexico, p.raca), p.classe, p.subclasse].filter(Boolean).join(" · ") || "sem caminho"}
          </div>
          {tituloInfo && (
            <div className="tv-mono text-[10px] truncate" style={{ color: tituloInfo.divino ? T.violetSoft : T.inkDim }}>
              {tituloInfo.divino ? `🌟 ${tituloInfo.titulo} · GD ${tituloInfo.gd}` : tituloInfo.titulo}
              {patamarNome ? <span style={{ color: T.inkDim }}> · {patamarNome}</span> : null}
            </div>
          )}
          {tituloAtivo ? <div className="tv-mono text-[10px]" style={{ color: T.amber }}>★ ❝ {tituloAtivo} ❞</div> : null}
        </div>
        {/* ---------------- O PODER (v9.116) ----------------
            No cabeçalho, ao lado do rosto, porque é o número que resume
            todos os outros — e porque o pedido é explícito em que ele tem
            de ser visível. O tooltip abre a conta inteira: um total sem as
            parcelas seria um número mágico, e o jogador não saberia se
            falta nível, atributo ou espada. */}
        {(() => {
          const pd = poderDe(p);
          const g = poderDoGrupo(p);
          return (
            <div className="text-right shrink-0" title={contaDoPoder(pd)}>
              <div className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Poder</div>
              <div className="tv-display text-2xl leading-none" style={{ color: T.amber }}>{formatarPoder(pd.total)}</div>
              {g.quantos > 0 && (
                <div className="tv-mono text-[9px] mt-0.5" style={{ color: T.violetSoft }}
                  title={`Com o grupo: ${formatarPoder(g.total)}${g.aparado ? " (aparado pelo teto — quem apanha é você)" : ""}`}>
                  grupo {formatarPoder(g.total)}
                </div>
              )}
            </div>
          );
        })()}
        </div>
        {/* a régua da experiência: o xp é relativo ao nível (regras.js), e
            é por isso que a barra zera a cada subida — ela mede o vão até
            o próximo degrau, não a vida inteira */}
        {(() => {
          const teto = XP_POR_NIVEL(nivel);
          const pct = Math.max(0, Math.min(100, ((p.xp || 0) / (teto || 1)) * 100));
          return (
            <div className="mt-2.5" title={`Experiência: ${p.xp || 0} de ${teto} para o nível ${nivel + 1}`}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="tv-mono text-[8px] uppercase tracking-widest" style={{ color: T.inkDim }}>Experiência</span>
                <span className="tv-mono text-[9px]" style={{ color: T.amberSoft }}>{p.xp || 0}<span style={{ color: T.inkDim }}> / {teto} · nv {nivel + 1}</span></span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.bg }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${T.amber}, ${T.amberSoft})`, transition: "width .3s ease" }} />
              </div>
            </div>
          );
        })()}
      </div>

      <div className="p-3 space-y-3">
        {/* ---- os vitais: o que se consulta no meio do turno ----
            v9.159: o PASSO entrou na fileira. Ele sempre foi calculado
            (movimento.js pesa armadura, condição e exaustão) e sempre
            valeu no tabuleiro — mas só aparecia DENTRO do combate, e a
            pergunta "eu alcanço?" se faz antes de a luta começar. */}
        {(() => {
          const desloc = deslocamentoDe(p);
          return (
        <div className="grid grid-cols-5 gap-1.5">
          <Vital rotulo="Defesa" valor={defesa} cor={T.amberSoft} titulo="Quão difícil é te acertar (10 + destreza + armadura e escudo)" />
          <Vital rotulo="Iniciativa" valor={sinal(iniciativa)} titulo="O que você soma ao d20 para decidir quem age primeiro" />
          <Vital rotulo="Proficiência" valor={sinal(prof)} titulo={`Bônus de proficiência do nível ${nivel} — soma no que você domina`} />
          <Vital rotulo="Passo" valor={desloc.parado ? "0 m" : `${desloc.andar} m`}
            sub={desloc.voar ? `voo ${desloc.voar} m` : null}
            cor={desloc.parado ? T.danger : T.ink}
            titulo={`Quanto você anda num turno${desloc.fontes && desloc.fontes.length ? ` — mexendo no passo: ${desloc.fontes.join(", ")}` : ""}`} />
          <Vital rotulo={golpe && golpe.tipo === "conjurador" ? "Conjuração" : "Ataques"}
            valor={golpe && golpe.tipo === "conjurador" ? `${golpe.dados}d${golpe.face}` : ataques}
            sub={golpe && golpe.tipo !== "conjurador" ? `× ${golpe.dados}d${golpe.face}` : "por turno"}
            cor={ataques > 1 || (golpe && golpe.dados > 1) ? T.amberSoft : T.ink}
            titulo={golpe ? `${golpe.texto} — os dois eixos da sua classe: quantos golpes saem e quanto dado cada um carrega` : "Quantos golpes saem numa ação de ataque, pela sua classe e nível"} />
        </div>
          );
        })()}

        {/* ---- os escudos do corpo (v9.159) ----
            Resistência de raça, redução do anão, imunidade de dádiva e de
            item, a mente firme do gnomo: tudo isto já VALIA em combate — e
            não estava escrito em lugar nenhum da ficha. Regra que vale e
            não aparece é regra que o jogador não usa a favor. */}
        {(() => {
          const ef = efeitoDe(p);
          const resist = [...new Set([...(Array.isArray(ef.resistencia) ? ef.resistencia : []), ...resistenciasEquipadas(p)])];
          const reducoes = ef.reduzDano && typeof ef.reduzDano === "object" ? Object.entries(ef.reduzDano) : [];
          const imunes = [...new Set([...(Array.isArray(ef.imune) ? ef.imune : []), ...imunidadesDe(p)])];
          if (!resist.length && !reducoes.length && !imunes.length && !ef.vantagemMental) return null;
          const doTraco = textoDoTraco(p);
          const chip = "tv-mono text-[9px] px-1.5 py-0.5 rounded";
          return (
            <div className="flex items-center gap-1.5 flex-wrap px-1" title={doTraco}>
              <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>escudos do corpo</span>
              {resist.map((t) => (
                <span key={`r${t}`} className={chip} title={`Resistência: dano de ${rotuloDano(t)} cai pela metade`}
                  style={{ color: T.ok, border: `1px solid ${T.line}` }}>{iconeDano(t)} {rotuloDano(t)} ½</span>
              ))}
              {reducoes.map(([t, v]) => (
                <span key={`d${t}`} className={chip} title={`Redução: todo dano de ${rotuloDano(t)} chega ${v} menor`}
                  style={{ color: T.ok, border: `1px solid ${T.line}` }}>{iconeDano(t)} {rotuloDano(t)} −{v}</span>
              ))}
              {imunes.map((c) => {
                const cond = CONDICOES[c];
                return (
                  <span key={`i${c}`} className={chip} title={`Imunidade: ${cond ? cond.rotulo : c} não pega em você`}
                    style={{ color: T.violetSoft, border: `1px solid ${T.violet}` }}>{cond ? `${cond.icone} ${cond.rotulo}` : c} ∅</span>
                );
              })}
              {ef.vantagemMental && (
                <span className={chip} title="Mente firme: vantagem para resistir a medo, encanto e domínio"
                  style={{ color: T.violetSoft, border: `1px solid ${T.line}` }}>🧠 mente firme</span>
              )}
            </div>
          );
        })()}

        {/* A CONTA, aberta. É a diferença entre um índice e um número
            mágico: cada linha diz de onde veio uma fatia do poder, e o
            jogador lê ali o que mexer para subir. */}
        {(() => {
          const pd = poderDe(p);
          const partes = pd.partes.filter((x) => Math.abs(x.fracao) >= 0.005);
          if (!partes.length) return null;
          return (
            <div className="flex items-center gap-1.5 flex-wrap px-1">
              <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>de onde vem</span>
              {partes.map((x) => (
                <span key={x.id} className="tv-mono text-[9px] px-1.5 py-0.5 rounded" title={`${x.rotulo}: ${x.fracao > 0 ? "+" : ""}${Math.round(x.fracao * 100)}% do seu nível = ${formatarPoder(x.pontos)} de poder`}
                  style={{ color: x.fracao >= 0 ? T.amberSoft : T.danger, border: `1px solid ${T.line}` }}>
                  {x.rotulo} {x.pontos >= 0 ? "+" : "−"}{formatarPoder(Math.abs(x.pontos))}
                </span>
              ))}
            </div>
          );
        })()}

        {proximo ? (
          <div className="tv-mono text-[9px] px-1" style={{ color: T.inkDim }} title="O próximo degrau de combate da sua classe">
            ▸ próximo degrau {proximo.texto}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Barra atual={p.vida} max={p.vidaMax} cor={T.danger} rotulo="Vida" forte />
          <Barra atual={p.mana} max={p.manaMax} cor={T.violet} rotulo="Mana" />
          {/* v9.17: o fôlego de reserva. Fica colado nas barras porque é a
              mesma pergunta — "quanto ainda dá para aguentar?" — só que a
              resposta de amanhã em vez da de agora. */}
          {(() => {
            const dv = garantirDadosVida(p);
            const livres = dv.total - dv.gastos;
            return (
              <div className="flex items-center gap-2 flex-wrap" title="Dados de vida: o PV do descanso curto sai daqui. Só voltam pela metade numa noite inteira.">
                <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>🩹 Fôlego</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(dv.total, 20) }).map((_, i) => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: 2, display: "inline-block",
                      background: i < livres ? T.amber : "transparent",
                      border: `1px solid ${i < livres ? T.amber : T.line}`,
                    }} />
                  ))}
                </div>
                <span className="tv-mono text-[9px]" style={{ color: livres ? T.amberSoft : T.danger }}>{livres}/{dv.total} dados</span>
              </div>
            );
          })()}
        </div>

        {/* ---- atributos: modificador grande, valor pequeno ---- */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="tv-mono text-[9px] uppercase tracking-widest" style={{ color: T.inkDim }}>Atributos</span>
            {pontosAtr > 0 && <span className="tv-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: T.amber, color: T.onAccent, fontWeight: 700 }}>{pontosAtr} ponto{pontosAtr > 1 ? "s" : ""} a gastar</span>}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {ATRIBUTOS.map((a) => (
              <BlocoAtributo key={a.id} id={a.id} nome={a.nome}
                valor={(p.atributos || {})[a.id] || 0}
                mod={modDe ? modDe(a.id) : ((p.atributos || {})[a.id] || 0)}
                proficiente={ehProficiente(p.classe, a.id)}
                onSubir={onSubirAtributo} podeSubir={pontosAtr > 0 && !!onSubirAtributo} />
            ))}
          </div>
          <div className="tv-mono text-[8px] mt-1" style={{ color: T.inkDim }}>Número grande: o que entra na rolagem (atributo + equipamento + efeitos). Borda âmbar: proficiente.</div>
        </div>

        {/* ---- o que está no corpo ---- */}
        <div>
          <div className="tv-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Empunhado e vestido</div>
          {armas.length === 0 && defesas.length === 0 ? (
            <div className="tv-body text-xs italic" style={{ color: T.inkDim }}>Nada equipado — de mãos vazias e sem proteção.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {[...armas, ...defesas].map(([slot, it]) => {
                /* v9.111: A LINHA DE BAIXO É DO SISTEMA, e ela é obrigatória.
                   O nome do item agora é a palavra deste mundo, e nenhum nome
                   de mundo grita "arma marcial de duas mãos" como "Montante"
                   gritava. Esta linha é o que impede o apelido de virar
                   promessa falsa: o nome é do mundo, a forma é do sistema. */
                const fi = fichaDoItem(it);
                const forma = fi ? [fi.rotulo, fi.mao === 2 ? "2 mãos" : "", ...(fi.props || [])].filter(Boolean).join(" · ") : "";
                return (
                <span key={slot} title={`${it.nome}${fi && fi.base && fi.base !== it.nome ? ` (o sistema vê: ${fi.base})` : ""}${forma ? ` — ${forma}` : ""}${it.poder ? ` — ${it.poder}` : ""}`}
                  className="tv-mono text-[10px] px-2 py-1 rounded-lg" style={{ background: T.panel, border: `1px solid ${T.line}`, color: T.ink, maxWidth: "100%" }}>
                  <span className="truncate block">
                  <span style={{ color: T.inkDim }}>{slot === "arma" ? "⚔" : slot === "escudo" ? "🛡" : slot === "armadura" ? "🧥" : "◆"}</span> {it.nome}
                  {it.atributos && Object.entries(it.atributos).map(([k, v]) => (
                    <span key={k} style={{ color: T.ok }}> {sinal(v)}{k === "dano" ? "dan" : k === "defesa" ? "def" : k.slice(0, 3)}</span>
                  ))}
                  </span>
                  {forma && <span className="block text-[8px] truncate" style={{ color: T.inkDim }}>{forma}</span>}
                </span>
                );
              })}
            </div>
          )}
          {proficiencias && (
            <div className="tv-mono text-[8px] mt-1.5" style={{ color: T.inkDim }}>
              Treinado em: {[...proficiencias.armas].join(", ") || "nenhuma arma"} · {[...proficiencias.armaduras].join(", ") || "sem armadura"}{proficiencias.escudo ? " · escudo" : ""}
            </div>
          )}
          {penalidades.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {penalidades.map((pe, i) => (
                <div key={i} className="tv-mono text-[9px] px-2 py-1 rounded" style={{ background: T.panel, border: `1px solid ${T.danger}`, color: T.inkDim }}>⚠ {pe.texto}</div>
              ))}
            </div>
          )}
        </div>

        {/* ---- o que está pegando agora ---- */}
        {(condicoes.length > 0 || efeitos.length > 0) && (
          <div>
            <div className="tv-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.inkDim }}>Agora mesmo</div>
            <div className="flex flex-wrap gap-1.5">
              {condicoes.map((c, i) => (
                <span key={`c${i}`} title={c.efeito || ""} className="tv-mono text-[10px] px-2 py-1 rounded-full"
                  style={{ background: T.panel, border: `1px solid ${c.tipo === "bom" ? T.ok : T.danger}`, color: c.tipo === "bom" ? T.ok : T.danger }}>
                  {c.icone} {c.nome}{c.turnos ? ` ${c.turnos}t` : ""}
                </span>
              ))}
              {efeitos.map((e, i) => (
                <span key={`e${i}`} className="tv-mono text-[10px] px-2 py-1 rounded-full"
                  style={{ background: T.panel, border: `1px solid ${T.violet}`, color: T.violetSoft }}>
                  ✦ {e.nome}{e.turnos ? ` ${e.turnos}t` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ---- perícias: quem ele é, e não só quanto ele tem ---- */}
        <BlocoPericias personagem={p} modDe={modDe} onAlternarPericia={onAlternarPericia} />

        {/* ---- a linha do mundo: fama e cicatrizes ---- */}
        <div className="flex items-center gap-3 flex-wrap pt-1" style={{ borderTop: `1px solid ${T.line}` }}>
          {famaInfo && (
            <div className="flex items-center gap-1.5" title={famaInfo.pf.nota}>
              <span className="tv-mono text-[9px] uppercase tracking-wider" style={{ color: T.amberSoft }}>📣 {famaInfo.pf.rotulo}</span>
              <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: T.panel }}>
                <div className="h-full rounded-full" style={{ width: `${famaInfo.f}%`, background: T.amber }} />
              </div>
            </div>
          )}
          {/* o XP saiu daqui (v9.159): ele mora na régua do cabeçalho — o
              mesmo número em dois cantos é como as duas verdades nascem */}
          <span className="tv-mono text-[9px]" style={{ color: T.inkDim }}>◉ {p.moedas || 0}</span>
          {(p.cicatrizes || []).length > 0 && (
            <span className="tv-mono text-[9px]" style={{ color: T.danger }} title={p.cicatrizes.map((c) => `${c.nome} — ${c.descricao}`).join("\n")}>
              🩸 {p.cicatrizes.length} cicatriz{p.cicatrizes.length > 1 ? "es" : ""}
            </span>
          )}
          {p.conceito ? <span className="tv-body text-xs italic truncate flex-1" style={{ color: T.inkDim }}>{p.conceito}</span> : null}
        </div>
      </div>
    </div>
  );
}
