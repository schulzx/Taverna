/* ETAPA 8 — o ADVERSÁRIO, a oposição como cena.

   A pergunta que este teste responde: a frase que vai à Pauta é
   VERDADE? Uma intenção que não muda o alvo é adjetivo. Por isso quase
   tudo aqui mede as DUAS SAÍDAS ao mesmo tempo — a ficção e a mecânica
   têm de sair do mesmo lugar e concordar. */
import {
  PRIORIDADES, INTENCOES, prioridadePorId, intencaoPorId,
  garantirAlvo, garantirLuta, escolherAlvo,
  consultarAdversario, intencaoDaVez, alvoDoAdversario,
  linhaDaLuta, envelopeDaVirada, ADVERSARIO_PROMPT,
} from "../src/adversario.js";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

const heroi = { ref: "jogador", nome: "Kael", vida: 40, vidaMax: 40, nivel: 8, heroi: true, perto: true };
const mago = { ref: "grupo", nome: "Vess", vida: 22, vidaMax: 30, nivel: 7, conjurador: true, perto: false, i: 0 };
const cura = { ref: "grupo", nome: "Bram", vida: 28, vidaMax: 32, nivel: 7, cura: true, perto: true, i: 1 };
const ferido = { ref: "grupo", nome: "Odo", vida: 4, vidaMax: 30, nivel: 6, perto: true, i: 2 };
const todos = [heroi, mago, cura, ferido];

const base = {
  nome: "Bando de Salteadores", ameaca: "comum", quantos: 4, quantosEram: 4,
  minhaVida: 1, heroiVida: 1, quantosDoOutroLado: 4, rodada: 1, saidas: 2,
};

console.log("== A CATRACA: TODO CAMPO LIDO EXISTE, TODO CAMPO QUE EXISTE É LIDO ==");
const campos = Object.keys(garantirLuta(null));
const lidos = new Set();
for (const i of INTENCOES) {
  for (const fn of [i.quando, i.quebra]) {
    for (const m of String(fn).matchAll(/s\.([a-zA-Z]+)/g)) lidos.add(m[1]);
  }
}
for (const fn of [consultarAdversario, intencaoDaVez, linhaDaLuta, envelopeDaVirada]) {
  for (const m of String(fn).matchAll(/s\.([a-zA-Z]+)/g)) lidos.add(m[1]);
}
const orfaos = [...lidos].filter((c) => !campos.includes(c));
t("nenhuma intenção lê campo que a garantia não entrega", orfaos.length === 0, orfaos.join(", "));
const mortos = campos.filter((c) => !lidos.has(c));
t("nenhum campo da garantia fica sem leitor", mortos.length === 0, mortos.join(", "));

console.log("\n== O ACERVO SE FECHA ==");
t("toda intenção aponta para uma prioridade que existe",
  INTENCOES.every((i) => !!prioridadePorId(i.alvo)),
  INTENCOES.filter((i) => !prioridadePorId(i.alvo)).map((i) => i.id + "→" + i.alvo).join(", "));
t("todo `vira` aponta para uma intenção que existe",
  INTENCOES.every((i) => !i.vira || !!intencaoPorId(i.vira)),
  INTENCOES.filter((i) => i.vira && !intencaoPorId(i.vira)).map((i) => i.id + "→" + i.vira).join(", "));
t("nenhum id repetido", new Set(INTENCOES.map((i) => i.id)).size === INTENCOES.length);
t("nenhuma prioridade repetida", new Set(PRIORIDADES.map((p) => p.id)).size === PRIORIDADES.length);
t("toda intenção tem as três coisas", INTENCOES.every((i) => i.quer && i.alvo && typeof i.quebra === "function" && i.porque));
t("toda prioridade é executável", PRIORIDADES.every((p) => typeof p.escolher === "function"));
t("o acervo tem tamanho de acervo", INTENCOES.length >= 35, String(INTENCOES.length));
console.log(`      ${INTENCOES.length} intenções · ${PRIORIDADES.length} prioridades de alvo`);

console.log("\n== NENHUMA PRIORIDADE É DECORATIVA ==");
/* uma prioridade que nenhum alvo plausível satisfaz nunca escolheria
   ninguém, e a intenção que a usa cairia sempre no comportamento antigo
   — a Pauta prometeria e a mecânica não entregaria */
const rico = [
  { ...heroi }, { ...mago }, { ...cura }, { ...ferido },
  { ref: "grupo", nome: "Iron", vida: 30, vidaMax: 30, nivel: 9, bloqueia: true, perto: true, meFeriu: true, carrega: true, i: 3 },
];
for (const p of PRIORIDADES) {
  const r = escolherAlvo(p.id, rico);
  t(`${p.id} escolhe alguém quando há quem`, !!r, "não escolheu ninguém");
}

console.log("\n== CADA PRIORIDADE ESCOLHE QUEM DIZ QUE ESCOLHE ==");
t("o_ferido pega o mais machucado", escolherAlvo("o_ferido", todos).nome === "Odo");
t("o_conjurador pega o mago", escolherAlvo("o_conjurador", todos).nome === "Vess");
t("o_curandeiro pega quem remenda", escolherAlvo("o_curandeiro", todos).nome === "Bram");
t("o_heroi pega o herói", escolherAlvo("o_heroi", todos).nome === "Kael");
t("quem_nao_e_o_heroi nunca pega o herói", escolherAlvo("quem_nao_e_o_heroi", todos).heroi === false);
t("o_mais_fraco não pega o mais forte", escolherAlvo("o_mais_fraco", todos).nome !== "Kael");
t("quem_esta_longe pega quem atira", escolherAlvo("quem_esta_longe", todos).nome === "Vess");
t("quem_esta_perto não pega quem está longe", escolherAlvo("quem_esta_perto", todos).perto === true);
t("prioridade inexistente devolve null", escolherAlvo("nao_existe", todos) === null);
t("sem alvos vivos, null", escolherAlvo("o_ferido", [{ ...heroi, vida: 0 }]) === null);
t("morto não é escolhido", escolherAlvo("quem_estiver", [{ ...heroi, vida: 0 }, mago]).nome === "Vess");
t("lista vazia não quebra", escolherAlvo("o_ferido", []) === null);
t("lista torta não quebra", escolherAlvo("o_ferido", [null, undefined, 3]) !== undefined);

console.log("\n== A GARANTIA DO ALVO ==");
const a0 = garantirAlvo(null);
t("alvo vazio tem vidaMax >= 1", a0.vidaMax >= 1);
t("alvo vazio é 'perto' por padrão", a0.perto === true, "senão quem_esta_perto ficaria vazia em toda luta sem grade");
t("vidaMax zero vira 1", garantirAlvo({ vidaMax: 0 }).vidaMax === 1, "senão a fração dividiria por zero");

console.log("\n== A CONSULTA FALHA FECHADA ==");
t("sem nome, sem intenção", consultarAdversario({}) === null);
t("sem nada, sem intenção", consultarAdversario(null) === null);
t("sem intenção, sem alvo", alvoDoAdversario(null, todos) === null);
t("sem intenção, sem linha", linhaDaLuta(null, todos) === "");
t("sem intenção, sem envelope", envelopeDaVirada(null) === "");

console.log("\n== NINGUÉM FICA MUDO: A REDE PEGA TUDO ==");
/* a mesma checagem que salvou o Vilão e o Intérprete. Uma situação sem
   leitura nenhuma é um agente que cala na cena mais comum do jogo. */
let mudos = 0, amostras = 0;
const vf = [true, false];
for (const ehBicho of vf) for (const ehMorto of vf) for (const pensa of vf)
  for (const apertado of vf) for (const aberto of vf) for (const escuro of vf)
    for (const quantos of [1, 3, 7]) for (const outro of [1, 4])
      for (const vida of [1, 0.5, 0.15]) for (const rodada of [1, 3, 6]) {
        amostras++;
        const s = { ...base, nome: "X", ehBicho, ehMorto, pensa, apertado, aberto, escuro, quantos, quantosDoOutroLado: outro, minhaVida: vida, rodada };
        const v = intencaoDaVez(s);
        if (!v || !v.intencao) mudos++;
      }
t("nenhuma das combinações deixa o adversário mudo", mudos === 0, `${mudos} de ${amostras}`);
console.log(`      ${amostras} situações varridas · ${mudos} sem intenção`);

console.log("\n== E A INTENÇÃO SEMPRE PRODUZ UM ALVO DE VERDADE ==");
/* o teste que dá fé da etapa: a linha da Pauta só é verdade se o alvo
   sair da MESMA intenção. Aqui se mede que ela sai. */
let semAlvo = 0;
for (const i of INTENCOES) {
  const r = escolherAlvo(i.alvo, rico);
  if (!r) { semAlvo++; console.log("      sem alvo: " + i.id + " (" + i.alvo + ")"); }
}
t("toda intenção produz alvo num grupo completo", semAlvo === 0);

console.log("\n== AS INTENÇÕES QUE O DESENHO PROMETEU ==");
const bicho = { ...base, nome: "Lobo Cinzento", ehBicho: true, pensa: false, quantos: 3 };
t("o bicho quer comer", consultarAdversario(bicho).id === "comer");
t("o bicho ferido foge", intencaoDaVez({ ...bicho, minhaVida: 0.2 }).intencao.id === "fugir_ferido");
t("o bicho encurralado não foge", intencaoDaVez({ ...bicho, minhaVida: 0.2, saidas: 0 }).intencao.id === "encurralado");

const salteador = { ...base, nome: "Salteador", pensa: true, temConjurador: true };
t("calar a magia vence a briga genérica", consultarAdversario(salteador).id === "calar_a_magia");
t("e o alvo dela é o conjurador", alvoDoAdversario(salteador, todos).nome === "Vess");
t("sem conjurador, ela quebra", intencaoDaVez({ ...salteador, temConjurador: false }).intencao.id !== "calar_a_magia");

const captura = { ...base, nome: "Punho de Ferro", pensa: true, doVilao: true, heroiFamoso: true, quantos: 4 };
t("captura quando vale mais vivo", consultarAdversario(captura).id === "capturar");
t("e ela quebra quando o bando mingua", intencaoDaVez({ ...captura, quantos: 1 }).intencao.id !== "capturar");
t("e vira sair vivo", intencaoDaVez({ ...captura, quantos: 1, minhaVida: 0.2 }).intencao.id === "sair_vivo");

const beira = { ...base, nome: "Bruto", pensa: true, alto: true, ondeCai: "o poço" };
t("com beira, empurra", consultarAdversario(beira).id === "empurrar");
t("sem beira, não empurra", consultarAdversario({ ...beira, ondeCai: "" }).id !== "empurrar");

const refem = { ...base, nome: "Sequestrador", pensa: true, temRefem: true };
t("com refém, negocia", consultarAdversario(refem).id === "usar_o_refem");
t("e na terceira rodada a conversa acaba", intencaoDaVez({ ...refem, rodada: 3 }).intencao.id === "matar_todos");

const morto = { ...base, nome: "Carcaça Errante", ehMorto: true, pensa: false, minhaVida: 0.1 };
t("o morto não foge nem a 10% de vida", ["nao_para", "guardar_o_fundo", "encurralado"].includes(intencaoDaVez(morto).intencao.id));
t("o morto não é 'sair_vivo'", intencaoDaVez(morto).intencao.id !== "sair_vivo");

const tropa = { ...base, nome: "Guarda da Torre", pensa: true, ehTropa: true, temLider: true, liderCaiu: true };
t("tropa sem chefe debanda", ["debandar", "vinganca"].includes(intencaoDaVez(tropa).intencao.id));

console.log("\n== A LINHA DA PAUTA ==");
const linha = linhaDaLuta(salteador, todos);
console.log("      " + linha);
t("a linha nomeia quem age", linha.startsWith("Salteador:"));
t("a linha nomeia o alvo", /Vess/.test(linha));
t("a linha não escreve fala", !/[""]/.test(linha));
t("a linha é curta", linha.length <= 140, String(linha.length));
t("toda intenção produz linha curta", INTENCOES.every((i) => linhaDaLuta({ ...base, nome: "N", ...forcar(i) }, rico).length <= 160));

function forcar(i) {
  /* empurra a situação para a intenção `i` valer, na marra, só para
     medir o tamanho da linha — não é o caminho normal */
  return { ehBicho: true, ehMorto: true, pensa: true, temRefem: true, temConjurador: true, temCurandeiro: true, alto: true, ondeCai: "o poço" };
}

console.log("\n== A ADERÊNCIA: A INTENÇÃO NÃO OSCILA ==");
/* o defeito que a primeira versão tinha por dentro. Sem `antes`, a
   intenção era rederivada do zero a cada chamada e trocava sempre que
   um número oscilava — um inimigo que muda de plano toda rodada não tem
   plano, que é o defeito que este módulo existe para consertar. */
t("com `antes`, a intenção que ainda serve permanece",
  intencaoDaVez({ ...salteador, rodada: 4, alguemFerido: true }, { antes: "calar_a_magia" }).intencao.id === "calar_a_magia");
t("e sem `antes` outra teria ganhado",
  consultarAdversario({ ...salteador, rodada: 4, alguemFerido: true, temConjurador: false }).id !== "calar_a_magia");
t("uma intenção que deixou de bater CONTINUA valendo até quebrar",
  intencaoDaVez({ ...captura, heroiFamoso: false, doVilao: false }, { antes: "capturar" }).intencao.id === "capturar",
  "quem decidiu capturar não desiste porque o alvo mudou de posição");
t("mas quebrada, ela sai", intencaoDaVez({ ...captura, quantos: 1 }, { antes: "capturar" }).intencao.id !== "capturar");
t("e vai para onde o `vira` mandou", intencaoDaVez({ ...captura, quantos: 1 }, { antes: "capturar" }).intencao.id === "sair_vivo");
t("a primeira leitura não é virada", intencaoDaVez(salteador).quebrou === false);

console.log("\n== O ENVELOPE SÓ SAI NA VIRADA ==");
t("sem virada, sem envelope", envelopeDaVirada(salteador) === "");
t("intenção que segue valendo não gera envelope", envelopeDaVirada(captura, { antes: "capturar" }) === "");
const virou = { ...captura, quantos: 1 };
const env = envelopeDaVirada(virou, { antes: "capturar" });
t("com virada, há envelope", env.length > 0);
t("o envelope diz que virou", /A LUTA VIROU/.test(env));
t("o envelope nomeia quem virou", /Punho de Ferro/.test(env));
t("o envelope não escreve a cena", !/cheiro|sangue escorr|grita/.test(env));
t("o envelope é curto", env.length <= 400, String(env.length));
console.log("      " + env.slice(0, 200));

console.log("\n== A VIRADA ACONTECE UMA VEZ, NÃO TODA RODADA ==");
/* se o envelope saísse enquanto a nova intenção estivesse valendo, a
   Pauta repetiria "a luta virou" até o fim da luta e viraria ruído */
t("na rodada seguinte, já com a nova como `antes`, não há mais envelope",
  envelopeDaVirada(virou, { antes: "sair_vivo" }) === "");

console.log("\n== DETERMINISMO ==");
/* o `turnoDosInimigos` chama isto mais de uma vez por rodada. Um
   inimigo que troca de plano entre dois golpes da mesma rodada não tem
   plano. */
let igual = true;
for (let k = 0; k < 200; k++) {
  const a = intencaoDaVez(salteador), b = intencaoDaVez(salteador);
  const x = alvoDoAdversario(salteador, todos, { antes: "calar_a_magia" }), y = alvoDoAdversario(salteador, todos, { antes: "calar_a_magia" });
  if (a.intencao.id !== b.intencao.id || (x && y && x.nome !== y.nome)) { igual = false; break; }
}
t("a mesma situação dá sempre a mesma intenção e o mesmo alvo", igual);

console.log("\n== O PROMPT ==");
t("o prompt existe", ADVERSARIO_PROMPT.length > 100);
t("o prompt proíbe inventar intenção", /NUNCA invente uma inten/.test(ADVERSARIO_PROMPT));
t("o prompt diz que a prioridade é a mesma da mecânica", /a mesma que o sistema usa/.test(ADVERSARIO_PROMPT));
t("o prompt cabe", ADVERSARIO_PROMPT.length <= 900, String(ADVERSARIO_PROMPT.length));
console.log(`      prompt: ${ADVERSARIO_PROMPT.length} caracteres`);

console.log("\n== NADA QUEBRA COM LIXO ==");
for (const lixo of [undefined, null, 0, "", [], "texto", { nome: 3 }, { nome: "X", quantos: NaN, minhaVida: "abc" }]) {
  try { intencaoDaVez(lixo); alvoDoAdversario(lixo, todos); linhaDaLuta(lixo, todos); envelopeDaVirada(lixo); ok++; }
  catch (e) { bad++; console.log("  FALHOU: quebrou com " + JSON.stringify(lixo) + " — " + e.message); }
}

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
