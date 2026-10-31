/* ============================================================
   AS ÂNCORAS DO APP — como uma prova aponta para o `App.jsx` sem número de linha

   POR QUE ESTE ARQUIVO EXISTE. A tabela da Fase X (`acoes-do-jogador.mjs`)
   guardava 141 endereços `src/App.jsx:N`, e cada patch no App deslocava
   quase todos: era preciso um re-medidor à parte e correções à mão, e a
   cada rodada. O custo não era o pior. O pior eram os endereços ERRADOS que
   ninguém via — um apontava para o comentário de um bloco, outro para um
   `try {`, quatro entradas do funil dividiam duas linhas, e uma recusa (a
   do 🐾) apontava para a linha de outra. O varredor só perguntava se a
   linha citada tinha um `pushMsgs(`, nunca qual.

   O QUE SUBSTITUI O NÚMERO. Dois modos, e nenhum depende da posição:

   1. A REFERÊNCIA — `src/App.jsx#nome` (ou `src/grid.js#nome`, qualquer
      arquivo de `src/`). Aponta para uma declaração pelo NOME. Vale em
      qualquer string de uma tabela; `referenciasDe` apanha todas e
      `declaracoesDe` diz quantas vezes o nome é declarado no arquivo. Zero
      é «sumiu»; mais de uma é «ambígua». As duas são falha.

   2. A ÂNCORA DE CHAMADA — um trecho do código, em `ancora: "..."`, que tem
      de aparecer EXATAMENTE UMA VEZ no corpo da função dona e conter UMA
      chamada (`pushMsgs(`). Espaço em branco não conta (o recuo e a quebra
      de linha mudam sem que o código mude). `conferirChamadas` ainda exige
      que as âncoras de uma função COBRAM TODAS as chamadas dela, uma por
      âncora: é o que o endereço de linha nunca conseguiu dizer — o número
      podia cair em qualquer `pushMsgs(` e a régua dava-se por contente.

   O QUE ESTE ARQUIVO NÃO FAZ: não lê o jogo, não julga se a frase está
   certa. Só diz se o lugar que a tabela cita ainda existe, é um só, e é o
   que a tabela diz. A mordida está provada em `teste-ancoras-do-app.mjs`:
   apagar, renomear ou duplicar o alvo ACENDE; mover o alvo (50 linhas no
   topo do App) NÃO acende.
   ============================================================ */
import { readFileSync } from "node:fs";

/* O App que se lê. A variável de ambiente existe para a suíte das âncoras
   poder apontar para uma CÓPIA mutada do arquivo (apagada, renomeada,
   deslocada) sem tocar no `src/`; em uso normal ela não está definida. */
export const lerApp = (caminho = process.env.TAVERNA_APP_JSX || "../src/App.jsx") => readFileSync(caminho, "utf8");

/* espaço em branco colapsado: o código pode mudar de recuo sem mudar de sentido */
export const normaliza = (s) => String(s).replace(/\s+/g, " ");

/* as declarações do primeiro nível do componente (recuo de dois espaços),
   cada uma com o corpo até a próxima. É a unidade em que uma âncora de
   chamada é procurada. */
export function declaracoesDoComponente(app) {
  const linhas = app.split("\n");
  const decls = [];
  linhas.forEach((l, i) => {
    const m = l.match(/^  (?:const|async function|function) ([A-Za-z0-9_$]+)\s*=?\s*(?:async\s*)?(?:\(|function|useCallback|=>)/);
    if (m) decls.push({ nome: m[1], ini: i });
  });
  decls.forEach((d, k) => { d.fim = k + 1 < decls.length ? decls[k + 1].ini : linhas.length; });
  return { linhas, decls };
}

/* o corpo de uma função do componente: { n, texto }. `n` é quantas vezes
   o nome é declarado no primeiro nível (1 é o único valor bom). */
export function corpoDe(app, nome) {
  const { linhas, decls } = declaracoesDoComponente(app);
  const achadas = decls.filter((d) => d.nome === nome);
  if (achadas.length !== 1) return { n: achadas.length, texto: "" };
  const d = achadas[0];
  return { n: 1, texto: linhas.slice(d.ini, d.fim).join("\n") };
}

/* em que função do componente cai o trecho `trecho`? Devolve o nome, ou
   null se o trecho não está (ou está mais de uma vez). Serve às provas que
   dizem «isto acontece DENTRO de tal função» sem dizer em que linha. */
export function funcaoDoTrecho(app, trecho) {
  const i = app.indexOf(trecho);
  if (i < 0 || app.indexOf(trecho, i + 1) >= 0) return null;
  const linha = app.slice(0, i).split("\n").length - 1;
  const { decls } = declaracoesDoComponente(app);
  let dona = null;
  for (const d of decls) { if (d.ini <= linha) dona = d; else break; }
  return dona ? dona.nome : null;
}

/* quantas vezes `nome` é declarado em `texto` (qualquer recuo; `const`,
   `let`, `var`, `function`, `class`, com ou sem `export`/`async`). */
export function declaracoesDe(texto, nome) {
  const esc = nome.replace(/[$]/g, "\\$");
  const re = new RegExp(`^[ \\t]*(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:const|let|var|function\\*?|class)\\s+${esc}(?![A-Za-z0-9_$])`, "gm");
  return (texto.match(re) || []).length;
}

/* todas as referências `src/arquivo#nome` que aparecem em qualquer string
   de um valor (objeto, lista, texto) — a tabela inteira de uma vez. */
export function referenciasDe(valor, achadas = new Set()) {
  if (typeof valor === "string") {
    for (const m of valor.matchAll(/(src\/[A-Za-z0-9_./-]+\.(?:jsx?|mjs))#([A-Za-z0-9_$]+)/g)) achadas.add(`${m[1]}#${m[2]}`);
  } else if (Array.isArray(valor)) {
    for (const v of valor) referenciasDe(v, achadas);
  } else if (valor && typeof valor === "object") {
    for (const v of Object.values(valor)) referenciasDe(v, achadas);
  }
  return achadas;
}

/* confere uma referência contra o código. `ler(caminho)` devolve o texto
   do arquivo (src/App.jsx vem de `lerApp`, o resto do disco). Devolve
   { ok, n } — n é o número de declarações achadas. */
export function conferirReferencia(ref, ler) {
  const [arquivo, nome] = ref.split("#");
  let texto;
  try { texto = ler(arquivo); } catch { return { ok: false, n: -1, motivo: `não achei o arquivo ${arquivo}` }; }
  const n = declaracoesDe(texto, nome);
  return { ok: n === 1, n, motivo: n === 0 ? `\`${nome}\` não é mais declarado em ${arquivo}` : n > 1 ? `\`${nome}\` é declarado ${n} vezes em ${arquivo} (ambíguo)` : "" };
}

/* quantas vezes a âncora aparece no corpo (já normalizado dos dois lados) */
export function ocorrencias(corpoNormalizado, ancora) {
  const a = normaliza(ancora).trim();
  if (!a) return 0;
  return corpoNormalizado.split(a).length - 1;
}

/* A CONFERÊNCIA DAS CHAMADAS. Para uma função (`corpo`, texto cru) e a
   lista de âncoras que a tabela declara para ela, devolve os problemas:
     · `sumidas`    — âncora que não aparece no corpo;
     · `ambiguas`   — âncora que aparece mais de uma vez;
     · `semChamada` — âncora que não contém exatamente uma `chamada`;
     · `repetidas`  — duas entradas que apontam para a MESMA chamada;
     · `soltas`     — quantas chamadas do corpo nenhuma âncora cobre.
   `soltas` é a que o endereço de linha nunca soube dizer. */
export function conferirChamadas(corpo, ancoras, chamada = "pushMsgs(") {
  const c = normaliza(corpo);
  const sumidas = [], ambiguas = [], semChamada = [], repetidas = [];
  const cobertas = new Set();
  for (const bruta of ancoras) {
    const a = normaliza(bruta).trim();
    const dentro = a.split(chamada).length - 1;
    if (dentro !== 1) { semChamada.push(bruta); continue; }
    const n = ocorrencias(c, a);
    if (n === 0) { sumidas.push(bruta); continue; }
    if (n > 1) { ambiguas.push(bruta); continue; }
    const pos = c.indexOf(a) + a.indexOf(chamada);
    if (cobertas.has(pos)) repetidas.push(bruta); else cobertas.add(pos);
  }
  const total = c.split(chamada).length - 1;
  return { sumidas, ambiguas, semChamada, repetidas, soltas: Math.max(0, total - cobertas.size), total };
}
