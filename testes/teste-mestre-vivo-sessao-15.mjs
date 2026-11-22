/* O Mestre vivo, décima quinta sessão (22/11/2026) — os defeitos pontuais.

   A sessão mediu a história, e o diagnóstico no código achou três defeitos
   que não eram de desenho, eram de letra:

   1. Turno 33, «Você não tem isso com você» com a espada na mão. A ficha
      guarda o que o herói veste em `equipados` (ficha-da-criacao.js,
      kit-inicial.js, itens.js), e quatro leitores liam `equipado`: as posses
      que o conferente recebe, o inventário do veredito, a bolsa do conferente
      e o `temItem` das vias de tranca. O que estava equipado não existia.
   2. Turnos 24, 30 e 48, um «[…]» literal no fim da narração. O aviso de
      narração cortada aceitava a aspa reta e a angular, e não a aspa curva
      com que a IA fecha uma fala.
   3. Turno 43, a linha de ajuda citava «Hakon», que não existe no mundo de
      quem joga.

   Cada prova abaixo falha no commit anterior e passa neste. */
import fs from "node:fs";
import { aBolsaAgora } from "../src/motor/o-conferente-da-prosa.js";
import { viasAbertas } from "../src/desafios.js";
import { sanearResposta } from "../src/json.js";
import { O_VEREDITO_DA_TROCA, aPortaFinalDaTroca } from "../src/o-veredito-da-troca.js";

let falhas = 0;
const t = (nome, cond, extra) => { if (cond) console.log("  ok:", nome); else { falhas++; console.log("  FALHA:", nome, extra != null ? `→ ${extra}` : ""); } };

console.log("1. o que está equipado é do herói");
{
  const heroi = { nome: "Barnabas", inventario: [{ nome: "Símbolo sagrado riscado" }], equipados: { arma: { nome: "Espada Curta" }, armadura: "Gibão de Couro" }, moedas: 15, suprimentos: { tochas: 5 } };
  const bolsa = aBolsaAgora(heroi);
  t("a bolsa do conferente tem a arma equipada", bolsa.itens.includes("Espada Curta"), JSON.stringify(bolsa.itens));
  t("e a armadura, mesmo guardada só pelo nome", bolsa.itens.includes("Gibão de Couro"));
  t("PAR: o inventário continua lá", bolsa.itens.includes("Símbolo sagrado riscado"));
  t("PAR: ficha sem nada equipado não quebra", aBolsaAgora({ inventario: [], equipados: null }).itens.length === 0);

  const comGazua = { nivel: 1, inventario: [], habilidades: [], equipados: { ferramenta: { nome: "Gazuas de ladrão" } } };
  const semGazua = { nivel: 1, inventario: [], habilidades: [], equipados: {} };
  const ids = (p) => viasAbertas(p).map((v) => v.id);
  t("a gazua equipada abre a via das ferramentas", ids(comGazua).includes("ferramentas"), ids(comGazua).join(","));
  t("PAR: sem gazua, a via não abre", !ids(semGazua).includes("ferramentas"));

  /* a fiação: os dois leitores do App leem o mesmo campo da ficha */
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o App entrega ao conferente o que está em `equipados`", /Object\.values\(pC\.equipados \|\| \{\}\)/.test(app));
  t("o App entrega ao veredito o que está em `equipados`", /Object\.values\(p0\.equipados \|\| \{\}\)/.test(app));
  t("nenhum leitor do App ficou no campo que não existe", !/p[C0]\.equipado \|\|/.test(app));
}

console.log("2. a fala que fecha em aspa curva não está cortada");
{
  const fala = "Ela ergue os olhos do balcão e fala baixo, sem pressa nenhuma: “Aqui ninguém a chama pelo nome.”";
  t("narração terminada em aspa curva sai sem o aviso de corte", !sanearResposta({ narrativa: fala }).narrativa.includes("[…]"), sanearResposta({ narrativa: fala }).narrativa.slice(-12));
  const apostrofo = "Ele mostra a palma vazia e diz que o nome dele, por ali, é só ‘o Manco’";
  t("idem com a aspa simples curva", !sanearResposta({ narrativa: apostrofo }).narrativa.includes("[…]"));
  const cortada = "Ela ergue os olhos do balcão e fala baixo, sem pressa nenhuma, e então a porta se";
  t("PAR: narração cortada no meio da frase continua a levar o aviso", sanearResposta({ narrativa: cortada }).narrativa.endsWith("[…]"));
}

console.log("3. a ajuda não cita quem não existe");
{
  const tela = O_VEREDITO_DA_TROCA.portaFinal ? O_VEREDITO_DA_TROCA.portaFinal.tela : null;
  const textos = JSON.stringify(O_VEREDITO_DA_TROCA);
  t("nenhum texto de tela do veredito cita um nome próprio de exemplo", !/«[^»]*\bHakon\b[^»]*»/.test(textos));
  t("a linha genérica existe e ainda diz o que pedir", !tela || (typeof tela.generica === "string" && /a quem/.test(tela.generica)));
  const v = aPortaFinalDaTroca("troco a minha faca pela corda dele", { ficha: { nome: "Barnabas", inventario: [{ nome: "Faca" }], moedas: 5 }, presentes: ["Cornelius"] });
  t("o que a porta final mostra ao jogador não traz «Hakon»", !v || !/Hakon/.test(JSON.stringify(v)), v && JSON.stringify(v).slice(0, 160));
}

console.log(falhas ? `\n${falhas} falha(s)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
