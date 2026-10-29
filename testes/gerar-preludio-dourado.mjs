/* gerar-preludio-dourado.mjs (Fase 4, trilha B, 29/10/2026) — o prelúdio do turno: o recorte à letra do que o turno escreve ANTES do pedido

   O terceiro passo da ordem do inventário (14bde83), no padrão da pauta
   (gerar-pauta-dourado.mjs) e do pedido (gerar-pedido-dourado.mjs, de quem
   usa a mesma ferramenta, `recortarOPedido`, com outras âncoras). O pedido
   ao Narrador lê onze entradas que `enviar` escreveu antes dele
   (`ENTRADA_DO_PEDIDO`): a oficina, o compasso, a forma da cena, a frente,
   a virada, a trama, o pedido da escuta… Elas saem do trecho de `enviar`
   que vai do `ultimoPedidoRef.current = …` (a frase que é pedido meu) ao
   `falasDoTurnoRef.current = await colherAsFalas(conteudo);` (as bocas) — o
   que anda o mundo antes do Mestre: o chão que se varre, a chegada sozinha,
   a caminhada na cidade, a escuta, o compasso, a forma, a frente, a
   virada, a trama, o ato, o Intérprete, os propósitos, as cinco mãos
   (`mexerNa*`) e as bocas. O recorte é esse trecho à letra, com o fecho de
   cada função do componente que ele chama.

   PORTAS (não entram no recorte): `pushMsgs` e `salvar` (a tela e o disco,
   que são do cliente), `calou`, e `chamarModelo` (a rede das bocas — com
   `BOCAS_POR_TURNO` a 0 ela não é chamada, e a prova di-lo).

   Grava em `preludio-dourado.json`:
     commit, recortes ({ nome, de, texto }), trecho, entrada, saida, refs,
     render (e o valor de partida de cada um), setters, imports, fotos.

   Uso: node testes/gerar-preludio-dourado.mjs [commit] */
import { execSync } from "node:child_process";
import fs from "node:fs";
import { recortarOPedido } from "./gerar-pedido-dourado.mjs";

/* as âncoras do trecho (as duas pontas, inclusive) */
export const DE_PRELUDIO = "ultimoPedidoRef.current = ";
export const ATE_PRELUDIO = "falasDoTurnoRef.current = await colherAsFalas(";
export const PORTAS_PRELUDIO = ["pushMsgs", "salvar"];

/* o `useCallback` do React não é módulo do jogo: o escopo dá-o (f => f) */
export const recortarOPreludio = (app) => {
  const r = recortarOPedido(app, { de: DE_PRELUDIO, ate: ATE_PRELUDIO, portas: PORTAS_PRELUDIO, raizes: [] });
  for (const [n, i] of Object.entries(r.imports)) if (i.de === "react") delete r.imports[n];
  return r;
};

if (process.argv[1] && process.argv[1].endsWith("gerar-preludio-dourado.mjs")) {
  const commit = process.argv[2] || "HEAD";
  const sha = execSync(`git rev-parse --short ${commit}`, { encoding: "utf8" }).trim();
  const app = execSync(`git show ${sha}:src/App.jsx`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split(String.fromCharCode(13)).join("");
  const r = recortarOPreludio(app);
  const { correrOsCasos, fotoGuardada, correrAsCadeias, cadeiaGuardada, lerOPedido } = await import("./preludio-bloco.mjs");
  const dourado = { commit: sha, ...r, fotos: [], cadeias: [] };
  const fotos = await correrOsCasos(dourado, { lado: "recorte" });
  dourado.fotos = fotos.map(fotoGuardada);
  /* o turno até à rede: este recorte e o do pedido (pedido-dourado.json) nos mesmos refs */
  const pedido = lerOPedido();
  dourado.cadeias = (await correrAsCadeias([dourado, pedido])).map(cadeiaGuardada);
  dourado.commitDoPedido = pedido.commit;
  fs.writeFileSync(new URL("./preludio-dourado.json", import.meta.url), JSON.stringify(dourado, null, 1) + "\n");
  const tam = r.recortes.reduce((a, x) => a + x.texto.length, 0) + r.trecho.length;
  console.log(`preludio-dourado.json: ${r.recortes.length} recortes de ${sha} (${tam} caracteres), ${Object.keys(r.refs).length} refs, ${Object.keys(r.imports).length} imports, entrada ${r.entrada.join(" ")}, saída ${r.saida.join(" ")}, render ${r.render.join(" ")}, ${r.setters.length} setters, ${dourado.fotos.length} fotos, ${dourado.fotos.filter((f) => f.erro).length} estouram; a cadeia até à rede: ${dourado.cadeias.filter((f) => f.rede).length} pedidos, ${dourado.cadeias.filter((f) => f.erro).length} estouram, faltas ${[...new Set(dourado.cadeias.flatMap((f) => f.faltas))].join() || 0}`);
}
