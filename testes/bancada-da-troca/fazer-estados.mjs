/* FAZ OS ESTADOS DE PARTIDA a partir do save real (estados/fenda.json).
   Nada de campo de save escrito à mão: cada estado nasce ANDANDO COM OS
   BOTÕES DO PRÓPRIO JOGO (frase + confirmar o cartão), com o Narrador de
   mentira, e sai exportado do localStorage — o mesmo que o jogador teria.

     fenda          (origem, o save real)        a Fenda de Névoa: ninguém em cena
       └ lampada    «vou até a Lâmpada dos Sonhos»   a taverna: Mercy Quintus, Tabitha, Charity Mordaunt
           └ balanca    «vou ao mercado»             A Balança dos Que Voltaram: Cornelius, Prudence, e o mercado (O Sino Rachado)
               └ balanca-pobre  «compro uma corda»    o herói com a corda e só ◉ 13

   Uso: node fazer-estados.mjs   (reescreve estados/lampada|balanca|balanca-pobre.json) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { subir } from "./infra.mjs";
import { abrirPagina } from "./cdp.mjs";
import * as M from "./motorista.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const lerEstado = (n) => JSON.parse(fs.readFileSync(path.join(AQUI, "estados", n + ".json"), "utf8"));

const PASSOS = [
  { nome: "lampada", de: "fenda", frase: "vou até a Lâmpada dos Sonhos", descricao: "A taverna A Lâmpada dos Sonhos, em Rio do Martelo: Mercy Quintus, Tabitha e Charity Mordaunt em cena, a companheira Lavinia Sallow. ◉ 63, na bolsa só o Símbolo sagrado riscado." },
  { nome: "balanca", de: "lampada", frase: "vou ao mercado", descricao: "A Balança dos Que Voltaram, o mercado de Rio do Martelo: Cornelius e Prudence em cena, Lavinia ao lado; o armazém O Sino Rachado vende (Corda, Dente, Sais Aromáticos, Tônico, dois Elixires). ◉ 63." },
  { nome: "balanca-pobre", de: "balanca", frase: "compro uma corda", descricao: "A mesma Balança, com o herói já com a Corda que sempre volta enrolada e só ◉ 13 (para as frases de «não chega»)." },
];

const s = await subir({ log: (m) => console.error(m) });
try {
  const pag = await abrirPagina(s.portaCdp);
  await pag.scriptNoCarregar(M.FONTE_DA_SEMENTE);
  for (const p of PASSOS) {
    await M.restaurar(pag, s.portaVite, lerEstado(p.de));
    await M.digitar(pag, p.frase);
    await M.esperarFim(pag);
    const r = await M.abrirProposta(pag);
    const c = await M.confirmarProposta(pag);
    await M.esperarFim(pag);
    await M.dorme(2500); /* o autosave */
    const ls = JSON.parse(await pag.avaliar(`(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return JSON.stringify(o)})()`));
    const f = await M.ficha(pag);
    fs.writeFileSync(path.join(AQUI, "estados", p.nome + ".json"), JSON.stringify({ nome: p.nome, descricao: p.descricao, receita: `de «${p.de}»: digitar «${p.frase}» e confirmar o cartão (${c})`, ls }));
    console.log(p.nome, "|", c, "|", f.lugar, "◉" + f.moedas, JSON.stringify(f.inv), "em cena:", await M.emCena(pag));
  }
  pag.fechar();
} finally { await s.parar(); }
process.exit(0);
