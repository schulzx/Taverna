/* QUEM TEM O QUÊ (23/11/2026, identidade e posse · etapa 5) — src/quem-tem-o-que.js

   A ordem da pessoa: «se a troca não está funcionando, vou criar um sistema
   que identifica e realiza trocas». Esta suíte prova o MECANISMO — de quem,
   para quem, o quê, a contrapartida e o consentimento — e nenhum verbo,
   nome ou frase: os nomes daqui são de prova e podiam ser outros.
   Os estados têm a forma do save (a ficha do herói como montarFicha e o
   jogo a deixam: `moedas`, `inventario` de texto ou objeto, `equipados`,
   `suprimentos`, `grupo[].inventario`; o mercado como o App o grava).
   §1  a tabela e o campo do save (garantirPosses, com o teto);
   §2  dar 15 moedas e receber 5 de volta: quem recebeu passou a ter;
   §3  a mesma chave duas vezes não muda nada;
   §4  a contrapartida: as duas coisas juntas, ou nenhuma;
   §5  a dívida: emprestar abre, devolver fecha, sem dívida é recusado, e a
       cobrança anda na direção da dívida;
   §6  o consentimento: tomar pede o dado; o pedido pede a resposta;
   §7  o morto: o que levava existe e se pega;
   §8  a posse inicial: a mesma em duas corridas, e nenhum sorteio que já
       existia mudou (oButimDoFurto);
   §9  a banca pelo adaptador: a gaveta bate com caixaDe/podePagar, e o
       estoque com `comprados`;
   §10 o chão, o companheiro, o que se veste, os usos;
   §11 a imutabilidade e o lixo. */
import { readFileSync } from "node:fs";
import {
  QUEM_TEM_O_QUE, aplicarTransacao, posseDe, posseInicial, garantirPosses, dividasDe,
} from "../src/quem-tem-o-que.js";
import { oButimDoFurto, O_VEREDITO_DA_TROCA } from "../src/o-veredito-da-troca.js";
import { caixaDe, podePagar } from "../src/comercio.js";
import { idDe } from "../src/quem-e-quem.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (o) => { if (o && typeof o === "object") { Object.freeze(o); for (const v of Object.values(o)) congelar(v); } return o; };

/* a ficha do herói na forma do save: um item de texto, a arma nos equipados, os usos */
const arma = (nome) => ({ nome, base: nome, tipo: "arma", raridade: "comum", atributos: { dano: 1 }, poderes: [], poder: "", descricao: "" });
const fichaHeroi = (extra = {}) => ({
  nome: "Aurelia Vane", classe: "Clérigo", moedas: 63, inventario: ["Símbolo sagrado riscado"],
  equipamento: [], equipados: { arma: arma("Espada Curta") }, suprimentos: { racoes: 10, agua: 10, tochas: 5, kit: true },
  grupo: [{ nome: "Lavinia Sallow", classe: "Mago", inventario: ["Corda de cânhamo"], equipamento: [], equipados: { arma: arma("Cajado de Carvalho") } }],
  ...extra,
});
const SEMENTE = "A prova|Fantasia";
const ctxBase = (extra = {}) => ({ semente: SEMENTE, dia: 4, pessoas: { "npc|Bento": { nome: "Bento", papel: "pescador" }, "npc|Cornelius": { nome: "Cornelius", papel: "mercador(a)" } }, ...extra });
const tr = (de, para, oQue, extra = {}) => ({ de, para, oQue, contra: null, consentimento: "dado", origem: "prova", ...extra });
const moedas = (n) => ({ tipo: "moedas", quantos: n });
const item = (nome, quantos = 1) => ({ tipo: "item", nome, quantos });

sec("1. A TABELA E O CAMPO DO SAVE");
{
  t("a tabela é congelada e diz os tipos, os consentimentos e os tetos", Object.isFrozen(QUEM_TEM_O_QUE) && J(QUEM_TEM_O_QUE.tipos) === J(["moedas", "item", "uso"]) && QUEM_TEM_O_QUE.consentimentos.length === 4 && QUEM_TEM_O_QUE.teto.pessoas > 0);
  t("o save sem o campo, o vazio e o lixo dão null (tudo se deriva)", garantirPosses(undefined) === null && garantirPosses(null) === null && garantirPosses({}) === null && garantirPosses("x") === null && garantirPosses([1]) === null);
  const muitos = {};
  for (let i = 0; i < QUEM_TEM_O_QUE.teto.pessoas + 30; i++) muitos[`npc|P${i}`] = { moedas: 1, entrou: [], saiu: [] };
  const g = garantirPosses({ delta: muitos, dividas: [], aplicadas: Array.from({ length: QUEM_TEM_O_QUE.teto.aplicadas + 50 }, (_, i) => `k${i}`) });
  t("o registro respeita o teto de pessoas", Object.keys(g.delta).length === QUEM_TEM_O_QUE.teto.pessoas);
  t("das chaves aplicadas ficam as últimas, até o teto", g.aplicadas.length === QUEM_TEM_O_QUE.teto.aplicadas && g.aplicadas[g.aplicadas.length - 1] === `k${QUEM_TEM_O_QUE.teto.aplicadas + 49}`);
  t("o herói, o mundo e o chão não têm delta no registro", garantirPosses({ delta: { heroi: { moedas: 3 }, mundo: { moedas: 1 }, "chao|x": { moedas: 1 } } }) === null);
  /* a transação que criaria uma pessoa além do teto é recusada, e nada muda */
  const cheio = garantirPosses({ delta: Object.fromEntries(Array.from({ length: QUEM_TEM_O_QUE.teto.pessoas }, (_, i) => [`npc|P${i}`, { moedas: 1 }])) });
  const r = aplicarTransacao(cheio, fichaHeroi(), tr("heroi", "npc|Novo", moedas(1)), ctxBase());
  t("cheio, a pessoa nova é recusada por teto, e a ficha não muda", !r.ok && r.motivo === "teto" && r.ficha.moedas === 63 && r.posses === cheio);
  const dividasDemais = garantirPosses({ dividas: Array.from({ length: QUEM_TEM_O_QUE.teto.dividas + 5 }, (_, i) => ({ id: `d${i}`, de: "heroi", para: "npc|X", oQue: moedas(1), quanto: i < 10 ? 0 : 1, estado: i < 10 ? "fechada" : "aberta" })) });
  t("das dívidas, as fechadas saem antes das abertas", dividasDemais.dividas.length === QUEM_TEM_O_QUE.teto.dividas && dividasDemais.dividas.filter((d) => d.estado === "fechada").length === 5);
}

sec("2. DAR 15 E RECEBER 5 DE VOLTA");
{
  const c = ctxBase();
  const antes = posseDe("npc|Bento", null, fichaHeroi(), c).moedas;
  const r1 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(15), { chave: "t1" }), c);
  t("o herói deu 15: a ficha desce 15", r1.ok && r1.ficha.moedas === 48, J(r1));
  t("quem recebeu passou a ter: a posse dele subiu 15", posseDe("npc|Bento", r1.posses, r1.ficha, c).moedas === antes + 15);
  t("o registro guarda só o delta de quem foi tocado", J(Object.keys(r1.posses.delta)) === J(["npc|Bento"]) && r1.posses.delta["npc|Bento"].moedas === 15);
  t("o que mudou de mão vem dito, por id", J(r1.mudou) === J([{ coisa: "moedas", quantos: 15, de: "heroi", para: "npc|Bento" }]));
  t("e o fato, em PT-BR, sem o nome do mecanismo", /Bento/.test(r1.fato) && /◉ 15/.test(r1.fato) && !/transa|delta|registro/i.test(r1.fato), r1.fato);
  const r2 = aplicarTransacao(r1.posses, r1.ficha, tr("npc|Bento", "heroi", moedas(5), { chave: "t2" }), c);
  t("no turno seguinte ele tem moeda para dar: volta 5", r2.ok && r2.ficha.moedas === 53, J(r2.motivo));
  t("e a posse dele desce 5", posseDe("npc|Bento", r2.posses, r2.ficha, c).moedas === antes + 10);
  const r3 = aplicarTransacao(r2.posses, r2.ficha, tr("npc|Bento", "heroi", moedas(antes + 11), { chave: "t3" }), c);
  t("mais do que ele tem: recusa «naoTem», e nada muda", !r3.ok && r3.motivo === "naoTem" && r3.ficha === r2.ficha && r3.posses === r2.posses);
  const r4 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(64)), c);
  t("o herói não dá o que não tem", !r4.ok && r4.motivo === "naoTem");
}

sec("3. A MESMA CHAVE DUAS VEZES");
{
  const c = ctxBase();
  const r1 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(7), { chave: "turno-9|pagar" }), c);
  const r2 = aplicarTransacao(r1.posses, r1.ficha, tr("heroi", "npc|Bento", moedas(7), { chave: "turno-9|pagar" }), c);
  t("a segunda é recusada como já aplicada", !r2.ok && r2.motivo === "jaAplicada");
  t("e não muda nada: a ficha e o registro são os mesmos", r2.ficha === r1.ficha && r2.posses === r1.posses && r2.ficha.moedas === 56 && r2.mudou.length === 0);
  const r3 = aplicarTransacao(r1.posses, r1.ficha, tr("heroi", "npc|Bento", moedas(7), { chave: "turno-10|pagar" }), c);
  t("outra chave aplica de novo", r3.ok && r3.ficha.moedas === 49);
}

sec("4. A CONTRAPARTIDA — AS DUAS JUNTAS, OU NENHUMA");
{
  const banca = { id: "m1", nome: "Banca do Oleiro", tipo: "geral", estoque: [{ nome: "Lanterna", preco: 8, detalhe: "de latão" }, { nome: "Corda", preco: 2 }] };
  const cidade = { nome: "Vau", porte: "vila" };
  const mercado = { comprados: {}, ambulante: null, pressoes: {}, gastos: {}, pechinchas: {} };
  const c = ctxBase({ bancas: [banca], cidade, mercado });
  const r = aplicarTransacao(null, fichaHeroi(), tr("banca|m1", "heroi", item("Lanterna"), { contra: moedas(8), chave: "c1" }), c);
  t("a coisa entra e a moeda sai, juntas", r.ok && r.ficha.moedas === 55 && r.ficha.inventario.some((x) => x && x.nome === "Lanterna"), J(r.motivo));
  t("a coisa chega sem o preço da banca", r.ficha.inventario.find((x) => x && x.nome === "Lanterna").preco === undefined);
  t("a banca dá baixa em `comprados`, na forma de sempre", J(r.mercado.comprados) === J({ m1: ["Lanterna"] }) && r.mercado.pechinchas === mercado.pechinchas);
  t("e o mudou diz os dois lados", r.mudou.length === 2 && r.mudou[1].coisa === "moedas" && r.mudou[1].de === "heroi" && r.mudou[1].para === "banca|m1");
  const pobre = fichaHeroi({ moedas: 5 });
  const r2 = aplicarTransacao(null, pobre, tr("banca|m1", "heroi", item("Lanterna"), { contra: moedas(8), chave: "c2" }), c);
  t("sem moeda bastante: recusa, e nem a coisa entra nem a banca dá baixa", !r2.ok && r2.motivo === "naoTem" && r2.ficha === pobre && r2.mercado === mercado && r2.posses === null);
  const r3 = aplicarTransacao(r.posses, r.ficha, tr("banca|m1", "heroi", item("Lanterna"), { contra: moedas(8) }), { ...c, mercado: r.mercado });
  t("o que já saiu da banca não sai de novo", !r3.ok && r3.motivo === "naoTem");
  /* a contrapartida em coisa, entre o herói e uma pessoa do mundo */
  const r4 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", item("Símbolo sagrado riscado"), { contra: item("Rede de pesca") }), c);
  t("coisa por coisa: cada lado recebe a do outro", r4.ok && r4.ficha.inventario.includes("Rede de pesca") && !r4.ficha.inventario.includes("Símbolo sagrado riscado") && posseDe("npc|Bento", r4.posses, r4.ficha, c).itens.includes("Símbolo sagrado riscado") && !posseDe("npc|Bento", r4.posses, r4.ficha, c).itens.includes("Rede de pesca"));
  const r5 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", item("Símbolo sagrado riscado"), { contra: item("Espada Longa") }), c);
  t("a contrapartida que o outro não tem desfaz a troca inteira", !r5.ok && r5.motivo === "naoTem" && r5.posses === null);
}

sec("5. A DÍVIDA");
{
  const c = ctxBase();
  const r1 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(10), { prazo: 3, chave: "e1" }), c);
  const dv = dividasDe(r1.posses, "npc|Bento");
  t("emprestar abre a dívida de quem recebeu, com o prazo em dias", r1.ok && dv.deve.length === 1 && dv.deve[0].para === "heroi" && dv.deve[0].quanto === 10 && dv.deve[0].prazo === 7 && dv.deve[0].estado === "aberta", J(r1.posses && r1.posses.dividas));
  t("o fato diz a dívida", /devendo/.test(r1.fato), r1.fato);
  t("do lado do herói, é dinheiro a receber", dividasDe(r1.posses, "heroi").aReceber.length === 1);
  const r2 = aplicarTransacao(r1.posses, r1.ficha, tr("npc|Bento", "heroi", moedas(4), { consentimento: "devido", chave: "e2" }), c);
  t("pagar parte abate a dívida", r2.ok && dividasDe(r2.posses, "npc|Bento").deve[0].quanto === 6 && /ainda deve/.test(r2.fato), J(r2.motivo));
  const r3 = aplicarTransacao(r2.posses, r2.ficha, tr("npc|Bento", "heroi", moedas(7), { consentimento: "devido" }), c);
  t("cobrar mais do que se deve é recusado", !r3.ok && r3.motivo === "maisQueDevido");
  const r4 = aplicarTransacao(r2.posses, r2.ficha, tr("npc|Bento", "heroi", moedas(6), { consentimento: "devido", chave: "e4" }), c);
  t("pagar o resto fecha a dívida", r4.ok && dividasDe(r4.posses, "npc|Bento").deve.length === 0 && r4.posses.dividas[0].estado === "fechada" && /ficou paga/.test(r4.fato));
  t("e a moeda andou na direção da dívida (dele para o herói)", r4.ficha.moedas === 63 && posseDe("npc|Bento", r4.posses, r4.ficha, c).moedas === posseDe("npc|Bento", null, fichaHeroi(), c).moedas);
  /* a cobrança na direção contrária — o herói «paga» a quem lhe deve — não casa com dívida nenhuma */
  const r5 = aplicarTransacao(r1.posses, r1.ficha, tr("heroi", "npc|Bento", moedas(10), { consentimento: "devido" }), c);
  t("a entrega devida na direção contrária da dívida é recusada", !r5.ok && r5.motivo === "semDivida" && r5.ficha === r1.ficha);
  const r6 = aplicarTransacao(null, fichaHeroi(), tr("npc|Bento", "heroi", moedas(3), { consentimento: "devido" }), c);
  t("cobrar sem dívida é recusado", !r6.ok && r6.motivo === "semDivida");
  /* o item emprestado e devolvido */
  const e1 = aplicarTransacao(null, fichaHeroi(), tr("npc|Bento", "heroi", item("Rede de pesca"), { prazo: 2, consentimento: "pedido", chave: "i1" }), { ...c, aceito: true });
  t("pedir emprestado: a coisa vem, e o herói fica devendo a coisa", e1.ok && e1.ficha.inventario.includes("Rede de pesca") && dividasDe(e1.posses, "heroi").deve[0].oQue.nome === "Rede de pesca");
  const e2 = aplicarTransacao(e1.posses, e1.ficha, tr("heroi", "npc|Bento", item("Rede de pesca"), { consentimento: "devido", chave: "i2" }), c);
  t("devolver fecha a dívida, e a coisa volta ao dono", e2.ok && dividasDe(e2.posses, "heroi").deve.length === 0 && posseDe("npc|Bento", e2.posses, e2.ficha, c).itens.includes("Rede de pesca"));
  t("e o dono volta a ser exatamente o que era (o delta some)", !e2.posses.delta["npc|Bento"]);
  const e3 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", item("Símbolo sagrado riscado"), { consentimento: "devido" }), c);
  t("devolver o que nunca foi emprestado é recusado, e a coisa fica", !e3.ok && e3.motivo === "semDivida" && e3.ficha.inventario.includes("Símbolo sagrado riscado"));
  /* o fiado: a coisa vem agora, a contrapartida fica devida */
  const banca = { id: "m2", nome: "Banca", tipo: "geral", estoque: [{ nome: "Corda", preco: 2 }] };
  const cf = { ...c, bancas: [banca], cidade: { nome: "Vau", porte: "vila" }, mercado: { comprados: {}, gastos: {} } };
  const f1 = aplicarTransacao(null, fichaHeroi(), tr("banca|m2", "heroi", item("Corda"), { contra: moedas(2), prazo: 5, chave: "f1" }), cf);
  t("com prazo e contrapartida, a moeda fica devida e não sai agora", f1.ok && f1.ficha.moedas === 63 && dividasDe(f1.posses, "heroi").deve[0].oQue.tipo === "moedas" && dividasDe(f1.posses, "heroi").deve[0].para === "banca|m2");
}

sec("6. O CONSENTIMENTO");
{
  const c = ctxBase();
  const r1 = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", moedas(1), { consentimento: "tomado" }), c);
  t("tomar sem o dado é recusado", !r1.ok && r1.motivo === "semDado");
  const r1b = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", moedas(1), { consentimento: "tomado" }), { ...c, dado: { passou: false } });
  t("com o dado falhado, também", !r1b.ok && r1b.motivo === "semDado");
  const r2 = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", moedas(1), { consentimento: "tomado", chave: "x1" }), { ...c, dado: { passou: true } });
  t("com o dado passado, move", r2.ok && r2.ficha.moedas === 64);
  const r3 = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", item("Balança de bolso"), { consentimento: "pedido" }), c);
  t("o pedido sem resposta é recusado", !r3.ok && r3.motivo === "semResposta");
  const r4 = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", item("Balança de bolso"), { consentimento: "pedido" }), { ...c, aceito: true });
  t("com a resposta, move (a coisa do ofício dele)", r4.ok && r4.ficha.inventario.includes("Balança de bolso"));
  const r5 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Cornelius", moedas(2), { consentimento: "pedido" }), c);
  t("o herói que entrega não precisa da resposta de ninguém", r5.ok);
}

sec("7. O MORTO");
{
  const c = ctxBase({ mortos: ["npc|Cornelius"] });
  const p = posseDe("npc|Cornelius", null, fichaHeroi(), c);
  t("o que o morto levava existe: a posse é a dele", p.itens.includes("Balança de bolso") && p.moedas === posseDe("npc|Cornelius", null, fichaHeroi(), ctxBase()).moedas);
  const r = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", item("Balança de bolso"), { consentimento: "tomado", chave: "m1" }), c);
  t("e pode ser pego, sem dado: ninguém segura", r.ok && r.ficha.inventario.includes("Balança de bolso"));
  t("e não é pego duas vezes", !aplicarTransacao(r.posses, r.ficha, tr("npc|Cornelius", "heroi", item("Balança de bolso"), { consentimento: "tomado" }), c).ok);
  t("o morto não recebe", aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Cornelius", moedas(1)), c).motivo === "morto");
  /* o morto pela presença do catálogo (quem-e-quem.js), com a fusão */
  const cat = { porId: { "Vau|gente|Cornelius": { nome: "Cornelius", oficio: "mercador" } }, alias: { "npc|Cornelius": "Vau|gente|Cornelius" }, presenca: { mortos: ["Vau|gente|Cornelius"] } };
  const r2 = aplicarTransacao(null, fichaHeroi(), tr("npc|Cornelius", "heroi", item("Balança de bolso"), { consentimento: "tomado" }), { semente: SEMENTE, catalogo: cat });
  t("o id do registro segue a fusão do catálogo até o dono, e o morto dele vale", r2.ok && r2.mudou[0].de === "Vau|gente|Cornelius");
  /* o objeto que o núcleo diz que ele carrega */
  const nucleo = [{ nome: "Ilse", papel: "elo", carrega: { tipo: "objeto", id: "c_carta", o: "uma carta lacrada que nunca entregou" } }];
  const idIlse = idDe(nucleo[0], "nucleo");
  t("o objeto do núcleo vira coisa na mão dela", posseInicial(idIlse, { semente: SEMENTE, nucleo }).itens.includes("Carta lacrada que nunca entregou"));
  t("a dívida do núcleo não vira coisa", posseInicial(idIlse, { semente: SEMENTE, nucleo: [{ ...nucleo[0], carrega: { tipo: "divida", o: "deve ao herói" } }] }).itens.length === 0);
}

sec("8. A POSSE INICIAL E A SEMENTE");
{
  const c = ctxBase();
  const a = J(["npc|Bento", "npc|Cornelius", "npc|Fulano", "Vau|gente|Hilda", "Vau|gente|Hilda~2"].map((id) => posseInicial(id, c)));
  const b = J(["npc|Bento", "npc|Cornelius", "npc|Fulano", "Vau|gente|Hilda", "Vau|gente|Hilda~2"].map((id) => posseInicial(id, ctxBase())));
  t("a mesma semente dá a mesma posse em duas corridas", a === b);
  t("o homônimo (outro id) tem a sua própria sorte", posseInicial("Vau|gente|Hilda", c).moedas !== posseInicial("Vau|gente|Hilda~2", c).moedas || J(posseInicial("Vau|gente|Hilda", { semente: "outra" })) !== J(posseInicial("Vau|gente|Hilda", c)));
  /* a moeda cai dentro da faixa da classe do butim — a MESMA tabela */
  const B = O_VEREDITO_DA_TROCA.butim;
  let dentro = true;
  for (let i = 0; i < 200; i++) {
    const m1 = posseInicial(`npc|P${i}`, { semente: SEMENTE, pessoas: { [`npc|P${i}`]: { nome: `P${i}`, papel: "mendigo" } } }).moedas;
    const m2 = posseInicial(`npc|Q${i}`, { semente: SEMENTE, pessoas: { [`npc|Q${i}`]: { nome: `Q${i}`, papel: "nobre" } } }).moedas;
    if (!(m1 === 0 || (m1 >= B.pobre.min && m1 <= B.pobre.max))) dentro = false;
    if (!(m2 === 0 || (m2 >= B.abastado.min && m2 <= B.abastado.max))) dentro = false;
  }
  t("a moeda sai da faixa da classe do butim (pobre, abastado)", dentro);
  /* nenhum sorteio que já existia mudou: estes valores foram medidos ANTES
     de quem-tem-o-que.js existir (23/11), e a chave da posse é nova */
  const CASOS = [
    [["mundo|x", { nome: "Cornelius", papel: "mercador" }, "Praça", 3, ""], { moedas: 3, item: "", nada: false, semACoisa: false }],
    [["mundo|x", { nome: "Bento", papel: "mendigo" }, "Doca", 1, ""], { moedas: 3, item: "", nada: false, semACoisa: false }],
    [["s2", { nome: "Hilda" }, "Taverna", 7, ""], { moedas: 6, item: "", nada: false, semACoisa: false }],
    [["s2", { nome: "Hilda" }, "Taverna", 7, "anel"], { moedas: 0, item: "", nada: true, semACoisa: true }],
    [["abc", { nome: "Rui", papel: "nobre" }, "Paço", 12, "bolsa"], { moedas: 6, item: "Dado de osso", nada: false, semACoisa: false }],
  ];
  const butim = () => CASOS.map(([[semente, alvo, lugar, dia, coisa]]) => J(oButimDoFurto({ semente, alvo, lugar, dia, coisa })));
  const antes = butim();
  for (let i = 0; i < 50; i++) posseInicial(`npc|P${i}`, { semente: "mundo|x" });
  aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", moedas(1)), c);
  const depois = butim();
  t("oButimDoFurto dá o mesmo antes e depois de usar a posse", J(antes) === J(depois));
  t("e o mesmo que dava antes deste módulo existir", J(antes) === J(CASOS.map(([, v]) => J(v))), J(antes));
  const src = readFileSync(new URL("../src/quem-tem-o-que.js", import.meta.url), "utf8");
  t("a chave de semente da posse é nova («|posse|»), e não a do furto", /\|\$\{Q\.semente\}\|/.test(src) && QUEM_TEM_O_QUE.semente === "posse" && !/\|furto\|/.test(src));
}

sec("9. A BANCA PELO ADAPTADOR");
{
  const banca = { id: "m9", nome: "Ferraria", tipo: "ferreiro", estoque: [{ nome: "Machado", preco: 12 }, { nome: "Pregos", preco: 1 }, { nome: "Pregos", preco: 1 }] };
  const cidade = { nome: "Vau", porte: "vila" };
  const c = (mercado) => ctxBase({ bancas: [banca], cidade, dia: 6, mercado });
  t("sem gasto, a gaveta é a de caixaDe", posseDe("banca|m9", null, fichaHeroi(), c({ comprados: {}, gastos: {} })).moedas === caixaDe(banca, cidade, 6));
  const merc = { comprados: { m9: ["Pregos"] }, gastos: { m9: { dia: 6, moedas: 10 } } };
  const p = posseDe("banca|m9", null, fichaHeroi(), c(merc));
  t("com gasto de hoje, bate com podePagar", p.moedas === podePagar(banca, cidade, 6, 10));
  t("o gasto de outro dia não conta", posseDe("banca|m9", null, fichaHeroi(), c({ comprados: {}, gastos: { m9: { dia: 5, moedas: 10 } } })).moedas === caixaDe(banca, cidade, 6));
  t("o estoque é o que sobra de `comprados` (um prego dos dois)", J(p.itens.map((x) => x.nome)) === J(["Machado", "Pregos"]));
  /* o herói vende à banca: a gaveta paga e o gasto de hoje sobe, na forma de sempre */
  const r = aplicarTransacao(null, fichaHeroi({ inventario: ["Símbolo sagrado riscado", "Faca velha"] }), tr("heroi", "banca|m9", item("Faca velha"), { contra: moedas(5), chave: "v1" }), c(merc));
  t("vender: a moeda sai da gaveta para o herói", r.ok && r.ficha.moedas === 68 && J(r.mercado.gastos.m9) === J({ dia: 6, moedas: 15 }));
  t("e a banca passa a ter o que comprou", posseDe("banca|m9", r.posses, r.ficha, c(r.mercado)).itens.some((x) => x === "Faca velha"));
  t("a gaveta vazia não paga", !aplicarTransacao(null, fichaHeroi({ inventario: ["Faca velha"] }), tr("heroi", "banca|m9", item("Faca velha"), { contra: moedas(caixaDe(banca, cidade, 6) + 1) }), c({ comprados: {}, gastos: {} })).ok);
  t("a banca que não está aqui não troca", aplicarTransacao(null, fichaHeroi(), tr("banca|zz", "heroi", item("Machado"), { contra: moedas(1) }), c({})).motivo === "semBanca");
}

sec("10. O CHÃO, O COMPANHEIRO, O QUE SE VESTE, OS USOS");
{
  const c = ctxBase();
  /* o chão */
  const chao = { cena: "Vau|Praça|4", itens: [{ id: "ch1", especie: "equipamento", nome: "Escudo", raridade: "comum", de: "bandido", qtd: 1, destino: "equipamento", pronto: { nome: "Escudo", tipo: "armadura", raridade: "comum" } }] };
  const r1 = aplicarTransacao(null, fichaHeroi(), tr("chao|Vau|Praça|4", "heroi", item("Escudo"), { chave: "ch" }), { ...c, chao });
  t("pegar do chão: o achado sai do chão e entra onde o destino diz", r1.ok && r1.chao.itens.length === 0 && r1.ficha.equipamento.some((x) => x.nome === "Escudo"));
  const r2 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "chao|Vau|Praça|4", item("Símbolo sagrado riscado")), { ...c, chao });
  t("largar no chão: a coisa sai da ficha e fica lá, com crachá", r2.ok && r2.chao.itens.length === 2 && r2.chao.itens[1].nome === "Símbolo sagrado riscado" && /^ch/.test(r2.chao.itens[1].id));
  t("o chão não guarda moeda", aplicarTransacao(null, fichaHeroi(), tr("heroi", "chao|x", moedas(1)), { ...c, chao }).motivo === "chaoSoCoisa");
  /* o companheiro: a coisa na ficha, a moeda no registro */
  const lav = "npc|Lavinia Sallow";
  const r3 = aplicarTransacao(null, fichaHeroi(), tr(lav, "heroi", item("Corda de cânhamo"), { consentimento: "pedido" }), { ...c, aceito: true });
  t("o companheiro entrega da mochila dele (grupo[].inventario)", r3.ok && r3.ficha.grupo[0].inventario.length === 0 && r3.ficha.inventario.includes("Corda de cânhamo") && r3.posses === null);
  t("o companheiro não tem moeda até alguém lhe dar", posseDe(lav, null, fichaHeroi(), c).moedas === 0 && !aplicarTransacao(null, fichaHeroi(), tr(lav, "heroi", moedas(1), { consentimento: "pedido" }), { ...c, aceito: true }).ok);
  const r4 = aplicarTransacao(null, fichaHeroi(), tr("heroi", lav, moedas(15)), c);
  const r5 = aplicarTransacao(r4.posses, r4.ficha, tr(lav, "heroi", moedas(5), { consentimento: "pedido" }), { ...c, aceito: true });
  t("dar 15 ao companheiro e pedir 5 de volta funciona", r5.ok && r5.ficha.moedas === 53 && posseDe(lav, r5.posses, r5.ficha, c).moedas === 10);
  /* o que se veste */
  t("o herói não entrega o que veste: «emUso»", aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", item("Espada Curta")), c).motivo === "emUso");
  t("nem o companheiro", aplicarTransacao(null, fichaHeroi(), tr(lav, "heroi", item("Cajado de Carvalho"), { consentimento: "pedido" }), { ...c, aceito: true }).motivo === "emUso");
  /* os usos */
  const r6 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", { tipo: "uso", nome: "tochas", quantos: 2 }), c);
  t("o uso sai de `suprimentos` e entra na posse do outro", r6.ok && r6.ficha.suprimentos.tochas === 3 && r6.ficha.suprimentos.kit === true && posseDe("npc|Bento", r6.posses, r6.ficha, c).usos.tochas === 2);
  t("o uso que não é da tabela é lixo", aplicarTransacao(null, fichaHeroi(), tr("heroi", "npc|Bento", { tipo: "uso", nome: "kit" }), c).motivo === "invalida");
  /* o mundo e o nada */
  const r7 = aplicarTransacao(null, fichaHeroi(), tr("mundo", "heroi", moedas(30), { origem: "quest" }), c);
  t("o mundo paga sem ter de ter (a quest, o espólio)", r7.ok && r7.ficha.moedas === 93 && r7.posses === null);
  const r8 = aplicarTransacao(null, fichaHeroi(), tr("heroi", "nada", { tipo: "uso", nome: "racoes", quantos: 1 }), c);
  t("o consumo vai ao nada", r8.ok && r8.ficha.suprimentos.racoes === 9);
  t("do nada não sai coisa", aplicarTransacao(null, fichaHeroi(), tr("nada", "heroi", moedas(1)), c).motivo === "deNada");
  t("o item do herói pela forma de objeto também casa (pelo nome)", aplicarTransacao(null, fichaHeroi({ inventario: [{ nome: "Poção de Cura", tipo: "consumivel" }] }), tr("heroi", "npc|Bento", item("poção de cura")), c).ok);
}

sec("11. A IMUTABILIDADE E O LIXO");
{
  const c = ctxBase();
  const ficha = congelar(fichaHeroi());
  const posses = congelar(garantirPosses({ delta: { "npc|Bento": { moedas: 3 } }, dividas: [{ id: "d1", de: "npc|Bento", para: "heroi", oQue: moedas(2), quanto: 2, estado: "aberta" }] }));
  const mercado = congelar({ comprados: {}, gastos: {} });
  const chao = congelar({ cena: "x", itens: [] });
  let estourou = false;
  try {
    aplicarTransacao(posses, ficha, tr("heroi", "npc|Bento", moedas(5), { chave: "z" }), { ...c, mercado, chao });
    aplicarTransacao(posses, ficha, tr("npc|Bento", "heroi", moedas(2), { consentimento: "devido" }), { ...c, mercado, chao });
    aplicarTransacao(posses, ficha, tr("heroi", "chao|x", item("Símbolo sagrado riscado")), { ...c, mercado, chao });
  } catch (e) { estourou = e.message; }
  t("nada que entra é mutado (tudo congelado, nenhuma exceção)", estourou === false, estourou);
  let lixo = false;
  try {
    for (const x of [null, undefined, 1, "x", [], {}, { de: "heroi" }, { de: "heroi", para: "npc|A" }, { de: "heroi", para: "npc|A", oQue: { tipo: "ouro" } }, { de: "heroi", para: "npc|A", oQue: moedas(-1) }, { de: "heroi", para: "heroi", oQue: moedas(1) }, { de: "heroi", para: "npc|A", oQue: moedas(1), prazo: 0 }]) {
      const r = aplicarTransacao(null, fichaHeroi(), x, c);
      if (r.ok) lixo = "aplicou lixo: " + J(x);
    }
    aplicarTransacao(undefined, null, tr("heroi", "npc|A", moedas(1)), null);
    posseDe(null, null, null, null); posseInicial(null, null); dividasDe(null, null);
  } catch (e) { lixo = e.message; }
  t("o lixo dá recusa com motivo, nunca exceção", lixo === false, lixo);
  t("sem a ficha, o herói não troca", aplicarTransacao(null, null, tr("heroi", "npc|A", moedas(1)), c).motivo === "semFicha");
  t("a mesma pessoa dos dois lados é recusada", aplicarTransacao(null, fichaHeroi(), tr("npc|A", "npc|A", moedas(1)), c).motivo === "mesmoLado");
  t("toda recusa tem texto na tabela", Object.keys(QUEM_TEM_O_QUE.motivos).every((k) => QUEM_TEM_O_QUE.motivos[k].length > 5));
  /* aplicarTransacao não lê verbo: o tipo de troca não é entrada */
  const src = readFileSync(new URL("../src/quem-tem-o-que.js", import.meta.url), "utf8");
  const corpo = src.slice(src.indexOf("export function aplicarTransacao"));
  t("a transação não conhece «vender», «subornar», «cobrar» nem «furtar»", !/vend|subor|cobr|furt|compr/i.test(corpo));
}

console.log(`\n${bons} ok, ${maus} falharam`);
if (maus) process.exit(1);
