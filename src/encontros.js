/* ============================================================
   VIAGEM: ENCONTROS E CLIMA POR TABELA — Taverna
   A estrada e o céu rolam por CÓDIGO: o que aparece no caminho,
   qual criatura (do bestiário, com a ficha pronta), que achado
   (espólio das tabelas), e como está o tempo. O Mestre só recebe
   o resultado e NARRA — zero tokens decidindo aleatoriedade,
   e a estrada nunca mais é "sempre a mesma".
   ============================================================ */
import { sorteDaCasa, comSorte } from "./semente.js";
import { criaturasDoGenero } from "./bestiario.js";
import { gerarEspolios } from "./combate.js";
import { BIAS_CLIMA } from "./calendario.js";
import { completarInimigo } from "./bestiario.js";
import { quantosPara, pesoDe, avaliarEncontro } from "./orcamento.js";
import { PERIGO_POR_NIVEL } from "./regiao.js";
import { TETO_DO_DESPROPORCIONAL } from "./emboscada.js";

const d100 = () => 1 + Math.floor(sorteDaCasa() * 100);

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
  /* v9.168: quatro céus a mais — o clima é a primeira frase de quase toda
     cena de estrada, e oito frases se esgotam numa campanha. Id novo sem
     viés de estação cai no multiplicador 1, que é o comportamento certo. */
  { id: "garoa", rotulo: "garoa fina", icone: "🌦", peso: 10, nota: "não limpa nem molha — tudo fica pela metade, inclusive o ânimo" },
  { id: "granizo", rotulo: "granizo", icone: "🧊", peso: 2, nota: "pedras de gelo; bicho e gente procuram teto" },
  { id: "abafado", rotulo: "ar abafado", icone: "🌡", peso: 6, nota: "ar parado de véspera de tempestade; pavios curtos" },
  { id: "ceu_estranho", rotulo: "céu de cor errada", icone: "🌌", peso: 2, nota: "o céu tem uma cor que não devia; supersticiosos não saem de casa" },
];

/* v9.222: a conta sazonal desceu do App para cá. Até aqui a tela refazia
   a rolagem por conta própria (BIAS_CLIMA sobre CLIMAS) e este módulo
   rolava sem estação, com Math.random cravado e sem leitor — regra que
   vive na tela não se prova. Agora o peso efetivo é uma função pura
   (pesosDoClima) e a sorte entra por argumento, para a suíte semear.
   Comportamento idêntico ao que o App fazia: multiplicador 0 tira o clima
   do bolso, senão peso = max(1, round(peso × mult)); caiu no clima atual,
   re-rola UMA vez. */
export function pesosDoClima(estacaoId) {
  const bias = (estacaoId != null && BIAS_CLIMA[estacaoId]) || {};
  return CLIMAS.flatMap((clima) => {
    const mult = bias[clima.id] != null ? bias[clima.id] : 1;
    if (mult === 0) return [];
    return [{ clima, peso: Math.max(1, Math.round(clima.peso * mult)) }];
  });
}

export function rolarClima(atualId, opcoes = {}) {
  /* = {} não cobre null explícito — a lei da casa. */
  const { estacao = null, sorte = sorteDaCasa } = opcoes || {};
  const pool = pesosDoClima(estacao).flatMap(({ clima, peso }) => Array(peso).fill(clima));
  if (!pool.length) return null;
  const tira = () => pool[Math.min(pool.length - 1, Math.floor(sorte() * pool.length))];
  let c = tira();
  const distintos = new Set(pool.map((x) => x.id)).size;
  if (atualId && c.id === atualId && distintos > 1) c = tira();
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

/* O ACHADO JÁ NA BOLSA (E3, a fiação). O ◉ do achado entra na bolsa no
   momento em que é rolado, e o envelope da estrada di-lo com esta marca.
   A cobrança (cobranca.js) lê ganhos na narração e credita o que o Narrador
   narrou sem declarar; sem a marca, "você acha 12 moedas na vala" pagaria
   o achado duas vezes. Quem escreve a marca e quem a lê é o mesmo módulo,
   para as duas pontas nunca discordarem. */
const marcaDoAchado = (n) => `◉ ${n} já na bolsa (creditadas pelo sistema)`;
const RX_MARCA_DO_ACHADO = /◉ (\d+) já na bolsa \(creditadas pelo sistema\)/g;

export function moedasDoAchadoNoEnvelope(envelopes) {
  if (typeof envelopes !== "string" || !envelopes) return 0;
  let total = 0;
  for (const m of envelopes.matchAll(RX_MARCA_DO_ACHADO)) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0) total += n;
  }
  return total;
}

/* ============================================================
   A RÉGUA DA ESTRADA (CB1, 09/11/2026) — uma régua só

   A pessoa partiu pelo mapa e, sem uma palavra, abriu-se uma luta contra
   um Dragão Ancião. Duas causas moravam aqui. A tabela da estrada só lia
   o nível do herói, numa janela (nível−4 a nível+2) que sobe com ele: do
   nível 14 para cima, 100% do perigo da estrada era lendário, e do 18
   para cima só o Ancião cabia. E o mapa, com a sua régua
   (`perigoDaEstradaComMotivo`, mapa-vivo.js: o pior das duas pontas, um
   degrau acima no chão duro), dizia «perigo baixo» a uma estrada que,
   rolada, dava um dragão. Duas réguas para a mesma pergunta.

   Agora a pergunta tem uma resposta. O DEGRAU da estrada é o do mapa (que
   lê a região, pelas pontas, e o bioma, pelo chão), e a criatura mede-se
   pela MESMA tabela que dá o perigo ao lugar (`PERIGO_POR_NIVEL`, pelo
   `nivelRef`): baixo até 3, médio até 7, alto até 11, mortal acima.

   · O TETO É DO MAPA. A estrada nunca dá uma criatura de degrau acima do
     que o mapa pinta. Um dragão só sai de uma estrada que o mapa diz alta
     (o Jovem, 10) ou mortal (o Ancião, 16).
   · O NÍVEL É A JANELA. Dentro do teto, a criatura cai na janela do herói
     (−4 a +2). Mas a janela nunca fica abaixo do PISO do degrau: a estrada
     que o mapa diz mortal pode dar o que é mortal também a quem é fraco —
     é por isso que o mapa avisa, e o aviso tem de ser verdade.
   · O LENDÁRIO É RARO, POR DEGRAU (`lendario`). Sem esta parcela, a
     janela do topo volta a ter só lendários (o bestiário é ralo lá em
     cima); com ela, o herói alto encontra o gigante e a quimera, e o
     dragão é o momento que se conta. A decisão de 09/11 (a pauta, «Para a
     pessoa decidir»): a estrada PODE trazê-lo ao herói alto, sempre com
     aviso de longe e a fuga aberta — o aviso e a fuga são de
     `encontro-na-estrada.js`, e a investida nunca (abaixo).
   · O HERÓI QUE PASSOU A ESTRADA (a janela inteira acima do teto) encontra
     o que de mais alto a estrada tem (`topoQuandoForte`): entre duas
     aldeias, um herói de nível 14 encontra lobos atrozes, não um dragão.
   · O QUE NÃO É ENCONTRO NÃO SAI. Uma criatura que sozinha pesa mais que
     `TETO_DO_DESPROPORCIONAL` (emboscada.js, 3×) a um herói sozinho não
     entra na lista: é o freio que a emboscada narrada já tinha, agora na
     estrada também.
   · A REGIÃO PESA. Os bichos que a ficha das pontas diz que andam por lá
     (`estrada.quem`, `quemDoLugar` de regiao.js) valem `pesoDoLocal`
     vezes os outros — dentro do teto, sempre.

   Sem estrada (`estrada` ausente: quem chama sem dizer de onde a onde),
   o degrau é o do topo da janela do herói (`semEstrada: "peloNivel"`), e
   a lista dos níveis 1 a 7 fica a de antes, criatura por criatura (a
   suíte prova a janela, e a corrente da sorte é a mesma).
   ============================================================ */
export const AMEACA_DA_ESTRADA = {
  /* a parcela do perigo que é lendária, por degrau — onde há lendário na
     janela; onde não há, nada se rola (a corrente de antes fica intacta) */
  lendario: { baixo: 0, medio: 0, alto: 0.06, mortal: 0.15 },
  janela: { abaixo: 4, acima: 2 },
  semEstrada: "peloNivel",
  topoQuandoForte: 4,
  pesoDoLocal: 3,
  /* acima disto (razão do encontro sobre a capacidade do grupo), a ameaça
     é «a evitar»: nunca investe, e o sinal dela vê-se sempre */
  aEvitarAcima: 2,
  porque: "o mapa e o encontro respondem à mesma pergunta com a mesma régua: o degrau é o do mapa, a criatura mede-se pela tabela do perigo dos lugares, e o lendário é raro e nunca investe",
};

const PERIGOS_DA_ESTRADA = () => PERIGO_POR_NIVEL.map((p) => p.id);

/* O degrau de uma criatura, pela tabela do perigo dos lugares (o
   `nivelRef` da ficha). `null` para o que não tem nível. */
export function perigoDaCriatura(c) {
  const v = c && typeof c === "object" ? c.nivelRef : c;
  /* Number(null) é 0, e 0 é finito: o nulo trata-se antes (a lei da casa) */
  if (v === null || v === undefined || v === "") return null;
  const nv = Number(v);
  if (!Number.isFinite(nv)) return null;
  return (PERIGO_POR_NIVEL.find((p) => nv <= p.ate) || PERIGO_POR_NIVEL[PERIGO_POR_NIVEL.length - 1]).id;
}

/* A régua de um trecho. `estrada`: { perigo (o degrau do mapa), quem
   (os nomes dos bichos das pontas) } ou nada. Devolve o degrau, o teto e
   o piso de nível dele, a parcela lendária e a janela de nível em que a
   criatura cai. */
export function reguaDaEstrada(estrada, nivel) {
  const T = AMEACA_DA_ESTRADA;
  const nv = Math.max(1, Math.floor(Number(nivel) || 1));
  const e = estrada && typeof estrada === "object" ? estrada : {};
  const ids = PERIGOS_DA_ESTRADA();
  const peloNivel = !ids.includes(e.perigo);
  const perigo = peloNivel ? perigoDaCriatura(nv + T.janela.acima) : e.perigo;
  const i = ids.indexOf(perigo);
  const teto = PERIGO_POR_NIVEL[i].ate;
  const piso = i > 0 ? PERIGO_POR_NIVEL[i - 1].ate + 1 : 1;
  const lo = Math.max(1, nv - T.janela.abaixo);
  const hi = Math.min(teto, Math.max(nv + T.janela.acima, piso));
  const quem = Array.isArray(e.quem) ? e.quem.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim().toLowerCase()) : [];
  return { perigo, teto, piso, lendario: T.lendario[perigo] || 0, janela: { lo, hi }, peloNivel, quem };
}

/* A lista de onde a criatura sai, pela régua; a parcela lendária rola-se
   só quando há lendário E outra coisa na janela. */
function criaturaDaEstrada(banco, regua, nivel) {
  const cabe = (c) => c && Number.isFinite(Number(c.nivelRef)) && c.nivelRef <= regua.janela.hi
    && pesoDe({ ameaca: c.ameaca, nivel: c.nivelRef }, nivel) <= TETO_DO_DESPROPORCIONAL;
  const sob = banco.filter(cabe);
  const naJanela = sob.filter((c) => c.nivelRef >= regua.janela.lo);
  const lendas = naJanela.filter((c) => c.ameaca === "lendario");
  let comuns = naJanela.filter((c) => c.ameaca !== "lendario");
  if (!comuns.length) {
    comuns = sob.filter((c) => c.ameaca !== "lendario").sort((a, b) => b.nivelRef - a.nivelRef).slice(0, AMEACA_DA_ESTRADA.topoQuandoForte);
  }
  let pool = comuns;
  if (lendas.length && comuns.length && regua.lendario > 0) pool = sorteDaCasa() < regua.lendario ? lendas : comuns;
  else if (lendas.length && !comuns.length) pool = lendas;
  if (!pool.length) return null;
  const pesado = regua.quem.length ? pool.flatMap((c) => Array(regua.quem.includes(c.nome.toLowerCase()) ? AMEACA_DA_ESTRADA.pesoDoLocal : 1).fill(c)) : pool;
  return pesado[Math.floor(sorteDaCasa() * pesado.length)];
}

/* `estrada` (CB1): { perigo, quem } — o degrau do mapa e os bichos das
   pontas; sem ele, a régua do nível (acima). */
export function rolarEncontro(genero, nivel, nomeViajante, sorte = null, estrada = null) { return comSorte(sorte, () => {
  const r = d100();
  if (r <= 32) {
    const banco = criaturasDoGenero(genero) || [];
    const regua = reguaDaEstrada(estrada, nivel);
    const c = banco.length ? criaturaDaEstrada(banco, regua, Math.max(1, Math.floor(Number(nivel) || 1))) || banco[Math.floor(sorteDaCasa() * banco.length)] : null;
    if (c) {
      const qtd = c.ameaca === "fraco" ? 2 + Math.floor(sorteDaCasa() * 3) : c.ameaca === "comum" ? 1 + Math.floor(sorteDaCasa() * 2) : 1;
      /* E4 (12/10): o detalhe já não ensina "combate_iniciar". A criatura
         está à vista e não ataca por conta do Narrador: se investe, quem o
         decide é a tabela (`investidaDaEstrada`), e o golpe do jogador
         abre a luta pela agressão. `criatura`/`ameaca`/`quantos` vão em
         dado, para a investida montar o encontro sem reler o texto. */
      return {
        tipo: "perigo",
        titulo: qtd > 1 ? `${c.nome} (×${qtd})` : c.nome,
        criatura: c.nome, ameaca: c.ameaca, quantos: qtd,
        /* CB1: o degrau dela e o da estrada que a deu, para a catraca e o
           encontro em três tempos lerem sem refazer a régua */
        nivelRef: c.nivelRef, perigo: perigoDaCriatura(c), estrada: regua.perigo,
        ...(c.importante ? { importante: true } : {}),
        detalhe: `Criatura do bestiário: ${qtd > 1 ? `${qtd}× ` : ""}${c.nome} — ${c.desc}. Está no caminho, à vista, e não ataca primeiro: dá para evitar, contornar, negociar ou atacar, e quem decide sou eu.`,
      };
    }
  }
  if (r <= 50) {
    return { tipo: "viajante", titulo: nomeViajante || "um desconhecido", detalhe: `${nomeViajante ? `${nomeViajante} aparece como` : "Aparece"} ${VIAJANTES[Math.floor(sorteDaCasa() * VIAJANTES.length)]}.` };
  }
  if (r <= 66) {
    const esp = gerarEspolios([{ ameaca: sorteDaCasa() < 0.3 ? "competente" : "comum" }]);
    const partes = [esp.moedas > 0 ? marcaDoAchado(esp.moedas) : "nenhuma moeda"];
    if (esp.caiItem) partes.push("1 item útil");
    /* E3 do "o Narrador só narra" (12/10): o ◉ rolado vai em número e o App
       credita-o no rolar (`viajar`); o detalhe diz ao Narrador que o dinheiro
       já está na bolsa, e a cobrança lê a mesma marca no envelope para não o
       somar outra vez quando ele o narrar achado (`moedasDoAchadoNoEnvelope`).
       O "via moedas" saiu com esta fiação — era a última porta do canal. */
    return { tipo: "achado", titulo: "algo à beira da estrada", moedas: esp.moedas, detalhe: `Achado rolado pelas tabelas: ${partes.join(" + ")}${esp.caiItem ? ` — o item entra, se couber, por "itens"/"equipamento_novo"` : ""}. Crie o contexto (um esconderijo, um corpo na vala, um altar esquecido) e narre o achado, mas o CONTEÚDO é este; não invente mais nada.` };
  }
  if (r <= 85) {
    return { tipo: "cena", titulo: "sinais no caminho", detalhe: `Na estrada: ${CENAS[Math.floor(sorteDaCasa() * CENAS.length)]}. É um gancho, não uma obrigação — descreva e deixe o jogador decidir se investiga.` };
  }
  return { tipo: "tranquilo", titulo: "estrada tranquila", detalhe: "O trecho passa sem sobressaltos — use o clima e a paisagem para dar textura ao mundo (e, se houver, avance fofoca, tensão ou pista sutil da trama)." };
  });
}

/* ============================================================
   A ESTRADA QUE INVESTE (E4 de "o Narrador só narra", 12/10)

   Até aqui o encontro de perigo dizia ao Narrador "se a coisa engrossar,
   inicie o combate" — e quem engrossava era ele. Na 8.ª sessão (M24) o
   Zumbi da estrada virou luta pelo `perigo` do Narrador, sem o jogador
   ter feito nada; nos outros dois perigos das três sessões (o Capanga da
   6.ª, o Cultista da 8.ª) a criatura ficou à vista e o jogador seguiu.
   Um em três: é a medida, e é a base da tabela.

   Agora quem decide se a criatura vem em cima é esta tabela, no momento
   em que o encontro é rolado. O clima pesa como a própria tabela de
   CLIMAS já o diz (a neblina "favorece emboscadas", o vento esconde a
   aproximação). Se investe, o App abre a luta com estes inimigos e manda
   ao Narrador o envelope da investida; se não, a criatura fica à vista e
   o primeiro gesto é do jogador (o golpe dele abre a luta, lerAgressao).
   A quantidade é a rolada, aparada pelo orçamento do herói da frente
   (o mesmo teto da emboscada: o degrau "mortal").
   ============================================================ */
export const INVESTIDA_DA_ESTRADA = {
  base: 1 / 3,
  porClima: { neblina: 0.2, vento: 0.1, tempestade: 0.1, chuva: 0.05 },
  teto: 0.6,
  faixaTeto: "mortal",
  porque: "nas sessões 6–8, 1 de 3 criaturas da estrada investiu; o resto ficou à vista e o jogador decidiu",
};

/* `enc`: o que `rolarEncontro` devolveu. `opcoes`: { sorte, clima (o id),
   pers (a ficha, para o orçamento) }. Devolve null fora do perigo. */
export function investidaDaEstrada(enc, opcoes) {
  if (!enc || typeof enc !== "object" || enc.tipo !== "perigo" || !enc.criatura) return null;
  const o = opcoes && typeof opcoes === "object" ? opcoes : {};
  const sorte = typeof o.sorte === "function" ? o.sorte : sorteDaCasa;
  const T = INVESTIDA_DA_ESTRADA;
  const extra = (o.clima && T.porClima[o.clima]) || 0;
  const chance = Math.min(T.teto, T.base + extra);
  const investe = sorte() < chance;
  const criatura = String(enc.criatura);
  const ameaca = String(enc.ameaca || "comum");
  const pedidos = Math.max(1, Math.floor(Number(enc.quantos) || 1));
  let quantos = pedidos;
  if (o.pers && typeof o.pers === "object") {
    try {
      const modelo = completarInimigo({ nome: criatura, ameaca }, Number(o.pers.nivel) || 1);
      quantos = Math.max(1, Math.min(pedidos, quantosPara(modelo, o.pers, T.faixaTeto, { max: 12 })));
    } catch { quantos = pedidos; }
  }
  const inimigos = Array.from({ length: quantos }, (_, i) => ({ nome: quantos > 1 ? `${criatura} ${i + 1}` : criatura, ameaca }));
  /* CB1: O QUE NUNCA INVESTE. O lendário e o `importante` (o bestiário: «um
     dragão nunca é um bando… a mesa negocia com ele antes de o enfrentar»)
     anunciam-se ao longe; e o encontro que pesa mais que `aEvitarAcima` a
     capacidade do grupo é «a evitar» — anuncia-se também. A sorte rola-se
     na mesma (a corrente de quem chama não muda de forma), e o veredito é
     que cede. */
  const nivelP = o.pers && typeof o.pers === "object" ? Math.max(1, Number(o.pers.nivel) || 1) : 1;
  let importante = enc.importante === true, razao = null;
  try {
    const fichas = inimigos.map((x) => completarInimigo(x, nivelP));
    importante = importante || fichas.some((f) => f.importante === true);
    if (o.pers && typeof o.pers === "object") { const av = avaliarEncontro(fichas, o.pers); razao = av ? av.razao : null; }
  } catch { razao = null; }
  const aEvitar = razao != null && razao > AMEACA_DA_ESTRADA.aEvitarAcima;
  const nunca = ameaca === "lendario" ? "lendario" : importante ? "importante" : aEvitar ? "aEvitar" : null;
  return { investe: investe && !nunca, criatura, ameaca, quantos, pedidos, inimigos, chance, porque: T.porque, importante, razao, aEvitar, ...(nunca ? { naoInveste: nunca } : {}) };
}

/* O envelope do trecho quando a criatura investe e o App já abriu a luta:
   vai no lugar do `detalhe` do encontro. */
export function envelopeDaInvestida(inv) {
  if (!inv || !inv.investe) return "";
  const quem = inv.quantos > 1 ? `${inv.quantos}× ${inv.criatura}` : inv.criatura;
  return `Criatura do bestiário: ${quem} (${inv.ameaca}) ${inv.quantos > 1 ? "investem" : "investe"} contra mim no caminho, e o painel de combate JÁ ESTÁ ABERTO com as fichas prontas. Narre o instante da investida em uma ou duas frases e me passe a vez; quem acerta e quanto dói é o dado.`;
}
