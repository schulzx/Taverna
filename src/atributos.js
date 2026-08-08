/* ============================================================
   ATRIBUTOS (v9.6) — distribuição de pontos com custo crescente

   Antes: cada nível dava +1 num atributo à escolha, teto +5. Somando
   os 19 níveis de progressão dava para levar quase tudo ao máximo —
   escolher não custava nada, e a multiclasse não pedia nada do
   jogador. Um mago que pegasse habilidades de guerreiro batia igual,
   porque o dano de habilidade usava o MAIOR atributo da ficha.

   Agora atributo é MOEDA. Cada nível rende 2 pontos, e subir custa
   mais conforme o degrau: os primeiros pontos são baratos, o topo
   é caro. No nível 20 o herói terá 38 pontos — o suficiente para
   dois atributos excelentes e competência no resto, OU para uma
   distribuição larga e sem picos. Nunca para tudo.

   E o que amarra isso à multiclasse (o pedido original): cada
   habilidade usa o atributo-chave da CLASSE dela. Magia de mago
   escala com intelecto; golpe de guerreiro escala com força. Quem
   quiser ser mago-guerreiro precisa dos dois — e a conta de pontos
   torna isso uma escolha de verdade.
   ============================================================ */

import { ATRIBUTOS } from "./constantes.js";
import { CLASSES, classeDaHabilidade, ranksDoPersonagem, racaPorNome } from "./classes.js";

export { ATRIBUTOS };

/* ---------------- O CUSTO DE CADA DEGRAU ----------------
   Barato até +2 (todo mundo pode ser razoável em tudo), caro no topo
   (excelência se paga). É a mesma ideia do custo em pontos da árvore
   de talentos, e pelo mesmo motivo: sem escalada, não há escolha. */
export function custoDoDegrau(de) {
  const v = Math.max(0, Number(de) || 0);
  if (v <= 2) return 1;
  if (v <= 4) return 2;
  if (v <= 6) return 3;
  if (v <= 8) return 4;
  return 5;
}

/* Quanto custa, do zero, ter um atributo neste valor. */
export function custoAcumulado(valor) {
  let t = 0;
  for (let i = 0; i < Math.max(0, Number(valor) || 0); i++) t += custoDoDegrau(i);
  return t;
}

/* ---------------- QUANTOS PONTOS CADA NÍVEL DÁ ----------------
   Dois por nível, do 2 ao 20: 38 pontos no ápice mortal.

     dois atributos em +7 .......... 26 pontos
     um terceiro em +5 .............  7
     sobra .........................  5  (dois degraus baratos)

   Levar os SEIS a +5 custaria 42 — não cabe. É de propósito. */
export function pontosAtributoNoNivel(n) { return (Number(n) || 1) <= 1 ? 0 : 2; }
export function pontosAtributoTotais(nivel) {
  const nv = Math.max(1, Number(nivel) || 1);
  return (nv - 1) * 2;
}

/* ---------------- O TETO ----------------
   Cresce com o nível, e só com ele. Poder divino NÃO infla atributo:
   quem ascende ganha a Regra do Degrau (±2 por GD) e os milagres —
   somar as duas coisas quebraria toda a escala de rolagem. */
export const TETO_BASE = 5;
export function tetoAtributo(nivel) {
  const n = Math.max(1, Number(nivel) || 1);
  if (n >= 20) return 8;
  if (n >= 15) return 7;
  if (n >= 10) return 6;
  return TETO_BASE;
}

/* ---------------- A CONTA DA FICHA ---------------- */

/* O que o herói já tem custou quanto? Conta a partir da BASE de criação
   (bônus racial + os 6 pontos iniciais), que não sai deste orçamento. */
export function gastoEmAtributos(pers, base) {
  const at = (pers && pers.atributos) || {};
  const b = base || baseDeCriacao(pers);
  let t = 0;
  for (const a of ATRIBUTOS) {
    const atual = Math.max(0, Number(at[a.id]) || 0);
    const piso = Math.max(0, Math.min(atual, Number(b[a.id]) || 0));
    t += custoAcumulado(atual) - custoAcumulado(piso);
  }
  return t;
}

/* Reconstrói a base de criação de um save antigo. O bônus racial está
   gravado na raça; os 6 pontos da criação (máx. +3 cada) são atribuídos
   aos atributos mais altos da ficha — é a leitura mais generosa e
   determinística possível de uma escolha que ninguém anotou. */
export function baseDeCriacao(pers) {
  const base = Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 0]));
  if (!pers) return base;
  if (pers.baseAtributos && typeof pers.baseAtributos === "object") {
    for (const a of ATRIBUTOS) base[a.id] = Math.max(0, Number(pers.baseAtributos[a.id]) || 0);
    return base;
  }
  const racial = (racaPorNome(pers.raca) || {}).bonus || {};
  for (const a of ATRIBUTOS) base[a.id] = Math.max(0, Number(racial[a.id]) || 0);
  /* os 6 pontos de criação, do atributo mais alto para o mais baixo */
  const at = pers.atributos || {};
  const ordem = [...ATRIBUTOS].sort((x, y) => ((at[y.id] || 0) - (at[x.id] || 0)) || x.id.localeCompare(y.id));
  let restam = 6;
  for (let volta = 0; volta < 3 && restam > 0; volta++) {
    for (const a of ordem) {
      if (restam <= 0) break;
      const alvo = Math.max(0, Number(at[a.id]) || 0);
      const jaNaBase = base[a.id];
      const criadoAqui = jaNaBase - (Number(racial[a.id]) || 0);
      if (criadoAqui >= 3) continue;      // teto da criação
      if (jaNaBase >= alvo) continue;     // não passa do que a ficha tem
      base[a.id] = jaNaBase + 1;
      restam--;
    }
  }
  return base;
}

export function pontosAtributoDisponiveis(pers) {
  if (!pers) return 0;
  if (typeof pers.pontosAtr === "number") return Math.max(0, pers.pontosAtr);
  return Math.max(0, pontosAtributoTotais(pers.nivel) - gastoEmAtributos(pers));
}

/* Pode subir este atributo agora? Devolve o motivo quando não pode. */
export function podeSubirAtributo(pers, attrId) {
  if (!pers) return { pode: false, motivo: "sem ficha", custo: 0 };
  const atual = Math.max(0, Number((pers.atributos || {})[attrId]) || 0);
  const teto = tetoAtributo(pers.nivel);
  if (atual >= teto) return { pode: false, motivo: `no teto do seu nível (+${teto})`, custo: 0 };
  const custo = custoDoDegrau(atual);
  const tem = pontosAtributoDisponiveis(pers);
  if (tem < custo) return { pode: false, motivo: `custa ${custo} ponto${custo > 1 ? "s" : ""} (você tem ${tem})`, custo };
  return { pode: true, motivo: "", custo };
}

/* A tabela inteira, pronta para a interface. */
export function tabelaDeAtributos(pers) {
  const teto = tetoAtributo(pers && pers.nivel);
  const base = baseDeCriacao(pers);
  const chaves = atributosChave(pers);
  return ATRIBUTOS.map((a) => {
    const valor = Math.max(0, Number(((pers && pers.atributos) || {})[a.id]) || 0);
    const chk = podeSubirAtributo(pers, a.id);
    return {
      ...a, valor, teto, base: base[a.id] || 0,
      custoProximo: valor >= teto ? null : custoDoDegrau(valor),
      pode: chk.pode, motivo: chk.motivo,
      chave: chaves.some((c) => c.atributo === a.id),
      classesQueUsam: chaves.filter((c) => c.atributo === a.id).map((c) => c.classe),
    };
  });
}

/* Aplica o gasto. Devolve a ficha nova (ou a mesma, se não pôde). */
export function subirAtributo(pers, attrId) {
  const chk = podeSubirAtributo(pers, attrId);
  if (!chk.pode) return { pers, ok: false, motivo: chk.motivo, custo: 0 };
  const atual = Math.max(0, Number((pers.atributos || {})[attrId]) || 0);
  return {
    ok: true, motivo: "", custo: chk.custo, valor: atual + 1,
    pers: {
      ...pers,
      atributos: { ...(pers.atributos || {}), [attrId]: atual + 1 },
      pontosAtr: Math.max(0, pontosAtributoDisponiveis(pers) - chk.custo),
    },
  };
}

/* Devolve TUDO o que foi distribuído desde a criação — o respec de atributos.
   Anda junto com o respec de talentos: quem errou a build erra por inteiro. */
export function redistribuirAtributos(pers) {
  const base = baseDeCriacao(pers);
  return {
    ...pers,
    atributos: Object.fromEntries(ATRIBUTOS.map((a) => [a.id, base[a.id] || 0])),
    baseAtributos: base,
    pontosAtr: pontosAtributoTotais(pers && pers.nivel),
  };
}

/* ---------------- O ATRIBUTO DE CADA HABILIDADE ----------------
   É aqui que a multiclasse deixa de ser cosmética. A habilidade usa o
   atributo-chave da classe DELA, não o maior número da ficha. */
export function atributoDaClasse(classeNome) {
  const c = CLASSES.find((x) => x.nome === classeNome);
  return (c && c.atributoChave) || "forca";
}

export function atributoDaHabilidade(nomeHab, pers) {
  const cls = classeDaHabilidade(nomeHab);
  if (cls) return atributoDaClasse(cls);
  /* habilidade única, dádiva ou improviso: cai no atributo-chave da classe
     de origem do herói — não no melhor número dele */
  return atributoDaClasse((pers && pers.classe) || "");
}

/* O valor BRUTO do atributo que rege uma habilidade (sem proficiência —
   quem soma proficiência é atributoEfetivo, em regras-jogo). */
export function valorParaHabilidade(pers, hab) {
  const nome = typeof hab === "string" ? hab : (hab && hab.nome) || "";
  const id = atributoDaHabilidade(nome, pers);
  return Math.max(0, Number(((pers && pers.atributos) || {})[id]) || 0);
}

/* ---------------- SINERGIA DA BUILD ----------------
   Quais atributos a build DO JOGADOR pede, com base nas classes que ele
   abriu de fato. É o conselho que faltava: "você tem 10 degraus de mago e
   8 de guerreiro — intelecto e força são os seus". */
export function atributosChave(pers) {
  const ranks = ranksDoPersonagem(pers);
  const lista = Object.entries(ranks)
    .map(([classe, rank]) => ({ classe, rank, atributo: atributoDaClasse(classe) }))
    .sort((a, b) => b.rank - a.rank);
  if (!lista.length && pers && pers.classe) return [{ classe: pers.classe, rank: 0, atributo: atributoDaClasse(pers.classe) }];
  return lista;
}

export function sinergiaDaBuild(pers) {
  const chaves = atributosChave(pers);
  const at = (pers && pers.atributos) || {};
  const nomeDe = (id) => (ATRIBUTOS.find((a) => a.id === id) || {}).nome || id;
  const porAtributo = new Map();
  for (const c of chaves) {
    const cur = porAtributo.get(c.atributo) || { atributo: c.atributo, nome: nomeDe(c.atributo), classes: [], rank: 0 };
    cur.classes.push(c.classe);
    cur.rank = Math.max(cur.rank, c.rank);
    porAtributo.set(c.atributo, cur);
  }
  const linhas = [...porAtributo.values()]
    .map((x) => ({ ...x, valor: Math.max(0, Number(at[x.atributo]) || 0) }))
    .sort((a, b) => b.rank - a.rank);
  /* o alerta que importa: classe com estrada e atributo parado */
  const negligenciados = linhas.filter((x) => x.rank >= 3 && x.valor < Math.min(4, Math.ceil(x.rank / 2)));
  return { linhas, negligenciados };
}

export function conselhoDeBuild(pers) {
  const { linhas, negligenciados } = sinergiaDaBuild(pers);
  if (!linhas.length) return "";
  if (linhas.length === 1) {
    const x = linhas[0];
    return `Sua estrada é ${x.classes.join(" e ")} — ${x.nome} rege tudo o que você lança.`;
  }
  const partes = linhas.map((x) => `${x.nome} (${x.classes.join("/")}, ${x.rank} degrau${x.rank === 1 ? "" : "s"})`);
  const aviso = negligenciados.length
    ? ` Atenção: ${negligenciados.map((x) => `${x.nome} está em +${x.valor} e você tem ${x.rank} degraus de ${x.classes.join("/")}`).join("; ")} — essas habilidades estão saindo fracas.`
    : "";
  return `Multiclasse: ${partes.join(" · ")}. Cada habilidade escala com o atributo da classe dela.${aviso}`;
}

/* ---------------- MIGRAÇÃO ----------------
   Saves antigos vêm sem `pontosAtr` e com os atributos já distribuídos pelo
   sistema velho (+1 por nível). Congelamos a base de criação, calculamos o
   que aquilo teria custado na tabela nova e devolvemos o saldo. Ninguém
   perde ponto; quem gastou bem simplesmente não recebe troco. */
export function migrarAtributos(p) {
  if (!p) return p;
  if (p.atributosVersao >= 1 && typeof p.pontosAtr === "number") return p;
  const base = p.baseAtributos && typeof p.baseAtributos === "object" ? p.baseAtributos : baseDeCriacao(p);
  const gasto = gastoEmAtributos(p, base);
  const saldo = Math.max(0, pontosAtributoTotais(p.nivel) - gasto);
  return { ...p, baseAtributos: base, pontosAtr: saldo, atributosVersao: 1 };
}

/* ---------------- O QUE O MESTRE PRECISA SABER ---------------- */
export function resumoAtributosPrompt(pers) {
  if (!pers) return "";
  const at = pers.atributos || {};
  const linha = ATRIBUTOS.map((a) => `${a.nome} +${at[a.id] || 0}`).join(" · ");
  const conselho = conselhoDeBuild(pers);
  const pts = pontosAtributoDisponiveis(pers);
  return `ATRIBUTOS: ${linha}${pts ? ` (${pts} ponto${pts > 1 ? "s" : ""} por distribuir)` : ""}.${conselho ? ` ${conselho}` : ""}`;
}

export const ATRIBUTOS_PROMPT = `ATRIBUTOS E MULTICLASSE (v9.6 — números do sistema; você só usa como cor):
- Os seis atributos (Força, Destreza, Vigor, Intelecto, Presença, Percepção) são distribuídos pelo JOGADOR com pontos que o sistema concede por nível. Você nunca concede, retira nem sugere atributo — e nunca diz que o herói "ficou mais forte" como efeito de cena, porque isso é ficha.
- Cada habilidade escala com o atributo da CLASSE dela: magia de mago com Intelecto, golpe de guerreiro com Força, técnica de ladino com Destreza, milagre de clérigo com Presença. Um herói multiclasse com atributo baixo numa das metades vai errar e causar pouco dano naquela metade — isso é consequência da ficha, e a narração deve refleti-la com honestidade, não corrigi-la.
- Quando o envelope do sistema trouxer um resultado fraco de um herói poderoso, narre a fraqueza (a mão que treme no encantamento, a lâmina que não encontra a brecha). Nunca compense inventando êxito.`;
