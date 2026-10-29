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
   Mestre, que vai a `empilhar`).

   E a §6 é o defeito irmão, que mora na mesma soma: o `bonus` que não é
   número (ausente, NaN, texto) em `bonusEfeito`. E as três últimas (29/10)
   fecham o que o 9a79d2e deixou aberto: §7 o buraco na OUTRA lista
   (`condicoes`), §8 o que não é objeto dentro da lista, §9 o NaN que o
   canal do Mestre guardava na ficha. */

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
/* a mesma, como os dourados a trazem: sem o campo `bonus` (§6) */
const REGEN_SEM_BONUS = { nome: "Regeneração", turnos: 3, curaTurno: 2 };
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

/* ============================================================ */
sec("6. regras-jogo.js — bonusEfeito: o bônus que não é número");
/* ANTES: `b += e.bonus` cru. A Regeneração (cura por turno, sem `bonus`)
   somava undefined, a rolagem inteira virava NaN, e a salvaguarda do fim
   do turno lia NaN como 0 — o herói perdia o atributo E a Bênção enquanto
   ela durasse (9 a 10 dos 275 turnos dos dourados do aplicar). O "2" em
   texto concatenava ("102") e o teto da rolagem fazia dele o maior bônus
   do jogo. AGORA: o que não é número conta 0; o texto numérico conta o
   número que diz, como já contam `bonusDeDano` e o canal do Mestre. */
{
  const so = (bonus) => R.bonusEfeito({ efeitos: [{ nome: "X", turnos: 2, ...(bonus === "ausente" ? {} : { bonus }) }] }, "Vigor");
  t("efeito sem `bonus` soma 0, não NaN", so("ausente") === 0);
  t("`bonus` NaN, null, Infinity: 0", so(NaN) === 0 && so(null) === 0 && so(Infinity) === 0);
  t("`bonus` em texto numérico soma o número que diz, não concatena", so("2") === 2 && so(" 2 ") === 2 && so("-1") === -1);
  t("texto que não é número, texto vazio, booleano, objeto e lista: 0",
    so("abc") === 0 && so("") === 0 && so("  ") === 0 && so(true) === 0 && so({}) === 0 && so([2]) === 0);
  t("e o número continua número", so(1) === 1 && so(0) === 0);
  const BENCAO = { nome: "Bênção da Forja", turnos: 3, bonus: 1 };
  const com = (ef) => R.atributoEfetivo({ classe: "Guerreiro", nivel: 4, atributos: { vigor: 2 }, efeitos: ef }, "vigor");
  t("a Regeneração ao lado não apaga a Bênção nem o atributo na rolagem",
    Number.isFinite(com([BENCAO, REGEN_SEM_BONUS])) && com([BENCAO, REGEN_SEM_BONUS]) === com([BENCAO]), `com ${com([BENCAO, REGEN_SEM_BONUS])} · sem ${com([BENCAO])}`);
  t("o bônus em texto rola igual ao número", com([{ ...BENCAO, bonus: "1" }]) === com([BENCAO]), `texto ${com([{ ...BENCAO, bonus: "1" }])} · número ${com([BENCAO])}`);
  /* e o turno: a salvaguarda do fim do turno com a Regeneração ativa conta
     o atributo e a Bênção — a mesma conta dos dourados, com o d20 fixo */
  const { tentarSaidaNoFimDoTurno, criarCondicao } = await import("../src/condicoes.js");
  const preso = { nome: "Vera", classe: "Guerreiro", nivel: 4, atributos: { forca: 2, destreza: 2, vigor: 2 }, efeitos: [BENCAO, REGEN_SEM_BONUS], condicoes: [criarCondicao("agarrado")] };
  const limpo = { ...preso, efeitos: [BENCAO] };
  const lance = (p) => resp(() => tentarSaidaNoFimDoTurno(p, { modDe: (a) => R.atributoEfetivo(p, a), d20: () => 10 }));
  t("a salvaguarda do fim do turno com a Regeneração rola o mesmo que sem ela", lance(preso) === lance(limpo), `com ${lance(preso).slice(0, 200)} · sem ${lance(limpo).slice(0, 200)}`);
}

/* ============================================================ */
sec("7. a outra lista: um buraco em `condicoes`");
/* `estaInvisivel` e `temEfeitoQueDiz` juntam as duas listas, e a peneira de
   4dfd590 só cobria `efeitos`. Um buraco em `condicoes` estourava no
   primeiro `e.nome`, e em `estadoReclamado` o try engolia o estouro como
   "não tem": o herói invisível ou etéreo POR CONDIÇÃO ouvia a recusa. Agora
   as condições vêm por `condicoesDe` (efeitos.js), a mesma peneira. */
{
  const INVIS_C = { id: "invisivel", nome: "Invisível", turnos: 2 };
  const ETEREA_C = { id: "etereo", nome: "Etéreo", descricao: "o corpo fica incorpóreo", turnos: 1 };
  const comC = (condicoes) => ({ ...ficha([]), condicoes });
  const limpaC = comC([INVIS_C, ETEREA_C]);
  const furadaC = comC([null, INVIS_C, undefined, ETEREA_C, null]);
  t("estaInvisivel: a condição furada não estoura", !resp(() => G.estaInvisivel(furadaC)).startsWith("ESTOUROU"), resp(() => G.estaInvisivel(furadaC)));
  t("estaInvisivel: e responde o mesmo que a limpa (true)", G.estaInvisivel(limpaC) === true && resp(() => G.estaInvisivel(furadaC)) === "true");
  t("estadoReclamado (invisível por condição, lista furada): nada a recusar", P.estadoReclamado("estou invisível", furadaC) === null);
  t("estadoReclamado (atravessar por condição, por temEfeitoQueDiz, lista furada): nada a recusar", P.estadoReclamado("atravesso a parede", furadaC) === null);
  t("e sem a condição a recusa continua de pé", P.estadoReclamado("atravesso a parede", comC([null, INVIS_C])) !== null);
  t("`condicoes` que não é lista: não estoura e é como vazia",
    resp(() => G.estaInvisivel(comC("lixo"))) === "false" && P.estadoReclamado("estou invisível", comC({ nome: "Invisível" })) !== null);
}

/* ============================================================ */
sec("8. o que não é objeto dentro da lista");
/* ANTES `efeitosDe` só tirava o vazio (`filter(Boolean)`): um texto ou um
   número solto dentro de `efeitos` passava, e `tickEfeitos` o devolvia como
   objeto torto — `{ ..."abc" }` vira `{0:"a",1:"b",2:"c"}`, e o
   `turnos` NaN nunca chega a 0, então ele nunca se dissipava e voltava em
   toda rodada. AGORA a peneira tira tudo o que não é objeto (lista também). */
{
  const E = await import("../src/efeitos.js");
  const suja = ficha([FURIA, "Fúria", 7, true, [FURIA], PRESSA]);
  t("efeitosDe tira texto, número, booleano e lista", JSON.stringify(E.efeitosDe(suja)) === JSON.stringify([FURIA, PRESSA]), JSON.stringify(E.efeitosDe(suja)));
  t("condicoesDe tira o mesmo", JSON.stringify(E.condicoesDe({ condicoes: [null, "x", 3, { nome: "Caído" }] })) === JSON.stringify([{ nome: "Caído" }]));
  const r = R.tickEfeitos(suja);
  t("tickEfeitos não devolve objeto torto", r.efeitos.length === 2 && r.efeitos.every((e) => typeof e.nome === "string" && Number.isFinite(e.turnos)), JSON.stringify(r.efeitos));
  t("e a ficha recebida continua como veio (estado novo, não mutado)", suja.efeitos.length === 6 && suja.efeitos[1] === "Fúria");
}

/* ============================================================ */
sec("9. aplicarMudancas: o número do Mestre que não é número não entra na ficha");
/* ANTES: `Math.min(2, "abc")` é NaN, `Math.max(1, NaN)` é NaN, e o efeito
   guardava `bonus: NaN` na ficha — e a ficha vai ao save, onde o JSON faz
   do NaN um `null`. O mesmo no `turnos`, e pior: `turnos: NaN` nunca chega a
   0 no relógio, logo o efeito NUNCA se dissipava. AGORA o que não dá número
   cai no padrão da tabela (`LIMITES_DO_EFEITO`), como o campo ausente; o
   texto numérico continua a contar o número que diz, dentro do teto. */
{
  const E = await import("../src/efeitos.js");
  const L = E.LIMITES_DO_EFEITO;
  const pede = (ef) => { const msgs = []; const p = R.aplicarMudancas({ ...ficha([]), vida: 10, vidaMax: 10, mana: 0, manaMax: 0, moedas: 0, inventario: [], habilidades: [] }, { efeitos_adicionar: [{ nome: "Ímpeto", aplica: "Força", ...ef }] }, msgs); return { p, msgs }; };
  const ef = (r) => r.p.efeitos.find((e) => e.nome === "Ímpeto");
  const lixo = pede({ bonus: "abc", turnos: "muitos" });
  t("bonus em texto que não é número: o padrão, não NaN", ef(lixo).bonus === L.bonusPadrao, String(ef(lixo).bonus));
  t("turnos em texto que não é número: o padrão, não NaN", ef(lixo).turnos === L.turnosPadrao, String(ef(lixo).turnos));
  t("e a linha do jogador não diz NaN", !JSON.stringify(lixo.msgs).includes("NaN"));
  t("NaN e objeto: o padrão", ef(pede({ bonus: NaN, turnos: {} })).bonus === L.bonusPadrao && ef(pede({ bonus: NaN, turnos: {} })).turnos === L.turnosPadrao);
  t("o texto numérico continua a contar, dentro do teto", ef(pede({ bonus: "1", turnos: "4" })).bonus === 1 && ef(pede({ bonus: "9" })).bonus === L.bonusMax && ef(pede({ turnos: "4" })).turnos === 4);
  t("e o número continua número (teto e piso)", ef(pede({ bonus: 5, turnos: 99 })).bonus === L.bonusMax && ef(pede({ bonus: 0, turnos: 0 })).turnos === L.turnosMin && ef(pede({})).bonus === L.bonusPadrao);
  t("o efeito sai do relógio no prazo (o NaN nunca saía)", (() => { let p = lixo.p; for (let i = 0; i < L.turnosMax + 1; i++) p = { ...p, efeitos: R.tickEfeitos(p).efeitos }; return !p.efeitos.some((e) => e.nome === "Ímpeto"); })());
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
