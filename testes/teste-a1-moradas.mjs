/* A1 · O RELATO SEM LIVRO-CAIXA — a morada da linha e o recibo do turno

   (Nasceu como `teste-a1-relato.mjs`, o nome que o regente pediu; o
   `oficial` escreveu a suíte do B1 — o relato que sai do App — com esse
   mesmo nome, no mesmo minuto. Para não se apagarem, esta mora aqui: a
   do B1 prova a casa do relato, esta prova as duas peças puras que ele
   vai ler.)

   O pedido da pessoa (10/10): "há coisas e informações que aparecem que
   não são necessárias, isso acaba confundindo o player mais do que
   ajudando". O `jogo` jogou dez turnos (o ANTES, árvore `15c1595`),
   contou 50 peças além da prosa e decidiu peça a peça em
   `mente/a1-jogo.md` §2.2. Esta suíte prova as duas peças puras que o
   relato vai ler (`src/glifos.js`):

   · `MORADA_DA_LINHA` / `moradaDaLinha` — cada fala da mesa mora em
     `cena`, `recibo`, `luta`, `cala` ou `dia`, e o resto é `cena`;
   · `RECIBO_DO_TURNO` / `reciboDoTurno` — a fila de chips lida da
     FICHA, antes e depois, e nunca da frase.

   O que se prova, na ordem de "O que prova A" (a1-jogo §3):
   (1) todo prefixo de `ASSUNTO_DO_EMOJI` tem morada declarada — a lei
       de V3b estendida: prefixo novo sem decisão quebra aqui;
   (2) as linhas LITERAIS do ANTES caem na morada que o `jogo` decidiu;
   (3) o recibo contra fichas de fixture: `null`, item repetido, sinal
       U+2212, recibo vazio, e a luta da T8 a dar −3 PV e não 6.
   E uma catraca a mais: as frases dos módulos que as escrevem (o selo
   do encontro, a fala do feito, a cobrança, a porta da aba, o relógio,
   o heroísmo) caem na mesma morada — se a frase mudar na fonte e a
   tabela ficar para trás, é aqui que se sabe. */

const S = "../src/";
const G = await import(S + "glifos.js");
const { MORADA_DA_LINHA, moradaDaLinha, RECIBO_DO_TURNO, reciboDoTurno, ASSUNTO_DO_EMOJI } = G;
const { XP_POR_NIVEL } = await import(S + "constantes.js");

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const MORADAS = ["cena", "recibo", "luta", "cala", "dia"];
const MENOS = "−";
const FINO = " ";
const textos = (fila) => fila.map((c) => c.texto);

/* ============================================================ */
sec("0. A tabela se explica");
{
  t("toda linha tem uma das cinco moradas", MORADA_DA_LINHA.every((r) => MORADAS.includes(r.morada)));
  t("toda linha tem o porquê escrito (como MARCA_ACENDE)", MORADA_DA_LINHA.every((r) => typeof r.porque === "string" && r.porque.length > 20));
  t("toda linha de padrão diz as peças do inventário que decide", MORADA_DA_LINHA.every((r) => Array.isArray(r.pecas) ? r.pecas.length > 0 : Array.isArray(r.prefixos)));
  t("toda linha é OU um padrão OU uma lista de prefixos", MORADA_DA_LINHA.every((r) => (r.padrao instanceof RegExp) !== Array.isArray(r.prefixos)));
  /* um /g guarda `lastIndex` entre chamadas: a mesma frase daria moradas diferentes em turnos seguidos */
  t("nenhum padrão é /g nem /y (o teste não pode ter memória)", MORADA_DA_LINHA.every((r) => !r.padrao || (!r.padrao.global && !r.padrao.sticky)));
  t("a declaração por prefixo é toda `cena` hoje (lista branca: o que sai, sai pela frase)", MORADA_DA_LINHA.filter((r) => r.prefixos).every((r) => r.morada === "cena"));
}

/* ============================================================ */
sec("1. Todo prefixo de ASSUNTO_DO_EMOJI tem morada declarada (V3b estendida)");
{
  const declarados = new Set(MORADA_DA_LINHA.flatMap((r) => r.prefixos || []));
  const porPadrao = (k) => MORADA_DA_LINHA.some((r) => r.padrao && r.padrao.test(`${k} qualquer coisa`));
  const semMorada = Object.keys(ASSUNTO_DO_EMOJI).filter((k) => !declarados.has(k) && !porPadrao(k));
  t(`os ${Object.keys(ASSUNTO_DO_EMOJI).length} prefixos têm morada`, semMorada.length === 0, semMorada.join(" "));
  const intrusos = [...declarados].filter((k) => !(k in ASSUNTO_DO_EMOJI));
  t("e nenhum prefixo declarado é desconhecido de ASSUNTO_DO_EMOJI", intrusos.length === 0, intrusos.join(" "));
  const vezes = {};
  for (const r of MORADA_DA_LINHA) for (const k of r.prefixos || []) vezes[k] = (vezes[k] || 0) + 1;
  const duplos = Object.keys(vezes).filter((k) => vezes[k] > 1);
  t("nenhum prefixo declarado duas vezes (uma decisão por prefixo)", duplos.length === 0, duplos.join(" "));
  t("o 📍 mora em `cala` pelo padrão que o `jogo` escreveu (/^📍 /)", moradaDaLinha("📍 qualquer lugar") === "cala");
}

/* ============================================================ */
sec("2. As linhas literais do ANTES caem na morada que o `jogo` decidiu");
{
  /* Texto copiado de `auditoria/turno-N.json` (as mensagens novas de cada
     turno). Fora da luta, a mensagem chega sem `naLuta`; na luta (T8), com
     ela — é o `App.jsx` que a marca (B1, em `pushMsgs`). */
  const FORA = [
    ["T1 #31", "📍 Você está no Armazém da Muralha.", "cala"],
    ["T1 #65", "▸ Mercado — há quem venda por aqui.", "cena"],
    ["T3 #31", "📍 Você está na banca dos cambistas — O Armazém da Muralha.", "cala"],
    ["T4 #18", "⚖ Preço aferido pelo sistema: ◉ 20 (faixa justa ◉ 5–20 pela tabela — o cobrado era ◉ 30)", "recibo"],
    ["T4 #17", "Item obtido: Poção de Cura", "recibo"],
    ["T6 #18", "⚖ Preço aferido pelo sistema: ◉ 10 (faixa justa ◉ 3–10 pela tabela — o cobrado era ◉ 30)", "recibo"],
    ["T6 #17 (a fantasma)", "Item obtido: Poção de Cura", "recibo"],
    ["T6 #65", "▸ Mural — há um mural onde se lê o que a região precisa.", "cena"],
    /* #41: o aceite vira porta no `App.jsx` (B); até lá, a linha é cena */
    ["T6b #41", "🔎 O que há em O Oratório das Velas — paga ◉ 60 (o combinado) · 95 XP · +3 fama · primeiro passo: Encontrar Cora Guarda-Portão", "cena"],
    /* #45: o mural velho cala no `App.jsx` (B), na fonte; a morada é cena */
    ["T7 #45", "📋 Cora Guarda-Portão tem um trabalho no mural.", "cena"],
    ["T10 #31", "📍 Você está na Espada & o Punhal.", "cala"],
    ["T10 #31 (a que desmentiu a prosa)", "📍 De volta a Forte escura — A Espada & o Punhal fica para trás.", "cala"],
  ];
  for (const [quem, texto, morada] of FORA) {
    const m = moradaDaLinha({ autor: "sistema", texto });
    t(`${quem}: ${morada}`, m === morada, `deu ${m}`);
  }

  const LUTA = [
    ["T8 #46 entra", "⚔ lobo 1 entra no combate! (4 PV)", "luta"],
    ["T8 #46 entra", "⚔ lobo 2 entra no combate! (4 PV)", "luta"],
    ["T8 #46 terreno", "🗺 Terreno: junto ao balcão: — | entre as mesas: lobo 1, lobo 2 | ao pé da escada: você, Isen", "luta"],
    ["T8 #46 iniciativa", "🎲 Iniciativa — 1º lobo 2 (22) · 2º lobo 1 (20) · 3º Brida (19) · 4º Isen (16)", "luta"],
    /* "corta de vez": nem a dobra o guarda — `cala` vence `naLuta` */
    ["T8 #46 encontro", "○ Encontro fácil — resolve-se sem sustos se ninguém fizer besteira", "cala"],
    ["T8 #49 passo", "👣 Você vai de ao pé da escada para entre as mesas — 4,5 m gastos, restam 4,5 m.", "luta"],
    /* nasceu no meio do golpe e nomeava o mecanismo — `cala` vence `naLuta` */
    ["T8 #65 Códex", "▸ Códex — há o que registrar.", "cala"],
    ["T8 #48 dado", "🎲 Brida → lobo 1: d20 17+4=21 vs 14 · acerta, 8 de dano", "luta"],
    ["T8 #48 golpe", "⚔ Brida → lobo 1: 8 de dano · lobo 1 0/4 ☠", "luta"],
    ["T8 #49 vez", "🌍 VEZ DO MUNDO — rodada 1: os inimigos e o seu grupo agem.", "luta"],
    ["T8 #49 passo", "👣 lobo 2 avança 2 m — ainda entre as mesas", "luta"],
    ["T8 #50 passo", "👣 Isen: ao pé da escada → entre as mesas", "luta"],
    ["T8 #51 reação", "⚔ REAÇÃO — Aparar: 3 de dano evitado (6 → 3)", "luta"],
    ["T8 #49 dado dele", "🎲 lobo 2 → Brida: d20 18+1=19 vs 13 · acerta, 6 de dano", "luta"],
    ["T8 #49 golpe dele", "🛡 lobo 2 · Rasteira → Brida: 6 de dano", "luta"],
    ["T8 #50 companheiro", "🛡 Isen · Defesa Fluida — a guarda não bloqueia: escorre em volta do que vem. quem o ataca rola com desvantagem · 1 turno.", "luta"],
    ["T8 #50 companheiro", "🛡 Isen · Defesa Fluida se desfaz — a defesa volta ao normal.", "luta"],
    ["T8 #48 dado (N2)", "🎲 Brida → lobo 2: d20 18+4=22 vs 14 · acerta, 5 de dano", "luta"],
    ["T8 #48 golpe (N2)", "⚔ Brida → lobo 2: 5 de dano · lobo 2 0/4 ☠", "luta"],
    ["T8 #52 fim", "⚔ Todos os inimigos caíram — o combate termina.", "luta"],
    /* o número da luta mora no recibo dela — `recibo` vence `naLuta` */
    ["T8 #53 espólios", "◉ Espólios: +7 moedas · +14 XP", "recibo"],
    ["T8 #53 chão", "🧺 No chão: 🐗 Retalho de Couro — toque em EXAMINAR para recolher.", "cala"],
  ];
  for (const [quem, texto, morada] of LUTA) {
    const m = moradaDaLinha({ autor: "sistema", texto, naLuta: true });
    t(`${quem}: ${morada}`, m === morada, `deu ${m}`);
  }
  /* N1: o eco que a mesa escreve na boca do jogador vai para a dobra */
  t("T8 N1: o eco \"Ataco lobo 1\" (autor jogador, naLuta) vai à luta", moradaDaLinha({ autor: "jogador", texto: "Ataco lobo 1", naLuta: true }) === "luta");
  t("T8 N1: o eco \"Ataco lobo 2\" também", moradaDaLinha({ autor: "jogador", texto: "Ataco lobo 2", naLuta: true }) === "luta");

  /* SEM a marca (a frase solta): os prefixos de combate decidem sozinhos —
     o que o regente pediu ("aceita também os prefixos de combate"). O que
     só a marca sabe (a Defesa Fluida) fica cena. */
  const SO_PELA_FRASE = LUTA.filter(([, x, m]) => m === "luta" && !/Defesa Fluida/.test(x));
  const fugidas = SO_PELA_FRASE.filter(([, texto]) => moradaDaLinha(texto) !== "luta").map(([q, x]) => `${q}: ${x.slice(0, 40)}`);
  t(`as ${SO_PELA_FRASE.length} linhas de golpe/vez/passo/abertura da T8 vão à luta só pela frase`, fugidas.length === 0, fugidas.join(" | "));
  t("e a Defesa Fluida, sem a marca, fica cena (na dúvida, aparece)", moradaDaLinha("🛡 Isen · Defesa Fluida se desfaz — a defesa volta ao normal.") === "cena");
}

/* ============================================================ */
sec("2b. A ordem de quem manda");
{
  t("a prosa do Mestre nunca se cala por um padrão", moradaDaLinha({ autor: "mestre", texto: "📍 Você está no Armazém da Muralha." }) === "cena");
  t("nem a fala do jogador", moradaDaLinha({ autor: "jogador", texto: "Item obtido: tudo" }) === "cena");
  t("uma porta (▸) fura a dobra da luta — nenhuma porta nasce lá dentro (#65)", moradaDaLinha({ autor: "sistema", texto: "▸ Mercado — há quem venda por aqui.", naLuta: true }) === "cena");
  t("a frase sem tabela, na luta, vai à luta", moradaDaLinha({ autor: "sistema", texto: "Algo acontece.", naLuta: true }) === "luta");
  t("a frase sem tabela, fora da luta, é cena", moradaDaLinha({ autor: "sistema", texto: "Algo acontece." }) === "cena");
  t("`naLuta` só conta se for true (não 'sim', não 1)", moradaDaLinha({ texto: "Algo acontece.", naLuta: "sim" }) === "cena" && moradaDaLinha({ texto: "Algo acontece.", naLuta: 1 }) === "cena");
  t("null, undefined, vazio, número e {texto:null} não estouram e dão cena", [null, undefined, "", 42, { texto: null }].every((x) => moradaDaLinha(x) === "cena"));
  t("o seletor de variação (U+FE0F) não muda a morada", moradaDaLinha("📍️ Você está aqui.") === "cala");
  t("a mesma frase dá sempre a mesma morada (sem memória)", [1, 2, 3].every(() => moradaDaLinha("Item obtido: Corda") === "recibo"));

  /* B3: a porta do aceite ABRE o Diário. `portaDaLinhaDeSistema` não é
     exportada e o `.jsx` não se importa em Node — lê-se a fonte, como
     `teste-r3-campo-do-turno` faz (seta + tabela + função, num Function).
     Sem a entrada `Diário` em PORTAS_DO_SISTEMA a seta mentia: a linha
     nascia, com cara de porta, e não abria nada. */
  const { readFileSync } = await import("node:fs");
  const { SUBS_GESTAO } = await import(S + "abas.js");
  const RELATO = readFileSync(new URL("../src/painel-relato.jsx", import.meta.url), "utf8");
  const fonte = (nome) => {
    const i = RELATO.indexOf(`function ${nome}(`);
    if (i < 0) return null;
    const a = RELATO.indexOf("{", i);
    for (let k = a, n = 0; k < RELATO.length; k++) {
      if (RELATO[k] === "{") n++;
      else if (RELATO[k] === "}" && --n === 0) return RELATO.slice(i, k + 1);
    }
    return null;
  };
  const seta = RELATO.match(/const SETA_DA_PORTA = "[^"]+";/);
  const portas = RELATO.match(/const PORTAS_DO_SISTEMA = \[[\s\S]*?\n\];/);
  const fn = fonte("portaDaLinhaDeSistema");
  const linhaDoAceite = "▸ Diário — O lobo da colina · próximo: falar com Isen";
  let p = null;
  try { p = new Function("SUBS_GESTAO", `${seta[0]}\n${portas[0]}\n${fn}\nreturn portaDaLinhaDeSistema;`)(SUBS_GESTAO)(linhaDoAceite); } catch (e) { p = null; }
  t("B3: a porta do aceite (▸ Diário — …) abre a aba de cima `diario`", !!p && p.aba === "diario" && p.sub === null, JSON.stringify(p));
  t("B3: e a linha do aceite mora na cena (fora e dentro da luta: nenhuma porta nasce na dobra)",
    moradaDaLinha({ autor: "sistema", texto: linhaDoAceite }) === "cena" && moradaDaLinha({ autor: "sistema", texto: linhaDoAceite, naLuta: true }) === "cena");
}

/* ============================================================ */
sec("2c. As famílias de §2.2, pelas frases-modelo do inventário");
{
  const CASOS = [
    ["#12", "◉ +12 moedas", "recibo"],
    ["#21", `◉ ${MENOS}15 moedas`, "recibo"],
    ["#13", "Você perdeu 3 PV.", "recibo"],
    ["#13", "Você recuperou 4 PV.", "recibo"],
    ["#13", "Você gastou 2 PM.", "recibo"],
    ["#15", "✦ NÍVEL 3 ALCANÇADO!", "recibo"],
    ["#16 (a frase muda na fonte, C8; a morada é cena)", "✦ Isen subiu para o nível 2! (no acampamento, \"trilhar caminho\" destrava novas habilidades)", "cena"],
    ["#17", "Item perdido: Corda", "recibo"],
    ["#17", "⚔ Equipamento encontrado: Espada Longa (incomum)", "recibo"],
    ["#18", "⚖ Recompensa aferida pelo sistema: ◉ 40 (o falado era ◉ 500)", "recibo"],
    ["#18", "⚖ Venda aferida pelo sistema: ◉ 10 (metade do valor de tabela — o preço falado era ◉ 30)", "recibo"],
    ["#18 (PV de quem luta: a batalha mostra)", "⚖ PV aferido: 40 → 32 (faixa 20–35)", "cala"],
    ["#19", `💥 Dano ambiental (grave): ${MENOS}6 PV (calculado pelo sistema)`, "recibo"],
    ["#22 o tique", "✧ Bênção ativo (+2 em testes, 3 turnos)", "cala"],
    ["#22 o fim fica", "✧ Bênção se dissipou.", "cena"],
    ["#23 o tique no herói", `Envenenado + Sangrando: ${MENOS}3 PV (12/20)`, "recibo"],
    ["#23 a saída fica", "✓ Envenenado passou", "cena"],
    ["#23 o tique no inimigo não é do herói", `Envenenado em lobo 1: ${MENOS}2 PV (2/4)`, "cena"],
    ["#24 fica", "Falha crítica — o pé escorrega: Caído (2t).", "cena"],
    ["#25", "🎲 d20 → 14 + 3 = 17 vs dif. 15 · sucesso", "cala"],
    ["#29 o momento fica", "🌠 Dádiva do Destino — o destino te devia esta: a rolagem se refaz sem custar heroísmo (volta no descanso longo).", "cena"],
    ["#30 a conta", "◉ 12 moedas mudaram de mão.", "recibo"],
    ["#30 a relação fica", "💢 Kolvar passa a ver você como hostil.", "cena"],
    ["#32", "🧭 Chegada: agora você está em Pedravale.", "cala"],
    ["#32", "🗺 Pedravale entrou no seu mapa.", "cala"],
    ["#32", "🗺 De Forte Escura você fica sabendo de mais 2 lugares: Vau, Brejo — ouvido no mercado, não visto de perto.", "cala"],
    ["#32 (a chegada a um lugar por perto)", "🧭 Você está em O Moinho — e o lugar entrou no seu mapa.", "cala"],
    ["#33 a barra", "🧭 Forte Escura → Pedravale · ▰▰▰▱▱▱▱▱ 40% · faltam 3 avanços · escreva que segue viagem para avançar", "cala"],
    ["#33 a pausa decide", "🧭 Forte Escura → Pedravale · PAUSADA (40%) — a ponte caiu", "cena"],
    ["#33 'a caminho' fica", "🧭 Pedravale — a caminho.", "cena"],
    ["#35 a recusa fica", "🔒 A estrada está fechada — espere o degelo.", "cena"],
    ["#37 fica", "🥱 Exaustão: 44h acordado. Você está Exausto (desvantagem) até um descanso longo.", "cena"],
    ["#39 o reino", "👑 Coroação em Forte Escura: o povo enche as ruas.", "dia"],
    ["#39 a festa", "❄ Hoje é Vigília do Inverno: a noite mais longa.", "dia"],
    ["#39 o boato", "🗞 Corre a boca miúda: o barão deve a todos…", "dia"],
    ["#39 a renda (vai ao cofre, não à ficha)", "🏛 Suas terras e contratos renderam ◉ 40 (2 dias) — no cofre de Casa Corvo.", "dia"],
    ["#41 o passo fica", "🧭 O que há em O Oratório das Velas: Encontrar Cora ✓ (1/4) → agora: ir ao Oratório", "cena"],
    ["#44 o tique", "⌛ Tirar Alba de lá ●●○○ (2/4) — mais uma noite", "cala"],
    ["#44 o prazo da missão", "⌛ O Oratório ●○○○ — 4 noites, e cada noite dormida gasta uma.", "cala"],
    ["#44 'Começou a contar' fica", "⌛ Começou a contar: A Peste ●○○○ — algo que avança se ninguém agir.", "cena"],
    ["#44 o relógio cheio fica", "⌛ A Peste ●●●● (4/4) — a cidade fecha os portões", "cena"],
    ["#44 'o tempo acabou' fica", "⏳ O Oratório: o prazo de 4 noites acabou — a missão falhou.", "cena"],
    ["#52 fuga", "🏃 lobo 2 dá as costas; seu golpe de oportunidade passa raspando — ele escapa", "luta"],
    ["#52 golpe final", "☠ Varredura — lobo 1 e lobo 2 caem de uma vez.", "luta"],
    ["#51 oportunidade", "⚡ Ataque de oportunidade — lobo 2: 4 de dano a você", "luta"],
    ["#53 recolher", "🤲 Você recolhe: 🐗 Retalho de Couro", "recibo"],
    ["#53 o painel que fala de si", "⚔ O confronto se dissolve — o painel de combate se fecha.", "cala"],
    ["#54 fica", "🌟 PODER ÚNICO DESPERTOU — Sangue de Dragão.", "cena"],
    ["#56 fora da luta", "✦ Golpe Firme · gastou 4 PM · restam 8/20 · ⏳ recarga 1t", "recibo"],
    ["#56 várias", "Você gastou 6 PM · restam 2/20", "recibo"],
    ["#56 a recusa fica", "⛔ Bola de Fogo custa 6 PM — você tem 3.", "cena"],
    ["#58 fica", "⚑ Isen juntou-se ao grupo!", "cena"],
    ["#62 fica", "🕯 Passo cauteloso: 2 tochas queimadas — restam 3.", "cena"],
    ["#63 fica", "🩹 Dado de vida: d8 → 5 + 1 = 6 PV · 14/20 · restam 2 dado(s)", "cena"],
    ["#65 as sub-abas ficam", "▸ Pessoas — o mundo começou a guardar quem você conhece.", "cena"],
    ["#71 fica", "⚡ Você está em Pedravale (planície, campo).", "cena"],
    ["talentos não são golpe", "✦ Força → +1 (−1 ponto, restam 2)", "cena"],
    ["o nível de companheiro com seta não é golpe", "⚑ Isen: nível 1 → 2 · guerreiro", "cena"],
  ];
  for (const [peca, texto, morada] of CASOS) {
    const m = moradaDaLinha(texto);
    t(`${peca}: ${morada}`, m === morada, `deu ${m} — ${texto.slice(0, 50)}`);
  }
}

/* ============================================================ */
sec("2d. A catraca da fonte — as frases que os módulos escrevem");
{
  const { FAIXAS, selo } = await import(S + "orcamento.js");
  const selos = FAIXAS.map((faixa) => selo({ faixa }));
  t(`os ${FAIXAS.length} selos de encontro (orcamento.js) calam`, selos.every((s) => moradaDaLinha(s) === "cala"), selos.filter((s) => moradaDaLinha(s) !== "cala").join(" | "));

  const { GRAUS, falaDoFeito } = await import(S + "juiz.js");
  const feitos = Object.keys(GRAUS).map((g) => falaDoFeito(g, 14));
  t(`a fala do feito (juiz.js), nos ${feitos.length} graus, vai ao recibo`, feitos.every((s) => moradaDaLinha(s) === "recibo"), feitos.join(" | "));

  const { falaDoDebito, falaDaCobranca } = await import(S + "cobranca.js");
  const debito = falaDoDebito({ temAlgo: true, semFundos: false, moedas: 15 });
  t("o débito pela narração (cobranca.js) vai ao recibo", !!debito && moradaDaLinha(debito) === "recibo", debito);
  const cob1 = falaDaCobranca({ temAlgo: true, moedas: 100, consumiveis: [{ icone: "🧪", nome: "Poção de Cura" }] });
  const cob2 = falaDaCobranca({ temAlgo: true, moedas: 0, consumiveis: [{ icone: "🧪", nome: "Poção de Cura" }] });
  t("a cobrança pela narração (foram/foi para a bolsa) vai ao recibo", moradaDaLinha(cob1) === "recibo" && moradaDaLinha(cob2) === "recibo", `${cob1} | ${cob2}`);

  const { falaDaNovidade } = await import(S + "abas.js");
  t("a porta do Códex (abas.js) cala", moradaDaLinha(falaDaNovidade("codex")) === "cala", falaDaNovidade("codex"));
  const subs = ["pessoas", "talentos", "mercado", "guilda", "dominios", "diplomacia", "correio", "mural"];
  t("as portas das sub-abas de Gestão ficam na cena", subs.every((id) => moradaDaLinha(falaDaNovidade(id)) === "cena"));

  const { linhaDoAvanco } = await import(S + "relogios.js");
  const meio = linhaDoAvanco({ relogio: { tipo: "ameaca", nome: "A Peste", cheios: 2, segmentos: 4 }, para: 2, porque: "mais uma noite" });
  const cheio = linhaDoAvanco({ relogio: { tipo: "ameaca", nome: "A Peste", cheios: 4, segmentos: 4 }, para: 4, porque: "a cidade fecha" });
  t("o tique do relógio (relogios.js) cala", moradaDaLinha(meio) === "cala", meio);
  t("o relógio que enche fica (é quando aperta)", moradaDaLinha(cheio) === "cena", cheio);

  const { ganharHeroismo } = await import(S + "heroismo.js");
  const h = ganharHeroismo({ heroismo: 1 }, "missao");
  t("o ganho de heroísmo (heroismo.js) vai ao recibo", !!h.msg && moradaDaLinha(h.msg) === "recibo", h.msg);
}

/* ============================================================ */
sec("3. reciboDoTurno — a ficha, não a frase");
{
  /* a tabela */
  t("a ordem é a da tabela: ◉ · PV · PM · XP · nível · heroísmo · essência · itens",
    RECIBO_DO_TURNO.map((r) => r.tipo).join(" ") === "moedas pv pm xp nivel heroismo essencia item");
  t("toda linha do recibo tem o porquê", RECIBO_DO_TURNO.every((r) => typeof r.porque === "string" && r.porque.length > 8));
  t("os campos são os da ficha real (migrarPersonagem)", RECIBO_DO_TURNO.filter((r) => r.campo).map((r) => r.campo).join(" ") === "moedas vida mana xp nivel heroismo essencia");

  /* null e o vazio — `= {}` não cobre null */
  t("null, null → []", JSON.stringify(reciboDoTurno(null, null)) === "[]");
  t("null antes → []", JSON.stringify(reciboDoTurno(null, { moedas: 5 })) === "[]");
  t("undefined depois → []", JSON.stringify(reciboDoTurno({ moedas: 5 })) === "[]");
  t("array e número não são ficha → []", JSON.stringify(reciboDoTurno([], [])) === "[]" && JSON.stringify(reciboDoTurno(3, 4)) === "[]");
  const f0 = { moedas: 15, vida: 20, vidaMax: 20, mana: 8, xp: 30, nivel: 1, heroismo: 1, essencia: 0, inventario: ["Poção de Cura"], equipamento: [] };
  t("recibo vazio: a mesma ficha → []", JSON.stringify(reciboDoTurno(f0, { ...f0 })) === "[]");
  t("T6, a poção fantasma: a bolsa não mudou → nenhum item", JSON.stringify(reciboDoTurno(f0, { ...f0, inventario: ["Poção de Cura"] })) === "[]");

  /* T8: a luta. O balanço dizia "6 sofrido"; a ficha diz 20 → 17. */
  const antes8 = { moedas: 0, vida: 20, vidaMax: 20, mana: 8, xp: 30, nivel: 1, heroismo: 1, essencia: 0, inventario: ["Poção de Cura"], equipamento: [] };
  const depois8 = { ...antes8, moedas: 7, vida: 17, xp: 44 };
  const r8 = reciboDoTurno(antes8, depois8);
  /* MOVIDA (10/10, A1 segunda etapa): a primeira etapa escreveu o ◉ À FRENTE
     (`◉ +7`, a gramática da soleira); o `desenho` decidiu a notação da CINTA
     (`formas.md` §A1 1) — o recibo é o delta do que a cinta mostra, e a cinta
     escreve `1.240 ◉`, número primeiro. O que a asserção protege não mudou: a
     T8 dá −3 PV, lido da ficha, e não os 6 da frase. */
  t("T8: +7 ◉ · −3 PV · +14 XP — e não 6", JSON.stringify(textos(r8)) === JSON.stringify(["+7 ◉", `${MENOS}3 PV`, "+14 XP"]), JSON.stringify(textos(r8)));
  t("T8: o PV é −3 no delta também", r8.find((c) => c.tipo === "pv").delta === -3);
  t("o menos é U+2212, nunca o hífen", r8.every((c) => !c.texto.includes("-")) && r8[1].texto.charCodeAt(0) === 0x2212);

  /* T4: a compra. A prosa dizia 30, a linha 20; a bolsa perdeu 15. */
  const r4 = reciboDoTurno({ ...f0 }, { ...f0, moedas: 0, inventario: ["Poção de Cura", "Poção de Cura"] });
  /* MOVIDA (A1 segunda etapa): a notação da cinta, e o item com o espaço FINO
     (U+2009) entre o sinal e o nome, como o `desenho` escreve */
  t("T4: o recibo diz o que a bolsa diz (−15 ◉) e o item", JSON.stringify(textos(r4)) === JSON.stringify([`${MENOS}15 ◉`, `+${FINO}Poção de Cura`]), JSON.stringify(textos(r4)));

  /* itens: multiconjunto de nomes */
  const ri = reciboDoTurno({ inventario: ["Corda", "Tocha"] }, { inventario: ["Tocha", "Tocha", "Tocha", { nome: "Retalho de Couro" }] });
  /* MOVIDA (A1 segunda etapa): `× 2` com espaço, e o espaço fino depois do sinal (formas.md §A1 1) */
  t("item repetido diz × n; objeto {nome} vale como nome; o que sai diz −", JSON.stringify(textos(ri)) === JSON.stringify([`+${FINO}Tocha × 2`, `+${FINO}Retalho de Couro`, `${MENOS}${FINO}Corda`]), JSON.stringify(textos(ri)));
  t("o delta do item é a quantidade", ri[0].delta === 2 && ri[2].delta === -1 && ri.every((c) => c.tipo === "item"));
  const rp = reciboDoTurno({ inventario: ["Tocha", "Tocha", "Tocha"] }, { inventario: ["Tocha"] });
  t("perder duas de três: − Tocha × 2", JSON.stringify(textos(rp)) === JSON.stringify([`${MENOS}${FINO}Tocha × 2`]));
  const espada = { nome: "Espada Longa", tipo: "arma" };
  const re = reciboDoTurno({ inventario: [], equipamento: [espada], equipados: {} }, { inventario: [], equipamento: [espada], equipados: { arma: espada } });
  t("equipar não é ganhar (equipados não entra no recibo)", JSON.stringify(re) === "[]");
  const rq = reciboDoTurno({ inventario: [] }, { inventario: [], equipamento: [espada] });
  t("ficha sem `equipamento` antes: o campo não se compara (nada de '+ tudo')", JSON.stringify(rq) === "[]");
  t("nomes vazios e lixo no inventário não viram chip", JSON.stringify(reciboDoTurno({ inventario: [] }, { inventario: ["", null, 3, { nome: "  " }] })) === "[]");

  /* incompleto: o chip que não tem os dois lados não sai */
  t("vida ausente antes → sem chip de PV", JSON.stringify(reciboDoTurno({ moedas: 5 }, { moedas: 5, vida: 10 })) === "[]");
  t("moedas em texto não é número → sem chip", JSON.stringify(reciboDoTurno({ moedas: "5" }, { moedas: 9 })) === "[]");

  /* o nível: o XP atravessa o vão, e `aplicarNivel` desconta-o */
  const custo1 = XP_POR_NIVEL(1);
  const rn = reciboDoTurno({ xp: custo1 - 10, nivel: 1, vida: 12, vidaMax: 20 }, { xp: 5, nivel: 2, vida: 23, vidaMax: 23 });
  t(`subir de nível: +15 XP (o vão de ${custo1} contado), e o nível vem depois do XP`,
    JSON.stringify(textos(rn)) === JSON.stringify(["+11 PV", "+15 XP", "nível 2"]), JSON.stringify(textos(rn)));

  /* a ordem com tudo a mudar. `aplicarNivel` já descontou o vão: subir de
     1 a 2 com 2 de sobra deixa xp 2, e o ganho foi o vão + 2. */
  const tudoA = { moedas: 10, vida: 10, mana: 10, xp: 0, nivel: 1, heroismo: 0, essencia: 0, inventario: [] };
  const tudoD = { moedas: 3, vida: 8, mana: 6, xp: 2, nivel: 2, heroismo: 1, essencia: 3, inventario: ["Corda"] };
  const rt = reciboDoTurno(tudoA, tudoD);
  t("com tudo a mudar, a fila sai na ordem fixa", rt.map((c) => c.tipo).join(" ") === "moedas pv pm xp nivel heroismo essencia item", rt.map((c) => c.tipo).join(" "));
  /* MOVIDA (A1 segunda etapa): o PM fala pelo glifo da cinta (`−4 ◆`), e não
     pela palavra — a cinta escreve `85 ◆`. Os outros, como estavam. */
  t("e os textos são os da forma", JSON.stringify(textos(rt)) === JSON.stringify([`${MENOS}7 ◉`, `${MENOS}2 PV`, `${MENOS}4 ◆`, `+${custo1 + 2} XP`, "nível 2", "+1 heroísmo", "+3 essência", `+${FINO}Corda`]), JSON.stringify(textos(rt)));
  /* MOVIDA (A1 segunda etapa): o chip deixou de ser só `{ tipo, delta, texto }`
     — a tela precisa do número separado do glifo (`valor` + `glifo`), do nome
     do item (`nome`, para truncar e para a marca da porta) e do nome por
     extenso para o leitor de tela (`falado`). O que se protege é o mesmo: o
     chip é dado puro, sem nada de tela dentro. */
  t("todo chip tem tipo, delta, texto e falado; o ◉ e o ◆ levam valor + glifo; o item leva o nome",
    rt.every((c) => typeof c.tipo === "string" && typeof c.delta === "number" && typeof c.texto === "string" && typeof c.falado === "string")
    && rt.filter((c) => c.glifo).map((c) => `${c.valor} ${c.glifo}`).join(" | ") === `${MENOS}7 moeda | ${MENOS}4 mana`
    && rt.filter((c) => c.tipo === "item").every((c) => c.nome === "Corda"));
  t("o falado diz a palavra no lugar do glifo", rt[0].falado === `${MENOS}7 moedas` && rt[2].falado === `${MENOS}4 PM`);
  t("o número grande fala como a cinta: +1.240 ◉", reciboDoTurno({ moedas: 0 }, { moedas: 1240 })[0].texto === "+1.240 ◉");

  /* puro */
  const copiaA = JSON.stringify(tudoA), copiaD = JSON.stringify(tudoD);
  const r1 = JSON.stringify(reciboDoTurno(tudoA, tudoD)), r2 = JSON.stringify(reciboDoTurno(tudoA, tudoD));
  t("a mesma entrada dá a mesma fila", r1 === r2);
  t("não muta as fichas", JSON.stringify(tudoA) === copiaA && JSON.stringify(tudoD) === copiaD);
}

/* ============================================================ */
sec("4. reciboQueCabe — a ordem é lei, e o corte também (formas.md §A1 1)");
{
  const { reciboQueCabe, itensMostrados } = G;
  const { RECIBO } = await import(S + "estilo.js");
  t("a tabela é a do desenho: 16/12 entre, teto 6/4, avanço 0,6, piso 12, entrelinha 18",
    RECIBO.entre === 16 && RECIBO.entreTelefone === 12 && RECIBO.tetoNaMesa === 6 && RECIBO.tetoNoTelefone === 4 && RECIBO.avancoMono === 0.6 && RECIBO.pisoDoNome === 12 && RECIBO.entrelinha === 18);
  /* a conta do desenho, a 303 px (a coluna da prosa a 375): +120 ◉ · −12 PV · +140 XP · nível 4 · e mais 2 */
  const f0 = { moedas: 0, vida: 30, xp: 0, nivel: 3, inventario: [] };
  const fila = reciboDoTurno({ ...f0, nivel: 3, xp: 0 }, { ...f0, moedas: 120, vida: 18, nivel: 4, xp: 140 - XP_POR_NIVEL(3), inventario: ["Corda", "Tocha"] });
  const tel = reciboQueCabe(fila, 303, { telefone: true });
  t("a 303 px cabem quatro e o resto diz `e mais 2` (a conta do desenho)", tel.visiveis.length === 4 && tel.resto.length === 2, textos(tel.visiveis).join(" · "));
  /* o pior caso: quatro números grandes e mais quatro chips depois */
  const pior = reciboDoTurno({ moedas: 0, vida: 200, mana: 30, xp: 0, inventario: [] }, { moedas: 1240, vida: 80, mana: 10, xp: 1400, inventario: ["A", "B", "C", "D"] });
  const p = reciboQueCabe(pior, 303, { telefone: true });
  t("o pior caso: o quarto vai para o resto (321,6 > 303) — três + `e mais 5`", p.visiveis.length === 3 && p.resto.length === 5, textos(p.visiveis).join(" · "));
  t("na mesa o teto de 6 chega antes da largura", reciboQueCabe([...pior, ...pior], 536).visiveis.length <= RECIBO.tetoNaMesa);
  t("sem largura, só o teto decide", reciboQueCabe(pior, 0).visiveis.length === RECIBO.tetoNaMesa && reciboQueCabe(pior, undefined, { telefone: true }).visiveis.length === RECIBO.tetoNoTelefone);
  /* o primeiro que não cabe fecha a fila: nunca se salta para um menor depois dele */
  const grande = [{ tipo: "xp", delta: 1, texto: "+1.000.000.000 XP" }, { tipo: "pv", delta: -1, texto: `${MENOS}1 PV` }];
  t("a ordem é lei: o grande que não cabe fecha a fila, mesmo que o menor coubesse", reciboQueCabe(grande, 100).visiveis.length === 0);
  /* o item trunca, mas nunca abaixo de 12 caracteres */
  const item = reciboDoTurno({ inventario: [] }, { inventario: ["Espada Longa dos Reis Antigos de Forte Escura"] });
  const tr = reciboQueCabe(item, 200);
  t("o item trunca com … quando não cabe", tr.visiveis.length === 1 && tr.visiveis[0].truncado === true && /…$/.test(tr.visiveis[0].texto), tr.visiveis.map((c) => c.texto).join());
  const nome = tr.visiveis[0] ? tr.visiveis[0].texto.slice(2, -1) : "";
  t("e o nome truncado tem ≥ 12 caracteres (o piso de §21)", nome.length >= RECIBO.pisoDoNome, nome);
  t("abaixo do piso o item vai para o resto", reciboQueCabe(item, 90).visiveis.length === 0);
  t("vazio, null e lixo: nada", reciboQueCabe(null, 300).visiveis.length === 0 && reciboQueCabe([null, 3, {}], 300).visiveis.length === 0);
  t("A5: itensMostrados devolve só os itens GANHOS que a fila desenhou",
    JSON.stringify(itensMostrados(reciboDoTurno({ inventario: ["Corda"] }, { inventario: ["Tocha"] }))) === JSON.stringify(["Tocha"])
    && JSON.stringify(itensMostrados(tel.visiveis)) === "[]" && JSON.stringify(itensMostrados(null)) === "[]");
}

/* ============================================================ */
sec("5. A5 — a marca não acende o que a tela principal acabou de mostrar");
{
  const M = await import(S + "marca-da-porta.js");
  const a = M.fotoDoAcervo({ itens: ["Corda"], missoes: [] });
  const d = M.fotoDoAcervo({ itens: ["Corda", "Poção de Cura", "Tocha"], missoes: [{ id: "m1", status: "ativa" }] });
  t("sem `mostrado`, acende como sempre (diário e bolsa)", JSON.stringify(M.marcasQueAcendem(a, d)) === JSON.stringify(["diario", "inv"]));
  t("o item que o recibo mostrou e a missão da porta do aceite não acendem; o que ficou no resto acende",
    JSON.stringify(M.marcasQueAcendem(a, d, { mostrado: { itens: ["Poção de Cura"], missoes: ["m1"] } })) === JSON.stringify(["inv"]));
  t("tudo mostrado: nada acende", JSON.stringify(M.marcasQueAcendem(a, d, { mostrado: { itens: ["Poção de Cura", "Tocha"], missoes: ["m1"] } })) === "[]");
  t("a quantidade que sobe além do mostrado ainda conta como mostrada (o recibo disse × n)",
    JSON.stringify(M.marcasQueAcendem(M.fotoDoAcervo({ itens: ["Tocha"] }), M.fotoDoAcervo({ itens: ["Tocha", "Tocha"] }), { mostrado: { itens: ["Tocha"] } })) === "[]");
  t("a missão que CONCLUI e foi mostrada não acende; outra que entra, acende",
    JSON.stringify(M.marcasQueAcendem(M.fotoDoAcervo({ missoes: [{ id: "m1", status: "ativa" }] }), M.fotoDoAcervo({ missoes: [{ id: "m1", status: "concluida" }, { id: "m2", status: "ativa" }] }), { mostrado: { missoes: ["m1"] } })) === JSON.stringify(["diario"]));
  t("`mostrado` null, vazio ou lixo não muda nada", ["x", null, {}, { itens: null }].every((m) => JSON.stringify(M.marcasQueAcendem(a, d, { mostrado: m })) === JSON.stringify(["diario", "inv"])));
  t("o alforje continua a cortar antes de tudo", JSON.stringify(M.marcasQueAcendem(a, d, { origem: "alforje", mostrado: { itens: ["Tocha"] } })) === "[]");
}

/* ============================================================ */
sec("6. A4 — a hora cheia na cinta (formas.md §A1 5)");
{
  const { horaNaCinta } = G;
  const { CINTA } = await import(S + "estilo.js");
  t("o passo da hora é 60, na tabela da cinta", CINTA.passoDaHora === 60);
  t("08:10 → 8h · 00:05 → 0h · 23:59 → 23h · 14:30 → 14h", horaNaCinta("08:10") === "8h" && horaNaCinta("00:05") === "0h" && horaNaCinta("23:59") === "23h" && horaNaCinta("14:30") === "14h");
  t("o minuto também serve, e passa da meia-noite", horaNaCinta(490) === "8h" && horaNaCinta(24 * 60 + 70) === "1h");
  t("às 7h59 e às 8h00 a pílula vira junto com a luz (luzDaHora trunca a mesma hora)", horaNaCinta("07:59") === "7h" && horaNaCinta("08:00") === "8h");
  t("lixo não derruba: o texto que não é hora volta como veio", horaNaCinta("amanhecer") === "amanhecer" && horaNaCinta(null) === "0h" && horaNaCinta(NaN) === "");
}

/* ============================================================ */
sec("7. A7 — o custo onde surpreende, e a legenda em língua de mundo (formas.md §A1 6)");
{
  const { casasQueSurpreendem, legendaDoPasso } = G;
  const grid = await import(S + "grid.js");
  /* uma planta lisa: nenhuma casa surpreende */
  const mapaLiso = new Map([["5,5", 1.5], ["6,6", 1.5], ["7,5", 3], ["5,8", 4.5]]);
  const s = casasQueSurpreendem(mapaLiso, { x: 5, y: 4 });
  t("o custo igual ao que o olho conta não se escreve; o diferente sim", s.has("7,5") === false && s.has("5,5") === false && s.has("6,6") === true && s.has("5,8") === true, [...s].join(" "));
  t("null, Map vazio e herói sem lugar: nenhuma", casasQueSurpreendem(null, { x: 1, y: 1 }).size === 0 && casasQueSurpreendem(new Map([["1,1", 1.5]]), null).size === 0);
  /* contra a MESMA busca da tela, numa planta de verdade */
  /* a estrada: a encosta (terreno difícil) começa na linha 9; o herói em (5,8) */
  const g = { cenario: "estrada", largura: 18, altura: 12, paredes: [], estorvos: [] };
  let custos = new Map();
  try { custos = grid.custosDe(g, { x: 5, y: 8 }, { deslocamentoM: 9 }); } catch (e) { custos = new Map(); }
  const dificil = (() => { try { return grid.terrenoDificil(g, 5, 9); } catch (e) { return false; } })();
  if (custos.size && dificil) {
    const sur = casasQueSurpreendem(custos, { x: 5, y: 8 });
    t("na estrada, a casa da encosta surpreende e a da estrada não", sur.has("5,9") && !sur.has("5,7"), [...sur].join(" "));
    t("o 2 do terreno difícil é o MESMO de custosDe: um passo na encosta custa 3 m", custos.get("5,9") === 3 && custos.get("5,7") === 1.5, `${custos.get("5,9")} ${custos.get("5,7")}`);
    t("a legenda diz a regra e a exceção: `1,5 m por casa · na encosta, 3 m`", legendaDoPasso(custos, g) === "1,5 m por casa · na encosta, 3 m", legendaDoPasso(custos, g));
    t("com ignoraDificil, só a regra", legendaDoPasso(custos, g, { ignoraDificil: true }) === "1,5 m por casa");
  } else {
    t("a planta de prova tem lama (o formato da grade mudou? ajuste a fixture)", false, `custos ${custos.size}, difícil ${dificil}`);
  }
  t("sem casa difícil acesa, só a regra", legendaDoPasso(new Map([["1,1", 1.5]]), { cenario: "taverna", largura: 12, altura: 9, paredes: [], estorvos: [] }) === "1,5 m por casa");
  t("lixo não derruba", legendaDoPasso(null, null) === "1,5 m por casa");
}

/* ============================================================ */
sec("8. A8 — o rosto de quem não é gente (formas.md §A1 4)");
{
  const { ROSTO_DA_MENTE, rostoDoEnte, GLIFOS } = G;
  const { menteDaCriatura } = await import(S + "adversario.js");
  const rosto = (e) => rostoDoEnte(e, menteDaCriatura(e.nome, e.desc || "", null));
  t("o mapa é besta → fera, morto → morto, e quem não está lá é gente", ROSTO_DA_MENTE.besta === "fera" && ROSTO_DA_MENTE.morto === "morto" && Object.keys(ROSTO_DA_MENTE).length === 2);
  t("os dois glifos existem na família", !!GLIFOS.fera && !!GLIFOS.morto && GLIFOS.fera.de === "lucide:paw-print" && GLIFOS.morto.de === "lucide:bone");
  t("o lobo → fera", rosto({ nome: "lobo 1" }) === "fera");
  t("o lobo esquelético → morto (o morto vem antes do bicho)", rosto({ nome: "lobo esquelético" }) === "morto");
  t("o bandido → gente", rosto({ nome: "bandido" }) === "gente");
  t("um herói chamado Lobo, com classe → gente", rosto({ nome: "Lobo", classe: "Guerreiro" }) === "gente");
  t("null e lixo → gente", rostoDoEnte(null, "besta") === "gente" && rostoDoEnte({ nome: "x" }, "pensa") === "gente");
}

/* ============================================================ */
sec("9. A1/A3 — o relato arrumado: quem mora onde, numa conta só");
{
  const { arrumarORelato, ehEcoDoVerbo, quemCaiu, cabecalhoDaLuta, linhasDaLuta } = G;
  const { fileiraDeVerbos } = await import(S + "tela-de-batalha.js");
  const frases = fileiraDeVerbos().map((v) => v.frase).filter(Boolean);

  t("o eco do verbo cala: `Ataco lobo 1`", ehEcoDoVerbo("Ataco lobo 1", frases));
  t("a frase do verbo sozinha também", ehEcoDoVerbo("Empurro com força", frases) && ehEcoDoVerbo("Seguro a ação e observo, pronto para responder", frases));
  t("a frase livre do `como?` fica", !ehEcoDoVerbo("Empurro com força o lobo contra a mesa, aproveitando o balcão", frases) && !ehEcoDoVerbo("Ataco o lobo pelas costas, rápido.", frases));
  t("e o que não começa por um verbo da fileira fica", !ehEcoDoVerbo("Grito para Isen se abaixar", frases) && !ehEcoDoVerbo("", frases) && !ehEcoDoVerbo(null, frases));

  t("quem caiu: um, vários do mesmo nome, nomes diferentes, ninguém",
    quemCaiu(["lobo 1"]) === "lobo 1 caiu" && quemCaiu(["lobo 1", "lobo 2"]) === "2 lobos caíram"
    && quemCaiu(["Kolvar", "lobo 1"]) === "Kolvar e lobo 1 caíram" && quemCaiu(["a", "b", "c"]) === "a, b e c caíram" && quemCaiu([]) === "" && quemCaiu(null) === "");
  t("o plural só onde não se adivinha (ão, consoante → lista)", quemCaiu(["ladrão 1", "ladrão 2"]) === "ladrão 1 e ladrão 2 caíram" && quemCaiu(["Kobold 1", "Kobold 2"]) === "Kobold 1 e Kobold 2 caíram");
  t("o cabeçalho da T8: `A luta · 2 lobos caíram · 2 rodadas`", cabecalhoDaLuta({ caidos: ["lobo 1", "lobo 2"], rodadas: 2 }) === "A luta · 2 lobos caíram · 2 rodadas");
  t("no telefone as rodadas saem do cabeçalho", cabecalhoDaLuta({ caidos: ["lobo 1", "lobo 2"], rodadas: 2 }, { telefone: true }) === "A luta · 2 lobos caíram");
  t("sem ninguém caído e sem campo: `A luta`", cabecalhoDaLuta({ caidos: [], rodadas: 1 }) === "A luta · 1 rodada" && cabecalhoDaLuta(null) === "A luta");

  /* N2: o 🎲 e o ⚔ do mesmo golpe fundem-se; o ☠ vira `cai`; a vez do mundo vira rótulo */
  const l = linhasDaLuta([
    { texto: "🎲 Brida → lobo 2: d20 18+4=22 vs 14 · acerta, 5 de dano" },
    { texto: "⚔ Brida → lobo 2: 5 de dano · lobo 2 0/4 ☠" },
    { texto: "🌍 VEZ DO MUNDO — rodada 2: os inimigos e o seu grupo agem." },
    { texto: "🎲 lobo 1 → Brida: d20 18+1=19 vs 13 · acerta, 6 de dano" },
    { texto: "🛡 lobo 1 · Rasteira → Brida: 6 de dano" },
    { voz: "jogador", texto: "Giro a lâmina e encaro o último." },
    { texto: "⚔ Todos os inimigos caíram — o combate termina." },
  ]);
  t("N2: o mesmo golpe é UMA linha, com o glifo do golpe e a conta do dado", l[0].glifo === "espadas" && l[0].texto === "Brida → lobo 2: d20 18+4=22 vs 14 · acerta, 5 de dano · cai", JSON.stringify(l[0]));
  t("a vez do mundo vira o rótulo `rodada 2`", l[1].rotulo === "rodada 2");
  t("o golpe deles funde com o dado também (o nome da técnica não separa)", l[2].glifo === "escudo" && /^lobo 1 → Brida: d20 18\+1=19 vs 13/.test(l[2].texto), JSON.stringify(l[2]));
  t("a fala livre do jogador passa na voz dele", l[3].voz === "jogador" && l[3].texto === "Giro a lâmina e encaro o último.");
  t("e o que não é golpe fica com o glifo do assunto", l[4].glifo === "espadas" && l.length === 5);
  t("nenhum ☠ sobra dentro da dobra", l.every((x) => !/☠/u.test(x.texto || "")));

  /* A T8 inteira, como o App a escreve depois de B1/B2 */
  const fim = { caidos: ["lobo 1", "lobo 2"], rodadas: 2, recibo: reciboDoTurno({ moedas: 0, vida: 20, xp: 30 }, { moedas: 7, vida: 17, xp: 44 }), desfecho: "vitoria" };
  const T8 = [
    { autor: "jogador", texto: "Saco a espada e avanço." },
    { autor: "sistema", texto: "⚔ lobo 1 entra no combate! (4 PV)", naLuta: true },
    { autor: "sistema", texto: "○ Encontro fácil — resolve-se sem sustos se ninguém fizer besteira", naLuta: true },
    { autor: "mestre", texto: "Os lobos rosnam.", naLuta: true },
    { autor: "jogador", texto: "Ataco lobo 1", naLuta: true },
    { autor: "sistema", texto: "🎲 Brida → lobo 1: d20 17+4=21 vs 14 · acerta, 8 de dano", naLuta: true },
    { autor: "sistema", texto: "⚔ Brida → lobo 1: 8 de dano · lobo 1 0/4 ☠", naLuta: true },
    { autor: "sistema", texto: "▸ Códex — há o que registrar.", naLuta: true },
    { autor: "sistema", texto: "▸ Mercado — há quem venda por aqui.", naLuta: true },
    { autor: "sistema", texto: "💥 Seus PV chegam a zero — você desaba, inconsciente.", naLuta: true },
    { autor: "sistema", texto: "◉ Espólios: +7 moedas · +14 XP", naLuta: true },
    { autor: "mestre", texto: "O último lobo cai.", naLuta: true, recibo: fim.recibo },
    { autor: "sistema", texto: "⚔ Todos os inimigos caíram — o combate termina.", naLuta: true, fimDaLuta: fim },
    { autor: "jogador", texto: "Limpo a lâmina." },
  ];
  const itens = arrumarORelato(T8, { frasesDosVerbos: frases });
  const tipos = itens.map((x) => x.tipo).join(" ");
  t("a ordem: jogador · mestre · (o que fura) · mestre · a dobra da luta onde ela fechou · jogador", tipos === "jogador mestre bloco mestre luta jogador", tipos);
  const luta = itens.find((x) => x.tipo === "luta");
  t("a dobra leva os golpes e a abertura, e NÃO o eco, o selo do encontro, o Códex nem o espólio",
    luta && luta.linhas.length === 4 && !luta.linhas.some((x) => /Ataco|Encontro|Códex|Espólios/.test(x.texto)), luta && JSON.stringify(luta.linhas.map((x) => x.texto)));
  t("e mora onde a luta fechou, com o fimDaLuta", luta && luta.inicio === 1 && luta.fim === 12 && luta.fimDaLuta === fim);
  const furou = itens.find((x) => x.tipo === "bloco");
  t("a porta e a queda do herói furam a dobra (ficam na cena)", furou && furou.visiveis.some((x) => /^▸ Mercado/.test(x)) && furou.visiveis.some((x) => /PV chegam a zero/.test(x)), furou && JSON.stringify(furou.visiveis));
  t("a prosa do Mestre nunca entra na dobra", itens.filter((x) => x.tipo === "mestre").length === 2 && !luta.linhas.some((x) => /lobos rosnam|último lobo/.test(x.texto)));
  t("o recibo do Mestre chega inteiro à mensagem", itens.filter((x) => x.tipo === "mestre")[1].m.recibo === fim.recibo);

  /* sem fimDaLuta (a luta aberta, ou um save de antes do campo): a forma de hoje */
  const aberta = arrumarORelato(T8.slice(0, 11), { frasesDosVerbos: frases });
  t("sem fimDaLuta, nenhuma dobra da luta: a forma de hoje (o eco fica, o saldo dobra)", !aberta.some((x) => x.tipo === "luta") && aberta.some((x) => x.tipo === "jogador" && x.m.texto === "Ataco lobo 1"));
  t("e mesmo assim o que cala, cala", !JSON.stringify(aberta).includes("Encontro fácil") && !JSON.stringify(aberta).includes("Códex"));

  /* fora da luta: recibo e cala somem; o dia vira a sua dobra */
  const fora = arrumarORelato([
    { autor: "jogador", texto: "Compro uma poção." },
    { autor: "mestre", texto: "O cambista sorri." },
    { autor: "sistema", texto: "⚖ Preço aferido pelo sistema: ◉ 20 (faixa justa ◉ 5–20 pela tabela — o cobrado era ◉ 30)" },
    { autor: "sistema", texto: "Item obtido: Poção de Cura" },
    { autor: "sistema", texto: "📍 Você está na banca dos cambistas." },
    { autor: "sistema", texto: "👑 Coroação em Forte Escura: o povo enche as ruas." },
    { autor: "sistema", texto: "🗞 Corre a boca miúda: o barão deve a todos…" },
    { autor: "sistema", texto: "⛔ A loja fechou." },
  ]);
  t("fora da luta: o recibo e o que a tela já disse não chegam à página", !JSON.stringify(fora).includes("aferido") && !JSON.stringify(fora).includes("Item obtido") && !JSON.stringify(fora).includes("📍"));
  const dia = fora.find((x) => x.tipo === "dia");
  t("o dia vira a sua dobra, com as notícias na ordem", dia && dia.linhas.length === 2 && /^👑/.test(dia.linhas[0]));
  t("e a recusa fica na cena", fora.some((x) => x.tipo === "bloco" && x.visiveis.includes("⛔ A loja fechou.")));
  t("os índices das mensagens não mudam (o `data-msg` e a voz apontam para a mesma)", fora.find((x) => x.tipo === "mestre").i === 1);
  t("null, lixo e vazio não derrubam", JSON.stringify(arrumarORelato(null)) === "[]" && JSON.stringify(arrumarORelato([null, 3, "x"])) === "[]");
  t("a morte e o poder único furam a dobra pela tabela", moradaDaLinha({ autor: "sistema", texto: "☠ Teste de morte: 7 — falha.", naLuta: true }) === "cena" && moradaDaLinha({ autor: "sistema", texto: "🌟 PODER ÚNICO DESPERTOU: Sangue de Dragão (5 PM · recarga 3t) — x", naLuta: true }) === "cena");
}

console.log(`\na1-moradas: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
