/* ============================================================
   AS FICHAS (Fase F2 · F2b, F2c e F2d, 12/10) — o que o Mestre mostrou,
   o jogador aponta

   "Pode construir as duas." — a pessoa, ao desenho das fichas tocáveis e
   da memória com rosto (12/10).

   A F2a (em-cena.js) deu ao sistema a lista do que está à volta do herói,
   cada coisa com um id. Faltava a mão do jogador chegar a ela: hoje, para
   apontar o rato, ele escreve trinta caracteres e espera que a leitura o
   ache (0 de 1 na 9.ª sessão); para saber o preço das ataduras, pergunta
   ao Mestre e gasta um turno. Este módulo é o lado do motor dessa mão:

     · `fichaParaTela(item, ctx)` — a ficha e o cartão de uma coisa da
       lista: o nome, a segunda linha, o retrato ou a marca, a frase que o
       toque escreve, o que o herói SABE (nunca o segredo — só que há um),
       o que LEMBRA (o último encontro, o pedido, a dívida, a compra), e os
       verbos com o preço dito ANTES do clique: o da compra sai do estoque
       (é o mesmo número que debita), o do golpe que é crime é o mesmo
       veredito de crime.js#veredictoDoCrime;
     · `fichasDaCena(lista, ctx)` — as quatro do pé da página, na ordem em
       que a prosa as mostrou;
     · `quemNoEnvio({ id, texto }, lista, memoria)` — a frase lida com o id
       da ficha tocada: o id ganha enquanto a frase ainda nomeia a coisa; se
       o jogador apagou o nome, cai para a leitura livre (`quemNaFrase`);
     · `bancasDoToque(alvo, lista, bancas)` — a compra tocada fecha contra a
       entrada do estoque que a ficha mostrou, e só ela;
     · F2d, a memória com rosto: cada cartão aberto vira página
       (`lembrarFicha`), a página do Códice tem a forma da ficha
       (`paginaDoCodice`), e dela também se aponta — "procuro Oren" chega a
       ele fora de cena (`procuraNaMemoria` → procura.js#procurarPessoa,
       `ctx.daMemoria`). Campo de save NOVO (`memoria`), ignorado pela
       versão antiga, com `garantirMemoriaDoSave`.

   O sistema não fala de si: nada do que vai à tela leva id, nome de
   mecanismo, "ficha", "segredo", "desconhecido" nem «hostil» como campo.
   O jogador é tratado por você; a frase do toque é dele, na 1.ª pessoa.
   ============================================================ */

import { quemNaFrase, SO_DA_PROSA } from "./em-cena.js";
import { veredictoDoCrime } from "./crime.js";
import { garantirLaco, tipoDeLacoPorId } from "./npcs.js";
import { cabecaDaCoisa } from "./economia.js";
import { nomeProcurado } from "./procura.js";
import { DIAS_ANO } from "./calendario.js";

const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const palavras = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const arr = (x) => (Array.isArray(x) ? x : []);
const txt = (x) => String(x == null ? "" : x).trim();
const semS = (w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const numOuNulo = (v) => (v == null || v === "" || typeof v === "boolean" || !Number.isFinite(Number(v)) ? null : Number(v));
const diaOuNulo = (v) => { const n = numOuNulo(v); return n != null && n >= 0 ? Math.floor(n) : null; };
const maiuscula = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

/* ---------------- OS TETOS ----------------
   `max`: quantas fichas no pé da página (o `FICHAS.max` da folha de estilo
   é o mesmo 4 — a régua do desenho, §Fichas 4). `verbos`: os atalhos 1–3
   do cartão. `sabe`/`lembra`: as linhas do cartão, para ele caber na folha
   do telefone (62 % da altura) sem rolar a cabeça para fora. */
export const FICHAS_NA_FILEIRA = { max: 4, verbos: 3, sabe: 5, lembra: 4 };

/* ---------------- A FAIXA MOSTRA SÓ O QUE O SISTEMA SABE (a 13.ª, 29/10) ----------------
   Na 13.ª sessão a faixa da cena teve gente fantasma: «Cão da várzea ·
   sozinha» (o cão da aposta, numa fala), «Bicho de ponta» («fende o bicho de
   ponta a ponta»), «Cacador da lâmina» (era o Dunstan, «limpando a lâmina de
   caça»), «Vulto de tochas», «Vulto de lâminas», «Homem de pele» (o Balduíno,
   que a mesma frase nomeou). Quem as punha ali não era o intérprete nem o
   registo: eram os leitores da prosa do `montarEmCena` (em-cena.js §4, §4b
   e §5 — `vistosNaProsa` e `apresentadosNaProsa`), tudo com
   `deOnde: "prosa"`, e a faixa mostrava-os como a quem o sistema conhece.
   Medido nas 23 respostas do Mestre da 13.ª: 29 achados da prosa, e só 4 eram
   gente à vista que o sistema não tinha (o pastor de ovelhas, o sujeito de
   gibão duas vezes, o halfling); os bichos de verdade já vinham da luta,
   e os outros 25 eram falas, anáforas e frases feitas. A faixa é o que o
   sistema SABE que está ali — o registo, o grupo, o núcleo, a luta, a sala, a estrada, a banca, o chão, o lugar.
   O que a prosa mostrou fica na LISTA (a frase do jogador acha-o:
   «falo com o pastor»), e o Cronista regista quem ganhou nome; a faixa não
   o oferece ao toque. */
/* a mesma tabela da linha EM CENA da pauta (em-cena.js, 31/10): uma regra, dois leitores */
export const FORA_DA_FAIXA = SO_DA_PROSA;

/* ---------------- A FRASE DO TOQUE ----------------
   O que o primeiro toque escreve no campo — editável, nunca mandada. Na
   1.ª pessoa do jogador. `{o}` é a coisa com o artigo ("as ataduras de
   linho", "o rato gigante"; a gente pelo nome, sem artigo); `{do}`,
   `{ao}`, `{pelo}`, `{no}` são as contrações. Proposta do desenho, para o
   `jogo` assinar (§Fichas 11): a tabela é o sítio de a mudar. */
export const FRASE_DO_TOQUE = {
  pessoa: "Falo com {o}",
  criaturaHostil: "Ataco {o}",
  criaturaHostilDaFrente: "Ataco {o} da frente",
  criatura: "Observo {o}",
  coisaAVenda: "Compro {o}",
  coisaNoChao: "Pego {o}",
  lugar: "Vou até {o}",
  saida: "Saio {pelo}",
  aqui: "Olho em volta",
};

/* ---------------- OS VERBOS DO CARTÃO ----------------
   Por variante, na ordem dos atalhos. `golpe`: o preço é o da luta ou o
   do crime; `compra`: o preço é o do estoque, e a bolsa diz se cabe;
   `distancia`: o preço é o caminho. A página do Códice (fora de cena) só
   aponta: procurar a pessoa, ir ao lugar. */
export const VERBOS_DA_FICHA = {
  pessoa: [
    { id: "falar", verbo: "Falar", frase: "Falo com {o}" },
    { id: "ajudar", verbo: "Ajudar", frase: "Ofereço ajuda {ao}" },
    { id: "atacar", verbo: "Atacar", frase: "Ataco {o}", golpe: true },
  ],
  pessoaDoGrupo: [
    { id: "falar", verbo: "Falar", frase: "Falo com {o}" },
    { id: "pedir", verbo: "Pedir ajuda", frase: "Peço ajuda {ao}" },
  ],
  criaturaHostil: [
    { id: "atacar", verbo: "Atacar", frase: "Ataco {o}", golpe: true },
    { id: "evitar", verbo: "Evitar", frase: "Recuo devagar, sem tirar os olhos {dos}" },
    { id: "observar", verbo: "Observar", frase: "Observo {os}" },
  ],
  criatura: [
    { id: "observar", verbo: "Observar", frase: "Observo {os}" },
    { id: "evitar", verbo: "Evitar", frase: "Afasto-me {dos}" },
    { id: "atacar", verbo: "Atacar", frase: "Ataco {o}", golpe: true },
  ],
  coisaAVenda: [
    { id: "comprar", verbo: "Comprar", frase: "Compro {o}", compra: true },
    { id: "pechinchar", verbo: "Pechinchar", frase: "Peço um preço melhor {pelo}" },
    { id: "perguntar", verbo: "Perguntar", frase: "Pergunto mais sobre {o}" },
  ],
  coisaNoChao: [
    { id: "pegar", verbo: "Pegar", frase: "Pego {o}" },
    { id: "examinar", verbo: "Examinar", frase: "Examino {o}" },
  ],
  lugar: [
    { id: "ir", verbo: "Ir", frase: "Vou até {o}", distancia: true },
    { id: "caminho", verbo: "Perguntar o caminho", frase: "Pergunto como se chega {ao}" },
  ],
  saida: [
    { id: "sair", verbo: "Sair", frase: "Saio {pelo}" },
    { id: "espreitar", verbo: "Espreitar", frase: "Espreito {o}" },
  ],
  aqui: [
    { id: "olhar", verbo: "Olhar em volta", frase: "Olho em volta" },
    { id: "vasculhar", verbo: "Vasculhar", frase: "Vasculho {o}" },
  ],
  paginaPessoa: [{ id: "procurar", verbo: "Procurar", frase: "Procuro {o}" }],
  paginaLugar: [{ id: "ir", verbo: "Ir", frase: "Vou até {o}" }],
};

/* ---------------- O PREÇO, DITO ANTES ----------------
   A palavra diz e a cor é a segunda leitura (§Fichas 3, Sem volta). O
   texto inteiro do crime vai em `veredito` (o mesmo do cartão de
   confirmação); aqui é a etiqueta curta que cabe no botão. */
export const PRECO_NA_TELA = {
  luta: "abre a luta",
  lutaContra: "abre a luta contra {os} {n}",
  crime: "é crime aqui",
  comigo: "rompe com quem anda com você",
  moeda: "◉ {n}",
  falta: "faltam ◉ {n}",
};

/* ---------------- O QUE A TELA DIZ ----------------
   `{a|b}` escolhe pelo género (b quando é ela). Nenhuma destas frases diz
   o nome de um mecanismo: a relação do registo vira o que ela é para o
   herói, o laço vira o que há entre os dois, e a relação sem peso cala. */
export const SABE_NA_TELA = {
  relacao: {
    aliado: "está do seu lado", amigo: "{é seu amigo|é sua amiga}", romance: "há alguma coisa entre vocês",
    conjuge: "{é seu marido|é sua mulher}", familia: "é da sua família", companheiro: "anda com você",
    rival: "mede-se com você", inimigo: "quer o seu mal", neutro: "", desconhecido: "",
  },
  desconhecida: "você não sabe o nome {dele|dela}",
  pistaVista: "você reparou: {o}",
  vendeSe: "vende-se em {banca}",
  noChao: "está no chão",
  hostil: { um: "vem para cima de você", varios: "vêm para cima de você" },
  ameaca: { fraco: "pouco perigo", comum: "", competente: "perigo a sério", elite: "perigo raro", lendario: "perigo de lenda" },
  linhaSozinho: "{sozinho|sozinha}",
  linhaHostis: "{n} · hostis",
  linhaHostil: "hostil",
  linhaAqui: "onde você está",
  linhaSaida: "uma saída daqui",
  linhaChao: "no chão",
};

/* a pista de que HÁ um segredo — a Intuição o viu (uma das duas pistas do
   núcleo já mostrada) — e nunca qual */
export const PISTA_DO_SEGREDO = { ele: "Há alguma coisa que ele não conta.", ela: "Há alguma coisa que ela não conta.", "": "Há alguma coisa que não se conta." };

export const LEMBRA_NA_TELA = {
  conheceram: "Conheceram-se no dia {dia}",
  /* o dia 0 é "antes do registo de dias" (a companheira do início, com o
     laço de anos) — e o dia 0 não existe para o jogador. A 9.ª sessão viu
     «Conheceram-se no dia 0»; o que é verdade é há quanto tempo. */
  conheceramHa: "Conhecem-se há {anos} anos",
  conheceramHaUm: "Conhecem-se há um ano",
  conheceramAntes: "Conhecem-se de antes da estrada",
  ultimaVez: "Viram-se pela última vez no dia {dia}",
  vistoEm: "{Visto|Vista} pela última vez em {onde}, no dia {dia}",
  pedidoAceito: "{Ele|Ela} lhe pediu uma coisa, e você aceitou",
  pedidoRecusado: "{Ele|Ela} lhe pediu uma coisa, e você recusou",
  pedidoAberto: "{Ele|Ela} lhe pediu uma coisa, e você ainda não respondeu",
  comprou: "Você comprou no dia {dia}, por ◉ {preco}",
  laco: {
    amizade: "Há amizade entre vocês",
    amor: "Há entre vocês o que ninguém precisa nomear",
    rivalidade: "Vocês se medem, e nenhum desiste",
    divida: "Um de vocês deve ao outro, e os dois sabem",
    aprendizado: "Um ensinou o outro — e nem sempre o que se quis ensinar",
    familia: "O mesmo sangue",
  },
  lacoRompido: "Já houve {laco} entre vocês; rompeu-se",
};

/* ---------------- O ARTIGO E O NÚMERO ----------------
   A coisa e o bicho levam artigo ("as ataduras de linho", "o rato
   gigante"); a gente, pelo nome, não ("Oren Trançado"); o lugar com nome
   de coisa comum leva ("o Moinho Velho"), o de nome próprio não ("Buraco
   Norte"). O género sai da terminação, salvo as exceções escritas. */
export const GENERO_DA_PALAVRA = {
  fem: ["ponte", "torre", "chave", "corrente", "pele", "lebre", "serpente", "mao", "flor", "cruz", "luz", "noz", "ave", "fonte", "nave", "parede", "rede", "morte", "noite", "tarde", "gente", "lente", "neve", "febre", "estalagem", "carne", "arvore", "ponte", "colher", "cor", "vez", "voz", "foz", "lebre", "hidra", "harpia"],
  masc: ["mapa", "dia", "fantasma", "planeta", "cometa", "guarda", "poeta", "profeta", "idioma", "clima", "sistema", "problema", "tema", "drama", "pirata", "kit"],
  femininas: /(a|cao|sao|dade|gem|ice|ude)$/,
};
export const LUGAR_COM_ARTIGO = ["moinho", "torre", "ponte", "porta", "portao", "rua", "praca", "taberna", "taverna", "mercado", "estrada", "caminho", "bosque", "floresta", "poco", "templo", "capela", "cripta", "celas", "cela", "porto", "cais", "beco", "ladeira", "armazem", "casa", "castelo", "forte", "mina", "gruta", "caverna", "pedreira", "feira", "estalagem", "pousada", "muralha", "paliçada", "palicada", "cemiterio", "vau", "pantano", "colina", "serra", "vale", "rio", "lago", "biblioteca", "salao", "quartel", "oficina", "forja", "estabulo", "celeiro", "jardim", "pátio", "patio", "trilha", "passagem", "escada", "corredor", "sala", "galeria", "saida", "entrada"];
const NUMERO_POR_EXTENSO = { 2: ["dois", "duas"], 3: ["três", "três"], 4: ["quatro", "quatro"], 5: ["cinco", "cinco"], 6: ["seis", "seis"], 7: ["sete", "sete"], 8: ["oito", "oito"], 9: ["nove", "nove"], 10: ["dez", "dez"] };
const CONECTORES = new Set(["de", "do", "da", "dos", "das", "com", "sem", "em", "para", "por", "que", "e"]);

function singular(w) {
  if (/oes$|aes$/.test(w)) return w.replace(/(oes|aes)$/, "ao");
  if (/eis$/.test(w)) return w.replace(/eis$/, "el");
  if (/ais$/.test(w)) return w.replace(/ais$/, "al");
  if (/(r|z)es$/.test(w)) return w.slice(0, -2);
  return semS(w);
}
function femininoDe(w) {
  const s = norm(w);
  if (GENERO_DA_PALAVRA.fem.includes(s)) return true;
  if (GENERO_DA_PALAVRA.masc.includes(s)) return false;
  return GENERO_DA_PALAVRA.femininas.test(s);
}
/* { plural, fem } da cabeça do nome */
function numeroDoNome(nome) {
  const ps = palavras(nome).filter((p) => !["o", "a", "os", "as", "um", "uma"].includes(p));
  const cab = ps[0] || "";
  const plural = cab.length > 3 && cab.endsWith("s") && !/(is|us)$/.test(cab);
  return { plural, fem: femininoDe(plural ? singular(cab) : cab) };
}
function pluralDaPalavra(w) {
  if (!w || CONECTORES.has(norm(w))) return w;
  const n = norm(w);
  if (n.endsWith("s")) return w;
  if (n.endsWith("ao")) return w.slice(0, -2) + (w.slice(-2, -1) === "Ã" ? "ÕES" : "ões");
  if (/[aeou]l$/.test(n)) return w.slice(0, -1) + "is";
  if (/il$/.test(n)) return w.slice(0, -1) + "s";
  if (/[rz]$/.test(n)) return w + "es";
  if (/m$/.test(n)) return w.slice(0, -1) + "ns";
  return w + "s";
}
/* "Rato Gigante" → "Ratos Gigantes" (até ao primeiro conector) */
function pluralDoNome(nome) {
  const ws = String(nome).split(/\s+/);
  let corta = false;
  return ws.map((w) => { if (CONECTORES.has(norm(w))) corta = true; return corta ? w : pluralDaPalavra(w); }).join(" ");
}

/* O nome com artigo (ou sem) e as contrações, para encher as frases */
function formasDoNome(nome, { comArtigo, minuscula, plural: forcaPlural, fem: forcaFem }) {
  const limpo = txt(nome).replace(/^(o|a|os|as)\s+/i, "");
  const jaTinha = /^(o|a|os|as)\s+/i.test(txt(nome));
  const corpo = minuscula ? limpo.toLowerCase() : limpo;
  const nn = numeroDoNome(limpo);
  const plural = forcaPlural != null ? forcaPlural : nn.plural;
  const fem = forcaFem != null ? forcaFem : nn.fem;
  if (!comArtigo && !jaTinha) return { o: corpo, os: corpo, do: `de ${corpo}`, dos: `de ${corpo}`, ao: `a ${corpo}`, pelo: `por ${corpo}`, no: `em ${corpo}`, fem, plural };
  const art = fem ? (plural ? "as" : "a") : (plural ? "os" : "o");
  const artPl = fem ? "as" : "os";
  const pluralDoCorpo = plural ? corpo : pluralDoNome(corpo);
  const C = { o: { de: "do", a: "ao", por: "pelo", em: "no" }, a: { de: "da", a: "à", por: "pela", em: "na" }, os: { de: "dos", a: "aos", por: "pelos", em: "nos" }, as: { de: "das", a: "às", por: "pelas", em: "nas" } };
  return {
    o: `${art} ${corpo}`, os: `${artPl} ${pluralDoCorpo}`,
    do: `${C[art].de} ${corpo}`, dos: `${C[artPl].de} ${pluralDoCorpo}`,
    ao: `${C[art].a} ${corpo}`, pelo: `${C[art].por} ${corpo}`, no: `${C[art].em} ${corpo}`,
    fem, plural,
  };
}
const encher = (tpl, f) => String(tpl).replace(/\{(o|os|do|dos|ao|pelo|no)\}/g, (m, k) => f[k] || "").replace(/\s+/g, " ").trim();
const gen = (tpl, ela) => String(tpl).replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (m, a, b) => (ela ? b : a));
const vars = (tpl, v) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? String(v[k]) : m));

/* ---------------- A VARIANTE ----------------
   O que a coisa é para a tela — a peça `Ficha` tem Tipo Pessoa · Criatura
   · Criatura hostil · Coisa · Lugar; os verbos e a frase vão mais fundo. */
function varianteDe(x, grupoN) {
  if (x.tipo === "pessoa") return x.comigo && grupoN.has(norm(x.nome)) ? "pessoaDoGrupo" : "pessoa";
  if (x.tipo === "criatura") return x.hostil ? "criaturaHostil" : "criatura";
  if (x.tipo === "coisa") return x.preco != null ? "coisaAVenda" : "coisaNoChao";
  if (x.tipo === "lugar") return x.deOnde === "saida" ? "saida" : x.deOnde === "lugar" ? "aqui" : "lugar";
  return "";
}
const TIPO_DA_PECA = { pessoa: "Pessoa", pessoaDoGrupo: "Pessoa", criatura: "Criatura", criaturaHostil: "Criatura hostil", coisaAVenda: "Coisa", coisaNoChao: "Coisa", lugar: "Lugar", saida: "Lugar", aqui: "Lugar" };

const ehEla = (x) => x.genero === "ela" || norm(x.genero) === "mulher";

/* a gente pelo nome; quem o Mestre armou sem nome é descrição, com artigo */
function formasDe(x) {
  if (x.tipo === "pessoa") {
    if (x.deOnde === "prosa") return formasDoNome(x.nome, { comArtigo: true, minuscula: true });
    return formasDoNome(x.nome, { comArtigo: false });
  }
  if (x.tipo === "lugar") {
    const cab = palavras(x.nome)[0] || "";
    return formasDoNome(x.nome, { comArtigo: LUGAR_COM_ARTIGO.includes(cab), minuscula: false });
  }
  return formasDoNome(x.nome, { comArtigo: true, minuscula: true, ...(x.tipo === "criatura" ? { plural: false } : {}) });
}

/* o que o registo sabe desta pessoa (chave sem caixa nem acento) */
const doRegisto = (npcs, nome) => { const r = obj(npcs); const k = Object.keys(r).find((k0) => norm(k0) === norm(nome)); return k ? obj(r[k]) : null; };
const doNucleo = (nucleo, nome) => arr(obj(nucleo).pessoas).find((p) => p && norm(p.nome) === norm(nome)) || null;
const doArco = (coracao, nome) => { const a = obj(obj(coracao).arcos); const k = Object.keys(a).find((k0) => norm(k0) === norm(nome)); return k ? obj(a[k]) : null; };

/* ---------------- A SEGUNDA LINHA ---------------- */
function linhaDe(x, variante) {
  if (x.tipo === "pessoa") {
    if (x.deOnde === "prosa") return gen(SABE_NA_TELA.desconhecida, femininoDe(x.cabeca || palavras(x.nome)[0] || ""));
    if (x.comigo) return SABE_NA_TELA.relacao.companheiro;
    const papel = txt(String(x.papel || "").split(",")[0]);
    return papel || "";
  }
  if (x.tipo === "criatura") {
    const q = Math.max(1, Number(x.quantos) || 1);
    if (x.hostil) return q > 1 ? vars(SABE_NA_TELA.linhaHostis, { n: q }) : SABE_NA_TELA.linhaHostil;
    return q > 1 ? String(q) : gen(SABE_NA_TELA.linhaSozinho, numeroDoNome(x.nome).fem);
  }
  if (x.tipo === "coisa") return x.preco != null ? vars(PRECO_NA_TELA.moeda, { n: x.preco }) : SABE_NA_TELA.linhaChao;
  if (x.tipo === "lugar") {
    if (variante === "aqui") return SABE_NA_TELA.linhaAqui;
    if (variante === "saida") return SABE_NA_TELA.linhaSaida;
    const d = txt(x.distancia);
    return d ? `a ${d}${x.rumo ? `, ${x.rumo}` : ""}` : "";
  }
  return "";
}

/* ---------------- O QUE O HERÓI SABE ----------------
   Do que a lista já diz (o papel, o passado, o que a Intuição ou a
   conversa deram), traduzido para a tela: a relação crua do registo vira
   o que ela é para o herói; o laço vai para LEMBRA; o que repete a
   segunda linha cala. As pistas do núcleo que o herói já VIU entram como
   o que ele reparou — o que elas escondem, nunca. */
function sabeDe(x, ctx, linha, variante) {
  const ela = ehEla(x);
  const out = [];
  const poe = (s) => { const t = txt(s); if (t && norm(t) !== norm(linha) && !out.some((o) => norm(o) === norm(t))) out.push(t); };
  for (const s0 of arr(x.sabe)) {
    const s = txt(s0);
    if (!s || /^laço:/i.test(s) || /^◉/.test(s)) continue;
    if (Object.prototype.hasOwnProperty.call(SABE_NA_TELA.relacao, norm(s))) { poe(gen(SABE_NA_TELA.relacao[norm(s)], ela)); continue; }
    if (x.tipo === "pessoa" && x.comigo && norm(s) === norm(SABE_NA_TELA.relacao.companheiro)) continue;
    if (x.tipo === "lugar" && (norm(s) === "uma saida daqui" || /^onde /.test(norm(s)))) continue;
    if (x.tipo === "coisa" && norm(s) === "no chao") continue;
    poe(s);
  }
  if (x.tipo === "pessoa") {
    const n = doNucleo(ctx.nucleo, x.nome);
    const a = doArco(ctx.coracao, x.nome);
    const vistas = a ? arr(a.pistas).length : 0;
    const pistas = arr(obj(obj(obj(n).ficha).esconde).pistas).slice(0, vistas).map((p) => txt(obj(p).o)).filter((o) => o && !o.includes("{"));
    for (const p of pistas) poe(vars(SABE_NA_TELA.pistaVista, { o: p }));
  }
  if (x.tipo === "criatura") {
    const am = SABE_NA_TELA.ameaca[norm(x.ameaca)];
    if (am) poe(am);
    if (x.hostil) poe(Math.max(1, Number(x.quantos) || 1) > 1 ? SABE_NA_TELA.hostil.varios : SABE_NA_TELA.hostil.um);
  }
  if (x.tipo === "coisa") {
    if (x.preco != null && txt(x.banca)) poe(vars(SABE_NA_TELA.vendeSe, { banca: txt(x.banca).replace(/\s*\([^)]*\)\s*$/, "") }));
    if (x.preco == null) poe(SABE_NA_TELA.noChao);
  }
  return out.slice(0, FICHAS_NA_FILEIRA.sabe);
}

/* ---------------- A PISTA (só que há) ----------------
   Uma pista vista e o segredo ainda de pé (sem crise no arco, fora dos
   revelados): a frase de que há. Nada mais. */
function pistaDe(x, ctx) {
  if (x.tipo !== "pessoa") return null;
  const n = doNucleo(ctx.nucleo, x.nome);
  const a = doArco(ctx.coracao, x.nome);
  if (!n || !a || !arr(a.pistas).length) return null;
  if (a.crise != null || arr(ctx.revelados).some((r) => norm(typeof r === "string" ? r : obj(r).nome) === norm(x.nome))) return null;
  const g = x.genero === "ela" || norm(n.genero) === "mulher" ? "ela" : x.genero === "ele" || norm(n.genero) === "homem" ? "ele" : "";
  return PISTA_DO_SEGREDO[g];
}

/* ---------------- O QUE LEMBRA ----------------
   Do que já guarda: os dias em que o herói a viu (`vistos`, o campo do
   elenco), o dia em que se conheceram (o registo), o laço, o pedido do
   arco (aceite, recusado, por responder), e as compras feitas pela ficha
   (a memória da F2d). O dia de hoje não é lembrança — é agora. */
/* quem se conheceu antes do dia 1: há quantos anos, pelo `desde` do laço
   (negativo: anos antes do dia 1), ou só "de antes da estrada". Lê o laço
   CRU: `garantirLaco` põe `desde: 0` em quem não o tem, e o 0 daria um
   "há um ano" que ninguém viveu. Menos de meio ano não se conta em anos. */
function desdeAntes(laco, hoje) {
  const desde = laco && typeof laco === "object" ? numOuNulo(laco.desde) : null;
  const anos = desde == null ? 0 : Math.round(((hoje != null ? hoje : 1) - desde) / DIAS_ANO);
  if (anos < 1) return LEMBRA_NA_TELA.conheceramAntes;
  return anos === 1 ? LEMBRA_NA_TELA.conheceramHaUm : vars(LEMBRA_NA_TELA.conheceramHa, { anos });
}

function lembraDe(x, ctx, pagina) {
  const ela = ehEla(x);
  const hoje = diaOuNulo(ctx.dia);
  const out = [];
  if (x.tipo === "pessoa") {
    const r = doRegisto(ctx.npcs, x.nome);
    const vistos = obj(ctx.vistos);
    const kv = Object.keys(vistos).find((k) => norm(k) === norm(x.nome));
    const dias = (kv ? arr(vistos[kv]) : []).map(diaOuNulo).filter((d) => d != null && (hoje == null || d < hoje));
    const ultimo = dias.length ? Math.max(...dias) : null;
    const conheceu = r ? diaOuNulo(r.conhecidoEm) : null;
    const laco = r ? garantirLaco(r.laco) : null;
    if (conheceu === 0) out.push(desdeAntes(r.laco, hoje));
    else if (conheceu != null && (hoje == null || conheceu < hoje) && conheceu !== ultimo) out.push(vars(LEMBRA_NA_TELA.conheceram, { dia: conheceu }));
    if (ultimo != null) out.push(vars(LEMBRA_NA_TELA.ultimaVez, { dia: ultimo }));
    if (laco) {
      if (laco.rompido) out.push(vars(LEMBRA_NA_TELA.lacoRompido, { laco: (tipoDeLacoPorId(laco.tipo) || {}).rotulo || "alguma coisa" }));
      else if (LEMBRA_NA_TELA.laco[laco.tipo]) out.push(LEMBRA_NA_TELA.laco[laco.tipo]);
    }
    const a = doArco(ctx.coracao, x.nome);
    if (a && a.pedido != null) out.push(gen(a.resposta === "aceitou" ? LEMBRA_NA_TELA.pedidoAceito : a.resposta === "recusou" ? LEMBRA_NA_TELA.pedidoRecusado : LEMBRA_NA_TELA.pedidoAberto, ela));
  }
  const pg = pagina || obj(obj(obj(ctx.memoria).paginas)[x.id]);
  for (const c of arr(pg.compras)) out.push(vars(LEMBRA_NA_TELA.comprou, { dia: c.dia, preco: c.preco }));
  return out.slice(0, FICHAS_NA_FILEIRA.lembra);
}

/* ---------------- OS VERBOS COM PREÇO ---------------- */
function precoDoGolpe(x, f, ctx) {
  const crime = obj(ctx.crime);
  if (x.tipo === "pessoa" && !x.armado && !x.hostil) {
    /* sem o contexto do crime não se sabe o preço — e um preço que não se
       sabe não se escreve: "abre a luta" sobre quem não é inimigo mentiria */
    if (!crime.ctx && !crime.mundo) return { preco: "", tom: "gesto", veredito: "" };
    let veredito = "";
    try { veredito = crime.ctx || crime.mundo ? veredictoDoCrime({ tipo: "agressao", nome: x.nome, papel: x.papel || "", comigo: !!x.comigo }, obj(crime.ctx), obj(crime.mundo)) : ""; } catch { veredito = ""; }
    if (veredito) return { preco: x.comigo ? PRECO_NA_TELA.comigo : PRECO_NA_TELA.crime, tom: "semVolta", veredito };
    return { preco: PRECO_NA_TELA.luta, tom: "gesto", veredito: "" };
  }
  const q = Math.max(1, Number(x.quantos) || 1);
  if (x.tipo === "criatura" && q > 1) {
    const ext = NUMERO_POR_EXTENSO[q];
    return { preco: vars(PRECO_NA_TELA.lutaContra, { os: f.fem ? "as" : "os", n: ext ? ext[f.fem ? 1 : 0] : q }), tom: "gesto", veredito: "" };
  }
  return { preco: PRECO_NA_TELA.luta, tom: "gesto", veredito: "" };
}
function verbosDe(x, variante, f, ctx) {
  const tabela = VERBOS_DA_FICHA[variante] || [];
  const q = Math.max(1, Number(x.quantos) || 1);
  const bolsa = numOuNulo(ctx.bolsa);
  return tabela.slice(0, FICHAS_NA_FILEIRA.verbos).map((v) => {
    let frase = encher(v.frase, f);
    if (v.golpe && x.tipo === "criatura" && q > 1) frase = `${frase} da frente`;
    let preco = "", tom = "gesto", impedido = null, veredito = "";
    if (v.golpe) ({ preco, tom, veredito } = precoDoGolpe(x, f, ctx));
    if (v.compra && x.preco != null) {
      preco = vars(PRECO_NA_TELA.moeda, { n: x.preco });
      if (bolsa != null && bolsa < x.preco) impedido = vars(PRECO_NA_TELA.falta, { n: x.preco - bolsa });
    }
    if (v.distancia && txt(x.distancia)) preco = `a ${txt(x.distancia)}`;
    return { id: v.id, verbo: v.verbo, frase: maiuscula(frase), preco, tom, impedido, ...(veredito ? { veredito } : {}) };
  });
}

function retratoDe(x, ctx) {
  if (x.tipo === "pessoa") {
    const r = doRegisto(ctx.npcs, x.nome);
    return { semente: txt((r && r.semente) || x.nome), inimigo: !!(x.hostil || x.armado), marca: null };
  }
  if (x.tipo === "criatura") return { semente: null, inimigo: !!x.hostil, marca: x.hostil ? "pataHostil" : "pata" };
  return { semente: null, inimigo: false, marca: x.tipo === "coisa" ? "bolsa" : "lugar" };
}

function fraseDoToque(x, variante, f) {
  if (variante === "criaturaHostil") return encher(Math.max(1, Number(x.quantos) || 1) > 1 ? FRASE_DO_TOQUE.criaturaHostilDaFrente : FRASE_DO_TOQUE.criaturaHostil, f);
  if (variante === "pessoaDoGrupo") return encher(FRASE_DO_TOQUE.pessoa, f);
  return encher(FRASE_DO_TOQUE[variante] || "", f);
}

/* ============================================================
   A FICHA
   `item`: uma coisa de `montarEmCena` (em-cena.js). `ctx` (tudo opcional;
   lixo e null não estouram):
     bolsa                — as moedas do herói (diz se a compra cabe)
     grupo                — quem anda no grupo (o grupo não se ataca)
     npcs                 — o registo (a semente do retrato, o dia em que se
                            conheceram, o laço)
     vistos               — os dias em que o herói viu cada um (elenco.vistos)
     nucleo, coracao      — as pistas já vistas e o pedido do arco
     revelados            — os nomes cujo segredo já caiu
     crime                — { ctx, mundo }: os mesmos de veredictoDoCrime
     memoria, dia         — a memória da F2d (as compras) e o dia de hoje
   Devolve { id, tipo, peca, nome, linha, retrato, frase, sabe[], lembra[],
   pista, verbos[{ id, verbo, frase, preco, tom, impedido, veredito? }],
   genero, papel, quantos, hostil } — os quatro últimos são para a memória,
   não para a tela. Coisa sem id ou sem nome: null.
   ============================================================ */
export function fichaParaTela(item, ctx) {
  const x = obj(item);
  if (!x.id || !txt(x.nome) || !["pessoa", "criatura", "coisa", "lugar"].includes(x.tipo)) return null;
  const c = obj(ctx);
  const grupoN = new Set(arr(c.grupo).map((g) => norm(typeof g === "string" ? g : obj(g).nome)).filter(Boolean));
  return montarFicha(x, c, grupoN, null);
}
function montarFicha(x, c, grupoN, pagina) {
  const variante = pagina ? (x.tipo === "pessoa" ? "paginaPessoa" : x.tipo === "lugar" ? "paginaLugar" : "pagina") : varianteDe(x, grupoN);
  const f = formasDe(x);
  const quantos = Math.max(1, Number(x.quantos) || 1);
  const nome = x.tipo === "criatura" && quantos > 1 ? pluralDoNome(txt(x.nome)) : txt(x.nome);
  const linha = pagina ? txt(pagina.linha) : linhaDe(x, variante);
  const sabe = sabeDe(x, c, linha, variante);
  const lembra = lembraDe(x, c, pagina);
  if (pagina && pagina.ultimo != null && txt(pagina.cidade)) lembra.unshift(gen(vars(LEMBRA_NA_TELA.vistoEm, { onde: txt(pagina.cidade), dia: pagina.ultimo }), x.tipo === "pessoa" ? ehEla(x) : f.fem));
  return {
    id: x.id,
    tipo: x.tipo,
    peca: pagina ? (x.tipo === "pessoa" ? "Pessoa" : x.tipo === "criatura" ? (x.hostil ? "Criatura hostil" : "Criatura") : x.tipo === "coisa" ? "Coisa" : "Lugar") : TIPO_DA_PECA[variante],
    nome: maiuscula(nome),
    linha,
    retrato: retratoDe(x, c),
    frase: maiuscula(pagina ? encher((VERBOS_DA_FICHA[variante] || [{}])[0].frase || "", f) : fraseDoToque(x, variante, f)),
    sabe,
    lembra: lembra.slice(0, FICHAS_NA_FILEIRA.lembra),
    pista: pistaDe(x, c),
    verbos: verbosDe(x, variante, f, c),
    genero: x.tipo === "pessoa" ? (ehEla(x) ? "ela" : x.genero === "ele" ? "ele" : "") : "",
    papel: x.tipo === "pessoa" ? txt(x.papel) : "",
    quantos,
    hostil: !!x.hostil,
  };
}

/* ============================================================
   AS QUATRO DO PÉ DA PÁGINA (`fichasDaCena`)
   Os `aqui` da lista, na ordem em que a última fala do Mestre os mostrou
   (lê-se o rato e acha-se o rato no mesmo sítio da fila); quem a fala não
   cita vem depois, pela ordem da lista; quem anda com o herói e o lugar
   onde ele está vêm por último — estão sempre lá, e o pé tem quatro.
   `ctx` é o de `fichaParaTela`, mais `mostrado` (as falas do Mestre).
   ============================================================ */
function posicaoNaProsa(x, ws) {
  const alvo = (w) => ws.findIndex((p) => semS(p) === semS(w));
  if (x.tipo === "pessoa") {
    if (x.deOnde === "prosa") return Math.min(...[x.arma, x.cabeca].filter(Boolean).map((w) => { const i = alvo(norm(w)); return i < 0 ? Infinity : i; }), Infinity);
    const p1 = palavras(x.nome)[0];
    return p1 && p1.length >= 3 ? (alvo(p1) < 0 ? Infinity : alvo(p1)) : Infinity;
  }
  if (x.tipo === "criatura") {
    const r = norm(x.raiz || palavras(x.nome)[0] || "");
    const i = ws.findIndex((p) => semS(p) === r || p === r || semS(p).startsWith(r.slice(0, Math.max(3, r.length - 1))));
    return i < 0 ? Infinity : i;
  }
  if (x.tipo === "coisa") {
    const cab = cabecaDaCoisa(x.nome);
    const i = ws.findIndex((p) => cab.includes(semS(p)));
    return i < 0 ? Infinity : i;
  }
  const ps = palavras(x.nome);
  for (let i = 0; i + ps.length <= ws.length; i++) if (ps.every((w, k) => ws[i + k] === w)) return i;
  return Infinity;
}
export function fichasDaCena(lista, ctx) {
  const c = obj(ctx);
  const falas = arr(c.mostrado).filter((s) => typeof s === "string" && s.trim());
  const ultima = palavras(falas[falas.length - 1] || "");
  const todas = palavras(falas.join(" "));
  const vistos = new Set();
  const L = arr(lista).filter((x) => x && typeof x === "object" && x.id && x.nome && x.aqui && !FORA_DA_FAIXA.deOnde.includes(x.deOnde) && !vistos.has(x.id) && vistos.add(x.id));
  const fundo = (x) => (x.tipo === "pessoa" && x.comigo) || (x.tipo === "lugar" && x.deOnde === "lugar");
  const chave = (x, i) => {
    const p = posicaoNaProsa(x, ultima);
    const q = posicaoNaProsa(x, todas);
    return [fundo(x) ? 1 : 0, Number.isFinite(p) ? p : Number.isFinite(q) ? 1e5 + q : 1e7 + i];
  };
  const ordem = L.map((x, i) => [x, chave(x, i)]).sort((a, b) => a[1][0] - b[1][0] || a[1][1] - b[1][1]).map(([x]) => x);
  return ordem.slice(0, FICHAS_NA_FILEIRA.max).map((x) => fichaParaTela(x, c)).filter(Boolean);
}

/* ============================================================
   O ID NO ENVIO (`quemNoEnvio`)
   `envio`: { id, texto } (ou `ids`, quando o jogador tocou mais de uma —
   "ataco o rato e grito para Oren"). Devolve a forma de `quemNaFrase`
   ([{ id, tipo, nome, como, quantos, faz }]) com `pelo`: "toque" ou
   "frase". A ficha tocada vem à frente enquanto a frase ainda a nomeia —
   lida só contra ela, a frase dá o `faz` (o golpe, a compra, a procura); o
   jogador que apagou o nome desligou a ficha, e a frase é lida livre,
   como hoje. Nunca adivinha: sem nome na frase, o id não vale.
   `memoria` (opcional): as páginas da F2d — o id tocado no Códice aponta
   quem não está em cena ("Procuro Oren").
   ============================================================ */
function paginasComoItens(memoria) {
  const m = garantirMemoriaDoSave(memoria);
  return Object.values(m.paginas).map((p) => ({ id: p.id, tipo: p.tipo, nome: p.nome, papel: p.papel, genero: p.genero, quantos: p.quantos, hostil: p.hostil, aqui: false, deOnde: "memoria", sabe: p.sabe }));
}
export function quemNoEnvio(envio, lista, memoria) {
  const e = obj(envio);
  const texto = String(e.texto == null ? "" : e.texto);
  const ids = [...new Set([...arr(e.ids), e.id].filter((i) => typeof i === "string" && i))];
  const L = arr(lista).filter((x) => x && typeof x === "object" && x.id && x.nome && x.tipo);
  let livres = [];
  try { livres = quemNaFrase(texto, L); } catch { livres = []; }
  const tocados = [];
  if (ids.length) {
    const paginas = memoria ? paginasComoItens(memoria).filter((p) => !L.some((x) => x.id === p.id)) : [];
    for (const id of ids) {
      const item = L.find((x) => x.id === id) || paginas.find((x) => x.id === id);
      if (!item) continue;
      let so = null;
      try { so = quemNaFrase(texto, [item])[0] || null; } catch { so = null; }
      if (so && !tocados.some((t) => t.id === so.id)) tocados.push({ ...so, pelo: "toque" });
    }
  }
  return [...tocados, ...livres.filter((x) => !tocados.some((t) => t.id === x.id)).map((x) => ({ ...x, pelo: "frase" }))];
}

/* A COMPRA TOCADA: as bancas reduzidas à entrada do estoque que a ficha
   mostrou — `compraNaBanca` (bolsa-da-frase.js) fecha pelo preço dela e
   por nenhuma outra com o mesmo nome. Sem toque numa coisa à venda, as
   bancas voltam como vieram. */
export function bancasDoToque(alvo, lista, bancas) {
  const a = obj(alvo);
  const B = arr(bancas);
  if (a.pelo !== "toque" || a.tipo !== "coisa") return B;
  const item = arr(lista).find((x) => x && x.id === a.id);
  if (!item || item.deOnde !== "banca") return B;
  for (const b0 of B) {
    const b = obj(b0);
    if (txt(b.nome || b.rotulo) !== txt(item.banca)) continue;
    const it = arr(b.estoque).find((s) => s && txt(s.nome) === txt(item.nome));
    if (it) return [{ ...b, estoque: [it] }];
  }
  return B;
}

/* ============================================================
   F2d · A MEMÓRIA TEM ROSTO
   Cada cartão aberto vira página: o que era, o que o herói sabia dela, onde
   e quando a viu, e o que comprou. Campo de save NOVO (`memoria`), no topo,
   que a versão antiga não lê — e que some no primeiro autosave de quem
   voltar a ela (perde-se o álbum, o jogo fica inteiro: um revert desfaz).
   Teto por tabela; ao passar, sai a página mais antiga, e entre as da
   mesma idade a que menos pesa (`ficar`: a coisa antes do lugar, o lugar
   antes do bicho, o bicho antes da gente).
   ============================================================ */
export const MEMORIA_DO_SAVE_VERSAO = 1;
export const MEMORIA_DAS_FICHAS = {
  paginas: 80,
  sabe: 5,
  compras: 5,
  texto: 120,
  nome: 60,
  ficar: { coisa: 0, lugar: 1, criatura: 2, pessoa: 3 },
};
const corta = (s, n) => txt(s).replace(/\s+/g, " ").slice(0, n);

function garantirPagina(p0, id) {
  const p = obj(p0);
  const tipo = ["pessoa", "criatura", "coisa", "lugar"].includes(p.tipo) ? p.tipo : null;
  const nome = corta(p.nome, MEMORIA_DAS_FICHAS.nome);
  if (!tipo || !nome || !id) return null;
  const primeiro = diaOuNulo(p.primeiro), ultimo = diaOuNulo(p.ultimo);
  return {
    id, tipo, nome,
    linha: corta(p.linha, MEMORIA_DAS_FICHAS.texto),
    papel: corta(p.papel, MEMORIA_DAS_FICHAS.texto),
    genero: ["ele", "ela"].includes(p.genero) ? p.genero : "",
    quantos: Math.max(1, Math.min(99, Math.floor(Number(p.quantos)) || 1)),
    hostil: p.hostil === true,
    sabe: [...new Set(arr(p.sabe).map((s) => corta(s, MEMORIA_DAS_FICHAS.texto)).filter(Boolean))].slice(0, MEMORIA_DAS_FICHAS.sabe),
    cidade: corta(p.cidade, MEMORIA_DAS_FICHAS.nome),
    primeiro: primeiro != null ? primeiro : ultimo,
    ultimo: ultimo != null ? ultimo : primeiro,
    vezes: Math.max(1, Math.floor(Number(p.vezes)) || 1),
    compras: arr(p.compras).map((c) => ({ dia: diaOuNulo(obj(c).dia), preco: diaOuNulo(obj(c).preco) })).filter((c) => c.dia != null && c.preco != null).slice(-MEMORIA_DAS_FICHAS.compras),
  };
}
export function garantirMemoriaDoSave(x) {
  const o = obj(x);
  const paginas = {};
  for (const [k, v] of Object.entries(obj(o.paginas))) {
    const id = corta(k, 40);
    if (!id || PROIBIDAS.has(id)) continue;
    const p = garantirPagina(v, id);
    if (p) paginas[id] = p;
  }
  const ids = Object.keys(paginas);
  if (ids.length > MEMORIA_DAS_FICHAS.paginas) {
    const F = MEMORIA_DAS_FICHAS.ficar;
    ids.sort((a, b) => (paginas[a].ultimo || 0) - (paginas[b].ultimo || 0) || F[paginas[a].tipo] - F[paginas[b].tipo] || (a < b ? -1 : 1));
    for (const id of ids.slice(0, ids.length - MEMORIA_DAS_FICHAS.paginas)) delete paginas[id];
  }
  return { versao: MEMORIA_DO_SAVE_VERSAO, paginas };
}

/* O cartão aberto: a página nasce ou cresce (o que se sabe junta-se, o
   último dia anda, as vezes contam). `ficha`: a de `fichaParaTela`.
   `quando`: { dia, cidade }. Estado novo; o recebido intacto. */
export function lembrarFicha(memoria, ficha, quando) {
  const m = garantirMemoriaDoSave(memoria);
  const f = obj(ficha);
  const q = obj(quando);
  if (!f.id || !txt(f.nome) || PROIBIDAS.has(String(f.id))) return m;
  const dia = diaOuNulo(q.dia);
  const ja = m.paginas[f.id];
  const pagina = garantirPagina({
    tipo: f.tipo, nome: ja && ja.nome && f.tipo === "criatura" ? ja.nome : f.nome,
    linha: f.linha || (ja && ja.linha), papel: f.papel || (ja && ja.papel), genero: f.genero || (ja && ja.genero),
    quantos: f.quantos, hostil: f.hostil,
    sabe: [...arr(f.sabe), ...(ja ? ja.sabe : [])],
    cidade: txt(q.cidade) || (ja && ja.cidade),
    primeiro: ja && ja.primeiro != null ? ja.primeiro : dia,
    ultimo: dia != null ? Math.max(dia, (ja && ja.ultimo) || 0) : ja && ja.ultimo,
    vezes: ja ? ja.vezes + 1 : 1,
    compras: ja ? ja.compras : [],
  }, f.id);
  if (!pagina) return m;
  return garantirMemoriaDoSave({ ...m, paginas: { ...m.paginas, [f.id]: pagina } });
}

/* A compra que a ficha fechou fica na página da coisa (o LEMBRA dela). */
export function lembrarCompra(memoria, id, compra) {
  const m = garantirMemoriaDoSave(memoria);
  const p = m.paginas[id];
  const c = obj(compra);
  const dia = diaOuNulo(c.dia), preco = diaOuNulo(c.preco);
  if (!p || dia == null || preco == null) return m;
  return garantirMemoriaDoSave({ ...m, paginas: { ...m.paginas, [id]: { ...p, compras: [...p.compras, { dia, preco }] } } });
}

/* A página do Códice: a forma da ficha, fora de cena — o que se sabia, o
   que se lembra (onde e quando foi vista por último, mais o que o registo
   e o arco lembram hoje), a pista se há, e o verbo que aponta de longe
   (procurar a pessoa, ir ao lugar). `ctx` é o de `fichaParaTela`. */
export function paginaDoCodice(pagina, ctx) {
  const p = garantirPagina(pagina, txt(obj(pagina).id));
  if (!p) return null;
  const x = { id: p.id, tipo: p.tipo, nome: p.nome, papel: p.papel, genero: p.genero, quantos: p.quantos, hostil: p.hostil, sabe: p.sabe, aqui: false, deOnde: "memoria" };
  return montarFicha(x, obj(ctx), new Set(), p);
}
export function paginasDoCodice(memoria, ctx) {
  const m = garantirMemoriaDoSave(memoria);
  const ordem = Object.values(m.paginas).sort((a, b) => (b.ultimo || 0) - (a.ultimo || 0) || (a.id < b.id ? -1 : 1));
  return ordem.map((p) => paginaDoCodice(p, ctx)).filter(Boolean);
}

/* "Procuro Oren", fora de cena: a pessoa que tem página, dita pelo nome
   (a régua de procura.js#nomeProcurado) — ou pelo id tocado no Códice
   (`opcoes.id`). Devolve { nome, papel, cidade } para `procurarPessoa`
   (`ctx.daMemoria`): quem o mundo não acha está onde o herói a viu. */
export function procuraNaMemoria(frase, memoria, opcoes) {
  const m = garantirMemoriaDoSave(memoria);
  const o = obj(opcoes);
  const gente = Object.values(m.paginas).filter((p) => p.tipo === "pessoa");
  if (!gente.length) return null;
  let p = null;
  if (typeof o.id === "string" && m.paginas[o.id] && m.paginas[o.id].tipo === "pessoa") p = m.paginas[o.id];
  if (!p) {
    let nome = "";
    try { nome = nomeProcurado(frase, gente.map((g) => g.nome), { perto: arr(o.perto) }); } catch { nome = ""; }
    p = nome ? gente.find((g) => g.nome === nome) || null : null;
  }
  return p ? { nome: p.nome, papel: p.papel, cidade: p.cidade } : null;
}
