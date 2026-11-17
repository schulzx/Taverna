/* ============================================================
   AS PEÇAS · NO JOGO (17/11/2026, Fase B da prova) — src/pecas/no-jogo.js

   A ponte entre o motor das peças (peca, encaixe, calor, andar) e o turno
   do App. Tudo o que DECIDE mora aqui, provado em Node; o App só executa
   (abre o chamado, aplica o estado, põe na pauta) e embrulha cada chamada
   num calou — se as peças estourarem, o turno segue como hoje.

   O INTERRUPTOR (PECAS_LIGADAS): a arquitetura está em prova, e o jogador
   real não pode cair nela. Só joga por peças a quest da lista, e só quando
   a configuração local `taverna_cfg_pecas` vale "1" (o parâmetro de URL
   `?pecas=1` grava-a; `?pecas=0` apaga-a). Desligado, nenhuma função
   daqui devolve nada, e o turno é o de hoje, byte a byte.

   oTurnoDaPeca(frase, estado, opcoes) → null (não é da peça) | {
     tipo: "solucao" | "cena" | "aquecimento" | "livre" | "luta",
     estado, minutos, peca, leitura, solucao, chamado, cobranca, abre,
     pacote, pauta }
     1. o relógio cheio: o mundo cobra (oMundoCobra), o preço aplica-se
        pelas portas do quadro, e a forçada imposta rola-se;
     2. a frase encaixa (encaixar);
     3. `solucao` → o chamado (perícia, número, o preço em palavras: a
        seta); `luta` → a espada é do jogo de hoje (o confronto do covil);
        `aquecimento` → o calor e o relógio andam; a solução que encheu
        abre-se (`abre`, o chamado aparece); `cena`/`livre` → o de hoje.
   resolverNoJogo(marca, passou, estado, opcoes) → o dado pousou: o facto
     no livro (resolver), a seta, o preço; e o que o Narrador recebe.
   aPautaDaPeca(pacote, extra) → { acabou, naoPode, quadro } — o canal de
     um turno (nenhum bloco estático: o teto é sagrado).
   ausentesDaPeca(ausentes, conhecidos, pacote) → a régua da poda: quem não
     está na cena fechada é ausente.

   PURO E DETERMINÍSTICO. O estado recebido nunca é mutado.
   ============================================================ */
import { garantirQuestsDaEspinha } from "../motor/quests-do-turno.js";
import { questPorId } from "../biblioteca-de-quests.js";
import { aplicarPrecoDoQuadro } from "../quadro-da-quest.js";
import { desafioPorId } from "../desafios.js";
import { O_CHAMADO } from "../motor/o-mestre-chama.js";
import { periciaPorId } from "../pericias.js";
import { aPecaDaEtapa } from "./peca.js";
import { encaixar, FAMILIAS_QUE_PEDEM_A_PALAVRA } from "./encaixe.js";
import { memoriaDe, comMemoria, aquecer, oMundoCobra, relogioCheio } from "./calor.js";
import { resolver, oQueONarradorRecebe } from "./andar.js";
import { FALAS_DA_SETA } from "./excecoes-da-prova.js";

const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const sem = (x) => String(x == null ? "" : x).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const inteiro = (x) => (Number.isFinite(Number(x)) ? Math.trunc(Number(x)) : 0);

/* ---------------- O INTERRUPTOR ---------------- */
export const PECAS_LIGADAS = Object.freeze({
  /* as quests que jogam por peças: só a da prova */
  quests: Object.freeze(["o_que_desce_ao_anoitecer"]),
  /* de onde vem a permissão: a configuração local, fora do save */
  chave: "taverna_cfg_pecas",
  parametro: "pecas",
  liga: "1",
  porque: "a arquitetura das peças está em prova: o jogador real só cai nela se a ligar à mão",
});

/* lerOInterruptor(storage, busca) → true | false. `storage`: { getItem,
   setItem, removeItem } (o localStorage); `busca`: o location.search. O
   parâmetro grava (1) ou apaga (0) a configuração; sem ele, vale o que lá
   estiver. Nunca lança. */
export function lerOInterruptor(storage, busca) {
  try {
    const m = String(busca || "").match(new RegExp(`[?&]${PECAS_LIGADAS.parametro}=([01])\\b`));
    if (m && storage) {
      if (m[1] === PECAS_LIGADAS.liga) storage.setItem(PECAS_LIGADAS.chave, PECAS_LIGADAS.liga);
      else if (typeof storage.removeItem === "function") storage.removeItem(PECAS_LIGADAS.chave);
    }
    return !!storage && storage.getItem(PECAS_LIGADAS.chave) === PECAS_LIGADAS.liga;
  } catch {
    return false;
  }
}

/* ---------------- A PEÇA EM JOGO ----------------
   aPecaEmJogo(estado, { ligado, mundo }) → { registo, peca } | null — a
   quest da lista aberta, e a peça da etapa em curso. A carta de escolha
   fica com o jogo de hoje (o quadro já a mostra, com o ganho e o custo). */
export function aPecaEmJogo(estado, opcoes) {
  try {
    const o = obj(opcoes) || {};
    if (o.ligado !== true) return null;
    const E = obj(estado) || {};
    const regs = garantirQuestsDaEspinha(obj(E.espinha) ? E.espinha.quests : null).registos;
    const R = arr(regs).find((r) => obj(r) && PECAS_LIGADAS.quests.includes(r.id) && r.estado === "aberta");
    if (!R) return null;
    const peca = aPecaDaEtapa(R, null, E, { mundo: o.mundo || null });
    if (!peca || peca.carta || !arr(peca.solucoes).length) return null;
    return { registo: R, peca };
  } catch {
    return null;
  }
}

/* ---------------- O QUE O MESTRE DIZ ANTES DO DADO ----------------
   A seta em palavras: para onde a falha leva (a fala da exceção da quest,
   senão a da tabela pela solução de destino), ou o preço que ela cobra. */
export const FALA_DA_SETA = Object.freeze({
  lutar: "Se falhar, é luta.",
  pagar: "Se falhar, só a bolsa abre essa boca.",
  convencer: "Se falhar, vai ter de pedir de outro jeito.",
  intimidar: "Se falhar, só a ameaça resta.",
  investigar: "Se falhar, sobra olhar com mais cuidado.",
  revistar: "Se falhar, sobra revirar tudo.",
  ler: "Se falhar, sobra ler o que ficou.",
  orientar: "Se falhar, vai ter de achar o caminho de outro jeito.",
  arrombar: "Se falhar, só a força abre.",
  comprar: "Se falhar, vai ter de pagar.",
  impressionar: "Se falhar, vai ter de convencer.",
  continua: "Se falhar, o tempo passa e a coisa fica por fazer.",
  porque: "o preço é a seta: o jogador lê, antes do dado, para onde a falha o leva",
});
/* o bónus do calor, dito em palavras (quem interpretou antes rola melhor) */
export const FALA_DO_CALOR = Object.freeze({
  olhar: "você já sondou o terreno", conversa: "a conversa já preparou o pedido", outro: "você já preparou isto",
  /* a perícia diz de que preparo se fala */
  periciasDoOlhar: Object.freeze(["percepcao", "investigacao", "sobrevivencia"]),
});

const baseDe = (id) => String(id || "").split("@")[0];
export function avisoDaSeta(s, peca) {
  if (!obj(s)) return "";
  const daQuest = obj(FALAS_DA_SETA[peca && peca.quest]) || {};
  if (typeof daQuest[s.base || baseDe(s.id)] === "string") return daQuest[s.base || baseDe(s.id)];
  const f = obj(s.falha);
  if (!f) return FALA_DA_SETA.continua;
  if (f.para) {
    const destino = arr(peca && peca.solucoes).find((x) => x.id === f.para);
    if (destino && destino.luta) return FALA_DA_SETA.lutar;
    return FALA_DA_SETA[baseDe(f.para)] || FALA_DA_SETA.continua;
  }
  if (f.preco) {
    const linha = { tempo: "o tempo se vai nisso", incompleta: "fica com a metade", alerta: "alguém vai ver você", cobra: "vai custar moedas", danificado: "não sai inteiro" }[f.preco];
    return linha ? `Se falhar, ${linha}.` : FALA_DA_SETA.continua;
  }
  return FALA_DA_SETA.continua;
}

/* ---------------- O CHAMADO E O VEREDITO DA SOLUÇÃO ----------------
   oChamadoDaSolucao(s, dado, peca) → { pericia, periciaNome, atributo, dc,
   bonus, diz, aviso } — o número já com o bónus do calor (o «+N» dito em
   palavras); a CD da peça (piorada pelo mundo que cobrou). */
export function oChamadoDaSolucao(s, dado, peca) {
  if (!obj(s)) return null;
  const d = obj(dado) || {};
  const per = periciaPorId(s.pericia) || null;
  const bonus = Math.max(0, inteiro(d.bonus));
  const dc0 = Number.isFinite(Number(d.dc)) ? Number(d.dc) : Number(s.dc) || 12;
  const ondeDiz = FALA_DO_CALOR.periciasDoOlhar.includes(s.pericia) ? FALA_DO_CALOR.olhar : ["social", "ameaca", "engano", "troca", "intuicao"].includes(s.familia) ? FALA_DO_CALOR.conversa : FALA_DO_CALOR.outro;
  return Object.freeze({
    pericia: s.pericia || "", periciaNome: per ? per.nome : "", atributo: per ? per.atributo : "",
    dc: dc0 - bonus, bonus, diz: bonus > 0 ? `${ondeDiz}: +${bonus}` : "", aviso: avisoDaSeta(s, peca),
  });
}

/* oVereditoDaSolucao(s, chamado, peca, vDaCasa) → o veredito no formato de
   `lerAcao` (o que rolarDesafio e o chamado de hoje leem), com a marca
   `peca`. O que vem da casa (rótulo, minutos, barulho) fica; a conta
   social, o oráculo e a vigia saem — o número e o preço são da peça. */
export function oVereditoDaSolucao(s, chamado, peca, vDaCasa) {
  if (!obj(s) || !obj(chamado) || !obj(peca)) return null;
  const v0 = obj(vDaCasa) && vDaCasa.tipo === "teste" ? vDaCasa : null;
  const d = desafioPorId(s.acao) || {};
  const base = v0 || { id: s.acao, rotulo: d.rotulo || s.acao, minutos: d.minutos || 0, barulho: !!d.barulho, corpo: !!d.corpo, alvoDoCusto: d.alvoDoCusto != null ? d.alvoDoCusto : d.alvo || null };
  return Object.freeze({
    ...base,
    tipo: "teste",
    pericia: chamado.pericia || base.pericia || "",
    atributo: chamado.atributo || base.atributo || "presenca",
    dc: chamado.dc,
    deOnde: chamado.diz || base.deOnde || "o Mestre pede",
    chave: `pecas|${peca.quest}|${peca.etapa}|${s.id}`,
    mudou: [], situacoes: [], social: null, oportunidade: null, vigia: false, dispensavel: false, achado: null,
    peca: Object.freeze({ quest: peca.quest, etapa: peca.etapa, solucao: s.id, aviso: chamado.aviso, diz: chamado.diz }),
  });
}

/* oChamadoDaPeca(chamadoDeHoje, marca, v) → o chamado (o formato de
   motor/o-mestre-chama.js) com o preço da peça: a seta no lugar do aviso
   do catálogo, e o calor no «porque». Sem chamado de hoje (o catálogo
   calava: a conversa, o bicho), nasce aqui pela mesma forma. */
export function oChamadoDaPeca(chamadoDeHoje, marca, v) {
  const m = obj(marca);
  if (!m || !obj(v)) return chamadoDeHoje || null;
  const per = periciaPorId(v.pericia);
  const periciaNome = (obj(chamadoDeHoje) && chamadoDeHoje.periciaNome) || (per && per.nome) || "Teste";
  const aviso = m.aviso || FALA_DA_SETA.continua;
  const linha = O_CHAMADO.molde.replace("{pericia}", periciaNome).replace("{dc}", String(v.dc)).replace("{porque}", m.diz ? `, ${m.diz}` : "").replace("{aviso}", aviso);
  return Object.freeze({
    ...(obj(chamadoDeHoje) || { efeito: "fecha", dado: Object.freeze({ teste: O_CHAMADO.dado, preco: null }) }),
    pericia: v.pericia || "", periciaNome, dc: Number(v.dc),
    aviso, cobrado: aviso.replace(O_CHAMADO.condicional, "").replace(O_CHAMADO.fimDoAviso, ""),
    chave: String(v.chave || ""), linha, porque: m.diz || "",
    carta: undefined,
  });
}

/* ---------------- A PAUTA ---------------- */
export const PAUTA_DA_PECA = Object.freeze({
  cena: "CENA FECHADA: {onde}. Aqui: {quem}.{oQue}",
  oQue: " Há: {oQue}.",
  ninguem: "só o herói e quem anda com ele",
  pista: "Plante, sem apontar: {pista}.",
  naoPode: "Só agem e falam: {quem}. Ninguém entra, nada aparece fora disto; o resultado já está decidido.",
  semCaminhos: "Não ofereça caminhos nem pergunte o que o herói faz.",
  cobrou: "{diz} (já aconteceu; o sistema já cobrou: {preco})",
  porque: "o pacote do Narrador por turno, pelo canal de um turno: a cena fechada no lugar do caso; nenhum bloco estático",
});
export function aPautaDaPeca(pacote, extra) {
  const p = obj(pacote);
  if (!p) return null;
  const x = obj(extra) || {};
  const quem = arr(p.cena && p.cena.quem);
  const lista = quem.length ? quem.join(", ") : PAUTA_DA_PECA.ninguem;
  const onde = (p.cena && p.cena.onde && p.cena.onde.nome) || "este lugar";
  const oQue = arr(p.cena && p.cena.oQue).filter((x) => sem(x) !== sem(onde));
  const linhaCena = PAUTA_DA_PECA.cena.replace("{onde}", onde).replace("{quem}", lista).replace("{oQue}", oQue.length ? PAUTA_DA_PECA.oQue.replace("{oQue}", oQue.join(", ")) : "");
  const pista = typeof x.pista === "string" && x.pista ? x.pista : p.pista;
  const quadro = [linhaCena, pista ? PAUTA_DA_PECA.pista.replace("{pista}", pista) : ""].filter(Boolean).join(" ");
  const acabou = [];
  if (obj(x.cobranca) && x.cobranca.diz) acabou.push(PAUTA_DA_PECA.cobrou.replace("{diz}", x.cobranca.diz).replace("{preco}", x.cobranca.preco || ""));
  for (const l of arr(x.acabou)) if (typeof l === "string" && l.trim()) acabou.push(l);
  return { acabou, naoPode: [PAUTA_DA_PECA.naoPode.replace("{quem}", lista), PAUTA_DA_PECA.semCaminhos], quadro };
}

/* o que aconteceu, em palavras, para a pauta (ACABOU DE) */
export function oQueAconteceu(peca, resultado) {
  const r = obj(resultado);
  const s = r && arr(peca && peca.solucoes).find((x) => x.id === r.solucao);
  if (!r || !s) return "";
  const alvo = (s.alvo && s.alvo.nome) || "";
  const rot = (desafioPorId(s.acao) || {}).rotulo || s.acao;
  if (r.passou) {
    if (r.tipo === "abriu") return `O herói tentou ${rot}${alvo ? " (" + alvo + ")" : ""} e conseguiu: ganhou vantagem para o passo seguinte.`;
    if (r.tipo === "recuou") return "O herói recuou a tempo; nada se resolveu, e o tempo passou.";
    return `O herói tentou ${rot}${alvo ? " (" + alvo + ")" : ""} e conseguiu. Narre o que isso revela, sem decidir mais nada.`;
  }
  const destino = r.para ? arr(peca.solucoes).find((x) => x.id === r.para) : null;
  const seta = destino ? (destino.luta ? " A situação vira luta." : " Ficou aberto outro caminho, mais difícil.") : "";
  return `O herói tentou ${rot}${alvo ? " (" + alvo + ")" : ""} e falhou.${r.preco ? " " + r.preco.linha : ""}${seta}`;
}

/* ---------------- O TURNO DA PEÇA ---------------- */
export function oTurnoDaPeca(frase, estado, opcoes) {
  try {
    const o = obj(opcoes) || {};
    const pe = aPecaEmJogo(estado, o);
    if (!pe) return null;
    let { peca } = pe;
    let E = obj(estado) || {};
    let minutos = 0;
    let cobranca = null;
    const pauta = (pacote, extra) => aPautaDaPeca(pacote, { cobranca, ...(obj(extra) || {}) });
    /* 1. o relógio cheio: o mundo cobra */
    if (relogioCheio(memoriaDe(E, peca), peca)) {
      const c = oMundoCobra(peca, E);
      if (c) {
        const pago = aplicarPrecoDoQuadro(E, c.preco, {});
        E = comMemoria({ ...E, ...(pago && obj(pago.estado) ? pago.estado : {}) }, peca, c.memoria);
        minutos += inteiro(pago && pago.minutos);
        peca = c.peca;
        cobranca = { diz: c.evento.diz, preco: c.preco.linha, precoId: c.preco.id, forcada: c.forcada, impoe: !!c.impoe };
        const forcada = c.impoe && c.forcada ? peca.solucoes.find((s) => s.id === c.forcada) : null;
        /* a bolsa e a espada nunca se impõem: o mundo põe-nas à vista, e só a
           palavra do jogador as abre (FAMILIAS_QUE_PEDEM_A_PALAVRA) */
        /* a luta imposta: o mundo traz a fera, e a espada é do jogo de hoje
           (o confronto do covil abre-a) */
        if (forcada && forcada.luta && c.impoe) {
          const pacote = oQueONarradorRecebe(peca, { tipo: "aquecimento" });
          return { tipo: "luta", imposta: true, estado: E, minutos, peca, registo: pe.registo, leitura: null, solucao: forcada, chamado: null, cobranca, abre: null, pacote, pauta: pauta(pacote, { pista: (peca.pistas.find((p) => p.solucao === forcada.id) || {}).diz }) };
        }
        if (forcada && !forcada.luta && !forcada.semDado && !FAMILIAS_QUE_PEDEM_A_PALAVRA.includes(forcada.familia)) {
          const ch = oChamadoDaSolucao(forcada, { dc: forcada.dc + memoriaDe(E, peca).pior, bonus: 0 }, peca);
          const pacote = oQueONarradorRecebe(peca, { tipo: "aquecimento" });
          return { tipo: "solucao", imposta: true, estado: E, minutos, peca, registo: pe.registo, leitura: null, solucao: forcada, chamado: ch, cobranca, abre: null, pacote, pauta: pauta(pacote, { pista: (peca.pistas.find((p) => p.solucao === forcada.id) || {}).diz }) };
        }
      }
    }
    /* 2. a frase encaixa */
    const r = encaixar(frase, peca, E, { conhecidos: o.conhecidos });
    const base = { estado: E, minutos, peca, registo: pe.registo, leitura: r, solucao: null, chamado: null, cobranca, abre: null };
    if (!r || r.tipo === "livre") {
      const pacote = oQueONarradorRecebe(peca, { tipo: "livre" });
      return { ...base, tipo: "livre", pacote, pauta: pauta(pacote) };
    }
    if (r.tipo === "cena") {
      const pacote = oQueONarradorRecebe(peca, { tipo: "livre" });
      return { ...base, tipo: "cena", pacote, pauta: pauta(pacote) };
    }
    if (r.tipo === "solucao") {
      const s = peca.solucoes.find((x) => x.id === r.solucao);
      if (!s) return null;
      const pacote = oQueONarradorRecebe(peca, { tipo: "aquecimento" });
      if (s.luta) return { ...base, tipo: "luta", solucao: s, pacote, pauta: pauta(pacote) };
      return { ...base, tipo: "solucao", solucao: s, chamado: oChamadoDaSolucao(s, r.dado, peca), pacote, pauta: pauta(pacote, { pista: r.pista }) };
    }
    /* 3. o aquecimento: o calor e o relógio — mais nada muda */
    const a = aquecer(memoriaDe(E, peca), peca, r);
    E = comMemoria(E, peca, a.memoria);
    const abriuS = a.abriu.map((id) => peca.solucoes.find((s) => s.id === id)).find((s) => s && s.aVista && !s.luta && !s.semDado && !["troca", "luta"].includes(s.familia)) || null;
    const pacote = oQueONarradorRecebe(peca, { tipo: "aquecimento", pista: r.pista });
    const abre = abriuS ? { solucao: abriuS, chamado: oChamadoDaSolucao(abriuS, { dc: abriuS.dc + memoriaDe(E, peca).pior, bonus: 0 }, peca) } : null;
    return { ...base, tipo: "aquecimento", estado: E, abriu: a.abriu, abre, pacote, pauta: pauta(pacote, { pista: r.pista }) };
  } catch {
    return null;
  }
}

/* ---------------- O DADO POUSOU ----------------
   resolverNoJogo(marca, passou, estado, { mundo, dia, turno }) → { estado,
   resultado, minutos, pacote, pauta, luta } | null. `marca`: o `peca` do
   veredito ({ quest, etapa, solucao }). A peça refaz-se do estado de
   agora (com a forçada do mundo, se houver). `luta`: a falha levou à
   espada — o confronto do covil é que a abre. */
export function resolverNoJogo(marca, passou, estado, opcoes) {
  try {
    const m = obj(marca);
    if (!m) return null;
    const o = obj(opcoes) || {};
    const pe = aPecaEmJogo(estado, { ligado: true, mundo: o.mundo });
    if (!pe || pe.peca.quest !== m.quest || pe.peca.etapa !== m.etapa) return null;
    const r = resolver(pe.peca, m.solucao, { passou: !!passou }, estado, { registo: pe.registo, mundo: o.mundo || null, dia: o.dia, turno: o.turno });
    if (!r) return null;
    const pacote = oQueONarradorRecebe(pe.peca, r.resultado);
    const destino = r.resultado.para ? pe.peca.solucoes.find((x) => x.id === r.resultado.para) : null;
    const linha = oQueAconteceu(pe.peca, r.resultado);
    return {
      estado: r.estado, resultado: r.resultado, minutos: inteiro(r.resultado.minutos),
      pacote, pauta: aPautaDaPeca(pacote, { acabou: linha ? [linha] : [] }),
      luta: !r.resultado.passou && !!(destino && destino.luta),
      escreveu: arr(r.resultado.fatos).length > 0 && (r.resultado.passou || !!r.resultado.preco),
    };
  } catch {
    return null;
  }
}

/* ---------------- A RÉGUA DA PODA ----------------
   ausentesDaPeca(ausentes, conhecidos, pacote) → a lista de ausentes da
   poda de hoje (osAusentes), mais todo nome conhecido que não está na cena
   fechada — «fora desta cena». Quem está na lista nunca é ausente. */
export function ausentesDaPeca(ausentes, conhecidos, pacote) {
  const p = obj(pacote);
  const base = arr(ausentes).filter((a) => obj(a) && typeof a.nome === "string");
  if (!p) return base;
  const podem = new Set(arr(p.podeCitar && p.podeCitar.quem).map(sem));
  const ja = new Set(base.map((a) => sem(a.nome)));
  const out = base.filter((a) => !podem.has(sem(a.nome)));
  for (const n of arr(conhecidos)) {
    if (typeof n !== "string" || !n.trim() || podem.has(sem(n)) || ja.has(sem(n))) continue;
    ja.add(sem(n));
    out.push({ nome: n, onde: "fora desta cena", morto: false });
  }
  return out;
}

/* foraDaCenaNaProsa(texto, conhecidos, pacote) → os nomes conhecidos que a
   prosa cita e a cena fechada não tem — a medida da verdade (fase B). */
export function foraDaCenaNaProsa(texto, conhecidos, pacote) {
  const p = obj(pacote);
  const t = sem(texto);
  if (!p || !t) return [];
  const podem = new Set(arr(p.podeCitar && p.podeCitar.quem).map(sem));
  return [...new Set(arr(conhecidos).filter((n) => typeof n === "string" && n.trim().length >= 3 && !podem.has(sem(n)) && new RegExp(`\\b${sem(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t)))];
}

/* ---------------- A CHEGADA NÃO FECHA A ETAPA ----------------
   semAChegadaDaPeca(estado, { mundo }) → o livro de factos sem a marca
   «esteve» que o Cronista escreveu ao chegar aos lugares que a etapa da
   peça pede (o risco 1 da fase A: «Etapa 1 ✓ ao chegar», a sessão de
   15/11), ou null quando não há nada a tirar. Na etapa com peça, estar lá
   é a cena; o facto escreve-o a solução (resolver). Quem chama só o usa no
   turno em que a peça não escreveu. */
export function semAChegadaDaPeca(estado, opcoes) {
  try {
    const E = obj(estado) || {};
    const pe = aPecaEmJogo(E, { ligado: true, mundo: (obj(opcoes) || {}).mundo || null });
    if (!pe) return null;
    const F = questPorId(pe.registo.id);
    const etapa = F && F.etapas.find((e) => e.id === pe.peca.etapa);
    if (!etapa) return null;
    const ids = [];
    const junta = (c) => {
      if (!Array.isArray(c)) return;
      if (c[0] === "esteve" && typeof c[1] === "string") { const m = c[1].match(/^lugar:([a-z0-9_]+)$/); const p = m && obj(pe.registo.papeis[m[1]]); if (p && typeof p.id === "string" && p.id) ids.push(p.id); return; }
      for (const x of c.slice(1)) junta(x);
    };
    junta(etapa.conclui);
    const livro = obj(E.factos);
    if (!ids.length || !livro || !obj(livro.lugares)) return null;
    let mudou = false;
    const lugares = { ...livro.lugares };
    for (const id of ids) {
      if (obj(lugares[id]) && lugares[id].esteve) { const { esteve, ...resto } = lugares[id]; lugares[id] = resto; mudou = true; }
    }
    return mudou ? { ...livro, lugares } : null;
  } catch {
    return null;
  }
}
