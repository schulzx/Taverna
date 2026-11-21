/* teste-cena-do-momento.mjs (M4 · 18/11/2026) — «a cena que o Mestre lê».

   O desenho é mente/lancamento/o-mestre-vivo.md §4. O módulo é
   src/cena-do-momento.js: a tabela fechada de estados de pessoa, criatura,
   coisa e cena, e as perguntas que a régua do momento faz à cena. Aqui se
   prova a tabela, a leitura (null, lixo, imutabilidade) e cada pergunta. */
import fs from "node:fs";
import {
  ESTADOS_DA_CENA, LUGARES_DA_CENA, estadoPorId, lerCena, alvoDaAcao, haOposicao, haOQueAchar, haSegredo,
  haPerigo, alguemPodeNotar, haPlateia, cenaRevela, custoDeFalhar, RESPOSTAS_DA_PERGUNTA, respostaDaPergunta,
  estadosQueChamam, temMarca, temMarcaNoAlvo, coisasQueAFraseNomeia, MARCA_NO_ALVO,
} from "../src/cena-do-momento.js";
import { PERICIAS } from "../src/pericias.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* os estados que o desenho (§4) e o pedido da etapa nomeiam */
const PEDIDOS = {
  pessoa: ["disposta", "desconfiada", "com_medo", "hostil", "esconde_algo", "deve_favor", "motivo_para_negar"],
  criatura: ["faminta", "acuada", "territorial", "ferida", "mansa"],
  coisa: ["trancado", "vigiado", "fragil", "escuro", "armadilhado", "ha_algo_escondido"],
  cena: ["com_pressa", "com_testemunhas", "territorio_de_alguem", "perigo_fisico", "som_claro"],
};
const MARCAS = ["opoe", "cede", "facilita", "esconde", "pune", "espalha", "nota", "apressa", "revela"];

sec("1. a tabela fechada");
{
  const ids = ESTADOS_DA_CENA.map((e) => e.id);
  t(`${ids.length} estados, ids únicos`, new Set(ids).size === ids.length && ids.length >= 25);
  t("todo estado é de pessoa, criatura, coisa ou cena", ESTADOS_DA_CENA.every((e) => ["cena", ...Object.keys(LUGARES_DA_CENA)].includes(e.de)));
  for (const [de, lista] of Object.entries(PEDIDOS)) t(`os estados de ${de} pedidos estão todos, do dono certo`, lista.every((id) => estadoPorId(id) && estadoPorId(id).de === de));
  t("toda marca é booleana", ESTADOS_DA_CENA.every((e) => MARCAS.every((m) => typeof e[m] === "boolean")));
  t("todo estado tem o efeito que o jogador sente, em PT-BR («você», nunca «tu»)",
    ESTADOS_DA_CENA.every((e) => typeof e.efeito === "string" && e.efeito.length > 8 && !/\b(tu|teu|tua|contigo)\b/i.test(e.efeito)));
  t("o efeito não diz o nome do mecanismo (o sistema não fala de si mesmo)",
    ESTADOS_DA_CENA.every((e) => !e.efeito.includes("_") && !new RegExp("\\b" + e.id + "\\b").test(e.efeito)));
  const pericias = new Set(PERICIAS.map((p) => p.id));
  t("o que um estado chama é uma perícia do projeto", ESTADOS_DA_CENA.every((e) => e.chama === "" || pericias.has(e.chama)));
  t("chamam sozinhos: o perigo e o que se aproxima (Percepção), o vigiado e o território (Furtividade), o assunto raro (Saberes)",
    estadoPorId("algo_se_aproxima").chama === "percepcao" && estadoPorId("vigiado").chama === "furtividade"
    && estadoPorId("territorio_de_alguem").chama === "furtividade" && estadoPorId("assunto_raro").chama === "saberes");
  t("o que a régua lê de cada um: medo cede, desconfiança opõe e nota, o achado esconde, a pressa apressa, testemunha espalha",
    estadoPorId("com_medo").cede && estadoPorId("desconfiada").opoe && estadoPorId("desconfiada").nota && estadoPorId("ha_algo_escondido").esconde
    && estadoPorId("com_pressa").apressa && estadoPorId("com_testemunhas").espalha && estadoPorId("perigo_fisico").pune);
  t("a tabela é congelada", Object.isFrozen(ESTADOS_DA_CENA) && ESTADOS_DA_CENA.every(Object.isFrozen));
  t("estadoPorId de lixo é null", [null, undefined, "", "voando", 42].every((x) => estadoPorId(x) === null));
}

sec("2. ler a cena");
{
  t("null, undefined, número, texto e lista não são cena", [null, undefined, 42, "x", [], true].every((x) => lerCena(x) === null));
  const v = lerCena({});
  t("{} é a cena vazia", igual(v, { pessoas: [], criaturas: [], coisas: [], cena: { estados: [] } }));
  const cru = {
    pessoas: [{ nome: "Bento", papel: "guarda", estados: ["desconfiada", "desconfiada", "voando", "trancado"] }, null, 7],
    criaturas: null,
    coisas: [{ nome: "porta", estados: ["trancado", "com_pressa"] }],
    cena: { estados: ["com_pressa", "hostil"] },
  };
  const antes = JSON.stringify(cru);
  const l = lerCena(cru);
  t("só fica o que a tabela conhece, do dono certo, sem repetir", igual(l.pessoas[0].estados, ["desconfiada"]) && igual(l.coisas[0].estados, ["trancado"]) && igual(l.cena.estados, ["com_pressa"]));
  t("o que não é objeto na lista sai; `null` explícito vira lista vazia", l.pessoas.length === 1 && igual(l.criaturas, []));
  t("a cena crua não é mutada", JSON.stringify(cru) === antes);
  t("a cena lida é congelada, até o fundo", Object.isFrozen(l) && Object.isFrozen(l.pessoas) && Object.isFrozen(l.pessoas[0]) && Object.isFrozen(l.pessoas[0].estados) && Object.isFrozen(l.cena.estados));
  t("mesma cena, mesma leitura (determinismo)", igual(lerCena(cru), lerCena(JSON.parse(antes))));
  t("`cena: null` e `estados: null` explícitos não estouram", igual(lerCena({ cena: null, pessoas: [{ estados: null }] }).pessoas[0].estados, []));
}

const P = (papel, ...estados) => ({ nome: "", papel, estados });
const cenaDe = (o) => ({ pessoas: [], criaturas: [], coisas: [], cena: { estados: [] }, ...o });

sec("3. o alvo e a oposição");
{
  const c = cenaDe({ pessoas: [P("Tobias (companheiro)", "do_grupo"), P("capitão da guarda", "desconfiada"), { nome: "Ana", papel: "viúva", estados: ["com_medo"] }] });
  t("sem nome, o primeiro de fora do grupo", alvoDaAcao(c, { sobre: "pessoa" }).papel === "capitão da guarda");
  t("pelo nome", alvoDaAcao(c, { sobre: "pessoa", quem: "Ana" }).papel === "viúva");
  t("pelo papel dito na frase («o capitão»)", alvoDaAcao(c, { sobre: "pessoa", quem: "o capitão" }).papel === "capitão da guarda");
  t("sem ninguém daquele tipo, null; sem cena, null", alvoDaAcao(c, { sobre: "criatura" }) === null && alvoDaAcao(null, {}) === null);
  t("desconfiada opõe", haOposicao(c, { sobre: "pessoa" }).opoe === true);
  t("com medo cede", haOposicao(c, { sobre: "pessoa", quem: "Ana" }).cede === true);
  const d = cenaDe({ pessoas: [P("taverneiro", "disposta")] });
  t("disposta facilita e não opõe", haOposicao(d, {}).facilita && !haOposicao(d, {}).opoe);
  const dm = cenaDe({ pessoas: [P("taverneiro", "disposta", "motivo_para_negar")] });
  t("disposta com motivo para negar: opõe, e não facilita", haOposicao(dm, {}).opoe && !haOposicao(dm, {}).facilita);
  t("a coisa trancada opõe", haOposicao(cenaDe({ coisas: [{ nome: "porta", estados: ["trancado"] }] }), { sobre: "coisa" }).opoe);
  t("sem cena, nada opõe", igual(haOposicao(null, {}), { opoe: false, cede: false, facilita: false, quem: "", estados: [] }));
}

sec("4. as perguntas da régua");
{
  const vazio = cenaDe({});
  t("há o que achar: só quando uma coisa esconde", haOQueAchar(cenaDe({ coisas: [{ estados: ["ha_algo_escondido"] }] })) && haOQueAchar(cenaDe({ coisas: [{ estados: ["armadilhado"] }] })) && !haOQueAchar(vazio) && !haOQueAchar(null));
  t("segredo: a pessoa que esconde, ou a coisa", haSegredo(cenaDe({ pessoas: [P("viúva", "esconde_algo")] })) && !haSegredo(cenaDe({ pessoas: [P("viúva", "disposta")] })));
  t("perigo: na cena, na coisa frágil, na criatura faminta", haPerigo(cenaDe({ cena: { estados: ["perigo_fisico"] } })) && haPerigo(cenaDe({ coisas: [{ estados: ["fragil"] }] }))
    && haPerigo(cenaDe({ criaturas: [{ estados: ["faminta"] }] })) && !haPerigo(vazio));
  t("alguém pode notar: o vigiado, as testemunhas, um estranho presente", alguemPodeNotar(cenaDe({ coisas: [{ estados: ["vigiado"] }] }))
    && alguemPodeNotar(cenaDe({ cena: { estados: ["com_testemunhas"] } })) && alguemPodeNotar(cenaDe({ pessoas: [P("guarda")] })));
  t("ninguém nota: a cena vazia, ou só os do grupo, ou o bicho manso", !alguemPodeNotar(vazio) && !alguemPodeNotar(cenaDe({ pessoas: [P("Tobias", "do_grupo")] }))
    && !alguemPodeNotar(cenaDe({ criaturas: [{ estados: ["mansa"] }] })) && !alguemPodeNotar(null));
  t("plateia: testemunhas ou alguém de fora; os do grupo não são plateia", haPlateia(cenaDe({ cena: { estados: ["com_testemunhas"] } })) && !haPlateia(cenaDe({ pessoas: [P("Tobias", "do_grupo")] })));
  t("a cena revela: o som claro", cenaRevela(cenaDe({ cena: { estados: ["som_claro"] } })) && !cenaRevela(vazio));
  const custo = custoDeFalhar(cenaDe({ cena: { estados: ["com_pressa", "com_testemunhas"] }, coisas: [{ estados: ["fragil"] }] }));
  t("falhar custa: o corpo, a fama, o tempo — na ordem da tabela", custo.pune && custo.espalha && custo.apressa && igual(custo.quais, ["pune", "espalha", "apressa"]));
  t("sem cena, falhar não custa nada que a cena saiba", igual(custoDeFalhar(null), { pune: false, espalha: false, apressa: false, quais: [] }));
}

sec("5. a pergunta não rola: a resposta");
{
  /* MOVIDO na M5 (18/11/2026): eram três respostas (recusa, evasiva, franca).
     A M5 pôs à frente o «silêncio» — o morto e o desacordado não respondem,
     e isso vem antes de qualquer humor. A intenção fica: a última é a franca,
     sem condição, e nenhuma pergunta fica sem resposta. */
  t("a tabela de respostas: silêncio, recusa, evasiva, franca (a última sem condição)", igual(RESPOSTAS_DA_PERGUNTA.map((r) => r.id), ["silencio", "recusa", "evasiva", "franca"]) && RESPOSTAS_DA_PERGUNTA[3].se === "");
  t("quem esconde desconversa", respostaDaPergunta(cenaDe({ pessoas: [P("viúva", "esconde_algo", "com_medo")] })).id === "evasiva");
  t("quem é hostil recusa", respostaDaPergunta(cenaDe({ pessoas: [P("contrabandista", "hostil", "esconde_algo")] })).id === "recusa");
  t("o resto responde", respostaDaPergunta(cenaDe({ pessoas: [P("taverneiro", "disposta")] })).id === "franca");
  t("sem pessoa ou sem cena, não há resposta a dar", respostaDaPergunta(cenaDe({})) === null && respostaDaPergunta(null) === null);
}

sec("6. o que chama sozinho");
{
  t("os estados que chamam, na ordem da tabela", igual(estadosQueChamam(cenaDe({ coisas: [{ estados: ["vigiado"] }], cena: { estados: ["perigo_fisico"] } })), ["vigiado", "perigo_fisico"]));
  t("cena sem nada que chame, ou sem cena: lista vazia", igual(estadosQueChamam(cenaDe({})), []) && igual(estadosQueChamam(null), []));
}

sec("7. o módulo é puro");
{
  const src = fs.readFileSync(new URL("../src/cena-do-momento.js", import.meta.url), "utf8");
  t("sem sorteio, sem relógio, sem React", !/Math\.random|Date\.now|new Date|from "react"/.test(src));
}

sec("M5. os estados que o exame pediu (18/11/2026)");
{
  const ids = ["ceu_encoberto", "morta", "desacordada", "do_heroi", "raro_de_achar", "coisa_comum", "escorregadio"];
  t("os sete estados novos existem, cada um do seu dono", ids.every((id) => estadoPorId(id))
    && estadoPorId("ceu_encoberto").de === "cena" && estadoPorId("morta").de === "pessoa" && estadoPorId("desacordada").de === "pessoa"
    && ["do_heroi", "raro_de_achar", "coisa_comum", "escorregadio"].every((id) => estadoPorId(id).de === "coisa"));
  t("cada um diz o que significa para a régua (uma marca)", estadoPorId("ceu_encoberto").cobre && estadoPorId("morta").inerte && estadoPorId("desacordada").inerte
    && estadoPorId("do_heroi").proprio && estadoPorId("raro_de_achar").escasso && estadoPorId("coisa_comum").comum && estadoPorId("escorregadio").pune);
  const morto = cenaDe({ pessoas: [P("bandido", "morta")] });
  t("o morto não nota quem se esgueira nem quem lhe tira a bolsa", alguemPodeNotar(morto) === false);
  t("o desacordado também não; o vivo que dorme sim", alguemPodeNotar(cenaDe({ pessoas: [P("guarda", "desacordada")] })) === false && alguemPodeNotar(cenaDe({ pessoas: [P("bêbado adormecido")] })) === true);
  t("o morto não é plateia", haPlateia(morto) === false);
  t("o morto não responde: silêncio, antes do humor", respostaDaPergunta(cenaDe({ pessoas: [P("guarda", "hostil", "morta")] })).id === "silencio");
  t("o morto hostil não se opõe a nada, e a oposição diz que é inerte", haOposicao(cenaDe({ pessoas: [P("guarda", "hostil", "morta")] })).opoe === false && haOposicao(morto).inerte === true);
  t("o muro escorregadio pune o corpo", haPerigo(cenaDe({ coisas: [{ nome: "muro", estados: ["escorregadio"] }] })) === true);
  t("temMarca acha a marca na cena, na coisa ou na pessoa; null e lixo dão falso", temMarca(cenaDe({ cena: { estados: ["ceu_encoberto"] } }), "cobre")
    && temMarca(cenaDe({ coisas: [{ nome: "grimório", estados: ["do_heroi"] }] }), "proprio") && temMarca(morto, "inerte")
    && !temMarca(null, "cobre") && !temMarca(cenaDe({}), "cobre") && !temMarca(morto, 42));
  t("todo estado novo tem efeito em PT-BR, sem o nome do mecanismo", ids.every((id) => { const e = estadoPorId(id).efeito; return typeof e === "string" && e.length > 8 && !e.includes(id) && !/\b(tu|teu|tua)\b/.test(e); }));
}

sec("R3. os estados que faltavam (rodada_3.estados_que_faltam do exame, 18/11/2026)");
{
  /* cada estado novo, o seu dono e a marca que a régua lê */
  const NOVOS = {
    som_abafado: ["cena", "abafa"], ja_testado: ["cena", "testado"], ja_resolvido: ["cena", "resolvido"],
    ja_convencida: ["pessoa", "resolvido"], moribunda: ["pessoa", "morrendo"], dormindo: ["pessoa", "nota"],
    selado: ["coisa", "impossivel"], sem_resistencia: ["coisa", "livre"], a_vista: ["coisa", "evidente"],
    rastro_fresco: ["coisa", "rastro"], rastro_velho: ["coisa", "rastro"], rastro_obvio: ["coisa", "evidente"],
    em_movimento: ["coisa", "apressa"], ameacado: ["coisa", "ameaca"],
    heroi_treinado: ["cena", "treinado"], heroi_ja_sabe: ["cena", "sabe"], heroi_tem_alavanca: ["cena", "alavanca"], heroi_penalizado: ["cena", "penaliza"],
  };
  const MARCAS_R3 = ["abafa", "treinado", "sabe", "testado", "resolvido", "alavanca", "impossivel", "morrendo", "penaliza", "evidente", "rastro", "ameaca", "livre"];
  t(`os ${Object.keys(NOVOS).length} estados novos existem, cada um do seu dono e com a sua marca`,
    Object.entries(NOVOS).every(([id, [de, marca]]) => estadoPorId(id) && estadoPorId(id).de === de && estadoPorId(id)[marca] === true),
    Object.entries(NOVOS).filter(([id, [de, marca]]) => !(estadoPorId(id) && estadoPorId(id).de === de && estadoPorId(id)[marca] === true)).map(([id]) => id).join(","));
  t("as marcas novas são booleanas em todo estado", ESTADOS_DA_CENA.every((e) => MARCAS_R3.every((m) => typeof e[m] === "boolean")));
  t("o herói não ganha lugar novo na forma da cena: os estados dele são da cena, com o prefixo", ESTADOS_DA_CENA.filter((e) => e.id.startsWith("heroi_")).every((e) => e.de === "cena")
    && JSON.stringify(Object.keys(lerCena({}))) === JSON.stringify(["pessoas", "criaturas", "coisas", "cena"]));
  t("quem dorme pode notar; o moribundo não opõe nada; a pessoa já convencida está do seu lado",
    alguemPodeNotar(cenaDe({ pessoas: [P("bêbado", "dormindo")] })) && !haOposicao(cenaDe({ pessoas: [P("ferido", "moribunda")] })).opoe
    && haOposicao(cenaDe({ pessoas: [P("preso", "ja_convencida")] })).facilita);
  t("o que se move pune e apressa: falhar custa corpo e tempo", custoDeFalhar(cenaDe({ coisas: [{ nome: "carroça", estados: ["em_movimento"] }] })).pune
    && custoDeFalhar(cenaDe({ coisas: [{ nome: "carroça", estados: ["em_movimento"] }] })).apressa);
  t("temMarca acha o estado do herói na cena", temMarca(cenaDe({ cena: { estados: ["heroi_penalizado"] } }), "penaliza") && !temMarca(cenaDe({}), "penaliza"));
  t("todo estado novo tem efeito em PT-BR, sem o nome do mecanismo",
    Object.keys(NOVOS).every((id) => { const e = estadoPorId(id).efeito; return typeof e === "string" && e.length > 8 && !e.includes("_") && !/\b(tu|teu|tua)\b/.test(e); }));
}

sec("S21. a marca no alvo (21/11/2026, o-mestre-vivo.md §21)");
{
  const c = lerCena({
    pessoas: [{ nome: "Ana", papel: "padeira", estados: ["ja_convencida"] }, { nome: "Rui", papel: "guarda", estados: [] }],
    coisas: [{ nome: "porta", estados: ["trancado"] }, { nome: "a arca", estados: ["sem_resistencia"] }, { nome: "o caixote", estados: ["selado"] }],
    cena: { estados: ["ja_testado"] },
  });
  t("a arca e o caixote têm estados diferentes na mesma cena", c.coisas[1].estados.includes("sem_resistencia") && c.coisas[2].estados.includes("selado"));
  t("a frase nomeia a coisa pelo núcleo do nome, no singular ou no plural", igual(coisasQueAFraseNomeia("forço a arca", c), ["a arca"]) && igual(coisasQueAFraseNomeia("pulo os caixotes", c), ["o caixote"])
    && igual(coisasQueAFraseNomeia("arrombo a porta e depois a arca", c), ["porta", "a arca"]) && coisasQueAFraseNomeia("escalo o muro", c).length === 0);
  t("só o núcleo nomeia (o adjetivo do nome não é a coisa)", coisasQueAFraseNomeia("abro a pequena arca", lerCena({ coisas: [{ nome: "Poção de Cura Pequena", estados: [] }] })).length === 0
    && MARCA_NO_ALVO.minimo >= 3 && MARCA_NO_ALVO.vazias.includes("para"));
  t("a marca da arca só vale na arca; a do caixote, só no caixote", temMarcaNoAlvo(c, "livre", { coisas: ["a arca"] }) && !temMarcaNoAlvo(c, "livre", { coisas: ["o caixote"] })
    && temMarcaNoAlvo(c, "impossivel", { coisas: ["o caixote"] }) && !temMarcaNoAlvo(c, "impossivel", { coisas: ["porta"] }));
  t("sem alvo (null), a cena inteira, como temMarca", ["livre", "impossivel", "resolvido"].every((m) => temMarcaNoAlvo(c, m, null) === temMarca(c, m)));
  t("a pessoa: só a dita; [] é nenhuma", temMarcaNoAlvo(c, "resolvido", { pessoas: ["Ana"] }) && !temMarcaNoAlvo(c, "resolvido", { pessoas: ["Rui"] }) && !temMarcaNoAlvo(c, "resolvido", { pessoas: [] }));
  t("a marca da cena vale para qualquer alvo", temMarcaNoAlvo(c, "testado", { coisas: ["porta"], pessoas: [] }));
  t("a chave do herói é da cena, e também pode estar numa coisa ou numa pessoa (tambem)", estadoPorId("heroi_tem_alavanca").de === "cena"
    && igual([...estadoPorId("heroi_tem_alavanca").tambem], ["coisa", "pessoa"]) && lerCena({ coisas: [{ nome: "o portão", estados: ["heroi_tem_alavanca"] }] }).coisas[0].estados.includes("heroi_tem_alavanca")
    && lerCena({ coisas: [{ nome: "x", estados: ["com_pressa"] }] }).coisas[0].estados.length === 0);
  t("lixo não lança", temMarcaNoAlvo(null, "livre", null) === false && coisasQueAFraseNomeia(null, c).length === 0 && coisasQueAFraseNomeia("arca", null).length === 0);
}

console.log(`\n${ok} ok, ${mal} falha(s)`);
if (mal) process.exit(1);
