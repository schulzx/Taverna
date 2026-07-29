/* ============================================================
   VÍNCULOS — Taverna
   Afinidade entre o herói e cada companheiro, 100% por código:
   sobe com feitos concretos (lutar juntos, acampar, presentear)
   e desce com falhas (deixar o companheiro cair). Ao cruzar um
   MARCO, o app concede o bônus (+2 PV máx) e avisa o Mestre para
   criar o MOMENTO na ficção — a IA narra, o código decide.
   ============================================================ */

export const VINCULO_INICIAL = 10;
export const VINCULO_MAX = 100;

export const MARCOS_VINCULO = [
  { valor: 25, nome: "Confiança", icone: "🤝" },
  { valor: 50, nome: "Amizade", icone: "🍻" },
  { valor: 75, nome: "Lealdade", icone: "🛡" },
  { valor: 100, nome: "Vínculo Profundo", icone: "💞" },
];

/* O maior marco já alcançado por esse valor de vínculo (ou null). */
export function marcoDe(vinculo) {
  let m = null;
  for (const x of MARCOS_VINCULO) if ((vinculo || 0) >= x.valor) m = x;
  return m;
}

export function proximoMarco(vinculo) {
  return MARCOS_VINCULO.find((x) => (vinculo || 0) < x.valor) || null;
}

/* Aplica pontos de vínculo (podem ser negativos). Retorna:
   { membro, marcoNovo } — marcoNovo é o marco recém-cruzado (ou null).
   Cada marco cruzado concede +2 PV máx (e cura 2): coração forte. */
export function ganharVinculo(membro, pontos) {
  const antes = membro.vinculo ?? VINCULO_INICIAL;
  const depois = Math.max(0, Math.min(VINCULO_MAX, antes + pontos));
  const marcos = Array.isArray(membro.marcos) ? membro.marcos : [];
  let marcoNovo = null;
  let vidaMax = membro.vidaMax, vida = membro.vida;
  for (const m of MARCOS_VINCULO) {
    if (depois >= m.valor && !marcos.includes(m.valor)) {
      marcoNovo = m;
      marcos.push(m.valor);
      vidaMax = (vidaMax || 10) + 2;
      vida = Math.min(vidaMax, (vida || 0) + 2);
    }
  }
  return { membro: { ...membro, vinculo: depois, marcos, vidaMax, vida }, marcoNovo };
}
