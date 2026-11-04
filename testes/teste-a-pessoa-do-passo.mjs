/* A PESSOA DO PASSO (03/11, a 15.ª sessão, caso 1 e defeito 1) — src/motor/a-pessoa-do-passo.js

   A missão mandava procurar «Godofredo, taverneiro, no Barril Rachado». O
   herói foi lá e chamou-o três vezes, e ele nunca entrou em QUEM ESTÁ: a
   ficha do ator punha-o no «Quer» da companheira, e as FRONTEIRAS diziam
   «Falam só: Yvete». A Matilde do mural, na casa dela, o mesmo
   (mente/sessao-15.md). Com o ator por padrão, a principal ficava parada no
   primeiro passo.

   O que esta suíte prova:
   §1 as tabelas: a hora dita cobre o dia, cada frase passa no verificador
      da ficha, e a hora conta para os quatro tipos de gente do passo;
   §2 o lixo não estoura, a entrada não muda, a mesma entrada dá o mesmo;
   §3 O CENÁRIO DA 15.ª, montado com as peças que o produzem (a abertura, a
      missão principal como `abrirAbertura` a cria, a linha do rumo de
      `linhaDoRumo`/`proximoPasso`, o contrato aceite como o App o aceita):
      no Barril, à hora do balcão, o Godofredo está em QUEM ESTÁ, com voz, o
      que sabe (o passo seguinte, a Isolda) e o que faz; a companheira já não
      o tem no «Quer»; a conversa regista-o com o sítio e cumpre o
      `falar_com`. Fora da hora (as 8h30 da sessão), a cena diz porquê, com a
      rotina. A Matilde do contrato aceite, na casa dela, também;
   §4 O MUNDO GRAVADO (sessao-navegador.json), pelo caminho do servidor
      (oPedidoNoServidor → a ficha): a pista Doran o Manco na Guarnição, e
      quem assina um contrato real do mural (ofertaDePessoa), aceite como o
      App o aceita — sem `onde` na etapa —, achado pela gente da base;
   §5 A 16.ª SESSÃO NO MUNDO GRAVADO: a principal do navegador tem a forma
      da da 16.ª (falar com a pista → descobrir o que um sítio esconde). Com
      o primeiro passo dado, o Doran fica na Guarnição e sabe o segundo (o
      onde, o quem, o quê); «o que sabe?» responde-se; quem guarda o sítio
      entra em cena à hora dela; a cena diz que o sítio esconde e como se
      acha; o teste que passa ali diz o que se achou; e o `revelar` fecha
      pelo segredo revelado, sem a prosa (missoes.js);
   §6 A 16.ª À MÃO, com as peças que a produzem (a abertura, a principal
      como `abrirAbertura` a cria, o marco com a batida e o segredo como
      batidas.js os escreve): a Astrid no T3 e no T5 (o sítio do registo
      com a cidade), o guardião do Largo noutra cidade, e a etapa de quem
      assinou o cartaz com o sítio dele (etapaDoDador). */
import fs from "node:fs";
import { aPessoaDoPasso, A_PESSOA_DO_PASSO, A_HORA_DITA, aHoraDita, ACHA_DITO, oQueOSitioEsconde, oSitioDoRegisto } from "../src/motor/a-pessoa-do-passo.js";
import { fatosQueFecham, segredosReveladosNoTurno } from "../src/saga.js";
import { GUARDA_NA_CENA, SEGREDO_DIZ } from "../src/batidas.js";
import { OBJETO_DO_FEITIO } from "../src/abertura.js";
import { etapaDoDador } from "../src/veredito-do-cartaz.js";
import { aFichaDeAtor, verificarAFicha } from "../src/motor/ficha-de-ator.js";
import { oQueACenaRegista } from "../src/motor/registo-da-cena.js";
import { garantirAbertura, proximoPasso, O_QUE_SE_SABE, PASSO_AQUI } from "../src/abertura.js";
import { criarMissao, aceitarProposta, etapaDef } from "../src/missoes.js";
import { linhaDoRumo, lerOPedido } from "../src/escuta.js";
import { fichaDaPessoa } from "../src/gente-por-dentro.js";
import { ofertaDePessoa, propostaDaOferta } from "../src/ofertas.js";
import { oQueExisteAqui } from "../src/mundo-base.js";
import { moldePorId, MOLDE_PADRAO } from "../src/moldes.js";
import { oPedidoNoServidor } from "../src/turno-no-servidor.js";
import { estadoNoTurno } from "../src/sessao.js";

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);
const congelar = (x) => { if (x && typeof x === "object") { Object.freeze(x); for (const v of Object.values(x)) congelar(v); } return x; };
const bloco = (f, n) => (f.texto.split("\n").reduce((o, l) => { if (/^\S/.test(l)) o.cur = l.startsWith(n + " — ") ? n : null; if (o.cur) o.out.push(l); return o; }, { cur: null, out: [] })).out.join("\n");

sec("§1 as tabelas");
t("a hora dita: a meia-noite, o meio-dia, a uma, as onze da manhã, as duas da madrugada, as seis da tarde", aHoraDita(0) === "a meia-noite" && aHoraDita(720) === "o meio-dia" && aHoraDita(780) === "a uma da tarde" && aHoraDita(660) === "as onze da manhã" && aHoraDita(120) === "as duas da madrugada" && aHoraDita(1080) === "as seis da tarde");
t("a hora dita cobre o dia (doze nomes e meia-noite; as partes até 1440), e lixo é meia-noite", A_HORA_DITA.nomes.length === 13 && A_HORA_DITA.partes[A_HORA_DITA.partes.length - 1].ate === 1440 && aHoraDita(null) === "a meia-noite" && aHoraDita(1440 + 660) === aHoraDita(660));
const amostra = [A_PESSOA_DO_PASSO.sabeDaPista, A_PESSOA_DO_PASSO.oNome, A_PESSOA_DO_PASSO.querDoDador, ...Object.values(A_PESSOA_DO_PASSO.sabeDaEtapa), A_PESSOA_DO_PASSO.semOnde, A_PESSOA_DO_PASSO.oQueHa, A_PESSOA_DO_PASSO.ausente,
  /* a 16.ª: o guarda, o sítio que esconde e o que se achou */
  A_PESSOA_DO_PASSO.agoraDoGuarda, A_PESSOA_DO_PASSO.sitioEsconde, A_PESSOA_DO_PASSO.sitioAchou, A_PESSOA_DO_PASSO.guardaDito, A_PESSOA_DO_PASSO.guardaAqui, ...Object.values(A_PESSOA_DO_PASSO.cidadeDoSitio), ...Object.values(ACHA_DITO)]
  .map((x) => x.replace(/\{H\}/g, "Irene").replace(/\{N\}/g, "Godofredo").replace(/\{P\}/g, ", taverneiro,").replace(/\{[A-Z]\}/g, "o Barril"));
t("cada frase da tabela passa no verificador da ficha (nem rótulo, nem ordem, nem número de jogo)", verificarAFicha(amostra.join("\n")).length === 0);
t("a hora conta para os quatro tipos de gente do passo (a ordem de 03/11)", ["pista", "alvo", "dador", "etapa"].every((x) => A_PESSOA_DO_PASSO.aHoraConta.includes(x)));

sec("§2 o lixo, a imutabilidade, o determinismo");
for (const [n, e] of [["null", null], ["undefined", undefined], ["{}", {}], ["tipos errados", { lugar: 5, missoes: "x", abertura: [], npcs: 3 }], ["missões com lixo", { lugar: { nome: "O Barril Rachado" }, missoes: [null, 3, { status: "ativa", etapas: [null, { tipo: "falar_com" }] }] }]]) {
  let r = null, erro = null;
  try { r = aPessoaDoPasso(e); } catch (x) { erro = x; }
  t(`${n}: não estoura, e não põe ninguém em cena`, !erro && Array.isArray(r) && r.length === 0);
}

sec("§3 o cenário da 15.ª");
/* a abertura e a principal como `abrirAbertura` as faz (abertura.js): a
   pista é o informante, o «sabe» é o de O_QUE_SE_SABE, e o primeiro passo
   é encontrá-la no sítio dela */
const abertura = garantirAbertura({
  principalId: "mis_principal", cidade: "Cimo Negro", chegada: "à porta de Cimo Negro, com a poeira da estrada ainda na roupa",
  razao: "alguém a quem devia a vida pediu-lhe, antes de morrer, que fosse a Cimo Negro atrás de Isolda",
  sabe: `Godofredo, taverneiro, ${O_QUE_SE_SABE.informante.replace("{objeto}", "Isolda").replace("{local}", "n'O Barril Rachado")}`,
  titulo: "O rasto de Isolda",
  pista: { nome: "Godofredo", papel: "taverneiro", local: "O Barril Rachado" },
  alvo: { feitio: "procurar", quem: "Isolda", onde: "A Casa da Ponte, em Cova Negro", objeto: "Isolda" },
});
const principal = criarMissao({ id: "mis_principal", titulo: "O rasto de Isolda", tipo: "principal", status: "ativa", descricao: abertura.razao,
  etapas: [{ tipo: "falar_com", alvo: "Godofredo", onde: "O Barril Rachado" }, { tipo: "falar_com", alvo: "Isolda", onde: "A Casa da Ponte, em Cova Negro" }] });
const IRENE = { nome: "Irene", grupo: [{ nome: "Yvete Perna-Seca", vinculo: 10, classe: "Monge", raca: "Humana" }] };
const S15 = { personagem: IRENE, npcs: {}, nomeCampanha: "O Vau das Cinzas", mundo: { genero: "Fantasia medieval" }, abertura, missoes: [principal], cidadeAtual: "Cimo Negro",
  nucleoCache: { nucleo: { pessoas: [{ nome: "Yvete Perna-Seca", papel: "companheiro", ficha: { fala: { o: "responde com outra pergunta" } } }] } } };
const BARRIL = { nome: "O Barril Rachado", cidade: "Cimo Negro", dentroDe: "", distancia: "dentro" };
/* a nota do turno: o ONDE, o EM CENA (só a Yvete, como na sessão) e o RUMO que a pauta escreve */
const notaNo = (aqui, frase, missoes = [principal]) => `ONDE      ${aqui}\nEM CENA   Yvete Perna-Seca (com você)\nO RUMO    ${linhaDoRumo({ pedido: lerOPedido(frase), passo: proximoPasso({ abertura, missoes }), mundo: { aqui, abertura, missoes } })}`;
const FRASE2 = "Chamo o Godofredo: — Godofredo! Preciso de falar contigo.";
const NOTA2 = notaNo("n'O Barril Rachado, dentro de Cimo Negro", FRASE2);
const ROT = (dia, minuto) => fichaDaPessoa("O Vau das Cinzas|Fantasia medieval", { nome: "Godofredo", papel: "taverneiro", local: "O Barril Rachado" }, { dia, minuto, cidade: "Cimo Negro" }).rotina;
t("a nota da sessão: o rumo manda «falar com Godofredo, taverneiro daqui» (PASSO_AQUI.pista)", NOTA2.includes(PASSO_AQUI.pista.replace("{nome}", "Godofredo").replace("{papel}", "taverneiro").split(",")[0]));
/* à hora do balcão: a rotina do Godofredo pela semente do mundo (11h às 2h) */
const naHora = { ...S15, dia: 2, minuto: 700, lugar: BARRIL };
t("a rotina do sistema: dia 2, 11h40, o Godofredo está atrás do balcão", ROT(2, 700).noTurno === true);
const T2 = aFichaDeAtor({ frase: FRASE2, nota: NOTA2, estado: naHora });
const G2 = bloco(T2, "Godofredo");
t("T2 à hora dele: o Godofredo está em QUEM ESTÁ (era só o «Quer» da Yvete), e fala", G2.startsWith("Godofredo — taverneiro.") && T2.falam.includes("Godofredo"));
/* MOVIDA EM 03/11 (a 16.ª sessão, defeito 2): o «Sabe» trazia antes do passo
   a frase da pista («mais do que ninguém nesta cidade sobre Isolda»), e na
   16.ª ela era tudo o que a Astrid sabia — vaga, não é pista. Com o passo
   seguinte dito, a frase da pista sai; fica o onde e o quem do passo. */
t("…com voz (o registo do ofício e o trato), o que faz e o que sabe: onde encontrar a Isolda, o passo seguinte", /\n  Fala: frase de negociante/.test(G2) && G2.includes("Agora: atrás do balcão; diz o próprio nome a Irene logo que Irene lhe fala.") && G2.includes("Sabe: Isolda encontra-se na Casa da Ponte, em Cova Negro.") && !G2.includes("mais do que ninguém"));
t("…e a Yvete já não o tem no «Quer» (a vontade era da pauta, não dela)", !/Quer: [^\n]*Godofredo/.test(bloco(T2, "Yvete Perna-Seca")));
t("…e a ficha passa no verificador", verificarAFicha(T2.texto).length === 0);
const reg2 = oQueACenaRegista({ ficha: T2, estado: { personagem: IRENE } });
t("o registo da cena: falou com o Godofredo, e ele entra no registo com o sítio do passo", reg2.falou_com.includes("Godofredo") && reg2.pessoas.some((p) => p.nome === "Godofredo" && p.papel === "taverneiro" && p.local === "O Barril Rachado"));
const mundoDaEtapa = { cidadeAtual: "Cimo Negro", lugarAtual: BARRIL, npcs: { Godofredo: { nome: "Godofredo", local: "O Barril Rachado", conhecidoEm: 2 } } };
t("…e a etapa «Encontrar Godofredo» cumpre-se com a conversa que o sistema deu (missoes.js)", etapaDef("falar_com").ver(principal.etapas[0], { ...mundoDaEtapa, falouCom: reg2.falou_com }) === true);
/* as 8h30 da sessão: fora do turno, e a cena diz porquê */
const T2cedo = aFichaDeAtor({ frase: FRASE2, nota: NOTA2, estado: { ...naHora, minuto: 510 } });
t("às 8h30 (a hora da sessão) a rotina diz que o balcão ainda não abriu", ROT(2, 510).noTurno === false);
t("…e a cena di-lo com a verdade do sistema: onde ele anda, e a que horas volta ao balcão", T2cedo.partes.CENA.includes(`Godofredo, taverneiro, não está aqui agora: ${ROT(2, 510).agora}. Costuma estar atrás do balcão desde as onze da manhã até as duas da madrugada.`) && !T2cedo.falam.includes("Godofredo"));
t("…e ninguém o tem no «Quer»; a ficha passa no verificador", !/Quer: [^\n]*Godofredo/.test(T2cedo.texto) && verificarAFicha(T2cedo.texto).length === 0);
const T2folga = aFichaDeAtor({ frase: FRASE2, nota: NOTA2, estado: { ...naHora, dia: 1 } });
t("no dia da folga dele, a cena diz que é a folga", ROT(1, 700).deFolga === true && T2folga.partes.CENA.includes("Godofredo, taverneiro, não está aqui agora: de folga hoje"));
t("fora do Barril, ninguém o põe em cena", aPessoaDoPasso({ ...naHora, lugar: { nome: "A Bica das Cinzas", cidade: "Cimo Negro" } }).length === 0 && aPessoaDoPasso({ ...naHora, lugar: null }).length === 0);
/* MOVIDA EM 03/11 (a 16.ª sessão, defeito 1): dizia «com o passo dado, já
   não é o passo» — e foi assim que a Astrid saiu de cena no T4, à hora do
   balcão e ao lado dele, logo depois de falar. Quem deu o passo de agora
   continua no sítio dele, à hora dele, e é quem sabe o passo de agora; a
   etapa a seguir (a Isolda, noutra cidade) não o põe em cena por ninguém. */
const dado = aPessoaDoPasso({ ...naHora, missoes: [{ ...principal, etapas: [{ ...principal.etapas[0], feito: true }, principal.etapas[1]] }] });
t("com o passo dado (a etapa feita), quem o deu fica no sítio dele, e sabe o passo de agora", dado.length === 1 && dado[0].nome === "Godofredo" && dado[0].aqui && dado[0].sabe.join() === "Isolda encontra-se na Casa da Ponte, em Cova Negro");
t("…e com as duas etapas feitas, já ninguém é do passo", aPessoaDoPasso({ ...naHora, missoes: [{ ...principal, etapas: principal.etapas.map((x) => ({ ...x, feito: true })) }] }).length === 0);
/* a Matilde: o contrato do mural aceite como o App o aceita (aceitarContrato:
   a etapa de procurar quem assinou à frente, `dadorPresente: false`) */
const CARTAZ = { titulo: "O que há em A Praça do Ocaso", tipo: "contrato", dador: "Matilde", dadorLocal: "A Bica das Cinzas", descricao: "Matilde quer de volta o medalhão dos ossos.", paga: 70, nivel: 5, etapas: [{ tipo: "achar", alvo: "medalhão dos ossos" }] };
const aceitar = (etapa0) => { const r = aceitarProposta([principal], { titulo: CARTAZ.titulo, tipo: CARTAZ.tipo, dador: CARTAZ.dador, descricao: CARTAZ.descricao, paga: CARTAZ.paga, nivel: CARTAZ.nivel, etapas: [etapa0, ...CARTAZ.etapas] }, { nivel: 1, dia: 2, dadorPresente: false, etapasPrometidas: 1 }); return r.missoes.map((m) => (m.id === r.missao.id ? { ...r.missao, status: "ativa" } : m)); };
const BICA = { nome: "A Bica das Cinzas", cidade: "Cimo Negro" };
const comOnde = aceitar({ tipo: "falar_com", alvo: "Matilde", onde: CARTAZ.dadorLocal });
const FRASE9 = "Entro e pergunto pela Matilde.";
const T9 = aFichaDeAtor({ frase: FRASE9, nota: notaNo("n'A Bica das Cinzas, dentro de Cimo Negro", FRASE9, comOnde), estado: { ...S15, missoes: comOnde, dia: 2, minuto: 900, lugar: BICA } });
t("T9: com o sítio de quem assinou na etapa, a Matilde está na casa dela, em QUEM ESTÁ", T9.falam.includes("Matilde") && T9.conversa.includes("Matilde"));
t("…e quer falar do trabalho que pregou, agora aceite; e sabe o que vem a seguir", bloco(T9, "Matilde").includes("Quer: falar a Irene do trabalho que pregou no mural, «O que há em A Praça do Ocaso», agora que Irene o aceitou.") && bloco(T9, "Matilde").includes("medalhão dos ossos"));
/* sem o sítio na etapa (o App de hoje) e sem mundo que a tenha, o sistema
   não sabe onde ela mora: não a inventa (a §4 acha-a pela base do mundo) */
const semOnde = aceitar({ tipo: "falar_com", alvo: "Matilde" });
t("sem o sítio na etapa nem a gente da base, ninguém a inventa na Bica", aPessoaDoPasso({ ...S15, missoes: semOnde, dia: 2, minuto: 900, lugar: BICA }).length === 0);
const ent = congelar({ ...naHora });
let erroC = null; try { aPessoaDoPasso(ent); } catch (x) { erroC = x; }
t("a entrada não muda (congelada, corre), e a mesma entrada dá o mesmo", !erroC && JSON.stringify(aPessoaDoPasso(ent)) === JSON.stringify(aPessoaDoPasso(ent)));

sec("§4 o mundo gravado, pelo caminho do servidor");
const A = JSON.parse(fs.readFileSync(new URL("./sessao-navegador.json", import.meta.url), "utf8"));
const e0 = estadoNoTurno(A, 1);
const SEM = `${e0.nomeCampanha}|${e0.mundo.genero}`;
const GUARNICAO = { nome: e0.abertura.pista.local, cidade: e0.cidadeAtual, dentroDe: "", distancia: "dentro" };
const pelaRede = async (e, frase) => { const m = await oPedidoNoServidor({ estado: e, frase }, { agora: () => 0 }); return aFichaDeAtor({ nota: m.pedido.messages[m.pedido.messages.length - 1].content.split("\n═══")[0], frase, estado: m.estadoDoFim }); };
const DORAN = e0.abertura.pista.nome;
const rotDoran = (min) => fichaDaPessoa(SEM, { nome: DORAN, papel: e0.abertura.pista.papel, local: GUARNICAO.nome }, { dia: e0.dia, minuto: min, cidade: e0.cidadeAtual }).rotina;
const deDia = [300, 480, 700, 1200].find((m) => rotDoran(m).noTurno), deFora = [300, 480, 700, 1200].find((m) => !rotDoran(m).noTurno);
const fN = await pelaRede({ ...e0, minuto: deDia, lugar: GUARNICAO }, `Chamo pelo ${DORAN}.`);
t(`a pista da abertura (${DORAN}), no sítio dela e à hora dela: em QUEM ESTÁ, e a conversa é com ela`, fN.falam.includes(DORAN) && fN.conversa.includes(DORAN) && verificarAFicha(fN.texto).length === 0);
t("…e o rumo que apontava para ela saiu do «Quer» do companheiro", !/Quer: falar com /.test(fN.texto));
const fF = await pelaRede({ ...e0, minuto: deFora, lugar: GUARNICAO }, `Chamo pelo ${DORAN}.`);
t("fora da hora: a cena diz onde anda e a que horas volta, e não fala", fF.partes.CENA.includes(`${DORAN}, ${e0.abertura.pista.papel}, não está aqui agora: ${rotDoran(deFora).agora}.`) && !fF.falam.includes(DORAN) && verificarAFicha(fF.texto).length === 0);
/* um contrato real do mural: quem assina é gente da base desta cidade */
const molde = moldePorId(e0.mundo.molde || MOLDE_PADRAO);
const gente = oQueExisteAqui(SEM, e0.mapa, e0.cidadeAtual, e0.baseMundo, e0.mundo.genero, molde, e0.mundo.lexico).gente;
const cid = e0.mapa.cidades.find((c) => c.nome === e0.cidadeAtual);
let of = null;
for (const p of gente) { if (p.nome === DORAN) continue; of = ofertaDePessoa({ semente: SEM, pessoa: p, aqui: { cidade: cid }, mapa: e0.mapa, genero: e0.mundo.genero, nivel: 1, molde, lex: e0.mundo.lexico }); if (of) break; }
const prop = propostaDaOferta(of);
const r = aceitarProposta(e0.missoes, { ...prop, etapas: [{ tipo: "falar_com", alvo: of.dador }, ...prop.etapas] }, { nivel: 1, dia: e0.dia, dadorPresente: false, etapasPrometidas: of.etapas.length });
const missoes = r.missoes.map((m) => (m.id === r.missao.id ? { ...r.missao, status: "ativa" } : m));
t(`o contrato «${of.titulo}», aceite como o App o aceita, nasce sem o sítio de quem assina (${of.dador})`, r.ok && missoes.find((m) => m.id === r.missao.id).etapas[0].onde === "");
const CASA = { nome: of.dadorLocal, cidade: e0.cidadeAtual, dentroDe: "", distancia: "dentro" };
const rotD = (min) => fichaDaPessoa(SEM, { nome: of.dador, papel: gente.find((p) => p.nome === of.dador).papel, local: of.dadorLocal }, { dia: e0.dia, minuto: min, cidade: e0.cidadeAtual }).rotina;
const naHoraD = [600, 900, 1300, 1400].find((m) => rotD(m).noTurno);
const fD = await pelaRede({ ...e0, missoes, minuto: naHoraD, lugar: CASA }, `Pergunto por ${of.dador}.`);
t(`…e a gente da base diz onde mora (${of.dadorLocal}): lá, à hora dela, está em QUEM ESTÁ e quer falar do trabalho`, fD.falam.includes(of.dador) && bloco(fD, of.dador).includes("agora que Vera o aceitou") && verificarAFicha(fD.texto).length === 0);
const regD = oQueACenaRegista({ ficha: fD, estado: { personagem: e0.personagem } });
t("…e a conversa regista quem assinou, com o sítio dele", regD.falou_com.includes(of.dador) && regD.pessoas.some((p) => p.nome === of.dador && p.local === of.dadorLocal));
t("noutro sítio da cidade, quem assinou não está", aPessoaDoPasso({ ...e0, missoes, minuto: naHoraD, lugar: GUARNICAO }).every((x) => x.nome !== of.dador));

sec("§5 a 16.ª sessão no mundo gravado: o segundo passo");
const tpl16 = (x, v) => String(x).replace(/\{([A-Z])\}/g,(_, k) => (v[k] != null ? v[k] : ""));
const sem16 = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const pr = e0.missoes.find((m) => m.tipo === "principal");
t("a principal gravada tem a forma da da 16.ª: falar com a pista, e depois descobrir o que um sítio esconde", pr.etapas.length === 2 && pr.etapas[0].tipo === "falar_com" && pr.etapas[1].tipo === "revelar" && !!pr.etapas[1].chave);
const prFeita = { ...pr, etapas: [{ ...pr.etapas[0], feito: true }, pr.etapas[1]] };
const ms16 = e0.missoes.map((m) => (m.id === pr.id ? prFeita : m));
/* o registo como a conversa o deixa: o sítio do passo, carimbado com a
   cidade pelo Cronista (npcs.js, localComCidade) */
const reg16 = { ...e0.npcs, [DORAN]: { nome: DORAN, papel: e0.abertura.pista.papel, local: `${GUARNICAO.nome}, ${e0.cidadeAtual}`, conhecidoEm: e0.dia } };
const e16 = { ...e0, missoes: ms16, npcs: reg16, minuto: deDia, lugar: GUARNICAO };
const marco = e0.espinha.atos.flatMap((a) => a.marcos).find((m) => m.feitio === "descobrir" && m.onde === pr.etapas[1].alvo);
const GUARDA = marco.batida.cena.split(`, ${GUARDA_NA_CENA} `)[1];
t(`o marco gravado: ${marco.onde}, ${GUARDA_NA_CENA} ${GUARDA}, com segredo (${marco.segredo.acha})`, !!GUARDA && !!marco.segredo && !!marco.segredo.coisa);
const p16 = aPessoaDoPasso(e16);
const doran16 = p16.find((x) => x.nome === DORAN);
t("com o passo dado, o Doran fica na Guarnição à hora dele (a 16.ª, defeito 1: a Astrid saía de cena)", !!doran16 && doran16.aqui);
t("…e sabe o passo de agora com conteúdo: o sítio, que esconde, como se acha, e quem o guarda (defeito 2)", doran16.sabe.join() === tpl16(A_PESSOA_DO_PASSO.sabeDaEtapa.revelarAqui, { A: marco.onde, G: tpl16(A_PESSOA_DO_PASSO.guardaAqui, { X: GUARDA }) }));
const fS = await pelaRede(e16, `${DORAN}, o que sabe?`);
const bS = bloco(fS, DORAN);
t("«Doran o Manco, o que sabe?»: a ficha dá-lhe o passo, e já não diz que não sabe responder", bS.includes(`Sabe: ${marco.onde} esconde alguma coisa`) && !/Não sabe responder/.test(bS) && verificarAFicha(fS.texto).length === 0);
/* quem guarda: a hora dela pela mesma rotina */
const rotG = (min) => fichaDaPessoa(SEM, { nome: GUARDA, papel: gente.find((p) => p.nome === GUARDA).papel, local: marco.onde }, { dia: e0.dia, minuto: min, cidade: e0.cidadeAtual }).rotina;
const horaG = [120, 300, 600, 900, 1200, 1300].find((m) => rotG(m).noTurno);
const foraG = [120, 300, 600, 900, 1200, 1300].find((m) => !rotG(m).noTurno);
const g16 = aPessoaDoPasso({ ...e16, minuto: horaG }).find((x) => x.nome === GUARDA);
t(`quem guarda o sítio (${GUARDA}) entra em cena como a do falar_com, à hora dela, e guarda-o (defeito 3)`, !!g16 && g16.de === "guarda" && g16.aqui && g16.agora.includes(tpl16(A_PESSOA_DO_PASSO.agoraDoGuarda, { L: marco.onde })));
const g16f = aPessoaDoPasso({ ...e16, minuto: foraG }).find((x) => x.nome === GUARDA);
t("…e fora da hora, a cena diz onde anda e quando volta", !!g16f && !g16f.aqui && g16f.ausente.startsWith(`${GUARDA}, `));
t("…e noutro sítio da cidade, nem a guarda nem o sítio aparecem", aPessoaDoPasso({ ...e16, lugar: { nome: "O Poço", cidade: e0.cidadeAtual } }).every((x) => x.nome !== GUARDA) && oQueOSitioEsconde({ ...e16, lugar: { nome: "O Poço", cidade: e0.cidadeAtual } }) === null);
const sit = oQueOSitioEsconde(e16);
t("a cena diz que o sítio esconde alguma coisa e como se acha (pela perícia do segredo), sem dizer o quê", sit.cena === tpl16(A_PESSOA_DO_PASSO.sitioEsconde, { L: marco.onde, A: ACHA_DITO[sem16(marco.segredo.acha)] }) && !sit.achou && !sit.cena.includes(marco.segredo.coisa));
const PER = sem16(marco.segredo.acha);
const fA = await pelaRede(e16, "Examino a guarnição com cuidado.");
t("…e chega à ficha", fA.partes.CENA.includes(sit.cena) && verificarAFicha(fA.texto).length === 0);
const fT = aFichaDeAtor({ nota: `ONDE      n'${GUARNICAO.nome}, dentro de ${e0.cidadeAtual}`, frase: "Examino a guarnição com cuidado.", estado: e16, teste: { pericia: PER, sucesso: true } });
t("com o teste do turno a passar ali (o testeDoTurno do App), o que se achou é fato no ACONTECEU", fT.partes.ACONTECEU.includes(tpl16(A_PESSOA_DO_PASSO.sitioAchou, { H: e0.personagem.nome, L: marco.onde, O: marco.segredo.coisa.charAt(0).toLowerCase() + marco.segredo.coisa.slice(1) })) && !fT.partes.CENA.includes(sit.cena));
const fR = aFichaDeAtor({ nota: "", frase: `[ROLAGEM] Teste de ${marco.segredo.acha} (examinar a guarnição): rolei 15, modificador +2, total 17, dificuldade ${marco.segredo.dc}. Resultado: SUCESSO.`, estado: e16 });
t("…e também pelo envelope do dado, quando o App não diz o teste", fR.partes.ACONTECEU.includes(`achou o que ${marco.onde} escondia`));
const fFalha = aFichaDeAtor({ nota: "", frase: `[ROLAGEM] Teste de ${marco.segredo.acha} (examinar a guarnição): rolei 3, modificador +2, total 5, dificuldade ${marco.segredo.dc}. Resultado: FALHA.`, estado: e16 });
t("…e a falha não acha nada («falhar custa tempo, não o segredo»)", !/achou o que/.test(fFalha.partes.ACONTECEU) && fFalha.partes.CENA.includes(sit.cena));
/* o revelar fecha pelo fato: o mundo da conferência como o Cronista o
   monta (os segredos revelados do turno, o que a história guarda), e
   `revelados` vazio — no ator nenhuma prosa revela o lugar na base */
const seg = segredosReveladosNoTurno(e0.espinha, { lugar: GUARNICAO.nome, teste: { pericia: PER, sucesso: true }, narrativa: "" });
const mundoC = { cidadeAtual: e0.cidadeAtual, lugarAtual: GUARNICAO, npcs: reg16, revelados: [], soPeloFato: fatosQueFecham(e0.espinha) };
t("o segredo que o teste revela ali fecha o `revelar` sem a prosa ter nomeado o lugar (missoes.js)", seg.includes(marco.onde) && etapaDef("revelar").ver(pr.etapas[1], { ...mundoC, segredosRevelados: seg }) === true);
t("…sem o segredo revelado, não fecha; e revelado noutro sítio, também não", etapaDef("revelar").ver(pr.etapas[1], { ...mundoC, segredosRevelados: [] }) === false && etapaDef("revelar").ver(pr.etapas[1], { ...mundoC, lugarAtual: { nome: "O Poço", cidade: e0.cidadeAtual }, segredosRevelados: seg }) === false);

sec("§6 a 16.ª à mão: a Astrid, o Largo do Cardo e o Gwynn");
const S16 = "A Lanterna do Brejo|Fantasia medieval";
const objeto16 = OBJETO_DO_FEITIO.descobrir.replace("{onde}", "O Largo do Cardo");
const ab16 = garantirAbertura({ principalId: "mis_principal", cidade: "Ponto da Fonte", chegada: "à porta de Ponto da Fonte", razao: "o pai de Bento morreu com uma dívida", sabe: `Astrid, taverneira, ${O_QUE_SE_SABE.informante.replace("{objeto}", objeto16).replace("{local}", "na Lanterna da Bruma")}`, titulo: "O que o Largo guarda", pista: { nome: "Astrid", papel: "taverneira", local: "A Lanterna da Bruma" }, alvo: { feitio: "descobrir", quem: "", onde: "O Largo do Cardo", objeto: objeto16 } });
/* a principal como abrirAbertura a cria: a pista no sítio dela, e o
   descobrir com a cidade no onde (ondeComMorada) e a chave da base */
const pr16 = criarMissao({ id: "mis_principal", titulo: "O que o Largo guarda", tipo: "principal", status: "ativa", descricao: ab16.razao, etapas: [{ tipo: "falar_com", alvo: "Astrid", onde: "A Lanterna da Bruma" }, { tipo: "revelar", alvo: "O Largo do Cardo", onde: "O Largo do Cardo, em Rio Profundo", chave: "Rio Profundo|praca" }] });
/* o marco como batidas.js o escreve: a cena com quem o guarda, e o segredo */
const esp16 = { atos: [{ ato: 0, marcos: [{ id: "a0|1", feitio: "descobrir", titulo: "O que O Largo do Cardo esconde", onde: "O Largo do Cardo", cidade: "Rio Profundo", segredo: { coisa: "um alçapão sob a fonte seca", diz: SEGREDO_DIZ.alcapao, acha: "Percepção", dc: 13, escondido: false }, batida: { cena: `O Largo do Cardo, em Rio Profundo, ${GUARDA_NA_CENA} Joric Filho da Névoa`, emJogo: "o que aqui se esconde", pergunta: "o que o herói arrisca?" } }] }] };
const BENTO = { nome: "Bento", grupo: [{ nome: "Alaric Barba-Ruiva", vinculo: 25, classe: "Ladino", raca: "Humano" }] };
const rotA = (min) => fichaDaPessoa(S16, { nome: "Astrid", papel: "taverneira", local: "A Lanterna da Bruma" }, { dia: 1, minuto: min, cidade: "Ponto da Fonte" }).rotina;
const horaA = [730, 760, 800, 900, 1000].find((m) => rotA(m).noTurno);
const LANTERNA = { nome: "A Lanterna da Bruma", cidade: "Ponto da Fonte" };
const base16 = { personagem: BENTO, nomeCampanha: "A Lanterna do Brejo", mundo: { genero: "Fantasia medieval" }, abertura: ab16, espinha: esp16, cidadeAtual: "Ponto da Fonte", dia: 1, minuto: horaA, lugar: LANTERNA };
const NOTA16 = "ONDE      n'A Lanterna da Bruma, dentro de Ponto da Fonte\nEM CENA   Alaric Barba-Ruiva (com você)";
const T3 = aFichaDeAtor({ frase: "— Astrid, o que sabe?", nota: NOTA16, estado: { ...base16, missoes: [pr16], npcs: {} } });
const SABE16 = tpl16(A_PESSOA_DO_PASSO.sabeDaEtapa.revelar, { A: "O Largo do Cardo", C: tpl16(A_PESSOA_DO_PASSO.cidadeDoSitio.outra, { X: "Rio Profundo" }), G: tpl16(A_PESSOA_DO_PASSO.guardaDito, { X: "Joric Filho da Névoa" }) });
t("T3 «O que sabe?»: a Astrid sabe o passo seguinte — onde (Rio Profundo), quem (o Joric que o guarda) e o quê", bloco(T3, "Astrid").includes(`Sabe: ${SABE16}.`) && !bloco(T3, "Astrid").includes("mais do que ninguém") && !/Não sabe responder/.test(T3.texto) && verificarAFicha(T3.texto).length === 0);
const pr16f = { ...pr16, etapas: [{ ...pr16.etapas[0], feito: true }, pr16.etapas[1]] };
const npcs16 = { Astrid: { nome: "Astrid", papel: "taverneira", local: "A Lanterna da Bruma, Ponto da Fonte", conhecidoEm: 1 } };
t("o sítio do registo com a cidade lê-se como sítio, em cidade (e o epíteto com vírgula fica como veio)", oSitioDoRegisto("A Lanterna da Bruma, Ponto da Fonte", base16) === "A Lanterna da Bruma, em Ponto da Fonte" && oSitioDoRegisto("Osric, o que não dorme", base16) === "Osric, o que não dorme" && oSitioDoRegisto(null, null) === "");
const T5 = aFichaDeAtor({ frase: "Pergunto à Astrid o que sabe do Largo do Cardo.", nota: NOTA16, estado: { ...base16, missoes: [pr16f], npcs: npcs16, minuto: horaA + 10 } });
t("T5, com o passo dado e à hora do balcão: a Astrid continua em QUEM ESTÁ, atrás do balcão, e sabe o Largo (defeito 1)", T5.falam.includes("Astrid") && bloco(T5, "Astrid").includes("Agora: atrás do balcão.") && bloco(T5, "Astrid").includes(`Sabe: ${SABE16}.`));
t("…e já não «vive em A Lanterna da Bruma, Ponto da Fonte» com o herói lá dentro, nem diz o nome outra vez (defeito 10)", !/vive em/.test(T5.texto) && !bloco(T5, "Astrid").includes("diz o próprio nome") && verificarAFicha(T5.texto).length === 0);
const T5f = aFichaDeAtor({ frase: "Chamo a Astrid.", nota: NOTA16, estado: { ...base16, missoes: [pr16f], npcs: npcs16, minuto: [300, 400, 500].find((m) => !rotA(m).noTurno) } });
t("…fora da hora dela, a cena diz onde anda e quando volta, sem «vive em» aqui", T5f.partes.CENA.includes("Astrid, taverneira, não está aqui agora:") && !/vive em/.test(T5f.texto));
const LARGO = { nome: "O Largo do Cardo", cidade: "Rio Profundo" };
const e13 = { ...base16, missoes: [pr16f], npcs: npcs16, lugar: LARGO, cidadeAtual: "Rio Profundo" };
const joric = aPessoaDoPasso(e13).find((x) => x.nome === "Joric Filho da Névoa");
t("T12–T13 no Largo do Cardo: o Joric é a pessoa do passo, de guarda (em cena à hora dele, ou a cena diz porquê)", !!joric && joric.de === "guarda" && (joric.aqui || !!joric.ausente));
const T13 = aFichaDeAtor({ frase: "Examino o largo porta a porta.", nota: "ONDE      n'O Largo do Cardo, dentro de Rio Profundo\nEM CENA   Alaric Barba-Ruiva (com você)", estado: e13 });
t("…e o examinar tem porta: a cena diz que o Largo esconde alguma coisa, e acha-a quem procurar com olho atento", T13.partes.CENA.includes(tpl16(A_PESSOA_DO_PASSO.sitioEsconde, { L: "O Largo do Cardo", A: ACHA_DITO.percepcao })) && verificarAFicha(T13.texto).length === 0);
const T13t = aFichaDeAtor({ frase: "Examino o largo porta a porta.", nota: "ONDE      n'O Largo do Cardo, dentro de Rio Profundo", estado: e13, teste: { pericia: "percepcao", sucesso: true } });
t("…e com o teste a passar, Bento acha o alçapão sob a fonte seca", T13t.partes.ACONTECEU.includes("Bento achou o que O Largo do Cardo escondia: um alçapão sob a fonte seca."));
/* o Gwynn: o cartaz aceite com a etapa que a mesma peça monta para o ensaio
   e para o aceite (etapaDoDador, veredito-do-cartaz.js) */
t("a etapa de quem assinou o cartaz leva o sítio dele; sem sítio, como sempre foi", JSON.stringify(etapaDoDador({ dador: "Gwynn", dadorLocal: "As Termas da Fivela" })) === JSON.stringify({ tipo: "falar_com", alvo: "Gwynn", onde: "As Termas da Fivela" }) && JSON.stringify(etapaDoDador({ dador: "Gwynn" })) === JSON.stringify({ tipo: "falar_com", alvo: "Gwynn" }) && etapaDoDador(null).tipo === "falar_com");
const CARTAZ16 = { titulo: "A carta de Gwynn", tipo: "contrato", dador: "Gwynn", dadorLocal: "As Termas da Fivela", descricao: "Gwynn precisa que uma carta chegue a quem a espera.", paga: 65, nivel: 5, etapas: [{ tipo: "achar", alvo: "carta lacrada de Gwynn" }] };
const rC = aceitarProposta([pr16f], { titulo: CARTAZ16.titulo, tipo: CARTAZ16.tipo, dador: CARTAZ16.dador, descricao: CARTAZ16.descricao, paga: CARTAZ16.paga, nivel: CARTAZ16.nivel, etapas: [etapaDoDador(CARTAZ16), ...CARTAZ16.etapas] }, { nivel: 1, dia: 1, dadorPresente: false, etapasPrometidas: 1 });
const msC = rC.missoes.map((m) => (m.id === rC.missao.id ? { ...rC.missao, status: "ativa" } : m));
const gw = aPessoaDoPasso({ ...base16, missoes: msC, npcs: npcs16, lugar: { nome: "As Termas da Fivela", cidade: "Ponto da Fonte" } }).find((x) => x.nome === "Gwynn");
t("T7 nas Termas da Fivela, com o contrato aceite: o Gwynn é a pessoa do passo, no sítio dele (defeito 5)", rC.ok && !!gw && gw.de === "dador" && gw.onde === "As Termas da Fivela");

console.log(`\na pessoa do passo: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
