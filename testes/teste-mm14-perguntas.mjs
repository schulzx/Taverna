/* teste-mm14-perguntas.mjs (Fase MM · MM14, o defeito nº 6 e o nº 7) —
   as perguntas ao Mestre

   A régua nova: não chega que a informação esteja na pauta — tem de estar
   lá A QUE RESPONDE À PERGUNTA, e não pode estar uma resposta errada (o
   sino das horas, a casa de outra cidade). A sessão de prova (MM11,
   `mente/mm11-sessao.md`) fez doze perguntas com resposta no mundo (a 3
   duas vezes); cinco saíram do sistema. Esta suíte refaz as doze contra o
   caminho novo, sem chamadas, pelo que o jogo enviaria ao Narrador.

   O MUNDO DA SESSÃO, reconstruído. A semente é a da campanha ("Prova da
   Mesa|Fantasia medieval"); o mapa é o que a transcrição diz (Foz do Meio
   na costa; Alto do Sal a ~146 km; Campo Grande; Vila Maria). O léxico da
   IA não ficou guardado, e é dele que vinham os nomes: aqui um léxico
   mínimo dá às casas de Foz os nomes da sessão (O Sino Calado, O Cais do
   Sal, Campo das Cinco Torres), e a GENTE é a que a semente dá sem ele —
   a taverneira do Sino Calado é Mabel (na sessão, Rosalina), o músico de
   canto é Jarl Barba-Ruiva (Teodoro), a ferreira é Fenna da Urze
   (Carmela). As frases são as da transcrição com esses nomes trocados. A
   masmorra ao lado de Foz sai da semente sozinha, e é a da sessão: o Poço
   de Sal, mina de nível 4 com 9 salas.

   Secções: 1. as tabelas · 2. só pergunta? (e onde se gasta) · 3. os
   defeitos do caminho, um a um · 4. as doze, antes → depois · 5. o teto ·
   6. lixo, null e imutabilidade · 7. a fiação no App.jsx (prova por texto,
   corpo por âncora — como teste-mm12-cidade.mjs e teste-mm8a-ficha.mjs
   provam fichaParaPauta/genteParaPauta). Tudo por semente. */
import fs from "node:fs";
import {
  GESTOS_DE_PERGUNTAR, MARCAS_DE_PERGUNTA, INTERROGATIVAS, RESPOSTAS_DA_MESA,
  soPergunta, fraseDoJogador, semNomesProprios, falaSoPergunta, juntarRespostas,
} from "../src/perguntas.js";
import { fichaParaPauta, PERGUNTAS_DA_CIDADE, RESPOSTAS_POR_TURNO } from "../src/cidade-por-dentro.js";
import { genteParaPauta, RESPOSTAS_DA_GENTE, FAMILIA_DAQUI } from "../src/gente-por-dentro.js";
import { mercadoresDaCidade, mercadoParaPauta, PERGUNTA_DE_PRECO, MERCADORIAS, ITENS_POR_RESPOSTA } from "../src/mercado.js";
import { andarOSino, sinosForaDeHora, garantirAbertura, SINOS_FORA_DE_HORA, SINO } from "../src/abertura.js";
import { locaisDaCidade, genteDoLocal, masmorrasDoMundo } from "../src/mundo-base.js";
import { elencoDoMundo } from "../src/elenco.js";
import { lerAcao } from "../src/desafios.js";
import { envelopeDoComercio } from "../src/comercio.js";
import { paraPauta as geografoParaPauta } from "../src/geografo.js";
import { porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { resumoNPCsParaPrompt } from "../src/npcs.js";
import { montarGrade, resumoGridPrompt, ROTULOS_DO_TABULEIRO } from "../src/grid.js";
import { envelopeSocial } from "../src/social.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };

/* ============================================================
   O mundo da sessão
   ============================================================ */
const SEM = "Prova da Mesa|Fantasia medieval";
const G = "Fantasia medieval";
const REGIOES = [
  { nome: "Margens", bioma: "costa", cx: 86, cy: 57 },
  { nome: "Salinas", bioma: "costa", cx: 80, cy: 54 },
  { nome: "Campos", bioma: "planicie", cx: 60, cy: 42 },
];
const CIDADES = [
  { nome: "Foz do Meio", porte: "cidade", bioma: "costa", regiao: "Margens", x: 87, y: 57, descoberta: true },
  { nome: "Alto do Sal", porte: "cidade", bioma: "costa", regiao: "Salinas", x: 82, y: 54 },
  { nome: "Campo Grande", porte: "cidade", bioma: "planicie", regiao: "Campos", x: 60, y: 40 },
  { nome: "Vila Maria", porte: "vila", bioma: "planicie", regiao: "Campos", x: 66, y: 46 },
];
const MAPA = { regioes: REGIOES, cidades: CIDADES, rotas: [{ de: "Foz do Meio", para: "Alto do Sal", dias: 5 }] };
const FOZ = CIDADES[0];
/* o léxico mínimo: os nomes das casas da sessão, na ordem que a semente dá
   a Foz (dois nomes por tipo, que é o que o léxico pede; a ordem escolhe-se
   aqui, uma vez, e a suíte confere o resultado logo abaixo) */
const PARES = { taverna: ["O Sino Calado", "A Porta Aberta"], docas: ["O Cais do Sal", "O Cais Velho"], mercado: ["Campo das Cinco Torres", "A Praça do Sal"] };
const lugaresLex = Object.entries(PARES).map(([tipo, nomes]) => ({ tipo, nomes }));
for (let i = 0; i < lugaresLex.length; i++) {
  const l = lugaresLex[i];
  const deu = locaisDaCidade(SEM, FOZ, G, null, { lugares: lugaresLex }).find((x) => x.tipo === l.tipo);
  if (deu && deu.nome !== PARES[l.tipo][0]) lugaresLex[i] = { tipo: l.tipo, nomes: [...l.nomes].reverse() };
}
const LEX = { lugares: lugaresLex };
const LOCAIS = locaisDaCidade(SEM, FOZ, G, null, LEX);
const SINO_CALADO = LOCAIS.find((l) => l.tipo === "taverna");
const DA_TAVERNA = genteDoLocal(SEM, SINO_CALADO, G, null, LEX);
const semAc = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const TAVERNEIRA = DA_TAVERNA.find((p) => /taverneir/.test(semAc(p.papel)));
const MUSICO = DA_TAVERNA.find((p) => /music/.test(semAc(p.papel)));
const FORJA = LOCAIS.find((l) => l.tipo === "forja");
const FERREIRA = FORJA ? genteDoLocal(SEM, FORJA, G, null, LEX).find((p) => /ferreir/.test(semAc(p.papel))) : null;
const POCO = masmorrasDoMundo(SEM, MAPA).find((m) => m.cidadeProxima === FOZ.nome);
const EL = elencoDoMundo(SEM, MAPA, { genero: G, lex: LEX });

/* o registo, como o App o teria: a gente da base entra com `local` = a
   cidade (é onde ela está); quem a base não tem entra como o Cronista a
   deixou */
const NPCS = {
  [TAVERNEIRA.nome]: { nome: TAVERNEIRA.nome, papel: TAVERNEIRA.papel, local: FOZ.nome, status: "vivo", genero: TAVERNEIRA.genero_pessoa || "" },
  [MUSICO.nome]: { nome: MUSICO.nome, papel: MUSICO.papel, local: FOZ.nome, status: "vivo", genero: MUSICO.genero_pessoa || "" },
  "Isolina do Lamento": { nome: "Isolina do Lamento", papel: "carpideira", local: "O Campo das Mães", status: "vivo", genero: "mulher", notas: "vive no Campo das Mães" },
  "Branca da Troca": { nome: "Branca da Troca", papel: "estudante", local: FOZ.nome, status: "vivo", genero: "mulher" },
};
const NA_TAVERNA = [NPCS[TAVERNEIRA.nome], NPCS[MUSICO.nome], NPCS["Isolina do Lamento"], NPCS["Branca da Troca"]];
const NA_TAVERNA_LUGAR = { nome: SINO_CALADO.nome, cidade: FOZ.nome, distancia: "dentro" };
const primeiro = (n) => String(n).split(/\s+/)[0];
const T = primeiro(TAVERNEIRA.nome), M = MUSICO.nome;

/* O que o jogo enviaria: a pauta do turno, com as peças reais de uma
   taverna cheia (o lugar do Geógrafo, o comércio, quem está, três gestos,
   uma fala) mais a cidade por dentro e a PERGUNTOU que a mesa junta das
   três fichas — como a fiação da MM14 a monta. */
const turno = (frase, { dia = 1, minuto = 12 * 60, lugar = NA_TAVERNA_LUGAR, presentes = NA_TAVERNA, recentes = [], foraDeHora = [], cheia = true } = {}) => {
  const nomes = [...Object.keys(NPCS), lugar ? lugar.nome : ""].filter(Boolean);
  const fc = fichaParaPauta(FOZ, { semente: SEM, mapa: MAPA, lex: LEX, genero: G, dia, minuto, frase, nomes, foraDeHora });
  const gp = genteParaPauta({
    semente: SEM, mapa: MAPA, cidade: FOZ.nome, genero: G, lex: LEX, npcs: NPCS, presentes,
    grupo: [], heroi: "Iara do Vau", recentes, lugar, dia, minuto, frase, nomes,
  });
  const mc = mercadoParaPauta(mercadoresDaCidade(FOZ, dia, 1, LEX), frase, { onde: FOZ.nome });
  const pergunta = juntarRespostas([fc, gp, mc]);
  let p = {};
  const g = geografoParaPauta({ espaco: { dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6, porte: "cidade" }, cidadeAtual: FOZ.nome, mapa: MAPA, semente: SEM });
  p = porNaPauta(p, "onde", g.onde);
  p = porNaPauta(p, "onde", envelopeDoComercio(FOZ, dia));
  p = porNaPauta(p, "naoPode", g.naoPode);
  if (cheia) {
    p = porNaPauta(p, "quem", `${TAVERNEIRA.nome}, atrás do balcão; ${M}, ao canto com o alaúde; Isolina do Lamento, à porta`);
    p = porNaPauta(p, "momento", "a chegada: a heroína procura quem lhe escreveu a carta, e alguém aqui já sabe o nome dela");
    p = porNaPauta(p, "gente", `${T} limpa o mesmo copo há tempo demais e não tira os olhos da porta`, `${primeiro(M)} erra a nota de propósito quando a heroína olha`, "Isolina do Lamento conta moedas de cobre em cima do balcão");
    p = porNaPauta(p, "fala", `${primeiro(M)} disse: "Forasteira? Paga adiantado, que aqui ninguém fia."`);
  }
  p = porNaPauta(p, "cidade", fc.cidade);
  p = porNaPauta(p, "pergunta", pergunta);
  return { fc, gp, mc, pergunta, texto: textoDaPauta(p), pauta: p };
};
const HORAS = /\b(o sino das horas|6h alva, 12h meio-dia)/;

/* ============================================================ */
sec("0. o mundo reconstruído é o da sessão");
{
  t("a taverna de Foz é O Sino Calado", !!SINO_CALADO && SINO_CALADO.nome === "O Sino Calado");
  t("com uma taverneira e um músico de canto na base", !!TAVERNEIRA && !!MUSICO, DA_TAVERNA.map((p) => `${p.nome}/${p.papel}`).join(", "));
  t("a masmorra ao lado de Foz é o Poço de Sal, mina de nível 4 com 9 salas (a da sessão)", !!POCO && POCO.nome === "Poço de Sal" && POCO.tipo === "mina" && POCO.nivel === 4 && POCO.salas === 9);
  t("e há uma casa de outra cidade com um membro que tem o nome da taverneira (o homónimo da sessão)",
    EL.casas.some((k) => k.cidade !== FOZ.nome && k.membros.includes(TAVERNEIRA.nome)), EL.casas.map((k) => `${k.nome}@${k.cidade}: ${k.membros.join("/")}`).join(" · "));
  console.log(`      Rosalina → ${TAVERNEIRA.nome} · Teodoro → ${M} · Carmela → ${FERREIRA ? FERREIRA.nome : "(sem forja)"}`);
}

/* ============================================================ */
sec("1. as tabelas");
{
  t("o gesto de quem pergunta é uma regex ancorada", GESTOS_DE_PERGUNTAR instanceof RegExp && GESTOS_DE_PERGUNTAR.source.startsWith("^"));
  t("a marca de pergunta conhece o ? e o verbo", MARCAS_DE_PERGUNTA.test("?") && MARCAS_DE_PERGUNTA.test("pergunto"));
  t("as interrogativas abrem por palavra de quem quer saber", INTERROGATIVAS.test("quanto custa") && !INTERROGATIVAS.test("voce caiu do ceu"));
  t("três respostas na mesa; duas da cidade; duas da gente", RESPOSTAS_DA_MESA === 3 && RESPOSTAS_POR_TURNO === 2 && RESPOSTAS_DA_GENTE === 2);
  t("a cidade sabe perguntar pela distância", PERGUNTAS_DA_CIDADE.some((p) => p.id === "distancia"));
  t("o mercado: a pergunta de preço, as mercadorias com tipo e rótulo, três itens por resposta",
    PERGUNTA_DE_PRECO instanceof RegExp && MERCADORIAS.every((m) => m.tipo && m.rotulo && m.rx instanceof RegExp) && ITENS_POR_RESPOSTA === 3);
  t("o sino fora de hora tem a resposta inteira e a curta", ["prenuncio", "rebate"].every((k) => SINOS_FORA_DE_HORA[k].o && SINOS_FORA_DE_HORA[k].curto) && !!SINOS_FORA_DE_HORA.semSinal);
  t("\"que família manda aqui\" pergunta pela daqui", FAMILIA_DAQUI.test("que familia manda aqui"));
}

/* ============================================================ */
sec("2. só pergunta? — perguntar é de graça, agir gasta pela parte que age");
{
  const soP = [
    ["J4", `Sento-me ao lado do ${M} e baixo a voz: "Quem é aquela mulher de preto que veio falar comigo? E desde quando o senhor me conhece?"`],
    ["J6", `Agradeço ao ${M} e chamo a moça do pão: "Quanto é o quarto de cima, por uma noite?"`],
    ["J9", `Encosto-me ao balcão: "E quem é gente importante em Foz do Meio? Que família manda aqui, e o que se diz dela?"`],
    ["J14", `Aponto para as facas na parede: "Quanto custa uma adaga boa, equilibrada para lançar?"`],
    ["J24", "Pergunto ao Mestre antes de agir: a quantos metros estão os dois de mim? E eles já me viram?"],
    ["J43", `Antes de subir, viro-me para a ${T}: "Hoje de manhã tocaram três pancadas fora de hora. Para que toca o sino assim, aqui em Foz do Meio?"`],
    ["J49", `Não me mexo do canto. Chamo a ${T} com dois dedos e pergunto baixo: "Quem são aqueles da mesa do meio, que se calaram quando eu desci?"`],
  ];
  for (const [j, f] of soP) { const r = soPergunta(f); t(`${j} só pergunta — não gasta tempo nem a vez`, r.pergunta && r.soPergunta && r.acao === "", JSON.stringify(r)); }
  const agem = [
    ["J2", `Abro a trouxa sem discutir e deixo a guarda revistar. Enquanto ela mexe, pergunto: "Que língua se fala mais por aqui? A comum serve?"`, "Abro a trouxa sem discutir e deixo a guarda revistar"],
    ["J5", `Vou até o balcão e pergunto a quem está a servir: "Quanto custa um quarto para esta noite?"`, "Vou até o balcão"],
    ["J7", `Vou ao balcão, peço uma caneca de cerveja e pago. Pergunto à ${T}: "Há quanto tempo a senhora tem o Sino Calado?"`, "Vou ao balcão, peço uma caneca de cerveja e pago"],
    ["J15", `Pago a lâmina da feira, prendo-a à cintura e pergunto à ${FERREIRA ? primeiro(FERREIRA.nome) : "ferreira"}: "O Poço de Sal, a sudeste — a quantos passos daqui fica, e o que há lá dentro?"`, "Pago a lâmina da feira, prendo-a à cintura"],
    ["a do coordenador", "O guarda vê-me? Então esgueiro-me até à porta.", "Então esgueiro-me até à porta"],
  ];
  for (const [j, f, acao] of agem) { const r = soPergunta(f); t(`${j} pergunta e age: gasta pela parte que age ("${acao}")`, r.pergunta && !r.soPergunta && r.acao === acao, JSON.stringify(r)); }
  const semP = soPergunta("Ataco o esqueleto com a lâmina");
  t("uma ação sem pergunta é só ação", !semP.pergunta && !semP.soPergunta && semP.acao === "Ataco o esqueleto com a lâmina");
  t("\"posso atacar o guarda?\" é pergunta, e não gasta", soPergunta("Posso atacar o guarda?").soPergunta);
  t("\"não ataco; pergunto quem manda aqui\" — a negação não age", soPergunta("Não ataco. Pergunto quem manda aqui.").soPergunta);
}

/* ============================================================ */
sec("3. os defeitos do caminho, um a um");
{
  /* 3.1 O SINO DO NOME. A taverna chama-se Sino Calado; a palavra "sino"
     casava `hoje` em PERGUNTAS_DA_CIDADE, que lia a frase INTEIRA. */
  const assunto = semNomesProprios(`Há quanto tempo a senhora tem o Sino Calado?`, []);
  t("a maiúscula no meio da oração é nome, e sai da frase lida à procura do assunto", !/sino|calado/.test(assunto) && /ha quanto tempo/.test(assunto), assunto);
  t("com o nome conhecido, sai mesmo escrito em minúsculas", !/sino/.test(semNomesProprios("fica no sino calado?", ["O Sino Calado"])));
  t("\"Foz do Meio\" sai inteira, com a partícula", !/\bdo\b/.test(semNomesProprios("aqui em Foz do Meio?", []).replace("aqui em", "")));
  t("a palavra que abre a oração não é nome", /quanto/.test(semNomesProprios("Quanto custa?", [])));
  t("e \"sino\" de verdade continua a ser o sino", /sino/.test(semNomesProprios("Para que toca o sino assim?", [])));
  const antes = turno(`Pergunto à ${T}: "Há quanto tempo a senhora tem o Sino Calado?"`);
  t("\"o Sino Calado\" não traz o sino das horas", !HORAS.test(antes.pergunta.join(" | ")), antes.pergunta.join(" | "));

  /* 3.2 O TESTE SOCIAL COMIA A FRASE. `impressionar` casava "vou até X e
     pergunto", e o envelope social ia ao Narrador no lugar da frase. */
  const j5 = `Vou até o balcão e pergunto a quem está a servir: "Quanto custa um quarto para esta noite?"`;
  const v5 = lerAcao(j5, { personagem: { nivel: 1 }, semente: SEM, lugar: SINO_CALADO.nome, tentativas: {}, dia: 1, pessoaDe: () => NPCS[TAVERNEIRA.nome] });
  t("\"vou até o balcão e pergunto: quanto custa?\" não é teste de causar boa impressão", !v5 || v5.id !== "impressionar", v5 && `${v5.id} · ${v5.rotulo}`);
  const v5b = lerAcao(`Me aproximo do guarda e digo: "Onde fica o templo?"`, { personagem: { nivel: 1 }, semente: SEM, lugar: "a praça", tentativas: {}, dia: 1, pessoaDe: () => ({ nome: "Vela", papel: "guarda", relacao: "desconhecido" }) });
  t("nem \"me aproximo e digo: «onde fica o templo?»\" — a fala só pergunta", !v5b || v5b.id !== "impressionar");
  const vElfa = lerAcao("vou na elfa bonita que acabou de passar por mim e digo: você caiu do céu? porque você é um anjo", { personagem: { nivel: 5 }, semente: "x", lugar: "a praça", tentativas: {}, dia: 1, pessoaDe: () => ({ nome: "Lírien", papel: "batedora", relacao: "desconhecido" }) });
  t("e a cantada continua a ser a cantada (teste-social §11)", vElfa && vElfa.id === "impressionar");
  t("falaSoPergunta: a pergunta de balcão sim, a cantada não", falaSoPergunta(j5) && !falaSoPergunta("digo: você caiu do céu? porque você é um anjo"));
  /* e o envelope que o App manda depois de um teste: a pauta lê o "Eu disse" */
  const env = envelopeSocial({ rotuloDoPedido: "atenção", cede: "a conversa continua", nunca: "nada mais", custoEmMoedas: 0, alavancas: [] }, { passou: true, quem: T, oQueEuDisse: "Quanto custa um quarto para esta noite?", rotulo: "causar boa impressão" });
  t("fraseDoJogador tira do envelope o que o jogador disse", fraseDoJogador(env) === "Quanto custa um quarto para esta noite?");
  t("e um envelope sem \"Eu disse\" não é frase de ninguém", fraseDoJogador("[SEM TESTE — DECISÃO DO SISTEMA] Narre.") === "");
  const pEnv = turno(env);
  t("com o envelope, a PERGUNTOU leva o pouso (e não as palavras da REGRA DO ENVELOPE)", pEnv.pergunta.some((l) => /^pouso:/.test(l)), pEnv.pergunta.join(" | "));

  /* 3.3 UMA RESPOSTA POR TURNO, ÀS VEZES DE OUTRA CIDADE */
  const duas = turno(`Guardo as moedas e olho o ${M} de frente: "Há quanto tempo tocas aqui no Sino, ${primeiro(M)}? E de onde vens?"`);
  t("duas perguntas à mesma pessoa, duas respostas", duas.pergunta.length === 2 && /está no posto há/.test(duas.pergunta[0]) && duas.pergunta[1].startsWith(M), duas.pergunta.join(" | "));
  const outra = EL.casas.find((k) => k.cidade !== FOZ.nome && k.membros.includes(TAVERNEIRA.nome));
  const fam = turno(`Encosto-me ao balcão: "E quem é gente importante em Foz do Meio? Que família manda aqui, e o que se diz dela?"`, { recentes: [`${TAVERNEIRA.nome} serve a cerveja.`] });
  t("a família que manda aqui é a daqui", fam.pergunta.some((l) => EL.casas.some((k) => k.cidade === FOZ.nome && l.startsWith(k.nome))), fam.pergunta.join(" | "));
  t(`e não a ${outra ? outra.nome : "de outra cidade"}, do homónimo da taverneira`, !outra || !fam.texto.includes(outra.nome));
  /* a sessão de verdade: Foz sem casa notável. Doze cidades antes dela no
     mapa, e o elenco (CIDADES_DO_ELENCO) não lhe dá casa nenhuma */
  const longe = Array.from({ length: 12 }, (_, i) => ({ nome: `Lugar ${i}`, porte: "cidade", bioma: "planicie", regiao: "Campos", x: 10 + i * 3, y: 20 }));
  const MAPA2 = { ...MAPA, cidades: [...longe, ...CIDADES] };
  const semCasa = genteParaPauta({ semente: SEM, mapa: MAPA2, cidade: FOZ.nome, genero: G, lex: LEX, npcs: NPCS, presentes: NA_TAVERNA, lugar: NA_TAVERNA_LUGAR, recentes: [`${TAVERNEIRA.nome} serve a cerveja.`], dia: 1, minuto: 600, frase: `"Que família manda aqui, e o que se diz dela?"` });
  t("sem casa daqui, a resposta é essa — e não a casa de outra cidade", semCasa.pergunta.length === 1 && /nenhuma casa notável tem sede aqui/.test(semCasa.pergunta[0]), semCasa.pergunta.join(" | "));
}

/* ============================================================
   4. AS DOZE, ANTES → DEPOIS
   "antes" é o veredito da transcrição (a coluna "veio de"); "depois" é o
   que esta suíte mede no caminho novo: a resposta certa está na pauta, e
   a errada não.
   ============================================================ */
sec("4. as doze perguntas da sessão, antes → depois");
const DOZE = [];
{
  const linhas = (r) => r.pergunta.join(" | ");
  const caso = (n, turnoN, pergunta, antes, certo, porque) => { DOZE.push({ n, turnoN, pergunta, antes, certo: !!certo }); t(`#${n} (T${turnoN}) ${pergunta} — ${certo ? "do sistema" : "NÃO"}`, !!certo, porque); };

  /* 1 · a língua, no portão (08:05, sem lugar) */
  const r1 = turno(`Abro a trouxa sem discutir e deixo a guarda revistar. Enquanto ela mexe, pergunto: "Que língua se fala mais por aqui? A comum serve?"`, { minuto: 8 * 60 + 5, lugar: null, presentes: [], cheia: false });
  caso("1", 2, "que língua se fala?", "sistema", r1.pergunta.some((l) => /^língua:/.test(l)) && !HORAS.test(linhas(r1)), linhas(r1));

  /* 2 · quem é aquela: o registo (resumoNPCsParaPrompt), e nada de errado na PERGUNTOU */
  const r2 = turno(`Sento-me ao lado do ${M} e baixo a voz: "Quem é aquela mulher de preto que veio falar comigo? E desde quando o senhor me conhece? Eu nunca pus os pés nesta cidade."`, { minuto: 8 * 60 + 30 });
  const reg = resumoNPCsParaPrompt(NPCS);
  caso("2", 4, "quem é aquela?", "sistema", /Isolina do Lamento/.test(reg) && /carpideira/.test(reg) && !HORAS.test(linhas(r2)), `${reg.slice(0, 160)} || ${linhas(r2)}`);

  /* 3 · o preço do quarto, pela frase que o teste social comia */
  const j5 = `Vou até o balcão e pergunto a quem está a servir: "Quanto custa um quarto para esta noite?"`;
  const v5 = lerAcao(j5, { personagem: { nivel: 1 }, semente: SEM, lugar: SINO_CALADO.nome, tentativas: {}, dia: 1, pessoaDe: () => NPCS[TAVERNEIRA.nome] });
  const r3 = turno(j5, { minuto: 8 * 60 + 40 });
  caso("3", 5, "quanto custa o quarto?", "perdida", (!v5 || v5.id !== "impressionar") && r3.pergunta.some((l) => /^pouso: quarto comum ◉ \d+/.test(l)), `${v5 ? v5.id : "sem teste"} · ${linhas(r3)}`);

  /* 3b · refeita */
  const r3b = turno(`Agradeço ao ${M} e chamo a moça do pão: "Quanto é o quarto de cima, por uma noite?"`, { minuto: 8 * 60 + 45 });
  caso("3b", 6, "quanto é o quarto de cima?", "sistema", r3b.pergunta.some((l) => /^pouso: quarto comum ◉ \d+/.test(l)), linhas(r3b));

  /* 4 · há quanto tempo tem a taverna: o POSTO da taverneira, com data */
  const r4 = turno(`Vou ao balcão, peço uma caneca de cerveja e pago. Pergunto à ${T}: "Há quanto tempo a senhora tem o Sino Calado?"`, { minuto: 8 * 60 + 50 });
  caso("4", 7, "há quanto tempo tem a taverna?", "inventado", r4.pergunta.some((l) => l.startsWith(`${TAVERNEIRA.nome} está no posto há`)) && !HORAS.test(linhas(r4)), linhas(r4));

  /* 5 · quem trabalha aqui: a gente da casa */
  const r5 = turno(`Bebo um gole e continuo com a ${T}: "E quem mais trabalha aqui, além de você?"`, { minuto: 8 * 60 + 55, recentes: [`${TAVERNEIRA.nome} enxuga a caneca e responde sem pressa.`] });
  const daCasa = DA_TAVERNA.filter((p) => p.nome !== TAVERNEIRA.nome);
  caso("5", 8, "quem trabalha aqui?", "inventado", r5.pergunta.some((l) => /^quem trabalha no Sino Calado:/.test(l) && daCasa.every((p) => l.includes(p.nome))), linhas(r5));

  /* 6 · que família manda aqui: a daqui, nunca a do homónimo */
  const outra = EL.casas.find((k) => k.cidade !== FOZ.nome && k.membros.includes(TAVERNEIRA.nome));
  const r6 = turno(`Encosto-me ao balcão: "E quem é gente importante em Foz do Meio? Que família manda aqui, e o que se diz dela?"`, { minuto: 9 * 60, recentes: [`${TAVERNEIRA.nome} serve a cerveja.`] });
  caso("6", 9, "que família manda, o que se diz?", "metade (morada errada)", r6.pergunta.some((l) => EL.casas.some((k) => k.cidade === FOZ.nome && l.startsWith(k.nome))) && (!outra || !r6.texto.includes(outra.nome)), linhas(r6));

  /* 7 · o preço da adaga: não há adaga; o que há de armas, com preço e banca */
  const bancas = mercadoresDaCidade(FOZ, 1, 1, LEX);
  const armas = bancas.flatMap((b) => b.estoque.filter((it) => it.tipo === "arma"));
  const r7 = turno(`Aponto para as facas na parede: "Quanto custa uma adaga boa, equilibrada para lançar?"`, { minuto: 11 * 60, lugar: FORJA ? { nome: FORJA.nome, cidade: FOZ.nome, distancia: "dentro" } : null, presentes: [] });
  const certo7 = armas.some((a) => /adaga/i.test(a.nome))
    ? r7.pergunta.some((l) => /^à venda em Foz do Meio: .*adaga/i.test(l))
    : r7.pergunta.some((l) => l.startsWith("não há adaga à venda em Foz do Meio") && (armas.length ? l.includes(`${armas[0].nome} ◉ ${armas[0].preco}`) : /nenhuma banca/.test(l)));
  caso("7", 14, "quanto custa uma adaga?", "inventado (desmentido pelo painel)", certo7 && !r7.pergunta.some((l) => /^pouso:/.test(l)), linhas(r7));

  /* 8 · a quantos passos fica o Poço de Sal, e o que há lá dentro */
  const r8 = turno(`Pago a lâmina da feira, prendo-a à cintura e pergunto à ${FERREIRA ? primeiro(FERREIRA.nome) : "ferreira"}: "O Poço de Sal, a sudeste — a quantos passos daqui fica, e o que há lá dentro?"`, { minuto: 11 * 60 + 20, lugar: FORJA ? { nome: FORJA.nome, cidade: FOZ.nome, distancia: "dentro" } : null, presentes: [] });
  caso("8", 15, "a quantos passos fica o Poço?", "metade (só o rumo)", r8.pergunta.some((l) => /^distância: Poço de Sal \(a? ?[^,]*, [\d,]+ (km|m)/.test(l) && /mina, perigo de nível 4, 9 salas/.test(l)) && !HORAS.test(linhas(r8)), linhas(r8));

  /* 9 e 10 · na luta: a distância e quem me vê saem da linha do tabuleiro (MM2),
     e a pergunta NÃO gasta a vez */
  const masm = montarGrade({ emMasmorra: true });
  const heroi = { nome: "Iara do Vau", x: 0, y: 4 };
  const slime = { nome: "Slime", x: 0, y: 13, vida: 4 };
  const esq = { nome: "Esqueleto", x: 3, y: 13, vida: 8 };
  const grid = resumoGridPrompt(masm, { heroi, grupo: [], inimigos: [slime, esq] });
  const j24 = soPergunta("Pergunto ao Mestre antes de agir: a quantos metros estão os dois de mim? E eles já me viram?");
  caso("9", 24, "a quantos metros estão?", "sistema", /Slime a \d+ m/.test(grid) && /Esqueleto a \d+ m/.test(grid) && j24.soPergunta, grid.slice(0, 200));
  caso("10", 24, "eles viram-me?", "sistema", grid.includes(ROTULOS_DO_TABULEIRO.semVisao) && j24.soPergunta, grid.slice(0, 200));

  /* 11 · para que toca o sino fora de hora: o rebate das 10:49, e o prenúncio */
  let ab = garantirAbertura({ cidade: FOZ.nome, sinal: "o sino", titulo: "O rasto de Delfina", alvo: { feitio: "descobrir", onde: "A Porta Aberta" }, turnos: SINO.piso - 2, cheios: SINO.segmentos - 2 });
  ab = andarOSino(ab, { cidade: FOZ.nome, lugar: "O Sino Calado", conhecidos: 0, dia: 1, minuto: 9 * 60 + 12 }).abertura;
  const toque = andarOSino(ab, { cidade: FOZ.nome, lugar: "o cais", conhecidos: 0, dia: 1, minuto: 10 * 60 + 49 });
  const foraDeHora = sinosForaDeHora(toque.abertura, { dia: 1, cidade: FOZ.nome });
  const r11 = turno(`Antes de subir, viro-me para a ${T}: "Hoje de manhã tocaram três pancadas fora de hora. Para que toca o sino assim, aqui em Foz do Meio?"`, { minuto: 13 * 60 + 20, foraDeHora });
  caso("11", 43, "para que toca o sino (fora de hora)?", "contradiz o sistema", !!toque.toque && r11.pergunta.some((l) => /às 10:49, o sino tocou a rebate/.test(l)), `${JSON.stringify(foraDeHora)} || ${linhas(r11)}`);

  /* 12 · há quanto tempo tocas, de onde vens: o posto e o passado do músico */
  const r12 = turno(`Guardo as moedas e olho o ${M} de frente: "Há quanto tempo tocas aqui no Sino, ${primeiro(M)}? E de onde vens?"`, { minuto: 13 * 60 + 25 });
  caso("12", 44, "há quanto tempo tocas, de onde vens?", "inventado", r12.pergunta.some((l) => l.startsWith(`${M} está no posto há`)) && r12.pergunta.some((l) => l.startsWith(`${M}: `)) && !HORAS.test(linhas(r12)), linhas(r12));

  /* A TABELA */
  const doSistemaAntes = DOZE.filter((c) => c.antes === "sistema").length;
  const doSistemaDepois = DOZE.filter((c) => c.certo).length;
  console.log("\n      #    T   pergunta                                   antes                          depois");
  for (const c of DOZE) console.log(`      ${c.n.padEnd(4)} ${String(c.turnoN).padEnd(3)} ${c.pergunta.padEnd(42)} ${c.antes.padEnd(30)} ${c.certo ? "do sistema" : "NÃO"}`);
  console.log(`\n      com a resposta certa na pauta: antes ${doSistemaAntes} de ${DOZE.length} → depois ${doSistemaDepois} de ${DOZE.length}`);
  t(`as doze (e a 3b) levam a resposta certa: ${doSistemaDepois}/${DOZE.length}`, doSistemaDepois === DOZE.length);
}

/* ============================================================ */
sec("5. o teto: duas respostas cabem numa taverna cheia, a terceira quando há lugar, e ninguém da cena sai");
{
  /* a frase que pede três coisas de uma vez */
  const tres = turno(`Pergunto à ${T}: "Quanto custa o quarto? Há quanto tempo a senhora tem esta casa? E a quantos passos fica o Poço de Sal?"`, { minuto: 12 * 60 + 5 });
  console.log(`      a taverna cheia com três respostas: ${tres.texto.length}/${TETO_DA_PAUTA}`);
  tres.pergunta.forEach((l) => console.log(`        PERGUNTOU ${l}`));
  t("três perguntas, três respostas, pela ordem da frase", tres.pergunta.length === 3 && /^pouso:/.test(tres.pergunta[0]) && /está no posto há/.test(tres.pergunta[1]) && /^distância:/.test(tres.pergunta[2]), tres.pergunta.join(" | "));
  t("e o texto cabe no teto", tres.texto.length <= TETO_DA_PAUTA);
  /* O PEDIDO DO COORDENADOR É "SE A FRASE PEDE DUAS COISAS, AS DUAS CABEM".
     Medido: na taverna cheia (o lugar, o comércio, três pessoas, três gestos,
     uma fala) as duas primeiras entram sempre; a terceira (prio 4,2) cede à
     falta de teto — é a primeira a cair, e cai inteira. Numa cena com menos
     gente, entra. */
  t("na taverna cheia, as duas primeiras entram", tres.pergunta.slice(0, 2).every((l) => tres.texto.includes(l)));
  console.log(`      a terceira, na taverna cheia: ${tres.texto.includes(tres.pergunta[2]) ? "DENTRO" : "fora (cortada pelo teto, inteira)"}`);
  const calma = turno(`Pergunto à ${T}: "Quanto custa o quarto? Há quanto tempo a senhora tem esta casa? E a quantos passos fica o Poço de Sal?"`, { minuto: 12 * 60 + 5, cheia: false, presentes: [NPCS[TAVERNEIRA.nome]] });
  console.log(`      a mesma frase com só a taverneira na cena: ${calma.texto.length}/${TETO_DA_PAUTA}`);
  t("com a cena menos cheia, as três entram", calma.pergunta.length === 3 && calma.pergunta.every((l) => calma.texto.includes(l)) && calma.texto.length <= TETO_DA_PAUTA);
  /* duas perguntas numa taverna cheia: as duas, sempre (a frase do T44) */
  const duas = turno(`Guardo as moedas e olho o ${M} de frente: "Há quanto tempo tocas aqui no Sino, ${primeiro(M)}? E de onde vens?"`);
  t(`duas perguntas na taverna cheia: as duas na pauta (${duas.texto.length}/${TETO_DA_PAUTA})`, duas.pergunta.length === 2 && duas.pergunta.every((l) => duas.texto.includes(l)));
  t("e quem está na cena continua (QUEM), com o lugar, a fala, a batida e o veto",
    tres.texto.includes(`${TAVERNEIRA.nome}, atrás do balcão`) && /^ONDE/m.test(tres.texto) && /Paga adiantado/.test(tres.texto) && /^MOMENTO/m.test(tres.texto) && /^NÃO PODE/m.test(tres.texto));
  /* quatro: a quarta fica para o turno seguinte */
  const quatro = juntarRespostas([{ pergunta: ["a", "b"], em: [0, 30] }, { pergunta: ["c", "d"], em: [10, 40] }]);
  t("a quarta resposta não entra: a mesa corta em três, pela ordem da frase", JSON.stringify(quatro) === JSON.stringify(["a", "c", "b"]));
  t("e sem repetir a mesma linha", juntarRespostas([{ pergunta: ["x"], em: [1] }, { pergunta: ["x"], em: [2] }]).length === 1);
}

/* ============================================================ */
sec("6. lixo, null e imutabilidade");
{
  let erro = "";
  for (const x of [undefined, null, "", 7, {}, [], "?", "   ", "[", "Eu disse: \"", "\u0000"]) {
    try { soPergunta(x); fraseDoJogador(x); semNomesProprios(x, x); falaSoPergunta(x); juntarRespostas(x); mercadoParaPauta(x, x); sinosForaDeHora(x, x || {}); } catch (e) { erro = `${JSON.stringify(x)}: ${e.message}`; }
  }
  t("nenhum lixo derruba as perguntas", !erro, erro);
  t("soPergunta de nada é nada", JSON.stringify(soPergunta(null)) === JSON.stringify({ pergunta: false, soPergunta: false, acao: "" }));
  t("juntarRespostas de lixo é lista vazia", Array.isArray(juntarRespostas(null)) && juntarRespostas([null, 3, { pergunta: "x" }]).length === 0);
  t("o mercado de lixo não responde", mercadoParaPauta(null, "quanto custa a adaga?").pergunta[0] === "não há adaga à venda aqui, e nenhuma banca daqui vende armas");
  t("sinosForaDeHora de um save antigo (sem hora) é vazio", sinosForaDeHora({ cidade: "X", tocou: true }, { dia: 1, cidade: "X" }).length === 0);
  t("e noutra cidade ou noutro dia também", (() => {
    const a = { cidade: "Foz do Meio", sinal: "o sino", tocou: true, tocouEm: { dia: 1, minuto: 649 }, oQueTocou: "x" };
    return sinosForaDeHora(a, { dia: 2, cidade: "Foz do Meio" }).length === 0 && sinosForaDeHora(a, { dia: 1, cidade: "Alto do Sal" }).length === 0 && sinosForaDeHora(a, { dia: 1, cidade: "Foz do Meio" }).length === 1;
  })());
  const congela = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congela(v); return o; };
  const ab = congela({ cidade: FOZ.nome, sinal: "o sino", titulo: "t", alvo: { feitio: "descobrir", onde: "A Porta Aberta" }, turnos: SINO.piso - 1, cheios: SINO.segmentos - 1, prenunciado: true });
  const npcs = congela(JSON.parse(JSON.stringify(NPCS)));
  let mudou = "";
  try {
    andarOSino(ab, { cidade: FOZ.nome, dia: 1, minuto: 649 });
    genteParaPauta({ semente: SEM, mapa: MAPA, cidade: FOZ.nome, genero: G, lex: LEX, npcs, presentes: Object.values(npcs), lugar: NA_TAVERNA_LUGAR, frase: "Há quanto tempo tocas aqui? E de onde vens?" });
  } catch (e) { mudou = e.message; }
  t("a abertura e o registo recebidos não são tocados", !mudou, mudou);
}

/* ============================================================
   7. A FIAÇÃO — App.jsx
   Prova por texto, não por import: App.jsx é fiação (React), e esta suíte
   é de módulo puro. Corpo por âncora + chave balanceada, nunca por número
   de linha — o arquivo muda sob os pés desta suíte (a mente do desenho
   edita entre um ciclo e outro). `\r\n` é normalizado para `\n` antes de
   qualquer teste, porque o Windows grava o arquivo com outro final de
   linha do que os regex abaixo assumem.
   ============================================================ */
sec("7. a fiação — App.jsx (perguntar é de graça)");
{
  const appPath = new URL("../src/App.jsx", import.meta.url);
  const app = fs.readFileSync(appPath, "utf8").replace(/\r\n/g, "\n");

  /* a mesma extração por chave balanceada de teste-mm1-sonda-da-mesa.mjs:
     acha `anchor` e devolve o texto a partir da PRIMEIRA "{" — depois de
     "=>" quando a âncora termina em "(" (parâmetro com default), ou logo
     após a própria âncora quando ela já termina em "{". */
  const corpoApos = (fonte, anchor) => {
    const ini = fonte.indexOf(anchor);
    if (ini < 0) return "";
    const viaArrow = !anchor.trim().endsWith("{");
    const abre = viaArrow ? fonte.indexOf("{", fonte.indexOf("=>", ini)) : ini + anchor.length - 1;
    let prof = 0;
    for (let i = abre; i < fonte.length; i++) {
      if (fonte[i] === "{") prof++;
      else if (fonte[i] === "}") { prof--; if (prof === 0) return fonte.slice(ini, i + 1); }
    }
    return "";
  };

  /* ---- 1. os imports ---- */
  t("App.jsx importa soPergunta e juntarRespostas de perguntas.js",
    /import\s*\{\s*soPergunta,\s*juntarRespostas\s*\}\s*from\s*"\.\/perguntas\.js"/.test(app));
  t("App.jsx importa mercadoParaPauta de mercado.js", /import\s*\{[^}]*\bmercadoParaPauta\b[^}]*\}\s*from\s*"\.\/mercado\.js"/.test(app));
  t("App.jsx importa sinosForaDeHora de abertura.js", /import\s*\{[^}]*\bsinosForaDeHora\b[^}]*\}\s*from\s*"\.\/abertura\.js"/.test(app));

  /* ---- 2. o relógio: quem só pergunta não avança o tempo, nem o sino ---- */
  const agir = corpoApos(app, "const agirInterno = (texto) => {");
  t("a âncora de agirInterno existe, e o corpo não está vazio", agir.length > 3000);
  t("o relógio (avancarMinutos + marcarTurnoDoMundo) fica de fora quando soPergunta(acao).soPergunta",
    /if\s*\(!combateRef\.current\s*&&\s*!acampadoRef\.current\s*&&\s*!masmorraRef\.current\s*&&\s*!\(\(\)\s*=>\s*\{[^]*?soPergunta\(acao\)\.soPergunta[^]*?\}\)\(\)\)\s*\{[^]*?avancarMinutos\(MINUTOS_POR_TURNO\)[^]*?marcarTurnoDoMundo\(\);/.test(agir));
  t("a checagem está guardada por calou (soPergunta que estoura não trava o turno)",
    /calou\("soPergunta no tempo", e\); return false;/.test(agir));

  /* ---- 3. a vez na luta: perguntar não é o turno ---- */
  t("na luta, só pergunta não chega ao despachante — enviar leva o aviso, e o turno para aqui (return)",
    /if\s*\(combateRef\.current\s*&&\s*soPergunta\(acao\)\.soPergunta\)\s*\{[^]*?enviar\(`\$\{acao\} \[PERGUNTA AO MESTRE[^]*?\);\s*return;\s*\}/.test(agir));
  t("guardado por calou (\"soPergunta na luta\")", /calou\("soPergunta na luta", e\);/.test(agir));
  {
    const iCaiu = agir.indexOf('calou("turno-de-quem-caiu", e);');
    const iSoP = agir.indexOf("soPergunta na luta");
    const iRevela = agir.indexOf("revelarPorAto(fichaViva() || personagem, acao)");
    t("a pergunta na luta entra DEPOIS do turno de quem caiu e ANTES de revelarPorAto",
      iCaiu >= 0 && iSoP > iCaiu && iRevela > iSoP, `${iCaiu}/${iSoP}/${iRevela}`);
  }

  /* ---- 4. a pauta: as três fichas juntas, pela ordem da frase ----
     MM14 (o resto do nº 6): o cálculo das três fichas mudou-se de
     `pautaDoTurno` para `fichasDaMesa` — extraído para que o sinal do
     oráculo (`ehPerguntaAoMundo`) também pudesse perguntar às fichas antes
     de rolar o d100, sem duplicar o cálculo. `pautaDoTurno` passou a só
     CHAMAR `fichasDaMesa` e destruturar { cidade: fc, gente: gp, mercado:
     mc }; o que fazia esse cálculo (nomesDaMesa, as três chamadas, o
     try/calou de cada uma, a ordem entre elas) mora agora em
     `fichasDaMesa`. As asserções movem-se com o motivo, para o corpo onde
     o fato hoje vive — nenhuma afrouxa, e uma nova prova a ligação. */
  const pauta = corpoApos(app, "const pautaDoTurno = (acaoDoTurno = \"\") => {");
  t("o corpo de pautaDoTurno não está vazio", pauta.length > 300);
  const fichas = corpoApos(app, "const fichasDaMesa = (frase = \"\", presentes = null) => {");
  t("o corpo de fichasDaMesa não está vazio", fichas.length > 1500);
  t("pautaDoTurno chama fichasDaMesa com a frase do turno e quem está aqui, e destrutura as três fichas",
    pauta.includes("const { cidade: fc, gente: gp, mercado: mc } = fichasDaMesa(acaoDoTurno, aqui);"));
  t("nomesDaMesa existe, uma vez só, dos NPCs e do lugar — dentro de fichasDaMesa",
    fichas.includes("const nomesDaMesa = [...Object.keys(npcsRef.current || {}), (lugarRef.current && lugarRef.current.nome) || \"\"].filter(Boolean);"));
  t("fichaParaPauta recebe os nomes da mesa e o sino fora de hora",
    fichas.includes("nomes: nomesDaMesa, foraDeHora,") && /foraDeHora = sinosForaDeHora\(aberturaMundoRef\.current, \{ dia: diaRef\.current, cidade: cidadeAtualRef\.current \}\)/.test(fichas));
  t("genteParaPauta recebe os mesmos nomes da mesa", fichas.includes("recentes, lugar: lugarRef.current, dia: diaRef.current, minuto: minutoRef.current, frase,\n          nomes: nomesDaMesa,"));
  t("o mercado responde fora da luta, numa cidade, pela mesma frase do turno",
    fichas.includes('mc = (!combateRef.current && cidadeAtualRef.current) ? mercadoParaPauta(mercadoAqui, frase, { onde: cidadeAtualRef.current }) : null;'));
  t("as três (fc, gp, mc) juntam-se numa mesa só, na secção \"pergunta\", de volta em pautaDoTurno",
    pauta.includes('p = porNaPauta(p, "pergunta", juntarRespostas([fc, gp, mc]));'));
  {
    const iFc = fichas.indexOf("fc = fichaParaPauta(");
    const iGp = fichas.indexOf("gp = genteParaPauta(");
    const iMc = fichas.indexOf("mercadoParaPauta(mercadoAqui");
    const iRetorna = fichas.indexOf('return { cidade: fc, gente: gp, mercado: mc };');
    t("a ordem no código é cidade, gente, mercado, e só então fichasDaMesa devolve a mesa",
      iFc >= 0 && iGp > iFc && iMc > iGp && iRetorna > iMc, `${iFc}/${iGp}/${iMc}/${iRetorna}`);
  }
  t("cada ficha guardada fora do try (fc e gp nascem null antes), dentro de fichasDaMesa",
    fichas.includes("let fc = null;") && fichas.includes("let gp = null;") && fichas.includes("let mc = null;"));
  t("as três chamadas estão guardadas por calou, dentro de fichasDaMesa",
    /calou\("fichaParaPauta", e\);/.test(fichas) && /calou\("genteParaPauta", e\);/.test(fichas) && /calou\("mercadoParaPauta", e\);/.test(fichas));

  /* ---- 5. o sino leva o quando ---- */
  const marcarMundo = corpoApos(app, "const marcarTurnoDoMundo = () => {");
  t("o corpo de marcarTurnoDoMundo não está vazio", marcarMundo.length > 200);
  t("andarOSino recebe o dia e o minuto do turno, para sinosForaDeHora saber quando",
    marcarMundo.includes("cidade: cidadeAtualRef.current,\n        ") && /cidade: cidadeAtualRef\.current,[^]*?dia: diaRef\.current, minuto: minutoRef\.current,\s*\}\);/.test(marcarMundo));

  /* ---- 6. o teste social leva a frase do jogador ---- */
  /* o setRolagem do pedido (com `desafio: v`) mora em rolarDesafio, não em
     adjudicarAcao — este só decide QUE desafio é; quem monta o cartão do
     dado é rolarDesafio(v, acao), chamado por ele */
  const rd = corpoApos(app, "const rolarDesafio = (v, acao) => {");
  t("a âncora de rolarDesafio existe, e o corpo não está vazio", rd.length > 3000);
  t("setRolagem leva a frase do jogador, junto do desafio",
    /desafio: v,[^]*?frase: acao,/.test(rd));
  const rolagem = corpoApos(app, "const concluirRolagem = (valor, dadoAnterior = null) => {");
  t("o corpo de concluirRolagem não está vazio", rolagem.length > 2000);
  t("o envelope social usa a frase do jogador (e cai para o motivo se ela faltar)",
    rolagem.includes('oQueEuDisse: r.frase || r.motivo || ""'));
}

console.log(`\nMM14 · as perguntas ao Mestre: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
