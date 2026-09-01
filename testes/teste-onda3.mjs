/* teste-onda3.mjs (v9.54) — o que fazia o jogo esvaziar com o tempo:
   as classes que congelavam, a masmorra sem razão para explorar, as
   tochas, a essência da forja e a fama que travava em 70.            */
import { PERFIS_COMBATE, perfilCombate, ataquesPorTurno, dadosDeDano, danoDaClasse, resumoAcaoDeTurno, marcosDaClasse, maiorVaoSemGanho, proximoGanho } from "../src/combate.js";
import { gerarMasmorra, tochasIniciais, entrarNaSala, marcarResolvida, acenderTochas, desgasteDoChefe, chefeDesgastado, saidasDe, DESGASTE_POR_SALA, DESGASTE_MAXIMO, RITMOS, ritmoPorId } from "../src/masmorras.js";
import { essenciaDe, essenciaDeEspolio, essenciaDoChefe, ESSENCIA_POR_AMEACA, CUSTO_FORJA } from "../src/loot.js";
import { PATAMARES_FAMA, patamarFama, calcularFama } from "../src/fama.js";
import { CONQUISTAS } from "../src/conquistas.js";
import { CONSUMIVEIS, consumivelPorId, usarConsumivel, descricaoCurta } from "../src/pocoes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const classes = Object.keys(PERFIS_COMBATE);

sec("1. as cinco classes que paravam de crescer no nível 5");
{
  const congelavam = ["Monge", "Caçador", "Engenheiro", "Clérigo", "Bardo"];
  for (const c of congelavam) {
    t(`${c}: ganha dado maior no 11`, dadosDeDano(c, 11) > dadosDeDano(c, 10));
    t(`${c}: e outro no 17`, dadosDeDano(c, 17) > dadosDeDano(c, 16));
  }
  t("o Guerreiro mantém o dado — o eixo dele é o número de golpes", dadosDeDano("Guerreiro", 20) === 1 && dadosDeDano("Guerreiro", 1) === 1);
  t("e continua ganhando o 3º e o 4º ataque", ataquesPorTurno("Guerreiro", 11) === 3 && ataquesPorTurno("Guerreiro", 20) === 4);
  t("o Ladino segue subindo de dois em dois", dadosDeDano("Ladino", 20) === 11);
  t("os conjuradores não mudaram", dadosDeDano("Mago", 20) === 4 && dadosDeDano("Mago", 4) === 1);
}

sec("2. o piso: ninguém pode ficar parado mais que nove níveis");
{
  for (const c of classes) {
    const vao = maiorVaoSemGanho(c);
    const marcos = marcosDaClasse(c).map((m) => m.nivel).join(",");
    t(`${c.padEnd(11)} vão ${String(vao).padStart(2)} · marcos ${marcos || "—"}`, vao <= 9);
  }
  t("só o Guerreiro chega aos nove (11→20, o maior salto do jogo)", classes.filter((c) => maiorVaoSemGanho(c) === 9).join() === "Guerreiro");
  t("toda classe tem pelo menos três degraus", classes.every((c) => marcosDaClasse(c).length >= 3));
}

sec("3. e o dano por turno cresce de verdade no segundo tempo");
{
  const media = (c, nv) => {
    const n = ataquesPorTurno(c, nv);
    let s = 0;
    for (let i = 0; i < 3000; i++) { let x = 0; for (let g = 0; g < n; g++) x += danoDaClasse(c, nv, 3 + Math.floor(nv / 4)); s += x; }
    return s / 3000;
  };
  for (const c of classes) {
    const nv5 = media(c, 5), nv20 = media(c, 20);
    const mult = nv20 / nv5;
    t(`${c.padEnd(11)} nv5 ${nv5.toFixed(1)} → nv20 ${nv20.toFixed(1)} (${mult.toFixed(1)}×)`, mult >= 1.9);
  }
  /* o Guerreiro continua sendo o maior batedor de arma pura */
  t("o Guerreiro ainda bate mais que o Monge no 20", media("Guerreiro", 20) > media("Monge", 20));
}

sec("4. a ficha passa a dizer o dado e o que vem pela frente");
{
  const r = resumoAcaoDeTurno("Monge", 17);
  t("o resumo do marcial traz o dado", /3d6/.test(r.texto) && r.dados === 3);
  t("e a face, para a pílula da ficha", r.face === 6);
  const p = proximoGanho("Monge", 8);
  t("o próximo degrau do Monge nv8 é o 11", p && p.nivel === 11);
  t("e diz o que ganha", /dado de dano/.test(p.texto));
  const pg = proximoGanho("Guerreiro", 12);
  t("o do Guerreiro nv12 é o 20, e é ataque", pg && pg.nivel === 20 && /ataque/.test(pg.texto));
  t("no nível 20 não há mais degrau", proximoGanho("Ladino", 20) === null);
}

sec("5. as tochas param de acabar sempre no mesmo lugar");
{
  let semLuzAntesDoFim = 0, sobrouDemais = 0;
  for (let i = 0; i < 300; i++) {
    const mm = gerarMasmorra("Fantasia medieval", 10);
    const passos = mm.salas.length - 1;              // a entrada não custa
    t.silent = true;
    if (mm.tochas < Math.ceil(passos * 0.6)) semLuzAntesDoFim++;
    if (mm.tochas >= passos) sobrouDemais++;
  }
  console.log(`      em 300 masmorras: ${semLuzAntesDoFim} com luz curta demais · ${sobrouDemais} com luz para tudo`);
  t("nunca tão pouca que o escuro seja inevitável cedo", semLuzAntesDoFim === 0);
  t("nem tanta que dê para varrer tudo sem pensar", sobrouDemais < 90);
  t("o cálculo olha o tamanho da masmorra", tochasIniciais(new Array(20)) > tochasIniciais(new Array(6)));
  t("e nunca desce de cinco", tochasIniciais([]) >= 5);
}

sec("5b. o ritmo cauteloso enfim CUSTA o que a tabela prometia");
{
  t("a tabela promete uma tocha extra ao cauteloso", ritmoPorId("cauteloso").tochaExtra === 1);
  const mm = gerarMasmorra("Fantasia medieval", 5);
  const destino = saidasDe(mm)[0].id;
  const normal = entrarNaSala({ ...mm, ritmo: "normal" }, destino);
  const caut = entrarNaSala({ ...mm, ritmo: "cauteloso" }, destino);
  t("passo normal queima uma", normal.mm.tochas === mm.tochas - 1);
  t("passo cauteloso queima duas", caut.mm.tochas === mm.tochas - 2);
  t("e o jogador é avisado do preço", caut.msgs.some((m) => /cauteloso/i.test(m)));
  t("o apressado não paga extra", entrarNaSala({ ...mm, ritmo: "apressado" }, destino).mm.tochas === mm.tochas - 1);
}

sec("5c. dá para comprar e acender tocha");
{
  const feixe = consumivelPorId("tochas");
  t("existe um feixe de tochas no catálogo", !!feixe);
  t("é barato — não é poder, é permissão para explorar", feixe.valor <= 25);
  t("a bolsa diz o que ele faz", /tochas/.test(descricaoCurta(feixe)));
  const r = usarConsumivel({ nome: "V", vida: 10, vidaMax: 10 }, "tochas");
  t("usar declara quantas tochas", r && r.tochas === 3);
  t("e não mexe na ficha", r.ent.vida === 10);

  const mm = gerarMasmorra("Fantasia medieval", 5);
  const gasto = { ...mm, tochas: 1 };
  const a = acenderTochas(gasto, 3);
  t("acender soma", a.mm.tochas === 4);
  t("o jogador lê quantas ficaram", /4 no total/.test(a.linha));
  const cheio = acenderTochas({ ...mm, tochas: 99 }, 3);
  t("mas há um teto — o feixe não vira licença para varrer tudo", cheio.mm.tochas === 99 && /demais/.test(cheio.linha));
}

sec("6. a masmorra passa a dar razão para explorar");
{
  const mm = gerarMasmorra("Fantasia medieval", 10);
  t("sem limpar nada, o chefe está inteiro", desgasteDoChefe(mm).fracao === 0);
  let m2 = mm;
  const limpaveis = mm.salas.filter((s) => s.tipo !== "entrada" && s.tipo !== "chefe");
  for (const s of limpaveis.slice(0, 3)) m2 = marcarResolvida(m2, s.id);
  const d3 = desgasteDoChefe(m2);
  t("três salas limpas = três degraus de desgaste", d3.salas === 3 && Math.abs(d3.fracao - 3 * DESGASTE_POR_SALA) < 1e-9);

  const chefe = [{ nome: "O Senhor do Poço", vida: 200, vidaMax: 200, ameaca: "elite" }];
  const inteiro = chefeDesgastado(mm, chefe);
  t("sem exploração, nada muda", inteiro.inimigos[0].vidaMax === 200 && inteiro.linha === "");
  const gasto = chefeDesgastado(m2, chefe);
  t("com três salas, o chefe entra mais fraco", gasto.inimigos[0].vidaMax < 200);
  console.log(`      chefe: 200 PV → ${gasto.inimigos[0].vidaMax} PV depois de 3 salas`);
  t("o jogador lê o motivo", /salas que você limpou/.test(gasto.linha));
  t("o Mestre é proibido de narrar como fraqueza dele", /nunca como fraqueza/.test(gasto.nota));

  /* o teto: limpar tudo não trivializa o confronto */
  let tudo = mm;
  for (const s of limpaveis) tudo = marcarResolvida(tudo, s.id);
  const max = chefeDesgastado(tudo, chefe);
  t("mesmo limpando tudo, o chefe guarda mais de metade", max.inimigos[0].vidaMax >= 200 * (1 - DESGASTE_MAXIMO));
  t("o teto é de 40%", desgasteDoChefe(tudo).fracao <= DESGASTE_MAXIMO + 1e-9);
  t("a sala do chefe não conta como explorada", !mm.salas.filter((s) => s.tipo === "chefe").some((s) => s.resolvida));
}

sec("7. a forja deixa de depender só de desmontar");
{
  t("bicho comum não deixa essência", essenciaDeEspolio([{ ameaca: "comum" }, { ameaca: "fraco" }]) === 0);
  t("elite deixa", essenciaDeEspolio([{ ameaca: "elite" }]) === 3);
  t("lendário deixa mais", essenciaDeEspolio([{ ameaca: "lendario" }]) === 8);
  t("e soma o bando", essenciaDeEspolio([{ ameaca: "elite" }, { ameaca: "elite" }, { ameaca: "competente" }]) === 7);
  t("lista vazia não quebra", essenciaDeEspolio() === 0 && essenciaDeEspolio([]) === 0);
  t("o chefe da masmorra é a maior fonte", essenciaDoChefe(10) > essenciaDe({ raridade: "raro" }));
  t("e cresce com o nível", essenciaDoChefe(20) > essenciaDoChefe(5));
  /* a régua: uma forja incomum deve sair de umas três lutas duras ou de um chefe */
  const incomum = CUSTO_FORJA.incomum.essencia;
  t("três lutas com dois elites pagam uma forja incomum", essenciaDeEspolio([{ ameaca: "elite" }, { ameaca: "elite" }]) * 3 >= incomum);
  t("um chefe paga sozinho, e é isso que faz descer valer a pena", essenciaDoChefe(5) >= incomum);
  t("mas não paga uma épica de uma vez só", essenciaDoChefe(20) < CUSTO_FORJA.epico.essencia);
}

sec("8. a fama deixa de travar em 70");
{
  t("há degrau acima de Lenda Viva", PATAMARES_FAMA.some((p) => p.min > 70));
  t("são dois", PATAMARES_FAMA.filter((p) => p.min > 70).length === 2);
  t("70 ainda é Lenda Viva", patamarFama(70).rotulo === "Lenda Viva");
  t("85 já é outra coisa", patamarFama(85).rotulo === "Nome de Canção");
  t("100 é o topo", patamarFama(100).rotulo === "Mito em Vida");
  t("o topo é alcançável — calcularFama chega a 100", calcularFama({ combatesVencidos: 20, elitesDerrotados: 5, lendariosDerrotados: 2, masmorrasConcluidas: 4 }, 20, 1) >= 100);
  t("os patamares sobem sem buraco", PATAMARES_FAMA.every((p, i) => i === 0 || p.min > PATAMARES_FAMA[i - 1].min));
  t("cada um tem nota própria", PATAMARES_FAMA.every((p) => p.nota && p.nota.length > 10));
  t("nenhum rótulo repetido", new Set(PATAMARES_FAMA.map((p) => p.rotulo)).size === PATAMARES_FAMA.length);

  const nomes = CONQUISTAS.map((c) => c.nome);
  t("nenhuma conquista tem nome repetido", new Set(nomes).size === nomes.length);
  t("nenhum id repetido", new Set(CONQUISTAS.map((c) => c.id)).size === CONQUISTAS.length);
  t("o topo da fama tem marco próprio", CONQUISTAS.some((c) => c.id === "mito_em_vida"));
}

console.log(`\nonda 3 v9.54: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
