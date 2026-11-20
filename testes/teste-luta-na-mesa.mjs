/* ============================================================
   A LUTA NA MESA (V6 parte 2 · 19/11/2026) — src/luta-na-mesa.js e as
   peças que o leem (grade-de-batalha.jsx, painel-batalha.jsx,
   painel-reacao.jsx, painel-fim-da-luta.jsx).

   Prova em Node a cara da peça, a conta numerada, a cera da vela e a ordem
   da cerimônia; e, no texto das peças, que a forma lê as tabelas (e que
   nenhum botão com anel de foco ganhou sombra inline, que o apagaria).
   As medidas vêm de formas.md §«A Mesa do Mestre · F4».
   ============================================================ */
import { readFileSync } from "node:fs";
import {
  TAPETE, PECA_NO_TAPETE, estadoDaPeca, contasDosInimigos,
  CARTA_DE_ACAO, VELA_DA_REACAO, ceraDaVela, CERIMONIA_DA_VITORIA, ordemDoEspolio,
} from "../src/luta-na-mesa.js";
import { T } from "../src/estilo.js";
import {
  MAO_DE_ACOES, tamanhoDaCarta, porCento, linhaDoDado, A_JOGADA, vereditoDoAgir,
  MESA_DA_LUTA, linhasDeElesVao, O_QUE_RESTA_NA_VEZ, faixaDaRegua, ladoComARegua,
  REACAO_NA_MAO, alturaDaVela, larguraDaCartaDaReacao, oQueFicaDaReacao,
  CARTA_DO_ESPOLIO, faceDoEspolio,
} from "../src/luta-na-mesa.js";
import { REACOES, resolverReacao } from "../src/reacoes.js";
import { faceMinimaQueBasta, golpePorExtenso } from "../src/batalha-na-tela.js";
import { previsaoDoAtaque, facesQueAcertam } from "../src/previsao.js";
import { VERBOS_DE_COMBATE } from "../src/golpe.js";

let bons = 0, maus = 0;
const t = (nome, ok, extra = "") => { if (ok) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "\n      " + extra : "")); } };
const J = JSON.stringify;
const ler = (a) => readFileSync(new URL("../" + a, import.meta.url), "utf8");

console.log("\n1. o tapete (F4 «TAPETE»)");
t("couro couroAlto, borda couroBaixo de 2, raio 10", TAPETE.couro === "couroAlto" && TAPETE.borda === "couroBaixo" && TAPETE.bordaPx === 2 && TAPETE.raio === 10);
t("costura de latão a 55 %, 1 px, tracejado 5 4, a 4 px da borda", TAPETE.costura.cor === "latao" && TAPETE.costura.alfa === 0.55 && J(TAPETE.costura.tracejado) === "[5,4]" && TAPETE.costura.recuo === 4);
t("as bordas sem régua têm 14", TAPETE.faixa.resto === 14);
t("a régua é inkMeio (6,89 : 1 no couro)", TAPETE.regua.cor === "inkMeio");
t("todo nome de cor do tapete existe em T", [TAPETE.couro, TAPETE.borda, TAPETE.costura.cor, TAPETE.tacha.cor, TAPETE.tacha.lume, TAPETE.regua.cor, TAPETE.regua.realce].every((k) => typeof T[k] === "string"));

console.log("\n2. a peça (F4 «PECA_NO_TAPETE»)");
t("diâmetro 0,88 da casa; aro máx(3 px, 0,09 × d)", PECA_NO_TAPETE.diametro === 0.88 && PECA_NO_TAPETE.aroMinimoPx === 3 && PECA_NO_TAPETE.aroDaCasa === 0.09);
const nosso = estadoDaPeca({ vida: 18, vidaMax: 18 }, { tipo: "heroi" });
t("nosso: aro latão, inteiro, sem conta", nosso.lado === "nosso" && nosso.aro === "latao" && nosso.fracao === 1 && nosso.conta === 0 && !nosso.caido, J(nosso));
const deles = estadoDaPeca({ vida: 3, vidaMax: 6 }, { tipo: "inimigo", conta: 2 });
t("deles ferido: aro lacreLume, arco de metade, conta 2", deles.lado === "deles" && deles.aro === "lacreLume" && deles.fracao === 0.5 && deles.conta === 2, J(deles));
const vez = estadoDaPeca({ vida: 7, vidaMax: 7 }, { tipo: "inimigo", aVez: true });
t("só quem age é âmbar, de qualquer lado, e sobe 3 px", vez.aro === "amber" && vez.sobe === 3 && estadoDaPeca({ vida: 1, vidaMax: 2 }, { tipo: "aliado", aVez: true }).aro === "amber");
const caido = estadoDaPeca({ vida: 0, vidaMax: 7 }, { tipo: "inimigo", aVez: true, alvo: true, conta: 1 });
t("caído: sem aro, sem subir, não é alvo", caido.caido && caido.aro === null && caido.sobe === 0 && !caido.alvo && caido.fracao === 0, J(caido));
t("a conta só existe do lado deles", estadoDaPeca({ vida: 1, vidaMax: 1 }, { tipo: "aliado", conta: 3 }).conta === 0);
t("sem vida conhecida, o aro fica inteiro", estadoDaPeca({}, { tipo: "inimigo" }).fracao === 1);
t("todo nome de cor da peça existe em T", [...Object.values(PECA_NO_TAPETE.aro), ...Object.values(PECA_NO_TAPETE.lado), PECA_NO_TAPETE.conta.chao, PECA_NO_TAPETE.conta.borda, PECA_NO_TAPETE.caido.chao, PECA_NO_TAPETE.caido.lado, PECA_NO_TAPETE.caido.borda, PECA_NO_TAPETE.caido.caveira].every((k) => typeof T[k] === "string"));

console.log("\n3. a conta numerada (o lado sem cor, WCAG 1.4.1)");
const c3 = contasDosInimigos([{ nome: "Rato Gigante" }, { nome: "Rato Gigante 2" }, { nome: "Rato Gigante 3" }, { nome: "Lobo" }]);
t("três ratos: 1, 2, 3; o lobo sozinho não leva conta", c3["Rato Gigante"] === 1 && c3["Rato Gigante 2"] === 2 && c3["Rato Gigante 3"] === 3 && !("Lobo" in c3), J(c3));
const c2 = contasDosInimigos([{ nome: "Bandido 2" }, { nome: "Bandido" }]);
t("o sem número pega o primeiro livre", c2["Bandido"] === 1 && c2["Bandido 2"] === 2, J(c2));
t("lista vazia ou suja não estoura", J(contasDosInimigos(null)) === "{}" && J(contasDosInimigos([null, {}])) === "{}");

console.log("\n4. a carta de ação (F4 «CARTA_DE_ACAO»)");
t("osso com borda de tinta; armada osso com borda 2; custo em brasa", CARTA_DE_ACAO.chao === "ossoLume" && CARTA_DE_ACAO.chaoArmada === "osso" && CARTA_DE_ACAO.bordaArmadaPx === 2 && CARTA_DE_ACAO.custo === "brasaNoPergaminho");
t("raio 6; todo nome de cor existe em T", CARTA_DE_ACAO.raio === 6 && [CARTA_DE_ACAO.chao, CARTA_DE_ACAO.chaoArmada, CARTA_DE_ACAO.borda, CARTA_DE_ACAO.bordaArmada, CARTA_DE_ACAO.letra, CARTA_DE_ACAO.custo, CARTA_DE_ACAO.perigo, CARTA_DE_ACAO.impedida.borda, CARTA_DE_ACAO.impedida.letra].every((k) => typeof T[k] === "string"));

console.log("\n5. a vela da reação (F4 «REACAO_NA_MESA»)");
const oferta = { janelaMs: 4000, folgaMs: 500, trilhoMs: 3500, apertoMs: 1500 };
t("antes da folga a vela está inteira", ceraDaVela(oferta, 300).fracao === 1 && ceraDaVela(oferta, 300).tem);
t("no meio do trilho, metade da cera", Math.abs(ceraDaVela(oferta, 500 + 1750).fracao - 0.5) < 1e-9);
t("no fim, sem cera; e o aperto acende nos últimos 1,5 s", ceraDaVela(oferta, 4000).fracao === 0 && ceraDaVela(oferta, 2600).aperto && !ceraDaVela(oferta, 2400).aperto);
t("com movimento reduzido a cera desce em degraus de 1 s", ceraDaVela(oferta, 1999, { reduzido: true }).fracao === ceraDaVela(oferta, 1000, { reduzido: true }).fracao);
t("o ritmo «parado» (sem relógio) não tem vela", ceraDaVela({ janelaMs: 0, folgaMs: 0, trilhoMs: 0, apertoMs: 0 }, 99999).tem === false && ceraDaVela(null, 0).tem === false);
t("a vela mede 16 × 84 sobre um prato de 48 × 11", VELA_DA_REACAO.vela.largura === 16 && VELA_DA_REACAO.vela.altura === 84 && VELA_DA_REACAO.prato.largura === 48 && VELA_DA_REACAO.prato.altura === 11);
t("as cartas da reação na mesa têm 250 de largura mínima (F4)", VELA_DA_REACAO.cartaMinima === 250);

console.log("\n6. a cerimônia da vitória (F4 «CERIMONIA_DA_VITORIA»)");
const CV = CERIMONIA_DA_VITORIA;
t("teto de 4 s; cartas 160 × 224 (104 × 150 no celular); véu 45 %", CV.teto === 4000 && CV.cartas.largura === 160 && CV.cartas.altura === 224 && CV.cartas.telefone.largura === 104 && CV.cartas.telefone.altura === 150 && CV.veu === 0.45);
t("pousam a 300 ms, 120 entre elas; viram a 700, 320 cada, 180 entre elas", CV.cartas.pousa === 300 && CV.cartas.entre === 120 && CV.cartas.vira === 700 && CV.cartas.viraMs === 320 && CV.cartas.entreVira === 180);
t("«Respirar fundo» 360 × 56 com o preço por baixo", CV.respirar.largura === 360 && CV.respirar.altura === 56 && CV.preco === "volta à página · o que ficar no chão, fica");
const ordem = ordemDoEspolio([{ id: 1, nome: "Espada", raridade: "raro" }, { id: 2, nome: "Moeda torta" }, { id: 3, nome: "Anel", raridade: "Incomum" }, { id: 4, nome: "Pão" }]);
t("viram da mais comum à mais rara; empate guarda a ordem em que caiu", J(ordem.map((c) => c.id)) === "[2,4,3,1]", J(ordem.map((c) => c.id)));
t("cada carta vira depois da anterior, e nenhuma depois do teto", ordem.every((c, k) => k === 0 || c.viraEm > ordem[k - 1].viraEm) && ordem.every((c) => c.viraEm + CV.cartas.viraMs <= CV.teto));
const muitas = ordemDoEspolio(Array.from({ length: 20 }, (_, i) => ({ id: i, nome: "x" + i })));
t("com vinte cartas o teto segura a última", muitas.every((c) => c.viraEm + CV.cartas.viraMs <= CV.teto && c.pousaEm + CV.cartas.viraMs <= CV.teto));
t("sem id não entra; lista suja não estoura", ordemDoEspolio([null, { nome: "sem id" }, { id: 0, nome: "zero" }]).length === 1 && J(ordemDoEspolio(null)) === "[]");

console.log("\n7. a forma lê as tabelas (o texto das peças)");
const GRADE = ler("src/grade-de-batalha.jsx");
const TEL = ler("src/painel-batalha.jsx");
const REA = ler("src/painel-reacao.jsx");
const FIM = ler("src/painel-fim-da-luta.jsx");
const APP = ler("src/App.jsx");
t("o tapete: couro, costura e tachas fora do telefone, e a borda sai da conta da casa", /const comCouro = !presa;/.test(GRADE) && /BORDA_DO_TAPETE = reguaPresa \? 0 : TAPETE\.faixa\.resto \+ TAPETE\.bordaPx \* 2/.test(GRADE) && /data-tapete=/.test(GRADE));
t("a peça lê estadoDaPeca e a conta dos iguais", /const peca = estadoDaPeca\(ent, \{ tipo, aVez: aVez \|\| !!age, conta \}\);/.test(GRADE) && /conta=\{contasDaMesa\[e\.nome\] \|\| 0\}/.test(GRADE));
t("o caído é o verso de osso com a caveira", /PECA_NO_TAPETE\.caido/.test(GRADE) && /INTENCAO_NA_MESA\.caveira/.test(GRADE));
t("a mão de ações é a carta de osso, e a sombra é filter (o anel de foco é a sombra de caixa)", /T\[C\.chao\]/.test(TEL) && /filter: impedido \|\| \(recuo && !armado\) \? undefined : sombraDaCarta/.test(TEL) && !/boxShadow/.test(TEL));
t("a reação abre no lugar da mão, por cima da mesma caixa (a casa não se mexe)", /data-reacao-na-mao=""/.test(TEL) && /position: "absolute", left: 0, right: 0, bottom: 0, minHeight: "100%", zIndex: 40/.test(TEL) && /naMesa\n\s*\/>/.test(APP));
t("a carta da reação não leva sombra inline no botão de foco", !/boxShadow: SOMBRA_DA_MESA\[C\.sombra\]/.test(REA) && /VelaDaReacao/.test(REA) && /ceraDaVela\(oferta, passou, \{ reduzido \}\)/.test(REA));
t("a cerimônia cobre o tapete e a saída mora onde estava a mão", /<FimDaLuta desfecho=\{p\.espolio\.desfecho\}/.test(TEL) && /<SaidaDaLuta aoSair=\{p\.aoSair\}/.test(TEL) && /export function FimDaLuta/.test(FIM) && /export function SaidaDaLuta/.test(FIM));
t("a cerimônia não conta quadros: um temporizador de parede, um toque pula", !/requestAnimationFrame/.test(FIM) && /setTimeout\(\(\) => setPosta\(true\), CV\.teto\)/.test(FIM) && /onPointerDown=\{posta \? undefined : pular\}/.test(FIM));
t("o recibo da vitória é a peça Recibo de A1, em tamanho de momento", /<Recibo chips=\{chips\} telefone=\{telefone\} momento \/>/.test(FIM));
t("o foco vai ao título, nunca ao «Respirar fundo»", /tituloRef\.current\.focus\(\)/.test(FIM) && /role="status"/.test(FIM));
t("o chão leva a raridade (para a ordem da cerimônia), nos dois lugares do App", (APP.match(/raridade: it\.raridade \|\| null/g) || []).length === 2);
const CSS = ler("src/estilo.js");
const iMedia = CSS.lastIndexOf("@media (prefers-reduced-motion");
t("as três classes novas existem e param com movimento reduzido", ["tv-chama-treme", "tv-carta-pousa", "tv-carta-vira"].every((c) => CSS.indexOf("." + c + " {") > 0) && /\.tv-chama-treme, \.tv-carta-pousa, \.tv-carta-vira \{ animation: none;/.test(CSS));
t("a folha não guarda os tempos delas (chegam por variável)", /tvCartaVira var\(--tv-vira-ms, 0ms\)/.test(CSS) && /tvChamaTreme var\(--tv-treme-ms, 0ms\)/.test(CSS) && iMedia > 0);

console.log("\n8. F4 §10 · a mão de oito cartas (MAO_DE_ACOES)");
{
  const M = MAO_DE_ACOES;
  t("oito cartas, na ordem da prancha: Atacar … Usar item · Esperar · Fugir", J(M.ordem) === J(["atacar", "mover", "empurrar", "derrubar", "saltar", "item", "esperar", "fugir"]));
  t("todo verbo da mão existe na tabela do motor (ou é recuo/bolsa)", M.ordem.every((id) => ["item", "esperar", "fugir"].includes(id) || VERBOS_DE_COMBATE.some((v) => v.id === id)));
  t("cada carta tem glifo; o d20 só nas quatro que rolam", M.ordem.every((id) => typeof M.glifo[id] === "string") && J(Object.keys(M.dado).sort()) === J(["atacar", "derrubar", "empurrar", "saltar"]));
  const m = M.tamanhos;
  t("102 × 112 (glifo 22 a 8, nome 33, dado 53, custo 76)", m.mesa.largura === 102 && m.mesa.altura === 112 && m.mesa.glifo === 22 && m.mesa.yGlifo === 8 && m.mesa.yNome === 33 && m.mesa.yDado === 53 && m.mesa.yCusto === 76);
  t("90 × 100 a 1280; baixa 102 × 72 sem glifo; celular 85 × 80 em 2 × 4", m.media.largura === 90 && m.media.altura === 100 && m.baixa.altura === 72 && m.baixa.glifo === 0 && m.celular.largura === 85 && m.celular.altura === 80 && m.celular.colunas === 4);
  t("10 entre as cartas; armar sobe 8 em 120 ms", M.entre === 10 && M.armar.sobe === 8 && M.armar.ms === 120);
  t("as oito de 102 com 10 entre elas medem 886 (a mão da prancha: x 196 → 1082)", 8 * m.mesa.largura + 7 * M.entre === 886);
  t("o tamanho: celular · baixa (< 720 úteis) · mesa (cabem as oito) · média", tamanhoDaCarta({ telefone: true }) === "celular" && tamanhoDaCarta({ larguraDaMao: 892, alturaUtil: 700 }) === "baixa"
    && tamanhoDaCarta({ larguraDaMao: 890, alturaUtil: 900 }) === "mesa" && tamanhoDaCarta({ larguraDaMao: 790, alturaUtil: 720 }) === "media" && tamanhoDaCarta({}) === "mesa");
  /* F4d · B1: a mão oscilava a 1440 × 780–900 (a largura medida era a da janela
     do tapete, que perde a barra de rolagem quando a carta encolhe). Dada uma
     sequência de medidas em vai-e-vem perto do limiar, o degrau não troca. */
  {
    const precisa = MAO_DE_ACOES.ordem.length * MAO_DE_ACOES.tamanhos.mesa.largura + (MAO_DE_ACOES.ordem.length - 1) * MAO_DE_ACOES.entre;
    const h = MAO_DE_ACOES.histerese;
    const corre = (medidas, inicio = null) => { let d = inicio, trocas = 0; for (const m of medidas) { const n = tamanhoDaCarta({ ...m, anterior: d }); if (d && n !== d) trocas++; d = n; } return { d, trocas }; };
    const vaiEVem = Array.from({ length: 40 }, (_, i) => ({ larguraDaMao: precisa + (i % 2 ? h - 1 : -(h - 1)), alturaUtil: 820 }));
    const r1 = corre(vaiEVem, "mesa"), r2 = corre(vaiEVem, "media");
    t("B1: largura em vai-e-vem dentro da folga — zero trocas, venha de onde vier", r1.trocas === 0 && r1.d === "mesa" && r2.trocas === 0 && r2.d === "media", J([r1, r2]));
    const alturas = Array.from({ length: 40 }, (_, i) => ({ larguraDaMao: 892, alturaUtil: MAO_DE_ACOES.alturaUtilBaixa + (i % 2 ? h - 1 : -(h - 1)) }));
    t("B1: altura em vai-e-vem no limiar da baixa — zero trocas", corre(alturas, "mesa").trocas === 0 && corre(alturas, "baixa").trocas === 0);
    t("B1: passar o limiar com folga troca (uma vez)", corre([{ larguraDaMao: 892, alturaUtil: 900 }, { larguraDaMao: precisa - h - 1, alturaUtil: 900 }], "mesa").trocas === 1);
    t("B1: a 1440 (coluna de 892) a mão é a de 102, mesmo vindo da média", tamanhoDaCarta({ larguraDaMao: 892, alturaUtil: 820, anterior: "media" }) === "mesa" && h < 892 - precisa);
    const TELA0 = ler("src/painel-batalha.jsx");
    t("B1: a tela mede a coluna do centro (e não a janela) e passa o degrau de antes", /setColunaDaMaoEl/.test(TELA0) && /anterior: degrauDaMaoRef.current/.test(TELA0) && !/larguraDaMao: larguraDaJanela/.test(TELA0));
    t("B2: no celular Atacar arma (não dispara no primeiro toque)", /v.id === "atacar" && !mesaF4 && !noTelefone/.test(TELA0));
    t("menor 2: com o Mestre calado o «Agir» diz e aponta", vereditoDoAgir({ armado: "atacar", alvo: "Goblin", silencio: true }).diz === A_JOGADA.razoes.silencio && /data-tentar-de-novo/.test(ler("src/painel-luta-mesa.jsx")));
  }
}

console.log("\n9. F4 §10 · a linha do dado — e RX-2: a face e a chance de UMA fonte");
{
  /* RX-2 (19/11): a captura V6p2-tapete-1440 dizia «60 %» ao lado de «7 ou mais».
     Apurado: a página de prova inventava chance 0,6 com as faces de
     facesQueAcertam(5, 12) — 14 faces, 70 %. No motor as duas saem da mesma
     conta (previsaoComDist, mesmo bónus, mesma defesa): sem vantagem nem
     desvantagem, chance = faces ÷ 20. Prova-se aqui, no motor. */
  const casos = [[5, 12], [3, 15], [8, 10], [0, 19], [2, 25]];
  const iguais = casos.every(([b, d]) => {
    const p = previsaoDoAtaque({ alvo: { nome: "Alvo", vida: 9, vidaMax: 9, defesa: d }, ehAtacanteInimigo: false, bonusAtaque: b, dano: { dado: 4, n: 1 }, criticoEm: 20 });
    return p && Math.abs(p.chance - p.faces.length / 20) < 1e-9;
  });
  t("RX-2 · no motor, sem vantagem: chance = faces ÷ 20 (cinco bónus × defesas)", iguais);
  const p = previsaoDoAtaque({ alvo: { nome: "Rato", vida: 4, vidaMax: 4, defesa: 12 }, ehAtacanteInimigo: false, bonusAtaque: 5, dano: { dado: 4, n: 1 }, criticoEm: 20 });
  t("RX-2 · d20 + 5 contra 12: a menor face que basta é 7, e a chance 70 %", faceMinimaQueBasta(p) === 7 && porCento(p.chance) === "70\u00a0%");
  t("RX-2 · a carta e o bloco «seu golpe» dizem a mesma face (faceMinimaQueBasta)", golpePorExtenso(p).faceMinima === 7 && golpePorExtenso(p).legenda.startsWith("você acerta com 7 ou mais") && linhaDoDado("atacar", { previsao: p, faceMinima: faceMinimaQueBasta(p) }).faceMinima === 7);
  t("só o crítico acerta: a face que basta é a do crítico", faceMinimaQueBasta({ faces: [20], criticoEm: 20 }) === 20 && faceMinimaQueBasta({ faces: [19, 20], criticoEm: 19 }) === 19 && faceMinimaQueBasta({ faces: [] }) === null && faceMinimaQueBasta(null) === null);
  const ch = linhaDoDado("atacar", { previsao: { chance: 0.7, faces: facesQueAcertam(5, 12, 20) }, faceMinima: 7 });
  t("1 · rola, com alvo: «d20 · 7+ · 70 %»", ch.forma === "chance" && ch.texto === "d20 · 7+ · 70\u00a0%" && ch.falado === "7 ou mais no d20, 70 por cento", J(ch));
  t("2 · rola, sem alvo: «d20» (e «d20 + 5» com o bónus sabido)", linhaDoDado("atacar").texto === "d20" && linhaDoDado("atacar", { previsao: { bonus: 5, impedido: true, chance: 0 } }).texto === "d20 + 5" && linhaDoDado("derrubar").forma === "bonus");
  t("3 · não rola: «sem dado» (Mover, Esperar, Usar item, Fugir sem golpes)", ["mover", "esperar", "item", "fugir"].every((id) => linhaDoDado(id).forma === "semDado" && linhaDoDado(id).texto === "sem dado"));
  t("4 · o custo é dano: «3× 2–10» (Fugir com golpes livres)", linhaDoDado("fugir", { fuga: { golpes: 3, min: 2, max: 10 } }).texto === "3× 2–10" && linhaDoDado("fugir", { fuga: { golpes: 3, min: 2, max: 10 } }).forma === "dano");
  t("o empurrão (disputa oposta) diz só a chance, sem face", linhaDoDado("empurrar", { empurrao: { previsao: { chance: 0.55 } } }).texto === "d20 · 55\u00a0%");
}

console.log("\n10. F4 §10 · a jogada e o veredito do «Agir»");
{
  const A = A_JOGADA;
  t("228 × 112: pena 48, 8, Agir 56; a 1280 220 × 100 (44, 6, 50); celular 233 + 124 × 60", A.mesa.largura === 228 && A.mesa.altura === 112 && A.mesa.pena === 48 && A.mesa.entre === 8 && A.mesa.agir === 56
    && A.media.largura === 220 && A.media.pena === 44 && A.media.agir === 50 && A.celular.pena === 233 && A.celular.agir === 124 && A.celular.altura === 60);
  t("as cores da jogada existem em T", [A.pena.chao, A.pena.borda, A.pena.corGlifo, A.pena.corConvite, A.pena.corTexto, A.agir.pronta.chao, A.agir.pronta.letra, A.agir.impedida.borda, A.agir.impedida.razao].every((k) => typeof T[k] === "string"));
  const v = (o) => vereditoDoAgir(o);
  t("impedida diz o que falta: «escolha uma carta», «toque no alvo», «não é a sua vez»", v({}).diz === "escolha uma carta" && !v({}).pronta && v({ armado: "atacar" }).diz === "toque no alvo" && v({ armado: "atacar", contando: true }).diz === "não é a sua vez");
  const pr = v({ armado: "atacar", rotulo: "Atacar", alvo: "Rato Gigante 1", chance: "70\u00a0%" });
  t("pronta repete o veredito: «Atacar · Rato Gigante 1 · 70 %», e o que ela faz", pr.pronta && pr.diz === "Atacar · Rato Gigante 1 · 70\u00a0%" && pr.acao === "atacar");
  t("Mover pede a casa; Fugir age com o custo; a frase da pena age sozinha", v({ armado: "mover" }).diz === "toque a casa" && v({ armado: "fugir", rotulo: "Fugir", custo: "sai da luta" }).diz === "Fugir · sai da luta" && v({ frase: "por baixo da guarda" }).acao === "caixa");
  t("Empurrar sem alvo pede o toque; com ele, diz em quem", v({ armado: "empurrar" }).diz === "toque no alvo" && v({ armado: "empurrar", rotulo: "Empurrar", alvoDoEmpurrao: "Goblin", chanceDoEmpurrao: "55\u00a0%" }).diz === "Empurrar · Goblin · 55\u00a0%");
  t("o fim cala o «Agir»; esperando o Mestre, diz-se", v({ fim: true }).diz === "" && v({ bloqueado: true }).diz === "o Mestre fala");
}

console.log("\n11. F4 §10 · a coluna direita e o grupo (MESA_DA_LUTA)");
{
  const L = MESA_DA_LUTA;
  t("as três colunas da prancha: 28 · grupo 140 · 28 | 12 · papel 300 · 40 (o centro dá 892 a 1440)", 1440 - L.grupo.margem - L.grupo.largura - L.grupo.entre - L.direita.entre - L.direita.largura - L.direita.margem === 892);
  t("a fala 300 × 128 (4 linhas; 88 e 2 linhas apertada); o alvo 222 (128 curto), a carta 60 × 84", L.fala.altura === 128 && L.fala.linhas === 4 && L.fala.alturaApertada === 88 && L.alvo.altura === 222 && L.alvo.alturaCurta === 128 && L.alvo.carta.largura === 60 && L.alvo.carta.altura === 84);
  t("o papel é pergaminho com a borda dele e a sombra «pousado»; «eles vão» a −1°", L.papel.chao === "pergaminho" && L.papel.borda === "pergaminhoBorda" && L.papel.sombra === "pousado" && L.elesVao.inclina === -1);
  t("todas as tintas do papel existem em T", [L.papel.chao, L.papel.borda, L.papel.rotulo, L.papel.tinta, L.papel.tintaDim, L.papel.brasa, L.papel.perigo, L.rodada.chao, L.rodada.letra].every((k) => typeof T[k] === "string"));
  t("abaixo de 1180 a mesa volta ao arranjo de antes", L.minima === 1180);
  const ratos = ["Rato Gigante", "Rato Gigante 2", "Rato Gigante 3"].map((n) => ({ inimigo: n, vista: { tipo: "atacar", alvo: "Saoirse", golpes: 1, dano: { min: 2, max: 10 } } }));
  const ev = linhasDeElesVao([...ratos, { inimigo: "Lobo", vista: { tipo: "atacar", alvo: "Nolan", golpes: 1, dano: { min: 3, max: 6 } } }], { heroi: "Saoirse" });
  t("os iguais que fazem o mesmo ao mesmo alvo numa linha: «3× Rato Gigante · 2–10 → Saoirse»", ev.linhas.length === 2 && ev.linhas[0].quantos === 3 && ev.linhas[0].especie === "Rato Gigante" && ev.linhas[0].alvo === "Saoirse" && ev.linhas[1].especie === "Lobo", J(ev.linhas));
  t("«se os três acertarem, de 6 a 30» — só soma o que chega ao herói", ev.noHeroi && ev.noHeroi.quantos === 3 && ev.noHeroi.min === 6 && ev.noHeroi.max === 30);
  t("um só a bater no herói: sem a soma; lista suja não estoura", linhasDeElesVao([ratos[0]], { heroi: "Saoirse" }).noHeroi === null && linhasDeElesVao(null).linhas.length === 0);
  t("o que resta na vez: quatro linhas de 24 (ação, bônus, reação, passo)", O_QUE_RESTA_NA_VEZ.linha === 24 && J(O_QUE_RESTA_NA_VEZ.ordem) === J(["acao", "bonus", "reacao", "movimento"]) && O_QUE_RESTA_NA_VEZ.palavra.bonus === "bônus");
}

console.log("\n12. F4 §10 · a mesa no texto das peças");
{
  const PEC = ler("src/painel-luta-mesa.jsx");
  const TELA = ler("src/painel-batalha.jsx");
  t("a mesa da prancha nasce no monitor largo, e o arranjo de antes fica abaixo dela", /const mesaF4 = !noTelefone && larguraDaMesa >= MESA_DA_LUTA\.minima;/.test(TELA) && /if \(mesaF4 \|\| noTelefone\) \{/.test(TELA));
  t("a mão lê linhaDoDado com a previsão e faceMinimaQueBasta (uma fonte só)", /linhaDoDado\(id, \{ previsao: prevGolpe, empurrao: empAgora, faceMinima \}\)/.test(TELA) && /faceMinimaQueBasta\(prevGolpe\)/.test(TELA));
  t("o «Agir» é vereditoDoAgir, e o Enter na pena age só pronto", /vereditoDoAgir\(\{/.test(TELA) && /e\.key === "Enter" && pronta && aoAgir/.test(PEC));
  t("três caminhos: o segundo toque no alvo marcado age", /if \(marcado !== nome\) \{ setMarcado\(nome\); preverGolpe\(nome\); return; \}/.test(TELA));
  t("as peças tocáveis não levam sombra de caixa inline (o anel de foco é a sombra de caixa)", !/<button[^>]*boxShadow/.test(PEC) && /filter: impedida \? undefined : SOMBRA_COMO_FILTRO/.test(PEC));
  t("com movimento reduzido a carta não desliza", /transition: reduzido \? "none"/.test(PEC) && /prefers-reduced-motion/.test(PEC));
  t("nenhum componente nasce dentro do render (todas as peças no módulo)", (PEC.match(/^export function [A-Z]/gm) || []).length >= 8);
  t("as peças exportadas são lidas pela tela", ["MaoDeAcoes", "AJogada", "FalaDoMestreNoPapel", "ElesVaoNoPapel", "OAlvoNoPapel", "ColunaDoGrupoNaLuta", "PlaquetaDaRodada", "AvisoDoSilencio"].every((n) => TELA.includes("<" + n + " ")));
}

console.log("\n13. F4 §10 lacuna 4 · a régua na faixa de 28 (casa ≥ 40) ou de 24");
{
  t("a faixa é 28 com a casa ≥ 40 e 24 abaixo (a calha de 22 saiu)", faixaDaRegua(46) === 28 && faixaDaRegua(40) === 28 && faixaDaRegua(39) === 24 && faixaDaRegua(32) === 24);
  const a1440 = ladoComARegua({ largura: 890, altura: 597, colunas: 18, linhas: 12, borda: 18, piso: 32, teto: 64 });
  t("a 1440 (janela 890 × 597, 18 × 12): casa 45 na faixa de 28", a1440.faixa === 28 && a1440.lado === 45, J(a1440));
  const a1280 = ladoComARegua({ largura: 788, altura: 429, colunas: 18, linhas: 12, borda: 18, piso: 32, teto: 64 });
  t("a 1280 × 720: a casa não chega a 40, a faixa desce a 24 e a casa ganha", a1280.faixa === 24 && a1280.lado === Math.max(32, Math.floor((429 - 24 - 18) / 12)), J(a1280));
  t("o piso ganha sempre; sem janela medida, o piso", ladoComARegua({ largura: 300, altura: 200, colunas: 18, linhas: 12, borda: 18, piso: 32, teto: 64 }).lado === 32 && ladoComARegua({ piso: 48 }).lado === 48);
  t("o teto segura a casa", ladoComARegua({ largura: 5000, altura: 5000, colunas: 10, linhas: 10, borda: 18, piso: 32, teto: 64 }).lado === 64);
  const GR = ler("src/grade-de-batalha.jsx");
  t("o tapete usa a faixa da conta, e a vista ⤢ a do seu lado (nunca a calha de 22 fora do telefone)", /const calha = presa \? B3\.telefone\.calha : grande \? faixaDaRegua\(ladoEmPx\(true\)\) : FAIXA_DA_REGUA;/.test(GR));
}

console.log("\n14. F4c · o que a luta jogada achou (a lista do coordenador, 19/11)");
{
  const APPx = ler("src/App.jsx");
  const TELA = ler("src/painel-batalha.jsx");
  const PEC = ler("src/painel-luta-mesa.jsx");
  t("(8) o Mestre que calou na luta: o App passa a falha e «tentar de novo» à tela da luta", /silencio=\{falha && !carregando \? \{ casa: falha\.casa \|\| "", linha: falha\.linha \|\| "", podeTentar: falha\.podeTentar !== false \} : null\}/.test(APPx) && /aoTentarDeNovo=\{\(\) => \{ try \{ retentar\(\); \} catch \(e\) \{ calou\("tentar de novo na luta", e\); \} \}\}/.test(APPx));
  t("(8) e a tela diz o aviso nos dois arranjos, com o botão só quando insistir resolve", (TELA.match(/<AvisoDoSilencio silencio=\{p\.silencio \|\| null\} aoTentarDeNovo=\{p\.aoTentarDeNovo \|\| null\} \/>/g) || []).length === 3 && /silencio\.podeTentar && aoTentarDeNovo \?/.test(PEC) && /role="alert"/.test(PEC));
  t("(5) o revide da reação e o golpe do companheiro deixam linha na rodada", /\{ quem: pers\.nome, alvo: alvo\.nome, diz: rr\.dano > 0 \? `revide/.test(APPx) && /\{ quem: ac\.companheiro, alvo: ac\.alvoNome, diz: ac\.r\.dano > 0/.test(APPx) && /calou\("a habilidade do companheiro na rodada", e\)/.test(APPx));
}

console.log("\n15. F4 §10 · a reação na mão, e RX-1 (o que chega e o que fica)");
{
  const RMx = REACAO_NA_MAO;
  t("a caixa: couro, borda lataoSombra, raio 8; vela a x 28, bloco 256 a x 74; cartas de 104 a y 4, 8 entre", RMx.chao === "couro" && RMx.borda === "lataoSombra" && RMx.raio === 8 && RMx.xVela === 28 && RMx.bloco === 256 && RMx.xBloco === 74 && RMx.alturaDaCarta === 104 && RMx.topo === 4 && RMx.entre === 8);
  t("a vela é a caixa − 28 (84 na de 112, 72 na de 100); 56 só no celular", alturaDaVela(112) === 84 && alturaDaVela(100) === 72 && alturaDaVela(112, true) === 56);
  t("as cartas: 308 com uma ou duas, 202 com três, nunca abaixo de 200", larguraDaCartaDaReacao(1) === 308 && larguraDaCartaDaReacao(2) === 308 && larguraDaCartaDaReacao(3) === 202 && larguraDaCartaDaReacao(5) >= 200);
  t("as cores da caixa existem em T; toda reação de sofrer dano tem glifo", [RMx.chao, RMx.borda].every((k) => typeof T[k] === "string") && REACOES.filter((r) => r.gatilho === "sofre_dano").every((r) => typeof RMx.glifo[r.id] === "string"));
  const faixa = { min: 2, max: 10 };
  const por = (id) => REACOES.find((r) => r.id === id);
  t("RX-1 · deixar passar: fica o que vem («você leva de 2 a 10»)", J(oQueFicaDaReacao(null, faixa)) === J({ min: 2, max: 10 }));
  t("RX-1 · aparar corta metade, pela conta de resolverReacao nos dois extremos", J(oQueFicaDaReacao(por("aparar"), faixa)) === J({ min: resolverReacao(por("aparar"), { pers: {}, dano: 2 }).danoFinal, max: resolverReacao(por("aparar"), { pers: {}, dano: 10 }).danoFinal }));
  t("RX-1 · o escudo arcano tira 60 %: de 1 a 4", J(oQueFicaDaReacao(por("escudo_arcano"), faixa)) === J({ min: 1, max: 4 }));
  t("RX-1 · a reação que anula: de 0 a 0", J(oQueFicaDaReacao(por("contramagia"), faixa)) === J({ min: 0, max: 0 }));
  t("RX-1 · a esquiva (com chance) pode falhar: de 0 ao golpe inteiro", J(oQueFicaDaReacao(por("esquiva_agil"), faixa)) === J({ min: 0, max: 10 }));
  t("RX-1 · sem faixa anunciada, null (a forma provisória: custo e efeito)", oQueFicaDaReacao(por("aparar"), null) === null && oQueFicaDaReacao(null, { min: 2 }) === null);
  const REAx = ler("src/painel-reacao.jsx");
  const TELA = ler("src/painel-batalha.jsx");
  t("a caixa lê a faixa da intenção de quem acerta (o número rolado nunca: «o dano vir surpresa»)", /mesa\.intencaoDe\.get\(oferta\.inimigo\)/.test(REAx) && /oQueFicaDaReacao\(r, faixa\)/.test(REAx) && !/oferta\.dano/.test(REAx));
  t("a tela da luta dá à reação a intenção e a altura da caixa", /<ContextoDaReacaoNaMesa\.Provider value=\{contextoDaReacao\}>/.test(TELA) && /\{ intencaoDe, caixa: caixaDaMao, celular: false \}/.test(TELA));
  t("a vela está à vista desde que a janela abre (na luta jogada a reação fechava sem relógio à vista)", /const vela = temRelogioAgora && etapa !== "Resolvida" \?/.test(REAx));
}

console.log("\n16. F4 §10 lacuna 3 · a carta do espólio na vitória");
{
  const CE = CARTA_DO_ESPOLIO;
  t("face 160 × 224: palavra a y 10, casa de 64 a (48, 32), nome a 104, frase a 140, pé a 196, texto 144", CE.mesa.largura === 160 && CE.mesa.altura === 224 && CE.mesa.yPalavra === 10 && CE.mesa.casa === 64 && CE.mesa.xCasa === 48 && CE.mesa.yCasa === 32 && CE.mesa.yNome === 104 && CE.mesa.yFrase === 140 && CE.mesa.yPe === 196 && CE.mesa.texto === 144);
  t("celular 104 × 146 (5 : 7): casa de 48 a (28, 26), nome a 80 em até 3 linhas", CE.celular.largura === 104 && CE.celular.altura === 146 && CE.celular.casa === 48 && CE.celular.xCasa === 28 && CE.celular.yCasa === 26 && CE.celular.yNome === 80 && CE.celular.linhasNome === 3);
  t("por raridade — moldura, nunca só cor: comum ossoSombra 1 · incomum latão 2 · rara + cantos · lendária + cantos + lacre", CE.moldura.comum.borda === "ossoSombra" && CE.moldura.comum.px === 1 && CE.moldura.incomum.px === 2 && !CE.moldura.incomum.cantos && CE.moldura.rara.cantos && !CE.moldura.rara.lacre && CE.moldura.lendaria.lacre && CE.canto === 15 && CE.lacre === 36);
  t("o verso é igual para todas: couro, aro latão 2, fio a 8 (55 %), losango 32 de traço 1,5", CE.verso.chao === "couro" && CE.verso.aro === "latao" && CE.verso.aroPx === 2 && CE.verso.fio === 8 && CE.verso.fioAlfa === 0.55 && CE.verso.losango === 32 && CE.verso.losangoPx === 1.5);
  const p = faceDoEspolio({ nome: "Poção de cura", desc: "Devolve 2d4+2 de vida. E arde na garganta." });
  t("a face: a palavra, a família do glifo, a primeira frase do que o item diz e o pé", p.palavra === "comum" && p.familia === "pocao" && p.frase === "Devolve 2d4+2 de vida." && p.pe === "vai para a bolsa" && !p.brasa, J(p));
  const l = faceDoEspolio({ nome: "Mordida-de-rato", raridade: "lendario" });
  t("a lendária: moldura com lacre e a palavra em brasa; sem frase, sem linha", l.moldura === "lendaria" && l.palavra === "lendária" && l.brasa && l.frase === "");
  t("a épica cai na moldura rara (as seis raridades em quatro molduras)", faceDoEspolio({ nome: "x", raridade: "epico" }).moldura === "rara" && faceDoEspolio(null).moldura === "comum");
  const FIMx = ler("src/painel-fim-da-luta.jsx");
  t("a carta usa a casa de item (o glifo do item, não mais a bolsa em toda carta)", /<CasaDeItem item=\{coisa\} lado=\{G\.casa\} sobre="papel" \/>/.test(FIMx) && !/<Glifo nome="bolsa"/.test(FIMx));
  t("com UMA carta também há botão: «Recolher» (e «Recolher tudo» com mais)", /porRecolher\.length >= 1 &&/.test(FIMx) && /porRecolher\.length > 1 \? CE\.recolher\.todas : CE\.recolher\.uma/.test(FIMx));
}

console.log("\n17. F4 §10 passo 7 · o celular");
{
  const TELA = ler("src/painel-batalha.jsx");
  const REAx = ler("src/painel-reacao.jsx");
  t("a mão de 2 × 4 de 85 × 80 e a jogada (pena + «Agir») na última linha", /<MaoDeAcoes cartas=\{cartas\} tamanho="celular" aoTocar=\{tocarCarta\} \/>/.test(TELA) && /<AJogada tamanho="celular"/.test(TELA));
  t("a folha «Atacar · Cancelar» aposentou-se no celular (só o arranjo de antes, abaixo de 768, a teria)", /acaoDoFim \|\| acaoDoTelefone \|\| acao/.test(TELA));
  t("a reação no celular toma o lugar da mão, no fluxo — nunca por cima da faixa do herói", /data-reacao-no-celular=""/.test(TELA) && /p\.reacao \? null : <MaoDeAcoes/.test(TELA) && /\{ intencaoDe, caixa: caixaDaMao, celular: true \}/.test(TELA));
  t("a carta da reação no celular é compacta: o nome em duas linhas e «leva 1–4»", /if \(compacta\) \{/.test(REAx) && /P\.levaCurto/.test(REAx));
}

console.log(`\na luta na mesa (V6 parte 2): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
