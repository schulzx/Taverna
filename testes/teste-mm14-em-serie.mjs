/* teste-mm14-em-serie.mjs (Fase MM · MM14, defeito nº 8) — o mundo não empurra histórias em série

   A sessão de prova (MM11, 30/09, `mente/mm11-sessao.md`) viu quatro
   histórias que não se recusam em 43 respostas — a principal e três tramas
   ("Tirar Branca de lá" no T4, "O lance em O Sino Calado" no T11, "A noite
   em claro em O Sino Calado" no T43) —, e duas vezes "[O PASSADO VOLTA]
   alguém vem cobrar o que você disse que faria" sem a heroína ter
   prometido nada. A prova jogada de MM13 viu uma trama no T8, antes do
   primeiro passo da principal: "Tirar Anya de lá … Varek paga para trazer
   de volta — vivo, se der", com o herói (Varek) a contratante, "de o
   casarão", "Chegar a o casarão" e "vivo" para a Anya.

   As causas, com a linha (HEAD 92875d0, v9.338):
     · a trama forçada (`talvezDarUmaTrama`, App.jsx:16715) só tinha três
       portas: nenhuma trama ativa (16719), o mural liberado (16723) e o
       compasso fora do respiro (16732). O mural liberta-se também por seis
       turnos (`MURAL.turnos`, abertura.js), e com ele a trama nascia antes
       do primeiro passo; e "uma por vez" fazia nascer a seguinte no turno a
       seguir a uma fechar — nada media o espaço entre elas;
     · quem pede é `conhecidos[0]` (App.jsx:16675), o mais antigo do
       registo de pessoas, que não recusa o nome do próprio herói;
     · o molde `tirar_de_la` (tramas.js) escrevia "de ${ermo}" e "vivo", e a
       etapa `ir_a` (missoes.js) "Chegar a ${alvo}" — com os nomes da base,
       que nascem com artigo;
     · a promessa do fio da memória (App.jsx:19440) e a das tramas
       (App.jsx:16708) eram "há uma missão ativa" — e as ativas eram as que
       o sistema forçou.

   As secções:
     1. as tabelas;
     2. a trama espera a sua vez — as duas sessões simuladas, e uma
        campanha longa, antes e depois;
     3. quem pede nunca é o herói;
     4. o português: as contrações e o género de quem sumiu;
     5. a palavra dada — as 28 jogadas da sessão, e as frases que o são;
     6. lixo, `null` e a imutabilidade.

   Tudo por semente. Os imports são por espaço de nomes (e o módulo novo
   por import dinâmico): em HEAD os nomes novos não existem, e a suíte tem
   de falhar asserção a asserção, não num import. */
import fs from "node:fs";
import * as A from "../src/abertura.js";
import * as T from "../src/tramas.js";
import * as M from "../src/missoes.js";
import * as L from "../src/lugar.js";
const PD = await import("../src/palavra-dada.js").catch(() => ({}));

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const semente = (n) => { let x = n >>> 0 || 1; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };

/* ============================================================ */
sec("1. as tabelas");
{
  const E = A.ESPACO_DA_TRAMA || {};
  t("o intervalo entre histórias é de pelo menos um dia de jogo", Number(E.dias) >= 1);
  t("a principal que acabou de andar tem uns turnos de espaço", Number(E.semAvanco) >= 1 && Number(E.semAvanco) <= 8);
  t("contam a principal e a trama, e só histórias que não se recusam", Array.isArray(E.contam) && E.contam.includes("principal") && E.contam.includes("trama")
    && E.contam.every((x) => M.TIPOS[x] && M.TIPOS[x].forcada === true));
  t("o mural continua a esperar seis turnos (o cartaz é opcional)", A.MURAL.turnos === 6);
  const C = L.CONTRACOES || {};
  t("as contrações cobrem de, por, em e a", ["de", "por", "em", "a"].every((p) => C[p] && C[p].o && C[p].a && C[p].os && C[p].as));
  t("a de \"a\" é ao, à, aos, às", C.a && C.a.o === "ao" && C.a.a === "à" && C.a.os === "aos" && C.a.as === "às");
  const V = T.DE_VOLTA_COM_VIDA || {};
  t("quem sumiu tem as três formas", V.masc === "vivo" && V.fem === "viva" && !!V.neutro && !/viv[oa]\b/.test(V.neutro));
  const P = PD.PALAVRA_DADA || {};
  t("a palavra dada tem compromisso, destinatário e janela", (P.compromisso || []).length >= 3 && (P.destinatario || []).length >= 2 && P.janela >= 10);
  /* a tabela saiu de abertura.js: uma só régua */
  const ab = fs.readFileSync(new URL("../src/abertura.js", import.meta.url), "utf8");
  t("abertura.js já não tem a sua cópia das contrações", !/export const CONTRACOES/.test(ab) && !/function contrair/.test(ab) && /contrair \} from "\.\/lugar\.js"|, contrair \} from "\.\/lugar\.js"/.test(ab));
}

/* ============================================================
   2. A TRAMA ESPERA A SUA VEZ

   A simulação é a porta da trama, turno a turno, com o que o App lhe dá:
   `antes` são as portas de HEAD (nenhuma trama ativa + o mural liberado;
   o respiro fica de fora — não foi ele que segurou nenhuma das da sessão);
   `depois` são as mesmas e `tramaTemEspaco`. O contador `semAvanco` anda
   como `andarOSino` o anda: volta a 0 quando a principal dá um passo.
   ============================================================ */
sec("2. a trama espera a sua vez");
function simular({ turnos, diaDoTurno, passos, duracoes, portas }) {
  let missoes = [M.criarMissao({ id: "mis_principal", titulo: "O rasto", tipo: "principal", status: "ativa", dia: diaDoTurno(1),
    etapas: [{ tipo: "falar_com", alvo: "Teodoro" }, { tipo: "falar_com", alvo: "Delfina" }, { tipo: "ir_a", alvo: "Porto" }] })];
  let ab = { ...A.garantirAbertura({ principalId: "mis_principal", cidade: "Foz" }), legado: false };
  const nasceram = [];
  let fecha = -1, k = 0;
  for (let n = 1; n <= turnos; n++) {
    const dia = diaDoTurno(n);
    const temAtiva = missoes.some((m) => m.status === "ativa" && m.tipo === "trama");
    const est = { abertura: ab, missoes, dia };
    const passa = !temAtiva && A.muralLiberado(est) && (portas === "antes" || tenta(() => A.tramaTemEspaco(est), true));
    if (passa) {
      const m = M.criarMissao({ id: `tr_${n}`, titulo: `Trama ${n}`, tipo: "trama", status: "ativa", dia, etapas: [{ tipo: "ir_a", alvo: "Lugar" }] });
      missoes = [...missoes, m];
      nasceram.push(n);
      fecha = n + duracoes[k++ % duracoes.length];
    }
    /* no fim do turno (a resposta do Narrador): a trama que fecha, o passo
       da principal, e o relógio da abertura */
    if (fecha === n) missoes = missoes.map((m) => (m.tipo === "trama" && m.status === "ativa" ? { ...m, status: "concluida" } : m));
    const p = passos.indexOf(n);
    if (p >= 0) missoes = missoes.map((m) => (m.id === "mis_principal" ? { ...m, etapas: m.etapas.map((e, i) => (i <= p ? { ...e, feito: true } : e)) } : m));
    ab = { ...ab, turnos: n, semAvanco: p >= 0 ? 0 : ab.semAvanco + 1 };
  }
  return nasceram;
}
const intervalos = (xs) => xs.slice(1).map((x, i) => x - xs[i]);
{
  /* A SESSÃO DE PROVA (MM11): 43 respostas num só dia (1 de Brumal, 08:00 →
     17:46); o primeiro passo (encontrar o Teodoro) no T3; "Tirar Branca"
     fechou 6 turnos depois de nascer (T10), "O lance" 31 (T42). */
  const sessao = { turnos: 43, diaDoTurno: () => 1, passos: [3], duracoes: [6, 31, 20] };
  const antes = simular({ ...sessao, portas: "antes" });
  const depois = simular({ ...sessao, portas: "depois" });
  console.log(`     sessão MM11 — antes: ${antes.length} tramas (turnos ${antes.join(", ")}) · depois: ${depois.length}${depois.length ? ` (turnos ${depois.join(", ")})` : ""}`);
  t("antes: as três tramas da sessão, nos turnos em que nasceram (4, 11, 43)", antes.join(",") === "4,11,43");
  t("depois: nenhuma trama no dia em que a principal nasceu", depois.length === 0);

  /* A PROVA JOGADA DE MM13: o herói vagueia e só dá o primeiro passo no
     T10; o mural abre no T6 pelo relógio. */
  const mm13 = { turnos: 12, diaDoTurno: () => 1, passos: [10], duracoes: [30] };
  const antes13 = simular({ ...mm13, portas: "antes" });
  const depois13 = simular({ ...mm13, portas: "depois" });
  console.log(`     prova MM13 — antes: trama no turno ${antes13.join(", ") || "—"} · depois: ${depois13.join(", ") || "nenhuma"}`);
  t("antes: a trama nascia antes do primeiro passo (pelo relógio do mural)", antes13.length === 1 && antes13[0] < 10);
  t("depois: nada antes do primeiro passo", depois13.every((n) => n > 10));
  /* mesmo noutro dia: o critério da MM13 sem o atalho */
  const cedo = { abertura: { principalId: "mis_principal", turnos: 9, semAvanco: 9 }, missoes: [M.criarMissao({ id: "mis_principal", titulo: "O rasto", tipo: "principal", status: "ativa", dia: 1, etapas: [{ tipo: "falar_com", alvo: "Teodoro" }] })], dia: 5 };
  t("depois de seis turnos o mural abre, e a trama não", A.muralLiberado(cedo) === true && tenta(() => A.tramaTemEspaco(cedo), true) === false);

  /* UMA CAMPANHA LONGA: 10 dias de 14 turnos; a principal anda nos turnos
     3, 40, 75 e 110; as tramas duram de 4 a 20 turnos, por semente. */
  const r = semente(814);
  const duracoes = Array.from({ length: 40 }, () => 4 + Math.floor(r() * 17));
  const longa = { turnos: 140, diaDoTurno: (n) => 1 + Math.floor((n - 1) / 14), passos: [3, 40, 75, 110], duracoes };
  const aL = simular({ ...longa, portas: "antes" });
  const dL = simular({ ...longa, portas: "depois" });
  const diasCom = (xs) => { const c = {}; for (const n of xs) { const d = longa.diaDoTurno(n); c[d] = (c[d] || 0) + 1; } return c; };
  const maxPorDia = (xs) => Math.max(0, ...Object.values(diasCom(xs)));
  const colados = (xs) => xs.filter((n) => longa.passos.some((p) => n > p && n - p <= 3)).length;
  console.log(`     campanha longa (140 turnos, 10 dias) — antes: ${aL.length} tramas, até ${maxPorDia(aL)} num dia, menor intervalo ${Math.min(...intervalos(aL))} turnos, ${colados(aL)} logo a seguir a um passo da principal`);
  console.log(`                                            depois: ${dL.length} tramas, até ${maxPorDia(dL)} num dia, menor intervalo ${dL.length > 1 ? Math.min(...intervalos(dL)) : "—"} turnos, ${colados(dL)} logo a seguir a um passo da principal`);
  t("antes: mais de uma trama por dia de jogo", maxPorDia(aL) > 1);
  t("depois: no máximo uma trama por dia de jogo", maxPorDia(dL) <= 1);
  t("depois: nenhuma trama nos três turnos a seguir a um passo da principal", colados(dL) === 0);
  t("depois: as tramas continuam a existir (a campanha não fica muda)", dL.length >= 4, `${dL.length}`);
  t("depois: nenhuma no primeiro dia", dL.every((n) => longa.diaDoTurno(n) > 1));
}
{
  /* as portas, uma a uma */
  const principal = (feito) => M.criarMissao({ id: "mis_principal", titulo: "O rasto", tipo: "principal", status: "ativa", dia: 1, etapas: [{ tipo: "falar_com", alvo: "Teodoro", feito }, { tipo: "falar_com", alvo: "Delfina" }] });
  const ab = (x = {}) => ({ principalId: "mis_principal", turnos: 20, semAvanco: 5, ...x });
  const E = (x = {}) => tenta(() => A.tramaTemEspaco({ abertura: ab(), missoes: [principal(true)], dia: 3, ...x }), null);
  t("orientado, dias passados, a principal parada: pode", E() === true);
  t("com uma trama ativa: não", E({ missoes: [principal(true), M.criarMissao({ id: "x", titulo: "X", tipo: "trama", status: "ativa", dia: 1, etapas: [{ tipo: "ir_a", alvo: "Y" }] })] }) === false);
  t("com uma trama nascida hoje e já fechada: não", E({ missoes: [principal(true), { ...M.criarMissao({ id: "x", titulo: "X", tipo: "trama", status: "ativa", dia: 3, etapas: [{ tipo: "ir_a", alvo: "Y" }] }), status: "concluida" }] }) === false);
  t("com a de ontem fechada: pode", E({ missoes: [principal(true), { ...M.criarMissao({ id: "x", titulo: "X", tipo: "trama", status: "ativa", dia: 2, etapas: [{ tipo: "ir_a", alvo: "Y" }] }), status: "concluida" }] }) === true);
  t("um contrato aceite hoje não conta (é do mural, e recusa-se)", E({ missoes: [principal(true), M.criarMissao({ id: "c", titulo: "C", tipo: "contrato", status: "ativa", dia: 3, etapas: [{ tipo: "ir_a", alvo: "Y" }] })] }) === true);
  t("a principal acabou de andar: espera", E({ abertura: ab({ semAvanco: 1 }) }) === false);
  t("depois de o sino tocar, o contador congelado já não segura", E({ abertura: ab({ semAvanco: 0, tocou: true }) }) === true);
  t("antes do primeiro passo: não, mesmo com dias e turnos de sobra", E({ missoes: [principal(false)], abertura: ab({ turnos: 99, semAvanco: 99 }), dia: 30 }) === false);
  t("a principal fechada: o herói já não precisa de orientação", E({ missoes: [{ ...principal(false), status: "concluida" }] }) === true);
  t("save antigo (sem abertura), sem histórias: pode, como antes", tenta(() => A.tramaTemEspaco({ abertura: null, missoes: [], dia: 1 }), null) === true);
  t("save antigo, uma trama de hoje fechada: espera o dia seguinte", tenta(() => A.tramaTemEspaco({ abertura: null, missoes: [{ ...M.criarMissao({ id: "x", titulo: "X", tipo: "trama", status: "ativa", dia: 4, etapas: [{ tipo: "ir_a", alvo: "Y" }] }), status: "concluida" }], dia: 4 }), null) === false);
}

/* ============================================================ */
sec("3. quem pede nunca é o herói");
{
  const heroi = "Varek";
  const conhecidos = [{ nome: "Varek", papel: "" }, { nome: "Isolda Mó", papel: "moleira" }];
  const gente = [{ nome: "Varek" }, { nome: "Teodoro das Tábuas", papel: "músico" }];
  /* antes: o App escolhia `conhecidos[0]` */
  t("antes: o primeiro do registo era o próprio herói", conhecidos[0].nome === heroi);
  const q = tenta(() => T.quemPede({ conhecidos, gente, heroi }), null);
  t("quemPede salta o herói e escolhe o conhecido seguinte", !!q && q.nome === "Isolda Mó", JSON.stringify(q));
  t("e salta os mortos", (tenta(() => T.quemPede({ conhecidos: [{ nome: "Rui", status: "morto" }, { nome: "Ana" }], heroi }), {}) || {}).nome === "Ana");
  t("sem conhecidos, a gente da cidade — e nunca o herói", (tenta(() => T.quemPede({ conhecidos: [{ nome: "Varek o Ruivo" }], gente, heroi }), {}) || {}).nome === "Teodoro das Tábuas");
  t("sem ninguém, ninguém", tenta(() => T.quemPede({ conhecidos: [{ nome: "Varek" }], gente: [], heroi }), 0) === null);
  /* a guarda dentro de montarTrama: mesmo que quem chama mande o herói */
  let comHeroi = 0, n = 0;
  for (let s = 1; s <= 60; s++) {
    const tr = T.montarTrama({ situacao: { momento: 0.3, nivel: 2 }, rnd: semente(s),
      material: { heroi, pessoa: { nome: "Varek" }, ermo: { nome: "o casarão" }, local: { nome: "A Porta Aberta" }, cidade: { nome: "Alto do Sal" }, criatura: { nome: "lobo cinzento" }, sumido: "Anya" } });
    if (!tr) continue;
    n++;
    if (tr.dador === "Varek" || /Varek/.test(tr.descricao) || /Varek/.test(tr.titulo)) comHeroi++;
  }
  t(`60 tramas com o herói mandado como quem pede: ${comHeroi} com o herói a pedir (de ${n})`, n > 0 && comHeroi === 0);
}

/* ============================================================ */
sec("4. o português: as contrações e quem sumiu");
{
  const c = L.contrair || ((x) => x);
  t("\"de o casarão\" → \"do casarão\"", c("não voltou de o casarão") === "não voltou do casarão");
  t("\"Chegar a o casarão\" → \"Chegar ao casarão\"", c("Chegar a o casarão") === "Chegar ao casarão");
  t("\"Chegar a a torre caída\" → \"Chegar à torre caída\"", c("Chegar a a torre caída") === "Chegar à torre caída");
  t("\"em A Porta Aberta\" → \"na Porta Aberta\"", c("A conversa em A Porta Aberta") === "A conversa na Porta Aberta");
  t("\"por os campos\" → \"pelos campos\", \"a as portas\" → \"às portas\"", c("passa por os campos a as portas") === "passa pelos campos às portas");
  t("a maiúscula do começo passa à contração", c("De o outro lado") === "Do outro lado");
  t("o pronome da ênclise não é preposição (\"leva-a a casa\")", c("leva-a a casa") === "leva-a a casa");
  t("\"a\" colado a uma palavra não se toca (\"casa a a\" não existe; \"para a\" fica)", c("para a torre") === "para a torre" && c("Porto") === "Porto");
  t("nome sem artigo fica como está (\"Chegar a Porto\")", M.textoDaEtapa({ tipo: "ir_a", alvo: "Porto" }) === "Chegar a Porto");
  t("a etapa diz \"Chegar ao casarão\"", M.textoDaEtapa({ tipo: "ir_a", alvo: "o casarão", lugar: true }) === "Chegar ao casarão");
  t("a etapa diz \"Chegar à torre caída\"", M.textoDaEtapa({ tipo: "ir_a", alvo: "a torre caída", lugar: true }) === "Chegar à torre caída");
  t("\"Tirar Anya de lá\", com o acento", M.textoDaEtapa({ tipo: "resgatar", alvo: "Anya" }) === "Tirar Anya de lá");

  /* a varredura: tramas com nomes da base (todos com artigo), 200 sementes */
  const MAU = /(^|[^\p{L}-])(de|por|em|a) (o|a|os|as) /iu;
  let mausT = 0, mausE = 0, total = 0;
  const exemplos = [];
  for (let s = 1; s <= 200; s++) {
    const tr = T.montarTrama({ situacao: { momento: (s % 10) / 10, nivel: 2, temCidadeVizinha: true, temGenteConhecida: true }, rnd: semente(s),
      material: { pessoa: { nome: "Isolda Mó" }, ermo: { nome: s % 2 ? "o casarão" : "a torre caída" }, local: { nome: s % 3 ? "A Porta Aberta" : "O Sino Calado" }, cidade: { nome: s % 2 ? "O Porto Velho" : "As Salinas" }, criatura: { nome: "lobo cinzento" }, sumido: "Anya" } });
    if (!tr) continue;
    total++;
    if (MAU.test(tr.titulo) || MAU.test(tr.descricao)) { mausT++; if (exemplos.length < 2) exemplos.push(tr.descricao); }
    for (const e of tr.etapas) if (MAU.test(M.textoDaEtapa(e))) mausE++;
  }
  console.log(`     200 tramas com nomes de artigo colado: ${mausT} textos e ${mausE} etapas com "de o / a a / em A" (de ${total})${exemplos.length ? " — ex.: " + exemplos[0] : ""}`);
  t("nenhum título ou descrição com a costura", total > 0 && mausT === 0);
  t("nenhuma linha de etapa com a costura", mausE === 0);

  /* quem sumiu, pelo género */
  const tirar = (x = {}) => T.montarTrama({ situacao: { momento: 0.6, nivel: 2 }, rnd: semente(5), material: { pessoa: { nome: "Isolda Mó" }, ermo: { nome: "o casarão" }, sumido: "Anya", ...x } });
  const tf = tirar({ sumidoSexo: "fem" }), tm = tirar({ sumido: "Rui", sumidoSexo: "masc" }), tn = tirar();
  t("a única trama possível com pessoa e ermo é \"tirar de lá\"", !!tf && tf.veiculo === "tirar_de_la");
  t("Anya, mulher: \"viva, se der\"", !!tf && /— viva, se der\./.test(tf.descricao), tf && tf.descricao);
  t("Rui, homem: \"vivo, se der\"", !!tm && /— vivo, se der\./.test(tm.descricao), tm && tm.descricao);
  t("sem se saber: \"com vida, se der\" — nunca \"vivo\"", !!tn && /— com vida, se der\./.test(tn.descricao) && !/\bviv[oa]\b/.test(tn.descricao), tn && tn.descricao);
  t("e a descrição inteira da prova de MM13, direita", !!tf && tf.descricao === "Anya não voltou do casarão. Isolda Mó paga para trazer de volta — viva, se der.", tf && tf.descricao);
}

/* ============================================================ */
sec("5. a palavra dada");
{
  const pd = PD.promessaDaFrase || (() => null);
  const pa = PD.promessaEmAberto || (() => "?");
  /* as jogadas da sessão, lidas da transcrição */
  const linhas = fs.readFileSync(new URL("../mente/mm11-sessao.md", import.meta.url), "utf8").split(/\r?\n/);
  const js = [];
  let cur = null;
  for (const l of linhas) {
    const m = l.match(/^\*\*J(\d+)\*\* — (.*)$/);
    if (m) { if (cur) js.push(cur); cur = { n: +m[1], texto: m[2] }; continue; }
    if (cur && (!l.trim() || /^[`*(]/.test(l))) { js.push(cur); cur = null; continue; }
    if (cur) cur.texto += " " + l;
  }
  if (cur) js.push(cur);
  const j16 = js.find((j) => j.n === 16);
  t(`a transcrição dá as jogadas escritas (${js.length})`, js.length >= 25 && !!j16 && /não prometi nada/.test(j16.texto));
  const falsas = js.filter((j) => pd(j.texto));
  t("nenhuma das jogadas da sessão é uma promessa", !!PD.promessaDaFrase && falsas.length === 0, falsas.map((j) => `J${j.n}`).join(", "));
  t("\"Eu não prometi nada a ninguém, Teodoro\" (J16) não é promessa", !!PD.promessaDaFrase && pd(j16.texto) === null);

  /* ANTES: a promessa do fio era a primeira missão ativa. No T15 da
     sessão a principal já tinha fechado (o defeito nº 1, no T5), e a única
     ativa era "O lance em O Sino Calado" — a que o Teodoro cobrou no M15. */
  const ativas = [
    { ...M.criarMissao({ id: "mis_principal", titulo: "O rasto de Delfina", tipo: "principal", status: "ativa", dia: 1, etapas: [{ tipo: "falar_com", alvo: "Delfina" }] }), status: "concluida" },
    M.criarMissao({ id: "tr_leilao", titulo: "O lance em O Sino Calado", tipo: "trama", status: "ativa", dia: 1, etapas: [{ tipo: "ir_a", alvo: "O Sino Calado", lugar: true }] }),
  ];
  const antes = (M.ativas(ativas).map((m) => m.titulo).filter(Boolean)[0]) || "";
  const mensagens = js.filter((j) => j.n <= 15).map((j) => ({ autor: "jogador", texto: j.texto }));
  const depois = pa(mensagens);
  console.log(`     T15 da sessão — antes: "${antes}" · depois: "${depois}"`);
  t("antes: o fio cobrava uma missão que o sistema forçou", antes === "O lance em O Sino Calado");
  t("depois: sem promessa da heroína, não há o que cobrar", depois === "");

  const sao = [
    'Olho o Teodoro nos olhos: "Prometo que te trago a Branca de volta."',
    'Digo à Rosalina: "Tens a minha palavra — amanhã pago o quarto."',
    "Juro-te que volto antes do pôr do sol.",
    "Prometo ao Teodoro que vou ao lance.",
    '"Dou-lhe a minha palavra, senhora. Encontro a sua filha."',
    'Aperto-lhe a mão. "Palavra de honra."',
    "Digo: prometo que volto.",
  ];
  const naoSao = [
    '"Eu não prometi nada a ninguém, Teodoro."',
    '"Não prometo nada."',
    '"Prometes?" pergunto.',
    "Juro que não fui eu!",
    '"Juro que não fui eu."',
    "Vou à torre caída amanhã e trago a Branca.",
    "Prometo a mim mesma que o encontro.",
    "Prometo que o encontro.",
    '"Talvez eu venha."',
    "Ontem prometi-lhe que voltava.",
    'Penso: "juro que o encontro".',
  ];
  const faltam = sao.filter((f) => !pd(f));
  const sobram = naoSao.filter((f) => pd(f));
  t(`as frases que são promessa (${sao.length - faltam.length}/${sao.length})`, faltam.length === 0, faltam.join(" | "));
  t(`as que não são (${naoSao.length - sobram.length}/${naoSao.length})`, sobram.length === 0, sobram.join(" | "));
  t("a promessa vem com as palavras da heroína", (pd(sao[0]) || {}).frase === "Prometo que te trago a Branca de volta");
  t("o Mestre não promete pela heroína", pa([{ autor: "mestre", texto: '"Prometo que volto", digo.' }, { autor: "sistema", texto: "Prometo ao Teodoro que vou." }]) === "");
  t("a mais recente é a que conta", pa([{ autor: "jogador", texto: sao[3] }, { autor: "jogador", texto: sao[0] }, { autor: "jogador", texto: "Saio." }]) === "Prometo que te trago a Branca de volta");
  t("a janela esquece a promessa antiga", pa([{ autor: "jogador", texto: sao[3] }, ...Array.from({ length: 50 }, () => ({ autor: "jogador", texto: "Ando." }))]) === "");
}

/* ============================================================ */
sec("6. lixo, null e a imutabilidade");
{
  for (const x of [null, undefined, {}, [], "x", 3]) {
    t(`tramaTemEspaco(${JSON.stringify(x)}) não lança`, tenta(() => { A.tramaTemEspaco(x); return true; }, false));
    t(`quemPede(${JSON.stringify(x)}) não lança`, tenta(() => { T.quemPede(x); return true; }, false));
    t(`promessaDaFrase(${JSON.stringify(x)}) e promessaEmAberto não lançam`, tenta(() => { PD.promessaDaFrase(x); PD.promessaEmAberto(x); return true; }, false));
    t(`contrair(${JSON.stringify(x)}) devolve texto`, typeof tenta(() => L.contrair(x), null) === "string");
  }
  const est = { abertura: { principalId: "mis_principal", turnos: 3, semAvanco: 2 }, missoes: [M.criarMissao({ id: "mis_principal", titulo: "O rasto", tipo: "principal", status: "ativa", dia: 1, etapas: [{ tipo: "falar_com", alvo: "Teodoro", feito: true }] })], dia: 2 };
  const antes = JSON.stringify(est);
  tenta(() => A.tramaTemEspaco(est));
  t("tramaTemEspaco não muta o que recebe", JSON.stringify(est) === antes);
  const mat = { heroi: "Varek", pessoa: { nome: "Varek" }, ermo: { nome: "o casarão" }, sumido: "Anya" };
  const antesM = JSON.stringify(mat);
  T.montarTrama({ situacao: {}, material: mat, rnd: semente(2) });
  t("montarTrama não muta o material", JSON.stringify(mat) === antesM);
  const msgs = [{ autor: "jogador", texto: "Prometo ao Teodoro que vou." }];
  const antesP = JSON.stringify(msgs);
  tenta(() => PD.promessaEmAberto(msgs));
  t("promessaEmAberto não muta as mensagens", JSON.stringify(msgs) === antesP);
  t("determinismo: a mesma semente, a mesma trama", JSON.stringify(T.montarTrama({ situacao: { momento: 0.3 }, material: mat, rnd: semente(9) })) === JSON.stringify(T.montarTrama({ situacao: { momento: 0.3 }, material: mat, rnd: semente(9) })));
}

/* A FIAÇÃO — por texto, fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("fiação: a trama forçada pergunta tramaTemEspaco", app.includes("return tramaTemEspaco({ abertura: aberturaMundoRef.current, missoes: missoesRef.current, dia: diaRef.current });"));
  t("fiação: quem pede passa por quemPede, com o herói de fora", app.includes("const pessoa = quemPede({ conhecidos, gente, heroi });"));
  t("fiação: quem sumiu tem sexo, para o texto concordar", app.includes("sumido: nomePessoa(generoMundo(), sumidoSexo,"));
  t("fiação: a promessa é a palavra dada, nos dois sítios", app.split("promessaEmAberto(mensagensRef.current)").length - 1 >= 2 && !app.includes("promessaAberta: (missoesAtivas("));
  t("fiação: a linha da trama já não fala de si ('do Mestre: não se recusa')", !app.includes("Esta é do Mestre: não se recusa."));
}

console.log(`\nmm14-em-serie: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
