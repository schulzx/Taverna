/* teste-retratos.mjs — Os retratos (Retratos §11–13, 12/10) e R7

   A pintura que escala: escolher qual matriz vai para quem é regra, e
   regra prova-se aqui. Esta suíte prova:

     1. o manifesto (`RETRATOS`): as 18 feras de CRIATURAS_FANTASIA e os
        164 heróis pintados, cada chave com os nomes EXACTOS do código,
        arquivos únicos, centros dentro do quadro; os 76 por pintar ausentes;
     2. `retratoDe`: gente pela classe (raça × sexo × classe, o sexo pela
        mesma conta do rosto desenhado), espécie pelo nome MAIS LONGO, por
        palavra inteira; pessoa sem classe nunca vira bicho; lixo → null;
        determinismo e imutabilidade;
     3. `recorteDoRetrato`: os três tamanhos pelos limiares da tabela, a
        imagem cobre SEMPRE o disco (nenhum buraco), nas 182 entradas e nos
        tamanhos de hoje do jogo;
     4. R7: o Lobo Atroz luta com a ficha DELE (comum, 3), e nenhuma base do
        bestiário perde para um nome mais curto que ela contém;
     5. (13/10) o companheiro ganha POVO: { nome: "Brannoc", classe:
        "Caçador" } era gente sem raça, logo sem pintura; pela ficha do
        grupo (garantirFichaCompanheiro) passa a ter raça da semente, a
        mesma num save novo e num antigo (que a deriva no load), e o que a
        ficha já diz nunca é reescrito. Falha na árvore de antes (v9.452):
        racaDeCompanheiro não existe e o Brannoc fica sem retrato.

   Falha na árvore de antes (v9.444): o módulo não existe, e
   `completarInimigo({nome:"Lobo Atroz"}, 3)` devolve fraco, nível 1. */
let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;

let R = {};
try { R = await import("../src/retratos.js"); } catch (e) { console.log("  (retratos.js não carrega: " + e.message + ")"); }
const { RETRATOS = [], RETRATO = {}, SINAIS_DE_GENTE = [], retratoDe = () => undefined, recorteDoRetrato = () => undefined, tamanhoDoRetrato = () => undefined } = R;
const { RACAS, CLASSES } = await import("../src/classes.js");
const { CRIATURAS_FANTASIA, ARQUETIPOS, completarInimigo } = await import("../src/bestiario.js");
const { feicoes } = await import("../src/semente.js");
const { readFileSync } = await import("node:fs");

sec("1. O MANIFESTO");
{
  const feras = RETRATOS.filter((r) => r.chave.startsWith("especie:"));
  const gente = RETRATOS.filter((r) => r.chave.startsWith("gente:"));
  t("182 entradas: 18 feras + 164 heróis (§11, §13)", RETRATOS.length === 182 && feras.length === 18 && gente.length === 164, `${RETRATOS.length}/${feras.length}/${gente.length}`);
  t("as 18 feras são exactamente CRIATURAS_FANTASIA, na mesma ordem", J(feras.map((r) => r.chave.slice(8))) === J(CRIATURAS_FANTASIA.map((c) => c.nome)));
  const racas = new Set(RACAS.map((r) => r.nome)), classes = new Set(CLASSES.map((c) => c.nome));
  const tortas = gente.filter((r) => { const [raca, sexo, classe, v] = r.chave.slice(6).split("|"); return !racas.has(raca) || !["m", "f"].includes(sexo) || !classes.has(classe) || v !== "1"; });
  t("toda chave de gente usa os nomes exactos de RACAS e CLASSES, sexo m|f, variante 1", tortas.length === 0, J(tortas.slice(0, 3)));
  t("chaves e arquivos únicos", new Set(RETRATOS.map((r) => r.chave)).size === 182 && new Set(RETRATOS.map((r) => r.arquivo)).size === 182);
  t("arquivos no padrão de §12 (minúsculas, sem acento, hífen, .webp)", RETRATOS.every((r) => /^\/retratos\/(especie\/[a-z-]+|gente\/[a-z-]+-[mf]-[a-z]+-\d+)\.webp$/.test(r.arquivo)), J(RETRATOS.find((r) => !/^\/retratos\/(especie\/[a-z-]+|gente\/[a-z-]+-[mf]-[a-z]+-\d+)\.webp$/.test(r.arquivo))));
  t("o Dragão Ancião vira dragao-anciao; o Meio-orc ladina vira meio-orc-f-ladino-1", RETRATOS.some((r) => r.arquivo === "/retratos/especie/dragao-anciao.webp") && RETRATOS.some((r) => r.chave === "gente:Meio-orc|f|Ladino|1" && r.arquivo === "/retratos/gente/meio-orc-f-ladino-1.webp"));
  t("cx e olhos dentro de (0, 1) em todas", RETRATOS.every((r) => r.cx > 0 && r.cx < 1 && r.olhos > 0 && r.olhos < 1));
  const porRaca = (n) => gente.filter((r) => r.chave.startsWith(`gente:${n}|`)).length;
  t("Humano, Elfo, Anão, Halfling, Meio-orc e Draconato completos (24 cada)", ["Humano", "Elfo", "Anão", "Halfling", "Meio-orc", "Draconato"].every((n) => porRaca(n) === 24));
  t("Tiefling 14, Gnomo 2, Meio-elfo 2, Goliath 2 (os 76 por pintar ausentes)", porRaca("Tiefling") === 14 && porRaca("Gnomo") === 2 && porRaca("Meio-elfo") === 2 && porRaca("Goliath") === 2);
  const semRosto = [];
  for (const r of RACAS) for (const s of ["m", "f"]) if (!gente.some((g) => g.chave.startsWith(`gente:${r.nome}|${s}|`))) semRosto.push(r.nome + s);
  t("todas as 20 raça × sexo têm ao menos um rosto (a volta 1)", semRosto.length === 0, J(semRosto));
  /* MOVIDA (v9.449): os três valores eram os de §11, estimados à mão (Ogro
     0,30 · Quimera 0,47 · Dragão Ancião 0,46). A tabela passou aos MEDIDOS
     (`mente/figma/retratos-medidos.json`: o Ogro pela malha do rosto, os
     outros dois à régua), e a intenção — os três que fogem da faixa comum
     estão na tabela como a medida os achou, e não puxados ao meio — fica,
     com os números da medida. */
  t("os três de olhos fora dos 35–43 % estão como a medida os achou (Ogro 0,32 · Quimera 0,46 · Dragão Ancião 0,47)", ["Ogro:0.32", "Quimera:0.46", "Dragão Ancião:0.47"].every((p) => { const [n, o] = p.split(":"); const r = RETRATOS.find((x) => x.chave === "especie:" + n); return r && r.olhos === Number(o); }));
  /* a tabela é a medida: cada cx/olhos é o de retratos-medidos.json, e
     nenhum valor estimado sobrou (12/10: 161 das 182 entradas mudaram) */
  const medidos = JSON.parse(readFileSync(new URL("../mente/figma/retratos-medidos.json", import.meta.url), "utf8"));
  const foraDaMedida = RETRATOS.filter((r) => { const a = r.arquivo.match(/\/retratos\/(especie|gente)\/([a-z0-9-]+)\.webp$/); const v = a && medidos[a[1] + "/" + a[2]]; return !v || v.cx !== r.cx || v.olhos !== r.olhos; });
  t("as 182 entradas têm o cx e os olhos MEDIDOS (mente/figma/retratos-medidos.json)", RETRATOS.length === 182 && foraDaMedida.length === 0, J(foraDaMedida.slice(0, 3).map((r) => r.chave)));
  t("o manifesto é congelado (ninguém muda a tabela em tempo de jogo)", Object.isFrozen(RETRATOS) && Object.isFrozen(RETRATOS[0]));
}

sec("2. retratoDe — QUEM RECEBE QUAL PINTURA");
{
  const ch = (e, m) => { const r = retratoDe(e, m); return r ? r.chave : r; };
  t("Lobo Atroz → a pintura do alfa negro, não a do lobo cinzento", ch({ nome: "Lobo Atroz" }) === "especie:Lobo Atroz");
  t("Lobo → Lobo; Dragão Jovem e Dragão Ancião separados", ch({ nome: "Lobo" }) === "especie:Lobo" && ch({ nome: "Dragão Jovem" }) === "especie:Dragão Jovem" && ch({ nome: "Dragão Ancião" }) === "especie:Dragão Ancião");
  t("o nome com mais palavras ainda acha a espécie (Lobo Atroz da Encosta, Dragao Anciao sem acento)", ch({ nome: "Lobo Atroz da Encosta" }) === "especie:Lobo Atroz" && ch({ nome: "dragao anciao" }) === "especie:Dragão Ancião");
  t("palavra inteira: Hobgoblin não ganha a cara do Goblin, Lobisomem não ganha a do Lobo", ch({ nome: "Hobgoblin" }) === null && ch({ nome: "Lobisomem" }) === null);
  t("espécie desconhecida → null (o rosto de hoje)", ch({ nome: "Uivante das Dunas" }) === null && ch({ nome: "Grifo" }) === null);
  t("`especie` declarada (R1) ganha do nome que o mundo inventou", ch({ nome: "Uivante das Dunas", especie: "Lobo Atroz" }) === "especie:Lobo Atroz");
  t("quem tem classe é gente: Anã clériga → anao-f-clerigo-1", ch({ nome: "Brunhilde", classe: "Clérigo", raca: "Anão", genero: "mulher" }) === "gente:Anão|f|Clérigo|1");
  t("…e o nome de bicho não manda em quem tem classe (Lobo, o Elfo Ladino)", ch({ nome: "Lobo", classe: "Ladino", raca: "Elfo", genero: "homem" }) === "gente:Elfo|m|Ladino|1");
  t("raça e classe sem acento ou em minúsculas acham a célula", ch({ classe: "clerigo", raca: "anao", genero: "mulher" }) === "gente:Anão|f|Clérigo|1");
  t("os 76 por pintar → null sem estourar (Goliath Mago, Gnomo Bardo, Tiefling f Monge)", ch({ classe: "Mago", raca: "Goliath", genero: "homem" }) === null && ch({ classe: "Bardo", raca: "Gnomo", genero: "mulher" }) === null && ch({ classe: "Monge", raca: "Tiefling", genero: "mulher" }) === null);
  t("…e o par pintado da mesma raça responde (Tiefling m Monge)", ch({ classe: "Monge", raca: "Tiefling", genero: "homem" }) === "gente:Tiefling|m|Monge|1");
  t("classe sem raça, ou raça de outro género (Terrano) → null, nunca o rosto de outra coisa", ch({ classe: "Mago" }) === null && ch({ classe: "Mago", raca: "Terrano" }) === null);
  t("pessoa sem classe nem matriz de ofício → null, mesmo com nome de bicho (o Velho Lobo taverneiro)", ch({ nome: "Velho Lobo", papel: "taverneiro" }) === null && ch({ nome: "Lobo", oficio: "taverna", raca: "Humano" }) === null && SINAIS_DE_GENTE.includes("papel"));
  t("lixo → null: null, undefined, {}, número, string, mundo null", [null, undefined, {}, 3, "Lobo", { nome: null }, { nome: "" }].every((e) => retratoDe(e, null) === null) && ch({ nome: "Troll" }, null) === "especie:Troll");
  /* o sexo sem género declarado sai de `feicoes`, a MESMA conta do rosto desenhado */
  let acordo = 0, n = 0;
  for (let i = 0; i < 200; i++) {
    const s = "pessoa-" + i, r = retratoDe({ classe: "Guerreiro", raca: "Humano" }, { semente: s });
    n++; if (r && r.chave.split("|")[1] === (feicoes(s, { genero: "" }).fem ? "f" : "m")) acordo++;
  }
  t("sem género, o sexo da pintura é o do desenho em 200 de 200 sementes", acordo === 200, `${acordo}/${n}`);
  const ambos = new Set(Array.from({ length: 200 }, (_, i) => retratoDe({ classe: "Guerreiro", raca: "Humano" }, { semente: "p" + i }).chave));
  t("…e as 200 sementes dão os dois sexos", ambos.size === 2);
  t("o ajuste da apresentação passa (fixo respeita o género)", ch({ classe: "Mago", raca: "Elfo", genero: "mulher" }, { semente: "z", apresentacao: "livre", fixo: true }) === "gente:Elfo|f|Mago|1");
  const e = { nome: "Clara", classe: "Mago", raca: "Humano", genero: "mulher", semente: "abc" }, antes = J(e);
  const a = retratoDe(e, { semente: "abc" }), b = retratoDe(e, { semente: "abc" });
  t("determinístico: mesma semente, mesma entrada (o mesmo objeto da tabela)", a === b && a && a.chave === "gente:Humano|f|Mago|1");
  t("imutável: o ente não muda", J(e) === antes);
}

sec("3. recorteDoRetrato — A CONTA DO DISCO");
{
  t("a tabela do enquadramento é a de §4/§12 (0,40 · 0,62 · 0,88; 40 e 100 px)", RETRATO.recorte && RETRATO.recorte.chip === 0.40 && RETRATO.recorte.cartao === 0.62 && RETRATO.recorte.ficha === 0.88 && RETRATO.limiar.chip === 40 && RETRATO.limiar.cartao === 100);
  t("os limiares: 32 e 40 → chip, 41/64/100 → cartão, 101/160 → ficha", tamanhoDoRetrato(32) === "chip" && tamanhoDoRetrato(40) === "chip" && tamanhoDoRetrato(41) === "cartao" && tamanhoDoRetrato(64) === "cartao" && tamanhoDoRetrato(100) === "cartao" && tamanhoDoRetrato(101) === "ficha" && tamanhoDoRetrato(160) === "ficha");
  const lobo = RETRATOS.find((r) => r.chave === "especie:Lobo");
  const f = recorteDoRetrato(lobo, 160);
  t("na ficha a imagem é o próprio disco (largura = lado, canto 0,0)", f && f.largura === 160 && f.esquerda === 0 && f.topo === 0, J(f));
  const c = recorteDoRetrato(lobo, 32);
  /* chip do Lobo à mão: kf 0,88 · s = 32/0,40 = 80 → largura 70,4; canto da
     ficha x = (0,43+0,5)/2 − 0,44 = 0,025, y = 0,03; do chip x = 0,23,
     y = 0,41+0,06−0,20 = 0,27 → left = −0,205·80 = −16,4; top = −0,24·80 = −19,2.
     MOVIDA (v9.449): o topo era −17,6 com os olhos estimados a 0,39; a régua
     mediu-os a 0,41, e a conta à mão refez-se com o número medido. */
  t("o chip do Lobo bate com a conta à mão (70,4 · −16,4 · −19,2)", c && c.largura === 70.4 && c.esquerda === -16.4 && c.topo === -19.2, J(c));
  const buracos = [];
  for (const r of RETRATOS) for (const lado of [24, 32, 36, 40, 44, 46, 56, 64, 80, 100, 120, 160, 220]) {
    const q = recorteDoRetrato(r, lado);
    if (!q || q.esquerda > 1e-9 || q.topo > 1e-9 || q.esquerda + q.largura < lado - 1e-9 || q.topo + q.largura < lado - 1e-9) buracos.push(`${r.chave}@${lado}`);
  }
  t("a imagem cobre o disco inteiro nas 182 entradas × 13 tamanhos (nenhum buraco)", buracos.length === 0, J(buracos.slice(0, 4)));
  t("lixo → null: entrada null, sem cx, lado 0/negativo/NaN/null", [recorteDoRetrato(null, 32), recorteDoRetrato({}, 32), recorteDoRetrato(lobo, 0), recorteDoRetrato(lobo, -4), recorteDoRetrato(lobo, NaN), recorteDoRetrato(lobo, null)].every((x) => x === null));
  t("o chip mostra o olhar: o centro do disco cai a menos de 0,1 do rosto (cx, olhos+0,06)", (() => { const q = recorteDoRetrato(lobo, 32), s = 32 / 0.40, xf = (lobo.cx + 0.5) / 2 - 0.44, yf = 0.03; const cx = xf + (16 - q.esquerda) / s, cy = yf + (16 - q.topo) / s; return Math.abs(cx - lobo.cx) < 0.1 && Math.abs(cy - (lobo.olhos + 0.06)) < 0.1; })());
}

sec("4. R7 — A BASE DO BESTIÁRIO PELO NOME MAIS LONGO");
{
  const la = completarInimigo({ nome: "Lobo Atroz" }, 3);
  t("Lobo Atroz → comum, nível 3 (antes: fraco, nível 1 — a ficha do Lobo)", la.ameaca === "comum" && la.nivel === 3, `${la.ameaca} ${la.nivel}`);
  t("o Lobo continua Lobo (fraco, 1)", completarInimigo({ nome: "Lobo" }, 1).ameaca === "fraco" && completarInimigo({ nome: "Lobo" }, 1).nivel === 1);
  const todas = [...CRIATURAS_FANTASIA, ...ARQUETIPOS];
  const perdem = todas.filter((c) => { const r = completarInimigo({ nome: c.nome }, c.nivelRef); return r.ameaca !== c.ameaca || r.nivel !== c.nivelRef || r.des !== c.des; });
  t(`nenhuma das ${todas.length} bases perde para um nome mais curto que ela contém`, perdem.length === 0, J(perdem.map((c) => c.nome)));
  const contidos = [];
  for (const a of todas) for (const b of todas) if (a !== b && a.nome.toLowerCase().includes(b.nome.toLowerCase())) contidos.push(`${a.nome}⊃${b.nome}`);
  t("o varrimento tem o que varrer: há nomes que contêm outros (Lobo Atroz ⊃ Lobo), e a regra os resolve", contidos.includes("Lobo Atroz⊃Lobo"), J(contidos));
  t("nome desconhecido continua sem base (nível do jogador, ameaça comum)", completarInimigo({ nome: "Coisa Sem Nome" }, 4).nivel === 4 && completarInimigo({ nome: "Coisa Sem Nome" }, 4).ameaca === "comum");
  t("o retrato e a luta concordam: a base de cada fera é a espécie do retrato", CRIATURAS_FANTASIA.every((c) => { const r = retratoDe({ nome: c.nome }); return r && r.chave === "especie:" + c.nome; }));
}

/* ============================================================ */
sec("5. o companheiro ganha povo (13/10)");
{
  let C = {}, RJ = {};
  try { C = await import("../src/companheiros.js"); RJ = await import("../src/regras-jogo.js"); } catch (e) { console.log("  (companheiros não carrega: " + e.message + ")"); }
  const { garantirFichaCompanheiro = (x) => x, racaDeCompanheiro, RACAS_DO_COMPANHEIRO = [], RACA_DO_REGISTO = {} } = C;
  const nomesDeRaca = new Set(RACAS.map((r) => r.nome));
  t("a tabela do povo existe e só tem raças do catálogo, com peso inteiro positivo", typeof racaDeCompanheiro === "function" && RACAS_DO_COMPANHEIRO.length > 0 && RACAS_DO_COMPANHEIRO.every((r) => nomesDeRaca.has(r.raca) && Number.isInteger(r.peso) && r.peso > 0));
  t("as palavras do registo dão raças do catálogo", Object.values(RACA_DO_REGISTO).every((r) => nomesDeRaca.has(r)));

  const cru = { nome: "Brannoc", classe: "Caçador" };
  t("o companheiro cru, sem raça, não tem pintura (o defeito, documentado)", retratoDe(cru) === null);
  const brannoc = garantirFichaCompanheiro(Object.freeze({ ...cru }));
  t("Brannoc, pela ficha do grupo, ganha raça do catálogo", nomesDeRaca.has(brannoc.raca), String(brannoc.raca));
  t("e com ela o retrato pintado deixa de ser null", () => !!retratoDe(brannoc) && retratoDe(brannoc).chave.includes("|Caçador|"), J(retratoDe(brannoc)));
  t("a pintura é de quem tem a raça da ficha", () => retratoDe(brannoc).chave.startsWith("gente:" + brannoc.raca + "|"));

  const nomes = Array.from({ length: 300 }, (_, i) => "Comp" + i);
  const a = nomes.map((n) => garantirFichaCompanheiro({ nome: n, classe: "Guerreiro" }).raca);
  const b = nomes.map((n) => garantirFichaCompanheiro({ nome: n, classe: "Guerreiro" }).raca);
  t("mesma semente, mesma raça (300 nomes, duas vezes)", J(a) === J(b));
  t("a semente manda, não o nome: a mesma semente dá o mesmo povo com nomes diferentes", () => racaDeCompanheiro({ nome: "X", semente: "npc|Brannoc|ferreiro" }) === racaDeCompanheiro({ nome: "Y", semente: "npc|Brannoc|ferreiro" }));
  const variedade = new Set(a);
  t("e a demografia espalha-se (todas as raças da tabela aparecem em 300)", RACAS_DO_COMPANHEIRO.length > 0 && RACAS_DO_COMPANHEIRO.every((r) => variedade.has(r.raca)), J([...variedade]));

  const antigo = { nome: "Brannoc", classe: "Caçador", semente: "npc|Brannoc|ferreiro", nivel: 2 };
  const lido = (RJ.migrarPersonagem || ((p) => p))({ nome: "Herói", grupo: [antigo] }).grupo[0];
  const novo = garantirFichaCompanheiro({ ...antigo });
  t("um save antigo sem raça deriva-a no load, e é a MESMA do companheiro novo da mesma semente", lido.raca === novo.raca && nomesDeRaca.has(lido.raca), lido.raca + " / " + novo.raca);
  t("e o save de antes não foi mexido", !("raca" in antigo));

  const comRaca = garantirFichaCompanheiro({ nome: "Ilsa", classe: "Clérigo", raca: "Tiefling" });
  t("o que a ficha já diz nunca é reescrito", comRaca.raca === "Tiefling");
  t("a palavra do registo vai à forma do catálogo («anã» → Anão, «humana» → Humano)", () => racaDeCompanheiro({ raca: "anã" }) === "Anão" && racaDeCompanheiro({ raca: "humana" }) === "Humano" && racaDeCompanheiro({ raca: "meio-orc" }) === "Meio-orc");
  t("um povo que o catálogo não tem fica a palavra do registo (e a pintura recusa)", () => racaDeCompanheiro({ raca: "sintético" }) === "sintético" && retratoDe({ nome: "Z", classe: "Mago", raca: "sintético" }) === null);
  t("lixo não estoura e dá uma raça do catálogo", () => [null, undefined, {}, 7, "x"].every((x) => nomesDeRaca.has(racaDeCompanheiro(x))));

  const lobo = garantirFichaCompanheiro({ nome: "Companheiro Animal", classe: "Caçador", invocada: true });
  t("a invocação não ganha povo (o lobo do domador não vira humano pintado)", !("raca" in lobo) && retratoDe(lobo) === null);
  t("quem declara espécie não ganha povo", !("raca" in garantirFichaCompanheiro({ nome: "Rex", classe: "Caçador", especie: "Lobo" })));
  /* 13/10, v9.454: o companheiro recrutado nascia sem passar pela ficha, e
     só ganhava raça (e retrato pintado) no load seguinte. O App passa-o por
     garantirFichaCompanheiro no próprio turno, com o gênero do registo. */
  const APP = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("o companheiro recrutado passa pela ficha no mesmo turno, com o gênero do registo",
    /const fichaDeCompanheiro = [\s\S]{0,900}?try \{ return garantirFichaCompanheiro\(\{ \.\.\.f, genero: \(fichaElenco && fichaElenco\.genero\) \|\| "" \}\); \} catch \(e\) \{ calou\(/.test(APP));
}

console.log(`\nretratos: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
