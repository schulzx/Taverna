/* ============================================================
   TRAÇOS DE ORIGEM (v9.44) — a raça que faz, e não só diz

   A varredura que originou este arquivo procurava uma coisa só:
   regra escrita sem código atrás. As raças eram o caso mais antigo
   e o mais visível. Cada uma das dezesseis anunciava um traço na
   tela de criação — "vantagem em testes de percepção", "reduz em 1
   todo dano de veneno e fogo", "ao chegar a 0 PV, fica com 1 PV" —
   e nenhuma delas era lida por nada. Só `bonus` (os pontos de
   atributo) chegava à ficha. O jogador escolhia entre dez promessas
   e recebia dez números iguais em roupas diferentes.

   Aqui os traços viram leitores puros sobre `efeito` (classes.js).
   O arquivo não importa React, não guarda estado e não decide nada
   sozinho: ele responde perguntas sobre uma ficha, como dadivas.js
   faz para as bênçãos épicas. É a mesma forma porque é o mesmo
   problema — bônus permanente de origem contra bônus permanente de
   ápice —, e duas soluções diferentes para a mesma pergunta seria
   uma a mais.

   O QUE SE GASTA MORA NA FICHA. Quatro traços não são passivos: o
   refazer do Humano, a sorte do Halfling, a firmeza do Meio-orc e a
   pele do Goliath. Recurso que se gasta precisa de contador E de um
   lugar que o zere — senão vale uma vez na vida ou vale sempre, e
   nenhum dos dois é o que está escrito. Os contadores ficam em
   `pers.tracoGastos`; quem os zera é `repousarTracos` (descanso) e
   `abrirCombateTracos` (início de luta).
   ============================================================ */

import { racaPorNome, RACAS, ORIGENS } from "./classes.js";
/* v9.274 (F1): a família `amortece` entra na mesma porta do golpe que os
   traços raciais, e por isso a tabela dela é lida AQUI. A seta aponta num
   sentido só e não fecha ciclo: o fecho de `efeitos.js` é combos → classes →
   subclasses/especializações/grimório, mais grimório e temporário, e nenhum
   deles importa `tracos.js`. A tabela ficou em `efeitos.js`, colada à irmã
   `ABSORCAO_DO_BUFF`, porque as duas respondem à MESMA pergunta (quanto vale
   o PM gasto numa defensiva) e separá-las por arquivo seria o convite para
   uma divergir da outra sem ninguém ver. */
import { efeitosDe, AMORTECIMENTO_DO_BUFF } from "./efeitos.js";

const NORM = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- A PORTA ----------------
   Ninguém lê `efeito` na mão. Toda pergunta passa por aqui, e é isso que
   permite mudar a codificação de um traço sem caçar leitores pelo App. */
export function origemDe(pers) {
  const nome = (pers && pers.raca) || "";
  const exata = racaPorNome(nome);
  if (exata) return exata;
  /* `racaPorNome` compara nome por nome, com acento. Save antigo, ficha
     editada à mão e godmode escrevem "Anao" — e um herói que perde o traço
     por causa de um til é pior do que uma busca a mais. */
  const alvo = NORM(nome);
  if (!alvo) return null;
  return [...RACAS, ...ORIGENS].find((r) => NORM(r.nome) === alvo) || null;
}
export function efeitoDe(pers) { const r = origemDe(pers); return (r && r.efeito) || {}; }
export function textoDoTraco(pers) { const r = origemDe(pers); return (r && r.traco) || ""; }

/* ---------------- OS PASSIVOS ---------------- */

/* Vantagem por atributo: o Elfo em Percepção, o Meio-elfo em Presença. */
export function vantagemDeTraco(pers, attrId) {
  if (!attrId) return false;
  const lista = efeitoDe(pers).vantagem;
  return Array.isArray(lista) && lista.some((a) => NORM(a) === NORM(attrId));
}

/* Vantagem contra o que é mental — Gnomo e Sintético. Vale para medo,
   encanto e domínio, e por isso não é a mesma coisa que vantagem em
   Intelecto: é uma resistência, não uma competência. */
export function vantagemMentalDeTraco(pers) { return !!efeitoDe(pers).vantagemMental; }

/* Imunidade a condição (Sintético: medo e encantamento). O id vem do
   catálogo de condicoes.js. */
export function imuneDeTraco(pers, condId) {
  const l = efeitoDe(pers).imune;
  if (!Array.isArray(l)) return false;
  const alvo = NORM(condId);
  return l.some((x) => NORM(x) === alvo);
}

export function resisteDeTraco(pers, tipo) {
  const l = efeitoDe(pers).resistencia;
  if (!Array.isArray(l)) return false;
  const alvo = NORM(tipo);
  return l.some((x) => NORM(x) === alvo);
}

export function reducaoDeTraco(pers, tipo) {
  const m = efeitoDe(pers).reduzDano;
  if (!m || typeof m !== "object") return 0;
  const alvo = NORM(tipo);
  for (const [k, v] of Object.entries(m)) if (NORM(k) === alvo) return Number(v) || 0;
  return 0;
}

export function iniciativaDeTraco(pers) { return Number(efeitoDe(pers).iniciativa) || 0; }
export function ignoraDificilPorTraco(pers) { return !!efeitoDe(pers).ignoraDificil; }
export function oficioDeTraco(pers) { return Number(efeitoDe(pers).oficio) || 0; }

/* O DOM: a habilidade que a origem entrega pronta (Sopro Ancestral,
   Chama Menor). Entra na ficha na criação e na migração, e daí em diante
   é uma habilidade como qualquer outra — mesmo PM, mesma recarga, mesmo
   resolvedor. Não existe caminho paralelo para ela. */
export function domDe(pers) {
  const d = efeitoDe(pers).dom;
  return d && d.nome ? { ...d } : null;
}
export function comDom(pers) {
  const d = domDe(pers);
  if (!d) return pers;
  const tem = (pers.habilidades || []).some((h) => NORM(typeof h === "string" ? h : h.nome) === NORM(d.nome));
  if (tem) return pers;
  return { ...pers, habilidades: [...(pers.habilidades || []), d] };
}

/* ---------------- O QUE SE GASTA ----------------
   `refazer` e `firme` voltam no descanso; `sorte` e `pedra` voltam a cada
   combate — e, fora da luta, também no descanso, senão um teste de perícia
   no meio do mato nunca teria direito à sorte do Halfling. */

const gastos = (pers) => (pers && pers.tracoGastos) || {};
const marcar = (pers, chave, valor) => ({ ...pers, tracoGastos: { ...gastos(pers), [chave]: valor } });

export function refazerDeTracoDisponivel(pers) {
  const tem = Number(efeitoDe(pers).refazer) || 0;
  if (!tem) return 0;
  return Math.max(0, tem - (Number(gastos(pers).refazer) || 0));
}
export function gastarRefazerDeTraco(pers) { return marcar(pers, "refazer", (Number(gastos(pers).refazer) || 0) + 1); }

export function sorteDisponivel(pers) { return !!efeitoDe(pers).sorteDoUm && !gastos(pers).sorte; }
export function gastarSorte(pers) { return marcar(pers, "sorte", true); }

export function pedraDisponivel(pers) { return !!efeitoDe(pers).pedra && !gastos(pers).pedra; }
export function gastarPedra(pers) { return marcar(pers, "pedra", true); }

/* A firmeza do Meio-orc é por descanso LONGO, e por isso guarda o dia em
   vez de um booleano — o mesmo formato do segundo fôlego das dádivas. */
export function firmeDisponivel(pers, dia) {
  if (!efeitoDe(pers).firme) return false;
  return Number(gastos(pers).firmeDia) !== Number(dia);
}
export function gastarFirme(pers, dia) { return marcar(pers, "firmeDia", Number(dia) || 0); }

export function repousarTracos(pers, { longo = false, dia = 0 } = {}) {
  const g = { ...gastos(pers) };
  delete g.refazer;
  delete g.sorte;
  delete g.pedra;
  if (longo) delete g.firmeDia;
  void dia;
  return { ...pers, tracoGastos: g };
}

export function abrirCombateTracos(pers) {
  const g = { ...gastos(pers) };
  delete g.sorte;
  delete g.pedra;
  return { ...pers, tracoGastos: g };
}

/* ---------------- O GOLPE QUE CHEGA ----------------
   Uma porta só para o dano que o herói recebe, na ordem que importa:
   primeiro a Pele de Pedra corta o golpe ao meio (é um gasto, e gastar
   sobre o número cheio rende mais), depois a resistência de origem corta
   de novo, depois o abafo comprado com PM (v9.274 · F1) e por fim a redução
   fixa do Anão tira o que sobrou. Devolve a ficha porque o gasto mora nela —
   quem chama tem de usar a que volta.

   ---------------- ONDE A FAMÍLIA `amortece` ENTRA (v9.274 · F1) ----------

   A FILA INTEIRA, E ESTA É A PRIMEIRA ESTAÇÃO DELA. No herói o dano passa
   por `amortecerDano` (origem) → `repartirDano` (invocação) → `passarPeloAbrigo`,
   e este último é abrigo → PV temporário → PV real → a porta da queda
   (`absorverDano`, efeitos.js). A família entra AQUI, na primeira estação,
   sobre o golpe cheio — antes do abrigo e antes do poço —, e é de propósito:
   quem reduz por PROPORÇÃO tem de morder o número cheio, senão o mesmo buff
   vale metade contra quem tem escudo e o dobro contra quem não tem; quem come
   um valor FIXO (o abrigo, o poço) morde o que sobrou, porque para ele a ordem
   não muda o total.

   E DENTRO DAQUI, DEPOIS DAS DUAS METADES E ANTES DA REDUÇÃO FIXA. Três
   razões, e as três são regressão se invertidas:
     (i) a redução FIXA continua a ser a ÚLTIMA — é a regra que este cabeçalho
         já escrevia antes de F1 existir, e proporção depois de subtração
         devolveria menos do que a tabela do Anão promete;
    (ii) a porta `d >= 4` da Pele de Pedra é avaliada sobre O MESMO NÚMERO QUE
         ELA VÊ HOJE. Se o abafo cortasse antes, um Goliath com o buff deixaria
         de gastar a Pele em golpes que hoje a gastam (um golpe de 4 viraria 3
         e a porta fecharia) — mudança de traço racial por causa de uma
         habilidade, e silenciosa;
   (iii) a Pele é um GASTO e o abafo não. Gastar rende mais sobre o número
         cheio; o que não se gasta pode esperar a sua vez sem perder nada.

   UM POR GOLPE, O MAIOR — a mesma lei de `absorverDano`. Dois abafos não
   somam: proporções que se multiplicam são o caminho curto para a defesa
   apagar um golpe inteiro, que é o que o teto da tabela existe para impedir.

   REGRESSÃO ZERO FORA DA FAMÍLIA. O único gatilho é um `amortece` numérico e
   positivo num efeito da ficha. Save antigo, ficha sem `efeitos`, `null`,
   `{}`, milagre, magia de duração e as outras quatro famílias defensivas não
   o têm — para todos eles esta estação não existe: mesmo `dano`, o MESMO
   objeto `pers` e `linhas` sem uma frase a mais. */
export function amortecerDano(pers, dano, tipo = "fisico") {
  let d = Math.max(0, Math.round(Number(dano) || 0));
  if (!d || !pers) return { dano: d, pers, linhas: [] };
  const linhas = [];
  let p = pers;

  if (pedraDisponivel(p) && d >= 4) {
    const antes = d;
    d = Math.max(1, Math.floor(d / 2));
    p = gastarPedra(p);
    linhas.push(`🪨 Pele de pedra — o golpe de ${antes} vira ${d}.`);
  }
  if (resisteDeTraco(p, tipo)) {
    const antes = d;
    d = Math.max(0, Math.floor(d / 2));
    linhas.push(`🜂 Resistência de origem a ${tipo} — ${antes} vira ${d}.`);
  }
  /* O ABAFO COMPRADO COM PM. `efeitosDe` é a leitura defensiva da casa —
     ficha sem lista, nula ou com buraco no meio sai dela como lista vazia, e
     o laço nem corre. A porcentagem vem do efeito (posta lá por `efeitoDeBuff`
     a partir de `AMORTECIMENTO_DO_BUFF`); o PISO vem da tabela, nunca daqui,
     porque "nada zera um golpe" é lei da casa e lei da casa não mora dentro
     de um `Math.max` solto. E a frase só nasce quando o número MUDOU: sem
     linha o chamador não escreve nada de volta (é `linhas.length` que manda
     no App), e uma frase que diz "13 vira 13" é o sistema a narrar
     contabilidade. */
  let abafo = 0, doAbafo = null;
  for (const ef of efeitosDe(p)) {
    const n = Math.max(0, Math.round(Number(ef.amortece) || 0));
    if (n > abafo) { abafo = n; doAbafo = ef; }
  }
  if (abafo > 0 && d > 0) {
    const antes = d;
    /* o `Math.min` no piso é o que garante que esta estação nunca AUMENTE um
       golpe: um piso maior que o golpe que chegou não pode levantá-lo */
    d = Math.max(Math.min(antes, AMORTECIMENTO_DO_BUFF.pisoDoGolpe), antes - Math.round((antes * abafo) / 100));
    if (d !== antes) linhas.push(`🌫 ${doAbafo.nome || "o abafo"} abafa o que chega — ${antes} vira ${d}.`);
  }
  const red = reducaoDeTraco(p, tipo);
  if (red > 0 && d > 0) {
    const antes = d;
    d = Math.max(0, d - red);
    if (d !== antes) linhas.push(`⛰ Resistência anã — ${antes} vira ${d}.`);
  }
  return { dano: d, pers: p, linhas };
}

/* ---------------- O QUE O MESTRE PRECISA SABER ----------------
   Só a frase do traço e o que dele já está gasto. O Mestre não aplica
   nada disto: ele narra o que o sistema fez. */
export function resumoTracosPrompt(pers) {
  const r = origemDe(pers);
  if (!r || !r.traco) return "";
  const e = efeitoDe(pers);
  const g = gastos(pers);
  const usados = [];
  if (e.refazer && g.refazer) usados.push("a segunda chance deste descanso já foi usada");
  if (e.sorteDoUm && g.sorte) usados.push("a sorte pequena já foi gasta");
  if (e.pedra && g.pedra) usados.push("a pele de pedra já foi gasta nesta luta");
  return `TRAÇO DE ORIGEM (${r.nome} — do sistema): ${r.traco}${usados.length ? ` Agora mesmo, ${usados.join(" e ")}.` : ""}`;
}

export const TRACOS_PROMPT = `TRAÇOS DE ORIGEM (v9.44 — o sistema aplica, você narra):
- A raça/origem do herói dá um traço com efeito MECÂNICO, e o sistema já o aplica sozinho: a vantagem no dado, a resistência ao elemento, a metade do golpe, o 1 PV que sobra. Você nunca concede nem recusa um traço, e nunca o transforma em teste.
- Quando o sistema anunciar que um traço agiu (pele de pedra, resistência de origem, fúria persistente, sorte pequena), narre o CORPO daquilo — o ombro que aguentou, o fogo que lambeu sem queimar, a mão que segurou o chão. Nunca repita o número nem cite "traço", "raça" ou "sistema".
- Traço que se gasta volta no descanso (ou na luta seguinte). Se já foi gasto, não faça a ficção devolvê-lo: o herói simplesmente não tem aquilo agora.`;
