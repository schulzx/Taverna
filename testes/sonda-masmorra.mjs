/* Sonda da MASMORRA: gerar cem masmorras e ver se todas sao jogaveis. */
import { gerarMasmorra, saidasDe, saidasDeRecuo, entrarNaSala, marcarResolvida, progressoMasmorra, noEscuro, recompensaChefe, RITMOS, percepcaoPassiva, checarPassiva, resultadoBusca, armadilhaDispara, ROTULO_SALA, ICONE_SALA } from "../src/masmorras.js";

const achados = [];
const anota = (grau, o) => achados.push({ grau, o });

console.log("=== 1. CEM MASMORRAS: TODAS TERMINAM? ===\n");
let semChefe = 0, semChave = 0, chefeInalcancavel = 0, chaveDepoisDoChefe = 0, salasOrfas = 0;
const tipos = {};
for (let i = 0; i < 100; i++) {
  const nv = 1 + (i % 20);
  const mm = gerarMasmorra("Fantasia medieval", nv, "");
  for (const s of mm.salas) tipos[s.tipo] = (tipos[s.tipo] || 0) + 1;
  if (!mm.salas.some((s) => s.tipo === "chefe")) semChefe++;
  const chave = mm.salas.find((s) => s.tipo === "chave");
  if (!chave) semChave++;

  /* da para andar da entrada ate o chefe? caminha pelo grafo de saidas */
  let cur = { ...mm };
  const vistos = new Set([cur.atual]);
  const fila = [cur.atual];
  while (fila.length) {
    const aqui = fila.shift();
    const m2 = { ...cur, atual: aqui };
    for (const s of saidasDe(m2)) if (!vistos.has(s.id)) { vistos.add(s.id); fila.push(s.id); }
  }
  const chefe = mm.salas.find((s) => s.tipo === "chefe");
  if (chefe && !vistos.has(chefe.id)) chefeInalcancavel++;
  const orfas = mm.salas.filter((s) => !vistos.has(s.id));
  if (orfas.length) salasOrfas += orfas.length;
  /* a chave vem ANTES do chefe no caminho? (se a porta do chefe exige chave) */
  if (chave && chefe && chave.id > chefe.id) chaveDepoisDoChefe++;
}
console.log("tipos de sala gerados:", JSON.stringify(tipos));
console.log(`sem chefe: ${semChefe} · sem sala-chave: ${semChave} · chefe inalcançável: ${chefeInalcancavel} · salas órfãs (total): ${salasOrfas} · chave depois do chefe: ${chaveDepoisDoChefe}`);
if (chefeInalcancavel) anota("alto", `${chefeInalcancavel} de 100 masmorras têm o chefe fora do alcance da entrada`);
if (salasOrfas) anota("alto", `${salasOrfas} salas geradas sem nenhum caminho até elas`);
if (semChefe) anota("alto", `${semChefe} de 100 masmorras não têm chefe — não há como concluí-las`);

console.log("\n=== 2. UMA MASMORRA INTEIRA, PASSO A PASSO ===\n");
{
  let mm = gerarMasmorra("Fantasia medieval", 8, "Cripta de Prova");
  console.log(`${mm.nome} · ${mm.salas.length} salas · ${mm.tochas} tochas · ritmo ${mm.ritmo}`);
  console.log("mapa:", mm.salas.map((s) => `${s.id}${ICONE_SALA[s.tipo]}`).join(" "));
  let voltas = 0;
  while (voltas++ < 40) {
    const saidas = saidasDe(mm);
    const prog = progressoMasmorra(mm);
    if (!saidas.length) { console.log(`  sem saída na sala ${mm.atual} (${prog.visitadas}/${prog.total})`); break; }
    const prox = saidas[0];
    const r = entrarNaSala(mm, prox.id); if (r.bloqueado) { console.log(`  bloqueado: ${r.msgs.join(" ")}`); break; } mm = r.mm;
    const sala = mm.salas.find((s) => s.id === mm.atual);
    console.log(`  → sala ${mm.atual} ${ICONE_SALA[sala.tipo]} ${ROTULO_SALA[sala.tipo]}${noEscuro(mm) ? "  [NO ESCURO]" : ""}`);
    mm = marcarResolvida(mm, mm.atual);
    if (sala.tipo === "chefe") { console.log("  chefe resolvido — fim."); break; }
  }
  const p = progressoMasmorra(mm);
  console.log(`progresso final: ${p.visitadas}/${p.total}`);
  if (voltas >= 40) anota("alto", "andar sempre pela primeira saída não conclui a masmorra em 40 passos (possível laço)");
}

console.log("\n=== 3. AS TOCHAS ===\n");
{
  let mm = gerarMasmorra("Fantasia medieval", 8, "");
  console.log("tochas iniciais:", mm.tochas);
  let n = 0;
  while (!noEscuro(mm) && n < 60) { const s = saidasDe(mm); if (!s.length) break; const r2 = entrarNaSala(mm, s[0].id); if (r2.bloqueado) break; mm = r2.mm; n++; }
  console.log(`ficou no escuro depois de ${n} salas · masmorra tem ${mm.salas.length} salas`);
  if (n >= mm.salas.length) anota("baixo", "as tochas duram mais que a masmorra inteira — o recurso não pressiona");
  if (n === 0 && mm.tochas <= 0) anota("alto", "a masmorra começa no escuro");
}

console.log("\n=== 4. PERCEPÇÃO PASSIVA E BUSCA ===\n");
for (const r of RITMOS) {
  const p = percepcaoPassiva(3, r.id);
  console.log(`ritmo ${String(r.id).padEnd(10)} passiva ${p}`);
}
{
  const mm = gerarMasmorra("Fantasia medieval", 8, "");
  const comSegredo = mm.salas.filter((s) => s.segredo);
  console.log(`salas com segredo: ${comSegredo.length}/${mm.salas.length}`);
  if (!comSegredo.length) anota("medio", "nenhuma sala gerada com segredo — a percepção passiva e a busca não têm o que achar");
  else {
    const s = comSegredo[0];
    console.log("  exemplo:", JSON.stringify(s.segredo));
    console.log("  passiva 10 acha?", !!checarPassiva(s, 10), "| passiva 25 acha?", !!checarPassiva(s, 25));
    console.log("  busca com 5:", JSON.stringify(resultadoBusca(s, 5)), "| busca com 25:", JSON.stringify(resultadoBusca(s, 25)));
  }
}

console.log("\n=== 5. ARMADILHA E RECOMPENSA ===\n");
{
  const mm = gerarMasmorra("Fantasia medieval", 8, "");
  const arm = mm.salas.find((s) => s.tipo === "armadilha");
  console.log("armadilha:", arm ? JSON.stringify(armadilhaDispara(arm)) : "nenhuma nesta masmorra");
  for (const nv of [1, 8, 20]) console.log(`recompensa do chefe nv${nv}:`, JSON.stringify(recompensaChefe(nv)));
}

console.log("\n=== 6. RECUO ===\n");
{
  let mm = gerarMasmorra("Fantasia medieval", 8, "");
  const s = saidasDe(mm);
  if (s.length) { mm = entrarNaSala(mm, s[0].id).mm; console.log("saídas de recuo da sala", mm.atual, ":", JSON.stringify(saidasDeRecuo(mm).map((x) => x.id))); }
  if (!saidasDeRecuo(mm).length) anota("medio", "não há como recuar da primeira sala — entrar é via de mão única");
}

console.log("\n\n=== ACHADOS ===\n");
if (!achados.length) console.log("a masmorra passou nesta sonda.");
for (const a of achados) console.log(`[${a.grau}] ${a.o}`);
