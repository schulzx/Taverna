/* O LIVRO DE FACTOS (08/11/2026, Fase BQ · BQ1) — src/livro-de-factos.js

   O nome passa a id UMA vez, quando o facto se escreve; o facto fica
   guardado; quem lê só lê factos, por id. Esta suíte prova as três causas
   de fecho que o livro mata (mente/plano-biblioteca-de-quests.md, §1),
   cada uma com os casos reais que a planta contou:
   §1 as tabelas: cada tipo de facto diz de onde vem, e escreve-se;
   §2 o save: o null, o lixo, o campo que as campanhas de antes não têm;
   §3 DO NOME AO ID — a regra de desempate (Marl de Osso, os dois Marl, as
      duas Nyla, Dona Inocência, o Noé do cânone, o herói, o guarda);
   §4 «ENCONTRAR CORRADO» — o save da 13.ª: a presença sem conversa não
      conta, a conversa de um turno fica nos seguintes, o nome dito de
      outra forma é o mesmo id, e T2–T5 é uma conversa, não quatro;
   §5 CONHECER NÃO É SER NOMEADO — a Delfina da MM14, o Dário à porta;
   §6 os lugares — o Campo das Mães dito de longe, a ponte para o id da
      base, o sítio dito com outra caixa, o cómodo e o prédio, a estrada;
   §7 quem cai — derrotou, poupou, o rendido que depois morre, o fugido;
   §8 a afeição em grau, e o pico que fica;
   §9 as entregas e as promessas (as portas por fazer), com o teto da lista;
   §10 O TETO — quem sai, quem nunca sai, e o livro cheio no orçamento;
   §11 a imutabilidade (tudo congelado, nada estoura);
   §12 o determinismo e a volta pelo save;
   §13 as notas do ambíguo. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  LIVRO_DE_FACTOS, TIPOS_DE_FACTO, COMO_CAIU, RESOLVER_NOME,
  garantirFactos, idDaPessoa, idDoLugar, anotarTurno, grauDeAfeicao,
  conheceu, conversou, derrotou, poupou, afeicaoAlcancada, entregou, esteve, descobriu,
} from "../src/livro-de-factos.js";
import { idDaGente } from "../src/mundo-base.js";
import { MARCOS_VINCULO } from "../src/vinculos.js";
import { FORCA_MAX } from "../src/npcs.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const congelar = (x) => { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); for (const k of Object.keys(x)) congelar(x[k]); } return x; };

/* o save real da 13.ª sessão (o Corrado, Porto das Pedras) */
const S13 = JSON.parse(fs.readFileSync(path.join(AQUI, "sessao-s13-fecho.json"), "utf8"));
const CTX13 = { npcs: S13.npcs, cidade: S13.cidadeAtual, heroi: "Ilse Varga" };

sec("§1 as tabelas: cada tipo de facto diz de onde vem, e escreve-se");
{
  const tipos = Object.keys(TIPOS_DE_FACTO);
  t("os tipos de facto são os da planta (§3/§4) e o nomeado à parte", J(tipos) === J(["nomeado", "visto", "falou", "afeicao", "derrotado", "recebeu", "prometeu", "esteve", "descobriu"]));
  t("cada tipo é de uma pessoa ou de um lugar", tipos.every((k) => ["pessoa", "lugar"].includes(TIPOS_DE_FACTO[k].de)));
  t("cada tipo tem um peso numérico e uma forma no save", tipos.every((k) => Number.isFinite(TIPOS_DE_FACTO[k].peso) && typeof TIPOS_DE_FACTO[k].forma === "string"));
  /* a causa (d) da planta: o que o jogo ainda não escreve DIZ que não escreve */
  const semPorta = tipos.filter((k) => TIPOS_DE_FACTO[k].porta === null);
  t("só o recebeu e o prometeu estão sem porta no jogo, e dizem-no", J(semPorta) === J(["recebeu", "prometeu"]));
  t("os outros dizem quem os produz", tipos.filter((k) => !semPorta.includes(k)).every((k) => typeof TIPOS_DE_FACTO[k].porta === "string" && TIPOS_DE_FACTO[k].porta.length > 10));
  t("as entradas são todas diferentes", new Set(tipos.map((k) => TIPOS_DE_FACTO[k].entrada)).size === tipos.length);
  t("o nomeado é o mais leve: sai primeiro no teto", tipos.every((k) => TIPOS_DE_FACTO.nomeado.peso <= TIPOS_DE_FACTO[k].peso));
  t("o visto só conta das fontes do sistema, nunca da prosa", J(TIPOS_DE_FACTO.visto.fontes) === J(["grupo", "registo", "nucleo"]));
  /* cada entrada, sozinha, escreve o seu facto */
  const ctx = { npcs: { Bruna: { nome: "Bruna", local: "Foz" } }, cidade: "Foz", dia: 2, turno: 7 };
  const um = {
    nomeado: { nomeados: ["Bruna"] },
    visto: { emCena: [{ tipo: "pessoa", nome: "Bruna", aqui: true, deOnde: "registo" }] },
    falou: { falouCom: ["Bruna"] },
    afeicao: { afeicoes: [{ quem: "Bruna", laco: { tipo: "divida", forca: 2 } }] },
    derrotado: { derrotados: [{ nome: "Bruna", rendido: true }] },
    recebeu: { entregas: [{ a: "Bruna", item: "Anel de cobre" }] },
    prometeu: { promessas: [{ a: "Bruna", o: "achar o irmão dela" }] },
    esteve: { lugar: { nome: "A Lanterna", cidade: "Foz" } },
    descobriu: { segredos: ["A Lanterna"] },
  };
  for (const k of tipos) {
    const r = anotarTurno(null, { ...ctx, ...um[k] });
    const onde = TIPOS_DE_FACTO[k].de === "pessoa" ? r.factos.pessoas["npc|Bruna"] : r.factos.lugares[idDoLugar({ nome: "A Lanterna", cidade: "Foz" })];
    t(`a entrada «${TIPOS_DE_FACTO[k].entrada}» escreve «${k}»`, !!(onde && onde[k]));
  }
  t("as tabelas são congeladas", Object.isFrozen(LIVRO_DE_FACTOS) && Object.isFrozen(TIPOS_DE_FACTO) && Object.isFrozen(COMO_CAIU) && Object.isFrozen(RESOLVER_NOME));
}

sec("§2 o save: o null, o lixo, e as campanhas de antes");
{
  const V = J({ v: 1, pessoas: {}, lugares: {} });
  for (const [rot, x] of [["null", null], ["undefined", undefined], ["lista", []], ["texto", "lixo"], ["número", 7], ["{}", {}], ["pessoas null", { pessoas: null, lugares: 3 }]]) {
    t(`garantirFactos(${rot}) é o livro vazio`, J(garantirFactos(x)) === V);
  }
  t("o save de antes (sem o campo) abre com o livro vazio", J(garantirFactos(S13.factos)) === V);
  const sujo = {
    v: 1,
    pessoas: {
      "npc|Ana": { nome: "Ana", visto: { de: 1, ate: "x", vezes: -3, turno: 4.7 }, lixo: true },
      "npc|Só nome": { nome: "Só nome" },
      "": { visto: { de: 1 } },
      "npc|Ruim": "texto",
      "npc|Caiu": { derrotado: { dia: 2, como: "explodiu" }, afeicao: { grau: 9, dia: 1 }, recebeu: ["a", "a", "", 3, "b", "c", "d", "e"] },
    },
    lugares: { "Foz|sitio|x": { esteve: { de: 1 }, descobriu: true }, "Foz|sitio|y": { descobriu: { dia: "dois" } } },
  };
  const g = garantirFactos(sujo);
  t("o campo estranho cai, a marca de dias fica limpa", J(g.pessoas["npc|Ana"]) === J({ nome: "Ana", visto: { de: 1, ate: null, vezes: 1, turno: 4 } }));
  t("a entrada sem facto nenhum cai (só o nome não é facto)", !g.pessoas["npc|Só nome"]);
  t("o id vazio e a entrada que não é objeto caem", !("" in g.pessoas) && !g.pessoas["npc|Ruim"]);
  t("a queda de forma desconhecida cai; o grau passa ao teto; a lista sem repetidos e com teto",
    !g.pessoas["npc|Caiu"].derrotado && g.pessoas["npc|Caiu"].afeicao.grau === MARCOS_VINCULO.length
    && J(g.pessoas["npc|Caiu"].recebeu) === J(["b", "c", "d", "e"].slice(-LIVRO_DE_FACTOS.recebeu)));
  t("o descobriu que não é objeto cai; o de dia lixo fica sem dia", !g.lugares["Foz|sitio|x"].descobriu && J(g.lugares["Foz|sitio|y"]) === J({ descobriu: { dia: null } }));
  t("garantir devolve sempre um objeto novo", garantirFactos(g) !== g && J(garantirFactos(g)) === J(g));
  t("ler um livro lixo nunca estoura: tudo false", [null, undefined, "x", [], {}].every((l) => !conheceu(l, "npc|Ana") && !conversou(l, "npc|Ana") && !esteve(l, "x") && !descobriu(l, "x") && !derrotou(l, "x") && !poupou(l, "x") && afeicaoAlcancada(l, "x") === 0 && !entregou(l, "x", "y")));
  t("ler com id lixo: false", !conheceu(g, null) && !conheceu(g, { id: 1 }) && !conversou(g, undefined));
  t("anotar sobre lixo começa do livro vazio", J(anotarTurno("lixo", null).factos) === V && J(anotarTurno(null, undefined).notas) === "[]");
}

sec("§3 do nome ao id — a regra de desempate");
{
  /* MARL DE OSSO (v9.195): o cartaz dizia «Marl de Osso», o registo guardou
     «Marl». Dois nomes, uma pessoa, UM id — o da base. */
  const gente = [{ nome: "Marl de Osso", cidade: "Foz" }, { nome: "Teodoro Rima", cidade: "Foz" }];
  const ctxM = { gente, npcs: { Marl: { nome: "Marl", local: "Foz" } }, cidade: "Foz" };
  const idMarl = idDaGente("Foz", { nome: "Marl de Osso" });
  t("o id da gente é o de idDaGente (mundo-base.js)", idDaPessoa("Marl de Osso", ctxM).id === idMarl);
  t("«Marl» do registo resolve para o id da base", idDaPessoa("Marl", ctxM).id === idMarl);
  t("«marl, o barqueiro» (caixa e aposto) também", idDaPessoa("marl, o barqueiro", ctxM).id === idMarl);
  t("o nome devolvido é o da fonte que manda", idDaPessoa("Marl", ctxM).nome === "Marl de Osso");
  /* os dois Marl na mesma cidade: ambíguo, e não se escreve */
  const dois = { gente: [{ nome: "Marl de Osso", cidade: "Foz" }, { nome: "Marl Ferreiro", cidade: "Foz" }], cidade: "Foz" };
  const amb = idDaPessoa("Marl", dois);
  t("dois «Marl» na mesma cidade: ambíguo, sem id", amb.id === "" && amb.motivo === "ambiguo" && amb.candidatos.length === 2);
  t("o nome inteiro desfaz a dúvida", idDaPessoa("Marl Ferreiro", dois).id === idDaGente("Foz", { nome: "Marl Ferreiro" }));
  /* em cidades diferentes, a cidade do herói desempata */
  const longe = { gente: [{ nome: "Marl de Osso", cidade: "Foz" }, { nome: "Marl Ferreiro", cidade: "Sal" }], cidade: "Sal" };
  t("dois «Marl» em cidades diferentes: fica o da cidade do herói", idDaPessoa("Marl", longe).id === idDaGente("Sal", { nome: "Marl Ferreiro" }));
  t("sem a cidade do herói, os dois de longe são ambíguos", idDaPessoa("Marl", { ...longe, cidade: "" }).motivo === "ambiguo");
  /* AS DUAS NYLA (10.ª sessão): o primeiro nome igual não é a mesma pessoa */
  const nyla = { npcs: { "Nyla Punho-de-Pedra": { nome: "Nyla Punho-de-Pedra" } } };
  t("«Nyla Pé-Leve» não é a «Nyla Punho-de-Pedra» (não há o nível só do primeiro nome)", idDaPessoa("Nyla Pé-Leve", nyla).id === "");
  t("…e «Nyla» sozinha é ela", idDaPessoa("Nyla", nyla).id === "npc|Nyla Punho-de-Pedra");
  /* o tratamento à frente não é nome (HOMONIMO.artigos) */
  const ino = { npcs: { "Inocência Bordão": { nome: "Inocência Bordão" } } };
  t("«Dona Inocência» é a Inocência Bordão", idDaPessoa("Dona Inocência", ino).id === "npc|Inocência Bordão");
  /* O NOÉ (4.ª sessão): o Cronista guardou-o no cânone, não no registo */
  t("quem só está no cânone resolve (o Noé)", idDaPessoa("Noé", { canone: [{ nome: "Noé" }] }).id === "npc|Noé");
  t("…e quando o registo ganha o nome inteiro, o do cânone é ele", idDaPessoa("Noé", { npcs: { "Noé Barqueiro": {} }, canone: ["Noé"] }).id === "npc|Noé Barqueiro");
  /* o núcleo manda sobre o registo; o grupo também */
  const nu = { nucleo: { pessoas: [{ nome: "Elmo Cardo", cidade: "Serra do Bode" }] }, npcs: { Elmo: { local: "Serra do Bode" } } };
  t("o registo curto de alguém do núcleo é ele", idDaPessoa("Elmo", nu).id === "npc|Elmo Cardo");
  t("o grupo resolve (o companheiro)", idDaPessoa("Saoirse", { grupo: [{ nome: "Saoirse" }] }).id === "npc|Saoirse");
  /* o herói nunca é gente da cena, nem pelo primeiro nome */
  const h = { heroi: "Rufo Tamanqueiro", npcs: { Rufo: {} } };
  t("o herói não se escreve, nem pelo primeiro nome", idDaPessoa("Rufo Tamanqueiro", h).motivo === "heroi" && idDaPessoa("Rufo", h).motivo === "heroi");
  t("a descrição sem ficha não se escreve («o guarda»)", idDaPessoa("o guarda", CTX13).id === "" && idDaPessoa("o guarda", CTX13).motivo === "desconhecido");
  t("o nome curto demais não casa por pedaço («Al»)", idDaPessoa("Al", { npcs: { "Al Varga": {} } }).id === "");
  t("um id feito passa como veio", idDaPessoa("npc|Corrado", null).id === "npc|Corrado" && idDaPessoa(idMarl, null).id === idMarl);
  t("o lixo: vazio, sem estourar", [null, undefined, "", "   ", 7, {}].every((x) => idDaPessoa(x, null).id === "" && idDaPessoa(x, "lixo").id === ""));
  t("a ordem das fontes é tabela", J(RESOLVER_NOME.fontes) === J(["gente", "nucleo", "grupo", "registo", "canone"]) && J(RESOLVER_NOME.niveis) === J(["exato", "prefixo"]));
}

sec("§4 «Encontrar Corrado» — o save da 13.ª sessão");
{
  const ID = "npc|Corrado";
  t("no registo da 13.ª o Corrado resolve para npc|Corrado", idDaPessoa("Corrado", CTX13).id === ID);
  t("«Corrado, empresário da arena» (a batida) é o mesmo id", idDaPessoa("Corrado, empresário da arena", CTX13).id === ID);
  t("«Corrado Vasques» (o nome inteiro que o registo não tem) é o mesmo id", idDaPessoa("Corrado Vasques", CTX13).id === ID);
  /* T1: o Mestre mostrou-o na prosa (SO_DA_PROSA): presença sem fonte do sistema */
  let r = anotarTurno(null, { ...CTX13, dia: 1, turno: 1, emCena: [{ tipo: "pessoa", nome: "Corrado", aqui: true, deOnde: "prosa" }] });
  t("T1 — a prosa que o mostra não o faz conhecido", !conheceu(r.factos, ID) && !conversou(r.factos, ID));
  /* o molde do Cronista não tinha falou_com: a heroína falou com ele do T2 ao T5 */
  for (let turno = 2; turno <= 5; turno++) r = anotarTurno(r.factos, { ...CTX13, dia: 1, turno, falouCom: [turno % 2 ? "Corrado, o empresário" : "Corrado"] });
  t("T2 — a conversa escreve-se", conversou(r.factos, ID));
  t("T2–T5 é UMA conversa, não quatro", r.factos.pessoas[ID].falou.vezes === 1 && r.factos.pessoas[ID].falou.turno === 5);
  t("quem falou foi visto (conheceu)", conheceu(r.factos, ID));
  /* os turnos seguintes já não trazem a conversa — e o facto fica */
  for (let turno = 6; turno <= 8; turno++) r = anotarTurno(r.factos, { ...CTX13, dia: 1, turno });
  t("T6–T8 sem conversa: o facto continua lá (já não dura um turno)", conversou(r.factos, ID));
  t("…mas não é a segunda conversa", !conversou(r.factos, ID, 2));
  r = anotarTurno(r.factos, { ...CTX13, dia: 1, turno: 5 + LIVRO_DE_FACTOS.vezNova.turnos + 1, falouCom: ["Corrado"] });
  t(`voltar a falar depois de mais de ${LIVRO_DE_FACTOS.vezNova.turnos} turnos é a segunda vez`, conversou(r.factos, ID, 2));
  r = anotarTurno(r.factos, { ...CTX13, dia: 2, turno: 10, falouCom: ["Corrado"] });
  t("noutro dia, mesmo no turno seguinte, é a terceira", conversou(r.factos, ID, 3) && r.factos.pessoas[ID].falou.de === 1 && r.factos.pessoas[ID].falou.ate === 2);
  r = anotarTurno(r.factos, { ...CTX13, dia: 2, turno: 10, falouCom: ["Corrado"] });
  t("o mesmo turno anotado duas vezes não soma", r.factos.pessoas[ID].falou.vezes === 3);
  r = anotarTurno(r.factos, { ...CTX13, dia: 2, turno: 1, falouCom: ["Corrado"] });
  t("o contador que recomeçou (o turno voltou atrás) conta como vez nova", r.factos.pessoas[ID].falou.vezes === 4);
  /* o Anselmo, que só aparece nas notas de outros, nunca entrou por aqui */
  t("quem não falou nem foi visto não tem entrada", !r.factos.pessoas["npc|Anselmo"]);
}

sec("§5 conhecer não é ser nomeado");
{
  /* A DELFINA (MM14): o Teodoro disse onde ela vivia, a 146 km; o registo
     ganhou-a, e a principal fechou no turno 5 sem a heroína a ver */
  const ctx = { npcs: { Teodoro: { local: "Alto do Sal" }, Delfina: { local: "Foz do Meio" } }, cidade: "Alto do Sal" };
  let r = anotarTurno(null, { ...ctx, dia: 3, turno: 5, nomeados: ["Delfina"], falouCom: ["Teodoro"] });
  t("a Delfina só nomeada: o livro sabe dela", !!r.factos.pessoas["npc|Delfina"] && r.factos.pessoas["npc|Delfina"].nomeado.de === 3);
  t("…mas não a conheceu, nem falou com ela", !conheceu(r.factos, "npc|Delfina") && !conversou(r.factos, "npc|Delfina"));
  t("o Teodoro, que falou, foi conhecido", conheceu(r.factos, "npc|Teodoro") && conversou(r.factos, "npc|Teodoro"));
  r = anotarTurno(r.factos, { ...ctx, dia: 9, turno: 30, nomeados: ["Delfina"] });
  t("ser nomeada outra vez não muda o dia em que foi nomeada", r.factos.pessoas["npc|Delfina"].nomeado.de === 3);
  /* O DÁRIO À PORTA (6.ª): chegar ao Fogão com ele lá não é falar com ele */
  const dario = { npcs: { "Dário da Cova": { local: "Fogueira da Beira" } }, cidade: "Fogueira da Beira" };
  r = anotarTurno(null, { ...dario, dia: 4, turno: 12, emCena: [{ tipo: "pessoa", nome: "Dário da Cova", aqui: true, deOnde: "registo" }], lugar: { nome: "O Fogão", cidade: "Fogueira da Beira" } });
  t("o Dário à vista pelo registo: conheceu", conheceu(r.factos, "npc|Dário da Cova"));
  t("…e a presença não é conversa", !conversou(r.factos, "npc|Dário da Cova"));
  r = anotarTurno(null, { ...dario, emCena: [{ tipo: "pessoa", nome: "Dário da Cova", aqui: false, deOnde: "registo" }] });
  t("no registo mas não à vista: nada", !conheceu(r.factos, "npc|Dário da Cova"));
  r = anotarTurno(null, { ...dario, emCena: [{ tipo: "criatura", nome: "Dário da Cova", aqui: true, deOnde: "registo" }] });
  t("uma criatura com o mesmo nome não é a pessoa", !conheceu(r.factos, "npc|Dário da Cova"));
}

sec("§6 os lugares");
{
  /* O CAMPO DAS MÃES (MM14): «descoberto» porque alguém disse que morava lá */
  const ctx = { cidade: "Baixo Valente" };
  let r = anotarTurno(null, { ...ctx, dia: 1, turno: 4, lugar: { nome: "O Sino Calado", cidade: "Baixo Valente" }, segredos: [] });
  const campo = idDoLugar({ nome: "O Campo das Mães", cidade: "Baixo Valente" });
  t("dito de longe: nem esteve, nem descobriu", !esteve(r.factos, campo) && !descobriu(r.factos, campo));
  t("onde o herói está, esteve", esteve(r.factos, idDoLugar({ nome: "O Sino Calado", cidade: "Baixo Valente" })));
  t("e a cidade também", esteve(r.factos, idDoLugar({ cidade: "Baixo Valente" })));
  r = anotarTurno(r.factos, { ...ctx, dia: 2, turno: 9, lugar: { nome: "O Campo das Mães", cidade: "Baixo Valente" }, segredos: ["O Campo das Mães"] });
  t("o segredo revelado com o herói lá: descobriu (e esteve)", descobriu(r.factos, campo) && esteve(r.factos, campo));
  t("o dia da descoberta fica", r.factos.lugares[campo].descobriu.dia === 2);
  r = anotarTurno(r.factos, { ...ctx, dia: 5, turno: 20, segredos: ["Campo das Mães"] });
  t("descobrir de novo não muda o dia (e o artigo não muda o id)", r.factos.lugares[campo].descobriu.dia === 2);
  /* O NOME NÃO É O ID (MM13): a ponte para o id da base */
  const ponte = (nome) => (/rossio oco/i.test(nome) ? "Baixo Valente|mercado" : "");
  t("com a ponte do App, o local da base tem o id da base (`Cidade|tipo`)", idDoLugar("O Rossio Oco", { cidade: "Baixo Valente", chaveDoLugar: ponte }) === "Baixo Valente|mercado");
  t("o id que o lugar já traz passa como veio", idDoLugar({ nome: "x", chave: "Baixo Valente|templo" }) === "Baixo Valente|templo");
  t("a ponte que estoura não derruba", idDoLugar("Sítio", { cidade: "Foz", chaveDoLugar: () => { throw new Error("x"); } }) === "foz|sitio|sitio");
  r = anotarTurno(null, { cidade: "Baixo Valente", chaveDoLugar: ponte, segredos: ["O Rossio Oco"] });
  t("o segredo do local da base escreve-se no id da base (o que a etapa `revelar` guarda em `chave`)", descobriu(r.factos, "Baixo Valente|mercado"));
  /* o sítio inventado, dito com outra caixa e outro artigo */
  t("o mesmo sítio, outra caixa e artigo: o mesmo id", idDoLugar({ nome: "o posto da Estrada", cidade: "Serra do Bode" }) === idDoLugar({ nome: "Posto da estrada", cidade: "serra do bode" }));
  t("um lugar e uma cidade com o mesmo nome não se confundem", idDoLugar({ cidade: "Foz" }) !== idDoLugar({ nome: "Foz", cidade: "Sal" }));
  t("o lugar que é a própria cidade é a cidade", idDoLugar({ nome: "Foz", cidade: "Foz" }) === idDoLugar({ cidade: "Foz" }));
  /* o cómodo é do prédio (o quarto de cima é o Sino Calado) */
  r = anotarTurno(null, { lugar: { nome: "O quarto de cima", dentroDe: "O Sino Calado", cidade: "Baixo Valente" } });
  t("no cómodo, esteve também no prédio", esteve(r.factos, idDoLugar({ nome: "Sino Calado", cidade: "Baixo Valente" })));
  r = anotarTurno(null, { naEstrada: true, cidade: "Foz" });
  t("na estrada, a cidade de onde se veio não conta", !esteve(r.factos, idDoLugar({ cidade: "Foz" })));
  t("sem nome nem cidade: sem id", idDoLugar(null) === "" && idDoLugar({}, null) === "" && idDoLugar("   ") === "");
  r = anotarTurno(null, { cidade: "Foz", dia: 1, turno: 1, lugar: "A Lanterna" });
  r = anotarTurno(r.factos, { cidade: "Foz", dia: 1, turno: 2, lugar: "A Lanterna" });
  t("ficar no mesmo lugar turno após turno é uma estada só", r.factos.lugares[idDoLugar("A Lanterna", { cidade: "Foz" })].esteve.vezes === 1);
}

sec("§7 quem cai");
{
  const ctx = { npcs: { Osric: {}, "Vera Corda-Curta": {}, Brom: {} }, dia: 6, turno: 40 };
  let r = anotarTurno(null, { ...ctx, derrotados: [{ nome: "Osric", rendido: true }, { nome: "Vera Corda-Curta", vida: 0 }, { nome: "Brom", fugiu: true, rendido: true }, { nome: "Bandido 2", vida: 0 }] });
  t("o rendido: derrotou, e poupou", derrotou(r.factos, "npc|Osric") && poupou(r.factos, "npc|Osric"));
  t("a que tombou: derrotou, e não poupou", derrotou(r.factos, "npc|Vera Corda-Curta") && !poupou(r.factos, "npc|Vera Corda-Curta"));
  t("o que fugiu lê-se antes do rendido (v9.14)", r.factos.pessoas["npc|Brom"].derrotado.como === "fugiu" && poupou(r.factos, "npc|Brom"));
  t("o bandido sem ficha não entra no livro", Object.keys(r.factos.pessoas).every((id) => !/bandido/i.test(id)));
  t("quem caiu numa luta com o herói foi visto", conheceu(r.factos, "npc|Osric"));
  r = anotarTurno(r.factos, { ...ctx, dia: 7, derrotados: [{ nome: "Osric", como: "morto" }] });
  t("o rendido que depois morreu: fica morto, com o dia da morte", r.factos.pessoas["npc|Osric"].derrotado.como === "morto" && r.factos.pessoas["npc|Osric"].derrotado.dia === 7 && !poupou(r.factos, "npc|Osric"));
  r = anotarTurno(r.factos, { ...ctx, dia: 8, derrotados: [{ nome: "Osric", como: "rendido" }] });
  t("a queda mais leve não apaga a mais pesada", r.factos.pessoas["npc|Osric"].derrotado.como === "morto");
  t("os pesos da queda são tabela, e o morto pesa mais", Object.keys(COMO_CAIU.pesos).every((k) => COMO_CAIU.pesos.morto >= COMO_CAIU.pesos[k]) && !COMO_CAIU.poupado.includes("morto"));
}

sec("§8 a afeição em grau");
{
  t("o vínculo do companheiro: os marcos dão 1 a 4", [[0, 0], [24, 0], [25, 1], [50, 2], [74, 2], [75, 3], [100, 4]].every(([v, g]) => grauDeAfeicao({ vinculo: v }) === g));
  t("o laço dos outros: a força, até FORCA_MAX", grauDeAfeicao({ laco: { forca: 2 } }) === 2 && grauDeAfeicao({ laco: { forca: 9 } }) === FORCA_MAX);
  t("o laço rompido conta 0", grauDeAfeicao({ laco: { forca: 3, rompido: true } }) === 0);
  t("o grau direto passa ao teto", grauDeAfeicao({ grau: 2 }) === 2 && grauDeAfeicao({ grau: 99 }) === MARCOS_VINCULO.length);
  t("lixo: 0", [null, undefined, "x", {}, { vinculo: "x" }, { laco: "x" }].every((x) => grauDeAfeicao(x) === 0));
  const ctx = { grupo: [{ nome: "Saoirse" }] };
  let r = anotarTurno(null, { ...ctx, dia: 3, afeicoes: [{ quem: "Saoirse", vinculo: 50 }] });
  t("a Saoirse chegou à Amizade: grau 2", afeicaoAlcancada(r.factos, "npc|Saoirse") === 2);
  r = anotarTurno(r.factos, { ...ctx, dia: 9, afeicoes: [{ quem: "Saoirse", vinculo: 20 }] });
  t("o vínculo que desceu não apaga o grau alcançado (o livro guarda o pico)", afeicaoAlcancada(r.factos, "npc|Saoirse") === 2 && r.factos.pessoas["npc|Saoirse"].afeicao.dia === 3);
  r = anotarTurno(r.factos, { ...ctx, dia: 12, afeicoes: [{ quem: "Saoirse", vinculo: 80 }] });
  t("subir ao grau seguinte escreve o dia novo", afeicaoAlcancada(r.factos, "npc|Saoirse") === 3 && r.factos.pessoas["npc|Saoirse"].afeicao.dia === 12);
  r = anotarTurno(null, { ...ctx, afeicoes: [{ quem: "Saoirse", vinculo: 10 }] });
  t("abaixo do primeiro marco não se escreve nada", !r.factos.pessoas["npc|Saoirse"]);
}

sec("§9 as entregas e as promessas");
{
  const ctx = { npcs: { Lia: {} }, dia: 4 };
  let r = anotarTurno(null, { ...ctx, entregas: [{ a: "Lia", item: "Carta lacrada" }] });
  t("deu a carta à Lia: entregou", entregou(r.factos, "npc|Lia", "carta lacrada") && entregou(r.factos, "npc|Lia", { nome: "Carta Lacrada" }));
  t("…e não outro item", !entregou(r.factos, "npc|Lia", "Anel") && !entregou(r.factos, "npc|Lia", ""));
  for (const item of ["A", "B", "C", "D", "E", "Carta lacrada"]) r = anotarTurno(r.factos, { ...ctx, entregas: [{ a: "Lia", item }] });
  t(`a lista fica nas ${LIVRO_DE_FACTOS.recebeu} mais recentes, sem repetir`, r.factos.pessoas["npc|Lia"].recebeu.length === LIVRO_DE_FACTOS.recebeu && r.factos.pessoas["npc|Lia"].recebeu.slice(-1)[0] === "Carta lacrada");
  for (const o of ["achar o irmão", "pagar a dívida", "voltar no inverno", "achar o irmão", "calar o nome"]) r = anotarTurno(r.factos, { ...ctx, promessas: [{ a: "Lia", o }] });
  const pr = r.factos.pessoas["npc|Lia"].prometeu;
  t(`as promessas ficam nas ${LIVRO_DE_FACTOS.prometeu} mais recentes, sem repetir`, pr.length === LIVRO_DE_FACTOS.prometeu && J(pr.map((p) => p.o)) === J(["pagar a dívida", "voltar no inverno", "calar o nome"]));
  r = anotarTurno(null, { ...ctx, entregas: [{ a: "Lia" }, { item: "x" }, null], promessas: [{ a: "Lia", o: "" }, "lixo"] });
  t("entrega sem item, sem pessoa, ou promessa vazia: nada", !r.factos.pessoas["npc|Lia"]);
}

sec("§10 o teto");
{
  const T = LIVRO_DE_FACTOS.pessoas;
  const npcs = {};
  for (let i = 0; i < T + 10; i++) npcs[`Pessoa${String(i).padStart(3, "0")}`] = {};
  let livro = null;
  /* as dez primeiras só nomeadas (as mais leves), as outras vistas */
  livro = anotarTurno(livro, { npcs, dia: 0, turno: 0, nomeados: Object.keys(npcs).slice(0, 10) }).factos;
  livro = anotarTurno(livro, { npcs, dia: 1, turno: 1, emCena: Object.keys(npcs).slice(10).map((nome) => ({ tipo: "pessoa", nome, aqui: true, deOnde: "registo" })) }).factos;
  t(`o livro não passa de ${T} pessoas`, Object.keys(livro.pessoas).length === T);
  t("saíram as mais leves (as só nomeadas)", Object.keys(npcs).slice(0, 10).every((n) => !livro.pessoas[`npc|${n}`]));
  /* protegida, a só nomeada fica */
  const r2 = anotarTurno(null, { npcs, nomeados: Object.keys(npcs).slice(0, 10), emCena: Object.keys(npcs).slice(10).map((nome) => ({ tipo: "pessoa", nome, aqui: true, deOnde: "registo" })), protegidos: ["npc|Pessoa003"] }).factos;
  t("quem a quest aberta protege nunca sai", !!r2.pessoas["npc|Pessoa003"] && Object.keys(r2.pessoas).length === T);
  /* entre iguais, sai a mais velha */
  let v = null;
  const nomes = Object.keys(npcs);
  for (let i = 0; i < nomes.length; i++) v = anotarTurno(v, { npcs, dia: i, turno: i, falouCom: [nomes[i]] }).factos;
  t("entre pesos iguais, saem as mais velhas", nomes.slice(0, 10).every((n) => !v.pessoas[`npc|${n}`]) && nomes.slice(10).every((n) => !!v.pessoas[`npc|${n}`]));
  /* os lugares têm o seu teto */
  let l = null;
  for (let i = 0; i < LIVRO_DE_FACTOS.lugares + 5; i++) l = anotarTurno(l, { dia: i, turno: i, lugar: { nome: `Sítio ${i}` } }).factos;
  t(`o livro não passa de ${LIVRO_DE_FACTOS.lugares} lugares`, Object.keys(l.lugares).length === LIVRO_DE_FACTOS.lugares);
  t("o garantir do load também apara", Object.keys(garantirFactos({ pessoas: Object.fromEntries(nomes.map((n, i) => [`npc|${n}`, { visto: { de: i } }])) }).pessoas).length === T);

  /* O LIVRO CHEIO NO ORÇAMENTO: 120 pessoas como uma campanha longa as
     deixa (nome e sobrenome, vistas e conversadas em dias de três dígitos,
     um terço com afeição, um quinto caídas, uma em dez com itens e
     promessas) e 100 lugares em cidades de três palavras */
  const cheio = { v: 1, pessoas: {}, lugares: {} };
  for (let i = 0; i < LIVRO_DE_FACTOS.pessoas; i++) {
    const nome = `Bartolomeu${i} Corda-Curta da Fonte`.slice(0, LIVRO_DE_FACTOS.nome);
    const marca = { de: 100 + i, ate: 300 + i, vezes: 12, turno: 1000 + i };
    const e = { nome, nomeado: { de: 100 + i }, visto: marca, falou: marca };
    if (i % 3 === 0) e.afeicao = { grau: 3, dia: 200 + i };
    if (i % 5 === 0) e.derrotado = { dia: 250 + i, como: "desacordado" };
    if (i % 10 === 0) { e.recebeu = ["Anel de cobre com selo", "Carta lacrada do conde", "Mapa do Vau", "Adaga"]; e.prometeu = [{ o: "achar o irmão dela no Vau das Garças antes do inverno", dia: 210 }, { o: "pagar a dívida", dia: 220 }, { o: "calar o nome", dia: 230 }]; }
    cheio.pessoas[idDaGente("Porto das Pedras Altas", { nome })] = e;
  }
  for (let i = 0; i < LIVRO_DE_FACTOS.lugares; i++) cheio.lugares[`porto das pedras altas|sitio|largo da liça velha ${i}`] = { nome: `O Largo da Liça Velha ${i}`, esteve: { de: 100 + i, ate: 300 + i, vezes: 5, turno: 1000 + i }, ...(i % 4 ? {} : { descobriu: { dia: 200 + i } }) };
  const chars = J(garantirFactos(cheio)).length;
  console.log(`       o livro cheio: ${chars} caracteres (orçamento ${LIVRO_DE_FACTOS.chars})`);
  t("o livro cheio cabe no orçamento da tabela", chars <= LIVRO_DE_FACTOS.chars, String(chars));
  t("o garantir não perde nada do livro cheio bem formado", J(garantirFactos(cheio)) === J(cheio));
}

sec("§11 a imutabilidade");
{
  const ctx = congelar({ npcs: { Corrado: { local: "Porto das Pedras" } }, cidade: "Porto das Pedras", dia: 1, turno: 2, falouCom: ["Corrado"], emCena: [{ tipo: "pessoa", nome: "Corrado", aqui: true, deOnde: "registo" }], derrotados: [{ nome: "Corrado", rendido: true }], afeicoes: [{ quem: "Corrado", grau: 1 }], entregas: [{ a: "Corrado", item: "Moeda" }], promessas: [{ a: "Corrado", o: "voltar" }], lugar: { nome: "Largo da Liça", cidade: "Porto das Pedras" }, segredos: ["Largo da Liça"], protegidos: ["npc|Corrado"] });
  let r1 = null, erro = null;
  try { r1 = anotarTurno(null, ctx); } catch (e) { erro = e; }
  t("o ocorrido congelado não estoura", !erro && !!r1, erro && erro.message);
  const livro = congelar(r1.factos);
  const antes = J(livro);
  let r2 = null;
  erro = null;
  try { r2 = anotarTurno(livro, { ...ctx, turno: 9, dia: 2 }); } catch (e) { erro = e; }
  t("o livro congelado não estoura", !erro && !!r2, erro && erro.message);
  t("o livro recebido não mudou", J(livro) === antes);
  t("o livro devolvido é outro objeto, com o facto novo", r2.factos !== livro && r2.factos.pessoas["npc|Corrado"].falou.vezes === 2 && livro.pessoas["npc|Corrado"].falou.vezes === 1);
  t("garantir sobre o congelado não estoura e não o muda", (() => { try { garantirFactos(livro); return J(livro) === antes; } catch { return false; } })());
}

sec("§12 o determinismo e a volta pelo save");
{
  const turno = (livro, i) => anotarTurno(livro, { ...CTX13, dia: Math.floor(i / 5), turno: i, falouCom: i % 3 ? ["Corrado"] : ["Tobias", "Corrado, o empresário"], emCena: [{ tipo: "pessoa", nome: "Osric", aqui: true, deOnde: "registo" }], lugar: { nome: i % 2 ? "Largo da Liça" : "A Taverna da Âncora", cidade: "Porto das Pedras" }, derrotados: i === 7 ? [{ nome: "Tobias", desacordado: true }] : [] }).factos;
  let a = null, b = null;
  for (let i = 0; i < 30; i++) { a = turno(a, i); b = turno(b, i); }
  t("a mesma sequência dá o mesmo livro, letra a letra", J(a) === J(b));
  t("o livro sobrevive à ida e volta pelo save (JSON + garantir)", J(garantirFactos(JSON.parse(J(a)))) === J(a));
  t("o livro é só dado: nenhuma função, nenhum undefined", !J(a).includes("undefined") && J(JSON.parse(J(a))) === J(a));
  t("a versão do livro é a da tabela", a.v === LIVRO_DE_FACTOS.v);
}

sec("§13 as notas do ambíguo");
{
  const ctx = { gente: [{ nome: "Marl de Osso", cidade: "Foz" }, { nome: "Marl Ferreiro", cidade: "Foz" }], cidade: "Foz", falouCom: ["Marl", "o guarda"] };
  const r = anotarTurno(null, ctx);
  t("o ambíguo não escreve nada", Object.keys(r.factos.pessoas).length === 0);
  t("…e deixa uma nota, com os candidatos", r.notas.length === 1 && r.notas[0].nome === "Marl" && r.notas[0].motivo === "ambiguo" && r.notas[0].candidatos.length === 2);
  t("o desconhecido não deixa nota (é ruído, não dúvida)", !r.notas.some((n) => n.nome === "o guarda"));
}

console.log(`\n${bons} ok · ${maus} falhas`);
if (maus) process.exit(1);
