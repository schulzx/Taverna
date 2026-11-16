/* ============================================================
   O PALCO DA CERIMÔNIA (V9 · 16/11/2026) — formas.md §F6, FILA_DE_CERIMONIAS.

   A lei «nunca atrás da página», em código: toda cerimônia que para a mesa
   sobe por aqui. O palco é um portal no <body>, IRMÃO do #root, numa camada
   acima de tudo o que a mesa tem (FILA_DE_CERIMONIAS.camada); enquanto ele
   está montado, o #root fica `inert` e `aria-hidden` — o foco não sai da
   cerimônia, e nenhum clique cai num botão que a pessoa não vê. Quando o
   palco desmonta, o #root volta inteiro (também se a cerimônia estourar: o
   efeito limpa na saída).

   E o teto (useTetoDaCerimonia): as cerimônias corriam até o animationend,
   e só ele as tirava do primeiro quadro. Sem animação a correr (aba oculta,
   painel em segundo plano) elas nunca acabavam — um véu invisível de tela
   cheia que comia todo clique: o «Partir» morto da prova de 15/11. Agora o
   relógio do teto da tabela (CERIMONIAS) leva sempre ao último quadro, e a
   página que nasce oculta já abre no último quadro.
   ============================================================ */
import React from "react";
import { createPortal } from "react-dom";
import { FILA_DE_CERIMONIAS, VEU_DA_CERIMONIA, tetoDe } from "./fila-de-cerimonias.js";
import { PE_DA_SUBIDA } from "./estilo.js";

/* quantos palcos estão de pé: o #root só volta quando o último desce */
let palcosDePe = 0;

/* <PalcoDaCerimonia> — o filho é a cerimônia (o diálogo dela) */
export function PalcoDaCerimonia({ children }) {
  React.useEffect(() => {
    let raiz = null;
    try {
      raiz = typeof document !== "undefined" ? document.getElementById("root") : null;
      palcosDePe += 1;
      if (raiz) {
        raiz.setAttribute("inert", ""); raiz.setAttribute("aria-hidden", "true");
        /* a armadilha 1 do F6: sob o véu o pergaminho ainda se lia e brigava com
           o palco — a mesa inteira cai a 30 % (10 % no telefone) por baixo */
        const telefone = typeof window !== "undefined" && window.innerWidth < PE_DA_SUBIDA.telefone;
        raiz.style.opacity = String(telefone ? VEU_DA_CERIMONIA.paginaPorBaixoNoTelefone : VEU_DA_CERIMONIA.paginaPorBaixo);
      }
    } catch (e) { raiz = null; }
    return () => {
      try {
        palcosDePe = Math.max(0, palcosDePe - 1);
        if (raiz && !palcosDePe) { raiz.removeAttribute("inert"); raiz.removeAttribute("aria-hidden"); raiz.style.opacity = ""; }
      } catch (e) { /* segue */ }
    };
  }, []);
  const palco = <div data-palco-da-cerimonia="" style={{ position: "fixed", inset: 0, zIndex: FILA_DE_CERIMONIAS.camada }}>{children}</div>;
  return typeof document !== "undefined" && document.body ? createPortal(palco, document.body) : palco;
}

/* a página está oculta? (então não há animação a correr: abre no último quadro) */
export function paginaOculta() {
  try { return typeof document !== "undefined" && document.visibilityState === "hidden"; } catch (e) { return false; }
}

/* o teto: enquanto `correndo`, um relógio do teto da tabela chama `acabar`
   (o mesmo que o animationend chamaria). Nunca lança. */
/* `tipo`: a chave da tabela, ou o teto já em ms (o espólio mede o seu cronograma) */
export function useTetoDaCerimonia(tipo, correndo, acabar) {
  React.useEffect(() => {
    if (!correndo) return undefined;
    let id = null;
    try { id = setTimeout(() => { try { acabar(); } catch (e) { /* segue */ } }, (typeof tipo === "number" ? tipo : tetoDe({ tipo })) + FILA_DE_CERIMONIAS.pousa); } catch (e) { id = null; }
    return () => { try { if (id) clearTimeout(id); } catch (e) { /* segue */ } };
  }, [tipo, correndo, acabar]);
}
