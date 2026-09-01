/* teste-chegada.mjs (v9.43)
   1) o cão de guarda da chegada — subir de andar sem o Mestre registrar
   2) uma pessoa, um trabalho — a oferta do sistema e a do Mestre
   3) ação bônus só de quem a classe concede                            */
import {
  gerarGeografia, vizinhosDeUmPasso, detectarChegada, notaDaChegada,
  saidasDeUmPassoPrompt, DIAS_DE_UM_PASSO,
} from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { aceitarProposta, garantirMissoes } from "../src/missoes.js";
import { acoesBonusDe, ataquesPorTurno } from "../src/combate.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* ============ 1. A CHEGADA ============ */
sec("1. a Torre: subir um andar é UM passo");
const torre = gerarGeografia("teste|torre|1", moldePorId("torre"));
const andar1 = torre.cidades.find((c) => c.z === 1).nome;
const andar2 = torre.cidades.find((c) => c.z === 2).nome;
const andar3 = torre.cidades.find((c) => c.z === 3).nome;
t(`os andares se chamam "${andar1}" / "${andar2}"`, /^Andar 1\b/.test(andar1) && /^Andar 2\b/.test(andar2));

const viz = vizinhosDeUmPasso(torre, andar1);
t("o andar 1 tem vizinho de um passo", viz.length >= 1);
t("e o vizinho é o andar 2", viz.some((v) => v.nome === andar2));
t("o andar 3 NÃO está a um passo do 1", !viz.some((v) => v.nome === andar3));
t("a travessia custa 6 horas", viz[0].dias === 0.25);

sec("2. a narração que o sistema tem de ratificar");
const real = "O Arco Pálido despeja você no Andar 2 de joelhos, tossindo um ar seco e salgado, as mãos cravadas numa laje fria como lousa.";
{
  const ch = detectarChegada(real, { mapa: torre, cidade: andar1 });
  t("a frase do jogo é reconhecida", !!ch);
  t("e aponta para o andar certo", ch && ch.nome === andar2);
  t("com o custo da travessia junto", ch && ch.dias === 0.25);
  t("o trecho volta para o registro", ch && /despeja voce no andar 2/.test(ch.trecho));
}
{
  const outras = [
    "Você chega ao Andar 2 com a respiração curta.",
    "O portal cospe você no Andar 2.",
    "Você atravessa e pisa no Andar 2 pela primeira vez.",
    "Um empurrão, e você emerge no Andar 2.",
  ];
  outras.forEach((f, i) => t(`morde também: "${f.slice(0, 34)}…"`, !!detectarChegada(f, { mapa: torre, cidade: andar1 })));
}

sec("3. e o que ele NÃO pode morder");
const naoMorde = [
  ["menção pura", "Dizem que o Andar 2 é pior que este."],
  ["plano, não ato", "Você pretende subir ao Andar 2 assim que puder."],
  ["negado", "Você não chega ao Andar 2 hoje."],
  ["ainda não", "Você ainda não pisou no Andar 2."],
  ["sem preposição", "O Andar 2 chega a ser pior."],
  ["andar distante", "Você chega ao " + andar3 + " exausto."],
  ["boato", "Contam que alguém chegou ao Andar 2 e não voltou."],
];
for (const [nome, frase] of naoMorde) t(`não morde: ${nome}`, !detectarChegada(frase, { mapa: torre, cidade: andar1 }));
t("narrativa vazia não move ninguém", !detectarChegada("", { mapa: torre, cidade: andar1 }));
t("sem cidade atual não move ninguém", !detectarChegada(real, { mapa: torre, cidade: "" }));

sec("4. onde viajar custa dias, o cão dorme");
const mundo = gerarGeografia("teste|sobremundo|1", moldePorId("sobremundo"));
{
  const inicial = mundo.cidades[0].nome;
  const rota = (mundo.rotas || []).find((r) => r.de === inicial || r.para === inicial);
  const outra = rota ? (rota.de === inicial ? rota.para : rota.de) : mundo.cidades[1].nome;
  t("no continente nenhuma rota é de um passo", vizinhosDeUmPasso(mundo, inicial).length === 0);
  t("e a chegada narrada NÃO teleporta o herói", !detectarChegada(`Você chega a ${outra} ao anoitecer.`, { mapa: mundo, cidade: inicial }));
  t("nem existe linha de saídas para o Mestre", saidasDeUmPassoPrompt(mundo, inicial) === "");
}

sec("5. os textos");
{
  const ch = detectarChegada(real, { mapa: torre, cidade: andar1 });
  const nota = notaDaChegada(ch, andar1);
  t("a nota diz que o sistema já moveu", /REGISTRADA PELO SISTEMA/.test(nota));
  t("e nomeia de onde e para onde", nota.includes(andar1) && nota.includes(andar2));
  t("e cobra o registro da próxima vez", /cidade_atual/.test(nota));
  t("nota de nada é vazia", notaDaChegada(null) === "");
  const saidas = saidasDeUmPassoPrompt(torre, andar1);
  t("o Mestre recebe a saída daqui", saidas.includes(andar2));
  t("com as horas da travessia", /6 horas/.test(saidas));
  t("e a ordem de mandar cidade_atual", /cidade_atual/.test(saidas));
}

/* ============ 2. UMA PESSOA, UM TRABALHO ============ */
sec("6. Osric não oferece duas vezes");
{
  const doSistema = {
    titulo: "A caçada de Osric Ventoforte", tipo: "contrato", dador: "Osric Ventoforte",
    descricao: "Atirador ronda os arredores. Osric Ventoforte quer o bicho morto.",
    paga: 35, etapas: [{ tipo: "derrotar", alvo: "Atirador", quantos: 1 }],
  };
  const doMestre = {
    titulo: "Caçar o atirador do Mercado da Aurora", tipo: "contrato", dador: "Osric Ventoforte",
    descricao: "Osric contrata o herói para caçar o atirador que ronda o Mercado da Aurora.",
    paga: 35, etapas: [{ tipo: "achar", alvo: "atirador do Mercado da Aurora" }, { tipo: "derrotar", alvo: "atirador", quantos: 1 }],
  };
  const um = aceitarProposta([], doSistema, { nivel: 1, dia: 3 });
  t("a primeira entra", um.ok);
  const dois = aceitarProposta(um.missoes, doMestre, { nivel: 1, dia: 3 });
  t("a segunda do MESMO dador e MESMO alvo é recusada", !dois.ok);
  t("e o motivo diz por quê", /esse mesmo trabalho/.test(dois.motivo || ""));
  t("o diário fica com uma só", garantirMissoes(um.missoes).length === 1);

  /* e a ordem inversa também: quem chegar primeiro fica */
  const a = aceitarProposta([], doMestre, { nivel: 1, dia: 3 });
  const b = aceitarProposta(a.missoes, doSistema, { nivel: 1, dia: 3 });
  t("na ordem inversa, idem", a.ok && !b.ok);

  /* o mesmo dador com OUTRO alvo tem, de fato, outro problema */
  const outroServico = aceitarProposta(um.missoes, {
    titulo: "Ratos na dispensa", tipo: "contrato", dador: "Osric Ventoforte",
    descricao: "Osric quer a dispensa limpa antes que estraguem a salmoura.",
    paga: 12, etapas: [{ tipo: "derrotar", alvo: "rato", quantos: 6 }],
  }, { nivel: 1, dia: 3 });
  t("mesmo dador, outro alvo: passa", outroServico.ok);

  /* outra pessoa continua podendo oferecer */
  const outra = aceitarProposta(um.missoes, {
    titulo: "Levar o selo a Petra", tipo: "contrato", dador: "Petra da Foz",
    descricao: "Petra quer o selo entregue.", paga: 20,
    etapas: [{ tipo: "achar", alvo: "selo de chumbo" }],
  }, { nivel: 1, dia: 3 });
  t("outra pessoa oferece normalmente", outra.ok);

  /* concluída não bloqueia para sempre: um velho conhecido volta com serviço novo */
  const feitas = garantirMissoes(um.missoes).map((q) => ({ ...q, status: "concluida" }));
  const denovo = aceitarProposta(feitas, {
    titulo: "O recado para o Alto", tipo: "favor", dador: "Osric Ventoforte",
    descricao: "Osric pede que um recado suba.", paga: 12,
    etapas: [{ tipo: "achar", alvo: "carta lacrada" }],
  }, { nivel: 1, dia: 40 });
  t("depois de concluída, o mesmo dador pode voltar", denovo.ok);
}

/* ============ 3. AÇÃO BÔNUS ============ */
sec("7. a ação bônus tem dono");
t("Mago nível 1 não tem ação bônus", acoesBonusDe("Mago", 1).length === 0);
t("Mago nível 20 continua sem", acoesBonusDe("Mago", 20).length === 0);
t("Guerreiro nível 1 ainda não tem (Surto é nível 2)", acoesBonusDe("Guerreiro", 1).length === 0);
t("Guerreiro nível 2 tem", acoesBonusDe("Guerreiro", 2).length === 1);
t("Monge tem desde o nível 1", acoesBonusDe("Monge", 1).length === 1);
t("Ladino só a partir do 2", acoesBonusDe("Ladino", 1).length === 0 && acoesBonusDe("Ladino", 2).length === 1);
t("classe desconhecida não ganha de graça", acoesBonusDe("Andarilho", 5).length === 0);
t("e o Mago segue com UM ataque por turno", ataquesPorTurno("Mago", 1) === 1 && ataquesPorTurno("Mago", 20) === 1);

console.log(`\nchegada v9.43: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
