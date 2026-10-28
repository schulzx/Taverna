/* teste-sorte-do-turno.mjs (Fase T1, trilha A, 27/10/2026) — a sorte do turno

   A T0-B tirou o `Math.random` dos módulos; a T1-A tirou-o do App. Todo
   sorteio do turno passa por `src/motor/sorte-do-turno.js`: dadoDo(semente
   do mundo, ponto, evento, n). Esta suíte prova a promessa que a casa faz
   desde o primeiro dia — "mesma semente = mesmo resultado" — no caminho de
   um turno de verdade: a iniciativa, o golpe, a aflição, o espólio, o loot,
   com os módulos reais e o Math.random global a estourar do início ao fim.

   1. o ponto e a contagem (a peça)
   2. duas campanhas, a mesma semente, as mesmas ações: os mesmos dados
   3. recarregar no mesmo ponto não compra outro dado
   4. o d20 da tela
   5. a fiação no App (texto: o App chama a peça, e não sorteia sozinho) */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ACASO_REAL = Math.random;
let tocouNoAcaso = 0;
Math.random = () => { tocouNoAcaso++; throw new Error("Math.random chamado — um sorteio fora da semente"); };

const { CONTAGEM_VAZIA, pontoDaSorte, sorteNoPonto, chaveDaRolagem } = await import("../src/motor/sorte-do-turno.js");
const { dadoDo } = await import("../src/semente.js");
const { rolarIniciativa, resolverAtaque, gerarEspolios, testeDeMorte } = await import("../src/combate.js");
const { gerarLoot } = await import("../src/loot.js");
const { rolarAflicao } = await import("../src/aflicoes.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

sec("1. o ponto e a contagem");
t("o ponto é dia|minuto|falas", pontoDaSorte({ dia: 3, minuto: 610, falas: 42 }) === "3|610|42");
t("o ponto sem nada não estoura", pontoDaSorte() === "0|0|0" && pontoDaSorte({ dia: null, minuto: "x" }) === "0|0|0");
const a1 = sorteNoPonto(CONTAGEM_VAZIA, "S", "1|0|0", "ataque");
const a2 = sorteNoPonto(a1.contagem, "S", "1|0|0", "ataque");
t("o mesmo evento, duas vezes no mesmo ponto, conta 1 e 2", a1.contagem.n.ataque === 1 && a2.contagem.n.ataque === 2);
t("…e os dois dados não são o mesmo", a1.sorte() !== a2.sorte());
const b1 = sorteNoPonto(a2.contagem, "S", "1|0|0", "loot");
t("outro evento no mesmo ponto começa do 1 e guarda a conta do outro", b1.contagem.n.loot === 1 && b1.contagem.n.ataque === 2);
const c1 = sorteNoPonto(b1.contagem, "S", "1|0|2", "ataque");
t("o ponto andou: a contagem recomeça", c1.contagem.ponto === "1|0|2" && c1.contagem.n.ataque === 1 && !("loot" in c1.contagem.n));
t("a contagem que entrou não foi mexida (substituída, nunca mutada)", a1.contagem.n.ataque === 1 && Object.isFrozen(CONTAGEM_VAZIA) && Object.keys(CONTAGEM_VAZIA.n).length === 0);
t("a sorte é dadoDo(semente, ponto, evento, n)", sorteNoPonto(null, "S", "1|0|0", "ataque").sorte() === dadoDo("S", "1|0|0", "ataque", 1)());
t("contagem null ou lixo não estoura", !!sorteNoPonto(null, "S", "p", "e").sorte && !!sorteNoPonto("lixo", "S", "p", "e").sorte);

sec("2. duas campanhas, a mesma semente, as mesmas ações");
/* O CAMINHO: um herói e dois lobos, três rodadas. Cada fala do relato anda
   o ponto (é o que o App faz: mensagensRef cresce a cada rodada narrada). */
const HEROI = { nome: "Ana", classe: "Guerreiro", nivel: 5, atributos: { destreza: 2, forca: 3 }, equipados: {}, vida: 40, vidaMax: 40, mana: 10, condicoes: [] };
const LOBOS = [{ nome: "Lobo", ameaca: "comum", des: 2, vida: 11, ca: 12 }, { nome: "Lobo Cinzento", ameaca: "elite", des: 1, vida: 18, ca: 13 }];
function jogar(semente, { recarregarNaRodada = null } = {}) {
  let contagem = CONTAGEM_VAZIA, falas = 0;
  const pede = (evento) => { const r = sorteNoPonto(contagem, semente, pontoDaSorte({ dia: 2, minuto: 600, falas }), evento); contagem = r.contagem; return r.sorte; };
  const rastro = [];
  rastro.push(rolarIniciativa([{ nome: HEROI.nome, modDestreza: 2 }, ...LOBOS.map((l) => ({ nome: l.nome, modDestreza: l.des }))], pede("iniciativa")).map((c) => c.nome + ":" + c.rolo));
  for (let rodada = 1; rodada <= 3; rodada++) {
    if (recarregarNaRodada === rodada) contagem = CONTAGEM_VAZIA; // o load: a contagem não vai no save
    for (const lobo of LOBOS) {
      const g = resolverAtaque({ rolar: pede("ataque"), atacante: HEROI.nome, alvo: lobo, ehAtacanteInimigo: false, bonusAtaque: 5, danoBase: 8 });
      rastro.push([rodada, lobo.nome, g.tipo, g.d20, g.dano]);
      const m = resolverAtaque({ rolar: pede("ataque"), atacante: lobo.nome, alvo: HEROI, ehAtacanteInimigo: true, bonusAtaque: 4, danoBase: 6 });
      rastro.push([rodada, "→" + lobo.nome, m.tipo, m.d20, m.dano]);
      const af = rolarAflicao({ sorte: pede("aflicao"), fonte: "Mordida Infecciosa", nomeFonte: "mordida", atacante: lobo.nome, alvo: HEROI, alvoNome: "você" });
      rastro.push(af ? [af.ok, af.condicao || af.id || null, af.rolo || af.d20 || null] : null);
    }
    rastro.push(testeDeMorte(pede("morte")).rolo);
    falas += 2;
  }
  rastro.push(gerarEspolios(LOBOS, HEROI.nivel, pede("espolio")));
  rastro.push(gerarLoot("raro", { nivel: HEROI.nivel, rnd: pede("loot") }));
  return { rastro, contagem };
}
const um = jogar("Vale das Cinzas|Fantasia medieval");
const dois = jogar("Vale das Cinzas|Fantasia medieval");
t(`o mesmo rastro, byte a byte (${JSON.stringify(um.rastro).length} bytes)`, igual(um.rastro, dois.rastro));
const outra = jogar("Porto Sal|Fantasia medieval");
t("outra semente, outro rastro", !igual(um.rastro, outra.rastro));
const vinte = new Set(Array.from({ length: 20 }, (_, i) => JSON.stringify(jogar("campanha " + i).rastro)));
t(`20 sementes, ${vinte.size} rastros (não é uma resposta só)`, vinte.size >= 18);
t("a iniciativa rolou dados de verdade (há rolo em cada um)", um.rastro[0].every((x) => /:\d+$/.test(x)));

sec("3. recarregar no mesmo ponto não compra outro dado");
/* recarregar no início da rodada 2 zera a contagem — mas o ponto (o save)
   é o mesmo, e a contagem daquele ponto também começava do zero: as rodadas
   2 e 3 caem iguais. */
const recarregado = jogar("Vale das Cinzas|Fantasia medieval", { recarregarNaRodada: 2 });
t("o rastro de quem recarregou é o de quem não recarregou", igual(um.rastro, recarregado.rastro));

sec("4. o d20 da tela");
const rol = { atributo: "Destreza", dificuldade: 14, motivo: "saltar o fosso" };
const k1 = chaveDaRolagem("S", "2|600|8", rol), k2 = chaveDaRolagem("S", "2|600|8", { ...rol });
t("a mesma rolagem no mesmo ponto tem a mesma chave", k1 === k2 && k1.length > 0);
t("…e a mesma face", dadoDo(k1, "d20")() === dadoDo(k2, "d20")());
t("uma fala depois, outra chave", chaveDaRolagem("S", "2|600|9", rol) !== k1);
t("o fio da animação não é o da face", dadoDo(k1, "anima")() !== dadoDo(k1, "d20")());
t("sem rolagem, chave vazia (a tela usa a sorte da casa)", chaveDaRolagem("S", "p", null) === "");

sec("5. a fiação no App");
const APP = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "App.jsx"), "utf8");
t("o App importa a peça", /from "\.\/motor\/sorte-do-turno\.js"/.test(APP));
t("sorteDoTurno pede a sorte à peça e guarda a contagem nova", /const r = sorteNoPonto\(contagemDaSorteRef\.current, sementeMundo\(\), pontoDaSorte\(\), evento\);\s*contagemDaSorteRef\.current = r\.contagem;/.test(APP));
t("o dado da tela recebe a chave da rolagem", /<OverlayDado rolagem=\{rolagem\} semente=\{chaveDaRolagem\(rolagem\)\}/.test(APP));
t("a casa é semeada ao abrir, ao nascer o mundo e a cada envio", (APP.match(/semearACasa\(/g) || []).length >= 4);

t("nenhum Math.random em toda a suíte", tocouNoAcaso === 0);
Math.random = ACASO_REAL;
console.log(`\nsorte do turno: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
