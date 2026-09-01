/* teste-geografo.mjs (v9.104) — o conselheiro do espaço e a Pauta.
   "O que o lugar PERMITE" é o julgamento que ninguém fazia: hoje quem
   arbitra é a IA, e ela arbitra sempre a favor da cena que já tem na
   cabeça — que é a cena grande. */
import {
  AFORDANCIAS, TETO_PERMITE, TETO_IMPEDE, afordanciaPorId,
  garantirEspaco, consultarGeografo, linhaDoLugar, quemNaoChega, paraPauta, GEOGRAFO_PROMPT,
} from "../src/geografo.js";
import {
  SECOES, TETO_DA_PAUTA, secaoPorId, garantirPauta, porNaPauta, pautaVazia,
  textoDaPauta, tamanhoCruDaPauta, PAUTA_PROMPT,
} from "../src/pauta.js";
import { TIPOS_DE_LUGAR } from "../src/lexico.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);

sec("1) O ACERVO SE FECHA");
{
  console.log(`  ${AFORDANCIAS.length} afordâncias`);
  ok(AFORDANCIAS.length >= 25, "o acervo tem tamanho");
  ok(AFORDANCIAS.every((a) => a.id && typeof a.quando === "function"), "toda afordância tem id e condição");
  ok(AFORDANCIAS.every((a) => a.permite || a.impede), "e diz alguma coisa — abre ou fecha, ou as duas");
  const ids = AFORDANCIAS.map((a) => a.id);
  ok(new Set(ids).size === ids.length, "sem ids repetidos");
  ok(!!afordanciaPorId("apertado") && !afordanciaPorId("inventada"), "a busca por id acha e não inventa");
  /* A CATRACA: todo campo que um `quando` lê tem de existir na situação
     normalizada. Um campo lido e nunca entregue é `undefined` em silêncio
     — a condição vira falsa para sempre e a afordância nunca dispara. */
  const campos = Object.keys(garantirEspaco(null));
  const lidos = new Set();
  for (const a of AFORDANCIAS) {
    for (const m of String(a.quando).matchAll(/e\.([a-zA-Z]+)/g)) lidos.add(m[1]);
  }
  const orfaos = [...lidos].filter((c) => !campos.includes(c));
  ok(orfaos.length === 0, `todo campo lido pelas condições existe na situação${orfaos.length ? ": ÓRFÃOS " + orfaos.join(", ") : ` (${lidos.size} lidos de ${campos.length})`}`);
  /* e o contrário: campo entregue que ninguém lê é peso morto */
  const mortos = campos.filter((c) => !lidos.has(c) && !["rotulo"].includes(c));
  ok(mortos.length === 0, `e todo campo entregue tem quem o leia${mortos.length ? ": MORTOS " + mortos.join(", ") : ""}`);
  /* os tipos de lugar do acervo têm de ser os do léxico e do código */
  const tiposLidos = [...String(AFORDANCIAS.map((a) => a.quando).join()).matchAll(/tipoDoLocal === "([^"]+)"/g)].map((m) => m[1]);
  const fora = tiposLidos.filter((t) => !TIPOS_DE_LUGAR.includes(t));
  ok(fora.length === 0, `os tipos de lugar do acervo são os do código${fora.length ? ": FORA " + fora.join(", ") : ` (${new Set(tiposLidos).size} cobertos)`}`);
}

sec("2) A SITUAÇÃO NORMALIZA QUALQUER COISA");
{
  const e = garantirEspaco(null);
  ok(e.tipo === "nenhum" && e.luz === "clara" && e.saidas === 2, "sem nada, os padrões seguros");
  ok(garantirEspaco("lixo").cabem === 8, "lixo de tipo errado não quebra");
  ok(garantirEspaco({ saidas: "três" }).saidas === 2, "número que não é número cai no padrão");
  ok(garantirEspaco({ apertado: 1 }).apertado === true, "os booleanos são booleanos");
  ok(garantirEspaco({ inventado: 9 }).inventado === undefined, "campo que o esquema não conhece não entra");
}

sec("3) O QUE O LUGAR PERMITE");
{
  const corredor = consultarGeografo({ apertado: true, emCombate: true, cabem: 3, saidas: 1, emMasmorra: true });
  console.log("  corredor · permite: " + corredor.permite.join(" | "));
  console.log("  corredor · impede:  " + corredor.impede.join(" | "));
  ok(corredor.impede.some((t) => /cercar por vários lados/.test(t)), "um corredor não comporta cercar por vários lados");
  ok(corredor.permite.length > 0, "e ainda assim ABRE alguma coisa — o acervo não é lista de proibição");

  const campo = consultarGeografo({ aberto: true, bioma: "planicie", gentePorPerto: 0 });
  console.log("  campo aberto · permite: " + campo.permite.join(" | "));
  ok(campo.permite.some((t) => /correr|cercar|montar/.test(t)), "o campo aberto comporta correr e cercar");

  const pantano = consultarGeografo({ aberto: true, bioma: "pantano" });
  ok(pantano.impede.some((t) => /cavalgar/.test(t)), "no pântano não se cavalga a galope");
  ok(!pantano.permite.some((t) => /montar/.test(t)), "e a permissão de montar não aparece junto — seria contradição na mesma resposta");

  const taverna = consultarGeografo({ dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6 });
  ok(taverna.impede.some((t) => /aço|segredo/.test(t)), "a taverna cheia não comporta segredo nem aço");

  const templo = consultarGeografo({ dentro: true, tipoDoLocal: "templo" });
  ok(templo.impede.some((t) => /sangue/.test(t)), "no templo não corre sangue");

  /* OS TETOS: uma resposta longa demais é uma resposta que ninguém lê */
  const tudo = consultarGeografo({ apertado: true, emCombate: true, cabem: 2, saidas: 1, luz: "escuro", agua: true, alto: true, dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 9, emMasmorra: true, noite: true });
  ok(tudo.permite.length <= TETO_PERMITE && tudo.impede.length <= TETO_IMPEDE, `os tetos mordem (${tudo.permite.length}/${tudo.impede.length} de ${TETO_PERMITE}/${TETO_IMPEDE}, ${tudo.quantas} candidatas)`);
  ok(tudo.quantas > TETO_PERMITE + TETO_IMPEDE, "e havia mais candidatas do que cabia");

  /* UMA AFORDÂNCIA QUEBRADA NÃO PASSA — a mesma decisão do Bibliotecário
     na v9.85: uma lacuna nunca vira permissão */
  const bomba = { id: "bomba", quando: () => { throw new Error("x"); }, permite: "nunca deveria aparecer" };
  AFORDANCIAS.push(bomba);
  const r = consultarGeografo({ aberto: true });
  AFORDANCIAS.pop();
  ok(!r.permite.includes("nunca deveria aparecer"), "afordância que estoura é CORTADA, não passada");
}

sec("4) ONDE SE ESTÁ, EM UMA LINHA");
{
  const mapa = { cidades: [{ nome: "Vado", regiao: "Vale Baixo", x: 50, y: 50 }] };
  ok(/em Vado/.test(linhaDoLugar({ cidadeAtual: "Vado", mapa })), "na cidade");
  ok(/caminho de Ker/.test(linhaDoLugar({ jornada: { de: "Vado", para: "Ker" } })), "na estrada");
  ok(/Cripta/.test(linhaDoLugar({ masmorra: { nome: "a Cripta", atual: 3 } })), "na masmorra");
  ok(/moinho/.test(linhaDoLugar({ lugar: { nome: "o moinho de cima", cidade: "Vado", distancia: "arredores" }, cidadeAtual: "Vado", mapa })), "num lugar nomeado");
  ok(linhaDoLugar({}).length > 0, "e sem nada ainda diz alguma coisa");
  ok(/chuva/.test(linhaDoLugar({ cidadeAtual: "Vado", mapa, clima: "chuva" })), "o clima entra na linha");
  /* a palavra do mundo */
  const lex = { gerado: true, chamado: { masmorra: "portal" } };
  ok(/portal/.test(linhaDoLugar({ masmorra: { nome: "a Fenda", atual: 1 }, lex })), "e a masmorra é chamada pelo nome que tem neste mundo");
  /* o sítio do acampamento manda quando há um */
  ok(/sob um afloramento/.test(linhaDoLugar({ cidadeAtual: "Vado", mapa, sitio: { texto: "sob um afloramento de rocha" } })), "acampado, o sítio manda");
}

sec("5) QUEM NÃO CHEGA A TEMPO");
{
  const longe = [{ nome: "Cedric", onde: "Monte do Vigia", dias: 2 }, { nome: "Iris", onde: "Ker", dias: 5 }];
  const l = quemNaoChega(longe);
  console.log("  " + l.join("\n  "));
  ok(l.length === 2, "os dois entram");
  ok(/48h/.test(l[0]), "os dias viram HORAS — é o julgamento que o elenco não fazia");
  ok(l[0].includes("Cedric"), "e o mais perto vem primeiro, que é o que mais provavelmente aparece por engano");
  ok(quemNaoChega([]).length === 0 && quemNaoChega(null).length === 0, "sem ninguém longe, nada");
  ok(quemNaoChega([{ nome: "x", onde: "y", dias: 0 }]).length === 0, "quem está a zero dias está aqui");
  ok(quemNaoChega(longe, { quantos: 1 }).length === 1, "e o teto morde");
}

sec("6) A PAUTA");
{
  ok(SECOES.length >= 8, `${SECOES.length} seções`);
  ok(SECOES.every((s) => s.id && s.rotulo && s.prio && s.o), "cada seção tem id, rótulo, prioridade e propósito");
  const ids = SECOES.map((s) => s.id);
  ok(new Set(ids).size === ids.length, "sem ids repetidos");
  ok(!!secaoPorId("onde") && !secaoPorId("inventada"), "a busca por id acha e não inventa");
  /* as duas que nunca caem */
  const onde = secaoPorId("onde"), veto = secaoPorId("naoPode");
  ok(onde.prio <= 2 && veto.prio <= 2, "ONDE e NÃO PODE têm a prioridade mais alta — cortar um veto é como a incoerência entra");

  ok(pautaVazia(garantirPauta(null)) && textoDaPauta(null) === "", "pauta vazia não vira bloco nenhum");
  let p = porNaPauta(null, "onde", "numa taverna cheia");
  p = porNaPauta(p, "naoPode", "o lugar não comporta segredo");
  p = porNaPauta(p, "inventada", "isto não existe");
  ok(!p.inventada, "seção que não existe não entra");
  ok(porNaPauta(p, "onde", "", null).onde.length === 1, "linha vazia não entra");
  ok(porNaPauta(p, "onde", "numa taverna cheia").onde.length === 1, "e a repetida também não");

  const t = textoDaPauta(p, { turno: 41 });
  console.log("\n" + t + "\n");
  ok(/^\[PAUTA DO TURNO 41/.test(t), "o bloco se identifica com o turno");
  ok(/ONDE/.test(t) && /NÃO PODE/.test(t), "e traz as seções preenchidas");
  /* o CABEÇALHO diz "o QUE e o COM QUEM", e QUEM é rótulo de seção: procurar
     no texto inteiro acha o cabeçalho. O corpo é o que se mede. */
  const corpo = t.split("\n").slice(1).join("\n");
  ok(!/^(QUEM|MOMENTO|FORMA)/m.test(corpo), "as seções vazias não aparecem");
  ok(/o QUE e o COM QUEM/.test(t), "e o cabeçalho diz onde acaba a autoridade dele");
}

sec("7) O ORÇAMENTO DA PAUTA MORDE");
{
  /* uma pauta gigantesca: dez seções com cinco linhas longas cada */
  let p = garantirPauta(null);
  for (const s of SECOES) {
    for (let i = 0; i < 5; i++) p = porNaPauta(p, s.id, `${s.id}-${i} ` + "z".repeat(90));
  }
  const cru = tamanhoCruDaPauta(p);
  const t = textoDaPauta(p);
  console.log(`  cru ${cru} · cortado ${t.length} · teto ${TETO_DA_PAUTA}`);
  ok(cru > TETO_DA_PAUTA * 2, "a pauta crua estourava o teto com folga");
  ok(t.length <= TETO_DA_PAUTA, "e o texto cabe no orçamento");
  /* e o corte é por PRIORIDADE: o que nunca cai continua lá */
  ok(t.includes("onde-0"), "a primeira linha de ONDE sobrevive");
  ok(t.includes("naoPode-0"), "e a primeira do veto também");
  ok(!t.includes("antes-4"), "e a última da seção de menor prioridade cai");
  /* dentro de uma seção, a primeira linha resiste mais que a última */
  const iP = t.indexOf("onde-0"), iU = t.indexOf("onde-4");
  ok(iP >= 0 && (iU < 0 || iU > iP), "dentro de uma seção, a primeira linha resiste mais");
  /* e a ordem de LEITURA é a da lista, não a do corte */
  const corpo2 = t.split("\n").slice(1).join("\n");
  const pos = SECOES.map((s) => corpo2.indexOf("\n" + s.rotulo)).map((i, k) => (k === 0 && corpo2.startsWith(SECOES[0].rotulo) ? 0 : i)).filter((i) => i >= 0);
  ok(pos.every((v, i, a) => i === 0 || v > a[i - 1]), "e o texto sai na ordem de leitura, não na ordem do corte");
}

sec("8) A PAUTA DO GEÓGRAFO, DE PONTA A PONTA");
{
  const mapa = { cidades: [{ nome: "Vado", regiao: "Vale Baixo", x: 50, y: 50 }] };
  const r = paraPauta({
    espaco: { dentro: true, tipoDoLocal: "taverna", publico: true, gentePorPerto: 6, porte: "cidade" },
    cidadeAtual: "Vado", mapa,
    longe: [{ nome: "Cedric", onde: "Monte do Vigia", dias: 2 }],
  });
  let p = porNaPauta(null, "onde", r.onde);
  p = porNaPauta(p, "naoPode", r.naoPode);
  const t = textoDaPauta(p, { turno: 7 });
  console.log("\n" + t + "\n");
  ok(/em Vado/.test(t), "a Pauta diz onde");
  ok(/comporta:/.test(t), "e o que o lugar comporta");
  ok(/não comporta:/.test(t), "e o que ele não comporta, do lado dos vetos");
  ok(/Cedric/.test(t) && /48h/.test(t), "e quem não chega a tempo");
  ok(t.length <= TETO_DA_PAUTA, `e cabe no orçamento (${t.length})`);
  /* o que o Geógrafo NÃO faz */
  ok(!/cheira|escuro e|luz d|adjetiv/i.test(t), "e não descreve nada — a textura continua sendo do Narrador");
}

sec("9) OS BLOCOS DE PROMPT");
{
  ok(/DISTÂNCIA É TEMPO/.test(GEOGRAFO_PROMPT), "o bloco do Geógrafo diz que distância é tempo");
  ok(/não comporta/.test(GEOGRAFO_PROMPT), "e explica o que 'comporta' quer dizer");
  ok(/O COMO é seu/.test(PAUTA_PROMPT), "o bloco da Pauta devolve o COMO ao Narrador");
  ok(/veto/.test(PAUTA_PROMPT), "e diz que NÃO PODE é veto");
  ok(GEOGRAFO_PROMPT.length + PAUTA_PROMPT.length < 1400, `e os dois juntos cabem em ${GEOGRAFO_PROMPT.length + PAUTA_PROMPT.length} caracteres`);
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
