/* ============================================================
   A PROPOSTA DA FRASE (04/11/2026) — src/painel-proposta.jsx

   A forma do que a pessoa pediu: «aparece um card "ir até o mercado…", e
   quando se aperta nele, daí aparece as informações necessárias e o botão
   "ir"… sem encher a tela de botões».

   DUAS ALTURAS, UMA PEÇA, NO PÉ DA PÁGINA (onde vive a soleira, e no lugar
   dela — as duas disputam a mesma decisão do turno, como o veredito do
   crime):
     · FECHADA — uma linha de toque (o piso da casa, ALVOS.piso): o glifo, o
       verbo, e por baixo a frase do jogador entre aspas, para ele ver que é
       a dele. O tempo ou a moeda à direita. Não age: abre.
     · ABERTA — as linhas do que o herói SABE (o motor só manda essas: a
       distância, quem a abertura disse que lá trabalha, o que a missão manda
       lá fazer), e os dois botões: «Reescrever» devolve a frase ao campo;
       o verbo de mesa («Ir», «Partir», «Dormir», «Comprar») confirma.
   A cor é a do convite (T.mundo), a mesma da `Oferta`: é o mundo a pôr
   uma porta na mesa, não um aviso. O sistema não se nomeia: não há
   «proposta», «confirmar» nem «ação reconhecida» em lado nenhum.

   Este arquivo SÓ MONTA A TELA. Quem decide é o motor
   (`src/motor/a-proposta-da-frase.js`); quem liga é o App, em `calou`.

   <PropostaDaFrase proposta={…} preco="5 min" aberta={bool}
     onAbrir onFechar onConfirmar onReescrever impedida={bool} />
   ============================================================ */
import { T, ALVOS, TIPOS } from "./estilo.js";
import { Botao, IconeAlfinete, IconeMapa, IconeAmpulheta, IconeBolsa, IconeChevronEsq } from "./ui.jsx";

/* o glifo do efeito (a tabela é do motor: A_PROPOSTA_DA_FRASE.glifo) */
const GLIFOS = {
  alfinete: () => <IconeAlfinete tamanho={16} cor={T.mundoSoft} />,
  mapa: () => <IconeMapa tamanho={16} cor={T.mundoSoft} />,
  ampulheta: () => <IconeAmpulheta tamanho={16} cor={T.mundoSoft} />,
  bolsa: () => <IconeBolsa tamanho={16} cor={T.mundoSoft} />,
};

export function PropostaDaFrase({ proposta, preco = "", aberta = false, onAbrir, onFechar, onConfirmar, onReescrever, impedida = false }) {
  if (!proposta || !proposta.verbo) return null;
  const glifo = GLIFOS[proposta.glifo] || GLIFOS.alfinete;
  const linhas = Array.isArray(proposta.linhas) ? proposta.linhas.filter(Boolean) : [];
  const alternar = () => { if (aberta) { if (onFechar) onFechar(); } else if (onAbrir) onAbrir(); };
  return (
    <div className="tv-chamado-entra" role="group" aria-label={proposta.verbo}
      style={{ width: "100%", background: T.panel, border: `1px solid ${T.mundo}`, borderRadius: 12, overflow: "hidden" }}>
      <button type="button" onClick={alternar} aria-expanded={aberta}
        className="tv-anel-foco w-full flex items-center gap-3 text-left"
        style={{ minHeight: ALVOS.piso, padding: "6px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
        <span aria-hidden="true" style={{ display: "inline-flex", flexShrink: 0 }}>{glifo()}</span>
        <span className="flex-1" style={{ minWidth: 0 }}>
          <span className="tv-body block" style={{ color: T.ink, fontSize: TIPOS.corpo, lineHeight: 1.25 }}>{proposta.verbo}</span>
          <span className="tv-mono block truncate" style={{ color: T.inkMeio, fontSize: TIPOS.rotulo }}>«{proposta.frase}»</span>
        </span>
        {preco ? <span className="tv-mono" style={{ color: T.mundoSoft, fontSize: TIPOS.rotulo, flexShrink: 0 }}>{preco}</span> : null}
        <span aria-hidden="true" style={{ display: "inline-flex", flexShrink: 0, transform: `rotate(${aberta ? 90 : -90}deg)`, transition: "transform 120ms ease" }}>
          <IconeChevronEsq tamanho={14} cor={T.inkMeio} />
        </span>
      </button>
      {aberta ? (
        <div style={{ padding: "0 12px 12px" }}>
          {linhas.length ? (
            <ul className="tv-mono" style={{ listStyle: "none", margin: "2px 0 10px", padding: 0, color: T.ink, fontSize: TIPOS.rotulo, lineHeight: 1.5 }}>
              {linhas.map((l, i) => (
                <li key={i} style={{ display: "flex", gap: 8 }}>
                  <span aria-hidden="true" style={{ color: T.mundoSoft }}>·</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2">
            <Botao corpo className="flex-1" onClick={onReescrever}>Reescrever</Botao>
            <Botao corpo primario className="flex-1" desativado={impedida} onClick={impedida ? undefined : onConfirmar}>
              {proposta.confirmar}{preco ? ` · ${preco}` : ""}
            </Botao>
          </div>
        </div>
      ) : null}
    </div>
  );
}
