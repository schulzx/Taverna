/* ============================================================
   O JUIZ NO TURNO (T1-A, 5.ª fatia, 28/10/2026) — testes/teste-motor-juiz-do-turno.mjs

   A peça pura que monta, a cada turno, a entrada do Juiz de fidelidade
   (src/motor/juiz-do-turno.js) e o que o App faz com ela. Prova:
     1. cada campo da entrada sai de onde o diário da T3-B disse;
     2. a foto é de ANTES — a de depois absolve a invenção (a prova morde);
     3. o resumo, o acumulado e a linha da consola, com os tetos da tabela;
     4. nada estoura com lixo, e a mesma entrada dá o mesmo veredito;
     5. com a foto do save real da 9.ª sessão (registo-s9-historia.json), a
        entrada apanha os rótulos que o Juiz mede sem pauta e acusa pouco;
     6. a fiação no App: a foto antes de aplicar, o Juiz depois, em calou,
        o save ao lado do custo, e nada na tela.
   ============================================================ */
import fs from "node:fs";
import { entradaDoJuiz, julgarOTurno, somarAFidelidade, linhaDoJuiz, JUIZ_NO_TURNO, CLASSES_DO_JUIZ } from "../src/motor/juiz-do-turno.js";
import { CAMPOS } from "../src/estado.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra) => { if (cond) { ok++; console.log("  ok  " + nome); } else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); } };
const sec = (s) => console.log("\n" + s);
const ler = (f) => JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"));
const sem = (s) => String(s == null ? "" : s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const APP = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");

const FOTO = {
  personagem: { nome: "Vera", moedas: 37, grupo: [{ nome: "Sari" }, null] },
  npcs: { Tomas: { nome: "Tomas" }, "Halden Caldeira": {} },
  mapa: { cidades: [{ nome: "Buraco Norte", regiao: "Chãs Quebradas", continente: "Terras do Eco" }, null, { nome: "Vau Fincado" }], regioes: [{ nome: "Chãs Quebradas" }] },
  cidadeAtual: "Buraco Norte", lugar: { nome: "a praça" },
  oferecidos: ["Alba da Pedra"], elenco: ["Dara"],
  guildas: [{ nome: "Casa do Fole", mestre: "Orin", membros: [{ nome: "Pio" }] }],
  espinha: { fio: { antagonista: "Varek" } },
  missoes: [{ status: "ativa", recompensa: { moedas: 60 } }, { status: "concluida", recompensa: { moedas: 999 } }, null],
  bancas: [{ nome: "Banca do Pão", estoque: [{ nome: "Pão", preco: 2, id: "pao" }, { nome: "sem preço" }] }],
  balcao: [{ nome: "Ração de viagem", preco: 5, id: "racao" }],
  narracoes: ["um", "dois", "", "tres", "quatro", "cinco", "seis", "sete"],
  mundo: { semente: "prova|Fantasia medieval", genero: "Fantasia medieval" },
};

sec("1 · a entrada: cada campo sai de onde a T3-B disse");
{
  const e = entradaDoJuiz(FOTO, { frase: "Pago as sete.", pauta: "EM CENA   Sari · Tomas", moeda: "marcos" });
  t("a frase, a moeda e a pauta passam", e.frase === "Pago as sete." && e.moeda === "marcos" && e.pauta === "EM CENA   Sari · Tomas");
  t(`as narrações anteriores: as últimas ${JUIZ_NO_TURNO.narracoesAntes}, sem as vazias`, JSON.stringify(e.antes) === JSON.stringify(["dois", "tres", "quatro", "cinco", "seis", "sete"]), JSON.stringify(e.antes));
  t("o herói e o grupo (sem o nulo)", JSON.stringify(e.heroi) === '["Vera"]' && JSON.stringify(e.grupo) === '["Sari"]');
  t("a gente: o registo, o elenco, o antagonista, a guilda", ["Tomas", "Halden Caldeira", "Dara", "Varek", "Orin", "Pio"].every((n) => e.gente.includes(n)), JSON.stringify(e.gente.slice(0, 8)));
  t("a gente da cidade onde se está, refeita pela semente", e.gente.length > 8 && e.papeis.length > 0, e.gente.length + " · " + e.papeis.length);
  t("os nomes à mão", JSON.stringify(e.nomesAMao) === '["Alba da Pedra"]');
  t("os lugares: as cidades, a região, o continente, a guilda, o lugar", ["Buraco Norte", "Vau Fincado", "Chãs Quebradas", "Terras do Eco", "Casa do Fole", "a praça"].every((n) => e.lugares.some((l) => (typeof l === "string" ? l : l.nome) === n)));
  t("e os locais da cidade, com o tipo", e.lugares.some((l) => l && typeof l === "object" && l.tipo));
  t("o mercado: a banca e o balcão, só o que tem preço", JSON.stringify(e.mercado) === JSON.stringify([{ nome: "Pão", preco: 2, id: "pao" }, { nome: "Ração de viagem", preco: 5, id: "racao" }]), JSON.stringify(e.mercado));
  t("os valores: a recompensa da missão viva (a concluída não)", JSON.stringify(e.valores) === "[60]");
  t("a bolsa", e.bolsa === 37);
}

sec("2 · a foto é de ANTES: a de depois absolve a invenção");
{
  const prosa = "Atrás dela, Rurik se aproxima mancando. A cama custa dez moedas.";
  const antes = julgarOTurno(prosa, entradaDoJuiz(FOTO, { moeda: "moedas" }), {}).veredito;
  /* depois de aplicar, o códex já registou o Rurik que a narração inventou */
  const depois = julgarOTurno(prosa, entradaDoJuiz({ ...FOTO, npcs: { ...FOTO.npcs, Rurik: {} } }, { moeda: "moedas" }), {}).veredito;
  t("com a foto de antes, o Rurik é gente nova", antes.pessoasNovas.some((a) => a.nome === "Rurik"), JSON.stringify(antes.pessoasNovas.map((a) => a.nome)));
  t("com a de depois, já não seria (por isso a foto é tirada antes de aplicar)", !depois.pessoasNovas.some((a) => a.nome === "Rurik"));
  t("o preço que nenhuma banca tem é inventado", antes.precosInventados.length === 1);
  const comCama = julgarOTurno(prosa, entradaDoJuiz({ ...FOTO, bancas: [{ estoque: [{ nome: "Cama na estalagem", preco: 10 }] }] }, { moeda: "moedas" }), {}).veredito;
  t("e com a cama à venda por 10, não é", comCama.precosInventados.length === 0);
}

sec("3 · o resumo, o acumulado e a linha");
{
  const prosa = "Atrás dela, Rurik se aproxima mancando. A cama custa dez moedas. Kael e Brom entram, e Tilda também.";
  const { resumo } = julgarOTurno(prosa, entradaDoJuiz(FOTO, { moeda: "moedas" }), { turno: 7, dia: 3 });
  t("o resumo guarda o turno, o dia e a conta por classe", resumo.turno === 7 && resumo.dia === 3 && resumo.achados > 0 && resumo.por.preco === 1 && resumo.por.pessoa >= 1, JSON.stringify(resumo.por));
  t("as classes da linha são as do veredito (as cinco)", CLASSES_DO_JUIZ.length === 5 && CLASSES_DO_JUIZ.every((c) => c.campo && c.classe));
  t(`no máximo ${JUIZ_NO_TURNO.achadosPorTurno} trechos, de até ${JUIZ_NO_TURNO.trecho} caracteres`, resumo.trechos.length <= JUIZ_NO_TURNO.achadosPorTurno && resumo.trechos.every((x) => x.trecho.length <= JUIZ_NO_TURNO.trecho && x.motivo.length <= JUIZ_NO_TURNO.trecho));
  const limpo = julgarOTurno("A chuva cai sobre a praça.", entradaDoJuiz(FOTO, {}), { turno: 8 }).resumo;
  let acc = somarAFidelidade(null, resumo);
  acc = somarAFidelidade(acc, limpo);
  t("o acumulado soma turnos, limpos e achados", acc.turnos === 2 && acc.limpos === 1 && acc.achados === resumo.achados && acc.por.preco === 1, JSON.stringify({ t: acc.turnos, l: acc.limpos, a: acc.achados }));
  for (let i = 0; i < 40; i++) acc = somarAFidelidade(acc, limpo);
  t(`e guarda só os últimos ${JUIZ_NO_TURNO.guardados} vereditos`, acc.ultimos.length === JUIZ_NO_TURNO.guardados && acc.turnos === 42);
  t("o acumulado vai ao save sem nada que não seja JSON", JSON.stringify(JSON.parse(JSON.stringify(acc))) === JSON.stringify(acc));
  const l = linhaDoJuiz(resumo);
  t("a linha da consola diz a conta e as classes", /^\[taverna\] juiz: \d+ achados \(preco 1 · pessoa \d+/.test(l), l);
  t("e o turno limpo diz zero", linhaDoJuiz(limpo) === "[taverna] juiz: 0 achados", linhaDoJuiz(limpo));
}

sec("4 · lixo não derruba, e o veredito é determinístico");
{
  const vivo = (f) => { try { f(); return true; } catch { return false; } };
  t("entradaDoJuiz(null, null) e com campos tortos", vivo(() => entradaDoJuiz(null, null)) && vivo(() => entradaDoJuiz({ personagem: 3, npcs: [], mapa: { cidades: "x" }, bancas: [{ estoque: 4 }], missoes: "y", narracoes: { a: 1 }, mundo: { semente: "s" }, cidadeAtual: "Lugar Nenhum" }, 7)));
  t("julgarOTurno com prosa vazia e entrada vazia", vivo(() => julgarOTurno("", {}, null)) && julgarOTurno("", {}, null).resumo.achados === 0);
  t("somarAFidelidade e linhaDoJuiz com lixo", vivo(() => somarAFidelidade("x", null)) && vivo(() => linhaDoJuiz(null)) && somarAFidelidade([], {}).turnos === 1);
  const a = JSON.stringify(julgarOTurno("Rurik cobra três moedas pela cama.", entradaDoJuiz(FOTO, { moeda: "moedas" }), { turno: 1 }));
  const b = JSON.stringify(julgarOTurno("Rurik cobra três moedas pela cama.", entradaDoJuiz(JSON.parse(JSON.stringify(FOTO)), { moeda: "moedas" }), { turno: 1 }));
  t("a mesma foto dá o mesmo veredito", a === b);
}

sec("5 · com a foto do save real da 9.ª sessão");
{
  /* registo-s9-historia.json é o save da 9.ª (a T3-B refez-lhe o mundo
     pela semente): a foto usa o registo de ANTES da sessão (npcsAntes,
     baseAntes), a cidade de cada turno, as bancas e as recompensas que a
     sessão tinha. A 9.ª não tem a pauta gravada, logo os dois rótulos de
     pauta ficam de fora desta conta (a suíte do Juiz conta-os com os fatos
     lidos à mão). */
  const J = ler("juiz-rotulado.json"), RC = ler("registo-s8-s10-cronista.json"), H = ler("registo-s9-historia.json");
  const S = J.sessoes.s9, s9 = RC.turnos.filter((x) => x.ses === "s9");
  const deFora = new Set([...J.marginais, ...J.contestados, ...J.foraDoAlcance].filter((x) => x.ses === "s9").map((x) => x.k));
  const rot = J.rotulos.filter((r) => r.ses === "s9" && r.classe !== "pautaCumprida");
  const apanhou = (v, r) => { const alvo = sem(r.trecho); return (r.aceita || [r.classe]).some((cl) => (v[cl] || []).some((a) => sem(a.trecho).includes(alvo) || (a.nome && alvo.includes(sem(a.nome))))); };
  let ap = 0, limpas = 0, acusadas = 0;
  s9.forEach((tt, k) => {
    const cid = (H.turnos.find((x) => x.turno === k + 1) || H.turnos[0]).cidade;
    const foto = {
      personagem: { ...H.personagem, grupo: S.grupo.map((n) => ({ nome: n })) }, npcs: H.npcsAntes, mapa: H.mapa, base: H.baseAntes,
      cidadeAtual: cid, narracoes: s9.slice(0, k).map((x) => x.narrativa), guildas: H.guildas, espinha: H.espinha,
      mundo: { semente: H.espinha.semente, genero: H.campanha.genero, molde: H.campanha.molde, lexico: H.campanha.lexico },
      bancas: [{ estoque: S.mundo.mercado }], missoes: S.mundo.valores.map((v) => ({ status: "ativa", recompensa: { moedas: v } })),
    };
    /* as distâncias e os prazos chegam ao Juiz pela pauta; sem pauta gravada, vão à mão */
    const ent = { ...entradaDoJuiz(foto, { frase: tt.frase || "", moeda: S.moeda }), distancias: S.mundo.distancias, tempos: S.mundo.tempos };
    const v = julgarOTurno(tt.narrativa, ent, { turno: k }).veredito;
    const rs = rot.filter((r) => r.k === k);
    ap += rs.filter((r) => apanhou(v, r)).length;
    if (!rs.length && !J.rotulos.some((r) => r.ses === "s9" && r.k === k) && !deFora.has(k)) { limpas++; if (!v.limpa) acusadas++; }
  });
  console.log(`      9.ª sessão: ${ap}/${rot.length} rótulos apanhados · ${acusadas}/${limpas} limpas acusadas`);
  t("apanha todos os rótulos da 9.ª que não são de pauta", ap === rot.length, `${ap}/${rot.length}`);
  t("e acusa no máximo 2 das limpas (≤ 6%)", limpas >= 30 && acusadas <= 2, `${acusadas}/${limpas}`);
}

sec("6 · a fiação no App");
{
  const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const C = semComentarios(APP);
  const iFoto = C.indexOf("fotoDoJuiz = {"), iAplicar = C.indexOf("let pers = aplicarResposta(resp, persAtual"), iJuiz = C.indexOf("julgarOTurno(resp.narrativa");
  t("a foto é tirada ANTES de aplicar, e o Juiz corre DEPOIS", iFoto > 0 && iAplicar > iFoto && iJuiz > iAplicar);
  t("a foto e o Juiz, cada um em calou", /calou\("a foto do juiz", e\)/.test(C) && /calou\("o juiz do turno", e\)/.test(C));
  t("a entrada leva a frase do jogador, a pauta do turno e a moeda", /entradaDoJuiz\(fotoDoJuiz, \{ frase: pedidoDaBolsa, pauta, moeda: moedaDaBolsa \}\)/.test(C));
  t("o veredito vai ao save, ao lado do custo", /custo: custoRef\.atual,\s*fidelidade: fidelidadeRef\.current,/.test(C) && CAMPOS.some((c) => c.campo === "fidelidade" && c.grupo === "bastidor"));
  t("e volta no load", /fidelidadeRef\.current = sv\.fidelidade && typeof sv\.fidelidade === "object"/.test(C));
  t("a campanha nova zera a conta, nas duas portas", (C.match(/leituraDoCronistaRef\.current = garantirLeitura\(null\); fidelidadeRef\.current = null;/g) || []).length === 2);
  t("na tela não aparece nada (o sistema não fala de si mesmo)", !/pushMsgs\([^)]*(linhaDoJuiz|fidelidadeRef|doJuiz)/.test(C) && !/set[A-Z]\w*\([^)]*doJuiz/.test(C));
  t("a linha vai à consola, ao lado da do custo", /console\.debug\(linhaDoJuiz\(doJuiz\.resumo\)\)/.test(C));
}

sec("7 · a praça do Juiz no App é a da pauta (Fase 4, trilha A, 29/10)");
{
  /* Antes a foto lia `bancasDaCena()` e `balcaoAqui()`, que saem do
     `mercadoAqui` do ÚLTIMO render: no toque que abre a cidade o render ainda
     não a tinha, e o Juiz não via banca nenhuma (0 itens na sessão do
     navegador, contra 29 nos turnos seguintes). Agora a foto usa a mesma
     regra do servidor, `aPracaDoJuiz` (src/turno-no-servidor.js): o render
     para o mercado, o herói, os governos e o mundo; os refs do instante para
     a cidade, o dia, o mapa, a lei, a masmorra, a jornada e a postura. */
  const { aPracaDoJuiz, oPedidoNoServidor } = await import("../src/turno-no-servidor.js");
  const { estadoNoTurno } = await import("../src/sessao.js");
  const { oEstadoDoServidor } = await import("../src/motor/eco-do-turno.js");
  const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const C = semComentarios(APP);
  const iFoto = C.indexOf("fotoDoJuiz = {"), foto = C.slice(iFoto, C.indexOf("};", iFoto));
  t("a foto do Juiz lê a praça pela aPracaDoJuiz, e não mais pelas bancas do render",
    /\.\.\.aPracaDoJuiz\(\{ mercado, personagem, governos, mundo \}, \{/.test(foto) && !/bancasDaCena\(\)|balcaoAqui\(\)/.test(foto));
  const agora = (foto.match(/aPracaDoJuiz\(\{[^}]*\}, \{([^}]*)\}\)/) || [])[1] || "";
  const pares = agora.split(",").map((x) => x.trim().split(/:\s*/)).filter((p) => p.length === 2);
  const CAMPO_DO_REF = { cidadeAtual: "cidadeAtualRef", dia: "diaRef", mapa: "mapaRef", lei: "leiRef", masmorra: "masmorraRef", jornada: "jornadaRef", postura: "posturaRef", mercado: "mercadoRef", personagem: "personagemRef", mundo: "mundoRef" };
  t(`o instante são os dez refs, cada campo pelo seu (${pares.length}/10)`,
    pares.length === 10 && pares.every(([k, v]) => CAMPO_DO_REF[k] && v === CAMPO_DO_REF[k] + ".current"), agora);
  t("e a praça entra no App pelo import da regra do servidor", /import \{ aPracaDoJuiz \} from "\.\/turno-no-servidor\.js";/.test(APP));

  /* a sessão do navegador (gravada pelo jogo com a foto de antes): o mercado
     e o veredito iguais onde o render tinha a banca; o toque de abertura
     passa a ver a praça */
  const A = ler("sessao-navegador.json");
  const FICHA = { atributos: { forca: 2, destreza: 1, constituicao: 2, inteligencia: 0, sabedoria: 1, carisma: 0 }, conceito: "Andarilha sem nome" };
  const comoOLoadAbre = (e) => { const x = Object.fromEntries(Object.entries(e).filter(([, v]) => v != null)); const p = x.personagem || {}; x.personagem = { ...p, atributos: p.atributos || FICHA.atributos, conceito: p.conceito || FICHA.conceito }; return x; };
  const can = (x) => JSON.stringify(x);
  /* MOVIDA (29/10, trilha A, a ligação do load): o servidor abre agora o save
     como o load do App o abre (abrirOSave), e a ficha da sessão do navegador
     — gravada por um herói que ainda não tinha passado pela migração —
     ganha a mochila de 10/10/5 E O KIT. Com o kit na mão, o balcão deixa de
     lho vender: a praça é a de antes MENOS o «Kit de viagem» (◉35), nos dois
     turnos com banca, e no toque de abertura 28 itens e não 29. O veredito do
     Juiz não muda em nenhum. É o defeito do herói novo, consertado na v9.572:
     a 1.ª sentada vendia ao herói um kit que o load lhe dava. */
  const KIT = "Kit de viagem";
  const semOKit = (m) => m.filter((x) => x.nome !== KIT);
  let comBanca = 0, igualMerc = 0, igualVer = 0, abertura = null;
  for (let i = 0; i < A.turnos.length; i++) {
    const L = A.turnos[i], ent = L.entrada || {}, g = L.juiz && L.juiz.entrada;
    if (!g) continue;
    const frase = ent.frase || (ent.toque && ent.toque.conteudo) || "";
    const estado = comoOLoadAbre(estadoNoTurno(A, i));
    const fim = (await oPedidoNoServidor({ estado, frase })).estadoDoFim;
    const pr = aPracaDoJuiz(oEstadoDoServidor(estado, {}), fim);
    const merc = entradaDoJuiz({ bancas: pr.bancas, balcao: pr.balcao }, {}).mercado;
    if (!g.mercado.length) { abertura = { i, g, merc, L }; continue; }
    comBanca++;
    if (can(merc) === can(semOKit(g.mercado)) && merc.length === g.mercado.length - 1) igualMerc++;
    const narr = (L.narrador && L.narrador.narrativa) || "";
    if (can(julgarOTurno(narr, { ...g, mercado: merc }, { turno: i + 1, dia: 1 }).veredito) === can(julgarOTurno(narr, g, { turno: i + 1, dia: 1 }).veredito)) igualVer++;
  }
  t(`onde o render tinha a banca, o mercado é o de antes menos o kit, e o veredito do Juiz é o de antes (${igualMerc}/${comBanca} · ${igualVer}/${comBanca})`, comBanca === 2 && igualMerc === comBanca && igualVer === comBanca);
  t(`o toque de abertura passa a ver a banca (0 → ${abertura ? abertura.merc.length : "?"} itens)`, !!abertura && abertura.i === 0 && abertura.merc.length === 28 && !abertura.merc.some((x) => x.nome === KIT));
  /* a mordida: no toque de abertura, o Narrador cobra o triplo do 1.º item
     da praça. Sem a praça (a foto de antes), o Juiz não tem com que o
     comparar e toma o item por gente nova; com ela, acusa com o preço da mesa */
  if (abertura) {
    const it = abertura.merc[0];
    const narr = `Na banca, o mercador ergue ${it.nome}: «São ${it.preco * 3} moedas, nem uma a menos.»`;
    const v0 = julgarOTurno(narr, abertura.g, { turno: 1, dia: 1 }).veredito;
    const v1 = julgarOTurno(narr, { ...abertura.g, mercado: abertura.merc }, { turno: 1, dia: 1 }).veredito;
    const comMesa = (v) => (v.precosInventados || []).filter((p) => p.tabela === it.preco).length;
    t(`a mordida: o preço triplicado só se mede contra a mesa com a praça (${comMesa(v0)} → ${comMesa(v1)})`, comMesa(v0) === 0 && comMesa(v1) === 1);
  }
}

console.log(`\nmotor · juiz do turno: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
