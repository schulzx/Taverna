/* ============================================================
   O QUE A CENA REGISTA (o Narrador ator, a 14.ª sessão · 03/11/2026) — src/motor/registo-da-cena.js

   No modo `mestre`, o Cronista lia a narração e devolvia, entre treze
   coisas, quem apareceu (`pessoas`, que entra no registo, `npcs`) e com
   quem o herói falou frente a frente (`falou_com`, que cumpre a etapa
   «Encontrar X» das missões). No modo `ator` o Cronista não lê — nada
   entra pela boca do Narrador (mente/plano-narrador-ator.md, decisão 4) —,
   e a 14.ª sessão mediu o preço (mente/sessao-14.md, defeito 5): a Inez
   (três conversas e um pedido aceite) e a Beatriz Sem-Pão (um pedido
   aceite) nunca entraram em `npcs`; a missão principal «Encontrar Inez do
   Prado Baixo» ficou `feito:false` depois de o herói lhe falar três vezes;
   e o cordão que a Beatriz lhe deu na cena não entrou no inventário.

   QUE PARTE DISSO SE DECIDE SEM LER A PROSA. Quase toda, porque o sistema
   já a sabe ANTES de o ator falar:
     · quem está — a ficha do turno (`QUEM ESTÁ`: o grupo, o EM CENA, o
       núcleo, quem chega), que é o sistema a dizer quem está ali;
     · com quem o herói fala — a frase DELE (o nome que ela diz, ou a fala
       dirigida ao único que está), e o toque que ele deu (a resposta a um
       pedido): a ficha já o devolve em `conversa` (ficha-de-ator.js,
       A_CONVERSA_DA_FRASE);
     · o que lhe põem na mão — o pedido que ele ACEITOU (o toque «Aceitar»,
       `aceite`: { de, objeto, pede }), quando o pedido é levar uma coisa
       (O_QUE_O_PEDIDO_ENTREGA).
   O que fica de fora é o que só a prosa diria — o figurante que o ator pôs
   a passar, o objeto que ele inventou —, e isso é exatamente o que o plano
   quer de fora: o que o ator improvisa nunca vira estado.

   A SAÍDA TEM A FORMA DO ACEITO DO CRONISTA (`pessoas`, `falou_com`), para
   entrar pelas MESMAS secções de `oAceitoDoCronista` (cronista-do-turno.js)
   — a mesma régua do homónimo, a mesma mescla, a mesma conferência das
   missões —, e `itens` para o inventário. Só corre quando o Cronista não é
   chamado (o modo `ator`); no `mestre` nada daqui é lido.

     oQueACenaRegista({ ficha, aceite, estado })
       ficha:   a ficha de ator do turno (aFichaDeAtor: pessoas, conversa)
       aceite:  o pedido aceite neste turno ({ de, objeto, pede }), ou nada
       estado:  o de agora (personagem, npcs) — o herói não se regista, e o
                item que já está na mochila não entra duas vezes
     → { pessoas: [{ nome, papel, genero? }], falou_com: [nome], itens: [{ nome, descricao }] }

   Puro, sem React. Provado em `testes/teste-registo-da-cena.mjs`.
   ============================================================ */

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();

/* O QUE O PEDIDO ENTREGA. Os pedidos das subtramas que põem uma coisa na
   mão do herói (subtramas.js: «Leve este cordão a um templo longe daqui»,
   «Leve esta carta a…», «Leve isto à…»). `de` lê o objeto e a fala do
   pedido; `nome` é o item, com o nome de quem o deu ({N}); `descricao` diz
   para quê ({O}, o objeto do pedido). */
export const O_QUE_O_PEDIDO_ENTREGA = Object.freeze([
  { id: "cordao", de: /\bcord[aã]o\b/u, nome: "Cordão de {N}", descricao: "{N} pediu: {O}" },
  { id: "carta", de: /\bcarta\b/u, nome: "Carta de {N}", descricao: "{N} pediu: {O}" },
  { id: "embrulho", de: /\bembrulho\b|\bleve isto\b/u, nome: "Embrulho de {N}", descricao: "{N} pediu: {O}" },
]);

/* quem a cena não regista: a fera, quem está no chão, e o grupo (já tem
   ficha própria, no `personagem.grupo`) */
const naoSeRegista = (p) => !ehObj(p) || !limpo(p.nome) || p.fera || p.comVoce || /no chão/u.test(str(p.estado));
const mesmo = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.split(",")[0].trim() === y.split(",")[0].trim()); };
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));

export function oQueACenaRegista(entrada) {
  const ent = ehObj(entrada) ? entrada : {};
  const ficha = ehObj(ent.ficha) ? ent.ficha : {};
  const estado = ehObj(ent.estado) ? ent.estado : {};
  const pers = ehObj(estado.personagem) ? estado.personagem : {};
  const heroi = limpo(pers.nome);
  const out = { pessoas: [], falou_com: [], itens: [] };
  const pessoas = arr(ficha.pessoas).filter(ehObj);
  /* com quem falou: a conversa da ficha, sem o herói */
  for (const n0 of arr(ficha.conversa)) {
    const n = typeof n0 === "string" ? limpo(n0) : "";
    if (!n || (heroi && mesmo(n, heroi)) || out.falou_com.some((x) => mesmo(x, n))) continue;
    out.falou_com.push(n.slice(0, 60));
  }
  /* quem entra no registo: quem falou com o herói e é gente da cena */
  for (const n of out.falou_com) {
    const p = pessoas.find((x) => mesmo(x.nome, n));
    if (!p || naoSeRegista(p)) continue;
    /* o EM CENA diz o género no lugar do papel («Inez do Prado Baixo (ela)»):
       é género, não ofício */
    const papel0 = limpo(p.oque || p.papel || "");
    const papelEGenero = /^(ele|ela)$/u.test(papel0);
    const g = sem(papelEGenero ? papel0 : p.genero || "");
    out.pessoas.push({ nome: limpo(p.nome).slice(0, 40), papel: papelEGenero || /^voz\b/u.test(papel0) ? "" : papel0, ...(/^(ela|mulher)$/u.test(g) ? { genero: "ela" } : /^(ele|homem)$/u.test(g) ? { genero: "ele" } : {}) });
  }
  /* o que o pedido aceite põe na mão do herói */
  const a = ehObj(ent.aceite) ? ent.aceite : null;
  const N = a ? limpo(a.de) : "", O = a ? limpo(a.objeto) : "";
  if (N && O) {
    const alvo = sem(`${O} ${str(a.pede)}`);
    const e = O_QUE_O_PEDIDO_ENTREGA.find((x) => x.de.test(alvo));
    if (e) {
      const nome = tpl(e.nome, { N }).slice(0, 60);
      const ja = arr(pers.inventario).some((i) => sem(typeof i === "string" ? i : ehObj(i) ? i.nome : "") === sem(nome));
      if (!ja) out.itens.push({ nome, descricao: tpl(e.descricao, { N, O }).slice(0, 160) });
    }
  }
  return out;
}
