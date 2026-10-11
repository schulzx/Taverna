/* ============================================================
   A LEITURA DE UMA PESSOA (11/10, MM11 · 5.ª sessão, M32)

   O turno real (registo-s5.jsonl, chamada 67): "Não acredito nele… tento
   ler se ele está mentindo", na Ponte Lenta, Hakon ao lado e o homem
   magro da cicatriz (Edric) à frente. Intuição d20 15 + 4 = 19 contra 15,
   SUCESSO — e o envelope só dizia "revele UMA coisa concreta e útil sobre
   ler a intenção". O Mestre não revelou nada. Esta suíte prende:
     · a verdade sai da ficha da pessoa, na camada que o teste compra;
     · a pergunta do jogador puxa a camada ("se mente" → mente);
     · o crítico compra duas, e só ele o conteúdo do que se esconde;
     · o que a espinha guarda nunca sai por aqui;
     · e o App: quem está à frente é o único de fora do grupo, o "sim" do
       mundo viaja com o dado, e a leitura entra no envelope do sucesso.
   ============================================================ */
import fs from "node:fs";
import { leituraDaPessoa, envelopeDaLeitura, CAMADAS_DA_LEITURA, PERGUNTA_DA_LEITURA, VERDADES_DA_LEITURA } from "../src/leitura-de-pessoa.js";
import { lerAcao } from "../src/desafios.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const J32 = "Não acredito nele… tento ler se ele está mentindo";
/* a pessoa como `pessoasDaCena` a monta (App.jsx) */
const EDRIC = {
  nome: "Edric", papel: "fugitivo", temperamento: "desconfiado",
  quer: "chegar à Ponte Lenta antes de quem o procura", teme: "a moeda falsa saiu da mão dele, não do padeiro",
  relacao: "desconhecido", meDeve: false, euDevo: false, ehCompanheiro: false,
};

console.log("\n[as tabelas]");
ok(CAMADAS_DA_LEITURA[CAMADAS_DA_LEITURA.length - 1].id === "quem", "a última camada (quem é comigo) sempre abre");
ok(PERGUNTA_DA_LEITURA.some((p) => p.camada === "mente"), "a pergunta pode puxar a mentira");
ok(VERDADES_DA_LEITURA.sucesso === 1 && VERDADES_DA_LEITURA.critico === 2, "uma verdade no sucesso, duas no crítico");

console.log("\n[o J32: o mundo disse que mente, e o teste passou]");
const l = leituraDaPessoa(EDRIC, { mente: "sim", pergunta: J32 });
ok(l && l.camadas[0] === "mente" && l.linhas.length === 1, "uma verdade, e é a da mentira");
ok(/Edric está a mentir-me/.test(l.linhas[0]) && /Ponte Lenta/.test(l.linhas[0]), `com o que ela serve: ${l.linhas[0]}`);
const env = envelopeDaLeitura(l);
ok(/\[A LEITURA — O QUE O SISTEMA SABE DE EDRIC\]/.test(env) && env.includes(l.linhas[0]), "o envelope leva a verdade inteira");
ok(!/moeda falsa/.test(env), "e o conteúdo do que esconde NÃO vai num sucesso comum");

console.log("\n[sem o mundo perguntado: a pedida sem dado cede à ordem do rosto]");
const l2 = leituraDaPessoa(EDRIC, { pergunta: J32 });
ok(l2.camadas[0] === "quer" && /quer de verdade/.test(l2.linhas[0]), "sem 'mente' na ficha, vem o que ele quer");
const l3 = leituraDaPessoa(EDRIC, { pergunta: "o que ele esconde?" });
ok(l3.camadas[0] === "esconde" && /esconde alguma coisa/.test(l3.linhas[0]), "quem pergunta o que esconde ouve que esconde (sem o quê)");

console.log("\n[o crítico]");
const lc = leituraDaPessoa(EDRIC, { mente: "sim", pergunta: "o que ele esconde?", critico: true });
ok(lc.linhas.length === 2, "duas verdades");
ok(lc.linhas.some((x) => /moeda falsa saiu da mão dele/.test(x)), "e o crítico vê o que ele esconde");

console.log("\n[o que a espinha guarda não sai daqui]");
const SEG = [{ nome: "Boca de Pedra Torta", gente: [{ nome: "Edric", papel: "fugitivo" }] }];
const ls = leituraDaPessoa({ nome: "Edric" }, { segredos: SEG, critico: true });
ok(ls.camadas.includes("sabe") && ls.linhas.some((x) => /sabe de Boca de Pedra Torta mais do que diz/.test(x)), "sabe do lugar mais do que diz");
ok(ls.linhas.every((x) => !/esconde (um|uma|o|a) /.test(x)), "e não diz o que o lugar esconde");

console.log("\n[sempre há uma verdade, e nunca sem pessoa]");
ok(leituraDaPessoa(null) === null, "sem pessoa, nada");
const lq = leituraDaPessoa({ nome: "Osric", relacao: "rival", temperamento: "sorridente" });
ok(lq.camadas[0] === "quem" && /não joga a meu favor/.test(lq.linhas[0]) && /sorridente/.test(lq.linhas[0]), "a ficha mínima ainda diz quem ela é comigo");
ok(leituraDaPessoa({ nome: "Ione", meDeve: true }).camadas[0] === "laco", "quem me deve sente-o");
ok(envelopeDaLeitura(null) === "", "envelope vazio sem leitura");

console.log("\n[a frase real abre o teste da mentira]");
const v = lerAcao(J32, { personagem: { atributos: {} }, semente: 3, lugar: "Ponte Lenta", pessoaDe: () => EDRIC });
ok(v && v.tipo === "teste" && v.pericia === "intuicao", "é o teste de Intuição");
ok(v.oportunidade && v.oportunidade.pergunta === "estaMentindo" && v.quem === "Edric", "com pessoa, o mundo é perguntado antes do dado");

console.log("\n[a fiação no App]");
const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
ok(/const deFora = vivos\.filter\(\(n\) => !doGrupo\.has\(n\.nome\)\);\s*return deFora\.length === 1 \? deFora\[0\] : null;/.test(app), "à frente está o único de fora do grupo");
ok(/if \(v\.oportunidade\.pergunta === "estaMentindo"\) menteDoMundo = "sim";/.test(app) && /rolarDesafio\(menteDoMundo \? \{ \.\.\.v, mente: menteDoMundo \} : v, acao\);/.test(app), "o 'sim, mente' viaja com o dado");
const iLeit = app.indexOf('calou("a leitura da pessoa"');
const iEnv = app.indexOf("let env = (passou && des && des.fechaDepois");
ok(iLeit > iEnv && /if \(passou && des && des\.pericia === "intuicao"/.test(app) && /env = `\$\{env\}\\n\$\{envelopeDaLeitura\(l\)\}`/.test(app), "a leitura entra no envelope do sucesso, em try/calou");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
