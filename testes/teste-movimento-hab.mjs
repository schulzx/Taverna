/* teste-movimento-hab.mjs (v9.54) — a família de movimento e alcance:
   o que o golpe ignora, a pressa que dá duas ações, e o terreno difícil
   que o Passo do Vento prometia atravessar desde sempre.               */
import { ignoraDoGolpe, linhaDoIgnorar, notaDoIgnorar, DEFESA_NUA, pressaDe, apressar, acoesPorRodada, estaApressado, expirarPressa, baixarPressa, PRESSAS } from "../src/habilidades.js";
import { resolverAtaque, defesaDe, ACOES_BONUS, acoesBonusDe } from "../src/combate.js";
import { passoDeHabilidade, passoComSelecao } from "../src/movimento.js";
import { ehArea, geometriaDe } from "../src/grimorio.js";
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
const doCatalogo = (nome) => catalogo.find((h) => h.nome === nome) || null;

const heroi = (extra = {}) => ({ nome: "Vera", classe: "Monge", raca: "humano", nivel: 8, vida: 60, vidaMax: 60, atributos: { destreza: 3 }, ...extra });

sec("1. as sete que diziam \"ignora\" e não ignoravam nada");
{
  const armadura = ["Quebra-Guarda", "Mira do Batedor", "Punho que Rompe", "Punho de Pedra"];
  const cobertura = ["Cano Longo", "Tiro Calibrado", "Olho que Mede o Vento"];
  for (const n of [...armadura, ...cobertura]) {
    const h = doCatalogo(n);
    t(`"${n}" existe no catálogo`, !!h);
    t(`  e o sistema a reconhece`, !!ignoraDoGolpe(h));
  }
  for (const n of armadura) t(`  ${n} fura ARMADURA, não cobertura`, ignoraDoGolpe(doCatalogo(n)).armadura === true && !ignoraDoGolpe(doCatalogo(n)).cobertura);
  for (const n of cobertura) t(`  ${n} fura COBERTURA, não armadura`, ignoraDoGolpe(doCatalogo(n)).cobertura === true && !ignoraDoGolpe(doCatalogo(n)).armadura);
  t("Bola de Fogo não ignora nada", !ignoraDoGolpe({ nome: "Bola de Fogo", descricao: "Explosão de chamas." }));
  t("habilidade vazia não ignora nada", !ignoraDoGolpe({}) && !ignoraDoGolpe(null));
}

sec("1b. a régua que descartava o disparo antes de ele existir");
{
  /* é a mesma régua da Colheita Final: sem palavra de violência no texto,
     a habilidade nem chegava à conta. Provo aqui que ela CONTINUA sem casar
     — e que por isso o leitor precisa ser consultado antes dela. */
  const RX = /dano|ataca|golpe|projetil|projétil|chama|gelo|raio|lamina|lâmina|fogo|destrui|ferir|maldic|explos|impacto|perfur|cort[ae]|drena|execut/i;
  const orfas = ["Olho que Mede o Vento", "Cano Longo", "Mira do Batedor", "Punho que Rompe"];
  for (const n of orfas) {
    const h = doCatalogo(n);
    t(`"${n}" não tem palavra de violência (por isso era descartada)`, !RX.test(`${h.nome} ${h.descricao}`));
    t(`  mas o leitor de "ignora" a salva`, !!ignoraDoGolpe(h));
  }
}

sec("2. furar armadura muda o DADO, não só a prosa");
{
  const ogro = { nome: "Ogro", vida: 80, vidaMax: 80, defesa: 18, ameaca: "elite" };
  t("o ogro tem defesa 18", defesaDe(ogro, true) === 18);
  /* bônus tal que só acerta quem rola contra o corpo nu: 10 ≤ total < 18 */
  const bonus = 4;   // d20+4 → 5..24; contra 10 acerta em 6+, contra 18 só em 14+
  let acertosNormais = 0, acertosFurando = 0;
  for (let i = 0; i < 400; i++) {
    if (resolverAtaque({ atacante: "V", alvo: ogro, ehAtacanteInimigo: false, bonusAtaque: bonus, danoBase: 10 }).dano > 0) acertosNormais++;
    if (resolverAtaque({ atacante: "V", alvo: ogro, ehAtacanteInimigo: false, bonusAtaque: bonus, danoBase: 10, ignoraArmadura: true }).dano > 0) acertosFurando++;
  }
  console.log(`      acertos em 400: normal ${acertosNormais} · furando ${acertosFurando}`);
  t("furar a armadura acerta bem mais", acertosFurando > acertosNormais + 80);
  t("a defesa nua é 10, e é o piso de toda a casa", DEFESA_NUA === 10);
  t("o resultado registra a CA usada", resolverAtaque({ atacante: "V", alvo: ogro, ehAtacanteInimigo: false, bonusAtaque: 30, danoBase: 5, ignoraArmadura: true }).ca === 10);
  t("sem a flag, a CA continua sendo a do bicho", resolverAtaque({ atacante: "V", alvo: ogro, ehAtacanteInimigo: false, bonusAtaque: 30, danoBase: 5 }).ca === 18);
}

sec("2b. armadura não é cobertura — o muro continua de pé");
{
  const alvo = { nome: "Arqueiro", vida: 20, vidaMax: 20, defesa: 14, ameaca: "comum" };
  const r = resolverAtaque({ atacante: "V", alvo, ehAtacanteInimigo: false, bonusAtaque: 30, danoBase: 5, ignoraArmadura: true, bonusDefesaAlvo: 2 });
  t("quem fura a placa ainda tem o muro pela frente", r.ca === 12);
}

sec("2c. as frases que nascem junto do efeito");
{
  const h = doCatalogo("Punho que Rompe");
  const ig = ignoraDoGolpe(h);
  t("a linha diz o que foi ignorado", /armadura do alvo/.test(linhaDoIgnorar(ig, h)));
  t("a linha traz o nome da habilidade", linhaDoIgnorar(ig, h).includes("Punho que Rompe"));
  t("a nota proíbe o Mestre de recalcular", /não o recalcule/.test(notaDoIgnorar(ig, h)));
  const igc = ignoraDoGolpe(doCatalogo("Cano Longo"));
  t("a de cobertura fala de cobertura e distância", /cobertura e a distância/.test(linhaDoIgnorar(igc, doCatalogo("Cano Longo"))));
  t("sem regra, nenhuma frase", linhaDoIgnorar(null) === "" && notaDoIgnorar(null) === "");
  t("o tiro longo tem teto de alcance próprio", igc.alcanceM >= 90);
}

sec("3. a pressa: agir duas vezes na rodada");
{
  for (const n of ["Mais Rápido que o Olho", "Forma Conjunta", "Instante Roubado"]) {
    const h = doCatalogo(n);
    t(`"${n}" existe`, !!h);
    t(`  e é reconhecida como pressa`, !!pressaDe(h));
  }
  t("toda pressa dá pelo menos duas ações", PRESSAS.every((p) => p.acoes >= 2));
  t("e nenhuma passa de duas — três seria outro jogo", PRESSAS.every((p) => p.acoes === 2));
  t("Instante Roubado dura só o turno que rouba", pressaDe(doCatalogo("Instante Roubado")).turnos === 1);
  t("as duas de prazo longo duram quatro", pressaDe(doCatalogo("Mais Rápido que o Olho")).turnos === 4 && pressaDe(doCatalogo("Forma Conjunta")).turnos === 4);

  const p0 = heroi();
  t("sem pressa, uma ação por rodada", acoesPorRodada(p0) === 1 && !estaApressado(p0));
  const r = apressar(p0, doCatalogo("Mais Rápido que o Olho"), 3);
  t("apressa", r.ok);
  t("agora são duas ações", acoesPorRodada(r.pers) === 2 && estaApressado(r.pers));
  t("o jogador lê o número e o prazo", /2 vezes por rodada/.test(r.linha) && /4 turnos/.test(r.linha));
  t("o Mestre é proibido de agir no lugar do jogador", /não aja por mim/.test(r.nota));
  t("não se apressa duas vezes", !apressar(r.pers, doCatalogo("Forma Conjunta"), 3).ok);
  t("quem não tem pressa na descrição não vira pressa", apressar(p0, { nome: "Bola de Fogo", descricao: "Chamas." }) === null);
}

sec("4. e a pressa vence pelo relógio da rodada");
{
  const p = apressar(heroi(), doCatalogo("Mais Rápido que o Olho"), 3).pers;   // 4 turnos: 3,4,5,6
  for (const rod of [4, 5, 6]) t(`na rodada ${rod} ainda corre`, expirarPressa(p, rod).linha === "" && acoesPorRodada(expirarPressa(p, rod).pers) === 2);
  const fim = expirarPressa(p, 7);
  t("na rodada 7 passa", !!fim.linha);
  t("o jogador lê a queda", /volta a agir uma vez/.test(fim.linha));
  t("e a ficha volta a uma ação", acoesPorRodada(fim.pers) === 1);
  t("a ficha não fica com lixo", fim.pers.pressa === undefined);

  const curto = apressar(heroi(), doCatalogo("Instante Roubado"), 5).pers;     // 1 turno: só a 5
  t("o instante roubado vale na rodada em que nasce", expirarPressa(curto, 5).linha === "");
  t("e passa na seguinte", !!expirarPressa(curto, 6).linha);

  t("sem pressa, expirar não faz nada", expirarPressa(heroi(), 9).linha === "");
  const b = baixarPressa(p);
  t("a luta acaba, a pressa passa", !!b.linha && acoesPorRodada(b.pers) === 1);
  t("sem pressa nenhuma, cala", baixarPressa(heroi()).linha === "");
}

sec("5. o Passo do Vento e o terreno difícil");
{
  const pv = doCatalogo("Passo do Vento");
  t("\"Passo do Vento\" existe", !!pv);
  const p = passoDeHabilidade(pv);
  t("dobra o passo (como já dobrava)", !!p && p.dobra === true);
  t("e AGORA ignora terreno difícil, como a descrição promete", !!p && p.ignoraDificil === true);

  const semTerreno = passoDeHabilidade({ nome: "Investida", descricao: "Avança correndo contra o alvo." });
  t("uma disparada sem a promessa não ganha o benefício", !!semTerreno && semTerreno.dobra === true && !semTerreno.ignoraDificil);
  const voo = passoDeHabilidade({ nome: "Voo", descricao: "Ganha asas por alguns turnos." });
  t("quem voa ignora por natureza", !!voo && voo.ignoraDificil === true);

  const heroiComum = heroi({ raca: "humano" });
  const base = passoComSelecao(heroiComum, []);
  const comPasso = passoComSelecao(heroiComum, [pv]);
  console.log(`      passo ${base.metros} m → ${comPasso.metros} m`);
  t("o orçamento dobra de verdade", comPasso.metros === base.metros * 2);
  t("e o terreno difícil deixa de custar dobrado", comPasso.ignoraDificil === true && base.ignoraDificil === false);
  t("a tela sabe de onde veio o número", comPasso.fonte === "Passo do Vento");
}

sec("6. Céu Escuro cai como área");
{
  const ce = doCatalogo("Céu Escuro");
  t("\"Céu Escuro\" existe", !!ce);
  t("e agora é ÁREA, não alvo único", ehArea(ce));
  t("a forma tem raio de verdade", geometriaDe(ce).raio > 0);
  t("uma habilidade de alvo único continua sendo alvo único", !ehArea({ nome: "Estocada", descricao: "Um golpe preciso no peito do alvo." }));
}

sec("7. a ação bônus diz o que o sistema faz");
{
  t("\"Bárbaro\" saiu do catálogo (classe que não existe)", !ACOES_BONUS["Bárbaro"]);
  const classesReais = new Set(CLASSES.map((c) => c.nome));
  t("toda classe com ação bônus é uma classe de verdade", Object.keys(ACOES_BONUS).every((c) => classesReais.has(c)));
  t("nenhuma descrição promete golpe extra que o sistema não dá", Object.values(ACOES_BONUS).flat().every((a) => !/dois ataques|um dado de bônus|entra em fúria/i.test(a.desc)));
  t("todas prometem a mesma coisa: mais um movimento no turno", Object.values(ACOES_BONUS).flat().every((a) => /a mais neste turno|segunda conjuração/i.test(a.desc)));
  t("Mago segue sem ação bônus, de propósito", acoesBonusDe("Mago", 20).length === 0);
  t("Guerreiro nível 1 ainda não tem", acoesBonusDe("Guerreiro", 1).length === 0);
  t("e no 2 tem", acoesBonusDe("Guerreiro", 2).length === 1);
}

console.log(`\nmovimento e alcance v9.54: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
