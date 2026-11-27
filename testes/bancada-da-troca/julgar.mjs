/* O JUIZ DA BANCADA — puro, sem navegador: classifica o que o sistema respondeu
   e compara com o que um mestre de mesa real daria. Nada aqui lê prosa. */

export const norm = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/* «tocha» casa com «Tochas», «ração» com «Rações de viagem», «símbolo» com «Símbolo sagrado riscado» */
export function casa(a, b) {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x.includes(y) || y.includes(x)) return true;
  let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++;
  return i >= 3 && i >= Math.min(x.length, y.length) - 2;
}

const IGNORA = /^(📖|📍|✧|▸|✓|◐|🗺|🎲|⚔|🔊|↯|🔎|★|✦|☆)/;
const DINHEIRO = /◉\s*[−\-–+]\s*\d/;
/* 23/11 (defeito do juiz, não do jogo): «🤝 X fica emprestado com Y», «🤝 Você troca X por Y» e «🤝 Lavinia lhe
   passa X» são trocas aplicadas (a ficha muda) — o juiz as lia como negativa pelo 🤝 e contava duas respostas (B71, Q08) */
const APLICA = /agora é de|passa a você|\bVendido\b|\bComprad[oa]\b|\bVocê (devolve|recolhe|entrega|compra|vende|troca|deixa)\b|fica emprestad[oa] com|\blhe passa\b|^🤲|^🤝\s*\d+ .* para /i;
const PERGUNTA = /^✋|Qual delas|Diga o que você dá ou pede|^A quem você|^O que você faz com|\?\s*1\.\s/;
const DADO = /^🎯|Precisa de \d+/;

/* QUANTAS AÇÕES A FRASE DIZ (23/11, defeito do juiz, não do jogo): «dou uma moeda pra Prudence e compro uma
   ração do Cornelius» são duas ações, e um mestre real responde às duas — a linha da moeda e o cartão da ração.
   O juiz contava isso como «mais de uma resposta» (N08). Conta-se aqui, sem o código do jogo: o trecho depois de
   «e», «depois» ou «então» que abre com um verbo de troca na primeira pessoa é outra ação. A frase de uma ação
   só continua a valer 1, e lá a regra de uma resposta não afrouxa. */
const VERBO_DE_TROCA = "(dou|compro|pago|vendo|levo|troco|empresto|devolvo|pego|entrego|passo|ofereco|suborno|cobro|peco|quero levar|quero comprar)";
export function acoesDaFrase(frase) {
  const partes = norm(frase).replace(/[.!?]+$/, "").split(/\s*,?\s+(?:e|depois|entao)\s+/);
  const primeira = new RegExp("\\b" + VERBO_DE_TROCA + "\\b").test(partes[0] || "") ? 1 : 0;
  const outras = partes.slice(1).filter((p) => new RegExp("^(eu |tambem |depois |entao )*(me |te |lhe )?" + VERBO_DE_TROCA + "\\b").test(p)).length;
  return Math.max(1, primeira + outras);
}

/* o que é UMA linha de sistema, para esta bancada */
export function tipoDaLinha(linha, ouvido) {
  const l = String(linha || "").trim();
  if (!l) return "ignora";
  if (/^🧭/.test(l)) return ouvido && ouvido.familia === "trocar" ? "nega" : "ignora";
  if (IGNORA.test(l) || /^\+\d+ XP/.test(l)) return "ignora";
  if (DADO.test(l)) return "dado";
  if (PERGUNTA.test(l)) return "pergunta";
  if (DINHEIRO.test(l) || APLICA.test(l)) return "aplica";
  if (/^(🛒|🤝|⛔|◉|✋)/.test(l) || /\bnão\b|ninguém/i.test(l)) return "nega";
  return "outra";
}

const ehViagem = (c) => /^(Ir até|Partir|Seguir|Voltar)/i.test(c.verbo || "");

/* classifica o que apareceu depois de UMA digitação (ou de um clique) */
export function classificar({ linhas = [], cartoes = [], pergunta = null, ouvido = null, fichaAntes = null, fichaDepois = null }) {
  const respostas = [];
  for (const c of cartoes) {
    if (c.momento === "proposta" && c.cede) respostas.push({ k: ehViagem(c) ? "viagem" : "cartao", texto: c.verbo });
    else if (c.momento === "rolagem" || c.momento === "chamado") respostas.push({ k: "dado", texto: c.texto });
    else if (c.momento === "escolha" || c.momento === "crime") respostas.push({ k: "cartao", texto: c.texto });
  }
  if (pergunta) respostas.push({ k: "pergunta", texto: pergunta });
  for (const l of linhas) { const k = tipoDaLinha(l, ouvido); if (k !== "ignora" && k !== "outra") respostas.push({ k, texto: l }); }
  const mudou = fichaAntes && fichaDepois && JSON.stringify(deltaDaFicha(fichaAntes, fichaDepois)) !== "{}";
  if (mudou && !respostas.some((r) => r.k === "aplica" || r.k === "cartao")) respostas.push({ k: "aplica", texto: "(só a ficha mudou, sem linha)" });
  const tem = (k) => respostas.some((r) => r.k === k);
  const tipo = tem("cartao") ? "cartao" : tem("dado") ? "dado" : tem("pergunta") ? "pergunta" : tem("aplica") ? "aplica" : tem("nega") ? "nega" : tem("viagem") ? "viagem" : "nada";
  const nResp = respostas.filter((r) => r.k !== "viagem").length;
  return { tipo, respostas, nResp, nAplica: respostas.filter((r) => r.k === "aplica").length };
}

/* ---------- a ficha: delta entre duas fotos ---------- */
const porNome = (lista) => {
  const m = {};
  for (const it of lista || []) { const mm = String(it).match(/^(.*?)(?: x(\d+))?$/); const n = mm[1]; m[n] = (m[n] || 0) + (mm[2] ? Number(mm[2]) : 1); }
  return m;
};
function deltaBolsa(a, b) {
  const A = porNome(a), B = porNome(b), mais = [], menos = [];
  for (const n of new Set([...Object.keys(A), ...Object.keys(B)])) { const d = (B[n] || 0) - (A[n] || 0); for (let i = 0; i < Math.abs(d); i++) (d > 0 ? mais : menos).push(n); }
  return { mais, menos };
}
export function deltaDaFicha(a, b) {
  const d = {};
  if (a.moedas !== b.moedas) d.moedas = (b.moedas || 0) - (a.moedas || 0);
  const inv = deltaBolsa(a.inv, b.inv);
  if (inv.mais.length || inv.menos.length) d.inv = inv;
  const eq = deltaBolsa(a.eq, b.eq);
  if (eq.mais.length || eq.menos.length) d.eq = eq;
  const sup = {};
  for (const k of ["rac", "agua", "toc"]) if (a[k] !== b[k]) sup[k] = (b[k] || 0) - (a[k] || 0);
  if (Object.keys(sup).length) d.sup = sup;
  const grupo = {};
  for (const c of b.grupo || []) {
    const antes = (a.grupo || []).find((x) => x.nome === c.nome) || { inv: [], moedas: undefined };
    const di = deltaBolsa(antes.inv, c.inv);
    const g = {};
    if (di.mais.length || di.menos.length) g.inv = di;
    if (antes.moedas !== c.moedas) g.moedas = (c.moedas || 0) - (antes.moedas || 0);
    if (Object.keys(g).length) grupo[c.nome] = g;
  }
  if (Object.keys(grupo).length) d.grupo = grupo;
  return d;
}
export function textoDoDelta(d) {
  const t = [];
  if (d.moedas !== undefined) t.push("◉ " + (d.moedas > 0 ? "+" : "") + d.moedas);
  if (d.inv) t.push("bolsa " + [...d.inv.mais.map((x) => "+" + x), ...d.inv.menos.map((x) => "−" + x)].join(", "));
  if (d.eq) t.push("equipado " + [...d.eq.mais.map((x) => "+" + x), ...d.eq.menos.map((x) => "−" + x)].join(", "));
  if (d.sup) t.push("suprimentos " + Object.entries(d.sup).map(([k, v]) => k + (v > 0 ? "+" : "") + v).join(" "));
  if (d.grupo) for (const [n, g] of Object.entries(d.grupo)) t.push(n.split(" ")[0] + ": " + [g.inv ? [...g.inv.mais.map((x) => "+" + x), ...g.inv.menos.map((x) => "−" + x)].join(", ") : "", g.moedas !== undefined ? "◉" + g.moedas : ""].filter(Boolean).join(" "));
  return t.length ? t.join("; ") : "igual";
}

/* o delta observado contra a especificação esperada → lista de divergências */
function divergenciasDaFicha(spec, obs) {
  const dv = [];
  const s = spec || {};
  const m = s.moedas === undefined ? 0 : s.moedas;
  const om = obs.moedas || 0;
  if (m === "+") { if (!(om > 0)) dv.push(`esperava ganhar moedas, veio ◉ ${om}`); }
  else if (m === "-") { if (!(om < 0)) dv.push(`esperava perder moedas, veio ◉ ${om}`); }
  else if (m !== "?") { if (om !== m) dv.push(`esperava ◉ ${m}, veio ◉ ${om}`); }
  const igualLista = (esp, got, rotulo) => {
    const e = [...(esp || [])], g = [...(got || [])];
    for (const x of e) { const i = g.findIndex((y) => casa(x, y)); if (i < 0) dv.push(`${rotulo}: faltou «${x}»`); else g.splice(i, 1); }
    for (const y of g) dv.push(`${rotulo}: sobrou «${y}»`);
  };
  igualLista((s.inv || {})["+"], (obs.inv || { mais: [] }).mais, "bolsa entra");
  igualLista((s.inv || {})["-"], (obs.inv || { menos: [] }).menos, "bolsa sai");
  if (obs.eq) dv.push("o equipado mudou: " + textoDoDelta({ eq: obs.eq }));
  for (const k of ["rac", "agua", "toc"]) { const e = (s.sup || {})[k] || 0, o = (obs.sup || {})[k] || 0; if (e !== o) dv.push(`suprimento ${k}: esperava ${e >= 0 ? "+" : ""}${e}, veio ${o >= 0 ? "+" : ""}${o}`); }
  const nomes = new Set([...Object.keys(s.grupo || {}), ...Object.keys(obs.grupo || {})]);
  for (const n of nomes) {
    const e = (s.grupo || {})[n] || {}, o = (obs.grupo || {})[n] || {};
    igualLista(e["+"], (o.inv || { mais: [] }).mais, n.split(" ")[0] + " recebe");
    igualLista(e["-"], (o.inv || { menos: [] }).menos, n.split(" ")[0] + " perde");
    if (o.moedas) dv.push(`a bolsa de ${n.split(" ")[0]} mudou ◉ ${o.moedas}`);
  }
  return dv;
}

/* o que as linhas e o cartão DIZEM que mudou, contra o que a ficha mostra */
function linhaContraFicha(textos, antes, depois, acoes = 1) {
  const dv = [];
  let delta = null; const finais = [];
  for (const l of textos) {
    const sinais = [...String(l).matchAll(/◉\s*([−\-–+])\s*(\d+)/g)];
    for (const x of sinais) delta = (delta || 0) + (/[−\-–]/.test(x[1]) ? -1 : 1) * Number(x[2]);
    if (!sinais.length) { const v = String(l).match(/\bVendido\b.*?por ◉\s*(\d+)/i); if (v) delta = (delta || 0) + Number(v[1]); }
    for (const x of String(l).matchAll(/(?:bolsa|a bolsa fica com)\s*:?\s*◉\s*(\d+)/gi)) finais.push(Number(x[1]));
    const d = String(l).match(/^🤝\s*(.+?) agora é de (.+?)\.?$/);
    if (d) {
      const item = d[1].replace(/\s*\(.*\)\s*$/, ""), quem = d[2];
      if ((depois.inv || []).some((y) => casa(item, y)) && !(antes.inv || []).every((y) => casa(item, y) === false) && !((depois.grupo || []).some((g) => casa(quem, g.nome)))) dv.push(`a linha diz «${item}» é de ${quem}, e o item continua na bolsa`);
      const g = (depois.grupo || []).find((x) => casa(quem, x.nome));
      if (g && !(g.inv || []).some((y) => casa(item, y))) dv.push(`a linha diz «${item}» é de ${quem}, e ${quem.split(" ")[0]} não o tem`);
    }
  }
  const obs = (depois.moedas || 0) - (antes.moedas || 0);
  if (delta !== null && delta !== obs) dv.push(`as linhas somam ◉ ${delta}, a ficha mudou ◉ ${obs}`);
  /* com duas ações, a bolsa que a primeira linha disse era a de então: só a última tem de ser a de agora */
  for (const f of acoes > 1 ? finais.slice(-1) : finais) if (f !== depois.moedas) dv.push(`a linha diz «bolsa ◉ ${f}», a ficha tem ◉ ${depois.moedas}`);
  return dv;
}

/* a leitura do ouvido contra o que ele tinha de ler */
function divergenciasDoOuvido(spec, o) {
  if (!spec || !Object.keys(spec).length) return [];
  if (!o) return ["sem linha do ouvido (a frase não passou por ele)"];
  const dv = [];
  if (spec.familia && o.familia !== spec.familia) dv.push(`família: esperava ${spec.familia}, leu ${o.familia}`);
  if (spec.familiaNao && o.familia === spec.familiaNao) dv.push(`leu como ${spec.familiaNao} o que não era troca`);
  if (spec.subtipo && o.subtipo !== spec.subtipo) dv.push(`subtipo: esperava ${spec.subtipo}, leu ${o.subtipo || "nenhum"}`);
  if (spec.quem && !casa(spec.quem, o.quem)) dv.push(`quem: esperava ${spec.quem}, leu ${o.quem || "ninguém"}`);
  if (spec.coisa && !casa(spec.coisa, o.coisa)) dv.push(`coisa: esperava ${spec.coisa}, leu ${o.coisa || "nenhuma"}`);
  if (spec.quantia !== undefined && o.quantia !== spec.quantia) dv.push(`quantia: esperava ${spec.quantia}, leu ${o.quantia == null ? "nenhuma" : o.quantia}`);
  for (const p of spec.coisaNao || []) if (o.coisa && norm(o.coisa).split(/[^a-z]+/).includes(norm(p))) dv.push(`tomou «${p}» por coisa`);
  return dv;
}

/* o julgamento de uma frase */
export function comparar(f, r) {
  const lista = Array.isArray(f.tipo) ? f.tipo : [f.tipo];
  const tipoOk = lista.includes(r.tipo);
  const obs = deltaDaFicha(r.fichaAntes, r.fichaDepois);
  const spec = f.ficha === null ? null : f.fichaPorTipo && f.fichaPorTipo[r.tipo] !== undefined ? f.fichaPorTipo[r.tipo] : f.ficha;
  const dvFicha = spec === null ? [] : divergenciasDaFicha(spec, obs);
  const fichaOk = dvFicha.length === 0;
  const textos = [...r.linhas1, ...(r.linhas2 || [])];
  const claims = [...textos];
  if (r.cartaoAberto && r.confirmou && /^clicou/.test(r.confirmou)) claims.push(r.cartaoAberto.texto.replace(/^.*?(a bolsa fica com ◉\s*\d+).*$/i, "$1"));
  const acoes = acoesDaFrase(f.frase);
  const linhaVsFicha = linhaContraFicha(claims.filter((x) => /◉|agora é de|Vendido/.test(x)), r.fichaAntes, r.fichaDepois, acoes);
  /* uma resposta por ação: a frase de uma ação só continua com uma (e o cartão que já aplicou antes do clique é dupla) */
  const multiplas = r.fase1.nResp > acoes || r.fase2.nAplica > 1 || (acoes < 2 && r.fase1.respostas.some((x) => x.k === "aplica") && r.fase2.nAplica > 0 && r.tipo === "cartao");
  const ouvido = divergenciasDoOuvido(f.ouvido, r.ouvido);
  const semResposta = !lista.includes("nada") && r.tipo === "nada";
  const textoDaResposta = norm([...r.fase1.respostas, ...(r.fase2.respostas || [])].map((x) => x.texto).join(" | "));
  const motivoErrado = !!(f.diz && (r.tipo === "nega" || r.tipo === "pergunta") && lista.includes(r.tipo) && !f.diz.every((s) => textoDaResposta.includes(norm(s))));
  const duploDebito = r.fase1.nAplica + r.fase2.nAplica >= 2 && (obs.moedas || 0) < (typeof (spec || {}).moedas === "number" ? spec.moedas : 0);
  const motivos = [];
  if (!tipoOk) motivos.push(`tipo: esperava ${lista.join(" ou ")}, o sistema deu ${r.tipo}`);
  for (const d of dvFicha) motivos.push("ficha: " + d);
  for (const d of linhaVsFicha) motivos.push("linha×ficha: " + d);
  for (const d of ouvido) motivos.push("ouvido: " + d);
  if (motivoErrado) motivos.push(`motivo: esperava dizer ${JSON.stringify(f.diz)}`);
  /* 25/11 (a reação da vítima): `linhas` — o que tem de aparecer numa linha de sistema do turno medido (a reação
     não muda a ficha nem tem a forma de troca: sem isto, a bancada não a via). Só o lote que o declara o usa. */
  const faltamLinhas = (Array.isArray(f.linhas) ? f.linhas : []).filter((s) => !textos.some((x) => norm(x).includes(norm(s))));
  for (const s of faltamLinhas) motivos.push(`linha: esperava uma linha com «${s}»`);
  return {
    ok: tipoOk && fichaOk && !faltamLinhas.length, tipoOk, fichaOk, multiplas, linhaVsFicha: linhaVsFicha.length > 0, semResposta, ouvido, motivoErrado, duploDebito,
    deltaTexto: textoDoDelta(obs), motivos,
  };
}
