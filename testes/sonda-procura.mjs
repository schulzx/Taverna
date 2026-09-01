const S = "../src/";
const { lerAcao } = await import(S + "desafios.js");
const { nomeProcurado, ehProcura, procurarPessoa, linhaDaProcura, envelopeDaProcura } = await import(S + "procura.js");
const { porSituacao, SITUACOES } = await import(S + "mundo-base.js");

const FRASE = "Procuro por sinais de Ione";
const nomes = ["Ione Vantel", "Kael", "Fina Da Rede"];
console.log("nome na frase:", JSON.stringify(nomeProcurado(FRASE, nomes)));
console.log("é procura?", ehProcura(FRASE));

const ctxSem = { personagem: {}, semente: "x", lugar: "A Caneca Torta", tentativas: {}, dia: 1, achadoDe: () => null };
console.log("\nSEM o guarda (lista vazia):", (lerAcao(FRASE, ctxSem) || {}).rotulo || "nada");
const ctxCom = { ...ctxSem, ehPessoaConhecida: (t) => !!nomeProcurado(t, nomes) };
console.log("COM o guarda:", (lerAcao(FRASE, ctxCom) || {}).rotulo || "nada — a procura assume");
console.log("e 'vasculho o quarto' continua:", (lerAcao("vasculho o quarto", ctxCom) || {}).rotulo);

const mapa = { cidades: [{ nome: "Prata Velha", x: 30, y: 40 }, { nome: "Ponto do Rei", x: 60, y: 20 }] };
const casos = [
  ["no grupo", { grupo: [{ nome: "Ione Vantel" }] }],
  ["aqui, na base", { genteDaqui: [{ nome: "Ione Vantel", local: "A Caneca Torta", papel: "taverneira" }] }],
  ["noutra cidade", { npcs: { a: { nome: "Ione Vantel", local: "Ponto do Rei" } }, cidadeAtual: "Prata Velha", mapa }],
  ["cativa aqui", { genteDaqui: [{ nome: "Ione Vantel", local: "A Fossa" }], base: porSituacao(null, "Ione Vantel", SITUACOES.cativa, { onde: "A Fossa", quem: "o carcereiro" }) }],
  ["morta", { base: porSituacao(null, "Ione Vantel", SITUACOES.morta) }],
  ["ninguém", {}],
];
for (const [rot, ctx] of casos) {
  const r = procurarPessoa("Ione Vantel", ctx);
  console.log(`\n${rot.toUpperCase()} → ${r.desfecho}`);
  console.log("   " + linhaDaProcura(r));
  console.log("   " + envelopeDaProcura(r).slice(0, 130) + "…");
}
