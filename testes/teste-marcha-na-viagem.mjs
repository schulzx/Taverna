/* A MARCHA ÚNICA NA VIAGEM (v9.371 · a marcha única, a fiação)

   A v9.364 fez UMA conta para a hora de marcha (`src/marcha.js`): a jornada,
   a ficha, o Geógrafo e o mapa vivo passaram a dizer o mesmo número, e
   nenhuma viagem dentro da região passava da promessa (`PROMESSA_DA_REGIAO`,
   regiao.js: 8 h da base, 16 h de ponta a ponta). Mas a ida a uma POVOAÇÃO
   ainda nascia, no `viajar` do App, do `abrirViagem` antigo com a rota de
   `mapa.rotas` — ou com o piso de três dias, quando não havia estrada. A
   ficha dizia três horas e o jogo cobrava vinte e quatro.

   Esta suíte lê o App e mede o que ELE abre:

     1. a fiação: o import, o lugar de partida guardado antes de limpar, a
        conta única em try/calou, o mapa sem região de fora, e a ordem
        `jIda || jM.jornada || abrirViagem`;
     2. N regiões semeadas: as discordâncias contra a jornada e as viagens
        além da promessa, com a jornada que o App abre (antes → depois);
     3. o mapa sem `regiao` (todo save de antes da MM17): a conta única
        devolve null, e a jornada é a de `abrirViagem`, byte a byte;
     4. a partida da boca de um lugar: a jornada sai do registo (a cidade) e
        leva o percurso.

   FALHA ANTES (HEAD v9.370): o App não importa `partidaNaRegiao`, e a medida
   com a jornada que ele abre dá 1.984 pares em que uma conta discorda dela e
   858 viagens além da promessa (as 858 povoações sem estrada, no piso de três
   dias), em 200 mundos. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as MA from "../src/marcha.js";
import * as R from "../src/regiao.js";
import * as VI from "../src/viagem.js";
import { gerarGeografia } from "../src/geografia.js";
import { moldePorId } from "../src/moldes.js";
import { ESTRUTURAS } from "../src/historia.js";
import { sementeDe, generoDe, medirMarcha } from "./medir-regiao.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
const N = 200;

/* ============================================================ */
sec("1. a fiação no viajar do App");
const app = tenta(() => readFileSync(join(AQUI, "..", "src", "App.jsx"), "utf8"), "");
const ini = app.indexOf("const viajar = (destino = \"\", opcoes = null) => {");
const corpo = ini >= 0 ? app.slice(ini, app.indexOf("\n  };\n", ini)) : "";
const F = {
  importa: /import \{[^}]*\bpartidaNaRegiao\b[^}]*\} from "\.\/marcha\.js";/.test(app),
  guarda: /const lugarDaPartida = lugarRef\.current;\s*if \(lugarRef\.current\) \{ lugarRef\.current = null; setLugar\(null\); \}/.test(corpo),
  regiao: /if \(!\(opcoes && opcoes\.ida\) && mapaRef\.current && mapaRef\.current\.regiao\) \{/.test(corpo),
  calou: /try \{\s*jM = partidaNaRegiao\(mapaRef\.current, \{ cidadeAtual: cidadeAtualRef\.current, lugar: lugarDaPartida, destino: alvo, dia: diaRef\.current \}\);[\s\S]{0,200}\} catch \(e\) \{ calou\("partida na região", e\); jM = null; \}/.test(corpo),
  linhas: /jM\.linhas\.map\(\(texto\) => \(\{ autor: "sistema", texto \}\)\)/.test(corpo),
  ordem: /jornadaRef\.current = jIda \|\| \(jM && jM\.jornada\) \|\| abrirViagem\(\{/.test(corpo),
};
t("o viajar existe e foi lido", corpo.length > 1000);
t("o App importa partidaNaRegiao de marcha.js", F.importa);
t("o lugar de partida é guardado ANTES de o viajar o limpar", F.guarda);
t("a conta única só entra com região e fora da ida a uma boca", F.regiao);
t("e corre em try, com calou e a queda para null", F.calou);
t("a linha de antes de partir vai ao jogador como linha do sistema", F.linhas);
t("a jornada: a da boca, senão a da conta única, senão a de sempre", F.ordem);
const fiado = Object.values(F).every(Boolean);

/* ============================================================ */
sec(`2. ${N} regiões — a jornada que o App abre contra a ficha, o Geógrafo e o mapa vivo`);
/* `semViajar` é a jornada de antes (`abrirViagem` com a rota de
   `mapa.rotas`); sem ele, a de `partidaNaRegiao`. O App decide qual: a
   medida segue a fiação lida acima, e não uma suposição sobre ela. */
const SRC = join(AQUI, "..", "src");
const antes = await medirMarcha(SRC, N, { semViajar: true });
const agora = await medirMarcha(SRC, N, { semViajar: !fiado });
console.log(`      sem a fiação: ${antes.discord} discordâncias · ${antes.alemDaPromessa} além da promessa · ${antes.piso3dias} no piso de três dias`);
console.log(`      o App de agora: ${agora.discord} discordâncias · ${agora.alemDaPromessa} além da promessa · ${agora.piso3dias} no piso de três dias · ${agora.desvios} pelas povoações`);
t(`sem a fiação, a medida mostra o defeito (${antes.discord} discordâncias, ${antes.alemDaPromessa} além da promessa)`, antes.discord > 1000 && antes.alemDaPromessa > 500);
t(`a jornada tem hora para todos os pares (${agora.contas.jornada.length}/${agora.pares})`, agora.contas.jornada.length === agora.pares);
t(`nenhuma conta discorda da jornada que o App abre (${agora.discord}; sem a fiação ${antes.discord})`, agora.discord === 0, JSON.stringify(agora.exemplo));
t(`nenhuma viagem além da promessa (${agora.alemDaPromessa}; sem a fiação ${antes.alemDaPromessa})`, agora.alemDaPromessa === 0);
t(`nenhuma povoação no piso de três dias (${agora.piso3dias}; sem a fiação ${antes.piso3dias})`, agora.piso3dias === 0);

/* ============================================================ */
sec("3. o mapa sem região (o save de antes da MM17) — a viagem de sempre");
{
  let pares = 0, iguais = 0, nulos = 0;
  for (let i = 0; i < 12; i++) {
    const mapa = gerarGeografia(sementeDe(i), moldePorId("sobremundo"));
    const cs = (mapa && mapa.cidades) || [];
    for (let a = 0; a < Math.min(cs.length, 6); a++) for (let b = 0; b < Math.min(cs.length, 6); b++) {
      if (a === b) continue;
      pares++;
      const p = MA.partidaNaRegiao(mapa, { cidadeAtual: cs[a].nome, lugar: null, destino: cs[b].nome, dia: 3 });
      if (p === null) nulos++;
      const rt = (mapa.rotas || []).find((x) => (x.de === cs[a].nome && x.para === cs[b].nome) || (x.de === cs[b].nome && x.para === cs[a].nome)) || null;
      const viaApp = (p && p.jornada) || VI.abrirViagem({ de: cs[a].nome, para: cs[b].nome, dia: 3, rota: rt });
      if (JSON.stringify(viaApp) === JSON.stringify(VI.abrirViagem({ de: cs[a].nome, para: cs[b].nome, dia: 3, rota: rt }))) iguais++;
    }
  }
  t(`o continente não tem região (${pares} partidas medidas)`, pares > 100);
  t(`a conta única cala em todas (${nulos}/${pares})`, nulos === pares);
  t(`e a jornada é a de sempre, byte a byte (${iguais}/${pares})`, iguais === pares);
  t("lixo no mapa não estoura", [null, undefined, {}, { regiao: null }, { regiao: 7 }].every((m) => tenta(() => MA.partidaNaRegiao(m, { destino: "x" }), "estourou") === null));
}

/* ============================================================ */
sec("4. a partida da boca de um lugar");
{
  let medidas = 0, doRegisto = 0, comPercurso = 0, naPromessa = 0;
  for (let i = 0; i < 30; i++) {
    const mapa = R.mapaDaCampanhaNova(R.mapaDaCriacao({ semente: sementeDe(i), molde: moldePorId("sobremundo"), genero: generoDe(i), estrutura: ESTRUTURAS[i % ESTRUTURAS.length].id, modo: "historia" }));
    if (!mapa || !mapa.regiao) continue;
    const base = mapa.cidades[0];
    for (const l of mapa.regiao.lugares) for (const c of mapa.cidades.slice(1)) {
      const lugar = { nome: l.nome, coord: { x: l.x, y: l.y }, distancia: "perto", cidade: base.nome };
      const p = MA.partidaNaRegiao(mapa, { cidadeAtual: base.nome, lugar, destino: c.nome, dia: 2 });
      if (!p) continue;
      medidas++;
      if (p.jornada.de === base.nome && p.jornada.para === c.nome && p.jornada.desde === 2) doRegisto++;
      if (Array.isArray(p.jornada.percurso) && p.jornada.percurso.length >= 2 && p.jornada.percurso[0].nome === l.nome) comPercurso++;
      if (p.jornada.totalMin / 60 <= R.PROMESSA_DA_REGIAO.pontaAPonta + 1e-6) naPromessa++;
    }
  }
  t(`há partidas de uma boca a uma povoação (${medidas})`, medidas > 300);
  t(`a jornada sai do registo, a cidade (${doRegisto}/${medidas}) — é ela que a jornada válida confere`, doRegisto === medidas);
  t(`e anda a partir da boca, pelo percurso (${comPercurso}/${medidas})`, comPercurso === medidas);
  t(`e cabe na promessa (${naPromessa}/${medidas})`, naPromessa === medidas);
}

console.log(`\n${ok} ok · ${mal} falha(s)`);
process.exit(mal ? 1 : 0);
