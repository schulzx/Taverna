/* teste-salvaguardas.mjs (v9.60) — a rolagem que ninguém pede.
   A v9.59 escreveu que ela existe; esta suíte é o código atrás.       */
import {
  SALVAGUARDAS, salvaguardaPorId, nomeDaSalva, salvasDaClasse, ehProficienteNaSalva,
  bonusDeSalvaguarda, FONTES_DE_SALVAGUARDA, fonteDaSalvaguarda, salvaDoGolpe, ehSalvaMental,
  dcDaFonte, rolarSalvaguarda, linhaDaSalvaguarda, envelopeDaSalvaguarda, SALVAGUARDAS_PROMPT,
} from "../src/salvaguardas.js";
import { rolarAflicao } from "../src/aflicoes.js";
import { ATRIBUTOS } from "../src/constantes.js";
import { CLASSES } from "../src/classes.js";
import { bonusProficiencia } from "../src/regras.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const guerreiro = { nome: "Brann", classe: "Guerreiro", nivel: 8, atributos: { forca: 4, destreza: 1, vigor: 4, intelecto: 0, presenca: 1, percepcao: 1 } };
const mago = { nome: "Lys", classe: "Mago", nivel: 8, atributos: { forca: 0, destreza: 2, vigor: 1, intelecto: 5, presenca: 2, percepcao: 2 } };
const misto = { nome: "Kae", classe: "Guerreiro/Ladino", nivel: 8, atributos: { forca: 3, destreza: 3, vigor: 2, intelecto: 1, presenca: 1, percepcao: 2 } };
const modDe = (p) => (a) => (p.atributos[a] || 0);

sec("1. seis, uma por atributo");
{
  t("são seis", SALVAGUARDAS.length === 6);
  t("uma por atributo do jogo, sem sobra nem falta", ATRIBUTOS.every((a) => SALVAGUARDAS.some((s) => s.atributo === a.id)) && SALVAGUARDAS.length === ATRIBUTOS.length);
  t("cada uma diz do que defende", SALVAGUARDAS.every((s) => s.contra && s.contra.length > 15));
  t("id desconhecido não quebra", salvaguardaPorId("voar").id === SALVAGUARDAS[0].id);
  t("o nome é legível", nomeDaSalva("presenca") === "Presença");
}

sec("2. duas por classe — é o que faz a classe importar quando o mundo bate");
{
  let semPar = [];
  for (const c of CLASSES) {
    const par = salvasDaClasse(c.nome);
    if (par.length !== 2) semPar.push(`${c.nome}(${par.length})`);
  }
  console.log(`      ${CLASSES.length} classes · sem par: ${semPar.join(", ") || "nenhuma"}`);
  t("toda classe do jogo tem exatamente duas", semPar.length === 0);
  t("o Guerreiro aguenta com o corpo", salvasDaClasse("Guerreiro").includes("vigor") && salvasDaClasse("Guerreiro").includes("forca"));
  t("o Mago aguenta com a cabeça", salvasDaClasse("Mago").includes("intelecto"));
  t("e não com o corpo — é o desenho", !salvasDaClasse("Mago").includes("vigor"));
  t("multiclasse soma os dois pares", salvasDaClasse("Guerreiro/Ladino").length === 4);
  t("classe inventada não dá proficiência nenhuma", salvasDaClasse("Padeiro").length === 0);
  t("classe vazia não quebra", salvasDaClasse("").length === 0 && salvasDaClasse(null).length === 0);
}

sec("3. o bônus: atributo + proficiência onde há");
{
  const prof = bonusProficiencia(8);
  const bv = bonusDeSalvaguarda(guerreiro, "vigor", modDe(guerreiro));
  t("o Guerreiro soma proficiência em Vigor", bv.proficiente && bv.total === 4 + prof);
  const bi = bonusDeSalvaguarda(guerreiro, "intelecto", modDe(guerreiro));
  t("e não soma em Intelecto", !bi.proficiente && bi.total === 0);
  const mi = bonusDeSalvaguarda(mago, "intelecto", modDe(mago));
  t("o Mago soma em Intelecto", mi.proficiente && mi.total === 5 + prof);
  console.log(`      Guerreiro nv8: Vigor +${bv.total} · Intelecto +${bi.total} | Mago: Intelecto +${mi.total}`);
  t("a proficiência cresce com o nível", bonusDeSalvaguarda({ ...guerreiro, nivel: 17 }, "vigor", modDe(guerreiro)).total > bv.total);
  t("sem modDe, ainda devolve a proficiência", bonusDeSalvaguarda(guerreiro, "vigor").total === prof);
  t("ficha vazia não quebra", bonusDeSalvaguarda(null, "vigor", () => 0).total === 0);
}

sec("4. de onde vem o perigo — a tabela decide, ninguém arbitra");
{
  const casos = [
    ["dardos disparados das paredes", "destreza"],
    ["gás esverdeado", null],
    ["chão que desaba sobre estacas", "destreza"],
    ["Mordida peçonhenta", "vigor"],
    ["Sopro incandescente", "destreza"],
    ["Toque gélido", "vigor"],
    ["Uivo aterrador", "presenca"],
    ["sussurro que invade a mente", "intelecto"],
    ["tentáculo que agarra", "forca"],
    ["areia nos olhos", "percepcao"],
    ["estátua que cospe areia cega", "percepcao"],
    ["lâminas oscilantes no teto", "destreza"],
  ];
  for (const [txt, esperado] of casos) {
    const f = fonteDaSalvaguarda(txt);
    if (esperado) t(`"${txt}" → ${esperado}`, f && f.salva === esperado);
    else t(`"${txt}" não é perigo que o catálogo conheça`, f === null);
  }
  t("texto vazio devolve null — e null é 'não houve salvaguarda'", fonteDaSalvaguarda("") === null && fonteDaSalvaguarda(null) === null);
  t("um golpe sempre pede alguma — Vigor é o que sobra", salvaDoGolpe("Pancada qualquer") === "vigor");
  t("mas o golpe que a tabela conhece pede a certa", salvaDoGolpe("Ferroada tóxica") === "vigor" && salvaDoGolpe("Bafo ígneo") === "destreza");
}

sec("5. passar nem sempre é anular");
{
  const veneno = fonteDaSalvaguarda("veneno");
  const sopro = fonteDaSalvaguarda("baforada de fogo");
  t("veneno: passar anula", veneno.meia === false);
  t("baforada: passar corta pela metade", sopro.meia === true);
  t("armadilha de sala também", fonteDaSalvaguarda("armadilha").meia === true);
  t("encanto não — ou dobra a vontade ou não dobra", fonteDaSalvaguarda("encantamento").meia === false);
  /* a razão é física e está no comentário do módulo: contra o que já te
     envolveu, o reflexo reduz; contra o que entrou no sangue, ou entrou
     ou não entrou. */
  const comMeia = FONTES_DE_SALVAGUARDA.filter((f) => f.meia).map((f) => f.id);
  console.log(`      cortam pela metade: ${comMeia.join(", ")}`);
  t("as de área são as que cortam pela metade", comMeia.includes("armadilha") && comMeia.includes("sopro") && comMeia.includes("queda"));
}

sec("6. a dificuldade vem da fonte, não do herói");
{
  t("sem nível, o padrão é jogável", dcDaFonte({}) === 13);
  t("fonte mais forte, dificuldade maior", dcDaFonte({ nivel: 12 }) > dcDaFonte({ nivel: 1 }));
  t("mas tem teto — nada é impossível por aritmética", dcDaFonte({ nivel: 99 }) <= 25);
  t("e tem piso", dcDaFonte({ nivel: 0, base: 2 }) >= 8);
  t("o ajuste da fonte entra", dcDaFonte({ base: 13, ajuste: 3 }) === 16);
}

sec("7. a rolagem");
{
  const r = rolarSalvaguarda({ pers: guerreiro, salva: "vigor", dc: 15, modDe: modDe(guerreiro), d20: 10 });
  t("soma atributo e proficiência", r.total === 10 + 4 + bonusProficiencia(8));
  t("e diz se passou", r.passou === true);
  t("20 natural passa sempre", rolarSalvaguarda({ pers: mago, salva: "forca", dc: 25, modDe: modDe(mago), d20: 20 }).passou);
  t("1 natural falha sempre", !rolarSalvaguarda({ pers: guerreiro, salva: "vigor", dc: 5, modDe: modDe(guerreiro), d20: 1 }).passou);
  t("o crítico é marcado", rolarSalvaguarda({ pers: mago, salva: "vigor", dc: 10, modDe: modDe(mago), d20: 20 }).critico);
  t("o desastre também", rolarSalvaguarda({ pers: mago, salva: "vigor", dc: 10, modDe: modDe(mago), d20: 1 }).desastre);
  t("a proficiência aparece no resultado", rolarSalvaguarda({ pers: guerreiro, salva: "vigor", dc: 10, modDe: modDe(guerreiro), d20: 10 }).proficiente === true);

  /* vantagem é dois dados, e o teste é estatístico porque a promessa é
     estatística: "vantagem" que não melhora nada é enfeite */
  let comV = 0, semV = 0;
  for (let i = 0; i < 4000; i++) {
    if (rolarSalvaguarda({ pers: mago, salva: "presenca", dc: 15, modDe: modDe(mago), vantagem: true }).passou) comV++;
    if (rolarSalvaguarda({ pers: mago, salva: "presenca", dc: 15, modDe: modDe(mago) }).passou) semV++;
  }
  console.log(`      com vantagem ${(comV / 40).toFixed(1)}% · sem ${(semV / 40).toFixed(1)}%`);
  t("vantagem melhora de verdade", comV > semV * 1.15);
  t("desvantagem piora de verdade", (() => {
    let d = 0; for (let i = 0; i < 2000; i++) if (rolarSalvaguarda({ pers: mago, salva: "presenca", dc: 15, modDe: modDe(mago), desvantagem: true }).passou) d++;
    return d < semV / 2;
  })());
}

sec("8. o Mago e o Guerreiro não aguentam a mesma coisa");
{
  const conta = (p, salva) => { let n = 0; for (let i = 0; i < 4000; i++) if (rolarSalvaguarda({ pers: p, salva, dc: 15, modDe: modDe(p) }).passou) n++; return n / 40; };
  const gv = conta(guerreiro, "vigor"), mv = conta(mago, "vigor");
  const gi = conta(guerreiro, "intelecto"), mi = conta(mago, "intelecto");
  console.log(`      veneno (Vigor):   Guerreiro ${gv.toFixed(0)}% · Mago ${mv.toFixed(0)}%`);
  console.log(`      ilusão (Intelecto): Guerreiro ${gi.toFixed(0)}% · Mago ${mi.toFixed(0)}%`);
  t("o Guerreiro aguenta veneno muito melhor", gv > mv + 20);
  t("o Mago aguenta a mente muito melhor", mi > gi + 20);
  t("e ninguém é bom em tudo", gi < 50 && mv < 60);
}

sec("9. o que o jogador lê e o que o Mestre recebe");
{
  const passou = rolarSalvaguarda({ pers: guerreiro, salva: "vigor", dc: 12, modDe: modDe(guerreiro), d20: 15 });
  const linha = linhaDaSalvaguarda(passou);
  t("a linha nomeia a salvaguarda", /Salvaguarda de Vigor/.test(linha));
  t("marca a proficiência", /★/.test(linha));
  t("mostra a conta inteira", /d20 → 15/.test(linha) && /vs 12/.test(linha));
  t("e o veredicto", /resistiu/.test(linha));

  const env = envelopeDaSalvaguarda(passou, { oQue: "O gás", efeito: "envenenado" });
  t("o envelope diz que o SISTEMA rolou", /ROLADA PELO SISTEMA/.test(env));
  t("proíbe o Mestre de rolar", /Você não a pede, não a rola/.test(env));
  t("proíbe aplicar o efeito suavizado", /nem uma versão suave dele/.test(env));

  const falhou = rolarSalvaguarda({ pers: mago, salva: "vigor", dc: 20, modDe: modDe(mago), d20: 3 });
  const envF = envelopeDaSalvaguarda(falhou, { oQue: "O gás", efeito: "envenenado" });
  t("na falha, o efeito já está aplicado", /JÁ está aplicado pelo sistema/.test(envF));
  t("e o Mestre não manda condição", /não mande condição/.test(envF));

  const envM = envelopeDaSalvaguarda(passou, { oQue: "A armadilha", meia: true, danoCheio: 12, danoFinal: 6 });
  t("na de área, o envelope traz os dois danos", /Dano cheio 12, dano sofrido 6/.test(envM));
  t("e explica que passar não anula", /passar não anula/.test(envM));
  t("resultado nulo não vira texto", linhaDaSalvaguarda(null) === "" && envelopeDaSalvaguarda(null) === "");
}

sec("10. a aflição passa a rolar a salvaguarda de verdade");
{
  /* o caminho antigo (sem bônus por fora) continua funcionando para os
     inimigos, que não têm classe */
  let velho = 0;
  for (let i = 0; i < 600; i++) {
    const r = rolarAflicao({ fonte: "Mordida peçonhenta", nomeFonte: "Mordida", atacante: "Víbora", alvo: { nome: "Lacaio", nivel: 4, atributos: { vigor: 1 } }, alvoNome: "Lacaio", sempre: true });
    if (r && r.resistiu) velho++;
  }
  t("inimigo sem classe continua resistindo pelo caminho de sempre", velho > 0);

  /* e o herói passa pelo bônus de salvaguarda, com rótulo */
  const b = bonusDeSalvaguarda(guerreiro, "vigor", modDe(guerreiro));
  const r = rolarAflicao({
    fonte: "Mordida peçonhenta", nomeFonte: "Mordida peçonhenta (Víbora)", atacante: "Víbora",
    alvo: { ...guerreiro, condicoes: [] }, alvoNome: "você", sempre: true,
    bonusResistir: b.total, rotuloResistir: "Salvaguarda de Vigor ★",
  });
  t("o resultado sai rotulado como salvaguarda", r && /Salvaguarda de Vigor/.test(r.texto));
  t("e a nota ao Mestre também", r && /SALVAGUARDA — ROLADA PELO SISTEMA/.test(r.nota));
  t("a nota proíbe repetir a rolagem", r && /não a repete/.test(r.nota));
  t("o bônus usado é o de salvaguarda", r && r.mod === b.total);

  /* o Guerreiro resiste a veneno muito mais que o Mago — e agora isso vale
     também dentro das aflições, que era onde não valia */
  const taxa = (p, salva) => {
    const bb = bonusDeSalvaguarda(p, salva, modDe(p));
    let n = 0;
    for (let i = 0; i < 3000; i++) {
      const x = rolarAflicao({ fonte: "Mordida peçonhenta", nomeFonte: "M", atacante: "V", alvo: { ...p, condicoes: [] }, alvoNome: "x", sempre: true, bonusResistir: bb.total, rotuloResistir: "S" });
      if (x && x.resistiu) n++;
    }
    return n / 30;
  };
  const tg = taxa(guerreiro, "vigor"), tm = taxa(mago, "vigor");
  console.log(`      veneno resistido: Guerreiro ${tg.toFixed(0)}% · Mago ${tm.toFixed(0)}%`);
  t("a classe importa dentro da aflição também", tg > tm + 15);
}

sec("11. a regra que o Mestre recebe");
{
  t("diz que é a que ninguém pede", /A ROLAGEM QUE NINGUÉM PEDE/.test(SALVAGUARDAS_PROMPT));
  t("proíbe o Mestre de rolar", /não pode rolar uma/.test(SALVAGUARDAS_PROMPT));
  t("proíbe o Mestre de exigir uma", /não pode exigir uma/.test(SALVAGUARDAS_PROMPT));
  t("diz que o jogador também não pede", /O jogador não pode pedir uma/.test(SALVAGUARDAS_PROMPT));
  t("lista as seis", SALVAGUARDAS.every((s) => SALVAGUARDAS_PROMPT.includes(s.nome)));
  t("explica que passar nem sempre anula", /PASSAR NÃO É SEMPRE ANULAR/.test(SALVAGUARDAS_PROMPT));
  t("e que resistir é resposta inteira", /Resistir é uma resposta inteira/.test(SALVAGUARDAS_PROMPT));
}

console.log(`\nsalvaguardas v9.60: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
