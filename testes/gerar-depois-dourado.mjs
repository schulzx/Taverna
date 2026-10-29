/* gerar-depois-dourado.mjs (Fase 4, trilha A, 29/10/2026) — o depois da resposta: o recorte à letra dos órgãos que o App ainda corria depois do aplicar

   O /api/turno já corre no servidor o aplicar, o fim do turno, o Juiz e o
   Cronista (6b255cc); o que o turno do App fazia depois disso e o servidor
   não tinha são órgãos com nome — funções do componente, não um trecho de
   `enviar`: o trabalho que o mundo oferece (`oferecerTrabalhoDaqui`, e o
   `pregarNoMural` por onde ele passa, que é também uma porta do Cronista).
   O recorte é cada um à letra, com o fecho das funções do componente que
   ele chama, pela MESMA ferramenta do pedido e do prelúdio
   (`recortarOPedido`, a árvore do @babel/parser). Ela parte de um trecho de
   `enviar`; um órgão com nome não é trecho, e a raiz entra como uma
   instrução que só o nomeia (`void [f, g];`), posta no começo do corpo de
   `enviar` de uma cópia do texto — os recortes saem do mesmo texto, à
   letra, e a instrução não é de nenhum.

   PORTAS (não entram no recorte): `pushMsgs` e `salvar` (a tela e o disco),
   `calou`, os setters do React.

   Grava em `depois-dourado.json`:
     commit, raizes, recortes ({ nome, de, texto }), refs, render (e o valor
     de partida de cada um), setters, imports.
   A prova (teste-motor-depois-do-turno.mjs) corre este recorte e a peça
   (src/motor/depois-do-turno.js) sobre os mesmos casos, lado a lado.

   Uso: node testes/gerar-depois-dourado.mjs [commit] */
import { execSync } from "node:child_process";
import fs from "node:fs";
import { recortarOPedido } from "./gerar-pedido-dourado.mjs";

/* os órgãos do depois que já são peça, e as portas deles */
export const RAIZES_DO_DEPOIS = ["oferecerTrabalhoDaqui", "pregarNoMural"];
export const PORTAS_DO_DEPOIS = ["pushMsgs", "salvar"];

export function recortarODepois(app, { raizes = RAIZES_DO_DEPOIS, portas = PORTAS_DO_DEPOIS } = {}) {
  const k = app.indexOf("const enviar = useCallback(async (");
  if (k < 0) throw new Error("enviar não está onde estava");
  const corpo = app.indexOf("{", app.indexOf("=>", k)) + 1;
  const marca = `void [${raizes.join(", ")}];`;
  if (app.includes(marca)) throw new Error("a marca já está no App");
  const comMarca = app.slice(0, corpo) + "\n" + marca + "\n" + app.slice(corpo);
  const r = recortarOPedido(comMarca, { de: marca, ate: marca, portas, portasDoModulo: ["calou"], raizes: [] });
  for (const n of raizes) if (!r.recortes.some((x) => x.nome === n && x.de === "componente")) throw new Error(`${n} não é função do componente`);
  for (const x of r.recortes) if (!app.includes(x.texto)) throw new Error(`${x.nome}: o recorte não é do App`);
  for (const [n, i] of Object.entries(r.imports)) if (i.de === "react") delete r.imports[n];
  const { trecho, entrada, saida, aguarda, ...resto } = r;
  void trecho; void aguarda;
  if (entrada.length || saida.length) throw new Error("a raiz leu ou deu algo de enviar");
  return { raizes: [...raizes], ...resto };
}

if (process.argv[1] && process.argv[1].endsWith("gerar-depois-dourado.mjs")) {
  const commit = process.argv[2] || "HEAD";
  const sha = execSync(`git rev-parse --short ${commit}`, { encoding: "utf8" }).trim();
  const app = execSync(`git show ${sha}:src/App.jsx`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(String.fromCharCode(13)).join("");
  const r = recortarODepois(app);
  const dourado = { commit: sha, ...r };
  fs.writeFileSync(new URL("./depois-dourado.json", import.meta.url), JSON.stringify(dourado, null, 1) + "\n");
  const tam = r.recortes.reduce((a, x) => a + x.texto.length, 0);
  console.log(`depois-dourado.json: ${r.recortes.length} recortes de ${sha} (${tam} caracteres), raízes ${r.raizes.join(" ")}, ${Object.keys(r.refs).length} refs, ${Object.keys(r.imports).length} imports, render ${r.render.join(" ")}, setters ${r.setters.join(" ")}`);
}
