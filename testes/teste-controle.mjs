/* teste-controle.mjs (v9.54) — a quinta e última família da onda 2:
   virar, parar, calar e provocar. A única que precisou entrar no motor
   do turno dos inimigos.                                                */
import { CONTROLES, controleDe, aplicarControle, estaVirado, viradosEm, estaProvocando, expirarControles } from "../src/controle.js";
import { turnoDosInimigos, turnoDosCompanheiros } from "../src/combate.js";
import { invocacaoDe } from "../src/invocacoes.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const catalogo = [];
for (const c of CLASSES) for (const h of (c.habilidades || [])) catalogo.push(h);
for (const arr of Object.values(SUBCLASSES)) for (const h of (arr || [])) catalogo.push(h);
for (const arr of Object.values(ESPECIALIZACOES)) for (const h of (arr || [])) catalogo.push(h);
const hab = (nome) => catalogo.find((h) => h.nome === nome) || null;

const inim = (nome, extra = {}) => ({ nome, vida: 30, vidaMax: 30, ameaca: "comum", nivel: 3, x: 3, y: 3, ...extra });
const heroi = { nome: "Vera", vida: 60, vidaMax: 60, atributos: { destreza: 2 }, x: 3, y: 8 };

sec("1. as seis que mexiam no inimigo e não mexiam em nada");
{
  for (const n of ["Marionete", "Discórdia", "Corte de Marionetes", "Selo de Interdito", "Silêncio Que Grita", "Palco Aberto"]) {
    const h = hab(n);
    t(`"${n}" existe no catálogo`, !!h);
    t(`  e o sistema a reconhece`, !!controleDe(h));
  }
  /* a armadilha da tabela: "Corte de Marionetes" contém "marionetes" */
  t("Marionete é Marionete", controleDe(hab("Marionete")).id === "marionete");
  t("e Corte de Marionetes NÃO vira Marionete", controleDe(hab("Corte de Marionetes")).id === "corte_marionetes");
  t("Bola de Fogo não controla ninguém", !controleDe({ nome: "Bola de Fogo", descricao: "Chamas." }));
  t("habilidade vazia também não", !controleDe({}) && !controleDe(null));
  t("todo controle tem prazo", CONTROLES.every((c) => c.turnos > 0));
  t("e um modo conhecido", CONTROLES.every((c) => ["virar", "parar", "calar", "provocar"].includes(c.modo)));
}

sec("2. VIRAR: a marionete passa a bater nos próprios");
{
  const lista = [inim("Bandido"), inim("Capanga"), inim("Chefe")];
  const r = aplicarControle(lista, controleDe(hab("Marionete")), { rodada: 2, nomeHab: "Marionete", alvoNome: "Capanga" });
  t("aplica", r.ok);
  t("vira exatamente um", r.nomes.length === 1);
  t("e vira o que o jogador declarou", r.nomes[0] === "Capanga");
  const virado = r.inimigos.find((e) => e.nome === "Capanga");
  t("o inimigo fica marcado", estaVirado(virado, 2));
  t("o prazo é de três turnos", virado.virado.ate === 5);
  t("os outros não", !estaVirado(r.inimigos.find((e) => e.nome === "Chefe"), 2));
  t("o jogador lê o que aconteceu", /passa a lutar contra os próprios/.test(r.linha));
  t("o Mestre é proibido de fazê-la me atacar", /NÃO o faça me atacar/.test(r.nota));

  const d = aplicarControle(lista, controleDe(hab("Discórdia")), { rodada: 1, nomeHab: "Discórdia" });
  t("a Discórdia vira DOIS", d.ok && d.nomes.length === 2);
  t("e por dois turnos", d.inimigos.find((e) => e.nome === d.nomes[0]).virado.ate === 3);
}

sec("2b. as recusas que salvam o turno");
{
  const so = [inim("Solitário")];
  const r = aplicarControle(so, controleDe(hab("Marionete")), { rodada: 1, nomeHab: "Marionete" });
  t("virar o último de pé é recusado", !r.ok && /sozinho/.test(r.linha));
  const par = [inim("A"), inim("B")];
  const d = aplicarControle(par, controleDe(hab("Discórdia")), { rodada: 1, nomeHab: "Discórdia" });
  t("num par, a Discórdia vira um só — tem de sobrar em quem bater", d.ok && d.nomes.length === 1);
  const mortos = [inim("A", { vida: 0, derrotado: true })];
  t("sem ninguém de pé, recusa", !aplicarControle(mortos, controleDe(hab("Marionete")), { nomeHab: "M" }).ok);
  /* a Regra do Degrau */
  const deus = [inim("Avatar", { gd: 4 }), inim("Servo")];
  const rg = aplicarControle(deus, controleDe(hab("Marionete")), { rodada: 1, nomeHab: "Marionete", podeVirar: (e) => !e.gd });
  t("não se toma a vontade de quem está degraus acima", rg.ok && rg.nomes[0] === "Servo");
  const soDeus = [inim("Avatar", { gd: 4 }), inim("Outro Avatar", { gd: 4 })];
  t("e se só há deuses, recusa", !aplicarControle(soDeus, controleDe(hab("Marionete")), { rodada: 1, nomeHab: "M", podeVirar: (e) => !e.gd }).ok);
}

sec("3. e o motor do turno obedece: a marionete bate no aliado dela");
{
  const lista = [inim("Bruto", { ameaca: "elite" }), inim("Alvo")];
  const r = aplicarControle(lista, controleDe(hab("Marionete")), { rodada: 1, nomeHab: "Marionete", alvoNome: "Bruto" });
  const acoes = turnoDosInimigos({ inimigos: r.inimigos, jogador: heroi, grupo: [], rodada: 1, heroi });
  const doBruto = acoes.filter((a) => a.inimigo === "Bruto");
  t("o virado age", doBruto.length > 0);
  t("e o alvo dele é um INIMIGO, não eu", doBruto.every((a) => a.alvoRef === "inimigo" && a.alvoNome === "Alvo"));
  t("o golpe vem marcado como virado", doBruto.every((a) => a.virado === true));
  const doAlvo = acoes.filter((a) => a.inimigo === "Alvo");
  t("quem não foi virado continua vindo para cima de mim", doAlvo.every((a) => a.alvoRef === "jogador"));

  /* sem ninguém em quem bater, a marionete fica parada em vez de me atacar */
  const par = [inim("A"), inim("B")];
  const dois = aplicarControle(par, controleDe(hab("Discórdia")), { rodada: 1, nomeHab: "Discórdia" });
  const forcado = dois.inimigos.map((e) => ({ ...e, virado: { ate: 3, por: "Discórdia" } }));
  const acoes2 = turnoDosInimigos({ inimigos: forcado, jogador: heroi, grupo: [], rodada: 1, heroi });
  t("virados todos, ninguém me ataca", acoes2.every((a) => a.alvoRef !== "jogador"));
}

sec("4. PARAR e CALAR viram condição — que o jogo já sabe cobrar");
{
  const lista = [inim("Zumbi"), inim("Bandido")];
  const sel = aplicarControle(lista, controleDe(hab("Selo de Interdito")), { rodada: 1, nomeHab: "Selo de Interdito", alvoNome: "Zumbi" });
  t("o selo pega o morto-vivo", sel.ok && sel.nomes[0] === "Zumbi");
  t("e aplica uma condição de verdade", (sel.inimigos.find((e) => e.nome === "Zumbi").condicoes || []).some((c) => c.id === "paralisado"));
  t("com o prazo da habilidade", (sel.inimigos.find((e) => e.nome === "Zumbi").condicoes || [])[0].turnos === 3);
  t("o bandido fica intacto", !(sel.inimigos.find((e) => e.nome === "Bandido").condicoes || []).length);

  const soGente = [inim("Bandido"), inim("Capanga")];
  const nada = aplicarControle(soGente, controleDe(hab("Selo de Interdito")), { rodada: 1, nomeHab: "Selo de Interdito", alvoNome: "Bandido" });
  t("contra gente viva o selo recusa, e diz por quê", !nada.ok && /demônios e mortos-vivos/.test(nada.linha));

  /* o inimigo parado de verdade não age */
  const acoes = turnoDosInimigos({ inimigos: sel.inimigos, jogador: heroi, grupo: [], rodada: 1, heroi });
  t("o selado não dá um golpe", !acoes.some((a) => a.inimigo === "Zumbi" && a.r && a.r.dano > 0));

  const corte = aplicarControle(soGente, controleDe(hab("Corte de Marionetes")), { rodada: 1, nomeHab: "Corte de Marionetes" });
  t("o Corte pega TODOS", corte.ok && corte.nomes.length === 2);
  t("por um turno só", corte.inimigos[0].condicoes[0].turnos === 1);
}

sec("4b. o silêncio morde quem conjura, e só");
{
  const mistos = [inim("Bruto"), inim("Feiticeiro Sombrio")];
  const s = aplicarControle(mistos, controleDe(hab("Silêncio Que Grita")), { rodada: 1, nomeHab: "Silêncio Que Grita" });
  t("aplica no conjurador", s.ok && s.nomes.includes("Feiticeiro Sombrio"));
  t("e NÃO no bruto de porrete", !s.nomes.includes("Bruto"));
  const soBrutos = [inim("Bandido"), inim("Capanga")];
  const nada = aplicarControle(soBrutos, controleDe(hab("Silêncio Que Grita")), { rodada: 1, nomeHab: "S" });
  t("sem conjurador em cena, recusa e explica", !nada.ok && /ninguém aqui conjura/.test(nada.linha));
}

sec("5. PROVOCAR: o palco rouba a atenção de todos");
{
  const lista = [inim("A"), inim("B"), inim("C")];
  const r = aplicarControle(lista, controleDe(hab("Palco Aberto")), { rodada: 2, nomeHab: "Palco Aberto" });
  t("aplica", r.ok);
  t("não mexe em inimigo nenhum", r.inimigos === lista);
  t("devolve a provocação com prazo", r.provocacao && r.provocacao.ate === 4);
  const comb = { provocacao: r.provocacao };
  t("está provocando na rodada 2", estaProvocando(comb, 2));
  t("e na 3", estaProvocando(comb, 3));
  t("mas não na 4", !estaProvocando(comb, 4));
  t("sem provocação nenhuma, falso", !estaProvocando({}, 1) && !estaProvocando(null, 1));

  /* a metade que importa: o companheiro para de apanhar */
  const grupo = [{ nome: "Ilse", vida: 20, vidaMax: 20 }];
  let noComp = 0;
  for (let i = 0; i < 200; i++) {
    const ac = turnoDosInimigos({ inimigos: lista, jogador: heroi, grupo, rodada: 2, heroi, provocado: true });
    if (ac.some((a) => a.alvoRef === "grupo")) noComp++;
  }
  t("provocado, nenhum golpe cai no companheiro", noComp === 0);
  let semProv = 0;
  for (let i = 0; i < 200; i++) {
    const ac = turnoDosInimigos({ inimigos: lista, jogador: heroi, grupo, rodada: 2, heroi, provocado: false });
    if (ac.some((a) => a.alvoRef === "grupo")) semProv++;
  }
  console.log(`      rodadas com golpe no companheiro: sem palco ${semProv}/200 · com palco ${noComp}/200`);
  t("e sem o palco ele apanha como sempre", semProv > 50);

  /* e a outra metade: o grupo age com vantagem */
  let comDoisDados = 0;
  for (let i = 0; i < 60; i++) {
    const ac = turnoDosCompanheiros({ grupo, inimigos: lista, jogador: heroi, rodada: 2, provocado: true });
    for (const a of ac) if (a.r && a.r.modo === "vantagem") comDoisDados++;
  }
  t("os companheiros rolam com vantagem", comDoisDados > 0);
}

sec("6. os fios arrebentam no prazo");
{
  const lista = [inim("A"), inim("B")];
  const r = aplicarControle(lista, controleDe(hab("Marionete")), { rodada: 1, nomeHab: "Marionete", alvoNome: "A" });
  t("na rodada 3 ainda está virado", expirarControles(r.inimigos, 3).linhas.length === 0);
  const fim = expirarControles(r.inimigos, 4);
  t("na 4 se solta", fim.linhas.length === 1);
  t("o jogador lê a soltura", /volta a si/.test(fim.linhas[0]));
  t("e a ficha do inimigo não fica com lixo", fim.inimigos.find((e) => e.nome === "A").virado === undefined);
  t("sem ninguém virado, não faz nada", expirarControles(lista, 9).linhas.length === 0);
  t("viradosEm conta certo", viradosEm(r.inimigos, 1).length === 1 && viradosEm(r.inimigos, 9).length === 0);
}

sec("7. a cópia entra pela porta das invocações");
{
  const ml = hab("Mentira Luminosa");
  t("\"Mentira Luminosa\" existe", !!ml);
  const inv = invocacaoDe(ml);
  t("e agora é uma invocação de verdade", !!inv);
  t("que dura o turno que a descrição promete", inv && inv.turnos === 1);
  t("e é frágil — é luz, não carne", inv && inv.pv <= 8);
}

console.log(`\ncontrole de inimigo v9.54: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
