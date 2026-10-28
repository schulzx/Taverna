/* A LUTA TEM SAÍDA (Fase MM, 11/10) — a prova do defeito 1 da quinta sessão.

   O fim da sessão 5 reproduzido com a ficha que ela deixou: Gaspar a 0 PV e
   estável, Hakon a 0/12, o Dragão Jovem a 1,5 m com 3/29 e a intenção de
   "sair inteiro daqui". Antes desta etapa, `turnoDosInimigos` devolvia zero
   golpes (ninguém de pé para apanhar), o herói rolava testes de morte depois
   de estabilizar, e o botão de esperar girava para sempre — dezoito chamadas
   do Narrador sobre o mesmo quadro. A suíte falha antes (o módulo não
   existia, o estável rolava de novo, a vez do mundo não perguntava se a luta
   tinha saída) e passa depois. */
import { readFileSync } from "node:fs";
import {
  SAIDA_DA_LUTA, DESFECHOS_SEM_SAIDA, O_QUE_O_VENCEDOR_FAZ, INTENCAO_QUE_MANDA,
  quemDecide, escolhaDoVencedor, decidirSemSaida, assinaturaDaLuta, contarParadas,
  rolarAteODesfecho, aplicarSemSaida, garantirFimSemSaida,
} from "../src/saida-da-luta.js";
import { turnoDosInimigos, testeDeMorte } from "../src/combate.js";
import { INTENCOES } from "../src/adversario.js";
import { DEGRAUS } from "../src/degraus.js";
import { rng, hashSemente } from "../src/semente.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const APP = readFileSync("../src/App.jsx", "utf8");

/* a mesa do fim da sessão 5 (mm11-sessao-5.md, M50–M64) */
const dragao = () => ({ nome: "Dragão Jovem", vida: 3, vidaMax: 29, ameaca: "elite", chefe: true, x: 6, y: 4 });
const hakon = () => ({ nome: "Hakon Guarda-Portão", classe: "Guerreiro", vida: 0, vidaMax: 12, mana: 1, manaMax: 5 });
const gaspar = () => ({
  nome: "Gaspar Torquato", classe: "Clérigo", nivel: 3, vida: 0, vidaMax: 20, moedas: 7,
  morrendo: true, morte: { sucessos: 0, falhas: 0, rolagens: [], estavel: true }, grupo: [hakon()],
});

console.log("\n[1. O QUADRO DA SESSÃO 5: O DRAGÃO NÃO TEM EM QUEM BATER]");
{
  const h = gaspar();
  const acoes = turnoDosInimigos({ inimigos: [dragao()], jogador: h, grupo: h.grupo, rodada: 9 });
  ok(Array.isArray(acoes) && acoes.length === 0, "com o meu lado inteiro no chão, a vez do mundo não traz golpe nenhum — era o giro em falso");
  const dec = decidirSemSaida({ heroi: h, grupo: h.grupo, inimigos: [dragao()], intencao: "sair_vivo" });
  ok(!!dec && dec.motivo === "caidos", "e a luta deixa de ter saída: ninguém do meu lado está de pé");
  ok(dec && dec.quem === "Dragão Jovem", "quem decide é quem ficou de pé");
  ok(dec && dec.desfecho === "fuga", "o Dragão que queria sair inteiro, a 3/29, vai-se embora (a intenção manda primeiro)");
  const semIntencao = decidirSemSaida({ heroi: h, grupo: h.grupo, inimigos: [dragao()] });
  ok(!!semIntencao && DESFECHOS_SEM_SAIDA[semIntencao.desfecho], "sem intenção declarada, a cabeça dele decide pela tabela — sempre um desfecho que existe");
}

console.log("\n[2. O DESFECHO APLICADO: A LUTA ACABA, O HERÓI ACORDA, O DRAGÃO NÃO ESTÁ]");
{
  const h = gaspar();
  const dec = decidirSemSaida({ heroi: h, grupo: h.grupo, inimigos: [dragao()], intencao: "sair_vivo" });
  const r = aplicarSemSaida({ heroi: h, inimigos: [dragao()], decisao: dec, rolar: rng(hashSemente("sessao-5")) });
  ok(r.inimigos.every((e) => e.derrotado && e.fugiu), "o Dragão sai da luta VIVO (`fugiu`): não rende XP nem tem o nome riscado do mundo");
  ok(!r.inimigos.some((e) => !e.derrotado && e.vida > 0), "e não sobra ninguém de pé do outro lado — a luta fecha");
  ok(r.heroi.vida === SAIDA_DA_LUTA.pvAoAcordar && !r.heroi.morrendo && !r.heroi.morto, "o herói estável acorda com 1 PV, fora do giro dos testes");
  ok(r.heroi.grupo[0].vida === SAIDA_DA_LUTA.pvAoAcordar, "e Hakon também acorda");
  ok(r.horas >= SAIDA_DA_LUTA.horasAteAcordar.min && r.horas <= SAIDA_DA_LUTA.horasAteAcordar.max, `as horas até acordar são o 1d4 do 5e (${r.horas})`);
  ok(/Dragão Jovem/.test(r.linha) && /foge/.test(r.linha), "a tela diz o que o Dragão fez: " + r.linha);
  ok(!/regra|desfecho|tabela|sistema|motor/i.test(r.linha), "e a frase da tela não fala de si mesma");
  ok(/A LUTA ACABOU/.test(r.envelope) && /NÃO continua/.test(r.envelope), "o Narrador recebe que a luta acabou e não continua");
  const r2 = aplicarSemSaida({ heroi: gaspar(), inimigos: [dragao()], decisao: dec, rolar: rng(hashSemente("sessao-5")) });
  ok(r2.horas === r.horas && r2.linha === r.linha, "mesma semente, mesmo desfecho — em qualquer máquina");
}

console.log("\n[3. O ESPERAR NÃO GIRA PARA SEMPRE]");
{
  /* o meu lado de pé, o inimigo do outro lado da sala sem alcançar: a mesma
     rodada três vezes. Antes desta etapa não havia contagem nenhuma. */
  const h = { ...gaspar(), vida: 12, morrendo: false, morte: { sucessos: 0, falhas: 0 }, grupo: [{ ...hakon(), vida: 8 }] };
  const inim = [{ ...dragao(), vida: 20 }];
  let paradas = 0, antes = "";
  const giros = [];
  for (let rodada = 1; rodada <= 6; rodada++) {
    const depois = assinaturaDaLuta({ heroi: h, grupo: h.grupo, inimigos: inim, lugares: [{ x: 1, y: 1 }] });
    paradas = contarParadas({ antes, depois, houveAcao: false, paradas });
    antes = depois;
    const dec = decidirSemSaida({ heroi: h, grupo: h.grupo, inimigos: inim, paradas });
    giros.push(dec ? dec.desfecho : "segue");
    if (dec) break;
  }
  ok(giros.length === SAIDA_DA_LUTA.rodadasParadas + 1 && giros[giros.length - 1] === "retirada",
    `três rodadas iguais depois da primeira, e quem estava do outro lado larga (${giros.join(" → ")})`);
  ok(contarParadas({ antes: "a", depois: "a", houveAcao: true, paradas: 2 }) === 0, "um golpe, mesmo errado, é rodada que mexeu: a contagem volta a zero");
  ok(contarParadas({ antes: "a", depois: "b", houveAcao: false, paradas: 2 }) === 0, "e um PV, um passo ou um teste de morte também");
  ok(contarParadas({ antes: "", depois: "a", houveAcao: false, paradas: 0 }) === 0, "a primeira rodada nunca conta como parada (não há com que comparar)");
}

console.log("\n[4. A TABELA DO VENCEDOR]");
{
  ok(Object.values(O_QUE_O_VENCEDOR_FAZ).every((l) => DESFECHOS_SEM_SAIDA[l.inteiro] && DESFECHOS_SEM_SAIDA[l.ferido]), "toda linha da tabela aponta para um desfecho que existe");
  ok(DEGRAUS.every((d) => O_QUE_O_VENCEDOR_FAZ[d.id]), "todo degrau de `degraus.js` tem a sua linha — nenhuma cabeça fica sem decidir");
  const ids = new Set(INTENCOES.map((i) => i.id));
  ok(Object.keys(INTENCAO_QUE_MANDA).every((k) => ids.has(k)), "toda intenção que manda existe no acervo do Adversário (nome torto nunca dispararia)");
  ok(Object.values(INTENCAO_QUE_MANDA).every((d) => DESFECHOS_SEM_SAIDA[d]), "e aponta para um desfecho que existe");
  ok(escolhaDoVencedor({ nome: "Lobo Cinzento", vida: 10, vidaMax: 10 }) === "abate", "a besta inteira não negocia");
  ok(escolhaDoVencedor({ nome: "Lobo Cinzento", vida: 3, vidaMax: 10 }) === "fuga", "a besta sangrando vai lamber as feridas");
  ok(escolhaDoVencedor({ nome: "Bandido da Estrada", vida: 10, vidaMax: 10, ameaca: "comum" }) === "saque", "o bandido leva a bolsa");
  ok(escolhaDoVencedor({ nome: "Esqueleto Antigo", vida: 2, vidaMax: 10 }) === "abate", "o morto-vivo cumpre o que foi posto para cumprir, ferido ou não");
  ok(escolhaDoVencedor({ nome: "Bandido", vida: 10, vidaMax: 10 }, { intencao: "capturar" }) === "prisioneiros", "quem queria levar vivo leva prisioneiros");
  /* a primeira prova viva: `terminar` e `acabar_o_ferido` disparam em toda
     luta perdida (são tática de meio de luta), e mandavam executar o grupo */
  ok(!("terminar" in INTENCAO_QUE_MANDA) && !("acabar_o_ferido" in INTENCAO_QUE_MANDA)
    && escolhaDoVencedor({ nome: "Bandido da Estrada", vida: 40, vidaMax: 40, ameaca: "competente" }, { intencao: "terminar" }) === "saque",
    "bater primeiro no que cambaleia é tática, não sentença: o salteador que quis terminar a luta ainda só leva a bolsa");
  ok(quemDecide([{ nome: "a", vida: 3, vidaMax: 8 }, { nome: "b", vida: 1, vidaMax: 30 }, { nome: "c", vida: 0, vidaMax: 50, derrotado: true }]).nome === "b", "quem fala pelo outro lado é o maior corpo de pé");
  ok(decidirSemSaida({ heroi: gaspar(), inimigos: [{ ...dragao(), vida: 0, derrotado: true }] }) === null, "sem ninguém de pé do outro lado é vitória — a porta é outra");
  ok(decidirSemSaida({ heroi: { ...gaspar(), vida: 0, morto: true }, grupo: [{ ...hakon(), vida: 9 }], inimigos: [dragao()] }).desfecho === "recuo", "o herói morto com o grupo de pé: o grupo recolhe o corpo e recua");
  ok(decidirSemSaida({ heroi: { ...gaspar(), vida: 0, morrendo: true }, grupo: [{ ...hakon(), vida: 9 }], inimigos: [dragao()] }) === null, "o herói a morrer com alguém de pé que o pode acudir: a luta continua");
}

console.log("\n[5. O RESTO DOS TESTES, E OS OUTROS DESFECHOS]");
{
  const a = rolarAteODesfecho({ sucessos: 0, falhas: 0 }, rng(hashSemente("dado")));
  const b = rolarAteODesfecho({ sucessos: 0, falhas: 0 }, rng(hashSemente("dado")));
  ok(["estavel", "morto", "revive"].includes(a.desfecho) && a.desfecho === b.desfecho && a.rolagens.length === b.rolagens.length, `quem ficou a morrer rola até ao fim, preso à semente (${a.desfecho})`);
  ok(Number.isFinite(testeDeMorte(rng(1)).rolo) && testeDeMorte(rng(7)).rolo === testeDeMorte(rng(7)).rolo, "`testeDeMorte` aceita o gerador e continua a aceitar nada");
  const h = { ...gaspar(), moedas: 50 };
  const saque = aplicarSemSaida({ heroi: h, inimigos: [{ nome: "Bandido", vida: 10, vidaMax: 10 }], decisao: { motivo: "caidos", desfecho: "saque", quem: "Bandido" }, rolar: rng(3) });
  ok(saque.moedasLevadas === 50 && saque.heroi.moedas === 0 && /bolsa/.test(saque.envelope), "o saque leva a bolsa, e a conta fecha");
  const presos = aplicarSemSaida({ heroi: { ...gaspar(), morte: { sucessos: 0, falhas: 2 } }, inimigos: [{ nome: "Capitão", vida: 10, vidaMax: 10 }], decisao: { motivo: "caidos", desfecho: "prisioneiros", quem: "Capitão" }, rolar: rng(3) });
  /* "amarrado" virou "de mãos atadas": a segunda prova viva tinha uma heroína,
     e o particípio dava-lhe o género errado */
  ok(!presos.heroi.morto && presos.heroi.vida === 1 && /de mãos atadas/.test(presos.envelope) && !/já não está aqui/.test(presos.envelope),
    "o captor estabiliza quem leva: o prisioneiro acorda de mãos atadas, nas mãos de quem venceu — que não 'se foi'");
  const so = aplicarSemSaida({ heroi: { ...gaspar(), grupo: [] }, inimigos: [{ nome: "Capitão", vida: 10, vidaMax: 10 }], decisao: { motivo: "caidos", desfecho: "prisioneiros", quem: "Capitão" }, rolar: rng(3) });
  ok(/ata-lhe as mãos e leva você consigo/.test(so.linha) && /acordo preso/.test(so.envelope) && /leva todos consigo/.test(presos.linha), "sozinho, a frase é de um só; em grupo, de todos");
  const abate = aplicarSemSaida({ heroi: gaspar(), inimigos: [{ nome: "Lobo", vida: 10, vidaMax: 10 }], decisao: { motivo: "caidos", desfecho: "abate", quem: "Lobo" }, rolar: rng(3) });
  ok(abate.heroi.morto && abate.morreu && abate.heroi.grupo.length === 0 && abate.mortosDoGrupo.includes("Hakon Guarda-Portão"), "o abate acaba com quem estava no chão — o herói e o companheiro");
  const ret = aplicarSemSaida({ heroi: { ...gaspar(), vida: 9, morrendo: false }, inimigos: [dragao()], decisao: { motivo: "parada", desfecho: "retirada", quem: "Dragão Jovem" }, rolar: rng(3) });
  ok(ret.horas === 0 && ret.heroi.vida === 9 && ret.inimigos.every((e) => e.fugiu), "a retirada não mexe em ninguém do meu lado: só quem largou a luta sai dela");
  ok(garantirFimSemSaida(null) === null && garantirFimSemSaida({ linha: "" }) === null && garantirFimSemSaida({ linha: "x", horas: "3" }).horas === 3, "o campo do save aguenta null, vazio e número em texto");
}

console.log("\n[6. A FIAÇÃO: A VEZ DO MUNDO PERGUNTA, E O ESTÁVEL FICA QUIETO]");
{
  const corpo = APP.slice(APP.indexOf("const finalizarRodada = (escolhaDaRodada, comoFezDaRodada) => {"), APP.indexOf("A RODADA SUSPENDE AQUI"));
  ok(/const fimSem = fecharSemSaida\(persAtual\);/.test(corpo), "a vez do mundo pergunta se a luta ainda tem saída, a cada rodada");
  ok(corpo.indexOf("resolverQueda(persAtual") < corpo.indexOf("fecharSemSaida(persAtual)"), "e pergunta DEPOIS do teste de morte da rodada — com o estado final do herói");
  ok(/contarParadas\(\{ antes: cAgora\.assinatura \|\| "", depois, houveAcao: acoes\.length > 0 \|\| partesComp\.length > 0/.test(corpo), "a rodada parada é contada contra a anterior, e um golpe ou um gesto do grupo a desfaz");
  ok(/\} catch \(e\) \{ calou\("a vez do mundo sem saída", e\); \}/.test(corpo), "a fiação nunca pode custar o turno");
  ok(/\$\{morteTxt\}\$\{envelopeSemSaida\}/.test(corpo) && /\(!envelopeSemSaida && persAtual\.vida <= 0\)/.test(corpo), "o Narrador recebe o desfecho, e não o 'um aliado pode me estabilizar' de quem já acordou");
  const fss = APP.slice(APP.indexOf("const fecharSemSaida = (persBase, { forcar = false } = {}) => {"), APP.indexOf("const fecharSeTodosCairam = (persBase = null) => {"));
  ok(fss.length > 500 && !/fecharSeTodosCairam\(/.test(fss) && !/concluirMasmorraDoChefe|gerarEspolios/.test(fss), "a luta perdida NÃO passa pela porta da vitória: nada de espólio nem de tesouro do chefe");
  ok(/notarFechoDaLuta\(\{ combate: fimDaLuta, desfecho: [^}]*"derrota"[^}]*linha:/.test(fss), "e a tela do fim recebe o desfecho e a frase do que o inimigo fez");
  ok(/combateRef\.current = null;/.test(fss) && /calou\("fechar a luta sem saída", e\)/.test(fss), "fecha a luta de verdade, em try/calou");
  /* (movido, T1-A 8.ª fatia: a regra da queda saiu do resolverQueda do App
     para aQueda, src/motor/entrega-do-turno.js — o resolverQueda ficou
     invólucro dela; e o motor prova-se jogando, não lendo o texto dele) */
  const { aQueda } = await import("../src/motor/entrega-do-turno.js");
  let pedidas = 0;
  const estavel = { vida: 0, morrendo: true, morte: { sucessos: 0, falhas: 0, rolagens: [], estavel: true } };
  const qe = aQueda(estavel, { dia: 1, sorteDoTurno: () => { pedidas++; return () => 0.05; } });
  ok(qe.pers === estavel && pedidas === 0 && qe.msgs.length === 0, "quem estabilizou não rola de novo (o 'Você estabiliza' seguido de dois testes falhados)");
  const qs = aQueda({ vida: 0, morrendo: true, morte: { sucessos: 2, falhas: 1 } }, { dia: 1, sorteDoTurno: () => () => 0.6 });
  ok(JSON.stringify(qs.pers.morte) === JSON.stringify({ sucessos: 0, falhas: 0, rolagens: [], estavel: true }) && qs.pers.morrendo === true, "e o ramo do estável marca a ficha");
  ok(/fimSemSaida: fimSemSaidaRef\.current/.test(APP) && /fimSemSaidaRef\.current = garantirFimSemSaida\(sv\.fimSemSaida\)/.test(APP), "o fim da luta vai ao save e volta no load, pelo garantir");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
