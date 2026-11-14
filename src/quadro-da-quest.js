/* ============================================================
   O QUADRO DA QUEST — as cartas de pista, e quem as vira
   (13/11/2026, Fase QQ · Q1, o motor; a tela vem depois)

   A 19.ª sessão propôs «o quadro do mistério» (mente/sessao-19.md), e a
   pessoa aprovou-o («pode seguir») numa versão que corrige o original: as
   falhas por pouco já não viram meia carta à sorte — a carta que o caso
   PRECISA nunca se perde. A planta está em mente/plano-quadro.md.

   CADA QUEST ATIVA TEM UM QUADRO: a pergunta do caso (a etapa de agora) e
   cartas de pista. De costas, a carta mostra só a FORMA do que esconde (um
   lugar, uma pessoa, um objeto); virada, o facto e de onde veio.

     · AS ESSENCIAIS saem das condições das etapas (a ficha da BQ): cada
       átomo que é pista (PISTAS_DO_PASSO — descobrir um lugar, arrancar o
       que alguém sabe, ter a prova) é uma carta. Têm sempre ≥2 caminhos
       (CAMINHOS_DA_CARTA), e NUNCA SE PERDEM: o sucesso vira-a limpa, e a
       falha vira-a também, com um preço de PRECO_DA_FALHA (tempo, o vilão
       fica a saber, a testemunha cobra, o objeto danificado, a metade).
       É a regra do GUMSHOE (Robin D. Laws: a pista essencial nunca depende
       do dado) e a das três pistas (Justin Alexander, The Alexandrian) — a
       biblioteca já as escrevia nas etapas «pelo menos 2 de 3».
     · AS EXTRA (EXTRAS_DO_QUADRO) — a fraqueza do vilão, o cúmplice, uma
       vantagem no confronto — só o sucesso vira. A falha queima o caminho
       (a mesma régua do `jaTentou`, desafios.js: a mesma coisa do mesmo
       jeito não se repete), e sem caminho a carta perde-se: chega-se ao fim
       pior armado.
     · NOS ARCOS DE MISTÉRIO (QUADRO_POR_ARCO) há mais cartas (a conversa
       com quem sabe conta como pista, as etapas por vir mostram-se de
       costas, três extra) e mais peso (o preço dobra).

   SÓ O SISTEMA VIRA CARTAS (a lei de 13/11, «nada entra pela IA»):
   `virarCarta` só aceita o veredito de um dado (VEREDITO_DO_SISTEMA), e a
   prosa do Narrador não é veredito. A carta essencial virada devolve o
   facto que o sistema escreve no livro (`escreve`, pela porta de
   PORTA_DA_CARTA) — é por ele que a etapa anda, e não pela narração.

   O QUE VAI AO SAVE: `estado.quadro` (garantirQuadro), um campo NOVO e
   aditivo, que a versão antiga ignora. Guarda só o que o livro de factos
   não sabe: COMO a carta virou (limpa ou com preço, e por que caminho) e
   os caminhos queimados das extra. A essencial virada por outra porta (o
   Cronista, a busca do passo) vê-se pelo próprio livro, sem memória.

   O sistema não fala de si: os textos daqui são de mundo. «Carta», «quadro»
   e «preço» são nomes do bastidor e não aparecem em nenhuma frase.

   PURO E DETERMINÍSTICO. A sorte (que extra, que vantagem, que preço) sai
   da semente do mundo pela quest e pela carta — o mesmo quadro em qualquer
   máquina. O estado recebido nunca é mutado; o `null` e o lixo não lançam.
   ============================================================ */
import { questPorId, avancarQuest, estadoDaQuest, PAPEIS_DA_QUEST } from "./biblioteca-de-quests.js";
import { avaliarCondicao } from "./condicoes-da-quest.js";
import { garantirQuestsDaEspinha } from "./motor/quests-do-turno.js";
import { garantirEsqueleto } from "./esqueleto.js";
import { garantirHistoria } from "./historia.js";
import { garantirRegistroDoVilao, FRAQUEZAS } from "./plano-do-vilao.js";
import { hashSemente, rng } from "./semente.js";
import { noLugarDoPasso } from "./a-quest-manda.js";
import { desafioPorPericia } from "./desafios.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const encher = (molde, v) => String(molde).replace(/\{(\w+)\}/g, (m, k) => (v[k] == null ? "" : String(v[k]))).replace(/\s+/g, " ").trim();
const inteiro = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);

/* ---------------- AS FORMAS ----------------
   O que a carta de costas deixa ver. `costas`: a palavra da forma, que a
   tela e a pauta dizem; `face`: o facto quando a essencial vira (o nome do
   papel em {nome}). */
export const FORMAS_DA_CARTA = Object.freeze({
  lugar: Object.freeze({ costas: "um lugar", face: "o que {nome} escondia" }),
  pessoa: Object.freeze({ costas: "uma pessoa", face: "o que {nome} sabe" }),
  objeto: Object.freeze({ costas: "um objeto", face: "{nome}" }),
});

/* ---------------- AS PISTAS DO PASSO ----------------
   Que átomo de uma etapa é uma carta, e de que forma. `papel`: o prefixo
   do argumento (condicoes-da-quest.js). `entrePistas`: o átomo só é carta
   quando a mesma etapa tem outra pista que não ele — «Ouvir X» é a porta
   da quest, não uma pista; «falar com a testemunha» ao lado de «descobrir
   o que o celeiro esconde» é. No mistério (QUADRO_POR_ARCO.conversaEPista)
   a conversa conta sempre. A contagem acima de um (`conversou X 2`) é um
   laço que se faz com tempo, nunca uma carta. */
export const PISTAS_DO_PASSO = Object.freeze({
  descobriu: Object.freeze({ forma: "lugar", papel: "lugar" }),
  consultou: Object.freeze({ forma: "pessoa", papel: "papel" }),
  tem: Object.freeze({ forma: "objeto", papel: "item" }),
  conversou: Object.freeze({ forma: "pessoa", papel: "papel", entrePistas: true }),
});

/* ---------------- OS CAMINHOS ----------------
   Como se vira uma carta, por forma. `desafios`: os do catálogo
   (desafios.js, DESAFIOS) cujo veredito vira a carta por este caminho;
   `ancora`: o que o caminho precisa que exista — `lugar` (o lugar da
   carta), `pessoa` (a pessoa da carta, viva), `nasce` (o lugar onde o
   objeto nasce, `nasce` na ficha), `cidade` e `nenhuma` (sempre abertos);
   `custa`: o que o caminho cobra mesmo no sucesso, mostrado antes do
   clique; `diz`: o caminho em mundo; `de`: de onde o facto veio, na face.
   TODO caminho de uma forma produz o facto da forma (por isso o livro não
   mente): saber o que um lugar esconde por quem lá vive é descobri-lo;
   pagar a uma pessoa para falar é falar com ela. */
const cam = (id, ancora, desafios, diz, de, custa) => Object.freeze({ id, ancora, desafios: Object.freeze(desafios), diz, de, ...(custa ? { custa: Object.freeze(custa) } : {}) });
export const CAMINHOS_DA_CARTA = Object.freeze({
  lugar: Object.freeze([
    cam("revistar", "lugar", ["buscar", "investigar"], "revistar {nome}", "achado ao revistar {nome}"),
    cam("perguntar", "cidade", ["convencer", "fazer_falar", "impressionar"], "perguntar por {nome} a quem vive perto", "contado por quem vive perto"),
    cam("pagar", "cidade", ["convencer"], "pagar a quem sabe o que {nome} esconde", "comprado a quem sabia", { moedas: 10 }),
    cam("lembrar", "nenhuma", ["lembrar"], "puxar pelo que se conta de {nome}", "lembrado do que se conta"),
  ]),
  pessoa: Object.freeze([
    cam("falar", "pessoa", ["convencer", "impressionar"], "falar com {nome}", "dito por {nome}"),
    cam("apertar", "pessoa", ["intimidar", "fazer_falar"], "apertar {nome} até falar", "arrancado a {nome}"),
    cam("ler", "pessoa", ["mentira"], "ler em {nome} o que cala", "lido na cara de {nome}"),
    cam("pagar", "pessoa", ["convencer"], "pagar a {nome} para falar", "comprado a {nome}", { moedas: 10 }),
  ]),
  objeto: Object.freeze([
    cam("procurar", "nasce", ["buscar", "investigar"], "procurar {nome} onde se guarda", "achado onde se guardava"),
    cam("negociar", "cidade", ["convencer", "impressionar"], "negociar {nome} com quem o tem", "comprado a quem o tinha", { moedas: 20 }),
    cam("tirar", "cidade", ["bater_carteira", "furtar_se"], "tirar {nome} sem ninguém ver", "tirado sem ninguém ver"),
  ]),
});

/* ---------------- O PREÇO DA FALHA ----------------
   A essencial que falha vira na mesma, e cobra um destes. `formas`: em que
   cartas pode cair; `leve`: o preço de quem falhou por pouco
   (QUADRO_DA_QUEST.porPouco); `efeitos`: o que a fiação aplica, cada um
   pela porta que já existe (EFEITOS_DO_PRECO, e EFEITOS_DA_QUEST da
   biblioteca); `linha`: o carimbo da carta, em mundo. No mistério os `n`
   multiplicam-se pelo peso do arco. */
const ef = (tipo, n) => Object.freeze(n == null ? { tipo } : { tipo, n });
export const PRECO_DA_FALHA = Object.freeze({
  tempo: Object.freeze({ formas: Object.freeze(["lugar", "pessoa", "objeto"]), leve: true, efeitos: Object.freeze([ef("minutos", 120)]),
    linha: "Chegaste lá, mas as horas foram-se nisso." }),
  incompleta: Object.freeze({ formas: Object.freeze(["lugar", "pessoa", "objeto"]), leve: true, efeitos: Object.freeze([ef("incompleta"), ef("minutos", 30)]),
    linha: "Tens a metade que importa; o resto ficou por ler." }),
  alerta: Object.freeze({ formas: Object.freeze(["lugar", "pessoa"]), leve: false, efeitos: Object.freeze([ef("avisa_vilao"), ef("relogio_do_fio", 1)]),
    linha: "Tens o que vieste buscar — e alguém viu-te a buscá-lo." }),
  cobra: Object.freeze({ formas: Object.freeze(["pessoa"]), leve: false, efeitos: Object.freeze([ef("moedas", -15)]),
    linha: "Contou tudo, mas só depois de lhe encheres a mão." }),
  danificado: Object.freeze({ formas: Object.freeze(["objeto"]), leve: false, efeitos: Object.freeze([ef("danificado")]),
    linha: "Está nas tuas mãos, mas não inteiro." }),
});

/* Os efeitos do preço que a biblioteca não tem (os outros — avisa_vilao,
   relogio_do_fio, moedas — são de EFEITOS_DA_QUEST e entram pela mesma
   porta que as consequências das quests). `porta`: quem o aplica. */
export const EFEITOS_DO_PRECO = Object.freeze({
  minutos: Object.freeze({ porta: "src/motor/tempo-do-turno.js", diz: "o relógio do mundo anda os minutos perdidos" }),
  danificado: Object.freeze({ porta: "src/motor/aplicar.js", diz: "o objeto entra na bolsa com a marca de danificado" }),
  incompleta: Object.freeze({ porta: null, diz: "só a carta: a face mostra a metade, e a pauta di-lo ao Narrador" }),
});

/* ---------------- A PORTA DE CADA CARTA ----------------
   O facto que a essencial virada escreve, por predicado — é ele que fecha
   o átomo da etapa (o mesmo que o caminho normal escreveria). `porta`: o
   módulo e a função por onde a fiação o escreve. */
export const PORTA_DA_CARTA = Object.freeze({
  descobriu: Object.freeze({ modulo: "src/a-quest-manda.js", funcao: "oLivroDoAchado" }),
  conversou: Object.freeze({ modulo: "src/livro-de-factos.js", funcao: "anotarTurno" }),
  consultou: Object.freeze({ modulo: "src/npcs.js", funcao: "registrarConsulta" }),
  tem: Object.freeze({ modulo: "src/motor/aplicar.js", funcao: "aplicar" }),
});

/* ---------------- AS EXTRA ----------------
   `forma`: a da carta (a fraqueza tem a da família dela: plano-do-vilao.js,
   FRAQUEZAS); `face`: o que mostra virada; `ganho`: o que leva ao
   confronto final (a fiação do confronto é que lhe dá número, Q5);
   `global`: a mesma carta em todos os quadros (a fraqueza é uma só);
   `sobre`: o que se procura, para os caminhos (CAMINHOS_DA_EXTRA) — sem
   nome nenhum, que a carta de costas não diz quem nem o quê. */
export const EXTRAS_DO_QUADRO = Object.freeze({
  fraqueza: Object.freeze({ forma: Object.freeze({ pessoa: "pessoa", coisa: "objeto", verdade: "lugar" }), face: "o que o pode derrubar: {o}", ganho: "fraqueza", global: true, sobre: "o que o pode derrubar" }),
  cumplice: Object.freeze({ forma: "pessoa", face: "quem lhe faz o serviço: {nome}", ganho: "cumplice", global: false, sobre: "quem lhe faz o serviço" }),
  vantagem: Object.freeze({ forma: "lugar", face: "{o}", ganho: "vantagem", global: false, sobre: "como lhe chegar sem ser visto" }),
});

/* Os caminhos de uma extra: investigar, nunca ir direto à coisa (não se
   sabe ainda qual é). Todos de âncora aberta — a extra perde-se por falhar,
   nunca por o mundo não ter onde procurar. */
export const CAMINHOS_DA_EXTRA = Object.freeze([
  cam("perguntar", "cidade", ["convencer", "fazer_falar", "impressionar"], "perguntar por aí {sobre}", "contado por quem sabia"),
  cam("pagar", "cidade", ["convencer"], "pagar a quem sabe {sobre}", "comprado a quem sabia", { moedas: 10 }),
  cam("lembrar", "nenhuma", ["lembrar", "heraldica"], "puxar pelo que se conta: {sobre}", "lembrado do que se conta"),
  cam("seguir", "cidade", ["seguir_alguem", "rastrear"], "seguir quem lhe leva os recados, até {sobre}", "visto ao seguir quem lhe leva os recados"),
]);

/* as vantagens no confronto, em mundo (a extra «vantagem» escolhe uma pela
   semente) */
export const VANTAGENS_DO_CONFRONTO = Object.freeze([
  "a porta das traseiras que ninguém vigia",
  "a hora em que a guarda muda e ninguém olha",
  "o degrau que range, e onde não pôr o pé",
  "a janela alta que dá para o lado de dentro",
  "o caminho velho que chega por trás",
  "quem lá dentro abre a porta por umas moedas",
  "o sítio onde a luz não chega ao fim da tarde",
  "o sinal com que eles se chamam uns aos outros",
]);

/* ---------------- POR ARCO ----------------
   `extras`: quantas extra tem um quadro do tipo 1 (o tipo 2 é do coração,
   não do vilão: nenhuma); `peso`: o multiplicador dos `n` do preço;
   `futuras`: as etapas por vir mostram-se de costas; `conversaEPista`: a
   conversa conta como pista mesmo sozinha. A chave é a estrutura da
   espinha (historia.js, ESTRUTURAS); o resto usa `padrao`. */
export const QUADRO_POR_ARCO = Object.freeze({
  padrao: Object.freeze({ extras: 1, peso: 1, futuras: false, conversaEPista: false }),
  misterio: Object.freeze({ extras: 3, peso: 2, futuras: true, conversaEPista: true }),
});

/* ---------------- OS NÚMEROS DA CASA ----------------
   `porPouco`: falhar por até isto (dc − total) é «por pouco» e cobra só um
   preço leve; `memoria`: o teto de cartas guardadas no save (sai a mais
   velha); `semExtras`: as mãos do vilão cuja quest não leva extra (o
   confronto já é o fim); `id`: o comprimento máximo de uma chave. */
export const QUADRO_DA_QUEST = Object.freeze({
  v: 1,
  porPouco: 2,
  memoria: 64,
  semExtras: Object.freeze(["confronto"]),
  id: 120,
});

/* o veredito que vira cartas: o de um dado do sistema — o desafio, o
   resultado e os dois números que o provam. A prosa não traz isto. */
export const VEREDITO_DO_SISTEMA = Object.freeze({
  resultados: Object.freeze(["sucesso", "falha"]),
  numeros: Object.freeze(["total", "dc"]),
});

/* ---------------- A PAUTA ----------------
   O canal é a pauta DINÂMICA (pauta.js, SECOES com prio; o teto do prompt
   é sagrado e nenhum bloco estático entra). `linha`: o que o herói já sabe
   e quantas coisas faltam, pela forma; `naoPode`: o veto — o Narrador não
   revela o que está de costas. `cartas`: quantas faces cabem na linha;
   `teto`: o comprimento dela. */
export const QUADRO_NA_PAUTA = Object.freeze({
  sabe: "{titulo}: já se sabe {faces}",
  falta: "ainda por saber {formas}",
  junta: "; ",
  naoPode: "revelar o que ainda está por saber em {titulo} ({formas}): isso só se sabe pelo dado",
  cartas: 3,
  teto: 260,
});

/* ---------------- O TESTE NA CARTA (Q2) ----------------
   Que carta, e por que caminho, um teste do sistema vira (aCartaDoTeste).
   Um teste só vira a carta cujo caminho bate com ele, nas três coisas: o
   DESAFIO é um dos do caminho; o SÍTIO da âncora é onde o herói está (o
   lugar da carta, o sítio onde o objeto se guarda, a cidade); e a PESSOA
   da âncora é o `quem` do veredito ou, sem `quem`, está em cena.
     `ordem`: os tipos, por precedência — a essencial da etapa de agora
       antes da extra (a carta que o caso precisa primeiro);
     `precisao`: por âncora; entre dois caminhos que batem, o mais preciso
       ganha (falar COM a pessoa da carta vale mais do que perguntar por um
       lugar a quem passa). Depois disto, a ordem da tabela: o quadro, a
       carta, o caminho — nunca a sorte;
     `assunto`: as âncoras abertas, que batem em qualquer sítio — por isso
       pedem que a frase do teste NOMEIE a coisa da carta (o nome do lugar,
       da pessoa, do objeto; nas extra, o vilão ou a gente do fio). Sem
       isto, todo regatear na praça viraria a carta de um lugar: o portão
       morde só o necessário, e menção é a única prova de que o teste era
       sobre aquilo;
     `pagos`: os caminhos cujo meio É pagar — só batem num teste em que o
       herói já pagou (a conta social com moedas: `custoEmMoedas`), e então
       o custo já foi cobrado por lá (`pago: true`, a fiação não o cobra
       outra vez). Os outros caminhos com custo (negociar) cobram-no como
       preço do que se compra;
     `palavra`/`vazias`: as palavras de um nome que contam para o assunto
       (pelo menos `palavra` letras, e nenhuma das vazias — as que estão em
       mil nomes e não nomeiam nenhum). */
export const CARTA_DO_TESTE = Object.freeze({
  ordem: Object.freeze(["essencial", "extra"]),
  precisao: Object.freeze({ lugar: 2, pessoa: 2, nasce: 2, cidade: 1, nenhuma: 1 }),
  assunto: Object.freeze(["cidade", "nenhuma"]),
  pagos: Object.freeze(["pagar"]),
  palavra: 4,
  vazias: Object.freeze([
    "casa", "rua", "praca", "cidade", "vila", "aldeia", "lugar", "sitio", "velho", "velha", "novo", "nova",
    "grande", "pequeno", "pequena", "senhor", "senhora", "dona", "homem", "mulher", "pessoa", "coisa", "guarda",
    "moeda", "moedas", "prata", "ouro", "dinheiro", "aquele", "aquela", "outro", "outra", "onde", "quem",
  ]),
});

/* As extra não dizem o que escondem, logo o assunto delas é o vilão (nome,
   título, a gente do fio — o juiz da carta); estas palavras só desempatam
   ENTRE extra (quem pergunta «quem lhe faz o serviço» procura o cúmplice).
   Sozinhas, não viram nada. */
export const ASSUNTO_DA_EXTRA = Object.freeze({
  fraqueza: Object.freeze(["fraqueza", "fraco", "fragil", "derrubar", "vencer", "ferir", "matar", "teme"]),
  cumplice: Object.freeze(["cumplice", "capanga", "comparsa", "servico", "recados", "mensageiro", "trabalha"]),
  vantagem: Object.freeze(["entrada", "entrar", "guarda", "vigia", "esconderijo", "covil", "traseiras", "janela", "passagem"]),
});

/* ---------------- O GESTO NA CARTA (Q2) ----------------
   O que vira uma carta SEM dado (aCartaDoGesto): pagar. «A mão que paga não
   erra» (desafios.js, naoPedeDado: o preço é decidido pelo mercado), e por
   isso «pago a quem sabe o que o celeiro esconde» nunca chegava a teste e a
   carta ficava de costas para sempre. O gesto é decidido pelo sistema (as
   moedas na bolsa contra o custo do caminho, da tabela), nunca pela prosa.
   `rx`: o gesto na frase (sem acentos); `caminhos`: os que ele percorre —
   todos com `custa` em CAMINHOS_DA_CARTA. Ir a um sítio e falar com alguém
   não estão aqui: viram a carta pelo livro de factos (a planta, §4). */
export const GESTOS_DA_CARTA = Object.freeze({
  pagar: Object.freeze({
    rx: /\b(suborn\w*|gorjeta|(pago|pagar|pagando|ofereco|oferecer|dou|deixo|entrego|ponho)\s+(\w+\s+){0,3}(moedas?|pratas?|ouro|dinheiro|pecas?))\b/,
    caminhos: Object.freeze(["pagar"]),
  }),
  comprar: Object.freeze({
    rx: /\b(compro|comprar|compra-lo|compra-la|negocio|negociar|troco|trocar)\b/,
    caminhos: Object.freeze(["negociar"]),
  }),
});

/* ============================================================
   A MEMÓRIA — estado.quadro
   { v, cartas: { "<quest>|<carta>": { dia, como, caminho, preco?,
     queimados? } } }
   `como`: "limpa" | "preco" (a carta virou) ou "costas" (a extra ainda não
   virou, com caminhos queimados). Nada mais: o resto é do livro de factos.
   ============================================================ */
const RX_CHAVE = /^[a-z0-9_]{1,40}\|[a-z0-9_:|]{1,100}$/;
const COMOS = ["limpa", "preco", "costas"];
export function garantirQuadro(x) {
  const o = obj(x);
  const cartas = {};
  for (const [k, v] of Object.entries(obj(o && o.cartas) || {})) {
    const c = obj(v);
    if (!c || k.length > QUADRO_DA_QUEST.id || !RX_CHAVE.test(k) || !COMOS.includes(c.como)) continue;
    const caminho = typeof c.caminho === "string" ? c.caminho.slice(0, 20) : "";
    const queimados = [...new Set(arr(c.queimados).filter((q) => typeof q === "string" && q.length <= 20))].slice(0, 8);
    if (c.como === "costas" && !queimados.length) continue;
    cartas[k] = {
      dia: Math.max(0, inteiro(c.dia) || 0), como: c.como, caminho,
      ...(c.como === "preco" && PRECO_DA_FALHA[c.preco] ? { preco: c.preco } : {}),
      ...(queimados.length ? { queimados } : {}),
    };
  }
  const chaves = Object.keys(cartas);
  if (chaves.length > QUADRO_DA_QUEST.memoria) {
    chaves.sort((a, b) => cartas[a].dia - cartas[b].dia);
    for (const k of chaves.slice(0, chaves.length - QUADRO_DA_QUEST.memoria)) delete cartas[k];
  }
  return { v: QUADRO_DA_QUEST.v, cartas };
}

/* ---------------- utilidades da ficha ---------------- */
function etapasDe(F, R) {
  let lista = arr(F.etapas);
  for (const x of arr(R.reviravoltas)) {
    const rv = arr(F.reviravoltas).find((r) => r && r.id === (obj(x) || {}).id);
    for (const e of arr(rv && rv.efeitos)) {
      if (e.tipo !== "abre_etapa" || !obj(e.etapa) || lista.some((l) => l.id === e.etapa.id)) continue;
      const i = lista.findIndex((l) => l.id === e.antes);
      lista = i < 0 ? [...lista, e.etapa] : [...lista.slice(0, i), e.etapa, ...lista.slice(i)];
    }
  }
  return lista;
}
/* os átomos de uma condição, fora dos vetos */
function atomosDe(c, out = []) {
  if (!Array.isArray(c) || !c.length) return out;
  const [p, ...r] = c;
  if (p === "todos" || p === "algum") { for (const x of r) atomosDe(x, out); return out; }
  if (p === "pelo_menos") { for (const x of r.slice(1)) atomosDe(x, out); return out; }
  if (p === "nenhum") return out;
  if (typeof p === "string") out.push(c);
  return out;
}
/* os átomos de uma etapa que são cartas (PISTAS_DO_PASSO) */
function pistasDaEtapa(etapa, arco) {
  const ats = atomosDe(etapa && etapa.conclui).filter((a) => {
    const P = PISTAS_DO_PASSO[a[0]];
    if (!P || typeof a[1] !== "string" || !a[1].startsWith(`${P.papel}:`)) return false;
    return a[2] == null || a[2] === 1;
  });
  const fortes = ats.filter((a) => !PISTAS_DO_PASSO[a[0]].entrePistas);
  return ats.filter((a) => !PISTAS_DO_PASSO[a[0]].entrePistas || arco.conversaEPista || fortes.length > 0);
}
function papeisComTipo(F, R) {
  const out = {};
  for (const [nome, d] of Object.entries(obj(F.papeis) || {})) {
    const tipo = (PAPEIS_DA_QUEST[(obj(d) || {}).de] || {}).tipo;
    if (tipo) out[nome] = { ...(obj(obj(R.papeis) && R.papeis[nome]) || {}), tipo };
  }
  return out;
}
/* Q2: o que o juiz do teste precisa de uma essencial — o nome de verdade
   (o `quem` do catálogo é o nome do registo, não a alcunha) e o visto, a
   cidade, e onde o objeto nasce. A cidade do objeto é a do sítio onde se
   guarda. */
const nomesUnicos = (l) => [...new Set(arr(l).filter((n) => typeof n === "string" && n.trim()).map((n) => n.trim()))];
function juizDaEssencial(p, visto, pn) {
  const cid = (x) => (typeof x === "string" ? x : "");
  const nasce = pn && typeof pn.nome === "string" && pn.nome ? { id: cid(pn.id), nome: pn.nome, cidade: cid(pn.cidade) } : null;
  return { nomes: nomesUnicos([p.nome, visto]), id: cid(p.id), nome: cid(p.nome), cidade: cid(p.cidade) || (nasce ? nasce.cidade : ""), nasce };
}
const arcoDe = (estrutura) => QUADRO_POR_ARCO[estrutura] || QUADRO_POR_ARCO.padrao;
const dadoDe = (semente, ...partes) => rng(hashSemente([String(semente || ""), "quadro", ...partes].join("|")));

/* os caminhos de uma carta que existem neste mundo (a âncora resolvida) */
function caminhosDe(forma, ancoras, vivo) {
  return CAMINHOS_DA_CARTA[forma].filter((c) => {
    if (c.ancora === "lugar") return !!ancoras.lugar;
    if (c.ancora === "pessoa") return !!ancoras.pessoa && vivo;
    if (c.ancora === "nasce") return !!ancoras.nasce;
    return true;
  });
}
/* os preços possíveis de uma carta, pela forma e pela margem */
function precosDe(forma, leve) {
  return Object.keys(PRECO_DA_FALHA).filter((id) => PRECO_DA_FALHA[id].formas.includes(forma) && (!leve || PRECO_DA_FALHA[id].leve));
}

/* ============================================================
   oQuadroDaQuest(quest, estado, opcoes) → null | quadro
   `quest`: o registo da quest (espinha.quests.registos), ou { id } com o
   registo; `opcoes`: { mundo, semente, arco, memoria } — o que faltar sai
   do estado (a semente do esqueleto, a estrutura da espinha, estado.quadro).
   → { quest, titulo, pergunta, tipo, arco, semente,
       cartas: [{ id, chave, tipo: "essencial"|"extra", forma, costas,
                  estado: "costas"|"virada"|"preco"|"perdida",
                  etapa, viravel, futura, sobra, face, de, preco, linha,
                  caminhos: [{ id, diz, desafios, custa?, seFalhar }],
                  escreve? (só a essencial: o átomo e o papel), ganho?,
                  juiz (Q2: os nomes e o sítio de verdade, para
                    aCartaDoTeste — bastidor, NUNCA para a tela: a tela diz
                    `diz`, que já esconde o nome de quem não se viu) }],
       essenciais, viradas, ganhos }
   ============================================================ */
export function oQuadroDaQuest(quest, estado, opcoes) {
  try {
    const R0 = obj(quest);
    const F = R0 && typeof R0.id === "string" ? questPorId(R0.id) : null;
    if (!F) return null;
    const E = obj(estado) || {};
    const o = obj(opcoes) || {};
    const esp = obj(E.espinha) || {};
    const esq = garantirEsqueleto(esp.esqueleto);
    const semente = String(o.semente != null ? o.semente : (esq && esq.semente) || "");
    const estrutura = typeof o.arco === "string" ? o.arco : (typeof esp.estrutura === "string" ? esp.estrutura : "");
    const arco = arcoDe(estrutura);
    const mem = garantirQuadro(o.memoria !== undefined ? o.memoria : E.quadro).cartas;
    const ctx = { estado: E, mundo: obj(o.mundo), quests: arr(o.quests) };
    const R = avancarQuest(F, R0, ctx);
    const v = R ? estadoDaQuest(F, R, ctx) : null;
    if (!R || !v || !v.visivel) return null;
    const papeis = papeisComTipo(F, R);
    const cond = (c) => { try { return !!avaliarCondicao(c, { estado: E, papeis, mundo: obj(o.mundo), quest: R }); } catch { return false; } };
    /* quem é do vilão e o herói ainda não viu diz-se pela alcunha (ou pelo
       rótulo do papel), nunca pelo nome — a mesma régua da biblioteca */
    const nomeVisto = (papel) => {
      const p = obj(papeis[papel]) || {};
      const d = obj(F.papeis[papel]) || {};
      const nome = typeof p.nome === "string" ? p.nome : "";
      if (d.de !== "fio" || cond(["conheceu", `papel:${papel}`])) return nome;
      const molde = typeof d.alcunha === "string" ? d.alcunha : typeof d.rotulo === "string" ? d.rotulo : "";
      return molde.replace(/\{(\w+):([^|}]*)\|[^}]*\}/g, "$2").replace(/\{(\w+)\}/g, (m, k) => ((obj(papeis[k]) || {}).nome || "")).trim();
    };
    const lista = etapasDe(F, R);
    const iAtual = v.etapa ? lista.findIndex((e) => e.id === v.etapa) : lista.length;
    const aberta = R.estado === "aberta" && v.acesa;
    const cartas = [];
    const vistas = new Set();

    /* AS ESSENCIAIS, etapa a etapa: as feitas, a de agora e (no mistério)
       as por vir */
    lista.forEach((etapa, i) => {
      const feita = !!(obj(R.feitas) && R.feitas[etapa.id]);
      const futura = !feita && i > iAtual;
      if (futura && !arco.futuras) return;
      for (const a of pistasDaEtapa(etapa, arco)) {
        const P = PISTAS_DO_PASSO[a[0]];
        const papel = a[1].slice(P.papel.length + 1);
        const k0 = `${a[0]}:${papel}`;
        if (vistas.has(k0)) continue;
        vistas.add(k0);
        const p = obj(papeis[papel]) || {};
        const nome = nomeVisto(papel);
        const def = obj(F.papeis[papel]) || {};
        const pn = P.forma === "objeto" && typeof def.nasce === "string" ? obj(papeis[def.nasce]) || {} : {};
        const nasce = pn.nome || "";
        const vivo = P.forma !== "pessoa" || !cond(["morto", `papel:${papel}`]);
        const ancoras = { lugar: P.forma === "lugar" ? nome : "", pessoa: P.forma === "pessoa" ? nome : "", nasce };
        const id = `${etapa.id}:${k0}`;
        const chave = `${F.id}|${id}`;
        const m = mem[chave];
        const verdade = cond([a[0], a[1]]);
        const est = m && m.como === "preco" ? "preco" : (m && m.como === "limpa") || verdade ? "virada" : "costas";
        const caminho = m && m.caminho ? CAMINHOS_DA_CARTA[P.forma].find((c) => c.id === m.caminho) : null;
        const atual = i === iAtual;
        cartas.push({
          id, chave, tipo: "essencial", forma: P.forma, costas: FORMAS_DA_CARTA[P.forma].costas,
          estado: est, etapa: etapa.id, futura, sobra: feita && est === "costas",
          viravel: aberta && atual && est === "costas",
          face: est === "costas" ? "" : encher(FORMAS_DA_CARTA[P.forma].face, { nome }),
          de: est === "costas" ? "" : caminho ? encher(caminho.de, { nome }) : "",
          preco: est === "preco" && m.preco ? m.preco : null,
          linha: est === "preco" && m.preco ? PRECO_DA_FALHA[m.preco].linha : "",
          caminhos: futura ? [] : caminhosDe(P.forma, ancoras, vivo).map((c) => ({
            id: c.id, diz: encher(c.diz, { nome }), desafios: c.desafios, ...(c.custa ? { custa: c.custa } : {}),
            seFalhar: precosDe(P.forma, false),
          })),
          escreve: { predicado: a[0], papel, tipo: p.tipo, nome, id: typeof p.id === "string" ? p.id : "", ...(typeof p.cidade === "string" ? { cidade: p.cidade } : {}) },
          juiz: juizDaEssencial(p, nome, pn),
        });
      }
    });

    /* AS EXTRA: só no tipo 1, fora do confronto, pela semente */
    const mao = obj(F.mao);
    if (F.tipo === 1 && arco.extras > 0 && !(mao && QUADRO_DA_QUEST.semExtras.includes(mao.tipo))) {
      const usados = new Set(cartas.map((c) => c.escreve.papel));
      const vilao = garantirRegistroDoVilao(obj(esp.fio) && esp.fio.vilao);
      const fr = vilao && vilao.fraqueza ? FRAQUEZAS[vilao.fraqueza.familia].find((x) => x.id === vilao.fraqueza.id) : null;
      const temFraquezaNaFicha = Object.values(F.papeis).some((d) => obj(d) && typeof d.fraqueza === "string");
      const cumplice = Object.entries(F.papeis).find(([nome, d]) => obj(d) && d.de === "fio" && d.papel !== "vilao" && !usados.has(nome) && obj(papeis[nome]) && papeis[nome].nome);
      const possiveis = [];
      if (fr && !temFraquezaNaFicha) possiveis.push({ tipo: "fraqueza", forma: EXTRAS_DO_QUADRO.fraqueza.forma[vilao.fraqueza.familia], o: fr.o, nome: "", id: "vilao|fraqueza" });
      if (cumplice) possiveis.push({ tipo: "cumplice", forma: "pessoa", o: "", nome: papeis[cumplice[0]].nome, papel: cumplice[0], id: `${F.id}|extra:cumplice` });
      const rv = dadoDe(semente, F.id, "vantagem");
      possiveis.push({ tipo: "vantagem", forma: "lugar", o: VANTAGENS_DO_CONFRONTO[Math.floor(rv() * VANTAGENS_DO_CONFRONTO.length)], nome: "", id: `${F.id}|extra:vantagem` });
      /* de quem as extra falam (para o juiz do teste): o vilão e a gente do
         fio, pelo nome e pela alcunha — nunca o que a carta esconde */
      const fio = obj(esp.fio) || {};
      const doVilao = [fio.antagonista, fio.titulo];
      for (const [k, d] of Object.entries(F.papeis)) if (obj(d) && d.de === "fio") doVilao.push((obj(papeis[k]) || {}).nome, nomeVisto(k));
      const juizDaExtra = { nomes: nomesUnicos(doVilao), cidade: "", nasce: null, id: "" };
      const ordem = dadoDe(semente, F.id, "extras");
      const sorteadas = possiveis.map((x) => ({ x, r: ordem() })).sort((a, b) => a.r - b.r).slice(0, arco.extras).map((y) => y.x);
      for (const x of sorteadas) {
        const X = EXTRAS_DO_QUADRO[x.tipo];
        const m = mem[x.id];
        const todos = CAMINHOS_DA_EXTRA;
        const queimados = arr(m && m.queimados);
        const abertos = todos.filter((c) => !queimados.includes(c.id));
        const virou = m && m.como === "limpa";
        const est = virou ? "virada" : abertos.length ? "costas" : "perdida";
        const sobre = X.sobre;
        cartas.push({
          id: `extra:${x.tipo}`, chave: x.id, tipo: "extra", forma: x.forma, costas: FORMAS_DA_CARTA[x.forma].costas,
          estado: est, etapa: null, futura: false, sobra: false,
          viravel: aberta && est === "costas",
          face: est === "virada" ? encher(X.face, { o: x.o, nome: x.nome }) : "",
          de: est === "virada" && m.caminho ? encher((todos.find((c) => c.id === m.caminho) || { de: "" }).de, { sobre }) : "",
          preco: null, linha: "",
          caminhos: abertos.map((c) => ({ id: c.id, diz: encher(c.diz, { sobre }), desafios: c.desafios, ...(c.custa ? { custa: c.custa } : {}), seFalhar: [] })),
          ganho: X.ganho,
          juiz: juizDaExtra,
        });
      }
    }
    const ess = cartas.filter((c) => c.tipo === "essencial");
    return {
      quest: F.id, titulo: F.titulo, tipo: F.tipo,
      pergunta: v.etapaTexto || F.titulo,
      arco: QUADRO_POR_ARCO[estrutura] ? estrutura : "padrao", semente,
      cartas,
      essenciais: ess.length,
      viradas: cartas.filter((c) => c.estado === "virada" || c.estado === "preco").length,
      ganhos: cartas.filter((c) => c.tipo === "extra" && c.estado === "virada").map((c) => c.ganho),
    };
  } catch { return null; }
}

/* ============================================================
   virarCarta(quadro, veredito, contexto) → null | {
     carta, preco, custo, escreve, achado, perdeu, memoria }
   `veredito`: o do dado do sistema (VEREDITO_DO_SISTEMA) — { desafio,
     resultado, total, dc }; a prosa não o é, e não vira nada.
   `contexto`: { carta (o id), caminho (o id), memoria (estado.quadro),
     dia }.
   · a essencial: o sucesso vira-a limpa; a falha vira-a com um preço de
     PRECO_DA_FALHA (leve se falhou por pouco), multiplicado pelo peso do
     arco. Nos dois, `escreve` é o facto que a fiação põe no livro (pela
     PORTA_DA_CARTA), e `achado` o achado do passo para o «descobriu»;
   · a extra: o sucesso vira-a (o `ganho` vai no quadro seguinte); a falha
     queima o caminho (`perdeu`), e sem caminhos a carta perde-se.
   `custo`: o que o caminho cobra (o pagar), também no sucesso. `memoria`:
   o estado.quadro novo. `null`: veredito que não é do sistema, carta que
   não se pode virar agora, caminho que a carta não tem.
   ============================================================ */
export function virarCarta(quadro, veredito, contexto) {
  try {
    const Q = obj(quadro), V = obj(veredito), c = obj(contexto) || {};
    if (!Q || !V) return null;
    if (!VEREDITO_DO_SISTEMA.resultados.includes(V.resultado) || typeof V.desafio !== "string") return null;
    if (!VEREDITO_DO_SISTEMA.numeros.every((n) => typeof V[n] === "number" && Number.isFinite(V[n]))) return null;
    const carta = arr(Q.cartas).find((x) => obj(x) && x.id === c.carta);
    if (!carta || !carta.viravel || carta.estado !== "costas") return null;
    const caminho = arr(carta.caminhos).find((x) => x.id === c.caminho);
    if (!caminho || !arr(caminho.desafios).includes(V.desafio)) return null;
    const mem = garantirQuadro(c.memoria);
    const dia = Math.max(0, inteiro(c.dia) || 0);
    const antes = mem.cartas[carta.chave] || null;
    const custo = caminho.custa ? { ...caminho.custa } : null;
    const sucesso = V.resultado === "sucesso";
    const novaMemoria = (registo) => garantirQuadro({ ...mem, cartas: { ...mem.cartas, [carta.chave]: registo } });

    if (carta.tipo === "extra") {
      if (sucesso) {
        return { carta: { ...carta, estado: "virada", viravel: false }, preco: null, custo, escreve: null, achado: null, perdeu: null,
          memoria: novaMemoria({ dia, como: "limpa", caminho: caminho.id, ...(antes && antes.queimados ? { queimados: antes.queimados } : {}) }) };
      }
      const queimados = [...new Set([...arr(antes && antes.queimados), caminho.id])];
      const restam = arr(carta.caminhos).filter((x) => !queimados.includes(x.id));
      return { carta: { ...carta, estado: restam.length ? "costas" : "perdida", viravel: restam.length > 0, caminhos: restam }, preco: null, custo: null, escreve: null, achado: null, perdeu: caminho.id,
        memoria: novaMemoria({ dia, como: "costas", caminho: "", queimados }) };
    }

    /* a essencial: vira sempre */
    let preco = null;
    if (!sucesso) {
      const leve = V.dc - V.total <= QUADRO_DA_QUEST.porPouco;
      const ids = precosDe(carta.forma, leve);
      const id = ids[Math.floor(dadoDe(Q.semente, Q.quest, carta.id, "preco")() * ids.length)];
      const peso = arcoDe(Q.arco).peso;
      const P = PRECO_DA_FALHA[id];
      preco = { id, linha: P.linha, efeitos: P.efeitos.map((e) => (e.n == null ? { ...e } : { ...e, n: e.n * peso })) };
    }
    const w = carta.escreve || {};
    const achado = w.predicado === "descobriu" && w.nome
      ? { especie: "passo", lugar: { id: w.id, nome: w.nome, cidade: w.cidade || "" }, quest: Q.quest, etapa: carta.etapa }
      : null;
    const def = arr(CAMINHOS_DA_CARTA[carta.forma]).find((x) => x.id === caminho.id) || { de: "" };
    return {
      carta: { ...carta, estado: sucesso ? "virada" : "preco", viravel: false, preco: preco ? preco.id : null, linha: preco ? preco.linha : "",
        face: encher(FORMAS_DA_CARTA[carta.forma].face, { nome: w.nome || "" }), de: encher(def.de, { nome: w.nome || "" }) },
      preco, custo, escreve: { ...w, porta: PORTA_DA_CARTA[w.predicado] || null }, achado, perdeu: null,
      memoria: novaMemoria({ dia, como: sucesso ? "limpa" : "preco", caminho: caminho.id, ...(preco ? { preco: preco.id } : {}) }),
    };
  } catch { return null; }
}

/* ============================================================
   osQuadrosDoEstado(estado, opcoes) → [quadro]
   Os quadros das quests que a pauta do Narrador vê (a mesma régua de
   `osPassosDasQuests`, a-quest-manda.js): a do ato, se não saiu, e as do
   coração abertas. Sem cartas, sem quadro. Campanha antiga: [].
   ============================================================ */
export function osQuadrosDoEstado(estado, opcoes) {
  try {
    const E = obj(estado);
    const esp = E && obj(E.espinha);
    const esq = esp ? garantirEsqueleto(esp.esqueleto) : null;
    if (!esq) return [];
    const h = garantirHistoria(E.historia);
    const Q = garantirQuestsDaEspinha(esp.quests);
    const doAto = arr(esq.atos).find((a) => a && a.ato === h.etapa) || null;
    const daVez = doAto && doAto.quest && !arr(Q.fora).some((f) => f && f.id === doAto.quest) ? doAto.quest : null;
    const o = { ...(obj(opcoes) || {}), quests: Q.registos };
    return Q.registos
      .filter((r) => r && r.estado === "aberta" && (r.id === daVez || r.tipo === 2))
      .map((r) => oQuadroDaQuest(r, E, o))
      .filter((q) => q && q.cartas.length);
  } catch { return []; }
}

/* ============================================================
   oQuadroNaPauta(quadros) → { linha, naoPode }
   O que o herói já sabe (as faces viradas, até QUADRO_NA_PAUTA.cartas por
   quadro, com a metade dita quando o preço foi a incompleta) e o que falta
   pela forma; o veto, quando há cartas de costas. Para uma secção da pauta
   dinâmica (a fiação escolhe a prio): nunca um bloco estático.
   ============================================================ */
export function oQuadroNaPauta(quadros) {
  try {
    const N = QUADRO_NA_PAUTA;
    const partes = [], vetos = [];
    for (const q of arr(quadros)) {
      const Q = obj(q);
      if (!Q) continue;
      const cs = arr(Q.cartas).filter((c) => obj(c) && !c.futura && !c.sobra);
      const faces = cs.filter((c) => c.estado === "virada" || c.estado === "preco").slice(-N.cartas)
        .map((c) => (c.preco === "incompleta" ? `${c.face} (pela metade)` : c.face)).filter(Boolean);
      const formas = cs.filter((c) => c.estado === "costas").map((c) => c.costas);
      const bits = [];
      if (faces.length) bits.push(encher(N.sabe, { titulo: Q.titulo, faces: faces.join(", ") }));
      if (formas.length) bits.push(faces.length ? encher(N.falta, { formas: formas.join(", ") }) : `${Q.titulo}: ${encher(N.falta, { formas: formas.join(", ") })}`);
      if (bits.length) partes.push(bits.join(", "));
      if (formas.length) vetos.push(encher(N.naoPode, { titulo: Q.titulo, formas: formas.join(", ") }));
    }
    let linha = partes.join(N.junta);
    if (linha.length > N.teto) linha = `${linha.slice(0, N.teto - 1).replace(/\s+\S*$/, "")}…`;
    return { linha, naoPode: vetos };
  } catch { return { linha: "", naoPode: [] }; }
}

/* ============================================================
   O JUIZ DO TESTE (Q2) — que carta, e por que caminho
   ============================================================ */
const semAc = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const semArtigo = (s) => semAc(s).replace(/^(o|a|os|as)\s+/, "").trim();
const palavrasDe = (s) => semAc(s).split(/[^a-z0-9]+/).filter(Boolean);
/* a frase nomeia um destes nomes? (uma palavra do nome que nomeia) */
function nomeia(texto, nomes) {
  const T = CARTA_DO_TESTE;
  const ws = new Set(palavrasDe(texto));
  if (!ws.size) return false;
  return arr(nomes).some((n) => palavrasDe(n).some((w) => w.length >= T.palavra && !T.vazias.includes(w) && ws.has(w)));
}
/* a definição de um caminho de uma carta, na tabela (é ela que diz a âncora) */
function defDoCaminho(carta, id) {
  const lista = carta.tipo === "extra" ? CAMINHOS_DA_EXTRA : arr(CAMINHOS_DA_CARTA[carta.forma]);
  return lista.find((c) => c.id === id) || null;
}
/* quem está em cena, pelo nome sem artigo (strings ou { nome }) */
const aCena = (l) => new Set(arr(l).map((x) => semArtigo(typeof x === "string" ? x : (obj(x) || {}).nome)).filter(Boolean));
/* o caminho bate com o que o herói faz, onde e com quem? (fora o desafio) */
function aAncoraBate(carta, def, ctx) {
  const j = obj(carta.juiz) || {};
  const nomes = arr(j.nomes).map(semArtigo).filter(Boolean);
  const o = ctx.onde;
  let ok = false;
  if (def.ancora === "lugar") ok = !!j.nome && noLugarDoPasso({ id: j.id, nome: j.nome, cidade: j.cidade }, o);
  else if (def.ancora === "nasce") ok = !!(j.nasce && noLugarDoPasso(j.nasce, o));
  else if (def.ancora === "pessoa") ok = ctx.quem ? nomes.includes(ctx.quem) : nomes.some((n) => ctx.cena.has(n));
  else if (def.ancora === "cidade") ok = !!semArtigo(o.cidade) && (!j.cidade || semArtigo(j.cidade) === semArtigo(o.cidade));
  else if (def.ancora === "nenhuma") ok = true;
  if (!ok) return false;
  if (CARTA_DO_TESTE.assunto.includes(def.ancora) && !nomeia(ctx.texto, j.nomes)) return false;
  return true;
}
/* as cartas que se podem virar agora, com o índice do quadro e da carta */
function asViraveis(quadros) {
  const out = [];
  arr(quadros).forEach((q, qi) => {
    const Q = obj(q);
    if (!Q || typeof Q.quest !== "string") return;
    arr(Q.cartas).forEach((c, ci) => {
      const C = obj(c);
      if (C && C.viravel && C.estado === "costas" && CARTA_DO_TESTE.ordem.includes(C.tipo)) out.push({ Q, C, qi, ci });
    });
  });
  return out;
}
/* a escolha: o tipo, a precisão, (o pago), a afinidade da extra, e a ordem
   da tabela — tudo determinístico, nada de sorte */
function oMelhor(cands) {
  const T = CARTA_DO_TESTE;
  const chave = (x) => [T.ordem.indexOf(x.C.tipo), -(T.precisao[x.def.ancora] || 0), x.pagoRank, x.afinidade, x.qi, x.ci, x.ki];
  return cands.slice().sort((a, b) => {
    const ka = chave(a), kb = chave(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return 0;
  })[0] || null;
}
const afinidadeDe = (C, texto) => {
  if (C.tipo !== "extra") return 0;
  const tipo = String(C.id || "").replace(/^extra:/, "");
  const ws = new Set(palavrasDe(texto));
  return arr(ASSUNTO_DA_EXTRA[tipo]).some((w) => ws.has(w)) ? 0 : 1;
};

/* ============================================================
   aCartaDoTeste(quadros, veredito, onde) → null | {
     quest, carta, caminho, veredito, pago }
   `quadros`: os de osQuadrosDoEstado (com a memória dentro: o caminho
     queimado já não está na carta, e a carta virada já não se vira).
   `veredito`: o do catálogo (lerAcao, desafios.js — `id`, `pericia`,
     `quem`/`pessoa`, `sobre`, `social`), com o resultado do dado:
     `resultado` ("sucesso"|"falha") ou `passou` (boolean), e `total`/`dc`;
     `frase`: a frase do jogador (o assunto das âncoras abertas).
   `onde`: { lugar, dentroDe, cidade, foraDosMuros } (a forma de
     `ondeDoPasso`, App.jsx) e `emCena` (os nomes de quem está à vista).
   → o quadro (`quest`), a carta e o caminho (os ids), e o veredito já na
     forma de virarCarta ({ desafio, resultado, total, dc }) — a fiação
     chama virarCarta com eles, e é ela que decide o preço da falha (por
     pouco ou seca, na essencial) ou queima o caminho (na extra). `pago`:
     o caminho era pagar e o teste já cobrou as moedas (não cobrar o custo
     outra vez). `null`: o teste não bate com carta nenhuma, e o turno segue
     como hoje.
   ============================================================ */
export function aCartaDoTeste(quadros, veredito, onde) {
  try {
    const V = obj(veredito);
    if (!V) return null;
    const resultado = VEREDITO_DO_SISTEMA.resultados.includes(V.resultado) ? V.resultado
      : typeof V.passou === "boolean" ? (V.passou ? "sucesso" : "falha") : null;
    if (!resultado || !VEREDITO_DO_SISTEMA.numeros.every((n) => typeof V[n] === "number" && Number.isFinite(V[n]))) return null;
    const desafio = typeof V.id === "string" && V.id ? V.id
      : typeof V.desafio === "string" && V.desafio ? V.desafio
      : typeof V.pericia === "string" && V.pericia ? ((desafioPorPericia(V.pericia) || {}).id || "") : "";
    if (!desafio) return null;
    const o = obj(onde) || {};
    const social = obj(V.social);
    const pagou = !!(social && Number(social.custoEmMoedas) > 0);
    const ctx = {
      onde: o, cena: aCena(o.emCena),
      quem: semArtigo(typeof V.quem === "string" && V.quem ? V.quem : (obj(V.pessoa) || {}).nome),
      texto: [V.frase, V.sobre, o.frase].filter((x) => typeof x === "string").join(" "),
    };
    const cands = [];
    for (const x of asViraveis(quadros)) {
      arr(x.C.caminhos).forEach((k, ki) => {
        const K = obj(k);
        if (!K || !arr(K.desafios).includes(desafio)) return;
        const def = defDoCaminho(x.C, K.id);
        if (!def) return;
        const doPago = CARTA_DO_TESTE.pagos.includes(def.id);
        if (doPago && !pagou) return;
        if (!aAncoraBate(x.C, def, ctx)) return;
        cands.push({ ...x, K, def, ki, pagoRank: pagou ? (doPago ? 0 : 1) : 0, afinidade: afinidadeDe(x.C, ctx.texto) });
      });
    }
    const m = oMelhor(cands);
    if (!m) return null;
    return {
      quest: m.Q.quest, carta: m.C.id, caminho: m.K.id,
      veredito: { desafio, resultado, total: V.total, dc: V.dc },
      pago: CARTA_DO_TESTE.pagos.includes(m.def.id) && pagou,
    };
  } catch { return null; }
}

/* ============================================================
   aCartaDoGesto(quadros, gesto, onde) → null | {
     quest, carta, caminho, gesto, veredito, pago }
   O irmão de aCartaDoTeste para o gesto sem dado (GESTOS_DA_CARTA): pagar a
   quem sabe, comprar a quem tem. `gesto`: { frase, quem, moedas } — a frase
   do jogador, com quem fala, e as moedas na bolsa. As âncoras e o assunto
   são os mesmos do teste; a bolsa tem de cobrir o custo do caminho.
   `veredito`: o do sistema, na forma de virarCarta — o sucesso, com o
   custo como número a bater e como total (pagou-o, e a mão que paga não
   erra). `pago: false`: o custo (virarCarta → `custo`) cobra-se agora.
   ============================================================ */
export function aCartaDoGesto(quadros, gesto, onde) {
  try {
    const G = obj(gesto);
    if (!G || typeof G.frase !== "string") return null;
    const frase = semAc(G.frase);
    const id = Object.keys(GESTOS_DA_CARTA).find((k) => GESTOS_DA_CARTA[k].rx.test(frase));
    if (!id) return null;
    const moedas = typeof G.moedas === "number" && Number.isFinite(G.moedas) ? G.moedas : 0;
    const o = obj(onde) || {};
    const ctx = { onde: o, cena: aCena(o.emCena), quem: semArtigo(G.quem), texto: G.frase };
    const cands = [];
    for (const x of asViraveis(quadros)) {
      arr(x.C.caminhos).forEach((k, ki) => {
        const K = obj(k);
        if (!K || !GESTOS_DA_CARTA[id].caminhos.includes(K.id)) return;
        const def = defDoCaminho(x.C, K.id);
        const preco = def && def.custa ? inteiro(def.custa.moedas) : null;
        if (preco == null || moedas < preco || !arr(K.desafios).length) return;
        if (!aAncoraBate(x.C, def, ctx)) return;
        cands.push({ ...x, K, def, ki, preco, pagoRank: 0, afinidade: afinidadeDe(x.C, G.frase) });
      });
    }
    const m = oMelhor(cands);
    if (!m) return null;
    return {
      quest: m.Q.quest, carta: m.C.id, caminho: m.K.id, gesto: id,
      veredito: { desafio: m.K.desafios[0], resultado: "sucesso", total: m.preco, dc: m.preco },
      pago: false,
    };
  } catch { return null; }
}
