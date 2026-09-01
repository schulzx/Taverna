import {
  ESTRUTURAS, estruturaPorId, garantirHistoria, custoDaEtapa, PESO_MARCO, pesoDe,
  registrarMarco, podeVirar, virarEtapa, temAntagonista, resumoHistoria, envelopeDeVirada, resumoQuests,
} from "../src/historia.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const jornada = estruturaPorId("jornada");

console.log("\n[1. A MIGRAÇÃO — o save antigo não perde o lugar]");
const velho = { estrutura: "misterio", etapa: 2 };
const h0 = garantirHistoria(velho);
ok(h0.estrutura === "misterio" && h0.etapa === 2, "continua exatamente no momento em que estava");
ok(h0.marcos === 0 && Array.isArray(h0.feitos), "e ganha o contador de marcos zerado");
ok(garantirHistoria(null).estrutura === "jornada", "sem save nenhum, cai no arco padrão");
ok(garantirHistoria({ estrutura: "jornada", etapa: 99 }).etapa === jornada.etapas.length - 1, "etapa fora da faixa é grampeada — nada de momento inexistente");

console.log("\n[2. MARCO É FATO, E FATO TEM PESO]");
ok(pesoDe("missao_forcada") > pesoDe("missao"), "o que o mundo impôs pesa mais que um favor");
ok(pesoDe("nemesis") === PESO_MARCO.nemesis && pesoDe("nada") === 0, "o que não está na tabela não move nada");
const r1 = registrarMarco(garantirHistoria({}), "missao", 'concluí "A carroça"');
ok(r1.ganhou === 1 && r1.historia.marcos === 1, "uma missão comum empurra 1");
ok(r1.historia.feitos[0].includes("A carroça"), "e o arco guarda POR QUE andou — é isso que a virada vai citar");
ok(registrarMarco(r1.historia, "opiniao_do_mestre").ganhou === 0, "opinião não é marco: o Mestre não tem canal para empurrar o arco");

console.log("\n[3. O ARCO NÃO ANDA SÓ PORQUE ALGUÉM ACHOU]");
let h = garantirHistoria({ estrutura: "jornada", etapa: 0 });
const custo0 = custoDaEtapa(jornada, 0);
console.log(`  custo dos momentos: ${jornada.etapas.map((_, i) => custoDaEtapa(jornada, i)).join(" · ")}`);
ok(custoDaEtapa(jornada, 3) > custoDaEtapa(jornada, 0), "o custo cresce — o penúltimo momento exige uma campanha empurrando");
ok(!podeVirar(h, {}).pode, "com zero marcos não vira");
ok(podeVirar(h, {}).falta === custo0, "e o sistema sabe dizer quanto falta");
h = registrarMarco(h, "missao_forcada", "matei o capitão").historia;
h = registrarMarco(h, "relogio", "o cerco chegou ao fim").historia;
ok(h.marcos >= custo0, "duas coisas grandes bastam para o primeiro momento");
const v1 = virarEtapa(h, {});
ok(v1.virou && v1.historia.etapa === 1, "o momento vira");
ok(v1.de.nome === "O Chamado" && v1.para.nome === "A Travessia", "e vira para o próximo, não para qualquer um");
ok(v1.causas.length === 2 && v1.causas[0].includes("capitão"), "a virada carrega as causas reais");
ok(v1.historia.feitos.length === 0, "e zera a lista: as causas são do momento que passou");

console.log("\n[4. O EXCEDENTE ATRAVESSA]");
let h2 = garantirHistoria({ estrutura: "jornada", etapa: 0 });
for (let i = 0; i < 3; i++) h2 = registrarMarco(h2, "nemesis", `feito ${i}`).historia;
const v2 = virarEtapa(h2, { nemesis: "Sombra" });
ok(v2.historia.marcos === 12 - custo0, "quem fecha três coisas de uma vez não perde o empurrão da terceira");

console.log("\n[5. NÃO SE ENTRA NO DESFECHO SEM ANTAGONISTA]");
const penultima = jornada.etapas.length - 2;
let h3 = garantirHistoria({ estrutura: "jornada", etapa: penultima });
for (let i = 0; i < 12; i++) h3 = registrarMarco(h3, "missao_forcada", `feito ${i}`).historia;
const semAlvo = podeVirar(h3, {});
ok(!semAlvo.pode, "com marcos de sobra e o mundo vazio, o arco SEGURA");
ok(/nenhuma nêmesis viva|nenhum evento global/i.test(semAlvo.motivo), "e o motivo é esse: não há contra quem terminar");
ok(!temAntagonista({}) && temAntagonista({ nemesis: "Sombra" }) && temAntagonista({ global: "A Peste" }), "nêmesis OU evento global servem de antagonista");
ok(virarEtapa(h3, {}).virou === false, "e virar de fato é recusado");
const comAlvo = virarEtapa(h3, { global: "A Peste Cinzenta" });
ok(comAlvo.virou && comAlvo.para.nome === "O Retorno", "com o evento global em curso, o desfecho abre");
ok(!virarEtapa(comAlvo.historia, { global: "A Peste Cinzenta" }).virou, "e do último momento não se sai — não existe etapa 7 numa estrutura de 6");

console.log("\n[6. O QUE O MESTRE LÊ — direção casada com o motor]");
const txtVazio = resumoHistoria(garantirHistoria({}), {});
ok(/NÃO HÁ PEÇA GRANDE NA MESA/.test(txtVazio), "sem peça no motor, ele é mandado PLANTAR uma");
ok(/não anuncie clímax/i.test(txtVazio), "e proibido de anunciar catástrofe sem contra quem acontecer");
const motor = { nemesis: "Sombra da Ponte", global: "A Peste Cinzenta", impostas: ['"Acertar contas"'], relogios: ["O cerco ●●●○○○"] };
const txt = resumoHistoria(garantirHistoria({ estrutura: "jornada", etapa: 2 }), motor);
console.log("  " + txt.split("\n")[0]);
/* v9.84: O NOME DA ETAPA NÃO SOBE MAIS AO PROMPT. Ele ia como `momento
   interno "O Abismo"` — e uma IA que sabe que está no Abismo escreve como
   quem sabe: anuncia o tom, antecipa a queda, escolhe as palavras do
   rótulo. A proibição de contar ao jogador já existia e não bastava,
   porque o vazamento não é dizer o nome: é escrever a etiqueta em vez da
   cena. O que sobe é a DIREÇÃO, que é o que ela precisa para narrar. */
ok(!/Provações/.test(txt), "o nome da etapa NÃO vai ao Mestre");
ok(/Desafios crescentes testam o herói/.test(txt), "mas a direção do momento vai inteira");
ok(/Sombra da Ponte/.test(txt) && /Peste Cinzenta/.test(txt) && /O cerco/.test(txt),
   "e as provações se fazem com as peças que JÁ existem — é aqui que arco e motor viram a mesma frase");
ok(/NÃO avança o arco/.test(txt), "proibição 1: ele não move o momento");
ok(/NUNCA diga ao jogador em que momento do arco ele está/.test(txt), "proibição 2: nem pelo nome");
ok(/sinônimo/.test(txt), "nem por sinônimo — 'é a hora mais escura' entrega igual");

console.log("\n[7. O ENVELOPE DA VIRADA]");
ok(envelopeDeVirada({ virou: false }) === "", "sem virada, silêncio");
const env = envelopeDeVirada(comAlvo);
console.log("  " + env.split("\n")[0].slice(0, 120));
ok(/A Transformação/.test(env) && /O Retorno/.test(env), "diz de onde saiu e para onde foi");
ok(/feito 0|feito 1/.test(env), "e por causa de quê — a mudança tem causa visível");
ok(/NÃO me diga que a história mudou de momento/.test(env), "mas o jogador não pode ler nada disso: ele sente pelo que acontece");
ok(/sem recomeço, sem resumo/.test(env), "e a virada é mudança de tom, não reinício de campanha");

console.log("\n[8. AS QUESTS ANTIGAS]");
ok(resumoQuests([]) === "", "sem quest antiga, nada vai ao prompt");
const q = resumoQuests([{ titulo: "A oferta estranha", status: "ativa", tipo: "secundaria" }]);
ok(/só o jogador as encerra/.test(q), "e as que sobraram vêm marcadas como intocáveis pelo Mestre");
ok(!/quest_nova/.test(q), "sem convite para o campo que morreu");

console.log("\n[9. TODA ESTRUTURA FECHA]");
for (const est of ESTRUTURAS) {
  let hx = garantirHistoria({ estrutura: est.id, etapa: 0 });
  let voltas = 0;
  while (hx.etapa < est.etapas.length - 1 && voltas < 500) {
    hx = registrarMarco(hx, "missao", "x").historia;
    const vv = virarEtapa(hx, { nemesis: "alguém" });
    if (vv.virou) hx = vv.historia;
    voltas++;
  }
  ok(hx.etapa === est.etapas.length - 1, `${est.nome}: chega ao desfecho em ${voltas} missões — nenhum arco fica preso`);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
