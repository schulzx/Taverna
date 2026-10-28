/* ============================================================
   O JUIZ CORRIGE (Fase T, trilha B · 28/10/2026) — src/motor/correcao-do-juiz.js

   O Juiz de fidelidade (juiz-de-fidelidade.js) nasceu a MEDIR: a cada
   resposta, o que a prosa disse que o sistema não sabia, com o trecho e o
   motivo; juiz-do-turno.js guarda o veredito no save (`fidelidade`). A
   pessoa aprovou o passo seguinte: o motor FAZER alguma coisa com a
   invenção apanhada. Esta peça é essa coisa, e são duas:

   1. O VETO NO TURNO SEGUINTE. A invenção já está na tela — o jogador
      leu-a, e repedir a resposta custaria uma chamada paga (fica como
      proposta, não ligada). O que ainda se pode impedir é ela VOLTAR como
      verdade: o Narrador lê as próprias respostas de antes e repete-as, e
      o eco faz do número inventado um fato. O veto leva o número do
      sistema: "pôr em «Elixir de Destreza» outro preço que não ◉ 140, o
      da mesa". Entra pela pauta dinâmica, na secção `vetoDoJuiz` de
      pauta.js — rótulo NÃO PODE, vizinha da `naoPode`, e lida no mesmo
      bloco que ela —, dentro do TETO_DA_PAUTA, que corta pela prioridade
      como corta tudo. Nenhum bloco estático: o teto de ~82 mil não se mexe.

   2. O CÂNONE NÃO GUARDA A INVENÇÃO. O Cronista regista o que a prosa
      trouxe; o cânone é o bloco que o prompt chama "verdades imutáveis".
      Um nome que o Juiz deu por inventado no MESMO turno não entra lá:
      nas sessões 8 a 10, «Sem Nome», «Alçapão sob a forja de Tomas» e
      «Fiandeira» entraram assim. Só o cânone: a gente que a cena pôs a
      agir (`aceito.pessoas`) fica no registo — ver «pessoa», abaixo.

   ---------------- O PORTÃO MORDE SÓ O NECESSÁRIO ----------------

   Um veto errado é pior que nenhum: proíbe o Narrador de dizer o que
   estava certo, ou desfaz o que o jogador já viu e tocou. A medida no
   corpus rotulado (testes/juiz-rotulado.json) e nas sessões 8–10 decidiu
   cada espécie, e o `porque` de cada uma está na tabela:

   · veta-se só a CONTRADIÇÃO — o sistema tinha o número (o preço da mesa,
     a distância do mapa) e a prosa disse outro. Aí há uma verdade para
     dar, e o veto dá-a;
   · o número que o sistema NÃO deu ao turno (17 dos 20 preços inventados
     do corpus: a cama, a taxa, o câmbio, a comida que a mesa não trouxe)
     não tem verdade para dar: vetá-lo trava a compra ou a viagem que o
     jogador está a fazer. É um buraco da mesa, e a cura é a mesa trazê-lo;
   · a gente e os sítios que a prosa pôs em cena, o jogador viu e seguiu:
     o Dolmen da 10.ª, inventado no M62, é o capanga que o herói prende; a
     banca dos cambistas e a estalagem torta são sítios aonde ele foi.
     Vetá-los apagava-os da cena. Ficam na medida, e o cânone não os
     consagra;
   · o tempo ("há três noites") compara-se com o relógio de OUTRA coisa
     quando o sistema tem um só: 2 dos 6 achados do corpus são resposta
     limpa.

   A suíte (testes/teste-correcao-do-juiz.mjs) refaz a medida e quebra se
   uma espécie que veta passar a morder resposta limpa.

   E O JUIZ CEGO NÃO MEXE NO CÂNONE. Sem o mundo da cidade na entrada (o
   que `entradaDoJuiz` refaz pela semente: os locais, a gente, os papéis),
   todo nome é novo para ele — é verdade como medida, não como correção.
   As três sessões de prova foram gravadas de registos sem a semente, e ali
   a correção tiraria do cânone a Cabra Trêmula, a Ordem dos Esquecidos e
   o Cerco de Pedra Rasa, que o mundo tem. No jogo a semente vem sempre;
   se a refeitura falhar (o `catch` de entradaDoJuiz), os papéis vêm
   vazios, e a correção cala. E o cânone nunca perde um nome que o estado
   já conhece (o registo de gente, o cânone de antes, o mapa, o herói e o
   grupo). O veto não precisa desta guarda: as duas espécies que vetam só
   nascem com o número do sistema dentro do achado (a `tabela`, o
   `sistema`), e cego o Juiz não as acha.

   ---------------- QUANDO O VETO ENTRA ----------------

   Cada linha na pauta tira outra: nas 204 pautas gravadas da 5.ª à 7.ª
   sessão (todas perto do teto), uma linha a 2,0 — a prio da `naoPode` —
   cortava o PERGUNTOU, o RUMO e o FECHO. Por isso a secção `vetoDoJuiz`
   corta com 4,5 (a prio dela em SECOES), depois da resposta, da aposta e
   de quem está em cena, e o veto só entra quando importa: no turno logo a seguir à
   invenção (a conversa ainda é sobre aquilo), ou quando a frase do
   jogador toca a coisa vetada (o item, o destino). Na luta cede inteiro.

   ---------------- O QUE SAI ----------------

     juizCego(entrada)                              → o Juiz julgou os nomes sem o mundo?
     especieDoAchado(classe, achado)                → a espécie, ou null
     vetosDoVeredito(veredito, { turno, cidade })    → os vetos novos
     andarOsVetos(vivos, novos, { turno, cidade })   → o livro de vetos
     vetosParaAPauta(vivos, { turno, cidade, frase }) → as linhas da secção
     canoneSemInvencao(aceito, veredito, { entrada, estado }) → { aceito, tirados }

   Puro: nada aqui toca React, refs ou rede; o que entra é lido, nunca
   mudado. Determinista — não há sorte nesta decisão. Lixo (`null`, `{}`,
   listas tortas) dá o vazio, nunca lança.
   ============================================================ */

import { TOLERANCIAS_DO_JUIZ } from "../juiz-de-fidelidade.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ").trim();
const palavrasDe = (s) => sem(s).replace(/[^a-z0-9]+/g, " ").trim();
const corta = (s, n) => { const t = String(s == null ? "" : s).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
const num = (x) => (x != null && x !== "" && Number.isFinite(Number(x)) ? Number(x) : null);
const numero = (x) => String(x).replace(/(\d)\.(\d)/g, "$1,$2");

/* ---------------- A TABELA ----------------
   `vida`: quantos turnos o veto fica no livro depois do turno em que a
   invenção saiu (a porta da pauta, em `vetosParaAPauta`, é que decide se
   ele entra em cada um). `naPauta`: as linhas do Juiz numa pauta (as mais
   novas). `guardados`: o livro de vetos vivos. `letras`: cada linha.

   `especies`: uma por forma de achado, na ordem em que se procuram. `se`
   é o que o achado tem de ter: `com` (o campo existe), `sem` (o campo
   falta ou é vazio), `tipo` (um dos tipos), `dito` (dentro de uma fala,
   ou não). `faz`: "veto" (vai à pauta) ou "mede" (só o veredito o guarda).
   A medida de cada espécie é a da suíte, que a lê de volta. */
export const CORRECAO_DO_JUIZ = Object.freeze({
  vida: 3,
  naPauta: 2,
  guardados: 6,
  letras: 150,
  /* o Juiz está cego para nomes quando a entrada não traz nenhum destes —
     os papéis só vêm do mundo da cidade refeito pela semente (ver o cabeçalho) */
  cego: Object.freeze(["papeis"]),
  especies: Object.freeze([
    {
      id: "preco-contra-a-mesa", classe: "precosInventados", se: { com: "tabela" }, faz: "veto",
      porque: "a mesa tinha o preço e a prosa disse outro: o número certo existe, e o veto dá-o",
    },
    {
      id: "preco-sem-mesa", classe: "precosInventados", se: { sem: "tabela", com: "item" }, faz: "mede",
      porque: "o preço de uma coisa que a mesa do turno não trouxe (a cama, a taxa, o câmbio, o serviço, a comida fora da pauta): não há número para dar, e vetar a confirmação trava a compra — o buraco é da mesa",
    },
    {
      id: "valor-solto", classe: "precosInventados", se: { sem: ["tabela", "item"] }, faz: "mede",
      porque: "o valor sem coisa ('Tudo, sete', 'uma moeda por cabeça'): não se sabe de que é, logo não há verdade para pôr no lugar",
    },
    {
      id: "distancia-contra-o-mapa", classe: "distanciasFora", se: { tipo: ["viagem"], com: "sistema" }, faz: "veto",
      porque: "o mapa deu a distância e a prosa disse outra",
    },
    {
      id: "distancia-sem-mapa", classe: "distanciasFora", se: { tipo: ["viagem"], sem: "sistema" }, faz: "mede",
      porque: "uma distância que o turno não trouxe: o mapa sabe-a (as coordenadas), mas o achado não diz o destino — a cura é a pauta trazê-la quando a frase o nomeia",
    },
    {
      id: "tempo", classe: "distanciasFora", se: { tipo: ["decorrido", "porvir"] }, faz: "mede",
      porque: "o 'há três noites' compara-se com o relógio de OUTRA coisa quando o sistema tem um só (o pedido da Brina, 312 h): morder aqui proíbe uma fala certa",
    },
    {
      id: "lugar-da-cena", classe: "lugaresNovos", se: { dito: false }, faz: "mede",
      porque: "a prosa pôs a cena num sítio que o lugar não tem, e o jogador está lá (a estalagem torta, onde dormiu): o veto desfazia a cena; o cânone não o consagra",
    },
    {
      id: "lugar-dito", classe: "lugaresNovos", se: { dito: true }, faz: "mede",
      porque: "um sítio dito numa fala que o mapa não tem (a banca dos cambistas): o jogador foi lá cinco turnos depois; o cânone não o consagra",
    },
    {
      id: "pessoa", classe: "pessoasNovas", faz: "mede",
      porque: "quem a cena pôs a agir, o jogador viu e pode seguir: o Cronista regista-o (é o papel dele), e vetá-lo apagava alguém com quem se luta e se fala — o Dolmen da 10.ª é o capanga que o herói prende",
    },
    {
      id: "nome", classe: "nomesNovos", faz: "mede",
      porque: "menção não é presença: o nome dito de passagem (a Ordem da Coroa, a Guerra dos Sete Príncipes) é cor, e um veto sobre cor morde a cena boa",
    },
  ].map((x) => Object.freeze(x))),
  /* o cânone: um nome destas classes, dado por novo no MESMO turno, não
     entra nas verdades imutáveis. A gente (`aceito.pessoas`) não é tocada. */
  canone: Object.freeze({
    classes: Object.freeze(["lugaresNovos", "pessoasNovas", "nomesNovos"]),
    porque: "o cânone é o bloco que o prompt chama verdades imutáveis: a invenção que entra lá volta ao Narrador como a coisa que ele nunca pode contradizer",
  }),
});

/* as linhas, uma por espécie que veta: o que vem depois de "NÃO PODE" na
   pauta, no infinitivo como as outras linhas do bloco. O item vai entre
   aspas — "o pouso", "a taxa": a coisa como a prosa a disse. */
export const LINHAS_DA_CORRECAO = Object.freeze({
  "preco-contra-a-mesa": (a) => `pôr em «${a.item}» outro preço que não ◉ ${numero(a.tabela)}, o da mesa (o ${numero(a.valor)} dito antes não vale)`,
  "distancia-contra-o-mapa": (a) => `dar outra distância que não a do mapa (${numero(a.sistema)}): «${numero(a.valor)} ${a.unidade}» dito antes não vale`,
});

const vazio = (v) => v == null || (typeof v === "string" && !v.trim());
const casa = (se, a) => {
  const s = obj(se);
  for (const c of [].concat(s.com == null ? [] : s.com)) if (vazio(a[c])) return false;
  for (const c of [].concat(s.sem == null ? [] : s.sem)) if (!vazio(a[c])) return false;
  if (Array.isArray(s.tipo) && !s.tipo.includes(a.tipo)) return false;
  if (typeof s.dito === "boolean" && !!a.dito !== s.dito) return false;
  return true;
};

/* o Juiz julgou os nomes sem o mundo da cidade: a entrada existe e não traz
   nada do que a tabela pede. Sem entrada nenhuma não se sabe — quem chama
   passa-a. */
export function juizCego(entrada) {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) return false;
  return CORRECAO_DO_JUIZ.cego.every((c) => !arr(entrada[c]).length);
}

/* a espécie do achado: a primeira da tabela que casa com a classe e o `se` */
export function especieDoAchado(classe, achado) {
  const a = obj(achado);
  if (!Object.keys(a).length) return null;
  return CORRECAO_DO_JUIZ.especies.find((e) => e.classe === classe && casa(e.se, a)) || null;
}

/* o alvo do veto (dois achados com o mesmo alvo são um veto só, e o novo
   substitui o velho) e as palavras que, ditas pelo jogador, o trazem de
   volta à conversa: a coisa do preço, os destinos da distância */
const alvoDe = (esp, a) => (esp.classe === "precosInventados" ? `preco:${sem(a.item)}` : `distancia:${sem(a.sistema)}`);
const toques = (esp, a) => (esp.classe === "precosInventados"
  ? [palavrasDe(a.item).replace(/^(o|a|os|as) /, "")]
  : String(a.sistema || "").split("·").map((x) => palavrasDe(x.replace(/[\d.,]+\s*h\s*$/i, "")))).filter((x) => x.length >= TOLERANCIAS_DO_JUIZ.nomeMinimo);

/* os vetos que um veredito deixa para os turnos seguintes */
export function vetosDoVeredito(veredito, ctx) {
  const v = obj(veredito), c = obj(ctx);
  const turno = num(c.turno), cidade = typeof c.cidade === "string" ? c.cidade : "";
  const out = [];
  for (const classe of [...new Set(CORRECAO_DO_JUIZ.especies.map((e) => e.classe))]) {
    for (const a of arr(v[classe])) {
      if (!a || typeof a !== "object") continue;
      const esp = especieDoAchado(classe, a);
      if (!esp || esp.faz !== "veto" || !LINHAS_DA_CORRECAO[esp.id]) continue;
      let linha;
      try { linha = corta(LINHAS_DA_CORRECAO[esp.id](a), CORRECAO_DO_JUIZ.letras); } catch { continue; }
      const alvo = alvoDe(esp, a);
      if (!linha || out.some((x) => x.alvo === alvo)) continue;
      out.push({ especie: esp.id, alvo, linha, toques: toques(esp, a), turno, ate: turno == null ? null : turno + CORRECAO_DO_JUIZ.vida, cidade });
    }
  }
  return out;
}

/* vivo neste turno e nesta cidade: o preço é de uma cidade, e a distância
   é medida daqui — mudar de cidade apaga o livro */
const vivo = (x, turno, cidade) => !!x && typeof x === "object" && typeof x.linha === "string" && !!x.linha.trim()
  && (turno == null || x.ate == null || (turno <= x.ate && (x.turno == null || turno > x.turno)))
  && (cidade === undefined || !x.cidade || x.cidade === cidade);

const ctxDe = (ctx) => {
  const c = obj(ctx);
  return { turno: num(c.turno), cidade: typeof c.cidade === "string" ? c.cidade : undefined, frase: typeof c.frase === "string" ? c.frase : "" };
};

/* o livro do turno: os vivos de antes, sem os que expiraram ou ficaram
   noutra cidade, mais os novos (o novo com o mesmo alvo substitui o
   velho), no máximo `guardados`, os mais novos */
export function andarOsVetos(vivos, novos, ctx) {
  const { turno, cidade } = ctxDe(ctx);
  const ns = arr(novos).filter((x) => x && typeof x === "object" && typeof x.linha === "string" && x.linha.trim());
  /* o novo nasce neste turno: só o prazo e a cidade o tiram, não o "ainda não é a vez dele" */
  const velhos = arr(vivos).filter((x) => vivo(x, turno == null ? null : turno + 1, cidade) && !ns.some((n) => n.alvo === x.alvo));
  return [...velhos, ...ns].slice(-CORRECAO_DO_JUIZ.guardados).map((x) => ({ ...x, toques: arr(x.toques).slice() }));
}

/* as linhas que vão à secção do Juiz neste turno: as dos vetos vivos que
   importam agora — o turno logo a seguir à invenção, ou a frase do jogador
   a tocar a coisa —, as mais novas primeiro, no máximo `naPauta` */
export function vetosParaAPauta(vivos, ctx) {
  const { turno, cidade, frase } = ctxDe(ctx);
  const f = ` ${palavrasDe(frase)} `;
  const importa = (x) => (turno != null && x.turno != null && turno === x.turno + 1) || arr(x.toques).some((p) => typeof p === "string" && p && f.includes(` ${p} `));
  return arr(vivos).filter((x) => vivo(x, turno, cidade) && importa(x)).slice(-CORRECAO_DO_JUIZ.naPauta).reverse().map((x) => x.linha);
}

/* o nome do cânone que é o nome inventado, ou o contém por palavra inteira
   ("Alçapão sob a forja de Tomas" contém "alçapão") */
const contemPalavra = (todo, parte) => {
  const t = ` ${palavrasDe(todo)} `, p = palavrasDe(parte);
  return p.length >= TOLERANCIAS_DO_JUIZ.nomeMinimo && t.includes(` ${p} `);
};

/* os nomes que o estado já conhece: esses o cânone nunca perde, diga o
   Juiz o que disser (a entrada dele pode ter faltado a alguém) */
const nome = (x) => (typeof x === "string" ? x : x && typeof x === "object" && typeof x.nome === "string" ? x.nome : "");
function conhecidosDo(estado) {
  const e = obj(estado), p = obj(e.personagem), m = obj(e.mapa);
  const xs = [...Object.keys(obj(e.npcs)), ...Object.keys(obj(e.canone)), nome(p), ...arr(p.grupo).map(nome), e.cidadeAtual, nome(e.lugar)];
  for (const c of arr(m.cidades)) xs.push(nome(c), obj(c).regiao, obj(c).continente);
  for (const r of arr(m.regioes)) xs.push(nome(r));
  return new Set(xs.filter((x) => typeof x === "string" && x.trim()).map(palavrasDe));
}

/* o cânone que o Cronista propôs, sem o que o Juiz deu por inventado neste
   turno. Devolve o aceito (o mesmo, se nada sai) e os tirados. */
export function canoneSemInvencao(aceito, veredito, ctx) {
  const A = obj(aceito), v = obj(veredito), c = obj(ctx);
  const igual = { aceito: aceito && typeof aceito === "object" && !Array.isArray(aceito) ? aceito : {}, tirados: [] };
  if (juizCego(c.entrada)) return igual;
  const sabe = conhecidosDo(c.estado);
  const nomes = CORRECAO_DO_JUIZ.canone.classes.flatMap((cl) => arr(v[cl]).map((a) => ({ classe: cl, nome: obj(a).nome })).filter((x) => typeof x.nome === "string" && x.nome.trim()));
  const tirados = [], fica = {};
  for (const [n, f] of Object.entries(obj(A.canone))) {
    const quem = !sabe.has(palavrasDe(n)) && nomes.find((x) => contemPalavra(n, x.nome));
    if (quem) tirados.push({ nome: n, classe: quem.classe, por: quem.nome });
    else fica[n] = f;
  }
  if (!tirados.length) return igual;
  const novo = { ...A };
  if (Object.keys(fica).length) novo.canone = fica; else delete novo.canone;
  return { aceito: novo, tirados };
}
