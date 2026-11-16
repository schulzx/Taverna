/* teste-quem-esta-aqui.mjs — S4 do lançamento (16/11): uma só verdade de
   quem está aqui (src/quem-esta-aqui.js).

   As provas jogadas de 15–16/11: Cedric e Runa, moradores de Monte
   Profundo, «em cena» na Paliçada de Sangue Velho a 19 km; Isen e Ceridwen
   à fogueira lá fora; o guarda-portão nas pedras e na estalagem; a tela a
   dizer «Perrine e Isen» e a pauta «Cedric · Runa» no mesmo turno; e a Nesa
   da Foz, a pessoa da carta do quadro, fora do EM CENA no Arquivo dela.

     1. a catraca: 600 cenas por semente — 0 moradores da cidade em cena fora
        dos muros (na lista do EM CENA, que a pauta e a tela leem);
     2. dentro da cidade, quem a ficha põe noutro sítio está no posto dele; e
        quem não diz sítio continua plausível (o portão morde só o necessário);
     3. a pessoa da carta do quadro entra em cena no sítio dela;
     4. o núcleo da cidade não é «daqui» fora dos muros (a fogueira);
     5. a tela e a pauta leem a MESMA conta: as duas fiações espalham
        `contextoDeQuemEsta`, e em 600 cenas a gente da linha da pauta é a
        gente da tela (100 %);
     6. (S4b) a cena não fica velha: a proposta é do sítio onde nasceu —
        «Ir até Raízes · ☠ Impossível» sai quando o herói viaja.

   Falha antes (cce9c1f): o elenco era só pela cidade — a secção 1 conta os
   moradores que a conta velha punha em cena e mostra-os (>0). */
import fs from "node:fs";
const S = "../src/";
const { quemEstaAqui, contextoDeQuemEsta, foraDosMuros, pessoasDasCartas, QUEM_ESTA_AQUI_TABELA } = await import(S + "quem-esta-aqui.js");
const { elencoDaCena } = await import(S + "cena.js");
const { montarEmCena, emCenaParaPauta, SO_DA_PROSA, EM_CENA_NA_PAUTA } = await import(S + "em-cena.js");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => { if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } } if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? "  → " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

/* um sorteio determinístico só da suíte (a semente é o árbitro) */
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };

const A = "Monte Profundo", B = "Rio Baixo";
const mapa = { cidades: [{ nome: A, x: 0, y: 0 }, { nome: B, x: 30, y: 0 }], rotas: [] };
const lugares = [
  { nome: "O Arquivo da Colina", onde: "dentro" },
  { nome: "A Estalagem do Sino", onde: "dentro" },
  { nome: "O Portão Norte", onde: "dentro" },
  { nome: "A Praça da Alfândega", onde: "dentro" },
  { nome: "As Pedras Velhas", onde: "arredores" },
  { nome: "O Moinho de Baixo", onde: "arredores" },
];
const moradores = {
  Cedric: { nome: "Cedric", local: A, papel: "moleiro" },
  Runa: { nome: "Runa", local: "a praça, " + A, papel: "vendedora" },
  Isen: { nome: "Isen", local: "", papel: "pescador" },                     // sem paradeiro: presente por omissão
  Bram: { nome: "Bram Cara-de-Ferro", local: "O Portão Norte, " + A, papel: "guarda-portão" },
  Odo: { nome: "Odo", local: "A Estalagem do Sino, " + A, papel: "estalajadeiro" },
};
const doSitio = { Tessa: { nome: "Tessa", local: "Paliçada de Sangue Velho", papel: "sentinela" } };
const grupo = [{ nome: "Nolan o Silencioso", conceito: "batedor" }];
const daCidade = new Set(Object.values(moradores).map((n) => n.nome));
const pessoasAqui = (lista) => lista.filter((x) => x.tipo === "pessoa" && x.aqui && !SO_DA_PROSA.deOnde.includes(x.deOnde));

function cena(seed) {
  const r = rng(seed);
  const tipo = Math.floor(r() * 6);
  const base = { npcs: { ...moradores, ...doSitio }, cidadeAtual: A, mapa, grupo, lugares };
  if (tipo === 0) return { tipo: "rua", e: base, fora: false };
  if (tipo === 1) { const l = lugares.filter((x) => x.onde === "dentro")[Math.floor(r() * 4)]; return { tipo: "sitio", e: { ...base, lugar: { nome: l.nome, cidade: A, distancia: "dentro" } }, fora: false }; }
  if (tipo === 2) { const l = lugares.filter((x) => x.onde === "arredores")[Math.floor(r() * 2)]; return { tipo: "arredor", e: { ...base, lugar: { nome: l.nome, cidade: A, distancia: "arredores" } }, fora: true }; }
  if (tipo === 3) return { tipo: "boca", e: { ...base, lugar: { nome: "Paliçada de Sangue Velho", cidade: A, distancia: "perto" } }, fora: true };
  if (tipo === 4) return { tipo: "estrada", e: { ...base, jornada: { de: A, para: B } }, fora: true };
  return { tipo: "acampado", e: { ...base, acampado: true, lugar: { nome: "Paliçada de Sangue Velho", cidade: A, distancia: "perto" } }, fora: true };
}

sec("1. a catraca: fora dos muros, a cidade fica lá");
{
  const N = 600;
  let foras = 0, colados = 0, coladosAntes = 0, tessaFora = 0;
  for (let s = 1; s <= N; s++) {
    const c = cena(s * 7919);
    const q = quemEstaAqui(c.e);
    const lista = montarEmCena({ semente: "s4", cidade: A, grupo, ...contextoDeQuemEsta(q) });
    if (!c.fora) continue;
    foras++;
    colados += pessoasAqui(lista).filter((x) => daCidade.has(x.nome)).length;
    coladosAntes += (elencoDaCena(c.e.npcs, A, mapa, { comGrupo: grupo }).aqui || []).filter((n) => daCidade.has(n.nome)).length;
    if (c.tipo === "boca" || c.tipo === "acampado") tessaFora += q.aqui.some((n) => n.nome === "Tessa") ? 0 : 1;
  }
  console.log(`      ${foras} cenas fora dos muros em ${N}; moradores em cena — antes: ${coladosAntes}, agora: ${colados}`);
  t("há cenas fora dos muros bastantes para a catraca valer (≥ 300)", foras >= 300);
  t("a conta velha (só a cidade) colava moradores ao herói — o defeito existia", coladosAntes > 0);
  t("CATRACA: 0 moradores da cidade em cena fora dos muros", colados === 0, String(colados));
  t("quem a ficha põe NO sítio (a sentinela da Paliçada) está lá", tessaFora === 0);
  t("o grupo anda sempre com o herói", [1,2,3,4,5,6,7,8].every((k) => quemEstaAqui(cena(k * 7919).e).grupo.includes("Nolan o Silencioso")));
  const q = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugar: { nome: "Paliçada de Sangue Velho", distancia: "perto" } });
  t("os moradores vão para o longe com dias 0 e laFora (o balde que o Narrador já lê)", q.longe.filter((n) => daCidade.has(n.nome)).every((n) => n.dias === 0 && n.laFora === A) && q.longe.length === daCidade.size);
  t("fora dos muros: a boca da masmorra", foraDosMuros({ lugar: { nome: "X", distancia: "perto" } }));
  t("fora dos muros: a estrada", foraDosMuros({ jornada: { de: A, para: B } }));
  t("fora dos muros: o arredor que o sistema conhece", foraDosMuros({ lugar: { nome: "O Moinho de Baixo", distancia: "arredores" }, lugares }));
  t("NÃO é fora: o nome que só o texto deu como arredores (a casa do moleiro do Cronista)", !foraDosMuros({ lugar: { nome: "a casa do moleiro", distancia: "arredores" }, lugares }));
  t("lixo e null não estouram", () => { quemEstaAqui(null); quemEstaAqui({ npcs: null, lugar: 3, lugares: "x", quadros: [null] }); foraDosMuros(undefined); pessoasDasCartas(null, null); return true; });
}

sec("2. dentro da cidade: o posto de cada um, e o portão que morde só o necessário");
{
  const q = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares, lugar: { nome: "A Estalagem do Sino", distancia: "dentro" } });
  const n = q.aqui.map((x) => x.nome);
  t("o guarda-portão não está na estalagem (o posto dele é o portão)", !n.includes("Bram Cara-de-Ferro"));
  t("…e vai para o longe com o sítio dele", q.longe.some((x) => x.nome === "Bram Cara-de-Ferro" && x.laFora === "O Portão Norte" && x.dias === 0));
  t("o estalajadeiro está na estalagem dele", n.includes("Odo"));
  t("quem a ficha só diz «da cidade» continua plausível", n.includes("Cedric"));
  t("quem não tem paradeiro continua plausível (a regra de sempre)", n.includes("Isen"));
  const rua = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares });
  t("na rua (sem sítio) a cidade inteira, como sempre", ["Cedric", "Runa", "Isen", "Bram Cara-de-Ferro", "Odo"].every((x) => rua.aqui.some((y) => y.nome === x)));
  const portao = quemEstaAqui({ npcs: moradores, cidadeAtual: A, mapa, grupo, lugares, lugar: { nome: "O Portão Norte", distancia: "dentro" } });
  t("no portão, o guarda está", portao.aqui.some((x) => x.nome === "Bram Cara-de-Ferro"));
}

sec("3. a pessoa da carta do quadro entra em cena no sítio dela");
{
  const quadros = [{ cartas: [
    { tipo: "essencial", forma: "pessoa", estado: "costas", escreve: { nome: "Nesa da Foz" } },
    { tipo: "essencial", forma: "pessoa", estado: "virada", escreve: { nome: "Gared" } },
    { tipo: "essencial", forma: "lugar", estado: "costas", escreve: { nome: "O Poço" } },
    { tipo: "essencial", forma: "pessoa", estado: "costas", futura: true, escreve: { nome: "Fendrel" } },
  ] }];
  const gente = [{ nome: "Nesa da Foz", local: "O Arquivo da Colina", papel: "arquivista" }, { nome: "Gared", local: "O Arquivo da Colina" }, { nome: "Fendrel", local: "O Arquivo da Colina" }];
  const e = { npcs: moradores, cidadeAtual: A, mapa, grupo, lugares, quadros, gente, lugar: { nome: "O Arquivo da Colina", distancia: "dentro" } };
  const q = quemEstaAqui(e);
  t("a Nesa (carta de costas, passo de agora) está aqui", q.doPasso.some((x) => x.nome === "Nesa da Foz" && x.aqui));
  t("a carta virada, a de lugar e a futura não põem ninguém", !q.doPasso.some((x) => ["Gared", "O Poço", "Fendrel"].includes(x.nome)));
  const lista = montarEmCena({ semente: "s4", cidade: A, grupo, ...contextoDeQuemEsta(q) });
  const linha = emCenaParaPauta(lista);
  t("…e chega à linha EM CENA da pauta, à frente", /^Nesa da Foz/.test(linha), linha);
  t("noutro sítio, a Nesa não está", !quemEstaAqui({ ...e, lugar: { nome: "A Estalagem do Sino", distancia: "dentro" } }).doPasso.some((x) => x.nome === "Nesa da Foz"));
  t("a ficha do registo ganha da base (o sítio onde o herói a viu)", pessoasDasCartas(quadros, { npcs: { n: { nome: "Nesa da Foz", local: "A Estalagem do Sino" } }, gente })[0].onde === "A Estalagem do Sino");
  t("a tabela diz como a carta entra", QUEM_ESTA_AQUI_TABELA.daCarta.deOnde === "carta");
}

sec("4. o núcleo da cidade não é «daqui» fora dos muros (a fogueira)");
{
  const nucleo = { pessoas: [{ nome: "Ceridwen", cidade: A, papel: "porta" }] };
  const dentro = montarEmCena({ semente: "s4", cidade: A, grupo, nucleo, ...contextoDeQuemEsta(quemEstaAqui({ npcs: {}, cidadeAtual: A, mapa, grupo })) });
  const fora = montarEmCena({ semente: "s4", cidade: A, grupo, nucleo, ...contextoDeQuemEsta(quemEstaAqui({ npcs: {}, cidadeAtual: A, mapa, grupo, lugar: { nome: "Paliçada de Sangue Velho", distancia: "perto" } })) });
  t("na cidade, a Ceridwen é gente daqui (a frase pode procurá-la)", dentro.some((x) => x.nome === "Ceridwen"));
  t("na Paliçada, não", !fora.some((x) => x.nome === "Ceridwen"));
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const roda = app.slice(app.indexOf("const rodaDaFogueira = () =>"), app.indexOf("const rodaDaFogueira = () =>") + 2400);
  t("a fogueira lê o fora dos muros da conta única", /quemAgora\(\)\.fora/.test(roda));
}

sec("5. a tela e a pauta: a MESMA conta");
{
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const mot = fs.readFileSync(new URL("../src/motor/pauta-do-turno.js", import.meta.url), "utf8");
  const ctxDe = (src) => { const i = src.indexOf("const contextoDoEmCena = (frase, quem) =>"); return i < 0 ? "" : src.slice(i, src.indexOf("\n  };", i)); };
  for (const [nome, src] of [["a tela (App)", app], ["a pauta (motor)", mot]]) {
    const c = ctxDe(src);
    t(`${nome}: o contexto do EM CENA espalha contextoDeQuemEsta`, c.includes("...contextoDeQuemEsta(q)"));
    t(`${nome}: e não tem presentes/longe/doPasso próprios`, !/\n\s+(presentes|longe|doPasso):/.test(c));
  }
  t("as fichas da tela montam-se da conta única", /const quem = vale\("FICHAS · quem está aqui", \(\) => quemAgora\(\)/.test(app));
  /* a mesma conta dá a mesma gente: a linha da pauta ⊆ a tela, e igual quando cabe */
  let iguais = 0, total = 0;
  for (let s = 1; s <= 600; s++) {
    const c = cena(s * 104729);
    const lista = montarEmCena({ semente: "s4", cidade: A, grupo, ...contextoDeQuemEsta(quemEstaAqui(c.e)) });
    const tela = pessoasAqui(lista).filter((x) => !x.comigo).map((x) => x.nome);
    const linha = emCenaParaPauta(lista);
    const naPauta = tela.filter((nm) => linha.includes(nm));
    total++;
    if (naPauta.length === Math.min(tela.length, EM_CENA_NA_PAUTA.pessoa)) iguais++;
  }
  console.log(`      a gente da tela na linha da pauta: ${iguais} de ${total}`);
  t("CATRACA: a gente da tela é a da pauta em 100 % das cenas (até ao teto da linha)", iguais === total, `${iguais}/${total}`);
}

sec("6. (S4b) a proposta é do sítio onde nasceu");
{
  const { chaveDoSitio, propostaAindaVale } = await import(S + "motor/a-proposta-da-frase.js");
  const ali = { cidadeAtual: A, lugar: { nome: "A Praça da Alfândega", distancia: "dentro" } };
  const p = { verbo: "Ir até Raízes", impedido: true, sitio: chaveDoSitio(ali) };
  t("no mesmo sítio, a proposta vale", propostaAindaVale(p, { ...ali }));
  t("o herói foi a outro sítio da cidade: sai", !propostaAindaVale(p, { cidadeAtual: A, lugar: { nome: "A Estalagem do Sino" } }));
  t("o herói pôs-se na estrada: sai", !propostaAindaVale(p, { ...ali, jornada: { de: A, para: B } }));
  t("o herói chegou a outra cidade: sai", !propostaAindaVale(p, { cidadeAtual: B }));
  t("o herói desceu à masmorra: sai", !propostaAindaVale(p, { ...ali, masmorra: { nome: "Paliçada" } }));
  t("a proposta de antes desta lei (sem sítio) vale como sempre valeu", propostaAindaVale({ verbo: "x" }, { cidadeAtual: B }));
  t("lixo não estoura", !propostaAindaVale(null, null) && typeof chaveDoSitio(null) === "string");
  const fr = fs.readFileSync(new URL("../src/motor/a-proposta-da-frase.js", import.meta.url), "utf8");
  t("toda proposta nasce com o sítio", /sitio: chaveDoSitio\(e\)/.test(fr));
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  t("o App leva-a embora quando o lugar, a estrada ou a masmorra mudam", /propostaAindaVale\(propostaDaFrase, estadoDoPedido\(\)\)[\s\S]{0,200}\}, \[lugar, jornada, masmorra\]\)/.test(app));
}

console.log(`\nquem está aqui (S4): ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
