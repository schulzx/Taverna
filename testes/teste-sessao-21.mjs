/* teste-sessao-21.mjs (13/11/2026) — a 21.ª sessão de prova: a pessoa do passo que nunca entrava em cena, o cais que era uma taverna, e o porquê do feito escondido

   O relatório é mente/sessao-21.md (§2.3, §3 graves 1 e 2, médio 3). A
   quest de abertura era A Barca a Meio do Rio: «Chegar à Bota do Ocaso e
   ouvir Quorin». A casa existia e o Diário dizia onde; o herói passou nove
   turnos lá e falou-lhe cinco vezes — e Quorin nunca entrou em EM CENA, a
   quest ficou em 0 passos, e o Narrador negou o filho que ela tem na barca.
   E o «cais» da quest era a própria Bota, uma taverna: «Volto ao cais» não
   tinha resposta, e a cena dos reféns não tinha chão.

   A semente da sessão não está no relatório; o mundo aqui é o equivalente,
   montado como em teste-passo-alcancavel (o catálogo só com a quest da
   sessão, no ato 1), e jogado pelo caminho de sempre — a pessoa do passo, a
   pauta, a ficha da cena, o registo, o livro, a quest —, sem ler uma linha
   do motor.

   O que cada secção prova, e o que estava errado:
   1. a pessoa do passo de uma quest está no sítio do passo a qualquer hora
      (a rotina do ofício dizia «não está aqui agora» de noite e de manhã),
      com o que a quest diz dela (o rótulo do papel, e o passo seguinte no
      «Sabe»); entra na linha EM CENA da pauta que o modo `boca` manda ao
      Narrador (antes só a ficha do ator a via); e a conversa com ela fecha
      o passo pela porta de sempre;
   2. A CATRACA: um papel cujo nome é um tipo de sítio (o cais, o templo, a
      forja…) só cai num sítio desse tipo — em mundos de todos os moldes, e
      nenhum cais de A Barca a Meio do Rio é uma taverna;
   3. o porquê do feito do sistema («uma conversa que ficou») sobe para o
      chip de XP do recibo; o tamanho genérico do juiz continua bastidor. */
import { BIBLIOTECA_DE_QUESTS, questPorId } from "../src/biblioteca-de-quests.js";
import { garantirQuestsDaEspinha, oTurnoDasQuests } from "../src/motor/quests-do-turno.js";
import { esqueletoDaCampanha, comOEsqueleto, O_SITIO_DO_PAPEL } from "../src/esqueleto.js";
import { garantirHistoria, ESTRUTURAS } from "../src/historia.js";
import { gerarGeografia } from "../src/geografia.js";
import { estenderEspinha } from "../src/saga.js";
import { nucleoDaCampanha } from "../src/nucleo.js";
import { chefesDoMundo, locaisDaCidade } from "../src/mundo-base.js";
import { aPessoaDoPasso, A_PESSOA_DO_PASSO } from "../src/motor/a-pessoa-do-passo.js";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { aFichaDeAtor } from "../src/motor/ficha-de-ator.js";
import { oQueACenaRegista } from "../src/motor/registo-da-cena.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { osPassosDasQuests } from "../src/a-quest-manda.js";
import { garantirFactos } from "../src/livro-de-factos.js";
import { textoDaPauta } from "../src/pauta.js";
import { montarEmCena, emCenaParaPauta, EM_CENA_DO_PASSO, EM_CENA_NA_PAUTA } from "../src/em-cena.js";
import { MOLDES } from "../src/moldes.js";
import { reciboDoTurno, moradaDaLinha } from "../src/glifos.js";
import { mensagensComRecibo, O_PORQUE_NO_RECIBO } from "../src/recibo-da-luta.js";
import { GRAUS } from "../src/juiz.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* o mundo da 21.ª: o catálogo só com A Barca a Meio do Rio, no ato 1 */
const BARCA = "a_barca_a_meio_do_rio";
function mundoDaBarca(i) {
  const semente = `aventura|${i}`;
  const mapa = gerarGeografia(semente, null, null);
  const espinha0 = estenderEspinha({ semente, mapa, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "erudito", dia: 1 });
  const nucleo = nucleoDaCampanha(semente, mapa, { espinha: espinha0, antecedente: "erudito", grupo: [] });
  const esq = esqueletoDaCampanha({ semente, mapa, espinha: espinha0, antecedente: "erudito", nucleo, chefes: chefesDoMundo(semente, mapa), catalogo: BIBLIOTECA_DE_QUESTS.filter((q) => q.id === BARCA) });
  if (!esq || esq.atos[0].quest !== BARCA) return { semente, mapa, esq: null };
  let E = { nomeCampanha: "aventura", mundo: { genero: String(i) }, espinha: comOEsqueleto(espinha0, esq), historia: garantirHistoria({ estrutura: "jornada", etapa: 0 }), mapa, cidadeAtual: mapa.cidades[0].nome, lugar: null, jornada: null, personagem: { nome: "Ilvara", grupo: [], inventario: [] }, npcs: {}, dia: 1, minuto: 600, npcTurno: 0, factos: garantirFactos(null) };
  const r = oTurnoDasQuests(E, { mundo: { semente } });
  if (r) E = { ...E, ...r.estado };
  return { semente, mapa, esq, E };
}
const registo = (E) => garantirQuestsDaEspinha(E.espinha.quests).registos.find((x) => x.id === BARCA);
const tipoDoSitio = (semente, mapa, cidade, nome, molde = null) => {
  const c = mapa.cidades.find((x) => x.nome === cidade);
  return c ? (locaisDaCidade(semente, c, undefined, molde, null).find((l) => l.nome === nome) || {}).tipo || "" : "";
};

sec("§1 a pessoa do passo entra em cena, diz o que a quest diz dela, e a conversa fecha o passo");
{
  /* aventura|20: a barca nasce em Casa do Sul, e o cais é um cais. Antes
     desta leva o cais era «O Largo Enferrujado», um mercado, e o parente
     não estava lá das sete da tarde às seis da manhã */
  const W = mundoDaBarca(20);
  t("o mundo de prova abre A Barca a Meio do Rio no primeiro ato", !!W.esq);
  const R = registo(W.E);
  const { cais, parente, procurado } = R.papeis;
  const noCais = { ...W.E, cidadeAtual: cais.cidade, lugar: { nome: cais.nome, cidade: cais.cidade } };
  const ROTULO = questPorId(BARCA).papeis.parente.rotulo;

  /* a hora do ofício não manda em quem a quest pôs no sítio */
  const horas = Array.from({ length: 24 }, (_, h) => h);
  const fora = horas.filter((h) => { const x = aPessoaDoPasso({ ...noCais, minuto: h * 60 }).find((y) => y.nome === parente.nome); return !x || !x.aqui; });
  t("com o herói no cais, o parente está em cena a toda hora (a 21.ª: «não está aqui agora» de noite e de manhã)", fora.length === 0, `fora às ${fora.join(",")}`);
  const ela = aPessoaDoPasso({ ...noCais, minuto: 21 * 60 }).find((y) => y.nome === parente.nome) || {};
  t("…e é gente do passo de uma quest, que a hora não governa", ela.de === "quest" && !A_PESSOA_DO_PASSO.aHoraConta.includes(ela.de), J(ela.de));
  t("leva o que a quest diz dela: o rótulo do papel", ela.rotulo === ROTULO, J(ela.rotulo));
  t("e sabe o passo que vem depois do dela — achar quem eles querem", (ela.sabe || []).some((s) => s.includes(procurado.nome)), J(ela.sabe));
  t("noutro sítio da cidade, não", !aPessoaDoPasso({ ...noCais, lugar: { nome: "Um Sítio Qualquer", cidade: cais.cidade } }).some((x) => x.nome === parente.nome));

  /* a linha EM CENA da pauta que o modo `boca` manda ao Narrador */
  const frase = `Falo com ${parente.nome}. — O que se passa na barca?`;
  const { pauta } = aPautaDoTurno({ ...noCais, minuto: 21 * 60 }, { frase });
  const linha = textoDaPauta(pauta, { turno: 3 }).split("\n").find((l) => l.startsWith("EM CENA")) || "";
  t("a pauta põe-na na linha EM CENA (antes só a ficha do ator a via)", linha.includes(parente.nome), linha);
  t("…com o parentesco inteiro, e não as três palavras do ofício", linha.includes(ROTULO), linha);
  t("…e com o que ela sabe", linha.includes(procurado.nome), linha);

  /* a conversa fecha o passo pela porta de sempre: a ficha da cena, o
     registo (que o Cronista do turno mescla em npcs) e o livro */
  const ficha = aFichaDeAtor({ nota: "", frase, estado: { ...noCais, minuto: 21 * 60 }, teste: null });
  t("a ficha da cena dá a conversa com ela", (ficha.conversa || []).includes(parente.nome), J(ficha.conversa));
  const dc = oQueACenaRegista({ ficha, aceite: null, estado: noCais });
  t("o registo da cena grava-a, com o sítio do passo", dc.falou_com.includes(parente.nome) && dc.pessoas.some((p) => p.nome === parente.nome && norm(p.local).includes(norm(cais.nome))), J(dc));
  const antes = osPassosDasQuests(noCais, { mundo: { semente: W.semente } }).map((p) => p.etapa);
  let E2 = { ...noCais, npcs: { [parente.nome]: { nome: parente.nome, local: dc.pessoas[0].local, conhecidoEm: 1 } } };
  E2 = { ...E2, factos: anotarOLivro(E2, { falouCom: dc.falou_com, lugar: noCais.lugar, dia: 1, turno: 5 }, { mundo: { semente: W.semente } }).factos };
  const r2 = oTurnoDasQuests(E2, { mundo: { semente: W.semente } });
  if (r2) E2 = { ...E2, ...r2.estado };
  const depois = osPassosDasQuests(E2, { mundo: { semente: W.semente } }).map((p) => p.etapa);
  t("estar no cais e ouvi-la fecha o primeiro passo: a quest anda para «achar quem eles querem»", J(antes) === J(["cais"]) && J(depois) === J(["procurado"]), `${J(antes)} → ${J(depois)}`);

  /* a peça da linha, sozinha: o rótulo inteiro (até ao teto da tabela) e o «sabe» */
  const lista = montarEmCena({ cidade: cais.cidade, doPasso: [{ nome: parente.nome, papel: "taberneira", rotulo: ROTULO, sabe: [ela.sabe[0]] }] });
  const item = lista.find((x) => x.nome === parente.nome) || {};
  t("na lista EM CENA ela está à vista, vinda do passo", item.aqui === true && item.deOnde === EM_CENA_DO_PASSO.deOnde, J(item));
  const lin = emCenaParaPauta(lista);
  t("e a linha diz o rótulo inteiro, além das três palavras de um ofício", lin.includes(ROTULO) && ROTULO.split(/\s+/).length > EM_CENA_NA_PAUTA.papel, lin);
  t("lixo no doPasso não derruba a lista", Array.isArray(montarEmCena({ doPasso: [null, {}, "x", { nome: "" }] })));
}

sec("§2 A CATRACA: o papel que é um sítio só cai num sítio desse tipo");
{
  /* nenhum cais de A Barca a Meio do Rio é uma taverna, em quarenta mundos */
  let barcas = 0, tavernas = 0, fora = 0;
  for (let i = 0; i < 40; i++) {
    const W = mundoDaBarca(i);
    if (!W.esq) continue;
    barcas++;
    const c = W.esq.atos[0].papeis.cais;
    const tipo = tipoDoSitio(W.semente, W.mapa, c.cidade, c.nome);
    if (tipo === "taverna") tavernas++;
    if (!O_SITIO_DO_PAPEL.cais.includes(tipo)) fora++;
  }
  t(`em 40 mundos, ${barcas} barcas, nenhum cais é uma taverna (a 21.ª: a Bota do Ocaso)`, tavernas === 0 && fora === 0, `${tavernas} tavernas, ${fora} fora do tipo`);

  /* o catálogo inteiro, todos os moldes */
  const ESP = ESTRUTURAS.filter((e) => e.espinha).map((e) => e.id);
  const ANTS = ["", "orfao", "soldado", "erudito", "acolito", "ladrao", "naufrago"];
  const POR_MOLDE = 60;
  let mundos = 0, conferidos = 0;
  const faltas = [];
  const porPapel = {};
  for (const molde of MOLDES) {
    for (let i = 0; i < POR_MOLDE; i++) {
      const semente = `Cais|${molde.id}|${i}`;
      const mapa = gerarGeografia(semente, molde, null);
      const antecedente = ANTS[i % ANTS.length];
      let esq = null;
      try {
        const espinha = estenderEspinha({ semente, mapa, estrutura: ESP[i % ESP.length], cidadeInicial: mapa.cidades[0].nome, antecedente, dia: 1 });
        const nucleo = nucleoDaCampanha(semente, mapa, { espinha, antecedente, grupo: [] });
        esq = esqueletoDaCampanha({ semente, mapa, espinha, antecedente, nucleo, chefes: chefesDoMundo(semente, mapa), molde });
      } catch { esq = null; }
      if (!esq) continue;
      mundos++;
      const postas = [...esq.atos.filter((a) => a.quest).map((a) => ({ id: a.quest, papeis: a.papeis })), ...esq.coracao.map((c) => ({ id: c.quest, papeis: c.papeis }))];
      for (const q of postas) {
        const F = questPorId(q.id);
        if (!F) continue;
        for (const [papel, def] of Object.entries(F.papeis)) {
          if (!def || def.de !== "lugar" || !Object.prototype.hasOwnProperty.call(O_SITIO_DO_PAPEL, papel)) continue;
          const p = q.papeis[papel];
          if (!p || !p.nome) continue;
          conferidos++;
          porPapel[papel] = (porPapel[papel] || 0) + 1;
          const tipo = tipoDoSitio(semente, mapa, p.cidade, p.nome, molde);
          if (!O_SITIO_DO_PAPEL[papel].includes(tipo) && faltas.length < 6) faltas.push(`${semente} ${q.id}.${papel} = ${p.nome} (${tipo || "?"})`);
          else if (!O_SITIO_DO_PAPEL[papel].includes(tipo)) faltas.push("…");
        }
      }
    }
  }
  console.log(`      · papéis tipados conferidos: ${J(porPapel)}`);
  t(`${mundos} mundos (${MOLDES.length} moldes × ${POR_MOLDE}), ${conferidos} papéis tipados conferidos`, mundos >= MOLDES.length * POR_MOLDE * 0.8 && conferidos > 0);
  t("nenhum papel tipado num sítio de outro tipo", faltas.length === 0, faltas.join(" | "));
}

sec("§3 o porquê do feito sobe para o recibo");
{
  const antes = { nome: "Ilvara", nivel: 1, xp: 0, moedas: 6, vida: 13, mana: 4 };
  const depois = { ...antes, xp: 17 };
  const recibo = reciboDoTurno(antes, depois);
  const PORQUE = "uma conversa que ficou";
  const lista = [
    { autor: "jogador", texto: "Falo com Quorin." },
    { autor: "mestre", texto: "Quorin ergue os olhos do balcão." },
    { autor: "sistema", texto: `✧ +17 XP — ${PORQUE}.` },
  ];
  t("a linha do feito continua fora da cena (mora no recibo — não se diz duas vezes)", moradaDaLinha(lista[2]) === "recibo");
  const com = mensagensComRecibo(lista, { desde: 0, recibo });
  const xp = ((com[1] && com[1].recibo) || []).find((c) => c.tipo === "xp") || {};
  t("o chip de XP leva a frase de mundo do feito (a 21.ª: só «+17 XP»)", xp.porque === PORQUE && xp.texto.includes(PORQUE) && xp.texto.includes("17"), J(xp));
  t("…e o leitor de tela também a diz", String(xp.falado || "").includes(PORQUE), J(xp.falado));
  const generico = [...lista.slice(0, 2), { autor: "sistema", texto: `✧ +17 XP — ${GRAUS.feito.diz}.` }];
  const xpG = ((mensagensComRecibo(generico, { desde: 0, recibo })[1] || {}).recibo || []).find((c) => c.tipo === "xp") || {};
  t("o tamanho genérico do juiz continua bastidor: não sobe", !xpG.porque && !String(xpG.texto).includes(GRAUS.feito.diz), J(xpG));
  t("a régua da linha é tabela, e lê a linha do feito", O_PORQUE_NO_RECIBO.linha.test(lista[2].texto) && !O_PORQUE_NO_RECIBO.linha.test("◉ +3 moedas"));
  t("sem chip de XP, a lista é a de sempre (o recibo vai igual)", (mensagensComRecibo(lista, { desde: 0, recibo: reciboDoTurno(antes, { ...antes, moedas: 9 }) })[1].recibo || []).every((c) => !c.porque));
}

console.log(`\na 21.ª sessão: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
