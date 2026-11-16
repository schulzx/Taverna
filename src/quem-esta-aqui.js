/* ============================================================
   QUEM ESTÁ AQUI (S4 do lançamento, 16/11/2026) — uma só verdade

   Quatro provas jogadas (15–16/11) viram o mesmo defeito por quatro
   portas: Cedric e Runa, moradores de Monte Profundo, «em cena» na
   Paliçada de Sangue Velho, a 19 km da cidade; Isen e Ceridwen sentados à
   fogueira do grupo lá fora; o guarda-portão da cidade nas pedras e na
   estalagem; e, no mesmo turno, a tela a dizer «Em cena: Perrine e Isen»
   enquanto a pauta do Narrador dizia «Cedric · Runa».

   A CAUSA (cena.js#elencoDaCena): quem está aqui era decidido só pela
   CIDADE — «vive em Monte Profundo» é presente em Monte Profundo — e a
   boca de uma masmorra a 19 km, ou o arredor a uma hora de caminhada, não
   muda a cidade (`lugarRef` muda; `cidadeAtualRef` fica). A cidade inteira
   ia atrás do herói até à Paliçada. A fogueira (App#rodaDaFogueira) lia a
   mesma cidade para chamar o núcleo dela à roda, e a tela (App#
   contextoDoEmCena) montava a lista SEM a pessoa do passo que a pauta
   (motor/pauta-do-turno.js) já via — duas listas, duas verdades.

   A REGRA DE MESA, numa função só, que os três leitores chamam:
     · fora dos muros (a estrada, a boca da masmorra, um arredor que o
       sistema conhece) a gente da cidade fica LÁ: vai para o `longe` com
       `dias: 0` e `laFora` (a cidade), o balde que o Narrador já lê como
       «não aparece nesta cena» (o mesmo da masmorra, MM14 · 9). Ficam o
       grupo e quem a ficha põe NESTE sítio;
     · dentro da cidade, num sítio dela, quem a ficha põe NOUTRO sítio
       conhecido da cidade está no posto dele (o guarda no portão, não na
       estalagem). Quem não diz sítio nenhum continua plausível, como
       sempre: o portão morde só o necessário;
     · a pessoa do passo (a-pessoa-do-passo.js) e a pessoa de uma carta do
       quadro da quest, com o herói no sítio dela, ESTÃO aqui — as duas
       entram pela mesma porta (`doPasso` de em-cena.js);
     · o núcleo da cidade só conta como «daqui» dentro dos muros
       (`foraDaCidade`, lido em em-cena.js §3 e na fogueira).

   Puro, sem React, determinístico (nenhum sorteio). Provado em
   testes/teste-quem-esta-aqui.mjs.
   ============================================================ */
import { elencoDaCena, masmorraAberta } from "./cena.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (x) => sem(x).replace(/^(o|a|os|as)\s+/, "");
const nomeDe = (x) => str(ehObj(x) ? x.nome : x).trim();
const mesmo = (a, b) => { const x = sem(a), y = sem(b); return !!x && !!y && (x === y || x.split(",")[0].trim() === y.split(",")[0].trim()); };

/* ---------------- A TABELA ----------------
   `distanciasFora`: os lugares (lugar.js, DISTANCIAS) que ficam sempre fora
   dos muros — «perto» é a boca da masmorra (boca.js, IDA_A_MASMORRA).
   `arredores`: o lugar «arredores» só conta como fora quando o sistema o
   conhece como arredor da cidade (a lista `lugares` com `onde: "arredores"`)
   — `distanciaPorTexto` dá «arredores» a todo nome que não reconhece, e a
   casa do moleiro que o Cronista registou não leva a cidade embora.
   `sitioMinimo`: um nome de sítio mais curto que isto casaria com pedaço de
   qualquer `local`. `daCarta`: como a carta do quadro entra na lista. */
export const QUEM_ESTA_AQUI_TABELA = Object.freeze({
  distanciasFora: Object.freeze(["perto"]),
  arredores: "arredores",
  ondeArredor: "arredores",
  sitioMinimo: 4,
  daCarta: Object.freeze({ deOnde: "carta", formas: Object.freeze(["pessoa"]), estados: Object.freeze(["costas"]) }),
  porque: "quem está aqui é quem está no sítio onde o herói está: a cidade não vai atrás dele para fora dos muros",
});

/* O herói está fora dos muros? A estrada (jornada), a boca da masmorra, um
   arredor que o sistema conhece. A masmorra aberta é da cena.js. */
export function foraDosMuros(estado) {
  const e = ehObj(estado) ? estado : {};
  const T = QUEM_ESTA_AQUI_TABELA;
  if (ehObj(e.jornada)) return true;
  const L = ehObj(e.lugar) ? e.lugar : null;
  if (!L || !nomeDe(L)) return false;
  const d = str(L.distancia);
  if (T.distanciasFora.includes(d)) return true;
  if (d !== T.arredores) return false;
  return arr(e.lugares).some((l) => ehObj(l) && str(l.onde) === T.ondeArredor && semArtigo(l.nome) === semArtigo(L.nome));
}

/* o `local` da ficha nomeia este sítio? */
function nomeiaSitio(local, sitio) {
  const s = semArtigo(sitio);
  return s.length >= QUEM_ESTA_AQUI_TABELA.sitioMinimo && sem(local).includes(s);
}

/* As pessoas das cartas do quadro que esperam o herói: a essencial de forma
   «pessoa», ainda de costas, no passo de agora (não futura), com o sítio
   onde a ficha ou a gente da base a põe. → [{ nome, onde, rotulo }] */
export function pessoasDasCartas(quadros, ctx) {
  const c = ehObj(ctx) ? ctx : {};
  const npcs = ehObj(c.npcs) ? c.npcs : {};
  const gente = arr(c.gente);
  const D = QUEM_ESTA_AQUI_TABELA.daCarta;
  const out = [];
  for (const q of arr(quadros)) {
    for (const k of arr(ehObj(q) ? q.cartas : [])) {
      if (!ehObj(k) || k.tipo !== "essencial" || k.futura || !D.formas.includes(k.forma) || !D.estados.includes(k.estado)) continue;
      const nome = nomeDe(ehObj(k.escreve) ? k.escreve : null);
      if (!nome || out.some((x) => mesmo(x.nome, nome))) continue;
      const ficha = Object.values(npcs).find((n) => ehObj(n) && mesmo(n.nome, nome));
      const daBase = gente.find((p) => ehObj(p) && mesmo(p.nome, nome));
      const onde = str((ficha && ficha.local) || (daBase && daBase.local) || "").trim();
      if (!onde) continue;
      out.push({ nome, onde, rotulo: str(daBase && (daBase.papel || daBase.oficio) || (ficha && ficha.papel) || "").trim() });
    }
  }
  return out;
}

/* ============================================================
   `quemEstaAqui(estado)` — `estado` (tudo opcional; lixo e null não estouram):
     npcs, cidadeAtual, mapa      — o registo e onde o herói está
     personagem | grupo           — quem anda com ele
     masmorra, jornada, lugar     — o sítio de agora
     lugares                      — os sítios daqui ([{ nome, onde }], App#lugaresDaqui)
     doPasso                      — quem o passo pôs aqui (aPessoaDoPasso, já filtrado)
     quadros, gente               — as cartas do quadro e a gente da base desta cidade
   → { aqui, longe, doPasso, fora, grupo }
     `aqui`/`longe`: o formato de `elencoDaCena` (o mesmo que todos já leem);
     `doPasso`: [{ nome, rotulo, sabe, aqui, deOnde }] para `montarEmCena`;
     `fora`: fora dos muros (o núcleo da cidade não é «daqui»).
   ============================================================ */
export function quemEstaAqui(estado) {
  const e = ehObj(estado) ? estado : {};
  const pers = ehObj(e.personagem) ? e.personagem : {};
  const grupo = arr(e.grupo || pers.grupo).filter((g) => ehObj(g) && nomeDe(g));
  const noGrupo = new Set(grupo.map((g) => sem(g.nome)));
  let el = { aqui: [], longe: [] };
  try { el = elencoDaCena(ehObj(e.npcs) ? e.npcs : {}, str(e.cidadeAtual), e.mapa, { comGrupo: grupo, masmorra: e.masmorra }) || el; } catch { el = { aqui: [], longe: [] }; }
  const fora = !masmorraAberta(e.masmorra) && foraDosMuros(e);
  const L = ehObj(e.lugar) && nomeDe(e.lugar) ? e.lugar : null;
  const cidade = str(e.cidadeAtual).trim();
  /* os outros sítios conhecidos da cidade (não este, nem o prédio de que este é cômodo) */
  const outros = arr(e.lugares).filter((l) => ehObj(l) && nomeDe(l) && str(l.onde) !== QUEM_ESTA_AQUI_TABELA.ondeArredor
    && (!L || (semArtigo(l.nome) !== semArtigo(L.nome) && semArtigo(l.nome) !== semArtigo(L.dentroDe))));
  const aqui = [], longe = [...arr(el.longe)];
  for (const n of arr(el.aqui)) {
    if (!ehObj(n)) continue;
    if (noGrupo.has(sem(n.nome))) { aqui.push(n); continue; }
    const local = str(n.local || "");
    if (fora) {
      if (L && nomeiaSitio(local, L.nome)) { aqui.push(n); continue; }
      longe.push({ ...n, onde: cidade, dias: 0, laFora: cidade });
      continue;
    }
    if (L) {
      const posto = outros.find((l) => nomeiaSitio(local, l.nome));
      if (posto && !nomeiaSitio(local, L.nome)) { longe.push({ ...n, onde: cidade, dias: 0, laFora: nomeDe(posto) }); continue; }
    }
    aqui.push(n);
  }
  /* a pessoa do passo, e a da carta com o herói no sítio dela */
  const doPasso = arr(e.doPasso).filter((x) => ehObj(x) && nomeDe(x));
  if (L) {
    let cartas = [];
    try { cartas = pessoasDasCartas(e.quadros, { npcs: e.npcs, gente: e.gente }); } catch { cartas = []; }
    for (const k of cartas) {
      if (doPasso.some((x) => mesmo(x.nome, k.nome)) || noGrupo.has(sem(k.nome)) || !nomeiaSitio(k.onde, L.nome)) continue;
      doPasso.push({ nome: k.nome, rotulo: k.rotulo, aqui: true, deOnde: QUEM_ESTA_AQUI_TABELA.daCarta.deOnde });
    }
  }
  /* quem entra pelo passo ou pela carta não fica no longe */
  const longe2 = longe.filter((n) => !doPasso.some((x) => mesmo(x.nome, n && n.nome)));
  return { aqui, longe: longe2, doPasso, fora, grupo: grupo.map((g) => nomeDe(g)) };
}

/* O pedaço do contexto de `montarEmCena` que é desta conta — o MESMO para a
   pauta (motor/pauta-do-turno.js) e para a tela (App#contextoDoEmCena). */
export function contextoDeQuemEsta(q) {
  const x = ehObj(q) ? q : {};
  return { presentes: arr(x.aqui), longe: arr(x.longe), doPasso: arr(x.doPasso), foraDaCidade: !!x.fora };
}
