/* A RAID — o que o pedido pediu, item por item, mais o que só a
   simulação mostra.

   O pedido tinha nove afirmações verificáveis, e cada uma vira teste:
   10 a 30 conforme o porte · o chefe muito acima · horda junto · nível
   mínimo para participar · convoca fortes e disponíveis · nem todos são
   meus conhecidos · apresentam-se na preparação · todos entram no meu
   grupo até o fim · o narrador vê todos os golpes.

   E depois a parte que nenhum teste unitário pega: rodar cem raids
   inteiras e olhar se a coisa TERMINA, se termina de jeitos diferentes,
   e se algum papel é inútil ou dominante. */

const S = "../src/";
const R = await import(S + "raids.js");

let ok = 0; const falhas = [];
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; return; }
  falhas.push(nome);
  console.log("  ✗ " + nome + (extra ? ` — ${extra}` : ""));
};

const heroi = (nivel = 12, grupo = []) => ({ nome: "Íris", nivel, grupo });
const npcsDe = (n, relacao = "aliado") => Object.fromEntries(
  Array.from({ length: n }, (_, i) => [`Amigo ${i}`, { nome: `Amigo ${i}`, relacao, papel: "veterano" }]));

/* ---------------- O NÍVEL MÍNIMO ---------------- */
t("nível 9 não abre raid", R.podeAbrirRaid(heroi(9)).pode === false);
t("nível 10 abre", R.podeAbrirRaid(heroi(10)).pode === true);
t("e a recusa diz o que falta", /n[íi]vel 10/.test(R.podeAbrirRaid(heroi(4)).motivo), R.podeAbrirRaid(heroi(4)).motivo);
t("abrirRaid recusa abaixo do mínimo", R.abrirRaid({ pers: heroi(6) }).ok === false);

/* ---------------- 10 A 30, PELO PORTE ---------------- */
for (const p of R.PORTES) {
  t(`porte ${p.id} chama entre 10 e 30`, p.chama[0] >= 10 && p.chama[1] <= 30, p.chama.join("-"));
  t(`porte ${p.id} traz horda`, p.horda[0] > 0);
  t(`porte ${p.id} põe o chefe bem acima`, p.acima >= 6, String(p.acima));
}
t("os portes crescem em gente", R.PORTES[0].chama[1] < R.PORTES[1].chama[1] && R.PORTES[1].chama[1] < R.PORTES[2].chama[1]);
t("e crescem em chefe", R.PORTES[0].acima < R.PORTES[1].acima && R.PORTES[1].acima < R.PORTES[2].acima);
t("o porte acompanha o nível do herói", R.porteDoNivel(10).id === "regional" && R.porteDoNivel(16).id === "continental" && R.porteDoNivel(25).id === "cataclismo");

/* ---------------- A CONVOCAÇÃO ---------------- */
const ab = R.abrirRaid({ semente: "s1", pers: heroi(16, [{ nome: "Kael", conceito: "Batedor" }]), npcs: npcsDe(5), faccoes: [{ nome: "Corvo", relacao: "aliado" }], chefe: "o Segundo Sol" });
t("abre", ab.ok === true, ab.motivo);
const raid = ab.raid;
t("a hoste tem entre 10 e 30", raid.hoste.length >= 10 && raid.hoste.length <= 30, String(raid.hoste.length));
t("o chefe é muito acima do herói", raid.nivelChefe >= 16 + 10, `${raid.nivelChefe} contra 16`);
t("a horda existe", raid.horda >= 28, String(raid.horda));

/* NINGUÉM ABAIXO DO PISO. Um mundo que chama aprendiz para morrer num
   chamado continental está dizendo que o chamado não é sério. */
t("ninguém convocado abaixo do piso", raid.hoste.every((h) => h.nivel >= R.NIVEL_MINIMO_CONVOCADO),
  String(Math.min(...raid.hoste.map((h) => h.nivel))));
/* e ninguém tão acima que resolva a luta no lugar do herói */
t("ninguém convocado resolve a luta sozinho", raid.hoste.every((h) => h.nivel <= 16 + 2),
  String(Math.max(...raid.hoste.map((h) => h.nivel))));

/* O HERÓI NÃO SE CONVOCA. Esta casa já pôs a heroína no próprio elenco
   uma vez e envenenou três conselheiros. */
const comigoNoRegistro = R.abrirRaid({ semente: "s2", pers: heroi(16), npcs: { "Íris": { nome: "Íris", relacao: "aliado" } } }).raid;
t("o herói nunca é convocado", !comigoNoRegistro.hoste.some((h) => h.nome.toLowerCase() === "íris"));

/* NEM TODOS SÃO MEUS CONHECIDOS — pedido explícito. */
t("há gente que não é minha", raid.hoste.some((h) => h.origem === "estranho" || h.origem === "fama"));
t("e há gente que é", raid.hoste.some((h) => h.origem === "laco" || h.origem === "grupo"));
/* quem já andava comigo entra como do grupo */
t("o companheiro entra pelo grupo", raid.hoste.some((h) => h.nome === "Kael" && h.origem === "grupo"));
/* com registro vazio, a hoste inteira é de desconhecidos — e é o que o
   mundo faria: o retrato de um herói famoso e sozinho */
const semAmigos = R.abrirRaid({ semente: "s3", pers: heroi(16), npcs: {}, faccoes: [] }).raid;
t("sem amigos, o mundo ainda vem", semAmigos.hoste.length >= 10);
t("e vem inteiro de desconhecidos", semAmigos.hoste.every((h) => ["fama", "estranho"].includes(h.origem)));

/* nomes únicos: dois "Kael" na hoste quebrariam o livro-razão */
t("nenhum nome repetido", new Set(raid.hoste.map((h) => h.nome.toLowerCase())).size === raid.hoste.length);

/* DETERMINISMO POR SEMENTE — recarregar o save não troca os rostos */
const a1 = R.abrirRaid({ semente: "igual", pers: heroi(16), npcs: npcsDe(3) }).raid;
const a2 = R.abrirRaid({ semente: "igual", pers: heroi(16), npcs: npcsDe(3) }).raid;
t("a mesma semente chama a mesma gente", a1.hoste.map((h) => h.nome).join("|") === a2.hoste.map((h) => h.nome).join("|"));
const a3 = R.abrirRaid({ semente: "outra", pers: heroi(16), npcs: npcsDe(3) }).raid;
t("sementes diferentes chamam gente diferente", a1.hoste.map((h) => h.nome).join("|") !== a3.hoste.map((h) => h.nome).join("|"));

/* ---------------- O GRUPO TEMPORÁRIO ---------------- */
const comitiva = R.comitivaDaRaid(raid);
t("os convocados entram no grupo", comitiva.length > 0);
t("todos marcados como da raid", comitiva.every((c) => c.daRaid === true));
t("quem já era do grupo não entra duas vezes", !comitiva.some((c) => c.nome === "Kael"));
t("cada um leva ficha jogável", comitiva.every((c) => c.nome && c.nivel > 0 && c.vidaMax > 0));
const grupoDepois = R.tirarComitiva([{ nome: "Kael" }, ...comitiva]);
t("no fim, só os convocados saem", grupoDepois.length === 1 && grupoDepois[0].nome === "Kael");

/* ---------------- A RODADA ---------------- */
let r = R.garantirRaid({ ...raid, fase: "luta" });
const semente = (() => { let x = 7; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();
const prim = R.rodadaDaFrente(r, { rnd: semente });
t("a rodada anda", prim.raid.rodada === 1);
t("a horda diminui", prim.raid.horda < raid.horda, `${raid.horda} → ${prim.raid.horda}`);
t("o livro-razão traz nomes", prim.ledger.every((l) => !!l.quem));
t("e só nomes que estão na hoste", prim.ledger.every((l) => r.hoste.some((h) => h.nome === l.quem)));

/* A FRENTE NÃO FERE O CHEFE — a regra que protege o jogador. Se a hoste
   pudesse derrubá-lo, a raid seria um filme a que se assiste. */
t("a rodada nunca toca no chefe", prim.raid.nivelChefe === raid.nivelChefe);
t("e o livro-razão não fala do chefe", !prim.ledger.some((l) => /chefe/i.test(l.tipo)));

/* MORTE DE RAID É DEFINITIVA */
let comMorto = R.garantirRaid({ ...raid, fase: "luta" });
comMorto.hoste[0].morto = true;
const dep = R.rodadaDaFrente(comMorto, { rnd: semente }).raid;
t("morto não volta a ficar de pé", dep.hoste[0].morto === true && dep.hoste[0].caido === false || dep.hoste[0].morto === true);
t("morto não entra na força da frente",
  R.forcaDaFrente([{ nome: "x", papel: "linha", nivel: 10, morto: true }]) === 0);
t("caído também não", R.forcaDaFrente([{ nome: "x", papel: "linha", nivel: 10, caido: true }]) === 0);
t("de pé entra", R.forcaDaFrente([{ nome: "x", papel: "linha", nivel: 10 }]) > 0);

/* ---------------- CEM RAIDS INTEIRAS ----------------
   O que nenhum teste unitário pega: se a coisa TERMINA, se termina de
   mais de um jeito, e se algum papel é inútil ou dominante. */
let romperam = 0, sobreviveuAlguem = 0, mortosTotais = 0, rodadasTotais = 0, hordaZerada = 0;
const travou = [];
for (let i = 0; i < 100; i++) {
  const rn = (() => { let x = i * 7919 + 13; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();
  let raidI = R.garantirRaid({ ...R.abrirRaid({ semente: `sim${i}`, pers: heroi(18), npcs: npcsDe(4) }).raid, fase: "luta" });
  let voltas = 0;
  while (!raidI.rompeu && voltas++ < 40) raidI = R.rodadaDaFrente(raidI, { rnd: rn }).raid;
  if (voltas >= 40) travou.push(i);
  if (raidI.rompeu) romperam++;
  if (raidI.hoste.some((h) => !h.morto)) sobreviveuAlguem++;
  if (raidI.horda === 0) hordaZerada++;
  mortosTotais += raidI.mortos.length;
  rodadasTotais += raidI.rodada;
}
t("toda raid termina", travou.length === 0, `travaram: ${travou.join(",")}`);
t("e termina rompendo a frente", romperam === 100, String(romperam));
t("quase sempre sobra gente viva", sobreviveuAlguem >= 90, `${sobreviveuAlguem}/100`);
/* MORRE GENTE, e tem de morrer: uma raid sem baixa é uma masmorra
   grande com plateia, e o pedido dizia outra coisa */
t("morre gente em toda raid", mortosTotais > 100, `${(mortosTotais / 100).toFixed(1)} mortos por raid`);
t("mas não morre todo mundo", (mortosTotais / 100) < 20, `${(mortosTotais / 100).toFixed(1)} por raid`);
t("a raid dura o bastante para ser uma", (rodadasTotais / 100) >= 4, `${(rodadasTotais / 100).toFixed(1)} rodadas`);
/* A HORDA NÃO SE ESGOTA SOZINHA: se a hoste limpasse a horda em toda
   simulação, a frente venceria a raid e o herói viraria plateia. */
t("a hoste não limpa a horda sozinha", hordaZerada < 60, `${hordaZerada}/100 zeraram`);

/* NENHUM PAPEL É INÚTIL — cada um tem de puxar a força da frente para
   um lado diferente, senão são seis nomes para a mesma coisa. */
const forcas = R.PAPEIS.map((p) => R.forcaDaFrente([{ nome: "x", papel: p.id, nivel: 12 }]));
t("os papéis seguram quantidades diferentes", new Set(forcas.map((f) => f.toFixed(2))).size >= 4, forcas.map((f) => f.toFixed(2)).join(","));
t("o escudo é quem mais segura", R.papelPorId("escudo").segura === Math.max(...R.PAPEIS.map((p) => p.segura)));

/* O CURANDEIRO VALE O LUGAR DELE. Ele é o que menos segura — se não
   mudasse o resultado, seria peso morto na lista. */
const contaMortos = (comCura) => {
  let m = 0;
  for (let i = 0; i < 60; i++) {
    const rn = (() => { let x = i * 104729 + 5; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();
    const base = R.abrirRaid({ semente: `cura${i}`, pers: heroi(18), npcs: {} }).raid;
    let raidI = R.garantirRaid({
      ...base, fase: "luta",
      hoste: base.hoste.map((h, k) => ({ ...h, papel: comCura ? (k % 4 === 0 ? "curandeiro" : "linha") : "linha" })),
    });
    let v = 0;
    while (!raidI.rompeu && v++ < 40) raidI = R.rodadaDaFrente(raidI, { rnd: rn }).raid;
    m += raidI.mortos.length;
  }
  return m / 60;
};
const semCura = contaMortos(false), comCura = contaMortos(true);
t("com curandeiro morre menos gente", comCura < semCura, `${comCura.toFixed(1)} contra ${semCura.toFixed(1)}`);

/* ---------------- OS ENVELOPES ----------------
   Nomes e fatos, nunca número de sistema — é a régua desta casa. */
const envC = R.envelopeDaConvocacao(raid);
t("a convocação existe", envC.includes("RAID — CONVOCAÇÃO"));
t("e lista quem veio", raid.hoste.slice(0, 3).every((h) => envC.includes(h.nome)));
t("e manda encenar a apresentação", /se APRESENTA|apresenta/i.test(envC));
t("e proíbe começar a luta ali", /NÃO comece a batalha/i.test(envC));
t("e fecha a lista", /sem acrescentar e sem tirar/i.test(envC));

const envR = R.envelopeDaRodada(prim.raid, prim.ledger, { abatidos: prim.abatidos });
t("a rodada tem envelope", envR.includes("RAID — RODADA"));
t("manda narrar os golpes", /NARRE OS GOLPES/.test(envR));
t("proíbe a hoste ferir o chefe", /NÃO faça a hoste ferir o chefe/i.test(envR));
t("proíbe matar quem não caiu", /NÃO mate nem levante ninguém que não esteja nesta lista/i.test(envR));
t("o envelope não leva PV nem dado", !/\bPV\b|d20|dificuldade \d/.test(envR), envR.slice(0, 200));
/* e ele nomeia os caídos, que é o que faz trinta pessoas caberem em
   três frases sem virar um número que desce */
if (prim.ledger.length) t("o envelope nomeia quem caiu", prim.ledger.every((l) => envR.includes(l.quem)));

t("o rompimento tem envelope", R.envelopeDoRompimento(raid).includes("A FRENTE ROMPEU"));
t("e passa a vez ao herói", /daqui em diante é comigo/i.test(R.envelopeDoRompimento(raid)));

/* ---------------- O FIM ---------------- */
const venceu = R.fimDaRaid(raid, { venceu: true });
const perdeu = R.fimDaRaid(raid, { venceu: false });
t("vencer paga mais", venceu.lendarios > perdeu.lendarios && venceu.xp > perdeu.xp);
/* A FAMA NÃO É UM NÚMERO NOVO: este jogo a DERIVA do que se fez, e um
   campo de fama aqui seria uma segunda fonte para o mesmo valor. */
t("o fim não inventa um número de fama", venceu.fama === undefined);
t("o fim encerra", venceu.raid.fase === "encerrada");
t("e diz quem sobreviveu", Array.isArray(venceu.sobreviveram));
/* o porte maior paga mais: uma raid do fim do mundo não pode render o
   mesmo que um chamado de região */
const grande = R.fimDaRaid({ ...raid, porte: "cataclismo" }, { venceu: true });
t("o porte maior conta mais", grande.lendarios > venceu.lendarios, `${grande.lendarios} vs ${venceu.lendarios}`);
t("perder não conta lendário nenhum", perdeu.lendarios === 0);

/* ---------------- A CATRACA ----------------
   Todo campo que uma rodada lê é normalizado por garantirRaid, e nada
   nasce de `||` no meio do resolvedor. */
const vazia = R.garantirRaid(null);
t("garantirRaid aguenta null", !!vazia && Array.isArray(vazia.hoste) && vazia.hoste.length === 0);
t("e a rodada numa raid vazia não explode", !!R.rodadaDaFrente(vazia).raid);
t("raid fora de luta não anda", R.rodadaDaFrente(R.garantirRaid({ fase: "convocando" })).raid.rodada === 0);
const sujo = R.garantirRaid({ hoste: [{ nome: "X", papel: "inexistente", origem: "inexistente", nivel: -5 }], horda: -3, rodada: "x" });
t("papel inválido cai num válido", R.PAPEIS.some((p) => p.id === sujo.hoste[0].papel));
t("origem inválida cai numa válida", R.ORIGENS.some((o) => o.id === sujo.hoste[0].origem));
t("números sujos viram números", sujo.horda === 0 && sujo.rodada === 0 && sujo.hoste[0].nivel >= 1);

/* todo papel e toda origem completos, senão a interface ou o envelope
   quebram naquele que ninguém testou */
for (const p of R.PAPEIS) t(`papel ${p.id} completo`, !!(p.id && p.rotulo && p.faz && p.segura > 0 && p.abre >= 0 && p.peso > 0));
for (const o of R.ORIGENS) t(`origem ${o.id} completa`, !!(o.id && o.rotulo && o.porque && o.prio > 0));
for (const p of R.PORTES) t(`porte ${p.id} completo`, !!(p.id && p.nome && p.icone && p.alcance && p.o && p.rodadas > 0));

/* ---------------- O QUE SOBE COMO REGRA FIXA ---------------- */
t("o prompt existe", R.RAID_PROMPT.includes("RAID"));
t("o prompt fecha a lista", /LISTA DE QUEM VEIO É FECHADA/i.test(R.RAID_PROMPT));
t("o prompt diz quem derruba a coisa", /A HOSTE SEGURA, O HERÓI DERRUBA/i.test(R.RAID_PROMPT));
t("o prompt torna a morte definitiva", /morte de raid é definitiva/i.test(R.RAID_PROMPT));
t("o prompt cabe no orçamento", R.RAID_PROMPT.length < 900, String(R.RAID_PROMPT.length));

console.log(`\n${ok} passaram` + (falhas.length ? ` · ${falhas.length} FALHARAM` : " · sem falhas"));
process.exit(falhas.length ? 1 : 0);
