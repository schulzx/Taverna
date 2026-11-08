/* ============================================================
   BQ7 · A FIAÇÃO NO App.jsx (08/11/2026) — testes/teste-bq7-app.mjs

   O motor das quests (motor/quests-do-turno.js) e as peças (a encruzilhada,
   o Diário) provam-se nas suítes deles (teste-bq7-motor, teste-bq-tela,
   teste-esqueleto). Esta suíte é de TEXTO e é curta: prova que o App as
   liga onde a planta manda — e só nos mundos novos.

     1. o esqueleto nasce só na criação de uma campanha nova (if (!cap));
     2. as quests andam no fim do turno DEPOIS do Cronista e ANTES da linha
        da sessão, e também quando o Cronista não corre;
     3. a encruzilhada está ligada (a soleira, a peça, o motor, a frase);
     4. o Diário recebe as quests, o cartaz e lê as reviravoltas;
     5. tudo em calou, e tudo atrás de «espinha.esqueleto» — a campanha
        que já existe não passa por nada disto.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const app = fs.readFileSync(path.join(AQUI, "..", "src", "App.jsx"), "utf8");

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  FALHA  " + nome + (extra ? " — " + extra : "")); }
};
const conta = (agulha) => app.split(agulha).length - 1;
/* o corpo de uma função do App: de «const nome = » até à próxima
   declaração no mesmo recuo (duas casas) */
const corpo = (nome) => {
  const i = app.indexOf("\n  const " + nome + " = ");
  if (i < 0) return "";
  const j = app.indexOf("\n  const ", i + 10);
  return app.slice(i, j < 0 ? undefined : j);
};

console.log("\n1. o esqueleto nasce só na criação de uma campanha nova");
{
  const ini = app.indexOf("    if (!cap) {\n      guildasRef.current = guildasDoMundo(");
  const fim = app.indexOf("    jornadaRef.current = null; setJornada(null);", ini);
  const bloco = ini >= 0 && fim > ini ? app.slice(ini, fim) : "";
  t("o bloco da espinha da campanha nova existe", !!bloco);
  t("esqueletoDaCampanha é chamado uma vez só no App", conta("esqueletoDaCampanha(") === 1);
  t("e é dentro do if (!cap), depois da espinha na região", bloco.includes("esqueletoDaCampanha(") && bloco.indexOf("espinhaNaRegiao(") < bloco.indexOf("esqueletoDaCampanha("));
  t("comOEsqueleto junta-o à espinha ali mesmo", conta("comOEsqueleto(") === 1 && bloco.includes("espinhaRef.current = comOEsqueleto(espinhaRef.current, esq)"));
  t("o núcleo da campanha entra no esqueleto", /esqueletoDaCampanha\(\{[\s\S]{0,400}nucleo: nucleoAgora\(\)/.test(bloco));
  t("a principal do marco antigo só nasce sem quest do tipo 1 no ato 0", /if \(!questNoAto0\) \{\s*missoesRef\.current = \[\.\.\.\(missoesRef\.current \|\| \[\]\)\.filter\(\(m\) => m\.id !== ab\.missao\.id\), ab\.missao\];/.test(app));
  t("as quests do ato 0 abrem antes da abertura", app.indexOf('correrAsQuests("a criação do mundo")') > 0 && app.indexOf('correrAsQuests("a criação do mundo")') < app.indexOf("ab = abrirAbertura({"));
}

console.log("\n2. o turno das quests: depois do Cronista, antes da linha da sessão");
{
  const iCr = app.indexOf(".then(() => Promise.resolve(doCronista).catch(() => null))");
  const iQ = app.indexOf('.then(() => { if (comQuests) correrAsQuests("o fim do turno"); })');
  const iS = app.indexOf(".then(() => { if (juntado) { try { gravarOTurnoDaSessao(juntado);");
  t("a fila espera o Cronista", iCr > 0);
  t("as quests correm depois dele", iQ > iCr);
  t("e a linha da sessão grava depois delas", iS > iQ);
  t("o Cronista que não corre não as cala", app.includes('correrAsQuests("o fim do turno, sem o Cronista")'));
  t("sem esqueleto a fila é a de sempre (só a sessão a abre)", app.includes("if (turnoDaSessao || comQuests) {") && app.includes("const comQuests = comEsqueleto();"));
  t("o turno é o do motor, sobre o estado do livro", /oTurnoDasQuests\(estadoDasQuests\(\), \{ mundo: mundoDoLivro\(\) \}\)/.test(corpo("correrAsQuests")));
}

console.log("\n3. a encruzilhada está ligada");
{
  t("a escolha aberta vira o momento «escolha» da soleira", /momentoDaEscolha\(esc, \{[^}]*aoAbrir: \(\) => abrirAEscolha\(esc\), aoDepois: \(\) => adiarAEscolha\(esc\)/.test(app) && app.includes("if (m && m.qual) momentos[m.qual] = m.momento;"));
  t("a proposta da frase não é tapada pela escolha", app.includes("if (!propostaDaFrase && !escolhaAberta) {"));
  t("a peça monta-se ao lado do momento por cima do campo", app.includes("{!emBatalha ? encruzilhadaDaQuest() : null}"));
  t("<Encruzilhada> confirma pelo App e adia pelo «Depois»", /<Encruzilhada aberta veredito=\{esc\}[\s\S]{0,300}aoConfirmar=\{confirmarAEscolha\} aoDepois=\{\(\) => adiarAEscolha\(esc\)\}/.test(app));
  t("confirmar passa pelo motor (escolherNaQuestDoEstado)", corpo("confirmarAEscolha").includes("escolherNaQuestDoEstado(estadoDasQuests(), ab.quest, ab.chave, opcaoId, { mundo: mundoDoLivro() })"));
  t("as cartas vêm do motor (escolhasDasQuests), com o veredito", corpo("escolhasAgora").includes("escolhasDasQuests(E, { mundo: mundoDoLivro() })"));
  const lancar = corpo("lancarODado");
  t("a frase que é uma carta abre a encruzilhada antes da proposta da frase", lancar.indexOf("aEscolhaDaFrase(entrada, lista)") > 0 && lancar.indexOf("aEscolhaDaFrase(entrada, lista)") < lancar.indexOf("if (proporAFrase(entrada)) return;"));
  t("e abre-a com a carta escolhida e a frase", lancar.includes("abrirAEscolha(esc, { preEscolhida: c.opcao, frase: entrada.trim() })"));
  t("na sala a dois não há escolha de quest (o protocolo não muda)", corpo("escolhasAgora").includes("if (!comEsqueleto() || salaRef.current) return [];"));
}

console.log("\n4. o Diário com as quests");
{
  t("as duas portas do Diário recebem as quests da biblioteca", conta("questsDaBiblioteca={(bq && bq.quests) || []}") === 2);
  t("e o cartaz da sombra", conta("vilaoNoDiario={(bq && bq.vilao) || null}") === 2);
  t("o App só as calcula com o Diário aberto", app.includes('bq={aba === "diario" ? oDiarioDasQuests() : null}'));
  const d = corpo("oDiarioDasQuests");
  t("a projeção é a do motor (missoesDasQuests) e a vista a da quest (estadoDaQuest)", d.includes("missoesDasQuests(E, { mundo })") && d.includes("estadoDaQuest(R.id, R, ctx)"));
  t("o cartaz é oVilaoDasQuests", d.includes("oVilaoDasQuests(E, { mundo })"));
  t("abrir o Diário lê as reviravoltas", /useEffect\(\(\) => \{\s*if \(aba !== "diario"\) return;[\s\S]{0,200}verAsReviravoltas\(estadoDasQuests\(\)\)/.test(app));
}

console.log("\n5. tudo em calou, e só nos mundos novos");
{
  for (const nome of ["aplicarAsQuests", "correrAsQuests", "escolhasAgora", "oDiarioDasQuests", "abrirAEscolha", "adiarAEscolha", "confirmarAEscolha", "encruzilhadaDaQuest"]) {
    const c = corpo(nome);
    t(nome + " existe e cala o que estoura", !!c && /calou\("BQ7/.test(c));
  }
  t("o esqueleto do mundo novo nasce em calou", app.includes('} catch (e) { calou("BQ7 · o esqueleto do mundo novo", e); }'));
  t("as quests da criação correm em calou", app.includes('} catch (e) { calou("BQ7 · as quests da criação", e); questNoAto0 = false; }'));
  t("o efeito sem órgão no App cala-se (nunca se inventa a regra dele)", corpo("aplicarEfeitoDaQuest").includes('calou("BQ7 · efeito sem órgão no App: " + ef.tipo, ef)'));
  for (const nome of ["correrAsQuests", "escolhasAgora", "oDiarioDasQuests"]) {
    t(nome + " não corre sem «espinha.esqueleto»", /if \(!comEsqueleto\(\)/.test(corpo(nome)));
  }
  t("comEsqueleto lê a espinha, e só ela", app.includes("const comEsqueleto = () => !!(espinhaRef.current && espinhaRef.current.esqueleto);"));
}

console.log(`\nbq7-app: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
