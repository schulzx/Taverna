/* Taverna v6.9 — CRÔNICA EXPORTÁVEL (código, zero tokens).
   Monta um documento Markdown da saga inteira a partir dos REGISTROS do
   app: herói, feitos, cicatrizes, companheiros, domínios, pessoas, números.
   Nada é resumido pela IA — é a memória de verdade, formatada. */

import { dataTxt, mesDe, estacaoDe } from "./calendario.js";
import { patamarFama, calcularFama } from "./fama.js";
import { marcoDe } from "./vinculos.js";
import { relacaoNPC } from "./npcs.js";
import { conquistaPorId } from "./conquistas.js";
import { RARIDADE_ROTULO } from "./loot.js";
import { chamadoDaRaca, chamadoDaProfissao } from "./lexico.js";

const linha = (s = "") => `${s}\n`;

export function gerarCronica({ nomeCampanha, mundo, personagem: p, conquistasIds, contadores: c, npcs, mapa, faccaoJogador, guilda, reino, dia, nemesis, tituloAtivo, descobertas }) {
  const fama = Math.round(calcularFama(c || {}, p.nivel || 1, ((mapa || {}).cidades || []).filter((x) => x.relacao === "jogador").length));
  const pf = patamarFama(fama);
  const dominios = ((mapa || {}).cidades || []).filter((x) => x.relacao === "jogador");
  const g = guilda || { nivel: 1, cofre: 0 };

  let md = "";
  md += linha(`# 📜 A Crônica de ${p.nome}`);
  md += linha();
  md += linha(`*${nomeCampanha} · ${(mundo || {}).genero}*`);
  md += linha(`*Registrada em ${dataTxt(dia)} de ${mesDe(dia)} — dia ${dia} da campanha, ${estacaoDe(dia).nome.toLowerCase()}*`);
  md += linha();
  md += linha(`---`);
  md += linha();

  /* HERÓI */
  md += linha(`## O Herói`);
  md += linha();
  md += linha(`**${p.nome}**${tituloAtivo ? `, ❝ ${tituloAtivo} ❞` : ""} — ${p.conceito || "aventureiro"}.`);
  md += linha();
  const caminho = [chamadoDaRaca((mundo || {}).lexico, p.raca), p.classe, p.subclasse].filter(Boolean).join(" · ");
  md += linha(`- **Nível** ${p.nivel || 1}${p.antecedente ? ` · **Antecedente:** ${p.antecedente}` : ""}${caminho ? ` · **Caminho:** ${caminho}` : ""}${p.profissao ? ` · ${chamadoDaProfissao((mundo || {}).lexico, p.profissao)}` : ""}`);
  md += linha(`- **Fama:** ${fama}/100 — ${pf.rotulo} (${pf.nota})`);
  if ((p.cicatrizes || []).length) {
    md += linha(`- **Cicatrizes:**`);
    p.cicatrizes.forEach((x) => md += linha(`  - ${x.nome}${x.dia ? ` — desde o dia ${x.dia}` : ""}${x.vidaMax ? ` (−${-x.vidaMax} PV)` : ""}. *${x.descricao}*`));
  }
  md += linha();

  /* COMPANHEIROS */
  if ((p.grupo || []).length) {
    md += linha(`## Os Companheiros`);
    md += linha();
    p.grupo.forEach((m2) => {
      const marco = marcoDe(m2.vinculo ?? 10) || { icone: "·", nome: "Conhecido(a)" };
      md += linha(`- **${m2.nome}**${[m2.classe, m2.subclasse].filter(Boolean).length ? ` (${[m2.classe, m2.subclasse].filter(Boolean).join(" · ")})` : ""}, nível ${m2.nivel || 1} — ${marco.icone} ${marco.nome}${m2.descricao ? `. *${m2.descricao}*` : ""}`);
    });
    md += linha();
  }

  /* FEITOS (conquistas desbloqueadas) */
  const feitos = (conquistasIds || []).map(conquistaPorId).filter(Boolean);
  if (feitos.length) {
    md += linha(`## Os Feitos (${feitos.length})`);
    md += linha();
    feitos.forEach((f) => md += linha(`- ${f.icone} **${f.nome}**${f.titulo ? ` — título: ❝ ${f.titulo} ❞` : ""}`));
    md += linha();
  }

  /* NÚMEROS DA SAGA */
  md += linha(`## Os Números da Saga`);
  md += linha();
  const nums = [
    ["Dias de campanha", dia], ["Inimigos derrotados", c.inimigosDerrotados], ["Elites derrotados", c.elitesDerrotados],
    ["Lendários derrotados", c.lendariosDerrotados], ["Combates vencidos", c.combatesVencidos],
    ["Masmorras concluídas", c.masmorrasConcluidas], ["Contratos cumpridos", c.contratosConcluidos],
    ["Decretos pregados", c.decretosPregados], ["Decretos cumpridos", c.decretosCumpridos],
    ["Viagens", c.viagens], ["Quase-morte", c.quaseMorte], ["Itens forjados", c.forjados],
    ["Criaturas catalogadas", (descobertas || []).length],
  ].filter(([, v]) => v);
  nums.forEach(([k, v]) => md += linha(`- ${k}: **${v}**`));
  md += linha();

  /* DOMÍNIOS */
  if (dominios.length || faccaoJogador) {
    md += linha(`## O Domínio`);
    md += linha();
    if (faccaoJogador) md += linha(`**${faccaoJogador}** — guilda nível ${g.nivel} · cofre de ◉ ${g.cofre}.`);
    md += linha();
    dominios.forEach((d) => {
      const v = (reino || {})[d.nome];
      md += linha(`- **${d.nome}** (${d.tipo || "cidade"}${d.sede ? ", sede" : ""})${v ? ` — ${v.populacao.toLocaleString("pt-BR")} almas, felicidade ${v.felicidade}/100` : ""}`);
    });
    md += linha();
  }

  /* NÊMESIS */
  if (nemesis) {
    md += linha(`## A Sombra`);
    md += linha();
    md += linha(`**${nemesis.nome}**, ${nemesis.titulo} — ${nemesis.motivo}. ${nemesis.status === "derrotada" ? "*Derrotada. A perseguição acabou.*" : `Ódio: ${nemesis.odio}/100. *Ainda à espreita…*`}`);
    md += linha();
  }

  /* PESSOAS */
  const pessoas = Object.values(npcs || {}).sort((a, b) => (a.conhecidoEm ?? 9999) - (b.conhecidoEm ?? 9999));
  if (pessoas.length) {
    md += linha(`## As Pessoas (${pessoas.length})`);
    md += linha();
    pessoas.slice(0, 40).forEach((n) => {
      const rel = relacaoNPC(n.relacao).rotulo;
      const morto = (n.status || "").toLowerCase().includes("morto");
      md += linha(`- **${n.nome}**${morto ? " ☠" : ""} — ${[n.papel, rel !== "Desconhecido" ? rel.toLowerCase() : "", n.local ? `em ${n.local}` : "", n.conhecidoEm != null ? (n.conhecidoEm > 0 ? `conhecido(a) no dia ${n.conhecidoEm}` : "antes do dia 1") : ""].filter(Boolean).join(" · ")}`);
    });
    if (pessoas.length > 40) md += linha(`- *…e mais ${pessoas.length - 40} almas.*`);
    md += linha();
  }

  md += linha(`---`);
  md += linha();
  md += linha(`*Crônica gerada pelo Taverna v6.9 — cada número veio dos registros da campanha, nada foi inventado.*`);
  return md;
}
