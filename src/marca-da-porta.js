/* ============================================================
   A MARCA DA PORTA — conta pura (R21) — Taverna

   `mente/formas.md`, "### R21 · a fabricação" §4 e "### R21 · o jogo"
   §4: o disco que avisa, no retrato da cinta, que "há algo no acervo que
   você ainda não abriu". A FORMA do disco mora em `ui.jsx`
   (`MarcaDaPorta`); ESTE módulo só sabe DUAS coisas — o que conta como
   "entrou sem o jogador ter ido lá", e para onde a porta abre depois.

   NÃO É `src/abas.js` DE PROPÓSITO. `abas.js` é "as abas que ainda não
   importam" — o gatilho que revela uma sub-aba pela primeira vez, e é
   território do sistema (a outra mente está a trabalhar em
   `src/combate.js`/`src/fuga.js` neste mesmo ciclo). Esta etapa é do
   desenho (R21 é a fila do `regente`), e o pedido explícito para este
   ciclo foi um arquivo próprio — não editar o do sistema. `formas.md`
   §4 chama a tabela de `MARCA_ACENDE` "em `src/abas.js`"; ficou aqui por
   essa razão de território, e fica escrito para quem juntar as duas
   fabricações um dia (a diferença: `abas.js` decide se uma PORTA existe;
   isto decide se uma porta JÁ ABERTA tem NOVIDADE atrás dela).

   A REGRA DE FORMA, do `desenho`: a marca é para o que entrou no acervo
   SEM o jogador ter ido lá — um contrato aceite na soleira acende (foi a
   soleira que o registou, não o diário); uma entrada que ele próprio
   escreveu dentro do alforje não. A LEI QUE A TORNA RARA, do `jogo`
   (censo de 21 turnos, `formas.md` §4): não acende o que a tela
   principal já mostra, nem o que a prosa já abriu com porta própria —
   moedas, PV, hora e prazo moram na cinta; o LUGAR muda 6 vezes em 21 e
   é a gravura que o diz; sub-aba nova e Códex têm a porta `▸` da prosa;
   conquistas e etapas a prosa já celebra.

   DETERMINISMO E IMUTABILIDADE: nada de `Date.now`, nada de mutação —
   `fotoDoAcervo` lê o que o App já tem, `marcasQueAcendem` só compara.
   ============================================================ */

/* ============================================================
   MARCA_ACENDE — a tabela. Cada linha diz UMA aba, o que a acende
   (`mudou`) e o PORQUÊ escrito — a suíte prova as duas colunas, a de
   "acende" e a de "não acende", porque uma regra sem o porquê escrito é
   como a próxima nasce torta (a mesma lei de `abas.js`).
   ============================================================ */
export const MARCA_ACENDE = [
  {
    id: "diario",
    porque:
      "uma missão que ENTRA (id novo), CONCLUI ou FALHA muda o acervo — " +
      "4 em 21 no censo do `jogo`. Etapa cumprida (🧭) NÃO acende: a linha " +
      "🧭 da prosa já diz, e a missão continua no mesmo estado (`ativa`), " +
      "que é por isso que a foto guarda só id+status, nunca as etapas.",
    mudou: (antes, depois) => {
      const a = (antes && antes.missoes) || {};
      const d = (depois && depois.missoes) || {};
      for (const id of Object.keys(d)) {
        if (!(id in a)) return true; /* entra */
        if (a[id] !== d[id] && (d[id] === "concluida" || d[id] === "falhada")) return true; /* conclui / falha */
      }
      return false;
    },
  },
  {
    id: "inv",
    porque:
      "um item NOVO, ou uma quantidade que SOBE, sem ter sido comprado " +
      "ou tirado DENTRO do alforje (isso é `origem: \"alforje\"`, e não " +
      "chega a esta tabela — `marcasQueAcendem` corta antes). Moedas " +
      "nunca acendem: moram na cinta (◉).",
    mudou: (antes, depois) => {
      const a = (antes && antes.itens) || {};
      const d = (depois && depois.itens) || {};
      for (const nome of Object.keys(d)) {
        if (!(nome in a) || d[nome] > a[nome]) return true;
      }
      return false;
    },
  },
  {
    id: "gestao",
    porque:
      "uma carta NOVA no correio, ou alguém que ENTRA ou SAI do grupo. " +
      "PV, PM, nível e pontos nunca acendem: moram na cinta, e o nível " +
      "tem o seu próprio véu de cerimónia.",
    mudou: (antes, depois) => {
      const ca = (antes && antes.correio) || [];
      const cd = (depois && depois.correio) || [];
      if (cd.some((id) => !ca.includes(id))) return true;
      const ga = (antes && antes.grupo) || [];
      const gd = (depois && depois.grupo) || [];
      if (ga.length !== gd.length) return true;
      if (gd.some((nome) => !ga.includes(nome))) return true;
      if (ga.some((nome) => !gd.includes(nome))) return true;
      return false;
    },
  },
  {
    id: "mapa",
    porque:
      "um DESTINO NOVO entra no mapa. O lugar ATUAL nunca acende — mudou " +
      "6 vezes em 21 turnos no censo do `jogo`, e acender por isso seria " +
      "papel de parede; quem diz onde o herói está é a gravura, e a " +
      "chegada já tem a linha 📍 da prosa.",
    mudou: (antes, depois) => {
      const da = (antes && antes.destinos) || [];
      const dd = (depois && depois.destinos) || [];
      return dd.some((nome) => !da.includes(nome));
    },
  },
];

/* ============================================================
   fotoDoAcervo — o retrato comparável.

   DE ONDE SAI CADA CAMPO NO `App.jsx` (para o `oficial` ligar):
     · missoes  → o estado `missoes` (NÃO `quests`, que só existe pela
       migração — `App.jsx` ~l.5382: "as `quests` antigas continuam
       existindo só o tempo da migração"). É a lista crua de missões,
       cada uma com `.id` e `.status` (`oferecida|ativa|concluida|
       falhada|recusada`, `src/missoes.js`).
     · itens    → `personagem.inventario` — o array cru (strings ou
       objetos `{ nome, ... }`; a mesma quantidade repete o nome, como
       `App.jsx` já lê em `PainelLateral` ao agrupar a bolsa, ~l.3550).
     · correio  → o objeto `correio` inteiro (`{ enviadas, recebidas,
       historico, tratados, seq }`, `App.jsx` ~l.7428); só `recebidas`
       importa aqui — cada carta tem `.id` (`src/correio.js`).
     · grupo    → `personagem.grupo` — o array cru de companheiros, cada
       um com `.nome` (é por `.nome` que o resto do App já os identifica,
       nunca por um id próprio).
     · destinos → `mapa.cidades` — o array cru; uma cidade é "destino
       conhecido" quando `.descoberta !== false` (`src/mapa.js`,
       `criarCidade`; `PainelMapa` já filtra assim para a névoa).

   A ASSINATURA DE CADA CAMPO É A MAIS SIMPLES QUE AINDA PROVA A
   PERGUNTA CERTA: missões por id+status (não pelas etapas — é isso que
   faz "etapa cumprida" não acender sozinho); itens por nome+contagem;
   correio e destinos por id/nome; grupo por nome. Nenhum campo guarda
   mais do que a tabela de cima precisa de comparar.

   `= {}` NO DESTRUCTURING NÃO COBRE `null`: por isso `dados` é um
   parâmetro só, testado com `&&`, e cada sub-normalizador testa o seu
   próprio pedaço a mesma forma — `fotoDoAcervo(null)` e
   `fotoDoAcervo()` devolvem o mesmo retrato vazio. */
export function fotoDoAcervo(dados) {
  const d = dados && typeof dados === "object" ? dados : {};
  return {
    missoes: normalizarMissoes(d.missoes),
    itens: normalizarItens(d.itens),
    correio: normalizarCorreio(d.correio),
    grupo: normalizarGrupo(d.grupo),
    destinos: normalizarDestinos(d.destinos),
  };
}

function normalizarMissoes(lista) {
  const m = {};
  for (const x of Array.isArray(lista) ? lista : []) {
    if (x && x.id != null) m[String(x.id)] = String(x.status || "");
  }
  return m;
}

function normalizarItens(inventario) {
  const m = {};
  for (const raw of Array.isArray(inventario) ? inventario : []) {
    const nome = typeof raw === "string" ? raw : (raw && typeof raw === "object" && raw.nome) || "";
    if (!nome) continue;
    m[nome] = (m[nome] || 0) + 1;
  }
  return m;
}

function normalizarCorreio(correio) {
  const recebidas = correio && Array.isArray(correio.recebidas) ? correio.recebidas : [];
  const ids = [];
  for (const c of recebidas) if (c && c.id != null) ids.push(String(c.id));
  return ids;
}

function normalizarGrupo(grupo) {
  const nomes = [];
  for (const g of Array.isArray(grupo) ? grupo : []) if (g && g.nome) nomes.push(String(g.nome));
  return nomes;
}

function normalizarDestinos(cidades) {
  const nomes = [];
  for (const c of Array.isArray(cidades) ? cidades : []) {
    if (c && c.descoberta !== false && c.nome) nomes.push(String(c.nome));
  }
  return nomes;
}

/* ============================================================
   marcasQueAcendem — compara dois retratos de `fotoDoAcervo` e devolve
   as abas que acendem.

   `origem === "alforje"`: a mudança foi feita PELO JOGADOR dentro do
   alforje (comprar no Mercado, por exemplo) — nada acende, e a régua
   corta ANTES de olhar a tabela, para nenhuma linha dela precisar de
   saber de onde a mudança veio. */
export function marcasQueAcendem(antes, depois, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  if (o.origem === "alforje") return [];
  const a = antes && typeof antes === "object" ? antes : {};
  const d = depois && typeof depois === "object" ? depois : {};
  const acesas = [];
  for (const regra of MARCA_ACENDE) {
    let mudou = false;
    try {
      mudou = !!regra.mudou(a, d);
    } catch {
      mudou = false; /* uma regra que estoura não pode acender uma marca errada nem derrubar o turno */
    }
    if (mudou) acesas.push(regra.id);
  }
  return acesas;
}

/* ============================================================
   abaDaPorta — para onde a porta abre.

   `mente/formas.md`, "### R21 · o jogo" §3, medido no censo (3
   aberturas sem marca: "a última aba" acertou 0, "a Ficha" acertou 1):
   SEM marca abre na Ficha (aqui, a aba `gestao`, que é onde a Ficha
   mora — `subGestao` cai para `"ficha"` sozinho quando não há outra
   escolhida, `App.jsx`); COM marca, abre na MAIS RECENTE — a última
   marca da lista, nunca "a última aba visitada". */
export function abaDaPorta(marcas) {
  const lista = Array.isArray(marcas) ? marcas.filter((x) => typeof x === "string" && x) : [];
  return lista.length ? lista[lista.length - 1] : "gestao";
}

/* O par pronto para `nomeDaPorta`: uma frase por aba, já com a
   preposição certa em português ("no" para `diario`/`mapa`, "na" para
   `inv`/`gestao`) — as quatro abas que `MARCA_ACENDE` conhece, e
   nenhuma outra. Exportada à parte para quem monta a porta no `App.jsx`
   não ter de decidir concordância de género: a única frase que
   `formas.md` escreve por extenso é "há novo no diário" (§4); as outras
   três seguem a mesma gramática. */
export const ROTULOS_DA_PORTA = {
  diario: "no diário",
  inv: "na bolsa",
  gestao: "na gestão",
  mapa: "no mapa",
};

/* ============================================================
   nomeDaPorta — o nome acessível da porta, que muda com a marca
   (`mente/formas.md` §4: "A ficha" → "A ficha — há novo no diário").

   SEM `aria-live`: o acontecimento já foi dito pela linha de sistema na
   prosa quando entrou no acervo; anunciar de novo aqui seria ruído — a
   marca só precisa de estar certa quando alguém LER o retrato (com um
   leitor de tela, ao navegar até ele), não de interromper para avisar. */
export function nomeDaPorta(marcas, rotulos) {
  const lista = Array.isArray(marcas) ? marcas.filter((x) => typeof x === "string" && x) : [];
  if (!lista.length) return "A ficha";
  const aba = lista[lista.length - 1];
  const r = rotulos && typeof rotulos === "object" ? rotulos : {};
  const frase = typeof r[aba] === "string" ? r[aba] : "";
  return frase ? `A ficha — há novo ${frase}` : "A ficha";
}
