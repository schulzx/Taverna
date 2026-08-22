/* ============================================================
   A PAUTA DO TURNO (v9.104) — o Mestre passa os pontos

   "O mestre será tão completo e instruído que poderia até tocar a
   história sozinho, e o narrador virá com toda sua criatividade apenas
   ligando os pontos que o mestre passou e dizendo como aconteceu."

   Até aqui o Mestre falava em ENVELOPES SOLTOS, empilhados em `notaRef`
   na ordem em que cada sistema resolvia acordar. Funciona, está testado,
   e tem dois defeitos que só aparecem quando se olha de longe:

   1) NÃO ESCALA. Cada conselheiro novo empilha mais um envelope, e o
      turno vai ficando mais longo sem que ninguém decida que ele ficou.
      Não existe teto para o que o Mestre diz por turno — nunca existiu.

   2) NÃO TEM ORDEM. O Narrador recebe a forma da cena antes de saber
      onde ela acontece, e o veto depois de já ter lido a instrução que
      o veto contradiz. Ordem importa para quem lê.

   A Pauta é a mesma informação em uma peça só, ordenada, com orçamento
   e corte por prioridade — como o léxico já faz com o próprio bloco.

   ---------------- O QUE ELA NÃO É ----------------

   Ela NÃO é um lugar novo para o Mestre inventar coisas. Toda seção é
   preenchida por um sistema que já decidiu — a Pauta não decide nada.
   E ela não substitui os envelopes de uma vez: nasce com o Geógrafo
   dentro e cada sistema se muda para cá quando chegar a vez dele.
   Trocar dez envelopes de casa num dia só seria refazer o trabalho de
   dez sistemas ao mesmo tempo, sem nenhum deles provado no lugar novo.

   ---------------- A REGRA QUE PROTEGE O NARRADOR ----------------

   A Pauta diz O QUE e COM QUEM. Nunca o COMO. Nenhuma seção descreve
   cheiro, escolhe adjetivo ou escreve fala — se uma linha da Pauta pode
   ser copiada para a narração como está, ela está errada.
   ============================================================ */

/* `prio` é a ordem do CORTE, não a da leitura: quanto menor, mais tarde
   se corta. A ordem em que o Narrador lê é a ordem desta lista.

   As duas primeiras nunca caem, e por motivos diferentes. ONDE, porque
   uma cena sem lugar é uma cena que o Narrador vai inventar em outro
   lugar. NÃO PODE, porque cortar um veto é exatamente como a
   incoerência entra — e um veto cortado não avisa que foi cortado. */
export const SECOES = [
  { id: "onde", rotulo: "ONDE", prio: 1, o: "o lugar, e o que ele permite" },
  { id: "quem", rotulo: "QUEM", prio: 4, o: "quem está presente" },
  { id: "momento", rotulo: "MOMENTO", prio: 3, o: "a batida da história" },
  { id: "forma", rotulo: "FORMA", prio: 5, o: "o formato desta cena" },
  { id: "gente", rotulo: "A GENTE", prio: 6, o: "o que cada um faz" },
  { id: "aliado", rotulo: "O ALIADO", prio: 7, o: "quem anda comigo" },
  { id: "vilao", rotulo: "O VILÃO", prio: 6, o: "o que a ameaça fez" },
  { id: "antes", rotulo: "ANTES", prio: 8, o: "o que já aconteceu aqui" },
  { id: "acabou", rotulo: "ACABOU DE", prio: 3, o: "o que o sistema resolveu agora" },
  { id: "naoPode", rotulo: "NÃO PODE", prio: 2, o: "os vetos desta cena" },
];

export function secaoPorId(id) { return SECOES.find((s) => s.id === id) || null; }

/* ---------------- O ORÇAMENTO ----------------
   O número vem do mesmo lugar que o do léxico: a cena comum está em
   59.744 caracteres com o teto declarado em 62 mil, e o que o Mestre diz
   por turno tem de caber na folga sem competir com as regras.

   Mil e quatrocentos é o que dez seções bem escritas ocupam. O que não
   couber é cortado pela prioridade, e o corte é silencioso de propósito:
   avisar o Narrador de que alguma coisa foi cortada gastaria o espaço
   que faltou. */
export const TETO_DA_PAUTA = 1400;

export function garantirPauta(p) {
  const o = p && typeof p === "object" ? p : {};
  const out = {};
  for (const s of SECOES) {
    const v = o[s.id];
    const linhas = (Array.isArray(v) ? v : v ? [v] : [])
      .map((x) => String(x == null ? "" : x).replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter((x, i, a) => a.indexOf(x) === i);
    if (linhas.length) out[s.id] = linhas;
  }
  return out;
}

export function porNaPauta(pauta, id, ...linhas) {
  if (!secaoPorId(id)) return garantirPauta(pauta);
  const p = garantirPauta(pauta);
  const novas = linhas.flat().filter(Boolean);
  if (!novas.length) return p;
  return garantirPauta({ ...p, [id]: [...(p[id] || []), ...novas] });
}

export function pautaVazia(p) { return Object.keys(garantirPauta(p)).length === 0; }

/* ---------------- O TEXTO ----------------
   Monta na ordem de LEITURA e corta na ordem de PRIORIDADE. Uma seção
   com mais de uma linha perde as últimas antes de perder a primeira: a
   primeira linha de uma seção costuma ser a que a resume. */
export function textoDaPauta(p, { teto = TETO_DA_PAUTA, turno = 0 } = {}) {
  const pauta = garantirPauta(p);
  if (pautaVazia(pauta)) return "";
  const cabeca = `[PAUTA DO TURNO${turno ? ` ${turno}` : ""} — decidido pelo SISTEMA. Ligue os pontos e conte COMO aconteceu; o que está aqui é o QUE e o COM QUEM, e não se discute.]`;
  const pe = "";
  /* candidatas: uma entrada por LINHA, para o corte ser fino */
  const cand = [];
  for (const s of SECOES) {
    const linhas = pauta[s.id] || [];
    linhas.forEach((t, i) => cand.push({ secao: s.id, ordem: SECOES.indexOf(s), i, prio: s.prio + i * 0.1, texto: t }));
  }
  cand.sort((a, b) => a.prio - b.prio);
  let gasto = cabeca.length + pe.length;
  const dentro = new Set();
  for (const c of cand) {
    const custo = c.texto.length + 14;
    if (gasto + custo > teto) continue;
    dentro.add(c);
    gasto += custo;
  }
  const partes = [];
  for (const s of SECOES) {
    const linhas = cand.filter((c) => c.secao === s.id && dentro.has(c)).sort((a, b) => a.i - b.i).map((c) => c.texto);
    if (!linhas.length) continue;
    partes.push(`${s.rotulo.padEnd(9)} ${linhas.join("\n" + " ".repeat(10))}`);
  }
  if (!partes.length) return "";
  return `${cabeca}\n${partes.join("\n")}`;
}

/* Quanto a Pauta ocuparia inteira, sem corte. Existe para a sonda poder
   AFIRMAR que o orçamento morde em vez de eu acreditar que morde. */
export function tamanhoCruDaPauta(p) {
  const pauta = garantirPauta(p);
  return Object.values(pauta).flat().reduce((a, t) => a + t.length + 14, 0);
}

export const PAUTA_PROMPT = `A PAUTA DO TURNO (v9.105):
· Quando chegar um bloco [PAUTA DO TURNO], ele é o resumo do que o SISTEMA já decidiu para esta cena — lugar, gente, batida da história, forma, vetos. Cumpra tudo, na ordem que fizer sentido narrativamente.
· A Pauta diz O QUE acontece e COM QUEM. O COMO é seu, inteiro: a fala, o gesto, o cheiro, o ritmo, o que cada um esconde. Nenhuma linha dela deve aparecer copiada na narração.
· A linha NÃO PODE é veto: o que está ali não acontece nesta cena, por mais que a cena peça.`;
