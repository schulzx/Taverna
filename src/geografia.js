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
export function rngDe(semente) {
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
   v9.9: o TAMANHO do mundo também é sorteado. Antes todo universo tinha
   1 continente, 3-5 regiões e 8-14 cidades — a variação era só de nomes,
   e dois mundos diferentes tinham sempre o mesmo esqueleto. Agora os
   próprios números saem da semente, dentro de faixas base:

     continentes  1–3     (arquipélago de impérios ou terra única)
     regiões      2–9     por continente, proporcional ao tamanho dele
     cidades      4–24    distribuídas pelas regiões
     população    já era sorteada pelo porte

   Uma vez gerado, não muda nunca: é sempre a mesma semente. */
export const FAIXAS_MUNDO = {
  continentes: [1, 3],
  regioesPorContinente: [2, 6],
  cidadesPorRegiao: [1, 4],
  minCidades: 4,
};
const entreR = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));

export function gerarGeografia(semente) {
  const rnd = rngDe(semente);
  const usadosR = new Set(), usadosC = new Set(), usadosK = new Set();
  const F = FAIXAS_MUNDO;

  /* continentes: quase sempre um, às vezes dois, raramente três */
  const nCont = rnd() < 0.62 ? 1 : rnd() < 0.8 ? 2 : entreR(rnd, 2, F.continentes[1]);
  const continentes = [];
  for (let c = 0; c < nCont; c++) {
    let nome;
    do { nome = `${pickR(rnd, CONT_A)}${pickR(rnd, CONT_B)}`; } while (usadosK.has(nome));
    usadosK.add(nome);
    continentes.push({ nome, regioes: [] });
  }

  const regioes = [];
  for (const cont of continentes) {
    const nReg = entreR(rnd, F.regioesPorContinente[0], F.regioesPorContinente[1]);
    for (let i = 0; i < nReg; i++) {
      let nome;
      do { nome = `${pickR(rnd, REGIAO_A)} ${pickR(rnd, REGIAO_B)}`; } while (usadosR.has(nome));
      usadosR.add(nome);
      regioes.push({ nome, continente: cont.nome, bioma: pickR(rnd, BIOMAS), cx: 0, cy: 0 });
      cont.regioes.push(nome);
    }
  }
  /* posiciona as regiões em coroa: continentes ocupam fatias do mapa */
  regioes.forEach((r, i) => {
    const ang = (Math.PI * 2 * i) / regioes.length + rnd() * 0.5;
    const raio = 20 + rnd() * 14;
    r.cx = Math.max(14, Math.min(86, 50 + Math.cos(ang) * raio));
    r.cy = Math.max(14, Math.min(86, 50 + Math.sin(ang) * raio));
  });

  /* cidades: cada região recebe um punhado próprio, então o total varia
     junto com o número de regiões — mundos pequenos e mundos enormes */
  const cidades = [];
  const porteInicial = ["capital", "cidade", "cidade"];
  for (const reg of regioes) {
    const quantas = entreR(rnd, F.cidadesPorRegiao[0], F.cidadesPorRegiao[1]);
    for (let i = 0; i < quantas; i++) {
      const idx = cidades.length;
      const porte = idx < porteInicial.length ? porteInicial[idx] : pickR(rnd, ["aldeia", "aldeia", "vila", "vila", "cidade", "fortaleza"]);
      const x = Math.max(6, Math.min(94, Math.round(reg.cx + (rnd() - 0.5) * 24)));
      const y = Math.max(6, Math.min(94, Math.round(reg.cy + (rnd() - 0.5) * 24)));
      cidades.push({
        nome: nomeCidade(rnd, usadosC),
        tipo: porte, porte,
        populacao: populacaoDe(porte, rnd),
        regiao: reg.nome, continente: reg.continente, bioma: reg.bioma,
        faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
        x, y, descoberta: false,
      });
    }
  }
  /* piso de segurança: um mundo com uma cidade só não dá jogo */
  while (cidades.length < F.minCidades) {
    const reg = regioes[cidades.length % regioes.length];
    cidades.push({
      nome: nomeCidade(rnd, usadosC), tipo: "vila", porte: "vila",
      populacao: populacaoDe("vila", rnd), regiao: reg.nome, continente: reg.continente, bioma: reg.bioma,
      faccao: null, relacao: "neutra", locais: [], sede: false, notas: "",
      x: Math.round(reg.cx), y: Math.round(reg.cy), descoberta: false,
    });
  }
  /* `continente` (singular) fica para quem já lia o campo antigo */
  return { continente: continentes[0].nome, continentes, regioes, cidades, rotas: gerarRotas(cidades) };
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
/* ---------------- O QUE O JOGADOR JÁ CONHECE (v9.14) ----------------
   O campo `descoberta` existia desde sempre e ninguém consultava: o mundo
   inteiro ia no prompt e no painel desde o primeiro turno. Agora ele manda —
   e o Mestre passa a receber SÓ o que o herói conhece, mais a contagem do
   que falta, para poder falar de "cidades ao norte" sem entregar os nomes. */
export const cidadesConhecidas = (mapa) => ((mapa && mapa.cidades) || []).filter((c) => c.descoberta !== false);

export function descobrirCidade(mapa, nome) {
  const alvo = String(nome || "").trim().toLowerCase();
  if (!mapa || !alvo) return { mapa, nova: null };
  const c = (mapa.cidades || []).find((x) => (x.nome || "").toLowerCase() === alvo);
  if (!c || c.descoberta !== false) return { mapa, nova: null };
  return { mapa: { ...mapa, cidades: mapa.cidades.map((x) => (x === c ? { ...x, descoberta: true } : x)) }, nova: c.nome };
}

/* Um mapa comprado abre a região inteira de uma vez — é para isso que
   alguém paga por um mapa. */
export function descobrirRegiao(mapa, regiao) {
  const alvo = String(regiao || "").trim().toLowerCase();
  if (!mapa || !alvo) return { mapa, novas: [] };
  const novas = (mapa.cidades || []).filter((c) => c.descoberta === false && (c.regiao || "").toLowerCase() === alvo).map((c) => c.nome);
  if (!novas.length) return { mapa, novas: [] };
  return { mapa: { ...mapa, cidades: mapa.cidades.map((c) => (novas.includes(c.nome) ? { ...c, descoberta: true } : c)) }, novas };
}

/* Regiões que o herói já pisou, e as que ainda são boato — é o que a lista
   de mapas à venda usa para não vender o que já está no bolso. */
export function regioesDoMapa(mapa, { conhecidas = null } = {}) {
  const rs = [...new Set(((mapa && mapa.cidades) || []).map((c) => c.regiao).filter(Boolean))];
  if (conhecidas === null) return rs;
  const abertas = new Set(cidadesConhecidas(mapa).map((c) => c.regiao));
  return conhecidas ? rs.filter((r) => abertas.has(r)) : rs.filter((r) => !abertas.has(r));
}

export function resumoGeografiaPrompt(mapa, faccaoJogador) {
  if (!mapa || !(mapa.cidades || []).length) return "";
  const conhecidas = cidadesConhecidas(mapa);
  if (!conhecidas.length) return "";
  const ocultas = (mapa.cidades || []).length - conhecidas.length;
  const dominadas = conhecidas.filter((c) => c.relacao === "jogador").length;
  const cab = faccaoJogador ? `Facção do jogador: ${faccaoJogador} (domina ${dominadas} cidade(s)).` : "";
  const linhas = conhecidas.map((c) => {
    const pop = c.populacao != null ? ` · ${Number(c.populacao).toLocaleString("pt-BR")} hab.` : "";
    const bio = c.bioma ? ` · ${BIOMA_ROTULO[c.bioma] || c.bioma}` : "";
    return `• ${c.nome} (${(PORTES[c.porte || c.tipo] || {}).rotulo || c.tipo}${c.regiao ? `, ${c.regiao}` : ""}${bio}${pop}) — facção: ${c.faccao || "nenhuma"} [${c.relacao === "jogador" ? "SUA" : c.relacao || "neutra"}]${c.sede ? " [SEDE]" : ""}`;
  });
  /* rota só aparece quando as DUAS pontas já são conhecidas: um caminho para
     um lugar que o herói nunca ouviu falar entregaria o nome dele */
  const nomesOk = new Set(conhecidas.map((c) => c.nome));
  const rotas = (mapa.rotas || []).filter((r) => nomesOk.has(r.de) && nomesOk.has(r.para))
    .map((r) => `• ${r.de} ↔ ${r.para}: ${(TERRENO_VIAGEM[r.terreno] || {}).rotulo || r.terreno}, ${r.km} km, ~${String(r.dias).replace(".", ",")} dia(s)`);
  const regioesAbertas = new Set(conhecidas.map((c) => c.regiao).filter(Boolean));
  return [
    cab,
    mapa.continente ? `CONTINENTE: ${mapa.continente}${(mapa.regioes || []).length ? ` — regiões conhecidas: ${mapa.regioes.filter((r) => regioesAbertas.has(r.nome)).map((r) => `${r.nome} (${BIOMA_ROTULO[r.bioma] || r.bioma})`).join(", ") || "nenhuma ainda"}` : ""}` : "",
    "CIDADES QUE O HERÓI CONHECE (porte e população são fatos do sistema — só estas existem para ele):",
    ...linhas,
    ocultas > 0 ? `AINDA NO ESCURO: existem ${ocultas} lugar(es) neste mundo que o herói NUNCA visitou nem viu num mapa. Você pode dizer que há estrada seguindo adiante, que viajantes falam de terras a mais dias de marcha, que um mapa se compra com um cartógrafo — mas NUNCA invente o nome nem descreva uma dessas cidades. Elas se revelam viajando ou comprando o mapa da região.` : "",
    rotas.length ? "CAMINHOS (rotas fixas — use SEMPRE estes terrenos e tempos; não invente mar ou deserto onde não há):" : "",
    ...rotas,
  ].filter(Boolean).join("\n");
}
