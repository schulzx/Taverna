/* teste-mm14-missoes.mjs (Fase MM · MM14) — a etapa fecha pelo que acontece

   A sessão de prova (MM11, 30/09, `mente/mm11-sessao.md`) partiu no turno 5
   e não se recompôs: as três missões da manhã fecharam sem se jogarem, e a
   história virou de ato por causa delas. Esta suíte reproduz os quatro
   fechos com os dados da transcrição — cada um FALHA em HEAD de 30/09
   (v9.332) e passa depois — e varre os mundos da MM13/MM13b à procura de
   fechos indevidos.

     T2   "Encontrar Teodoro das Tábuas ✓" no PORTÃO — o nome dito na
          abertura entrou no registo, e `falar_com` lia o registo.
     T5   "Encontrar Delfina ✓ · MISSÃO CONCLUÍDA" com a Delfina a 146 km,
          em Alto do Sal — o Teodoro disse onde ela vivia.
     T10  "Tirar Branca de lá: Chegar a a torre caída ✓" — uma frase ENTRE
          ASPAS, dentro de um convite ("Eu vou à torre caída buscar a
          Branca… Venha comigo"), moveu a heroína; e a trama inteira era
          chegar, com uma virada (caçada) que o App nunca executava.
     T11  "O Chamado" → "A Travessia", pelo peso das duas missões falsas.
     T42  "O lance em O Sino Calado ✓" por entrar na taverna — o lance, a
          virada da trama, nunca aconteceu: a missão de uma etapa fechava
          antes de a virada ser devida.

   As secções:
     1. as tabelas;
     2. os quatro fechos, e o ato;
     3. a varredura — frases de jogador reais contra a porta do movimento;
        e, em 24 mundos, o estado que a MENÇÃO produz contra as principais,
        os marcos e as tramas (0 fechos) — e o estado que o JOGO produz
        (tudo fecha);
     4. lixo, `null` e a imutabilidade.

   Tudo por semente: nenhum `Math.random` decide uma asserção. Os imports
   são por espaço de nomes de propósito: em HEAD os nomes novos não existem,
   e a suíte tem de falhar asserção a asserção, não num import. */
import * as M from "../src/missoes.js";
import * as L from "../src/lugar.js";
import * as T from "../src/tramas.js";
import * as H from "../src/historia.js";
import * as S from "../src/saga.js";
import * as P from "../src/peneira.js";
import { abrirAbertura } from "../src/abertura.js";
import { gerarGeografia } from "../src/geografia.js";
import { ESTRUTURAS } from "../src/historia.js";
import { ANTECEDENTES } from "../src/antecedentes.js";
import { MOLDES } from "../src/moldes.js";
import { generosDisponiveis } from "../src/nomes.js";
import { locaisDaCidade, chaveDoLugar, idDoLocal } from "../src/mundo-base.js";
import { arredoresDaCidade } from "../src/arredores.js";

let ok = 0, mal = 0;
const t = (nome, cond, extra = "") => {
  if (cond) { ok++; console.log("  ok  " + nome); }
  else { mal++; console.log("  XX  " + nome + (extra ? " — " + extra : "")); }
};
const sec = (s) => console.log("\n" + s);
const tenta = (f, d = null) => { try { return f(); } catch { return d; } };
/* Em HEAD (antes do conserto) os nomes novos não existem: a MEDIÇÃO usa as
   mesmas regras escritas aqui, para a suíte correr até ao fim e contar o
   defeito em vez de estourar num import. As asserções de tabela usam os
   nomes do módulo, e é lá que HEAD reprova. */
const ESPERAM = M.VIRADAS_QUE_ESPERAM || [];
const MEDIR = M.VIRADAS_QUE_ESPERAM || ["emboscada", "encontro", "revelacao"];
const moradaDe = typeof M.moradaDe === "function" ? M.moradaDe : (o) => {
  const x = String(o || "").match(/^(.*\S)\s*,\s*(?:em|no|na|nos|nas)\s+(.+)$/i);
  return x ? { lugar: x[1], cidade: x[2] } : { lugar: String(o || ""), cidade: "" };
};

/* ============================================================
   Os dados da sessão (a transcrição, T1–T42)
   ============================================================ */
const FOZ = "Foz do Meio", ALTO = "Alto do Sal";
const SINO = { nome: "O Sino Calado", cidade: FOZ };
const PORTA = { nome: "A Porta Aberta", cidade: ALTO };
const TORRE = { nome: "a torre caída", cidade: FOZ, distancia: "arredores" };
/* a principal como a abertura a escreveu: encontrar a pista no lugar dela,
   e o que o marco pede — a Delfina, com a morada noutra cidade */
const PRINCIPAL = () => M.criarMissao({
  id: "mis_principal", titulo: "O rasto de Delfina", tipo: "principal", status: "ativa", dia: 1, nivel: 1,
  etapas: [
    { tipo: "falar_com", alvo: "Teodoro das Tábuas", onde: "O Sino Calado" },
    { tipo: "falar_com", alvo: "Delfina", onde: "A Porta Aberta, em Alto do Sal" },
  ],
});
/* o registo como o Cronista o deixou: quem foi NOMEADO entra, com o local
   que a conversa lhe deu */
const TEODORO = { nome: "Teodoro das Tábuas", conhecidoEm: 1, local: "Sino Calado" };
const DELFINA = { nome: "Delfina", conhecidoEm: 1, local: "Alto do Sal" };
const BRANCA = { nome: "Branca da Troca", conhecidoEm: 1, local: "Foz do Meio" };
const J10 = "Volto para a mesa do Teodoro … \"Eu vou à torre caída buscar a Branca. Mas não conheço o caminho nem a Branca. Venha comigo — o senhor conhece-a, e ela confia em quem conhece.\" Olho-o nos olhos.";
const LUGARES_FOZ = [
  { nome: "O Sino Calado", tipo: "taverna", onde: "dentro" },
  { nome: "O Campo das Mães", tipo: "cemitério", onde: "dentro" },
  { nome: "a torre caída", tipo: "ruína", onde: "arredores", minutos: 84 },
  { nome: "o Poço de Sal", tipo: "mina", onde: "arredores", minutos: 90 },
];
const tirarDeLa = () => {
  const v = T.VEICULOS.find((x) => x.id === "tirar_de_la");
  const corpo = v.montar({ pessoa: { nome: "Teodoro das Tábuas" }, sumido: "Branca", ermo: { nome: "a torre caída" } });
  return M.criarMissao({ id: "tr_tirar", titulo: corpo.titulo, tipo: "trama", status: "ativa", dador: "Teodoro das Tábuas",
    etapas: corpo.etapas, dia: 1, nivel: 1, veiculo: v.id, virada: { ...v.virada, feita: false } });
};
const oLance = () => {
  const v = T.VEICULOS.find((x) => x.id === "o_leilao");
  const corpo = v.montar({ pessoa: { nome: "Teodoro das Tábuas" }, local: { nome: "O Sino Calado" }, objeto: "pacote lacrado" });
  return M.criarMissao({ id: "tr_lance", titulo: corpo.titulo, tipo: "trama", status: "ativa", dador: "Teodoro das Tábuas",
    etapas: corpo.etapas, dia: 1, nivel: 1, veiculo: v.id, virada: { ...v.virada, feita: false } });
};

/* ============================================================ */
sec("1. as tabelas");
{
  const tipos = (T.TIPOS_DE_VIRADA || []).map((x) => x.id);
  const esperam = ESPERAM;
  t("há viradas que seguram a missão", esperam.length >= 1);
  t("toda virada que segura é uma virada que o App executa", esperam.every((x) => tipos.includes(x)));
  t("a caçada não segura (nela a etapa É a virada)", !esperam.includes("cacada"));
  const ida = L.NAO_E_IDA || [];
  t("a porta do movimento lê a peneira inteira da casa", P.NAO_E_DECLARACAO.every((x) => ida.includes(x)));
  t("e acrescenta o futuro dito com todas as letras", ida.some((x) => x.id === "futuro" && x.rx && x.porque));
  t("toda trama que segura tem uma etapa que se cumpre", T.VEICULOS.filter((v) => esperam.includes(v.virada.tipo))
    .every((v) => { const c = tenta(() => v.montar({ pessoa: { nome: "P" }, local: { nome: "O L" }, cidade: { nome: "C" }, ermo: { nome: "o E" }, sumido: "S", objeto: "o" })); return c && c.etapas.length; }));
}

/* ============================================================ */
sec("2a. T2 — o primeiro passo no portão");
{
  const portao = { cidadeAtual: FOZ, lugarAtual: null, npcs: { t: TEODORO } };
  const r = M.conferir([PRINCIPAL()], portao);
  t("no portão, com o Teodoro só nomeado, o primeiro passo não fecha", r.avancos.length === 0 && !r.missoes[0].etapas[0].feito);
  const r3 = M.conferir([PRINCIPAL()], { cidadeAtual: FOZ, lugarAtual: SINO, npcs: { t: TEODORO } });
  t("no Sino Calado, com ele em cena, fecha (T3)", r3.avancos.length === 1 && r3.missoes[0].etapas[0].feito === true);
  t("e o ✓ aponta para a Delfina, com a cidade", /→ agora: Procurar Delfina na Porta Aberta, em Alto do Sal$/.test(M.linhaDoAvanco(r3.avancos[0])));
  const quarto = M.conferir([PRINCIPAL()], { cidadeAtual: FOZ, lugarAtual: { nome: "o quarto de cima", dentroDe: "O Sino Calado", cidade: FOZ }, npcs: { t: TEODORO } });
  t("um cômodo do Sino Calado é o Sino Calado", quarto.avancos.length === 1);
  const parecido = M.conferir([PRINCIPAL()], { cidadeAtual: FOZ, lugarAtual: { nome: "O Sino Rachado", cidade: FOZ }, npcs: { t: TEODORO } });
  t("um lugar de nome parecido não é o lugar", parecido.avancos.length === 0);
}

sec("2b. T5 — a principal fecha com a Delfina a 146 km");
{
  const passo1 = M.conferir([PRINCIPAL()], { cidadeAtual: FOZ, lugarAtual: SINO, npcs: { t: TEODORO } }).missoes;
  const t5 = M.conferir(passo1, { cidadeAtual: FOZ, lugarAtual: SINO, npcs: { t: TEODORO, d: DELFINA } });
  t("no Sino Calado, com a Delfina só nomeada, a principal NÃO fecha", t5.concluidas.length === 0 && t5.missoes[0].status === "ativa");
  const homonimo = M.conferir(passo1, { cidadeAtual: FOZ, lugarAtual: { nome: "A Porta Aberta", cidade: FOZ }, npcs: { t: TEODORO, d: DELFINA } });
  t("uma Porta Aberta na cidade errada também não", homonimo.concluidas.length === 0);
  const la = M.conferir(passo1, { cidadeAtual: ALTO, lugarAtual: PORTA, npcs: { t: TEODORO, d: { ...DELFINA, local: "A Porta Aberta" } } });
  t("em Alto do Sal, na Porta Aberta, com a Delfina lá: fecha", la.concluidas.length === 1 && la.missoes[0].status === "concluida");
  const semEla = M.conferir(passo1, { cidadeAtual: ALTO, lugarAtual: PORTA, npcs: { t: TEODORO } });
  t("e lá, sem ela em cena, ainda não", semEla.concluidas.length === 0);
}

sec("2c. T10 — \"Tirar Branca de lá\" por uma frase entre aspas");
{
  t("a frase da sessão (um convite, entre aspas) não move a heroína", L.lugarPedido(J10, LUGARES_FOZ) === null, JSON.stringify(L.lugarPedido(J10, LUGARES_FOZ)));
  t("\"vou à torre caída\" dito fora da boca continua a mover", (L.lugarPedido("Vou à torre caída.", LUGARES_FOZ) || {}).nome === "a torre caída");
  const m = tirarDeLa();
  t("a trama tem duas etapas: chegar, e tirar de lá", m.etapas.length === 2 && m.etapas[0].tipo === "ir_a" && m.etapas[1].tipo === "resgatar");
  t("e a virada é uma que o App executa por etapa", ESPERAM.includes(m.virada.tipo) && m.virada.tipo !== "cacada");
  const naTaverna = M.conferir([m], { cidadeAtual: FOZ, lugarAtual: SINO, npcs: { b: BRANCA } });
  t("na taverna, com a Branca nomeada (a moça do cesto), nada fecha", naTaverna.avancos.length === 0);
  const chega = M.conferir([m], { cidadeAtual: FOZ, lugarAtual: TORRE, npcs: {} });
  t("chegar à torre é a primeira etapa, e a missão NÃO fecha", chega.avancos.length === 1 && chega.missoes[0].status === "ativa" && chega.concluidas.length === 0);
  t("e é aí que a virada fica devida", !!T.viradaDevida(chega.missoes[0], { etapasFeitas: 1 }));
  const virada = { ...chega.missoes[0], virada: { ...chega.missoes[0].virada, feita: true } };
  const naLuta = M.conferir([virada], { cidadeAtual: FOZ, lugarAtual: TORRE, npcs: { b: { ...BRANCA, local: "a torre caída" } }, emLuta: true });
  t("com a luta aberta, tirar a Branca ainda não fecha a missão", naLuta.concluidas.length === 0);
  const tira = M.conferir(naLuta.missoes, { cidadeAtual: FOZ, lugarAtual: TORRE, npcs: { b: { ...BRANCA, local: "a torre caída" } } });
  t("acabada a luta, com a Branca lá, fecha", tira.concluidas.length === 1);
}

sec("2d. T42 — \"O lance\" por entrar na taverna");
{
  const m = oLance();
  const entra = M.conferir([m], { cidadeAtual: FOZ, lugarAtual: SINO, npcs: {} });
  t("entrar no Sino Calado cumpre a etapa mas NÃO fecha a missão", entra.avancos.length === 1 && entra.concluidas.length === 0 && entra.missoes[0].status === "ativa");
  t("o ✓ não promete um passo que não existe", !M.linhaDoAvanco(entra.avancos[0]).includes("→"));
  t("e o Narrador é proibido de contar o lance antes de ele acontecer", /NÃO narre o desfecho/.test(M.envelopeDeAvanco(entra.avancos[0])));
  t("a virada (o encontro entre os lances) fica devida", !!T.viradaDevida(entra.missoes[0], { etapasFeitas: 1 }));
  const outra = M.conferir(entra.missoes, { cidadeAtual: FOZ, lugarAtual: SINO, npcs: {} });
  t("enquanto a virada não acontece, a missão espera", outra.concluidas.length === 0 && outra.avancos.length === 0);
  const feita = entra.missoes.map((x) => ({ ...x, virada: { ...x.virada, feita: true } }));
  const fecha = M.conferir(feita, { cidadeAtual: FOZ, lugarAtual: SINO, npcs: {} });
  t("depois da virada, fecha — e uma vez só", fecha.concluidas.length === 1 && M.conferir(fecha.missoes, {}).concluidas.length === 0);
  t("com um avanço de fecho, para o App pagar pelo caminho de sempre", fecha.avancos.length === 1 && fecha.avancos[0].fecho === true);
  t("e a linha do fecho não repete o ✓", tenta(() => /está feito\.$/.test(M.linhaDoAvanco(fecha.avancos[0])) && !M.linhaDoAvanco(fecha.avancos[0]).includes("✓"), false));
}

sec("2e. T11 — o ato não vira com marcos de pé");
{
  /* as duas missões falsas: principal + trama, 3 + 3, contra um custo de 4 */
  let h = H.garantirHistoria({ estrutura: "jornada" });
  h = H.registrarMarco(h, "missao_forcada", "concluí 'O rasto de Delfina'").historia;
  h = H.registrarMarco(h, "missao_forcada", "concluí 'Tirar Branca de lá'").historia;
  t("o peso chegou ao custo (o que virou o ato na sessão)", h.marcos >= H.custoDaEtapa(H.estruturaPorId("jornada"), 0));
  t("com marcos do ato de pé, NÃO vira", H.virarEtapa(h, { marcosPendentes: 2 }).virou === false);
  t("e diz porquê (para o teste, não para a tela)", /marco/.test(H.podeVirar(h, { marcosPendentes: 2 }).motivo || ""));
  t("com o ato cumprido, vira", H.virarEtapa(h, { marcosPendentes: 0 }).virou === true);
  t("sem espinha (save antigo), a conta é a de sempre", H.virarEtapa(h, {}).virou === true && H.virarEtapa(h, null).virou === true);
}

sec("2f. T4 — os marcos da espinha caem por menção");
{
  const esp = S.garantirEspinha({ estrutura: "jornada", atos: [{ ato: 0, marcos: [
    { id: "e|0|0", feitio: "procurar", titulo: "Encontrar Delfina", quem: "Delfina", onde: "A Porta Aberta", ehLugar: true, condicao: { tipo: "falar_com", alvo: "Delfina" } },
    { id: "e|0|1", feitio: "descobrir", titulo: "O que O Campo das Mães esconde", onde: "O Campo das Mães", ehLugar: true, condicao: { tipo: "revelar", alvo: "O Campo das Mães", chave: "Foz do Meio|cemiterio" } },
  ] }] });
  const ver = (c, m) => M.etapaDef(c.tipo).ver(c, m);
  const t4 = S.conferirEspinha(esp, { cidadeAtual: FOZ, lugarAtual: SINO, npcs: { d: DELFINA }, revelados: ["Foz do Meio|cemiterio"] }, ver);
  t("no Sino Calado, com a Delfina e o Campo das Mães só nomeados, nenhum marco cai", t4.cumpridos.length === 0, t4.cumpridos.map((m) => m.titulo).join(", "));
  const naPorta = S.conferirEspinha(esp, { cidadeAtual: ALTO, lugarAtual: PORTA, npcs: { d: DELFINA } }, ver);
  t("na Porta Aberta, com ela lá, o marco cai", naPorta.cumpridos.some((m) => m.id === "e|0|0"));
  const noCampo = S.conferirEspinha(esp, { cidadeAtual: FOZ, lugarAtual: { nome: "O Campo das Mães", cidade: FOZ }, revelados: ["Foz do Meio|cemiterio"] }, ver);
  t("no Campo das Mães, quando ele entra em cena, descobre-se", noCampo.cumpridos.some((m) => m.id === "e|0|1"));
  t("a espinha gravada não muda de forma (a morada é emprestada, não escrita)", !("onde" in esp.atos[0].marcos[0].condicao));
}

/* ============================================================
   3. A VARREDURA
   ============================================================ */
sec("3a. frases de jogador reais contra a porta do movimento");
const NAO_MOVEM = [
  /* (não "volto para a mesa": "mesa" casa, por uma palavra, com "A Mesa
     Honesta" de um dos mundos — um falso positivo antigo da porta, que não
     é o que esta linha mede) */
  (n) => `Viro-me para o Teodoro e digo: "Eu vou até ${n} buscar a Branca. Venha comigo."`,
  (n) => `Conto ao Teodoro que vou até ${n} amanhã cedo.`,
  (n) => `Prometo-lhe que vou até ${n}.`,
  (n) => `"Eu vou até ${n} buscar a Branca. Mas não conheço o caminho. Venha comigo."`,
  (n) => `Amanhã vou até ${n}.`,
  (n) => `Mais tarde vou até ${n}, agora bebo.`,
  (n) => `Irei até ${n} quando amanhecer.`,
  (n) => `Posso ir até ${n}?`,
  (n) => `Será que vale a pena ir até ${n}?`,
  (n) => `Se eu for até ${n}, o que encontro?`,
  (n) => `Não vou até ${n}.`,
  (n) => `Pretendo ir até ${n} depois do almoço.`,
  (n) => `Digo ao Teodoro: vou até ${n} contigo.`,
  (n) => `Quando anoitecer, sigo até ${n}.`,
];
const MOVEM = [
  (n) => `Vou até ${n}.`,
  (n) => `Sigo direto até ${n}.`,
  (n) => `Caminho até ${n} e peço uma cerveja.`,
  (n) => `Vou até ${n}. Quanto custa um quarto?`,
  (n) => `Não, vou até ${n}!`,
];
const GENEROS = generosDisponiveis();
const MUNDOS = [];
for (const g of GENEROS) for (const Mo of MOLDES) {
  const semente = `Sonda MM13|${g}|${Mo.id}`;
  const mapa = gerarGeografia(semente, Mo);
  MUNDOS.push({ semente, genero: g, molde: Mo, mapa, cidade: mapa.cidades[0].nome });
}
{
  let indevidos = 0, frases = 0, perdidos = 0, declaradas = 0;
  const exIndevido = [], exPerdido = [];
  for (const w of MUNDOS) {
    const cid = w.mapa.cidades[0];
    const lugares = [
      ...locaisDaCidade(w.semente, cid, w.genero, w.molde).map((l) => ({ ...l, onde: "dentro" })),
      ...arredoresDaCidade(w.semente, cid).map((a) => ({ ...a, onde: "arredores" })),
    ];
    for (const l of lugares.slice(0, 6)) {
      for (const f of NAO_MOVEM) {
        frases++;
        const r = tenta(() => L.lugarPedido(f(l.nome), lugares));
        if (r) { indevidos++; if (exIndevido.length < 3) exIndevido.push(`${f(l.nome)} → ${r.nome}`); }
      }
      for (const f of MOVEM) {
        declaradas++;
        const r = tenta(() => L.lugarPedido(f(l.nome), lugares));
        if (!r || r.nome !== l.nome) { perdidos++; if (exPerdido.length < 3) exPerdido.push(`${f(l.nome)} → ${r ? r.nome : "nada"}`); }
      }
    }
  }
  console.log(`       ${frases} frases que não são ida · ${indevidos} moveram · ${declaradas} idas declaradas · ${perdidos} perdidas`);
  t(`nenhuma frase de futuro, hipótese, pergunta, fala ou negação move o herói (${indevidos}/${frases})`, indevidos === 0, exIndevido.join(" | "));
  t(`toda ida declarada continua a mover (${declaradas - perdidos}/${declaradas})`, perdidos === 0, exPerdido.join(" | "));
}

sec("3b. em 24 mundos: o que a menção produz não fecha nada; o que o jogo produz, fecha");
{
  const abrir = (w, estrutura, antecedente) => {
    const espinha = S.estenderEspinha({ semente: w.semente, mapa: w.mapa, genero: w.genero, molde: w.molde, estrutura, cidadeInicial: w.cidade });
    const r = abrirAbertura({ semente: w.semente, mapa: w.mapa, cidade: w.cidade, espinha, estrutura, antecedente, genero: w.genero, molde: w.molde, nivel: 1, dia: 1 });
    return r ? { ...r, espinha } : null;
  };
  const ver = (c, m) => M.etapaDef(c.tipo).ver(c, m);
  let principais = 0, indevidasP = 0, marcos = 0, indevidosM = 0, presas = 0;
  const exP = [], exM = [], exPresa = [];
  MUNDOS.forEach((w, wi) => {
    const locais = locaisDaCidade(w.semente, w.mapa.cidades[0], w.genero, w.molde);
    for (const est of ESTRUTURAS) {
      const r = abrir(w, est.id, ANTECEDENTES[wi % ANTECEDENTES.length].id);
      if (!r) continue;
      principais++;
      const a = r.abertura;
      /* O MUNDO DA MENÇÃO: todo nome que a abertura e os marcos dizem entrou
         no registo; todo lugar da cidade e todo lugar de marco foi revelado
         (foi nomeado numa conversa); e o herói está NUM LUGAR QUALQUER da
         cidade que não é o de nenhum passo — a taverna do lado. */
      const todosMarcos = r.espinha.atos.flatMap((x) => x.marcos);
      const nomes = [a.pista.nome, a.alvo.quem, ...todosMarcos.map((m) => m.quem)].filter(Boolean);
      const npcs = Object.fromEntries(nomes.map((n, i) => [`n${i}`, { nome: n, conhecidoEm: 1, local: "longe daqui" }]));
      const revelados = [
        ...locais.map((l) => idDoLocal(w.cidade, l)),
        ...todosMarcos.filter((m) => m.feitio === "descobrir").map((m) => (m.condicao && m.condicao.chave) || chaveDoLugar(w.semente, w.mapa, m.onde, { genero: w.genero, molde: w.molde })),
      ].filter(Boolean);
      const ocupados = new Set([a.pista.local, a.alvo.onde, ...todosMarcos.map((m) => m.onde)].filter(Boolean).map((x) => moradaDe(x).lugar.toLowerCase()));
      const alheio = locais.find((l) => !ocupados.has(String(l.nome).toLowerCase()));
      const mencao = { cidadeAtual: w.cidade, lugarAtual: alheio ? { nome: alheio.nome, cidade: w.cidade } : null, npcs, revelados, derrotados: [], inventario: [], equipamento: [], dia: 1, relogios: [] };
      let ms = [r.missao];
      for (let i = 0; i < 4; i++) ms = M.conferir(ms, mencao).missoes;
      const feitas = ms[0].etapas.filter((e) => e.feito).length;
      if (feitas) { indevidasP++; if (exP.length < 3) exP.push(`${w.genero}/${w.molde.id}/${est.id}: ${ms[0].etapas.filter((e) => e.feito).map(M.textoDaEtapa).join(" · ")}`); }
      const ce = S.conferirEspinha(r.espinha, mencao, ver);
      const soDeMencao = todosMarcos.filter((m) => m.feitio === "procurar" || m.feitio === "descobrir");
      marcos += soDeMencao.length;
      const caidos = ce.cumpridos.filter((m) => m.feitio === "procurar" || m.feitio === "descobrir");
      indevidosM += caidos.length;
      if (caidos.length && exM.length < 3) exM.push(`${w.genero}/${w.molde.id}: ${caidos.map((m) => m.titulo).join(" · ")}`);

      /* O MUNDO DO JOGO: o herói ANDA — a cada turno está no lugar do passo
         da vez, com quem ele procura lá e o lugar revelado ali. A principal
         tem de fechar (regressão: a MM13 media 0% presas assim). */
      let jogo = [r.missao];
      for (let i = 0; i < 5 && jogo[0].status === "ativa"; i++) {
        const e = jogo[0].etapas.find((x) => !x.feito);
        if (!e) break;
        const md = moradaDe(e.onde || e.alvo);
        const k = e.tipo === "revelar" ? (e.chave || chaveDoLugar(w.semente, w.mapa, e.alvo, { genero: w.genero, molde: w.molde })) : "";
        const cidade = md.cidade || (k.includes("|") ? k.split("|")[0] : w.cidade);
        const aqui = { nome: md.lugar, cidade };
        jogo = M.conferir(jogo, {
          cidadeAtual: cidade, lugarAtual: aqui,
          npcs: e.tipo === "falar_com" ? { x: { nome: e.alvo, conhecidoEm: 1, local: md.lugar } } : {},
          revelados: k ? [k] : [], derrotados: e.tipo === "derrotar" ? Array(e.quantos || 1).fill(e.alvo) : [],
          inventario: [], equipamento: [], dia: 1, relogios: [],
        }).missoes;
      }
      if (jogo[0].status !== "concluida") { presas++; if (exPresa.length < 3) exPresa.push(`${w.genero}/${w.molde.id}/${est.id}`); }
    }
  });
  console.log(`       ${principais} principais · pela menção: ${indevidasP} com passo fechado · ${marcos} marcos procurar/descobrir: ${indevidosM} caídos · jogadas: ${presas} presas`);
  t(`nenhuma principal fecha um passo pela menção (${indevidasP}/${principais})`, indevidasP === 0, exP.join(" | "));
  t(`nenhum marco procurar/descobrir cai pela menção (${indevidosM}/${marcos})`, indevidosM === 0, exM.join(" | "));
  t(`e toda principal jogada fecha (${principais - presas}/${principais})`, presas === 0, exPresa.join(" | "));
}

sec("3c. as tramas: nenhuma fecha antes da virada, e todas fecham depois");
{
  const mat = { pessoa: { nome: "Fina Da Rede" }, local: { nome: "O Fogo do Patamar" }, cidade: { nome: "Aldoria" }, criatura: { nome: "cão de rua" }, ermo: { nome: "as figueiras" }, sumido: "Ione", objeto: "pacote lacrado" };
  let medidas = 0, cedo = 0, nunca = 0;
  const exCedo = [], exNunca = [];
  for (const v of T.VEICULOS) {
    if (!MEDIR.includes(v.virada.tipo)) continue;
    const c = v.montar(mat);
    const m = M.criarMissao({ id: `tr_${v.id}`, titulo: c.titulo, tipo: "trama", status: "ativa", etapas: c.etapas, dia: 1, nivel: 1, virada: { ...v.virada, feita: false } });
    if (!m) continue;
    medidas++;
    /* o mundo que cumpre TODAS as etapas de uma vez: o herói em cada lugar,
       as pessoas com ele, o prazo passado */
    const mundoDe = (e) => {
      const onde = e.onde || e.alvo || "";
      return { cidadeAtual: e.tipo === "ir_a" && !e.lugar ? e.alvo : "Aldoria", lugarAtual: { nome: e.lugar || e.tipo !== "ir_a" ? onde : "", cidade: "Aldoria" },
        npcs: { x: { nome: e.alvo, conhecidoEm: 1, local: onde } }, dia: 99, derrotados: Array(5).fill(e.alvo), relogios: [], inventario: [], equipamento: [], revelados: [] };
    };
    let ms = [m], fechou = false;
    for (let i = 0; i < m.etapas.length + 2; i++) {
      const e = ms[0].etapas.find((x) => !x.feito) || ms[0].etapas[ms[0].etapas.length - 1];
      const r = M.conferir(ms, mundoDe(e));
      ms = r.missoes;
      if (r.concluidas.length) fechou = true;
    }
    if (fechou) { cedo++; if (exCedo.length < 3) exCedo.push(v.id); }
    const depois = M.conferir(ms.map((x) => ({ ...x, virada: { ...x.virada, feita: true } })), {});
    if (!depois.concluidas.length) { nunca++; if (exNunca.length < 3) exNunca.push(`${v.id}: ${ms[0].etapas.map((e) => `${e.tipo}${e.feito ? "✓" : ""}`).join(",")}`); }
  }
  console.log(`       ${medidas} tramas com virada que espera · ${cedo} fecharam antes dela · ${nunca} nunca fecharam depois`);
  t("há tramas para medir", medidas >= 5);
  t(`nenhuma trama fecha antes da virada (${cedo})`, cedo === 0, exCedo.join(" | "));
  t(`e toda ela fecha depois da virada (${medidas - nunca}/${medidas})`, nunca === 0, exNunca.join(" | "));
}

/* ============================================================ */
sec("4. lixo, null e a imutabilidade");
{
  t("conferir com mundo null não quebra", tenta(() => M.conferir([PRINCIPAL()], null).avancos.length === 0, false));
  t("estaEm com lixo é falso", tenta(() => M.estaEm(null, "") === false && M.estaEm({}, null) === false && M.estaEm(undefined, "O Sino Calado") === false, false));
  t("estaCom sem ninguém no registo é falso", tenta(() => M.estaCom({ alvo: "Delfina" }, { npcs: null }) === false && M.estaCom(null, null) === false, false));
  t("moradaDe de lixo é vazia", tenta(() => JSON.stringify(M.moradaDe(null)) === JSON.stringify({ lugar: "", cidade: "" }), false));
  t("moradaDe separa a cidade", tenta(() => M.moradaDe("A Porta Aberta, em Alto do Sal").cidade === "Alto do Sal" && M.moradaDe("A Porta Aberta, em Alto do Sal").lugar === "A Porta Aberta", false));
  t("sem morada nem posição, o registo basta (o de sempre)", M.etapaDef("falar_com").ver({ alvo: "Iris" }, { npcs: { i: { nome: "Iris", conhecidoEm: 1 } } }) === true);
  t("lugarPedido de lixo é null", L.lugarPedido(null, null) === null && L.lugarPedido("", LUGARES_FOZ) === null);
  const m = oLance(); const antes = JSON.stringify(m);
  M.conferir([m], { cidadeAtual: FOZ, lugarAtual: SINO });
  t("conferir não muta a missão que recebe", JSON.stringify(m) === antes);
  const h = H.garantirHistoria({ estrutura: "jornada", marcos: 9 }); const hAntes = JSON.stringify(h);
  H.virarEtapa(h, { marcosPendentes: 3 });
  t("virarEtapa não muta a história que recebe", JSON.stringify(h) === hAntes);
}

/* A FIAÇÃO — o App grava o marco da espinha pelo arco (e não o objeto de
   retorno no lugar dele), diz às tramas quando há luta, e dá ao arco os
   marcos por cumprir. Por texto, fim de linha normalizado. */
{
  const { readFileSync } = await import("node:fs");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  t("o marco da espinha passa pelo arco (sem gravar {historia, ganhou} no lugar dele)", app.includes("marcarNoArco(feitioDe(m.feitio).peso, m.titulo);") && !app.includes("historiaRef.current = registrarMarco(historiaRef.current, feitioDe(m.feitio).peso"));
  t("as missões sabem quando há luta", app.includes("relogios: relogiosRef.current, emLuta: !!combateRef.current,"));
  t("o arco sabe os marcos por cumprir do ato", app.includes("marcosPendentes: (() => { try { const pa = progressoDoAto(espinhaRef.current"));
}

console.log(`\nmm14-missoes: ${ok} passaram, ${mal} falharam`);
process.exit(mal ? 1 : 0);
