/* teste-limiares.mjs (v9.48) — as habilidades que cobram o ESTADO do alvo.
   Nasceu de um zumbi com 23 de 92 PV que a Colheita Final nao matou.       */
import { limiarDe, abaixoDoLimiar, colherPorLimiar } from "../src/habilidades.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* as habilidades REAIS do catalogo: se alguem reescrever a descricao sem
   reescrever a regra, o teste cai junto */
const doCatalogo = (nome) => {
  for (const c of CLASSES) { const h = (c.habilidades || []).find((x) => x.nome === nome); if (h) return h; }
  for (const arr of Object.values(SUBCLASSES)) { const h = (arr || []).find((x) => x.nome === nome); if (h) return h; }
  for (const arr of Object.values(ESPECIALIZACOES)) { const h = (arr || []).find((x) => x.nome === nome); if (h) return h; }
  return null;
};
const inim = (nome, vida, vidaMax, extra = {}) => ({ nome, vida, vidaMax, derrotado: false, ...extra });

sec("1. quem e da familia — pelo texto real do catalogo");
{
  const colheita = doCatalogo("Colheita Final");
  t("Colheita Final existe", !!colheita);
  const l = limiarDe(colheita);
  t("e e reconhecida", !!l);
  t("abate, nao dobra", l.modo === "abate");
  t("pega o campo inteiro", l.escopo === "todos");
  t("no terco dos PV", Math.abs(l.fracao - 1 / 3) < 1e-9);

  /* as duas "Execucao" tem o MESMO nome e promessas diferentes: o ladino
     elimina, o assassino dobra. Se o casamento fosse por nome, colidiriam. */
  const exLadino = CLASSES.find((c) => c.nome === "Ladino").habilidades.find((h) => h.nome === "Execução");
  const exAssassino = (SUBCLASSES["Assassino"] || []).find((h) => h.nome === "Execução");
  t("as duas Execucao existem", !!exLadino && !!exAssassino);
  t("a do Ladino ABATE", limiarDe(exLadino).modo === "abate");
  t("a do Assassino DOBRA", limiarDe(exAssassino).modo === "dobra");
  t("nome igual, regra diferente", limiarDe(exLadino).id !== limiarDe(exAssassino).id);

  t("Golpe Decisivo dobra", limiarDe(doCatalogo("Golpe Decisivo")).modo === "dobra");
  t("Cobranca abate", limiarDe(doCatalogo("Cobrança")).modo === "abate");
  t("Uma So Respiracao abate", limiarDe(doCatalogo("Uma Só Respiração")).modo === "abate");

  /* o molde das unicas era o UNICO desta familia com codigo antes da v9.48 */
  t("o molde execucao continua valendo", limiarDe({ nome: "Fim de Linha", molde: "execucao" }).modo === "dobra");
}

sec("2. quem NAO e — o falso positivo aqui mata quem devia estar de pe");
{
  const fora = [
    "Bola de Fogo", "Golpe Poderoso", "Sangue de Dragão", "Forma Conjunta",
    "Cura Maior", "Ressurreição Menor", "Última Estrofe", "Colheita de Almas",
    "Grande Necrópole", "Escudo do Aliado Caído", "Juramento Final", "Sugestão Plantada",
    "Aurora Restauradora", "Refrão Teimoso", "Renascimento", "Reparo de Campo",
  ];
  for (const nome of fora) {
    const h = doCatalogo(nome) || { nome, descricao: "Explosão de chamas em área." };
    t(`"${nome}" nao vira execucao`, !limiarDe(h));
  }
  t("habilidade vazia nao quebra", !limiarDe(null) && !limiarDe({}));

  /* a varredura inteira: nada alem das seis previstas pode casar */
  const todas = [];
  for (const c of CLASSES) for (const h of c.habilidades || []) todas.push(h);
  for (const arr of Object.values(SUBCLASSES)) for (const h of arr || []) todas.push(h);
  for (const arr of Object.values(ESPECIALIZACOES)) for (const h of arr || []) todas.push(h);
  const casam = todas.filter((h) => limiarDe(h));
  t(`so 6 habilidades do catalogo casam (achou ${casam.length}: ${casam.map((h) => h.nome).join(", ")})`, casam.length === 6);
}

sec("3. a regua — 23 de 92 e menos de um terco");
{
  const terco = 1 / 3;
  t("o zumbi do bug cai", abaixoDoLimiar(inim("zumbi", 23, 92), terco));
  t("com 40 de 92 nao cai", !abaixoDoLimiar(inim("zumbi", 40, 92), terco));
  t("no terco exato NAO cai (e 'abaixo de')", !abaixoDoLimiar(inim("x", 30, 90), terco));
  t("um a menos ja cai", abaixoDoLimiar(inim("x", 29, 90), terco));
  t("morto nao 'cai' de novo", !abaixoDoLimiar(inim("x", 0, 90), terco));
  t("sem vidaMax nao arrisca", !abaixoDoLimiar({ nome: "x", vida: 5 }, terco));
  t("metade tambem funciona", abaixoDoLimiar(inim("x", 45, 100), 0.5) && !abaixoDoLimiar(inim("x", 50, 100), 0.5));
}

sec("4. a colheita — quem cai e quem sobra");
{
  const regra = limiarDe(doCatalogo("Colheita Final"));
  const campo = [
    inim("zumbi", 23, 92),        // 25% — cai
    inim("Bandido 1", 30, 90),    // 33,3% exato — sobra
    inim("Bandido 2", 4, 40),     // 10% — cai
    inim("Chefe", 200, 300),      // cheio — sobra
    { ...inim("Velho", 5, 50), derrotado: true }, // ja caido — nao entra na conta
  ];
  const r = colherPorLimiar(campo, regra);
  t("caem os dois abaixo do terco", r.nomes.join(",") === "zumbi,Bandido 2");
  t("o de 33,3% fica de pe", r.lista.find((e) => e.nome === "Bandido 1").vida === 30);
  t("o chefe nem sente", !r.lista.find((e) => e.nome === "Chefe").derrotado);
  t("quem caiu fica a 0", r.lista.find((e) => e.nome === "zumbi").vida === 0);
  t("e marcado derrotado", r.lista.find((e) => e.nome === "Bandido 2").derrotado === true);
  t("guarda quanto ele ainda tinha", r.lista.find((e) => e.nome === "zumbi").ultimoDano === 23);
  t("a lista original nao e mexida", campo[0].vida === 23);

  const nada = colherPorLimiar([inim("Chefe", 300, 300)], regra);
  t("campo inteiro de pe: ninguem cai", nada.nomes.length === 0);
  t("campo vazio nao quebra", colherPorLimiar([], regra).nomes.length === 0);

  /* a Regra do Degrau: o poder de um mortal nao colhe um deus */
  const comDeus = colherPorLimiar([inim("zumbi", 23, 92), inim("Deus Menor", 10, 500, { gd: 4 })], regra, {
    podeCair: (e) => !e.gd,
  });
  t("o deus a 2% nao e colhido", comDeus.nomes.join(",") === "zumbi");

  t("regra de dobrar nao colhe ninguem", colherPorLimiar(campo, limiarDe(doCatalogo("Golpe Decisivo"))) === null);
  t("sem regra, null", colherPorLimiar(campo, null) === null);
}

console.log(`\nlimiares v9.48: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
