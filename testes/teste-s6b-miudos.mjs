/* OS MIÚDOS DA PROVA JOGADA (lote 2 do lançamento, S6b, 15/11/2026).
   Cada um foi visto na tela por quem jogou como um estranho; cada um tem a
   causa achada e uma prova aqui:
     1. «camada 1 · 4 tochas» — o índice da planta no cabeçalho;
     2. o cabeçalho com «4 tochas» e a Bolsa com «0 tochas» — duas fontes;
     3. «Monte clara» — o banco de nomes com adjetivo em minúscula (adiado: veja abaixo);
     4. o veredito «por gelo» e a Navegação «em floresta» — duas leituras do chão;
     5. a terceira porta da abertura «Olhar à volta» — o risco que quase nunca havia;
     6. «34» e «0» sem rótulo na Bolsa — a moeda e a essência só com glifo. */
import { readFileSync } from "node:fs";
import { camadaEmPalavras, fundoDaPlanta, cabecalhoDaCena, CAMADA_EM_PALAVRAS } from "../src/palco.js";

import { asPropostasDaAbertura, PROPOSTAS_DA_ABERTURA } from "../src/propostas-da-abertura.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const APP = readFileSync("../src/App.jsx", "utf8");
const BOLSA = readFileSync("../src/painel-bolsa-da-carta.jsx", "utf8");

console.log("\n1. a camada em palavras");
{
  t("a entrada", camadaEmPalavras(0, 3) === CAMADA_EM_PALAVRAS.entrada);
  t("o primeiro subsolo", camadaEmPalavras(1, 3) === "primeiro subsolo");
  t("a última é o fundo", camadaEmPalavras(3, 3) === CAMADA_EM_PALAVRAS.fundo);
  t("sem saber o fundo, o ordinal", camadaEmPalavras(3) === "terceiro subsolo");
  t("além da tabela, sem número", camadaEmPalavras(9) === CAMADA_EM_PALAVRAS.alem);
  t("lixo dá vazio", camadaEmPalavras(-1) === "" && camadaEmPalavras("x") === "");
  t("o fundo da planta", fundoDaPlanta([{ camada: 0 }, { camada: 2 }, { camada: 1 }]) === 2 && fundoDaPlanta(null) === null);
  const salas = [{ id: 0, camada: 0 }, { id: 1, camada: 1 }, { id: 2, camada: 2 }, { id: 3, camada: 3 }];
  const linhas = salas.map((s) => cabecalhoDaCena({ masmorra: { nome: "Cripta", salas, atual: s.id, tochas: 4 } }).onde).map((o) => (Array.isArray(o) ? o.join(" · ") : String(o)));
  t("nenhum cabeçalho diz um número de camada", linhas.every((l) => !/\bcamada \d/.test(l)), linhas.join(" | "));
  t("a sala do chefe é o fundo", /^fundo · 4 tochas$/.test(linhas[3]), linhas[3]);
}

console.log("\n2. as tochas: uma fonte só");
{
  t("a carta dos mantimentos lê as tochas de mantimentosDeUso (a do cabeçalho e da prateleira)",
    /mantimentos = \{ \.\.\.mantimentos, tochas: u\.contagens\.tochas, dados: u\.dados \}/.test(APP));
}

/* 3. «Monte clara»: NÃO consertado aqui. O nome da cidade é semente
   (rngDe(semente|nome)) de tudo o que nasce depois dele, e trocar a caixa do
   banco (CIDADE_B, geografia.js e moldes.js) muda os mundos novos inteiros —
   seis suítes com hash e dourado. Fica para uma etapa própria. */

console.log("\n4. a Navegação lê o chão da marcha");
{
  t("o terreno da Navegação vem da jornada, da ida ou da rota, e só depois do bioma daqui",
    /chaoDaMarcha = \(jN && jN\.terreno\) \|\| \(opcoes && opcoes\.ida && opcoes\.ida\.terreno\) \|\| \(rN && rN\.terreno\) \|\| "";/.test(APP)
    && /const bioma = chaoDaMarcha \|\| biomaDaqui\(\);\s*\/\* v9\.44/.test(APP));
}

console.log("\n5. a terceira porta é um risco");
{
  const ps = asPropostasDaAbertura({ riscos: ["Cripta dos Ratos"], cidade: "Monte Rasa" });
  const r = ps.find((p) => p.tipo === "risco");
  t("com uma masmorra à vista, ir até ela", r && r.verbo === "Explorar Cripta dos Ratos" && r.frase === "Vou até Cripta dos Ratos.", JSON.stringify(r));
  t("sem nenhuma, o genérico — em PT-BR", asPropostasDaAbertura({}).find((p) => p.tipo === "risco").verbo === PROPOSTAS_DA_ABERTURA.semNome.verbo && !/à volta/.test(PROPOSTAS_DA_ABERTURA.semNome.verbo));
  t("o App procura a masmorra mais perto, não só a da cidade", /riscos = \[\.\.\.todas\]\.sort\(\(a, b\) => dist\(a\) - dist\(b\)\)/.test(APP));
}

console.log("\n6. a Bolsa diz o que cada número conta");
{
  t("a moeda tem a palavra", /\{Number\(moedas\) === 1 \? "moeda" : "moedas"\}/.test(BOLSA));
  t("a essência só aparece quando há, e com a palavra", /const temEssencia = essencia != null && Number\(essencia\) > 0;/.test(BOLSA) && /de essência/.test(BOLSA));
}

console.log(`\n${ok} ok, ${mal} mal`);
if (mal) process.exit(1);
