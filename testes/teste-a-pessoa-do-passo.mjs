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
      App o aceita — sem `onde` na etapa —, achado pela gente da base. */
import fs from "node:fs";
import { aPessoaDoPasso, A_PESSOA_DO_PASSO, A_HORA_DITA, aHoraDita } from "../src/motor/a-pessoa-do-passo.js";
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
const amostra = [A_PESSOA_DO_PASSO.sabeDaPista, A_PESSOA_DO_PASSO.oNome, A_PESSOA_DO_PASSO.querDoDador, ...Object.values(A_PESSOA_DO_PASSO.sabeDaEtapa), A_PESSOA_DO_PASSO.semOnde, A_PESSOA_DO_PASSO.oQueHa, A_PESSOA_DO_PASSO.ausente]
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
t("…com voz (o registo do ofício e o trato), o que faz e o que sabe: onde encontrar a Isolda, o passo seguinte", /\n  Fala: frase de negociante/.test(G2) && G2.includes("Agora: atrás do balcão; diz o próprio nome a Irene logo que Irene lhe fala.") && G2.includes("Sabe: mais do que ninguém nesta cidade sobre Isolda; Isolda encontra-se na Casa da Ponte, em Cova Negro."));
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
t("com o passo dado (a etapa feita), já não é o passo", aPessoaDoPasso({ ...naHora, missoes: [{ ...principal, etapas: [{ ...principal.etapas[0], feito: true }, principal.etapas[1]] }] }).length === 0);
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

console.log(`\na pessoa do passo: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
