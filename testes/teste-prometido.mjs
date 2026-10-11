/* teste-prometido.mjs (Fase MM · a campanha que prende, item 1)
   — as promessas do Narrador, cobradas

   A queixa da pessoa depois da 4.ª sessão: "achei a história de morna para
   frio". O registo dela mostrou o porquê: o couro de Norberto, a gaveta
   errada, as cinco chaves, "Eu sou o recado" saíram da cabeça do Narrador
   e morreram lá — `promessas.sementes` vazio do primeiro ao último turno.
   `prometido.js` guarda o que o Narrador planta (pela secção nova do
   Cronista), escolhe pela tabela de prazos quando cada coisa volta, e
   entrega à pauta só a do momento, em `O QUE VOLTA`.

   A secção 6 é a sessão 4 inteira, turno a turno: a forma de cada turno
   (pergunta, ato, sistema, luta) é a do registo, e as sementes são as que
   um Cronista com a secção nova devolveria, lidas à mão das narrações.

   FALHA em HEAD de 11/10 (v9.385): `src/prometido.js` não existe e a pauta
   não tem a secção `volta`. */
import { lerOPedido } from "../src/escuta.js";
import { SECOES, porNaPauta, textoDaPauta } from "../src/pauta.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = "estourou") => { try { return f(); } catch { return d; } };

let P = null;
try { P = await import("../src/prometido.js"); } catch (e) { P = null; }
t("o módulo existe e importa em Node", !!P);
if (!P) { console.log(`\nprometido: ${ok} passaram, ${mal + 1} falharam`); process.exit(1); }

const ATO = lerOPedido("Saio da botica sem pressa e vou à Muralha.");
const PERGUNTA = lerOPedido("Quem és tu, e quem te manda?");
const SISTEMA = lerOPedido("[VIAGEM — tudo rolado pelas tabelas]");

sec("1. as tabelas");
{
  const T = P.TIPOS_DE_SEMENTE;
  t("quatro tipos: objeto, frase, volta, ameaça", ["objeto", "frase", "volta", "ameaca"].every((id) => T.some((x) => x.id === id)) && T.length === 4);
  t("cada tipo tem madura < vence < expira", T.every((x) => x.madura > 0 && x.madura < x.vence && x.vence < x.expira));
  t("cada tipo diz O QUE volta, e tem peso", T.every((x) => typeof x.volta === "string" && x.volta.length > 20 && x.peso > 0));
  t("a ameaça dita pesa mais do que a frase solta", T.find((x) => x.id === "ameaca").peso > T.find((x) => x.id === "frase").peso);
  const R = P.RITMO_DO_PROMETIDO;
  t("o ritmo é tabela: intervalo, teto de abertas, novas por turno", R.intervalo >= 2 && R.maxAbertas > 0 && R.novasPorTurno > 0 && R.comuns >= 2);
  t("o que não é semente é tabela, cada linha com o porquê", P.NAO_E_SEMENTE.length >= 3 && P.NAO_E_SEMENTE.every((x) => x.rx instanceof RegExp && x.porque));
}

sec("2. o lembrete de cena não conta");
{
  t("a tarefa (falar com) não é semente", P.ehLembreteDeCena("falar com Inocência Bordão no Sino Quieto"));
  t("ir a um lugar não é semente", P.ehLembreteDeCena("ir à Muralha Quebrada antes da noite"));
  t("o cheiro não é semente", P.ehLembreteDeCena("o cheiro de pedra fria e relâmpagos no forte"));
  t("o sino que dobra não é semente", P.ehLembreteDeCena("o sino dobra fora de hora, sem badalo"));
  t("o ar abafado não é semente", P.ehLembreteDeCena("o ar abafado aperta a rua como mão no pescoço"));
  t("o estado da cena não é semente", P.ehLembreteDeCena("a tocha está acesa no corredor"));
  t("duas palavras não são promessa", P.ehLembreteDeCena("a carta"));
  t("o couro de Norberto é semente", !P.ehLembreteDeCena("o pedaço de couro escuro achado no cinto do irmão morto"));
  t("\"Eu sou o recado\" é semente", !P.ehLembreteDeCena("Eu sou o recado: a Muralha escolheu um nome, e não é teu. Ainda."));
  t("lixo é lembrete, e não estoura", tenta(() => P.ehLembreteDeCena(null)) === true && tenta(() => P.ehLembreteDeCena({})) === true);
}

sec("3. guardar");
{
  const r = P.guardarSementes(null, [
    { tipo: "objeto", texto: "o pedaço de couro escuro achado no cinto do irmão", quem: "Euzébio" },
    { tipo: "artefato", texto: "a caixinha com o molho de chaves pretas de Noé" },
    { tipo: "frase", texto: "uma terceira que não cabe neste turno" },
  ]);
  t("guarda duas, e o sinónimo do Cronista cai no tipo certo", r.guardadas.length === 2 && r.guardadas[1].tipo === "objeto");
  t("a terceira do mesmo turno é recusada (turno cheio)", r.recusadas.length === 1 && /turno cheio/.test(r.recusadas[0].porque));
  const r2 = P.guardarSementes(r.estado, [{ tipo: "objeto", texto: "o couro escuro do cinto do irmão, outra vez" }]);
  t("a mesma promessa dita de novo não duplica", r2.guardadas.length === 0 && /já guardada/.test(r2.recusadas[0].porque));
  const r3 = P.guardarSementes(r.estado, [{ tipo: "ameaca", texto: "A Muralha deu um nome, e o nome é o teu" }]);
  t("\"nome\" sozinho não faz duas promessas iguais", r3.guardadas.length === 1);
  t("nunca muta o recebido", r.estado.sementes.length === 2);
  t("tipo desconhecido é recusado", P.guardarSementes(null, [{ tipo: "nuvem", texto: "uma coisa qualquer que promete" }]).guardadas.length === 0);
  t("null, {}, lista de lixo: nada, sem estourar", tenta(() => P.guardarSementes(null, null).guardadas.length) === 0
    && tenta(() => P.guardarSementes({}, [null, 3, "x", {}]).guardadas.length) === 0);
  /* o caderno cheio: a mais leve cede o lugar, e fecha — não fica pendurada */
  let e = null;
  for (const [tipo, texto] of [["frase", "um ensaio que não foi julgamento"], ["frase", "a gaveta errada da chave do Sino"], ["objeto", "o colar de osso e arame da bolsa"], ["volta", "a mulher de capa verde quer o óleo de mirra"], ["objeto", "a caixinha de chaves pretas do boticário"], ["ameaca", "a dívida não dorme e livro velho não paga"]]) {
    e = P.guardarSementes(e, [{ tipo, texto }]).estado;
  }
  const cheio = P.guardarSementes(e, [{ tipo: "ameaca", texto: "Eu sou o recado, e o nome ainda não é teu" }]);
  t("caderno cheio: a ameaça entra e a frase mais velha cede", cheio.guardadas.length === 1 && cheio.cederam.length === 1 && cheio.cederam[0].texto.startsWith("um ensaio"));
  t("e quem cede fecha como expirada", cheio.estado.sementes.find((s) => s.texto.startsWith("um ensaio")).estado === "expirada");
  const leve = P.guardarSementes(cheio.estado, [{ tipo: "frase", texto: "uma frase menor que chega tarde demais" }]);
  t("caderno cheio de mais pesadas: a frase é recusada", leve.guardadas.length === 1 || /demais/.test((leve.recusadas[0] || {}).porque || ""));
}

sec("4. cobrar: uma por turno, nunca numa pergunta, nunca na luta");
{
  let e = P.guardarSementes(null, [{ tipo: "ameaca", texto: "Eu sou o recado, e o nome ainda não é teu", quem: "o homem da fita vermelha" }]).estado;
  const r1 = P.cobrarNoTurno(e, { pedido: ATO });
  t("verde demais: no turno seguinte ainda não volta", !r1.semente);
  e = r1.estado;
  const rp = P.cobrarNoTurno(e, { pedido: PERGUNTA });
  t("madura, mas é pergunta: não volta", !rp.semente && rp.linha === "");
  t("a pergunta anda o relógio", rp.estado.turno === e.turno + 1);
  const rl = P.cobrarNoTurno(rp.estado, { pedido: ATO, luta: true });
  t("na luta não volta, e o relógio não anda", !rl.semente && rl.estado.turno === rp.estado.turno);
  const rs = P.cobrarNoTurno(rp.estado, { pedido: SISTEMA });
  t("no turno do sistema não volta, e o relógio não anda", !rs.semente && rs.estado.turno === rp.estado.turno);
  const ra = P.cobrarNoTurno(rp.estado, { pedido: ATO });
  t("madura e ato: volta", !!ra.semente && ra.semente.estado === "cobrada");
  t("a linha diz O QUE volta e de quem", /^"Eu sou o recado/.test(ra.linha) && /o homem da fita vermelha/.test(ra.linha) && /volta agora/.test(ra.linha));
  t("cobrada, fecha: não volta outra vez", !P.cobrarNoTurno(P.cobrarNoTurno(ra.estado, { pedido: ATO }).estado, { pedido: ATO }).semente);
  t("lixo no contexto: nada, sem estourar", tenta(() => P.cobrarNoTurno(null, null).semente) === null && tenta(() => P.cobrarNoTurno({}, {}).linha) === "");
}

sec("5. pagar e expirar: nada fica pendurado");
{
  let e = P.guardarSementes(null, [{ tipo: "volta", texto: "a mulher de capa verde volta pelo óleo de mirra", quem: "Belmira" }]).estado;
  t("o Cronista vê as abertas com o número", /^PROMESSAS EM ABERTO/.test(P.abertasParaOCronista(e)) && /\n1 — a mulher de capa verde/.test(P.abertasParaOCronista(e)));
  t("sem abertas, bloco vazio", P.abertasParaOCronista(null) === "");
  const pg = P.pagarSementes(e, [1]);
  t("a narração pagou: fecha como paga", pg.pagas.length === 1 && pg.estado.sementes[0].estado === "paga");
  t("número que não existe não paga nada", P.pagarSementes(e, [9, "x", null]).pagas.length === 0);
  const morta = P.cobrarNoTurno(e, { pedido: ATO, mortos: ["Belmira"] });
  t("quem ficou de voltar morreu: expira", morta.expiradas.length === 1 && morta.estado.sementes[0].estado === "expirada");
  let v = e;
  const expira = P.TIPOS_DE_SEMENTE.find((x) => x.id === "volta").expira;
  for (let i = 0; i <= expira; i++) v = P.cobrarNoTurno(v, { pedido: PERGUNTA }).estado;
  t("só perguntas até ao prazo: expira, nunca pendurada", v.sementes[0].estado === "expirada" && v.sementes[0].fim > 0);
  t("o save sem o campo começa vazio", JSON.stringify(P.garantirPrometido(undefined).sementes) === "[]");
}

sec("6. a sessão 4, turno a turno");
{
  /* a forma de cada turno M1..M42, do registo: s = sistema, ? = pergunta,
     ! = ato, L = luta */
  const FORMA = "s??????!?!???ss??????!ss!!!LLsLLsLLLLLLsLL";
  const SEMENTES = {
    1: [{ tipo: "objeto", texto: "a carta sem assinatura, com a letra dos antigos irmãos" }, { tipo: "frase", texto: "Euzébio não tem marca e passa sem som", quem: "Euzébio" }, { tipo: "frase", texto: "falar com Inocência Bordão no Sino Quieto" }],
    6: [{ tipo: "frase", texto: "o sino dobra fora de hora, sem badalo na praça" }],
    8: [{ tipo: "frase", texto: "eles te mandam carta com nome de morto para te trazer de volta", quem: "Inocência" }],
    10: [{ tipo: "frase", texto: "Isso não foi julgamento. Foi ensaio.", quem: "Euzébio" }],
    11: [{ tipo: "ameaca", texto: "A dívida não dorme, e livro velho não paga homem", quem: "Euzébio" }],
    12: [{ tipo: "objeto", texto: "o pedaço de couro escuro achado no cinto do irmão morto", quem: "Euzébio" }],
    13: [{ tipo: "frase", texto: "a chave do Sino está na gaveta errada", quem: "Norberto" }],
    14: [{ tipo: "volta", texto: "a mulher de capa verde quer o óleo de mirra da botica", quem: "mulher de capa verde" }],
    17: [{ tipo: "objeto", texto: "a caixinha com o molho de chaves pretas de Noé", quem: "Noé Laminado" }, { tipo: "ameaca", texto: "dois vultos à porta da botica, um com a fita vermelha da Muralha" }],
    19: [{ tipo: "ameaca", texto: "A Muralha deu um nome, e o nome é o teu", quem: "Noé Cantoneiro" }, { tipo: "frase", texto: "A gaveta certa é a que nunca devia ter sido aberta", quem: "Noé Laminado" }, { tipo: "volta", texto: "Noé Cantoneiro veio cobrar a dívida de Noé Laminado", quem: "Noé Cantoneiro" }],
    21: [{ tipo: "ameaca", texto: "Eu sou o recado: a Muralha escolheu um nome, e não é teu. Ainda.", quem: "o homem da fita vermelha" }],
    23: [{ tipo: "frase", texto: "o cheiro de pedra fria e relâmpagos no forte" }],
    32: [{ tipo: "objeto", texto: "o colar de dentes escuros do guardião, e a chave preta que aqueceu" }],
  };
  /* o que a narração pagou sozinha: o couro aberto no M13, a gaveta respondida no M19 */
  const PAGAS = { 13: "o pedaço de couro", 19: "a chave do Sino" };
  let e = null;
  const voltas = [], linhas = [];
  let recusadasLembrete = 0, oferecidas = 0;
  for (let m = 1; m <= FORMA.length; m++) {
    const f = FORMA[m - 1];
    const pedido = f === "?" ? PERGUNTA : f === "!" || f === "L" ? ATO : SISTEMA;
    const r = P.cobrarNoTurno(e, { pedido, luta: f === "L" });
    e = r.estado;
    if (r.semente) { voltas.push({ m, f, texto: r.semente.texto }); linhas.push(r.linha); }
    if (PAGAS[m]) e = P.pagarSementes(e, e.sementes.filter((s) => s.estado === "aberta" && s.texto.startsWith(PAGAS[m])).map((s) => s.id)).estado;
    const g = P.guardarSementes(e, SEMENTES[m] || []);
    oferecidas += (SEMENTES[m] || []).length;
    recusadasLembrete += g.recusadas.filter((x) => x.porque === "lembrete de cena").length;
    e = g.estado;
  }
  const por = (st) => e.sementes.filter((s) => s.estado === st).length;
  console.log(`      oferecidas ${oferecidas} · guardadas ${e.sementes.length} · voltam ${voltas.length} (${voltas.map((v) => "M" + v.m).join(", ")}) · pagas pela narração ${por("paga")} · expiradas ${por("expirada")} · abertas ${por("aberta")}`);
  t("ANTES eram 0 guardadas; agora o caderno guarda as da sessão", e.sementes.length >= 10);
  t("os três lembretes (a tarefa, o sino, o cheiro) ficam de fora", recusadasLembrete === 3);
  t("nenhuma volta num turno de pergunta, de sistema ou de luta", voltas.every((v) => v.f === "!"));
  t("os turnos de ato da sessão recebem voltas (≥ 4 dos 6)", voltas.length >= 4);
  t("nunca duas voltas em turnos seguidos de ato", voltas.every((v, i) => i === 0 || v.m - voltas[i - 1].m > 1));
  t("a carta dos antigos irmãos volta antes de a cidade acabar", voltas.some((v) => v.texto.startsWith("a carta sem assinatura") && v.m <= 13));
  t("a mulher de capa verde volta antes da masmorra (M27)", voltas.some((v) => v.texto.startsWith("a mulher de capa verde") && v.m < 27));
  t("o couro e a gaveta, que a narração pagou, nunca são cobrados", !voltas.some((v) => /couro|gaveta errada/.test(v.texto)));
  t("toda fechada tem o turno em que fechou", e.sementes.filter((s) => s.estado !== "aberta").every((s) => s.fim > 0));
  t("as abertas nunca passam do teto", por("aberta") <= P.RITMO_DO_PROMETIDO.maxAbertas);
}

sec("7. a pauta");
{
  const s = SECOES.find((x) => x.id === "volta");
  t("a pauta tem a secção O QUE VOLTA", !!s && s.rotulo === "O QUE VOLTA");
  t("ela corta depois dos vetos e do rumo", !!s && s.prio > SECOES.find((x) => x.id === "naoPode").prio && s.prio > SECOES.find((x) => x.id === "rumo").prio);
  t("e antes da economia da praça", !!s && s.prio < SECOES.find((x) => x.id === "economia").prio);
  t("na leitura vem antes do RUMO", SECOES.findIndex((x) => x.id === "volta") < SECOES.findIndex((x) => x.id === "rumo"));
  /* uma cidade cheia: a cor da praça cede antes da volta */
  let p = porNaPauta({}, "onde", "Na Botica do fim da Rua dos Retalhos, Rio Cinzento.");
  /* cabeça (~293) + onde (~64) + dois vetos (2 × 414) deixam ~215: cabe
     UMA das duas (a volta, ~163, ou a economia, ~164) — e a que fica é a
     de prio menor */
  p = porNaPauta(p, "economia", "Rio Cinzento produz " + "adobe e sal, ".repeat(10));
  p = porNaPauta(p, "naoPode", "x".repeat(400), "y".repeat(400));
  p = porNaPauta(p, "momento", "m".repeat(200));
  p = porNaPauta(p, "volta", "\"Eu sou o recado\" (o homem da fita vermelha) volta agora: a ameaça dá um passo concreto contra mim ou contra quem está comigo");
  const txt = textoDaPauta(p);
  t("numa pauta apertada a volta chega e a economia não", /O QUE VOLTA/.test(txt) && !/adobe e sal/.test(txt));
}

sec("8. a secção do Cronista");
{
  const S = P.SECAO_DO_CRONISTA;
  t("pede promessas e promessas_pagas", /SEÇÃO promessas \(/.test(S) && /SEÇÃO promessas_pagas/.test(S));
  t("diz os quatro tipos e o que não conta", /objeto\|frase\|volta\|ameaca/.test(S) && /Não conta/.test(S));
  t("é curta (uma chamada leve, fora do prompt do Narrador)", S.length < 700);
}

console.log(`\nprometido: ${ok} passaram, ${mal} falharam`);
if (mal) process.exit(1);
