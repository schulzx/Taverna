/* Uma campanha de sessenta dias, para ver o Cobrador do lado de fora.
   Não é teste: é olhar. Um número verde não diz se o mundo parece vivo. */
import { consultarCobrador, linhaDoMundo } from "../src/cobrador.js";
import { garantirLinha, anotar, podar } from "../src/registro.js";

const ATOS_POSSIVEIS = [
  { ato: "feri", oQue: "matei o capanga na porta da estalagem", peso: 2, publico: true },
  { ato: "ajudei", oQue: "paguei o remédio do filho da Marta", peso: 2, quem: ["Marta"] },
  { ato: "menti", oQue: "disse ao guarda que não vi ninguém", peso: 1, viu: ["Ubba"] },
  { ato: "paguei", oQue: "dei moedas ao carcereiro para ele olhar o outro lado", peso: 2, suborno: true },
  { ato: "ignorei", oQue: "passei direto pelo homem que pedia ajuda", peso: 1, alguemPrecisava: true },
  { ato: "feri", oQue: "poupei o último e mandei embora", peso: 2, poupei: true },
  { ato: "revelei", oQue: "contei a Ubba de onde eu venho", peso: 2, viu: ["Ubba"] },
  { ato: "ameacei", oQue: "encostei a lâmina no pescoço do agiota", peso: 2, quem: ["Doran"], publico: true },
  { ato: "cheguei", oQue: "cheguei em Porto Nova", peso: 0 },
  { ato: "pedi", oQue: "perguntei pelo nome do homem de capuz", peso: 1 },
  { ato: "feri", oQue: "corri quando o segundo apareceu", peso: 2, fugi: true, viu: ["Ubba", "Marta"] },
  { ato: "acusei", oQue: "disse na praça que foi o irmão dele", peso: 2, publico: true, viu: ["Doran", "Marta"] },
];

let registro = [];
let cobradas = [], formas = [], ultima = -99, turno = 0;
const LUGARES = ["no Escudo das Velas", "na praça de Porto Nova", "na estrada do sul", "na forja de Doran"];
let semente = 12345;
const rnd = () => (semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648;

console.log("=== SESSENTA DIAS ===\n");
for (let dia = 1; dia <= 60; dia++) {
  /* dois ou três atos por dia */
  const quantos = 2 + Math.floor(rnd() * 2);
  for (let k = 0; k < quantos; k++) {
    const a = ATOS_POSSIVEIS[Math.floor(rnd() * ATOS_POSSIVEIS.length)];
    turno += 1;
    registro = anotar(registro, garantirLinha({
      t: turno, dia, onde: LUGARES[Math.floor(rnd() * LUGARES.length)],
      quem: a.quem || [], viu: a.viu || [], ...a,
    }));
  }
  registro = podar(registro, { dia });

  const r = consultarCobrador(registro, {
    dia, cobradas, ultimaCobranca: ultima, ultimasFormas: formas,
    fama: Math.min(80, dia), temGente: rnd() < 0.7, publico: rnd() < 0.4,
  });
  if (r) {
    cobradas.push(r.chave);
    ultima = dia; formas = [...formas, r.cobranca.id].slice(-6);
    const sinal = r.cobranca.sinal > 0 ? "  a favor" : r.cobranca.sinal < 0 ? "  contra " : "  neutro ";
    console.log(`dia ${String(dia).padStart(2)}${sinal} ${linhaDoMundo(r)}`);
  }
}
console.log(`\n${registro.length} linhas no registro · ${cobradas.length} cobranças em 60 dias`);
