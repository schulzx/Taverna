/* ============================================================
   A FILA DE CERIMÔNIAS (V9 · 16/11/2026) — formas.md §F6 (A Mesa do
   Mestre · as cerimônias), as tabelas CERIMONIAS e FILA_DE_CERIMONIAS.

   Por que existe. Na prova de 15/11 (analise-jogo.md P0-8) o «Partir»
   ficou morto três vezes: por baixo estavam a cerimônia da quest e a
   subida de nível, e nenhuma das duas se via. A causa tem duas metades:
     1. as cerimônias eram camadas de tela cheia (fixed, inset 0) que só
        saíam do estado «correndo» pelo animationend — e enquanto corriam
        estavam no primeiro quadro (opacidade 0) e comiam todo clique. Sem
        animação a correr (aba oculta, painel em segundo plano), nunca
        acabavam: um véu invisível por cima da mesa;
     2. a da quest podia voltar: a fila só recusava a repetida enquanto ela
        estava NA fila; depois de sair, a mesma chave entrava de novo.
   Esta é a máquina que a tela só desenha: uma de cada vez, cada uma uma vez,
   com teto de tempo, e a lei de quando a mesa para.

   Estados (F6): livre → naFila → emCena → (pedeEscolha) → pousa → livre.
   O estado é um objeto { fila, emCena, vistas } e nunca é mutado.

   Puro: sem React, sem relógio, sem acaso. Provado em
   testes/teste-fila-de-cerimonias.mjs.
   ============================================================ */

/* CERIMONIAS — a tabela que a fila lê (F6 §2). A ordem é a prioridade.
   `para`: a mesa fica inerte por baixo (o véu cobre e prende o foco).
   `teto`: ms até o último quadro (o toque salta para ele antes); a
   escolha, quando há, espera sem relógio. `fases`: [nome, de, ate] em ms. */
export const CERIMONIAS = Object.freeze({
  ordem: Object.freeze(["queda", "buscaFechada", "nivel", "despertar", "espolioLendario", "espolioRaro", "encruzilhada", "fogueira",
    "conquista", "espolioIncomum", "espolioComum", "etapa", "xp", "moedas"]),
  queda: { para: true, teto: 3000, pedeToque: true, veu: "queda", fases: [["escurece", 0, 1200]] },
  buscaFechada: { para: true, teto: 2400, pedeToque: false, veu: "leve", fases: [["veu", 0, 120], ["lacreDesce", 120, 440], ["assenta", 440, 560], ["notas", 560, 1400]] },
  nivel: { para: true, teto: 2800, pedeToque: true, veu: "palco", fases: [["carta", 0, 600], ["lacre", 600, 920]] },
  despertar: { para: true, teto: 3200, pedeToque: false, veu: "noite", fases: [["sobe", 0, 400], ["risca", 400, 1200], ["escreve", 1200, 2400]] },
  espolioLendario: { para: true, teto: 3600, pedeToque: true, veu: "noite", fases: [["sobe", 0, 900], ["vira", 900, 1600], ["lacre", 1600, 1920]] },
  espolioRaro: { para: true, teto: 2000, pedeToque: true, veu: "palco", fases: [["sobe", 0, 400], ["vira", 400, 820]] },
  encruzilhada: { para: true, teto: 1200, pedeToque: true, veu: "palco", fases: [["cartas", 0, 720]] },
  fogueira: { para: true, teto: 1400, pedeToque: true, veu: "palco", fases: [["luz", 0, 900], ["roda", 900, 1400]] },
  conquista: { para: false, teto: 1600, pedeToque: false, veu: null, fases: [["etiqueta", 0, 220], ["lacre", 220, 540], ["livro", 1600, 1960]] },
  espolioIncomum: { para: false, teto: 600, pedeToque: false, veu: null, fases: [["vira", 0, 420], ["bolsa", 420, 600]] },
  espolioComum: { para: false, teto: 600, pedeToque: false, veu: null, fases: [["vira", 0, 420], ["bolsa", 420, 600]] },
  etapa: { para: false, teto: 440, pedeToque: false, veu: null, fases: [["nota", 0, 220], ["lacre", 120, 440]] },
  xp: { para: false, teto: 900, pedeToque: false, veu: null, fases: [["nota", 0, 220], ["conta", 220, 900]] },
  moedas: { para: false, teto: 900, pedeToque: false, veu: null, fases: [["nota", 0, 220], ["conta", 220, 900]] },
});

/* FILA_DE_CERIMONIAS — as leis da máquina (F6 §2).
   `camada`: o z-index do palco, acima de tudo da mesa (o maior dela é 100).
   `pousa`: o silêncio entre uma e a próxima. `somam`: as que se fundem numa
   nota só. `teclas`: o que salta para o fim. `reduzido`: com menos
   movimento, um quadro só, que entra em 120 ms. `vistasGuardadas`: quantas
   chaves a fila lembra (a cerimônia que já passou nunca volta).
   `primeiraConquista`: a primeira conquista nunca antes do terceiro turno. */
export const FILA_DE_CERIMONIAS = Object.freeze({
  camada: 200,
  pousa: 240,
  somam: Object.freeze(["xp", "moedas"]),
  teclas: Object.freeze([" ", "Enter", "Escape"]),
  reduzido: Object.freeze({ entra: 120 }),
  vistasGuardadas: 200,
  primeiraConquista: 3,
  /* a linha da pena enquanto a mesa está parada — nenhum botão morto sem frase */
  frases: Object.freeze({
    emCena: "o Mestre está batendo o lacre · toque para seguir",
    escolha: "o Mestre espera a sua escolha",
    aSeguir: "a seguir: {nome}",
  }),
  /* o nome de cada uma na boca do Mestre («a seguir: nível novo») */
  nomes: Object.freeze({
    queda: "a queda", buscaFechada: "a busca fechada", nivel: "nível novo", despertar: "a arma que desperta",
    espolioLendario: "o espólio", espolioRaro: "o espólio", encruzilhada: "a encruzilhada", fogueira: "a fogueira",
    conquista: "um feito", espolioIncomum: "um achado", espolioComum: "um achado", etapa: "a etapa", xp: "a experiência", moedas: "as moedas",
  }),
});

/* VEU_DA_CERIMONIA — o alfa do véu da noite sobre a mesa (F6 §2) e a
   opacidade a que a página cai por baixo dele (a armadilha 1 do F6: sob 80 %
   de preto o pergaminho ainda se lê e briga com o palco). */
export const VEU_DA_CERIMONIA = Object.freeze({
  leve: 0.35, palco: 0.80, noite: 0.90, queda: 0.92, fim: 0.94,
  paginaPorBaixo: 0.30, paginaPorBaixoNoTelefone: 0.10,
});

/* ESTADOS_DA_PENA — a espera pela narração (F6 §2), em ms desde o envio. */
export const ESTADOS_DA_PENA = Object.freeze({
  traco: 46, /* o traço de tinta do «molha», em px */
  nota: 320, /* a largura da nota do «demora» */
  molha: { ate: 2000 },
  escreve: { ate: 8000 },
  demora: {
    frase: "O Mestre está demorando mais que o costume. A sua jogada e o dado estão guardados.",
    esperar: "Continuar esperando", tentar: "Tentar de novo",
  },
  falhou: {
    frase: "A pena falhou desta vez. Nada se perdeu: a sua frase e o dado continuam aqui.",
    tentar: "Tentar de novo", mudar: "Mudar a minha frase",
  },
});

const C = CERIMONIAS, F = FILA_DE_CERIMONIAS;
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
const arr = (x) => (Array.isArray(x) ? x : []);
const prio = (c) => C.ordem.indexOf(c.tipo);

/* a fila vazia — o estado `livre` */
export function filaVazia() {
  return { fila: [], emCena: null, vistas: [] };
}

/* a tabela de uma cerimônia (null para tipo que a fila não conhece) */
export function tabelaDe(c) {
  const t = obj(c) && typeof c.tipo === "string" && C.ordem.includes(c.tipo) ? C[c.tipo] : null;
  return t || null;
}

/* a cerimônia segura a mesa? (só as da tabela com `para`) */
export function paraAMesa(c) {
  const t = tabelaDe(c);
  return !!(t && t.para);
}

/* a chave de uma cerimônia: a que o App deu, ou tipo:texto */
function chaveDe(c) {
  return typeof c.chave === "string" && c.chave ? c.chave : c.tipo + ":" + String(c.id || "");
}

/* já passou, já está na fila ou em cena? Uma cerimônia aparece UMA vez. */
export function jaConhecida(st, chave) {
  const s = obj(st) || filaVazia();
  if (!chave) return false;
  return arr(s.vistas).includes(chave) || arr(s.fila).some((x) => x && x.chave === chave) || !!(s.emCena && s.emCena.chave === chave);
}

/* enfileirar(c) — entra pela prioridade da tabela; as iguais não se fundem,
   salvo `xp` e `moedas`, que somam `quanto` numa nota só. A que já passou
   (vistas) nunca volta. */
export function enfileirar(st, c) {
  const s = obj(st) || filaVazia();
  if (!tabelaDe(c)) return s;
  const nova = { ...c, chave: chaveDe(c) };
  if (F.somam.includes(nova.tipo)) {
    const i = arr(s.fila).findIndex((x) => x && x.tipo === nova.tipo);
    if (i >= 0) {
      const soma = (Number(s.fila[i].quanto) || 0) + (Number(nova.quanto) || 0);
      return { ...s, fila: s.fila.map((x, k) => (k === i ? { ...x, quanto: soma } : x)) };
    }
  }
  if (jaConhecida(s, nova.chave)) return s;
  const fila = [...arr(s.fila), nova].map((x, i) => ({ x, i })).sort((a, b) => prio(a.x) - prio(b.x) || a.i - b.i).map((o) => o.x);
  return { ...s, fila };
}

/* o silêncio (F6): sem luta aberta, sem dado em voo, sem reação aberta, sem
   texto por enviar, sem objeto aberto e sem o Mestre a escrever */
export function haSilencio(ctx) {
  const k = obj(ctx) || {};
  return !k.lutaAberta && !k.dadoEmVoo && !k.reacaoAberta && !k.textoPorEnviar && !k.objetoAberto && !k.carregando;
}

/* livre → emCena: a primeira da fila que pode entrar. As que param esperam o
   silêncio; as que não param só esperam a vez (nenhuma em cena). */
export function avancar(st, ctx) {
  const s = obj(st) || filaVazia();
  if (s.emCena) return s;
  const silencio = haSilencio(ctx);
  const k = obj(ctx) || {};
  const i = arr(s.fila).findIndex((c) => {
    if (!paraAMesa(c)) return !k.lutaAberta;
    return silencio;
  });
  if (i < 0) return s;
  return { ...s, emCena: s.fila[i], fila: s.fila.filter((_, j) => j !== i) };
}

/* pousa → livre: a que estava em cena vai para as vistas, e nunca volta */
export function pousar(st, chave) {
  const s = obj(st) || filaVazia();
  const ch = chave || (s.emCena && s.emCena.chave);
  if (!ch) return s;
  const vistas = [...arr(s.vistas).filter((v) => v !== ch), ch].slice(-F.vistasGuardadas);
  return {
    ...s,
    emCena: s.emCena && s.emCena.chave === ch ? null : s.emCena,
    fila: arr(s.fila).filter((x) => x && x.chave !== ch),
    vistas,
  };
}

/* o teto de uma cerimônia: com menos movimento, um quadro só (o último), que
   entra em `reduzido.entra` e fica até o toque */
export function tetoDe(c, opcoes) {
  const t = tabelaDe(c);
  if (!t) return 0;
  return obj(opcoes) && opcoes.reduzido ? F.reduzido.entra : t.teto;
}

/* a fase no tempo: o nome da fase em que `ms` cai, ou «fim» depois do teto
   (um toque leva direto ao fim — o salto nunca pula a escolha) */
export function faseNoTempo(c, ms) {
  const t = tabelaDe(c);
  if (!t) return "fim";
  const m = Math.max(0, Number(ms) || 0);
  if (m >= t.teto) return t.pedeToque ? "espera" : "fim";
  const f = [...t.fases].reverse().find(([, de]) => m >= de);
  return f ? f[0] : t.fases[0][0];
}

/* a tecla salta? (Espaço, Enter, Esc) — na escolha, Esc não fecha */
export function teclaSalta(tecla, pedeEscolha) {
  if (pedeEscolha && tecla === "Escape") return false;
  return F.teclas.includes(tecla);
}

/* o que a linha da pena diz enquanto a mesa está parada (null se não está) */
export function fraseDaEspera(st, opcoes) {
  const s = obj(st) || filaVazia();
  if (!s.emCena || !paraAMesa(s.emCena)) return null;
  const linha = obj(opcoes) && opcoes.pedeEscolha ? F.frases.escolha : F.frases.emCena;
  const prox = arr(s.fila)[0];
  const seguir = prox ? F.frases.aSeguir.replace("{nome}", F.nomes[prox.tipo] || "") : "";
  return seguir ? linha + " · " + seguir : linha;
}

/* a primeira conquista pode entrar neste turno? (nunca antes do terceiro) */
export function conquistaPodeEntrar(turno, jaHouve) {
  return !!jaHouve || (Number(turno) || 0) >= F.primeiraConquista;
}

/* ESTADOS_DA_PENA: o estado da espera — `falhou` ganha sempre; a primeira
   frase faz `escreve` antes dos 2 s; sem frase até 8 s, `demora` */
export function estadoDaPena(ms, opcoes) {
  const o = obj(opcoes) || {};
  if (o.falhou) return "falhou";
  const m = Math.max(0, Number(ms) || 0);
  if (o.frases > 0) return "escreve";
  if (m < ESTADOS_DA_PENA.molha.ate) return "molha";
  if (m < ESTADOS_DA_PENA.escreve.ate) return "escreve";
  return "demora";
}
