/* teste-mm8a-ficha.mjs (Fase MM · MM8a) — a gente por dentro

   A prova de `src/gente-por-dentro.js`: a ficha que o registo nunca teve
   (idade e compleição à vista, a marca do rosto, o jeito, o passado com
   data, o motivo do posto, a rotina, quem trabalha em cada casa) e a
   linha que sobe à secção PERGUNTOU quando — e só quando — o jogador
   pergunta por alguém. As perguntas de mesa que ela responde (sonda da
   mesa, C1E1): #18, #26, #29, #42, #54, #90, #103, #105, #106.

   Tudo por semente: nenhum `Math.random` decide uma asserção. */
import {
  IDADE_PELO_CABELO, FAIXAS_DE_IDADE, COMPLEICAO_PELO_QUEIXO, MARCAS_DO_ROSTO,
  FAMILIAS_DE_OFICIO, FORA_DO_TURNO, DORMINDO, EVENTOS_DO_PASSADO, DESFECHOS_DO_ADVERSARIO,
  JEITO_QUE_MUDOU, PERGUNTAS_DA_GENTE, RESPOSTAS_DA_GENTE, PESSOAS_POR_RESPOSTA,
  fichaDaPessoa, genteParaPauta,
} from "../src/gente-por-dentro.js";
import { CABELO, tracos, feicoes } from "../src/semente.js";
import { gerarGeografia } from "../src/geografia.js";
import { oQueExisteAqui, chefesDoMundo, criaturasDaRegiao, matar, garantirBase } from "../src/mundo-base.js";
import { criarNPC } from "../src/npcs.js";
import { O_HOJE, fichaParaPauta } from "../src/cidade-por-dentro.js";
import { envelopeDoComercio } from "../src/comercio.js";
import { paraPauta as geografoParaPauta } from "../src/geografo.js";
import { SECOES, porNaPauta, textoDaPauta, TETO_DA_PAUTA } from "../src/pauta.js";
import { CASOS } from "./sonda-da-mesa-casos.mjs";
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

const SEM = "Sonda da Gente|Fantasia medieval";
const G = "Fantasia medieval";
const MAPA = gerarGeografia(SEM, "sobremundo");
const CIDADE = MAPA.cidades.find((c) => c.porte === "cidade") || MAPA.cidades[0];
const AQUI = oQueExisteAqui(SEM, MAPA, CIDADE.nome, null, G);
const CTX = { mapa: MAPA, genero: G, cidade: CIDADE.nome, dia: 12, minuto: 14 * 60 };
const pergunta = (n) => CASOS.find((c) => c.n === n).pergunta;
/* a cena da taverna: a gente da taverna, como o App a vê — registada com
   `local` = a cidade (é o que `criarNPC` recebe no App, v9.14) */
const TAVERNA = AQUI.locais.find((l) => l.tipo === "taverna") || AQUI.locais[0];
const DA_TAVERNA = AQUI.gente.filter((p) => p.local === TAVERNA.nome);
const NPCS = Object.fromEntries(DA_TAVERNA.map((p) => [p.nome, criarNPC(p.nome, { papel: p.papel, local: CIDADE.nome, conhecidoEm: 3 })]));
const PRESENTES = Object.values(NPCS).map((n) => ({ ...n, motivo: `vive em ${CIDADE.nome}` }));
const cena = (frase, extra = {}) => ({
  semente: SEM, mapa: MAPA, cidade: CIDADE.nome, genero: G, npcs: NPCS, presentes: PRESENTES,
  recentes: [`${DA_TAVERNA[0].nome} limpa o balcão e olha para a porta.`], lugar: { nome: TAVERNA.nome },
  dia: 12, minuto: 14 * 60, frase, ...extra,
});

/* ============================================================ */
sec("1. as tabelas");
{
  t("uma idade por cor de cabelo do retrato, na mesma ordem", IDADE_PELO_CABELO.length === CABELO.length);
  t("toda faixa de idade é coerente (de ≤ até)", IDADE_PELO_CABELO.every((f) => f.de <= f.ate && f.cabelo));
  const idx = (cor) => CABELO.indexOf(cor);
  t("o grisalho nunca desce dos 45; o branco, dos 60", IDADE_PELO_CABELO[idx("#8C8C8C")].de >= 45 && IDADE_PELO_CABELO[idx("#D8D8D8")].de >= 60);
  t("as faixas de idade cobrem tudo e crescem", FAIXAS_DE_IDADE.every((f, i) => i === 0 || f.ate > FAIXAS_DE_IDADE[i - 1].ate) && FAIXAS_DE_IDADE[FAIXAS_DE_IDADE.length - 1].ate >= 999);
  t("a compleição cobre o maxilar de 0 a 1", COMPLEICAO_PELO_QUEIXO[COMPLEICAO_PELO_QUEIXO.length - 1].ate > 1 && COMPLEICAO_PELO_QUEIXO.every((c, i) => i === 0 || c.ate > COMPLEICAO_PELO_QUEIXO[i - 1].ate));
  t("três marcas, e só a cicatriz é ferida", MARCAS_DO_ROSTO.length === 3 && MARCAS_DO_ROSTO.filter((m) => m.ferida).length === 1 && MARCAS_DO_ROSTO[0].ferida);
  const campos = ["id", "idadeMin", "rx", "postos", "cicatriz", "adversario", "turnos"];
  t("toda família de ofício tem todos os campos", FAMILIAS_DE_OFICIO.every((f) => campos.every((k) => f[k] != null) && f.postos.length && f.cicatriz.length && f.turnos.length));
  t("a última família é a rede (casa qualquer papel)", FAMILIAS_DE_OFICIO[FAMILIAS_DE_OFICIO.length - 1].id === "comum" && FAMILIAS_DE_OFICIO[FAMILIAS_DE_OFICIO.length - 1].rx.test("qualquer coisa"));
  t("o adversário é sempre chefe, criatura ou pessoa", FAMILIAS_DE_OFICIO.every((f) => ["chefe", "criatura", "pessoa"].includes(f.adversario)));
  t("todo turno está dentro do dia", FAMILIAS_DE_OFICIO.every((f) => f.turnos.every((x) => x.de >= 0 && x.de < 1440 && x.ate >= 0 && x.ate < 1440 && x.de !== x.ate && x.o)));
  const familias = new Set(FAMILIAS_DE_OFICIO.map((f) => f.id));
  t("todo acontecimento do passado é de famílias que existem", EVENTOS_DO_PASSADO.every((e) => e.familias.every((f) => f === "*" || familias.has(f)) && typeof e.o === "function"));
  t("toda família tem ao menos um acontecimento possível", [...familias].every((f) => EVENTOS_DO_PASSADO.some((e) => e.familias.includes("*") || e.familias.includes(f))));
  t("fora do turno, desfechos e o dormir existem", FORA_DO_TURNO.length >= 3 && DESFECHOS_DO_ADVERSARIO.length >= 3 && !!DORMINDO);
  t("o jeito que mudou é uma fração", JEITO_QUE_MUDOU > 0 && JEITO_QUE_MUDOU < 1);
  /* MM14: 1 → 2. A sessão de prova (T44) fez duas perguntas à mesma pessoa
     numa frase ("há quanto tempo tocas aqui? e de onde vens?") e só uma
     subia; a mesa corta o total em RESPOSTAS_DA_MESA (perguntas.js), e o
     teto da pauta é medido em teste-mm14-perguntas. */
  t("até duas respostas por turno; no máximo quatro pessoas por resposta", RESPOSTAS_DA_GENTE === 2 && PESSOAS_POR_RESPOSTA === 4);
  t("as perguntas têm id único", new Set(PERGUNTAS_DA_GENTE.map((p) => p.id)).size === PERGUNTAS_DA_GENTE.length);
  /* a rotina e a feira contam a MESMA semana */
  t("a folga cai na semana da feira (O_HOJE.semana)", AQUI.gente.every((p) => { const f = fichaDaPessoa(SEM, p, CTX); return f.rotina.folga >= 0 && f.rotina.folga < O_HOJE.semana; }));
}

/* ============================================================ */
sec("2. o determinismo");
{
  const a = AQUI.gente.map((p) => JSON.stringify(fichaDaPessoa(SEM, p, CTX)));
  const b = AQUI.gente.map((p) => JSON.stringify(fichaDaPessoa(SEM, { ...p }, { ...CTX })));
  t(`a mesma pessoa dá a mesma ficha (${a.length} pessoas)`, a.every((x, i) => x === b[i]));
  const outra = AQUI.gente.map((p) => JSON.stringify(fichaDaPessoa("Outro Mundo|Fantasia medieval", p, CTX)));
  t("outro mundo, outra vida (o passado muda com a semente)", outra.some((x, i) => x !== a[i]));
  const r1 = genteParaPauta(cena(pergunta(18))), r2 = genteParaPauta(cena(pergunta(18)));
  t("a mesma pergunta dá a mesma linha", JSON.stringify(r1) === JSON.stringify(r2) && r1.pergunta.length === 1);
  /* a hora muda o paradeiro e mais nada */
  const p = AQUI.gente[0];
  const f1 = fichaDaPessoa(SEM, p, { ...CTX, minuto: 3 * 60 }), f2 = fichaDaPessoa(SEM, p, { ...CTX, minuto: 13 * 60 });
  t("a hora muda o 'agora' e não a vida", JSON.stringify({ ...f1, rotina: null }) === JSON.stringify({ ...f2, rotina: null }));
}

/* ============================================================ */
sec("3. a palavra concorda com o retrato");
{
  /* 3000 chaves de retrato: a idade, a compleição e a marca têm de sair do
     mesmo sorteio que desenha a cara (semente.js) */
  let cabeloJovem = 0, grisalhoNovo = 0, fortesErrados = 0, marcasErradas = 0, total = 0, fora = 0;
  for (let i = 0; i < 3000; i++) {
    const chave = `npc|Pessoa ${i}|${i % 3 ? "ferreiro" : "capitão da guarda"}`;
    const f = fichaDaPessoa(SEM, { nome: `Pessoa ${i}`, papel: i % 3 ? "ferreiro" : "capitão da guarda", semente: chave }, CTX);
    const tr = tracos(chave), fe = feicoes(chave, {});
    const a = f.aparencia;
    total++;
    if (tr.cabelo === "#D8D8D8" && (a.idade.anos < 60 || /jovem/.test(a.idade.faixa))) cabeloJovem++;
    if (tr.cabelo === "#8C8C8C" && a.idade.anos < 45) grisalhoNovo++;
    const faixa = IDADE_PELO_CABELO[CABELO.indexOf(tr.cabelo)];
    if (a.idade.anos < faixa.de || a.idade.anos > faixa.ate || a.idade.cabelo !== faixa.cabelo) fora++;
    const comp = COMPLEICAO_PELO_QUEIXO.find((c) => fe.queixo < c.ate);
    if (comp.o !== a.compleicao || comp.forte !== a.forte) fortesErrados++;
    const m = MARCAS_DO_ROSTO[tr.marca] || null;
    if ((m ? m.o : null) !== (a.marca ? a.marca.o : null)) marcasErradas++;
  }
  t(`cabelo branco nunca é jovem (${total} retratos)`, cabeloJovem === 0, String(cabeloJovem));
  t("cabelo grisalho nunca tem menos de 45", grisalhoNovo === 0, String(grisalhoNovo));
  t("a idade fica dentro da faixa do cabelo, e o cabelo dito é o desenhado", fora === 0, String(fora));
  t("a compleição é a do maxilar desenhado", fortesErrados === 0, String(fortesErrados));
  t("a marca dita é a marca desenhada (ou nenhuma)", marcasErradas === 0, String(marcasErradas));
  /* a chave do retrato é a da ficha do registo quando há ficha */
  const p = DA_TAVERNA[0];
  const f = fichaDaPessoa(SEM, p, { ...CTX, npcs: NPCS });
  t("com ficha no registo, o retrato lido é o do registo (semente da ficha)", f.aparencia.idade.cabelo === IDADE_PELO_CABELO[CABELO.indexOf(tracos(NPCS[p.nome].semente).cabelo)].cabelo);
  /* o capitão de cabelo tingido é o mais velho que o cabelo deixa */
  const cap = fichaDaPessoa(SEM, { nome: "Zé", papel: "capitão da guarda" }, CTX);
  t("o ofício pede idade mínima, dentro da faixa do cabelo", cap.aparencia.idade.anos >= Math.min(17, IDADE_PELO_CABELO[CABELO.indexOf(tracos("Zé").cabelo)].ate));
}

/* ============================================================ */
sec("4. o registo manda na identidade");
{
  const p = AQUI.gente.find((x) => !/guarda|capit/.test(x.papel)) || AQUI.gente[0];
  const npcs = { [p.nome.toUpperCase()]: criarNPC(p.nome, { papel: "capitão da guarda", local: CIDADE.nome }) };
  const f = fichaDaPessoa(SEM, p, { ...CTX, npcs });
  t("o papel do registo ganha do papel da base", f.papel === "capitão da guarda" && f.familia === "armas");
  t("e a casa de trabalho continua a da base (o registo guarda a cidade)", f.casa === p.local);
  const sem = fichaDaPessoa(SEM, p, CTX);
  t("sem registo, o papel é o da base", sem.papel === p.papel);
  /* o que o registo não tem, a ficha acrescenta; o que tem, não toca */
  const fr = fichaDaPessoa(SEM, { nome: "Inventada Pelo Mestre" }, { ...CTX, npcs: { "Inventada Pelo Mestre": criarNPC("Inventada Pelo Mestre", { papel: "mestre das minas", local: CIDADE.nome }) } });
  t("quem o Narrador criou também tem ficha por dentro", fr.papel === "mestre das minas" && fr.aparencia.idade.anos > 0 && fr.passado.length >= 1 && !!fr.posto);
  /* o companheiro não ganha segunda biografia */
  const comp = fichaDaPessoa(SEM, { nome: DA_TAVERNA[0].nome }, { ...CTX, grupo: [{ nome: DA_TAVERNA[0].nome }] });
  t("o companheiro tem aparência e jeito, e nenhum passado, posto ou rotina", comp.noGrupo && comp.passado.length === 0 && comp.posto === null && comp.rotina === null && !!comp.aparencia && !!comp.jeito);
  const r = genteParaPauta(cena(`${DA_TAVERNA[0].nome}, há quanto tempo isso aconteceu?`, { grupo: [{ nome: DA_TAVERNA[0].nome }] }));
  t("e perguntar pelo passado dele não sobe nada", r.pergunta.length === 0);
}

/* ============================================================ */
sec("5. os mortos");
{
  const p = AQUI.gente[0];
  const base = matar(garantirBase(null), p.nome);
  const f = fichaDaPessoa(SEM, p, { ...CTX, base });
  t("quem a base riscou está morto(a) na ficha", f.morta && f.rotina.agora === "morreu");
  const npcs = { [p.nome]: criarNPC(p.nome, { papel: p.papel, status: "morto" }) };
  const g = fichaDaPessoa(SEM, p, { ...CTX, npcs });
  t("e quem o registo marcou como morto também", g.morta);
  const l = genteParaPauta(cena(`Onde anda ${p.nome}?`, { npcs, presentes: [] }));
  t("a rotina de um morto diz que morreu, nunca um turno", l.pergunta.length === 1 && /morreu/.test(l.pergunta[0]) && !/agora:/.test(l.pergunta[0]), l.pergunta[0]);
  /* a casa não lista quem morreu */
  const vivo = DA_TAVERNA[0];
  const casa = genteParaPauta(cena(pergunta(54), { base: matar(garantirBase(null), vivo.nome) }));
  t("quem trabalha numa casa não inclui os mortos", casa.pergunta.length === 1 && !casa.pergunta[0].includes(vivo.nome), casa.pergunta[0]);
  t("a aparência de um morto continua a ser a dele", JSON.stringify(f.aparencia) === JSON.stringify(fichaDaPessoa(SEM, p, CTX).aparencia));
}

/* ============================================================ */
sec("6. o passado cita o mundo que existe");
{
  const chefes = new Set(chefesDoMundo(SEM, MAPA, G).map((c) => c.nome));
  const bichos = new Set(MAPA.regioes.flatMap((r) => criaturasDaRegiao(SEM, r, G).map((c) => c.nome)));
  const cidades = new Set(MAPA.cidades.map((c) => c.nome));
  let citouChefe = 0, citouBicho = 0, citouCidade = 0, velhoDemais = 0, n = 0, advInventado = 0;
  for (const c of MAPA.cidades) {
    const q = oQueExisteAqui(SEM, MAPA, c.nome, null, G);
    for (const p of q.gente) {
      const f = fichaDaPessoa(SEM, p, { ...CTX, cidade: c.nome });
      n++;
      const tx = f.passado.map((x) => x.o).join(" ") + " " + (f.adversario ? f.adversario.nome : "");
      if ([...chefes].some((x) => tx.includes(x))) citouChefe++;
      if ([...bichos].some((x) => tx.includes(x))) citouBicho++;
      if ([...cidades].some((x) => tx.includes(x))) citouCidade++;
      for (const x of [...f.passado, f.adversario, f.posto].filter(Boolean)) if (x.ha && x.ha > f.aparencia.idade.anos - 14 && x.ha > 1) velhoDemais++;
      if (f.adversario && (FAMILIAS_DE_OFICIO.find((y) => y.id === f.familia).adversario === "chefe") && chefes.size && !chefes.has(f.adversario.nome) && !bichos.has(f.adversario.nome)) advInventado++;
    }
  }
  console.log(`      ${n} pessoas: citam um chefe ${citouChefe}, uma criatura ${citouBicho}, uma cidade ${citouCidade}`);
  t("o passado cita chefes, criaturas e cidades deste mundo", citouChefe > 0 && citouBicho > 0 && citouCidade > 0);
  t("nenhum acontecimento é mais antigo do que a idade aparente permite", velhoDemais === 0, String(velhoDemais));
  t("o adversário de quem luta é um chefe ou uma criatura do mundo", advInventado === 0, String(advInventado));
  const volta = AQUI.gente.map((p) => fichaDaPessoa(SEM, p, CTX)).filter((f) => f.passado.length === 2).length;
  t("só quem volta tem dois acontecimentos (figurante tem um)", volta > 0 && volta < AQUI.gente.length);
  const f = fichaDaPessoa(SEM, AQUI.gente[0], CTX);
  t("toda linha de passado tem data ou diz que nasceu ali", f.passado.every((x) => x.ha > 0 || /nasceu/.test(x.o)));
}

/* ============================================================ */
sec("7. as nove perguntas");
{
  for (const n of [18, 26, 29, 42, 54, 90, 103, 105, 106]) {
    const r = genteParaPauta(cena(pergunta(n)));
    console.log(`      #${n} ${pergunta(n)}\n         → ${r.pergunta[0] || "(nada)"}`);
    t(`#${n} sobe uma linha, e só uma`, r.pergunta.length === 1);
  }
  const l = (n, extra) => genteParaPauta(cena(pergunta(n), extra)).pergunta[0] || "";
  t("#18 e #42 respondem com data", /há \d+ anos?/.test(l(18)) && /adversário mais famoso foi .+, há \d+ anos?/.test(l(42)));
  t("#29 diz de onde vem a marca (ou que não há marca)", /: (a cicatriz é d|está ferido|não traz cicatriz)/.test(l(29)));
  t("#26 diz o motivo do posto", /está no posto há \d+ anos?: /.test(l(26)));
  t("#54 diz quem trabalha na casa, com o nome da casa", l(54).startsWith("quem trabalha") && DA_TAVERNA.every((p) => l(54).includes(p.nome)));
  t("#103 compara as idades de quem está em cena", /pela aparência: .+ o\(a\) mais novo\(a\) é /.test(l(103)));
  t("#105 diz o jeito e desde quando", /o jeito: .+ — (sempre foi assim|ficou assim há)/.test(l(105)));
  t("#106 diz a compleição", /compleição (franzina|esguia|mediana|robusta|larga e pesada)/.test(l(106)));
  /* #90: quem pergunta por quem falta recebe a casa, com quem folga */
  const noQuartel = genteParaPauta(cena(pergunta(90), { lugar: null, recentes: [], presentes: [] })).pergunta[0] || "";
  const quartel = AQUI.locais.find((x) => x.tipo === "quartel");
  t("#90 sem nome e sem casa: vai ao quartel da cidade, se houver", quartel ? noQuartel.includes(quartel.nome.replace(/^(o|a|os|as)\s+/i, "")) : true, noQuartel);
  /* o pronome segue o género: "ela" não aponta quem se sabe homem */
  const homem = DA_TAVERNA.find((p) => p.genero_pessoa === "homem"), mulher = DA_TAVERNA.find((p) => p.genero_pessoa === "mulher");
  if (homem && mulher) {
    const r = genteParaPauta(cena("Ela parecia forte?", { recentes: [`${homem.nome} serve. ${mulher.nome} ri.`] })).pergunta[0] || "";
    t("'ela' aponta a mulher citada, não o homem citado depois", r.startsWith(mulher.nome), r);
  }
  /* o nome dito ganha de quem está em cena */
  const outro = AQUI.gente.find((p) => p.local !== TAVERNA.nome);
  const nomeado = genteParaPauta(cena(`E o ${outro.nome}, que idade tem?`)).pergunta[0] || "";
  t("o nome dito na frase ganha de quem está em cena", nomeado.startsWith(outro.nome), nomeado);
}

/* ============================================================ */
sec("8. o custo: zero sem pergunta, e o teto com ela");
{
  const semPergunta = ["Pego a caneca e bebo.", "Ataco o bandido.", "Vou para o norte.", "", null];
  t("sem pergunta por gente, nada sobe", semPergunta.every((f) => genteParaPauta(cena(f)).pergunta.length === 0));
  t("pergunta pela cidade não é pergunta por gente", genteParaPauta(cena("Quanto custa a diária?")).pergunta.length === 0);
  let maior = 0;
  for (const c of CASOS) for (const r of genteParaPauta(cena(c.pergunta)).pergunta) maior = Math.max(maior, r.length);
  console.log(`      a maior linha nas 157 perguntas: ${maior} caracteres`);
  t("nenhuma linha passa de 200 caracteres", maior <= 200, String(maior));

  /* A TAVERNA CHEIA DE VERDADE — a mesma cena de teste-mm12-cidade, e as
     duas perguntas no mesmo turno: a do preço (cidade) e a do passado do
     taverneiro (gente). A cidade entra primeiro na secção, como o App a
     põe; a gente depois. */
  const g = geografoParaPauta({ espaco: { dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6, porte: "cidade" }, cidadeAtual: CIDADE.nome, mapa: MAPA, semente: SEM });
  let p = porNaPauta({}, "onde", g.onde);
  p = porNaPauta(p, "onde", envelopeDoComercio(CIDADE, 40));
  p = porNaPauta(p, "naoPode", g.naoPode);
  p = porNaPauta(p, "daqui", g.daqui);
  const [a, b] = DA_TAVERNA;
  const QUEM = `${a.nome}, o taverneiro, atrás do balcão; ${b ? b.nome : "Mira"}, entre as mesas`;
  p = porNaPauta(p, "quem", QUEM);
  p = porNaPauta(p, "momento", "a chegada: o herói acaba de pisar numa cidade que não conhece, e alguém ali já sabe o nome dele");
  p = porNaPauta(p, "gente", `${a.nome} limpa o mesmo copo há tempo demais e não tira os olhos da porta`, "a serviçal serve a mesa do canto e demora-se a ouvir a conversa", "um caravaneiro bêbado canta alto demais e desafina de propósito");
  p = porNaPauta(p, "fala", `${a.nome} disse: "Forasteiro? Paga adiantado."`);
  p = porNaPauta(p, "mundo", "a Ordem do Vácuo quer o porto e desconfia de você; a Casa Arden quer ouro e acha-o útil");
  p = porNaPauta(p, "antes", "há dois dias, aqui mesmo, você recusou o pedido da serviçal", `${a.nome} lembra-se de ter visto o seu rosto num cartaz`);
  const frase = `Quanto custa a diária? E há quanto tempo ${a.nome} está aqui?`;
  const cid = fichaParaPauta(CIDADE, { semente: SEM, mapa: MAPA, genero: G, dia: 40, minuto: 18 * 60 + 5, frase });
  const gen = genteParaPauta(cena(frase));
  const so = textoDaPauta(p);
  const soCidade = textoDaPauta(porNaPauta(porNaPauta(p, "cidade", cid.cidade), "pergunta", cid.pergunta));
  const comGente = textoDaPauta(porNaPauta(porNaPauta(porNaPauta(p, "cidade", cid.cidade), "pergunta", cid.pergunta), "pergunta", gen.pergunta));
  const soGente = textoDaPauta(porNaPauta(p, "pergunta", genteParaPauta(cena(pergunta(18))).pergunta));
  const soPassado = genteParaPauta(cena(pergunta(18))).pergunta;
  /* a folga que sobra a uma segunda resposta, com a do preço já dentro: o
     que fica do teto depois do cabeçalho e de tudo o que tem prioridade 4
     ou mais alta (a secção PERGUNTOU inclusive) */
  const cabeca = textoDaPauta({ onde: ["x"] }).length - "ONDE".padEnd(9).length - 2;
  let alto = 0;
  for (const s of SECOES) for (const [i, l] of (porNaPauta(p, "pergunta", cid.pergunta)[s.id] || []).entries()) if (s.prio + i * 0.1 <= 4) alto += l.length + 14;
  const folga = TETO_DA_PAUTA - cabeca - alto;
  const entrou = comGente.includes(gen.pergunta[0] || "\u0000");
  console.log(`      a taverna cheia: sem pergunta ${so.length} · com o preço ${soCidade.length} · só o passado ${soGente.length} · com os dois ${comGente.length} (teto ${TETO_DA_PAUTA})`);
  console.log(`      com o preço dentro, sobram ${folga} caracteres para uma segunda resposta; a do passado pede ${(gen.pergunta[0] || "").length + 14} — ${entrou ? "entrou" : "espera o turno seguinte"}`);
  t("sozinha, na taverna cheia, a resposta da gente entra", soPassado.length === 1 && soGente.includes(soPassado[0]));
  t("com as duas perguntas no mesmo turno, cabe no teto e a primeira da secção (o preço) entra",
    comGente.length <= TETO_DA_PAUTA && comGente.includes(cid.pergunta[0]) && gen.pergunta.length === 1);
  /* MEDIDO (29/09): a taverna cheia com a resposta do preço deixa 14
     caracteres; nenhuma linha de gente cabe ali. Não se encurta o preço
     nem se sobe o teto por isto: duas perguntas na mesma frase são raras,
     e a segunda ganha resposta no turno em que for repetida. Se esta
     asserção acender, o teto ou a taverna mudaram — releia a medida. */
  t("a segunda resposta só entra se couber na folga (medida, não suposta)", entrou === ((gen.pergunta[0] || "").length + 14 <= folga), `folga ${folga}`);
  t("e quem responde continua em cena, com o lugar, a fala, a batida e o veto",
    comGente.includes(QUEM) && comGente.includes(g.onde[0]) && comGente.includes("Paga adiantado") && /MOMENTO/.test(comGente) && /NÃO PODE/.test(comGente));
  /* o que a resposta tira é só o que vale menos do que ela (prio > 4) */
  const idx = (id) => SECOES.findIndex((x) => x.id === id);
  const prio = (id) => SECOES.find((x) => x.id === id).prio;
  const tirado = [], tiradoSo = [];
  for (const s of SECOES) for (const linha of (p[s.id] || [])) {
    if (soCidade.includes(linha) && !comGente.includes(linha) && prio(s.id) <= 4) tirado.push(s.id);
    if (so.includes(linha) && !soGente.includes(linha) && prio(s.id) <= 4) tiradoSo.push(s.id);
  }
  t("a resposta da gente não tira nada de prioridade 4 ou mais alta", tirado.length === 0 && tiradoSo.length === 0, [...tirado, ...tiradoSo].join(","));
  t("PERGUNTOU segue com a prioridade de QUEM, depois dela na lista", prio("pergunta") === 4 && idx("pergunta") > idx("quem"));
}

/* ============================================================ */
sec("9. lixo, null e imutabilidade");
{
  let erro = "";
  const lixo = [null, undefined, {}, { nome: "" }, { nome: "X" }, { nome: "Ninguém Conhecido", papel: 42 }, "texto", 42, [], { nome: "Y", status: null, local: {}, semente: 7 }];
  const ctxs = [undefined, null, {}, { mapa: "lixo", npcs: 5, base: "x", grupo: "y", dia: "x", minuto: "y" }, { mapa: { cidades: [null, 3, { regiao: "R" }], regioes: [null] }, npcs: { a: null } }];
  const fichas = [];
  for (const p of lixo) for (const c of ctxs) {
    try { fichas.push(fichaDaPessoa(SEM, p, c)); fichaDaPessoa(null, p, c); } catch (e) { erro = `${JSON.stringify(p)} / ${JSON.stringify(c)}: ${e.message}`; }
  }
  t("nenhum lixo derruba a ficha", !erro, erro);
  const campos = ["nome", "papel", "familia", "aparencia", "jeito", "passado", "rotina"];
  t("toda ficha tem os campos, mesmo a de lixo", fichas.every((f) => campos.every((k) => k in f) && f.aparencia.idade.anos > 0 && Array.isArray(f.passado)));
  const minima = fichaDaPessoa(SEM, null);
  t("a pessoa sem dados recebe a ficha mínima: sem papel, família comum, sem posto", minima.nome === "" && minima.familia === "comum" && minima.posto === null);
  let erroP = "";
  for (const c of [undefined, null, {}, { frase: 7 }, { frase: "quem trabalha ali?", mapa: "x", cidade: 3 }, { frase: "ela parecia forte?", presentes: [null, 3, { nome: "" }], recentes: "x", npcs: [] }, { ...cena("cadê o guarda de plantão?"), mapa: null }]) {
    try { const r = genteParaPauta(c); if (!Array.isArray(r.pergunta)) erroP = "sem pergunta[]"; } catch (e) { erroP = `${JSON.stringify(c).slice(0, 80)}: ${e.message}`; }
  }
  t("nenhum lixo derruba a pauta, e ela devolve sempre { pergunta: [] }", !erroP, erroP);
  /* MM14: a saída ganhou `em` (a posição de cada resposta na frase, para a
     mesa juntar as fichas pela ordem em que foram pedidas) — vazio no null */
  t("null não vai à pauta", JSON.stringify(genteParaPauta(null)) === JSON.stringify({ pergunta: [], em: [] }));
  t("um nome que ninguém conhece, sem ninguém em cena, não sobe nada", genteParaPauta({ ...cena("Há quanto tempo o Zebulão Inexistente está aqui?"), presentes: [], recentes: [], lugar: null }).pergunta.length === 0);

  const congela = (o) => { Object.freeze(o); for (const v of Object.values(o)) if (v && typeof v === "object") congela(v); return o; };
  const c = congela(JSON.parse(JSON.stringify(cena(pergunta(18)))));
  const pessoa = congela({ ...AQUI.gente[0] });
  let mudou = "";
  try { genteParaPauta(c); fichaDaPessoa(SEM, pessoa, c); } catch (e) { mudou = e.message; }
  t("o que se recebe não é tocado", !mudou, mudou);
}

/* ============================================================ */
sec("10. a fiação — pautaDoTurno chama genteParaPauta de verdade");
{
  /* Prova por texto, não por import: App.jsx é fiação (React), e esta suíte
     é de módulo puro. A mesma âncora e o mesmo corte por chave balanceada
     que teste-mm12-cidade.mjs usa para extrair o corpo de `pautaDoTurno` —
     nunca por número de linha, porque o arquivo muda sob os pés desta
     suíte. `\r\n` é normalizado para `\n` antes de qualquer teste. */
  const appPath = new URL("../src/App.jsx", import.meta.url);
  const app = fs.readFileSync(appPath, "utf8").replace(/\r\n/g, "\n");
  const anchor = "const pautaDoTurno = (";
  const i = app.indexOf(anchor);
  t("a âncora de pautaDoTurno existe no App.jsx de hoje", i >= 0);
  let corpo = "";
  if (i >= 0) {
    const j = app.indexOf("{", app.indexOf("=>", i));
    let depth = 0, k = j;
    for (; k < app.length; k++) {
      if (app[k] === "{") depth++;
      else if (app[k] === "}") { depth--; if (depth === 0) break; }
    }
    corpo = app.slice(i, k + 1);
  }
  t("o corpo de pautaDoTurno não está vazio", corpo.length > 2000);
  t("pautaDoTurno importa genteParaPauta de gente-por-dentro.js", /import\s*\{[^}]*\bgenteParaPauta\b[^}]*\}\s*from\s*"\.\/gente-por-dentro\.js"/.test(app));
  t("pautaDoTurno CHAMA genteParaPauta", /\bgenteParaPauta\s*\(/.test(corpo));
  /* MM14: a gente deixou de subir sozinha — a cidade, a gente e o mercado
     juntam-se numa mesa só (`juntarRespostas`, perguntas.js), pela ordem em
     que a frase pediu cada coisa. A asserção move-se com o motivo: ainda
     prova que `gp` chega à secção "pergunta", só que pela mesa, não sozinho. */
  t("e o resultado sobe pela mesa (com o da cidade e o do mercado) na secção \"pergunta\"",
    /porNaPauta\(p,\s*"pergunta",\s*juntarRespostas\(\[fc,\s*gp,\s*mc\]\)\)/.test(corpo));
  t("a chamada está guardada por calou (um órgão que estoura não derruba o turno)", /try\s*\{[^]*?genteParaPauta\s*\([^]*?\}\s*catch\s*\(e\)\s*\{\s*calou\("genteParaPauta"/.test(corpo));
  const iCidade = corpo.indexOf("fichaParaPauta(");
  const iGente = corpo.indexOf("genteParaPauta(");
  t("a chamada vem depois da de fichaParaPauta (a cidade primeiro, a gente depois)", iCidade >= 0 && iGente > iCidade);
}

console.log(`\nMM8a · a gente por dentro: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
