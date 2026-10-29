/* cadeia-espiada.mjs (Fase 4, trilha B, 29/10/2026) — o turno até à rede, com funções do sistema espiadas

   Quem chega ao Narrador já não se lê no App: a pauta e o pedido mudaram-se
   para src/motor/ (pauta-do-turno.js, pedido-do-turno.js), e o prelúdio
   também tem peça (preludio-do-turno.js). O texto do motor não se lê (a
   catraca teste-assercoes-de-texto), logo a pergunta «esta função está no
   caminho até o Narrador?» passa a ser respondida JOGANDO: este script
   corre a cadeia `oPreludioDoTurno` → `oPedidoDoTurno` sobre os casos de
   preludio-bloco.mjs (os 275 do pedido e os montados) e CONTA quantas vezes
   cada função pedida foi chamada pelo caminho.

   COMO ESPIA, sem tocar em src/ no disco: um gancho do carregador de
   módulos (`module.registerHooks`), que muda o módulo do alvo NA MEMÓRIA ao
   carregá-lo.
   - `export function NOME(` (e `export async function`): a declaração
     ganha outro nome e, no lugar dela, nasce um `export function NOME` que
     conta e passa a palavra à original. Como a declaração é içada, TODA
     chamada a NOME conta — a de fora e a de dentro do próprio módulo (o
     `mapaEmTexto` que o `resumoGridPrompt` chama por dentro do grid.js é
     chamada do caminho, e conta).
   - qualquer outra forma (`export const NOME = …`): quem importar o módulo
     recebe um módulo-espião — reexporta tudo do verdadeiro (`export *`) e
     declara só a função espiada, que conta e passa a palavra (o export
     declarado tapa o do `export *`). Aqui só conta a chamada de fora; a de
     dentro do módulo é a mesma ligação local e não passa pelo espião — a
     forma vai em `soDeFora`, para quem ler a contagem saber.
   Há uma instância só de cada módulo.

   Uso (é a mm1-sonda que o chama, num processo à parte, para o gancho
   estar posto antes do primeiro import das peças):
     node testes/cadeia-espiada.mjs '{"nomes":{"grid.js":["a","b"]},"alvos":["grid.js#a"]}'
   Escreve na saída uma linha JSON: { chamadas: { "grid.js#a": n }, casos,
   naRede, naoEspiaveis, soDeFora }. Os `nomes` são os exports de cada
   módulo (quem chama já os importou), para o espião os poder reexportar. */
import { registerHooks } from "node:module";

const pedido = JSON.parse(process.argv[2] || "{}");
const SRC = new URL("../src/", import.meta.url);
const nomesDe = pedido.nomes && typeof pedido.nomes === "object" ? pedido.nomes : {};
const alvos = Array.isArray(pedido.alvos) ? pedido.alvos : [];
const ESPIAO = "?espiao";
const CONTA = "globalThis.__chamadasEspiadas";

/* por URL do módulo: os nomes exportados e as funções espiadas */
const porModulo = new Map();
const naoEspiaveis = [];
for (const a of alvos) {
  const [modulo, nome] = String(a).split("#");
  const todos = nomesDe[modulo];
  if (!Array.isArray(todos) || !todos.includes(nome) || /^[A-Z0-9_]+$/.test(nome)) { naoEspiaveis.push(a); continue; }
  const url = new URL(modulo, SRC).href;
  if (!porModulo.has(url)) porModulo.set(url, { modulo, todos, espiadas: [], deFora: null });
  porModulo.get(url).espiadas.push(nome);
}
globalThis.__chamadasEspiadas = {};
const contar = (modulo, n) => { const chave = JSON.stringify(`${modulo}#${n}`); return `${CONTA}[${chave}] = (${CONTA}[${chave}] || 0) + 1;`; };
const esc = (n) => n.replace(/[$]/g, "\\$&");

/* a declaração `export function NOME(` vira o contador + a original renomeada */
function instrumentar(info, fonte) {
  let s = fonte;
  const deFora = [];
  for (const n of info.espiadas) {
    const re = new RegExp(`^export (async )?function ${esc(n)}\\(`, "m");
    const m = re.exec(s);
    if (!m || s.split(m[0]).length !== 2) { deFora.push(n); continue; }
    const orig = `__espiada_${n}`;
    s = s.replace(re, `export function ${n}(...__a) { ${contar(info.modulo, n)} return ${orig}.apply(this, __a); }\n${m[1] || ""}function ${orig}(`);
  }
  info.deFora = deFora;
  return s;
}

registerHooks({
  resolve(especificador, contexto, proximo) {
    const r = proximo(especificador, contexto);
    const base = String(r.url).split("?")[0];
    const info = porModulo.get(base);
    if (info && info.deFora && info.deFora.length && !String(contexto.parentURL || "").endsWith(ESPIAO)) return { ...r, url: base + ESPIAO, shortCircuit: true };
    return r;
  },
  load(url, contexto, proximo) {
    if (url.endsWith(ESPIAO)) {
      const base = url.slice(0, -ESPIAO.length);
      const { modulo, todos, deFora } = porModulo.get(base);
      const linhas = [`import * as M from ${JSON.stringify(base)};`, `export * from ${JSON.stringify(base)};`];
      if (todos.includes("default")) linhas.push("export default M.default;");
      for (const n of deFora) linhas.push(`export function ${n}(...a) { ${contar(modulo, n)} return M.${n}.apply(this, a); }`);
      return { format: "module", source: linhas.join("\n"), shortCircuit: true };
    }
    const info = porModulo.get(url);
    if (!info) return proximo(url, contexto);
    const r = proximo(url, contexto);
    return { ...r, source: instrumentar(info, String(r.source)), shortCircuit: true };
  },
});
/* a forma de cada alvo (declaração ou const) só se sabe ao ler a fonte: o
   módulo carrega-se aqui, antes das peças, e o espião de fora fica pronto
   para quem o importar depois */
for (const url of porModulo.keys()) await import(url);

const PB = await import("./preludio-bloco.mjs");
const { oPreludioDoTurno } = await import("../src/motor/preludio-do-turno.js");
const { oPedidoDoTurno } = await import("../src/motor/pedido-do-turno.js");
const casos = PB.casosDoPreludio();
const C = await PB.correrAsCadeias([PB.lerODourado(), PB.lerOPedido()], { lado: "peca", pecas: [oPreludioDoTurno, oPedidoDoTurno], casos });
const chamadas = Object.fromEntries(alvos.filter((a) => !naoEspiaveis.includes(a)).map((a) => [a, globalThis.__chamadasEspiadas[a] || 0]));
const soDeFora = [...porModulo.values()].flatMap((i) => (i.deFora || []).map((n) => `${i.modulo}#${n}`));
console.log(JSON.stringify({ chamadas, casos: casos.length, naRede: C.filter((f) => f.redeInteira).length, naoEspiaveis, soDeFora }));
