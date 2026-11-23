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

   S4c (16/11, a prova jogada com a IA real): DENTRO da cidade a tela
   nunca disse «EM CENA» em quatro sítios, e a prosa pôs gente em cada um
   (Fenna na Roda dos Insones, Ivarr e Ceridwen no Mercado de Cordas). A
   causa: quem o sistema põe NUM sítio é a gente da base daquele local
   (mundo-base.js#genteDoLocal: o taverneiro, a serviçal) — e ela só
   entrava aqui pela carta do quadro; o registo de gente tem por paradeiro
   a cidade (fim-do-turno.js cria-a com «local: cidadeAtual»), e em-cena.js
   só a dá à vista com a prosa a mostrá-la. A cena ficava sem ninguém, a
   pauta oferecia «a quem não tem nome: …» e o Narrador inventava. Agora:
     · «doSitio»: num sítio da cidade, a gente da base daquele local e quem
       a ficha do registo põe ali ESTÃO em cena — a mesma lista na tela e na
       pauta (em-cena.js §1c);
     · «naoEstaoAqui»: quem a prosa recente citou e o sistema sabe noutro
       sítio (o longe, a gente da base de outro local) — o veto da pauta;
     · «quemAgeAqui»: a lista que o Intérprete (A GENTE) e quem pergunta
       «há gente aqui?» leem — num sítio, só quem está nele.

   Puro, sem React, determinístico (nenhum sorteio). Provado em
   testes/teste-quem-esta-aqui.mjs.
   ============================================================ */
import { elencoDaCena, masmorraAberta } from "./cena.js";
import { fichaDaPessoa } from "./gente-por-dentro.js";
import { quemAtende } from "./elenco-do-lugar.js";
import { oficioNoGenero } from "./nomes.js";
import { ESTADO_SEM_VOLTA } from "./npcs.js";
import { catalogoDasListas, oNomeDitoDiz, candidatos, catalogoDoElenco, idDe, idNaPresenca, idsDaGente, QUEM_E_QUEM_DITO } from "./quem-e-quem.js";

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
  /* S4c: quem o posto põe neste sítio entra assim (em-cena.js §1c) */
  doSitio: Object.freeze({ deOnde: "sitio", max: 4 }),
  /* S4c: o veto de quem não está — quantas falas do Mestre se releem, quantos
     nomes cabem na linha, o primeiro nome que basta sozinho, o teto da linha */
  naoEstao: Object.freeze({ falas: 2, max: 3, primeiroMinimo: 4, letras: 200,
    linha: (nomes, onde, aqui) => "pôr a agir ou a falar quem não está nesta cena: " + nomes.join(", ") + (onde ? " (ficou em " + onde + ")" : "") + (aqui.length ? "; aqui estão " + aqui.join(", ") : "; aqui só está você") }),
  porque: "quem está aqui é quem está no lugar onde o herói está: a cidade não vai atrás dele para fora dos muros",
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
      /* 23/11 (a décima sétima sessão): o ofício no gênero da pessoa — «sacerdote(isa)» cru não vai à tela */
      out.push({ nome, onde, rotulo: oficioNoGenero(str(daBase && (daBase.papel || daBase.oficio) || (ficha && ficha.papel) || "").trim(), str((daBase && (daBase.genero_pessoa || daBase.genero)) || (ficha && ficha.genero))) });
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
   23/11 (identidade · etapa 2): toda entrada leva o `id` do catálogo
   (quem-e-quem.js) — aditivo: quem lê o nome continua a ler o nome. Com
   `porId: true` (o Mestre vivo), quem é igual a quem decide-se pelo id: o
   segundo homônimo no mesmo sítio fica, e não se funde no primeiro. Sem a
   chave, as listas de sempre, byte a byte (só com o `id` a mais).
   ============================================================ */
export function quemEstaAqui(estado) {
  const e = ehObj(estado) ? estado : {};
  const porId = e.porId === true;
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
  /* o catálogo desta cena: a gente da base, o registo, o grupo — os ids saem dele */
  let cat = null;
  try { cat = catalogoDoElenco({ gente: arr(e.gente), npcs: ehObj(e.npcs) ? e.npcs : {}, grupo, cidade, heroi: nomeDe(pers) }, e.pessoas); } catch { cat = null; }
  const fim = (id) => (id && cat && cat.alias && cat.alias[id]) || id;
  let idsG = [];
  try { idsG = idsDaGente(arr(e.gente).map((g) => (ehObj(g) ? g : { nome: g })), cidade); } catch { idsG = []; }
  const idDaGenteEm = (p) => { const i = arr(e.gente).indexOf(p); return i >= 0 ? fim(idsG[i] || "") : ""; };
  const idNaGente = (gid) => { const p = arr(e.gente).find((g) => ehObj(g) && g.id === gid); return p ? idDaGenteEm(p) : ""; };
  /* a chave do registo de quem elencoDaCena devolveu (a ficha espalhada): a ficha de
     mesmo nome que mais campos partilha — o homônimo do registo (Hilda e Hilda~2) dá
     cada um a sua */
  const npcsE = ehObj(e.npcs) ? e.npcs : {};
  const chaveCache = new WeakMap(), chavesUsadas = new Set();
  const idDoRegisto = (n) => {
    if (!ehObj(n)) return "";
    if (chaveCache.has(n)) return chaveCache.get(n);
    const ks = Object.keys(npcsE).filter((k) => ehObj(npcsE[k]) && npcsE[k].nome === n.nome && !chavesUsadas.has(k));
    const nota = (k) => ["local", "cidade", "papel", "status", "semente", "genero"].filter((c) => str(npcsE[k][c]) === str(n[c])).length;
    const k = ks.sort((a, b) => nota(b) - nota(a))[0];
    let id = "";
    if (k) { chavesUsadas.add(k); id = fim(idDe({ chave: k, id: npcsE[k].id }, "registo")); }
    chaveCache.set(n, id);
    return id;
  };
  const aqui = [], longe = [...arr(el.longe)];
  /* 22/11 (a décima segunda sessão, «Quorin» em todo lugar): quem a base põe
     num posto tem a casa da base, diga o registo o que disser (aCasaNaBase);
     o companheiro do registo anda com o herói e fica fora desta regra */
  const casaDe = (n) => {
    if (/companheir/i.test(str(n.relacao))) return null;
    try { return aCasaNaBase(nomeDe(n), e.gente); } catch { return null; }
  };
  const localDe = (n) => { const c = casaDe(n); return c ? c.local : str(n.local || ""); };
  for (const n of arr(el.aqui)) {
    if (!ehObj(n)) continue;
    if (noGrupo.has(sem(n.nome))) { aqui.push(n); continue; }
    const casa = casaDe(n);
    const local = casa ? casa.local : str(n.local || "");
    if (fora) {
      if (L && nomeiaSitio(local, L.nome)) { aqui.push(n); continue; }
      longe.push({ ...n, onde: cidade, dias: 0, laFora: casa ? casa.local : cidade });
      continue;
    }
    if (L) {
      const posto = outros.find((l) => nomeiaSitio(local, l.nome));
      if (posto && !nomeiaSitio(local, L.nome)) { longe.push({ ...n, onde: cidade, dias: 0, laFora: nomeDe(posto) }); continue; }
      /* o posto da base vale mesmo que a planta não o liste entre os sítios conhecidos */
      if (casa && !nomeiaSitio(local, L.nome)) { longe.push({ ...n, onde: cidade, dias: 0, laFora: casa.local }); continue; }
    }
    aqui.push(n);
  }
  /* 23/11 (a décima sétima sessão): O PAPEL DA QUEST. Brannoc aparecia como
     «catador de espólios» (o papel da base) enquanto a quest e a prosa o tratavam
     por quem deixou as chaves da guarda. Quem o herói já conhece (está no
     registo) e tem papel numa quest aberta (`passos`, osPassosDasQuests: o
     rótulo do papel em frase de mundo) leva o rótulo da quest; os outros, o
     ofício no gênero da pessoa (oficioNoGenero). Sem `passos`, só o gênero. */
  const daQuest = (nome) => {
    for (const p of arr(e.passos)) for (const c of [...arr(ehObj(p) && ehObj(p.candidatos) ? p.candidatos.pessoa : []), ...arr(ehObj(p) ? p.quem : [])]) {
      if (ehObj(c) && str(c.rotulo).trim() && mesmo(c.nome, nome)) return str(c.rotulo).trim();
    }
    return "";
  };
  for (let i = 0; i < aqui.length; i++) {
    const n = aqui[i];
    if (!ehObj(n) || noGrupo.has(sem(n.nome))) continue;
    const r = daQuest(nomeDe(n)) || oficioNoGenero(str(n.papel), str(n.genero));
    if (r && r !== n.papel) aqui[i] = { ...n, papel: r };
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
  /* S4c: quem o posto põe NESTE sítio (a gente da base do local, e a ficha do
     registo que o nomeia) — dentro dos muros, fora da masmorra */
  const doSitio = [];
  const noSitio = !!L && !fora && !masmorraAberta(e.masmorra);
  if (noSitio) {
    const conhecido = arr(e.lugares).find((l) => ehObj(l) && nomeDe(l) && (semArtigo(l.nome) === semArtigo(L.nome) || (l.chamado && semArtigo(l.chamado) === semArtigo(L.nome))));
    const sitios = [L.nome, conhecido && conhecido.nome].filter(Boolean);
    const ali = (local) => sitios.some((x) => nomeiaSitio(local, x));
    /* S4d: o posto só põe quem está de turno — a rotina (gente-por-dentro.js)
       diz a hora dela; quem o passo já sabe fora (`ausentes`) também não está */
    const ausentes = arr(e.ausentes).map(nomeDe);
    const R = ehObj(e.relogio) ? e.relogio : null;
    const deTurno = (nome, rotulo, local) => {
      if (!R) return true;
      let rot = null;
      try { rot = fichaDaPessoa(R.semente, { nome, papel: str(rotulo), local: str(local) }, { ...R, grupo: grupo }).rotina; } catch { rot = null; }
      if (!rot || !str(rot.agora)) return true;
      return rot.agora !== "morreu" && !!rot.noTurno;
    };
    /* «Quorin» do registo e «Quorin Barba-Ruiva» da base são uma pessoa só (aCasaNaBase) */
    const ident = (nome) => { let c = null; try { c = aCasaNaBase(nome, e.gente); } catch { c = null; } return sem(c ? c.nome : nome); };
    const igual = (x, nome, id) => (porId && id && x.id ? x.id === id : mesmo(x.nome, nome) || ident(x.nome) === ident(nome));
    const por = (nome, rotulo, genero, local, id) => {
      if (!nome || noGrupo.has(sem(nome)) || doPasso.some((x) => igual(x, nome, id)) || doSitio.some((x) => igual(x, nome, id))) return;
      if (ausentes.some((a) => mesmo(a, nome)) || !deTurno(nome, rotulo, local)) return;
      if (doSitio.length >= QUEM_ESTA_AQUI_TABELA.doSitio.max) return;
      doSitio.push({ nome, rotulo: oficioNoGenero(str(rotulo).trim(), str(genero).trim()), genero: str(genero).trim(), aqui: true, deOnde: QUEM_ESTA_AQUI_TABELA.doSitio.deOnde, ...(id ? { id } : {}) });
    };
    for (const n of aqui) if (ehObj(n) && ali(localDe(n))) { const c = casaDe(n); por(c ? c.nome : nomeDe(n), n.papel, n.genero, localDe(n), (c && c.id && idNaGente(c.id)) || idDoRegisto(n)); }
    for (const p of arr(e.gente)) if (ehObj(p) && ali(p.local) && !/morto/i.test(str(p.status))) por(nomeDe(p), p.papel || p.oficio, p.genero_pessoa || p.genero, p.local, idDaGenteEm(p));
    /* S4e: o posto vazio num lugar com função, à hora do expediente — o
       sistema escala quem o atende (elenco-do-lugar.js). Antes a estalagem
       antes das 11h e no dia da folga de todos ficava sem ninguém, e a prosa
       punha lá quem quisesse. */
    if (!doSitio.length) {
      const N = ehObj(e.nomes) ? e.nomes : {};
      let fig = [];
      try { fig = quemAtende(conhecido || L, { semente: R ? R.semente : str(N.semente), cidade, minuto: R ? R.minuto : undefined, genero: N.genero, lex: N.lex, gente: e.gente }); } catch { fig = []; }
      if (!fig.length && conhecido && conhecido !== L) { try { fig = quemAtende(L, { semente: R ? R.semente : str(N.semente), cidade, minuto: R ? R.minuto : undefined, genero: N.genero, lex: N.lex, gente: e.gente }); } catch { fig = []; } }
      for (const f of fig) if (!ausentes.some((a) => mesmo(a, f.nome)) && !noGrupo.has(sem(f.nome))) doSitio.push({ nome: f.nome, rotulo: oficioNoGenero(f.rotulo, f.genero), genero: f.genero, aqui: true, deOnde: f.deOnde });
    }
  }
  /* quem entra pelo passo, pela carta ou pelo posto não fica no longe */
  const longe2 = longe.filter((n) => !doPasso.some((x) => mesmo(x.nome, n && n.nome)) && !doSitio.some((x) => (porId && x.id && idDoRegisto(n) ? x.id === idDoRegisto(n) : mesmo(x.nome, n && n.nome))));
  /* 22/11 (a décima segunda sessão): a gente da base com posto NOUTRO sítio (com o
     herói num sítio ou fora dos muros) — o nome dela que a prosa trouxer não
     fica «em cena» (em-cena.js, ehLonge) */
  const postosLonge = (noSitio || fora) ? arr(e.gente).filter((p) => ehObj(p) && nomeDe(p) && str(p.local).trim() && !/morto/i.test(str(p.status))
    && !(L && nomeiaSitio(p.local, L.nome)) && !noGrupo.has(sem(p.nome)) && !doPasso.some((x) => mesmo(x.nome, p.nome)) && !doSitio.some((x) => mesmo(x.nome, p.nome)))
    .map((p) => ({ nome: nomeDe(p), onde: str(p.local).trim() })) : [];
  /* o id de quem ainda não o tem (o registo, o passo, a carta, o figurante): pelo
     catálogo; o homônimo que o catálogo não separa leva o primeiro id livre */
  const usados = new Set();
  const comId = (x, id0) => {
    if (!ehObj(x)) return x;
    if (typeof x.id === "string" && x.id) { usados.add(x.id); return x; }
    const id = id0 || idNaPresenca(nomeDe(x), cat, { usados });
    usados.add(id);
    return { ...x, id };
  };
  const aquiI = aqui.map((n) => comId(n, idDoRegisto(n)));
  for (const n of aquiI) if (ehObj(n) && n.id) usados.add(n.id);
  return {
    aqui: aquiI, longe: longe2.map((n) => comId(n, idDoRegisto(n))), doPasso: doPasso.map((x) => comId(x)), doSitio: doSitio.map((x) => comId(x)),
    noSitio, fora, grupo: grupo.map((g) => nomeDe(g)), postosLonge, porId,
    gruposIds: grupo.map((g) => fim(idDe(g, "grupo"))),
  };
}

/* QUEM ESTÁ NOUTRO SÍTIO DAQUI (23/11/2026, a décima sétima sessão, frases 1 a 4)
   quemEstaNoutroSitio(q, ctx) → [{ nome, onde }]
   O elenco CONHECIDO (o registo de gente, nesta cidade) que tem posto noutro
   sítio da mesma cidade. Com o herói num sítio, é o `longe` de `dias: 0` com o
   posto (`laFora`) — quemEstaAqui já o pôs lá. Sem sítio (a rua, a chegada),
   quemEstaAqui deixa toda a gente do registo «aqui» (o morador da cidade é
   plausível na rua); mas quem tem POSTO — a casa da base (aCasaNaBase), ou o
   `local` da ficha a nomear um sítio conhecido (`ctx.lugares`) — está no posto,
   e não na rua com o herói: nas frases 1 a 4 Brannoc falou sem estar ali. O
   grupo, o companheiro, quem o passo ou o sítio põem em cena, nunca.
   ctx: { gente (a base da cidade), lugares ([{ nome }], os sítios daqui) }.
   Não muda quemEstaAqui (a tela segue igual); quem lê é a poda do ausente e a
   linha da pauta, com o Mestre vivo. */
export function quemEstaNoutroSitio(q, ctx) {
  try {
    const x = ehObj(q) ? q : {};
    const c = ehObj(ctx) ? ctx : {};
    if (x.fora) return [];
    const grupo = new Set(arr(x.grupo).map((g) => sem(nomeDe(g))));
    const dentro = [...arr(x.doPasso), ...arr(x.doSitio)].map(nomeDe);
    const fica = (nome) => !nome || grupo.has(sem(nome)) || dentro.some((d) => mesmo(d, nome));
    const out = [];
    const por = (nome, onde) => { if (!fica(nome) && str(onde).trim() && !out.some((y) => mesmo(y.nome, nome))) out.push(Object.freeze({ nome, onde: str(onde).trim() })); };
    for (const n of arr(x.longe)) if (ehObj(n) && Number(n.dias) === 0 && str(n.laFora).trim() && !/morto/i.test(str(n.status))) por(nomeDe(n), n.laFora);
    if (!x.noSitio) {
      const sitios = arr(c.lugares).filter((l) => ehObj(l) && nomeDe(l) && str(l.onde) !== QUEM_ESTA_AQUI_TABELA.ondeArredor);
      for (const n of arr(x.aqui)) {
        if (!ehObj(n) || /companheir/i.test(str(n.relacao)) || /morto/i.test(str(n.status))) continue;
        let casa = null;
        try { casa = aCasaNaBase(nomeDe(n), c.gente); } catch { casa = null; }
        const posto = casa && str(casa.local).trim() ? casa.local : (sitios.find((l) => nomeiaSitio(n.local, l.nome)) || {}).nome;
        if (posto) por(nomeDe(n), posto);
      }
    }
    return out;
  } catch { return []; }
}

/* S4c · QUEM AGE AQUI: a lista que o Intérprete (A GENTE) lê. Num sítio da
   cidade, só quem o sistema põe nele (o grupo, o posto, o passo) — o
   morador de paradeiro «a cidade» é plausível na rua, mas não age na
   estalagem sem a prosa o trazer; na rua, a de sempre.
   → [{ nome, ... }] (o formato de elencoDaCena(...).aqui) */
export function quemAgeAqui(q) {
  const x = ehObj(q) ? q : {};
  const grupo = new Set(arr(x.grupo).map(sem));
  const base = x.noSitio ? arr(x.aqui).filter((n) => ehObj(n) && grupo.has(sem(n.nome))) : arr(x.aqui).filter(ehObj);
  const out = [...base];
  /* etapa 2: com a chave (`porId`), o mesmo é o mesmo id — o segundo homônimo fica; o id vai junto, sempre */
  const jaTem = (p) => (x.porId === true && p.id ? out.some((n) => n.id === p.id) : out.some((n) => mesmo(n.nome, p.nome)));
  for (const p of [...arr(x.doSitio), ...arr(x.doPasso)]) if (ehObj(p) && nomeDe(p) && !jaTem(p)) out.push({ nome: nomeDe(p), papel: oficioNoGenero(str(p.rotulo), str(p.genero)), deOnde: p.deOnde, ...(p.id ? { id: p.id } : {}) });
  return out;
}

/* ============================================================
   A PRESENÇA ÚNICA (23/11/2026, identidade · etapa 2)

   O App calculava «quem está em cena» de quatro jeitos (pessoasDaCena,
   presentesAgora, presentesDaTela, ausentesAgora), todos por nome, e o
   retrato do ouvido juntava os resultados à mão: «Mercy» lida como a
   homônima que estava longe com a outra à vista, a pessoa que a tela mostra
   e o leitor da frase não via, quem está noutro sítio a falar na cena.

   aPresencaUnica(q, ctx) → { aqui, age, tela, grupo, doPasso, doSitio,
     noutroSitio, longe, mortos, conhecidos, naCidade, ausentes, catalogo }
   UMA conta, toda por id (o do catálogo, quem-e-quem.js), com o nome como
   rótulo. Cada pessoa aparece num balde só, pela ordem: aqui (quem age aqui
   e quem a tela mostra), noutro sítio daqui, longe, morta; o resto do
   catálogo é «conhecido» (existe, e não está aqui).
     q   — o de quemEstaAqui (já com os ids);
     ctx — { npcs, gente (a base da cidade), grupo, cidade, heroi, pessoas
           (o campo do save), ausentes (osAusentes: [{ nome, onde, morto,
           sitio }]), tela ([nome | { nome, id }]: o «Em cena»), conhecidos
           ([nome]: quem mais o sistema nomeia — o passo da quest),
           naCidade ([nome]: o registo pela régua da cidade), factos (o livro:
           quem caiu morto, lido pelo alias do catálogo) }.
   `age` e `ausentes` são as listas de antes, intactas, para quem as lê. */
export function aPresencaUnica(q, ctx) {
  const x = ehObj(q) ? q : {};
  const c = ehObj(ctx) ? ctx : {};
  const grupoObj = arr(c.grupo).filter((g) => ehObj(g) && nomeDe(g) && !g.invocada);
  let cat;
  try { cat = catalogoDoElenco({ gente: arr(c.gente), npcs: ehObj(c.npcs) ? c.npcs : {}, grupo: grupoObj, cidade: str(c.cidade), heroi: nomeDe(c.heroi) }, c.pessoas); } catch { cat = catalogoDoElenco({}); }
  const conhece = (id) => !!id && (Object.prototype.hasOwnProperty.call(cat.porId, id) || Object.prototype.hasOwnProperty.call(cat.alias, id));
  const fim = (id) => (id && cat.alias[id]) || id;
  const usados = new Set();
  const vistos = new Set();
  const aquiIds = [];
  /* o id de uma entrada: o que ela traz (se é deste catálogo, ou veio de quemEstaAqui), senão o do nome */
  const idDaEntrada = (n, confia) => {
    const dado = ehObj(n) && typeof n.id === "string" ? n.id.trim() : "";
    const id = dado && (confia || conhece(dado)) ? fim(dado) : idNaPresenca(nomeDe(n), cat, { prefere: aquiIds, usados });
    usados.add(id);
    return id;
  };
  const balde = (lista, confia, extra) => {
    const out = [];
    for (const n of arr(lista)) {
      const nome = nomeDe(n);
      if (!nome) continue;
      const id = idDaEntrada(n, confia);
      if (!id || vistos.has(id)) continue;
      vistos.add(id);
      out.push(Object.freeze({ id, nome, ...(extra ? extra(n) : {}) }));
    }
    return out;
  };
  /* o morto é morto pelo id: o estado sem volta da ficha (ESTADO_SEM_VOLTA) e o morto de osAusentes —
     nunca entra no «aqui», ainda que uma lista de nomes o traga */
  const aus = arr(c.ausentes).filter(ehObj);
  const mortosCat = Object.keys(cat.porId).filter((id) => ESTADO_SEM_VOLTA.finais.includes(sem(cat.porId[id].status))).map((id) => ({ id, nome: cat.porId[id].nome }));
  /* e o livro de fatos (caiu morto), lido PELO ALIAS: o fato gravado como `npc|Nome` é da pessoa da base
     que o catálogo funde nele (`Cidade|gente|Nome`), e não se perde */
  const fp = ehObj(c.factos) && ehObj(c.factos.pessoas) ? c.factos.pessoas : {};
  const caiuMorto = (k) => ehObj(fp[k]) && ehObj(fp[k].derrotado) && fp[k].derrotado.como === "morto";
  const mortosDoLivro = arr(cat.entradas).filter((en) => caiuMorto(en.id) || caiuMorto(fim(en.id))).map((en) => ({ id: fim(en.id), nome: en.nome }));
  mortosCat.push(...mortosDoLivro.filter((m) => !mortosCat.some((y) => y.id === m.id)));
  const idsMortos = new Set([...mortosCat.map((m) => m.id), ...aus.filter((a) => a.morto).map((a) => idNaPresenca(nomeDe(a), cat))]);
  for (const id of idsMortos) vistos.add(id);
  let age = [];
  try { age = quemAgeAqui(x); } catch { age = []; }
  const aqui = balde(age, true, (n) => ({ papel: str(n.papel), deOnde: str(n.deOnde || "") }));
  for (const p of aqui) aquiIds.push(p.id);
  const daTela = balde(arr(c.tela), false, (n) => ({ papel: str(ehObj(n) ? n.papel || n.rotulo : ""), deOnde: "tela" }));
  aqui.push(...daTela);
  for (const p of daTela) aquiIds.push(p.id);
  /* a tela inteira, também com quem já estava (a leitura de presentesDaTela) */
  const tela = arr(c.tela).map((n) => { const nome = nomeDe(n); const a = aqui.find((p) => p.nome === nome); return nome ? Object.freeze({ id: a ? a.id : idDaEntrada(n, false), nome }) : null; }).filter(Boolean);
  const grupo = grupoObj.map((g, i) => Object.freeze({ id: fim(arr(x.gruposIds)[i] || idDe(g, "grupo")), nome: nomeDe(g) }));
  for (const g of grupo) vistos.add(g.id);
  const comIdDe = (lista) => arr(lista).filter((n) => ehObj(n) && nomeDe(n)).map((n) => Object.freeze({ id: n.id ? fim(n.id) : idDaEntrada(n, false), nome: nomeDe(n) }));
  const noutroSitio = balde(aus.filter((a) => a.sitio && !a.morto), false, (a) => ({ onde: str(a.onde) }));
  const longe = balde(aus.filter((a) => !a.sitio && !a.morto), false, (a) => ({ onde: str(a.onde) }));
  for (const id of idsMortos) vistos.delete(id);
  const mortos = balde([...mortosCat, ...aus.filter((a) => a.morto).map((a) => ({ nome: nomeDe(a), id: idNaPresenca(nomeDe(a), cat) }))], true);
  /* o resto do catálogo existe e não está aqui: conhecido (o ouvido o lê como longe) */
  const conhecidos = [
    ...balde(Object.keys(cat.porId).filter((id) => id !== idDe({}, "heroi")).map((id) => ({ id, nome: cat.porId[id].nome })), true),
    ...balde(arr(c.conhecidos), false),
  ];
  const naCidade = arr(c.naCidade).map((n) => nomeDe(n)).filter(Boolean).map((nome) => Object.freeze({ id: idNaPresenca(nome, cat), nome }));
  return Object.freeze({
    aqui: Object.freeze(aqui), age, tela: Object.freeze(tela), grupo: Object.freeze(grupo),
    doPasso: Object.freeze(comIdDe(x.doPasso)), doSitio: Object.freeze(comIdDe(x.doSitio)),
    noutroSitio: Object.freeze(noutroSitio), longe: Object.freeze(longe), mortos: Object.freeze(mortos),
    conhecidos: Object.freeze(conhecidos), naCidade: Object.freeze(naCidade), ausentes: aus, catalogo: cat,
  });
}

/* S4c · QUEM NÃO ESTÁ E A PROSA CITOU: o longe do registo, e a gente da base
   da cidade que o posto põe noutro local (com o herói num sítio ou fora dos
   muros), cujo nome está nas últimas falas do Mestre — a menção basta para
   o veto existir, porque o veto não acusa: lembra. ctx: { mostrado: [texto],
   gente: a gente da base da cidade de onde o herói é }. → [{ nome, onde }] */
export function naoEstaoAqui(q, ctx) {
  const x = ehObj(q) ? q : {};
  const c = ehObj(ctx) ? ctx : {};
  const T = QUEM_ESTA_AQUI_TABELA.naoEstao;
  const textos = arr(c.mostrado).map(str).slice(-T.falas);
  if (!textos.length) return [];
  const naProsa = " " + sem(textos.join(" ")).replace(/[^a-z0-9]+/g, " ") + " ";
  const presentes = [...arr(x.aqui), ...arr(x.doSitio), ...arr(x.doPasso)].map(nomeDe).concat(arr(x.grupo));
  const esta = (nome) => presentes.some((p) => mesmo(p, nome));
  const cand = [];
  const por = (nome, onde) => { if (nome && !esta(nome) && !cand.some((y) => mesmo(y.nome, nome))) cand.push({ nome, onde: str(onde).trim() }); };
  for (const n of arr(x.longe)) if (ehObj(n)) por(nomeDe(n), n.laFora || n.onde || n.local);
  if (x.noSitio || x.fora) for (const p of arr(c.gente)) if (ehObj(p)) por(nomeDe(p), p.local);
  const palavrasDoNome = (nome) => sem(str(nome).split(",")[0]).replace(/[^a-z0-9]+/g, " ").trim();
  const primeiros = new Map();
  for (const n of [...cand.map((y) => y.nome), ...presentes]) { const p = palavrasDoNome(n).split(" ")[0]; if (p) primeiros.set(p, (primeiros.get(p) || 0) + 1); }
  const citado = (nome) => {
    const ps = palavrasDoNome(nome);
    if (!ps) return false;
    if (naProsa.includes(" " + ps + " ")) return true;
    const p1 = ps.split(" ")[0];
    return p1.length >= T.primeiroMinimo && primeiros.get(p1) === 1 && naProsa.includes(" " + p1 + " ");
  };
  return cand.filter((y) => citado(y.nome)).slice(0, T.max);
}

/* a linha do veto (pauta, NÃO PODE): "" quando ninguém de fora foi citado */
export function linhaDeQuemNaoEsta(q, ctx) {
  const nao = naoEstaoAqui(q, ctx);
  if (!nao.length) return "";
  const T = QUEM_ESTA_AQUI_TABELA.naoEstao;
  const ondes = [...new Set(nao.map((y) => y.onde).filter(Boolean))];
  /* o grupo anda com o herói (e só entra em quemAgeAqui quando o registo o tem) */
  const aqui = [...new Set([...arr(ehObj(q) ? q.grupo : []), ...quemAgeAqui(q).map((n) => nomeDe(n))].filter(Boolean))].slice(0, T.max);
  const linha = T.linha(nao.map((y) => y.nome), ondes.length === 1 ? ondes[0] : "", aqui);
  return linha.length > T.letras ? linha.slice(0, T.letras - 1) + "…" : linha;
}

/* O pedaço do contexto de `montarEmCena` que é desta conta — o MESMO para a
   pauta (motor/pauta-do-turno.js) e para a tela (App#contextoDoEmCena). */
export function contextoDeQuemEsta(q) {
  const x = ehObj(q) ? q : {};
  return { presentes: arr(x.aqui), longe: arr(x.longe), doPasso: arr(x.doPasso), doSitio: arr(x.doSitio), foraDaCidade: !!x.fora, postosLonge: arr(x.postosLonge) };
}

/* ============================================================
   QUEM O NOME DIZ (22/11/2026, a décima segunda sessão do Mestre vivo)

   A sessão (T3, T4, T9): «pergunto a Ulric Coração-de-Ferro…», «furto a bolsa
   de Ulric Coração-de-Ferro…», «dou 3 moedas a Ulric Coração-de-Ferro…» — e as
   três linhas disseram «🧭 Ulric Olho-de-Corvo não está aqui». O primeiro nome
   casava com o primeiro ausente que o tinha, e o resto do nome, que a frase
   dizia, não era lido: o furto não rolou, o pagamento foi negado com o nome de
   outro e o conferente cortou a fala de quem estava.

   A regra de mesa, numa função que toda leitura de «quem a frase diz» chama:
     · o nome dito é lido INTEIRO (o primeiro nome e o que vem colado a ele: o
       sobrenome, «Coração-de-Ferro», «da Foz», «o Exilado»);
     · quem tem as palavras ditas é candidato; com o sobrenome dito, quem não o
       tem não é;
     · um nome que casa com quem está e com quem não está é QUEM ESTÁ;
     · dois que estão e a frase não os separa: a linha pergunta qual;
     · só o ausente casa: está noutro lugar (com onde, se o sistema sabe);
     · ninguém que o sistema conheça: nada se afirma.
   ============================================================ */
export const QUEM_O_NOME_DIZ = Object.freeze({
  /* as partículas que vivem dentro de um nome («Falk da Foz», «Merek o Exilado») */
  particulas: Object.freeze(["de", "do", "da", "dos", "das", "o", "a"]),
  primeiroMinimo: 3,
  /* a linha da mesa quando dois que estão aqui respondem pelo mesmo nome */
  qual: "✋ Qual {deles}: {Lista}? Diga o nome inteiro.",
  deles: "deles",
  porque: "o nome dito inteiro decide; o primeiro nome que casa com quem está e com quem não está é de quem está",
});
const palavrasDoNomeDito = (nome) => sem(str(nome).split(",")[0]).replace(/[^a-z0-9-]+/g, " ").trim().split(" ").filter((w) => w && !QUEM_O_NOME_DIZ.particulas.includes(w));
/* o nome como a frase o diz, a partir do primeiro nome (com a caixa original):
   «Ulric Coração-de-Ferro», «Merek o Exilado», «Quorin» → "" se não há */
export function oNomeDito(frase, primeiro) {
  try {
    const f = str(frase);
    const p = sem(primeiro);
    if (!f || p.length < QUEM_O_NOME_DIZ.primeiroMinimo) return "";
    const toks = [...f.matchAll(/[\p{L}][\p{L}'-]*/gu)];
    for (let i = 0; i < toks.length; i++) {
      if (sem(toks[i][0]) !== p || !/^\p{Lu}/u.test(toks[i][0])) continue;
      const out = [toks[i][0]];
      let j = i + 1;
      while (j < toks.length) {
        const entre = f.slice(toks[j - 1].index + toks[j - 1][0].length, toks[j].index);
        if (!/^\s+$/.test(entre)) break;
        const w = toks[j][0];
        if (/^\p{Lu}/u.test(w)) { out.push(w); j++; continue; }
        /* a partícula só entra com um nome maiúsculo logo depois («da Foz»; «de Ulric» não) */
        const prox = toks[j + 1];
        if (QUEM_O_NOME_DIZ.particulas.includes(sem(w)) && prox && /^\s+$/.test(f.slice(toks[j].index + w.length, prox.index)) && /^\p{Lu}/u.test(prox[0])) { out.push(w, prox[0]); j += 2; continue; }
        break;
      }
      return out.join(" ");
    }
    return "";
  } catch { return ""; }
}
/* quemONomeDiz(dito, { aqui, longe, conhecidos }) →
     { estado: "aqui" | "qual" | "longe" | "ninguem", nome, onde, morto, opcoes }
   `aqui`: os nomes de quem está (a cena, o grupo); `longe`: [{ nome, onde, morto }]
   (osAusentes); `conhecidos`: os nomes que o sistema sabe que existem (sem onde). */
export function quemONomeDiz(dito, quem) {
  const nada = Object.freeze({ estado: "ninguem", nome: "", onde: "", morto: false, opcoes: Object.freeze([]) });
  try {
    const W = palavrasDoNomeDito(dito);
    if (!W.length || W[0].length < QUEM_O_NOME_DIZ.primeiroMinimo) return nada;
    const q = ehObj(quem) ? quem : {};
    /* 23/11 (identidade · etapa 2): a régua mora no catálogo (quem-e-quem.js). As
       listas viram um catálogo — quem traz `id` é uma pessoa, e dois homônimos com
       dois ids são dois —, o nome dito vira candidatos uma vez, e aReguaDoDito
       escolhe: o nome inteiro, quem está, a cidade, o único. Daqui só sai a forma
       de sempre, agora com o `id` (e `ids` das opções). */
    const cat = catalogoDasListas({ aqui: q.aqui, longe: arr(q.longe).filter(ehObj), conhecidos: q.conhecidos });
    const r = oNomeDitoDiz(dito, cat);
    const ent = (c) => cat.porId[c.id] || {};
    const fz = (o) => Object.freeze({ ...o, opcoes: Object.freeze(o.opcoes || []), ids: Object.freeze(o.ids || []) });
    if (r.estado === "aqui") return fz({ estado: "aqui", nome: r.um.nome, id: r.um.id, onde: "", morto: false });
    if (r.estado === "qual") return fz({ estado: "qual", nome: "", id: "", onde: "", morto: false, opcoes: r.opcoes.map((c) => c.nome.split(",")[0].trim()), ids: r.opcoes.map((c) => c.id) });
    if (r.estado === "longe") {
      const doLonge = (c) => arr(q.longe).find((x) => ehObj(x) && ((x.id && x.id === c.id) || (!x.id && cat.origem[c.id] === "longe" && palavrasDoNomeDito(nomeDe(x)).join(" ") === palavrasDoNomeDito(c.nome).join(" ")))) || null;
      if (r.um) {
        const x = cat.origem[r.um.id] === "longe" ? doLonge(r.um) : null;
        const morto = !!(x && x.morto);
        return fz({ estado: "longe", nome: r.um.nome, id: r.um.id, onde: morto || !x ? "" : str(x.onde).trim(), morto });
      }
      return fz({ estado: "longe", nome: str(dito).trim(), id: "", onde: "", morto: false, opcoes: r.opcoes.map((c) => ent(c).nome || c.nome), ids: r.opcoes.map((c) => c.id) });
    }
    return nada;
  } catch { return nada; }
}
/* a linha da mesa quando dois que estão respondem pelo nome dito */
export function linhaDeQual(opcoes) {
  const l = arr(opcoes).map(str).filter(Boolean);
  if (l.length < 2) return "";
  const Lista = `${l.slice(0, -1).join(", ")} ou ${l[l.length - 1]}`;
  return QUEM_O_NOME_DIZ.qual.replace("{deles}", QUEM_O_NOME_DIZ.deles).replace("{Lista}", Lista);
}

/* ============================================================
   A CASA DE QUEM TEM POSTO (22/11/2026, a décima segunda sessão)

   «Em cena: Quorin» na Casa do Calafate, no Molhe Velho e no Pátio das Trocas,
   e «Quorin Barba-Ruiva, Quorin» no Gabinete do Prático, onde ele trabalha. O
   registo guardava um «Quorin» de primeiro nome só, com paradeiro escrito pela
   cena (a cidade, ou o sítio onde a prosa o mostrou), e a base do mundo sabe
   que Quorin Barba-Ruiva tem posto no Gabinete. Dois registos, duas verdades,
   e o de primeiro nome ia atrás do herói.

   A regra: a gente da base que tem posto (o `local` da base) é ESTA pessoa em
   qualquer registo que diga o nome dela inteiro, ou só o primeiro nome quando
   nenhum outro da base o partilha — e a casa dela é a da base. O registo e a
   prosa não mudam o posto de quem tem posto. → { nome, local } | null */
export function aCasaNaBase(nome, gente) {
  try {
    const W = palavrasDoNomeDito(nome);
    if (!W.length || W[0].length < QUEM_O_NOME_DIZ.primeiroMinimo) return null;
    /* 23/11 (identidade · etapa 2): os candidatos saem do catálogo. Cada pessoa da
       base é uma (o id que a base lhe dá, ou a posição na lista): dois homônimos
       com posto nunca viram um só, e o nome que não separa ninguém não dá casa */
    const toda = arr(gente).map((p, i) => (ehObj(p) && nomeDe(p) ? { p, id: str(p.id).trim() || `gente#${i}` } : null)).filter(Boolean);
    const comPosto = toda.filter(({ p }) => str(p.local).trim() && !/morto/i.test(str(p.status)));
    const casa = (x) => ({ nome: nomeDe(x.p), local: str(x.p.local).trim(), id: x.id });
    const catPosto = catalogoDasListas({ conhecidos: comPosto.map(({ p, id }) => ({ nome: nomeDe(p), id })) });
    const inteiro = candidatos(nome, catPosto, null, { niveis: QUEM_E_QUEM_DITO.niveis }).filter((c) => palavrasDoNomeDito(c.nome).join(" ") === W.join(" "));
    if (inteiro.length === 1) return casa(comPosto.find((x) => x.id === inteiro[0].id));
    if (W.length !== 1) return null;
    const catToda = catalogoDasListas({ conhecidos: toda.map(({ p, id }) => ({ nome: nomeDe(p), id })) });
    const mesmoPrimeiro = candidatos(nome, catToda, null, { niveis: ["primeiro"] });
    const um = mesmoPrimeiro.length === 1 ? toda.find((x) => x.id === mesmoPrimeiro[0].id) : null;
    if (!um || !str(um.p.local).trim()) return null;
    return casa(um);
  } catch { return null; }
}

/* ============================================================
   S7b · O RETRATO PRESO (17/11/2026). A prova de 16/11 viu o retrato de
   Merek — com quem o jogador falara na oficina — preso em «EM CENA» no
   mercado, depois de o herói mudar de lugar, sem aparecer na prosa. A
   causa: o registo fica «à vista» pela prosa (em-cena.js §2,
   `aVistaPelaProsa`), e a prosa lida era a das últimas falas do Mestre —
   as da oficina. Agora cada fala do Mestre leva o sítio onde foi dita
   (entrega-do-turno.js#aEntrega, campo novo `onde`, que a versão antiga
   ignora), e o «à vista» só lê as falas DESTE sítio. Fala sem `onde` (o
   save de antes) conta como sempre contou.
   ============================================================ */
/* o sítio da cena numa chave: a cidade, o lugar, a masmorra, a estrada */
export function ondeDaCena(estado) {
  const e = ehObj(estado) ? estado : {};
  const j = ehObj(e.jornada) ? `${str(e.jornada.de)}>${str(e.jornada.para)}` : "";
  const m = ehObj(e.masmorra) && !e.masmorra.encerrada ? str(e.masmorra.nome || e.masmorra.id) : "";
  return [sem(e.cidadeAtual), semArtigo(nomeDe(e.lugar)), sem(m), sem(j)].join("|");
}

/* as últimas `n` falas do Mestre ditas NESTE sítio (as sem sítio contam) */
export function falasDoMestreAqui(msgs, onde, n = 2) {
  const aqui = str(onde);
  return arr(msgs).filter((m) => ehObj(m) && m.autor === "mestre" && typeof m.texto === "string" && m.texto.trim())
    .slice(-n).filter((m) => !aqui || typeof m.onde !== "string" || m.onde === aqui).map((m) => m.texto);
}
