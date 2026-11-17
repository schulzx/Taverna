/* teste-perigo-a-porta.mjs — S7b (17/11/2026): o perigo dito à porta é o da porta.

   Na sessão de 15/11 (mente/lancamento/analise-jogo.md, §6) um lugar marcado
   «DIFÍCIL… é onde se morre (4.5×)» deu uma primeira luta de 2 rodadas com 0
   de dano, e a pauta do mesmo lugar dizia «perigo médio — Zumbi (nv 2),
   Bandido (nv 2)». O veredito media a masmorra inteira, o chefe incluído, e o
   jogador lia-o como a primeira sala.

     1. a porta: o nível do primeiro encontro provável (a ficha; o bestiário);
     2. o veredito diz as duas pela mesma conta («À porta: … No fundo: …»), e o
        fundo é o de sempre (o selo e o que o Narrador governa não mudam);
     3. o caso de 15/11;
     4. a fiação: o cartão do lugar (partida.js), a boca no App e a pauta
        (masmorra-sem-cidade.js#linhaDaFicha) leem a MESMA função;
     5. CATRACA: em 1000 masmorras por semente, o primeiro encontro da planta
        cai na faixa anunciada «à porta» em ≥ 80 % — e a distribuição (quantas
        «difíceis» têm porta trivial) é medida, não reequilibrada. */
import { readFileSync } from "node:fs";
import { PERIGO_A_PORTA, osNiveisDaPorta, vereditoDaMasmorra } from "../src/boca.js";
import { avaliar, estadoNaPorta, dificuldadeDaMasmorra } from "../src/dificuldade.js";
import { gerarMasmorra, bichosDaFicha } from "../src/masmorras.js";
import { criaturasDoGenero } from "../src/bestiario.js";
import { rngDe } from "../src/geografia.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log(`  ✓ ${nome}`); } else { mal++; console.log(`  ✗ ${nome}${extra ? `\n      ${extra}` : ""}`); } };
const sec = (s) => console.log(`\n${s}`);
const J = (x) => JSON.stringify(x);
const GEN = "Fantasia medieval";

sec("1. a porta: a distribuição do nível do primeiro encontro");
{
  const soma = (d) => Math.round(d.reduce((x, y) => x + y.p, 0) * 1e9) / 1e9;
  const ficha = [{ nome: "Zumbi", nivel: 2 }, { nome: "Bandido", nivel: 2 }, { nome: "Necromante", ameaca: "elite", nivel: 8 }];
  const d1 = osNiveisDaPorta({ nivel: 6 }, { quem: ficha });
  t("com a ficha: os não chefes vão à roda antes do chefe — a primeira sala é deles", J(d1) === J([{ nivel: 2, p: 1 }]), J(d1));
  const d2 = osNiveisDaPorta({ nivel: 6 }, { quem: [{ nome: "Zumbi", nivel: 2 }, { nome: "Necromante", ameaca: "elite", nivel: 8 }] });
  t("um não chefe só: com dois bichos na sala, o chefe já está nela (metade das vezes)", J(d2) === J([{ nivel: 2, p: 1 - PERIGO_A_PORTA.pDoSegundo }, { nivel: 8, p: PERIGO_A_PORTA.pDoSegundo }]), J(d2));
  t("o bicho da ficha sem nível pesa pelo degrau da ameaça", osNiveisDaPorta({ nivel: 9 }, { quem: [{ nome: "Coisa Sem Nome", ameaca: "competente" }, { nome: "Outra Coisa", ameaca: "competente" }, { nome: "Rei Sombrio", ameaca: "lendario" }] })[0].nivel === PERIGO_A_PORTA.semNivel.competente);
  const d3 = osNiveisDaPorta({ nivel: 8 }, { genero: GEN });
  t("sem ficha: a distribuição do bestiário soma 1 e nunca passa de nível + folga", soma(d3) === 1 && d3.every((x) => x.nivel <= 8 + PERIGO_A_PORTA.folga), J(d3));
  t("sem nível, não se opina ([]); lixo não estoura", J(osNiveisDaPorta(null)) === "[]" && J(osNiveisDaPorta({ nivel: 0 })) === "[]" && J(osNiveisDaPorta({ nivel: "x" })) === "[]");
}

sec("2. o veredito diz as duas, pela mesma conta");
{
  const heroi = { nome: "Vera", nivel: 3 };
  const mm = { nome: "Cripta das Raízes", nivel: 6, salas: 9 };
  const ficha = [{ nome: "Zumbi", nivel: 2 }, { nome: "Bandido", nivel: 2 }, { nome: "Necromante", ameaca: "elite", nivel: 8 }];
  const v = vereditoDaMasmorra(mm, heroi, { quem: ficha });
  t("o fundo é o de sempre (dificuldadeDaMasmorra): o selo não muda", J(v.dif) === J(dificuldadeDaMasmorra(mm, heroi)) && v.fundo === v.dif);
  const a2 = avaliar({ nivel: 2, tamanho: 0, rotulo: mm.nome }, heroi, estadoNaPorta(heroi, mm));
  t("a porta é `avaliar` com o nível do primeiro encontro (um patamar só: cobre tudo)", v.porta.patamar.id === a2.patamar.id && v.porta.de === v.porta.ate && v.porta.cobre === 1 && v.porta.porque === a2.porque, J(v.porta));
  t("a linha diz «À porta: …. No fundo: ….» em palavras", v.linha.includes(`${PERIGO_A_PORTA.porta}: ${v.porta.porque}.`) && v.linha.includes(`${PERIGO_A_PORTA.fundo}: ${v.dif.porque}.`), v.linha);
  t("sem herói, sem veredito (como sempre)", vereditoDaMasmorra(mm, null) === null);
  console.log(`      ${v.linha}`);
}

sec("3. o caso de 15/11 — «DIFÍCIL… é onde se morre» e a primeira luta trivial");
{
  /* a heroína da sessão (nível 1, sem grupo) diante de um lugar de nível 6
     cuja ficha diz Zumbi e Bandido de nível 2 */
  const v = vereditoDaMasmorra({ nome: "Fosso dos Afogados", nivel: 6, salas: 8 }, { nome: "Hilde", nivel: 1 }, { quem: [{ nome: "Zumbi", nivel: 2 }, { nome: "Bandido", nivel: 2 }, { nome: "Carniçal Antigo", ameaca: "elite", nivel: 6 }] });
  const dg = (id) => ["facil", "medio", "dificil", "impossivel"].indexOf(id);
  /* com a ficha mínima (sem equipamento) um zumbi de nível 2 ainda pesa para
     uma heroína de nível 1; o que a porta corrige é a DISTÂNCIA: o fundo é
     mais de duas vezes o que a porta pede, e a linha passa a dizê-lo */
  t("no fundo o lugar continua acima dela, e à porta a distância é outra (a linha diz as duas)", dg(v.dif.patamar.id) >= dg("dificil") && v.porta.razao > v.dif.razao * 2 && v.linha.includes(PERIGO_A_PORTA.porta) && v.linha.includes(PERIGO_A_PORTA.fundo), `${v.porta.razao} / ${v.dif.razao}`);
  console.log(`      ${v.linha}`);
}

sec("4. a fiação: o cartão, a boca e a pauta leem a mesma função");
{
  const partida = readFileSync(new URL("../src/partida.js", import.meta.url), "utf8");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const msc = readFileSync(new URL("../src/masmorra-sem-cidade.js", import.meta.url), "utf8");
  const pauta = readFileSync(new URL("../src/motor/pauta-do-turno.js", import.meta.url), "utf8");
  t("o cartão do lugar (partida.js): a ficha entra, e o porquê diz À porta e No fundo", /vereditoDaMasmorra\(m, pers, \{ mapa \}\)/.test(partida) && /PERIGO_A_PORTA\.porta\}: \$\{v\.porta\.porque\}\. \$\{PERIGO_A_PORTA\.fundo\}/.test(partida));
  t("a boca no App: a ficha do lugar entra no veredito da entrada", /vereditoDaMasmorra\(doMapa \|\| mm, \{ \.\.\.persIn, suprimentos: supIn \}, \{ mapa: mapaRef\.current/.test(app) && /chegadaABoca\(ida\.masmorra, \{[^}]*mapa: mapaRef\.current \}\)/.test(app) && /aBoca: !!boca, mapa: mapaRef\.current/.test(app));
  t("a pauta: a linha da ficha lê o mesmo veredito (com o herói)", /vereditoDaMasmorra\(masmorra, pers, \{ quem: f\.quem, mapa \}\)/.test(msc) && /linhaDaFicha\(\$ref\.mapa, \$ref\.masmorra, \{ luta: !!\$ref\.combate, pers: fichaViva\(\) \}\)/.test(pauta));
}

sec("5. CATRACA — 1000 masmorras por semente: o primeiro encontro cai na faixa da porta");
{
  const bestiario = criaturasDoGenero(GEN);
  const nivelDe = (nome, ficha) => {
    const f = bichosDaFicha(ficha).find((b) => b.nome === nome);
    if (f && f.nivel != null) return f.nivel;
    if (f) return PERIGO_A_PORTA.semNivel[f.ameaca] || 1;
    const b = bestiario.find((c) => c.nome === nome);
    return b ? b.nivelRef || 1 : null;
  };
  const N = 1000;
  let cai = 0, comFicha = 0, larga = 0;
  const tabela = {};
  const faixas = ["facil", "medio", "dificil", "impossivel"];
  for (const f of faixas) tabela[f] = Object.fromEntries(faixas.map((g) => [g, 0]));
  for (let i = 0; i < N; i++) {
    const r = rngDe(`porta-da-masmorra|${i}`);
    const nivel = 1 + Math.floor(r() * 16);
    const salas = 5 + Math.floor(r() * 8);
    const heroi = { nome: "Prova", nivel: Math.max(1, nivel - 6 + Math.floor(r() * 10)) };
    /* metade com a ficha do lugar: dois ou três bichos que cabem no nível, e um forte */
    let quem = null;
    if (r() < 0.5) {
      comFicha++;
      const cabem = bestiario.filter((c) => (c.nivelRef || 1) <= nivel + PERIGO_A_PORTA.folga);
      const fortes = bestiario.filter((c) => c.ameaca === "elite" || c.ameaca === "lendario");
      const k = 2 + Math.floor(r() * 2);
      quem = Array.from({ length: k - 1 }, () => cabem[Math.floor(r() * cabem.length)]).concat([fortes[Math.floor(r() * fortes.length)]]).map((c) => ({ nome: c.nome, ameaca: c.ameaca, nivel: c.nivelRef }));
    }
    const mm = { nome: `Masmorra ${i}`, nivel, salas };
    const v = vereditoDaMasmorra(mm, heroi, { quem, genero: GEN });
    const planta = gerarMasmorra(GEN, nivel, mm.nome, { salas, quem, sorte: rngDe(`planta|${i}`) });
    /* o primeiro encontro: a primeira sala de luta pela ordem das camadas */
    const sala = [...planta.salas].filter((s) => s.tipo !== "chefe" && Array.isArray(s.inimigos) && s.inimigos.length).sort((a, b) => a.camada - b.camada || a.id - b.id)[0]
      || planta.salas.find((s) => s.tipo === "chefe");
    const nv = Math.max(...sala.inimigos.map((x) => nivelDe(x.nome, quem) || nivel));
    const real = avaliar({ nivel: nv, tamanho: 0, rotulo: mm.nome }, heroi, estadoNaPorta(heroi, mm)).patamar.id;
    const faixas0 = ["facil", "medio", "dificil", "impossivel"];
    if (faixas0.indexOf(real) >= faixas0.indexOf(v.porta.de) && faixas0.indexOf(real) <= faixas0.indexOf(v.porta.ate)) cai++;
    if (v.porta.de !== v.porta.ate) larga++;
    tabela[v.dif.patamar.id][v.porta.patamar.id]++;
  }
  const pct = Math.round((cai / N) * 1000) / 10;
  console.log(`      ${N} masmorras (${comFicha} com ficha): o primeiro encontro na faixa anunciada à porta em ${cai} (${pct} %); faixa de dois patamares em ${larga}`);
  console.log("      no fundo → à porta: " + faixas.map((f) => `${f}: ${faixas.map((g) => `${g} ${tabela[f][g]}`).join(", ")}`).join(" | "));
  const dificeis = tabela.dificil.facil + tabela.dificil.medio + tabela.dificil.dificil + tabela.dificil.impossivel;
  console.log(`      «difíceis» no fundo: ${dificeis}; com a porta fácil (trivial): ${tabela.dificil.facil}; com a porta média: ${tabela.dificil.medio}`);
  t(`CATRACA: em ${N} masmorras, o primeiro encontro cai na faixa «à porta» em ≥ 80 % (${pct} %)`, cai / N >= 0.8);
}

console.log(`\no perigo à porta (S7b): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
