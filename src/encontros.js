/* ============================================================
   VIAGEM: ENCONTROS E CLIMA POR TABELA — Taverna
   A estrada e o céu rolam por CÓDIGO: o que aparece no caminho,
   qual criatura (do bestiário, com a ficha pronta), que achado
   (espólio das tabelas), e como está o tempo. O Mestre só recebe
   o resultado e NARRA — zero tokens decidindo aleatoriedade,
   e a estrada nunca mais é "sempre a mesma".
   ============================================================ */
import { criaturasDoGenero } from "./bestiario.js";
import { gerarEspolios } from "./combate.js";

const d100 = () => 1 + Math.floor(Math.random() * 100);

/* ---------------- CLIMA ----------------
   Rola a cada trecho de viagem e pode mudar com o passar do tempo.
   A nota mecânica é leve (sugestão ao Mestre, não conta escondida). */
export const CLIMAS = [
  { id: "ensolarado", rotulo: "ensolarado", icone: "☀", peso: 28, nota: "visão longa, estrada firme — viagem rápida" },
  { id: "nublado", rotulo: "nublado", icone: "☁", peso: 20, nota: "luz cinza, ânimo pesado" },
  { id: "chuva", rotulo: "chuva", icone: "🌧", peso: 18, nota: "lama; rastrear e acender fogueira ficam difíceis" },
  { id: "neblina", rotulo: "neblina", icone: "🌫", peso: 12, nota: "visão curta — favorece emboscadas e furtividade" },
  { id: "vento", rotulo: "vento forte", icone: "💨", peso: 9, nota: "vozes se perdem; difícil ouvir aproximação" },
  { id: "tempestade", rotulo: "tempestade", icone: "⛈", peso: 7, nota: "visão ruim, raios; desvantagem em ataques à distância" },
  { id: "calor", rotulo: "calor opressivo", icone: "🔥", peso: 3, nota: "cansaço dobrado; água vale ouro" },
  { id: "frio", rotulo: "frio cortante", icone: "❄", peso: 3, nota: "dedos dormentes; quem não se agasalha sofre" },
];
const POOL_CLIMA = CLIMAS.flatMap((c) => Array(c.peso).fill(c));

export function rolarClima(atualId) {
  let c = POOL_CLIMA[Math.floor(Math.random() * POOL_CLIMA.length)];
  if (atualId && c.id === atualId) c = POOL_CLIMA[Math.floor(Math.random() * POOL_CLIMA.length)];
  return c;
}

/* ---------------- ENCONTROS DE VIAGEM ----------------
   Distribuição: 32% perigo (criatura do bestiário, escalada ao nível),
   18% viajante, 16% achado (espólio por tabela), 19% cena de mundo,
   15% estrada tranquila. */
const VIAJANTES = [
  "um mercador com a carroça atolada, desesperado por braços fortes",
  "um peregrino que jura ter visto algo terrível na próxima curva",
  "um batedor ferido carregando um aviso que não pode cair em mãos erradas",
  "uma família de refugiados fugindo de algo que não nomeiam",
  "um bardo que oferece notícias frescas em troca de companhia",
  "um caçador de recompensas perguntando por alguém — talvez por você",
  "um nobre disfarçado de plebeu, viajando sem escolta",
  "dois homens de capuz que pararam de conversar ao te ver",
];
const CENAS = [
  "as ruínas de um posto de vigilância tomado pela vegetação — alguém acampou aqui ontem",
  "uma carroça saqueada à beira da estrada, sem corpos, com pegadas que sobem o morro",
  "uma patrulha de uma potência vizinha contando viajantes e anotando nomes",
  "um marco de pedra com oferendas recentes — os locais temem algo nesta região",
  "um mercado improvisado de estrada, onde tudo se vende e pouco se pergunta",
  "corvos circulando sobre o vale à frente, em silêncio absoluto",
  "uma ponte caída que obriga um desvio longo — ou uma travessia perigosa",
];

export function rolarEncontro(genero, nivel, nomeViajante) {
  const r = d100();
  if (r <= 32) {
    const lista = (criaturasDoGenero(genero) || []).filter((c) => c.nivelRef <= nivel + 2 && c.nivelRef >= Math.max(1, nivel - 4));
    const pool = lista.length ? lista : (criaturasDoGenero(genero) || []);
    if (pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      const qtd = c.ameaca === "fraco" ? 2 + Math.floor(Math.random() * 3) : c.ameaca === "comum" ? 1 + Math.floor(Math.random() * 2) : 1;
      return {
        tipo: "perigo",
        titulo: qtd > 1 ? `${c.nome} (×${qtd})` : c.nome,
        detalhe: `Criatura do bestiário: ${c.nome} — ${c.desc}. Se a coisa engrossar, inicie o combate mandando em "combate_iniciar" só ${qtd > 1 ? `${qtd} entradas de ` : ""}{"nome":"${c.nome}","ameaca":"${c.ameaca}"} — PV, defesa e dano o app preenche pela tabela. Não é obrigado a virar luta: dá para evitar, fugir, negociar.`,
      };
    }
  }
  if (r <= 50) {
    return { tipo: "viajante", titulo: nomeViajante || "um desconhecido", detalhe: `${nomeViajante ? `${nomeViajante} aparece como` : "Aparece"} ${VIAJANTES[Math.floor(Math.random() * VIAJANTES.length)]}. Se ele(a) for marcante, registre em "npcs".` };
  }
  if (r <= 66) {
    const esp = gerarEspolios([{ ameaca: Math.random() < 0.3 ? "competente" : "comum" }]);
    const partes = [`◉ ${esp.moedas}`];
    if (esp.caiItem) partes.push("1 item útil");
    return { tipo: "achado", titulo: "algo à beira da estrada", detalhe: `Achado rolado pelas tabelas: ${partes.join(" + ")} — entregue de verdade, via "moedas" e, se couber, "itens"/"equipamento_novo". Crie o contexto (um esconderijo, um corpo na vala, um altar esquecido), mas o CONTEÚDO é este; não invente mais nada.` };
  }
  if (r <= 85) {
    return { tipo: "cena", titulo: "sinais no caminho", detalhe: `Na estrada: ${CENAS[Math.floor(Math.random() * CENAS.length)]}. É um gancho, não uma obrigação — descreva e deixe o jogador decidir se investiga.` };
  }
  return { tipo: "tranquilo", titulo: "estrada tranquila", detalhe: "O trecho passa sem sobressaltos — use o clima e a paisagem para dar textura ao mundo (e, se houver, avance fofoca, tensão ou pista sutil da trama)." };
}
