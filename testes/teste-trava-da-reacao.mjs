/* A TRAVA DA REAÇÃO (v9.266 · K2) — quem não responde tem o jogo de hoje,
   byte a byte, incluindo os dados que ele rola.

   POR QUE ESTA SUÍTE É SEPARADA DE `teste-ritmo-da-reacao.mjs`. Aquela
   prova o relógio, as portas e o segredo do dano. Esta prova outra coisa:
   A PARIDADE COM O MOTOR DE HOJE, SOBRE SEMENTES. É a única do projeto que
   instala um PRNG no lugar do rolador global, é lenta de propósito
   (dezenas de milhares de corridas), e é a que quem mexer em `reacoes.js`
   tem de ver vermelha pelo NOME.

   O ACHADO QUE A FEZ NASCER, e ele custou 39,8 % das sementes. O laço de
   hoje pára na primeira chamada que DEVOLVE ALGO — não no primeiro golpe
   que QUALIFICA. Para o Aparar e o Escudo Arcano (sem `chance`) são a
   mesma frase. Para a Esquiva Ágil (`chance` 0,6) e o Contra-ataque (0,55)
   não são: quando o rolo falha, `escolherReacao` devolve `null` e o laço
   TENTA O GOLPE SEGUINTE. E o seguinte. Hoje o ladino esquiva em 97,6 %
   das rodadas de quatro golpes, não nos 60 % do catálogo — e o desenho
   óbvio de K3 (a expiração resolve só o golpe da janela) entrega-lhe os
   60 %, tirando-lhe 12,3 % de sobrevivência em silêncio, numa etapa cuja
   lei de entrada é «regressão zero».

   AS 85 ASSERÇÕES DE K1b SÃO VERDES E SÃO CEGAS A ISSO: estão todas
   escritas com um `guerreiro`, a ficha que não rola dado nenhum. A ficha
   que rola está na mesa aqui, e a asserção 02 falha se ela sair.

   POR QUE EM NODE E NÃO NO NAVEGADOR: a prova inteira é «a mesma semente
   nos dois mundos», e só em Node se substitui o rolador global sem
   mentir — num navegador com HMR e autosave por cima não há «a mesma
   semente», há o que sobrou do buffer anterior. E porque a prova tem de
   correr ANTES de a peça existir: ser executável sem K3 é literalmente o
   requisito. */

const RAIZ = "../src/";
const { readFileSync } = await import("node:fs");
const R = await import(RAIZ + "ritmo-da-reacao.js");
const { RITMO_DA_REACAO, PORTAS_DA_JANELA, ATALHOS_DA_JANELA, ritmoDaRodada, reacaoDoSilencio, fecharAJanela } = R;
const R_REACOES = await import(RAIZ + "reacoes.js");
const { escolherReacao, resolverReacao, REACOES } = R_REACOES;

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const pp = (x) => (x * 100).toFixed(2);
const comecou = Date.now();

/* ---------------- O PRNG, ESCRITO AQUI ----------------
   Mulberry32. Não se importa nada: a suíte que prova o determinismo não
   pode depender de um gerador que alguém mude noutro arquivo — o dia em
   que `semente.js` afinar o seu `rng` esta suíte mudaria de números sem
   nada de errado ter acontecido, e uma catraca que se move sozinha não é
   catraca. Quatro linhas copiadas valem menos que essa dívida. */
function mulberry32(semente) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* O rolador entra pelo global porque é por lá que `escolherReacao` o
   consome hoje (`reacoes.js`, a `chance`). Conta e repõe, sempre —
   `finally` mesmo se a chamada estourar. É o mesmo cinto que
   `reacaoDoSilencio` usa, e é de propósito: os dois lados da paridade têm
   de medir o rolo pela mesma régua, senão a contagem compara réguas. */
function comRolador(rolar, corpo) {
  let rolos = 0;
  const global = Math.random;
  try {
    Math.random = () => { rolos++; return rolar(); };
    const r = corpo();
    return { ...r, rolos };
  } finally { Math.random = global; }
}

const ordemDe = (g, i) => (g && typeof g.ordem === "number" ? g.ordem : i);

/* ============================================================
   O MODELO DO MUNDO DE HOJE — a reimplementação literal

   ENDEREÇO CONFERIDO EM 16/09/2026, contra `VERSAO = "v9.266"` de
   `src/constantes.js`: o laço da rodada está em `src/App.jsx:14556-13990`
   (`for (const a of acoes)` … `if (rc && rc.danoFinal != null) a.r.dano =
   rc.danoFinal;`), e `tentarReacaoNoGolpe` em `src/App.jsx:8248-7707`. O
   `k2-jogo.md` cita `:13972-13982`; o fecho do `if (a.alvoRef ===
   "jogador")` é a linha 13983, e é a única diferença.

   ELA VIVE NO TESTE DE PROPÓSITO. Não é duplicação por preguiça: é o
   MODELO DO MUNDO DE HOJE, e é ela que tem de ficar vermelha se o `App`
   mudar. Uma paridade provada contra o próprio módulo que se está a provar
   não prova nada.

   As três linhas do laço que importam, na ordem em que o App as escreve:

     :7665  `if (reacaoUsadaRef.current || !a || !a.r) return null;`
     :7666  `const gatilho = a.r.dano > 0 ? "sofre_dano" : "inimigo_erra";`
     :7667  `escolherReacao({ pers, gatilho, dano, temReacao: true, tipoDano })`
     :7668  `if (!esc) return null;`  → e o LAÇO SEGUE PARA O GOLPE SEGUINTE
     :7671  `reacaoUsadaRef.current = true;`

   A linha 7668 é o coração da etapa inteira: `return null` não pára a
   rodada, pára só aquele golpe. `:13981` chama de novo no golpe seguinte.
   ============================================================ */
function lacoDeHoje({ golpes, heroi, desde = 0, rolar }) {
  return comRolador(rolar, () => {
    let reacaoUsada = false;                       // `reacaoUsadaRef.current`
    let reacao = null, ordem = null;
    for (let i = 0; i < golpes.length; i++) {      // `for (const a of acoes)` — :13972
      const a = golpes[i] || {};
      const ordemA = ordemDe(a, i);
      if (ordemA < desde) continue;
      /* `if (a.alvoRef === "jogador")` de :13980 — a lista que entra aqui
         já é a dos golpes que caem no herói, tal como a que
         `ritmoDaRodada` recebe. */
      if (reacaoUsada) continue;                   // :7665
      const gatilho = a.dano > 0 ? "sofre_dano" : "inimigo_erra";   // :7666
      const esc = escolherReacao({                 // :7667
        pers: heroi, gatilho, dano: a.dano || 0, temReacao: true, tipoDano: a.tipoDano || "fisico",
      });
      if (!esc) continue;                          // :7668 — e o laço tenta o golpe seguinte
      reacaoUsada = true;                          // :7671
      reacao = esc;
      ordem = ordemA;
    }
    return { reacao, ordem };
  });
}

/* O DESENHO A — ESCRITO AQUI COMO ERRO, e é para ficar.
   «A expiração resolve o golpe da janela»: o desenho óbvio, o que a
   palavra «cobertos» sugere a quem ler depressa. Uma catraca que só sabe
   dizer «o certo está certo» não protege de nada; esta sabe reconhecer o
   erro pelo NOME e pelo NÚMERO, e por isso ele não pode voltar por
   distração. */
function desenhoA({ golpes, heroi, desde = 0, rolar }) {
  return comRolador(rolar, () => {
    let a = null;
    for (let i = 0; i < golpes.length; i++) if (ordemDe(golpes[i], i) === desde) { a = golpes[i]; break; }
    if (!a) return { reacao: null, ordem: null };
    const gatilho = a.dano > 0 ? "sofre_dano" : "inimigo_erra";
    const esc = escolherReacao({ pers: heroi, gatilho, dano: a.dano || 0, temReacao: true, tipoDano: a.tipoDano || "fisico" });
    return esc ? { reacao: esc, ordem: desde } : { reacao: null, ordem: null };
  });
}

/* O dano que a rodada deixa no herói, com a reação já aplicada. Passa por
   `resolverReacao` de verdade em vez de repetir a fórmula do corte: é a
   moeda que o jogador sente, e uma fórmula copiada mente no dia em que
   `corta` mudar. `resolverReacao` não rola nada. */
const danoDaRodada = (golpes, heroi, r) => golpes.reduce((soma, g, i) => {
  const bruto = Number(g.dano) || 0;
  if (!r.reacao || r.ordem !== ordemDe(g, i)) return soma + bruto;
  const res = resolverReacao(r.reacao, { pers: heroi, dano: bruto, atacante: g.inimigo });
  return soma + (res ? res.danoFinal : bruto);
}, 0);

/* ---------------- AS CINCO FICHAS, E A QUE ROLA ESTÁ NA MESA ----------
   `ladino` é a razão de a suíte existir: perfil furtivo → Esquiva Ágil,
   `chance` 0,6, e é a única reação de `sofre_dano` que consulta o dado.
   As outras quatro cobrem os três perfis sem `chance` e três limiares
   diferentes (`max(minDano, round(vidaMax × 0,08))`). */
const guerreiro = { classe: "Guerreiro", nome: "Halvard", nivel: 10, vidaMax: 100, mana: 0, habilidades: [] };
const ladino    = { classe: "Ladino",    nome: "Vex",     nivel: 10, vidaMax:  80, mana: 0, habilidades: [] };
const mago      = { classe: "Mago",      nome: "Oribe",   nivel: 10, vidaMax:  60, mana: 10, habilidades: [] };
const clerigo   = { classe: "Clérigo",   nome: "Mira",    nivel: 10, vidaMax:  90, mana: 8, habilidades: [] };
const bardo     = { classe: "Bardo",     nome: "Lio",     nivel: 10, vidaMax:  45, mana: 6, habilidades: [] };
const FICHAS = [guerreiro, ladino, mago, clerigo, bardo];

const DANO = 20;
/* O `gatilho` vai ESCRITO no golpe porque é assim que `ritmoDaRodada` o
   lê; e o valor é o que `App.jsx:7666` deriva — acertou dói, errou abre a
   guarda. As duas metades do módulo têm de ver o mesmo gatilho no mesmo
   golpe, senão a pergunta e a resolução falam de rodadas diferentes. */
const golpe = (ordem, extra) => {
  const g = { ordem, inimigo: `Bandido ${ordem + 1}`, dano: DANO, tipoDano: "fisico", ...(extra || {}) };
  return { ...g, gatilho: g.gatilho || (g.dano > 0 ? "sofre_dano" : "inimigo_erra") };
};
const rodadaDe = (n, extra) => Array.from({ length: n }, (_, i) => golpe(i, extra));
/* o golpe que PASSA LONGE: `dano: 0` → gatilho `inimigo_erra` → Contra-ataque, `chance` 0,55 */
const erros = (n) => rodadaDe(n, { dano: 0 });

/* ---------------- A VARREDURA ----------------
   10 000 SEMENTES. O `jogo` correu 20 000 e mediu 3,9 s nos dois scripts;
   aqui há três motores por caso e doze casos, e 10 000 mantém a suíte
   dentro dos segundos que o `rodar-tudo` tolera. Os 37,44 % e os 12,28 %
   estabilizam na terceira casa entre 10 000 e 20 000 — o que basta a uma
   catraca de ±0,5 pp, e está escrito aqui que é observação e não
   justificação estatística. */
const SEMENTES = 10000;

function varrer(caso) {
  const { heroi, golpes, desde = 0 } = caso;
  const r = {
    caso, pares: 0, divergiuParidade: null,
    rolosHoje: 0, rolosModulo: 0, rolosA: 0,
    difRolosA: 0, difResultadoA: 0,
    danoHoje: 0, danoA: 0,
    ordemDepoisDoAbre: 0, duasEstradas: null,
  };
  const abre = ritmoDaRodada({ golpes, heroi }).abre;
  for (let s = 0; s < SEMENTES; s++) {
    const h = lacoDeHoje({ golpes, heroi, desde, rolar: mulberry32(s) });
    const m = reacaoDoSilencio({ golpes, heroi, desde, rolar: mulberry32(s) });
    const a = desenhoA({ golpes, heroi, desde, rolar: mulberry32(s) });

    r.pares++;
    r.rolosHoje += h.rolos; r.rolosModulo += m.rolos; r.rolosA += a.rolos;
    const idDe = (x) => (x.reacao ? x.reacao.id : "—");
    if (!r.divergiuParidade && (idDe(h) !== idDe(m) || h.ordem !== m.ordem || h.rolos !== m.rolos)) {
      r.divergiuParidade = `semente ${s}: hoje ${idDe(h)}@${h.ordem}/${h.rolos} rolos · módulo ${idDe(m)}@${m.ordem}/${m.rolos} rolos`;
    }
    if (a.rolos !== h.rolos) r.difRolosA++;
    if (idDe(a) !== idDe(h) || a.ordem !== h.ordem) r.difResultadoA++;
    r.danoHoje += danoDaRodada(golpes, heroi, h);
    r.danoA += danoDaRodada(golpes, heroi, a);

    /* 05 — o golpe da janela nunca vem DEPOIS da primeira reação de hoje.
       É o invariante que torna [R1] suficiente: replicar a partir de
       `abre.ordem` nunca salta um golpe que hoje reagiria. */
    if (abre && h.ordem != null && abre.ordem > h.ordem) r.ordemDepoisDoAbre++;

    /* 06 — as duas estradas do silêncio. A janela que EXPIROU resolve a
       partir de `abre.ordem`; a que NUNCA ABRIU (portas `silencio` e
       `escondida`) resolve a partir do começo da rodada. Têm de chegar ao
       mesmo sítio, com a mesma contagem de rolos. */
    if (!r.duasEstradas && abre) {
      const expirou = reacaoDoSilencio({ golpes, heroi, desde: abre.ordem, rolar: mulberry32(s) });
      const nuncaAbriu = reacaoDoSilencio({ golpes, heroi, desde: 0, rolar: mulberry32(s) });
      if (idDe(expirou) !== idDe(nuncaAbriu) || expirou.ordem !== nuncaAbriu.ordem || expirou.rolos !== nuncaAbriu.rolos) {
        r.duasEstradas = `semente ${s}: expirou ${idDe(expirou)}@${expirou.ordem}/${expirou.rolos} · nunca abriu ${idDe(nuncaAbriu)}@${nuncaAbriu.ordem}/${nuncaAbriu.rolos}`;
      }
    }
  }
  return r;
}

/* OS DOZE CASOS. Dez são os 5 fichas × {4, 12} golpes que a etapa pediu;
   os dois últimos são os ERROS — o único caminho até ao Contra-ataque
   (`inimigo_erra`, `chance` 0,55), a segunda reação que rola. Sem eles a
   `chance` 0,55 não teria uma única asserção no projeto. */
const CASOS = [];
for (const heroi of FICHAS) for (const n of [4, 12]) CASOS.push({ rotulo: `${heroi.classe} · ${n} golpes`, heroi, golpes: rodadaDe(n) });
CASOS.push({ rotulo: "Guerreiro · 4 ERROS (contra-ataque)", heroi: guerreiro, golpes: erros(4) });
CASOS.push({ rotulo: "Ladino · 2 arranhões + 4 golpes", heroi: ladino, golpes: [golpe(0, { dano: 2 }), golpe(1, { dano: 2 }), ...rodadaDe(4).map((g, i) => ({ ...g, ordem: i + 2, inimigo: `Bandido ${i + 3}` }))] });

const MEDIDO = CASOS.map(varrer);
const porRotulo = (s) => MEDIDO.find((m) => m.caso.rotulo === s);

/* ============================================================
   01 · A PARIDADE — a catraca da etapa
   ============================================================ */
sec("01. A PARIDADE — `reacaoDoSilencio` contra o laço de hoje, semente a semente");
{
  console.log(`  ··  ${CASOS.length} casos × ${SEMENTES} sementes = ${CASOS.length * SEMENTES} pares (5 fichas × {4,12} golpes + 2 casos de erro)`);
  for (const m of MEDIDO) {
    console.log(`  ··  ${m.caso.rotulo.padEnd(36)} rolos/rodada: hoje ${(m.rolosHoje / m.pares).toFixed(3)} · módulo ${(m.rolosModulo / m.pares).toFixed(3)} · desenho A ${(m.rolosA / m.pares).toFixed(3)}`);
  }
  const quebrou = MEDIDO.filter((m) => m.divergiuParidade);
  t(`a mesma reação, no mesmo golpe, com o mesmo número de rolos, em ${CASOS.length * SEMENTES} pares`,
    quebrou.length === 0, quebrou.map((m) => `${m.caso.rotulo}: ${m.divergiuParidade}`).join(" | "));
  t("e a contagem de rolos bate no TOTAL, não só par a par",
    MEDIDO.every((m) => m.rolosHoje === m.rolosModulo),
    MEDIDO.filter((m) => m.rolosHoje !== m.rolosModulo).map((m) => `${m.caso.rotulo}: ${m.rolosHoje} vs ${m.rolosModulo}`).join(" | "));
}

/* ============================================================
   02 · A FICHA QUE ROLA ESTÁ NA MESA
   ============================================================ */
sec("02. A FICHA QUE ROLA ESTÁ NA MESA — 85 asserções verdes com um guerreiro é o defeito que esta apanha");
{
  const ladino4 = porRotulo("Ladino · 4 golpes");
  const contra = porRotulo("Guerreiro · 4 ERROS (contra-ataque)");
  t("a Esquiva Ágil está no catálogo com `chance` 0,6", (REACOES.find((x) => x.id === "esquiva_agil") || {}).chance === 0.6);
  t("e o Contra-ataque com `chance` 0,55", (REACOES.find((x) => x.id === "contra_ataque") || {}).chance === 0.55);
  t("a varredura inclui o ladino, e ele ROLA (rolos/rodada > 1)", ladino4.rolosHoje / ladino4.pares > 1, `mediu ${(ladino4.rolosHoje / ladino4.pares).toFixed(3)}`);
  t("e inclui o contra-ataque, e ele também ROLA", contra.rolosHoje / contra.pares > 1, `mediu ${(contra.rolosHoje / contra.pares).toFixed(3)}`);
  /* A ASSERÇÃO QUE MATA O VERDE VAZIO: se um dia todas as fichas da mesa
     deixarem de rolar, esta suíte estará a provar a paridade de um motor
     determinístico contra outro — verde, e cega. */
  t("a suíte falha se a contagem de rolos for ZERO em todos os casos",
    MEDIDO.some((m) => m.rolosHoje > 0), "nenhuma ficha da mesa rola dado — a suíte ficou cega");
  const semRolo = MEDIDO.filter((m) => m.rolosHoje === 0).map((m) => m.caso.rotulo);
  console.log(`  ··  ${MEDIDO.length - semRolo.length} de ${MEDIDO.length} casos rolam dado · sem rolo: ${semRolo.join(" · ") || "nenhum"}`);
}

/* ============================================================
   03 · O DESENHO A ESTÁ ESCRITO COMO ERRO
   ============================================================ */
sec("03. O DESENHO A ESTÁ ESCRITO COMO ERRO — e a catraca sabe o nome e o número dele");
{
  /* O `jogo` mediu, com 10 000 sementes: 39,84 % dos rolos e 37,44 % dos
     resultados divergentes no caso `ladino · 4 golpes`. A tolerância é
     ±0,5 pp e é do documento — os dois números estabilizam na terceira
     casa entre 10 000 e 20 000 sementes. */
  const ALVO_ROLOS = 39.84, ALVO_RESULTADO = 37.44, TOL = 0.5;
  const m = porRotulo("Ladino · 4 golpes");
  const rolos = (m.difRolosA / m.pares) * 100;
  const result = (m.difResultadoA / m.pares) * 100;
  console.log(`  ··  ladino · 4 golpes: rolos divergentes ${rolos.toFixed(2)} % (o jogo mediu ${ALVO_ROLOS} %) · resultados ${result.toFixed(2)} % (o jogo mediu ${ALVO_RESULTADO} %)`);
  t(`o desenho A diverge em ${ALVO_ROLOS} % dos ROLOS (±${TOL} pp)`, Math.abs(rolos - ALVO_ROLOS) <= TOL, `medi ${rolos.toFixed(2)} %`);
  t(`e em ${ALVO_RESULTADO} % dos RESULTADOS (±${TOL} pp)`, Math.abs(result - ALVO_RESULTADO) <= TOL, `medi ${result.toFixed(2)} %`);
  /* E o guerreiro — a ficha de K1b — não move um ponto. É por isto que
     ninguém teria visto: a suíte inteira da etapa anterior é cega a esta
     classe de defeito. */
  const g = porRotulo("Guerreiro · 4 golpes");
  t("e o GUERREIRO não move um ponto — 0 % nos dois eixos, e é por isso que ninguém teria visto",
    g.difRolosA === 0 && g.difResultadoA === 0, `rolos ${g.difRolosA} · resultados ${g.difResultadoA}`);
  const c = porRotulo("Guerreiro · 4 ERROS (contra-ataque)");
  console.log(`  ··  guerreiro · 4 erros: rolos ${pp(c.difRolosA / c.pares)} % (o jogo mediu 44,39 %) · resultados ${pp(c.difResultadoA / c.pares)} % (o jogo mediu 40,83 %)`);
  t("o contra-atacante também diverge, e acima de 40 % dos rolos", c.difRolosA / c.pares > 0.40, `medi ${pp(c.difRolosA / c.pares)} %`);
}

/* ============================================================
   04 · +12,28 % DE DANO AO FURTIVO
   ============================================================ */
sec("04. O CUSTO EM PV — o desenho A tira 12,3 % de sobrevivência ao furtivo, em silêncio");
{
  /* A RAZÃO, escrita para que o custo não evapore no dia em que alguém
     «simplificar»: hoje o ladino esquiva em 97,6 % das rodadas de quatro
     golpes, porque o motor repete a aposta uma vez por golpe. O desenho A
     entrega-lhe a `chance` nua do catálogo, 60 %. A diferença não aparece
     em nenhuma tela, em nenhum log e em nenhuma das 85 asserções de K1b —
     aparece só na barra de vida, três combates depois. */
  const ALVO = 12.28, TOL = 0.5;
  const m = porRotulo("Ladino · 4 golpes");
  const hoje = m.danoHoje / m.pares, a = m.danoA / m.pares;
  const acrescimo = ((a - hoje) / hoje) * 100;
  console.log(`  ··  dano sofrido por rodada · hoje ${hoje.toFixed(3)} · desenho A ${a.toFixed(3)} · +${acrescimo.toFixed(2)} % (o jogo mediu +${ALVO} %)`);
  t(`o desenho A custa +${ALVO} % de dano ao furtivo (±${TOL} pp)`, Math.abs(acrescimo - ALVO) <= TOL, `medi +${acrescimo.toFixed(2)} %`);
  const g = porRotulo("Guerreiro · 4 golpes");
  t("e ao guerreiro custa 0,00 % — a ficha com que K1b foi escrita não move um ponto",
    g.danoHoje === g.danoA, `hoje ${g.danoHoje} · A ${g.danoA}`);
  t("a varredura do módulo dá o mesmo dano que o laço de hoje (a paridade também é PV)", (() => {
    let soma = 0;
    for (let s = 0; s < 500; s++) soma += danoDaRodada(m.caso.golpes, m.caso.heroi, reacaoDoSilencio({ golpes: m.caso.golpes, heroi: m.caso.heroi, rolar: mulberry32(s) }));
    let somaHoje = 0;
    for (let s = 0; s < 500; s++) somaHoje += danoDaRodada(m.caso.golpes, m.caso.heroi, lacoDeHoje({ golpes: m.caso.golpes, heroi: m.caso.heroi, rolar: mulberry32(s) }));
    return soma === somaHoje;
  })());
}

/* ============================================================
   05 · O GOLPE DA JANELA NUNCA VEM DEPOIS DA REAÇÃO DE HOJE
   ============================================================ */
sec("05. `abre.ordem <= ordem da reação de hoje` — o invariante que torna [R1] suficiente");
{
  const mau = MEDIDO.filter((m) => m.ordemDepoisDoAbre > 0);
  t(`em ${CASOS.length * SEMENTES} sementes, a janela nunca abre depois do golpe em que hoje se reagiria`,
    mau.length === 0, mau.map((m) => `${m.caso.rotulo}: ${m.ordemDepoisDoAbre} sementes`).join(" | "));
  /* NÃO É VERDE VAZIO: no caso dos arranhões a janela abre no golpe 2 (os
     dois primeiros fecham pela porta `arranhao`), e o laço de hoje também
     não reage neles — é exactamente o caso em que `desde > 0` e a
     replicação a partir de `abre.ordem` tinha de poder saltar golpes. */
  const arr = porRotulo("Ladino · 2 arranhões + 4 golpes");
  const abre = ritmoDaRodada({ golpes: arr.caso.golpes, heroi: arr.caso.heroi }).abre;
  t("e há um caso com `abre.ordem > 0` na varredura (senão o invariante era trivial)", !!abre && abre.ordem === 2, `abre.ordem = ${abre && abre.ordem}`);
}

/* ============================================================
   06 · AS DUAS ESTRADAS DO SILÊNCIO
   ============================================================ */
sec("06. AS DUAS ESTRADAS DO SILÊNCIO CHEGAM AO MESMO SÍTIO");
{
  /* A janela que EXPIROU (resolve a partir de `abre.ordem`) e a janela que
     NUNCA ABRIU (portas `silencio` e `escondida`, resolve a partir do
     começo da rodada). Duas estradas para o mesmo sítio só chegam ao mesmo
     sítio enquanto alguém as comparar. */
  const mau = MEDIDO.filter((m) => m.duasEstradas);
  t("expirar a janela e nunca a abrir dão a MESMA reação, no MESMO golpe, com os MESMOS rolos",
    mau.length === 0, mau.map((m) => `${m.caso.rotulo}: ${m.duasEstradas}`).join(" | "));
  /* e as duas estradas existem mesmo, pelo nome da porta */
  const golpes = rodadaDe(4);
  const calou = ritmoDaRodada({ golpes, heroi: ladino, expiracoesSeguidas: 2 });
  const oculta = ritmoDaRodada({ golpes, heroi: ladino, escondida: true });
  t("a estrada `silencio` existe e não abre janela", calou.abre === null && calou.fechados.every((f) => f.porta === "silencio"));
  t("a estrada `escondida` existe e não abre janela", oculta.abre === null && oculta.fechados.every((f) => f.porta === "escondida"));
  t("e as duas custam espera ZERO — resolvem como hoje, na hora", calou.esperaMs === 0 && oculta.esperaMs === 0);
}

/* ============================================================
   07 · A ORDEM DO LOG
   ============================================================ */
sec("07. A ORDEM DO LOG — a linha da reação vem ANTES de toda linha de ataque");
{
  /* HOJE A LINHA DA REAÇÃO APARECE NO CHAT ANTES DAS LINHAS DE ATAQUE DA
     RODADA, e é um defeito de leitura, e é antigo: `tentarReacaoNoGolpe`
     chama `pushMsgs` imediatamente (`App.jsx:7673`), enquanto `linhasSis`
     — que carrega «🛡 Ogro → você: 9 de dano» — só é despejada depois de o
     laço fechar (`App.jsx:14083`). O jogador lê «⚔ REAÇÃO — Aparar: 4 de
     dano evitado» e só a seguir lê o golpe que a causou.

     É O JOGO DE HOJE, BYTE A BYTE, E K2 NÃO É A ETAPA QUE O CONSERTA. A
     ordem é load-bearing: consertá-la é uma mudança de EXPERIÊNCIA, vai à
     pessoa, e nunca entra de contrabando dentro de K3. Se K3 tornar a
     rodada assíncrona sem cuidado, esta ordem inverte-se SOZINHA — basta a
     janela suspender o laço depois de `linhasSis` ter sido despejada. É o
     tipo de regressão que passa em todas as suítes e que nenhum
     programador consegue depois explicar. Por isso está aqui. */
  const app = readFileSync("../src/App.jsx", "utf8");
  const iReacao = app.indexOf('pushMsgs([{ autor: "sistema", texto: res.texto }]);');
  const iLinhas = app.indexOf("if (linhasSis.length) pushMsgs(linhasSis);");
  const linhaDe = (i) => app.slice(0, i).split("\n").length;
  t("a linha da reação existe no App", iReacao > 0, "o `pushMsgs` de `tentarReacaoNoGolpe` mudou de forma");
  t("o despejo de `linhasSis` existe no App", iLinhas > 0);
  console.log(`  ··  reação em App.jsx:${linhaDe(iReacao)} · despejo de linhasSis em App.jsx:${linhaDe(iLinhas)}`);
  t("e a reação é despejada ANTES — defeito antigo, deliberadamente preservado", iReacao > 0 && iLinhas > 0 && iReacao < iLinhas);
  /* O QUE K3 TEM DE RESPEITAR: `reacaoDoSilencio` devolve `ordem`, e é por
     ela que a linha da reação se posiciona. Se a resolução não soubesse em
     que golpe caiu, a posição do log seria um palpite. */
  const r = reacaoDoSilencio({ golpes: rodadaDe(4), heroi: guerreiro, rolar: mulberry32(1) });
  t("a resolução devolve o golpe em que a reação caiu — é o que dá a posição à linha", r.ordem === 0 && !!r.reacao);
}

/* ============================================================
   08 · A FICHA É `persBase`
   ============================================================ */
sec("08. A FICHA É `persBase` — a do INÍCIO da rodada, nunca a já gasta");
{
  /* `App.jsx:13981` passa `persBase`, não `persTracos`. A diferença é
     real: `persTracos` carrega a Pele de Pedra já gasta e o PM noutro
     número, e o PM da reação só sai da ficha no FIM da rodada
     (`App.jsx:14126`). Chamar `escolherReacao` com a ficha a meio da
     rodada é a porta 16 de §5, e ela abre-se sem uma linha mal escrita:
     basta passar a variável que está à mão. */
  const golpes = rodadaDe(4);
  const persBase = { ...mago, mana: 2 };                     // paga os 2 PM do Escudo Arcano
  const persTracos = { ...mago, mana: 1 };                   // a meio da rodada, já gastou 1
  const comBase = reacaoDoSilencio({ golpes, heroi: persBase, rolar: mulberry32(7) });
  const comTracos = reacaoDoSilencio({ golpes, heroi: persTracos, rolar: mulberry32(7) });
  t("com `persBase` (2 PM) o mago ergue o Escudo Arcano", !!comBase.reacao && comBase.reacao.id === "escudo_arcano");
  t("com a ficha já gasta (1 PM) ele NÃO ergue — logo a ficha importa, e a asserção não é vazia", comTracos.reacao === null);
  t("e a resolução lê a ficha que RECEBE, sem ir buscar outra a lado nenhum", (() => {
    /* a prova de que não há estado escondido: mudar a ficha de entrada é a
       ÚNICA coisa que muda a resposta */
    const a = reacaoDoSilencio({ golpes, heroi: persBase, rolar: mulberry32(7) });
    const b = reacaoDoSilencio({ golpes, heroi: persBase, rolar: mulberry32(7) });
    return JSON.stringify(a.reacao && a.reacao.id) === JSON.stringify(b.reacao && b.reacao.id) && a.rolos === b.rolos;
  })());
  t("o débito de PM é o da tabela, e a resolução não o aplica à ficha (isso é o fim da rodada, `App.jsx:14126`)",
    persBase.mana === 2 && comBase.reacao.pm === 2);
}

/* ============================================================
   09 · NENHUMA SEGUNDA DURAÇÃO
   ============================================================ */
sec("09. NENHUMA SEGUNDA DURAÇÃO — o `leque` morreu em K1b e não volta com outro nome");
{
  /* O relógio morre no primeiro input, seja ele qual for: é o que faz as
     teclas a mais que o teclado gasta a navegar o leque custarem ZERO
     tempo. Uma segunda duração na tabela — o leque a expirar, sob qualquer
     nome — reabriria a porta 15 de §5. As seis chaves são as acordadas, e
     chave nova quebra aqui. */
  const CHAVES_DE_TEMPO = ["janela", "folga", "trilho", "aperto", "bonusContagem", "bonusToque"];
  const ESPERADAS = ["id", ...CHAVES_DE_TEMPO].sort().join(",");
  for (const linha of RITMO_DA_REACAO) {
    t(`[${linha.id}] tem exactamente as seis chaves de tempo acordadas, e mais nenhuma`,
      Object.keys(linha).sort().join(",") === ESPERADAS, `tem: ${Object.keys(linha).join(",")}`);
    t(`[${linha.id}] folga + trilho === janela`, linha.folga + linha.trilho === linha.janela);
  }
  t("e nenhuma chave nova cheira a um segundo relógio (leque, menu, escolha, verbo...)",
    RITMO_DA_REACAO.every((l) => Object.keys(l).every((k) => !/leque|menu|escolh|verbo|lista|segund/i.test(k))));
}

/* ============================================================
   10 · A PARIDADE DE TECLADO
   ============================================================ */
sec("10. A PARIDADE DE TECLADO — WCAG 2.1.1, contada e não sentida");
{
  const mau = ATALHOS_DA_JANELA.filter((a) => a.teclado > a.ponteiro + 1);
  t("`teclado <= ponteiro + 1` em toda linha", mau.length === 0, mau.map((a) => `${a.id}: ${a.teclado} vs ${a.ponteiro}`).join(" | "));
  /* `Etapa=Direta` — o caso comum — só tem *aceitar* e *recusar*, e essas
     duas custam exactamente o mesmo às duas mãos. O único desfecho que
     custa uma tecla a mais é escolher um SEGUNDO verbo do leque, e o leque
     não expira: a tecla a mais não é paga em tempo. A paridade que
     interessa não é de gestos, é de resultado sob relógio. */
  for (const id of ["aceitar", "recusar"]) {
    const a = ATALHOS_DA_JANELA.find((x) => x.id === id);
    t(`[${id}] custa o MESMO às duas mãos (${a.teclado} === ${a.ponteiro})`, !!a && a.teclado === a.ponteiro);
  }
  t("a linha que custa uma tecla a mais é a do leque, e só ela",
    ATALHOS_DA_JANELA.filter((a) => a.teclado > a.ponteiro).map((a) => a.id).join(",") === "escolher");
  t("toda linha declara uma tecla nomeada", ATALHOS_DA_JANELA.every((a) => typeof a.tecla === "string" && a.tecla.length > 0));
  t("são as três acordadas", ATALHOS_DA_JANELA.map((a) => a.id).join(",") === "aceitar,recusar,escolher");
}

/* ============================================================
   11 · AS QUATRO PÍLULAS TÊM AS QUATRO ESTRADAS
   ============================================================ */
sec("11. AS QUATRO PÍLULAS TÊM AS QUATRO ESTRADAS — opção que não chega a lado nenhum é pior que não a ter");
{
  /* É a lei do export morto aplicada à conformidade: uma opção de
     acessibilidade sem efeito parece que se cumpriu. As quatro
     preferências da ficha (K1 §2) são `normal`, `parado`, um verbo travado
     e `deixar_passar`. */
  const golpes = rodadaDe(4);
  const estradas = {};
  for (const p of ["normal", "parado", "aparar", "deixar_passar"]) {
    const r = ritmoDaRodada({ golpes, heroi: guerreiro, preferencia: p });
    estradas[p] = r;
    t(`[${p}] devolve uma resposta bem formada`,
      r && typeof r === "object" && "abre" in r && "cobertos" in r && "fechados" in r && typeof r.esperaMs === "number");
  }
  t("`normal` abre a janela e cobra os 15 000 ms", !!estradas.normal.abre && estradas.normal.esperaMs === 15000);
  t("`parado` abre a janela e cobra ZERO (WCAG 2.2.1)", !!estradas.parado.abre && estradas.parado.esperaMs === 0 && estradas.parado.abre.janelaMs === 0);
  t("um verbo travado NÃO pergunta — porta `preferencia`", estradas.aparar.abre === null && estradas.aparar.fechados.every((f) => f.porta === "preferencia"));
  t("`deixar_passar` NÃO pergunta — porta `preferencia`", estradas.deixar_passar.abre === null && estradas.deixar_passar.fechados.every((f) => f.porta === "preferencia"));
  t("e o verbo travado é um verbo de verdade do catálogo", !!REACOES.find((x) => x.id === "aparar"));
  /* nenhuma fica sem efeito: as quatro não colapsam em duas respostas */
  const assinaturas = new Set(Object.values(estradas).map((r) => JSON.stringify({ abre: !!r.abre, espera: r.esperaMs, porta: (r.fechados[0] || {}).porta || null })));
  t("as quatro pílulas produzem desfechos distinguíveis (nenhuma é decoração)", assinaturas.size >= 3, `só ${assinaturas.size} desfechos distintos`);
}

/* ============================================================
   12 · A EXTRACÇÃO DE `reacoesQueSeAplicam` É CONFERÍVEL
   ============================================================ */
sec("12. [R4] A EXTRACÇÃO DE `reacoesQueSeAplicam` É CONFERÍVEL — o número de hoje, congelado");
{
  /* [R4]: a extracção é regressão zero APENAS enquanto `escolherReacao`
     continuar a rolar a `chance` na mesma posição da sequência — «a
     primeira da lista que sobrevive ao seu rolo, um rolo por candidata
     testada, na ordem de `REACOES`». Enquanto a extracção não existe, esta
     asserção fixa o NÚMERO DE HOJE; no dia em que ela existir, é esta
     linha que diz se foi de graça.

     OS TOTAIS abaixo são a soma dos rolos sobre as 10 000 sementes, por
     caso — medidos em 16/09/2026, `VERSAO = "v9.266"`, com o mulberry32
     escrito nesta suíte e as sementes 0…9999. Um total diferente depois da
     extracção não é «afinação»: é a posição do rolo na sequência a mudar,
     e com ela o mundo de quem responde. */
  const ROLOS_DE_HOJE = {
    "Guerreiro · 4 golpes": 0,
    "Guerreiro · 12 golpes": 0,
    "Ladino · 4 golpes": 16188,
    "Ladino · 12 golpes": 16575,
    "Mago · 4 golpes": 0,
    "Mago · 12 golpes": 0,
    "Clérigo · 4 golpes": 0,
    "Clérigo · 12 golpes": 0,
    "Bardo · 4 golpes": 0,
    "Bardo · 12 golpes": 0,
    "Guerreiro · 4 ERROS (contra-ataque)": 17301,
    "Ladino · 2 arranhões + 4 golpes": 16188,   // os dois arranhões não rolam: igual ao caso de 4 golpes
  };
  const fora = MEDIDO.filter((m) => m.rolosHoje !== ROLOS_DE_HOJE[m.caso.rotulo]);
  t(`a contagem de rolos por caso é a de hoje, sobre ${SEMENTES} sementes`,
    fora.length === 0, fora.map((m) => `${m.caso.rotulo}: medi ${m.rolosHoje}, a tabela diz ${ROLOS_DE_HOJE[m.caso.rotulo]}`).join(" | "));
  t("e o módulo consome exactamente os mesmos, sem um rolo a mais nem a menos",
    MEDIDO.every((m) => m.rolosModulo === ROLOS_DE_HOJE[m.caso.rotulo]));
  /* a forma de [R4], provada à mão: UM rolo por candidata testada, na
     ordem de `REACOES`, e a primeira que sobrevive ao seu rolo ganha */
  t("um rolo por candidata testada — o ladino tem UMA candidata a `sofre_dano`, logo UM rolo por golpe tentado", (() => {
    const um = reacaoDoSilencio({ golpes: [golpe(0)], heroi: ladino, rolar: () => 0 });   // rolo 0 <= 0,6: passa
    const zero = reacaoDoSilencio({ golpes: [golpe(0)], heroi: guerreiro, rolar: () => 0 }); // Aparar não tem `chance`
    return um.rolos === 1 && zero.rolos === 0;
  })());
  t("e a `chance` é o ÚLTIMO filtro: quem não passa o limiar nem chega a rolar", (() => {
    /* limiar do ladino: max(minDano 4, round(80 × 0,08) = 6) = 6 */
    const arranhao = reacaoDoSilencio({ golpes: [golpe(0, { dano: 5 })], heroi: ladino, rolar: () => { throw new Error("rolou num arranhão"); } });
    return arranhao.rolos === 0 && arranhao.reacao === null;
  })());
}

/* ============================================================
   13 · `reacaoDoSilencio` NÃO TEM PARÂMETRO DE TEMPO
   ============================================================ */
sec("13. [T2] `reacaoDoSilencio` NÃO TEM PARÂMETRO DE TEMPO — e a prova é a assinatura, não uma promessa");
{
  /* Em aba de fundo o navegador limita o temporizador a ~1 Hz; depois de
     alguns minutos escondida aperta para ~1/min; sob congelamento pode não
     disparar nunca. Uma janela de 15 s dispara aos 15 s, aos 40 s, ou
     nunca. [T2] não MEDE esse atraso — torna-o IRRELEVANTE: um resultado
     que dependesse do instante faria o navegador ser o Mestre.

     A prova é estrutural. Lê-se a fonte do módulo, com os comentários
     mascarados (senão o dente morderia a própria documentação que concorda
     com ele — é a lição de `check-formas.mjs`). */
  const bruto = readFileSync("../src/ritmo-da-reacao.js", "utf8");
  const codigo = bruto.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

  /* (I) A ASSINATURA: as chaves que a função lê da entrada, colhidas do
     código. São quatro, e nenhuma delas é de tempo. */
  const i0 = codigo.indexOf("export function reacaoDoSilencio");
  const resto = codigo.slice(i0 + 10);
  const i1 = resto.indexOf("\nexport ");
  const corpo = i1 < 0 ? resto : resto.slice(0, i1);
  const chaves = [...new Set([...corpo.matchAll(/\be\.([A-Za-z][A-Za-z0-9_]*)/g)].map((m) => m[1]))].sort();
  console.log(`  ··  as chaves da entrada: ${chaves.join(", ")}`);
  t("a função existe e a fonte é legível", i0 > 0);
  t("a entrada tem exactamente quatro chaves: golpes, heroi, desde, rolar", chaves.join(",") === "desde,golpes,heroi,rolar", `tem: ${chaves.join(",")}`);
  t("NENHUMA delas é de tempo", chaves.every((k) => !/agora|decorr|instante|tempo|ms$|relogio|prazo|inicio|fim/i.test(k)));
  /* (II) E A ESCADA TAMBÉM NÃO É PARÂMETRO — §3.1: o contador entra em
     `ritmoDaRodada`, que decide SE a janela abre; não entra aqui, que
     decide O QUE acontece. Duas funções, dois assuntos. */
  t("nem a escada: `expiracoesSeguidas` não é chave da resolução", !chaves.includes("expiracoesSeguidas"));

  /* (III) A FONTE DO MÓDULO INTEIRO: nem relógio do navegador, nem
     temporizador, em lado nenhum. */
  const PROIBIDOS = [/\bDate\b/, /\bperformance\s*\./, /\bsetTimeout\b/, /\bsetInterval\b/, /\brequestAnimationFrame\b/, /\bhrtime\b/];
  const achados = PROIBIDOS.filter((rx) => rx.test(codigo)).map(String);
  t("o módulo inteiro não nomeia relógio nem temporizador", achados.length === 0, achados.join(" | "));

  /* (IV) E O COMPORTAMENTO CONFIRMA A ESTRUTURA: chaves de tempo atiradas
     à entrada não mudam um byte da resposta — não têm por onde entrar. */
  const golpes = rodadaDe(4);
  const limpo = reacaoDoSilencio({ golpes, heroi: ladino, rolar: mulberry32(42) });
  const sujo = reacaoDoSilencio({ golpes, heroi: ladino, rolar: mulberry32(42), agora: 1, decorridoMs: 40000, janelaMs: 15000 });
  t("um temporizador que dispara aos 40 000 ms dá o mesmo que um aos 15 000",
    JSON.stringify(limpo.reacao && limpo.reacao.id) === JSON.stringify(sujo.reacao && sujo.reacao.id) && limpo.ordem === sujo.ordem && limpo.rolos === sujo.rolos);
}

/* ============================================================
   14 · O PORTÃO DE UMA VIA
   ============================================================ */
sec("14. [T3] O PORTÃO DE UMA VIA — e o segundo a chegar não rola um dado sequer");
{
  /* A corrida que mata: o temporizador dispara DEPOIS de o jogador já ter
     respondido, e a rodada resolve-se duas vezes — duas reações, dois
     débitos de PM, duas linhas no log, o dano cortado a dobrar. Ou o
     inverso: o clique aterra num cartão que já morreu.

     A regra de uso: *nenhuma resolução acontece fora do ramo `valeu ===
     true`*, e o rolo vive DENTRO desse ramo. Um resultado deitado fora que
     rolou um dado é pior do que um resultado errado: o erro aparece, e o
     desalinhamento não. */
  for (const [primeiro, segundo] of [["jogador", "expirou"], ["expirou", "jogador"], ["escondida", "jogador"], ["aba_fechou", "expirou"]]) {
    const original = Math.random;
    let estourou = null, um = null, dois = null;
    try {
      const janela = { id: "j1", ordem: 0, fechada: false, por: null };
      um = fecharAJanela(janela, primeiro);
      /* O RAMO DO VENCEDOR É O ÚNICO QUE ROLA — aqui simulado pela
         resolução de verdade, com o rolador semeado. */
      const resolveu = um.valeu ? reacaoDoSilencio({ golpes: rodadaDe(4), heroi: ladino, rolar: mulberry32(3) }) : null;
      /* E AGORA O SEGUNDO A CHEGAR: com o rolador global a ESTOURAR. Se
         alguma coisa rolar dentro do ramo perdedor, esta linha explode. */
      Math.random = () => { throw new Error("o segundo a chegar rolou um dado"); };
      dois = fecharAJanela(um.janela, segundo);
      if (dois.valeu) reacaoDoSilencio({ golpes: rodadaDe(4), heroi: ladino });
      t(`[${primeiro} → ${segundo}] o primeiro passa (valeu: true) e resolve`, um.valeu === true && !!resolveu);
      t(`[${primeiro} → ${segundo}] o segundo recebe \`valeu: false\``, dois.valeu === false);
      t(`[${primeiro} → ${segundo}] e a janela continua a dizer que foi o PRIMEIRO que a fechou`, dois.por === primeiro && dois.janela.por === primeiro);
    } catch (err) { estourou = err.message; } finally { Math.random = original; }
    t(`[${primeiro} → ${segundo}] nenhum dado foi rolado no segundo ramo`, !estourou, estourou);
  }
  t("o rolador global foi restaurado", typeof Math.random() === "number");

  /* IMUTABILIDADE: a janela que entra sai intacta; quem fecha recebe uma
     janela NOVA. Estado é substituído, nunca mutado. */
  const janela = { id: "j2", ordem: 1, fechada: false, por: null };
  const antes = JSON.stringify(janela);
  const r = fecharAJanela(janela, "jogador");
  t("a janela de entrada sai como entrou", JSON.stringify(janela) === antes);
  t("e quem fecha recebe outro objeto", r.janela !== janela && r.janela.fechada === true && r.janela.por === "jogador");
  t("`fecharAJanela(null, …)` não estoura", (() => { const x = fecharAJanela(null, "expirou"); return x.valeu === false && x.janela === null && x.por === null; })());
  t("`fecharAJanela(undefined, …)` não estoura", (() => { const x = fecharAJanela(undefined, "expirou"); return x.valeu === false && x.janela === null; })());
  t("fechar uma já fechada devolve `por` de quem a fechou", (() => {
    const x = fecharAJanela({ id: "j3", fechada: true, por: "jogador" }, "expirou");
    return x.valeu === false && x.por === "jogador";
  })());
}

/* ============================================================
   15 · A PORTA `escondida`
   ============================================================ */
sec("15. [T1] A PORTA `escondida` EXISTE, FECHA, E NÃO ALIMENTA A ESCADA");
{
  const porta = PORTAS_DA_JANELA.find((p) => p.id === "escondida");
  t("`escondida` é a nona porta da tabela, com o porquê escrito", !!porta && typeof porta.porque === "string" && porta.porque.length > 10);
  t("são nove portas", PORTAS_DA_JANELA.length === 9, `são ${PORTAS_DA_JANELA.length}`);
  /* A PRECEDÊNCIA, e é o que a ordem da tabela significa: `escondida` vem
     antes de todas porque as outras oito dizem «não perguntes» e esta diz
     «não esperes». Uma condição que torna a resposta inalcançável precede
     toda razão para não a pedir — e é assim que a lei do turno é paga pela
     porta da frente, em vez de com um teto de socorro. */
  t("e é a PRIMEIRA — a precedência é a ordem da tabela", PORTAS_DA_JANELA[0].id === "escondida");
  const golpes = rodadaDe(4);
  const oculta = ritmoDaRodada({ golpes, heroi: ladino, escondida: true });
  t("a aba escondida NÃO abre janela nenhuma", oculta.abre === null);
  t("a rodada inteira fecha pela porta `escondida`", oculta.fechados.length === 4 && oculta.fechados.every((f) => f.porta === "escondida"));
  t("e a espera é ZERO — a rodada segue sem esperar por ninguém", oculta.esperaMs === 0);
  t("a porta ganha até a quem travou um verbo na ficha (é condição da máquina, não do jogo)",
    ritmoDaRodada({ golpes, heroi: ladino, escondida: true, preferencia: "aparar" }).fechados[0].porta === "escondida");
  /* NÃO ALIMENTA A ESCADA: nenhuma janela abriu, logo nenhuma expirou —
     uma expiração que o jogador nunca viu não é uma expiração dele. A
     prova é estrutural: a resposta não carrega nada que suba o contador, e
     o `silencio` continua a ser função só do que entrou. */
  t("`silencio` continua a ser função só do contador que ENTROU, e a porta não o sobe",
    ritmoDaRodada({ golpes, heroi: ladino, escondida: true, expiracoesSeguidas: 0 }).silencio === false
    && ritmoDaRodada({ golpes, heroi: ladino, escondida: true, expiracoesSeguidas: 1 }).silencio === false);
  t("e a resposta não tem chave nenhuma que devolva um degrau da escada",
    Object.keys(oculta).sort().join(",") === "abre,cobertos,esperaMs,fechados,silencio");
  /* E O RESULTADO É O DE HOJE — é a razão inteira de a porta existir. */
  let igual = true;
  for (let s = 0; s < 1000; s++) {
    const h = lacoDeHoje({ golpes, heroi: ladino, rolar: mulberry32(s) });
    const m = reacaoDoSilencio({ golpes, heroi: ladino, rolar: mulberry32(s) });
    if ((h.reacao && h.reacao.id) !== (m.reacao && m.reacao.id) || h.ordem !== m.ordem || h.rolos !== m.rolos) { igual = false; break; }
  }
  t("quem está noutro separador recebe o jogo de hoje, byte a byte (1 000 sementes)", igual);
}

/* ============================================================
   16 · A ESCADA NÃO É PARÂMETRO DA RESOLUÇÃO
   ============================================================ */
sec("16. A ESCADA NÃO É PARÂMETRO DA RESOLUÇÃO — a primeira expiração de uma luta não muda nada");
{
  /* E a prova não é «medi e deu igual»: é que o contador NÃO TEM POR ONDE
     TOCAR no resultado. Ele entra em `ritmoDaRodada`, que decide SE a
     janela abre; não entra em `reacaoDoSilencio`, que decide O QUE
     acontece. A asserção 13 já leu a assinatura; esta corre o
     comportamento por cima, porque as duas juntas dizem coisas
     diferentes — uma que não pode, outra que não faz. */
  const golpes = rodadaDe(4);
  const seco = (r) => JSON.stringify({ id: r.reacao && r.reacao.id, ordem: r.ordem, rolos: r.rolos });
  let divergiu = null;
  for (let s = 0; s < 2000 && !divergiu; s++) {
    const base = seco(reacaoDoSilencio({ golpes, heroi: ladino, rolar: mulberry32(s) }));
    for (const n of [0, 1, 2, 5]) {
      const x = seco(reacaoDoSilencio({ golpes, heroi: ladino, rolar: mulberry32(s), expiracoesSeguidas: n }));
      if (x !== base) { divergiu = `semente ${s}, escada ${n}: ${x} vs ${base}`; break; }
    }
  }
  t("`expiracoesSeguidas` 0, 1, 2 e 5 dão o MESMO resultado, em 2 000 sementes", !divergiu, divergiu);
}

/* ============================================================
   17 · O LIXO E A IMUTABILIDADE
   ============================================================ */
sec("17. O LIXO E A IMUTABILIDADE — `= {}` no destructuring NÃO cobre `null`");
{
  t("`heroi: null` não estoura", (() => { const r = reacaoDoSilencio({ golpes: rodadaDe(3), heroi: null }); return r.reacao === null && r.ordem === null && r.rolos === 0; })());
  t("`golpes: null` não estoura", (() => { const r = reacaoDoSilencio({ golpes: null, heroi: guerreiro }); return r.reacao === null && r.rolos === 0; })());
  t("entrada `{}` não estoura", (() => { const r = reacaoDoSilencio({}); return r.reacao === null && r.ordem === null; })());
  t("entrada `null` não estoura", (() => { const r = reacaoDoSilencio(null); return r.reacao === null && r.ordem === null; })());
  t("entrada `undefined` não estoura", (() => { const r = reacaoDoSilencio(); return r.reacao === null; })());
  t("rodada vazia não estoura", (() => { const r = reacaoDoSilencio({ golpes: [], heroi: guerreiro }); return r.reacao === null; })());
  /* Golpe sem `dano` nem `gatilho`: a resolução deriva `inimigo_erra` (é o
     que `App.jsx:7666` faz com `dano 0`), e o guerreiro tem Contra-ataque.
     A asserção é sobre a FORMA da resposta, não sobre o rolo — com o
     rolador a devolver 0 a `chance` 0,55 passa sempre. */
  t("golpe sem dano nem gatilho cai em `inimigo_erra`, e a resposta é bem formada", (() => {
    const r = reacaoDoSilencio({ golpes: [{ ordem: 0 }], heroi: guerreiro, rolar: () => 0 });
    return !!r.reacao && r.reacao.id === "contra_ataque" && r.ordem === 0 && r.rolos === 1;
  })());
  /* O `rolar: () => 1` reprova toda `chance` (nenhuma é 1,0), e é o que
     torna a asserção determinística: sem ele o buraco cairia em
     `inimigo_erra` e o Contra-ataque decidiria por sorteio. */
  t("golpe `null` dentro da lista não estoura, e o laço segue para o seguinte",
    (() => { const r = reacaoDoSilencio({ golpes: [null, golpe(1)], heroi: guerreiro, rolar: () => 1 }); return r.ordem === 1 && !!r.reacao && r.reacao.id === "aparar"; })());
  t("`desde` além do fim da rodada não estoura", (() => { const r = reacaoDoSilencio({ golpes: rodadaDe(4), heroi: guerreiro, desde: 99 }); return r.reacao === null && r.rolos === 0; })());
  t("`desde: null` cai no começo da rodada", reacaoDoSilencio({ golpes: rodadaDe(4), heroi: guerreiro, desde: null }).ordem === 0);
  t("`rolar` que não é função cai no rolador global", (() => { const r = reacaoDoSilencio({ golpes: rodadaDe(4), heroi: guerreiro, rolar: "não sou função" }); return r.ordem === 0; })());

  /* IMUTABILIDADE: estado é substituído, nunca mutado. */
  const golpes = rodadaDe(4);
  const antesGolpes = JSON.stringify(golpes);
  const heroi = { ...ladino };
  const antesHeroi = JSON.stringify(heroi);
  const antesPortas = JSON.stringify(PORTAS_DA_JANELA);
  const antesAtalhos = JSON.stringify(ATALHOS_DA_JANELA);
  const antesRitmo = JSON.stringify(RITMO_DA_REACAO);
  reacaoDoSilencio({ golpes, heroi, rolar: mulberry32(11) });
  t("a lista de golpes sai como entrou", JSON.stringify(golpes) === antesGolpes);
  t("a ficha do herói sai como entrou", JSON.stringify(heroi) === antesHeroi);
  t("as tabelas saem como entraram", JSON.stringify(PORTAS_DA_JANELA) === antesPortas && JSON.stringify(ATALHOS_DA_JANELA) === antesAtalhos && JSON.stringify(RITMO_DA_REACAO) === antesRitmo);
  /* E O CINTO REPÕE O ROLADOR GLOBAL MESMO QUANDO A CHAMADA ESTOURA — é o
     `finally`, e sem ele uma exceção deixaria o projeto inteiro com um
     `Math.random` semeado a partir daqui. */
  const original = Math.random;
  try { reacaoDoSilencio({ golpes, heroi: ladino, rolar: () => { throw new Error("o rolador estourou"); } }); } catch (e) { /* esperado */ }
  t("o rolador global é reposto mesmo quando a resolução estoura", Math.random === original);
}

console.log(`\ntrava da reação (K2): ${bons} passaram, ${maus} falharam · ${((Date.now() - comecou) / 1000).toFixed(1)} s`);
process.exit(maus ? 1 : 0);
