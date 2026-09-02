/* ============================================================
   AS SESSÕES (v9.149) — o jogo deixa de ser um rolo infinito — Taverna

   Uma campanha de mesa tem sessões: a gente senta, joga umas horas,
   para num lugar bom e volta na semana seguinte com um "anteriormente".
   Aqui não havia nada disso. O jogo era um fio contínuo, e quem voltasse
   depois de dez dias caía no meio de uma cena sem saber o que estava
   fazendo ali.

   Existia meio caminho: um botão "Continuar com resumo" que mandava o
   histórico bruto ao Narrador e pedia 120 palavras em tom de série. Duas
   coisas erradas nele, e a segunda é a grave:

   1) ERA MANUAL. O jogador tinha de escolher — e quem esteve fora dez
      dias é exatamente quem não sabe que precisa.

   2) ERA A IA QUE LEMBRAVA. O resumo saía de uma leitura do histórico,
      então ele podia contradizer o cânone, inventar ênfase e custava uma
      chamada de rede. Um recap que erra o que aconteceu é pior do que
      recap nenhum: ele reescreve a memória do jogador.

   ---------------- O QUE MUDA ----------------

   O recap passa a ser FATO, escrito por código a partir do REGISTRO — o
   mesmo lugar de onde o Arquivista já tira o que o Narrador lembra. As
   linhas têm peso (3 é a marca, 2 é a virada), e é exatamente isso que
   um "anteriormente" precisa: o que pesou, e nada mais.

   Não custa chamada, não pode contradizer o cânone porque É o cânone, e
   responde as três perguntas de quem volta: onde eu parei, o que
   aconteceu de importante, e o que ficou pendente.

   ---------------- O QUE ESTE MÓDULO NÃO FAZ ----------------

   Não decide quando mostrar (o App sabe as horas), não escreve na tela e
   não fala com o Narrador. Recebe dados rasos e devolve linhas.
   ============================================================ */

/* ---------------- QUANDO É OUTRA SESSÃO ----------------
   Cinco horas. Não é um número mágico: é o menor intervalo que separa
   "levantei para almoçar" de "voltei outro dia". Abaixo disso, um recap
   seria o jogo explicando ao jogador uma cena que ele acabou de ler —
   o que ensina a pular o recap, e aí ele não serve nem quando importa. */
export const HORAS_DE_INTERVALO = 5;

const HORA = 3600 * 1000;

export function houveIntervalo(salvoEm, agora = Date.now()) {
  const t = Number(salvoEm) || 0;
  /* save sem carimbo é save antigo: não dá para afirmar que houve
     intervalo, e afirmar sem saber seria mostrar um recap a quem nunca
     saiu. O silêncio é a resposta honesta. */
  if (!t || t > agora) return { sim: false, horas: 0, quando: "" };
  const horas = (agora - t) / HORA;
  return { sim: horas >= HORAS_DE_INTERVALO, horas, quando: quandoFoi(horas) };
}

function quandoFoi(horas) {
  if (horas < 24) return `há ${Math.round(horas)} horas`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  if (dias < 14) return "há uma semana";
  if (dias < 60) return `há ${Math.round(dias / 7)} semanas`;
  return `há ${Math.round(dias / 30)} meses`;
}

/* ---------------- O ANTERIORMENTE ----------------
   Três blocos, e a ordem é a de quem volta: primeiro me situo, depois
   lembro, depois vejo o que devo.

   `desdeODia` corta o que já foi recapitulado antes: sem ele, a segunda
   sessão repetiria a primeira e a décima seria ilegível. Zero (ou
   ausente) significa "conte a campanha inteira", que é o caso da
   primeira volta. */
export const LINHAS_DO_RECAP = 5;

/* O parâmetro é lido do objeto, e não desestruturado na assinatura, por
   um motivo que a suíte encontrou: `= {}` cobre `undefined` e NÃO cobre
   `null`. Quem chama isto passa o estado do jogo, e estado de jogo é
   exatamente o tipo de coisa que chega nula no dia em que um save vem
   pela metade — e aí a função que existe para reconfortar quem voltou
   derruba a tela dele. */
export function recapitular(dados) {
  const d = dados && typeof dados === "object" ? dados : {};
  const registro = d.registro, dia = Number(d.dia) || 0, lugar = d.lugar || "";
  const grupo = d.grupo, missoes = d.missoes, relogios = d.relogios;
  const nomeCampanha = d.nomeCampanha || "", desdeODia = Number(d.desdeODia) || 0, quando = d.quando || "";
  const linhas = [];

  /* 1. ONDE EU PAREI. A pergunta que vem antes de todas as outras, e a
     única que o jogador não consegue responder olhando a tela — a última
     narrativa fala do que aconteceu, não de onde ele está. */
  const onde = [];
  if (lugar) onde.push(`em ${lugar}`);
  if (dia > 0) onde.push(`no dia ${dia}`);
  const companhia = (Array.isArray(grupo) ? grupo : []).map((c) => (typeof c === "string" ? c : (c && c.nome) || "")).filter(Boolean);
  if (companhia.length) onde.push(`com ${companhia.join(", ")}`);
  /* "parou" já está no título; repeti-lo aqui é a mesma palavra duas
     vezes em duas linhas seguidas. */
  if (onde.length) linhas.push(`Estava ${onde.join(", ")}.`);

  /* 2. O QUE PESOU. Peso 2 e 3 só: a virada e a marca. Um recap não
     precisa saber que o herói foi ao mercado na terça — e se souber,
     enterra o que importa no meio do que não importa. */
  const marcas = (Array.isArray(registro) ? registro : [])
    .filter((l) => l && Number(l.peso) >= 2 && Number(l.dia) >= (Number(desdeODia) || 0))
    .sort((a, b) => (Number(a.t) || 0) - (Number(b.t) || 0))
    .slice(-LINHAS_DO_RECAP);
  for (const l of marcas) {
    const quem = Array.isArray(l.quem) && l.quem.length ? ` (${l.quem.join(", ")})` : "";
    const ondeL = l.onde ? ` — ${l.onde}` : "";
    linhas.push(`Dia ${l.dia}${ondeL}${quem}: ${l.oQue}`);
  }

  /* 3. O QUE FICOU DEVENDO. Missão aberta e relógio andando são as duas
     coisas que continuam correndo enquanto o jogador não está — e as
     duas que ele mais esquece. */
  const abertas = (Array.isArray(missoes) ? missoes : [])
    .filter((m) => m && (m.status === "aberta" || m.status === "ativa" || !m.status))
    .slice(0, 3)
    .map((m) => m.titulo)
    .filter(Boolean);
  if (abertas.length) linhas.push(`Em aberto: ${abertas.join(" · ")}.`);

  const correndo = (Array.isArray(relogios) ? relogios : [])
    .filter((r) => r && Number(r.cheios) > 0 && Number(r.cheios) < Number(r.segmentos))
    .slice(0, 2)
    .map((r) => `${r.nome} (${r.cheios}/${r.segmentos})`);
  if (correndo.length) linhas.push(`Andando contra você: ${correndo.join(" · ")}.`);

  return {
    titulo: `Anteriormente, em ${nomeCampanha || "sua campanha"}${quando ? ` — você parou ${quando}` : ""}`,
    linhas,
    /* VAZIO É VAZIO, e o App precisa saber: um recap com só a linha do
       lugar não vale a interrupção. Melhor não mostrar nada do que
       mostrar um "anteriormente" que não conta nada. */
    vale: marcas.length > 0 || abertas.length > 0 || correndo.length > 0,
  };
}

export function textoDoRecap(r) {
  if (!r || !r.vale) return "";
  return `📖 ${r.titulo}\n` + r.linhas.map((l) => `   ${l}`).join("\n");
}

/* O envelope é curto de propósito. O recap JÁ foi mostrado ao jogador
   por código; o Narrador não precisa repeti-lo, precisa saber que o
   jogador acabou de relê-lo para não reapresentar tudo de novo. */
export function envelopeDaRetomada(r, quando) {
  if (!r || !r.vale) return "";
  return `[RETOMADA — RECAPITULADA PELO SISTEMA] Eu voltei ${quando || "depois de um tempo"} e o sistema já me mostrou o resumo do que aconteceu: ${r.linhas.join(" ")}
REGRA DESTE ENVELOPE (obrigatória): NÃO recapitule — eu acabei de ler. Reabra a cena onde eu parei em duas ou três frases, como quem retoma a câmera, e devolva a palavra para mim. Não faça o tempo passar, não mude de lugar e não inicie cena nova.`;
}

/* ============================================================
   O FIM DA SESSÃO — o lugar bom de parar

   Numa mesa, ninguém para no meio de um corredor: para depois do chefe,
   quando alguém diz "é, hoje foi boa". O sistema sabe quando isso
   aconteceu — ele mesmo acabou de resolver o chefe, virar o capítulo ou
   fechar a missão.

   O QUE ISTO NÃO É: um pedido para o jogador ir embora. É uma linha que
   nomeia o momento, uma vez, e some. Quem quiser continuar continua — e
   é por isso que ela não tem botão.
   ============================================================ */
export const MOMENTOS = {
  chefe: { peso: 3, diz: "o chefe caiu" },
  capitulo: { peso: 3, diz: "o capítulo virou" },
  missao: { peso: 2, diz: "a missão fechou" },
  raid: { peso: 3, diz: "a raide acabou" },
  nemesis: { peso: 3, diz: "o nêmesis caiu" },
};

/* Um clímax por sessão. O segundo "que bom lugar para parar" na mesma
   noite não é um convite, é um tique — e ensina a ignorar o primeiro. */
export function ehHoraDeParar(momento, { jaSugeriu = false, turnosNaSessao = 0 } = {}) {
  const m = MOMENTOS[String(momento || "")];
  if (!m || jaSugeriu) return null;
  /* quem acabou de sentar não quer ouvir que é hora de levantar */
  if (turnosNaSessao < 8) return null;
  return { momento: String(momento), peso: m.peso, diz: m.diz };
}

export function falaDoFim(fim, { dia = 0 } = {}) {
  if (!fim) return "";
  return `🌙 ${fim.diz.charAt(0).toUpperCase()}${fim.diz.slice(1)}${dia > 0 ? `, e o dia ${dia} se fecha` : ""}. É um bom lugar para parar — quando voltar, você retoma daqui.`;
}
