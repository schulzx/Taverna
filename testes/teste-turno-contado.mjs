/* teste-turno-contado.mjs (CB12, Fase CB lote 2, 10/11/2026) — o turno deles, contado em passos

   A planta (§3.7) e formas.md §CB 17.2/17.5: o turno dos inimigos deixa de
   ser uma rajada sem rasto e passa a ser contado por quem age — o caminho, o
   d20 separado do total, o evento do golpe, as faces que salvam —, com o
   teto de 4 s. A regra que não se negocia: CONTAR É SÓ LEITURA. O estado da
   rajada é o de hoje, e a lista de passos, lida por ordem, chega à mesma
   vida de cada um que a rajada deixou. Prova-se em 400 mesas sorteadas, com
   o motor de verdade (posicionar, a intenção, moverInimigos,
   turnoDosInimigos, turnoDosCompanheiros). */
import { passosDoTurno, duracaoDosPassos, golpeDaHabilidade, TIPO_DO_ALIADO } from "../src/turno-contado.js";
import { montarGrade, posicionar, moverInimigos } from "../src/grid.js";
import { turnoDosInimigos, turnoDosCompanheiros, resolverAtaque, RECURSO_DA_INTENCAO } from "../src/combate.js";
import { completarInimigo } from "../src/bestiario.js";
import { intencoesDaRodada } from "../src/intencao.js";
import { facesQueAcertam } from "../src/previsao.js";
import { somaDoGolpe } from "../src/batalha-na-tela.js";
import { rng, hashSemente } from "../src/semente.js";

let bons = 0, maus = 0;
const t = (nome, cond, extra = "") => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? "  — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = (x) => JSON.stringify(x);

/* os números da forma (formas.md §CB 17.3, TURNO_DELES) — a tabela vive em
   estilo.js, do `aprendiz`; aqui entram por argumento, como no App */
const TURNO_DELES = { teto: 4000, pisoDoPasso: 250, realce: 120, porCasa: 60, andarTeto: 300, soproPinta: 200, respiro: 120, fim: 200, acelerado: 0.5, reduzido: { passo: 400 } };

/* uma mesa do motor, como o App a corre (resolverRevide): intenção, passo,
   golpes; a reação e o abrigo não entram (a régua não os tem), e a vida
   aplica-se pela ordem das ações, como o laço do App */
const CRIATURAS = [["Bandido", "comum"], ["Lobo", "fraco"], ["Orc", "competente"], ["Ogro", "elite"], ["Atirador", "comum"]];
function umaMesa(i) {
  const r = rng(hashSemente("turno-contado|" + i));
  const grade = montarGrade({});
  const nv = 1 + Math.floor(r() * 6);
  const pers = { nome: "Bran", classe: "Guerreiro", nivel: nv, vida: 20 + nv * 6, vidaMax: 20 + nv * 6, atributos: { forca: 3, destreza: 1, vigor: 2 }, condicoes: [], equipados: {},
    grupo: [{ nome: "Quorin", classe: "Clérigo", nivel: nv, vida: 18 + nv * 4, vidaMax: 18 + nv * 4, mana: 20, atributos: { presenca: 2 }, condicoes: [], habilidades: [] }] };
  const n = 1 + Math.floor(r() * 4);
  const [base, ameaca] = CRIATURAS[Math.floor(r() * CRIATURAS.length)];
  const crus = Array.from({ length: n }, (_, k) => ({ ...completarInimigo({ nome: `${base} ${k + 1}`, ameaca, nivel: nv }, nv), derrotado: false, condicoes: [] }));
  const p = posicionar(grade, { heroi: { nome: pers.nome }, grupo: pers.grupo.map((g) => ({ nome: g.nome, vida: g.vida, vidaMax: g.vidaMax })), inimigos: crus, situacao: "cena", sorte: rng(hashSemente("abre|" + i)) });
  const comb = { inimigos: p.inimigos, grade, heroi: p.heroi, aliados: p.grupo, rodada: 1 };
  const ints = intencoesDaRodada(comb, { jogador: pers, grupo: pers.grupo, sorte: rng(hashSemente("int|" + i)) });
  const mv = moverInimigos(grade, p.inimigos, p.heroi, [p.heroi, ...p.grupo]);
  const acoes = turnoDosInimigos({ sorte: rng(hashSemente("ini|" + i)), inimigos: mv.inimigos, jogador: pers, grupo: pers.grupo, grade, heroi: p.heroi, aliados: p.grupo, rodada: 1, intencoes: ints });
  const vidas = { [pers.nome]: pers.vida, ...Object.fromEntries(pers.grupo.map((g) => [g.nome, g.vida])), ...Object.fromEntries(mv.inimigos.map((e) => [e.nome, e.vida])) };
  const vidaMax = { [pers.nome]: pers.vidaMax, ...Object.fromEntries(pers.grupo.map((g) => [g.nome, g.vidaMax])), ...Object.fromEntries(mv.inimigos.map((e) => [e.nome, e.vidaMax])) };
  /* a rajada de hoje: a vida pela ordem das ações */
  const rajada = { ...vidas };
  for (const a of acoes) if (!a.perdido && a.r) rajada[a.alvoNome] = Math.max(0, (rajada[a.alvoNome] || 0) - Math.max(0, a.r.dano || 0));
  const grupoDepois = pers.grupo.map((g) => ({ ...g, vida: rajada[g.nome] }));
  const inimDepois = mv.inimigos.map((e) => ({ ...e, vida: rajada[e.nome], derrotado: rajada[e.nome] <= 0 }));
  const comps = turnoDosCompanheiros({ grupo: grupoDepois, inimigos: inimDepois, jogadorNome: pers.nome, jogador: { ...pers, vida: rajada[pers.nome] }, rodada: 1 });
  for (const a of comps) {
    if ((a.tipo === "ataque" || a.tipo === "habilidade") && a.r && a.alvoNome) rajada[a.alvoNome] = Math.max(0, (rajada[a.alvoNome] || 0) - Math.max(0, a.r.dano || 0));
    if (a.tipo === "cura" && a.alvo) rajada[a.alvo] = Math.min(vidaMax[a.alvo], (rajada[a.alvo] || 0) + (a.valor || 0));
  }
  const ctx = { antes: p.inimigos, depois: mv.inimigos, aliadosAntes: p.grupo, aliadosDepois: p.grupo, grade, heroi: pers.nome, intencoes: ints.lista, vidas, vidaMax, companheiros: comps };
  return { acoes, ctx, rajada, vidas, ints, comps, inimigos: p.inimigos };
}
/* a vida de cada um no fim, lida dos passos por ordem (o último evento de cada alvo, e a cura) */
function vidaPelosPassos(passos, vidas, vidaMax) {
  const v = { ...vidas };
  for (const p of passos) {
    for (const g of p.golpes) if (g.evento && g.evento.vidaDepois != null) v[g.alvo] = g.evento.vidaDepois;
    if (p.cura && v[p.cura.alvo] != null) v[p.cura.alvo] = Math.min(vidaMax[p.cura.alvo], v[p.cura.alvo] + p.cura.valor);
  }
  return v;
}

sec("1. CONTAR É SÓ LEITURA — os passos chegam à vida que a rajada deixou");
{
  const N = 400;
  let iguais = 0, golpesIguais = 0, porQuem = 0, ordem = 0, dados = 0, comAndar = 0, comCaminhoCerto = 0, intencoes = 0, mesmo = 0, comGrupo = 0;
  for (let i = 0; i < N; i++) {
    const m = umaMesa(i);
    const passos = passosDoTurno(m.acoes, m.ctx);
    if (J(vidaPelosPassos(passos, m.vidas, m.ctx.vidaMax)) === J(m.rajada)) iguais++;
    const nGolpesInim = m.acoes.filter((a) => !a.perdido && a.r).length;
    if (passos.filter((p) => p.lado === "inimigo").reduce((s, p) => s + p.golpes.length, 0) === nGolpesInim) golpesIguais++;
    const quem = passos.map((p) => p.quem);
    if (new Set(quem).size === quem.length) porQuem++;
    const ordemInim = passos.filter((p) => p.lado === "inimigo").map((p) => m.inimigos.findIndex((e) => e.nome === p.quem));
    if (ordemInim.every((x, k) => k === 0 || x > ordemInim[k - 1]) && passos.findIndex((p) => p.lado === "aliado") === -1 || passos.slice(passos.findIndex((p) => p.lado === "aliado")).every((p) => p.lado === "aliado")) ordem++;
    const gs = passos.flatMap((p) => p.golpes);
    if (gs.every((g) => !g.dado || (g.dado.natural >= 1 && g.dado.natural <= 20 && J(g.acertam) === J(facesQueAcertam(g.dado.bonus, g.dado.defesa, 20)) && g.acertam.length + g.salvam.length === 20 && g.salvam.every((f) => !g.acertam.includes(f))))) dados++;
    for (const p of passos.filter((x) => x.caminho.length)) {
      comAndar++;
      const fim = p.caminho[p.caminho.length - 1], ini = p.caminho[0];
      const passosOk = p.caminho.every((q, k) => k === 0 || Math.max(Math.abs(q.x - p.caminho[k - 1].x), Math.abs(q.y - p.caminho[k - 1].y)) === 1);
      if (J(ini) === J(p.de) && J(fim) === J(p.para) && passosOk) comCaminhoCerto++;
    }
    if (passos.filter((p) => p.lado === "inimigo" && p.intencao != null).every((p) => p.intencao === "cumprida" || Object.values(RECURSO_DA_INTENCAO).includes(p.intencao))) intencoes++;
    if (J(passosDoTurno(m.acoes, m.ctx)) === J(passos)) mesmo++;
    if (passos.some((p) => p.lado === "aliado")) comGrupo++;
  }
  t(`a vida de cada um no fim dos passos é a que a rajada deixou, em ${iguais} de ${N} mesas`, iguais === N);
  t(`todo golpe dos inimigos está num passo, e só uma vez (${golpesIguais}/${N})`, golpesIguais === N);
  t(`um passo por quem age (${porQuem}/${N})`, porQuem === N);
  t(`a ordem é a em que o motor jogou: os inimigos pela lista da luta, e o grupo depois (${ordem}/${N})`, ordem === N);
  t(`o d20 vem separado do total, com as faces que acertam e as que salvam (as 20, sem se cruzarem) (${dados}/${N})`, dados === N);
  t(`quem anda traz o caminho, casa a casa, da casa de onde veio à de onde ficou (${comCaminhoCerto} de ${comAndar})`, comAndar > 50 && comCaminhoCerto === comAndar);
  t(`a intenção do passo é «cumprida» ou um recurso da tabela (${intencoes}/${N})`, intencoes === N);
  t("determinístico: os mesmos dados dão os mesmos passos", mesmo === N);
  t(`o grupo entra na mesma lista (${comGrupo} mesas com o passo do Quorin)`, comGrupo > N / 2);
}

sec("2. AS FORMAS DO PASSO — a fuga, o sopro vazio, quem caiu antes, o aliado");
{
  const heroi = { nome: "Bran", x: 5, y: 5 };
  const r = (d20, dano) => resolverAtaque({ atacante: "Herói", alvo: { nome: "Lobo 1", vida: 4, defesa: 10 }, ehAtacanteInimigo: false, bonusAtaque: 3, danoBase: dano, rolar: () => (d20 - 1) / 20 });
  const fuga = passosDoTurno([], { antes: [{ nome: "Lobo 1", x: 6, y: 5, vida: 4, vidaMax: 4 }], fugas: [{ nome: "Lobo 1", r: r(15, 3), morreu: false }], vidas: { "Lobo 1": 4 }, vidaMax: { "Lobo 1": 4 }, heroi: "Bran" });
  t("quem foge tem o passo dele, com o golpe livre do herói como evento", fuga.length === 1 && fuga[0].tipo === "fugir" && fuga[0].golpes.length === 1 && fuga[0].golpes[0].evento.lado === "heroi" && fuga[0].golpes[0].evento.vidaDepois === 1);
  const sopro = passosDoTurno([], { antes: [{ nome: "Dragão Jovem", x: 1, y: 1, vida: 50 }], depois: [{ nome: "Dragão Jovem", x: 1, y: 1, vida: 50 }], intencoes: [{ inimigo: "Dragão Jovem", tipo: "sopro", area: [{ x: 2, y: 2 }, { x: 3, y: 3 }], vista: { tipo: "sopro", alvo: "Bran", abate: 0.2 } }], heroi: "Bran" });
  t("o sopro que não apanhou ninguém diz-se «perdido», com a área", sopro.length === 1 && sopro[0].tipo === "sopro" && sopro[0].intencao === RECURSO_DA_INTENCAO.soproVazio && sopro[0].area.length === 2 && sopro[0].golpes.length === 0);
  const caiu = passosDoTurno([], { antes: [{ nome: "Atirador 1", x: 1, y: 1, vida: 6 }], depois: [{ nome: "Atirador 1", x: 1, y: 1, vida: 0, derrotado: true }], intencoes: [{ inimigo: "Atirador 1", tipo: "atacar", vista: { tipo: "atacar", alvo: "Bran" } }] });
  t("quem caiu antes da vez dele fica com o passo marcado `caiu`", caiu.length === 1 && caiu[0].caiu === true && caiu[0].golpes.length === 0);
  const ali = passosDoTurno([], { aliadosAntes: [{ nome: "Quorin", x: 4, y: 5 }], aliadosDepois: [{ nome: "Quorin", x: 4, y: 5 }], companheiros: [{ companheiro: "Quorin", tipo: "cura", alvo: "Bran", valor: 6 }], vidas: { Bran: 10 }, vidaMax: { Bran: 30 } });
  t("o aliado que cura tem o passo «curar», com quem e quanto", ali.length === 1 && ali[0].lado === "aliado" && ali[0].tipo === TIPO_DO_ALIADO.cura && ali[0].cura.valor === 6);
  const letal = passosDoTurno([{ inimigo: "Ogro 1", alvoRef: "jogador", alvoNome: "Bran", r: resolverAtaque({ atacante: "Ogro 1", alvo: { nome: "Bran", vida: 8 }, ehAtacanteInimigo: true, bonusAtaque: 5, danoBase: 9, rolar: () => 0.7 }), golpeNome: "Clava", intencao: "cumprida", onde: { x: 6, y: 5 }, alvoOnde: heroi }],
    { antes: [{ nome: "Ogro 1", x: 6, y: 5, vida: 30 }], depois: [{ nome: "Ogro 1", x: 6, y: 5, vida: 30 }], intencoes: [{ inimigo: "Ogro 1", tipo: "atacar", vista: { tipo: "atacar", alvo: "Bran", abate: 0.62 } }], vidas: { Bran: 8 }, vidaMax: { Bran: 30 }, heroi: "Bran" });
  t("o golpe anunciado com caveira leva a chance anunciada (a tela decide se rola em cima do herói) e as faces que o salvam", letal[0].golpes[0].abateAnunciado === 0.62 && letal[0].golpes[0].salvam.includes(1) && letal[0].emTi === true);
  let estourou = null;
  try { passosDoTurno(null, null); passosDoTurno([null, 3, {}], { antes: [null], vidas: null }); passosDoTurno("x", "y"); } catch (e) { estourou = e; }
  t("lixo não estoura, e sem nada é a lista vazia", !estourou && J(passosDoTurno(null, null)) === "[]", String(estourou));
  const ctx = { antes: [{ nome: "Lobo 1", x: 6, y: 5, vida: 4 }], fugas: [{ nome: "Lobo 1", r: r(15, 3) }], vidas: { "Lobo 1": 4 } };
  const copia = J(ctx);
  passosDoTurno([], ctx);
  t("o que recebe fica como veio", J(ctx) === copia);
}

sec("3. OS 4 SEGUNDOS — duracaoDosPassos (formas.md §CB 17.2)");
{
  const ev = (desfecho, abate = false) => ({ versao: 1, tipo: "golpe", desfecho, abate, dano: 3 });
  const passo = (casas, golpes) => ({ tipo: golpes.length ? "atacar" : "aproximar", caminho: Array.from({ length: casas ? casas + 1 : 0 }, (_, k) => ({ x: k, y: 0 })), golpes: golpes.map((d) => ({ evento: ev(d) })) });
  const quatro = [passo(3, ["acerto"]), passo(2, ["erro"]), passo(0, ["acerto"]), passo(4, ["critico"])];
  const d1 = duracaoDosPassos(quatro, { tabela: TURNO_DELES });
  const somaEsperada = quatro.reduce((s, p) => s + TURNO_DELES.realce + Math.min(TURNO_DELES.andarTeto, TURNO_DELES.porCasa * Math.max(0, p.caminho.length - 1)) + p.golpes.reduce((a, g) => a + somaDoGolpe(g.evento.desfecho === "acerto" ? "acerto" : g.evento.desfecho), 0) + TURNO_DELES.respiro, 0) + TURNO_DELES.fim;
  t(`a soma é realce + andar + golpe + respiro por passo, mais o fim (${d1.total} ms)`, d1.total === somaEsperada && d1.fator === 1 && d1.pousaDesde === null);
  const d2 = duracaoDosPassos(quatro, { tabela: TURNO_DELES, velocidade: 2 });
  t(`o 2× corta tudo a metade (${d2.total})`, Math.abs(d2.total - d1.total / 2) <= 2);
  const dr = duracaoDosPassos(quatro, { tabela: TURNO_DELES, reduzido: true });
  t(`movimento reduzido: um corte de 400 por passo, mais o fim (${dr.total}; a luta de 4 passos dá 1 800, como em F6)`, dr.total === 4 * 400 + 200);
  const horda = Array.from({ length: 8 }, () => passo(5, ["acerto"]));
  const dh = duracaoDosPassos(horda, { tabela: TURNO_DELES });
  t(`a horda de 8 encolhe por igual e acaba no teto (${dh.total} ms, ×${dh.fator})`, dh.total <= TURNO_DELES.teto && dh.fator < 1 && dh.passos.every((p) => p.ms >= TURNO_DELES.pisoDoPasso));
  const multidao = [...Array.from({ length: 10 }, () => passo(4, [])), ...Array.from({ length: 20 }, () => passo(5, ["acerto", "acerto"]))];
  const dm = duracaoDosPassos(multidao, { tabela: TURNO_DELES });
  t(`a multidão: quem só anda anda junto, e no teto o resto pousa de uma vez (${dm.total} ms, juntos ${dm.juntos}, pousa desde ${dm.pousaDesde})`, dm.total <= TURNO_DELES.teto && dm.juntos === true && dm.pousaDesde != null && dm.passos[dm.passos.length - 1].pousa === true);
  t("todo índice está num passo, uma vez", J(dm.passos.flatMap((p) => p.i).sort((a, b) => a - b)) === J(multidao.map((_, k) => k)));
  t("sem tabela, a conta cala (null)", duracaoDosPassos(quatro, {}) === null && duracaoDosPassos(null, null) === null);
}

sec("4. O GOLPE DA HABILIDADE NA MESA (o resto do lote 1)");
{
  const alvo = { nome: "Orc 1", vida: 12, vidaMax: 12, defesa: 11 };
  const r = resolverAtaque({ atacante: "Bran", alvo, ehAtacanteInimigo: false, bonusAtaque: 4, danoBase: 9, tipoDano: "fogo", rolar: () => 0.6 });
  const g = golpeDaHabilidade(r, { habilidade: { nome: "Bola de Fogo" }, criticoEm: 20, vidaAntes: 12, vidaMax: 12, atingidos: [{ nome: "Orc 2", vidaAntes: 5, vidaMax: 12 }, { nome: "Orc 1", vidaAntes: 12 }] });
  t("o d20 vai à bandeja como o do golpe de arma, com o nome da habilidade", g.lancamento && g.lancamento.golpe === true && g.lancamento.rotulo.startsWith("Bola de Fogo"));
  t("o evento do alvo diz o golpe pelo nome, do lado do herói", g.eventos[0].golpe === "Bola de Fogo" && g.eventos[0].lado === "heroi" && g.eventos[0].alvo === "Orc 1" && g.eventos[0].elemento === "fogo");
  t("e cada corpo que a área apanhou tem o seu evento, com o mesmo dano (o alvo não se repete)", g.eventos.length === 2 && g.eventos[1].alvo === "Orc 2" && g.eventos[1].area === true && g.eventos[1].dano === g.eventos[0].dano && g.eventos[1].abate === (5 - r.dano <= 0));
  const imp = golpeDaHabilidade({ tipo: "impedido", texto: "não pode" }, {});
  t("o golpe que nem rolou não vai à bandeja", imp && imp.lancamento === null);
  t("lixo dá null", golpeDaHabilidade(null) === null);
}

console.log(`\no turno contado: ${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
