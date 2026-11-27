/* A BANCADA DA TROCA — a régua do meio.
   A suíte mede a peça; a sessão jogada mede o jogo inteiro e custa IA paga e
   duas horas. Esta mede o jogo inteiro, no navegador, SEM IA paga, em minutos:
   digita cada frase no jogo de verdade (com a chave do Mestre vivo) e confere o
   que o SISTEMA fez — as linhas de sistema, os cartões, a ficha, a linha
   «[o ouvido]» do console —, nunca a prosa (a narração é fixa e neutra).

   Uso:
     node testes/bancada-da-troca/bancada.mjs                  todas as frases
     node testes/bancada-da-troca/bancada.mjs --estado balanca  um grupo (estado de partida)
     node testes/bancada-da-troca/bancada.mjs --so B30          uma frase (ou várias: --so B30,B31)
     node testes/bancada-da-troca/bancada.mjs --lista           só lista as frases
     node testes/bancada-da-troca/bancada.mjs --frases arquivo.json  outro arquivo de frases (mesmo formato)
     opções: --json arquivo (grava o resultado frase a frase) · --quieto (sem a linha de progresso)

   É MEDIDA, não portão: sai sempre com código 0. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { subir } from "./infra.mjs";
import { abrirPagina } from "./cdp.mjs";
import * as M from "./motorista.mjs";
import { classificar, comparar } from "./julgar.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opcao = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const tem = (n) => args.includes(n);

const { frases: TODAS } = JSON.parse(fs.readFileSync(opcao("--frases") ? path.resolve(opcao("--frases")) : path.join(AQUI, "frases.json"), "utf8"));
const estadoDe = (() => { const c = {}; return (n) => (c[n] = c[n] || JSON.parse(fs.readFileSync(path.join(AQUI, "estados", n + ".json"), "utf8"))); })();

let escolhidas = TODAS;
if (opcao("--so")) { const ids = opcao("--so").split(","); escolhidas = TODAS.filter((f) => ids.includes(f.id)); }
if (opcao("--estado")) escolhidas = escolhidas.filter((f) => f.estado === opcao("--estado"));
if (tem("--lista")) { for (const f of escolhidas) console.log(f.id.padEnd(5), f.estado.padEnd(14), JSON.stringify(f.tipo), "«" + f.frase + "»"); process.exit(0); }
if (!escolhidas.length) { console.log("nenhuma frase escolhida"); process.exit(0); }

const t0 = Date.now();
const infra = await subir({ log: (m) => console.error("[infra] " + m) });
const resultados = [];
let provaDaIA = null;
try {
  /* PROVA 1: o /api do dev-server cai no Narrador de mentira, e não em Vercel nenhuma */
  const sonda = await fetch(`http://127.0.0.1:${infra.portaVite}/api/narrador`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ system: "sonda", messages: [], formato: "texto", tarefa: "sonda" }) });
  const sondaJson = await sonda.json().catch(() => ({}));
  const sondaNoMock = infra.narrador.chamadas.length === 1 && sondaJson.provedor === "bancada";
  infra.narrador.chamadas.length = 0;

  const pag = await abrirPagina(infra.portaCdp);
  await pag.scriptNoCarregar(M.FONTE_DA_SEMENTE);

  for (const f of escolhidas) {
    let r = null;
    for (let tentativa = 1; tentativa <= 2 && !r; tentativa++) {
      try { r = await medir(pag, infra, f); } catch (e) { r = tentativa === 2 ? { id: f.id, erro: String(e.message || e) } : null; await M.dorme(1500); }
    }
    r.f = f;
    r.julgamento = r.erro ? { ok: false, erro: r.erro } : comparar(f, r);
    resultados.push(r);
    if (!tem("--quieto")) console.error(`${r.julgamento.ok ? "ok " : "XX "} ${f.id.padEnd(5)} ${((r.msRestaurar||0)/1000).toFixed(1)}+${((r.ms||0)/1000).toFixed(1)}s ${(r.tipo || "?").padEnd(8)} «${f.frase.slice(0, 60)}»`);
  }

  /* PROVA 2: tudo o que a página pediu a /api foi parar no Narrador de mentira */
  const apiDaPagina = pag.rede.filter((x) => /\/api\//.test(x.url));
  const hosts = {};
  for (const x of pag.rede) { try { const h = new URL(x.url).host; hosts[h] = (hosts[h] || 0) + 1; } catch { /* data: etc. */ } }
  const externos = Object.keys(hosts).filter((h) => h && !/^(127\.0\.0\.1|localhost)(:|$)/.test(h));
  const logVite = infra.logVite();
  provaDaIA = {
    destinoDoProxy: infra.alvoApi, sondaNoMock,
    apiPedidasPelaPagina: apiDaPagina.length, recebidasPeloMock: infra.narrador.chamadas.length,
    apiParaForaDeLocalhost: apiDaPagina.filter((x) => { try { return !/^(127\.0\.0\.1|localhost)(:|$)/.test(new URL(x.url).host); } catch { return true; } }).length,
    hostsContatadosPelaPagina: externos.map((h) => h + " ×" + hosts[h]),
    viteCitouVercel: /vercel\.app/i.test(logVite),
  };
  pag.fechar();
} finally { await infra.parar(); }

relatorio(resultados, provaDaIA, Date.now() - t0);
if (opcao("--json")) fs.writeFileSync(opcao("--json"), JSON.stringify(resultados.map(({ f, ...r }) => ({ id: f.id, ...r })), null, 1));
process.exit(0);

/* ---------------------------------------------------------------- */
/* as linhas «[o ouvido] {…}» que o console do jogo escreveu desde o último zero */
function ouvidosDoConsole(pag) {
  return pag.consoleLog.filter((c) => /^\[o ouvido\]/.test(c.texto)).map((c) => { try { return JSON.parse(c.texto.replace(/^\[o ouvido\]\s*/, "")); } catch { return null; } }).filter(Boolean);
}

/* uma frase: restaura, digita, colhe, (confirma o cartão), colhe de novo */
async function medir(pag, infra, f) {
  const tR = Date.now();
  await M.restaurar(pag, infra.portaVite, estadoDe(f.estado));
  const msRestaurar = Date.now() - tR;
  /* «[rolar]» no antes rola o dado que o cartão pede (24/11: o furto que prepara a medida) */
  for (const a of f.antes || []) { if (a === "[rolar]") { await M.rolar(pag); await M.esperarFim(pag); continue; } await M.digitar(pag, a); await M.esperarFim(pag); }
  const cartoesAntes = (await M.cartao(pag)) || [];
  const fichaAntes = await M.ficha(pag);
  const n0 = (await M.mensagens(pag)).length;
  pag.consoleLog.length = 0;
  const tIni = Date.now();
  /* 25/11 (a reação da vítima): «[rolar]» como frase medida mede o que o dado faz (o furto e a reação de quem viu) */
  if (f.frase === "[rolar]") await M.rolar(pag); else await M.digitar(pag, f.frase);
  const saida = await M.esperarFim(pag);
  const msgs1 = (await M.mensagens(pag)).slice(n0);
  const cartoes = ((await M.cartao(pag)) || []).filter((c) => !cartoesAntes.some((a) => a.texto === c.texto));
  const perg = await M.pergunta(pag);
  const ouvidos = ouvidosDoConsole(pag);
  const fichaMeio = await M.ficha(pag);
  const r = { saida, ouvido: ouvidos.find((o) => o.frase === f.frase) || ouvidos[0] || null, ouvidosN: ouvidos.length, fichaAntes, cartoes, pergunta: perg, linhas1: msgs1.filter((m) => m.autor === "sistema").map((m) => m.texto), fichaMeio };
  const c1 = classificar({ linhas: r.linhas1, cartoes, pergunta: perg, ouvido: r.ouvido, fichaAntes, fichaDepois: fichaMeio });
  r.fase1 = c1;
  r.tipo = c1.tipo;
  /* o cartão da troca: abre (como o jogador), lê o veredito, e confirma se o esperado é confirmar */
  const doCartao = cartoes.find((c) => c.momento === "proposta" && c.cede);
  r.cartaoAberto = null; r.confirmou = null; r.linhas2 = [];
  if (doCartao && c1.tipo === "cartao") {
    r.cartaoAberto = await M.abrirProposta(pag);
    const esperados = Array.isArray(f.tipo) ? f.tipo : [f.tipo];
    const deveConfirmar = esperados[0] === "cartao" || !!(f.fichaPorTipo && f.fichaPorTipo.cartao);
    if (deveConfirmar) {
      const n1 = (await M.mensagens(pag)).length;
      r.confirmou = await M.confirmarProposta(pag);
      await M.esperarFim(pag);
      r.linhas2 = (await M.mensagens(pag)).slice(n1).filter((m) => m.autor === "sistema").map((m) => m.texto);
    }
  }
  /* com cartão, o turno só corre ao confirmar: a linha do ouvido nasce depois do clique */
  if (!r.ouvido) { const oo = ouvidosDoConsole(pag); r.ouvido = oo.find((o) => o.frase === f.frase) || oo[0] || null; r.ouvidoDepoisDoCartao = !!r.ouvido; }
  r.fichaDepois = await M.ficha(pag);
  r.ms = Date.now() - tIni; r.msRestaurar = msRestaurar;
  r.fase2 = classificar({ linhas: r.linhas2, cartoes: [], pergunta: null, ouvido: r.ouvido, fichaAntes: fichaMeio, fichaDepois: r.fichaDepois });
  return r;
}

/* ---------------------------------------------------------------- */
function relatorio(rs, prova, ms) {
  const n = rs.length;
  const ok = rs.filter((r) => r.julgamento.ok);
  const tipoOk = rs.filter((r) => r.julgamento.tipoOk).length;
  const fichaOk = rs.filter((r) => r.julgamento.fichaOk).length;
  const multi = rs.filter((r) => r.julgamento.multiplas);
  const linhaFicha = rs.filter((r) => r.julgamento.linhaVsFicha);
  const semResp = rs.filter((r) => r.julgamento.semResposta);
  const ouvidoErr = rs.filter((r) => r.julgamento.ouvido && r.julgamento.ouvido.length);
  const semOuvido = rs.filter((r) => !r.erro && !r.ouvido);
  const motivo = rs.filter((r) => r.julgamento.motivoErrado);
  console.log("\n==================== A BANCADA DA TROCA ====================");
  console.log(`NOTA: ${ok.length} de ${n} frases com o tipo da resposta E a ficha batendo com o esperado (${Math.round((100 * ok.length) / n)}%).`);
  console.log(`  só o tipo: ${tipoOk} de ${n}  ·  só a ficha: ${fichaOk} de ${n}`);
  console.log("Contadas à parte (uma frase pode estar em várias):");
  console.log(`  mais de uma resposta do sistema ....... ${multi.length}  ${lista(multi)}`);
  console.log(`  a linha diz uma coisa e a ficha outra .. ${linhaFicha.length}  ${lista(linhaFicha)}`);
  console.log(`  sem resposta nenhuma onde se esperava .. ${semResp.length}  ${lista(semResp)}`);
  console.log(`  leitura errada do ouvido ............... ${ouvidoErr.length}  ${lista(ouvidoErr)}` + (semOuvido.length ? `  (+ ${semOuvido.length} sem linha do ouvido: ${lista(semOuvido)})` : ""));
  console.log(`  motivo diferente do esperado (não derruba a nota) ${motivo.length}  ${lista(motivo)}`);
  const porEstado = {};
  for (const r of rs) { const e = (porEstado[r.f.estado] = porEstado[r.f.estado] || { ok: 0, n: 0 }); e.n++; if (r.julgamento.ok) e.ok++; }
  console.log("Por estado de partida: " + Object.entries(porEstado).map(([e, v]) => `${e} ${v.ok}/${v.n}`).join(" · "));
  const porTipo = {};
  for (const r of rs) { const sub = (r.f.ouvido && r.f.ouvido.subtipo) || "(sem troca)"; const e = (porTipo[sub] = porTipo[sub] || { ok: 0, n: 0 }); e.n++; if (r.julgamento.ok) e.ok++; }
  console.log("Por tipo de troca: " + Object.entries(porTipo).map(([e, v]) => `${e} ${v.ok}/${v.n}`).join(" · "));

  console.log("\nDEFEITOS CONHECIDOS (sessões 16 e 17), reproduzidos na versão de hoje?");
  for (const [tag, nome, regra] of [
    ["debito-duplo", "pagamento com quantia dita debita o dobro e mostra duas linhas", (r) => r.julgamento.duploDebito],
    ["ofensa", "ofensa, desculpa e «deixa pra lá» lidos como troca", (r) => r.ouvido && r.ouvido.familia === "trocar" || r.tipo !== "nada"],
    ["coisa-pronome", "«dessa»/«desse»/«pedaço» tomados por coisa", (r) => r.ouvido && /\b(dess[ao]s?|dest[ae]s?|pedaco|pedaço)\b/i.test(String(r.ouvido.coisa || ""))],
    ["suborno-mudo", "suborno com quantia sem resposta nenhuma", (r) => r.tipo === "nada"],
  ]) {
    const deste = rs.filter((r) => r.f.defeito === tag && !r.erro);
    const pegou = deste.filter(regra);
    console.log(`  ${pegou.length ? "REPRODUZIU" : "não reproduziu"}  ${nome}: ${pegou.length} de ${deste.length} frases marcadas  ${pegou.map((r) => r.f.id).join(" ")}`);
  }

  const falhas = rs.filter((r) => !r.julgamento.ok);
  console.log(`\nAS ${falhas.length} FRASES QUE FALHARAM (esperado → veio):`);
  for (const r of falhas) {
    const f = r.f;
    console.log(`\n[${f.id}] (${f.estado}) «${f.frase}»${f.antes ? "  [depois de: «" + f.antes.join("», «") + "»]" : ""}`);
    if (r.erro) { console.log("  ERRO da bancada: " + r.erro); continue; }
    console.log(`  esperava: ${JSON.stringify(f.tipo)} ${resumoEsperado(f)}`);
    console.log(`  veio:     ${r.tipo}${r.julgamento.multiplas ? " (MAIS DE UMA resposta)" : ""} · ficha ${r.julgamento.deltaTexto}`);
    for (const l of [...r.linhas1, ...(r.linhas2 || []).map((x) => "(depois de confirmar) " + x)].filter((l) => !/^(📖|📍)/.test(l))) console.log("    linha: " + l.replace(/\s+/g, " ").slice(0, 200));
    for (const c of r.cartoes.filter((c) => c.momento !== "outras-ofertas")) console.log("    cartão: [" + c.momento + "] " + (c.verbo || c.texto).slice(0, 80) + (c.preco ? " · " + c.preco : ""));
    if (r.cartaoAberto) console.log("    veredito do cartão: " + r.cartaoAberto.texto.slice(0, 200));
    if (r.pergunta) console.log("    pergunta: " + r.pergunta.slice(0, 200));
    if (r.ouvido) console.log(`    ouvido: ${r.ouvido.familia}/${r.ouvido.subtipo || "-"} quem=${r.ouvido.quem || "-"} coisa=${r.ouvido.coisa || "-"} quantia=${r.ouvido.quantia == null ? "-" : r.ouvido.quantia} veredito=${r.ouvido.veredito || "-"}/${r.ouvido.motivo || "-"}`);
    else console.log("    ouvido: (sem linha)");
    for (const m of r.julgamento.motivos) console.log("    ✗ " + m);
  }

  console.log("\n--- PROVA DE QUE NENHUMA CHAMADA DE IA SAIU ---");
  if (prova) {
    console.log(`  destino do /api no Vite (TAVERNA_API): ${prova.destinoDoProxy}  (Narrador de mentira, local)`);
    console.log(`  sonda no /api do dev-server caiu no Narrador de mentira: ${prova.sondaNoMock ? "sim" : "NÃO"}`);
    console.log(`  /api pedidas pela página: ${prova.apiPedidasPelaPagina}  ·  recebidas pelo Narrador de mentira: ${prova.recebidasPeloMock}  ·  /api para fora de localhost: ${prova.apiParaForaDeLocalhost}`);
    console.log(`  o log do Vite cita vercel.app: ${prova.viteCitouVercel ? "SIM" : "não"}  ·  outros hosts que a página contatou (só ativos estáticos): ${prova.hostsContatadosPelaPagina.join(", ") || "nenhum"}`);
  }
  console.log(`\nTempo: ${(ms / 1000).toFixed(0)} s para ${n} frases (${(ms / 1000 / n).toFixed(1)} s por frase).`);
}
function lista(rs) { return rs.length ? "[" + rs.map((r) => r.f.id).join(" ") + "]" : ""; }
function resumoEsperado(f) {
  if (f.ficha === null) return "· ficha: não confere";
  const p = f.ficha || {}; const t = [];
  if (p.moedas !== undefined) t.push("◉ " + p.moedas);
  if (p.inv) t.push("bolsa " + JSON.stringify(p.inv));
  if (p.sup) t.push("suprimentos " + JSON.stringify(p.sup));
  if (p.grupo) t.push("companheiro " + JSON.stringify(p.grupo));
  return "· ficha: " + (t.join("; ") || "igual") + (f.fichaPorTipo ? " (por tipo: " + JSON.stringify(f.fichaPorTipo) + ")" : "");
}
