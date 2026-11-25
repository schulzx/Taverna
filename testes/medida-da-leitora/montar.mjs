/* A MEDIDA DA LEITORA — passo 1: monta os itens (frase + resumo da cena + gabarito).

   É medida, não suíte: o nome não começa por teste-/check-/varredura-, e o
   `npm test` não a roda. Nada aqui muda o jogo.

   Gabarito de «pede troca?»:
   · bancada: `ouvido.familia === "trocar"` → sim; `ouvido.familiaNao === "trocar"`
     → não; sem nenhum dos dois (as perguntas de preço, tipo ["nada","cartao"])
     → ambíguo, fica fora da precisão e da revocação.
   · treino: `resposta.familia === "trocar"`.

   O resumo da cena é curto e só ficção do jogo: lugar, quem está, o que o herói
   carrega e quanto tem, o que se vende ali. Para a bancada sai dos estados de
   partida (estados/*.json, a descrição + a ficha do save); para o treino, da
   própria `cena` do item.

   Uso: node testes/medida-da-leitora/montar.mjs   (escreve itens.json) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..", "..");
const BANCADA = path.join(RAIZ, "testes", "bancada-da-troca");

/* as cenas da bancada, escritas a partir de estados/*.json (descrição + personagem do save) */
const CARREGA = "10 rações, 10 odres de água, 5 tochas";
const VENDA_BALANCA = "Cornelius vende rações (7 moedas) e tochas (1 moeda); o armazém O Sino Rachado vende Corda que sempre volta enrolada (50), Dente grande demais para ser de bicho comum (61), Sais Aromáticos (54), Tônico Revigorante (73), Elixir de Vigor (145), Elixir de Intelecto (145)";
export const CENAS_DA_BANCADA = {
  fenda: `Lugar: a Fenda de Névoa, fora dos muros da cidade. Presentes: só a companheira Lavinia Sallow. Herói: Barnabas, monge; tem 63 moedas e carrega Símbolo sagrado riscado, ${CARREGA}. Ninguém vende nada aqui.`,
  lampada: `Lugar: a taverna A Lâmpada dos Sonhos, em Rio do Martelo. Presentes: Mercy Quintus, Tabitha, Charity Mordaunt e a companheira Lavinia Sallow. Herói: Barnabas, monge; tem 63 moedas e carrega Símbolo sagrado riscado, ${CARREGA}. A taverna serve comida e bebida.`,
  balanca: `Lugar: A Balança dos Que Voltaram, o mercado de Rio do Martelo. Presentes: Cornelius e Prudence (comerciantes) e a companheira Lavinia Sallow. Herói: Barnabas, monge; tem 63 moedas e carrega Símbolo sagrado riscado, ${CARREGA}. À venda: ${VENDA_BALANCA}.`,
  "balanca-pobre": `Lugar: A Balança dos Que Voltaram, o mercado de Rio do Martelo. Presentes: Cornelius e Prudence (comerciantes) e a companheira Lavinia Sallow. Herói: Barnabas, monge; tem só 13 moedas e carrega Símbolo sagrado riscado, Corda que sempre volta enrolada, ${CARREGA}. À venda: ${VENDA_BALANCA}.`,
};

/* a cena do treino, em texto */
export function cenaDoTreino(c) {
  const cn = c || {};
  const partes = [];
  partes.push(`Lugar: ${cn.lugar || "?"}${cn.tipo ? ` (${cn.tipo})` : ""}.`);
  const pessoas = (cn.pessoas || []).map((p) => `${p.nome}${p.oficio ? ` (${p.oficio})` : ""}`);
  const h = cn.heroi || {};
  if (h.companheiro) pessoas.push(`a companheira/o companheiro ${h.companheiro}`);
  partes.push(`Presentes: ${pessoas.length ? pessoas.join(", ") : "ninguém"}.`);
  if ((cn.ausentes || []).length) partes.push(`Ausentes: ${cn.ausentes.join(", ")}.`);
  if ((cn.mortos || []).length) partes.push(`Mortos: ${cn.mortos.join(", ")}.`);
  partes.push(`Herói: tem ${h.moeda == null ? "?" : h.moeda} moedas e carrega ${(h.carrega || []).join(", ") || "nada"}.`);
  const venda = (cn.pessoas || []).filter((p) => (p.vende || []).length).map((p) => `${p.nome} vende ${p.vende.map((v) => `${v.item} (${v.preco})`).join(", ")}`);
  partes.push(venda.length ? `À venda: ${venda.join("; ")}.` : "Ninguém vende nada aqui.");
  if ((cn.coisas || []).length) partes.push(`Coisas à vista: ${cn.coisas.join(", ")}.`);
  return partes.join(" ");
}

const LOTES = [
  { conjunto: "bancada-98", arquivo: "frases.json" },
  { conjunto: "novas-50", arquivo: "frases-novas.json" },
  { conjunto: "ineditas-60", arquivo: "frases-ineditas-3.json" },
  { conjunto: "posse-10", arquivo: "frases-da-posse.json" },
];

export function montar() {
  const itens = [];
  for (const l of LOTES) {
    const { frases } = JSON.parse(fs.readFileSync(path.join(BANCADA, l.arquivo), "utf8"));
    for (const f of frases) {
      const o = f.ouvido || {};
      const troca = o.familia === "trocar" ? true : o.familiaNao === "trocar" ? false : null;
      let cena = CENAS_DA_BANCADA[f.estado];
      if ((f.antes || []).length) cena += ` Antes, o jogador disse: «${f.antes.join("», «")}».`;
      itens.push({ id: f.id, conjunto: l.conjunto, frase: f.frase, cena, troca, familia: null, estado: f.estado, discutivel: !!f.discutivel });
    }
  }
  const treino = JSON.parse(fs.readFileSync(path.join(RAIZ, "testes", "treino-das-intencoes.json"), "utf8"));
  for (const it of treino.itens) {
    itens.push({ id: it.id, conjunto: "treino-150", frase: it.frase, cena: cenaDoTreino(it.cena), troca: it.resposta.familia === "trocar", familia: it.resposta.familia });
  }
  return itens;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const itens = montar();
  fs.writeFileSync(path.join(AQUI, "itens.json"), JSON.stringify(itens, null, 1) + "\n");
  const n = {};
  for (const i of itens) n[i.conjunto] = (n[i.conjunto] || 0) + 1;
  console.log(itens.length, "itens", JSON.stringify(n));
}
