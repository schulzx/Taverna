/* ============================================================
   AS QUESTS E O VILÃO NO TURNO, NO MOTOR (08/11/2026, Fase BQ · BQ7)
   — src/motor/quests-do-turno.js

   A BQ4 deu a quest (biblioteca-de-quests.js: abrir, avançar, escolher, a
   vista), a BQ5 o vilão (plano-do-vilao.js: o relógio, as camadas, as
   reações, o fim, a linha da pauta) e a BQ6 o esqueleto que os liga num
   mundo novo (esqueleto.js). Esta peça é QUEM OS FAZ ANDAR TURNO A TURNO,
   e mora no motor pela razão do livro de factos (motor/livro-do-turno.js,
   o precedente): o replay (sessao.js) e o servidor têm de produzir a MESMA
   história que o App, turno a turno. Uma quest que só o App avançasse
   seria um campo do save que nenhum passo do replay reproduz.

   SÓ NOS MUNDOS NOVOS. Tudo aqui começa por `espinha.esqueleto`: sem ele
   (todas as campanhas que já existem), cada função devolve null ou o vazio
   e NADA muda — byte a byte, provado em testes/teste-bq7-motor.mjs. A
   decisão é da pessoa (§8 da planta): as campanhas em curso não mudam de
   história.

   ONDE MORA: `espinha.quests` (a catraca é `garantirQuestsDaEspinha`). Não
   é um campo novo do save à cabeça — `quests` já é o campo das missões da
   era antiga (estado.js), e a espinha já leva o esqueleto e o registo do
   vilão: as três coisas da mesma história ficam juntas, e o save, o load,
   a sala e o replay levam-nas sem uma linha a mais. Aditivo: a versão
   antiga não o lê, e `garantirEspinha` (saga.js) deixa-o passar.

     espinha.quests = {
       v,          a forma (QUESTS_DO_TURNO.v)
       atos,       os atos cujas quests já se abriram (uma vez cada)
       registos,   os registos da BQ4, pela ordem em que abriram
       fora,       [{ id, ato, dia }] as que não nasceram (a primeira etapa
                   já estava feita: `abrirQuest` recusa, §6) — o ato delas
                   vive dos marcos antigos, como o ato sem quest
       aplicadas,  { id: n } quantas consequências de cada registo já se
                   aplicaram (a lista do registo só cresce)
       pesadas,    as do tipo 1 que já pesaram no arco (uma vez cada)
       passos,     os passos do plano dele já anunciados como cumpridos
       premissas,  o que as quests deixaram («tipo:papel», o `deixa`)
       desfecho,   { id, dia } o fim do vilão, quando o confronto decidiu
       fim         o dia em que o relógio dele chegou ao fim (o tom muda)
     }

   AS PEÇAS, todas puras, todas sobre o ESTADO (a forma do save):

     oTurnoDasQuests(estado, { mundo }) → null | { estado, efeitos, notas, linhas }
       O fim do turno, DEPOIS de o livro de factos estar escrito — também o
       que o Cronista anotou (a conversa do turno fecha a etapa NESTE turno,
       não no seguinte): abre as quests do ato (as de um ato só abrem uma
       vez), avança cada uma, aplica as consequências que são do estado que
       o motor já escreve, faz o arco virar quando a quest do ato fecha
       (PESO_DA_QUEST, historia.js), e anda com o vilão — o relógio, a
       camada (uma por chamada), as reações, o fim. `estado` devolve só os
       campos que mudaram (espinha, saber, historia, personagem, npcs, e
       factos — o favor e o QUEM É que as quests deixam, 09/11);
       `efeitos` o que só a tela sabe aplicar (a forma está abaixo, em
       EFEITOS PARA A TELA); `notas` o que vai ao Narrador no turno seguinte
       (o `nota` do App, `notaComOTurno`); `linhas` o relato.
       Chamá-lo duas vezes sobre o mesmo estado não aplica nada duas vezes.

     aMesaDasQuests(estado, { mundo, cena }) → null | { comQuest, passo, mao, naoPode, favor }
       O que o Narrador recebe, pela pauta (motor/pauta-do-turno.js, secção
       `momento`): «O PASSO» (a etapa de agora em frase de mundo, e uma
       coisa que falta — nunca as soluções todas, §7) NO LUGAR da batida da
       espinha, quando o ato tem quest (`comQuest`); e «A MÃO DELE AQUI»
       (`oVilaoNaPauta`, filtrada pela camada) NO LUGAR da marca do relógio
       do fio, em todo o mundo novo. Os vetos vão em `naoPode`. E (09/11)
       `favor`: quando o herói está num lugar que lhe deve um favor (o
       livro de factos, o efeito «favor»), a linha que o diz — vai em O QUE VOLTA.

     missoesDasQuests(estado, { mundo }) → [missão]
       A projeção de cada quest para o Diário (`missaoDaQuest`), que não se
       guarda: a tela junta-a às missões dela.

     escolhasDasQuests(estado, { mundo }) → [{ quest, titulo, chave, etapa, opcoes }]
       As escolhas abertas agora, com o veredito (`vereditoDaEscolha`: os
       dois lados e o preço), para a tela as mostrar ANTES do clique.

     escolherNaQuestDoEstado(estado, quest, chave, opcao, { mundo })
       → null (recusada) | o mesmo que oTurnoDasQuests
       O clique: a escolha entra no registo (`escolherNaQuest`) e o resto
       corre como num fim de turno — o preço sai da bolsa já ali.

     oVilaoDasQuests(estado, { mundo }) → null | o cartaz da sombra do
       Diário (`oVilaoNoDiario`), só com o que a camada deixa.
     verAsReviravoltas(estado) → null | { espinha } — o Diário abriu: as
       reviravoltas ficam lidas (`vistaEm`).
     aEscolhaDaFrase(frase, escolhas) → null | { quest, chave, opcao } — a
       frase escrita que é uma das cartas abertas.

   EFEITOS PARA A TELA — o que o motor não aplica, porque mora em órgãos do
   App (os relógios, o grupo, a base, o mapa). Cada um diz o que pede ao
   órgão em motor/efeitos-da-quest.js (oQueOEfeitoPede). A forma:
     { tipo, quest, n?, alvo?, laco?, situacao?, linha?, cidade? }
       tipo ∈ dia · relogio_regional · afeicao · vinculo · marco · situacao
              · morte (os de EFEITOS_DA_QUEST que não estão em
              QUESTS_DO_TURNO.aplica);
       alvo = { nome, id, cidade?, chave? } — o papel já resolvido;
       cidade — a do ato da quest (o relógio da região).
     { tipo: "passo_do_plano", n, dia, muda: [EFEITOS_DO_PLANO], lugar, alvo?, obra? }
       lugar — o sítio do passo (`passo_N` do registo dele, que o esqueleto
       põe); alvo — o que ele mira no que o herói ama (escolherAlvo, vilao.js:
       { campo, nome, comoDoi }), só quando já sabe do herói; obra — o que
       fica no mundo (sem dono), que também vai ao Narrador como facto longe.
     { tipo: "fim_do_plano", efeitos, tom, tenentesAMais, dia, frase }
     { tipo: "desfecho_do_vilao", id, depois }
     { tipo: "reacao_do_vilao", id, resposta?, leitura? }   (só as que pedem
       uma resposta ou uma leitura do antagonista.js)
     { tipo: "remontarPrompt" }   (o arco virou)
   ============================================================ */
import { garantirEsqueleto, questsDoAto } from "../esqueleto.js";
import { questPorId, abrirQuest, avancarQuest, estadoDaQuest, vereditoDaEscolha, escolherNaQuest, missaoDaQuest, EFEITOS_DA_QUEST } from "../biblioteca-de-quests.js";
import { fichaDoVilao, relogioDoPlano, camadaDoVilao, reagirAoHeroi, desfechoDoVilao, oVilaoNaPauta, oVilaoNoDiario, garantirRegistroDoVilao } from "../plano-do-vilao.js";
import { garantirHistoria, marcoDaQuest, virarEtapa, envelopeDeVirada, PESO_DA_QUEST } from "../historia.js";
import { chegouAteEle } from "../antagonista.js";
import { diasDoPasso } from "../vilao.js";
import { firmarLaco, romperLaco } from "../npcs.js";
import { anotarTurno, favoresDoLivro } from "../livro-de-factos.js";
import { avaliarCondicao, resolverPapeis } from "../condicoes-da-quest.js";

/* ---------------- OS NÚMEROS E AS FRASES (se é número, é tabela) ----------------
   `aplica`: as consequências que o motor aplica, porque o estado delas é
   dele (a bolsa, o livro do vilão, o relógio do vilão, as premissas, o
   registo da gente, e — 09/11 — o livro de factos: o favor que um lugar
   fica a dever e a linha durável do QUEM É, que nenhum órgão guardava e
   agora o livro guarda, para o replay as reproduzir); as outras de
   EFEITOS_DA_QUEST vão à tela.
   `avisa`: a linha que entra no livro DELE quando uma quest o avisa — a
   fonte `marca` tem certeza 3 (antagonista.js), e é com ela que o plano
   passa a mirar no que o herói ama (RITMO_DO_PLANO.certezaQueMira).
   `relogioDoFio`: quantos passos do corpo dele (diasDoPasso) o relógio
   anda por ponto de `relogio_do_fio`. `premissas`, `fora`: tetos do save.
   `passo`: a linha «O PASSO» (§7: ≤ 220). `veto`: o que a quest guarda
   na cena em que a mão dele está. `notas`: quantas vão ao Narrador por
   turno, o teto de cada uma e a cabeça de cada espécie. `linhas`: o relato.
   `arco`: o que o arco cita da quest que o fez virar. */
export const QUESTS_DO_TURNO = Object.freeze({
  v: 1,
  aplica: Object.freeze(["moedas", "avisa_vilao", "relogio_do_fio", "deixa", "laco", "rompe_laco", "aliado", "inimigo", "favor", "quem_e"]),
  avisa: Object.freeze({ comOnde: "o forasteiro passou por {onde}", semOnde: "o forasteiro anda a meter-se no caminho dele", fonte: "marca", sobre: "onde" }),
  relogioDoFio: 1,
  premissas: 24,
  fora: 24,
  passo: Object.freeze({ cabeca: "O PASSO: ", teto: 220, falta: " — falta {falta}", coracao: "; e, no coração, {etapa}" }),
  veto: "que {quem} saia da história fora de cena — por morte, prisão ou fuga — enquanto este caminho estiver aberto",
  notas: Object.freeze({
    max: 2, doVilao: 1, teto: 360,
    facto: "[É FACTO, decidido pelo sistema — entra nesta resposta] ",
    aconteceu: "[O QUE ACONTECEU — decidido pelo sistema: narre como foi, sem o mudar] ",
    longe: "[LONGE DAQUI, SEM EU VER — é facto] ",
  }),
  linhas: Object.freeze({ etapa: "✓ {etapa}", concluida: "★ {titulo} — cumprida", falhada: "✖ {titulo} — perdida", terminada: "♥ {titulo} — chegou ao fim" }),
  arco: Object.freeze({ concluida: "concluí \"{titulo}\"", falhada: "perdi \"{titulo}\"" }),
  /* 09/11: o lugar que deve um favor ao herói, na pauta (O QUE VOLTA) quando ele lá está
     (a condição «esta_em», a régua com que o livro escreve o lugar): a frase,
     o «desde» com a quest que o deixou, e o teto */
  favor: Object.freeze({ linha: "{lugar} deve um favor ao herói{desde}: quem lá manda lembra-se, e honra-o se ele o cobrar", desde: " (desde «{titulo}»)", teto: 220 }),
  /* a frase que é uma carta (aEscolhaDaFrase): duas palavras casam quando
     partilham o começo — pelo menos `minimo` letras, e no máximo `folga`
     a menos do que a mais curta («pago» casa «pagar», «entrego» casa
     «entregar»); o verbo da carta (a primeira palavra) vale `verbo`; as
     palavras curtas e as vazias não contam */
  frase: Object.freeze({ minimo: 3, folga: 2, curta: 3, verbo: 2,
    vazias: Object.freeze(["para", "com", "sem", "pela", "pelo", "pelas", "pelos", "numa", "num", "uma", "uns", "umas", "que", "quem", "onde", "como", "mais", "menos", "muito", "isto", "isso", "aquilo", "este", "esta", "esse", "essa", "dele", "dela", "seu", "sua", "meu", "minha", "teu", "tua", "frente", "todos", "fim", "até", "ate", "vou", "quero", "ainda", "mesma", "mesmo"]) }),
});

/* ---------------- utilidades ---------------- */
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const inteiro = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const RX_ID = /^[a-z0-9_]{1,40}$/;
const encher = (modelo, v) => String(modelo).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? String(v[k]) : m));
const J = (x) => JSON.stringify(x === undefined ? null : x);
const minuscula = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);
const corta = (s, n) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, "").replace(/[;,:—\s]+$/, "") + "…";
};
/* as partes cabem por ordem; a que não cabe sai inteira (a primeira fica) */
const cabe = (partes, teto) => {
  let s = "";
  partes.forEach((p, i) => { if (p && (i === 0 || (s + p).length <= teto)) s += p; });
  return corta(s, teto);
};

/* ============================================================
   O SAVE — garantirQuestsDaEspinha(x) → a forma de `espinha.quests`
   Lixo dá a forma vazia; nunca lança. O registo de cada quest passa como
   veio (a catraca dele é a da BQ4, `avancarQuest`); só sai o que não é
   de uma quest do catálogo, e o repetido.
   ============================================================ */
export function garantirQuestsDaEspinha(x) {
  const o = obj(x) || {};
  const T = QUESTS_DO_TURNO;
  const idOk = (v) => typeof v === "string" && RX_ID.test(v);
  const vistos = new Set();
  const registos = arr(o.registos).filter((r) => {
    if (!obj(r) || !idOk(r.id) || !questPorId(r.id) || vistos.has(r.id)) return false;
    vistos.add(r.id);
    return true;
  });
  const aplicadas = {};
  for (const [k, n] of Object.entries(obj(o.aplicadas) || {})) if (idOk(k) && inteiro(n) != null && n >= 0) aplicadas[k] = inteiro(n);
  const d = obj(o.desfecho);
  return {
    v: T.v,
    atos: [...new Set(arr(o.atos).filter((n) => Number.isInteger(n) && n >= 0))].sort((a, b) => a - b),
    registos,
    fora: arr(o.fora).filter((f) => obj(f) && idOk(f.id))
      .map((f) => ({ id: f.id, ato: Math.max(0, inteiro(f.ato) || 0), dia: Math.max(0, inteiro(f.dia) || 0) }))
      .filter((f, i, a) => a.findIndex((y) => y.id === f.id) === i).slice(-T.fora),
    aplicadas,
    pesadas: [...new Set(arr(o.pesadas).filter(idOk))],
    passos: [...new Set(arr(o.passos).filter((n) => Number.isInteger(n) && n >= 1))].sort((a, b) => a - b),
    premissas: [...new Set(arr(o.premissas).filter((p) => typeof p === "string" && /^[a-z_]{1,24}:[a-z0-9_]{1,40}$/.test(p)))].slice(-T.premissas),
    desfecho: d && typeof d.id === "string" ? { id: d.id.slice(0, 20), dia: Math.max(0, inteiro(d.dia) || 0) } : null,
    fim: inteiro(o.fim) != null && o.fim >= 0 ? inteiro(o.fim) : null,
  };
}

/* o esqueleto de um estado, ou null (o mundo antigo) */
function esqueletoDe(E) {
  const esp = obj(obj(E) && E.espinha);
  return esp ? garantirEsqueleto(esp.esqueleto) : null;
}
/* o papel de um registo, resolvido: { nome, id, cidade?, chave? } */
function papelDe(R, nome) {
  const p = obj(obj(R && R.papeis) && R.papeis[nome]);
  if (!p) return null;
  const out = { nome: typeof p.nome === "string" ? p.nome : "", id: typeof p.id === "string" ? p.id : "" };
  if (typeof p.cidade === "string" && p.cidade) out.cidade = p.cidade;
  if (typeof p.chave === "string" && p.chave) out.chave = p.chave;
  return out;
}
/* a chave do registo da gente para um nome (o próprio, ou sem acento e caixa) */
function chaveNoRegisto(npcs, nome) {
  const n = obj(npcs);
  if (!n || !nome) return null;
  if (obj(n[nome])) return nome;
  return Object.keys(n).find((k) => obj(n[k]) && norm(k) === norm(nome)) || null;
}
/* as quests como o vilão as lê (plano-do-vilao.js, `questsDe`): o registo
   com a mão da ficha ao lado */
const paraOVilao = (registos) => registos.map((r) => ({ ...r, mao: (questPorId(r.id) || {}).mao || null }));

/* ============================================================
   O FIM DO TURNO
   ============================================================ */
function correr(E0, opcoes, antes) {
  const esq = esqueletoDe(E0);
  if (!esq) return null;
  const T = QUESTS_DO_TURNO;
  const o = obj(opcoes) || {};
  const mundo = obj(o.mundo);
  const esp0 = E0.espinha;
  const dia = Math.max(0, inteiro(E0.dia) || 0);
  const h0 = garantirHistoria(E0.historia);
  let h = h0;
  const Q = garantirQuestsDaEspinha(esp0.quests);
  const Qa = garantirQuestsDaEspinha(obj(antes) ? antes : esp0.quests);
  let registos = [...Q.registos];
  const fora = [...Q.fora];
  const atos = [...Q.atos];
  const aplicadas = { ...Q.aplicadas };
  const pesadas = [...Q.pesadas];
  const passosDitos = [...Q.passos];
  let premissas = [...Q.premissas];
  let desfecho = Q.desfecho;
  let fim = Q.fim;
  let personagem = E0.personagem, npcs = E0.npcs, saber = E0.saber, factos = E0.factos;
  let adianta = 0;
  const efeitos = [], linhas = [];
  const candidatas = [];        // { prio, texto } — as notas da quest
  const doVilao = [];           // as notas do vilão (as reações)
  const dosPassos = [];         // a obra dos passos que se cumpriram (09/11)
  let doFim = "";               // a frase do fim do plano
  const favores = [], quemE = []; // o que vai ao livro de factos (09/11)
  const agora = () => ({ ...E0, personagem, npcs, saber, factos, historia: h });

  /* 1. ABRIR as quests de cada ato até ao de agora, uma vez por ato */
  const abrir = () => {
    for (let a = 0; a <= h.etapa; a++) {
      if (atos.includes(a)) continue;
      atos.push(a);
      for (const q of questsDoAto(esq, a)) {
        if (registos.some((r) => r.id === q.id) || fora.some((f) => f.id === q.id)) continue;
        let R = null;
        try { R = abrirQuest(q.id, { estado: agora(), papeis: q.papeis, mundo, quests: registos }); } catch { R = null; }
        if (R) registos.push(R); else fora.push({ id: q.id, ato: a, dia });
      }
    }
  };
  abrir();

  /* 2. AVANÇAR cada quest aberta, pela ordem (a âncora do tipo 2 conta as
     do tipo 1 que fecharam antes dela, neste mesmo turno) */
  const avancar = () => {
    const lista = [...registos];
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].estado !== "aberta") continue;
      try { lista[i] = avancarQuest(lista[i].id, lista[i], { estado: agora(), mundo, quests: lista }) || lista[i]; } catch { /* a quest nunca custa o turno */ }
    }
    registos = lista;
  };
  avancar();

  /* 3. AS CONSEQUÊNCIAS que ainda não se aplicaram */
  const aplicarUm = (ef, R) => {
    const t = ef && ef.tipo;
    if (!EFEITOS_DA_QUEST[t]) return;
    const alvo = typeof ef.papel === "string" ? papelDe(R, ef.papel) : null;
    if (t === "moedas") {
      const p = obj(personagem);
      if (p && Number.isInteger(ef.n)) personagem = { ...p, moedas: Math.max(0, (inteiro(p.moedas) || 0) + ef.n) };
      return;
    }
    if (t === "avisa_vilao") {
      const onde = (obj(E0.lugar) && E0.lugar.nome) || (typeof E0.cidadeAtual === "string" ? E0.cidadeAtual : "");
      saber = chegouAteEle(saber, { o: onde ? encher(T.avisa.comOnde, { onde }) : T.avisa.semOnde, fonte: T.avisa.fonte, dia, sobre: T.avisa.sobre });
      return;
    }
    if (t === "relogio_do_fio") { if (Number.isInteger(ef.n)) adianta += ef.n; return; }
    if (t === "deixa") { if (typeof ef.premissa === "string") premissas = [...new Set([...premissas, ef.premissa])].slice(-T.premissas); return; }
    /* 09/11: o favor e o QUEM É vão ao livro de factos, pelo id do papel —
       o que se resolveu quando a quest abriu, ou, se então a pessoa ainda
       não era conhecida, o que a mesma régua dá agora (resolverPapeis, o
       elenco do livro). O papel que nem assim tem id não escreve: o livro
       guarda ids, e adivinhar um seria escrever no sítio errado. */
    const comId = () => {
      if (!alvo || alvo.id) return alvo;
      const p = obj(obj(R.papeis) && R.papeis[ef.papel]);
      try { const r = p ? resolverPapeis({ x: p }, agora(), { mundo }).papeis.x : null; return r && r.id ? { ...alvo, id: r.id } : alvo; } catch { return alvo; }
    };
    if (t === "favor") { const a = comId(); if (a && a.id) favores.push({ lugar: a, de: R.id }); return; }
    if (t === "quem_e") {
      const ps = obj(R.papeis) || {};
      const linha = typeof ef.linha === "string" ? ef.linha.replace(/\{([a-z0-9_]+)\}/g, (m, k) => (obj(ps[k]) && ps[k].nome) || m) : "";
      const a = comId();
      if (a && a.id && linha.trim() && !/\{[a-z0-9_]+\}/.test(linha)) quemE.push({ quem: a.id, o: linha, de: R.id });
      return;
    }
    if (t === "laco" || t === "rompe_laco" || t === "aliado" || t === "inimigo") {
      /* o fecho não cria gente: quem ainda não está no registo fica como
         está (a régua da secundária planeada, SQ3) */
      const k = chaveNoRegisto(npcs, alvo && alvo.nome);
      if (!k) return;
      const n0 = npcs[k];
      const n1 = t === "laco" ? firmarLaco(n0, ef.laco, dia) : t === "rompe_laco" ? romperLaco(n0, dia) : { ...n0, relacao: t };
      if (n1 !== n0) npcs = { ...npcs, [k]: n1 };
      return;
    }
    /* o resto é da tela */
    const doAto = esq.atos.find((a) => a.quest === R.id);
    const papeis = obj(R.papeis) || {};
    efeitos.push({
      tipo: t, quest: R.id,
      ...(Number.isInteger(ef.n) ? { n: ef.n } : {}),
      ...(alvo ? { alvo } : {}),
      ...(typeof ef.laco === "string" ? { laco: ef.laco } : {}),
      ...(typeof ef.situacao === "string" ? { situacao: ef.situacao } : {}),
      ...(typeof ef.linha === "string" ? { linha: ef.linha.replace(/\{([a-z0-9_]+)\}/g, (m, k) => (obj(papeis[k]) && papeis[k].nome) || m) } : {}),
      ...(t === "relogio_regional" ? { cidade: (doAto && doAto.cidade) || (typeof E0.cidadeAtual === "string" ? E0.cidadeAtual : "") } : {}),
    });
  };
  for (const R of registos) {
    const lista = arr(R.consequencias);
    const n0 = Math.min(aplicadas[R.id] || 0, lista.length);
    for (const c of lista.slice(n0)) {
      for (const ef of arr(c && c.efeitos)) { try { aplicarUm(ef, R); } catch { /* uma consequência torta não leva o turno */ } }
      const de = String((c && c.de) || "");
      if (c && typeof c.texto === "string" && c.texto.trim() && !de.startsWith("escolha:")) {
        const prio = de.startsWith("reviravolta:") ? 0 : /^(fecho|falha|abandono|desfecho:)/.test(de) ? 1 : 2;
        candidatas.push({ prio, texto: (prio === 0 ? T.notas.facto : T.notas.aconteceu) + corta(c.texto, T.notas.teto) });
      }
    }
    aplicadas[R.id] = lista.length;
  }
  /* o livro de factos, de uma vez (anotarTurno, sem elenco: os ids já vêm
     resolvidos, e a cidade de agora não se marca como visitada por isto).
     Um estado sem livro continua sem ele (a régua de anotarOLivro). */
  if ((favores.length || quemE.length) && obj(factos)) {
    try { factos = anotarTurno(factos, { dia, favores, quemE }).factos; } catch { /* o livro nunca custa o turno */ }
  }

  /* 4. O ARCO: a quest do tipo 1 do ato de agora fechou → o ato vira
     (PESO_DA_QUEST, historia.js). A de um ato que já passou só se marca. */
  for (const R of registos) {
    if (R.tipo !== 1 || !PESO_DA_QUEST.fecham.includes(R.estado) || pesadas.includes(R.id)) continue;
    pesadas.push(R.id);
    const doAto = esq.atos.find((a) => a.ato === h.etapa);
    if (!doAto || doAto.quest !== R.id) continue;
    const F = questPorId(R.id);
    const m = marcoDaQuest(h, encher(T.arco[R.estado] || T.arco.concluida, { titulo: F ? F.titulo : R.id }));
    const v = virarEtapa(m.historia, { marcosPendentes: 0, vilao: true });
    h = v.virou ? v.historia : m.historia;
    if (v.virou) {
      candidatas.push({ prio: 1, texto: envelopeDeVirada(v) });
      efeitos.push({ tipo: "remontarPrompt" });
    }
  }
  if (h.etapa !== h0.etapa) { abrir(); avancar(); }

  /* 5. O VILÃO: o relógio, a camada, as reações, o fim */
  let fio = obj(esp0.fio) ? { ...esp0.fio } : null;
  if (fio && adianta) {
    const reg = garantirRegistroDoVilao(fio.vilao);
    if (reg) fio = { ...fio, vilao: garantirRegistroDoVilao({ ...reg, inicio: Math.max(0, reg.inicio - adianta * T.relogioDoFio * diasDoPasso({ corpo: reg.corpo })) }) };
  }
  const ficha = fio ? fichaDoVilao({ ...esp0, fio }) : null;
  if (ficha) {
    try {
      const E = agora();
      const qv = paraOVilao(registos);
      const grupo = arr(obj(personagem) && personagem.grupo).map((g) => obj(g) && g.nome).filter(Boolean);
      const amado = { pessoas: grupo, lugares: ficha.cidadeInicial ? [ficha.cidadeInicial] : [] };
      const relogio = relogioDoPlano(ficha, E, { quests: qv, amado, mundo });
      const camada = camadaDoVilao(ficha, E, { quests: qv, relogio, ato: h.etapa, mundo });
      const rx = reagirAoHeroi(ficha, E, { quests: qv, relogio, mundo });
      saber = rx.saber;
      const reg = garantirRegistroDoVilao({ ...(rx.registro || ficha.registro), camada: camada.id, subiuPor: camada.subiuPor });
      if (reg) fio = { ...fio, vilao: reg };
      for (const r of rx.reacoes) {
        doVilao.push(T.notas.longe + corta(r.faz, T.notas.teto));
        if (r.resposta || r.leitura) efeitos.push({ tipo: "reacao_do_vilao", id: r.id, ...(r.resposta ? { resposta: r.resposta } : {}), ...(r.leitura ? { leitura: r.leitura } : {}) });
      }
      for (const s of arr(relogio.passos)) {
        if (s.estado !== "cumprido" || s.recuado || passosDitos.includes(s.n)) continue;
        passosDitos.push(s.n);
        /* 09/11: a obra do passo (o que fica no mundo, sem dono) chega ao
           Narrador como facto longe — o vilão sente-se antes de se ver — e
           vai no efeito, para a tela a pôr no que o passo muda */
        const obra = (ficha.plano[s.n - 1] && ficha.plano[s.n - 1].obra) || "";
        if (obra) dosPassos.push(T.notas.longe + corta(obra, T.notas.teto));
        efeitos.push({ tipo: "passo_do_plano", n: s.n, dia: s.dia, muda: [...arr(s.muda)], lugar: (reg || ficha.registro).papeis[`passo_${s.n}`] || null, ...(s.alvo ? { alvo: s.alvo } : {}), ...(obra ? { obra } : {}) });
      }
      if (relogio.fim && fim == null) {
        fim = dia;
        efeitos.push({ tipo: "fim_do_plano", efeitos: [...arr(relogio.fim.efeitos)], tom: relogio.fim.tom, tenentesAMais: relogio.fim.tenentesAMais, dia, frase: relogio.fim.frase });
        doFim = T.notas.longe + corta(relogio.fim.frase, T.notas.teto);
      }
      const d = desfecho ? null : desfechoDoVilao(ficha, E, { quests: qv, mundo });
      if (d) {
        desfecho = { id: d.id, dia };
        efeitos.push({ tipo: "desfecho_do_vilao", id: d.id, depois: d.depois });
        candidatas.push({ prio: 1, texto: T.notas.aconteceu + corta(d.depois, T.notas.teto) });
      }
    } catch { /* o vilão nunca custa o turno */ }
  }

  /* 6. O RELATO: as etapas que fecharam e as quests que acabaram desde
     `antes` (só as que o herói vê — o tipo 2 escondido cala) */
  const ctxDe = (lista) => ({ estado: agora(), mundo, quests: lista });
  for (const R of registos) {
    const A = Qa.registos.find((x) => x.id === R.id) || null;
    let m = null;
    try { m = missaoDaQuest(R.id, R, ctxDe(registos)); } catch { m = null; }
    if (!m) continue;
    const feitasAntes = obj(A && A.feitas) || {};
    for (const e of m.etapas) {
      const id = String(e.chave).split(":")[1];
      if (e.feito && !feitasAntes[id]) linhas.push(encher(T.linhas.etapa, { etapa: e.alvo }));
    }
    if (R.estado !== "aberta" && (!A || A.estado === "aberta") && T.linhas[R.estado]) linhas.push(encher(T.linhas[R.estado], { titulo: m.titulo }));
  }

  /* do vilão vão T.notas.doVilao: o fim antes de tudo, depois o passo mais
     recente que se cumpriu, depois as reações */
  const notas = [
    ...candidatas.sort((a, b) => a.prio - b.prio).slice(0, T.notas.max).map((c) => c.texto),
    ...[doFim, ...[...dosPassos].reverse(), ...doVilao].filter(Boolean).slice(0, T.notas.doVilao),
  ];

  /* o estado novo: só os campos que mudaram */
  const quests = { v: T.v, atos: [...atos].sort((a, b) => a - b), registos, fora, aplicadas, pesadas, passos: [...passosDitos].sort((a, b) => a - b), premissas, desfecho, fim };
  const espinha = { ...esp0, quests, ...(fio ? { fio } : {}) };
  const estado = {};
  if (J(espinha) !== J(esp0)) estado.espinha = espinha;
  if (J(saber) !== J(E0.saber)) estado.saber = saber;
  if (J(h) !== J(h0)) estado.historia = h;
  if (personagem !== E0.personagem && J(personagem) !== J(E0.personagem)) estado.personagem = personagem;
  if (npcs !== E0.npcs && J(npcs) !== J(E0.npcs)) estado.npcs = npcs;
  if (factos !== E0.factos && J(factos) !== J(E0.factos)) estado.factos = factos;
  return { estado, efeitos, notas, linhas };
}

export function oTurnoDasQuests(estado, opcoes) {
  const E = obj(estado);
  if (!E) return null;
  try { return correr(E, opcoes, null); } catch { return null; }
}

/* ============================================================
   O QUE O NARRADOR RECEBE — aMesaDasQuests(estado, { mundo, cena })
   `cena`: { presentes: [nomes], lugar } (a gente à vista e o sítio; a
   cidade é a do estado). A mão dele «está aqui» pela régua de
   `oVilaoNaPauta` — e a quest do ato põe-na quando o herói está numa das
   cidades dos papéis dela (é ali que ela acontece).
   ============================================================ */
export function aMesaDasQuests(estado, opcoes) {
  const E = obj(estado);
  const esq = E ? esqueletoDe(E) : null;
  if (!esq) return null;
  try {
    const T = QUESTS_DO_TURNO;
    const o = obj(opcoes) || {};
    const mundo = obj(o.mundo);
    const cena = obj(o.cena) || {};
    const h = garantirHistoria(E.historia);
    const Q = garantirQuestsDaEspinha(E.espinha.quests);
    const ctx = { estado: E, mundo, quests: Q.registos };
    const doAto = esq.atos.find((a) => a.ato === h.etapa) || null;
    const comQuest = !!(doAto && doAto.quest && !Q.fora.some((f) => f.id === doAto.quest));
    const R1 = comQuest ? Q.registos.find((r) => r.id === doAto.quest && r.estado === "aberta") || null : null;
    const ver = (R) => { try { return estadoDaQuest(R.id, R, ctx); } catch { return null; } };
    const v1 = R1 ? ver(R1) : null;
    const v2 = Q.registos.filter((r) => r.tipo === 2 && r.estado === "aberta").map(ver)
      .find((v) => v && v.estado === "aberta" && v.visivel && v.acesa && v.etapaTexto) || null;

    /* O PASSO: a etapa e UMA coisa que falta — a de um «algum» seriam as
       soluções todas, e o Narrador não as vê (§7) */
    let passo = "";
    const um = v1 && v1.estado === "aberta" && v1.etapaTexto ? v1 : null;
    if (um || v2) {
      const f = um ? arr(um.falta).find((x) => x && x.texto && x.predicado !== "algum") : null;
      passo = cabe([
        T.passo.cabeca + (um ? um.etapaTexto : v2.etapaTexto),
        f ? encher(T.passo.falta, { falta: f.texto }) : "",
        um && v2 ? encher(T.passo.coracao, { etapa: minuscula(v2.etapaTexto) }) : "",
      ], T.passo.teto);
    }

    /* A MÃO DELE AQUI, e os vetos */
    let mao = "";
    const naoPode = [];
    const ficha = fichaDoVilao(E.espinha);
    if (ficha) {
      const F1 = R1 ? questPorId(R1.id) : null;
      const cidades = R1 ? Object.values(obj(R1.papeis) || {}).map((p) => obj(p) && p.cidade).filter(Boolean).map(norm) : [];
      const naCidadeDaQuest = !!(F1 && F1.mao && cidades.includes(norm(E.cidadeAtual)));
      const lugar = typeof cena.lugar === "string" ? cena.lugar : (obj(E.lugar) && E.lugar.nome) || "";
      const mv = oVilaoNaPauta(ficha, E, {
        cena: { presentes: arr(cena.presentes).filter((x) => typeof x === "string"), cidade: E.cidadeAtual, lugar, ...(naCidadeDaQuest ? { mao: F1.mao.tipo } : {}) },
        mundo, quests: paraOVilao(Q.registos),
      });
      mao = mv.momento || "";
      naoPode.push(...arr(mv.naoPode));
      if (mao && um && um.mao && um.mao.quem) naoPode.push(encher(T.veto, { quem: um.mao.quem }));
    }
    /* O FAVOR: o mais recente dos lugares onde o herói está agora */
    let favor = "";
    try {
      const aqui = favoresDoLivro(E.factos).filter((f) => avaliarCondicao(["esta_em", "lugar:x"], { estado: E, papeis: { x: { tipo: "lugar", nome: f.nome, id: f.id } }, mundo }));
      const f = aqui.sort((a, b) => (b.dia || 0) - (a.dia || 0))[0];
      if (f) {
        const F = f.de ? questPorId(f.de) : null;
        favor = corta(encher(T.favor.linha, { lugar: f.nome, desde: F ? encher(T.favor.desde, { titulo: F.titulo }) : "" }), T.favor.teto);
      }
    } catch { favor = ""; }
    return { comQuest, passo, mao, naoPode, favor };
  } catch { return null; }
}

/* ============================================================
   O DIÁRIO — missoesDasQuests(estado, { mundo }) → [missão]
   ============================================================ */
export function missoesDasQuests(estado, opcoes) {
  const E = obj(estado);
  if (!E || !esqueletoDe(E)) return [];
  const Q = garantirQuestsDaEspinha(E.espinha.quests);
  const ctx = { estado: E, mundo: obj(obj(opcoes) && opcoes.mundo), quests: Q.registos };
  const out = [];
  for (const R of Q.registos) {
    try { const m = missaoDaQuest(R.id, R, ctx); if (m) out.push(m); } catch { /* uma projeção torta não apaga o Diário */ }
  }
  return out;
}

/* ============================================================
   AS ESCOLHAS — o que está aberto agora, com o veredito
   escolhasDasQuests(estado, { mundo }) → [{ quest, titulo, chave, etapa,
     opcoes: [{ id, texto, ganha, custa, efeitos, custo, podeEscolher }] }]
   ============================================================ */
export function escolhasDasQuests(estado, opcoes) {
  const E = obj(estado);
  if (!E || !esqueletoDe(E)) return [];
  const Q = garantirQuestsDaEspinha(E.espinha.quests);
  const ctx = { estado: E, mundo: obj(obj(opcoes) && opcoes.mundo), quests: Q.registos };
  const out = [];
  for (const R of Q.registos) {
    if (R.estado !== "aberta") continue;
    try {
      const v = estadoDaQuest(R.id, R, ctx);
      if (!v || !v.visivel) continue;
      for (const chave of v.escolhas) {
        const ver = vereditoDaEscolha(R.id, R, chave, ctx);
        if (ver) out.push({ quest: R.id, titulo: v.titulo, ...ver });
      }
    } catch { /* uma escolha torta não esconde as outras */ }
  }
  return out;
}

/* ============================================================
   O CLIQUE — escolherNaQuestDoEstado(estado, quest, chave, opcao, { mundo })
   → null quando a escolha é recusada (não está aberta, a opção não existe,
   a bolsa não paga) | o mesmo que oTurnoDasQuests, sobre o estado com a
   escolha feita (o preço sai, a quest avança, o vilão lê a escolha).
   Irreversível: a tela mostra o veredito ANTES (escolhasDasQuests).
   ============================================================ */
export function escolherNaQuestDoEstado(estado, quest, chave, opcao, opcoes) {
  const E = obj(estado);
  if (!E || !esqueletoDe(E)) return null;
  try {
    const Q = garantirQuestsDaEspinha(E.espinha.quests);
    const R = Q.registos.find((r) => r.id === quest && r.estado === "aberta");
    if (!R) return null;
    const ctx = { estado: E, mundo: obj(obj(opcoes) && opcoes.mundo), quests: Q.registos };
    const R2 = escolherNaQuest(R.id, R, chave, opcao, ctx);
    if (!R2 || R2 === R) return null;
    const registos = Q.registos.map((r) => (r.id === R.id ? R2 : r));
    const E2 = { ...E, espinha: { ...E.espinha, quests: { ...Q, registos } } };
    const r = correr(E2, opcoes, E.espinha.quests);
    if (!r) return null;
    /* a espinha muda sempre (a escolha entrou no registo) */
    if (!r.estado.espinha) r.estado.espinha = E2.espinha;
    return r;
  } catch { return null; }
}

/* ============================================================
   O VILÃO NO DIÁRIO — oVilaoDasQuests(estado, { mundo })
   → null | o cartaz da sombra (plano-do-vilao.js#oVilaoNoDiario), com as
   quests do registo e o relógio de hoje. Só nos mundos novos.
   ============================================================ */
export function oVilaoDasQuests(estado, opcoes) {
  const E = obj(estado);
  if (!E || !esqueletoDe(E)) return null;
  try {
    const ficha = fichaDoVilao(E.espinha);
    if (!ficha) return null;
    const Q = garantirQuestsDaEspinha(E.espinha.quests);
    return oVilaoNoDiario(ficha, E, { quests: paraOVilao(Q.registos), mundo: obj(obj(opcoes) && opcoes.mundo) });
  } catch { return null; }
}

/* ============================================================
   A REVIRAVOLTA LIDA — verAsReviravoltas(estado) → null | { espinha }
   O herói abriu o Diário: cada quest com reviravolta guarda `vistaEm`
   ({ dia, n }: quantas tinham disparado), e o bilhete «a história virou»
   desce do topo para a linha do tempo (`estadoDaQuest().reviravolta.lida`).
   null quando não há nada por ler (a espinha fica a mesma).
   ============================================================ */
export function verAsReviravoltas(estado) {
  const E = obj(estado);
  if (!E || !esqueletoDe(E)) return null;
  const Q = garantirQuestsDaEspinha(E.espinha.quests);
  const dia = Math.max(0, inteiro(E.dia) || 0);
  let mudou = false;
  const registos = Q.registos.map((r) => {
    const n = arr(r.reviravoltas).length;
    if (!n || (obj(r.vistaEm) && inteiro(r.vistaEm.n) >= n)) return r;
    mudou = true;
    return { ...r, vistaEm: { dia, n } };
  });
  return mudou ? { espinha: { ...E.espinha, quests: { ...Q, registos } } } : null;
}

/* ============================================================
   A FRASE QUE É UMA CARTA — aEscolhaDaFrase(frase, escolhas)
   → null | { quest, chave, opcao }
   `escolhas`: o que escolhasDasQuests devolve. O jogador escreve em vez de
   tocar («pago a portagem», «entrego-o à guarda»): se a frase casa uma
   carta, e só uma, a encruzilhada abre com essa carta escolhida — e o botão
   continua a confirmar (o veredito antes do clique não se salta por se
   escrever). Casa pelo começo das palavras (QUESTS_DO_TURNO.frase): o
   verbo da carta vale mais; a carta que ganha tem de ganhar sozinha.
   Fica fora do catálogo da proposta da frase (motor/a-proposta-da-frase.js):
   quem chama pergunta aqui primeiro, com as escolhas abertas.
   ============================================================ */
const palavrasDe = (x) => norm(x).split(/[^a-z0-9]+/).filter((w) => w.length >= QUESTS_DO_TURNO.frase.curta && !QUESTS_DO_TURNO.frase.vazias.includes(w));
const casam = (a, b) => {
  const T = QUESTS_DO_TURNO.frase;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i >= T.minimo && i >= Math.min(a.length, b.length) - T.folga;
};
export function aEscolhaDaFrase(frase, escolhas) {
  const ws = palavrasDe(frase);
  if (!ws.length) return null;
  const cand = [];
  for (const e of arr(escolhas)) {
    if (!obj(e)) continue;
    for (const o of arr(e.opcoes)) {
      if (!obj(o) || typeof o.texto !== "string") continue;
      const ps = palavrasDe(o.texto);
      if (!ps.length) continue;
      let pontos = 0;
      ps.forEach((p, i) => { if (ws.some((w) => casam(w, p))) pontos += i === 0 ? QUESTS_DO_TURNO.frase.verbo : 1; });
      if (pontos > 0) cand.push({ quest: e.quest, chave: e.chave, opcao: o.id, pontos });
    }
  }
  if (!cand.length) return null;
  cand.sort((a, b) => b.pontos - a.pontos);
  if (cand[1] && cand[1].pontos === cand[0].pontos) return null;
  const { quest, chave, opcao } = cand[0];
  return { quest, chave, opcao };
}
