/* ============================================================
   MAPA E FACÇÕES — Taverna
   Cidades viram registros persistentes (nome, facção, relação),
   geradas uma vez e salvas. A IA lê o registro em vez de recriar,
   o que corta tokens e acaba com cidades aleatórias repetidas.
   Facções controlam territórios; a relação delas com a SUA facção
   define como você é tratado em cada lugar.
   ============================================================ */

/* Relação de uma facção com a facção do jogador */
export const RELACOES = {
  jogador: { rotulo: "Sua facção", cor: "#C9973F" },
  aliada: { rotulo: "Aliada", cor: "#6BbF59" },
  neutra: { rotulo: "Neutra", cor: "#9A93A6" },
  inimiga: { rotulo: "Inimiga", cor: "#C0504D" },
};

/* Cria o registro de uma cidade novo (chamado quando o Mestre
   apresenta uma cidade pela primeira vez). Posição no mapa é
   determinística a partir do nome (como as sementes dos retratos),
   então a mesma cidade sempre cai no mesmo ponto. */
export function criarCidade(nome, dados = {}) {
  return {
    nome,
    faccao: dados.faccao || null,        // nome da facção dominante
    relacao: dados.relacao || "neutra",  // jogador | aliada | neutra | inimiga
    regiao: dados.regiao || "",          // ex.: "Sul", "Costa de Ferro"
    tipo: dados.tipo || "cidade",        // vila | cidade | capital | fortaleza | ruína
    locais: dados.locais || [],          // pontos notáveis (taverna, templo, mercado)
    sede: dados.sede || false,           // é sede/capital da facção do jogador?
    notas: dados.notas || "",
    x: posDeterministica(nome).x,
    y: posDeterministica(nome).y,
    descoberta: true,
  };
}

/* posição pseudo-aleatória estável a partir do nome */
function posDeterministica(nome) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
  const x = 8 + (h % 84);                       // 8%..92% da largura
  const y = 8 + (Math.floor(h / 84) % 84);      // 8%..92% da altura (sempre positivo)
  return { x, y };
}

/* Cria/atualiza uma facção. Uma "potência" cobre guildas E reinos —
   o tipo é o rótulo; tratados e poder são a mecânica. */
export function criarFaccao(nome, dados = {}) {
  return {
    nome,
    relacao: dados.relacao || "neutra",   // jogador | aliada | neutra | inimiga
    lider: dados.lider || "",
    tipo: dados.tipo || "guilda",         // guilda | reino | culto | clã | corporação
    tratado: dados.tratado || "nenhum",   // nenhum | comercio | alianca | vassalagem | guerra
    poder: dados.poder || "",             // menor | regional | grande | imperio
    notas: dados.notas || "",
    doJogador: dados.doJogador || false,
  };
}

/* ---------------- DIPLOMACIA (potências) ---------------- */
export const TRATADOS = {
  nenhum: { rotulo: "—", cor: "#9A93A6" },
  comercio: { rotulo: "Comércio", cor: "#E8A33D" },
  alianca: { rotulo: "Aliança", cor: "#6BbF59" },
  vassalagem: { rotulo: "Vassalo", cor: "#B0A5EC" },
  guerra: { rotulo: "Guerra", cor: "#C0504D" },
};

/* Resumo diplomático para o prompt (compacto; só potências que importam) */
export function resumoDiplomacia(mapa, faccaoJogador) {
  const fs = (mapa?.faccoes || []).filter((f) => f.nome !== faccaoJogador);
  if (!fs.length) return "";
  const linhas = fs.map((f) => {
    const t = f.tratado && f.tratado !== "nenhum" ? ` · tratado: ${f.tratado}` : "";
    return `• ${f.nome} (${f.tipo || "facção"}${f.lider ? `, líder: ${f.lider}` : ""}${f.poder ? `, poder ${f.poder}` : ""}) — relação: ${f.relacao}${t}${f.notas ? ` — ${f.notas}` : ""}`;
  });
  return `Potências conhecidas:\n${linhas.join("\n")}`;
}

/* A partir do mundo salvo, quais cidades a facção do jogador domina */
export function cidadesDominadas(mapa) {
  return (mapa?.cidades || []).filter((c) => c.relacao === "jogador");
}

/* Onde o jogador acampa numa cidade: sede da guilda > casa da facção >
   acampamento comum. Retorna { tipo, texto } para o app e o Mestre. */
export function localDeDescanso(mapa, cidadeAtual, faccaoJogador) {
  if (!cidadeAtual) return { tipo: "acampamento", texto: "acampamento em campo aberto" };
  const cidade = (mapa?.cidades || []).find((c) => c.nome.toLowerCase() === String(cidadeAtual).toLowerCase());
  if (!cidade) return { tipo: "acampamento", texto: "acampamento na região" };
  if (cidade.sede) return { tipo: "sede", texto: `a sede de ${faccaoJogador || "sua guilda"} em ${cidade.nome}` };
  if (cidade.relacao === "jogador") return { tipo: "casa", texto: `uma casa de ${faccaoJogador || "sua facção"} em ${cidade.nome}` };
  if (cidade.relacao === "aliada") return { tipo: "aliada", texto: `um refúgio aliado em ${cidade.nome}` };
  if (cidade.relacao === "inimiga") return { tipo: "hostil", texto: `um esconderijo improvisado em ${cidade.nome} (território hostil — descanso arriscado)` };
  return { tipo: "estalagem", texto: `uma estalagem em ${cidade.nome}` };
}

/* Resumo do mapa para injetar no prompt (compacto, só o essencial) */
export function resumoMapaParaPrompt(mapa, faccaoJogador) {
  if (!mapa || !(mapa.cidades || []).length) return "";
  const linhas = mapa.cidades.map((c) => {
    const rel = c.relacao === "jogador" ? "SUA" : c.relacao;
    const marca = c.sede ? " [SEDE]" : "";
    return `• ${c.nome}${marca} (${c.tipo}${c.regiao ? `, ${c.regiao}` : ""}) — facção: ${c.faccao || "nenhuma"} [${rel}]`;
  });
  const dominadas = cidadesDominadas(mapa).length;
  const cab = faccaoJogador ? `Facção do jogador: ${faccaoJogador} (domina ${dominadas} cidade(s)).` : "";
  return `${cab}\n${linhas.join("\n")}`;
}


/* ---------------- ESTRADAS E DIVISAS (mapa mais realista) ----------------
   Estradas ligam cada cidade às mais próximas; divisas agrupam cidades
   da mesma região. Tudo derivado das posições determinísticas. */
export function gerarEstradas(cidades) {
  const rotas = [];
  const cs = cidades || [];
  for (let i = 0; i < cs.length; i++) {
    // liga cada cidade às 2 mais próximas (cria uma malha de caminhos)
    const dists = cs.map((o, j) => ({ j, d: Math.hypot(cs[i].x - o.x, cs[i].y - o.y) })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    for (const { j } of dists.slice(0, 2)) {
      const a = Math.min(i, j), b = Math.max(i, j);
      if (!rotas.some((r) => r.a === a && r.b === b)) rotas.push({ a, b, mesmaRegiao: cs[i].regiao && cs[i].regiao === cs[j].regiao });
    }
  }
  return rotas;
}

/* Centro aproximado de cada região (para desenhar o nome/divisa) */
export function centrosDeRegiao(cidades) {
  const grupos = {};
  (cidades || []).forEach((c) => { if (!c.regiao) return; (grupos[c.regiao] = grupos[c.regiao] || []).push(c); });
  return Object.entries(grupos).map(([regiao, cs]) => ({
    regiao,
    x: cs.reduce((s, c) => s + c.x, 0) / cs.length,
    y: cs.reduce((s, c) => s + c.y, 0) / cs.length,
    n: cs.length,
    cor: cs.find((c) => c.relacao === "jogador") ? "#C9973F" : cs.find((c) => c.relacao === "inimiga") ? "#C0504D" : cs.find((c) => c.relacao === "aliada") ? "#6BbF59" : "#9A93A6",
  }));
}

/* ---------------- PERGAMINHO: geometria orgânica ----------------
   Gera formas de "terra" (continente e territórios) como blobs suaves
   ao redor das cidades — determinístico pela semente, como os retratos. */
function rngDe(nome) {
  let h = 2166136261;
  for (let i = 0; i < nome.length; i++) { h ^= nome.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}

export function blobPath(pontos, raio, semente = "blob") {
  const ps = (pontos || []).filter((p) => p && isFinite(p.x) && isFinite(p.y));
  if (!ps.length) return "";
  const rnd = rngDe(semente);
  const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length;
  const cy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
  const N = 20, anel = [];
  for (let k = 0; k < N; k++) {
    const ang = (k / N) * Math.PI * 2;
    let r = 0;
    for (const p of ps) {
      const proj = (p.x - cx) * Math.cos(ang) + (p.y - cy) * Math.sin(ang);
      const perp = Math.abs(-(p.x - cx) * Math.sin(ang) + (p.y - cy) * Math.cos(ang));
      const eff = proj + Math.max(0, raio - perp * 0.45);
      if (eff > r) r = eff;
    }
    r = Math.max(r, raio * 0.75) + (rnd() - 0.5) * raio * 0.8;
    anel.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
  }
  let d = "";
  for (let i = 0; i < N; i++) {
    const p0 = anel[(i - 1 + N) % N], p1 = anel[i], p2 = anel[(i + 1) % N], p3 = anel[(i + 2) % N];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    if (i === 0) d = `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} `;
    d += `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }
  return d + "Z";
}
