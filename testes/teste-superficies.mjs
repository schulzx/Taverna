/* teste-superficies.mjs (CB15, Fase CB lote 3, 10/11/2026) — o chão guarda e reage

   superficies.js copia a mecânica de DOS2/BG3: o golpe com elemento deixa
   chão, o chão reage ao elemento seguinte, e quem o pisa paga. Esta suíte
   prova: TODA a reação da tabela (o par → o evento e o chão que fica); a
   mancha que corre; a marca do ataque (a área perto do impacto, o sopro
   inteiro, o alvo único só reage); os objetos e a cadeia; o chão de quem
   entra ou começa o turno; a duração que acaba (e o charco da planta que
   volta a ser charco); os inimigos que não entram no fogo; os perigos do
   caminho; a mesma semente = o mesmo resultado; o lixo; a imutabilidade; o
   som da reação; e a régua com o chão desligado = a régua de sempre. */
import {
  SUPERFICIES, REACOES_ELEMENTARES, SUPERFICIE_DO_ELEMENTO, MARCA_DO_ATAQUE,
  aplicarElemento, marcaDoAtaque, feridosDoEvento, efeitoDaCasa, passarRodada,
  casasQueSeEvitam, superficiesDaPlanta, previsaoDoObjeto, perigosNoCaminho,
} from "../src/superficies.js";
import { OBJETOS_DO_CENARIO, PLANTAS, montarGrade, moverInimigos } from "../src/grid.js";
import { caminhoComProvocacoes } from "../src/vez-na-mesa.js";
import { SOM_DA_MESA } from "../src/som-da-mesa.js";
import { rng, hashSemente } from "../src/semente.js";
import { simularCombate, SUPERFICIES_NA_REGUA } from "./regua-combate.mjs";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const grade = (objetos = [], paredes = []) => ({ cenario: "estrada", largura: 12, altura: 12, paredes, estorvos: objetos.map((o) => `${o.x},${o.y}`), objetos });
const tipoEm = (sup, x, y) => (sup.find((s) => s.x === x && s.y === y) || {}).tipo || null;
const bloco = (x0, y0, x1, y1, tipo, extra = {}) => {
  const out = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.push({ x, y, tipo, rodadas: SUPERFICIES[tipo].rodadas, ...extra });
  return out;
};

sec("1. as tabelas");
{
  const tipos = Object.keys(SUPERFICIES);
  t(`os seis chãos do contrato (${tipos.join(", ")})`, ["oleo", "agua", "gelo", "fogo", "veneno", "eletrica"].every((x) => tipos.includes(x)));
  t("todo chão tem duração positiva, dano não negativo e o efeito escrito ou nulo",
    tipos.every((k) => { const S = SUPERFICIES[k]; return S.rodadas > 0 && S.danoAoEntrar >= 0 && S.danoPorTurno >= 0 && (S.efeito === null || typeof S.efeito === "string"); }));
  t("todo teste é de Destreza, com CD e a condição de quem falha",
    tipos.every((k) => !SUPERFICIES[k].teste || (SUPERFICIES[k].teste.atributo === "destreza" && SUPERFICIES[k].teste.cd > 0 && typeof SUPERFICIES[k].teste.falha === "string")));
  t("o que acaba vira um chão que existe", tipos.every((k) => !SUPERFICIES[k].acaba || Object.hasOwn(SUPERFICIES, SUPERFICIES[k].acaba)));
  t("quem fere evita-se: o fogo, o veneno e a água eletrificada; o óleo e o gelo não",
    SUPERFICIES.fogo.evitam && SUPERFICIES.veneno.evitam && SUPERFICIES.eletrica.evitam && !SUPERFICIES.oleo.evitam && !SUPERFICIES.gelo.evitam);
  t("cada reação aponta para chãos e agentes que existem",
    Object.entries(REACOES_ELEMENTARES).every(([k, r]) => { const [a, s] = k.split(">"); return Object.hasOwn(SUPERFICIE_DO_ELEMENTO, a) && Object.hasOwn(SUPERFICIES, s) && (r.vira === null || Object.hasOwn(SUPERFICIES, r.vira)); }));
  t("os pares do plano: fogo+óleo explode, raio+água eletrifica, gelo+água congela, fogo+gelo derrete",
    REACOES_ELEMENTARES["fogo>oleo"].tipo === "explode" && REACOES_ELEMENTARES["raio>agua"].tipo === "eletrifica"
    && REACOES_ELEMENTARES["gelo>agua"].tipo === "congela" && REACOES_ELEMENTARES["fogo>gelo"].vira === "agua");
  t("o raio não deixa chão nenhum (só existe na água)", SUPERFICIE_DO_ELEMENTO.raio === null);
  t("a marca do ataque: uma casa à volta do impacto, e o alvo único não deixa nada", MARCA_DO_ATAQUE.raioCasas === 1 && MARCA_DO_ATAQUE.alvoUnicoDeixa === false);
}

sec("2. toda a reação da tabela, provada");
{
  const g = grade();
  for (const [k, r] of Object.entries(REACOES_ELEMENTARES)) {
    const [agente, chao] = k.split(">");
    const sup = bloco(3, 3, 5, 3, chao);
    const quem = [{ nome: "Bandido", x: 4, y: 3, vida: 30, des: 0 }, { nome: "Longe", x: 9, y: 9, vida: 30 }];
    const d = aplicarElemento({ grade: g, superficies: sup, vistas: [], entidades: quem }, { casas: [{ x: 3, y: 3 }], elemento: agente, deixa: true });
    const ev = d.eventos.find((e) => e.tipo === r.tipo);
    const casasMudadas = r.mancha ? [3, 4, 5] : [3];
    const ficou = casasMudadas.every((x) => tipoEm(d.superficies, x, 3) === r.vira);
    const intocada = r.mancha ? true : tipoEm(d.superficies, 5, 3) === chao;
    const alvoOk = r.dano > 0 && r.mancha ? ev.alvos.some((a) => a.nome === "Bandido" && a.dano > 0) && !ev.alvos.some((a) => a.nome === "Longe") : true;
    t(`${agente} em ${chao} → ${r.tipo}, fica ${r.vira}${r.mancha ? " na mancha toda" : " só na casa"}${r.dano ? `, ${r.dano} de ${r.elemento}` : ""}`,
      !!ev && ev.primeira === true && ev.origem === "superficie" && ev.dano === r.dano && ficou && intocada && alvoOk, J({ ev, sup: d.superficies }));
  }
  const vistas = aplicarElemento({ grade: g, superficies: bloco(1, 1, 1, 1, "oleo"), vistas: ["explode"] }, { casas: [{ x: 1, y: 1 }], elemento: "fogo" });
  t("a segunda explosão da luta já não é a primeira", vistas.eventos[0].primeira === false && vistas.vistas.filter((x) => x === "explode").length === 1);
  const semReacao = aplicarElemento({ grade: g, superficies: bloco(1, 1, 1, 1, "oleo") }, { casas: [{ x: 1, y: 1 }], elemento: "veneno" });
  t("sem reação na tabela, o chão novo cobre o velho (veneno no óleo)", semReacao.eventos.length === 0 && tipoEm(semReacao.superficies, 1, 1) === "veneno");
  const eletr = aplicarElemento({ grade: g, superficies: bloco(1, 1, 2, 1, "agua") }, { casas: [{ x: 1, y: 1 }], elemento: "raio" });
  t("a água eletrificada traz o teste de Destreza que atordoa", eletr.eventos[0].teste && eletr.eventos[0].teste.falha === "atordoado" && eletr.eventos[0].doChao === true);
}

sec("3. a marca do ataque");
{
  const g = grade();
  const area = [];
  for (let x = 2; x <= 8; x++) for (let y = 2; y <= 8; y++) area.push({ x, y });
  const bola = marcaDoAtaque({ grade: g }, { elemento: "fogo", casas: area, centro: { x: 5, y: 5 }, area: true });
  t(`a bola de fogo deixa fogo nas 9 casas do impacto, não nas ${area.length}`, bola.superficies.length === 9 && bola.superficies.every((s) => Math.abs(s.x - 5) <= 1 && Math.abs(s.y - 5) <= 1 && s.tipo === "fogo"));
  const sopro = marcaDoAtaque({ grade: g }, { elemento: "fogo", casas: area.slice(0, 12), area: true });
  t("o sopro (sem centro) pinta todas as casas que queimou", sopro.superficies.length === 12);
  const seta = marcaDoAtaque({ grade: g }, { elemento: "fogo", casas: [{ x: 5, y: 5 }], area: false });
  t("a seta de fogo no chão limpo não deixa nada", seta.superficies.length === 0 && seta.eventos.length === 0);
  const setaNoOleo = marcaDoAtaque({ grade: g, superficies: bloco(4, 5, 6, 5, "oleo") }, { elemento: "fogo", casas: [{ x: 5, y: 5 }], area: false });
  t("e no óleo explode-o todo", setaNoOleo.eventos.length === 1 && setaNoOleo.eventos[0].tipo === "explode" && setaNoOleo.superficies.length === 3 && setaNoOleo.superficies.every((s) => s.tipo === "fogo"));
  const gelo = marcaDoAtaque({ grade: g }, { elemento: "gelo", casas: [{ x: 1, y: 1 }], centro: { x: 1, y: 1 }, area: true });
  t("o raio de gelo de área deixa gelo, e a duração é a da tabela", gelo.superficies.every((s) => s.tipo === "gelo" && s.rodadas === SUPERFICIES.gelo.rodadas));
  const parede = marcaDoAtaque({ grade: grade([], ["5,5"]) }, { elemento: "fogo", casas: [{ x: 5, y: 5 }, { x: 5, y: 6 }], area: true });
  t("a parede não arde, e fora do campo não há chão", !parede.superficies.some((s) => s.x === 5 && s.y === 5) && marcaDoAtaque({ grade: g }, { elemento: "fogo", casas: [{ x: -1, y: 0 }, { x: 12, y: 3 }], area: true }).superficies.length === 0);
}

sec("4. os objetos, as etiquetas e a cadeia");
{
  const tipos = Object.keys(OBJETOS_DO_CENARIO);
  t(`a lista fechada (${tipos.join(", ")})`, ["barril_de_oleo", "candeeiro", "carro_de_feno", "caixote"].every((x) => tipos.includes(x)));
  t("todo objeto cobre, e só o alto tapa a vista", tipos.every((k) => { const o = OBJETOS_DO_CENARIO[k]; return o.etiquetas.includes("cobre") && o.etiquetas.includes("tapaVista") === o.vulto > 0; }));
  t("as etiquetas dizem os verbos que as reações fazem", tipos.every((k) => {
    const o = OBJETOS_DO_CENARIO[k];
    const verbos = [...Object.values(o.aoElemento || {}).map((r) => r.tipo), ...(o.aoEmpurrao ? [o.aoEmpurrao.tipo] : [])];
    return verbos.every((v) => o.etiquetas.includes(v));
  }));
  t("o que um objeto vira existe na lista", tipos.every((k) => Object.values(OBJETOS_DO_CENARIO[k].aoElemento || {}).every((r) => r.vira === null || Object.hasOwn(OBJETOS_DO_CENARIO, r.vira))));
  t("os agentes dos objetos são agentes do chão", tipos.every((k) => [...Object.values(OBJETOS_DO_CENARIO[k].aoElemento || {}), OBJETOS_DO_CENARIO[k].aoEmpurrao].filter(Boolean).every((r) => r.agente === null || Object.hasOwn(SUPERFICIE_DO_ELEMENTO, r.agente))));
  const g = grade([{ x: 5, y: 5, tipo: "barril_de_oleo" }, { x: 6, y: 5, tipo: "barril_de_oleo" }, { x: 9, y: 9, tipo: "carro_de_feno" }]);
  const quem = [{ nome: "Bandido", x: 5, y: 6, vida: 20 }, { nome: "Lobo", x: 7, y: 5, vida: 20 }];
  const d = aplicarElemento({ grade: g, entidades: quem }, { casas: [{ x: 5, y: 5 }], elemento: "fogo", deixa: false });
  const explosoes = d.eventos.filter((e) => e.tipo === "explode" && e.objeto === "barril_de_oleo");
  t("o fogo no barril explode-o, e a explosão explode o vizinho (a cadeia)", explosoes.length === 2 && explosoes.every((e) => e.origem === "objeto"));
  t("os dois barris saíram da grade, e o estorvo foi com eles", !d.grade.objetos.some((o) => o.tipo === "barril_de_oleo") && !d.grade.estorvos.includes("5,5") && !d.grade.estorvos.includes("6,5"));
  t("o carro longe ficou de pé", d.grade.objetos.some((o) => o.tipo === "carro_de_feno") && d.grade.estorvos.includes("9,9"));
  t("o Bandido está nas duas explosões (6 + 6), o Lobo só na segunda",
    explosoes.reduce((s, e) => s + (e.alvos.find((a) => a.nome === "Bandido") || { dano: 0 }).dano, 0) === 12
    && explosoes.reduce((s, e) => s + (e.alvos.find((a) => a.nome === "Lobo") || { dano: 0 }).dano, 0) === 6);
  t("e o chão à volta ficou a arder", tipoEm(d.superficies, 5, 6) === "fogo" && tipoEm(d.superficies, 7, 5) === "fogo");
  const carro = aplicarElemento({ grade: g }, { casas: [{ x: 9, y: 9 }], elemento: "fogo", deixa: false });
  t("o carro de feno arde, fica carro queimado (ainda tapa a vista)", carro.eventos[0].tipo === "arde" && carro.grade.objetos.some((o) => o.x === 9 && o.y === 9 && o.tipo === "carro_queimado") && carro.grade.estorvos.includes("9,9"));
  const pv = previsaoDoObjeto({ grade: g, entidades: quem }, { x: 5, y: 5, elemento: "fogo" });
  t("a previsão do objeto diz a reação, as casas, o dano, o que fica e quem apanha (a cadeia incluída)",
    pv.reacao === "explode" && pv.casas.length === 9 && pv.dano === 6 && pv.depois === null && pv.alvos.find((a) => a.nome === "Bandido").dano === 12 && pv.etiquetas.includes("explode"));
  t("a previsão do objeto sem objeto, ou com elemento que não reage", previsaoDoObjeto({ grade: g }, { x: 1, y: 1, elemento: "fogo" }) === null && previsaoDoObjeto({ grade: g }, { x: 5, y: 5, elemento: "veneno" }).reacao === null);
  t("a previsão não mexe na grade de ninguém", g.objetos.length === 3 && g.estorvos.length === 3);
}

sec("5. quem pisa paga");
{
  const sup = [...bloco(1, 1, 1, 1, "fogo"), ...bloco(2, 1, 2, 1, "veneno"), ...bloco(3, 1, 3, 1, "oleo"), ...bloco(4, 1, 4, 1, "agua")];
  const bandido = (x) => ({ nome: "Bandido", x, y: 1, vida: 20, des: 0, condicoes: [] });
  const f = efeitoDaCasa(sup, bandido(1), { momento: "turno", sorte: () => 0.5 });
  t("começar o turno no fogo arde 3", f.dano === 3 && f.tipos[0] === "fogo");
  t("entrar no veneno custa 2", efeitoDaCasa(sup, bandido(2), { momento: "entrar" }).dano === 2);
  t("a água sozinha não faz nada", efeitoDaCasa(sup, bandido(4), { momento: "turno" }) === null);
  const caiu = efeitoDaCasa(sup, bandido(3), { momento: "entrar", sorte: () => 0 });
  const firme = efeitoDaCasa(sup, bandido(3), { momento: "entrar", sorte: () => 0.99 });
  t("no óleo: o 1 escorrega e cai, o 20 fica de pé", caiu.condicoes[0].id === "caido" && firme.condicoes.length === 0 && firme.testes[0].passou);
  t("quem já está caído não cai outra vez", efeitoDaCasa(sup, { ...bandido(3), condicoes: [{ id: "caido" }] }, { momento: "entrar", sorte: () => 0 }) === null);
  const elemental = { nome: "Elemental Menor", perfil: { ataque: "fogo", resist: ["fogo"], fraqueza: ["gelo"] }, x: 1, y: 1, vida: 30 };
  t("a resistência conta: o elemental de fogo paga metade (2 de 3)", efeitoDaCasa(sup, elemental, { momento: "turno" }).dano === 2);
  t("quem voa passa por cima de tudo", efeitoDaCasa(sup, { nome: "Dragão Jovem", desc: "voa", x: 1, y: 1, vida: 90 }, { momento: "turno" }) === null);
  const grande = { nome: "Ogro", tamanho: "grande", x: 1, y: 1, vida: 40, des: 0, condicoes: [] };
  const g2 = efeitoDaCasa(sup, grande, { momento: "turno", sorte: () => 0.5 });
  t("o grande com um pé no fogo e outro no veneno paga os dois", g2.dano === 5 && g2.tipos.length === 2);
  const fer = feridosDoEvento({ tipo: "eletrifica", casas: [{ x: 1, y: 1 }], dano: 3, elemento: "raio", doChao: true, teste: { atributo: "destreza", cd: 12, falha: "atordoado" } },
    [bandido(1), { nome: "Morcego", desc: "voa", x: 1, y: 1, vida: 5 }, { nome: "Caído", x: 1, y: 1, vida: 0 }], { sorte: () => 0 });
  t("a água eletrificada fere quem pisa e atordoa quem falha; o que voa e o caído ficam de fora",
    fer.length === 1 && fer[0].nome === "Bandido" && fer[0].dano === 3 && fer[0].condicao.id === "atordoado");
}

sec("6. a duração acaba");
{
  let sup = [...bloco(1, 1, 1, 1, "fogo"), ...bloco(2, 2, 2, 2, "gelo"), ...bloco(3, 3, 3, 3, "eletrica")];
  const rodadas = [];
  for (let r = 0; r < 12; r++) { sup = passarRodada(sup).superficies; rodadas.push(sup.map((s) => s.tipo).sort().join()); }
  t("o fogo apaga-se em 2 rodadas", tipoEm(rodadas.length ? sup : [], 1, 1) === null);
  const fogoAoFim = (() => { let s = bloco(1, 1, 1, 1, "fogo"); let n = 0; while (s.length && n < 20) { s = passarRodada(s).superficies; n++; } return n; })();
  t(`… em exatamente ${SUPERFICIES.fogo.rodadas}`, fogoAoFim === SUPERFICIES.fogo.rodadas);
  const gelo = passarRodada(passarRodada(passarRodada(bloco(2, 2, 2, 2, "gelo")).superficies).superficies);
  t("o gelo derrete em água ao fim das suas rodadas (e a água conta as dela)", tipoEm(gelo.superficies, 2, 2) === "agua" && gelo.superficies[0].rodadas === SUPERFICIES.agua.rodadas && gelo.acabaram[0].vira === "agua");
  t("doze rodadas depois, nada do que é temporário sobra", sup.length === 0);
  const planta = superficiesDaPlanta(montarGrade({ local: "caverna" }));
  t("a poça da caverna nasce com a planta, sem fim (rodadas: null)", planta.length > 0 && planta.every((s) => s.tipo === "agua" && s.rodadas === null && s.permanente === true));
  let poca = planta;
  for (let r = 0; r < 30; r++) poca = passarRodada(poca).superficies;
  t("e não acaba nunca", poca.length === planta.length);
  const k = planta[0];
  const eletrica = aplicarElemento({ grade: montarGrade({ local: "caverna" }), superficies: planta }, { casas: [{ x: k.x, y: k.y }], elemento: "raio" });
  t("o raio na poça eletrifica a poça inteira", eletrica.superficies.filter((s) => s.tipo === "eletrica").length === planta.length);
  const voltou = passarRodada(eletrica.superficies).superficies;
  t("e no fim da rodada ela volta a ser a poça de sempre (sem fim)", voltou.length === planta.length && voltou.every((s) => s.tipo === "agua" && s.rodadas === null));
  const congela = aplicarElemento({ grade: montarGrade({ local: "caverna" }), superficies: planta }, { casas: [{ x: k.x, y: k.y }], elemento: "gelo" });
  let derrete = congela.superficies;
  for (let r = 0; r < SUPERFICIES.gelo.rodadas; r++) derrete = passarRodada(derrete).superficies;
  t("a poça gelada derrete de volta na poça de sempre", derrete.every((s) => s.tipo === "agua" && s.rodadas === null));
  t("as plantas com chão de nascença declaram tipos da tabela", Object.values(PLANTAS).every((p) => (p.superficies || []).every((s) => Object.hasOwn(SUPERFICIES, s[4]))));
  t("sem grade, a planta não traz chão", superficiesDaPlanta(null).length === 0 && superficiesDaPlanta({}).length === 0);
}

sec("7. os inimigos não entram no fogo de livre vontade");
{
  const g = { cenario: "estrada", largura: 12, altura: 5, paredes: [], estorvos: [] };
  const heroi = { nome: "Bran", x: 9, y: 2, vida: 30 };
  const orc = { nome: "Orc", x: 1, y: 2, vida: 20, ameaca: "comum" };
  const fogo = [];
  for (let y = 0; y < 5; y++) fogo.push({ x: 4, y, tipo: "fogo", rodadas: 2 });
  const evitar = casasQueSeEvitam(fogo);
  t("as casas que se evitam são as do fogo (5)", evitar.size === 5 && evitar.has("4,2"));
  const semFogo = moverInimigos(g, [orc], heroi, [heroi]);
  const comFogo = moverInimigos(g, [orc], heroi, [heroi], { evitar });
  const passou = (e) => e.x >= 4;
  t(`sem fogo o Orc avança (${semFogo.inimigos[0].x},${semFogo.inimigos[0].y})`, semFogo.inimigos[0].x > orc.x);
  t(`com a parede de fogo ele pára antes dela (${comFogo.inimigos[0].x},${comFogo.inimigos[0].y})`, !passou(comFogo.inimigos[0]) && !evitar.has(`${comFogo.inimigos[0].x},${comFogo.inimigos[0].y}`));
  const furo = fogo.filter((c) => c.y !== 0);
  const comFuro = moverInimigos(g, [orc], heroi, [heroi], { evitar: casasQueSeEvitam(furo) });
  t("com um furo na parede de fogo, ele não pisa fogo nenhum", !casasQueSeEvitam(furo).has(`${comFuro.inimigos[0].x},${comFuro.inimigos[0].y}`));
  t("sem `evitar`, o passo é byte a byte o de antes", J(moverInimigos(g, [orc], heroi, [heroi], null)) === J(semFogo) && J(moverInimigos(g, [orc], heroi, [heroi], { evitar: [] })) === J(semFogo));
  t("o óleo e a água não se evitam", casasQueSeEvitam(bloco(1, 1, 2, 2, "oleo").concat(bloco(5, 1, 5, 1, "agua"))).size === 0);
}

sec("8. os perigos do caminho");
{
  /* um corredor de uma casa de largo: o caminho só passa por onde há chão */
  const g = { cenario: "estrada", largura: 12, altura: 1, paredes: [], estorvos: [] };
  const heroi = { nome: "Bran", x: 1, y: 0, vida: 30, atributos: { destreza: 2 } };
  const sup = [{ x: 3, y: 0, tipo: "fogo", rodadas: 2 }, { x: 4, y: 0, tipo: "oleo", rodadas: 10 }, { x: 5, y: 0, tipo: "agua", rodadas: 6 }];
  const c = caminhoComProvocacoes(g, heroi, { x: 6, y: 0 }, [], { superficies: sup });
  t("o caminho acende o fogo (3) e o óleo (o teste), e não a água", c.perigos.length === 2 && c.perigos[0].tipo === "fogo" && c.perigos[0].dano === 3 && c.perigos[1].teste && c.perigos[1].teste.cd === 10);
  t("a chance do teste no óleo é a do d20 + Destreza (21 + 2 − 10)/20", Math.abs(c.perigos[1].teste.chance - 0.65) < 1e-9);
  t("sem superfícies, perigos vazio (o caminho de antes)", caminhoComProvocacoes(g, heroi, { x: 6, y: 0 }, [], {}).perigos.length === 0);
  t("quem voa não tem perigo no chão", perigosNoCaminho(sup, [{ x: 3, y: 0 }], { nome: "Dragão", desc: "voa" }).length === 0);
}

sec("9. a mesma semente, o mesmo chão — e o lixo");
{
  const corre = (sem) => {
    const r = rng(hashSemente(sem));
    const g = montarGrade({ local: "taverna" });
    let st = { grade: g, superficies: superficiesDaPlanta(g), vistas: [] };
    const quem = [{ nome: "A", x: 5, y: 5, vida: 20, des: 1 }, { nome: "B", x: 8, y: 6, vida: 20, des: 0 }];
    const log = [];
    for (let i = 0; i < 20; i++) {
      const el = ["fogo", "gelo", "raio", "veneno", "agua", "oleo"][Math.floor(r() * 6)];
      const x = Math.floor(r() * 12), y = Math.floor(r() * 9);
      const d = marcaDoAtaque(st, { elemento: el, casas: [{ x, y }, { x: x + 1, y }], centro: { x, y }, area: r() < 0.5 });
      st = { grade: d.grade, superficies: d.superficies, vistas: d.vistas };
      for (const ev of d.eventos) log.push(J(feridosDoEvento(ev, quem, { sorte: r })));
      for (const q of quem) log.push(J(efeitoDaCasa(st.superficies, q, { momento: "turno", sorte: r })));
      st = { ...st, superficies: passarRodada(st.superficies).superficies };
    }
    return J(st) + log.join("|");
  };
  t("a mesma semente dá o mesmo chão, os mesmos feridos e os mesmos testes", corre("chao|1") === corre("chao|1"));
  t("e outra semente dá outro", corre("chao|1") !== corre("chao|2"));
  let lixoOk = true;
  for (const lixo of [null, undefined, {}, [], 7, "x"]) {
    try {
      const d = aplicarElemento(lixo, lixo);
      if (!Array.isArray(d.superficies) || d.eventos.length) lixoOk = false;
      if (efeitoDaCasa(lixo, lixo) !== null) lixoOk = false;
      if (!Array.isArray(passarRodada(lixo).superficies)) lixoOk = false;
      if (casasQueSeEvitam(lixo).size) lixoOk = false;
      if (feridosDoEvento(lixo, lixo).length) lixoOk = false;
      if (perigosNoCaminho(lixo, lixo, lixo).length) lixoOk = false;
      if (previsaoDoObjeto(lixo, lixo) !== null) lixoOk = false;
    } catch (e) { lixoOk = false; console.log(e); }
  }
  t("o lixo (null, {}, [], número, texto) não estoura e não inventa chão", lixoOk);
  t("o save com chão desconhecido ou sem casa é ignorado", passarRodada([{ x: 1, y: 1, tipo: "lava", rodadas: 3 }, { tipo: "fogo", rodadas: 2 }, null]).superficies.length === 0);
  const sup = bloco(1, 1, 2, 1, "oleo");
  const copia = J(sup);
  const g = grade([{ x: 5, y: 5, tipo: "barril_de_oleo" }]);
  const gCopia = J(g);
  aplicarElemento({ grade: g, superficies: sup, vistas: [] }, { casas: [{ x: 1, y: 1 }, { x: 5, y: 5 }], elemento: "fogo" });
  passarRodada(sup);
  t("nada é mutado: o chão e a grade que entraram saem iguais", J(sup) === copia && J(g) === gCopia);
}

sec("10. o som da reação, e a régua");
{
  const R = SOM_DA_MESA.luta.reacao;
  const dur = (m) => Math.max(...SOM_DA_MESA.luta[m].map((v) => v.em + v.dura));
  t("o momento `reacao` está em SOM_DA_MESA.luta, congelado, no formato dos outros",
    Array.isArray(R) && R.length > 0 && Object.isFrozen(R) && R.every((v) => ["em", "freq", "onda", "dura", "ganho"].every((k) => k in v)));
  t("e é mais curto que a queda (a queda continua a ser o som mais longo)", dur("reacao") < dur("queda"));
  t("o chão na régua nasce desligado (o App ainda não o pinta)", SUPERFICIES_NA_REGUA.ligado === false && SUPERFICIES_NA_REGUA.espacoEntreAlvos >= 3);
  let iguais = true;
  for (let i = 0; i < 40; i++) {
    const a = simularCombate("justo", `chao-regua|${i}`, { comAdversario: false });
    const b = simularCombate("justo", `chao-regua|${i}`, { comAdversario: false, comSuperficies: false });
    if (J(a) !== J(b)) iguais = false;
  }
  t("desligado, a régua é byte a byte a de sempre (40 lutas do justo)", iguais);
  let n = 0, vSem = 0, vCom = 0, dSem = 0, dCom = 0;
  for (let i = 0; i < 200; i++) {
    const a = simularCombate("justo", `chao-teto|${i}`, { comAdversario: false });
    const b = simularCombate("justo", `chao-teto|${i}`, { comAdversario: false, comSuperficies: true });
    n++; vSem += a.vitoria; vCom += b.vitoria; dSem += a.danoDesferido; dCom += b.danoDesferido;
  }
  /* O TETO (o inimigo nunca sai do fogo): medido a 10/11 com 600 lutas, o
     justo do molde vai de 55,2% a 59,0% de vitória, dentro da faixa de 35%
     a 65% que a arena persegue. Esta catraca guarda que o chão não sai da
     faixa nem com o inimigo parado nele — se um número de SUPERFICIES
     subir, é aqui que se vê. */
  t(`ligado, o chão soma dano (${(dSem / n).toFixed(1)} → ${(dCom / n).toFixed(1)}) e o justo fica na faixa (${(vSem / n * 100).toFixed(1)}% → ${(vCom / n * 100).toFixed(1)}%)`,
    dCom > dSem && vCom / n >= 0.35 && vCom / n <= 0.65);
}

console.log(`\nas superfícies: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
