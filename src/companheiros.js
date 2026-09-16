/* ============================================================
   COMPANHEIROS (v9.2) — o grupo joga sozinho, pelo catálogo

   Até aqui o companheiro batia. Só isso: um ataque genérico por
   turno, sem classe, sem habilidade, sem poção. Um "curandeiro"
   no grupo era palavra na descrição — se o herói caísse, ele
   corria para socorrer e nada acontecia na ficha.

   Agora cada companheiro TEM uma classe (inferida do conceito e
   fixada na ficha), habilidades do mesmo catálogo que o jogador
   usa, e uma cabeça simples para decidir o turno: curar quem
   está caindo, dar buff, usar a magia certa ou bater. Tudo pelo
   sistema — o Mestre recebe o que aconteceu e narra.
   ============================================================ */

import { CLASSES, classePorNome, habilidadesDisponiveis } from "./classes.js";
import { comoConsumivel, melhorCuraPara, usarConsumivel } from "./pocoes.js";
import { aflicaoDe } from "./aflicoes.js";
import { guardaDe, guardasAtivas } from "./habilidades.js";
import { aplicacaoDoBuff } from "./combos.js";
import { ABSORCAO_DO_BUFF, efeitosDe } from "./efeitos.js";

/* ---------------- QUE CLASSE É ESSE COMPANHEIRO? ----------------
   Lido do conceito/descrição que a ficção já deu a ele. Determinístico:
   uma vez definido, fica gravado na ficha e não muda mais. */
const PISTAS = [
  [/cl[ée]rig|sacerdot|padre|freir|curandeir|medic|m[ée]dic|benz|monge branco/i, "Clérigo"],
  [/drui|xam[aã]|herbolári|herbolari|naturalist/i, "Druida"],
  [/bard|menestrel|trovador|cantor|contador de hist/i, "Bardo"],
  [/mag[oa]\b|feiticeir|arcanist|conjurador|erudito arcano|estudioso/i, "Mago"],
  [/bruxo|pactu|ocultist|necroman/i, "Bruxo"],
  [/invocador|domador|beast ?master/i, "Invocador"],
  [/ladr|ladin|gatun|assassin|espi[aã]|batedor furtiv|punguist/i, "Ladino"],
  [/ca[çc]ador|arqueir|besteir|rastrejad|rastread|patrulheir|montaria/i, "Caçador"],
  [/monge|artista marcial|pun[hn]o/i, "Monge"],
  [/engenheir|art[ií]fice|inventor|mec[aâ]nic|alquimist/i, "Engenheiro"],
  [/guerreir|soldad|cavaleir|mercen[aá]ri|b[aá]rbar|gladiador|espadachim|guarda|capit[aã]o|veteran/i, "Guerreiro"],
];

export function classeDeCompanheiro(comp) {
  if (comp && comp.classe && classePorNome(comp.classe)) return comp.classe;
  const texto = `${(comp && comp.conceito) || ""} ${(comp && comp.descricao) || ""} ${(comp && comp.papel) || ""}`;
  for (const [re, cls] of PISTAS) if (re.test(texto)) return cls;
  /* sem pista nenhuma: escolhe pelo nome, para não sair tudo Guerreiro */
  let h = 0;
  const n = String((comp && comp.nome) || "companheiro");
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return CLASSES[h % CLASSES.length].nome;
}

/* Completa a ficha do companheiro: classe, PM e habilidades do nível dele.
   Chamado quando ele entra no grupo e sempre que sobe de nível. */
export function garantirFichaCompanheiro(comp) {
  if (!comp || !comp.nome) return comp;
  const classe = classeDeCompanheiro(comp);
  const c = classePorNome(classe);
  const nivel = comp.nivel || 1;
  const manaMax = comp.manaMax != null ? comp.manaMax : Math.max(4, (c ? c.manaBase : 4) + Math.floor(nivel * 1.5));
  /* habilidades: as do catálogo até o nível dele, no máximo 6 (as mais altas
     primeiro — um companheiro de nível 8 luta como nível 8) */
  const jaTem = (comp.habilidades || []).filter((h) => h && (h.nome || typeof h === "string"));
  const nomes = new Set(jaTem.map((h) => (typeof h === "string" ? h : h.nome)));
  const doCatalogo = (c ? c.habilidades : []).filter((h) => h.nivel <= nivel);
  /* O repertório mistura o alto e o básico de propósito: só as mais fortes
     deixariam um clérigo de nível 6 SEM cura leve e sem opção barata quando
     o PM acabasse. Garante uma cura (se a classe tiver) e uma de custo baixo. */
  const escolhidas = [];
  const cura = doCatalogo.find((h) => RX_CURA.test(`${h.nome} ${h.descricao || ""}`));
  if (cura) escolhidas.push(cura);
  const barata = doCatalogo.filter((h) => (Number(h.custo) || 0) <= 3 && !escolhidas.includes(h)).sort((a, b) => b.nivel - a.nivel)[0];
  if (barata) escolhidas.push(barata);
  for (const h of [...doCatalogo].sort((a, b) => b.nivel - a.nivel)) {
    if (escolhidas.length >= 6) break;
    if (!escolhidas.includes(h)) escolhidas.push(h);
  }
  const habilidades = [
    ...jaTem.map((h) => (typeof h === "string" ? { nome: h, custo: 2, tipo: "ataque", descricao: "" } : h)),
    ...escolhidas.filter((h) => !nomes.has(h.nome)).map((h) => ({ nome: h.nome, custo: h.custo, tipo: h.tipo, descricao: h.descricao, nivel: h.nivel })),
  ].slice(0, 8);
  return {
    ...comp,
    classe,
    subclasse: comp.subclasse || "",
    manaMax,
    mana: comp.mana != null ? Math.min(comp.mana, manaMax) : manaMax,
    habilidades,
  };
}

/* ---------------- QUE HABILIDADE É O QUÊ ---------------- */
const RX_CURA = /cura|restaur|regenera|sarar|bálsamo|balsamo|canção curativa|cancao curativa|luz da vida|toque restaurador/i;
/* O `RX_BUFF` ERA UM REGEX COM DOIS VOCABULÁRIOS DENTRO, e em v9.232 ele
   fica escrito como os dois que sempre foi. O conjunto que ele reconhece
   NÃO muda: `RX_APOIO` e `RX_ABRIGO` somados são, palavra por palavra, o
   `RX_BUFF` de antes. O que muda é que agora dá para perguntar POR QUAL
   METADE uma habilidade entrou — e é essa pergunta que o piloto precisava
   fazer e não sabia.
   ABRIGO é a metade que já tem tabela: quem casa por "escudo", "barreira"
   ou "proteção" passa por `APLICACAO_DO_BUFF` (combos.js) antes de contar.
   APOIO é a metade que nenhuma tabela descreve — e é a única que continua
   sendo palpite. */
const RX_APOIO = /bênção|bencao|inspir|grito|canção|cancao|hino|postura|fúria|furia|abenç|abenc/i;
const RX_ABRIGO = /escudo|barreira|proteç|protec/i;
const RX_OFENSIVA = /dano|golpe|ataca|projétil|projetil|chama|fogo|gelo|raio|lâmina|lamina|flecha|tiro|explos|perfur|corte|drena|maldi|invest/i;

export const ehCuraDeGrupo = (h) => RX_CURA.test(`${h.nome || ""} ${h.descricao || ""}`);

/* QUEM TEM TABELA NÃO ADIVINHA (v9.232).
   `GUARDAS` (habilidades.js) tem 9 entradas e `guardaDe` decide por ela.
   O piloto adivinhava por nome — e nenhum dos 9 nomes casava com `RX_BUFF`,
   de modo que companheiro e duelista NUNCA erguiam guarda: a família
   defensiva inteira era promessa que só o herói de carne cumpria. Agora ele
   PERGUNTA. E a pergunta tem nome próprio porque quem decide guarda é a
   tabela, em um lugar só: uma guarda nova amanhã nasce visível ao piloto,
   sem ninguém lembrar de acrescentar palavra a regex nenhum. */
export const ehGuarda = (h) => !!guardaDe(h);

/* TRÊS COISAS, NESTA ORDEM — é a lição da etapa inteira.

   (1) A GUARDA SAI DA TABELA, SEMPRE. `GUARDAS` descreve nove habilidades
   com mecânica própria: prazo por rodada, soma à defesa (ou desvantagem, ou
   o golpe errando). Guarda não é buff, e quem a tratar como buff inventa o
   que ela faz. Por isso `ehGuarda` vem antes de qualquer regex.

   (2) "ESCUDO/BARREIRA/PROTEÇÃO" APARECE DOS DOIS LADOS DA BRIGA, e quem
   desempata é a tabela de P1 (`APLICACAO_DO_BUFF`, com o veto do golpe
   disfarçado dentro), nunca o regex. É ela que separa "Escudo Arcano" de
   "Tiro Perfurante" (que ATRAVESSA escudo), "Punho de Pedra" e "Linha da
   Lâmina" (que RACHAM escudo) e "Dissipar Magia" (que DESFAZ a barreira do
   outro) — quatro habilidades que o piloto chamava de apoio e são golpe.

   (3) O VOCABULÁRIO DE APOIO — bênção, inspiração, grito, canção, hino,
   postura, fúria — é o único pedaço que nenhuma tabela descreve: buff de
   número puro, sem mecânica própria em lugar nenhum da casa. Por isso é o
   único que continua sendo palpite, e por isso o regex sobrevive encolhido
   em vez de morrer.

   E POR QUE `aplicacaoDoBuff` AMPLIA UMA FAMÍLIA SÓ (v9.233). P2 mediu a
   ampliação INTEIRA — o piloto enxergando as 64 defensivas de P1 — e a catraca
   reprovou: `ehBuff` 33 → 75, `sombra` de 60,2% para 32,9% (piso 35), amplitude
   15,8 → 25,7 pts (teto 20), com +150 linhas de abrigo TODAS inertes. A causa
   não era o tamanho da ampliação: era a FORÇA ZERO. Turno pago, nada comprado
   — e a catraca mede exatamente isso.

   O que mudou entre P2 e agora foi uma família, e só uma: `absorve` ganhou
   número (`ABSORCAO_DO_BUFF`, efeitos.js) e um leitor que o gasta
   (`absorverDano`). As outras quatro — amortece 8 · nao_cai 5 · intocado 18 ·
   protege 8, 39 habilidades — continuam com força zero, e ampliar para elas
   hoje seria repetir o fracasso de P2 em escala menor. Por isso o recorte é o
   número: das 42 que o regex nunca viu, entram as **12** da família que compra
   alguma coisa, e as 30 restantes ficam de fora até terem o que comprar.
   Cada uma delas é a sua própria etapa, e no dia dela esta linha cresce.

   E A SEGUNDA JÁ CHEGOU — mas o recorte AQUI não se mexeu (v9.274 · F1).
   `amortece` tem número (`AMORTECIMENTO_DO_BUFF`, efeitos.js) e um leitor que
   o cobra (`amortecerDano`, tracos.js): as suas 8 habilidades passaram a
   comprar alguma coisa, e sobram TRÊS famílias de força zero (nao_cai 5 ·
   intocado 18 · protege 8, 31 habilidades). Ampliar `ehAbrigo` para a família
   nova é a etapa SEGUINTE, não esta: a ordem que P2 pagou para descobrir é
   "a família cumpre primeiro; procurá-la vem depois", e quem liga o piloto
   tem de MEDIR a catraca no mesmo passo. Por isso esta linha continua a falar
   de uma família só, e o dia em que crescer será o dia em que alguém trouxer
   o número da medição junto.

   `sombra` é a prova de que o recorte está no lugar certo: quem o derrubou em
   P2 foi "Esquiva Ágil", e Esquiva Ágil é `intocado` — fora daqui. */
export const ehAbrigo = (h) =>
  !ehGuarda(h) && (aplicacaoDoBuff(h) || {}).id === ABSORCAO_DO_BUFF.familia;

export const ehBuff = (h) => {
  const t = `${h.nome || ""} ${h.descricao || ""}`;
  if (ehCuraDeGrupo(h) || ehGuarda(h)) return false;
  if (ehAbrigo(h)) return true;                      /* amplia: a que compra */
  if (RX_ABRIGO.test(t)) return !!aplicacaoDoBuff(h); /* filtra: o resto do abrigo */
  return RX_APOIO.test(t);
};

export const ehOfensiva = (h) => !ehCuraDeGrupo(h) && (h.tipo === "ataque" || RX_OFENSIVA.test(`${h.nome || ""} ${h.descricao || ""}`));

/* Quanto uma cura de companheiro devolve: escala com nível e custo, com dado. */
export function valorDaCura(comp, hab) {
  const base = 4 + (comp.nivel || 1) + (Number(hab.custo) || 2) * 2;
  return base + 1 + Math.floor(Math.random() * 6);
}

/* ---------------- A CABEÇA DO COMPANHEIRO ----------------
   Ordem de prioridade — a mesma que qualquer jogador seguiria:
     1. alguém caindo → cura (habilidade, ou poção da bolsa dele)
     2. ele mesmo muito ferido → poção
     3. a luta está começando → apoio: a guarda, senão o abrigo, senão o buff
     4. tem habilidade ofensiva e mana → usa
     5. bate com a arma
   Devolve a INTENÇÃO; quem aplica é o motor de combate. */
export function decidirAcaoCompanheiro(comp, { aliados = [], inimigos = [], jogador = null, rodada = 1 }) {
  const habs = (comp.habilidades || []).filter((h) => h && h.nome);
  const mana = comp.mana != null ? comp.mana : 0;
  const podePagar = (h) => (Number(h.custo) || 0) <= mana;

  /* 1. quem está pior? (inclui o herói) */
  const feridos = [...(jogador ? [jogador] : []), ...aliados]
    .filter((a) => a && (a.vida || 0) >= 0 && (a.vidaMax || 0) > 0)
    .map((a) => ({ a, frac: (a.vida || 0) / (a.vidaMax || 1) }))
    .sort((x, y) => x.frac - y.frac);
  const pior = feridos[0];
  const alguemCaindo = pior && (pior.frac <= 0.35 || (pior.a.vida || 0) <= 0 || pior.a.morrendo);

  if (alguemCaindo) {
    const cura = habs.find((h) => ehCuraDeGrupo(h) && podePagar(h));
    if (cura) return { tipo: "cura", habilidade: cura, alvo: pior.a.nome };
    const pocao = melhorCuraPara(pior.a, comp.inventario || []);
    if (pocao) return { tipo: "pocao", item: pocao.raw, consumivel: pocao.c, alvo: pior.a.nome };
  }

  /* 2. ele mesmo em apuros e com poção na própria bolsa */
  if ((comp.vida || 0) / (comp.vidaMax || 1) <= 0.4) {
    const pocao = melhorCuraPara(comp, comp.inventario || []);
    if (pocao) return { tipo: "pocao", item: pocao.raw, consumivel: pocao.c, alvo: comp.nome };
  }

  const inimigosVivos = (inimigos || []).filter((e) => !e.derrotado && (e.vida || 0) > 0);
  if (!inimigosVivos.length) return { tipo: "guarda" };

  /* 3. apoio logo no começo da luta (uma vez, não todo turno).
     TRÊS DEGRAUS, E A ORDEM É UMA REGRA SÓ: o que o protege vem antes do que
     o levanta. P2 escreveu a primeira metade disso (a guarda antes do buff);
     a segunda metade só pôde ser escrita quando o abrigo passou a valer algo.

     (a) A GUARDA. Ela é a que muda se o companheiro sobrevive, e é a que
     ninguém erguia. Mas só a que ainda NÃO está de pé — `erguerGuarda` recusa
     a repetida, e o piloto que escolhesse uma dessas pagaria o turno por uma
     linha de "essa guarda já está de pé". Quem sabe o que está de pé é
     `guardasAtivas`, o mesmo leitor que a defesa usa.

     (b) O ABRIGO (v9.233). `ehBuff` passou a enxergar a família `absorve`, e
     enxergar não basta: quem tem as duas coisas na ficha escolhia a PRIMEIRA
     da lista, e a ordem da lista é acidente de catálogo. Na arena isso decidia
     de verdade — o Remendo e o Voto carregam Bênção e Escudo da Fé, sempre
     pegavam a Bênção, e nunca erguiam o escudo que a ficha promete. Note que
     o abrigo sai daqui como `tipo: "buff"`: ele É um buff, do jeito que
     `efeitoDeBuff` já o cria, com `absorve` dentro. Nenhuma fiação nova.

     (c) O BUFF de número puro, que é o que sobra.

     E O ABRIGO DE PÉ NÃO SE RE-FIRMA, pelo mesmo motivo que a guarda de pé
     não se re-ergue no degrau (a): o abrigo é de UMA batida e `empilhar` casa
     pelo nome, então re-firmá-lo enquanto ele está inteiro o substitui por um
     idêntico — mesmo número, mesma frase. (O efeito gasto não fica na ficha:
     `absorverDano` o retira ao quebrar, e aí ele volta a ser escolhível — é
     assim que o companheiro ergue o segundo escudo depois de perder o
     primeiro.) Isto vale só para a família que tem número; o buff comum
     re-firmado é a metade que continua sendo item aberto da pauta.

     O QUE SE PERDE E O QUE SE GANHA, os dois medidos — porque re-firmar não
     compra ZERO, e dizer que compra seria escrever uma lei mais forte do que
     ela é. O que ele compra é SÓ A RENOVAÇÃO DO PRAZO, e isso tem valor onde
     o escudo consegue sobreviver à rodada: em Uma Vida, 82 dos 278 turnos de
     apoio de uma amostra de 200 combates deixam de renovar o escudo, e a
     conta fecha em 6 PV de grupo — 0,02%, ruído. Do outro lado, o que o
     degrau devolve à mesa: na arena o turno da rodada 2 volta a comprar
     golpe (os golpes com bônus de dano na mesa dos 28 pares vão de 42 para
     75) e `punho` ganha 1 pt de folga contra o piso da catraca na família
     `cc`. Renovação pequena e medida contra turno que volta a render: é essa
     a troca, e ela está escrita para ninguém precisar redescobri-la.

     UM PORTÃO SÓ, e isso continua de propósito: o sorteio decide se há turno
     de apoio, não QUAL apoio. Um segundo `Math.random()` mudaria o fluxo de
     sorte de toda a arena e o número de turnos de apoio junto — aqui só muda
     a escolha, nunca a quantidade. */
  if (rodada <= 2) {
    const dePe = new Set(guardasAtivas(comp).map((g) => g.id));
    const abrigada = new Set(efeitosDe(comp).filter((e) => (Number(e.absorve) || 0) > 0).map((e) => e.nome));
    const naoRepete = (h) => !(ehAbrigo(h) && abrigada.has(h.nome));
    const guarda = habs.find((h) => ehGuarda(h) && podePagar(h) && !dePe.has(guardaDe(h).id));
    const abrigo = guarda ? null : habs.find((h) => ehAbrigo(h) && podePagar(h) && naoRepete(h));
    const apoio = guarda || abrigo || habs.find((h) => ehBuff(h) && podePagar(h) && naoRepete(h));
    if (apoio && Math.random() < 0.7) return { tipo: guarda ? "guarda" : "buff", habilidade: apoio };
  }

  /* 4. habilidade ofensiva — a mais cara que ele pode pagar */
  const ofensivas = habs.filter((h) => ehOfensiva(h) && podePagar(h)).sort((a, b) => (b.custo || 0) - (a.custo || 0));
  if (ofensivas.length && Math.random() < 0.6) {
    const alvo = [...inimigosVivos].sort((a, b) => (a.vida || 0) - (b.vida || 0))[0];
    return { tipo: "habilidade", habilidade: ofensivas[0], alvoNome: alvo.nome };
  }

  /* 5. arma */
  const alvo = [...inimigosVivos].sort((a, b) => (a.vida || 0) - (b.vida || 0))[0];
  return { tipo: "ataque", alvoNome: alvo.nome };
}

/* Dano de uma habilidade ofensiva de companheiro (escala com custo e nível) */
export function danoDaHabilidadeComp(comp, hab) {
  const base = 3 + (comp.nivel || 1) + (Number(hab.custo) || 2) * 2;
  return base + 1 + Math.floor(Math.random() * 6);
}

/* Resumo para a ficha e para o prompt: quem é quem no grupo. */
export function resumoGrupoPrompt(grupo = []) {
  const g = (grupo || []).filter((c) => c && c.nome);
  if (!g.length) return "";
  const linhas = g.map((c) => {
    const habs = (c.habilidades || []).slice(0, 4).map((h) => (typeof h === "string" ? h : h.nome)).join(", ");
    return `${c.nome} (${c.classe || "aventureiro"} nv ${c.nivel || 1}, ${c.vida}/${c.vidaMax} PV${c.manaMax ? `, ${c.mana ?? 0}/${c.manaMax} PM` : ""})${habs ? ` — usa: ${habs}` : ""}`;
  });
  return `MEU GRUPO (o SISTEMA joga por eles: eles curam, dão buff e atacam sozinhos, com as habilidades abaixo; você narra o que o sistema decidiu e NUNCA inventa uma habilidade que não está aqui): ${linhas.join(" · ")}.`;
}

export const COMPANHEIROS_PROMPT = `COMPANHEIROS EM COMBATE (v9.2 — o sistema joga por eles):
- Cada companheiro tem CLASSE e habilidades do mesmo catálogo do herói. Em combate, o sistema decide e resolve o turno deles: curar quem está caindo, dar buff no começo da luta, usar magia ofensiva ou bater com a arma. Você recebe o resultado pronto no envelope de combate.
- NÃO invente habilidade, cura ou façanha de companheiro, e não decida por eles em combate. Fora de combate eles continuam seus: opinam, discordam, agem por conta — isso é todo seu.
- Se um companheiro curou alguém, o PV JÁ subiu; narre o gesto, não o número.`;
