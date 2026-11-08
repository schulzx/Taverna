/* A FIAÇÃO DO LIVRO DE FACTOS, NOS MOTORES (08/11/2026, Fase BQ · BQ2)

   A BQ1 deu o livro (src/livro-de-factos.js); a BQ2 liga-o. Esta suíte
   prova o lado dos motores — o App (o ref, o save, o load, a escrita da
   presença) é do oficial, e prova-se nas suítes dele. Tudo jogado, nada
   lido do texto de src/motor/ (a catraca teste-assercoes-de-texto):
   §1 o efeito do Cronista — `{ tipo: "factos", dia, turno, nomeados,
      falouCom, segredos }`, plano, a própria entrada do `anotarTurno`;
      a conversa, o segredo e quem só foi nomeado; nada, e não há efeito;
   §2 o efeito da luta — os caídos da vitória declarada, com o como;
   §3 a porta a mais das missões — «ENCONTRAR CORRADO» (o save real da
      13.ª): a conversa do T2, escrita pelo efeito do Cronista, fecha a
      principal num turno sem conversa; e o que hoje fecha, fecha igual;
   §4 a porta e as duas pessoas — Nyla e Nyla, a Delfina de outra cidade,
      o Marl de Osso;
   §5 o segredo que fica — a etapa guardada pelo facto, com o livro;
   §6 as cópias do mundo das missões nos motores levam o livro — o
      conferente do depois fecha a principal da 13.ª pelo livro;
   §7 o vilão lê o livro — quem o herói poupou acorda a leitura
      «sentimental», e o livro vazio não muda uma linha da pauta;
   §8 a escrita do turno no motor (motor/livro-do-turno.js) — um elenco só,
      do estado; a presença do fim da resposta; e o REPLAY produz o livro
      como o App (o passo «o livro de factos» e o efeito do Cronista), e
      uma sessão gravada antes do livro continua sem ele (a régua do minuto). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  TIPOS_DE_FACTO, COMO_CAIU, garantirFactos, anotarTurno, idDoLugar,
  conversou, conheceu, poupou, derrotou, descobriu, pessoaDoLivro, quedasDoLivro,
} from "../src/livro-de-factos.js";
import * as M from "../src/missoes.js";
import * as SAGA from "../src/saga.js";
import { FACTOS_DO_CRONISTA } from "../src/motor/cronista-do-turno.js";
import { caidosParaOLivro } from "../src/motor/luta-do-turno.js";
import { osOrgaosDoDepois, PORTAS_DO_DEPOIS } from "../src/motor/depois-do-turno.js";
import { aPautaDoTurno } from "../src/motor/pauta-do-turno.js";
import { jogarOAceito } from "./cronista-bloco.mjs";
import { lutaDeBolso } from "./combate-bloco.mjs";
import { lerODourado, correrAPeca, casosDaPauta, osModulos, osPadroes } from "./pauta-bloco.mjs";
import { elencoDoLivro, oQueACenaDaAoLivro, anotarOLivro } from "../src/motor/livro-do-turno.js";
import { correrOTurno, PASSOS_DO_REPLAY, NASCERAM_DEPOIS_DA_GRAVACAO, DONO_DO_CAMPO } from "../src/sessao.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* o save real da 13.ª sessão (o Corrado, Porto das Pedras) */
const S13 = JSON.parse(fs.readFileSync(path.join(AQUI, "sessao-s13-fecho.json"), "utf8"));
const HEROI = "Ilse Varga";
const CTX13 = { npcs: S13.npcs, cidade: S13.cidadeAtual, heroi: HEROI };
const factosDe = (efeitos) => efeitos.filter((e) => e && e.tipo === "factos");

sec("§1 o efeito do Cronista");
{
  const estado = { npcs: S13.npcs, dia: 1, npcTurno: 2, cidadeAtual: S13.cidadeAtual, personagem: { nome: HEROI } };
  t("as chaves do efeito são entradas do anotarTurno (TIPOS_DE_FACTO[*].entrada)",
    Object.keys(FACTOS_DO_CRONISTA).every((k) => Object.values(TIPOS_DE_FACTO).some((x) => x.entrada === k)));
  const a = jogarOAceito({ falou_com: ["Corrado", "  ", 7] }, { estado });
  const fs1 = factosDe(a.efeitos);
  t("a conversa vista sai num efeito «factos», um só", fs1.length === 1, J(fs1));
  t("plano, com o dia e o turno do estado: { tipo, dia, turno, falouCom }", J(fs1[0]) === J({ tipo: "factos", dia: 1, turno: 2, falouCom: ["Corrado"] }), J(fs1[0]));
  t("e as missões continuam a ser conferidas com a conversa (a porta de sempre)", a.portas.some((p) => p[0] === "conferirCom" && J(p[2]) === J({ falouCom: ["Corrado"] })));
  const doLivro = anotarTurno(null, { ...CTX13, ...fs1[0] }).factos;
  t("o efeito, anotado com o elenco, escreve a conversa no id do Corrado", conversou(doLivro, "npc|Corrado") && conheceu(doLivro, "npc|Corrado"));

  /* quem nasce no registo por ser nomeado: `nomeado`, nunca `conheceu` */
  const b = jogarOAceito({ pessoas: [{ nome: "Tobias Rente", papel: "estivador", genero: "ele" }, { nome: "Corrado", papel: "Organizador de lutas" }, { nome: HEROI }] }, { estado });
  const fs2 = factosDe(b.efeitos);
  t("quem nasce no registo vai como nomeado — e só ele (o Corrado já lá estava; a heroína não é gente)", fs2.length === 1 && J(fs2[0].nomeados) === J(["Tobias Rente"]) && !("falouCom" in fs2[0]), J(fs2));
  const npcsDepois = b.estado.npcs;
  const l2 = anotarTurno(null, { npcs: npcsDepois, cidade: S13.cidadeAtual, heroi: HEROI, ...fs2[0] }).factos;
  t("anotado, o Tobias fica nomeado e NÃO conhecido", !!(l2.pessoas["npc|Tobias Rente"] || {}).nomeado && !conheceu(l2, "npc|Tobias Rente"));
  const ordem = b.efeitos.map((e) => e.tipo);
  t("o efeito «factos» vem depois do «npcs» (o App anota com o registo que já tem a pessoa)", ordem.indexOf("npcs") >= 0 && ordem.indexOf("factos") > ordem.indexOf("npcs"), ordem.join(","));

  /* o segredo que cai com o herói no lugar do marco */
  const espinha = { atos: [{ ato: 0, marcos: [{ id: "mk1", titulo: "O que o Largo esconde", feitio: "descobrir", onde: "Largo da Liça", segredo: { acha: "investigacao", coisa: "a arena tem um fundo falso" }, feito: false }] }] };
  const c = jogarOAceito({}, { estado: { ...estado, espinha, lugar: { nome: "Largo da Liça", cidade: S13.cidadeAtual } }, testeDoTurno: { pericia: "Investigação", sucesso: true } });
  const fs3 = factosDe(c.efeitos);
  t("o segredo revelado vai como segredos (o nome do lugar)", fs3.length === 1 && J(fs3[0].segredos) === J(["Largo da Liça"]), J(fs3));
  const l3 = anotarTurno(null, { ...CTX13, ...fs3[0] }).factos;
  t("anotado, o lugar fica descoberto pelo id", descobriu(l3, idDoLugar("Largo da Liça", { cidade: S13.cidadeAtual })));

  const d = jogarOAceito({ falou_com: [] }, { estado });
  t("nada para o livro: nenhum efeito «factos» (o turno corre como antes)", factosDe(d.efeitos).length === 0);
  const e2 = jogarOAceito({ falou_com: ["Corrado", "Corrado"] }, { estado });
  t("a mesma pessoa duas vezes na lista vai uma", J(factosDe(e2.efeitos)[0].falouCom) === J(["Corrado"]));
  t("determinístico: o mesmo aceito dá o mesmo efeito", J(factosDe(jogarOAceito({ falou_com: ["Corrado"] }, { estado }).efeitos)) === J(fs1));
  const lixo = jogarOAceito({ falou_com: ["Corrado"] }, { estado: { npcs: {}, dia: undefined, npcTurno: null } });
  t("estado sem dia nem turno: o efeito sai na mesma, e o livro escreve sem dia", factosDe(lixo.efeitos).length === 1 && conversou(anotarTurno(null, { npcs: { Corrado: {} }, ...factosDe(lixo.efeitos)[0] }).factos, "npc|Corrado"));
}

sec("§2 o efeito da luta");
{
  t("caidosParaOLivro leva o nome e as marcas de COMO_CAIU.deFlags, e nada mais",
    J(caidosParaOLivro([{ nome: "Lobo", vida: 0, derrotado: true }, { nome: "Bandido", rendido: true, derrotado: true, ataque: 3 }, { nome: "Vigia", desacordado: true }, null, { nome: "  " }, { vida: 0 }]))
      === J([{ nome: "Lobo" }, { nome: "Bandido", rendido: true }, { nome: "Vigia", desacordado: true }]));
  t("o lixo dá a lista vazia", J(caidosParaOLivro(null)) === "[]" && J(caidosParaOLivro({})) === "[]");
  /* a vitória declarada pelo Mestre (combate_encerrar com os caídos) */
  const efs = [];
  const b = lutaDeBolso({ pers: { nome: "Vera", nivel: 2, moedas: 0, grupo: [] }, mudancas: { combate_encerrar: true },
    combate: { inimigos: [{ nome: "Lobo", ameaca: "comum", vida: 0, vidaMax: 10, derrotado: true }, { nome: "Bandido", ameaca: "comum", vida: 0, vidaMax: 10, derrotado: true, rendido: true }] } },
  { aplicar: (xs) => { efs.push(...xs); } });
  const fl = factosDe(efs);
  t("a vitória declarada sai num efeito «factos» com os caídos e o como", fl.length === 1 && J(fl[0]) === J({ tipo: "factos", derrotados: [{ nome: "Lobo" }, { nome: "Bandido", rendido: true }] }), J(fl));
  t("ao lado do «derrotados» da sessão, que fica como era", efs.some((e) => e.tipo === "derrotados") && b.saida && Array.isArray(b.saida.msgs));
  const livro = anotarTurno(null, { npcs: { Bandido: { nome: "Bandido" } }, dia: 3, ...fl[0] }).factos;
  t("anotado: o Bandido rendido foi poupado (e derrotado); o Lobo sem ficha não se escreve", poupou(livro, "npc|Bandido") && derrotou(livro, "npc|Bandido") && !livro.pessoas["npc|Lobo"]);
  const semVitoria = [];
  lutaDeBolso({ pers: { nome: "Vera", nivel: 2, grupo: [] }, mudancas: {}, combate: { inimigos: [{ nome: "Lobo", ameaca: "comum", vida: 5, vidaMax: 10 }] } }, { aplicar: (xs) => { semVitoria.push(...xs); } });
  t("sem vitória, nenhum efeito «factos»", factosDe(semVitoria).length === 0);
}

sec("§3 «Encontrar Corrado» — a porta a mais das missões (o save da 13.ª)");
const mundo13 = (extra) => ({ cidadeAtual: S13.cidadeAtual, lugarAtual: { nome: "Largo da Liça", cidade: S13.cidadeAtual }, npcs: S13.npcs, dia: 1, soPeloFato: SAGA.fatosQueFecham(S13.espinha), falouCom: [], segredosRevelados: [], derrotados: [], inventario: [], equipamento: [], revelados: [], ...extra });
{
  const etapa = S13.missoes[0].etapas[0];
  t("a principal da 13.ª é «Encontrar Corrado», guardada pelo facto", etapa.tipo === "falar_com" && etapa.alvo === "Corrado" && SAGA.fatosQueFecham(S13.espinha).pessoas.includes("Corrado"));
  /* T2: o Cronista vê a conversa; o efeito vai ao livro */
  const a = jogarOAceito({ falou_com: ["Corrado, o empresário"] }, { estado: { npcs: S13.npcs, dia: 1, npcTurno: 2 } });
  const livro = anotarTurno(garantirFactos(null), { ...CTX13, ...factosDe(a.efeitos)[0] }).factos;
  /* T6: outro turno, sem conversa, e a heroína já noutro sítio da cidade */
  const t6 = { lugarAtual: { nome: "A Taverna da Âncora", cidade: S13.cidadeAtual } };
  t("sem o livro, o T6 sem conversa não fecha (o que acontecia na 13.ª)", M.conferir(S13.missoes, mundo13(t6)).concluidas.length === 0);
  t("com o livro, a conversa do T2 fecha a principal no T6", M.conferir(S13.missoes, mundo13({ ...t6, factos: livro })).concluidas.length === 1);
  t("o livro vazio não fecha nada", M.conferir(S13.missoes, mundo13({ ...t6, factos: garantirFactos(null) })).concluidas.length === 0);
  t("o Corrado só VISTO (sem conversa) não fecha a etapa guardada pela conversa",
    M.conferir(S13.missoes, mundo13({ ...t6, factos: anotarTurno(null, { ...CTX13, dia: 1, turno: 2, emCena: [{ tipo: "pessoa", nome: "Corrado", aqui: true, deOnde: "registo" }] }).factos })).concluidas.length === 0);
  /* o que hoje fecha, fecha igual */
  t("a conversa do turno fecha como sempre, com e sem livro", [undefined, garantirFactos(null), livro].every((f) => M.conferir(S13.missoes, mundo13({ falouCom: ["Corrado"], ...(f ? { factos: f } : {}) })).concluidas.length === 1));
  /* a régua inteira: cada combinação de hoje dá o mesmo veredito com o livro vazio, e nenhuma que fechava deixa de fechar com o livro cheio */
  const ETAPAS_V = [etapa, { tipo: "falar_com", alvo: "Corrado", feito: false }, { tipo: "falar_com", alvo: "Corrado", onde: "Largo da Liça, em Porto das Pedras", feito: false }, { tipo: "falar_com", alvo: "Corrado", cidade: "Foz do Meio", feito: false }, { tipo: "falar_com", alvo: "Ninguém Daqui", feito: false }];
  const MUNDOS_V = [{}, t6, { falouCom: ["Corrado"] }, { falouCom: ["Corrado"], ...t6 }, { soPeloFato: null }, { soPeloFato: null, ...t6 }, { cidadeAtual: "Foz do Meio", lugarAtual: null }, { cidadeAtual: "Foz do Meio", lugarAtual: null, falouCom: ["Corrado"] }];
  let iguais = 0, total = 0, perdeu = 0;
  for (const e of ETAPAS_V) for (const m of MUNDOS_V) {
    total++;
    const hoje = M.etapaDef("falar_com").ver(e, mundo13(m));
    if (hoje === M.etapaDef("falar_com").ver(e, mundo13({ ...m, factos: garantirFactos(null) }))) iguais++;
    if (hoje && !M.etapaDef("falar_com").ver(e, mundo13({ ...m, factos: livro }))) perdeu++;
  }
  t(`as ${total} combinações de hoje: o livro vazio não muda nenhuma, e o cheio não desfaz nenhuma que fechava`, iguais === total && perdeu === 0, `${iguais}/${total}, ${perdeu} perdidas`);
  t("o lixo no lugar do livro não estoura e não fecha", [null, 7, "x", [], { pessoas: null }].every((f) => M.conferir(S13.missoes, mundo13({ ...t6, factos: f })).concluidas.length === 0));
}

sec("§4 a porta e as duas pessoas");
{
  const livro = garantirFactos({ pessoas: {
    "npc|Nyla Pé-Leve": { nome: "Nyla Pé-Leve", falou: { de: 1, ate: 1, vezes: 1, turno: 3 } },
    "npc|Nyla Punho-de-Pedra": { nome: "Nyla Punho-de-Pedra", visto: { de: 1, ate: 1, vezes: 1, turno: 3 } },
    "Porto Velho|gente|Delfina da Névoa": { nome: "Delfina da Névoa", falou: { de: 2, ate: 2, vezes: 1, turno: 9 } },
    "npc|Marl": { nome: "Marl", falou: { de: 1, ate: 1, vezes: 1, turno: 1 } },
    "Foz|gente|Ana Rasa": { nome: "Ana Rasa", falou: { de: 1, ate: 1, vezes: 1, turno: 1 } },
    "Vau|gente|Ana Rasa": { nome: "Ana Rasa", visto: { de: 1, ate: 1, vezes: 1, turno: 1 } },
  } });
  t("o nome inteiro acha a pessoa do livro", pessoaDoLivro(livro, "Nyla Pé-Leve") === "npc|Nyla Pé-Leve");
  t("«Nyla» sozinha são duas — nenhuma", pessoaDoLivro(livro, "Nyla") === "");
  t("«Marl de Osso» (a etapa) é o «Marl» do livro, palavra a palavra", pessoaDoLivro(livro, "Marl de Osso") === "npc|Marl");
  t("duas Ana Rasa da base: fica a da cidade do herói, e só com ela", pessoaDoLivro(livro, "Ana Rasa", { cidade: "Foz" }) === "Foz|gente|Ana Rasa" && pessoaDoLivro(livro, "Ana Rasa") === "");
  t("um id que o livro tem passa como veio; o lixo dá vazio", pessoaDoLivro(livro, "npc|Marl") === "npc|Marl" && [null, undefined, 7, "", "  "].every((x) => pessoaDoLivro(livro, x) === "") && pessoaDoLivro(null, "Marl") === "");
  const ver = (e, m) => M.etapaDef("falar_com").ver(e, { cidadeAtual: "Foz", lugarAtual: null, npcs: {}, falouCom: [], factos: livro, ...m });
  t("Nyla Punho-de-Pedra foi vista e não falou: a porta não abre", !ver({ tipo: "falar_com", alvo: "Nyla Punho-de-Pedra" }));
  t("a Delfina com quem se falou em Porto Velho não fecha a etapa da Delfina de Foz", !ver({ tipo: "falar_com", alvo: "Delfina da Névoa", cidade: "Foz" }));
  t("…e fecha a de Porto Velho", ver({ tipo: "falar_com", alvo: "Delfina da Névoa", onde: "A Doca, em Porto Velho" }));
  t("«Encontrar Marl de Osso» fecha pela conversa com o Marl", ver({ tipo: "falar_com", alvo: "Marl de Osso" }));
}

sec("§5 o segredo que fica");
{
  const cidade = S13.cidadeAtual;
  const etapa = { tipo: "revelar", alvo: "Largo da Liça", feito: false };
  const guardado = { soPeloFato: { lugares: ["Largo da Liça"], pessoas: [] } };
  const aqui = { lugarAtual: { nome: "Largo da Liça", cidade } };
  const livro = anotarTurno(null, { cidade, dia: 1, turno: 4, segredos: ["Largo da Liça"] }).factos;
  t("o lugar guardado pelo facto, sem o segredo do turno, não cai", !M.etapaDef("revelar").ver(etapa, mundo13({ ...guardado, ...aqui })));
  t("com o livro (o segredo de ontem), cai com o herói lá", M.etapaDef("revelar").ver(etapa, mundo13({ ...guardado, ...aqui, factos: livro })));
  t("…e não cai com o herói longe (estar lá continua a contar)", !M.etapaDef("revelar").ver(etapa, mundo13({ ...guardado, lugarAtual: { nome: "A Taverna da Âncora", cidade }, factos: livro })));
  const pelaBase = anotarTurno(null, { cidade, dia: 1, turno: 4, segredos: ["Largo da Liça"], chaveDoLugar: (n) => (n === "Largo da Liça" ? `${cidade}|arena` : null) }).factos;
  t("escrito pela ponte da base (Cidade|tipo), lê-se pela mesma ponte", M.etapaDef("revelar").ver(etapa, mundo13({ ...guardado, ...aqui, factos: pelaBase, chaveDoLugar: (n) => (n === "Largo da Liça" ? `${cidade}|arena` : null) })));
  t("o segredo do turno fecha como sempre, com e sem livro", [undefined, garantirFactos(null)].every((f) => M.etapaDef("revelar").ver(etapa, mundo13({ ...guardado, ...aqui, segredosRevelados: ["Largo da Liça"], ...(f ? { factos: f } : {}) }))));
}

sec("§6 as cópias do mundo das missões nos motores levam o livro");
{
  const livro = anotarTurno(null, { ...CTX13, dia: 1, turno: 2, falouCom: ["Corrado"] }).factos;
  const correr = (factos) => {
    const loja = {};
    const portas = {};
    for (const n of PORTAS_DO_DEPOIS) portas[n] = () => undefined;
    delete portas.sorte; delete portas.reler;
    Object.assign(portas, { aplicar: (x) => Object.assign(loja, x), calou: () => undefined, pushMsgs: (xs) => xs });
    const estado = { missoes: S13.missoes, npcs: S13.npcs, cidadeAtual: S13.cidadeAtual, espinha: S13.espinha, lugar: { nome: "A Taverna da Âncora", cidade: S13.cidadeAtual }, dia: 1,
      personagem: { nome: HEROI, nivel: 1, xp: 0, moedas: 0, inventario: [], equipamento: [], grupo: [] }, render: {}, ...(factos ? { factos } : {}) };
    const antes = J(estado);
    osOrgaosDoDepois(estado, portas).conferirAsMissoes(estado.personagem);
    return { m: (loja.missoes || estado.missoes).find((x) => x.id === "mis_principal"), intacto: J(estado) === antes, escreveuOLivro: "factos" in loja };
  };
  const sem = correr(null), com = correr(livro);
  t("o conferente do depois, sem o livro no estado, deixa a principal ativa", sem.m.status === "ativa");
  t("com o livro no estado, fecha-a — sem o mudar nem o escrever de volta", com.m.status === "concluida" && com.intacto && !com.escreveuOLivro);
}

sec("§7 o vilão lê o livro");
{
  t("quedasDoLivro conta poupados e mortos por pessoa", J(quedasDoLivro(garantirFactos({ pessoas: {
    "npc|A": { derrotado: { dia: 1, como: "rendido" } }, "npc|B": { derrotado: { dia: 1, como: "morto" } },
    "npc|C": { derrotado: { dia: 2, como: "fugiu" } }, "npc|D": { visto: { de: 1, ate: 1, vezes: 1, turno: 1 } } } }))) === J({ poupados: 2, mortos: 1 }));
  t("o fugido conta como poupado (COMO_CAIU.poupado), e o lixo dá zeros", COMO_CAIU.poupado.includes("fugiu") && [null, {}, 7, { pessoas: [] }].every((x) => J(quedasDoLivro(x)) === J({ poupados: 0, mortos: 0 })));
  const D = lerODourado();
  const mods = await osModulos(D.imports);
  const padroes = osPadroes(D, mods);
  const comVilao = casosDaPauta().filter((k) => k.estado && k.estado.nemesis && k.estado.nemesis.nome);
  const POUPOU = { v: 1, pessoas: { "npc|Bandido": { nome: "Bandido", derrotado: { dia: 1, como: "rendido" } } }, lugares: {} };
  const pauta = (k, factos) => correrAPeca((e, en, p) => aPautaDoTurno(factos === undefined ? e : { ...e, factos }, en, p), k, D, padroes).p;
  let iguais = 0, mudou = 0, sentimental = 0;
  for (const k of comVilao) {
    const sem = J(pauta(k, undefined));
    if (sem === J(pauta(k, garantirFactos(null)))) iguais++;
    const com = J(pauta(k, POUPOU));
    if (com !== sem) { mudou++; if (com.includes("não termino o serviço")) sentimental++; }
  }
  t(`nos ${comVilao.length} casos da pauta com vilão, o livro vazio não muda nenhuma pauta`, comVilao.length >= 20 && iguais === comVilao.length, `${iguais}/${comVilao.length}`);
  t(`o herói que poupou alguém acorda a leitura «sentimental» (em ${sentimental} casos), e é só ela que muda`, sentimental > 0 && sentimental === mudou, `${mudou} mudaram, ${sentimental} sentimental`);
}

sec("§8 a escrita do turno no motor, e o replay");
{
  const base = { cidadeAtual: S13.cidadeAtual, npcs: S13.npcs, espinha: S13.espinha, personagem: { nome: HEROI, nivel: 1, grupo: [{ nome: "Brás", vinculo: 30 }, { nome: "Lobo Espectral", invocada: true }], inventario: [], equipamento: [] }, dia: 1, npcTurno: 4, lugar: { nome: "Largo da Liça", cidade: S13.cidadeAtual } };
  /* um elenco só, do estado */
  const el = elencoDoLivro({ ...base, canone: { "Noé Sal": { tipo: "pessoa", cidade: S13.cidadeAtual }, "A Lâmina": { tipo: "artefato" } }, jornada: { de: "a", para: "b" } });
  t("o elenco sai do estado: o herói, a cidade, a estrada, o registo, o grupo, as pessoas do cânone, o dia e o turno",
    el.heroi === HEROI && el.cidade === S13.cidadeAtual && el.naEstrada === true && el.npcs === S13.npcs && el.grupo.length === 2 && J(el.canone.map((c) => c.nome)) === J(["Noé Sal"]) && el.dia === 1 && el.turno === 4);
  t("sem o núcleo e sem a gente da base (o estado não os leva: um nome, um id, pelas três portas)", !("nucleo" in el) && !("gente" in el));
  t("a ponte do lugar só com o mundo (a semente)", !("chaveDoLugar" in el) && typeof elencoDoLivro(base, { mundo: { semente: "s|Fantasia medieval", genero: "Fantasia medieval" } }).chaveDoLugar === "function");
  t("o lixo dá um elenco vazio, sem estourar", [null, undefined, 7, "x", []].every((x) => { const e = elencoDoLivro(x, x); return e.heroi === "" && e.cidade === "" && J(e.grupo) === "[]" && e.dia === undefined; }));
  /* a presença do fim da resposta */
  const vista = oQueACenaDaAoLivro(base, { narrativa: "Corrado cruza os braços e encara-te. — As lutas são ao pôr do sol." });
  const aqui = (oc) => oc.emCena.filter((x) => x.aqui).map((x) => x.nome);
  t("a prosa do turno com o Corrado a agir põe-no à vista (registo); o grupo está sempre (e a invocação não)", aqui(vista).includes("Corrado") && aqui(vista).includes("Brás") && !aqui(vista).includes("Lobo Espectral"));
  t("a prosa que não o põe a agir não o põe à vista", !aqui(oQueACenaDaAoLivro(base, { narrativa: "A praça está vazia ao fim da tarde." })).includes("Corrado"));
  t("o lugar e a afeição do grupo (o vínculo) vão juntos", J(vista.lugar) === J(base.lugar) && J(vista.afeicoes) === J([{ quem: "Brás", vinculo: 30 }]));
  t("só gente na presença (o livro guarda pessoas)", vista.emCena.every((x) => x.tipo === "pessoa"));
  /* anotar: sem livro, nada; o que o ocorrido traz por definir não apaga o elenco */
  t("sem livro no estado, anotarOLivro dá null (a régua do minuto)", anotarOLivro(base, vista) === null && anotarOLivro({ ...base, factos: null }, vista) === null);
  const lv = anotarOLivro({ ...base, factos: garantirFactos(null) }, { tipo: "factos", dia: undefined, turno: undefined, falouCom: ["Corrado"] }).factos;
  t("o dia e o turno por definir no efeito não apagam os do estado", lv.pessoas["npc|Corrado"].falou.de === 1 && lv.pessoas["npc|Corrado"].falou.turno === 4);

  /* o replay: a mesma peça, no mesmo sítio do turno */
  const nomes = PASSOS_DO_REPLAY.map((p) => p.passo);
  t("o replay tem o passo «o livro de factos», depois do trabalho daqui e antes do Cronista", nomes.indexOf("o livro de factos") === nomes.indexOf("o trabalho daqui") + 1 && nomes.indexOf("o Cronista") === nomes.indexOf("o livro de factos") + 1);
  t("e o livro tem dono no replay (DONO_DO_CAMPO)", typeof DONO_DO_CAMPO.factos === "string" && /livro-do-turno/.test(DONO_DO_CAMPO.factos));
  const linha = (narrativa, proposta) => ({ n: 1, entrada: { frase: "x" }, sorte: { ponto: "1|600|0" }, pedido: { pauta: "" }, narrador: { narrativa, mudancas: {} }, cronista: proposta ? { proposta, juizo: null } : null, juiz: null, estado: {} });
  const CTX = { semente: "s13|Fantasia medieval", mundo: null };
  const T2 = linha("Corrado cruza os braços e encara-te. — As lutas são ao pôr do sol, forasteira. Paga-se à entrada.", { falou_com: ["Corrado"] });
  const r2 = correrOTurno({ ...base, missoes: [], factos: garantirFactos(null) }, T2, CTX);
  t("o replay escreve o livro como o App: a presença do fim da resposta e a conversa do Cronista", r2.calou.length === 0 && conversou(r2.estado.factos, "npc|Corrado") && conheceu(r2.estado.factos, "npc|Corrado"));
  t("e o mesmo turno corrido duas vezes dá o mesmo livro", J(correrOTurno({ ...base, missoes: [], factos: garantirFactos(null) }, T2, CTX).estado.factos) === J(r2.estado.factos));
  /* «Encontrar Corrado» no replay: a missão nasce depois da conversa (T5) e fecha no T6 pelo livro, num turno sem conversa e longe do Largo */
  const T6 = linha("Ilse atravessa a taverna da Âncora e senta-se perto da lareira.", null);
  const em6 = (factos) => correrOTurno({ ...base, lugar: { nome: "A Taverna da Âncora", cidade: S13.cidadeAtual }, missoes: S13.missoes, ...(factos ? { factos } : {}) }, T6, CTX).estado.missoes[0].status;
  t("no replay, a conversa do T2 fecha no T6 a principal que nasceu depois dela", em6(r2.estado.factos) === "concluida");
  t("…e sem o livro, não (o que a 13.ª viveu)", em6(null) === "ativa" && em6(garantirFactos(null)) === "ativa");
  /* a régua do minuto: a sessão gravada antes do livro continua sem ele */
  t("NASCERAM_DEPOIS_DA_GRAVACAO diz o livro, e porquê", typeof NASCERAM_DEPOIS_DA_GRAVACAO.factos === "string");
  const semLivro = correrOTurno({ ...base, missoes: [] }, T2, CTX);
  t("um estado gravado sem o campo sai do turno sem ele (nem null, nem um livro que ninguém escreveu)", !("factos" in semLivro.estado) && semLivro.calou.length === 0);
  t("o campo presente e nulo fica nulo", correrOTurno({ ...base, missoes: [], factos: null }, T2, CTX).estado.factos === null);
}

console.log(`\nBQ2 · a fiação do livro nos motores: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
