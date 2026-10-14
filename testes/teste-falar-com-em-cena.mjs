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
  t("o Cronista pede falou_com, e diz que citar não é falar", /SEÇÃO falou_com/.test(cronista) && /citado, lembrado, procurado/.test(cronista));
  t("a resposta é lida numa seção isolada, com calou", /r\.falou_com/.test(cronista) && /calou\("falou_com do Cronista"/.test(cronista));
  t("a conferência corre ali, e a lista esvazia no finally", /falouComRef\.current = falou;\s*try \{ p = conferirAsMissoes\(p\) \|\| p; \} finally \{ falouComRef\.current = \[\]; \}/.test(cronista));
  t("o que a conferência mudou se grava (marca o turno para salvar)", /missoesRef\.current !== antesM \|\| espinhaRef\.current !== antesE\) tocouElenco = true/.test(cronista));
  const mundo = corpoApos("const mundoDasMissoes = (persAtual) => {");
  t("o mundo das missões leva a conversa", /falouCom: falouComRef\.current \|\| \[\]/.test(mundo));
  t("o ref nasce vazio e não vai ao save", /const falouComRef = useRef\(\[\]\);/.test(app) && !/falouCom: falouComRef\.current, /.test(corpoApos("const salvar = useCallback((extra = {}) => {")));
}

function tenta(f, d) { try { return f(); } catch { return d; } }

console.log(`\nfalar com em cena: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
