/* O HERDEIRO SÓ ENTRA COM A LUTA FECHADA (Fase MM, 11/10).

   Na quinta sessão, "Passar o fio" abriu Inês Torquato DENTRO da luta que
   matou Gaspar: o Dragão a 1,5 m, Hakon a 0/12, e o envelope a mandar o
   Narrador abrir com ela "chegando ao lugar onde a história parou". Ela
   atacou, errou, levou 31 de dano com 22 de vida e caiu à primeira rodada.
   Esta suíte falha antes (o fio passava sem fechar nada, e o envelope não
   sabia da luta) e passa depois. */
import { readFileSync } from "node:fs";
import { envelopeDoHerdeiro } from "../src/legado.js";
import { decidirSemSaida, aplicarSemSaida, SAIDA_DA_LUTA } from "../src/saida-da-luta.js";
import { rng } from "../src/semente.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const APP = readFileSync("../src/App.jsx", "utf8");

const h = { nivel: 3, moedas: 2, dominios: 0, guarda: false, guardado: [], faccao: "" };

console.log("\n[1. O ENVELOPE SABE QUE A LUTA ACABOU]");
{
  const sem = envelopeDoHerdeiro("Gaspar", "Inês", h);
  ok(sem === envelopeDoHerdeiro("Gaspar", "Inês", h, {}) && !/JÁ ACABOU/.test(sem), "morrer fora de luta: o envelope de sempre, byte a byte");
  const com = envelopeDoHerdeiro("Gaspar", "Inês", h, { daLuta: "Dragão Jovem, ferido, foge e deixa vocês no chão.", horas: SAIDA_DA_LUTA.horasAteOHerdeiro });
  ok(/A LUTA EM QUE GASPAR CAIU JÁ ACABOU/.test(com) && /Dragão Jovem, ferido, foge/.test(com), "com a luta, o Narrador lê como ela acabou");
  ok(/NÃO continua/.test(com) && /cena NOVA/.test(com), "e que o herdeiro começa numa cena nova, sem a luta");
  ok(new RegExp(`${SAIDA_DA_LUTA.horasAteOHerdeiro} horas depois`).test(com), "chegando depois — as horas que o relógio de facto andou");
  ok(/sabe o que aconteceu/.test(com), "sabendo o que aconteceu");
}

console.log("\n[2. A LUTA ABERTA DA SESSÃO 5 FECHA ANTES DO FIO]");
{
  const morto = { nome: "Gaspar Torquato", vida: 0, vidaMax: 20, morto: true, moedas: 7, grupo: [{ nome: "Hakon Guarda-Portão", vida: 0, vidaMax: 12 }] };
  const dragao = { nome: "Dragão Jovem", vida: 3, vidaMax: 29, ameaca: "elite" };
  const dec = decidirSemSaida({ heroi: morto, grupo: morto.grupo, inimigos: [dragao], intencao: "sair_vivo" });
  ok(!!dec && dec.motivo === "caidos", "o herói morto e Hakon no chão: a luta não tem saída");
  const r = aplicarSemSaida({ heroi: morto, inimigos: [dragao], decisao: dec, rolar: rng(5) });
  ok(r.inimigos.every((e) => e.derrotado), "depois do desfecho não sobra inimigo de pé — o herdeiro não tem em quem tropeçar");
  ok(r.heroi.morto === true, "o morto continua morto (o fio é dele)");
  ok(r.heroi.grupo[0].vida === SAIDA_DA_LUTA.pvAoAcordar, "e Hakon, que sobreviveu, acorda — é ele quem o herdeiro herda");
  const deP = { ...morto, grupo: [{ nome: "Hakon Guarda-Portão", vida: 9, vidaMax: 12 }] };
  const recuo = decidirSemSaida({ heroi: deP, grupo: deP.grupo, inimigos: [dragao] });
  ok(recuo && recuo.desfecho === "recuo", "com Hakon de pé, ele recolhe o corpo e recua");
  const rr = aplicarSemSaida({ heroi: deP, inimigos: [dragao], decisao: recuo, rolar: rng(5) });
  ok(rr.inimigos.every((e) => e.derrotado && e.fugiu) && /Hakon Guarda-Portão recolhe o corpo/.test(rr.linha), "e a luta fecha do mesmo jeito: " + rr.linha);
}

console.log("\n[3. A FIAÇÃO: FECHAR, DEPOIS ABRIR O HERDEIRO]");
{
  const corpo = APP.slice(APP.indexOf("const seguirComHerdeiro = (nome) => {"), APP.indexOf("PERGUNTAR AO MUNDO (v9.24)"));
  const iFecha = corpo.indexOf("fecharSemSaida(p, { forcar: true })");
  ok(iFecha > 0, "passar o fio fecha a luta que estiver aberta, mesmo sem ninguém de pé para decidir");
  ok(iFecha < corpo.indexOf("const h = heranca(p"), "e fecha ANTES de contar a herança — a bolsa que o saque levou não se herda");
  ok(iFecha < corpo.indexOf("const np = migrarPersonagem"), "e antes de o herdeiro nascer");
  ok(/daLuta = fimSemSaidaRef\.current; fimSemSaidaRef\.current = null;/.test(corpo), "o herdeiro lê o fim da última luta, e lê uma vez só");
  ok(/envelopeDoHerdeiro\(p\.nome, nomeNovo, h, \{ daLuta: daLuta \? daLuta\.linha : "", horas: horasH \}\)/.test(corpo), "e o envelope leva o que aconteceu e as horas");
  ok(/avancarMinutos\(horasH \* 60\)/.test(corpo) && /horasH = SAIDA_DA_LUTA\.horasAteOHerdeiro/.test(corpo), "o relógio anda as horas até o herdeiro chegar — a hora sai da tabela");
  ok(/calou\("o fio passa com a luta fechada", e\)/.test(corpo) && /calou\("as horas do herdeiro", e\)/.test(corpo), "toda fiação nova em try/calou");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
