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
