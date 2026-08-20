/* ============================================================
   O QUE VOCÊ NÃO TEM (v9.76) — o mestre confere a ficha

   O relato que originou este arquivo, e ele é o mais grave que este
   projeto recebeu em muitas versões:

     "Se eu digo 'uso invisibilidade' e o narrador narrar que eu usei
     invisibilidade e fiz um roubo, acontece que acabei de fazer isso,
     mas estou com um personagem nível 1 e sem invisibilidade, mas
     aconteceu."

   O sistema tem catálogo de magias, tem árvore de habilidades por
   classe, tem a ficha do herói na mão — e nada disso era consultado
   antes de o turno virar ficção. "Uso invisibilidade" não casava
   NENHUMA porta do despachante: não é comando, não é magia da ficha
   (justamente porque não está nela), não é desafio, não é pergunta ao
   mundo. Caía em `cena`, e a IA narrava o que foi pedido, porque narrar
   o que foi pedido é o trabalho dela.

   Ou seja: a única coisa que separava o jogador de qualquer poder do
   jogo era escrever o nome dele. O grimório, a árvore de talentos, os
   pontos de habilidade, o custo em PM e os vinte níveis de progressão
   viravam decoração — tudo o que eles gerenciam pode ser obtido de
   graça digitando uma frase.

   ------------------------------------------------------------
   AS DUAS FORMAS DA MENTIRA, e as duas entram aqui:

   1. O PODER NOMEADO. "Uso Invisibilidade", "conjuro Bola de Fogo".
      O sistema procura o nome no catálogo. Se ele EXISTE no jogo e NÃO
      está na ficha, o turno é recusado.

   2. O EFEITO RECLAMADO. "Enquanto estou invisível, roubo a carta" —
      sem nomear poder nenhum, o jogador afirma um estado que o sistema
      nunca concedeu. Aqui a pergunta não é "tem a magia?", é "está
      invisível AGORA?", e quem responde é a lista de efeitos ativos.

   ------------------------------------------------------------
   A TRAVA, e ela é o que torna isto seguro:

   SÓ SE RECUSA O QUE O CATÁLOGO CONHECE. "Uso a corda", "uso a chave",
   "uso o mapa" não são poderes e o sistema não opina — silêncio. Um
   detector que recusasse qualquer "uso X" desconhecido transformaria
   cada objeto de mochila num erro, e o remédio seria pior que a doença.

   E as PALAVRAS COMUNS ficam de fora. A árvore de classes tem
   habilidades chamadas "Muralha", "Investida", "Provocação", "Escudo" —
   palavras que qualquer frase de português usa sem nenhuma intenção
   mecânica. "Uso a muralha para me esconder" é tática, não é reivindicar
   um talento de Guerreiro. Nome de poder que também é substantivo comum
   só conta quando o jogador o escreve como nome próprio ou completo.
   ============================================================ */

import { MAGIAS } from "./grimorio.js";
import { CONSUMIVEIS, comoConsumivel } from "./pocoes.js";
import { CLASSES } from "./classes.js";
import { estaInvisivel } from "./gatilhos.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- O CATÁLOGO DE TUDO QUE É PODER ----------------
   Magias do grimório mais tudo o que a árvore das classes chama de
   habilidade. Montado uma vez: são duas centenas de nomes e a leitura é
   por turno. */
function colherNomes() {
  const out = new Map();
  for (const m of MAGIAS) if (m && m.nome) out.set(norm(m.nome), { nome: m.nome, tipo: "magia", nivel: m.nivel || 1 });
  const varre = (o) => {
    if (!o) return;
    if (Array.isArray(o)) { o.forEach(varre); return; }
    if (typeof o !== "object") return;
    if (typeof o.nome === "string" && o.nome && !out.has(norm(o.nome))) out.set(norm(o.nome), { nome: o.nome, tipo: "habilidade" });
    Object.values(o).forEach(varre);
  };
  varre(CLASSES);
  /* AS RUBRICAS SAEM. A varredura pega todo `nome` da árvore, e a árvore
     tem três camadas de rótulo que não são poder nenhum: a classe
     ("Guerreiro"), a subclasse ("Cavaleiro", "Bárbaro") e a
     especialização. Ninguém "usa Bárbaro" — e deixá-los dentro faria o
     sistema recusar frases que citassem o próprio caminho do herói. */
  for (const c of CLASSES) {
    if (!c) continue;
    if (c.nome) out.delete(norm(c.nome));
    for (const sub of c.subclasses || []) {
      if (!sub) continue;
      if (sub.nome) out.delete(norm(sub.nome));
      for (const esp of sub.especializacoes || []) if (esp && esp.nome) out.delete(norm(esp.nome));
    }
  }
  return out;
}
export const CATALOGO = colherNomes();

/* Nomes de poder que também são palavra comum do português. Só contam
   quando o jogador escreve o nome INTEIRO com mais de uma palavra, ou
   quando o poder está na ficha (aí não há o que recusar). */
export const PALAVRAS_COMUNS = new Set([
  "muralha", "investida", "provocacao", "escudo", "furia", "golpe", "ataque", "grito",
  "postura", "presenca", "marca", "sombra", "chama", "gelo", "raio", "veneno", "sorte",
  "forma", "salto", "corrida", "passo", "toque", "olhar", "voz", "canto", "reflexo",
  "barreira", "abrigo", "guarda", "corte", "arremesso", "disparo", "tiro", "flecha",
]);

export const RX_DECLARA = /\b(uso|usar|utilizo|conjuro|conjurar|lan[cç]o|lan[cç]ar|invoco|invocar|ativo|ativar|canalizo|canalizar|aciono|acionar|solto|disparo)\b/;

/* ---------------- O QUE A FICHA TEM ----------------
   Habilidades aprendidas, magias preparadas e o que a ficha guardar em
   qualquer lista de poder. É a única fonte: o que não está aqui, o herói
   não tem, e nenhuma frase muda isso. */
export function poderesDaFicha(pers) {
  const p = pers || {};
  const listas = [p.habilidades, p.preparadas, p.magias, p.dadivas, p.sintonizados, p.milagres];
  const out = new Set();
  for (const l of listas) {
    for (const h of (Array.isArray(l) ? l : [])) {
      const nome = typeof h === "string" ? h : (h && h.nome);
      if (nome) out.add(norm(nome));
    }
  }
  return out;
}

export function temOPoder(pers, nome) {
  return poderesDaFicha(pers).has(norm(nome));
}

/* ---------------- O PODER NOMEADO ----------------
   O nome mais longo ganha, pela razão de sempre: "Invisibilidade" e
   "Invisibilidade Maior" na mesma frase não podem trocar de lugar. */
export function poderDeclarado(texto) {
  const t = norm(texto);
  if (!t || !RX_DECLARA.test(t)) return null;
  let achado = null;
  for (const [chave, dados] of CATALOGO) {
    if (!t.includes(chave)) continue;
    /* palavra comum só conta com nome composto — "uso a muralha para me
       esconder" é tática, não é reivindicar um talento de Guerreiro */
    if (PALAVRAS_COMUNS.has(chave) && chave.split(" ").length === 1) continue;
    if (!achado || chave.length > norm(achado.nome).length) achado = dados;
  }
  return achado;
}

/* ============================================================
   O EFEITO RECLAMADO

   A outra forma da mentira, e a mais escorregadia: o jogador não nomeia
   poder nenhum — afirma um ESTADO. "Enquanto estou invisível, roubo a
   carta de Lucan sem que ele veja."

   Aqui a pergunta não é "tem a magia?", é "está assim AGORA?", e quem
   responde é a lista de efeitos ativos da ficha. É deliberadamente uma
   lista curta: só os estados que mudam o que é POSSÍVEL na cena, e que
   por isso o jogador tem interesse em afirmar sem ter.
   ============================================================ */
export const ESTADOS_RECLAMADOS = [
  {
    id: "invisivel",
    rx: /\b(estou|fico|continuo|permane[cç]o|estando|enquanto estou)\s+invisiv/,
    diz: "invisível",
    tem: (p) => estaInvisivel(p),
    porque: "invisibilidade é a coisa mais reivindicada sem se ter, porque ela resolve furto, fuga e infiltração de uma vez",
  },
  {
    id: "voando",
    rx: /\b(estou|fico|continuo|permane[cç]o|estando)\s+(voando|no ar|em voo)|\bvoo at[eé]\b/,
    diz: "voando",
    tem: (p) => temEfeitoQueDiz(p, /voo|voar|asas|levit/),
    porque: "voar apaga o terreno inteiro — a muralha, o abismo, a distância",
  },
  {
    id: "atravessando",
    rx: /\b(atravesso|passo através|passo atraves) (a|as|o|os) (parede|paredes|muro|muros|porta|portas|pedra)/,
    diz: "atravessando matéria",
    tem: (p) => temEfeitoQueDiz(p, /etere|incorpore|atravessar|passar por|nevoa|n[eé]voa/),
    porque: "atravessar parede desmancha qualquer tranca, qualquer masmorra e qualquer cerco",
  },
];

function temEfeitoQueDiz(pers, rx) {
  const tudo = [...((pers && pers.efeitos) || []), ...((pers && pers.condicoes) || [])];
  return tudo.some((e) => rx.test(norm(`${e.nome || ""} ${e.descricao || ""}`)));
}

export function estadoReclamado(texto, pers) {
  const t = norm(texto);
  if (!t) return null;
  for (const e of ESTADOS_RECLAMADOS) {
    let bate = false;
    try { bate = e.rx.test(t); } catch { bate = false; }
    if (!bate) continue;
    let tem = false;
    try { tem = !!e.tem(pers); } catch { tem = false; }
    if (tem) return null;                       // está mesmo: nada a recusar
    return { id: e.id, diz: e.diz, porque: e.porque };
  }
  return null;
}

/* ============================================================
   O QUE CUSTA (v9.78) — ter não é poder usar

   A v9.76 fechou "não tenho". Faltava o degrau seguinte, e ele é tão
   comum quanto: TER a habilidade e não ter com que pagá-la. O herói
   sabe a magia, escreve o nome, e o sistema deixa passar porque o nome
   está na ficha — sem olhar os PM nem a recarga.

   O painel de habilidades sempre soube disso: ele desenha a magia
   apagada quando falta mana e mostra o contador da recarga. Só que o
   painel é um caminho, e o TECLADO é outro — e toda regra que mora num
   só de dois caminhos vira bug. Quem clicava no painel obedecia à
   economia; quem digitava o mesmo nome não pagava nada.
   ============================================================ */
export function entradaNaFicha(pers, nome) {
  const alvo = norm(nome);
  for (const l of [(pers && pers.habilidades) || [], (pers && pers.preparadas) || []]) {
    for (const h of l) {
      const n = typeof h === "string" ? h : (h && h.nome);
      if (n && norm(n) === alvo) return typeof h === "string" ? { nome: n, custo: 0 } : h;
    }
  }
  return null;
}

export function faltaRecurso(pers, entrada, { desconto = 0 } = {}) {
  if (!entrada) return null;
  const custo = Math.max(0, (Number(entrada.custo) || 0) - (Number(desconto) || 0));
  const rec = ((pers && pers.habRecarga) || {})[norm(entrada.nome)] || 0;
  if (rec > 0) return { tipo: "recarregando", nome: entrada.nome, turnos: rec };
  const mana = Number((pers && pers.mana)) || 0;
  if (custo > 0 && mana < custo) return { tipo: "semMana", nome: entrada.nome, custo, tenho: mana };
  return null;
}

/* ============================================================
   A BOLSA TAMBÉM É FICHA

   "Bebo a poção de cura" tinha o mesmo buraco da invisibilidade, e com
   uma diferença que o torna pior: aqui o sistema JÁ SABIA fazer a coisa
   certa. `usarConsumivelUI` existe desde sempre — rola o dado da poção,
   aplica, tira o frasco da bolsa e salva. Só que ele só era alcançável
   pelo BOTÃO. Quem escrevia a mesma frase caía na cena, e a IA narrava
   a cura: o herói ficava curado na ficção, com a poção ainda na bolsa e
   os PV intactos na ficha.

   Então aqui há duas respostas, e a boa é a positiva: se o frasco está
   na bolsa, o sistema BEBE de verdade. Se não está, recusa.
   ============================================================ */
export const RX_CONSUMIR = /\b(bebo|beber|tomo|tomar|engulo|engolir|viro|virar|estouro|aplico|aplicar|uso|usar|mastigo|passo)\b/;

export function consumivelDeclarado(texto) {
  const t = norm(texto);
  if (!t || !RX_CONSUMIR.test(t)) return null;
  /* o nome mais longo ganha: "poção de cura grande" não pode perder para
     "poção de cura". E o catálogo resolve o nome vago sozinho — quem
     escreve "bebo uma poção de cura" recebe a Pequena, que é o palpite
     conservador de `comoConsumivel`. */
  let achado = null;
  for (const c of CONSUMIVEIS) {
    const n = norm(c.nome);
    if (t.includes(n) && (!achado || n.length > norm(achado.nome).length)) achado = c;
  }
  if (achado) return achado;
  /* e a forma vaga: "bebo uma poção de cura", "tomo o antídoto" */
  const m = t.match(/\b((?:po[cç][aã]o|frasco|elixir|antidoto|atadura|bandagem|curativo)[^.,;!?]{0,28})/);
  return m ? comoConsumivel(m[1]) : null;
}

/* O NOME COMO ELE ESTÁ NA BOLSA — é esse que `usarConsumivelUI` espera,
   e é por isso que não basta devolver o nome do catálogo: a bolsa pode
   guardar o item por id, e o botão do painel passa o rótulo dela. */
export function naBolsa(pers, cons) {
  if (!cons) return null;
  for (const raw of ((pers && pers.inventario) || [])) {
    const c = comoConsumivel(raw);
    if (c && c.id === cons.id) return typeof raw === "string" ? raw : (raw && raw.nome) || cons.nome;
  }
  return null;
}

export function lerConsumo(texto, pers) {
  const cons = consumivelDeclarado(texto);
  if (!cons) return null;
  const naMao = naBolsa(pers, cons);
  if (naMao) return { tipo: "consumir", cons, item: naMao };
  return { tipo: "semItem", nome: cons.nome, icone: cons.icone || "🧪" };
}

/* ============================================================
   O VEREDICTO
   ============================================================ */
export function lerPoder(texto, pers, { desconto = 0 } = {}) {
  const est = estadoReclamado(texto, pers);
  /* o `tipo` vem DEPOIS do espalhamento: o veredicto de dentro traz um
     `tipo` próprio ("semMana", "semItem") e sobrescrevia o de fora, e as
     recusas voltavam mudas — a fala e o envelope não reconheciam mais o
     caso. Um bug de uma linha que apaga uma peça inteira em silêncio. */
  if (est) return { ...est, tipo: "estadoQueNaoTenho" };
  /* a bolsa antes do catálogo de poderes: "uso a poção de cura" casa os
     dois leitores, e quem manda sobre um frasco é a bolsa */
  const con = lerConsumo(texto, pers);
  if (con && con.tipo === "semItem") return { ...con, tipo: "itemQueNaoTenho" };
  if (con) return null;                         // tem o frasco: quem age é o App
  const pod = poderDeclarado(texto);
  if (!pod) return null;
  if (temOPoder(pers, pod.nome)) {
    /* TEM — e agora a pergunta seguinte: tem com que pagar? */
    const falta = faltaRecurso(pers, entradaNaFicha(pers, pod.nome), { desconto });
    return falta ? { ...falta, tipo: "semRecurso", motivo: falta.tipo } : null;
  }
  return {
    tipo: "poderQueNaoTenho",
    nome: pod.nome, categoria: pod.tipo,
    nivel: pod.nivel || null,
    nivelDoHeroi: (pers && pers.nivel) || 1,
  };
}

/* ---------------- O QUE O JOGADOR LÊ ----------------
   Direto, e com o caminho de como se consegue: recusar sem dizer o que
   abriria a porta é o sistema fechando a cara. */
export function falaDoPoder(v) {
  if (!v) return "";
  if (v.tipo === "poderQueNaoTenho") {
    const comoSeTem = v.categoria === "magia"
      ? `${v.nivel ? `É uma magia de nível ${v.nivel}` : "É uma magia"} — precisa estar aprendida e preparada no seu caderno.`
      : "É uma habilidade da árvore da sua classe — precisa ser aprendida com pontos.";
    return `⛔ Você não tem ${v.nome}. ${comoSeTem}`;
  }
  if (v.tipo === "estadoQueNaoTenho") return `⛔ Você não está ${v.diz}. Isso não é uma coisa que se declare — é efeito, e efeito vem de um poder que está na sua ficha.`;
  if (v.tipo === "itemQueNaoTenho") return `⛔ Você não tem ${v.icone} ${v.nome} na bolsa.`;
  if (v.tipo === "semRecurso") {
    return v.turnos
      ? `⛔ ${v.nome} ainda está recarregando — faltam ${v.turnos} turno${v.turnos === 1 ? "" : "s"}.`
      : `⛔ ${v.nome} custa ${v.custo} PM e você tem ${v.tenho}.`;
  }
  return "";
}

/* ---------------- O QUE O MESTRE RECEBE ----------------
   Ele nunca soube que a coisa não existia: o pedido chegava a ele como
   qualquer outra frase, e narrar o que o jogador pediu é o trabalho
   dele. O envelope é a informação que faltava. */
export function envelopeDoPoder(v, oQueEuDisse = "") {
  if (!v) return "";
  const dito = String(oQueEuDisse).slice(0, 160);
  if (v.tipo === "poderQueNaoTenho") {
    return `[RECUSADO PELO SISTEMA — EU NÃO TENHO ISSO] Eu disse: "${dito}". ${v.nome} EXISTE neste mundo, mas não está na minha ficha: eu nunca aprendi${v.nivel ? `, e é magia de nível ${v.nivel} enquanto eu sou nível ${v.nivelDoHeroi}` : ""}.
REGRA DESTE ENVELOPE (obrigatória): nada disso aconteceu. Narre o que acontece de verdade — eu tentei, ou pensei em tentar, e não sai nada; ou simplesmente descreva a cena seguindo do ponto em que ela estava. NÃO narre o efeito, NÃO diga que funcionou "por um instante", NÃO invente uma versão fraca dele e NÃO me dê o poder como dádiva, revelação ou surpresa.
E não me explique a regra: mostre pela ficção. Eu já sei o que não tenho.`;
  }
  if (v.tipo === "itemQueNaoTenho") {
    return `[RECUSADO PELO SISTEMA — NÃO ESTÁ NA MINHA BOLSA] Eu disse: "${dito}". ${v.nome} existe neste mundo, mas eu não carrego nenhum agora — o sistema conferiu o inventário.
REGRA DESTE ENVELOPE (obrigatória): nada foi bebido, aplicado nem gasto. NÃO me cure, NÃO invente um frasco esquecido no fundo da bolsa e NÃO faça um companheiro "ter um sobrando". Se a cena pedia aquilo, o que ela ganha agora é o peso de não ter.`;
  }
  if (v.tipo === "semRecurso") {
    return v.turnos
      ? `[RECUSADO PELO SISTEMA — AINDA RECARREGANDO] Eu disse: "${dito}". Eu TENHO ${v.nome}, mas ela ainda está recarregando: faltam ${v.turnos} turno${v.turnos === 1 ? "" : "s"}.
REGRA DESTE ENVELOPE (obrigatória): não saiu. Narre o gesto que não completa — a palavra que morre na boca, a mão que se fecha sem nada dentro — e siga. NÃO deixe funcionar "mais fraco" e NÃO adiante a recarga.`
      : `[RECUSADO PELO SISTEMA — SEM RECURSO] Eu disse: "${dito}". Eu TENHO ${v.nome}, mas ela custa ${v.custo} PM e eu estou com ${v.tenho}.
REGRA DESTE ENVELOPE (obrigatória): não saiu, e não sai de graça. Narre o esforço que não fecha — o cansaço, o vazio onde havia poder — e siga. NÃO cobre um preço alternativo em sangue ou em vida, NÃO deixe sair pela metade e NÃO me dê o efeito "só desta vez": quem decide o preço é o sistema, e ele já decidiu.`;
  }
  return `[RECUSADO PELO SISTEMA — EU NÃO ESTOU ASSIM] Eu disse: "${dito}", e isso supõe que eu esteja ${v.diz}. Não estou: o sistema não registra esse efeito em mim agora, e estado não se cria dizendo que se tem.
REGRA DESTE ENVELOPE (obrigatória): narre a cena SEM esse estado. O que eu tentei fazer, eu tentei à vista de todos — com as consequências que isso tem. NÃO me trate como ${v.diz}, NÃO diga que eu "quase" consegui e NÃO deixe passar "só desta vez".`;
}

