/* teste-grimorio-da-classe.mjs (05/11, AR3 · os Talentos) — a aba Grimório.

   `grimorioDaClasse(pers, classe)` (magias.js) dá à aba as magias da classe
   por círculo, cada uma com o estado (conhecida, disponível, bloqueada com o
   porquê), o custo em pontos e em PM, o efeito numa linha, e — só para quem
   prepara — se está na cabeça hoje. A suíte prova que NADA se inventa: cada
   número e cada motivo é o que as tabelas e a régua da árvore já dizem.

   FALHA ANTES: `grimorioDaClasse` e `ESTADOS_DO_GRIMORIO` não existiam; a
   árvore só mostrava as magias que se podiam pegar agora. */
import { grimorioDaClasse, ESTADOS_DO_GRIMORIO, PREPARAM, limitePreparadas } from "../src/magias.js";
import { MAGIAS, NIVEL_DO_CIRCULO, custoDoCirculo, magiaPorNome, classesDaMagia, magiasDisponiveis } from "../src/grimorio.js";
import { podePegarHabilidade, custoEmPontos, arvoreDaClasse, CLASSES } from "../src/classes.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const todas = (g) => g.circulos.flatMap((c) => c.magias);

const MAGO = { classe: "Mago", nivel: 5, atributos: { intelecto: 3 },
  habilidades: [{ nome: "Mísseis Mágicos" }, { nome: "Bola de Fogo" }], preparadas: ["Mísseis Mágicos"] };

sec("1. a tabela dos estados");
{
  t("três estados, pela ordem", ESTADOS_DO_GRIMORIO.join(",") === "conhecida,disponivel,bloqueada");
  t("congelada", Object.isFrozen(ESTADOS_DO_GRIMORIO));
}

sec("2. as magias são as do catálogo, e todas as da classe");
{
  const g = grimorioDaClasse(MAGO, "Mago");
  const nomes = todas(g).map((m) => m.nome);
  const doCatalogo = MAGIAS.filter((m) => m.classes.includes("Mago")).map((m) => m.nome);
  t(`as ${doCatalogo.length} magias de Mago, nem uma a mais`, nomes.length === doCatalogo.length && doCatalogo.every((n) => nomes.includes(n)));
  t("cada uma nomeia a classe no catálogo (classesDaMagia)", nomes.every((n) => classesDaMagia(n).includes("Mago")));
  t("por círculo, do menor ao maior, sem círculo vazio", g.circulos.every((c, i, a) => c.magias.length && (i === 0 || a[i - 1].circulo < c.circulo)));
  t("cada magia mora no seu círculo", g.circulos.every((c) => c.magias.every((m) => m.circulo === c.circulo)));
  t("o degrau e o custo do círculo são os da tabela", g.circulos.every((c) => c.nivel === NIVEL_DO_CIRCULO[c.circulo] && c.custoPM === custoDoCirculo(c.circulo) && c.custoPontos === custoEmPontos({ nivel: c.nivel })));
  t("o efeito, o PM e o nível de cada magia são os da entrada", todas(g).every((m) => { const e = magiaPorNome(m.nome); return e && m.efeito === e.descricao && m.custoPM === e.custo && m.nivel === e.nivel && m.forma === e.forma; }));
  t("e cada classe com magia tem grimório; a sem magia não tem (null)",
    CLASSES.every((c) => (MAGIAS.some((m) => m.classes.includes(c.nome)) ? grimorioDaClasse(MAGO, c.nome) !== null : grimorioDaClasse(MAGO, c.nome) === null)));
}

sec("3. o estado, pela mesma régua da árvore");
{
  const g = grimorioDaClasse(MAGO, "Mago");
  const por = Object.fromEntries(todas(g).map((m) => [m.nome, m]));
  t("as que ele sabe são «conhecida»", por["Mísseis Mágicos"].estado === "conhecida" && por["Bola de Fogo"].estado === "conhecida");
  t("o estado é o que podePegarHabilidade diz, magia a magia", todas(g).every((m) => {
    if (m.estado === "conhecida") return true;
    const chk = podePegarHabilidade(MAGO, "Mago", magiaPorNome(m.nome));
    return chk.pode ? m.estado === "disponivel" && m.motivo === "" : m.estado === "bloqueada" && m.motivo === chk.motivo && m.motivo.length > 0;
  }));
  t("e o que se pode aprender agora é o que magiasDisponiveis abre (no nível, sem as sabidas) — e o resto tem porquê",
    todas(g).filter((m) => m.estado === "disponivel").every((m) => magiasDisponiveis("Mago", MAGO.nivel, MAGO.habilidades).some((x) => x.nome === m.nome)));
  t("o custo em pontos é o da árvore (custoEmPontos)", todas(g).every((m) => m.custoPontos === custoEmPontos(magiaPorNome(m.nome))));
  t("todo bloqueio diz porquê", todas(g).filter((m) => m.estado === "bloqueada").every((m) => m.motivo));
  t("um círculo alto para um nível 5 está bloqueado", por["Chuva de Meteoros"].estado === "bloqueada");
  /* o golpe e a magia dizem o porquê com as mesmas palavras: o golpe da árvore
     do mesmo degrau, bloqueado, dá o mesmo motivo que a magia desse degrau */
  const golpe = arvoreDaClasse(MAGO, "Mago").find((h) => !h.dominada && !h.pode && todas(g).some((m) => m.estado === "bloqueada" && m.nivel === h.nivel));
  const magiaIrma = golpe && todas(g).find((m) => m.estado === "bloqueada" && m.nivel === golpe.nivel);
  t("o porquê é o mesmo da árvore, no mesmo degrau (uma ação, uma forma)", !!golpe && magiaIrma.motivo === golpe.motivo, golpe ? `${golpe.motivo} / ${magiaIrma.motivo}` : "sem golpe bloqueado");
}

sec("4. aprender não é preparar");
{
  const g = grimorioDaClasse(MAGO, "Mago");
  const por = Object.fromEntries(todas(g).map((m) => [m.nome, m]));
  t("o Mago prepara (PREPARAM), e o topo diz quantas leva na cabeça", PREPARAM.includes("Mago") && g.naCabeca && g.naCabeca.preparadas === 1 && g.naCabeca.limite === limitePreparadas(MAGO), J(g.naCabeca));
  t("a conhecida e preparada: preparada = true", por["Mísseis Mágicos"].preparada === true);
  t("a conhecida e guardada: preparada = false", por["Bola de Fogo"].preparada === false);
  t("a que não se sabe: preparada = null (não se prepara o que não se aprendeu)", todas(g).filter((m) => m.estado !== "conhecida").every((m) => m.preparada === null));
  const bardo = { classe: "Bardo", nivel: 3, habilidades: [{ nome: "Palavra Curativa" }] };
  const gb = grimorioDaClasse(bardo, "Bardo");
  t("o Bardo nasce com o dom: sem «na cabeça», e preparada = null mesmo na que sabe",
    gb && gb.naCabeca === null && todas(gb).find((m) => m.nome === "Palavra Curativa").preparada === null && todas(gb).find((m) => m.nome === "Palavra Curativa").estado === "conhecida");
  /* o Mago a olhar para o grimório de uma classe que não tem: nada a preparar ali */
  const gf = grimorioDaClasse(MAGO, "Clérigo");
  t("o grimório de uma classe que ele não tem não tem «na cabeça»", gf && gf.naCabeca === null);
}

sec("5. a subclasse e os pontos, no topo");
{
  const sub = { ...MAGO, subclasses: { Mago: "Elementalista" } };
  t("a subclasse trilhada nesta classe vem no topo", grimorioDaClasse(sub, "Mago").subclasse === "Elementalista");
  t("sem subclasse: null", grimorioDaClasse({ classe: "Mago", nivel: 1, habilidades: [] }, "Mago").subclasse === null);
  t("os pontos são os da ficha", grimorioDaClasse({ ...MAGO, pontosHab: 4 }, "Mago").pontos === 4);
}

sec("6. lixo, determinismo, imutabilidade");
{
  t("pers null não estoura e dá o grimório inteiro, nada conhecido", (() => { const g = grimorioDaClasse(null, "Mago"); return g && todas(g).every((m) => m.estado !== "conhecida"); })());
  t("pers {} idem", (() => { const g = grimorioDaClasse({}, "Mago"); return g && todas(g).length > 0; })());
  t("classe lixo (null, número, inexistente) → null", [null, 3, "", "Padeiro"].every((c) => grimorioDaClasse(MAGO, c) === null));
  t("habilidades em texto também contam como sabidas", todas(grimorioDaClasse({ classe: "Mago", nivel: 1, habilidades: ["Sono"] }, "Mago")).find((m) => m.nome === "Sono").estado === "conhecida");
  t("mesma ficha, mesmo grimório", J(grimorioDaClasse(MAGO, "Mago")) === J(grimorioDaClasse(MAGO, "Mago")));
  const antes = J(MAGO);
  grimorioDaClasse(MAGO, "Mago");
  t("e não muta a ficha", J(MAGO) === antes);
  const g = grimorioDaClasse(MAGO, "Mago");
  todas(g)[0].nome = "mexido";
  t("nem o catálogo, quando a tela mexe no que recebeu", MAGIAS.every((m) => m.nome !== "mexido"));
}

console.log(`\ngrimorio-da-classe: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
