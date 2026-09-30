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

export function criarNPC(nome, dados0 = {}) {
  const dados = dados0 && typeof dados0 === "object" ? dados0 : {};
  const encontro = diaDoEncontro(dados.conhecidoEm);
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

/* Mescla uma atualização numa ficha existente: campos novos sobrescrevem,
   nunca apagam o que já existia (blindagem contra perda de memória).

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
    out[k] = dados[k];
  }
  if (dados.relacao) out.relacao = String(dados.relacao).toLowerCase();
  if (dados.ultimaVez) out.ultimaVez = dados.ultimaVez;
  if (conflito) out._papelConflito = conflito;
  return out;
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

/* Resumo compacto do elenco para o prompt — UMA linha por pessoa, as mais
   recentes/relevantes primeiro. Teto rígido para nunca inflar o prompt. */
export function resumoNPCsParaPrompt(npcs, limite = TETO_DAS_PESSOAS.pessoas, contexto = null) {
  /* MM8c-2: por importância, a recência desempata. MM8d: e quem é de
     passagem não ocupa lugar nenhum */
  const reg = normalizarRecencia(npcs && typeof npcs === "object" ? npcs : {}) || {};
  const agora = retomarContador(reg);
  const ord = ordemDaImportancia(reg, contexto).filter((n) => !ehDePassagem(n, contexto, agora)).slice(0, limite);
  if (!ord.length) return "";
  const linhas = ord.map((n) => {
    const partes = [n.papel, n.relacao && n.relacao !== "desconhecido" ? `relação: ${n.relacao}` : "", n.genero, n.local ? `em ${n.local}` : "", n.status && n.status !== "vivo" ? n.status : "", n.conhecidoEm != null ? (n.conhecidoEm > 0 ? `entrou na história no DIA ${n.conhecidoEm}` : "entrou antes do registro de dias") : ""].filter(Boolean);
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
    const extra = [laco, laE, n.segredo ? `SEGREDO: ${n.segredo}` : "", n.notas].filter(Boolean).join(" · ");
    return `• ${n.nome}${partes.length ? ` (${partes.join(", ")})` : ""}${extra ? ` — ${extra}` : ""}`;
  });
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
