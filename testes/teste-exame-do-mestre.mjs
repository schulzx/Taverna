/* teste-exame-do-mestre.mjs (M2 · 18/11/2026) — «o exame do Mestre».

   O desenho é mente/lancamento/o-mestre-vivo.md (§3 a régua do momento, §4 a
   cena que o Mestre lê, §8 o exame). O veredito de cada item sai do estudo das
   mesas reais (mente/lancamento/estudo-das-mesas.md §6 e §8); as frases são
   nossas, escritas ANTES de abrir o catálogo, para não serem moldadas pelas
   regex. O exame está em testes/exame-do-mestre.json.

   Isto é MEDIDA, não conserto. O Mestre de hoje recebe a frase do jeito que o
   jogo a passa — `lerAcao` → `porQueNaoChama` (e, no social, a conta da escada
   do pedido, que `lerAcao` já faz) — com o contexto que ele hoje aceita. O que
   da cena ele não sabe ler (medo, pressa, testemunha, vigia, perigo, motivo
   para negar), ele simplesmente não recebe: é esse buraco que se quer medir.

   O que da cena ENTRA, porque o Mestre de hoje tem porta para isso
   (PORTAS_DA_CENA, abaixo): a pessoa (relação, papel e segredo, por
   `pessoaDe`), o achado escondido (`achadoDe`), a armadilha em cena
   (`objetoEmCena`), a chuva e o escuro (`chove`, `escuro`) e o que o herói
   já sabe (`saber`, para a régua do saber comum).

   «Pede dado» é a convenção de teste-corpus-das-situacoes: um veredito de
   teste que `porQueNaoChama` não cala, ou que cala só por ser conversa (a
   conversa rola pela escada do pedido, sem o chamado).

   As catracas (CATRACA_DO_EXAME) guardam os números de hoje: os acertos não
   descem, os erros não sobem. Quando um número melhorar, move-se o piso para
   o novo valor, com a data — e só para esse lado. Pela regra da rodada, frase
   usada para afinar o Mestre sai do exame e entra outra (e a catraca da
   rodada nova recomeça da medida dela).

   M3+M4 (18/11/2026) — AS DUAS METADES E OS DOIS MESTRES.
   O exame foi repartido por semente fixa (`metades` no JSON; o par inteiro
   cai do mesmo lado): a metade A afina o Mestre, e só os erros DELA são
   impressos frase a frase (secção 3); a metade B é a prova, medida só em
   número. É a honestidade do exame: o que se afina contra a B deixa de
   medir frase nova.
   E a suíte mede dois Mestres lado a lado, sobre a mesma frase lida pelo
   mesmo catálogo: o de HOJE (`porQueNaoChama`, a conversa pela escada) e o
   da RÉGUA (motor/a-regua-do-momento.js), que recebe a cena do item inteira
   (cena-do-momento.js) — medo, pressa, testemunha, vigia, perigo, motivo
   para negar, o que antes não tinha porta.

   RODADA 2 (18/11/2026) — A PROVA RENOVADA.
   Os 14 itens da B que a suíte da M2 imprimiu frase a frase (antes da
   repartição) passaram para a A com o par de cada um (a mesma frase vazou
   junto), e 14 pares novos da mesma situação e da mesma cena tomaram o lugar
   deles. A cena que só existia na nota virou estado da tabela (muro molhado
   é perigo_fisico, ponte podre é fragil, o que espreita é algo_se_aproxima,
   o símbolo obscuro é assunto_raro), e `cenaDoExame` passa a levar à régua
   QUALQUER estado da tabela escrito na cena, cada um ao seu dono. E a B
   ganhou 90 itens novos (rodada 2), escritos sem abrir o catálogo.

   RODADA 3 (18/11/2026) — A PROVA DE NOVO VIRGEM.
   Na M5, quem afinava manteve ou tirou famílias de formas olhando o número
   agregado da B (o-mestre-vivo.md §13, a ressalva de honestidade): a B deixou
   de ser prova. E a A esgotou (164 de 167): já não tinha o que ensinar. Então
   a B inteira passou para a A (veio_da_b: 3), e uma B nova, toda da rodada 3,
   foi escrita do zero sem abrir o catálogo, a escuta nem a régua — as 97
   situações do estudo (§8 e §10.5) nos padrões de como o jogador brasileiro
   diz o que faz (§10.4).
   Duas marcas novas ficam FORA da catraca e são impressas à parte:
   `mesas_discordam` (a mesa em português rola bem menos a ação disputada; o
   veredito é o de §6, a base é fraca) e `destino` (o dado do destino, §10
   nº 93: o mestre rola sem perícia — o Mestre de hoje não tem como acertar).
   Os espontâneos também passam a ser medida à parte, sem catraca.
   E a suíte NUNCA imprime frase, cena nem id de item da B: os erros que se
   leem são só da A, e as asserções sobre a B dizem só números.

   O TREINO DA RODADA 3 (18/11/2026). Quem afinou mediu a B exatamente duas
   vezes (antes e depois) e trabalhou com a A repartida por semente em
   A-treino (2/3) e A-validação (1/3), por par, num script fora da suíte: os
   erros lidos foram só os da A-treino, e o que ficou foi o que a
   A-validação sustentou. 39 itens da A trocaram a nota pelo estado novo da
   tabela (marcados `estado_da_rodada_3`); a B não foi tocada. */
import fs from "node:fs";
import { lerAcao, DESAFIOS } from "../src/desafios.js";
import { ehDeclaracaoDeAtaque } from "../src/agressao.js";
import { porQueNaoChama, oChamado } from "../src/motor/o-mestre-chama.js";
import { valeRolagem, oQueACenaChama, familiaDaAcao } from "../src/motor/a-regua-do-momento.js";
import { lerCena, estadoPorId } from "../src/cena-do-momento.js";
import { PERICIAS } from "../src/pericias.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const pct = (a, b) => (b ? Math.round((100 * a) / b) + "%" : "—");

const EXAME = JSON.parse(fs.readFileSync(new URL("./exame-do-mestre.json", import.meta.url), "utf8"));
const MESA = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));
const SITUACOES = JSON.parse(fs.readFileSync(new URL("./corpus-das-situacoes.json", import.meta.url), "utf8"));

/* ---------------- AS CATRACAS (rodada 1, 18/11/2026) ----------------
   Contagens inteiras. Acertos: «não desce de». Erros: «não sobe de».

   MOVIDAS em 18/11 (M3+M4), e o motivo, como manda a lei: a catraca da M2
   era uma só, sobre o exame inteiro (rola certo 150, indevido 26, omitido
   99, categoria 93, perícia 41, pares 2, espontâneos 10). Com o exame
   repartido, um número só misturaria a metade que afina com a que prova —
   melhorar a A empurraria o total e esconderia uma B parada. Agora cada
   metade tem a sua, e cada Mestre a dele.
   E o Mestre de HOJE mudou de piso por um motivo que não é a régua: a M3
   ensinou o catálogo (desafios.js) a ouvir mais verbos da metade A, e o de
   hoje lê com o mesmo catálogo. Ouvir mais faz ele pedir mais — onde a mesa
   pediria e onde não pediria (pé ante pé com e sem guarda). É por isso que
   o seu «pede indevido» sobe: é o buraco que a régua fecha, e a catraca de
   hoje passa a guardar o número novo, não o antigo.

   MOVIDAS de novo na RODADA 2 (18/11/2026), e o motivo: o exame mudou de
   tamanho e de dono das frases — 28 itens passaram da B para a A (os 14 que
   vazaram na M2 e os seus pares), a B ganhou 118 itens novos (14 pares de
   troca e 90 itens) e a cena de 25 itens antigos ganhou o estado que só
   estava na nota. Pela regra da rodada, a catraca da rodada nova recomeça
   da medida dela: os números abaixo são os da primeira medida da rodada 2,
   com o mesmo catálogo e a mesma régua da M3+M4 (nada em src/ mudou).
   O piso da rodada 1, para comparar: hoje A 92 · 20 · 27 · cat 83 · per 47 ·
   pares 2 · esp 4; hoje B 79 · 15 · 42 · cat 50 · per 24 · pares 1 · esp 6;
   régua A 107 · 4 · 28 · cat 83 · per 46 · pares 16 · esp 7; régua B 86 · 4 ·
   46 · cat 50 · per 22 · pares 9 · esp 10.

   MOVIDAS na M5 (18/11/2026, «o treino»), só a da régua e só para cima: a
   régua ganhou a escuta da cena (a-escuta-da-cena.js), sete estados novos e
   oito linhas, e a medida subiu nas duas metades sem o indevido subir. O de
   hoje não mudou (nada da M5 toca o Mestre sem cena), e a catraca dele fica.
   A régua da rodada 2, para comparar: A 126 · 4 · 37 · cat 91 · per 51 ·
   pares 21 · esp 8; B 133 · 6 · 75 · cat 69 · per 32 · pares 15 · esp 24.
   Seis itens da A trocaram a aproximação pelo estado novo (E155, E157:
   coisa_comum; E166: do_heroi; E173, E175, E179: escorregadio no lugar de
   perigo_fisico); nenhum item da B foi tocado.

   MOVIDAS na RODADA 3 (18/11/2026), e o motivo: as duas metades mudaram de
   dono — a B da rodada 2 passou inteira para a A, e a B é outra, nova, de
   frases que ninguém viu. Pela regra da rodada, a catraca recomeça da medida
   dela: os números abaixo são os da primeira medida da rodada 3, com o mesmo
   catálogo, a mesma escuta e a mesma régua da M5 (nada em src/ mudou). Saem
   da catraca os espontâneos (agora medida à parte, impressa), e ela conta só
   os itens sem `mesas_discordam` nem `destino`.
   Os pisos da M5, para comparar (as metades de então):
   hoje A 106 · 24 · 37 · cat 91 · per 51 · pares 2 · esp 4;
   hoje B 120 · 22 · 72 · cat 69 · per 32 · pares 1 · esp 12;
   régua A 164 · 0 · 3 · cat 147 · per 83 · pares 48 · esp 8;
   régua B 162 · 5 · 47 · cat 108 · per 54 · pares 37 · esp 24.
   O de hoje com o catálogo antigo (ebf0f64): A 75 · 11 · 53 · cat 47 · per 21
   · pares 1 · esp 4; B 75 · 15 · 46 · cat 46 · per 20 · pares 1 · esp 6. */
const CATRACA_DO_EXAME = {
  data: "2026-11-18 (treino da rodada 3)",
  hoje: {
    A: { rolaCerto: 226, pedeIndevido: 46, deixaDePedir: 109, categoria: 160, pericia: 83, paresQueSeparam: 3 },
    B: { rolaCerto: 101, pedeIndevido: 31, deixaDePedir: 64, categoria: 70, pericia: 26, paresQueSeparam: 1 },
  },
  regua: {
    /* SUBIU no treino da rodada 3 (18/11/2026), só a régua da A e só para
       cima: a moldura como sinal, o palpite da cena, as formas brasileiras
       que a A-validação sustentou e 39 itens da A com o estado novo no lugar
       da nota (o-mestre-vivo.md §14). Era 326 · 5 · 50 · cat 255 · per 137 ·
       pares 85. A da B subiu com a segunda (e última) medida dela, o
       «depois»: era 143 · 7 · 46 · cat 99 · per 42 · pares 40. */
    A: { rolaCerto: 346, pedeIndevido: 2, deixaDePedir: 33, categoria: 275, pericia: 152, paresQueSeparam: 97 },
    B: { rolaCerto: 158, pedeIndevido: 6, deixaDePedir: 32, categoria: 119, pericia: 53, paresQueSeparam: 54 },
  },
};
/* o que a M2 mediu, antes de tudo isto (o exame inteiro, o Mestre de hoje
   com o catálogo de ebf0f64), para a linha de comparação */
const MEDIDA_DA_M2 = { rolaCerto: 150, pedeIndevido: 26, deixaDePedir: 99, paresQueSeparam: 2, espontaneosCertos: 10 };

/* ---------------- O FORMATO DO EXAME ---------------- */
/* MOVIDO na rodada 3 (18/11): o exame foi de 413 para 678 itens, e a B nova
   cobre as 97 situações (as 65 da §8 e as 32 da §10.5). Era: minItens 250,
   minPares 60, situacoes 65 (≥ 2 cada, sobre o exame inteiro), espontâneos
   [25, 40]. As 65 antigas continuam com ≥ 2 itens no exame inteiro; a B nova
   tem de ter todas as 97, ≥ 1 cada (o corte da redação ao alvo de ~260 deixou
   várias com um item só). */
const FORMATO = {
  minItens: 600,
  minPares: 180,
  situacoes: 65,
  minPorSituacao: 2,      // com os pares, a maioria passa de 3; ver §1
  situacoesDaB: 97,
  minItensDaB: 240,
  minParesDaB: 90,
  minEspontaneosDaB: 25,
  destinoDaB: [12, 20],
  espontaneos: [50, 75],
  fracaoNaoRola: [0.4, 0.6],
  bases: ["numero", "padrao", "fraco"],
  categorias: ["procurar", "esgueirar", "ler_pessoa", "saber", "arcano", "forcar", "travessia", "rastrear", "socorrer", "furtar",
    "convencer", "intimidar", "enganar", "atuar", "animal", "perguntar", "logistica", "outro"],
};

/* ---------------- A CATEGORIA DO RÓTULO ----------------
   O que o Mestre de hoje leu (id do catálogo, ou a família do improviso), na
   língua do exame. Sem teste (livre, conversa, nada) é «sem_acao», que é a
   categoria certa para perguntar, logística e outro. */
const CATEGORIA_DO_ROTULO = {
  buscar: "procurar", investigar: "procurar", escutar: "procurar", desarmar: "procurar", imp_percepcao: "procurar",
  furtar_se: "esgueirar", seguir_alguem: "esgueirar",
  mentira: "ler_pessoa",
  lembrar: "saber", fraqueza: "saber", heraldica: "saber", orientar: "saber", imp_intelecto: "saber",
  arcano: "arcano",
  tranca: "forcar", forcar: "forcar", arrebentar: "forcar", imp_forca: "forcar",
  escalar: "travessia", nadar: "travessia", saltar: "travessia", equilibrio: "travessia", escapar: "travessia", cavalgar: "travessia", imp_destreza: "travessia",
  rastrear: "rastrear",
  estancar: "socorrer", diagnosticar: "socorrer", aguentar: "socorrer", imp_vigor: "socorrer",
  bater_carteira: "furtar",
  convencer: "convencer", fazer_falar: "convencer", impressionar: "convencer", imp_presenca: "convencer",
  intimidar: "intimidar",
  mentir: "enganar", falsificar: "enganar",
  atuar: "atuar",
  acalmar_bicho: "animal",
  atacar: "atacar",
};
const SEM_ACAO = ["perguntar", "logistica", "outro"];
const categoriaObtida = (rot) => (rot == null || rot === "livre" || rot === "naoSePede" ? "sem_acao" : CATEGORIA_DO_ROTULO[rot] || "?" + rot);
const categoriaCerta = (esperada, obtida) => esperada === obtida || (SEM_ACAO.includes(esperada) && obtida === "sem_acao");

/* ---------------- AS PORTAS DA CENA ----------------
   O que da cena o Mestre de hoje consegue receber, e por qual porta. O resto
   dos estados de §4 não tem porta e não vai — é a lacuna medida. */
const PORTAS_DA_CENA = {
  relacao: (c) => (c.hostil ? "inimigo" : c.disposta || c.deve_favor ? "amigo" : "desconhecido"),
  segredo: (c) => (c.esconde_algo ? c.nota || "algo que não conta" : ""),
  notas: (c) => (c.deve_favor ? "deve um favor ao herói" : ""),
  chove: (c) => /chuva|neve|nevasca/.test(String(c.clima || "")),
  escuro: (c) => /noite|madrugada/.test(String(c.hora || "")),
  armadilha: (c) => c.armadilhado === true,
  achado: (c) => c.ha_algo_escondido === true,
};
/* o que o herói já sabe (a régua do saber comum), pela cena: só os casos em
   que o jogo de hoje teria isto na ficha (o livro de factos, a terra) */
const SABER_DA_CENA = [
  { se: (c) => /cresceu no porto/.test(c.heroi || ""), saber: { terra: ["porto", "estivadores", "guilda dos estivadores", "guilda do porto"] } },
  { se: (c) => /sacerdote desse culto/.test(c.heroi || ""), saber: { factos: ["simbolo", "olho com chifres", "culto"] } },
  { se: (c) => /bom teste sobre dragões/.test(c.nota || ""), saber: { factos: ["dragao", "dragoes"] } },
  { se: (c) => /sessão anterior/.test(c.nota || ""), saber: { factos: ["capitao", "velho", "mina", "senha", "porteiro"] } },
];

const nrm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const HEROI = { nivel: 1, inventario: [], habilidades: [], equipado: { arma: "Espada curta" }, moedas: 50 };
const quemDaCena = (c) => (Array.isArray(c.quem) ? c.quem[0] : c.quem) || "";
function ctxDe(item) {
  const c = (item && item.cena) || {};
  const quem = quemDaCena(c);
  const pessoa = quem ? { nome: "Fulana", papel: quem, relacao: PORTAS_DA_CENA.relacao(c), segredo: PORTAS_DA_CENA.segredo(c), notas: PORTAS_DA_CENA.notas(c) } : null;
  return {
    personagem: HEROI, semente: "exame-do-mestre", lugar: c.lugar || "", tentativas: {}, dia: 1,
    ehPessoaConhecida: () => false,
    pessoaDe: () => pessoa,
    achadoDe: () => (PORTAS_DA_CENA.achado(c) ? { o: "o que a cena esconde" } : null),
    objetoEmCena: (tipo) => tipo === "armadilha" && PORTAS_DA_CENA.armadilha(c),
    chove: PORTAS_DA_CENA.chove(c),
    escuro: PORTAS_DA_CENA.escuro(c),
  };
}
function ctxDoChamado(item, extra) {
  const c = (item && item.cena) || {};
  const s = SABER_DA_CENA.find((x) => { try { return x.se(c); } catch { return false; } });
  return { ...(s ? { saber: { lugar: c.lugar || "", ...s.saber } } : {}), ...(extra || {}) };
}

/* ---------------- A LEITURA DO MESTRE DE HOJE ---------------- */
const ROLA_MESMO_SEM_CHAMADO = [null, "conversa"];
function lerNoJogo(item, extraDoChamado) {
  const frase = item && typeof item === "object" ? item.frase : item;
  let atk = false;
  try { atk = ehDeclaracaoDeAtaque(frase, { nomes: [] }); } catch { atk = false; }
  if (atk) return { rot: "atacar", pede: false, pericia: "", por: "luta" };
  let v = null;
  try { v = lerAcao(frase, ctxDe(item && typeof item === "object" ? item : null)); } catch { v = null; }
  if (!v) return { rot: null, pede: false, pericia: "", por: "nada" };
  if (v.tipo !== "teste") return { rot: v.tipo === "naoSePede" ? "naoSePede" : "livre", pede: false, pericia: "", por: v.tipo };
  let rot = v.id;
  if (v.id === "improviso") { const p = String(v.chave || "").split("|"); rot = "imp_" + p[p.indexOf("improviso") + 1]; }
  const cx = ctxDoChamado(item, typeof extraDoChamado === "function" ? extraDoChamado(v) : null);
  let por = null;
  try { por = porQueNaoChama(v, cx); } catch { por = "erro"; }
  let chamado = null;
  try { chamado = oChamado(v, cx); } catch { chamado = null; }
  return { rot, pede: ROLA_MESMO_SEM_CHAMADO.includes(por), pericia: v.pericia || "", por: por || "chama", social: !!v.social, comPreco: !!chamado, dc: v.dc, v };
}

/* ---------------- A CENA DO ITEM, NA FORMA QUE A RÉGUA LÊ ----------------
   O exame escreve a cena plana (os estados de §4 como booleanos, `quem`
   como lista de papéis). Aqui ela vira a forma de cena-do-momento.js — só
   pelos ESTADOS e pelo papel de quem está; a `nota` em texto livre não
   entra (ela é a descrição do autor do exame, e o mundo do jogo não terá
   nota: terá estado). O que só a nota diz é erro que a régua assume.
   - pessoa ou criatura: o papel; criatura é o bicho pelo nome comum, e
     «(companheiro)» é do grupo;
   - os estados de pessoa vão para o primeiro de `quem` (é sempre dele que
     o item fala); numa criatura, o medo é susto, a boa vontade é mansidão
     e a hostilidade é território;
   - trancado, vigiado, armadilhado, o achado e a suspeita de armadilha são
     do lugar; pressa, testemunhas, perigo e o som claro são da cena. */
const CRIATURA_DO_EXAME = /\b(cavalo|egua|lobo|corvo|cao|cachorro|fera|urso|mula)\b/;
/* MOVIDO no treino da rodada 3 (18/11/2026): a lista ganhou os três estados
   novos de pessoa (ja_convencida, moribunda, dormindo), que vão ao primeiro
   de `quem` como os outros. Os estados novos de coisa e de cena (o do herói
   incluído, que é de dono «cena») já iam pelo laço da rodada 2, abaixo. */
const DE_PESSOA = ["disposta", "desconfiada", "com_medo", "hostil", "esconde_algo", "deve_favor", "motivo_para_negar", "do_grupo", "morta", "desacordada",
  "ja_convencida", "moribunda", "dormindo"];
/* M5 (18/11/2026): dois estados que o exame dizia por campo estruturado, e
   não por nota — o papel de quem está («guarda morto») e o clima («neve
   fechada»). O jogo os terá pelo estado da pessoa e pelo tempo do dia; aqui
   saem do campo, como a criatura sai do papel (CRIATURA_DO_EXAME). */
const MORTO_DO_EXAME = /\b(morto|morta|mortos|mortas|cadaver|defunto)\b/;
const CEU_ENCOBERTO_DO_EXAME = /\b(neve|nevasca|neblina|nevoa|nublad\w*|encobert\w*|tempestade|cerracao|chuva)\b/;
const NA_CRIATURA = { com_medo: "assustada", disposta: "mansa", hostil: "territorial" };
const DO_LUGAR = { trancado: "trancado", vigiado: "vigiado", armadilhado: "armadilhado", ha_algo_escondido: "ha_algo_escondido", suspeita_de_armadilha: "suspeito" };
const DA_CENA = ["com_pressa", "com_testemunhas", "perigo_fisico"];
function cenaDoExame(c) {
  if (!c || typeof c !== "object") return null;
  const quem = (Array.isArray(c.quem) ? c.quem : c.quem ? [c.quem] : []).filter((q) => typeof q === "string" && q.trim());
  const pessoas = [], criaturas = [];
  quem.forEach((q, k) => {
    const ehBicho = CRIATURA_DO_EXAME.test(nrm(q));
    const estados = [];
    if (/companheiro/.test(nrm(q))) estados.push("do_grupo");
    if (k === 0) for (const s of DE_PESSOA) if (c[s] === true) estados.push(ehBicho ? NA_CRIATURA[s] : s);
    if (!ehBicho && MORTO_DO_EXAME.test(nrm(q)) && !estados.includes("morta")) estados.push("morta");
    (ehBicho ? criaturas : pessoas).push({ nome: q, papel: q, estados: estados.filter(Boolean) });
  });
  const doLugar = Object.keys(DO_LUGAR).filter((k) => c[k] === true).map((k) => DO_LUGAR[k]);
  const daCena = DA_CENA.filter((k) => c[k] === true);
  if (String(c.som || "") === "claro") daCena.push("som_claro");
  if (CEU_ENCOBERTO_DO_EXAME.test(nrm(c.clima || ""))) daCena.push("ceu_encoberto");
  /* rodada 2: todo estado da tabela escrito na cena vai ao seu dono (a
     coisa é o lugar, o da cena é da cena, o da criatura é do primeiro bicho);
     os de pessoa já foram, acima, ao primeiro de `quem` */
  for (const k of Object.keys(c)) {
    const e = c[k] === true ? estadoPorId(k) : null;
    if (!e) continue;
    if (e.de === "coisa" && !doLugar.includes(k)) doLugar.push(k);
    else if (e.de === "cena" && !daCena.includes(k)) daCena.push(k);
    else if (e.de === "criatura" && criaturas[0] && !criaturas[0].estados.includes(k)) criaturas[0].estados.push(k);
  }
  return { pessoas, criaturas, coisas: [{ nome: c.lugar || "o lugar", estados: doLugar }], cena: { estados: daCena } };
}

/* ---------------- A LEITURA DO MESTRE DA RÉGUA ----------------
   A mesma frase, o mesmo catálogo e o mesmo contexto do chamado; a decisão
   de rolar é da régua, com a cena do item. No espontâneo, o dado vem também
   do que a cena chama ao aparecer (a cena antes é o lugar vazio). */
function lerComRegua(item) {
  const r = lerNoJogo(item);
  const it = item && typeof item === "object" ? item : null;
  const c = it && it.cena && typeof it.cena === "object" ? it.cena : null;
  const cena = cenaDoExame(c);
  if (r.por === "luta") return { ...r, porRegua: "luta" };
  let veredito = null;
  /* M5: a régua recebe também a frase e o contexto da leitura, para a escuta
     da cena (a-escuta-da-cena.js) ouvir o que o catálogo não ouviu; o que ela
     ouviu passa a ser o rótulo e a perícia deste Mestre */
  try { veredito = valeRolagem(r.v || null, cena, { ...ctxDoChamado(it), frase: it ? it.frase : "", leitura: ctxDe(it) }); } catch { veredito = null; }
  const ouviu = veredito && veredito.ouviu;
  let rot = r.rot;
  if (ouviu) { rot = ouviu.id; if (ouviu.id === "improviso") { const p = String(ouviu.chave || "").split("|"); rot = "imp_" + p[p.indexOf("improviso") + 1]; } }
  let pede = !!(veredito && veredito.rola), pericia = ouviu ? ouviu.pericia : r.pericia, porRegua = veredito ? veredito.porque : "erro";
  if (it && it.espontaneo && !pede) {
    let chama = null;
    try { chama = oQueACenaChama({ coisas: [{ nome: c && c.lugar, estados: [] }] }, cena); } catch { chama = null; }
    if (chama) { pede = true; pericia = chama.pericia; porRegua = "espontaneo:" + chama.estado; }
  }
  return { ...r, rot, pede, pericia, porRegua: (ouviu ? ouviu.porta + ":" : "") + porRegua };
}

/* ---------------- A MEDIDA ---------------- */
const ITENS = EXAME.itens;
const METADES = ["A", "B"];
/* rodada 3: a catraca conta só o que as três mesas sustentam; a discordância
   e o dado do destino são medidas à parte (secção 2b) */
const aParte = (i) => !!(i.mesas_discordam || i.destino);
const declarados = ITENS.filter((i) => !i.espontaneo && !aParte(i));
const espontaneos = ITENS.filter((i) => i.espontaneo && !aParte(i));
const LEITORES = { hoje: lerNoJogo, regua: lerComRegua };
const lido = { hoje: new Map(ITENS.map((i) => [i.id, lerNoJogo(i)])), regua: new Map(ITENS.map((i) => [i.id, lerComRegua(i)])) };

function medir(lista, leitura) {
  const m = { n: lista.length, rolaCerto: 0, nNao: 0, pedeIndevido: 0, nSim: 0, deixaDePedir: 0, categoria: 0, nPericia: 0, pericia: 0, comPreco: 0, social: 0 };
  for (const i of lista) {
    const r = leitura(i), e = i.esperado;
    if (r.pede === e.rola) m.rolaCerto++;
    if (e.rola) { m.nSim++; if (!r.pede) m.deixaDePedir++; } else { m.nNao++; if (r.pede) m.pedeIndevido++; }
    if (categoriaCerta(e.categoria, categoriaObtida(r.rot))) m.categoria++;
    if (e.rola && r.pede) { m.nPericia++; if (e.pericias.includes(r.pericia)) m.pericia++; }
    if (r.pede && r.comPreco) m.comPreco++;
    if (r.pede && r.social) m.social++;
  }
  return m;
}

/* os pares: a mesma frase, duas cenas, vereditos opostos na mesa real */
const pares = {};
for (const i of ITENS) if (i.par) (pares[i.par] = pares[i.par] || []).push(i);
const listaPares = Object.values(pares);
const paresDecl = listaPares.filter((p) => !p[0].espontaneo && !p.some(aParte));
const separa = (quem, p) => lido[quem].get(p[0].id).pede !== lido[quem].get(p[1].id).pede;
const acertaOsDois = (quem, p) => p.every((i) => lido[quem].get(i.id).pede === i.esperado.rola);

/* tudo de um Mestre numa metade (ou no exame inteiro, metade null) */
function medidaDe(quem, metade) {
  const daMetade = (i) => metade == null || i.metade === metade;
  const ler = (i) => lido[quem].get(i.id);
  const M = medir(declarados.filter(daMetade), ler);
  const E = medir(espontaneos.filter(daMetade), ler);
  const pp = paresDecl.filter((p) => daMetade(p[0]));
  return {
    M, E, nPares: pp.length,
    paresQueSeparam: pp.filter((p) => separa(quem, p)).length,
    paresCertos: pp.filter((p) => acertaOsDois(quem, p)).length,
  };
}
const MEDIDA = {};
for (const quem of Object.keys(LEITORES)) { MEDIDA[quem] = { tudo: medidaDe(quem, null) }; for (const h of METADES) MEDIDA[quem][h] = medidaDe(quem, h); }

/* por categoria (rola certo), só da metade A e só para o da régua: é a
   lista que afina; a B não se lê por dentro */
const porCategoriaA = (() => {
  const o = {};
  for (const i of declarados.filter((x) => x.metade === "A")) {
    const k = i.esperado.categoria; const x = (o[k] = o[k] || [0, 0]); x[1]++;
    if (lido.regua.get(i.id).pede === i.esperado.rola) x[0]++;
  }
  return o;
})();

/* E SE O MUNDO SOUBESSE A CENA? Uma linha só de comparação, sem catraca: o
   oráculo de hoje é sorteio; aqui ele responderia «não» quando a cena diz que
   não há nada escondido — e só nos testes que perguntam ao mundo
   (`v.oportunidade`). Mede quanto da lacuna da busca uma porta só fecharia.
   Em 18/11 a resposta foi nenhuma: só três testes do catálogo perguntam ao
   mundo (escutar, ler a intenção, rastrear), e a busca não é um deles. */
const comOraculo = medir(declarados, (i) => {
  const c = i.cena || {};
  return lerNoJogo(i, (v) => (v && v.oportunidade && c.ha_algo_escondido === false ? { mundoDisseNao: true } : null));
});

sec("1. o exame é o que diz ser");
{
  const ids = new Set(PERICIAS.map((p) => p.id));
  const sits = {};
  for (const i of ITENS) sits[i.situacao] = (sits[i.situacao] || 0) + 1;
  const nNao = ITENS.filter((i) => !i.esperado.rola).length;
  t(`${ITENS.length} itens, ${listaPares.length} pares (${paresDecl.length} com ação declarada, na catraca), ${ITENS.filter((i) => i.espontaneo).length} espontâneos`,
    ITENS.length >= FORMATO.minItens && listaPares.length >= FORMATO.minPares);
  t("todo item tem id, situação, cena, frase, esperado e rodada", ITENS.every((i) => i.id && Number.isInteger(i.situacao) && i.cena && typeof i.cena === "object"
    && typeof i.frase === "string" && i.frase.trim() && i.esperado && typeof i.esperado.rola === "boolean" && i.rodada >= 1));
  t("ids únicos", new Set(ITENS.map((i) => i.id)).size === ITENS.length);
  t(`as ${FORMATO.situacoes} situações do estudo estão todas, cada uma com ≥ ${FORMATO.minPorSituacao} itens`,
    Array.from({ length: FORMATO.situacoes }, (_, k) => sits[k + 1] || 0).every((n) => n >= FORMATO.minPorSituacao), JSON.stringify(sits));
  t(`cerca de metade não rola (${nNao} de ${ITENS.length})`, nNao / ITENS.length >= FORMATO.fracaoNaoRola[0] && nNao / ITENS.length <= FORMATO.fracaoNaoRola[1]);
  const nEsp = ITENS.filter((i) => i.espontaneo).length;
  t(`espontâneos entre ${FORMATO.espontaneos.join(" e ")}`, nEsp >= FORMATO.espontaneos[0] && nEsp <= FORMATO.espontaneos[1]);
  t("categorias e bases do vocabulário fechado", ITENS.every((i) => FORMATO.categorias.includes(i.esperado.categoria) && FORMATO.bases.includes(i.esperado.base)));
  /* MOVIDO na rodada 3: era «só quem rola tem perícia, e quem rola tem ao
     menos uma». O dado do destino rola SEM perícia (§10, nº 93: um dado de
     sorte), então para ele a perícia é vazia dos dois lados. */
  t("as perícias são ids do projeto, e só quem rola tem perícia (o dado do destino rola sem)", ITENS.every((i) => i.esperado.pericias.every((p) => ids.has(p))
    && (i.esperado.rola && !i.destino ? i.esperado.pericias.length > 0 : i.esperado.pericias.length === 0)));
  t("todo item diz a regra que decide (porque)", ITENS.every((i) => typeof i.esperado.porque === "string" && i.esperado.porque.length > 10));
  t("cada par é a mesma frase em duas cenas diferentes, com vereditos opostos", listaPares.every((p) => p.length === 2 && p[0].frase === p[1].frase
    && p[0].esperado.rola !== p[1].esperado.rola && JSON.stringify(p[0].cena) !== JSON.stringify(p[1].cena)));
  const vistas = new Set([...MESA.frases, ...SITUACOES.frases].map((f) => nrm(f.frase)));
  t("nenhuma frase do exame está nos corpus que afinaram o catálogo", ITENS.every((i) => !vistas.has(nrm(i.frase))));
  t("a origem diz de onde vem o veredito e que não há frase de mesa real; a regra da rodada existe",
    /estudo-das-mesas/.test(EXAME.origem) && /Nenhuma frase de mesa real/.test(EXAME.origem) && /sai do exame/.test(EXAME.regra_da_rodada));
  t("todo rótulo que o catálogo devolve tem categoria", DESAFIOS.every((d) => d.id === "improviso" || CATEGORIA_DO_ROTULO[d.id]));
  /* M3: as metades */
  t("todo item tem metade A ou B, e a regra das metades diz a semente", ITENS.every((i) => METADES.includes(i.metade))
    && !!EXAME.metades && /\S/.test(EXAME.metades.semente || "") && /prova/.test(EXAME.metades.regra || ""));
  t("o par nunca se parte entre as metades", listaPares.every((p) => p.every((i) => i.metade === p[0].metade)));
  const nA = ITENS.filter((i) => i.metade === "A").length;
  /* MOVIDO na rodada 2 (18/11): a asserção era «as metades se equilibram»
     (diferença ≤ 10%); na rodada 2 virou «a prova não é menor que a metade
     que afina». MOVIDO de novo na rodada 3: a B antiga inteira passou para a
     A (afinar precisa de frase, e a A de 175 esgotou), e a B nova é toda de
     frase nova — logo a A é agora a maior, de propósito. O que se guarda é o
     tamanho da prova nova (FORMATO.minItensDaB) e a fronteira das rodadas. */
  const daB = ITENS.filter((i) => i.metade === "B");
  t(`a prova nova tem tamanho de prova (A ${nA}, B ${daB.length} ≥ ${FORMATO.minItensDaB})`, daB.length >= FORMATO.minItensDaB && nA >= daB.length);
  /* MOVIDO na rodada 3: era «todo item da rodada 2 está na B». A rodada 2
     agora é A; a fronteira é a da rodada 3. */
  t("a B é toda da rodada 3 e toda a rodada 3 é B; o que veio da B antiga está na A, e nenhum item que vazou na M2 voltou à B",
    daB.every((i) => i.rodada === 3) && ITENS.filter((i) => i.rodada === 3).every((i) => i.metade === "B")
    && ITENS.filter((i) => i.veio_da_b === 3).every((i) => i.metade === "A" && i.rodada < 3) && ITENS.filter((i) => i.rodada_2).every((i) => i.metade === "A"));
  t("a contagem do cabeçalho bate com as metades", EXAME.contagem.metade_A === nA && EXAME.contagem.metade_B === ITENS.length - nA
    && EXAME.contagem.itens === ITENS.length && EXAME.contagem.rodada_3 === daB.length);
  /* rodada 3: a B nova, dita só em número (nenhuma frase, cena ou id dela sai daqui) */
  {
    const sitB = {};
    for (const i of daB) sitB[i.situacao] = (sitB[i.situacao] || 0) + 1;
    const faltamB = Array.from({ length: FORMATO.situacoesDaB }, (_, k) => k + 1).filter((s) => !sitB[s]).length;
    t(`a B nova cobre as ${FORMATO.situacoesDaB} situações do estudo (faltam ${faltamB})`, faltamB === 0);
    const paresB = listaPares.filter((p) => p[0].metade === "B").length;
    const espB = daB.filter((i) => i.espontaneo).length, desB = daB.filter((i) => i.destino).length;
    const nNaoB = daB.filter((i) => !i.esperado.rola).length;
    t(`a B nova: ${paresB} pares (≥ ${FORMATO.minParesDaB}), ${espB} espontâneos (≥ ${FORMATO.minEspontaneosDaB}), ${desB} do dado do destino, ${nNaoB} de ${daB.length} não rolam`,
      paresB >= FORMATO.minParesDaB && espB >= FORMATO.minEspontaneosDaB && desB >= FORMATO.destinoDaB[0] && desB <= FORMATO.destinoDaB[1]
      && nNaoB / daB.length >= FORMATO.fracaoNaoRola[0] && nNaoB / daB.length <= FORMATO.fracaoNaoRola[1]);
    t("a discordância das mesas tem base fraca e diz o que a mesa em português faria; destino e discordância só existem na B nova",
      ITENS.filter((i) => i.mesas_discordam).every((i) => i.esperado.base === "fraco" && typeof i.veredito_pt === "string" && i.veredito_pt.length > 5)
      && ITENS.filter(aParte).every((i) => i.rodada === 3));
    /* a honestidade da prova: nenhuma frase da B nova pode ter sido vista —
       nem na A (que afina), nem nos dois corpus que afinaram o catálogo. A
       falha diz só quantas, nunca quais. */
    const daA = new Set(ITENS.filter((i) => i.metade === "A").map((i) => nrm(i.frase)));
    const dosCorpus = new Set([...MESA.frases, ...SITUACOES.frases].map((f) => nrm(f.frase)));
    const vistasNaA = daB.filter((i) => daA.has(nrm(i.frase))).length, vistasNosCorpus = daB.filter((i) => dosCorpus.has(nrm(i.frase))).length;
    t(`nenhuma frase da B nova aparece na A nem nos dois corpus (na A ${vistasNaA}, nos corpus ${vistasNosCorpus})`, vistasNaA === 0 && vistasNosCorpus === 0);
  }
  t("a família da régua e a categoria do exame falam a mesma língua (todo id do catálogo)",
    DESAFIOS.every((d) => d.id === "improviso" || familiaDaAcao({ tipo: "teste", id: d.id }) === CATEGORIA_DO_ROTULO[d.id]));
  t("toda cena do exame vira uma cena que a régua lê", ITENS.every((i) => lerCena(cenaDoExame(i.cena)) !== null));
}

sec("2. a medida, por metade (o Mestre de hoje e o da régua, contra a mesa real)");
const C = CATRACA_DO_EXAME;
const linha = (rot, d) => {
  const { M, E } = d;
  return `     ${rot} rola certo ${M.rolaCerto}/${M.n} (${pct(M.rolaCerto, M.n)}) · indevido ${M.pedeIndevido}/${M.nNao} · omitido ${M.deixaDePedir}/${M.nSim}`
    + ` · categoria ${M.categoria} · perícia ${M.pericia}/${M.nPericia} · pares ${d.paresQueSeparam}/${d.nPares} (os dois lados ${d.paresCertos}) · espontâneos ${E.rolaCerto}/${E.n} (pediu ${E.nSim - E.deixaDePedir} de ${E.nSim})`;
};
console.log(`     a M2 (o exame inteiro, o de hoje com o catálogo antigo): rola certo ${MEDIDA_DA_M2.rolaCerto} · indevido ${MEDIDA_DA_M2.pedeIndevido} · omitido ${MEDIDA_DA_M2.deixaDePedir} · pares ${MEDIDA_DA_M2.paresQueSeparam} · espontâneos ${MEDIDA_DA_M2.espontaneosCertos}`);
for (const h of [...METADES, null]) {
  console.log(h ? `     metade ${h}${h === "A" ? " (afina)" : " (a prova)"}:` : "     o exame inteiro:");
  console.log(linha("hoje .", MEDIDA.hoje[h || "tudo"]));
  console.log(linha("régua ", MEDIDA.regua[h || "tudo"]));
}
console.log(`     (comparação, sem catraca) o de hoje, se o oráculo soubesse a cena: rola certo ${comOraculo.rolaCerto}/${comOraculo.n} · pede indevido ${comOraculo.pedeIndevido}/${comOraculo.nNao}`);
console.log(`     metade A, por categoria (régua, rola certo): ` + Object.entries(porCategoriaA).map(([k, [a, b]]) => `${k} ${a}/${b}`).join(" · "));

for (const quem of ["hoje", "regua"]) for (const h of METADES) {
  const c = C[quem][h], d = MEDIDA[quem][h], nome = `${quem === "hoje" ? "hoje" : "régua"}, metade ${h}`;
  t(`${nome}: rola certo não desce de ${c.rolaCerto} (${C.data})`, d.M.rolaCerto >= c.rolaCerto, `${d.M.rolaCerto}`);
  t(`${nome}: pede indevido não sobe de ${c.pedeIndevido} (${C.data})`, d.M.pedeIndevido <= c.pedeIndevido, `${d.M.pedeIndevido}`);
  t(`${nome}: deixa de pedir não sobe de ${c.deixaDePedir} (${C.data})`, d.M.deixaDePedir <= c.deixaDePedir, `${d.M.deixaDePedir}`);
  t(`${nome}: categoria certa não desce de ${c.categoria} (${C.data})`, d.M.categoria >= c.categoria, `${d.M.categoria}`);
  t(`${nome}: perícia certa não desce de ${c.pericia} (${C.data})`, d.M.pericia >= c.pericia, `${d.M.pericia}`);
  t(`${nome}: pares que separa não descem de ${c.paresQueSeparam} (${C.data})`, d.paresQueSeparam >= c.paresQueSeparam, `${d.paresQueSeparam}`);
  /* MOVIDO na rodada 3: a catraca dos espontâneos saiu — eles são medida à
     parte (secção 2b), impressa sem piso, como a discordância e o destino. */
}

sec("2b. as medidas à parte (sem catraca): a discordância das mesas, o dado do destino e os espontâneos");
{
  const ver = (quem, lista) => {
    const m = medir(lista, (i) => lido[quem].get(i.id));
    return `rola certo ${m.rolaCerto}/${m.n} · indevido ${m.pedeIndevido}/${m.nNao} · omitido ${m.deixaDePedir}/${m.nSim}`;
  };
  for (const h of METADES) {
    const dela = ITENS.filter((i) => i.metade === h);
    const disc = dela.filter((i) => i.mesas_discordam), des = dela.filter((i) => i.destino), esp = dela.filter((i) => i.espontaneo && !aParte(i));
    if (!disc.length && !des.length && !esp.length) continue;
    console.log(`     metade ${h}:`);
    for (const quem of ["hoje", "regua"]) {
      const rot = quem === "hoje" ? "hoje ." : "régua ";
      if (disc.length) {
        /* contra a mesa em português: o que ela faria (veredito_pt começa por «rola» ou «não rola») */
        const pt = disc.filter((i) => (lido[quem].get(i.id).pede) === /^rola/.test(i.veredito_pt)).length;
        console.log(`     ${rot} mesas discordam: ${ver(quem, disc)} (contra a regra de §6) · com a mesa em português ${pt}/${disc.length}`);
      }
      if (des.length) console.log(`     ${rot} o dado do destino: ${ver(quem, des)}`);
      if (esp.length) console.log(`     ${rot} espontâneos: ${ver(quem, esp)}`);
    }
  }
}
/* a promessa da M3 (o-mestre-vivo.md §9: «o exame sobe sem aumentar o dado
   indevido»), dita contra o Mestre de hoje na MESMA metade e com o MESMO
   catálogo — e na metade B, a que ninguém afinou */
for (const h of METADES) {
  const a = MEDIDA.hoje[h].M, b = MEDIDA.regua[h].M;
  t(`metade ${h}: a régua acerta mais que o de hoje (${b.rolaCerto} contra ${a.rolaCerto}) e não pede mais indevido (${b.pedeIndevido} contra ${a.pedeIndevido})`,
    b.rolaCerto > a.rolaCerto && b.pedeIndevido <= a.pedeIndevido);
}

sec("3. os erros da metade A (a régua; a metade B não se lê frase a frase)");
{
  const L = lido.regua;
  const rotulo = (rola, cat) => `${rola ? "rola" : "não rola"}/${cat}`;
  const resumo = (c) => Object.entries(c || {}).filter(([k, v]) => v === true || k === "nota").map(([k, v]) => (v === true ? k : v)).join(", ");
  const daA = ITENS.filter((i) => i.metade === "A");
  const erros = daA.filter((i) => L.get(i.id).pede !== i.esperado.rola || (!i.espontaneo && !categoriaCerta(i.esperado.categoria, categoriaObtida(L.get(i.id).rot))));
  /* os mais instrutivos primeiro: o par que a régua não separou, a base
     forte, o veredito errado antes da categoria errada; uma situação só por
     vez, para a lista não ser vinte vezes a mesma lacuna */
  const peso = (i) => (i.par && !separa("regua", pares[i.par]) ? 4 : 0) + ({ numero: 2, padrao: 1, fraco: 0 }[i.esperado.base] || 0)
    + (L.get(i.id).pede !== i.esperado.rola ? 3 : 0);
  erros.sort((a, b) => peso(b) - peso(a) || a.situacao - b.situacao);
  const vistas = new Set(), lista = [];
  for (const passo of [1, 2]) for (const i of erros) {
    if (lista.length >= 25 || lista.includes(i)) continue;
    if (passo === 1 && vistas.has(i.situacao)) continue;
    vistas.add(i.situacao); lista.push(i);
  }
  for (const i of lista) {
    const r = L.get(i.id);
    console.log(`     #${i.situacao} ${rotulo(i.esperado.rola, i.esperado.categoria)} → ${rotulo(r.pede, categoriaObtida(r.rot))}${r.rot ? " (" + r.rot + ", " + r.porRegua + ")" : ""} · «${i.frase}» [${resumo(i.cena)}]`);
  }
}

sec("4. a medida não estoura com lixo");
for (const [nome, ler] of Object.entries(LEITORES)) t(`${nome}: frase vazia, null e lixo devolvem sem dado`, [null, "", "   ", 42, {}, { frase: null }, { frase: "pulo", cena: null }].every((x) => ler(x).pede === false));

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
