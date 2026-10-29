import { pessoaEmJogo, citaveis } from "./relevancia.js";
/* ============================================================
   REGISTRO DE PESSOAS — Taverna
   Todo NPC relevante vira uma FICHA persistente (como as cidades
   no mapa): gerada uma vez, atualizada sempre, e lida pelo Mestre
   em vez de recriada. Blindagem de memória em 3 camadas:
   1) o registro inteiro vai no prompt a cada turno (resumo compacto);
   2) o CÂNONE alimenta o registro por código (se o Mestre esquecer
      de registrar alguém, o app captura sozinho);
   3) a ficha guarda semente determinística — o retrato é sempre
      o mesmo rosto, sem custo de imagem.
   ============================================================ */

/* Relações com o herói (colore o painel e orienta o Mestre) */
export const RELACOES_NPC = {
  aliado: { rotulo: "Aliado", cor: "#7BC98F" },
  amigo: { rotulo: "Amigo", cor: "#7BC98F" },
  romance: { rotulo: "Romance", cor: "#E88BA7" },
  conjuge: { rotulo: "Cônjuge", cor: "#E88BA7" },
  familia: { rotulo: "Família", cor: "#B0A5EC" },
  companheiro: { rotulo: "Companheiro", cor: "#8B7BD8" },
  neutro: { rotulo: "Neutro", cor: "#9B93AC" },
  desconhecido: { rotulo: "Desconhecido", cor: "#9B93AC" },
  rival: { rotulo: "Rival", cor: "#E8A33D" },
  inimigo: { rotulo: "Inimigo", cor: "#D86A5B" },
};

export function relacaoNPC(r) {
  return RELACOES_NPC[(r || "").toLowerCase()] || RELACOES_NPC.desconhecido;
}

/* Cria/atualiza a ficha de um NPC. Campos todos opcionais, menos o nome. */
/* ============================================================
   O LAÇO (v9.97) — quem é o quê de quem

   "Os fins não sabem de quem falam: o sistema escolhe 'um amor que
   termina' sem saber se há um casal registrado nesta campanha."

   O registro sabia `relacao` — aliado, inimigo, neutro — e isso responde
   "de que lado essa pessoa está", que é uma pergunta de facção. Não
   respondia "o que essa pessoa é de mim", que é outra coisa inteira: dá
   para ser aliado de alguém que não se conhece e inimigo de quem se amou.

   `vinculos.js` mede o herói e o COMPANHEIRO num número de 0 a 100, e
   serve bem ao que faz — mas só existe para quem anda no grupo. A gente
   da campanha inteira ficava de fora.

   ---------------- QUEM ESCREVE AQUI ----------------

   O SISTEMA, e só ele, quando uma onda do compasso chega ao clímax. O
   romance é semeado com um NOME escolhido do elenco da cena; se a onda
   completa, o laço fica registrado. É o que fecha o círculo: o "amor que
   termina" da v9.96 passa a saber que havia um amor, e com quem.

   ---------------- E O ROMPIMENTO NÃO APAGA ----------------

   Um laço que acaba vira `rompido`, não some. É essa marca que permite a
   RECONCILIAÇÃO existir — e sem ela o perdão seria um laço nascendo do
   nada, que é a mesma invenção que o registro veio impedir.
   ============================================================ */
export const TIPOS_DE_LACO = [
  { id: "amizade", rotulo: "amizade", diz: "gente que escolheu a minha companhia" },
  { id: "amor", rotulo: "amor", diz: "o que há entre nós dois e ninguém precisa nomear" },
  { id: "rivalidade", rotulo: "rivalidade", diz: "medimo-nos, e nenhum dos dois desiste" },
  { id: "divida", rotulo: "dívida", diz: "um de nós deve ao outro, e os dois sabem" },
  { id: "aprendizado", rotulo: "aprendizado", diz: "um ensina, o outro aprende — e nem sempre o que se quis ensinar" },
  /* O SANGUE. Os cinco de cima são laços que se escolhem, e é justamente
     por isso que este faltava: ninguém escolhe de quem é filho, irmã ou
     pai, e um laço que não se escolhe pesa de outro jeito no dia em que
     alguém põe a mão nele. Sem ele o mundo tinha amores, dívidas e
     mestres, e nenhuma família — como se todo o elenco tivesse nascido
     adulto e sozinho.

     Ele é homônimo do `familia` de `RELACOES_NPC`, lá em cima, e os dois
     não se confundem: aquele diz de que lado a pessoa está comigo (e
     pesa na conversa, em `PESO_DA_RELACAO`); este diz que duas pessoas
     são do mesmo sangue — e vale sobretudo ENTRE dois do elenco, que é
     onde o mundo tem história sem mim no meio. */
  { id: "familia", rotulo: "família", diz: "o mesmo sangue: nenhum dos dois escolheu, e não se desfaz por vontade" },
  /* NÃO há "proteção" aqui, e a ausência é deliberada: ele existiu por dez
     minutos nesta mesma versão, exigido por um assunto e criado por
     nenhum — a regra sem código atrás que esta casa passou a sessão
     caçando, desta vez num catálogo que eu acabara de escrever. O fim
     daquele assunto virou o do APRENDIZADO, que é o certo: o aprendiz que
     supera o mestre. */
];
export function tipoDeLacoPorId(id) { return TIPOS_DE_LACO.find((x) => x.id === id) || null; }

/* A FORÇA é 1, 2 ou 3, e ela não sobe sozinha: sobe quando outra onda do
   mesmo tipo se completa com a mesma pessoa. Um laço que só nasceu é
   diferente de um que já foi provado três vezes, e é essa diferença que
   faz um fim doer. */
export const FORCA_MAX = 3;

export function garantirLaco(l) {
  if (!l || typeof l !== "object" || !tipoDeLacoPorId(l.tipo)) return null;
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  return {
    tipo: l.tipo,
    forca: Math.max(1, Math.min(FORCA_MAX, n(l.forca, 1))),
    desde: n(l.desde, 0),
    rompido: !!l.rompido,
    rompidoEm: n(l.rompidoEm, 0),
  };
}

/* Firmar é criar OU fortalecer. Um laço rompido que se firma de novo
   volta inteiro e perde a marca — mas a força NÃO volta ao que era:
   quem reata não reata no ponto em que parou, e fingir que sim seria
   apagar o que aconteceu no meio. */
export function firmarLaco(npc, tipo, dia = 0) {
  if (!npc || !tipoDeLacoPorId(tipo)) return npc;
  const atual = garantirLaco(npc.laco);
  if (!atual || atual.tipo !== tipo) {
    return { ...npc, laco: { tipo, forca: 1, desde: dia, rompido: false, rompidoEm: 0 } };
  }
  return {
    ...npc,
    laco: {
      ...atual,
      forca: Math.min(FORCA_MAX, atual.rompido ? Math.max(1, atual.forca - 1) : atual.forca + 1),
      rompido: false, rompidoEm: 0,
    },
  };
}

/* ============================================================
   O LAÇO ENTRE DOIS (v9.98) — o mundo com vida própria

   "O laço é sempre com o herói. Não há laço entre dois NPCs, e é o que
   faria o mundo ter vida própria: dois nomes do registro que são alguma
   coisa um do outro, sem mim no meio."

   `laco` é o que a pessoa é DE MIM. `entre` é o que ela é dos OUTROS —
   e é a diferença entre um elenco e um mundo. Numa campanha só com
   `laco`, todo mundo existe em relação ao herói e mais ninguém tem
   história; é a razão pela qual mundos de RPG parecem um teatro que só se
   monta quando o protagonista entra.

   AS DUAS PONTAS ANDAM JUNTAS. Um laço entre Marta e Ubba fica gravado
   nos dois, e quem grava é `firmarEntre`, que devolve o registro inteiro
   — nunca um NPC. Guardar só de um lado é ter meia relação, e a metade
   que falta é a que ninguém lembra de olhar.
   ============================================================ */
export function garantirEntre(e) {
  const o = e && typeof e === "object" ? e : {};
  const r = {};
  for (const [nome, tipo] of Object.entries(o)) {
    if (typeof nome === "string" && nome && tipoDeLacoPorId(tipo)) r[nome] = tipo;
  }
  return r;
}

export function firmarEntre(npcs, a, b, tipo, dia = 0) {
  if (!npcs || !a || !b || a === b || !tipoDeLacoPorId(tipo)) return npcs;
  const ka = Object.keys(npcs).find((k) => k.toLowerCase() === String(a).toLowerCase());
  const kb = Object.keys(npcs).find((k) => k.toLowerCase() === String(b).toLowerCase());
  if (!ka || !kb) return npcs;
  return {
    ...npcs,
    [ka]: { ...npcs[ka], entre: { ...garantirEntre(npcs[ka].entre), [kb]: tipo } },
    [kb]: { ...npcs[kb], entre: { ...garantirEntre(npcs[kb].entre), [ka]: tipo } },
  };
}

/* Os PARES que existem, sem repetir o mesmo par ao contrário — quem
   pergunta "que relações há neste mundo" quer a lista de relações, não a
   de pontas. */
export function paresEntre(npcs, tipo = null) {
  const vistos = new Set(), out = [];
  for (const [nome, npc] of Object.entries(npcs || {})) {
    if (!vivo(npc)) continue;
    for (const [outro, t] of Object.entries(garantirEntre(npc.entre))) {
      if (tipo && t !== tipo) continue;
      const par = [nome, outro].sort().join("|");
      if (vistos.has(par)) continue;
      if (!npcs[outro] || !vivo(npcs[outro])) continue;
      vistos.add(par);
      out.push({ a: nome, b: outro, tipo: t });
    }
  }
  return out;
}

export function romperLaco(npc, dia = 0) {
  const atual = garantirLaco(npc && npc.laco);
  if (!atual) return npc;
  return { ...npc, laco: { ...atual, rompido: true, rompidoEm: dia } };
}

/* AFROUXAR (C2, 11/10) — o "laço −1" de quinze lados das subtramas
   ("separá-los", o voto quebrado, a mentira que se descobre). Havia firmar
   (+1, ou criar) e romper, e nada no meio: o −1 só chegava ao Narrador
   como fato, e o laço no registo ficava igual. Afrouxar tira um passo de
   força e para no piso: um laço de força 1 não se parte por afrouxar —
   partir é outra decisão (`romperLaco`), e fundir as duas apagaria a
   diferença entre "falar menos" e "não falar mais". O rompido já está no
   fundo e não afrouxa; sem laço, nada. Devolve o MESMO objeto quando nada
   muda — o App só grava o que mudou. */
export const AFROUXAR_LACO = { passo: 1, piso: 1 };

export function afrouxarLaco(npc) {
  const atual = garantirLaco(npc && npc.laco);
  if (!atual || atual.rompido) return npc;
  const forca = Math.max(AFROUXAR_LACO.piso, atual.forca - AFROUXAR_LACO.passo);
  if (forca === atual.forca) return npc;
  return { ...npc, laco: { ...atual, forca } };
}

/* ---------------- AS PERGUNTAS QUE O MESTRE FAZ ----------------
   Todas devolvem NOMES, porque é com nome que o envelope fala. E todas
   ignoram os mortos: um amor que termina com quem já morreu não é um
   fim de laço, é luto — e luto é outro assunto. */
const vivo = (n) => n && n.nome && String(n.status || "vivo").toLowerCase() !== "morto";

export function comLaco(npcs, { tipo = null, rompido = null } = {}) {
  return Object.values(npcs || {}).filter((n) => {
    if (!vivo(n)) return false;
    const l = garantirLaco(n.laco);
    if (!l) return false;
    if (tipo && l.tipo !== tipo) return false;
    if (rompido !== null && l.rompido !== rompido) return false;
    return true;
  }).map((n) => n.nome);
}

/* NÃO há `contarLacos` aqui, e é a QUARTA regra minha nesta sessão a
   nascer sem leitor — depois de `bioma`, `longeDeCasa` e `lacosDePe`. Ela
   contaria os laços por tipo, e o único chamador que teve durou dez
   minutos: o que os assuntos precisam saber não é QUANTOS laços há, é COM
   QUEM — e isso é `comLaco`, que devolve nomes.

   O padrão é meu e vale registrar: ao construir infraestrutura eu escrevo
   a API "completa", e a catraca vai aparando o que ninguém pediu. É
   exatamente o trabalho dela. */

/* ---------------- O DIA DO ENCONTRO (v9.314) ----------------
   `conhecidoEm` é o dia em que o herói cruzou com esta pessoa, e é a régua
   de três coisas: o convite para o grupo (quantos dias de estrada juntos),
   o propósito secreto que amadurece com o convívio, e a etapa de missão
   "encontrar Fulano". O App mandava o dia a cada `criarNPC(..., {
   conhecidoEm: diaRef.current })` — oito lugares — e esta função o
   JOGAVA FORA, porque monta a ficha campo a campo e ele não era campo.

   O efeito, medido numa prova jogada: "mais 5 dias de estrada" para aceitar
   alguém no grupo, e depois de 8 dias pelo painel do tempo, ainda "mais 5".
   Sem data, o convívio era sempre ZERO dias; só depois de recarregar o save
   a blindagem do load dava "dia 0" a todo mundo — e aí o convívio saltava
   para a campanha inteira. Os dois lados eram mentira.

   Só entra número de verdade (inteiro, não negativo). Lixo fica de fora e
   a ficha continua sem a chave — é o `== null` que o load e a missão já
   sabem ler como "sem data", e inventar um dia seria pior que não ter. */
function diaDoEncontro(v) {
  if (v === null || v === undefined || v === "" || typeof v === "boolean") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

/* ============================================================
   O QUE SÓ FOI DITO, NA GENTE (28/10/2026, Fase T, trilha B)

   O juízo do Cronista (motor/cronista.js#julgarGente) marca `dito` na
   pessoa que só aparece dentro da fala de alguém — a Clarissa do Posto
   Velho de que o taberneiro fala não é gente que o herói viu. Nas três
   sessões de prova são 4 pessoas. O cânone já escrevia a marca (0816cbf);
   a gente não: esta função montava a ficha campo a campo e jogava o
   `dito` fora, e a linha das PESSOAS CONHECIDAS também não o diria. O
   Mestre lia o boato de uma pessoa como fato.

   A marca é a mesma do cânone, curta, e mora aqui porque o registo é o
   andar de baixo: `prompt.js` lê-a daqui (o import já ia nessa direção).
   O campo é NOVO e só existe na ficha que o tem — a ficha sem marca sai
   byte a byte como saía, e uma versão antiga do jogo que carregue um save
   com ele ignora-o (nenhum leitor de antes o lê; a suíte prova-o).

   O ciclo da marca (`mesclarNPC`): fica enquanto a pessoa só se ouve;
   cai quando ela chega sem a marca — quem a escreve sem `dito` (o Cronista
   que a viu em cena, o cânone, a recalibração) afirma-a como fato; e nunca
   sobe em quem já está no registo como fato: o boato sobre a Lia que o
   herói conheceu ontem não a torna boato. */
export const MARCA_DO_DITO = "só dito em cena, não fato";
const marcaDoDito = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");

/* QUEM CONTOU, NA MARCA (29/10, trilha B). O juízo do Cronista escreve
   «dito por Brom, não fato» quando acha o dono da fala, e «dito por alguém
   em cena, não fato» quando não acha (motor/cronista.js, `fatos.marca` e
   `fatos.semQuem`; boatos.js lê o nome pela mesma forma). A marca com nome
   vale mais que a sem nome: é a ela que o herói vai pedir contas quando o
   boato se revelar. Por isso a mescla nunca a troca por uma mais pobre, e
   troca a pobre pela que tem nome quando ela chega. Entre duas com nome
   fica a primeira — quem repete não contou (a régua de `quemDisse`).
   A forma e o «sem quem» são os do Cronista; a suíte prova que batem
   (teste-npcs-dito §3b), sem import: o Cronista é que lê daqui. */
const QUEM_NA_MARCA = { forma: /^dito por (.+?), não fato$/, semQuem: "alguém em cena" };
const quemDoDito = (v) => {
  const m = marcaDoDito(v).match(QUEM_NA_MARCA.forma);
  const quem = m ? m[1].trim() : "";
  return quem && semAc(quem) !== semAc(QUEM_NA_MARCA.semQuem) ? quem : "";
};
/* A marca que fica quando as duas existem: a velha, salvo quando ela não
   diz quem contou e a nova diz. Lixo na velha fica como estava (quem chama
   decide o que fazer com a falta de uma). Lê-a a mescla daqui de baixo e o
   cânone do Cronista (motor/cronista-do-turno.js), que só preenchia o
   vazio — e o «alguém em cena» que chegou primeiro bloqueava o «dito por
   Brom» para sempre, o mesmo espelho que ebe77a5 consertou aqui. */
export function aMarcaQueFica(velha, nova) {
  const n = marcaDoDito(nova);
  return n && marcaDoDito(velha) && !quemDoDito(velha) && quemDoDito(n) ? n : velha;
}

export function criarNPC(nome, dados0 = {}) {
  const dados = dados0 && typeof dados0 === "object" ? dados0 : {};
  const encontro = diaDoEncontro(dados.conhecidoEm);
  const dito = marcaDoDito(dados.dito);
  return {
    ...(encontro != null ? { conhecidoEm: encontro } : {}),
    nome,
    papel: dados.papel || "",            // mago, ferreiro, capitão da guarda…
    relacao: (dados.relacao || "desconhecido").toLowerCase(),
    genero: dados.genero || "",          // homem | mulher | outro
    local: dados.local || "",            // onde está/vive
    status: dados.status || "vivo",      // vivo | morto | desaparecido | exilado…
    segredo: dados.segredo || "",        // o que ele esconde (memória de enredo)
    notas: dados.notas || "",            // vínculos, promessas, dívidas, história
    /* v9.97: o que essa pessoa É de mim — amizade, amor, rivalidade,
       dívida, aprendizado, proteção. Quem escreve aqui é o SISTEMA, no
       clímax de uma onda do compasso, e nunca a IA. `null` é o normal:
       a maior parte da gente do mundo não é nada de ninguém. */
    laco: garantirLaco(dados.laco),
    /* v9.98: e o que essa pessoa é dos OUTROS — o que faz o mundo ter vida
       sem mim no meio. Chave é o nome do outro, valor é o tipo. */
    entre: garantirEntre(dados.entre),
    /* Quantas vezes se arrancou informação DESTA pessoa (ver o razão logo
       abaixo). Zero é o normal: quase ninguém do mundo é consultado. */
    consultas: contagem(dados.consultas),
    ultimaVez: dados.ultimaVez || 0,     // turno da última menção (p/ ordenar)
    semente: dados.semente || `npc|${nome}|${dados.papel || ""}`,
    /* o que só foi dito: a chave só existe na ficha que a tem (no fim, para
       a ficha sem ela sair como sempre saiu) */
    ...(dito ? { dito } : {}),
  };
}

/* ============================================================
   O RAZÃO DAS CONSULTAS — quem já me contou demais

   Arrancar informação de alguém é a coisa mais feita fora da luta, e
   até aqui não deixava traço nenhum: cada conversa que dava certo com
   o informante da cidade morria no turno em que acontecia. O sistema
   não sabia separar a pessoa a quem se perguntou uma vez daquela a
   quem se pergunta tudo há semanas — e a segunda é uma relação, não
   uma conversa.

   O NÚMERO MORA AQUI porque é o registro que persiste: a ficha
   atravessa o save, e é dela que se sabe QUEM, não só quantas vezes.
   Quem JULGA se uma conversa contou é `social.js`, que é o sistema que
   resolve o pedido e conhece o tamanho dele. A direção é essa e só
   essa — `social.js` lê daqui, este arquivo não lê de lá —, e quem
   junta o julgamento ao razão é o App, que tem os dois na mão no mesmo
   instante em que o teste se resolve.
   ============================================================ */

/* Ficha de save antigo não tem o campo, e ficha mexida à mão pode ter
   qualquer coisa nele: tudo que não é um inteiro positivo vale zero.
   `undefined` nunca sai daqui — é o que faz o campo novo não precisar de
   migração nenhuma. */
const contagem = (x) => {
  const n = Math.floor(Number(x));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/* Imutável, como tudo aqui: registro novo, ficha nova, nada mexido no
   lugar. Aceita o nome como ele veio da cena (a caixa das letras é da
   IA, não minha), pelo mesmo caminho de `firmarEntre`. */
export function registrarConsulta(npcs, nome) {
  if (!npcs || !nome) return npcs;
  const k = Object.keys(npcs).find((x) => x.toLowerCase() === String(nome).toLowerCase());
  if (!k) return npcs;
  const ficha = npcs[k] || {};
  return { ...npcs, [k]: { ...ficha, consultas: contagem(ficha.consultas) + 1 } };
}

/* Quantas vezes a campanha inteira se apoiou num informante.

   SOMA TODO MUNDO, e é de propósito: só se registra consulta de quem é
   informante (o julgamento fica em `social.js`), então quem tem número
   aqui já passou por aquele portão — e este arquivo não pode perguntar
   a `social.js` quem é informante sem inverter a direção dos imports.
   Somar por quem tem consulta registrada é a conta mais simples que dá
   a resposta certa.

   E conta os MORTOS também: o herói se apoiou naquela boca, e o que ela
   soube dele não desaparece porque ela morreu. */
export function vezesQueUsouInformante(npcs) {
  return Object.values(npcs || {}).reduce((s, n) => s + contagem(n && n.consultas), 0);
}

const semAc = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const VAZIAS = new Set(["o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "e", "em", "no", "na", "velho", "velha", "jovem", "grande", "pequeno"]);

/* As palavras que de fato dizem QUEM a pessoa é. "velho camponês" e "capitão
   da guarda" não compartilham nenhuma; "capitão da guarda" e "o capitão"
   compartilham. É a régua mais simples que separa uma reformulação de uma
   troca de identidade. */
export function palavrasDoPapel(papel) {
  return semAc(papel).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !VAZIAS.has(w));
}
export function mesmoPapel(a, b) {
  const pa = palavrasDoPapel(a), pb = palavrasDoPapel(b);
  if (!pa.length || !pb.length) return true;   // sem informação, não afirmo diferença
  return pa.some((w) => pb.includes(w));
}

/* O QUE O SISTEMA ESCREVEU NAS NOTAS NÃO SE APAGA (29/10, trilha B)

   As `notas` são o campo livre da ficha, e a mescla substitui-as inteiras:
   a nota nova do Cronista ou do Narrador é a descrição de agora, e era
   certo que trocasse a de ontem. Mas há quem escreva nelas sem ser prosa:
   o boato que se revela (boatos.js#oBoatoDaChegada) deixa a forma na ficha
   de quem se procurou («visto pelo herói: era verdade», «meia-verdade:
   …», «partiu de … para …») e a culpa na de quem o contou («mentiu sobre
   Clarissa: era isca»); a morte que o sistema decide deixa o dia e a causa
   («Morreu no dia 7 — …», combate-do-turno.js e o prelúdio). Uma nota de
   oito palavras do Cronista no turno seguinte apagava tudo: o Brom deixava
   de ter mentido, a Clarissa voltava a poder ser revelada (é a marca que
   impede a 2.ª revelação, BOATO.marcas), e o morto perdia o dia.

   A régua: a nota nova substitui a prosa, como sempre; as marcas do
   sistema que a velha tinha juntam-se depois dela, pela mesma junta do
   boato (`; `), salvo as que a nova já diz. O teto é das marcas, não da
   nota: as mais recentes primeiro, até `teto.marcas` delas e
   `teto.letras` letras — a nota nova nunca se corta, e a ficha sem marca
   sai byte a byte como saía. `marcas` são os começos que o sistema
   escreve; `corte` parte as notas nos pedaços (a junta do boato, e o
   «Morreu no dia» que a morte cola com um espaço). As formas do boato
   moram em boatos.js, e a suíte prova que cada uma bate aqui
   (teste-o-que-a-mescla-guarda §1), sem import: boatos.js não lê daqui
   nem daqui se lê boatos.js. */
export const NOTAS_DO_SISTEMA = Object.freeze({
  junta: "; ",
  corte: /;\s*|\s+(?=Morreu no dia \d)/,
  marcas: Object.freeze([
    /^visto pelo herói/i,
    /^meia-verdade\b/i,
    /^partiu de /i,
    /^era (verdade|isca|confusão|medo)\b/i,
    /^(mentiu|enganou-se|repetiu um medo) sobre /i,
    /^Morreu no dia \d+/,
  ]),
  teto: Object.freeze({ marcas: 4, letras: 240 }),
});
const ehMarcaDoSistema = (p) => NOTAS_DO_SISTEMA.marcas.some((r) => r.test(p));
function notasComAsMarcas(velhas, nova) {
  const n = String(nova).trim();
  if (typeof velhas !== "string" || !velhas.trim()) return nova;
  const jaDiz = semAc(n);
  const marcas = velhas.split(NOTAS_DO_SISTEMA.corte).map((p) => p.trim())
    .filter((p) => p && ehMarcaDoSistema(p) && !jaDiz.includes(semAc(p)));
  if (!marcas.length) return nova;
  /* as mais recentes primeiro (o boato junta no fim), e o teto */
  const ficam = [];
  let letras = 0;
  for (const m of [...new Set(marcas)].reverse()) {
    if (ficam.length >= NOTAS_DO_SISTEMA.teto.marcas || letras + m.length > NOTAS_DO_SISTEMA.teto.letras) break;
    ficam.unshift(m); letras += m.length;
  }
  return ficam.length ? [n, ...ficam].join(NOTAS_DO_SISTEMA.junta) : nova;
}

/* O ESTADO QUE NÃO VOLTA (29/10, trilha B)

   A porta do cânone (motor/aplicar.js#aplicarORegisto) relê o cânone
   INTEIRO a cada turno com mudanças, e mescla a pessoa do cânone na ficha
   do registo quando a acha pelo homónimo («Delfina» ↔ «Delfina da
   Névoa»). Mandava `status: f.status || "vivo"`: o cânone que não dizia
   estado nenhum dizia «vivo», e a mescla escrevia-o. Foi por aí que quem o
   boato revelou como «nunca existiu» (boatos.js, BOATO.nuncaExistiu) e
   quem o combate matou voltavam a «vivo» no turno seguinte, sem ninguém o
   ter dito — e o elenco punha-os em cena outra vez.

   A régua: o cânone sem estado não diz estado nenhum; e o estado final do
   registo (`finais`) só se troca quando o Narrador o diz NESTE turno, no
   próprio cânone que mandou — um «vivo» de há vinte turnos, relido, não é
   uma ressurreição. Os outros estados (desaparecido, exilado…) trocam-se
   como antes. A suíte prova que «nunca existiu» é o do boato
   (teste-o-que-a-mescla-guarda §2). */
export const ESTADO_SEM_VOLTA = Object.freeze({ finais: Object.freeze(["morto", "morta", "nunca existiu"]) });
export const estadoSemVolta = (status) => typeof status === "string" && ESTADO_SEM_VOLTA.finais.includes(semAc(status).trim());

/* Mescla uma atualização numa ficha existente: campos novos sobrescrevem,
   nunca apagam o que já existia (blindagem contra perda de memória).
   As notas sobrescrevem a prosa, nunca o que o sistema escreveu nelas
   (NOTAS_DO_SISTEMA, acima).

   EXCETO O PAPEL (v9.22). Este campo sobrescrevia como qualquer outro, e foi
   assim que um velho camponês chamado Yorick virou capitão da guarda de uma
   cena para a outra — sendo que a guarda já tinha capitão, um gnomo chamado
   Halvard. Papel não é estado mutável como `local` ou `status`: é identidade,
   e identidade não muda porque o Mestre esqueceu. Pode mudar na ficção (um
   camponês VIRA guarda), mas isso é um acontecimento, e acontecimento passa
   pelo sistema — não por uma sobrescrita silenciosa num merge.

   Quem chama recebe o conflito em `_papelConflito` e decide o que fazer;
   ignorar isso preserva o comportamento seguro, que é manter o que já
   estava lá. */
export function mesclarNPC(ficha, dados0 = {}) {
  const dados = dados0 && typeof dados0 === "object" ? dados0 : {};
  const out = { ...ficha };
  /* O DIA DO ENCONTRO NÃO SE REESCREVE (v9.314): quem já tem data fica com
     a dela — reencontrar alguém não é conhecê-lo de novo, e repor o dia a
     cada cena zeraria o convívio para sempre. Quem não tem (ficha de antes
     desta versão, ou vinda por outro caminho) ganha a que veio agora. */
  if (diaDoEncontro(out.conhecidoEm) == null) {
    const encontro = diaDoEncontro(dados.conhecidoEm);
    if (encontro != null) out.conhecidoEm = encontro;
  }
  let conflito = null;
  for (const k of ["papel", "relacao", "genero", "local", "status", "segredo", "notas"]) {
    if (dados[k] === undefined || dados[k] === null || String(dados[k]).trim() === "") continue;
    if (k === "papel" && String(ficha && ficha.papel || "").trim() && !mesmoPapel(ficha.papel, dados.papel)) {
      conflito = { nome: ficha.nome, antes: ficha.papel, agora: String(dados.papel) };
      continue;   // o registro manda: o papel antigo fica
    }
    out[k] = k === "notas" ? notasComAsMarcas(ficha && ficha.notas, dados[k]) : dados[k];
  }
  if (dados.relacao) out.relacao = String(dados.relacao).toLowerCase();
  if (dados.ultimaVez) out.ultimaVez = dados.ultimaVez;
  if (conflito) out._papelConflito = conflito;
  /* o que só foi dito (trilha B, 28/10): a marca fica enquanto só se ouve,
     cai quando a pessoa chega sem ela, e nunca sobe em quem já é fato.
     Enquanto fica, a que diz quem contou não cede à que não diz (29/10:
     o «alguém em cena» de uma leitura seguinte não apaga o «dito por
     Brom»), e a que não diz cede à que diz (ver QUEM_NA_MARCA). */
  if ("dito" in out) {
    const nova = marcaDoDito(dados.dito);
    if (!nova) delete out.dito;
    else out.dito = aMarcaQueFica(out.dito, nova);
  }
  return out;
}

/* ============================================================
   O GÊNERO QUE O CRONISTA LÊ (E3 do "o Narrador só narra", 12/10)

   Até a E3 quem registava o gênero de uma pessoa era o Narrador, no canal
   `npcs` ("genero":"mulher"). O canal saiu, e o Cronista — que corre
   depois do turno e regista as pessoas novas — não tinha o campo: a 6.ª e
   a 7.ª sessões já tinham trocado o gênero de gente na narração, e sem
   registo a troca deixa de ter quem a desminta. O Cronista diz "ele" ou
   "ela" (o pronome que leu na cena, a resposta mais curta de acertar); o
   registo guarda "homem"/"mulher", a forma que o resto da casa já escreve
   (`criarNPC`, os NOMES À MÃO, a fogueira) e que `sexoDe` lê.

   O gênero não se reescreve: quem já o tem fica com ele. Uma leitura
   errada do Cronista num turno não pode trocar o que a pessoa é — era
   esse o defeito. Um valor que não diz gênero nenhum (lixo de save antigo)
   não conta como "já tem".
   ============================================================ */
const GENERO_DO_REGISTO = { f: "mulher", m: "homem" };

/* ---------------- O PARADEIRO QUE NÃO É CIDADE (12/10, a 9.ª sessão) ----------------
   O Cronista registou a Kira com `local: "cidade"` — a palavra, não o nome
   —, e Tomas, Ilar e Dara com sítios que nenhum mapa conhece. `cidadeDe`
   (cena.js) não acha cidade nenhuma nesse texto, e quem não tem cidade é
   "paradeiro não registrado": PRESENTE EM QUALQUER CIDADE. Foi assim que os
   três apareceram "em Rio do Rio" sem nunca lá terem estado.
   O Cronista só regista quem está na cena, logo a cidade onde o herói está
   é verdade sobre a pessoa: quando o `local` (o novo, ou o que a ficha já
   tem) não nomeia cidade do mapa, ele passa a nomeá-la — a palavra genérica
   troca-se pelo nome ("cidade" → "Rio do Rio"), o sítio ganha-o ao lado
   ("a taverna do Pato" → "a taverna do Pato, Rio do Rio"). Na estrada ou
   numa masmorra, quem chama passa `cidade: ""`, e nada muda.
   O QUE SÓ FOI DITO NÃO ESTÁ AQUI (trilha B, 28/10): "só regista quem está
   na cena" não vale para quem só se ouviu numa fala — o juízo do Cronista
   (julgarGente) tira-lhe o "aqui" de propósito, e o carimbo devolvia-lho:
   a Clarissa de que o taberneiro fala ficava "em Brejo Alto", e era o
   "PROCURA Clarissa, ESTÁ AQUI" de volta pela outra porta. A ficha marcada
   `dito` não se carimba. */
export const LOCAL_SEM_CIDADE = {
  genericos: ["cidade", "a cidade", "na cidade", "vila", "a vila", "na vila", "aldeia", "a aldeia", "na aldeia", "aqui", "local", "centro", "o centro", "povoado", "o povoado"],
  junta: ", ",
};
const lisoLocal = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
function nomeiaCidade(local, mapa) {
  const l = lisoLocal(local);
  return !!l && ((mapa && Array.isArray(mapa.cidades)) ? mapa.cidades : []).some((c) => c && c.nome && l.includes(lisoLocal(c.nome)));
}
export function localComCidade(local, cidade, mapa) {
  const l = String(local == null ? "" : local).trim();
  const c = String(cidade == null ? "" : cidade).trim();
  if (!c || nomeiaCidade(l, mapa)) return l;
  if (!l || LOCAL_SEM_CIDADE.genericos.includes(lisoLocal(l))) return c;
  return l + LOCAL_SEM_CIDADE.junta + c;
}

/* `ctx`: { cidade, mapa } — a cidade onde o herói está agora ("" fora
   dela) e o mapa, para o paradeiro (acima). Sem `ctx`, como antes. */
export function fichaDoCronista(pessoa, existente = null, ctx = null) {
  const p = pessoa && typeof pessoa === "object" ? pessoa : {};
  const { genero, ...resto } = p;
  const lido = GENERO_DO_REGISTO[sexoDe(typeof genero === "string" ? genero : "")] || "";
  const ja = existente && typeof existente === "object" ? sexoDe(typeof existente.genero === "string" ? existente.genero : "") : "";
  const out = lido && !ja ? { ...resto, genero: lido } : resto;
  const c = ctx && typeof ctx === "object" ? ctx : {};
  if (!c.cidade || marcaDoDito(out.dito)) return out;
  const novo = typeof out.local === "string" && out.local.trim() ? out.local : "";
  const antes = existente && typeof existente === "object" && typeof existente.local === "string" ? existente.local : "";
  const base = novo || antes;
  /* quem a ficha põe LONGE ("foi para as montanhas") não está aqui: não se carimba */
  if (estaFora(out.status, base, out.notas)) return out;
  const certo = localComCidade(base, c.cidade, c.mapa);
  return certo && certo !== base ? { ...out, local: certo } : out;
}

/* Quem já ocupa este papel no registro — é o que transforma "Yorick virou
   capitão" numa contradição PROVÁVEL em vez de uma suspeita: a guarda já
   tem capitão, e ele tem nome. */
export function quemTemOPapel(npcs, papel, exceto = "") {
  const alvo = semAc(exceto);
  return Object.values(npcs || {}).find((n) =>
    n && n.nome && n.papel && semAc(n.nome) !== alvo && mesmoPapel(n.papel, papel)) || null;
}

/* ============================================================
   A RECÊNCIA (Fase MM, MM8c-1) — o contador que voltava a zero e o
   relógio que ganhava sempre

   `ultimaVez` é o NÚMERO DO TURNO em que o Mestre anotou a pessoa pela
   última vez (`npcTurnoRef` no App), e é por ele que o registo se ordena
   para o prompt. Dois defeitos o partiam:

   · o contador voltava a ZERO a cada load (e a cada capítulo novo, que
     mantém o registo). Depois de recarregar, quem se via de novo recebia
     1, 2, 3… — ABAIXO de toda a gente anotada antes do save. A lista dos
     "mais recentes" passava a ser a dos mais recentes ANTES do load;
   · três sítios do App escreviam `Date.now()` no mesmo campo (a revelação
     do vilão, a relação definida à mão). Um relógio em milissegundos,
     posto numa régua de turnos, ganha de todos para sempre: o vilão
     revelado há 150 turnos ficava no topo, acima de quem se viu agora.

   A régua que separa os dois é uma só: um contador de turnos nunca chega
   a mil milhões (seriam dez mil turnos por dia durante 270 anos), e
   `Date.now()` passou de mil milhões doze dias depois de 1970. Não há
   valor que caiba nos dois lados.
   ============================================================ */
export const LIMITE_DO_CONTADOR = 1e9;

const marcaDe = (n) => {
  const v = Number(n && n.ultimaVez);
  return Number.isFinite(v) && v > 0 ? v : 0;
};
const ehRelogio = (v) => v >= LIMITE_DO_CONTADOR;

/* O contador a retomar no load: o maior `ultimaVez` do registo que seja
   contador — nunca um relógio. Registo vazio ou lixo: zero. */
export function retomarContador(npcs) {
  let max = 0;
  for (const n of Object.values(npcs && typeof npcs === "object" ? npcs : {})) {
    const v = marcaDe(n);
    if (!ehRelogio(v) && v > max) max = Math.floor(v);
  }
  return max;
}

/* O registo com a régua consertada: cada relógio vira contador, logo
   ACIMA do maior contador que existe, pela ordem em que os relógios foram
   escritos (o vilão revelado antes fica abaixo da relação definida
   depois). "Visto agora" é a melhor leitura honesta de um relógio: foi
   escrito num momento da campanha que a régua de turnos não sabe dizer, e
   a partir daí desce como toda a gente — cada pessoa anotada depois passa
   à frente. Sem relógio nenhum, devolve o MESMO objeto (nada a trocar). */
export function normalizarRecencia(npcs) {
  const reg = npcs && typeof npcs === "object" ? npcs : {};
  const relogios = Object.entries(reg).filter(([, n]) => n && ehRelogio(marcaDe(n)))
    .sort((a, b) => marcaDe(a[1]) - marcaDe(b[1]));
  if (!relogios.length) return npcs;
  const base = retomarContador(reg);
  const out = { ...reg };
  relogios.forEach(([k, n], i) => { out[k] = { ...n, ultimaVez: base + 1 + i }; });
  return out;
}

/* As fichas do registo da mais recente para a mais antiga, com a régua
   consertada NA LEITURA também — um relógio escrito no meio da sessão
   não prende ninguém no topo até ao próximo load. No empate, a ordem do
   registo (a mesma do `sort` estável de antes). */
export function ordemDaRecencia(npcs) {
  const reg = normalizarRecencia(npcs && typeof npcs === "object" ? npcs : {}) || {};
  return Object.values(reg).filter((n) => n && typeof n === "object")
    .sort((a, b) => marcaDe(b) - marcaDe(a));
}

/* ============================================================
   QUEM IMPORTA (Fase MM, MM8c-2) — o vilão antes do padeiro

   A recência sozinha trocava o vilão ausente há duas semanas pelo padeiro
   de ontem. Agora a ordem é por IMPORTÂNCIA — o que a pessoa é na
   história de quem joga —, e a recência só desempata. Nenhum teto muda:
   muda QUEM entra nas 22 (e no LONGE, e nas pessoas do cânone), não
   quantas.

   O peso soma: anda comigo, tem laço comigo (rompido também — é história),
   o que ela é para mim pela relação, é do elenco (MM8b). Morto pesa menos:
   a memória dele fica, mas cede o lugar a quem ainda pode entrar na cena.
   ============================================================ */
export const PESO_DA_IMPORTANCIA = {
  grupo: 100,
  laco: 60,
  relacao: { inimigo: 50, rival: 45, romance: 45, conjuge: 45, familia: 40, aliado: 30, amigo: 30, companheiro: 30 },
  elenco: 25,
  morto: -40,
};

const semAcento = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function importanciaDe(n, contexto) {
  const c = contexto && typeof contexto === "object" ? contexto : {};
  if (!n || typeof n !== "object") return 0;
  const nome = semAcento(n.nome);
  const em = (lista) => Array.isArray(lista) && lista.some((x) => semAcento(x && typeof x === "object" ? x.nome : x) === nome);
  const P = PESO_DA_IMPORTANCIA;
  let peso = 0;
  if (nome && em(c.grupo)) peso += P.grupo;
  if (garantirLaco(n.laco)) peso += P.laco;
  peso += P.relacao[semAcento(n.relacao)] || 0;
  if (nome && em(c.elenco)) peso += P.elenco;
  if (/mort/.test(semAcento(n.status))) peso += P.morto;
  return peso;
}

/* As fichas do registo da que mais importa para a que menos; no empate, a
   mais recente (a régua consertada da MM8c-1). `contexto`: { grupo, elenco }
   — nomes ou fichas. Sem contexto, pesam o laço, a relação e a morte, que
   a ficha já tem. */
export function ordemDaImportancia(npcs, contexto) {
  const rec = ordemDaRecencia(npcs);
  const pos = new Map(rec.map((n, i) => [n, i]));
  return rec.map((n) => ({ n, p: importanciaDe(n, contexto) }))
    .sort((a, b) => b.p - a.p || pos.get(a.n) - pos.get(b.n))
    .map((x) => x.n);
}

/* ============================================================
   O FIGURANTE É DE PASSAGEM (Fase MM, MM8d)

   A MM8c-2 pôs quem importa à frente; o figurante (peso 0) continuava a
   ocupar os lugares que sobrassem. Agora ele deixa de os ocupar — mesmo
   com lugar vazio — quando não tem INVESTIMENTO, não é do elenco e não
   está na cena. NADA SE APAGA do registo: a ficha fica, o Códex conta-a,
   e ela volta à lista no dia em que a cena a trouxer de volta.

   INVESTIMENTO é o que a ficha já guarda, e só isso (a MM8e trará os
   "dias vistos"; aqui não há campo novo):
     · laço comigo (`laco`, rompido também);
     · consultas (`consultas` > 0 — já se lhe arrancou informação);
     · uma relação que não é neutra (`relacao` fora de SEM_PESO);
     · um segredo registado (`segredo` — o prompt chama-lhe "a memória do
       enredo", e é o Narrador que o anota quando importa);
     · e, pelo contexto que o App dá: anda comigo (grupo), é pedido numa
       missão (missao), é do elenco (elenco).
   PRESENTE é quem a cena cita agora (`emCena`) ou quem o Mestre anotou
   nos últimos `FIGURANTE.janela` turnos de registo — é o figurante da
   cena de agora, que ainda pode ser o assunto do turno seguinte.

   "Visto em dois dias ou mais" NÃO se deixa medir honestamente com o que
   o registo tem: `conhecidoEm` é o primeiro dia, e `ultimaVez` é um
   contador de turnos sem dia. Fica para a MM8e, com o seu campo.
   ============================================================ */
export const FIGURANTE = {
  janela: 3,
  relacoesSemPeso: ["", "neutro", "desconhecido"],
  /* MM8e: quem o herói viu em tantos dias diferentes VOLTOU a ele — é
     investimento. Os dias vêm do campo `elenco.vistos` do save, pelo
     contexto (`vistos`); sem ele, este critério simplesmente não conta. */
  diasVistos: 2,
};

export function investimentoDe(n, contexto) {
  const c = contexto && typeof contexto === "object" ? contexto : {};
  if (!n || typeof n !== "object") return [];
  const nome = semAcento(n.nome);
  const em = (lista) => !!nome && Array.isArray(lista) && lista.some((x) => semAcento(x && typeof x === "object" ? x.nome : x) === nome);
  const out = [];
  if (garantirLaco(n.laco)) out.push("laço");
  if (contagem(n.consultas) > 0) out.push("consultas");
  if (!FIGURANTE.relacoesSemPeso.includes(semAcento(n.relacao))) out.push("relação");
  if (String(n.segredo || "").trim()) out.push("segredo");
  if (em(c.grupo)) out.push("grupo");
  if (em(c.missao)) out.push("missão");
  if (em(c.elenco)) out.push("elenco");
  /* MM8e: voltou a ele em dias diferentes */
  if (nome && c.vistos && typeof c.vistos === "object") {
    const k = Object.keys(c.vistos).find((x) => semAcento(x) === nome);
    if (k && Array.isArray(c.vistos[k]) && new Set(c.vistos[k]).size >= FIGURANTE.diasVistos) out.push("voltou");
  }
  return out;
}

/* De passagem: sem investimento, fora do elenco e fora da cena. `agora` é
   o contador de hoje (sem ele, o maior do registo). */
export function ehDePassagem(n, contexto, agora = 0) {
  if (!n || typeof n !== "object") return false;
  if (investimentoDe(n, contexto).length) return false;
  const c = contexto && typeof contexto === "object" ? contexto : {};
  const nome = semAcento(n.nome);
  if (nome && Array.isArray(c.emCena) && c.emCena.some((x) => semAcento(x && typeof x === "object" ? x.nome : x) === nome)) return false;
  const v = marcaDe(n);
  return !(v >= LIMITE_DO_CONTADOR || (Number(agora) || 0) - v < FIGURANTE.janela);
}

/* O TETO DAS PESSOAS CONHECIDAS, em pessoas E em caracteres. As 22 já
   eram lei; os caracteres não: uma ficha com notas longas do Narrador
   fazia a mesma lista de 22 custar o dobro. Quem não cabe sai pela
   recência — a mais antiga primeiro. */
export const TETO_DAS_PESSOAS = { pessoas: 22, chars: 3200 };

/* O PARENTESCO DE QUEM ANDA COMIGO (12.ª sessão, 19/10: "a sua irmã"
   para Aelith, duas vezes, e a ficha do grupo dizia-a sem parentesco). O
   pedido não foi gravado, mas a casa varrida tem uma só fonte de "irmã"
   para quem anda com o herói — a ligação "sangue" do companheiro de antes
   (companheiro-inicial.js) —, e a de uma companheira de armas grava
   "antiga companheira de armas do herói; conhecem-se há N anos". O Mestre
   leu duas mulheres que atravessaram uma guerra juntas como sangue: é
   invenção pela lacuna — a ficha diz o que ela é e cala o que ela não é,
   e o que se cala de quem anda ao lado do herói há anos é preenchido. Quem anda no grupo leva então a frase fechada — "não é
   parente do herói" —, salvo quando o laço ou a relação JÁ dizem sangue
   ou casa (a ligação "sangue" do companheiro de antes grava "irmã do
   herói" e o laço de família; o cônjuge é casa). Custa ~25 caracteres por
   companheiro, dentro do teto de caracteres desta lista. */
export const PARENTESCO_NO_GRUPO = {
  lacosDeSangue: ["familia"],
  relacoesDeSangue: ["familia", "conjuge"],
  frase: "não é parente do herói",
};
const ehDeSangue = (n, l) => (l && PARENTESCO_NO_GRUPO.lacosDeSangue.includes(l.tipo))
  || PARENTESCO_NO_GRUPO.relacoesDeSangue.includes(semAcento(n.relacao));

/* Resumo compacto do elenco para o prompt — UMA linha por pessoa, as mais
   recentes/relevantes primeiro. Teto rígido para nunca inflar o prompt. */
/* ONDA 3 DO CUSTO (14/10): AS PESSOAS PELO LUGAR E PELA MISSÃO. Com
   `contexto.relevancia` (relevancia.js, montada uma vez por turno no App),
   a lista leva quem está EM JOGO — o grupo, quem está aqui, quem a missão,
   o núcleo ou o fio põem na história, e quem o turno cita pelo nome — e,
   dos outros, só o punhado que o herói conhece e pode citar
   (`RELEVANCIA.citaveis`, pela mesma ordem da importância). Quem sai não
   some: o LONGE do QUEM ESTÁ EM CENA diz onde ela está, o registo guarda a
   ficha, e no turno em que a cena a citar ela volta inteira. Sem
   relevância (o prompt montado fora de um turno), a lista de sempre. */
export function resumoNPCsParaPrompt(npcs, limite = TETO_DAS_PESSOAS.pessoas, contexto = null) {
  /* MM8c-2: por importância, a recência desempata. MM8d: e quem é de
     passagem não ocupa lugar nenhum */
  const reg = normalizarRecencia(npcs && typeof npcs === "object" ? npcs : {}) || {};
  const agora = retomarContador(reg);
  const rel = contexto && typeof contexto === "object" ? contexto.relevancia : null;
  const ord0 = ordemDaImportancia(reg, contexto).filter((n) => !ehDePassagem(n, contexto, agora));
  const ord = (rel ? ord0.filter((n) => pessoaEmJogo(n.nome, rel)) : ord0).slice(0, limite);
  if (!ord.length && !rel) return "";
  const grupo = new Set((contexto && Array.isArray(contexto.grupo) ? contexto.grupo : []).map((x) => semAcento(x && typeof x === "object" ? x.nome : x)).filter(Boolean));
  const noGrupo = (n) => grupo.has(semAcento(n.nome));
  const linhaDe = (n) => {
    /* onda 3: "neutro" é o "desconhecido" de quem já se viu — o registo
       cala-o como cala o outro (FIGURANTE.relacoesSemPeso) */
    const partes = [n.papel, n.relacao && !FIGURANTE.relacoesSemPeso.includes(String(n.relacao).toLowerCase()) ? `relação: ${n.relacao}` : "", n.genero, n.local ? `em ${n.local}` : "", n.status && n.status !== "vivo" ? n.status : "", marcaDoDito(n.dito) ? MARCA_DO_DITO : "", n.conhecidoEm != null ? (n.conhecidoEm > 0 ? `entrou na história no DIA ${n.conhecidoEm}` : "entrou antes do registro de dias") : ""].filter(Boolean);
    /* ---------------- O LAÇO SOBE (v9.98) ----------------
       O Mestre sabia que Marta era um amor rompido e a IA não — ela só
       recebia o nome dentro do envelope da onda, e só no turno em que a
       onda falava. Fora dali, para a narração, Marta era uma ferreira
       qualquer.

       Custa uma expressão por pessoa e dá à narração o que o sistema já
       enxergava: com quem eu tenho história, de que espécie, e se ela
       está quebrada. */
    const l = garantirLaco(n.laco);
    const laco = l
      /* "${rotulo} comigo" serve a todos os tipos sem concordância torta:
         "amizade comigo", "amor comigo", "dívida comigo". A primeira versão
         dizia "é amizade minha", que só funciona para metade deles. */
      ? (l.rompido
        ? `ROMPEU comigo (era ${(tipoDeLacoPorId(l.tipo) || {}).rotulo}, no dia ${l.rompidoEm})`
        : `${(tipoDeLacoPorId(l.tipo) || {}).rotulo} comigo${l.forca >= 3 ? ", e é profunda" : ""}`)
      : "";
    /* e o que ela é dos OUTROS, que é o que faz o elenco parecer um mundo */
    const laE = Object.entries(garantirEntre(n.entre)).map(([o, t]) => `${(tipoDeLacoPorId(t) || {}).rotulo} com ${o}`).join(", ");
    /* 12.ª sessão: quem anda comigo diz o que NÃO é (PARENTESCO_NO_GRUPO) */
    const sangue = noGrupo(n) && !ehDeSangue(n, l) ? PARENTESCO_NO_GRUPO.frase : "";
    const extra = [laco, laE, n.segredo ? `SEGREDO: ${n.segredo}` : "", n.notas, sangue].filter(Boolean).join(" · ");
    return `• ${n.nome}${partes.length ? ` (${partes.join(", ")})` : ""}${extra ? ` — ${extra}` : ""}`;
  };
  /* onda 3: os citáveis entram DEPOIS de quem está em jogo, cada grupo na
     ordem da importância — no teto de caracteres, quem está em jogo passa
     à frente */
  const fora = rel ? ord0.filter((n) => !ord.includes(n)) : [];
  const cit = rel ? citaveis(fora, linhaDe) : new Set();
  const lista = rel ? [...ord, ...fora.filter((n) => cit.has(n))].slice(0, limite) : ord;
  if (!lista.length) return "";
  const linhas = lista.map(linhaDe);
  /* o teto de caracteres: pela ordem da recência, entra quem cabe */
  const dentro = [];
  let gasto = 0;
  for (const l of linhas) {
    if (gasto + l.length + 1 > TETO_DAS_PESSOAS.chars) continue;
    dentro.push(l);
    gasto += l.length + 1;
  }
  return dentro.join("\n");
}

/* ============================================================
   O NOME QUE JÁ TEM DONO (Fase MM, MM14 · item 10; afinado em MM15 · 5)

   Na sessão de prova (mm11-sessao.md, T18-T20) o Narrador pôs na boca de
   Lino "Foi a Delfina. Delfina da Névoa", e na de Teodoro "É o recrutador.
   Delfina da Névoa" — e o Cronista registou "Delfina da Névoa —
   recrutador", um homem, ao lado da Delfina da missão principal, que
   estava a 146 km, em Alto do Sal, e ainda não fora encontrada. No turno
   seguinte o homónimo tinha um cartaz no mural. As três portas por onde o
   registo aceita gente (as "npcs" do Narrador, as PESSOAS do cânone e a
   secção "pessoas" do Cronista) só comparavam o nome INTEIRO: "Delfina da
   Névoa" não é "Delfina", logo entrava como gente nova.

   A regra de v9.338: um nome novo que partilha o PRIMEIRO nome com alguém
   que importa — a pista e o alvo da principal, os marcos da espinha, o
   elenco, o grupo, quem uma missão pede, e quem no registo tem
   investimento (laço, consultas, relação, segredo) — é a mesma pessoa ou
   é recusado.

   ---------------- O QUE A SEGUNDA SESSÃO MOSTROU (MM15 · 5) ----------------
   O cartaz de Otávio fala de "Túlio da Runa", que sumiu a caminho de Gomo
   do Ermo (é o molde "busca" do mural: quem sumiu nasce FORA da base, com
   nome próprio). A regra fundiu-o com Túlio, o músico do Último Gomo, que
   está no elenco com a cidade dele — Runa do Poço, onde a heroína estava.
   O passo do lugar juntava o local da ficha nova ao "aqui" da heroína, e o
   "aqui" bastava: o músico mora aqui, logo o homem que sumiu na estrada
   "era ele". Daí em diante "Túlio ✓ conhecido", sem ela o ter visto, em
   A GENTE da cena e com falas pagas. Nenhum sinal que os distinguia pesava,
   porque a regra só perguntava "pode ser ela?" e nunca "o que os separa?".

   Agora o primeiro nome igual só funde quando NADA os distingue. Separam
   duas pessoas, cada sinal da sua tabela:
     · o SEXO dito (v9.338);
     · o SOBRENOME DE FAMÍLIA — um "do/da/dos/das X" ou um composto com
       hífen — quando os dois têm um e não são o mesmo ("Aldric Lâmina-
       Rápida" não é "Aldric Barba-Ruiva"). Um adjetivo solto ("Teodoro
       Ruivo") é apelido, não família, e não separa (v9.338 já o fundia);
     · o PARADEIRO — a ficha nova diz que a pessoa sumiu, anda na estrada,
       não voltou (PARADEIRO.fora), e o dono está em casa: é gente do mundo
       com cidade, ou alguém do registo cujo lugar bate com o "aqui". De
       quem a história persegue e ainda não se viu, o "onde" é para onde se
       vai, não onde se está — ali o sumiço não separa (a Delfina da
       principal pode bem ter sumido);
     · o OFÍCIO — os dois têm ofício conhecido (OFICIOS) e de famílias que
       não se tocam: um músico não é um ferreiro. Ofício que a tabela não
       conhece não é sinal;
     · o LUGAR — quem a ficha diz estar longe, com um local que não é o do
       dono.
   O que acontece a dois que se separam depende de QUEM é o dono
   (DISTINTO_DE): a gente do mundo (elenco e base, de: "mundo") deixa
   nascer o novo com o nome inteiro — o mundo tem dois Túlios; quem a
   história persegue (o resto, e o que o App passa sem "de") recusa-o e
   pede outro nome ao Narrador, como em v9.338.

   E o que v9.338 acertou fica:
     · a pessoa nova dita AQUI enquanto o dono está noutro lugar é recusada
       ("Delfina da Névoa" em Foz do Meio, com a Delfina em Alto do Sal);
     · o dono já no registo mescla — não se recria;
     · sem prova de lugar, o que ainda é só um nome é recusado.

   E dois casos novos, um de cada lado:
     · o NOME INTEIRO que o mundo já conhece (um cartaz do mural, quem uma
       missão procura, o elenco — "conhecidos" e "importantes") é a própria
       pessoa: "Túlio da Runa", tal como o cartaz o diz, nunca é procurado
       noutro Túlio;
     · o PRIMEIRO NOME SOLTO ("Túlio", depois de haver dois) decide-se pelo
       que está mais perto (NOME_SOLTO): o nome inteiro na conversa recente,
       o lugar, o ofício, o paradeiro. Se nada aponta um só, fica quem se
       chama exatamente assim; e se ninguém se chama, recusa-se — não se
       inventa a ligação.

   Devolve { decisao: "nova" | "mesma" | "recusada", nome, chave, dono,
   motivo }: "nome" é o nome com que a pessoa entra ou mescla, "chave" a
   chave do registo a mesclar ("" quando é para criar), "dono" quem já
   tinha o nome, e "motivo" um id de MOTIVO_DO_HOMONIMO. Lixo devolve
   "nova" com o nome vazio — quem chama já o recusa por não ter nome.

   O contexto (tudo opcional): importantes [{ nome, onde, genero, papel,
   de }], conhecidos [nome], aqui [lugar], e da ficha nova local, genero,
   papel, notas (o estado e a descrição entram aqui), recentes [texto].
   ============================================================ */
export const HOMONIMO = {
  /* um primeiro nome mais curto que isto não identifica ninguém ("Al") */
  primeiroMinimo: 3,
  /* o que vem antes do nome e não é nome */
  artigos: ["o", "a", "os", "as", "dona", "dom", "seu", "senhor", "senhora", "mestre", "mestra", "velho", "velha"],
  /* o que abre um sobrenome de família feito de lugar: "do Sal", "das Tábuas" */
  particulas: ["do", "da", "dos", "das", "de", "del", "von", "van"],
};
export const MOTIVO_DO_HOMONIMO = {
  sexo: "é outra pessoa com o mesmo nome",
  lugar: "ela está noutro lugar",
  soNome: "ela ainda não foi encontrada, e não é aqui que está",
  sobrenome: "o sobrenome é de outra família",
  paradeiro: "ela está em casa, e esta sumiu",
  oficio: "o ofício é outro",
  ambiguo: "há mais de uma pessoa com este nome",
  lugar_nao_e_gente: "é o nome de um lugar, não de uma pessoa",
  heroi: "é o herói, e o herói não é gente da cena",
  descritor: "é uma descrição, não um nome",
};
/* a saída que o Narrador recebe, por motivo: o que fazer se era ela */
export const SAIDA_DO_HOMONIMO = {
  sexo: "use o nome dela",
  lugar: "ela não está nesta cena",
  soNome: "ela não está nesta cena",
  sobrenome: "use o nome dela",
  paradeiro: "use o nome dela",
  oficio: "use o nome dela",
  ambiguo: "diga o nome inteiro",
  lugar_nao_e_gente: "quem trabalha num lugar tem nome próprio: dê-lho, ou diga-o pelo ofício (o taverneiro, a guarda)",
  heroi: "fale com o herói na segunda pessoa — ele está em cena, sempre",
  descritor: "quem não tem nome continua sem ficha: dê-lhe nome próprio quando ele importar",
};
/* ---------------- QUEM NÃO É GENTE DA CENA (MM-C · C0, 11/10) ----------------
   A 6.ª sessão de prova: o Cronista leu o "E aí, Tamsin?" de Vando e
   registou a HEROÍNA como "Tamsin — companheiro de jornada"; daí a pauta
   passou a dizê-la "em Serra do Bode, a 3,5 h daqui — não entra nesta cena".
   E três DESCRIÇÕES viraram gente: "o carroceiro" e "o mercador viajante"
   (o mesmo homem, duas testemunhas de um crime) e "o homem que manda".
     · o herói (`contexto.heroi`): o nome dele, ou o primeiro nome solto,
       nunca entra no registo;
     · a descrição: um nome SEM NENHUMA palavra com maiúscula (o artigo e o
       ofício, "o carroceiro"; a perífrase, "o homem que manda") não é nome
       próprio. Se o registo tem UMA pessoa com esse ofício na cena, é ela
       (o alias óbvio funde-se); senão, fica sem ficha até ter nome.
   `maiuscula` é a régua do nome próprio; `curto` o tamanho abaixo do qual
   a palavra com maiúscula não chega a nome ("O" no começo da frase). */
export const QUEM_NAO_E_GENTE = { maiuscula: /[A-ZÀ-Ý]/, curto: 3 };
/* ---------------- O POSTO E O OFÍCIO NÃO SÃO NOME (13/10, a 10.ª sessão de prova) ----------------
   Dois registos errados da mesma noite, e os dois eram palavras de cargo
   coladas a um nome:
     · o herói era "Hilda Barbaforte", e quem a conhecia da guerra chamava-a
       pelo posto antigo ("Sargenta"): o Cronista registou "Sargenta
       Barbaforte — capanga do Rei Emprestado", INIMIGO, e a linha LONGE
       passou a dizer que a heroína estava em Monte Rasa. O nome com um
       posto à frente (titulos) é o nome sem ele: se o que sobra é só nome
       do herói, é o herói;
     · o taverneiro da Fivela foi registado duas vezes, "Perrin" e
       "Taverneiro da Fivela & o Trigo" (o ofício e a casa, sem nome): duas
       fichas, uma pessoa, e o jogador tocou a errada (M44, "Perrin não
       está"). Um nome que abre por um ofício (OFICIOS) e segue com
       partícula ("da Fivela") é uma DESCRIÇÃO — a régua de ehDescritor:
       é de quem tem esse ofício na cena, quando é um só; senão, fica sem
       ficha até ter nome. */
export const POSTO_E_OFICIO = {
  titulos: ["sargento", "sargenta", "capitao", "capita", "cabo", "tenente", "comandante", "general", "soldado", "soldada", "sir", "dama", "lorde", "lady", "mestre", "mestra", "senhor", "senhora", "dom", "dona"],
  /* palavras no mínimo: o ofício, a partícula e a casa */
  minimoDaCasa: 3,
};
/* "Taverneiro da Fivela & o Trigo": o ofício e a casa, sem nome próprio */
export function ehOficioDaCasa(nome) {
  if (typeof nome !== "string") return false;
  const partes = semArtigos(nome);
  return partes.length >= POSTO_E_OFICIO.minimoDaCasa && HOMONIMO.particulas.includes(partes[1]) && familiasDoOficio(partes[0]).length > 0;
}
/* ---------------- O SUBSTANTIVO COMUM À CABEÇA (13/10, a 11.ª sessão de prova, M3–M7) ----------------
   O Mestre chamou Venceslau, o vendedor, de "um sujeito de braço magro", e
   na estrada o mesmo homem foi "o sujeito da faca", "o vulto da faca" e "o
   homem da lâmina": o Cronista escreveu-os com a maiúscula do começo da
   frase ("Sujeito de braço magro", "Vulto da faca", "Homem de lâmina"), e a
   maiúscula passava pela régua do nome próprio — três fichas para um homem,
   e Venceslau em duas pessoas. A primeira palavra que é só GENTE sem nome
   (um sujeito, um vulto, uma mulher) não é nome por vir com maiúscula: é o
   começo de uma descrição, e a descrição segue a regra de cima. */
export const GENTE_SEM_NOME = ["sujeito", "sujeita", "homem", "homens", "mulher", "mulheres", "vulto", "vultos", "figura", "rapaz", "rapariga",
  "moca", "moco", "menino", "menina", "garoto", "garota", "crianca", "estranho", "estranha", "desconhecido", "desconhecida", "tipo",
  "sombra", "encapuzado", "encapuzada", "individuo", "fulano", "fulana", "gente", "pessoa", "camarada", "velhote", "velhota", "anciao", "ancia"];
export function ehDescritor(nome) {
  if (typeof nome !== "string") return false;
  const cru = nome.trim();
  if (!cru) return false;
  const palavras = cru.split(/[\s,]+/).filter(Boolean);
  /* a cabeça: o artigo e, logo depois dele (ou no começo), o substantivo comum */
  let cabeca = 0;
  while (cabeca < palavras.length && HOMONIMO.artigos.includes(semAcento(palavras[cabeca]))) cabeca++;
  if (cabeca < palavras.length && palavras.length > cabeca + 1 && GENTE_SEM_NOME.includes(semAcento(palavras[cabeca]))) cabeca++;
  const proprias = palavras.filter((p, i) => QUEM_NAO_E_GENTE.maiuscula.test(p[0]) && p.length >= QUEM_NAO_E_GENTE.curto
    && !(i < cabeca));
  return proprias.length === 0;
}
/* o ofício casa de verdade: os dois dizem um ofício, e partilham palavra */
function papelEstrito(papel, descricao) {
  const pa = palavrasDoPapel(papel || ""), pb = palavrasDoPapel(descricao || "");
  return pa.length > 0 && pb.length > 0 && pa.some((w) => pb.includes(w));
}
/* ---------------- UM LUGAR NÃO É GENTE (11/10, a 5.ª sessão de prova) ----------------
   O Cronista registou o taverneiro da Candeia Faiscante como "Taverna
   Candeia Faiscante" — papel taverneiro, relação neutro — e a pessoa que a
   missão mandava procurar (Osric Pé-Leve, o dono da casa) nunca entrou no
   registo: "falar com Osric" ficou aberto a sessão inteira. Um nome que
   abre por um tipo de lugar (`abre`, a primeira palavra sem o artigo) é o
   nome de uma casa, não de alguém. E o motor sabe quem é a gente daquela
   casa: se a casa é a de UMA pessoa que importa e o herói está lá, quem o
   Cronista viu é ela; senão, o registo recusa e diz porquê. Raízes sem
   acento, a palavra inteira. */
export const LUGAR_NAO_E_GENTE = {
  abre: ["taverna", "estalagem", "hospedaria", "albergue", "pousada", "bodega", "cantina", "botequim",
    "mercado", "feira", "bazar", "templo", "capela", "santuario", "ermida", "forja", "ferraria", "oficina",
    "biblioteca", "arquivo", "quartel", "caserna", "cadeia", "prisao", "docas", "doca", "cais", "porto",
    "arena", "cemiterio", "guilda", "loja", "armazem", "moinho", "azenha", "ponte", "praca", "torre", "mina"],
};
/* ---------------- O NOME COM EPÍTETO (12/10, a prova viva de v9.424) ----------------
   No Sino dos Andarilhos o Cronista registou "Ivarr" ao lado de "Ivarr o
   Exilado" (este vindo dos NOMES À MÃO): duas fichas para o mesmo
   taverneiro. O primeiro nome só se comparava com quem a história persegue
   (`quemImporta`); um figurante registado com epíteto não era dono de
   ninguém, e o nome curto nascia outra vez. Agora o primeiro nome solto e
   o mesmo primeiro nome com epíteto são a mesma pessoa quando ela é a
   ÚNICA portadora daquele primeiro nome (registo, quem importa, conhecidos,
   grupo) e nada os separa (sexo, ofício, lugar, paradeiro — `contraODono`).
   Dois "Ivarr" diferentes não se fundem: é a lição de MM15 ("dois Túlios
   são duas pessoas"). O epíteto é o que vem logo depois do primeiro nome e
   abre por uma destas palavras ("o Exilado", "da Pedra"), pela vírgula
   ("Ivarr, o Ferreiro"), ou é um composto com hífen ("Barba-Ruiva"). Um
   sobrenome solto ("Mendes") não é epíteto: o mundo repete nomes. */
export const EPITETO = {
  abre: ["o", "a", "da", "do", "das", "dos", "de", "del", "von", "van"],
  virgula: ",",
  hifen: "-",
};
/* o que acontece a um homónimo que se distingue do dono, por quem o dono é */
export const DISTINTO_DE = {
  /* quem a história persegue: dois com o mesmo nome confundem quem joga */
  historia: "recusada",
  /* a gente do mundo: nomes repetem-se, e o novo nasce com o nome inteiro */
  mundo: "nova",
};
/* no local, no estado, no papel ou nas notas da ficha: quem está assim NÃO
   está em casa nem na cidade. Raízes (casam no começo da palavra). */
export const PARADEIRO = {
  fora: ["sumi", "desaparec", "perdid", "raptad", "sequestrad", "foragid", "caminho", "estrada", "viagem", "nao voltou", "nunca voltou", "partiu"],
};
/* as famílias de ofício: dois ofícios conhecidos e de famílias que não se
   tocam separam duas pessoas. Raízes, sem acento, no começo da palavra. */
export const OFICIOS = [
  { id: "musica", raizes: ["music", "bard", "menestrel", "trovador", "cantor", "cantad", "harpist", "alaudist", "tocador", "flautist", "violeir", "tambor"] },
  { id: "taverna", raizes: ["tavern", "taberne", "estalaj", "servical", "copeir", "cozinh", "hosped"] },
  { id: "comercio", raizes: ["mercad", "vended", "caravan", "comerci", "mascate", "lojist", "cambist", "feirant", "negocian"] },
  { id: "fe", raizes: ["sacerdot", "acolit", "padre", "monge", "freira", "cleri", "peregrin", "reliqui", "pregad", "sacrist"] },
  { id: "forja", raizes: ["ferreir", "ferrad", "armeir", "forj", "serralh"] },
  { id: "armas", raizes: ["guarda", "sargent", "capit", "recrut", "soldad", "vigia", "sentinel", "carcereir", "cavaleir", "mercenari", "campeao", "gladiad"] },
  { id: "letras", raizes: ["escriv", "escriba", "arquivist", "estudant", "tradut", "sabio", "professor"] },
  { id: "mar", raizes: ["marinheir", "pescad", "porto", "barqueir", "navegad"] },
  { id: "crime", raizes: ["ladr", "batedor", "contraband", "assassin", "bandid", "larapi", "gatun"] },
  { id: "morte", raizes: ["coveir", "carpideir"] },
  { id: "cura", raizes: ["curandeir", "medic", "herborist", "boticari", "parteir", "erv"] },
  { id: "campo", raizes: ["lavrad", "campones", "pastor", "cacad", "lenhad", "agricult", "moleir"] },
];
/* o primeiro nome solto, com mais de uma pessoa a tê-lo: o que aponta
   quem é. Ganha quem somar mais, sozinho e acima de zero. */
export const NOME_SOLTO = {
  conversa: 5,        /* o nome inteiro dela está na conversa recente — o que a conversa trata vence o lugar */
  exato: 2,           /* ela chama-se exatamente assim ("Edric", o do cartaz) */
  lugar: 2,           /* o lugar dela bate com o da cena (ou o da ficha) */
  lugarOutro: -2,     /* ela está em casa, e a casa é noutro lugar */
  oficio: 2,          /* o ofício dito é da família do dela */
  oficioOutro: -2,    /* o ofício dito é de outra família */
  paradeiro: 1,       /* a ficha diz que sumiu, e ela sumiu */
  paradeiroOutro: -2, /* a ficha diz que sumiu, e ela está em casa */
};

const SEXO = [["f", /\b(mulher|feminin[oa]|fem|ela|menina|senhora|dona)\b/], ["m", /\b(homem|masculin[oa]|masc|ele|menino|senhor)\b/]];
function sexoDe(g) {
  const t = semAcento(g);
  if (!t) return "";
  for (const [s, rx] of SEXO) if (rx.test(t)) return s;
  return "";
}

const palavrasDe = (nome) => semAcento(nome).split(/[\s,]+/).filter(Boolean);
function semArtigos(nome) {
  const partes = palavrasDe(nome);
  while (partes.length > 1 && HOMONIMO.artigos.includes(partes[0])) partes.shift();
  return partes;
}

/* o primeiro nome, sem artigo nem tratamento, em minúsculas e sem acento */
export function primeiroNome(nome) {
  return semArtigos(nome)[0] || "";
}

/* o sobrenome de FAMÍLIA: o que vem depois de uma partícula ("da Runa" →
   "runa"), ou um composto com hífen ("Barba-Ruiva"). Um epíteto com
   artigo (", o cativo") ou um adjetivo solto não é família. */
function sobrenomeDeFamilia(nome) {
  const partes = semArtigos(nome).slice(1);
  const i = partes.findIndex((p) => HOMONIMO.particulas.includes(p));
  if (i >= 0 && partes[i + 1]) return partes.slice(i + 1).join(" ");
  const h = partes.find((p) => p.includes("-"));
  return h || "";
}

const temRaiz = (texto, raizes) => {
  const t = ` ${semAcento(texto).replace(/[^a-z0-9 -]+/g, " ")}`;
  return raizes.some((r) => t.includes(` ${r}`));
};
const estaFora = (...textos) => textos.some((x) => typeof x === "string" && x.trim() && temRaiz(x, PARADEIRO.fora));
/* exportada em 05/10 (3.ª sessão de prova, defeito 3): o portão usa a mesma
   régua para saber se o que o Mestre disse de quem anda no grupo é de facto
   um OFÍCIO ("a serviçal da taverna") ou só a frase à volta do nome ("o
   golpe do lobo acerta") — ver `detectarPapelTrocado`, portao.js. */
export const familiasDoOficio = (papel) => (typeof papel === "string" && papel.trim() ? OFICIOS.filter((f) => temRaiz(papel, f.raizes)).map((f) => f.id) : []);
/* -1 = de famílias que não se tocam; 1 = da mesma; 0 = não se sabe */
function oficioCasa(a, b) {
  const fa = familiasDoOficio(a), fb = familiasDoOficio(b);
  if (!fa.length || !fb.length) return 0;
  return fa.some((x) => fb.includes(x)) ? 1 : -1;
}

const lugarCasa = (a, b) => {
  const x = semAcento(a).replace(/^(o|a|os|as)\s+/, ""), y = semAcento(b).replace(/^(o|a|os|as)\s+/, "");
  return !!x && !!y && (x.includes(y) || y.includes(x));
};

/* quem importa, cada um com o que se sabe dele: a lista do App mais quem
   no registo tem investimento (esses são da história) */
function quemImporta(reg, c) {
  const lista = [];
  for (const x of Array.isArray(c.importantes) ? c.importantes : []) {
    const o = x && typeof x === "object" ? x : { nome: x };
    if (typeof o.nome !== "string" || !o.nome.trim()) continue;
    lista.push({ nome: o.nome.trim(), onde: String(o.onde || ""), genero: String(o.genero || ""), papel: String(o.papel || ""), notas: String(o.notas || ""), de: o.de === "mundo" ? "mundo" : "historia" });
  }
  for (const [k, n] of Object.entries(reg)) {
    if (n && typeof n === "object" && investimentoDe({ ...n, nome: n.nome || k }, {}).length) lista.push({ nome: String(n.nome || k), onde: "", genero: "", papel: "", notas: "", de: "historia" });
  }
  return lista;
}

/* `longo` é `curto` mais um epíteto (EPITETO): o mesmo primeiro nome, e o
   resto abre por artigo/partícula, pela vírgula, ou é um composto com hífen */
function soEpiteto(curto, longo) {
  const a = semArtigos(curto), b = semArtigos(longo);
  if (a.length !== 1 || b.length < 2 || a[0] !== b[0]) return false;
  const resto = b.slice(1);
  if (EPITETO.abre.includes(resto[0])) return resto.length > 1;
  if (resto.length === 1 && resto[0].includes(EPITETO.hifen)) return true;
  const [antes, ...depois] = semAcento(longo).split(EPITETO.virgula);
  const ate = semArtigos(antes);
  return depois.join("").trim() !== "" && ate.length === 1 && ate[0] === a[0];
}

/* o veredito contra UM dono — devolve a decisão e o motivo */
function contraODono(nome, dono, reg, novo) {
  const chaveDono = Object.keys(reg).find((k) => semAcento(k) === semAcento(dono.nome)) || "";
  const ficha = chaveDono && reg[chaveDono] && typeof reg[chaveDono] === "object" ? reg[chaveDono] : {};
  const base = { dono: chaveDono || dono.nome };
  const ondeDono = dono.onde || ficha.local || ficha.cidade || "";
  /* o lugar: quem a ficha põe longe, com o local onde anda, não está no
     "aqui" da heroína — compara-se só esse local; o resto, como em v9.338
     (um sumiço sem local não tira o "aqui": a Delfina que se procura pode
     ter sumido, e falar dela à porta dela continua a ser falar dela) */
  const longeComLocal = novo.fora && !!novo.local.trim();
  const lugares = longeComLocal ? [novo.local] : [novo.local, ...novo.aqui].filter((x) => x.trim());
  let bate = ondeDono && lugares.length ? lugares.some((a) => lugarCasa(a, ondeDono)) : null;
  /* "a caminho de Vila Serena" não é estar em Vila Serena: o local de quem
     está longe só separa, nunca confirma */
  if (longeComLocal && bate === true) bate = null;
  /* os sinais que separam */
  const s1 = sexoDe(novo.genero), s2 = sexoDe(dono.genero || ficha.genero);
  const sexo = !!(s1 && s2 && s1 !== s2);
  const fa = sobrenomeDeFamilia(nome), fb = sobrenomeDeFamilia(dono.nome);
  const sobrenome = !!(fa && fb && !fa.includes(fb) && !fb.includes(fa));
  const oficio = oficioCasa(novo.papel, dono.papel || ficha.papel) < 0;
  const donoFora = estaFora(ficha.status, ficha.local, ficha.notas, dono.notas);
  const donoEmCasa = !donoFora && !!ondeDono && (dono.de === "mundo" || !!chaveDono);
  const paradeiro = novo.fora && donoEmCasa;
  const longe = novo.fora && bate === false;
  if (sexo || longe || paradeiro || sobrenome || oficio) {
    if (DISTINTO_DE[dono.de] === "nova") return { decisao: "nova", motivo: "" };
    /* a recusa diz o motivo mais útil ao Narrador: o lugar primeiro */
    const motivo = sexo ? "sexo" : bate === false ? "lugar" : paradeiro ? "paradeiro" : sobrenome ? "sobrenome" : "oficio";
    return { decisao: "recusada", ...base, motivo };
  }
  /* nada os separa: v9.338 */
  if (bate === false) return { decisao: "recusada", ...base, motivo: "lugar" };
  if (chaveDono) return { decisao: "mesma", ...base, nome: chaveDono, chave: chaveDono };
  if (bate === true) return { decisao: "mesma", ...base, nome: dono.nome };
  return { decisao: "recusada", ...base, motivo: "soNome" };
}

/* a casa que um nome nomeia: o que vem depois do tipo de lugar ("Taverna
   Candeia Faiscante" → "candeia faiscante"), ou o nome inteiro quando é,
   sem o artigo, o lugar de alguém que importa ("A Candeia Faiscante") */
function casaDoNome(nome, gente) {
  const partes = semArtigos(nome);
  if (partes.length && LUGAR_NAO_E_GENTE.abre.includes(partes[0])) return partes.slice(1).join(" ") || partes[0];
  const inteiro = partes.join(" ");
  return gente.some((d) => d.onde && semArtigos(d.onde).join(" ") === inteiro) ? inteiro : "";
}
/* duas casas são a mesma: igual sem o artigo, ou uma dentro da outra
   quando as duas têm duas palavras ou mais ("Candeia Faiscante" e "A
   Candeia Faiscante, em Casa da Fonte"); uma palavra solta não casa por
   pedaço — "Velha" não é toda a "Ponte Velha" */
function mesmaCasa(a, b) {
  const x = semArtigos(a).join(" "), y = semArtigos(b).join(" ");
  if (!x || !y) return false;
  if (x === y) return true;
  return x.split(" ").length >= 2 && y.split(" ").length >= 2 && (` ${x} `.includes(` ${y} `) || ` ${y} `.includes(` ${x} `));
}

/* o primeiro nome solto, com dois ou mais a tê-lo: a pontuação de cada um */
function pontosDoSolto(p, reg, novo, recentes) {
  const ficha = p.chave && reg[p.chave] && typeof reg[p.chave] === "object" ? reg[p.chave] : {};
  let pts = 0;
  if (palavrasDe(p.nome).length > 1 && recentes && recentes.includes(semAcento(p.nome))) pts += NOME_SOLTO.conversa;
  if (semAcento(p.nome) === novo.alvo) pts += NOME_SOLTO.exato;
  const ondeP = [p.onde, ficha.local, ficha.cidade].filter((x) => typeof x === "string" && x.trim());
  const lugares = novo.fora ? [novo.local].filter((x) => x.trim()) : [novo.local, ...novo.aqui].filter((x) => x.trim());
  const pFora = estaFora(ficha.status, ficha.local, ficha.notas, p.notas);
  if (ondeP.some((o) => lugares.some((a) => lugarCasa(a, o)))) pts += NOME_SOLTO.lugar;
  /* quem anda sumido não tem "aqui": o lugar só pesa contra quem está em casa */
  else if (ondeP.length && lugares.length && !pFora) pts += NOME_SOLTO.lugarOutro;
  const of = oficioCasa(novo.papel, p.papel || ficha.papel);
  if (of > 0) pts += NOME_SOLTO.oficio;
  if (of < 0) pts += NOME_SOLTO.oficioOutro;
  /* só pesa o que a ficha nova DIZ: calar o paradeiro não é estar em casa */
  if (novo.fora) pts += pFora ? NOME_SOLTO.paradeiro : NOME_SOLTO.paradeiroOutro;
  return pts;
}

export function nomeComDono(nome, npcs, contexto = {}) {
  const reg = npcs && typeof npcs === "object" ? npcs : {};
  const c = contexto && typeof contexto === "object" ? contexto : {};
  const alvo = semAcento(nome);
  const nomeLimpo = String(nome == null ? "" : nome).trim();
  const out = (decisao, extra = {}) => ({ decisao, nome: nomeLimpo, chave: "", dono: "", motivo: "", ...extra });
  if (!alvo) return out("nova", { nome: "" });
  /* MM-C · C0: o HERÓI nunca é gente da cena (ver QUEM_NAO_E_GENTE).
     9.ª sessão de prova (12/10): nem pelo NOME DE FAMÍLIA. O herói era
     "Rufo Tamanqueiro"; o COMO SE CHAMA manda os estranhos tratá-lo por
     "Tamanqueiro" — e um taverneiro disse "Tá procurando alguém,
     Tamanqueiro?", e o registo ganhou "Tamanqueiro — taverneiro do Machado e
     a Rosa". Só o primeiro nome era o herói. Agora qualquer palavra do nome
     dele (sem partícula, com o tamanho mínimo do primeiro nome), dita
     SOZINHA, é ele. */
  const heroi = semArtigos(c.heroi).join(" ");
  const palavrasDoHeroi = [primeiroNome(c.heroi), ...semArtigos(c.heroi).slice(1).filter((w) => w.length >= HOMONIMO.primeiroMinimo && !HOMONIMO.particulas.includes(w))];
  if (heroi && (alvo === semAcento(c.heroi) || (semArtigos(nome).length === 1 && palavrasDoHeroi.includes(primeiroNome(nome))))) {
    return out("recusada", { dono: nomeLimpo, motivo: "heroi" });
  }
  /* 10.ª sessão (13/10): nem com o POSTO à frente ("Sargenta Barbaforte") —
     tirado o posto (POSTO_E_OFICIO.titulos), o que sobra é só nome dele */
  if (heroi) {
    const semPosto = semArtigos(nome);
    while (semPosto.length > 1 && POSTO_E_OFICIO.titulos.includes(semPosto[0])) semPosto.shift();
    const resto = semPosto.filter((w) => !HOMONIMO.particulas.includes(w));
    if (semPosto.length < semArtigos(nome).length && resto.length && resto.every((w) => palavrasDoHeroi.includes(w))) {
      return out("recusada", { dono: nomeLimpo, motivo: "heroi" });
    }
  }
  /* e a DESCRIÇÃO não é nome: "o carroceiro" é de quem tem esse ofício na
     cena, quando é um só; senão, fica sem ficha até ter nome */
  if ((ehDescritor(nome) || ehOficioDaCasa(nome)) && !Object.keys(reg).some((k) => semAcento(k) === alvo)) {
    const reg0 = Object.entries(reg).filter(([, n]) => n && typeof n === "object");
    const aquiNomes = (Array.isArray(c.aqui) ? c.aqui : []).filter((x) => typeof x === "string" && x.trim());
    const doOficio = reg0.filter(([k, n]) => papelEstrito(n.papel, nome) && (!aquiNomes.length || !n.local || aquiNomes.some((a) => lugarCasa(a, n.local))));
    if (doOficio.length === 1) return out("mesma", { nome: doOficio[0][0], chave: doOficio[0][0], dono: doOficio[0][0], motivo: "descritor" });
    return out("recusada", { dono: nomeLimpo, motivo: "descritor" });
  }
  const pn = primeiroNome(nome);
  const txt = (x) => (typeof x === "string" ? x : "");
  const novo = {
    alvo, local: txt(c.local), genero: txt(c.genero), papel: txt(c.papel),
    aqui: (Array.isArray(c.aqui) ? c.aqui : []).map((x) => (typeof x === "string" ? x : "")),
  };
  novo.fora = estaFora(novo.local, novo.papel, txt(c.notas), txt(c.status));
  const lista = quemImporta(reg, c);
  /* conhecidos: o nome, ou { nome, onde, papel, notas } — um cartaz do mural diz de quem fala e o que lhe aconteceu */
  const conhecidos = [];
  for (const x of Array.isArray(c.conhecidos) ? c.conhecidos : []) {
    const o = x && typeof x === "object" ? x : { nome: x };
    if (typeof o.nome === "string" && o.nome.trim()) conhecidos.push({ nome: o.nome.trim(), onde: txt(o.onde), papel: txt(o.papel), notas: txt(o.notas) });
  }
  /* UM LUGAR NÃO É GENTE (LUGAR_NAO_E_GENTE, acima): a casa de UMA pessoa
     que importa, com o herói lá dentro, é ela; senão, recusa-se */
  const casa = casaDoNome(nome, [...lista, ...conhecidos]);
  if (casa) {
    const vistos = new Set();
    const donos = [...lista, ...conhecidos].filter((d) => {
      if (!d.onde || !mesmaCasa(casa, d.onde) || oficioCasa(novo.papel, d.papel) < 0) return false;
      const k = semAcento(d.nome);
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
    const dono = donos.length === 1 ? donos[0] : null;
    if (dono && novo.aqui.some((a) => mesmaCasa(semArtigos(a).join(" "), dono.onde))) {
      const chave = Object.keys(reg).find((k) => semAcento(k) === semAcento(dono.nome)) || "";
      return out("mesma", { nome: chave || dono.nome, chave, dono: dono.nome, motivo: "lugar_nao_e_gente" });
    }
    return out("recusada", { dono: nomeLimpo, motivo: "lugar_nao_e_gente" });
  }
  const exata = Object.keys(reg).find((k) => semAcento(k) === alvo);
  /* O NOME CURTO DE QUEM ANDA NO GRUPO (05/10, 3.ª sessão de prova,
     defeito 3). A companheira de antes chamava-se Iracema Sousa, e na
     cidade de partida servia uma "Iracema": o primeiro nome solto casava
     com a homónima (pelo nome exato e pelo lugar), e daí em diante cada
     "Iracema" da narração era a serviçal. Quem anda no grupo está ao lado
     do herói e é de quem se fala: o primeiro nome solto que é o de UMA
     pessoa do grupo resolve para ela — nunca para uma homónima do registo
     ou da cidade, e o lugar da ficha dela não conta (anda onde o herói
     anda). Só o sexo dito e um ofício de outra família a separam, e aí o
     nome é recusado: nunca nasce uma segunda pessoa com o nome curto
     dela. `grupo`: [{ nome, conceito, classe, subclasse }] ou [nome]. */
  const grupo = (Array.isArray(c.grupo) ? c.grupo : [])
    .map((g) => (g && typeof g === "object" ? g : { nome: g }))
    .filter((g) => typeof g.nome === "string" && g.nome.trim() && !g.invocada);
  if (pn.length >= HOMONIMO.primeiroMinimo && semArtigos(nome).length === 1) {
    const doGrupo = grupo.filter((g) => primeiroNome(g.nome) === pn);
    if (doGrupo.length === 1) {
      const g = doGrupo[0];
      const chave = Object.keys(reg).find((k) => semAcento(k) === semAcento(g.nome)) || "";
      const ficha = chave && reg[chave] && typeof reg[chave] === "object" ? reg[chave] : {};
      const s1 = sexoDe(novo.genero), s2 = sexoDe(g.genero || ficha.genero);
      const fichas = [ficha.papel, g.conceito, g.classe, g.subclasse].filter((x) => typeof x === "string" && x.trim());
      const fn = familiasDoOficio(novo.papel);
      const oficio = fn.length > 0 && fichas.some((f) => familiasDoOficio(f).length) && !fichas.some((f) => familiasDoOficio(f).some((x) => fn.includes(x)));
      const base = { dono: chave || g.nome };
      if (s1 && s2 && s1 !== s2) return out("recusada", { ...base, motivo: "sexo" });
      if (oficio) return out("recusada", { ...base, motivo: "oficio" });
      return out("mesma", { ...base, nome: chave || g.nome, chave });
    }
  }
  /* o primeiro nome SOLTO, com dois ou mais a tê-lo: quem está mais perto */
  if (pn.length >= HOMONIMO.primeiroMinimo && semArtigos(nome).length === 1) {
    const vistos = new Map();
    /* os portadores do primeiro nome: o registo, quem importa e quem o
       mundo conhece — um por nome inteiro, com o que se sabe de cada um */
    const junta = (n, extra) => {
      const k = semAcento(n);
      if (primeiroNome(n) !== pn) return;
      const v = vistos.get(k);
      if (!v) { vistos.set(k, { nome: n, onde: "", papel: "", notas: "", chave: "", ...extra }); return; }
      vistos.set(k, { ...v, onde: v.onde || extra.onde || "", papel: v.papel || extra.papel || "", notas: v.notas || extra.notas || "" });
    };
    for (const k of Object.keys(reg)) junta(k, { chave: k });
    for (const d of lista) junta(d.nome, { onde: d.onde, papel: d.papel, notas: d.notas });
    for (const n of conhecidos) junta(n.nome, { onde: n.onde, papel: n.papel, notas: n.notas });
    const portadores = [...vistos.values()];
    if (portadores.length >= 2) {
      const recentes = semAcento((Array.isArray(c.recentes) ? c.recentes : []).filter((x) => typeof x === "string").join(" \n "));
      const pontos = portadores.map((p) => ({ p, pts: pontosDoSolto(p, reg, novo, recentes) }));
      const max = Math.max(...pontos.map((x) => x.pts));
      const topo = pontos.filter((x) => x.pts === max);
      if (max > 0 && topo.length === 1) {
        const p = topo[0].p;
        return out("mesma", { nome: p.chave || p.nome, chave: p.chave, dono: p.chave || p.nome });
      }
      if (exata) return out("mesma", { nome: exata, chave: exata });
      const igual = portadores.find((p) => semAcento(p.nome) === alvo);
      if (igual) return out("mesma", { nome: igual.nome, dono: igual.nome });
      return out("recusada", { dono: portadores.map((p) => p.chave || p.nome).join(" e "), motivo: "ambiguo" });
    }
  }
  /* 0 — o próprio nome já está no registo (caixa e acento não contam) */
  if (exata) return out("mesma", { nome: exata, chave: exata });
  /* 0b — o nome inteiro que o mundo já conhece é o da própria pessoa */
  const sabido = [...lista, ...conhecidos].map((d) => d.nome).find((n) => semAcento(n) === alvo);
  if (sabido) return out("mesma", { nome: sabido, dono: sabido });
  if (pn.length < HOMONIMO.primeiroMinimo) return out("nova");
  /* cada dono do primeiro nome dá o seu veredito: um que a reconheça
     ganha; senão, uma recusa da história; senão, nasce própria */
  const donos = lista.filter((d) => primeiroNome(d.nome) === pn && semAcento(d.nome) !== alvo);
  if (!donos.length) {
    /* O NOME COM EPÍTETO (EPITETO, acima): a única portadora do primeiro
       nome, registada com o nome curto ou com o epíteto, é ela — se nada
       os separa; separados, o figurante novo nasce (é gente do mundo) */
    const portadores = new Set();
    for (const n of [...Object.keys(reg), ...lista.map((d) => d.nome), ...conhecidos.map((d) => d.nome), ...grupo.map((g) => g.nome)]) {
      if (primeiroNome(n) === pn) portadores.add(semAcento(n));
    }
    const chave = portadores.size === 1 ? Object.keys(reg).find((k) => portadores.has(semAcento(k))) : "";
    if (chave && reg[chave] && typeof reg[chave] === "object" && (soEpiteto(nome, chave) || soEpiteto(chave, nome))) {
      const v = contraODono(nome, { nome: chave, onde: "", genero: "", papel: "", notas: "", de: "mundo" }, reg, novo);
      if (v.decisao === "mesma") return out("mesma", v);
    }
    return out("nova");
  }
  const vereditos = donos.map((d) => contraODono(nome, d, reg, novo));
  const v = vereditos.find((x) => x.decisao === "mesma") || vereditos.find((x) => x.decisao === "recusada") || vereditos[0];
  return out(v.decisao, v);
}

/* O que o Narrador recebe quando o registo recusou um nome: fato fechado,
   uma linha por recusa, e a saída (outro nome, o nome dela, ou ela não
   está aqui) — a de cada motivo, em SAIDA_DO_HOMONIMO. */
export function notaDoHomonimo(recusas) {
  const todas = (Array.isArray(recusas) ? recusas : []).filter((r) => r && r.decisao === "recusada" && r.nome && r.dono);
  /* o lugar que veio como gente tem a sua linha: não é homónimo de ninguém */
  const casas = todas.filter((r) => r.motivo === "lugar_nao_e_gente");
  const rs = todas.filter((r) => r.motivo !== "lugar_nao_e_gente");
  const deCasa = casas.length
    ? `[CORREÇÃO DO SISTEMA — NOMES] ${casas.map((r) => `"${r.nome}" — ${MOTIVO_DO_HOMONIMO.lugar_nao_e_gente}`).join("; ")}. O registo não o aceitou como pessoa; ${SAIDA_DO_HOMONIMO.lugar_nao_e_gente}.`
    : "";
  if (!rs.length) return deCasa;
  const l = rs.map((r) => (r.motivo === "ambiguo"
    ? `"${r.nome}" — ${MOTIVO_DO_HOMONIMO.ambiguo} nesta história (${r.dono})`
    : `"${r.nome}" — ${r.dono} já é outra pessoa desta história (${MOTIVO_DO_HOMONIMO[r.motivo] || MOTIVO_DO_HOMONIMO.lugar})`)).join("; ");
  const saidas = [...new Set(rs.map((r) => SAIDA_DO_HOMONIMO[r.motivo] || SAIDA_DO_HOMONIMO.lugar))].join("; ");
  return `${deCasa ? `${deCasa}\n` : ""}[CORREÇÃO DO SISTEMA — NOMES] ${l}. O registo não aceitou este nome. Se é alguém novo, dê-lhe um nome que não comece pelo de quem já importa; se era para ser ${rs.length > 1 ? "essas pessoas" : rs[0].motivo === "ambiguo" ? "uma delas" : rs[0].dono}, ${saidas}.`;
}
