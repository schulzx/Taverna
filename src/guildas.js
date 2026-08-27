/* ============================================================
   O MOTOR DE GUILDAS (v9.133) — fase 4 do plano

   Até aqui a "guilda" era `{ nivel, cofre }` dentro do App: um cofre e um
   botão de melhorar. O jogador não geria nada — ele depositava. Não existia
   arquivo, não existiam guildas no mundo, não existia entrar, não existia
   posto, e a palavra aparecia no jogo como enfeite de um painel.

   O que este arquivo faz é dar ao mundo o que um jogo com sistema de guilda
   entrega: casas que já existem antes de o herói chegar, com ofício, sede,
   mestre, membros, escada de postos, LEIS, cofre, rivais e guerra. Entrar é
   um ato e pode ser recusado. Subir custa contribuição. Quebrar a lei custa
   posto. Mandar é delegar.

   ---------------- A REGRA QUE DECIDE O DESENHO ----------------

   LEI DE GUILDA QUE O SISTEMA NÃO SABE CONFERIR É ADJETIVO. "Seja leal",
   "honre a casa" e "guarde os segredos" são bonitos e não valem nada: não
   há como saber se foram quebrados, então quem julga vira o Narrador — e é
   exatamente disso que esta casa passou meses saindo.

   As cinco leis daqui têm leitor no código: o dízimo é cobrado, a
   exclusividade olha o mural, o sangue olha quem caiu, a presença olha o
   calendário e a mensalidade olha a bolsa. Uma guilda que não pode punir
   não é uma instituição, é um clube com nome bonito.

   ---------------- A OUTRA REGRA ----------------

   SÓ SE PERTENCE A UMA. Sem isso não há escolha: o jogador entraria em
   todas e a rivalidade entre elas viraria decoração. Uma guilda é uma porta
   que fecha outras, e é isso que faz a porta valer.
   ---------------- OS NOMES ----------------

   Tudo aqui termina em "Casa" — `entrarNaCasa`, `sairDaCasa`, `punirNaCasa`.
   Nao e verbosidade: a primeira versao exportava `entrar`, `sair`, `fundar`
   e `admitir`, verbos comuns demais para viverem soltos num projeto escrito
   em portugues. Todo consumidor teve de apelidar na importacao, e o varredor
   passou a ver "entrar" em qualquer prop chamada `aoEntrar`. Quando todo
   mundo precisa apelidar, o nome esta errado na origem.
   ============================================================ */
import { rngDe } from "./geografia.js";
import { nomePessoa } from "./nomes.js";
import { nomeDeLocal } from "./toponimia.js";

const pick = (rnd, a) => a[Math.floor(rnd() * a.length)];
const entre = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- QUANDO SE PODE TER A SUA ----------------
   Entrar numa guilda vale desde o primeiro dia — é o que dá ao herói de
   nível 1 um lugar no mundo e uma escada para subir. FUNDAR é outra coisa:
   é a formatura. Cinco seria cedo demais para a escada de postos ter
   significado (ele fundaria antes de saber o que uma guilda faz), e a casa
   própria só é interessante depois de ter servido numa. */
export const NIVEL_PARA_FUNDAR = 10;
export const CUSTO_DE_FUNDAR = 1500;
export const MEMBROS_INICIAIS = 3;

/* ---------------- OS OFÍCIOS ----------------
   O ofício é a identidade inteira: decide o nome da casa, os postos, as
   leis, que trabalho ela oferece, quem ela despreza e o que ela cobra para
   deixar alguém entrar. Sete, e nenhum é "genérico" — uma guilda que faz
   tudo não faz nada, e o jogador não tem por que escolher entre duas. */
export const OFICIOS = [
  {
    id: "laminas", cabeca: "Companhia", artigo: "A", nome: "Companhia de Lâminas", icone: "⚔",
    o: "contrato de guerra, escolta e caçada — quem paga, manda, e quem falha não volta a ser chamado",
    pericia: "atletismo", atributo: "forca",
    postos: ["Recruta", "Lâmina", "Veterano", "Capitão", "Mestre de Armas"],
    leis: ["dizimo", "sangue", "presenca"],
    trabalhos: ["caca", "escolta", "cabeca"],
    despreza: "sombras",
    entrada: { nivel: 1, taxa: 25, fama: 0 },
    lema: ["Aço não discute", "O contrato é a palavra", "Vivo se paga melhor"],
  },
  {
    id: "sombras", cabeca: "Confraria", artigo: "A", nome: "Confraria das Sombras", icone: "🗝",
    o: "o que se faz sem testemunha: arrombamento, escuta, coisa que muda de dono à noite",
    pericia: "furtividade", atributo: "destreza",
    postos: ["Rato", "Dedo", "Sombra", "Punho", "Rei dos Becos"],
    leis: ["dizimo", "exclusividade", "sangue"],
    trabalhos: ["furto", "escuta", "sumico"],
    despreza: "laminas",
    entrada: { nivel: 1, taxa: 10, fama: 0 },
    lema: ["Ninguém viu", "O que some, some de vez", "A cidade tem duas plantas"],
  },
  {
    id: "arcana", cabeca: "Câmara", artigo: "A", nome: "Câmara Arcana", icone: "✦",
    o: "o estudo do que não devia ser mexido, e a guarda do que já foi",
    pericia: "arcanismo", atributo: "intelecto",
    postos: ["Ouvinte", "Copista", "Adepto", "Arquimago Menor", "Guardião do Selo"],
    leis: ["dizimo", "presenca", "exclusividade"],
    trabalhos: ["relíquia", "selo", "estudo"],
    despreza: "ordem",
    entrada: { nivel: 2, taxa: 60, fama: 0 },
    lema: ["Saber tem preço, e o preço é lembrar", "Nada se abre duas vezes", "O selo antes da curiosidade"],
  },
  {
    id: "rotas", cabeca: "Companhia", artigo: "A", nome: "Companhia das Rotas", icone: "⚖",
    o: "caravana, entreposto e o preço de mover uma coisa de um lugar a outro",
    pericia: "persuasao", atributo: "presenca",
    postos: ["Carregador", "Caixeiro", "Feitor", "Sócio", "Mestre da Balança"],
    leis: ["dizimo", "mensalidade", "exclusividade"],
    trabalhos: ["carga", "rota", "cobranca"],
    despreza: "sombras",
    entrada: { nivel: 1, taxa: 40, fama: 0 },
    lema: ["Tudo tem frete", "A estrada é da companhia", "Conta fechada, amizade inteira"],
  },
  {
    id: "feras", cabeca: "Liga", artigo: "A", nome: "Liga dos Caçadores", icone: "🏹",
    o: "o que sai da mata e come gente, e a lista do que ainda não saiu",
    pericia: "sobrevivencia", atributo: "percepcao",
    postos: ["Batedor", "Caçador", "Rastreador-Mor", "Mestre de Matilha", "O Que Não Volta Vazio"],
    leis: ["dizimo", "presenca", "sangue"],
    trabalhos: ["caca", "ninho", "rastro"],
    despreza: "arcana",
    entrada: { nivel: 1, taxa: 20, fama: 0 },
    lema: ["Conta-se pelas garras", "Ninho achado é ninho queimado", "A mata cobra em silêncio"],
  },
  {
    id: "saber", cabeca: "Casa", artigo: "A", nome: "Casa dos Papéis", icone: "📖",
    o: "arquivo, tradução e a memória de coisas que ninguém quer lembrar",
    pericia: "investigacao", atributo: "intelecto",
    postos: ["Aprendiz", "Escriba", "Anotador", "Arquivista", "Guardião do Índice"],
    leis: ["mensalidade", "presenca", "exclusividade"],
    trabalhos: ["registro", "traducao", "testemunho"],
    despreza: "sombras",
    entrada: { nivel: 1, taxa: 30, fama: 0 },
    lema: ["O que não se escreve não aconteceu", "Papel dura mais que rei", "Toda dívida tem folha"],
  },
  {
    id: "ordem", cabeca: "Ordem", artigo: "A", nome: "Ordem do Voto", icone: "🕯",
    o: "voto, vigília e o que se faz quando a fé precisa de braço",
    pericia: "religiao", atributo: "presenca",
    postos: ["Postulante", "Irmão", "Cavaleiro do Voto", "Preceptor", "Grão-Mestre"],
    leis: ["dizimo", "presenca", "sangue"],
    trabalhos: ["vigilia", "profanacao", "peregrino"],
    despreza: "sombras",
    entrada: { nivel: 1, taxa: 0, fama: 0 },
    lema: ["O voto antes do sangue", "Vigiar é servir", "Nenhuma noite é longa demais"],
  },
];
export function oficioPorId(id) { return OFICIOS.find((o) => o.id === id) || OFICIOS[0]; }

/* ---------------- AS LEIS ----------------
   Cinco, e cada uma tem leitor no código. `ve` recebe o estado do jogo e
   devolve a infração quando ela existe — nada de julgamento por opinião. */
export const LEIS = {
  dizimo: {
    id: "dizimo", icone: "◉", nome: "O dízimo",
    texto: (g) => `Um décimo de toda paga de trabalho da casa volta ao cofre (${g.dizimo}%).`,
    /* não se "quebra": é cobrado. Existe como lei para o jogador saber por
       que a paga chega menor, em vez de achar que o sistema comeu moedas. */
    cobra: true,
  },
  exclusividade: {
    id: "exclusividade", icone: "🚫", nome: "A exclusividade",
    texto: () => "Trabalho de fora não se aceita: cartaz de mural é confissão de que a casa não bastava.",
    ve: (g, ctx) => ((ctx.contratosDeFora || 0) > 0
      ? { falta: "aceitou trabalho de fora da casa", peso: 2 } : null),
  },
  sangue: {
    id: "sangue", icone: "🩸", nome: "O sangue",
    texto: () => "Não se derrama sangue de irmão de casa nem de casa aliada.",
    ve: (g, ctx) => (((ctx.mortos || []).some((n) => (g.membros || []).some((m) => norm(m.nome) === norm(n))))
      ? { falta: "matou um irmão de casa", peso: 5 } : null),
  },
  presenca: {
    id: "presenca", icone: "🕯", nome: "A presença",
    texto: (g) => `Quem some some: apresente-se na sede a cada ${g.presencaDias} dias.`,
    ve: (g, ctx) => (((ctx.dia || 0) - (g.vistoEm || 0)) > g.presencaDias
      ? { falta: `sumiu por ${(ctx.dia || 0) - (g.vistoEm || 0)} dias`, peso: 1 } : null),
  },
  mensalidade: {
    id: "mensalidade", icone: "🪙", nome: "A mensalidade",
    texto: (g) => `A casa cobra ${g.mensalidade} moedas por mês de quem usa o nome dela.`,
    ve: (g, ctx) => (((ctx.dia || 0) - (g.pagouEm || 0)) > 30
      ? { falta: "está com a mensalidade atrasada", peso: 2 } : null),
  },
};
export function leiPorId(id) { return LEIS[id] || null; }
export function leisDa(g) { return (g && g.leis ? g.leis : []).map(leiPorId).filter(Boolean); }

/* ---------------- A ESCADA ----------------
   Cinco degraus, e cada um destrava alguma coisa que se sente. Um posto que
   só muda o nome no crachá é um posto que ninguém persegue. */
export const DEGRAUS = [
  { i: 0, exige: 0, saque: 0, delegados: 0, nivelMax: 2, o: "entrou; ainda não é ninguém" },
  { i: 1, exige: 60, saque: 50, delegados: 0, nivelMax: 5, o: "trabalho de verdade, e o nome da casa nas ruas" },
  { i: 2, exige: 180, saque: 200, delegados: 1, nivelMax: 9, o: "manda em um; o cofre se abre um palmo" },
  { i: 3, exige: 400, saque: 600, delegados: 3, nivelMax: 14, o: "manda em três, e a casa ouve o que ele diz" },
  { i: 4, exige: 800, saque: 2000, delegados: 6, nivelMax: 20, o: "a casa é dele em tudo menos no nome" },
];
export function degrauDaCasa(i) { return DEGRAUS[Math.max(0, Math.min(DEGRAUS.length - 1, Number(i) || 0))]; }
export function nomeDoPosto(g, i) {
  const of = oficioPorId(g && g.oficio);
  return of.postos[Math.max(0, Math.min(of.postos.length - 1, Number(i) || 0))];
}

/* ---------------- A CATRACA ---------------- */
export function garantirGuilda(g) {
  const o = g && typeof g === "object" ? g : {};
  const of = oficioPorId(o.oficio);
  return {
    id: String(o.id || ""),
    nome: String(o.nome || of.nome).slice(0, 50),
    oficio: of.id,
    sede: String(o.sede || "").slice(0, 40),
    lema: String(o.lema || "").slice(0, 60),
    mestre: String(o.mestre || "").slice(0, 40),
    poder: Math.max(1, Math.min(100, Math.round(Number(o.poder) || 30))),
    cofre: Math.max(0, Math.round(Number(o.cofre) || 0)),
    dizimo: Math.max(0, Math.min(50, Math.round(Number(o.dizimo) || 10))),
    mensalidade: Math.max(0, Math.round(Number(o.mensalidade) || 0)),
    presencaDias: Math.max(3, Math.round(Number(o.presencaDias) || 20)),
    leis: (Array.isArray(o.leis) ? o.leis : of.leis).filter((x) => LEIS[x]),
    membros: (Array.isArray(o.membros) ? o.membros : []).slice(0, 24).map((m) => ({
      nome: String((m && m.nome) || "").slice(0, 40),
      posto: Math.max(0, Math.min(4, Math.round(Number(m && m.posto) || 0))),
      papel: String((m && m.papel) || "").slice(0, 30),
      fora: !!(m && m.fora),
    })),
    /* o que vale para o JOGADOR nesta casa — 0 quando ele não é membro */
    membro: !!o.membro,
    /* v9.134: entrar e ser ACEITO sao coisas diferentes. Enquanto a prova
       nao cai, ele esta na casa mas nao e da casa: nao pega trabalho, nao
       toca no cofre e nao manda em ninguem. */
    emProva: !!o.emProva,
    posto: Math.max(0, Math.min(4, Math.round(Number(o.posto) || 0))),
    contribuicao: Math.max(0, Math.round(Number(o.contribuicao) || 0)),
    faltas: Math.max(0, Math.round(Number(o.faltas) || 0)),
    vistoEm: Math.max(0, Math.round(Number(o.vistoEm) || 0)),
    pagouEm: Math.max(0, Math.round(Number(o.pagouEm) || 0)),
    entrouEm: Math.max(0, Math.round(Number(o.entrouEm) || 0)),
    doJogador: !!o.doJogador,
    /* relações com as outras casas */
    atrito: Object.fromEntries(Object.entries((o.atrito && typeof o.atrito === "object") ? o.atrito : {})
      .map(([k, v]) => [String(k), Math.max(0, Math.min(100, Math.round(Number(v) || 0)))])),
    /* quantos mortos de cada casa ja entraram na conta do atrito. Sem isto o
       mesmo defunto subiria o atrito todo dia, e uma briga de rua viraria
       guerra em uma semana por recontagem. */
    contados: Object.fromEntries(Object.entries((o.contados && typeof o.contados === "object") ? o.contados : {})
      .map(([k, v]) => [String(k), Math.max(0, Math.round(Number(v) || 0))])),
    guerraCom: String(o.guerraCom || "").slice(0, 40),
  };
}

/* ---------------- AS GUILDAS DO MUNDO ----------------
   Nascem com ele, da mesma semente, e ficam onde há gente para sustentá-las:
   uma Companhia das Rotas numa aldeia de trinta almas seria enfeite. */
export function guildasDoMundo(semente, mapa, genero = "Fantasia medieval", lex = null) {
  const cidades = ((mapa && mapa.cidades) || []).filter((c) => c && c.nome);
  if (!cidades.length) return [];
  const rnd = rngDe(`${semente}|guildas`);
  const PESO = { aldeia: 0, vila: 1, cidade: 2, fortaleza: 2, capital: 3 };
  const sedes = cidades.filter((c) => (PESO[c.porte || c.tipo] ?? 1) >= 1);
  if (!sedes.length) return [];
  const out = [];
  const usados = new Set();
  const quantas = Math.max(3, Math.min(OFICIOS.length, Math.round(sedes.length / 2)));
  for (let i = 0; i < quantas; i++) {
    const of = OFICIOS.filter((x) => !usados.has(x.id))[0] ? pick(rnd, OFICIOS.filter((x) => !usados.has(x.id))) : null;
    if (!of) break;
    usados.add(of.id);
    const sede = pick(rnd, sedes);
    const peso = PESO[sede.porte || sede.tipo] ?? 1;
    const g = garantirGuilda({
      id: `guilda|${of.id}`,
      /* nomeDeLocal(tipo, genero, rnd) — o segundo e o GENERO do mundo, nao
         o lexico. Passar o rnd na vaga errada fazia o sorteio virar undefined
         e a funcao estourar na primeira guilda. */
      nome: nomeDaCasa(of, genero, rnd),
      oficio: of.id,
      sede: sede.nome,
      lema: pick(rnd, of.lema),
      mestre: nomePessoa(genero, undefined, rnd, lex),
      poder: 20 + peso * 12 + entre(rnd, 0, 18),
      cofre: (peso + 1) * entre(rnd, 200, 700),
      dizimo: entre(rnd, 5, 20),
      mensalidade: of.leis.includes("mensalidade") ? entre(rnd, 5, 25) : 0,
      presencaDias: entre(rnd, 12, 30),
      membros: membrosDe(semente, of, sede, genero, lex, peso),
    });
    out.push(g);
  }
  /* o atrito nasce do DESPREZO declarado no ofício: duas casas que se
     desprezam já começam se olhando torto, e é daí que a guerra sai */
  return out.map((g) => {
    const of = oficioPorId(g.oficio);
    const alvo = out.find((x) => x.oficio === of.despreza);
    return alvo ? { ...g, atrito: { ...g.atrito, [alvo.id]: entre(rnd, 15, 45) } } : g;
  });
}

/* O NOME TEM DE COMBINAR COM O OFÍCIO (v9.133). A sonda gerou "A Mesa da
   Moeda" para uma casa de escribas e "A Confraria Velha" para mercenários:
   o sorteio pegava a cabeça do nome na lista genérica de guildas, e a cabeça
   é justamente a parte que diz que casa é aquela. Agora a cabeça vem do
   ofício e só o QUALIFICADOR é sorteado — "A Casa da Moeda", "A Companhia
   Velha". */
function nomeDaCasa(of, genero, rnd) {
  const bruto = nomeDeLocal("guilda", genero, rnd) || "";
  const m = bruto.match(/^(?:A|O|As|Os)\s+\S+\s+(.+)$/);
  const qualificador = m ? m[1] : "";
  return qualificador ? `${of.artigo} ${of.cabeca} ${qualificador}` : of.nome;
}

function membrosDe(semente, of, sede, genero, lex, peso) {
  const rnd = rngDe(`${semente}|membros|${of.id}`);
  const quantos = 4 + peso * 2;
  const out = [];
  for (let i = 0; i < quantos; i++) {
    out.push({
      nome: nomePessoa(genero, undefined, rnd, lex),
      posto: i === 0 ? 3 : entre(rnd, 0, 2),
      papel: pick(rnd, ["de poucas palavras", "que fala demais", "que já foi melhor", "recém-chegado", "que todos devem favor", "que ninguém encara"]),
      fora: false,
    });
  }
  return out;
}

/* ---------------- ENTRAR ----------------
   E poder ser recusado, que é o que faz aceitar valer alguma coisa. */
export function podeEntrarNaCasa(g, pers, ctx = {}) {
  const G = garantirGuilda(g);
  const of = oficioPorId(G.oficio);
  const nivel = Number(pers && pers.nivel) || 1;
  const moedas = Number(pers && pers.moedas) || 0;
  if (G.membro) return { ok: false, motivo: "você já é da casa" };
  /* SÓ SE PERTENCE A UMA. Sem isso a rivalidade entre elas vira decoração. */
  if (ctx.jaEDeOutra) return { ok: false, motivo: `você já tem casa — ${ctx.jaEDeOutra}. Saia de lá antes de bater nesta porta` };
  if (nivel < of.entrada.nivel) return { ok: false, motivo: `${G.nome} não fala com quem ainda não tem nível ${of.entrada.nivel}` };
  if (moedas < of.entrada.taxa) return { ok: false, motivo: `a taxa de ingresso é ◉ ${of.entrada.taxa}, e você tem ◉ ${moedas}` };
  /* uma casa em guerra não abre a porta para desconhecido */
  if (G.guerraCom) return { ok: false, motivo: `${G.nome} está em guerra e não aceita ninguém de fora agora` };
  /* v9.134: a prova NAO sai daqui. `podeEntrar` responde "a porta abre?", e
     montar a prova precisa do mundo — cidade, gente, bicho. Devolver uma
     prova pela metade era prometer o que esta funcao nao tem como cumprir. */
  return { ok: true, taxa: of.entrada.taxa };
}

/* ---------------- A PROVA DE INGRESSO (v9.134) ----------------
   Era um titulo e uma frase, e o jogador entrava assim mesmo — o que fazia
   dela um enfeite na porta. Agora e um TRABALHO, com etapa que o motor
   confere, e enquanto ela nao cai ele esta na casa sem ser da casa.

   Ela sai do mesmo molde do trabalho da casa, no nivel mais baixo: a prova
   de um recruta e uma tarefa de recruta, e nao um contrato de capitao. */
export function provaDeIngresso(g, ctx = {}) {
  const G = garantirGuilda(g);
  const of = oficioPorId(G.oficio);
  const rnd = rngDe(`${G.id}|prova`);
  const t = umTrabalho(G, of, rnd, ctx, 1);
  if (!t) return null;
  return {
    ...t,
    id: `prova|${G.id}`,
    icone: "✋",
    titulo: `A prova de ${G.nome}: ${t.titulo}`,
    descricao: `Antes do nome da casa, o trabalho. ${G.mestre} quer ver com os próprios olhos.`,
    paga: 0, contribui: 30, prova: true,
  };
}

export function entrarNaCasa(g, { dia = 0 } = {}) {
  const G = garantirGuilda(g);
  return { ...G, membro: true, emProva: true, posto: 0, contribuicao: 0, faltas: 0, entrouEm: dia, vistoEm: dia, pagouEm: dia };
}

export function sairDaCasa(g) {
  const G = garantirGuilda(g);
  return { ...G, membro: false, emProva: false, posto: 0, contribuicao: 0, faltas: 0 };
}

/* ---------------- SUBIR ----------------
   Contribuição é o que a casa conta: trabalho feito por ela, ouro no cofre,
   rival derrubado. Nunca conversa. */
export function contribuirNaCasa(g, quanto, motivo = "") {
  const G = garantirGuilda(g);
  if (!G.membro) return { guilda: G, subiu: null };
  const antes = G.posto;
  const c = Math.max(0, G.contribuicao + Math.max(0, Math.round(quanto)));
  let posto = antes;
  while (posto < DEGRAUS.length - 1 && c >= degrauDaCasa(posto + 1).exige) posto += 1;
  const nova = { ...G, contribuicao: c, posto };
  return { guilda: nova, subiu: posto > antes ? { de: antes, para: posto, nome: nomeDoPosto(nova, posto), o: degrauDaCasa(posto).o, motivo } : null };
}

/* ---------------- CAIR ----------------
   Falta tem peso, e peso derruba. Três degraus abaixo de zero é a porta da
   rua: uma casa que nunca expulsa não tem lei, tem recomendação. */
export const FALTAS_ATE_EXPULSAR = 8;
export function punirNaCasa(g, falta) {
  const G = garantirGuilda(g);
  if (!G.membro || !falta) return { guilda: G, caiu: null, expulso: false };
  const faltas = G.faltas + Math.max(1, Number(falta.peso) || 1);
  if (faltas >= FALTAS_ATE_EXPULSAR) {
    return { guilda: { ...sairDaCasa(G), faltas: 0 }, caiu: null, expulso: true, motivo: falta.falta };
  }
  /* cada duas faltas custam um degrau */
  const perde = Math.floor(faltas / 3) > Math.floor(G.faltas / 3) && G.posto > 0;
  const posto = perde ? G.posto - 1 : G.posto;
  return {
    guilda: { ...G, faltas, posto },
    caiu: perde ? { de: G.posto, para: posto, nome: nomeDoPosto(G, posto) } : null,
    expulso: false, motivo: falta.falta,
  };
}

/* Passa o olho em todas as leis da casa e devolve a primeira infração. Uma
   por vez, de propósito: três punições no mesmo turno viram tela de erro. */
export function conferirLeisDaCasa(g, ctx = {}) {
  const G = garantirGuilda(g);
  if (!G.membro || G.doJogador) return null;
  for (const lei of leisDa(G)) {
    if (typeof lei.ve !== "function") continue;
    let r = null;
    try { r = lei.ve(G, ctx); } catch { r = null; }
    if (r) return { ...r, lei: lei.id, nome: lei.nome, icone: lei.icone };
  }
  return null;
}

/* O dízimo não é infração: é cobrança. Sai daqui para o App descontar num
   lugar só, com o número à vista — paga que encolhe sem explicação parece
   moeda comida pelo sistema. */
export function dizimoDe(g, paga) {
  const G = garantirGuilda(g);
  if (!G.membro || !G.leis.includes("dizimo")) return 0;
  return Math.max(0, Math.round((Number(paga) || 0) * G.dizimo / 100));
}

/* ---------------- FUNDAR A SUA ---------------- */
export function podeFundarCasa(pers, ctx = {}) {
  const nivel = Number(pers && pers.nivel) || 1;
  const moedas = (Number(pers && pers.moedas) || 0) + (Number(ctx.cofre) || 0);
  if (nivel < NIVEL_PARA_FUNDAR) return { ok: false, motivo: `fundar casa é coisa de nível ${NIVEL_PARA_FUNDAR} — você tem ${nivel}` };
  if (ctx.jaEDeOutra) return { ok: false, motivo: `você é de ${ctx.jaEDeOutra}: ninguém funda casa servindo em outra` };
  if (moedas < CUSTO_DE_FUNDAR) return { ok: false, motivo: `abrir as portas custa ◉ ${CUSTO_DE_FUNDAR}, e você tem ◉ ${moedas}` };
  if (!ctx.cidade) return { ok: false, motivo: "é preciso estar numa cidade para abrir uma sede" };
  return { ok: true, custo: CUSTO_DE_FUNDAR };
}

export function fundarCasa({ nome, oficio, cidade, mestre, dia = 0, grupo = [] }) {
  const of = oficioPorId(oficio);
  return garantirGuilda({
    id: `guilda|minha|${norm(nome).replace(/\s+/g, "-").slice(0, 20)}`,
    nome: String(nome || of.nome).slice(0, 50),
    oficio: of.id, sede: cidade, mestre,
    lema: of.lema[0], poder: 8, cofre: 0, dizimo: 10,
    mensalidade: 0, presencaDias: 99,
    /* a casa do jogador nasce com as leis do ofício, e ele é o único que
       não responde a elas: quem manda não se pune sozinho */
    leis: of.leis,
    membros: (grupo || []).slice(0, MEMBROS_INICIAIS).map((g, i) => ({ nome: g.nome, posto: i === 0 ? 2 : 1, papel: "fundador", fora: false })),
    membro: true, posto: 4, doJogador: true, entrouEm: dia, vistoEm: dia, pagouEm: dia,
  });
}

/* ---------------- MANDAR: ADMITIR, PROMOVER, EXPULSAR ----------------
   Só faz sentido na casa do jogador, ou de posto alto o bastante. Mandar em
   quem não é seu seria dar ao jogador uma alavanca que a ficção não tem. */
export function podeMandar(g) {
  const G = garantirGuilda(g);
  return G.membro && !G.emProva && (G.doJogador || G.posto >= 3);
}

export function admitirNaCasa(g, pessoa) {
  const G = garantirGuilda(g);
  if (!podeMandar(G)) return { guilda: G, ok: false, motivo: "não é você quem admite nesta casa" };
  if (!pessoa || !pessoa.nome) return { guilda: G, ok: false, motivo: "sem nome" };
  if (G.membros.some((m) => norm(m.nome) === norm(pessoa.nome))) return { guilda: G, ok: false, motivo: "já é da casa" };
  if (G.membros.length >= 24) return { guilda: G, ok: false, motivo: "a casa está cheia" };
  return { guilda: { ...G, membros: [...G.membros, { nome: pessoa.nome, posto: 0, papel: pessoa.papel || "recém-admitido", fora: false }] }, ok: true };
}

export function expulsarDaCasa(g, nome) {
  const G = garantirGuilda(g);
  if (!podeMandar(G)) return { guilda: G, ok: false, motivo: "não é você quem expulsa nesta casa" };
  const tem = G.membros.some((m) => norm(m.nome) === norm(nome));
  if (!tem) return { guilda: G, ok: false, motivo: "essa pessoa não é da casa" };
  return { guilda: { ...G, membros: G.membros.filter((m) => norm(m.nome) !== norm(nome)) }, ok: true };
}

export function promoverMembro(g, nome, quanto = 1) {
  const G = garantirGuilda(g);
  if (!podeMandar(G)) return { guilda: G, ok: false, motivo: "não é você quem promove nesta casa" };
  let mudou = false;
  const membros = G.membros.map((m) => {
    if (norm(m.nome) !== norm(nome)) return m;
    const p = Math.max(0, Math.min(G.doJogador ? 3 : G.posto - 1, m.posto + quanto));
    if (p !== m.posto) mudou = true;
    return { ...m, posto: p };
  });
  return { guilda: { ...G, membros }, ok: mudou, motivo: mudou ? "" : "esse posto é o teto dele nesta casa" };
}

/* ---------------- A RIVALIDADE, E A GUERRA ----------------
   Atrito sobe por FATO: contrato disputado, membro morto, território tomado.
   Chegou ao teto, é guerra — e guerra é estado, não humor. */
export const ATRITO = { paz: 0, arranhao: 25, rivalidade: 55, guerra: 85 };
export function faixaDeAtrito(n) {
  const v = Number(n) || 0;
  if (v >= ATRITO.guerra) return "guerra";
  if (v >= ATRITO.rivalidade) return "rivalidade";
  if (v >= ATRITO.arranhao) return "arranhão";
  return "paz";
}

export function atritar(g, idOutra, quanto, motivo = "") {
  const G = garantirGuilda(g);
  if (!idOutra) return { guilda: G, virou: null };
  const antes = G.atrito[idOutra] || 0;
  const depois = Math.max(0, Math.min(100, antes + Math.round(quanto)));
  const nova = { ...G, atrito: { ...G.atrito, [idOutra]: depois } };
  const fa = faixaDeAtrito(antes), fd = faixaDeAtrito(depois);
  if (fd === "guerra" && fa !== "guerra") {
    return { guilda: { ...nova, guerraCom: idOutra }, virou: { de: fa, para: fd, com: idOutra, motivo } };
  }
  return { guilda: nova, virou: fd !== fa ? { de: fa, para: fd, com: idOutra, motivo } : null };
}

/* ---------------- O SANGUE ENTRE CASAS (v9.133) ----------------
   Atrito sobe por FATO, e o fato mais simples e o mais caro: gente da casa
   dela caindo. Conta so o que ainda nao foi contado — senao o mesmo defunto
   levaria as duas casas a guerra por recontagem diaria. */
export const ATRITO_POR_MORTE = 18;
export function sangueEntreCasas(minha, outras, mortos = []) {
  const G = garantirGuilda(minha);
  if (!G.membro) return { guilda: G, viradas: [] };
  const mortosN = new Set((mortos || []).map(norm));
  let atual = G;
  const viradas = [];
  for (const o of outras || []) {
    if (!o || o.id === G.id) continue;
    const caidos = (o.membros || []).filter((m) => mortosN.has(norm(m.nome))).length;
    const jaContados = atual.contados[o.id] || 0;
    if (caidos <= jaContados) continue;
    const novos = caidos - jaContados;
    const r = atritar(atual, o.id, novos * ATRITO_POR_MORTE, `${novos} d${novos > 1 ? "os seus" : "os seus"} caiu`);
    atual = { ...r.guilda, contados: { ...r.guilda.contados, [o.id]: caidos } };
    if (r.virou) viradas.push({ ...r.virou, casa: o.nome });
  }
  return { guilda: atual, viradas };
}

export function fazerAsPazes(g, idOutra) {
  const G = garantirGuilda(g);
  return { ...G, guerraCom: G.guerraCom === idOutra ? "" : G.guerraCom, atrito: { ...G.atrito, [idOutra]: Math.min(G.atrito[idOutra] || 0, ATRITO.arranhao - 1) } };
}

/* ---------------- O TRABALHO DA CASA ----------------
   Missões com a cara do ofício, e com o vocabulário de etapas que o resto do
   jogo já confere. O posto limita o nível: um Recruta não recebe o contrato
   que mata o Capitão. */
const MOLDES = {
  caca: { icone: "🏹", titulo: (a) => `A caçada: ${a}`, etapa: (a) => ({ tipo: "derrotar", alvo: a, quantos: 1 }), o: "criatura" },
  cabeca: { icone: "☠", titulo: (a) => `A cabeça de ${a}`, etapa: (a) => ({ tipo: "derrotar", alvo: a, quantos: 1 }), o: "gente" },
  escolta: { icone: "🛡", titulo: (a) => `Levar a carga a ${a}`, etapa: (a) => ({ tipo: "ir_a", alvo: a }), o: "cidade" },
  carga: { icone: "📦", titulo: (a) => `A encomenda de ${a}`, etapa: (a) => ({ tipo: "ir_a", alvo: a }), o: "cidade" },
  rota: { icone: "⚖", titulo: (a) => `Abrir a rota até ${a}`, etapa: (a) => ({ tipo: "ir_a", alvo: a }), o: "cidade" },
  cobranca: { icone: "🪙", titulo: (a) => `A dívida de ${a}`, etapa: (a) => ({ tipo: "falar_com", alvo: a }), o: "gente" },
  furto: { icone: "🗝", titulo: (a) => `O que ${a} guarda`, etapa: (a) => ({ tipo: "revelar", alvo: a }), o: "lugar" },
  escuta: { icone: "👂", titulo: (a) => `O que se diz em ${a}`, etapa: (a) => ({ tipo: "revelar", alvo: a }), o: "lugar" },
  sumico: { icone: "🌫", titulo: (a) => `${a} precisa sumir`, etapa: (a) => ({ tipo: "derrotar", alvo: a, quantos: 1 }), o: "gente" },
  relíquia: { icone: "✦", titulo: (a) => `A relíquia de ${a}`, etapa: (a) => ({ tipo: "revelar", alvo: a }), o: "lugar" },
  selo: { icone: "🔏", titulo: (a) => `O selo de ${a}`, etapa: (a) => ({ tipo: "revelar", alvo: a }), o: "lugar" },
  estudo: { icone: "📖", titulo: (a) => `O que ${a} sabe`, etapa: (a) => ({ tipo: "falar_com", alvo: a }), o: "gente" },
  ninho: { icone: "🕳", titulo: (a) => `O ninho de ${a}`, etapa: (a) => ({ tipo: "derrotar", alvo: a, quantos: 2 }), o: "criatura" },
  rastro: { icone: "👣", titulo: (a) => `O rastro que leva a ${a}`, etapa: (a) => ({ tipo: "ir_a", alvo: a }), o: "cidade" },
  registro: { icone: "📜", titulo: (a) => `O registro de ${a}`, etapa: (a) => ({ tipo: "revelar", alvo: a }), o: "lugar" },
  traducao: { icone: "🖋", titulo: (a) => `A tradução para ${a}`, etapa: (a) => ({ tipo: "falar_com", alvo: a }), o: "gente" },
  testemunho: { icone: "⚖", titulo: (a) => `O testemunho de ${a}`, etapa: (a) => ({ tipo: "falar_com", alvo: a }), o: "gente" },
  vigilia: { icone: "🕯", titulo: (a) => `A vigília em ${a}`, etapa: (a) => ({ tipo: "ir_a", alvo: a }), o: "cidade" },
  profanacao: { icone: "⛧", titulo: (a) => `O que profanaram em ${a}`, etapa: (a) => ({ tipo: "revelar", alvo: a }), o: "lugar" },
  peregrino: { icone: "🚶", titulo: (a) => `O peregrino de ${a}`, etapa: (a) => ({ tipo: "falar_com", alvo: a }), o: "gente" },
};
export function moldeDeTrabalho(id) { return MOLDES[id] || MOLDES.caca; }

/* UM trabalho, e um so lugar que sabe montar um. A prova de ingresso e o
   trabalho do dia a dia saem daqui pelo mesmo caminho — dois montadores
   seriam duas ideias do que a casa pede. */
function umTrabalho(G, of, rnd, ctx, nivel, tipos = null) {
  const { cidades = [], gente = [], criaturas = [], lugares = [] } = ctx || {};
  const tipo = pick(rnd, tipos && tipos.length ? tipos : of.trabalhos);
  const M = moldeDeTrabalho(tipo);
  const banco = M.o === "cidade" ? cidades : M.o === "gente" ? gente : M.o === "criatura" ? criaturas : lugares;
  if (!banco.length) return null;
  const escolhido = pick(rnd, banco);
  const alvo = String((escolhido && escolhido.nome) || escolhido);
  const nv = Math.max(1, Number(nivel) || 1);
  return {
    tipo, icone: M.icone, titulo: M.titulo(alvo),
    descricao: `${G.nome} paga por isto. ${of.o}.`,
    dador: G.mestre, dadorLocal: G.sede, guilda: G.id,
    nivel: nv, paga: 20 + nv * 14 + entre(rnd, 0, 20),
    contribui: 20 + nv * 6, etapas: [M.etapa(alvo)],
  };
}

export function trabalhosDaCasa(g, { semente = "", dia = 0, nivel = 1, cidades = [], gente = [], criaturas = [], lugares = [], quantos = 3 } = {}) {
  const G = garantirGuilda(g);
  /* em prova nao ha trabalho da casa: primeiro a prova, e ela e uma so */
  if (!G.membro || G.emProva) return [];
  const of = oficioPorId(G.oficio);
  const teto = degrauDaCasa(G.posto).nivelMax;
  const rnd = rngDe(`${semente}|trabalho|${G.id}|${Math.floor(dia / 3)}`);
  const out = [];
  /* a sonda devolveu "O peregrino de Vantel" e "O peregrino de Zulmira" no
     mesmo lote: três trabalhos do mesmo molde não são três escolhas, são a
     mesma escolha três vezes */
  const usados = new Set();
  for (let i = 0; i < quantos; i++) {
    const livres = of.trabalhos.filter((x) => !usados.has(x));
    const t = umTrabalho(G, of, rnd, { cidades, gente, criaturas, lugares }, Math.max(1, Math.min(teto, nivel + entre(rnd, -1, 2))), livres.length ? livres : of.trabalhos);
    if (!t) continue;
    usados.add(t.tipo);
    out.push({ ...t, id: `casa|${G.id}|${dia}|${i}` });
  }
  /* EM GUERRA, a casa só quer uma coisa. É o que faz a guerra pesar em vez
     de ser uma palavra no painel. */
  if (G.guerraCom && out.length) {
    out[0] = { ...out[0], icone: "⚔", titulo: `Guerra: ${out[0].titulo}`, paga: Math.round(out[0].paga * 1.6), contribui: out[0].contribui * 2, guerra: true };
  }
  return out;
}

/* ---------------- DELEGAR ----------------
   O posto diz quantos você manda ao mesmo tempo. Quem vai é membro da casa,
   e ele demora, e ele pode não voltar — senão delegar seria um botão que
   imprime ouro. */
export function podeDelegar(g) {
  const G = garantirGuilda(g);
  return G.membro && !G.emProva ? degrauDaCasa(G.posto).delegados : 0;
}

export function delegarNaCasa(g, trabalho, quem, { dia = 0 } = {}) {
  const G = garantirGuilda(g);
  const vagas = podeDelegar(G);
  if (!vagas) return { ok: false, motivo: `no posto de ${nomeDoPosto(G, G.posto)} ninguém obedece a você ainda` };
  const m = G.membros.find((x) => norm(x.nome) === norm(quem) && !x.fora);
  if (!m) return { ok: false, motivo: "essa pessoa não está na casa, ou já saiu em serviço" };
  const membros = G.membros.map((x) => (norm(x.nome) === norm(quem) ? { ...x, fora: true } : x));
  /* quanto melhor o posto dele, melhor a chance — e a dificuldade do
     trabalho puxa para o outro lado */
  const chance = Math.max(15, Math.min(90, 45 + m.posto * 12 - (Number(trabalho.nivel) || 1) * 3));
  return {
    ok: true,
    guilda: { ...G, membros },
    tarefa: {
      id: `tarefa|${G.id}|${dia}|${norm(quem).slice(0, 12)}`,
      quem: m.nome, posto: m.posto,
      titulo: trabalho.titulo, paga: trabalho.paga, contribui: trabalho.contribui || 0,
      dias: 1 + Math.ceil((Number(trabalho.nivel) || 1) / 3),
      desde: dia, chance,
    },
  };
}

export function resolverTarefaDaCasa(t, rnd = Math.random) {
  if (!t) return null;
  const d = Math.floor(rnd() * 100) + 1;
  if (d <= t.chance) return { ...t, desfecho: "feito" };
  if (d <= t.chance + 25) return { ...t, desfecho: "voltou" };
  return { ...t, desfecho: "perdido" };
}

export const DESFECHO_TAREFA = {
  feito: { icone: "✔", cor: "ok", diz: (t) => `${t.quem} voltou com o serviço feito: ${t.titulo}.` },
  voltou: { icone: "↩", cor: "amber", diz: (t) => `${t.quem} voltou de mãos vazias — ${t.titulo} continua por fazer.` },
  perdido: { icone: "☠", cor: "danger", diz: (t) => `${t.quem} não voltou. ${t.titulo} custou um dos nossos.` },
};

/* ---------------- O QUE VAI À PAUTA ---------------- */
/* NAO HA uma `linhaDaGuilda` de uma linha so. Ela existiu por um commit e
   nao tinha onde morar: o painel mostra tudo, e o Narrador recebe o
   envelope. Resumo sem leitor e export morto, e export morto mente na
   primeira leitura. */

export function envelopeDaGuilda(g) {
  const G = garantirGuilda(g);
  if (!G.membro) return "";
  const of = oficioPorId(G.oficio);
  const leis = leisDa(G).map((l) => l.nome.toLowerCase()).join(", ");
  return `GUILDA (fato do sistema): sou ${nomeDoPosto(G, G.posto)} d${G.nome.startsWith("A ") || G.nome.startsWith("a ") ? "" : "e "}${G.nome}, casa de ${of.o.split("—")[0].trim()}, com sede em ${G.sede} e ${G.mestre} no comando.${G.doJogador ? " A casa é minha." : ""}${G.guerraCom ? " Estamos EM GUERRA." : ""} As leis da casa: ${leis}. Trate isso como pertencimento real — quem é da casa me trata como da casa, e quem a despreza me trata assim também. Não invente posto, lei nem ordem do mestre: isso é do sistema.`;
}

export function resumoDaGuilda(g) {
  const G = garantirGuilda(g);
  if (!G.membro) return null;
  const d = degrauDaCasa(G.posto);
  const prox = G.posto < DEGRAUS.length - 1 ? degrauDaCasa(G.posto + 1) : null;
  return {
    nome: G.nome, oficio: oficioPorId(G.oficio),
    posto: nomeDoPosto(G, G.posto), degrau: d,
    contribuicao: G.contribuicao,
    falta: prox ? Math.max(0, prox.exige - G.contribuicao) : 0,
    proximo: prox ? nomeDoPosto(G, G.posto + 1) : "",
    faltas: G.faltas, ateExpulsar: FALTAS_ATE_EXPULSAR - G.faltas,
    cofre: G.cofre, saque: d.saque, delegados: d.delegados,
    guerra: G.guerraCom, doJogador: G.doJogador, emProva: G.emProva,
  };
}
