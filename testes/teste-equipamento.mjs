/* teste-equipamento.mjs (v9.44) — o que o painel prometia e o dado ignorava.

   Três regras que existiam só como frase na tela de equipamento:
   a Defesa sem Armadura do monge (que nunca existiu para ser perdida), a
   sintonia valendo na defesa como já valia nos atributos, e a arma de
   alcance — mais o passo de cada criatura, que dormia em movimento.js.  */
import { defesaDe, resolverAtaque } from "../src/combate.js";
import { avaliarEquipar, conjuracaoBloqueada, fichaDoItem, penalidadesAtivas } from "../src/itens.js";
import { deslocamentoDeCriatura } from "../src/movimento.js";
import { montarGrade, moverInimigos, distanciaM } from "../src/grid.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const attr = (o = {}) => ({ forca: 0, destreza: 2, vigor: 1, intelecto: 0, presenca: 0, percepcao: 3, ...o });

sec("1. Defesa sem Armadura — o que o monge tinha a perder");
{
  const monge = { nome: "Ling", classe: "Monge", atributos: attr(), equipados: {} };
  t("monge sem armadura soma a Percepção", defesaDe(monge) === 10 + 2 + 3);
  const comPano = { ...monge, equipados: { armadura: { nome: "Hábito Rúnico", tipo: "armadura" } } };
  t("veste rúnica é pano: continua valendo", defesaDe(comPano) === 10 + 2 + 3);
  const comCota = { ...monge, equipados: { armadura: { nome: "Cota de Malha", tipo: "armadura" } } };
  t("cota de malha desliga a defesa do corpo livre", defesaDe(comCota) === 10 + 2);
  const guerreiro = { nome: "Bors", classe: "Guerreiro", atributos: attr(), equipados: {} };
  t("guerreiro não ganha isso de graça", defesaDe(guerreiro) === 10 + 2);
  const pen = penalidadesAtivas(comCota, {});
  t("e o painel avisa que o monge perdeu algo", pen.some((p) => p.tipo === "sem_defesa"));
}

sec("2. a sintonia vale na defesa, como já valia nos atributos");
{
  const armaduraViva = { nome: "Couraça do Ocaso", tipo: "armadura", raridade: "epico", poder: "absorve a sombra", atributos: { defesa: 4 } };
  const base = { nome: "Ivo", classe: "Guerreiro", atributos: attr(), equipados: { armadura: armaduraViva }, equipamento: [armaduraViva] };
  const dormente = { ...base, sintonizados: [] };
  const acesa = { ...base, sintonizados: ["Couraça do Ocaso"] };
  t("item de poder sintonizado defende", defesaDe(acesa) === 10 + 2 + 4);
  t("dormente NÃO defende", defesaDe(dormente) === 10 + 2);
  const aco = { nome: "Peitoral de Aço", tipo: "armadura", raridade: "comum", atributos: { defesa: 2 } };
  const comum = { ...base, equipados: { armadura: aco }, equipamento: [aco], sintonizados: [] };
  t("aço comum não pede sintonia e defende sempre", defesaDe(comum) === 10 + 2 + 2);
}

sec("3. a armadura que trava a magia");
{
  const magoDePlacas = { nome: "Orin", classe: "Mago", atributos: attr(), equipados: { armadura: { nome: "Armadura de Placas", tipo: "armadura" } } };
  t("mago de placas não conjura", conjuracaoBloqueada(magoDePlacas, {}));
  const magoDeManto = { ...magoDePlacas, equipados: { armadura: { nome: "Manto Encantado", tipo: "armadura" } } };
  t("de manto, conjura", !conjuracaoBloqueada(magoDeManto, {}));
  const guerreiroDePlacas = { nome: "Bors", classe: "Guerreiro", atributos: attr(), equipados: { armadura: { nome: "Armadura de Placas", tipo: "armadura" } } };
  t("guerreiro de placas não é conjurador: nada trava", !conjuracaoBloqueada(guerreiroDePlacas, {}));
  const av = avaliarEquipar(magoDePlacas, { nome: "Armadura de Placas", tipo: "armadura" }, {});
  t("e a penalidade de desvantagem está lá para o dado ler", av.penalidades.some((p) => p.tipo === "desvantagem"));
}

sec("4. a desvantagem chega ao d20");
{
  const alvo = { nome: "Alvo", ameaca: "comum", vida: 30 };
  let comDesv = 0, semDesv = 0;
  for (let i = 0; i < 400; i++) {
    if (resolverAtaque({ atacante: "eu", alvo, ehAtacanteInimigo: false, bonusAtaque: 3, danoBase: 5, desvantagem: true }).dano > 0) comDesv++;
    if (resolverAtaque({ atacante: "eu", alvo, ehAtacanteInimigo: false, bonusAtaque: 3, danoBase: 5 }).dano > 0) semDesv++;
  }
  t("com desvantagem acerta bem menos", comDesv < semDesv);
  t("e ainda acerta às vezes (não é um bloqueio)", comDesv > 0);
}

sec("5. arma de alcance");
{
  t("a lança tem alcance no catálogo", fichaDoItem({ nome: "Lança", tipo: "arma" }).props.includes("alcance"));
  t("a alabarda também", fichaDoItem({ nome: "Alabarda", tipo: "arma" }).props.includes("alcance"));
  t("a espada longa não", !fichaDoItem({ nome: "Espada Longa", tipo: "arma" }).props.includes("alcance"));
  t("o montante é de duas mãos", fichaDoItem({ nome: "Montante", tipo: "arma" }).props.includes("duas mãos"));
  t("a adaga não é", !fichaDoItem({ nome: "Adaga", tipo: "arma" }).props.includes("duas mãos"));
}

sec("6. cada bicho no seu passo");
{
  t("o dragão voa 18 m", deslocamentoDeCriatura({ nome: "Dragão Vermelho" }).metros === 18);
  t("e voando", deslocamentoDeCriatura({ nome: "Dragão Vermelho" }).voando === true);
  t("o zumbi arrasta 6 m", deslocamentoDeCriatura({ nome: "Zumbi" }).metros === 6);
  t("o lobo corre 12 m", deslocamentoDeCriatura({ nome: "Lobo Cinzento" }).metros === 12);
  t("o resto anda 9 m", deslocamentoDeCriatura({ nome: "Bandido" }).metros === 9);

  /* no tabuleiro: zumbi e lobo saem do mesmo lugar, atrás do mesmo herói */
  const grade = montarGrade({ planta: "campo", largura: 20, altura: 12 });
  const heroi = { nome: "eu", x: 18, y: 6, vida: 20 };
  const partida = { x: 1, y: 6, vida: 10, ameaca: "comum" };
  const zumbi = { ...partida, nome: "Zumbi" };
  const lobo = { ...partida, nome: "Lobo Cinzento" };
  const mv = moverInimigos(grade, [zumbi, lobo], heroi, [heroi]);
  const dZ = distanciaM(mv.inimigos.find((e) => e.nome === "Zumbi"), heroi);
  const dL = distanciaM(mv.inimigos.find((e) => e.nome === "Lobo Cinzento"), heroi);
  t("o lobo chega mais perto que o zumbi na mesma rodada", dL < dZ);
  t("os dois se moveram", mv.movimentos.length === 2);
  t("e ninguém andou mais do que pode", dZ >= distanciaM(partida, heroi) - 6.1);
}

console.log(`\nequipamento v9.44: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
