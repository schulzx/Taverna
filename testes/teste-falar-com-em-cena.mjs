/* FALAR COM ALGUÉM É A CONVERSA (11/10) — o defeito 5 da 4.ª sessão

   Ao fim da 4.ª sessão de prova (`mente/mm11-sessao-4.md`), a missão
   principal "O rasto de Noé Laminado" estava assim: `Inocência Bordão: false
   · Noé Laminado: false` — depois de quatro turnos a falar com a Inocência e
   de achar o Noé no turno 16. As duas razões:
     · a etapa `falar_com` só fechava com o herói no LUGAR da pessoa
       (`estaCom`), e o Narrador pôs a Inocência a tocar no mercado, não no
       sítio da ficha;
     · o Cronista guardou o Noé no cânone, e a etapa procura no registo.

   O que esta suíte prova:
     1. a etapa fecha quando o herói FALOU com a pessoa neste turno
        (`mundo.falouCom`, a lista que o Cronista devolve), mesmo fora do
        lugar e mesmo sem ficha no registo;
     2. a régua do MM14 continua de pé: sem conversa, o nome dito não conta
        (a Delfina a 146 km), e a conversa só vale na cidade da pessoa;
     3. o marco "procurar" da espinha fecha pela mesma porta, com a cidade
        que o marco guarda;
     4. a fiação: o Cronista pede `falou_com`, a lista entra no mundo das
        missões só na conferência que ele dispara, e esvazia-se a seguir.

   FALHA em HEAD (v9.379): a conversa não fecha nada, e o App não pede nem
   lê `falou_com`. */

import { readFileSync } from "node:fs";
import * as M from "../src/missoes.js";
import * as S from "../src/saga.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const ver = (e, m) => M.etapaDef(e.tipo).ver(e, m);

const RIO = "Rio Cinzento", ALTO = "Alto do Sal";
const MERCADO = { nome: "Mercado da Cinza", cidade: RIO };
const SINO = { nome: "O Sino Quieto", cidade: RIO };

sec("1. a conversa fecha a etapa");
{
  const etapa = { tipo: "falar_com", alvo: "Inocência Bordão", onde: `${SINO.nome}, em ${RIO}` };
  const noMercado = { cidadeAtual: RIO, lugarAtual: MERCADO, npcs: {} };
  t("ANTES: no mercado, sem ficha, a etapa fica em falso (o que a sessão viu)", ver(etapa, noMercado) === false);
  t("falei com ela no mercado: fecha", ver(etapa, { ...noMercado, falouCom: ["Inocência Bordão"] }) === true);
  t("pelo nome curto, como a cena a diz (\"Inocência é eu\"): fecha", ver(etapa, { ...noMercado, falouCom: ["Inocência"] }) === true);
  t("com acento ou sem, a mesma pessoa", ver(etapa, { ...noMercado, falouCom: ["inocencia bordao"] }) === true);
  const noe = { tipo: "falar_com", alvo: "Noé Laminado" };
  t("o Noé, só no cânone (sem ficha no registo), achado e falado: fecha", ver(noe, { cidadeAtual: RIO, lugarAtual: { nome: "A Botica", cidade: RIO }, npcs: {}, falouCom: ["Noé Laminado"] }) === true);
  t("e continua a fechar pelo lugar, como sempre (estar com ela no Sino)", ver(etapa, { cidadeAtual: RIO, lugarAtual: SINO, npcs: { i: { nome: "Inocência Bordão", conhecidoEm: 1 } } }) === true);
}

sec("2. a régua do MM14 continua de pé");
{
  const etapa = { tipo: "falar_com", alvo: "Delfina", onde: `A Porta Aberta, em ${ALTO}` };
  const foz = { cidadeAtual: "Foz do Meio", lugarAtual: { nome: "O Sino Calado", cidade: "Foz do Meio" }, npcs: { d: { nome: "Delfina", conhecidoEm: 1, local: ALTO } } };
  t("só nomeada (no registo por menção), a 146 km: não fecha", ver(etapa, foz) === false);
  t("lista vazia: não fecha", ver(etapa, { ...foz, falouCom: [] }) === false);
  t("falei com OUTRA pessoa: não fecha", ver(etapa, { ...foz, falouCom: ["Teodoro das Tábuas"] }) === false);
  t("o Cronista disse que falei com ela, mas estou noutra cidade: não fecha", ver(etapa, { ...foz, falouCom: ["Delfina"] }) === false);
  t("na cidade dela, fora do lugar, falando com ela: fecha", ver(etapa, { cidadeAtual: ALTO, lugarAtual: { nome: "O Cais", cidade: ALTO }, npcs: {}, falouCom: ["Delfina"] }) === true);
  t("a cidade da etapa (campo próprio) também conta", ver({ tipo: "falar_com", alvo: "Delfina", onde: "A Porta Aberta", cidade: ALTO }, { cidadeAtual: "Foz do Meio", lugarAtual: null, npcs: {}, falouCom: ["Delfina"] }) === false);
  t("apelido curto demais não é ninguém (\"Ze\" não é \"Zelinda\")", ver({ tipo: "falar_com", alvo: "Zelinda" }, { cidadeAtual: RIO, npcs: {}, falouCom: ["Ze"] }) === false);
  t("lixo no lugar da lista não estoura", tenta(() => ver(etapa, { ...foz, falouCom: "Delfina" }), "estourou") === false
    && tenta(() => ver(etapa, { ...foz, falouCom: [null, 3, {}] }), "estourou") === false);
}

sec("3. o marco da espinha fecha pela mesma porta");
{
  const esp = S.garantirEspinha({ estrutura: "jornada", atos: [{ ato: 0, marcos: [
    { id: "e|0|0", feitio: "procurar", titulo: "Encontrar Noé Laminado", quem: "Noé Laminado", onde: "A Botica", cidade: RIO, ehLugar: true, condicao: { tipo: "falar_com", alvo: "Noé Laminado" } },
  ] }] });
  const antes = JSON.stringify(esp);
  const semConversa = S.conferirEspinha(esp, { cidadeAtual: RIO, lugarAtual: MERCADO, npcs: {} }, ver);
  t("ANTES: no mercado, sem conversa, o marco fica de pé", semConversa.cumpridos.length === 0);
  const comConversa = S.conferirEspinha(esp, { cidadeAtual: RIO, lugarAtual: MERCADO, npcs: {}, falouCom: ["Noé"] }, ver);
  t("falei com o Noé na cidade dele: o marco cai", comConversa.cumpridos.some((m) => m.id === "e|0|0"));
  const longe = S.conferirEspinha(esp, { cidadeAtual: ALTO, lugarAtual: null, npcs: {}, falouCom: ["Noé Laminado"] }, ver);
  t("falei com \"um Noé\" noutra cidade: o marco não cai (a cidade do marco)", longe.cumpridos.length === 0);
  t("a espinha gravada não muda (a cidade é emprestada à condição)", JSON.stringify(esp) === antes && !("cidade" in esp.atos[0].marcos[0].condicao));
}

sec("4. a fiação no App");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const corpoApos = (ancora) => {
    const ini = app.indexOf(ancora);
    if (ini < 0) return "";
    const abre = ini + ancora.length - 1;
    let prof = 0;
    for (let i = abre; i < app.length; i++) {
      if (app[i] === "{") prof++;
      else if (app[i] === "}") { prof--; if (prof === 0) return app.slice(abre, i + 1); }
    }
    return "";
  };
  /* onda 1 do custo (13/10): o Cronista ganhou o terceiro argumento (a frase e os envelopes do turno, para o gatilho) — a âncora segue a assinatura */
  const cronista = corpoApos("const cronistaDoTurno = async (pers, narrativa, doTurno) => {");
  /* 28/10 (T1-A, 9.ª fatia), MUDADA E O MOTIVO: a secção falou_com (o pedido e a conferência) saiu do
     cronistaDoTurno do App para src/motor/cronista-do-turno.js (o pedido em
     PEDIDO_DO_CRONISTA e oPedidoAoCronista, as secções em oAceitoDoCronista).
     O motor não se lê pelo texto (a catraca de teste-assercoes-de-texto):
     prova-se pelo valor exportado ou jogando a peça. */
  const CT = await import("../src/motor/cronista-do-turno.js");
  const jogarFalou = (aceito, proposta, conferir, missoesDepois) => {
    const efs = [], visto = []; let est = { missoes: ["antes"], espinha: null };
    const fim = CT.oAceitoDoCronista(aceito, [], proposta, { pers: { nome: "Vera", grupo: [] }, narrativa: "x", ler: () => est, aplicar: (x) => efs.push(...x),
      conferirCom: (p, o) => { visto.push(o); if (conferir) conferir(); if (missoesDepois) est = { ...est, missoes: missoesDepois }; return p; } });
    return { fim, efs, visto };
  };
  t("o Cronista pede falou_com, e diz que citar não é falar", CT.PEDIDO_DO_CRONISTA.includes("SEÇÃO falou_com") && CT.PEDIDO_DO_CRONISTA.includes("citado, lembrado, procurado"));
  /* T1-A, 2.ª fatia (27/10): a secção lê o `aceito` do juízo do motor
     (`ac.falou_com`), não a proposta crua (`r.falou_com`) */
  t("a resposta é lida numa seção isolada, com calou", (() => { const j1 = jogarFalou({ falou_com: ["Inocência Bordão"] }, { falou_com: ["Outro"] }); const j2 = jogarFalou({ falou_com: ["Inocência"] }, {}, () => { throw new Error("torta"); });
    return j1.visto.length === 1 && j1.visto[0].falouCom[0] === "Inocência Bordão" && jogarFalou({}, { falou_com: ["Outro"] }).visto.length === 0 && j2.efs.some((e) => e.tipo === "calou" && e.onde === "falou_com do Cronista"); })());
  /* a porta do App (portasDoCronista.conferirCom) põe a lista no ref, confere e tira-a no finally */
  /* MOVIDA NA FASE 4, trilha A (29/10), com o motivo: a porta conferirCom
     saiu do App para src/motor/depois-do-turno.js (a fábrica dos órgãos do
     depois; o App só a chama), e o texto do motor não se lê (a catraca de
     teste-assercoes-de-texto). A intenção prova-se jogando a peça
     (depois-bloco.mjs) numa cena gravada: com a conversa do turno a missão
     de falar fecha, com outro nome não, e depois a lista fica vazia — a
     conversa do falou_com, e o segredo na lista dele. O finally num órgão
     que estoura é o do App à letra, provado lado a lado contra o recorte em
     teste-motor-depois-do-turno.mjs. */
  const { jogarODepois, aCenaQueConfere, aqui } = await import("./depois-bloco.mjs");
  const falarComAna = { id: "mf", titulo: "Falar com Ana", tipo: "contrato", status: "ativa", dador: "Dador", etapas: [{ tipo: "falar_com", alvo: "Ana do Poço", onde: aqui(aCenaQueConfere()), feito: false }], recompensa: { moedas: 7, xp: 7 } };
  const conferiuCom = (o) => { const est = aCenaQueConfere({ missoes: [falarComAna] }); return jogarODepois("conferirCom", { estado: est, args: [est.personagem, o] }).escritas; };
  const comAna = conferiuCom({ falouCom: ["Ana do Poço"] }), comOutra = conferiuCom({ falouCom: ["Outra Pessoa"] }), comSegredo = conferiuCom({ segredos: ["o nome verdadeiro"] });
  t("a conferência corre ali, e a lista esvazia no finally", (comAna.missoes || [])[0].status === "concluida" && !comOutra.missoes
    && JSON.stringify(comAna.falouCom) === "[]" && JSON.stringify(comOutra.falouCom) === "[]" && JSON.stringify(comSegredo.segredosRevelados) === "[]" && !("falouCom" in comSegredo));
  t("o que a conferência mudou se grava (marca o turno para salvar)", jogarFalou({ falou_com: ["A"] }, {}, null, ["depois"]).fim.tocouElenco === true && jogarFalou({ falou_com: ["A"] }, {}).fim.tocouElenco === false);
  const mundo = corpoApos("const mundoDasMissoes = (persAtual) => {");
  t("o mundo das missões leva a conversa", /falouCom: falouComRef\.current \|\| \[\]/.test(mundo));
  t("o ref nasce vazio e não vai ao save", /const falouComRef = useRef\(\[\]\);/.test(app) && !/falouCom: falouComRef\.current, /.test(corpoApos("const salvar = useCallback((extra = {}) => {")));
}

sec("5. o molde do Cronista pede a conversa (a 13.ª sessão, 29/10)");
{
  /* «Encontrar Corrado» ficou feito: false a 13.ª inteira, com a heroína a
     falar com ele do T2 ao T5. A prova, com o save da sessão
     (`testes/sessao-s13-fecho.json`, o recorte que importa): o marco da
     espinha guarda o Corrado pelo fato, então só `falouCom` fecha a etapa —
     e o Cronista nunca o mandou, porque o molde JSON do pedido não tinha a
     chave (a proposta crua do T19 trouxe as dez chaves do molde, e só elas). */
  const CT = await import("../src/motor/cronista-do-turno.js");
  const linhas = String(CT.PEDIDO_DO_CRONISTA).split("\n");
  const molde = tenta(() => JSON.parse(linhas.find((l) => l.startsWith("{"))), {});
  t("o molde JSON do Cronista tem a chave falou_com, como lista", Array.isArray(molde.falou_com), Object.keys(molde).join(","));
  /* a catraca da classe: toda SEÇÃO do pedido está no molde, salvo as que são
     objeto-ou-nada (ausente = "nenhum"); uma lista que o código lê e o molde
     não pede é uma secção que nunca responde */
  const OBJETO_OU_NADA = ["missao_oferecida", "relogio_novo"];
  const secoes = [...new Set([...String(CT.PEDIDO_DO_CRONISTA).matchAll(/SEÇÃO ([a-z_]+)/g)].map((x) => x[1]))];
  const fora = secoes.filter((x) => !(x in molde) && !OBJETO_OU_NADA.includes(x));
  t(`toda SEÇÃO do pedido está no molde (${secoes.length} secções, ${OBJETO_OU_NADA.length} objeto-ou-nada)`, secoes.length >= 12 && fora.length === 0, fora.join(","));
  /* o save da 13.ª: com a conversa, a etapa fecha; sem ela, não */
  const s = JSON.parse(readFileSync(new URL("./sessao-s13-fecho.json", import.meta.url), "utf8"));
  const mundo = (extra) => ({ cidadeAtual: s.cidadeAtual, lugarAtual: { nome: "Largo da Liça", cidade: s.cidadeAtual }, npcs: s.npcs, dia: 1, soPeloFato: S.fatosQueFecham(s.espinha), falouCom: [], segredosRevelados: [], derrotados: [], inventario: [], equipamento: [], revelados: [], ...extra });
  const etapa = s.missoes[0].etapas[0];
  t("na 13.ª, o Corrado é guardado pelo fato: estar no Largo não fecha", S.fatosQueFecham(s.espinha).pessoas.includes("Corrado") && M.etapaDef("falar_com").ver(etapa, mundo()) === false);
  t("e a conversa vista fecha a principal", M.conferir(s.missoes, mundo({ falouCom: ["Corrado"] })).concluidas.length === 1);
}

function tenta(f, d) { try { return f(); } catch { return d; } }

console.log(`\nfalar com em cena: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
