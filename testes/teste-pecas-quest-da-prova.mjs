/* AS PEÇAS · A QUEST DA PROVA EM NODE (17/11/2026, Fase A) — src/pecas/andar.js + a-prova.js

   «O Que Desce ao Anoitecer», do primeiro turno à encruzilhada, sem IA,
   por três jogadores-roteiro:
   §1 resolver: o sucesso escreve o facto que a quest lê; a falha segue a
      seta ou cobra o preço; toda falha queima; a carta de escolha vai
      pela porta da biblioteca; nada é mutado;
   §2 o que o Narrador recebe: a cena fechada, o que aconteceu, a pista, e
      só os nomes que pode citar;
   §3 o direto (aciona soluções);
   §4 o conversador (só aquecimento): o calor abre, o relógio enche, o
      mundo cobra — e ele NUNCA fica preso;
   §5 o azarado (falha tudo): cada falha segue a seta, a quest acaba, com
      os preços cobrados;
   §6 as regras dos três: toda etapa fecha por um facto escrito pelo
      sistema; nenhuma sem dado, salvo a carta; determinismo. */
import { resolver, escreverFato, oQueONarradorRecebe } from "../src/pecas/andar.js";
import { aPecaDaEtapa } from "../src/pecas/peca.js";
import { memoriaDe } from "../src/pecas/calor.js";
import { mundoDaProva, jogarAProva, d20DaSemente, ondeFica, ROTEIROS, FRASE_DO_DIRETO, FRASES_DO_CONVERSADOR, A_PROVA } from "../src/pecas/a-prova.js";
import { encaixar } from "../src/pecas/encaixe.js";
import { avaliarCondicao } from "../src/condicoes-da-quest.js";
import { avancarQuest } from "../src/biblioteca-de-quests.js";
import { PRECO_DA_FALHA } from "../src/quadro-da-quest.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

const W = mundoDaProva();
const { E, R, F, mundo } = W;
const ctx = (EE, RR) => ({ estado: EE, papeis: (RR || R).papeis, mundo });

sec("§1 resolver");
const ver = aPecaDaEtapa(R, "ver", E, { mundo });
const foto = J(E);
const ok = resolver(ver, "ler@curral", { total: 18, dc: 15 }, E, { registo: R, mundo });
t("o sucesso escreve o esteve no livro, na forma que a quest lê", ok.resultado.tipo === "sucesso" && avaliarCondicao(["esteve", "lugar:curral"], ctx(ok.estado)), J(ok.resultado));
t("e a etapa fecha quando a quest avança", !!avancarQuest(F, R, { estado: ok.estado, mundo }).feitas.ver);
t("o estado recebido não é mutado", J(E) === foto);
const seta = resolver(ver, "revistar@curral", { total: 2, dc: 13 }, E, { registo: R, mundo });
t("a falha com seta abre a outra solução, e a que falhou queima", seta.resultado.para === "ler@curral" && memoriaDe(seta.estado, ver).abertas["ler@curral"] === 0 && memoriaDe(seta.estado, ver).queimadas.includes("revistar@curral"));
t("e não escreve nada", !avaliarCondicao(["esteve", "lugar:curral"], ctx(seta.estado)));
const caro = resolver(ver, "ler@curral", { total: 2, dc: 15 }, E, { registo: R, mundo });
t("a falha com preço que escreve: o facto entra, e o preço cobra-se", caro.resultado.preco.id === "incompleta" && avaliarCondicao(["esteve", "lugar:curral"], ctx(caro.estado)) && caro.resultado.preco.linha === PRECO_DA_FALHA.incompleta.linha);
const rasto = aPecaDaEtapa(R, "rasto", E, { mundo });
const moedas = E.personagem.moedas;
const paga = resolver(rasto, "pagar@pastora", { total: 3, dc: 15 }, E, { registo: R, mundo });
t("pagar cobra o caminho (10) e, falhado, o preço «cobra» (15 a mais)", paga.estado.personagem.moedas === moedas - 10 - 15 && avaliarCondicao(["conversou", "papel:pastora"], ctx(paga.estado)), String(paga.estado.personagem.moedas));
const naToca = { ...E, lugar: { nome: R.papeis.toca.nome, cidade: R.papeis.toca.cidade } };
const fera = aPecaDaEtapa(R, "fera", naToca, { mundo });
const perde = resolver(fera, "lutar@fera", { venceu: false }, naToca, { registo: R, mundo });
t("perder a luta escreve o encontro e não a derrota, com o alerta", avaliarCondicao(["encontrou", "papel:fera"], ctx(perde.estado)) && !avaliarCondicao(["derrotou", "papel:fera"], ctx(perde.estado)) && perde.resultado.preco.id === "alerta");
const vence = resolver(fera, "capturar@fera", { passou: true }, naToca, { registo: R, mundo });
t("capturar escreve a queda sem sangue (poupou)", avaliarCondicao(["poupou", "papel:fera"], ctx(vence.estado)) && avaliarCondicao(["derrotou", "papel:fera"], ctx(vence.estado)));
const rr = resolver(rasto, "rastrear@toca", { passou: true }, E, { registo: R, mundo });
t("chegar pelo rasto põe o herói no covil (esteve e esta_em)", avaliarCondicao(["esta_em", "lugar:toca"], ctx(rr.estado)) && avaliarCondicao(["esteve", "lugar:toca"], ctx(rr.estado)));
t("fugir recua: não escreve, e o relógio anda", (() => { const f = resolver(fera, "fugir@fera", { passou: true }, naToca, { registo: R, mundo }); return f.resultado.tipo === "recuou" && memoriaDe(f.estado, fera).relogio === 1; })());
t("consultar soma uma consulta à ficha do registo", (() => { const c = resolver(fera, "convencer@tratador", { passou: true }, naToca, { registo: R, mundo }); return avaliarCondicao(["consultou", "papel:tratador"], ctx(c.estado)); })());
t("escreverFato com lixo não lança e não inventa", J(escreverFato({}, ["morto", "papel:x"], R).factos.pessoas) === "{}");
t("resolver com lixo: null", resolver(null, "x", {}, E) === null && resolver(ver, "nao_ha", {}, E) === null);

sec("§2 o que o Narrador recebe");
const pac = oQueONarradorRecebe(ver, caro.resultado);
t("a cena fechada, o que aconteceu e a pista", pac.cena.onde.nome === R.papeis.curral.nome && pac.aconteceu.passou === false && pac.aconteceu.preco === PRECO_DA_FALHA.incompleta.linha && pac.pista.length > 0);
t("ele pode citar a pastora e o curral; não o tratador nem a besta", pac.podeCitar.quem.includes(R.papeis.pastora.nome) && pac.podeCitar.lugares.includes(R.papeis.curral.nome)
  && !pac.podeCitar.quem.includes(R.papeis.tratador.nome) && !pac.podeCitar.quem.includes(R.papeis.fera.nome));
t("no aquecimento, só o tipo e a pista", (() => { const a = encaixar("Pergunto se a família está bem.", ver, E); const p = oQueONarradorRecebe(ver, a); return J(p.aconteceu) === J({ tipo: "aquecimento" }) && p.pista === a.pista; })());
t("na toca, a besta entra pela alcunha", oQueONarradorRecebe(fera, perde.resultado).aconteceu.alvo === F.papeis.fera.alcunha);
t("lixo: null", oQueONarradorRecebe(null, {}) === null);

const linha = (r) => `${r.roteiro}: ${r.turnos} turnos · ${r.estado} · preços ${r.precos.length} (${[...new Set(r.precos)].join(",")}) · o mundo cobrou ${r.cobrancas} · frases ${J(r.frases)}\n       ` + Object.entries(r.porEtapa).map(([k, v]) => `${k}: ${v.turnos}t ${v.dados}d ${v.comPreco}r ${v.precos}p ${v.cobrou}c ${v.impostos}i [${v.fechouCom}]`).join(" · ");
const regras = (r) => {
  sec(`  as regras, para o ${r.roteiro}`);
  t(`${r.roteiro}: a quest chega ao fim`, r.concluida && !r.presa, r.estado);
  /* a besta morta fecha a quest ali (a variante «matou» da ficha tem
     `fecha: "concluida"`): a encruzilhada só se joga com ela viva */
  t(`${r.roteiro}: as etapas fecham — as quatro, ou três com a besta morta`, ["ver", "rasto", "fera"].every((k) => r.feitas.includes(k)) && (r.feitas.includes("destino") || r.fechoDe === "fera:lamina"), J([r.feitas, r.fechoDe]));
  t(`${r.roteiro}: toda etapa fecha por um facto que o sistema escreveu (dado, oferta, imposição ou carta)`, Object.values(r.porEtapa).every((v) => ["solucao", "oferta", "imposta", "carta"].includes(v.fechouCom)), J(Object.values(r.porEtapa).map((v) => v.fechouCom)));
  t(`${r.roteiro}: nenhuma etapa fecha sem dado, salvo a carta`, Object.values(r.porEtapa).every((v) => v.carta || v.dados >= 1));
  t(`${r.roteiro}: todo dado tem preço à espera (≥ 1 por etapa com dado)`, Object.values(r.porEtapa).every((v) => v.carta || (v.comPreco >= 1 && v.comPreco === v.dados)));
  t(`${r.roteiro}: só a carta é a carta (destino)`, Object.entries(r.porEtapa).every(([k, v]) => v.carta === (k === "destino")));
};

sec("§3 o direto");
const direto = jogarAProva("direto");
console.log("     " + linha(direto));
regras(direto);
t("o direto aciona soluções, não aquece", direto.frases.solucao >= 3 && direto.frases.aquecimento === 0);
t("e anda depressa (≤ 10 turnos)", direto.turnos <= 10, String(direto.turnos));

sec("§4 o conversador");
const conv = jogarAProva("conversador");
console.log("     " + linha(conv));
regras(conv);
t("ele nunca aciona uma solução pela frase (só aquecimento)", conv.frases.solucao === 0 && conv.frases.livre === 0 && conv.frases.aquecimento > 0, J(conv.frases));
t("o calor abriu soluções (o Mestre ofereceu o dado)", conv.log.some((l) => l.includes("· abriu ")));
t("o relógio encheu e o mundo cobrou, em cada etapa com dado", ["ver", "rasto", "fera"].every((k) => conv.porEtapa[k].cobrou >= 1));
t("e impôs a forçada — é isso que o solta", ["ver", "rasto", "fera"].every((k) => conv.porEtapa[k].impostos >= 1 && conv.porEtapa[k].fechouCom === "imposta"));
t("nunca preso: bem abaixo do teto de turnos", conv.turnos < A_PROVA.tetoDeTurnos / 2, String(conv.turnos));

sec("§5 o azarado");
const az = jogarAProva("azarado");
console.log("     " + linha(az));
regras(az);
const rolagens = az.log.filter((l) => / · (passou|falhou) · /.test(l));
t("ele falha todo dado", rolagens.length > 0 && rolagens.every((l) => l.includes(" · falhou · ")));
t("cada falha segue a seta: a seguinte é a solução para onde ela aponta, ou o preço escreve", (() => {
  const P = { ver: aPecaDaEtapa(W.R, "ver", W.E, { mundo }) };
  const rev = az.log.findIndex((l) => l.includes("revistar@curral · falhou"));
  return rev >= 0 && az.log[rev + 1].includes("ler@curral") && P.ver.solucoes.find((s) => s.id === "revistar@curral").falha.para === "ler@curral";
})());
t("toda etapa com dado cobrou pelo menos um preço", ["ver", "rasto", "fera"].every((k) => az.porEtapa[k].precos >= 1));
t("a besta: perdeu a luta, e fechou pelo assobio (o tratador, a preço)", az.log.some((l) => l.includes("lutar@fera · falhou · falha · alerta")) && az.log.some((l) => l.includes("@tratador · falhou · falha · cobra")));

sec("§6 determinismo e o resto");
t("a mesma prova dá o mesmo relatório", J(jogarAProva("direto")) === J(direto) && J(jogarAProva("azarado")) === J(az));
t("o d20 da semente é de 1 a 20, e o mesmo para a mesma rolagem", Array.from({ length: 200 }, (_, i) => d20DaSemente("x", i)).every((n) => n >= 1 && n <= 20) && d20DaSemente("x", 7) === d20DaSemente("x", 7));
t("os três roteiros existem, e só o conversador recusa a oferta", Object.keys(ROTEIROS).length === 3 && Object.values(ROTEIROS).filter((r) => !r.aceitaOferta).map((r) => r.id).join() === "conversador");
t("o direto tem frase para toda ação que os moldes da prova usam", aPecaDaEtapa(R, "fera", naToca, { mundo }).solucoes.filter((s) => s.fecha).every((s) => !!FRASE_DO_DIRETO[s.acao]));
t("as frases do conversador são todas aquecimento no curral", FRASES_DO_CONVERSADOR.every((f) => encaixar(f.replace("{quem}", R.papeis.pastora.nome), ver, E).tipo === "aquecimento"));
t("ondeFica: a pessoa no sítio dela, o lugar nele mesmo", ondeFica(rasto.solucoes.find((s) => s.id === "convencer@pastora"), F, R, "rasto").nome === R.papeis.pastora.local
  && ondeFica(rasto.solucoes.find((s) => s.id === "revistar@curral"), F, R, "rasto").nome === R.papeis.curral.nome);
t("roteiro que não existe: null", jogarAProva("nao_ha") === null);

console.log(`\n${bons} ok, ${maus} falha(s)`);
process.exit(maus ? 1 : 0);
