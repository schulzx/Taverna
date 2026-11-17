/* A DERROTA NO CONFRONTO (S7c, 17/11/2026) — src/o-confronto-da-quest.js,
   src/saida-da-luta.js, src/livro-de-factos.js

   A sessão jogada de 17/11 («O Que Desce ao Anoitecer», a Quimera em Roda
   dos Punhos): o herói Espreitou (8+4=12 contra 13), falhou, a luta abriu,
   ele caiu a 0 PV, a Quimera levou a bolsa e foi embora — e a etapa
   «Encarar» FECHOU, e a encruzilhada final (aldeia / coleira / monte) abriu
   com a fera livre. Duas portas deixavam a derrota passar:
     (a) o desfecho «descoberto» (com luta) escrevia «encontrado» no livro,
         e o assobio (tratador consultado + toca visitada) fechava a etapa;
     (b) o vencedor que sai de pé levava `fugiu`, e o livro escrevia-o como
         queda («derrotado», como: fugiu) — o «derrotou» da etapa.
   A regra (a pessoa, 17/11): «a falha de uma solução leva a outra»; «o mundo
   cobra com preço». Perder ou fugir não fecha; a besta fica ALERTA; o
   relógio do vilão anda; a pauta diz o que de facto aconteceu.
   §1 a sessão refeita: espreitar falha → luta → derrota → nada fecha;
   §2 o preço e a pauta;
   §3 o segundo confronto: a besta alerta (sem Espreitar), e vencer fecha;
   §4 o null e o lixo;
   §5 a ida que o sistema não fez: a pauta diz onde o herói está. */
import { questPorId, abrirQuest, avancarQuest, estadoDaQuest } from "../src/biblioteca-de-quests.js";
import { oConfrontoAqui, oLivroDoEncontro, aDerrotaNoConfronto, garantirAlertas, aChaveDoConfronto, O_CONFRONTO_DA_QUEST } from "../src/o-confronto-da-quest.js";
import { escolhasDoEncontro, resolverEscolha } from "../src/encontro-na-estrada.js";
import { aplicarSemSaida, DESFECHOS_SEM_SAIDA } from "../src/saida-da-luta.js";
import { garantirFactos, encontrou, derrotou, COMO_CAIU } from "../src/livro-de-factos.js";
import { anotarOLivro } from "../src/motor/livro-do-turno.js";
import { aplicarEfeitosNoEstado } from "../src/motor/quests-do-turno.js";
import { registrarConsulta } from "../src/npcs.js";
import { aIdaSemOSistema, A_IDA_SEM_O_SISTEMA } from "../src/lugar.js";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

const DES = questPorId("o_que_desce_ao_anoitecer");
const CID = "Doca Seca";
const CURRAL = { nome: "Curral da Ladeira", cidade: CID }, TOCA = { nome: "Roda dos Punhos", cidade: CID };
const N = (nome) => ({ nome, conhecidoEm: 1, local: CID, relacao: "neutro", status: "vivo", consultas: 0 });
let turno = 1;
const ir = (e, lugar) => { const e2 = { ...e, lugar, cidadeAtual: lugar.cidade, jornada: null }; return { ...e2, factos: anotarOLivro(e2, { lugar, dia: e2.dia, turno: (turno += 10) }).factos }; };
const falar = (e, ...n) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), falouCom: n }).factos });
const segredo = (e, lugar) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), segredos: [lugar] }).factos });
const livro = (e, ocorrido) => ({ ...e, factos: anotarOLivro(e, { tipo: "factos", dia: e.dia, turno: (turno += 10), ...ocorrido }).factos });
const ESC = { quests: [{ id: "x", tipo: 1, estado: "concluida" }] };
const PAP = { curral: CURRAL, toca: TOCA, fera: { nome: "Quimera" }, pastora: { nome: "Benta" }, tratador: { nome: "Vasco" } };

let e = { npcs: { Benta: N("Benta"), Vasco: N("Vasco"), Quimera: { ...N("Quimera"), relacao: "inimigo" } }, cidadeAtual: CID, lugar: CURRAL, personagem: { nome: "Varek", grupo: [], inventario: [], moedas: 40, vida: 13, vidaMax: 13 }, dia: 2, npcTurno: 0, factos: garantirFactos(null), baseMundo: null };
let R = abrirQuest(DES, { estado: e, papeis: PAP, ...ESC });
const av = () => { R = avancarQuest(DES, R, { estado: e, ...ESC }); };
e = ir(e, CURRAL); av();
e = segredo(e, CURRAL); e = falar(e, "Benta"); e = ir(e, TOCA); av();
e = { ...e, npcs: registrarConsulta(e.npcs, "Vasco") }; e = falar(e, "Vasco"); av();
const id = R.papeis.fera.id;
const PASSO = { quest: DES.id, etapa: "fera", confronto: { papel: "fera", id, nome: "Quimera", quem: "o que desce ao anoitecer", covil: TOCA } };
const ONDE = { lugar: TOCA.nome, dentroDe: "", cidade: CID };

sec("§1 a sessão refeita: espreitar falha, a luta, a derrota");
t("antes do confronto: o rastro fechou, a fera não (tratador consultado e toca visitada não bastam)", !!R.feitas.rasto && !R.feitas.fera, J(R.feitas));
const c1 = oConfrontoAqui([PASSO], ONDE, {});
const esp = escolhasDoEncontro(c1, { bonus: { furtividade: 4 } }).find((v) => v.id === "espreitar");
t("o cartão: Espreitar disponível no primeiro encontro (a besta ainda não viu)", c1 && c1.quemViu === "heroi" && esp.disponivel, J(esp));
/* na sessão a CD era 13 e o dado 8+4; aqui a ficha cai na ameaça do meio (CD 12): o dado é o que falha por um, como lá */
const r1 = resolverEscolha(c1, "espreitar", { d20: esp.cd - 4 - 1, bonus: { furtividade: 4 } });
t("espreitar falha por um contra a CD → descoberto, a luta abre", r1 && !r1.teste.passou && r1.desfecho.id === "descoberto" && r1.desfecho.luta, J(r1 && r1.teste));
e = { ...e, factos: oLivroDoEncontro(e.factos, r1, { dia: e.dia, turno: (turno += 10) }) };
t("[a] o desfecho com luta NÃO escreve «encontrado»: quem decide é o fim da luta", !encontrou(e.factos, id));
av();
t("[a] e a etapa da fera não fecha pelo assobio antes de a luta acabar", !R.feitas.fera, J(R.feitas));
/* a luta perdida: o herói no chão, a Quimera de pé leva a bolsa e vai embora (o «saque») */
const quimera = { nome: "Quimera", vida: 30, vidaMax: 40 };
const heroiCaido = { ...e.personagem, vida: 0, morte: { sucessos: 0, falhas: 0, estavel: true } };
const sai = aplicarSemSaida({ heroi: heroiCaido, inimigos: [quimera], decisao: { motivo: "caidos", desfecho: "saque", quem: "Quimera" }, rolar: () => 0.5, lugar: TOCA.nome, dia: e.dia });
t("a saída da luta: a Quimera sai DE PÉ (saiuDePe), o herói acorda a 1 PV, a bolsa foi", sai.inimigos[0].saiuDePe === true && sai.heroi.vida === 1 && sai.moedasLevadas === 40 && sai.heroi.moedas === 0, J(sai.inimigos[0]));
/* o App: anotarNoLivro("os caídos da luta sem saída", { derrotados: os com fugiu/rendido/… }) */
e = livro(e, { derrotados: sai.inimigos.filter((x) => x && (x.fugiu || x.rendido || x.desacordado || x.derrotado || (x.vida || 0) <= 0)) });
t("[b] o vencedor que sai de pé não é queda: o livro não escreve «derrotado»", !derrotou(e.factos, id) && J(COMO_CAIU.naoCaiu) === J(["saiuDePe"]));
av();
t("A ETAPA NÃO FECHA depois da derrota (antes fechava aqui)", !R.feitas.fera, J(R.feitas));
const v = estadoDaQuest(DES, R, { estado: e, ...ESC });
t("a encruzilhada final NÃO abre: nada de aldeia / coleira / monte com a fera livre", v.etapa === "fera" && !v.escolhas.length, J({ etapa: v.etapa, escolhas: v.escolhas }));
t("o Livro diz o passo de novo: encarar a fera", v.etapa === "fera" && v.faltaTexto.length > 0, J(v.faltaTexto));

sec("§2 o preço e a pauta");
const d = aDerrotaNoConfronto(r1, "derrota");
t("a derrota devolve a chave do confronto (a besta fica alerta)", d && d.chave === aChaveDoConfronto(r1), J(d));
t("o preço que não é da luta: um passo do relógio do vilão (EFEITOS_DA_QUEST, pela porta de sempre)", J(d.efeitos) === J([{ tipo: "relogio_do_fio", n: 1 }]) && J(aplicarEfeitosNoEstado({ dia: 2, personagem: e.personagem }, d.efeitos).aplicados) === J(["relogio_do_fio"]));
t("a bolsa e as horas não se cobram duas vezes: só a saída da luta as tira", !d.efeitos.some((x) => x.tipo === "moedas") && DESFECHOS_SEM_SAIDA.saque.levaMoedas === 1);
t("a pauta diz o que aconteceu: a Quimera venceu, foi embora, segue solta", /Quimera me venceu e foi embora; segue viva e solta/.test(d.acabou[0]) && d.acabou.length === 1);
t("e o veto: não narrar a Quimera vencida, presa, domada ou levada", /Quimera vencida, presa, domada ou levada/.test(d.naoPode[0]) && d.naoPode.length === 1);
const df = aDerrotaNoConfronto(r1, "fuga");
t("fugir da luta também cobra, e a pauta diz a fuga", df && /fugi de Quimera; segue viva e solta/.test(df.acabou[0]) && J(df.efeitos) === J(d.efeitos));
t("a vitória não é derrota: nada a cobrar", aDerrotaNoConfronto(r1, "vitoria") === null);

sec("§3 o segundo confronto: a besta alerta, e vencer fecha");
const alertas = garantirAlertas([d.chave, d.chave, 7, null]);
t("garantirAlertas: só texto, sem repetir", J(alertas) === J([d.chave, "7"]));
const c2 = oConfrontoAqui([PASSO], ONDE, { alertas });
const vs2 = escolhasDoEncontro(c2, { bonus: { furtividade: 4 } });
t("o mesmo covil reabre o confronto, com a besta ALERTA: já viu o herói", c2 && c2.alerta === true && c2.quemViu === "eles");
t("e o Espreitar some (não se espreita quem já te viu), com o porquê", vs2.find((x) => x.id === "espreitar").disponivel === false && vs2.find((x) => x.id === "espreitar").porqueNao === "já te viu");
t("o resto continua de pé: lutar, capturar e recuar", ["lutar", "capturar", "recuar"].every((k) => vs2.find((x) => x.id === k).disponivel));
const r2 = resolverEscolha(c2, "lutar", {});
e = { ...e, factos: oLivroDoEncontro(e.factos, r2, { dia: e.dia, turno: (turno += 10) }) };
av();
t("lutar abre a luta e ainda não fecha nada", r2.desfecho.luta && !R.feitas.fera);
/* a luta vencida: a Quimera no chão (o fecho da vitória escreve todos os inimigos) */
e = livro(e, { derrotados: [{ nome: "Quimera", vida: 0, derrotado: true }] });
av();
/* morta, a solução «matou» da ficha fecha a quest inteira (fecha: concluida) */
t("vencida, a etapa fecha pela lâmina (matou: a quest conclui)", R.feitas.fera && R.feitas.fera.ramo === "lamina" && R.feitas.fera.variante === "matou" && R.estado === "concluida", J({ f: R.feitas, e: R.estado }));

sec("§5 a ida que o sistema não fez (as frases da sessão)");
{
  const ctx = { aqui: "", cidade: "Doca Seca" };
  const l1 = aIdaSemOSistema("Sigo o rastro até Roda dos Punhos", ctx);
  t("«Sigo o rastro até Roda dos Punhos» em Doca Seca: a pauta veta a chegada, o herói continua em Doca Seca", l1 === "narrar a chegada a outro lugar: estou em Doca Seca, e daqui só saio quando o sistema me mover", l1);
  t("«Vou atrás dela»: o mesmo veto", !!aIdaSemOSistema("Vou atrás dela", ctx));
  t("o lugar dito é o de agora (o turno já moveu o que tinha a mover)", /estou em Forja do Gaspar/.test(aIdaSemOSistema("Vou até a forja", { aqui: "Forja do Gaspar", cidade: "Doca Seca" })));
  t("a frase sem ida não leva veto (examinar, perguntar)", aIdaSemOSistema("Examino as pegadas no chão", ctx) === null && aIdaSemOSistema("Pergunto ao ferreiro o preço", ctx) === null);
  t("na estrada e na masmorra, nada (lá quem move é a viagem e a sala); lixo, nada", aIdaSemOSistema("Sigo em frente", { ...ctx, naEstrada: true }) === null && aIdaSemOSistema("Vou até a porta", { ...ctx, naMasmorra: true }) === null && aIdaSemOSistema(null, ctx) === null && aIdaSemOSistema("[sistema] vou", ctx) === null);
  t("a tabela: o «atrás de» e o «no encalço» contam como ida", A_IDA_SEM_O_SISTEMA.atras.test("atras da quimera") && A_IDA_SEM_O_SISTEMA.atras.test("no encalco dela"));
}

sec("§4 o null e o lixo");
t("aDerrotaNoConfronto com lixo dá null", aDerrotaNoConfronto(null, "derrota") === null && aDerrotaNoConfronto({ quest: {} }, "derrota") === null && aDerrotaNoConfronto("x", null) === null);
t("garantirAlertas com lixo dá lista vazia, e tem teto", J(garantirAlertas(null)) === "[]" && garantirAlertas(Array.from({ length: 99 }, (_, i) => "k" + i)).length === O_CONFRONTO_DA_QUEST.derrota.tetoDeAlertas);
t("sem alertas, o cartão é o de sempre (determinístico)", J(oConfrontoAqui([PASSO], ONDE, {})) === J(oConfrontoAqui([PASSO], ONDE, { alertas: [] })));

console.log(`\nS7c · a derrota no confronto: ${bons} passaram, ${maus} falharam`);
if (maus) process.exit(1);
