/* teste-custo-onda3.mjs — a onda 3 do custo do turno (14/10/2026)

   A mensagem do turno é cobrada cheia toda jogada. A onda 2 fechou portas
   inteiras; esta pergunta "está em jogo?" DENTRO das listas que entravam
   sempre (src/relevancia.js). Medido nos 201 pedidos reais das 8.ª a 10.ª
   sessões (o bloco de 14/10 em mente/diario.md):
     · a GENTE DA CIDADE ia inteira (15 pessoas, ~1,8 mil caracteres), com o
       mesmo quem-é-quem das PESSOAS CONHECIDAS para quem o herói conhece;
     · o CÂNONE ia inteiro, e as MASMORRAS todas quando a porta abria;
     · os ESCONDERIJOS de toda a cidade — e na 9.ª (s9 8) o Narrador contou
       o segredo de outro prédio a quem perguntou "o que está escondido aqui?";
     · o bloco da GENTE EM CENA ia em 98% dos turnos e a linha que ele ensina
       a cumprir só estava em 26%;
     · e a porta do acampamento nunca abria (`cenaDoPrompt` sem `acampado`).
   Mensagem do turno: mediana 20.872 → 18.866 caracteres; nenhuma pessoa do
   registo citada numa narração perdeu a linha (0/305).

   Falha na árvore de antes (v9.471): `relevancia.js` não existe, a lista de
   pessoas não tem relevância, o cânone não tem relevância, `resumoDaqui` não
   lê `relevancia`/`onde`/`jaDitos`, a porta `gente` não lê `genteNaPauta` e
   o App não manda `acampado`. */
import fs from "node:fs";
const RL = await import("../src/relevancia.js");
const P = await import("../src/prompt.js");
const N = await import("../src/npcs.js");
const MB = await import("../src/mundo-base.js");
const EL = await import("../src/elenco.js");
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok ", nome); } else { mal++; console.log("  XX ", nome); } };
const sec = (s) => console.log(`\n${s}`);

sec("1. A TABELA E O TEXTO DO TURNO");
{
  t("a tabela tem os tetos que a medida escolheu", RL.RELEVANCIA.citaveis.pessoas === 4 && RL.RELEVANCIA.citaveis.chars === 700 && RL.RELEVANCIA.masmorrasPerto === 3);
  t("a gente curta leva povo, ofício e traço", JSON.stringify(RL.RELEVANCIA.camposDaGenteCurta) === JSON.stringify(["raca", "papel", "traco"]));
  const tx = RL.textoDoTurno("Falo com Nyla, a carcereira!", ["Vou à Forja"], null);
  t("o texto vira palavras sem acento, com espaço nas pontas", tx === " falo com nyla a carcereira vou a forja ");
  t("cita pelo primeiro nome (como a narração chama)", RL.citaNome(tx, "Nyla Punho-de-Pedra"));
  t("cita pelo nome inteiro", RL.citaNome(RL.textoDoTurno("Procuro Nyla Punho-de-Pedra"), "Nyla Punho-de-Pedra"));
  t("o título não é nome: \"sargenta\" não cita a Sargenta Barbaforte", !RL.citaNome(RL.textoDoTurno("a sargenta chegou"), "Sargenta Barbaforte"));
  t("o epíteto depois da vírgula cita", RL.citaNome(RL.textoDoTurno("o Sem-Rosto enterrou lá"), "Magnus da Torre, o Sem-Rosto"));
  t("com primeiro: false, só o nome inteiro (a Fenda não é a Fenda de Raízes)", !RL.citaNome(RL.textoDoTurno("uma fenda na rocha"), "Fenda de Raízes", { primeiro: false }) && RL.citaNome(RL.textoDoTurno("a Fenda de Raízes"), "Fenda de Raízes", { primeiro: false }));
  t("palavra dentro de palavra não cita (\"Ana\" em \"cabana\")", !RL.citaNome(RL.textoDoTurno("a cabana"), "Ana"));
  t("lixo não estoura", RL.citaNome(null, "x") === false && RL.citaNome(" a ", null) === false);
  const r = RL.relevanciaDoTurno({ frase: "Falo com Helga", nota: "PAUTA", recentes: "", fio: ["Dragão Ancião o Rei Emprestado"], emJogo: [{ nome: "Saoirse" }, "Godfrey da Foz", null], lugares: ["Monte Rasa", "A Alfândega do Norte", ""], carrega: ["Medalha de visitante"] });
  t("o retrato do turno é congelado e tem o fio no texto", Object.isFrozen(r) && r.texto.includes(" rei emprestado ") && r.frase === " falo com helga pauta ");
  t("em jogo e lugares normalizados, sem artigo e sem vazios", r.emJogo.join("|") === "saoirse|godfrey da foz" && r.lugares.join("|") === "monte rasa|alfandega do norte");
  const vazio = RL.relevanciaDoTurno(null);
  t("a entrada nula dá um retrato vazio, nunca erro", vazio.texto.trim() === "" && vazio.emJogo.length === 0);
}

sec("2. AS PESSOAS CONHECIDAS PELO LUGAR E PELA MISSÃO");
{
  const rel = RL.relevanciaDoTurno({ frase: "Pergunto a Helga pelo caminho", emJogo: ["Saoirse", "Godfrey da Foz"] });
  t("sem relevância, toda a gente está em jogo (o de antes)", RL.pessoaEmJogo("Qualquer Um", null) === true);
  t("em jogo pelo grupo/aqui", RL.pessoaEmJogo("Godfrey da Foz", rel));
  t("em jogo porque o turno a cita", RL.pessoaEmJogo("Helga", rel));
  t("fora do jogo quem ninguém pôs na cena", !RL.pessoaEmJogo("Torvald da Urze", rel));
  const cit = RL.citaveis(["a", "b", "c", "d", "e", "f"], () => "x".repeat(100));
  t("os citáveis param nas 4 pessoas", cit.size === 4 && cit.has("a") && !cit.has("e"));
  const caro = RL.citaveis(["a", "b", "c"], (x) => (x === "a" ? "y".repeat(800) : "y".repeat(100)));
  t("e no teto de caracteres (quem não cabe passa a vez)", !caro.has("a") && caro.has("b") && caro.has("c"));
  const npcs = {
    "Saoirse": { nome: "Saoirse", papel: "companheira", relacao: "companheiro", local: "Monte Rasa", ultimaVez: 9, conhecidoEm: 0 },
    "Godfrey da Foz": { nome: "Godfrey da Foz", papel: "taverneiro", relacao: "neutro", local: "Monte Rasa", ultimaVez: 8, conhecidoEm: 1, notas: "escamas verdes" },
    "Helga": { nome: "Helga", papel: "atendente", local: "Monte Rasa", ultimaVez: 7, conhecidoEm: 1, notas: "melancólica" },
    "Torvald da Urze": { nome: "Torvald da Urze", papel: "vendedor de ervas", relacao: "amigo", local: "Nova Profundo", ultimaVez: 5, conhecidoEm: 1 },
  };
  for (let i = 0; i < 8; i++) npcs[`Longe ${i}`] = { nome: `Longe ${i}`, papel: "mercador", relacao: "aliado", local: "Torre Rasa", ultimaVez: 1, conhecidoEm: 2 };
  const ctx = { grupo: [{ nome: "Saoirse" }] };
  const antes = N.resumoNPCsParaPrompt(npcs, undefined, ctx);
  const depois = N.resumoNPCsParaPrompt(npcs, undefined, { ...ctx, relevancia: rel });
  t("sem relevância, a lista de sempre (toda a gente com investimento)", ["Saoirse", "Godfrey da Foz", "Torvald da Urze", "Longe 7"].every((n) => antes.includes(`• ${n}`)));
  t("com relevância, quem está em jogo fica", ["Saoirse", "Godfrey da Foz", "Helga"].every((n) => depois.includes(`• ${n}`)));
  const longes = depois.split("\n").filter((l) => /^• (Torvald|Longe)/.test(l)).length;
  t(`dos outros, só o punhado dos citáveis (${longes})`, longes === 4);
  t("e quem está em jogo vem primeiro", depois.indexOf("• Helga") < depois.indexOf("• Torvald da Urze") || !depois.includes("• Torvald da Urze"));
  t("\"relação: neutro\" calado como o \"desconhecido\" (FIGURANTE.relacoesSemPeso)", !antes.includes("relação: neutro") && antes.includes("relação: amigo"));
  t("ninguém em jogo e ninguém investido: a lista vazia não estoura", N.resumoNPCsParaPrompt({}, undefined, { relevancia: rel }) === "");
}

sec("3. O CÂNONE PELA RELEVÂNCIA — quatro portas, e uma basta");
{
  const rel = RL.relevanciaDoTurno({ frase: "Pergunto pelo Relicário de pedra escura", fio: ["Dragão Ancião o Rei Emprestado"], emJogo: ["Saoirse"], lugares: ["Nova clara"], carrega: ["Medalha de visitante"] });
  const C = {
    "Monte Rasa": { tipo: "lugar", local: "Monte Rasa" },
    "Medalha de visitante": { tipo: "artefato", local: "Monte Rasa" },
    "Rei Emprestado": { tipo: "segredo", local: "Monte Rasa" },
    "Relicário de pedra escura": { tipo: "artefato", local: "Rossio Torto, Nova Profundo" },
    "Bastião de Pedra Torta": { tipo: "lugar", local: "oeste de Nova clara" },
    "Fiandeira": { tipo: "pessoa", local: "sul de Nova Profundo" },
    "Saoirse": { tipo: "pessoa", local: "Monte Rasa", notas: "monge" },
    "Nova clara": { tipo: "lugar" },
  };
  const em = (n) => RL.canoneEmJogo(n, C[n], rel);
  t("1. o turno cita pelo nome", em("Relicário de pedra escura"));
  t("1. o antagonista do fio nunca sai (s10 63: \"o Rei Emprestado\" na boca da capanga)", em("Rei Emprestado"));
  t("2. o do lugar: o local dele é onde o herói está", em("Bastião de Pedra Torta"));
  t("2. e o próprio lugar", em("Nova clara"));
  t("3. a pessoa em jogo", em("Saoirse"));
  t("4. o que o herói carrega", em("Medalha de visitante"));
  t("o resto fica no registo, fora deste turno", !em("Monte Rasa") && !em("Fiandeira"));
  t("sem relevância, tudo (o Cronista e o Arquivista leem o cânone inteiro)", RL.canoneEmJogo("Fiandeira", C.Fiandeira, null));
  const todo = P.formatarCanone(C);
  const filtrado = P.formatarCanone(C, { relevancia: rel });
  t("formatarCanone sem relevância é o de sempre", ["Monte Rasa", "Fiandeira"].every((n) => todo.includes(`• ${n}`)));
  t("formatarCanone com relevância leva só o que está em jogo", filtrado.includes("• Relicário de pedra escura") && filtrado.includes("• Rei Emprestado") && !filtrado.includes("• Fiandeira") && !filtrado.includes("• Monte Rasa —"));
  t("e cada linha sai como sempre saiu, caractere por caractere", filtrado.split("\n").every((l) => todo.split("\n").includes(l)));
}

sec("4. AS MASMORRAS, A GENTE E OS ESCONDERIJOS DA CIDADE");
{
  const mms = [{ nome: "Gruta Sangue Velho", h: 2.42 }, { nome: "Poço de Silêncio", h: 4 }, { nome: "Veio Silêncio", h: 3.25 }, { nome: "O Prumo de Vidro", h: 8 }, { nome: "Alicerces de Espinhos", h: 8 }, { nome: "Ossuário Sangue Velho", h: 4 }];
  const rel = RL.relevanciaDoTurno({ frase: "Pergunto pelo caminho até O Prumo de Vidro" });
  const r = RL.masmorrasEmJogo(mms, rel, (m) => m.h);
  t("a citada entra, mesmo longe", r.ficam.some((m) => m.nome === "O Prumo de Vidro"));
  t("e as três mais perto", ["Gruta Sangue Velho", "Veio Silêncio", "Poço de Silêncio"].every((n) => r.ficam.some((m) => m.nome === n)));
  t("o resto vira +N", r.fora === 2 && r.ficam.length === 4);
  t("na ordem do mundo", r.ficam.map((m) => m.nome).join("|") === "Gruta Sangue Velho|Poço de Silêncio|Veio Silêncio|O Prumo de Vidro");
  t("sem relevância, todas", RL.masmorrasEmJogo(mms, null).ficam.length === 6);
  const p = { nome: "Isen", raca: "humano", papel: "taverneiro(a)", traco: "corajoso", modo: "aperta a mão", vontade: "quer ir embora", local: "A Moeda Enferrujada" };
  const de = (o) => RL.comoDizerAGente(p, RL.relevanciaDoTurno(o));
  t("inteira quando o turno a cita", de({ recentes: "Isen limpa o balcão" }) === "inteira");
  t("inteira no prédio onde o herói está", de({ lugares: ["Monte Rasa", "A Moeda Enferrujada"] }) === "inteira");
  t("inteira quando a frase diz o prédio dela (s8 10: \"vou até A Serpente & o Elmo\")", de({ frase: "Vou até A Moeda Enferrujada" }) === "inteira");
  t("inteira quando a frase diz o ofício dela (\"falo com o taverneiro\")", de({ frase: "Falo com o taverneiro" }) === "inteira");
  t("curta pela cidade", de({ frase: "Olho a praça", lugares: ["Monte Rasa"] }) === "curta");
  /* a prova viva achou: a raiz de seis letras ("tavern") abria a taverneira toda vez que a pauta dizia "taverna" */
  t("a taverna não é a taverneira (a raiz é a palavra sem a vogal do gênero)", de({ frase: "Entro na taverna" }) === "curta" && de({ frase: "Chamo a taverneira" }) === "inteira");
  t("sem relevância, inteira", RL.comoDizerAGente(p, null) === "inteira");
  t("o registo diz o resto: só sai o que a linha ainda não diz", JSON.stringify(RL.partesNaoDitas(["humano", "atendente", "melancólico", "não olha nos olhos"], "• Helga (atendente, em Monte Rasa) — melancólico; quer x")) === JSON.stringify(["humano", "não olha nos olhos"]));
  t("sem linha, todas as partes", RL.partesNaoDitas(["a", "b"], "").length === 2);

  const mapa = { cidades: [{ nome: "Monte Rasa", x: 10, y: 10, porte: "cidade", regiao: "Campos do Corvo" }, { nome: "Nova clara", x: 14, y: 10, porte: "vila", regiao: "Campos do Corvo" }], regioes: [{ nome: "Campos do Corvo" }] };
  const q = MB.oQueExisteAqui(42, mapa, "Monte Rasa", null, "Fantasia medieval");
  const sempre = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval");
  t("o mundo de prova tem gente, esconderijo e baú", q.gente.length >= 6 && q.segredos.length >= 1 && q.tesouros.length >= 1);
  t("sem relevância, o bloco de sempre (onde e jaDitos não mexem sem ela)", MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { onde: { lugar: "", foraDosMuros: false }, jaDitos: new Map() }) === sempre);
  const noPredio = q.gente[0].local;
  const relRua = RL.relevanciaDoTurno({ frase: "Olho a praça", lugares: ["Monte Rasa"] });
  const relPredio = RL.relevanciaDoTurno({ frase: "Olho em volta", lugares: ["Monte Rasa", noPredio] });
  const rua = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { relevancia: relRua, onde: { lugar: "", dentroDe: "", foraDosMuros: false } });
  const predio = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { relevancia: relPredio, onde: { lugar: noPredio, dentroDe: "", foraDosMuros: false } });
  const p0 = q.gente[0];
  t("na rua, a gente vai curta — nome, povo, ofício e traço", rua.includes(`${p0.nome} (${p0.raca}, `) && !rua.includes(p0.vontade));
  t("e continua toda lá (são estas as pessoas da cidade)", q.gente.every((g) => rua.includes(g.nome)));
  t("no prédio dela, inteira", predio.includes(`${p0.nome} — ${p0.raca}, `) && predio.includes(p0.vontade));
  t("o bloco encolhe", rua.length < sempre.length);
  t("na rua, nenhum esconderijo (a régua do achavelAqui: a rua não é o assoalho de ninguém)", !/Escondido/.test(rua));
  const seg = q.segredos[0];
  const noSeg = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { relevancia: relPredio, onde: { lugar: seg.local, dentroDe: "", foraDosMuros: false } });
  t("no prédio do esconderijo, ele está lá (o que se pode achar aqui)", noSeg.includes(`em ${seg.local}: ${seg.o}`));
  t("dentro dos muros, nenhum baú do ermo", !/Enterrado no ermo/.test(rua));
  const fora = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { relevancia: relRua, onde: { lugar: "", dentroDe: "", foraDosMuros: true } });
  t("fora dos muros, o baú do ermo, e nenhum segredo de prédio", /Enterrado no ermo/.test(fora) && !/Escondido/.test(fora));
  t("e o achado lê a mesma régua", MB.achavelAqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", "percepcao", null, null, { lugar: "", dentroDe: "", foraDosMuros: false }) === null);
  const helga = q.gente[1];
  const jaDitos = P.linhasJaDitas(`• ${helga.nome} (${helga.papel}, em Monte Rasa) — ${helga.traco}; quer ${helga.vontade}`);
  const dita = MB.resumoDaqui(42, mapa, "Monte Rasa", null, "Fantasia medieval", null, null, { relevancia: relRua, onde: null, jaDitos });
  t("quem as PESSOAS CONHECIDAS já dizem vai só com o que falta (cada fato uma vez)", dita.includes(`${helga.nome} — ${helga.raca}`) && !dita.includes(`${helga.nome} — ${helga.raca}, ${helga.papel}`));
}

sec("5. A GENTE POR CONHECER DAQUI");
{
  const lista = [{ nome: "Nesa", cidade: "Nova clara" }, { nome: "Orla", cidade: "Torre Rasa" }, { nome: "Gareth", cidade: "Monte Rasa" }, { nome: "Dahlia", cidade: "Monte Rasa" }];
  const rel = RL.relevanciaDoTurno({ frase: "Pergunto por Orla" });
  const r = RL.genteParaPovoarAqui(lista, rel, "Monte Rasa", ["Dahlia"]);
  t("só quem é daqui, ou o turno cita, e sem repetir a gente da cidade", r.map((p) => p.nome).join("|") === "Orla|Gareth");
  t("sem relevância, a lista inteira (menos a repetida)", RL.genteParaPovoarAqui(lista, null, "Monte Rasa", ["Dahlia"]).length === 3);
  t("lixo não estoura", RL.genteParaPovoarAqui(null, rel, null, null).length === 0);
  const mapa = { cidades: [{ nome: "Monte Rasa", x: 10, y: 10, porte: "cidade", regiao: "Campos do Corvo" }, { nome: "Nova clara", x: 14, y: 10, porte: "vila", regiao: "Campos do Corvo" }], regioes: [{ nome: "Campos do Corvo" }] };
  const povo = EL.elencoParaPovoar(42, mapa, { genero: "Fantasia medieval", dia: 99, cidade: "Monte Rasa", npcs: {} });
  t("o elenco por conhecer diz a cidade de cada um", povo.length > 0 && povo.every((p) => typeof p.cidade === "string"));
}

sec("6. AS PORTAS: A GENTE EM CENA E O ACAMPAMENTO");
{
  const pa = P.portasAbertas;
  t("com gente e a linha A GENTE na pauta, o bloco entra", pa({ temGente: true, genteNaPauta: true }).gente === true);
  t("com gente e sem a linha, não (98% dos turnos tinham gente; 26% a linha)", pa({ temGente: true, genteNaPauta: false }).gente === false);
  t("sem o campo (fora de um turno), a porta de antes", pa({ temGente: true }).gente === true && pa({ temGente: false }).gente === false);
  t("o PORTE continua a ler só a gente", pa({ temGente: true, genteNaPauta: false }).porte === true);
  t("acampado, o acampamento abre", pa({ acampado: true }).acampamento === true);
}

sec("7. A FIAÇÃO NO APP");
{
  t("o App importa a relevância", /import \{ relevanciaDoTurno, genteParaPovoarAqui \} from "\.\/relevancia\.js";/.test(APP));
  t("os refs do turno nascem vazios (fora do save)", /const relevanciaRef = useRef\(null\); const genteNaPautaRef = useRef\(null\); const genteDaquiRef = useRef\(\[\]\);/.test(APP) && !/relevancia: relevanciaRef\.current, npcs:/.test(APP));
  t("a cena manda o acampamento (o defeito que a onda 2 achou) e a linha A GENTE", /acampado: !!acampadoRef\.current, genteNaPauta: genteNaPautaRef\.current,/.test(APP));
  t("a relevância nasce junto dos sinais, em try/calou, e cai em null", /relevanciaRef\.current = relevanciaDoTurno\(\{ frase: conteudo, nota,/.test(APP) && /calou\("a relevância do turno", e\); relevanciaRef\.current = null;/.test(APP));
  t("a linha A GENTE é lida na pauta deste turno", /genteNaPautaRef\.current = \/\^A GENTE\\s\/m\.test\(String\(pauta \|\| ""\)\);/.test(APP));
  t("as pessoas do turno montam-se uma vez, com a relevância, antes do rodapé", /npcsDoTurno = resumoNPCsParaPrompt\([^\n]*relevancia: relevanciaRef\.current \}\);/.test(APP) && APP.indexOf("npcsDoTurno = resumoNPCsParaPrompt(") < APP.indexOf("const rodape = `[RODAPÉ DO SISTEMA]"));
  t("e o system leva essas mesmas", /npcsDoTurno != null \? npcsDoTurno : resumoNPCsParaPrompt\(/.test(APP));
  t("o O QUE EXISTE recebe a relevância, o onde e as linhas já ditas", /relevancia: relevanciaRef\.current, onde: \(\(\) => \{ try \{ return ondeSeProcura\(\); \}[^\n]*jaDitos: \(\(\) => \{ try \{ return linhasJaDitas\(npcsDoTurno \|\| ""\);/.test(APP));
  t("a gente por conhecer passa pela de daqui", /return genteParaPovoarAqui\(povo, relevanciaRef\.current, cidadeAtualRef\.current, genteDaquiRef\.current\);/.test(APP));
  t("o cânone do turno recebe a relevância", /\{ npcs: npcsRef\.current, elenco: nomesDoElenco\(\), relevancia: relevanciaRef\.current \}/.test(APP));
  t("o export da relevância tem leitores fora do módulo (a catraca)", ["citaNome", "textoDoTurno", "pessoaEmJogo", "citaveis", "canoneEmJogo", "masmorrasEmJogo", "comoDizerAGente", "partesNaoDitas"].every((f) => typeof RL[f] === "function"));
}

console.log(`\n${ok} ok, ${mal} falharam`);
process.exit(mal ? 1 : 0);
