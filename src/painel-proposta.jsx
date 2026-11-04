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
     onAbrir onFechar onConfirmar(minutos?) onReescrever impedida={bool}
     rotuloDoTempo={(min) => "1 h"} />
     · proposta.tom «semVolta» (a luta): o contorno, o glifo e o preço em
       `T.danger`; proposta.impedido: o botão calado (a razão já vai nas
       linhas); proposta.opcoes: um botão por escolha, com os minutos
   ============================================================ */
import { T, ALVOS, TIPOS } from "./estilo.js";
import { Botao, IconeAlfinete, IconeMapa, IconeAmpulheta, IconeBolsa, IconeChevronEsq, IconeEspada, IconeFaiscas } from "./ui.jsx";

/* o glifo do efeito (a tabela é do motor: A_PROPOSTA_DA_FRASE.glifo) */
const GLIFOS = {
  alfinete: (c) => <IconeAlfinete tamanho={16} cor={c} />,
  mapa: (c) => <IconeMapa tamanho={16} cor={c} />,
  ampulheta: (c) => <IconeAmpulheta tamanho={16} cor={c} />,
  bolsa: (c) => <IconeBolsa tamanho={16} cor={c} />,
  espada: (c) => <IconeEspada tamanho={16} cor={c} />,
  faiscas: (c) => <IconeFaiscas tamanho={16} cor={c} />,
  /* O MESTRE PEDE O DADO (04/11): o d20, na forma da bandeja */
  dado: (c) => (
    <svg width={20} height={20} viewBox="0 0 48 48" aria-hidden="true">
      <polygon points="24,1 45,12.5 45,35.5 24,47 3,35.5 3,12.5" fill={c} />
      <polygon points="24,9 38,34 10,34" fill="none" stroke={T.onAccent} strokeOpacity=".45" strokeWidth="2.5" />
    </svg>
  ),
};

export function PropostaDaFrase({ proposta, preco = "", aberta = false, onAbrir, onFechar, onConfirmar, onReescrever, impedida = false, rotuloDoTempo = (m) => `${m} min` }) {
  if (!proposta || !proposta.verbo) return null;
  const glifo = GLIFOS[proposta.glifo] || GLIFOS.alfinete;
  /* A 2.ª LEVA: a luta é sem volta (a cor do perigo, a da `Oferta` semVolta);
     o que o motor impede (a bolsa, o PM) cala o botão e diz porquê; a espera
     sem quanto dá as escolhas, um botão cada */
  const semVolta = proposta.tom === "semVolta";
  /* O MESTRE PEDE O DADO: o cartão chega já aberto (é o Mestre a dizer
     «rola»), na cor da decisão e do dado, e sem a frase entre aspas — a
     frase não é do jogador. O recuo é «Agora não», e não «Reescrever». */
  const pedido = !!proposta.pedido;
  const cor = semVolta ? T.danger : pedido ? T.amber : T.mundo;
  const corSoft = semVolta ? T.danger : pedido ? T.amberSoft : T.mundoSoft;
  const abertaDeFacto = aberta || pedido;
  const recuo = proposta.recuo || "Reescrever";
  const impedido = String(proposta.impedido || "");
  const bloqueia = impedida || !!impedido;
  const opcoes = Array.isArray(proposta.opcoes) && proposta.opcoes.length ? proposta.opcoes : null;
  const linhas = Array.isArray(proposta.linhas) ? proposta.linhas.filter(Boolean) : [];
  const alternar = () => { if (aberta) { if (onFechar) onFechar(); } else if (onAbrir) onAbrir(); };
  return (
    <div className="tv-chamado-entra" role="group" aria-label={proposta.verbo}
      style={{ width: "100%", background: T.panel, border: `1px solid ${cor}`, borderRadius: 12, overflow: "hidden" }}>
      <button type="button" onClick={pedido ? undefined : alternar} aria-expanded={abertaDeFacto}
        className="tv-anel-foco w-full flex items-center gap-3 text-left"
        style={{ minHeight: ALVOS.piso, padding: "6px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
        <span aria-hidden="true" style={{ display: "inline-flex", flexShrink: 0 }}>{glifo(corSoft)}</span>
        <span className="flex-1" style={{ minWidth: 0 }}>
          <span className="tv-body block" style={{ color: T.ink, fontSize: TIPOS.corpo, lineHeight: 1.25 }}>{proposta.verbo}</span>
          <span className="tv-mono block truncate" style={{ color: T.inkMeio, fontSize: TIPOS.rotulo }}>{pedido ? (linhas[0] || "") : `«${proposta.frase}»`}</span>
        </span>
        {preco ? <span className="tv-mono" style={{ color: corSoft, fontSize: TIPOS.rotulo, flexShrink: 0 }}>{preco}</span> : null}
        {pedido ? null : (
          <span aria-hidden="true" style={{ display: "inline-flex", flexShrink: 0, transform: `rotate(${aberta ? 90 : -90}deg)`, transition: "transform 120ms ease" }}>
            <IconeChevronEsq tamanho={14} cor={T.inkMeio} />
          </span>
        )}
      </button>
      {abertaDeFacto ? (
        <div style={{ padding: "0 12px 12px" }}>
          {linhas.length && !pedido ? (
            <ul className="tv-mono" style={{ listStyle: "none", margin: "2px 0 10px", padding: 0, color: T.ink, fontSize: TIPOS.rotulo, lineHeight: 1.5 }}>
              {linhas.map((l, i) => (
                <li key={i} style={{ display: "flex", gap: 8 }}>
                  <span aria-hidden="true" style={{ color: corSoft }}>·</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2 flex-wrap">
            <Botao corpo className="flex-1" onClick={onReescrever}>{recuo}</Botao>
            {opcoes ? opcoes.map((m) => (
              <Botao key={m} corpo primario className="flex-1" desativado={bloqueia} onClick={bloqueia ? undefined : () => onConfirmar && onConfirmar(m)}>
                {rotuloDoTempo(m)}
              </Botao>
            )) : (
              <Botao corpo primario className="flex-1" desativado={bloqueia} onClick={bloqueia ? undefined : () => onConfirmar && onConfirmar()}>
                {proposta.confirmar}{preco ? ` · ${preco}` : ""}
              </Botao>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
