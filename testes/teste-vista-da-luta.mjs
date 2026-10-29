/* A NARRAÇÃO LÊ O ESTADO DA LUTA (Fase MM, 11/10).

   A quinta sessão pôs a prosa contra o dado na única cena em que a vida
   estava em jogo: "o dragão sumiu" (M60–M62) com ele a 1,5 m e 3/29; "Hakon
   grita do vão da porta" com ele a 0/12, caído; o sopro narrado onde a
   mecânica deu a cabeçada. O Narrador recebia os golpes do MEIO da rodada
   e nunca o quadro do FIM dela. Esta suíte falha antes (não havia vista da
   luta na pauta) e passa depois — e prova que o prompt não cresce: tudo
   entra pela pauta, que tem teto próprio. */
import { readFileSync } from "node:fs";
import { vistaDaLuta, VISTA_DA_LUTA } from "../src/saida-da-luta.js";
import { porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const APP = readFileSync("../src/App.jsx", "utf8");

/* o quadro de M60: Inês caída, Hakon a 0/12, o Dragão a 3/29 a um passo */
const ines = {
  nome: "Inês Torquato", vida: 0, vidaMax: 22, morrendo: true, morte: { sucessos: 1, falhas: 1 },
  equipados: { arma: { nome: "Maça" } },
  grupo: [{ nome: "Hakon Guarda-Portão", vida: 0, vidaMax: 12 }],
};
const dragao = { nome: "Dragão Jovem", vida: 3, vidaMax: 29, x: 6, y: 4 };
const golpes = [{ quem: "Dragão Jovem", golpe: "Sopro incandescente" }, { quem: "Dragão Jovem", golpe: "Cabeçada estonteante" }];

console.log("\n[1. QUEM ESTÁ DE PÉ, E A QUE DISTÂNCIA]");
const v = vistaDaLuta({ heroi: ines, inimigos: [dragao], lugar: { x: 5, y: 4 }, golpes });
console.log("  " + v.quem);
ok(/de pé: Dragão Jovem 3\/29, a \d+ m de mim/.test(v.quem), "o Dragão está de pé, com a vida e a distância reais");
ok(/no chão: eu \(a morrer, sem sentidos\); Hakon Guarda-Portão \(0\/12\)/.test(v.quem), "eu e Hakon estamos no chão — e o estado de cada um");
ok(vistaDaLuta({ heroi: { ...ines, vida: 9 }, inimigos: [dragao] }).quem.includes("eu 9/22 (com Maça)"), "de pé, a arma com que luto entra na linha: o golpe real é o desta arma");
ok(/estável/.test(vistaDaLuta({ heroi: { ...ines, morte: { estavel: true } }, inimigos: [dragao] }).quem), "e o estável é dito estável, não a morrer");

console.log("\n[2. OS VETOS DAS TRÊS CONTRADIÇÕES]");
v.vetos.forEach((x) => console.log("  · " + x));
v.naoPode.forEach((x) => console.log("  · " + x));
ok(v.vetos.some((x) => /Hakon Guarda-Portão/.test(x) && /não fala, não age, não se levanta/.test(x)), "Hakon a 0/12 não grita do vão da porta (M57, M63)");
ok(v.vetos.some((x) => /Dragão Jovem a \d+ m: continua aqui — não sumiu/.test(x)), "o Dragão a um passo não 'sumiu' (M60–M62)");
ok(v.naoPode.some((x) => /Cabeçada estonteante/.test(x) && /não narre outro ataque/.test(x)), "os golpes desta rodada são os que o sistema nomeou (o sopro × a cabeçada)");
ok(vistaDaLuta({ heroi: ines, inimigos: [dragao], golpes: Array.from({ length: 9 }, (_, i) => ({ quem: "X", golpe: "g" + i })) }).naoPode[0].split(", ").length <= VISTA_DA_LUTA.tetoDeGolpes + 1, "a linha dos golpes tem teto — uma rodada de nove golpes não incha a pauta");
ok(vistaDaLuta({ heroi: { ...ines, vida: 9, grupo: [] }, inimigos: [{ ...dragao, x: null }] }).vetos.length === 0, "sem ninguém no chão e sem distância conhecida, nenhum veto à toa");
const todas = [v.quem, ...v.vetos, ...v.naoPode].join(" ");
ok(!/\b(grid|quadrado|coordenada)\b/i.test(todas), "nenhuma linha fala em grid, quadrado ou coordenada");

console.log("\n[3. O TETO DE PROMPT NÃO SE MEXE]");
{
  /* uma pauta de luta cheia — onde, masmorra, momento, contra, fecho, vetos
     — com e sem a vista: a vista só pode trocar linhas de menor prioridade,
     nunca passar do teto */
  let p = {};
  p = porNaPauta(p, "onde", "dentro da Boca de Pedra Torta, na sala do chefe · ensolarado · (aqui isto é um sepulcro esquecido) ⌖ K10 50,1 · 49,8 · marcha a nordeste — comporta: brigar de perto, um de cada vez");
  p = porNaPauta(p, "masmorra", "camada 3 de 3 · 4 das 7 salas da planta já vistas · 2 tochas na mão");
  p = porNaPauta(p, "momento", "A OBRA DELE (corre agora — fato do mundo; não diga de quem é): em Casa da Fonte um carroceiro sem rosto recruta os sem-casa a moeda por cabeça, e a carroça ainda não partiu.");
  p = porNaPauta(p, "contra", "Dragão Jovem: sair inteiro daqui, e briga só com quem impedir");
  p = porNaPauta(p, "naoPode", "o lugar não comporta: cercar por vários lados, correr, recuar sem virar as costas; qualquer coisa em área que não pegue quem está do meu lado");
  p = porNaPauta(p, "fecho", "termine em a consequência do que eu fiz, visível agora; nunca o cheiro, o som ou o ar a pressagiar");
  p = porNaPauta(p, "gente", "Hakon Guarda-Portão: mantém a mão na espada, calado");
  const antes = textoDaPauta(p, { turno: 51 });
  let q = porNaPauta(p, "quem", v.quem);
  q = porNaPauta(q, "vetoDoDesfecho", v.vetos);
  q = porNaPauta(q, "naoPode", v.naoPode);
  const depois = textoDaPauta(q, { turno: 51 });
  console.log(`  pauta da luta: ${antes.length} → ${depois.length} caracteres (teto ${TETO_DA_PAUTA})`);
  ok(depois.length <= TETO_DA_PAUTA, "com a vista, a pauta continua dentro do teto dela (o pior caso do prompt não cresce)");
  ok(/não sumiu/.test(depois) && /não fala, não age/.test(depois), "e os dois vetos da prosa contra o dado entram — prioridade de veto, à frente do enfeite");
}

console.log("\n[4. A FIAÇÃO]");
{
  const corpo = APP.slice(APP.indexOf("A VISTA DA LUTA. Na quinta sessão"), APP.indexOf("calou(\"a vista da luta na pauta\", e)") + 40);
  // retirada (trilha A, 29/10): «a pauta lê a ficha viva e o campo da luta de agora» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «e entra pela pauta dinâmica — QUEM, o veto e o NÃO PODE —, nunca pelo prompt fixo» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  // retirada (trilha A, 29/10): «os golpes são os da rodada que acabou de passar, nunca os de uma luta velha» — a pauta do turno mudou-se para src/motor/pauta-do-turno.js (aPautaDoTurno), e o App já não tem este texto; é a mesma pauta à letra, provada byte a byte contra o recorte do App em teste-motor-pauta-do-turno.mjs (275 casos), e o texto do motor não se lê (teste-assercoes-de-texto).
  ok(/golpesDaRodadaRef\.current = \{ rodada: rodadaAgora, golpes: acoes\.filter\(\(a\) => a && a\.golpeNome\)/.test(APP), "e saem do que `turnoDosInimigos` de facto rolou (o `golpeNome`)");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
