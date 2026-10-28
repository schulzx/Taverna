/* jogar-em-node.mjs (Fase T1, trilha B · 27/10; T3-B · 28/10) — o jogo em Node

   O alvo da Fase 1 do plano do motor (mente/plano-motor.md): jogar os
   turnos de um registo real SEM React e SEM rede, com a saída igual à do
   registo. Desde 28/10 (T3-B, o replay num caminho só) o jogo em Node É o
   replay: lê as três sessões de prova como arquivos de sessão
   (testes/sessao-s8.json, sessao-s9.json, sessao-s10.json) e corre-as por
   `reproduzirASessao` (src/sessao.js), turno a turno, com as respostas
   gravadas. Não há outro turno nem outro leitor.

   DE ONDE VÊM OS ARQUIVOS. Dos registos da 8.ª, 9.ª e 10.ª sessões
   (registo-s10-cena.json, registo-s8-s10-cronista.json), convertidos por
   `node testes/gravar-sessoes-de-prova.mjs` — que corre o MESMO passo do
   replay (`correrOTurno`) e só acrescenta o oráculo, o que o registo sabe e
   o motor ainda não faz (a viagem e o sítio antes do Mestre, o nome à mão
   que o registo não gravou, os combatentes da luta), declarado na linha
   (`app`). A régua do REGISTO — a gente que a pauta nomeia o estado
   conhece; o EM CENA sem gente de LONGE; o sítio pela frase que não leva a
   outro sítio — mora lá, porque é sobre o registo: o gravador não escreve
   um arquivo que a contradiga. Aqui prova-se que o motor de HOJE ainda dá,
   turno a turno, os estados que esses arquivos guardam.

   AS CONTAS (as de 28/10, antes de haver um caminho só, eram duas, e a
   diferença entre elas vivia em dois sítios):
     · reproduz — o turno sai igual em tudo: 69 + 66 + 45 = 180 de 194;
     · joga sozinho (`soOMotor`) — reproduz, e nenhum órgão do App mexeu:
       68 + 62 + 45 = 175, o que este jogo media pelo seu leitor;
     · a diferença são cinco turnos que reproduzem COM a ajuda declarada do
       App, e é a linha deles que o diz (sessao.js, "A DÍVIDA E O DEFEITO"):
       os quatro da luta da 8.ª (s8#24, 38, 40, 63: o registo conhece os
       combatentes e a luta guarda-os fora do estado) e o M69 da 10.ª (o
       App levou o herói à estalagem, e o lugar do Cronista pô-lo lá outra
       vez — o fim do turno sai igual, e é o fim que o arquivo guarda).
   O que não reproduz é dívida do App que a linha declara (a viagem, o
   sítio, o nome à mão) — e nenhum é defeito do motor. */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;

const { reproduzirASessao, validarASessao, estadoNoTurno } = await import("../src/sessao.js");
const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
const ARQ = { s10: ler("sessao-s10.json"), s8: ler("sessao-s8.json"), s9: ler("sessao-s9.json") };
const REP = Object.fromEntries(Object.entries(ARQ).map(([k, a]) => [k, reproduzirASessao(a)]));

/* o turno que o motor joga sozinho: reproduz, e a linha não declara o App */
const sozinho = (x) => x.igual && !x.app;
const corridaMaior = (turnos) => { let c = 0, m = 0; for (const x of turnos) { c = sozinho(x) ? c + 1 : 0; m = Math.max(m, c); } return m; };

/* ============================================================ */
sec("1. AS TRÊS SESSÕES DE PROVA, PELO REPLAY — sem React, sem rede, sem IA");
for (const [ses, r] of Object.entries(REP)) {
  t(`${ses}: o arquivo é válido e corre inteiro (${r.turnos.length} turnos), sem nenhum passo a estourar`, r.valido && validarASessao(ARQ[ses]).ok && r.turnos.length === ARQ[ses].turnos.length && r.turnos.every((x) => !x.calou.length), J(r.erros.slice(0, 2)));
  console.log(`  ..  ${ses}: reproduz ${r.reproduzidos} de ${r.turnos.length}; joga sozinho ${r.soOMotor}; diverge (dívida do App) em ${r.divergentes.join(",") || "nenhum"}`);
}
t("194 turnos ao todo (77 + 70 + 47)", REP.s10.turnos.length === 77 && REP.s8.turnos.length === 70 && REP.s9.turnos.length === 47);
t("o motor não tem defeito em nenhuma das três: o que diverge é dívida do App, que a linha declara", Object.values(REP).every((r) => r.defeitos.length === 0), J(Object.fromEntries(Object.entries(REP).map(([k, r]) => [k, r.defeitos]))));
t("e o juízo do Cronista e o veredito do Juiz saem iguais nos 194", Object.values(REP).every((r) => r.turnos.every((x) => x.cronista && x.cronista.igual && x.juiz && x.juiz.igual)));

sec("2. AS CONTAS — quantos reproduzem, quantos o motor joga sozinho");
{
  const soma = (k) => Object.values(REP).reduce((a, r) => a + r[k], 0);
  /* MEDIDA (28/10, T3-B, o replay num caminho só): 180 reproduzem e 175 o
     motor joga sozinho — os números que o replay e o jogar-em-node davam
     quando eram dois caminhos. Catraca: não descem; sobem quando o motor
     do oficial trouxer o passo antes do Mestre (src/motor/turno.js). */
  t(`reproduzem ${REP.s10.reproduzidos} + ${REP.s8.reproduzidos} + ${REP.s9.reproduzidos} = ${soma("reproduzidos")} de 194 (a medida de 28/10: 69 + 66 + 45 = 180)`, REP.s10.reproduzidos >= 69 && REP.s8.reproduzidos >= 66 && REP.s9.reproduzidos >= 45);
  t(`o motor joga sozinho ${REP.s10.soOMotor} + ${REP.s8.soOMotor} + ${REP.s9.soOMotor} = ${soma("soOMotor")} (a medida de 28/10: 68 + 62 + 45 = 175)`, REP.s10.soOMotor >= 68 && REP.s8.soOMotor >= 62 && REP.s9.soOMotor >= 45);
  const ajudados = Object.entries(REP).flatMap(([ses, r]) => r.turnos.filter((x) => x.igual && x.app).map((x) => ({ id: `${ses}#${x.n}`, orgao: x.app.map((a) => a.orgao).join("; ") })));
  console.log(`  ..  a diferença, ${ajudados.length} turnos que reproduzem com a ajuda declarada do App: ${ajudados.map((x) => `${x.id} (${x.orgao.split(" (")[0]})`).join(", ")}`);
  t("e a diferença entre as duas contas são esses turnos, e só eles", soma("reproduzidos") - soma("soOMotor") === ajudados.length);
  t("hoje, os cinco: a luta da 8.ª (24, 38, 40, 63) e o sítio do M69 da 10.ª, que o Cronista repôs", J(ajudados.map((x) => x.id).sort()) === J(["s10#69", "s8#24", "s8#38", "s8#40", "s8#63"]) && ajudados.every((x) => /a luta|moverParaLocal/.test(x.orgao)));
  /* toda divergência é de um turno cuja linha declara o órgão que a fez */
  const semDono = Object.entries(REP).flatMap(([ses, r]) => r.turnos.filter((x) => !x.igual && !(x.app && x.divida.length && x.divida.every((d) => d.de === "a linha"))).map((x) => `${ses}#${x.n}`));
  t("todo turno que não reproduz tem a linha a dizer qual órgão do App o fez (a viagem, o sítio, o nome à mão)", semDono.length === 0, semDono.join(","));
  t("na 10.ª é sempre o passo antes do Mestre, e na 8.ª e na 9.ª sempre um nome à mão", REP.s10.turnos.filter((x) => !x.igual).every((x) => x.app.every((a) => /passo antes do Mestre/.test(a.orgao))) && [REP.s8, REP.s9].every((r) => r.turnos.filter((x) => !x.igual).every((x) => x.app.every((a) => /nomes à mão/.test(a.orgao)))));
}

sec("3. A 10.ª, OS 20 PRIMEIROS TURNOS — o que o motor faz sozinho");
{
  const r = REP.s10, S = ARQ.s10;
  const vinte = r.turnos.slice(0, 20);
  /* MEDIDA (27/10): 15 de 20; (28/10, T1-B fatia 3): 17 — o sítio pela
     frase leva M4 e M15; ficam a viagem (M13), a estrada (M17) e a saída da
     Cabra (M9), que o registo mostra e a frase do turno não pede. */
  t(`${vinte.filter(sozinho).length} de 20 o motor joga sozinho (a medida de 28/10: 17)`, vinte.filter(sozinho).length >= 17, J(vinte.filter((x) => !sozinho(x)).map((x) => x.n)));
  /* o sítio pela frase move ANTES do Mestre, e é o motor que o faz: o
     lugar gravado muda nesses turnos, e eles reproduzem sem o App */
  const moveuSo = (n) => { const a = estadoNoTurno(S, n - 1).lugar, b = estadoNoTurno(S, n).lugar; return sozinho(r.turnos[n - 1]) && b && (!a || a.nome !== b.nome) ? b.nome : null; };
  t("o sítio pela frase move antes do Mestre: M4 «Vou com Saoirse até a Cabra Trêmula» e M15", moveuSo(4) === "Cabra Trêmula" && !!moveuSo(15), J([moveuSo(4), moveuSo(15)]));
  const E20 = estadoNoTurno(S, 20);
  const npcs = Object.keys(E20.npcs || {});
  t("o contador da gente anda um por turno (npcTurno 0 → 20)", (estadoNoTurno(S, 0).npcTurno || 0) === 0 && E20.npcTurno === 20, String(E20.npcTurno));
  t("o registo de gente tem os três que a sessão conheceu até M20", ["Godfrey da Foz", "Nyla Punho-de-Pedra", "Torvald da Urze"].every((n) => npcs.includes(n)), J(npcs));
  t("o cânone tem o rumor marcado como palavra («o Rei Emprestado acordou, dizem»)", !!(E20.canone || {})["Rei Emprestado"] && /dito por/.test(E20.canone["Rei Emprestado"].dito || ""), J(E20.canone));
  t("o herói acaba no Rossio Torto, em Nova Profundo (como a pauta de M21)", E20.cidadeAtual === "Nova Profundo" && E20.lugar && E20.lugar.nome === "Rossio Torto" && /Rossio Torto/.test(S.turnos[20].pedido.pauta), J(E20.lugar));
  t("o estado do fim continua um estado v2 (a versão e os campos)", E20.versao === 2 && "prometido" in E20 && "desdeMundo" in E20);
  /* MOVIDAS (28/10, T3-B): a gente que a pauta nomeia e o EM CENA sem gente
     de LONGE eram conferidos aqui, turno a turno, contra o registo. São a
     régua do REGISTO, e foram com ele para gravar-sessoes-de-prova.mjs, que
     não escreve um arquivo que a contradiga; o que esta suíte prova é que o
     motor de hoje dá os mesmos estados (secção 1), e com eles a régua vale.
     O EM CENA e a escuta têm as suas suítes (teste-em-cena, teste-mm18-escuta). */
}

sec("4. A CORRIDA MAIS LONGA — a meta da fase são 20 turnos seguidos");
{
  const m = Object.fromEntries(Object.entries(REP).map(([k, r]) => [k, corridaMaior(r.turnos)]));
  console.log(`  ..  a corrida mais longa sem o App: s10 ${m.s10}, s8 ${m.s8}, s9 ${m.s9}`);
  /* MEDIDA (28/10, T1-B fatia 3): a 10.ª 17, com a régua inteira (o lugar
     também); a 8.ª 22 e a 9.ª 29, com a régua da gente e do cânone (o
     registo do Cronista não guarda o lugar). Catraca: não desce. */
  t(`a 10.ª: ${m.s10} seguidos (a medida de 28/10: 17)`, m.s10 >= 17);
  t(`a meta da fase, 20 seguidos iguais ao registo: a 8.ª ${m.s8}, a 9.ª ${m.s9}`, m.s8 >= 20 && m.s9 >= 20);
}

sec("5. DETERMINISMO — jogar duas vezes dá o mesmo jogo");
{
  t("as três, outra vez: o mesmo relatório byte a byte", Object.entries(ARQ).every(([k, a]) => J(reproduzirASessao(a)) === J(REP[k])));
  t("e a ordem não importa (a sorte não vaza de uma sessão para a outra)", J(reproduzirASessao(ARQ.s9)) === J(REP.s9) && J(reproduzirASessao(ARQ.s10)) === J(REP.s10));
}

console.log(`\njogar-em-node: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
