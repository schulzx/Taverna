/* teste-correcao-do-juiz.mjs (Fase T, trilha B · 28/10/2026) — o Juiz passa de medir a corrigir

   src/motor/correcao-do-juiz.js é o que o motor FAZ com uma invenção que o
   Juiz de fidelidade apanhou: o veto que entra na pauta do turno seguinte
   (a secção `vetoDoJuiz` de pauta.js, no bloco do NÃO PODE) e o cânone do
   Cronista que a invenção não chega a consagrar. Esta suíte prova as duas
   coisas e, sobretudo, MEDE-AS — o portão morde só o necessário:

     · no corpus rotulado (testes/juiz-rotulado.json, montado por
       corpus-do-juiz.mjs, o mesmo da meta do Juiz): quantas invenções viram
       veto, e nenhum veto numa resposta limpa;
     · nas 204 pautas gravadas da 5.ª à 7.ª sessão: o que a linha do veto
       tira do teto, e que nunca tira a resposta, o rumo, o fecho;
     · nas sessões 8–10 (o cânone que o Cronista aceitou): o que sai do
       cânone, e que a gente que a cena pôs a agir fica no registo.

   As espécies que só medem têm a razão escrita na tabela; aqui conta-se o
   que elas teriam mordido de errado se vetassem. */
import fs from "node:fs";
import { casos, CLASSES, J, sem } from "./corpus-do-juiz.mjs";
import { julgarAProsa } from "../src/juiz-de-fidelidade.js";
import { CLASSES_DO_JUIZ } from "../src/motor/juiz-do-turno.js";
import {
  CORRECAO_DO_JUIZ, LINHAS_DA_CORRECAO, juizCego, especieDoAchado, vetosDoVeredito, andarOsVetos, vetosParaAPauta, canoneSemInvencao,
} from "../src/motor/correcao-do-juiz.js";
import { SECOES, SECOES_QUE_CEDEM, secaoPorId, porNaPauta, textoDaPauta, cederNaCena, prioDaLinha, TETO_DA_PAUTA } from "../src/pauta.js";
import { resumoDaSessao, estadoNoTurno } from "../src/sessao.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { const v = typeof cond === "function" ? (() => { try { return !!cond(); } catch { return false; } })() : !!cond; if (v) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const Js = JSON.stringify;
const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));

sec("1. A TABELA");
{
  const C = CORRECAO_DO_JUIZ;
  t("os números da correção são tabela: vida, linhas na pauta, livro, letras", [C.vida, C.naPauta, C.guardados, C.letras].every((n) => Number.isInteger(n) && n > 0) && C.naPauta <= C.guardados);
  const classes = CLASSES_DO_JUIZ.map((c) => c.campo);
  t("toda classe que o Juiz mede tem ao menos uma espécie", classes.every((cl) => C.especies.some((e) => e.classe === cl)));
  t("cada espécie diz o que faz (veto ou mede) e porquê", C.especies.every((e) => ["veto", "mede"].includes(e.faz) && typeof e.porque === "string" && e.porque.length >= 40) && new Set(C.especies.map((e) => e.id)).size === C.especies.length);
  const vetam = C.especies.filter((e) => e.faz === "veto").map((e) => e.id);
  t(`só a contradição veta: ${vetam.join(", ")}`, Js(vetam) === Js(["preco-contra-a-mesa", "distancia-contra-o-mapa"]));
  t("toda espécie que veta tem a sua linha, e só elas", Js(Object.keys(LINHAS_DA_CORRECAO).sort()) === Js([...vetam].sort()));
  t("o cânone corrige-se pelos nomes (lugar, pessoa, nome), e a gente do registo não", Js([...C.canone.classes].sort()) === Js(["lugaresNovos", "nomesNovos", "pessoasNovas"]) && /imut/.test(C.canone.porque));
  t("e a tabela não se muda por fora (congelada)", Object.isFrozen(C) && Object.isFrozen(C.especies) && C.especies.every(Object.isFrozen) && Object.isFrozen(LINHAS_DA_CORRECAO));
  /* a secção da pauta */
  const s = secaoPorId("vetoDoJuiz"), np = secaoPorId("naoPode");
  t("a pauta tem a secção do Juiz, com o rótulo do NÃO PODE e logo depois dele (um bloco de vetos só)", !!s && s.rotulo === np.rotulo && SECOES.indexOf(s) === SECOES.indexOf(np) + 1);
  t("e corta depois da resposta, da aposta e de quem está em cena, e antes da agenda da gente", ["pergunta", "mesa", "quem", "momento"].every((id) => secaoPorId(id).prio < s.prio) && s.prio < secaoPorId("gente").prio && s.prio < secaoPorId("contra").prio);
  t("na luta, cede", SECOES_QUE_CEDEM.luta.includes("vetoDoJuiz") && !cederNaCena({ vetoDoJuiz: ["x"], naoPode: ["y"] }, { luta: true }).vetoDoJuiz);
}

sec("2. AS ESPÉCIES, E A LINHA DE CADA UMA");
{
  const esp = (cl, a) => (especieDoAchado(cl, a) || {}).id;
  t("o preço que a mesa tinha é contradição", esp("precosInventados", { valor: 25, item: "Elixir de Destreza", tabela: 140 }) === "preco-contra-a-mesa");
  t("o preço de coisa que a mesa não trouxe só se mede", esp("precosInventados", { valor: 3, item: "o pouso", tabela: null }) === "preco-sem-mesa");
  t("o valor sem coisa também", esp("precosInventados", { valor: 7, item: "", tabela: null }) === "valor-solto");
  t("a distância contra o mapa é contradição, e a que o turno não trouxe só se mede", esp("distanciasFora", { valor: 1, unidade: "dia", tipo: "viagem", sistema: "Nova Profundo 4 h" }) === "distancia-contra-o-mapa" && esp("distanciasFora", { valor: 20, unidade: "minutos", tipo: "viagem", sistema: null }) === "distancia-sem-mapa");
  t("o tempo decorrido ou por vir só se mede", esp("distanciasFora", { valor: 3, unidade: "noites", tipo: "decorrido", sistema: "o pedido 312 h" }) === "tempo" && esp("distanciasFora", { valor: 3, unidade: "horas", tipo: "porvir", sistema: null }) === "tempo");
  t("o sítio, na cena ou dito, a pessoa e o nome só se medem", esp("lugaresNovos", { nome: "estalagem torta", dito: false }) === "lugar-da-cena" && esp("lugaresNovos", { nome: "banca", dito: true }) === "lugar-dito" && esp("pessoasNovas", { nome: "Dolmen" }) === "pessoa" && esp("nomesNovos", { nome: "Varek" }) === "nome");
  t("o lixo não tem espécie", esp("precosInventados", null) === undefined && esp("classeQueNaoExiste", { valor: 1 }) === undefined && esp("pessoasNovas", {}) === undefined);
  const v = { precosInventados: [{ trecho: "Vinte e cinco marcos.", valor: 25, item: "Elixir de Destreza", tabela: 140 }], distanciasFora: [{ trecho: "Um dia e meio.", valor: 1.5, unidade: "dia", tipo: "viagem", sistema: "Nova Profundo 4 h" }] };
  const vs = vetosDoVeredito(v, { turno: 7, cidade: "Monte Rasa" });
  t("o veto do preço leva o número da mesa e diz que o inventado não vale", vs.length === 2 && /◉ 140/.test(vs[0].linha) && /«Elixir de Destreza»/.test(vs[0].linha) && /25 dito antes não vale/.test(vs[0].linha), Js(vs.map((x) => x.linha)));
  t("o da distância leva a do mapa, e o número à portuguesa (1,5)", /Nova Profundo 4 h/.test(vs[1].linha) && /«1,5 dia»/.test(vs[1].linha));
  t("cada veto sabe quando nasceu, até quando vive e de que cidade é", vs.every((x) => x.turno === 7 && x.ate === 7 + CORRECAO_DO_JUIZ.vida && x.cidade === "Monte Rasa" && x.alvo));
  t("e as palavras que o trazem de volta (a coisa, o destino)", Js(vs[0].toques) === Js(["elixir de destreza"]) && Js(vs[1].toques) === Js(["nova profundo"]));
  const longo = vetosDoVeredito({ precosInventados: [{ valor: 9, item: "x".repeat(400), tabela: 2 }] }, { turno: 1 });
  t(`nenhuma linha passa de ${CORRECAO_DO_JUIZ.letras} letras`, longo.length === 1 && longo[0].linha.length <= CORRECAO_DO_JUIZ.letras);
  const dois = vetosDoVeredito({ precosInventados: [{ valor: 10, item: "refeição quente", tabela: 2 }, { valor: 5, item: "refeição quente", tabela: 2 }] }, { turno: 1 });
  t("dois números para a mesma coisa são um veto só («Dez com jantar, cinco sem»)", dois.length === 1);
  t("o que só se mede não vira veto", vetosDoVeredito({ precosInventados: [{ valor: 3, item: "o pouso", tabela: null }], pessoasNovas: [{ nome: "Dolmen" }], lugaresNovos: [{ nome: "estalagem torta" }], nomesNovos: [{ nome: "Varek" }], distanciasFora: [{ valor: 3, unidade: "noites", tipo: "decorrido", sistema: "x 3 h" }] }, { turno: 1 }).length === 0);
}

sec("3. A MEDIDA NO CORPUS — quantas invenções viram veto, e nenhum veto errado");
const VER = casos.map((c) => ({ ...c, v: julgarAProsa(c.prosa, c.estado) }));
{
  const bate = (a, r, cl) => (r.aceita || [r.classe]).includes(cl) && (sem(a.trecho).includes(sem(r.trecho)) || (a.nome && sem(r.trecho).includes(sem(a.nome))));
  const conta = {};
  const errados = [], vetos = [];
  for (const c of VER) {
    for (const cl of CLASSES) for (const a of c.v[cl]) {
      const e = especieDoAchado(cl, a);
      if (!e) continue;
      const x = conta[e.id] || (conta[e.id] = { faz: e.faz, rotulado: 0, aMais: 0, limpa: 0, fora: 0 });
      if (c.rotulos.some((r) => bate(a, r, cl))) x.rotulado++;
      else if (c.limpo) { x.limpa++; if (e.faz === "veto") errados.push(`${c.id} ${e.id} «${a.trecho}»`); }
      else if (c.rotulos.length) x.aMais++;
      else x.fora++;
    }
    for (const x of vetosDoVeredito(c.v, { turno: 1 })) vetos.push({ id: c.id, ...x, limpo: c.limpo });
  }
  console.log("     espécie                   faz    rotulado  a mais  em limpa  fora");
  for (const [id, x] of Object.entries(conta)) console.log(`     ${id.padEnd(26)}${x.faz.padEnd(7)}${String(x.rotulado).padStart(8)}${String(x.aMais).padStart(8)}${String(x.limpa).padStart(10)}${String(x.fora).padStart(6)}`);
  for (const x of vetos) console.log(`     veto ${x.id.padEnd(14)} NÃO PODE ${x.linha}`);
  /* MEDIDA (28/10): 6 vetos em 6 respostas — os três preços contra a mesa
     da 9.ª (a refeição, o elixir, as ataduras), o da 6.ª (as tochas, na
     conta das rações) e as duas distâncias contra o mapa (o "um dia" da
     10.ª para as 4 h de Nova Profundo, o "meio dia" da 6.ª para as 2,1 h
     de Fogão Queimada). Nenhum numa resposta limpa. */
  t(`nenhum veto numa resposta limpa (${errados.length})`, errados.length === 0, errados.join(" · "));
  t(`as contradições viram veto: ${vetos.length} vetos (a medida de 28/10: 6)`, vetos.length >= 6 && vetos.every((x) => !x.limpo));
  const vetaveis = Object.entries(conta).filter(([, x]) => x.faz === "veto").reduce((s, [, x]) => s + x.rotulado, 0);
  t(`e todo rotulado de espécie que veta vira veto (${vetaveis})`, vetaveis >= 5 && VER.every((c) => c.rotulos.every((r) => {
    const achou = CLASSES.flatMap((cl) => c.v[cl].filter((a) => bate(a, r, cl)).map((a) => especieDoAchado(cl, a))).filter(Boolean);
    return !achou.some((e) => e.faz === "veto") || vetosDoVeredito(c.v, { turno: 1 }).length > 0;
  })));
  /* o porquê das espécies que só medem, em número: o que teriam mordido */
  t(`o tempo teria mordido resposta limpa (${conta.tempo ? conta.tempo.limpa : 0}): é por isso que só mede`, conta.tempo && conta.tempo.limpa >= 1);
  const daMesa = ["preco-sem-mesa", "valor-solto", "distancia-sem-mapa"].reduce((n, id) => n + ((conta[id] || {}).rotulado || 0), 0);
  console.log(`     dos ${daMesa + vetaveis} números inventados que o Juiz apanha nos rotulados, ${vetaveis} contradizem o sistema e ${daMesa} são buraco dele (a mesa ou o mapa não os deu ao turno: não há verdade para dar)`);
  t("e a maior parte dos números inventados é buraco do sistema, não contradição (a cura é a mesa, não o veto)", daMesa > vetaveis);
}

sec("4. O LIVRO E A PORTA DA PAUTA");
{
  const um = vetosDoVeredito({ precosInventados: [{ valor: 25, item: "Elixir de Destreza", tabela: 140 }] }, { turno: 10, cidade: "A" });
  let livro = andarOsVetos([], um, { turno: 10, cidade: "A" });
  t("o veto não entra na pauta do turno em que nasceu (a pauta dele já foi)", vetosParaAPauta(livro, { turno: 10, cidade: "A" }).length === 0);
  t("entra no turno logo a seguir, sem a frase o pedir", Js(vetosParaAPauta(livro, { turno: 11, cidade: "A", frase: "Saio da loja." })) === Js([um[0].linha]));
  t("depois, só quando a frase toca a coisa", vetosParaAPauta(livro, { turno: 12, cidade: "A", frase: "Saio da loja." }).length === 0 && vetosParaAPauta(livro, { turno: 12, cidade: "A", frase: "Volto e peço o elixir de destreza." }).length === 1);
  t(`e não depois da vida (${CORRECAO_DO_JUIZ.vida} turnos)`, vetosParaAPauta(livro, { turno: 10 + CORRECAO_DO_JUIZ.vida, cidade: "A", frase: "o elixir de destreza" }).length === 1 && vetosParaAPauta(livro, { turno: 11 + CORRECAO_DO_JUIZ.vida, cidade: "A", frase: "o elixir de destreza" }).length === 0);
  t("noutra cidade, não", vetosParaAPauta(livro, { turno: 11, cidade: "B" }).length === 0 && andarOsVetos(livro, [], { turno: 11, cidade: "B" }).length === 0);
  livro = andarOsVetos(livro, [], { turno: 10 + CORRECAO_DO_JUIZ.vida, cidade: "A" });
  t("o livro esquece o que expirou", livro.length === 0);
  /* o novo do mesmo alvo substitui o velho; o livro guarda os mais novos */
  let L2 = [];
  for (let n = 1; n <= 9; n++) L2 = andarOsVetos(L2, vetosDoVeredito({ precosInventados: [{ valor: n + 1, item: `coisa ${n % 8}`, tabela: 1 }] }, { turno: n, cidade: "A" }), { turno: n, cidade: "A" });
  t(`o livro guarda no máximo ${CORRECAO_DO_JUIZ.guardados}, os mais novos e vivos`, L2.length <= CORRECAO_DO_JUIZ.guardados && L2.every((x) => x.ate >= 9));
  const re = andarOsVetos(andarOsVetos([], vetosDoVeredito({ precosInventados: [{ valor: 5, item: "corda", tabela: 35 }] }, { turno: 1 }), { turno: 1 }), vetosDoVeredito({ precosInventados: [{ valor: 9, item: "corda", tabela: 35 }] }, { turno: 2 }), { turno: 2 });
  t("o mesmo alvo, dito outra vez, é um veto só, o mais novo", re.length === 1 && /9 dito antes/.test(re[0].linha) && re[0].turno === 2);
  const tres = andarOsVetos([], vetosDoVeredito({ precosInventados: [1, 2, 3].map((k) => ({ valor: 9, item: `coisa ${k}`, tabela: k })) }, { turno: 1 }), { turno: 1 });
  t(`na pauta, no máximo ${CORRECAO_DO_JUIZ.naPauta} linhas, as mais novas primeiro`, Js(vetosParaAPauta(tres, { turno: 2 })) === Js([tres[2].linha, tres[1].linha]));
  /* a fiação: as linhas entram pela porNaPauta na secção do Juiz, e saem no
     bloco do NÃO PODE, depois do veto do sistema */
  const p = porNaPauta(porNaPauta({}, "naoPode", "alguém aqui me notar: estou escondido"), "vetoDoJuiz", ...vetosParaAPauta(andarOsVetos([], um, { turno: 10 }), { turno: 11 }));
  const txt = textoDaPauta(p);
  t("e saem na pauta num bloco só de NÃO PODE: o veto do sistema primeiro, o do Juiz a seguir", (txt.match(/NÃO PODE/g) || []).length === 1 && txt.indexOf("estou escondido") < txt.indexOf("Elixir de Destreza"), txt);
}

sec("5. O TETO — o que a linha do veto tira da pauta");
{
  /* as pautas ENVIADAS da 5.ª, 6.ª e 7.ª sessões, secção a secção (todas
     perto do teto), com as duas linhas mais longas que a correção pode dar.
     A PRIO É ESTA MEDIDA: a 2,0 (a da naoPode) a linha cortava o PERGUNTOU
     7 vezes, o RUMO 3 e o FECHO 9; a 4,5 corta só o que corta depois de 5
     (a agenda da gente, a luz, o contra), e nunca passa do teto. */
  const linhas = [`pôr em «${"x".repeat(60)}» outro preço que não ◉ 140, o da mesa (o 25 dito antes não vale)`, `dar outra distância que não a do mapa (${"y".repeat(60)} 4 h): «1,5 dia» dito antes não vale`].map((l) => l.slice(0, CORRECAO_DO_JUIZ.letras));
  const prio = secaoPorId("vetoDoJuiz").prio;
  let turnos = 0, entrou = 0, passou = 0;
  const cortou = {}, cortouAntes = [];
  for (const f of ["registo-s5-pauta.json", "registo-s6-s7-pauta.json"]) {
    const R = ler(f);
    for (const tt of R.turnos) {
      const p0 = {};
      for (const [s, ids] of Object.entries(tt.secoes)) p0[s] = ids.map((i) => R.linhas[i]);
      const antes = textoDaPauta(p0);
      const depois = textoDaPauta(cederNaCena(porNaPauta(p0, "vetoDoJuiz", ...linhas.slice(0, CORRECAO_DO_JUIZ.naPauta)), { luta: tt.luta, masmorra: tt.masmorra }));
      turnos++;
      if (depois.length > TETO_DA_PAUTA) passou++;
      if (depois.includes(linhas[0])) entrou++;
      for (const [s, xs] of Object.entries(p0)) xs.forEach((x, i) => {
        if (!antes.includes(x) || depois.includes(x)) return;
        if (tt.luta && SECOES_QUE_CEDEM.luta.includes(s)) return;
        cortou[s] = (cortou[s] || 0) + 1;
        if (prioDaLinha(secaoPorId(s), i) < prio) cortouAntes.push(`${tt.sessao || f}#${tt.turno} ${s}`);
      });
    }
  }
  console.log(`     ${turnos} pautas; a linha do Juiz entra em ${entrou}; o que ela tira: ${Js(cortou)}`);
  t(`nunca passa do teto (${TETO_DA_PAUTA})`, passou === 0);
  t("e nunca tira uma linha que corta antes dela (a resposta, a aposta, o rumo, o fecho, os vetos do sistema, o lugar)", cortouAntes.length === 0, cortouAntes.slice(0, 5).join(", "));
  t("nem o PERGUNTOU, o RUMO, o FECHO, o DESFECHO ou o NÃO PODE do sistema", ["pergunta", "rumo", "fecho", "desfecho", "naoPode", "vetoDoDesfecho", "onde"].every((s) => !cortou[s]));
}

sec("6. O CÂNONE — o que a invenção não consagra, nas sessões 8–10");
{
  /* o veredito do corpus (o estado rico, o da meta do Juiz) contra o aceito
     que o Cronista deu na mesma resposta (o arquivo da sessão: a linha k é
     o turno k do registo). MEDIDA (28/10): três nomes, e os três rotulados
     como invenção — o Sem Nome da 8.ª (M34), o alçapão da 9.ª (M28) e a
     Fiandeira da 10.ª (M15). E a gente da cena fica: o Rurik e o Dolmen. */
  const tirados = [], pessoasTiradas = [];
  const rotulo = (ses, k, nome) => [...J.rotulos, ...J.marginais].some((r) => r.ses === ses && r.k === k && (sem(nome).includes(sem(r.trecho)) || sem(r.trecho).includes(sem(nome))));
  let todosRotulados = true;
  for (const ses of ["s8", "s9", "s10"]) {
    const S = ler(`sessao-${ses}.json`);
    VER.filter((c) => c.id.startsWith(ses + "#")).forEach((c) => {
      const k = Number(c.id.split("#")[1]), L = S.turnos[k];
      if (!L) return;
      const ac = ((L.cronista || {}).juizo || {}).aceito || {};
      const r = canoneSemInvencao(ac, c.v, { estado: estadoNoTurno(S, k) });
      for (const x of r.tirados) { tirados.push(`${ses}#${k} ${x.nome}`); if (!rotulo(ses, k, x.por) && !rotulo(ses, k, x.nome)) todosRotulados = false; }
      if (Js(r.aceito.pessoas) !== Js(ac.pessoas)) pessoasTiradas.push(`${ses}#${k}`);
      if (Js(r.aceito.lugar) !== Js(ac.lugar)) pessoasTiradas.push(`${ses}#${k} lugar`);
    });
  }
  console.log(`     tirados do cânone: ${tirados.join(" · ")}`);
  t(`saem do cânone ${tirados.length} nomes (a medida de 28/10: 3 — Sem Nome, o alçapão, Fiandeira)`, Js(tirados) === Js(["s8#33 Sem Nome", "s9#27 Alçapão sob a forja de Tomas", "s10#14 Fiandeira"]), Js(tirados));
  t("e todos são invenção rotulada", todosRotulados);
  t("a gente que a cena pôs a agir e o sítio do herói não se tocam (o Rurik, o Dolmen ficam no registo)", pessoasTiradas.length === 0, pessoasTiradas.join(","));
  /* as guardas */
  const v = { lugaresNovos: [{ nome: "alçapão" }], nomesNovos: [{ nome: "Varek" }] };
  const ac = { canone: { "Alçapão sob a forja": { tipo: "lugar" }, "Varek": { tipo: "pessoa" }, "Livro de contas": { tipo: "artefato" } }, pessoas: [{ nome: "Varek" }] };
  const r1 = canoneSemInvencao(ac, v);
  t("tira por palavra inteira, deixa o resto e a gente", Js(Object.keys(r1.aceito.canone)) === Js(["Livro de contas"]) && Js(r1.aceito.pessoas) === Js(ac.pessoas) && r1.tirados.length === 2);
  t("o nome que o estado já conhece nunca sai (o registo, o cânone de antes, o mapa)", canoneSemInvencao(ac, v, { estado: { npcs: { Varek: {} }, canone: { "Alçapão sob a forja": {} } } }).tirados.length === 0 && canoneSemInvencao({ canone: { "Ponte Brumoso": {} } }, { lugaresNovos: [{ nome: "Ponte Brumoso" }] }, { estado: { mapa: { cidades: [{ nome: "Ponte Brumoso" }] } } }).tirados.length === 0);
  t("a palavra curta demais não tira nada («Sem Nome» não cai por um «em»)", canoneSemInvencao({ canone: { "Sem Nome": {} } }, { nomesNovos: [{ nome: "em" }] }).tirados.length === 0);
  t("sem nada a tirar, o aceito volta o mesmo (identidade)", canoneSemInvencao(ac, {}).aceito === ac);
  t("e o cânone que fica vazio sai da proposta", !("canone" in canoneSemInvencao({ canone: { Varek: {} }, falou_com: ["x"] }, { nomesNovos: [{ nome: "Varek" }] }).aceito));
}

sec("7. O JUIZ CEGO NÃO MEXE NO CÂNONE");
{
  t("cego é a entrada sem o mundo da cidade (os papéis que a semente dá)", juizCego({ gente: ["a"], lugares: ["b"], papeis: [] }) && !juizCego({ papeis: ["ferreiro"] }) && Js(CORRECAO_DO_JUIZ.cego) === Js(["papeis"]));
  t("sem entrada nenhuma, não se sabe: não é cego", !juizCego(null) && !juizCego(undefined) && !juizCego([]) && !juizCego("x"));
  const ac = { canone: { "Cabra Trêmula": {} } }, v = { lugaresNovos: [{ nome: "Cabra Trêmula" }] };
  t("cego, o cânone fica como o Cronista o deu", canoneSemInvencao(ac, v, { entrada: { lugares: ["Monte Rasa"], papeis: [] } }).tirados.length === 0 && canoneSemInvencao(ac, v, { entrada: { papeis: ["taverneiro"] } }).tirados.length === 1);
  /* as sessões de prova foram gravadas de registos sem a semente: a correção cala em todas */
  for (const ses of ["s8", "s9", "s10"]) {
    const S = ler(`sessao-${ses}.json`), R = resumoDaSessao(S);
    t(`a ${ses.slice(1)}.ª, gravada sem o mundo: o resumo diz os ${R.correcao.cegos} turnos cegos e não tira nada do cânone`, R.correcao.cegos === S.turnos.length && R.correcao.tirados.length === 0);
  }
  const N = resumoDaSessao(ler("sessao-navegador.json"));
  t("a sessão que o jogo gravou (o mundo inteiro na entrada): nada a corrigir, nada cego", N.correcao.cegos === 0 && N.correcao.vetos === 0 && N.correcao.tirados.length === 0);
}

sec("8. A VOLTA — a invenção que regressa, e a porta que a apanha");
{
  /* para cada veto do corpus, a primeira resposta seguinte (até seis) em
     que o Juiz, sem o eco das de antes, acha de novo a mesma contradição.
     É a medida do que o veto impede: o eco que faria do número um fato. */
  const voltas = [];
  for (const ses of ["s8", "s9", "s10"]) {
    const cs = VER.filter((c) => c.id.startsWith(ses + "#"));
    cs.forEach((c, k) => {
      for (const x of vetosDoVeredito(c.v, { turno: k })) {
        for (let d = 1; d <= 6 && k + d < cs.length; d++) {
          const w = julgarAProsa(cs[k + d].prosa, { ...cs[k + d].estado, antes: [] });
          if (vetosDoVeredito(w, { turno: k + d }).some((y) => y.alvo === x.alvo)) {
            const livro = andarOsVetos([], [x], { turno: k });
            voltas.push({ id: c.id, d, apanha: vetosParaAPauta(livro, { turno: k + d, frase: cs[k + d].estado.frase }).length > 0 });
            break;
          }
        }
      }
    });
  }
  /* MEDIDA (28/10): nenhuma — as seis contradições do corpus não voltam
     nas seis respostas seguintes. O veto é seguro de ter (não morde), não
     uma cura de algo que se viu acontecer; a prova de que ele apanha a
     volta é o caso escrito abaixo. */
  console.log(`     voltas da contradição no corpus: ${voltas.map((x) => `${x.id} +${x.d}${x.apanha ? " (o veto estava na pauta)" : ""}`).join(" · ") || "nenhuma"}`);
  t("toda volta do corpus no turno seguinte encontra o veto na pauta", voltas.filter((x) => x.d === 1).every((x) => x.apanha));
  /* o caso escrito: o elixir a 25 no turno 4; no 5 o jogador volta a ele */
  const v4 = julgarAProsa("O mercador ergue o frasco. 'Vinte e cinco marcos o elixir.'", { moeda: "marcos", mercado: [{ nome: "Elixir de Destreza", preco: 140 }] });
  const livro = andarOsVetos([], vetosDoVeredito(v4, { turno: 4, cidade: "A" }), { turno: 4, cidade: "A" });
  const p5 = vetosParaAPauta(livro, { turno: 5, cidade: "A", frase: "Pago os vinte e cinco pelo elixir." });
  t("o elixir inventado a 25 (a mesa: ◉ 140) volta na frase do jogador, e a pauta do turno leva o preço da mesa", p5.length === 1 && /◉ 140/.test(p5[0]), Js(p5));
}

sec("9. LIXO, DETERMINISMO, IMUTABILIDADE");
{
  let estourou = false;
  try {
    for (const x of [null, undefined, 3, "x", [], {}, { precosInventados: "x" }, { precosInventados: [null, 3, {}] }]) {
      vetosDoVeredito(x, x); andarOsVetos(x, x, x); vetosParaAPauta(x, x); canoneSemInvencao(x, x, x); especieDoAchado(x, x); juizCego(x);
    }
  } catch { estourou = true; }
  t("lixo não estoura", !estourou);
  t("lixo dá o vazio", vetosDoVeredito(null, null).length === 0 && andarOsVetos(null, null, null).length === 0 && vetosParaAPauta(null, null).length === 0 && Js(canoneSemInvencao(null, null)) === Js({ aceito: {}, tirados: [] }));
  t("o livro torto (vetos sem linha) não entra", vetosParaAPauta([{ turno: 1 }, null, { linha: "  " }], { turno: 2 }).length === 0);
  const congela = (x) => { if (x && typeof x === "object") { Object.values(x).forEach(congela); Object.freeze(x); } return x; };
  const c = VER.find((x) => x.id.startsWith("s9#41"));
  const v = congela(JSON.parse(Js(c.v)));
  const ac = congela({ canone: { "Elixir": {} } });
  let mexeu = false;
  try { const vs = vetosDoVeredito(v, congela({ turno: 4 })); andarOsVetos(congela(vs), congela([]), congela({ turno: 4 })); vetosParaAPauta(congela(vs), congela({ turno: 5 })); canoneSemInvencao(ac, v, congela({ estado: { npcs: {} } })); } catch { mexeu = true; }
  t("não mexe no que recebe (corre sobre o congelado)", !mexeu);
  t("a mesma entrada dá a mesma correção", Js(VER.map((x) => vetosDoVeredito(x.v, { turno: 3 }))) === Js(VER.map((x) => vetosDoVeredito(JSON.parse(Js(x.v)), { turno: 3 }))));
}

console.log(`\ncorreção do juiz: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
