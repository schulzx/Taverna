/* ============================================================
   A MEMÓRIA DO GESTO (v9.208) — o mundo lembra como te trataram

   As posturas criam a cena; a memória do gesto cria a HISTÓRIA. Quem te
   tratou como, em qual postura, fica no registro — e quando a maré vira,
   o sistema cobra e paga. O taverneiro que deixou pão na tua porta na
   Crise recebe um saco de ouro no Ápice: narrado porque o registro SABE,
   não porque a IA inventou gratidão. É o sistema Nemesis apontado para os
   dois lados — o mundo lembra de você, e você ganha meios de lembrar dele.

   ---------------- A LEI ----------------

   O gesto só registra FATO ocorrido em cena (quem ficou, quem cobrou),
   nunca intenção presumida. E a cobrança CITA a linha original — o dia e
   a postura em que aconteceu —, para o Narrador ligar os pontos com
   verdade, e não com invenção.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova. O módulo guarda o razão dos gestos e diz quais pagam
   quando a postura vira; o App registra os gestos que os fatos garantem
   e leva a cobrança à pauta.
   ============================================================ */

/* ---------------- OS OITO GESTOS ----------------
   `registraEm`: as posturas em que o gesto acontece. `pagaEm`: as
   posturas para as quais a virada aciona o pagamento. `sinal`: +1 o
   mundo te deve, -1 você tem conta a acertar. `comoPaga`: o que o
   Narrador encena quando a maré vira. */
const G = (id, nome, sinal, registraEm, pagaEm, comoPaga) => ({ id, nome, sinal, registraEm, pagaEm, comoPaga });

export const GESTOS = [
  G("ajudou_escondido", "ajudou escondido", +1, ["crise", "escassez"], ["apice", "festa", "bonanca"],
    "no bom tempo, o herói pode pagar em público quem o socorreu no escuro — o vínculo nasce pronto, e a cidade vê"),
  G("ficou", "calou e ficou", +1, ["luto"], ["apice", "festa", "bonanca"],
    "quem velou ao lado do herói no luto tem o vínculo firmado sem uma palavra — presença registrada vale mais que fala"),
  G("cobrou_errado", "cobrou na hora errada", -1, ["crise", "escassez"], ["apice", "festa"],
    "o credor que apertou o herói caído reaparece sorrindo — e todos lembram como ele sorria antes"),
  G("bajulou", "bajulou no auge", -1, ["apice", "festa"], ["crise", "suspeita"],
    "o bajulador do auge é o primeiro a sumir quando a maré vira — e a índole dele fica exposta"),
  G("pediu_recebeu", "pediu e recebeu", -1, ["apice", "festa"], ["crise", "escassez"],
    "quem pediu e ganhou no auge vira devedor registrado: o mundo cobra por você um dia"),
  G("delatou", "delatou", -1, ["sombra", "cacada"], ["festa", "apice"],
    "quando a ameaça cai, a delação vem à luz — o delator tem contas a acertar com a cidade"),
  G("escondeu_voce", "escondeu você", +1, ["cacada"], ["festa", "apice", "bonanca"],
    "quem abrigou o herói na caçada foi marcado junto — protegê-lo de volta vira missão que nasce sozinha"),
  G("especulou", "especulou na falta", -1, ["escassez", "vespera"], ["bonanca", "festa"],
    "na fartura, o povo lembra do preço do sal — e o mercado do especulador esvazia"),
];
export const gestoPorId = (id) => GESTOS.find((g) => g.id === id) || null;

/* ---------------- O RAZÃO ---------------- */
export function garantirGestos(l) {
  const o = Array.isArray(l) ? l : (l && Array.isArray(l.linhas) ? l.linhas : []);
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  return o
    .map((x) => (x && gestoPorId(x.gesto) ? {
      quem: typeof x.quem === "string" ? x.quem : "",
      gesto: x.gesto,
      postura: typeof x.postura === "string" ? x.postura : "",
      dia: Math.max(0, n(x.dia, 0)),
      pago: !!x.pago,
    } : null))
    .filter(Boolean)
    .slice(-24);
}

/* ---------------- REGISTRAR ----------------
   Um fato ocorrido: fulano fez tal gesto nesta postura, neste dia. Não
   duplica o mesmo quem+gesto ainda em aberto — um socorro é um socorro,
   não vira dez por ficar dez turnos na Crise. */
export function registrarGesto(ledger, { quem, gesto, postura, dia = 0 } = {}) {
  const L = garantirGestos(ledger);
  const g = gestoPorId(gesto);
  if (!g || !quem) return L;
  /* o gesto só é válido se a postura em que ocorreu é uma das dele */
  if (!g.registraEm.includes(postura)) return L;
  if (L.some((x) => x.quem === quem && x.gesto === gesto && !x.pago)) return L;
  return [...L, { quem, gesto, postura, dia, pago: false }].slice(-24);
}

/* ---------------- COBRAR NA VIRADA ----------------
   A postura virou de `de` para `para`. Todo gesto em aberto cujo `pagaEm`
   inclui a postura nova é cobrado agora — devolve os pagamentos (com o
   quem, o sinal e a citação do dia/postura original) e marca-os pagos. */
export function cobrarNaVirada(ledger, { para = "", dia = 0 } = {}) {
  const L = garantirGestos(ledger);
  const pagamentos = [];
  const novo = L.map((x) => {
    if (x.pago) return x;
    const g = gestoPorId(x.gesto);
    if (!g || !g.pagaEm.includes(para)) return x;
    pagamentos.push({
      quem: x.quem, gesto: x.gesto, sinal: g.sinal, nome: g.nome,
      comoPaga: g.comoPaga, desdeDia: x.dia, desdePostura: x.postura,
    });
    return { ...x, pago: true };
  });
  return { ledger: pagamentos.length ? novo : L, pagamentos };
}

/* ---------------- O QUE VAI À PAUTA ----------------
   A cobrança, como material para o Narrador encenar — sempre citando de
   quando vem, para o pagamento ser memória e não invenção. Uma linha por
   pagamento, as mais fortes primeiro (o que o mundo deve, e o que cobra). */
export function envelopeDaMemoria(pagamentos) {
  const ps = (Array.isArray(pagamentos) ? pagamentos : []).filter((p) => p && p.quem);
  if (!ps.length) return "";
  const linhas = ps.slice(0, 3).map((p) => {
    const desde = p.desdePostura ? ` (desde ${p.desdePostura}, dia ${p.desdeDia})` : "";
    return `· ${p.quem}: ${p.comoPaga}${desde}`;
  });
  return "A MEMÓRIA DO MUNDO (o que aconteceu ANTES, e agora se acerta — encene como consequência, nunca como novidade):\n" + linhas.join("\n");
}

/* ---------------- PARA O CONSOLE DE AUTOR ---------------- */
export function resumoDosGestos(ledger) {
  const L = garantirGestos(ledger);
  return { total: L.length, abertos: L.filter((x) => !x.pago).length, pagos: L.filter((x) => x.pago).length };
}
