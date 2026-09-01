/* teste-consequencias.mjs (v9.49) — condicao e do sistema, e so dele.
   Nasceu de "o ar quente ainda PRESO NA garganta" virando Agarrado (2t). */
import { custoDaFalhaCritica, linhaDoCusto, notaDoCusto, CUSTO_DA_FALHA, CONSEQUENCIAS_PROMPT } from "../src/consequencias.js";
import * as condicoes from "../src/condicoes.js";
import { criarCondicao, condicaoPorId, CONDICOES_PROMPT } from "../src/condicoes.js";
import { TIPOS_TESTE } from "../src/testes.js";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

sec("1. o cao de guarda da narracao nao existe mais");
{
  t("detectarCondicoesNarradas foi embora", condicoes.detectarCondicoesNarradas === undefined);
  t("detectarAliviosNarrados foi embora", condicoes.detectarAliviosNarrados === undefined);

  /* a frase do bug, palavra por palavra: nada no modulo pode transforma-la
     em mecanica — nao ha mais funcao que leia narrativa */
  const lidoresDeProsa = Object.keys(condicoes).filter((k) => /^detectar/.test(k));
  t(`nenhuma funcao le narrativa (achou: ${lidoresDeProsa.join(", ") || "nenhuma"})`, lidoresDeProsa.length === 0);
}

sec("2. o Mestre perdeu os dois campos");
{
  const app = fs.readFileSync("../src/App.jsx", "utf8");
  /* so podem sobrar MENCOES em comentario; nenhuma leitura de md.* */
  t("App nao le md.condicoes_adicionar", !/md\.condicoes_adicionar/.test(app));
  t("App nao le md.condicoes_remover", !/md\.condicoes_remover/.test(app));
  const prompt = fs.readFileSync("../src/prompt.js", "utf8");
  t("o esqueleto do JSON nao oferece mais os campos", !/"condicoes_(adicionar|remover)"/.test(prompt));
  t("o prompt diz que ele NAO aplica", /NÃO APLICA NEM REMOVE CONDIÇÃO/.test(CONDICOES_PROMPT));
  /* v9.68: o caminho certo deixou de ser pedir a rolagem — a IA nao pede
     nenhuma. Ela narra o perigo e o descreve no campo `perigo`; o sistema
     escolhe a salvaguarda, rola e cobra. */
  t("e aponta o caminho certo: narrar o perigo, nao pedir dado", /campo "perigo"/.test(CONDICOES_PROMPT));
  t("e diz explicitamente que ela nao pede rolagem", /Voc[eê] n[aã]o pede rolagem nenhuma/.test(CONDICOES_PROMPT));
}

sec("3. so o corpo paga pelo corpo");
{
  t("forca cobra", (custoDaFalhaCritica("forca") || {}).cond === "exausto");
  t("vigor cobra", (custoDaFalhaCritica("vigor") || {}).cond === "exausto");
  t("destreza cobra", (custoDaFalhaCritica("destreza") || {}).cond === "caido");

  t("percepcao NAO cobra", custoDaFalhaCritica("percepcao") === null);
  t("intelecto NAO cobra", custoDaFalhaCritica("intelecto") === null);
  t("presenca NAO cobra", custoDaFalhaCritica("presenca") === null);

  /* a tela manda o ROTULO ("Força"), o pedido manda o id ("forca") */
  t("aceita o rotulo com acento", (custoDaFalhaCritica("Força") || {}).cond === "exausto");
  t("aceita Destreza", (custoDaFalhaCritica("Destreza") || {}).cond === "caido");
  t("agilidade e destreza sao a mesma queda", custoDaFalhaCritica("agilidade").cond === custoDaFalhaCritica("destreza").cond);
  t("atletismo cai em forca", custoDaFalhaCritica("atletismo").cond === "exausto");

  t("vazio nao quebra", custoDaFalhaCritica("") === null && custoDaFalhaCritica(null) === null);
  t("atributo inventado nao cobra", custoDaFalhaCritica("sorte") === null);
}

sec("4. cada custo aponta para uma condicao que existe");
{
  for (const c of CUSTO_DA_FALHA) {
    t(`"${c.attr}" -> ${c.cond} existe no catalogo`, !!condicaoPorId(c.cond));
    t(`"${c.attr}" tem frase para o jogador`, !!c.linha && !!c.narrar);
  }
  /* todo tipo de teste do jogo esta decidido: ou cobra, ou explicitamente nao */
  for (const tt of TIPOS_TESTE) {
    const cobra = custoDaFalhaCritica(tt.atributo);
    const esperado = ["forca", "vigor", "destreza"].includes(tt.atributo);
    t(`"${tt.id}" ${esperado ? "cobra" : "nao cobra"}`, !!cobra === esperado);
  }
}

sec("5. o que o jogador le e o que o Mestre recebe");
{
  const custo = custoDaFalhaCritica("forca");
  const cond = criarCondicao(custo.cond, { origem: "falha crítica" });
  const linha = linhaDoCusto(custo, cond);
  t("a linha nomeia a falha critica", /Falha crítica/.test(linha));
  t("e diz qual condicao pegou", /Exausto/.test(linha));
  t("e o efeito, para ninguem adivinhar", /Desvantagem/.test(linha));

  const nota = notaDoCusto(custo, cond, "empurrar o portão de pedra");
  t("a nota traz o motivo do jogador", /empurrar o portão de pedra/.test(nota));
  t("manda narrar, nao decidir", /NÃO invente outra condição/.test(nota));
  t("e proibe desfazer", /não a desfa[çc]a/.test(nota));
  t("sem custo, sem texto", linhaDoCusto(null, null) === "" && notaDoCusto(null, null) === "");

  t("o prompt avisa que percepcao nao cobra", /percepção, intelecto e presença NÃO cobram/.test(CONSEQUENCIAS_PROMPT));
}

console.log(`\nconsequencias v9.49: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
