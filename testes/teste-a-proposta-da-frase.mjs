/* A PROPOSTA DA FRASE (04/11/2026) — src/motor/a-proposta-da-frase.js

   A ordem da pessoa: a frase que o sistema lê como ato não age, propõe — um
   cartão «Ir até o mercado…» que, tocado, mostra só o que o herói sabe e o
   botão. Esta suíte prova, no mundo da 17.ª (o léxico, a abertura e a
   principal como a abertura as cria):
   §1 as tabelas: cada frase passa no verificador da ficha; a ordem cobre
      todos os efeitos e cada um tem glifo, verbo e botão;
   §2 o lixo não estoura; sem efeito, sem proposta; a frase que acorda outra
      porta (luta, magia, frasco) não propõe;
   §3 O QUE SE SABE DO SÍTIO: a pista trabalha no Descanso (a abertura
      disse-o) — e nunca «está lá» nem a hora; a missão manda procurar o
      Theron na catedral de Vale Verde, não na de Torre Alto; quem se viu lá
      entra com o dia; o Descanso de Vale Verde não tem o Godfrey;
   §4 cada efeito: o passo, a estrada, o seguir, a masmorra, o sono, a compra;
   §5 dois efeitos: o título é do movimento e o outro vai «e …»; a estrada
      cala o passo; a compra que não fecha não propõe;
   §6 a mesma leitura dá o mesmo; o teto das linhas.
   A 2.ª leva: §7 atacar (o veredito do crime no cartão), §8 a habilidade
   (o PM; a falta impede), §9 quem não está aqui (só com o verbo de ter com
   alguém; o «ir» só para o sítio desta cidade), §10 esperar, §11 pagar (o
   quarto e a noite), §12 vender. */
import { aPropostaDaFrase, oQueSeSabeDoSitio, oQueSeSabeDaPessoa, aPessoaChamada, A_PROPOSTA_DA_FRASE } from "../src/motor/a-proposta-da-frase.js";
import { aPessoaDoPasso } from "../src/motor/a-pessoa-do-passo.js";
import { verificarAFicha } from "../src/motor/ficha-de-ator.js";
import { garantirAbertura } from "../src/abertura.js";
import { criarMissao } from "../src/missoes.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const tpl = (x, v) => String(x).replace(/\{([A-Z])\}/g, (_, k) => (v[k] != null ? v[k] : ""));

/* ---------------- o mundo da 17.ª ---------------- */
const LEX = { tavernas: ["A Caneca Torta", "O Descanso do Carroceiro"], lugares: [
  { tipo: "taverna", chamado: "Estalagem", nomes: ["A Caneca Torta", "O Descanso do Carroceiro"] },
  { tipo: "templo", chamado: "Catedral", nomes: ["Ermida do Sino", "Catedral da Cinza"] },
  { tipo: "mercado", chamado: "Bazar", nomes: ["Feira do Sal", "Bazar das Especiarias"] },
] };
const MAPA = { cidades: [{ nome: "Torre Alto", tipo: "capital", porte: "capital", populacao: 60000, regiao: "Planalto" }, { nome: "Vale Verde", tipo: "capital", porte: "capital", populacao: 9000, regiao: "Planalto" }] };
const MUNDO = { genero: "Fantasia medieval", molde: "sobremundo", lexico: LEX };
const ab = garantirAbertura({ principalId: "mis_principal", cidade: "Torre Alto", chegada: "à porta de Torre Alto", razao: "uma carta", sabe: "Godfrey Pescador, estalajadeiro, sabe", titulo: "O Sino de Cinza",
  pista: { nome: "Godfrey Pescador", papel: "estalajadeiro", local: "O Descanso do Carroceiro" }, alvo: { feitio: "encontrar", quem: "Theron do Brejo", onde: "Catedral da Cinza, em Vale Verde", objeto: "Theron do Brejo" } });
const PR = criarMissao({ id: "mis_principal", titulo: "O Sino de Cinza", tipo: "principal", status: "ativa", descricao: "uma carta", etapas: [
  { tipo: "falar_com", alvo: "Godfrey Pescador", onde: "O Descanso do Carroceiro" },
  { tipo: "falar_com", alvo: "Theron do Brejo", onde: "Catedral da Cinza, em Vale Verde" }] });
const DADO = [{ ...PR, etapas: [{ ...PR.etapas[0], feito: true }, PR.etapas[1]] }];
const BASE = { personagem: { nome: "Inês", grupo: [] }, nomeCampanha: "O Sino de Cinza", mundo: MUNDO, abertura: ab, mapa: MAPA, cidadeAtual: "Torre Alto", dia: 1, minuto: 560, npcs: {}, missoes: [PR], lugar: null };
const DESC = { nome: "O Descanso do Carroceiro", onde: "dentro", minutos: 5 };
const CAT = { nome: "Catedral da Cinza", onde: "dentro", minutos: 5 };
const P = A_PROPOSTA_DA_FRASE;
/* a moeda e o número não se separam na quebra de linha (o telefone, 04/11) */
const NB = (x) => String(x).split("◉ ").join("◉ ");

sec("§1 as tabelas");
/* a moeda (◉) é glifo da TELA — a casa a desenha assim em toda oferta —, e o
   verificador é o da ficha do Narrador: as linhas da moeda ficam de fora */
const frases = [...Object.values(P.verbo).flatMap((x) => (typeof x === "string" ? [x] : Object.values(x))), ...Object.values(P.linhas), ...Object.values(P.sabe)]
  .filter((x) => !x.includes("◉")).map((x) => tpl(x, { L: "o Descanso do Carroceiro", D: "Vale Verde", N: "Godfrey Pescador", P: ", estalajadeiro,", T: "O Sino de Cinza", A: "Theron do Brejo", M: "5 min a pé", X: "2 dias", I: "pão", B: "13", F: "2 avanços" }));
t("cada frase passa no verificador da ficha (nada de bastidor na tela)", verificarAFicha(frases.join("\n")).length === 0, J(verificarAFicha(frases.join("\n"))));
t("cada efeito da ordem tem glifo, verbo e botão", P.ordem.every((k) => P.glifo[k] && P.verbo[k] && P.confirmar[k]));
t("o teto das linhas é um número da tabela", Number.isInteger(P.tetoDeLinhas) && P.tetoDeLinhas > 0);

sec("§2 o lixo, o nada e a porta que não propõe");
let estourou = false;
try { for (const l of [null, undefined, 0, "x", [], {}, { frase: "" }, { frase: "x", passo: "x", compras: "x" }, { frase: "x", passo: {}, viagem: [], sono: { tipo: "x" } }]) for (const e of [null, {}, BASE, { missoes: "x", npcs: [] }]) aPropostaDaFrase(l, e); } catch (e) { estourou = e; }
t("o lixo não estoura", !estourou, String(estourou));
t("frase sem efeito nenhum: sem proposta", aPropostaDaFrase({ frase: "Olho à volta." }, BASE) === null);
t("a frase que acorda outra porta (a luta, a magia) não propõe, nem com um sítio", aPropostaDaFrase({ frase: "Vou ao Descanso e ataco o Godfrey", acorda: true, passo: DESC }, BASE) === null);
let ss = 0; try { ss = oQueSeSabeDoSitio(null, null).length + oQueSeSabeDoSitio({}, "").length + oQueSeSabeDoSitio({ npcs: { x: null } }, "X").length; } catch { ss = -1; }
t("o que se sabe de um sítio sem nada: nada", ss === 0);

sec("§3 o que se sabe do sítio — só o que se ouviu ou viu");
const sD = oQueSeSabeDoSitio(BASE, DESC);
t("o Descanso: ««O Sino de Cinza»: procurar Godfrey Pescador aqui» — a missão diz porquê, e a mesma pessoa só uma vez", J(sD) === J(["«O Sino de Cinza»: procurar Godfrey Pescador aqui"]), J(sD));
const sDd = oQueSeSabeDoSitio({ ...BASE, missoes: DADO }, DESC);
t("dado o passo, fica o que a abertura disse: «Godfrey Pescador, estalajadeiro, trabalha aqui»", J(sDd) === J(["Godfrey Pescador, estalajadeiro, trabalha aqui"]), J(sDd));
t("…e nunca se está lá agora, de folga, ou a que horas (isso só se sabe indo)", !sD.some((x) => /está lá|folga|chega|hora|manhã|tarde/.test(x)), J(sD));
/* o mesmo instante em que a verdade é «não está» (de folga no dia 1) */
const g = aPessoaDoPasso({ ...BASE, lugar: { nome: "O Descanso do Carroceiro", cidade: "Torre Alto", distancia: "dentro" } }).find((p) => p.nome === "Godfrey Pescador");
t("(a verdade, que o cartão NÃO diz: ele está de folga) — e o cartão diz o mesmo de dia de trabalho e de folga", !!g && !g.aqui && J(oQueSeSabeDoSitio({ ...BASE, dia: 2, minuto: 740 }, DESC)) === J(sD));
t("a Catedral de Torre Alto: nada — o Theron é da de Vale Verde", oQueSeSabeDoSitio({ ...BASE, missoes: DADO }, CAT).length === 0, J(oQueSeSabeDoSitio({ ...BASE, missoes: DADO }, CAT)));
t("a de Vale Verde: ««O Sino de Cinza»: procurar Theron do Brejo aqui»", J(oQueSeSabeDoSitio({ ...BASE, missoes: DADO, cidadeAtual: "Vale Verde" }, CAT)) === J(["«O Sino de Cinza»: procurar Theron do Brejo aqui"]));
t("o Descanso de Vale Verde não tem o Godfrey (o posto da pista é na cidade da abertura)", !oQueSeSabeDoSitio({ ...BASE, cidadeAtual: "Vale Verde" }, DESC).some((x) => /Godfrey/.test(x)));
/* a pessoa do passo, a mesma régua: a suíte de 04/11 achou-o, e o conserto
   é de a-pessoa-do-passo.js (o posto sem cidade lido como de qualquer cidade) */
t("…e a ficha do ator também não o põe atrás do balcão de lá", !aPessoaDoPasso({ ...BASE, missoes: DADO, cidadeAtual: "Vale Verde", dia: 2, minuto: 740, lugar: { nome: "O Descanso do Carroceiro", cidade: "Vale Verde", distancia: "dentro" } }).some((p) => p.nome === "Godfrey Pescador"));
const NPCS = { "Kendra Cabelo Ruivo": { nome: "Kendra Cabelo Ruivo", local: "Bazar das Especiarias, Torre Alto", conhecidoEm: 1 }, "Joric": { nome: "Joric", local: "Bazar das Especiarias, em Torre Alto", conhecidoEm: 1, morto: true }, "Godfrey Pescador": { nome: "Godfrey Pescador", local: "O Descanso do Carroceiro, Torre Alto", conhecidoEm: 1 } };
const BAZ = { nome: "Bazar das Especiarias", onde: "dentro", minutos: 5 };
t("quem se viu lá: «você viu Kendra Cabelo Ruivo aqui hoje»; noutro dia, «conheceu»; o morto não", J(oQueSeSabeDoSitio({ ...BASE, npcs: NPCS }, BAZ)) === J(["você viu Kendra Cabelo Ruivo aqui hoje"]) && J(oQueSeSabeDoSitio({ ...BASE, npcs: NPCS, dia: 3 }, BAZ)) === J(["você conheceu Kendra Cabelo Ruivo aqui"]), J(oQueSeSabeDoSitio({ ...BASE, npcs: NPCS }, BAZ)));
t("a mesma pessoa não se diz duas vezes (a abertura e o registo)", oQueSeSabeDoSitio({ ...BASE, npcs: NPCS }, DESC).filter((x) => /Godfrey/.test(x)).length === 1);
const REV = criarMissao({ id: "mis_rev", titulo: "O que a forja guarda", tipo: "secundaria", status: "ativa", descricao: "x", etapas: [{ tipo: "revelar", alvo: "A Têmpera da Aurora", onde: "A Têmpera da Aurora, em Torre Alto" }] });
t("o sítio de um revelar: ««O que a forja guarda»: o que este sítio esconde»", J(oQueSeSabeDoSitio({ ...BASE, missoes: [REV] }, { nome: "A Têmpera da Aurora" })) === J(["«O que a forja guarda»: o que este sítio esconde"]));

sec("§4 cada efeito");
const pP = aPropostaDaFrase({ frase: "Vou ao Descanso do Carroceiro procurar Godfrey", passo: DESC }, BASE);
t("o passo: «Ir até o Descanso do Carroceiro», botão «Ir», 5 min, o glifo do alfinete", !!pP && pP.verbo === "Ir até o Descanso do Carroceiro" && pP.confirmar === "Ir" && pP.minutos === 5 && pP.glifo === "alfinete" && pP.tipo === "passo", J(pP));
t("…as linhas: a distância, e o que se sabe", !!pP && J(pP.linhas) === J(["dentro dos muros, a 5 min a pé", "«O Sino de Cinza»: procurar Godfrey Pescador aqui"]), pP && J(pP.linhas));
t("…a frase vai inteira, e o id é o da frase", pP.frase === "Vou ao Descanso do Carroceiro procurar Godfrey" && pP.id.startsWith("proposta|"));
const sA = aPropostaDaFrase({ frase: "Saio para a quinta do moleiro", passo: { nome: "A Quinta do Moleiro", onde: "arredores", minutos: 40 } }, BASE);
t("fora dos muros: «fora dos muros, a 40 min a pé»", sA && sA.linhas[0] === "fora dos muros, a 40 min a pé");
const pV = aPropostaDaFrase({ frase: "Parto para Vale Verde", viagem: { destino: "Vale Verde", dias: 1, falta: { diz: "A bolsa não tem comida para a estrada." } } }, BASE);
t("a estrada: «Partir para Vale Verde», «Partir», «1 dia de estrada» e a falta de comida", !!pV && pV.verbo === "Partir para Vale Verde" && pV.confirmar === "Partir" && J(pV.linhas) === J(["1 dia de estrada", "A bolsa não tem comida para a estrada."]), J(pV));
const pS = aPropostaDaFrase({ frase: "Sigo pela estrada", seguir: { para: "Vale Verde", minutos: 240, faltam: 1 } }, BASE);
t("seguir: «Seguir para Vale Verde», 240 min, «faltam 1 avanço na estrada»", !!pS && pS.verbo === "Seguir para Vale Verde" && pS.minutos === 240 && pS.linhas[0] === "faltam 1 avanço na estrada", J(pS));
const pM = aPropostaDaFrase({ frase: "Vou ao Templo Afogado", masmorra: { nome: "O Templo Afogado", linhas: ["2 h de caminhada"] } }, BASE);
t("a masmorra: «Ir até o Templo Afogado», com as linhas da porta dela", !!pM && pM.verbo === "Ir até o Templo Afogado" && J(pM.linhas) === J(["2 h de caminhada"]));
const pN = aPropostaDaFrase({ frase: "Pago um quarto e durmo até de manhã", sono: { tipo: "longo", preco: "8 h · 1 ração e 1 água", retorno: "cura o cansaço" } }, BASE);
t("o sono: «Dormir», o preço da noite e o que cura", !!pN && pN.verbo === "Dormir" && pN.confirmar === "Dormir" && pN.preco === "8 h · 1 ração e 1 água" && pN.linhas[0] === "cura o cansaço", J(pN));
const pC = aPropostaDaFrase({ frase: "Compro duas rações", compras: [{ fecha: true, total: 4, bolsa: 15, itens: [{ nome: "Rações de viagem", quantos: 2 }] }] }, BASE);
t("a compra: «Comprar 2 × Rações de viagem», ◉ 4, «a bolsa fica com ◉ 11»", !!pC && pC.verbo === "Comprar 2 × Rações de viagem" && pC.preco === NB("◉ 4") && pC.linhas[0] === NB("◉ 4 · a bolsa fica com ◉ 11"), J(pC));

sec("§5 dois efeitos");
const d1 = aPropostaDaFrase({ frase: "Vou ao bazar e compro duas rações", passo: BAZ, compras: [{ fecha: true, total: 4, bolsa: 15, itens: [{ nome: "Rações de viagem", quantos: 2 }] }] }, BASE);
t("o passo e a compra: o título é o passo, e a compra vai «e comprar … (◉ 4)»", !!d1 && d1.tipo === "passo" && d1.linhas.includes(NB("e comprar 2 × Rações de viagem (◉ 4)")) && J(d1.efeitos) === J(["passo", "compra"]), J(d1));
const d2 = aPropostaDaFrase({ frase: "Vou ao Descanso e parto para Vale Verde", passo: DESC, viagem: { destino: "Vale Verde", dias: 1 } }, BASE);
t("a estrada cala o passo (quem parte não passeia antes)", !!d2 && d2.tipo === "viagem" && !d2.efeitos.includes("passo"));
t("a compra que não fecha não propõe (o veto da bolsa diz porquê, como sempre)", aPropostaDaFrase({ frase: "Compro um cavalo", compras: [{ fecha: false, total: 300, bolsa: 15, itens: [{ nome: "Cavalo", quantos: 1 }] }] }, BASE) === null);

sec("§6 a mesma leitura, e o teto");
const L1 = { frase: "Vou ao Descanso do Carroceiro procurar Godfrey", passo: DESC };
t("a mesma leitura dá o mesmo", J(aPropostaDaFrase(L1, BASE)) === J(aPropostaDaFrase(JSON.parse(J(L1)), JSON.parse(J(BASE)))));
const MUITAS = { ...BASE, npcs: Object.fromEntries(["Ana", "Bruno", "Carla", "Duarte", "Eva"].map((n) => [n, { nome: n, local: "O Descanso do Carroceiro, Torre Alto", conhecidoEm: 1 }])) };
const cheio = aPropostaDaFrase(L1, MUITAS);
t(`com muito que dizer, ficam ${P.tetoDeLinhas} linhas, e a distância é a primeira`, cheio.linhas.length === P.tetoDeLinhas && cheio.linhas[0].startsWith("dentro dos muros"), J(cheio.linhas));

/* ---------------- A 2.ª LEVA (04/11) ---------------- */
sec("§7 atacar");
const pA = aPropostaDaFrase({ frase: "Ataco o guarda da porta", agressao: { nome: "o guarda", veredito: "Atacar um guarda à vista: a guarda da cidade responde." } }, BASE);
t("«Atacar o guarda», «Atacar», a cor do perigo, e o veredito do crime nas linhas", !!pA && pA.verbo === "Atacar o guarda" && pA.confirmar === "Atacar" && pA.tom === "semVolta" && pA.faz === "atacar" && pA.linhas[0].startsWith("Atacar um guarda"), J(pA));
const pA2 = aPropostaDaFrase({ frase: "Ataco o bandido", agressao: { nome: "o bandido", veredito: null } }, BASE);
t("sem crime: «abre a luta»", !!pA2 && pA2.linhas[0] === P.linhas.abreALuta);
t("a luta manda no título, mesmo com um sítio na frase", (aPropostaDaFrase({ frase: "Vou ao Descanso e ataco o Godfrey", agressao: { nome: "Godfrey Pescador" }, passo: DESC }, BASE) || {}).tipo === "agressao");

sec("§8 a habilidade");
const pH = aPropostaDaFrase({ frase: "Rezo a Cura Leve sobre a Yvete", habilidade: { nome: "Cura Leve", custo: 2, pm: 8, efeito: "cura 1d8+2 PV" } }, BASE);
t("14.ª T25 «Rezo a Cura Leve» → «Usar Cura Leve · 2 PM», «PM 8 → 6»", !!pH && pH.verbo === "Usar Cura Leve" && pH.preco === "2 PM" && pH.linhas[0] === "PM 8 → 6" && pH.faz === "habilidade" && !pH.impedido, J(pH));
const pH2 = aPropostaDaFrase({ frase: "Rezo a Cura Leve", habilidade: { nome: "Cura Leve", custo: 2, pm: 1, falta: "falta PM: tem 1, custa 2" } }, BASE);
t("sem PM: o cartão diz a falta e o botão fica impedido", !!pH2 && pH2.impedido === "falta PM: tem 1, custa 2" && pH2.linhas[0] === "falta PM: tem 1, custa 2");

sec("§9 quem não está aqui");
const conhecidos = ["Godfrey Pescador", "Theron do Brejo", "Kendra Cabelo Ruivo"];
t("«Falo com o Godfrey…» com o Godfrey fora de vista → Godfrey Pescador", J(aPessoaChamada("Falo com o Godfrey sobre a carta", { conhecidos, presentes: ["Gareth"] })) === J({ nome: "Godfrey Pescador" }));
t("…e com ele à vista, nada (a conversa segue sem cartão)", aPessoaChamada("Falo com o Godfrey sobre a carta", { conhecidos, presentes: ["Godfrey Pescador"] }) === null);
t("sem verbo de ter com alguém, nada («o Godfrey é estranho»)", aPessoaChamada("O Godfrey é estranho", { conhecidos, presentes: [] }) === null);
t("o nome mais longo ganha («Theron do Brejo» e não outro que comece igual)", (aPessoaChamada("Pergunto ao Theron do Brejo pelo sino", { conhecidos: ["Theron", "Theron do Brejo"], presentes: [] }) || {}).nome === "Theron do Brejo");
const pF = aPropostaDaFrase({ frase: "Falo com o Godfrey", ausente: { nome: "Godfrey Pescador", sitios: [{ ...DESC }] } }, BASE);
t("o cartão: «Ir até o Descanso do Carroceiro», «Godfrey Pescador não está aqui», e porquê lá (a missão)", !!pF && pF.verbo === "Ir até o Descanso do Carroceiro" && pF.faz === "ir" && pF.linhas[0] === "Godfrey Pescador não está aqui" && pF.linhas[1] === "«O Sino de Cinza»: procurar Godfrey Pescador no Descanso do Carroceiro" && pF.dados.ausente.alvo.nome === DESC.nome, J(pF));
const pF2 = aPropostaDaFrase({ frase: "Falo com Theron do Brejo", ausente: { nome: "Theron do Brejo", sitios: [{ ...CAT }] } }, { ...BASE, missoes: DADO });
t("o Theron é de Vale Verde: em Torre Alto não há «ir» (a catedral daqui não é a dele) — «Theron do Brejo não está aqui», «Dizer na mesma»", !!pF2 && pF2.verbo === "Theron do Brejo não está aqui" && pF2.faz === "turno" && pF2.confirmar === P.confirmar.ausenteSemSitio && /em Catedral da Cinza|na Catedral da Cinza/.test(pF2.linhas[0] || ""), J(pF2));
t("o que se sabe da pessoa sem nada: nada", oQueSeSabeDaPessoa(BASE, "Ninguém").length === 0 && oQueSeSabeDaPessoa(null, null).length === 0);
t("quem não está aqui não propõe junto de outro ato (o turno é desse ato)", (aPropostaDaFrase({ frase: "Vou ao bazar falar com o Godfrey", passo: BAZ, ausente: { nome: "Godfrey Pescador", sitios: [DESC] } }, BASE) || {}).tipo === "passo");

sec("§10 esperar");
const pE = aPropostaDaFrase({ frase: "Fico à espera dele até às onze", espera: { minutos: 80, ate: 660 } }, BASE);
t("«Esperar até as onze da manhã», 80 min, pelo relógio", !!pE && pE.verbo === "Esperar até as onze da manhã" && pE.minutos === 80 && pE.faz === "esperar", J(pE));
const pE2 = aPropostaDaFrase({ frase: "Espero por ela", espera: { opcoes: [60, 120, 240] } }, BASE);
t("sem dizer quanto: «Esperar» com as escolhas", !!pE2 && pE2.verbo === "Esperar" && J(pE2.opcoes) === J([60, 120, 240]));

sec("§11 pagar");
const pG = aPropostaDaFrase({ frase: "Pago a sopa", pagar: { itens: [{ nome: "prato quente", quantos: 1, preco: 2 }], total: 2, bolsa: 15 } }, BASE);
t("«Pagar prato quente · ◉ 2», «a bolsa fica com ◉ 13»", !!pG && pG.verbo === "Pagar prato quente" && pG.preco === NB("◉ 2") && pG.linhas[0] === NB("a bolsa fica com ◉ 13") && !pG.impedido, J(pG));
const pG2 = aPropostaDaFrase({ frase: "Pago 3 moedas", pagar: { itens: [{ nome: "", quantos: 1, preco: 3 }], total: 3, bolsa: 1, dito: true } }, BASE);
t("a quantia sem nome: «Pagar ◉ 3»; a bolsa não chega: impedido", !!pG2 && pG2.verbo === NB("Pagar ◉ 3") && pG2.impedido === NB("a bolsa só tem ◉ 1"), J(pG2));
const pG3 = aPropostaDaFrase({ frase: "Pago um quarto e durmo", sono: { tipo: "longo", preco: "uma noite", retorno: "PV e PM cheios" }, pagar: { itens: [{ nome: "quarto comum", quantos: 1, preco: 4 }], total: 4, bolsa: 15 } }, BASE);
t("14.ª T9 «Pago um quarto e durmo»: «Dormir» e «e pagar quarto comum (◉ 4)» — o quarto é pago e a noite dormida", !!pG3 && pG3.tipo === "sono" && pG3.linhas.includes(NB("e pagar quarto comum (◉ 4)")) && !!pG3.dados.pagar, J(pG3));

sec("§12 vender");
const pV2 = aPropostaDaFrase({ frase: "Vendo a adaga ao ferreiro", venda: { item: "Adaga", valor: 6, quem: "Joric, o ferreiro", bolsa: 15, origem: "inventario" } }, BASE);
t("«Vender Adaga · ◉ +6», «a Joric, o ferreiro: a bolsa fica com ◉ 21»", !!pV2 && pV2.verbo === "Vender Adaga" && pV2.preco === NB("◉ +6") && pV2.linhas[0] === NB("a Joric, o ferreiro: a bolsa fica com ◉ 21") && !!pV2.dados.venda, J(pV2));
const pV3 = aPropostaDaFrase({ frase: "Vendo a adaga", venda: { item: "Adaga", motivo: "ninguém aqui compra armas" } }, BASE);
t("sem quem compre: o motivo, e impedido", !!pV3 && pV3.impedido === "ninguém aqui compra armas");
t("o glifo de cada efeito novo está na tabela", ["agressao", "habilidade", "ausente", "espera", "pagar", "venda"].every((k) => P.glifo[k] && P.verbo[k] && P.confirmar[k]));

console.log(`\na proposta da frase: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
