/* ============================================================
   O FEITO DADO PELO SISTEMA (13/11/2026, depois da Fase NE)

   A Fase NE fechou a porta `feito` (motor/portas-do-narrador.js): o
   Narrador já não escreve estado, e o `feito: "marco"` que ele mandava —
   o grau que `aplicarMudancas` convertia em XP (juiz.js, GRAUS) — deixou
   de chegar. O resultado medido foi o que se temia: fora da luta o herói
   quase não subia. A experiência de um turno sem espada era, inteira, uma
   decisão da IA, e a IA saiu.

   Os GRAUS ficam (pequeno 1/70, feito 1/20, marco 1/7 do vão do nível): a
   conta é boa e ninguém a questiona. O que muda é QUEM DÁ O GRAU — agora o
   sistema, a partir de factos que ele próprio escreveu:

     · o teste que passou (o desafio do catálogo, e o facto que comprou —
       facto-do-sucesso.js);
     · o segredo do passo da quest achado pela busca (a-quest-manda.js);
     · o livro de factos (livro-de-factos.js): o lugar e a terra onde nunca
       tinha estado, o segredo do lugar, a primeira conversa com alguém;
     · o marco da espinha cumprido, nos mundos sem esqueleto (nos de
       esqueleto o marco é da quest, e a quest paga — quests-do-turno.js).

   A promessa cumprida ficou de fora, e não por esquecimento: nenhum órgão
   sabe hoje se a palavra dada foi cumprida (palavra-dada.js di-lo no
   cabeçalho), e o Livro de Promessas pagava pela boca do Cronista, que a
   NE calou. Fonte que não existe não se inventa aqui.

   AS TRÊS RÉGUAS:
     1. UM GRAU POR TURNO, O MAIOR. Achar o segredo e pisar sala nova no
        mesmo turno é um feito, não um feito e uma miudez.
     2. O MESMO FACTO NÃO PAGA DUAS VEZES. Cada facto tem uma chave (a mesma
        tranca, o mesmo sítio, o mesmo segredo); a chave já vista não paga.
        Repetir a mesma Percepção no mesmo quarto rende uma vez.
     3. AS MIUDEZAS TÊM TETO POR DIA DE JOGO (`pequenosPorDia`). Quem moer
        Percepção de sala em sala sobe no máximo isso por dia — o herói não
        pode chegar ao nível seguinte a revistar gavetas.

   A MEMÓRIA vive na ficha (`personagem.memoriaDosFeitos`), campo NOVO e
   aditivo: a versão antiga não o lê, e a ficha já viaja no save, no load,
   na sala e no replay sem uma linha a mais. As chaves guardam-se como
   impressão curta (FNV-1a em base 36), para o save não engordar com
   nomes de sítios. A forma:
     { v, dia, pequenos, vistos: [impressão], testes: [impressão] }
   `vistos` — os factos do livro e da espinha (o tamanho do livro os
   limita); `testes` — os do teste e do passo (esses crescem com a
   campanha, e saem os mais velhos).

   A PRIMEIRA VEZ (memória ausente: toda campanha que já existe, e a ficha
   nova): o que o livro e a espinha já guardam é passado, e entra na
   memória CALADO — senão o primeiro turno pagaria a campanha inteira. Só o
   que o turno trouxe diretamente (o teste) paga.

   PURO E DETERMINÍSTICO. Nenhuma sorte, nenhum relógio: o dia entra por
   argumento. Nada recebido é mutado; `null` e lixo dão a lista vazia, o
   feito nulo e a memória limpa — nunca uma exceção.

   Provado em testes/teste-feito-do-sistema.mjs. Ligado em
   motor/aplicar.js (`ctx.doSistema`).
   ============================================================ */
import { GRAUS } from "./juiz.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => (typeof x === "string" ? x.trim() : "");
const semAc = (s) => txt(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");

/* ---------------- A TABELA ----------------
   `fontes`: que facto do sistema vale que grau. `de`: de onde ele vem —
   "teste" (o que o turno trouxe, e paga mesmo na primeira vez), "livro" e
   "espinha" (o que fica escrito no estado, e na primeira vez é passado).
   `porque`: a linha que o jogador lê ao lado do XP — texto de MUNDO, nunca
   o nome de um mecanismo.
   A ORDEM DAS FONTES desempata dois factos do mesmo grau no mesmo turno (a
   primeira ganha): o que custou mais ao herói vem antes.
   `pequenosPorDia`: as miudezas que pagam num dia de jogo. Calibrado pela
   intenção de GRAUS (setenta miudezas por nível): quatro por dia são ~6% de
   um nível, e uma sessão típica fora da luta vive um ou dois dias. Com seis,
   a sessão da catraca dava um terço de nível só fora da luta, antes da paga
   das quests — rápido demais para quem ainda tem lutas e fechos a somar.
   A catraca de ritmo da suíte guarda a faixa.
   `memoria`: quantas impressões cada lista guarda (`vistos` cobre o livro
   cheio — LIVRO_DE_FACTOS.pessoas + lugares — com folga para os marcos). */
export const FEITO_DO_SISTEMA = Object.freeze({
  v: 1,
  fontes: Object.freeze({
    marco: Object.freeze({ grau: "marco", de: "espinha", porque: "a história mudou de lugar" }),
    passo: Object.freeze({ grau: "feito", de: "teste", porque: "o que o caminho escondia veio à luz" }),
    segredo: Object.freeze({ grau: "feito", de: "livro", porque: "um segredo arrancado ao sítio" }),
    cidade: Object.freeze({ grau: "feito", de: "livro", porque: "uma terra onde nunca tinhas posto o pé" }),
    teste: Object.freeze({ grau: "pequeno", de: "teste", porque: "o que tentaste, conseguiste" }),
    lugar: Object.freeze({ grau: "pequeno", de: "livro", porque: "um sítio por onde nunca tinhas passado" }),
    conversa: Object.freeze({ grau: "pequeno", de: "livro", porque: "uma conversa que ficou" }),
  }),
  pequenosPorDia: 4,
  memoria: Object.freeze({ vistos: 300, testes: 120 }),
});

const F = FEITO_DO_SISTEMA.fontes;
const ORDEM = Object.keys(F);
const pesoDoGrau = (g) => (GRAUS[g] ? GRAUS[g].fracao : 0);
const listaDe = (fonte) => (F[fonte] && F[fonte].de === "teste" ? "testes" : "vistos");

/* a impressão curta de uma chave (FNV-1a de 32 bits, em base 36): a mesma
   em qualquer máquina, e ~7 caracteres no save em vez do nome do sítio */
function impressao(chave) {
  let h = 0x811c9dc5;
  const s = String(chave);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

/* ---------------- OS FACTOS DO TURNO ----------------
   osFactosDoTurno(entrada) → [{ fonte, chave }]
   `entrada` (tudo opcional):
     teste   — { desafio, sucesso, facto?, quem? }: o teste do turno (o id do
               desafio no catálogo, se passou, e o que oFactoDoSucesso deu);
     factos  — o livro de factos (estado.factos);
     espinha — a espinha (os marcos feitos; nos mundos de esqueleto, nada);
     lugar   — onde o herói está (o nome, ou { nome, dentroDe });
     cidade  — a cidade.
   A lista diz o que É verdade agora; o que já pagou decide-o a memória. */
export function osFactosDoTurno(entrada) {
  const e = obj(entrada) || {};
  const out = [];
  const por = (fonte, chave) => { if (chave) out.push(Object.freeze({ fonte, chave })); };

  /* o teste que passou, e o passo que ele achou */
  const t = obj(e.teste);
  if (t && t.sucesso === true && txt(t.desafio)) {
    const f = obj(t.facto);
    const a = f && obj(f.achado);
    if (a && a.especie === "passo") por("passo", `passo|${semAc(a.quest)}|${semAc(a.etapa)}` + (a.quest ? "" : `|${semAc(a.id)}`));
    const l = obj(e.lugar);
    const sitio = semAc(l ? (l.nome || l.dentroDe) : e.lugar);
    const de = f && obj(f.de) ? Object.keys(f.de).sort().map((k) => `${k}=${semAc(String(f.de[k]))}`).join(",") : "";
    por("teste", `teste|${semAc(t.desafio)}|${semAc(e.cidade)}|${sitio}|${semAc(t.quem)}|${de}`);
  }

  /* o livro: os lugares (a terra, o sítio, o segredo) e a conversa */
  const lv = obj(e.factos);
  const lugares = obj(lv && lv.lugares) || {};
  for (const id of Object.keys(lugares).sort()) {
    const x = obj(lugares[id]);
    if (!x) continue;
    if (obj(x.esteve)) por(id.startsWith("cidade|") ? "cidade" : "lugar", `esteve|${id}`);
    if (obj(x.descobriu)) por("segredo", `descobriu|${id}`);
  }
  const pessoas = obj(lv && lv.pessoas) || {};
  for (const id of Object.keys(pessoas).sort()) {
    const x = obj(pessoas[id]);
    if (x && obj(x.falou)) por("conversa", `falou|${id}`);
  }

  /* os marcos da espinha, só onde a quest não os paga (sem esqueleto) */
  const esp = obj(e.espinha);
  if (esp && !esp.esqueleto) {
    arr(esp.atos).forEach((at, ia) => {
      const nAto = at && Number.isFinite(at.ato) ? at.ato : ia;
      arr(at && at.marcos).forEach((m, im) => { if (m && m.feito === true) por("marco", `marco|${nAto}|${im}`); });
    });
  }
  return out;
}

/* ---------------- A MEMÓRIA ----------------
   garantirMemoriaDosFeitos(x) → a memória limpa, ou null quando não há
   (a primeira vez: ver o cabeçalho). Sempre um objeto novo. */
function garantirMemoriaDosFeitos(x) {
  const m = obj(x);
  if (!m) return null;
  const M = FEITO_DO_SISTEMA.memoria;
  const lista = (l, teto) => [...new Set(arr(l).filter((s) => typeof s === "string" && s && s.length <= 16))].slice(-teto);
  return {
    v: FEITO_DO_SISTEMA.v,
    dia: Number.isFinite(m.dia) ? m.dia : null,
    pequenos: Number.isInteger(m.pequenos) && m.pequenos > 0 ? m.pequenos : 0,
    vistos: lista(m.vistos, M.vistos),
    testes: lista(m.testes, M.testes),
  };
}

const jaVisto = (mem, f) => !!mem && mem[listaDe(f.fonte)].includes(impressao(f.chave));
/* as miudezas pagas HOJE: noutro dia o contador recomeça */
const pequenosDeHoje = (mem, dia) => (!mem ? 0 : Number.isFinite(dia) && mem.dia !== dia ? 0 : mem.pequenos);

/* ---------------- O FEITO DO TURNO ----------------
   oFeitoDoTurno(factos, memoria, { dia }) → { grau, porque, chave, fonte } | null
   Os factos de osFactosDoTurno; a memória da ficha. Um grau, o maior, entre
   os factos que ainda não pagaram (e, sem memória, só os do teste); a
   miudez para no teto do dia. */
export function oFeitoDoTurno(factos, memoria, opcoes) {
  const mem = garantirMemoriaDosFeitos(memoria);
  const o = obj(opcoes) || {};
  const dia = Number.isFinite(o.dia) ? o.dia : null;
  const tetoDoDia = pequenosDeHoje(mem, dia) >= FEITO_DO_SISTEMA.pequenosPorDia;
  let melhor = null;
  for (const f0 of arr(factos)) {
    const f = obj(f0);
    if (!f || !F[f.fonte] || !txt(f.chave)) continue;
    const linha = F[f.fonte];
    if (!mem && linha.de !== "teste") continue;
    if (jaVisto(mem, f)) continue;
    if (linha.grau === "pequeno" && tetoDoDia) continue;
    const ganha = !melhor
      || pesoDoGrau(linha.grau) > pesoDoGrau(melhor.grau)
      || (pesoDoGrau(linha.grau) === pesoDoGrau(melhor.grau) && ORDEM.indexOf(f.fonte) < ORDEM.indexOf(melhor.fonte));
    if (ganha) melhor = { grau: linha.grau, porque: linha.porque, chave: f.chave, fonte: f.fonte };
  }
  return melhor ? Object.freeze(melhor) : null;
}

/* lembrarOsFeitos(memoria, factos, pago, { dia }) → a memória nova
   TODOS os factos do turno entram (os que não pagaram também: aconteceram,
   e o grau do turno já foi dado ao maior); `pago` — o feito que o SISTEMA
   pagou neste turno (null se nenhum, ou se foi o do Narrador) — conta a
   miudez no dia. A memória recebida não é tocada. */
export function lembrarOsFeitos(memoria, factos, pago, opcoes) {
  const mem = garantirMemoriaDosFeitos(memoria) || { v: FEITO_DO_SISTEMA.v, dia: null, pequenos: 0, vistos: [], testes: [] };
  const o = obj(opcoes) || {};
  const dia = Number.isFinite(o.dia) ? o.dia : mem.dia;
  const listas = { vistos: [...mem.vistos], testes: [...mem.testes] };
  for (const f0 of arr(factos)) {
    const f = obj(f0);
    if (!f || !F[f.fonte] || !txt(f.chave)) continue;
    const l = listas[listaDe(f.fonte)];
    const h = impressao(f.chave);
    if (!l.includes(h)) l.push(h);
  }
  const p = obj(pago);
  const pequenos = pequenosDeHoje(mem, dia) + (p && p.grau === "pequeno" ? 1 : 0);
  const M = FEITO_DO_SISTEMA.memoria;
  return {
    v: FEITO_DO_SISTEMA.v, dia, pequenos,
    vistos: listas.vistos.slice(-M.vistos),
    testes: listas.testes.slice(-M.testes),
  };
}
