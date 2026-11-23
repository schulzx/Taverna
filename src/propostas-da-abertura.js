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
  /* 17/11 (a abertura alcançável): o passo pede alguém AO LADO
     («Sair de Vega Zênite com Saoirse») e essa pessoa está nesta cidade — a
     porta é levá-la; a frase é a do convite (conviteNaFrase, indole.js), e o
     veredito é o da balança, que aceita quem a história manda levar */
  levar: Object.freeze({ verbo: "Levar {nome} junto", frase: "{nome}, vem comigo." }),
  /* 17/11 (os dois becos da quest): o sítio do passo é de OUTRA cidade (o
     «Anel de Carga» do Salvo-Conduto cai entre a origem e o destino) — «Ir
     até» um sítio que a planta daqui não tem repetia a cena sem mover o
     herói. A porta é partir: a frase que o mapa entende (detectarPartida),
     com o veredito da estrada antes do passo */
  partir: Object.freeze({ verbo: "Partir para {nome}", frase: "Parto para {nome}." }),
  /* 23/11 (a décima sétima sessão, o caminho alcançável): o passo pede
     revirar o lugar onde o herói já está (o quartel que é a própria cidade)
     — a porta é a busca, pela frase da ação «Vasculhar» (desafios.js) */
  vasculhar: Object.freeze({ verbo: "Vasculhar {nome}", frase: "Vasculho o lugar com atenção." }),
  /* os predicados de quem o rumo vai buscar à casa dela (os de
     A_PESSOA_DO_PASSO.daQuest que não são levar) */
  irTer: Object.freeze(["conversou", "consultou", "conheceu"]),
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

   oRumoDaBusca({ passos, aqui, cidade, grupo, emLuta, naEstrada, presentes })
   → { id, tipo, verbo, frase } | null   (`presentes`: [nome] em cena, opcional)

   17/11 (os dois becos da quest), a régua de cada porta, pela ordem:
     1. quem o passo pede AO LADO e ainda não anda com o herói (`grupo`):
        noutra cidade, partir; noutro sítio desta, ir até à casa dela; com o
        herói lá (ou sem casa dita), levá-la — o convite;
     2. o covil do confronto (quem guarda o passo: o encontro é lá), e só
        depois os outros lugares do passo (o desvio);
     3. quem o passo pede frente a frente, na casa dela;
   e em todas: o sítio de outra cidade é «Partir para <cidade>», nunca «Ir
   até» (o botão que mente); o sítio onde já se está, nada. */
/* 22/11 (a décima quinta sessão, QC1): a porta diz também o que mostra — o
   `nome` do destino, a `cidade` dele e a `acao` («ir», «partir», «levar») —
   para a ponte do passo (motor/a-ponte-do-passo.js) dizer ao Narrador
   EXATAMENTE o destino do botão. A tela só lê `verbo` e `frase`. */
const oDestino = (P, nome, cidade, e) => {
  const aqui = chave(e.aqui);
  const cid = txt(cidade);
  if (cid && txt(e.cidade) && chave(cid) !== chave(e.cidade) && cabe(cid)) return Object.freeze({ id: `rumo|partir|${chave(cid)}`, tipo: "rumo", verbo: encher(P.partir.verbo, cid), frase: encher(P.partir.frase, cid), acao: "partir", nome: cid, cidade: cid });
  if ((aqui && chave(nome) === aqui) || chave(nome) === chave(e.cidade)) return null;
  return Object.freeze({ id: `rumo|${chave(nome)}`, tipo: "rumo", verbo: encher(P.passo.verbo, nome), frase: encher(P.passo.frase, nome), acao: "ir", nome: txt(nome), cidade: cid || txt(e.cidade) });
};
export function oRumoDaBusca(entrada) {
  try {
    const e = obj(entrada) || {};
    if (e.emLuta || e.naEstrada) return null;
    const P = PROPOSTAS_DA_ABERTURA;
    const aqui = chave(e.aqui);
    const doGrupo = new Set(arr(e.grupo).map((g) => chave(obj(g) ? g.nome : g)).filter(Boolean));
    const pessoas = (p0) => arr(obj(obj(p0) && p0.candidatos) && p0.candidatos.pessoa).map(obj).filter((x) => x && cabe(txt(x.nome)) && !doGrupo.has(chave(x.nome)));
    /* 1. quem o passo pede ao lado */
    for (const p0 of arr(e.passos)) {
      const c = pessoas(p0).find((x) => x.predicado === "acompanha");
      if (!c) continue;
      const longe = txt(c.cidade) && txt(e.cidade) && chave(c.cidade) !== chave(e.cidade);
      if (longe || (txt(c.onde) && chave(c.onde) !== aqui)) { const r = oDestino(P, txt(c.onde) || txt(c.cidade), c.cidade, e); if (r) return r; }
      return Object.freeze({ id: `rumo|levar|${chave(c.nome)}`, tipo: "rumo", verbo: encher(P.levar.verbo, txt(c.nome)), frase: encher(P.levar.frase, txt(c.nome)), acao: "levar", nome: txt(c.nome), cidade: txt(e.cidade) });
    }
    /* 1b. 23/11 (a décima sétima sessão, §1): O CAMINHO ALCANÇÁVEL. O alvo
       direto do passo está escondido (o servo do vilão, que o herói ainda não
       viu) e o passo tem outro ramo (`caminho`, o-caminho-alcancavel.js): as
       portas são as desse ramo, pela ordem dele — quem consultar está aqui,
       fala-se; noutro sítio, vai-se à casa; o lugar a revirar é este (ou a
       cidade inteira), vasculha-se; é outro, vai-se até lá. O covil do
       escondido e o próprio escondido ficam para quando ele tiver rosto. */
    const presentes = new Set(arr(e.presentes).map((x) => chave(obj(x) ? x.nome : x)).filter(Boolean));
    for (const p0 of arr(e.passos)) {
      const cam = obj(obj(p0) && p0.caminho);
      for (const c of arr(cam && cam.passos).map(obj).filter(Boolean)) {
        const nome = txt(c.nome);
        if (!cabe(nome)) continue;
        if (c.tipo === "pessoa") {
          if (doGrupo.has(chave(nome))) continue;
          if (presentes.has(chave(nome))) return Object.freeze({ id: `rumo|falar|${chave(nome)}`, tipo: "rumo", verbo: encher(P.pessoa.verbo, nome), frase: encher(P.pessoa.frase, nome), acao: "falar", nome, cidade: txt(e.cidade) });
          if (cabe(txt(c.onde)) || (txt(c.cidade) && txt(e.cidade) && chave(c.cidade) !== chave(e.cidade))) {
            const r = oDestino(P, txt(c.onde) || txt(c.cidade), c.cidade, e);
            if (r) return r;
          }
          continue;
        }
        if (c.tipo === "lugar") {
          const cid = txt(c.cidade);
          const outra = cid && txt(e.cidade) && chave(cid) !== chave(e.cidade);
          const jaAqui = !outra && (chave(nome) === aqui || chave(nome) === chave(e.cidade) || c.id === `cidade|${chave(e.cidade)}`);
          if (jaAqui && c.predicado === "descobriu") {
            const onde = txt(e.aqui) && cabe(txt(e.aqui)) ? txt(e.aqui) : nome;
            return Object.freeze({ id: `rumo|vasculhar|${chave(onde)}`, tipo: "rumo", verbo: encher(P.vasculhar.verbo, onde), frase: P.vasculhar.frase, acao: "vasculhar", nome: onde, cidade: txt(e.cidade) });
          }
          const r = oDestino(P, nome, cid, e);
          if (r) return r;
        }
      }
    }
    /* 2. o covil, depois os lugares */
    for (const p0 of arr(e.passos)) {
      const p = obj(p0);
      if (!p) continue;
      const covil = obj(obj(p.confronto) && p.confronto.covil);
      const l = [...(covil ? [covil] : []), ...arr(p.lugares).map(obj).filter(Boolean)].find((x) => cabe(txt(x.nome)));
      if (!l) continue;
      /* 22/11: o lugar onde já se está não é porta — segue para as de baixo (a pessoa em cena) */
      const r = oDestino(P, txt(l.nome), l.cidade, e);
      if (r) return r;
    }
    /* 3. quem o passo pede frente a frente, na casa dela */
    for (const p0 of arr(e.passos)) {
      const c = pessoas(p0).find((x) => P.irTer.includes(x.predicado) && cabe(txt(x.onde)));
      if (!c) continue;
      const r = oDestino(P, txt(c.onde), c.cidade, e);
      if (r) return r;
    }
    /* 4. 22/11 (a décima sexta sessão do Mestre vivo, §1): QUEM O PASSO PEDE ESTÁ
       AQUI. «Tirar o livro das mãos de Thaddeus Crane», com o Thaddeus em cena
       desde a frase 13 e nenhum botão por 6 turnos: o «Ir até» some ao chegar, e
       a pessoa de que o passo depende (`quem`, a-quest-manda.js — o vilão só
       depois de visto) ficava sem porta. Com ela entre `presentes` (quem está em
       cena), a porta é falar com ela */
    for (const p0 of arr(e.passos)) {
      const q =arr(obj(p0) && p0.quem).map(obj).find((x) => x && cabe(txt(x.nome)) && !doGrupo.has(chave(x.nome)) && presentes.has(chave(x.nome)));
      if (q) return Object.freeze({ id: `rumo|falar|${chave(q.nome)}`, tipo: "rumo", verbo: encher(P.pessoa.verbo, txt(q.nome)), frase: encher(P.pessoa.frase, txt(q.nome)), acao: "falar", nome: txt(q.nome), cidade: txt(e.cidade) });
    }
    return null;
  } catch { return null; }
}
