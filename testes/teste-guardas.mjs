/* teste-guardas.mjs (v9.53) — a defesa que dura turnos, e os tres reerguer
   que faltaram no casamento da v9.47.                                       */
import { guardaDe, erguerGuarda, expirarGuardas, baixarGuardas, defesaDeGuarda, guardasAtivas, estaIntocavel, esquivaDeGuarda, GUARDAS, reerguerDe, reerguer } from "../src/habilidades.js";
import { defesaDe, resolverAtaque } from "../src/combate.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const doCatalogo = (nome) => {
  for (const c of CLASSES) { const h = (c.habilidades || []).find((x) => x.nome === nome); if (h) return h; }
  for (const arr of Object.values(SUBCLASSES)) { const h = (arr || []).find((x) => x.nome === nome); if (h) return h; }
  for (const arr of Object.values(ESPECIALIZACOES)) { const h = (arr || []).find((x) => x.nome === nome); if (h) return h; }
  return null;
};
const heroi = (extra = {}) => ({ nome: "Vera", classe: "Druida", nivel: 8, vida: 60, vidaMax: 60, atributos: { destreza: 2 }, grupo: [], ...extra });

sec("1. as cinco que prometiam defesa agora a têm");
{
  const nomes = ["Casca de Carvalho", "Pele Arcana", "Forma Dracônica", "Enxerto Mecânico", "Elixir de Combate"];
  for (const n of nomes) {
    const h = doCatalogo(n);
    t(`"${n}" existe no catálogo`, !!h);
    t(`  e é reconhecida como guarda`, !!guardaDe(h));
  }
  t("Bola de Fogo não é guarda", !guardaDe({ nome: "Bola de Fogo", descricao: "Explosão de chamas." }));
  t("toda guarda de defesa tem valor e prazo", GUARDAS.filter(g=>!g.tipo).every((g) => g.valor > 0 && g.turnos > 0));
  t("e nenhuma passa de +4 (a régua da casa)", GUARDAS.filter(g=>!g.tipo).every((g) => g.valor <= 4));
}

sec("1b. as quatro que prometiam invulnerabilidade");
{
  for (const n of ["Vazio Perfeito", "Dança Sem Vulto", "Nada Me Alcança", "Improvável"]) {
    const h = doCatalogo(n);
    t(`"${n}" existe no catálogo`, !!h);
    t(`  e é reconhecida`, !!guardaDe(h));
  }
  /* a escada: quanto mais absoluta a promessa, mais curto o prazo */
  const abs = GUARDAS.filter((g) => g.tipo === "intocavel");
  t("só a intocável é absoluta, e dura 1 turno", abs.length === 1 && abs[0].turnos === 1);
  t("as de prazo longo são desvantagem, não imunidade", GUARDAS.filter((g) => g.turnos >= 3 && g.tipo).every((g) => g.tipo === "esquiva"));

  const p = erguerGuarda(heroi(), doCatalogo("Vazio Perfeito"), 1).pers;
  t("o herói fica intocável", estaIntocavel(p));
  /* 60 golpes de um inimigo brutal: nenhum acerta */
  let acertos = 0;
  for (let i = 0; i < 60; i++) { const r = resolverAtaque({ atacante: "Ogro", alvo: p, ehAtacanteInimigo: true, bonusAtaque: 30, danoBase: 40 }); if (r.dano > 0) acertos++; }
  t("e 60 golpes com +30 de bônus não tiram um PV", acertos === 0);
  t("o resultado se identifica como intocável", resolverAtaque({ atacante: "X", alvo: p, ehAtacanteInimigo: true, bonusAtaque: 30, danoBase: 40 }).intocavel === true);

  const q = erguerGuarda(heroi(), doCatalogo("Dança Sem Vulto"), 1).pers;
  t("a dança não é intocável", !estaIntocavel(q));
  t("mas dá desvantagem a quem ataca", esquivaDeGuarda(q));

  /* Nada Me Alcança só morde feitiço */
  const m = erguerGuarda(heroi(), doCatalogo("Nada Me Alcança"), 1).pers;
  t("contra magia, esquiva", esquivaDeGuarda(m, { magico: true }));
  t("contra aço, não", !esquivaDeGuarda(m, { magico: false }));
  t("herói sem guarda nenhuma não esquiva nada", !esquivaDeGuarda(heroi()) && !estaIntocavel(heroi()));
}

sec("2. a defesa sobe DE VERDADE na conta do combate");
{
  const p = heroi();
  const antes = defesaDe(p);
  const r = erguerGuarda(p, doCatalogo("Casca de Carvalho"), 1);
  t("ergue", r.ok);
  const depois = defesaDe(r.pers);
  console.log(`      defesa ${antes} → ${depois}`);
  t("a defesa subiu +4", depois === antes + 4);
  t("defesaDeGuarda confere", defesaDeGuarda(r.pers) === 4);
  t("o jogador lê o número", /\+4 de defesa/.test(r.linha));
  t("o Mestre é proibido de inventar", /não invente número/.test(r.nota));
  t("não ergue a mesma guarda duas vezes", !erguerGuarda(r.pers, doCatalogo("Casca de Carvalho"), 2).ok);

  /* duas guardas diferentes SOMAM */
  const r2 = erguerGuarda(r.pers, doCatalogo("Pele Arcana"), 1);
  t("duas guardas diferentes convivem", r2.ok && guardasAtivas(r2.pers).length === 2);
  t("e somam", defesaDe(r2.pers) === antes + 7);
}

sec("3. e desce quando o prazo acaba");
{
  const p = erguerGuarda(heroi(), doCatalogo("Pele Arcana"), 1).pers;   // 2 turnos
  const base = defesaDe(heroi());
  t("na rodada 2 ainda está de pé", expirarGuardas(p, 2).linhas.length === 0);
  t("e a defesa continua alta", defesaDe(expirarGuardas(p, 2).pers) === base + 3);
  const fim = expirarGuardas(p, 3);
  t("na rodada 3 cai", fim.linhas.length === 1);
  t("o jogador lê a queda", /se desfaz/.test(fim.linhas[0]));
  t("e a defesa volta ao normal", defesaDe(fim.pers) === base);
  t("a ficha não fica com lixo", fim.pers.guardas === undefined);
  t("sem guarda, expirar não faz nada", expirarGuardas(heroi(), 9).linhas.length === 0);
}

sec("4. a luta acaba, a guarda baixa");
{
  const p = erguerGuarda(heroi(), doCatalogo("Casca de Carvalho"), 1).pers;
  const b = baixarGuardas(p);
  t("baixa", !!b.linha && defesaDe(b.pers) === defesaDe(heroi()));
  t("sem guarda nenhuma, cala", baixarGuardas(heroi()).linha === "");
}

sec("5. os três reerguer que faltaram");
{
  for (const n of ["Refrão Teimoso", "Renascimento", "Grande Necrópole"]) {
    const h = doCatalogo(n);
    t(`"${n}" existe`, !!h);
    t(`  e agora reergue`, !!reerguerDe(h));
  }
  t("Refrão Teimoso devolve metade, como diz a descrição", reerguerDe(doCatalogo("Refrão Teimoso")).fracao === 0.5);
  t("Renascimento pega todos", reerguerDe(doCatalogo("Renascimento")).todos === true);
  t("Grande Necrópole pega todos", reerguerDe(doCatalogo("Grande Necrópole")).todos === true);

  const caidos = heroi({ grupo: [{ nome: "Ilse", vida: 0, vidaMax: 20 }, { nome: "Bram", vida: 0, vidaMax: 30 }] });
  const r = reerguer(caidos, doCatalogo("Renascimento"));
  t("Renascimento ergue os dois", r.ok && r.pers.grupo.every((g) => g.vida > 0));
  const rt = reerguer(caidos, doCatalogo("Refrão Teimoso"));
  t("Refrão Teimoso ergue um, com metade do PV", rt.ok && rt.pers.grupo[0].vida === 10);
  t("as duas antigas continuam valendo", !!reerguerDe(doCatalogo("Ressurreição Menor")) && !!reerguerDe(doCatalogo("Última Estrofe")));
}

console.log(`\nguardas v9.53: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
