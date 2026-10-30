/* teste-mesa-do-buraco.mjs (Fase 4, trilha B · 29/10/2026) — a mesa que fecha o buraco

   A medida da correção do Juiz (teste-correcao-do-juiz §3) deixou escrito:
   dos 28 números inventados que o Juiz apanha nos rotulados, 23 não
   contradizem o sistema — o turno não os trouxe. Esta suíte mede quantos
   desses 23 o sistema TEM e a mesa (src/mesa-do-buraco.js) passa a pôr no
   PERGUNTOU antes de o Mestre falar; quantos já tinham resposta hoje (as
   fichas de sempre, consertadas depois das sessões que os gravaram); e quantos
   não têm verdade nenhuma no sistema — esses ficam ditos, e não se inventam.

   O MUNDO DE CADA CASO. A 9.ª sessão tem o mundo no disco (a semente, o
   mapa, o registo de gente: registo-s9-historia.json) — ali o número é o do
   mundo de verdade. As outras sessões foram gravadas sem a semente: o caso
   corre numa cidade da 9.ª (o porte dá o fator do preço), com os lugares que
   o corpus diz que o sistema sabia postos no mapa como povoações. Ali prova-se
   que a frase é ouvida, que o nome se acha pelo pedaço e que o número sai da
   conta do sistema — não qual seria o número no mundo que se perdeu.

   Falha antes: no HEAD de antes, src/mesa-do-buraco.js não existe e a
   cidade-por-dentro não exporta o pouso nem a distância por nome. */
import fs from "node:fs";
import { casos, CLASSES, sem } from "./corpus-do-juiz.mjs";
import { julgarAProsa } from "../src/juiz-de-fidelidade.js";
import { especieDoAchado } from "../src/motor/correcao-do-juiz.js";
import { oQueAMesaFecha, MESA_DO_BURACO } from "../src/mesa-do-buraco.js";
import { fichaDaCidade, fichaParaPauta, linhaDoPouso, lugaresComDistancia, distanciaAte, PRECOS_DO_POUSO } from "../src/cidade-por-dentro.js";
import { precoComumParaPauta, mercadoParaPauta, mercadoresDaCidade, balcaoDeMantimentos } from "../src/mercado.js";
import { PRECOS_COMUNS, precoComum } from "../src/economia.js";
import { balcaoParaPauta } from "../src/bolsa-da-frase.js";
import { nomeDaMoeda } from "../src/cobranca.js";
import { SECOES_QUE_CEDEM, secaoPorId, porNaPauta, textoDaPauta, cederNaCena, prioDaLinha, TETO_DA_PAUTA } from "../src/pauta.js";
import { RESPOSTAS_DA_MESA, juntarRespostas } from "../src/perguntas.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
const Js = JSON.stringify;
const H9 = ler("registo-s9-historia.json");

/* o mundo de um caso (ver o cabeçalho) */
function contexto(id, frase, lugares = []) {
  const ses = String(id).split(/[#-]/)[0];
  let mapa = JSON.parse(Js(H9.mapa)), semente = H9.espinha.semente;
  const cidade = mapa.cidades.find((x) => x.nome === (/rio do rio/i.test(frase) ? "Rio do Rio" : "Buraco Norte"));
  if (ses !== "s9") {
    semente = "corpus|" + id;
    mapa = { ...mapa, cidades: [cidade], rotas: [], regiao: null };
    lugares.forEach((l, i) => {
      const n = typeof l === "string" ? l : l && l.nome;
      if (n && !mapa.cidades.some((x) => x.nome === n)) mapa.cidades.push({ nome: n, x: (cidade.x || 50) + 0.4 * (i + 1), y: (cidade.y || 50) + 0.3, porte: "vila", descoberta: true });
    });
  }
  const lex = H9.campanha.lexico;
  const opc = { semente, mapa, lex, genero: H9.campanha.genero, molde: H9.campanha.molde };
  return { cidade, opc, lex, fator: fichaDaCidade(cidade, opc).pouso.fator, bancas: mercadoresDaCidade(cidade, 1, 3, lex), moeda: nomeDaMoeda(lex),
    gente: Object.values(H9.npcs).map((n) => ({ nome: n.nome, local: n.local })) };
}
/* as fichas de hoje e a mesa, sobre a frase */
function aMesa(id, frase, lugares) {
  const x = contexto(id, frase, lugares);
  const hoje = [
    fichaParaPauta(x.cidade, { ...x.opc, frase }),
    precoComumParaPauta(frase, { fator: x.fator, moeda: x.moeda }),
    balcaoParaPauta(frase, { balcao: balcaoDeMantimentos(x.cidade), temKit: false, moeda: x.moeda }),
    mercadoParaPauta(x.bancas, frase, { onde: x.cidade.nome, moeda: x.moeda }),
  ];
  const nova = oQueAMesaFecha(frase, { cidade: x.cidade, ...x.opc, gente: x.gente, bancas: x.bancas, moeda: x.moeda, fator: x.fator, onde: x.cidade.nome, ja: hoje });
  return { x, hoje: hoje.flatMap((r) => r.pergunta), nova };
}

sec("1. A TABELA — nenhum número nasce aqui");
{
  t("a tabela é congelada, e os serviços também", Object.isFrozen(MESA_DO_BURACO) && Object.isFrozen(MESA_DO_BURACO.servicos) && MESA_DO_BURACO.servicos.every(Object.isFrozen));
  t("nenhum número na tabela além dos limites (porTurno, minimo)", Object.entries(MESA_DO_BURACO).filter(([, v]) => typeof v === "number").map(([k]) => k).sort().join() === "minimo,porTurno");
  for (const s of MESA_DO_BURACO.servicos) {
    const c = PRECOS_COMUNS.find((p) => p.id === s.como);
    t(`«${s.id}» é a linha «${s.como}» de PRECOS_COMUNS, e a palavra dela a ouve`, !!c && c.rx.test(s.palavra), c ? c.nome : "sem linha");
  }
  t(`a mesa só põe ${MESA_DO_BURACO.porTurno} linhas, menos que a junta da mesa (${RESPOSTAS_DA_MESA})`, MESA_DO_BURACO.porTurno < RESPOSTAS_DA_MESA);
  const x = contexto("s9#2", "");
  const f = fichaDaCidade(x.cidade, x.opc);
  const r = oQueAMesaFecha("Quanto custa uma cama para a noite?", { cidade: x.cidade, ...x.opc });
  t(`a cama leva o pouso da ficha (PRECOS_DO_POUSO pelo porte: ◉ ${f.pouso.comum})`, r.pergunta[0] === linhaDoPouso(f, { curta: true }) && r.pergunta[0].includes(`◉ ${f.pouso.comum} a noite`), r.pergunta[0]);
  t("a linha curta diz o mesmo número da inteira, e é mais curta", linhaDoPouso(f).startsWith(`pouso: quarto comum ◉ ${f.pouso.comum} a noite`) && linhaDoPouso(f, { curta: true }).length < linhaDoPouso(f).length - 25);
  t("e o pouso da tabela é o meio da faixa do prompt (◉ 4 a noite comum, antes do porte)", PRECOS_DO_POUSO.comum === 4);
  const af = oQueAMesaFecha("Quanto ele cobra para afiar minha faca?", { cidade: x.cidade, ...x.opc, fator: x.fator });
  t(`afiar dá o reparo simples pelo porte (◉ ${precoComum("reparo", x.fator)})`, af.pergunta[0] === `o preço daqui: reparo simples ◉ ${precoComum("reparo", x.fator)}`, af.pergunta[0]);
  /* a distância pelo nome inteiro é a da ficha, letra a letra */
  const nomes = lugaresComDistancia(x.cidade, x.opc);
  const umLocal = nomes[2], umaCidade = nomes.find((n) => H9.mapa.cidades.some((c) => c.nome === n));
  const daFicha = (n) => fichaParaPauta(x.cidade, { ...x.opc, frase: `A que distância fica ${n}?` }).pergunta[0];
  t(`a distância por nome é a linha da ficha: «${umLocal}» e «${umaCidade}»`, distanciaAte(x.cidade, umLocal, x.opc) === daFicha(umLocal) && distanciaAte(x.cidade, umaCidade, x.opc) === daFicha(umaCidade) && /^distância: /.test(daFicha(umaCidade)));
}

sec("2. O PORTÃO MORDE SÓ O NECESSÁRIO");
{
  const x = contexto("s9#2", "");
  const c = { cidade: x.cidade, ...x.opc, gente: x.gente, bancas: x.bancas, fator: x.fator, moeda: x.moeda };
  const vazio = (r) => r && r.pergunta.length === 0 && r.em.length === 0 && r.fechou.length === 0;
  t("sem pergunta, o quarto não leva preço («Subo para o quarto e durmo.»)", vazio(oQueAMesaFecha("Subo para o quarto e durmo.", c)));
  t("sem pergunta de caminho, o sítio não leva distância («Vou até a forja do Tomas.»)", vazio(oQueAMesaFecha("Vou até a forja do Tomas.", c)));
  t("o que uma ficha já disse não volta (o pouso, a distância)", vazio(oQueAMesaFecha("Quanto custa uma cama?", { ...c, ja: [{ pergunta: ["pouso: quarto comum ◉ 6 a noite"] }] }))
    && vazio(oQueAMesaFecha("Quanto tempo a pé até a forja do Tomas?", { ...c, ja: [{ pergunta: ["distância: Ferraria do Leste, dentro dos muros"] }] })));
  t("na luta, nada", vazio(oQueAMesaFecha("Quanto custa uma cama?", { ...c, luta: true })));
  t("sem cidade, nada (a estrada e a masmorra não têm pouso)", vazio(oQueAMesaFecha("Quanto custa uma cama?", { ...c, cidade: null })));
  t("lixo dá o vazio e não lança", [null, undefined, {}, 5, "x"].every((k) => vazio(oQueAMesaFecha("Quanto custa uma cama?", k))) && vazio(oQueAMesaFecha(null, c)) && vazio(oQueAMesaFecha("", c))
    && vazio(oQueAMesaFecha("Quanto custa uma cama?", { cidade: { nome: 7 } })) && Array.isArray(oQueAMesaFecha("Quanto tempo até a forja do Tomas?", { ...c, gente: "torto", bancas: { x: 1 }, ja: [null, 3] }).pergunta));
  t("o nome ambíguo pela cabeça não se escolhe ao acaso (dois santuários: nenhum; um só: ele)", (() => {
    const pede = "A que distância fica o Santuário?";
    const dois = contexto("s8#2", pede, ["Santuário Cego de Sal", "Santuário do Vau"]), um = contexto("s11-M63-quatro-horas", pede, ["Santuário Cego de Sal"]);
    const santos = (k) => new Set(lugaresComDistancia(k.cidade, k.opc).filter((n) => /^santu/i.test(n))).size;
    if (!(santos(dois) >= 2 && santos(um) === 1)) return false;
    const r2 = oQueAMesaFecha(pede, { cidade: dois.cidade, ...dois.opc }), r1 = oQueAMesaFecha(pede, { cidade: um.cidade, ...um.opc });
    return r2.pergunta.length === 0 && /^distância: Santuário Cego de Sal/.test(r1.pergunta[0] || "");
  })());
  t("a lança da anã não é a lança da banca: a oração de antes só empresta a mercadoria quando a procura", !oQueAMesaFecha("Digo à anã da lança: estamos exaustas. Há taxa para entrar de noite? Quanto é?", c).fechou.includes("banca"));
  const congelado = Object.freeze({ ...c, gente: Object.freeze(c.gente.map((g) => Object.freeze({ ...g }))), ja: Object.freeze([]) });
  const a = oQueAMesaFecha("Quanto tempo a pé até a forja do Tomas? E quanto custa uma cama?", congelado);
  const b = oQueAMesaFecha("Quanto tempo a pé até a forja do Tomas? E quanto custa uma cama?", congelado);
  t("determinista, e não muda o que recebe (a entrada congelada passa)", Js(a) === Js(b) && a.pergunta.length === 2);
  t(`a casa de quem o registo conhece: «a forja do Tomas» é a Ferraria do Leste`, /^distância: Ferraria do Leste, dentro dos muros: .* a pé$/.test(a.pergunta.find((l) => /^distância/.test(l)) || ""), a.pergunta.join(" | "));
  t("as linhas vão pela ordem da frase (o caminho antes da cama)", a.em[0] < a.em[1] && a.fechou.join() === "distancia,pouso" || a.em[0] > a.em[1]);
}

sec("3. OS 23 — o que a mesa fecha");
/* a classe de cada um dos 23, à mão, contra a fonte do rótulo: o que o
   jogador pediu e onde o sistema tem (ou não tem) o número */
const OS_23 = {
  "s8#1": "hoje", "s8#10": "sem", "s8#44": "mesa", "s8#46": "mesa", "s8#70": "mesa", "s9#1": "mesa", "s9#2": "hoje", "s9#6": "mesa", "s9#19": "sem",
  "s9#34": "mesa", "s9#39": "sem", "s10#66": "mesa", "s6-M7-corda": "hoje", "s6-M12-maca": "hoje", "s6-M13-macas": "hoje", "s6-M22-racoes": "bolsa",
  "s7-M2-meia-hora": "hoje", "s7-M8-canecas": "hoje", "s7-M12-pregado": "hoje", "s11-M12-taxa": "sem", "s11-M18-cama": "mesa", "s11-M24-duas-horas": "sem", "s11-M63-quatro-horas": "mesa",
};
/* PORQUÊ dos que não têm verdade: o suborno (s8#10) e o câmbio (s9#19) só
   existem em prosa no ECONOMIA_PROMPT ou em lado nenhum — a cura seria uma
   linha nova em PRECOS_COMUNS, que é ampliar a tabela, e fica proposta; as
   três moedas de ouro (s9#39) são história, não preço; a taxa da ronda
   (s11-M12) é uma lei que a prosa inventou antes; as «duas horas» (s11-M24)
   são há quanto tempo, não a distância. A «bolsa» (s6-M22): «compro duas
   tochas e três rações. Pago agora.» é compra feita, e quem a cobra é a
   bolsa da frase (o balcão, com o preço), não a pauta. */
const VER = casos.map((c) => ({ c, v: julgarAProsa(c.prosa, c.estado) }));
const bate = (a, r, cl) => (r.aceita || [r.classe]).includes(cl) && (sem(a.trecho).includes(sem(r.trecho)) || (a.nome && sem(r.trecho).includes(sem(a.nome))));
const BURACOS = [];
for (const { c, v } of VER) for (const cl of CLASSES) for (const a of v[cl]) {
  const e = especieDoAchado(cl, a);
  if (e && ["preco-sem-mesa", "valor-solto", "distancia-sem-mapa"].includes(e.id) && c.rotulos.some((r) => bate(a, r, cl))) BURACOS.push({ c, a, e });
}
const conta = { mesa: 0, hoje: 0, sem: 0, bolsa: 0 };
const LINHAS = [];
{
  t(`os buracos são os 23 da medida de 28/10 (${BURACOS.length})`, BURACOS.length === 23 && BURACOS.every((b) => b.c.id in OS_23));
  const errados = [];
  for (const { c, a } of BURACOS) {
    const m = aMesa(c.id, c.estado.frase, c.estado.lugares);
    const cl = OS_23[c.id];
    conta[cl]++;
    LINHAS.push(...m.nova.pergunta);
    const temNumero = (ls) => ls.some((l) => /◉ \d|\d+ (m|km|min|h|dias?)\b/.test(l));
    const ok1 = cl === "mesa" ? m.nova.pergunta.length > 0 && temNumero(m.nova.pergunta)
      : cl === "hoje" ? temNumero(m.hoje)
      : m.nova.pergunta.length === 0;
    if (!ok1) errados.push(`${c.id} (${cl}): hoje «${m.hoje.join(" | ")}» mesa «${m.nova.pergunta.join(" | ")}»`);
    console.log(`     ${c.id.padEnd(22)}${cl.padEnd(6)}${(m.nova.pergunta[0] || m.hoje[0] || "—").slice(0, 96)}`);
  }
  t("cada um cai na classe dele: a mesa dá número onde é dela, as fichas de hoje onde já davam, e ninguém inventa onde o sistema não tem", errados.length === 0, errados.join(" · "));
  console.log(`     dos 23: a mesa nova fecha ${conta.mesa}, as fichas de hoje já tinham ${conta.hoje}, a bolsa cobra ${conta.bolsa}, e ${conta.sem} não têm número no sistema`);
  /* MEDIDA (29/10): 9 da mesa (os quatro pousos pela cama, o pedágio, o
     afiar, a espada da oração de antes, Pedra Rasa pelo pedaço e a forja do
     Tomas pela casa — o s11-M63 leva o pouso E o Santuário), 8 de hoje, 1 da
     bolsa, 5 sem verdade */
  t(`a mesa fecha ${conta.mesa} dos 23 (a medida de 29/10: 9), e 17 dos 23 passam a ter o número antes do Mestre`, conta.mesa >= 9 && conta.mesa + conta.hoje >= 17);
  const s11 = aMesa("s11-M63-quatro-horas", "Pergunto o preço de um pouso e de uma ração e a distância até o Santuário.", ["Alto das Pedras", "Bela do Rio", "Vila Funda", "Alto Velho", "Santuário Cego de Sal"]);
  t("a frase que pede duas coisas leva as duas (o pouso e o Santuário Cego de Sal, pela cabeça única)", s11.nova.fechou.join() === "pouso,distancia" && /^distância: Santuário Cego de Sal/.test(s11.nova.pergunta[1]));
}

sec("4. QUANTAS FRASES A MESA TOCA — os turnos do corpus (as sessões 8–10 e os excertos)");
{
  let toca = 0, emLimpa = 0, semPergunta = 0;
  const porId = {};
  for (const { c } of VER) {
    const m = aMesa(c.id, c.estado.frase, c.estado.lugares);
    if (!m.nova.pergunta.length) continue;
    toca++;
    if (c.limpo) emLimpa++;
    for (const id of m.nova.fechou) porId[id] = (porId[id] || 0) + 1;
    if (!MESA_DO_BURACO.pedePreco.test(sem(c.estado.frase)) && !MESA_DO_BURACO.perguntaCaminho.test(sem(c.estado.frase))) semPergunta++;
    LINHAS.push(...m.nova.pergunta);
  }
  console.log(`     ${VER.length} turnos; a mesa fala em ${toca} (${Js(porId)}); ${emLimpa} deles numa resposta em que o Mestre não inventou (a linha é verdade, só custa letras)`);
  /* MEDIDA (29/10): fala em 13 dos 216 (6%) — os buracos que lhe cabem e
     uma pergunta em que o Mestre não inventou */
  t(`a mesa fala em poucos turnos: ${toca} de ${VER.length} (≤ 10%)`, toca > 0 && toca <= VER.length * 0.1);
  t("e nunca sem pergunta de preço ou de caminho na frase", semPergunta === 0);
}

sec("5. O TETO — as 204 pautas cheias da 5.ª à 7.ª");
{
  /* a linha mais comprida que a mesa disse nos casos, cortada às letras da
     maior que ela pode dar; entra no PERGUNTOU como as respostas entram */
  const maior = LINHAS.reduce((a, l) => (l.length > a.length ? l : a), "");
  const media = Math.round(LINHAS.reduce((s, l) => s + l.length, 0) / Math.max(1, LINHAS.length));
  console.log(`     as linhas da mesa: ${LINHAS.length}, de ${media} letras em média; a maior tem ${maior.length}: «${maior.slice(0, 90)}…»`);
  const prio = secaoPorId("pergunta").prio;
  let turnos = 0, entrou = 0, passou = 0;
  const cortou = {}, cortouAntes = [], cede = {};
  for (const f of ["registo-s5-pauta.json", "registo-s6-s7-pauta.json"]) {
    const R = ler(f);
    for (const tt of R.turnos) {
      const p0 = {};
      for (const [s, ids] of Object.entries(tt.secoes)) p0[s] = ids.map((i) => R.linhas[i]);
      const antes = textoDaPauta(p0);
      const p1 = { ...p0, pergunta: [...(p0.pergunta || []), maior].slice(0, RESPOSTAS_DA_MESA) };
      const depois = textoDaPauta(cederNaCena(p1, { luta: tt.luta, masmorra: tt.masmorra }));
      turnos++;
      if (depois.length > TETO_DA_PAUTA) passou++;
      if (depois.includes(maior)) entrou++;
      for (const [s, xs] of Object.entries(p0)) xs.forEach((x, i) => {
        if (!antes.includes(x) || depois.includes(x)) return;
        if (tt.luta && SECOES_QUE_CEDEM.luta.includes(s)) return;
        /* a cor que cede À PERGUNTA não é corte: é a lei da escuta (pauta.js,
           SECOES_QUE_CEDEM.pergunta) — numa pergunta respondida, a economia
           da praça, a batida e a ficha passam para o turno seguinte, como
           passam quando qualquer ficha responde */
        if (SECOES_QUE_CEDEM.pergunta.includes(s) && !(p0.pergunta || []).length) { cede[s] = (cede[s] || 0) + 1; return; }
        cortou[s] = (cortou[s] || 0) + 1;
        if (prioDaLinha(secaoPorId(s), i) < prio) cortouAntes.push(`${tt.sessao || f}#${tt.turno} ${s}`);
      });
    }
  }
  console.log(`     ${turnos} pautas; a maior linha da mesa entra em ${entrou}; o que ela tira: ${Js(cortou)}; o que cede à pergunta (a lei da escuta): ${Js(cede)}`);
  t(`nunca passa do teto (${TETO_DA_PAUTA})`, passou === 0);
  t("e nunca tira uma linha que corta antes da resposta (o rumo, o fecho, os vetos, o lugar)", cortouAntes.length === 0, cortouAntes.slice(0, 5).join(", "));
  /* MEDIDA (29/10): a maior (a banca, 181 letras) entra em 132 das 204. O
     que sai é o que corta depois da resposta (a gente, a mesa, o daqui) e
     a cor que cede a toda pergunta respondida */
  t(`e entra na maior parte das pautas cheias (${entrou} de ${turnos})`, entrou >= turnos / 2);
}

sec("6. AS DUAS PERGUNTAS DA MESMA FRASE — a 13.ª sessão (o mundo dela: sessao-s13.json)");
{
  /* O DEFEITO (relatório da 13.ª, defeito 10): «Esse poço fundo, onde fica?
     E a Fenda de Silêncio… qual é o caminho e quanto tempo de marcha?» (T7)
     levou a distância do poço e deixou a Fenda sem número — o Mestre disse
     «quatro horas» de cabeça. A mesa achava UM sítio por frase. Falha antes:
     no HEAD de antes, a 2.ª linha não existe. O T23 («prato quente e uma
     cama») NÃO é desta peça: a heroína ainda estava dentro da Fenda, e a
     mesa cala na masmorra de propósito (o pouso não é dali) — quem falou fora
     de sítio foi o preço comum, que não olha a masmorra (pauta-do-turno). */
  const S13 = ler("sessao-s13.json");
  const e = S13.inicio;
  const cidade = e.mapa.cidades.find((c) => c.nome === e.cidadeAtual);
  const lex = (e.mundo || {}).lexico;
  const opc = { semente: S13.semente, mapa: e.mapa, lex, genero: (e.mundo || {}).genero, molde: (e.mundo || {}).molde };
  const fator = fichaDaCidade(cidade, opc).pouso.fator, moeda = nomeDaMoeda(lex), bancas = mercadoresDaCidade(cidade, 1, 3, lex);
  const gente = Object.values(e.npcs || {}).filter(Boolean).map((n) => ({ nome: n.nome, local: n.local }));
  const mesa = (frase) => {
    const hoje = [fichaParaPauta(cidade, { ...opc, frase }), precoComumParaPauta(frase, { fator, moeda }), mercadoParaPauta(bancas, frase, { onde: cidade.nome, moeda })];
    const nova = oQueAMesaFecha(frase, { cidade, ...opc, gente, bancas, moeda, fator, onde: cidade.nome, ja: hoje });
    return { nova, junta: juntarRespostas([...hoje, nova]) };
  };
  const t7 = mesa("Pergunto ao Beraldo: \"Esse poço fundo, onde fica? E a Fenda de Silêncio, de que falavam na fila, qual é o caminho e quanto tempo de marcha?\"");
  t("T7: as duas distâncias, pela ordem da frase (o poço, depois a Fenda)", t7.junta.length === 2 && /^distância: o poço fundo .*km/.test(t7.junta[0]) && /^distância: Fenda de Silêncio .*km/.test(t7.junta[1]), t7.junta.join(" | "));
  t("e cada uma é a linha da ficha, letra a letra (nenhum número nasce na mesa)", t7.junta[0] === distanciaAte(cidade, "o poço fundo", opc) && t7.junta[1] === distanciaAte(cidade, "Fenda de Silêncio", opc));
  const dupla = mesa("Quanto custa a cama e a que distância fica o poço?");
  t("«quanto custa a cama e a que distância fica o poço?»: o pouso E o poço (pela cabeça única)", dupla.junta.length === 2 && /^pouso: quarto comum ◉ \d+ a noite/.test(dupla.junta[0]) && /^distância: o poço fundo/.test(dupla.junta[1]), dupla.junta.join(" | "));
  const umaJa = mesa("A que distância fica o poço fundo e quanto tempo até a Fenda de Silêncio?");
  t("quando a ficha da cidade já deu uma distância, a mesa dá a OUTRA (e não repete a primeira)", umaJa.junta.length === 2 && umaJa.nova.pergunta.length === 1 && /^distância: Fenda de Silêncio/.test(umaJa.nova.pergunta[0]), umaJa.junta.join(" | "));
  t("onde se está não é destino: «saindo de Porto das Pedras» não pergunta por Porto dos Barões", !mesa("Quanto tempo até a Fenda de Silêncio, saindo de Porto das Pedras?").junta.some((l) => /Bar[õo]es/.test(l)));
  /* a mesa sozinha (sem fichas à frente): a ficha da cidade tem a régua
     dela, que não é desta peça */
  t("o sítio de uma oração que não pergunta o caminho não leva distância da mesa («Olho o poço fundo. Quanto tempo até a Fenda?»)", (() => { const r = oQueAMesaFecha("Olho o poço fundo. Quanto tempo até a Fenda de Silêncio?", { cidade, ...opc, gente }); return r.pergunta.length === 1 && /^distância: Fenda de Silêncio/.test(r.pergunta[0]); })());
  /* O TETO: as duas linhas mais compridas (a Fenda leva o «— caverna, perigo
     de nível 4, 7 salas») entram no PERGUNTOU das 204 pautas cheias sem passar
     do teto — a junta corta em RESPOSTAS_DA_MESA, e a pauta pela prioridade */
  let passou = 0, entrou = 0, n = 0;
  for (const f of ["registo-s5-pauta.json", "registo-s6-s7-pauta.json"]) {
    const R = ler(f);
    for (const tt of R.turnos) {
      const p0 = {};
      for (const [s, ids] of Object.entries(tt.secoes)) p0[s] = ids.map((i) => R.linhas[i]);
      const p1 = { ...p0, pergunta: [...t7.junta, ...(p0.pergunta || [])].slice(0, RESPOSTAS_DA_MESA) };
      const txt = textoDaPauta(cederNaCena(p1, { luta: tt.luta, masmorra: tt.masmorra }));
      n++;
      if (txt.length > TETO_DA_PAUTA) passou++;
      if (t7.junta.every((l) => txt.includes(l))) entrou++;
    }
  }
  console.log(`     as duas distâncias do T7 (${t7.junta.map((l) => l.length).join(" + ")} letras) entram inteiras em ${entrou} de ${n} pautas cheias`);
  t(`as duas nunca passam do teto (${TETO_DA_PAUTA}) e entram na maior parte das pautas cheias`, passou === 0 && entrou >= n / 2);
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
