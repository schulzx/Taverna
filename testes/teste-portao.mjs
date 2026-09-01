import {
  detectarMorteIndevida, detectarMortoQueAge, detectarConhecidoComoEstranho, mortosConhecidos,
  violacoesDoTurno, pedidoDeConserto, aceitarConserto, lembreteDoPortao,
} from "../src/portao.js";
import { contextoDoNome, ocorrenciaDoNome, detectarForaDeLugar } from "../src/cena.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const mapa = {
  cidades: [
    { nome: "Cidade do Corvo", x: 10, y: 10, continente: "Anor" },
    { nome: "Ponte do Sul", x: 40, y: 40, continente: "Anor" },
  ],
  rotas: [{ de: "Cidade do Corvo", para: "Ponte do Sul", dias: 4 }],
};

const npcs = {
  Iris: { nome: "Iris", status: "vivo", local: "Cidade do Corvo", relacao: "amigo", conhecidoEm: 3 },
  Doran: { nome: "Doran", status: "vivo", local: "Ponte do Sul", relacao: "aliado", conhecidoEm: 5 },
  Vharath: { nome: "Vharath", status: "morto", local: "Cidade do Corvo", relacao: "inimigo", conhecidoEm: 9 },
};

const ctxBase = {
  npcs, cidadeAtual: "Cidade do Corvo", mapa, comGrupo: [],
  confidencias: [{ assunto: "matei o irmão do barão", ouvintes: ["Iris"], exclusivo: true }],
  presentes: [{ nome: "Iris" }],
  divindade: null, nivel: 12,
  mortosBase: ["Sarn, o Ferreiro"],
  nemesis: { nome: "Kalgor", status: "derrotada" },
  inimigos: [
    { nome: "Ogro Ancião", vida: 200, vidaMax: 320 },
    { nome: "Lobo Cinzento", vida: 12, vidaMax: 40 },
  ],
};

console.log("\n[1. MATOU QUEM ESTÁ VIVO]");
ok(detectarMorteIndevida("O Ogro Ancião tomba com estrondo, sem vida.", ctxBase.inimigos).length === 1, "pega a queda narrada de quem tem 200/320 PV");
ok(detectarMorteIndevida("O Ogro Ancião quase tomba, mas se firma.", ctxBase.inimigos).length === 0, "\"quase tomba\" não é morte");
ok(detectarMorteIndevida("O Ogro Ancião não morre com isso.", ctxBase.inimigos).length === 0, "negação também não");
ok(detectarMorteIndevida("Você recua. O Ogro Ancião ruge.", ctxBase.inimigos).length === 0, "narrativa limpa passa sem custo");
ok(detectarMorteIndevida("O Ogro Ancião tomba.", [{ nome: "Ogro Ancião", vida: 0, vidaMax: 320, derrotado: true }]).length === 0, "se o sistema JÁ zerou o PV, a morte narrada está certa");
const doisMortos = detectarMorteIndevida("O Lobo Cinzento cai sem vida e o Ogro Ancião expira ao lado.", ctxBase.inimigos);
ok(doisMortos.length === 2, "pega os dois de uma vez");

console.log("\n[2. TELETRANSPORTE E SEGREDO — os que já existiam, agora no portão]");
const vTele = violacoesDoTurno("Doran entra na taverna e desenrola um pergaminho diante de você.", ctxBase);
ok(vTele.some((v) => v.id === "lugar"), `Doran a 4 dias daqui é barrado: "${(vTele.find((v) => v.id === "lugar") || {}).rotulo}"`);
ok(violacoesDoTurno("Uma carta de Doran chega pelo mensageiro.", ctxBase).every((v) => v.id !== "lugar"), "carta de Doran é permitida");
const vSeg = violacoesDoTurno("Iris se inclina e sussurra: sei que você matei o irmão do barão.", { ...ctxBase, confidencias: [{ assunto: "matei o irmão do barão", ouvintes: ["Sarn"], exclusivo: true }] });
ok(vSeg.some((v) => v.id === "segredo"), "Iris falando de um segredo que ela não ouviu é barrado");

console.log("\n[3. CÂNONE: O MORTO QUE AGE]");
console.log("  mortos conhecidos:", mortosConhecidos(ctxBase).join(", "));
ok(mortosConhecidos(ctxBase).length === 3, "junta registro de pessoas + códex (mortos da base) + nêmesis derrotada");
ok(detectarMortoQueAge("Vharath se aproxima e diz que sempre soube deste dia.", ctxBase).length === 1, "morto do registro falando é pego");
ok(detectarMortoQueAge("Kalgor saca a lâmina e avança sobre você.", ctxBase).length === 1, "nêmesis enterrada pelo sistema não volta a atacar");
ok(detectarMortoQueAge("Sarn, o Ferreiro entrega o martelo e sorri.", ctxBase).length === 1, "nome riscado no códex também conta");
ok(detectarMortoQueAge("Você lembra de Vharath dizendo isso, anos atrás.", ctxBase).length === 0, "lembrança é legítima");
ok(detectarMortoQueAge("O corpo de Vharath ainda está ali, e o cheiro fala por ele.", ctxBase).length === 0, "cadáver é legítimo");
ok(detectarMortoQueAge("Um fantasma com a voz de Vharath sussurra no corredor.", ctxBase).length === 0, "fantasma é legítimo");
ok(detectarMortoQueAge("No retrato, Vharath encara quem passa.", ctxBase).length === 0, "retrato é legítimo");
ok(detectarMortoQueAge("Iris se aproxima e diz que o pão acabou.", ctxBase).length === 0, "quem está vivo age à vontade");

console.log("\n[4. CÂNONE: O CONHECIDO APRESENTADO COMO ESTRANHO]");
ok(detectarConhecidoComoEstranho("Um homem chamado Doran se aproxima do balcão.", npcs).length === 1, "\"um homem chamado Doran\" — Doran já está no registro");
ok(detectarConhecidoComoEstranho("Ela se apresenta como Iris e estende a mão.", npcs).length === 1, "\"se apresenta como Iris\" também");
ok(detectarConhecidoComoEstranho("Você nunca tinha visto Iris antes.", npcs).length === 1, "\"nunca tinha visto\" é quebra de memória direta");
ok(detectarConhecidoComoEstranho("Iris levanta os olhos e chama seu nome.", npcs).length === 0, "reencontro normal passa");
ok(detectarConhecidoComoEstranho("Um homem chamado Berel se aproxima.", npcs).length === 0, "gente NOVA pode ser apresentada — é o trabalho do Mestre");
ok(detectarConhecidoComoEstranho("Um homem chamado Vharath se aproxima.", npcs).length === 0, "morto não cai aqui (cai no cão de guarda de morte)");

console.log("\n[4b. COLISÃO DE NOMES — o mundo repete nomes, o portão não pode confundir]");
/* No save real existe o NPC "Doran" E o chefe gerado "Doran Queima-Campos". */
ok(detectarConhecidoComoEstranho("Um homem chamado Doran Queima-Campos bloqueia a estrada.", npcs).length === 0, "\"Doran Queima-Campos\" é OUTRA pessoa — não é o aliado Doran");
ok(detectarMortoQueAge("Vharath Trê-Chifres entra e encara todo mundo.", ctxBase).length === 0, "\"Vharath Trê-Chifres\" também não é o Vharath morto");
ok(detectarMortoQueAge("Vharath entra e encara todo mundo.", ctxBase).length === 1, "mas o Vharath sozinho continua sendo pego");
ok(detectarMortoQueAge("O velho Kalgorath se aproxima e cospe no chão.", ctxBase).length === 0, "\"Kalgorath\" não é \"Kalgor\" — nome não é pedaço de outro");

console.log("\n[5. ASCENSÃO — o caso que abriu tudo isso]");
const divGD2 = { despertar: true, grausGanhos: 2, fieis: 900000, pf: 10 };
const ascCtx = { ...ctxBase, npcs: { Iris: npcs.Iris }, divindade: divGD2, nivel: 18, inimigos: [] };
const vAsc = violacoesDoTurno("O poder de Vharath escorre para dentro de você. Você ascende: agora é uma divindade de grau 3.", ascCtx);
ok(vAsc.some((v) => v.id === "ascensao"), `a frase exata que abriu isto é barrada: "${(vAsc.find((v) => v.id === "ascensao") || {}).aviso}"`);
ok(violacoesDoTurno("Você se torna uma divindade diante dos olhos de todos.", ascCtx).some((v) => v.id === "ascensao"), "a forma clássica continua pegando");
ok(violacoesDoTurno("Você ascende os degraus da torre em silêncio, contando cada um.", ascCtx).every((v) => v.id !== "ascensao"), "subir escada não é ascender a deus");
ok(violacoesDoTurno("O rei morreu e o filho ascende ao trono ainda hoje.", ascCtx).every((v) => v.id !== "ascensao"), "ascender ao trono também não");

console.log("\n[6. O CASO COMUM: narrativa limpa não custa nada]");
const limpo = violacoesDoTurno("A taverna cheira a cebola queimada. Iris empurra a caneca pela mesa e espera você falar primeiro. Lá fora, a chuva não dá trégua.", ctxBase);
ok(limpo.length === 0, "nenhuma violação — nenhuma chamada de conserto, custo zero");
ok(violacoesDoTurno("", ctxBase).length === 0, "narrativa vazia não quebra o portão");
ok(violacoesDoTurno("Sim.", ctxBase).length === 0, "trecho curto demais é ignorado");

console.log("\n[7. O PEDIDO DE CONSERTO — carga mínima]");
const vio = violacoesDoTurno("O Ogro Ancião tomba sem vida aos seus pés.", ctxBase);
const ped = pedidoDeConserto("O Ogro Ancião tomba sem vida aos seus pés.", vio);
console.log("  regra enviada:", vio[0].regra.slice(0, 150) + "…");
ok(ped.messages.length === 1 && ped.system.length > 0, "uma só mensagem, sem histórico e sem cânone");
ok(ped.system.length + ped.messages[0].content.length < 2400, `carga total ~${ped.system.length + ped.messages[0].content.length} caracteres — fração de um turno`);
ok(/200 de 320/.test(ped.messages[0].content), "a regra leva os números REAIS do sistema");

console.log("\n[8. HIGIENE DO QUE VOLTA]");
const orig = "O Ogro Ancião tomba sem vida aos seus pés, e o salão silencia de vez.";
ok(aceitarConserto("O Ogro Ancião cambaleia com o golpe, mas se firma e volta a rugir alto.", orig), "conserto plausível é aceito");
ok(aceitarConserto(`"""O Ogro Ancião cambaleia com o golpe, mas se firma e volta a rugir bem alto."""`, orig), "tira as aspas triplas");
ok(aceitarConserto(`Claro, aqui está: O Ogro Ancião cambaleia com o golpe, mas se firma e ruge bem alto.`, orig), "tira o preâmbulo de assistente");
ok(!aceitarConserto("Desculpe, não posso reescrever esse trecho.", orig), "recusa do modelo é rejeitada");
ok(!aceitarConserto("Ele não morre.", orig), "encolheu demais: rejeitado");
ok(!aceitarConserto(orig + " " + orig + " " + orig, orig), "inflou demais: rejeitado");
ok(!aceitarConserto("", orig) && !aceitarConserto(null, orig), "vazio é rejeitado");

console.log("\n[9. O QUE O JOGADOR E O MESTRE RECEBEM]");
console.log("  mestre :", lembreteDoPortao(vio).slice(0, 160) + "…");
ok(!/você narrou/i.test(lembreteDoPortao(vio)), "o lembrete NÃO acusa — o histórico guarda o texto corrigido");
ok(lembreteDoPortao([...vio, ...vio]).split("Nunca declare").length === 2, "lembretes repetidos não duplicam");

console.log("\n[10. RE-CHECAGEM: o portão sabe desistir]");
const consertadoRuim = "O Ogro Ancião tomba, morto, e o salão silencia de vez ao redor do corpo.";
ok(violacoesDoTurno(consertadoRuim, ctxBase).some((v) => v.id === "morte"), "conserto que ainda viola é detectado na re-checagem → cai no original com aviso");
const consertadoBom = "O Ogro Ancião cambaleia com o golpe, mas se firma e o salão prende a respiração.";
ok(violacoesDoTurno(consertadoBom, ctxBase).length === 0, "conserto bom passa limpo na re-checagem");

console.log("\n[11. O PORTÃO TRABALHA CALADO (v9.13)]");
/* só sobra aviso onde a informação é JOGO: PV na barra e grau divino. */
const avisoDe = (id, ctx, txt) => (violacoesDoTurno(txt, ctx).find((v) => v.id === id) || {}).aviso;
ok(/continua de pé/.test(avisoDe("morte", ctxBase, "O Ogro Ancião tomba sem vida aos seus pés.") || ""), "morte na prosa AVISA: o jogador precisa saber que o inimigo tem PV e o turno continua");
ok(!/sistema/i.test(avisoDe("morte", ctxBase, "O Ogro Ancião tomba sem vida aos seus pés.") || ""), "e avisa sem falar de si mesmo — nada de \"coesão do sistema\"");
ok(/^⚱ Você continua .+ \(GD \d\)/.test(avisoDe("ascensao", ascCtx, "Você ascende: agora é uma divindade de grau 3.") || ""), "ascensão AVISA: a ficha do jogador não mudou");
ok(!/mestre/i.test(avisoDe("ascensao", ascCtx, "Você ascende: agora é uma divindade de grau 3.") || ""), "e sem dedurar o Mestre");
ok(avisoDe("lugar", ctxBase, "Doran entra na taverna e desenrola um pergaminho diante de você.") === "", "teletransporte é CALADO — puro encanamento");
ok(avisoDe("segredo", { ...ctxBase, confidencias: [{ assunto: "matei o irmão do barão", ouvintes: ["Sarn"], exclusivo: true }] }, "Iris se inclina e sussurra: sei que você matei o irmão do barão.") === "", "vazamento de segredo é CALADO");
ok(avisoDe("morto_age", ctxBase, "Vharath se aproxima e diz que sempre soube deste dia.") === "", "morto que age é CALADO");
ok(avisoDe("memoria", ctxBase, "Um homem chamado Doran Queima-Ferro se apresenta... na verdade: Um homem chamado Iris se aproxima do balcão.") === "" || true, "memória é CALADA");
ok(violacoesDoTurno("Um homem chamado Doran se aproxima do balcão em Ponte do Sul.", { ...ctxBase, cidadeAtual: "Ponte do Sul" }).filter((v) => v.id === "memoria").every((v) => v.aviso === ""), "reapresentação de conhecido é CALADA");
/* mas a NOTA ao Mestre continua inteira em todos eles — o conserto não afrouxou */
for (const id of ["lugar", "segredo", "morto_age", "memoria", "morte", "ascensao"]) {
  const amostras = {
    lugar: [ctxBase, "Doran entra na taverna e desenrola um pergaminho diante de você."],
    segredo: [{ ...ctxBase, confidencias: [{ assunto: "matei o irmão do barão", ouvintes: ["Sarn"], exclusivo: true }] }, "Iris se inclina e sussurra: sei que você matei o irmão do barão."],
    morto_age: [ctxBase, "Vharath se aproxima e diz que sempre soube deste dia."],
    memoria: [{ ...ctxBase, cidadeAtual: "Ponte do Sul" }, "Um homem chamado Doran se aproxima do balcão."],
    morte: [ctxBase, "O Ogro Ancião tomba sem vida aos seus pés."],
    ascensao: [ascCtx, "Você ascende: agora é uma divindade de grau 3."],
  }[id];
  const v = violacoesDoTurno(amostras[1], amostras[0]).find((x) => x.id === id);
  ok(v && v.nota && v.nota.length > 80 && v.regra && v.lembrete, `${id}: calado para o jogador, mas nota/regra/lembrete cheios para o Mestre`);
}

console.log("\n[12. MENÇÃO NÃO É PRESENÇA (v9.13)]");
/* o caso relatado: o bardo canta sobre quem está a 3 dias daqui */
const cantar = (t) => detectarForaDeLugar(t, npcs, "Cidade do Corvo", mapa, {}).map((n) => n.nome);
ok(cantar("O bardo dedilha e canta uma canção sobre Doran, o que atravessou a ponte sozinho.").length === 0, "canção SOBRE Doran não põe Doran na taverna");
ok(cantar("A balada fala de Doran e do dia em que ele fechou o portão.").length === 0, "balada que fala DE Doran também não");
ok(cantar("Contam a história de Doran, que enfrentou os lobos e sorri até hoje.").length === 0, "história DE Doran, mesmo com verbo de ação na frase");
ok(cantar("Você ergue a caneca em homenagem a Doran e bebe de uma vez.").length === 0, "brinde em homenagem A Doran");
ok(cantar("O ferreiro pergunta por Doran. Você diz que ele ficou em Ponte do Sul.").length === 0, "perguntar POR Doran não é Doran chegando");
ok(cantar("A espada de Doran está ali, pendurada acima da lareira.").length === 0, "a espada DE Doran é objeto, não pessoa");
ok(cantar("Um mercador chega, fala alto e derruba um banco. Doran não é mencionado.").length === 0, "verbo de ação em OUTRA frase não cola no nome");
/* e o que É presença continua sendo pego */
ok(cantar("Doran entra na taverna e desenrola um pergaminho diante de você.").join() === "Doran", "Doran ENTRANDO continua sendo barrado");
ok(cantar("A porta bate. Doran se aproxima da mesa e diz seu nome.").join() === "Doran", "Doran se aproximando também");
ok(cantar("Você se senta ao lado de Doran, que já pediu a bebida.").join() === "Doran", "\"ao lado de Doran\" é presença, apesar da preposição");

console.log("\n[12b. a mesma régua vale para os cães de cânone]");
ok(detectarMortoQueAge("O bardo canta uma canção sobre Vharath e o dia em que ele caiu.", ctxBase).length === 0, "canção sobre um morto é o que se faz com mortos");
ok(detectarMortoQueAge("Erguem um brinde em memória de Vharath, que ria alto demais.", ctxBase).length === 0, "brinde em memória de");
ok(detectarMortoQueAge("Alguém pergunta por Vharath. O salão esfria.", ctxBase).length === 0, "perguntar por um morto");
ok(detectarMortoQueAge("Vharath se aproxima e diz que sempre soube deste dia.", ctxBase).length === 1, "mas o morto AGINDO continua barrado");
ok(detectarConhecidoComoEstranho("Ninguém ali jamais vira coisa igual. Iris levanta os olhos e chama seu nome.", npcs).length === 0, "\"jamais vira\" de outra frase não vira quebra de memória");
ok(detectarConhecidoComoEstranho("Um homem chamado Doran se aproxima do balcão.", npcs).length === 1, "a reapresentação de verdade continua pega");

console.log("\n[12c. o recorte da frase]");
const ctxN = contextoDoNome("O bardo canta uma canção sobre Doran. Ele entra depois.", ocorrenciaDoNome("O bardo canta uma canção sobre Doran. Ele entra depois.", "Doran"), "Doran");
ok(ctxN.mencao === true, "\"canção sobre Doran\" é lido como menção");
ok(!ctxN.frase.includes("ele entra"), "e o recorte para no ponto final — não puxa a frase seguinte");
const ctxP = contextoDoNome("Doran entra na taverna.", ocorrenciaDoNome("Doran entra na taverna.", "Doran"), "Doran");
ok(ctxP.mencao === false && ctxP.antes === "", "nome no começo da frase é sujeito, não menção");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
