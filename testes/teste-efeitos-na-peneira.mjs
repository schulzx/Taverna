/* OS EFEITOS NA PENEIRA (28/10, Fase T, trilha B) — os oito leitores que
   estouravam com um buraco na lista

   `efeitosDe` (efeitos.js) existe para que um buraco `null` — ou `undefined`
   — em `pers.efeitos` não derrube ninguém: save antigo, ficha recém-criada e
   projeção da arena chegam com a lista furada, e o órgão inteiro lê por ela.
   Em 605901b `bonusEfeito` passou a ler também, e a contagem dos outros
   leitores de src/*.js achou oito que liam `(pers.efeitos || [])` cru e
   estouravam no primeiro `e.bonus`, `e.nome` ou `e.turnos` de um `null`:

     combos.js     bonusDeDano · bonusDeArma · buffsIgnorados
     gatilhos.js   seguraEmPe · estaInvisivel
     movimento.js  deslocamentoDe
     poderes.js    temEfeitoQueDiz (privada; prova-se por estadoReclamado)
     regras-jogo.js tickEfeitos — o relógio de toda rodada

   A régua de cada secção é a mesma, e é a mais forte que há sem copiar um
   número à mão: A FICHA FURADA RESPONDE O MESMO QUE A LIMPA. Os efeitos são
   os de verdade (Fúria de Batalha, Pressa, Invisibilidade, Forma Etérea, a
   promessa de não cair), e cada secção prova também que a resposta limpa
   não é vazia — senão "igual" seria só "nada em ambas".

   O que esta suíte NÃO prova: os dois leitores que já não estouravam
   (`romperPorGatilho`, que passa o buraco adiante sem lê-lo, e a pilha do
   Mestre, que vai a `empilhar`), nem um buraco em `condicoes` — outra
   lista, que `estaInvisivel` e `temEfeitoQueDiz` também juntam, e que
   fica medida no diário como o passo seguinte. */

const C = await import("../src/combos.js");
const G = await import("../src/gatilhos.js");
const M = await import("../src/movimento.js");
const P = await import("../src/poderes.js");
const R = await import("../src/regras-jogo.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
/* Corre a pergunta e devolve a resposta em texto, ou a marca do estouro —
   para a falha dizer O QUÊ estourou em vez de derrubar a suíte inteira. */
const resp = (f) => { try { return JSON.stringify(f()); } catch (e) { return "ESTOUROU: " + e.message; } };

const FURIA = { nome: "Fúria de Batalha", bonus: 3, turnos: 3, aplica: "dano", escopo: "fisico" };
const PRESSA = { nome: "Pressa", bonus: 0, turnos: 2 };
const INVISIVEL = { nome: "Invisibilidade", bonus: 0, turnos: 2 };
const ETEREA = { nome: "Forma Etérea", bonus: 0, turnos: 1, descricao: "o corpo fica incorpóreo" };
const TEIMOSIA = { nome: "Teimosia", turnos: 2, descricao: "não pode cair abaixo de 1 PV" };
const REGEN = { nome: "Regeneração", turnos: 3, bonus: 0, curaTurno: 2 };
const LISTA = [FURIA, PRESSA, INVISIVEL, ETEREA, TEIMOSIA, REGEN];

const ficha = (efeitos) => ({ nome: "Vera", classe: "Guerreiro", raca: "Humano", nivel: 3, atributos: { forca: 3, vigor: 1 }, efeitos });
const LIMPA = ficha(LISTA);
/* o buraco no começo, no meio e no fim — os três sítios onde um índice
   pode cair, e os dois vazios que `efeitosDe` peneira */
const FURADA = ficha([null, FURIA, PRESSA, undefined, INVISIVEL, ETEREA, null, TEIMOSIA, REGEN, undefined]);
const GOLPE = { nome: "Golpe Brutal", descricao: "Um golpe físico com a arma." };
const BOLA = { nome: "Bola de Fogo", descricao: "Uma explosão de fogo mágico." };

const igual = (nome, f, naoVazio) => {
  const a = resp(() => f(LIMPA)), b = resp(() => f(FURADA));
  t(nome + ": a ficha furada não estoura", !b.startsWith("ESTOUROU"), b);
  t(nome + ": e responde o mesmo que a limpa", a === b, `limpa ${a} · furada ${b}`);
  if (naoVazio) t(nome + ": e a resposta limpa não é vazia", naoVazio(a), a);
};

/* ============================================================ */
sec("1. combos.js — o que os buffs somam ao golpe");
igual("bonusDeDano", (p) => C.bonusDeDano(p, GOLPE), (a) => JSON.parse(a).bonus === FURIA.bonus);
igual("bonusDeArma", (p) => C.bonusDeArma(p), (a) => JSON.parse(a).bonus === FURIA.bonus);
/* a Fúria é física e a Bola de Fogo é magia: ela é o buff que NÃO valeu */
igual("buffsIgnorados", (p) => C.buffsIgnorados(p, BOLA), (a) => JSON.parse(a).includes(FURIA.nome));

/* ============================================================ */
sec("2. gatilhos.js — a promessa de não cair, e a invisibilidade");
igual("seguraEmPe", (p) => G.seguraEmPe(p), (a) => JSON.parse(a) === TEIMOSIA.nome);
igual("estaInvisivel", (p) => G.estaInvisivel(p), (a) => JSON.parse(a) === true);

/* ============================================================ */
sec("3. movimento.js — a velocidade com Pressa");
igual("deslocamentoDe", (p) => M.deslocamentoDe(p), (a) => JSON.parse(a).fontes.includes(PRESSA.nome));

/* ============================================================ */
sec("4. poderes.js — o estado que o jogador reclama");
/* `temEfeitoQueDiz` é privada, e quem a chama é `estadoReclamado` dentro de
   um try: o estouro não aparecia — virava "não tem", e o herói com a Forma
   Etérea ativa ouvia que não podia atravessar a parede. Por isso a prova é
   o veredito, não a ausência de estouro. */
igual("estadoReclamado (atravessar, por temEfeitoQueDiz)", (p) => P.estadoReclamado("atravesso a parede", p));
t("e o herói etéreo com a lista furada atravessa (nada a recusar)", P.estadoReclamado("atravesso a parede", FURADA) === null);
t("e sem a Forma Etérea a recusa continua de pé", P.estadoReclamado("atravesso a parede", ficha([null, FURIA])) !== null);
t("o invisível com a lista furada também não é recusado", P.estadoReclamado("estou invisível", FURADA) === null);

/* ============================================================ */
sec("5. regras-jogo.js — tickEfeitos, o relógio de toda rodada");
igual("tickEfeitos", (p) => R.tickEfeitos(p), (a) => {
  const r = JSON.parse(a);
  return r.cura === REGEN.curaTurno && r.msgs.some((m) => m.includes(ETEREA.nome)) && r.efeitos.length === LISTA.length - 1;
});
{
  const r = R.tickEfeitos(FURADA);
  t("os buracos não voltam na lista do turno seguinte", r.efeitos.every(Boolean) && r.efeitos.length === LISTA.length - 1);
  t("e a ficha recebida continua com os buracos dela (estado novo, não mutado)", FURADA.efeitos.length === 10 && FURADA.efeitos[0] === null);
  t("ficha nula, sem `efeitos` e com `efeitos` que não é lista: o relógio não para",
    resp(() => R.tickEfeitos(null)) === resp(() => R.tickEfeitos({})) && resp(() => R.tickEfeitos({ efeitos: "lixo" })) === resp(() => R.tickEfeitos({})));
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
