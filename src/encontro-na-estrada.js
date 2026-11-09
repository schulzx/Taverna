/* ============================================================
   O ENCONTRO NA ESTRADA, EM TRÊS TEMPOS (CB2, 09/11/2026)

   A pessoa: «apertei em viajar para o lugar e instantaneamente abriu uma
   batalha contra um dragão ancião… não teve narração sobre o encontro, não
   teve nada». Entre a partida narrada e o dragão havia 400 ms e zero
   palavras: a estrada rolava o encontro, a investida abria a mesa na
   hora, e a narração ia para a fila da próxima frase, que já era um golpe.

   Numa mesa de verdade o Mestre não faz isso. Diz «uma sombra passa sobre
   a estrada», pede Percepção, conta o que se vê, e pergunta «o que fazes?».
   Só então, se for o caso, a luta. Este módulo é esse roteiro, puro e
   determinístico pela semente:

   1. O SINAL DE LONGE (`oEncontroNaEstrada`, `avistar`). Cada criatura
      anuncia-se por um sinal (`SINAIS_DO_BESTIARIO`: o rasto, o som, o
      cheiro, o vulto, o silêncio, a sombra), com a CD de o ler. O Mestre
      PEDE a Percepção pelo catálogo dos pedidos (`O_MESTRE_PEDE.sinal`,
      motor/o-mestre-pede.js), e o cartão é o de sempre (`oCartaoDoPedido`).
      Passar é ver primeiro; falhar é ser visto primeiro — e só aí a
      criatura pode investir, pela tabela de sempre (`INVESTIDA_DA_ESTRADA`,
      encontros.js). O lendário, o `importante` e o «a evitar» nunca
      investem; o «a evitar» nem pede dado: vê-se sempre.
   2. A ESCOLHA, COM O PREÇO À VISTA (`escolhasDoEncontro`,
      `resolverEscolha`). Contornar, esconder-se, negociar, emboscar, voltar
      atrás, lutar. Cada uma diz antes do toque a perícia, a CD, a chance, o
      que custa (as horas, as moedas) e o que acontece se falhar — o
      veredito antes do clique. Perante um lendário (ou um «a evitar», ou um
      `importante`), voltar atrás é sempre possível e não pede dado.
   3. A NARRAÇÃO ANTES DE A MESA ABRIR (`pautaDoEncontro`). Cada tempo dá a
      linha da secção ACABOU DE e os vetos do NÃO PODE — o canal dinâmico,
      nunca um bloco estático (o teto do prompt é sagrado).

   O desfecho diz se há luta e com que abertura: a `situacao` é uma chave
   de `ABERTURA_DA_LUTA.situacoes` (grid.js), e `iniciativa` diz de que
   lado está a surpresa — a emboscada a favor ou contra.

   O ESTADO é um objeto de dados, sem funções: é o que o App guarda no
   save como campo novo e aditivo (o encontro pendente), e que a versão
   antiga ignora. Toda função devolve um estado novo e nunca toca no que
   recebeu.
   ============================================================ */
import { investidaDaEstrada, perigoDaCriatura, INVESTIDA_DA_ESTRADA } from "./encontros.js";
import { resolucaoAutomatica } from "./pericias.js";
import { O_MESTRE_PEDE, aChaveDoPedido } from "./motor/o-mestre-pede.js";
import { sorteDaCasa } from "./semente.js";

/* ---------------- 1. O SINAL ----------------
   Por nome da ficha (o cenário padrão), e pela ameaça para o que a tabela
   não nomeia (os arquétipos, os bichos de outro mundo). `cd` é a de ler o
   sinal a tempo de ver primeiro: o que é grande vê-se de longe (o gigante,
   a sombra do dragão), o que é pequeno e quieto não. A frase é o FACTO que
   o Narrador veste; nunca diz o nome da criatura. */
export const SINAIS_DO_BESTIARIO = {
  "Slime": { tipo: "rasto", cd: 12, frase: "um rasto húmido e brilhante atravessa a estrada" },
  "Rato Gigante": { tipo: "som", cd: 11, frase: "guinchos e um restolhar na vala" },
  "Lobo": { tipo: "som", cd: 10, frase: "uivos que se respondem dos dois lados da estrada" },
  "Goblin": { tipo: "rasto", cd: 12, frase: "pegadas pequenas e descalças, e um osso roído no chão" },
  "Bandido": { tipo: "silencio", cd: 13, frase: "uma árvore caída de propósito atravessa a estrada mais à frente" },
  "Esqueleto": { tipo: "som", cd: 12, frase: "um estalar seco, como ossos a bater, vindo do mato" },
  "Zumbi": { tipo: "cheiro", cd: 10, frase: "um cheiro doce de carne podre trazido pelo vento" },
  "Lobo Atroz": { tipo: "rasto", cd: 12, frase: "pegadas de patas do tamanho de uma mão aberta, e um uivo grave" },
  "Cultista": { tipo: "vulto", cd: 13, frase: "uma fogueira apagada com símbolos riscados à volta" },
  "Ogro": { tipo: "rasto", cd: 10, frase: "árvores novas partidas à altura de um homem, e pegadas fundas" },
  "Troll": { tipo: "cheiro", cd: 11, frase: "um fedor de pântano e ossos roídos debaixo da ponte" },
  "Elemental Menor": { tipo: "vulto", cd: 11, frase: "a erva queimada em círculos e o ar a tremer" },
  "Golem de Pedra": { tipo: "som", cd: 9, frase: "passos pesados que fazem tremer a água das poças" },
  "Quimera": { tipo: "som", cd: 10, frase: "três rugidos diferentes, vindos do mesmo sítio" },
  "Gigante": { tipo: "vulto", cd: 8, frase: "uma silhueta acima das árvores, ao longe, a mover-se" },
  "Dragão Jovem": { tipo: "sombra", cd: 8, frase: "uma sombra passa sobre a estrada, e o gado do vale dispara" },
  "Lich": { tipo: "silencio", cd: 12, frase: "os pássaros calam-se, e a erva da berma está morta e cinzenta" },
  "Dragão Ancião": { tipo: "sombra", cd: 6, frase: "uma sombra enorme tapa o sol por um instante; do outro lado do vale, o gado dispara" },
};
export const SINAL_POR_AMEACA = {
  fraco: { tipo: "som", cd: 12, frase: "vozes baixas e passos leves mais à frente" },
  comum: { tipo: "rasto", cd: 12, frase: "rastos frescos que saem da estrada e voltam a ela" },
  competente: { tipo: "rasto", cd: 11, frase: "marcas fundas no chão e mato pisado, de algo pesado" },
  elite: { tipo: "som", cd: 10, frase: "um som grave que se repete, cada vez mais perto" },
  lendario: { tipo: "sombra", cd: 8, frase: "a luz muda, o vento cala-se, e os animais fogem todos para o mesmo lado" },
};
/* o que o céu e a hora tiram à vista (CLIMAS, encontros.js: a neblina
   «visão curta», o vento «difícil ouvir aproximação») */
export const PERCEPCAO_DO_SINAL = {
  porClima: { neblina: 4, tempestade: 3, chuva: 2, vento: 2, garoa: 1, granizo: 2 },
  noite: 3,
  porque: "o sinal lê-se pior com visão curta e com a noite; a tabela de CLIMAS já o dizia ao Narrador",
};

/* ---------------- 2. A ESCOLHA ----------------
   A percepção passiva de quem está do outro lado (a CD de se esconder e de
   emboscar), e o tributo de passar por quem fala (o que ela daria de
   espólio, a meio de `MOEDAS_AMEACA` de combate.js, por cabeça). */
export const PERCEPCAO_PASSIVA = { fraco: 10, comum: 11, competente: 12, elite: 13, lendario: 15 };
export const TRIBUTO = { fraco: 4, comum: 8, competente: 14, elite: 28, lendario: 70 };
/* Quem negoceia: quem tem fala e interesse. Fora desta lista, a fera não
   ouve propostas. */
export const QUEM_FALA = [
  "Goblin", "Bandido", "Cultista", "Ogro", "Gigante", "Dragão Jovem", "Lich", "Dragão Ancião",
  "Capanga", "Batedor", "Soldado", "Atirador", "Brutamontes", "Comandante",
];

/* Cada escolha: a perícia (null: sem dado), a CD (por ameaça, ou
   `"passiva"`: a percepção passiva dela, mais `maisCd`), o acréscimo quando
   ELES viram primeiro, o custo, quando existe (`so`), e o desfecho de
   conseguir e de falhar. `semDadoSe`: os estados em que não se rola. */
export const ESCOLHAS_DO_ENCONTRO = {
  ordem: ["evitar", "esconder", "negociar", "emboscar", "fugir", "lutar"],
  escolhas: {
    evitar: { rotulo: "Contornar", pericia: "sobrevivencia", cd: { fraco: 10, comum: 11, competente: 12, elite: 13, lendario: 14 }, seViram: 4, custo: { horas: 2 }, sucesso: "contornou", falha: "descoberto" },
    esconder: { rotulo: "Esconder-se", pericia: "furtividade", cd: "passiva", maisCd: 0, so: "naoViram", custo: { horas: 1 }, sucesso: "passou", falha: "descoberto" },
    negociar: { rotulo: "Negociar", pericia: "persuasao", cd: { fraco: 11, comum: 12, competente: 13, elite: 15, lendario: 17 }, so: "fala", custo: { tributo: true }, sucesso: "pagou", falha: "palavraQuebrada" },
    emboscar: { rotulo: "Emboscar", pericia: "furtividade", cd: "passiva", maisCd: 2, so: "naoViram", custo: {}, sucesso: "emboscadaAFavor", falha: "descoberto" },
    fugir: { rotulo: "Voltar atrás", pericia: "atletismo", cd: { fraco: 10, comum: 11, competente: 12, elite: 13, lendario: 14 }, semDadoSe: ["naoViram", "fugaAberta"], custo: { horas: 4, recuo: true }, sucesso: "fugiu", falha: "alcancado" },
    lutar: { rotulo: "Lutar", pericia: null, custo: {}, sucesso: "frenteAFrente", falha: "frenteAFrente" },
  },
};

/* ---------------- 3. O DESFECHO ----------------
   `situacao`: a chave de `ABERTURA_DA_LUTA.situacoes` (grid.js) — a
   distância a que a luta abre. `iniciativa`: o lado que tem a surpresa
   (`heroi`: a emboscada a favor; `inimigos`: contra; null: ninguém), que
   ganha `bonusDeIniciativa` na primeira ordem. `frase`: o facto que vai à
   pauta. */
export const DESFECHOS_DO_ENCONTRO = {
  desfechos: {
    contornou: { luta: false, frase: "contornei por fora da estrada, sem ser visto" },
    passou: { luta: false, frase: "escondi-me até o caminho ficar livre" },
    pagou: { luta: false, frase: "paguei a passagem, e deixaram-me seguir" },
    fugiu: { luta: false, recuo: true, frase: "voltei para trás antes de ser alcançado" },
    descoberto: { luta: true, situacao: "encontro", iniciativa: "inimigos", frase: "fui visto, e a luta vem direita a mim" },
    palavraQuebrada: { luta: true, situacao: "declarada", iniciativa: null, frase: "a conversa acabou em aço, cara a cara" },
    emboscadaAFavor: { luta: true, situacao: "emboscada", iniciativa: "heroi", frase: "cheguei-me sem ser visto, e o primeiro golpe é meu" },
    emboscadaContra: { luta: true, situacao: "emboscada", iniciativa: "inimigos", frase: "não vi a tempo, e a investida já vem" },
    alcancado: { luta: true, situacao: "emboscada", iniciativa: "inimigos", frase: "fui alcançado na fuga" },
    frenteAFrente: { luta: true, situacao: "encontro", iniciativa: null, frase: "fui ao encontro, de frente" },
  },
  bonusDeIniciativa: 5,
  porque: "a luta da estrada abre pelo que se decidiu antes dela: quem viu primeiro, quem escolheu, quem falhou",
};

/* ---------------- AS PEÇAS ---------------- */
const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
const limpo = (x) => String(x == null ? "" : x).trim();
const AMEACAS = Object.keys(PERCEPCAO_PASSIVA);
const ameacaDe = (a) => (AMEACAS.includes(a) ? a : "comum");
const bonusDe = (bonus, pericia) => (obj(bonus) && Number.isFinite(Number(bonus[pericia])) ? Math.round(Number(bonus[pericia])) : 0);
const d20De = (o) => {
  const n = Math.floor(Number(o && o.d20));
  if (n >= 1 && n <= 20) return n;
  const sorte = o && typeof o.sorte === "function" ? o.sorte : sorteDaCasa;
  return 1 + Math.min(19, Math.floor(sorte() * 20));
};
/* a chance de d20 + bónus ≥ CD, com a regra da casa (`resolucaoAutomatica`,
   pericias.js): o que nem o pior dado falha não se rola, e vice-versa */
function chanceDe(bonus, cd) {
  const auto = resolucaoAutomatica(bonus, cd);
  if (auto === "sucesso") return { chance: 1, automatico: "sucesso" };
  if (auto === "falha") return { chance: 0, automatico: "falha" };
  return { chance: Math.max(0, Math.min(1, (21 + bonus - cd) / 20)), automatico: null };
}
function testar(pericia, bonus, cd, o) {
  const c = chanceDe(bonus, cd);
  if (c.automatico) return { pericia, cd, bonus, d20: null, total: null, passou: c.automatico === "sucesso", automatico: c.automatico };
  const d20 = d20De(o);
  return { pericia, cd, bonus, d20, total: d20 + bonus, passou: d20 + bonus >= cd, automatico: null };
}

/* O encontro do trecho, a partir do que `rolarEncontro` deu (tipo
   `perigo`). `ctx`: { pers, clima (o id), noite, bonus ({ percepcao, … }:
   o bónus de cada perícia, como o App o soma), dia, trecho (de>para) }.
   `null` fora do perigo. */
export function oEncontroNaEstrada(enc, ctx) {
  if (!obj(enc) || enc.tipo !== "perigo" || !limpo(enc.criatura)) return null;
  const c = obj(ctx) ? ctx : {};
  /* o grupo e o peso pela régua de sempre: a investida, com a sorte que
     nunca investe — daqui sai só a lista aparada, a razão e o «nunca» */
  let inv = null;
  try { inv = investidaDaEstrada(enc, { sorte: () => 1, pers: obj(c.pers) ? c.pers : null }); } catch { inv = null; }
  if (!inv) return null;
  const criatura = inv.criatura;
  const ameaca = ameacaDe(inv.ameaca);
  const base = SINAIS_DO_BESTIARIO[criatura] || SINAL_POR_AMEACA[ameaca];
  const P = PERCEPCAO_DO_SINAL;
  const cd = base.cd + ((c.clima && P.porClima[c.clima]) || 0) + (c.noite === true ? P.noite : 0);
  const lendario = ameaca === "lendario";
  const fugaAberta = lendario || inv.importante === true || inv.aEvitar === true;
  const bonusP = bonusDe(c.bonus, "percepcao");
  /* o «a evitar» vê-se sempre (a planta, §3.13); e o que nem o pior dado
     falha não se rola */
  const auto = inv.aEvitar ? "sucesso" : chanceDe(bonusP, cd).automatico === "sucesso" ? "sucesso" : null;
  const chave = aChaveDoPedido(O_MESTRE_PEDE.sinal.id, { onde: limpo(c.trecho), quem: criatura, dia: c.dia });
  const estado = {
    versao: 1,
    fase: auto ? "escolha" : "sinal",
    criatura, ameaca, quantos: inv.quantos,
    inimigos: inv.inimigos.map((x) => ({ ...x })),
    nivelRef: Number.isFinite(Number(enc.nivelRef)) ? Number(enc.nivelRef) : null,
    perigo: enc.perigo || perigoDaCriatura(enc) || null,
    importante: inv.importante === true,
    lendario, aEvitar: inv.aEvitar === true, razao: inv.razao,
    fala: QUEM_FALA.includes(criatura),
    fugaAberta,
    naoInveste: inv.naoInveste || null,
    clima: limpo(c.clima) || null,
    sinal: { tipo: base.tipo, frase: base.frase, cd },
    pedido: auto ? null : {
      id: O_MESTRE_PEDE.sinal.id, chave,
      frase: O_MESTRE_PEDE.sinal.frase(), verbo: O_MESTRE_PEDE.sinal.verbo(),
      v: { tipo: "teste", pericia: "percepcao", dc: cd },
    },
    quemViu: auto ? "heroi" : null,
    percepcao: auto ? { pericia: "percepcao", cd, bonus: bonusP, d20: null, total: null, passou: true, automatico: "sucesso" } : null,
    escolha: null, teste: null, desfecho: null,
  };
  return estado;
}

/* O dado da Percepção. `o`: { d20 (o natural da bandeja) | sorte, bonus }.
   Passou: vê primeiro, e escolhe. Falhou: foi visto primeiro, e a criatura
   pode investir (a tabela da investida; o lendário, o `importante` e o «a
   evitar» nunca). Fora da fase do sinal, o estado volta como veio. */
export function avistar(estado, o) {
  if (!obj(estado) || estado.fase !== "sinal") return estado;
  const op = obj(o) ? o : {};
  const t = testar("percepcao", bonusDe(op.bonus, "percepcao"), Number(estado.sinal && estado.sinal.cd) || 10, op);
  if (t.passou) return { ...estado, fase: "escolha", quemViu: "heroi", percepcao: t, pedido: null };
  const T = INVESTIDA_DA_ESTRADA;
  const chance = Math.min(T.teto, T.base + ((estado.clima && T.porClima[estado.clima]) || 0));
  const sorte = typeof op.sorte === "function" ? op.sorte : sorteDaCasa;
  const investe = !estado.naoInveste && sorte() < chance;
  if (!investe) return { ...estado, fase: "escolha", quemViu: "eles", percepcao: t, pedido: null };
  return { ...estado, fase: "resolvido", quemViu: "eles", percepcao: t, pedido: null, investiu: true, escolha: null, teste: null, desfecho: desfechoDe("emboscadaContra", estado) };
}

function desfechoDe(id, estado, custo = null) {
  const d = DESFECHOS_DO_ENCONTRO.desfechos[id];
  return {
    id, luta: d.luta === true,
    situacao: d.luta ? d.situacao : null,
    iniciativa: d.luta ? d.iniciativa : null,
    ...(d.recuo ? { recuo: true } : {}),
    ...(d.luta && estado.fugaAberta ? { fugaAberta: true } : {}),
    custo: custo ? { ...custo } : { horas: 0, moedas: 0 },
    frase: d.frase,
  };
}

/* O veredito de uma escolha, antes do toque: a perícia, a CD, a chance, o
   custo e o que acontece de cada lado. */
function vereditoDe(id, estado, c) {
  const E = ESCOLHAS_DO_ENCONTRO.escolhas[id];
  const naoViram = estado.quemViu === "heroi";
  const ameaca = ameacaDe(estado.ameaca);
  let disponivel = true, porqueNao = null;
  if (E.so === "naoViram" && !naoViram) { disponivel = false; porqueNao = "já te viu"; }
  if (E.so === "fala" && !estado.fala) { disponivel = false; porqueNao = "não ouve propostas"; }
  const tributo = E.custo.tributo ? TRIBUTO[ameaca] * Math.max(1, Number(estado.quantos) || 1) : 0;
  if (disponivel && tributo && Number.isFinite(Number(c.moedas)) && Number(c.moedas) < tributo) { disponivel = false; porqueNao = "faltam moedas"; }
  const custo = { horas: E.custo.horas || 0, moedas: tributo, ...(E.custo.recuo ? { recuo: true } : {}) };
  const semDado = !E.pericia || (E.semDadoSe || []).some((k) => (k === "naoViram" && naoViram) || (k === "fugaAberta" && estado.fugaAberta));
  let cd = null, bonus = 0, ch = { chance: 1, automatico: "sucesso" };
  if (!semDado) {
    cd = E.cd === "passiva" ? PERCEPCAO_PASSIVA[ameaca] + (E.maisCd || 0) : E.cd[ameaca];
    if (!naoViram && E.seViram) cd += E.seViram;
    bonus = bonusDe(c.bonus, E.pericia);
    ch = chanceDe(bonus, cd);
  }
  return {
    id, rotulo: E.rotulo, disponivel, porqueNao,
    pericia: semDado ? null : E.pericia, cd, bonus,
    chance: Math.round(ch.chance * 100), automatico: semDado ? "sucesso" : ch.automatico,
    custo,
    seConseguir: desfechoDe(E.sucesso, estado, custo),
    seFalhar: semDado ? null : desfechoDe(E.falha, estado, custo),
    ...(id === "lutar" && (estado.aEvitar || estado.lendario) ? { aviso: estado.aEvitar ? "aEvitar" : "lendario" } : {}),
  };
}

/* As escolhas, pela ordem da tabela, cada uma com o veredito. `ctx`:
   { bonus, moedas }. Fora da fase da escolha, nenhuma. */
export function escolhasDoEncontro(estado, ctx) {
  if (!obj(estado) || estado.fase !== "escolha") return [];
  const c = obj(ctx) ? ctx : {};
  return ESCOLHAS_DO_ENCONTRO.ordem.map((id) => vereditoDe(id, estado, c));
}

/* O toque. `o`: { d20 | sorte, bonus, moedas }. Devolve o estado
   resolvido, com o teste e o desfecho; `null` para a escolha que não
   existe ou não está disponível (quem chama fica com o estado que tinha). */
export function resolverEscolha(estado, id, o) {
  if (!obj(estado) || estado.fase !== "escolha" || !Object.prototype.hasOwnProperty.call(ESCOLHAS_DO_ENCONTRO.escolhas, id)) return null;
  const op = obj(o) ? o : {};
  const v = vereditoDe(id, estado, op);
  if (!v.disponivel) return null;
  if (!v.pericia) return { ...estado, fase: "resolvido", escolha: id, teste: null, desfecho: v.seConseguir };
  const t = testar(v.pericia, v.bonus, v.cd, op);
  return { ...estado, fase: "resolvido", escolha: id, teste: t, desfecho: t.passou ? v.seConseguir : v.seFalhar };
}

/* ---------------- A PAUTA ----------------
   O que o Narrador recebe em cada tempo: a linha da secção ACABOU DE e os
   vetos do NÃO PODE (a forma de `crime.js`). Curtas: a pauta tem teto. */
export const PAUTA_DO_ENCONTRO = {
  sinal: { acabou: "na estrada, um sinal: {sinal}. Ainda não se sabe o que é.", naoPode: "dizer o que deixou o sinal, abrir luta ou fazer alguma coisa atacar: o sistema pede o dado e decide" },
  escolha: { acabou: "{quem} na estrada, à frente ({ameaca}); {viu}. A escolha é minha.", naoPode: "abrir luta, fazer {criatura} atacar ou escolher por mim: a escolha é do jogador" },
  luta: { acabou: "{quem}: {frase}. Narre esse instante em uma ou duas frases; a luta abre depois.", naoPode: "resolver golpes, dano ou quem cai: o dado decide na mesa" },
  semLuta: { acabou: "{quem}: {frase}.", naoPode: "fazer {criatura} voltar a aparecer neste trecho" },
  viu: { heroi: "ainda não me viu", eles: "já me viu" },
  ameaca: { aEvitar: "uma ameaça a evitar", lendario: "uma lenda", outra: "à vista" },
};
const encher = (tpl, v) => String(tpl).replace(/\{(\w+)\}/g, (m, k) => (v[k] == null ? m : String(v[k])));

export function pautaDoEncontro(estado) {
  if (!obj(estado) || !estado.fase) return { acabou: [], naoPode: [] };
  const P = PAUTA_DO_ENCONTRO;
  const quem = estado.quantos > 1 ? `${estado.quantos}× ${estado.criatura}` : estado.criatura;
  const v = {
    sinal: estado.sinal ? estado.sinal.frase : "",
    quem, criatura: estado.criatura,
    ameaca: estado.aEvitar ? P.ameaca.aEvitar : estado.lendario ? P.ameaca.lendario : P.ameaca.outra,
    viu: P.viu[estado.quemViu] || P.viu.eles,
    frase: estado.desfecho ? estado.desfecho.frase : "",
  };
  const t = estado.fase === "sinal" ? P.sinal : estado.fase === "escolha" ? P.escolha : estado.desfecho && estado.desfecho.luta ? P.luta : P.semLuta;
  if (estado.fase === "resolvido" && !estado.desfecho) return { acabou: [], naoPode: [] };
  return { acabou: [encher(t.acabou, v)], naoPode: [encher(t.naoPode, v)] };
}
