/* teste-mestre-vivo-sessao-6.mjs (21/11/2026) — as sobras do juiz na sexta
   sessão jogada do Mestre vivo (mente/lancamento/mestre-vivo-sessao-6.md).

   Cada secção é um defeito visto na sessão, reproduzido em Node com a mesma
   composição que o jogo usa (lerAcao com o contexto do desafio → a cena do
   retrato → a régua → o chamado), e o conserto na regra, não na frase:
     1. o palpite da pessoa (a única viva da cena era a companheira) contra
        quem a frase nomeia — T8–T10, T28, T33–T37;
     2. a escuta que relia, pela frase-modelo do catálogo, a fala que o livro
        de tentativas já tinha fechado — T28/T33;
     3. o sim de quem «não perde nada» fechava no livro o pedido seguinte;
     4. «vou até o cais» estando no cais — T48;
     5. as buscas: a taxa de achado, o achado que chega à bolsa, a coisa
        nomeada junto de outra, e o dono dito pelo ofício.
   As frases são da sessão (nossas, do testador do projeto). */
import fs from "node:fs";
import path from "node:path";
import { lerAcao, registrarTentativa } from "../src/desafios.js";
import { chamadoDoMomento } from "../src/a-cena-do-jogo.js";
import { O_ALVO_DA_FALA, estranhoAQuemSeFala } from "../src/motor/a-regua-do-momento.js";
import { O_QUE_ACONTECE_SEM_DADO, oQueAconteceSemDado } from "../src/o-mestre-vivo-no-jogo.js";
import { resolverLugar, PISTAS_DE_AQUI } from "../src/resolver.js";
import { aCoisaAoToqueDaFrase, oQueOAchadoDa, O_ESCONDIDO_NAS_COISAS } from "../src/o-que-ha-nas-coisas.js";
import { coisasQueAFraseNomeia } from "../src/cena-do-momento.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };
const sec = (s) => console.log(`\n[${s}]`);
const app = fs.readFileSync(path.join("..", "src", "App.jsx"), "utf8");

/* ---------------- A FEIRA DA SESSÃO ----------------
   Na Feira do Saque o registro só tinha a companheira (Dagny): a meio-orc,
   o estivador, o ceifador e o guarda eram gente da cena que o elenco não
   guardava. `pessoaNaFrente` é a regra do App (App.jsx: pessoaNaFrente):
   o nome dito; senão a única viva; senão a única de fora do grupo. */
const VIVOS = [{ nome: "Dagny", relacao: "companheiro", papel: "ladina" }];
const pessoaNaFrente = (txt) => {
  const n = String(txt || "").toLowerCase();
  const dito = VIVOS.find((v) => n.includes(v.nome.toLowerCase()));
  if (dito) return dito;
  if (VIVOS.length === 1) return VIVOS[0];
  return null;
};
const RETRATO = {
  lugar: { nome: "Feira do Saque", tipoDoLocal: "mercado de espólios" }, cidade: "Ponta do Sal", minuto: 660,
  pessoas: [], grupo: [{ nome: "Dagny" }], heroi: { condicoes: [], inventario: ["Espada Longa", "Faca herdada"] },
  semente: "sessao-6", dia: 3, saqueados: [],
};
const leituraDe = (tentativas) => ({
  personagem: { nivel: 1, inventario: ["Faca herdada"], habilidades: [], equipado: { arma: "Espada Longa" }, moedas: 15, grupo: [{ nome: "Dagny" }] },
  semente: "sessao-6", lugar: "Feira do Saque", tentativas, dia: 3, chaveFina: true,
  ehPessoaConhecida: (x) => /dagny/i.test(x), pessoaDe: pessoaNaFrente, achadoDe: () => null, objetoEmCena: () => false,
});
/* o turno, como no App: o momento; o livro fecha o que rolou (aqui, passou)
   e o sim sem dado que fecha (oQueAconteceSemDado) */
function jogar(frases) {
  let tent = {};
  const out = [];
  for (const f of frases) {
    const m = chamadoDoMomento(f, leituraDe(tent), { ...RETRATO, tentativas: tent }, {});
    const v = m.veredito;
    let fecha = !!m.rola;
    if (!m.rola && v && v.tipo === "teste") { try { fecha = oQueAconteceSemDado(v, m, { frase: f }).fecha; } catch { fecha = false; } }
    if (v && v.tipo === "teste" && v.chave && fecha) tent = registrarTentativa(tent, v.chave, { resultado: "sucesso", dia: 3 });
    out.push({ f, m, v });
  }
  return out;
}
const SESSAO = [
  "peço ao estivador do tabuleiro que me dê um peixe seco",                          // T8
  "peço à meio-orc da banca que me dê um pedaço de corda",                           // T9
  "peço a Dagny que me dê a adaga dela",                                              // T10
  "regateio com a meio-orc da banca: as rações de viagem pela metade do preço",      // T28
  "regateio com a vendedora o preço do couro batido, quero pela metade",             // T29
  "regateio com Dagny, que me deve um favor, o preço das tochas do balcão",          // T31
  "dou uma moeda ao estivador do tabuleiro e peço um peixe seco",                    // T32
  "dou duas moedas ao guarda e tento convencê-lo a me deixar passar",                // T33
  "minto ao estivador do tabuleiro: sou inspetora do porto e preciso ver os registros", // T34
  "minto ao ceifador: sou prima da governadora",                                     // T35
  "minto a Dagny: perdi a minha bolsa de moedas na feira",                           // T36
  "ameaço a meio-orc da banca: se não baixar o preço do couro, quebro a sua banca",  // T37
];
const J = jogar(SESSAO);
const turno = (n) => J[{ 8: 0, 9: 1, 10: 2, 28: 3, 29: 4, 31: 5, 32: 6, 33: 7, 34: 8, 35: 9, 36: 10, 37: 11 }[n]];

sec("1. o palpite da pessoa não ganha de quem a frase nomeia");
{
  const ctx = leituraDe({});
  const v34 = lerAcao(SESSAO[8], ctx);
  t("«minto ao estivador…»: a conversa não é com a companheira (a única viva do registro)", v34 && v34.tipo === "teste" && !v34.pessoa && /\|estivador\|/.test(v34.chave), v34 && v34.chave);
  const v28 = lerAcao(SESSAO[3], ctx);
  t("«regateio com a meio-orc…»: a chave leva a meio-orc", v28 && /\|meio-orc\|/.test(v28.chave), v28 && v28.chave);
  /* o catálogo não ouve «peço à meio-orc…» sozinho: é a escuta que o lê, e
     o veredito do turno é o dela */
  const v9 = turno(9).v;
  t("«peço à meio-orc da banca que…»: o «à» depois do verbo de pedir diz o ouvinte", v9 && v9.tipo === "teste" && /\|meio-orc\|/.test(v9.chave), v9 && v9.chave);
  const v36 = lerAcao(SESSAO[10], ctx);
  t("«minto a Dagny…»: com o nome dito, a pessoa é ela", v36 && v36.pessoa && v36.pessoa.nome === "Dagny");
  const semNome = lerAcao("tento convencê-lo a me emprestar a corda", ctx);
  t("sem ouvinte nenhum na frase, o palpite fica (a conversa a dois com a companheira)", semNome && semNome.pessoa && semNome.pessoa.nome === "Dagny");
  const desligada = lerAcao(SESSAO[8], { ...ctx, chaveFina: false });
  t("com a chave do Mestre vivo desligada, nada muda (o palpite de sempre)", desligada && desligada.pessoa && desligada.pessoa.nome === "Dagny");
  t("«pra taverna» não é ouvinte: o lugar não tira a pessoa da conversa",
    (() => { const v = lerAcao("tento convencê-la a me levar pra taverna", ctx); return v && v.pessoa && v.pessoa.nome === "Dagny"; })());
  t("o alvo da régua: «peço à meio-orc da banca que…» é a meio-orc, não a companheira",
    estranhoAQuemSeFala(SESSAO[1], { pessoas: [{ nome: "Dagny", papel: "", estados: ["do_grupo"] }], criaturas: [], coisas: [], cena: { estados: [] } }) === "meio-orc");
  t("e «vou a pé» não tem ouvinte (o «a» sozinho só conta depois do verbo de pedir, com a fala logo a seguir)", !O_ALVO_DA_FALA.pedidoA.test("vou a pe ate a praca"));
}

sec("2. a sessão de novo: faltou dado em T28, T33, T35 e T36");
{
  t("T28 — o regateio das rações rola", turno(28).m.rola === true, turno(28).m.porque);
  t("T33 — o suborno ao guarda, «tento convencê-lo», rola", turno(33).m.rola === true, turno(33).m.porque);
  t("T35 — a mentira ao ceifador rola", turno(35).m.rola === true, turno(35).m.porque);
  t("T36 — a mentira à companheira rola", turno(36).m.rola === true, turno(36).m.porque);
  t("T34 e T37 — quem reage é o estivador e a meio-orc, não a companheira",
    turno(34).m.alvo === "estivador" && turno(37).m.alvo === "meio-orc", `${turno(34).m.alvo} · ${turno(37).m.alvo}`);
  t("e o que não rolava continua sem dado: T8, T9, T10, T31, T32 (pedir de graça, pedir à companheira, o favor devido)",
    [8, 9, 10, 31, 32].every((n) => turno(n).m.rola === false), [8, 9, 10, 31, 32].map((n) => `${n}:${turno(n).m.porque}`).join(" "));
}

sec("3. o livro fechado não se reabre pela frase-modelo");
{
  /* o livro já fechou o pedido à meio-orc (o mesmo degrau): a régua não relê
     a fala pela frase-modelo do catálogo («tento convencer o guarda…») */
  const ctx = leituraDe({});
  const v = lerAcao(SESSAO[3], ctx);
  const tent = registrarTentativa({}, v.chave, { resultado: "sucesso", dia: 3 });
  const m = chamadoDoMomento(SESSAO[3], leituraDe(tent), { ...RETRATO, tentativas: tent }, {});
  t("o regateio que o livro já deu como conseguido não rola (e nada leva a chave do guarda)",
    m.rola === false && !(m.veredito && /guarda/.test(String(m.veredito.chave || ""))), `${m.porque} · ${m.veredito && m.veredito.chave}`);
}

sec("4. o sim que não fecha no livro");
{
  t("a tabela diz quem não fecha, e é um porquê da régua que cala por ausência", O_QUE_ACONTECE_SEM_DADO.naoFecha.includes("falaSemOposicao")
    && O_QUE_ACONTECE_SEM_DADO.naoFecha.every((p) => O_QUE_ACONTECE_SEM_DADO.social.includes(p)));
  const social = { tipo: "teste", id: "convencer", social: { tamanho: "favor", cede: "x: y" }, dc: 14, pericia: "persuasao" };
  t("quem não perde nada com isso: o sim vale, e não fecha", (() => { const q = oQueAconteceSemDado(social, { porque: "falaSemOposicao" }); return q.efeito === "social" && q.fecha === false; })());
  t("quem está do meu lado: o sim fecha, como antes", oQueAconteceSemDado(social, { porque: "dispostoCede" }).fecha === true);
}

sec("5. ir para onde já se está não é viagem (T48)");
{
  const ilhas = { cidades: [
    { nome: "Ponta do Sal", porte: "porto", tipo: "porto", populacao: 2400, regiao: "O Arquipélago", bioma: "ilha", x: 40, y: 50, descoberta: true },
    { nome: "Ilha das Ossadas", porte: "fundeadouro", tipo: "fundeadouro", populacao: 300, regiao: "O Arquipélago", bioma: "ilha", x: 70, y: 30, descoberta: true },
    { nome: "Recife Funda", porte: "fundeadouro", tipo: "fundeadouro", populacao: 500, regiao: "O Arquipélago", bioma: "ilha", x: 20, y: 70, descoberta: true },
  ] };
  const r = resolverLugar("vou até o cais", ilhas, { excluir: "Ponta do Sal" });
  t("«vou até o cais» num porto não abre a escolha de outras ilhas: fica aqui", r.tipo === "nada" && r.naoParte === true && r.ficaAqui === true, r.tipo);
  t("e o App, com `naoParte`, segue a cascata sem cartão", /if \(r && r\.naoParte\) return false;/.test(app));
  t("o nome de outra ilha continua a ser viagem", (() => { const x = resolverLugar("vou para Recife Funda", ilhas, { excluir: "Ponta do Sal" }); return x.tipo === "achei" && x.escolha.cidade.nome === "Recife Funda"; })());
  t("a direção nunca prende aqui («vamos para o norte» de uma ilha do norte segue sendo estrada)", !PISTAS_DE_AQUI.includes("norte")
    && resolverLugar("vamos para a ilha do norte", ilhas, { excluir: "Ponta do Sal" }).ficaAqui !== true);
  const terra = { cidades: [
    { nome: "Vau", porte: "aldeia", tipo: "aldeia", populacao: 200, bioma: "floresta", x: 10, y: 10, descoberta: true },
    { nome: "Baixa das Velas", porte: "porto", tipo: "porto", populacao: 9000, bioma: "costa", x: 60, y: 60, descoberta: true },
  ] };
  t("e «vamos para o porto» longe do mar continua a achar o porto", (() => { const x = resolverLugar("vamos para o porto", terra, { excluir: "Vau" }); return x.tipo === "achei" && x.escolha.cidade.nome === "Baixa das Velas"; })());
}

sec("6. as buscas: a taxa, a bolsa, as duas coisas e o dono dito pelo ofício");
{
  const FEIRA = { nome: "Feira do Saque", tipoDoLocal: "mercado de espólios" };
  const TAVERNA = { nome: "Casa do Vento Sul", tipoDoLocal: "taverna do porto" };
  const N = 1500;
  /* a mesma fiação do App: o achado e a chave pela coisa ao toque da frase
     (App.jsx: aCoisaAoToqueAgora → achadoDe, coisaDaBusca), o retrato com o
     mesmo lugar, a mesma semente, o mesmo dia */
  const turnoDeBusca = (frase, lugar, semente, dia) => {
    const o = { semente, lugar, cidade: "Ponta do Sal", jornada: false, masmorra: null, dia, saqueados: [] };
    const leitura = { personagem: { nivel: 1, inventario: [], equipado: {}, moedas: 10 }, semente, lugar: lugar.nome, tentativas: {}, dia, chaveFina: true,
      pessoaDe: () => null, ehPessoaConhecida: () => false, objetoEmCena: () => false,
      achadoDe: (a, f) => { const c = aCoisaAoToqueDaFrase(f, o, coisasQueAFraseNomeia); return c && c.achado ? c.achado : null; },
      coisaDaBusca: (f) => { const c = aCoisaAoToqueDaFrase(f, o, coisasQueAFraseNomeia); return c ? c.nome : ""; } };
    const m = chamadoDoMomento(frase, leitura, { lugar, cidade: "Ponta do Sal", minuto: 600, pessoas: [], grupo: [{ nome: "Dagny" }],
      heroi: { condicoes: [], inventario: [] }, semente, dia, saqueados: [] }, {});
    return { m, ct: aCoisaAoToqueDaFrase(frase, o, coisasQueAFraseNomeia) };
  };
  const medir = (frase, lugar) => {
    let tem = 0, rolaCerto = 0, chega = 0;
    for (let i = 0; i < N; i++) {
      const { m, ct } = turnoDeBusca(frase, lugar, "prova-" + i, 1 + (i % 9));
      const achado = !!(ct && ct.achado);
      if (achado) tem++;
      if (m.rola === achado) rolaCerto++;
      /* passou: o achado que o veredito leva entra na bolsa pela tabela (oQueOAchadoDa, o que pagarOAchadoDaCoisa aplica) */
      const v = m.veredito, g = m.rola && v && v.achado ? oQueOAchadoDa(v.achado) : null;
      if (achado && g && (g.moedas > 0 || g.consumivel)) chega++;
    }
    return { taxa: tem / N, rolaCerto, chega, tem };
  };
  const cestos = medir("reviro os cestos de peixe seco ao lado das barracas", FEIRA);
  const pM = O_ESCONDIDO_NAS_COISAS.proporcao.mercado;
  t(`a taxa de achado nos cestos do mercado bate com a tabela (${pM}): ${cestos.taxa.toFixed(3)}`, Math.abs(cestos.taxa - pM) < 0.04);
  t("rola exatamente quando a coisa guarda algo", cestos.rolaCerto === N, cestos.rolaCerto);
  t("e todo achado com o dado passado chega à bolsa pela tabela", cestos.chega === cestos.tem, `${cestos.chega}/${cestos.tem}`);
  const duas = medir("olho debaixo das mesas e dos bancos da taverna procurando algo caído", TAVERNA);
  t("duas coisas nomeadas: rola quando uma delas guarda algo, e o achado é o dela (nunca um dado sem nada a ganhar)",
    duas.rolaCerto === N && duas.chega === duas.tem, `${duas.rolaCerto} · ${duas.chega}/${duas.tem}`);
  const dono = medir("reviro os cestos do vendedor de peixe", FEIRA);
  t("o dono dito pelo ofício, sem olhar: a busca é nos cestos (o achado chega, e a chave é a dos cestos)", dono.rolaCerto === N && dono.chega === dono.tem, `${dono.rolaCerto} · ${dono.chega}/${dono.tem}`);
  const um = turnoDeBusca("reviro os cestos do vendedor de peixe", FEIRA, "prova-0", 1);
  t("…e a chave do livro nunca é a do lugar inteiro (falhar não fecha a feira toda)", !/\|busca$/.test(String((um.m.veredito || {}).chave || "")), (um.m.veredito || {}).chave);
  t("no App, o achado da coisa vai à bolsa por pagarOAchadoDaCoisa, com saque na base", /r\.achado\.especie === "coisa"\) \{[\s\S]{0,400}pagarOAchadoDaCoisa\(r\.achado, persT\)/.test(app) && /registrarSaque\(achado\.id\)/.test(app));
  /* a conta da sessão: as coisas distintas reviradas sem dado e vazias — os
     cinco do mercado (cestos, caixotes, sacos, carroça, barris), as tábuas do
     cais e as mesas e os bancos da taverna. Os barris da taverna rolaram (logo
     guardavam algo) e o dado falhou; a revista sob o olhar da vendedora rola
     sempre. */
  const pD = O_ESCONDIDO_NAS_COISAS.proporcao.docas, pT = O_ESCONDIDO_NAS_COISAS.proporcao.taverna;
  const tudoVazio = Math.pow(1 - pM, 5) * (1 - pD) * Math.pow(1 - pT, 2);
  t(`a sessão vazia é azar que a tabela admite: ${(100 * tudoVazio).toFixed(1)}% (≈ 1 em ${Math.round(1 / tudoVazio)})`, tudoVazio > 0.05 && tudoVazio < 0.2);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
