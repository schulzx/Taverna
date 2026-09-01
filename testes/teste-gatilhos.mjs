/* teste-gatilhos.mjs (v9.45) — o "até" que faltava, o dado da arma e o
   trabalho que não merece cena.                                          */
import {
  gatilhosDe, quebraCom, romperPorGatilho, estaInvisivel,
  seguraEmPe, gastarSegura, devolverSegura,
} from "../src/gatilhos.js";
import { danoDaArma, atributoDaArma, modDoGolpe, fichaDeCombateTexto } from "../src/itens.js";
import { danoDe } from "../src/combate.js";
import { criarOficina, anotar, bilheteDaOficina } from "../src/oficina.js";
import { aflicaoDe } from "../src/aflicoes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const INVIS = { nome: "Invisibilidade", turnos: 10, descricao: "Fica invisível até atacar ou conjurar." };
const INVIS_MAIOR = { nome: "Invisibilidade Maior", turnos: 10, descricao: "Some e continua sumido mesmo atacando." };

sec("1. o contrato que a descrição escreve");
t("invisibilidade quebra ao atacar", quebraCom(INVIS, "atacar"));
t("e ao conjurar", quebraCom(INVIS, "conjurar"));
t("mas não por apanhar", !quebraCom(INVIS, "dano"));
t("a Maior NÃO quebra ao atacar", !quebraCom(INVIS_MAIOR, "atacar"));
t("escudo que cai no primeiro golpe sofrido", quebraCom({ nome: "Escudo Arcano", descricao: "Absorve o primeiro golpe que sofrer." }, "dano"));
t("postura que acaba ao se mover", quebraCom({ nome: "Postura da Montanha", descricao: "Enquanto não se mover, defesa dobrada." }, "mover"));
t("buff comum não quebra com nada", gatilhosDe({ nome: "Mente Afiada", descricao: "+2 em Intelecto por 3 turnos." }).length === 0);
t("quebraCom explícito manda sobre o texto", gatilhosDe({ nome: "Qualquer", descricao: "texto sem promessa", quebraCom: ["dano"] }).join() === "dano");
t("efeito sem texto não inventa gatilho", gatilhosDe({}).length === 0);
t("nulo não derruba", gatilhosDe(null).length === 0);

sec("2. atacou, apareceu");
{
  const heroi = { nome: "Vargh", efeitos: [INVIS, { nome: "Mente Afiada", bonus: 2, turnos: 3 }], condicoes: [] };
  t("está invisível", estaInvisivel(heroi));
  const r = romperPorGatilho(heroi, "atacar");
  t("atacar derruba a invisibilidade", r.rompidos.includes("Invisibilidade"));
  t("e não derruba o resto", r.pers.efeitos.some((e) => e.nome === "Mente Afiada"));
  t("depois disso ele é visto", !estaInvisivel(r.pers));
  t("o jogador lê o porquê", r.linhas.some((l) => /atacou/.test(l)));
  t("e o Mestre é avisado de que caiu", /ENCERRADO PELO SISTEMA/.test(r.nota));
  const r2 = romperPorGatilho(r.pers, "atacar");
  t("atacar de novo não derruba nada", r2.rompidos.length === 0 && r2.pers === r.pers);

  const maior = { nome: "Vargh", efeitos: [INVIS_MAIOR], condicoes: [] };
  t("a Invisibilidade Maior sobrevive ao ataque", romperPorGatilho(maior, "atacar").rompidos.length === 0);
  t("e mantém o herói sumido", estaInvisivel(romperPorGatilho(maior, "atacar").pers));

  /* a condição "furtivo" que a habilidade de sombra aplica também some */
  const furtivo = { nome: "Ladra", efeitos: [], condicoes: [{ id: "furtivo", nome: "Furtivo", descricao: "invisível nas sombras" }] };
  t("condição de invisibilidade também cai", romperPorGatilho(furtivo, "atacar").rompidos.length === 1);
}

sec("3. o que segura em pé");
{
  const guerreiro = { nome: "Bors", habilidades: [{ nome: "Indomável", descricao: "Ao cair a 0 PV, continua de pé por 1 turno." }] };
  t("Indomável é reconhecido", seguraEmPe(guerreiro) === "Indomável");
  const gasto = gastarSegura(guerreiro);
  t("gasta uma vez por luta", seguraEmPe(gasto) === null);
  t("e volta na luta seguinte", seguraEmPe(devolverSegura(gasto)) === "Indomável");
  const monge = { nome: "Ling", habilidades: [{ nome: "Corpo Imortal", descricao: "Não pode cair abaixo de 1 PV por 2 turnos." }] };
  t("Corpo Imortal também", seguraEmPe(monge) === "Corpo Imortal");
  t("quem não tem, não segura", seguraEmPe({ nome: "X", habilidades: [{ nome: "Golpe Poderoso", descricao: "Dano dobrado." }] }) === null);
}

sec("4. as habilidades que viraram condição");
t("Prisão Arcana prende", (aflicaoDe("Prisão Arcana Prende um inimigo por 2 turnos.") || {}).cond === "agarrado");
t("Armadilha prende", (aflicaoDe("Armadilha Prende o primeiro inimigo que passar.") || {}).cond === "agarrado");
t("Fascínio tira da luta", (aflicaoDe("Fascínio Um inimigo para de lutar por 2 turnos.") || {}).cond === "enfeiticado");
t("Toque da Quietude cala", (aflicaoDe("Toque da Quietude Impede o alvo de usar habilidades por 2 turnos.") || {}).cond === "atordoado");
t("e o que já funcionava continua", (aflicaoDe("Bola de Fogo Explosão de chamas") || {}).cond === "queimando");

sec("5. o dado da arma");
const arma = (nome) => ({ nome, tipo: "arma" });
t("adaga é 1d4", danoDaArma(arma("Adaga")).texto === "1d4");
t("espada longa é 1d8", danoDaArma(arma("Espada Longa")).texto === "1d8");
t("montante é 2d6", danoDaArma(arma("Montante")).texto === "2d6");
t("arco longo é 1d10", danoDaArma(arma("Arco Longo")).texto === "1d10");
t("desarmado é 1d2", danoDaArma(null).texto === "1d2");
t("cajado é foco, 1d6", danoDaArma(arma("Cajado de Carvalho")).texto === "1d6");

sec("6. sutil é uma propriedade de novo");
t("adaga é sutil", atributoDaArma(arma("Adaga")) === "melhor");
t("rapieira é sutil", atributoDaArma(arma("Rapieira")) === "melhor");
t("montante é força", atributoDaArma(arma("Montante")) === "forca");
t("espada longa é força", atributoDaArma(arma("Espada Longa")) === "forca");
t("arco é destreza", atributoDaArma(arma("Arco Curto")) === "destreza");
t("foco arcano vale pelo melhor", atributoDaArma(arma("Orbe de Batalha")) === "melhor");
{
  const agil = { atributos: { forca: 0, destreza: 4 } };
  t("o ágil aproveita a rapieira", modDoGolpe(agil, arma("Rapieira")) === 4);
  t("e não aproveita o montante", modDoGolpe(agil, arma("Montante")) === 0);
  const forte = { atributos: { forca: 4, destreza: 0 } };
  t("o forte aproveita o montante", modDoGolpe(forte, arma("Montante")) === 4);
  t("e a adaga também (o melhor dos dois)", modDoGolpe(forte, arma("Adaga")) === 4);
  t("a linha da bolsa explica a arma", /1d8 · Força ou Destreza/.test(fichaDeCombateTexto(arma("Rapieira"))));
  t("e não aparece para armadura", fichaDeCombateTexto({ nome: "Cota de Malha", tipo: "armadura" }) === "");
}

sec("7. o montante bate mais que a adaga (500 rolagens)");
{
  const com = (nome) => ({ atributos: { forca: 3, destreza: 3 }, equipados: { arma: arma(nome) } });
  const media = (nome) => { let s = 0; for (let i = 0; i < 500; i++) s += danoDe(com(nome), false); return s / 500; };
  const mAdaga = media("Adaga"), mLonga = media("Espada Longa"), mMontante = media("Montante");
  t(`adaga ${mAdaga.toFixed(1)} < longa ${mLonga.toFixed(1)}`, mAdaga < mLonga);
  t(`longa ${mLonga.toFixed(1)} < montante ${mMontante.toFixed(1)}`, mLonga < mMontante);
  t("e nenhuma virou dano ridículo", mAdaga > 5 && mMontante < 20);
}

sec("8. o trabalho que não merece cena");
{
  t("oficina vazia não gera bilhete", bilheteDaOficina(criarOficina()) === "");
  let of = criarOficina();
  of = anotar(of, { tipo: "bancada", nome: "Poção de Cura Pequena", ok: true, minutos: 60 });
  of = anotar(of, { tipo: "bancada", nome: "Poção de Cura Pequena", ok: true, minutos: 60 });
  of = anotar(of, { tipo: "bancada", nome: "Elixir de Vigor", ok: false, minutos: 60 });
  const b = bilheteDaOficina(of);
  t("três trabalhos viram UM bilhete", (b.match(/TRABALHO DE BASTIDOR/g) || []).length === 1);
  t("e as iguais são contadas juntas", /2× Poção de Cura Pequena/.test(b));
  t("a que falhou aparece como perda", /Elixir de Vigor/.test(b) && /perdi/.test(b));
  t("o tempo total entra", /3 horas/.test(b));
  t("e diz ao Mestre que NÃO é cena", /N[ÃA]O É CENA/.test(b));
  t("anotar sem nome não suja a fila", anotar(criarOficina(), { nome: "" }).length === 0);
}

console.log(`\ngatilhos v9.45: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
