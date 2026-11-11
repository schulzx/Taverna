/* teste-em-saber-e-margem.mjs (Fase EM, EM3 e EM4 · 10/11/2026) — os
   números do estudo do Mestre (mente/estudo-do-mestre.md, L4 e L6) no motor
   da MC.

   EM3 · saber comum não se rola. O que a ficha do herói já sabe (o sítio
   onde está, a terra, o ofício, o livro de factos, os sítios por onde
   passou) sai como facto, sem dado; o dado fica para o raro
   (motor/o-mestre-chama.js: SABER_COMUM, SABER_DO_OFICIO, saberComumDe, a
   linha «saberComum» de QUANDO_O_MESTRE_CHAMA).

   EM4 · a falha por pouco dá meia-verdade. Numa linha de saber, falhar por
   1 a MARGEM_DA_FALHA.ate dá um pedaço verdadeiro e o resto em falta; por
   mais, o preço avisado (desafios.js: MARGEM_DA_FALHA, `comMeiaVerdade`). A
   prova dos dez mil do MC2 continua verdade nos dois ramos. */
import { lerAcao, comoSeDiz, DESAFIOS, CUSTO_DE_FALHAR, DIFICULDADES, MARGEM_DA_FALHA, desfechoDaMargem, desfechoDaFalha, efeitosCobrados, falaDoCusto, envelopeDoCusto } from "../src/desafios.js";
import { oChamado, porQueNaoChama, QUANDO_O_MESTRE_CHAMA, SABER_COMUM, SABER_DO_OFICIO, saberComumDe, envelopeDoSaberComum } from "../src/motor/o-mestre-chama.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { envelopeDoTeste } from "../src/testes.js";
import { rngDe } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const base = { personagem: { nivel: 1, inventario: [], habilidades: [], equipado: {} }, semente: "em|saber", lugar: "Foz do Meio", tentativas: {}, dia: 2 };
const ler = (f) => lerAcao(f, base);
const saber = { lugar: "Foz do Meio", terra: "Alto Negro", antecedente: "soldado", factos: ["Teodoro", "a Agulha de Sal"], visitados: ["Quebrado do Leste"] };

sec("1. EM3 — a tabela");
{
  t("a linha «saberComum» está na régua do chamado, com porquê e o que acontece em vez", QUANDO_O_MESTRE_CHAMA.some((r) => r.id === "saberComum" && r.porque && r.emVez));
  t("as cinco fontes, cada uma com o campo que lê e o que diz", SABER_COMUM.fontes.length === 5 && SABER_COMUM.fontes.every((f) => f.id && f.campo && f.diz));
  const semOficio = ANTECEDENTES.map((a) => a.id).filter((id) => !(SABER_DO_OFICIO[id] || []).length);
  t(`todo antecedente ensina um vocabulário${semOficio.length ? " — faltam: " + semOficio.join(", ") : ""}`, semOficio.length === 0);
  t("e nenhum ofício inventa antecedente que não existe", Object.keys(SABER_DO_OFICIO).every((id) => ANTECEDENTES.some((a) => a.id === id)));
  t("as palavras do ofício já vêm sem acento (casam com o assunto normalizado)", Object.values(SABER_DO_OFICIO).every((l) => l.every((w) => w === w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase())));
  t("o alvo do estudo: 78% do saber e 90% dos factos sem dado", SABER_COMUM.alvo.saberSemDado === 0.78 && SABER_COMUM.alvo.factoSemDado === 0.9);
}

sec("2. EM3 — o que a ficha sabe sai como facto");
{
  const casos = [
    ["O que sei de Foz do Meio?", "aqui"],
    ["O que eu sei desta cidade?", "aqui"],
    ["O que sei de Alto Negro?", "terra"],
    ["O que sei sobre a guarnição do porto?", "oficio"],
    ["Já ouvi falar do Teodoro?", "livro"],
    ["O que sei da Agulha de Sal?", "livro"],
    ["O que lembro de Quebrado do Leste?", "visto"],
  ];
  for (const [f, fonte] of casos) {
    const v = ler(f);
    const sc = saberComumDe(v, { saber });
    t(`«${f}» → facto sem dado (${fonte})`, v && v.id === "lembrar" && sc && sc.fonte === fonte && porQueNaoChama(v, { saber }) === "saberComum" && oChamado(v, { saber }) === null, sc ? sc.fonte : "chama");
  }
  const env = envelopeDoSaberComum(ler("O que sei de Alto Negro?"), saberComumDe(ler("O que sei de Alto Negro?"), { saber }));
  t("o envelope diz que não houve dado, e de onde vem o saber", /SEM DADO/.test(env) && /da minha terra/.test(env) && /NÃO revele segredo/.test(env));
  t("e sem saber comum não há envelope", envelopeDoSaberComum(ler("O que sei de Alto Negro?"), null) === "");
}

sec("3. EM3 — o raro continua a rolar");
{
  const raros = [
    "O que sei da Mantícora das Cinzas?",
    "O que sei do segredo de Foz do Meio?",
    "O que sei sobre a maldição de Alto Negro?",
    "O que sei de Vau das Gralhas?",
  ];
  for (const f of raros) {
    const v = ler(f);
    t(`«${f}» → o Mestre chama o dado`, v && v.tipo === "teste" && saberComumDe(v, { saber }) === null && oChamado(v, { saber }) !== null);
  }
  const v = ler("O que sei de Alto Negro?");
  t("sem ctx.saber, nada é comum — o comportamento de antes", saberComumDe(v, {}) === null && oChamado(v, {}) !== null && porQueNaoChama(v, { saber: null }) === null);
  t("o lixo não estoura", saberComumDe(null, { saber }) === null && saberComumDe({}, { saber }) === null && saberComumDe(v, null) === null && saberComumDe("x", "y") === null);
  t("a criatura (fraqueza) não é saber comum — é o bestiário", saberComumDe(ler("tento lembrar o que sei sobre esta criatura, alguma fraqueza"), { saber }) === null);
  t("o antecedente que não existe não ensina nada", saberComumDe(ler("O que sei sobre a guarnição do porto?"), { saber: { antecedente: "astronauta" } }) === null);
}

sec("4. EM3 — o saco do recém-chegado, contra o estudo");
{
  /* As perguntas de saber que um herói faz nas primeiras horas, numa cidade
     que é a dele (a 19.ª sessão é que mede a mesa de verdade): o que a
     régua decide de cada uma está escrito, e a proporção do saco tem de
     cair no alvo do estudo, a ±tolerância. */
  const heroi = { lugar: "Foz do Meio", terra: "Foz do Meio", antecedente: "naufrago", factos: ["Rosalina", "Teodoro", "o Sino Calado"], visitados: ["Alto do Sal"] };
  const saco = [
    ["O que sei de Foz do Meio?", false], ["O que sei desta cidade?", false], ["O que sei do porto?", false],
    ["O que sei da Rosalina?", false], ["Já ouvi falar do Teodoro?", false], ["O que sei do Sino Calado?", false],
    ["O que lembro de Alto do Sal?", false], ["O que sei dos navios que param aqui?", false], ["O que sei das marés desta costa?", false],
    ["O que sei de Alto Negro?", true], ["O que sei do segredo do Sino Calado?", true],
    ["O que sei da Mantícora das Cinzas?", true],
  ];
  let semDado = 0;
  const erros = [];
  for (const [f, rola] of saco) {
    const v = ler(f);
    const chama = v && v.tipo === "teste" && porQueNaoChama(v, { saber: heroi }) === null;
    if (!chama) semDado++;
    if (chama !== rola) erros.push(f);
  }
  t(`cada pergunta do saco decide como está escrito${erros.length ? " — " + erros.join(" | ") : ""}`, erros.length === 0);
  const frac = semDado / saco.length;
  const A = SABER_COMUM.alvo;
  t(`${semDado} em ${saco.length} sem dado (${(100 * frac).toFixed(0)}%), a ±${100 * A.tolerancia} pontos dos ${100 * A.saberSemDado}% do estudo`, Math.abs(frac - A.saberSemDado) <= A.tolerancia + 1e-9);
}

sec("5. EM4 — a tabela");
{
  t("meia-verdade até 3 de falta", MARGEM_DA_FALHA.ate === 3);
  const alvos = CUSTO_DE_FALHAR.map((c) => c.alvo);
  const fora = MARGEM_DA_FALHA.saber.filter((a) => !alvos.includes(a));
  t(`toda linha de saber existe em CUSTO_DE_FALHAR${fora.length ? " — fora: " + fora.join(", ") : ""}`, fora.length === 0);
  t("nenhum gesto de corpo é linha de saber (a escalada, o salto, o peso, o nado)", ["escalada", "salto", "peso", "nado", "equilibrio", "montaria"].every((a) => !MARGEM_DA_FALHA.saber.includes(a)));
}

sec("6. EM4 — dez mil falhas por linha, nos dois ramos");
{
  const r = rngDe("em4|dez-mil");
  const erros = [];
  let meias = 0, secas = 0, quases = 0, semOpcaoMeias = 0;
  for (const c of CUSTO_DE_FALHAR) {
    /* o veredito da linha: o do catálogo, pela frase que o desafio ensina (as
       marcas de barulho e testemunha vêm dele); o improviso, um mínimo */
    const real = DESAFIOS.map((d) => lerAcao(comoSeDiz(d.id), { ...base, personagem: { ...base.personagem, inventario: [{ nome: "Gazuas de ladrão" }] }, objetoEmCena: () => true })).find((x) => x && x.tipo === "teste" && x.alvoDoCusto === c.alvo);
    const v0 = real || { tipo: "teste", id: "improviso", alvoDoCusto: c.alvo, chave: `largo|${c.alvo}`, dc: 13, barulho: false, testemunha: false };
    const deSaber = MARGEM_DA_FALHA.saber.includes(c.alvo);
    for (let i = 0; i < 10000; i++) {
      const dc = DIFICULDADES[Math.floor(r() * DIFICULDADES.length)].dc;
      const falta = 1 + Math.floor(r() * 12);
      const total = dc - falta;
      const desastre = r() < 0.05;
      const fechaDepois = c.alvo === "busca" && r() < 0.3;
      const v = { ...v0, dc, fechaDepois };
      const des = desfechoDaFalha(v, total, dc, { desastre, sorte: r, comMeiaVerdade: true });
      const antes = desfechoDaFalha(v, total, dc, { desastre, sorte: r });
      if (antes && antes.meiaVerdade) semOpcaoMeias++;
      if (!des) continue;
      if (des.porPouco) { quases++; continue; } /* o «quase» é um SIM pago: o preço dele é outro */
      const deveSerMeia = deSaber && !desastre && !fechaDepois && falta <= MARGEM_DA_FALHA.ate;
      if (des.meiaVerdade) {
        meias++;
        if (!deveSerMeia) { erros.push(`meia fora do lugar: ${c.alvo}@${dc}/${total}`); break; }
        if (des.minutosExtra || des.barulhoExtra || des.pele) { erros.push(`a meia-verdade cobrou preço: ${c.alvo}`); break; }
        if (!/metade/.test(des.diz)) { erros.push(`a meia-verdade não diz a metade: ${c.alvo}`); break; }
        continue;
      }
      if (deveSerMeia) { erros.push(`faltou a meia-verdade: ${c.alvo}@${dc}/${total}`); break; }
      secas++;
      if (!efeitosCobrados(des, v).includes(c.efeito)) { erros.push(`efeito avisado não cobrado: ${c.alvo}@${dc}/${total}`); break; }
    }
  }
  t(`${meias} meias-verdades, ${secas} falhas secas, ${quases} «quase»: a meia-verdade só onde a margem a pede, sem preço; a seca sempre com o efeito avisado${erros.length ? " — " + erros.join(", ") : ""}`, erros.length === 0 && meias > 10000 && secas > CUSTO_DE_FALHAR.length * 3000);
  t("sem a opção, nenhuma meia-verdade — o desfecho de antes, letra por letra", semOpcaoMeias === 0);
}

sec("7. EM4 — os limites");
{
  const lembranca = { tipo: "teste", alvoDoCusto: "lembranca", chave: "x" };
  const meia = (v, total, dc, o = {}) => !!(desfechoDaMargem(v, { total, dc, comMeiaVerdade: true, ...o }) || {}).meiaVerdade;
  t("falhar por 1, 2 e 3 numa memória é meia-verdade", [11, 10, 9].every((tot) => meia(lembranca, tot, 12)));
  t("por 4 já é a falha, com o preço da linha", !meia(lembranca, 8, 12) && desfechoDaMargem(lembranca, { total: 8, dc: 12, comMeiaVerdade: true }).faixa === "falha");
  t("passar não é meia-verdade", desfechoDaMargem(lembranca, { total: 12, dc: 12, comMeiaVerdade: true }) === null);
  t("o 1 natural nunca é meia-verdade", !meia(lembranca, 11, 12, { desastre: true }));
  t("na luta nunca é meia-verdade", !meia(lembranca, 11, 12, { emCombate: true }));
  t("a busca de um quarto vazio nunca é meia-verdade", !meia({ alvoDoCusto: "busca", fechaDepois: true }, 9, 12));
  t("na busca que aceita o meio, −1 e −2 continuam o «quase» e −3 é a meia-verdade",
    desfechoDaMargem({ alvoDoCusto: "busca" }, { total: 11, dc: 12, comMeiaVerdade: true }).faixa === "quase" && meia({ alvoDoCusto: "busca" }, 9, 12));
  t("o gesto nunca é meia-verdade (a escalada falha por 3 e cai)", !meia({ alvoDoCusto: "escalada" }, 9, 12));
  t("o lixo não estoura", desfechoDaMargem(null, { comMeiaVerdade: true }) === null && desfechoDaMargem({ alvoDoCusto: "lembranca" }, { total: "x", dc: 12, comMeiaVerdade: true }) === null);
}

sec("8. EM4 — o envelope ao Narrador diz qual");
{
  const lembranca = { tipo: "teste", alvoDoCusto: "lembranca", chave: "x" };
  const meia = desfechoDaMargem(lembranca, { total: 10, dc: 12, comMeiaVerdade: true });
  const seca = desfechoDaMargem(lembranca, { total: 4, dc: 12, comMeiaVerdade: true });
  const args = { tipo: "inteligencia", pericia: "saberes", motivo: "lembrar o que se sabe de Alto Negro", valor: 7, mod: 3, total: 10, dc: 12, resultado: "falha" };
  const eMeia = envelopeDoTeste({ ...args, meio: meia });
  const eSeca = envelopeDoTeste({ ...args, total: 4, valor: 1, meio: null });
  t("a meia-verdade: um pedaço verdadeiro, o resto em falta, nunca o «nada»", /MEIA-VERDADE/.test(eMeia) && /FALTARAM 2/.test(eMeia) && /pedaço verdadeiro/.test(eMeia) && !/NÃO revela nada/.test(eMeia));
  t("a falha por muito: o envelope de sempre", /NÃO revela nada/.test(eSeca) && !/MEIA-VERDADE/.test(eSeca));
  t("o 1 natural ignora a meia-verdade, mesmo que lha passem", !/MEIA-VERDADE/.test(envelopeDoTeste({ ...args, desastre: true, meio: meia })));
  t("o gesto ignora a meia-verdade", !/MEIA-VERDADE/.test(envelopeDoTeste({ ...args, gesto: true, meio: meia })));
  t("a fala da mesa diz quanto faltou e que fica meio caminho", /Faltaram 2/.test(falaDoCusto(meia)) && /metade/.test(falaDoCusto(meia)));
  t("o envelope do custo cala na meia-verdade (não houve preço), e fala na seca", envelopeDoCusto(meia, "lembrar") === "" && /CUSTO/.test(envelopeDoCusto(seca, "lembrar")));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
