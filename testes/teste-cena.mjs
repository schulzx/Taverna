import {
  diasEntre, cidadeDe, elencoDaCena, detectarForaDeLugar, notaForaDeLugar,
  registrarConfidencia, detectarVazamento, notaVazamento, resumoCenaPrompt,
} from "../src/cena.js";
import { gerarGeografia } from "../src/geografia.js";
import { masmorrasDoMundo, tesourosDoMundo } from "../src/mundo-base.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

const mapa = gerarGeografia("mundo-cena|fantasia");
const A = mapa.cidades[0].nome, B = mapa.cidades[mapa.cidades.length - 1].nome;
console.log(`\n[mundo de teste: ${mapa.cidades.length} cidades — daqui (${A}) até lá (${B})]`);

const npcs = {
  Doran: { nome: "Doran", papel: "ferreiro", local: B, status: "vivo" },
  Iris: { nome: "Iris", papel: "curandeira", local: A, status: "vivo" },
  Corvo: { nome: "Corvo", papel: "informante", local: "", status: "vivo" },
  Morto: { nome: "Morto", papel: "ex-capitão", local: A, status: "morto" },
};
const grupo = [{ nome: "Vera-Aliada" }];
npcs["Vera-Aliada"] = { nome: "Vera-Aliada", papel: "escudeira", local: B, status: "vivo" };

console.log("\n[1) O TELETRANSPORTE — o sujeito que ficou em outra cidade]");
console.log(`  ${A} → ${B}: ${diasEntre(mapa, A, B)} dia(s)`);
ok(diasEntre(mapa, A, A) === 0, "mesma cidade: zero dias");
ok(diasEntre(mapa, A, B) >= 1, "cidades diferentes custam pelo menos um dia");

const { aqui, longe } = elencoDaCena(npcs, A, mapa, { comGrupo: grupo });
console.log("  presentes:", aqui.map((n) => `${n.nome} (${n.motivo})`).join(" · "));
console.log("  longe:", longe.map((n) => `${n.nome} em ${n.onde}, ${n.dias}d`).join(" · "));
ok(aqui.some((n) => n.nome === "Iris"), "quem vive aqui está presente");
ok(aqui.some((n) => n.nome === "Vera-Aliada"), "quem viaja no grupo está sempre presente, mesmo com local antigo noutra cidade");
ok(aqui.some((n) => n.nome === "Corvo"), "sem paradeiro registrado, entra como presente (não trava a ficção)");
ok(longe.some((n) => n.nome === "Doran"), "quem ficou em outra cidade fica LONGE");
ok(!aqui.some((n) => n.nome === "Morto") && !longe.some((n) => n.nome === "Morto"), "morto não entra em lista nenhuma");

const cenaRuim = "Doran entra na taverna e desenrola um pergaminho, te oferecendo uma demanda da cidade.";
const pego = detectarForaDeLugar(cenaRuim, npcs, A, mapa, { comGrupo: grupo });
console.log("  cena:", cenaRuim);
ok(pego.length === 1 && pego[0].nome === "Doran", "o cão de guarda pega exatamente o caso que você relatou");
console.log("  correção:", notaForaDeLugar(pego, A).slice(0, 190) + "…");
ok(/NÃO está em/.test(notaForaDeLugar(pego, A)), "a correção diz que ele não está aqui");

ok(detectarForaDeLugar("Iris te chama de longe e entrega um frasco.", npcs, A, mapa, { comGrupo: grupo }).length === 0, "quem está presente pode agir à vontade");
ok(detectarForaDeLugar("Chega uma carta de Doran, com o selo da forja.", npcs, A, mapa, { comGrupo: grupo }).length === 0, "carta de quem está longe é legítima — não é corrigida");
ok(detectarForaDeLugar("Você se lembra de Doran, lá longe, martelando.", npcs, A, mapa, { comGrupo: grupo }).length === 0, "lembrança não é presença");
ok(detectarForaDeLugar("O ferreiro da cidade te cumprimenta.", npcs, A, mapa, { comGrupo: grupo }).length === 0, "menção sem nome não dispara nada");

console.log("\n[2) A ONISCIÊNCIA — o que você contou a UMA pessoa]");
let conf = [];
conf = registrarConfidencia(conf, { assunto: "que eu matei o irmão do barão", ouvintes: ["Iris"], dia: 12 });
conf = registrarConfidencia(conf, { assunto: "onde escondi o relicário", ouvintes: ["Corvo"], dia: 14 });
ok(conf.length === 2, "duas confidências registradas");
conf = registrarConfidencia(conf, { assunto: "que eu matei o irmão do barão", ouvintes: ["Corvo"] });
ok(conf.length === 2 && conf[0].ouvintes.length === 2, "contar de novo a outra pessoa só acrescenta o ouvinte");

const presentes = elencoDaCena(npcs, A, mapa, { comGrupo: grupo }).aqui;
const fofoca = "Vera-Aliada se aproxima e comenta, baixinho, onde escondi o relicário.";
const vaz = detectarVazamento(fofoca, conf, presentes);
console.log("  cena:", fofoca);
ok(vaz.length === 1 && vaz[0].quem === "Vera-Aliada", "pega quem falou de um assunto que não ouviu");
console.log("  correção:", notaVazamento(vaz).slice(0, 200) + "…");
ok(/Não há como essa pessoa saber/.test(notaVazamento(vaz)), "a correção é explícita");
ok(detectarVazamento("Corvo comenta onde escondi o relicário.", conf, presentes).length === 0, "quem OUVIU pode falar do assunto");
ok(detectarVazamento("O vento bate na janela.", conf, presentes).length === 0, "cena sem o assunto não dispara");

console.log("\n[o que o Mestre recebe]");
const txt = resumoCenaPrompt(npcs, A, mapa, { comGrupo: grupo, confidencias: conf });
console.log("  " + txt.split("\n").join("\n  ").slice(0, 800));
ok(/PRESENTES/.test(txt) && /LONGE/.test(txt), "o bloco separa presentes de ausentes");
ok(/ninguém mais pode mencionar/.test(txt), "e lista o que é segredo, com quem sabe");

console.log("\n[3) MASMORRAS E TESOUROS NO CHÃO]");
const mms = masmorrasDoMundo("mundo-cena|fantasia", mapa);
for (const m of mms.slice(0, 6)) console.log(`  ${m.icone} ${m.nome} — ${m.tipo}, nv ${m.nivel}, ${m.salas} salas, em ${m.regiao} perto de ${m.cidadeProxima}; ${m.rumor}`);
ok(mms.length >= mapa.regioes.length, `${mms.length} masmorras para ${mapa.regioes.length} regiões — pelo menos uma por região`);
ok(mms.every((m) => m.regiao && m.nivel >= 1 && m.x >= 0), "todas com região, nível e posição no mapa");
ok(mms[0].nivel <= mms[mms.length - 1].nivel, "ordenadas por nível — dá para escolher briga do seu tamanho");
ok(JSON.stringify(masmorrasDoMundo("mundo-cena|fantasia", mapa)) === JSON.stringify(mms), "estáveis: a masmorra continua no mesmo lugar amanhã");
ok(JSON.stringify(masmorrasDoMundo("outro|fantasia", mapa)) !== JSON.stringify(mms), "outro mundo, outras masmorras");

const ts = tesourosDoMundo("mundo-cena|fantasia", mapa);
for (const t of ts.slice(0, 4)) console.log(`  ${t.icone} perto de ${t.perto}: ${t.onde} — ${t.conteudo} (percepção, dif. ${t.dc})`);
ok(ts.length >= mapa.regioes.length, `${ts.length} tesouros enterrados no ermo`);
ok(ts.every((t) => t.onde && t.conteudo && t.dc >= 13), "cada um tem esconderijo, conteúdo e dificuldade");

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
