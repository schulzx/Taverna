/* ============================================================
   A PESSOA DO PASSO (o Narrador ator, a 15.ª sessão · 03/11/2026) — src/motor/a-pessoa-do-passo.js

   A missão manda procurar «Godofredo, taverneiro, no Barril Rachado». O
   herói foi lá e chamou-o três vezes, e ele nunca entrou em QUEM ESTÁ: a
   ficha do ator punha-o só no «Quer» da companheira («Quer: falar com
   Godofredo, taverneiro daqui…»), e as FRONTEIRAS diziam «Falam só:
   Yvete». A Matilde do mural, na casa dela, o mesmo. No modo `mestre` era
   a prosa que os trazia e o Cronista que os registava; no `ator` nada
   entra pela boca do Narrador (mente/plano-narrador-ator.md, decisão 4), e
   a missão principal ficava parada no primeiro passo (mente/sessao-15.md,
   caso 1 e defeito 1).

   QUEM O PASSO PROCURA ESTÁ ONDE O PASSO DIZ. O sistema já sabe, sem ler
   prosa nenhuma: a etapa `falar_com` de uma missão ativa diz QUEM e ONDE;
   o herói está num lugar (`lugar`, `cidadeAtual`); e a base do mundo diz,
   de cada pessoa da cidade, o ofício, o jeito de falar (`modo`) e o que
   ela quer (`vontade`) — e, pela semente, a hora a que está no posto
   (gente-por-dentro.js, a rotina). Esta peça junta as três coisas: quando
   o herói está no sítio da pessoa do passo, a pessoa está em cena — com
   voz, o que sabe e o que quer — se a hora dela é esta; e se não é, a
   ficha diz porquê, com a verdade da rotina (onde ela anda e a que horas
   volta). O `falar_com` cumpre-se depois pela porta que já existe
   (registo-da-cena.js: quem a frase chama e está na ficha).

   O ONDE DA ETAPA, pela ordem: o `onde` da própria etapa; a abertura (a
   pista no sítio dela, o alvo no dele); o registo (`npcs[nome].local`); a
   gente da base desta cidade, pelo nome (é dela que o mural tira quem
   assina: o contrato aceite pelo botão nasce com `onde: ""`, e quem o
   assinou continua a morar onde a base o pôs). Um `onde` que é a cidade
   inteira não põe ninguém em cena: numa capital de sessenta mil almas, a
   pessoa não está em cada taverna.

   QUAIS ETAPAS: a atual de cada missão ativa, e as que se lhe seguem por
   cima de caminho só (ETAPAS_DE_CAMINHO, a mesma régua de `proximoPasso`).
   A conferência só avança a etapa atual; quem está mais adiante na mesma
   rua continua a ser gente do mundo.

     aPessoaDoPasso(estado)
       estado: o do instante (abertura, missoes, lugar, cidadeAtual, npcs,
               mapa, baseMundo, mundo, nomeCampanha, dia, minuto, personagem)
     → [{ nome, papel, onde, de, aqui, agora, ausente, voz, quer, sabe }]
       de:      "pista" | "alvo" | "dador" | "etapa"
       aqui:    está em cena agora (a rotina diz que é a hora dela, ou o
                jogo não sabe a hora)
       ausente: a frase do porquê, quando não está (A_PESSOA_DO_PASSO.ausente)

   Sem sorte: tudo sai do estado e da semente do mundo. Puro, sem React.
   Provado em `testes/teste-a-pessoa-do-passo.mjs`.
   ============================================================ */
import { garantirMissoes, estaEm, moradaDe, etapaAtual, textoDaEtapa, ETAPAS_DE_CAMINHO } from "../missoes.js";
import { garantirAbertura } from "../abertura.js";
import { oQueExisteAqui } from "../mundo-base.js";
import { fichaDaPessoa } from "../gente-por-dentro.js";
import { MOLDE_PADRAO, moldePorId } from "../moldes.js";
import { cenarioAtivo } from "../cenario.js";
import { comEm } from "../lugar.js";
import { oficioNoGenero } from "../nomes.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();
const tpl = (s, v) => str(s).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));
/* a mesma pessoa: o nome inteiro, ou o nome antes da vírgula do epíteto */
const mesmo = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.split(",")[0].trim() === y.split(",")[0].trim()); };
const minuscula = (x) => { const t = limpo(x); return t ? t[0].toLowerCase() + t.slice(1) : t; };

/* COMO SE DIZ O QUE O SISTEMA SABE DA PESSOA. {N} o nome, {P} o papel,
   {H} o herói, {A} o alvo da etapa, {E} onde («no Barril Rachado»), {O} o
   objeto da abertura, {T} o título da missão, {G} onde a pessoa anda agora
   (a rotina), {R} o posto, {I}–{F} as horas, ditas. */
export const A_PESSOA_DO_PASSO = Object.freeze({
  /* a pista da abertura: o que ela sabe é o que a abertura diz que sabe,
     e o que faz é o que a mesa sempre lhe pediu (PASSO_AQUI, abertura.js) */
  sabeDaPista: "mais do que ninguém nesta cidade sobre {O}",
  oNome: "diz o próprio nome a {H} logo que {H} lhe fala",
  /* quem assinou o contrato do mural, com ele aceite */
  querDoDador: "falar a {H} do trabalho que pregou no mural, «{T}», agora que {H} o aceitou",
  /* o passo que vem depois do desta pessoa, dito como coisa que ela sabe */
  sabeDaEtapa: Object.freeze({
    falar_com: "{A} encontra-se {E}",
    derrotar: "{A} anda {E}",
    revelar: "{A} esconde alguma coisa",
    ir_a: "o caminho para {A}",
  }),
  /* sem `onde`: só o nome */
  semOnde: "quem é {A}",
  /* o que ainda há a fazer, nas etapas sem frase própria */
  oQueHa: "o que há a fazer a seguir: {A}",
  /* fora da hora: onde anda e quando volta, a verdade da rotina */
  ausente: "{N}{P} não está aqui agora: {G}. Costuma estar {R} {I} {F}.",
  horas: Object.freeze({ de: "desde", ate: "até" }),
  /* as famílias de ofício cujo posto não se vê (gente-por-dentro.js) */
  semPosto: Object.freeze(["comum"]),
  /* DE QUEM A HORA CONTA. A ordem de 03/11 diz que a hora conta, e conta
     para todos: a rotina é a mesma verdade que a pauta dá a quem pergunta
     «cadê?». Voltar atrás para um tipo (a pista da abertura, por exemplo)
     é tirá-lo daqui. */
  aHoraConta: Object.freeze(["pista", "alvo", "dador", "etapa"]),
});

/* A HORA DITA. A rotina guarda o turno em minutos do dia (gente-por-dentro.js,
   FAMILIAS_DE_OFICIO); a ficha não diz «11h», diz «as onze da manhã». */
export const A_HORA_DITA = Object.freeze({
  nomes: Object.freeze(["meia-noite", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "meio-dia"]),
  partes: Object.freeze([{ ate: 360, o: "da madrugada" }, { ate: 720, o: "da manhã" }, { ate: 1140, o: "da tarde" }, { ate: 1440, o: "da noite" }]),
});
export function aHoraDita(minuto) {
  const m = ((Math.floor(Number(minuto) || 0) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  if (h === 0) return "a meia-noite";
  if (h === 12) return "o meio-dia";
  const n = A_HORA_DITA.nomes[h % 12];
  const parte = A_HORA_DITA.partes.find((p) => m < p.ate).o;
  return `${h % 12 === 1 ? "a" : "as"} ${n} ${parte}`;
}

/* o mundo da campanha: a mesma semente da pauta (`sementeMundo`) */
function oMundo(e) {
  const r = ehObj(e.render) ? e.render : {};
  const mundo = ehObj(e.mundo) ? e.mundo : ehObj(r.mundo) ? r.mundo : {};
  const nome = limpo(e.nomeCampanha) || limpo(r.nomeCampanha) || "aventura";
  let genero = limpo(mundo.genero), molde = null, padrao = "";
  try { padrao = cenarioAtivo().generos.padrao; } catch { padrao = ""; }
  try { molde = moldePorId(mundo.molde || MOLDE_PADRAO); } catch { molde = null; }
  return { semente: `${nome}|${genero}`, genero: genero || padrao, molde, lex: mundo.lexico || null };
}

/* onde o herói está, para `estaEm` (missoes.js) */
const aquiDe = (e) => ({ lugarAtual: ehObj(e.lugar) ? e.lugar : null, cidadeAtual: str(e.cidadeAtual) });

/* o `onde` que põe gente em cena: um sítio, e o herói nele */
function estaAqui(e, onde) {
  const lugar = semArtigo(moradaDe(onde).lugar);
  if (!lugar || !ehObj(e.lugar) || !limpo(e.lugar.nome)) return false;
  if (lugar === semArtigo(e.cidadeAtual) || lugar === semArtigo(e.lugar.cidade)) return false;
  try { return estaEm(aquiDe(e), onde); } catch { return false; }
}

/* o que a pessoa sabe do passo que vem depois do dela */
function oQueSabeDe(et, H) {
  if (!ehObj(et)) return "";
  const A = limpo(et.alvo);
  if (!A) return "";
  const onde = limpo(et.onde);
  const P = A_PESSOA_DO_PASSO;
  const modelo = P.sabeDaEtapa[et.tipo];
  if (modelo) return onde || !/\{E\}/.test(modelo) ? tpl(modelo, { A, E: onde ? comEm(onde) : "", H }) : tpl(P.semOnde, { A });
  let t = "";
  try { t = textoDaEtapa(et); } catch { t = ""; }
  return t ? tpl(P.oQueHa, { A: minuscula(t) }) : "";
}

export function aPessoaDoPasso(estado) {
  const e = ehObj(estado) ? estado : {};
  if (!ehObj(e.lugar) || !limpo(e.lugar.nome)) return [];
  let ms = [];
  try { ms = garantirMissoes(e.missoes).filter((m) => ehObj(m) && m.status === "ativa"); } catch { ms = []; }
  if (!ms.length) return [];
  const a = garantirAbertura(e.abertura);
  const npcs = ehObj(e.npcs) ? e.npcs : {};
  const pers = ehObj(e.personagem) ? e.personagem : ehObj(e.render) && ehObj(e.render.personagem) ? e.render.personagem : {};
  const H = limpo(pers.nome) || "o herói";
  const grupo = arr(pers.grupo).filter((g) => ehObj(g) && g.nome);
  const W = oMundo(e);
  /* a gente da base desta cidade, só se for preciso (é a conta mais cara) */
  let base = null;
  const daBase = (nome) => {
    if (base === null) {
      base = [];
      try { const q = oQueExisteAqui(W.semente, e.mapa, str(e.cidadeAtual), e.baseMundo, W.genero, W.molde, W.lex); base = arr(q && q.gente); } catch { base = []; }
    }
    return base.find((p) => ehObj(p) && mesmo(p.nome, nome)) || null;
  };
  const out = [];
  for (const m of ms) {
    const et0 = etapaAtual(m);
    if (!et0) continue;
    const i0 = m.etapas.indexOf(et0);
    const daAbertura = !a.legado && m.id === a.principalId;
    for (let k = i0; k < m.etapas.length; k++) {
      if (k > i0 && !ETAPAS_DE_CAMINHO.includes(m.etapas[k - 1].tipo)) break;
      const et = m.etapas[k];
      if (!ehObj(et) || et.feito || et.tipo !== "falar_com" || !limpo(et.alvo)) continue;
      const nome = limpo(et.alvo);
      if (grupo.some((g) => mesmo(g.nome, nome)) || mesmo(nome, H) || out.some((x) => mesmo(x.nome, nome))) continue;
      const ehPista = daAbertura && mesmo(nome, a.pista.nome);
      const ehAlvo = !a.legado && mesmo(nome, a.alvo.quem);
      const ehDador = limpo(m.dador) && mesmo(nome, m.dador) && m.tipo !== "principal";
      const regK = Object.keys(npcs).find((x) => mesmo(x, nome));
      const reg = regK && ehObj(npcs[regK]) ? npcs[regK] : null;
      let pb = null;
      let onde = limpo(et.onde) || (ehPista ? a.pista.local : "") || (ehAlvo ? a.alvo.onde : "") || (reg ? limpo(reg.local) : "");
      if (!onde) { pb = daBase(nome); onde = pb ? limpo(pb.local) : ""; }
      if (!onde || !estaAqui(e, onde)) continue;
      if (!pb) pb = daBase(nome);
      const papel = (ehPista && limpo(a.pista.papel)) || (reg && limpo(reg.papel)) || (pb && limpo(oficioNoGenero(pb.papel, pb.genero_pessoa))) || "";
      /* a rotina: a hora dela, pela semente (gente-por-dentro.js) */
      let rot = null, familia = "";
      try {
        const fp = fichaDaPessoa(W.semente, { nome, papel, local: moradaDe(onde).lugar, modo: pb ? pb.modo : "", genero_pessoa: pb ? pb.genero_pessoa : "" },
          { mapa: e.mapa, genero: W.genero, lex: W.lex, molde: W.molde, base: e.baseMundo, npcs, grupo, dia: e.dia, minuto: e.minuto, cidade: str(e.cidadeAtual) });
        rot = fp.rotina; familia = fp.familia;
      } catch { rot = null; }
      const de = ehPista ? "pista" : ehAlvo ? "alvo" : ehDador ? "dador" : "etapa";
      const sabeAHora = !!(rot && rot.agora && rot.agora !== "morreu") && A_PESSOA_DO_PASSO.aHoraConta.includes(de);
      const aqui = !sabeAHora || !!rot.noTurno;
      /* o que sabe: a pista, o que a abertura diz; todos, o passo seguinte */
      const sabe = [];
      if (ehPista && limpo(a.alvo.objeto)) sabe.push(tpl(A_PESSOA_DO_PASSO.sabeDaPista, { O: a.alvo.objeto }));
      /* o passo seguinte que a abertura já disse (o objeto) não se repete;
         o sítio dele, se o tem, é coisa nova, e fica */
      const prox = m.etapas[k + 1];
      const jaDito = ehPista && prox && limpo(prox.alvo) && (prox.tipo === "revelar" || !limpo(prox.onde)) && sem(a.alvo.objeto).includes(semArtigo(prox.alvo));
      const seguinte = jaDito ? "" : oQueSabeDe(prox, H);
      if (seguinte) sabe.push(seguinte);
      const vontade = pb ? limpo(pb.vontade) : "";
      const quer = ehDador ? tpl(A_PESSOA_DO_PASSO.querDoDador, { H, T: limpo(m.titulo) }) : /^quer /u.test(vontade) ? vontade.replace(/^quer /u, "") : "";
      /* o posto, quando o ofício o diz («atrás do balcão»); o genérico («no
         que faz», A_PESSOA_DO_PASSO.semPosto) não diz nada a quem o vê */
      const agora = [rot && rot.noTurno && rot.turno && !A_PESSOA_DO_PASSO.semPosto.includes(familia) ? rot.turno : "", ehPista ? tpl(A_PESSOA_DO_PASSO.oNome, { H }) : ""].filter(Boolean);
      const ausente = aqui ? "" : tpl(A_PESSOA_DO_PASSO.ausente, {
        N: nome, P: papel ? `, ${papel},` : "", G: rot.agora,
        R: rot.turno, I: `${A_PESSOA_DO_PASSO.horas.de} ${aHoraDita(rot.de)}`, F: `${A_PESSOA_DO_PASSO.horas.ate} ${aHoraDita(rot.ate)}`,
      });
      out.push({
        nome, papel, onde, de,
        aqui, agora, ausente, voz: pb ? limpo(pb.modo) : "", quer, sabe,
        genero: pb ? sem(pb.genero_pessoa) : reg ? sem(reg.genero) : "",
      });
    }
  }
  return out;
}
