/* teste-esconder-na-luta.mjs (Fase MM · MM16 nº 6) — esconder-se na luta

   O pedido da pessoa: "Esconder-se na luta: o teste passado faz nascer o
   estado, com vantagem e uma linha."

   O QUE A TERCEIRA SESSÃO VIU (mente/mm11-sessao-3.md, J18/M18): "Baixo a
   tocha atrás das costas e escondo-me na sombra, colado à parede do fundo,
   sem fazer barulho." O dado rolou (18 + 7 = 25 contra 18, sucesso) e o
   estado não nasceu; a prosa do Mestre sumiu o herói, o sistema não.

   A CAUSA, PROVADA AQUI (§1) E NO REGISTO DA SESSÃO: o ramo do MM6 RODOU —
   o save guarda a linha "👁 Não há onde sumir: Lobo tem você à vista, sem
   nada no meio." logo depois do dado. O herói estava NO FUNDO DA SALA da
   masmorra (região sem cobertura; a pauta daquele turno não traz "Eu estou
   atrás de cobertura."), o Lobo a 12 m no vão da porta, com linha de visão
   (a pauta não traz "sem linha de visão"). `ondeSeEsconder` respondeu
   `a_descoberto` — a regra do 5e, certa. Os defeitos eram três:
     1. o veredito vinha DEPOIS do dado: rolou-se para nada;
     2. a recusa ficava na tela e não ia ao Mestre — o envelope dizia
        "eu PASSEI. Revele UMA coisa", e ele narrou o herói escondido;
     3. a ação não se gastava, nem na falha; e "fico escondido na sombra"
        nem rolava (a primeira sessão, J35).
   E um quarto, que a primeira sessão anotou ("a pauta não o diz ao
   Narrador neste turno"): o rodapé de `enviar` lia o `personagem` do
   render, e o estado nascido no mesmo clique só aparecia no turno seguinte.

   Esta suíte FALHA no HEAD anterior (as duas funções não existiam, a frase
   do particípio não rolava, a fiação não estava no App) e passa depois.
   Toda sorte por semente: nenhum `Math.random` decide uma asserção. */
import {
  ESCONDIDO, estadoEscondido, nascerEscondido, oculto, vereditoDoEsconder, notaDoEscondido, custoDeEsconder,
} from "../src/escondido.js";
import { lerAcao } from "../src/desafios.js";
import { montarGrade, temCobertura, linhaDeVisao, nomeDoLugar, resumoGridPrompt } from "../src/grid.js";
import { romperPorGatilho } from "../src/gatilhos.js";
import { readFileSync } from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);

/* a mesa da sessão 3: Tobias (Guerreiro, Furtividade treinada +7), o Lobo,
   a masmorra. As posições reproduzem a pauta do turno 17 do registo:
   "no corredor: — | no vão da porta: Lobo | no fundo da sala: você,
   Iracema Sousa. Distâncias até mim: Lobo a 12 m (atrás de cobertura)." */
const masm = montarGrade({ emMasmorra: true });
const lobo = () => ({ nome: "Lobo", ameaca: "comum", x: 3, y: 9, vida: 4 });
const iracema = { nome: "Iracema Sousa", x: 2, y: 16 };
const tobias = () => ({ nome: "Tobias Varzim", classe: "Guerreiro", nivel: 3, condicoes: [] });
const noFundo = { x: 3, y: 17 };     // a descoberto, à vista do Lobo — o J18
const naPedra = { x: 3, y: 15 };     // colado à pedra (3,14): cobertura
const ecoCheia = () => ({ acao: 1, extra: 0 });

/* o mesmo gerador semeado da casa: mulberry32 */
const semeado = (seed) => () => {
  let x = (seed = (seed + 0x6d2b79f5) | 0);
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

/* ============================================================ */
sec("0. a frase da sessão e as variantes rolam o teste de esconder");
{
  const frases = [
    "Baixo a tocha atrás das costas e escondo-me na sombra, colado à parede do fundo, sem fazer barulho.",
    "escondo-me atrás do pilar",
    "me escondo",
    "fico escondido na sombra",
    "Encolho-me no escuro atrás dos caixotes e fico quieta, escondida.",
  ];
  for (const f of frases) {
    const v = lerAcao(f, { emCombate: true });
    t(`"${f.slice(0, 48)}…" → furtividade que esconde`, !!v && ESCONDIDO.alvosQueEscondem.includes(v.alvoDoCusto), v ? v.id : "null");
  }
  t("pergunta não rola: \"posso me esconder?\"", !lerAcao("posso me esconder?", { emCombate: true }));
  t("negação não rola: \"não me escondo\"", !lerAcao("não me escondo", { emCombate: true }));
  t("\"continuo escondido\" não rola de novo (quem já está, fica)", !lerAcao("continuo escondido", { emCombate: true }));
}

/* ============================================================ */
sec("1. a causa: no fundo da sala, à vista do Lobo, não há onde sumir");
{
  const pauta = resumoGridPrompt(masm, { heroi: noFundo, inimigos: [lobo()], grupo: [iracema] });
  t("a geometria reproduz a pauta do registo (fundo da sala, Lobo a 12 m atrás de cobertura)",
    /no vão da porta: Lobo/.test(pauta) && /no fundo da sala: você/.test(pauta) && /Lobo a 12 m \(atrás de cobertura\)/.test(pauta), pauta.slice(0, 200));
  t("…e sem \"Eu estou atrás de cobertura.\" nem \"sem linha de visão\" — como no registo",
    !/Eu estou atrás de cobertura/.test(pauta) && !/sem linha de vis/.test(pauta));
  t("o herói no fundo: sem cobertura, e o Lobo vê-o", !temCobertura(masm, noFundo.x, noFundo.y) && linhaDeVisao(masm, lobo(), noFundo));
  const ns = nascerEscondido(tobias(), { total: 25, grade: masm, heroi: noFundo, inimigos: [lobo()] });
  t("25 contra 18 passa, e mesmo assim nascerEscondido recusa: a_descoberto (a regra do 5e)",
    !ns.ok && ns.motivo === "a_descoberto" && /Não há onde sumir: Lobo tem você à vista/.test(ns.linhas[0]));

  const ve = vereditoDoEsconder(tobias(), { grade: masm, heroi: noFundo, inimigos: [lobo()], aliados: [iracema], economia: ecoCheia() });
  t("o veredito diz ANTES do dado: não pode", ve.pode === false && ve.motivo === "a_descoberto");
  t("…não cobra nada (não houve tentativa)", ve.custo === null && !ve.economiaDepois);
  t("…e diz quem vê e onde há abrigo, como o Matt diria", /👁 Não há onde sumir: Lobo tem você à vista, sem nada no meio\./.test(ve.linha) && /abrigo a 3 m, aqui mesmo no fundo da sala/.test(ve.linha), ve.linha);
  t("a linha não fala de si (nada de estado, sistema, condição, vantagem)", !/estado|sistema|condi[cç][aã]o|vantagem|escondido/i.test(ve.linha));
  /* na estrada, o abrigo é a vala (y 0–2), três casas acima de (9,5) */
  const estrada = montarGrade({ local: "estrada" });
  const veEstrada = vereditoDoEsconder(tobias(), { grade: estrada, heroi: { x: 9, y: 5 }, inimigos: [{ nome: "Orc", ameaca: "comum", x: 9, y: 8, vida: 9 }], economia: ecoCheia() });
  t("noutra região, o abrigo vem com o nome do lugar", !veEstrada.pode && /O abrigo mais perto fica na vala, a 4,5 m\./.test(veEstrada.linha), veEstrada.linha);
}

/* ============================================================ */
sec("2. com onde sumir: a ação sai antes do dado, passe ou falhe");
{
  t("fixture: colado à pedra há cobertura, ainda no fundo da sala", temCobertura(masm, naPedra.x, naPedra.y) && nomeDoLugar(masm, naPedra.x, naPedra.y) === "no fundo da sala");
  const eco = ecoCheia();
  const ve = vereditoDoEsconder(tobias(), { grade: masm, heroi: naPedra, inimigos: [lobo()], economia: eco });
  t("pode, e custa a ação", ve.pode && ve.custo === "acao" && ve.motivo === "cobertura");
  t("a economia depois tem a ação gasta", ve.economiaDepois && ve.economiaDepois.acao === 0 && ve.economiaDepois.extra === 0);
  t("…e a recebida não foi mexida (imutável)", eco.acao === 1 && eco.extra === 0);
  const sem = vereditoDoEsconder(tobias(), { grade: masm, heroi: naPedra, inimigos: [lobo()], economia: { acao: 0, extra: 1 } });
  t("sem a ação: não rola, e diz por quê", !sem.pode && sem.motivo === "sem_acao" && /já usou sua ação nesta rodada/.test(sem.linha));
  const ladino = { ...tobias(), classe: "Ladino", nivel: 2 };
  const vl = vereditoDoEsconder(ladino, { grade: masm, heroi: naPedra, inimigos: [lobo()], economia: { acao: 1, extra: 1 } });
  t("Ladino nível 2 (Ação Ardilosa): custa a bônus, a ação fica", custoDeEsconder(ladino) === "bonus" && vl.pode && vl.economiaDepois.extra === 0 && vl.economiaDepois.acao === 1);
  const vl0 = vereditoDoEsconder(ladino, { grade: masm, heroi: naPedra, inimigos: [lobo()], economia: { acao: 1, extra: 0 } });
  t("…e sem a bônus, diz a bônus", !vl0.pode && /ação bônus/.test(vl0.linha));
  const longe = vereditoDoEsconder(tobias(), { grade: masm, heroi: { x: 0, y: 0 }, inimigos: [{ ...lobo(), x: 2, y: 9 }], economia: ecoCheia() });
  t("sem cobertura mas fora da vista de todos: pode", longe.pode && longe.motivo === "fora_de_vista");
}

/* ============================================================ */
sec("3. passou: o estado nasce, com vantagem no golpe seguinte e uma linha");
{
  const ns = nascerEscondido(tobias(), { total: 25, grade: masm, heroi: naPedra, inimigos: [lobo()] });
  t("nasce a condição `escondido` do catálogo, com o total", ns.ok && estadoEscondido(ns.pers) && estadoEscondido(ns.pers).total === 25);
  t("a linha de tela", /^🌠 Você está escondido/.test(ns.linhas[0]));
  t("vantagem: o Lobo não o vê (oculto → vantagem do golpe, combate)", oculto(ns.pers, lobo(), { grade: masm, heroi: naPedra }));
  const golpe = romperPorGatilho(ns.pers, "atacar");
  t("o golpe o revela: depois de atacar, o estado cai", !estadoEscondido(golpe.pers) && golpe.rompidos.includes("Escondido"));
  t("…e o segundo golpe já não tem vantagem", !oculto(golpe.pers, lobo(), { grade: masm, heroi: naPedra }));
  const nota = notaDoEscondido({ passou: true, ns, total: 25, dc: 18, inimigos: [lobo()] });
  t("a nota ao Mestre diz o estado e de quem", /^\[ESCONDIDO — DECIDIDO PELO SISTEMA\]/.test(nota) && /Estou escondido de Lobo: não me vê nem sabe onde estou\./.test(nota) && /25 contra 18/.test(nota), nota);
  t("…e não manda revelar coisa nenhuma (o \"revele UMA coisa\" era ordem para inventar)", !/[Rr]evele/.test(nota));
  t("…nem o deixa decidir quem acha", /só o sistema diz quem me acha/.test(nota));
  const doisOlhos = nascerEscondido(tobias(), { total: 12, grade: masm, heroi: naPedra, inimigos: [lobo(), { nome: "Corvo", ameaca: "elite", x: 4, y: 9, vida: 3 }] });
  const n2 = notaDoEscondido({ passou: true, ns: doisOlhos, total: 12, dc: 11, inimigos: [lobo(), { nome: "Corvo", ameaca: "elite", x: 4, y: 9, vida: 3 }] });
  t("quem viu para onde fui (passiva acima do total) vem dito à parte", doisOlhos.ok && /escondido de Lobo/.test(n2) && /Corvo viu para onde fui/.test(n2), n2);
}

/* ============================================================ */
sec("4. falhou, ou passou e não sumiu: nada nasce, e o Mestre sabe");
{
  const nf = notaDoEscondido({ passou: false, total: 9, dc: 18, inimigos: [lobo()] });
  t("falhou: o Lobo continua a vê-lo", /^\[ESCONDER — FALHOU\]/.test(nf) && /Lobo continua a ver-me e sabe onde estou/.test(nf) && /Não narre que sumi/.test(nf), nf);
  const ns = nascerEscondido(tobias(), { total: 25, grade: masm, heroi: noFundo, inimigos: [lobo()] });
  const nr = notaDoEscondido({ passou: true, ns, total: 25, dc: 18, inimigos: [lobo()] });
  t("passou mas não havia onde: recusado, e dito ao Mestre", /^\[ESCONDER — RECUSADO PELO SISTEMA\]/.test(nr) && /não narre que me escondi/.test(nr), nr);
  t("…a ficha fica como estava", !estadoEscondido(ns.pers));
}

/* ============================================================ */
sec("5. fora da luta: o caminho de hoje, intacto");
{
  const ve = vereditoDoEsconder(tobias(), { economia: ecoCheia() });
  t("sem tabuleiro: pode, sem custo, sem linha", ve.pode && ve.custo === null && ve.linha === "" && !ve.economiaDepois && ve.motivo === "fora_da_luta");
  const ns = nascerEscondido(tobias(), { total: 15 });
  t("nascerEscondido fora da luta nasce como sempre", ns.ok && ns.motivo === "fora_da_luta");
  t("e o herói sem posto no tabuleiro conta como fora (o caminho antigo cobra no nascer)", vereditoDoEsconder(tobias(), { grade: masm, heroi: { nome: "x" }, economia: ecoCheia() }).custo === null);
}

/* ============================================================ */
sec("6. lixo não estoura");
{
  let estourou = false;
  try {
    vereditoDoEsconder(null, null); vereditoDoEsconder(undefined, {}); vereditoDoEsconder({}, { grade: masm, heroi: naPedra, inimigos: null, economia: null });
    notaDoEscondido(null); notaDoEscondido({}); notaDoEscondido({ passou: true, ns: null });
  } catch (e) { estourou = e; }
  t("null, {} e campos ausentes", !estourou, String(estourou));
  t("economia nula na luta: sem ação, não rola", vereditoDoEsconder({}, { grade: masm, heroi: naPedra, inimigos: [lobo()], economia: null }).motivo === "sem_acao");
}

/* ============================================================ */
sec("7. mesma semente, mesmo resultado");
{
  const rodar = (seed) => {
    const sorte = semeado(seed);
    const out = [];
    for (let i = 0; i < 40; i++) {
      const heroi = { x: Math.floor(sorte() * 7), y: 11 + Math.floor(sorte() * 7) };
      const total = 1 + Math.floor(sorte() * 20) + 7;
      const ve = vereditoDoEsconder(tobias(), { grade: masm, heroi, inimigos: [lobo()], economia: ecoCheia() });
      const passou = total >= 18;
      const ns = ve.pode && passou ? nascerEscondido(tobias(), { total, grade: masm, heroi, inimigos: [lobo()] }) : null;
      out.push([ve.pode, ve.linha, ns && ns.ok, notaDoEscondido({ passou, ns, total, dc: 18, inimigos: [lobo()] })]);
    }
    return JSON.stringify(out);
  };
  t("duas corridas com a semente 1606 dão o mesmo", rodar(1606) === rodar(1606));
  t("e a semente muda o resultado (a prova não é vazia)", rodar(1606) !== rodar(7));
}

/* ============================================================
   8. A FIAÇÃO NO App.jsx — prova por texto, ancorada em conteúdo (nunca em
   número de linha, que é o ofício de check-acoes-do-jogador.mjs). */
sec("8. a fiação no App.jsx");
{
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("importa vereditoDoEsconder e notaDoEscondido", /\bvereditoDoEsconder\b.*\bnotaDoEscondido\b.*from "\.\/escondido\.js"/.test(APP));

  /* rolarDesafio: depois da palavra, antes do dado */
  const iFn = APP.indexOf("const rolarDesafio = (v, acao) => {");
  const iPalavra = APP.indexOf('calou("a palavra na luta", e);', iFn);
  const iVe = APP.indexOf("const ve = vereditoDoEsconder(fichaViva() || personagem, {", iFn);
  const iRec = APP.indexOf("if (!ve.pode) {", iVe);
  const iRet = APP.indexOf("pushMsgs([{ autor: \"jogador\", texto: acao }, { autor: \"sistema\", texto: ve.linha }]);", iVe);
  const iPaga = APP.indexOf("v = { ...v, esconderPago: ve.custo };", iVe);
  const iAuto = APP.indexOf("const auto = v.palavra ? null : resolucaoAutomatica(", iFn);
  const iSet = APP.indexOf("setRolagem({", iFn);
  t("8.1 o veredito roda em rolarDesafio, depois da palavra", iFn > 0 && iPalavra > iFn && iVe > iPalavra);
  t("8.2 …recusado, diz a linha e sai sem dado", iRec > iVe && iRet > iRec && APP.slice(iRet, iRet + 200).includes("return;"));
  t("8.3 …pode, paga a economia ANTES de setRolagem e marca o desafio", iPaga > iRet && iPaga < iSet && /economia: ve\.economiaDepois/.test(APP.slice(iVe, iPaga)));
  t("8.4 …dentro do calou", /calou\("o veredito do esconder", e\)/.test(APP));
  t("8.5 o esconder pago nunca vira sucesso sem dado (precisa do total)", iAuto > iPaga && APP.slice(iAuto, iAuto + 160).includes("permitir: !v.achado && !v.esconderPago"));

  /* concluirRolagem: não cobra duas vezes, e a nota chega ao Mestre */
  const iConc = APP.indexOf("const concluirRolagem = (valor, dadoAnterior = null) => {");
  const iNota = APP.indexOf('let notaEsc = "";', iConc);
  const iPago = APP.indexOf("const pagoEsc = !!des.esconderPago;", iConc);
  const iNaoCobra = APP.indexOf("if (combEsc && !pagoEsc) {", iConc);
  const iNotaOk = APP.indexOf("if (combEsc) notaEsc = notaDoEscondido({ passou: true, ns, total, dc,", iConc);
  const iNotaMal = APP.indexOf("notaEsc = notaDoEscondido({ passou: false, total, dc,", iConc);
  const iEnv = APP.indexOf("if (notaEsc) env = passou ? notaEsc : `${env}\\n${notaEsc}`;", iConc);
  const iCusto = APP.indexOf("if (custo && !custo.porPouco) env = `${envQueda}", iConc);
  const iEnvia = APP.indexOf("enviar(preRefazer + env, persT);", iConc);
  t("8.6 concluirRolagem não cobra de novo o que já foi pago", iNota > iConc && iPago > iNota && iNaoCobra > iPago);
  t("8.7 passou: a nota do estado; falhou na luta: a nota da falha", iNotaOk > iNaoCobra && iNotaMal > iNotaOk && /calou\("nascerEscondido", e\)/.test(APP.slice(iNotaMal, iNotaMal + 300)));
  t("8.8 a nota entra no envelope antes do custo e antes de ir ao Mestre", iEnv > iNotaMal && iEnv < iCusto && iCusto < iEnvia);

  /* o rodapé lê a ficha do turno */
  t("8.9 o rodapé lê a ficha deste turno (persAtual / ref), não a do render",
    APP.includes("const p = persAtual || personagemRef.current || personagem || {};\n      const cond = resumoCondicoesPrompt(p, p.grupo || []);")
    && !APP.includes("const p = personagem || personagemRef.current || {};\n      const cond = resumoCondicoesPrompt("));
}

console.log(`\nesconder na luta: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
