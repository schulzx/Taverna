/* ETAPA 9 — o equipamento pela FORMA.

   A pergunta do jogador, palavra por palavra: "uma classe que não
   consegue usar um machado conseguiria provavelmente usar uma varinha, e
   ao ver varinha ele acharia que o item realmente fosse uma varinha, mas
   na verdade o sistema vê como um machado".

   Este teste existe para provar que isso não acontece, e ele mede as
   duas direções do medo:

   · um nome do balde das varinhas NUNCA sai numa arma marcial;
   · e renomear a varinha do Mago não tira a proficiência dele nela.

   A segunda é a que eu quase deixei passar: `avaliarEquipar` comparava
   os `extras` do Mago contra o NOME de tela, e o reskin teria tirado o
   treino do Mago na própria varinha dele. A promessa falsa, invertida. */
import { FORMAS, formaPorId, formaDoItem, fichaDoItem, avaliarEquipar, CAT_ARMA, CAT_ARMADURA, PROFICIENCIAS } from "../src/itens.js";
import { FORMAS_DO_EQUIPAMENTO, garantirLexico, nomesDaForma, temEquipamentoProprio, pedidoDoLexico } from "../src/lexico.js";
import { BASES, gerarLoot, RARIDADES } from "../src/loot.js";

let ok = 0, bad = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; } else { bad++; console.log("  FALHOU: " + nome + (extra ? " — " + extra : "")); } };

/* um mundo de bruxos, com nomes que o balde certo torna seguros */
const MUNDO = {
  arma_leve_uma: ["Estilete de Prata", "Punhal Rúnico", "Lâmina de Bolso"],
  arma_simples_uma: ["Bordão Ferrado", "Vara de Espinho", "Bastão Curto"],
  arma_simples_dist: ["Zarabatana de Osso", "Funda Trançada", "Arco de Salgueiro"],
  arma_marcial_uma: ["Sabre de Duelo", "Espada de Aurores", "Florete Marcado"],
  arma_marcial_duas: ["Cajado de Guerra", "Báculo de Batalha", "Malho de Pedra"],
  arma_marcial_dist: ["Balestra Encantada", "Arco Longo de Teixo", "Fuzil de Prata"],
  foco_uma: ["Varinha de Sabugueiro", "Varinha de Azevinho", "Anel Focal"],
  foco_duas: ["Cajado Focal", "Bordão do Círculo", "Vara Longa Rúnica"],
  escudo: ["Broquel de Duelo", "Escudo Rúnico", "Anteparo de Vidro"],
  armadura_panos: ["Túnica de Aula", "Manto Simples", "Veste Leve"],
  armadura_leve: ["Sobretudo de Couro", "Manto Reforçado", "Casaco de Viagem"],
  armadura_media: ["Sobrecasaca Encantada", "Colete de Escamas", "Peitoral Rúnico"],
  armadura_pesada: ["Vestes de Duelo Reforçadas", "Manto de Aurores", "Armadura Ritual"],
  elmo: ["Chapéu Pontudo", "Capuz de Aula", "Elmo Rúnico"],
  botas: ["Botas de Dragão", "Sapatos de Duelo", "Coturnos Rúnicos"],
  anel: ["Anel de Signo", "Aro de Prata", "Elo Encantado"],
  amuleto: ["Vira-Tempo", "Medalha do Círculo", "Talismã de Osso"],
};
const lex = garantirLexico({ equipamento: MUNDO });

console.log("== AS DUAS LISTAS BATEM ==");
t("toda forma mecânica está na lista do léxico",
  FORMAS.every((f) => FORMAS_DO_EQUIPAMENTO.includes(f.id)),
  FORMAS.filter((f) => !FORMAS_DO_EQUIPAMENTO.includes(f.id)).map((f) => f.id).join(", "));
t("e nenhuma forma do léxico é inventada",
  FORMAS_DO_EQUIPAMENTO.every((id) => !!formaPorId(id)),
  FORMAS_DO_EQUIPAMENTO.filter((id) => !formaPorId(id)).join(", "));
t("nenhum id repetido", new Set(FORMAS.map((f) => f.id)).size === FORMAS.length);
t("toda forma diz o que ela é", FORMAS.every((f) => f.o && f.o.length > 10 && typeof f.de === "function"));

console.log("\n== TODA BASE DO JOGO CAI NUM BALDE ==");
/* uma base sem forma seria um item sem nome deste mundo — e ela sairia
   com o nome de catálogo no meio de tudo renomeado, que é pior que não
   renomear nada */
const semForma = [];
const porBalde = {};
for (const [slot, lista] of Object.entries(BASES)) {
  for (const b of lista) {
    const f = formaDoItem({ nome: b.nome, tipo: slot });
    if (!f) semForma.push(`${b.nome} (${slot})`);
    else porBalde[f] = (porBalde[f] || 0) + 1;
  }
}
t("nenhuma base do catálogo fica sem forma", semForma.length === 0, semForma.join(", "));
t("e nenhum balde fica vazio", FORMAS.every((f) => porBalde[f.id] > 0),
  FORMAS.filter((f) => !porBalde[f.id]).map((f) => f.id).join(", "));

console.log("\n== O MEDO DO JOGADOR: UM NOME NUNCA APARECE NO BALDE ERRADO ==");
/* dez mil itens, e nenhum nome pode aparecer numa forma que não é a dele */
const donoDoNome = {};
for (const [forma, nomes] of Object.entries(MUNDO)) for (const nm of nomes) donoDoNome[nm] = forma;
let fora = 0, gerados = 0;
const exemplos = [];
for (let i = 0; i < 10000; i++) {
  const it = gerarLoot(RARIDADES[i % 5], { nivel: 1 + (i % 20), lex });
  gerados++;
  const forma = formaDoItem(it);
  /* o nome pode vir com prefixo e sufixo; o que interessa é qual dos
     nomes do banco está dentro dele */
  const achado = Object.keys(donoDoNome).find((nm) => it.nome.includes(nm));
  if (!achado) { fora++; exemplos.push("sem banco: " + it.nome); continue; }
  if (donoDoNome[achado] !== forma) {
    bad++;
    if (exemplos.length < 5) exemplos.push(`${it.nome} é ${forma} mas "${achado}" mora em ${donoDoNome[achado]}`);
  }
}
t("nenhum item saiu sem nome do mundo", fora === 0, exemplos.slice(0, 3).join(" | "));
t("nenhum nome apareceu num balde que não é o dele", exemplos.filter((x) => x.includes("mora em")).length === 0,
  exemplos.filter((x) => x.includes("mora em")).join(" | "));
console.log(`      ${gerados} itens gerados · todos com nome do mundo e no balde certo`);

console.log("\n== A VARINHA NÃO VIRA MACHADO, E O MACHADO NÃO VIRA VARINHA ==");
/* a forma é lida da BASE, não do nome — é isso que impede o desastre */
const machado = gerarLoot("comum", { tipo: "arma", lex });
let umMarcialDuas = null, umFoco = null;
for (let i = 0; i < 3000 && (!umMarcialDuas || !umFoco); i++) {
  const it = gerarLoot("comum", { tipo: "arma", lex });
  const f = formaDoItem(it);
  if (f === "arma_marcial_duas") umMarcialDuas = it;
  if (f === "foco_uma" || f === "foco_duas") umFoco = it;
}
t("existe arma marcial de duas mãos neste mundo", !!umMarcialDuas);
t("existe foco de conjurar neste mundo", !!umFoco);
if (umMarcialDuas) {
  console.log(`      marcial de duas mãos: "${umMarcialDuas.nome}" (base ${umMarcialDuas.base})`);
  t("e o nome dela NÃO é uma varinha", !/varinha/i.test(umMarcialDuas.nome),
    "é exatamente o desastre que o desenho existe para impedir");
  t("a ficha continua sabendo que é marcial", fichaDoItem(umMarcialDuas).cat === "marcial_corpo");
  t("e que ocupa as duas mãos", fichaDoItem(umMarcialDuas).mao === 2);
}
if (umFoco) {
  console.log(`      foco: "${umFoco.nome}" (base ${umFoco.base})`);
  t("a ficha sabe que é foco arcano", fichaDoItem(umFoco).cat === "arcana");
}

console.log("\n== O MEDO INVERTIDO: O MAGO NÃO PERDE A VARINHA DELE ==");
/* `avaliarEquipar` comparava os `extras` do Mago contra o NOME de tela.
   Com o reskin, "Varinha Rúnica" viraria "Varinha de Sabugueiro" e o
   Mago perderia a proficiência na própria varinha. */
const mago = { classe: "Mago", nivel: 5, atributos: { forca: 0 }, habilidades: [] };
const varinhaCanon = { nome: "Varinha Rúnica", base: "Varinha Rúnica", tipo: "arma" };
const varinhaMundo = { nome: "Varinha de Sabugueiro", base: "Varinha Rúnica", tipo: "arma" };
const semTreino = (r) => (r.penalidades || []).some((x) => /não tem treino/.test(x.texto));
t("o Mago é treinado na varinha de catálogo", !semTreino(avaliarEquipar(mago, varinhaCanon)));
t("e continua treinado nela renomeada", !semTreino(avaliarEquipar(mago, varinhaMundo)),
  "se falhar, o reskin tirou a proficiência do Mago na própria varinha dele");
const espadaMundo = { nome: "Sabre de Duelo", base: "Espada Longa", tipo: "arma" };
t("mas o Mago NÃO ganha treino numa espada só por ela ter nome bonito", semTreino(avaliarEquipar(mago, espadaMundo)));

console.log("\n== A FICHA NUNCA MENTE ==");
for (const [forma, nomes] of Object.entries(MUNDO)) {
  const canon = Object.entries(BASES).flatMap(([slot, l]) => l.map((b) => ({ ...b, slot })))
    .find((b) => formaDoItem({ nome: b.nome, tipo: b.slot }) === forma);
  if (!canon) continue;
  const disfarcado = { nome: nomes[0], base: canon.nome, tipo: canon.slot };
  const a = fichaDoItem({ nome: canon.nome, tipo: canon.slot });
  const b = fichaDoItem(disfarcado);
  t(`${forma}: renomeado mantém a família`, a.familia === b.familia);
  t(`${forma}: mantém a categoria`, a.cat === b.cat);
  t(`${forma}: mantém as mãos`, (a.mao || 0) === (b.mao || 0));
  t(`${forma}: mantém as propriedades`, JSON.stringify(a.props) === JSON.stringify(b.props));
  t(`${forma}: e o rótulo mecânico continua o mesmo`, a.rotulo === b.rotulo);
  t(`${forma}: a ficha mostra a base de verdade`, b.base === canon.nome);
}

console.log("\n== TUDO OU NADA ==");
t("banco completo vale", temEquipamentoProprio(lex));
t("e devolve nomes", nomesDaForma(lex, "foco_uma").length >= 3);
const faltandoUma = { ...MUNDO };
delete faltandoUma.armadura_pesada;
const lexTorto = garantirLexico({ equipamento: faltandoUma });
t("faltando UMA forma, o banco inteiro cai", !temEquipamentoProprio(lexTorto));
t("e nenhuma outra forma sobrevive", nomesDaForma(lexTorto, "foco_uma").length === 0,
  "meio catálogo renomeado lê como mundo quebrado");
const poucos = { ...MUNDO, elmo: ["Só Um"] };
t("uma forma com menos de três nomes também derruba o banco",
  !temEquipamentoProprio(garantirLexico({ equipamento: poucos })),
  "com um nome só, todo elmo do mundo se chamaria a mesma coisa");
t("sem léxico, o campo existe vazio", Object.keys(garantirLexico(null).equipamento).length === 0);
t("e o item nasce com o nome de catálogo", !!gerarLoot("comum", { tipo: "arma" }).nome);
t("e ainda assim carrega a base", !!gerarLoot("comum", { tipo: "arma" }).base);

console.log("\n== SAVE ANTIGO NÃO QUEBRA ==");
/* itens de antes da v9.111 não têm `base`, e a dedução pelo nome tem de
   continuar valendo — senão toda campanha em curso perde a mecânica dos
   itens que já estão na mochila */
const antigo = { nome: "Montante Flamejante da Víbora", tipo: "arma" };
const fa = fichaDoItem(antigo);
t("item sem base ainda é classificado", fa.cat === "marcial_corpo");
t("e a base cai no próprio nome", fa.base === antigo.nome);
t("a forma sai certa mesmo sem base", formaDoItem(antigo) === "arma_marcial_duas");
t("string solta continua funcionando", fichaDoItem("Adaga").cat === "simples_corpo");
for (const lixo of [null, undefined, 0, "", {}, { nome: 3 }, []]) {
  try { fichaDoItem(lixo); formaDoItem(lixo); ok++; }
  catch (e) { bad++; console.log("  FALHOU: quebrou com " + JSON.stringify(lixo) + " — " + e.message); }
}

console.log("\n== O PEDIDO AO MESTRE ==");
const pedido = pedidoDoLexico({ genero: "Fantasia medieval", descricao: "escola de bruxos" });
t("o pedido tem o campo", pedido.includes('"equipamento"'));
t("e lista todas as formas", FORMAS.every((f) => pedido.includes(`"${f.id}"`)),
  FORMAS.filter((f) => !pedido.includes(`"${f.id}"`)).map((f) => f.id).join(", "));
t("e diz a afordância de cada uma", FORMAS.every((f) => pedido.includes(f.o)));
t("o pedido avisa que é tudo ou nada", /banco inteiro é descartado/.test(pedido));
t("e proíbe o nome contradizer a forma", /NÃO PODE CONTRADIZER/.test(pedido));
t("e explica por que a escada não pode ter buraco", /escada e tirar um degrau|numa escada/.test(pedido));
/* a ORDEM, e não o número: cada regra nova entra no meio e a numeração
   anda. Isto já quebrou três testes por motivo nenhum. */
const ordemDasRegras = ["O EQUIPAMENTO É TUDO OU NADA", "PREENCHA TODOS OS DEGRAUS DE AMEAÇA", "Português do Brasil"].map((x) => pedido.indexOf(x));
t("as regras aparecem na ordem certa", ordemDasRegras.every((x, i) => x > 0 && (i === 0 || x > ordemDasRegras[i - 1])), ordemDasRegras.join(","));
console.log(`      pedido: ${pedido.length} caracteres`);

console.log("\n== O DETERMINISMO DO MERCADOR ==");
/* o estoque de um mercador é semeado: a mesma banca tem sempre as mesmas
   peças. Nomear pelo mundo não pode desmanchar isso. */
const { rngDe } = await import("../src/geografia.js").catch(() => ({ rngDe: null }));
if (rngDe) {
  const a = gerarLoot("raro", { tipo: "arma", nivel: 5, rnd: rngDe("mesma|banca"), lex });
  const b = gerarLoot("raro", { tipo: "arma", nivel: 5, rnd: rngDe("mesma|banca"), lex });
  t("a mesma semente dá o mesmo item", a.nome === b.nome && a.base === b.base, `${a.nome} vs ${b.nome}`);
  const c = gerarLoot("raro", { tipo: "arma", nivel: 5, rnd: rngDe("outra|banca"), lex });
  t("e sementes diferentes dão itens diferentes", a.nome !== c.nome || a.base !== c.base);
}

console.log(`\n${ok} passaram · ${bad} falharam`);
process.exit(bad ? 1 : 0);
