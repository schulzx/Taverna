/* ============================================================
   AS PROPOSTAS DA ABERTURA (15/11/2026, S5 — os três primeiros minutos)

   A sessão de 15/11 abriu com a prosa da cidade e, por baixo, o campo vazio
   «O que você faz?» — nenhuma porta à vista. Quem abre o jogo pela primeira
   vez não sabe ainda o que se pode dizer a este Mestre, e o primeiro toque
   demorou o tempo de inventar uma frase. A régua do plano de lançamento: da
   abertura ao 1.º toque ≤ 10 s, sem escrever.

   A abertura termina, então, com TRÊS PROPOSTAS do sistema, tocáveis, nas
   peças que já existem (a Oferta da soleira):
     · o passo da quest — o lugar (ou a pessoa) que a etapa de agora pede;
     · uma pessoa em cena — alguém que está aqui e não é do grupo;
     · um risco à vista — a masmorra perto, de nome e fama; sem ela, olhar à
       volta.
   Cada uma é uma FRASE do jogador, e o toque manda-a pelo mesmo caminho do
   que se escreve (a proposta da frase, o chamado do Mestre, o turno): o
   sistema não ganha uma segunda porta, e o veredito antes do clique continua
   a ser o da frase. As propostas só valem enquanto o jogador não agiu.

   O sistema não fala de si: nada aqui diz «proposta», «quest», «passo» nem
   «sugestão» — só o verbo e o nome do mundo.

   PURO E DETERMINÍSTICO. `null` e lixo dão a lista vazia, nunca exceção.
   Provado em testes/teste-s5-tres-minutos.mjs. Ligado no App (a soleira).
   ============================================================ */

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "");
const chave = (s) => txt(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- A TABELA ----------------
   `ordem`: a ordem em que as três aparecem (a primeira é a da soleira).
   Cada tipo: `verbo` (o que a peça mostra) e `frase` (o que o toque manda,
   como se o jogador a tivesse escrito). `{nome}` é o nome do mundo.
   `semNome`: o risco quando não há masmorra perto — olhar à volta, que o
   catálogo julga como qualquer frase. `teto`: o nome mais comprido que cabe
   na linha da Oferta no telefone (o resto não entra: uma porta cortada é
   pior do que uma porta a menos). */
export const PROPOSTAS_DA_ABERTURA = Object.freeze({
  ordem: Object.freeze(["passo", "pessoa", "risco"]),
  passo: Object.freeze({ verbo: "Ir até {nome}", frase: "Vou até {nome}." }),
  passoPessoa: Object.freeze({ verbo: "Procurar {nome}", frase: "Procuro {nome}." }),
  pessoa: Object.freeze({ verbo: "Falar com {nome}", frase: "Falo com {nome}." }),
  /* S6b (15/11): «Perguntar por» era conversa, não risco. O risco à vista
     é ir lá — a ida mostra o veredito (a dificuldade, o preço) antes do
     passo, e lá dentro o dado decide. */
  risco: Object.freeze({ verbo: "Explorar {nome}", frase: "Vou até {nome}." }),
  semNome: Object.freeze({ verbo: "Olhar em volta", frase: "Olho em volta, com atenção." }),
  teto: 40,
});

const encher = (molde, nome) => molde.replace(/\{nome\}/g, nome);
const cabe = (n) => !!n && n.length <= PROPOSTAS_DA_ABERTURA.teto;

/* asPropostasDaAbertura(entrada) → [{ id, tipo, verbo, frase }] (≤ 3)
   `entrada` (tudo opcional):
     jogou    — o jogador já agiu? (sim: [] — a abertura acabou)
     passos   — os passos das quests (osPassosDasQuests, a-quest-manda.js)
     aqui     — o nome do sítio onde o herói está, e `cidade` — a cidade
                (o lugar onde já se está não é para onde ir)
     emCena   — [{ tipo, nome, comigo }] (as fichas do Em cena)
     grupo    — [nome] (quem anda com o herói não é «uma pessoa em cena»)
     riscos   — [nome] (as masmorras perto, de nome e fama)
   Nenhum nome repete entre as três. */
export function asPropostasDaAbertura(entrada) {
  try {
    const e = obj(entrada) || {};
    if (e.jogou) return [];
    const P = PROPOSTAS_DA_ABERTURA;
    const usados = new Set([chave(e.aqui), chave(e.cidade)].filter(Boolean));
    const doGrupo = new Set(arr(e.grupo).map(chave).filter(Boolean));
    const out = {};

    /* o passo: o lugar da etapa (onde ainda não se está), senão a pessoa */
    for (const p0 of arr(e.passos)) {
      const p = obj(p0);
      if (!p) continue;
      const lugar = arr(p.lugares).map(obj).filter(Boolean).map((l) => txt(l.nome)).find((n) => cabe(n) && !usados.has(chave(n)));
      if (lugar) { out.passo = { id: `abertura|passo|${chave(lugar)}`, tipo: "passo", verbo: encher(P.passo.verbo, lugar), frase: encher(P.passo.frase, lugar), nome: lugar }; break; }
      const pessoa = arr(obj(p.candidatos) && p.candidatos.pessoa).map(obj).filter(Boolean).map((c) => txt(c.nome)).find((n) => cabe(n) && !doGrupo.has(chave(n)));
      if (pessoa) { out.passo = { id: `abertura|passo|${chave(pessoa)}`, tipo: "passo", verbo: encher(P.passoPessoa.verbo, pessoa), frase: encher(P.passoPessoa.frase, pessoa), nome: pessoa }; break; }
    }
    if (out.passo) usados.add(chave(out.passo.nome));

    /* a pessoa em cena: quem está aqui e não anda com o herói */
    const gente = arr(e.emCena).map(obj).filter((x) => x && x.tipo === "pessoa" && !x.comigo).map((x) => txt(x.nome))
      .find((n) => cabe(n) && !doGrupo.has(chave(n)) && !usados.has(chave(n)));
    if (gente) { out.pessoa = { id: `abertura|pessoa|${chave(gente)}`, tipo: "pessoa", verbo: encher(P.pessoa.verbo, gente), frase: encher(P.pessoa.frase, gente), nome: gente }; usados.add(chave(gente)); }

    /* o risco: a masmorra perto; sem ela, olhar à volta */
    const risco = arr(e.riscos).map(txt).find((n) => cabe(n) && !usados.has(chave(n)));
    out.risco = risco
      ? { id: `abertura|risco|${chave(risco)}`, tipo: "risco", verbo: encher(P.risco.verbo, risco), frase: encher(P.risco.frase, risco), nome: risco }
      : { id: "abertura|risco|olhar", tipo: "risco", verbo: P.semNome.verbo, frase: P.semNome.frase, nome: "" };

    return P.ordem.filter((k) => out[k]).map((k) => Object.freeze({ id: out[k].id, tipo: out[k].tipo, verbo: out[k].verbo, frase: out[k].frase }));
  } catch { return []; }
}

/* ---------------- O RUMO DA BUSCA (S7c, 17/11) ----------------
   A sessão jogada de 17/11: depois da abertura, «Ir até Roda dos Punhos»
   nunca voltou ao pé da página — só o Livro e o Mapa diziam para onde ir, e
   o Narrador acabou a narrar a ida sem o sistema a fazer. Agora, enquanto o
   passo da busca ativa pede estar num lugar conhecido (os lugares do passo,
   ou o covil do confronto), o pé da página oferece UMA porta: «Ir até
   <lugar>», pela mesma frase da abertura — o toque passa pela proposta da
   frase, e é lá que o veredito (o tempo, o perigo) aparece antes do passo.
   Some ao chegar (o lugar onde já se está não é para onde ir), na luta e na
   estrada.

   oRumoDaBusca({ passos, aqui, cidade, emLuta, naEstrada }) → { id, tipo,
   verbo, frase } | null */
export function oRumoDaBusca(entrada) {
  try {
    const e = obj(entrada) || {};
    if (e.emLuta || e.naEstrada) return null;
    const P = PROPOSTAS_DA_ABERTURA;
    const aqui = chave(e.aqui);
    for (const p0 of arr(e.passos)) {
      const p = obj(p0);
      if (!p) continue;
      const covil = obj(obj(p.confronto) && p.confronto.covil);
      const nomes = [...arr(p.lugares).map(obj).filter(Boolean), ...(covil ? [covil] : [])].map((l) => txt(l.nome));
      const lugar = nomes.find((n) => cabe(n));
      if (!lugar) continue;
      if ((aqui && chave(lugar) === aqui) || (!aqui && chave(lugar) === chave(e.cidade))) return null;
      return Object.freeze({ id: `rumo|${chave(lugar)}`, tipo: "rumo", verbo: encher(P.passo.verbo, lugar), frase: encher(P.passo.frase, lugar) });
    }
    return null;
  } catch { return null; }
}
