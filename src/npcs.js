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
  if (!donos.length) return out("nova");
  const vereditos = donos.map((d) => contraODono(nome, d, reg, novo));
  const v = vereditos.find((x) => x.decisao === "mesma") || vereditos.find((x) => x.decisao === "recusada") || vereditos[0];
  return out(v.decisao, v);
}

/* O que o Narrador recebe quando o registo recusou um nome: fato fechado,
   uma linha por recusa, e a saída (outro nome, o nome dela, ou ela não
   está aqui) — a de cada motivo, em SAIDA_DO_HOMONIMO. */
export function notaDoHomonimo(recusas) {
  const rs = (Array.isArray(recusas) ? recusas : []).filter((r) => r && r.decisao === "recusada" && r.nome && r.dono);
  if (!rs.length) return "";
  const l = rs.map((r) => (r.motivo === "ambiguo"
    ? `"${r.nome}" — ${MOTIVO_DO_HOMONIMO.ambiguo} nesta história (${r.dono})`
    : `"${r.nome}" — ${r.dono} já é outra pessoa desta história (${MOTIVO_DO_HOMONIMO[r.motivo] || MOTIVO_DO_HOMONIMO.lugar})`)).join("; ");
  const saidas = [...new Set(rs.map((r) => SAIDA_DO_HOMONIMO[r.motivo] || SAIDA_DO_HOMONIMO.lugar))].join("; ");
  return `[CORREÇÃO DO SISTEMA — NOMES] ${l}. O registo não aceitou este nome. Se é alguém novo, dê-lhe um nome que não comece pelo de quem já importa; se era para ser ${rs.length > 1 ? "essas pessoas" : rs[0].motivo === "ambiguo" ? "uma delas" : rs[0].dono}, ${saidas}.`;
}
