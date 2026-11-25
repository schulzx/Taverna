/* A MEDIDA DA LEITORA — passo 2: pergunta à IA pequena, uma frase por chamada.

   O CAMINHO. Não há chave nesta máquina (nenhum .env): as chaves vivem na
   Vercel. A rota é a de sempre, POST /api/narrador em produção, chamada como o
   jogo em desenvolvimento a chama (origem localhost, que o portão aceita).
   `tarefa: "leve"` manda o pedido ao Cronista (api/_provedor.js, CRONISTA):
   o modelo mais barato que a casa tem (padrão gemini-3.5-flash-lite,
   pensamento MINIMAL, temperatura 0,3 — a rota não deixa pedir 0). O modelo
   que de fato respondeu volta em `uso.modelo`, e fica gravado.

   O TETO. 450 chamadas no total, contando erro e repetição: `contagem.json`
   soma cada ida à rede ANTES de ela sair, e o script para no teto. Cada
   resposta vai para o disco assim que chega (respostas-<variante>.jsonl), e
   uma frase já respondida nunca é paga de novo.

   Nas chamadas vai só a frase e o resumo da cena (ficção do jogo).

   Uso: node testes/medida-da-leitora/chamar.mjs --variante minima|rica [--conjunto ineditas-60] [--limite N] */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opcao = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

export const TETO_DE_CHAMADAS = 450;
const ROTA = "https://taverna-sooty.vercel.app/api/narrador";
const ORIGEM = "http://localhost:5173";

/* AS DUAS PERGUNTAS. Uma palavra, de uma lista fechada; nada mais. */
export const VARIANTES = {
  minima: {
    rotulos: ["pede_troca", "fala", "outra_acao"],
    system: [
      "Você lê a frase que um jogador digitou num RPG de mesa e diz o que ela pede ao Mestre AGORA.",
      "Responda com UMA palavra desta lista, e nada mais:",
      "pede_troca — o herói quer que moeda ou coisa mude de mão agora: comprar, vender, pagar, dar, entregar, devolver, emprestar, pedir algo de graça ou fiado, cobrar uma dívida, subornar, trocar, roubar, furtar. Vale mesmo que a cena não permita ou que ele não tenha o bastante.",
      "fala — conversa, pergunta (inclusive de preço), elogio, comentário, lembrança, hipótese, recusa, ameaça ou piada, sem pedir que nada mude de mão agora.",
      "outra_acao — age no mundo sem trocar nada: anda, olha, usa, luta, espera.",
      "Sem explicação, sem pontuação: só a palavra.",
    ].join("\n"),
  },
  rica: {
    rotulos: ["falar", "convencer", "olhar", "mover", "trocar", "usar", "agir", "lutar", "esperar", "perguntar_ao_mestre"],
    system: [
      "Você lê a frase que um jogador digitou num RPG de mesa e diz o que ela pede ao Mestre AGORA.",
      "Responda com UMA palavra desta lista, e nada mais:",
      "falar — conversa, pergunta a alguém da cena, elogio, comentário, lembrança, hipótese, recusa, ameaça ou piada.",
      "convencer — tenta persuadir, intimidar, enganar ou seduzir alguém a fazer algo (sem dar moeda ou coisa em troca).",
      "olhar — examina, procura, observa.",
      "mover — anda, vai a algum lugar, se aproxima, foge.",
      "trocar — o herói quer que moeda ou coisa mude de mão agora: comprar, vender, pagar, dar, entregar, devolver, emprestar, pedir algo de graça ou fiado, cobrar uma dívida, subornar, trocar, roubar, furtar. Vale mesmo que a cena não permita ou que ele não tenha o bastante.",
      "usar — usa um item ou habilidade que carrega.",
      "agir — outra ação física no mundo (escalar, abrir, esconder-se, consertar).",
      "lutar — ataca ou entra em combate.",
      "esperar — espera, descansa, deixa o tempo passar.",
      "perguntar_ao_mestre — fala com o Mestre fora da ficção (regra, dúvida sobre o jogo).",
      "Sem explicação, sem pontuação: só a palavra.",
    ].join("\n"),
  },
};

export const pedidoDoUsuario = (it) => `Cena: ${it.cena}\nFrase do jogador: «${it.frase}»\nResposta:`;

/* fora da lista é «sem resposta» (o sistema usaria o ouvido) */
export function normalizar(bruto, rotulos) {
  const s = String(bruto || "").trim().toLowerCase().replace(/^[\s"'«»`*.:-]+|[\s"'«»`*.:!-]+$/g, "");
  return rotulos.includes(s) ? s : null;
}

const lerContagem = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")).chamadas || 0; } catch { return 0; } };
const lerFeitas = (f) => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };

async function principal() {
  const variante = opcao("--variante") || "minima";
  const V = VARIANTES[variante];
  if (!V) throw new Error("variante desconhecida: " + variante);
  const conjunto = opcao("--conjunto");
  const limite = Number(opcao("--limite")) || Infinity;
  const itens = JSON.parse(fs.readFileSync(path.join(AQUI, "itens.json"), "utf8")).filter((i) => !conjunto || i.conjunto === conjunto);
  const arqResp = path.join(AQUI, `respostas-${variante}.jsonl`);
  const arqCont = path.join(AQUI, "contagem.json");
  const feitas = new Set(lerFeitas(arqResp).filter((r) => r.status === 200).map((r) => r.conjunto + "|" + r.id));
  let n = 0;
  for (const it of itens) {
    if (feitas.has(it.conjunto + "|" + it.id)) continue;
    if (n >= limite) break;
    const usadas = lerContagem(arqCont);
    if (usadas >= TETO_DE_CHAMADAS) { console.log(`TETO de ${TETO_DE_CHAMADAS} chamadas alcançado — parando.`); break; }
    fs.writeFileSync(arqCont, JSON.stringify({ chamadas: usadas + 1 }) + "\n");
    n++;
    const corpo = { system: V.system, messages: [{ role: "user", content: pedidoDoUsuario(it) }], maxTokens: 800, formato: "texto", tarefa: "leve" };
    const t0 = Date.now();
    let reg;
    try {
      const r = await fetch(ROTA, { method: "POST", headers: { "content-type": "application/json", origin: ORIGEM }, body: JSON.stringify(corpo) });
      const ms = Date.now() - t0;
      const d = await r.json().catch(() => ({}));
      reg = { id: it.id, conjunto: it.conjunto, variante, status: r.status, ms, bruto: d.texto ?? null, rotulo: r.status === 200 ? normalizar(d.texto, V.rotulos) : null, uso: d.uso || null, provedor: d.provedor || null, fila: d.fila || null, falharam: d.falharam || null, erro: d.erro || null };
    } catch (e) {
      reg = { id: it.id, conjunto: it.conjunto, variante, status: 0, ms: Date.now() - t0, bruto: null, rotulo: null, erro: String(e && e.message || e).slice(0, 200) };
    }
    fs.appendFileSync(arqResp, JSON.stringify(reg) + "\n");
    console.log(`${lerContagem(arqCont)} ${it.conjunto} ${it.id} ${reg.status} ${reg.ms}ms ${JSON.stringify(reg.bruto)}${reg.erro ? " ERRO " + reg.erro : ""}`);
    if (reg.status === 429 || reg.status === 403) { console.log("o portão recusou — parando."); break; }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await principal();
