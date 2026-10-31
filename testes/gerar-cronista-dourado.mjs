/* gerar-cronista-dourado.mjs (Fase T1-A, 9.ª fatia, 28/10/2026) — o Cronista do turno no App de ANTES

   Não é suíte (o `npm test` não o corre): é a ferramenta que faz o
   `cronista-dourado.json`. Lê o App de ANTES de o gatilho, o pedido e o
   aceito aplicado saírem para src/motor/cronista-do-turno.js —
   `git show 760fe1b:src/App.jsx` —, recorta o `cronistaDoTurno` inteiro à
   letra e corre-o em Node sobre os casos de `cronista-bloco.mjs`, com os
   refs trocados por objetos simples e os módulos de verdade.

   uso: node testes/gerar-cronista-dourado.mjs [commit]  */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { N_CASOS } from "./combate-casos.mjs";
import { recorteDeAntes, blocoComoFuncao, correrOBloco, fotoDoCronista, casosDoCronista } from "./cronista-bloco.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "760fe1b";
const cru = execSync(`git show ${COMMIT}:src/App.jsx`, { cwd: path.join(AQUI, ".."), maxBuffer: 1 << 28 }).toString().replace(/\r\n/g, "\n");
/* O CONSERTO DECLARADO (29/10/2026, a 13.ª sessão): o molde JSON do pedido ao
   Cronista ganha a chave "falou_com":[] depois de "pessoas" — a SEÇÃO pedia a
   conversa em prosa, o molde não a tinha, e o modelo responde pelo molde: a
   proposta crua do T19 da 13.ª trouxe as dez chaves dele e só elas, e
   «Encontrar Corrado» nunca fechou (teste-falar-com-em-cena §5). Muda o texto
   do pedido em todo caso que chama o Cronista (256 das 275 fotos, pelo hash
   do que se mandou); nada mais muda — provado trocando só esta chave no motor
   de HEAD: as 275 batem com o dourado de antes. */
/* O SEGUNDO CONSERTO DECLARADO (31/10/2026, a 13.ª sessão): o aceite do turno
   chega ao Cronista. No turno em que o herói aceitou um pedido do sistema
   (`doTurno.aceite`, { de, objeto, pede } — o `pedido.objeto` do arco, 045b26b),
   o pedido ao Cronista ganha, antes da narrativa, o bloco do pedido aceito
   (o texto é o de src/motor/cronista-do-turno.js#oPedidoAoCronista), e o juízo
   recebe o aceite (`ctx.aceite`: a pessoa nova que o pedido trocado pela prosa
   amarra a quem pediu entra como palavra dele e sem o papel). Sem aceite, o
   pedido e o juízo são os de antes. Muda só os casos com aceite (`comAceite`
   em cronista-bloco.mjs, um em onze); provado: as outras fotos são as do
   dourado de antes, byte a byte.
   E o gatilho (o mesmo conserto, a outra ponta): o turno do aceite LÊ —
   `decidirOCronista` acende "aceite" quando o turno traz um com objeto
   (gatilho-do-cronista.js), porque o aceite não viaja na fila. O App de antes
   não passava o aceite ao gatilho; o conserto passa-o (`aceite: dt.aceite`). */
const ACEITE_NO_PEDIDO = "const __aceiteParaOCronista = (aceite) => { const a = aceite && typeof aceite === \"object\" ? aceite : {}; const objeto = typeof a.objeto === \"string\" ? a.objeto.trim() : \"\"; if (!objeto) return \"\"; const de = typeof a.de === \"string\" && a.de.trim() ? a.de.trim() : \"alguém em cena\"; const pede = typeof a.pede === \"string\" && a.pede.trim() ? \" — \\\"\" + a.pede.trim() + \"\\\"\" : \"\"; return \"PEDIDO QUE O HERÓI ACEITOU NESTE TURNO (é o do sistema; se a narrativa puser na boca de alguém OUTRO pedido, isso é palavra de quem fala, não fato — não dê papel a ninguém por ele):\\n- \" + de + \" pede: \" + objeto + pede + \"\\n\\n\"; };";
const CONSERTOS = [
  ['notas\\":\\"máx. 8 palavras\\"}],\\"fe\\"', 'notas\\":\\"máx. 8 palavras\\"}],\\"falou_com\\":[],\\"fe\\"'],
  ["  const cronistaDoTurno = async (pers, narrativa, doTurno) => {\n", "  const cronistaDoTurno = async (pers, narrativa, doTurno) => {\n    " + ACEITE_NO_PEDIDO + "\n"],
  ["${filaDoCronista}NARRATIVA DO TURNO:", "${filaDoCronista}${__aceiteParaOCronista(doTurno && doTurno.aceite)}NARRATIVA DO TURNO:"],
  ["envelopes: (doTurno && Array.isArray(doTurno.envelopes)) ? doTurno.envelopes : [], aceitariam });", "envelopes: (doTurno && Array.isArray(doTurno.envelopes)) ? doTurno.envelopes : [], aceitariam, aceite: doTurno && doTurno.aceite });"],
  ["fe: !!(divindadeRef.current && divindadeRef.current.despertar) }, leituraDoCronistaRef.current);", "fe: !!(divindadeRef.current && divindadeRef.current.despertar), aceite: dt.aceite }, leituraDoCronistaRef.current);"],
];
let app = cru;
for (const [de, para] of CONSERTOS) {
  if (app.split(de).length !== 2) throw new Error("o conserto declarado não bate uma vez: " + de.slice(0, 60));
  app = app.replace(de, () => para);
}
const fn = blocoComoFuncao(recorteDeAntes(app));
const casos = casosDoCronista(N_CASOS);
const fotos = [];
for (const k of casos) fotos.push(fotoDoCronista(await correrOBloco(fn, k, { novo: false })));
const faltas = [...new Set(fotos.flatMap((f) => f.faltas))];
console.log(`${N_CASOS} fotos, ${fotos.filter((f) => f.erro).length} estouram, faltas: ${faltas.join(", ") || "nenhuma"}`);
fs.writeFileSync(path.join(AQUI, "cronista-dourado.json"), JSON.stringify({ commit: COMMIT, casos: N_CASOS, fotos }));
console.log("cronista-dourado.json:", fs.statSync(path.join(AQUI, "cronista-dourado.json")).size, "bytes");
