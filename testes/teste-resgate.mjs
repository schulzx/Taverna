/* A QUEST VERIFICÁVEL (v9.132) — fase 3 do plano

   O relato que abriu tudo: o Mestre deu uma missão de resgatar alguém, vivo
   ou morto, num lugar. O herói foi até lá — e o sistema deu a missão por
   cumprida, sem ninguém ali.

   A v9.128 achou uma causa e consertou: `garantirMissoes` fazia todo tipo
   desconhecido cair em `ir_a`, a única etapa que se cumpre só de andar. Só
   que a correção NUNCA CHEGOU AO CAMINHO QUE IMPORTAVA. Na porta do Mestre,
   `aceitarProposta` filtrava por `ETAPAS[e.tipo]` ANTES — e ali a etapa
   desconhecida não virava outra coisa: ela DESAPARECIA. O Mestre escrevia
   `{tipo:"resgatar"}`, a etapa sumia, sobrava o `ir_a` do lugar, e a missão
   fechava na chegada.

   Esta suíte defende as três coisas que a fase 3 trouxe:
   · a etapa de resgate, cuja condição é a mudança de SITUAÇÃO da fase 2;
   · a porta do Mestre, que traduz em vez de descartar — e que não deixa uma
     missão feita só de chegadas se fechar sozinha;
   · e a FALHA descrita: até aqui só o prazo fazia uma missão fracassar. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const APP = readFileSync("../src/App.jsx", "utf8").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const M = await import(S + "missoes.js");
const B = await import(S + "mundo-base.js");

let bons = 0, maus = 0;
const t = (nome, cond) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);
const MUNDO = { cidadeAtual: "", lugarAtual: null, npcs: {}, derrotados: [], inventario: [], equipamento: [], revelados: [], dia: 1, relogios: [], base: null };

sec("1. A ETAPA DE RESGATE LÊ A SITUAÇÃO");
{
  const e = { tipo: "resgatar", alvo: "Ione" };
  const ver = (base) => M.etapaDef("resgatar").ver(e, { ...MUNDO, base });
  t("presa não está resgatada", !ver(B.porSituacao(null, "Ione", B.SITUACOES.cativa)));
  t("ferida também não", !ver(B.porSituacao(null, "Ione", B.SITUACOES.ferida)));
  t("livre está", ver(B.porSituacao(null, "Ione", B.SITUACOES.livre)));
  t("morta NÃO conta como resgatada", !ver(B.porSituacao(null, "Ione", B.SITUACOES.morta)));
  /* e chegar ao lugar continua sem cumprir nada — foi disso que tudo veio */
  t("estar no lugar não resgata ninguém", !M.etapaDef("resgatar").ver(e, { ...MUNDO, cidadeAtual: "A Fossa", lugarAtual: "A Fossa", base: B.porSituacao(null, "Ione", B.SITUACOES.cativa) }));
  t("a etapa se descreve", /Ione/.test(M.textoDaEtapa(e)));
}

sec("2. A PORTA DO MESTRE TRADUZ, EM VEZ DE DESCARTAR");
{
  /* era aqui que a etapa sumia */
  const r = M.aceitarProposta([], {
    titulo: "Tirar Ione da Fossa", dador: "Vantel",
    etapas: [{ tipo: "ir_a", alvo: "Prata Velha" }, { tipo: "resgatar", alvo: "Ione" }],
  }, { nivel: 3, dia: 1, dadorPresente: false });
  t("a proposta é aceita", r.ok === true);
  t("e a etapa de resgate SOBREVIVEU", !!r.missao && r.missao.etapas.some((e) => e.tipo === "resgatar"));
  t("o `ir_a` continua lá como ponto de passagem", r.missao.etapas.some((e) => e.tipo === "ir_a"));
  /* A PREMISSA VIRA ESTADO: sem isto a etapa nasceria cumprida, porque todo
     mundo é `livre` por omissão — inclusive quem nunca foi levado */
  t("a missão pede o cativeiro de quem será resgatado", (r.cativeiros || []).some((c) => c.nome === "Ione" && c.situacao === "cativa"));

  /* o adjetivo continua barrado: era o filtro antigo que fazia isso, e
     traduzir tudo teria aberto essa porta de novo */
  const adj = M.aceitarProposta([], { titulo: "A confiança do barão", etapas: [{ tipo: "ganhar_confianca", alvo: "o barão" }] }, { nivel: 1, dia: 1 });
  t("adjetivo não vira missão", adj.ok === false);
}

sec("3. CHEGAR NÃO FECHA UMA MISSÃO DO MESTRE");
{
  const so = M.aceitarProposta([], { titulo: "Vá à cabana", dador: "X", etapas: [{ tipo: "ir_a", alvo: "a cabana", lugar: true }] }, { nivel: 1, dia: 1, dadorPresente: false });
  /* esta casa APARA proposta torta em vez de devolvê-la — o Mestre sugere, o
     código decide. Então ela entra, mas entra como LEGADO: o sistema não a
     fecha sozinha, e quem encerra é o jogador. */
  t("a missão só-de-chegar entra", so.ok === true);
  t("mas nasce legado, e o sistema não a fecha", so.missao.legado === true);
  const chegou = M.conferir([{ ...so.missao, status: "ativa" }], { ...MUNDO, lugarAtual: "a cabana" });
  t("chegar avança a etapa", chegou.avancos.length === 1);
  /* uma missão de trama do SISTEMA, de viagem legítima, continua fechando —
     a regra vale só na porta do Mestre */
  const trama = M.criarMissao({ titulo: "Ir a Prata Velha", tipo: "principal", etapas: [{ tipo: "ir_a", alvo: "Prata Velha" }], nivel: 1, dia: 1 });
  t("a trama de viagem do sistema não vira legado", trama.legado === false);
}

sec("4. A FALHA DESCRITA");
{
  /* até aqui, a ÚNICA coisa que fazia uma missão fracassar era o prazo. Uma
     missão de resgate cuja pessoa morreu ficava ativa para sempre. */
  const m = M.criarMissao({ titulo: "Tirar Ione de lá", tipo: "favor", status: "ativa", etapas: [{ tipo: "resgatar", alvo: "Ione" }], nivel: 2, dia: 1 });
  const viva = M.conferir([m], { ...MUNDO, base: B.porSituacao(null, "Ione", B.SITUACOES.cativa) });
  t("presa: a missão segue ativa", viva.missoes[0].status === "ativa" && !viva.falhadas.length);
  const morta = M.conferir([m], { ...MUNDO, base: B.matar(null, "Ione") });
  t("morta: a missão FALHA", morta.missoes[0].status === "falhada");
  t("e a falha diz por quê", morta.falhadas.length === 1 && /morreu antes do resgate/.test(morta.falhadas[0].motivo));
  const salva = M.conferir([m], { ...MUNDO, base: B.porSituacao(null, "Ione", B.SITUACOES.livre) });
  t("livre: a missão conclui", salva.missoes[0].status === "concluida");
  /* a falha não pode comer as outras: uma missão sem `falha` na etapa segue
     exatamente como sempre seguiu */
  const outra = M.criarMissao({ titulo: "Matar o lobo", tipo: "favor", status: "ativa", etapas: [{ tipo: "derrotar", alvo: "lobo" }], nivel: 1, dia: 1 });
  const nada = M.conferir([outra], { ...MUNDO, base: B.matar(null, "Ione") });
  t("missão sem fim ruim próprio não fracassa por tabela", nada.missoes[0].status === "ativa" && !nada.falhadas.length);
}

sec("5. LIGADA AO JOGO");
{
  t("a base chega ao conferidor", /base: baseMundoRef\.current,/.test(APP));
  t("o cativeiro pedido pela missão é aplicado", /for \(const c2 of \(r\.cativeiros \|\| \[\]\)\)/.test(APP));
  t("com a situação e o lugar", /porSituacao\(baseMundoRef\.current, c2\.nome, c2\.situacao, \{ onde: c2\.onde \}\)/.test(APP));
  t("a falha chega ao jogador", /✖ \$\{f\.missao\.titulo\} — \$\{f\.motivo\}/.test(APP));
  t("e ao Narrador como fato consumado", /\[MISSAO PERDIDA — RESOLVIDO PELO SISTEMA\]/.test(APP));
  t("sem segunda chance", /nao ofereca uma segunda chance/.test(APP));
}

console.log(`\nresgate v9.132: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
