/* ============================================================
   O PAINEL — Taverna
   Lê o que a mente já escreve (pauta, diário, a trava do ciclo,
   o git) e monta um retrato em JSON. Nada de verdade nova: a
   página é uma janela, não um segundo registro. Se a pauta e o
   painel discordarem, a pauta está certa.

   Roda no fim de todo ciclo:  node mente/painel.mjs
   Escreve:                    mente/painel.json
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p) => { try { return readFileSync(join(RAIZ, p), "utf8"); } catch { return ""; } };

/* Quem são as mãos. O papel sai da própria descrição do agente — o
   arquivo é a verdade, para o painel não envelhecer quando um agente
   mudar de ofício. */
function agentes() {
  const dir = join(RAIZ, ".claude", "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => {
    const txt = readFileSync(join(dir, f), "utf8");
    const nome = (txt.match(/^name:\s*(.+)$/m) || [, f.replace(/\.md$/, "")])[1].trim();
    const modelo = (txt.match(/^model:\s*(.+)$/m) || [, "—"])[1].trim();
    const desc = (txt.match(/^description:\s*([\s\S]*?)(?=^\w+:|^---)/m) || [, ""])[1];
    /* a primeira frase da descrição é o ofício em uma linha */
    const oficio = desc.replace(/\s+/g, " ").trim().split(/(?<=\.)\s/)[0] || "";
    return { nome, modelo, oficio };
  });
}

/* A trava é o único sinal honesto de "agora": existe = alguém está
   escrevendo na árvore. Mais de 90 minutos e o ciclo morreu (a regra
   está no roteiro do orquestrador). */
function cicloEmCurso() {
  const p = join(RAIZ, ".claude", "ciclo-em-curso");
  if (!existsSync(p)) return null;
  const desde = statSync(p).mtime;
  const min = Math.round((Date.now() - desde.getTime()) / 60000);
  return { desde: desde.toISOString(), minutos: min, morto: min > 90, texto: readFileSync(p, "utf8").trim().slice(0, 200) };
}

/* Um item da pauta: "- [ ] **título** · peso · de: quem · dd/mm" e o
   corpo indentado que vem embaixo até o próximo item ou seção. */
function itens(bloco) {
  const linhas = bloco.split("\n");
  const fora = [];
  let atual = null;
  for (const l of linhas) {
    const cab = l.match(/^- \[([ x])\] \*\*(.+?)\*\*(.*)$/);
    if (cab) {
      if (atual) fora.push(atual);
      const cauda = cab[3] || "";
      atual = {
        feito: cab[1] === "x",
        titulo: cab[2].trim(),
        peso: (cauda.match(/·\s*(leve|médio|pesado)\b/i) || [, ""])[1].toLowerCase(),
        de: (cauda.match(/de:\s*([^·]+)/) || [, ""])[1].trim(),
        quando: (cauda.match(/·\s*(\d{2}\/\d{2})\s*$/) || [, ""])[1],
        versao: (cauda.match(/(v\d+\.\d+)/) || [, ""])[1],
        corpo: "",
      };
    } else if (atual && (l.startsWith("  ") || l.trim() === "")) {
      atual.corpo += l.trim() + " ";
    } else if (atual && l.startsWith("#")) {
      fora.push(atual); atual = null;
    }
  }
  if (atual) fora.push(atual);
  return fora.map((i) => ({ ...i, corpo: i.corpo.replace(/\s+/g, " ").trim() }));
}

/* O bloco de exemplo de cada arquivo da mente mora dentro de uma cerca
   ``` — e o exemplo do diário começa com "## dd/mm", que o separador de
   ciclos casaria como se fosse um ciclo de verdade. Cortar a cerca antes
   de qualquer leitura é mais barato que ensinar cada parser a desconfiar. */
const semCerca = (txt) => txt.replace(/^```[\s\S]*?^```/gm, "");

function seccao(txt, titulo) {
  /* `\Z` não existe em regex de JS — é escape de identidade para a letra
     "Z", e a seção morria no primeiro Z do texto. O fim de arquivo se diz
     com um lookahead que não encontra mais nada. */
  const re = new RegExp(`^## ${titulo}[^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m");
  return (txt.match(re) || [, ""])[1] || "";
}

/* As fases aprovadas: cada "### Fase X — nome" com suas etapas. */
function fases(bloco) {
  const partes = bloco.split(/^### /m).slice(1);
  return partes.map((p) => {
    const nome = p.split("\n")[0].replace(/\*\*/g, "").trim();
    const etapas = itens(p);
    const feitas = etapas.filter((e) => e.feito).length;
    return {
      nome,
      fechada: /FECHADA/i.test(nome),
      feitas, total: etapas.length,
      etapas: etapas.map(({ feito, titulo, versao, corpo }) => ({ feito, titulo, versao, resumo: corpo.slice(0, 400) })),
    };
  });
}

/* O diário: um bloco por ciclo, o mais recente no topo. */
function diario(txt) {
  const partes = txt.split(/^## /m).slice(1);
  return partes.map((p) => {
    const cab = p.split("\n")[0];
    const corpo = p.slice(cab.length).trim();
    return {
      cabecalho: cab.trim(),
      versao: (cab.match(/(v\d+\.\d+)/) || [, ""])[1],
      quando: (cab.match(/^(\d{2}\/\d{2}(?: \d{2}:\d{2})?)/) || [, ""])[1],
      titulo: (cab.split("·")[2] || cab).trim(),
      linhas: corpo.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.replace(/^- /, "").trim()),
    };
  });
}

function commits() {
  try {
    return execSync('git log -40 --format=%h%x1f%s%x1f%cI', { cwd: RAIZ }).toString()
      .trim().split("\n").map((l) => { const [hash, assunto, quando] = l.split("\x1f"); return { hash, assunto, quando }; });
  } catch { return []; }
}

const pauta = semCerca(ler("mente/pauta.md"));
const painel = {
  gerado: new Date().toISOString(),
  versao: (ler("src/constantes.js").match(/VERSAO\s*=\s*"([^"]+)"/) || [, "—"])[1],
  ciclo: cicloEmCurso(),
  agentes: agentes(),
  pendentes: itens(seccao(pauta, "Para a pessoa decidir")).filter((i) => !i.feito),
  fases: fases(seccao(pauta, "Aprovado pela pessoa")),
  aberto: itens(seccao(pauta, "Aberto")).filter((i) => !i.feito),
  recusado: seccao(pauta, "Recusado").split("\n").filter((l) => l.startsWith("- **")).map((l) => l.replace(/^- /, "").trim()),
  diario: diario(semCerca(ler("mente/diario.md"))).slice(0, 25),
  commits: commits(),
};

writeFileSync(join(RAIZ, "mente", "painel.json"), JSON.stringify(painel, null, 2) + "\n");
console.log(`painel: ${painel.versao} · ${painel.pendentes.length} pendentes · ${painel.fases.length} fases · ${painel.aberto.length} abertos · ${painel.diario.length} ciclos`);
