/* ============================================================
   A RAID (v9.115) — quando o mundo inteiro é chamado

   "um evento global ou continental que chama 10 a 30 dependendo da
   dificuldade do monstro (que deve ser muuito forte já que é uma raid)
   … o chefe vem com horda, mas o sistema convoca os personagens
   considerados mais fortes ou disponíveis, podendo ou não estar na minha
   lista de amigos, e então na preparação eles se apresentam … na batalha
   o narrador narra todos os golpes e o player vê tudo … todos os membros
   da raid entram no grupo do player temporariamente até o fim da raid."

   ---------------- O QUE UM MMO TEM E ESTE JOGO NÃO ----------------

   Num MMO os dez a trinta são PESSOAS, e é isso que faz a raid funcionar:
   a dificuldade do encontro é a dificuldade de vinte estranhos agirem
   juntos. Aqui não há vinte estranhos — há um jogador. Copiar o formato
   sem essa peça daria uma masmorra grande com mais números, e o jogo já
   tem masmorra.

   O que substitui as pessoas é a única coisa que este jogo acumula e um
   MMO não: A CONTA DO QUE VOCÊ FEZ. Quem atende ao chamado sai do
   registro de gente, dos tratados, das facções que você fundou e da sua
   fama. Uma raid é a fatura da campanha inteira chegando de uma vez — e
   por isso ela também convoca DESCONHECIDO, gente que só veio porque
   ouviu falar. É a diferença entre "meus amigos vieram" e "o mundo veio".

   ---------------- O NÍVEL MÍNIMO ----------------

   Pedido explícito, e a razão dele é a mesma que fez o teto de
   compensação nascer em `dificuldade.js`: quem apanha é o herói. Um
   nível 5 no meio de trinta veteranos não é participante, é baixa. A
   trava vale para os DOIS lados — o herói só abre uma raid a partir do
   patamar, e ninguém abaixo dele é convocado, porque um mundo que
   chamasse aprendizes para morrer num chamado continental estaria
   dizendo que o chamado não é sério.

   ---------------- COMO TRINTA CABEM NUMA CENA ----------------

   O problema real de engenharia, e o que decide se isto é jogável: o
   jogador tem de VER tudo, e trinta turnos individuais por rodada
   afogariam a mesa e o orçamento do prompt.

   A saída é a que a guerra sempre usou — a rodada tem uma FRENTE e um
   DUELO, e são resolvidos por réguas diferentes:

     A FRENTE   a hoste contra a horda, resolvida EM MASSA por este
                arquivo. Sai um livro-razão da rodada: quantos da horda
                caíram, quem da hoste caiu, e os dois ou três feitos que
                merecem nome.

     O DUELO    o herói, no painel de combate de sempre, contra o chefe e
                contra o que furou a frente.

   O livro-razão é o que sobe ao Narrador: nomes e fatos, nunca números
   de sistema. É assim que "o narrador narra todos os golpes" cabe em
   três frases por rodada em vez de trinta.

   ---------------- A REGRA QUE PROTEGE O JOGADOR ----------------

   A hoste NÃO ganha a luta por ele. Ela segura a horda — e é só isso.
   O chefe é do herói: se a hoste pudesse derrubá-lo, a raid seria um
   filme a que o jogador assiste, e o pedido dizia o contrário ("o player
   vê tudo", não "o player olha"). A hoste morre, compra tempo e abre
   janelas; quem fecha é ele.
   ============================================================ */

import { PESO_AMEACA, multiplicadorDeGrupo } from "./orcamento.js";
import { nomePessoa } from "./nomes.js";
import { rngDe } from "./geografia.js";
import { poderDe, baseDoNivel, multiplicadorTipico, formatarPoder } from "./poder.js";

/* ---------------- A TRAVA ----------------
   Dez, e não quinze: é o patamar em que a ficha já tem subclasse, um
   companheiro e equipamento de verdade. Abaixo disso o herói não é
   participante de uma raid — é a primeira baixa dela. */
export const NIVEL_MINIMO = 10;

/* Quem é convocado tem de sustentar a frente sozinho por rodadas. A
   régua é a mesma do herói: quem não chegaria vivo ao fim não é
   chamado, porque um chamado que junta gente para morrer não é um
   chamado sério — é uma armadilha assinada pelo sistema. */
export const NIVEL_MINIMO_CONVOCADO = 8;

/* ---------------- OS PORTES ----------------
   O tamanho da hoste sai do tamanho da coisa, que é o que o pedido
   pediu: "10 a 30 dependendo da dificuldade do monstro". Os três degraus
   são de ALCANCE, não de número — o número é consequência. Uma ameaça
   que só a região sente convoca a região; uma que o continente sente
   convoca o continente.

   `acima` é quanto o chefe passa do herói. Nunca é zero e nunca é
   pequeno: uma raid cujo chefe fosse do tamanho do herói seria uma luta
   comum com plateia. Ele tem de ser inalcançável sozinho — é a definição
   da coisa. */
export const PORTES = [
  {
    id: "regional", nome: "Chamado da Região", icone: "🔥", alcance: "a região inteira",
    acima: 6, gd: 0, chama: [10, 15], horda: [45, 65], rodadas: 6,
    o: "uma coisa saiu do buraco dela e a região não tem como aguentar sozinha",
  },
  {
    id: "continental", nome: "Chamado Continental", icone: "🌩", alcance: "o continente",
    acima: 10, gd: 1, chama: [16, 23], horda: [75, 105], rodadas: 8,
    o: "o continente parou para olhar para o mesmo ponto do mapa",
  },
  {
    id: "cataclismo", nome: "Chamado do Fim", icone: "☄", alcance: "o mundo conhecido",
    acima: 15, gd: 2, chama: [24, 30], horda: [130, 175], rodadas: 10,
    o: "não sobrou lugar no mundo de onde não se veja o que está acontecendo",
  },
];
export function portePorId(id) { return PORTES.find((p) => p.id === id) || PORTES[0]; }

/* O porte que o herói alcança. Um nível 10 não abre um cataclismo: a
   escala do chamado acompanha a escala de quem responde a ele, senão o
   sistema convoca trinta veteranos para uma luta que o herói não tem
   como sequer presenciar. */
export function porteDoNivel(nivel) {
  const n = Number(nivel) || 1;
  if (n >= 22) return PORTES[2];
  if (n >= 15) return PORTES[1];
  return PORTES[0];
}

export function podeAbrirRaid(pers) {
  const n = Number(pers && pers.nivel) || 1;
  if (n < NIVEL_MINIMO) {
    return { pode: false, motivo: `chamados assim só chegam a quem já é nome no mundo — falta chegar ao nível ${NIVEL_MINIMO} (você está no ${n})` };
  }
  return { pode: true, motivo: "", porte: porteDoNivel(n) };
}

/* ---------------- OS PAPÉIS DE QUEM ATENDE ----------------
   O que cada um FAZ na frente, e é isto que o resolvedor lê. Sem papel,
   trinta convocados seriam trinta cópias com nomes diferentes, e o
   livro-razão da rodada não teria o que contar.

   `segura` é quanto da horda a pessoa aguenta por rodada; `abre` é a
   chance de ela produzir um feito com nome. Um curandeiro segura pouco e
   abre pouco, e mesmo assim é o mais valioso da lista — porque é ele que
   devolve os caídos, e a raid é uma guerra de atrito. */
export const PAPEIS = [
  { id: "linha", rotulo: "de linha", peso: 34, segura: 1.6, abre: 0.20, faz: "segura a frente e não sai do lugar" },
  { id: "lamina", rotulo: "lâmina", peso: 20, segura: 1.2, abre: 0.34, faz: "entra fundo e volta, e cada ida custa alguma coisa aos dois lados" },
  { id: "arco", rotulo: "de longe", peso: 14, segura: 0.9, abre: 0.30, faz: "trabalha de longe e escolhe o alvo com calma" },
  { id: "conjurador", rotulo: "conjurador", peso: 12, segura: 1.4, abre: 0.38, faz: "gasta o que tem de uma vez e depois é só um corpo a mais" },
  { id: "curandeiro", rotulo: "curandeiro", peso: 10, segura: 0.6, abre: 0.16, faz: "anda atrás da linha e devolve gente de pé" },
  { id: "escudo", rotulo: "escudo", peso: 10, segura: 2.2, abre: 0.14, faz: "põe o corpo onde ia doer em outro" },
];
export function papelPorId(id) { return PAPEIS.find((p) => p.id === id) || PAPEIS[0]; }

/* ---------------- DE ONDE CADA UM VEM ----------------
   A ORDEM É A DA DÍVIDA. Quem já anda com você vem primeiro porque já
   está aqui; depois quem te deve alguma coisa; depois quem jurou; e por
   último o desconhecido, que é o que transforma "meus amigos vieram" em
   "o mundo veio".

   E é por isso que uma raid diz sobre a campanha o que nenhuma outra
   cena diz: uma hoste com dezoito desconhecidos e dois amigos é o
   retrato de um herói famoso e sozinho, e o jogador lê isso na lista sem
   que ninguém precise escrever a frase. */
export const ORIGENS = [
  { id: "grupo", rotulo: "do seu grupo", prio: 1, porque: "já andava com você quando o chamado chegou" },
  { id: "laco", rotulo: "gente sua", prio: 2, porque: "veio por você, e não pelo chamado" },
  { id: "faccao", rotulo: "enviado", prio: 3, porque: "foi mandado por quem tem tratado com você" },
  { id: "fama", rotulo: "atendeu ao chamado", prio: 4, porque: "ouviu o seu nome e quis estar onde ele estivesse" },
  { id: "estranho", rotulo: "desconhecido", prio: 5, porque: "não veio por você: veio porque a coisa precisa cair" },
];
export function origemPorId(id) { return ORIGENS.find((o) => o.id === id) || ORIGENS[4]; }

const RELACOES_QUE_ATENDEM = ["aliado", "amigo", "romance", "conjuge", "familia"];

const limpar = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
const inteiro = (v, d = 0) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const entre = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));

function pesado(rnd, lista) {
  const total = lista.reduce((s, x) => s + Math.max(1, x.peso), 0);
  let corte = rnd() * total;
  return lista.find((x) => (corte -= Math.max(1, x.peso)) <= 0) || lista[0];
}

/* ---------------- QUANTOS ---------------- */
export function quantosChama(porte, rnd = Math.random) {
  const p = typeof porte === "string" ? portePorId(porte) : (porte || PORTES[0]);
  return entre(rnd, p.chama[0], p.chama[1]);
}

/* ---------------- O NÍVEL DE QUEM ATENDE ----------------
   Ninguém abaixo do piso, e ninguém muito acima do herói: uma hoste com
   gente de nível 30 num chamado de um herói de 12 resolveria a luta sem
   ele, e a regra que protege o jogador diz que isso não acontece. */
function nivelDoConvocado(rnd, nivelHeroi) {
  const alvo = Math.max(NIVEL_MINIMO_CONVOCADO, Math.round(nivelHeroi * 0.85));
  const teto = Math.max(alvo + 1, nivelHeroi + 2);
  return Math.max(NIVEL_MINIMO_CONVOCADO, entre(rnd, alvo, teto));
}

/* ---------------- A CONVOCAÇÃO ----------------
   Determinística pela semente da raid: a mesma raid chama a mesma gente
   se o save for recarregado, e o jogador nunca vê a hoste trocar de
   rosto por ter dado F5. */
export function convocar({
  semente = "raid", porte = "regional", pers = null, npcs = {}, faccoes = [],
  genero = "Fantasia medieval", lex = null,
} = {}) {
  const p = typeof porte === "string" ? portePorId(porte) : porte;
  const rnd = rngDe(`${semente}|convocacao`);
  const nivelHeroi = Math.max(1, inteiro((pers && pers.nivel), 1));
  const quantos = quantosChama(p, rnd);
  const hoste = [];
  const jaTem = new Set();
  const euMesmo = String((pers && pers.nome) || "").toLowerCase().trim();

  const por = (nome, origem, papelForcado = null, notas = "") => {
    const chave = String(nome || "").toLowerCase().trim();
    /* O HERÓI NÃO SE CONVOCA. Ele já está lá — e nesta casa a heroína já
       entrou uma vez no próprio elenco e envenenou três conselheiros. */
    if (!chave || jaTem.has(chave) || chave === euMesmo) return false;
    if (hoste.length >= quantos) return false;
    jaTem.add(chave);
    const papel = papelForcado ? papelPorId(papelForcado) : pesado(rnd, PAPEIS);
    const nivel = nivelDoConvocado(rnd, nivelHeroi);
    hoste.push({
      nome: limpar(nome, 40), papel: papel.id, origem,
      nivel, vida: nivel * 4, vidaMax: nivel * 4,
      caido: false, morto: false, feitos: 0,
      notas: limpar(notas, 60),
    });
    return true;
  };

  /* 1) quem já anda com você */
  for (const g of ((pers && pers.grupo) || [])) {
    if (g && g.nome) por(g.nome, "grupo", null, limpar(g.conceito || g.classe || "", 40));
  }

  /* 2) quem te deve alguma coisa — o registro de gente, por relação */
  const gente = Object.values(npcs || {}).filter(Boolean);
  const amigos = gente.filter((n) => RELACOES_QUE_ATENDEM.includes(String(n.relacao || "").toLowerCase()));
  for (const n of amigos) por(n.nome, "laco", null, limpar(n.papel || "", 40));

  /* 3) quem jurou — uma cabeça por facção aliada ou vassala, e o nome é
     da facção porque quem manda o enviado é ela, não uma pessoa */
  for (const f of (faccoes || [])) {
    const rel = String((f && f.relacao) || "").toLowerCase();
    const trat = String((f && f.tratado) || "").toLowerCase();
    if (!["aliado", "jogador"].includes(rel) && !["alianca", "vassalagem"].includes(trat)) continue;
    por(nomePessoa(genero, undefined, rnd, lex), "faccao", null, `enviado de ${limpar(f.nome, 30)}`);
  }

  /* 4) o resto: quem ouviu falar, e quem nem isso. A proporção é o
     retrato da campanha — se o registro está vazio, a hoste inteira é de
     desconhecidos, e é exatamente o que o mundo faria. */
  let volta = 0;
  while (hoste.length < quantos && volta++ < quantos * 4) {
    const origem = rnd() < 0.45 ? "fama" : "estranho";
    por(nomePessoa(genero, undefined, rnd, lex), origem);
  }

  return hoste;
}

/* ---------------- O QUE A HOSTE SEGURA ----------------
   A soma do que cada um de pé aguenta. É o número que decide se a frente
   dura mais uma rodada, e é ele que faz um curandeiro valer o lugar
   dele: quem devolve gente de pé aumenta esta soma na rodada seguinte. */
/* O PODER DE QUEM ATENDEU (v9.116). A hoste não tem ficha — tem nível e
   papel —, então o poder dela sai da curva típica daquele patamar, que é
   a mesma tradução que o conteúdo usa. É o número que aparece ao lado de
   cada nome na barra: sem ele, "atenderam 22" é uma contagem, e o jogador
   não tem como saber se atendeu gente ou multidão. */
export function poderDoConvocado(h) {
  const n = Math.max(1, Number(h && h.nivel) || NIVEL_MINIMO_CONVOCADO);
  return Math.round(baseDoNivel(n) * multiplicadorTipico(n));
}

export function poderDaHoste(hoste) {
  return (hoste || []).filter((h) => h && !h.morto).reduce((s, h) => s + poderDoConvocado(h), 0);
}

/* O chefe de uma raid tem de ser inalcançável sozinho, e agora dá para
   dizer isso com número em vez de com adjetivo. */
export function poderDoChefe(raid) {
  const n = Math.max(1, Number(raid && raid.nivelChefe) || 1);
  const gd = portePorId(raid && raid.porte).gd;
  return Math.round(baseDoNivel(n) * multiplicadorTipico(n) * Math.pow(2.1, gd));
}

export function forcaDaFrente(hoste) {
  return (hoste || [])
    .filter((h) => h && !h.caido && !h.morto)
    .reduce((s, h) => s + papelPorId(h.papel).segura * (1 + (Number(h.nivel) || 8) / 40), 0);
}

/* ---------------- A RAID ----------------
   A catraca: todo campo que uma rodada lê é normalizado aqui, e nenhum
   nasce de `||` no meio do resolvedor. */
export function garantirRaid(r) {
  const o = r && typeof r === "object" ? r : {};
  const p = portePorId(o.porte);
  return {
    id: limpar(o.id, 40) || "raid",
    nome: limpar(o.nome, 60) || "O Chamado",
    porte: p.id,
    chefe: limpar(o.chefe, 50) || "a coisa",
    nivelChefe: Math.max(1, inteiro(o.nivelChefe, 1)),
    semente: limpar(o.semente, 60) || "raid",
    hoste: Array.isArray(o.hoste) ? o.hoste.map((h) => ({
      nome: limpar(h && h.nome, 40), papel: papelPorId(h && h.papel).id,
      origem: origemPorId(h && h.origem).id,
      nivel: Math.max(1, inteiro(h && h.nivel, NIVEL_MINIMO_CONVOCADO)),
      vida: Math.max(0, inteiro(h && h.vida, 0)), vidaMax: Math.max(1, inteiro(h && h.vidaMax, 1)),
      caido: !!(h && h.caido), morto: !!(h && h.morto), feitos: Math.max(0, inteiro(h && h.feitos, 0)),
      notas: limpar(h && h.notas, 60),
    })).filter((h) => h.nome) : [],
    horda: Math.max(0, inteiro(o.horda, 0)),
    hordaInicial: Math.max(1, inteiro(o.hordaInicial, Math.max(1, inteiro(o.horda, 1)))),
    rodada: Math.max(0, inteiro(o.rodada, 0)),
    rodadasAteRomper: Math.max(1, inteiro(o.rodadasAteRomper, p.rodadas)),
    fase: ["convocando", "luta", "encerrada"].includes(o.fase) ? o.fase : "convocando",
    rompeu: !!o.rompeu,
    venceu: !!o.venceu,
    mortos: Array.isArray(o.mortos) ? o.mortos.map((x) => limpar(x, 40)).filter(Boolean) : [],
  };
}

export function abrirRaid({ semente = "raid", pers = null, npcs = {}, faccoes = [], genero = "Fantasia medieval", lex = null, chefe = "", nome = "" } = {}) {
  const chk = podeAbrirRaid(pers);
  if (!chk.pode) return { ok: false, motivo: chk.motivo };
  const p = chk.porte;
  const rnd = rngDe(`${semente}|raid`);
  const nivelHeroi = Math.max(1, inteiro(pers && pers.nivel, 1));
  const hoste = convocar({ semente, porte: p.id, pers, npcs, faccoes, genero, lex });
  const raid = garantirRaid({
    id: `raid_${semente}`.slice(0, 40),
    nome: nome || `${p.nome}: ${chefe || "a coisa"}`,
    porte: p.id,
    chefe: chefe || "a coisa",
    nivelChefe: nivelHeroi + p.acima,
    semente,
    hoste,
    horda: entre(rnd, p.horda[0], p.horda[1]),
    hordaInicial: 0,
    rodada: 0,
    rodadasAteRomper: p.rodadas,
    fase: "convocando",
  });
  raid.hordaInicial = raid.horda;
  return { ok: true, raid };
}

/* ---------------- A RODADA DA FRENTE ----------------
   Resolve a hoste contra a horda e devolve o livro-razão. Não toca no
   herói: o duelo é do painel de combate, e misturar as duas contas seria
   dar duas fontes de verdade ao mesmo PV.

   O atrito é dos dois lados e é DESIGUAL de propósito: a horda perde
   mais, a hoste perde menos e perde para sempre. É o que faz a raid ser
   uma conta de tempo — dá para segurar, não dá para segurar sempre. */
export function rodadaDaFrente(raidCru, { rnd = Math.random } = {}) {
  const raid = garantirRaid(raidCru);
  if (raid.fase !== "luta" || raid.venceu) return { raid, ledger: [] };

  const p = portePorId(raid.porte);
  const ledger = [];
  const dePe = raid.hoste.filter((h) => !h.caido && !h.morto);
  const frente = forcaDaFrente(raid.hoste);

  /* 1) a hoste derruba parte da horda — e a HORDA NÃO ACABA.

     A primeira versão tratava a horda como uma pilha a esvaziar, e a
     simulação de cem raids devolveu 100/100 com a horda zerada na
     primeira rodada: vinte veteranos matam trinta bichos depressa. Com a
     horda no chão a pressão ia a zero, ninguém caía, ninguém morria — e
     uma raid sem baixa é uma masmorra grande com plateia.

     O erro não era o número, era o MODELO. Horda de raid não é um monte
     que se conta: é maré. Enquanto a coisa respira, ela repõe o que
     perdeu, e é isso que faz a frente ser uma conta de tempo em vez de
     uma conta de aritmética — e é o que torna verdadeira, na mecânica e
     não só no prompt, a regra de que quem derruba a coisa é o herói.
     Limpar a horda não ganha nada, porque a horda volta.

     A ESCALA SAIU DA SIMULAÇÃO, não do gosto. Com a horda em 29 contra
     uma hoste de 22, o rastreio mostrou a linha abatendo quinze por
     rodada e a horda estacionando em seis — vinte veteranos matando o
     próprio número de inimigos por rodada, o que não é uma frente, é uma
     limpeza. A horda subiu para dezenas por porte e o abatimento caiu
     para um décimo da frente. O que se quer é que a horda fique quase
     estável enquanto a linha está inteira e VOLTE A CRESCER quando ela
     rareia — porque é assim que uma linha cede de verdade: devagar, e
     depois de uma vez só. */
  const abatidos = Math.min(raid.horda, Math.max(1, Math.round(frente * (0.12 + rnd() * 0.16))));
  raid.horda = Math.max(0, raid.horda - abatidos);
  const reforco = Math.round(raid.hordaInicial * 0.08);
  raid.horda = Math.min(raid.hordaInicial, raid.horda + reforco);

  /* 2) a horda cobra. A PRESSÃO é o que sobra dela dividido pelo que a
     frente aguenta: enquanto a frente dá conta, cai pouca gente; quando
     a horda passa do que a frente segura, o preço sobe depressa. E o
     multiplicador de grupo do orçamento entra aqui pela mesma razão que
     entra numa luta comum — número pesa mais que soma. */
  /* O SEIS QUE NÃO EXISTIA. A primeira versão dividia por `frente * 6` e
     a simulação devolveu ZERO mortos em cem raids: a pressão ficava em
     0,26 e nunca chegava a derrubar uma pessoa sequer. O seis era um
     amortecedor que eu pus por medo de a hoste evaporar, e ele apagou a
     única coisa que faz uma raid ser uma raid.

     A conta certa não precisa de amortecedor porque já tem dois: o peso
     da criatura comum, que é o mesmo do orçamento, e a força da frente
     no denominador — que sobe com o nível de quem está de pé e desaba
     quando eles caem. É isso que faz o atrito acelerar sozinho no fim,
     que é como uma linha cede de verdade. */
  const pressao = frente > 0 ? (raid.horda * multiplicadorDeGrupo(Math.min(12, raid.horda)) * PESO_AMEACA.comum) / frente : 99;
  /* A CONVERSÃO É SUAVE de propósito. Com `pressao * (0.6 + rnd())` o
     rastreio mostrou a hoste de 22 indo a zero em quatro rodadas de oito
     — o desabamento acontecia, mas cedo demais para o herói fazer alguma
     coisa com ele, e uma frente que cede na quarta rodada de oito nunca
     foi uma frente. Com o fator menor, a queda começa devagar e acelera
     sozinha pelo denominador: cada um que cai tira força da frente, e a
     frente menor deixa cair mais gente. */
  const quantosCaem = Math.min(dePe.length, Math.max(0, Math.round(pressao * (0.35 + rnd() * 0.55))));
  for (let i = 0; i < quantosCaem; i++) {
    const vivos = raid.hoste.filter((h) => !h.caido && !h.morto);
    if (!vivos.length) break;
    /* o escudo cai antes: é o que ele faz, e é por isso que ele está lá */
    const escudos = vivos.filter((h) => h.papel === "escudo");
    const alvo = escudos.length && rnd() < 0.5 ? escudos[Math.floor(rnd() * escudos.length)] : vivos[Math.floor(rnd() * vivos.length)];
    /* Cair não é morrer, e o curandeiro é a diferença entre as duas
       coisas — mas só a diferença, nunca a garantia.

       Na primeira versão um curandeiro de pé zerava a morte, e como uma
       hoste de vinte quase sempre tem um, a simulação devolveu 0,6 morto
       por raid: quase toda raid acabava sem uma única baixa. Um chamado
       continental em que ninguém morre não cobra nada de ninguém, e o
       peso inteiro da cena vinha de um número que não acontecia.

       Agora ele reduz de 55% para 18%. Continua sendo a peça mais
       valiosa da lista — e continua sendo verdade que a raid custa. */
    const temCura = raid.hoste.some((h) => h.papel === "curandeiro" && !h.caido && !h.morto && h.nome !== alvo.nome);
    alvo.caido = true;
    alvo.morto = rnd() < (temCura ? 0.18 : 0.55);
    if (alvo.morto) raid.mortos.push(alvo.nome);
    ledger.push({ tipo: alvo.morto ? "morreu" : "caiu", quem: alvo.nome, papel: alvo.papel });
  }

  /* 3) os curandeiros devolvem gente de pé — mas nunca os mortos */
  const curas = raid.hoste.filter((h) => h.papel === "curandeiro" && !h.caido && !h.morto).length;
  for (let i = 0; i < curas; i++) {
    const caidos = raid.hoste.filter((h) => h.caido && !h.morto);
    if (!caidos.length) break;
    const alvo = caidos[Math.floor(rnd() * caidos.length)];
    alvo.caido = false;
    ledger.push({ tipo: "levantou", quem: alvo.nome, papel: alvo.papel });
  }

  /* 4) O FEITO COM NOME. É a peça que faz trinta pessoas caberem em três
     frases: em vez de narrar todo mundo, o sistema escolhe quem fez a
     coisa que vale ser contada nesta rodada. Sem isto, a hoste seria um
     número que desce, e ninguém se importa com um número que desce. */
  const vivos = raid.hoste.filter((h) => !h.caido && !h.morto);
  if (vivos.length) {
    const candidato = vivos[Math.floor(rnd() * vivos.length)];
    if (rnd() < papelPorId(candidato.papel).abre) {
      candidato.feitos++;
      ledger.push({ tipo: "feito", quem: candidato.nome, papel: candidato.papel, faz: papelPorId(candidato.papel).faz });
    }
  }

  raid.rodada++;
  raid.horda = Math.max(0, raid.horda);
  /* 5) A FRENTE ROMPE quando não há mais quem a segure, ou quando o
     tempo dela acaba. Romper não é perder a raid: é o chefe e o resto da
     horda chegarem ao herói de uma vez, e a partir daí é só ele. */
  if (!vivos.length || raid.rodada >= raid.rodadasAteRomper) raid.rompeu = true;
  return { raid, ledger, abatidos, frente: Math.round(frente * 10) / 10, porte: p };
}

/* ---------------- O QUE SOBE AO NARRADOR ----------------
   Nomes e fatos, nunca número de sistema. O Narrador recebe o que
   ACONTECEU com quem, e escreve os golpes — que é a parte que nenhuma
   tabela faz e a única que ele não pode receber pronta. */
export function envelopeDaRodada(raid, ledger, { abatidos = 0 } = {}) {
  const r = garantirRaid(raid);
  /* AS PROIBIÇÕES VIAJAM SEMPRE. Na primeira versão elas moravam só no
     ramo com livro-razão, e o teste pegou: numa rodada em que ninguém
     caiu, o Narrador recebia um envelope sem nenhuma das travas — e é
     justamente a rodada calma que ele preencheria por conta própria.
     Regra que mora num só de dois caminhos vira bug, e esta casa já
     escreveu essa frase mais vezes do que gostaria. */
  const travas = `NÃO mate nem levante ninguém que não esteja nesta lista, NÃO faça a hoste ferir o chefe, e NÃO resolva a luta: quem derruba a coisa é o herói. Devolva a vez.`;
  if (!ledger || !ledger.length) {
    return `[RAID — RODADA ${r.rodada}, RESOLVIDA PELO SISTEMA] A frente segurou e ninguém caiu. ${abatidos ? "A horda perdeu gente e continua vindo." : "A horda mal sentiu."}
NARRE OS GOLPES: dois ou três que valha a pena ver, com nome de quem os deu. ${travas}`;
  }
  const diz = (l) => (
    l.tipo === "morreu" ? `${l.quem} (${papelPorId(l.papel).rotulo}) MORREU — e morre de verdade, não volta`
      : l.tipo === "caiu" ? `${l.quem} (${papelPorId(l.papel).rotulo}) caiu e está fora da linha`
        : l.tipo === "levantou" ? `${l.quem} voltou a ficar de pé`
          : `${l.quem} (${papelPorId(l.papel).rotulo}) fez a coisa da rodada: ${l.faz}`
  );
  return `[RAID — RODADA ${r.rodada}, RESOLVIDA PELO SISTEMA] Na frente, isto aconteceu e é FATO: ${ledger.map(diz).join("; ")}. Ainda estão de pé ${r.hoste.filter((h) => !h.caido && !h.morto).length} dos ${r.hoste.length} que atenderam ao chamado.
NARRE OS GOLPES: mostre cada uma dessas coisas acontecendo, com nome e com corpo — quem caiu, como caiu, quem viu. Três a cinco frases, e o herói continua onde estava. ${travas}`;
}

export function envelopeDaConvocacao(raid) {
  const r = garantirRaid(raid);
  const p = portePorId(r.porte);
  const porOrigem = ORIGENS.map((o) => {
    const meus = r.hoste.filter((h) => h.origem === o.id);
    return meus.length ? `${o.rotulo}: ${meus.map((h) => `${h.nome} (${papelPorId(h.papel).rotulo}${h.notas ? `, ${h.notas}` : ""})`).join(", ")}` : "";
  }).filter(Boolean).join(" · ");
  return `[RAID — CONVOCAÇÃO, DECIDIDA PELO SISTEMA] ${p.o}. ${r.chefe} está no fim disto — uma coisa que nenhum dos que vieram derruba sozinho, nem todos eles juntos —, e ${p.alcance} respondeu ao chamado. Quem veio, e é ESTA a lista, sem acrescentar e sem tirar: ${porOrigem}.
Esta é a PREPARAÇÃO, não a luta: encene a reunião. Cada um se APRESENTA — quem é, de onde veio, e por que atendeu —, e quem veio por mim fala diferente de quem nunca me viu. Não precisa dar fala a todos: dê a quatro ou cinco, e deixe o resto existir no movimento do acampamento. NÃO comece a batalha, NÃO mate ninguém aqui e NÃO deixe ninguém prometer que vai morrer. Termine com a coisa ainda longe e a vez comigo.`;
}

export function envelopeDoRompimento(raid) {
  const r = garantirRaid(raid);
  return `[RAID — A FRENTE ROMPEU, DECIDIDO PELO SISTEMA] A linha não segura mais: ${r.horda > 0 ? `o que sobrou da horda (${r.horda > 20 ? "muitos" : "alguns"}) e ` : ""}${r.chefe} passam por cima do que restou dela e chegam a mim. Narre a linha cedendo e a coisa vindo — sem me atingir ainda, e sem decidir nada. Daqui em diante é comigo.`;
}

export function fimDaRaid(raidCru, { venceu = false } = {}) {
  const raid = garantirRaid(raidCru);
  raid.fase = "encerrada";
  raid.venceu = !!venceu;
  const p = portePorId(raid.porte);
  const vivos = raid.hoste.filter((h) => !h.morto);
  return {
    raid,
    mortos: raid.mortos.slice(),
    sobreviveram: vivos.map((h) => h.nome),
    /* A FAMA NÃO É UM NÚMERO NOVO. Este jogo não tem "ganhar fama": ela é
       DERIVADA do que se fez, por `calcularFama`, e um número solto aqui
       seria uma segunda fonte para o mesmo valor — o defeito que a
       dificuldade acabou de evitar na tabela de força.

       A unidade que o contador entende é `lendariosDerrotados`, e é
       exatamente o que uma raid é: um lendário que caiu, valendo mais
       quanto maior o chamado. */
    lendarios: venceu ? 1 + PORTES.indexOf(p) : 0,
    xp: venceu ? 300 + raid.nivelChefe * 40 : 60,
  };
}

/* ---------------- O QUE ENTRA NO GRUPO ----------------
   "todos os membros da raid entram no grupo do player temporariamente
   até o fim da raid". `daRaid` é o que permite desfazer isso sem tocar
   em quem já estava — e sem ele, o fim da raid levaria embora os
   companheiros de verdade junto com os convocados. */
export function comitivaDaRaid(raid) {
  return garantirRaid(raid).hoste
    .filter((h) => h.origem !== "grupo")
    .map((h) => ({
      nome: h.nome, conceito: `${papelPorId(h.papel).rotulo}${h.notas ? ` · ${h.notas}` : ""}`,
      nivel: h.nivel, vida: h.vida, vidaMax: h.vidaMax,
      descricao: `Atendeu ao chamado — ${origemPorId(h.origem).porque}.`,
      habilidades: [], daRaid: true, semente: `raid|${h.nome}`,
    }));
}

export function tirarComitiva(grupo) {
  return (grupo || []).filter((g) => g && !g.daRaid);
}

export const RAID_PROMPT = `RAID (evento do SISTEMA — você nunca a abre, avança nem encerra): um chamado a que o mundo inteiro responde, contra uma coisa que ninguém derruba sozinho. Tudo chega por envelope [RAID — …]: quem atendeu, o que aconteceu em cada rodada da frente, e quando a linha cede.
- A LISTA DE QUEM VEIO É FECHADA. Não acrescente gente ao chamado, não mate quem o envelope não matou e não ressuscite quem ele matou — morte de raid é definitiva.
- A HOSTE SEGURA, O HERÓI DERRUBA. Ela compra tempo e morre comprando; quem fere a coisa é o herói. É terminantemente proibido fazer a hoste vencer a luta, acertar o golpe final ou salvar o herói de uma decisão ruim.
- NARRE OS GOLPES. Cada rodada chega com nomes e fatos: mostre-os acontecendo, com corpo e sem resumo. É a parte que só você faz.`;
