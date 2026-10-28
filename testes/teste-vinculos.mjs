/* teste-vinculos.mjs (Fase T, trilha B, 28/10/2026) — o vínculo não escreve
   no companheiro que recebe.

   `ganharVinculo` devolvia um membro novo, mas a lista `marcos` dele era a
   MESMA do membro de entrada, com o marco novo empurrado (`marcos.push`). A
   lei da casa é a imutabilidade: estado é substituído, nunca mutado. Na
   prática, a ficha de ANTES do turno (a que o ref ainda guarda, a que o
   desfazer e o dourado leem) ganhava o marco sem ganhar os +2 PV — e um
   segundo `ganharVinculo` sobre ela já não dava o marco, nem os PV.
   Achado pela trilha A ao mover o combate (6.ª fatia da T1-A); os dourados
   copiavam a entrada e não o viam.

   A prova: o membro de entrada vai congelado a fundo (`Object.freeze` em
   tudo o que ele tem), e nada nele pode mudar. */
import { VINCULO_INICIAL, VINCULO_MAX, MARCOS_VINCULO, ganharVinculo } from "../src/vinculos.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const congelar = (o) => {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) congelar(v);
  }
  return o;
};
/* chama sem deixar uma escrita silenciosa passar: um objeto congelado só
   estoura em modo estrito, e o módulo pode não estar nele — por isso a
   prova compara também o texto de antes e o de depois */
const tenta = (fn) => { try { return { r: fn(), erro: null }; } catch (e) { return { r: null, erro: e }; } };

sec("1. O MEMBRO DE ENTRADA NÃO MUDA");
{
  const marcosDeEntrada = [];
  const brás = { nome: "Brás", vida: 9, vidaMax: 15, vinculo: 24, marcos: marcosDeEntrada };
  const antes = JSON.stringify(brás);
  congelar(brás);
  const { r, erro } = tenta(() => ganharVinculo(brás, 2));
  t(`cruzar um marco com o membro congelado não estoura${erro ? " — " + erro.message : ""}`, !erro);
  t("o membro de entrada ficou como estava (texto igual)", JSON.stringify(brás) === antes);
  t("a lista de marcos de entrada continua vazia", marcosDeEntrada.length === 0);
  t("o marco novo vem no membro devolvido", !!r && r.marcoNovo && r.marcoNovo.valor === 25 && r.membro.marcos.includes(25));
  t("e a lista devolvida é outra, não a de entrada", !!r && r.membro.marcos !== marcosDeEntrada);
  t("com os +2 PV máx do marco", !!r && r.membro.vidaMax === 17 && r.membro.vida === 11 && r.membro.vinculo === 26);
}

sec("2. A FICHA DE ANTES CONTINUA A VALER (o defeito, visto pelo jogador)");
{
  /* o mesmo membro de antes, duas vezes: com a mutação, a segunda chamada
     achava o marco já na lista e não dava nem o marco, nem os PV */
  const brás = { nome: "Brás", vida: 9, vidaMax: 15, vinculo: 24, marcos: [] };
  const a = ganharVinculo(brás, 2), b = ganharVinculo(brás, 2);
  t("duas chamadas sobre a mesma ficha dão o mesmo marco", !!a.marcoNovo && !!b.marcoNovo && a.marcoNovo.valor === b.marcoNovo.valor);
  t("e os mesmos PV", a.membro.vidaMax === b.membro.vidaMax && JSON.stringify(a.membro) === JSON.stringify(b.membro));
}

sec("3. O QUE SEMPRE FEZ, CONTINUA");
{
  const sem = ganharVinculo(congelar({ nome: "Ilse", vida: 5, vidaMax: 10 }), 0);
  t("sem vínculo, parte do inicial", sem.membro.vinculo === VINCULO_INICIAL && sem.marcoNovo === null);
  t("e sem lista de marcos, nasce uma vazia", Array.isArray(sem.membro.marcos) && sem.membro.marcos.length === 0);
  const tudo = ganharVinculo(congelar({ nome: "Ilse", vida: 5, vidaMax: 10, vinculo: 10, marcos: [] }), 999);
  t("o teto é o máximo", tudo.membro.vinculo === VINCULO_MAX);
  t("de uma vez cruza todos os marcos, e o último é o que se anuncia", tudo.membro.marcos.length === MARCOS_VINCULO.length && tudo.marcoNovo === MARCOS_VINCULO[MARCOS_VINCULO.length - 1]);
  t("cada marco dá +2 PV máx", tudo.membro.vidaMax === 10 + 2 * MARCOS_VINCULO.length);
  const ja = ganharVinculo(congelar({ nome: "Ilse", vida: 5, vidaMax: 10, vinculo: 30, marcos: [25] }), 5);
  t("marco já ganho não se ganha de novo", ja.marcoNovo === null && ja.membro.vidaMax === 10 && ja.membro.marcos.length === 1);
  const desce = ganharVinculo(congelar({ nome: "Ilse", vida: 5, vidaMax: 10, vinculo: 3, marcos: [] }), -10);
  t("o piso é zero", desce.membro.vinculo === 0);
}

sec("4. O NULO DEVOLVE NULO (Fase T, trilha B, 28/10)");
{
  /* um buraco no grupo (um membro nulo) chegava aqui pelo vínculo de
     "todos" e estourava em membro.vinculo: a vitória caía no meio. O
     nulo devolve nulo, sem marco, e quem chama guarda o buraco onde ele
     estava. */
  for (const nada of [null, undefined]) {
    const { r, erro } = tenta(() => ganharVinculo(nada, 2));
    t("ganharVinculo(" + nada + ") não estoura" + (erro ? " — " + erro.message : ""), !erro);
    t("e devolve o membro nulo, sem marco", !!r && r.membro === null && r.marcoNovo === null);
  }
  const grupo = [{ nome: "Brás", vida: 9, vidaMax: 15, vinculo: 24, marcos: [] }, null];
  const { r: depois, erro } = tenta(() => grupo.map((g) => ganharVinculo(g, 2).membro));
  t("um grupo com um buraco passa pelo vínculo de todos, e o buraco fica onde estava", !erro && depois.length === 2 && depois[0].vinculo === 26 && depois[1] === null);
}

console.log(`\nvínculos: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
