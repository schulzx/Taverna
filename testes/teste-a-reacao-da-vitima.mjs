/* A REAÇÃO DA VÍTIMA (25/11/2026) — src/a-reacao-da-vitima.js

   A decisão da pessoa, 25/11: a vítima reage pela ficha — a honesta
   denuncia, a desonesta cobra para guardar segredo, etc. Esta suíte prova o
   MECANISMO (a tomada do registro, a ficha, a tabela, a semente), nunca por
   nome ou frase — os nomes daqui são de prova:
   §1  quando reage: viu e está em cena; não viu dá pela falta depois de N
       dias e não acusa; fora de cena, nada; o devolvido não reage;
   §2  que reação: a honesta que viu denuncia; a desonesta que viu cobra;
       o medo de farda tira a denúncia; a afeição alta cala;
   §3  a cobrança do silêncio: o preço vem antes (a dívida aberta e a
       linha da tela); pagar pela porta única fecha e encerra; recusar
       (pela frase negada, ou o prazo) segue a tabela (denuncia);
   §4  confrontar: a restituição devolvida encerra; o prazo segue a tabela;
   §5  uma reação por tomada; o estado é aditivo; lixo dá o vazio;
   §6  determinismo e a distribuição em N sementes respeita os pesos;
   §7  as linhas (a denúncia com e sem lei) e a afeição que cai;
   §8  a fiação no App (o texto do App, nunca o de src/motor/), atrás da
       chave do Mestre vivo. */
import { readFileSync } from "node:fs";
import {
  A_REACAO_DA_VITIMA, garantirReacoes, aMaoFoiVista, oValorDoTomado, aAfeicaoDe, osPesosDaReacao, sortearAReacao,
  oPrecoDoSilencio, asReacoesDoTurno, asLinhasDaReacao, comAAfeicaoCaida, asLinhasDoTurno,
} from "../src/a-reacao-da-vitima.js";
import { aplicarTransacao, dividasDe, garantirPosses, tomadasDe, posseInicial } from "../src/quem-tem-o-que.js";
import { aplicarAsTransacoes } from "../src/a-troca-por-transacao.js";
import { PAUTA_DE_UM_TURNO } from "../src/motor/pauta-do-turno.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };

const R = A_REACAO_DA_VITIMA;
const SEMENTE = "A prova da vítima|Fantasia";
const VITIMA = "npc|Bento";
const ficha = () => ({ nome: "Aurelia Vane", classe: "Clérigo", moedas: 40, inventario: ["Lampião de latão"], equipamento: [], equipados: {}, suprimentos: {}, grupo: [] });
const ctxP = { semente: SEMENTE, dia: 4, pessoas: { [VITIMA]: { nome: "Bento", papel: "pescador" } } };
const moedas = (n) => ({ tipo: "moedas", nome: "moedas", quantos: n });
/* a tomada pela porta de verdade (aplicarTransacao, consentimento «tomado»): viu ou às escondidas */
/* a vítima com 100 moedas (a posse inicial é derivada da semente: o delta acerta) */
const rica = () => garantirPosses({ v: 1, delta: { [VITIMA]: { moedas: 100 - posseInicial(VITIMA, ctxP).moedas, entrou: [], saiu: [] } }, dividas: [], aplicadas: [] });
const tomar = (viu, n = 12, chave = "f1", dia = 4) => {
  const s = aplicarTransacao(rica(), ficha(), { de: VITIMA, para: "heroi", oQue: moedas(n), contra: null, consentimento: "tomado", origem: "o furto", chave }, { ...ctxP, dia, dado: viu ? { passou: true } : { passou: true, escondido: true } });
  if (!s.ok) throw new Error("a tomada de prova não aplicou: " + s.motivo);
  return s;
};
const HONESTA = { tracos: ["fiel", "generoso"], medo: "" };
const DESONESTA = { tracos: ["ganancioso"], medo: "" };
const emCena = (indole, extra = {}) => [{ id: VITIMA, nome: "Bento", indole, ...extra }];
/* o estado da reação mora em posses.reacoes: o 2.º argumento só deixa ler a ordem dos passos */
const turno = (posses, _reacoes, pessoas, extra = {}) => asReacoesDoTurno({ posses, pessoas, semente: SEMENTE, dia: 4, turno: 10, ...extra });
/* acha uma semente em que a pessoa sorteia o tipo pedido (a mesma régua do módulo) */
const sementeCom = (tipo, pessoas, posses) => { for (let i = 0; i < 500; i++) { const s = `${SEMENTE}#${i}`; const r = asReacoesDoTurno({ posses, pessoas, semente: s, dia: 4, turno: 10 }); if (r.eventos[0] && r.eventos[0].tipo === tipo) return s; } return null; };

sec("1. QUANDO A VÍTIMA REAGE");
{
  const viu = tomar(true);
  t("a tomada de prova deixou o fato com «viu»", tomadasDe(viu.posses, "heroi").tomou[0].viu === true);
  const r = turno(viu.posses, null, emCena(HONESTA));
  t("viu e está em cena: reage (um evento, com a chave da tomada)", r.eventos.length === 1 && r.eventos[0].chave === tomadasDe(viu.posses, "heroi").tomou[0].id, J(r.eventos));
  const fora = turno(viu.posses, null, [{ id: "npc|Outro", nome: "Outro" }]);
  t("fora de cena: nada reage, e o estado volta igual", fora.eventos.length === 0 && fora.reacoes === null && fora.posses === viu.posses);
  const esc = tomar(false);
  const cedo = turno(esc.posses, null, emCena(HONESTA));
  t("não viu, no mesmo dia: ainda não deu pela falta", cedo.eventos.length === 0);
  const depois = turno(esc.posses, null, emCena(HONESTA), { dia: 4 + R.falta.dias });
  t("não viu, depois de falta.dias: dá pela falta", depois.eventos.length === 1 && depois.eventos[0].tipo === "falta", J(depois.eventos));
  t("quem não sabe quem foi não acusa: nenhum crime, nenhuma afeição, nenhuma dívida", !depois.eventos[0].crime && !depois.eventos[0].afeicao && dividasDe(depois.posses, "heroi").deve.length === 1);
  /* a mesma régua para todas as índoles: quem não viu nunca acusa */
  let acusou = 0;
  for (const ind of [HONESTA, DESONESTA, { tracos: ["corajoso"] }, { tracos: ["rancoroso"] }]) for (let i = 0; i < 30; i++) { const x = asReacoesDoTurno({ posses: esc.posses, pessoas: emCena(ind), semente: SEMENTE + i, dia: 9, turno: 10 }); if (x.eventos.some((e) => e.tipo !== "falta")) acusou++; }
  t("nenhuma ficha, em nenhuma semente, acusa o herói do que não viu", acusou === 0);
  t("a linha da falta não diz quem foi", /não sabe quem foi/.test(asLinhasDaReacao(depois.eventos[0]).fato));
  /* devolvida antes de reagir: não há do que reagir */
  const dev = aplicarTransacao(viu.posses, viu.ficha, { de: "heroi", para: VITIMA, oQue: moedas(12), contra: null, consentimento: "devido", origem: "prova", chave: "d1" }, ctxP);
  t("o que já voltou à vítima não reage", dev.ok && turno(dev.posses, null, emCena(HONESTA)).eventos.length === 0, J(dev.motivo));
}

sec("2. QUE REAÇÃO: A FICHA, A AFEIÇÃO, O VALOR, A SEMENTE");
{
  const viu = tomar(true);
  const pH = osPesosDaReacao({}, HONESTA, moedas(12));
  const pD = osPesosDaReacao({}, DESONESTA, moedas(12));
  t("a honesta: denunciar é o maior peso, e o silêncio não se vende (cobrar 0)", pH.denunciar > Math.max(pH.confrontar, pH.calar) && pH.cobrar === 0, J(pH));
  t("a desonesta: cobrar é o maior peso", pD.cobrar > Math.max(pD.denunciar, pD.confrontar, pD.calar), J(pD));
  const sH = sementeCom("denunciar", emCena(HONESTA), viu.posses);
  t("honesta que viu → denuncia (numa semente, e o evento leva o crime da tabela)", !!sH && turno(viu.posses, null, emCena(HONESTA), { semente: sH }).eventos[0].crime === R.reacoes.denunciar.crime);
  let den = 0; for (let i = 0; i < 200; i++) { const x = asReacoesDoTurno({ posses: viu.posses, pessoas: emCena(HONESTA), semente: SEMENTE + "/h" + i, dia: 4, turno: 10 }); if (x.eventos[0].tipo === "denunciar") den++; }
  t("honesta que viu: denuncia na maioria das sementes", den > 100, String(den));
  let cob = 0; for (let i = 0; i < 200; i++) { const x = asReacoesDoTurno({ posses: viu.posses, pessoas: emCena(DESONESTA), semente: SEMENTE + "/d" + i, dia: 4, turno: 10 }); if (x.eventos[0].tipo === "cobrar") cob++; }
  t("desonesta que viu: cobra o silêncio na maioria das sementes", cob > 100, String(cob));
  const medo = osPesosDaReacao({}, { tracos: ["fiel"], medo: "autoridade" }, moedas(12));
  t("o medo de gente de posto tira a denúncia (peso 0)", medo.denunciar === 0, J(medo));
  t("a afeição sai do registro de NPCs: relação amiga ou laço de amizade é alta; rival ou laço rompido, baixa", aAfeicaoDe({ relacao: "amigo" }) === "alta" && aAfeicaoDe({ laco: { tipo: "amizade", forca: 2 } }) === "alta" && aAfeicaoDe({ relacao: "rival" }) === "baixa" && aAfeicaoDe({ laco: { tipo: "amor", rompido: true } }) === "baixa" && aAfeicaoDe(null) === "");
  const amiga = osPesosDaReacao({ relacao: "amigo" }, { tracos: [] }, moedas(12));
  const estranha = osPesosDaReacao({}, { tracos: [] }, moedas(12));
  t("a afeição alta pesa para calar e tira peso da denúncia", amiga.calar > estranha.calar && amiga.denunciar < estranha.denunciar, J({ amiga, estranha }));
  const muito = osPesosDaReacao({}, { tracos: [] }, moedas(R.valor.alto)), pouco = osPesosDaReacao({}, { tracos: [] }, moedas(R.valor.baixo));
  t("o valor: o muito leva à lei, o pouco se engole", muito.denunciar > pouco.denunciar && pouco.calar > muito.calar, J({ muito, pouco }));
  t("o valor do tomado: a moeda pelo número, a coisa pela tabela", oValorDoTomado(moedas(7)) === 7 && oValorDoTomado({ tipo: "item", nome: "Anel", quantos: 2 }) === 2 * R.valor.item && oValorDoTomado(null) === R.valor.item);
  t("sem a índole na ficha, ela sai da semente e do nome (indole.js): reage do mesmo jeito", turno(viu.posses, null, [{ id: VITIMA, nome: "Bento" }]).eventos.length === 1);
  t("o sorteio sem peso nenhum cala", sortearAReacao({ denunciar: 0, cobrar: 0 }, SEMENTE, VITIMA, "k") === "calar");
}

sec("3. A COBRANÇA DO SILÊNCIO");
{
  const viu = tomar(true, 12);
  const sD = sementeCom("cobrar", emCena(DESONESTA), viu.posses);
  t("há semente em que a desonesta cobra", !!sD);
  const r = turno(viu.posses, null, emCena(DESONESTA), { semente: sD });
  const e = r.eventos[0];
  const preco = oPrecoDoSilencio(moedas(12), DESONESTA);
  t("o preço sai da tabela (fração do valor, o traço guloso pede mais)", e.preco === preco && preco === Math.round(12 * R.silencio.fracao * R.silencio.porTraco.ganancioso), J(e));
  const dv = dividasDe(r.posses, "heroi").deve.find((d) => d.id.startsWith(R.divida.prefixo));
  t("o veredito antes: a cobrança é uma dívida aberta com ela, do preço, no registro", !!dv && dv.para === VITIMA && dv.quanto === preco && dv.oQue.tipo === "moedas" && dv.origem === R.divida.origem, J(r.posses.dividas));
  const l = asLinhasDaReacao(e);
  t("a linha da tela diz o preço ANTES de o herói aceitar", l.tela.includes(`◉ ${preco}`) && /pague, ou recuse/.test(l.tela), l.tela);
  t("o fato do Narrador diz o preço e o que acontece nos dois lados", l.fato.includes(`◉ ${preco}`) && /pagar/.test(l.fato) && /recusar/.test(l.fato));
  t("a reação fica pendente, com o prazo da tabela em turnos", r.reacoes.porChave[e.chave].estado === "pendente" && r.reacoes.porChave[e.chave].ate === 10 + R.reacoes.cobrar.prazo);
  /* pagar: a transação «devido» pela porta única (a mesma de «pago … à Fulana») */
  const pg = aplicarAsTransacoes(r.posses, viu.ficha, [{ de: "heroi", para: VITIMA, oQue: moedas(preco), contra: null, consentimento: "devido", origem: "prova", chave: "pg1" }], ctxP);
  t("pagar passa pela porta única: a moeda sai da ficha e a dívida do silêncio fecha", pg.ok && pg.ficha.moedas === viu.ficha.moedas - preco && !dividasDe(pg.posses, "heroi").deve.some((d) => d.id === dv.id), J(pg.motivo));
  const r2 = turno(pg.posses, r.reacoes, emCena(DESONESTA), { semente: sD, turno: 11 });
  t("pago: a reação encerra («paga»), sem crime", r2.eventos.length === 1 && r2.eventos[0].tipo === "paga" && !r2.eventos[0].crime && r2.reacoes.porChave[e.chave].estado === "paga", J(r2.eventos));
  t("pago: nada mais acontece depois", turno(r2.posses, r2.reacoes, emCena(DESONESTA), { semente: sD, turno: 40 }).eventos.length === 0);
  /* recusar pela frase negada dirigida a ela */
  const rc = turno(r.posses, r.reacoes, emCena(DESONESTA), { semente: sD, turno: 12, recusa: { negada: true, quem: "Bento" } });
  t("recusar (a frase negada com o nome dela): segue a tabela — recusou, e denuncia", J(rc.eventos.map((x) => x.tipo)) === J(["recusou", R.reacoes.cobrar.seNao]), J(rc.eventos));
  t("recusada, a dívida do silêncio sai do registro (não há o que pagar), e a restituição fica", !dividasDe(rc.posses, "heroi").deve.some((d) => d.id === dv.id) && dividasDe(rc.posses, "heroi").deve.some((d) => d.id.startsWith("div|tom|")));
  t("a frase negada com outro nome não recusa", turno(r.posses, r.reacoes, emCena(DESONESTA), { semente: sD, turno: 12, recusa: { negada: true, quem: "Marta" } }).eventos.length === 0);
  t("a frase negada sem nome recusa só no turno logo depois da cobrança", turno(r.posses, r.reacoes, emCena(DESONESTA), { semente: sD, turno: 11, recusa: { negada: true, quem: "" } }).eventos.length === 2 && turno(r.posses, r.reacoes, emCena(DESONESTA), { semente: sD, turno: 12, recusa: { negada: true, quem: "" } }).eventos.length === 0);
  t("a frase que não é negada não recusa", turno(r.posses, r.reacoes, emCena(DESONESTA), { semente: sD, turno: 11, recusa: { negada: false, quem: "Bento" } }).eventos.length === 0);
  const venc = turno(r.posses, r.reacoes, [], { semente: sD, turno: 10 + R.reacoes.cobrar.prazo + 1 });
  t("o prazo passou sem pagar: é recusa, mesmo longe dela (a denúncia não precisa de cena)", J(venc.eventos.map((x) => x.tipo)) === J(["recusou", "denunciar"]));
  t("depois de seguir, nada mais", turno(rc.posses, rc.reacoes, emCena(DESONESTA), { semente: sD, turno: 50 }).eventos.length === 0);
}

sec("4. CONFRONTAR: EXIGE DE VOLTA (A RESTITUIÇÃO QUE JÁ EXISTE)");
{
  const viu = tomar(true, 12);
  const ind = { tracos: ["corajoso"] };
  const sC = sementeCom("confrontar", emCena(ind), viu.posses);
  const r = turno(viu.posses, null, emCena(ind), { semente: sC });
  t("há semente em que a corajosa confronta, e a reação espera", !!sC && r.eventos[0].tipo === "confrontar" && r.reacoes.porChave[r.eventos[0].chave].estado === "pendente");
  t("confrontar não abre dívida nova: a exigência é a restituição que o registro já tem", dividasDe(r.posses, "heroi").deve.length === 1 && dividasDe(r.posses, "heroi").deve[0].id.startsWith("div|tom|"));
  const dev = aplicarTransacao(r.posses, viu.ficha, { de: "heroi", para: VITIMA, oQue: moedas(12), contra: null, consentimento: "devido", origem: "prova", chave: "dv2" }, ctxP);
  const r2 = turno(dev.posses, r.reacoes, emCena(ind), { semente: sC, turno: 11 });
  t("devolvido pela porta: encerra («devolvida»)", r2.eventos.length === 1 && r2.eventos[0].tipo === "devolvida", J(r2.eventos));
  const r3 = turno(r.posses, r.reacoes, emCena(ind), { semente: sC, turno: 10 + R.reacoes.confrontar.prazo + 1 });
  t("o prazo passou sem devolver: segue a tabela (denuncia)", J(r3.eventos.map((x) => x.tipo)) === J([R.reacoes.confrontar.seNao]));
}

sec("5. UMA VEZ SÓ, O ESTADO ADITIVO, O LIXO");
{
  const viu = tomar(true);
  const r = turno(viu.posses, null, emCena(HONESTA));
  const r2 = turno(r.posses, r.reacoes, emCena(HONESTA), { turno: 11 });
  t("cada tomada reage no máximo uma vez (a chave é a da tomada)", r2.eventos.length === 0 || r2.eventos.every((e) => ["paga", "devolvida", "recusou", "denunciar"].includes(e.tipo) && r.reacoes.porChave[e.chave].estado === "pendente"));
  const fim = turno(r.posses, r.reacoes, emCena(HONESTA), { turno: 99 });
  const fim2 = turno(fim.posses, fim.reacoes, emCena(HONESTA), { turno: 100 });
  t("depois de resolvida, a mesma tomada não volta a reagir", fim2.eventos.length === 0);
  const dois = aplicarTransacao(viu.posses, viu.ficha, { de: VITIMA, para: "heroi", oQue: moedas(3), contra: null, consentimento: "tomado", origem: "o furto", chave: "f2" }, { ...ctxP, dado: { passou: true } });
  const r3 = turno(dois.posses, r.reacoes, emCena(HONESTA), { turno: 11 });
  t("uma segunda tomada da mesma pessoa tem a sua reação", r3.eventos.some((e) => e.chave !== r.eventos[0].chave && e.chave.startsWith("tom|")));
  t("garantirReacoes: lixo e nulo dão null; o que vale fica", garantirReacoes(null) === null && garantirReacoes({ porChave: { x: { tipo: "inventado" } } }) === null && garantirReacoes({ porChave: { "__proto__": { tipo: "calar" } } }) === null && garantirReacoes(r.reacoes).porChave[r.eventos[0].chave].tipo === r.eventos[0].tipo);
  t("o estado é aditivo: mora em posses.reacoes, e o resto do registro fica igual", J(Object.keys(garantirPosses(r.posses)).filter((k) => k !== "reacoes")) === J(Object.keys(garantirPosses(viu.posses))) && !("reacoes" in garantirPosses(viu.posses)) && !!garantirPosses(r.posses).reacoes);
  const at = aplicarTransacao(r.posses, viu.ficha, { de: "heroi", para: "mundo", oQue: moedas(1), contra: null, consentimento: "dado", origem: "prova", chave: "atravessa" }, ctxP);
  t("o estado da reação atravessa a porta única (aplicarTransacao não o perde)", at.ok && J(garantirReacoes(at.posses.reacoes)) === J(r.reacoes), J(at.motivo));
  t("lixo no turno dá o vazio, nunca exceção", asReacoesDoTurno(null).eventos.length === 0 && asReacoesDoTurno({ posses: 7, pessoas: "x" }).eventos.length === 0 && asLinhasDaReacao(null).fato === "" && asLinhasDoTurno(null) === null);
  const ent = congelar(JSON.parse(J({ posses: viu.posses, reacoes: r.reacoes })));
  let estourou = false; try { turno(ent.posses, ent.reacoes, congelar(emCena(HONESTA)), { turno: 99 }); } catch { estourou = true; }
  t("nada que entra é mutado (entrada congelada)", !estourou);
}

sec("6. DETERMINISMO E A DISTRIBUIÇÃO");
{
  const viu = tomar(true);
  const a = turno(viu.posses, null, emCena({ tracos: [] }), { semente: "x1" }), b = turno(viu.posses, null, emCena({ tracos: [] }), { semente: "x1" });
  t("mesma semente, mesma reação (e o mesmo estado)", J(a) === J(b));
  const pesos = osPesosDaReacao({}, { tracos: [] }, moedas(12));
  const total = Object.values(pesos).reduce((s, x) => s + x, 0);
  const N = 2000, cont = {};
  for (let i = 0; i < N; i++) { const k = sortearAReacao(pesos, "dist" + i, VITIMA, "tom|k"); cont[k] = (cont[k] || 0) + 1; }
  const desvio = Object.keys(pesos).map((k) => Math.abs((cont[k] || 0) / N - pesos[k] / total));
  t("em N sementes, a frequência de cada reação segue o peso da tabela (±4 pontos)", desvio.every((d) => d < 0.04), J({ pesos, cont }));
  t("o peso zero nunca sai", Array.from({ length: 300 }, (_, i) => sortearAReacao({ denunciar: 0, calar: 1, cobrar: 2 }, "z" + i, VITIMA, "k")).every((k) => k !== "denunciar"));
  const src = readFileSync(new URL("../src/a-reacao-da-vitima.js", import.meta.url), "utf8");
  t("o módulo não lê relógio nem sorte", !/Date\.now|new Date|Math\.random/.test(src));
}

sec("7. AS LINHAS E A AFEIÇÃO");
{
  const den = { tipo: "denunciar", id: VITIMA, nome: "Bento", coisa: "◉ 12" };
  const com = asLinhasDaReacao(den, { lei: { nome: "Vau", quem: "a guarda da cidade", recompensa: 22, dias: 7 } });
  t("a denúncia com lei: quem, a cidade, a recompensa e os dias (de crime.js)", /contar à guarda da cidade/.test(com.fato) && /procurado em Vau/.test(com.fato) && /22 moedas/.test(com.fato) && /◉ 22/.test(com.tela), J(com));
  const sem = asLinhasDaReacao(den, {});
  t("a denúncia sem lei (fora de cidade): só o fato, sem procurado", !/procurado/.test(sem.fato) && sem.fato.includes(R.quemSemLei));
  t("calar e falta não têm linha de tela (o Narrador narra)", asLinhasDaReacao({ tipo: "calar", nome: "Bento", coisa: "x" }).tela === "" && asLinhasDaReacao({ tipo: "falta", nome: "Bento", coisa: "x" }).tela === "");
  const pa = asLinhasDoTurno([den, { tipo: "calar", nome: "Ione", coisa: "x" }, { tipo: "falta", nome: "A", coisa: "x" }, { tipo: "falta", nome: "B", coisa: "y" }]);
  t("a pauta: secção da tabela, com teto de linhas", pa[R.secao].length === R.teto.eventos);
  t("a secção existe na pauta de um turno", Object.prototype.hasOwnProperty.call(PAUTA_DE_UM_TURNO.secoes || PAUTA_DE_UM_TURNO, R.secao) || J(PAUTA_DE_UM_TURNO).includes(`"${R.secao}"`));
  const comLaco = comAAfeicaoCaida({ nome: "Bento", relacao: "amigo", laco: { tipo: "amizade", forca: 3 } });
  t("a afeição cai: o laço afrouxa (npcs.js)", comLaco.laco.forca === 2 && comLaco.relacao === "amigo");
  t("sem laço que afrouxe, a relação desce um degrau da tabela", comAAfeicaoCaida({ nome: "B", relacao: "amigo" }).relacao === R.afeicao.desce.amigo);
  const inimigo = { nome: "B", relacao: "inimigo" }, estranho = { nome: "C", relacao: "neutro" }, semNada = { nome: "D" };
  t("nada a descer (o inimigo, o neutro, o desconhecido): o mesmo objeto", comAAfeicaoCaida(inimigo) === inimigo && comAAfeicaoCaida(estranho) === estranho && comAAfeicaoCaida(semNada) === semNada && comAAfeicaoCaida(null) === null);
  t("a mão leve vista: o furto que passou por pouco (o preço «tem ouvidos»), não o limpo", aMaoFoiVista({ porPouco: true, bateu: false }) === true && aMaoFoiVista({ porPouco: true, bateu: true }) === true && aMaoFoiVista({ porPouco: false, bateu: true }) === false && aMaoFoiVista(null) === false);
}

sec("8. A FIAÇÃO NO APP");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o App importa o módulo", /from "\.\/a-reacao-da-vitima\.js"/.test(app));
  t("a reação corre atrás da chave do Mestre vivo, em try/catch", /const aReacaoDaVitima = \([^)]*\) => \{\s*if \(!mestreVivoLigado\(\)\) return;/.test(app) && /calou\("a reação da vítima/.test(app));
  t("a denúncia pousa na lei que existe (registrarCrime de crime.js)", /reacaoLeiRef|registrarCrime\(leiRef\.current, consR/.test(app));
  t("a afeição pousa no registro de NPCs (comAAfeicaoCaida)", /comAAfeicaoCaida\(/.test(app));
  t("o estado mora no registro de posse (possesRef, já no save): nenhum campo novo no topo do save", /asReacoesDoTurno\(\{ posses: possesRef\.current/.test(app) && !/reacoes: reacoesRef/.test(app));
  t("a mão leve vista passa a marca ao dado (aMaoFoiVista)", /escondido: !aMaoFoiVista\(/.test(app));
  t("o fato vai à pauta de um turno (porNaPautaDoTurno), sem bloco estático", /const paR = asLinhasDoTurno\(/.test(app) && /if \(paR\) porNaPautaDoTurno\(paR\)/.test(app));
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
