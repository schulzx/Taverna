/* ============================================================
   A CRIAÇÃO DA MESA (V5 · F3 de mente/formas.md, 16/11/2026) — Taverna

   «Sentar à mesa» em um toque: o sistema sorteia o mundo e o herói pela
   SEMENTE e mostra tudo pronto; quem quer escolher toca «trocar» só no
   campo que quer mudar. Este módulo é a conta — puro, provado em Node
   (testes/teste-criacao-da-mesa.mjs); as telas moram em
   `painel-chegada.jsx` e `painel-criacao.jsx`, e a ficha final sai de
   `ficha-da-criacao.js`, a MESMA conta que a criação antiga usa.

   As leis que valem aqui:
   · determinismo — cada campo tira o seu fio da semente (`fio(semente,
     campo)`), logo trocar a raça não mexe no nome, nos pontos nem no
     mundo, e a mesma semente dá a mesma mesa em qualquer máquina;
   · nenhum texto obrigatório — o conceito é escrito pelo sistema a partir
     do antecedente; o nome sai do banco do gênero e OUVE O SEXO;
   · o que a criação produz é o que a criação antiga podia produzir: as
     escolhas são as das mesmas tabelas (RACAS/ORIGENS, CLASSES,
     PROFISSOES, ANTECEDENTES, GENEROS, moldes, espinhas, VOZES), e os
     pontos obedecem a PONTOS_TOTAIS e ATRIBUTO_MAX_CRIACAO.
   ============================================================ */

import { CLASSES, PROFISSOES, racasDoGenero } from "./classes.js";
import { ANTECEDENTES } from "./antecedentes.js";
import { VOZES } from "./vozes.js";
import { moldesDisponiveis } from "./moldes.js";
import { ESTRUTURAS } from "./historia.js";
import { GENEROS, ATRIBUTOS, PONTOS_TOTAIS, ATRIBUTO_MAX_CRIACAO } from "./constantes.js";
import { nomePessoa } from "./nomes.js";
import { hashSemente, rng } from "./semente.js";
import { aSessaoParaLembrar, oResumoDaSessao, osFatosDaUltimaVez } from "./registro-da-sessao.js";

/* ---------------- as tabelas do sorteio ----------------
   `generos`: de onde o sorteio tira o mundo. Só a fantasia, de propósito:
   é o mundo das 240 pinturas sem tradução (as origens futuristas caem na
   pintura humana), e a primeira mesa de quem chega tem de ser a mais
   bonita. Os outros seis estão a um «trocar» de distância.
   `sexos`: os dois que a ficha conhece (o retrato lê daqui).
   `partilha`: como os seis pontos se põem pela ordem da classe. */
export const SORTEIO_DA_MESA = Object.freeze({
  generos: Object.freeze(["fantasia"]),
  sexos: Object.freeze(["mulher", "homem"]),
  partilha: Object.freeze([3, 2, 1]),
});

/* A ORDEM DOS ATRIBUTOS POR CLASSE: o primeiro é o `atributoChave` de
   `CLASSES` (a suíte prende), os dois seguintes são o que a classe usa a
   seguir. É daqui que «o Mestre põe os pontos» lê. */
export const ATRIBUTOS_POR_CLASSE = Object.freeze({
  "Guerreiro": ["forca", "vigor", "destreza"],
  "Mago": ["intelecto", "percepcao", "presenca"],
  "Ladino": ["destreza", "percepcao", "vigor"],
  "Clérigo": ["presenca", "vigor", "intelecto"],
  "Caçador": ["percepcao", "destreza", "vigor"],
  "Bardo": ["presenca", "destreza", "percepcao"],
  "Monge": ["destreza", "vigor", "percepcao"],
  "Druida": ["intelecto", "percepcao", "vigor"],
  "Feiticeiro": ["presenca", "intelecto", "vigor"],
  "Bruxo": ["presenca", "intelecto", "vigor"],
  "Engenheiro": ["intelecto", "destreza", "percepcao"],
  "Invocador": ["intelecto", "presenca", "vigor"],
});

/* O NOME NO FEMININO — a carta diz «Humana ladina», não «Humano ladino».
   Só o que muda; o resto fica como está (Halfling, Druida, Tiefling). */
export const NO_FEMININO = Object.freeze({
  "Humano": "Humana", "Elfo": "Elfa", "Anão": "Anã", "Draconato": "Draconata", "Gnomo": "Gnoma",
  "Meio-elfo": "Meio-elfa", "Goliath": "Golias",
  "Guerreiro": "Guerreira", "Mago": "Maga", "Ladino": "Ladina", "Clérigo": "Clériga", "Caçador": "Caçadora",
  "Bardo": "Barda", "Monge": "Monja", "Feiticeiro": "Feiticeira", "Bruxo": "Bruxa", "Engenheiro": "Engenheira",
  "Invocador": "Invocadora",
  "Terrano": "Terrana", "Colono Orbital": "Colona Orbital", "Sintético": "Sintética", "Mutante": "Mutante", "Cromado": "Cromada",
  "Órfão da Estrada": "Órfã da Estrada", "Soldado Reformado": "Soldada Reformada", "Erudito de Arquivo": "Erudita de Arquivo",
  "Filho da Guilda dos Dedos": "Filha da Guilda dos Dedos", "Acólito Fugitivo": "Acólita Fugitiva",
  "Caçador de Recompensas": "Caçadora de Recompensas", "Herdeiro da Forja": "Herdeira da Forja",
  "Ex-Cultista Arrependido": "Ex-Cultista Arrependida",
});

/* O QUE O PRÓXIMO PONTO MUDA (o pedido do desenho, F3 §3): uma frase por
   atributo, lida das regras que existem (vida = base + vigor × 2; mana =
   base + intelecto × 2; o resto é o bônus do teste). */
export const POR_PONTO = Object.freeze({
  forca: "+1 nos golpes e nos testes de força bruta.",
  destreza: "+1 na pontaria, na esquiva e no que pede mão leve.",
  vigor: "+2 de vida máxima e +1 para aguentar veneno e cansaço.",
  intelecto: "+2 de mana máxima e +1 no que pede estudo.",
  presenca: "+1 para convencer, enganar e mandar.",
  percepcao: "+1 para ver a emboscada antes de ela ver você.",
});

/* O nome que o sorteio dá à campanha (a tela do mundo já não o pede) */
export const NOME_DA_CAMPANHA = Object.freeze({ prefixo: "A lenda de" });

const lista = (x) => (Array.isArray(x) ? x : []);
/* o fio de um campo: um gerador próprio por campo e por vez */
export function fio(semente, campo, vez = 0) {
  return rng(hashSemente(`${String(semente ?? "")}|${campo}|${vez}`));
}
const tirar = (r, arr) => arr[Math.floor(r() * arr.length)];

export const generoPorId = (id) => GENEROS.find((g) => g.id === id) || GENEROS[0];
export const generosDaCriacao = () => GENEROS;
export const espinhasDaCriacao = () => ESTRUTURAS.filter((e) => e.espinha);
export const racasDaCriacao = (generoId) => racasDoGenero(generoPorId(generoId).label);

/* a palavra no sexo do herói */
export function noSexo(palavra, sexo) {
  const p = String(palavra || "");
  return sexo === "mulher" ? NO_FEMININO[p] || p : p;
}

/* ---------------- os pontos ---------------- */
export const pontosVazios = () => Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0]));
export const pontosUsados = (pontos) => ATRIBUTOS.reduce((s, a) => s + ((pontos && pontos[a.id]) || 0), 0);
export const pontosRestantes = (pontos) => PONTOS_TOTAIS - pontosUsados(pontos);

export function ordemDaClasse(classe) {
  const o = ATRIBUTOS_POR_CLASSE[classe] || [];
  return [...o, ...ATRIBUTOS.map((a) => a.id).filter((id) => !o.includes(id))];
}

/* a regra da classe: 3 no primeiro, 2 no segundo, 1 no terceiro (= 6) */
export function distribuirPorClasse(classe) {
  const p = pontosVazios();
  ordemDaClasse(classe).forEach((id, i) => { p[id] = SORTEIO_DA_MESA.partilha[i] || 0; });
  return p;
}

/* − e +: devolve os pontos novos, ou OS MESMOS (identidade) se não pode */
export function ajustarPonto(pontos, id, d) {
  const atual = (pontos && pontos[id]) || 0;
  const nv = atual + d;
  if (nv < 0 || nv > ATRIBUTO_MAX_CRIACAO) return pontos;
  if (d > 0 && pontosRestantes(pontos) <= 0) return pontos;
  return { ...pontos, [id]: nv };
}

/* por que o − ou o + não anda (null = anda) — a razão vai escrita na peça */
export function razaoDoPonto(pontos, id, d) {
  const atual = (pontos && pontos[id]) || 0;
  if (d < 0 && atual <= 0) return "Já está no piso.";
  if (d > 0 && atual >= ATRIBUTO_MAX_CRIACAO) return `No teto da criação (+${ATRIBUTO_MAX_CRIACAO}).`;
  if (d > 0 && pontosRestantes(pontos) <= 0) return "Sem pontos na mão.";
  return null;
}

/* «o Mestre põe os que faltam»: pela ordem da classe, até acabar */
export function porOsQueFaltam(pontos, classe) {
  let p = { ...pontosVazios(), ...(pontos || {}) };
  for (const id of ordemDaClasse(classe)) {
    while (pontosRestantes(p) > 0 && p[id] < ATRIBUTO_MAX_CRIACAO) p = { ...p, [id]: p[id] + 1 };
  }
  return p;
}

/* o valor final de cada atributo: o ponto + o bônus da raça (como a ficha) */
export function atributosComRaca(pontos, raca) {
  const r = racasDoGenero("").concat(racasDoGenero("Ficção científica")).find((x) => x.nome === raca);
  const bonus = (r && r.bonus) || {};
  return Object.fromEntries(ATRIBUTOS.map((a) => [a.id, ((pontos && pontos[a.id]) || 0) + (bonus[a.id] || 0)]));
}

/* ---------------- o nome e o conceito ---------------- */
export function nomeSorteado(semente, generoId, sexo, vez = 0) {
  const s = sexo === "mulher" ? "fem" : "masc";
  return String(nomePessoa(generoPorId(generoId).label, s, fio(semente, "nome", vez), null) || "").trim();
}

/* conserto V7/V8 (19/11): a sessão jogada leu «Ladina golias, acólita
   Fugitiva» na crônica — a ordem e a caixa trocadas. A forma é a que o
   comentário de NO_FEMININO sempre disse: «Humana ladina» (a raça primeiro,
   o caminho depois, em minúscula), e o antecedente todo em minúscula, menos o
   que vem depois de «da/do/das/dos» (a Guilda dos Dedos, a Estrada, a Forja:
   nomes próprios). Vale para o herói que nasce agora; o conceito de quem já
   nasceu está no save e fica como está. */
const ARTIGO_DO_NOME_PROPRIO = Object.freeze(["da", "do", "das", "dos"]);
function antecedenteEmMinuscula(nome) {
  let proprio = false;
  return String(nome || "").split(" ").map((p) => {
    if (ARTIGO_DO_NOME_PROPRIO.includes(p.toLowerCase())) { proprio = true; return p.toLowerCase(); }
    return proprio ? p : p.toLowerCase();
  }).join(" ");
}
export function conceitoDoSistema({ classe, raca, sexo, antecedenteId } = {}) {
  const a = ANTECEDENTES.find((x) => x.id === antecedenteId) || ANTECEDENTES[0];
  const quem = [noSexo(raca, sexo), String(noSexo(classe, sexo) || "").toLowerCase()].filter(Boolean).join(" ");
  return `${quem}, ${antecedenteEmMinuscula(noSexo(a.nome, sexo))}`;
}

export function antecedenteDaMesa(id) {
  return ANTECEDENTES.find((x) => x.id === id) || ANTECEDENTES[0];
}

/* ---------------- o sorteio inteiro ----------------
   `nomeEscrito` / `conceitoEscrito`: o jogador escreveu por cima? Então
   o sistema não o reescreve ao trocar o sexo ou o antecedente. */
export function sortearMesa(semente) {
  const s = String(semente ?? "");
  const generoId = tirar(fio(s, "genero"), SORTEIO_DA_MESA.generos);
  const racas = racasDaCriacao(generoId);
  const raca = tirar(fio(s, "raca"), racas).nome;
  const classeObj = tirar(fio(s, "classe"), CLASSES);
  const sexo = tirar(fio(s, "sexo"), SORTEIO_DA_MESA.sexos);
  const antecedenteId = tirar(fio(s, "antecedente"), ANTECEDENTES).id;
  const heroi = {
    raca, classe: classeObj.nome, subclasse: classeObj.subclasses[0].nome,
    profissao: tirar(fio(s, "profissao"), PROFISSOES).nome,
    sexo, nome: nomeSorteado(s, generoId, sexo, 0), vezDoNome: 0, nomeEscrito: false,
    antecedenteId, pontos: distribuirPorClasse(classeObj.nome),
    conceito: "", conceitoEscrito: false,
  };
  heroi.conceito = conceitoDoSistema(heroi);
  const espinhas = espinhasDaCriacao();
  const mundo = {
    generoId,
    molde: tirar(fio(s, "molde"), moldesDisponiveis()).id,
    estrutura: tirar(fio(s, "estrutura"), espinhas).id,
    voz: tirar(fio(s, "voz"), VOZES).id,
  };
  return { semente: s, mundo, heroi };
}

/* ---------------- trocar (o que não foi tocado, fica) ---------------- */
export function trocarNoHeroi(mesa, campo, valor) {
  const h = { ...mesa.heroi, [campo]: valor };
  if (campo === "classe") {
    const c = CLASSES.find((x) => x.nome === valor) || CLASSES[0];
    h.subclasse = c.subclasses[0].nome;
  }
  if (campo === "sexo" && !h.nomeEscrito) h.nome = nomeSorteado(mesa.semente, mesa.mundo.generoId, valor, h.vezDoNome);
  if (campo === "nome") h.nomeEscrito = String(valor || "").trim() !== "";
  if (campo === "conceito") h.conceitoEscrito = String(valor || "").trim() !== "";
  if (!h.conceitoEscrito && ["classe", "raca", "sexo", "antecedenteId"].includes(campo)) h.conceito = conceitoDoSistema(h);
  return { ...mesa, heroi: h };
}

export function outroNome(mesa) {
  const vez = (mesa.heroi.vezDoNome || 0) + 1;
  return { ...mesa, heroi: { ...mesa.heroi, vezDoNome: vez, nomeEscrito: false, nome: nomeSorteado(mesa.semente, mesa.mundo.generoId, mesa.heroi.sexo, vez) } };
}

/* trocar o gênero muda o povo: a raça que não existe no mundo novo cai na primeira dele */
export function trocarNoMundo(mesa, campo, valor) {
  const mundo = { ...mesa.mundo, [campo]: valor };
  let m = { ...mesa, mundo };
  if (campo === "generoId") {
    const racas = racasDaCriacao(valor);
    if (!racas.some((r) => r.nome === mesa.heroi.raca)) m = trocarNoHeroi(m, "raca", racas[0].nome);
    if (!m.heroi.nomeEscrito) m = { ...m, heroi: { ...m.heroi, nome: nomeSorteado(m.semente, valor, m.heroi.sexo, m.heroi.vezDoNome) } };
  }
  return m;
}

/* a próxima/anterior de uma lista, em roda (as setas das cartas) */
export function vizinho(arr, atual, d) {
  const l = lista(arr);
  if (!l.length) return atual;
  const i = Math.max(0, l.indexOf(atual));
  return l[(i + d + l.length) % l.length];
}

/* ---------------- o que sai da mesa ----------------
   `mundoDaMesa`: exatamente a forma que a tela antiga do mundo entregava
   a `concluir(m, nome)` — os textos livres vazios, a apresentação na
   clássica (a mesma que a tela antiga trazia marcada). */
export function mundoDaMesa(mesa) {
  const m = mesa.mundo;
  return { genero: generoPorId(m.generoId).label, descricao: "", estrutura: m.estrutura, molde: m.molde, voz: m.voz, apresentacao: "estrita", limites: "" };
}

export function nomeDaCampanhaDaMesa(mesa) {
  const primeiro = String(mesa.heroi.nome || "").trim().split(/\s+/)[0] || "alguém";
  return `${NOME_DA_CAMPANHA.prefixo} ${primeiro}`;
}

/* as escolhas que `montarFicha` (ficha-da-criacao.js) recebe */
export function escolhasDaMesa(mesa) {
  const h = mesa.heroi;
  const partes = String(h.nome || "").trim().split(/\s+/).filter(Boolean);
  return {
    nome: partes[0] || "", sobrenome: partes.slice(1).join(" "), sexo: h.sexo,
    /* o conceito é opcional na mesa, e obrigatório na ficha antiga: vazio, vai o do sistema */
    conceito: String(h.conceito || "").trim() || conceitoDoSistema(h), historia: "",
    raca: h.raca, classe: h.classe, subclasse: h.subclasse, profissao: h.profissao,
    antecedenteId: h.antecedenteId, pontos: { ...h.pontos },
    numeroDaSorte: hashSemente(`${mesa.semente}|sorte`) % 100000,
  };
}

/* «Começar» está impedido? A razão, ou null */
export function razaoDeNaoComecar(mesa) {
  const r = pontosRestantes(mesa.heroi.pontos);
  if (r > 0) return r > 1 ? `Faltam ${r} pontos por pôr.` : "Falta 1 ponto por pôr.";
  if (r < 0) return "Há pontos a mais.";
  if (!String(mesa.heroi.nome || "").trim()) return "Falta o nome.";
  return null;
}

/* ---------------- o save, visto da porta ----------------
   A chegada lê o save CRU (sem a migração inteira, que mora no App) só
   para pintar a carta e o «Anteriormente». `estado`: "nenhum" (primeira
   visita), "campanha" (quem volta) ou "naoAbre" (JSON quebrado, ou de uma
   versão mais nova do que a desta página). Nunca lança. */
export function resumoDoSave(bruto, versaoConhecida = 2) {
  if (bruto == null || bruto === "") return { estado: "nenhum" };
  let sv = null;
  try { sv = JSON.parse(bruto); } catch { return { estado: "naoAbre", motivo: "quebrado" }; }
  if (!sv || typeof sv !== "object" || Array.isArray(sv)) return { estado: "naoAbre", motivo: "quebrado" };
  if (Number(sv.versao) > versaoConhecida) return { estado: "naoAbre", motivo: "nova" };
  const p = sv.personagem && typeof sv.personagem === "object" ? sv.personagem : null;
  if (!p || !p.nome) return { estado: "nenhum" };
  const texto = (x) => (typeof x === "string" ? x : x && typeof x === "object" && typeof x.nome === "string" ? x.nome : "");
  const sup = p.suprimentos && typeof p.suprimentos === "object" ? p.suprimentos : {};
  const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : null);
  return {
    estado: "campanha",
    nome: String(p.nome), raca: texto(p.raca), classe: texto(p.classe), nivel: num(p.nivel) || 1,
    sexo: p.genero === "mulher" ? "mulher" : "homem", semente: p.semente || p.nome,
    campanha: typeof sv.nomeCampanha === "string" ? sv.nomeCampanha : "",
    lugar: texto(sv.lugar), salvoEm: num(sv.salvoEm),
    recursos: { racoes: num(sup.racoes), agua: num(sup.agua), tochas: num(sup.tochas), moedas: num(p.moedas) },
    daUltimaVez: daUltimaVezDoSave(sv),
  };
}

/* V10 · «DA ÚLTIMA VEZ…» (formas.md F6, DA_ULTIMA_VEZ): o resumo VERDADEIRO
   da sessão que se lembra — os fatos do registro, o fio guardado com ela,
   onde parou. Save sem registro (o antigo): null, e a página é a de antes. */
function daUltimaVezDoSave(sv) {
  try {
    const s = aSessaoParaLembrar(sv.registroDaSessao);
    if (!s) return null;
    const r = oResumoDaSessao(s, sv);
    return { n: r.n, fatos: osFatosDaUltimaVez(r), fio: r.fio, fim: r.fim, lugar: r.lugar };
  } catch { return null; }
}

/* ---------------- a semente da visita ----------------
   A mesa de cada visita tem a sua semente (o relógio do toque em «Sentar à
   mesa», em base 36) — e a partir dela tudo é determinístico. «Sortear tudo
   de novo» passa à seguinte da corrente (#1, #2…), nunca a um acaso. */
export const sementeDaVisita = (agora) => `mesa|${Math.floor(Math.abs(Number(agora) || 0)).toString(36)}`;
export function sementeSeguinte(semente) {
  const s = String(semente ?? "");
  const m = /#(\d+)$/.exec(s);
  return m ? s.replace(/#\d+$/, `#${Number(m[1]) + 1}`) : `${s}#1`;
}

/* o texto das tabelas no sexo do herói: «calado(a)» → «calada» ou «calado»,
   «o(a)» → «a» ou «o», «senhor(a)» → «senhora» ou «senhor» */
export function textoNoSexo(texto, sexo) {
  const f = sexo === "mulher";
  return String(texto ?? "").replace(/(\p{L}*)\(a\)/gu, (_, palavra) => {
    if (palavra.endsWith("o")) return palavra.slice(0, -1) + (f ? "a" : "o");
    return f ? palavra + "a" : palavra;
  });
}
