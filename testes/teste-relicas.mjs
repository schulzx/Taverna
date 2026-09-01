/* teste-relicas.mjs (v9.82) — o degrau acima do lendário.

   "Podem existir os itens únicos, que são acima dos lendários, e estes
   tenham um poder ativo — tipo 'uma vez ao dia essa lâmina se alimenta
   do seu inimigo e enche seu PV'. Podem existir habilidades únicas que
   só são adquiridas ao adquirir um item único. Assim um personagem
   nível 20 pode conseguir batalhar com um semideus com mais facilidade."

   A metade que importa desta suíte é a MEDIDA da pimenta: uma relíquia
   deve fazer um nível 20 encarar um semideus com mais CHANCE, não com
   garantia. Por isso o ativo é uma vez por dia e nunca resolve a luta
   sozinho — devolve fôlego, compra um turno, tira uma condição. */
import {
  RELIQUIAS, reliquiaPorId, reliquiaPorNome, reliquiasDoSlot, itemDaReliquia,
  atributosDaReliquia, garantirGastos, usadaHoje, reliquiasEquipadas,
  podeUsarAtivo, usarAtivo, ativoDeclarado, falaDoAtivoNegado,
  envelopeDoAtivo, envelopeDaReliquiaAchada, RX_ATIVA,
} from "../src/relicas.js";
import { TIER, DEGRAUS, degrauDe, LEITOR_DO_EFEITO } from "../src/afixos.js";
import { RARIDADES, RARIDADE_ROTULO, essenciaDe } from "../src/loot.js";
import { magiaPorNome } from "../src/grimorio.js";
import { CONDICOES } from "../src/condicoes.js";
import { danoExtraDeDadiva, imuneA, vantagemDeItem, iniciativaDeItem, descontoDePM } from "../src/dadivas.js";
import { pedeSintonia } from "../src/sintonia.js";
import { temOPoder } from "../src/poderes.js";
import { PORTAS_DO_TURNO, decidirTurno } from "../src/turno.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const comRelica = (rel, extra = {}) => {
  const it = itemDaReliquia(rel);
  return {
    nivel: 20, vida: 60, vidaMax: 200, mana: 10, manaMax: 60,
    condicoes: [], efeitos: [], dadivas: [], relicaGastos: {},
    equipados: { [rel.tipo]: it }, equipamento: [it], sintonizados: [it.nome],
    ...extra,
  };
};

sec("1. O DEGRAU EXISTE, E É O ÚLTIMO");
{
  t("único está nas raridades", RARIDADES.includes("unico"));
  t("e tem rótulo", RARIDADE_ROTULO.unico === "Único");
  t("e é o degrau mais alto", TIER.unico === 5 && TIER.unico > TIER.lendario);
  t("o degrau está declarado", !!degrauDe("unico") && degrauDe("unico").escrito === true);
  /* ELE NÃO É SORTEADO: não compra poderes do catálogo geral, porque os
     dele são escritos junto com a peça */
  t("não compra poder do catálogo geral", degrauDe("unico").quantos === 0);
  /* E NÃO ENTRA NA FORJA: desmontar a única que existe para virar pó seria
     destruir uma peça do mundo por vinte de essência. */
  t("desmontar não rende essência", essenciaDe({ raridade: "unico" }) === 0);
}

sec("2. O CATÁLOGO — escrito à mão, e cada uma é uma só");
{
  t("há relíquias", RELIQUIAS.length >= 8);
  t("os ids são únicos", new Set(RELIQUIAS.map((r) => r.id)).size === RELIQUIAS.length);
  t("os nomes também", new Set(RELIQUIAS.map((r) => r.nome)).size === RELIQUIAS.length);
  t("toda relíquia tem história", RELIQUIAS.every((r) => r.historia && r.historia.length > 25));
  t("toda relíquia tem dois passivos", RELIQUIAS.every((r) => r.poderes.length === 2));
  t("e um gesto", RELIQUIAS.every((r) => r.ativo && r.ativo.nome && r.ativo.efeito));
  t("cobre vários slots", new Set(RELIQUIAS.map((r) => r.tipo)).size >= 5);
  t("busca por nome funciona", reliquiaPorNome("A Comedora de Reis").id === "comedora");
  t("e por slot", reliquiasDoSlot("arma").length >= 2);

  /* A TRAVA DA v9.80, e ela vale aqui também: passivo com campo sem leitor
     é enfeite. Os passivos das relíquias não estão em `PODERES`, mas falam
     o mesmo vocabulário — e é a tabela de leitores que garante isso. */
  for (const r of RELIQUIAS) {
    for (const p of r.poderes) {
      const campos = Object.keys(p.efeito || {});
      t(`${r.nome} · ${p.nome}: todo efeito tem leitor`, campos.length > 0 && campos.every((c) => !!LEITOR_DO_EFEITO[c]));
    }
  }
  /* e a concessão continua saindo do grimório, nunca inventada */
  for (const r of RELIQUIAS.filter((x) => x.concede)) t(`${r.nome} concede algo que existe`, !!magiaPorNome(r.concede));
  /* o que o ativo limpa tem de ser condição de verdade */
  for (const r of RELIQUIAS) {
    for (const c of (r.ativo.efeito.limpa || [])) t(`${r.nome}: "${c}" é condição do jogo`, !!CONDICOES[c]);
  }
}

sec("3. O ITEM PRONTO — o resto do jogo o lê sem saber que é especial");
{
  const rel = reliquiaPorId("comedora");
  const it = itemDaReliquia(rel);
  t("vem com a raridade certa", it.raridade === "unico");
  t("com os passivos", it.poderes.length === 2);
  t("com o gesto marcado", it.ativo && it.ativo.id === "comedora");
  t("e com a história na descrição", it.descricao === rel.historia);
  t("os atributos foram dobrados", (it.atributos.presenca || 0) >= 3);
  t("pede sintonia sempre", pedeSintonia(it) === true);
  t("a linha do jogador mostra o gesto", /◈ Banquete \(uma vez por dia\)/.test(it.poder));

  /* e os leitores de sempre respondem — o mesmo caminho do lendário */
  const p = comRelica(rel);
  t("o dano extra é lido", danoExtraDeDadiva(p) === 5);
  t("a imunidade é lida", imuneA(p, "amedrontado") === true);
  t("sem sintonia, tudo dorme", danoExtraDeDadiva({ ...p, sintonizados: [] }) === 0);

  const olho = reliquiaPorId("olho_do_afogado");
  const po = comRelica(olho);
  t("o desconto de PM é lido", descontoDePM(po) === 2);
  t("a vantagem é lida", vantagemDeItem(po, "intelecto") === true);
  t("e a concessão entra na ficha", temOPoder(po, olho.concede));
  const arg = comRelica(reliquiaPorId("ultimo_argumento"));
  t("a iniciativa é lida", iniciativaDeItem(arg) === 5);
}

sec("4. O GESTO — uma vez por dia, e a pimenta é medida");
{
  const rel = reliquiaPorId("comedora");
  const p = comRelica(rel, { vida: 40, condicoes: [{ id: "sangrando", nome: "Sangrando" }] });
  t("pode usar de manhã", podeUsarAtivo(p, rel, { dia: 7 }).pode === true);

  const r = usarAtivo(p, rel, { dia: 7 });
  t("curou metade do corpo", r.pers.vida === 40 + Math.round(200 * 0.5));
  t("e tirou a condição", r.pers.condicoes.length === 0);
  t("a linha diz o que aconteceu", /Banquete/.test(r.texto) && /PV/.test(r.texto));
  t("a ficha original não foi tocada", p.vida === 40 && p.condicoes.length === 1);

  /* UMA VEZ POR DIA, e o contador é do DIA da campanha — descanso se
     força, dia não. Sem isso a relíquia vira um botão de "recuperar tudo"
     apertado três vezes na mesma luta. */
  t("marcou o uso do dia", usadaHoje(r.pers, rel.id, 7) === true);
  t("no mesmo dia, não sai de novo", podeUsarAtivo(r.pers, rel, { dia: 7 }).pode === false);
  t("e a recusa explica", /já foi usado hoje/.test(podeUsarAtivo(r.pers, rel, { dia: 7 }).porque));
  t("amanhã sai", podeUsarAtivo(r.pers, rel, { dia: 8 }).pode === true);
  t("sem sintonia, não sai", podeUsarAtivo(p, rel, { dia: 7, sintonizado: false }).pode === false);
  t("e a recusa diz por quê", /dormente/.test(podeUsarAtivo(p, rel, { dia: 7, sintonizado: false }).porque));

  /* a cura nunca passa do teto, e o buff não empilha com ele mesmo */
  const cheio = usarAtivo(comRelica(rel, { vida: 195 }), rel, { dia: 1 });
  t("a cura respeita o teto", cheio.pers.vida === 200);
  const argRel = reliquiaPorId("ultimo_argumento");
  const b1 = usarAtivo(comRelica(argRel), argRel, { dia: 1 });
  const b2 = usarAtivo(b1.pers, argRel, { dia: 2 });
  t("o buff não duplica", b2.pers.efeitos.filter((e) => e.nome === "Ponto Final").length === 1);

  /* e o que reergue quem caiu funciona a 0 PV — é a peça que faz um nível
     20 encarar um semideus com mais CHANCE, não com garantia */
  const lamp = reliquiaPorId("lampada_do_pacto");
  const caido = usarAtivo(comRelica(lamp, { vida: 0, morrendo: true }), lamp, { dia: 3 });
  t("a Lâmpada reergue quem caiu", caido.pers.vida > 0 && caido.pers.morrendo === false);

  /* A MEDIDA: nenhum ativo mata, atordoa ou vence a luta sozinho. O que
     eles fazem é devolver fôlego, comprar um turno, tirar uma condição. */
  const campos = new Set(RELIQUIAS.flatMap((r2) => Object.keys(r2.ativo.efeito || {})));
  t("o vocabulário do ativo é pequeno e fechado", [...campos].every((c) => ["curaFracao", "manaFracao", "limpa", "buff", "revive"].includes(c)));
  t("nenhum ativo cura o corpo inteiro de uma vez", RELIQUIAS.every((r2) => (r2.ativo.efeito.curaFracao || 0) <= 0.6));
}

sec("5. O QUE O JOGADOR ESCREVE");
{
  const rel = reliquiaPorId("comedora");
  const p = comRelica(rel);
  t("pelo nome do gesto", (ativoDeclarado("uso o Banquete", p) || {}).rel.id === "comedora");
  t("ou pelo nome da relíquia", (ativoDeclarado("aciono A Comedora de Reis", p) || {}).rel.id === "comedora");
  t("com outro verbo de acionar", (ativoDeclarado("desperto o Banquete", p) || {}).rel.id === "comedora");
  /* sem verbo, é conversa: falar do nome não é acioná-la */
  t("falar dela não é acioná-la", ativoDeclarado("pergunto sobre A Comedora de Reis", p) === null);
  t("frase comum não aciona nada", ativoDeclarado("converso com o taverneiro", p) === null);
  /* e só vale o que está NO CORPO: a relíquia na mochila não responde */
  t("na mochila, não responde", ativoDeclarado("uso o Banquete", { ...p, equipados: {} }) === null);
  t("de outra relíquia, também não", ativoDeclarado("uso o Vencimento", p) === null);
}

sec("6. os envelopes e a porta");
{
  const rel = reliquiaPorId("comedora");
  const env = envelopeDoAtivo(rel, "◈ A Comedora de Reis — Banquete: +100 PV");
  t("crava que o sistema já resolveu", /JÁ RESOLVIDA PELO SISTEMA/.test(env));
  t("proíbe dobrar o efeito", /NÃO mande vida, mana, condições nem itens/.test(env));
  t("proíbe deixar usar de novo hoje", /NÃO deixe usar de novo hoje/.test(env));
  t("e manda tratar como peça única", /existe UMA no mundo/.test(env));
  const ach = envelopeDaReliquiaAchada(rel);
  t("o achado proíbe uma segunda igual", /NÃO crie uma segunda igual/.test(ach));
  t("e proíbe inventar propriedades", /NÃO invente outras propriedades/.test(ach));
  t("sem relíquia não há envelope", envelopeDoAtivo(null) === "" && envelopeDaReliquiaAchada(null) === "");

  t("a porta existe", PORTAS_DO_TURNO.some((x) => x.id === "reliquia"));
  const base = {
    ehComando: false, temEscolhaPendente: false, declarouPoderQueNaoTem: false, vaiConsumir: false,
    vaiAcionarReliquia: false, ehConjuracao: false, ehPortal: false, ehEntradaEmMasmorra: false,
    ehSeguirViagem: false, ehPartidaPorNome: false, querPartir: false, temAlvoLocal: false,
    ehAgressao: false, ehDesafio: false, ehPerguntaAoMundo: false, temMilagreArmado: false,
    temHabilidadesSelecionadas: false, emCombate: false, emViagem: false, bloqueado: false,
  };
  t("o gesto vai para ela", decidirTurno({ ...base, vaiAcionarReliquia: true }).id === "reliquia");
  /* vem ANTES do frasco e da magia: há UMA Comedora de Reis no mundo, e
     quem escreve o nome dela não está pedindo outra coisa */
  t("ganha do consumível", decidirTurno({ ...base, vaiAcionarReliquia: true, vaiConsumir: true }).id === "reliquia");
  t("e da conjuração", decidirTurno({ ...base, vaiAcionarReliquia: true, ehConjuracao: true }).id === "reliquia");
  t("mas não do comando de autor", decidirTurno({ ...base, vaiAcionarReliquia: true, ehComando: true }).id === "comando");
}

console.log(`\nrelíquias v9.82: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
