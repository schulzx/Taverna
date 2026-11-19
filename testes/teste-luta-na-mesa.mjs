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

console.log(`\na luta na mesa (V6 parte 2): ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
