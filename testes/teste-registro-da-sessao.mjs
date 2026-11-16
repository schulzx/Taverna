/* ============================================================
   O REGISTRO DA SESSÃO (V10, 16/11) — src/registro-da-sessao.js
   A partir de uma sessão gravada (testes/sessao-s10.json: o save do
   início e as frases do jogador, turno a turno), mais os lances que a
   bandeja pousaria: o que o registro conta, a virada da visita, o fio
   mais quente e os fatos de «Da última vez…».
   ============================================================ */
import { readFileSync } from "node:fs";
import {
  REGISTRO_DA_SESSAO, PRIORIDADE_DO_FIO, FATOS_DA_ULTIMA_VEZ, LINHA_DA_ULTIMA_VEZ,
  garantirRegistroDaSessao, abrirSessao, anotarTurno, anotarLance, anotarLuta,
  oResumoDaSessao, aSessaoParaLembrar, oFioMaisQuente, osFatosDaUltimaVez, linhaDaUltimaVez,
} from "../src/registro-da-sessao.js";
import { lancamentoDoTeste, lancamento } from "../src/motor/a-bandeja.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const gravada = JSON.parse(readFileSync(new URL("./sessao-s10.json", import.meta.url), "utf8"));
const inicio = gravada.inicio;
const frases = gravada.turnos.map((x) => x.entrada && x.entrada.frase).filter(Boolean);

sec("o campo do save: novo, aditivo, nunca lança");
{
  const g = garantirRegistroDaSessao(null);
  t("save sem o campo dá o registro vazio", g.v === REGISTRO_DA_SESSAO.v && g.atual === null && g.ultima === null);
  t("lixo não estoura", garantirRegistroDaSessao({ atual: 7, ultima: "x" }).atual === null);
  const a = abrirSessao(null, inicio);
  t("a primeira abertura é a sessão 1, com a fotografia do estado", a.atual.n === 1 && a.atual.base && a.atual.base.moedas === (inicio.personagem.moedas || 0));
  t("ida e volta pelo JSON é a mesma coisa", JSON.stringify(garantirRegistroDaSessao(JSON.parse(JSON.stringify(a)))) === JSON.stringify(garantirRegistroDaSessao(a)));
}

sec("a sessão gravada: as frases e os dados");
let reg = abrirSessao(null, inicio);
const T0 = 1_700_000_000_000;
frases.slice(0, 12).forEach((f, i) => { reg = anotarTurno(reg, { frase: f, agora: T0 + i * 5 * 60000, lugar: i < 6 ? "Porto das Pedras" : "A Estrada do Sal", cena: "costa" }); });
const fraseDo20 = frases[3];
reg = anotarLance(reg, lancamentoDoTeste({ valor: 14, mod: 2, dc: 13, rotulo: "Percepção" }), { frase: frases[1], agora: T0 + 60000 });
reg = anotarLance(reg, lancamentoDoTeste({ valor: 20, mod: 3, dc: 15, rotulo: "Furtividade" }), { frase: fraseDo20, agora: T0 + 16 * 60000 });
reg = anotarLance(reg, lancamentoDoTeste({ valor: 1, mod: 0, dc: 12, rotulo: "Atletismo" }), { frase: frases[5], agora: T0 + 26 * 60000 });
reg = anotarLance(reg, lancamento({ rotulo: "Dano", dados: [{ faces: 8, valor: 8 }], papel: "dano" }), { frase: frases[6], agora: T0 + 31 * 60000 });
reg = anotarLuta(reg, { caidos: ["Rato gigante", "Rato gigante 2", "Rato gigante 3", "Bandido"], desfecho: "vitoria" });
{
  const a = reg.atual;
  t("12 turnos contados", a.turnos === 12);
  t("4 dados rolados, um 20 e um 1 naturais", a.dados.rolados === 4 && a.dados.vintes === 1 && a.dados.uns === 1);
  t("o 20 passou (conta para a noite do vinte)", a.dados.vinteQuePassou === 1);
  t("o maior dado é o 20, com a perícia, o alvo e a FRASE do jogador", a.maior.natural === 20 && a.maior.pericia === "Furtividade" && a.maior.alvo === 15 && a.maior.frase === fraseDo20.replace(/\s+/g, " ").trim().slice(0, REGISTRO_DA_SESSAO.tetoDaFrase));
  t("o d8 de dano conta como dado rolado, mas não disputa o maior", a.maior.natural === 20);
  t("os caídos pelo tipo: «Rato gigante 2» é um rato gigante", a.caidos["Rato gigante"] === 3 && a.caidos.Bandido === 1);
  t("os lugares pisados, sem repetir", a.lugares.join("|") === "Porto das Pedras|A Estrada do Sal");
  const r = oResumoDaSessao(a, { ...inicio, personagem: { ...inicio.personagem, moedas: (inicio.personagem.moedas || 0) + 30, xp: (inicio.personagem.xp || 0) + 120 } });
  t("o resumo: duração do primeiro ao último instante", r.minutos === 55, String(r.minutos));
  t("as moedas e o XP saem da diferença com a base", r.moedas === 30 && r.xp === 120);
  t("os caídos ordenados pelo mais numeroso", r.caidos[0].tipo === "Rato gigante" && r.caidosTotal === 4);
  t("sem cativeiro nem queda", r.queda === "");
}

sec("o desempate do maior: o mais recente");
{
  let r2 = abrirSessao(null, inicio);
  r2 = anotarLance(r2, lancamentoDoTeste({ valor: 17, dc: 10, rotulo: "A" }), { frase: "primeira" });
  r2 = anotarLance(r2, lancamentoDoTeste({ valor: 17, dc: 10, rotulo: "B" }), { frase: "segunda" });
  t("dois 17: fica o segundo", r2.atual.maior.frase === "segunda" && r2.atual.maior.pericia === "B");
  r2 = anotarLance(r2, lancamentoDoTeste({ valor: 20, dc: 25, rotulo: "C" }), { frase: "o vinte que falhou?" });
  t("o 20 natural é crítico (a bandeja não o dá por falha), e conta como o que passou", r2.atual.dados.vinteQuePassou === 1);
}

sec("as buscas fechadas, pela diferença com a base");
{
  const antes = { ...inicio, missoes: [{ id: 1, titulo: "O Salvo-Conduto da Ponte", status: "ativa" }, { id: 2, titulo: "Já feita", status: "concluida" }] };
  let r3 = abrirSessao(null, antes);
  r3 = anotarTurno(r3, { frase: "Entrego o salvo-conduto.", agora: T0 });
  const depois = { ...antes, missoes: [{ id: 1, titulo: "O Salvo-Conduto da Ponte", status: "concluida" }, { id: 2, titulo: "Já feita", status: "concluida" }] };
  const r = oResumoDaSessao(r3.atual, depois);
  t("só a que fechou nesta sessão conta", r.buscasFechadas === 1 && r.buscas[0] === "O Salvo-Conduto da Ponte");
  t("e o cativeiro vira «levada»", oResumoDaSessao(r3.atual, { ...depois, cativeiro: { dias: 2 } }).queda === "levada");
}

sec("a virada da visita");
{
  const v = abrirSessao(reg, inicio);
  t("a sessão com jogo vira a última; nasce a 2", v.ultima && v.ultima.turnos === 12 && v.atual.n === 2 && v.atual.turnos === 0);
  const v2 = abrirSessao(v, inicio);
  t("abrir e sair sem jogar não gasta número", v2.atual.n === 2 && v2.ultima.turnos === 12);
  t("a sessão a lembrar: a atual com jogo (o save ainda não virou)", aSessaoParaLembrar(reg) === reg.atual || aSessaoParaLembrar(reg).turnos === 12);
  t("…e a última, se a atual está vazia", aSessaoParaLembrar(v2).turnos === 12);
  t("sem jogo nenhum, nada a lembrar", aSessaoParaLembrar(abrirSessao(null, inicio)) === null);
}

sec("o fio mais quente: uma linha verdadeira, pela tabela");
{
  t("a tabela tem o passo da busca à frente", PRIORIDADE_DO_FIO[0].id === "passo");
  const passo = { quest: "nao_existe", texto: "Falar com a barqueira antes do anoitecer." };
  const f1 = oFioMaisQuente({ missoes: [{ id: 1, titulo: "Missão", status: "ativa" }] }, { passos: [passo], vilao: { alcunha: "o Homem da Cera" } });
  t("o passo ganha, com o texto do passo", f1.tipo === "passo" && f1.passo === passo.texto);
  const f2 = oFioMaisQuente({ missoes: [{ id: 1, titulo: "A ponte caída", objetivo: "Achar o pedreiro.", status: "ativa" }] }, { vilao: { alcunha: "o Homem da Cera" } });
  t("sem passo, a missão ativa", f2.tipo === "missao" && f2.pergunta === "A ponte caída" && f2.passo === "Achar o pedreiro.");
  const f3 = oFioMaisQuente({}, { vilao: { alcunha: "o Homem da Cera" } });
  t("sem nada, o vilão pela alcunha — nunca o nome que o herói não sabe", f3.tipo === "vilao" && f3.pergunta === "O que quer o Homem da Cera?");
  t("sem nada de nada, null (nunca inventado)", oFioMaisQuente({}, {}) === null);
  t("lixo não estoura", oFioMaisQuente(null, { passos: [null, 3] }) === null);
}

sec("«Da última vez…»: até três fatos, todos do resumo");
{
  const r = oResumoDaSessao(reg.atual, inicio);
  const fatos = osFatosDaUltimaVez(r);
  t(`no máximo ${FATOS_DA_ULTIMA_VEZ.teto}`, fatos.length >= 1 && fatos.length <= FATOS_DA_ULTIMA_VEZ.teto);
  t("o maior dado é dito com a perícia", fatos.some((f) => /20 em Furtividade/.test(f)));
  const linha = linhaDaUltimaVez(r, { pergunta: "A ponte caída", passo: "Achar o pedreiro." });
  t("a linha do Narrador cabe no teto", linha.length > 0 && linha.length <= LINHA_DA_ULTIMA_VEZ.teto, String(linha.length));
  t("e leva o fio", /Fica por dizer: A ponte caída/.test(linha));
  t("sem resumo, nada", linhaDaUltimaVez(null, null) === "" && osFatosDaUltimaVez(null).length === 0);
}

console.log(`\nregistro da sessão: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
