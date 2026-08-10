/* ============================================================
   TESTES A PEDIDO (v9.6) — o jogador pede, o sistema rola

   Numa mesa de verdade quem pede o teste é o jogador: "posso
   fazer um teste de Percepção para ver se acho alguma coisa
   aqui?", "quero um teste de Intelecto para lembrar da fraqueza
   dessa criatura". O mestre nunca responde de graça — ele pede o
   dado, e o dado decide se houve informação ou silêncio.

   Na Taverna isso não existia: o Mestre só rolava quando ELE
   queria, e quando o jogador perguntava algo ele frequentemente
   entregava a resposta de brinde. Aqui o sistema assume as duas
   pontas: escolhe a dificuldade pelo contexto que conhece
   (combate, masmorra, ameaça em cena) e trava o Mestre no
   resultado — falhou, ele NÃO inventa nada.
   ============================================================ */

import { ATRIBUTOS } from "./constantes.js";
import { PERICIAS, periciaPorId } from "./pericias.js";

/* ---------------- OS TIPOS DE TESTE ----------------
   Cada um amarra um atributo a um verbo. O jogador escolhe pelo verbo,
   que é como ele pensa: "quero perceber", "quero deduzir". */
export const TIPOS_TESTE = [
  { id: "percepcao", atributo: "percepcao", icone: "👁", rotulo: "Perceber", desc: "notar o que a cena esconde: rastros, sons, o detalhe fora do lugar", pergunta: "o que eu percebo aqui?" },
  { id: "intelecto", atributo: "intelecto", icone: "📖", rotulo: "Deduzir", desc: "lembrar, ligar os pontos, saber a fraqueza de uma criatura", pergunta: "o que eu sei ou deduzo sobre isto?" },
  { id: "presenca", atributo: "presenca", icone: "🗣", rotulo: "Convencer", desc: "ler intenção, impor respeito, dobrar uma vontade pela palavra", pergunta: "consigo o que quero na conversa?" },
  { id: "destreza", atributo: "destreza", icone: "🤸", rotulo: "Manobrar", desc: "acrobacia, furtividade, mãos rápidas, escapar de onde não se sai", pergunta: "meu corpo obedece a tempo?" },
  { id: "forca", atributo: "forca", icone: "💪", rotulo: "Forçar", desc: "arrombar, erguer, segurar, quebrar o que não quer ceder", pergunta: "a força bruta resolve?" },
  { id: "vigor", atributo: "vigor", icone: "🫁", rotulo: "Aguentar", desc: "resistir a veneno, frio, exaustão, dor e ao que insiste em te derrubar", pergunta: "meu corpo aguenta?" },
];

export function tipoTestePorId(id) { return TIPOS_TESTE.find((t) => t.id === id) || TIPOS_TESTE[0]; }
export function atributoDoTeste(id) { return tipoTestePorId(id).atributo; }
export function nomeDoAtributo(attrId) { return (ATRIBUTOS.find((a) => a.id === attrId) || {}).nome || attrId; }

/* ---------------- A DIFICULDADE ----------------
   O sistema não pergunta ao Mestre quanto vale o teste: ele calcula pelo
   que já sabe da cena. Perigo aperta o número; calmaria afrouxa. A ideia é
   a mesma do 5e — 10 fácil, 15 médio, 20 difícil — só que derivada, nunca
   inventada, e por isso sempre a mesma para a mesma situação. */
export function dificuldadeDoPedido({ emCombate = false, emMasmorra = false, nivelAmeaca = 0, tipo = "percepcao", nivel = 1 } = {}) {
  let dc = 12;
  const por = [];
  if (emCombate) { dc += 3; por.push("no meio da luta (+3)"); }
  if (emMasmorra) { dc += 1; por.push("terreno hostil (+1)"); }
  if (nivelAmeaca > 0) {
    const a = Math.min(5, Math.round(nivelAmeaca / 4));
    if (a) { dc += a; por.push(`ameaça de nível ${nivelAmeaca} (+${a})`); }
  }
  /* o mundo cresce junto com o herói: um veterano não testa contra portas de
     celeiro. Metade da proficiência, para o avanço não anular o desafio. */
  const escala = Math.floor(Math.max(1, nivel) / 6);
  if (escala) { dc += escala; por.push(`seu patamar (+${escala})`); }
  return { dc, porque: por.join(", ") || "situação comum" };
}

/* ---------------- DETECÇÃO NO TEXTO ----------------
   O jeito de mesa: o jogador simplesmente escreve "peço um teste de
   percepção". Não faz sentido obrigá-lo a caçar um botão. */
const VERBO_PEDIDO = /(pe[çc]o|pedir|posso fazer|fa[çc]o|quero|rolar|rolo|tentar|testar)\s+(um\s+|uma\s+)?(teste|rolagem|check|chegada)?/i;
const MAPA_PALAVRA = [
  { id: "percepcao", rx: /(percep[çc][ãa]o|perceber|notar|observ|reparar|investiga|procur|vasculh|sentido|intui)/i },
  { id: "intelecto", rx: /(intelect|intelig|conhecimento|saber|lembrar|dedu[zç]|arcano|hist[óo]ria|analis|estud|identific)/i },
  { id: "presenca", rx: /(presen[çc]a|carisma|persuas|convenc|intimid|enganar|blefe|lideran|diploma)/i },
  { id: "destreza", rx: /(destreza|agilidade|acrobac|furtiv|esgueir|prestidigit|reflex|equil[íi]br)/i },
  { id: "forca", rx: /(for[çc]a|atletismo|arromb|erguer|levantar|empurrar|quebrar|segurar)/i },
  { id: "vigor", rx: /(vigor|constitui|fortitude|resist[êe]nc|aguent|f[ôo]lego|toler)/i },
];

/* PERÍCIA PEDIDA PELO NOME (v9.15) — "peço um teste de Furtividade".
   Vem ANTES do mapa por atributo: quem diz o nome da perícia quer aquela
   perícia, não o atributo genérico dela. */
const APELIDOS_PERICIA = {
  atletismo: /(atletismo|escalar|nadar|saltar)/i,
  intimidacao: /(intimida|amea[çc]ar|meter medo)/i,
  arrombamento: /(arromb|for[çc]ar a porta|quebrar a fechadura)/i,
  furtividade: /(furtiv|esgueir|sorrateir|sem ser vist|na surdina)/i,
  acrobacia: /(acrobac|equil[íi]br|piruet|amortecer a queda)/i,
  prestidigitacao: /(prestidigit|m[ãa]os leves|bater carteira|gazua|punga)/i,
  fortitude: /(fortitude|aguentar|resistir ao veneno|constitui)/i,
  sobrevivencia: /(sobreviv|rastrear|rastreio|ca[çc]ar|achar [áa]gua|orientar)/i,
  montaria: /(montaria|cavalgar|conduzir a carro[çc]a|pilotar)/i,
  arcanismo: /(arcanismo|arcano|magia antiga|reconhecer o feiti)/i,
  saberes: /(saberes|hist[óo]ria|lore|religi[ãa]o|natureza|linhagem|heráldic)/i,
  investigacao: /(investiga|vestígio|pistas|deduzir do|examinar a cena)/i,
  persuasao: /(persuas|convencer|negociar|diploma)/i,
  enganacao: /(engana|mentir|blefe|blefar|disfar[çc])/i,
  atuacao: /(atua[çc]|cantar|tocar|apresenta[çc][ãa]o|encenar)/i,
  percepcao: /(percep[çc][ãa]o|perceber|notar|reparar|observar)/i,
  intuicao: /(intui[çc]|ler (a )?(gente|pessoa)|sentir se mente|discernir)/i,
  medicina: /(medicina|estancar|estabilizar|diagnostic|curar o ferimento)/i,
};

export function detectarPericiaPedida(texto) {
  const t = String(texto || "");
  for (const p of PERICIAS) {
    const rx = APELIDOS_PERICIA[p.id];
    if (rx && rx.test(t)) return p.id;
  }
  return null;
}

/* Devolve { tipo, pericia, motivo } quando a frase é mesmo um pedido de teste. */
export function detectarPedidoDeTeste(texto) {
  const t = String(texto || "");
  if (!t.trim()) return null;
  if (!/(teste|rolagem|rolar|checagem)/i.test(t)) return null;
  if (!VERBO_PEDIDO.test(t)) return null;
  /* o motivo é o que vem depois de "para" / "pra" / "de ver se" */
  const mm = t.match(/\b(para|pra|a fim de|de ver se|ver se|se)\s+(.{4,140})/i);
  const motivo = mm ? mm[2].replace(/[.!?]+$/, "").trim() : "";
  const per = detectarPericiaPedida(t);
  if (per) return { tipo: periciaPorId(per).atributo, pericia: per, motivo };
  for (const m of MAPA_PALAVRA) if (m.rx.test(t)) return { tipo: m.id, pericia: null, motivo };
  return null;
}

/* ---------------- OS ENVELOPES ----------------
   O ponto inteiro do pedido: no fracasso o Mestre não pode ser generoso.
   "Se eu não passar no teste o mestre não inventa nada" — é regra, não estilo. */
export function envelopeDoTeste({ tipo, pericia, motivo, valor, mod, total, dc, resultado, critico, desastre, automatico, nivelTreino }) {
  const t = tipoTestePorId(tipo);
  const per = pericia ? periciaPorId(pericia) : null;
  const attr = nomeDoAtributo(t.atributo);
  const rotulo = per ? `${per.nome} (${attr})` : `${attr} (${t.rotulo.toLowerCase()})`;
  const selo = nivelTreino === "especialista" ? " Sou ESPECIALISTA nisso."
    : nivelTreino === "treinada" ? " Sou treinado nisso."
    : per ? " NÃO tenho treino nisso." : "";
  /* SEM DADO (v9.15): o bônus já batia a dificuldade com folga. O envelope
     precisa dizer isso com todas as letras, senão o Mestre narra tensão
     onde não havia — e a regra existe justamente para acabar com a tensão
     falsa em coisa que está abaixo do herói. */
  const cabeca = automatico
    ? `[TESTE PEDIDO POR MIM — RESOLVIDO PELO SISTEMA SEM DADO] Pedi um teste de ${rotulo}${motivo ? ` para ${motivo}` : ""}. O sistema fixou a dificuldade em ${dc} e NÃO rolou: meu bônus é ${mod}, alto demais para que o acaso importe.${selo} Resultado: ${resultado.toUpperCase()} AUTOMÁTICO — isto está ${resultado === "sucesso" ? "abaixo do meu patamar" : "muito acima do meu patamar"}.`
    : `[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA] Pedi um teste de ${rotulo}${motivo ? ` para ${motivo}` : ""}.${selo} O sistema fixou a dificuldade em ${dc} e rolou: d20 ${valor}${mod ? ` ${mod >= 0 ? "+" : "−"} ${Math.abs(mod)}` : ""} = ${total}. Resultado: ${resultado.toUpperCase()}.`;
  const passou = resultado === "sucesso" || critico;
  if (!passou) {
    return `${cabeca}
REGRA DESTE ENVELOPE (obrigatória): eu FALHEI. Você NÃO revela nada, NÃO entrega meia-informação, NÃO oferece uma pista "de consolo" e NÃO deixa a resposta escapar numa descrição. Narre em duas ou três frases apenas o meu esforço e o silêncio dele — ${desastre ? "e, como foi falha crítica, acrescente um pequeno custo: perdi tempo, chamei atenção ou tirei a conclusão errada" : "sem custo extra, só a ausência de resultado"}. Depois devolva a palavra para mim. Não inicie cena nova, não faça o tempo passar, não mude de lugar.`;
  }
  return `${cabeca}
REGRA DESTE ENVELOPE (obrigatória): eu PASSEI. Revele UMA coisa concreta e útil sobre ${motivo || t.pergunta} — algo que já existia na cena ou no mundo, nunca uma novidade conveniente inventada agora, e nunca um item ou aliado de brinde. ${critico ? "Foi crítico: pode ser algo especialmente valioso ou específico." : "Uma coisa só, do tamanho de um teste bem-sucedido."} Se estivermos em combate, uma fraqueza real do inimigo serve. Diga em até três frases e devolva a palavra para mim, sem iniciar cena nova, sem viagem e sem fazer o tempo passar.`;
}

export const TESTES_PROMPT = `TESTES PEDIDOS PELO JOGADOR (v9.6 — como numa mesa de verdade):
- O jogador pode PEDIR um teste a qualquer momento ("peço um teste de Percepção para ver se acho algo aqui"). Quando isso acontece, o SISTEMA fixa a dificuldade e rola — você não escolhe o número, não rola, não antecipa o resultado e não responde a pergunta antes do dado.
- O resultado chega num envelope "[TESTE PEDIDO POR MIM — ROLADO PELO SISTEMA]" com uma regra explícita. Cumpra-a ao pé da letra: em caso de FALHA você não revela nada, nem por descrição, nem por insinuação, nem "só um pedacinho". Silêncio é uma resposta legítima e é a resposta certa.
- Em caso de SUCESSO, revele UMA coisa concreta que já existia — nunca invente um item, um aliado ou uma saída conveniente porque o dado foi bom.
- Se o jogador perguntar algo que exigiria um teste e não pedir um, você pode dizer que aquilo pede um teste — mas NUNCA role por conta própria nem entregue a informação de graça.
- O envelope pode chegar RESOLVIDO SEM DADO. Quando chegar, não invente tensão: aquilo estava abaixo (ou muito acima) do herói e o acaso não tinha o que decidir. Narre a competência com naturalidade — "você faz isso desde sempre" —, nunca como sorte.`;
