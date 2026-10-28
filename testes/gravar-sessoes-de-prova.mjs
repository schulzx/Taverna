/* gravar-sessoes-de-prova.mjs (Fase T3, trilha B · 28/10/2026) — os registos viram arquivos de sessão

   As três sessões de prova (a 8.ª, a 9.ª e a 10.ª) foram jogadas por
   pessoas antes de o jogo gravar a sessão como arquivo (src/sessao.js): o
   que delas ficou são REGISTOS — `registo-s10-cena.json` (a pauta e a
   resposta de cada turno da 10.ª) e `registo-s8-s10-cronista.json` (por
   turno, a narração, a frase, os envelopes e o que o registo do jogo
   conhecia). Este script converte-os, uma vez, em `testes/sessao-s8.json`,
   `sessao-s9.json` e `sessao-s10.json`; daí em diante quem joga em Node é
   o replay, sobre os arquivos (testes/jogar-em-node.mjs).

   UM CAMINHO SÓ. O estado de cada turno sai de `correrOTurno` — o mesmo
   passo que o replay corre —, e não de uma cópia dele. O que este script
   acrescenta é só o que o registo sabe e o motor ainda não faz, o ORÁCULO,
   e é ele que a linha declara em `app`:
     · na 10.ª, o passo antes do Mestre (viajar, moverParaLocal): onde o
       registo diz que o herói estava, e a régua pura do sítio pela frase não
       o levou, o oráculo põe-no lá (pela porta `doApp.antesDoMestre`);
     · na 8.ª e na 9.ª, o nome que o registo conhecia e que nenhuma porta do
       motor trouxe: o nome à mão da pauta, que este registo não gravou (o
       oráculo põe-no no registo de gente), ou o combatente da luta, que a
       luta guarda fora do estado (o oráculo não toca o estado; a linha só o
       diz);
     · nas três, o nome que o Cronista DAQUELE jogo registou e o de hoje
       recusa (28/10, o aceito do Cronista no replay é a peça do jogo,
       oAceitoDoCronista, e não mais uma miniatura): o `nomeComDono` de
       hoje recusa o descritor — «Homem da carroça», «Taverneiro da Fivela
       & o Trigo» — que o de então guardou como nome. O registo é verdade
       sobre a sessão que se jogou: o oráculo põe o nome no registo de
       gente, e a linha diz porquê (o motor de hoje, a regra e o motivo).

   E A RÉGUA DO REGISTO fica aqui, porque é sobre o registo: a gente que a
   pauta nomeia o estado conhece; o EM CENA não leva gente de LONGE; o sítio
   pela frase não leva o herói a outro sítio que não o do registo; o motor
   não recusa o que o registo conhecia nem inventa o que ele não conhecia.
   Se alguma falhar, o script não escreve — o arquivo é o dourado do
   replay, e um dourado que contradiz o registo não serve.

   uso: node testes/gravar-sessoes-de-prova.mjs [--escrever]
     sem nada     confere que os arquivos em disco são os que ele escreveria
                  (sai 0 iguais, 1 diferentes, 2 a régua do registo falhou)
     --escrever   escreve-os (uma troca querida do motor, declarada)

   Antes de 28/10 (T3-B, o replay num caminho só) isto morava dentro do
   jogar-em-node, que tinha o seu próprio turno — o aplicar, o registo, os
   nomes à mão, o Cronista, chamados um a um. */
import fs from "node:fs";

const J = JSON.stringify;
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();

const { montarEmCena, EM_CENA_NA_PAUTA } = await import("../src/em-cena.js");
const { estadoDoSave } = await import("../src/estado.js");
const { pontoDaSorte } = await import("../src/motor/sorte-do-turno.js");
const { abrirASessao, gravarOTurno, correrOTurno, validarASessao } = await import("../src/sessao.js");
const { entradaDoJuiz, julgarOTurno } = await import("../src/motor/juiz-do-turno.js");
const { nomeComDono } = await import("../src/npcs.js");
const { contextoDoNomeCom } = await import("../src/motor/aplicar.js");
const ESCREVER = process.argv.includes("--escrever");

const R = JSON.parse(fs.readFileSync(new URL("./registo-s10-cena.json", import.meta.url), "utf8"));
const RC = JSON.parse(fs.readFileSync(new URL("./registo-s8-s10-cronista.json", import.meta.url), "utf8"));
const CR = RC.turnos.filter((x) => x.ses === "s10");

/* o Juiz do turno: a foto de antes de aplicar, como no App */
const fotoDoJuiz = (E, narracoes, oferecidos) => ({ personagem: E.personagem, npcs: E.npcs, mapa: E.mapa, cidadeAtual: E.cidadeAtual, lugar: E.lugar, oferecidos, narracoes });
const vereditoDoJuiz = (E, narrativa, { narracoes, oferecidos, frase, pauta, turno }) => {
  const entrada = entradaDoJuiz(fotoDoJuiz(E, narracoes, oferecidos), { frase, pauta });
  return { resumo: julgarOTurno(narrativa, entrada, { turno, dia: E.dia || 0 }).resumo, entrada };
};
const pautaDoRegisto = (P) => [`ONDE: ${P.onde}`, `EM CENA: ${P.emCena}`, ...(P.longe.length ? [`LONGE: ${P.longe.join(" · ")}`] : [])].join("\n");
/* o arquivo como vai ao disco: a cabeça numa linha, um turno por linha */
const textoDaSessao = (arq) => {
  const { turnos, ...cab } = arq;
  return JSON.stringify(cab).slice(0, -1) + ",\"turnos\":[\n" + turnos.map((x) => JSON.stringify(x)).join(",\n") + "\n]}\n";
};

/* O NOME QUE O CRONISTA DE ENTÃO REGISTOU E O DE HOJE RECUSA: as pessoas do
   aceito que o estado do fim não tem. Devolve o estado com elas (a ficha da
   proposta, como o registo a guardou) e a declaração da linha, com o motivo
   que o motor de hoje dá (nomeComDono, sobre o registo de antes do turno). */
const oNomeRecusado = (antes, juizo, depois) => {
  const aceitos = ((juizo && juizo.aceito && juizo.aceito.pessoas) || []).filter((x) => x && x.nome);
  const conhece = new Set(Object.keys(depois.npcs || {}).map(sem));
  const fora = aceitos.filter((x) => !conhece.has(sem(x.nome)));
  if (!fora.length) return { estado: depois, app: [] };
  const porque = (x) => { try { const id = nomeComDono(x.nome, antes.npcs || {}, contextoDoNomeCom({ heroi: (antes.personagem || {}).nome }, x)); return id && id.motivo ? id.motivo : "recusado"; } catch { return "recusado"; } };
  return {
    estado: { ...depois, npcs: { ...depois.npcs, ...Object.fromEntries(fora.map((x) => [x.nome, { ...x }])) } },
    app: [{ orgao: "o Cronista do jogo de então (o registo guardou o nome; o nomeComDono de hoje, no App e no motor, recusa-o)", campos: fora.map((x) => "npcs." + x.nome), o: fora.map((x) => `${x.nome} (${porque(x)})`).join(", ") }],
  };
};

/* os nomes à mão: a linha da pauta → os oferecidos */
const oferecidosDaLinha = (linha) => {
  const m = String(linha || "").match(/a quem não tem nome: (.+)$/m);
  return m ? m[1].split(" · ").map((x) => { const k = x.match(/^(.+?) \((ele|ela)\)$/); return k && { nome: k[1], genero: k[2] }; }).filter(Boolean) : [];
};

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
/* a planta do registo: os sítios que a 10.ª pisou em cada cidade (o registo
   não guarda a semente do mundo, e no App a lista sai de locaisDaCidade) */
const PLANTA = {};
for (const p of R.pautas) { const d = lerOnde(p.onde); if (d.lugar && d.cidade && !(PLANTA[d.cidade] || []).some((l) => l.nome === d.lugar)) PLANTA[d.cidade] = [...(PLANTA[d.cidade] || []), { nome: d.lugar, onde: "dentro" }]; }

/* o save de partida da 10.ª: o herói e a companheira, a cidade de chegada,
   o mapa das cidades que a sessão pisou; a ficha SEM as listas da bolsa e
   das habilidades, de propósito (27/10, T1-B fatia 2: um save mínimo tem de
   jogar — teste-ficha-incompleta.mjs) */
const inicio10 = () => estadoDoSave({
  personagem: { nome: R.heroi, classe: "Guerreiro", nivel: 1, xp: 0, vida: 12, vidaMax: 12, mana: 0, manaMax: 0, moedas: 25, condicoes: [], equipado: {}, grupo: [{ nome: "Saoirse", vida: 10, vidaMax: 10 }] },
  cidadeAtual: R.pautas[0].cidade, lugar: null, jornada: null,
  mapa: { cidades: cidades.map((nome) => ({ nome })) },
  npcs: {}, canone: {}, combate: null,
});

/* a proposta do Cronista, refeita do registo dele (que não guarda o JSON
   cru): os nomes que o registo ganhou, o lugar da pauta seguinte */
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

/* ---------------- A 10.ª ---------------- */
const gravarA10 = () => {
  const turnos = R.pautas.length - 1; /* o último turno precisa da pauta seguinte */
  let E = inicio10();
  let antes = null;
  const regua = [];
  let sessao = abrirASessao({ semente: "s10", estado: E, origem: "registo-s10-cena.json (a 10.ª sessão de prova), jogado por testes/jogar-em-node.mjs" });
  for (let i = 0; i < turnos; i++) {
    const P = R.pautas[i];
    const resposta = R.respostas[i];
    const oferecidos = oferecidosDaLinha(P.emCena);
    const prop = propostaDoTurno(i);
    const linha = {
      entrada: { frase: P.frase, lugaresDaqui: PLANTA[E.cidadeAtual] || [] },
      sorte: { ponto: pontoDaSorte({ dia: E.dia || 0, minuto: E.minuto || 0, falas: i }) },
      pedido: { pauta: pautaDoRegisto(P), envelopes: "", nomesAMao: oferecidos },
      narrador: { narrativa: resposta, mudancas: {} },
      cronista: { proposta: prop, juizo: null }, juiz: null,
    };
    const app = [];
    let noMestre = null;
    /* o oráculo, na porta do passo antes do Mestre: o estado chega já com o
       sítio pela frase (a metade pura do passo) */
    const antesDoMestre = (Es) => {
      const moveu = Es.lugar && Es.lugar.nome && !(E.lugar && sem(E.lugar.nome) === sem(Es.lugar.nome)) ? Es.lugar.nome : null;
      const alvo = lerOnde(P.onde);
      const sitio = Es.lugar && Es.lugar.nome ? Es.lugar.nome : null;
      const bateCidade = !alvo.cidade || sem(Es.cidadeAtual) === sem(alvo.cidade);
      const bateSitio = alvo.estrada ? !!Es.jornada : sem(sitio) === sem(alvo.lugar);
      let F = Es;
      if (!bateCidade || !bateSitio) {
        /* a régua pura moveu, e para outro sítio: é erro do motor, não falta dele (não se declara) */
        if (moveu) regua.push(`M${i + 1}: o sítio pela frase levou a ${moveu}; o registo diz ${alvo.estrada ? "a estrada" : alvo.lugar || alvo.cidade || "—"}`);
        else app.push({ orgao: !bateCidade ? "viajar (o passo antes do Mestre)" : "moverParaLocal (o passo antes do Mestre)", campos: ["cidadeAtual", "lugar", "jornada"], o: !bateCidade ? `viagem ${Es.cidadeAtual} → ${alvo.cidade} (turno: viajar)` : `sítio ${sitio || "—"} → ${alvo.estrada ? "a estrada" : alvo.lugar || "—"} (turno: moverParaLocal)` });
        F = { ...Es, cidadeAtual: alvo.cidade || Es.cidadeAtual, lugar: alvo.lugar ? { nome: alvo.lugar, distancia: "dentro", cidade: alvo.cidade } : null, jornada: alvo.estrada ? { destino: Es.cidadeAtual } : null };
      }
      noMestre = F;
      return F;
    };
    const r = correrOTurno(E, linha, { semente: "s10", doApp: { antesDoMestre } });
    if (r.calou.length) regua.push(`M${i + 1}: ${r.calou.map((c) => c.passo + " estourou: " + c.erro).join(" · ")}`);
    const Em = noMestre || E;
    /* a régua do registo: a gente que a pauta nomeia, o estado conhece */
    const grupo = (Em.personagem.grupo || []).map((g) => sem(g.nome));
    /* "+1." é a marca de transbordo da linha LONGE ("… e mais um"), não um nome */
    const nomesDaPauta = [...P.presentes.map((x) => x.nome), ...P.longe].filter((n) => !grupo.includes(sem(n)) && !/^\+\d+\.?$/.test(String(n).trim()));
    const conhece = new Set(Object.keys(Em.npcs || {}).map(sem));
    const desconhecidos = nomesDaPauta.filter((n) => !conhece.has(sem(n)));
    if (desconhecidos.length) regua.push(`M${i + 1}: gente que o estado não conhece: ${desconhecidos.join(",")}`);
    /* e o EM CENA, encadeado, não leva gente de LONGE */
    const presentes = P.presentes.filter((x) => !/viaja/.test(x.motivo)).map((x) => ({ ...(Object.values(Em.npcs || {}).find((n) => sem(n.nome) === sem(x.nome)) || {}), nome: x.nome }));
    const lista = montarEmCena({ semente: "s10", turno: i + 1, cidade: Em.cidadeAtual, presentes, longe: P.longe, grupo: (Em.personagem.grupo || []).map((g) => ({ nome: g.nome })), comigo: [], mostrado: R.respostas.slice(Math.max(0, i - 2), i), frase: P.frase, lugar: { nome: P.onde }, antes });
    antes = lista;
    const L = new Set(P.longe.map(sem));
    const naLinha = lista.filter((x) => x.tipo === "pessoa" && x.aqui).slice(0, EM_CENA_NA_PAUTA.pessoa).map((x) => x.nome);
    if (naLinha.some((g) => L.has(sem(g)))) regua.push(`M${i + 1}: EM CENA com gente de LONGE: ${naLinha.join(",")}`);
    const juiz = vereditoDoJuiz(Em, resposta, { narracoes: R.respostas.slice(0, i), oferecidos, frase: P.frase, pauta: pautaDoRegisto(P), turno: i + 1 });
    const rec = oNomeRecusado(Em, r.juizo, r.estado);
    app.push(...rec.app);
    sessao = gravarOTurno(sessao, { ...linha, cronista: { proposta: prop, juizo: r.juizo }, juiz, estado: rec.estado, app });
    E = rec.estado;
  }
  return { sessao, regua };
};

/* ---------------- A 8.ª E A 9.ª, PELO REGISTO DO CRONISTA ---------------- */
const gravarDoCronista = (ses) => {
  const L = RC.turnos.filter((x) => x.ses === ses);
  const c0 = [...new Set(L[0].conhecidos)];
  const heroi = c0[c0.length - 1], companheira = c0[0];
  let E = estadoDoSave({ personagem: { nome: heroi, classe: "Guerreiro", nivel: 1, xp: 0, vida: 12, vidaMax: 12, mana: 0, manaMax: 0, moedas: 25, grupo: [{ nome: companheira, vida: 10, vidaMax: 10 }] }, cidadeAtual: "", lugar: null, mapa: { cidades: [] }, npcs: {}, canone: {}, combate: null });
  const conhecidos = (e) => new Set([e.personagem.nome, ...(e.personagem.grupo || []).map((g) => g.nome), ...Object.keys(e.npcs || {}), ...Object.keys(e.canone || {})].map(sem));
  const regua = [];
  /* OS COMBATENTES SÃO DA LUTA, NÃO DO REGISTO DE GENTE: o registo conhece o
     Zumbi enquanto a luta dura e esquece-o quando ela acaba */
  let daLuta = new Set();
  let sessao = abrirASessao({ semente: ses, estado: E, origem: "registo-s8-s10-cronista.json (a " + ses.slice(1) + ".ª sessão de prova), jogado por testes/jogar-em-node.mjs" });
  for (let i = 0; i < L.length - 1; i++) {
    const a = L[i], b = L[i + 1];
    const linha = {
      entrada: { frase: a.frase },
      sorte: { ponto: pontoDaSorte({ dia: E.dia || 0, minuto: E.minuto || 0, falas: i }) },
      pedido: { pauta: "", envelopes: a.envelopes || [] },
      narrador: { narrativa: a.narrativa, mudancas: {} },
      juiz: null,
    };
    const juiz = vereditoDoJuiz(E, a.narrativa, { narracoes: L.slice(0, i).map((x) => x.narrativa), oferecidos: [], frase: a.frase, pauta: "", turno: i + 1 });
    /* a proposta lê o estado DEPOIS do Mestre e ANTES do Cronista: o turno
       corre uma vez sem o Cronista para a refazer, e outra com ela */
    const meio = correrOTurno(E, { ...linha, cronista: null }, { semente: ses });
    const ja = conhecidos(meio.estado);
    const novos = [...new Set(b.conhecidos)].filter((x) => !ja.has(sem(x)));
    const doCronista = a.util.includes("pessoa") || a.util.includes("canone");
    const prop = {};
    if (doCronista) {
      if (a.util.includes("pessoa") && !a.util.includes("canone")) prop.pessoas = novos.map((nome) => ({ nome, genero: "" }));
      else prop.canone = Object.fromEntries(novos.map((n) => [n, { tipo: "artefato", descricao: "—" }]));
    }
    const r = correrOTurno(E, { ...linha, cronista: { proposta: prop, juizo: null } }, { semente: ses });
    if (r.calou.length) regua.push(`#${a.k}: ${r.calou.map((c) => c.passo + " estourou: " + c.erro).join(" · ")}`);
    const rec = oNomeRecusado(meio.estado, r.juizo, r.estado);
    let Ef = rec.estado;
    const esperado = new Set(b.conhecidos.map(sem));
    daLuta = new Set([...daLuta].filter((x) => esperado.has(x)));
    const depois = new Set([...conhecidos(Ef), ...daLuta]);
    const faltam = [...new Set(b.conhecidos)].filter((x) => !depois.has(sem(x)));
    const sobram = [...depois].filter((x) => !esperado.has(x));
    const app = [...rec.app];
    if (faltam.length) {
      const luta = a.emLuta || b.emLuta;
      if (doCronista) regua.push(`#${a.k}: o motor recusou ${faltam.join(",")}`);
      else if (luta) {
        /* a luta guarda os combatentes fora do estado: a linha diz que o App os teve */
        app.push({ orgao: "a luta (os combatentes, que o registo conhece e a luta guarda fora do estado)", campos: [], o: faltam.join(",") });
        daLuta = new Set([...daLuta, ...faltam.map(sem)]);
      } else {
        app.push({ orgao: "os nomes à mão da pauta (que o registo do Cronista não gravou)", campos: faltam.map((n) => "npcs." + n), o: faltam.join(",") });
        Ef = { ...Ef, npcs: { ...Ef.npcs, ...Object.fromEntries(faltam.map((n) => [n, { nome: n }])) } };
      }
    }
    if (sobram.length) regua.push(`#${a.k}: o estado conhece o que o registo não conhecia: ${sobram.join(",")}`);
    sessao = gravarOTurno(sessao, { ...linha, cronista: { proposta: prop, juizo: r.juizo }, juiz, estado: Ef, app });
    E = Ef;
  }
  return { sessao, regua };
};

/* ============================================================ */
let diferentes = 0, tortos = 0;
for (const [ses, f] of [["s8", () => gravarDoCronista("s8")], ["s9", () => gravarDoCronista("s9")], ["s10", gravarA10]]) {
  const { sessao, regua } = f();
  const nome = `sessao-${ses}.json`;
  const v = validarASessao(sessao);
  if (!v.ok) { tortos++; console.log(`  XX  ${ses}: o arquivo não é válido — ${J(v.erros.slice(0, 3))}`); continue; }
  if (regua.length) { tortos++; console.log(`  XX  ${ses}: a régua do registo falhou em ${regua.length} turno(s) — ${regua.slice(0, 4).join(" | ")}`); continue; }
  const txt = textoDaSessao(sessao);
  const url = new URL("./" + nome, import.meta.url);
  const noDisco = fs.existsSync(url) ? fs.readFileSync(url, "utf8").replace(/\r\n/g, "\n") : null;
  const declarados = sessao.turnos.filter((x) => x.app).length;
  if (ESCREVER) { fs.writeFileSync(url, txt); console.log(`  ..  ${ses}: escrito testes/${nome} (${sessao.turnos.length} turnos, ${declarados} com o App declarado, ${Math.round(txt.length / 1024)} KB)`); continue; }
  if (noDisco === txt) console.log(`  ok  ${ses}: testes/${nome} é o que o registo dá (${sessao.turnos.length} turnos, ${declarados} com o App declarado)`);
  else { diferentes++; console.log(`  XX  ${ses}: testes/${nome} não é o que o registo dá — regere com --escrever, e declare a troca`); }
}
process.exit(tortos ? 2 : diferentes ? 1 : 0);
