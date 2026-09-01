import {
  ETAPAS, etapaDef, textoDaEtapa, TIPOS, tipoDef, ehForcada, MAX_ATIVAS,
  recompensaDe, garantirMissoes, criarMissao, ativas, ofertas, etapaAtual, progresso,
  conferir, aceitarProposta, responderOferta, semearMissoes, relogioDaMissao,
  falharPorRelogio, linhaDoAvanco, envelopeDeAvanco, envelopeDeConclusao,
  envelopeDeRecusa, resumoMissoesPrompt, encerrarLegado,
} from "../src/missoes.js";
import { porSituacao as SIT } from "../src/mundo-base.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const MUNDO_VAZIO = { cidadeAtual: "", derrotados: [], inventario: [], equipamento: [], npcs: {}, dia: 1, relogios: [] };

console.log("\n[1. SÓ EXISTE ETAPA QUE O CÓDIGO CONFERE]");
/* v9.129: OITO. `revelar` entrou porque a espinha precisava de um marco de
   descoberta e o unico jeito de dizer "descobri" era `ir_a` — presenca, que
   e exatamente o que esta base acabou de declarar insuficiente para um
   resgate. A contagem fixa e a catraca: quem acrescentar o nono passa por
   aqui e tem de provar que ele se confere. */
/* v9.132: NOVE. `resgatar` entrou na fase 3, e a condicao dele e a mudanca
   de SITUACAO que a fase 2 trouxe — encontrar alguem nao e tirar de la. */
ok(Object.keys(ETAPAS).length === 9, "nove tipos de etapa, todos verificáveis");
ok(Object.values(ETAPAS).every((e) => typeof e.ver === "function" && typeof e.texto === "function"), "cada um sabe se olhar no espelho do estado e se descrever");
const casos = [
  [{ tipo: "revelar", alvo: "A Capela" }, { ...MUNDO_VAZIO, revelados: ["Aldoria|local|A Capela"] }, true, "descobrir o que o lugar esconde"],
  /* resgatar: a pessoa deixou de estar presa, e nao morreu no caminho */
  [{ tipo: "resgatar", alvo: "Ione" }, { ...MUNDO_VAZIO, base: SIT(null, "Ione", "cativa") }, false, "quem ainda esta presa nao foi resgatada"],
  [{ tipo: "resgatar", alvo: "Ione" }, { ...MUNDO_VAZIO, base: SIT(null, "Ione", "livre") }, true, "e livre e resgatada"],
  [{ tipo: "resgatar", alvo: "Ione" }, { ...MUNDO_VAZIO, base: SIT(null, "Ione", "morta") }, false, "morta nao e resgatada"],
  [{ tipo: "revelar", alvo: "A Capela" }, { ...MUNDO_VAZIO, cidadeAtual: "Aldoria", lugarAtual: "A Capela" }, false, "e ESTAR nele nao e descobri-lo"],
  [{ tipo: "ir_a", alvo: "Aldoria" }, { ...MUNDO_VAZIO, cidadeAtual: "Aldoria" }, true, "chegar na cidade"],
  [{ tipo: "ir_a", alvo: "Aldoria" }, { ...MUNDO_VAZIO, cidadeAtual: "Outra" }, false, "cidade errada não conta"],
  [{ tipo: "derrotar", alvo: "Ogro", quantos: 2 }, { ...MUNDO_VAZIO, derrotados: ["Ogro 1", "Ogro 2"] }, true, "derrotar dois ogros"],
  [{ tipo: "derrotar", alvo: "Ogro", quantos: 2 }, { ...MUNDO_VAZIO, derrotados: ["Ogro 1"] }, false, "um só não fecha"],
  [{ tipo: "achar", alvo: "Chave" }, { ...MUNDO_VAZIO, inventario: [{ nome: "Chave de Osso" }] }, true, "achar pelo nome parcial"],
  [{ tipo: "falar_com", alvo: "Iris" }, { ...MUNDO_VAZIO, npcs: { Iris: { nome: "Iris", conhecidoEm: 3 } } }, true, "encontrar quem está no registro"],
  [{ tipo: "levar_a", alvo: "Aldoria", item: "Pacote" }, { ...MUNDO_VAZIO, cidadeAtual: "Aldoria", inventario: ["Pacote lacrado"] }, true, "entregar exige chegar COM a coisa"],
  [{ tipo: "levar_a", alvo: "Aldoria", item: "Pacote" }, { ...MUNDO_VAZIO, cidadeAtual: "Aldoria" }, false, "chegar sem a coisa não conta"],
  [{ tipo: "aguentar", dia: 40 }, { ...MUNDO_VAZIO, dia: 41 }, true, "sobreviver até o dia"],
  [{ tipo: "vencer_relogio", relogioId: "r1" }, { ...MUNDO_VAZIO, relogios: [] }, true, "o relógio sumiu: venceu"],
  [{ tipo: "vencer_relogio", relogioId: "r1" }, { ...MUNDO_VAZIO, relogios: [{ id: "r1" }] }, false, "enquanto ele conta, não"],
];
for (const [e, m, esp, txt] of casos) ok(etapaDef(e.tipo).ver(e, m) === esp, txt);

console.log("\n[2. A MISSÃO]");
const m1 = criarMissao({ titulo: "Resgatar a filha do barão", tipo: "favor", dador: "Barão Aldric", nivel: 10, dia: 5,
  etapas: [{ tipo: "ir_a", alvo: "Ponte do Sul" }, { tipo: "derrotar", alvo: "Mercenário", quantos: 3 }, { tipo: "falar_com", alvo: "Elyn" }] });
console.log(`  "${m1.titulo}" — ${m1.etapas.length} etapas · paga ◉ ${m1.recompensa.moedas} e ${m1.recompensa.xp} XP${m1.recompensa.item ? ` + item ${m1.recompensa.item}` : ""}`);
ok(m1.status === "oferecida", "missão de favor nasce como OFERTA — o jogador decide");
ok(criarMissao({ titulo: "A nêmesis", tipo: "cacada", etapas: [{ tipo: "derrotar", alvo: "X" }] }).status === "ativa", "caçada nasce ATIVA: não há botão de 'não, obrigado' para quem te caça");
ok(ehForcada("global") && ehForcada("divina") && !ehForcada("contrato"), "o mundo impõe global e divina; contrato se recusa");
ok(m1.recompensa.moedas > 0 && m1.recompensa.xp > 0, "toda missão paga — antes só o contrato pagava, e terminar era igual a abandonar");
ok(!criarMissao({ titulo: "Sem etapa", tipo: "favor", etapas: [] }), "missão sem etapa não existe");
ok(recompensaDe({ tipo: "principal", nivel: 12, etapas: 4 }).moedas > recompensaDe({ tipo: "contrato", nivel: 12, etapas: 1 }).moedas, "missão grande paga mais que contrato pequeno");
ok(!recompensaDe({ tipo: "contrato", nivel: 12, etapas: 1 }).item, "e item só nas grandes — senão item deixa de significar");

console.log("\n[3. O CONFERENTE — em sequência, nunca fora de ordem]");
let ms = [{ ...m1, status: "ativa" }];
let r = conferir(ms, { ...MUNDO_VAZIO, derrotados: ["Mercenário 1", "Mercenário 2", "Mercenário 3"] });
ok(r.avancos.length === 0, "matar os três ANTES de chegar não pula a etapa 1 — missão é sequência, não lista de compras");
r = conferir(ms, { ...MUNDO_VAZIO, cidadeAtual: "Ponte do Sul" });
ok(r.avancos.length === 1 && r.avancos[0].indice === 0, "chegar fecha a primeira");
console.log("  " + linhaDoAvanco(r.avancos[0]));
ms = r.missoes;
r = conferir(ms, { ...MUNDO_VAZIO, cidadeAtual: "Ponte do Sul", derrotados: ["Mercenário 1", "Mercenário 2", "Mercenário 3"] });
ok(r.avancos.length === 1 && r.avancos[0].indice === 1, "aí sim a segunda");
ms = r.missoes;
r = conferir(ms, { ...MUNDO_VAZIO, npcs: { Elyn: { nome: "Elyn", conhecidoEm: 9 } } });
ok(r.concluidas.length === 1 && r.missoes[0].status === "concluida", "a última fecha a missão inteira");
ok(conferir(r.missoes, { ...MUNDO_VAZIO, cidadeAtual: "Ponte do Sul" }).avancos.length === 0, "missão concluída não avança mais — não fica pendurada no diário");
ok(conferir([{ ...m1, status: "oferecida" }], { ...MUNDO_VAZIO, cidadeAtual: "Ponte do Sul" }).avancos.length === 0, "oferta não avança sozinha: só o que foi aceito conta");

console.log("\n[4. O MESTRE OFERECE, O SISTEMA DECIDE]");
const bom = aceitarProposta([], { titulo: "Escolta até Aldoria", tipo: "contrato", dador: "Capitã Vera", etapas: [{ tipo: "ir_a", alvo: "Aldoria" }] }, { nivel: 8 });
ok(bom.ok && bom.missao.status === "oferecida", "proposta boa vira oferta");
const vago = aceitarProposta([], { titulo: "Ganhar a confiança do barão", etapas: [{ tipo: "confiar", alvo: "barão" }] }, {});
ok(!vago.ok && /nenhuma etapa/.test(vago.motivo), `"ganhar a confiança" é recusado: ${vago.motivo} — é a trava que impede adjetivo de virar missão`);
ok(!aceitarProposta([], { titulo: "Sem etapas", etapas: [] }, {}).ok, "sem etapa, recusa");
ok(!aceitarProposta([], {}, {}).ok, "sem título, recusa");
ok(!aceitarProposta([bom.missao], { titulo: "Escolta até Aldoria", etapas: [{ tipo: "ir_a", alvo: "X" }] }, {}).ok, "duplicata pelo nome, recusa");
const lotado = Array.from({ length: MAX_ATIVAS }, (_, i) => criarMissao({ titulo: "M" + i, tipo: "cacada", status: "ativa", etapas: [{ tipo: "ir_a", alvo: "X" }] }));
ok(!aceitarProposta(lotado, { titulo: "Mais uma", etapas: [{ tipo: "ir_a", alvo: "Y" }] }, {}).ok, "com o diário cheio, recusa");
const torta = aceitarProposta([], { titulo: "X", tipo: "inventado", etapas: [{ tipo: "ir_a", alvo: "Aldoria" }, { tipo: "lixo" }] }, {});
ok(torta.ok && torta.missao.tipo === "favor" && torta.missao.etapas.length === 1, "proposta torta é APARADA, não recusada — o Mestre sugere, o código decide");

console.log("\n[5. ACEITAR E RECUSAR]");
const aceito = responderOferta([bom.missao], bom.missao.id, true);
ok(aceito.ok && aceito.missoes[0].status === "ativa", "aceitar ativa");
const recusado = responderOferta([bom.missao], bom.missao.id, false);
ok(recusado.ok && recusado.missoes[0].status === "recusada", "recusar encerra sem culpa");
ok(!responderOferta([aceito.missoes[0]], bom.missao.id, true).ok, "não dá para aceitar o que já foi aceito");
ok(/não insista/i.test(envelopeDeRecusa(bom.missao)) && /não faça o mundo me punir/i.test(envelopeDeRecusa(bom.missao)),
   "e o envelope proíbe o Mestre de insistir ou de punir o 'não'");

console.log("\n[6. AS QUE O MUNDO IMPÕE]");
const semNada = semearMissoes([], {});
ok(semNada.novas.length === 0, "sem nêmesis e sem evento, nada nasce");
const comNem = semearMissoes([], { nemesis: { nome: "Brigid", odio: 70, status: "viva", motivo: "você matou o irmão dela" }, nivel: 12 });
ok(comNem.novas.length === 1 && comNem.novas[0].status === "ativa", "nêmesis com ódio alto vira missão ATIVA, sem oferta");
ok(comNem.novas[0].etapas[0].tipo === "derrotar", "e a etapa é concreta: derrotá-la");
ok(semearMissoes([], { nemesis: { nome: "Brigid", odio: 20, status: "viva" } }).novas.length === 0, "ódio baixo ainda não vira missão");
ok(semearMissoes(comNem.missoes, { nemesis: { nome: "Brigid", odio: 90, status: "viva" } }).novas.length === 0, "semear de novo não duplica — idempotente, dá para rodar todo turno");
const comGlobal = semearMissoes([], { global: { nome: "A Praga Cinzenta" }, relogioGlobalId: "rg1", nivel: 10 });
ok(comGlobal.novas.length === 1 && comGlobal.novas[0].etapas[0].tipo === "vencer_relogio", "o evento global vira missão amarrada ao relógio dele");
ok(semearMissoes([], { global: { nome: "X" } }).novas.length === 0, "sem relógio, o global não vira missão — a etapa não teria o que conferir");

console.log("\n[7. PRAZO]");
/* v9.38: prazo virou opcional. Antes esta função devolvia um relógio de 6
   noites para QUALQUER missão — e era por isso que ligá-la teria posto um
   cronômetro de fracasso em cima de todo serviço aceito. */
const semPrazo = criarMissao({ titulo: "Sem pressa", tipo: "favor", status: "ativa", etapas: [{ tipo: "ir_a", alvo: "X" }] });
ok(relogioDaMissao(semPrazo, 5) === null, "missão sem prazo NÃO ganha relógio");
const comPrazo = criarMissao({ titulo: "Antes do inverno", tipo: "favor", status: "ativa", etapas: [{ tipo: "ir_a", alvo: "X" }], prazo: 6 });
const rel = relogioDaMissao(comPrazo, 5);
ok(rel.fonte === `missao:${comPrazo.id}`, "o relógio de prazo sabe de quem é");
const fal = falharPorRelogio([comPrazo], rel.fonte);
ok(fal.falhada && fal.missoes[0].status === "falhada", "quando ele enche, a missão FALHA — é o que dá peso ao prazo");
ok(falharPorRelogio([comPrazo], "missao:nao_existe").falhada === null, "fonte desconhecida não quebra");

console.log("\n[8. OS TEXTOS]");
const conc = envelopeDeConclusao(m1, m1.recompensa);
ok(/NÃO envie moedas, XP nem itens/.test(conc), "o envelope de conclusão proíbe pagamento dobrado");
ok(/não a mencione como pendente nunca mais/.test(conc), "e manda parar de citá-la — a queixa original do diário");
ok(/Barão Aldric/.test(conc), "e fecha com quem encomendou, não com um estranho");
/* v9.119: `envelopeDeOferta` saiu da fonte. Ninguém mais faz uma proposta
   ao herói na cena: quem quer um serviço feito prega um cartaz, e o
   envelope que corresponde a isso é `envelopeDoRecado`, provado em
   teste-ofertas. O que se media aqui — o preço cravado, a proibição de
   prometer dinheiro — continua provado lá, sobre o envelope que existe. */
const resumo = resumoMissoesPrompt([{ ...m1, status: "ativa" }, bom.missao]);
console.log("  " + resumo.split("\n").slice(0, 3).join("\n  "));
ok(/NUNCA você/.test(resumo), "o Mestre é proibido de abrir, avançar e encerrar");
ok(/nunca liste as etapas futuras/i.test(resumo), "e de entregar o spoiler das próximas etapas");
ok(/agora:/.test(resumo), "mas a etapa ATUAL vai — é o que ele precisa para encenar o caminho");
ok(resumo.length < 900, `enxuto: ${resumo.length} caracteres`);

console.log("\n[9. PROGRESSO E HIGIENE]");
const meio = { ...m1, etapas: m1.etapas.map((e, i) => ({ ...e, feito: i === 0 })) };
ok(progresso(meio).feitas === 1 && progresso(meio).total === 3, "conta o progresso");
ok(textoDaEtapa(etapaAtual(meio)) === "Derrotar Mercenário (3)", `a etapa atual se descreve sozinha: "${textoDaEtapa(etapaAtual(meio))}"`);
ok(garantirMissoes(null).length === 0 && garantirMissoes("lixo").length === 0, "entrada inválida devolve vazio");
ok(garantirMissoes([{ titulo: "x", etapas: Array.from({ length: 20 }, () => ({ tipo: "ir_a", alvo: "y" })) }])[0].etapas.length === 5, "no máximo 5 etapas");
ok(garantirMissoes([{ titulo: "x", status: "inventado" }])[0].status === "ativa", "status desconhecido cai em ativa");

console.log("");
console.log("[10. AS DE LEGADO — o furo que o teste no jogo pegou]");
/* A quest antiga nao tem etapa verificavel. Na primeira versao eu a migrei
   com "sobreviver ate hoje" — que ja estava cumprido: ela se concluiu sozinha
   no primeiro turno e PAGOU recompensa por algo que ninguem fez. */
{
  const hoje = 39;
  const ruim = criarMissao({ titulo: "Antiga", tipo: "favor", status: "ativa", etapas: [{ tipo: "aguentar", dia: hoje }] });
  ok(conferir([ruim], { ...MUNDO_VAZIO, dia: hoje }).concluidas.length === 1,
     "reproduzido: com o dia de hoje, a missao migrada se conclui sozinha e paga");
  const boa = criarMissao({ titulo: "Antiga2", tipo: "favor", status: "ativa", etapas: [{ tipo: "aguentar", dia: 999999 }] });
  ok(conferir([{ ...boa, legado: true }], { ...MUNDO_VAZIO, dia: hoje }).concluidas.length === 0,
     "corrigido: num dia inalcancavel ela fica aberta, esperando o jogador");
  const enc = encerrarLegado([{ ...boa, legado: true }], boa.id, "concluida");
  ok(enc.ok && enc.missoes[0].status === "concluida", "e o jogador a encerra a mao — ele sabe se terminou, o sistema nao tem como saber");
  ok(encerrarLegado([{ ...boa, legado: true }], boa.id, "falhada").missoes[0].status === "falhada", "ou marca que ficou pelo caminho");
  ok(!encerrarLegado([{ ...boa, legado: false }], boa.id).ok,
     "e missao NORMAL nao se encerra a mao — abrir essa porta desfaria a regra inteira");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
