/* teste-cenario-que-se-usa.mjs (CB16, Fase CB lote 3, 10/11/2026) — o empurrão que vale

   Into the Breach e DOS2: empurrar do alto fere com a queda, empurrar contra
   a pedra ou contra outro corpo fere com o choque, empurrar contra o barril
   derrama-o, contra o candeeiro acende-o, e empurrar para o fogo arde. A lei
   do veredito pede que a seta diga tudo isto ANTES do clique — e esta suíte
   prova que diz a verdade: em TODAS as plantas, para toda a casa e toda a
   direção, a previsão (`previsaoDoEmpurrao`) bate com o empurrão real
   (`empurrar` vence → `empurraoNoCenario`): a mesma casa, o mesmo dano, as
   mesmas parcelas. E a chance da disputa que a seta mostra é a frequência
   com que o dado vence. */
import { previsaoDoEmpurrao, empurraoNoCenario, superficiesDaPlanta, SUPERFICIES } from "../src/superficies.js";
import { DANO_DA_QUEDA, PLANTAS, montarGrade, ehParede, OBJETOS_DO_CENARIO } from "../src/grid.js";
import { empurrar } from "../src/disputa.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);
const IARA = (x, y) => ({ nome: "Iara", classe: "Guerreiro", nivel: 3, x, y, vida: 30, vidaMax: 30, atributos: { forca: 3, destreza: 2, vigor: 2 }, pericias: {} });
const BANDIDO = (x, y, extra = {}) => ({ nome: "Bandido", ameaca: "comum", nivel: 2, x, y, vida: 20, vidaMax: 20, des: 1, condicoes: [], ...extra });
const gradeDe = (id) => montarGrade(id === "masmorra" ? { emMasmorra: true } : { local: id === "estrada" ? "" : id, emViagem: id === "estrada" ? true : undefined, bioma: id === "estrada" ? "planicie" : undefined });

sec("1. a tabela");
{
  t("a queda: 0, 2 e 5 por degrau, e quem cai dois fica caído", DANO_DA_QUEDA.porDegrau.join() === "0,2,5" && DANO_DA_QUEDA.derrubaDesde === 2);
  t("o choque: 1 na parede e no corpo, nada na borda", DANO_DA_QUEDA.colisao.parede === 1 && DANO_DA_QUEDA.colisao.ocupado === 1 && DANO_DA_QUEDA.colisao.borda === 0);
  t("a queda é física", DANO_DA_QUEDA.elemento === "fisico");
  t("as plantas montam a grade que esta suíte varre", Object.keys(PLANTAS).every((id) => gradeDe(id).cenario === id), Object.keys(PLANTAS).map((id) => gradeDe(id).cenario).join());
}

sec("2. em todas as plantas, a previsão é o empurrão");
{
  const DIRS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  let casos = 0, venceu = 0, difPara = 0, difDano = 0, difParcelas = 0, difReal = 0, comQueda = 0, comChoque = 0, comChao = 0, comObjeto = 0;
  let primeiro = "";
  for (const id of Object.keys(PLANTAS)) {
    const p = PLANTAS[id];
    const g0 = gradeDe(id);
    const r = rng(hashSemente("cenario|" + id));
    /* o chão: o da planta, e manchas semeadas de cada tipo */
    const sup = [...superficiesDaPlanta(g0)];
    const tipos = Object.keys(SUPERFICIES);
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(r() * p.largura), y = Math.floor(r() * p.altura);
      if (ehParede(g0, x, y) || sup.some((s) => s.x === x && s.y === y)) continue;
      const tipo = tipos[Math.floor(r() * tipos.length)];
      sup.push({ x, y, tipo, rodadas: SUPERFICIES[tipo].rodadas });
    }
    for (let x = 0; x < p.largura; x++) for (let y = 0; y < p.altura; y++) {
      if (ehParede(g0, x, y)) continue;
      for (const [dx, dy] of DIRS) {
        const qx = x - dx, qy = y - dy;
        if (qx < 0 || qy < 0 || qx >= p.largura || qy >= p.altura || ehParede(g0, qx, qy)) continue;
        if (r() > 0.35) continue;
        const quem = IARA(qx, qy), alvo = BANDIDO(x, y);
        /* um terceiro corpo atrás, às vezes: o choque contra outro */
        const atras = r() < 0.3 ? [{ ...BANDIDO(x + dx, y + dy), nome: "Goblin" }] : [];
        const entidades = [quem, alvo, ...atras];
        const args = { grade: g0, quem, alvo, entidades, superficies: sup, vistas: [] };
        const prev = previsaoDoEmpurrao(args);
        const real = empurraoNoCenario({ ...args, sorte: rng(hashSemente(`real|${id}|${x}|${y}|${dx}|${dy}`)) });
        casos++;
        if (prev.para.x !== real.para.x || prev.para.y !== real.para.y) { difPara++; primeiro = primeiro || J({ id, x, y, dx, dy, prev, real }); }
        if (prev.dano !== real.dano) { difDano++; primeiro = primeiro || J({ id, x, y, dx, dy, prev, real }); }
        const soma = prev.danos.colisao + prev.danos.queda + prev.danos.reacao + prev.danos.superficie;
        if (soma !== prev.dano) difParcelas++;
        if (prev.queda > 0) comQueda++;
        if (prev.colide) comChoque++;
        if (prev.efeito) comChao++;
        if (prev.objeto) comObjeto++;
        /* e o empurrão de verdade: quando a disputa vence, a casa é a mesma */
        const e = empurrar({ grade: g0, quem, alvo, entidades, sorte: rng(hashSemente(`disputa|${id}|${x}|${y}|${dx}|${dy}`)) });
        if (e.venceu) {
          venceu++;
          const casaReal = e.para || { x: alvo.x, y: alvo.y };
          if (casaReal.x !== prev.para.x || casaReal.y !== prev.para.y) { difReal++; primeiro = primeiro || J({ id, x, y, e, prev }); }
        }
      }
    }
  }
  t(`${casos} empurrões em ${Object.keys(PLANTAS).length} plantas: a casa prevista é a casa do empurrão cumprido`, casos > 2000 && difPara === 0, primeiro);
  t("e o dano previsto é o dano cumprido (o teste do chão só decide a condição, nunca o dano)", difDano === 0, primeiro);
  t("as parcelas (choque, queda, reação, chão) somam o dano", difParcelas === 0);
  t(`nos ${venceu} em que a disputa venceu, \`empurrar\` leva-o à mesma casa`, venceu > 500 && difReal === 0, primeiro);
  t(`a varredura passa pelos quatro casos (queda ${comQueda}, choque ${comChoque}, chão ${comChao}, objeto ${comObjeto})`, comQueda > 0 && comChoque > 0 && comChao > 0 && comObjeto > 0);
}

sec("3. os casos, um a um");
{
  /* a queda: do topo da torre da ruína (dois degraus) para o pátio */
  const ruina = gradeDe("ruina");
  const quedaDois = previsaoDoEmpurrao({ grade: ruina, quem: IARA(2, 13), alvo: BANDIDO(3, 13), entidades: [] });
  t(`do degrau dois para o chão: cai ${quedaDois.queda}, ${quedaDois.dano} de dano, derrubado`, quedaDois.queda === 2 && quedaDois.danos.queda === 5 && quedaDois.derruba === true);
  const quedaReal = empurraoNoCenario({ grade: ruina, quem: IARA(2, 13), alvo: BANDIDO(3, 13), entidades: [], sorte: () => 0.5 });
  t("e o empurrão cumprido deixa-o caído", quedaReal.feridos[0].condicoes.some((c) => c.id === "caido") && quedaReal.dano === 5);
  const quedaUm = previsaoDoEmpurrao({ grade: ruina, quem: IARA(2, 11), alvo: BANDIDO(3, 11), entidades: [] });
  t("de um degrau: 2 de dano, de pé", quedaUm.queda === 1 && quedaUm.dano === 2 && !quedaUm.derruba);
  const subir = previsaoDoEmpurrao({ grade: ruina, quem: IARA(5, 13), alvo: BANDIDO(4, 13), entidades: [] });
  t("empurrado para cima não cai (sobe para o degrau, sem dano)", subir.queda === 0 && subir.dano === 0);
  /* o choque: na parede do balcão da taverna, e contra outro corpo */
  const taverna = gradeDe("taverna");
  const parede = previsaoDoEmpurrao({ grade: taverna, quem: IARA(5, 3), alvo: BANDIDO(5, 2), entidades: [] });
  t("contra o balcão: não sai do lugar, colide com a parede, 1 de dano", parede.casas === 0 && parede.colide === "parede" && parede.colideCom === "parede" && parede.danos.colisao === 1);
  const goblin = { ...BANDIDO(7, 7), nome: "Goblin" };
  const corpo = previsaoDoEmpurrao({ grade: taverna, quem: IARA(5, 7), alvo: BANDIDO(6, 7), entidades: [goblin] });
  t("contra o Goblin: colide com ele, e os dois levam 1", corpo.colide === "Goblin" && corpo.colideCom === "corpo" && corpo.dano === 1 && corpo.outros.some((o) => o.nome === "Goblin" && o.dano === 1));
  const borda = previsaoDoEmpurrao({ grade: taverna, quem: IARA(1, 7), alvo: BANDIDO(0, 7), entidades: [] });
  t("contra a borda: não sai e não fere", borda.casas === 0 && borda.colide === null && borda.dano === 0);
  /* o objeto: o candeeiro da mesa (4,4) e o barril (8,5) */
  const candeeiro = previsaoDoEmpurrao({ grade: taverna, quem: IARA(4, 6), alvo: BANDIDO(4, 5), entidades: [] });
  t(`contra o candeeiro: tomba, acende, e ele entra no fogo (${candeeiro.dano})`, candeeiro.objeto === "candeeiro" && candeeiro.reacoes.includes("tomba") && candeeiro.superficie === "fogo" && candeeiro.efeito === "arde" && candeeiro.danos.superficie === SUPERFICIES.fogo.danoAoEntrar);
  const oleo = [{ x: 4, y: 4, tipo: "oleo", rodadas: 10 }, { x: 4, y: 3, tipo: "oleo", rodadas: 10 }];
  const candOleo = previsaoDoEmpurrao({ grade: taverna, quem: IARA(4, 6), alvo: BANDIDO(4, 5), entidades: [], superficies: oleo });
  t(`o candeeiro em cima do óleo: tomba e explode (${candOleo.danos.reacao} de explosão)`, candOleo.reacoes.join() === "tomba,explode" && candOleo.danos.reacao === 4 && candOleo.superficie === "fogo");
  const barril = previsaoDoEmpurrao({ grade: taverna, quem: IARA(8, 7), alvo: BANDIDO(8, 6), entidades: [] });
  t("contra o barril de óleo: derrama, e ele escorrega (o teste com a chance)", barril.objeto === "barril_de_oleo" && barril.superficie === "oleo" && barril.efeito === "derruba" && barril.teste && barril.teste.cd === 10 && Math.abs(barril.teste.chance - 0.6) < 1e-9);
  const cumprido = empurraoNoCenario({ grade: taverna, quem: IARA(8, 7), alvo: BANDIDO(8, 6), entidades: [], superficies: [], sorte: () => 0 });
  t("cumprido: o barril sai da grade, o óleo fica no chão, e o 1 cai", !cumprido.grade.objetos.some((o) => o.tipo === "barril_de_oleo") && cumprido.superficies.filter((s) => s.tipo === "oleo").length === 9 && cumprido.feridos[0].condicoes.some((c) => c.id === "caido"));
  /* o chão onde pára */
  const fogo = [{ x: 5, y: 8, tipo: "fogo", rodadas: 2 }];
  const praFogo = previsaoDoEmpurrao({ grade: taverna, quem: IARA(5, 6), alvo: BANDIDO(5, 7), entidades: [], superficies: fogo });
  t("para o fogo: arde 3 ao entrar", praFogo.superficie === "fogo" && praFogo.efeito === "arde" && praFogo.dano === 3);
  const eletr = [{ x: 5, y: 8, tipo: "eletrica", rodadas: 1 }];
  const praAgua = previsaoDoEmpurrao({ grade: taverna, quem: IARA(5, 6), alvo: BANDIDO(5, 7), entidades: [], superficies: eletr });
  t("para a água eletrificada: 3 de raio, e atordoa quem falhar", praAgua.dano === 3 && praAgua.efeito === "atordoa" && praAgua.teste.falha === "atordoado");
  const parado = previsaoDoEmpurrao({ grade: taverna, quem: IARA(5, 3), alvo: BANDIDO(5, 2), entidades: [], superficies: [{ x: 5, y: 2, tipo: "fogo", rodadas: 2 }] });
  t("quem não sai do lugar não «entra» no fogo onde já estava", parado.danos.superficie === 0 && parado.efeito === null);
  t("os objetos que tombam ao empurrão dizem-no nas etiquetas", Object.values(OBJETOS_DO_CENARIO).every((o) => !o.aoEmpurrao || o.etiquetas.includes(o.aoEmpurrao.tipo)));
}

sec("4. a chance da disputa é a do dado");
{
  const quem = IARA(4, 6), alvo = BANDIDO(4, 5);
  const prev = previsaoDoEmpurrao({ grade: gradeDe("taverna"), quem, alvo, entidades: [] });
  let v = 0;
  const N = 6000;
  for (let i = 0; i < N; i++) if (empurrar({ grade: gradeDe("taverna"), quem, alvo, entidades: [], sorte: rng(hashSemente("chance|" + i)) }).venceu) v++;
  t(`dita ${(prev.chance * 100).toFixed(1)}%, rolada ${(v / N * 100).toFixed(1)}% (±2 pp)`, Math.abs(prev.chance - v / N) <= 0.02);
  const gigante = { nome: "Gigante", tamanho: "enorme", x: 4, y: 5, vida: 90 };
  t("quem não se pode empurrar: a chance é nula", previsaoDoEmpurrao({ grade: gradeDe("taverna"), quem, alvo: gigante, entidades: [] }).chance === null);
}

sec("5. o lixo, e nada mutado");
{
  let ok = true;
  for (const lixo of [null, undefined, {}, [], 3, "x", { quem: {}, alvo: {} }]) {
    try { if (previsaoDoEmpurrao(lixo) !== null || empurraoNoCenario(lixo) !== null) ok = false; } catch (e) { ok = false; console.log(e); }
  }
  t("lixo dá null, e nunca estoura", ok);
  const g = gradeDe("taverna");
  const copia = J(g);
  const sup = [{ x: 4, y: 4, tipo: "oleo", rodadas: 10 }];
  const supCopia = J(sup);
  const alvo = BANDIDO(4, 5);
  empurraoNoCenario({ grade: g, quem: IARA(4, 6), alvo, entidades: [alvo], superficies: sup, sorte: () => 0.2 });
  t("a grade, o chão e o alvo que entraram saem iguais", J(g) === copia && J(sup) === supCopia && alvo.x === 4 && alvo.y === 5);
  const sem = previsaoDoEmpurrao({ grade: null, quem: IARA(4, 6), alvo: BANDIDO(4, 5), entidades: [] });
  t("sem grade: anda uma casa, sem queda, sem chão (o empurrão de antes)", sem.casas === 1 && sem.queda === 0 && sem.superficie === null && sem.dano === 0);
}

console.log(`\no cenário que se usa: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
