/* ============================================================
   O LIVRO DE FACTOS — o «já nos encontrámos» de cada pessoa e lugar
   (08/11/2026, Fase BQ · BQ1)

   A planta da biblioteca de quests (mente/plano-biblioteca-de-quests.md,
   §1 e §4) contou 17 fechos de etapa documentados que falharam — 11 que
   não fechavam nunca, 6 que fechavam cedo ou em falso — e achou-lhes
   quatro causas. Este módulo mata três delas:

     (a) O NOME COMO CHAVE. As etapas guardavam um nome e comparavam-no na
         hora de ler, cada uma à sua maneira (`norm`, `mesmaPessoa`,
         `includes`): «Marl de Osso» contra «Marl» (v9.195), o lugar contra
         o id `Cidade|tipo` (MM13). Aqui O NOME PASSA A ID UMA VEZ, quando o
         facto se escreve (`idDaPessoa`, `idDoLugar`), e quem lê compara ids.
     (b) O FACTO QUE DURA UM TURNO. `falouCom` e `segredosRevelados` viviam
         só na conferência do turno em que o Cronista os via, e os rendidos
         ficavam em `derrotadosDaSessao`, que não vai ao save. «Encontrar
         Corrado» (13.ª sessão) ficou em falso com a heroína a falar com ele
         do T2 ao T5. Aqui o facto fica escrito, com o dia.
     (c) A PRESENÇA COMO PROVA. A Delfina «encontrada» no turno 5 porque o
         Teodoro disse onde ela vivia (MM14); o Dário e o Fogão fechados à
         porta (6.ª). Aqui CONHECER NÃO É SER NOMEADO: `nomeado` (o registo
         ouviu o nome) e `visto` (estiveram frente a frente) são factos
         diferentes, e só o segundo responde a `conheceu`. E estar com
         alguém não é ter falado com ele: `falou` só vem da conversa.

   A quarta causa (d), a condição que o mundo não produz, não é deste
   módulo: é do vocabulário de predicados (BQ3), cuja catraca exige que
   cada predicado tenha quem o escreva. Por isso cada tipo de facto daqui
   diz na tabela de onde vem (`TIPOS_DE_FACTO[*].porta`) — e os dois que
   ainda não têm quem os escreva no jogo (`recebeu`, `prometeu`) dizem-no
   com `porta: null`, em vez de fingirem que têm.

   O LIVRO VAI AO SAVE, num campo NOVO e aditivo, `factos` (a ordem de 28/09
   permite-o: campo novo, ignorado pela versão antiga, desfeito num commit
   revertido). A versão de antes não o lê; se a pessoa voltar a ela, o
   primeiro autosave deixa-o cair e o jogo fica inteiro — o precedente é a
   `memoria` das fichas (F2d). O livro TEM TETO (LIVRO_DE_FACTOS), porque
   uma campanha longa conhece gente sem fim: quando passa, sai quem menos
   pesa e há mais tempo, e nunca quem a quest aberta protege.

   PURO E DETERMINÍSTICO. Nenhuma sorte, nenhum relógio: o dia e o turno
   entram por argumento. O estado recebido nunca é mutado; o `null` e o
   lixo dão o livro vazio, nunca uma exceção.
   ============================================================ */
import { HOMONIMO, FORCA_MAX } from "./npcs.js";
import { idDaGente } from "./mundo-base.js";
import { MARCOS_VINCULO } from "./vinculos.js";

/* ---------------- OS TETOS ----------------
   `pessoas` e `lugares`: quantas entradas o livro guarda. A planta propôs
   120 e 80; os lugares sobem a 100 porque uma visita escreve até três (o
   cómodo, o prédio de que ele é parte, e a cidade). 120 pessoas é mais do
   que cinco vezes o que o Narrador pode ver de uma vez (TETO_DAS_PESSOAS,
   22), e o registo de uma campanha de 14 sessões cabe nele.
   `recebeu` e `prometeu`: as listas por pessoa (as mais recentes ficam).
   `nome` e `texto`: o tamanho do que se guarda por extenso.
   `chars`: o orçamento do livro CHEIO no save (JSON), e a suíte mede-o com
   as 220 entradas preenchidas como uma campanha longa as deixa. O save da
   14.ª sessão, ao T30, pesava 138 mil caracteres (sessao-guardada.js): o
   livro cheio, medido na suíte com nomes, cidades e dias do
   tamanho dos de uma campanha longa, fica perto dos 48 mil — pouco mais de
   um terço disso —, e o comum é muito menos.
   `vezNova.turnos`: duas conversas com a mesma pessoa contam como DUAS
   vezes quando entre elas passaram mais do que estes turnos, ou mudou o
   dia — falar do T2 ao T5 é UMA conversa, não quatro. */
export const LIVRO_DE_FACTOS = Object.freeze({
  v: 1,
  pessoas: 120,
  lugares: 100,
  recebeu: 4,
  prometeu: 3,
  nome: 40,
  texto: 60,
  id: 120,
  chars: 50000,
  vezNova: Object.freeze({ turnos: 3 }),
});

/* ---------------- OS TIPOS DE FACTO ----------------
   `de`: de quem é o facto (pessoa ou lugar). `entrada`: a chave de
   `anotarTurno(livro, ocorrido)` que o escreve. `porta`: quem o produz no
   jogo hoje (null = ninguém ainda, e a suíte o confere). `peso`: quanto o
   facto segura a entrada quando o livro passa do teto — o nome só ouvido
   sai primeiro, a conversa e a luta ficam. `forma`: a forma no save.
   O `nomeado` NUNCA responde a `conheceu`: é a distinção que a MM14 pediu
   e que `conhecidoEm` (npcs.js) não faz. */
const marcaDeDias = "{ de, ate, vezes, turno }";
export const TIPOS_DE_FACTO = Object.freeze({
  nomeado: Object.freeze({ de: "pessoa", entrada: "nomeados", peso: 0, forma: "{ de }",
    porta: "o registo do Cronista (motor/cronista-do-turno.js, SEÇÃO pessoas): quem entrou no registo por ser nomeado" }),
  visto: Object.freeze({ de: "pessoa", entrada: "emCena", peso: 1, forma: marcaDeDias,
    porta: "montarEmCena (em-cena.js): quem está à vista com fonte do sistema; e quem falou, lutou ou recebeu",
    /* de onde a presença conta sozinha: o grupo, o registo, o núcleo. O que
       só a prosa trouxe (SO_DA_PROSA, em-cena.js) não conta — mas passa a
       contar se o Cronista o puser na conversa */
    fontes: Object.freeze(["grupo", "registo", "nucleo"]) }),
  falou: Object.freeze({ de: "pessoa", entrada: "falouCom", peso: 3, forma: marcaDeDias,
    porta: "o falou_com do Cronista (motor/cronista-do-turno.js, SEÇÃO falou_com), guardado em vez de apagado" }),
  afeicao: Object.freeze({ de: "pessoa", entrada: "afeicoes", peso: 2, forma: "{ grau, dia }",
    porta: "o vínculo do companheiro (vinculos.js) e o laço dos outros (npcs.js), lidos por grauDeAfeicao" }),
  derrotado: Object.freeze({ de: "pessoa", entrada: "derrotados", peso: 3, forma: "{ dia, como }",
    porta: "o fim da luta (App.jsx e motor/luta-do-turno.js): os caídos, com rendido, desacordado e fugiu" }),
  recebeu: Object.freeze({ de: "pessoa", entrada: "entregas", peso: 2, forma: "[item]",
    porta: null }),
  prometeu: Object.freeze({ de: "pessoa", entrada: "promessas", peso: 2, forma: "[{ o, dia }]",
    porta: null }),
  esteve: Object.freeze({ de: "lugar", entrada: "lugar", peso: 1, forma: marcaDeDias,
    porta: "o lugar e a cidade no fim do turno (lugarRef, cidadeAtualRef)" }),
  descobriu: Object.freeze({ de: "lugar", entrada: "segredos", peso: 3, forma: "{ dia }",
    porta: "segredosReveladosNoTurno (saga.js), com o herói no lugar" }),
});

/* ---------------- COMO ALGUÉM CAI ----------------
   O peso diz qual fica quando a mesma pessoa cai duas vezes (rendeu-se,
   e depois morreu: fica morto). `poupado`: as quedas em que a pessoa
   continua viva — é o `poupou(p)` da planta (§3), que a lista inclui o
   fugido de propósito: ninguém o matou. A ordem de `deFlags` é a ordem em
   que as marcas do inimigo da luta se leem (`fugiu` antes de tudo: quem
   fugiu não tombou, v9.14). */
export const COMO_CAIU = Object.freeze({
  pesos: Object.freeze({ fugiu: 0, rendido: 1, desacordado: 2, morto: 3 }),
  poupado: Object.freeze(["fugiu", "rendido", "desacordado"]),
  deFlags: Object.freeze(["fugiu", "rendido", "desacordado"]),
});

/* ---------------- DO NOME AO ID: A REGRA DE DESEMPATE ----------------
   As fontes, da que manda mais à que manda menos: a gente da base do
   mundo (o id é `Cidade|gente|Nome`, o de `idDaGente`), o núcleo da
   campanha, o grupo, o registo e o cânone do Cronista (o id é `npc|Nome`).
   UMA PESSOA, UM ID: quem está numa fonte de baixo com o nome igual — ou
   com o nome mais curto, palavra a palavra («Marl» de «Marl de Osso») — a
   UMA SÓ pessoa de uma fonte de cima, e na mesma cidade quando as duas a
   dizem, é essa pessoa, e leva o id dela.

   Um nome procura-se por dois níveis, e pára no primeiro que acha alguém:
     · `exato` — as palavras todas iguais, sem acento, sem artigo nem
       tratamento à frente (HOMONIMO.artigos, npcs.js: «Dona Inocência»),
       e sem o aposto («Corrado, o empresário da arena» é «Corrado»);
     · `prefixo` — um nome é o começo do outro, palavra a palavra, com o
       primeiro nome de pelo menos HOMONIMO.primeiroMinimo letras.
   NÃO HÁ o nível «só o primeiro nome»: «Nyla Pé-Leve» e «Nyla
   Punho-de-Pedra» são duas pessoas (10.ª sessão), e um fecho em falso não
   se desfaz, enquanto o que não fecha aparece no «o que falta».

   Mais de uma pessoa no nível: fica a ÚNICA que está na cidade do herói.
   Nenhuma ou mais de uma: AMBÍGUO, e não se escreve nada (fica a nota).
   Nome que ninguém tem: DESCONHECIDO, e também não se escreve — o registo
   é quem diz que alguém existe (o Cronista escreve-o antes da conversa), e
   isto deixa de fora a descrição («o guarda») que nunca ganhou ficha. */
export const RESOLVER_NOME = Object.freeze({
  fontes: Object.freeze(["gente", "nucleo", "grupo", "registo", "canone"]),
  niveis: Object.freeze(["exato", "prefixo"]),
  prefixoDoRegisto: "npc|",
  /* o que corta o aposto: a vírgula, o parêntese, o travessão */
  aposto: /[,(—–]/,
});

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const semAc = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const limpo = (s, max = LIVRO_DE_FACTOS.nome) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "");
/* dia e turno: inteiro, não negativo; o resto é «não se sabe» */
const inteiro = (v) => {
  if (v === null || v === undefined || v === "" || typeof v === "boolean") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};
const nomeDe = (x) => (typeof x === "string" ? x : obj(x) && typeof x.nome === "string" ? x.nome : "");

/* as palavras que fazem o nome: sem o aposto, sem acento, sem artigo */
function palavrasDoNome(nome) {
  let s = String(nome == null ? "" : nome);
  const corte = s.search(RESOLVER_NOME.aposto);
  if (corte > 0) s = s.slice(0, corte);
  const ps = semAc(s).replace(/[^a-z0-9-]+/g, " ").split(/\s+/).filter((w) => w && w !== "-");
  while (ps.length > 1 && HOMONIMO.artigos.includes(ps[0])) ps.shift();
  return ps;
}
const casaExato = (a, b) => a.length > 0 && a.length === b.length && a.every((w, i) => w === b[i]);
function casaPrefixo(a, b) {
  const [curto, longo] = a.length <= b.length ? [a, b] : [b, a];
  if (!curto.length || curto[0].length < HOMONIMO.primeiroMinimo) return false;
  return curto.every((w, i) => w === longo[i]);
}
const CASA = { exato: casaExato, prefixo: casaPrefixo };
/* duas «ondes» são compatíveis quando uma nomeia a outra, palavra a palavra
   («nas docas de Alto do Sal» e «Alto do Sal»); sem uma delas, não se sabe */
const frase = (s) => ` ${semAc(s).replace(/[^a-z0-9]+/g, " ").trim()} `;
function mesmaTerra(a, b) {
  const x = frase(a), y = frase(b);
  if (!x.trim() || !y.trim()) return true;
  return x.includes(y) || y.includes(x);
}
const naCidade = (onde, cidade) => !!frase(onde).trim() && !!frase(cidade).trim() && frase(onde).includes(frase(cidade));

/* ---------------- O ELENCO QUE RESOLVE ----------------
   Cada candidato: { fonte, nome, id, onde, ps }. Os de fontes de baixo que
   são uma só pessoa de cima ficam com o id dela (`para`). */
function montarElenco(ctx) {
  const c = obj(ctx) || {};
  const cidade = limpo(c.cidade, LIVRO_DE_FACTOS.id);
  const pre = RESOLVER_NOME.prefixoDoRegisto;
  const cands = [];
  const por = (fonte, nome0, id, onde) => {
    const nome = limpo(nome0);
    const ps = palavrasDoNome(nome);
    if (!ps.length || !id || id.length > LIVRO_DE_FACTOS.id) return;
    cands.push({ fonte, nome, id, onde: typeof onde === "string" ? onde : "", ps, rank: RESOLVER_NOME.fontes.indexOf(fonte), para: null });
  };
  for (const g of arr(c.gente)) {
    const o = obj(g) || { nome: g };
    const nome = nomeDe(o);
    const cid = limpo(o.cidade, LIVRO_DE_FACTOS.id) || cidade;
    const id = typeof o.id === "string" && o.id.includes("|gente|") ? o.id : cid && nome ? idDaGente(cid, { nome: limpo(nome) }) : "";
    por("gente", nome, id, cid);
  }
  const nucleo = Array.isArray(c.nucleo) ? c.nucleo : arr(obj(c.nucleo) && c.nucleo.pessoas);
  for (const q of nucleo) { const n = limpo(nomeDe(q)); por("nucleo", n, n && pre + n, (obj(q) && q.cidade) || ""); }
  for (const g of arr(c.grupo)) { const n = limpo(nomeDe(g)); por("grupo", n, n && pre + n, ""); }
  const reg = obj(c.npcs) || {};
  for (const k of Object.keys(reg)) {
    const f = obj(reg[k]) || {};
    const chave = limpo(k);
    por("registo", typeof f.nome === "string" && f.nome.trim() ? f.nome : chave, chave && pre + chave, f.cidade || f.local || "");
  }
  for (const x of arr(c.canone)) { const n = limpo(nomeDe(x)); por("canone", n, n && pre + n, (obj(x) && (x.cidade || x.local)) || ""); }
  /* uma pessoa, um id: cada um procura-se nos de cima que já são eles mesmos */
  for (const x of cands) {
    const cima = cands.filter((h) => h.rank < x.rank && !h.para && h.id !== x.id && mesmaTerra(h.onde, x.onde));
    for (const nivel of RESOLVER_NOME.niveis) {
      const ids = [...new Set(cima.filter((h) => CASA[nivel](x.ps, h.ps)).map((h) => h.id))];
      if (ids.length === 1) { x.para = ids[0]; break; }
      if (ids.length > 1) break;
    }
  }
  const dono = new Map();
  for (const x of cands) if (!x.para && !dono.has(x.id)) dono.set(x.id, x);
  return { cands, dono, cidade, heroi: palavrasDoNome(c.heroi) };
}

const RX_ID_PESSOA = /^(npc\|.+|[^|]+\|gente\|.+)$/;
function resolverCom(el, nome0) {
  const nome = typeof nome0 === "string" ? nome0.trim() : nomeDe(nome0).trim();
  const ps = palavrasDoNome(nome);
  const fora = (motivo, extra = {}) => ({ id: "", nome: limpo(nome), motivo, ...extra });
  if (!ps.length) return fora("vazio");
  if (nome.length <= LIVRO_DE_FACTOS.id && RX_ID_PESSOA.test(nome)) return { id: nome, nome: limpo(nome.split("|").pop()), motivo: "id" };
  /* o herói nunca é gente da cena (a régua de nomeComDono, npcs.js) */
  const h = el.heroi;
  if (h.length && (casaExato(ps, h) || (ps.length === 1 && ps[0] === h[0]))) return fora("heroi");
  for (const nivel of RESOLVER_NOME.niveis) {
    const ids = [...new Set(el.cands.filter((x) => CASA[nivel](ps, x.ps)).map((x) => x.para || x.id))].filter((id) => el.dono.has(id));
    if (!ids.length) continue;
    let fica = ids;
    if (fica.length > 1 && el.cidade) fica = ids.filter((id) => naCidade(el.dono.get(id).onde, el.cidade));
    if (fica.length === 1) {
      const d = el.dono.get(fica[0]);
      return { id: d.id, nome: d.nome, motivo: nivel };
    }
    return fora("ambiguo", { candidatos: ids.map((id) => el.dono.get(id).nome) });
  }
  return fora("desconhecido");
}

/* idDaPessoa(nome, ctx) → { id, nome, motivo, candidatos? }
   ctx: { gente: [{ nome, cidade, id? }], nucleo: [{ nome, cidade }] | { pessoas },
          grupo: [nome | { nome }], npcs: { chave: ficha }, canone: [nome | { nome }],
          cidade, heroi }
   `id` vazio quando não se escreve: motivo vazio, heroi, ambiguo ou
   desconhecido. Um id já feito (`npc|…`, `…|gente|…`) passa como veio. */
export function idDaPessoa(nome, ctx) {
  return resolverCom(montarElenco(ctx), nome);
}

/* ---------------- O ID DE UM LUGAR ----------------
   Pela ordem: o id que o lugar já traz (`id` ou `chave`, a forma
   `Cidade|tipo` da base); a ponte do App (`ctx.chaveDoLugar(nome,
   cidade)`, a `chaveDoLugar` de mundo-base.js, que dá o id da base ao nome
   de um local); a própria cidade (`cidade|<nome>`); e o sítio que o
   Mestre inventou (`<cidade>|sitio|<nome>`, sem acento nem artigo — o
   mesmo sítio dito com outra caixa é o mesmo id). `{ cidade }` sem nome é
   a cidade. Sem nome nem cidade: "". */
const chaveDeTexto = (s) => palavrasDoNome(s).join(" ");
export function idDoLugar(lugar, ctx) {
  const c = obj(ctx) || {};
  const l = typeof lugar === "string" ? { nome: lugar } : obj(lugar) || {};
  for (const k of [l.id, l.chave]) if (typeof k === "string" && k.includes("|") && k.length <= LIVRO_DE_FACTOS.id) return k;
  const nome = limpo(l.nome, LIVRO_DE_FACTOS.id);
  const cidade = limpo(l.cidade, LIVRO_DE_FACTOS.id) || limpo(c.cidade, LIVRO_DE_FACTOS.id);
  if (!nome) return cidade && chaveDeTexto(cidade) ? `cidade|${chaveDeTexto(cidade)}` : "";
  if (typeof c.chaveDoLugar === "function") {
    try {
      const k = c.chaveDoLugar(nome, cidade);
      if (typeof k === "string" && k.includes("|") && k.length <= LIVRO_DE_FACTOS.id) return k;
    } catch { /* a ponte nunca derruba a escrita */ }
  }
  const n = chaveDeTexto(nome);
  if (!n) return "";
  if (cidade && n === chaveDeTexto(cidade)) return `cidade|${n}`;
  return `${chaveDeTexto(cidade)}|sitio|${n}`;
}

/* ---------------- A AFEIÇÃO, GRADUADA ----------------
   Um grau de 0 a 4, a mesma régua para todos (a planta, §3): o
   companheiro pelo marco do vínculo que alcançou (MARCOS_VINCULO: 25, 50,
   75, 100 → 1 a 4); os outros pela força do laço (1 a FORCA_MAX), e o
   laço rompido conta 0. Aceita { grau }, { vinculo } ou { laco }. */
export function grauDeAfeicao(fonte) {
  const f = obj(fonte);
  if (!f) return 0;
  const maximo = MARCOS_VINCULO.length;
  if (f.grau !== undefined && f.grau !== null) { const g = inteiro(f.grau); return g == null ? 0 : Math.min(maximo, g); }
  if (f.vinculo !== undefined && f.vinculo !== null) {
    const v = Number(f.vinculo);
    return Number.isFinite(v) ? MARCOS_VINCULO.filter((m) => v >= m.valor).length : 0;
  }
  const laco = obj(f.laco);
  if (laco) {
    if (laco.rompido) return 0;
    const forca = inteiro(laco.forca);
    return forca == null ? 0 : Math.min(FORCA_MAX, forca);
  }
  return 0;
}

/* ---------------- O LIVRO VAZIO E O LIVRO DO SAVE ---------------- */
const vazio = () => ({ v: LIVRO_DE_FACTOS.v, pessoas: {}, lugares: {} });

function marcaLimpa(m) {
  const o = obj(m);
  if (!o) return null;
  const vezes = inteiro(o.vezes);
  return { de: inteiro(o.de), ate: inteiro(o.ate), vezes: vezes && vezes > 0 ? vezes : 1, turno: inteiro(o.turno) };
}
function pessoaLimpa(p) {
  const o = obj(p);
  if (!o) return null;
  const out = {};
  const nome = limpo(o.nome);
  if (nome) out.nome = nome;
  if (obj(o.nomeado)) out.nomeado = { de: inteiro(o.nomeado.de) };
  for (const k of ["visto", "falou"]) { const m = marcaLimpa(o[k]); if (m) out[k] = m; }
  const af = obj(o.afeicao);
  if (af) { const g = grauDeAfeicao({ grau: af.grau }); if (g > 0) out.afeicao = { grau: g, dia: inteiro(af.dia) }; }
  const d = obj(o.derrotado);
  if (d && Object.prototype.hasOwnProperty.call(COMO_CAIU.pesos, d.como)) out.derrotado = { dia: inteiro(d.dia), como: d.como };
  const rec = [...new Set(arr(o.recebeu).map((i) => limpo(i)).filter(Boolean))].slice(-LIVRO_DE_FACTOS.recebeu);
  if (rec.length) out.recebeu = rec;
  const pro = arr(o.prometeu).map((x) => obj(x)).filter((x) => x && limpo(x.o, LIVRO_DE_FACTOS.texto))
    .map((x) => ({ o: limpo(x.o, LIVRO_DE_FACTOS.texto), dia: inteiro(x.dia) })).slice(-LIVRO_DE_FACTOS.prometeu);
  if (pro.length) out.prometeu = pro;
  return Object.keys(out).some((k) => k !== "nome") ? out : null;
}
function lugarLimpo(l) {
  const o = obj(l);
  if (!o) return null;
  const out = {};
  const nome = limpo(o.nome);
  if (nome) out.nome = nome;
  const m = marcaLimpa(o.esteve);
  if (m) out.esteve = m;
  if (obj(o.descobriu)) out.descobriu = { dia: inteiro(o.descobriu.dia) };
  return Object.keys(out).some((k) => k !== "nome") ? out : null;
}

/* ---------------- O TETO ----------------
   O peso de uma entrada é a soma dos pesos dos factos que ela tem
   (TIPOS_DE_FACTO); a idade é o último dia e o último turno em que algo
   lhe foi escrito. Sai primeiro o mais leve, entre os leves o mais velho, e
   o id desempata (a mesma ordem em qualquer máquina). Os `protegidos` (os
   ids que uma quest aberta usa) nunca saem. */
const pesoDe = (e) => Object.keys(TIPOS_DE_FACTO).reduce((s, k) => s + (e[k] ? TIPOS_DE_FACTO[k].peso : 0), 0);
function idadeDe(e) {
  let dia = -1, turno = -1;
  for (const k of Object.keys(e)) {
    const v = e[k];
    const vs = Array.isArray(v) ? v : [v];
    for (const x of vs) {
      const o = obj(x);
      if (!o) continue;
      for (const d of [o.de, o.ate, o.dia]) if (Number.isFinite(d) && d > dia) dia = d;
      if (Number.isFinite(o.turno) && o.turno > turno) turno = o.turno;
    }
  }
  return { dia, turno };
}
function aparar(mapa, teto, protegidos) {
  const ids = Object.keys(mapa);
  if (ids.length <= teto) return mapa;
  const guarda = new Set(protegidos);
  const fila = ids.filter((id) => !guarda.has(id)).map((id) => ({ id, peso: pesoDe(mapa[id]), ...idadeDe(mapa[id]) }))
    .sort((a, b) => a.peso - b.peso || a.dia - b.dia || a.turno - b.turno || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const sai = new Set(fila.slice(0, Math.max(0, ids.length - teto)).map((x) => x.id));
  const out = {};
  for (const id of ids) if (!sai.has(id)) out[id] = mapa[id];
  return out;
}

/* garantirFactos(x, { protegidos }) → o livro limpo, sempre um objeto novo.
   O save sem o campo (todas as campanhas de antes), o `null` e o lixo dão
   o livro vazio; cada entrada passa pela forma da tabela, o que não é
   facto cai, e o teto vale. */
export function garantirFactos(x, opcoes) {
  const o = obj(x);
  const out = vazio();
  if (!o) return out;
  const protegidos = arr(obj(opcoes) && opcoes.protegidos).filter((id) => typeof id === "string");
  const LIMPEZA = { pessoas: pessoaLimpa, lugares: lugarLimpo };
  for (const campo of Object.keys(LIMPEZA)) {
    const m = obj(o[campo]) || {};
    for (const id of Object.keys(m)) {
      if (!id.trim() || id.length > LIVRO_DE_FACTOS.id) continue;
      const e = LIMPEZA[campo](m[id]);
      if (e) out[campo][id] = e;
    }
    out[campo] = aparar(out[campo], LIVRO_DE_FACTOS[campo], protegidos);
  }
  return out;
}

/* ---------------- ESCREVER: UMA MARCA DE DIAS ----------------
   A primeira vez abre a marca; as seguintes movem o `ate` e o `turno`, e
   somam uma vez quando a anterior já acabou (LIVRO_DE_FACTOS.vezNova: o
   dia mudou, passaram mais turnos do que a régua, ou o turno voltou atrás
   — um contador que recomeçou). O mesmo turno nunca soma duas vezes. */
function ehVezNova(m, dia, turno) {
  if (dia != null && m.ate != null && dia > m.ate) return true;
  if (turno != null && m.turno != null) return turno < m.turno || turno - m.turno > LIVRO_DE_FACTOS.vezNova.turnos;
  return false;
}
function marcar(m, dia, turno) {
  if (!m) return { de: dia, ate: dia, vezes: 1, turno };
  return { de: m.de != null ? m.de : dia, ate: dia != null ? Math.max(dia, m.ate != null ? m.ate : dia) : m.ate, vezes: m.vezes + (ehVezNova(m, dia, turno) ? 1 : 0), turno: turno != null ? turno : m.turno };
}
const comoDe = (d) => {
  const o = obj(d) || {};
  if (Object.prototype.hasOwnProperty.call(COMO_CAIU.pesos, o.como)) return o.como;
  for (const f of COMO_CAIU.deFlags) if (o[f]) return f;
  return "morto";
};

/* ---------------- ANOTAR O TURNO ----------------
   anotarTurno(livro, ocorrido) → { factos, notas }
   `ocorrido`, tudo opcional (cada sítio da fiação passa o que tem):
     dia, turno               — o dia do mundo e o contador de turnos
     heroi, cidade, gente, nucleo, grupo, npcs, canone — o elenco que resolve
                                os nomes (ver idDaPessoa)
     nomeados: [nome]         — quem o registo acabou de ouvir nomear
     emCena:   [entrada]      — a lista de montarEmCena (pessoas `aqui`, por
                                fonte do sistema — TIPOS_DE_FACTO.visto.fontes)
     falouCom: [nome]         — o falou_com do Cronista
     derrotados: [{ nome, como } | inimigo da luta com fugiu/rendido/desacordado]
     afeicoes: [{ quem, grau | vinculo | laco }]
     entregas: [{ a, item }]  — porta ainda por fazer
     promessas: [{ a, o }]    — porta ainda por fazer
     lugar: { nome, cidade, dentroDe, id?, chave? } | nome
     naEstrada: true          — em viagem, a cidade não conta como visitada
     segredos: [nome do lugar] — segredosReveladosNoTurno
     chaveDoLugar: (nome, cidade) => id da base
     protegidos: [id]         — o que o teto nunca tira
   `notas`: o que não se escreveu por ambiguidade, com os candidatos — para
   a consola e o diário, nunca para a tela. */
export function anotarTurno(livro, ocorrido) {
  const o = obj(ocorrido) || {};
  const base = garantirFactos(livro, { protegidos: o.protegidos });
  const dia = inteiro(o.dia), turno = inteiro(o.turno);
  const el = montarElenco(o);
  const notas = [];
  const pessoas = { ...base.pessoas };
  const lugares = { ...base.lugares };
  const resolver = (nome) => {
    const r = resolverCom(el, nome);
    if (!r.id && r.motivo === "ambiguo") notas.push({ nome: limpo(nomeDe(nome) || String(nome || "")), motivo: r.motivo, candidatos: r.candidatos });
    return r.id ? r : null;
  };
  const tocar = (r, f) => {
    const atual = pessoas[r.id] || {};
    pessoas[r.id] = f({ ...atual, nome: atual.nome || limpo(r.nome) });
  };
  /* visto uma vez por chamada, mesmo que três canais o digam */
  const vistos = new Set();
  const ver = (r) => {
    if (vistos.has(r.id)) return;
    vistos.add(r.id);
    tocar(r, (e) => ({ ...e, visto: marcar(e.visto, dia, turno) }));
  };

  for (const n of arr(o.nomeados)) {
    const r = resolver(n);
    if (r) tocar(r, (e) => (e.nomeado ? e : { ...e, nomeado: { de: dia } }));
  }
  const fontes = TIPOS_DE_FACTO.visto.fontes;
  for (const x of arr(o.emCena)) {
    const e = obj(x);
    if (!e || (e.tipo && e.tipo !== "pessoa") || !e.aqui || !fontes.includes(e.deOnde)) continue;
    const r = resolver(e.nome);
    if (r) ver(r);
  }
  const falou = new Set();
  for (const n of arr(o.falouCom)) {
    const r = resolver(n);
    if (!r || falou.has(r.id)) continue;
    falou.add(r.id);
    tocar(r, (e) => ({ ...e, falou: marcar(e.falou, dia, turno) }));
    ver(r);
  }
  for (const d of arr(o.derrotados)) {
    const r = resolver(d);
    if (!r) continue;
    const como = comoDe(d);
    tocar(r, (e) => (e.derrotado && COMO_CAIU.pesos[e.derrotado.como] >= COMO_CAIU.pesos[como] ? e : { ...e, derrotado: { dia, como } }));
    ver(r);
  }
  for (const a of arr(o.afeicoes)) {
    const x = obj(a);
    const r = x && resolver(x.quem);
    if (!r) continue;
    const grau = grauDeAfeicao(x);
    if (grau > 0) tocar(r, (e) => (e.afeicao && e.afeicao.grau >= grau ? e : { ...e, afeicao: { grau, dia } }));
  }
  for (const a of arr(o.entregas)) {
    const x = obj(a);
    const item = x && limpo(nomeDe(x.item) || "");
    const r = item && resolver(x.a);
    if (!r) continue;
    tocar(r, (e) => {
      const ja = arr(e.recebeu).filter((i) => semAc(i) !== semAc(item));
      return { ...e, recebeu: [...ja, item].slice(-LIVRO_DE_FACTOS.recebeu) };
    });
    ver(r);
  }
  for (const a of arr(o.promessas)) {
    const x = obj(a);
    const texto = x && limpo(x.o, LIVRO_DE_FACTOS.texto);
    const r = texto && resolver(x.a);
    if (!r) continue;
    tocar(r, (e) => (arr(e.prometeu).some((p) => semAc(p.o) === semAc(texto)) ? e
      : { ...e, prometeu: [...arr(e.prometeu), { o: texto, dia }].slice(-LIVRO_DE_FACTOS.prometeu) }));
  }

  /* os lugares: o sítio, o prédio de que ele é cómodo, e a cidade */
  const ctxL = { cidade: o.cidade, chaveDoLugar: o.chaveDoLugar };
  const estiveram = new Set();
  const estar = (id, nome) => {
    if (!id || estiveram.has(id)) return;
    estiveram.add(id);
    const atual = lugares[id] || {};
    lugares[id] = { ...atual, nome: atual.nome || limpo(nome), esteve: marcar(atual.esteve, dia, turno) };
  };
  const l = typeof o.lugar === "string" ? { nome: o.lugar } : obj(o.lugar);
  if (l) {
    estar(idDoLugar(l, ctxL), l.nome);
    if (typeof l.dentroDe === "string" && l.dentroDe.trim()) estar(idDoLugar({ nome: l.dentroDe, cidade: l.cidade }, ctxL), l.dentroDe);
  }
  const cid = limpo((l && l.cidade) || o.cidade, LIVRO_DE_FACTOS.id);
  if (cid && !o.naEstrada) estar(idDoLugar({ cidade: cid }), cid);
  for (const s of arr(o.segredos)) {
    const nome = nomeDe(s);
    const id = idDoLugar(typeof s === "string" ? { nome: s } : s, ctxL);
    if (!id) continue;
    estar(id, nome);
    if (!lugares[id].descobriu) lugares[id] = { ...lugares[id], descobriu: { dia } };
  }

  const protegidos = arr(o.protegidos).filter((id) => typeof id === "string");
  return {
    factos: { v: LIVRO_DE_FACTOS.v, pessoas: aparar(pessoas, LIVRO_DE_FACTOS.pessoas, protegidos), lugares: aparar(lugares, LIVRO_DE_FACTOS.lugares, protegidos) },
    notas,
  };
}

/* ---------------- LER: SÓ FACTOS, SÓ IDS ----------------
   Quem lê já tem o id (o papel da quest resolveu-se quando a quest nasceu,
   pela mesma `idDaPessoa`). Nenhuma leitura compara nomes. Lixo: false. */
const daPessoa = (livro, id) => { const l = obj(livro); const p = l && obj(l.pessoas); return p && typeof id === "string" ? obj(p[id]) : null; };
const doLugar = (livro, id) => { const l = obj(livro); const p = l && obj(l.lugares); return p && typeof id === "string" ? obj(p[id]) : null; };

/* estiveram frente a frente pelo menos uma vez — ser nomeado não conta */
export const conheceu = (livro, id) => !!obj((daPessoa(livro, id) || {}).visto);
/* falaram frente a frente pelo menos `n` vezes (uma conversa de vários turnos é uma) */
export function conversou(livro, id, n = 1) {
  const m = obj((daPessoa(livro, id) || {}).falou);
  const precisa = inteiro(n) || 1;
  return !!m && (inteiro(m.vezes) || 1) >= precisa;
}
/* caiu numa luta com o herói, de qualquer forma */
export const derrotou = (livro, id) => !!obj((daPessoa(livro, id) || {}).derrotado);
/* caiu e ficou vivo (COMO_CAIU.poupado) */
export function poupou(livro, id) {
  const d = obj((daPessoa(livro, id) || {}).derrotado);
  return !!d && COMO_CAIU.poupado.includes(d.como);
}
/* o maior grau de afeição que a pessoa já alcançou (0 a 4) */
export const afeicaoAlcancada = (livro, id) => grauDeAfeicao({ grau: (obj((daPessoa(livro, id) || {}).afeicao) || {}).grau || 0 });
/* deu-lhe este item */
export function entregou(livro, id, item) {
  const alvo = semAc(limpo(nomeDe(item) || ""));
  return !!alvo && arr((daPessoa(livro, id) || {}).recebeu).some((i) => semAc(i) === alvo);
}
/* o herói esteve no lugar, alguma vez */
export const esteve = (livro, id) => !!obj((doLugar(livro, id) || {}).esteve);
/* o segredo do lugar caiu com o herói lá */
export const descobriu = (livro, id) => !!obj((doLugar(livro, id) || {}).descobriu);

/* ---------------- A PORTA DAS ETAPAS DE ANTES (BQ2, 08/11) ----------------
   As etapas que nasceram antes do livro (`falar_com` das missões e da
   espinha das campanhas em curso) guardam um NOME, não um id — e a planta
   (§8) dá-lhes uma porta a mais que lê o livro, sem reescrever a etapa.
   O nome da etapa procura-se UMA VEZ entre as pessoas que o livro já tem
   (o `nome` que cada entrada guardou quando se escreveu, que é o do dono
   do id), pelos mesmos níveis de RESOLVER_NOME — e quem lê o facto lê-o
   pelo id que saiu daqui. Procurar no livro, e não no elenco de agora, é
   o que mantém a porta fiel à escrita: o id do livro foi resolvido com o
   elenco inteiro do turno em que se escreveu, e o «Corrado» da etapa cai
   no `npc|Corrado` que lá está, venha o registo com que chave vier.
   Mais de uma pessoa no nível: fica a ÚNICA da cidade (o id da gente da
   base, `Cidade|gente|Nome`, traz a cidade); senão nenhuma — a porta que
   não abre deixa a etapa como estava, e a de sempre continua a valer.
   pessoaDoLivro(livro, nome, { cidade }) → id | "" */
export function pessoaDoLivro(livro, nome0, opcoes) {
  const l = obj(livro);
  const pessoas = (l && obj(l.pessoas)) || {};
  const nome = typeof nome0 === "string" ? nome0.trim() : nomeDe(nome0).trim();
  if (!nome) return "";
  if (obj(pessoas[nome])) return nome;
  const ps = palavrasDoNome(nome);
  if (!ps.length) return "";
  const cands = Object.keys(pessoas).map((id) => ({ id, ps: palavrasDoNome(limpo((obj(pessoas[id]) || {}).nome) || id.split("|").pop()) }));
  const cidade = limpo(obj(opcoes) && opcoes.cidade, LIVRO_DE_FACTOS.id);
  for (const nivel of RESOLVER_NOME.niveis) {
    const ids = cands.filter((x) => x.ps.length && CASA[nivel](ps, x.ps)).map((x) => x.id);
    if (!ids.length) continue;
    if (ids.length === 1) return ids[0];
    const daqui = cidade ? ids.filter((id) => id.includes("|gente|") && naCidade(id.split("|")[0], cidade)) : [];
    return daqui.length === 1 ? daqui[0] : "";
  }
  return "";
}

/* ---------------- QUEM CAIU, CONTADO (BQ2, 08/11) ----------------
   O que o vilão lê do herói (antagonista.js, as LEITURAS «sentimental» e
   «igual_a_ele», e a resposta «recolhe») pergunta se o herói já poupou
   alguém e se já matou alguém. Os poupados (COMO_CAIU.poupado) e os
   mortos que o livro registou, contados por pessoa — a mesma pessoa
   caída duas vezes conta uma, pelo pior (COMO_CAIU.pesos). Lixo: zeros. */
export function quedasDoLivro(livro) {
  const l = obj(livro);
  const pessoas = (l && obj(l.pessoas)) || {};
  let poupados = 0, mortos = 0;
  for (const id of Object.keys(pessoas)) {
    const d = obj((obj(pessoas[id]) || {}).derrotado);
    if (!d) continue;
    if (COMO_CAIU.poupado.includes(d.como)) poupados++;
    else if (d.como === "morto") mortos++;
  }
  return { poupados, mortos };
}
