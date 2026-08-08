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
const RX_BUFF = /bênção|bencao|inspir|grito|canção|cancao|hino|postura|escudo|barreira|proteç|protec|fúria|furia|abenç|abenc/i;
const RX_OFENSIVA = /dano|golpe|ataca|projétil|projetil|chama|fogo|gelo|raio|lâmina|lamina|flecha|tiro|explos|perfur|corte|drena|maldi|invest/i;

export const ehCuraDeGrupo = (h) => RX_CURA.test(`${h.nome || ""} ${h.descricao || ""}`);
export const ehBuff = (h) => !ehCuraDeGrupo(h) && RX_BUFF.test(`${h.nome || ""} ${h.descricao || ""}`);
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
     3. tem buff e a luta está começando → buff
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

  /* 3. buff logo no começo da luta (uma vez, não todo turno) */
  if (rodada <= 2) {
    const buff = habs.find((h) => ehBuff(h) && podePagar(h));
    if (buff && Math.random() < 0.7) return { tipo: "buff", habilidade: buff };
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
