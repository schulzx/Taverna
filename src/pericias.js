/* ============================================================
   PERÍCIAS (v9.15) — o que faz dois heróis iguais serem diferentes

   Até aqui a ficha tinha seis atributos e mais nada. Um Ladino e um
   Monge com a mesma Destreza rolavam Furtividade EXATAMENTE igual —
   e é aí que uma ficha de mesa deixa de ser uma pessoa e vira uma
   planilha. Numa mesa de verdade a identidade não vem do número
   bruto: vem do TREINO. "Eu sou o que abre fechaduras", "eu sou o
   que lê gente", "eu sou o que sabe de arcano". Duas frases que o
   sistema precisa saber dizer sozinho.

   Três camadas, e só três:

   1) TREINADA — soma o bônus de proficiência (cresce +2 → +6 com o
      nível, tabela do 5e que já mora em regras.js).
   2) ESPECIALISTA — dobra a proficiência. É a assinatura: o Ladino
      que não apenas sabe furtar, mas é O melhor nisso da região.
      Duas, no máximo, e só a partir do nível 6.
   3) PASSIVO — 10 + o bônus. Não se rola: é o que o herói percebe
      só por estar ali. Serve para o SISTEMA dizer ao Mestre o que
      ele nota ao entrar num lugar, em vez de o Mestre decidir isso
      por conta própria — a mesma lógica do resto da casa.

   E a regra que a mesa tem e o jogo não tinha: SUCESSO AUTOMÁTICO.
   Quando o bônus supera a dificuldade com folga, não se rola. Um
   nível 15 especialista em Atletismo não pode ter 20% de chance de
   cair de um muro; se o dado ainda decide, o herói nunca fica bom
   em nada — só fica com números maiores.
   ============================================================ */

import { bonusProficiencia } from "./regras.js";
import { ANTECEDENTES } from "./antecedentes.js";

/* ---------------- O CATÁLOGO ----------------
   Três por atributo, dezoito no total. O corte foi por UTILIDADE em
   cena, não por fidelidade a nenhum manual: cada uma responde a uma
   pergunta que o jogador de fato faz na mesa. */
export const PERICIAS = [
  /* FORÇA */
  { id: "atletismo", nome: "Atletismo", atributo: "forca", icone: "🧗", desc: "escalar, nadar, saltar, empurrar, segurar o que quer cair" },
  { id: "intimidacao", nome: "Intimidação", atributo: "forca", icone: "😠", desc: "impor pela ameaça, quebrar a coragem alheia, arrancar no grito" },
  { id: "arrombamento", nome: "Arrombamento", atributo: "forca", icone: "🚪", desc: "forçar porta, arrancar grade, abrir o que foi feito para não abrir" },
  /* DESTREZA */
  { id: "furtividade", nome: "Furtividade", atributo: "destreza", icone: "🌑", desc: "mover sem ser visto nem ouvido, sumir de vista, seguir alguém" },
  { id: "acrobacia", nome: "Acrobacia", atributo: "destreza", icone: "🤸", desc: "equilíbrio, queda controlada, passar pelo vão impossível" },
  { id: "prestidigitacao", nome: "Prestidigitação", atributo: "destreza", icone: "🖐", desc: "mãos leves: bater carteira, plantar objeto, gazua, truque de dedos" },
  /* VIGOR */
  { id: "fortitude", nome: "Fortitude", atributo: "vigor", icone: "🫁", desc: "aguentar veneno, frio, dor, sede, tortura e noites sem dormir" },
  { id: "sobrevivencia", nome: "Sobrevivência", atributo: "vigor", icone: "🏕", desc: "rastrear, caçar, achar água e abrigo, ler o céu, não se perder" },
  { id: "montaria", nome: "Montaria", atributo: "vigor", icone: "🐎", desc: "cavalgar, conduzir carroça, dominar besta assustada, pilotar o que se move" },
  /* INTELECTO */
  { id: "arcanismo", nome: "Arcanismo", atributo: "intelecto", icone: "✦", desc: "reconhecer magia, selo, ritual, criatura mágica e o preço de cada um" },
  { id: "saberes", nome: "Saberes", atributo: "intelecto", icone: "📚", desc: "história, linhagens, religião, natureza, leis — o que está nos livros" },
  { id: "investigacao", nome: "Investigação", atributo: "intelecto", icone: "🔎", desc: "deduzir do vestígio: quem esteve aqui, o que falta, onde está a mentira" },
  /* PRESENÇA */
  { id: "persuasao", nome: "Persuasão", atributo: "presenca", icone: "🤝", desc: "convencer de boa-fé, negociar, acalmar, conseguir o sim" },
  { id: "enganacao", nome: "Enganação", atributo: "presenca", icone: "🎭", desc: "mentir bem, disfarçar, blefar, fazer passar por outra coisa" },
  { id: "atuacao", nome: "Atuação", atributo: "presenca", icone: "🎻", desc: "cantar, contar, tocar, prender uma sala inteira pela apresentação" },
  /* PERCEPÇÃO */
  { id: "percepcao", nome: "Percepção", atributo: "percepcao", icone: "👁", desc: "notar o que a cena esconde: som, cheiro, o detalhe fora do lugar" },
  { id: "intuicao", nome: "Intuição", atributo: "percepcao", icone: "🫀", desc: "ler gente: quem mente, quem tem medo, o que não está sendo dito" },
  { id: "medicina", nome: "Medicina", atributo: "percepcao", icone: "🩺", desc: "estancar, diagnosticar, saber de que morreu, estabilizar quem cai" },
];

export function periciaPorId(id) { return PERICIAS.find((p) => p.id === id) || null; }
export function periciasDoAtributo(attrId) { return PERICIAS.filter((p) => p.atributo === attrId); }

/* ---------------- QUEM TREINA O QUÊ ----------------
   A classe abre um LEQUE e diz quantas escolhas cabem; o antecedente
   dá as suas de graça, porque o passado não se escolhe duas vezes.
   O leque é o que faz um Ladino parecer um Ladino sem que ninguém
   precise digitar nada. */
export const PERICIAS_DE_CLASSE = {
  "Guerreiro":  { escolhas: 2, pool: ["atletismo", "intimidacao", "arrombamento", "fortitude", "montaria", "percepcao", "sobrevivencia"] },
  "Bárbaro":    { escolhas: 2, pool: ["atletismo", "intimidacao", "arrombamento", "fortitude", "sobrevivencia", "percepcao"] },
  "Mago":       { escolhas: 2, pool: ["arcanismo", "saberes", "investigacao", "percepcao", "intuicao", "medicina"] },
  "Ladino":     { escolhas: 4, pool: ["furtividade", "acrobacia", "prestidigitacao", "investigacao", "enganacao", "persuasao", "percepcao", "intuicao", "atletismo", "arrombamento"] },
  "Clérigo":    { escolhas: 2, pool: ["saberes", "medicina", "persuasao", "intuicao", "arcanismo", "fortitude"] },
  "Caçador":    { escolhas: 3, pool: ["sobrevivencia", "percepcao", "furtividade", "atletismo", "montaria", "medicina", "investigacao"] },
  "Bardo":      { escolhas: 3, pool: ["atuacao", "persuasao", "enganacao", "intuicao", "saberes", "prestidigitacao", "acrobacia", "arcanismo"] },
  "Monge":      { escolhas: 2, pool: ["acrobacia", "atletismo", "furtividade", "fortitude", "intuicao", "saberes"] },
  "Druida":     { escolhas: 2, pool: ["sobrevivencia", "medicina", "arcanismo", "saberes", "percepcao", "fortitude"] },
  "Feiticeiro": { escolhas: 2, pool: ["arcanismo", "enganacao", "persuasao", "intimidacao", "intuicao", "saberes"] },
  "Bruxo":      { escolhas: 2, pool: ["arcanismo", "saberes", "enganacao", "intimidacao", "investigacao", "intuicao"] },
  "Engenheiro": { escolhas: 3, pool: ["investigacao", "saberes", "arcanismo", "prestidigitacao", "arrombamento", "montaria", "percepcao"] },
  "Invocador":  { escolhas: 2, pool: ["arcanismo", "saberes", "intuicao", "persuasao", "investigacao", "percepcao"] },
};
const PADRAO_CLASSE = { escolhas: 2, pool: PERICIAS.map((p) => p.id) };
export function lequeDaClasse(classe) { return PERICIAS_DE_CLASSE[classe] || PADRAO_CLASSE; }

/* O passado dá duas, sempre as mesmas — é o que ele foi. */
export const PERICIAS_DE_ANTECEDENTE = {
  orfao: ["furtividade", "intuicao"],
  soldado: ["atletismo", "intimidacao"],
  nobre_caido: ["persuasao", "saberes"],
  erudito: ["saberes", "investigacao"],
  ladrao: ["prestidigitacao", "furtividade"],
  acolito: ["saberes", "medicina"],
  pragado: ["fortitude", "medicina"],
  artista: ["atuacao", "enganacao"],
  cacador: ["sobrevivencia", "percepcao"],
  ferreiro: ["arrombamento", "fortitude"],
  ex_cultista: ["arcanismo", "enganacao"],
  naufrago: ["atletismo", "sobrevivencia"],
};
/* A ficha guarda o NOME do antecedente ("Órfão da Estrada"), não o id —
   é assim desde a criação. Aceita os dois para não obrigar migração de
   dado nenhum: quem já tem save continua com o que tem escrito lá. */
export function periciasDoAntecedente(ref) {
  if (!ref) return [];
  if (PERICIAS_DE_ANTECEDENTE[ref]) return PERICIAS_DE_ANTECEDENTE[ref];
  const alvo = String(ref).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const a = ANTECEDENTES.find((x) => x.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") === alvo);
  return (a && PERICIAS_DE_ANTECEDENTE[a.id]) || [];
}

/* ---------------- A FICHA ----------------
   Formato guardado no personagem: { treinadas: [id], especialistas: [id] }.
   Nada de objeto por perícia — duas listas bastam e o save fica magro. */
export function garantirPericias(pers) {
  const p = (pers && pers.pericias) || {};
  const val = (l) => [...new Set((Array.isArray(l) ? l : []).filter((x) => periciaPorId(x)))];
  const treinadas = val(p.treinadas);
  /* especialista sem treino não existe: a segunda camada assenta na primeira */
  const especialistas = val(p.especialistas).filter((x) => treinadas.includes(x));
  return { treinadas, especialistas };
}

export function ehTreinada(pers, id) { return garantirPericias(pers).treinadas.includes(id); }
export function ehEspecialista(pers, id) { return garantirPericias(pers).especialistas.includes(id); }

/* Quantas o herói PODE ter, pelo que ele é. */
export function limiteTreinadas(pers) {
  const leque = lequeDaClasse(pers && pers.classe);
  const doPassado = periciasDoAntecedente(pers && pers.antecedente).length;
  /* multiclasse: cada classe extra abre UMA perícia a mais, não o leque inteiro */
  const extras = Math.max(0, ((pers && pers.classesExtras) || []).length);
  return leque.escolhas + doPassado + extras;
}

/* Especialista abre no 6 e no 12 — duas no total, e nunca antes de o
   herói ter história o bastante para justificar a palavra. */
export const NIVEIS_ESPECIALISTA = [6, 12];
export function limiteEspecialistas(nivel) {
  return NIVEIS_ESPECIALISTA.filter((n) => (nivel || 1) >= n).length;
}

/* O que a classe + o passado dão de graça. Serve para a criação e,
   principalmente, para a MIGRAÇÃO: nenhum save antigo pode acordar
   sem perícia nenhuma só porque o sistema nasceu depois dele. */
export function periciasIniciais(pers) {
  const doPassado = periciasDoAntecedente(pers && pers.antecedente);
  const leque = lequeDaClasse(pers && pers.classe);
  const treinadas = [...doPassado];
  for (const id of leque.pool) {
    if (treinadas.length >= doPassado.length + leque.escolhas) break;
    if (!treinadas.includes(id)) treinadas.push(id);
  }
  return { treinadas, especialistas: [] };
}

/* ---------------- O BÔNUS ----------------
   `modAtributo` vem de fora (atributoEfetivo já soma equipamento,
   efeito e a proficiência do atributo-chave da classe). Aqui só entra
   o que é da perícia. */
export function bonusDePericia(pers, id, modAtributo) {
  const per = periciaPorId(id);
  if (!per) return { total: modAtributo || 0, treino: 0, nivelTreino: "nenhum" };
  const prof = bonusProficiencia((pers && pers.nivel) || 1);
  const esp = ehEspecialista(pers, id);
  const tre = ehTreinada(pers, id);
  const treino = esp ? prof * 2 : tre ? prof : 0;
  return {
    total: (modAtributo || 0) + treino,
    treino,
    nivelTreino: esp ? "especialista" : tre ? "treinada" : "nenhum",
  };
}

/* PASSIVO — 10 + bônus. O que o herói nota sem rolar nada. É por aqui
   que o sistema conta ao Mestre o que ele percebe ao entrar num lugar,
   em vez de deixar o Mestre inventar quanto ele é observador. */
export function passivoDe(pers, id, modAtributo) {
  return 10 + bonusDePericia(pers, id, modAtributo).total;
}

/* ---------------- QUANDO O DADO NÃO DECIDE NADA ----------------
   A regra que faltava, e ela não precisa de número mágico nenhum: se
   NEM O PIOR resultado possível falha, não se rola. Se nem o MELHOR
   passa, também não. O dado só entra quando ele de fato decide.

   Um d20 vai de 1 a 20. Então:
     bônus + 1  >= dificuldade  → sucesso, sempre. Não role.
     bônus + 20 <  dificuldade  → falha, sempre. Não role.

   Tentei antes com uma margem fixa de 5 ("está confortavelmente
   abaixo de você") e era pior: arbitrária, e ainda deixava o lendário
   +15 rolando contra dificuldade 14, que era exatamente o caso que a
   regra existia para resolver. Aritmética honesta bate heurística.

   O ganho não é de tempo — é de ficção. Um herói que rola para tudo
   nunca fica BOM em nada, só fica com números maiores; e o Mestre,
   vendo um dado na mesa, narra tensão onde não havia nenhuma. */
export function resolucaoAutomatica(bonus, dc, { permitir = true } = {}) {
  if (!permitir || dc == null) return null;
  const b = bonus || 0;
  if (b + 1 >= dc) return "sucesso";
  if (b + 20 < dc) return "falha";
  return null;
}

/* ---------------- O QUE O MESTRE RECEBE ----------------
   Só o que ele não consegue deduzir: no que o herói é treinado, no que
   é especialista, e os passivos que decidem o que ele nota sozinho. */
export function resumoPericiasPrompt(pers, modDe) {
  const { treinadas, especialistas } = garantirPericias(pers);
  if (!treinadas.length) return "";
  const nome = (id) => (periciaPorId(id) || {}).nome || id;
  const linhaT = treinadas.filter((t) => !especialistas.includes(t)).map(nome).join(", ");
  const linhaE = especialistas.map(nome).join(", ");
  const passivos = ["percepcao", "intuicao", "investigacao"]
    .map((id) => `${nome(id)} ${passivoDe(pers, id, modDe(periciaPorId(id).atributo))}`)
    .join(" · ");
  const cruas = PERICIAS.filter((p) => !treinadas.includes(p.id)).map((p) => p.nome);
  return `PERÍCIAS (do sistema — não invente treino que ele não tem):
- TREINADO em: ${linhaT || "—"}.${linhaE ? `\n- ESPECIALISTA (o melhor da região nisto) em: ${linhaE}.` : ""}
- SEM TREINO em: ${cruas.join(", ")}. Nestas ele é um leigo: pode tentar, mas descreva a falta de prática — nunca o trate como perito no que não treinou.
- PASSIVOS (o que ele nota SEM rolar): ${passivos}. Use isto para decidir o que ele percebe de graça ao entrar numa cena; abaixo do passivo, ele nota sem teste; acima, exige rolagem.`;
}

export const PERICIAS_PROMPT = `PERÍCIAS (v9.15):
- A ficha diz em que o herói é TREINADO e em que é ESPECIALISTA. Isso não é enfeite: é quem ele é. Um treinado em Furtividade se move como quem aprendeu; um sem treino em Arcanismo olha para um selo mágico e vê rabisco.
- NUNCA conceda competência que a ficha não lista. Se a cena pede uma perícia que ele não tem, ele pode tentar mesmo assim — e você narra a falta de prática, não o talento improvisado.
- Os PASSIVOS decidem o que ele nota de graça. Não peça teste para o que está abaixo do passivo dele: simplesmente conte que ele notou.
- Quem decide quando há teste, qual a dificuldade e qual o resultado é o SISTEMA. Você nunca rola, nunca escolhe número e nunca entrega o resultado antes do dado.`;
