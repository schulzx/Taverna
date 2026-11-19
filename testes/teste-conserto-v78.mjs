/* teste-conserto-v78.mjs (19/11/2026) — o conserto das telas novas depois da
   sessão jogada (mente/lancamento/mestre-vivo-sessao-2.md, Parte 2).

   Cada secção é um defeito que a sessão viu, e cada asserção falhava antes
   do conserto:
     1. a viagem presa em «faltam 0 h · a caminho», sem como chegar;
     2. o veredito de equipar que omitia «sem treino: desvantagem»;
     4. a crônica com Markdown cru, «Brumal de Brumal» e «Ladina golias»;
     5. «Porto clara» com a segunda palavra em minúscula;
     6. a pechincha sem chance antes do clique, e o preço que sobe sem aviso;
     8. o livro de uma fita só no começo do jogo. */
import fs from "node:fs";
import * as CM from "../src/carta-do-mapa.js";
/* namespaces, e não nomes: contra o código de antes do conserto a suíte tem
   de CORRER e falhar asserção a asserção, não morrer no import */
import * as VI from "../src/viagem.js";
import * as RA from "../src/rastro.js";
import * as CI from "../src/comparar-item.js";
import { avaliarEquipar } from "../src/itens.js";
import { ranksDoPersonagem } from "../src/classes.js";
import { gerarCronica } from "../src/cronica.js";
import * as OA from "../src/objetos-abertos.js";
import { conceitoDoSistema } from "../src/criacao-da-mesa.js";
import * as CO from "../src/comercio.js";

const { pechinchar, fatorDoLugar, apertarProcura, PRESSAO_TETO, PRESSAO_POR_COMPRA } = CO;
const nomeDeLugar = (...a) => VI.nomeDeLugar(...a), linhaDaViagem = (...a) => VI.linhaDaViagem(...a);
const envelopeDoUltimoPasso = (...a) => RA.envelopeDoUltimoPasso(...a);
const compararItem = (...a) => CI.compararItem(...a), fraseDaPenalidade = (...a) => CI.fraseDaPenalidade(...a);
const blocosDaCronica = (...a) => OA.blocosDaCronica(...a);
const chancesDaPechincha = (...a) => CO.chancesDaPechincha(...a), oQueAPracaSente = (...a) => CO.oQueAPracaSente(...a);

let ok = 0, mal = 0;
const t = (nome, cond, diz = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (diz ? "\n      " + diz : "")); } };
/* uma secção que estoura (a função ainda não existia) conta como falha */
const sec = (s, fn) => { console.log("\n" + s); try { fn(); } catch (e) { t(s + " — estourou", false, e.message); } };

sec("1. a estrada andada até ao fim oferece «Chegar a X»", () => {
  const nos = [{ id: "a", nome: "Forte Seco", tipo: "base" }, { id: "b", nome: "Porto clara", tipo: "povoado" }, { id: "c", nome: "Mina de Cinzas", tipo: "lugar" }];
  const naEstrada = (horas, extra = {}) => ({ nos, heroi: { onde: "viagem", noId: null, jornada: { de: "Forte Seco", para: "Porto clara", deId: "a", paraId: "b", horasQueFaltam: horas, estado: "em_curso", ...extra } } });
  const fim = CM.partidaNaCarta(naEstrada(0), nos[1], null, {});
  t("faltam 0 h: o destino dá o verbo «Chegar a Porto Clara», ligado", fim && fim.verbo === "Chegar a Porto Clara" && !fim.impedido && fim.chegar === true, JSON.stringify(fim));
  const outro = CM.partidaNaCarta(naEstrada(0), nos[2], null, {});
  t("faltam 0 h: outro lugar diz para chegar primeiro (desligado)", outro && outro.impedido && /chegue a Porto Clara primeiro/.test(outro.impedido), JSON.stringify(outro));
  const meio = CM.partidaNaCarta(naEstrada(2), nos[1], null, {});
  t("com estrada por andar, segue «Você já está na estrada» (desligado)", meio && meio.verbo === "Você já está na estrada" && !!meio.impedido);
  t("o `chegou` do mapa vivo também vale (sem horas)", CM.estradaNoFim(naEstrada(null, { chegou: true }).heroi) === true);
  t("parada por um encontro, não chega", CM.estradaNoFim(naEstrada(0, { estado: "pausada" }).heroi) === false);
  t("a carta diz que o destino está à vista", CM.ondeEstaNaCarta(naEstrada(0)) === "Porto Clara está à vista: falta só chegar.", CM.ondeEstaNaCarta(naEstrada(0)));
  t("o selo do cartão diz «à vista»", CM.estadoEmPalavras(nos[1], naEstrada(0).heroi) === "à vista");
  const env = envelopeDoUltimoPasso("Porto clara");
  t("o envelope do último passo é envelope (o prelúdio não o lê como frase) e nomeia o destino", env.startsWith("[") && env.includes("Porto clara"));
  /* a sessão de prova viu o continente (sem região) dizer «Você já está na
     estrada» com a estrada inteira andada: a carta dele também sabe */
  const mapaC = { cidades: [{ nome: "Cygnus Extremo", x: 10, y: 10 }, { nome: "Hélio Oculto", x: 40, y: 30 }], rotas: [{ de: "Cygnus Extremo", para: "Hélio Oculto", dias: 6 }] };
  const dc = CM.dadosDaCartaDoContinente(mapaC, { cidadeAtual: "Cygnus Extremo", jornada: { de: "Cygnus Extremo", para: "Hélio Oculto", totalMin: 2880, andadoMin: 2880 } });
  const pc = dc ? CM.partidaNaCarta(dc, dc.nos.find((n) => n.nome === "Hélio Oculto"), null, {}) : null;
  t("no continente, a estrada andada também dá «Chegar a Hélio Oculto»", pc && pc.verbo === "Chegar a Hélio Oculto" && !pc.impedido, JSON.stringify(pc));
  t("a contração «a» existe: «Chegar à Mina…» quando o nome tem artigo", CM.preposicao("a", "A Mina") === "à Mina");
});

sec("2. o veredito de equipar mostra a desvantagem antes do clique", () => {
  const ladina = { nome: "Dagny", classe: "Ladino", nivel: 1, atributos: { forca: 3 }, equipados: { arma: { nome: "Espada Curta", tipo: "arma" } } };
  const maca = { nome: "Maça Pesada", tipo: "arma" };
  const cmp = compararItem(ladina, maca, "arma");
  const doMotor = avaliarEquipar(ladina, maca, ranksDoPersonagem(ladina)).penalidades.map((p) => p.texto);
  t("a comparação traz as penalidades", Array.isArray(cmp.penalidades) && cmp.penalidades.length > 0);
  t("são as do motor (avaliarEquipar), sem regra nova", JSON.stringify(cmp.penalidades.map((p) => p.texto)) === JSON.stringify(doMotor));
  t("a frase de tela diz «sem treino… desvantagem», com maiúscula", /^Você não tem treino.*desvantagem/.test(fraseDaPenalidade(cmp.penalidades[0])), fraseDaPenalidade(cmp.penalidades[0]));
  const treinada = compararItem({ ...ladina, classe: "Guerreiro" }, maca, "arma");
  t("quem tem treino não vê penalidade", treinada.penalidades.length === 0);
  t("tirar (item nulo) não tem penalidade", compararItem(ladina, null, "arma").penalidades.length === 0);
});

sec("4. a crônica: sem Markdown cru, sem «Brumal de Brumal», o conceito na ordem certa", () => {
  const md = gerarCronica({ nomeCampanha: "A lenda de Dagny", mundo: { genero: "Fantasia medieval" }, personagem: { nome: "Dagny", nivel: 1, conceito: "x", cicatrizes: [{ nome: "Corte", descricao: "no rosto" }] }, conquistasIds: [], contadores: { viagens: 2 }, npcs: {}, mapa: { cidades: [] }, dia: 1 });
  const data = (md.match(/Registrada em ([^—]*)—/) || [])[1] || "";
  t("a data diz o mês uma vez só", data && (data.match(/ de /g) || []).length === 1, data);
  const blocos = blocosDaCronica(md);
  const textos = blocos.flatMap((b) => (b.partes || []).map((p) => p.texto));
  t("nenhum asterisco chega à página", textos.length > 0 && textos.every((x) => !x.includes("*")), textos.filter((x) => x.includes("*")).join(" | "));
  t("o «---» vira um fio (forma), não texto", blocos.some((b) => b.tipo === "fio") && textos.every((x) => !/^-{3,}$/.test(x.trim())));
  t("o itálico vira trecho em itálico", blocos.some((b) => (b.partes || []).some((p) => p.italico && p.texto.includes("A lenda de Dagny"))));
  t("os títulos viram títulos", blocos.filter((b) => b.tipo === "titulo").length >= 2 && blocos[0].tipo === "titulo");
  t("as listas viram linha com marca, sem o hífen", blocos.some((b) => b.tipo === "linha" && b.item === 1) && textos.every((x) => !x.startsWith("- ")));
  t("«Golias ladina, acólita fugitiva»: a raça primeiro, tudo em minúscula depois", conceitoDoSistema({ classe: "Ladino", raca: "Goliath", sexo: "mulher", antecedenteId: "acolito" }) === "Golias ladina, acólita fugitiva", conceitoDoSistema({ classe: "Ladino", raca: "Goliath", sexo: "mulher", antecedenteId: "acolito" }));
  t("o nome próprio do antecedente fica («filha da Guilda dos Dedos»)", conceitoDoSistema({ classe: "Ladino", raca: "Humano", sexo: "mulher", antecedenteId: "ladrao" }) === "Humana ladina, filha da Guilda dos Dedos");
});

sec("5. «Porto clara» na tela é «Porto Clara» (o save não muda)", () => {
  t("a segunda palavra sobe a maiúscula", nomeDeLugar("Porto clara") === "Porto Clara" && nomeDeLugar("Monte valente") === "Monte Valente");
  t("a partícula fica", nomeDeLugar("Vila do Sul") === "Vila do Sul" && nomeDeLugar("Rio e") === "Rio e");
  t("frase longa fica como está", nomeDeLugar("O que sobrou de Gelo") === "O que sobrou de Gelo");
  t("nome vazio ou nulo não estoura", nomeDeLugar(null) === "" && nomeDeLugar("") === "");
  t("a carta escreve «em Porto Clara»", CM.preposicao("em", "Porto clara") === "em Porto Clara");
  const j = { de: "Forte Seco", para: "Porto clara", totalMin: 240, andadoMin: 240, km: 20 };
  t("o registro da viagem escreve «Porto Clara»", linhaDaViagem(j).includes("Porto Clara") && !linhaDaViagem(j).includes("Porto clara"), linhaDaViagem(j));
});

sec("6. a banca: a chance da pechincha antes do clique, e a praça que sente a compra", () => {
  const c = chancesDaPechincha({ bonus: 0, dificuldade: 12 });
  t("d20+0 contra 12: 45% de baixar (12 a 20), 35% de ofender (1 a 7)", c.baixa === 45 && c.ofende === 35 && c.nada === 20, JSON.stringify(c));
  /* a mesma conta que o rolar: as vinte faces passam por pechinchar */
  let baixa = 0, ofende = 0;
  for (let f = 1; f <= 20; f++) { const r = pechinchar({ bonus: 3, dificuldade: 13, sorte: () => (f - 0.5) / 20 }); if (r.ok) baixa++; else if (r.ajuste > 1) ofende++; }
  const c2 = chancesDaPechincha({ bonus: 3, dificuldade: 13 });
  t("as chances são as da regra, face a face", c2.baixa === baixa * 5 && c2.ofende === ofende * 5);
  t("o preço de falhar vem dito (o preço sobe 8%)", c.perda === 8 && /sobe 8%/.test(c.texto));
  const cidade = { nome: "Forte Seco", bioma: "deserto", porte: "vila" };
  const armadura = { nome: "Armadura Rúnica", tipo: "armadura" };
  const p = oQueAPracaSente(armadura, { cidade, dia: 1 });
  const antes = fatorDoLugar(armadura, cidade, { dia: 1 }).fator, depois = fatorDoLugar(armadura, cidade, { dia: 1, pressoes: apertarProcura(null, cidade, "metal", 1) }).fator;
  t("comprar avisa: metal fica 6% mais caro aqui (a regra da procura)", p && p.pct === Math.round(PRESSAO_POR_COMPRA * 100) && Math.round((depois / antes - 1) * 100) === p.pct && /mais caro/.test(p.texto), JSON.stringify(p));
  const v = oQueAPracaSente(armadura, { cidade, dia: 1, vendendo: true });
  t("vender avisa que a próxima vale menos", v && /menos/.test(v.texto));
  /* a venda aperta a mesma procura (venderNoMercado → apertarProcura), e a
     sessão viu a Soqueira ir de 139 a 147 depois de vender uma besta: o
     veredito da venda tem de dizer também que comprar fica mais caro */
  t("vender avisa também que comprar o gênero fica mais caro", v && v.sobe === p.pct && /comprar metal fica 6% mais caro/.test(v.texto), v && v.texto);
  let cheia = null;
  for (let i = 0; i < Math.ceil(PRESSAO_TETO / PRESSAO_POR_COMPRA) + 2; i++) cheia = apertarProcura(cheia, cidade, "metal", 1);
  t("com a procura no teto, nada sobe e nada se avisa", oQueAPracaSente(armadura, { cidade, dia: 1, pressoes: cheia }) === null);
  t("item sem gênero não avisa nada", oQueAPracaSente({ nome: "Pedra" }, { cidade }) === null);
});

sec("8. o livro tem as cinco fitas desde o começo", () => {
  const fonte = fs.readFileSync(new URL("../src/painel-livro.jsx", import.meta.url), "utf8");
  t("o livro já não esconde as fitas do Códex", !fonte.includes('FITAS_DO_LIVRO.filter((f) => f.id === "buscas")'));
  t("a página dos Feitos vazia diz o que virá ali", fonte.includes("Nenhum lacre ainda."));
});

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
