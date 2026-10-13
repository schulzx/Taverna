/* O CACHE INTEIRO (v9.162)

   O provedor cobra um décimo pelo prefixo que reconhece do turno
   anterior — byte a byte, do primeiro caractere em diante. A v9.153
   arrumou o fim do prompt (ESTADO DESTE TURNO); esta leva arruma as
   duas serras que sobraram:

   AS PORTAS — 49 blocos so() espalhados pelo meio do texto: qualquer
   porta que virasse (abrir combate, cruzar um portão) invalidava tudo
   dali em diante. Agora moram numa ZONA única antes do ESTADO,
   ordenados por frequência de virada — quem vira pouco protege quem
   vem antes.

   O HISTÓRICO — slice(-30) deslizava uma mensagem por turno; o começo
   da janela mudava e a conversa inteira era cobrada cheia, sempre. A
   janela ANCORADA começa num ponto fixo e só cresce pelo fim; a âncora
   salta uma vez a cada 24 mensagens, e o cache quebra uma vez por
   salto em vez de uma vez por turno.

   MEDIDO NESTA SUÍTE: abrir combate preservava 27–53%% do prefixo;
   agora preserva >90%%. */

const S = "../src/";
const { readFileSync } = await import("node:fs");
const { montarSystemPrompt } = await import(S + "prompt.js");
const { janelaAncorada, JANELA_MIN, SALTO_DA_ANCORA } = await import(S + "janela.js");
const { lexicoDaCena, lexicoPrompt, TETO_DA_CENA } = await import(S + "lexico.js");
const APP = readFileSync(S + "App.jsx", "utf8");
const PROMPT = readFileSync(S + "prompt.js", "utf8");

let bons = 0, maus = 0;
const t = (n, c) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n); } };
const sec = (s) => console.log("\n" + s);

const pers = { nome: "X", atributos: { forca: 1, destreza: 1, vigor: 1, intelecto: 1, presenca: 1, percepcao: 1 }, vida: 10, vidaMax: 10, mana: 8, manaMax: 8, nivel: 1 };
const montar = (cena, lexico = null) => montarSystemPrompt("T", { genero: "Fantasia medieval", ...(lexico ? { lexico } : {}) }, pers, null, {}, "", "", "", "", "", "", "", cena);
const prefixo = (a, b) => { let i = 0; const m = Math.min(a.length, b.length); while (i < m && a[i] === b[i]) i++; return i / a.length; };

sec("1. AS PORTAS MORAM NUMA ZONA SÓ, ANTES DO ESTADO");
{
  const s = montar({ emCidade: true });
  const iZona = s.indexOf("REGRAS DA CENA ABERTA");
  const iEstado = s.indexOf("═══════════════ ESTADO DESTE TURNO");
  t("a zona existe", iZona > 0);
  t("no fundo do texto (>90%)", iZona / s.length > 0.9);
  t("e antes do estado", iZona < iEstado);
  /* nenhuma porta sobrou no meio: fora da zona, o texto é o mesmo em
     qualquer cena */
  const antesA = montar({ emCidade: true }).slice(0, iZona);
  const antesB = montar({ emCombate: true, emMasmorra: true }).slice(0, iZona);
  t("antes da zona, o texto não depende da cena", antesA === antesB);
  /* dentro da zona, quem vira pouco vem antes de quem vira muito: a
     ficha protege o lugar, o lugar protege a luta */
  const luta = montar({ emCombate: true, conjura: true, temMercado: true });
  const zona = luta.slice(luta.indexOf("REGRAS DA CENA ABERTA"));
  const iMagia = zona.indexOf("MAGIAS (v9.30)");
  const iMercado = zona.indexOf("MERCADO E COMÉRCIO");
  const iCombate = zona.indexOf("REAÇÕES (v9.5");
  t("a ficha vem antes do lugar", iMagia > 0 && iMercado > 0 && iMagia < iMercado);
  t("e o lugar antes da luta", iMercado < iCombate);
}

sec("2. VIRAR UMA PORTA PRESERVA O GROSSO DO PREFIXO");
{
  /* a medida que justifica a leva: antes era 27–53% */
  const paz = montar({ emCidade: true });
  const luta = montar({ emCidade: true, emCombate: true });
  const pLuta = prefixo(paz, luta);
  t(`abrir combate preserva ${(pLuta * 100).toFixed(0)}% (>90%)`, pLuta > 0.9);
  const estrada = montar({ emCidade: false, emViagem: true });
  const pViagem = prefixo(paz, estrada);
  t(`trocar de cena preserva ${(pViagem * 100).toFixed(0)}% (>85%)`, pViagem > 0.85);
}

sec("3. O LÉXICO NÃO REESCREVE MAIS O TOPO");
{
  const lex = { gerado: true, chamado: {}, aLei: "ferro frio afasta o mal", naoExiste: [], lugares: [], funciona: { cidade: "muros de sal e sino", masmorra: "portal que não fecha" }, povos: [] };
  /* o bloco fixo é o mesmo em qualquer cena — é isso que o torna cacheável */
  t("o bloco fixo não lê portas", /export function lexicoPrompt\(l\) \{/.test(readFileSync(S + "lexico.js", "utf8")));
  const naCidade = montar({ emCidade: true }, lex);
  const naEstrada = montar({ emViagem: true, emCidade: false }, lex);
  const iZona = naCidade.indexOf("REGRAS DA CENA ABERTA");
  t("a lei do mundo continua no topo, nas duas cenas", naCidade.slice(0, iZona).includes("ferro frio") && naEstrada.includes("ferro frio"));
  t("a adaptação da cena desce para a zona", naCidade.indexOf("muros de sal e sino") > iZona);
  t("e some quando a cena fecha", !naEstrada.includes("muros de sal e sino"));
  t("com orçamento próprio e menor", lexicoDaCena(lex, { cidade: true, masmorra: true }).length <= TETO_DA_CENA);
}

sec("4. A JANELA ANCORADA — o histórico para de serrar");
{
  const msg = (i) => ({ role: i % 2 ? "assistant" : "user", content: "m" + i });
  const conversa = (n) => Array.from({ length: n }, (_, i) => msg(i));
  /* enquanto a âncora não salta, a janela de ontem é PREFIXO da de hoje:
     é exatamente isso que o cache precisa */
  let serrou = 0, saltos = 0;
  for (let n = JANELA_MIN; n < 200; n++) {
    const ontem = janelaAncorada(conversa(n));
    const hoje = janelaAncorada(conversa(n + 1));
    const ehPrefixo = ontem.every((m, i) => hoje[i] && hoje[i].content === m.content);
    if (!ehPrefixo) { saltos++; } else if (hoje.length <= ontem.length) serrou++;
  }
  t("a janela nunca desliza — só cresce ou salta", serrou === 0);
  t(`e salta raramente (${saltos} saltos em 176 turnos ≈ 1 a cada ${Math.round(176 / Math.max(1, saltos))})`, saltos > 0 && saltos <= Math.ceil(176 / (SALTO_DA_ANCORA / 2)) + 1);
  /* o tamanho respira entre o piso e o teto */
  let min = 1e9, max = 0;
  for (let n = 60; n < 200; n++) { const j = janelaAncorada(conversa(n)).length; if (j < min) min = j; if (j > max) max = j; }
  t(`o tamanho respira entre ${min} e ${max}`, min >= JANELA_MIN - 1 && max < JANELA_MIN + SALTO_DA_ANCORA);
  /* a primeira mensagem é sempre do jogador — janela que abre com resposta
     é conversa começando pela metade */
  let abremCerto = true;
  for (let n = 1; n < 200; n++) { const j = janelaAncorada(conversa(n)); if (j.length && j[0].role !== "user") abremCerto = false; }
  t("toda janela abre na fala do jogador", abremCerto);
  t("conversa curta entra inteira", janelaAncorada(conversa(10)).length === 10);
  t("lixo não quebra", janelaAncorada(null).length === 0 && janelaAncorada([{ solta: true }]).length === 0);
  /* e é ELA que o App usa — nas duas chamadas, inclusive o reforço.
     v9.465: as asserções MUDARAM DE FORMA, não de intenção. A janela agora
     passa por pedidoNaOrdemDoCache antes de viajar, e o reforço reaproveita
     o pedido já arrumado (pedido.messages) — que É a janela ancorada, com a
     mensagem do turno acrescida do que vira. Procurar a chamada antiga
     literal faria esta suíte reprovar a própria melhoria. */
  t("o App a usa na chamada", /pedido = \{ system, messages: janelaAncorada\(historico\) \}/.test(APP) && /chamarModelo\(pedido\.system, pedido\.messages, 3600/.test(APP));
  t("e no reforço", /\[\.\.\.pedido\.messages,/.test(APP) && /chamarModelo\(pedido\.system, reforco, 3600/.test(APP));
  t("o slice deslizante morreu", !/historico\.slice\(-JANELA_DE_HISTORICO\)/.test(APP));
}

sec("5. O PEDIDO NA ORDEM DO CACHE (v9.465) — o histórico deixa de pagar cheio");
{
  /* O fim do system não é o fim do pedido: depois dele vem o histórico.
     Com o ESTADO no rabo do system, a primeira diferença do turno caía
     ANTES da conversa inteira, e ela — igual — era cobrada cheia. Medido
     na 10.ª sessão (79 chamadas): prefixo de 51%, cache de 47%. Refeito
     sobre os mesmos pedidos com esta arrumação: 69%. */
  const { pedidoNaOrdemDoCache, MARCA_DA_CENA_ABERTA, MARCA_DO_RODAPE } = await import(S + "prompt.js");
  const { ETIQUETA_DO_PEDIDO } = await import(S + "escuta.js");
  const montarT = (cena, tempo) => montarSystemPrompt("T", { genero: "Fantasia medieval" }, pers, null, {}, "", "", "", "", tempo, "", "", cena);
  const hist = [{ role: "user", content: "[PAUTA DO TURNO 1] entro na taverna" }, { role: "assistant", content: "{\"narrativa\":\"A porta range.\"}" }];
  const turno = (n, frase) => ({ role: "user", content: `[PAUTA DO TURNO ${n}] o que o sistema decidiu\n${MARCA_DO_RODAPE} Agora: dia ${n}.\n${ETIQUETA_DO_PEDIDO}\n${frase}` });
  const s1 = montarT({ emCidade: true }, "TEMPO DA CAMPANHA: dia 1, 09:00");
  const s2 = montarT({ emCidade: true, emCombate: true }, "TEMPO DA CAMPANHA: dia 1, 09:10");
  t("a marca da zona é a do texto montado", s1.includes(MARCA_DA_CENA_ABERTA));
  t("e o App abre o rodapé por ela (sem isto o corte cai no fallback calado)", APP.includes("const rodape = `" + MARCA_DO_RODAPE));
  const p1 = pedidoNaOrdemDoCache(s1, [...hist, turno(1, "peço uma cerveja")]);
  const p2 = pedidoNaOrdemDoCache(s2, [...hist, { role: "user", content: "x" }, { role: "assistant", content: "y" }, turno(2, "saco a espada")]);
  t("o system viaja sem a zona nem o ESTADO", !p1.system.includes(MARCA_DA_CENA_ABERTA) && !p1.system.includes("ESTADO DESTE TURNO ═"));
  t("e é IGUAL com outra cena e outra hora — é isso que o torna cacheável", p1.system === p2.system);
  const u = p1.messages[p1.messages.length - 1].content;
  t("a zona e o ESTADO descem para a mensagem do turno", u.includes(MARCA_DA_CENA_ABERTA) && u.includes("TEMPO DA CAMPANHA: dia 1, 09:00"));
  t("nesta ordem: pauta, zona, ESTADO, rodapé", u.indexOf("[PAUTA DO TURNO 1]") < u.indexOf(MARCA_DA_CENA_ABERTA) && u.indexOf(MARCA_DA_CENA_ABERTA) < u.indexOf("ESTADO DESTE TURNO ═") && u.indexOf("ESTADO DESTE TURNO ═") < u.indexOf(MARCA_DO_RODAPE));
  /* MM18: a frase do jogador é a última coisa que o Narrador lê */
  t("a frase do jogador continua a ser a última linha", u.endsWith(`${ETIQUETA_DO_PEDIDO}\npeço uma cerveja`));
  const soma = (p) => p.system.length + p.messages.reduce((a, m) => a + m.content.length, 0);
  const antes = s1.length + [...hist, turno(1, "peço uma cerveja")].reduce((a, m) => a + m.content.length, 0);
  t(`nada se perdeu nem se somou (${soma(p1) - antes} caracteres de diferença, só costura)`, Math.abs(soma(p1) - antes) <= 4);
  t("o histórico passa intocado", p1.messages[0] === hist[0] && p1.messages[1] === hist[1]);
  /* o prefixo de dois turnos seguidos cobre o system E a conversa */
  const ser = (p) => p.system + "\u0000" + p.messages.map((m) => m.role + ":" + m.content).join("\u0000");
  const a = pedidoNaOrdemDoCache(s1, [...hist, turno(1, "peço uma cerveja")]);
  const histDepois = [...hist, { role: "user", content: "[PAUTA DO TURNO 1] o que o sistema decidiu" }, { role: "assistant", content: "{\"narrativa\":\"Ela chega.\"}" }];
  const b = pedidoNaOrdemDoCache(s2, [...histDepois, turno(2, "saco a espada")]);
  const pre = (() => { const x = ser(a), y = ser(b); let i = 0; while (i < x.length && x[i] === y[i]) i++; return i; })();
  t("virar a cena e a hora não corta o prefixo antes da conversa", pre > a.system.length + hist.reduce((s, m) => s + m.content.length, 0));
  /* sem rodapé no meio (o pedido que é só rodapé + frase), o vivo abre a
     mensagem e a frase segue no fim */
  const soFrase = pedidoNaOrdemDoCache(s1, [{ role: "user", content: `${MARCA_DO_RODAPE} Agora.\n${ETIQUETA_DO_PEDIDO}\nolho em volta` }]);
  const uf = soFrase.messages[0].content;
  t("rodapé à cabeça: o vivo abre, a frase fecha", uf.startsWith(MARCA_DA_CENA_ABERTA) && uf.endsWith("olho em volta"));
  /* nunca pode custar o turno: o que não reconhece, devolve como veio */
  const semMarca = pedidoNaOrdemDoCache("só regras", [{ role: "user", content: "oi" }]);
  t("system sem a zona passa como veio", semMarca.system === "só regras" && semMarca.messages[0].content === "oi");
  const fimAssist = pedidoNaOrdemDoCache(s1, [{ role: "assistant", content: "z" }]);
  t("e quem não termina no jogador também", fimAssist.system === s1);
  let estourou = false; try { pedidoNaOrdemDoCache(null, null); pedidoNaOrdemDoCache(s1, [null]); } catch { estourou = true; }
  t("lixo não estoura", !estourou);
}

console.log(`\ncache v9.162: ${bons} passaram, ${maus} falharam`);
process.exit(maus ? 1 : 0);
