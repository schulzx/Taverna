/* ============================================================
   O PODER DE CLASSE (v9.265) — a porta que faltava

   O ACHADO QUE ORIGINOU ESTE ARQUIVO, medido nas 148 `HAB(...)` de
   `classes.js`: raça tem despachante (`tracos.js`), dádiva tem
   (`dadivas.js`), magia tem (`usarFuncaoMagica`), poção tem
   (`pocoes.js`), relíquia tem. A HABILIDADE DE CLASSE É A ÚNICA
   FONTE DE PODER DO JOGO SEM UM. Ela só chega a acontecer quando
   cai por acidente numa das famílias que já existem — guarda,
   forma, limiar, pressa, aflição, invocação, controle. O que não
   cai em nenhuma delas é lido na ficha, cobrado em PM e não
   acontece.

   E o mais instrutivo: os motores JÁ EXISTEM e apenas leem outra
   fonte. `removerPelaPorta` (condicoes.js) tinha UM chamador, a
   magia do grimório, enquanto "Purificar" — que diz com todas as
   letras "remove condições ruins de um aliado" — estava declarada
   ali mesmo com `resolve: false` e um `aguarda` que nomeava
   exatamente este arquivo. `dobraMovimento` (dadivas.js) lia só a
   dádiva, enquanto "Passo do Vento" prometia a mesma frase.

   POR QUE UMA TABELA NOVA EM VEZ DE SETE LINHAS NAS ANTIGAS. Onde
   a tabela irmã já descreve a mecânica, a linha vai LÁ e não aqui
   — foi assim que "Ataque Duplo" e "Tiro Duplo" viraram `PRESSAS`,
   e "Provocação" e "Melodia Confusa" viraram `CONTROLES`. Aqui
   moram só os motores que nenhuma família existente cobria: a CURA
   que acontece agora, a PORTA que tira o que está posto no corpo, e
   o PASSIVO que outro módulo lê. Duplicar seria abrir o segundo
   caminho para o mesmo número, que é a doença que esta casa já
   pagou caro para curar.

   O QUE ESTE ARQUIVO NÃO FAZ. Não sorteia (determinismo por
   semente: aqui não há semente porque não há sorte), não muta o que
   recebe (ficha nova, sempre), não importa React e não importa
   `habilidades.js` — a seta aponta no outro sentido, porque é
   `temRegraPropria` que precisa perguntar por aqui.

   E NÃO NASCE COM BLOCO DE PROMPT. O teto de prompt é sagrado, e
   somar bloco estático é proibido: tudo o que o Narrador precisa
   saber sobre estes poderes já está dito em `HABILIDADES_PROMPT`
   ("o sistema resolve, você narra") e, por turno, na `nota` que
   cada resolução devolve. Um bloco a mais diria a mesma coisa em
   82 mil caracteres mais caros.

   CUIDADO COM O HOMÔNIMO: `poder.js` também exporta `poderDe`, e
   ele é outra coisa (o ÍNDICE de poder de uma ficha). Quem importar
   os dois no mesmo arquivo — o `App.jsx` importa o de `poder.js`
   desde a v9.x — tem de apelidar um deles. O App só precisa de
   `aplicarPoder`.
   ============================================================ */

import { portaDeSaida, removerPelaPorta } from "./condicoes.js";

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const txtDe = (h) => NORM(`${(h && h.nome) || ""} ${(h && h.descricao) || ""}`);

/* ---------------- A TABELA ----------------
   Uma linha por poder, no formato das irmãs (`GUARDAS`, `FORMAS`,
   `PRESSAS`): `id`, `rx` que casa com o TEXTO REAL do catálogo,
   `motor`, os parâmetros do motor, e o `conceito` — a frase de
   mundo de onde nasce a linha que o jogador lê.

   AS REGEX SÃO ANCORADAS DE PROPÓSITO. "Chamado da Chuva" diz
   "altera o clima; cura leve contínua", e um `/cura leve/` solto
   transformaria uma magia de clima na cura do Clérigo. Aqui cada
   linha casa pelo começo do nome ou por um pedaço de descrição que
   só existe uma vez no acervo inteiro — um falso positivo aqui é
   PV saindo do lugar errado, e esse é o erro que não se percebe.

   OS NÚMEROS DA CURA. `base` é o que a habilidade devolve no nível
   1 e `porNivel` é o que ela acompanha a escada; `minimo` é o piso,
   porque cura que devolve zero é turno perdido com aparência de
   milagre. A régua: cura de UM alvo é o dobro da cura de GRUPO por
   cabeça — quem escolhe um escolhe fundo, quem rega todos rega
   raso. Nada aqui passa de um terço do PV típico do nível, porque
   cura grande é a estatística que mais rápido apaga o combate. */
export const PODERES_DE_CLASSE = [
  /* ---- CURA: PV agora, sem prazo e sem estado novo na ficha ---- */
  {
    id: "cura_leve", rx: /^cura leve\b|restaura pv de um aliado/,
    motor: "cura", alvo: "aliado", base: 6, porNivel: 1.2, minimo: 4,
    conceito: "a mão sobre a ferida, e a ferida obedece",
  },
  {
    id: "toque_curativo", rx: /^toque curativo\b|cura um aliado com energia natural/,
    motor: "cura", alvo: "aliado", base: 6, porNivel: 1.2, minimo: 4,
    conceito: "seiva em vez de sangue: o corte fecha como casca que volta a crescer",
  },
  {
    id: "cancao_curativa", rx: /^cancao curativa\b|cura o grupo inteiro um pouco/,
    motor: "cura", alvo: "grupo", base: 3, porNivel: 0.6, minimo: 3,
    conceito: "a melodia passa por todos, e cada um respira um pouco melhor",
  },
  {
    id: "balada_heroi", rx: /^balada do heroi\b|o grupo cura e ganha vantagem/,
    motor: "cura", alvo: "grupo", base: 5, porNivel: 0.8, minimo: 4,
    conceito: "a canção conta o fim antes de ele chegar, e o grupo acredita",
  },
  /* O ÚNICO QUE SE GASTA, e o prazo dele é o DIA — não um contador que
     alguém precise zerar. `dadivas.js` já escolheu esta forma para o
     segundo fôlego épico pelo mesmo motivo escrito lá: "é por DIA e se
     devolve sozinho quando o dia vira". Um gasto por dia não precisa de
     descanso que o limpe, e por isso não precisa de fiação num segundo
     sítio do App. */
  {
    id: "segundo_folego", rx: /^segundo folego\b|1x por descanso: recupera parte do pv/,
    motor: "cura", alvo: "proprio", base: 7, porNivel: 1.5, minimo: 5, porDia: true,
    conceito: "o ar volta de onde já não havia ar",
  },

  /* ---- PORTA: tira do corpo o que foi posto nele ----
     `porta` é o NOME declarado em `PORTAS_DE_SAIDA` (condicoes.js).
     O alcance (quais condições saem) mora lá, não aqui: duas listas
     para a mesma pergunta divergiriam no primeiro ajuste. */
  {
    id: "purificar", rx: /^purificar\b|remove condicoes ruins de um aliado/,
    motor: "porta", porta: "Purificar", alvo: "aliado",
    conceito: "a mão aberta sobre o outro, e o que estava posto sai",
  },
  {
    id: "palavra_coragem", rx: /^palavra de coragem\b|remove medo e concede pv temporario/,
    motor: "porta", porta: "Palavra de Coragem", alvo: "aliado",
    conceito: "uma frase dita na altura certa, e o medo perde o lugar onde morava",
  },

  /* ---- PASSIVO: não muda a ficha; outro módulo é que o lê ----
     `chave` é o vocabulário que o leitor consulta. Hoje há um leitor
     só — `dobraMovimento`/`ignoraTerrenoDificil`, em dadivas.js, que
     liam apenas a dádiva e agora leem as duas fontes. */
  {
    id: "passo_do_vento", rx: /^passo do vento\b|move-?se o dobro e ignora terreno dificil/,
    motor: "passivo", chave: "movimento",
    conceito: "o passo não encontra chão difícil: onde os outros tropeçam, ele já passou",
  },
];

/* ---------------- O LEITOR ----------------
   Molde exato de `guardaDe(hab)`: normaliza nome+descrição e devolve a
   entrada ou `null`. Quem resolve é `aplicarPoder`; quem só quer saber
   se existe regra própria é `temRegraPropria` (habilidades.js). */
export function poderDe(hab) {
  const t = txtDe(hab);
  if (!t.trim()) return null;
  return PODERES_DE_CLASSE.find((p) => p.rx.test(t)) || null;
}

/* O passivo, pela chave. Público porque quem o lê mora em outro módulo:
   é a mesma pergunta que `ignoraDificilPorTraco` responde para a raça. */
export function temPassivoDeClasse(pers, chave) {
  const habs = (pers && pers.habilidades) || [];
  if (!chave || !habs.length) return false;
  return habs.some((h) => {
    const p = poderDe(typeof h === "string" ? { nome: h } : h);
    return !!p && p.motor === "passivo" && p.chave === chave;
  });
}

/* ---------------- QUEM RECEBE ----------------
   Herói e companheiro guardam PV e condição do mesmo jeito, então as
   duas escolhas abaixo tratam os dois como uma lista só. A ordem é
   sempre [herói, ...grupo] e o desempate é a posição — nada sorteia. */
const vivo = (a) => !!a && Number(a.vida || 0) > 0;
const naMesa = (pers) => [{ ...(pers || {}), __heroi: true }, ...(((pers || {}).grupo) || [])].filter(Boolean);

function alvoCitado(pers, nome) {
  const alvo = NORM(nome);
  if (!alvo) return null;
  if (NORM((pers || {}).nome) === alvo) return { heroi: true, quem: pers };
  const g = (((pers || {}).grupo) || []).find((x) => x && NORM(x.nome) === alvo);
  return g ? { heroi: false, quem: g } : null;
}

/* O mais ferido de pé. Caído é assunto de `reerguer`, não de cura: uma
   cura que levanta o chão faria da Ressurreição Menor uma habilidade
   sem razão de existir. */
function maisFerido(pers) {
  const lista = naMesa(pers).filter(vivo);
  if (!lista.length) return null;
  let melhor = null, pior = Infinity;
  for (const a of lista) {
    const frac = Number(a.vida || 0) / Math.max(1, Number(a.vidaMax || 0) || 1);
    if (frac < pior) { pior = frac; melhor = a; }
  }
  if (!melhor || pior >= 1) return null;
  return { heroi: !!melhor.__heroi, quem: melhor };
}

/* Quem carrega alguma das condições que a porta alcança. */
function maisAfligido(pers, alcance) {
  const lista = naMesa(pers).filter(vivo);
  for (const a of lista) {
    const tem = ((a.condicoes) || []).some((c) => c && alcance.includes(NORM(c.id || c.nome)));
    if (tem) return { heroi: !!a.__heroi, quem: a };
  }
  return null;
}

const curaDe = (regra, nivel) =>
  Math.max(Number(regra.minimo) || 1, Math.round((Number(regra.base) || 0) + (Number(regra.porNivel) || 0) * Math.max(1, Number(nivel) || 1)));

const gastos = (pers) => (pers && pers.poderGastos) || {};

/* ---------------- O RESOLVEDOR ----------------
   `aplicarPoder(pers, hab, ctx)` devolve `null` quando a habilidade não
   é desta família (a esmagadora maioria dos turnos), ou
   `{ ok, pers, linha, nota }` — a ficha NOVA, a frase que o jogador lê
   e a nota que proíbe o Mestre de inventar número.

   O `ctx` carrega o que o módulo não pode saber sozinho, e são campos
   SIMPLES — nunca um ref do React:
     `dia`  (número) o dia do calendário; só o poder `porDia` o usa
     `alvo` (texto)  o nome do aliado declarado no painel ou citado na
                     frase; vazio quer dizer "o sistema escolhe", e a
                     escolha é determinística (o mais ferido, depois a
                     ordem da mesa).
   Não pede `rodada`: nenhum poder desta tabela tem prazo. O dia em que
   um tiver, o campo entra aqui e o App já o tem na mão. */
export function aplicarPoder(pers, hab, ctx) {
  /* `= {}` no destructuring NÃO cobre `null` explícito — lei da casa */
  const { dia = 0, alvo = "" } = ctx || {};
  const regra = poderDe(hab);
  if (!regra || !pers) return null;
  const nome = (hab && hab.nome) || "A habilidade";

  if (regra.motor === "passivo") {
    return {
      ok: true, pers,
      linha: `🌀 ${nome} — ${regra.conceito}.`,
      nota: `[PODER DE CLASSE — JÁ VALENDO PELO SISTEMA] "${nome}": ${regra.conceito}. O sistema já conta isso no meu deslocamento — narre o corpo que atravessa o que atrasaria os outros, e não me peça teste nem invente distância.`,
    };
  }

  if (regra.motor === "cura") {
    if (regra.porDia && Number(gastos(pers)[regra.id]) === Number(dia)) {
      return { ok: false, pers, linha: `⛔ ${nome}: você já recorreu a isso hoje — volta no descanso do dia.`, nota: "" };
    }
    const valor = curaDe(regra, pers.nivel);

    if (regra.alvo === "grupo") {
      const curados = [];
      const curar = (a) => {
        const antes = Number(a.vida || 0);
        const teto = Number(a.vidaMax || 0) || antes;
        const depois = Math.min(teto, antes + valor);
        if (depois === antes) return a;
        curados.push(`${a.nome} (${depois}/${teto})`);
        return { ...a, vida: depois };
      };
      const heroiCurado = curar(pers);
      const grupo = (pers.grupo || []).map((g) => (vivo(g) ? curar(g) : g));
      if (!curados.length) return { ok: false, pers, linha: `⛔ ${nome}: ninguém aqui tem ferida para fechar.`, nota: "" };
      const p = { ...heroiCurado, grupo };
      return {
        ok: true, pers: regra.porDia ? { ...p, poderGastos: { ...gastos(pers), [regra.id]: Number(dia) || 0 } } : p,
        linha: `✚ ${nome} — ${regra.conceito}. +${valor} PV em ${curados.join(", ")}.`,
        nota: `[CURA — APLICADA PELO SISTEMA] "${nome}" devolveu ${valor} PV a ${curados.join(", ")}. Os números já estão na ficha: narre o alívio de cada um (a respiração que volta, o corte que para de sangrar) e NÃO recalcule, não cure mais ninguém e não levante quem está caído — cura fecha ferida, não ergue do chão.`,
      };
    }

    const escolhido = (regra.alvo === "proprio")
      ? { heroi: true, quem: pers }
      : (alvoCitado(pers, alvo) || maisFerido(pers) || { heroi: true, quem: pers });
    const quem = escolhido.quem;
    if (!vivo(quem)) {
      return { ok: false, pers, linha: `⛔ ${nome}: ${escolhido.heroi ? "você está" : `${quem.nome} está`} no chão — isso é trabalho de quem reergue, não de quem cura.`, nota: "" };
    }
    const antes = Number(quem.vida || 0);
    const teto = Number(quem.vidaMax || 0) || antes;
    const depois = Math.min(teto, antes + valor);
    if (depois === antes) {
      return { ok: false, pers, linha: `⛔ ${nome}: ${escolhido.heroi ? "você está" : `${quem.nome} está`} inteiro — não há ferida para fechar.`, nota: "" };
    }
    const ganho = depois - antes;
    let p = escolhido.heroi
      ? { ...pers, vida: depois, morrendo: false }
      : { ...pers, grupo: (pers.grupo || []).map((g) => (g === quem ? { ...g, vida: depois, morrendo: false } : g)) };
    if (regra.porDia) p = { ...p, poderGastos: { ...gastos(pers), [regra.id]: Number(dia) || 0 } };
    const rotulo = escolhido.heroi ? "você" : quem.nome;
    return {
      ok: true, pers: p,
      linha: `✚ ${nome} — ${regra.conceito}. +${ganho} PV em ${rotulo} (${depois}/${teto}).`,
      nota: `[CURA — APLICADA PELO SISTEMA] "${nome}" devolveu ${ganho} PV a ${rotulo}, que está com ${depois}/${teto}. O número já está na ficha: narre o corpo aceitando a cura e não o recalcule, não o estenda a mais ninguém e não invente ferida que não existia.`,
    };
  }

  if (regra.motor === "porta") {
    const porta = portaDeSaida(regra.porta);
    if (!porta || !porta.resolve || !porta.remove.length) {
      return { ok: false, pers, linha: `⛔ ${nome}: não há nada que esta mão saiba tirar.`, nota: "" };
    }
    const escolhido = alvoCitado(pers, alvo) || maisAfligido(pers, porta.remove.map(NORM)) || { heroi: true, quem: pers };
    const quem = escolhido.quem;
    const r = removerPelaPorta(quem, porta, { quem: escolhido.heroi ? "" : quem.nome });
    if (!r.mudou) {
      return { ok: false, pers, linha: `⛔ ${nome}: ${escolhido.heroi ? "você não carrega" : `${quem.nome} não carrega`} nada que isto alcance.`, nota: "" };
    }
    const saiu = r.removidas.map((c) => c.nome || c.id).join(", ");
    const p = escolhido.heroi
      ? { ...pers, condicoes: r.condicoes }
      : { ...pers, grupo: (pers.grupo || []).map((g) => (g === quem ? { ...g, condicoes: r.condicoes } : g)) };
    const rotulo = escolhido.heroi ? "você" : quem.nome;
    return {
      ok: true, pers: p,
      linha: r.linha || `✚ ${nome} — ${regra.conceito}.`,
      nota: `[CONDIÇÃO REMOVIDA PELO SISTEMA] "${nome}" tirou de ${rotulo}: ${saiu}. Já saiu da ficha — narre o corpo largando aquilo (o veneno que para de correr, a vista que volta, o medo que perde o chão) e trate ${rotulo === "você" ? "-me" : `${rotulo}`} como livre disso daqui em diante. Não devolva a condição e não role nada por ela.`,
    };
  }

  return null;
}

/* ============================================================
   AGUARDAM — a lista declarada, e ela SÓ ENCOLHE

   A catraca desta fase, e o motivo de este arquivo não alegar mais do
   que derruba. Cada linha é uma habilidade de classe que PROMETE na
   ficha e FALHA na mesa, com o motivo por que ainda não cumpre e a
   data em que entrou. Uma etapa futura tira linhas daqui; nenhuma
   etapa pode acrescentar sem que alguém explique por escrito o que
   quebrou.

   O QUE NÃO ESTÁ AQUI, de propósito: as habilidades que são só PROSA
   (Rastrear, Lábia, Conhecimento Vasto, Mãos Leves, Ler Auras, Falar
   com Animais). Elas não prometem número nenhum — a ficção as resolve
   inteiras, e contá-las como dívida inflaria a lista com trabalho que
   não existe.

   `motivo` diz por que ainda não cumpre; `desde` é o dia em que a
   linha nasceu. `dono` (v9.266, H2) é o endereço MEDIDO de quem já faz
   aquilo: `null` quando nenhuma peça do projeto faz, e "arquivo ·
   função" quando faz. Dono parcial conta como dono — o `motivo` é que
   diz qual metade fica de fora. E `dono` NÃO autoriza ligar nada: é
   endereço, não fiação; ligar é etapa própria, com prova.
   Três famílias se repetem, e vale dizê-las em voz alta:
   — "H2" (medido em v9.266): dos 12, 6 têm dono — 2 vivo (Contramágica
     e Foco Interior) e 4 parcial — e 6 não têm nenhum. Dos SETE
     assuntos que a família alegava, QUATRO caíram: clima tem motor
     vivo (`rolarClima`) e o que falta é leitor de número, não
     mecânica; contra-conjuração já acontece pela reação `contramagia`;
     PM de volta tem dono vivo noutro arquivo (`sacrificarInvocacao`);
     e a metade mental da Contra-Canção sai pela porta que já existe.
     Ficam DE PÉ como mecânica a construir marca, cura por turno e
     zona persistente, mais aura reativa, sozinha na sua família —
     quatro assuntos, seis habilidades. **H3 (v9.275) tirou a CURA POR
     TURNO desta lista**: ela tem régua (`REGENERACAO_DO_BUFF`,
     efeitos.js), nasce como `curaTurno` em `efeitoDeBuff`, é cobrada
     pelo relógio que já existia (`tickEfeitos`) e pousa em PV por
     `pousarCura`, com a arena a pagá-la de verdade. As três linhas que
     a citavam — Círculo Sagrado, Renovação e Chamado da Chuva —
     FICARAM em AGUARDAM, cada uma com a dívida TROCADA e escrita: a
     zona, o grupo e o clima sem leitor. Ficam três assuntos.
     **H4 (v9.276) partiu a MARCA ao meio e pagou a primeira metade**:
     "dano extra de TODOS" tem condição (`marcado`, com
     `danoRecebidoExtra` no catálogo), porta (o portador `marca` de
     aflicoes.js, por frase inteira) e leitor no lado certo da conta
     (`resolverAtaque`). "Julgamento" SAIU da lista — a única saída
     desta leva, e o teto desceu com ela. Ficam "Marca do Caçador" e
     "Maldição do Patrono" com a dívida TROCADA e medida: dano extra
     **SEU** pede um campo de DONO que nem o efeito nem a instância de
     condição têm. A Maldição levou junto o conserto da INVERSÃO — ela
     endurecia o inimigo que amaldiçoava —, que é `leve` e entrou por
     baixo desta linha. Ficam dois assuntos e meio.
     O que a fase comprou com isto:
     medir antes de construir encolheu a dívida de sete assuntos para
     quatro, e nenhuma linha de mecânica foi escrita para descobrir
     isso;
   — "a régua do golpe não a vê": `HAB_OFENSIVA_RX` mora no App e
     procura palavras de violência; "sopro elemental em cone" e
     "sequência devastadora" não têm nenhuma, então a habilidade é
     descartada ANTES de qualquer conta — o mesmo poço da Colheita
     Final na v9.48, agora medido e não consertado;
   — "força zero": a família existe e está classificada, e nenhuma
     delas compra coisa alguma ainda — é o recorte que P2 mediu e
     deixou escrito. **F1 (v9.274) tirou `amortece` desta lista**: ela
     tem tabela (`AMORTECIMENTO_DO_BUFF`, efeitos.js) e um leitor que a
     cobra na fila do dano (`amortecerDano`, tracos.js), e as duas
     entradas que a citavam pelo nome — "Corpo de Ferro" e "Postura
     Defensiva" — saíram de `AGUARDAM` com o teto a descer junto.
     Ficam `nao_cai` e `intocado`.
     **F2 (v9.278) NÃO tirou `protege` desta lista, e o motivo é o achado
     da etapa.** A família prometia um corpo alheio, e esse corpo foi
     entregue: o portador `amparo` (aflicoes.js) parte `guarda` ao meio
     por frase inteira — verbo `proteg` MAIS um corpo declarado — e leva
     `alvo: "aliados"`, que o App já lia em dois sítios. Seis das oito da
     família, mais três de fora dela, deixaram de abrigar quem conjurou.
     Só que o abrigo que viaja **não vale nada**: `protegido` é a única
     condição do catálogo com `defesa`, e `mecanicaDe` soma esse campo
     desde a v9.0 para NINGUÉM — `modificadoresDeCondicao` não o devolve e
     `resolverAtaque` nunca o viu. O jogador lê "+2 de defesa" e recebe
     zero, em todos os modos. MEDIDO: com o corpo corrigido e a moeda
     morta, a régua de Uma Vida sai IDÊNTICA AO BYTE — a prova de que as
     duas metades são um pagamento só. As quatro entradas desta leva ficam
     com a dívida TROCADA e escrita, o teto não desce, e a moeda vai à
     pessoa com o preço medido.
   ============================================================ */
export const AGUARDAM = [
  /* ---- pedem mecânica que não existe (H2 mediu: `dono` é o endereço, v9.266) ---- */
  /* "Julgamento" SAIU DESTA LISTA em v9.276 (H4), e é a primeira saída da
     família da MARCA. A promessa dela — "marca um inimigo: sofre dano extra
     de todos" — passou a correr inteira e sem uma linha de `App.jsx`: o
     portador `marca` (aflicoes.js) casa a frase, `rolarAflicao` põe a
     condição `marcado` no inimigo pela porta que o App já usa para toda
     aflição de habilidade ofensiva, e `resolverAtaque` lê
     `modAlvo.danoRecebidoExtra` no lado do alvo. De TODOS é literal: quem
     bate é lido do lado de quem bate, então herói, companheiro e invocação
     somam o mesmo +2 sem saber uns dos outros. */
  { nome: "Marca do Caçador", classe: "Caçador", promete: "alvo marcado sofre dano extra seu", dono: "src/condicoes.js · CONDICOES.marcado", motivo: "MUDOU DE DÍVIDA em H4 (v9.276), e a que ficou é UMA palavra: SEU. A marca existe — condição `marcado` com `danoRecebidoExtra`, portador `marca` em aflicoes.js, lida por `resolverAtaque` — mas ela vale para todos, e esta promete só para quem marcou. Falta o DONO: `criarCondicao` grava `origem` (que é o nome da habilidade, não de quem a usou), nenhuma instância de condição sabe de quem é, e `mecanicaDe` decide pelo catálogo sem saber quem está a bater. Medido em H4: o dono atravessaria `criarCondicao` → `rolarAflicao` → `mecanicaDe` → `modificadoresDeCondicao` → `resolverAtaque` (que já tem o nome do atacante em mãos) — 5 assinaturas, 2 chamadores de `mecanicaDe` e 2 de `modificadoresDeCondicao`. Continua de pé a nota de H2: a magia homónima de grimorio.js existe sem `funcao`, e `resolvidaPeloSistema` devolve false — H4", desde: "16/09" },
  { nome: "Maldição do Patrono", classe: "Bruxo", promete: "marca um alvo: você causa dano extra a ele", dono: "src/aflicoes.js · aflicaoDe (portador `drenagem`)", motivo: "A INVERSÃO FOI PAGA em H4 (v9.276) e a dívida encolheu: até a v9.275 esta habilidade aplicava `enfraquecido` e, por `combate.js:127` ler `modAlvo.danoReduzido` como \"o alvo apanha menos\", deixava o inimigo amaldiçoado 2 MAIS DURO por golpe — o avesso da promessa. Agora cada campo é lido do seu lado da conta: o amaldiçoado bate 2 mais fraco, que é o que o próprio `enfraquecido` promete por escrito. Fica a metade que ainda não sai — o dano extra SEU —, e é exactamente a de \"Marca do Caçador\": a marca vale para todos, e esta quer só para quem a pôs; falta o campo de dono, medido na linha acima — H4", desde: "16/09" },
  { nome: "Círculo Sagrado", classe: "Clérigo", promete: "área protegida onde aliados curam por turno", dono: "src/regras-jogo.js · tickEfeitos", motivo: "MUDOU DE DÍVIDA em H3 (v9.275), e ficou uma metade só: a cura por turno tem régua (`REGENERACAO_DO_BUFF`, efeitos.js), nasce em `efeitoDeBuff` como `curaTurno`, é cobrada por `tickEfeitos` e pousa em PV por `pousarCura` — a arena já a paga. O que falta desta linha é a ZONA presa ao lugar (a mesma da Mina Oculta, que é H6) e a fiação do App, onde o efeito ainda não chega à ficha: `aplicarBuffDeHabilidade` sai antes de `efeitoDeBuff`, o mesmo portão que F1 mediu — H3", desde: "16/09" },
  { nome: "Renovação", classe: "Druida", promete: "cura o grupo por 3 turnos seguidos", dono: "src/regras-jogo.js · tickEfeitos", motivo: "MUDOU DE DÍVIDA em H3 (v9.275): o espelho de `danoTurno` existe — `curaTurno` no efeito, cobrado pelo relógio e pousado por `pousarCura` —, e na arena a habilidade já deixa prazo em vez de uma parcela só. O que falta é o GRUPO: o efeito cai em quem a usou, e curar os outros pede o ramo alvo \"grupo\" (o mesmo que falta à Contra-Canção), mais a fiação do App — H3", desde: "16/09" },
  { nome: "Chamado da Chuva", classe: "Druida", promete: "altera o clima; cura leve contínua", dono: "src/encontros.js · rolarClima", motivo: "meia dívida paga em H3 (v9.275): a CURA CONTÍNUA ganhou dono — `curaTurno` no efeito (régua em `REGENERACAO_DO_BUFF`), cobrado por `tickEfeitos` e pousado por `pousarCura`, vivo na arena. Fica a outra metade, que é a de H2 e continua inteira: `rolarClima`/`pesosDoClima` (encontros.js) são puros e chamados de verdade, mas quem lê o clima só o narra (palco.js:138, geografo.js:132) — nenhuma rolagem decide número por ele — H3", desde: "16/09" },
  { nome: "Coração Tempestuoso", classe: "Feiticeiro", promete: "raios orbitam você e punem quem se aproxima", dono: null, motivo: "aura reativa sem dono: o efeito de efeitos.js não tem campo de gatilho, `GATILHOS` (gatilhos.js:36) só sabe ENCERRAR um efeito e nunca disparar, e `moverInimigos` (grid.js:614) não pergunta a ninguém quem chegou perto — H2", desde: "16/09" },
  { nome: "Contramágica", classe: "Mago", promete: "cancela a magia de um inimigo", dono: "src/reacoes.js · escolherReacao", motivo: "JÁ CUMPRE, e esta linha estava errada: a reação `contramagia` (reacoes.js:35) tem `corta: 1` e `soMagia: true`, `reacoesDe` concede-a por nome na ficha, e a fiação está viva. O que não existe é o inimigo CONJURAR — e isso é decisão escrita em controle.js:26, não buraco. A saída desta linha de AGUARDAM é etapa própria, com prova; não acontece aqui — H2", desde: "16/09" },
  { nome: "Contra-Canção", classe: "Bardo", promete: "anula efeitos mentais e sonoros no grupo", dono: "src/condicoes.js · removerPelaPorta", motivo: "metade viva: `portaDeSaida` (:756) + `removerPelaPorta` (:810) já removem `enfeiticado`, `amedrontado` e `atordoado`, e o motor `porta` de `aplicarPoder` corre. Falta o ramo alvo: \"grupo\" nesse motor (o motor `cura` já tem o dele, pronto para copiar). A outra metade, \"sonoros\", é a contra-conjuração da Contramágica — H2", desde: "16/09" },
  { nome: "Foco Interior", classe: "Monge", promete: "recupera PM meditando 1 turno", dono: "src/invocacoes.js · sacrificarInvocacao", motivo: "a linha anterior apontava para um export morto: `gastarRecurso` (combate.js:745) é importada em App.jsx e NUNCA chamada (a suíte trava isso em teste-acoes-do-jogador.mjs:475). O dono vivo de \"PM de volta\" é outro — `sacrificarInvocacao` (invocacoes.js:197-205, `mana: Math.min(manaMax, mana + pm)`) e `aplicarCurto` (descanso.js:100-112) — e é o molde exacto do que a habilidade pede — H2", desde: "16/09" },
  { nome: "Mina Oculta", classe: "Engenheiro", promete: "arma uma armadilha explosiva no terreno", dono: null, motivo: "zona persistente sem dono, com meio-dono no tabuleiro: grid.js guarda estado por casa (`paredes`, `estorvos`, chaves \"x,y\", :301/:311) e a grade viaja no save — mas nada escreve nesses conjuntos depois de `montarGrade`, e nenhuma casa sabe de quem é, quanto dura, nem o que dispara ao ser pisada — H2", desde: "16/09" },
  { nome: "Muralha de Gelo", classe: "Mago", promete: "ergue uma barreira gélida que bloqueia a passagem", dono: "src/efeitos.js · efeitoDeBuff", motivo: "metade viva, e é a defensiva: sai `protegido` + família `absorve` com `absorve: 10` a 5 PM, gasto por `absorverDano` (efeitos.js:444). Falta \"bloqueia a passagem\" — a mesma zona persistente da Mina Oculta — H2", desde: "16/09" },

  /* ---- a régua do golpe não as vê (o poço da Colheita Final) ---- */
  { nome: "Tiro Preciso", classe: "Caçador", promete: "ataque à distância com bônus de acerto", motivo: "`HAB_OFENSIVA_RX` (App.jsx) não acha palavra de violência em 'ataque à distância', e o disparo não chega a acontecer; o bônus de acerto também não tem onde entrar", desde: "16/09" },
  { nome: "Tiro do Fim", classe: "Caçador", promete: "um único disparo devastador de longe", motivo: "a régua do golpe não a vê: 'disparo devastador' não tem palavra de dano", desde: "16/09" },
  { nome: "Cem Punhos", classe: "Monge", promete: "sequência devastadora em um alvo", motivo: "a régua do golpe não a vê", desde: "16/09" },
  { nome: "Sopro Herdado", classe: "Feiticeiro", promete: "sopro elemental da sua linhagem em cone", motivo: "a régua do golpe não a vê, e o cone é geometria que ninguém pede por ela", desde: "16/09" },
  { nome: "Tempestade Viva", classe: "Feiticeiro", promete: "invoca uma tempestade que castiga a área", motivo: "a régua do golpe não a vê; 'invoca' aqui é figura, não invocação", desde: "16/09" },
  { nome: "Barragem", classe: "Engenheiro", promete: "todas as engenhocas disparam de uma vez", motivo: "a régua do golpe não a vê, e 'todas as engenhocas' pede contar o que o herói construiu", desde: "16/09" },

  /* ---- a família existe e não compra nada (força zero, medido em P2) ---- */
  { nome: "Esquiva Ágil", classe: "Ladino", promete: "anula o dano de um ataque por turno", motivo: "família `intocado`: 18 habilidades classificadas e nenhuma com número atrás", desde: "16/09" },
  { nome: "Defesa Fluida", classe: "Monge", promete: "desvia do próximo ataque automaticamente", motivo: "família `intocado` — força zero", desde: "16/09" },
  { nome: "Intervenção", classe: "Clérigo", promete: "anula completamente um golpe fatal", motivo: "família `nao_cai` — força zero", desde: "16/09" },
  { nome: "Escudo do Pacto", classe: "Bruxo", promete: "o patrono intervém e anula um golpe fatal", motivo: "família `nao_cai`; hoje só vira a condição `protegido`, que não anula golpe nenhum", desde: "16/09" },
  { nome: "Corpo de Ferro", classe: "Monge", promete: "reduz todo dano pela metade por 2 turnos", dono: "src/tracos.js · amortecerDano", motivo: "MUDOU DE DÍVIDA em F1 (v9.274), e a nova é menor e medida: a família `amortece` já tem número (`AMORTECIMENTO_DO_BUFF`) e leitor que o cobra na fila do dano. O que falta é a PORTA — `aflicaoDe` não casa com 'reduz todo dano pela metade por 2 turnos', então `aplicarBuffDeHabilidade` (App.jsx:8136) sai antes de `efeitoDeBuff` e o efeito nunca nasce na ficha. Das 8 da família, só 2 passam por essa porta hoje. Fica também a distância entre a ficção ('metade') e o que a tabela paga (15% a 3 PM), que é decisão de equilíbrio escrita no cabeçalho da tabela, não buraco — F1", desde: "16/09" },
  { nome: "Elixir de Combate", classe: "Engenheiro", promete: "ALIADO ganha força e vigor por 3 turnos", dono: null, motivo: "A LINHA ANTERIOR ESTAVA ERRADA, e F2 (v9.278) mediu-a: ela dizia \"é guarda desde a v9.53\" e não é — `aflicaoDe(\"Elixir de Combate Aliado ganha força e vigor por 3 turnos\")` devolve NULL, portador nenhum. `guarda` não a apanha (não há escudo, barreira nem \"proteg\"), `vigor` também não (o regex é /fortalec|força bruta|potenciali/, e \"força e vigor\" não casa nenhum), e por isso `aplicarBuffDeHabilidade` sai na primeira linha: nem a condição nasce. A dívida é maior do que a que estava escrita e é de OUTRA família — não é abrigo no corpo errado, é um buff de ATRIBUTO em outro corpo, e atributo emprestado não tem mecânica nesta casa (`fortalecido` sobe dano causado, não força nem vigor) — F2", desde: "16/09" },
  { nome: "Muralha", classe: "Guerreiro", promete: "protege um ALIADO adjacente por 2 turnos", dono: "src/aflicoes.js · PORTADORES (`amparo`)", motivo: "MUDOU DE DÍVIDA em F2 (v9.278), e a metade paga é o CORPO: o portador `amparo` casa a frase por duas condições (o verbo `proteg` mais um corpo declarado) e leva `alvo: \"aliados\"`, que `aplicarBuffDeHabilidade` e `buffDeCompanheiro` já sabiam ler — o abrigo deixou de cair em quem usou. A metade que fica é a MOEDA, e F2 mediu que ela vale ZERO: `protegido` é a única condição do catálogo com `defesa`, `mecanicaDe` soma-o desde a v9.0 e NINGUÉM o lê — `modificadoresDeCondicao` não o devolve e `resolverAtaque` não o vê. O jogador lê \"+2 de defesa\" e recebe 0. O conserto são duas linhas em `combate.js`, está escrito nos dois comentários e trancado em `teste-protege.mjs` §5; não foi ligado porque o preço é balanceamento (Uma Vida 52,1% → 54,7% de vitória) e balanceamento é da pessoa — F2", desde: "16/09" },
  { nome: "Escudo da Fé", classe: "Clérigo", promete: "protege um ALIADO de dano por 2 turnos", dono: "src/aflicoes.js · PORTADORES (`amparo`)", motivo: "MUDOU DE DÍVIDA em F2 (v9.278), e é a mais bem servida das quatro: o corpo foi corrigido pelo portador `amparo` (o abrigo vai ao grupo, não a quem conjurou) E ela é da família `absorve`, não da `protege` — o nome tem \"escudo\", então `efeitoDeBuff` já lhe dá `absorve: 6` a 3 PM, gasto por `absorverDano`. Ou seja: esta paga um número de verdade, e agora paga-o com a condição no corpo certo. O que fica é o efeito, que continua em quem conjurou por desenho declarado (App.jsx: \"o efeito fica em quem conjurou, mesmo quando a condição se espalha\") — somar um abrigo por conjurador no grupo inteiro seria o número a crescer sem teto — F2", desde: "16/09" },
  { nome: "Espírito Guardião", classe: "Invocador", promete: "um espírito protege um ALIADO por 2 turnos", dono: "src/aflicoes.js · PORTADORES (`amparo`)", motivo: "MUDOU DE DÍVIDA em F2 (v9.278): a frase NÃO TINHA PORTADOR NENHUM até aqui, e o motivo é uma letra — `prote[çc]` casa \"proteção\" e \"protecao\" e não casa \"protege\", que é o verbo que a ficha usa (é a mesma armadilha que H1 apanhou em \"protetoras\"). Com `amparo` ela passa a abrir `protegido` no grupo. Ficam duas metades: a MOEDA morta que a linha da Muralha mede, e o espírito não proteger ninguém EM PARTICULAR — alvo único é mecânica que não existe, porque `alvo: \"aliados\"` é o grupo inteiro e um quarto valor de `alvo` pede leitor novo nos dois sítios de `App.jsx` (:7725 e :7825), que é onde esta casa não entra sem o bastão — F2", desde: "16/09" },

  /* ---- prometem número que nenhuma tabela sabe cobrar ---- */
  { nome: "Punhal Certeiro", classe: "Ladino", promete: "crítico automático em alvo distraído", motivo: "crítico forçado não existe: `criticoMinimo` abaixa a régua do d20, não a dispensa", desde: "16/09" },
  { nome: "Emboscada", classe: "Caçador", promete: "ataque surpresa com dano triplo", motivo: "não há multiplicador de dano por habilidade — só o crítico dobra", desde: "16/09" },
  { nome: "Sangue Ardente", classe: "Feiticeiro", promete: "sacrifica PV para dobrar o dano mágico", motivo: "o mesmo multiplicador, e mais o preço em PV que ninguém cobra", desde: "16/09" },
  { nome: "Golpe nas Juntas", classe: "Ladino", promete: "reduz a defesa do alvo permanentemente na luta", motivo: "não há como baixar a defesa de um inimigo: `defesaDe` soma, nunca subtrai", desde: "16/09" },
  { nome: "Frasco de Ácido", classe: "Engenheiro", promete: "corrói a armadura do alvo permanentemente", motivo: "a mesma defesa que não desce; hoje só aplica `envenenado`", desde: "16/09" },
  { nome: "Luz Sagrada", classe: "Clérigo", promete: "dano radiante, extra contra mortos-vivos", motivo: "o dano sai, o 'extra contra mortos-vivos' não: ninguém pergunta o TIPO da criatura na hora do dano", desde: "16/09" },
  { nome: "Corrente de Raios", classe: "Mago", promete: "atinge um alvo e salta para outro", motivo: "o salto entre alvos não existe — a área acerta todos de uma vez ou um só", desde: "16/09" },
  { nome: "Mente Serena", classe: "Monge", promete: "imune a medo e confusão por 3 turnos", motivo: "imunidade TEMPORÁRIA não existe: `imuneDeTraco` e `imuneA` são para sempre; e hoje a habilidade ainda tenta amedrontar um inimigo", desde: "16/09" },
  { nome: "Passo Étereo", classe: "Mago", promete: "teleporte curto, escapa de cercos", motivo: "o grid sabe distância e parede, e nada move o herói por habilidade", desde: "16/09" },
  { nome: "Passo Feérico", classe: "Bruxo", promete: "teleporte curto entre sombras ou flores", motivo: "o mesmo teleporte que não existe; hoje só vira `furtivo`", desde: "16/09" },
  { nome: "Voo", classe: "Mago", promete: "voa livremente por vários turnos", motivo: "`funcao: voo` existe no grimório e só `usarFuncaoMagica` a chama — a habilidade de classe de mesmo nome não passa por lá", desde: "16/09" },

  /* ---- meia promessa cumprida é meia dívida ---- */
  { nome: "Palavra de Coragem", classe: "Clérigo", promete: "remove medo E concede PV temporário", motivo: "o medo sai por esta porta desde a v9.265; PV TEMPORÁRIO não existe em lugar nenhum do código — é acervo, e sai daqui no dia em que alguém o construir", desde: "16/09" },
];
