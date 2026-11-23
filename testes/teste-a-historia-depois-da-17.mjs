/* teste-a-historia-depois-da-17.mjs — a história depois da décima sétima
   sessão do Mestre vivo (mente/lancamento/mestre-vivo-sessao-17.md)

   A quest fechou e rendeu XP, mas o jogador ficou 36 turnos sem saber o que
   fazer. A régua: o Narrador nunca sabe menos do que a tela mostra, e a tela
   nunca manda o jogador a um lugar ou pessoa a que ele não pode chegar.

     1. o passo cujo alvo está escondido aponta o caminho alcançável;
     2. o destino lê a trava da partida (e a varredura por molde);
     3. o teste de troca não vira carta de consulta;
     4. quem do elenco está noutro sítio desta cidade;
     5. o ofício no gênero da pessoa, e o papel da quest.

   Cada caso falha antes do conserto e passa depois. As funções são chamadas;
   nenhum texto de src/motor/ é lido. */
import { osPassosDasQuests } from "../src/a-quest-manda.js";
import { oRumoDaBusca, PROPOSTAS_DA_ABERTURA } from "../src/propostas-da-abertura.js";
import { aPonteDoPasso, A_PONTE_DO_PASSO } from "../src/motor/a-ponte-do-passo.js";
import { aMesaDasQuests } from "../src/motor/quests-do-turno.js";
import { oCaminhoAlcancavel, O_CAMINHO_ALCANCAVEL } from "../src/o-caminho-alcancavel.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ---------------- o estado da sessão 17 (só o que a quest lê) ----------------
   «As Chaves da Guarda», no passo 3 («Tirar quem paga a guarda por baixo da
   mesa de dentro de Balcão»): os passos 1 e 2 feitos, o servo (Godfrey) do
   vilão e nunca visto. `quartelNaCidade`: o papel do quartel caiu na própria
   cidade, como na sessão («de dentro de Balcão»). */
const CID = "Balcão do Degrau";
function papeisS17(quartelNaCidade) {
  return {
    quartel: quartelNaCidade
      ? { nome: CID, cidade: CID, tipo: "lugar", id: "cidade|balcao do degrau" }
      : { nome: "O Quartel do Degrau", cidade: CID, tipo: "lugar", id: "Balcão do Degrau|quartel" },
    capitao: { nome: "Brannoc Filho da Névoa", cidade: CID, ...(quartelNaCidade ? {} : { local: "O Quartel do Degrau" }), tipo: "pessoa", id: "npc|Brannoc Filho da Névoa" },
    sargento: { nome: "Hilda Passo-de-Gato", cidade: CID, tipo: "pessoa", id: "npc|Hilda Passo-de-Gato" },
    servo: { nome: "Godfrey Punho-de-Pedra", tipo: "pessoa", id: "" },
  };
}
function estadoS17(quartelNaCidade, mais) {
  const papeis = papeisS17(quartelNaCidade);
  return {
    espinha: {
      estrutura: "jornada", semente: "s17",
      esqueleto: { v: 1, estrutura: "jornada", semente: "s17", atos: [{ ato: 0, passo: 1, posicao: "cedo", maos: ["tenente"], cidade: CID, quest: "as_chaves_da_guarda", mao: "tenente", contra: [1, 2], papeis, fraqueza: false }], coracao: [], fraqueza: null, ordem: [{ id: "as_chaves_da_guarda", tipo: 1, ato: 0 }], semQuest: [], semContestacao: [] },
      quests: { v: 1, atos: [0], registos: [{ v: 1, id: "as_chaves_da_guarda", tipo: 1, inicio: 1, ultimoAvanco: 1, papeis, feitas: { chaves: { dia: 1, ramo: null, variante: null }, ronda: { dia: 1, ramo: null, variante: null } }, escolhas: {}, acesas: { chaves: 1, ronda: 1, servo: 1 }, reviravoltas: [], consequencias: [], estado: "aberta", motivo: null, desfecho: null, fecho: null, fechouEm: null }], fora: [], aplicadas: { as_chaves_da_guarda: 0 }, pesadas: [], passos: [], premissas: [], desfecho: null, fim: null },
    },
    historia: { estrutura: "jornada", etapa: 0, marcos: 0, feitos: [], capitulo: 1, capitulos: [] },
    dia: 1, cidadeAtual: CID, factos: { v: 1, pessoas: {}, lugares: {} }, npcs: {}, quadro: { v: 1, cartas: {} },
    personagem: { nome: "Osric", grupo: [{ nome: "Loras" }] },
    mundo: { genero: "Fantasia medieval", molde: "torre" },
    ...(mais || {}),
  };
}
const ESCONDIDO = /godfrey|punho/i;

/* ============================================================ */
sec("1 · o passo cujo alvo está escondido aponta o caminho alcançável");
{
  for (const naCidade of [true, false]) {
    const S = estadoS17(naCidade);
    const passos = osPassosDasQuests(S, { mundo: S.mundo });
    const p = passos[0];
    const rot = naCidade ? "(o quartel é a cidade)" : "(o quartel é um sítio)";
    t(`o passo 3 traz o caminho: perguntar ao capitão e vasculhar o quartel ${rot}`,
      !!(p && p.caminho && /perguntar a Brannoc/.test(p.caminho.texto) && /vasculhar/.test(p.caminho.texto)), p && JSON.stringify(p.caminho));
    t(`o caminho não diz quem é o escondido ${rot}`, !!(p && p.caminho) && !ESCONDIDO.test(JSON.stringify(p.caminho)));
    const mesa = aMesaDasQuests(S, { mundo: S.mundo });
    t(`a linha «O PASSO» da pauta diz o caminho ${rot}`, !!(mesa && /falta perguntar a Brannoc/.test(mesa.passo || "")), mesa && mesa.passo);
    t(`…e não diz o nome do escondido ${rot}`, !!(mesa && !ESCONDIDO.test(mesa.passo || "")));
    for (const aqui of ["", "A Feira"]) {
      for (const pres of [[], ["Brannoc Filho da Névoa"]]) {
        const e = { passos, aqui, cidade: CID, grupo: ["Loras"], presentes: pres };
        const r = oRumoDaBusca(e);
        const ponte = aPonteDoPasso(e);
        const rotulo = `${rot}, herói ${aqui || "sem sítio"}, Brannoc ${pres.length ? "em cena" : "longe"}`;
        t(`há botão ${rotulo}`, !!(r && r.verbo), JSON.stringify(r));
        if (pres.length) t(`com Brannoc em cena, o botão é falar com ele ${rotulo}`, !!(r && r.acao === "falar" && /Brannoc/.test(r.nome)));
        else if (naCidade) t(`com o quartel nesta cidade, o botão é vasculhar onde se está ${rotulo}`, !!(r && r.acao === "vasculhar" && r.frase === PROPOSTAS_DA_ABERTURA.vasculhar.frase));
        else t(`com o quartel noutro sítio, o botão leva ao quartel ${rotulo}`, !!(r && r.acao === "ir" && /Quartel/.test(r.nome)));
        t(`a ponte diz o caminho ${rotulo}`, ponte.includes("o caminho: perguntar a Brannoc"), ponte);
        t(`a ponte cabe no teto e não nomeia o escondido ${rotulo}`, ponte.length <= A_PONTE_DO_PASSO.teto && !ESCONDIDO.test(ponte));
      }
    }
  }
  /* depois de visto, o alvo direto deixa de estar escondido: o passo é o de sempre */
  const S = estadoS17(true, { factos: { v: 1, pessoas: { "npc|Godfrey": { nome: "Godfrey Punho-de-Pedra", visto: { de: 1, ate: 1, vezes: 1 } } }, lugares: {} } });
  const visto = osPassosDasQuests(S, { mundo: S.mundo })[0];
  t("o servo visto: sem caminho de desvio (ou o escondido já não manda)", !!visto && (visto.caminho == null || !visto.caminho.passos.some((x) => x.papel === "servo")));
  /* a regra vale para todo passo com alternativa: uma falta de mentira */
  const pes = (papel, nome, predicado) => ({ predicado, args: [{ papel, tipo: "pessoa", nome }], texto: "" });
  const lug = (papel, nome, predicado) => ({ predicado, args: [{ papel, tipo: "lugar", nome }], texto: "" });
  const falta = [{ predicado: "algum", opcoes: [[pes("vilao", "X", "derrotou")], [pes("velha", "Ama Velha", "conversou"), lug("poco", "O Poço", "esteve")]] }];
  const c = oCaminhoAlcancavel(falta, { escondido: (a) => a.args[0].papel === "vilao" });
  t("qualquer passo com alternativa: o ramo sem o escondido vira caminho", !!c && c.texto === "falar com Ama Velha e ir até O Poço", c && c.texto);
  t("sem escondido, não há desvio (o passo é o de sempre)", oCaminhoAlcancavel(falta, { escondido: () => false }) === null);
  t("todo verbo do caminho tem {nome}", Object.values(O_CAMINHO_ALCANCAVEL.verbos).every((v) => v.includes("{nome}")));
}

/* ============================================================ */
console.log(`\na história depois da 17: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
