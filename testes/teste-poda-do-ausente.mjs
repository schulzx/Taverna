/* teste-poda-do-ausente.mjs — S7b (17/11/2026): a cena é verdade.

   A prova jogada de 16/11 (IA real) viu a tela e a prosa concordarem em 5
   de 7 lugares; o resto era o Narrador a trazer gente por conta própria:
     · «Morgane Mão-Torta», a taverneira da noite, posta NOUTRO sítio, entrou
       e falou na Casa do Calafate em 2 de 14 turnos — até na resposta a
       «Quem está aqui comigo?»;
     · fora da cidade, «um vulto baixo» que, perguntado, se batizou «Fendrel»;
     · o retrato de Merek preso em «EM CENA» no mercado, depois de o herói
       sair da oficina onde falara com ele.

     1. a poda: as frases reais — o ausente que entra, a etiqueta da fala, o
        morto que acena; a fala colada vai junto;
     2. menção não é presença: 25 contraexemplos que ficam;
     3. as travas: o limiar e a única fala de uma pergunta — não poda, veta;
     4. o veto vai ao livro do Juiz e à pauta do turno seguinte;
     5. o batismo: o nome é do sistema, antes do Narrador;
     6. o retrato preso: a fala do Mestre leva o sítio, e o «à vista» só lê
        as deste sítio;
     7. a fiação: o App poda depois da resposta, batiza antes do Narrador e
        passa o sítio à entrega — cada uma num calou;
     8. a medida: as 198 narrações gravadas, com o estado de cada uma —
        CATRACA: 0 podas (o falso positivo custa a cena). */
import { readFileSync, readdirSync } from "node:fs";
import { PODA_DO_AUSENTE, osAusentes, podarOAusente, vetoDoAusente } from "../src/motor/poda-do-ausente.js";
import { O_BATISMO, perguntaONome, oBatismo } from "../src/motor/o-batismo.js";
import { quemEstaAqui, ondeDaCena, falasDoMestreAqui } from "../src/quem-esta-aqui.js";
import { aEntrega } from "../src/motor/entrega-do-turno.js";
import { andarOsVetos, vetosParaAPauta } from "../src/motor/correcao-do-juiz.js";
import { aFichaDeAtor } from "../src/motor/ficha-de-ator.js";
import { estadoNoTurno } from "../src/sessao.js";
import { oQueExisteAqui } from "../src/mundo-base.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log(`  ✓ ${nome}`); } else { mal++; console.log(`  ✗ ${nome}${extra ? `\n      ${extra}` : ""}`); } };
const sec = (s) => console.log(`\n${s}`);
const J = (x) => JSON.stringify(x);

/* a Casa do Calafate: a Isolde no posto, o Bran no grupo; a Morgane é a
   taverneira da noite d'A Lanterna Torta; o Aldo morreu */
const Q = { aqui: [{ nome: "Bran" }], longe: [{ nome: "Ivo Sal-Grosso", laFora: "Ponte Rasa" }], doSitio: [{ nome: "Isolde Calafate", rotulo: "calafate" }], doPasso: [], noSitio: true, fora: false, grupo: ["Bran"] };
const GENTE = [
  { nome: "Morgane Mão-Torta", local: "A Lanterna Torta", papel: "taverneira da noite" },
  { nome: "Merek Torno", local: "Oficina do Torno", papel: "torneiro" },
  { nome: "Isolde Calafate", local: "Casa do Calafate", papel: "calafate" },
];
const NPCS = { "Aldo Quebra-Remo": { nome: "Aldo Quebra-Remo", status: "morto" }, "Bran": { nome: "Bran", relacao: "companheiro" } };
const CTX = { gente: GENTE, npcs: NPCS, heroi: { nome: "Vera" }, lugar: { nome: "Casa do Calafate" } };
const AUS = osAusentes(Q, CTX);
const poda = (txt, frase = "", aus = AUS) => podarOAusente(txt, aus, { frase, turno: 9, outros: ["Isolde Calafate", "Bran"] });

sec("0. quem o sistema sabe noutro lugar");
{
  const nomes = AUS.map((a) => a.nome);
  t("o longe, a gente da base de outro sítio e o morto são candidatos", ["Ivo Sal-Grosso", "Morgane Mão-Torta", "Merek Torno", "Aldo Quebra-Remo"].every((n) => nomes.includes(n)), J(AUS));
  t("quem está (o posto, o grupo, o herói) nunca é", !nomes.includes("Isolde Calafate") && !nomes.includes("Bran") && !nomes.includes("Vera"));
  t("o morto vai marcado, e o de outro sítio leva o sítio", AUS.find((a) => a.nome === "Aldo Quebra-Remo").morto && AUS.find((a) => a.nome === "Morgane Mão-Torta").onde === "A Lanterna Torta");
  t("lixo não estoura (null, número, string)", J(osAusentes(null, null)) === "[]" && J(osAusentes(7, "x")) === "[]");
}

sec("1. a poda — as frases reais da prova de 16/11");
{
  const r1 = poda("A chuva bate no telhado da Casa do Calafate. Morgane Mão-Torta entra pela porta dos fundos, sacudindo a água do xale. Isolde ergue os olhos do cordame e não diz nada. O cheiro de breu e de sal enche a casa inteira, e as redes penduradas nas vigas balançam devagar com o vento que entra pelas frestas.");
  t("«Morgane Mão-Torta entra pela porta…» sai; o resto fica", !/Morgane/.test(r1.narrativa) && /A chuva bate/.test(r1.narrativa) && /Isolde ergue/.test(r1.narrativa) && !r1.recusou, J(r1));
  const r2 = poda("Isolde aponta o banco ao pé do fogo, sem largar o cordame.\n— Não quero conversa — diz Morgane, e vai direto ao balcão.\nO fogo estala, e a maré bate nas estacas lá embaixo.");
  t("«— Não quero conversa — diz Morgane» sai, a linha inteira", !/Morgane|conversa/.test(r2.narrativa) && /Isolde aponta/.test(r2.narrativa) && /O fogo estala/.test(r2.narrativa), J(r2.narrativa));
  const r3 = poda("Além de você, só a Isolde, curvada sobre o casco virado, a lixar a quilha com areia molhada. — Ainda não terminei — ela resmunga, sem levantar a cabeça. O vento assobia pelas frestas. Morgane se aproxima com uma caneca fumegante. — Bebe, que a noite é longa.\nO cheiro do alcatrão enche a casa.", "Quem está aqui comigo?");
  t("a resposta a «Quem está aqui comigo?»: Morgane e a fala dela saem; a Isolde e a fala dela ficam", !/Morgane|Bebe/.test(r3.narrativa) && /Ainda não terminei/.test(r3.narrativa) && /alcatrão/.test(r3.narrativa) && !r3.recusou, J(r3.narrativa));
  const r4 = poda("A porta range. Aldo Quebra-Remo acena da soleira, o remo partido ao ombro. Isolde ergue a lixa e continua o trabalho. O cheiro de breu e de sal enche a casa inteira, e as redes penduradas nas vigas balançam devagar com o vento que entra pelas frestas.");
  t("o morto que acena sai (motivo: morreu)", !/Aldo/.test(r4.narrativa) && r4.podadas[0].morto, J(r4));
  const r5 = poda("Isolde vira o casco com um gemido de madeira. Morgane entra e diz:\n— Ninguém me avisou que tinha visita.\nA lamparina treme no gancho, e a sombra do casco cresce na parede.");
  t("«Morgane entra e diz:» leva a linha de fala que abre", !/Morgane|visita/.test(r5.narrativa) && /lamparina/.test(r5.narrativa), J(r5.narrativa));
  const r6 = poda("O casco cheira a breu fresco, e a Isolde passa o pano nas juntas com cuidado. Merek Torno, de avental, examina a quilha e resmunga baixinho. Lá fora, a maré sobe devagar.");
  t("o torneiro da oficina não age na Casa do Calafate (o primeiro nome casa)", !/Merek/.test(r6.narrativa) && r6.podadas.length === 1, J(r6));
  const r7 = poda("Isolde pousa o martelo e esfrega as mãos no avental gasto, olhando o céu. Morgane sorri do canto, a caneca esquecida na mão. A noite cai sobre o cais.");
  t("o primeiro nome sozinho basta quando ninguém mais o leva («Morgane sorri»)", !/Morgane/.test(r7.narrativa), J(r7.narrativa));
  t("a resposta podada nunca muta a de entrada (é cópia)", typeof r1.narrativa === "string" && r1.podadas.every((p) => typeof p.frase === "string"));
}

sec("2. menção não é presença — os contraexemplos ficam");
{
  const fica = [
    "Você pensa na taverna de Morgane, do outro lado do porto.",
    "Dizem que Morgane serve o melhor grogue da cidade.",
    "Morgane não aparece hoje, diz Isolde, a enrolar o cabo.",
    "Isolde enrola a tira de couro de Morgane no pulso.",
    "— Morgane? Saiu cedo — diz Isolde.",
    "— A Morgane entra sempre ao pôr do sol — conta Isolde, sem parar a lixa.",
    "Se Morgane entrar agora, vai haver briga.",
    "Isolde lembra que Morgane entra sempre pela porta dos fundos.",
    "Uma canção sobre Morgane sobe do cais.",
    "Isolde entra com o cordame às costas.",
    "Bran ri alto e estende a caneca.",
    "Vera olha o casco virado e sorri.",
    "Você procura Morgane pelo salão, mas só vê redes.",
    "Ninguém viu Morgane desde ontem.",
    "O martelo de Merek ecoa da oficina ao lado.",
    "Morgane Mão-Torta, a taverneira da noite, é conhecida em todo o porto.",
    "Pela janela, você vê a placa da Lanterna Torta, onde Morgane serve.",
    "Morgane, dizem, já não sai de casa.",
    "O nome de Morgane corre de boca em boca pelo cais.",
    "A chuva bate nas telhas e o fogo estala no canto.",
    "Isolde fala de Aldo Quebra-Remo, que o mar levou no inverno.",
    "— Merek entra no turno da noite — avisa Isolde.",
    "Você sente falta de Morgane e do grogue quente dela.",
    "Merek nunca aparece por aqui antes do meio-dia.",
    "Com Morgane longe, a Casa do Calafate fica mais calma.",
  ];
  const caem = fica.filter((x) => poda(x).podadas.length);
  t(`${fica.length} frases de menção, 0 podadas`, fica.length >= 25 && caem.length === 0, J(caem));
  const naFrase = poda("Morgane entra pela porta, a capa ensopada.", "Procuro Morgane Mão-Torta");
  t("quem o jogador nomeou na frase ele foi procurar: a prosa sobre ela não se poda", !naFrase.podadas.length);
  const homonimo = osAusentes({ ...Q, doSitio: [...Q.doSitio, { nome: "Morgane Ruiva" }] }, CTX);
  t("o primeiro nome de quem está não é de ninguém de fora (Morgane Ruiva no posto)", !homonimo.some((a) => a.nome === "Morgane Mão-Torta"));
  const prot = osAusentes(Q, { ...CTX, protegidos: ["Morgane Mão-Torta"] });
  t("o nome protegido (deus, vilão, lugar) nunca é candidato", !prot.some((a) => a.nome === "Morgane Mão-Torta"));
  const comp = osAusentes({ ...Q, grupo: [] }, { ...CTX, gente: [...GENTE, { nome: "Bran Quilha", local: "As Docas" }] });
  t("o companheiro do registo anda com o herói (a Saoirse da 10.ª)", !comp.some((a) => /^Bran/.test(a.nome)));
  t("o «o taverneiro» minúsculo não é o «Taverneiro Gris» da base", !poda("O taverneiro limpa copos.", "", [{ nome: "Taverneiro Gris", onde: "A Lanterna", morto: false }]).podadas.length);
  t("lixo não estoura e não poda", J(podarOAusente(null, AUS).podadas) === "[]" && podarOAusente("Morgane entra.", null).narrativa === "Morgane entra.");
}

sec("3. as travas — não poda, só veta");
{
  const so = poda("Morgane Mão-Torta entra, sacode o xale e senta-se ao pé do fogo. — Que frio — diz ela.");
  t(`mais de ${PODA_DO_AUSENTE.limiar * 100} % do texto: a prosa passa como veio, e o veto vai`, so.recusou === "limiar" && so.narrativa.includes("Morgane") && so.vetos.length === 1, J(so));
  const unica = poda("Isolde não tira os olhos do casco, a lixar a mesma tábua há horas, com a paciência de quem não espera ninguém. O vento sopra pelas frestas e a lamparina dança no gancho. A maré bate nas estacas lá embaixo, ritmada. Morgane se aproxima do balcão. — Ninguém, só nós.", "Quem está aqui?");
  t("a única fala de uma resposta a pergunta não se corta: não poda, veta", unica.recusou === "unica-fala" && unica.narrativa.includes("Ninguém, só nós") && unica.vetos.length === 1, J(unica));
  const semPergunta = poda("Isolde não tira os olhos do casco, a lixar a mesma tábua há horas, com a paciência de quem não espera ninguém. O vento sopra pelas frestas e a lamparina dança no gancho. A maré bate nas estacas lá embaixo, ritmada. Morgane se aproxima do balcão. — Ninguém, só nós.", "Lixo a tábua com ela.");
  t("…e sem pergunta a mesma fala sai", !semPergunta.recusou && !/Morgane/.test(semPergunta.narrativa));
}

sec("4. o veto vai ao livro do Juiz e à pauta do turno seguinte");
{
  const r = poda("O casco cheira a breu. Morgane Mão-Torta entra pela porta dos fundos. Isolde ergue os olhos do cordame, a lixa parada na mão.");
  const v = r.vetos[0];
  t("o veto tem o formato do livro (especie, alvo, linha, toques, prazo)", v.especie === PODA_DO_AUSENTE.especie && v.alvo === "ausente:morgane mao-torta" && v.ate === 9 + PODA_DO_AUSENTE.vida && v.toques.includes("morgane"), J(v));
  t("a linha é a do veto de quem não está (a ficha do ator já a traduz)", v.linha === "pôr a agir ou a falar quem não está nesta cena: Morgane Mão-Torta (ficou em A Lanterna Torta)", v.linha);
  const livro = andarOsVetos([], r.vetos, { turno: 9 });
  t("…e o turno seguinte leva-a à pauta", vetosParaAPauta(livro, { turno: 10, frase: "" }).some((l) => /Morgane Mão-Torta/.test(l)));
  const fz = aFichaDeAtor({ frase: "Olho em volta.", nota: `ONDE      na Casa do Calafate\nNÃO PODE  ${v.linha}`, estado: { personagem: { nome: "Vera" } } });
  t("a ficha do ator diz «Morgane Mão-Torta não está aqui: ficou em A Lanterna Torta.»", fz.partes["AS FRONTEIRAS"].includes("Morgane Mão-Torta não está aqui: ficou em A Lanterna Torta."), J(fz.partes["AS FRONTEIRAS"]));
  const vm = vetoDoAusente({ nome: "Aldo Quebra-Remo", morto: true }, 3);
  t("o morto: «…: Aldo Quebra-Remo; morreu», e a ficha lê-o como ausente", vm.linha.endsWith("Aldo Quebra-Remo; morreu") && aFichaDeAtor({ frase: "x", nota: `NÃO PODE  ${vm.linha}`, estado: { personagem: { nome: "Vera" } } }).partes["AS FRONTEIRAS"].includes("Aldo Quebra-Remo não está aqui."));
  t(`no máximo ${PODA_DO_AUSENTE.porTurno} vetos por resposta`, poda("Morgane entra. Merek entra. Ivo Sal-Grosso entra. Aldo Quebra-Remo entra. Isolde lixa a quilha devagar, como faz há anos, sem pressa nenhuma de terminar, e a maré sobe no cais.").vetos.length === PODA_DO_AUSENTE.porTurno);
}

sec("5. o batismo — o nome é do sistema, antes do Narrador");
{
  const sim = ["Como você se chama?", "Qual o seu nome?", "Quem é você?", "E tu, como te chamas?", "Me diga seu nome, estranho.", "Pergunto ao vulto: qual é o teu nome?", "Como é que você se chama?"];
  const nao = ["Qual o nome desta taverna?", "Quem é aquele homem?", "Como se chama esta cidade?", "Pergunto pelo nome do capitão.", "Digo meu nome a ele.", "Vou até a Casa do Calafate.", ""];
  t("as perguntas do nome", sim.every(perguntaONome), J(sim.filter((x) => !perguntaONome(x))));
  t("…e o que não é pergunta do nome (a coisa, o terceiro)", !nao.some(perguntaONome), J(nao.filter(perguntaONome)));
  const fora = { aqui: [], longe: [], doSitio: [], doPasso: [], noSitio: false, fora: true, grupo: ["Bran"] };
  const ctx = { quem: fora, semente: "Prova|Fantasia medieval", cidade: "Porto Sal", lugar: "Pedras do Vau", dia: 4, genero: "Fantasia medieval", heroi: "Vera", usados: ["Bran"], generoDaProsa: "homem" };
  const b = oBatismo("Como você se chama?", ctx);
  t("fora da cidade, ninguém com nome: o sistema escala o figurante (nome, ofício, género)", b && b.nome && b.rotulo === O_BATISMO.oficios.fora[0] && b.genero === "homem" && b.local === "Pedras do Vau", J(b));
  t("determinístico: a mesma semente dá o mesmo nome", J(oBatismo("Qual o seu nome?", ctx)) === J(b));
  t("a linha vai ao naoPode: o Narrador diz este nome", b.linha === O_BATISMO.linha(b.nome, b.rotulo) && b.linha.includes(b.nome));
  t("a ficha é a do registo (papel, género, sítio, desconhecido, o dia do encontro)", b.ficha.papel === b.rotulo && b.ficha.local === "Pedras do Vau" && b.ficha.relacao === "desconhecido" && b.ficha.conhecidoEm === 4);
  t("o nome não repete o primeiro nome de quem o mundo já tem", !oBatismo("Como você se chama?", { ...ctx, usados: [b.nome] }) || oBatismo("Como você se chama?", { ...ctx, usados: [b.nome] }).nome.split(" ")[0] !== b.nome.split(" ")[0]);
  t("a mulher que a prosa apresentou é batizada mulher", oBatismo("Quem é você?", { ...ctx, generoDaProsa: "mulher" }).genero === "mulher");
  t("com alguém com nome no posto, ninguém se batiza", oBatismo("Como você se chama?", { ...ctx, quem: { ...fora, fora: false, noSitio: true, doSitio: [{ nome: "Isolde Calafate" }] } }) === null);
  t("com alguém com nome à vista na tela, também não", oBatismo("Como você se chama?", { ...ctx, aVista: ["Merek Torno"] }) === null);
  t("o grupo não conta (já tem nome)", !!oBatismo("Como você se chama?", { ...ctx, quem: { ...fora, aqui: [{ nome: "Bran" }] } }));
  t("sem a pergunta, nada", oBatismo("Olho o vulto de perto.", ctx) === null);
  /* depois de batizado, o figurante está no registo, no sítio do herói — a
     conta única põe-no em cena, e a segunda pergunta já não batiza */
  const estado = { npcs: { [b.nome]: { ...b.ficha } }, cidadeAtual: "Porto Sal", lugar: { nome: "Pedras do Vau", distancia: "arredores" }, lugares: [{ nome: "Pedras do Vau", onde: "arredores" }], grupo: [{ nome: "Bran" }] };
  const q2 = quemEstaAqui(estado);
  t("o batizado entra em cena pela conta única (quem-esta-aqui.js)", q2.fora && q2.aqui.some((n) => n.nome === b.nome), J(q2));
  t("…e a segunda pergunta não batiza outro", oBatismo("Como você se chama?", { ...ctx, quem: q2 }) === null);
  t("lixo não estoura", oBatismo(null, null) === null && oBatismo("Quem é você?", null) !== undefined);
}

sec("6. o retrato preso — a fala do Mestre leva o sítio");
{
  const oficina = ondeDaCena({ cidadeAtual: "Porto Sal", lugar: { nome: "Oficina do Torno" } });
  const mercado = ondeDaCena({ cidadeAtual: "Porto Sal", lugar: { nome: "O Mercado de Cordas" } });
  t("o sítio numa chave (a cidade e o lugar, sem artigo nem acento)", oficina === "porto sal|oficina do torno||" && mercado === "porto sal|mercado de cordas||", J([oficina, mercado]));
  const e = aEntrega({ narrativa: "Merek pousa a lima.", msgs: [], portao: [], onde: oficina });
  t("a entrega dá à fala do Mestre o campo `onde`", e.linhas[0].onde === oficina);
  t("sem `onde`, a linha é a de sempre, byte a byte", J(aEntrega({ narrativa: "x", msgs: ["y"], portao: [] }).linhas) === J([{ autor: "mestre", texto: "x" }, { autor: "sistema", texto: "y" }]));
  const msgs = [{ autor: "mestre", texto: "Merek pousa a lima e encara você.", onde: oficina }, { autor: "jogador", texto: "Vou ao mercado." }, { autor: "mestre", texto: "As bancas do mercado gritam preços.", onde: mercado }];
  t("no mercado, o «à vista» só lê a fala do mercado (Merek sai)", J(falasDoMestreAqui(msgs, mercado, 2)) === J(["As bancas do mercado gritam preços."]));
  t("na oficina, as duas falas antigas sem sítio contam (o save de antes)", falasDoMestreAqui([{ autor: "mestre", texto: "a" }, { autor: "mestre", texto: "b" }], oficina, 2).length === 2);
  t("lixo não estoura", J(falasDoMestreAqui(null, "")) === "[]" && typeof ondeDaCena(null) === "string");
}

sec("7. a fiação — no App, cada uma num calou");
{
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const iPoda = app.indexOf("S7b (17/11): A PODA DO AUSENTE");
  const iMestre = app.indexOf("let resp = pedidoDoAtor ? await chamarOAtor");
  const iSessao = app.indexOf("narrador: JSON.parse(JSON.stringify({ narrativa: resp.narrativa");
  t("a poda corre logo depois da resposta e antes de a sessão a gravar e o turno a aplicar", iMestre > 0 && iPoda > iMestre && iSessao > iPoda);
  t("…dentro de um calou, e o veto entra no livro do Juiz", /calou\("S7b · a poda do ausente"/.test(app) && /pd\.vetos\.length\) vetosDoJuizRef\.current = andarOsVetos/.test(app));
  t("o batismo corre antes do Narrador (no começo do turno) e vai ao naoPode", /calou\("S7b · o batismo"/.test(app) && /naoPodeDoTurnoRef\.current = \[\.\.\.\(naoPodeDoTurnoRef\.current \|\| \[\]\), bt\.linha\]/.test(app));
  t("a entrega leva o sítio da fala, e a tela e a pauta leem as falas do sítio", /aEntrega\(\{ narrativa: resp\.narrativa, msgs, portao: portaoRef\.current, onde: ondeDaFala \}\)/.test(app)
    && /falasDoMestreAqui\(mensagensRef\.current, ondeDaCena/.test(app));
}

sec("8. a medida nas narrações gravadas (o estado de antes de cada turno)");
{
  const D = new URL(".", import.meta.url);
  let turnos = 0, podadas = 0;
  const recusas = [], podas = [];
  for (const f of readdirSync(D).filter((x) => /^sessao-.*\.json$/.test(x)).sort()) {
    let A; try { A = JSON.parse(readFileSync(new URL(f, D), "utf8")); } catch { continue; }
    if (!Array.isArray(A.turnos)) continue;
    const m = A.mundo || {};
    A.turnos.forEach((L, i) => {
      const nar = L && L.narrador && L.narrador.narrativa;
      if (typeof nar !== "string" || !nar.trim()) return;
      turnos++;
      let e = {}; try { e = estadoNoTurno(A, i); } catch { e = {}; }
      let gente = [];
      try { gente = (oQueExisteAqui(m.semente, e.mapa, e.cidadeAtual, e.baseMundo, m.genero || undefined, m.molde || null, m.lexico || null) || {}).gente || []; } catch { gente = []; }
      const q = quemEstaAqui({ npcs: e.npcs, cidadeAtual: e.cidadeAtual, mapa: e.mapa, grupo: (e.personagem || {}).grupo || [], masmorra: e.masmorra, jornada: e.jornada, lugar: e.lugar, lugares: (L.entrada || {}).lugaresDaqui || [], gente: e.lugar ? gente : [] });
      const r = podarOAusente(nar, osAusentes(q, { gente, npcs: e.npcs, heroi: e.personagem, lugar: e.lugar }), { frase: (L.entrada || {}).frase || "", turno: i + 1 });
      if (!r.podadas.length) return;
      if (r.recusou) recusas.push(`${f}#${i + 1} ${r.podadas[0].nome} (${r.recusou}: ${r.podadas.length} frases)`);
      else { podadas += r.podadas.length; podas.push(`${f}#${i + 1} ${r.podadas.map((p) => p.nome + ": " + p.frase.slice(0, 80)).join(" | ")}`); }
    });
  }
  console.log(`      ${turnos} narrações; frases podadas: ${podadas}; achadas e não podadas (só veto): ${recusas.length}${recusas.length ? " — " + recusas.join("; ") : ""}`);
  /* a única achada é a Helga da 10.ª (#55): o registo dela diz Monte Rasa e a
     cena é no Rossio Torto — é a mordida que a poda quer —, mas a resposta
     inteira é ela, e a trava do limiar deixa a prosa passar e só veta. */
  t(`CATRACA: ${turnos} narrações gravadas, 0 frases podadas (o falso positivo custa a cena)`, turnos >= 190 && podadas === 0, podas.join("\n      "));
}

console.log(`\na poda do ausente (S7b): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
