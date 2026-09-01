/* teste-aliado.mjs (v9.108) — quem anda comigo quer alguma coisa.
   Fora do combate o companheiro era móvel: `companheiros.js` dá classe e
   decisão de luta, `vinculos.js` dá um número, e mais nada. */
import fs from "node:fs";
import {
  VONTADES, CODIGOS, OPINIOES, MOVIMENTOS, DIAS_ATE_APODRECER, CALADO_ATE_FALAR,
  vontadePorId, codigoPorId, opiniaoPorId, movimentoPorId,
  garantirAliado, garantirAliados, nascerAliado, andarVontade, cruzouOCodigo,
  garantirCena, podeFalar, oQueOAliadoFaz, oQueEleAchou, paraPauta, ALIADO_PROMPT,
} from "../src/aliado.js";

let falhas = 0;
const ok = (c, t) => { if (!c) { falhas++; console.log("  FALHA:", t); } else console.log("  ok:", t); };
const sec = (t) => console.log(`\n[${t}]`);
const app = fs.readFileSync("../src/App.jsx", "utf8");

sec("1) OS ACERVOS SE FECHAM");
{
  console.log(`  ${VONTADES.length} vontades · ${CODIGOS.length} códigos · ${OPINIOES.length} opiniões · ${MOVIMENTOS.length} movimentos`);
  ok(VONTADES.every((v) => v.id && v.o && v.etapas && v.etapas.length === 3 && v.apodrece), "toda vontade tem três etapas E um jeito de apodrecer");
  ok(CODIGOS.every((c) => c.id && c.o && typeof c.cruzou === "function"), "todo código diz o que é e sabe quando foi cruzado");
  ok(OPINIOES.every((o) => o.id && o.faz && (o.sinal === 1 || o.sinal === -1)), "toda opinião é um ATO com um sinal");
  ok(MOVIMENTOS.every((m) => m.id && typeof m.faz === "function" && typeof m.quando === "function"), "todo movimento é uma função do momento");
  const ids = [...VONTADES, ...CODIGOS, ...OPINIOES, ...MOVIMENTOS].map((x) => x.id);
  ok(new Set(ids).size === ids.length, "sem ids repetidos entre os quatro acervos");
  ok(!!vontadePorId("achar_irmao") && !vontadePorId("x") && !!codigoPorId("palavra_dada") && !!opiniaoPorId("cansou") && !!movimentoPorId("vai_embora"), "as buscas por id acham e não inventam");

  /* A CATRACA sobre a situação de cena */
  const campos = Object.keys(garantirCena(null));
  const lidos = new Set();
  for (const m of MOVIMENTOS) { for (const x of String(m.quando).matchAll(/a\.([a-zA-Z]+)/g)) lidos.add(x[1]); for (const x of String(m.faz).matchAll(/a\.([a-zA-Z]+)/g)) lidos.add(x[1]); }
  for (const o of OPINIOES) for (const x of String(o.quando).matchAll(/a\.([a-zA-Z]+)/g)) lidos.add(x[1]);
  for (const x of String(podeFalar).matchAll(/a\.([a-zA-Z]+)/g)) lidos.add(x[1]);
  const orfaos = [...lidos].filter((c) => !campos.includes(c));
  ok(orfaos.length === 0, `todo campo lido existe na situação${orfaos.length ? ": ÓRFÃOS " + orfaos.join(", ") : ` (${lidos.size} de ${campos.length})`}`);
  const mortos = campos.filter((c) => !lidos.has(c));
  ok(mortos.length === 0, `e todo campo entregue tem quem o leia${mortos.length ? ": MORTOS " + mortos.join(", ") : ""}`);
  /* nenhum movimento escreve fala */
  const comFala = MOVIMENTOS.filter((m) => { try { return /["“”]|\bdiz:/.test(m.faz({ vontadeTexto: "x", atritoCom: "y", codigoTexto: "z", apodrecerTexto: "w" })); } catch { return false; } });
  ok(comFala.length === 0, "e nenhum escreve fala — a voz do companheiro é do Narrador");
}

sec("2) A ALMA NASCE COM O NOME, E NÃO MUDA");
{
  const a = nascerAliado("Ubba"), b = nascerAliado("Ubba");
  ok(a.vontade === b.vontade && a.codigos.join() === b.codigos.join(), "o mesmo nome dá sempre a mesma alma — em qualquer save");
  ok(nascerAliado("Marta").vontade !== undefined, "e gente diferente tem alma diferente");
  ok(a.codigos.length === 2 && a.codigos[0] !== a.codigos[1], "dois códigos, e não o mesmo duas vezes");
  ok(garantirAliado({ vontade: "inventada" }).vontade === "", "vontade que não existe é descartada");
  ok(garantirAliado({ codigos: ["x", "palavra_dada"] }).codigos.length === 1, "e código idem");
  ok(garantirAliado(null).etapa === 0 && garantirAliados("lixo") && Object.keys(garantirAliados("lixo")).length === 0, "lixo não quebra");
}

sec("3) A VONTADE ANDA — OU APODRECE SOZINHA");
{
  let a = nascerAliado("Ubba");
  ok(a.etapa === 0 && a.parada === 0, "começa parada no zero");
  a = andarVontade(a, { ajudou: true });
  ok(a.etapa === 1 && a.parada === 0, "com ajuda, anda uma etapa e zera a espera");
  let b = nascerAliado("Ubba");
  for (let d = 0; d < DIAS_ATE_APODRECER - 1; d++) b = andarVontade(b, { ajudou: false });
  ok(!b.apodreceu, `depois de ${DIAS_ATE_APODRECER - 1} dias sem ajuda, ainda espera`);
  b = andarVontade(b, { ajudou: false });
  ok(b.apodreceu, "e no dia seguinte APODRECE — é isto que a torna real em vez de decorativa");
  ok(andarVontade(b, { ajudou: true }).etapa === b.etapa, "depois de apodrecida, ajudar já não anda");
  ok(andarVontade(garantirAliado({ saiu: true }), { ajudou: true }).etapa === 0, "e quem saiu não anda mais");
  /* toda vontade apodrece de um jeito específico e ruim */
  ok(VONTADES.every((v) => v.apodrece.length > 15), "e cada uma apodrece de um jeito próprio, escrito");
}

sec("4) O CÓDIGO");
{
  const a = garantirAliado({ codigos: ["nao_se_mente", "sangue_por_ultimo"] });
  ok(!!cruzouOCodigo(a, { ato: "menti", presente: true }), "mentir na frente dele cruza o código");
  ok(!cruzouOCodigo(a, { ato: "menti", presente: false }), "mas não quando ele não está presente");
  ok(!!cruzouOCodigo(a, { ato: "feri", emCombate: false }), "ferir fora de combate cruza o outro");
  ok(!cruzouOCodigo(a, { ato: "feri", emCombate: true }), "e dentro da luta, não — é o que 'sangue é o último recurso' quer dizer");
  ok(!cruzouOCodigo(a, { ato: "ajudei" }), "e ajudar não cruza nada");
  ok(cruzouOCodigo(garantirAliado({}), { ato: "menti" }) === null, "sem código, nada é cruzado");
  /* um código quebrado não derruba nada */
  const bomba = { id: "bomba", o: "x", cruzou: () => { throw new Error("x"); } };
  CODIGOS.push(bomba);
  ok(cruzouOCodigo(garantirAliado({ codigos: ["bomba"] }), {}) === null, "código que estoura não cruza — a lacuna nunca vira acusação");
  CODIGOS.pop();
}

sec("5) A HORA DE FALAR — o problema mais difícil");
{
  const base = { nome: "Ubba", vontade: "pagar_divida", vontadeTexto: "pagar uma dívida antiga", calado: 0 };
  ok(!podeFalar(base), "recém-falado, cala");
  ok(podeFalar({ ...base, calado: 2 }), "com a vontade puxando, fala depois de dois turnos");
  ok(!podeFalar({ ...base, vontade: "", calado: 2 }), "sem vontade, espera mais");
  ok(podeFalar({ ...base, vontade: "", calado: CALADO_ATE_FALAR }), `e sem vontade nenhuma fala depois de ${CALADO_ATE_FALAR}`);
  ok(podeFalar({ ...base, cruzouAgora: true }), "cruzaram o código: fala AGORA, sem esperar");
  ok(!podeFalar({ ...base, cruzouAgora: true, emCombate: true }), "mas nunca na luta — ali ele já age pelo combate");
  ok(!podeFalar({ calado: 99 }), "e gente sem nome não fala");
}

sec("6) O QUE ELE FAZ, E O QUE ELE ACHOU");
{
  const c = { nome: "Ubba", vontade: "achar_irmao", vontadeTexto: "achar o irmão que sumiu", etapa: 0, calado: 3 };
  const vistos = new Set();
  for (let i = 0; i < 200; i++) { const m = oQueOAliadoFaz(c, { sorte: Math.random }); if (m) vistos.add(m.id); }
  console.log("  Ubba, com a vontade parada: " + [...vistos].join(" · "));
  ok(vistos.has("puxa_a_vontade"), "com a vontade parada no começo, ele puxa o assunto");
  ok(vistos.size >= 2, "e há mais de uma coisa que ele pode fazer");
  ok(oQueOAliadoFaz({ ...c, calado: 0 }) === null, "e quando não é a vez dele, nada");

  /* A PARTIDA — tem de ser possível, senão as opiniões não valem nada */
  const farto = { nome: "Ubba", cruzou: 4, vinculo: 10, calado: 5, cruzouAgora: true };
  let saiu = false;
  for (let i = 0; i < 300; i++) { const m = oQueOAliadoFaz(farto, { sorte: Math.random }); if (m && m.vaiEmbora) saiu = true; }
  ok(saiu, "quem teve o código cruzado vezes demais VAI EMBORA — e é isso que faz as opiniões valerem");
  let saiuCedo = false;
  for (let i = 0; i < 300; i++) { const m = oQueOAliadoFaz({ ...farto, cruzou: 1 }, { sorte: Math.random }); if (m && m.vaiEmbora) saiuCedo = true; }
  ok(!saiuCedo, "e ninguém vai embora na primeira vez");

  /* A OPINIÃO */
  const op = oQueEleAchou({ nome: "U", ato: "menti", presente: true }, { sorte: () => 0.1 });
  ok(op && op.sinal === -1, "mentir na frente dele desaprova");
  ok(oQueEleAchou({ nome: "U", ato: "ajudei" }, { sorte: () => 0.1 }).sinal === 1, "ajudar aprova");
  ok(oQueEleAchou({ nome: "U", ato: "nada" }) === null, "e sobre nada, ele não acha nada");
  ok(OPINIOES.every((o) => !/["“”]/.test(o.faz)), "e nenhuma opinião é uma fala");
}

sec("7) UM POR TURNO, E SÓ UM");
{
  const grupo = [
    { nome: "Ubba", vontade: "achar_irmao", vontadeTexto: "achar o irmão", calado: 5, ato: "menti", presente: true },
    { nome: "Marta", vontade: "provar_valor", vontadeTexto: "provar que serve", calado: 3, ato: "menti" },
    { nome: "Lucan", vontade: "voltar_para_casa", vontadeTexto: "voltar para casa", calado: 2, ato: "menti" },
    { nome: "Vaska", vontade: "juntar_dinheiro", vontadeTexto: "juntar dinheiro", calado: 4, ato: "menti" },
  ];
  const r = paraPauta(grupo, { sorte: Math.random });
  console.log("  " + r.linhas.join("\n  "));
  ok(r.linhas.length <= 2, "no máximo duas linhas: o que ele faz e o que ele achou");
  ok(!!r.quem, `e de UM companheiro só (${r.quem})`);
  ok(r.quem === "Ubba", "e é o que está calado há mais tempo — o grupo se reveza sozinho");
  /* quem teve o código cruzado fura a fila, porque isso não espera */
  const r2 = paraPauta(grupo.map((g) => g.nome === "Lucan" ? { ...g, cruzouAgora: true } : g), { sorte: Math.random });
  ok(r2.quem === "Lucan", "mas quem teve o código cruzado fura a fila");
  ok(paraPauta([]).linhas.length === 0 && paraPauta(null).linhas.length === 0, "sem grupo, nenhuma linha");
  ok(paraPauta(grupo.map((g) => ({ ...g, emCombate: true }))).linhas.length === 0, "e na luta, ninguém comenta");
  ok(r.linhas.join("").length <= 260, `e o custo é de ${r.linhas.join("").length} caracteres`);
}

sec("8) LIGADO NO TURNO");
{
  ok(/aliadoParaPauta\(aliadosDaCena\(\)\)/.test(app), "o Aliado é consultado no ponto único do turno");
  ok(/porNaPauta\(p, "aliado", r\.linhas\)/.test(app), "e escreve na seção O ALIADO");
  ok(/aliadosRef = useRef\(\{\}\)/.test(app) && /aliados: aliadosRef\.current/.test(app) && /garantirAliados\(sv\.aliados\)/.test(app), "a alma de cada um vive num ref, é salva e recarregada");
  ok(/andarVontade\(a, \{ ajudou: false, dias: 1 \}\)/.test(app), "a vontade anda — ou apodrece — a cada dia que passa");
  ok(/marcarQueFalou\(r\.quem\)/.test(app), "quem falou cala, e quem não falou fica mais perto da vez");
  ok(/aliadoVaiEmbora\(r\.quem\)/.test(app), "e a partida é executada de verdade: ele sai do grupo");
  ok(/O COMPANHEIRO FOI EMBORA — CANON/.test(app), "com envelope de canon, para o Narrador não o trazer de volta na cena seguinte");
  ok(/paresEntre\(npcsRef\.current\)/.test(app), "e o atrito entre aliados reusa o `entre` da v9.98 — que finalmente tem quem o use");
  ok(/O ALIADO/.test(app), "a seção existe na Pauta");
  ok(/só um/.test(ALIADO_PROMPT) && /a fala é sua/.test(ALIADO_PROMPT), "e o bloco do prompt diz o teto e devolve a fala ao Narrador");
}

console.log(falhas ? `\n${falhas} FALHA(S)` : "\ntudo verde");
process.exit(falhas ? 1 : 0);
