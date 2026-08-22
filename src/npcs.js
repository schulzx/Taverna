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

export function criarNPC(nome, dados = {}) {
  return {
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
    ultimaVez: dados.ultimaVez || 0,     // turno da última menção (p/ ordenar)
    semente: dados.semente || `npc|${nome}|${dados.papel || ""}`,
  };
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
export function mesclarNPC(ficha, dados = {}) {
  const out = { ...ficha };
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

/* Resumo compacto do elenco para o prompt — UMA linha por pessoa, as mais
   recentes/relevantes primeiro. Teto rígido para nunca inflar o prompt. */
export function resumoNPCsParaPrompt(npcs, limite = 22) {
  const lista = Object.values(npcs || {});
  if (!lista.length) return "";
  const ord = [...lista].sort((a, b) => (b.ultimaVez || 0) - (a.ultimaVez || 0)).slice(0, limite);
  return ord.map((n) => {
    const partes = [n.papel, n.relacao && n.relacao !== "desconhecido" ? `relação: ${n.relacao}` : "", n.genero, n.local ? `em ${n.local}` : "", n.status && n.status !== "vivo" ? n.status : "", n.conhecidoEm != null ? (n.conhecidoEm > 0 ? `entrou na história no DIA ${n.conhecidoEm}` : "entrou antes do registro de dias") : ""].filter(Boolean);
    const extra = [n.segredo ? `SEGREDO: ${n.segredo}` : "", n.notas].filter(Boolean).join(" · ");
    return `• ${n.nome}${partes.length ? ` (${partes.join(", ")})` : ""}${extra ? ` — ${extra}` : ""}`;
  }).join("\n");
}
