/* AS INVENÇÕES, CONTADAS — a régua do "Narrador só narra" (E1, 12/10).

   A medição de 12/10 (`mente/narrador-so-narra.md` §3) contou 31 afirmações
   com número, nome ou consequência que o Narrador pôs na 6.ª e na 7.ª
   sessões, e de onde cada uma veio: 14 o sistema não tinha, 6 tinha errado,
   4 tinha e não mandou, 7 mandou e o Narrador ignorou. Com o dado na pauta
   eram só essas 7. Os contadores viviam no scratchpad daquela sessão (que é
   efémero); aqui ficam, nos dois modos que a 8.ª sessão vai precisar.

   1) SEM ARGUMENTO — a reprodução offline. Cada caso de
      `invencoes-s6-s7.json` (a frase do jogador e o estado mínimo) passa
      pela peça do motor que devia trazer o dado, e conta-se quantos agora o
      trazem em frase fechada. O alvo da E1 é ≥ 27 de 31. Imprime a tabela
      por tipo e por origem; com `--json`, só o resumo (é o que a suíte
      `teste-narrador-so-narra.mjs` lê). Sai com 1 abaixo do alvo.

      O que isto prova e o que não prova: prova que o MOTOR entrega o dado
      no turno do caso; não prova que a linha cabe na pauta desse turno (o
      teto mede-se em `teste-narrador-so-narra.mjs`, secção do teto), nem
      que o Narrador a cumpre — isso é a 8.ª sessão.

   2) `node ab-invencoes.mjs <registo.jsonl> [...]` — a contagem de uma
      sessão jogada (o registo do `api/narrador`). Por resposta do Narrador:
      os preços, distâncias/tempos, nomes próprios de primeira aparição e
      lutas narradas que NÃO estavam em nada do que ele recebeu (system +
      mensagens) nem em prosa sua anterior. É a caça de `inventa.cjs`, com a
      mesma régua; a leitura à mão de cada caso duvidoso continua a ser de
      quem mede.

   Sem exports, de propósito: não acorda a catraca. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const S = "../src/";
const ALVO = 27;
const args = process.argv.slice(2);
const soJson = args.includes("--json");
const registos = args.filter((a) => !a.startsWith("--"));

/* ============================================================
   MODO 2 — a contagem de um registo jogado
   ============================================================ */
if (registos.length) {
  const parse = (t) => { try { return JSON.parse(t); } catch { /* segue */ } const m = String(t).match(/\{[\s\S]*\}/); try { return m ? JSON.parse(m[0]) : null; } catch { return null; } };
  const NUM = "(\\d+|um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|quinze|vinte|trinta|quarenta|cinquenta|cem|meio|meia)";
  const PRECO = new RegExp(NUM + "\\s+(moedas?|fichas?|cobres?|pratas?|peças?|ouros?|tostões|tostão|vinténs|vintém)", "gi");
  const PRECO2 = /◉\s*\d+/g;
  const DIST = new RegExp(NUM + "\\s+(km|quilômetros?|léguas?|horas?|dias?(?! de)|semanas?|milhas?)(\\s+de\\s+(marcha|caminhada|estrada|viagem|barco|carroça))?", "gi");
  const DIST2 = /(meio dia|meia hora|uma hora|dois dias|três dias)( de (marcha|caminhada|estrada|viagem|perna))?/gi;
  const LUTA = /(a luta começa|começa a luta|parte para cima|investe contra|saca(m)? (a |uma )?(faca|espada|lâmina|adaga|punhal|arma)|puxa(m)? (a |uma )?(faca|espada|lâmina|adaga|punhal))/gi;
  /* os canais que a E3 tirou do prompt (o App ainda os lê, tolerante) */
  const SAIRAM = ["moedas", "cidade_atual", "lugar_atual", "jornada_meio", "canone", "npcs"];
  const NAO_SEI = /(não sei|não sabe|ninguém sabe|não saberia|não faço ideia|difícil dizer|quem sabe\?|não tenho como saber|não é coisa que se saiba)/i;
  const escrivao = [], palavras = [];
  let perguntas = 0;
  const STOP = new Set("Você Vocês Ele Ela Eles Elas Mas Se Não Nem Quando Então Depois Antes Agora Aqui Ali Lá Um Uma Uns Umas O A Os As De Do Da Dos Das No Na Nos Nas Em Por Para Com Sem Que Quem Como Onde Isso Isto Aquilo Esse Essa Este Esta Já Ainda Só Sim Tudo Nada Ninguém Alguém Cada Outro Outra Seu Sua Meu Minha Pois Porque Talvez Logo Eu Tu Nós Lhe Te Me Dia Deus Santo Santa São Ah Oh Ei Olha Vai Vem Bom Boa Certo Pronto E É Ou Ao Aos Foi Era Tem Há Está Estão Senhor Senhora Dona".split(" "));
  const nomes = (txt) => {
    const out = new Set();
    const re = /(^|[^\n.!?"“—:]\s)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõçà]{2,}(?:\s(?:de|do|da|dos|das)?\s?[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõçà]{2,})*)/g;
    let m; while ((m = re.exec(txt))) { const n = m[2].trim(); if (!STOP.has(n.split(/\s/)[0])) out.add(n); }
    return [...out];
  };
  for (const f of registos) {
    const L = readFileSync(f, "utf8").trim().split("\n").map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    let turno = 0;
    const antes = [];
    const conta = { preco: [], dist: [], nome: [], luta: [], nao_sei: [] };
    for (const o of L) {
      let r, res;
      try { r = JSON.parse(o.req); res = JSON.parse(o.res); } catch { continue; }
      if (!String(r.system || "").startsWith("Você é o NARRADOR")) continue;
      const j = parse(res.texto);
      if (!j || !j.narrativa) continue;
      turno++;
      const user = r.messages.filter((m) => m.role === "user").map((m) => (typeof m.content === "string" ? m.content : JSON.stringify(m.content))).join("\n");
      const entrada = (r.system + "\n" + user).toLowerCase();
      const ja = antes.join("\n").toLowerCase();
      const nar = j.narrativa;
      for (const mm of [...nar.matchAll(PRECO), ...nar.matchAll(PRECO2)]) {
        const n = (mm[0].match(/\d+/) || [mm[1]])[0];
        const tinha = new RegExp("◉\\s*" + n + "(?!\\d)|(^|\\D)" + n + "\\s+(moedas|fichas|cobres|pratas)").test(entrada) || entrada.includes(mm[0].toLowerCase());
        if (!tinha) conta.preco.push(`M${turno} «${mm[0]}»`);
      }
      for (const mm of [...nar.matchAll(DIST), ...nar.matchAll(DIST2)]) if (!entrada.includes(mm[0].toLowerCase())) conta.dist.push(`M${turno} «${mm[0]}»`);
      for (const n of nomes(nar)) {
        const k = n.toLowerCase(), k1 = k.split(/\s/)[0];
        if (entrada.includes(k) || ja.includes(k) || (k1.length > 3 && entrada.includes(k1))) continue;
        conta.nome.push(`M${turno} «${n}»`);
      }
      const abriu = !!(j.mudancas && Array.isArray(j.mudancas.combate_iniciar) && j.mudancas.combate_iniciar.length);
      const last = r.messages[r.messages.length - 1];
      const sistemaLuta = /\[COMBATE|INIMIGOS EM CAMPO/i.test(typeof last.content === "string" ? last.content : JSON.stringify(last.content));
      for (const mm of nar.matchAll(LUTA)) if (!sistemaLuta) conta.luta.push(`M${turno} «${mm[0]}»${abriu ? " (abriu pelo canal)" : ""}`);
      /* E3 (12/10): as vigias da 8.ª sessão (mente/narrador-so-narra.md,
         "E3 — medida"). O escrivão que ainda chega (por campo, e se é um dos
         canais que saíram do prompt), as palavras por narrativa (a vigia
         contra o burocrático: ±15% da 7.ª) e o "não sei" a uma pergunta do
         jogador (teto: 1 em 10). Candidatas, como o resto: lê-se à mão. */
      const md = j.mudancas && typeof j.mudancas === "object" ? j.mudancas : null;
      const campos = md ? Object.entries(md).filter(([, v]) => v !== null && v !== false && v !== "" && !(Array.isArray(v) && !v.length) && !(typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length)).map(([k]) => k) : [];
      if (campos.length) escrivao.push(`M${turno} ${campos.map((k) => (SAIRAM.includes(k) ? `${k} (saiu do prompt)` : k)).join(", ")}`);
      palavras.push(nar.split(/\s+/).filter(Boolean).length);
      const pedidoTxt = String((typeof last.content === "string" ? last.content : JSON.stringify(last.content)).split("[O QUE EU FAÇO AGORA").pop() || "");
      if (/\?/.test(pedidoTxt)) {
        perguntas++;
        const ns = nar.match(NAO_SEI);
        if (ns) conta.nao_sei.push(`M${turno} «${ns[0]}»`);
      }
      antes.push(nar);
    }
    console.log(`\n### ${f} — ${turno} respostas do Narrador`);
    for (const [k, v] of Object.entries(conta)) {
      console.log(`${k}: ${v.length} candidata(s)${k === "nao_sei" ? ` em ${perguntas} pergunta(s) do jogador (teto: 1 em 10)` : " fora da entrada"}`);
      for (const x of v) console.log(`   ${x}`);
    }
    console.log(`escrivão: ${escrivao.length} de ${turno} respostas com mudancas (alvo da 8.ª: ≤ 2 em 70, só "perigo" e o combate)`);
    for (const x of escrivao) console.log(`   ${x}`);
    const ord = [...palavras].sort((a, b) => a - b);
    const med = ord.length ? ord[Math.floor(ord.length / 2)] : 0;
    console.log(`palavras por narrativa: mediana ${med}, média ${ord.length ? Math.round(ord.reduce((a, b) => a + b, 0) / ord.length) : 0} (vigia: ±15% da 7.ª)`);
    escrivao.length = 0; palavras.length = 0; perguntas = 0;
  }
  process.exit(0);
}

/* ============================================================
   MODO 1 — a reprodução offline das 31
   ============================================================ */
const FIX = JSON.parse(readFileSync(join(AQUI, "invencoes-s6-s7.json"), "utf8"));
const M = await import(S + "mercado.js");
const B = await import(S + "bolsa-da-frase.js");
const CP = await import(S + "cidade-por-dentro.js");
const N = await import(S + "nomes.js");
const MS = await import(S + "masmorras.js");
const L = await import(S + "lugar.js");
const A = await import(S + "agressao.js");
const P = await import(S + "procura.js");
const GE = await import(S + "geografo.js");
const R = await import(S + "regiao.js");
const ST = await import(S + "subtramas.js");
const NU = await import(S + "nucleo.js");
const { ESTRUTURAS } = await import(S + "historia.js");
const { gerarGeografia } = await import(S + "geografia.js");
const { MOLDES, moldePorId } = await import(S + "moldes.js");
const { locaisDaCidade } = await import(S + "mundo-base.js");
const { estenderEspinha } = await import(S + "saga.js");
const { guildasDoMundo } = await import(S + "guildas.js");
const { elencoDoMundo } = await import(S + "elenco.js");
const { abrirAbertura } = await import(S + "abertura.js");
const { companheiroInicial } = await import(S + "companheiro-inicial.js");

const G = "Fantasia medieval";
/* um mundo de cidade, para o balcão, o fator e os locais */
const MAPA = gerarGeografia("Invencoes|cidade", MOLDES[0]);
const CIDADE = MAPA.cidades[0];
const FICHA = CP.fichaDaCidade(CIDADE, { semente: "Invencoes|cidade", genero: G });
const FATOR = FICHA.pouso.fator;
const BALCAO = M.balcaoDeMantimentos(CIDADE, { dia: 1 });
const LOCAIS = locaisDaCidade("Invencoes|cidade", CIDADE, G, MOLDES[0], null);

/* a planta da 6.ª sessão (Alicerces de Raízes), como o registo a mostrou à
   entrada: três passagens, e quem está atrás de cada uma */
const PLANTA_S6 = {
  nome: "Alicerces de Raízes", atual: 0, tochas: 0, chave: false,
  salas: [
    { id: 0, tipo: "entrada", camada: 0, saidas: [1, 2, 3], visitada: true, resolvida: true },
    { id: 1, tipo: "combate", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "ouve-se respiração pesada lá dentro", inimigos: [{ nome: "voraz de boca larga", ameaca: "comum" }] },
    { id: 2, tipo: "armadilha", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "o chão à frente tem marcas estranhas" },
    { id: 3, tipo: "chave", camada: 1, saidas: [4], visitada: false, resolvida: false, pista: "cheiro de metal e cera antiga", inimigos: [{ nome: "voraz de couraça", ameaca: "comum" }] },
    { id: 4, tipo: "chefe", camada: 2, saidas: [], visitada: false, resolvida: false, pista: "silêncio", inimigos: [{ nome: "Bicho do Fundo", ameaca: "elite" }] },
  ],
};

/* o mundo da 7.ª (o antecedente "artista"), para o coração — o mesmo molde
   de teste-sessao-7.mjs */
let W = null;
function mundoDoCoracao() {
  if (W) return W;
  const PISTAS = ["trauteia a canção do herói com um verso que o herói nunca ouviu", "o caderno da pauta, com uma pena queimada na ponta no lugar da assinatura"];
  for (let i = 0; i < 80 && !W; i++) {
    const Mo = MOLDES[i % MOLDES.length];
    const semente = `Sessao7|${i}`;
    const mapa = gerarGeografia(semente, Mo);
    const cidade = mapa.cidades[0].nome;
    const guildas = guildasDoMundo(semente, mapa, G, null);
    const antecedente = "artista";
    const espinha = estenderEspinha({ semente, mapa, genero: G, molde: Mo, estrutura: "jornada", cidadeInicial: cidade, antecedente, dia: 1 });
    const ab = abrirAbertura({ semente, mapa, cidade, espinha, estrutura: "jornada", antecedente, genero: G, molde: Mo, nivel: 1, dia: 1 });
    const ci = ab && ab.abertura ? companheiroInicial({ semente, mapa, genero: G, molde: Mo, espinha, guildas, cidade, antecedente, heroi: { nome: "Dornel", nivel: 1, classe: "Bardo" }, abertura: ab.abertura }) : null;
    const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: Mo, espinha, guildas });
    const nucleo0 = NU.nucleoDaCampanha(semente, mapa, { genero: G, molde: Mo, espinha, guildas, antecedente, grupo: ci ? [ci.comp] : [], elenco });
    const elo = nucleo0.pessoas.find((p) => p.papel === "elo");
    if (!elo || elo.revelaNoAto !== 0) continue;
    const pessoas = nucleo0.pessoas.map((p) => (p === elo ? { ...p, ficha: { ...p.ficha, esconde: { ...p.ficha.esconde, pistas: PISTAS.map((o) => ({ o })) } } } : p));
    const nucleo = { ...nucleo0, pessoas };
    W = { semente, mapa, espinha, elenco, nucleo, subs: ST.subtramasDoNucleo(nucleo, { semente, espinha, elenco, genero: G }), elo: pessoas.find((p) => p.papel === "elo") };
  }
  return W;
}
/* um arco do camarada (a_guerra), num mundo qualquer que o tenha */
let CAM = null;
function arcoDoCamarada() {
  if (CAM) return CAM;
  for (let i = 0; i < 120 && !CAM; i++) {
    const Mo = MOLDES[i % MOLDES.length];
    const semente = `Camarada|${i}`;
    const mapa = gerarGeografia(semente, Mo);
    const espinha = estenderEspinha({ semente, mapa, genero: G, molde: Mo, estrutura: "jornada", cidadeInicial: mapa.cidades[0].nome, antecedente: "artista", dia: 1 });
    const guildas = guildasDoMundo(semente, mapa, G, null);
    const elenco = elencoDoMundo(semente, mapa, { genero: G, molde: Mo, espinha, guildas });
    const nucleo = NU.nucleoDaCampanha(semente, mapa, { genero: G, molde: Mo, espinha, guildas, antecedente: "artista", grupo: [], elenco });
    const subs = ST.subtramasDoNucleo(nucleo, { semente, espinha, elenco, genero: G });
    const inst = subs.find((s) => s.arco === "a_guerra");
    if (inst) CAM = { semente, espinha, elenco, nucleo, subs, inst };
  }
  return CAM;
}

/* cada prova devolve { tem: bool, dado: "a linha" } */
const PROVAS = {
  fora: () => ({ tem: false, dado: "" }),
  jaTinha: (c) => ({ tem: !!c.tinha, dado: c.tinha || "" }),
  precoComum: (c) => {
    const r = M.precoComumParaPauta(c.frase, { fator: FATOR });
    const l = r.pergunta[0] || "";
    return { tem: /◉\s*\d/.test(l) && (!c.espera || l.includes(c.espera)), dado: l };
  },
  rua: () => {
    const l = M.precosDaRua(FATOR);
    return { tem: /peixe seco ◉\s*\d/.test(l), dado: l };
  },
  balcao: (c) => {
    const k = B.compraNaFrase(c.frase, { balcao: BALCAO, bolsa: 100 });
    const l = k ? `${B.falaDaCompra(k)} · ${B.envelopeDaCompra(k)}` : "";
    return { tem: !!k && k.total > 0 && /◉\s*\d/.test(l), dado: l.slice(0, 160) };
  },
  balcaoPergunta: (c) => {
    const r = B.balcaoParaPauta(c.frase, { balcao: BALCAO });
    const l = r.pergunta[0] || "";
    return { tem: /dá ◉\s*\d/.test(l), dado: l };
  },
  acento: (c) => {
    const banca = [{ nome: "Banca das Fichas", estoque: [{ nome: "Lavada Alabarda de muro", tipo: "arma", preco: 88 }] }];
    const errado = (M.mercadoParaPauta(banca, c.frase).pergunta[0] || "");
    const certo = M.precoComumParaPauta(c.frase, { fator: FATOR }).pergunta[0] || "";
    return { tem: !/maca/.test(errado) && /fruta ◉\s*\d/.test(certo), dado: certo || errado };
  },
  dentroDosMuros: (c) => {
    const local = LOCAIS[2] ? LOCAIS[2].nome : "";
    const frase = c.frase.replace("{local}", local.replace(/^(o|a|os|as)\s+/i, ""));
    const r = CP.fichaParaPauta(CIDADE, { semente: "Invencoes|cidade", genero: G, mapa: MAPA, frase });
    const l = r.pergunta.find((x) => x.startsWith("distância:")) || "";
    return { tem: /\d+ (m|km)\b.*\d+ min a pé/.test(l), dado: l };
  },
  medidaUnica: () => {
    const molde = moldePorId("sobremundo");
    for (let i = 0; i < 12; i++) {
      const mapa = R.mapaDaCampanhaNova(R.gerarRegiao({ semente: `Medida|${i}`, molde, genero: G, estrutura: ESTRUTURAS[0].id }));
      const base = mapa.cidades[0], outra = mapa.cidades[1];
      const lugar = mapa.regiao && (mapa.regiao.lugares || [])[0];
      if (!base || !outra || !lugar) continue;
      const coord = { x: lugar.x, y: lugar.y };
      const sitio = { nome: lugar.nome, distancia: "arredores", coord };
      const npcs = { Elmo: { nome: "Elmo", local: outra.nome, status: "vivo" } };
      const r = P.procurarPessoa("Elmo", { npcs, cidadeAtual: base.nome, mapa, coord, lugar: sitio });
      const linhaGeo = GE.quemNaoChega([{ nome: "Elmo", onde: outra.nome, dias: 1 }], { mapa, coord, cidadeAtual: base.nome, lugar: sitio })[0] || "";
      if (!r || r.desfecho !== "noutro_lugar" || !r.tempo) continue;
      const env = P.envelopeDaProcura(r);
      const igual = linhaGeo.includes(r.distancia) && linhaGeo.includes(r.tempo) && env.includes(r.distancia) && env.includes(r.tempo);
      return { tem: igual, dado: `procura: ${r.distancia}, ${r.tempo} · geógrafo: ${linhaGeo.slice(0, 120)}` };
    }
    return { tem: false, dado: "sem região que o prove" };
  },
  nomesAMao: (c) => {
    const ns = N.nomesAMao({ semente: `s${c.sessao}`, dia: 1, cidade: "Sul Molhado", genero: G, usados: ["Tônia Lodoso", "Jaco Faro", "Frida da Vela"] });
    const l = N.linhaDosNomesAMao(ns);
    return { tem: ns.length === 2 && ns.every((n) => l.includes(n.nome)), dado: l };
  },
  nomeMorto: (c) => {
    const ns = N.nomesAMao({ semente: `s${c.sessao}`, dia: 2, cidade: "Quebrado do Leste", genero: G });
    const prosa = c.prosa.replace("{nome}", ns[0] ? ns[0].nome.split(" ")[0] : "");
    const usado = N.nomesAMaoNaProsa(prosa, ns);
    return { tem: usado.length === 1 && usado[0].morto === true, dado: `${N.linhaDosNomesAMao(ns)} → ${JSON.stringify(usado)}` };
  },
  figura: () => {
    const c = arcoDoCamarada();
    if (!c) return { tem: false, dado: "sem arco do camarada" };
    const nome = c.inst.figura && c.inst.figura.nome;
    return { tem: !!nome && c.inst.crise.o.startsWith(nome), dado: c.inst.crise.o };
  },
  lutaPrometida: () => {
    const c = arcoDoCamarada();
    if (!c) return { tem: false, dado: "sem arco do camarada" };
    const posta = { v: 1, arcos: { [c.inst.nome]: { pedido: 1, crise: 3, posta: 4 } } };
    const r = ST.escolherLado(posta, c.nucleo, c.inst.nome, "defender", { semente: c.semente, espinha: c.espinha, elenco: c.elenco, subtramas: c.subs, dia: 4, ato: 0 });
    return { tem: !!(r.luta && c.inst.figura && r.luta.nome === c.inst.figura.nome && r.luta.duelo), dado: JSON.stringify(r.luta) };
  },
  lugarPedido: (c) => {
    const daqui = [{ nome: "o posto da estrada", tipo: "posto", onde: "arredores" }, { nome: "o adro velho", tipo: "cemitério de fora", onde: "arredores" }];
    const r = L.lugarPedido(c.frase, daqui);
    return { tem: r === null, dado: r ? `moveu para ${r.nome}` : "o Posto da Baixa não vira o posto da estrada" };
  },
  ocupante: (c) => {
    const ls = MS.masmorraParaPauta(PLANTA_S6);
    const quem = PLANTA_S6.salas.find((s) => s.id === c.sala).inimigos[0].nome;
    const l = ls.find((x) => x.startsWith("à frente")) || "";
    return { tem: l.includes(quem), dado: l };
  },
  vetoLuta: (c) => {
    const v = A.vetoDaLutaSemPainel(c.frase, {});
    return { tem: v.length === 1, dado: v[0] || "" };
  },
  revelacao: (c) => {
    const w = mundoDoCoracao();
    if (!w) return { tem: false, dado: "sem mundo" };
    const duas = { v: 1, arcos: { [w.elo.nome]: { pedido: 1, pistas: [2, 2] } } };
    const r = ST.avancarCoracao(duas, w.nucleo, { semente: w.semente, espinha: w.espinha, elenco: w.elenco, subtramas: w.subs, dia: 3, ato: 0, turno: 55, emCena: [w.elo.nome], frase: c.frase });
    return { tem: !!(r.batida && r.batida.tipo === "revelacao"), dado: r.batida ? r.batida.linha || r.batida.tipo : "" };
  },
};

const linhas = [];
const porTipo = {}, porOrigem = {};
let comDado = 0, antesComDado = 0;
for (const c of FIX.casos) {
  let r;
  try { r = (PROVAS[c.prova] || PROVAS.fora)(c); } catch (e) { r = { tem: false, dado: `estourou: ${e.message}` }; }
  if (r.tem) comDado++;
  if (c.antes === "ignorou") antesComDado++;
  (porTipo[c.tipo] ||= { total: 0, tem: 0 }).total++;
  if (r.tem) porTipo[c.tipo].tem++;
  (porOrigem[c.antes] ||= { total: 0, tem: 0 }).total++;
  if (r.tem) porOrigem[c.antes].tem++;
  linhas.push({ id: c.id, tipo: c.tipo, antes: c.antes, prova: c.prova, tem: r.tem, dado: r.dado });
}
const resumo = { total: FIX.casos.length, antes: antesComDado, agora: comDado, alvo: ALVO, porTipo, porOrigem, semDado: linhas.filter((x) => !x.tem).map((x) => x.id) };
if (soJson) {
  console.log(JSON.stringify(resumo));
} else {
  console.log(`\nAS INVENÇÕES DA 6.ª E DA 7.ª, CONTRA O MOTOR DE HOJE\n`);
  for (const x of linhas) console.log(`  ${x.tem ? "dado" : " -- "}  ${x.id.padEnd(22)} ${x.tipo.padEnd(10)} (${x.antes}) ${String(x.dado).slice(0, 150)}`);
  console.log(`\npor tipo:`);
  for (const [k, v] of Object.entries(porTipo)) console.log(`  ${k.padEnd(10)} ${v.tem} de ${v.total}`);
  console.log(`por origem (a da medição):`);
  for (const [k, v] of Object.entries(porOrigem)) console.log(`  ${k.padEnd(10)} ${v.tem} de ${v.total}`);
  console.log(`\ncom o dado em frase fechada: ${comDado} de ${FIX.casos.length} (antes: ${antesComDado}; alvo: ≥ ${ALVO})`);
}
process.exit(comDado >= ALVO ? 0 : 1);
