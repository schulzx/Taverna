import {
  PREPARAM, INATOS, preparaMagia, ehInato, temCaderno, ehPreparavel, preparaveisDe,
  limitePreparadas, garantirPreparadas, estaPreparada, preparadasIniciais,
  alternarPreparada, ehRitual, podeLancar, MINUTOS_RITUAL, resumoMagiasPrompt,
} from "../src/magias.js";
import { migrarPersonagem } from "../src/regras-jogo.js";
import { CLASSES } from "../src/classes.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

/* magias reais do catálogo, para os testes não medirem invenção minha */
const habsDe = (classe, n) => (CLASSES.find((c) => c.nome === classe) || { habilidades: [] })
  .habilidades.slice(0, n).map((h) => ({ nome: h.nome, custo: h.custo, descricao: h.descricao }));

const mago = { classe: "Mago", nivel: 8, atributos: { intelecto: 4 }, habilidades: habsDe("Mago", 99) };
const guerreiro = { classe: "Guerreiro", nivel: 8, atributos: { forca: 4 }, habilidades: habsDe("Guerreiro", 8) };
const feiticeiro = { classe: "Feiticeiro", nivel: 8, atributos: { presenca: 4 }, habilidades: habsDe("Feiticeiro", 8) };

console.log("\n[1. DUAS FAMÍLIAS DE CONJURADOR]");
ok(PREPARAM.length === 4 && INATOS.length === 3, "quatro que estudam, três que nascem com o dom");
ok(preparaMagia("Mago") && !preparaMagia("Feiticeiro"), "o mago prepara, o feiticeiro não");
ok(ehInato("Bruxo") && !ehInato("Clérigo"), "o bruxo é inato, o clérigo estuda");
ok(temCaderno(mago) && !temCaderno(feiticeiro) && !temCaderno(guerreiro), "só quem estuda tem caderno");
ok(temCaderno({ classe: "Guerreiro", classesExtras: ["Mago"] }), "multiclasse com uma classe que estuda tem caderno");

console.log("\n[2. O QUE ENTRA NO CADERNO]");
const prepMago = preparaveisDe(mago);
console.log("  magias do mago: " + prepMago.map((h) => h.nome).join(", "));
ok(prepMago.length > 0, "o mago tem magias de caderno");
ok(preparaveisDe(guerreiro).length === 0, "o guerreiro NÃO tem nenhuma — preparar um soco seria burocracia sem decisão");
ok(preparaveisDe(feiticeiro).length === 0, "o feiticeiro também não: ele sabe o que sabe, sempre");
ok(!ehPreparavel({ nome: "Poder Inventado", descricao: "algo único" }, mago), "habilidade sem classe de origem (única, dádiva) não prepara — é do herói, não do caderno");
ok(!ehPreparavel(null, mago) && !ehPreparavel({}, mago), "entrada inválida não quebra");

console.log("\n[3. QUANTAS CABEM]");
console.log("  " + [1, 4, 8, 12, 20].map((n) => `nv${n}: ${limitePreparadas({ ...mago, nivel: n })}`).join("  "));
ok(limitePreparadas(guerreiro) === 0, "quem não tem caderno não prepara nada");
ok(limitePreparadas({ ...mago, nivel: 1, atributos: {} }) >= 1, "no nível 1 sem atributo ainda cabe uma — nunca zero");
ok(limitePreparadas({ ...mago, nivel: 20 }) > limitePreparadas({ ...mago, nivel: 4 }), "cresce com o nível");
ok(limitePreparadas({ ...mago, atributos: { intelecto: 8 } }) > limitePreparadas(mago), "e com o atributo-chave");
/* a calibragem: preparar tem que ficar em torno de METADE do que se sabe,
   senao vira formulario em vez de escolha */
{
  const todasDoMago = habsDe("Mago", 99);
  const veterano = { ...mago, nivel: 20, atributos: { intelecto: 8 }, habilidades: todasDoMago };
  const sabe = preparaveisDe(veterano).length;
  const leva = limitePreparadas(veterano);
  console.log(`  nivel 20, INT 8: sabe ${sabe} magias, leva ${leva}`);
  ok(leva < sabe, "o veterano NAO leva tudo o que sabe — se levasse, preparar seria formulario");
  ok(leva <= Math.ceil(sabe * 0.75), `e leva no maximo tres quartos (${leva}/${sabe})`);
}

console.log("\n[4. PREPARAR E GUARDAR]");
let p = { ...mago, preparadas: [] };
const nome1 = prepMago[0].nome, nome2 = prepMago[1].nome;
let r = alternarPreparada(p, nome1);
ok(r.ok && r.acao === "preparou" && r.preparadas.includes(nome1), `preparou ${nome1}`);
p = { ...p, preparadas: r.preparadas };
r = alternarPreparada(p, nome1);
ok(r.ok && r.acao === "guardou" && !r.preparadas.includes(nome1), "e clicar de novo guarda");
ok(!alternarPreparada(p, "Não Existe").ok, "nome que não está na ficha é recusado");
ok(!alternarPreparada(guerreiro, (guerreiro.habilidades[0] || {}).nome).ok, "golpe físico não se prepara");
/* estourar o teto: enche até o limite e tenta mais uma */
{
  const novato = { ...mago, nivel: 1, atributos: {}, preparadas: [] };
  const teto = limitePreparadas(novato);
  let atual = { ...novato };
  for (const h of prepMago.slice(0, teto)) {
    const passo = alternarPreparada(atual, h.nome);
    atual = { ...atual, preparadas: passo.preparadas };
  }
  ok(atual.preparadas.length === teto, `encheu o caderno do novato (${teto} magias)`);
  const excedente = alternarPreparada(atual, prepMago[teto].nome);
  ok(!excedente.ok && /guarde uma antes/.test(excedente.motivo), `e a próxima é recusada com o motivo: "${excedente.motivo}"`);
  ok(alternarPreparada(atual, atual.preparadas[0]).ok, "mas guardar uma das que estão lá continua livre");
}

console.log("\n[5. HIGIENE DO CADERNO]");
ok(garantirPreparadas({ ...mago, preparadas: ["Magia Fantasma"] }).length === 0, "magia que saiu da ficha some do caderno");
ok(garantirPreparadas({ ...mago, preparadas: [nome1, nome1] }).length === 1, "duplicata some");
ok(garantirPreparadas({ ...mago, preparadas: prepMago.map((h) => h.nome) }).length <= limitePreparadas(mago), "e o caderno nunca passa do teto, nem com save adulterado");
ok(garantirPreparadas(guerreiro).length === 0, "quem não prepara tem caderno vazio");

console.log("\n[6. LANÇAR]");
const comPrep = { ...mago, preparadas: [nome1] };
ok(podeLancar(comPrep, prepMago[0], { emCombate: true }).ok, "magia preparada sai em combate");
const guardadaHab = prepMago.find((h) => h.nome !== nome1 && !ehRitual(h)) || prepMago[1];
const barrada = podeLancar(comPrep, guardadaHab, { emCombate: true });
ok(!barrada.ok && /não está preparada/.test(barrada.motivo), `magia guardada é barrada: "${barrada.motivo.slice(0, 60)}…"`);
ok(podeLancar(comPrep, guerreiro.habilidades[0], { emCombate: true }).ok, "golpe físico sempre sai — não passa pelo caderno");
ok(podeLancar(feiticeiro, feiticeiro.habilidades[0], { emCombate: true }).ok, "e o inato lança tudo o que sabe");

console.log("\n[7. RITUAL — a válvula de escape]");
ok(ehRitual({ nome: "Detectar Magia", custo: 2 }), "utilitária barata é ritual");
ok(!ehRitual({ nome: "Bola de Fogo", custo: 8 }), "magia de arrasar NÃO vira ritual — ritualizar dano seria dar de graça o que preparar existe para racionar");
ok(ehRitual({ nome: "Qualquer Coisa", ritual: true }), "a marca explícita manda");
/* ritual DE VERDADE do catálogo — usar um nome inventado testaria a minha
   imaginação, não o sistema: sem classe de origem, nada entra no caderno */
const rit = prepMago.find((h) => ehRitual(h)) || { nome: "Invisibilidade", custo: 5, descricao: "" };
const foraDeCombate = podeLancar({ ...mago, preparadas: [] }, rit, { emCombate: false });
ok(foraDeCombate.ok && foraDeCombate.ritual && foraDeCombate.minutos === MINUTOS_RITUAL, `fora de combate, ritual passa pagando ${MINUTOS_RITUAL} minutos`);
ok(!podeLancar({ ...mago, preparadas: [] }, rit, { emCombate: true }).ok, "mas NÃO no meio da luta — ritual custa tempo, e tempo é o que não há");

console.log("\n[8. MIGRAÇÃO — ninguém acorda sem magia]");
const antigo = migrarPersonagem({ nome: "Vera", classe: "Mago", nivel: 12, atributos: { intelecto: 5 }, habilidades: habsDe("Mago", 10) });
console.log("  preparadas na migração: " + antigo.preparadas.join(", "));
ok(antigo.preparadas.length > 0, "save antigo acorda com o caderno CHEIO — descobrir a regra no meio de uma luta seria punição retroativa");
ok(antigo.preparadas.length === Math.min(limitePreparadas(antigo), preparaveisDe(antigo).length),
   `cheio até onde dava: ${antigo.preparadas.length} (teto ${limitePreparadas(antigo)}, sabe ${preparaveisDe(antigo).length})`);
ok(antigo.magiasVersao === 1, "marca a versão");
const remig = migrarPersonagem({ ...antigo, preparadas: [] });
ok(remig.preparadas.length === 0, "migrar de novo NÃO re-preenche — a escolha do jogador manda");
const mig2 = migrarPersonagem({ nome: "Tor", classe: "Guerreiro", nivel: 10, habilidades: habsDe("Guerreiro", 6) });
ok(mig2.preparadas.length === 0, "e o guerreiro segue sem caderno");

console.log("\n[9. O QUE O MESTRE RECEBE]");
ok(resumoMagiasPrompt(guerreiro) === "", "sem caderno, nada no prompt");
const rp = resumoMagiasPrompt({ ...mago, preparadas: [nome1] });
console.log("  " + rp.slice(0, 150));
ok(/PREPARADAS/.test(rp) && /GUARDADAS/.test(rp), "diz o que está na cabeça e o que ficou guardado");
ok(/não narre o efeito dela nem ofereça um substituto/.test(rp), "e proíbe o Mestre de dar de brinde o que o sistema barrou");
ok(rp.length < 700, `enxuto: ${rp.length} caracteres`);

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
