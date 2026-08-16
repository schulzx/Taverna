/* ============================================================
   AFLIÇÕES (v9.1) — quem carrega condição, e como ela passa

   A pergunta que este módulo responde: "esta adaga envenenada
   deveria envenenar?" — e responde SOZINHO, sem perguntar ao
   Mestre. Toda fonte de golpe (arma, habilidade, magia, garra de
   bicho) é lida contra um catálogo de PORTADORES; se casar, o
   sistema rola o dado e a condição passa ou não. O Mestre recebe
   o resultado pronto e narra.

   Isso vale para TODO MUNDO em cena: herói, companheiros e
   inimigos usam as mesmas regras e o mesmo catálogo. Ninguém
   envenena ninguém por força de adjetivo bonito na narração.
   ============================================================ */

import { CONDICOES, criarCondicao } from "./condicoes.js";

/* ---------------- PORTADORES ----------------
   Cada linha é "o que, na ficção, carrega qual condição". A ordem
   importa: a primeira que casar vence (do mais específico para o mais
   genérico). `alvo` diz em quem a condição cai — no inimigo atingido,
   em quem usou, ou nos aliados de quem usou.

   `chance` é a probabilidade de o golpe SEQUER tentar afligir (um
   crítico sempre tenta); `dif` soma na dificuldade do teste do alvo. */
export const PORTADORES = [
  /* ---- debuffs no alvo ---- */
  { id: "veneno",     re: /venen|peçonh|pecconh|tóxic|toxic|víbora|vibora|serpente|escorpi|aranha|naja|cobra|ácido|acido/i, cond: "envenenado", alvo: "alvo", chance: 0.55, dif: 0 },
  { id: "fogo",       re: /flamej|ígne|igne|fogo|chama|incandes|brasa|infern|piro|lava|magma|solar/i,                       cond: "queimando",  alvo: "alvo", chance: 0.5,  dif: 0 },
  { id: "sangria",    re: /serrilh|dilacer|estripa|rasga|garra|talho|sangr|acutilan|farpad/i,                               cond: "sangrando",  alvo: "alvo", chance: 0.45, dif: 0 },
  /* Estes dois vêm ANTES dos debuffs de propósito: "Grito de Guerra" e
     "Postura Defensiva" são buffs, mas casariam com "grito" (terror) e
     "guarda" se a ordem fosse outra. A primeira linha que casa vence. */
  { id: "inspiracao", re: /grito de guerra|inspir|canção|cancao|hino|balada|arenga|estandarte|brado/i,          cond: "inspirado",  alvo: "aliados", chance: 1, dif: 0 },
  { id: "guarda",     re: /postura defensiv|defensiv|escudo|barreira|prote[çc]|muralha|couraça|couraca|égide|egide|aparar|bloquei|reduz o dano/i, cond: "protegido", alvo: "proprio", chance: 1, dif: 0 },

  { id: "concussao",  re: /atordo|concuss|maça|maca de|martelo|marreta|clava|pancada|trov[aã]o|estrondo|cabeçada/i,          cond: "atordoado",  alvo: "alvo", chance: 0.35, dif: 1 },
  { id: "paralisia",  re: /paralis|petrific|basilisco|medusa|estase|entorpec/i,                                             cond: "paralisado", alvo: "alvo", chance: 0.35, dif: 1 },
  { id: "gelo",       re: /gélid|gelid|gelo|congel|glacial|nevasca|frio mordaz/i,                                           cond: "lento",      alvo: "alvo", chance: 0.5,  dif: 0 },
  { id: "cegueira",   re: /cega|cegue|ofusc|clarão|clarao|areia nos olhos|fumaça|fumaca|flash/i,                            cond: "cego",       alvo: "alvo", chance: 0.45, dif: 0 },
  { id: "terror",     re: /terror|pavor|medo|amedront|uivo|berro|aterrad|macabr|espectr|assombr|arrepi/i,                   cond: "amedrontado", alvo: "alvo", chance: 0.45, dif: 0 },
  /* v9.45: "prende", "imobiliza", "impede de sair do lugar" são a mesma coisa
     que rede e teia, e faltavam. A varredura de habilidades encontrou Prisão
     Arcana ("Prende um inimigo por 2 turnos") e Armadilha ("Prende o primeiro
     inimigo que passar") sem nenhum portador — duas habilidades cujo efeito
     inteiro é a palavra que ninguém estava lendo. */
  { id: "prisao",     re: /rede|teia|laço|laco|corda|grilh[aã]o|agarr|enred|lama|piche|raiz|vinha|prend[ea]|prision|aprision|imobiliz|algem|cativ/i, cond: "agarrado",   alvo: "alvo", chance: 0.5,  dif: 0 },
  /* "para de lutar", "sai da luta", "não ataca mais" — o Fascínio do Bardo
     dizia isso por extenso e o sistema não tinha onde encaixar. */
  { id: "fascinio",   re: /fascin|para de lutar|deixa de lutar|baixa a arma|perde a vontade de lutar|encara sem reagir/i,     cond: "enfeiticado", alvo: "alvo", chance: 0.5, dif: 1 },
  /* "impede de usar habilidades" (Toque da Quietude) e "silêncio": quem não
     conjura perde a ação mágica, e Atordoado é o mais próximo do catálogo. */
  { id: "quietude",   re: /impede.{0,20}(habilidade|magia|conjur)|silenc|emudec|sela a voz|sem conseguir conjurar/i,          cond: "atordoado",  alvo: "alvo", chance: 0.5, dif: 1 },
  { id: "encanto",    re: /encant|enfeitiç|enfeitic|domin|hipnot|sedu|canto de sereia|sussurr|persuas[aã]o arcana/i,        cond: "enfeiticado", alvo: "alvo", chance: 0.4,  dif: 1 },
  { id: "derrubada",  re: /derrub|investida|rasteira|empurr|tromba|arremete|carga|placagem/i,                               cond: "caido",      alvo: "alvo", chance: 0.45, dif: 0 },
  { id: "drenagem",   re: /drena|suga|debilit|enfraquec|maldi[çc]|praga|definha|murcha/i,                                   cond: "enfraquecido", alvo: "alvo", chance: 0.45, dif: 0 },
  { id: "lentidao",   re: /lentid|retard|melaço|melaco|atras|peso do tempo/i,                                              cond: "lento",      alvo: "alvo", chance: 0.5,  dif: 0 },

  /* ---- buffs em quem usa ou nos aliados ---- */
  { id: "bencao",     re: /bênção|bencao|abençoa|abencoa|consagra|graça divina|milagre menor|oração|oracao/i, cond: "abencoado",  alvo: "aliados", chance: 1, dif: 0 },
  { id: "furia",      re: /fúria|furia|frenesi|enfurec|berserk|sanha/i,                                       cond: "enfurecido", alvo: "proprio", chance: 1, dif: 0 },
  { id: "pressa",     re: /pressa|acelera|velocidade|ligeireza|ímpeto|impeto|passo rápido|passo rapido/i,      cond: "apressado",  alvo: "proprio", chance: 1, dif: 0 },
  { id: "sombra",     re: /furtiv|sombra|invisib|silencios|camufla|espreita/i,                                cond: "furtivo",    alvo: "proprio", chance: 1, dif: 0 },
  { id: "vigor",      re: /fortalec|força bruta|forca bruta|potenciali/i,                                     cond: "fortalecido", alvo: "proprio", chance: 1, dif: 0 },
];

/* Lê qualquer fonte (nome da arma + elemento, nome+descrição da habilidade,
   nome+descrição da criatura) e diz o que ela carrega. */
export function aflicaoDe(...partes) {
  const texto = partes.filter(Boolean).join(" ");
  if (!texto.trim()) return null;
  for (const p of PORTADORES) if (p.re.test(texto)) return p;
  return null;
}

/* Atributo que resiste a cada condição — o catálogo já diz; aqui só o
   traduzimos para a ficha de quem quer que esteja apanhando. */
function modDoAlvo(alvo, attr) {
  const a = (alvo && alvo.atributos) || {};
  const base = a[attr] != null ? a[attr] : Math.max(a.vigor || 0, a.destreza || 0, a.intelecto || 0);
  /* inimigos não têm ficha de atributos: usam o próprio nível como corpo */
  const porNivel = Math.floor(((alvo && alvo.nivel) || 1) / 4);
  return (Number(base) || 0) + porNivel;
}

/* ---------------- O DADO QUE DECIDE ----------------
   Um só ponto de verdade: quem tenta afligir, quem resiste, e o texto
   pronto para o jogador e para o Mestre. Devolve null quando a fonte
   não carrega nada (a maioria dos golpes). */
export function rolarAflicao({ fonte, nomeFonte = "", atacante = "", alvo, alvoNome = "", critico = false, sempre = false }) {
  const port = typeof fonte === "object" && fonte ? fonte : aflicaoDe(fonte);
  if (!port) return null;
  const cat = CONDICOES[port.cond];
  if (!cat) return null;
  if (!sempre && !critico && Math.random() > port.chance) return null;
  /* já está sob a mesma condição? não empilha */
  if ((alvo && (alvo.condicoes || []).some((c) => c.id === port.cond))) return null;

  const cond = criarCondicao(port.cond, { origem: nomeFonte || atacante });
  if (!cond) return null;

  /* buffs não têm resistência: quem se abençoa, se abençoa */
  if (port.alvo !== "alvo") {
    return {
      aplicou: true, resistiu: false, cond, portador: port, escopo: port.alvo,
      texto: `${cond.icone} ${atacante || "Alguém"} — ${nomeFonte || cond.nome}: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}`,
      nota: `[EFEITO APLICADO PELO SISTEMA] ${nomeFonte || cond.nome} deixou ${port.alvo === "proprio" ? atacante : "o grupo"} ${cond.nome.toLowerCase()} (${cond.efeito}). Já está aplicado — narre a manifestação, não recalcule nem envie condição.`,
    };
  }

  const dif = ((cat.resistir && cat.resistir.dif) || 12) + (port.dif || 0) + (critico ? 2 : 0);
  const attr = (cat.resistir && cat.resistir.attr) || "vigor";
  const rolo = 1 + Math.floor(Math.random() * 20) + modDoAlvo(alvo, attr);
  const nomeAlvo = alvoNome || (alvo && alvo.nome) || "o alvo";

  if (rolo >= dif) {
    return {
      aplicou: false, resistiu: true, cond, portador: port, escopo: "alvo",
      texto: `🎲 ${nomeFonte || "o golpe"} tentou deixar ${nomeAlvo} ${cond.nome.toLowerCase()} — resistiu (${rolo} vs ${dif}).`,
      nota: `[AFLIÇÃO RESISTIDA — sistema rolou] ${nomeFonte || "O golpe"} de ${atacante} carregava ${cond.nome.toLowerCase()}; ${nomeAlvo} passou no teste (${rolo} vs ${dif}). Narre o perigo que passou raspando e NÃO aplique a condição.`,
    };
  }
  return {
    aplicou: true, resistiu: false, cond, portador: port, escopo: "alvo",
    texto: `${cond.icone} ${nomeAlvo} está ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""} — ${nomeFonte || atacante} (${rolo} vs ${dif})`,
    nota: `[AFLIÇÃO APLICADA — sistema rolou] ${nomeFonte || "O golpe"} de ${atacante} deixou ${nomeAlvo} ${cond.nome.toLowerCase()}: falhou no teste (${rolo} vs ${dif}). Efeito e duração já estão aplicados (${cond.efeito}). Narre isso como fato — e não invente outro efeito nem outra condição: condição é do sistema.`,
  };
}

/* ---------------- GOLPES DE CRIATURA (catálogo) ----------------
   Antes, todo inimigo "atacava". Agora cada criatura tem golpes com
   NOME, tirados de um catálogo por elemento — o Mestre narra "Mordida
   peçonhenta" em vez de improvisar, e o golpe carrega a aflição certa
   porque o próprio nome está no catálogo de portadores. Determinístico
   pelo nome da criatura: o mesmo bicho usa sempre o mesmo repertório. */
export const GOLPES_POR_ELEMENTO = {
  veneno:  ["Mordida peçonhenta", "Ferroada tóxica", "Cuspe ácido", "Presas envenenadas"],
  fogo:    ["Sopro incandescente", "Garra flamejante", "Jato de brasas", "Bafo ígneo"],
  gelo:    ["Toque gélido", "Lufada glacial", "Estilhaço de gelo", "Mordida congelante"],
  raio:    ["Descarga estrondosa", "Chicote de raios", "Estrondo de trovão", "Fagulha atordoante"],
  sombrio: ["Toque espectral", "Uivo aterrador", "Garra macabra", "Sussurro assombrado"],
  sagrado: ["Lâmina radiante", "Clarão ofuscante", "Golpe consagrado", "Julgamento em luz"],
  arcano:  ["Dardo arcano", "Pulso encantado", "Amarras místicas", "Sussurro hipnótico"],
  fisico:  ["Golpe pesado", "Investida brutal", "Talho profundo", "Cabeçada estonteante", "Rasteira", "Marretada"],
};

function hashNome(s) {
  let h = 2166136261;
  const t = String(s || "");
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h >>> 0;
}

/* Repertório fixo de uma criatura: 1 golpe (fracos) a 3 (lendários),
   sempre os mesmos para o mesmo nome. */
export function golpesDeCriatura(nome, elemento = "fisico", ameaca = "comum") {
  const pool = GOLPES_POR_ELEMENTO[elemento] || GOLPES_POR_ELEMENTO.fisico;
  const quantos = ameaca === "lendario" ? 3 : ameaca === "elite" ? 2 : ameaca === "fraco" ? 1 : 2;
  const h = hashNome(nome);
  const fisicos = GOLPES_POR_ELEMENTO.fisico;
  const lista = [];
  for (let i = 0; i < quantos; i++) {
    /* o primeiro golpe é do elemento da criatura; os outros alternam com
       um golpe físico, para o bicho não ser só um truque repetido */
    const fonte = i === 0 ? pool : (i % 2 ? fisicos : pool);
    lista.push(fonte[(h + i * 7) % fonte.length]);
  }
  return lista;
}

export function golpeDaVez(nome, elemento, ameaca, indice = 0) {
  const g = golpesDeCriatura(nome, elemento, ameaca);
  return g[indice % g.length] || g[0];
}

export const AFLICOES_PROMPT = `GOLPES E AFLIÇÕES (v9.1 — o sistema decide, você narra):
- Armas, habilidades, magias e golpes de criatura são lidos por um catálogo do sistema. Uma adaga envenenada envenena, uma maça atordoa, um sopro ígneo queima — o SISTEMA reconhece a fonte, rola o teste do alvo e aplica (ou não) a condição, para o herói, para os companheiros e para os inimigos igualmente.
- Quando isso acontecer você recebe o resultado pronto ("[AFLIÇÃO APLICADA — sistema rolou]" ou "RESISTIDA"). Narre exatamente o que o sistema decidiu: não envenene ninguém por conta própria, não anule o que passou, não invente outro efeito.
- Os inimigos têm GOLPES COM NOME vindos do catálogo (ex.: "Mordida peçonhenta", "Sopro incandescente"). O envelope de combate diz qual golpe foi usado — use esse nome na narração em vez de inventar um ataque genérico.
- Se o jogador descrever uma manobra que deveria afligir (jogar areia nos olhos, chutar o joelho, incendiar), NÃO aplique nada: peça a rolagem apropriada e deixe o sistema decidir.`;
