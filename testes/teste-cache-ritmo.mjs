/* O CACHE QUE VIVE O SEU CICLO (o caminho A do custo, 20/10)

   A pessoa decidiu (mente/pauta.md, "A foto do estado fica para perto de
   janeiro"): fazer só o ajuste sem risco do cache — QUANDO ele se grava —
   e deixar o conteúdo do pedido exatamente como está.

   A conta (scratchpad cacheA, a janela e os preços reais contra a
   programação dinâmica que sabe o futuro) disse duas coisas, e esta suíte
   guarda as duas:
     1. a régua do rabo (6.000 tokens) e a do corte (v9.473) já estão no
        ótimo — nenhuma decisão de "escrever" muda aqui;
     2. o que sobrava era o relógio: o cache de 30 min morria a meio do
        ciclo de quem joga devagar, e o prefixo inteiro voltava a ser
        escrito a preço cheio só porque o tempo passou. Agora o cache nasce
        com a vida do ciclo dele, ao ritmo medido pela ficha, entre o piso
        (o de sempre) e o teto (uma hora). */
const J = await import("../src/janela.js");
const C = await import("../src/custo.js");

let bons = 0, maus = 0;
const t = (n, c, extra = "") => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const T = J.CACHE_EXPLICITO;
const MOD = "gemini-3.8-flash";
const TETO = J.JANELA_MIN + J.SALTO_DA_ANCORA - 1;

sec("1. A TABELA");
t("o piso é o ttl de sempre (30 min)", T.ttlSegundos === 1800);
t("o teto é uma hora", T.ttlMaxSegundos === 3600);
t("a folga do ritmo é tabela", T.folgaDoRitmo === 1.25);
t("e a régua do rabo não mudou (a conta disse que está no ótimo)", T.raboMaxTokens === 6000 && T.mensagensPorTurno === 2);

/* uma conversa da 12.ª: o system a 14.155 tokens, ~480 caracteres por mensagem */
const SYS = "S".repeat(Math.round(14155 * T.charsPorToken));
const m = (role, i) => ({ role, content: `${role} ${i} ` + "x".repeat(470) });
const janelaDe = (turno) => { let h = [m("user", 0)]; for (let k = 1; k <= turno; k++) h = [...h, m("assistant", k), m("user", k)]; return J.janelaAncorada(h); };

sec("2. O TEMPO DE VIDA SAI DO RITMO");
{
  const w3 = janelaDe(1);
  const primeiro = J.decidirOCache({ system: SYS, mensagens: w3, agora: 0, modelo: MOD });
  t("sem ficha (o primeiro cache): o de sempre", primeiro.acao === "criar" && primeiro.ttl === T.ttlSegundos, JSON.stringify(primeiro));
  /* o ciclo: o cache nasceu na janela de 25 (m = 24); doze turnos depois, a
     âncora salta e a janela volta a 25 — o prefixo já não confere */
  const nasceu = janelaDe(12);
  const f0 = J.decidirOCache({ system: SYS, mensagens: nasceu, agora: 0, modelo: MOD });
  const fichaDe = (d, criado) => ({ nome: "cachedContents/c", modelo: MOD, m: d.m, impressao: d.impressao, criado, expira: criado + d.ttl * 1000 });
  const corte = janelaDe(24);
  t("(a janela do corte tem 25 mensagens)", nasceu.length === 25 && corte.length === 25, `${nasceu.length} ${corte.length}`);
  const aoRitmo = (s) => J.decidirOCache({ ficha: fichaDe(f0, 0), system: SYS, mensagens: corte, agora: 12 * s * 1000, modelo: MOD });
  const depressa = aoRitmo(30), devagar = aoRitmo(210), parado = aoRitmo(600);
  t("quem joga depressa (30 s por turno) fica no piso", depressa.acao === "criar" && depressa.ttl === T.ttlSegundos, JSON.stringify(depressa));
  const doCiclo = Math.ceil(12 * 210 * T.folgaDoRitmo + T.folgaSegundos);
  t(`a 3,5 min por turno o cache vive o ciclo inteiro (12 turnos × 210 s × folga = ${doCiclo} s)`, devagar.ttl === doCiclo && doCiclo > T.ttlSegundos && doCiclo < T.ttlMaxSegundos, String(devagar.ttl));
  t("e quem saiu da mesa não ganha mais do que o teto", parado.ttl === T.ttlMaxSegundos);
  /* o cache que expirou com o prefixo intacto (quem joga devagar, a meio do
     ciclo): os turnos contam-se direto, sem salto */
  const meio = janelaDe(18);
  const expirado = J.decidirOCache({ ficha: fichaDe(f0, 0), system: SYS, mensagens: meio, agora: 6 * 300e3, modelo: MOD });
  const restam = Math.floor((TETO - meio.length) / T.mensagensPorTurno) + 1;
  t("o cache que morreu de velho a meio do ciclo renasce para os turnos que faltam", expirado.acao === "criar" && expirado.ttl === Math.max(T.ttlSegundos, Math.min(T.ttlMaxSegundos, Math.ceil(restam * 300 * T.folgaDoRitmo + T.folgaSegundos))), JSON.stringify(expirado));
  t("lixo na ficha (sem relógio, relógio ao contrário) cai no piso",
    J.decidirOCache({ ficha: { ...fichaDe(f0, 0), criado: "x" }, system: SYS, mensagens: corte, agora: 9e6, modelo: MOD }).ttl === T.ttlSegundos
    && J.decidirOCache({ ficha: fichaDe(f0, 5e6), system: SYS, mensagens: corte, agora: 1e6, modelo: MOD }).ttl === T.ttlSegundos);
  t("o usar e o nenhum não trazem ttl (o pedido é o mesmo de antes)", !("ttl" in J.decidirOCache({ ficha: fichaDe(f0, 0), system: SYS, mensagens: janelaDe(13), agora: 30e3, modelo: MOD })));
  t("o pedido nulo continua a não escrever nada", J.decidirOCache(null).acao === "nenhum");
}

sec("3. A SESSÃO SIMULADA: ANTES (30 min fixos) E DEPOIS (o ciclo)");
{
  const p = C.PRECOS[MOD];
  /* uma sessão de 63 turnos; `fixo` = o cache de antes, que morria aos 30 min */
  function sessao(segPorTurno, fixo) {
    let hist = [m("user", 0)], ficha = null, dol = 0, escritas = 0;
    const decisoes = [];
    for (let turno = 1; turno <= 63; turno++) {
      const ms = [...J.janelaAncorada(hist).slice(0, -1), { role: "user", content: "T".repeat(16500) }];
      const agora = turno * segPorTurno * 1000;
      const d = J.decidirOCache({ ficha, system: SYS, mensagens: ms, agora, modelo: MOD });
      decisoes.push(`${d.acao}:${d.m || 0}`);
      const tok = (a, b) => (SYS.length + ms.slice(a, b).reduce((x, y) => x + y.content.length, 0)) / T.charsPorToken;
      const total = tok(0, ms.length);
      /* a guarda: do nascimento até ser apagado, ou até expirar se morreu antes */
      const morre = () => { if (ficha) dol += ficha.tokens * Math.max(0, Math.min(agora, ficha.expira) - ficha.criado) / 3.6e6 * p.armazenamento / 1e6; };
      let c = 0;
      if (d.acao === "criar") {
        morre(); escritas++;
        c = tok(0, d.m);
        dol += (c * p.entrada) / 1e6;
        const vida = fixo ? T.ttlSegundos : d.ttl;
        ficha = { nome: "cachedContents/t" + turno, modelo: MOD, m: d.m, impressao: d.impressao, criado: agora, expira: agora + vida * 1000, tokens: c };
      } else if (d.acao === "usar") c = tok(0, d.m);
      else if (d.apagar) { morre(); ficha = null; }
      dol += (c * p.cache + (total - c) * p.entrada) / 1e6;
      hist = [...hist, m("assistant", turno), m("user", turno)];
    }
    if (ficha) dol += ficha.tokens * (ficha.expira - ficha.criado) / 3.6e6 * p.armazenamento / 1e6;
    return { dol, escritas, decisoes };
  }
  for (const [nome, s, regra] of [["depressa (30 s)", 30, "igual"], ["à mesa (1,7 min)", 102, "igual"], ["devagar (3,5 min)", 210, "desce"], ["muito devagar (5 min)", 300, "desce"]]) {
    const a = sessao(s, true), d = sessao(s, false);
    console.log(`      (${nome}: US$ ${a.dol.toFixed(4)}, ${a.escritas} escritas → US$ ${d.dol.toFixed(4)}, ${d.escritas} escritas · ${(100 * (d.dol / a.dol - 1)).toFixed(1)}%)`);
    if (regra === "igual") t(`${nome}: as mesmas decisões, turno a turno`, a.decisoes.join() === d.decisoes.join());
    else {
      t(`${nome}: menos escritas`, d.escritas < a.escritas, `${a.escritas} → ${d.escritas}`);
      t(`${nome}: o Narrador fica pelo menos 3% mais barato`, d.dol < a.dol * 0.97, `${a.dol.toFixed(4)} → ${d.dol.toFixed(4)}`);
    }
  }
}

console.log(`\n${bons} ok, ${maus} falha(s)`);
if (maus) process.exit(1);
