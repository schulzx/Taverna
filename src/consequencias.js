/* ============================================================
   O PREÇO DE FALHAR (v9.49) — a falha crítica cobra o corpo

   Este módulo nasceu de um bug e de uma decisão.

   O BUG: o sistema lia a narração do Mestre atrás de condições que
   ele tivesse descrito e esquecido de registrar. A ideia parecia
   boa — a ficção virando mecânica — e na prática entregava isto:

     "sente o ar quente do Andar 2 ainda PRESO NA garganta"
     🕸 O Mestre narrou — o sistema aplicou: Agarrado (2t)

   Uma metáfora custava dois turnos de desvantagem. E não havia
   régua que consertasse isso, porque o problema não era o regex: é
   que prosa não é ficha. O mesmo verbo que prende o herói numa teia
   prende o ar na garganta dele, e nenhum detector sabe a diferença.

   A DECISÃO: condição é do SISTEMA, e só dele. Três fontes, e mais
   nenhuma:

     1. COMBATE — o veneno da lâmina, a teia da aranha, o grito que
        amedronta. O sistema rola a aflição e aplica (`aflicoes.js`).
     2. TEMPO — o que vence por turno ou por hora, e o que o
        descanso limpa (`tickCondicoes`, `limparPorDescanso`).
     3. FALHA CRÍTICA NUM TESTE — que é o que este arquivo resolve.

   O Mestre não aplica condição, não remove condição e não pede
   nenhuma das duas. Quando a cena pedir uma, o caminho dele é o
   mesmo de qualquer mesa: pedir a rolagem. O dado decide, e o
   sistema cobra.

   ---------------------------------------------------------------
   A REGRA, em uma frase: só um teste que põe o CORPO em risco pode
   cobrar o corpo.

   Falhar em Percepção é não perceber — não há nada ali para
   quebrar, e inventar um custo seria punir duas vezes a mesma
   coisa. Já quem empurra o portão de pedra e tira 1 no dado
   descobre o próprio limite no ombro. Foi esse o exemplo que
   originou o módulo, e ele é a régua: força e vigor pagam em
   fôlego, destreza paga no chão, a cabeça e a língua não pagam
   nada.
   ============================================================ */

/* `attr` é o atributo do teste; `cond` é o id no catálogo de condições.
   Um atributo ausente desta tabela é um atributo que não cobra nada —
   e essa ausência é a regra, não um esquecimento. */
export const CUSTO_DA_FALHA = [
  {
    attr: "forca", cond: "exausto",
    linha: "você força além do que o corpo dava",
    narrar: "o esforço cobrando o preço — músculo puxado, respiração curta, as mãos que tremem depois",
  },
  {
    attr: "vigor", cond: "exausto",
    linha: "o corpo aguentou até onde dava, e não deu",
    narrar: "o corpo chegando ao fim da corda — suor frio, joelhos moles, o mundo que oscila por um instante",
  },
  {
    attr: "destreza", cond: "caido",
    linha: "o corpo não obedeceu a tempo e o chão veio primeiro",
    narrar: "o pé que escorrega, a mão que não acha apoio e o chão que chega antes",
  },
];

/* `agilidade` aparece em partes antigas do código como sinônimo de
   destreza (o catálogo de condições ainda usa esse nome num `resistir`).
   Casar os dois aqui evita que a mesma queda cobre ou não conforme o
   caminho por onde o teste veio. */
const SINONIMOS = { agilidade: "destreza", constituicao: "vigor", atletismo: "forca" };

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* Recebe o atributo do teste — pelo id ("forca") ou pelo rótulo que a
   tela usa ("Força") — e devolve o que a falha crítica custa, ou null. */
export function custoDaFalhaCritica(atributo) {
  const n = NORM(atributo);
  if (!n) return null;
  const id = SINONIMOS[n] || n;
  return CUSTO_DA_FALHA.find((c) => c.attr === id) || null;
}

/* O texto que o jogador lê. O número já está aplicado quando isto sai. */
export function linhaDoCusto(custo, cond) {
  if (!custo || !cond) return "";
  return `${cond.icone} Falha crítica — ${custo.linha}: ${cond.nome}${cond.turnos ? ` (${cond.turnos}t)` : ""}. ${cond.efeito}`;
}

/* O que o Mestre recebe. Ele narra o corpo; não escolhe o que aconteceu
   com ele, não acrescenta outra condição e não desfaz esta. */
export function notaDoCusto(custo, cond, motivo = "") {
  if (!custo || !cond) return "";
  return `[CONDIÇÃO — APLICADA PELO SISTEMA POR FALHA CRÍTICA] Tirei 1 no dado${motivo ? ` tentando ${motivo}` : ""} e o sistema já cobrou: estou ${cond.nome.toUpperCase()} (${cond.efeito}). Narre ${custo.narrar} — em uma ou duas frases, dentro da cena que já está acontecendo. NÃO invente outra condição, não mude a duração, não a desfaça e não a trate como imagem: é fato mecânico e já está na minha ficha.`;
}

export const CONSEQUENCIAS_PROMPT = `O PREÇO DE FALHAR (v9.49 — o sistema cobra, você narra):
- Numa FALHA CRÍTICA (1 natural) de um teste que põe o corpo em risco — força, vigor, destreza —, o SISTEMA aplica sozinho uma condição e te avisa no envelope. Você narra o corpo; não escolhe a condição, não muda a duração e não a desfaz.
- Testes de percepção, intelecto e presença NÃO cobram o corpo nem no 1 natural: falhar em perceber é não perceber, e nada mais. Não invente ferimento, tropeço ou desmaio para compensar um dado ruim.`;
