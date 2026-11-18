/* cena-do-momento.js (M4 · 18/11/2026) — «a cena que o Mestre lê».

   O desenho é mente/lancamento/o-mestre-vivo.md §4: cada pessoa, criatura e
   coisa em cena carrega estados simples, de uma tabela FECHADA; a cena
   inteira também. O Mestre só LÊ a cena — quem escreve é o mundo ou a quest,
   nunca o Narrador e nunca o dado direto. O jogador vê o estado pelo efeito
   (a pessoa desvia os olhos), nunca pelo nome: o nome é bastidor.

   Este módulo é puro e não decide se rola. Ele responde às perguntas que a
   régua do momento (motor/a-regua-do-momento.js) faz à cena:
     - há oposição a ESTA ação sobre ESTE alvo?  (`haOposicao`)
     - há o que achar?                           (`haOQueAchar`)
     - há perigo para o corpo?                   (`haPerigo`)
     - alguém pode notar?                        (`alguemPodeNotar`)
     - falhar custa o quê?                       (`custoDeFalhar`)
     - a pergunta tem resposta franca?           (`respostaDaPergunta`)

   A forma da cena:
     { pessoas:   [{ nome, papel, estados: ["desconfiada", …] }],
       criaturas: [{ nome, estados: ["acuada", …] }],
       coisas:    [{ nome, estados: ["trancado", …] }],   // a porta, o baú, o lugar
       cena:      { estados: ["com_pressa", …] } }
   `null` (ou o que não é objeto) é «não há cena»: quem pergunta recebe
   `null` de `lerCena`, e a régua devolve o Mestre de sempre.

   Nada aqui sorteia, e nada muta: `lerCena` devolve uma cópia congelada. */

/* ---------------- OS ESTADOS ----------------
   A tabela fechada. Cada estado diz DE QUEM é e o que significa para a
   régua — uma marca só por pergunta:
     opoe      alguém ou algo resiste a esta ação (motivo para negar, tranca)
     cede      cede sem dado (quem já está com medo)
     facilita  está do lado do herói (disposta, deve um favor, mansa)
     esconde   há o que achar; a pergunta sai evasiva
     pune      falhar machuca o corpo
     espalha   a falha se espalha (fama, alarme)
     nota      alguém pode notar quem se esgueira
     apressa   a demora custa (a falha gasta tempo que o mundo cobra)
     revela    a cena já entrega o que se procuraria (o grito do outro lado)
     chama     o estado, ao aparecer, provoca um teste sozinho (o dado
               espontâneo, `oQueACenaChama` na régua): a perícia que chama
   M5 (18/11/2026), «o treino» — quatro marcas que o exame pediu:
     inerte    não nota, não responde, não resiste (o morto, o desacordado)
     cobre     o céu não ajuda: sem sol nem estrela para se orientar
     proprio   é do próprio herói: ele conhece, não há o que descobrir
     escasso   é raro de achar: procurar custa, e a falha custa tempo
     comum     é coisa de toda feira: saber dela não pede dado
   `efeito`: como o jogador sente o estado na narração — em PT-BR, sem o
   nome do mecanismo (lei «o sistema não fala de si mesmo»). */
const E = (id, de, marcas, efeito, chama) => Object.freeze({
  id, de,
  opoe: !!marcas.opoe, cede: !!marcas.cede, facilita: !!marcas.facilita, esconde: !!marcas.esconde,
  pune: !!marcas.pune, espalha: !!marcas.espalha, nota: !!marcas.nota, apressa: !!marcas.apressa,
  revela: !!marcas.revela, inerte: !!marcas.inerte, cobre: !!marcas.cobre, proprio: !!marcas.proprio,
  escasso: !!marcas.escasso, comum: !!marcas.comum, chama: chama || "", efeito,
});

export const ESTADOS_DA_CENA = Object.freeze([
  /* pessoa */
  E("disposta", "pessoa", { facilita: true }, "responde de boa vontade, olha você nos olhos"),
  E("desconfiada", "pessoa", { opoe: true, nota: true }, "mede você de cima a baixo antes de responder"),
  E("com_medo", "pessoa", { cede: true }, "a voz treme, os olhos procuram a saída"),
  E("hostil", "pessoa", { opoe: true, nota: true, espalha: true }, "fecha a cara, a mão perto da arma"),
  E("esconde_algo", "pessoa", { esconde: true }, "desvia os olhos e muda de assunto rápido demais"),
  E("deve_favor", "pessoa", { facilita: true }, "lembra do que você fez por ela"),
  E("motivo_para_negar", "pessoa", { opoe: true }, "tem o que perder se disser sim"),
  E("do_grupo", "pessoa", { facilita: true }, "é dos seus, viaja com você"),
  /* M5: quem não pode notar nem responder */
  E("morta", "pessoa", { inerte: true }, "não se mexe, e não vai mais se mexer"),
  E("desacordada", "pessoa", { inerte: true }, "respira, mas não está aqui"),
  /* criatura */
  E("faminta", "criatura", { opoe: true, pune: true }, "fareja o ar e baba"),
  E("acuada", "criatura", { opoe: true, pune: true }, "encolhida contra a parede, mostra os dentes"),
  E("territorial", "criatura", { opoe: true, pune: true, nota: true }, "rosna para quem se aproxima do seu canto"),
  E("ferida", "criatura", { pune: true }, "manca e respira pesado"),
  E("mansa", "criatura", { facilita: true }, "chega perto sem medo"),
  E("assustada", "criatura", { opoe: true }, "empina, bufa, os olhos brancos de susto"),
  /* coisa ou lugar */
  E("trancado", "coisa", { opoe: true }, "não cede quando se puxa"),
  E("vigiado", "coisa", { nota: true, espalha: true }, "há passos de ronda e uma luz que vai e vem", "furtividade"),
  E("fragil", "coisa", { pune: true }, "range e se curva sob o peso"),
  E("escuro", "coisa", {}, "a luz não chega aos cantos"),
  E("armadilhado", "coisa", { esconde: true, pune: true }, "uma fresta fina demais, um fio que brilha"),
  E("ha_algo_escondido", "coisa", { esconde: true }, "algo ali não está como deveria"),
  E("suspeito", "coisa", { esconde: true }, "algo nele não parece certo"),
  /* M5: a coisa do herói, a coisa rara, a coisa comum, o chão que trai */
  E("do_heroi", "coisa", { proprio: true }, "é seu, você conhece cada canto"),
  E("raro_de_achar", "coisa", { escasso: true }, "não é coisa que se ache em qualquer canto"),
  E("coisa_comum", "coisa", { comum: true }, "coisa de toda feira, qualquer um conhece"),
  E("escorregadio", "coisa", { pune: true }, "liso e molhado, não dá onde firmar"),
  /* a cena */
  E("com_pressa", "cena", { apressa: true }, "o tempo aperta"),
  E("com_testemunhas", "cena", { nota: true, espalha: true }, "há olhos em toda parte"),
  E("territorio_de_alguem", "cena", { nota: true, espalha: true }, "este lugar tem dono, e o dono repara", "furtividade"),
  E("perigo_fisico", "cena", { pune: true }, "um passo errado custa caro", "percepcao"),
  E("som_claro", "cena", { revela: true }, "dá para ouvir tudo daqui"),
  E("algo_se_aproxima", "cena", { pune: true }, "um galho estala perto demais", "percepcao"),
  E("assunto_raro", "cena", {}, "uma coisa que nem todo mundo reconheceria", "saberes"),
  /* M5: o céu fechado */
  E("ceu_encoberto", "cena", { cobre: true }, "nem sol nem estrela atravessam as nuvens"),
]);

/* o lugar de cada um na cena, e a chave da lista */
export const LUGARES_DA_CENA = Object.freeze({ pessoa: "pessoas", criatura: "criaturas", coisa: "coisas" });

const POR_ID = new Map(ESTADOS_DA_CENA.map((e) => [e.id, e]));
export function estadoPorId(id) { return POR_ID.get(id) || null; }

const obj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const nrm = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/* só os estados da tabela, do dono certo, sem repetir */
function estadosDe(lista, de) {
  if (!Array.isArray(lista)) return Object.freeze([]);
  const vistos = [];
  for (const id of lista) {
    const e = estadoPorId(id);
    if (e && e.de === de && !vistos.includes(id)) vistos.push(id);
  }
  return Object.freeze(vistos);
}

function seres(lista, de) {
  if (!Array.isArray(lista)) return Object.freeze([]);
  return Object.freeze(lista.filter(obj).map((x) => Object.freeze({
    nome: typeof x.nome === "string" ? x.nome : "",
    papel: typeof x.papel === "string" ? x.papel : "",
    estados: estadosDe(x.estados, de),
  })));
}

/* A cena lida: a cópia congelada, só com o que a tabela conhece. `null`
   (ou o que não for objeto) devolve `null` — não há cena. */
export function lerCena(cru) {
  if (!obj(cru)) return null;
  const c = obj(cru.cena) ? cru.cena : {};
  return Object.freeze({
    pessoas: seres(cru.pessoas, "pessoa"),
    criaturas: seres(cru.criaturas, "criatura"),
    coisas: seres(cru.coisas, "coisa"),
    cena: Object.freeze({ estados: estadosDe(c.estados, "cena") }),
  });
}

/* aceita a cena crua ou já lida */
const lida = (c) => (c && Object.isFrozen(c) && Array.isArray(c.pessoas) ? c : lerCena(c));
const tem = (ser, marca) => !!ser && ser.estados.some((id) => (estadoPorId(id) || {})[marca]);
const todos = (c) => [...c.pessoas, ...c.criaturas, ...c.coisas];
const daCena = (c, marca) => c.cena.estados.some((id) => (estadoPorId(id) || {})[marca]);
const deFora = (p) => !p.estados.includes("do_grupo");
/* M5: o morto e o desacordado estão em cena, mas não notam nem respondem */
const vivo = (p) => !tem(p, "inerte");

/* ---------------- O ALVO ----------------
   Sobre quem (ou o quê) a ação cai: `sobre` é "pessoa", "criatura" ou
   "coisa"; `quem` é o nome ou o papel que a frase disse. Sem nome que bata,
   o primeiro de fora do grupo (é a quem um herói fala numa cena com um só
   estranho); sem ninguém de fora, o primeiro. */
export function alvoDaAcao(cena, { sobre = "pessoa", quem = "" } = {}) {
  const c = lida(cena);
  if (!c) return null;
  const lista = c[LUGARES_DA_CENA[sobre] || "pessoas"] || [];
  if (!lista.length) return null;
  const q = nrm(quem);
  if (q) {
    const achado = lista.find((x) => (x.nome && (nrm(x.nome) === q || q.includes(nrm(x.nome)))) || (x.papel && (nrm(x.papel) === q || q.includes(nrm(x.papel)) || nrm(x.papel).includes(q))));
    if (achado) return achado;
  }
  return lista.find(deFora) || lista[0];
}

/* Há oposição a ESTA ação sobre ESTE alvo? `opoe`: o alvo resiste;
   `cede`: cede sem dado; `facilita`: está do seu lado (e nada nele resiste). */
export function haOposicao(cena, alvo = {}) {
  const c = lida(cena);
  const vazio = Object.freeze({ opoe: false, cede: false, facilita: false, quem: "", estados: Object.freeze([]) });
  if (!c) return vazio;
  const a = alvoDaAcao(c, obj(alvo) ? alvo : {});
  if (!a) return vazio;
  const opoe = tem(a, "opoe") && vivo(a);
  return Object.freeze({ opoe, cede: tem(a, "cede"), facilita: !opoe && tem(a, "facilita"), inerte: !vivo(a), quem: a.nome || a.papel, estados: a.estados });
}

/* Há o que achar? Uma coisa que esconde (o compartimento, a armadilha). */
export function haOQueAchar(cena) {
  const c = lida(cena);
  return !!c && c.coisas.some((x) => tem(x, "esconde"));
}

/* Há quem guarde um segredo? (a pessoa que esconde, ou a coisa) */
export function haSegredo(cena) {
  const c = lida(cena);
  return !!c && (c.pessoas.some((x) => tem(x, "esconde")) || haOQueAchar(c));
}

/* Há perigo para o corpo? Na cena, numa coisa ou numa criatura. */
export function haPerigo(cena) {
  const c = lida(cena);
  return !!c && (daCena(c, "pune") || c.coisas.some((x) => tem(x, "pune")) || c.criaturas.some((x) => tem(x, "pune")));
}

/* Alguém pode notar? Um estado que vigia (a ronda, as testemunhas, o dono
   do lugar), ou qualquer pessoa ou criatura de fora do grupo presente. */
export function alguemPodeNotar(cena) {
  const c = lida(cena);
  if (!c) return false;
  return daCena(c, "nota") || todos(c).filter(vivo).some((x) => tem(x, "nota"))
    || c.pessoas.some((p) => deFora(p) && vivo(p)) || c.criaturas.some((x) => vivo(x) && !tem(x, "facilita"));
}

/* Há quem assista de fora? (a plateia de uma encenação) */
export function haPlateia(cena) {
  const c = lida(cena);
  return !!c && (c.cena.estados.includes("com_testemunhas") || c.pessoas.some((p) => deFora(p) && vivo(p)));
}

/* A cena já entrega o que se procuraria? (o som claro do outro lado) */
export function cenaRevela(cena) {
  const c = lida(cena);
  return !!c && daCena(c, "revela");
}

/* Falhar custa o quê? `pune` (o corpo), `espalha` (fama, alarme),
   `apressa` (o tempo). `quais`: os ids, na ordem da tabela. */
export function custoDeFalhar(cena) {
  const c = lida(cena);
  if (!c) return Object.freeze({ pune: false, espalha: false, apressa: false, quais: Object.freeze([]) });
  const ids = [...c.cena.estados, ...todos(c).flatMap((x) => x.estados)];
  const marca = (m) => ids.some((id) => (estadoPorId(id) || {})[m]);
  const quais = ["pune", "espalha", "apressa"].filter(marca);
  return Object.freeze({ pune: marca("pune"), espalha: marca("espalha"), apressa: marca("apressa"), quais: Object.freeze(quais) });
}

/* ---------------- A PERGUNTA ----------------
   Pergunta não rola (estudo das mesas §6, 65 em 65). Quem responde, e como:
   quem esconde algo desconversa ou mente («evasiva»), quem é hostil não
   responde («recusa»), o resto responde («franca»). É sinal para o
   Narrador, nunca dado. */
export const RESPOSTAS_DA_PERGUNTA = Object.freeze([
  /* M5: o morto e o desacordado não respondem */
  Object.freeze({ id: "silencio", se: "inerte", diz: "não responde: não pode" }),
  Object.freeze({ id: "recusa", se: "opoe", so: "hostil", diz: "não responde, ou responde com uma ameaça" }),
  Object.freeze({ id: "evasiva", se: "esconde", diz: "desconversa ou mente: a verdade fica guardada" }),
  Object.freeze({ id: "franca", se: "", diz: "responde o que sabe" }),
]);

export function respostaDaPergunta(cena, quem = "") {
  const c = lida(cena);
  if (!c) return null;
  const a = alvoDaAcao(c, { sobre: "pessoa", quem });
  if (!a) return null;
  for (const r of RESPOSTAS_DA_PERGUNTA) {
    if (!r.se) return r;
    if (r.so ? a.estados.includes(r.so) : tem(a, r.se)) return r;
  }
  return null;
}

/* M5: a cena (ou alguém, ou algo nela) carrega esta marca? É a pergunta
   genérica das marcas novas (cobre, proprio, escasso, comum, inerte): a
   régua pergunta por elas sem uma função para cada. */
export function temMarca(cena, marca) {
  const c = lida(cena);
  if (!c || typeof marca !== "string") return false;
  return daCena(c, marca) || todos(c).some((x) => tem(x, marca));
}

/* Os estados que, ao aparecerem, chamam um teste — na ordem da tabela. */
export function estadosQueChamam(cena) {
  const c = lida(cena);
  if (!c) return Object.freeze([]);
  const ids = [...c.cena.estados, ...todos(c).flatMap((x) => x.estados)];
  return Object.freeze(ESTADOS_DA_CENA.filter((e) => e.chama && ids.includes(e.id)).map((e) => e.id));
}
