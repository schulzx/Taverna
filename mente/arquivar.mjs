/* ============================================================
   ARQUIVAR — Taverna

   A mente lê a própria memória ao começar cada ciclo, e essa
   memória cresceu até virar o custo: em 17/09 a pauta do sistema
   tinha 243 KB, o diário 310 KB, as formas 239 KB. Um ciclo que
   lê a sua pauta e o seu diário engolia ~140 mil tokens **antes
   de escrever uma linha** — mais do que o código inteiro que ele
   ia tocar.

   O conserto é o mesmo que a casa aplica a tudo: o que fechou sai
   da mesa e vai para a estante, com um índice apontando onde está.
   Nada se perde — `git mv` de conteúdo, não apagamento. Uma fase
   fechada, um ciclo antigo, uma forma já construída: o valor deles
   é de consulta, e consulta não precisa estar no bolso.

   Roda quando a mesa ficar pesada:  node mente/arquivar.mjs
   Só mede (não move):               node mente/arquivar.mjs --medir
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (p) => { try { return readFileSync(join(RAIZ, p), "utf8").replace(/\r\n?/g, "\n"); } catch { return ""; } };
const kb = (s) => (Buffer.byteLength(s, "utf8") / 1024).toFixed(0);
const SO_MEDIR = process.argv.includes("--medir");

const ARQUIVO = join(RAIZ, "mente", "arquivo");
if (!SO_MEDIR) mkdirSync(ARQUIVO, { recursive: true });

/* Quantos ciclos de diário ficam na mesa. Oito porque é mais que
   uma leva de trabalho e menos que uma semana: o ciclo precisa do
   que aconteceu ontem, não do que aconteceu na Fase A. */
const CICLOS_NA_MESA = 8;

/* ---------------- as fases fechadas saem da pauta ----------------
   Uma fase fechada não é lixo: é a prova de como se chegou aqui, e
   o diário aponta para ela. Mas ela não participa de nenhuma
   decisão nova — ninguém escolhe uma etapa de uma fase que acabou. */
function arquivarPauta(arq, saida) {
  const txt = ler(arq);
  if (!txt) return null;
  const partes = txt.split(/^(?=### Fase )/m);
  const cabeca = partes.shift();
  const fechadas = [], abertas = [];
  for (const p of partes) {
    const nome = p.split("\n")[0].replace(/^### /, "").replace(/\*\*/g, "").trim();
    const etapas = (p.match(/^- \[[ x]\] /gm) || []).length;
    const feitas = (p.match(/^- \[x\] /gm) || []).length;
    /* fechada = declarada fechada, ou todas as etapas com [x] */
    const fechada = /FECHADA/i.test(nome) || (etapas > 0 && etapas === feitas);
    (fechada ? fechadas : abertas).push({ nome, texto: p, etapas, feitas });
  }
  if (!fechadas.length) return { arq, fechadas: 0, antes: kb(txt), depois: kb(txt) };

  const indice = fechadas.map((f) =>
    `- **${f.nome.replace(/ ·.*$/, "")}** — ${f.feitas}/${f.etapas} etapas · texto inteiro em \`mente/arquivo/${saida}\``
  ).join("\n");

  const novo = cabeca + abertas.map((a) => a.texto).join("") +
    `\n## Fases fechadas (o texto saiu para a estante)\n\n` +
    `A mente lê esta pauta ao começar todo ciclo, e fase fechada não\n` +
    `participa de decisão nova. O texto inteiro — etapas, números,\n` +
    `razões — está em \`mente/arquivo/${saida}\`, e o diário aponta para lá.\n\n` +
    indice + "\n";

  if (!SO_MEDIR) {
    const jaTem = existsSync(join(ARQUIVO, saida)) ? readFileSync(join(ARQUIVO, saida), "utf8") : `# Fases fechadas — ${arq}\n\nO texto inteiro das fases que já terminaram. Sai da pauta para a mente\nnão o reler a cada ciclo; fica aqui porque é a prova de como se chegou\naqui, e o diário aponta para ele.\n`;
    writeFileSync(join(ARQUIVO, saida), jaTem + "\n\n" + fechadas.map((f) => "### " + f.texto.replace(/^### /, "")).join("\n"));
    writeFileSync(join(RAIZ, arq), novo);
  }
  return { arq, fechadas: fechadas.length, antes: kb(txt), depois: kb(novo) };
}

/* ---------------- o diário guarda os últimos ciclos ---------------- */
function arquivarDiario(arq, saida) {
  const txt = ler(arq);
  if (!txt) return null;
  const partes = txt.split(/^(?=## \d{2}\/\d{2})/m);
  const cabeca = partes.shift();
  if (partes.length <= CICLOS_NA_MESA) return { arq, movidos: 0, antes: kb(txt), depois: kb(txt) };

  const ficam = partes.slice(0, CICLOS_NA_MESA);
  const vao = partes.slice(CICLOS_NA_MESA);
  const novo = cabeca + ficam.join("") +
    `\n## Os ciclos anteriores\n\n` +
    `Os ${vao.length} ciclos mais antigos estão em \`mente/arquivo/${saida}\`,\n` +
    `inteiros. Saíram daqui porque a mente lê este arquivo ao começar todo\n` +
    `ciclo, e o que ela precisa é do que aconteceu ontem — o resto é consulta.\n`;

  if (!SO_MEDIR) {
    const jaTem = existsSync(join(ARQUIVO, saida)) ? readFileSync(join(ARQUIVO, saida), "utf8") : `# ${arq} — os ciclos antigos\n\nO registro inteiro, do mais recente para o mais antigo.\n`;
    writeFileSync(join(ARQUIVO, saida), jaTem + "\n" + vao.join(""));
    writeFileSync(join(RAIZ, arq), novo);
  }
  return { arq, movidos: vao.length, antes: kb(txt), depois: kb(novo) };
}

/* ---------------- o passado dentro do que está aberto ----------------
   Uma fase aberta carrega as etapas que já fechou, e a seção de decisões
   carrega as que a pessoa já respondeu. São ensaios inteiros — 52 KB de
   etapas feitas e 27 KB de decisões respondidas só na pauta do sistema —
   e nenhum ciclo os lê para decidir nada. O que decide é o que está por
   fazer; o resto é prova, e prova mora na estante.

   Cada um vira uma linha de índice no lugar, com o título e a versão em
   que fechou, para quem ler saber que existiu e onde está. */
function arquivarFeitos(arq, saida) {
  const txt = ler(arq);
  if (!txt) return null;
  const linhas = txt.split("\n");
  const fora = [], guardados = [];
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    if (/^- \[x\] /.test(l)) {
      /* o item e o corpo indentado que vem com ele */
      const bloco = [l]; i++;
      while (i < linhas.length && !/^- \[[ x]\] /.test(linhas[i]) && !/^#{2,3} /.test(linhas[i])) { bloco.push(linhas[i]); i++; }
      const corpo = bloco.join("\n");
      /* um item feito sem corpo já é índice: deixa-se onde está */
      if (bloco.length <= 2) { fora.push(corpo); continue; }
      const titulo = (l.match(/\*\*(.+?)\*\*/) || [, l.slice(6, 70)])[1];
      const versao = (corpo.match(/v\d+\.\d+/) || [, ""])[0] || "";
      guardados.push(corpo);
      fora.push(`- [x] **${titulo}** · feita${versao ? " em " + versao : ""} · texto em \`mente/arquivo/${saida}\``);
      continue;
    }
    fora.push(l); i++;
  }
  if (!guardados.length) return { arq, feitos: 0, antes: kb(txt), depois: kb(txt) };
  const novo = fora.join("\n");
  if (!SO_MEDIR) {
    const jaTem = existsSync(join(ARQUIVO, saida)) ? readFileSync(join(ARQUIVO, saida), "utf8")
      : `# ${arq} — as etapas e decisões que fecharam\n\nO texto inteiro do que já foi feito ou respondido. Saiu da pauta porque a\nmente a lê ao começar todo ciclo, e o que decide é o que está por fazer.\nAqui fica a prova.\n`;
    writeFileSync(join(ARQUIVO, saida), jaTem + "\n" + guardados.join("\n\n"));
    writeFileSync(join(RAIZ, arq), novo);
  }
  return { arq, feitos: guardados.length, antes: kb(txt), depois: kb(novo) };
}

const r = [
  arquivarPauta("mente/pauta.md", "pauta-fechadas.md"),
  arquivarPauta("mente/pauta-desenho.md", "pauta-desenho-fechadas.md"),
  arquivarFeitos("mente/pauta.md", "pauta-feitas.md"),
  arquivarFeitos("mente/pauta-desenho.md", "pauta-desenho-feitas.md"),
  arquivarDiario("mente/diario.md", "diario-antigo.md"),
  arquivarDiario("mente/diario-desenho.md", "diario-desenho-antigo.md"),
].filter(Boolean);

let antes = 0, depois = 0;
for (const x of r) {
  antes += Number(x.antes); depois += Number(x.depois);
  const o = x.fechadas !== undefined ? `${x.fechadas} fases fechadas`
    : x.feitos !== undefined ? `${x.feitos} etapas/decisões fechadas`
    : `${x.movidos} ciclos antigos`;
  console.log(`${x.arq.padEnd(28)} ${String(x.antes).padStart(4)} KB → ${String(x.depois).padStart(4)} KB   (${o})`);
}
console.log(`\n${SO_MEDIR ? "MEDIDO (nada movido)" : "arquivado"}: ${antes} KB → ${depois} KB  ·  ${antes ? Math.round((1 - depois / antes) * 100) : 0}% a menos que a mente lê por ciclo`);
