/* O EXAME DAS INTENÇÕES (22/11/2026) — testes/exame-das-intencoes.json (selado)
   e testes/treino-das-intencoes.json (aberto)

   A régua fixa do «ouvido»: para cada frase livre, de que família de ação ela
   é e o que ela nomeia. Esta suíte NÃO julga leitor nenhum; ela só prova que
   a régua está inteira — as contagens, os campos, as listas fechadas, os nomes
   que existem na cena, e a distribuição que o pedido fixou:
   §1 os dois arquivos abrem e têm 350 e 150 itens;
   §2 todo item tem os campos e os valores das listas fechadas;
   §3 `quem` existe na cena (presente, ausente ou morto) e o motivo bate com ele;
   §4 nenhuma frase repete, nem dentro de um arquivo nem entre os dois;
   §5 a distribuição (metade troca, os 12 subtipos, os vereditos, o quinto de
      frases que parecem troca e não são, 60% com armadilha) vale em cada arquivo.

   Convenção da quantia: o número dito na frase, por algarismo ou por extenso;
   «uma moeda» conta (1), «uma cerveja» não. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

let bons = 0, maus = 0;
const t = (n, c, extra) => { if (c) { bons++; console.log("  ok  " + n); } else { maus++; console.log("  XX  " + n + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);

const aqui = dirname(fileURLToPath(import.meta.url));
const abre = (nome) => { try { return JSON.parse(readFileSync(join(aqui, nome), "utf8")); } catch (e) { return { erro: String(e) }; } };

const FAMILIAS = ["falar", "convencer", "olhar", "mover", "trocar", "usar", "agir", "lutar", "esperar", "perguntar_ao_mestre"];
const SUBTIPOS = ["comprar", "vender", "pagar", "dar", "pedir", "pegar", "furtar", "emprestar", "devolver", "subornar", "escambo", "cobrar"];
const VEREDITOS = ["sim", "sim_com_preco", "dado", "pergunta", "nao"];
const MOTIVOS = ["ausente", "morto", "sem_moeda", "nao_tem", "nao_vende", "falta_quem", "falta_o_que", "dois_com_o_nome", "ninguem_aqui"];
const ARMADILHAS = ["mencao_sem_troca", "duas_acoes", "pergunta_de_preco", "condicional", "negacao", "fala_entre_aspas", "giria", "sem_acento_ou_erro", "nome_parcial", "homonimo", "alvo_ausente", "alvo_morto", "verbo_raro", "pronome", "quantia_por_extenso"];
const PARECE_TROCA = ["mencao_sem_troca", "pergunta_de_preco", "condicional", "negacao"];
const ARQUIVOS = [["exame-das-intencoes.json", 350, "E"], ["treino-das-intencoes.json", 150, "T"]];

const dados = {};
for (const [nome] of ARQUIVOS) dados[nome] = abre(nome);

sec("§1 os dois arquivos abrem e têm as contagens");
for (const [nome, n] of ARQUIVOS) {
  const d = dados[nome];
  t(nome + " abre", !d.erro && Array.isArray(d.itens), d.erro);
  t(nome + " tem " + n + " itens", (d.itens || []).length === n, String((d.itens || []).length));
}
t("o exame é selado e o treino é aberto", dados["exame-das-intencoes.json"].selado === true && dados["treino-das-intencoes.json"].selado === false);

const nomesDaCena = (c) => [...(c.pessoas || []).map((p) => p.nome), ...(c.ausentes || []), ...(c.mortos || [])];
const ehTexto = (x) => typeof x === "string" && x.trim().length > 0;

sec("§2 campos e listas fechadas");
for (const [nome, , pre] of ARQUIVOS) {
  const itens = dados[nome].itens || [];
  const ids = new Set();
  const erros = [];
  for (const it of itens) {
    const r = it.resposta || {}, c = it.cena || {}, h = c.heroi || {};
    const e = (m) => erros.push(it.id + ": " + m);
    if (!ehTexto(it.id) || !it.id.startsWith(pre + "-")) e("id");
    if (ids.has(it.id)) e("id repetido"); ids.add(it.id);
    if (!ehTexto(it.frase)) e("frase");
    if (!ehTexto(it.nota)) e("nota");
    if (!ehTexto(c.lugar) || !ehTexto(c.tipo)) e("lugar/tipo");
    if (!Array.isArray(c.pessoas) || !Array.isArray(c.ausentes) || !Array.isArray(c.mortos) || !Array.isArray(c.coisas)) e("listas da cena");
    for (const p of c.pessoas || []) {
      if (!ehTexto(p.nome) || !ehTexto(p.oficio)) e("pessoa sem nome ou ofício");
      if (p.vende !== null && !(Array.isArray(p.vende) && p.vende.every((v) => ehTexto(v.item) && Number.isInteger(v.preco) && v.preco > 0))) e("vende malformado em " + p.nome);
    }
    if (!Number.isInteger(h.moeda) || h.moeda < 0 || !Array.isArray(h.carrega) || !(h.companheiro === null || ehTexto(h.companheiro))) e("herói");
    if (!FAMILIAS.includes(r.familia)) e("família " + r.familia);
    if (r.familia === "trocar") { if (!SUBTIPOS.includes(r.subtipo)) e("subtipo " + r.subtipo); } else if (r.subtipo !== null) e("subtipo fora de trocar");
    if (r.familia === "trocar" || r.familia === "usar") { if (!VEREDITOS.includes(r.veredito)) e("veredito " + r.veredito); } else if (r.veredito !== null) e("veredito fora de trocar/usar");
    if (r.motivo !== null) {
      if (!MOTIVOS.includes(r.motivo)) e("motivo " + r.motivo);
      if (!["nao", "pergunta"].includes(r.veredito)) e("motivo sem nao/pergunta");
    } else if (["nao", "pergunta"].includes(r.veredito)) e("nao/pergunta sem motivo");
    if (!(r.quem === null || ehTexto(r.quem))) e("quem");
    if (!(r.coisa === null || ehTexto(r.coisa))) e("coisa");
    if (!(r.quantia === null || (Number.isInteger(r.quantia) && r.quantia > 0))) e("quantia");
    if (!(it.armadilha === null || ARMADILHAS.includes(it.armadilha))) e("armadilha " + it.armadilha);
  }
  t(nome + ": todo item tem campos e valores das listas fechadas", erros.length === 0, erros.slice(0, 5).join(" | "));
}

sec("§3 `quem` existe na cena e o motivo bate");
for (const [nome] of ARQUIVOS) {
  const itens = dados[nome].itens || [];
  const erros = [];
  for (const it of itens) {
    const r = it.resposta, c = it.cena;
    const e = (m) => erros.push(it.id + " «" + it.frase + "»: " + m);
    if (r.quem !== null && !nomesDaCena(c).includes(r.quem)) e("quem «" + r.quem + "» não está na cena");
    if (r.motivo === "ausente" && !c.ausentes.includes(r.quem)) e("ausente sem quem ausente");
    if (r.motivo === "morto" && !c.mortos.includes(r.quem)) e("morto sem quem morto");
    if (["falta_quem", "dois_com_o_nome"].includes(r.motivo) && r.quem !== null) e(r.motivo + " com quem preenchido");
    if (r.motivo === "ninguem_aqui" && c.pessoas.length > 0) e("ninguem_aqui com gente na cena");
    if (r.motivo === "nao_tem" && r.coisa !== null && c.heroi.carrega.includes(r.coisa)) e("nao_tem de coisa que o herói carrega");
    if (r.motivo === "sem_moeda" && c.heroi.moeda >= 50) e("sem_moeda com herói rico");
    if (r.motivo === "nao_vende" && r.coisa !== null && c.pessoas.some((p) => (p.vende || []).some((v) => v.item === r.coisa) && (r.quem === null || p.nome === r.quem))) e("nao_vende de coisa que alguém vende");
    if (it.armadilha === "alvo_ausente" && (r.quem === null || !c.ausentes.includes(r.quem))) e("alvo_ausente sem ausente");
    if (it.armadilha === "alvo_morto" && (r.quem === null || !c.mortos.includes(r.quem))) e("alvo_morto sem morto");
  }
  t(nome + ": quem existe, motivo e armadilha batem com a cena", erros.length === 0, erros.slice(0, 4).join(" | "));
}

sec("§4 nenhuma frase repete");
{
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  const todas = [];
  for (const [nome] of ARQUIVOS) {
    const itens = dados[nome].itens || [];
    const vistas = new Set(); let rep = 0;
    for (const it of itens) { const k = norm(it.frase); if (vistas.has(k)) rep++; vistas.add(k); todas.push(...[k]); }
    t(nome + ": sem frase repetida dentro do arquivo", rep === 0, rep + " repetida(s)");
  }
  const ex = new Set((dados["exame-das-intencoes.json"].itens || []).map((i) => norm(i.frase)));
  const cruz = (dados["treino-das-intencoes.json"].itens || []).filter((i) => ex.has(norm(i.frase))).length;
  t("nenhuma frase do treino está no exame", cruz === 0, cruz + " em comum");
}

sec("§5 a distribuição vale em cada arquivo");
for (const [nome] of ARQUIVOS) {
  const itens = dados[nome].itens || [];
  const N = itens.length || 1;
  const tr = itens.filter((i) => i.resposta.familia === "trocar");
  const pc = (n, d) => (100 * n) / d;
  t(nome + ": a troca é a metade (45% a 55%)", pc(tr.length, N) >= 45 && pc(tr.length, N) <= 55, pc(tr.length, N).toFixed(1) + "%");
  for (const s of SUBTIPOS) {
    const n = tr.filter((i) => i.resposta.subtipo === s).length;
    t(nome + ": " + s + " tem pelo menos 6% das trocas", pc(n, tr.length) >= 6, pc(n, tr.length).toFixed(1) + "%");
  }
  const ver = (v) => tr.filter((i) => i.resposta.veredito === v).length;
  t(nome + ": nao é pelo menos 15% das trocas", pc(ver("nao"), tr.length) >= 15, pc(ver("nao"), tr.length).toFixed(1) + "%");
  t(nome + ": pergunta é pelo menos 15% das trocas", pc(ver("pergunta"), tr.length) >= 15, pc(ver("pergunta"), tr.length).toFixed(1) + "%");
  t(nome + ": dado é pelo menos 10% das trocas", pc(ver("dado"), tr.length) >= 10, pc(ver("dado"), tr.length).toFixed(1) + "%");
  t(nome + ": sim e sim_com_preco existem", ver("sim") > 0 && ver("sim_com_preco") > 0);
  const pt = itens.filter((i) => PARECE_TROCA.includes(i.armadilha));
  t(nome + ": o quinto que parece troca e não é (18% a 22%)", pc(pt.length, N) >= 18 && pc(pt.length, N) <= 22, pc(pt.length, N).toFixed(1) + "%");
  t(nome + ": nenhum dos que parecem troca é da família trocar", pt.every((i) => i.resposta.familia !== "trocar"));
  const nf = (f) => itens.filter((i) => i.resposta.familia === f && !PARECE_TROCA.includes(i.armadilha)).length;
  for (const f of FAMILIAS.filter((x) => x !== "trocar")) t(nome + ": a família " + f + " aparece fora do quinto", nf(f) >= 3, String(nf(f)));
  const com = itens.filter((i) => i.armadilha !== null).length;
  t(nome + ": pelo menos 60% com armadilha", pc(com, N) >= 60, pc(com, N).toFixed(1) + "%");
  const tipos = new Set(itens.map((i) => i.cena.tipo));
  t(nome + ": cenas variadas (pelo menos 12 tipos)", tipos.size >= 12, String(tipos.size));
  t(nome + ": há cena de ermo sem ninguém e cena com morto", itens.some((i) => i.cena.pessoas.length === 0) && itens.some((i) => i.cena.mortos.length > 0));
}

console.log("\n" + bons + " ok, " + maus + " XX");
process.exit(maus ? 1 : 0);
