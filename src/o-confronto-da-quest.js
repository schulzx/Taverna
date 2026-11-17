/* ============================================================
   O CONFRONTO DA QUEST — a besta em cena, pelo cartão do encontro
   (S7, 17/11/2026) — src/o-confronto-da-quest.js

   A sessão de 15/11 fechou «O Que Desce ao Anoitecer» sem a besta
   aparecer (mente/lancamento/analise-jogo.md, P0-3). A regra do motor já
   diz que a etapa de confronto só fecha com ela em cena
   (O_CLIMAX_DA_QUEST, biblioteca-de-quests.js); este módulo é o lado que
   a põe lá:

     oConfrontoAqui(passos, onde, { mundo, aberto }) → estado | null
       Os passos ativos (osPassosDasQuests, a-quest-manda.js) dizem que
       etapa de confronto pede quem, e onde é o covil. Com o herói NO
       covil (noLugarDoPasso), nasce o encontro — o mesmo estado de
       encontro-na-estrada.js, com a tabela do confronto
       (ESCOLHAS_DO_CONFRONTO): espreitar, falar, capturar, lutar, recuar,
       cada uma com o veredito antes do clique. O herói chega primeiro (é
       ele quem procura), e todo dado falhado é luta: não há clímax sem
       risco. A ficha de quem se encontra sai do mundo (chefePorNome): o
       nível e a ameaça do servo, nunca um número inventado aqui.

     oLivroDoEncontro(livro, estado, { dia, turno }) → livro
       O encontro resolvido escreve «encontrado» no livro de factos, pelo id
       do papel — é o facto que a etapa de confronto exige. A captura
       escreve também a queda (rendido: o «poupou» da ficha). Recuar não
       escreve nada: quem recuou não esteve frente a frente.

   PURO E DETERMINÍSTICO. Nenhuma sorte aqui (o dado é do App, pela semente
   do turno); o `null` e o lixo dão null ou o livro de antes — nunca lançam.
   ============================================================ */
import { noLugarDoPasso } from "./a-quest-manda.js";
import { chefePorNome } from "./mundo-base.js";
import { QUEM_FALA, ESCOLHAS_DO_CONFRONTO } from "./encontro-na-estrada.js";
import { anotarTurno, RESOLVER_NOME } from "./livro-de-factos.js";

/* `ameacaSemFicha`: quem o mundo não acha pelo nome (um servo de uma
   campanha antiga) entra pela ameaça do meio dos tenentes (chefesDoMundo:
   competente, elite ou lendário). `naoEscreve`: os desfechos que não são
   encontro. `rendido`: os que são também uma queda sem sangue. */
export const O_CONFRONTO_DA_QUEST = Object.freeze({
  ameacaSemFicha: "competente",
  naoEscreve: Object.freeze(["recuou"]),
  rendido: Object.freeze(["capturou"]),
  porque: "a etapa de confronto só fecha com a besta em cena (O_CLIMAX_DA_QUEST); o encontro no covil é o que a põe lá",
});

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const limpo = (x) => String(x == null ? "" : x).trim();
const chaveDe = (c) => `${c.quest}|${c.etapa}|${c.papel}`;

export function oConfrontoAqui(passos, onde, opcoes) {
  try {
    const o = obj(opcoes) || {};
    const W = obj(o.mundo) || {};
    const recusados = new Set(arr(o.recusados).map(String));
    for (const p of arr(passos)) {
      const c = obj(p) && obj(p.confronto);
      if (!c || !limpo(c.quem) || !obj(c.covil)) continue;
      if (!noLugarDoPasso(c.covil, onde)) continue;
      const quest = { quest: limpo(p.quest), etapa: limpo(p.etapa), papel: limpo(c.papel) };
      if (recusados.has(chaveDe(quest))) continue;
      let ficha = null;
      try { ficha = c.nome ? chefePorNome(W.semente, W.mapa, W.genero, c.nome, W.lex) : null; } catch { ficha = null; }
      const ameaca = (ficha && ficha.ameaca) || O_CONFRONTO_DA_QUEST.ameacaSemFicha;
      const nivel = ficha && Number.isFinite(Number(ficha.nivel)) ? Number(ficha.nivel) : null;
      /* gente fala («Nome, o Título»); o bicho só se a espécie fala (QUEM_FALA) */
      const gente = limpo(c.nome).includes(",");
      const fala = gente || (!!ficha && QUEM_FALA.includes(ficha.especie));
      const nomeNaLuta = limpo(c.nome) || limpo(c.quem);
      return {
        versao: 1,
        tabela: "confronto",
        fase: "escolha",
        criatura: limpo(c.quem), ameaca, quantos: 1,
        inimigos: [{ nome: nomeNaLuta, ameaca, ...(nivel != null ? { nivel } : {}) }],
        nivelRef: nivel,
        perigo: null,
        importante: true, lendario: ameaca === "lendario", aEvitar: false, razao: null,
        fala, fugaAberta: true, naoInveste: "importante",
        clima: null, sinal: null, pedido: null,
        quemViu: "heroi",
        percepcao: null,
        escolha: null, teste: null, desfecho: null,
        quest: { ...quest, alvo: limpo(c.id), nome: nomeNaLuta, covil: limpo(c.covil.nome) },
      };
    }
    return null;
  } catch { return null; }
}

/* A FICHA DE QUEM SE ENCONTROU: quem a quest pôs à frente entra no registo
   da gente (o sítio, o dia, inimigo), pela porta de sempre — é assim que o
   papel dele ganha id e o «encontrado» e o «derrotou» passam a contar.
   Quem já lá está fica como está (null: nada a fazer). */
export function aFichaDoEncontrado(estado, npcs, opcoes) {
  try {
    const e = obj(estado);
    const q = e && obj(e.quest);
    const nome = q ? limpo(q.nome) : "";
    if (!nome || limpo(q.alvo) || e.fase !== "resolvido") return null;
    if (obj(npcs) && obj(npcs[nome])) return null;
    const o = obj(opcoes) || {};
    return { nome, conhecidoEm: Number.isFinite(Number(o.dia)) ? Number(o.dia) : 0, local: limpo(q.covil), relacao: "inimigo", status: "vivo", consultas: 0 };
  } catch { return null; }
}

/* a chave que o App guarda quando o herói recua: o mesmo confronto não
   volta a abrir enquanto ele não sair do covil */
export function aChaveDoConfronto(estado) {
  const q = obj(estado) && obj(estado.quest);
  return q ? chaveDe(q) : "";
}

export function oLivroDoEncontro(livro, estado, opcoes) {
  try {
    const e = obj(estado);
    const q = e && obj(e.quest);
    const d = e && obj(e.desfecho);
    if (!q || !d || e.fase !== "resolvido" || !ESCOLHAS_DO_CONFRONTO.escolhas[e.escolha]) return livro;
    if (O_CONFRONTO_DA_QUEST.naoEscreve.includes(d.id)) return livro;
    /* o servo que ainda não entrou no registo não tem id: escreve-se pelo id
       que o registo lhe vai dar (`npc|Nome`, RESOLVER_NOME) — o mesmo que o
       papel resolve quando a ficha dele entra (aFichaDoEncontrado) */
    const quem = limpo(q.alvo) || (limpo(q.nome) ? RESOLVER_NOME.prefixoDoRegisto + limpo(q.nome) : "");
    if (!quem) return livro;
    const o = obj(opcoes) || {};
    const ocorrido = { dia: o.dia, turno: o.turno, encontros: [{ quem, como: d.id }] };
    if (O_CONFRONTO_DA_QUEST.rendido.includes(d.id)) ocorrido.derrotados = [{ nome: quem, como: "rendido" }];
    return anotarTurno(livro, ocorrido).factos;
  } catch { return livro; }
}
