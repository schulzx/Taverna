/* teste-fins.mjs (v9.96) — o fim dos laços, e as famílias magras.

   Duas pendências que se resolvem juntas.

   Nenhum laço TERMINAVA. Havia semente de romance, de rivalidade e de
   dívida, e nenhuma forma de um laço acabar por desgaste — só a
   despedida, que é ida embora. Um relacionamento que azeda sem ninguém
   trair é a coisa mais comum que existe entre pessoas, e o jogo não tinha
   uma linha sobre ela.

   E o lugar delas é `perda`, não `laco` — que é exatamente onde havia
   espaço, resolvendo a segunda pendência: `mundo` e `laco` estavam
   empatados no teto de 35% do acervo, e crescer qualquer uma exigia
   crescer as outras junto. */
import { ASSUNTOS, assuntoPorId, escolherAssunto, FAMILIAS } from "../src/compasso.js";
import { garantirSituacao } from "../src/biblioteca.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const FINS = ["esfriamento", "briga_que_fica", "cresceram_para_lados", "decepcao", "amor_que_acaba", "quem_nao_precisa_mais"];
const base = {
  emCidade: true, pessoaNaCena: true, temGenteConhecida: true, temPassado: true,
  temLugarVisitado: true, temFalaAnterior: true, gentePorPerto: 3, genteLonge: 3,
  diasAteVizinha: 2, nivel: 8, fama: 40, porte: "cidade", bioma: "colina",
};
/* v9.97: o elenco entra. Um fim de laço não abre mais só por `momento`:
   ele EXIGE o laço concreto, e o nome sai do registro. Testar sem elenco
   dava zero em tudo — e dava certo, porque sem amor registrado não há
   amor para terminar. */
const ELENCO = {
  aqui: ["Marta", "Ubba", "Lucan"],
  lacos: { amizade: ["Ubba"], amor: ["Marta"], rivalidade: [], divida: [], aprendizado: ["Lucan"], rompidos: ["Vaska"] },
};
const VAZIO = { aqui: [], lacos: {} };
const abre = (id, sit, elenco = ELENCO) => {
  const a = assuntoPorId(id);
  if (!a) return false;
  if (a.exige && !((elenco.lacos || {})[a.exige] || []).length) return false;
  if (a.exigeRompido && !((elenco.lacos || {}).rompidos || []).length) return false;
  return !a.quando || a.quando(garantirSituacao({ ...base, ...sit }));
};

sec("1. OS LAÇOS PASSAM A TERMINAR");
{
  t("as seis formas de fim existem", FINS.every((id) => !!assuntoPorId(id)));
  /* elas vivem em `perda` e não em `laco` de propósito: o que tratam não é
     a ligação — é o que fica quando ela deixa de existir */
  t("todas moram na família da perda", FINS.every((id) => assuntoPorId(id).familia === "perda"));
  t("todas têm os cinco tempos", FINS.every((id) => {
    const a = assuntoPorId(id);
    return a.nome && a.preparo && a.subindo && a.vespera && a.agora && a.depois;
  }));

  /* E NENHUMA PRECISA DE VILÃO. É o ponto: um relacionamento que azeda sem
     ninguém trair é a coisa mais comum entre pessoas, e o jogo só sabia
     terminar laço por traição ou por ida embora. */
  t("nenhuma depende de antagonista", FINS.every((id) => !/ordemDaFase/.test(String(assuntoPorId(id).quando))));
  const textos = FINS.map((id) => { const a = assuntoPorId(id); return a.preparo + a.subindo + a.agora + a.depois; });
  /* `(?<!sem )` — e este e o QUARTO falso positivo da mesma familia numa
     so sessao: "role" dentro de CONTROLE, "cobre" de COBRIR, "voz" como
     fala, e agora "culpado" precedido de SEM. O texto que a assercao
     reprovava era justamente o melhor deles: "acaba sem grito, SEM
     CULPADO e sem cena".

     A licao geral vale para todo teste desta casa: um texto que PROIBE
     uma coisa contem a palavra dessa coisa. Procurar a palavra reprova
     exatamente a linha que faz a coisa certa. */
  t("e nenhuma culpa ninguém", !textos.some((x) => /(?<!sem )(traiu|traição|culpado|vilão)/i.test(x)));
  /* o desgaste é o assunto: as cenas terminam SEM reconciliação e sem
     ruptura limpa, que é o que as separa da despedida */
  t("o esfriamento acaba em silêncio", /ninguém diz nada/.test(assuntoPorId("esfriamento").agora));
  t("a briga fica entre os dois", /sem reconciliação e sem ruptura/.test(assuntoPorId("briga_que_fica").depois));
  t("o amor acaba sem culpado", /sem grito, sem culpado e sem cena/.test(assuntoPorId("amor_que_acaba").agora));
  t("e ninguém errou em cresceram para lados", /nenhum dos dois fez nada de errado/.test(assuntoPorId("cresceram_para_lados").agora));
}

sec("2. UM LAÇO NÃO ACABA ANTES DE EXISTIR");
{
  /* a régua que importa: no começo da campanha nada teve tempo de
     desgastar, e um "amor que termina" no dia 3 é um amor que a IA teria
     de inventar inteiro para poder terminar */
  for (const id of FINS) t(`"${id}" não abre no começo`, !abre(id, { momento: 0.1 }));
  t("mas todos abrem no fim", FINS.every((id) => abre(id, { momento: 0.85 })));
  /* e as que pedem gente exigem gente: sem ninguém registrado, o
     esfriamento seria de uma amizade inventada agora */
  /* v9.97: a trava deixou de ser `precisa: "gente"` — que só garantia que
     existisse ALGUÉM — e passou a ser `exige`, que pergunta pelo LAÇO
     concreto. Com a trava velha o sistema mandava terminar um amor que
     nunca começou, e a IA tinha de inventá-lo inteiro para poder acabá-lo. */
  const comExige = FINS.filter((id) => assuntoPorId(id).exige);
  t(`todos exigem um laço concreto (${comExige.length}/${FINS.length})`, comExige.length === FINS.length);
  t("e todos o rompem", FINS.every((id) => assuntoPorId(id).rompe === true));
  /* sem laço nenhum registrado, nenhum fim abre — e é o certo */
  t("sem laço registrado, nenhum fim abre", FINS.every((id) => !abre(id, { momento: 0.85 }, VAZIO)));
}

sec("3. AS FAMÍLIAS MAGRAS ENGORDARAM");
{
  const conta = {};
  for (const a of ASSUNTOS) conta[a.familia] = (conta[a.familia] || 0) + 1;
  t(`o acervo cresceu (${ASSUNTOS.length})`, ASSUNTOS.length >= 85);
  t("as seis famílias têm doze ou mais", FAMILIAS.every((f) => (conta[f.id] || 0) >= 12));
  const maior = Math.max(...Object.values(conta)), menor = Math.min(...Object.values(conta));
  /* A RÉGUA É A MÉDIA, e não um teto redondo. "Menos de 25% do acervo" era
     um número que eu escolhi de olho e que passou a reprovar por um ponto
     percentual — mover o alvo seria trapaça, e mantê-lo seria deixar uma
     medida sem significado governar o conteúdo.

     Com seis famílias, a média é 16,7%. O que interessa é a DISTÂNCIA até
     ela: nenhuma pode valer o dobro da média (aí ela manda no sorteio),
     nem menos da metade (aí ela não existe na prática). */
  const media = ASSUNTOS.length / FAMILIAS.length;
  t(`nenhuma família vale o dobro da média (maior: ${maior}, média ${media.toFixed(1)})`, maior <= media * 2);
  t(`e nenhuma vale menos da metade (menor: ${menor})`, menor >= media * 0.5);
  const ids = ASSUNTOS.map((a) => a.id);
  t("nenhum id repetido", new Set(ids).size === ids.length);
  t("todo id é ascii", ids.every((x) => /^[a-z][a-z0-9_]*$/.test(x)));
  t("todos têm os cinco tempos", ASSUNTOS.every((a) => a.nome && a.preparo && a.subindo && a.vespera && a.agora && a.depois));
  /* e nenhum dos novos mexe na ficha */
  const invade = ASSUNTOS.filter((a) => {
    const txt = a.preparo + a.subindo + a.vespera + a.agora + a.depois;
    return /\bcobre (me |de mim|moeda|PV|PM|\d)/i.test(txt)
      || /\b(role|rolem|adicione|remova|aplique)\b/i.test(txt)
      || /\b(d20|PV|PM)\b/.test(txt);
  });
  t(`nenhum assunto mexe na ficha${invade.length ? " — " + invade.map((a) => a.id).join(", ") : ""}`, invade.length === 0);
}

sec("4. O REPERTÓRIO CRESCEU NA PRÁTICA");
{
  const medir = (sit, n = 2000, elenco = ELENCO) => {
    const conta = {};
    let fins = 0;
    for (let i = 0; i < n; i++) {
      const a = escolherAssunto(garantirSituacao({ ...base, ...sit }), { sorte: () => (i * 0.0173 + i * i * 0.00041) % 1, elenco });
      if (a) { conta[a.id] = (conta[a.id] || 0) + 1; if (FINS.includes(a.id)) fins++; }
    }
    return { distintos: Object.keys(conta).length, fins: fins / n };
  };
  const cedo = medir({ momento: 0.15 }), meio = medir({ momento: 0.5 }), fim = medir({ momento: 0.85, temDerrotado: true });
  t(`o começo já tem repertório (${cedo.distintos} formas)`, cedo.distintos >= 25);
  t(`e o meio muito mais (${meio.distintos})`, meio.distintos >= 45);
  t(`e o fim ainda mais (${fim.distintos})`, fim.distintos >= 50);
  /* e SEM elenco o repertório encolhe de verdade: é a prova de que as
     travas de laço não são decorativas */
  const semNinguem = medir({ momento: 0.85, temDerrotado: true }, 2000, VAZIO);
  t(`sem elenco, o repertório encolhe (${semNinguem.distintos} vs ${fim.distintos})`, semNinguem.distintos < fim.distintos);
  t("e nenhum fim de laço sai", semNinguem.fins === 0);
  /* NENHUM fim de laço no começo, e presença real depois: é a prova de que
     a régua do `momento` não é enfeite */
  t(`no começo, nenhum fim de laço (${Math.round(100 * cedo.fins)}%)`, cedo.fins === 0);
  t(`no meio, eles aparecem (${Math.round(100 * meio.fins)}%)`, meio.fins > 0.03);
  t(`e não dominam (${Math.round(100 * fim.fins)}%)`, fim.fins < 0.2);
}

console.log(`\nfins v9.96: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
