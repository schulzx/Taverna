/* ============================================================
   GEOGRAFIA (v7.5) — Taverna
   Parâmetros de cidades, regiões e continentes + GERADOR por
   código. O mundo nasce com nomes, populações, biomas e ROTAS
   com dias de viagem — o Mestre não inventa mais o caminho na
   hora (uma hora mar, outra deserto): a geografia é fato fixo,
   sorteada pelo sistema e servida pronta para a narração.
   ============================================================ */

/* ---------------- PARÂMETROS DE PORTE ----------------
   Faixas de população por tipo de assentamento — âncora para o
   Mestre e para o cálculo de fé por acontecimento. */
export const PORTES = {
  ruina:     { rotulo: "ruína",      min: 0,     max: 0,     servicos: "nenhum — só ecos e perigo" },
  aldeia:    { rotulo: "aldeia",     min: 50,    max: 300,   servicos: "ferreiro simples, taverna comum" },
  vila:      { rotulo: "vila",       min: 300,   max: 1500,  servicos: "mercado semanal, estalagem, curandeiro" },
  cidade:    { rotulo: "cidade",     min: 1500,  max: 15000, servicos: "guildas, templos, mercado permanente" },
  capital:   { rotulo: "capital",    min: 15000, max: 80000, servicos: "corte, catedral, universidade, porto grande" },
  metropole: { rotulo: "metrópole",  min: 80000, max: 300000, servicos: "tudo que o mundo oferece — e tudo que ele esconde" },
  fortaleza: { rotulo: "fortaleza",  min: 200,   max: 2000,  servicos: "guarnição, armeiro, poucas comodidades" },
};
export function populacaoDe(porte, rnd = Math.random) {
  const p = PORTES[porte] || PORTES.cidade;
  if (!p.max) return 0;
  return Math.round((p.min + rnd() * (p.max - p.min)) / 10) * 10;
}

/* ---------------- BIOMAS E VIAGEM ---------------- */
export const BIOMAS = ["planicie", "floresta", "colina", "montanha", "deserto", "pantano", "costa", "gelo"];
export const BIOMA_ROTULO = { planicie: "planície", floresta: "floresta", colina: "colinas", montanha: "montanhas", deserto: "deserto", pantano: "pântano", costa: "costa", gelo: "gelo" };

/* km por dia de viagem a pé/por montaria leve, por tipo de terreno */
export const TERRENO_VIAGEM = {
  estrada:   { kmDia: 40, rotulo: "estrada" },
  planicie:  { kmDia: 30, rotulo: "campo aberto" },
  colina:    { kmDia: 25, rotulo: "colinas" },
  floresta:  { kmDia: 20, rotulo: "trilha na mata" },
  costa:     { kmDia: 30, rotulo: "caminho litorâneo" },
  pantano:   { kmDia: 12, rotulo: "pântano traiçoeiro" },
  deserto:   { kmDia: 15, rotulo: "deserto" },
  montanha:  { kmDia: 12, rotulo: "passo de montanha" },
  gelo:      { kmDia: 12, rotulo: "gelo" },
  maritima:  { kmDia: 90, rotulo: "rota marítima" },
};
/* 1 unidade do mapa (0-100) ≈ 25 km — um continente de ~2.500 km */
export const KM_POR_UNIDADE = 25;

/* ---------------- NOMES ---------------- */
const REGIAO_A = ["Terras", "Vales", "Campos", "Margens", "Colinas", "Chãs", "Fronteiras", "Planaltos"];
const REGIAO_B = ["do Corvo", "de Ferro", "das Brumas", "do Sal", "Verdes", "Altos", "Quebradas", "da Serpente", "do Vento", "Escarlates", "da Lua Baixa", "do Estio"];
const CIDADE_A = ["Pedra", "Vila", "Porto", "Forte", "Monte", "Rio", "Ponte", "Torre", "Alto", "Baixo", "Nova", "Velha", "Casa", "Ponto"];
const CIDADE_B = ["valente", "do Sul", "do Norte", "clara", "escura", "do Rei", "das Águias", "Profundo", "da Fonte", "do Vigia", "Serena", "Rasa", "do Martelo", "das Velas", "Seco", "Brumoso"];
const CONT_A = ["Aeth", "Kor", "Vald", "Oss", "Thar", "Bel", "Myr", "Dur"];
const CONT_B = ["enia", "oria", "amar", "ênia", "gard", "lon", "wic", "dor"];

/* RNG determinístico (mesma semente → mesmo mundo) */
function rngDe(semente) {
  let h = 2166136261;
  const s = String(semente || "taverna");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}
const pickR = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* Nome de cidade único dentro do conjunto */
function nomeCidade(rnd, usados) {
  for (let t = 0; t < 12; t++) {
    const nome = `${pickR(rnd, CIDADE_A)} ${pickR(rnd, CIDADE_B)}`;
    if (!usados.has(nome.toLowerCase())) { usados.add(nome.toLowerCase()); return nome; }
  }
  const fallback = `Porto ${Math.floor(rnd() * 900 + 100)}`;
  usados.add(fallback.toLowerCase());
  return fallback;
}

/* ---------------- ROTAS ----------------
   Liga cada cidade às 2 mais próximas (malha de caminhos), classifica
   o terreno pelo bioma dos dois lados e calcula a distância e os dias. */
export function gerarRotas(cidades) {
  const cs = cidades || [];
  const rotas = [];
  for (let i = 0; i < cs.length; i++) {
    const dists = cs.map((o, j) => ({ j, d: Math.hypot((cs[i].x || 0) - (o.x || 0), (cs[i].y || 0) - (o.y || 0)) })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    for (const { j, d } of dists.slice(0, 2)) {
      const de = cs[i].nome, para = cs[j].nome;
      if (rotas.some((r) => (r.de === de && r.para === para) || (r.de === para && r.para === de))) continue;
      const b1 = cs[i].bioma || "planicie", b2 = cs[j].bioma || "planicie";
      let terreno = "estrada";
      if (b1 === "costa" && b2 === "costa" && d > 30) terreno = "maritima";
      else if (b1 === "montanha" || b2 === "montanha") terreno = "montanha";
      else if (b1 === "deserto" || b2 === "deserto") terreno = "deserto";
      else if (b1 === "pantano" || b2 === "pantano") terreno = "pantano";
      else if (b1 === "gelo" || b2 === "gelo") terreno = "gelo";
      else if (b1 === "floresta" && b2 === "floresta") terreno = "floresta";
      else if (b1 !== "planicie" || b2 !== "planicie") terreno = b1 === "costa" || b2 === "costa" ? "costa" : "colina";
      const km = Math.max(20, Math.round(d * KM_POR_UNIDADE / 10) * 10);
      const tv = TERRENO_VIAGEM[terreno];
      const dias = Math.max(0.5, Math.round((km / tv.kmDia) * 2) / 2);
      rotas.push({ de, para, terreno, km, dias });
    }
  }
  return rotas;
}

/* ---------------- GERADOR DE MUNDO ----------------
   Um continente, 3-5 regiões com bioma próprio, 8-14 cidades com
   porte e população, e a malha de rotas. Determinístico pela semente. */
export function gerarGeografia(semente) {
  const rnd = rngDe(semente);
  const continente = `${pickR(rnd, CONT_A)}${pickR(rnd, CONT_B)}`;
  const nRegioes = 3 + Math.floor(rnd() * 3);
  const usadosR = new Set(), usadosC = new Set();
  const regioes = [];
  for (let i = 0; i < nRegioes; i++) {
    let nome;
    do { nome = `${pickR(rnd, REGIAO_A)} ${pickR(rnd, REGIAO_B)}`; } while (usadosR.has(nome));
    usadosR.add(nome);
    /* cada região ocupa um setor do mapa e tem um bioma dominante */
    const ang = (Math.PI * 2 * i) / nRegioes + rnd() * 0.6;
    const cx = 50 + Math.cos(ang) * (22 + rnd() * 12);
    const cy = 50 + Math.sin(ang) * (22 + rnd() * 12);
    regioes.push({ nome, bioma: pickR(rnd, BIOMAS), cx: Math.max(14, Math.min(86, cx)), cy: Math.max(14, Math.min(86, cy)) });
  }
  const cidades = [];
  const totalC = 8 + Math.floor(rnd() * 7);
  /* garante ao menos 1 capital e 1-2 cidades grandes */
  const porteInicial = ["capital", "cidade", "cidade"];
  for (let i = 0; i < totalC; i++) {
    const reg = regioes[i % regioes.length];
    const porte = i < porteInicial.length ? porteInicial[i] : pickR(rnd, ["aldeia", "vila", "vila", "cidade", "fortaleza"]);
    const x = Math.max(6, Math.min(94, Math.round(reg.cx + (rnd() - 0.5) * 26)));
    const y = Math.max(6, Math.min(94, Math.round(reg.cy + (rnd() - 0.5) * 26)));
    cidades.push({
      nome: nomeCidade(rnd, usadosC),
      tipo: porte,
      porte,
      populacao: populacaoDe(porte, rnd),
      regiao: reg.nome,
      bioma: reg.bioma,
      faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
      x, y, descoberta: true,
    });
  }
  return { continente, regioes, cidades, rotas: gerarRotas(cidades) };
}

/* ---------------- MIGRAÇÃO DE SAVES ANTIGOS ----------------
   Cidades que já existem na ficção GANHAM porte/população/bioma
   (determinístico pelo nome — nada muda duas vezes); as rotas são
   calculadas entre o que existe. Nada é removido nem renomeado. */
export function garantirGeografia(mapa, semente) {
  const m = mapa && typeof mapa === "object" ? mapa : {};
  const cidades = (m.cidades || []).map((c) => {
    if (c.populacao != null && c.bioma) return c;
    const rnd = rngDe(`${semente}|${c.nome}`);
    const porte = c.porte || (PORTES[c.tipo] ? c.tipo : "cidade");
    return { ...c, porte, populacao: c.populacao != null ? c.populacao : populacaoDe(porte, rnd), bioma: c.bioma || pickR(rnd, BIOMAS) };
  });
  return { ...m, cidades, continente: m.continente || `${pickR(rngDe(semente), CONT_A)}${pickR(rngDe(semente + "2"), CONT_B)}`, regioes: m.regioes || [], rotas: gerarRotas(cidades) };
}

/* ---------------- RESUMO PARA O PROMPT ----------------
   O Mestre recebe a geografia como FATO: quem mora onde, quantos são,
   e quanto tempo leva cada caminho. Ele narra a viagem; não a inventa. */
export function resumoGeografiaPrompt(mapa, faccaoJogador) {
  if (!mapa || !(mapa.cidades || []).length) return "";
  const dominadas = (mapa.cidades || []).filter((c) => c.relacao === "jogador").length;
  const cab = faccaoJogador ? `Facção do jogador: ${faccaoJogador} (domina ${dominadas} cidade(s)).` : "";
  const linhas = (mapa.cidades || []).map((c) => {
    const pop = c.populacao != null ? ` · ${Number(c.populacao).toLocaleString("pt-BR")} hab.` : "";
    const bio = c.bioma ? ` · ${BIOMA_ROTULO[c.bioma] || c.bioma}` : "";
    return `• ${c.nome} (${(PORTES[c.porte || c.tipo] || {}).rotulo || c.tipo}${c.regiao ? `, ${c.regiao}` : ""}${bio}${pop}) — facção: ${c.faccao || "nenhuma"} [${c.relacao === "jogador" ? "SUA" : c.relacao || "neutra"}]${c.sede ? " [SEDE]" : ""}`;
  });
  const rotas = (mapa.rotas || []).map((r) => `• ${r.de} ↔ ${r.para}: ${(TERRENO_VIAGEM[r.terreno] || {}).rotulo || r.terreno}, ${r.km} km, ~${String(r.dias).replace(".", ",")} dia(s)`);
  return [
    cab,
    mapa.continente ? `CONTINENTE: ${mapa.continente}${(mapa.regioes || []).length ? ` — regiões: ${mapa.regioes.map((r) => `${r.nome} (${BIOMA_ROTULO[r.bioma] || r.bioma})`).join(", ")}` : ""}` : "",
    "CIDADES (porte e população são fatos do sistema):",
    ...linhas,
    rotas.length ? "CAMINHOS (rotas fixas — use SEMPRE estes terrenos e tempos; não invente mar ou deserto onde não há):" : "",
    ...rotas,
  ].filter(Boolean).join("\n");
}
