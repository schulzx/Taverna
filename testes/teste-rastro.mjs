import {
  podeAbrirModulo, detectarPartida, detectarEntradaEmMasmorra, nomeDoCovil,
  ondeEstou, pontoDoHeroi, jornadaValida, envelopeDePartida, envelopeDeMasmorra,
} from "../src/rastro.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const mapa = { cidades: [
  { nome: "Pedravale", x: 20, y: 30, regiao: "Sul", faccao: "Guilda do Corvo" },
  { nome: "Rio do Sul", x: 60, y: 70, regiao: "Sul" },
  { nome: "Ponte do Sul", x: 40, y: 50 },
] };
const base = { cidadeAtual: "Pedravale", cidades: mapa.cidades.map((c) => c.nome) };

console.log("\n[1. O QUE DESLIGA TUDO]");
ok(!podeAbrirModulo({ emCombate: true }).pode, "no meio de um combate, nada abre");
ok(!podeAbrirModulo({ acampado: true }).pode, "acampado, nada abre");
ok(!podeAbrirModulo({ emMasmorra: true }).pode, "dentro de uma masmorra, nada abre");
ok(podeAbrirModulo({}).pode, "em cena normal, pode");
ok(!detectarPartida("sigo para Rio do Sul", { ...base, emCombate: true }), "e a partida respeita isso");
ok(!detectarPartida("sigo para Rio do Sul", { ...base, emViagem: true }), "quem já está na estrada não 'parte' de novo a cada frase");

console.log("\n[2. PARTIDA DE VERDADE]");
const p1 = detectarPartida("sigo para Rio do Sul", base);
ok(p1 && p1.destino === "Rio do Sul", "cidade nomeada no mapa vira destino");
ok(detectarPartida("parto a cavalo rumo a Ponte do Sul", base).destino === "Ponte do Sul", "a cavalo também é partir");
ok(detectarPartida("voo até Rio do Sul", base).destino === "Rio do Sul", "voando também — o meio não importa, o pé fora da cidade importa");
ok(detectarPartida("embarco no navio para Rio do Sul", base).destino === "Rio do Sul", "e de navio");
ok(detectarPartida("saio da taverna e sigo para Rio do Sul", base).destino === "Rio do Sul",
   "sair de um lugar interno E nomear a cidade continua sendo viagem");
const p2 = detectarPartida("tomo a estrada rumo ao sul", base);
ok(p2 && p2.destino === "", "direção explícita abre estrada sem destino nomeado");
ok(detectarPartida("deixo a cidade e sigo para fora dos portões", base), "sair pelos portões é partir");

console.log("\n[3. O FALSO POSITIVO — o caro]");
ok(!detectarPartida("pergunto o caminho para Rio do Sul", base), "perguntar o caminho NÃO é partir");
ok(!detectarPartida("penso em ir a Rio do Sul amanhã", base), "pensar em ir não é ir");
ok(!detectarPartida("quero ir para Rio do Sul quando terminar isso", base), "querer não é ir");
ok(!detectarPartida("digo que vou a Rio do Sul", base), "dizer que vai não é ir");
ok(!detectarPartida("combino de seguir para Rio do Sul depois", base), "combinar não é partir");
ok(!detectarPartida("quanto tempo leva até Rio do Sul?", base), "perguntar a distância não é partir");
ok(!detectarPartida("vou até a taverna", base), "andar até a taverna é andar, não viajar");
ok(!detectarPartida("atravesso a praça e vou ao mercado", base), "atravessar a praça também não");
ok(!detectarPartida("subo para o quarto da estalagem", base), "nem subir para o quarto");
ok(!detectarPartida("sigo em frente", base), "sair 'por aí', sem destino nem direção, não abre estrada");
ok(!detectarPartida("olho o mapa e vejo Rio do Sul ao longe", base), "sem verbo de partida, o nome da cidade não basta");
ok(!detectarPartida("sigo para Pedravale", base), "ir para a cidade onde já se está não é viagem");

console.log("\n[4. MASMORRA]");
const m1 = detectarEntradaEmMasmorra("desço na Cripta de Malgar", base);
ok(m1 && /Cripta de Malgar/.test(m1.nome), "verbo de entrada + covil abre, e pesca o nome próprio");
ok(detectarEntradaEmMasmorra("entro na caverna", base), "caverna conta");
ok(detectarEntradaEmMasmorra("adentro as ruínas do templo", base), "ruínas contam");
ok(detectarEntradaEmMasmorra("exploro o labirinto sob a cidade", base), "labirinto conta");
ok(detectarEntradaEmMasmorra("invado o covil dos bandidos", base), "covil conta");
ok(!detectarEntradaEmMasmorra("ouço falar da cripta sob o templo", base), "ouvir falar não é descer");
ok(!detectarEntradaEmMasmorra("pergunto sobre a caverna", base), "perguntar não é entrar");
ok(!detectarEntradaEmMasmorra("entro na taverna", base), "taverna não é masmorra");
ok(!detectarEntradaEmMasmorra("penso em explorar a cripta", base), "pensar em explorar não é explorar");
ok(!detectarEntradaEmMasmorra("ouço falar da cripta e entro na taverna", base),
   "REGRA DA FRASE: o covil numa oração e a entrada em outra não somam");
ok(!detectarEntradaEmMasmorra("entro na cripta", { ...base, emMasmorra: true }), "já dentro de uma, não abre outra");
ok(nomeDoCovil("desço na cripta") === "", "sem nome próprio, o gerador é quem batiza");

console.log("\n[5. ONDE ESTOU]");
ok(ondeEstou({ cidadeAtual: "Pedravale", mapa }).tipo === "cidade", "na cidade");
ok(ondeEstou({ cidadeAtual: "Pedravale", mapa }).detalhe.includes("Guilda do Corvo"), "e diz de quem é o lugar");
const oe = ondeEstou({ cidadeAtual: "", jornada: { de: "Pedravale", para: "Rio do Sul" }, mapa });
ok(oe.tipo === "estrada" && /a caminho de Rio do Sul/.test(oe.rotulo), "na estrada, com destino");
ok(ondeEstou({ masmorra: { nome: "Cripta de Malgar", atual: 3 } }).tipo === "masmorra", "a masmorra ganha de tudo");
ok(ondeEstou({}).tipo === "nenhum", "e sem nada, diz que não sabe — em vez de inventar");

console.log("\n[6. O PONTO NO MAPA]");
const pc = pontoDoHeroi({ cidadeAtual: "Pedravale", mapa });
ok(pc && pc.x === 20 && pc.y === 30 && !pc.naEstrada, "na cidade, o ponto é o da cidade");
/* v9.118: O PONTO DA ESTRADA É O DE VERDADE. Esta prova cravava 40,50 — o
   meio do trecho — porque era isso que o código fazia: fração 0.5 fixa, da
   partida à chegada. Desde a v9.56 a jornada conta minutos andados de
   minutos totais, e a tela desenhava o herói parado no meio de uma viagem
   de treze avanços enquanto a barra ao lado dizia 8%. A prova estava
   defendendo o defeito; agora ela mede a marcha. */
const estrada = (andadoMin) => pontoDoHeroi({ jornada: { de: "Pedravale", para: "Rio do Sul", totalMin: 1000, andadoMin }, mapa });
const pPartiu = estrada(0), pMeio = estrada(500), pQuase = estrada(900);
ok(pPartiu.naEstrada && pPartiu.x === 20 && pPartiu.y === 30, "recém-partido, o ponto ainda é o da origem");
ok(Math.abs(pMeio.x - 40) < 0.01 && Math.abs(pMeio.y - 50) < 0.01, "na metade da marcha, o ponto é o meio do trecho");
ok(pQuase.x > pMeio.x && pQuase.y > pMeio.y, "e ele ANDA: a nove décimos, está mais perto do destino do que na metade");
ok(Math.abs(pQuase.x - 56) < 0.01, "a nove décimos de 20→60, o ponto é 56 — a fração é a da jornada, não um palpite");
ok(pontoDoHeroi({ jornada: { de: "Pedravale", para: "Lugar Nenhum" }, mapa }).x === 20, "destino desconhecido: fica sobre a origem, não some do mapa");
ok(pontoDoHeroi({ cidadeAtual: "Cidade Fantasma", mapa }) === null, "cidade que não está no mapa não vira ponto inventado");
/* v9.118: e ele passa a saber do LUGAR e do COVIL. O herói na fazenda
   continuava desenhado na praça, e quem saía de uma cripta reaparecia no
   centro da cidade — os dois pelo mesmo motivo: ninguém perguntava. */
const naFazenda = pontoDoHeroi({ cidadeAtual: "Pedravale", mapa, lugar: { nome: "a fazenda velha", coord: { x: 21.4, y: 30.2 } } });
ok(naFazenda.x === 21.4 && naFazenda.noLugar === "a fazenda velha", "fora dos muros, o ponto é o do lugar — não o da praça");
const noCovil = pontoDoHeroi({ cidadeAtual: "Pedravale", mapa, masmorra: { nome: "Cripta", coord: { x: 60, y: 61 } }, lugar: { nome: "a fazenda velha", coord: { x: 21.4, y: 30.2 } } });
ok(noCovil.x === 60 && noCovil.noCovil, "o covil ganha do lugar: a boca por onde se entrou é onde o herói está");

console.log("\n[7. A JORNADA ÓRFÃ]");
ok(jornadaValida({ de: "Pedravale" }, "Pedravale") !== null, "durante a viagem, cidade atual e origem são a mesma — a jornada vale");
ok(jornadaValida({ de: "Aldoria" }, "Rio do Sul") === null,
   "origem Aldoria com o herói em Rio do Sul: ele chegou e ninguém registrou — resto de save, não viagem");
ok(jornadaValida({ de: "Pedravale" }, "") !== null, "sem cidade nenhuma (mundo recém-criado), a jornada continua valendo");
ok(jornadaValida(null, "Pedravale") === null && jornadaValida({}, "x") === null, "lixo não vira viagem");

console.log("\n[8. OS ENVELOPES]");
const ev = envelopeDePartida("Rio do Sul", "Pedravale");
ok(/NÃO estou mais em Pedravale/.test(ev), "proíbe devolver o herói para a cidade que ele deixou");
ok(/a chegada é do sistema/.test(ev), "e proíbe teleportar até o destino");
ok(/NÃO invente o que há lá dentro/.test(envelopeDeMasmorra("Cripta")), "a masmorra proíbe improviso de sala");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
