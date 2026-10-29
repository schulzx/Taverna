/* replay.mjs (Fase T3, trilha B · 28/10/2026) — a sessão como arquivo, corrida outra vez

   Lê um arquivo de sessão (src/sessao.js: a semente, o save inicial e, por
   turno, a frase, a sorte, o pedido, as respostas cruas do Narrador e do
   Cronista, o veredito do Juiz e o estado do fim do turno), corre o motor
   turno a turno com as respostas gravadas — sem React, sem rede, sem IA — e
   diz, turno a turno, se o estado saiu igual ao gravado; onde não saiu, o
   campo, os dois valores e de quem é a culpa — o DEFEITO do motor, ou a
   DÍVIDA do App (um campo que um órgão do App ainda escreve, em
   `AINDA_DO_APP`, ou o que a linha diz que o App fez naquele turno), que se
   conta à parte.

   uso: node testes/replay.mjs <arquivo.json> [--encadeado] [--ver] [--resumo] [--anterior]
     --encadeado  parte só do save inicial e nunca se ressincroniza (a
                  corrida inteira; por omissão cada turno parte do estado
                  gravado do anterior, e cada divergência diz a sua culpa)
     --ver        mostra também os turnos que reproduzem
     --resumo     em vez do turno a turno, o resumo para uma pessoa ler
                  (sessao.js#resumoDaSessao): quantos reproduzem, os
                  defeitos do motor turno a turno, a dívida do App e o
                  veredito do Juiz somado — as invenções da prosa por classe
     --anterior   corre a página de antes, a que o arquivo guardado leva
                  dentro quando virou a página (sessao-guardada.js,
                  paginasDaSessao); sem a flag, a de agora

   sai com 0 quando o motor não tem defeito (a dívida do App não conta: ela
   diverge sempre, e é a tabela que a vigia), 2 quando tem, 1 quando o
   arquivo não é válido (ou não abre).

   Os arquivos das sessões de prova (testes/sessao-s8.json, -s9, -s10) são
   escritos por `node testes/gravar-sessoes-de-prova.mjs --escrever`, a
   partir dos registos; `testes/sessao-navegador.json` foi gravado pelo jogo. */
import fs from "node:fs";
import { reproduzirASessao, resumoDaSessao, AINDA_DO_APP } from "../src/sessao.js";
import { paginasDaSessao } from "../src/sessao-guardada.js";

const args = process.argv.slice(2);
const caminho = args.find((a) => !a.startsWith("--"));
const ENCADEADO = args.includes("--encadeado"), VER = args.includes("--ver"), RESUMO = args.includes("--resumo"), ANTERIOR = args.includes("--anterior");
if (!caminho) { console.log("uso: node testes/replay.mjs <arquivo.json> [--encadeado] [--ver] [--resumo] [--anterior]"); process.exit(1); }

let arquivo;
try { arquivo = JSON.parse(fs.readFileSync(caminho, "utf8")); } catch (e) { console.log(`não abre ${caminho}: ${e.message}`); process.exit(1); }
{
  /* a página que virou diz que página é, e o que ficou para trás */
  const paginas = paginasDaSessao(arquivo), v = arquivo && arquivo.virada;
  if (v) console.log(`página ${v.pagina} da sessão: ${v.turnosAntes} turnos gravados antes dela, ${paginas.length > 1 ? "a de antes vem junta" : "a de antes não veio"}${v.cortou ? `, e ${v.cortou} já não estão em parte nenhuma` : ""}.`);
  if (ANTERIOR) {
    if (paginas.length < 2) { console.log(`${caminho}: não traz a página de antes`); process.exit(1); }
    arquivo = paginas[0];
  } else arquivo = paginas[paginas.length - 1] || arquivo;
}

const r = reproduzirASessao(arquivo, { encadeado: ENCADEADO });
if (!r.valido) {
  console.log(`${caminho}: o arquivo não é válido (${r.erros.length} erro${r.erros.length === 1 ? "" : "s"})`);
  for (const e of r.erros.slice(0, 30)) console.log(`  ${e.caminho || "(o arquivo)"}: ${e.motivo}`);
  process.exit(1);
}

console.log(`${caminho}${arquivo.origem ? ` — ${arquivo.origem}` : ""}`);
if (RESUMO) { resumir(); process.exit(r.defeitos.length ? 2 : 0); }
console.log(`semente ${arquivo.semente} · ${r.turnos.length} turnos · ${ENCADEADO ? "encadeado (a partir do save inicial)" : "turno a turno (cada um a partir do gravado anterior)"}\n`);
for (const t of r.turnos) {
  if (t.igual) { if (VER) console.log(`  ${String(t.n).padStart(3)}  igual${t.app ? " (com a ajuda declarada do App: " + t.app.map((a) => a.orgao).join("; ") + ")" : ""}`); continue; }
  console.log(`  ${String(t.n).padStart(3)}  ${t.defeito ? "DIVERGE (defeito do motor)" : "diverge só na dívida do App"}`);
  for (const d of t.diferencas) console.log(`         ${d.caminho}: gravado ${d.gravado} · replay ${d.reproduzido}`);
  if (t.cronista && !t.cronista.igual) console.log(`         o juízo do Cronista: gravado ${t.cronista.gravado} · replay ${t.cronista.reproduzido}`);
  for (const d of t.divida) console.log(`         dívida (${d.de}) — ${d.campo}: ${d.caminhos.join(", ")}`);
  for (const p of t.porque) console.log(`         porquê — ${p}`);
}
const devendo = r.divida.campos.filter((d) => d.turnos.length);
console.log(`\n${r.reproduzidos} de ${r.turnos.length} turnos reproduzem${r.primeira ? `; a primeira divergência é no turno ${r.primeira}` : ""}.`);
console.log(`o motor: ${r.defeitos.length ? `DEFEITO em ${r.defeitos.length} turno${r.defeitos.length === 1 ? "" : "s"} (${r.defeitos.join(", ")})` : "nenhum defeito"}; joga sozinho ${r.soOMotor} de ${r.turnos.length}.`);
console.log(`a dívida do App: ${devendo.length} campo${devendo.length === 1 ? "" : "s"} da tabela${devendo.length ? " (" + devendo.map((d) => d.campo).join(", ") + ")" : ""}, e ${r.divida.doTurno.length} turno${r.divida.doTurno.length === 1 ? "" : "s"} em que a linha diz o que o App fez.`);
process.exit(r.defeitos.length ? 2 : 0);

/* ---------------- o resumo, para uma pessoa ler ---------------- */
function resumir() {
  const R = resumoDaSessao(arquivo, r);
  const s = (n, um, muitos) => `${n} ${n === 1 ? um : muitos}`;
  const NOME = { preco: "preço", distancia: "distância", pessoa: "pessoa nova", nome: "nome novo", lugar: "lugar novo", pauta: "pedido da pauta esquecido" };
  console.log(`semente ${arquivo.semente} · ${s(R.turnos, "turno", "turnos")} · ${ENCADEADO ? "encadeado (a partir do save inicial)" : "turno a turno"}\n`);

  console.log("O QUE REPRODUZ");
  console.log(`  ${R.reproduzidos} de ${R.turnos} saem iguais em tudo; o motor joga ${R.soOMotor} sozinho, sem nenhum órgão do App.`);
  if (R.reproduzidos > R.soOMotor) console.log(`  (${s(R.reproduzidos - R.soOMotor, "reproduz", "reproduzem")} com a ajuda declarada do App: ver a dívida.)`);

  console.log("\nO MOTOR");
  if (!R.defeitos.length) console.log("  nenhum defeito: tudo o que diverge é dívida do App.");
  else {
    console.log(`  DEFEITO em ${s(R.defeitos.length, "turno", "turnos")}:`);
    for (const d of R.defeitos) {
      console.log(`  turno ${d.n}`);
      for (const x of d.diferencas) console.log(`      ${x.caminho}: gravado ${x.gravado} · replay ${x.reproduzido}`);
      if (d.cronista) console.log(`      o juízo do Cronista: gravado ${d.cronista.gravado} · replay ${d.cronista.reproduzido}`);
      for (const p of d.porque) console.log(`      porquê — ${p}`);
    }
  }

  console.log("\nA DÍVIDA DO APP (não é defeito: é a parte do turno que ainda mora no App)");
  const tabela = R.divida.campos;
  console.log(`  da tabela (AINDA_DO_APP, ${s(AINDA_DO_APP.length, "campo", "campos")} hoje): ${tabela.length ? s(tabela.length, "diverge nesta sessão", "divergem nesta sessão") : "nenhum diverge nesta sessão"}`);
  for (const d of tabela) console.log(`    ${d.campo.padEnd(14)} turnos ${d.turnos.join(", ").padEnd(10)} ${d.orgao}`);
  const linha = R.divida.doTurno;
  console.log(`  das linhas (o que o App fez no turno, declarado por quem gravou): ${linha.length ? s(linha.length, "turno", "turnos") : "nenhum"}`);
  for (const d of linha) console.log(`    turno ${String(d.n).padEnd(4)} ${d.divergiu ? "diverge " : "reproduz"}  ${d.orgao}${d.campos.length ? " — " + d.campos.join(", ") : ""}`);

  console.log("\nO JUIZ (o que a prosa do Narrador inventou, somado)");
  const J = R.juiz;
  if (!J.julgados) console.log("  nenhum turno traz o veredito do Juiz.");
  else {
    console.log(`  ${s(J.julgados, "turno julgado", "turnos julgados")}: ${J.limpos} limpos, ${s(J.achados, "achado", "achados")}`);
    console.log(`  por classe: ${Object.entries(J.por).map(([k, v]) => `${NOME[k] || k} ${v}`).join(" · ")}`);
    if (J.pauta) console.log(`  a pauta: ${J.pauta.cumpridos} de ${J.pauta.total} pedidos cumpridos`);
    console.log(`  julgado outra vez sobre a entrada gravada, o veredito sai igual em ${J.iguais} de ${J.rejulgados}.`);
  }

  console.log("\nA CORREÇÃO (o que o motor faria com cada invenção: motor/correcao-do-juiz.js)");
  const C = R.correcao;
  const esp = Object.entries(C.porEspecie);
  console.log(`  ${s(C.vetos, "veto nasce", "vetos nascem")}${esp.length ? " (" + esp.map(([k, v]) => `${k} ${v}`).join(" · ") + ")" : ""}; entrariam na pauta em ${s(C.turnosComVeto, "turno", "turnos")}, ${s(C.naPauta, "linha", "linhas")} ao todo.`);
  for (const x of C.linhas) for (const l of x.linhas) console.log(`    turno ${String(x.n).padEnd(4)} NÃO PODE ${l}`);
  if (C.cegos) console.log(`  em ${s(C.cegos, "turno", "turnos")} o Juiz julgou os nomes sem o mundo da cidade na entrada: ali o cânone não se corrige.`);
  console.log(`  o cânone que a invenção não consagra: ${C.tirados.length ? C.tirados.map((x) => `«${x.nome}» (turno ${x.n})`).join(", ") : "nada"}`);
}
