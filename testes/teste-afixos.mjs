/* teste-afixos.mjs (v9.80) — "item lendário tem de ser lendário".

   Dois relatos, e são o mesmo defeito visto de dois lados:

     "Apareceu no mercado uma bota lendária de asas, e a raridade dela
     era comum."

     "Os itens não têm efeitos, apenas atributos. Se um item dá apenas
     atributo, não faz diferença qual item eu uso."

   A metade que mais importa aqui é a ÚLTIMA seção: todo campo de efeito
   tem de ter um leitor. O defeito que esta versão consertou era
   exatamente um campo sem leitor — o `poder` de texto, bonito e inerte. */
import {
  TIER, DEGRAUS, degrauDe, PESO_DO_PREFIXO, pesoDoPrefixo, TIER_DA_BASE, tierDaBase,
  PODERES, poderPorId, poderesPossiveis, CONCESSOES, CONCESSAO_DA_BASE, concessaoPara,
  LEITOR_DO_EFEITO, EFEITOS_DE_ATRIBUTO, EFEITOS_NO_ITEM, linhasDoItem, resumoDoItem,
} from "../src/afixos.js";
import { gerarLoot, BASES, PREFIXOS } from "../src/loot.js";
import { magiaPorNome } from "../src/grimorio.js";
import { danoExtraDeDadiva, ataquesExtras, descontoDePM, criticoMinimo, dobraMovimento, bonusSocialDeDadiva, poderesDeItem, imuneA, vantagemDeItem, iniciativaDeItem } from "../src/dadivas.js";
import { resistenciasEquipadas } from "../src/danos.js";
import { pedeSintonia } from "../src/sintonia.js";
import { temOPoder, entradaNaFicha, lerPoder, habilidadeDeclarada } from "../src/poderes.js";
import { estaPreparada, concedidaPorItem } from "../src/magias.js";
import { bonusEquip } from "../src/regras-jogo.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

const MIL = (r, tipo, nivel = 8) => Array.from({ length: 200 }, () => gerarLoot(r, { tipo, nivel }));

sec("1. O NOME NÃO PROMETE O QUE A RARIDADE NÃO PAGA");
{
  /* "Apareceu no mercado uma bota lendária de asas, e a raridade dela era
     comum." Duas fontes soltas mentiam ao mesmo tempo: a lista de prefixos
     tinha "Lendário" ao lado de "Rústico" com o mesmo peso, e a de bases
     tinha "Botas Aladas" ao lado de "Botas de Couro", também com o mesmo. */
  for (const r of ["comum", "incomum"]) {
    const lote = MIL(r, "botas");
    t(`${r}: nenhuma Bota Alada`, !lote.some((i) => /Alada/.test(i.nome)));
    t(`${r}: nenhum prefixo "Lendário"`, !lote.some((i) => /Lendári/.test(i.nome)));
  }
  const comuns = MIL("comum", "armadura");
  t("comum: nenhuma Armadura de Couro de Dragão", !comuns.some((i) => /Dragão/.test(i.nome)));
  t("comum: nada de Celestial nem Abissal", !comuns.some((i) => /Celestial|Abissal/.test(i.nome)));

  /* e o outro lado: o degrau alto ALCANÇA as bases e os prefixos que
     promete, senão a correção teria sido só uma perda */
  const lend = MIL("lendario", "botas");
  t("lendário alcança a Bota Alada", lend.some((i) => /Alada/.test(i.nome)));
  t("e alcança os prefixos grandes", MIL("lendario", "arma").some((i) => /Lendári|Celestial|Abissal/.test(i.nome)));

  t("todo prefixo tem peso declarado", PREFIXOS.every((p) => PESO_DO_PREFIXO[p[0]] !== undefined));
  t("e o peso é um degrau que existe", Object.values(PESO_DO_PREFIXO).every((v) => v >= 0 && v <= 4));
  t("toda base com tier mínimo existe mesmo", Object.keys(TIER_DA_BASE).every((n) => Object.values(BASES).flat().some((b) => b.nome === n)));
}

sec("2. O QUE CADA DEGRAU COMPRA");
{
  const conta = (r, tipo) => MIL(r, tipo).map((i) => (i.poderes || []).length);
  t("comum não compra poder nenhum — é o piso, e ele tem de existir",
    conta("comum", "arma").every((n) => n === 0));
  t("incomum compra um", conta("incomum", "arma").every((n) => n === 1));
  t("raro compra um", conta("raro", "arma").every((n) => n === 1));
  t("épico compra dois", conta("epico", "arma").every((n) => n === 2));
  t("lendário compra dois", conta("lendario", "arma").every((n) => n === 2));
  /* v9.81: e no lendário os DOIS são fortes. O épico compra "dois, e um
     deles pesa"; o lendário não pode sair com um traço menor no segundo
     lugar — "Passo Largo + Passo Leve" numa peça de lenda lê como um item
     bom com um enfeite ao lado. */
  t("e os dois do lendário pesam", ["arma","armadura","elmo","botas","anel","amuleto","escudo"]
    .every((tipo) => MIL("lendario", tipo).every((i) => i.poderes.every((x) => poderPorId(x.id).forte))));

  /* o primeiro poder de raro para cima é FORTE — sem isto o épico podia
     sair com dois traços menores e valer menos que um raro */
  const fortes = MIL("raro", "arma").every((i) => poderPorId(i.poderes[0].id).forte);
  t("de raro para cima, o primeiro poder é dos que mudam a conta", fortes);
  t("e o incomum nunca traz um forte", MIL("incomum", "arma").every((i) => !poderPorId(i.poderes[0].id).forte));
  t("ninguém repete o mesmo poder", MIL("epico", "anel").every((i) => new Set(i.poderes.map((p) => p.id)).size === i.poderes.length));
  for (const d of DEGRAUS) t(`o degrau "${d.id}" diz o que compra`, d.diz.length > 20);
}

sec("3. A CONCESSÃO — o que faz o lendário ser lendário");
{
  /* "uma bota lendária de asas que dá a habilidade Voo, e o player pode
     usá-la sem gastar PM" */
  t("só o lendário concede", MIL("epico", "botas").every((i) => !i.concede) && MIL("lendario", "botas").every((i) => !!i.concede));

  /* DO CATÁLOGO, e nunca inventada: quem executa é o mesmo caminho que
     executa qualquer habilidade da ficha. Um poder inventado aqui seria
     uma promessa que nenhum código cumpre — o defeito que esta versão
     veio consertar. */
  const todas = new Set([...Object.values(CONCESSOES).flat(), ...Object.values(CONCESSAO_DA_BASE)]);
  for (const n of todas) t(`"${n}" existe no grimório`, !!magiaPorNome(n));

  /* e o NOME concorda com o poder: a bota que voa é a Bota Alada */
  t("Botas Aladas concedem Voo", concessaoPara("botas", "Botas Aladas") === "Voo");
  t("o lendário prefere a base que promete", MIL("lendario", "botas").filter((i) => CONCESSAO_DA_BASE[i.nome.replace(/^\S+\s/, "").replace(/\s(do|da|dos|das)\s.*$/, "")]).length >= 0);
  t("nenhum lendário concede nada fora do grimório", MIL("lendario", "anel").every((i) => !!magiaPorNome(i.concede)));
}

sec("4. OS EFEITOS SÃO LIDOS — a metade que faltava por inteiro");
{
  /* O campo `poder` era TEXTO, e nenhuma linha de código o consultava. O
     que valia era só `atributos`, e atributo é a mesma coisa em qualquer
     raridade, só que maior. */
  const comEfeito = (campo, tipo) => {
    for (let i = 0; i < 400; i++) {
      const it = gerarLoot("epico", { tipo, nivel: 10 });
      if ((it.poderes || []).some((p) => p.efeito && p.efeito[campo])) return it;
    }
    return null;
  };
  const arma = comEfeito("danoExtra", "arma");
  t("existe arma com dano extra", !!arma);
  if (arma) {
    const p = { nivel: 10, equipados: { arma }, equipamento: [arma], sintonizados: [arma.nome], dadivas: [] };
    const esperado = arma.poderes.reduce((s, x) => s + (x.efeito.danoExtra || 0), 0);
    t("e o leitor do combate enxerga o dano extra", danoExtraDeDadiva(p) === esperado);
    /* A SINTONIA VALE PARA O PODER: item guardado ou não sintonizado serve
       de aço, mas o poder não responde — a mesma régua de `bonusEquip`. */
    t("sem sintonia, o poder dorme", danoExtraDeDadiva({ ...p, sintonizados: [] }) === 0);
    t("e na mochila também", danoExtraDeDadiva({ ...p, equipados: {} }) === 0);
  }
  const anel = comEfeito("bonusSocial", "anel");
  if (anel) {
    const p = { nivel: 10, equipados: { anel }, equipamento: [anel], sintonizados: [anel.nome], dadivas: [] };
    t("o bônus social do anel é lido", bonusSocialDeDadiva(p) > 0);
  }
  const botas = comEfeito("movimento", "botas");
  if (botas) {
    const p = { nivel: 10, equipados: { botas }, equipamento: [botas], sintonizados: [botas.nome], dadivas: [] };
    t("o passo largo dobra o movimento", dobraMovimento(p) === true);
  }

  /* O EFEITO DE ATRIBUTO é dobrado para dentro de `atributos`, onde
     `bonusEquip` já os soma há versões — manter uma segunda soma só para
     item seria dar duas réguas à mesma pergunta. */
  const doAtributo = (() => {
    for (let i = 0; i < 400; i++) {
      const it = gerarLoot("incomum", { tipo: "botas", nivel: 4 });
      const p = (it.poderes || [])[0];
      if (p && p.efeito.destreza) return it;
    }
    return null;
  })();
  if (doAtributo) {
    const p = { nivel: 4, atributos: {}, classe: "Guerreiro", equipados: { botas: doAtributo }, equipamento: [doAtributo], sintonizados: [] };
    t("o efeito de atributo entrou em `atributos`", (doAtributo.atributos.destreza || 0) >= 1);
    t("e `bonusEquip` o soma sem precisar de sintonia no incomum", bonusEquip(p, "destreza") >= 1);
  }
}

sec("5. A TRAVA DA TABELA — todo efeito tem de ter um leitor");
{
  /* A asserção mais importante desta peça. O defeito consertado aqui era
     um campo SEM leitor: um efeito novo escrito sem passar por esta
     tabela nasceria com o mesmo problema, e ninguém notaria — o item
     simplesmente não faria nada. */
  for (const p of PODERES) {
    const campos = Object.keys(p.efeito || {});
    t(`"${p.nome}": todo efeito tem leitor`, campos.length > 0 && campos.every((c) => !!LEITOR_DO_EFEITO[c]));
  }
  t("os de atributo estão declarados como tais",
    EFEITOS_DE_ATRIBUTO.every((c) => LEITOR_DO_EFEITO[c] === "bonusEquip"));
  t("todo poder diz alguma coisa ao jogador", PODERES.every((p) => p.diz.length > 20));
  t("e todo poder tem slot", PODERES.every((p) => p.slots.length > 0));
  t("poder forte nunca aparece abaixo de raro", PODERES.every((p) => !p.forte || p.tier >= 2));
  t("poderesPossiveis respeita o degrau", poderesPossiveis("arma", 0).every((p) => p.tier === 0));
}

sec("6. A SINTONIA MEDE O DEGRAU, NÃO O TEXTO");
{
  /* Enquanto `poder` era enfeite, "tem poder escrito" e "é raro" davam
     quase na mesma. Agora todo item de incomum para cima carrega uma
     linha de poder, e a régua antiga faria o couro comum ocupar um dos
     TRÊS lugares de sintonia — um teto que existe para as peças que
     mudam o jogo. */
  t("comum não pede sintonia", MIL("comum", "anel").every((i) => !pedeSintonia(i)));
  t("incomum também não", MIL("incomum", "anel").every((i) => !pedeSintonia(i)));
  t("raro pede", MIL("raro", "anel").every((i) => pedeSintonia(i)));
  t("lendário pede", MIL("lendario", "botas").every((i) => pedeSintonia(i)));
}

sec("7. O PODER CONCEDIDO ATRAVESSA A FICHA INTEIRA");
{
  const bota = (() => {
    for (let i = 0; i < 300; i++) { const b = gerarLoot("lendario", { tipo: "botas", nivel: 10 }); if (b.concede === "Voo") return b; }
    return null;
  })();
  t("dá para achar a bota que concede Voo", !!bota);
  const p = {
    nivel: 3, mana: 1, manaMax: 6, habilidades: [], preparadas: [], inventario: [], efeitos: [], condicoes: [], habRecarga: {},
    equipados: { botas: bota }, equipamento: [bota], sintonizados: [bota.nome],
  };
  t("a ficha reconhece o poder", temOPoder(p, "Voo"));
  /* sem isto, a conferência da v9.76 recusaria o próprio poder que o item
     acabou de dar — e o degrau lendário se anularia sozinho */
  t("e a conferência da ficha não o recusa", lerPoder("uso Voo", p) === null);
  t("o custo é ZERO, que é a promessa do item", entradaNaFicha(p, "Voo").custo === 0);
  t("e digitar o nome o executa", (habilidadeDeclarada("uso Voo", p) || {}).custo === 0);
  /* O CADERNO NÃO PODE BARRAR: Voo é magia preparável, e o herói nunca a
     aprendeu — dizer "não está preparada" seria devolver com uma mão o
     que o lendário deu com a outra. */
  t("o item É a preparação", concedidaPorItem(p, magiaPorNome("Voo")) === true);
  t("e o caderno deixa passar", estaPreparada(p, magiaPorNome("Voo")) === true);

  const semSint = { ...p, sintonizados: [] };
  t("sem sintonia, o poder some", !temOPoder(semSint, "Voo"));
  t("e a conferência volta a recusar", lerPoder("uso Voo", semSint).tipo === "poderQueNaoTenho");
  t("guardado na mochila, também", !temOPoder({ ...p, equipados: {} }, "Voo"));
}

sec("8. o que o jogador lê");
{
  const it = gerarLoot("lendario", { tipo: "botas", nivel: 10 });
  const l = linhasDoItem(it);
  t("uma linha por poder, mais a concessão", l.length === it.poderes.length + 1);
  t("a concessão vem em destaque", l[l.length - 1].startsWith("★"));
  t("e diz que não custa PM", /sem gastar PM/.test(l[l.length - 1]));
  t("o resumo entra no campo que a ficha já lia", it.poder.length > 10);
  t("item comum não inventa resumo", resumoDoItem({ poderes: [] }) === "");
}

sec("9. O ARSENAL (v9.81) — e a paleta que o tornou possível");
{
  /* "Prossiga com novas entradas para termos um arsenal gigante e
     diversificado." A tabela tinha vinte poderes para sete slots, e o
     limite não era falta de ideia: era falta de CAMPO. Com nove campos de
     efeito lidos, dois épicos do mesmo slot saíam iguais — e "item
     lendário tem de ser lendário" não se sustenta se todos os lendários
     forem o mesmo item com outro nome. */
  t("o arsenal é grande", PODERES.length >= 60);
  const porSlot = {};
  for (const p of PODERES) for (const s of p.slots) porSlot[s] = (porSlot[s] || 0) + 1;
  t("todo slot tem escolha de sobra", Object.values(porSlot).every((n) => n >= 7));
  t("e os sete slots estão cobertos", Object.keys(porSlot).length === 7);
  t("os ids não se repetem", new Set(PODERES.map((p) => p.id)).size === PODERES.length);
  t("nem os nomes", new Set(PODERES.map((p) => p.nome)).size === PODERES.length);

  /* cada degrau precisa ter DE ONDE escolher, ou o sorteio devolve sempre
     a mesma peça — que é o defeito com outro nome */
  for (const slot of Object.keys(porSlot)) {
    for (const tier of [1, 2, 3]) {
      const n = poderesPossiveis(slot, tier).filter((p) => (tier >= 2 ? p.forte : !p.forte)).length;
      t(`${slot} tem escolha no degrau ${tier}`, n >= 2);
    }
  }

  /* A PALETA. Os cinco campos novos são o que abriu o arsenal, e cada um
     se pendurou num gancho que já existia — não houve efeito inventado. */
  const campos = new Set(PODERES.flatMap((p) => Object.keys(p.efeito || {})));
  t("a paleta passou de nove campos", campos.size >= 14);
  for (const c of campos) t(`o campo "${c}" tem leitor declarado`, !!LEITOR_DO_EFEITO[c]);
  t("resist e elemento moram no item", EFEITOS_NO_ITEM.includes("resist") && EFEITOS_NO_ITEM.includes("elemento"));

  /* e os quatro leitores novos respondem de verdade, com a trava da
     sintonia valendo para todos */
  const acha = (campo, tipo, r = "epico") => {
    for (let i = 0; i < 800; i++) {
      const it = gerarLoot(r, { tipo, nivel: 12 });
      const pw = (it.poderes || []).find((p) => p.efeito[campo]);
      if (pw) return { it, pw };
    }
    return null;
  };
  const comFicha = (it, slot) => ({ nivel: 12, equipados: { [slot]: it }, equipamento: [it], sintonizados: [it.nome], dadivas: [] });

  const imu = acha("imunidades", "elmo");
  t("existe elmo que dá imunidade", !!imu);
  if (imu) {
    const cond = imu.pw.efeito.imunidades[0];
    t("e o leitor de imunidade responde", imuneA(comFicha(imu.it, "elmo"), cond) === true);
    t("sem sintonia, a imunidade dorme", imuneA({ ...comFicha(imu.it, "elmo"), sintonizados: [] }, cond) === false);
  }

  const van = acha("vantagem", "anel");
  t("existe anel que dá vantagem", !!van);
  if (van) {
    const attr = van.pw.efeito.vantagem[0];
    t("e o leitor de vantagem responde", vantagemDeItem(comFicha(van.it, "anel"), attr) === true);
    t("sem sintonia, a vantagem dorme", vantagemDeItem({ ...comFicha(van.it, "anel"), sintonizados: [] }, attr) === false);
    t("e ela não vale para outro atributo", vantagemDeItem(comFicha(van.it, "anel"), "percepcao") === (attr === "percepcao"));
  }

  const ini = acha("iniciativa", "arma");
  t("existe arma que adianta a iniciativa", !!ini);
  if (ini) {
    t("e o leitor soma", iniciativaDeItem(comFicha(ini.it, "arma")) > 0);
    t("sem sintonia, some", iniciativaDeItem({ ...comFicha(ini.it, "arma"), sintonizados: [] }) === 0);
  }

  /* RESISTÊNCIA E ELEMENTO não passam pelos leitores de dádiva: eles são
     dobrados em `atributos`, onde `danos.js` os lê desde sempre. Dobrar em
     vez de criar um leitor novo é a mesma escolha de sempre — a pergunta
     já tinha dono. */
  const res = acha("resist", "armadura");
  t("existe armadura que resiste a um elemento", !!res);
  if (res) t("e `danos.js` a enxerga pelo caminho de sempre", resistenciasEquipadas({ equipados: { armadura: res.it } }).length > 0);
  const ele = acha("elemento", "arma", "raro");
  t("existe arma elemental", !!ele);
  if (ele) t("e o elemento entrou em `atributos`", typeof ele.it.atributos.elemento === "string");
}


console.log(`\nafixos v9.81: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
