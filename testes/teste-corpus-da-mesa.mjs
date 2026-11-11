/* teste-corpus-da-mesa.mjs (Fase EM, EM1 · 10/11/2026) — «a taxa de dado
   por intenção, como catraca».

   O estudo do Mestre (mente/estudo-do-mestre.md, L1) contou: numa mesa a
   sério o dado sai em ~1 de cada 4 declarações fora da luta, e a chance
   depende do que se tenta. O nosso catálogo, sem contexto, tornava teste 10%
   das nossas frases — e errava para os dois lados. Esta suíte é a régua que
   não deixa o catálogo aprender só os erros da última sessão: as 439 frases
   que o jogador escreveu nas sessões de prova 1–18, rotuladas à mão uma a
   uma (testes/corpus-da-mesa.json; a régua do rótulo está no próprio
   arquivo), correm pelo `lerAcao` com o contexto mínimo que o jogo lhe daria
   — quem é gente conhecida (`ehPessoaConhecida`) — e a agressão à frente,
   como na mesa.

   Três catracas e uma conferência:
     · INTENÇÃO certa (o desafio, ou «sem dado») — piso, não desce;
     · PERÍCIA certa quando a frase pede teste — piso, não desce;
     · FALSOS «pede dado» (o dado que a frase não pedia, o lado caro) —
       teto, não sobe;
     · a TAXA DE DADO POR INTENÇÃO, nas categorias onde a comparação é
       justa, a ±15 pontos da que o estudo contou.

   Quando um número melhorar, sobe-se o piso (ou desce-se o teto) para o
   novo valor, com a data — e é só para esse lado que ele anda. */
import fs from "node:fs";
import { lerAcao, DESAFIOS, EXAMINAR_A_COISA, ehExameDaCoisa, PISTA_DO_RASTRO } from "../src/desafios.js";
import { periciaPorId } from "../src/pericias.js";
import { ehDeclaracaoDeAtaque } from "../src/agressao.js";
import { porQueNaoChama, SABER_COMUM } from "../src/motor/o-mestre-chama.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const CORPUS = JSON.parse(fs.readFileSync(new URL("./corpus-da-mesa.json", import.meta.url), "utf8"));

/* ---------------- AS CATRACAS ----------------
   Contagens inteiras sobre as 439 frases, para a conta não arredondar.
   Antes da Fase EM (o catálogo de 54331a8, com o mesmo contexto):
   intenção 389, perícia 43 em 78, falsos «pede dado» 11 em 361.
   Depois das lacunas da EM1 (10/11/2026): 413, 58 em 78, 2 em 361. */
const CATRACA_DO_CORPUS = {
  intencao: 413,      /* piso — frases com a intenção certa */
  pericia: 58,        /* piso — frases de teste com a perícia certa */
  falsosPedeDado: 2,  /* teto — frases sem teste a que o catálogo deu dado */
};

/* ---------------- A TAXA DO MATT ----------------
   Origem: estudo do Mestre, CRD3, contagem (mente/estudo-do-mestre.md §2 e
   L1; a semente em número no scratchpad do estudo). 159 episódios, fora da
   luta: a fração das declarações de cada categoria seguidas de um pedido de
   teste nas três falas seguintes do Mestre. Só números — nenhuma frase do
   programa entra no projeto. */
const TAXA_DO_MATT = {
  procurar: { taxa: 0.428, declaracoes: 846 },
  esgueirar: { taxa: 0.404, declaracoes: 339 },
  ler_pessoa: { taxa: 0.513, declaracoes: 199 },
  lembrar: { taxa: 0.342, declaracoes: 234 },
  arcano: { taxa: 0.255, declaracoes: 404 },
  forcar: { taxa: 0.308, declaracoes: 738 },
  equilibrar: { taxa: 0.389, declaracoes: 95 },
  rastrear: { taxa: 0.568, declaracoes: 95 },
  socorrer: { taxa: 0.28, declaracoes: 193 },
  furtar_mao: { taxa: 0.39, declaracoes: 59 },
  convencer: { taxa: 0.194, declaracoes: 67 },
  intimidar: { taxa: 0.286, declaracoes: 35 },
  enganar: { taxa: 0.252, declaracoes: 103 },
  atuar: { taxa: 0.209, declaracoes: 43 },
  animal: { taxa: 0.233, declaracoes: 129 },
  perguntar: { taxa: 0.268, declaracoes: 5198 },
  outro: { taxa: 0.231, declaracoes: 9892 },
};

/* A categoria de uma frase, pelas palavras — a mesma régua que o estudo usou
   do lado de cá (a primeira que casa decide). É de propósito INDEPENDENTE do
   catálogo: mede a intenção pela palavra, não pelo que o catálogo fez dela. */
const INTENCAO_PELA_PALAVRA = [
  ["socorrer", /\b(estanc|enfaix|curativo|torniquete|cuido d|feridas?\b|socorr|sangr|desmaiad|ca[íi]d[oa]\b)/i],
  ["rastrear", /\b(rast|pegadas|pistas? d|sigo as marcas|sigo o|por onde (foi|foram)|ca[çc]o\b|navego)/i],
  ["lembrar", /\b(o que sei|lembro|recordo|conhe[çc]o|j[áa] ouvi|ouvi falar|reconhe[çc]o|sei (algo|alguma coisa)|hist[óo]ria d)/i],
  ["arcano", /\b(m[áa]gic|arcan|runa|s[íi]mbolo|feiti[çc]|encanta|ritual|aura|sigilo)/i],
  ["ler_pessoa", /\b(mente\b|mentindo|confio|sincer|inten[çc][ãa]o|leio (o|a|seu|sua)|percebo se|desconfi|esconde algo)/i],
  ["intimidar", /\b(amea[çc]|intimid|assust|ou eu|ou ent[ãa]o|encosto a l[âa]mina)/i],
  ["enganar", /\b(minto|mentir|blef|fin(jo|gir)|disfar|engan|fa[çc]o-me passar|me fa[çc]o passar|forj)/i],
  ["convencer", /\b(convenc|persuad|negoci|pechinch|barganh|implor|pe[çc]o com jeito|desconto|seduz|argument)/i],
  ["furtar_mao", /\b(gazua|arromb|furt|roubo|surrupi|desarm|bato a carteira|abro a fechadura)/i],
  ["esgueirar", /\b(esgueir|escond|furtiv|sorrateir|em sil[êe]ncio|sem ser visto|sem fazer barulho|nas sombras)/i],
  ["forcar", /\b(escal|subo|salto|pulo|ergo|levanto|empurr|for[çc]o|arrebent|derrub|chuto a porta|nado|agarro|puxo|arrasto|quebro|rompo)/i],
  ["equilibrar", /\b(equilibr|esquiv|rolo\b|me contor|escapo|deslizo|me espremo)/i],
  ["atuar", /\b(canto|toco (o|a|um|uma) (ala[úu]de|flauta|can[çc][ãa]o)|dan[çc]o|recito|declamo|atuo)/i],
  ["animal", /\b(cavalo|montaria|monto|animal|c[ãa]o\b|lobo|bicho)/i],
  ["procurar", /\b(procur|examin|vasculh|investig|inspecion|olho (em volta|ao redor|bem|com aten)|observo|reviro|escuto|vigio|busco|analis|estudo)/i],
  ["perguntar", /\?/],
];
const intencaoDe = (frase) => { for (const [k, rx] of INTENCAO_PELA_PALAVRA) if (rx.test(frase)) return k; return "outro"; };

/* ---------------- ONDE A COMPARAÇÃO É JUSTA ----------------
   `confere`: a taxa do catálogo tem de cair a ±`tolerancia` da do Matt.
   As de fora, com o porquê — medidas e impressas, não catraca:
     · outro e perguntar: do lado de lá, um terço dos dados vem sem ação
       declarada (o Mestre oferece: 37%, estudo §2 linha 6). Isso é a oferta
       da cena (EM5/MC6), não a frase; o catálogo lê só a frase;
     · socorrer: as nossas frases são, na maioria, as variantes do momento
       do socorro da 18.ª (a planta MC) — sangue a correr, e o rótulo à mão
       dá teste a 8 em 11. Uma amostra plantada não se compara com 159
       episódios;
     · ler_pessoa: a palavra apanha «confio», «intenção» em fala; o rótulo
       à mão dá teste a 2 em 9 — a categoria, aqui, é quase toda conversa;
     · as de menos de `minimo` frases: ±15 pontos numa amostra de 5 é o
       acaso a falar. */
const CONFERENCIA_DO_MATT = {
  tolerancia: 0.15,
  minimo: 8,
  foraPorque: {
    outro: "a oferta espontânea (EM5), não a frase",
    perguntar: "a oferta espontânea (EM5), não a frase",
    socorrer: "amostra plantada no momento da 18.ª",
    ler_pessoa: "a palavra apanha conversa; o rótulo à mão dá 2 em 9",
  },
};

/* ---------------- O CONTEXTO QUE O JOGO DARIA ---------------- */
const nrm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const CONHECIDOS = (CORPUS.conhecidos || []).map((n) => new RegExp("\\b" + nrm(n) + "\\b"));
const ehPessoaConhecida = (txt) => { const x = nrm(txt); return CONHECIDOS.some((rx) => rx.test(x)); };
const CTX = {
  personagem: { nivel: 1, inventario: [], habilidades: [], equipado: {} },
  semente: "corpus-da-mesa", lugar: "Largo do Cereal", tentativas: {}, dia: 1, ehPessoaConhecida,
};

/* o rótulo, e a perícia que ele rola */
const FAMILIA_PERICIA = { intelecto: "saberes", percepcao: "percepcao", presenca: "persuasao", vigor: "fortitude", destreza: "acrobacia", forca: "atletismo" };
const SEM_TESTE = ["conversa", "mover", "livre", "atacar", "naoSePede"];
const SEM_DADO = ["conversa", "mover", "livre"];
const ehTeste = (r) => !!r && !SEM_TESTE.includes(r);
const grosso = (r) => (r == null || SEM_DADO.includes(r) ? "semDado" : r);
const periciaDoRotulo = (r) => (!r ? "" : r.startsWith("imp_") ? FAMILIA_PERICIA[r.slice(4)] || "" : (DESAFIOS.find((d) => d.id === r) || {}).pericia || "");

/* A leitura da mesa: a agressão primeiro, depois o catálogo. `pede`: o dado
   sai — o veredito é teste e nenhuma linha de QUANDO_O_MESTRE_CHAMA o cala
   por não haver dado (a conversa cala o chamado, mas rola pela escada do
   pedido). `pericia` é a do veredito: a via e a pista mandam nela. */
const ROLA_MESMO_SEM_CHAMADO = [null, "conversa"];
function lerNaMesa(frase) {
  let atk = false;
  try { atk = ehDeclaracaoDeAtaque(frase, { nomes: [] }); } catch { atk = false; }
  if (atk) return { rot: "atacar", pede: false, pericia: "" };
  let v = null;
  try { v = lerAcao(frase, CTX); } catch { v = null; }
  if (!v) return { rot: null, pede: false, pericia: "" };
  if (v.tipo === "teste") {
    let rot = v.id;
    if (v.id === "improviso") { const p = String(v.chave || "").split("|"); rot = "imp_" + p[p.indexOf("improviso") + 1]; }
    return { rot, pede: ROLA_MESMO_SEM_CHAMADO.includes(porQueNaoChama(v, {})), pericia: v.pericia || "" };
  }
  return { rot: v.tipo === "naoSePede" ? "naoSePede" : "livre", pede: false, pericia: "" };
}

/* ---------------- A MEDIDA ---------------- */
const medida = { n: 0, intencao: 0, nTeste: 0, pericia: 0, nSemTeste: 0, falsosPedeDado: 0, perdidos: 0 };
const porCategoria = {};
const erros = [];
for (const e of CORPUS.frases) {
  const r = lerNaMesa(e.frase);
  medida.n++;
  if (grosso(e.rotulo) === grosso(r.rot)) medida.intencao++;
  else erros.push(`${e.rotulo} → ${r.rot} · s${e.sessao} · ${e.frase.slice(0, 90)}`);
  if (ehTeste(e.rotulo)) {
    medida.nTeste++;
    if (r.pede && r.pericia === periciaDoRotulo(e.rotulo)) medida.pericia++;
    if (!r.pede) medida.perdidos++;
  } else {
    medida.nSemTeste++;
    if (r.pede) medida.falsosPedeDado++;
  }
  const c = intencaoDe(e.frase);
  const o = (porCategoria[c] = porCategoria[c] || { n: 0, dado: 0, rotulo: 0 });
  o.n++;
  if (r.pede) o.dado++;
  if (ehTeste(e.rotulo)) o.rotulo++;
}
const pc = (x) => (100 * x).toFixed(1) + "%";

sec("1. o corpus é o que diz ser");
{
  t(`${CORPUS.frases.length} frases reais`, CORPUS.frases.length === 439);
  t("toda frase tem sessão, fonte e rótulo", CORPUS.frases.every((e) => Number.isInteger(e.sessao) && e.fonte && e.rotulo && e.frase));
  const vocab = new Set([...DESAFIOS.map((d) => d.id), ...Object.keys(FAMILIA_PERICIA).map((f) => "imp_" + f), ...SEM_TESTE]);
  const fora = [...new Set(CORPUS.frases.map((e) => e.rotulo).filter((r) => !vocab.has(r)))];
  t(`todo rótulo é do vocabulário fechado (os desafios, as famílias do improviso, os sem teste)${fora.length ? " — fora: " + fora.join(", ") : ""}`, fora.length === 0);
  t("nenhuma frase repetida", new Set(CORPUS.frases.map((e) => e.frase)).size === CORPUS.frases.length);
  t("a gente conhecida está no corpus (o contexto que o jogo daria)", CONHECIDOS.length > 20);
}

sec("2. as catracas");
console.log(`     intenção ${medida.intencao}/${medida.n} (${pc(medida.intencao / medida.n)}) · perícia ${medida.pericia}/${medida.nTeste} (${pc(medida.pericia / medida.nTeste)}) · falsos «pede dado» ${medida.falsosPedeDado}/${medida.nSemTeste} · testes perdidos ${medida.perdidos}/${medida.nTeste}`);
t(`a intenção certa não desce de ${CATRACA_DO_CORPUS.intencao}`, medida.intencao >= CATRACA_DO_CORPUS.intencao, `${medida.intencao}`);
t(`a perícia certa não desce de ${CATRACA_DO_CORPUS.pericia}`, medida.pericia >= CATRACA_DO_CORPUS.pericia, `${medida.pericia}`);
t(`os falsos «pede dado» não sobem de ${CATRACA_DO_CORPUS.falsosPedeDado}`, medida.falsosPedeDado <= CATRACA_DO_CORPUS.falsosPedeDado, `${medida.falsosPedeDado}`);
if (process.env.CORPUS_ERROS) console.log(erros.map((x) => "       " + x).join("\n"));

sec("3. a taxa de dado por intenção, contra a do Matt");
{
  const C = CONFERENCIA_DO_MATT;
  t("toda categoria da régua tem a taxa do estudo", INTENCAO_PELA_PALAVRA.every(([k]) => TAXA_DO_MATT[k]) && !!TAXA_DO_MATT.outro);
  for (const [k, o] of Object.entries(porCategoria).sort((a, b) => b[1].n - a[1].n)) {
    const m = TAXA_DO_MATT[k];
    const taxa = o.dado / o.n;
    const linha = `${k}: ${o.dado}/${o.n} = ${pc(taxa)} (à mão ${pc(o.rotulo / o.n)}) · Matt ${pc(m.taxa)}`;
    const porque = C.foraPorque[k] || (o.n < C.minimo ? `só ${o.n} frases` : "");
    if (porque) { console.log(`   ·  ${linha} — fora: ${porque}`); continue; }
    t(linha, Math.abs(taxa - m.taxa) <= C.tolerancia + 1e-9);
  }
  /* EM3: a pergunta de facto sobre a cena não se rola — o estudo dá ~90% sem
     dado (SABER_COMUM.alvo.factoSemDado); a frase que é só pergunta, aqui */
  const p = porCategoria.perguntar || { n: 0, dado: 0 };
  t(`as perguntas de facto sem dado: ${p.n - p.dado}/${p.n} (${pc((p.n - p.dado) / (p.n || 1))}), o estudo pede ≥ ${pc(SABER_COMUM.alvo.factoSemDado)}`, p.n > 0 && (p.n - p.dado) / p.n >= SABER_COMUM.alvo.factoSemDado);
  const conferidas = Object.entries(porCategoria).filter(([k, o]) => !C.foraPorque[k] && o.n >= C.minimo);
  t(`ao menos quatro categorias conferidas (${conferidas.map(([k]) => k).join(", ")})`, conferidas.length >= 4);
}

sec("4. as lacunas que o estudo e o classificador acharam (EM1)");
{
  /* frases novas, escritas para a regra — o corpus prova o conjunto, estas
     provam cada linha */
  const c = { ...CTX, ehPessoaConhecida: (x) => /lourdes/i.test(x) };
  const ve = (f) => lerAcao(f, c);
  const casa = (f, id, pericia) => { const v = ve(f); return !!v && v.tipo === "teste" && v.id === id && (!pericia || v.pericia === pericia); };
  const naoRola = (f, id) => { const v = ve(f); return !v || v.tipo !== "teste" || (id && v.id !== id); };
  t("a pista do rasto: a tabela tem o chão e a coisa, cada um com uma perícia da ficha",
    PISTA_DO_RASTRO.length === 2 && PISTA_DO_RASTRO.every((p) => p.pista && p.rx instanceof RegExp && periciaPorId(p.pericia)));
  t("pegadas na lama → rastrear com Sobrevivência", casa("vou atrás das pegadas na lama", "rastrear", "sobrevivencia"));
  t("gotas de sangue → rastrear com Investigação", casa("sigo as gotas de sangue até ao beco", "rastrear", "investigacao"));
  t("arranhões na parede → rastrear com Investigação", casa("sigo os arranhões na parede do corredor", "rastrear", "investigacao"));
  t("sem pista dita, a do desafio (Sobrevivência)", casa("Sigo o rasto até à mata.", "rastrear", "sobrevivencia"));
  t("o rasto da estrada é a estrada", naoRola("sigo o rasto da estrada até à vila", "rastrear"));
  t("examinar a coisa à mão → Investigação", casa("examino a moeda de perto", "investigar", "investigacao") && ehExameDaCoisa("examino a moeda de perto"));
  t("examinar o lugar → a busca, Percepção", casa("examino o quarto com cuidado", "buscar", "percepcao") && !ehExameDaCoisa("examino o quarto com cuidado"));
  t("o corpo continua da Medicina", casa("examino o corpo do guarda", "diagnosticar", "medicina"));
  t("o espólio que caiu não é teste", naoRola("Examino o que caiu no chão e guardo o frasco") && EXAMINAR_A_COISA.espolio.test("examino o que caiu no chao"));
  t("pedir licença para examinar não é examinar", naoRola("peço licença para examinar o cadeado"));
  t("examinar para achar o escondido é a busca", casa("examino as estantes, procurando um papel escondido", "buscar", "percepcao"));
  t("o nome próprio depois do verbo é um sítio", !ehExameDaCoisa("examino o Rossio Torto com cuidado"));
  t("«dou uma vista de olhos» é a busca", casa("dou uma vista de olhos pela sala", "buscar"));
  t("«encosto a orelha» é escutar", casa("encosto a orelha à porta", "escutar"));
  t("«garrote» é estancar", casa("aplico um garrote na perna dela", "estancar", "medicina"));
  t("«rebento» é arrebentar", casa("rebento as cordas dos pulsos", "arrebentar"));
  t("«mentir-me» é ler a intenção (Intuição)", casa("Estás a mentir-me, Teodoro?", "mentira", "intuicao"));
  t("«observo o rosto dele» é Intuição", casa("Observo o rosto dele enquanto responde.", "mentira", "intuicao"));
  t("espreitar é Percepção", casa("espreito pela janela os dois vultos", "improviso", "percepcao"));
  t("procurar gente conhecida é ir (com o contexto do jogo)", naoRola("procuro a Lourdes no salão") && lerAcao("procuro a Lourdes no salão", {}).id === "buscar");
  t("empurrar a porta é entrar; a emperrada é peso", naoRola("empurro a porta da taverna e entro") && casa("empurro a porta emperrada com o ombro", "forcar"));
  t("subir a ladeira é andar", naoRola("subo a ladeira até à praça"));
  t("perguntar se alguém sabe nadar é conversa", naoRola("pergunto ao barqueiro se ele sabe nadar"));
  t("«foi um engano» não é mentir", naoRola("Foi um engano, peço desculpa."));
}

sec("5. a medida não estoura com lixo");
{
  t("frase vazia, null e lixo devolvem sem dado", [null, "", "   ", 42, {}].every((x) => lerNaMesa(x).pede === false));
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
