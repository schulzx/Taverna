/* teste-replay-em-node.mjs (Fase T1, trilha B, fatia 2 · 27/10) — a sessão como arquivo, o começo

   A Fase T3 do plano do motor (mente/plano-motor.md) pede que "semente + as
   frases do jogador reproduzam a campanha": o replay. É o único árbitro que
   um jogo sem servidor tem (a lei do determinismo, CLAUDE.md), e é ele que
   a sala, a auditoria e o licenciamento precisam. Esta suíte é o começo:
   prova, com as peças que já são puras, as duas propriedades de que o
   replay depende — antes de haver o `replay.mjs` do oficial.

     1. A MESMA SEMENTE E AS MESMAS RESPOSTAS DÃO O MESMO ESTADO, em duas
        corridas — e uma semente diferente dá outro (a prova morde).
     2. UMA CORRIDA INTERROMPIDA E RETOMADA A MEIO DÁ O MESMO QUE A CORRIDA
        INTEIRA, em todo ponto de corte: o estado vai ao save
        (`saveDoEstado` → JSON → `estadoDoSave`, o caminho de verdade) e
        volta, e nada do que decide os dados fica fora dele.

   A SESSÃO COMO ARQUIVO é { semente, turnos: [{ frase, narrativa, mudancas,
   rolagem? }] } — os 24 primeiros turnos da 10.ª (registo-s10-cena.json: a
   frase do jogador e a resposta gravada do Narrador), com mudanças e testes
   de atributo variados por uma tabela (MUDANCAS_DO_ARQUIVO, abaixo), e um
   começo com condições no herói, no grupo e no inimigo para que a
   salvaguarda do fim do turno role.

   O TURNO, COMO O APP O FAZ (App.jsx, `enviar`):
     - o PONTO da sorte é o instante que o save guarda (dia, minuto, falas do
       relato: `pontoDaSorte`);
     - a casa é semeada a cada envio com a semente do mundo e o ponto
       (`semearACasa(\`${semente}|${ponto}\`)`), e é isso que faz a retomada
       funcionar: a sorte de um turno não depende de quantos dados os turnos
       anteriores gastaram NESTE processo, só do que o save guarda;
     - o d20 do teste é `dadoDo(chaveDaRolagem(semente, ponto, rolagem), "d20")`
       (o `OverlayDado`);
     - a resposta passa pelo `aplicar` do motor, e a frase e a narração
       entram no relato (as falas que o próximo ponto conta).
   A secção 3 prova que a semeadura por envio é a peça que segura a retomada:
   semeada uma vez só, no começo, a corrida retomada sai diferente. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;

const { aplicar } = await import("../src/motor/aplicar.js");
const { pontoDaSorte, chaveDaRolagem } = await import("../src/motor/sorte-do-turno.js");
const { semearACasa, dadoDo } = await import("../src/semente.js");
const { estadoDoSave, saveDoEstado } = await import("../src/estado.js");
const { criarCondicao } = await import("../src/condicoes.js");

const R = JSON.parse(fs.readFileSync(new URL("./registo-s10-cena.json", import.meta.url), "utf8"));
const N = 24;

/* ---------------- O ARQUIVO DA SESSÃO ----------------
   As mudanças e os testes não estão no registo de cena (ele guarda a pauta
   e a narração); vêm desta tabela, pelo índice do turno, para que o arquivo
   exercite a bolsa, a mochila, as bênçãos e o d20. Lida de volta abaixo. */
const MUDANCAS_DO_ARQUIVO = [
  { mudancas: {} },
  { mudancas: { moedas: -2 }, rolagem: { atributo: "carisma", dificuldade: 12, motivo: "regatear" } },
  { mudancas: { adicionar_itens: ["Corda de cânhamo"] } },
  { mudancas: { efeitos_adicionar: [{ nome: "Bênção da estrada", bonus: 1, turnos: 3, aplica: "testes" }] }, rolagem: { atributo: "sabedoria", dificuldade: 14, motivo: "perceber" } },
  { mudancas: { vida: -3 } },
  { mudancas: { remover_itens: ["Corda de cânhamo"], moedas: 1 }, rolagem: { atributo: "destreza", dificuldade: 10, motivo: "esgueirar" } },
];
const arquivo = (semente) => ({
  semente,
  turnos: Array.from({ length: N }, (_, i) => ({ frase: R.pautas[i].frase, narrativa: R.respostas[i], ...MUDANCAS_DO_ARQUIVO[i % MUDANCAS_DO_ARQUIVO.length] })),
});

const C = (id, turnos) => criarCondicao(id, { turnos });
const inicio = () => estadoDoSave({
  personagem: { nome: R.heroi, classe: "Guerreiro", nivel: 1, xp: 0, vida: 24, vidaMax: 24, mana: 0, manaMax: 0, moedas: 25, atributos: { vigor: 1, presenca: 0 }, inventario: [], habilidades: [], efeitos: [], grupo: [{ nome: "Saoirse", classe: "Clérigo", vida: 10, vidaMax: 10, condicoes: [C("amedrontado", 6), C("lento", 5)] }, { nome: "Bram", classe: "Mago", vida: 8, vidaMax: 8, condicoes: [C("cego", 6)] }], condicoes: [C("envenenado", 4), C("amedrontado", 6), C("enfraquecido", 5)] },
  cidadeAtual: R.pautas[0].cidade,
  combate: { inimigos: [{ nome: "Lobo cinzento", vida: 30, vidaMax: 30, condicoes: [C("lento", 6), C("agarrado", 5)] }, { nome: "Lobo magro", vida: 30, vidaMax: 30, condicoes: [C("amedrontado", 6), C("paralisado", 4)] }] },
  mensagens: [],
});

/* ---------------- UM TURNO, COMO O APP ---------------- */
const SEMEIA = { porEnvio: true, umaVez: false };
const turno = (E, tu, semente, semeia = SEMEIA.porEnvio) => {
  const ponto = pontoDaSorte({ dia: E.dia, minuto: E.minuto, falas: (E.mensagens || []).length });
  if (semeia === SEMEIA.porEnvio) semearACasa(`${semente}|${ponto}`);
  const face = tu.rolagem ? 1 + Math.floor(dadoDo(chaveDaRolagem(semente, ponto, tu.rolagem), "d20")() * 20) : null;
  const r = aplicar(E, { narrativa: tu.narrativa, mudancas: tu.mudancas }, { pedido: tu.frase, envelopes: "" });
  const mensagens = [...(E.mensagens || []), { autor: "jogador", texto: tu.frase }, { autor: "mestre", texto: tu.narrativa }];
  return { estado: { ...r.estado, mensagens }, linha: { ponto, face, msgs: r.msgs } };
};
const correr = (arq, { de = 0, ate = arq.turnos.length, estado = null, semeia = SEMEIA.porEnvio } = {}) => {
  let E = estado || inicio();
  if (!estado && semeia === SEMEIA.umaVez) semearACasa(arq.semente);
  const linhas = [];
  for (let i = de; i < ate; i++) { const r = turno(E, arq.turnos[i], arq.semente, semeia); E = r.estado; linhas.push(r.linha); }
  return { estado: E, linhas };
};
/* o save de verdade: o estado vira save, o save vira texto, o texto volta */
const peloSave = (E) => estadoDoSave(JSON.parse(J(saveDoEstado(E))));

/* ============================================================ */
sec(`1. A MESMA SEMENTE, AS MESMAS RESPOSTAS: O MESMO ESTADO (${N} turnos da 10.ª)`);
const A = arquivo("replay|s10|a");
const um = correr(A);
{
  t("a sessão corre inteira pelo motor, sem React e sem rede", um.linhas.length === N && um.estado.personagem && um.estado.mensagens.length === 2 * N);
  const rolagens = um.linhas.filter((l) => l.face != null);
  t(`os testes rolaram um d20 de verdade (${rolagens.length} faces: ${rolagens.map((l) => l.face).join(" ")})`, rolagens.length === N / 2 && rolagens.every((l) => l.face >= 1 && l.face <= 20) && new Set(rolagens.map((l) => l.face)).size > 1);
  /* a frase da saída traz os dois números ("deu 17, e bastavam 12"): é a
     salvaguarda do fim do turno, que rola pela casa */
  const saidas = um.linhas.flatMap((l) => l.msgs).filter((m) => /deu \d+, e bastavam \d+/.test(m));
  t(`e a salvaguarda do fim do turno rolou pela casa semeada (${saidas.length} saídas antes do prazo)`, saidas.length > 0);
  const dois = correr(A);
  t("duas corridas, o mesmo estado final, byte a byte", J(dois.estado) === J(um.estado));
  t("e o mesmo turno a turno: o ponto, a face do d20 e cada linha da tela", J(dois.linhas) === J(um.linhas));
  /* a prova morde: com outra semente, os dados são outros */
  const outra = correr(arquivo("replay|s10|b"));
  const facesA = um.linhas.map((l) => l.face).join(","), facesB = outra.linhas.map((l) => l.face).join(",");
  t("com OUTRA semente, outros dados (a prova morde)", facesA !== facesB);
  t("e as respostas são as mesmas: só a sorte mudou (o relato é igual)", J(outra.estado.mensagens) === J(um.estado.mensagens));
  /* nenhuma sorte vaza entre corridas: correr B no meio não muda A */
  const tres = correr(A);
  t("e correr outra sessão no meio não muda esta (a sorte não vaza entre corridas)", J(tres) === J(um));
  t("o arquivo que entrou não foi tocado (imutabilidade)", J(A) === J(arquivo("replay|s10|a")));
}

sec("2. INTERROMPIDA E RETOMADA A MEIO = A CORRIDA INTEIRA, em todo ponto de corte");
{
  const diferem = [];
  for (let k = 1; k < N; k++) {
    const antes = correr(A, { ate: k });
    const depois = correr(A, { de: k, estado: peloSave(antes.estado) });
    const linhas = [...antes.linhas, ...depois.linhas];
    if (J(peloSave(depois.estado)) !== J(peloSave(um.estado)) || J(linhas) !== J(um.linhas)) diferem.push(k);
  }
  t(`os ${N - 1} cortes possíveis, cada um pelo save (estado → JSON → estado), dão o mesmo fim e os mesmos turnos`, diferem.length === 0, `diferem em k = ${diferem.join(",")}`);
  /* o corte a meio, por extenso: o que o jogador veria */
  const meio = N / 2;
  const a = correr(A, { ate: meio }), b = correr(A, { de: meio, estado: peloSave(a.estado) });
  t(`retomada no turno ${meio + 1}: a mesma ficha (PV ${b.estado.personagem.vida}, ◉ ${b.estado.personagem.moedas}) e as mesmas condições`, J(b.estado.personagem) === J(um.estado.personagem));
  t("e a mesma luta (os inimigos e as condições deles)", J(b.estado.combate) === J(um.estado.combate));
  t("o save que volta é um estado v2", peloSave(a.estado).versao === 2);
}

sec("3. A PEÇA QUE SEGURA A RETOMADA: a casa semeada a cada envio");
{
  /* Semeada uma vez só, no começo da corrida, a casa é um fio que atravessa
     os turnos dentro do processo — e o save não o guarda. A corrida retomada
     recomeça o fio e rola outros dados para os mesmos turnos. É por isto que
     o App semeia a casa em cada envio com o ponto (App.jsx, `enviar`), e é
     isto que o replay da T3 tem de manter. */
  const inteira = correr(A, { semeia: SEMEIA.umaVez });
  let difere = 0;
  for (let k = 1; k < N; k++) {
    const antes = correr(A, { ate: k, semeia: SEMEIA.umaVez });
    semearACasa(A.semente); /* o "continuar" do App semeia a casa ao abrir o save */
    const depois = correr(A, { de: k, estado: peloSave(antes.estado), semeia: SEMEIA.umaVez });
    /* o fim e os turnos, como na secção 2: as condições vencem pelo prazo de
       qualquer jeito, e o fim sozinho esconderia que os turnos do meio rolaram
       outros dados */
    if (J(peloSave(depois.estado)) !== J(peloSave(inteira.estado)) || J([...antes.linhas, ...depois.linhas]) !== J(inteira.linhas)) difere++;
  }
  t(`semeada uma vez só, a retomada sai diferente em ${difere} de ${N - 1} cortes (a semeadura por envio é necessária)`, difere > 0);
}

console.log(`\nreplay em Node: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
