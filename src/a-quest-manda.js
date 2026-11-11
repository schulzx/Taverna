/* ============================================================
   A QUEST MANDA — o passo ativo planta o que pede (11/11/2026, Fase MC · MC5)

   A 18.ª sessão, os defeitos 1 e 2 (mente/plano-o-mestre-chama-o-dado.md,
   §1.3 e §1.4):

     · o passo dizia «descobrir o que o Largo do Cereal esconde», o herói
       revistou o Largo, PASSOU, e o envelope disse «AQUI NÃO HÁ NADA
       ESCONDIDO» — e fechou o lugar para sempre. A busca pergunta ao mundo
       (`achavelAqui`, mundo-base.js) e o mundo só conhecia os segredos da
       base; o passo vivia na pauta do Narrador e nenhuma regra o lia. O
       sistema tornou impossível, por ele, o passo que ele próprio pediu;
     · o passo dizia «seguir o rasto até onde a besta dorme», e o oráculo,
       perguntado pelo próprio sistema, disse «não há rastro» (a cidade dá
       −25 a `haRastro`). Duas verdades do sistema a desmentir-se, e o
       Narrador a escolher uma delas.

   A régua da casa é a do Matt: o que a mesa pergunta tem resposta do
   sistema, e a resposta é a mesma de qualquer lado que se pergunte. Este
   módulo é o lado que faltava — as regras passam a LER o passo:

     osPassosDasQuests(estado, { mundo }) → os passos ativos, em dados (o
       lugar a descobrir, os lugares do passo, para onde a pista aponta), das
       mesmas quests que a pauta do Narrador vê (`aMesaDasQuests`);
     achadoDoPasso(passos, onde) → o segredo do passo, achável NO lugar do
       passo, com a forma de um achado (`achavelAqui`) e `especie: "passo"`;
     oPassoNoOraculo(pergunta, { passos, onde, contexto }) → a resposta do
       mundo quando o passo já a deu (no lugar do passo de rasto, há rasto);
     oLivroDoAchado(livro, achado, { dia, turno }) → o livro com
       `descobriu` escrito pelo SISTEMA, não pelo Cronista: a busca que acha o
       segredo do passo cumpre a condição sem depender de a prosa o dizer.

   A pista não é inventada: aponta para o resto do MESMO passo (o outro
   lugar, a pessoa, a coisa que as condições da etapa pedem), que o Diário
   já mostra ao jogador. Quem é do vilão não entra na pista pelo nome: o
   herói ainda não o sabe (a alcunha, plano-do-vilao.js).

   PURO E DETERMINÍSTICO. Nada de sorte nem relógio; o `null` e o lixo dão
   lista vazia, `null` ou o livro de antes — nunca lançam.
   ============================================================ */
import { questPorId, estadoDaQuest } from "./biblioteca-de-quests.js";
import { garantirQuestsDaEspinha } from "./motor/quests-do-turno.js";
import { garantirEsqueleto } from "./esqueleto.js";
import { garantirHistoria } from "./historia.js";
import { anotarTurno } from "./livro-de-factos.js";
import { perguntaDoSistemaPorId, grauPorId, chaveDoFato } from "./oraculo.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const semAc = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (s) => semAc(s).replace(/^(o|a|os|as)\s+/, "").trim();
const encher = (molde, v) => String(molde).replace(/\{(\w+)\}/g, (m, k) => (v[k] == null ? "" : String(v[k])));

/* ---------------- O PASSO NO ORÁCULO ----------------
   Como o passo ativo pesa nas perguntas que o sistema faz a si mesmo
   (oraculo.js, PERGUNTAS_DO_SISTEMA). Para cada pergunta: `rx`, o que no
   passo (o id da etapa e a frase dela, sem acento) diz que ele é DAQUELA
   espécie; `grau`, a resposta do mundo nos lugares desse passo; `porque`,
   o motivo, que vai ao registo do facto e nunca à tela.
   O rasto conta «barro» e «chão» porque há passos que leem o chão sem dizer
   a palavra («ler o barro de…», em As Pegadas no Barro). A escuta não tem
   ainda passo no catálogo: a linha existe para o dia em que tiver, e a
   suíte prova-a com um passo de mentira. */
export const O_PASSO_NO_ORACULO = Object.freeze({
  haRastro: Object.freeze({ rx: /\b(rastr?o|rastos|pegadas?|barro|chao)\b/, grau: "sim", porque: "o passo da história passa por aqui" }),
  haOQueOuvir: Object.freeze({ rx: /\b(escuta\w*|escutar|ouvir|ouve)\b/, grau: "sim", porque: "o passo da história manda escutar aqui" }),
});

/* ---------------- A PISTA DO PASSO ----------------
   O que o segredo do passo É, por espécie do passo e por aquilo para onde
   aponta (o resto da etapa). `{aqui}` é o lugar do segredo, `{0}` o alvo e
   `{passo}` a frase da etapa em minúscula. A espécie «rasto» é a de
   O_PASSO_NO_ORACULO.haRastro; a outra é «segredo».
   `prioridade`: para onde a pista aponta primeiro, quando a etapa tem mais
   de um caminho — o lugar leva o herói a andar, a pessoa a falar.
   `teto`: o comprimento máximo da frase (vai ao envelope do teste). */
export const PISTA_DO_PASSO = Object.freeze({
  rasto: Object.freeze({
    lugar: "um rasto fresco {emAqui}, que leva {a0}",
    pessoa: "um rasto fresco {emAqui}, que vai dar à porta {de0}",
    item: "um rasto fresco {emAqui}, e caído nele: {0}",
    nada: "um rasto fresco {emAqui}, que ninguém apagou",
  }),
  segredo: Object.freeze({
    lugar: "o que {aqui} escondia: uma pista que aponta {para0}",
    pessoa: "o que {aqui} escondia aponta para alguém: {0}",
    item: "o que {aqui} escondia: uma pista sobre {0}",
    nada: "o que {aqui} escondia, a peça que faltava para {passo}",
  }),
  prioridade: Object.freeze(["lugar", "pessoa", "item"]),
  /* os predicados de cada alvo da pista (condicoes-da-quest.js) */
  alvos: Object.freeze({
    lugar: Object.freeze(["esteve", "descobriu", "esta_em", "concluiu"]),
    pessoa: Object.freeze(["conversou", "consultou", "conheceu", "acompanha", "afeicao"]),
    item: Object.freeze(["tem"]),
  }),
  teto: 200,
});

/* a preposição com o artigo do nome («em O Malho» → «no Malho») */
const CONTRAI = Object.freeze({
  em: Object.freeze({ o: "no", a: "na", os: "nos", as: "nas" }),
  de: Object.freeze({ o: "do", a: "da", os: "dos", as: "das" }),
  a: Object.freeze({ o: "ao", a: "à", os: "aos", as: "às" }),
  para: Object.freeze({ o: "para o", a: "para a", os: "para os", as: "para as" }),
});
function com(prep, nome) {
  const n = String(nome || "").trim();
  const m = n.match(/^(O|A|Os|As)\s+(.+)$/);
  if (m) return `${CONTRAI[prep][m[1].toLowerCase()]} ${m[2]}`;
  return `${prep} ${n}`;
}

/* os átomos de uma falta (julgarEtapa), pelos «algum» e «pelo_menos»
   adentro; o veto (`nenhum`) não é caminho e fica de fora */
function atomos(falta, out = []) {
  for (const f of arr(falta)) {
    const x = obj(f);
    if (!x) continue;
    if (x.predicado === "algum" || x.predicado === "pelo_menos") { for (const o of arr(x.opcoes)) atomos(o, out); continue; }
    if (x.predicado === "nenhum" || !x.predicado || x.invalida || x.reservado || x.desconhecido) continue;
    out.push(x);
  }
  return out;
}

/* ---------------- O PASSO DE UMA QUEST ----------------
   oPassoDaQuest(ficha, registo, contexto) → null | {
     quest, etapa, texto, especie: "rasto" | "segredo",
     descobrir: [{ id, nome, cidade }] — os lugares cujo segredo o passo pede
                                          e ainda não caiu;
     lugares:   [{ id, nome, cidade }] — todos os lugares do passo;
     aponta:    { tipo, nome } | null  — o resto do passo, pela prioridade
   }
   `contexto`: o de `estadoDaQuest` ({ estado, mundo, quests }). Só a quest
   aberta, visível e acesa tem passo — a mesma régua da pauta. */
export function oPassoDaQuest(ficha, registo, contexto) {
  try {
    const F = typeof ficha === "string" ? questPorId(ficha) : obj(ficha);
    const R = obj(registo);
    if (!F || !R) return null;
    const v = estadoDaQuest(F, R, contexto);
    if (!v || v.estado !== "aberta" || !v.visivel || !v.acesa || !v.etapa || !v.etapaTexto) return null;
    const papeis = obj(R.papeis) || {};
    const doFio = (papel) => !!(obj(F.papeis) && obj(F.papeis[papel]) && F.papeis[papel].de === "fio");
    const lugarDe = (a) => {
      const p = obj(papeis[a.papel]) || {};
      const nome = String(a.nome || p.nome || "").trim();
      const id = String(a.id || p.id || "");
      if (!nome && !id) return null;
      return { id, nome, cidade: typeof p.cidade === "string" ? p.cidade : "" };
    };
    const descobrir = [], lugares = [], vistos = new Set();
    const candidatos = { lugar: [], pessoa: [], item: [] };
    for (const at of atomos(v.falta)) {
      const a0 = obj(arr(at.args)[0]);
      if (!a0) continue;
      if (a0.tipo === "lugar") {
        const l = lugarDe(a0);
        if (!l) continue;
        const k = l.id || semArtigo(l.nome);
        if (!vistos.has(k)) { vistos.add(k); lugares.push(l); }
        if (at.predicado === "descobriu" && !descobrir.some((d) => (d.id || semArtigo(d.nome)) === k)) descobrir.push(l);
      }
      for (const tipo of PISTA_DO_PASSO.prioridade) {
        if (!PISTA_DO_PASSO.alvos[tipo].includes(at.predicado)) continue;
        if (tipo === "pessoa" && doFio(a0.papel)) continue;
        const nome = String(a0.nome || "").trim();
        if (nome) candidatos[tipo].push({ tipo, nome, id: String(a0.id || ""), papel: a0.papel || "" });
      }
    }
    const especie = O_PASSO_NO_ORACULO.haRastro.rx.test(semAc(`${v.etapa} ${v.etapaTexto}`)) ? "rasto" : "segredo";
    return Object.freeze({
      quest: F.id, etapa: v.etapa, texto: v.etapaTexto, especie,
      escuta: O_PASSO_NO_ORACULO.haOQueOuvir.rx.test(semAc(`${v.etapa} ${v.etapaTexto}`)),
      descobrir: Object.freeze(descobrir.map((l) => Object.freeze(l))),
      lugares: Object.freeze(lugares.map((l) => Object.freeze(l))),
      candidatos: Object.freeze(candidatos),
    });
  } catch { return null; }
}

/* ---------------- OS PASSOS DO ESTADO ----------------
   osPassosDasQuests(estado, { mundo }) → [passo]
   As quests que a pauta do Narrador vê (motor/quests-do-turno.js,
   `aMesaDasQuests`): a do ato, se o ato tem quest e ela não saiu, e as do
   coração (tipo 2) abertas. Campanha antiga (sem esqueleto): []. */
export function osPassosDasQuests(estado, opcoes) {
  try {
    const E = obj(estado);
    const esp = E && obj(E.espinha);
    const esq = esp ? garantirEsqueleto(esp.esqueleto) : null;
    if (!esq) return [];
    const mundo = obj(obj(opcoes) && opcoes.mundo);
    const h = garantirHistoria(E.historia);
    const Q = garantirQuestsDaEspinha(esp.quests);
    const ctx = { estado: E, mundo, quests: Q.registos };
    const doAto = arr(esq.atos).find((a) => a && a.ato === h.etapa) || null;
    const daVez = doAto && doAto.quest && !arr(Q.fora).some((f) => f && f.id === doAto.quest) ? doAto.quest : null;
    const regs = Q.registos.filter((r) => r && r.estado === "aberta" && (r.id === daVez || r.tipo === 2));
    return regs.map((r) => oPassoDaQuest(r.id, r, ctx)).filter(Boolean);
  } catch { return []; }
}

/* ---------------- ONDE O HERÓI ESTÁ ----------------
   `onde`: { lugar, dentroDe, cidade, foraDosMuros } — a mesma forma de
   `ondeSeProcura` (App.jsx), com a cidade. O herói está no lugar do passo
   quando o sítio (ou o prédio de que o cómodo faz parte) tem o nome dele;
   o lugar que é a própria cidade casa em qualquer sítio dela, dentro dos
   muros. A cidade dita dos dois lados tem de ser a mesma. */
export function noLugarDoPasso(lugar, onde) {
  const l = obj(lugar), o = obj(onde);
  if (!l || !o) return false;
  const cidO = semArtigo(o.cidade), cidL = semArtigo(l.cidade);
  if (cidO && cidL && cidO !== cidL) return false;
  const nome = semArtigo(l.nome);
  const aqui = [o.lugar, o.dentroDe].map(semArtigo).filter(Boolean);
  if (nome && aqui.includes(nome)) return true;
  if (cidO && !o.foraDosMuros && (nome === cidO || l.id === `cidade|${cidO}`)) return true;
  return false;
}

/* a frase da pista: a espécie, o alvo pela prioridade (nunca o próprio
   lugar), e o teto */
function pistaDe(passo, lugar) {
  const P = PISTA_DO_PASSO[passo.especie] || PISTA_DO_PASSO.segredo;
  const k = lugar.id || semArtigo(lugar.nome);
  let alvo = null;
  for (const tipo of PISTA_DO_PASSO.prioridade) {
    alvo = arr(obj(passo.candidatos) && passo.candidatos[tipo]).find((c) => tipo !== "lugar" || (c.id || semArtigo(c.nome)) !== k) || null;
    if (alvo) break;
  }
  const passoTxt = String(passo.texto || "").replace(/^./, (c) => c.toLowerCase());
  const nome = alvo ? alvo.nome : "";
  const texto = encher(alvo ? P[alvo.tipo] : P.nada, {
    aqui: lugar.nome, emAqui: com("em", lugar.nome), passo: passoTxt,
    0: nome, a0: com("a", nome), de0: com("de", nome), para0: com("para", nome),
  }).replace(/\s+/g, " ").trim();
  return { texto: texto.length > PISTA_DO_PASSO.teto ? `${texto.slice(0, PISTA_DO_PASSO.teto - 1).trimEnd()}…` : texto, aponta: alvo ? { tipo: alvo.tipo, nome: alvo.nome } : null };
}

/* ---------------- O SEGREDO DO PASSO, ACHÁVEL ----------------
   achadoDoPasso(passos, onde) → null | achado
   A forma é a de `achavelAqui` (o, onde, local, acha, id), com
   `especie: "passo"` — o App distingue-o do baú (não paga moedas, não
   saqueia a base) e escreve `descobriu` (oLivroDoAchado). Acha-se com a
   vista e com a cabeça: `acha` diz «qualquer». Sem CD própria de propósito:
   a CD de uma busca é a do lugar, com e sem achado (MC2, §2.6 da planta —
   o número não denuncia o segredo). */
export function achadoDoPasso(passos, onde) {
  for (const p of arr(passos)) {
    const passo = obj(p);
    if (!passo) continue;
    for (const l of arr(passo.descobrir)) {
      if (!noLugarDoPasso(l, onde)) continue;
      const pista = pistaDe(passo, l);
      return Object.freeze({
        id: `passo|${passo.quest}|${passo.etapa}|${l.id || semArtigo(l.nome)}`,
        especie: "passo", acha: "qualquer",
        o: pista.texto, onde: com("em", l.nome), local: l.nome,
        lugar: Object.freeze({ id: l.id, nome: l.nome, cidade: l.cidade }),
        quest: passo.quest, etapa: passo.etapa, aponta: pista.aponta,
      });
    }
  }
  return null;
}

/* a pista do passo num lugar dele que não é de descobrir (o rasto na toca:
   o passo de rasto tem rasto em todos os seus lugares) — para o facto do
   sucesso (facto-do-sucesso.js) */
export function pistaDoPassoAqui(passos, onde) {
  const a = achadoDoPasso(passos, onde);
  if (a) return a;
  for (const p of arr(passos)) {
    const passo = obj(p);
    if (!passo || passo.especie !== "rasto") continue;
    const l = arr(passo.lugares).find((x) => noLugarDoPasso(x, onde));
    if (!l) continue;
    const pista = pistaDe(passo, l);
    return Object.freeze({ id: `passo|${passo.quest}|${passo.etapa}|${l.id || semArtigo(l.nome)}|rasto`, especie: "passo", acha: "qualquer", o: pista.texto, onde: com("em", l.nome), local: l.nome, lugar: Object.freeze({ id: l.id, nome: l.nome, cidade: l.cidade }), quest: passo.quest, etapa: passo.etapa, aponta: pista.aponta, semDescobrir: true });
  }
  return null;
}

/* ---------------- O ORÁCULO LÊ O PASSO ----------------
   oPassoNoOraculo(pergunta, { passos, onde, contexto }) → null | resposta
   `pergunta`: o id da pergunta do sistema (`v.oportunidade.pergunta`);
   `contexto`: o mesmo que o App passa a `perguntarPeloSistema` (o `onde`
   da frase, o `lugar` da chave do facto). Quando o herói está num lugar de
   um passo da espécie da pergunta, a resposta é a de O_PASSO_NO_ORACULO, e
   vem na forma de `perguntarPeloSistema` — `reusado: true`, porque a
   história já a tinha dado: o envelope diz «o mundo já tinha respondido
   isto», e não «rolou 84». O App regista-a no livro de factos do oráculo
   como qualquer outra (a resposta do passo substitui um NÃO de antes).
   Sem passo aqui, `null`: pergunta-se ao mundo como sempre. */
export function oPassoNoOraculo(pergunta, opcoes) {
  try {
    const regra = O_PASSO_NO_ORACULO[pergunta];
    const q = perguntaDoSistemaPorId(pergunta);
    if (!regra || !q) return null;
    const o = obj(opcoes) || {};
    const campo = pergunta === "haRastro" ? "especie" : "escuta";
    const daEspecie = (p) => (campo === "especie" ? p.especie === "rasto" : p.escuta === true);
    const passo = arr(o.passos).map(obj).filter(Boolean).find((p) => daEspecie(p) && arr(p.lugares).some((l) => noLugarDoPasso(l, o.onde)));
    if (!passo) return null;
    const c = obj(o.contexto) || {};
    const texto = q.pergunta(c);
    return Object.freeze({
      pergunta: String(texto || "").trim(), chance: 100, tipo: q.tipo,
      porque: Object.freeze([Object.freeze({ delta: 0, motivo: regra.porque })]), faixa: null,
      rolo: 0, sim: true, grau: grauPorId(regra.grau), reusado: true,
      chave: chaveDoFato(texto, c.lugar), deQuem: pergunta, seSim: q.seSim, seNao: q.seNao,
      doPasso: Object.freeze({ quest: passo.quest, etapa: passo.etapa }),
    });
  } catch { return null; }
}

/* ---------------- O SISTEMA ESCREVE «DESCOBRIU» ----------------
   oLivroDoAchado(livro, achado, { dia, turno }) → o livro (estado.factos)
   Com o achado do passo (`especie: "passo"`, de achadoDoPasso), o lugar
   dele fica `descobriu` no livro de factos, pelo id do PAPEL da quest — o
   mesmo id que a condição lê. É a porta do sistema da condição `descobriu`
   (condicoes-da-quest.js): a busca que acha o segredo do passo fecha o
   passo, diga a prosa o que disser. Outro achado, lixo, ou a pista de rasto
   que não é de descobrir: o livro como veio. */
export function oLivroDoAchado(livro, achado, opcoes) {
  const a = obj(achado);
  if (!a || a.especie !== "passo" || a.semDescobrir || !obj(a.lugar)) return livro;
  const o = obj(opcoes) || {};
  try {
    const l = a.lugar;
    const r = anotarTurno(livro, { dia: o.dia, turno: o.turno, segredos: [{ id: l.id || undefined, nome: l.nome, cidade: l.cidade || undefined }] });
    return r && r.factos ? r.factos : livro;
  } catch { return livro; }
}
