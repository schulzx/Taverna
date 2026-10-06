/* ============================================================
   O CARTÃO DO GOLPE FINAL (Fase MM · MM3 = Q3 + Q5) — src/painel-golpe-final.jsx

   Ele pergunta e devolve o gesto. NÃO decide nada: não aplica a escolha,
   não mexe em PV, não escreve no log, não fecha a janela sozinho. A conta
   inteira mora em `golpe-final.js` — este arquivo só monta a tela.

   MESMA FORMA DO CARTÃO DA REAÇÃO (`painel-reacao.jsx`, K3): os mesmos tokens (`T`, `ALVOS`),
   a mesma largura máxima, o mesmo `Botao` e a mesma `PilulaDeEscolha` que já
   existem em `ui.jsx` — "uma ação, uma forma": esta é outra decisão que
   suspende a luta, e não podia ganhar uma segunda cara. A diferença com K3
   é que aqui NÃO HÁ RELÓGIO — é o turno do próprio jogador, e "pular é um
   clique": os dois botões aplicam de imediato, escrever é sempre opcional.

   E POR NÃO TER RELÓGIO NÃO MORA ONDE A REAÇÃO MORA (MM16 nº 5). Nascia no slot
   da reação, ancorado na linha do veredito e crescendo para cima; num ecrã
   de 310 px o topo ficava fora dele e o foco não rolava até lá — o "como"
   escrevia-se às cegas. Hoje a `TelaDeBatalha` desenha-o NO FLUXO, no
   lugar dos verbos (prop `decisao`). A forma é a mesma; muda a morada.
   ============================================================ */
import React from "react";
import { T } from "./constantes.js";
import { Botao, PilulaDeEscolha } from "./ui.jsx";
import { ESCOLHAS_DO_GOLPE_FINAL, TETO_DA_CENA_DO_JOGADOR } from "./golpe-final.js";

/* A MESMA LARGURA do cartão da reação (painel-reacao.jsx) — o mesmo teto de
   leitura no monitor largo, para as duas decisões que suspendem a luta
   nunca discordarem de forma. */
const LARGURA_MAXIMA_PX = 560;

/* Fora do render, sempre: um componente definido dentro do corpo de outro
   reinicia a cada render e mata o foco do campo (armadilha da casa). */
function LinhaDaQueda({ quedas }) {
  if (!quedas || !quedas.length) return null;
  const partes = quedas.map((q) => `${q.nome}${q.dano ? ` (${q.dano}${q.critico ? " · crítico" : ""})` : ""}`);
  return (
    <div className="tv-body text-sm" role="status" style={{ color: T.ink }}>
      {partes.join(", ")} {quedas.length > 1 ? "caem" : "cai"} sob o seu golpe.
    </div>
  );
}

export function PainelGolpeFinal({
  quedas,      // [{ nome, dano, critico }] — quem cai e o golpe que derruba, já resolvido
  aoEscolher,  // (escolhaId, comoFez, lembrar) => void
  linhasQuedas, // opcional (MM3b): strings já prontas ("Bram derruba o Bandido."),
                // para quando quem derruba é o GRUPO — substitui `LinhaDaQueda`
                // sem mudar nada do golpe do próprio jogador.
  pergunta,     // opcional (MM3b): substitui "Como você faz isso?" — o golpe do
                // grupo pergunta pelo nome de quem deu o golpe.
}) {
  const [comoFez, setComoFez] = React.useState("");
  const [lembrar, setLembrar] = React.useState(false);
  const campoRef = React.useRef(null);

  /* O FOCO VAI AO CAMPO AO ABRIR — é a única peça de texto livre do
     momento, e o jogador que quer escrever não deveria ter de clicar nela
     primeiro. Os dois botões continuam alcançáveis por Tab depois dele. */
  React.useEffect(() => {
    const el = campoRef.current;
    if (!el) return;
    /* o foco SEM rolar: no primeiro quadro a tela ainda não sabe se é
       telefone (a tira do herói ainda está lá), e o rolar do foco ficava
       preso numa altura que deixa de existir um quadro depois — medido a
       374 × 310, o cartão abria rolado 47 px, com a linha de quem caiu
       escondida e o campo cortado em cima. Quem traz o campo à vista, se
       faltar ecrã, é a tela que o recebe (`TelaDeBatalha`, prop `decisao`),
       que sabe quando a altura assentou. */
    try { el.focus({ preventScroll: true }); } catch (e) { console.warn("PainelGolpeFinal: foco do campo falhou", e); }
  }, []);

  const escolher = (id) => {
    try { aoEscolher(id, comoFez.trim(), lembrar); }
    catch (e) { console.warn("PainelGolpeFinal: aoEscolher estourou", e); }
  };

  const noTeto = comoFez.length >= TETO_DA_CENA_DO_JOGADOR;

  return (
    <div
      className="tv-chamado-entra"
      style={{
        width: "100%", maxWidth: LARGURA_MAXIMA_PX, textAlign: "left",
        background: T.panel, border: `1px solid ${T.amber}`, borderRadius: 10, padding: 12,
      }}
    >
      {linhasQuedas && linhasQuedas.length ? (
        <div className="tv-body text-sm" role="status" style={{ color: T.ink }}>
          {linhasQuedas.join(" ")}
        </div>
      ) : (
        <LinhaDaQueda quedas={quedas} />
      )}

      {/* "Como você faz isso?" (Q5) — sempre opcional; um campo vazio não
          atrasa nem penaliza quem só quer clicar. Enter não envia nada: é
          um <textarea>, e a única saída é um dos dois botões abaixo. */}
      <textarea
        ref={campoRef}
        value={comoFez}
        onChange={(e) => setComoFez(e.target.value.slice(0, TETO_DA_CENA_DO_JOGADOR))}
        maxLength={TETO_DA_CENA_DO_JOGADOR}
        rows={2}
        placeholder={pergunta || "Como você faz isso? (opcional)"}
        className="w-full rounded-lg p-3 tv-body text-sm outline-none resize-none leading-[1.5]"
        style={{ marginTop: 8, background: T.panelSoft, border: `1px solid ${T.line}`, color: T.ink }}
      />
      <div className="tv-mono text-[10px]" style={{ color: noTeto ? T.amber : T.inkDim, textAlign: "right", marginTop: 2 }}>
        {comoFez.length}/{TETO_DA_CENA_DO_JOGADOR}
      </div>

      <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
        <Botao corpo primario className="flex-1" onClick={() => escolher(ESCOLHAS_DO_GOLPE_FINAL.nao_letal.id)}>
          {ESCOLHAS_DO_GOLPE_FINAL.nao_letal.rotulo} <span style={{ opacity: 0.75 }}>— cai desacordado, vivo</span>
        </Botao>
        <Botao corpo className="flex-1" onClick={() => escolher(ESCOLHAS_DO_GOLPE_FINAL.letal.id)}>
          {ESCOLHAS_DO_GOLPE_FINAL.letal.rotulo} <span style={{ opacity: 0.75 }}>— não se levanta mais</span>
        </Botao>
      </div>

      {/* A forma discreta de não ser perguntado de novo: marcar antes de
          escolher grava a preferência junto com o clique — nunca um
          terceiro botão que decide sozinho. */}
      <div style={{ marginTop: 8 }}>
        <PilulaDeEscolha rotulo="Lembrar minha escolha" escolhida={lembrar} aoClicar={() => setLembrar((v) => !v)} />
      </div>
    </div>
  );
}
