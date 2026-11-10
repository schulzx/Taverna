/* ============================================================
   O LOTE 3 DA FASE CB NO App.jsx — a altura, o chão que reage e o cenário
   que se usa (CB14 · CB15 · CB16, 10/11 — o oficial)

   O motor (grid.js, superficies.js, disputa.js) é provado em
   teste-cb3-motor e nas suítes dele; as peças (grade-de-batalha,
   painel-batalha, batalha-na-tela) nas delas. Esta prova a FIAÇÃO, em duas
   metades:

   A. a costura em Node (motor/o-chao-na-mesa.js): o chão de uma luta que
      nasceu antes dele, o save com lixo, os corpos que o chão fere, as
      feridas aplicadas sem mutar, e as formas do motor passadas às formas
      que a peça lê (o empurrão, os objetos, as reações);
   B. o App.jsx lido como texto, ancorado em conteúdo que só existe se a
      fiação ligou o motor (nunca em número de linha):
      1. a altura soma nos DOIS golpes do herói (a previsão já a soma: sem
         isto a pílula e o dado divergiam);
      2. `combate.superficies` no load (campo aditivo; o lixo vale a planta);
      3. o chão vive: os golpes com elemento marcam-no, o sopro também, a
         rodada passa-o, o começo da vez e a entrada na casa aplicam-no, o
         passo deles evita-o, o caminho do herói acende os perigos;
      4. as reações vão à mesa na mesma rajada que os golpes, com som e
         uma linha curta na pauta de um turno (nunca bloco estático);
      5. o Empurrar nasce: as duas portas, o veredito antes do clique, a
         disputa, o cenário e o recurso da tabela;
      6. as props novas chegam à TelaDeBatalha;
      7. tudo em calou: nada disto pode custar o turno.
   ============================================================ */
import { readFileSync } from "node:fs";
import {
  chaoDaLuta, vistasDaLuta, combateDoSave, entidadesDaLuta, feridasNaLuta, feridasDoChao, linhaDoChao,
  alturasNaMesa, objetosNaMesa, reacoesNaMesa, previsaoDoEmpurraoNaMesa,
} from "../src/motor/o-chao-na-mesa.js";
import { previsaoDoEmpurrao, empurraoNoCenario, SUPERFICIES } from "../src/superficies.js";
import { rotulosDoEmpurrao, previsaoDoObjetoNaMesa } from "../src/batalha-na-tela.js";
import { CUSTO_DOS_VERBOS } from "../src/vez-na-mesa.js";
import { criarCondicao } from "../src/condicoes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra !== "" ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* as plantas de prova, na forma da grade do save (sem alturas nem objetos:
   esses saem da planta, por garantirGrade) */
const TAVERNA = { cenario: "taverna", largura: 12, altura: 9, paredes: ["2,1", "3,1", "4,1", "5,1", "6,1", "7,1", "8,1"], estorvos: ["3,4", "4,4", "7,4", "8,4", "3,5", "8,5"] };
const CAVERNA = { cenario: "caverna", largura: 14, altura: 14, paredes: [], estorvos: [] };
const heroi = { nome: "Ana", vida: 20, vidaMax: 20, atributos: { forca: 3, destreza: 2 }, condicoes: [], grupo: [{ nome: "Bru", vida: 10, vidaMax: 10, condicoes: [] }] };
const luta = (o = {}) => ({
  grade: TAVERNA, heroi: { nome: "Ana", x: 11, y: 7 }, aliados: [{ nome: "Bru", x: 0, y: 8 }],
  inimigos: [{ nome: "Goblin", x: 10, y: 7, vida: 7, vidaMax: 7, ameaca: "comum", nivel: 1 }, { nome: "Lobo", x: 5, y: 6, vida: 11, vidaMax: 11, ameaca: "comum", nivel: 1 }],
  economia: { acao: 1, movM: null }, rodada: 1, ...o,
});

/* ================= A. A COSTURA, EM NODE ================= */
sec("A1. o chão de uma luta que nasceu antes dele");
{
  const sem = luta({ grade: CAVERNA });
  const ch = chaoDaLuta(sem);
  t("sem o campo, o chão é o da planta (o charco da caverna, permanente)", ch.length > 0 && ch.every((s) => s.tipo === "agua" && s.rodadas === null && s.permanente === true));
  t("com o campo, ele manda (mesmo vazio: o charco que gelou e derreteu já não é da planta)", chaoDaLuta({ ...sem, superficies: [] }).length === 0);
  t("lixo dá chão vazio, nunca estoura", chaoDaLuta(null).length === 0 && chaoDaLuta("x").length === 0);
  t("as reações vistas: só textos, e [] sem o campo", vistasDaLuta({ reacoesVistas: ["explode", 3, null] }).join() === "explode" && vistasDaLuta(luta()).length === 0);
}

sec("A2. o save: os dois campos novos, lidos com desconfiança");
{
  t("null continua null", combateDoSave(null) === null);
  const lixo = combateDoSave({ ...luta(), superficies: "fogo", reacoesVistas: { a: 1 } });
  t("o lixo vale «ausente» (e ausente é a planta)", !("superficies" in lixo) && !("reacoesVistas" in lixo));
  const bom = combateDoSave({ ...luta(), superficies: [{ x: 1, y: 1, tipo: "fogo", rodadas: 2 }, { x: 2, y: 2, tipo: "lava", rodadas: 2 }, null], reacoesVistas: ["explode", 9] });
  t("o chão conhecido fica, o tipo que o motor não conhece sai", bom.superficies.length === 1 && bom.superficies[0].tipo === "fogo");
  t("as vistas ficam só com os textos", bom.reacoesVistas.join() === "explode");
  const antes = { ...luta(), superficies: [{ x: 1, y: 1, tipo: "fogo", rodadas: 2 }] };
  const congelado = JSON.stringify(antes);
  combateDoSave(antes);
  t("e não toca no que recebe", JSON.stringify(antes) === congelado);
}

sec("A3. os corpos na mesa, e as feridas sem mutar");
{
  const ents = entidadesDaLuta(luta(), heroi);
  t("o herói (com a vida e os atributos da ficha), os inimigos de pé e o grupo pelo índice", ents.map((e) => e.nome).join() === "Ana,Goblin,Lobo,Bru" && ents[0].vida === 20 && ents[0].atributos.destreza === 2 && ents[3].vida === 10);
  t("o herói pode estar noutra casa (o empurrão depois de andar)", entidadesDaLuta(luta(), heroi, { heroiEm: { x: 3, y: 3 } })[0].x === 3);
  t("quem caiu não entra", entidadesDaLuta(luta({ inimigos: [{ nome: "Morto", x: 1, y: 1, vida: 0, derrotado: true }] }), heroi).every((e) => e.nome !== "Morto"));
  const comb = luta();
  const fotoC = JSON.stringify(comb), fotoP = JSON.stringify(heroi);
  const caido = criarCondicao("caido", { origem: "gelo" });
  const r = feridasNaLuta(comb, heroi, [{ nome: "Goblin", dano: 9 }, { nome: "Ana", dano: 3, condicao: caido }, { nome: "Ana", dano: 0, condicoes: [caido] }, { nome: "Bru", dano: 4 }]);
  t("o goblin que leva mais do que tem cai (derrotado, ultimoDano)", r.combate.inimigos[0].vida === 0 && r.combate.inimigos[0].derrotado === true && r.combate.inimigos[0].ultimoDano === 9);
  t("o herói perde a vida e ganha a condição UMA vez (o caído de cima do caído não conta dois)", r.pers.vida === 17 && r.pers.condicoes.filter((c) => c.id === "caido").length === 1);
  t("o grupo apanha na ficha, pelo nome", r.pers.grupo[0].vida === 6);
  t("quem caiu está na lista", r.caidos.join() === "Goblin");
  t("e nada do que entrou foi mutado", JSON.stringify(comb) === fotoC && JSON.stringify(heroi) === fotoP);
  t("sem feridas, o mesmo objeto volta (nada a escrever)", feridasNaLuta(comb, heroi, []).combate === comb && feridasNaLuta(comb, heroi, null).pers === heroi);
}

sec("A4. o chão de quem começa a vez ou entra na casa");
{
  const fogo = [{ x: 10, y: 7, tipo: "fogo", rodadas: 2 }];
  const fe = feridasDoChao(fogo, entidadesDaLuta(luta(), heroi), "turno", () => 0.5);
  t("o goblin no fogo arde o dano da tabela, e só ele", fe.length === 1 && fe[0].nome === "Goblin" && fe[0].dano === SUPERFICIES.fogo.danoPorTurno && fe[0].tipos.join() === "fogo");
  t("a linha diz o mundo («no fogo»), nunca o mecanismo", linhaDoChao(fe[0]) === `Goblin, no fogo: ${SUPERFICIES.fogo.danoPorTurno} de dano` && !/superf|rea[çc]/i.test(linhaDoChao(fe[0])));
  const gelo = feridasDoChao([{ x: 10, y: 7, tipo: "gelo", rodadas: 3 }], entidadesDaLuta(luta(), heroi), "entrar", () => 0);
  t("no gelo, quem falha a Destreza fica caído (a condição, sem dano)", gelo.length === 1 && gelo[0].dano === 0 && gelo[0].condicoes[0].id === "caido");
  t("«na água eletrificada», com o artigo do chão", linhaDoChao({ nome: "Lobo", dano: 3, tipos: ["eletrica"] }).startsWith("Lobo, na água eletrificada"));
  t("sem chão, nada (e nunca estoura)", feridasDoChao([], entidadesDaLuta(luta(), heroi), "turno").length === 0 && linhaDoChao(null) === "");
}

sec("A5. o que a peça lê: o degrau, os objetos, as reações");
{
  const a = alturasNaMesa(TAVERNA);
  t("o patamar da escada da taverna sai da planta (a grade do save não o escreve)", a && a["10,7"] === 1 && a["11,8"] === 1 && Object.keys(a).length === 4);
  t("sem degrau nenhum (a grade sem planta conhecida), null: a mesa de hoje", alturasNaMesa({ cenario: "nenhures", largura: 5, altura: 5 }) === null && alturasNaMesa(null) === null);
  const objs = objetosNaMesa(luta(), { elemento: "fisico", entidades: entidadesDaLuta(luta(), heroi) });
  const barril = objs && objs.find((o) => o.tipo === "barril_de_oleo");
  t("os dois objetos da taverna, com o nome com acento e as etiquetas do motor", objs && objs.length === 2 && barril && barril.nome === "barril de óleo" && barril.etiquetas.includes("explode"));
  t("o barril sem fogo no golpe prevê o fogo (o que reage): explode, −6, deixa fogo", barril.previsao && barril.previsao.verbo === "explode" && barril.previsao.dano === 6 && barril.previsao.deixa === "fogo" && barril.previsao.casas.length > 1);
  const naMesa = previsaoDoObjetoNaMesa(barril);
  t("e a peça escreve-o («barril de óleo · explode: −6 em N casas, deixa fogo»)", naMesa && /^barril de óleo · explode: −6 em \d+ casas, deixa fogo$/.test(naMesa.rotulo), naMesa && naMesa.rotulo);
  const evs = reacoesNaMesa([{ tipo: "explode", casas: [{ x: 7, y: 4 }, { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }], dano: 6, primeira: true, origem: "objeto", objeto: "barril_de_oleo" }], "r1");
  t("a reação ganha a origem no meio da explosão (a casa do barril) e uma chave", evs[0].origem.x === 8 && evs[0].origem.y === 5 && evs[0].chave === "r1:0" && evs[0].de === "objeto" && evs[0].primeira === true);
}

sec("A6. o empurrão na forma da peça");
{
  /* a Ana no patamar (11,7) empurra o goblin que está no patamar (10,7)
     para (9,7), que é chão: cai um degrau */
  const comb = luta();
  const ents = entidadesDaLuta(comb, heroi);
  const quem = ents[0], alvo = ents[1];
  const prev = previsaoDoEmpurrao({ grade: comb.grade, quem, alvo, entidades: ents, superficies: chaoDaLuta(comb), vistas: [] });
  t("o motor vê a casa final e a queda", prev && prev.para.x === 9 && prev.para.y === 7 && prev.queda === 1, prev && JSON.stringify(prev.para));
  const p = previsaoDoEmpurraoNaMesa(prev);
  t("as parcelas do motor viram o dano da peça (queda, colisão, superfície, total)", p.dano.queda === prev.danos.queda && p.dano.total === prev.dano && p.dano.superficie === prev.danos.superficie + prev.danos.reacao);
  const v = rotulosDoEmpurrao(p, { vida: alvo.vida });
  t("e a peça escreve «cai 1 · −N» antes do clique (a lei do veredito)", v && v.rotulos.some((r) => r.tipo === "queda" && r.texto.startsWith("cai 1")) && v.chance != null, v && JSON.stringify(v.rotulos));
  const gelo = previsaoDoEmpurraoNaMesa({ ...prev, superficie: "gelo", teste: { atributo: "destreza", cd: 12, falha: "caido", chance: 0.5 } });
  t("o teste do chão vira a palavra da peça («Destreza 12 ou cai»)", rotulosDoEmpurrao(gelo, {}).rotulos.some((r) => r.tipo === "superficie" && r.texto.includes("Destreza 12 ou cai")));
  const corpo = previsaoDoEmpurraoNaMesa({ ...prev, colideCom: "corpo", colide: "Lobo" });
  t("a colisão contra um corpo leva o nome dele", corpo.colideCom && corpo.colideCom.nome === "Lobo");
  t("e não diz a altura: a disputa não a soma", !("alto" in p) || !p.alto);
  t("lixo dá null", previsaoDoEmpurraoNaMesa(null) === null);
  /* o cumprido, pela mesma conta: o goblin pára em (9,7) e cai */
  const cen = empurraoNoCenario({ grade: comb.grade, quem, alvo, entidades: ents, superficies: chaoDaLuta(comb), vistas: [], sorte: () => 0.5 });
  const ap = feridasNaLuta(comb, heroi, cen.feridos);
  t("o cumprido fere o empurrado pela porta da costura", ap.combate.inimigos[0].vida === alvo.vida - cen.dano && cen.para.x === 9);
  t("o recurso do verbo é o da tabela (a ação)", CUSTO_DOS_VERBOS.empurrar === "acao");
}

/* ================= B. O App.jsx, POR ÂNCORA ================= */
const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const conta = (s) => APP.split(s).length - 1;
const corpo = (nome) => {
  const i = APP.indexOf("\n  const " + nome + " = ");
  if (i < 0) return "";
  const resto = APP.slice(i + 1);
  const m = resto.slice(1).search(/\n  (const |let |useEffect\(|[a-zA-Z]+Ref\.current = |\/\* -{8})/);
  return m < 0 ? resto : resto.slice(0, m + 1);
};

sec("B1. a altura soma nos dois golpes do herói");
{
  t("o golpe de arma soma alturaDoGolpe", APP.includes("bonusAtaque: bonusAtkBase - penal + degrau + alturaDoGolpe(gradeDaLuta, meuLugar, alvo),"));
  t("o golpe da habilidade também", APP.includes("bonusAtaque: bonusAtk + bonusDivino(gdJH, gdAlvoH) + alturaDoGolpe(gradeH, meuLugarH, alvo),"));
  const a = corpo("alturaDoGolpe");
  t("e alturaDoGolpe é a leitura única do motor (bonusDaAltura), em calou", a.includes("bonusDaAltura(grade || null, de, alvo)") && a.includes("calou("));
  t("bonusDaAltura vem de grid.js", /import \{[^}]*\bbonusDaAltura\b[^}]*\} from "\.\/grid\.js"/.test(APP));
}

sec("B2. combate.superficies no load");
{
  t("o combate do save passa por combateDoSave, em calou", APP.includes("cSv = combateDoSave(sv.combate);") && conta('calou("o chão da luta no load"') === 1);
  t("o chão lê-se sempre por chaoDaLuta (a planta quando o campo falta)", conta("chaoDaLuta(") >= 10);
}

sec("B3. o chão vive");
{
  t("o golpe de arma com elemento chega ao chão (alvo único: só reage)", APP.includes("oGolpeNoChao({ elemento: elemA, casas: casasA, area: false })"));
  t("o feitiço com área marca o chão perto do impacto", APP.includes("oGolpeNoChao({ elemento: elemH, casas: casasH, centro: centroH, area: emArea })"));
  t("o sopro deixa o chão em todas as casas que queimou", APP.includes("chaoDoGolpe(combPos, persAgora, { elemento: elemS, casas: it.area, area: true })"));
  const cg = corpo("chaoDoGolpe");
  t("a marca é a do motor, e quem apanha também", cg.includes("marcaDoAtaque(") && cg.includes("feridosDoEvento(") && cg.includes("feridasNaLuta("));
  t("a rodada passa para o chão (passarRodada) e o herói começa a vez nova nele, pelo danoNoJogador (a concentração e a queda de sempre)", APP.includes("const supR = passarRodada(chaoDaLuta(combPos)).superficies;") && APP.includes('feridasDoChao(supR, eu, "turno"') && APP.includes("danoNoJogador += Math.max(0, (persAgoraR.vida || 0) - (depoisR.vida || 0));"));
  t("os inimigos e o grupo começam a vez deles no chão", APP.includes('feridasDoChao(chaoDaLuta(combPos), entT, "turno"'));
  t("entrar na casa: o herói, os inimigos e o grupo", APP.includes('feridasDoChao(chaoDaLuta(combateRef.current), eu, "entrar"') && conta('"entrar", sorteDoTurno("chao-entrar")') === 3);
  t("o passo deles e o do grupo evitam o chão que fere", conta("opcoesDoPasso(combPos))") === 2 && corpo("opcoesDoPasso").includes("casasQueSeEvitam("));
  t("o caminho do herói acende os perigos", APP.includes("ignoraDificil: passo.ignoraDificil, superficies: chaoDaLuta(comb) });") && APP.includes("golpesLivres: cp.golpesLivres, perigos: cp.perigos || [] } };"));
}

sec("B4. as reações: a mesa, o som, a pauta");
{
  const m = corpo("mostrarAsReacoes");
  t("vão à rajada da mesa (sentirReacoes), com o som da tabela", m.includes("sentirReacoes(evs);") && m.includes('tocarDaLuta("reacao")'));
  t("e uma linha curta na pauta de um turno, nunca bloco estático", m.includes("porNaPautaDoTurno({ acabou: [") && m.includes("letreiroDaReacao("));
  const g = corpo("sentirGolpe");
  t("os golpes e as reações saem no MESMO lote (o mesmo callback de setState)", g.indexOf("soltarAsReacoes();") > 0 && g.indexOf("soltarAsReacoes();") < g.indexOf("setGolpesDaRajada(") && corpo("soltarAsReacoes").includes("setReacoesDaRajada(rs)"));
  t("sem golpe nenhum (o empurrão, o sopro contado), as reações soltam-se sozinhas", corpo("sentirReacoes").includes("setTimeout(soltarAsReacoes, 0)"));
  t("a reação ganha a forma da peça (reacoesNaMesa)", corpo("sentirReacoes").includes("reacoesNaMesa(l,"));
  t("a luta que acaba limpa as reações e o empurrão", APP.includes("setAlvoDoEmpurrao(null); setReacoesDaRajada(null); reacoesRajadaRef.current = [];"));
}

sec("B5. o Empurrar nasce");
{
  const pl = corpo("planoDoEmpurrao");
  t("encosta, ou anda até encostar pelo passo de andar e atacar", pl.includes("adjacentes(de, [alvo])") && pl.includes("passoAteAlcancar(") && pl.includes("perigos: cp.perigos || []"));
  const e = corpo("empurrarAgora");
  t("o recurso é o da tabela (CUSTO_DOS_VERBOS.empurrar), recusado com a frase da tabela", e.includes("const recurso = CUSTO_DOS_VERBOS.empurrar;") && e.includes("RECUSA_DO_VERBO["));
  t("o portão do tamanho antes de gastar (vereditoDoEmpurrao)", e.includes("vereditoDoEmpurrao({"));
  t("a disputa do motor, e só com vitória o cenário", e.includes("empurrar({ grade: pl.grade") && e.indexOf("empurraoNoCenario(") > e.indexOf("!r.venceu"));
  t("o dado da disputa pousa na bandeja", e.includes("aBandeja(lancamento({") && e.includes("TABELA_DA_DISPUTA.faces"));
  t("e o turno fecha como o golpe: o revide e a narração (combateResolvido)", e.includes("fecharMeuTurno(") && e.includes('oEnvelopeDaFicha("combateResolvido", { desfecho, resumoInimigos: rv.texto, acao })') && e.includes("enviar(envelope, rv.pers)"));
  t("a previsão é a do motor, na forma da peça", APP.includes("previsaoDoEmpurraoNaMesa(prev)") && APP.includes("const prev = previsaoDoEmpurrao(pl);"));
}

sec("B6. as props novas chegam à TelaDeBatalha");
{
  const i = APP.indexOf("<TelaDeBatalha");
  const tela = i >= 0 ? APP.slice(i, APP.indexOf("/>", APP.indexOf("ultimoGolpe=", i))) : "";
  for (const p of ["alturas={alturasDaMesa}", "superficies={superficiesDaMesa}", "objetos={objetosDoCenarioNaMesa}", "reacoes={reacoesDaRajada}", "empurrao={empurraoNaMesa}", "aoPreverEmpurrao={", "aoEmpurrar={empurrarAgora}"]) t(`a tela recebe ${p}`, tela.includes(p));
  t("o caminho do empurrão manda sobre o do golpe quando há", tela.includes("caminho={empurraoNaMesa && empurraoNaMesa.caminho ? empurraoNaMesa.caminho :"));
}

sec("B7. tudo em calou: nada disto custa o turno");
{
  const PECAS = ["soltarAsReacoes", "sentirReacoes", "mostrarAsReacoes", "oGolpeNoChao", "opcoesDoPasso", "alturaDoGolpe", "planoDoEmpurrao", "empurrarAgora"];
  const sem = PECAS.filter((n) => { const c = corpo(n); return !c || !c.includes("try {") || !c.includes("calou("); });
  t(`as ${PECAS.length} peças novas correm em try/calou`, sem.length === 0, sem.join(", "));
  const SITIOS = ["o golpe de arma no chão", "o feitiço no chão", "o chão no começo da vez deles", "o chão de quem anda", "o chão de onde o grupo chega", "o sopro no chão", "a rodada no chão", "o chão onde paro", "o chão da luta que acabou", "a previsão do empurrão", "o degrau na mesa", "o chão na mesa", "os objetos na mesa", "prever o empurrão", "o dado do empurrão", "o som da reação"];
  const faltam = SITIOS.filter((s) => conta('calou("' + s + '"') < 1);
  t(`e os ${SITIOS.length} sítios de fiação dentro de funções que já existiam também`, faltam.length === 0, faltam.join(", "));
}

console.log(`\no lote 3 da fase CB no App: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
