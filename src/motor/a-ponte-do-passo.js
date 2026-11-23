/* ============================================================
   A PONTE DO PASSO (QC1, 22/11/2026) — src/motor/a-ponte-do-passo.js

   A décima quinta sessão do Mestre vivo (mente/lancamento/mestre-vivo-
   sessao-15.md) mostrou o furo pela raiz: o sistema tinha uma quest
   desenhada («O Livro dos Nomes») e não a contou ao Narrador; o Narrador,
   sem matéria, contou outra. Em todos os 56 turnos a tela mostrou o botão
   «Ir até A Capela do Afogado» (propostas-da-abertura.js, oRumoDaBusca),
   e a pauta só dizia «O PASSO: Saber onde quem lê o livro à noite guarda
   o livro» — a ponte do RUMO veio vazia (abertura.js#proximoPasso lê as
   missões, e num mundo de quests elas não existem), e a linha «falta: ir à
   Capela» era omitida por ser um «algum». A tela sabia o destino e o
   Narrador estava proibido de dizê-lo; inventou um Corvo, uma cripta e uma
   filha flautista, e nada disso virou fato.

   A REGRA: o Narrador nunca sabe menos do que a tela mostra. A ponte é o
   destino do botão — o MESMO objeto de oRumoDaBusca, com as mesmas
   entradas que o App lhe dá —, e quem em cena pode apontar para lá. Nem
   mais: o que há lá dentro, quem guarda o quê e o desfecho continuam
   guardados (a lei «o Narrador nunca vê a verdade eleita antes do turno
   da revelação» não muda).

   Vale para todos, com o Mestre vivo ligado ou não: é só informação que a
   tela já mostra. Entra no RUMO (pauta.js, prio 2,42) como o `{passo}` da
   ponte quando o passo das missões vem vazio — nenhuma secção nova,
   nenhum bloco estático; a campanha antiga (sem esqueleto, sem passos) dá
   a ponte vazia, e a pauta é a de sempre, byte a byte.

     aPonteDoPasso({ passos, aqui, cidade, grupo, emLuta, naEstrada,
                     presentes, sabem }) → string ("" sem destino)
       passos, aqui, cidade, grupo, emLuta, naEstrada: as entradas de
                  oRumoDaBusca, como o App lhas dá (o botão);
       presentes: [nome] — quem está em cena (fora do grupo);
       sabem:     [nome] — a gente do caso que o herói já ouviu (as cartas
                  de pessoa viradas: quemSabeDoCaso).
     quemSabeDoCaso(quadros) → [nome]

   Puro, sem React, sem sorte. Provado em testes/teste-a-quest-manda-na-cena.mjs.
   ============================================================ */
import { oRumoDaBusca } from "../propostas-da-abertura.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "");
const chave = (s) => txt(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- A TABELA ----------------
   Uma frase por `acao` do botão (oRumoDaBusca): {nome} o destino, {cidade}
   a cidade dele. `emCidade`: a cidade, quando o sítio tem uma. `quem`: quem
   em cena pode apontar o caminho. `teto`: o tamanho máximo da ponte (o RUMO
   a embrulha em ~60 caracteres). */
export const A_PONTE_DO_PASSO = Object.freeze({
  ir: "{nome}{emCidade} — é para lá que a pista do caso leva",
  partir: "{nome} — é para lá que a pista do caso leva, pela estrada",
  levar: "{nome} ir junto — é quem o caso pede ao lado do herói",
  emCidade: ", em {cidade}",
  quem: "; {quem} sabe o caminho",
  /* 22/11 (a décima sexta sessão do Mestre vivo): A PESSOA DO DESTINO. «Ouvir
     Constance Mordaunt» mandava «Partir para Ponto valente», a ponte dizia só a
     cidade, e a prosa deu corpo a Constance na torre de Rio do Martelo — onde o
     sistema não a tem — por 26 frases. Quem o passo pede e mora no destino vai
     dito como de lá, e não daqui. `falar`: a porta 4 de oRumoDaBusca — quem o
     passo pede está em cena (o Thaddeus, frases 13 a 19) */
  laEsta: "; {pessoa} está lá, e não aqui",
  falar: "{nome} está aqui, em cena — é dele ou dela que o caso depende agora",
  /* 23/11 (a décima sétima sessão, §1): O CAMINHO ALCANÇÁVEL. O alvo do passo
     está escondido e a condição tem outro ramo: a porta `vasculhar` (revirar
     onde já se está) e, em qualquer porta, o ramo inteiro em frase de mundo
     (`caminho`, o-caminho-alcancavel.js) — sem o nome do escondido */
  vasculhar: "{nome} — o que o caso pede se acha revirando aqui",
  caminho: "; o caminho: {caminho}",
  /* 23/11 (a próxima perna, §2 da mesma sessão): o lugar do passo fica onde a
     lei não deixa ir direto — o botão leva à perna seguinte, e o Narrador
     sabe que é uma perna, e para onde ela leva; na Torre de portal fechado,
     que o caminho é o guardião */
  perna: "{nome} — a próxima parte do caminho até {rumo}, onde o caso continua; dali para lá não se vai direto",
  guardiao: "{guardiao} guarda a passagem deste andar — o caso continua em {rumo}, e o caminho para cima só abre quando cair",
  teto: 200,
});

const encher = (molde, v) => molde.replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? "" : String(v[k])));

/* a gente do caso que o herói já ouviu: as cartas de pessoa viradas */
export function quemSabeDoCaso(quadros) {
  const out = [];
  for (const q of arr(quadros)) for (const c0 of arr(obj(q) && q.cartas)) {
    const c = obj(c0);
    if (!c || c.estado !== "virada" || c.forma !== "pessoa") continue;
    const n = txt((obj(c.juiz) && c.juiz.nome) || (obj(c.escreve) && c.escreve.nome));
    if (n && !out.some((x) => chave(x) === chave(n))) out.push(n);
  }
  return out;
}

export function aPonteDoPasso(entrada) {
  try {
    const e = obj(entrada) || {};
    const r = oRumoDaBusca({ passos: e.passos, aqui: e.aqui, cidade: e.cidade, grupo: e.grupo, emLuta: e.emLuta, naEstrada: e.naEstrada, presentes: e.presentes, partida: e.partida });
    if (!r || !r.acao || !txt(r.nome)) return "";
    const P = A_PONTE_DO_PASSO;
    /* a próxima perna: o botão leva a um degrau do caminho, e não ao destino */
    if (r.acao === "guardiao" || (r.acao === "partir" && txt(r.rumo))) {
      const m = r.acao === "guardiao" ? P.guardiao : P.perna;
      const f = encher(m, { nome: txt(r.nome), guardiao: txt(r.guardiao) || txt(r.nome), rumo: txt(r.rumo) });
      return f.length > P.teto ? f.slice(0, P.teto - 1) + "…" : f;
    }
    const molde = P[r.acao];
    if (!molde) return "";
    const cam = arr(e.passos).map((p) => obj(obj(p) && p.caminho)).find((c) => c && txt(c.texto));
    /* o caminho vai inteiro, logo depois do destino; o resto (quem mora lá,
       quem sabe o caminho) só entra se couber no teto */
    const cauda = cam ? encher(P.caminho, { caminho: txt(cam.texto) }) : "";
    const comCaminho = (base, extras) => {
      let f = base + cauda;
      /* sem caminho, a ponte de sempre, byte a byte */
      for (const x of arr(extras)) if (x && (!cam || (f + x).length <= P.teto)) f += x;
      return f.length > P.teto ? f.slice(0, P.teto - 1) + "…" : f;
    };
    if (r.acao === "falar" || r.acao === "vasculhar") return comCaminho(encher(molde, { nome: txt(r.nome) }));
    const daqui = r.acao === "ir" && txt(r.cidade) && chave(r.cidade) !== chave(r.nome);
    const s = encher(molde, { nome: txt(r.nome), emCidade: daqui ? encher(P.emCidade, { cidade: txt(r.cidade) }) : "" });
    const extras = [];
    /* quem o passo pede e mora no destino: a casa dela (ir) ou a cidade dela (partir) */
    const noDestino = (x) => (r.acao === "partir" ? chave(x.cidade) === chave(r.cidade) && chave(x.cidade) !== chave(e.cidade)
      : r.acao === "ir" && chave(x.onde) === chave(r.nome));
    const dela = arr(e.passos).flatMap((p) => [...arr(obj(p) && obj(p.candidatos) && p.candidatos.pessoa), ...arr(obj(p) && p.quem)])
      .map(obj).find((x) => x && txt(x.nome) && x.predicado !== "acompanha" && noDestino(x));
    if (dela) extras.push(encher(P.laEsta, { pessoa: txt(dela.nome) }));
    /* quem em cena pode apontar: primeiro quem o caso já fez falar; na
       mesma cidade, quem mais estiver aqui (o sítio é público) */
    const doGrupo = new Set(arr(e.grupo).map((g) => chave(obj(g) ? g.nome : g)).filter(Boolean));
    const aqui = arr(e.presentes).map(txt).filter((n) => n && !doGrupo.has(chave(n)) && chave(n) !== chave(r.nome));
    const sabe = arr(e.sabem).map(txt).find((n) => aqui.some((a) => chave(a) === chave(n)))
      || (r.acao === "ir" ? aqui[0] : "");
    if (sabe) extras.push(encher(P.quem, { quem: sabe }));
    return comCaminho(s, extras);
  } catch { return ""; }
}
