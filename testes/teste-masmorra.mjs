/* teste-masmorra.mjs (v9.53) — nenhuma masmorra pode ser um beco sem saida.

   Nasceu do pior bug que este jogo teve: em 12% das masmorras a sala que
   guarda a chave ficava num ramo sem caminho ate ele, e o portao do chefe e
   trancado. O jogador entrava, limpava tudo e nao tinha para onde ir.       */
import { gerarMasmorra, garantirCaminhos, saidasDe, saidasDeRecuo, entrarNaSala, marcarResolvida } from "../src/masmorras.js";

let ok = 0, mal = 0;
const t = (nome, cond) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome); } };
const sec = (s) => console.log("\n" + s);

/* quem se alcanca da entrada; `respeitarTrancas` simula o jogador SEM a chave */
const alcancaveis = (salas, respeitarTrancas) => {
  const porId = new Map(salas.map((s) => [s.id, s]));
  const vistos = new Set([0]); const fila = [0];
  while (fila.length) {
    const s = porId.get(fila.shift());
    for (const id of (s && s.saidas) || []) {
      const alvo = porId.get(id);
      if (!alvo || vistos.has(id)) continue;
      if (respeitarTrancas && alvo.trancada) continue;
      vistos.add(id); fila.push(id);
    }
  }
  return vistos;
};

sec("1. mil masmorras, nenhuma sala orfa");
{
  let orfas = 0, comOrfa = 0, chaveInalcancavel = 0, chefeInalcancavel = 0, semChave = 0, semChefe = 0;
  const N = 1000;
  for (let i = 0; i < N; i++) {
    const mm = gerarMasmorra("Fantasia medieval", 1 + (i % 20), "");
    const todos = alcancaveis(mm.salas, false);
    const fora = mm.salas.filter((s) => !todos.has(s.id));
    if (fora.length) { comOrfa++; orfas += fora.length; }

    const chave = mm.salas.find((s) => s.guardaChave || s.tipo === "chave");
    const chefe = mm.salas.find((s) => s.tipo === "chefe");
    if (!chave) semChave++;
    if (!chefe) semChefe++;
    /* SEM a chave na mao: a sala da chave tem de ser alcancavel */
    if (chave && !alcancaveis(mm.salas, true).has(chave.id)) chaveInalcancavel++;
    if (chefe && !todos.has(chefe.id)) chefeInalcancavel++;
  }
  console.log(`      ${N} masmorras · ${comOrfa} com sala órfã (${orfas} salas) · chave inalcançável: ${chaveInalcancavel}`);
  t("nenhuma sala órfã em mil masmorras", orfas === 0);
  t("a chave é SEMPRE alcançável sem a chave", chaveInalcancavel === 0);
  t("o chefe é sempre alcançável", chefeInalcancavel === 0);
  t("toda masmorra tem chave", semChave === 0);
  t("toda masmorra tem chefe", semChefe === 0);
}

sec("2. da para andar da entrada ao chefe, de verdade");
{
  let terminadas = 0;
  const N = 200;
  for (let i = 0; i < N; i++) {
    let mm = gerarMasmorra("Fantasia medieval", 1 + (i % 20), "");
    /* varre em largura pegando a chave quando passar por ela */
    const vistos = new Set([0]); const fila = [0];
    let temChave = false, chegouAoChefe = false;
    while (fila.length) {
      const id = fila.shift();
      const s = mm.salas.find((x) => x.id === id);
      if (s.guardaChave || s.tipo === "chave") temChave = true;
      if (s.tipo === "chefe") { chegouAoChefe = true; break; }
      for (const dst of s.saidas || []) {
        const alvo = mm.salas.find((x) => x.id === dst);
        if (vistos.has(dst)) continue;
        if (alvo.trancada && !temChave) { fila.push(id); continue; }  // volta depois
        vistos.add(dst); fila.push(dst);
      }
    }
    if (chegouAoChefe && temChave) terminadas++;
  }
  console.log(`      ${terminadas}/${N} masmorras concluíveis pegando a chave no caminho`);
  t("todas as 200 são concluíveis", terminadas === N);
}

sec("3. a rede de segurança conserta um grafo quebrado de propósito");
{
  /* uma masmorra montada a mao com a chave atras da porta trancada */
  const quebrada = [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1] },
    { id: 1, tipo: "combate", camada: 1, saidas: [3] },
    { id: 2, tipo: "chave", camada: 1, saidas: [3], guardaChave: true },   // ninguém aponta para a 2
    { id: 3, tipo: "chefe", camada: 2, saidas: [], trancada: true },
  ];
  t("antes: a chave é inalcançável", !alcancaveis(quebrada, true).has(2));
  const consertada = garantirCaminhos(quebrada.map((s) => ({ ...s, saidas: [...s.saidas] })));
  t("depois: a chave é alcançável sem a chave", alcancaveis(consertada, true).has(2));
  t("e todas as salas continuam alcançáveis", consertada.every((s) => alcancaveis(consertada, false).has(s.id)));

  /* uma sala solta no meio do nada */
  const solta = [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1] },
    { id: 1, tipo: "combate", camada: 1, saidas: [] },
    { id: 2, tipo: "tesouro", camada: 1, saidas: [] },
  ];
  const c2 = garantirCaminhos(solta.map((s) => ({ ...s, saidas: [...s.saidas] })));
  t("a sala solta ganha um pai", alcancaveis(c2, false).has(2));
  t("não quebra com lista vazia", Array.isArray(garantirCaminhos([])));
}

sec("4. o passeio real, pela API do jogo");
{
  /* o jogador ANDA PARA TRÁS quando o caminho à frente está trancado — é o
     que `saidasDeRecuo` existe para permitir. Um passeio que só avança não
     prova nada sobre a masmorra, prova sobre o passeio. */
  let mm = gerarMasmorra("Fantasia medieval", 12, "Prova");
  let passos = 0, chegou = false;
  const visitadas = new Set([0]);
  while (passos++ < 80) {
    const abertas = saidasDe(mm).filter((s) => !s.trancada);
    /* com a chave na mão, mergulha: a saída mais funda leva ao chefe.
       Sem ela, explora o que ainda não viu; sem nada, recua. */
    const fundo = [...abertas].sort((a, b) => (b.camada || 0) - (a.camada || 0))[0];
    const nova = abertas.find((s) => !visitadas.has(s.id));
    const alvo = (mm.chave ? fundo : null) || nova || saidasDeRecuo(mm)[0] || abertas[0];
    if (!alvo) break;
    const r = entrarNaSala(mm, alvo.id);
    if (r.bloqueado) break;
    mm = marcarResolvida(r.mm, r.mm.atual);
    visitadas.add(mm.atual);
    if (r.sala.tipo === "chefe") { chegou = true; break; }
  }
  console.log(`      ${passos} passos · ${visitadas.size}/${mm.salas.length} salas · chefe ${chegou ? "alcançado" : "NÃO alcançado"}`);
  t("o chefe cai andando pela API de verdade", chegou);
  t("e a chave foi apanhada no caminho", mm.chave === true);
}

console.log(`\nmasmorra v9.53: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
