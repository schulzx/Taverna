import { aflicaoDe, rolarAflicao, golpesDeCriatura, golpeDaVez, PORTADORES, GOLPES_POR_ELEMENTO, GOLPES_DE_LONGE } from "../src/aflicoes.js";
import { CONDICOES } from "../src/condicoes.js";
import { perfilDeCriatura } from "../src/danos.js";
import { CRIATURAS_FANTASIA, ARQUETIPOS } from "../src/bestiario.js";
import { CLASSES } from "../src/classes.js";
import { SUBCLASSES } from "../src/subclasses.js";
import { ESPECIALIZACOES } from "../src/especializacoes.js";
import { MAGIAS } from "../src/grimorio.js";
import { ARMAS } from "../src/itens.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };

console.log("\n[armas e itens] o que cada uma carrega:");
for (const [fonte, esperado] of [
  ["Adaga Envenenada", "envenenado"],
  ["Espada Flamejante fisico", "queimando"],
  ["Maça de Guerra", "atordoado"],
  ["Machado Serrilhado", "sangrando"],
  ["Lâmina Gélida gelo", "lento"],
  ["Rede de Caçador", "agarrado"],
  ["Espada Longa", null],
  ["Adaga Comum", null],
  ["Cajado do Basilisco", "paralisado"],
]) {
  const a = aflicaoDe(fonte);
  ok((a ? a.cond : null) === esperado, `"${fonte}" → ${a ? a.cond : "nada"} (esperado ${esperado || "nada"})`);
}

console.log("\n[habilidades] do catálogo de classes:");
for (const [nome, desc, esperado] of [
  ["Toque Gélido", "Dano e reduz a velocidade do alvo.", "lento"],
  ["Rajada de Fogo", "Dano em área a inimigos próximos.", "queimando"],
  ["Investida", "Avança e ataca, derrubando o alvo se acertar.", "caido"],
  ["Grito de Guerra", "Aliados ganham vantagem no próximo ataque.", "inspirado"],
  ["Postura Defensiva", "Reduz o dano recebido no próximo turno.", "protegido"],
  ["Lentidão", "O alvo perde uma ação por 2 turnos.", "lento"],
  ["Ataque Furtivo", "Dano extra ao atacar de surpresa.", "furtivo"],
  ["Projétil Arcano", "Dardo de energia que raramente erra.", null],
]) {
  const a = aflicaoDe(`${nome} ${desc}`);
  ok((a ? a.cond : null) === esperado, `"${nome}" → ${a ? a.cond : "nada"} (esperado ${esperado || "nada"})`);
}

console.log("\n[criaturas] golpes do catálogo + aflição embutida:");
for (const c of CRIATURAS_FANTASIA.slice(0, 8)) {
  const p = perfilDeCriatura(c.nome, c.desc);
  const golpes = golpesDeCriatura(c.nome, p.ataque, c.ameaca);
  const afl = golpes.map((g) => { const a = aflicaoDe(g); return a ? a.cond : "—"; });
  console.log(`  ${c.nome.padEnd(16)} [${p.ataque}] ${golpes.join(" / ")}  →  ${afl.join(" / ")}`);
}
const g1 = golpesDeCriatura("Aranha Gigante", "veneno", "comum");
const g2 = golpesDeCriatura("Aranha Gigante", "veneno", "comum");
ok(JSON.stringify(g1) === JSON.stringify(g2), "o mesmo bicho usa sempre o mesmo repertório (determinístico)");

console.log("\n[o dado que decide] adaga envenenada contra um alvo:");
const alvo = { nome: "Goblin", nivel: 2, condicoes: [], atributos: {} };
let aplicou = 0, resistiu = 0, nemTentou = 0;
for (let i = 0; i < 400; i++) {
  const r = rolarAflicao({ fonte: "Adaga Envenenada", nomeFonte: "Adaga Envenenada", atacante: "Vera", alvo, alvoNome: "Goblin" });
  if (!r) nemTentou++; else if (r.aplicou) aplicou++; else resistiu++;
}
console.log(`  em 400 golpes: ${nemTentou} sem tentativa, ${resistiu} resistidos, ${aplicou} envenenados`);
ok(nemTentou > 120 && nemTentou < 240, "nem todo golpe tenta afligir (~45% não tentam)");
ok(aplicou > 30 && resistiu > 30, "quando tenta, às vezes passa e às vezes o alvo resiste");

const forte = { nome: "Golem", nivel: 12, condicoes: [], atributos: { vigor: 5 } };
let passouNoForte = 0;
for (let i = 0; i < 300; i++) { const r = rolarAflicao({ fonte: "Adaga Envenenada", atacante: "Vera", alvo: forte, sempre: true }); if (r && r.aplicou) passouNoForte++; }
console.log(`  contra um golem nível 12 (vigor 5): ${passouNoForte}/300 passaram`);
ok(passouNoForte < 90, "alvo resistente raramente é envenenado");

const jaEnvenenado = { nome: "Goblin", nivel: 2, condicoes: [{ id: "envenenado", nome: "Envenenado" }], atributos: {} };
ok(rolarAflicao({ fonte: "Adaga Envenenada", atacante: "Vera", alvo: jaEnvenenado, sempre: true }) === null, "não empilha a mesma condição");

console.log("\n[buffs] não têm resistência:");
const buff = rolarAflicao({ fonte: "Grito de Guerra Aliados ganham vantagem", nomeFonte: "Grito de Guerra", atacante: "Vera", sempre: true });
ok(buff && buff.aplicou && buff.escopo === "aliados" && buff.cond.id === "inspirado", `Grito de Guerra → ${buff && buff.cond.nome} em ${buff && buff.escopo}`);
const furia = rolarAflicao({ fonte: "Fúria Ancestral", nomeFonte: "Fúria", atacante: "Doran", sempre: true });
ok(furia && furia.escopo === "proprio" && furia.cond.id === "enfurecido", `Fúria → ${furia && furia.cond.nome} em quem usou`);

/* ============================================================
   T1 · A FRONTEIRA DO GRUPO — o que os portadores deixam chegar lá

   POR QUE ESTA SEÇÃO MORA AQUI e não em `teste-cond.mjs`: o que ela mede
   é a tabela `PORTADORES`, e território é de quem edita. No dia em que
   alguém acrescentar um portador novo, é ESTE arquivo que ele abre — e é
   esta suíte que tem de acender. (O relógio em si — o prazo que vence, e
   vence também para a condição boa — está em `teste-cond.mjs`, que é o
   dono de `tickCondicoes`.)

   O QUE T1 DECIDIU, E ESTA SEÇÃO GUARDA: o relógio do grupo decrementa e
   expira, mas NÃO cobra `danoTurno`. Essa decisão só é segura enquanto
   nenhuma condição que dói por turno conseguir chegar ao companheiro — e
   hoje nenhuma chega, por ESTRUTURA, não por sorte: as três que doem
   (Envenenado, Sangrando, Queimando) têm portador único e sempre
   `alvo: "alvo"`, que escreve no herói ou no inimigo, nunca no grupo.

   É FRONTEIRA, não curiosidade de tabela. No dia em que T3/T4 ou um
   portador novo mudar isso, a suíte acende aqui — em vez de o companheiro
   começar a morrer de veneno em silêncio, sem uma linha na tela, porque o
   sítio do App que roda o relógio dele não tem onde cobrar o dano. */
console.log("\n[T1 · a fronteira do grupo] o que os portadores deixam chegar ao companheiro:");
const doGrupo = PORTADORES.filter((p) => p.alvo !== "alvo");
for (const p of doGrupo) {
  const c = CONDICOES[p.cond];
  console.log(`  ${p.id.padEnd(12)} alvo:${String(p.alvo).padEnd(9)} → ${c ? `${c.rotulo} (${c.tipo}${c.danoTurno ? `, ${c.danoTurno} PV/turno` : ""})` : "?? fora do catálogo"}`);
}
/* 7 → 8 EM 16/09/2026 (v9.278 · F2), E O MOTIVO FICA AQUI, como a lei manda
   para toda asserção movida. O portador que entrou é `amparo` — a linha que
   parte `guarda` ao meio para que "protege um ALIADO" deixe de abrigar quem
   conjurou. Ele é o SEGUNDO com `alvo: "aliados"` (o primeiro par é `bencao`
   e `inspiracao`), e a fronteira que esta seção guarda continua intacta: ele
   abre `protegido`, que é `tipo: "bom"` e não tem `danoTurno` — as duas
   asserções logo abaixo cobram-no sem uma linha nova, porque leem o catálogo
   em vez de uma lista à mão. É exatamente o caso para o qual elas foram
   escritas: um portador novo de grupo nasceu, e o relógio do companheiro
   continua sem ter o que cobrar. */
ok(doGrupo.length === 8, `oito portadores escrevem fora do alvo — em quem usou ou nos aliados (${doGrupo.length})`);
ok(doGrupo.every((p) => CONDICOES[p.cond]), "e todos apontam para condição que existe no catálogo");
/* LIDO DE VOLTA DO CATÁLOGO, não copiado numa lista à mão aqui: se amanhã
   um portador de grupo apontar para uma condição RUIM, isso é mudança de
   jogo — o sistema passa a poder afligir o companheiro pela mão de quem o
   ajuda — e tem de acender, não passar como detalhe de tabela. */
ok(doGrupo.every((p) => CONDICOES[p.cond].tipo === "bom"),
  `as ${doGrupo.length} que chegam ao grupo são todas boas: ${doGrupo.map((p) => CONDICOES[p.cond].rotulo).join(", ")}`);
ok(doGrupo.every((p) => !CONDICOES[p.cond].danoTurno),
  "NENHUMA delas dói por turno — é esta a fronteira que deixa o relógio do grupo (T1) não cobrar dano");

/* A MESMA FRONTEIRA PELO OUTRO LADO. A de cima pergunta "o que sai do
   grupo?"; esta pergunta "quem dói sabe escrever fora do alvo?". As duas
   juntas fecham o cerco: um portador novo entra por uma ou por outra. */
const doem = Object.values(CONDICOES).filter((c) => c.danoTurno);
ok(doem.length === 3, `três condições doem por turno: ${doem.map((c) => `${c.rotulo} (${c.danoTurno})`).join(", ")}`);
for (const c of doem) {
  const port = PORTADORES.filter((p) => p.cond === c.id);
  ok(port.length === 1 && port[0].alvo === "alvo",
    `${c.rotulo}: portador único (${port.map((p) => p.id).join(", ") || "nenhum"}) e sempre em "alvo"`);
}

/* ============================================================
   A FRONTEIRA DE PALAVRA (Fase MM, as paredes · 29/09)

   "Sussurro assombrado", o golpe do Necromante, inspirava o bando de quem
   o lançava: "assombrado" contém "brado". A família inteira foi varrida
   contra o acervo (716 textos) e 36 mudaram de portador — estão aqui, uma
   a uma, com o portador que ficou. Se uma delas voltar a mudar, a linha
   acende: é a tabela a andar, e isso decide-se com o motivo à vista.
   ============================================================ */
console.log("\n[a fronteira de palavra] nenhum portador casa pedaço de palavra:");
{
  const acervo = [];
  const junta = (h) => `${(h && h.nome) || ""} ${(h && h.descricao) || ""}`;
  for (const c of CLASSES) for (const h of c.habilidades) acervo.push({ nome: h.nome, txt: junta(h) });
  for (const hs of Object.values(SUBCLASSES)) for (const h of hs) acervo.push({ nome: h.nome, txt: junta(h) });
  for (const hs of Object.values(ESPECIALIZACOES)) for (const h of hs) acervo.push({ nome: h.nome, txt: junta(h) });
  for (const m of MAGIAS) acervo.push({ nome: m.nome, txt: junta(m) });
  for (const g of [...Object.values(GOLPES_POR_ELEMENTO).flat(), ...Object.values(GOLPES_DE_LONGE).flat()]) acervo.push({ nome: g, txt: g });
  for (const b of [...CRIATURAS_FANTASIA, ...ARQUETIPOS]) acervo.push({ nome: b.nome, txt: `${b.nome || ""} ${b.desc || ""}` });
  for (const a of ARMAS) acervo.push({ nome: a.nome, txt: a.nome });
  ok(acervo.length >= 700, `o acervo varrido tem ${acervo.length} textos (habilidades, grimório, golpes, bestiário, armas)`);

  /* 1. a regra, sobre o acervo inteiro: onde um portador casa, o que vem
     antes do casamento não é letra */
  const LETRA = /\p{L}/u;
  const noMeio = [];
  for (const { nome, txt } of acervo) for (const p of PORTADORES) {
    const m = txt.match(p.re);
    if (m && m.index > 0 && LETRA.test(txt[m.index - 1])) noMeio.push(`${nome} (${p.id}: "${m[0]}")`);
  }
  ok(noMeio.length === 0, `nenhum portador casa no meio de uma palavra do acervo${noMeio.length ? " — " + noMeio.join(", ") : ""}`);

  /* 2. as 36 que mudaram, cada uma com o portador certo (null = nenhum) */
  const MUDARAM = [
    ["Sussurro assombrado", "terror"],        // era inspiracao ("assombr-ADO" ⊃ "brado")
    ["Clava de Ossos", "concussao"],          // era fogo ("c-LAVA")
    ["Emaranhar", "prisao"],                  // era veneno ("em-ARANHA-r")
    ["Bomba de Fumaça", "cegueira"],          // era concussao ("fu-MAÇA")
    ["Fumaça Cegante", "cegueira"],           // idem
    ["Investida da Alcateia", "derrubada"],   // era prisao ("alca-TEIA")
    ["Chamado do Trovão", "concussao"],       // era fogo ("CHAMA-do")
    ["Raízes Agarradoras", "prisao"],         // era sangria ("a-GARRA-doras")
    ["Tentáculo Insone", "prisao"],           // idem ("a-GARRA")
    ["Raízes que Prendem", "prisao"],         // idem
    ["Cobrança de Alma", "vigor"],            // era veneno ("COBRA-nça"); "fortalece você"
    ["Chamado da Chuva", null], ["Chamar de Volta", null], ["Chamado Selvagem", null],
    ["Chamado da Alcateia", null], ["Chamado do Bando", null], ["Chamar o Grande", null],
    ["Coração Tempestuoso", null], ["Coração da Tormenta", null], ["Coração do Mundo", null], // "c-ORAÇÃO"
    ["Cobrança", null], ["Cobrança Final", null], ["Cobrança em Dobro", null],
    ["Disparo Calibrado", null], ["Tiro Calibrado", null], ["Forma Conjunta", null], ["Sangue de Dragão", null], // "-BRADO-"
    ["Ovação", null], ["Cerco de Presas", null], // "pla-TEIA", "alca-TEIA"
    ["O Bosque Acorda", null], ["Clone", null],  // "a-CORDA"
    ["Descarga Celeste", null], ["Sobrecarga", null], // "des-CARGA"
    ["Atalho de Orvalho", null],              // "a-TALHO"
    ["Passo Aracnídeo", null],                // "pa-REDE-s"
    ["Adivinhação", null],                    // "adi-VINHA-ção"
  ];
  ok(MUDARAM.length === 36, `as ${MUDARAM.length} mudanças da varredura estão nomeadas`);
  for (const [nome, esperado] of MUDARAM) {
    const item = acervo.find((a) => a.nome === nome);
    const p = item ? aflicaoDe(item.txt) : undefined;
    ok(item && (p ? p.id : null) === esperado, `"${nome}" → ${p ? p.id : "nada"} (esperado ${esperado || "nada"})`);
  }

  /* 3. a palavra certa com o pedaço no meio continua a casar, pelo nome */
  for (const [txt, esperado] of [
    ["Adaga envenenada", "veneno"], ["os inimigos ficam apavorados", "terror"], ["o grupo fica apressado", "pressa"],
    ["uma névoa que intoxica", "veneno"], ["um grito que aterroriza", "terror"], ["calor abrasador", "fogo"],
    ["mordida de sanguessuga", "drenagem"], ["Garras afiadas", "sangria"], ["Chuva de chamas", "fogo"],
    ["Maça-estrela", "concussao"], ["O alvo enfraquece", "drenagem"],
  ]) {
    const p = aflicaoDe(txt);
    ok((p ? p.id : null) === esperado, `"${txt}" → ${p ? p.id : "nada"} (esperado ${esperado})`);
  }
  /* 4. e a palavra que só CONTÉM o pedaço não casa */
  for (const txt of ["Palavra de Poder", "Vampiro", "Plácido", "Parede de Pedra", "Comedor de Almas", "Adrenalina",
    "Afogar", "Garrafada", "Expressão", "Consolar", "Redenção", "Maçaneta", "Domingo", "Executa alvo enfraquecido"]) {
    const p = aflicaoDe(txt);
    ok(!p, `"${txt}" não carrega nada (${p ? p.id : "nada"})`);
  }
  /* 5. nenhum golpe de criatura dá efeito ao bando de quem o lança — a não
     ser "Golpe consagrado" (bênção), que casa a palavra inteira e é outra
     conversa: a de um nome de golpe que promete bênção. Fica nomeado. */
  const doBando = Object.values(GOLPES_POR_ELEMENTO).flat().filter((g) => { const p = aflicaoDe(g); return p && p.alvo !== "alvo"; });
  ok(doBando.length === 1 && doBando[0] === "Golpe consagrado", `só um golpe de criatura escreve fora do alvo: ${doBando.join(", ") || "nenhum"}`);
}

console.log("\n[texto que o Mestre recebe]:");
const r = rolarAflicao({ fonte: "Mordida peçonhenta Aranha", nomeFonte: "Mordida peçonhenta (Aranha Gigante)", atacante: "Aranha Gigante", alvo: { nome: "Vera", nivel: 5, condicoes: [], atributos: { vigor: 2 } }, alvoNome: "você", sempre: true });
console.log("  " + (r ? r.texto : "-"));
console.log("  " + (r ? r.nota : "-"));

console.log(falhas ? `\n${falhas} FALHA(S)` : "\nTudo passou");
process.exit(falhas ? 1 : 0);
