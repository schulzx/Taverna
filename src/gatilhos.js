/* ============================================================
   O QUE ACABA POR GATILHO (v9.45)

   O relato: "ativei invisibilidade no meio do combate, entretanto
   fui atacado, e quando ataquei, o sistema considerou que continuei
   invisível".

   A descrição da habilidade diz, com todas as letras, "Fica invisível
   ATÉ ATACAR OU CONJURAR" — e o "até" nunca existiu em código. Todo
   efeito deste jogo terminava de um jeito só: contando turnos. Um
   efeito que acaba por ACONTECIMENTO não tinha onde ser expresso, e
   por isso a metade mais importante da magia mais famosa do gênero
   ficou de fora.

   Aqui existe o "até". Um efeito declara — ou tem inferido do próprio
   texto — os GATILHOS que o encerram: atacar, conjurar, apanhar,
   mover-se. Quando o gatilho acontece, o sistema tira o efeito, avisa
   o jogador e conta ao Mestre. O Mestre não decide nada: ele nunca
   soube que a invisibilidade tinha caído, e é por isso que continuava
   narrando um herói invisível.

   A INFERÊNCIA POR TEXTO é deliberada e é a mesma escolha de
   aflicoes.js: as habilidades são centenas, escritas em português, e
   marcar uma a uma na mão significaria esquecer as próximas. O texto
   é a fonte da verdade porque é o que o jogador lê — se a descrição
   promete, o gatilho existe.

   E ENQUANTO DURA, VALE. Não bastava fazer a invisibilidade acabar:
   ela precisava servir para alguma coisa antes. Quem está invisível
   ataca com vantagem e é atacado com desvantagem — as duas metades
   nascem juntas, senão a correção seria só uma perda.
   ============================================================ */

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const GATILHOS = {
  atacar: { id: "atacar", rotulo: "atacar", conta: "você atacou" },
  conjurar: { id: "conjurar", rotulo: "conjurar", conta: "você conjurou" },
  dano: { id: "dano", rotulo: "sofrer dano", conta: "você apanhou" },
  mover: { id: "mover", rotulo: "se mover", conta: "você saiu do lugar" },
};

/* O texto que promete o fim. "até atacar ou conjurar", "some ao sofrer
   dano", "enquanto não se mover" — três formas do mesmo contrato. */
const REGRAS = [
  { g: "atacar", re: /(ate|até)\s+(atacar|agredir|golpear|ferir)|ao\s+atacar|se\s+(voce\s+)?atacar|quebra\s+(ao|se)\s+atacar|atacar\s+(quebra|desfaz|encerra|termina)/ },
  { g: "conjurar", re: /(ate|até)\s+.{0,14}conjur|ao\s+conjurar|se\s+(voce\s+)?conjurar|conjurar\s+(quebra|desfaz|encerra|termina)/ },
  { g: "dano", re: /(ao|se)\s+(sofrer|receber|levar)\s+(dano|golpe)|(ate|até)\s+.{0,14}(sofrer|apanhar|ser\s+atingid)|quebra\s+(ao|se)\s+(sofrer|apanhar)|primeiro\s+golpe\s+(que\s+)?(sofr|receb)/ },
  { g: "mover", re: /(enquanto|desde\s+que)\s+n[ãa]o\s+(se\s+)?mov|(ate|até)\s+(se\s+)?mover|ao\s+(se\s+)?mover/ },
];

/* Invisibilidade é o caso-limite: o nome sozinho já implica o contrato,
   mesmo quando a descrição não o escreve. A EXCEÇÃO é explícita — a
   Invisibilidade Maior diz "continua sumido mesmo atacando", e essa
   frase tem de vencer o padrão. */
const RX_INVISIVEL = /(invisib|invisiv|sumido|imperceptivel|desaparec)/;
const RX_MESMO_ATACANDO = /(mesmo\s+atacando|mesmo\s+se\s+atacar|continua\s+sumido|nao\s+quebra|maior)/;

/* Os gatilhos de UM efeito (ou condição). `quebraCom` explícito manda;
   sem ele, o texto decide. */
export function gatilhosDe(ef) {
  if (!ef) return [];
  if (Array.isArray(ef.quebraCom)) return ef.quebraCom.filter((g) => GATILHOS[g]);
  const txt = NORM(`${ef.nome || ""} ${ef.descricao || ""} ${ef.efeito || ""}`);
  if (!txt.trim()) return [];
  const out = new Set();
  for (const r of REGRAS) if (r.re.test(txt)) out.add(r.g);
  if (RX_INVISIVEL.test(txt) && !RX_MESMO_ATACANDO.test(txt)) { out.add("atacar"); out.add("conjurar"); }
  return [...out];
}

export function quebraCom(ef, gatilho) {
  return gatilhosDe(ef).includes(gatilho);
}

/* ---------------- O QUE SEGURA EM PÉ ----------------
   Mesma família, outro contrato. "Ao cair a 0 PV, continua de pé por 1
   turno" (Guerreiro · Indomável) e "Não pode cair abaixo de 1 PV por 2
   turnos" (Monge · Corpo Imortal) prometem a mesma coisa que a Fúria
   Persistente do Meio-orc — e, como ela até a v9.43, não tinham código.
   Fica aqui porque é o mesmo tipo de regra: escrita na descrição, e
   impossível de cobrar contando turnos. */
const RX_SEGURA = /(0|zero)\s*pv.{0,40}(continua|de\s*p[ée]|nao\s+cai|n[ãa]o\s+cai)|nao\s+pode\s+cair\s+abaixo\s+de\s+1\s*pv|n[ãa]o\s+pode\s+cair\s+abaixo\s+de\s+1\s*pv/;

/* A habilidade da ficha que promete isso, se houver — e só uma vez por
   luta, marcada em `pers.seguraGasto`, senão o herói seria imortal. */
export function seguraEmPe(pers) {
  if (!pers || pers.seguraGasto) return null;
  for (const h of (pers.efeitos || [])) {
    if (RX_SEGURA.test(NORM(`${h.nome || ""} ${h.descricao || ""}`))) return h.nome || "efeito";
  }
  for (const h of (pers.habilidades || [])) {
    const nome = typeof h === "string" ? h : h.nome;
    const desc = typeof h === "string" ? "" : h.descricao;
    if (RX_SEGURA.test(NORM(`${nome || ""} ${desc || ""}`))) return nome || "habilidade";
  }
  return null;
}
export function gastarSegura(pers) { return { ...pers, seguraGasto: true }; }
export function devolverSegura(pers) { const p = { ...pers }; delete p.seguraGasto; return p; }

/* ---------------- O QUE VALE ENQUANTO DURA ----------------
   Só a invisibilidade, por enquanto, porque é a única cujo efeito
   mecânico não cabe em "+N em alguma coisa". */
export function estaInvisivel(pers) {
  const tudo = [...((pers && pers.efeitos) || []), ...((pers && pers.condicoes) || [])];
  return tudo.some((e) => RX_INVISIVEL.test(NORM(`${e.nome || ""} ${e.descricao || ""}`)));
}

/* ---------------- O GATILHO ACONTECEU ----------------
   Devolve a ficha sem o que caiu, os nomes do que caiu e as linhas que
   o jogador lê. Pura: quem chama decide o que fazer com o resultado. */
export function romperPorGatilho(pers, gatilho) {
  if (!pers || !GATILHOS[gatilho]) return { pers, rompidos: [], linhas: [], nota: "" };
  const efeitos = (pers.efeitos || []);
  const condicoes = (pers.condicoes || []);
  const caemEf = efeitos.filter((e) => quebraCom(e, gatilho));
  const caemCond = condicoes.filter((c) => quebraCom(c, gatilho));
  if (!caemEf.length && !caemCond.length) return { pers, rompidos: [], linhas: [], nota: "" };

  const nomes = [...caemEf, ...caemCond].map((e) => e.nome || e.rotulo || "efeito");
  const novo = {
    ...pers,
    efeitos: efeitos.filter((e) => !caemEf.includes(e)),
    condicoes: condicoes.filter((c) => !caemCond.includes(c)),
  };
  const g = GATILHOS[gatilho];
  return {
    pers: novo,
    rompidos: nomes,
    linhas: [`✧ ${nomes.join(" e ")} ${nomes.length > 1 ? "caem" : "cai"} — ${g.conta}.`],
    nota: `[EFEITO ENCERRADO PELO SISTEMA] ${nomes.join(" e ")} ${nomes.length > 1 ? "acabaram" : "acabou"} agora, porque ${g.conta}. É o que a própria habilidade prometia. A partir deste instante o mundo me VÊ e me alcança normalmente — não narre nada como se eu ainda estivesse escondido, e não devolva o efeito por conta própria.`,
  };
}

export const GATILHOS_PROMPT = `EFEITOS QUE ACABAM POR ACONTECIMENTO (v9.45):
- Nem todo efeito acaba no relógio. Invisibilidade acaba quando o herói ATACA ou CONJURA; certos escudos acabam no primeiro golpe sofrido; certas posturas acabam quando ele sai do lugar. O sistema conhece esses contratos e os cobra sozinho.
- Quando o sistema avisar que um efeito CAIU, ele caiu de verdade: narre a consequência imediata (o contorno que reaparece no meio do gesto, o escudo que estala e some) e trate o herói como visível e alcançável a partir dali. Nunca devolva o efeito, nunca "esqueça" que ele caiu e nunca deixe um inimigo continuar sem enxergar quem já reapareceu.
- Enquanto a invisibilidade dura, ela vale: o herói ataca com vantagem, é atacado com desvantagem, e quem não tem como percebê-lo simplesmente não o acha. Isso é do sistema — você não concede nem retira.`;
