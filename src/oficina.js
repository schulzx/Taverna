/* ============================================================
   O TRABALHO DE BASTIDOR (v9.45) — o que não merece uma cena

   O relato: "quando fui fazer um item na bancada o mestre narrou,
   isso não é muito interessante… se a cada item que eu fizer eu
   tiver que parar pro mestre narrar, quebra a mecânica".

   Ele está descrevendo um erro de ritmo, e o erro tem nome. Existem
   dois tipos de coisa que um jogador faz:

   - ATOS NA CENA. Falar, atacar, abrir a porta, oferecer o anel.
     Alguém do outro lado reage, e a reação é o próprio jogo. Esses
     merecem — exigem — um turno do Mestre.

   - TRABALHO DE MÃOS. Ferver duas poções, curtir um couro, arrumar
     a mochila. Ninguém reage a isso porque não há ninguém a quem
     reagir. Pedir narração aqui não é enriquecer: é pôr um pedágio
     entre o jogador e a próxima poção, e cobrar uma chamada de API
     por frasco.

   O segundo tipo passa a ser ACUMULADO. Cada trabalho anota uma
   linha aqui; quando o jogador finalmente AGE, todas viram UM bilhete
   colado à frente do que ele disse — e o bilhete diz, com todas as
   letras, que aquilo é pano de fundo e não abre cena. O Mestre pode
   deixar transparecer numa frase (o cheiro nas mãos, o polegar
   queimado) enquanto narra o que foi de fato pedido.

   POR QUE AGREGAR EM VEZ DE ENFILEIRAR. Cinco poções seguidas viram
   cinco bilhetes quase idênticos — cinco vezes o mesmo texto no
   prompt, e um Mestre que acha que aconteceram cinco cenas. Uma
   linha só, com a contagem, é mais barata e mais verdadeira: o que
   aconteceu foi uma tarde de bancada, não cinco acontecimentos.
   ============================================================ */

export function criarOficina() { return []; }

/* `tipo` é o rótulo do trabalho ("bancada", "forja", "desmonte"…);
   `nome` é o que saiu (ou tentou sair); `ok` diz se deu certo. */
export function anotar(lista, { tipo = "bancada", nome = "", ok = true, minutos = 0 } = {}) {
  const l = Array.isArray(lista) ? lista : [];
  if (!nome) return l;
  return [...l, { tipo, nome: String(nome), ok: !!ok, minutos: Math.max(0, Number(minutos) || 0) }].slice(-30);
}

const plural = (n, um, muitos) => (n === 1 ? um : muitos);

/* Junta iguais: "3 Poção de Cura Pequena" em vez de três linhas. */
function contar(itens) {
  const mapa = new Map();
  for (const i of itens) {
    const k = i.nome;
    mapa.set(k, (mapa.get(k) || 0) + 1);
  }
  return [...mapa.entries()].map(([nome, n]) => (n > 1 ? `${n}× ${nome}` : nome));
}

const ROTULO = {
  bancada: { fez: "trabalhei na bancada", cheiro: "o cheiro do trabalho nas mãos, a marca de fuligem, o cansaço do pulso" },
  forja: { fez: "trabalhei na forja", cheiro: "o calor no rosto, a fuligem, o metal que ainda tine" },
  desmonte: { fez: "desmontei o que não servia mais", cheiro: "as peças espalhadas, o que se salvou e o que virou pó" },
};

/* O bilhete único. Devolve "" quando não houve trabalho nenhum — e é isso
   que faz este arquivo custar zero para quem nunca abre a bolsa. */
export function bilheteDaOficina(lista) {
  const itens = (Array.isArray(lista) ? lista : []).filter((x) => x && x.nome);
  if (!itens.length) return "";
  const porTipo = new Map();
  for (const i of itens) {
    if (!porTipo.has(i.tipo)) porTipo.set(i.tipo, []);
    porTipo.get(i.tipo).push(i);
  }
  const partes = [];
  let minutos = 0;
  for (const [tipo, lst] of porTipo) {
    minutos += lst.reduce((s, x) => s + (x.minutos || 0), 0);
    const r = ROTULO[tipo] || ROTULO.bancada;
    const bons = contar(lst.filter((x) => x.ok));
    const maus = contar(lst.filter((x) => !x.ok));
    const frase = [
      bons.length ? `saíram ${bons.join(", ")}` : "",
      maus.length ? `${plural(maus.length, "perdi o material de", "perdi material em")} ${maus.join(", ")}` : "",
    ].filter(Boolean).join("; ");
    partes.push(`${r.fez}: ${frase || "nada que valha contar"}`);
  }
  const horas = Math.round(minutos / 60);
  const tempo = horas >= 1 ? ` Levou umas ${horas} ${plural(horas, "hora", "horas")}, e o relógio do sistema já andou.` : "";
  return `[TRABALHO DE BASTIDOR — RESOLVIDO PELO SISTEMA] Entre uma cena e outra, ${partes.join(" · ")}. Tudo JÁ está na minha bolsa e o material JÁ foi cobrado — não envie itens, não repita números e não role nada.${tempo} ISTO É PANO DE FUNDO, NÃO É CENA: não abra uma cena por causa disso, não invente oficina, mestre artesão nem plateia, e não me faça parar para ouvir sobre isso. Se couber, deixe transparecer em NO MÁXIMO uma frase — ${(ROTULO[partes.length === 1 ? [...porTipo.keys()][0] : "bancada"] || ROTULO.bancada).cheiro} — enquanto você narra o que eu de fato pedi agora.`;
}

export const OFICINA_PROMPT = `TRABALHO DE BASTIDOR (v9.45):
- Nem tudo que o herói faz merece uma cena. Ferver poções, forjar, desmontar equipamento e arrumar a mochila são TRABALHO DE MÃOS: acontecem entre uma cena e outra, o sistema resolve inteiro e você só recebe o registro depois, colado ao próximo pedido de verdade.
- Quando chegar um envelope [TRABALHO DE BASTIDOR], ele NÃO é o assunto do turno. Narre o que o jogador pediu agora; o trabalho entra, se entrar, como uma frase de textura — o cheiro nas mãos, a queimadura no polegar, a bancada ainda quente. Nunca abra cena, nunca invente um artesão, nunca peça teste e nunca faça o jogador parar para receber o que ele já tem na bolsa.`;
