/* ============================================================
   ESCONDIDO É UM ESTADO (Fase MM · MM6) — quem me vê, e o que isso vale

   A PERGUNTA DE MESA: *"o anão está me vendo?"*, *"tenho vantagem porque
   ele não me viu chegar?"*. O Matt responde as duas sem pensar, porque
   sabe quem se escondeu, com que número, e de quem.

   O DEFEITO QUE ESTE MÓDULO FECHA: o teste de furtividade existia
   (`desafios.js`, o desafio `furtar_se`) e acabava no próprio turno. No
   turno seguinte nada lembrava que o herói estava escondido: não dava
   vantagem, e o Narrador decidia de imaginação quem o via. Um teste que
   não deixa estado é um dado atirado para o lado.

   ---------------- ONDE O ESTADO MORA, E PORQUÊ ----------------

   NA LISTA DE CONDIÇÕES DO HERÓI, como a condição `escondido` do catálogo
   (`condicoes.js`). Não num módulo à parte nem num campo solto, porque a
   lista já faz de graça quatro coisas que um campo novo teria de refazer:

     1. VIAJA NO SAVE — `pers.condicoes` já vai e volta; nada a ligar;
     2. O NARRADOR JÁ A LÊ — `resumoCondicoesPrompt` põe toda condição
        ativa no rodapé de todo turno;
     3. O "ATÉ" JÁ EXISTE — `gatilhos.js` (v9.45) é o molde da
        invisibilidade: uma instância que declara `quebraCom` cai sozinha
        quando o gatilho acontece, e o App JÁ chama `romperPorGatilho(…,
        "atacar")` depois do golpe e `(…, "conjurar")` depois da magia.
        Escondido cai pelos mesmos dois sítios, sem uma linha nova lá;
     4. O DESCANSO JÁ A LIMPA — `saiCom: ["curto", "longo"]`: quem parou
        para dormir parou de se esconder.

   O que a lista NÃO sabe fazer mora aqui: o NÚMERO (o total do teste, que
   é a CD de quem procura) e o DE QUEM (a lista de quem já o achou). Os
   dois viajam DENTRO da instância, como campos novos dela.

   ---------------- O SAVE: ADITIVO, E IGNORADO PELA VERSÃO ANTIGA --------

   Nenhum campo existente muda. A instância nova tem a forma de toda
   condição (`id`, `nome`, `icone`, `tipo`, `turnos`, `efeito`, `origem`) e
   três campos a mais: `total` (inteiro), `achadoPor` (lista de nomes) e
   `quebraCom` (a lista que `gatilhos.js` já sabia ler). A versão antiga,
   abrindo um save novo, não conhece o id `escondido`: `mecanicaDe` o
   ignora (nenhuma vantagem fantasma), `tickCondicoes` o guarda
   (`turnos: null`) e o descanso longo o limpa (condição desconhecida sai
   no longo) — isto é, some na primeira noite, sem efeito nenhum antes.

   ---------------- AS TRÊS PERGUNTAS, CADA UMA POR TABELA ----------------

   NASCE de um teste de furtividade PASSADO (`ESCONDIDO.alvosQueEscondem`),
   e só onde há onde se esconder: fora da luta, sempre há; dentro, é preciso
   COBERTURA no quadrado do herói ou NENHUM inimigo com linha de visão até
   ele — a regra do 5e ("não se esconde de quem te vê com clareza").

   DURA até o herói AGIR de um jeito que o mostra — atacar e conjurar
   (os gatilhos de `gatilhos.js`), e as frases de `ATOS_QUE_REVELAM` — ou
   até SER ACHADO, e quem acha está em `QUEM_ACHA`.

   VALE vantagem no golpe contra quem NÃO o viu (e só contra esse), e
   desvantagem para quem o ataca sem o ter visto — as duas metades da
   invisibilidade, porque é o mesmo contrato: quem não é visto acerta
   melhor e é mais difícil de acertar. O primeiro golpe o revela.

   O ATAQUE FURTIVO do Ladino não mora aqui: é regra de golpe e vive em
   `combate.js` (`vereditoDoFurtivo`). Este módulo só lhe diz se há
   vantagem — que é a metade do furtivo que o escondido compra.
   ============================================================ */

import { temCobertura, linhaDeVisao, garantirGrade, ehParede, distanciaM, metrosTxt, nomeDoLugar, quadradosDe } from "./grid.js";
import { criarCondicao } from "./condicoes.js";
import { soODeclarado } from "./peneira.js";

/* ---------------- A REGRA, EM UMA TABELA ----------------
   `alvosQueEscondem` são os `alvo` de desafio (desafios.js) cujo sucesso
   deixa o herói escondido. Só a furtividade: seguir alguém (`perseguir`)
   é andar atrás sem ser notado, não sumir.

   `comoBonus` é a AÇÃO ARDILOSA do 5e (Ladino, nível 2): esconder-se custa
   a ação bônus em vez da ação. É a outra metade de MM6 e tem o número da
   medida escrito em `combate.js` (`ATAQUE_FURTIVO`): sem ela o Ladino
   perdia dano por jogar pela regra; com ela, esconder-se é o jogo dele. */
export const ESCONDIDO = {
  id: "escondido",
  alvosQueEscondem: ["furtividade"],
  quebraCom: ["atacar", "conjurar"],
  custoPadrao: "acao",
  comoBonus: { Ladino: 2 },
};

/* A PERCEPÇÃO PASSIVA, que é a CD de quem se esconde: 10 + o modificador.
   Quem tem ficha (herói, companheiro, gente com atributos) usa a sua
   Percepção; o inimigo do bestiário não tem atributos e usa a AMEAÇA,
   na mesma escada de `BONUS_AMEACA` (combate.js) um degrau abaixo — um
   elite vê como um veterano do 5e (13), um lendário como um dragão jovem
   (15). Sem nada, o comum: 11. */
export const PERCEPCAO_PASSIVA = {
  base: 10,
  modPorAmeaca: { fraco: 0, comum: 1, competente: 2, elite: 3, lendario: 5 },
  modPadrao: 1,
};

/* QUEM ACHA — as três portas, e a regra do empate de cada uma.

   O EMPATE SEGUE QUEM É A CD. Na passiva, a CD é a passiva e quem rola é
   o herói: `total >= passiva` o mantém escondido (a mesma convenção de
   `total >= dc` em `concluirRolagem`). Na procura ativa inverte: quem rola
   é o inimigo, a CD é o total do herói, e `procura >= total` o acha.

   A DESCOBERTO: linha de visão (`linhaDeVisao`, parede corta) E o herói
   sem cobertura no próprio quadrado (`temCobertura`) — ninguém se esconde
   de quem o vê com clareza. Cobertura basta para quem tem visão, porque o
   barril na frente do corpo é justamente o que tira a clareza. */
export const QUEM_ACHA = [
  { id: "ja_achou", diz: "já o tinha achado" },
  { id: "passiva", diz: "a atenção dele passa o seu disfarce" },
  { id: "a_descoberto", diz: "tem você à vista, sem nada no meio" },
  { id: "procurou", diz: "procurou e achou" },
];

/* O QUE REVELA SEM SER ATAQUE NEM MAGIA. Lidas sobre o que o herói
   DECLAROU (`soODeclarado` da peneira): "posso gritar?" não grita, e
   "não grito" também não. Atacar e conjurar não estão aqui porque têm
   porta própria (os gatilhos de `gatilhos.js`), e duas portas para o
   mesmo ato seriam duas quedas. */
export const ATOS_QUE_REVELAM = [
  { id: "voz", conta: "você levantou a voz",
    rx: /\b(grito|berro|brado|clamo|assobio|falo alto|em voz alta|chamo (por|pelo|pela|o|a)\b|canto (alto|uma|a|o)\b|anuncio)\b/ },
  { id: "sair", conta: "você saiu do esconderijo",
    rx: /\b(saio (do esconderijo|das sombras|de tras|detras|de onde estou)|me revelo|revelo-me|me mostro|mostro-me|me apresento|apresento-me|apareco)\b/ },
  { id: "aberto", conta: "você correu para o aberto",
    rx: /\b(corro|disparo|atravesso) (para |ate |pelo |pela )?(o |a )?(meio|centro|aberto|claro|salao|praca|patio)\b/ },
  { id: "luz", conta: "você acendeu uma luz",
    rx: /\bacendo (a |uma |o |um )?(tocha|lanterna|vela|fogueira|lampiao|candeeiro)\b/ },
];

/* ---------------- LEITURA ---------------- */

const lista = (x) => (Array.isArray(x) ? x.filter(Boolean) : []);
const nomeDe = (x) => (x && typeof x === "object" ? String(x.nome || "") : String(x || ""));
const vivo = (e) => !!(e && e.nome && !e.derrotado && !(e.vida != null && (Number(e.vida) || 0) <= 0));
const posto = (e) => !!(e && e.x != null && e.y != null);

/* "A", "A e B", "A, B e C" — a mesma costura que a prosa da casa usa */
export function juntarNomes(nomes) {
  const n = lista(nomes).map(String);
  if (n.length <= 1) return n.join("");
  return `${n.slice(0, -1).join(", ")} e ${n[n.length - 1]}`;
}

/* A instância viva, ou null. `null` e ficha sem condições contam como
   "não está escondido" — `= {}` não cobre `null`. */
export function estadoEscondido(pers) {
  const conds = lista(pers && pers.condicoes);
  return conds.find((c) => c && c.id === ESCONDIDO.id) || null;
}

export function percepcaoPassiva(quem) {
  const P = PERCEPCAO_PASSIVA;
  if (!quem || typeof quem !== "object") return P.base + P.modPadrao;
  const declarada = Number(quem.percepcaoPassiva);
  if (quem.percepcaoPassiva != null && Number.isFinite(declarada)) return declarada;
  const attr = quem.atributos && quem.atributos.percepcao;
  if (attr != null && Number.isFinite(Number(attr))) return P.base + Number(attr);
  const porAmeaca = P.modPorAmeaca[quem.ameaca];
  return P.base + (porAmeaca != null ? porAmeaca : P.modPadrao);
}

/* ONDE SE ESCONDER. Fora da luta (sem grade), sempre há. Dentro, a
   cobertura no quadrado do herói ou nenhum inimigo vivo com linha de
   visão até ele. Devolve o porquê — é ele que a tela diz quando não dá. */
export function ondeSeEsconder(opcoes) {
  const { grade = null, heroi = null, inimigos = [] } = opcoes || {};
  if (!grade || !posto(heroi)) return { pode: true, porque: "fora_da_luta" };
  if (temCobertura(grade, heroi.x, heroi.y)) return { pode: true, porque: "cobertura" };
  const olham = lista(inimigos).filter((e) => vivo(e) && posto(e) && linhaDeVisao(grade, e, heroi));
  if (!olham.length) return { pode: true, porque: "fora_de_vista" };
  return { pode: false, porque: "a_descoberto", quem: olham.map(nomeDe) };
}

/* Um observador me vê? Devolve o id de `QUEM_ACHA` ou null. */
function porqueMeVe(estado, obs, { grade, heroi }) {
  const nome = nomeDe(obs);
  if (lista(estado.achadoPor).includes(nome)) return "ja_achou";
  if (percepcaoPassiva(obs) > (Number(estado.total) || 0)) return "passiva";
  if (grade && posto(heroi) && posto(obs) && linhaDeVisao(grade, obs, heroi) && !temCobertura(grade, heroi.x, heroi.y)) return "a_descoberto";
  return null;
}

/* ---------------- NASCER ----------------
   `total` é o total do teste de furtividade (d20 + mod). `observadores`
   são os inimigos da luta ou, fora dela, as pessoas presentes (lista
   opcional: sem ninguém nomeado, o estado nasce sem testemunha).
   Devolve a ficha NOVA — nunca muta a recebida. */
export function nascerEscondido(pers, opcoes) {
  const { total, grade = null, heroi = null, inimigos = null, presentes = null } = opcoes || {};
  const base = pers && typeof pers === "object" ? pers : {};
  const t = Math.round(Number(total));
  if (!Number.isFinite(t)) return { ok: false, pers: base, motivo: "sem_total", linhas: [] };
  const naLuta = !!(grade && posto(heroi));
  const obs = lista(naLuta ? inimigos : presentes).filter(vivo);
  const onde = ondeSeEsconder({ grade, heroi, inimigos: obs });
  if (!onde.pode) {
    return { ok: false, pers: base, motivo: onde.porque, linhas: [`👁 Não há onde sumir: ${juntarNomes(onde.quem)} ${onde.quem.length > 1 ? "têm" : "tem"} você à vista, sem nada no meio.`] };
  }
  const molde = { total: t, achadoPor: [] };
  const achadoPor = obs.filter((o) => porqueMeVe(molde, o, { grade, heroi })).map(nomeDe);
  if (obs.length && achadoPor.length === obs.length) {
    return { ok: false, pers: base, motivo: "todos_veem", linhas: [`👁 Você tenta sumir, mas ${juntarNomes(achadoPor)} não ${achadoPor.length > 1 ? "tiram" : "tira"} os olhos de você.`] };
  }
  const inst = {
    ...criarCondicao(ESCONDIDO.id, { origem: "furtividade" }),
    total: t,
    achadoPor,
    quebraCom: [...ESCONDIDO.quebraCom],
  };
  const conds = lista(base.condicoes).filter((c) => c.id !== ESCONDIDO.id);
  const novo = { ...base, condicoes: [...conds, inst] };
  const quemVe = achadoPor.length ? ` — mas ${juntarNomes(achadoPor)} ${achadoPor.length > 1 ? "viram" : "viu"} para onde você foi` : "";
  /* o prefixo é o 🌠 ("a favor") da tabela de glifos, e não o 👤 do
     catálogo: toda linha que abre com emoji precisa de decisão em
     `ASSUNTO_DO_EMOJI` (glifos.js), que é do desenho — um glifo próprio
     para "escondido" é pedido para lá, não decisão daqui */
  return { ok: true, pers: novo, estado: inst, motivo: onde.porque, linhas: [`🌠 Você está escondido (furtividade ${t})${quemVe}.`] };
}

/* ---------------- QUEM ME VÊ ----------------
   A resposta a "o anão está me vendo?". Pura: não muda o estado — quem
   muda é `revisarEscondido`. Devolve null quando o herói não está
   escondido, e é esse null que mantém a linha da luta idêntica à de
   antes. */
export function quemMeVe(pers, opcoes) {
  const { grade = null, heroi = null, inimigos = null, presentes = null } = opcoes || {};
  const est = estadoEscondido(pers);
  if (!est) return null;
  const naLuta = !!(grade && posto(heroi));
  const obs = lista(naLuta ? inimigos : presentes).filter(vivo);
  const veem = [], naoVeem = [];
  for (const o of obs) {
    const p = porqueMeVe(est, o, { grade, heroi });
    if (p) veem.push({ nome: nomeDe(o), porque: p });
    else naoVeem.push(nomeDe(o));
  }
  return { total: est.total, veem, naoVeem };
}

/* Estou oculto de `quem`? — as duas metades do contrato leem daqui: a
   vantagem do meu golpe contra ele, e a desvantagem do golpe dele contra
   mim (`combate.js`). Com a geometria, confere também se ele me tem à
   vista agora; sem ela, fica com o que o estado sabe. */
export function oculto(pers, quem, opcoes) {
  const { grade = null, heroi = null } = opcoes || {};
  const est = estadoEscondido(pers);
  if (!est || !quem) return false;
  return !porqueMeVe(est, quem, { grade, heroi });
}

/* ---------------- SER ACHADO ----------------
   Roda na vez do mundo, depois de os inimigos andarem e antes de baterem.
   Quem passa a ver entra em `achadoPor`; se TODO observador vivo me vê, o
   estado cai. `procuram` são os nomes que gastam a vez procurando: rolam
   d20 + (passiva − 10) contra o meu total, e a sorte entra por argumento. */
export function revisarEscondido(pers, opcoes) {
  const { grade = null, heroi = null, inimigos = null, presentes = null, procuram = [], sorte = Math.random } = opcoes || {};
  const base = pers && typeof pers === "object" ? pers : {};
  const est = estadoEscondido(base);
  if (!est) return { pers: base, achadoAgora: [], caiu: false, linhas: [], nota: "" };
  const naLuta = !!(grade && posto(heroi));
  const obs = lista(naLuta ? inimigos : presentes).filter(vivo);
  const rolar = typeof sorte === "function" ? sorte : Math.random;
  const buscam = new Set(lista(procuram).map(nomeDe));
  const achadoPor = [...lista(est.achadoPor)];
  const agora = [];
  for (const o of obs) {
    const nome = nomeDe(o);
    if (achadoPor.includes(nome)) continue;
    let p = porqueMeVe(est, o, { grade, heroi });
    if (!p && buscam.has(nome)) {
      const d20 = 1 + Math.floor(rolar() * 20);
      if (d20 + percepcaoPassiva(o) - PERCEPCAO_PASSIVA.base >= (Number(est.total) || 0)) p = "procurou";
    }
    if (p) { achadoPor.push(nome); agora.push({ nome, porque: p }); }
  }
  if (!agora.length) return { pers: base, achadoAgora: [], caiu: false, linhas: [], nota: "" };
  const vivosNomes = obs.map(nomeDe);
  const caiu = vivosNomes.length > 0 && vivosNomes.every((n) => achadoPor.includes(n));
  const conds = lista(base.condicoes);
  const novo = caiu
    ? { ...base, condicoes: conds.filter((c) => c.id !== ESCONDIDO.id) }
    : { ...base, condicoes: conds.map((c) => (c.id === ESCONDIDO.id ? { ...c, achadoPor } : c)) };
  const nomes = agora.map((a) => a.nome);
  const porque = agora.map((a) => `${a.nome} ${(QUEM_ACHA.find((q) => q.id === a.porque) || {}).diz || "o achou"}`).join("; ");
  const verbo = nomes.length > 1 ? "acham" : "acha";
  return {
    pers: novo, achadoAgora: nomes, caiu,
    linhas: [`👁 ${juntarNomes(nomes)} ${verbo} você${caiu ? " — você não está mais escondido" : ""}.`],
    nota: `[ACHADO — DECIDIDO PELO SISTEMA] ${porque}. ${caiu ? "Não estou mais escondido: todos me veem, e o mundo me alcança normalmente a partir daqui." : `${juntarNomes(nomes)} ${nomes.length > 1 ? "sabem" : "sabe"} onde estou; os outros continuam sem me ver.`} Narre o instante em que me acham; não devolva o esconderijo por conta própria.`,
  };
}

/* ---------------- REVELAR-SE POR ATO ----------------
   A frase que o herói declara, lida pela peneira. Devolve a ficha sem o
   estado quando o ato o mostra, e a linha e a nota no molde de
   `romperPorGatilho` — o jogador lê, o Narrador sabe. */
export function revelarPorAto(pers, texto) {
  const base = pers && typeof pers === "object" ? pers : {};
  const nada = { pers: base, revelado: false, ato: null, linhas: [], nota: "" };
  if (!estadoEscondido(base)) return nada;
  let declarado = "";
  try { declarado = soODeclarado(texto); } catch { return nada; }
  const ato = ATOS_QUE_REVELAM.find((a) => a.rx.test(declarado));
  if (!ato) return nada;
  return {
    pers: { ...base, condicoes: lista(base.condicoes).filter((c) => c.id !== ESCONDIDO.id) },
    revelado: true, ato: ato.id,
    linhas: [`✧ Escondido cai — ${ato.conta}.`],
    nota: `[EFEITO ENCERRADO PELO SISTEMA] Escondido acabou agora, porque ${ato.conta}. A partir deste instante quem está em volta me vê — não narre ninguém sem me notar, e não devolva o esconderijo por conta própria.`,
  };
}

/* O que custa esconder-se DENTRO da luta: a ação, ou a ação bônus de quem
   tem a Ação Ardilosa (`ESCONDIDO.comoBonus`). Fora da luta, nada. */
export function custoDeEsconder(pers) {
  const p = pers && typeof pers === "object" ? pers : {};
  const nivelMin = ESCONDIDO.comoBonus[p.classe];
  if (nivelMin != null && (Number(p.nivel) || 1) >= nivelMin) return "bonus";
  return ESCONDIDO.custoPadrao;
}

/* ---------------- ESCONDER-SE NA LUTA: O VEREDITO ANTES DO DADO (MM16 nº 6) ----------------
   A terceira sessão de prova (`mente/mm11-sessao-3.md`, J18/M18) jogou
   isto: "escondo-me na sombra, colado à parede do fundo", numa luta, com o
   herói NO FUNDO DA SALA da masmorra — região sem cobertura — e o Lobo a
   12 m no vão da porta, com linha de visão. O sistema rolou (18 + 7 = 25
   contra 18, sucesso) e SÓ DEPOIS perguntou a `ondeSeEsconder`, que
   respondeu `a_descoberto`: "👁 Não há onde sumir: Lobo tem você à vista".
   O estado não nasceu — e estava certo: o 5e não deixa ninguém se esconder
   de quem o vê com clareza. O defeito era o resto:

     1. o dado rolou para nada (o veredito veio DEPOIS do clique);
     2. a recusa ficou na tela e não foi ao Mestre: o envelope dizia
        "eu PASSEI. Revele UMA coisa", e ele narrou o herói sumido — a
        prosa e o sistema discordaram, que foi o que a sessão viu;
     3. a ação não se gastava, nem na falha (5e: esconder-se É a ação).

   Este veredito corre ANTES do dado, no molde de `vereditoDaPalavra`
   (MM9): sem onde sumir, ou sem a ação, não rola nada — a linha diz por
   quê e, quando há, onde fica o abrigo mais perto. Com onde sumir, a ação
   (ou a bônus, com Ação Ardilosa) sai da bolsa antes do dado, passe ou
   falhe: tentar esconder-se custa o mesmo que conseguir.

   Fora da luta não há tabuleiro nem ação a pagar: `pode` e custo nulo, e
   o caminho de sempre segue intacto. */

/* O abrigo mais perto: o quadrado livre com cobertura (a mesma pergunta de
   `ondeSeEsconder`) de menor distância, desempate pelo primeiro na ordem da
   grade — determinístico. É a frase que o Matt diria: "aí não, mas há o
   vão da porta a 9 m". Null quando o lugar não tem cobertura nenhuma. */
function abrigoMaisPerto(grade, heroi, ocupantes) {
  const g = garantirGrade(grade);
  if (!g || !posto(heroi)) return null;
  const ocupado = new Set();
  for (const o of lista(ocupantes)) if (posto(o) && o !== heroi) for (const q of quadradosDe(o)) ocupado.add(`${q.x},${q.y}`);
  let melhor = null;
  for (let y = 0; y < g.altura; y++) for (let x = 0; x < g.largura; x++) {
    if (ehParede(grade, x, y) || ocupado.has(`${x},${y}`) || !temCobertura(grade, x, y)) continue;
    const d = distanciaM(heroi, { x, y });
    if (d <= 0) continue;
    if (!melhor || d < melhor.m) melhor = { x, y, m: d, onde: nomeDoLugar(grade, x, y) };
  }
  return melhor;
}

export function vereditoDoEsconder(pers, opcoes) {
  const { grade = null, heroi = null, inimigos = null, aliados = null, economia = null } = opcoes || {};
  if (!grade || !posto(heroi)) return { pode: true, custo: null, motivo: "fora_da_luta", linha: "" };
  const obs = lista(inimigos).filter(vivo);
  const onde = ondeSeEsconder({ grade, heroi, inimigos: obs });
  if (!onde.pode) {
    const quem = onde.quem || [];
    const abrigo = abrigoMaisPerto(grade, heroi, [...obs, ...lista(aliados)]);
    /* na mesma região, o nome do lugar não ajuda ("fica no fundo da sala"
       para quem já está no fundo da sala): diz-se a distância e o "aqui" */
    const aqui = abrigo && abrigo.onde && abrigo.onde === nomeDoLugar(grade, heroi.x, heroi.y);
    const dica = !abrigo ? ""
      : aqui ? ` Há abrigo a ${metrosTxt(abrigo.m)} m, aqui mesmo ${abrigo.onde}.`
      : ` O abrigo mais perto fica ${abrigo.onde}, a ${metrosTxt(abrigo.m)} m.`;
    return {
      pode: false, custo: null, motivo: onde.porque, quem,
      linha: `👁 Não há onde sumir: ${juntarNomes(quem)} ${quem.length > 1 ? "têm" : "tem"} você à vista, sem nada no meio.${dica}`,
    };
  }
  const custo = custoDeEsconder(pers);
  const eco = economia && typeof economia === "object" ? economia : {};
  const resta = custo === "bonus" ? Number(eco.extra) || 0 : Number(eco.acao) || 0;
  if (resta <= 0) {
    return {
      pode: false, custo, motivo: "sem_acao",
      linha: `Você já usou sua ${custo === "bonus" ? "ação bônus" : "ação"} nesta rodada — esconder-se fica para a próxima.`,
    };
  }
  const economiaDepois = custo === "bonus" ? { ...eco, extra: resta - 1 } : { ...eco, acao: resta - 1 };
  return { pode: true, custo, motivo: onde.porque, linha: "", economiaDepois };
}

/* ---------------- O QUE O MESTRE SABE DO ESCONDER (MM16 nº 6) ----------------
   O envelope do teste comum manda "revele UMA coisa concreta e útil" — num
   esconder-se, isso é uma ordem para inventar, e não diz o que importa: se
   sumi, e de quem. Esta nota diz o estado com as palavras da casa, para a
   prosa e o sistema contarem a mesma coisa no MESMO turno (a linha da luta,
   `quemMeVe`, só chega no turno seguinte). `ns` é o retorno de
   `nascerEscondido`; null quando o teste falhou. */
export function notaDoEscondido(opcoes) {
  const { passou = false, ns = null, total = null, dc = null, inimigos = null } = opcoes || {};
  const conta = total != null && dc != null ? ` (${total} contra ${dc})` : "";
  const obs = lista(inimigos).filter(vivo).map(nomeDe);
  if (!passou) {
    const veem = obs.length ? `${juntarNomes(obs)} ${obs.length > 1 ? "continuam" : "continua"} a ver-me e ${obs.length > 1 ? "sabem" : "sabe"} onde estou` : "quem está por perto continua a ver-me";
    return `[ESCONDER — FALHOU] Tentei esconder-me e não consegui${conta}: ${veem}. Não narre que sumi.`;
  }
  if (!ns || !ns.ok) {
    return `[ESCONDER — RECUSADO PELO SISTEMA] Passei no teste${conta}, mas não sumi: ${(ns && ns.motivo) === "todos_veem" ? "ninguém tirou os olhos de mim" : "não há nada entre mim e quem me olha"}. Continuo à vista — não narre que me escondi.`;
  }
  const achou = lista(ns.estado && ns.estado.achadoPor);
  const naoVeem = obs.filter((n) => !achou.includes(n));
  const de = naoVeem.length
    ? `Estou escondido de ${juntarNomes(naoVeem)}: ${naoVeem.length > 1 ? "não me veem nem sabem" : "não me vê nem sabe"} onde estou.`
    : "Estou escondido: ninguém aqui me vê.";
  const viu = achou.length ? ` ${juntarNomes(achou)} ${achou.length > 1 ? "viram" : "viu"} para onde fui.` : "";
  return `[ESCONDIDO — DECIDIDO PELO SISTEMA] Escondi-me${conta}. ${de}${viu} Narre em até três frases o instante em que eu somo, com o que o lugar já tem e sem esconderijo novo, e devolva a palavra. Daqui em diante ninguém me nota por conta própria: só o sistema diz quem me acha.`;
}

/* ---------------- A LINHA FORA DA LUTA ----------------
   Vai à `naoPode` da pauta — veto é o que o Narrador não pode fazer, e o
   que ele faria sem esta linha é justamente pôr o guarda a reagir a quem
   ele não viu. Dentro da luta a linha é outra (a da luta, `grid.js`), e
   por isso aqui só se escreve quando NÃO há tabuleiro. */
export function pautaDoEscondido(pers, opcoes) {
  const { presentes = null } = opcoes || {};
  const q = quemMeVe(pers, { presentes });
  if (!q) return null;
  const veem = q.veem.map((v) => v.nome);
  if (!q.naoVeem.length && !veem.length) {
    return { naoPode: `alguém aqui me notar por conta própria: estou escondido, e só o sistema diz quem me acha.` };
  }
  if (!q.naoVeem.length) return null;
  const n = q.naoVeem.length > 1;
  const resto = veem.length ? ` (${juntarNomes(veem)} ${veem.length > 1 ? "me veem" : "me vê"})` : "";
  return { naoPode: `${juntarNomes(q.naoVeem)} ${n ? "reagirem" : "reagir"} a mim: estou escondido e ${n ? "não me viram" : "não me viu"}${resto}.` };
}
