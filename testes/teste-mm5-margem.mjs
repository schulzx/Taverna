/* teste-mm5-margem.mjs (Fase MM, etapa MM5) — o sucesso com preço

   Na runa de C1E1 o Matt diz a um 15 "recuas a tempo, mas levas 8": nem o
   sim limpo nem o não. Até o MM4 a casa tinha o raspão só do lado de baixo
   (falhar por 1–2 numa linha que aceita, v9.65); o MM5 o espelha para cima
   e põe a regra numa tabela — FAIXAS_DA_MARGEM, em `desafios.js`.

   Esta suíte prova:
   1. a tabela das faixas, e que ela cobre todo inteiro sem buraco;
   2. as bordas exatas (−3, −2, −1, 0, +1, +2) e o lixo;
   3. o crítico e o desastre nunca são o meio;
   4. a conta que justifica a faixa, face a face, sem Math.random;
   5. os preços por linha, e que todo preço do meio é MECÂNICO;
   6. a mordida — dado do degrau, determinística por semente;
   7. quem não tem meio (luta, busca vazia, social, perceber);
   8. o envelope do teste nos três desfechos;
   9. a regressão: sem meio, o texto é o de sempre;
   10. A Aposta com três versões, e o teto da pauta;
   11. A FIAÇÃO — o App chama a margem (não mais a falha sozinha), com
       crítico e desastre chegando de verdade, o meio no envelope, o
       custo sem duplicar, e o raspão na mesa. */
import {
  lerAcao, desfechoDaMargem, desfechoDaFalha, faixaDaMargem, FAIXAS_DA_MARGEM,
  MORDIDA_POR_DEGRAU, mordidaDoDegrau, CUSTO_DE_FALHAR, custoPorAlvo, DIFICULDADES,
  falaDoCusto, envelopeDoCusto,
} from "../src/desafios.js";
import { envelopeDoTeste } from "../src/testes.js";
import { SITUACOES, apostas, situacaoPorId } from "../src/mesa-posta.js";
import { SECOES, textoDaPauta, porNaPauta, TETO_DA_PAUTA } from "../src/pauta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const heroi = { nivel: 3, inventario: [], habilidades: [], equipado: {} };
const base = { personagem: heroi, semente: "mm5", lugar: "a cripta de Vasselheim", tentativas: {}, dia: 3 };
const ler = (f, extra = {}) => lerAcao(f, { ...base, ...extra });

sec("1. a tabela das faixas");
{
  t("quatro faixas, na ordem de cima para baixo",
    FAIXAS_DA_MARGEM.map((f) => f.id).join(",") === "limpo,mas,quase,falha");
  /* cobre todo inteiro de −40 a +40, e cada um cai em UMA faixa só */
  let buraco = [], dupla = [];
  for (let m = -40; m <= 40; m++) {
    const n = FAIXAS_DA_MARGEM.filter((f) => m >= f.de && m <= f.ate).length;
    if (n === 0) buraco.push(m);
    if (n > 1) dupla.push(m);
  }
  t("nenhuma margem sem faixa", buraco.length === 0, buraco.join(","));
  t("nenhuma margem em duas", dupla.length === 0, dupla.join(","));
  const meio = FAIXAS_DA_MARGEM.filter((f) => f.meio);
  t("o meio são duas faixas: a de cima e a de baixo da linha", meio.map((f) => f.id).join(",") === "mas,quase");
  /* simétrica: dois pontos de cada lado da linha que separa −1 de 0 */
  const larg = (f) => f.ate - f.de + 1;
  t("simétrica: dois pontos abaixo da linha, dois acima",
    larg(meio[0]) === 2 && larg(meio[1]) === 2 && meio[0].de === 0 && meio[1].ate === -1);
  t("o meio é sempre o sim (pago)", meio.every((f) => f.passou));
  t("e sem meio, o de cima volta a limpo e o de baixo a falha",
    FAIXAS_DA_MARGEM.find((f) => f.id === "mas").semMeio === "limpo" && FAIXAS_DA_MARGEM.find((f) => f.id === "quase").semMeio === "falha");
  t("toda faixa tem voz", FAIXAS_DA_MARGEM.every((f) => f.voz && f.voz.length > 3));
}

sec("2. as bordas exatas");
{
  const esperado = { "-3": "falha", "-2": "quase", "-1": "quase", "0": "mas", "1": "mas", "2": "limpo" };
  for (const [m, id] of Object.entries(esperado)) {
    const f = faixaDaMargem(Number(m));
    t(`margem ${Number(m) > 0 ? "+" : ""}${m} → ${id}`, f && f.id === id, f && f.id);
  }
  t("margem de texto numérico ainda conta ('0')", faixaDaMargem("0").id === "mas");
  for (const lixo of [null, undefined, "", "abc", NaN, {}]) {
    t(`lixo (${String(lixo)}) não cai em faixa nenhuma`, faixaDaMargem(lixo) === null);
  }
}

sec("3. o crítico e o desastre nunca são o meio");
{
  t("o 20 natural é limpo, mesmo abaixo da CD", faixaDaMargem(-5, { critico: true }).id === "limpo");
  t("e é limpo na conta exata", faixaDaMargem(0, { critico: true }).id === "limpo");
  t("o 1 natural é falha, mesmo raspando", faixaDaMargem(-1, { desastre: true }).id === "falha");
  t("e é falha mesmo por cima da CD (um +10 contra 13)", faixaDaMargem(+1, { desastre: true }).id === "falha");
  const tr = ler("arrombo a porta no braço");
  t("(fixture) arrombar tem custo de tabela", tr && tr.alvoDoCusto === "tranca");
  const d1 = desfechoDaMargem(tr, { total: tr.dc - 1, dc: tr.dc, desastre: true });
  t("o desastre que raspa paga o custo SECO — não o sim pago", d1 && d1.porPouco === false && d1.faixa === "falha");
  t("o crítico nunca tem custo", desfechoDaMargem(tr, { total: tr.dc - 4, dc: tr.dc, critico: true }) === null);
}

sec("4. a conta que justifica a faixa — face a face, sem sorteio");
{
  const conta = (mod, dc) => {
    const c = { limpo: 0, mas: 0, quase: 0, falha: 0 };
    for (let f = 1; f <= 20; f++) c[faixaDaMargem(f + mod - dc, { critico: f === 20, desastre: f === 1 }).id]++;
    return Object.fromEntries(Object.entries(c).map(([k, n]) => [k, n * 5]));
  };
  const tip = conta(3, 13);
  console.log(`      CD 13 contra +3: limpo ${tip.limpo}% · mas ${tip.mas}% · quase ${tip.quase}% · falha ${tip.falha}%`);
  t("o caso típico: 45 · 10 · 10 · 35", tip.limpo === 45 && tip.mas === 10 && tip.quase === 10 && tip.falha === 35);
  /* cada ponto de margem é UMA face: onde a faixa cabe inteira no dado
     (sem encostar no 1 nem no 20), o meio é sempre 20% — 10% de cada lado */
  let sempre = true;
  for (let k = 4; k <= 18; k++) {
    const c = conta(0, k);
    if (c.mas !== 10 || c.quase !== 10) sempre = false;
  }
  t("o meio é 20% (10 + 10) para toda CD − bônus de 4 a 18", sempre);
  t("e a maioria dos sucessos continua limpa no caso típico", tip.limpo > tip.mas + tip.quase);
  const alto = conta(10, 13);
  t("com +10 contra 13, o 1 natural encolhe o 'quase' para 5% (é falha)", alto.quase === 5 && alto.falha === 5);
  /* +0 contra 19: o 'mas' seria o 19 e o 20 — e o 20 é crítico */
  const duro = conta(0, 19);
  t("com +0 contra 19, o 20 natural sai do 'mas' (é limpo)", duro.mas === 5 && duro.limpo === 5);
}

sec("5. os preços por linha — todo meio tem preço escrito E cobrado");
{
  const comMeio = CUSTO_DE_FALHAR.filter((c) => c.porPouco);
  t("todo meio tem o preço numa frase de verdade", comMeio.every((c) => (c.preco || "").length > 20));
  /* "um preço que só a narração aplica é um preço que não existe" (v9.65):
     o meio só entra onde o código cobra alguma coisa */
  const soNarrado = comMeio.filter((c) => !(c.minutosExtra > 0 || c.minutosPorPouco > 0 || c.barulhoExtra || c.pelePorPouco));
  t("nenhum meio é só narrado — todo preço é tempo, barulho ou pele", soNarrado.length === 0, soNarrado.map((c) => c.alvo).join(","));
  const semMeio = ["escuta", "intuicao", "heraldica", "fraqueza", "improviso_percepcao"];
  t("o que só revela informação não tem meio", semMeio.every((a) => custoPorAlvo(a) && custoPorAlvo(a).porPouco === false));
  const novos = ["armadilha", "furtividade", "furto", "bicho", "improviso_forca", "improviso_destreza", "improviso_vigor", "improviso_intelecto", "improviso_presenca"];
  t("as linhas que ganharam meio no MM5", novos.every((a) => custoPorAlvo(a).porPouco === true));
  t("a furtividade e o furto pagam em barulho (pergunta ao oráculo)",
    custoPorAlvo("furtividade").barulhoExtra && custoPorAlvo("furto").barulhoExtra);
  t("a Força e a Presença improvisadas também", custoPorAlvo("improviso_forca").barulhoExtra && custoPorAlvo("improviso_presenca").barulhoExtra);
  t("a Destreza improvisada paga em mordida", custoPorAlvo("improviso_destreza").pelePorPouco.mordida === 1);
  t("o Vigor improvisado, em condição", custoPorAlvo("improviso_vigor").pelePorPouco.condicao === "enfraquecido");
  t("o Intelecto improvisado, em tempo só do meio (a seca não custa minuto)",
    custoPorAlvo("improviso_intelecto").minutosExtra === 0 && custoPorAlvo("improviso_intelecto").minutosPorPouco > 0);
  /* o exemplo do Matt: a armadilha */
  const arm = custoPorAlvo("armadilha");
  t("a armadilha: a seca morde com mais dados que o meio", arm.peleSeca.mordida > arm.pelePorPouco.mordida);
  t("nenhuma linha guarda mais o 2 fixo — pele de dano sai da mordida",
    CUSTO_DE_FALHAR.every((c) => !(c.pelePorPouco && c.pelePorPouco.dano) && !(c.peleSeca && c.peleSeca.dano)));
  /* o desfecho de cada linha com meio, na conta exata */
  const v = (alvo) => ({ alvoDoCusto: alvo, chave: "prova|" + alvo });
  let forma = [];
  for (const c of comMeio) {
    const d = desfechoDaMargem(v(c.alvo), { total: 15, dc: 15 });
    if (!d || d.faixa !== "mas" || d.porPouco !== true || d.diz !== c.preco) forma.push(c.alvo);
  }
  t("toda linha com meio devolve o 'mas' com o seu preço na conta exata", forma.length === 0, forma.join(","));
  const i = desfechoDaMargem(v("improviso_intelecto"), { total: 14, dc: 13 });
  t("o tempo do meio do Intelecto é cobrado no meio", i.minutosExtra === custoPorAlvo("improviso_intelecto").minutosPorPouco);
  const is = desfechoDaMargem(v("improviso_intelecto"), { total: 5, dc: 13 });
  t("e não na falha seca", is.minutosExtra === 0);
  const f = desfechoDaMargem(v("furtividade"), { total: 13, dc: 13 });
  t("o barulho do meio vai no desfecho", f.barulhoExtra === true);
  t("e não na falha seca", desfechoDaMargem(v("furtividade"), { total: 5, dc: 13 }).barulhoExtra === false);
}

sec("6. a mordida — um dado do degrau, determinístico");
{
  t("a tabela cobre todo degrau da régua", DIFICULDADES.every((d) => MORDIDA_POR_DEGRAU.some((m) => m.degrau === d.id)));
  const fs = DIFICULDADES.map((d) => mordidaDoDegrau(d.dc).faces);
  t("e nunca morde menos num degrau mais duro", fs.every((x, i) => i === 0 || x >= fs[i - 1]), fs.join(","));
  t("o comum morde 1d4 (média 2,5 — ao lado do 2 fixo de antes)", mordidaDoDegrau(13).faces === 4);
  t("o difícil não passa de 1d6 (um SIM não tira metade da vida de nível 1)", mordidaDoDegrau(18).faces === 6);
  const v = { alvoDoCusto: "armadilha", chave: "cripta|armadilha" };
  const a = desfechoDaMargem(v, { total: 15, dc: 15 });
  const b = desfechoDaMargem(v, { total: 15, dc: 15 });
  t("mesma tentativa, mesma mordida (semente)", a.pele.dano === b.pele.dano && a.pele.dado === "1d6");
  t("e o dano cabe no dado", a.pele.dano >= 1 && a.pele.dano <= 6);
  t("a sorte injetada manda: o menor", desfechoDaMargem(v, { total: 15, dc: 15, sorte: () => 0 }).pele.dano === 1);
  t("e o maior", desfechoDaMargem(v, { total: 15, dc: 15, sorte: () => 0.9999 }).pele.dano === 6);
  const s = desfechoDaMargem(v, { total: 9, dc: 15, sorte: () => 0.9999 });
  t("a armadilha seca: dois dados do degrau", s.pele.dado === "2d6" && s.pele.dano === 12);
  t("a frase do corpo viaja com o número", !!a.pele.diz && a.pele.mordida === undefined);
  /* varre semente: a média fica perto de 3,5 no 1d6 */
  let soma = 0;
  for (let i = 0; i < 600; i++) soma += desfechoDaMargem({ alvoDoCusto: "armadilha", chave: "k" + i }, { total: 15, dc: 15 }).pele.dano;
  const media = soma / 600;
  console.log(`      1d6 por semente, 600 tentativas: média ${media.toFixed(2)}`);
  t("a semente não vicia o dado (média entre 3 e 4)", media > 3 && media < 4);
}

sec("7. quem não tem meio");
{
  const tr = ler("arrombo a porta no braço");
  t("na luta, passar por um fio é limpo", desfechoDaMargem(tr, { total: tr.dc, dc: tr.dc, emCombate: true }) === null);
  const lc = desfechoDaMargem(tr, { total: tr.dc - 1, dc: tr.dc, emCombate: true });
  t("e falhar por um fio é seco", lc && lc.porPouco === false && lc.faixa === "falha");
  const busca = ler("reviro o quarto");
  t("(fixture) o quarto está vazio", busca && busca.fechaDepois === true);
  t("busca vazia: passar raspando é a certeza limpa", desfechoDaMargem(busca, { total: busca.dc, dc: busca.dc }) === null);
  const bq = desfechoDaMargem(busca, { total: busca.dc - 1, dc: busca.dc });
  t("e falhar raspando é não ter certeza (não 'você acha')", bq && bq.porPouco === false && bq.diz === custoPorAlvo("busca").seca);
  const soc = ler("tento convencer o guarda a me deixar passar");
  t("a conversa não tem custo de tabela — a escada do pedido é o preço", soc && desfechoDaMargem(soc, { total: soc.dc, dc: soc.dc }) === null);
  const perc = { alvoDoCusto: "improviso_percepcao", chave: "x" };
  t("perceber raspando é perceber", desfechoDaMargem(perc, { total: 13, dc: 13 }) === null);
  t("e não perceber raspando é não perceber", desfechoDaMargem(perc, { total: 12, dc: 13 }).porPouco === false);
  for (const [nome, v, o] of [
    ["veredito nulo", null, { total: 10, dc: 13 }], ["veredito vazio", {}, { total: 10, dc: 13 }],
    ["sem dificuldade", tr, { total: 10 }], ["dificuldade nula", tr, { total: 10, dc: null }],
    ["sem total", tr, { dc: 13 }], ["total lixo", tr, { total: "abc", dc: 13 }],
    ["opções nulas", tr, null],
  ]) {
    let r = "estourou";
    try { r = desfechoDaMargem(v, o === null ? undefined : o); } catch (e) { r = "estourou"; }
    t(`lixo: ${nome} → nenhum desfecho`, r === null);
  }
  t("desfechoDaFalha continua sem desfecho quando passa — nem pago", desfechoDaFalha(tr, tr.dc, tr.dc) === null);
}

sec("8. o envelope do teste nos três desfechos");
{
  const arm = ler("desarmo a armadilha");
  t("(fixture) desarmar tem meio", arm && arm.alvoDoCusto === "armadilha");
  const dc = arm.dc;
  const env = (total, valor, meio, extra = {}) => envelopeDoTeste({
    tipo: "destreza", pericia: "prestidigitacao", motivo: arm.rotulo, valor, mod: total - valor, total, dc,
    resultado: total >= dc || (meio && meio.porPouco) ? "sucesso" : "falha", critico: false, desastre: false, ...extra, meio,
  });
  const limpo = desfechoDaMargem(arm, { total: dc + 4, dc });
  const eLimpo = env(dc + 4, 12, limpo);
  console.log("      LIMPO: " + eLimpo.split("\n")[1].slice(0, 120) + "…");
  t("limpo: não há desfecho, e o envelope é o do sucesso de sempre", limpo === null && /eu PASSEI\. Revele UMA coisa/.test(eLimpo));
  const mas = desfechoDaMargem(arm, { total: dc, dc });
  const eMas = env(dc, 10, mas);
  console.log("      MAS:   " + eMas.split("\n")[1].slice(0, 200) + "…");
  t("mas: o resultado diz 'por um fio — com preço'", /SUCESSO\. POR UM FIO \(bati a dificuldade exata\) — COM PREÇO/.test(eMas));
  t("mas: as duas metades — o que aconteceu E o preço", eMas.includes("As duas metades") && eMas.includes(mas.diz));
  t("mas: nem sucesso limpo nem falha", /NÃO transforme em sucesso limpo/.test(eMas) && /nem em falha/.test(eMas));
  t("mas: o preço é este e nenhum outro", /não invente um maior, nem o dispense/.test(eMas));
  const mas1 = desfechoDaMargem(arm, { total: dc + 1, dc });
  t("mas por 1: 'passei por 1'", /POR UM FIO \(passei por 1\)/.test(env(dc + 1, 11, mas1)));
  const quase = desfechoDaMargem(arm, { total: dc - 2, dc });
  const eQuase = env(dc - 2, 8, quase);
  t("quase: o sim pago, e diz quanto faltou", /POR UM FIO \(faltaram 2\) — COM PREÇO/.test(eQuase) && eQuase.includes(quase.diz));
  const falha = desfechoDaMargem(arm, { total: dc - 6, dc });
  const eFalha = env(dc - 6, 4, falha);
  console.log("      FALHA: " + eFalha.split("\n")[1].slice(0, 120) + "…");
  t("falha: o desfecho seco não vira meio no envelope", falha.porPouco === false && /eu FALHEI/.test(eFalha) && !/POR UM FIO/.test(eFalha));
  /* o gesto (MM4): o meio diz que o gesto ACONTECE, e o preço */
  const gesto = envelopeDoTeste({ tipo: "destreza", motivo: "saltar do balcão", valor: 10, mod: 3, total: 13, dc: 13, resultado: "sucesso", gesto: true,
    meio: desfechoDaMargem({ alvoDoCusto: "improviso_destreza", chave: "balcao" }, { total: 13, dc: 13 }) });
  t("gesto no meio: o que declarei ACONTECE, e paga", /O que eu declarei ACONTECE \(saltar do balcão\)/.test(gesto) && gesto.includes(custoPorAlvo("improviso_destreza").preco));
  t("e não manda revelar coisa nenhuma", !/Revele UMA coisa/.test(gesto));
  /* a fala e o envelope do custo sabem das duas metades */
  t("a fala do 'mas' não diz 'Faltaram 0'", /Na conta exata/.test(falaDoCusto(mas)) && !/Faltaram/.test(falaDoCusto(mas)));
  t("a fala do 'mas' por 1 diz por quanto passou", /Passou por 1/.test(falaDoCusto(mas1)));
  t("a fala do 'quase' é a de sempre", falaDoCusto(quase) === `⚖ Faltaram 2 — e por tão pouco o mundo negocia: ${quase.diz}.`);
  const ec = envelopeDoCusto(mas, arm.rotulo);
  t("o envelope do custo do 'mas': passei por um fio, consigo mas pago", /passei no teste .* por um fio/.test(ec) && /EU CONSIGO — mas pago/.test(ec));
  t("e diz o que já foi cobrado, em número", new RegExp(`${mas.pele.dano} de vida`).test(ec) && /5 minutos no relógio/.test(ec));
  t("o envelope do custo do 'quase' continua dizendo que falhei por pouco", /Eu falhei por 2/.test(envelopeDoCusto(quase, arm.rotulo)));
}

sec("9. a regressão — sem meio, o texto é o de sempre");
{
  const base = { tipo: "percepcao", pericia: "percepcao", motivo: "notar o vulto", valor: 12, mod: 2, total: 14, dc: 13, resultado: "sucesso", critico: false, desastre: false, nivelTreino: "treinada" };
  const sem = envelopeDoTeste(base);
  t("meio nulo = meio ausente, letra por letra", envelopeDoTeste({ ...base, meio: null }) === sem);
  t("desfecho que não é o meio é ignorado", envelopeDoTeste({ ...base, meio: { porPouco: false, diz: "x", faixa: "falha" } }) === sem);
  t("meio sem preço é ignorado", envelopeDoTeste({ ...base, meio: { porPouco: true, faixa: "mas", margem: 1 } }) === sem);
  const meio = { porPouco: true, faixa: "mas", margem: 0, diz: "um preço qualquer de prova" };
  const falhou = { ...base, total: 5, resultado: "falha" };
  t("falha com meio = falha, letra por letra", envelopeDoTeste({ ...falhou, meio }) === envelopeDoTeste(falhou));
  const crit = { ...base, valor: 20, total: 22, critico: true };
  t("crítico com meio = crítico, letra por letra", envelopeDoTeste({ ...crit, meio }) === envelopeDoTeste(crit));
  const auto = { tipo: "forca", motivo: "erguer a caneca", mod: 9, dc: 10, resultado: "sucesso", automatico: true };
  t("automático com meio = automático, letra por letra", envelopeDoTeste({ ...auto, meio }) === envelopeDoTeste(auto));
  const gesto = { ...base, gesto: true };
  t("gesto sem meio = gesto de sempre", envelopeDoTeste({ ...gesto, meio: null }) === envelopeDoTeste(gesto));
}

sec("10. A Aposta — três versões, e o teto");
{
  const comMeio = SITUACOES.filter((s) => s.meio);
  console.log(`      ${comMeio.length}/${SITUACOES.length} situações com a terceira versão`);
  t("a maioria das situações ganha o raspão", comMeio.length >= 20);
  t("a conversa não tem raspão (a escada do pedido é o preço)", SITUACOES.filter((s) => s.grupo === "social").every((s) => !s.meio));
  t("toda situação continua com as duas de sempre", SITUACOES.every((s) => { const a = apostas(s); return a.sePassa.startsWith("passa: ") && a.seFalha.startsWith("falha: "); }));
  t("as duas de sempre não mudaram uma letra",
    SITUACOES.every((s) => apostas(s).sePassa === `passa: ${s.nome.toLowerCase()} — dê o resultado limpo, sem custo escondido.`));
  t("com meio, a terceira", comMeio.every((s) => /^passa por um fio: /.test(apostas(s).noMeio) && apostas(s).noMeio.includes(s.meio)));
  t("sem meio, a chave nem aparece", SITUACOES.filter((s) => !s.meio).every((s) => !("noMeio" in apostas(s))));
  t("apostas de lixo continua nula", apostas("nao_existe") === null && apostas(null) === null);

  /* o custo, medido: cada linha da pauta custa o texto + 14 */
  const custo = (s) => s.length + 14;
  const linhas = (s) => { const a = apostas(s); return ["Se " + a.sePassa, "Se " + a.seFalha, ...(a.noMeio ? ["Se " + a.noMeio] : [])]; };
  const antes = comMeio.map((s) => custo("Se " + apostas(s).sePassa) + custo("Se " + apostas(s).seFalha));
  const depois = comMeio.map((s) => linhas(s).reduce((a, l) => a + custo(l), 0));
  const extra = comMeio.map((s, i) => depois[i] - antes[i]);
  const maxExtra = Math.max(...extra), medExtra = Math.round(extra.reduce((a, b) => a + b, 0) / extra.length);
  const esc = situacaoPorId("escalar_muralha");
  console.log(`      secção mesa, escalar a muralha: ${antes[comMeio.indexOf(esc)]} → ${depois[comMeio.indexOf(esc)]} chars · o raspão custa em média ${medExtra}, no máximo ${maxExtra}`);
  t("o raspão custa menos de 150 caracteres da pauta", maxExtra < 150);

  /* A PAUTA CHEIA: toda secção com três linhas longas. A terceira linha da
     mesa não pode tirar nada de prioridade mais alta — e, pela regra do
     corte (prio + 0,1·i), ela é a linha de prio 4,2. */
  const longa = (id, i) => `${id} linha ${i} ` + "x".repeat(110);
  let cheia = {};
  for (const s of SECOES) if (s.id !== "mesa") cheia = porNaPauta(cheia, s.id, longa(s.id, 0), longa(s.id, 1), longa(s.id, 2));
  const a = apostas("escalar_muralha");
  const com2 = porNaPauta(cheia, "mesa", "Se " + a.sePassa, "Se " + a.seFalha);
  const com3 = porNaPauta(cheia, "mesa", "Se " + a.sePassa, "Se " + a.seFalha, "Se " + a.noMeio);
  const tx2 = textoDaPauta(com2), tx3 = textoDaPauta(com3);
  t("a pauta cheia continua no teto", tx2.length <= TETO_DA_PAUTA && tx3.length <= TETO_DA_PAUTA, `${tx2.length} / ${tx3.length}`);
  const prio = Object.fromEntries(SECOES.map((s) => [s.id, s.prio]));
  const empurradas = [];
  for (const s of SECOES) {
    if (s.id === "mesa") continue;
    for (let i = 0; i < 3; i++) {
      const p = prio[s.id] + i * 0.1;
      const l = longa(s.id, i);
      if (p < 4.2 && tx2.includes(l) !== tx3.includes(l)) empurradas.push(`${s.id}#${i}`);
    }
  }
  t("nada de prioridade mais alta que o raspão é empurrado", empurradas.length === 0, empurradas.join(","));
  t("a lei da falha (2.ª linha) entra antes do raspão", tx3.includes(a.seFalha) || !tx3.includes(a.noMeio));
  console.log(`      pauta cheia: com o raspão ${tx3.includes(a.noMeio) ? "DENTRO" : "fora (cortado pelo teto)"}, ${tx2.length} → ${tx3.length} chars`);

  /* numa pauta de turno comum (lugar, gente, momento, a fala) o raspão cabe */
  let comum = porNaPauta({}, "onde", "a cripta de Vasselheim, porta norte; escura, úmida");
  comum = porNaPauta(comum, "quem", "Grog, à porta; Pike, atrás com a tocha");
  comum = porNaPauta(comum, "momento", "a descoberta: a runa na soleira");
  comum = porNaPauta(comum, "mesa", "Se " + a.sePassa, "Se " + a.seFalha, "Se " + a.noMeio);
  const txc = textoDaPauta(comum);
  t("numa pauta comum, as três versões entram", txc.includes(a.sePassa) && txc.includes(a.seFalha) && txc.includes(a.noMeio));
}

/* 11. A FIAÇÃO — o corpo de `concluirRolagem` lido como TEXTO, nunca
   por linha (o endereço se mede pelo `indexOf`, não pelo número). Prova
   que o App: chama `desfechoDaMargem` (não mais `desfechoDaFalha` sozinha)
   com `critico` e `desastre` chegando de verdade — antes o desastre não
   chegava, e um 1 natural raspando podia virar sim pago, o que a seção 3
   proíbe —, que o `meio` chega ao envelope do teste, que o envelope do
   custo não duplica o que o meio já disse, e que a Aposta ganha a
   terceira versão na mesa. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

  t("o App importa desfechoDaMargem de desafios.js",
    /import\s*\{[^}]*\bdesfechoDaMargem\b[^}]*\}\s*from\s*"\.\/desafios\.js"/.test(app));

  const i = app.indexOf("const concluirRolagem = (");
  t("(fixture) concluirRolagem existe", i >= 0);
  const corpo = i >= 0 ? app.slice(i, i + 20000) : "";

  const kCusto = corpo.indexOf("const custo = des ");
  const linhaCusto = kCusto >= 0 ? corpo.slice(kCusto, corpo.indexOf(";", kCusto) + 1) : "";
  t("concluirRolagem chama desfechoDaMargem, não mais desfechoDaFalha sozinha",
    /desfechoDaMargem\(des,/.test(linhaCusto) && !/desfechoDaFalha/.test(linhaCusto), linhaCusto);
  t("e passa critico e desastre — o 1 natural raspando não pode virar sim pago",
    /\bcritico\b/.test(linhaCusto) && /\bdesastre\b/.test(linhaCusto), linhaCusto);

  const j = corpo.indexOf("envelopeDoTeste({");
  const chamada = j >= 0 ? corpo.slice(j, corpo.indexOf("})", j)) : "";
  t("concluirRolagem passa o meio ao envelope do teste",
    chamada.includes("meio: custo && custo.porPouco ? custo : null"), chamada.slice(0, 200));

  const kEnv = corpo.indexOf("envelopeDoCusto(custo,");
  const linhaEnv = kEnv >= 0 ? corpo.slice(Math.max(0, kEnv - 80), kEnv + 120) : "";
  t("o envelope do custo só entra na falha seca (o 'mas' já foi dito pelo meio)",
    /if \(custo && !custo\.porPouco\)/.test(linhaEnv), linhaEnv);
  t("e a queda (envQueda) continua entrando mesmo no sim pago",
    /else if \(envQueda\) env = /.test(linhaEnv), linhaEnv);

  const kApostas = app.indexOf("situacaoQueCasa(acaoDoTurno)");
  const trechoAposta = kApostas >= 0 ? app.slice(kApostas, kApostas + 300) : "";
  t("a Aposta põe a terceira versão (o raspão) na mesa, quando ela existe",
    trechoAposta.includes('ap.noMeio ? "Se " + ap.noMeio : ""'), trechoAposta);
}

console.log(`\nmargem MM5: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
