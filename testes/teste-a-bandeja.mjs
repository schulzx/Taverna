/* A BANDEJA (04/11/2026) — src/motor/a-bandeja.js

   «um rpg precisa de constantes rolagens… além de que são diferentes dados
   jogados». A bandeja mostra o dado que o sistema JÁ rolou — nunca rola
   por conta própria. Esta suíte prova:
   §1 o teste d20: a conta, a CD, crítico e desastre naturais, o Destino;
   §2 o d100 do oráculo ganha por baixo, e o reusado não vai à mesa;
   §3 o dado de vida (d6–d12) com o Vigor;
   §4 a série da marcha forçada: o pior desfecho manda;
   §5 a mesa: três à vista, o novo à frente, imutável, o número de ordem;
   §6 o dado falso não pousa (face desconhecida, valor fora, NaN);
   §7 a linha que o jogador lê, e o teto de dados. */
import { A_BANDEJA, lancamento, lancamentoDoTeste, lancamentoDoOraculo, lancamentoDoDadoDeVida, lancamentoDaSerie, naBandeja, aLinhaDoLancamento, NOME_DO_DESFECHO } from "../src/motor/a-bandeja.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

sec("§1 o teste d20");
{
  const l = lancamentoDoTeste({ valor: 14, mod: 2, dc: 13, rotulo: "Saltar o muro" });
  t("14 + 2 = 16 contra 13 passa", l.total === 16 && l.desfecho === "sucesso" && l.papel === "teste", J(l));
  t("a linha diz o que se tentou, a conta e a CD", aLinhaDoLancamento(l) === "Saltar o muro · 14 + 2 = 16 · precisa de 13", aLinhaDoLancamento(l));
  const f = lancamentoDoTeste({ valor: 9, mod: 3, dc: 13 });
  t("9 + 3 = 12 contra 13 falha", f.desfecho === "falha" && f.rotulo === "Teste");
  t("o 20 natural é crítico mesmo abaixo da CD", lancamentoDoTeste({ valor: 20, mod: -5, dc: 25 }).desfecho === "critico");
  t("o 1 natural é desastre mesmo acima da CD", lancamentoDoTeste({ valor: 1, mod: 15, dc: 5 }).desfecho === "desastre");
  t("o teste já rolou no Véu: na mesa pousa sem rolar", l.jaRolou === true && !lancamentoDoOraculo({ rolo: 5, chance: 50 }).jaRolou);
  t("sem CD o resultado é livre", lancamentoDoTeste({ valor: 11, mod: 0 }).desfecho === "livre");
  const r = lancamentoDoTeste({ valor: 17, mod: 1, dc: 15, anterior: 4 });
  t("o Destino: o dado refeito fica posto de lado, e não conta", r.dados.length === 2 && r.dados[0].posto && r.dados[0].valor === 4 && r.total === 18 && r.desfecho === "sucesso", J(r));
  t("o mod negativo escreve-se com o sinal certo", aLinhaDoLancamento(lancamentoDoTeste({ valor: 12, mod: -1, dc: 10 })) === "Teste · 12 − 1 = 11 · precisa de 10");
}

sec("§2 o d100 do oráculo");
{
  const sim = lancamentoDoOraculo({ rolo: 23, chance: 58, reusado: false });
  t("23 contra 58% é sim (ganha por baixo)", sim.desfecho === "sucesso" && sim.dados[0].faces === 100 && sim.papel === "sorte", J(sim));
  t("93 contra 58% é não", lancamentoDoOraculo({ rolo: 93, chance: 58 }).desfecho === "falha");
  t("a linha diz a chance, não «precisa de»", aLinhaDoLancamento(sim) === "O mundo responde · 23 · chance 58%", aLinhaDoLancamento(sim));
  t("a resposta que o mundo já tinha dado não rola, e não pousa", lancamentoDoOraculo({ rolo: 0, chance: 58, reusado: true }) === null);
  t("o d100 não conhece crítico", lancamentoDoOraculo({ rolo: 20, chance: 10 }).desfecho === "falha");
}

sec("§3 o dado de vida");
{
  for (const lados of [6, 8, 10, 12]) {
    const l = lancamentoDoDadoDeVida({ ok: true, rolado: 3, lados }, 2);
    t(`d${lados} → 3 + 2 de Vigor = 5, papel de cura`, l && l.dados[0].faces === lados && l.total === 5 && l.papel === "cura" && l.desfecho === "livre");
  }
  t("o descanso recusado não pousa dado", lancamentoDoDadoDeVida({ ok: false }) === null);
}

sec("§4 a série da marcha forçada");
{
  const s = lancamentoDaSerie("Marcha forçada", [{ rolo: 14, cd: 10, passou: true }, { rolo: 6, cd: 11, passou: false }, { rolo: 18, cd: 12, passou: true }]);
  t("três d20 na mesa, e a hora que cedeu manda: falhou", s.dados.length === 3 && s.desfecho === "falha" && s.serie, J(s));
  t("a linha da série são os dados, sem soma", aLinhaDoLancamento(s) === "Marcha forçada · 14 · 6 · 18 · precisa de 12", aLinhaDoLancamento(s));
  t("todas aguentaram: passou", lancamentoDaSerie("Marcha forçada", [{ rolo: 15, cd: 10, passou: true }]).desfecho === "sucesso");
  t("série vazia não pousa", lancamentoDaSerie("Marcha forçada", []) === null);
}

sec("§5 a mesa");
{
  let b = [];
  for (let i = 1; i <= 5; i++) b = naBandeja(b, lancamentoDoTeste({ valor: i + 5, dc: 10 }));
  t(`ficam ${A_BANDEJA.ficam} à vista`, b.length === A_BANDEJA.ficam);
  t("o novo entra à frente, com o número de ordem a subir", b[0].n === 5 && b[1].n === 4 && b[0].dados[0].valor === 10, J(b.map((x) => x.n)));
  t("a bandeja é imutável", Object.isFrozen(b) && Object.isFrozen(b[0]));
  const antes = b;
  const depois = naBandeja(b, null);
  t("um lançamento nulo não mexe na mesa", depois === antes);
  t("a mesa nula aceita o primeiro", naBandeja(null, lancamentoDoTeste({ valor: 3 })).length === 1);
  t("dois testes iguais seguidos têm números diferentes (a peça volta a rolar)", (() => { const x = naBandeja(naBandeja([], lancamentoDoTeste({ valor: 7 })), lancamentoDoTeste({ valor: 7 })); return x[0].n !== x[1].n; })());
}

sec("§6 o dado falso não pousa");
{
  t("face desconhecida (d7)", lancamento({ dados: [{ faces: 7, valor: 3 }] }) === null);
  t("valor fora da face (21 num d20)", lancamento({ dados: [{ faces: 20, valor: 21 }] }) === null);
  t("valor zero", lancamento({ dados: [{ faces: 6, valor: 0 }] }) === null);
  t("NaN", lancamento({ dados: [{ faces: 20, valor: NaN }] }) === null);
  t("só dados postos de lado não fazem lançamento", lancamento({ dados: [{ faces: 20, valor: 5, posto: true }] }) === null);
  t("papel desconhecido cai no teste", lancamento({ papel: "x", dados: [{ faces: 6, valor: 2 }] }).papel === "teste");
  t("todas as faces da tabela são aceites", A_BANDEJA.faces.every((f) => lancamento({ dados: [{ faces: f, valor: 1 }] })));
}

sec("§7 o teto e os nomes");
{
  const muitos = lancamentoDaSerie("Marcha forçada", Array.from({ length: 9 }, (_, i) => ({ rolo: i + 2, cd: 10, passou: true })));
  /* MOVIDA em 04/11 (a spec da bandeja, Mesa C): o teto desceu de 6 para 5, o que cabe na faixa a 48 px; a intenção fica — o resto é «+N» */
  t(`no máximo ${A_BANDEJA.tetoDeDados} dados à vista; o resto é «+N»`, muitos.dados.length === A_BANDEJA.tetoDeDados && muitos.alem === 9 - A_BANDEJA.tetoDeDados && aLinhaDoLancamento(muitos).includes(`(+${9 - A_BANDEJA.tetoDeDados})`), aLinhaDoLancamento(muitos));
  t("cada desfecho tem nome, e o livre é calado", NOME_DO_DESFECHO.critico === "crítico" && NOME_DO_DESFECHO.falha === "falhou" && NOME_DO_DESFECHO.livre === "");
  t("a linha não fala do sistema (nem «rolagem», nem «sistema»)", !/rolagem|sistema|bandeja/i.test(aLinhaDoLancamento(lancamentoDoTeste({ valor: 5, dc: 9, rotulo: "Escalar" }))));
  /* MOVIDA em 04/11 (a spec da bandeja, Mesa C): o tempo do movimento saiu do motor para MOVIMENTO_DO_DADO (estilo.js) — é forma, não lance; a suíte da mesa C prende-o */
  t("o motor não guarda tempo de animação", A_BANDEJA.rolarMs === undefined && A_BANDEJA.pousoMs === undefined);
}

console.log(`\na bandeja: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
