/* teste-semente-em-tudo.mjs (Fase T0, 27/10/2026) — a mesma semente, o mesmo mundo

   A lei: "mesma semente = mesmo resultado, em qualquer máquina". A Fase T0
   tirou os 167 `Math.random` dos módulos e deu a cada função que sorteia uma
   porta para a sorte (o parâmetro `sorte`/`rnd`/`rolar`). Esta suíte prova as
   duas metades que a lei exige e que um gerador constante fingiria:

     · A MESMA SEMENTE DÁ O MESMO RESULTADO — chamada duas vezes com
       `dadoDo(s, ...)`, a função devolve o mesmo objeto, byte a byte;
     · SEMENTES DIFERENTES DÃO RESULTADOS DIFERENTES — vinte sementes não
       podem dar a mesma resposta (o "determinismo" de quem devolve sempre o
       mesmo número é um dado viciado, não uma semente).

   E prova uma terceira, que é a do varredor vista por dentro: durante TODA a
   suíte o `Math.random` global está trocado por uma armadilha que estoura. Se
   um caminho de qualquer módulo aqui medido ainda o chamasse, a suíte caía no
   primeiro passo. */

import { rng, hashSemente, dadoDo, sorteDaCasa, semearACasa, comSorte, sorteDe, SEMENTE_DA_CASA } from "../src/semente.js";
import { gerarEspolios, rolarIniciativa, resolverAtaque, d } from "../src/combate.js";
import { gerarMasmorra, sortearSegredo, recompensaChefe } from "../src/masmorras.js";
import { rolarEncontro } from "../src/encontros.js";
import { gerarDivindade, gerarPanteaoInicial, gerarEventoDivino } from "../src/divindades.js";
import { nomePessoa, nomeCidade } from "../src/nomes.js";
import { gerarLoot, raridadeDeAmeaca, gerarEspolioItem } from "../src/loot.js";
import { gerarPeticao, processarDiaCorreio } from "../src/correio.js";
import { gerarGrupoAventureiros, resolverDecreto, criarDecreto } from "../src/decretos.js";
import { rumorDoDia } from "../src/fama.js";
import { garantirReino } from "../src/reino.js";
import { gerarHabilidadeUnica } from "../src/unicas.js";
import { sortearDadiva } from "../src/regras.js";
import { sortearCicatriz } from "../src/danos.js";
import { sortearConsumivel } from "../src/pocoes.js";
import { gerarEventoLocal, gerarEventoGlobal } from "../src/geradores.js";
import { rolarSonho } from "../src/calendario.js";
import { escolherReacao } from "../src/reacoes.js";
import { gerarVilao } from "../src/vilao.js";
import { decidirAcaoCompanheiro } from "../src/companheiros.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* A ARMADILHA: da primeira à última linha, o Math.random não existe. */
const ACASO_REAL = Math.random;
let tocouNoAcaso = 0;
Math.random = () => { tocouNoAcaso++; throw new Error("Math.random chamado — um sorteio fora da semente"); };

/* ============================================================
   1. as peças de semente.js
   ============================================================ */
sec("1. dadoDo, sorteDaCasa, comSorte, semearACasa, sorteDe");
const seq = (r, n = 6) => Array.from({ length: n }, () => r());
t("dadoDo: as mesmas partes dão a mesma sequência",
  JSON.stringify(seq(dadoDo("mundo", 3, "loot"))) === JSON.stringify(seq(dadoDo("mundo", 3, "loot"))));
t("dadoDo é o padrão da casa escrito por extenso: rng(hashSemente('s|turno|evento'))",
  JSON.stringify(seq(dadoDo("mundo", 3, "loot"))) === JSON.stringify(seq(rng(hashSemente("mundo|3|loot")))));
t("dadoDo: mudar uma parte muda a sequência",
  JSON.stringify(seq(dadoDo("mundo", 3, "loot"))) !== JSON.stringify(seq(dadoDo("mundo", 4, "loot"))));
t("dadoDo aceita null e número sem estourar, e devolve [0,1)",
  seq(dadoDo(null, undefined, 7), 50).every((x) => x >= 0 && x < 1));

semearACasa("campanha-A");
const a1 = seq(sorteDaCasa);
semearACasa("campanha-A");
const a2 = seq(sorteDaCasa);
semearACasa("campanha-B");
const b1 = seq(sorteDaCasa);
t("semearACasa: a mesma semente reinicia a mesma sequência", JSON.stringify(a1) === JSON.stringify(a2));
t("semearACasa: outra semente, outra sequência", JSON.stringify(a1) !== JSON.stringify(b1));
t("a sorte da casa avança: dois sorteios seguidos não são iguais", a1[0] !== a1[1]);
t("a semente da casa está numa tabela que se lê", typeof SEMENTE_DA_CASA === "string" && SEMENTE_DA_CASA.length > 0);

semearACasa("trava");
const antes = sorteDaCasa;
const dentro = comSorte(() => 0.25, () => [sorteDaCasa(), sorteDaCasa()]);
t("comSorte: dentro de fn, a casa rola o gerador dado", dentro[0] === 0.25 && dentro[1] === 0.25);
let estourou = false;
try { comSorte(() => 0.9, () => { throw new Error("x"); }); } catch { estourou = true; }
semearACasa("trava");
const r1 = sorteDaCasa();
semearACasa("trava");
comSorte(() => 0.1, () => sorteDaCasa());
const r2 = sorteDaCasa();
t("comSorte restaura a casa — e não gasta dela o que rolou dentro", r1 === r2);
t("comSorte restaura MESMO quando fn estoura (o finally é o ponto)", estourou && sorteDaCasa !== undefined && antes === sorteDaCasa);
t("comSorte sem gerador só chama fn", comSorte(null, () => 42) === 42 && comSorte(7, () => 43) === 43);
t("comSorte sem fn não estoura", comSorte(() => 0.5, null) === undefined);
const minha = () => 0.5;
t("sorteDe: função passa; número, null e índice caem na casa",
  sorteDe(minha) === minha && sorteDe(3) === sorteDaCasa && sorteDe(null) === sorteDaCasa && sorteDe({}) === sorteDaCasa);

/* ============================================================
   2. módulo a módulo: a mesma semente, o mesmo resultado; outras, outros
   ============================================================ */
sec("2. cada módulo: mesma semente = mesmo resultado, e sementes diferentes variam");
const SEMENTES = Array.from({ length: 20 }, (_, i) => `t0-${i}`);
/* `id` e `__id` carregam sorteio também — mas é o resto que importa medir
   como "variou"; um id diferente sozinho não prova um mundo diferente. */
const assina = (x) => JSON.stringify(x, (k, v) => (k === "id" || k === "__id" ? undefined : v));
function prova(nome, f) {
  let igual = true, erro = null;
  const vistos = new Set();
  try {
    for (const s of SEMENTES) {
      const a = JSON.stringify(f(dadoDo(s, nome)));
      const b = JSON.stringify(f(dadoDo(s, nome)));
      if (a !== b) igual = false;
      vistos.add(assina(JSON.parse(a ?? "null")));
    }
  } catch (e) { erro = e.message; }
  t(`${nome}: a mesma semente dá o mesmo resultado`, !erro && igual, erro || "");
  t(`${nome}: vinte sementes não dão uma resposta só (${vistos.size} distintas)`, !erro && vistos.size > 1);
}

const G = "Fantasia medieval";
const heroi = { nome: "Ana", classe: "Guerreiro", nivel: 5, atributos: { destreza: 2, forca: 3 }, equipados: {}, vida: 40, vidaMax: 40, mana: 10 };

/* combate */
prova("combate · d", (r) => [d(20, r), d(20, r), d(6, r)]);
prova("combate · gerarEspolios", (r) => gerarEspolios([{ ameaca: "comum" }, { ameaca: "elite" }, { ameaca: "fraco" }], 5, r));
prova("combate · rolarIniciativa", (r) => rolarIniciativa([{ nome: "A", modDestreza: 2 }, { nome: "B", modDestreza: 2 }, { nome: "C", modDestreza: 1 }], r).map((c) => c.nome + c.rolo));
prova("combate · resolverAtaque", (r) => { const x = resolverAtaque({ atacante: "Lobo", alvo: heroi, ehAtacanteInimigo: true, bonusAtaque: 4, danoBase: 8, rolar: r }); return [x.tipo, x.d20, x.dano]; });
/* masmorras */
prova("masmorras · gerarMasmorra", (r) => gerarMasmorra(G, 4, "", { salas: 7, sorte: r }));
prova("masmorras · sortearSegredo", (r) => [sortearSegredo("tesouro", r), sortearSegredo("combate", r), sortearSegredo("vazia", r), sortearSegredo("tesouro", r)]);
prova("masmorras · recompensaChefe", (r) => recompensaChefe(6, null, r));
/* encontros */
prova("encontros · rolarEncontro", (r) => [rolarEncontro(G, 3, null, r), rolarEncontro(G, 3, "Bento", r), rolarEncontro(G, 7, null, r)]);
/* divindades */
prova("divindades · gerarDivindade", (r) => gerarDivindade({ lugar: "Vau" }, 4, { sorte: r }));
prova("divindades · gerarPanteaoInicial", (r) => gerarPanteaoInicial({ lugar: "Vau" }, 1, r));
const PANTEAO = gerarPanteaoInicial({ lugar: "Vau" }, 1, dadoDo("panteao-fixo"));
prova("divindades · gerarEventoDivino", (r) => [1, 2, 3].map((k) => gerarEventoDivino({ lugar: "Vau" }, 10 + k, PANTEAO, r)));
/* nomes */
prova("nomes · nomePessoa", (r) => [nomePessoa(G, "fem", r), nomePessoa(G, "masc", r), nomePessoa("Cyberpunk", "fem", r)]);
prova("nomes · nomeCidade", (r) => [nomeCidade(G, r), nomeCidade(G, r)]);
/* loot */
prova("loot · gerarLoot", (r) => gerarLoot("raro", { nivel: 5, rnd: r }));
prova("loot · raridadeDeAmeaca", (r) => Array.from({ length: 6 }, () => raridadeDeAmeaca("elite", r)));
prova("loot · gerarEspolioItem", (r) => gerarEspolioItem([{ ameaca: "elite" }, { ameaca: "comum" }], 5, null, r));
/* correio */
const POT = { nome: "Casa de Vael", poder: 60, tipo: "reino" };
prova("correio · gerarPeticao", (r) => gerarPeticao({ faccoes: [POT.nome, "Liga do Sal"], dia: 2, potencias: [POT], sorte: r }));
prova("correio · processarDiaCorreio", (r) => {
  let c = null; const out = [];
  for (let dia = 1; dia <= 12; dia++) { const p = processarDiaCorreio(c, { dia, faccoes: [POT.nome, "Liga do Sal"], potencias: [POT], sorte: r }); c = p && p.correio !== undefined ? p.correio : p; out.push(p); }
  return out;
});
/* decretos */
prova("decretos · gerarGrupoAventureiros", (r) => gerarGrupoAventureiros(G, 5, r));
const DECRETO = criarDecreto({ tipo: "cacada", alvo: "o lobo de Vau", recompensa: 200, nivel: 5, sorte: dadoDo("decreto-fixo") });
prova("decretos · resolverDecreto", (r) => resolverDecreto(DECRETO, r));
/* fama, reino, únicas, dádivas, cicatrizes, consumíveis, eventos, sonhos */
prova("fama · rumorDoDia", (r) => Array.from({ length: 5 }, () => rumorDoDia({ masmorrasConcluidas: 2, cicatrizes: 3 }, "Ana", { min: 50, rotulo: "Lenda" }, true, r)));
prova("reino · garantirReino", (r) => garantirReino({}, { cidades: [{ nome: "Vau", tipo: "vila", relacao: "jogador" }, { nome: "Ponte", tipo: "cidade", relacao: "jogador" }] }, r));
prova("unicas · gerarHabilidadeUnica", (r) => gerarHabilidadeUnica(6, [], r));
prova("regras · sortearDadiva", (r) => [sortearDadiva([], r), sortearDadiva([], r), sortearDadiva([], r)]);
prova("danos · sortearCicatriz", (r) => [sortearCicatriz([], r), sortearCicatriz([], r)]);
prova("pocoes · sortearConsumivel", (r) => [sortearConsumivel(4, { sorte: r }), sortearConsumivel(9, { sorte: r })]);
const ATOR = (nome) => ({ nome, raca: "humana", genero_pessoa: "mulher", ocupacao: "ferreira", traco: "teimosa" });
const CTX_EV = { lugar: "Vau", genero: G, a1: ATOR("Bia"), a2: ATOR("Cora"), a3: ATOR("Dina"), a4: ATOR("Eva"), pessoa: (a) => a.nome };
prova("geradores · gerarEventoLocal", (r) => [gerarEventoLocal(CTX_EV, 3, r), gerarEventoGlobal(CTX_EV, 3, r)]);
prova("calendario · rolarSonho", (r) => [rolarSonho(r), rolarSonho(r), rolarSonho(r)]);
/* reações, vilão, companheiro */
const LADINO = { nome: "Rui", classe: "Ladino", nivel: 5, vida: 30, vidaMax: 30, mana: 20, habilidades: [] };
prova("reacoes · escolherReacao", (r) => Array.from({ length: 6 }, () => (escolherReacao({ pers: LADINO, gatilho: "sofre_dano", dano: 12, sorte: r }) || {}).id || null));
prova("vilao · gerarVilao", (r) => gerarVilao({ nome: "Sarna", cont: {}, dia: 10, sorte: r }));
const ELIRA = { nome: "Elira", classe: "Clérigo", nivel: 4, vida: 20, vidaMax: 24, mana: 20, habilidades: [{ nome: "Golpe Sagrado", tipo: "ataque", custo: 3 }] };
prova("companheiros · decidirAcaoCompanheiro", (r) => Array.from({ length: 6 }, () => decidirAcaoCompanheiro(ELIRA, { aliados: [], inimigos: [{ nome: "Lobo", vida: 10, vidaMax: 10 }], jogador: heroi, rodada: 3, sorte: r })));

/* ============================================================
   3. a armadilha não disparou
   ============================================================ */
sec("3. nenhum caminho medido tocou no Math.random");
Math.random = ACASO_REAL;
t(`o Math.random global foi chamado ${tocouNoAcaso} vez(es) durante a suíte`, tocouNoAcaso === 0);

console.log(`\nsemente-em-tudo: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
