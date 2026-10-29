/* ============================================================
   O GOLPE NO CORPO, NO MOTOR (Fase T, trilha B, 28/10/2026) — testes/teste-motor-golpe-no-corpo.mjs

   O abrigo (`passarPeloAbrigo`), a concentração do companheiro
   (`segurarOuPerder`), a quebra na mesa do herói e a fila do golpe no
   herói (amortecer → repartir → abrigo) moravam no App sem peça, e só se
   provavam lendo o texto dele (~25 asserções de teste-efeitos e
   teste-amortece). Ganharam peça em src/motor/golpe-no-corpo.js.

   Aqui a peça é provada contra o recorte à letra do App de antes
   (`golpe-dourado.json`, de `gerar-golpe-dourado.mjs`), compilado com as
   dependências reais e corrido lado a lado sobre os 275 casos de
   `golpe-casos.mjs` — a mesma sorte dos dois lados, por semente. E a prova
   tem de morder: o abrigo que não absorve, o dono sem nome, o teste que
   aguenta ao contrário, a 🎲 para quem não pediu, a nota que não empilha,
   a resistência que esquece o tipo, a fila na ordem trocada — as fotos
   TÊM de divergir.

   Depois, as regras que as asserções de texto guardavam, ditas como
   chamada: a porta que devolve o que entrou, o molde do dono lido da
   tabela, a nota só na queda, a ordem da fila.
   ============================================================ */
import { N_CASOS, DOURADO, casosDoGolpe, compilarORecorte, fotoDoGolpe, sorteDoCaso } from "./golpe-casos.mjs";
import { oAbrigoDoGolpe, aConcentracaoDoGolpe, aQuebraDoHeroi, aFilaDoGolpeNoHeroi, MOLDE_DO_DONO, ENVELOPES_DO_GOLPE } from "../src/motor/golpe-no-corpo.js";
import { dadoDo } from "../src/semente.js";
import { RESISTENCIA_DA_CONCENTRACAO } from "../src/combate.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const casos = casosDoGolpe();
const REGRAS = ["abrigo", "concentracao", "quebra", "fila"];
/* a peça, com a mesma régua do recorte: o que devolveu e quem calou */
const PECA = {
  abrigo: (k) => { const c = []; const r = oAbrigoDoGolpe(k.pers, k.dano, k.nome, { calou: (o) => c.push(o) }); return { r, calados: c }; },
  concentracao: (k) => { const c = []; const r = aConcentracaoDoGolpe(k.pers, k.dano, k.nome, { calou: (o) => c.push(o), sorte: sorteDoCaso(k.i) }); return { r, calados: c }; },
  quebra: (k) => { const c = []; const r = aQuebraDoHeroi(k.pers, k.dano, { calou: (o) => c.push(o), sorte: sorteDoCaso(k.i), nota: k.nota, mostrarRolagens: k.mostrarRolagens }); return { r, calados: c }; },
  fila: (k) => { const c = []; try { const r = aFilaDoGolpeNoHeroi(k.pers, k.grupo, k.dano, k.tipo, { calou: (o) => c.push(o) }); return { r, calados: c }; } catch (e) { return { erro: String(e && e.message), calados: c }; } },
};
const fotos = (corre) => casos.map((k) => fotoDoGolpe(k, corre(k)));
const daPeca = Object.fromEntries(REGRAS.map((n) => [n, fotos(PECA[n])]));
const ANTES = compilarORecorte();
const doAntes = Object.fromEntries(REGRAS.map((n) => [n, fotos(ANTES[n])]));
/* a mordida troca um pedaço do recorte (UMA vez só) e conta as fotos que mudam */
const mordido = (regra, de, para) => {
  const r = DOURADO.recortes[regra];
  if (r.split(de).length !== 2) throw new Error("a troca da mordida não bate uma vez só: " + de);
  const f = compilarORecorte({ ...DOURADO.recortes, [regra]: r.replace(de, para) })[regra];
  return fotos(f).filter((x, i) => x !== daPeca[regra][i]).length;
};

sec("1 · o recorte de antes, congelado");
t("o dourado é do commit de antes (c494a04), com as cinco regras recortadas", DOURADO.commit === "c494a04" && ["carimbo", ...REGRAS].every((n) => typeof DOURADO.recortes[n] === "string" && DOURADO.recortes[n].length > 100));
t("cada recorte é a peça inteira do App: a porta do abrigo e a da concentração com o try/calou, a quebra com o seu, a fila do amortecer ao abrigo",
  /^const passarPeloAbrigo = [\s\S]*calou\("abrigo", e\)[\s\S]*\};$/.test(DOURADO.recortes.abrigo)
  && /^const segurarOuPerder = [\s\S]*calou\("concentracaoDoCompanheiro", e\)[\s\S]*\};$/.test(DOURADO.recortes.concentracao)
  && /^try \{[\s\S]*QUEBRADA PELO SISTEMA[\s\S]*calou\("quebraDaConcentracao", e\); \}$/.test(DOURADO.recortes.quebra)
  && /^const amort = amortecerDano[\s\S]*repartirDano[\s\S]*passarPeloAbrigo[\s\S]*\}$/.test(DOURADO.recortes.fila));

sec("2 · a peça, foto a foto contra o recorte (" + N_CASOS + " casos, a mesma sorte dos dois lados)");
for (const n of REGRAS) {
  const batem = daPeca[n].filter((f, i) => f === doAntes[n][i]).length;
  const primeira = daPeca[n].findIndex((f, i) => f !== doAntes[n][i]);
  t(`${n}: ${batem}/${N_CASOS} iguais ao App de antes`, batem === N_CASOS, primeira >= 0 ? `o caso ${primeira}: ${daPeca[n][primeira].slice(0, 300)} | antes ${doAntes[n][primeira].slice(0, 300)}` : "");
  t(`${n}: determinista (corrida outra vez, as mesmas fotos)`, fotos(PECA[n]).every((f, i) => f === daPeca[n][i]));
}

sec("3 · os casos percorrem os ramos");
{
  const conta = (n, re) => daPeca[n].filter((f) => re.test(f)).length;
  const comDono = (n, icone) => casos.filter((k, i) => k.nome && daPeca[n][i].includes(`"linha":"${icone}${k.nome}${MOLDE_DO_DONO.juntura}`)).length;
  const ab = { linha: conta("abrigo", /"linha":"🛡/), nada: conta("abrigo", /nada chega/), resto: conta("abrigo", /chegam\./), dono: comDono("abrigo", MOLDE_DO_DONO.abrigo), calou: conta("abrigo", /"calados":\["abrigo"\]/), poco: casos.filter((k, i) => /"linha":""/.test(daPeca.abrigo[i]) && !/"pers":"≡entrada"/.test(daPeca.abrigo[i])).length };
  console.log(`      abrigo: a linha ${ab.linha} (nada chega ${ab.nada}, com resto ${ab.resto}) · com o dono ${ab.dono} · só o poço ${ab.poco} · calou ${ab.calou}`);
  t("o abrigo: com e sem resto, com o dono, só o poço temporário, e o estouro", ab.nada > 10 && ab.resto > 20 && ab.dono > 15 && ab.poco > 15 && ab.calou >= 5);
  const qc = { queda: conta("concentracao", /"linha":"💢/), dono: comDono("concentracao", MOLDE_DO_DONO.quebra), calou: conta("concentracao", /concentracaoDoCompanheiro/), sem: casos.filter((k, i) => k.dano > 0 && /"linha":""/.test(daPeca.concentracao[i]) && !/calados":\["/.test(daPeca.concentracao[i])).length };
  console.log(`      concentração do companheiro: a queda ${qc.queda} (com o dono ${qc.dono}) · com dano e sem queda ${qc.sem} · calou ${qc.calou}`);
  t("a concentração do companheiro: a queda, com o dono, a que aguenta, e o estouro", qc.queda > 25 && qc.dono > 10 && qc.sem > 50 && qc.calou >= 5);
  const qh = { queda: conta("quebra", /QUEBRADA PELO SISTEMA/), dado: conta("quebra", /🎲/), mantida: conta("quebra", /→ mantida/), empilhada: conta("quebra", /\\n\[CONCENTRAÇÃO/), calou: conta("quebra", /quebraDaConcentracao/) };
  console.log(`      a quebra do herói: a queda ${qh.queda} (a nota empilhada ${qh.empilhada}) · a 🎲 ${qh.dado} · mantida ${qh.mantida} · calou ${qh.calou}`);
  t("a quebra do herói: a queda, a nota empilhada, a 🎲, a que aguenta, e o estouro", qh.queda > 25 && qh.empilhada > 5 && qh.dado > 25 && qh.mantida > 10 && qh.calou >= 5);
  const f = { pedra: conta("fila", /Pele de pedra/), resiste: conta("fila", /Resistência de origem/), abafo: conta("fila", /abafa o que chega/), ana: conta("fila", /Resistência anã/), fusao: conta("fila", /Fusão Espiritual —/), elo: conta("fila", /Elo Vital —/), abrigo: conta("fila", /🛡/), erro: conta("fila", /"erro":/) };
  console.log(`      a fila: a pedra ${f.pedra} · a resistência ${f.resiste} · o abafo ${f.abafo} · a anã ${f.ana} · a fusão ${f.fusao} · o elo ${f.elo} · o abrigo ${f.abrigo} · o estouro ${f.erro}`);
  t("a fila: as quatro estações da origem, as duas da invocação, o abrigo e o estouro", f.pedra > 5 && f.resiste > 5 && f.abafo > 20 && f.ana > 5 && f.fusao > 10 && f.elo > 10 && f.abrigo > 30 && f.erro > 3);
}

sec("4 · a prova morde");
{
  const m = [
    ["abrigo", "o abrigo que nunca chega a absorver", "!(ab.absorvido > 0)", "!(ab.absorvido > 99)", 50],
    ["abrigo", "o dono que perde o nome", "nome ? String(ab.linha)", "false ? String(ab.linha)", 15],
    ["abrigo", "o recuo que zera o dano em vez de devolver o que entrou", `calou("abrigo", e); return { pers: quem, dano, linha: "" };`, `calou("abrigo", e); return { pers: quem, dano: 0, linha: "" };`, 4],
    ["concentracao", "o teste que aguenta ao contrário", "if (tc.manteve) return", "if (!tc.manteve) return", 50],
    ["concentracao", "o golpe pequeno que não testa", "!(dano > 0)", "!(dano > 9)", 3],
    ["concentracao", "o dono com outra juntura", `"💢 " + nome + " — "`, `"💢 " + nome + ": "`, 10],
    ["quebra", "a 🎲 para quem não pediu", "if (mostrarRolagensRef.current)", "if (true)", 20],
    ["quebra", "a nota que apaga as vizinhas", `\${notaRef.current ? notaRef.current + "\\n" : ""}`, "", 5],
    ["quebra", "a queda que não fica anotada", "persConcQuebrada = concentrando.nome;", "", 25],
    ["fila", "a origem que esquece o tipo do golpe", `a.r.tipoDano || "fisico"`, `"fisico"`, 5],
    ["fila", "a invocação que apanha numa cópia", "grupoAtual = rep.pers.grupo || grupoAtual;", "", 20],
    ["fila", "o abrigo que não desconta", "a.r.dano = abrH.dano;", "", 30],
  ];
  for (const [regra, nome, de, para, min] of m) {
    const n = mordido(regra, de, para);
    t(`${regra} · ${nome}: ${n} fotos divergem`, n >= min, `esperava ≥ ${min}`);
  }
  /* A ORDEM: o abrigo antes da origem e da invocação. É a mordida que
     substitui o `indexOf` de teste-amortece §9 e de teste-efeitos — a
     ordem deixa de ser posição no texto e passa a ser resultado. */
  const R = DOURADO.recortes.fila;
  const iAbr = R.indexOf("const abrH = passarPeloAbrigo(");
  const trocada = R.slice(iAbr) + "\n" + R.slice(0, iAbr);
  const fTrocada = compilarORecorte({ ...DOURADO.recortes, fila: trocada }).fila;
  const nOrdem = fotos(fTrocada).filter((x, i) => x !== daPeca.fila[i]).length;
  t(`fila · o abrigo na frente da origem e da invocação: ${nOrdem} fotos divergem`, nOrdem >= 15);
}

sec("5 · o abrigo, dito como chamada");
{
  const heroi = (ef, extra) => ({ nome: "Herói", vida: 20, vidaMax: 20, efeitos: ef, ...(extra || {}) });
  const comAbrigo = (n) => heroi([{ nome: "Escudo Arcano", absorve: n }]);
  const p = comAbrigo(4);
  const r = oAbrigoDoGolpe(p, 10);
  t("quem decide é o módulo do efeito: 4 param, 6 chegam, e o abrigo some da ficha", r.dano === 6 && r.linha === "🛡 Escudo Arcano encontra o golpe primeiro e se desfaz: 4 param ali, 6 chegam." && r.pers.efeitos.length === 0);
  t("imutável: a ficha que entrou continua com o abrigo", p.efeitos.length === 1 && r.pers !== p);
  const d = oAbrigoDoGolpe(comAbrigo(4), 10, "Bruna");
  t("o nome do dono entra pelo molde da tabela (ícone, nome, juntura)", d.linha.startsWith(MOLDE_DO_DONO.abrigo + "Bruna" + MOLDE_DO_DONO.juntura + "Escudo Arcano"));
  const sem = heroi([{ nome: "Graça", turnos: 2 }]);
  const s = oAbrigoDoGolpe(sem, 9.6);
  t("sem abrigo: o MESMO objeto, o MESMO dano (nem arredondado) e a linha vazia — regressão zero", s.pers === sem && s.dano === 9.6 && s.linha === "");
  const podre = Object.defineProperty({ nome: "X" }, "efeitos", { get() { throw new Error("podre"); }, enumerable: true });
  const cal = [];
  const e = oAbrigoDoGolpe(podre, 7, "", { calou: (o) => cal.push(o) });
  t("o abrigo que estoura cala com o nome de sempre e devolve o que entrou, byte a byte", e.pers === podre && e.dano === 7 && e.linha === "" && cal.join() === "abrigo");
  let estourou = false;
  try { oAbrigoDoGolpe(podre, 7, "", { calou: () => { throw new Error("o calou também"); } }); } catch { estourou = true; }
  t("e um `calou` que estoure também não custa o turno", !estourou);
  t("opções `null` e ficha `null` não estouram", (() => { try { const x = oAbrigoDoGolpe(null, 5, "", null); return x.pers === null && x.dano === 5 && x.linha === ""; } catch { return false; } })());
}

sec("6 · a concentração, dita como chamada");
{
  const conc = (nome, extra) => ({ nome: "Ilda", vida: 10, atributos: { vigor: 0 }, efeitos: [{ nome, concentracao: true, turnos: 3 }], ...(extra || {}) });
  /* a sorte espiã conta as rolagens: dano zero não testa */
  let rolou = 0;
  const espia = () => { rolou++; return 0.5; };
  const z = aConcentracaoDoGolpe(conc("Voo"), 0, "Ilda", { sorte: espia });
  t("dano zero não testa (nenhuma rolagem) e volta sem linha", rolou === 0 && z.linha === "");
  const semNada = { nome: "Ilda", efeitos: [{ nome: "Graça" }] };
  const sn = aConcentracaoDoGolpe(semNada, 30, "Ilda", { sorte: espia });
  t("quem não segura nada não testa e volta o mesmo", rolou === 0 && sn.pers === semNada && sn.linha === "");
  /* a sorte 0 rola 1 no d20: contra CD ≥ 10, cai sempre */
  const caiu = aConcentracaoDoGolpe(conc("Bênção"), 30, "Ilda", { sorte: () => 0 });
  const cd = Math.max(RESISTENCIA_DA_CONCENTRACAO.cdMinima, Math.floor(30 / RESISTENCIA_DA_CONCENTRACAO.divisorDoDano));
  t("na queda: a magia sai da ficha, o nome volta, e a linha leva o dono pelo molde", caiu.magia === "Bênção" && caiu.pers.efeitos.length === 0
    && caiu.linha === `${MOLDE_DO_DONO.quebra}Ilda${MOLDE_DO_DONO.juntura}Bênção escapa dos dedos — o corpo aguentou 1, e era preciso ${cd}.`);
  const aguentou = aConcentracaoDoGolpe(conc("Bênção"), 1, "Ilda", { sorte: () => 0.99 });
  t("o teste aguentado volta sem linha e com a ficha intocada", aguentou.linha === "" && aguentou.pers.efeitos.length === 1);
  const semente = (i) => dadoDo("prova-da-concentracao", i);
  const a = Array.from({ length: 200 }, (_, i) => aConcentracaoDoGolpe(conc("Voo"), 14, "", { sorte: semente(i) }).linha);
  const b = Array.from({ length: 200 }, (_, i) => aConcentracaoDoGolpe(conc("Voo"), 14, "", { sorte: semente(i) }).linha);
  t("determinismo por semente: mesma semente, a mesma queda", a.every((x, i) => x === b[i]));
  t("e as sementes dão os dois lados (cai e aguenta)", a.some((x) => x) && a.some((x) => !x));
  const cal = [];
  const podre = Object.defineProperty(conc("Voo"), "atributos", { get() { throw new Error("podre"); } });
  const e = aConcentracaoDoGolpe(podre, 9, "", { calou: (o) => cal.push(o) });
  t("o teste que estoura cala com o nome de sempre, e a magia fica de pé", e.pers === podre && e.linha === "" && cal.join() === "concentracaoDoCompanheiro");
}

sec("7 · a quebra na mesa do herói, dita como chamada");
{
  const heroi = (extra) => ({ nome: "Herói", vida: 20, atributos: { vigor: 0 }, efeitos: [{ nome: "Invisibilidade", concentracao: true }], ...(extra || {}) });
  const cai = { sorte: () => 0 }, aguenta = { sorte: () => 0.99 };
  const q = aQuebraDoHeroi(heroi(), 12, { ...cai, nota: "[RUMOR] o vau sobe." });
  const env = ENVELOPES_DO_GOLPE.quebraDaConcentracao({ magia: "Invisibilidade" });
  t("na queda: a linha do módulo sem prefixo nenhum, e o nome anotado", q.mensagens.length === 1 && q.mensagens[0].autor === "sistema" && /^💢 Invisibilidade escapa dos dedos/.test(q.mensagens[0].texto) && q.quebrada === "Invisibilidade");
  t("a nota ao Narrador vem da tabela, diz QUAL magia e manda narrar o desfazimento", env.startsWith("[CONCENTRAÇÃO — QUEBRADA PELO SISTEMA]") && env.includes('"Invisibilidade"') && env.includes("Narre o efeito se desmanchando"));
  t("e viaja pela nota por turno, empilhada nas vizinhas", q.nota === "[RUMOR] o vau sobe.\n" + env);
  t("sem nota de antes, é a nota inteira", aQuebraDoHeroi(heroi(), 12, { ...cai, nota: "" }).nota === env && aQuebraDoHeroi(heroi(), 12, cai).nota === env);
  const m = aQuebraDoHeroi(heroi(), 12, { ...aguenta, nota: "[X]" });
  t("a magia que aguenta: nenhuma nota nova, nada anotado, nenhuma linha", m.nota === "[X]" && m.quebrada === null && m.mensagens.length === 0);
  const v = aQuebraDoHeroi(heroi(), 12, { ...aguenta, mostrarRolagens: true });
  t("a voz de ficha (🎲) só para quem pediu para ver as rolagens", v.mensagens.length === 1 && /^🎲 Concentração: d20\+0=\d+ vs CD 10 → mantida$/.test(v.mensagens[0].texto));
  const vq = aQuebraDoHeroi(heroi(), 12, { ...cai, mostrarRolagens: true });
  t("e na queda a 🎲 vem antes da linha da cena", vq.mensagens.length === 2 && vq.mensagens[0].texto.startsWith("🎲 ") && vq.mensagens[1].texto.startsWith("💢 "));
  t("sem dano, nada acontece (nem rola)", (() => { let n = 0; const r = aQuebraDoHeroi(heroi(), 0, { sorte: () => { n++; return 0; }, nota: "[X]" }); return n === 0 && r.nota === "[X]" && !r.mensagens.length; })());
  const h = heroi();
  const antes = JSON.stringify(h);
  aQuebraDoHeroi(h, 12, cai);
  t("imutável: a ficha do herói não é tocada (quem a tira da ficha é quem chama)", JSON.stringify(h) === antes);
  const cal = [];
  const podre = Object.defineProperty(heroi(), "atributos", { get() { throw new Error("podre"); } });
  const e = aQuebraDoHeroi(podre, 12, { ...cai, nota: "[X]", calou: (o) => cal.push(o) });
  t("o teste que estoura: a rodada segue, a magia fica de pé, a nota fica como estava", e.quebrada === null && e.nota === "[X]" && !e.mensagens.length && cal.join() === "quebraDaConcentracao");
  t("opções `null` não estouram", (() => { try { return aQuebraDoHeroi(heroi(), 12, null).mensagens.length >= 0; } catch { return false; } })());
}

sec("8 · a fila do golpe no herói, dita como chamada");
{
  const invocada = (vida) => ({ nome: "Lobo Espiritual", invocada: true, vida, vidaMax: 12 });
  const abrigo = { nome: "Escudo Arcano", absorve: 3 };
  /* ORIGEM ANTES DA INVOCAÇÃO, INVOCAÇÃO ANTES DO ABRIGO. Goliath com a Pele,
     a Fusão e um abrigo: a Pele parte o 10 em 5, a Fusão leva os 5 inteiros
     — e o abrigo NÃO é gasto, porque nada chegou ao corpo. */
  const lobo = invocada(12);
  const g = { nome: "Herói", raca: "Goliath", habilidades: [{ nome: "Fusão Espiritual" }], efeitos: [abrigo], grupo: [lobo] };
  const r = aFilaDoGolpeNoHeroi(g, g.grupo, 10, "fisico");
  t("a origem age primeiro (a Pele parte o golpe) e a invocação recebe o que sobrou dela", r.mensagens[0].texto.startsWith("🪨 Pele de pedra — o golpe de 10 vira 5") && r.mensagens[1].texto.includes("leva o golpe inteiro (5)"));
  t("e o abrigo, por último, não se gasta quando nada chega ao corpo", r.dano === 0 && r.mensagens.length === 2 && r.pers.efeitos.length === 1 && r.grupo[0].vida === 7);
  t("a Pele gasta fica escrita na ficha nova; a que entrou não muda", r.pers.tracoGastos && r.pers.tracoGastos.pedra === true && !g.tracoGastos && lobo.vida === 12);
  const e = { nome: "Herói", habilidades: ["Elo Vital"], efeitos: [abrigo], grupo: [invocada(12)] };
  const re = aFilaDoGolpeNoHeroi(e, e.grupo, 10, undefined);
  t("o Elo Vital divide (5 na fera) e o abrigo apara o que chega (3 de 5, 2 no corpo)", re.dano === 2 && re.mensagens.map((m) => m.texto[0] + m.texto[1]).join("|") === "🜁|🛡" && re.grupo[0].vida === 7 && re.pers.efeitos.length === 0);
  const ti = { nome: "Herói", raca: "Tiefling", efeitos: [] };
  t("o tipo do golpe chega à origem (o Tiefling no fogo), e sem tipo o golpe é físico", aFilaDoGolpeNoHeroi(ti, [], 9, "fogo").dano === 4 && aFilaDoGolpeNoHeroi(ti, [], 9, undefined).dano === 9);
  const nada = { nome: "Herói", efeitos: [{ nome: "Graça" }], grupo: [] };
  const gr = nada.grupo;
  const z = aFilaDoGolpeNoHeroi(nada, gr, 7, "fisico");
  t("nenhuma estação fala: o MESMO herói, o MESMO grupo, o mesmo dano e nenhuma linha", z.pers === nada && z.grupo === gr && z.dano === 7 && z.mensagens.length === 0);
  const cal = [];
  const podreAbr = { nome: "Herói", efeitos: [] };
  Object.defineProperty(podreAbr, "temporario", { get() { throw new Error("podre"); } });
  const zp = aFilaDoGolpeNoHeroi(podreAbr, [], 6, "fisico", { calou: (o) => cal.push(o) });
  t("o abrigo da fila cala pela porta dele, e o golpe chega inteiro", zp.dano === 6 && zp.pers === podreAbr && cal.join() === "abrigo");
}

console.log(`\n${ok} ok · ${mal} falhas`);
process.exit(mal ? 1 : 0);
