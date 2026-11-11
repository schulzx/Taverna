/* O CATIVEIRO (Fase MC · MC9, 11/11) — a prova do defeito 4 da 18.ª sessão.

   A luta perdida para a Bruxa acabou em `prisioneiros`, e o `presos: true`
   só virava texto. O turno seguinte foi sem envelope: o Narrador soltou o
   herói, deu-lhe uma chave que o sistema não tem e tirou-o da sala. Aqui:
   todo desfecho com presos abre um estado; cada saída tem perícia, a CD do
   captor e um preço; o catálogo lê essa CD; a pauta leva os vetos enquanto
   o estado dura; e o save antigo abre sem o campo. */
import {
  CD_DO_CAPTOR, AMARRAS, SAIDAS_DO_CATIVEIRO, PAUTA_DO_CATIVEIRO,
  abrirCativeiro, garantirCativeiro, cdDaSaida, aplicarSaida, oCativeiroNaPauta,
} from "../src/cativeiro.js";
import { aplicarSemSaida, decidirSemSaida, DESFECHOS_SEM_SAIDA } from "../src/saida-da-luta.js";
import { lerAcao, desafioPorId, custoPorAlvo, DIFICULDADES } from "../src/desafios.js";
import { DEGRAUS } from "../src/degraus.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object") { Object.values(x).forEach(congelar); Object.freeze(x); } return x; };
const semente = (s) => rng(hashSemente(s));

sec("§1 AS TABELAS");
{
  t("a CD do captor cobre todos os degraus de degraus.js", DEGRAUS.every((d) => Number.isInteger(CD_DO_CAPTOR.porDegrau[d.id])));
  t("e cresce com a cabeça de quem prende", DEGRAUS.slice().sort((a, b) => a.ordem - b.ordem).every((d, i, a) => i === 0 || CD_DO_CAPTOR.porDegrau[d.id] >= CD_DO_CAPTOR.porDegrau[a[i - 1].id]));
  t("o padrão é um degrau que existe", CD_DO_CAPTOR.porDegrau[CD_DO_CAPTOR.padrao] != null);
  t("piso e teto dentro da régua do catálogo (fácil … heroico)", CD_DO_CAPTOR.piso === DIFICULDADES.find((d) => d.id === "facil").dc && CD_DO_CAPTOR.teto === DIFICULDADES.find((d) => d.id === "heroico").dc);
  t("toda amarra diz o ajuste de toda saída", AMARRAS.every((a) => SAIDAS_DO_CATIVEIRO.every((s) => Number.isInteger(a.ajuste[s.id]))));
  t("NENHUMA SAÍDA SEM PREÇO: efeito conhecido, a frase, e o número do efeito",
    SAIDAS_DO_CATIVEIRO.every((s) => s.preco && s.preco.diz && ((s.preco.efeito === "aperta" || s.preco.efeito === "vigia") ? s.preco.cd > 0 : s.preco.efeito === "tempo" && s.preco.horas > 0)));
  t("toda saída tem perícia, verbo e a frase de quando abre", SAIDAS_DO_CATIVEIRO.every((s) => s.pericia && s.verbo && s.livre));
  t("três saídas, três moedas (o nó, o tempo, a vigia)", new Set(SAIDAS_DO_CATIVEIRO.map((s) => s.preco.efeito)).size === SAIDAS_DO_CATIVEIRO.length);
  t("escapar e arrebentar são os desafios do catálogo que já existem", ["escapar", "arrebentar"].every((a) => desafioPorId(a) && SAIDAS_DO_CATIVEIRO.some((s) => s.alvo === a)));
  t("e o catálogo já cobra a falha dos dois (CUSTO_DE_FALHAR)", ["escapar", "arrebentar"].every((a) => !!custoPorAlvo(a)));
  t("três vetos na pauta, e a linha tem teto", PAUTA_DO_CATIVEIRO.naoPode.length === 3 && PAUTA_DO_CATIVEIRO.teto > 0);
}

sec("§2 TODO DESFECHO «prisioneiros» ABRE O ESTADO");
{
  const heroi = (extra) => ({ nome: "Ana", vida: 0, vidaMax: 20, moedas: 9, morrendo: true, morte: { sucessos: 0, falhas: 1 }, grupo: [{ nome: "Elowen", vida: 0, vidaMax: 14 }], ...(extra || {}) });
  let abertos = 0, presos = 0, outros = 0, abertosFora = 0;
  const captores = [
    { nome: "Capitão da Guarda", vida: 20, vidaMax: 20, degrau: "treinado" },
    { nome: "Bruxa do Brejo", vida: 9, vidaMax: 30, degrau: "brilhante" },
    { nome: "Bandido", vida: 10, vidaMax: 10 },
    { nome: "Lobo", vida: 8, vidaMax: 11 },
  ];
  for (let i = 0; i < 200; i++) {
    const e = captores[i % captores.length];
    for (const desfecho of Object.keys(DESFECHOS_SEM_SAIDA)) {
      const r = aplicarSemSaida({ heroi: heroi(), inimigos: [e], decisao: { motivo: "caidos", desfecho, quem: e.nome }, rolar: semente("cat" + i), lugar: "Agulha de Sal", dia: 4 });
      if (!r) continue;
      if (DESFECHOS_SEM_SAIDA[desfecho].presos) { presos++; if (r.cativeiro) abertos++; }
      else { outros++; if (r.cativeiro) abertosFora++; }
    }
  }
  t(`com presos, sempre o estado (${abertos}/${presos})`, presos > 0 && abertos === presos);
  t(`sem presos, nunca (${abertosFora}/${outros})`, abertosFora === 0);
  /* pela porta da decisão, como o App chama: a intenção de levar vivo */
  const dec = decidirSemSaida({ heroi: heroi(), grupo: heroi().grupo, inimigos: [captores[0]], intencao: "capturar" });
  const r = aplicarSemSaida({ heroi: heroi(), inimigos: [captores[0]], decisao: dec, rolar: semente("porta"), lugar: "Agulha de Sal", dia: 4 });
  t("pela decisão do captor (capturar), o cativeiro abre", dec.desfecho === "prisioneiros" && !!r.cativeiro);
  t("com quem prende, a cabeça dele e a CD que sai dela", r.cativeiro.captor === "Capitão da Guarda" && r.cativeiro.degrau === "treinado" && r.cativeiro.cd === CD_DO_CAPTOR.porDegrau.treinado);
  t("onde e desde quando", r.cativeiro.onde === "Agulha de Sal" && r.cativeiro.desde === 4);
  t("e quem caiu comigo está preso comigo", J(r.cativeiro.presos) === J(["Elowen"]));
  t("o captor treinado prende melhor do que o bruto", (() => {
    const b = aplicarSemSaida({ heroi: heroi(), inimigos: [captores[2]], decisao: { motivo: "caidos", desfecho: "prisioneiros", quem: "Bandido" }, rolar: semente("b") });
    return b.cativeiro.cd < r.cativeiro.cd;
  })());
  const morto = aplicarSemSaida({ heroi: heroi({ morto: true }), inimigos: [captores[0]], decisao: { motivo: "caidos", desfecho: "prisioneiros", quem: captores[0].nome }, rolar: semente("m") });
  t("o morto não fica preso", morto.cativeiro === null);
}

sec("§3 AS SAÍDAS — a CD do captor, o preço da falha, o sucesso que fecha");
{
  const c = abrirCativeiro({ captor: "Bruxa do Brejo", degrau: "astuto", onde: "Agulha de Sal", dia: 4, presos: ["Elowen"], sorte: () => 0 });
  const amarra = AMARRAS[0];
  for (const s of SAIDAS_DO_CATIVEIRO) {
    const cd = cdDaSaida(c, s.id);
    t(`${s.id}: ${s.pericia}, CD ${cd.dc} = captor ${c.cd} + saída ${s.delta} + ${amarra.nome} ${amarra.ajuste[s.id]}`, cd.pericia === s.pericia && cd.dc === c.cd + s.delta + amarra.ajuste[s.id]);
  }
  t("a etiqueta diz o obstáculo e quem atou, nunca a regra", /Bruxa do Brejo/.test(cdDaSaida(c, "escapar").deOnde) && !/regra|tabela|sistema|cativeiro/i.test(cdDaSaida(c, "escapar").deOnde));
  t("outro alvo não é saída", cdDaSaida(c, "busca") === null && cdDaSaida(c, "tranca") === null);

  /* cada falha cobra o preço que a saída avisa */
  const fA = aplicarSaida(c, "arrebentar", { sucesso: false });
  t("falhar a força aperta o nó: a próxima força é mais difícil", fA.cativeiro && cdDaSaida(fA.cativeiro, "arrebentar").dc === cdDaSaida(c, "arrebentar").dc + SAIDAS_DO_CATIVEIRO[0].preco.cd && fA.preco.efeito === "aperta");
  t("e só ela: o jeito fica igual", cdDaSaida(fA.cativeiro, "escapar").dc === cdDaSaida(c, "escapar").dc);
  const fE = aplicarSaida(c, "escapar", { sucesso: false });
  t("falhar o jeito custa tempo (as horas que o App passa)", fE.horas === SAIDAS_DO_CATIVEIRO[1].preco.horas && fE.preco.efeito === "tempo" && cdDaSaida(fE.cativeiro, "escapar").dc === cdDaSaida(c, "escapar").dc);
  const fC = aplicarSaida(c, "convencer", { sucesso: false });
  const v = SAIDAS_DO_CATIVEIRO[2].preco.cd;
  t("falhar a lábia põe-no de vigia: TODAS as saídas ficam mais difíceis", SAIDAS_DO_CATIVEIRO.every((s) => cdDaSaida(fC.cativeiro, s.id).dc === Math.min(CD_DO_CAPTOR.teto, cdDaSaida(c, s.id).dc + v)));
  t("toda falha devolve a frase do preço e conta a tentativa", [fA, fE, fC].every((f) => f.linha && f.cativeiro.tentativas === 1 && !f.livre));
  const ok = aplicarSaida(fC.cativeiro, "escapar", { sucesso: true });
  t("O SUCESSO FECHA O ESTADO", ok.livre === true && ok.cativeiro === null && /Bruxa do Brejo/.test(ok.linha));
  t("a CD nunca passa do teto, aperte quanto apertar", (() => {
    let x = c; for (let i = 0; i < 20; i++) x = aplicarSaida(x, "convencer", { sucesso: false }).cativeiro;
    return SAIDAS_DO_CATIVEIRO.every((s) => cdDaSaida(x, s.id).dc <= CD_DO_CAPTOR.teto);
  })());
  t("saída que não existe: nada muda", J(aplicarSaida(c, "voar", { sucesso: true }).cativeiro) === J(c));
}

sec("§4 O CATÁLOGO LÊ A CD DO CAPTOR");
{
  const c = abrirCativeiro({ captor: "Capitão da Guarda", degrau: "brilhante", sorte: () => 0.3 });
  const frases = { arrebentar: "Forço os pulsos contra as cordas para arrebentá-las.", escapar: "Me contorço para soltar os pulsos." };
  for (const [alvo, f] of Object.entries(frases)) {
    const solto = lerAcao(f, {}), preso = lerAcao(f, { cativeiro: c });
    t(`«${f}»: sem cativeiro, o degrau do catálogo (${solto.dc})`, solto.tipo === "teste" && solto.id === alvo && solto.dc === desafioPorId(alvo).dcPadrao);
    t(`preso, a CD do captor (${preso.dc}) e a etiqueta dele`, preso.dc === cdDaSaida(c, alvo).dc && preso.deOnde.startsWith(cdDaSaida(c, alvo).deOnde));
  }
  t("o cativeiro não mexe na CD de quem não está a sair dele", lerAcao("Procuro com cuidado pela sala.", { cativeiro: c }) === null || J(lerAcao("Procuro com cuidado pela sala.", { cativeiro: c }).dc) === J((lerAcao("Procuro com cuidado pela sala.", {}) || {}).dc));
  t("ctx com lixo no cativeiro: como sem ele", lerAcao(frases.escapar, { cativeiro: { captor: "" } }).dc === desafioPorId("escapar").dcPadrao && lerAcao(frases.escapar, { cativeiro: null }).dc === desafioPorId("escapar").dcPadrao);
}

sec("§5 A PAUTA — o naoPode vai enquanto dura");
{
  const c = abrirCativeiro({ captor: "Bruxa do Brejo", degrau: "astuto", onde: "Agulha de Sal", presos: ["Elowen"], sorte: () => 0.9 });
  const p = oCativeiroNaPauta(c);
  t("a linha diz quem prende, com quê, onde, e quem está comigo", /Bruxa do Brejo/.test(p.linha) && p.linha.includes(AMARRAS[3].nome) && /Agulha de Sal/.test(p.linha) && /Elowen/.test(p.linha), p.linha);
  t("e as saídas, todas, sem número de regra", SAIDAS_DO_CATIVEIRO.every((s) => p.linha.includes(s.verbo)) && !/CD|\d/.test(p.linha));
  t("a linha cabe no teto", p.linha.length <= PAUTA_DO_CATIVEIRO.teto + 1);
  t("o Narrador não solta", p.naoPode.some((v) => /soltar-me/.test(v)));
  t("não dá chave nem ferramenta que o estado não tem", p.naoPode.some((v) => /chave/.test(v) && /ferramenta/.test(v)));
  t("e não tira o captor de cena", p.naoPode.some((v) => v.includes("tirar Bruxa do Brejo de cena")));
  let x = c, vez = 0, comVeto = 0;
  for (const s of ["arrebentar", "convencer", "escapar"]) { vez++; if (oCativeiroNaPauta(x).naoPode.length === 3) comVeto++; x = aplicarSaida(x, s, { sucesso: s === "escapar" }).cativeiro; }
  t(`em cada turno preso, os vetos (${comVeto}/${vez})`, comVeto === vez);
  t("livre, nada: nem linha, nem veto", J(oCativeiroNaPauta(x)) === J({ linha: "", naoPode: [] }));
  const longo = oCativeiroNaPauta(abrirCativeiro({ captor: "X".repeat(80), onde: "Y".repeat(80), presos: ["A".repeat(80), "B".repeat(80)] }));
  t("nomes enormes não rompem o teto", longo.linha.length <= PAUTA_DO_CATIVEIRO.teto + 1);
}

sec("§6 O DETERMINISMO, O SAVE, O LIXO E A IMUTABILIDADE");
{
  const abre = (s) => abrirCativeiro({ captor: "Capitão", degrau: "treinado", onde: "Forte", dia: 2, presos: ["Elowen"], sorte: semente(s) });
  t("mesma semente, mesmo cativeiro", J(abre("m1")) === J(abre("m1")));
  const vistas = new Set(Array.from({ length: 200 }, (_, i) => abre("v" + i).amarras));
  t(`a semente varia as amarras (${vistas.size} de ${AMARRAS.length} em 200)`, vistas.size === AMARRAS.length);
  const h = () => ({ nome: "Ana", vida: 0, vidaMax: 20, morte: { sucessos: 0, falhas: 0 }, grupo: [] });
  const dec = { motivo: "caidos", desfecho: "prisioneiros", quem: "Capitão" };
  const e = [{ nome: "Capitão", vida: 20, vidaMax: 20, degrau: "treinado" }];
  t("e pela luta: a mesma semente dá o mesmo cativeiro", J(aplicarSemSaida({ heroi: h(), inimigos: e, decisao: dec, rolar: semente("L") }).cativeiro) === J(aplicarSemSaida({ heroi: h(), inimigos: e, decisao: dec, rolar: semente("L") }).cativeiro));
  /* o save: campo novo, aditivo */
  const c = aplicarSaida(abre("s"), "arrebentar", { sucesso: false }).cativeiro;
  t("vai ao save e volta igual (JSON, pelo garantir)", J(garantirCativeiro(JSON.parse(J(c)))) === J(c));
  t("SAVE ANTIGO ABRE SEM O CAMPO: undefined e null são «não há cativeiro»", garantirCativeiro(undefined) === null && garantirCativeiro(null) === null);
  t("lixo também", [0, "", "preso", [], {}, { captor: "" }, { captor: 7 }].every((x) => garantirCativeiro(x) === null));
  const sujo = garantirCativeiro({ captor: " Capitão ", degrau: "rei", cd: 999, amarras: "fio-dental", aperto: { arrebentar: -3, voar: 9 }, vigia: "x", presos: [null, 3, { nome: "Elowen" }, "Cael"] });
  t("o save sujo sai normalizado", sujo.captor === "Capitão" && sujo.degrau === CD_DO_CAPTOR.padrao && sujo.cd === CD_DO_CAPTOR.teto && sujo.amarras === AMARRAS[0].id && J(sujo.aperto) === "{}" && sujo.vigia === 0 && J(sujo.presos) === J(["Elowen", "Cael"]), J(sujo));
  t("sem captor, não abre", abrirCativeiro({}) === null && abrirCativeiro(null) === null && abrirCativeiro({ captor: { nome: "" } }) === null);
  t("o captor pode vir como a criatura (com nome)", abrirCativeiro({ captor: { nome: "Lobo" } }).captor === "Lobo");
  t("cdDaSaida, aplicarSaida e a pauta aceitam lixo", cdDaSaida(null, "escapar") === null && aplicarSaida(null, "escapar", null).preco === null && oCativeiroNaPauta(7).linha === "");
  const gelo = congelar(abre("g"));
  let estourou = false;
  try { aplicarSaida(gelo, "arrebentar", { sucesso: false }); aplicarSaida(gelo, "convencer", { sucesso: false }); cdDaSaida(gelo, "escapar"); oCativeiroNaPauta(gelo); } catch { estourou = true; }
  t("com o estado congelado, nada estoura (nada é mutado)", !estourou);
  const antes = J(gelo);
  aplicarSaida(gelo, "arrebentar", { sucesso: false });
  t("e o de entrada fica como estava", J(gelo) === antes);
}

console.log(`\nO CATIVEIRO: ${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
