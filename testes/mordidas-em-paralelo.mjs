/* AS MORDIDAS EM PARALELO (29/10/2026, a 13.ª sessão) — testes/mordidas-em-paralelo.mjs

   As duas suítes do motor que provam a peça contra o recorte do App
   (teste-motor-pauta-do-turno, teste-motor-pedido-do-turno) passaram do
   relógio do corredor: 139 s e 166 s contra os 120 s que rodar-tudo.mjs dá a
   cada suíte, e o `npm test` ficava vermelho sob carga sem defeito nenhum.
   O perfil (a pauta, 29/10) diz onde: 2/3 do tempo são as MORDIDAS — o
   recorte mordido em dez pontos e o contrato em cinco, cada um sobre 201
   casos, ~34 ms por caso, um atrás do outro numa linha só, com onze núcleos
   parados ao lado.

   Cortar casos tirava mordida (há mordidas que só mudam 2 fotos em 201); o
   relógio maior só escondia o custo. A conta das mordidas é independente
   por natureza — cada caso semeia a casa pelo próprio índice
   (`semearACasa("pauta|" + i)`), e o dourado já é provado sobre recortes de
   casos —, então reparte-se: cada mordida em fatias de casos, as fatias por
   uns poucos trabalhadores (`worker_threads`), e a soma das fotos que
   mudaram é a mesma conta, foto a foto, que a linha única dava. A suíte
   imprime os números de cada mordida como antes: é por eles que se vê que
   morde igual.

   A peça mordida pelo lado de fora (a chamada com a porta ou o estado de
   outro jeito) viaja como o texto da própria função da suíte e é
   reconstruída no trabalhador com os nomes do módulo da peça à mão — a
   suíte continua a escrever a mordida como uma função, à vista.

   Não é suíte (não começa por `teste-`): é o corredor das mordidas, que as
   duas suítes importam. */
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import os from "node:os";

/* quantos trabalhadores, e de que tamanho é a fatia: 4 no máximo (cada um
   carrega o motor inteiro, ~150 módulos), deixando um núcleo ao resto da
   máquina; 50 casos por fatia equilibram mordidas de custo desigual */
export const PARALELO = Object.freeze({ maximo: 4, reserva: 1, fatia: 50 });

/* ---------------- o trabalhador ---------------- */
if (!isMainThread && workerData && workerData.mordidas) {
  const { bloco, caso, peca, nomeDaPeca } = workerData;
  const B = await import(bloco);
  const P = peca ? await import(peca) : {};
  const D = B.lerODourado();
  parentPort.on("message", async (t) => {
    try {
      const casos = t.casos.map((i) => B[caso](i));
      const fn = t.peca ? new Function("M", `with (M) { return (${t.peca}); }`)(P) : t.lado === "peca" ? P[nomeDaPeca] : null;
      const fotos = await B.correrOsCasos(D, { lado: t.lado, trocas: t.trocas || [], peca: fn, casos, opcoes: t.opcoes || {} });
      const n = fotos.reduce((a, f, j) => a + (B.mesmaFoto(B.fotoGuardada(f, casos[j].i), D.fotos[casos[j].i]) ? 0 : 1), 0);
      parentPort.postMessage({ id: t.id, n });
    } catch (e) {
      parentPort.postMessage({ id: t.id, erro: String((e && e.stack) || e) });
    }
  });
}

/* ---------------- o lado da suíte ----------------
   `onde`: { bloco, caso, peca, nomeDaPeca } — o URL do bloco (pauta-bloco ou
   pedido-bloco), o nome da função que faz o caso i, o URL do módulo da peça
   e o nome dela. `mordidas`: [{ lado, trocas?, peca?: função, opcoes?,
   casos: [índices] }]. Devolve, na ordem, quantas fotos cada uma mudou. */
export async function morderEmParalelo(onde, mordidas) {
  const fatias = [];
  mordidas.forEach((m, k) => {
    for (let a = 0; a < m.casos.length; a += PARALELO.fatia) {
      fatias.push({ id: fatias.length, de: k, lado: m.lado, trocas: m.trocas || [], opcoes: m.opcoes || {},
        peca: typeof m.peca === "function" ? m.peca.toString() : null, casos: m.casos.slice(a, a + PARALELO.fatia) });
    }
  });
  const nucleos = typeof os.availableParallelism === "function" ? os.availableParallelism() : os.cpus().length;
  const quantos = Math.max(1, Math.min(PARALELO.maximo, nucleos - PARALELO.reserva, fatias.length));
  const somas = mordidas.map(() => 0);
  let proxima = 0;
  const trabalhadores = Array.from({ length: quantos }, () => new Worker(new URL(import.meta.url), { workerData: { mordidas: true, ...onde } }));
  try {
    await Promise.all(trabalhadores.map((w) => new Promise((ok, falha) => {
      const dar = () => { if (proxima < fatias.length) w.postMessage(fatias[proxima++]); else ok(); };
      w.on("message", (r) => {
        if (r.erro) { falha(new Error(`a mordida ${fatias[r.id].de} estourou no trabalhador: ${r.erro}`)); return; }
        somas[fatias[r.id].de] += r.n;
        dar();
      });
      w.on("error", falha);
      dar();
    })));
  } finally {
    await Promise.all(trabalhadores.map((w) => w.terminate()));
  }
  return somas;
}
