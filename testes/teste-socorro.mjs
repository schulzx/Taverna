/* O SOCORRO (Fase MC · MC10, 11/11) — a prova do defeito 8 da 18.ª sessão.

   A irmã caiu a 0 PV, o herói estancou-a, e não houve teste nem estado: o
   Narrador decidiu sozinho que o sangue parou. O companheiro caído do grupo
   era só `vida <= 0` — sem testes de morte, sem «estável». Aqui: o caído
   sangra até um dado de Medicina dizer que não; o sucesso estabiliza (muda
   o estado, e o estável acorda com as horas da régua do herói); a falha
   cobra a linha `medicina` de CUSTO_DE_FALHAR; sem ninguém caído, não há
   chamado. */
import {
  SOCORRO, caidosDoGrupo, oSocorro, aplicarSocorro, passarHorasNoGrupo, oSocorroNaPauta,
} from "../src/socorro.js";
import { lerAcao, custoPorAlvo, desafioPorId } from "../src/desafios.js";
import { SAIDA_DA_LUTA } from "../src/saida-da-luta.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object") { Object.values(x).forEach(congelar); Object.freeze(x); } return x; };

/* o grupo da 18.ª: a irmã no chão, o outro de pé */
const grupo = () => [
  { nome: "Elowen", conceito: "irmã", vida: 0, vidaMax: 14 },
  { nome: "Cael Duarte", conceito: "amigo", vida: 9, vidaMax: 12 },
];

sec("§1 O ESTADO QUE HAVIA, E O QUE NASCE");
{
  t("o caído do grupo é quem está a 0 PV e não morreu", J(caidosDoGrupo(grupo()).map((c) => c.nome)) === J(["Elowen"]));
  t("sem marca, sangra", caidosDoGrupo(grupo())[0].estado === "sangrando");
  t("o morto não é caído a socorrer", caidosDoGrupo([{ nome: "Hakon", vida: 0, morto: true }]).length === 0);
  t("o preço é o da linha medicina do catálogo", SOCORRO.alvo === desafioPorId("estancar").alvo && !!custoPorAlvo(SOCORRO.alvo));
  t("as frases dos dois estados existem", ["sangrando", "estavel"].every((e) => SOCORRO.linha[e] && SOCORRO.naoPode[e]));
}

sec("§2 HÁ CHAMADO? — só com alguém caído");
{
  const g = grupo();
  const frases = {
    "Cuido das feridas de Elowen.": "Elowen",
    "Socorro a minha irmã.": "Elowen",
    "Faço um torniquete.": "Elowen",
    "Pressiono o ferimento.": "Elowen",
  };
  for (const [f, quem] of Object.entries(frases)) {
    const v = lerAcao(f, {});
    const s = oSocorro(v, g);
    t(`«${f}» → estancar ${quem}`, v && v.id === "estancar" && s && s.alvo === quem, J(s));
  }
  t("SEM PESSOA CAÍDA, NÃO HÁ CHAMADO", oSocorro(lerAcao("Faço um torniquete.", {}), [{ nome: "Elowen", vida: 6, vidaMax: 14 }]) === null);
  t("quem a frase nomeia está de pé: não há chamado", oSocorro(lerAcao("Cuido das feridas de Cael.", {}), g) === null);
  t("sem grupo: não há chamado", oSocorro(lerAcao("Faço um torniquete.", {}), null) === null && oSocorro(lerAcao("Faço um torniquete.", {}), []) === null);
  const dois = [...g, { nome: "Maren", conceito: "amiga", vida: 0, vidaMax: 10 }];
  t("com dois no chão e nenhum nomeado, a frase tem de dizer quem", oSocorro(lerAcao("Faço um torniquete.", {}), dois) === null);
  t("e nomeado, é esse", oSocorro(lerAcao("Cuido das feridas de Maren.", {}), dois).alvo === "Maren");
  t("outro teste não é socorro", oSocorro(lerAcao("Me contorço para soltar os pulsos.", {}), g) === null && oSocorro(null, g) === null);
}

sec("§3 O DADO DECIDE — o sucesso estabiliza, a falha cobra");
{
  const g = congelar(grupo());
  const ok = aplicarSocorro(g, { quem: "minha irmã", sucesso: true, sorte: rng(hashSemente("s18")) });
  const elo = ok.grupo.find((m) => m.nome === "Elowen");
  t("ESTABILIZAR MUDA O ESTADO: de sangrando para estável", ok.estabilizou && caidosDoGrupo(ok.grupo)[0].estado === "estavel");
  t("continua a 0 PV, sem sentidos — o socorro não cura", elo.vida === 0 && elo.morrendo === false);
  const { min, max } = SAIDA_DA_LUTA.horasAteAcordar;
  t(`e acorda nas horas da régua do herói (${elo.estavel.horas}, entre ${min} e ${max})`, elo.estavel.horas >= min && elo.estavel.horas <= max);
  t("a linha diz o que aconteceu, sem falar de si", /Elowen/.test(ok.linha) && !/teste|regra|sistema|Medicina/i.test(ok.linha));
  t("o grupo de entrada não mudou", g[0].estavel === undefined && ok.grupo !== g);
  t("quem estava de pé fica igual", J(ok.grupo[1]) === J(g[1]));

  const mal = aplicarSocorro(g, { quem: "Elowen", sucesso: false });
  t("A FALHA TEM O PREÇO DA LINHA MEDICINA", J(mal.preco) === J(custoPorAlvo("medicina")) && !mal.estabilizou);
  t("e o estado fica: continua a sangrar", caidosDoGrupo(mal.grupo)[0].estado === "sangrando");
  t("o estancado não se estanca outra vez (nem chamado, nem preço)", oSocorro(lerAcao("Faço um torniquete.", {}), ok.grupo) === null && aplicarSocorro(ok.grupo, { quem: "Elowen", sucesso: false }).preco === null);
  const dist = new Set(Array.from({ length: 200 }, (_, i) => aplicarSocorro(grupo(), { quem: "Elowen", sucesso: true, sorte: rng(hashSemente("h" + i)) }).grupo[0].estavel.horas));
  t(`a sorte cobre todas as horas da régua (${[...dist].sort().join(",")})`, dist.size === max - min + 1);
  t("mesma semente, mesmas horas", J(aplicarSocorro(grupo(), { quem: "Elowen", sucesso: true, sorte: rng(hashSemente("x")) })) === J(aplicarSocorro(grupo(), { quem: "Elowen", sucesso: true, sorte: rng(hashSemente("x")) })));
}

sec("§4 AS HORAS PASSAM — o estável acorda");
{
  const g = aplicarSocorro(grupo(), { quem: "Elowen", sucesso: true, sorte: () => 0.99 }).grupo;
  const horas = g[0].estavel.horas;
  const meio = passarHorasNoGrupo(g, horas - 1);
  t("antes da hora, continua no chão e estável", meio[0].vida === 0 && meio[0].estavel.horas === 1);
  const fim = passarHorasNoGrupo(g, horas);
  t(`na hora, acorda com ${SAIDA_DA_LUTA.pvAoAcordar} PV e perde a marca`, fim[0].vida === SAIDA_DA_LUTA.pvAoAcordar && fim[0].estavel === undefined);
  t("quem sangra não acorda sozinho", passarHorasNoGrupo(grupo(), 24)[0].vida === 0);
  const curada = [{ ...g[0], vida: 7 }];
  t("quem se levantou por outra porta (uma cura) perde a marca", passarHorasNoGrupo(curada, 0)[0].estavel === undefined && passarHorasNoGrupo(curada, 0)[0].vida === 7);
  t("lixo no grupo passa sem estourar", J(passarHorasNoGrupo([null, 3, { nome: "A", vida: 5 }], 2)) === J([null, 3, { nome: "A", vida: 5 }]) && J(passarHorasNoGrupo(null, 2)) === "[]");
}

sec("§5 A PAUTA — o Narrador não estanca sozinho");
{
  const p = oSocorroNaPauta(grupo());
  t("a sangrar: a linha diz, e o veto proíbe parar o sangue sem dado", /Elowen/.test(p.linha) && p.naoPode.length === 1 && /sem um dado de Medicina/.test(p.naoPode[0]));
  const g2 = aplicarSocorro(grupo(), { quem: "Elowen", sucesso: true, sorte: () => 0 }).grupo;
  const p2 = oSocorroNaPauta(g2);
  t("estável: o veto proíbe acordá-la antes do tempo", /antes do tempo/.test(p2.naoPode[0]) && /sangue parou/.test(p2.linha));
  t("sem caídos, nada", J(oSocorroNaPauta([{ nome: "Cael", vida: 9 }])) === J({ linha: "", naoPode: [] }) && oSocorroNaPauta(null).linha === "");
  const muitos = Array.from({ length: 8 }, (_, i) => ({ nome: "Companheiro Comprido Número " + i, vida: 0 }));
  t("a linha tem teto", oSocorroNaPauta(muitos).linha.length <= SOCORRO.teto + 1);
}

sec("§6 O LIXO");
{
  t("aplicarSocorro sem nada: o grupo vazio, sem preço", J(aplicarSocorro(null, null)) === J({ grupo: [], estabilizou: false, preco: null, linha: "" }));
  t("caidosDoGrupo com lixo", J(caidosDoGrupo([null, 0, "x", { vida: 0 }])) === "[]" && J(caidosDoGrupo(undefined)) === "[]");
}

console.log(`\nO SOCORRO: ${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
