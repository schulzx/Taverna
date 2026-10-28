/* jogar-em-node.mjs (Fase T1, trilha B · 27/10) — o jogo em Node

   O alvo da Fase 1 do plano do motor (mente/plano-motor.md): jogar 20
   turnos de um registo real SEM React e SEM rede, com a saída igual à do
   registo. O estado inicial é o "save" da 10.ª sessão de prova
   (`registo-s10-cena.json`: o herói, o grupo, as cidades; o registo de
   gente começa vazio, como no turno 1), a frase de cada turno é a do
   jogador, e a resposta do Narrador é a gravada — a "resposta falsa" que
   nenhuma chamada paga substitui.

   O TURNO, PASSO A PASSO (o que já é puro corre; o que ainda mora no App
   fica PENDENTE e diz quem o traz):

     1. `turno`   — o que anda ANTES de o Mestre responder: a frase que
                    leva o herói a um sítio ou a outra cidade
                    (moverParaLocal, viajar). Mora no App; vira o
                    `src/motor/turno.js` do oficial. Enquanto não existe, a
                    mudança de sítio que só ela explica é lida do registo
                    (o oráculo) e o turno conta como PENDENTE.
     2. a escuta  — `escuta.js#lerOPedido` (puro).
     3. EM CENA   — `em-cena.js#montarEmCena` (puro), com a gente da pauta
                    do registo como entrada (presentes/longe ainda são do
                    App) e a lista de antes encadeada turno a turno.
     4. `aplicar` — a resposta do Narrador sobre o estado. Mora no App
                    (`aplicarResposta`) e vira `src/motor/aplicar.js` do
                    oficial: quando o arquivo existir, este passo chama-o
                    — `aplicar(estado, { narrativa, mudancas }, { pedido })`,
                    que devolve `{ estado }` — e o estado dele segue o jogo.
     5. o Cronista — `motor/cronista.js#julgarOCronista` (puro), sobre a
                    proposta do turno refeita do registo do Cronista
                    (`registo-s8-s10-cronista.json`: os nomes que o
                    registo ganhou, o lugar da pauta seguinte), e o
                    `aceito` aplicado como a fiação do App o aplicará.

   A SAÍDA COMPARADA, por turno, contra a pauta que foi de verdade ao
   Narrador: a cidade, o sítio, a gente que o sistema conhece (todos os
   nomes da pauta, à frente e longe, estão no registo do estado) e o
   invariante do EM CENA (ninguém de LONGE na linha). Um turno "joga em
   Node" quando bate sem o oráculo.

   Hoje (27/10): 15 dos 20 turnos jogam em Node; os 5 pendentes são do
   passo 1 (três sítios pela frase, a estrada, e a viagem de Monte Rasa a
   Nova Profundo). A catraca é o número: menos do que 15 é regressão; mais
   é o motor do oficial a chegar, e a linha sobe com ele. Com o `aplicar`
   do oficial na árvore (em voo nesse dia), os 20 turnos já passam por ele
   — desde que a ficha traga as listas que a regra da ficha percorre
   (`inventario`, `habilidades`): sem elas, `regras-jogo.js` estoura.

   27/10, T1-B fatia 2 — O JOGO CRESCE:
   - o estouro está consertado em `regras-jogo.js#aplicarMudancas` (a ficha
     incompleta não derruba o turno; teste-ficha-incompleta.mjs), e o save de
     partida daqui deixa de levar as listas — é ele que o prova a jogar;
   - a 10.ª joga INTEIRA (secção 4: M1–M77, tudo o que o registo de cena
     tem com a pauta seguinte), com a mesma régua;
   - a 8.ª e a 9.ª jogam pelo registo do Cronista (secção 5): cada turno passa
     pelo `aplicar` e pelo `julgarOCronista`, e o estado tem de conhecer, ao
     fim do turno, a gente e o cânone que o registo conhecia no turno
     seguinte. O que entrou por outra porta do App (os nomes à mão, a luta)
     é PENDENTE e diz de quem é, como os sítios da secção 1.

   28/10, T1-B fatia 3 — O TURNO PASSA POR TUDO O QUE JÁ É MOTOR:
   - o REGISTO (`motor/aplicar.js#aplicarORegisto`, a 2.ª peça do oficial):
     o cânone e a gente que o Narrador declara, na posição do App — depois do
     `aplicar`, antes do Cronista. Os registos gravados não guardam o JSON de
     `mudancas` do Narrador (só a prosa), então a peça corre com `{}`: anda o
     contador da gente (`npcTurno`, um por turno) e a blindagem que põe no
     registo a PESSOA do cânone sem ficha; o resto não tem o que ler;
   - a SORTE DO TURNO (`motor/sorte-do-turno.js`): o `aplicar` rola a
     salvaguarda pelo fio `sorteNoPonto(…, "salvaguarda")`, como o App;
   - os NOMES À MÃO (`nomes.js#nomesAMaoNaProsa`): o nome oferecido na pauta
     ("a quem não tem nome: …", que o registo de cena da 10.ª guarda) e usado
     pela narração entra no registo, como no App;
   - o SÍTIO PELA FRASE (`lugar.js#lugarPedido` + `definirLugar`): a metade
     pura do passo 1 — "vou com Saoirse até a Cabra Trêmula" move ANTES do
     Mestre, com as guardas do `alvoLocalPedido` do App (frase vazia ou de
     sistema, luta, estrada). O que não muda: a LISTA de sítios a que se vai
     a pé. No App ela sai de `locaisDaCidade(semente do mundo, …)`, e o
     registo da 10.ª não guarda a semente; aqui ela é a PLANTA DO REGISTO (os
     sítios que a sessão pisou em cada cidade). A escolha entre eles é da
     régua pura; se ela levar o herói a outro sítio que não o do registo, o
     turno DIFERE (não fica pendente — o oráculo não esconde o erro). */
import fs from "node:fs";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (typeof cond === "function") { try { cond = cond(); } catch (e) { extra = String(e && e.message); cond = false; } }
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const J = JSON.stringify;
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const { lerOPedido } = await import("../src/escuta.js");
const { montarEmCena, EM_CENA_NA_PAUTA } = await import("../src/em-cena.js");
const { estadoDoSave } = await import("../src/estado.js");
const { julgarOCronista } = await import("../src/motor/cronista.js");

/* os passos do oficial: entram quando o arquivo existir */
const opcional = async (arq, nome) => {
  if (!fs.existsSync(new URL(arq, import.meta.url))) return null;
  try { const m = await import(arq); return typeof m[nome] === "function" ? m[nome] : null; } catch (e) { console.log(`  ..  ${arq} existe e não carrega: ${e.message}`); return null; }
};
const TURNO = await opcional("../src/motor/turno.js", "turno");
const APLICAR = await opcional("../src/motor/aplicar.js", "aplicar");
const REGISTO = await opcional("../src/motor/aplicar.js", "aplicarORegisto");
const { lugarPedido, definirLugar } = await import("../src/lugar.js");
const { sorteNoPonto, pontoDaSorte, CONTAGEM_VAZIA } = await import("../src/motor/sorte-do-turno.js");
const { nomesAMaoNaProsa } = await import("../src/nomes.js");
const { criarNPC } = await import("../src/npcs.js");
const { abrirASessao, gravarOTurno, validarASessao, reproduzirASessao } = await import("../src/sessao.js");
const { entradaDoJuiz, julgarOTurno } = await import("../src/motor/juiz-do-turno.js");
const GRAVAR = process.argv.includes("--gravar");

/* ---------------- A SESSÃO COMO ARQUIVO (28/10, T3-B) ----------------
   Cada turno jogado aqui vira uma linha do arquivo de sessão
   (src/sessao.js): a frase, o ponto da sorte, o pedido (a pauta que o
   registo guarda e os envelopes), a resposta gravada, a proposta e o juízo
   do Cronista, o veredito do Juiz e o estado do FIM do turno — já com o
   que o oráculo pôs. A secção 6 corre o replay sobre esses arquivos e
   confere que ele diverge exatamente onde o oráculo teve de mexer no
   estado. `node jogar-em-node.mjs --gravar` escreve-os em
   testes/sessao-s8.json, sessao-s9.json e sessao-s10.json, que a
   teste-sessao.mjs lê. */
const fotoDoJuiz = (E, narracoes, oferecidos) => ({ personagem: E.personagem, npcs: E.npcs, mapa: E.mapa, cidadeAtual: E.cidadeAtual, lugar: E.lugar, oferecidos, narracoes });
const vereditoDoJuiz = (E, narrativa, { narracoes, oferecidos, frase, pauta, turno }) => {
  const entrada = entradaDoJuiz(fotoDoJuiz(E, narracoes, oferecidos), { frase, pauta });
  return { resumo: julgarOTurno(narrativa, entrada, { turno, dia: E.dia || 0 }).resumo, entrada };
};
const pautaDoRegisto = (P) => [`ONDE: ${P.onde}`, `EM CENA: ${P.emCena}`, ...(P.longe.length ? [`LONGE: ${P.longe.join(" · ")}`] : [])].join("\n");
const escreverASessao = (nome, arq) => {
  const { turnos, ...cab } = arq;
  const txt = JSON.stringify(cab).slice(0, -1) + ",\"turnos\":[\n" + turnos.map((x) => JSON.stringify(x)).join(",\n") + "\n]}\n";
  fs.writeFileSync(new URL("./" + nome, import.meta.url), txt);
  console.log(`  ..  gravado testes/${nome} (${turnos.length} turnos, ${Math.round(txt.length / 1024)} KB)`);
};

/* ---------------- O QUE JÁ É MOTOR, PASSO A PASSO (28/10) ----------------
   Cada um devolve estado novo; nenhum muta o que recebe. */

/* a sorte do turno: o mesmo fio que o App pede (`sorteDoTurno("salvaguarda")`),
   com o ponto do instante (o dia, o minuto, as falas — aqui, o turno). Cada
   turno é um ponto novo e pede a salvaguarda uma vez: a contagem parte vazia. */
const sorteDoTurno = (E, semente, i) => sorteNoPonto(CONTAGEM_VAZIA, semente, pontoDaSorte({ dia: E.dia || 0, minuto: E.minuto || 0, falas: i }), "salvaguarda").sorte;

/* o registo: a 2.ª peça do oficial, com a resposta como o registo a guarda.
   `npcTurno` não mora no estado v2 (o App guarda-o num ref à parte): a
   partida dá-lhe 0, e a peça o anda. */
const passarPeloRegisto = (E, narrativa, passo) => {
  if (!REGISTO) { passo.registo = "pendente (aplicarORegisto ainda não existe)"; return E; }
  try {
    const r = REGISTO({ ...E, npcTurno: Number.isFinite(E.npcTurno) ? E.npcTurno : 0 }, { narrativa, mudancas: {} }, { mundo: null, baseDoNome: { heroi: E.personagem && E.personagem.nome } });
    if (r && r.estado) return r.estado;
    passo.avisoDoRegisto = "aplicarORegisto não devolveu { estado }";
  } catch (e) { passo.avisoDoRegisto = "aplicarORegisto estourou: " + e.message; }
  return E;
};

/* os nomes à mão: a linha da pauta → os oferecidos → os que a prosa usou */
const oferecidosDaLinha = (linha) => {
  const m = String(linha || "").match(/a quem não tem nome: (.+)$/m);
  return m ? m[1].split(" · ").map((x) => { const k = x.match(/^(.+?) \((ele|ela)\)$/); return k && { nome: k[1], genero: k[2] }; }).filter(Boolean) : [];
};
const passarPelosNomesAMao = (E, narrativa, oferecidos) => {
  const usados = nomesAMaoNaProsa(narrativa, oferecidos);
  if (!usados.length) return E;
  const npcs = { ...(E.npcs || {}) };
  for (const u of usados) {
    const chave = Object.keys(npcs).find((k) => sem(k) === sem(u.nome));
    if (chave) { if (u.morto && String(npcs[chave].status || "vivo").toLowerCase() === "vivo") npcs[chave] = { ...npcs[chave], status: "morto" }; continue; }
    const nome = String(u.nome).slice(0, 40);
    npcs[nome] = criarNPC(nome, { genero: u.genero === "ela" ? "mulher" : "homem", local: E.cidadeAtual || "", ultimaVez: E.npcTurno, conhecidoEm: E.dia, ...(u.morto ? { status: "morto" } : {}) });
  }
  return { ...E, npcs };
};

/* o sítio pela frase: as guardas do `alvoLocalPedido` do App, a régua pura,
   e o `definirLugar` do `moverParaLocal` (o tempo e a nota ao Mestre são da
   fiação, e o registo não os mede) */
const passarPeloSitio = (E, frase, planta) => {
  const cru = String(frase || "");
  if (!cru.trim() || cru.trimStart().startsWith("[") || E.combate || E.acampado || E.masmorra || E.jornada || !E.cidadeAtual) return { E };
  const alvo = lugarPedido(cru, planta[E.cidadeAtual] || []);
  if (!alvo || !alvo.nome) return { E };
  if (E.lugar && sem(E.lugar.nome) === sem(alvo.nome)) return { E };
  const novo = definirLugar(alvo.nome, { cidade: E.cidadeAtual, dia: E.dia || 0, distancia: alvo.onde === "arredores" ? "arredores" : "dentro" });
  return novo ? { E: { ...E, lugar: novo }, moveu: novo.nome } : { E };
};

const R = JSON.parse(fs.readFileSync(new URL("./registo-s10-cena.json", import.meta.url), "utf8"));
const RC = JSON.parse(fs.readFileSync(new URL("./registo-s8-s10-cronista.json", import.meta.url), "utf8"));
const CR = RC.turnos.filter((x) => x.ses === "s10");
const TURNOS = 20;

/* "na Cabra Trêmula, dentro de Monte Rasa" → { lugar, cidade } */
const lerOnde = (onde) => {
  const s = String(onde || "").trim();
  let m = s.match(/^(?:na|no|nas|nos|em) (.+?), dentro de (.+)$/);
  if (m) return { lugar: m[1], cidade: m[2], estrada: false };
  m = s.match(/^em (.+?)(?: \(.+\))?$/);
  if (m) return { lugar: null, cidade: m[1], estrada: false };
  m = s.match(/^(.+?) em (.+)$/);
  if (m) return { lugar: m[1], cidade: m[2], estrada: false };
  return { lugar: null, cidade: null, estrada: /estrada/.test(s) };
};
const cidades = [...new Set(R.pautas.map((p) => p.cidade))];
/* a planta do registo: os sítios que a 10.ª pisou em cada cidade (ver o
   cabeçalho, 28/10 — o registo não guarda a semente do mundo) */
const PLANTA = {};
for (const p of R.pautas) { const d = lerOnde(p.onde); if (d.lugar && d.cidade && !(PLANTA[d.cidade] || []).some((l) => l.nome === d.lugar)) PLANTA[d.cidade] = [...(PLANTA[d.cidade] || []), { nome: d.lugar, onde: "dentro" }]; }

/* ---------------- O SAVE DE PARTIDA ----------------
   O estado v2 de `estado.js`, a partir do que o registo diz do começo: o
   herói e a companheira, a cidade de chegada, o mapa das cidades que a
   sessão pisou. O registo de gente começa vazio (no turno 1 o sistema
   ainda não conhecia ninguém além da Saoirse, que viaja com ela). */
const inicio = () => estadoDoSave({
  /* a ficha SEM as listas da bolsa e das habilidades, de propósito (27/10,
     T1-B fatia 2): até ao conserto de `aplicarMudancas` ela estourava aqui, e
     o save de partida tinha de as trazer. Um save mínimo tem de jogar. */
  personagem: { nome: R.heroi, classe: "Guerreiro", nivel: 1, xp: 0, vida: 12, vidaMax: 12, mana: 0, manaMax: 0, moedas: 25, condicoes: [], equipado: {}, grupo: [{ nome: "Saoirse", vida: 10, vidaMax: 10 }] },
  cidadeAtual: R.pautas[0].cidade,
  lugar: null,
  jornada: null,
  mapa: { cidades: cidades.map((nome) => ({ nome })) },
  npcs: {},
  canone: {},
  combate: null,
});

/* ---------------- A PROPOSTA DO CRONISTA, REFEITA ----------------
   O registo não guarda o JSON cru: guarda o que o registo conhecia antes e
   depois, e as secções que trouxeram coisa nova. */
const propostaDoTurno = (i) => {
  const a = CR[i], b = CR[i + 1];
  if (!a) return {};
  const prop = {};
  const novos = b ? [...new Set(b.conhecidos)].filter((x) => !a.conhecidos.includes(x) && !cidades.includes(x)) : [];
  const pessoas = novos.map((n) => Object.values(R.npcs).find((x) => sem(x.nome) === sem(n))).filter(Boolean);
  if (pessoas.length) prop.pessoas = pessoas.map((p) => ({ ...p }));
  const coisas = novos.filter((n) => !pessoas.some((p) => sem(p.nome) === sem(n)));
  if (coisas.length) prop.canone = Object.fromEntries(coisas.map((n) => [n, { tipo: "artefato", descricao: "—" }]));
  if (a.util.includes("lugar") && R.pautas[i + 1]) {
    const d = lerOnde(R.pautas[i + 1].onde);
    if (d.cidade) prop.lugar = d.lugar || "cidade";
  }
  return prop;
};

/* ---------------- O ACEITO NO ESTADO ----------------
   O que a fiação do App fará com o `aceito` (o diário de 27/10, T1-B), em
   miniatura: a gente nova no registo, o cânone novo, o lugar. Substitui,
   nunca muta. */
const aplicarOCronista = (E, aceito) => {
  let e = E;
  if (aceito.pessoas) {
    const npcs = { ...e.npcs };
    for (const p of aceito.pessoas) if (!Object.keys(npcs).some((k) => sem(k) === sem(p.nome))) npcs[p.nome] = { ...p };
    e = { ...e, npcs };
  }
  if (aceito.canone) {
    const canone = { ...(e.canone || {}) };
    for (const [n, f] of Object.entries(aceito.canone)) if (!Object.keys(canone).some((k) => sem(k) === sem(n))) canone[n] = { ...f };
    e = { ...e, canone };
  }
  if (aceito.lugar) e = { ...e, lugar: /^cidade$/i.test(aceito.lugar) ? null : { nome: aceito.lugar, distancia: "dentro", cidade: e.cidadeAtual } };
  return e;
};

/* ---------------- UM TURNO ---------------- */
const jogar = async (turnos = TURNOS) => {
  let E = inicio();
  let antes = null;
  const log = [];
  let sessao = abrirASessao({ semente: "s10", estado: E, origem: "registo-s10-cena.json (a 10.ª sessão de prova), jogado por testes/jogar-em-node.mjs" });
  for (let i = 0; i < turnos; i++) {
    const P = R.pautas[i];
    const passo = { i: i + 1, pendente: [], difere: [] };
    const lugaresDaqui = PLANTA[E.cidadeAtual] || [];
    /* 1 · o turno: o que anda antes do Mestre */
    let moveu = null;
    if (TURNO) {
      try { const r = TURNO(E, { frase: P.frase }); if (r && r.estado) E = r.estado; } catch (e) { passo.pendente.push("turno estourou: " + e.message); }
    } else {
      /* a metade pura do passo 1: o sítio pela frase (28/10) */
      const s = passarPeloSitio(E, P.frase, PLANTA);
      E = s.E; moveu = s.moveu || null;
    }
    const alvo = lerOnde(P.onde);
    const sitio = E.lugar && E.lugar.nome ? E.lugar.nome : null;
    const naEstrada = !!E.jornada;
    const bateCidade = !alvo.cidade || sem(E.cidadeAtual) === sem(alvo.cidade);
    const bateSitio = alvo.estrada ? naEstrada : sem(sitio) === sem(alvo.lugar);
    if (moveu) passo.moveu = moveu;
    /* o que um órgão do App fez neste turno, e o oráculo pôs no lugar dele:
       vai à linha do arquivo (`app`), e é por ela que o replay diz que a
       divergência é dívida do App e não defeito do motor (sessao.js) */
    const app = [];
    if (moveu && (!bateCidade || !bateSitio)) {
      /* a régua pura moveu, e para outro sítio: é erro do motor, não falta dele */
      passo.difere.push(`o sítio pela frase levou a ${moveu}; o registo diz ${alvo.estrada ? "a estrada" : alvo.lugar || alvo.cidade || "—"}`);
      passo.oraculo = true;
      E = { ...E, cidadeAtual: alvo.cidade || E.cidadeAtual, lugar: alvo.lugar ? { nome: alvo.lugar, distancia: "dentro", cidade: alvo.cidade } : null, jornada: alvo.estrada ? { destino: E.cidadeAtual } : null };
    } else if (!bateCidade || !bateSitio) {
      passo.pendente.push(!bateCidade ? `viagem ${E.cidadeAtual} → ${alvo.cidade} (turno: viajar)` : `sítio ${sitio || "—"} → ${alvo.estrada ? "a estrada" : alvo.lugar || "—"} (turno: moverParaLocal)`);
      app.push({ orgao: !bateCidade ? "viajar (o passo antes do Mestre)" : "moverParaLocal (o passo antes do Mestre)", campos: ["cidadeAtual", "lugar", "jornada"], o: passo.pendente[passo.pendente.length - 1] });
      /* o oráculo: o registo diz onde o turno a deixou */
      passo.oraculo = true;
      E = { ...E, cidadeAtual: alvo.cidade || E.cidadeAtual, lugar: alvo.lugar ? { nome: alvo.lugar, distancia: "dentro", cidade: alvo.cidade } : null, jornada: alvo.estrada ? { destino: E.cidadeAtual } : null };
    }
    /* a gente que a pauta deste turno nomeia, o sistema tem de a conhecer */
    const grupo = (E.personagem.grupo || []).map((g) => sem(g.nome));
    /* "+1." é a marca de transbordo da linha LONGE da pauta ("… e mais um"),
       não um nome: lida como gente, fazia M63–M77 diferirem por ninguém. */
    const nomesDaPauta = [...P.presentes.map((x) => x.nome), ...P.longe].filter((n) => !grupo.includes(sem(n)) && !/^\+\d+\.?$/.test(String(n).trim()));
    const conhece = new Set(Object.keys(E.npcs || {}).map(sem));
    const desconhecidos = nomesDaPauta.filter((n) => !conhece.has(sem(n)));
    if (desconhecidos.length) passo.difere.push("gente: " + desconhecidos.join(","));
    /* 2 · a escuta */
    const pedido = lerOPedido(P.frase);
    passo.pedido = { doJogador: pedido.doJogador, pergunta: pedido.pergunta };
    /* 3 · o EM CENA, encadeado */
    const presentes = P.presentes.filter((x) => !/viaja/.test(x.motivo)).map((x) => ({ ...(Object.values(E.npcs || {}).find((n) => sem(n.nome) === sem(x.nome)) || {}), nome: x.nome }));
    const lista = montarEmCena({ semente: "s10", turno: i + 1, cidade: E.cidadeAtual, presentes, longe: P.longe, grupo: (E.personagem.grupo || []).map((g) => ({ nome: g.nome })), comigo: [], mostrado: R.respostas.slice(Math.max(0, i - 2), i), frase: P.frase, lugar: { nome: P.onde }, antes });
    antes = lista;
    const L = new Set(P.longe.map(sem));
    const linha = lista.filter((x) => x.tipo === "pessoa" && x.aqui).slice(0, EM_CENA_NA_PAUTA.pessoa).map((x) => x.nome);
    if (linha.some((g) => L.has(sem(g)))) passo.difere.push("EM CENA com gente de LONGE: " + linha.join(","));
    passo.emCena = linha;
    /* 4 · o aplicar: a resposta do Narrador (a gravada) */
    const resposta = R.respostas[i];
    const ponto = pontoDaSorte({ dia: E.dia || 0, minuto: E.minuto || 0, falas: i });
    const oferecidos = oferecidosDaLinha(P.emCena);
    const juiz = vereditoDoJuiz(E, resposta, { narracoes: R.respostas.slice(0, i), oferecidos, frase: P.frase, pauta: pautaDoRegisto(P), turno: i + 1 });
    if (APLICAR) {
      try { const r = APLICAR(E, { narrativa: resposta, mudancas: {} }, { pedido: P.frase, envelopes: "", sorte: sorteDoTurno(E, "s10", i) }); if (r && r.estado) E = r.estado; else passo.avisoDoAplicar = "aplicar não devolveu { estado }"; } catch (e) { passo.avisoDoAplicar = "aplicar estourou: " + e.message; }
    } else passo.aplicar = "pendente (src/motor/aplicar.js ainda não existe)";
    /* 4b · o registo (o cânone e a gente do Narrador) e os nomes à mão */
    E = passarPeloRegisto(E, resposta, passo);
    E = passarPelosNomesAMao(E, resposta, oferecidosDaLinha(P.emCena));
    /* 5 · o Cronista: propõe, o motor decide */
    const prop = propostaDoTurno(i);
    const juizo = julgarOCronista(E, prop, { narrativa: resposta, pedido: P.frase });
    passo.cronista = { aceito: Object.keys(juizo.aceito), recusado: juizo.recusado.map((x) => `${x.secao}:${x.porque}`), dito: juizo.ditoPor.map((x) => x.o) };
    E = aplicarOCronista(E, juizo.aceito);
    passo.jogou = !passo.pendente.length && !passo.difere.length;
    log.push(passo);
    sessao = gravarOTurno(sessao, {
      entrada: { frase: P.frase, lugaresDaqui }, sorte: { ponto },
      pedido: { pauta: pautaDoRegisto(P), envelopes: "", nomesAMao: oferecidos },
      narrador: { narrativa: resposta, mudancas: {} },
      cronista: { proposta: prop, juizo: { aceito: juizo.aceito, recusado: juizo.recusado, ditoPor: juizo.ditoPor } },
      juiz, estado: E, app,
    });
  }
  return { log, fim: E, sessao };
};

/* ============================================================ */
sec(`1. A 10.ª SESSÃO, ${TURNOS} TURNOS, SEM REACT E SEM REDE`);
const um = await jogar();
for (const p of um.log) console.log(`  ..  M${p.i}: ${p.jogou ? "joga" : p.difere.length ? "DIFERE — " + p.difere.join(" · ") : "pendente — " + p.pendente.join(" · ")}${p.cronista.aceito.length ? `  [Cronista: ${p.cronista.aceito.join(",")}${p.cronista.recusado.length ? " / recusa " + p.cronista.recusado.join(",") : ""}${p.cronista.dito.length ? " / dito " + p.cronista.dito.join(",") : ""}]` : ""}`);
const jogados = um.log.filter((p) => p.jogou).length;
const difere = um.log.filter((p) => p.difere.length);
t(`${TURNOS} turnos jogados do princípio ao fim, sem estourar`, um.log.length === TURNOS);
t("nenhum turno com a saída DIFERENTE do registo (a gente, o EM CENA)", difere.length === 0, difere.map((p) => `M${p.i}: ${p.difere.join(" · ")}`).join(" | "));
/* MEDIDA (27/10): 15. Os 5 pendentes eram do passo 1 — o `turno` do
   oficial. Quando ele chegar, este número sobe e a linha sobe com ele.
   MEDIDA (28/10, T1-B fatia 3): 17 — o sítio pela frase (a metade pura do
   passo 1) leva M4 e M15; ficam a viagem (M13), a estrada (M17) e a saída
   da Cabra (M9), que o registo mostra e a frase do turno não pede. */
t(`${jogados} de ${TURNOS} turnos jogam em Node sem o oráculo (a medida de 28/10: 17)`, jogados >= 17, `${jogados}`);
const pend = um.log.filter((p) => p.pendente.length).map((p) => `M${p.i} ${p.pendente.join(" · ")}`);
console.log("  ..  pendentes, e de quem: " + (pend.join(" | ") || "nenhum"));
t("todo pendente diz de quem é", um.log.every((p) => p.pendente.every((x) => /\((turno|aplicar)[:)]|estourou|não devolveu/.test(x))));
/* o aplicar do oficial nasce a meio da fase: se ainda não aceita
   (estado, { narrativa, mudancas }, { pedido }), o passo avisa e não derruba a suíte —
   o número de turnos jogados é que diz se o jogo andou */
if (!APLICAR) t("o aplicar do oficial: pendente — o passo espera src/motor/aplicar.js", um.log.every((p) => /pendente/.test(p.aplicar)));
else {
  const falhas = um.log.filter((p) => p.avisoDoAplicar);
  if (falhas.length) console.log(`  ..  o aplicar existe e ainda não joga (${falhas.length} turnos, que seguem sem ele): ${falhas[0].avisoDoAplicar}`);
  else t("o aplicar do oficial: presente, e os 20 turnos passam por ele", true);
}
/* 28/10: o registo (a 2.ª peça do oficial) corre em todo turno, na posição
   do App, e o contador da gente anda um por turno — é o que prova que a
   peça foi chamada com a resposta e devolveu estado (sem mudancas gravadas,
   é o que ela tem para fazer) */
if (REGISTO) {
  t("o registo do oficial: presente, e os 20 turnos passam por ele", um.log.every((p) => !p.avisoDoRegisto), (um.log.find((p) => p.avisoDoRegisto) || {}).avisoDoRegisto);
  t("e o contador da gente anda um por turno (npcTurno 0 → 20)", um.fim.npcTurno === TURNOS, String(um.fim.npcTurno));
}
t("o sítio pela frase move antes do Mestre: M4 «Vou com Saoirse até a Cabra Trêmula» e M15", ["4", "15"].every((k) => (um.log[Number(k) - 1] || {}).moveu && um.log[Number(k) - 1].jogou), J(um.log.filter((p) => p.moveu).map((p) => [p.i, p.moveu])));

sec("2. O FIM DO JOGO — o que o estado sabe ao fim de 20 turnos");
{
  const npcs = Object.keys(um.fim.npcs || {});
  t("o registo de gente do estado tem os três que a sessão conheceu até M20", ["Godfrey da Foz", "Nyla Punho-de-Pedra", "Torvald da Urze"].every((n) => npcs.includes(n)), J(npcs));
  t("o cânone tem o rumor marcado como palavra («o Rei Emprestado acordou, dizem»)", !!(um.fim.canone || {})["Rei Emprestado"] && /dito por/.test(um.fim.canone["Rei Emprestado"].dito || ""), J(um.fim.canone));
  t("o herói acaba no Rossio Torto, em Nova Profundo (como a pauta de M21)", um.fim.cidadeAtual === "Nova Profundo" && um.fim.lugar && um.fim.lugar.nome === lerOnde(R.pautas[TURNOS].onde).lugar, J(um.fim.lugar));
  t("o estado do fim continua um estado v2 (a versão e os campos)", um.fim.versao === 2 && "prometido" in um.fim && "desdeMundo" in um.fim);
}

sec("3. DETERMINISMO — jogar duas vezes dá o mesmo jogo");
{
  const dois = await jogar();
  t("o mesmo registo, o mesmo log e o mesmo estado final", J(dois) === J(um));
}

sec("4. A 10.ª INTEIRA — M1 a M77, a mesma régua");
const TODA = R.pautas.length - 1; /* o último turno precisa da pauta seguinte */
const toda = await jogar(TODA);
{
  const jog = toda.log.filter((p) => p.jogou).length;
  const dif = toda.log.filter((p) => p.difere.length);
  const pen = toda.log.filter((p) => p.pendente.length);
  const porDono = {};
  for (const p of pen) for (const x of p.pendente) { const d = (x.match(/\((turno: \w+)\)/) || [, "outro"])[1]; porDono[d] = (porDono[d] || 0) + 1; }
  console.log(`  ..  ${jog} jogam, ${pen.length} pendentes (${Object.entries(porDono).map(([k, v]) => `${k} ${v}`).join(", ")}), ${dif.length} diferem`);
  t(`${TODA} turnos jogados do princípio ao fim, sem estourar`, toda.log.length === TODA);
  t("nenhum turno com a saída DIFERENTE do registo", dif.length === 0, dif.map((p) => `M${p.i}: ${p.difere.join(" · ")}`).join(" | "));
  /* MEDIDA (27/10, T1-B fatia 2): 62 de 77. Os 15 pendentes são todos do
     passo antes do Mestre (10 sítios pela frase, 5 viagens) — o `turno`.
     MEDIDA (28/10, T1-B fatia 3): 68 de 77 — o sítio pela frase leva seis
     (M4, M15, M30, M37, M43, M47) e não leva ninguém ao sítio errado; ficam
     5 viagens e 4 sítios que a frase do turno não pede (a estrada, a saída,
     a chegada da viagem, a estalagem do «continuar»). */
  t(`${jog} de ${TODA} turnos jogam em Node sem o oráculo (a medida de 28/10: 68)`, jog >= 68, `${jog}`);
  t("todo pendente da 10.ª inteira é do passo antes do Mestre", pen.every((p) => p.pendente.every((x) => /\(turno: (moverParaLocal|viajar)\)/.test(x))));
  /* a sequência mais longa sem oráculo: a meta da fase são 20 seguidos */
  let corrida = 0, maior = 0;
  for (const p of toda.log) { corrida = p.jogou ? corrida + 1 : 0; maior = Math.max(maior, corrida); }
  console.log(`  ..  a corrida mais longa sem oráculo: ${maior} turnos seguidos (a meta da fase: 20)`);
  /* MEDIDA (28/10, T1-B fatia 3): 17 (era 11). Catraca: não desce. */
  t(`a corrida mais longa da 10.ª, com a régua inteira: ${maior} (a medida de 28/10: 17)`, maior >= 17, String(maior));
  t("os 20 primeiros da 10.ª inteira são os da secção 1 (o prefixo é o mesmo jogo)", J(toda.log.slice(0, TURNOS)) === J(um.log));
}

sec("5. A 8.ª E A 9.ª PELO REGISTO DO CRONISTA — o aplicar e o juízo, turno a turno");
/* O registo do Cronista (registo-s8-s10-cronista.json) guarda, por turno, a
   narração, a frase, os títulos dos envelopes e o que o registo do jogo
   conhecia ANTES (a gente, o cânone, o grupo, o herói). Jogar é: aplicar a
   narração, propor ao Cronista o que o registo ganhou (refeito como na
   secção 1 e em teste-cronista-propoe), julgar, aplicar o aceito; e, ao
   fim do turno, o estado tem de conhecer o que o registo conhecia no turno
   seguinte — nem menos (o motor recusou o que era certo), nem mais (inventou).
   O nome que chegou sem o Cronista o ter trazido (`util` sem pessoa/cânone)
   entrou por outra porta do App — os nomes à mão da pauta, a luta — e é
   PENDENTE, com o oráculo a pô-lo no estado para não sujar os turnos de
   depois. */
const jogarDoCronista = (ses) => {
  const L = RC.turnos.filter((x) => x.ses === ses);
  const c0 = [...new Set(L[0].conhecidos)];
  const heroi = c0[c0.length - 1], companheira = c0[0];
  let E = estadoDoSave({ personagem: { nome: heroi, classe: "Guerreiro", nivel: 1, xp: 0, vida: 12, vidaMax: 12, mana: 0, manaMax: 0, moedas: 25, grupo: [{ nome: companheira, vida: 10, vidaMax: 10 }] }, cidadeAtual: "", lugar: null, mapa: { cidades: [] }, npcs: {}, canone: {}, combate: null });
  const conhecidos = (e) => new Set([e.personagem.nome, ...(e.personagem.grupo || []).map((g) => g.nome), ...Object.keys(e.npcs || {}), ...Object.keys(e.canone || {})].map(sem));
  const log = [];
  /* OS COMBATENTES SÃO DA LUTA, NÃO DO REGISTO DE GENTE: o registo conhece o
     Zumbi enquanto a luta dura e esquece-o quando ela acaba. O oráculo põe-nos
     aqui, à parte do estado, e eles saem quando o registo os larga. */
  let daLuta = new Set();
  let sessao = abrirASessao({ semente: ses, estado: E, origem: "registo-s8-s10-cronista.json (a " + ses.slice(1) + ".ª sessão de prova), jogado por testes/jogar-em-node.mjs" });
  for (let i = 0; i < L.length - 1; i++) {
    const a = L[i], b = L[i + 1];
    const passo = { k: a.k, pendente: [], difere: [] };
    const env = (a.envelopes || []).join("\n");
    const ponto = pontoDaSorte({ dia: E.dia || 0, minuto: E.minuto || 0, falas: i });
    const juiz = vereditoDoJuiz(E, a.narrativa, { narracoes: L.slice(0, i).map((x) => x.narrativa), oferecidos: [], frase: a.frase, pauta: "", turno: i + 1 });
    const r = APLICAR(E, { narrativa: a.narrativa, mudancas: {} }, { pedido: a.frase, envelopes: env, sorte: sorteDoTurno(E, ses, i) });
    if (!r || !r.estado) { passo.difere.push("aplicar não devolveu { estado }"); log.push(passo); continue; }
    E = passarPeloRegisto(r.estado, a.narrativa, passo);
    if (passo.avisoDoRegisto) { passo.difere.push(passo.avisoDoRegisto); log.push(passo); continue; }
    const ja = conhecidos(E);
    const novos = [...new Set(b.conhecidos)].filter((x) => !ja.has(sem(x)));
    const doCronista = a.util.includes("pessoa") || a.util.includes("canone");
    const prop = {};
    if (doCronista) {
      const pessoa = a.util.includes("pessoa") && !a.util.includes("canone");
      if (pessoa) prop.pessoas = novos.map((nome) => ({ nome, genero: "" }));
      else prop.canone = Object.fromEntries(novos.map((n) => [n, { tipo: "artefato", descricao: "—" }]));
    }
    const juizo = julgarOCronista(E, prop, { narrativa: a.narrativa, pedido: a.frase, envelopes: env });
    E = aplicarOCronista(E, juizo.aceito);
    const esperado = new Set(b.conhecidos.map(sem));
    daLuta = new Set([...daLuta].filter((x) => esperado.has(x)));
    const depois = new Set([...conhecidos(E), ...daLuta]);
    const faltam = [...new Set(b.conhecidos)].filter((x) => !depois.has(sem(x)));
    const sobram = [...depois].filter((x) => !esperado.has(x));
    const app = [];
    if (faltam.length) {
      const luta = a.emLuta || b.emLuta;
      /* a luta guarda os combatentes fora do estado: a linha diz que o App
         os teve, sem campo nenhum a divergir; o nome à mão que este registo
         não gravou entra no registo, e a linha diz qual */
      if (!doCronista) app.push(luta ? { orgao: "a luta (os combatentes, que o registo conhece e a luta guarda fora do estado)", campos: [], o: faltam.join(",") } : { orgao: "os nomes à mão da pauta (que o registo do Cronista não gravou)", campos: faltam.map((n) => "npcs." + n), o: faltam.join(",") });
      if (!doCronista) passo.pendente.push(`${faltam.join(",")} (App: ${luta ? "a luta" : "os nomes à mão"})`);
      else passo.difere.push("o motor recusou: " + faltam.join(","));
      /* o oráculo: o registo diz que o jogo os conhecia */
      if (luta && !doCronista) daLuta = new Set([...daLuta, ...faltam.map(sem)]);
      else { passo.oraculo = true; E = { ...E, npcs: { ...E.npcs, ...Object.fromEntries(faltam.map((n) => [n, { nome: n }])) } }; }
    }
    if (sobram.length) passo.difere.push("o estado conhece o que o registo não conhecia: " + sobram.join(","));
    passo.jogou = !passo.pendente.length && !passo.difere.length;
    log.push(passo);
    sessao = gravarOTurno(sessao, {
      entrada: { frase: a.frase }, sorte: { ponto },
      pedido: { pauta: "", envelopes: a.envelopes || [] },
      narrador: { narrativa: a.narrativa, mudancas: {} },
      cronista: { proposta: prop, juizo: { aceito: juizo.aceito, recusado: juizo.recusado, ditoPor: juizo.ditoPor } },
      juiz, estado: E, app,
    });
  }
  return { log, fim: E, sessao };
};
const SESSOES_DO_CRONISTA = { s8: null, s9: null };
for (const ses of Object.keys(SESSOES_DO_CRONISTA)) {
  if (!APLICAR) { t(`${ses}: pendente — o passo espera src/motor/aplicar.js`, true); continue; }
  const r = jogarDoCronista(ses);
  SESSOES_DO_CRONISTA[ses] = r;
  const jog = r.log.filter((p) => p.jogou).length;
  const pen = r.log.filter((p) => p.pendente.length);
  const dif = r.log.filter((p) => p.difere.length);
  console.log(`  ..  ${ses}: ${jog} de ${r.log.length} jogam; pendentes ${pen.map((p) => `#${p.k} ${p.pendente.join(" · ")}`).join(" | ") || "nenhum"}`);
  t(`${ses}: ${r.log.length} turnos pelo aplicar e pelo juízo, sem estourar`, r.log.length === RC.turnos.filter((x) => x.ses === ses).length - 1);
  t(`${ses}: nenhum turno DIFERE do registo (o motor não recusa o certo nem inventa)`, dif.length === 0, dif.map((p) => `#${p.k}: ${p.difere.join(" · ")}`).join(" | "));
  let corrida = 0, maior = 0;
  for (const p of r.log) { corrida = p.jogou ? corrida + 1 : 0; maior = Math.max(maior, corrida); }
  r.maior = maior;
  console.log(`  ..  ${ses}: a corrida mais longa sem oráculo: ${maior} turnos seguidos`);
  t(`${ses}: todo pendente diz de quem é (o App: os nomes à mão, a luta)`, pen.every((p) => p.pendente.every((x) => /\(App: (a luta|os nomes à mão)\)/.test(x))));
}
/* MEDIDA (27/10, T1-B fatia 2): s8 62 de 70, s9 45 de 47. */
{
  const jog = (ses) => (SESSOES_DO_CRONISTA[ses] ? SESSOES_DO_CRONISTA[ses].log.filter((p) => p.jogou).length : 0);
  if (APLICAR) t(`a 8.ª e a 9.ª: ${jog("s8")} + ${jog("s9")} turnos jogam em Node sem o oráculo (a medida de 27/10: 62 + 45)`, jog("s8") >= 62 && jog("s9") >= 45);
  /* A META DA FASE (20 turnos seguidos com a saída igual ao registo) é batida
     na 8.ª (22 seguidos) e na 9.ª (29, depois do último nome à mão) — com a
     régua desta secção, que é a gente e o cânone: o registo do Cronista não
     guarda o lugar de cada turno. Na 10.ª, com a régua inteira (o lugar
     também), a corrida é de 11: o que a parte é o `turno` (secção 4). */
  if (APLICAR) t(`a meta da fase: 20 turnos seguidos iguais ao registo (a 8.ª: ${SESSOES_DO_CRONISTA.s8.maior}, a 9.ª: ${SESSOES_DO_CRONISTA.s9.maior})`, SESSOES_DO_CRONISTA.s8.maior >= 20 && SESSOES_DO_CRONISTA.s9.maior >= 20);
  if (APLICAR) t("e jogar duas vezes dá o mesmo jogo", ["s8", "s9"].every((x) => { const de = jogarDoCronista(x), ja = SESSOES_DO_CRONISTA[x]; return J({ log: de.log, fim: de.fim }) === J({ log: ja.log, fim: ja.fim }); }));
}

sec("6. A SESSÃO COMO ARQUIVO — o replay diverge onde o oráculo mexeu no estado, e só ali");
/* O arquivo de cada sessão foi gravado turno a turno acima (src/sessao.js).
   O replay corre os passos puros sobre o estado GRAVADO do turno anterior,
   com as respostas gravadas, e compara com o gravado do fim do turno. Um
   turno que este jogo jogou sem oráculo tem de reproduzir; um em que o
   oráculo pôs no estado o que o motor não pôs (o sítio, a viagem, o nome à
   mão que a pauta não ofereceu) pode divergir — e, quando diverge, é num
   desses. Dois casos reproduzem sem que este jogo os jogue, e a suíte
   nomeia-os em vez de os esconder:
     · a LUTA é o único pendente que o oráculo deixa FORA do estado
       (`daLuta`): o arquivo não tem ali o que divergir;
     · o oráculo que mexe ANTES do Mestre e cujo toque não chega ao fim do
       turno: em M69 da 10.ª ele põe o herói na estalagem, e o lugar do
       Cronista põe-no lá outra vez — o fim do turno sai igual, e é o fim
       do turno que o arquivo guarda. */
{
  const { estadoNoTurno } = await import("../src/sessao.js");
  const { saveDoEstado } = await import("../src/estado.js");
  const SESSOES = { s10: toda, s8: SESSOES_DO_CRONISTA.s8, s9: SESSOES_DO_CRONISTA.s9 };
  let reproduzidos = 0, jogados = 0, total = 0;
  const foraDoEstado = [], igualNoFim = [];
  for (const [ses, r] of Object.entries(SESSOES)) {
    if (!r || !r.sessao) { t(`${ses}: sem arquivo — o passo espera src/motor/aplicar.js`, true); continue; }
    const v = validarASessao(r.sessao);
    t(`${ses}: o arquivo gravado é válido (${r.sessao.turnos.length} turnos)`, v.ok, J(v.erros.slice(0, 3)));
    t(`${ses}: e refaz o estado do fim do jogo, byte a byte`, J(estadoNoTurno(r.sessao, r.sessao.turnos.length)) === J(JSON.parse(J(saveDoEstado(r.fim)))));
    const rep = reproduzirASessao(r.sessao);
    const comOraculo = r.log.map((p, i) => (p.oraculo ? i + 1 : null)).filter(Boolean);
    t(`${ses}: o replay só diverge em turnos em que o oráculo mexeu no estado (${rep.divergentes.length} de ${comOraculo.length})`, rep.divergentes.every((n) => comOraculo.includes(n)), `replay: ${rep.divergentes.join(",")} · oráculo: ${comOraculo.join(",")}`);
    const semOraculo = r.log.map((p, i) => (!p.jogou && !p.oraculo ? `${ses}#${i + 1}` : null)).filter(Boolean);
    foraDoEstado.push(...semOraculo);
    igualNoFim.push(...comOraculo.filter((n) => !rep.divergentes.includes(n)).map((n) => `${ses}#${n}`));
    t(`${ses}: todo turno que diverge diz porquê, e o porquê é do App (o passo antes do Mestre, a gente do turno)`, rep.turnos.filter((x) => !x.igual).every((x) => x.porque.length && x.porque.every((p) => /\bApp\b/.test(p))), J(rep.turnos.filter((x) => !x.igual).map((x) => [x.n, x.porque])).slice(0, 300));
    console.log(`  ..  ${ses}: o replay reproduz ${rep.reproduzidos} de ${rep.turnos.length}; diverge em ${rep.divergentes.join(",") || "nenhum"}`);
    reproduzidos += rep.reproduzidos; jogados += r.log.filter((p) => p.jogou).length; total += r.log.length;
    if (GRAVAR) escreverASessao(`sessao-${ses}.json`, r.sessao);
  }
  console.log(`  ..  o replay reproduz ${reproduzidos} de ${total}; este jogo joga ${jogados} de ${total} sem oráculo; a diferença: a luta, fora do estado (${foraDoEstado.join(", ") || "nenhum"}), e o oráculo que não chega ao fim do turno (${igualNoFim.join(", ") || "nenhum"})`);
  /* MEDIDA (28/10, T3-B): 180 reproduzidos, 175 jogados — os 4 da luta da
     8.ª e o M69 da 10.ª. */
  t(`e a diferença entre os dois são esses ${foraDoEstado.length + igualNoFim.length}, e só eles`, reproduzidos - jogados === foraDoEstado.length + igualNoFim.length);
}

console.log(`\njogar-em-node: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
