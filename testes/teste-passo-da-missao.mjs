/* teste-passo-da-missao.mjs (05/11, AR2 · o Diário) — o passo no mapa e o dia
   em que se cumpriu.

   A caixa do próximo passo do Diário diz ONDE e QUÃO LONGE («Ver no mapa ·
   Corda Velha · 1 zona»), e a etapa feita diz «cumprida no dia N». Três peças
   de missoes.js, e esta suíte prova as três:

     1. `distanciaDoPasso(etapa, { cidadeAtual, lugar, dados })` — «aqui»,
        «nesta cidade», «a N zonas», «noutra cidade», ou null quando não se
        sabe. O herói só sabe o que sabe: o mapa que entra já passou pela
        neblina, e o que lá não está não tem distância.
     2. `alvoNoMapa(etapa, dados)` — o id de nó que a `TelaDoMapa` aceita como
        `inicial` (o que `abrirMapaVivo(inicial)` lhe passa), ou null.
     3. `feitoEm` — campo NOVO e aditivo na etapa: `conferir` grava o dia do
        mundo na etapa que se cumpre; `garantirMissoes` guarda-o; o save
        antigo, sem ele, carrega byte a byte igual.

   FALHA ANTES: `distanciaDoPasso`, `alvoNoMapa` e `DISTANCIA_DO_PASSO` não
   existiam, e `conferir` fechava a etapa sem dia nenhum. */
import {
  distanciaDoPasso, alvoNoMapa, DISTANCIA_DO_PASSO,
  garantirMissoes, conferir, criarMissao, encerrarLegado,
} from "../src/missoes.js";
import * as MV from "../src/mapa-vivo.js";
import * as R from "../src/regiao.js";
import { moldePorId } from "../src/moldes.js";
import { sementeDe, generoDe } from "./medir-regiao.mjs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* Um retrato do mapa vivo com a forma de `dadosDoMapaVivo`: nós com id e
   nome, arestas de/para, e o nó do herói. Base — Encruzilhada — Corda Velha,
   e a Torre Caída pendurada na base; Monte Rasa sem estrada desenhada. */
const DADOS = {
  nos: [
    { id: "cidade|Vila Clara", nome: "Vila Clara", tipo: "base" },
    { id: "cidade|Encruzilhada", nome: "Encruzilhada", tipo: "povoado" },
    { id: "cidade|Corda Velha", nome: "Corda Velha", tipo: "povoado" },
    { id: "L1", nome: "A Torre Caída", tipo: "lugar" },
    { id: "cidade|Monte Rasa", nome: "Monte Rasa", tipo: "povoado" },
  ],
  arestas: [
    { id: "a1", de: "cidade|Vila Clara", para: "cidade|Encruzilhada", horas: 4 },
    { id: "a2", de: "cidade|Encruzilhada", para: "cidade|Corda Velha", horas: 5 },
    { id: "a3", de: "L1", para: "cidade|Vila Clara", horas: 2 },
  ],
  heroi: { onde: "base", noId: "cidade|Vila Clara" },
};
const EM_VILA = { cidadeAtual: "Vila Clara", lugar: { nome: "O Sino Calado", cidade: "Vila Clara" }, dados: DADOS };

sec("1. a tabela, lida de volta");
{
  t("quatro distâncias, pela ordem do perto ao longe", Object.keys(DISTANCIA_DO_PASSO).join(",") === "aqui,cidade,zonas,outra");
  t("cada uma diz o seu id", Object.entries(DISTANCIA_DO_PASSO).every(([k, v]) => v.id === k));
  t("o rótulo das zonas conta (1 zona, 3 zonas)", DISTANCIA_DO_PASSO.zonas.rotulo(1) === "a 1 zona" && DISTANCIA_DO_PASSO.zonas.rotulo(3) === "a 3 zonas");
  t("e os outros são as palavras da forma", DISTANCIA_DO_PASSO.aqui.rotulo() === "aqui" && DISTANCIA_DO_PASSO.cidade.rotulo() === "nesta cidade" && DISTANCIA_DO_PASSO.outra.rotulo() === "noutra cidade");
  t("a tabela é congelada", Object.isFrozen(DISTANCIA_DO_PASSO) && Object.isFrozen(DISTANCIA_DO_PASSO.zonas));
}

sec("2. a distância ao passo");
{
  const aqui = distanciaDoPasso({ tipo: "falar_com", alvo: "Petra", onde: "O Sino Calado, em Vila Clara" }, EM_VILA);
  t("o herói já lá está → «aqui»", aqui && aqui.tipo === "aqui" && aqui.rotulo === "aqui" && aqui.zonas === null, J(aqui));
  const cid = distanciaDoPasso({ tipo: "falar_com", alvo: "Edric", onde: "As Docas, em Vila Clara" }, EM_VILA);
  t("um sítio dentro dos muros de onde ele está → «nesta cidade»", cid && cid.tipo === "cidade" && cid.nome === "As Docas" && cid.cidade === "Vila Clara", J(cid));
  t("e o alvo no mapa é a cidade (o sítio não é nó)", cid && cid.noId === "cidade|Vila Clara");
  const z2 = distanciaDoPasso({ tipo: "falar_com", alvo: "Petra", onde: "A Taberna Torta, em Corda Velha" }, EM_VILA);
  t("o sítio de outra cidade do mapa → «a 2 zonas», com o nome do sítio", z2 && z2.tipo === "zonas" && z2.zonas === 2 && z2.rotulo === "a 2 zonas" && z2.nome === "A Taberna Torta" && z2.cidade === "Corda Velha", J(z2));
  const z1 = distanciaDoPasso({ tipo: "revelar", alvo: "A Torre Caída", onde: "A Torre Caída" }, EM_VILA);
  t("o lugar à beira da base → «a 1 zona», e o nó é o do lugar", z1 && z1.tipo === "zonas" && z1.zonas === 1 && z1.noId === "L1", J(z1));
  const ir = distanciaDoPasso({ tipo: "ir_a", alvo: "Encruzilhada" }, EM_VILA);
  t("ir_a: o alvo É a cidade → «a 1 zona»", ir && ir.tipo === "zonas" && ir.zonas === 1 && ir.cidade === "Encruzilhada", J(ir));
  const irAqui = distanciaDoPasso({ tipo: "ir_a", alvo: "Vila Clara" }, EM_VILA);
  t("ir_a à cidade onde já está → «aqui»", irAqui && irAqui.tipo === "aqui");
  const levar = distanciaDoPasso({ tipo: "levar_a", alvo: "Corda Velha", item: "a carta" }, EM_VILA);
  t("levar_a lê a cidade no alvo", levar && levar.tipo === "zonas" && levar.zonas === 2);
  const fundo = distanciaDoPasso({ tipo: "concluir_masmorra", alvo: "A Torre Caída" }, EM_VILA);
  t("concluir_masmorra lê o lugar no alvo", fundo && fundo.noId === "L1" && fundo.zonas === 1);
  const naBoca = distanciaDoPasso({ tipo: "concluir_masmorra", alvo: "A Torre Caída" }, { cidadeAtual: "Vila Clara", lugar: null, dados: { ...DADOS, heroi: { onde: "boca", noId: "L1" } } });
  t("à boca do lugar (o nó do herói é o do passo) → «aqui»", naBoca && naBoca.tipo === "aqui", J(naBoca));
  const semEstrada = distanciaDoPasso({ tipo: "falar_com", alvo: "Ubba", onde: "A Forja, em Monte Rasa" }, EM_VILA);
  t("a cidade está no mapa mas nenhuma estrada a liga → «noutra cidade»", semEstrada && semEstrada.tipo === "outra" && semEstrada.zonas === null && semEstrada.cidade === "Monte Rasa", J(semEstrada));
  const longe = distanciaDoPasso({ tipo: "falar_com", alvo: "Delfina", onde: "O Paço, em Alto do Sal" }, EM_VILA);
  t("a cidade que o mapa não mostra, mas a etapa nomeia → «noutra cidade»", longe && longe.tipo === "outra" && longe.noId === null, J(longe));
  const semMapa = distanciaDoPasso({ tipo: "falar_com", alvo: "Petra", onde: "A Taberna Torta, em Corda Velha" }, { cidadeAtual: "Vila Clara" });
  t("sem mapa, a etapa que diz a cidade ainda é «noutra cidade» (nunca um número)", semMapa && semMapa.tipo === "outra" && semMapa.zonas === null);
  const viagem = distanciaDoPasso({ tipo: "ir_a", alvo: "Corda Velha" }, { cidadeAtual: "", dados: { ...DADOS, heroi: { onde: "viagem", noId: null } } });
  t("na estrada (sem nó do herói, sem cidade) não há distância: null", viagem === null, J(viagem));
}

sec("3. o herói só sabe o que sabe — null quando não se sabe");
{
  t("etapa sem sítio nenhum → null", distanciaDoPasso({ tipo: "derrotar", alvo: "três lobos" }, EM_VILA) === null);
  t("o lugar que o mapa não mostra e a etapa não situa → null", distanciaDoPasso({ tipo: "revelar", alvo: "A Gruta Funda", onde: "A Gruta Funda" }, EM_VILA) === null);
  t("lixo: null, {}, número, etapa sem tipo", [null, undefined, {}, 7, "x"].every((e) => distanciaDoPasso(e, EM_VILA) === null));
  t("estado lixo não estoura (null, {}, número)", [null, {}, 3].every((s) => { try { distanciaDoPasso({ tipo: "ir_a", alvo: "Encruzilhada" }, s); return true; } catch { return false; } }));
  t("dados podres não estouram (nos e arestas que não são listas)", (() => { try { distanciaDoPasso({ tipo: "ir_a", alvo: "Encruzilhada" }, { cidadeAtual: "Vila Clara", dados: { nos: 3, arestas: "x", heroi: null } }); return true; } catch { return false; } })());
  const antes = J(DADOS);
  distanciaDoPasso({ tipo: "falar_com", alvo: "Petra", onde: "A Taberna Torta, em Corda Velha" }, EM_VILA);
  t("e não muta o mapa que recebe", J(DADOS) === antes);
}

sec("4. o alvo do mapa vivo");
{
  t("o lugar do passo, quando é nó → o id dele", alvoNoMapa({ tipo: "revelar", alvo: "A Torre Caída", onde: "A Torre Caída" }, DADOS) === "L1");
  t("o sítio dentro de uma cidade → o nó da cidade", alvoNoMapa({ tipo: "falar_com", alvo: "Petra", onde: "A Taberna Torta, em Corda Velha" }, DADOS) === "cidade|Corda Velha");
  t("o artigo não separa (Torre Caída = A Torre Caída)", alvoNoMapa({ tipo: "concluir_masmorra", alvo: "Torre Caída" }, DADOS) === "L1");
  t("sem nó à vista → null (o mapa abre no herói)", alvoNoMapa({ tipo: "falar_com", alvo: "Delfina", onde: "O Paço, em Alto do Sal" }, DADOS) === null);
  t("lixo → null", [null, {}, 3].every((e) => alvoNoMapa(e, DADOS) === null) && alvoNoMapa({ tipo: "ir_a", alvo: "Encruzilhada" }, null) === null);
}

sec("5. sobre o mapa vivo de verdade (dadosDoMapaVivo em mundos semeados)");
{
  const molde = moldePorId("sobremundo");
  let mundos = 0, nos = 0, todosAceitos = true, todosMedidos = true, base0 = true, ocultosCalam = true;
  for (let i = 0; i < 8; i++) {
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente: sementeDe(i), molde, genero: generoDe(i), estrutura: "classica", modo: "historia" }));
    const base = mapa.cidades[0].nome;
    const d = MV.dadosDoMapaVivo(mapa, { cidadeAtual: base, etapa: 0, dia: 1, minuto: 480, semente: sementeDe(i) });
    if (!d) continue;
    mundos++;
    for (const n of d.nos) {
      nos++;
      const e = n.tipo === "lugar" ? { tipo: "concluir_masmorra", alvo: n.nome } : { tipo: "ir_a", alvo: n.nome };
      const id = alvoNoMapa(e, d);
      /* o contrato com a TelaDoMapa: o `inicial` só vale se for um id de dados.nos */
      if (!id || !d.nos.some((x) => x.id === id)) todosAceitos = false;
      const dist = distanciaDoPasso(e, { cidadeAtual: base, dados: d });
      if (!dist) { todosMedidos = false; continue; }
      if (n.id === d.heroi.noId && dist.tipo !== "aqui") base0 = false;
      if (dist.tipo === "zonas" && !(Number.isInteger(dist.zonas) && dist.zonas >= 1)) todosMedidos = false;
    }
    /* o que a neblina esconde não tem alvo: um lugar da região que não chegou a dados.nos */
    for (const l of mapa.regiao.lugares || []) {
      if (d.nos.some((x) => x.id === String(l.id))) continue;
      if (d.nos.some((x) => x.nome === l.nome)) continue;
      if (alvoNoMapa({ tipo: "concluir_masmorra", alvo: l.nome }, d) !== null) ocultosCalam = false;
    }
  }
  t(`houve mundos para medir (${mundos}, ${nos} nós)`, mundos >= 4 && nos > 0);
  t("todo nó à vista dá um alvo que a TelaDoMapa aceita (um id de dados.nos)", todosAceitos);
  t("e toda etapa que aponta um nó à vista tem distância, em zonas inteiras ≥ 1", todosMedidos);
  t("a base, de onde o herói não saiu, é «aqui»", base0);
  t("o lugar escondido pela neblina não tem alvo (o herói só sabe o que sabe)", ocultosCalam);
}

sec("6. feitoEm — o dia em que a etapa se cumpriu");
{
  const nova = () => criarMissao({ titulo: "O recado", tipo: "favor", status: "ativa", dia: 3, etapas: [
    { tipo: "ir_a", alvo: "Encruzilhada" },
    { tipo: "ir_a", alvo: "Corda Velha" },
  ] });
  const m0 = nova();
  const r = conferir([m0], { cidadeAtual: "Encruzilhada", dia: 7 });
  const e0 = r.missoes[0].etapas[0];
  t("conferir grava o dia do mundo na etapa que se cumpriu", e0.feito === true && e0.feitoEm === 7, J(e0));
  t("e a etapa que não se cumpriu fica sem o campo", !("feitoEm" in r.missoes[0].etapas[1]));
  t("garantirMissoes guarda o feitoEm (o save regravado não o perde)", garantirMissoes(r.missoes)[0].etapas[0].feitoEm === 7);
  /* a pulada: chegou à Corda Velha sem passar pela Encruzilhada — as duas fecham no mesmo passo */
  const rp = conferir([nova()], { cidadeAtual: "Corda Velha", dia: 9 });
  const [p0, p1] = rp.missoes[0].etapas;
  t("a pulada cumpriu-se no mesmo passo: o mesmo dia", p0.pulada === true && p0.feitoEm === 9 && p1.feitoEm === 9, J(rp.missoes[0].etapas));
  const semDia = conferir([nova()], { cidadeAtual: "Encruzilhada" });
  t("mundo sem dia: a etapa fecha como sempre, sem o campo", semDia.missoes[0].etapas[0].feito === true && !("feitoEm" in semDia.missoes[0].etapas[0]));
  t("dia lixo (texto, NaN, null) não vira dia", ["x", NaN, null].every((d) => !("feitoEm" in conferir([nova()], { cidadeAtual: "Encruzilhada", dia: d }).missoes[0].etapas[0])));
  t("o dia é inteiro e não negativo", conferir([nova()], { cidadeAtual: "Encruzilhada", dia: 4.8 }).missoes[0].etapas[0].feitoEm === 4
    && conferir([nova()], { cidadeAtual: "Encruzilhada", dia: -2 }).missoes[0].etapas[0].feitoEm === 0);
  t("conferir não muta a lista que recebe", (() => { const l = [nova()]; const a = J(l); conferir(l, { cidadeAtual: "Encruzilhada", dia: 7 }); return J(l) === a; })());
}

sec("7. o save antigo carrega igual, e o campo novo não muda nenhum outro");
{
  /* uma missão como a versão de antes a gravava: etapas feitas SEM feitoEm */
  const antiga = garantirMissoes([criarMissao({ titulo: "O gado de Jessa", tipo: "favor", status: "ativa", dia: 2, etapas: [
    { tipo: "falar_com", alvo: "Jessa", onde: "A Quinta, em Vila Clara", feito: true },
    { tipo: "derrotar", alvo: "lobos", quantos: 3 },
  ] })]);
  const regravada = garantirMissoes(JSON.parse(J(antiga)));
  t("o save antigo, sem o campo, carrega byte a byte igual", J(regravada) === J(antiga));
  t("e a etapa feita antiga continua sem feitoEm (a nota diz só «cumprida»)", !("feitoEm" in regravada[0].etapas[0]) && regravada[0].etapas[0].feito === true);
  /* o campo novo, posto e tirado, não mexe em mais nada */
  const comCampo = JSON.parse(J(antiga));
  comCampo[0].etapas[0].feitoEm = 5;
  const g = garantirMissoes(comCampo);
  const semOCampo = JSON.parse(J(g));
  delete semOCampo[0].etapas[0].feitoEm;
  t("com o campo: o resto da missão é idêntico ao antigo", J(semOCampo) === J(antiga) && g[0].etapas[0].feitoEm === 5);
  const naoFeita = JSON.parse(J(antiga));
  naoFeita[0].etapas[1].feitoEm = 5;
  t("feitoEm numa etapa por fazer não sobrevive (não há dia de uma coisa por cumprir)", !("feitoEm" in garantirMissoes(naoFeita)[0].etapas[1]));
  t("feitoEm lixo cai fora (texto, objeto)", ["ontem", {}].every((v) => { const x = JSON.parse(J(antiga)); x[0].etapas[0].feitoEm = v; return !("feitoEm" in garantirMissoes(x)[0].etapas[0]); }));
}

sec("8. encerrarLegado: com dia, as etapas que fecham levam-no; sem dia, como sempre");
{
  const leg = garantirMissoes([criarMissao({ titulo: "A casa do pai", tipo: "favor", status: "ativa", dia: 1, legado: true, etapas: [
    { tipo: "falar_com", alvo: "Tomé", feito: true },
    { tipo: "falar_com", alvo: "Irmã" },
  ] })]);
  const id = leg[0].id;
  const sem = encerrarLegado(leg, id, "concluida");
  t("sem dia: as etapas fecham sem o campo (a chamada de sempre)", sem.ok && sem.missoes[0].etapas.every((e) => e.feito && !("feitoEm" in e)));
  const com = encerrarLegado(leg, id, "concluida", { dia: 12 });
  t("com dia: a que fecha aqui leva-o", com.ok && com.missoes[0].etapas[1].feitoEm === 12);
  t("e a que já estava feita não é redatada", !("feitoEm" in com.missoes[0].etapas[0]));
  t("opções lixo não estouram", encerrarLegado(leg, id, "concluida", null).ok && encerrarLegado(leg, id, "concluida", 3).ok);
}

console.log(`\npasso-da-missao: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
