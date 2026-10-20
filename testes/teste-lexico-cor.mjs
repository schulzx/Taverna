/* teste-lexico-cor.mjs — o Léxico vira camada de cor (decisão da pessoa, 20/10)

   *"Como um fã ou jogador de RPG de mesa experiente, não seria legal ver os
   nomes diferentes das classes e raças que ele já está acostumado, mas ao
   mesmo tempo precisamos de algo original… o léxico da forma que está só
   está causando confusão."* À proposta — o nome do sistema é universal, o
   nome do mundo é único —: *"Sim."*

   O que ela viu: na ficha o humano aparecia como "Filho da Palha"; numa só
   campanha a moeda foi "cobres" na abertura e "lascas" depois (12.ª
   sessão), "moedas" e "marcos" (9.ª).

   Falha na árvore de antes (v9.473): `racaNaFicha`, `profissaoNaFicha`,
   `generoProprio` e `nomeDaMoeda` não existem; a ficha e o pedido dizem
   "Filho da Palha (o sistema chama de Humano)"; o pedido diz "moeda com
   nome do mundo" sem nome nenhum; o léxico que chega tarde troca a moeda. */
import fs from "node:fs";
import {
  GRUPOS_DE_RACA, PROFISSOES_DO_SISTEMA, garantirLexico, lerLexico, lexicoPrompt, soOVocabulario,
  chamadoDaRaca, racaNaFicha, profissaoNaFicha, generoProprio, nomeDaMoeda,
} from "../src/lexico.js";
import { montarSystemPrompt } from "../src/prompt.js";
import { precosDaRua, precoComumParaPauta } from "../src/mercado.js";
import { pedidoDaAbertura } from "../src/abertura.js";
import { rngDe } from "../src/geografia.js";
import { MOEDAS_INICIAIS } from "../src/constantes.js";

const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const FICHA = fs.readFileSync(new URL("../src/painel-ficha.jsx", import.meta.url), "utf8");
const CARTA = fs.readFileSync(new URL("../src/carta-taro.jsx", import.meta.url), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* ---------------- os mundos sintéticos ----------------
   Sessenta mundos de fantasia, cada um com as dez raças renomeadas, as doze
   profissões renomeadas e uma moeda própria — o pior caso de "cor": tudo o
   que o Léxico pode renomear, renomeado. */
const COSTUMES = ["Filho da", "Gente do", "Povo da", "Os de", "Nascido na", "Sangue de"];
const COISAS_DE = ["Palha", "Pedra", "Bruma", "Cinza", "Raiz", "Maré", "Forja", "Neve", "Ferrugem", "Aurora"];
const MOEDAS = ["escamas", "marcos", "cobres", "lascas", "conchas", "anéis", "contas", "dentes", "fichas", "grãos",
  "pratinhas", "selos", "tostões", "vinténs", "réis", "dobras", "elos", "brasas", "pedrinhas", "luas"];
const DESCRICOES = ["Reinos em guerra e uma magia que cobra em memória.", "Um vale fechado por montanhas, onde os deuses dormem.",
  "Ilhas de pescadores sob a sombra de um dragão antigo.", "", "Um império caído e as cidades-estado que sobraram."];
function mundoDeFantasia(i) {
  const rnd = rngDe(`lexico-cor|${i}`);
  const pega = (a) => a[Math.floor(rnd() * a.length)];
  const racas = GRUPOS_DE_RACA.fantasia.map((raca, k) => ({ raca, chamado: `${pega(COSTUMES)} ${COISAS_DE[(k + i) % COISAS_DE.length]}` }));
  const profissoes = PROFISSOES_DO_SISTEMA.map((profissao, k) => ({ profissao, chamado: `ofício ${k}-${i}` }));
  const moeda = MOEDAS[i % MOEDAS.length];
  const lexico = lerLexico({
    chamado: { moeda, masmorra: "fenda", taverna: "estalagem de pedra" },
    racas, profissoes,
    aLei: "todo juramento tem peso", povos: ["a", "b", "c"], oficios: ["x", "y", "z", "w"],
    funciona: { heroi: "h", poder: "p", fama: "f", ameaca: "a" },
  });
  return { genero: "Fantasia medieval", descricao: DESCRICOES[i % DESCRICOES.length], lexico, moeda };
}
const MUNDOS = Array.from({ length: 60 }, (_, i) => mundoDeFantasia(i));
const BN = { elenco: [], cidades: [], tavernas: [] };
const pedido = (mundo, pers) => montarSystemPrompt("Brumal", mundo, pers, {}, BN, "", "ARCO", "", "", "TEMPO", "", { vivo: "", fixo: "" }, { emCidade: true });
const heroi = (raca, profissao) => ({ nome: "Hilda", nivel: 2, raca, classe: "Guerreiro", subclasse: "Campeão", profissao,
  atributos: { forca: 2, destreza: 0, vigor: 1, intelecto: 0, presenca: 0, percepcao: 0 }, vidaMax: 20, manaMax: 0 });

sec("1. EM 60 MUNDOS DE FANTASIA, A FICHA E O PEDIDO DIZEM O NOME DO SISTEMA");
{
  t("os 60 léxicos valem, e renomeiam as dez raças (a cor existe)", MUNDOS.every((m) => m.lexico.gerado && m.lexico.racas.length === 10));
  t("nenhum dos 60 é mundo de gênero próprio", MUNDOS.every((m) => !generoProprio(m)));
  let ficha = 0, oficio = 0, linha = 0, apelido = 0, total = 0;
  for (const m of MUNDOS) {
    for (const r of GRUPOS_DE_RACA.fantasia) {
      total++;
      if (racaNaFicha(m.lexico, r, generoProprio(m)) === r) ficha++;
      const prof = PROFISSOES_DO_SISTEMA[total % PROFISSOES_DO_SISTEMA.length];
      if (profissaoNaFicha(m.lexico, prof, generoProprio(m)) === prof) oficio++;
      const fc = (pedido(m, heroi(r, prof)).match(/FICHA DE CAMINHO: [^\n]*/) || [""])[0];
      if (fc.startsWith(`FICHA DE CAMINHO: ${r} (`) && fc.includes(`de profissão ${prof}.`)) linha++;
      /* o apelido sobrevive como COR, dito como o que a rua diz — nunca no lugar do nome */
      if (fc.includes(`(a rua diz "${chamadoDaRaca(m.lexico, r)}")`) && !/o sistema chama de/.test(fc)) apelido++;
    }
  }
  t(`a raça na ficha é a do sistema (${ficha}/${total})`, ficha === total);
  t(`a profissão na ficha é a do sistema (${oficio}/${total})`, oficio === total);
  t(`a FICHA DE CAMINHO do pedido abre pelo nome do sistema, raça e profissão (${linha}/${total})`, linha === total);
  t(`o apelido do mundo vai à prosa como o que a rua diz (${apelido}/${total})`, apelido === total);
  t("a classe e a subclasse nunca foram renomeadas, e continuam assim", MUNDOS.every((m) => /, Guerreiro \(Campeão\)/.test(pedido(m, heroi("Elfo", "Ferreiro")))));
}

sec("2. A MOEDA TEM UM NOME SÓ POR CAMPANHA, EM TODAS AS LINHAS");
{
  let um = 0;
  for (const m of MUNDOS) {
    const nome = nomeDaMoeda(m.lexico);
    const linhas = [
      pedido(m, heroi("Humano", "Ferreiro")),
      precosDaRua(1, { moeda: nome }),
      precoComumParaPauta("quanto custa uma cerveja?", { fator: 1, moeda: nome }).pergunta.join(" "),
      pedidoDaAbertura({ pista: { nome: "Brina", local: "a forja" }, chegada: "pela estrada", historia: "h", razao: "r", sabe: "s" }, { moeda: nome }),
    ].join("\n");
    const outras = MOEDAS.filter((x) => x !== nome && new RegExp(`\\b${x}\\b`, "i").test(linhas));
    if (nome === m.moeda && linhas.includes(`ECONOMIA: a moeda é «${nome}», nenhuma outra.`) && linhas.includes(`Começa com ${MOEDAS_INICIAIS} ${nome}.`)
      && linhas.includes(`na rua, em ${nome}:`) && linhas.includes(`(em ${nome})`) && !outras.length) um++;
  }
  t(`um nome só, e é o do léxico: no pedido, na rua, no PERGUNTOU e na abertura (${um}/60)`, um === 60);
  t("o bloco do léxico não repete a moeda — quem a diz é a ECONOMIA", MUNDOS.every((m) => !/moedas = /.test(lexicoPrompt(m.lexico))));
  t("mundo sem léxico: o nome é \"moedas\", e o pedido diz isso", nomeDaMoeda(null) === "moedas" && pedido({ genero: "Fantasia medieval" }, heroi("Humano", "")).includes('a moeda é «moedas», nenhuma outra'));
  t("o pedido já não manda o Narrador batizar a moeda", MUNDOS.every((m) => !/moeda com nome do mundo/.test(pedido(m, heroi("Humano", "")))));
  /* o léxico que chega DEPOIS de o mundo nascer: a abertura já disse "moedas" */
  t("o léxico que chega tarde não troca a moeda da nascença", MUNDOS.every((m) => nomeDaMoeda(soOVocabulario(m.lexico)) === "moedas"));
  t("e o resto do vocabulário chega (a masmorra continua fenda)", MUNDOS.every((m) => soOVocabulario(m.lexico).chamado.masmorra === "fenda"));
  t("a App usa o nome único para a pauta e para a bolsa", (APP.match(/nomeDaMoeda\(\(mundoAtual\(\) \|\| \{\}\)\.lexico\)/g) || []).length === 2 && !/comoChamam\(/.test(APP));
}

sec("3. MUNDOS DE GÊNERO PRÓPRIO: O DO MUNDO, COM O DO SISTEMA ENTRE PARÊNTESES");
{
  const futuro = lerLexico({
    chamado: { moeda: "créditos" }, aLei: "a rede vê tudo", povos: ["a", "b"], oficios: ["x", "y", "z", "w"],
    funciona: { heroi: "h", poder: "p", fama: "f", ameaca: "a" },
    racas: GRUPOS_DE_RACA.futuro.map((raca) => ({ raca, chamado: "Neo " + raca })),
    profissoes: PROFISSOES_DO_SISTEMA.map((profissao) => ({ profissao, chamado: "Técnico " + profissao.slice(0, 3) })),
  });
  for (const genero of ["Ficção científica", "Cyberpunk", "Pós-apocalíptico"]) {
    const m = { genero, lexico: futuro };
    t(`${genero}: "Neo Terrano (Terrano)"`, generoProprio(m) && racaNaFicha(futuro, "Terrano", generoProprio(m)) === "Neo Terrano (Terrano)");
  }
  const obra = { genero: "Fantasia medieval", descricao: "Um universo de caçadores modernos, inspirado em Solo Leveling, com portais na cidade.",
    lexico: lerLexico({ ...mundoDeFantasia(1).lexico, racas: GRUPOS_DE_RACA.fantasia.map((raca) => ({ raca, chamado: "Caçador " + raca })) }) };
  t("a descrição que cita uma obra/tempo moderno faz o mundo de gênero próprio", generoProprio(obra));
  t("e a ficha diz \"Caçador Humano (Humano)\"", racaNaFicha(obra.lexico, "Humano", generoProprio(obra)) === "Caçador Humano (Humano)");
  t("e o pedido também, sem o apelido da rua repetido", /FICHA DE CAMINHO: Caçador Humano \(Humano\), Guerreiro/.test(pedido(obra, heroi("Humano", "Ferreiro"))));
  t("a profissão segue a mesma régua", profissaoNaFicha(futuro, "Ferreiro", true) === "Técnico Fer (Ferreiro)" && profissaoNaFicha(futuro, "Ferreiro", false) === "Ferreiro");
  t("raça não renomeada não ganha parêntese vazio", racaNaFicha(null, "Terrano", true) === "Terrano");
  t("fantasia sem marca não é gênero próprio, com ou sem acento e caixa",
    !generoProprio({ genero: "Fantasia medieval", descricao: "Reinos antigos, MAGIA e dragões." }) && generoProprio({ genero: "Universo próprio", descricao: "Uma cidade MODERNA, com metrô." }));
  t("lixo não quebra", [null, undefined, "x", 3, {}].every((x) => generoProprio(x) === false));
}

sec("4. UM SAVE ANTIGO MOSTRA O NOME DO SISTEMA, SEM MIGRAÇÃO");
{
  /* o save como a pessoa o viu: o humano "Filho da Palha", a moeda "escamas" */
  const salvo = JSON.parse(JSON.stringify({ ...mundoDeFantasia(0).lexico, chamado: { moeda: "escamas" },
    racas: GRUPOS_DE_RACA.fantasia.map((raca) => ({ raca, chamado: raca === "Humano" ? "Filho da Palha" : "Gente " + raca })) }));
  const mundo = { genero: "Fantasia medieval", descricao: "", lexico: salvo };
  t("o léxico salvo guarda o apelido como estava (nada se reescreve)", garantirLexico(salvo).racas.find((r) => r.raca === "Humano").chamado === "Filho da Palha");
  t("e a ficha diz Humano", racaNaFicha(mundo.lexico, "Humano", generoProprio(mundo)) === "Humano");
  t("e a moeda continua escamas, a mesma de antes", nomeDaMoeda(mundo.lexico) === "escamas");
  t("a ficha lê pelo rótulo do sistema (cabeçalho e cartão)", (FICHA.match(/racaNaFicha\(\(mundo \|\| \{\}\)\.lexico, p\.raca, generoProprio\(mundo\)\)/g) || []).length === 2 && !/chamadoDaRaca/.test(FICHA));
  t("a criação e o trocar caminho também (raça e profissão)", (APP.match(/racaNaFicha\(mundo\.lexico, r\.nome, generoProprio\(mundo\)\)/g) || []).length === 2
    && (APP.match(/profissaoNaFicha\(mundo\.lexico, p?r?\.nome, generoProprio\(mundo\)\)/g) || []).length === 2 && !/chamadoDaRaca|chamadoDaProfissao/.test(APP));
  t("a carta do grupo diz a raça do sistema", /const abaixo = \[ente\.raca, ente\.classe, ente\.subclasse\]/.test(CARTA) && !/chamadoDaRaca/.test(CARTA));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
