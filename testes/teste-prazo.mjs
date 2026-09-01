/* O PRAZO QUE JÁ NASCE VENCIDO (v9.141)

   Numa campanha de prova, a primeira missão do jogo apareceu assim:

     ⏳ Ficar de olho em Fogo do Patamar: Sobreviver até o dia 0 ✓ (1/1)
     ✦ MISSÃO CONCLUÍDA — +57 moedas · +89 XP

   Nasceu e se cumpriu no mesmo turno, e pagou. A causa é a cicatriz do nome
   na origem: `tramas.js` escrevia `dias: 1` querendo dizer "aguente um dia a
   partir de agora"; `missoes.js` lia `dia`, absoluto; a normalização punha
   `Number(undefined) || 0` e o resultado era um prazo no passado. Ninguém
   reclamou porque os dois lados estavam sintaticamente corretos.

   Esta suíte defende as duas metades: que o relativo exista e seja resolvido
   onde se sabe o "hoje", e que NENHUMA missão do jogo possa nascer cumprida
   — que é a família do defeito, e não a instância. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const M = await import(S + "missoes.js");
const T = await import(S + "tramas.js");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

sec("1. O PRAZO RELATIVO EXISTE, E É RESOLVIDO ONDE SE SABE O HOJE");
{
  const m = M.criarMissao({ titulo: "Vigia", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dias: 1 }] });
  t("a missão nasce", !!m);
  t("e o prazo virou data", m.etapas[0].dia === 8);
  t("o texto diz a data certa", /dia 8/.test(M.textoDaEtapa(m.etapas[0])));
  /* quem já sabe a data absoluta continua mandando nela */
  const abs = M.criarMissao({ titulo: "Longa", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 30 }] });
  t("o absoluto continua valendo", abs.etapas[0].dia === 30);
  /* e o relativo não atropela o absoluto quando os dois vêm juntos */
  const dois = M.criarMissao({ titulo: "Ambos", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 30, dias: 1 }] });
  t("o absoluto ganha do relativo", dois.etapas[0].dia === 30);
}

sec("2. NENHUMA MISSÃO NASCE CUMPRIDA");
{
  const m = M.criarMissao({ titulo: "Vigia", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dias: 1 }] });
  t("no dia em que nasceu, não está feita", M.conferir([m], { dia: 7 }).concluidas.length === 0);
  t("no dia seguinte, está", M.conferir([{ ...m, status: "ativa" }], { dia: 8 }).concluidas.length === 1);
  /* a catraca: prazo no passado não vira etapa, e some ANTES do conferente */
  t("prazo no dia de hoje é recusado", M.criarMissao({ titulo: "X", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 7 }] }) === null);
  t("prazo no passado é recusado", M.criarMissao({ titulo: "X", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 3 }] }) === null);
  t("e o zero, que era o caso real, também", M.criarMissao({ titulo: "X", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 0 }] }) === null);
  /* uma missão que perde a única etapa não nasce: melhor não existir do
     que existir mentindo sobre o que pede */
  t("missão que fica sem etapa não nasce", M.criarMissao({ titulo: "X", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 1 }] }) === null);
  /* mas se sobrar outra etapa, a missão vive */
  const meio = M.criarMissao({ titulo: "X", tipo: "favor", dia: 7, etapas: [{ tipo: "aguentar", dia: 1 }, { tipo: "ir_a", alvo: "Aldoria" }] });
  t("mas com outra etapa, vive", !!meio && meio.etapas.length === 1 && meio.etapas[0].tipo === "ir_a");
}

sec("3. A FAMÍLIA DO DEFEITO, E NÃO A INSTÂNCIA");
{
  /* Toda trama do jogo, montada com material de verdade e passada por
     `criarMissao` como o App a passa. Duas coisas se medem: que a missão
     NASÇA (nenhuma etapa é engolida pela normalização por causa de um nome
     de campo que o leitor não lê) e que ela NÃO ESTEJA PRONTA no dia em que
     nasceu.

     É esta prova que quebra da próxima vez que alguém escrever um campo com
     o nome errado — e ela quebra em TODAS as tramas de uma vez, em vez de
     esperar que um jogador tope com aquela. */
  const material = {
    pessoa: { nome: "Fina Da Rede", papel: "taverneira" },
    local: { nome: "Fogo do Patamar", tipo: "taverna" },
    cidade: { nome: "Aldoria", porte: "cidade" },
    criatura: { nome: "cão de rua mutante" },
    ermo: { nome: "as figueiras" },
    objeto: { nome: "a chave de bronze" },
    faccao: { nome: "a Companhia da Deriva" },
  };
  let montadas = 0, natimortas = [], jaProntas = [];
  for (const v of T.VEICULOS) {
    let corpo = null;
    try { corpo = v.montar(material); } catch { continue; }
    if (!corpo || !Array.isArray(corpo.etapas) || !corpo.etapas.length) continue;
    montadas++;
    const HOJE = 7;
    const m = M.criarMissao({ titulo: corpo.titulo || v.id, tipo: "favor", descricao: corpo.descricao || "", dia: HOJE, status: "ativa", etapas: corpo.etapas });
    if (!m) { natimortas.push(v.id); continue; }
    const r = M.conferir([m], {
      dia: HOJE, cidadeAtual: "", npcs: {}, inventario: [], equipamento: [], derrotados: [], revelados: [],
    });
    if (r.concluidas.length) jaProntas.push(`${v.id}: ${m.etapas.map((e) => M.textoDaEtapa(e)).join(" / ")}`);
  }
  t("há tramas de verdade para medir", montadas >= 5);
  t(`nenhuma trama nasce morta na normalização (${natimortas.join(", ") || "—"})`, natimortas.length === 0);
  t(`nenhuma trama nasce cumprida (${jaProntas.join(" | ") || "—"})`, jaProntas.length === 0);
}

sec("4. O PRODUTOR E O LEITOR FALAM A MESMA LÍNGUA");
{
  /* o caso concreto: a trama "vigia" escrevia `dias` e o leitor lia `dia` */
  const vigia = T.VEICULOS.find((v) => v.id === "vigia");
  t("a trama do vigia existe", !!vigia);
  const corpo = vigia.montar({ pessoa: { nome: "Fina" }, local: { nome: "Fogo do Patamar" } });
  t("e ainda pede espera", corpo.etapas[0].tipo === "aguentar");
  const m = M.criarMissao({ titulo: corpo.titulo, tipo: "favor", dia: 1, status: "ativa", etapas: corpo.etapas });
  t("agora ela nasce", !!m);
  t("com prazo no futuro", m.etapas[0].dia > 1);
  /* e o texto que o jogador lê deixou de ser a mentira do dia 0 */
  t("e o diário não diz mais 'dia 0'", !/dia 0/.test(M.textoDaEtapa(m.etapas[0])));
  t("nem se conclui no turno em que nasceu", M.conferir([m], { dia: 1 }).concluidas.length === 0);
}

console.log(`\nprazo v9.141: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
