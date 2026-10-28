/* ============================================================
   O CRONISTA DO TURNO, NO MOTOR (T1-A, 9.ª fatia, 28/10/2026) — testes/teste-motor-cronista-do-turno.mjs

   O gatilho, o pedido ao Cronista e o aceito aplicado ao estado saíram do
   `cronistaDoTurno` do App para src/motor/cronista-do-turno.js. Aqui são
   provados byte a byte contra os de antes: `cronista-dourado.json` é o que
   o App de 760fe1b fez — a função inteira recortada à letra — sobre os 275
   casos de `cronista-bloco.mjs`; e esta suíte recorta do App de HOJE a
   fiação que ficou (o estado lido, os efeitos, as portas e o
   `cronistaDoTurno` que chama o motor) e corre-a, com as peças puras,
   sobre os mesmos casos e os mesmos dublês.

   E a prova tem de morder: o estado lido uma vez só (e não a cada secção),
   os efeitos aplicados fora de ordem, a conferência sem a conversa, o
   pedido sem a fila, o gatilho sem a frase, o teste com a rolagem
   esquecida — as fotos TÊM de divergir.
   ============================================================ */
import fs from "node:fs";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeHoje, blocoComoFuncao, correrOBloco, fotoDoCronista, casosDoCronista } from "./cronista-bloco.mjs";
import { oGatilhoDoCronista, oPedidoAoCronista, oAceitoDoCronista, PEDIDO_DO_CRONISTA } from "../src/motor/cronista-do-turno.js";
import { SECAO_DO_CRONISTA } from "../src/prometido.js";
import { garantirLeitura } from "../src/gatilho-do-cronista.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const D = JSON.parse(fs.readFileSync(new URL("./cronista-dourado.json", import.meta.url), "utf8"));
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const casos = casosDoCronista(N_CASOS);
const recorte = recorteDeHoje(APP);
const hoje = blocoComoFuncao(recorte);
const fotosDe = async (fn) => { const o = []; for (const k of casos) o.push(fotoDoCronista(await correrOBloco(fn, k, { novo: true }))); return o; };
const divergem = (novas) => novas.filter((f, i) => !igual(f, D.fotos[i])).length;
const trocado = (de, para) => {
  if (recorte.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  return blocoComoFuncao(recorte.replace(de, para));
};

sec("1 · o cronistaDoTurno, byte a byte contra o de antes");
const novas = await fotosDe(hoje);
{
  t(`o dourado é do commit de antes (760fe1b), ${N_CASOS} casos`, D.commit === "760fe1b" && D.fotos.length === N_CASOS);
  const batem = novas.filter((f, i) => igual(f, D.fotos[i])).length;
  const primeira = novas.findIndex((f, i) => !igual(f, D.fotos[i]));
  t(`${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira} diverge: ${JSON.stringify(novas[primeira]).slice(0, 500)} | antes ${JSON.stringify(D.fotos[primeira]).slice(0, 500)}` : "");
  t("determinista", igual((await fotosDe(hoje)).slice(0, 60), novas.slice(0, 60)));
  t("nenhum nome sem dublê, antes ou hoje (nada caiu em silêncio num catch)", [...D.fotos, ...novas].every((f) => !f.faltas.length), [...new Set(novas.flatMap((f) => f.faltas))].join(", "));
  t("nada estoura para fora, antes ou hoje", [...D.fotos, ...novas].every((f) => !f.erro));
  const conta = (f) => D.fotos.filter(f).length;
  const porta = (n) => conta((x) => x.portas.includes(n));
  const linha = (rx) => conta((x) => x.tela.some((l) => l.some((m) => rx.test(m))));
  console.log(`      o lugar ${porta("registrarLugar")} · o cartaz pregado ${linha(/^📋/)} · o relógio ${linha(/Começou a contar/)} · o fim do global ${porta("marcarNoArco")} · a gente ${porta("sincronizarNemesis")} · a conferência ${porta("conferirAsMissoes")} · a fé ${porta("ganharFe")} · a coesão ${linha(/continua de pé/)} · o grupo ${porta("fichaDeCompanheiro")} · o teste ${linha(/pede um teste/)}`);
  t("percorre as secções (cada uma acesa em vários casos)", ["registrarLugar", "pregarNoMural", "marcarNoArco", "sincronizarNemesis", "conferirAsMissoes", "ganharFe", "mundoDaBase", "fichaDeCompanheiro"].every((n) => porta(n) >= 5) && linha(/Começou a contar/) >= 5 && linha(/continua de pé/) >= 5 && linha(/pede um teste/) >= 5);
  t("e os que não leem (a narração curta, a rede caída, o lixo) também lá estão", conta((x) => !x.portas.length && !x.tela.length) >= 20);
}

sec("2 · a prova morde");
{
  /* o estado lido UMA vez, antes das secções: o cartaz vê a cidade de antes de a régua do lugar a mudar, e a conferência não vê o elenco tocar */
  const umaVez = divergem(await fotosDe(trocado("    ler: estadoDoCronista,\n", "    ler: ((x) => () => x)(estadoDoCronista()),\n")));
  t(`o estado lido uma vez só, e não a cada secção: ${umaVez} fotos divergem`, umaVez > 10);
  /* os efeitos aplicados fora da ordem em que nasceram: as linhas da nota trocam de lugar */
  const foraDeOrdem = divergem(await fotosDe(trocado("for (const ef of efeitos) aplicarEfeitoDoCronista(ef);", "for (const ef of [...efeitos].reverse()) aplicarEfeitoDoCronista(ef);")));
  t(`os efeitos fora de ordem: ${foraDeOrdem} fotos divergem`, foraDeOrdem > 20);
  const semConversa = divergem(await fotosDe(trocado("ref.current = (o && (o.segredos || o.falouCom)) || [];", "ref.current = [];")));
  t(`a conferência sem a conversa nem o segredo: ${semConversa} fotos divergem`, semConversa > 20);
  const semFila = divergem(await fotosDe(trocado("{ narrativa, fila: filaDoCronista }", "{ narrativa, fila: \"\" }")));
  t(`o pedido sem a fila das narrações não lidas: ${semFila} fotos divergem`, semFila > 20);
  /* o gatilho sem os nomes que o sistema já conhece: o elenco, o cânone e o mapa acendem o "nome novo", e a narração que ia para a fila é lida */
  const semConhecidos = divergem(await fotosDe(trocado("gatilho = oGatilhoDoCronista(estadoDoCronista(), { narrativa, doTurno, pers }", "gatilho = oGatilhoDoCronista({}, { narrativa, doTurno, pers: null }")));
  t(`o gatilho sem os nomes conhecidos: ${semConhecidos} fotos divergem`, semConhecidos > 5);
  const semRolagem = divergem(await fotosDe(trocado("pers, narrativa, testeDoTurno, rolagem }", "pers, narrativa, testeDoTurno, rolagem: null }")));
  t(`o teste da concessão com a rolagem esquecida: ${semRolagem} fotos divergem`, semRolagem > 2);
  const semFicha = divergem(await fotosDe(trocado("    else if (ef.tipo === \"ficha\") setPersonagem(ef.personagem);\n", "")));
  t(`a ficha que não redesenha: ${semFicha} fotos divergem`, semFicha > 20);
}

sec("3 · as peças, sozinhas");
{
  t("o pedido é o do Cronista, com a secção das promessas dentro", PEDIDO_DO_CRONISTA.startsWith("Você é o CRONISTA de um RPG.") && PEDIDO_DO_CRONISTA.includes(SECAO_DO_CRONISTA) && PEDIDO_DO_CRONISTA.includes("REGRA GERAL: na dúvida, NÃO marque"));
  const ped = oPedidoAoCronista({ npcs: {}, missoes: [], canone: {} }, { narrativa: "A NARRAÇÃO", fila: "" });
  t("o pedido sem nada aberto diz (nenhuma), (nenhum), (ninguém) e acaba na narração", ped.sys === PEDIDO_DO_CRONISTA && ped.user.includes("(nenhuma)") && ped.user.includes("(sem combate aberto)") && ped.user.includes("(ninguém)") && ped.user.endsWith("NARRATIVA DO TURNO:\nA NARRAÇÃO") && ped.erro === null);
  const ped2 = oPedidoAoCronista({ npcs: { Doran: {} }, missoes: [{ id: "x", titulo: "Os lobos", dador: "Hilda", status: "ativa", etapas: [] }], canone: {}, combate: { inimigos: [{ nome: "Lobo", vida: 4 }, { nome: "Morto", vida: 0 }] } }, { narrativa: "N", fila: "FILA\n\n" });
  t("…e com: a missão aberta, quem está de pé (o morto não), o elenco, a fila antes da narração", ped2.user.includes("\"Os lobos\" (de Hilda)") && ped2.user.includes("- Lobo — 4 PV") && !ped2.user.includes("Morto") && ped2.user.includes("Doran") && ped2.user.includes("FILA\n\nNARRATIVA DO TURNO:\nN"));
  const vazio = garantirLeitura(null);
  t("o gatilho: o nome que o sistema conhece não acende, o novo acende", !oGatilhoDoCronista({ npcs: { "Brannoc da Foz": {} } }, { narrativa: "Você vê que o ferreiro Brannoc da Foz sorri." }, vazio).motivos.includes("nome") && oGatilhoDoCronista({ npcs: {} }, { narrativa: "Você vê que o ferreiro Brannoc da Foz sorri." }, vazio).motivos.includes("nome"));
  t("o gatilho: a luta de pé e o deus desperto acendem; o herói vem de `pers` antes do estado", oGatilhoDoCronista({ combate: { inimigos: [{ nome: "Lobo", vida: 2 }] } }, { narrativa: "x" }, vazio).motivos.includes("luta") && oGatilhoDoCronista({ divindade: { despertar: true } }, { narrativa: "x" }, vazio).motivos.includes("fe") && !oGatilhoDoCronista({ personagem: { nome: "Outro" } }, { narrativa: "Você vê que Vera Sal sorri.", pers: { nome: "Vera Sal" } }, vazio).motivos.includes("nome"));
  t("leituras `null` não estouram", !!oGatilhoDoCronista(null, null, null) && typeof oPedidoAoCronista({ npcs: {} }, null).user === "string");
  /* o aceito, com portas que gravam o que viram: os efeitos chegam ANTES de cada porta */
  const visto = [];
  let estado = { prometido: null, relogios: [], dia: 3, npcs: {}, personagem: { nome: "Vera" }, combate: null, divindade: null };
  const ctx = {
    pers: { nome: "Vera", nivel: 3, atributos: { presenca: 2 }, grupo: [] }, narrativa: "x", testeDoTurno: null, rolagem: null,
    ler: () => estado,
    aplicar: (efs) => { for (const ef of efs) { visto.push(ef.tipo); if (ef.tipo === "relogios") estado = { ...estado, relogios: ef.relogios }; if (ef.tipo === "prometido") estado = { ...estado, prometido: ef.prometido }; } },
    registrarLugar: (nome) => { visto.push("porta:lugar:" + (estado.prometido ? "com o prometido" : "sem")); return "📍 " + nome; },
  };
  const fim = oAceitoDoCronista({ lugar: "o moinho", relogio_novo: { nome: "O ritual", tipo: "ameaca", segmentos: 4, gatilho: "noite", consequencia: "x" }, teste_sugerido: { atributo: "Presença", perfil: "dificil", motivo: "o rei cede" } }, [], {}, ctx);
  t("a promessa aplicada antes da régua do lugar (a ordem é o contrato)", visto[0] === "prometido" && visto[1] === "porta:lugar:com o prometido", visto.join(" "));
  t("o relógio novo vira efeito e linha; o teste abre a rolagem; tudo na ordem", fim.msgs[0] === "📍 o moinho" && /Começou a contar: O ritual/.test(fim.msgs[1]) && /pede um teste de Presença/.test(fim.msgs[fim.msgs.length - 1]) && visto.includes("relogios") && visto.includes("rolagem") && visto.indexOf("relogios") < visto.indexOf("rolagem"), JSON.stringify(fim.msgs));
  const v2 = [];
  const fim2 = oAceitoDoCronista({ teste_sugerido: { atributo: "Presença", perfil: "dificil" } }, [], {}, { ...ctx, rolagem: { atributo: "Força" }, aplicar: (efs) => v2.push(...efs.map((e) => e.tipo)) });
  t("com uma rolagem já aberta, o Cronista não abre outra", !v2.includes("rolagem") && !fim2.msgs.some((m) => /pede um teste/.test(m)));
  const v3 = [];
  const fim3 = oAceitoDoCronista({ grupo: { entraram: ["Ilka"] }, teste_sugerido: { atributo: "Presença" } }, [], {}, { ...ctx, pers: undefined, aplicar: (efs) => v3.push(...efs) });
  t("uma secção que estoura (sem herói) não derruba o resto nem sobe", Array.isArray(fim3.msgs) && fim3.p === undefined);
  const v4 = [];
  oAceitoDoCronista({ falou_com: ["Doran"] }, [], {}, { ...ctx, aplicar: (efs) => v4.push(...efs), conferirCom: () => { throw new Error("torto"); } });
  t("a conferência que estoura chega ao calou com o nome de sempre", v4.some((e) => e.tipo === "calou" && e.onde === "falou_com do Cronista"));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
