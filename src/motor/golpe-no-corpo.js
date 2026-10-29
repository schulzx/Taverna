/* ============================================================
   O GOLPE NO CORPO, NO MOTOR (Fase T, trilha B, 28/10/2026) — src/motor/golpe-no-corpo.js

   Três regras puras moravam no App sem peça própria, e por isso só podiam
   ser provadas lendo-lhes o texto: ~25 asserções em teste-efeitos e
   teste-amortece mediam regex sobre o `App.jsx` porque não havia função
   para chamar. Vêm para cá, à letra, e com os porquês de cada linha:

   - `oAbrigoDoGolpe` — a porta única do abrigo (`passarPeloAbrigo` no App,
     v9.233): `absorverDano` decide e escreve a linha; daqui sai o nome do
     dono quando quem apanha não é o herói, a linha vazia como único sinal
     de que nada aconteceu, e o recuo que devolve o que ENTROU, byte a
     byte, quando o abrigo estoura. O `calou` vem de quem chama — o motor
     não sabe onde a casa regista o que calou.
   - `aConcentracaoDoGolpe` — a irmã do companheiro (`segurarOuPerder`,
     v9.236 · C2b): dano zero não testa, quem não segura nada volta sem
     linha, e a que cai sai da ficha com o nome do dono na frente.
   - `aQuebraDoHeroi` — a quebra na mesa do herói (v9.235 · C2): a 🎲 só
     para quem pediu para ver as rolagens, a linha que `testeConcentracao`
     montou sem prefixo nenhum, e a nota ao Narrador SÓ no turno da queda,
     empilhada nas vizinhas — o canal por turno, nunca o prompt estático.
   - `aFilaDoGolpeNoHeroi` — a ordem em que o golpe do inimigo chega ao
     corpo do herói: a origem (`amortecerDano`), a invocação
     (`repartirDano`) e só então o abrigo, porque ele se gasta contra o que
     de facto chega. A ordem era uma regra escrita em comentário e provada
     por `indexOf`; aqui é uma função, e a prova corre-a.

   O NOME DO DONO é coisa de tela (o módulo do efeito não sabe de quem é a
   mesa), e entra pelo mesmo molde nas três linhas do companheiro — o 🛡 do
   abrigo, o 💢 da batida, o 💢 da troca — para saírem irmãs na cena. O
   molde é tabela (`MOLDE_DO_DONO`), lida de volta pela suíte.

   A SORTE do teste de concentração é a da casa (`d(20)` em combate.js);
   quem quiser provar passa `{ sorte }`, e o teste rola dentro de
   `comSorte` — mesma semente, mesma queda, em qualquer máquina.

   A forma é a das outras peças: o que entra é lido, nunca tocado; o que
   sai é novo. Provado contra o recorte à letra do App de c494a04
   (`golpe-dourado.json`) em `teste-motor-golpe-no-corpo.mjs`.
   ============================================================ */
import { absorverDano, efeitoEmConcentracao, quebrarConcentracao } from "../efeitos.js";
import { testeConcentracao } from "../combate.js";
import { atributoEfetivo } from "../regras-jogo.js";
import { amortecerDano } from "../tracos.js";
import { repartirDano } from "../invocacoes.js";
import { comSorte } from "../semente.js";

/* o molde do dono: o ícone com que a linha do módulo começa, e a juntura
   entre o nome e o resto da frase ("🛡 Bruna — Escudo encontra o golpe…") */
export const MOLDE_DO_DONO = Object.freeze({ abrigo: "🛡 ", quebra: "💢 ", juntura: " — " });

/* o envelope da queda, pela nota por turno (o teto do prompt proíbe somá-lo
   ao estático). Em primeira pessoa, como as outras notas do sistema. */
export const ENVELOPES_DO_GOLPE = Object.freeze({
  quebraDaConcentracao: ({ magia }) => `[CONCENTRAÇÃO — QUEBRADA PELO SISTEMA] O golpe me fez perder "${magia}": a magia se desfez agora e o sistema já a tirou da minha ficha. Narre o efeito se desmanchando no instante do impacto e trate a cena sem ele daqui em diante — não a devolva, não a recalcule e não cobre outro preço por ela.`,
});

/* `= {}` não cobre `null`: as opções entram por aqui */
const opcoesDe = (op) => (op && typeof op === "object" ? op : {});
/* o `calou` de quem chama; um `calou` que estoure também não leva o turno */
const calar = (op, onde, e) => {
  if (typeof op.calou !== "function") return;
  try { op.calou(onde, e); } catch { /* nunca pode custar o turno */ }
};
/* o nome do dono à frente da linha — só quando há nome, como no App */
const comODono = (linha, icone, nome) => (nome ? String(linha).replace(icone, icone + nome + MOLDE_DO_DONO.juntura) : linha);

/* ---------------- O ABRIGO ENTRE O GOLPE E A PELE ----------------
   → { pers, dano, linha }. Sem abrigo (ou abrigo que não absorveu nada) a
   resposta é o que entrou, o MESMO objeto e o MESMO dano — é assim que a
   regressão fora da família fica em zero. */
export function oAbrigoDoGolpe(quem, dano, nome = "", opcoes) {
  const op = opcoesDe(opcoes);
  try {
    const ab = absorverDano(quem, dano);
    if (!ab || !(ab.absorvido > 0)) return { pers: quem, dano, linha: "" };
    return { pers: ab.pers, dano: ab.dano, linha: comODono(ab.linha, MOLDE_DO_DONO.abrigo, nome) };
  } catch (e) { calar(op, "abrigo", e); return { pers: quem, dano, linha: "" }; }
}

/* ---------------- O QUE O COMPANHEIRO SEGURAVA CAI AQUI ----------------
   → { pers, linha } e, na queda, `magia`. Quem chama passa o dano que
   SOBROU do abrigo, e só chama com o alvo de pé: o escudo que comeu a
   batida já pagou por ela, e quem caiu não tem o que segurar. */
export function aConcentracaoDoGolpe(quem, dano, nome = "", opcoes) {
  const op = opcoesDe(opcoes);
  try {
    if (!quem || !(dano > 0)) return { pers: quem, linha: "" };
    const segurada = efeitoEmConcentracao(quem);
    if (!segurada) return { pers: quem, linha: "" };
    const tc = comSorte(op.sorte, () => testeConcentracao(dano, atributoEfetivo(quem, "vigor"), segurada.nome));
    if (tc.manteve) return { pers: quem, linha: "" };
    return {
      pers: quebrarConcentracao(quem, segurada.nome),
      magia: segurada.nome,
      linha: comODono(tc.linha, MOLDE_DO_DONO.quebra, nome),
    };
  } catch (e) { calar(op, "concentracaoDoCompanheiro", e); return { pers: quem, linha: "" }; }
}

/* ---------------- A QUEBRA NA MESA DO HERÓI ----------------
   O herói apanhou `dano` nesta rodada (a soma dos golpes, depois do
   abrigo). → { mensagens, quebrada, nota }:
   - `mensagens`: a 🎲 (só com `mostrarRolagens`) e, na queda, a linha do
     módulo tal como veio — prefixar seria escrever a cena duas vezes;
   - `quebrada`: o nome da magia que caiu, ou null (quem a tira da ficha é
     quem chama, depois de o dano virar PV);
   - `nota`: a nota do turno, com o envelope empilhado SÓ na queda; sem
     queda, a que entrou.
   Se o teste estourar, a rodada segue e a magia fica de pé — o recuo que
   não inventa perda. */
export function aQuebraDoHeroi(persBase, dano, opcoes) {
  const op = opcoesDe(opcoes);
  const nada = { mensagens: [], quebrada: null, nota: op.nota };
  if (!(dano > 0)) return nada;
  try {
    const concentrando = efeitoEmConcentracao(persBase);
    if (!concentrando) return nada;
    const tc = comSorte(op.sorte, () => testeConcentracao(dano, atributoEfetivo(persBase, "vigor"), concentrando.nome));
    const mensagens = [];
    if (op.mostrarRolagens) mensagens.push({ autor: "sistema", texto: `🎲 ${tc.texto}` });
    if (tc.manteve) return { mensagens, quebrada: null, nota: op.nota };
    mensagens.push({ autor: "sistema", texto: tc.linha });
    const envelope = ENVELOPES_DO_GOLPE.quebraDaConcentracao({ magia: concentrando.nome });
    return { mensagens, quebrada: concentrando.nome, nota: `${op.nota ? op.nota + "\n" : ""}${envelope}` };
  } catch (e) { calar(op, "quebraDaConcentracao", e); return nada; }
}

/* ---------------- A FILA DO GOLPE NO HERÓI ----------------
   Um golpe de inimigo que chega ao herói, na ordem do App: a ORIGEM age
   sobre o golpe (a Pele de Pedra, a resistência, o abafo comprado, a
   redução anã), a INVOCAÇÃO o recebe como ele chega ao herói (o Elo Vital,
   a Fusão), e o ABRIGO por último, contra o que de facto chega ao corpo.
   Cada estação só escreve quando falou (as `linhas`, a `linha`).
   `grupo` é a autoridade sobre o grupo no laço de quem chama: a invocação
   apanha nele. → { pers, grupo, dano, mensagens }, com o MESMO `pers` e o
   MESMO `grupo` quando nenhuma estação falou. */
export function aFilaDoGolpeNoHeroi(pers, grupo, dano, tipo, opcoes) {
  let p = pers, g = grupo, d = dano;
  const mensagens = [];
  const amort = amortecerDano(p, d, tipo || "fisico");
  if (amort.linhas.length) {
    p = amort.pers;
    d = amort.dano;
    amort.linhas.forEach((t) => mensagens.push({ autor: "sistema", texto: t }));
  }
  const rep = repartirDano({ ...p, grupo: g }, d);
  if (rep.linhas.length) {
    g = rep.pers.grupo || g;
    d = rep.dano;
    rep.linhas.forEach((t) => mensagens.push({ autor: "sistema", texto: t }));
  }
  const abr = oAbrigoDoGolpe(p, d, "", opcoes);
  if (abr.linha) {
    p = abr.pers;
    d = abr.dano;
    mensagens.push({ autor: "sistema", texto: abr.linha });
  }
  return { pers: p, grupo: g, dano: d, mensagens };
}
