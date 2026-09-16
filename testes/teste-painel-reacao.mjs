/* O CARTÃO DA REAÇÃO (K3) — a prosa, o preço e a folha que o desenham

   Esta suíte não toca em React: o componente (`painel-reacao.jsx`) é
   tela, e tela se olha, não se prova em Node (`CLAUDE.md`). O que se
   prova aqui é o que o componente LÊ — `palavras-da-reacao.js` (a
   gramática e o preço), `ritmo-da-reacao.js` (`TEMPOS_DO_CARTAO`) e
   `estilo.js` (as sete classes e o anel de foco) — porque é aí que um
   número copiado ou uma frase fora da gramática mentiria em silêncio.
*/

const RAIZ = "../src/";
const P = await import(RAIZ + "palavras-da-reacao.js");
const {
  PALAVRAS_DA_RESOLUCAO, PALAVRAS_DO_RECUO, PALAVRAS_SEM_GESTO, PALAVRAS_DO_NADA,
  LINHAS_DO_CARTAO, PALAVRAS_DA_CHANCE, PALAVRAS_DO_CORTE, AVISO_DO_SILENCIO,
  falaDaResolucao, precoDoVerbo, numeroDaResolucao,
} = P;
const { REACOES } = await import(RAIZ + "reacoes.js");
const { TEMPOS_DO_CARTAO, temRelogio, janelaExpirouEm } = await import(RAIZ + "ritmo-da-reacao.js");
const { readFileSync } = await import("node:fs");
const { MOVIMENTO_CSS, SUPERFICIES_CSS } = await import(RAIZ + "estilo.js");

let bons = 0, maus = 0;
const t = (nome, cond, extra) => { if (cond) { bons++; console.log("  ok  " + nome); } else { maus++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* ============================================================
   1 · A GRAMÁTICA, POR CATRACA (mente/k3-jogo.md §1.1)

   "respondeu" e "expirou" diferem em QUEM agiu, não em SE agiu — e essa
   diferença tem de caber numa regra de duas pontas, senão vira "o
   sistema fala de si mesmo" na primeira frase nova que alguém escrever
   a meio de um JSX.
   ============================================================ */
sec("1. A gramática: 'você ' na frente, ' por você' atrás");
{
  for (const l of PALAVRAS_DA_RESOLUCAO) {
    t(`${l.id}.voce começa por "você "`, l.voce.startsWith("você "), JSON.stringify(l.voce));
    t(`${l.id}.instinto termina em " por você"`, l.instinto.endsWith(" por você"), JSON.stringify(l.instinto));
  }
  for (const l of PALAVRAS_SEM_GESTO) {
    t(`sem_gesto/${l.id}.voce começa por "você "`, l.voce.startsWith("você "), JSON.stringify(l.voce));
  }
}

/* ============================================================
   2 · COBERTURA — quem tem gatilho tem linha, quem não abre janela não tem
   ============================================================ */
sec("2. Cobertura: sofre_dano e inimigo_erra têm linha; inimigo_cai não");
{
  const porId = (id) => PALAVRAS_DA_RESOLUCAO.find((l) => l.id === id) || null;
  for (const r of REACOES) {
    if (r.gatilho === "sofre_dano" || r.gatilho === "inimigo_erra") {
      t(`${r.id} (${r.gatilho}) tem linha em PALAVRAS_DA_RESOLUCAO`, !!porId(r.id));
    }
  }
  /* `oportunidade` NÃO tem linha, e o porquê é de regra, não de esquecimento:
     `inimigo_cai` não abre janela (K1 §6) — a reação nunca chega a um
     cartão, e uma linha aqui seria export morto no dia em que nascesse. */
  t("oportunidade (inimigo_cai) NÃO tem linha — inimigo_cai não abre janela, a reação nunca chega ao cartão",
    !porId("oportunidade"));
}

/* ============================================================
   3 · falaDaResolucao — as quatro saídas × os dois gatilhos
   ============================================================ */
sec("3. falaDaResolucao: string não-vazia nas quatro saídas");
{
  const casos = [
    { saida: "respondeu", reacaoId: "aparar" },
    { saida: "respondeu", reacaoId: "contra_ataque" },
    { saida: "expirou", reacaoId: "aparar" },
    { saida: "expirou", reacaoId: "contra_ataque" },
    { saida: "sem_gesto", reacaoId: "esquiva_agil" },
    { saida: "sem_gesto", reacaoId: "contra_ataque" },
  ];
  for (const c of casos) {
    const s = falaDaResolucao(c);
    t(`${c.saida}/${c.reacaoId} devolve string não-vazia`, typeof s === "string" && s.length > 0, JSON.stringify(s));
  }

  const recusouDano = falaDaResolucao({ saida: "recusou", gatilho: "sofre_dano" });
  const recusouErra = falaDaResolucao({ saida: "recusou", gatilho: "inimigo_erra" });
  t("recusou/sofre_dano sai de PALAVRAS_DO_RECUO pelo gatilho certo",
    recusouDano === PALAVRAS_DO_RECUO.find((p) => p.gatilho === "sofre_dano").frase);
  t("recusou/inimigo_erra sai de PALAVRAS_DO_RECUO pelo gatilho certo",
    recusouErra === PALAVRAS_DO_RECUO.find((p) => p.gatilho === "inimigo_erra").frase);
  /* as duas têm de ser DIFERENTES — dizer "você deixou o golpe passar"
     quando o inimigo errou seria a interface a mentir sobre a mecânica
     (não havia golpe nenhum a passar). É o achado de K3 §1.3. */
  t("recusou/sofre_dano e recusou/inimigo_erra são frases diferentes", recusouDano !== recusouErra,
    `as duas: ${JSON.stringify(recusouDano)} / ${JSON.stringify(recusouErra)}`);
}

/* ============================================================
   4 · precoDoVerbo — o orçamento de 40 caracteres, e nenhum dano
   ============================================================ */
sec("4. precoDoVerbo: cabe em 40 caracteres, mantém acento, nunca mostra dano");
{
  /* O orçamento de 40 caracteres é contrato só para quem PODE chegar a
     um cartão — `sofre_dano`/`inimigo_erra`. `oportunidade`
     (`inimigo_cai`) nunca abre janela (K1 §6): medir o orçamento nela
     rejeitaria o próprio nome de exibição por um limite que ela nunca
     precisa de cumprir na tela. */
  const podeChegarAoCartao = (r) => r.gatilho === "sofre_dano" || r.gatilho === "inimigo_erra";
  for (const r of REACOES) {
    const preco = precoDoVerbo(r);
    if (podeChegarAoCartao(r)) {
      /* A forma é a de `formas.md:896` — "0 PM — ", com espaço antes E
         depois do PM e o travessão espaçado dos dois lados — e ela NUNCA
         se comprime para caber no orçamento (esse era o defeito: a
         compressão corria sempre, para as cinco, quando só uma
         precisava). Quem estoura os 40 tem de encurtar a PALAVRA em
         `PALAVRAS_DO_CORTE`, nunca o espaço em branco daqui — por isso a
         catraca cobre as duas coisas juntas, no mesmo teste. */
      t(`${r.id}: precoDoVerbo usa a forma canónica " PM — ", nunca comprimida`,
        / \d+ PM — /.test(preco), `"${preco}"`);
      t(`${r.id}: precoDoVerbo cabe em 40 caracteres COM a forma canónica`, preco.length <= 40, `"${preco}" (${preco.length})`);
    } else {
      console.log(`  ··  ${r.id} (gatilho ${r.gatilho}) fora do orçamento de propósito — nunca chega a um cartão: "${preco}" (${preco.length})`);
    }
    /* nunca um algarismo de dano — só o PM. O único dígito que
       precoDoVerbo tem permissão de escrever é `reacao.pm`; testamos
       isso apagando exatamente esse número da string e conferindo que
       não sobra nenhum outro dígito. */
    const semOPm = preco.replace(String(r.pm || 0), "");
    t(`${r.id}: nenhum algarismo de dano sobrevive além do PM`, !/\d/.test(semOPm), `"${preco}"`);
  }
  /* O acento e o hífen sobrevivem — a peça mais visitada da fase não
     pode ser a única sem acento do jogo em português. */
  t("escudo_arcano usa o nome de exibição, não o id", precoDoVerbo(REACOES.find((r) => r.id === "escudo_arcano")).startsWith("escudo arcano"));
  t("esquiva_agil preserva o acento de 'ágil'", precoDoVerbo(REACOES.find((r) => r.id === "esquiva_agil")).includes("ágil"));
  t("contra_ataque preserva o hífen de 'contra-ataque'", precoDoVerbo(REACOES.find((r) => r.id === "contra_ataque")).includes("contra-ataque"));
}

/* ============================================================
   5 · O ESPELHO DOS 140 MS — duas cópias, uma suíte a prová-las iguais
      (o mesmo padrão que a casa já usa para PISO_DO_GOLPE)
   ============================================================ */
sec("5. O espelho dos 140ms: .tv-janela-sai e TEMPOS_DO_CARTAO.saiMs concordam");
{
  t("MOVIMENTO_CSS escreve 'tvSomeSo 140ms' para .tv-janela-sai",
    /\.tv-janela-sai\s*\{[^}]*tvSomeSo\s+140ms/.test(MOVIMENTO_CSS));
  t("TEMPOS_DO_CARTAO.saiMs === 140", TEMPOS_DO_CARTAO.saiMs === 140);
}

/* ============================================================
   6 · AS SETE CLASSES — existem, e o prefers-reduced-motion as cobre
   ============================================================ */
sec("6. As sete classes da janela, e a saída de cada uma");
{
  const SETE = ["tv-chamado-entra", "tv-leque-abre", "tv-trilho-entra", "tv-resolve", "tv-janela-tempo", "tv-trilho-sai", "tv-janela-sai"];
  const iMedia = MOVIMENTO_CSS.indexOf("@media (prefers-reduced-motion");
  t("MOVIMENTO_CSS tem um @media (prefers-reduced-motion)", iMedia > 0);
  const antes = iMedia < 0 ? MOVIMENTO_CSS : MOVIMENTO_CSS.slice(0, iMedia);
  const dentro = iMedia < 0 ? "" : MOVIMENTO_CSS.slice(iMedia);
  for (const c of SETE) {
    t(`.${c} existe ANTES do @media (senão D5c mede vazio — k3-desenho.md §1.1)`,
      new RegExp(`\\.${c}(\\s*[,{]|\\s*,)`).test(antes));
    t(`.${c} está coberta pelo @media (prefers-reduced-motion)`,
      new RegExp(`\\.${c}\\b`).test(dentro));
  }
  /* A EXCEÇÃO QUE É LEI (K1, K3 §1.2): .tv-janela-tempo não pode pousar
     em `animation: none` sozinho — congelaria o cheio em scaleX(1), uma
     barra CHEIA e parada, a pior mentira possível sobre o tempo. A
     saída certa é VIRAR CONTAGEM: scaleX(0). */
  const regraJanelaTempo = (dentro.match(/\.tv-janela-tempo\s*\{([^}]*)\}/) || [])[1] || "";
  t(".tv-janela-tempo pousa em scaleX(0), nunca em animation: none sozinho",
    /scaleX\(0\)/.test(regraJanelaTempo) && /animation:\s*none/.test(regraJanelaTempo));
}

/* ============================================================
   7 · NENHUM PÍXEL, NENHUMA DURAÇÃO DO RELÓGIO DA REAÇÃO NA FOLHA
      (K3 §1.4/§1.5: o trilho é proporção, e a duração sai da tabela do
      `jogo` — um número copiado para a folha não muda no dia em que a
      janela mudar, e aí a barra mente)
   ============================================================ */
sec("7. Nenhum píxel no trilho; nenhuma duração do relógio copiada");
{
  const blocoDoTrilho = (MOVIMENTO_CSS.match(/\.tv-janela-tempo\s*\{[^}]*\}/g) || []).join("\n");
  t("a declaração do trilho não tem nenhum número de píxeis", !/\d+\s*px/.test(blocoDoTrilho), blocoDoTrilho);

  /* as cinco durações do relógio da reação — se qualquer uma aparecer
     escrita na folha (em vez de lida de RITMO_DA_REACAO/TETO_DA_ESPERA
     em tempo de execução), a barra para de ser uma leitura do relógio e
     vira uma cópia dele. `TEMPOS_DO_CARTAO` fica de fora de propósito
     (k3-desenho.md §1.7): os 140ms de `.tv-janela-sai` são número DA
     FOLHA, não do sistema, e não contam aqui. */
  /* `(?<![\d.])…(?!\d)` isola o número por inteiro: sem isto, "4s" acha
     um falso positivo dentro de "2.4s" (`.tv-reliquia`, que é ritmo de
     brilho, não relógio de reação) — o ponto decimal não é fronteira de
     palavra para o `\b` do regex, e um dente que mede o vazio (ou o
     errado) é pior que dente nenhum. */
  for (const ms of [4000, 11000, 15000, 16600, 33200]) {
    const s = ms / 1000;
    const rxMs = new RegExp(`(?<![\\d.])${ms}\\s*ms(?!\\d)`);
    const rxS = new RegExp(`(?<![\\d.])${s}\\s*s(?!\\d)`);
    t(`MOVIMENTO_CSS não escreve ${ms}ms/${s}s do relógio da reação`,
      !rxMs.test(MOVIMENTO_CSS) && !rxS.test(MOVIMENTO_CSS));
  }
}

/* ============================================================
   8 · O ANEL DE FOCO — box-shadow, nunca border; e o forced-colors
   ============================================================ */
sec("8. O anel de foco: box-shadow, nunca border; forced-colors existe");
{
  const regraAnel = (SUPERFICIES_CSS.match(/\.tv-anel-foco:focus-visible\s*\{([^}]*)\}/) || [])[1] || "";
  t(".tv-anel-foco:focus-visible existe em SUPERFICIES_CSS", regraAnel.length > 0);
  t(".tv-anel-foco usa box-shadow", /box-shadow\s*:/.test(regraAnel));
  /* nunca `border` — um border de 2px ocupa leiaute e empurra os irmãos
     (a fila de pílulas da ficha mexia-se quando o foco entrasse). */
  t(".tv-anel-foco nunca usa border", !/\bborder\s*:/.test(regraAnel));
  t("existe o bloco @media (forced-colors: active) para o anel",
    /@media\s*\(forced-colors:\s*active\)\s*\{[^}]*\.tv-anel-foco/.test(SUPERFICIES_CSS));
}

/* ============================================================
   9 · PALAVRAS_DA_CHANCE — as quatro faixas cobrem [0,1], sem vão nem
      sobreposição, e a direção da frase é sempre a do sucesso
   ============================================================ */
sec("9. PALAVRAS_DA_CHANCE: cobertura de [0,1] e a mesma direção sempre");
{
  const pisos = [...PALAVRAS_DA_CHANCE].map((f) => f.piso).sort((a, b) => a - b);
  t("a faixa mais baixa começa em 0 — sem vão perto do piso", pisos[0] === 0);
  t("a faixa mais alta chega a 1 (o piso mais alto é ≤ 1 e cobre até lá)", Math.max(...pisos) <= 1 && Math.max(...pisos) >= 0.7);

  /* cobertura real: TODO ponto de [0,1] (amostrado de 0,01 em 0,01)
     tem exatamente UMA faixa que o alcança — a de maior piso que ainda
     é ≤ ao valor. Sem vão = todo ponto acha uma faixa; sem
     sobreposição = a escolha (maior piso ≤ valor) é sempre única por
     construção de `Math.max`, então o que resta provar é que ela nunca
     falha em achar nenhuma. */
  let semFaixa = 0;
  for (let v = 0; v <= 100; v++) {
    const chance = v / 100;
    const achou = [...PALAVRAS_DA_CHANCE].filter((f) => chance >= f.piso).sort((a, b) => b.piso - a.piso)[0];
    if (!achou) semFaixa++;
  }
  t("todo valor de [0,1] (101 amostras) acha uma faixa — sem vão", semFaixa === 0, `${semFaixa} valores sem faixa`);

  /* a direção: sempre o que acontece quando DÁ CERTO. As palavras
     proibidas são as que descrevem o FRACASSO ("falha", "erra") — não
     "não" sozinho, porque "mais vezes que não" (a própria faixa de
     formas.md:1083, transcrita byte a byte) é a forma idiomática de
     dizer "mais da metade das vezes", e continua a falar do sucesso.
     Banir "não" à letra rejeitaria a tabela que a suíte existe para
     proteger — por isso o dente mede o vocabulário do fracasso, não
     uma sílaba isolada. */
  for (const f of PALAVRAS_DA_CHANCE) {
    for (const campo of ["curta", "longa"]) {
      const s = f[campo].toLowerCase();
      t(`faixa piso=${f.piso}.${campo} não fala de fracasso ("falha"/"erra")`,
        !s.includes("falha") && !s.includes("erra"), JSON.stringify(f[campo]));
    }
  }
}

/* ============================================================
   10 · O RITMO `parado` NÃO TEM RELÓGIO — a pílula de WCAG 2.2.1 não
      pode resolver a pergunta sozinha no primeiro frame

      Bug real, achado pelo `oficial` a correr o cartão: uma checagem de
      "já nasceu vencida?" sem passar por `temRelogio` primeiro acha
      `0 >= 0` verdadeiro na hora — a janela `parado` (janelaMs: 0)
      expirava sozinha, e ainda contava como uma expiração vista pelo
      jogador. `temRelogio`/`janelaExpirouEm` (`ritmo-da-reacao.js`) são
      a MESMA leitura que `painel-reacao.jsx` usa; aqui prova-se a
      leitura em si, e uma segunda asserção confere que o arquivo do
      componente chama a função em vez de reimplementar a conta solta —
      é exatamente essa reimplementação solta que causou o bug.
   ============================================================ */
sec("10. O ritmo `parado`: sem relógio, nunca expira sozinho");
{
  const parado = { janelaMs: 0, folgaMs: 0, trilhoMs: 0, apertoMs: 0 };
  const normal = { janelaMs: 15000, folgaMs: 11000, trilhoMs: 4000, apertoMs: 1000 };
  t("parado (janelaMs=0) não tem relógio", !temRelogio(parado));
  t("normal (janelaMs=15000) tem relógio", temRelogio(normal));
  t("parado nunca 'expira', nem no instante 0", !janelaExpirouEm(parado, 0));
  t("parado nunca 'expira', nem muito depois (1 hora)", !janelaExpirouEm(parado, 3600000),
    "uma oferta sem relógio não pode ser vencida pelo relógio de parede");
  t("normal expira em 0ms decorridos quando já passou da janela", janelaExpirouEm(normal, 15000));
  t("normal NÃO expira 1ms antes do fim", !janelaExpirouEm(normal, 14999));
  t("oferta null/undefined não tem relógio nem expira (guarda contra null)", !temRelogio(null) && !janelaExpirouEm(undefined, 999999));

  /* A catraca de reimplementação: o defeito nasceu de um `if` solto
     comparando `Date.now() - t0` direto contra `oferta.janelaMs` sem
     passar pela função. Se essa forma voltar a aparecer no arquivo do
     componente, é o mesmo bug renascendo por outra porta. */
  const fonte = readFileSync("../src/painel-reacao.jsx", "utf8");
  t("painel-reacao.jsx chama janelaExpirouEm — não reimplementa a comparação solta",
    fonte.includes("janelaExpirouEm(oferta"),
    "a checagem de 'já nasceu vencida' tem de passar pela função da tabela, nunca por >= oferta.janelaMs a seco");
  t("painel-reacao.jsx não compara 'Date.now() - t0 >= oferta.janelaMs' a seco (o bug original)",
    !/passouAoNascer\s*>=\s*oferta\.janelaMs/.test(fonte) && !/Date\.now\(\)\s*-\s*t0\s*>=\s*oferta\.janelaMs/.test(fonte));
}

/* ============================================================
   11 · numeroDaResolucao — as sete linhas de mente/k3-jogo.md §1.4
   ============================================================ */
sec("11. numeroDaResolucao: as sete linhas do quadro, tabela e não fiação");
{
  t("sofre_dano, corte parcial: '4 evitado · 9 vira 5'",
    numeroDaResolucao({ gatilho: "sofre_dano", cortou: 4, dano: 9, danoFinal: 5 }) === "4 evitado · 9 vira 5");
  t("sofre_dano, corte total (cortou >= dano): 'o golpe não te acerta · 9 vira 0'",
    numeroDaResolucao({ gatilho: "sofre_dano", cortou: 9, dano: 9, danoFinal: 0 }) === "o golpe não te acerta · 9 vira 0");
  t("sofre_dano, com PM: acrescenta '· −2 PM' sem tocar no resto",
    numeroDaResolucao({ gatilho: "sofre_dano", cortou: 4, dano: 9, danoFinal: 5, pm: 2 }) === "4 evitado · 9 vira 5 · −2 PM");
  t("inimigo_erra, revide acertou: 'revide em Ogro · 6 de dano'",
    numeroDaResolucao({ gatilho: "inimigo_erra", alvoContra: "Ogro", acertou: true, danoFinal: 6 }) === "revide em Ogro · 6 de dano");
  t("inimigo_erra, revide errou: 'revide em Ogro · errou'",
    numeroDaResolucao({ gatilho: "inimigo_erra", alvoContra: "Ogro", acertou: false }) === "revide em Ogro · errou");
  t("recusou (sofre_dano, sem corte): '9 inteiros'",
    numeroDaResolucao({ gatilho: "sofre_dano", cortou: 0, dano: 9 }) === "9 inteiros");
  t("recusou (inimigo_erra, sem revide): 'a guarda fechou'",
    numeroDaResolucao({ gatilho: "inimigo_erra", acertou: null }) === "a guarda fechou");

  /* nunca um `if` de saída à parte: a função só olha os NÚMEROS
     (`cortou`, `acertou`) — é o que a torna tabela e não mecanismo. Uma
     chamada sem nada (guarda de `null`) não deve estourar. */
  t("numeroDaResolucao(undefined) não estoura e devolve string", typeof numeroDaResolucao() === "string");
}

console.log(`\n${bons} ok · ${maus} falhas`);
process.exit(maus ? 1 : 0);
