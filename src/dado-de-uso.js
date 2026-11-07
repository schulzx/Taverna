/* ============================================================
   O DADO DE USO — os mantimentos na mesa (07/11/2026)

   A proposta da AR7 (mente/ar7-prova.md, «a proposta ambiciosa»), que a
   pessoa aprovou hoje: as rações, a água e as tochas saem da linha de
   texto e ficam na mesa como dados — d10, d8, d6, d4 —, e o dado rola à
   vista ao fim do dia e quando uma tocha nova se acende. A ordem de 04/11
   já pedira «um dado a cada dois ou três turnos fora da luta», e o jogador
   passa a ver a comida acabar sem abrir nada.

   A CONTAGEM CONTINUA A SER A VERDADE. `suprimentos.racoes/agua/tochas`
   ficam inteiros e o save não muda de formato. O dado é a VISTA e o RISCO
   da contagem: a face sai dela, por tabela (DADO_DE_USO.degraus), e num 1
   o dado «encolhe» — perde-se uma unidade a mais (ração com bicho, odre
   furado, tocha úmida). Nenhum campo novo; nada que um commit revertido
   não desfaça.

   A ORDEM DA NOITE, e o porquê dela. A face é a de ANTES de comer (é o
   dado que o jogador viu pousado o dia inteiro); a perda cai DEPOIS de
   comer, no que sobrou. Medido (a catraca da suíte): com a perda antes da
   refeição, 10/10 a uma boca perdia 18% dos dias de comida, e o teto que
   a casa aceitou para este risco é 15%. Com a perda depois, e um degrau d10
   no topo (seis dias ou mais), o pior caso do padrão 10/10 fica em 14,5%
   (duas bocas). O d10 também dá à mochila cheia uma cara diferente da
   mochila a meio — o jogador vê o dado encolher antes de ver a fome.

   ESTE MÓDULO ROLA, e só pela semente: o gerador entra por argumento
   (`rng`, por omissão `sorteDaCasa`, como em ermos.js). Os lançamentos
   saem pelo construtor da bandeja (`lancamentoDoDadoDeUso`, papel "uso").
   ============================================================ */
import { sorteDaCasa, sorteDe } from "./semente.js";
import { garantirSuprimentos, comerODia } from "./ermos.js";
import { lancamentoDoDadoDeUso } from "./motor/a-bandeja.js";

export const DADO_DE_USO = Object.freeze({
  /* como cada mantimento se conta: rações e água em DIAS que restam
     (contagem ÷ bocas, arredondado para baixo); tochas em UNIDADES */
  tipos: Object.freeze({
    racoes: Object.freeze({ conta: "dias", icone: "🥖" }),
    agua: Object.freeze({ conta: "dias", icone: "💧" }),
    tochas: Object.freeze({ conta: "unidades", icone: "🕯" }),
  }),
  /* a face pelo que resta: o primeiro degrau cujo `desde` a conta alcança.
     Abaixo do último (zero), não há dado. */
  degraus: Object.freeze({
    dias: Object.freeze([
      Object.freeze({ desde: 6, faces: 10 }),
      Object.freeze({ desde: 4, faces: 8 }),
      Object.freeze({ desde: 2, faces: 6 }),
      Object.freeze({ desde: 1, faces: 4 }),
    ]),
    unidades: Object.freeze([
      Object.freeze({ desde: 5, faces: 8 }),
      Object.freeze({ desde: 3, faces: 6 }),
      Object.freeze({ desde: 1, faces: 4 }),
    ]),
  }),
  /* o valor que encolhe o dado (este e os de baixo), e quanto se perde */
  encolheEm: 1,
  perde: 1,
  /* o que o lançamento diz na bandeja */
  rotulos: Object.freeze({ dia: "Os mantimentos", tocha: "A tocha nova" }),
  /* a linha quando o dado encolhe — três por tipo, escolhida pela semente */
  falas: Object.freeze({
    racoes: Object.freeze([
      "🥖 Bicho na ração: uma porção vai fora.",
      "🥖 A umidade pegou numa ração — embolorou, e não se come.",
      "🥖 Um rato chegou à mochila antes de vocês: uma ração a menos.",
    ]),
    agua: Object.freeze([
      "💧 Um odre furou durante a noite: uma água a menos.",
      "💧 A rolha cedeu, e um odre amanheceu vazio.",
      "💧 A água de um odre turvou — não dá para beber.",
    ]),
    tochas: Object.freeze([
      "🕯 A tocha nova estava úmida e não pega: uma vai fora.",
      "🕯 O breu de uma tocha esfarela na mão — uma a menos.",
      "🕯 Uma tocha racha ao acender e se apaga no chão.",
    ]),
  }),
  /* quando a perda leva a última tocha */
  ultimaTocha: "🕯 Era a última — daqui em diante é no escuro.",
  /* A MEDIDA DE EQUILÍBRIO, lida pela suíte: com o padrão de compra
     (10 rações, 10 águas; 10 tochas), de 1 a 4 bocas, a perda esperada
     de dias (ou de passagens com luz) não passa do teto. */
  medida: Object.freeze({ padrao: 10, bocas: Object.freeze([1, 2, 3, 4]), teto: 0.15 }),
});

const contagem = (v) => Math.max(0, Math.floor(Number(v) || 0));
const asBocas = (b) => Math.max(1, Math.floor(Number(b) || 0) || 1);

/* Um dado da semente: 1..faces. Um gerador que devolva lixo (NaN, 1, −3)
   não pode pôr na mesa um dado fora da face. */
function rolar(faces, rng) {
  const x = Number(rng());
  const u = Number.isFinite(x) ? Math.min(Math.max(x, 0), 0.999999) : 0;
  return 1 + Math.floor(u * faces);
}
function falaDe(tipo, rng) {
  const lista = DADO_DE_USO.falas[tipo] || [];
  return lista.length ? lista[rolar(lista.length, rng) - 1] : "";
}

/* A face do dado de um mantimento: 10, 8, 6, 4, ou null (não há dado).
   `suprimentos` é o objeto da ficha (lixo e null contam como zero);
   `bocas` só pesa nas rações e na água. */
export function faceDoDadoDeUso(tipo, suprimentos, bocas = 1) {
  const t = DADO_DE_USO.tipos[tipo];
  if (!t) return null;
  const s = suprimentos && typeof suprimentos === "object" ? suprimentos : {};
  const n = contagem(s[tipo]);
  const conta = t.conta === "dias" ? Math.floor(n / asBocas(bocas)) : n;
  const degrau = DADO_DE_USO.degraus[t.conta].find((d) => conta >= d.desde);
  return degrau ? degrau.faces : null;
}

/* O FIM DO DIA, inteiro: come (comerODia, a mesma conta de sempre) e rola
   os dados das rações e da água com a face de antes da refeição. Num
   `encolheEm`, perde-se `perde` do que sobrou — nunca abaixo de zero, e só
   rola o dado de quem ainda tem o que estragar (um 1 que não leva nada
   seria um dado a mentir na mesa).

     oFimDoDia(pers, bocas, rng?) → { pers, lancamentos, msgs, consumo }

   `msgs` são as de comerODia seguidas das do dado; `lancamentos` vai à
   bandeja (0 ou 1, com um ou dois dados). Pura: a ficha recebida fica. */
export function oFimDoDia(pers, bocas, rng = sorteDaCasa) {
  const sorte = sorteDe(rng);
  const b = asBocas(bocas);
  const antes = garantirSuprimentos(pers && typeof pers === "object" ? pers.suprimentos : null);
  const comeu = comerODia(pers, b);
  const depois = garantirSuprimentos(comeu.pers.suprimentos);
  const rolagens = [], msgs = [...comeu.msgs], novo = { ...depois };
  for (const tipo of ["racoes", "agua"]) {
    const faces = faceDoDadoDeUso(tipo, antes, b);
    if (!faces || depois[tipo] <= 0) continue;
    const valor = rolar(faces, sorte);
    rolagens.push({ faces, valor, uso: tipo });
    if (valor <= DADO_DE_USO.encolheEm) {
      novo[tipo] = Math.max(0, depois[tipo] - DADO_DE_USO.perde);
      msgs.push(falaDe(tipo, sorte));
    }
  }
  const mudou = novo.racoes !== depois.racoes || novo.agua !== depois.agua;
  const l = lancamentoDoDadoDeUso(DADO_DE_USO.rotulos.dia, rolagens, DADO_DE_USO.encolheEm + 1);
  return {
    pers: mudou ? { ...comeu.pers, suprimentos: novo } : comeu.pers,
    lancamentos: l ? [l] : [],
    msgs,
    consumo: comeu.consumo,
  };
}

/* A TOCHA QUE SE ACENDE, na masmorra: cada passagem queima a da mão
   (`entrarNaSala`, masmorras.js) e, se ainda houver, acende-se a seguinte —
   é aí que o dado rola, com a face de antes do passo. Num `encolheEm` a
   tocha nova não pega e perde-se mais uma.

     aTochaQueSeAcende(antes, depois, rng?) → { tochas, lancamento, msgs }

   `antes` e `depois` são as contagens de `mm.tochas` à volta do passo;
   `tochas` é a contagem que fica. Sem tocha a acender, não rola. */
export function aTochaQueSeAcende(antes, depois, rng = sorteDaCasa) {
  const sorte = sorteDe(rng);
  const a = contagem(antes), d = contagem(depois);
  const faces = faceDoDadoDeUso("tochas", { tochas: a });
  if (!faces || d <= 0) return { tochas: d, lancamento: null, msgs: [] };
  const valor = rolar(faces, sorte);
  const encolheu = valor <= DADO_DE_USO.encolheEm;
  const tochas = encolheu ? Math.max(0, d - DADO_DE_USO.perde) : d;
  const msgs = encolheu ? [falaDe("tochas", sorte), ...(tochas === 0 ? [DADO_DE_USO.ultimaTocha] : [])] : [];
  const lancamento = lancamentoDoDadoDeUso(DADO_DE_USO.rotulos.tocha, [{ faces, valor, uso: "tochas" }], DADO_DE_USO.encolheEm + 1);
  return { tochas, lancamento, msgs };
}
