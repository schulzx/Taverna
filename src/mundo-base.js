/* ============================================================
   BASE DO MUNDO (v9.8) — a bíblia que o Mestre consulta

   A ideia: parar de pedir ao Mestre que INVENTE o mundo a cada
   turno. Ele inventa demais, esquece o que inventou, repete nomes,
   contradiz a cidade de ontem — e cada invenção custa tokens.

   Aqui o mundo já existe antes de a primeira cena começar. Cada
   cidade tem seus locais; cada local tem sua gente, com nome, cara
   e personalidade; há coisas escondidas em lugares específicos;
   há criaturas que moram em cada região; e há chefes — um da linha
   principal, outros à margem — esperando a hora de aparecer.

   O TRUQUE PARA NÃO INCHAR O SAVE: nada disso é gravado. Tudo é
   derivado da semente do mundo, por função pura. O save guarda só
   o que MUDOU — quem já foi revelado, quem morreu, o que já foi
   saqueado. Três listas de texto, e o mundo inteiro cabe nelas.

   É o mesmo princípio que já sustenta os mercadores por semana e a
   devoção por cidade: o mundo não é armazenado, é RECALCULADO.
   ============================================================ */

import { rngDe } from "./geografia.js";
import { pessoaDiversa, nomeTaverna, nomePessoa } from "./nomes.js";
/* v9.103: o léxico nomeia lugar e bicho. O TIPO e a AMEAÇA continuam
   sendo do código — o que vem daqui é só a palavra. */
import { nomesDeLugar, chamadoDoLugar, criaturasDaAmeaca } from "./lexico.js";
import { nomeDeLocal } from "./toponimia.js";
import { criaturasDoGenero } from "./bestiario.js";
import { moldePorId } from "./moldes.js";
/* v9.136: a INDOLE. Cada pessoa do mundo nasce com traços que não brigam
   entre si, um medo que só acorda quando a coisa está na cena, uma força e
   — se ela for de voltar — um propósito com condição de amadurecer. */
import { indoleDe } from "./indole.js";

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const entre = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));

/* ---------------- LOCAIS ----------------
   Quantos e quais dependem do porte: uma aldeia não tem arena, uma
   capital não deixa de ter templo. */
const LOCAIS_POR_PORTE = {
  aldeia: 2, vila: 3, cidade: 5, fortaleza: 4, capital: 7,
};
const LOCAIS = [
  { tipo: "taverna", icone: "🍺", sempre: true, papeis: ["taverneiro(a)", "serviçal", "músico de canto", "bêbado veterano"] },
  { tipo: "mercado", icone: "⚖", sempre: true, papeis: ["mercador(a)", "vendedor de ervas", "batedor de carteiras", "caravaneiro"] },
  { tipo: "templo", icone: "🕯", porteMin: 2, papeis: ["sacerdote(isa)", "acólito", "peregrino", "guardião da relíquia"] },
  { tipo: "forja", icone: "🔨", porteMin: 2, papeis: ["ferreiro(a)", "aprendiz", "encomendante impaciente"] },
  { tipo: "quartel", icone: "🛡", porteMin: 3, papeis: ["capitão(ã) da guarda", "recruta", "sargento cansado"] },
  { tipo: "cadeia", icone: "⛓", porteMin: 3, papeis: ["carcereiro(a)", "prisioneiro que fala demais", "escrivão"] },
  { tipo: "biblioteca", icone: "📖", porteMin: 4, papeis: ["arquivista", "estudante", "tradutor de línguas mortas"] },
  { tipo: "docas", icone: "⚓", bioma: ["costa"], papeis: ["mestre do porto", "marinheiro", "contrabandista"] },
  { tipo: "arena", icone: "⚔", porteMin: 5, papeis: ["empresário da arena", "campeão local", "apostador"] },
  { tipo: "cemitério", icone: "🪦", porteMin: 2, papeis: ["coveiro(a)", "carpideira", "visitante silencioso"] },
  { tipo: "guilda", icone: "🏛", porteMin: 4, papeis: ["mestre de guilda", "recrutador", "veterano aposentado"] },
  { tipo: "casa de banhos", icone: "💧", porteMin: 4, papeis: ["dono(a) da casa", "atendente", "cliente indiscreto"] },
];
const PESO_PORTE = { aldeia: 1, vila: 2, cidade: 4, fortaleza: 3, capital: 5 };

/* Um porte que o sobremundo não conhece ("átrio", "porto franco", "colônia")
   ainda precisa de peso e de quantidade de locais. O molde lista os portes
   do menor para o maior, então a POSIÇÃO na lista é a resposta — sem tabela
   nova por molde. */
function posicaoDoPorte(M, porte) {
  const i = (M.portes || []).indexOf(porte);
  return i < 0 ? 2 : i;
}
function pesoDoPorte(M, porte) { return [1, 2, 4, 3, 5][posicaoDoPorte(M, porte)] || 3; }
function quantosLocais(M, porte) {
  const tabela = (M.locaisPorPorte && M.locaisPorPorte.length === 5) ? M.locaisPorPorte : [2, 3, 5, 4, 7];
  return tabela[posicaoDoPorte(M, porte)] || 3;
}

const NOME_LOCAL = {
  taverna: null,   // usa o banco de tavernas
  mercado: ["Praça das Balanças", "Mercado Velho", "Feira Baixa", "Pátio dos Cambistas", "Mercado do Meio-dia"],
  templo: ["Templo Pálido", "Casa da Vigília", "Santuário de Pedra", "Capela das Cinzas", "Altar do Caminho"],
  forja: ["Bigorna Torta", "Forja do Sul", "Casa do Martelo", "Fole Vermelho"],
  quartel: ["Casa da Guarda", "Quartel de Pedra", "Posto Alto", "Torre dos Vigias"],
  cadeia: ["A Fossa", "Cárcere Velho", "Celas do Rio", "Torre Muda"],
  biblioteca: ["Arquivo Menor", "Casa dos Papéis", "Biblioteca do Corvo", "Sala das Cópias"],
  docas: ["Cais Torto", "Ancoradouro Norte", "Docas Fundas", "Píer dos Ossos"],
  arena: ["Círculo de Areia", "Fosso da Multidão", "Arena Baixa"],
  cemitério: ["Campo Calado", "Jazigo Antigo", "Colina dos Nomes", "Terra Rasa"],
  guilda: ["Salão dos Contratos", "Casa Franca", "Guilda do Elmo", "Mesa Redonda"],
  "casa de banhos": ["Águas Quentes", "Casa de Vapor", "Fonte Coberta"],
};

/* v9.40: o MOLDE decide o que existe dentro de um assentamento. Uma torre
   não tem docas nem taverna — tem fogueira, feira do degrau e o portal. O
   parâmetro é o último e tem padrão, então quem ainda não passa molde
   continua gerando o sobremundo de sempre. */
export function locaisDaCidade(semente, cidade, genero = "Fantasia medieval", molde = null, lex = null) {
  if (!cidade || !cidade.nome) return [];
  const M = moldePorId(molde && molde.id ? molde.id : molde);
  const TABELA = M.locais || LOCAIS;
  const rnd = rngDe(`${semente}|locais|${cidade.nome}`);
  const peso = PESO_PORTE[cidade.porte || cidade.tipo] || pesoDoPorte(M, cidade.porte || cidade.tipo);
  const quantos = LOCAIS_POR_PORTE[cidade.porte || cidade.tipo] || quantosLocais(M, cidade.porte || cidade.tipo);
  const elegiveis = TABELA.filter((l) => {
    if (l.bioma && !l.bioma.includes(cidade.bioma)) return false;
    if (l.porteMin && peso < l.porteMin) return false;
    return true;
  });
  /* v9.40: "sempre" passou a significar SEMPRE. O laço antigo parava ao
     atingir a contagem do porte, e num patamar da Torre (2 locais) isso
     cortava justamente o PORTAL — a única saída para cima. Um lugar sem a
     sua saída obrigatória é um beco, e nenhuma contagem justifica isso. */
  const escolhidos = elegiveis.filter((l) => l.sempre);
  const resto = elegiveis.filter((l) => !escolhidos.includes(l));
  while (escolhidos.length < quantos && resto.length) {
    escolhidos.push(resto.splice(Math.floor(rnd() * resto.length), 1)[0]);
  }
  return escolhidos.map((l) => {
    /* o molde traz o próprio banco de nomes; sem ele, o do sobremundo; sem
       nenhum dos dois, o tipo vira o nome (feio, mas nunca vazio) */
    /* v9.58: O NOME VEM DA COMBINAÇÃO, NÃO DA LISTA. As listas curtas de
       NOME_LOCAL faziam a mesma "Feira Baixa" aparecer em duas cidades do
       mesmo mundo — cinco nomes para catorze mercados —, e a mesma taverna
       reaparecer em criações diferentes. O molde ainda manda quando traz
       banco próprio: uma Torre nomeia os degraus dela melhor do que o
       sobremundo nomearia. E NOME_LOCAL sobrevive como rede: um tipo que a
       toponímia não conheça continua tendo nome. */
    /* v9.103: O LÉXICO PRIMEIRO, o molde depois, o genérico por último.
       A ordem é a mesma que a v9.102 acertou nas cidades: o molde diz a
       FORMA do mundo e o léxico diz a IDENTIDADE dele. E os moldes
       exóticos não perdem nada — a Torre tem tipos de local que não
       existem na lista fechada do léxico, então ele não tem o que dizer
       sobre elas e o molde responde naturalmente. */
    /* e o mesmo cuidado aqui: `nomeDeLocal` gasta três ou quatro sorteios
       e `pick` gasta um. Com o gerador compartilhado, ligar o léxico
       mudaria o nome de TODOS os locais seguintes — o que não quebra
       mecânica nenhuma, mas é a mesma armadilha e não vale deixar armada. */
    const rl = rngDe(`${semente}|nome-local|${cidade.nome}|${l.tipo}`);
    const doLex = nomesDeLugar(lex, l.tipo);
    const nomes = M.nomesLocal && M.nomesLocal[l.tipo];
    const nome = doLex ? pick(rl, doLex)
      : nomes ? pick(rl, nomes)
        : (nomeDeLocal(l.tipo, genero, rl) || (NOME_LOCAL[l.tipo] ? pick(rl, NOME_LOCAL[l.tipo]) : l.tipo));
    /* `chamado` é COMO ESSE TIPO SE DIZ aqui — "sede da guilda" no lugar
       de "taverna". O `tipo` fica intocado, porque é por ele que o
       mercado é procurado, o cômodo é desenhado e o porte conta. */
    const chamado = chamadoDoLugar(lex, l.tipo);
    return { id: `${cidade.nome}|${l.tipo}`, tipo: l.tipo, icone: l.icone, nome, chamado, cidade: cidade.nome, porte: cidade.porte || cidade.tipo, papeis: l.papeis };
  });
}

/* ---------------- A GENTE ----------------
   Ninguém é "um taverneiro". Cada um tem nome, raça, ofício, um traço de
   personalidade e uma VONTADE — que é o que transforma figurante em cena. */
const VONTADES = [
  "quer sair desta cidade antes do inverno", "deve dinheiro a gente perigosa",
  "procura um irmão que sumiu", "esconde de onde veio", "quer vingança e não tem coragem",
  "guarda uma carta que nunca entregou", "sonha em ser lembrado por algo",
  "protege alguém que não merece", "sabe de um crime e cala", "está apaixonado sem retorno",
  "quer comprar a liberdade de alguém", "acredita numa profecia que ninguém leva a sério",
  "trai o patrão em pequenas coisas", "tem medo de dormir", "juntou dinheiro para uma viagem impossível",
  "cuida de um filho que não é dele", "espera um navio que talvez não venha",
];
const MODOS = [
  "fala baixo e olha para os lados", "ri antes de terminar a frase", "não olha nos olhos",
  "aperta a mão forte demais", "conta vantagem", "responde com outra pergunta",
  "fala pelos cotovelos", "mede as palavras como quem paga por elas",
  "trata todo mundo por apelido", "tem sempre pressa", "para no meio da frase e recomeça",
];

/* v9.102: `lex` é o LÉXICO DO MUNDO, e ele entra por último em toda esta
   família de funções — do mesmo jeito que `molde` entrou antes dele. É
   quem faz a gente da base ter nome, povo e ofício DAQUI: sem ele, um
   mundo de caçadores ficava povoado por Aldric, o ferreiro. */
export function genteDoLocal(semente, local, genero = "Fantasia medieval", molde = null, lex = null) {
  if (!local) return [];
  const VONT = moldePorId(molde && molde.id ? molde.id : molde).vontades || VONTADES;
  const rnd = rngDe(`${semente}|gente|${local.id}`);
  const quantos = entre(rnd, 2, 3);
  const out = [];
  for (let i = 0; i < quantos; i++) {
    const p = pessoaDiversa(genero, rnd, lex);
    out.push({
      id: `${local.id}|${i}`,
      nome: p.nome,
      raca: p.raca,
      genero_pessoa: p.genero_pessoa,
      papel: (local.papeis && local.papeis[i % local.papeis.length]) || p.ocupacao,
      traco: p.traco,
      modo: pick(rnd, MODOS),
      vontade: pick(rnd, VONT),
      local: local.nome,
      cidade: local.cidade,
    });
    out[out.length - 1].indole = indoleDe(semente, out[out.length - 1]);
  }
  return out;
}

/* ---------------- O QUE ESTÁ ESCONDIDO ----------------
   O exemplo do autor: "na taverna tem um baú escondido". Cada cidade guarda
   uma ou duas coisas, num local NOMEADO — e só aparecem por teste ou busca. */
const SEGREDOS = [
  { tipo: "bau", icone: "🧰", o: "um baú escondido sob o assoalho", acha: "percepcao", dc: 15 },
  { tipo: "alcapao", icone: "🕳", o: "um alçapão atrás de uma prateleira", acha: "percepcao", dc: 16 },
  { tipo: "carta", icone: "✉", o: "uma carta lacrada que ninguém entregou", acha: "intelecto", dc: 14 },
  { tipo: "passagem", icone: "🚪", o: "uma passagem murada por dentro", acha: "percepcao", dc: 17 },
  { tipo: "cofre", icone: "🔐", o: "um cofre pequeno atrás de um quadro", acha: "percepcao", dc: 16 },
  { tipo: "corpo", icone: "🦴", o: "ossos velhos emparedados", acha: "percepcao", dc: 18 },
  { tipo: "registro", icone: "📜", o: "um livro-caixa com contas que não fecham", acha: "intelecto", dc: 15 },
  { tipo: "relicario", icone: "📿", o: "um relicário guardado longe dos olhos", acha: "percepcao", dc: 17 },
];

export function segredosDaCidade(semente, cidade, genero = "Fantasia medieval", molde = null, lex = null) {
  const locais = locaisDaCidade(semente, cidade, genero, molde, lex);
  if (!locais.length) return [];
  const rnd = rngDe(`${semente}|segredos|${cidade.nome}`);
  const quantos = (PESO_PORTE[cidade.porte || cidade.tipo] || 3) >= 4 ? 2 : 1;
  const out = [];
  for (let i = 0; i < quantos; i++) {
    const local = pick(rnd, locais);
    const s = pick(rnd, SEGREDOS);
    out.push({
      id: `${cidade.nome}|segredo|${i}`,
      ...s, local: local.nome, localTipo: local.tipo, cidade: cidade.nome,
    });
  }
  return out;
}

/* ---------------- CRIATURAS DA REGIÃO ----------------
   Variedade de nível é de propósito: o jogador pode escolher enfrentar algo
   muito acima ou muito abaixo dele. O sistema informa o nível — cabe ao
   Mestre não empurrar o herói para o abate. */
const COMPORTAMENTOS = [
  "caça ao amanhecer", "só ataca quem entra no território", "segue viajantes por dias antes de atacar",
  "evita fogo", "vive em bando e foge sozinho", "é atraído por barulho",
  "não ataca quem não olha para ela", "faz ninho perto de água", "coleciona coisas brilhantes",
  "dorme meses e acorda faminta", "tem medo de sinos", "cheira sangue a quilômetros",
];

export function criaturasDaRegiao(semente, regiao, genero = "Fantasia medieval", lex = null) {
  if (!regiao || !regiao.nome) return [];
  const rnd = rngDe(`${semente}|bichos|${regiao.nome}`);
  const banco = criaturasDoGenero(genero);
  const quantos = entre(rnd, 3, 5);
  /* DOIS CONJUNTOS, e a separação é o conserto: `usadas` guarda os nomes
     do BESTIÁRIO e é o que o laço de seleção consulta; `ditos` guarda os
     nomes que o léxico já gastou. Com um conjunto só, um nome do léxico
     entrava na conta da seleção e mudava QUAL criatura era sorteada — e
     com ela a ameaça, o nível e o peso no orçamento. A promessa desta
     versão é que só o nome muda, e essa promessa mora aqui. */
  const usadas = new Set();
  const ditos = new Set();
  const out = [];
  for (let i = 0; i < quantos; i++) {
    let c = null;
    for (let t = 0; t < 12 && !c; t++) { const cand = pick(rnd, banco); if (!usadas.has(cand.nome)) c = cand; }
    if (!c) break;
    usadas.add(c.nome);
    /* v9.103: O NOME VEM DO DEGRAU DE AMEAÇA, e é a mesma regra que vai
       valer para o equipamento. A ameaça decide PV, defesa, dano e o peso
       no orçamento do encontro: um nome tirado do balde errado promete um
       bicho e entrega outro, e quem foi enganado não foi pela ficção — foi
       pelo sistema. Sem léxico, o nome do bestiário, como sempre. */
    /* GERADOR PRÓPRIO, e é o que garante a promessa: sortear o nome pelo
       `rnd` da função consumiria o gerador e mudaria a criatura seguinte.
       Com um gerador derivado, o bestiário é sorteado exatamente igual com
       ou sem léxico — e a única diferença entre os dois mundos é a
       palavra. */
    const bancoDaqui = criaturasDaAmeaca(lex, c.ameaca);
    let nomeDaqui = c.nome;
    if (bancoDaqui) {
      const rn = rngDe(`${semente}|nome-bicho|${regiao.nome}|${i}`);
      const livres = bancoDaqui.filter((x) => !ditos.has(x));
      nomeDaqui = pick(rn, livres.length ? livres : bancoDaqui);
      ditos.add(nomeDaqui);
    }
    out.push({
      id: `${regiao.nome}|${c.nome}`,
      nome: nomeDaqui, ameaca: c.ameaca, nivel: c.nivelRef, desc: c.desc, agil: c.agil,
      regiao: regiao.nome, bioma: regiao.bioma,
      comportamento: pick(rnd, COMPORTAMENTOS),
    });
  }
  return out.sort((a, b) => a.nivel - b.nivel);
}

/* ---------------- OS CHEFES ----------------
   Um da linha principal e alguns à margem. O da linha principal é o mais
   forte e tem laço com o mundo; os outros existem e podem nunca aparecer. */
const TITULOS = [
  "o Sem-Rosto", "a Mão Fria", "o Que Não Dorme", "a Viúva de Ferro", "o Colecionador",
  "o Último Juramento", "a Boca da Cova", "o Rei Emprestado", "a Praga Mansa",
  "o Dono das Chaves", "a Voz do Poço", "o Segundo Sol", "a Corda Comprida",
];
const MOTIVOS = [
  "quer refazer um erro antigo, custe o mundo", "acredita que está salvando todos",
  "cobra uma dívida que ninguém lembra", "quer virar deus", "só quer ser deixado em paz — e mata por isso",
  "cumpre uma ordem de quem já morreu", "quer apagar o próprio nome da história",
  "coleciona algo que não deveria existir", "protege uma coisa pior do que ela",
  "vende o mundo em pedaços pequenos", "está com fome de um jeito que não passa",
];
const PERSONALIDADES_CHEFE = [
  "cortês até o momento exato", "grita pouco e por isso apavora", "fala com você como se te conhecesse",
  "acha graça em tudo", "explica os próprios planos porque quer plateia",
  "não fala nada", "trata o herói como um aprendiz decepcionante",
  "pede desculpas antes de matar", "chama todo mundo pelo nome certo",
];

export function chefesDoMundo(semente, mapa, genero = "Fantasia medieval", lex = null) {
  const regioes = (mapa && mapa.regioes) || [];
  const cidades = (mapa && mapa.cidades) || [];
  if (!regioes.length && !cidades.length) return [];
  const rnd = rngDe(`${semente}|chefes`);
  const banco = criaturasDoGenero(genero).filter((c) => c.nivelRef >= 4);
  const quantos = entre(rnd, 4, 6);
  const out = [];
  for (let i = 0; i < quantos; i++) {
    const principal = i === 0;
    const base = pick(rnd, banco);
    const humanoide = rnd() < 0.45;
    const nome = humanoide ? nomePessoa(genero, undefined, rnd, lex) : base.nome;
    const titulo = pick(rnd, TITULOS);
    const reg = regioes.length ? pick(rnd, regioes) : null;
    const covil = cidades.length ? pick(rnd, cidades) : null;
    /* o principal é o teto do mundo; os secundários variam muito de propósito */
    const nivel = principal ? Math.max(14, base.nivelRef + entre(rnd, 4, 8)) : Math.max(3, base.nivelRef + entre(rnd, -1, 5));
    const gd = principal && rnd() < 0.5 ? entre(rnd, 3, 4) : (rnd() < 0.15 ? 3 : 0);
    out.push({
      id: `chefe|${i}`,
      nome: humanoide ? `${nome}, ${titulo}` : `${base.nome} ${titulo}`,
      nomeCurto: humanoide ? String(nome).split(" ")[0] : base.nome,
      especie: base.nome,
      linha: principal ? "principal" : "secundaria",
      nivel, gd,
      ameaca: nivel >= 14 ? "lendario" : nivel >= 8 ? "elite" : "competente",
      regiao: reg ? reg.nome : "", covil: covil ? covil.nome : "",
      personalidade: pick(rnd, PERSONALIDADES_CHEFE),
      motivo: pick(rnd, MOTIVOS),
      desc: base.desc,
    });
  }
  return out;
}

/* ---------------- MASMORRAS NO MAPA (v9.9) ----------------
   Antes as masmorras nasciam no instante em que o jogador clicava "explorar":
   não existiam no mundo, não tinham lugar, e ninguém podia ouvir falar delas
   antes. Agora estão no chão desde o primeiro dia, com nome, região, cidade
   mais próxima e nível — e o rumor pode chegar antes do herói. */
const TIPOS_MASMORRA = [
  { tipo: "cripta", icone: "⚰", nomes: ["Cripta dos {x}", "Sepulcro de {x}", "Ossuário {x}"] },
  { tipo: "ruína", icone: "🏚", nomes: ["Ruínas de {x}", "O que sobrou de {x}", "Alicerces de {x}"] },
  { tipo: "caverna", icone: "🕳", nomes: ["Gruta {x}", "Fenda de {x}", "A Boca de {x}"] },
  { tipo: "torre", icone: "🗼", nomes: ["Torre de {x}", "Agulha de {x}", "O Prumo de {x}"] },
  { tipo: "mina", icone: "⛏", nomes: ["Mina de {x}", "Poço de {x}", "Veio {x}"] },
  { tipo: "templo", icone: "🛕", nomes: ["Templo Afogado de {x}", "Santuário Cego de {x}", "A Nave de {x}"] },
  { tipo: "forte", icone: "🏰", nomes: ["Forte Abandonado de {x}", "Bastião de {x}", "Muralha Quebrada de {x}"] },
];
const EPITETOS = ["Ferro", "Cinzas", "Vidro", "Sal", "Névoa", "Espinhos", "Prata Podre", "Silêncio", "Sangue Velho", "Mil Bocas", "Corvos", "Pedra Torta", "Gelo Fundo", "Raízes"];
const RUMORES = [
  "dizem que ninguém que entrou de noite voltou", "um pastor jura ter visto luz lá dentro",
  "a guarda proibiu a estrada que leva até lá", "há uma recompensa antiga por notícias do lugar",
  "as pessoas da região não falam o nome em voz alta", "um mercador vende mapas duvidosos do interior",
  "contam que o dono ainda está lá, esperando", "crianças somem quando a neblina desce",
];

export function masmorrasDoMundo(semente, mapa) {
  const regioes = (mapa && mapa.regioes) || [];
  const cidades = (mapa && mapa.cidades) || [];
  if (!regioes.length) return [];
  const rnd = rngDe(`${semente}|masmorras`);
  const out = [];
  for (const reg of regioes) {
    const quantas = entre(rnd, 1, 2);
    for (let i = 0; i < quantas; i++) {
      const t = pick(rnd, TIPOS_MASMORRA);
      const nome = pick(rnd, t.nomes).replace("{x}", pick(rnd, EPITETOS));
      const perto = cidades.filter((c) => c.regiao === reg.nome);
      const cidade = perto.length ? pick(rnd, perto) : (cidades.length ? pick(rnd, cidades) : null);
      out.push({
        id: `masmorra|${reg.nome}|${i}`,
        nome, tipo: t.tipo, icone: t.icone,
        regiao: reg.nome, bioma: reg.bioma,
        cidadeProxima: cidade ? cidade.nome : "",
        nivel: entre(rnd, 1, 18),
        salas: entre(rnd, 5, 12),
        rumor: pick(rnd, RUMORES),
        x: cidade ? Math.max(4, Math.min(96, cidade.x + entre(rnd, -8, 8))) : Math.round(reg.cx),
        y: cidade ? Math.max(4, Math.min(96, cidade.y + entre(rnd, -8, 8))) : Math.round(reg.cy),
      });
    }
  }
  return out.sort((a, b) => a.nivel - b.nivel);
}

/* ---------------- TESOUROS ENTERRADOS ----------------
   Baús que não estão em cidade nenhuma: no ermo, achados por quem procura. */
const ESCONDERIJOS = [
  "sob uma pedra marcada com três riscos", "dentro de um tronco oco à beira da trilha",
  "no fundo de um poço seco", "atrás da cachoeira", "num carro de boi tombado há anos",
  "sob o piso de uma capela caída", "numa toca abandonada de bicho grande",
  "enterrado ao pé da única árvore morta", "dentro de uma estátua rachada",
  "num barco encalhado e coberto de limo",
];
const CONTEUDOS = [
  "moedas antigas de um reino que não existe mais", "uma arma que alguém escondeu com pressa",
  "cartas de amor e uma escritura de terra", "componentes de ritual embrulhados em couro",
  "o pagamento de um contrato que nunca foi cumprido",
  /* v9.128: aqui havia "um mapa marcando outro esconderijo", e o mapa não
     marcava nada — virava prata como todo o resto. Promessa de mecânica que
     não existe é pior do que item nenhum: o jogador guarda o mapa a campanha
     inteira esperando o segundo esconderijo. Volta no dia em que o achado
     souber revelar outro ponto no pergaminho. */
  "um cofre de viagem com o fecho arrombado",
  "joias soltas e um dedo mumificado", "frascos que ainda estão bons",
];

export function tesourosDoMundo(semente, mapa) {
  const regioes = (mapa && mapa.regioes) || [];
  const cidades = (mapa && mapa.cidades) || [];
  if (!regioes.length) return [];
  const rnd = rngDe(`${semente}|tesouros`);
  const out = [];
  for (const reg of regioes) {
    const quantos = entre(rnd, 1, 2);
    for (let i = 0; i < quantos; i++) {
      const perto = cidades.filter((c) => c.regiao === reg.nome);
      const cidade = perto.length ? pick(rnd, perto) : null;
      out.push({
        id: `tesouro|${reg.nome}|${i}`, icone: "🧰",
        regiao: reg.nome, perto: cidade ? cidade.nome : reg.nome,
        onde: pick(rnd, ESCONDERIJOS), conteudo: pick(rnd, CONTEUDOS),
        acha: "percepcao", dc: entre(rnd, 13, 19),
      });
    }
  }
  return out;
}

/* ---------------- O LIVRO-RAZÃO ----------------
   O ÚNICO pedaço que vai para o save. Três listas de texto. */
/* ---------------- A SITUAÇÃO DE CADA UM (v9.130) — fase 2 ----------------
   Gente marcante deixa de ser só um fato para o Narrador citar e passa a ter
   ESTADO. Sem isto não há resgate que se possa conferir: "tirar Ione de lá"
   precisa de um "lá" e de um estado que mude quando ela sai.

   Cinco degraus, e só. Um catálogo maior seria um catálogo que ninguém
   consegue mudar por ato de jogo — e situação que nada altera é adjetivo. */
export const SITUACOES = {
  livre: "livre",
  escondida: "escondida",
  cativa: "cativa",
  ferida: "ferida",
  morta: "morta",
};
const SITS = Object.values(SITUACOES);

export function situacaoDe(base, nome) {
  const b = garantirBase(base);
  const k = chaveDeGente(nome);
  /* os mortos vieram antes das situações e continuam mandando: um save que
     só tem a lista de mortos não pode ressuscitar ninguém por omissão */
  if (b.mortos.some((x) => chaveDeGente(x) === k)) return SITUACOES.morta;
  return b.situacoes[k] ? b.situacoes[k].situacao : SITUACOES.livre;
}

export function ondeEsta(base, nome) {
  const b = garantirBase(base);
  const r = b.situacoes[chaveDeGente(nome)];
  return r ? { onde: r.onde || "", quem: r.quem || "" } : { onde: "", quem: "" };
}

export function porSituacao(base, nome, situacao, { onde = "", quem = "" } = {}) {
  const b = garantirBase(base);
  const k = chaveDeGente(nome);
  if (!k) return b;
  const sit = SITS.includes(situacao) ? situacao : SITUACOES.livre;
  /* pôr alguém como morta escreve nos DOIS lugares: a lista de mortos é o
     que o resto do jogo já lê, e deixá-la de fora criaria uma pessoa morta
     para a procura e viva para todo o resto */
  const mortos = sit === SITUACOES.morta ? juntar(b.mortos, k) : b.mortos;
  return { ...b, mortos, situacoes: { ...b.situacoes, [k]: { situacao: sit, onde: String(onde).slice(0, 60), quem: String(quem).slice(0, 40) } } };
}

const chaveDeGente = (n) => String(n || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function garantirBase(b) {
  const o = b && typeof b === "object" ? b : {};
  return {
    revelados: Array.isArray(o.revelados) ? o.revelados : [],   // já apresentado em cena
    /* v9.130: a situação de quem importa. Save antigo vem sem, e sem
       situação todo mundo é `livre` — que é o que sempre foi. */
    situacoes: (o.situacoes && typeof o.situacoes === "object") ? o.situacoes : {},
    mortos: Array.isArray(o.mortos) ? o.mortos : [],            // nome riscado no registro
    saqueados: Array.isArray(o.saqueados) ? o.saqueados : [],   // segredo já achado
    versao: 1,
  };
}
const juntar = (lista, item) => (lista.includes(item) ? lista : [...lista, item]);
export function revelar(base, id) { return { ...garantirBase(base), revelados: juntar(garantirBase(base).revelados, id) }; }
export function saquear(base, id) { return { ...garantirBase(base), saqueados: juntar(garantirBase(base).saqueados, id) }; }
export function matar(base, nome) {
  const n = String(nome || "").trim();
  if (!n) return garantirBase(base);
  return porSituacao({ ...garantirBase(base), mortos: juntar(garantirBase(base).mortos, n) }, n, SITUACOES.morta);
}
export function estaMorto(base, nome) {
  const n = String(nome || "").trim().toLowerCase();
  return garantirBase(base).mortos.some((m) => m.toLowerCase() === n);
}
export function foiRevelado(base, id) { return garantirBase(base).revelados.includes(id); }
export function foiSaqueado(base, id) { return garantirBase(base).saqueados.includes(id); }

/* ---------------- O QUE SE ACHA PROCURANDO (v9.14) ----------------
   Este é o pedaço que fechava o ciclo e faltava. O filtro por `foiSaqueado`
   sempre existiu logo abaixo, em oQueExisteAqui — mas nada nunca chamava
   `saquear`, então a lista de saqueados jamais crescia e o filtro era letra
   morta. Resultado: o Mestre recebia o MESMO baú escondido e o MESMO segredo
   em todo turno, para sempre, mesmo depois de o jogador ter achado.

   A peça que faltava é esta: quando o jogador pede um teste, o sistema olha
   se existe algo procurável AQUI com aquele atributo, e é a dificuldade do
   PRÓPRIO segredo que vale — não a genérica do pedido. Quem decide se achou
   é o dado; o Mestre só narra o que já foi decidido. */
export function achavelAqui(semente, mapa, nomeCidade, base, genero, atributo = "percepcao", molde = null, lex = null) {
  const q = oQueExisteAqui(semente, mapa, nomeCidade, base, genero, molde, lex);
  if (!q) return null;
  const cands = [
    ...(q.segredos || []).map((s) => ({ ...s, especie: "segredo", onde: `em ${s.local}` })),
    ...(q.tesouros || []).map((t) => ({ ...t, especie: "tesouro", o: t.conteudo })),
  ].filter((x) => (x.acha || "percepcao") === atributo);
  if (!cands.length) return null;
  /* o mais fácil primeiro: procurar acha o que está mais à mão */
  return cands.sort((a, b) => (a.dc || 0) - (b.dc || 0))[0];
}

/* O que o achado rende. Prosa vira coisa: o sistema lê o conteúdo e decide o
   que entra na bolsa, para o Mestre não ter que arbitrar recompensa. */
export function recompensaDoAchado(achado) {
  if (!achado) return { moedas: 0, componentes: 0, consumiveis: 0, arma: false };
  const dc = achado.dc || 14;
  const txt = String(achado.o || achado.conteudo || "").toLowerCase();
  /* ---------------- O QUE O TEXTO PROMETE, A BOLSA ENTREGA (v9.128) ----------------
     Achado jogando: "uma arma que alguém escondeu com pressa" caía aqui, não
     casava com nenhum padrão de moeda e virava `dc * 4` de prata. O jogador
     lia "arma", abria a bolsa e achava dinheiro — e ele tem razão de esperar
     a arma: o texto não era uma metáfora, era um inventário.

     Toda linha da tabela de conteúdos precisa ter para onde ir. Quando não
     tem, a saída não é reescrever a promessa em letra miúda: é entregar. */
  const arma = /\barma\b|lâmina|lamina|espada|punhal|adaga|machado|arco\b/.test(txt);
  const moedas = arma
    /* quem acha uma arma acha a arma, e o troco é o que estava junto dela */
    ? Math.max(4, Math.round(dc * 1.5))
    : /moeda|joia|pagamento|escritura|contrato/.test(txt) ? dc * 12 : dc * 4;
  const componentes = /componente|ritual|erva|ossos|relicário|relicario/.test(txt) ? 2 : 0;
  const consumiveis = /frasco|poç|poc|elixir/.test(txt) ? 1 : 0;
  return { moedas, componentes, consumiveis, arma };
}

/* O envelope do achado: fato fixo, para o Mestre descrever sem inventar. */
export function envelopeDoAchado(achado, rec) {
  if (!achado) return "";
  const onde = achado.especie === "tesouro" ? `${achado.onde} (perto de ${achado.perto})` : achado.onde;
  const ganho = [
    rec.arma ? "a arma em si, que já está na bolsa" : "",
    rec.moedas ? `◉ ${rec.moedas} moedas` : "",
    rec.componentes ? `${rec.componentes} componente(s) de ofício` : "",
    rec.consumiveis ? `${rec.consumiveis} consumível` : "",
  ].filter(Boolean).join(", ");
  return `[ACHADO — RESOLVIDO PELO SISTEMA] Procurei e ACHEI: ${achado.o}, ${onde}. Isto estava na base do mundo desde a criação — não é invenção sua e não pode virar outra coisa. O sistema já pôs na minha bolsa${ganho ? `: ${ganho}` : " o que havia de aproveitável"} — NÃO envie itens nem moedas. Descreva o momento da descoberta em 2-3 frases: o gesto que revelou, a poeira, o cheiro, o que aquilo sugere sobre quem escondeu. Este esconderijo agora está VAZIO: nunca mais ofereça este mesmo achado.`;
}

/* ---------------- CONSULTA ----------------
   O que o Mestre recebe quando o herói está numa cidade. Mortos saem da
   lista de gente viva; segredos já achados saem da lista de segredos. */
/* Uma cidade que o Mestre inventou antes desta versão (ou que a ficção criou
   no meio do caminho) não está no mapa gerado — e era justamente onde o herói
   costuma estar nos saves antigos. Em vez de devolver nada, o sistema monta
   uma ficha mínima a partir do NOME: determinística, então aquela cidade
   ganha os mesmos locais e a mesma gente para sempre. */
function cidadeSintetica(semente, nome) {
  if (!nome) return null;
  const rnd = rngDe(`${semente}|cidade-avulsa|${nome}`);
  const portes = ["vila", "cidade", "cidade", "fortaleza"];
  const biomas = ["planicie", "floresta", "colina", "montanha", "costa", "pantano"];
  return { nome, porte: pick(rnd, portes), tipo: "cidade", bioma: pick(rnd, biomas), regiao: "", avulsa: true };
}

export function oQueExisteAqui(semente, mapa, nomeCidade, base, genero = "Fantasia medieval", molde = null, lex = null) {
  const cidade = ((mapa && mapa.cidades) || []).find((c) => c.nome === nomeCidade) || cidadeSintetica(semente, nomeCidade);
  if (!cidade) return null;
  const locais = locaisDaCidade(semente, cidade, genero, molde, lex);
  const gente = [];
  for (const l of locais) for (const p of genteDoLocal(semente, l, genero, molde, lex)) if (!estaMorto(base, p.nome)) gente.push(p);
  const segredos = segredosDaCidade(semente, cidade, genero, molde).filter((s) => !foiSaqueado(base, s.id));
  const regiao = ((mapa && mapa.regioes) || []).find((r) => r.nome === cidade.regiao);
  const bichos = regiao ? criaturasDaRegiao(semente, regiao, genero, lex) : [];
  /* o que existe NO CHÃO por perto: masmorras e caches do ermo (v9.9) */
  const perto = masmorrasDoMundo(semente, mapa).filter((m) => m.cidadeProxima === cidade.nome || m.regiao === cidade.regiao);
  const caches = tesourosDoMundo(semente, mapa).filter((t) => (t.perto === cidade.nome || t.regiao === cidade.regiao) && !foiSaqueado(base, t.id));
  return { cidade, locais, gente, segredos, criaturas: bichos, regiao, masmorras: perto, tesouros: caches };
}

/* ---------------- QUEM JÁ ENTROU EM CENA (v9.14) ----------------
   O outro lado do ciclo. Quando um local ou uma pessoa da base aparece na
   narrativa, ela deixa de ser "estoque" e vira parte da história: o sistema
   marca como revelada, e a pessoa entra no registro do códex por código —
   sem depender de o Mestre lembrar de enviá-la. Daí em diante o prompt diz
   "já apareceu", e ele para de reapresentar quem o jogador já conhece. */
const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function mencionadosNaCena(semente, mapa, nomeCidade, base, genero, narrativa, molde = null, lex = null) {
  const texto = semAcento(narrativa);
  if (!texto.trim()) return { locais: [], gente: [] };
  const q = oQueExisteAqui(semente, mapa, nomeCidade, base, genero, molde, lex);
  if (!q) return { locais: [], gente: [] };
  /* ---------------- O ARTIGO COLADO NA PREPOSIÇÃO (v9.58) ----------------
     Achado quando os nomes passaram a ser gerados: quase todo local agora
     nasce com artigo ("A Taça Negra", "O Bazar da Aurora"), e ninguém
     escreve em português "a porta de A Taça Negra" — escreve "da Taça
     Negra". O nome inteiro deixa de aparecer no texto, e a fronteira de
     palavra que existe para não casar pedaço ("Taça" dentro de "Taçador")
     rejeitava o "d" da contração.

     Consequência silenciosa e cara: o local citado em cena nunca virava
     cânone. O bug já existia para as tavernas, que sempre tiveram artigo —
     só não aparecia porque os outros tipos não tinham. */
  const semArtigo = (s) => String(s).replace(/^(o|a|os|as)\s+/i, "").trim();
  const casa = (alvo) => {
    if (alvo.length < 4) return false;
    let i = texto.indexOf(alvo);
    while (i >= 0) {
      const antes = i > 0 ? texto[i - 1] : " ";
      const dep = i + alvo.length < texto.length ? texto[i + alvo.length] : " ";
      if (!/[a-z0-9]/.test(antes) && !/[a-z0-9]/.test(dep)) return true;
      i = texto.indexOf(alvo, i + 1);
    }
    return false;
  };
  const cita = (nome) => {
    const alvo = semAcento(nome);
    if (casa(alvo)) return true;
    const nu = semAcento(semArtigo(nome));
    /* só vale tentar sem o artigo se sobrar nome: "A Fossa" vira "Fossa",
       que ainda identifica; um nome que fosse só o artigo, não. */
    return nu !== alvo && casa(nu);
  };
  return {
    locais: (q.locais || []).filter((l) => !foiRevelado(base, l.id || `${q.cidade.nome}|local|${l.nome}`) && cita(l.nome)),
    gente: (q.gente || []).filter((p) => !foiRevelado(base, `${q.cidade.nome}|gente|${p.nome}`) && cita(p.nome)),
  };
}

/* Os ids que o livro-razão guarda. Ficam aqui para os dois lados — quem
   marca e quem consulta — nunca discordarem sobre a forma da chave. */
export const idDoLocal = (cidade, l) => (l && l.id) || `${cidade}|local|${(l && l.nome) || ""}`;
export const idDaGente = (cidade, p) => `${cidade}|gente|${(p && p.nome) || ""}`;

/* O bloco que entra no prompt. Curto de propósito: é ficha, não literatura. */
export function resumoDaqui(semente, mapa, nomeCidade, base, genero, molde = null, lex = null) {
  const q = oQueExisteAqui(semente, mapa, nomeCidade, base, genero, molde, lex);
  if (!q) return "";
  const marca = (id) => (foiRevelado(base, id) ? " ✓" : "");
  const locais = q.locais.map((l) => `${l.icone} ${l.nome} (${l.tipo})${marca(idDoLocal(q.cidade.nome, l))}`).join(" · ");
  const gente = q.gente.map((p) => `${p.nome}${marca(idDaGente(q.cidade.nome, p))} — ${p.raca}, ${p.papel}, ${p.traco}, ${p.modo}; ${p.vontade}`).join(" | ");
  const seg = q.segredos.map((s) => `${s.icone} em ${s.local}: ${s.o} (só com teste de ${s.acha}, dif. ${s.dc})`).join(" · ");
  const bichos = q.criaturas.map((c) => `${c.nome} (nv ${c.nivel}, ${c.comportamento})`).join(" · ");
  const mms = (q.masmorras || []).map((m) => `${m.icone} ${m.nome} (${m.tipo}, nível ${m.nivel}, ${m.salas} salas — ${m.rumor})`).join(" · ");
  const cofres = (q.tesouros || []).map((t) => `${t.icone} perto de ${t.perto}: ${t.onde} — ${t.conteudo} (percepção, dif. ${t.dc})`).join(" · ");
  return `O QUE EXISTE EM ${q.cidade.nome.toUpperCase()} (base do mundo — use ISTO, não invente):
- Locais: ${locais || "—"}.
- Gente (nomes, ofícios e o que cada um quer — são estas as pessoas da cidade; só crie alguém novo se a cena EXIGIR): ${gente || "—"}.
- O ✓ marca quem/o que JÁ apareceu em cena: o herói conhece, então NUNCA reapresente ("um homem chamado…", "você nunca tinha visto…") — retome a relação de onde parou. Quem está sem ✓ ainda é novidade.
${seg ? `- Escondido (NUNCA revele sem que o jogador procure e passe no teste): ${seg}.\n` : ""}${mms ? `- Masmorras da região (já estão no chão; o povo daqui pode COMENTAR o rumor sem que ninguém tenha entrado): ${mms}.\n` : ""}${cofres ? `- Enterrado no ermo (segredo absoluto até alguém procurar e passar no teste): ${cofres}.\n` : ""}- Criaturas da região ${q.regiao ? q.regiao.nome : ""}: ${bichos || "—"}.`;
}

/* Ficha de um chefe pelo nome — usada para reconciliar o combate_iniciar. */
export function chefePorNome(semente, mapa, genero, nome, lex = null) {
  const alvo = String(nome || "").toLowerCase();
  if (!alvo) return null;
  return chefesDoMundo(semente, mapa, genero, lex).find((c) => alvo.includes(c.nomeCurto.toLowerCase()) || c.nome.toLowerCase() === alvo) || null;
}
export function criaturaPorNome(semente, mapa, genero, nome, lex = null) {
  const alvo = String(nome || "").toLowerCase();
  if (!alvo) return null;
  for (const r of (mapa && mapa.regioes) || []) {
    const achou = criaturasDaRegiao(semente, r, genero, lex).find((c) => alvo.includes(c.nome.toLowerCase()));
    if (achou) return achou;
  }
  return null;
}

export function resumoChefesPrompt(semente, mapa, base, genero, lex = null) {
  const cs = chefesDoMundo(semente, mapa, genero, lex).filter((c) => !estaMorto(base, c.nome) && !estaMorto(base, c.nomeCurto));
  if (!cs.length) return "";
  const linha = (c) => `${c.nome} — ${c.linha === "principal" ? "LINHA PRINCIPAL" : "secundário"}, nível ${c.nivel}${c.gd ? `, GD ${c.gd}` : ""}, ${c.regiao ? `nos arredores de ${c.regiao}` : "paradeiro incerto"}${c.covil ? ` (covil perto de ${c.covil})` : ""}; ${c.personalidade}; ${c.motivo}`;
  return `CHEFES QUE JÁ EXISTEM NESTE MUNDO (do sistema — apresente-os quando a história pedir, na ordem que você achar melhor; NÃO invente outros): ${cs.map(linha).join(" || ")}.`;
}

export const BASE_PROMPT = `BASE DO MUNDO (v9.8 — o mundo já existe; você o revela, não o inventa):
- O sistema gerou o mundo inteiro antes da primeira cena: cidades, os locais de cada cidade, as pessoas de cada local (com nome, raça, ofício, jeito e uma vontade própria), o que está escondido e onde, as criaturas de cada região e os chefes — um da linha principal e outros à margem.
- Quando o jogador chegar num lugar, o envelope traz "O QUE EXISTE EM <cidade>". Use ESSA gente e ESSES locais. Não invente um taverneiro novo se a taverna já tem dono com nome; não crie uma "loja de poções" se ela não está na lista. Só crie alguém quando a cena exigir alguém que a base não previu — e, mesmo aí, prefira usar quem já existe.
- O QUE ESTÁ ESCONDIDO É SEGREDO: você sabe onde está o baú, mas NUNCA entrega sem que o jogador procure e passe no teste indicado. Saber não é contar.
- Os chefes existem desde o começo e não precisam aparecer nunca. Apresente-os quando a história pedir. Nível e GD vêm do sistema: um herói sozinho de nível 15 não tem chance contra um GD 4, e a narração deve deixar isso claro ANTES do confronto, não depois.
- Quem morre sai da base para sempre — o sistema risca o nome. Não traga de volta gente morta, nem "outro sujeito parecido".`;
