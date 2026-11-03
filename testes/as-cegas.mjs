/* as-cegas.mjs (o Narrador ator, preparado na etapa 2 · 03/11/2026) — o teste às cegas da etapa 4

   NÃO É SUÍTE (não começa por `teste-`, e o `npm test` não o corre): é a
   ferramenta da etapa 4 do plano (mente/plano-narrador-ator.md), cujo gasto
   a pessoa aprovou a 03/11 (~US$ 1–2). Sobre N turnos gravados (as frases
   das sessões em testes/sessao-*.json), monta OS DOIS PEDIDOS — o do Mestre
   de hoje e o do ator — pelo caminho do servidor (`oPedidoNoServidor`, com e
   sem `modoDoNarrador: "ator"`), e, só com `--gastar`, pede AS RESPOSTAS ao
   provedor de verdade (api/_provedor.js, `chamarOProvedor`, o mesmo do
   /api/narrador), com as chaves do ambiente.

   SEM `--gastar` não sai um pedido à rede: monta, mede e grava os pedidos.

   USO
     node testes/as-cegas.mjs [--n=20] [--saida=<pasta>] [--gastar]
                              [--modelos-ator=gemini-3.8-flash,gemini-3.5-flash-lite]
     - `--n`: quantos turnos, espalhados por igual pelas 147 frases (a
       escolha é determinista: a mesma N dá os mesmos turnos);
     - `--modelos-ator`: um ator por modelo (o NARRADOR_BASE da vez); o
       Mestre corre sempre com o modelo do ambiente (o de hoje);
     - `--saida`: a pasta onde fica tudo (por omissão, ./as-cegas-<data>).
     As chaves: as do /api/narrador (GEMINI_API_KEY, DEEPSEEK_API_KEY…).

   O QUE GRAVA
     pedidos.json   os pedidos (mestre e ator) de cada turno, e os tamanhos
     respostas.json (com --gastar) a narração de cada variante, o uso, o custo
     cego.md        para quem lê: a frase, e as variantes como A, B, C… na
                    ordem embaralhada pela semente do turno — sem dizer qual é qual
     chave.json     a chave do embaralho (abrir só depois de julgar)

   O Mestre vai SEM a ficha do cache explícito (um cache por turno solto só
   custaria a escrita) — o preço dele aqui é o do pedido inteiro sem cache, e
   a comparação de custo deve usar a fatura medida da 13.ª (a anatomia, §4). */
import fs from "node:fs";
import path from "node:path";
import { oPedidoNoServidor } from "../src/turno-no-servidor.js";
import { estadoNoTurno } from "../src/sessao.js";
import { aProsaDoAtor, GATILHOS_DE_TIQUE } from "../src/motor/pedido-do-ator.js";
import { extrairJSON } from "../src/json.js";
import { custoDaChamada } from "../src/custo.js";
import { hashSemente } from "../src/semente.js";

const arg = (nome, padrao) => { const a = process.argv.find((x) => x.startsWith(`--${nome}=`)); return a ? a.slice(nome.length + 3) : padrao; };
const GASTAR = process.argv.includes("--gastar");
const N = Math.max(1, Number(arg("n", "20")) || 20);
const MODELOS_ATOR = String(arg("modelos-ator", "")).split(",").map((x) => x.trim()).filter(Boolean);
const SAIDA = path.resolve(arg("saida", `as-cegas-${new Date().toISOString().slice(0, 10)}`));
const tamanho = (p) => p.system.length + p.messages.reduce((s, m) => s + String(m.content).length, 0);

/* os turnos gravados, como a suíte do pedido do ator os lê */
const turnos = [];
for (const s of ["s8", "s9", "s10", "navegador", "s13"]) {
  const A = JSON.parse(fs.readFileSync(new URL(`./sessao-${s}.json`, import.meta.url), "utf8"));
  for (let i = 0; i < A.turnos.length; i++) {
    const ent = (A.turnos[i] && A.turnos[i].entrada) || {};
    const frase = typeof ent.frase === "string" && ent.frase.trim() ? ent.frase : ent.toque && typeof ent.toque.conteudo === "string" ? ent.toque.conteudo : "";
    if (!frase.trim()) continue;
    /* o relato como o App o tem no envio: as duas trocas de antes e a frase */
    const ant = [i - 2, i - 1].filter((j) => j >= 0).map((j) => A.turnos[j]).filter((x) => x && x.entrada && x.narrador);
    const mensagens = [...ant.flatMap((x) => [{ autor: "jogador", texto: String(x.entrada.frase || (x.entrada.toque && x.entrada.toque.conteudo) || "") }, { autor: "mestre", texto: String(x.narrador.narrativa || "") }]), { autor: "jogador", texto: frase }];
    turnos.push({ de: `${s}#${i}`, A, i, frase, mensagens, gravada: String((A.turnos[i].narrador || {}).narrativa || "") });
  }
}
const passo = turnos.length / Math.min(N, turnos.length);
const escolhidos = Array.from({ length: Math.min(N, turnos.length) }, (_, k) => turnos[Math.floor(k * passo)]);

/* os dois pedidos de cada turno */
const pedidos = [];
for (const k of escolhidos) {
  const estado = { ...estadoNoTurno(k.A, k.i) };
  if (!Array.isArray(estado.mensagens) || !estado.mensagens.length) estado.mensagens = k.mensagens;
  const corpo = { estado, frase: k.frase };
  const mestre = (await oPedidoNoServidor(corpo, { agora: () => 0 })).pedido;
  const ator = (await oPedidoNoServidor(corpo, { agora: () => 0, modoDoNarrador: "ator" })).pedido;
  pedidos.push({ de: k.de, frase: k.frase, gravada: k.gravada, mestre, ator, tamanhos: { mestre: tamanho(mestre), ator: tamanho(ator) } });
}
fs.mkdirSync(SAIDA, { recursive: true });
fs.writeFileSync(path.join(SAIDA, "pedidos.json"), JSON.stringify(pedidos, null, 1));
const med = (xs) => Math.round(xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length));
console.log(`${pedidos.length} turnos · pedido do Mestre: média ${med(pedidos.map((p) => p.tamanhos.mestre))} caracteres · do ator: média ${med(pedidos.map((p) => p.tamanhos.ator))}`);
if (!GASTAR) { console.log(`seco: nada foi à rede. Os pedidos estão em ${path.join(SAIDA, "pedidos.json")}. Para gastar: --gastar`); process.exit(0); }

/* AS RESPOSTAS, de verdade */
const { chamarOProvedor } = await import("../api/_provedor.js");
const baseDeHoje = process.env.NARRADOR_BASE;
const pedir = async (p, modelo) => {
  if (modelo) process.env.NARRADOR_BASE = modelo; else if (baseDeHoje === undefined) delete process.env.NARRADOR_BASE; else process.env.NARRADOR_BASE = baseDeHoje;
  const { status, corpo } = await chamarOProvedor({ system: p.system, messages: p.messages, maxTokens: p.maxTokens, formato: p.formato, tarefa: p.tarefa });
  const uso = corpo && corpo.uso ? corpo.uso : null;
  return { status, texto: String((corpo && corpo.texto) || ""), uso, dolares: uso ? custoDaChamada(uso) : null, erro: corpo && corpo.erro };
};
const variantes = [{ id: "mestre", ler: (t) => { const r = extrairJSON(t); return String(r.narrativa || ""); } },
  ...(MODELOS_ATOR.length ? MODELOS_ATOR : [""]).map((m) => ({ id: m ? `ator:${m}` : "ator", modelo: m, ler: aProsaDoAtor }))];
const respostas = [], chave = {};
const linhas = ["# O teste às cegas", "", `${pedidos.length} turnos · variantes: ${variantes.length}. Julgue cada turno antes de abrir a chave.`, ""];
let total = 0;
for (const p of pedidos) {
  const r = {};
  for (const v of variantes) {
    const q = v.id === "mestre" ? p.mestre : p.ator;
    let out;
    try { out = await pedir(q, v.modelo); } catch (e) { out = { status: 0, texto: "", erro: String(e && e.message) }; }
    const narrativa = out.texto ? v.ler(out.texto) : "";
    const tiques = GATILHOS_DE_TIQUE.filter((g) => g.rx.test(narrativa)).map((g) => g.id);
    r[v.id] = { narrativa, uso: out.uso, dolares: out.dolares, status: out.status, erro: out.erro || null, tiques };
    total += out.dolares || 0;
  }
  respostas.push({ de: p.de, frase: p.frase, gravada: p.gravada, respostas: r });
  /* o embaralho, pela semente do turno */
  const ordem = [...variantes.map((v) => v.id)].sort((a, b) => (hashSemente(`${p.de}|${a}`) % 9973) - (hashSemente(`${p.de}|${b}`) % 9973));
  chave[p.de] = Object.fromEntries(ordem.map((id, j) => [String.fromCharCode(65 + j), id]));
  linhas.push(`## ${p.de}`, "", `> ${p.frase}`, "");
  ordem.forEach((id, j) => linhas.push(`**${String.fromCharCode(65 + j)}.** ${r[id].narrativa || "(sem resposta)"}`, ""));
  console.log(`${p.de}: ${variantes.map((v) => `${v.id} ${r[v.id].status} ${r[v.id].narrativa.split(/\s+/).filter(Boolean).length}p`).join(" · ")}`);
}
fs.writeFileSync(path.join(SAIDA, "respostas.json"), JSON.stringify(respostas, null, 1));
fs.writeFileSync(path.join(SAIDA, "cego.md"), linhas.join("\n"));
fs.writeFileSync(path.join(SAIDA, "chave.json"), JSON.stringify(chave, null, 1));
console.log(`gasto: US$ ${total.toFixed(4)} · tudo em ${SAIDA}`);
