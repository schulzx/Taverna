/* ============================================================
   SALVAGUARDAS (v9.60) — a rolagem que ninguém pede

   A v9.59 escreveu que existem três rolagens e que a segunda é esta.
   Escreveu, e não tinha nada atrás — regra sem código, que é a
   espécie de bug que este projeto mais produziu.

   A DIFERENÇA QUE JUSTIFICA UM TIPO PRÓPRIO é de direção. O teste de
   perícia nasce de uma vontade do herói: ele quer abrir a porta, ele
   quer ler o vestígio. A salvaguarda nasce de uma vontade do MUNDO —
   o dardo já disparou, o veneno já está no sangue, a voz já mandou
   você se ajoelhar. Ninguém pede para resistir a um veneno; resistir
   é o que sobra depois que já aconteceu.

   Daí duas consequências que são regra, não estilo:

   1) O JOGADOR NUNCA A PEDE, e o sistema nunca a oferece como opção.
      Ela dispara sozinha, na hora, e o jogador lê o resultado.
   2) O MESTRE NUNCA A ROLA E NUNCA A EXIGE. Se ele narrar um gás
      verde, quem decide se houve salvaguarda é o sistema.

   SEIS SALVAGUARDAS, uma por atributo, porque é assim que se sabe
   qual rolar sem perguntar: o veneno ataca o corpo (Vigor), o dardo
   se esquiva (Destreza), a voz dobra a vontade (Presença).

   E DUAS SÃO PROFICIENTES POR CLASSE. É o que faz o Mago aguentar o
   que derruba o Guerreiro e vice-versa — sem isso, a salvaguarda
   seria só o atributo com outro nome, e a classe não significaria
   nada na hora em que o mundo ataca de volta.

   O QUE ISTO SUBSTITUI: as aflições já rolavam uma resistência
   escondida (`rolarAflicao`), com atributo cru e nível/4 no lugar da
   proficiência. Aquilo era uma salvaguarda sem saber que era. Agora
   tem nome, bônus certo e aparece na tela.
   ============================================================ */

import { ATRIBUTOS } from "./constantes.js";
import { bonusProficiencia } from "./regras.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const SALVAGUARDAS = [
  { id: "vigor", atributo: "vigor", nome: "Vigor", icone: "🫁", contra: "veneno, doença, exaustão, frio — o que ataca o corpo por dentro" },
  { id: "destreza", atributo: "destreza", nome: "Destreza", icone: "🤸", contra: "armadilha, explosão, sopro em área, queda — o que se esquiva" },
  { id: "forca", atributo: "forca", nome: "Força", icone: "💪", contra: "agarrão, empurrão, ser arrastado, a pedra que rola" },
  { id: "intelecto", atributo: "intelecto", nome: "Intelecto", icone: "📖", contra: "ilusão, invasão da mente, o enigma que morde de volta" },
  { id: "presenca", atributo: "presenca", nome: "Presença", icone: "🗣", contra: "encanto, medo, comando — o que dobra a vontade" },
  { id: "percepcao", atributo: "percepcao", nome: "Percepção", icone: "👁", contra: "o que engana os sentidos: emboscada, disfarce, o golpe pelas costas" },
];

export function salvaguardaPorId(id) { return SALVAGUARDAS.find((s) => s.id === id) || SALVAGUARDAS[0]; }
export function nomeDaSalva(id) { return salvaguardaPorId(id).nome; }

/* ---------------- DUAS POR CLASSE ----------------
   O par diz o que a classe é. O Guerreiro aguenta pancada e não é
   dobrado à força; o Mago tem a mente firme e o corpo frágil; o
   Ladino se esquiva de tudo e não cai em truque. Se todas fossem
   iguais, a classe não mudaria nada na hora em que o mundo bate. */
const PROFICIENTES = {
  guerreiro: ["forca", "vigor"],
  mago: ["intelecto", "presenca"],
  ladino: ["destreza", "intelecto"],
  clerigo: ["presenca", "vigor"],
  cacador: ["destreza", "percepcao"],
  bardo: ["destreza", "presenca"],
  monge: ["destreza", "forca"],
  druida: ["intelecto", "vigor"],
  feiticeiro: ["vigor", "presenca"],
  bruxo: ["presenca", "intelecto"],
  engenheiro: ["intelecto", "destreza"],
  invocador: ["intelecto", "presenca"],
};

/* Multiclasse soma os pares — quem estudou nas duas escolas aprendeu
   a aguentar as duas coisas. O nome da classe pode vir composto
   ("Guerreiro/Ladino"), que é como esta casa guarda multiclasse. */
export function salvasDaClasse(classe) {
  const t = norm(classe);
  if (!t) return [];
  const out = [];
  for (const [nome, pares] of Object.entries(PROFICIENTES)) {
    if (t.includes(nome)) for (const p of pares) if (!out.includes(p)) out.push(p);
  }
  return out;
}

export function ehProficienteNaSalva(pers, id) {
  return salvasDaClasse((pers && pers.classe) || "").includes(id);
}

/* O bônus. `modDe` vem de fora — quem sabe somar equipamento, efeito e
   dádiva é o App, e duplicar essa soma aqui criaria duas verdades. */
export function bonusDeSalvaguarda(pers, id, modDe) {
  const s = salvaguardaPorId(id);
  const base = typeof modDe === "function" ? Number(modDe(s.atributo)) || 0 : 0;
  const prof = ehProficienteNaSalva(pers, id) ? bonusProficiencia((pers && pers.nivel) || 1) : 0;
  return { total: base + prof, base, prof, proficiente: prof > 0 };
}

/* ============================================================
   DE ONDE VEM O PERIGO

   A tabela que decide QUAL salvaguarda, lida do que aconteceu. É a
   mesma régua do resto da casa: uma tabela e um leitor puro, para
   ninguém precisar arbitrar "isso é Vigor ou Destreza?" no meio da
   cena — e para a resposta ser a mesma nas duas vezes que a mesma
   coisa acontecer.

   `meia` é a regra do dano em área: passar não anula, corta pela
   metade. Passar numa salvaguarda de veneno anula; passar na de uma
   explosão que já te envolveu só reduz. É a diferença entre desviar
   e aguentar.
   ============================================================ */
export const FONTES_DE_SALVAGUARDA = [
  { id: "armadilha", rx: /armadilha|dardo|estaca|lamina|alcapao|fio|besta escondida|piso que|chao que desaba|pedra que rola|potes de fogo/, salva: "destreza", meia: true, diz: "a armadilha" },
  { id: "sopro", rx: /sopro|baforada|explos|labareda|jato|bafo|onda de/, salva: "destreza", meia: true, diz: "a baforada" },
  { id: "queda", rx: /queda|despenc|cair de|precipicio|abismo/, salva: "destreza", meia: true, diz: "a queda" },
  { id: "veneno", rx: /veneno|peconh|toxic|acido|ferroada|cuspe|presas/, salva: "vigor", meia: false, diz: "o veneno" },
  /* `gelid` está aqui porque "Toque gélido" é um golpe real do catálogo de
     criaturas e "gelo" não é pedaço de "gélido" — o radical é outro. */
  { id: "frio", rx: /frio|gelo|gelid|congel|glacial|hipotermia|nevasca/, salva: "vigor", meia: true, diz: "o frio" },
  { id: "doenca", rx: /doenca|praga|febre|infec|peste|putref/, salva: "vigor", meia: false, diz: "a doença" },
  { id: "encanto", rx: /encant|enfeitic|charme|domina|seduz|marionete/, salva: "presenca", meia: false, diz: "o encanto" },
  { id: "medo", rx: /medo|terror|pavor|amedront|panico|uivo/, salva: "presenca", meia: false, diz: "o terror" },
  { id: "mente", rx: /ilusao|mental|possess|invade a mente|sussurr|voz que|enigma/, salva: "intelecto", meia: false, diz: "o que entra pela mente" },
  { id: "agarrao", rx: /agarr|prende|enrosca|tentacul|teia|la[cç]o|corrente que/, salva: "forca", meia: false, diz: "o agarrão" },
  { id: "empurrao", rx: /empurr|derrub|arrast|rajada que|vendaval|tromb/, salva: "forca", meia: false, diz: "o empurrão" },
  { id: "sentidos", rx: /areia|cega|fumaca|ofusc|clarao|surdez|ensurdec/, salva: "percepcao", meia: false, diz: "o que engana os sentidos" },
];

/* Qual salvaguarda este perigo pede. Devolve null quando o texto não
   descreve perigo nenhum — e null aqui significa "não houve
   salvaguarda", não "salvaguarda fácil". */
export function fonteDaSalvaguarda(texto) {
  const t = norm(texto);
  if (!t.trim()) return null;
  return FONTES_DE_SALVAGUARDA.find((f) => f.rx.test(t)) || null;
}

/* Qual salvaguarda um GOLPE pede. Sempre devolve uma — no meio de uma luta
   não existe "nenhuma": se o golpe carrega aflição, alguma coisa no corpo
   ou na vontade tem de segurar. Vigor é o padrão porque é o que aguenta o
   que não se esquiva nem se argumenta. */
export function salvaDoGolpe(nome) {
  const f = fonteDaSalvaguarda(nome);
  return f ? f.salva : "vigor";
}

/* As salvaguardas que a mente defende. Existe para quem tem "vantagem
   contra efeitos mentais" na ficha saber ONDE cobrar — o Gnomo e o
   Sintético traziam a frase desde a criação do jogo e ela não era lida em
   lugar nenhum. */
export function ehSalvaMental(id) { return id === "presenca" || id === "intelecto"; }

/* A dificuldade vem da FONTE, como no resto da v9.59: um dardo de
   corredor raso não é o bafo de um dragão. Sem nível declarado, 13 —
   o "difícil o bastante para importar, fácil o bastante para passar". */
export function dcDaFonte({ nivel = 0, base = 13, ajuste = 0 } = {}) {
  const n = Math.max(0, Number(nivel) || 0);
  return Math.max(8, Math.min(25, base + Math.floor(n / 3) + (Number(ajuste) || 0)));
}

/* ============================================================
   A ROLAGEM

   Rolada pelo sistema, sempre. Vantagem existe porque três traços do
   jogo já a prometiam para efeitos mentais e não tinham onde cobrar
   a promessa — o Gnomo e o Sintético diziam "vantagem para resistir
   ao que é mental" e nada, em lugar nenhum, lia essa frase.
   ============================================================ */
export function rolarSalvaguarda({ pers, salva = "vigor", dc = 13, modDe, vantagem = false, desvantagem = false, d20 = null } = {}) {
  const s = salvaguardaPorId(salva);
  const { total: mod, proficiente } = bonusDeSalvaguarda(pers, s.id, modDe);
  const rola = () => (Number.isFinite(d20) ? d20 : 1 + Math.floor(Math.random() * 20));
  const a = rola();
  const b = (vantagem || desvantagem) && !Number.isFinite(d20) ? rola() : a;
  const valor = vantagem ? Math.max(a, b) : desvantagem ? Math.min(a, b) : a;
  const total = valor + mod;
  const critico = valor === 20, desastre = valor === 1;
  const passou = critico || (!desastre && total >= dc);
  return { salva: s.id, nome: s.nome, icone: s.icone, valor, outro: b === a ? null : b, mod, total, dc, passou, critico, desastre, proficiente, vantagem: !!vantagem, desvantagem: !!desvantagem };
}

/* ============================================================
   O QUE SE VÊ E O QUE O MESTRE RECEBE
   ============================================================ */
export function linhaDaSalvaguarda(r, quem = "Você") {
  if (!r) return "";
  const vd = r.vantagem ? " com vantagem" : r.desvantagem ? " com desvantagem" : "";
  return `${r.icone} Salvaguarda de ${r.nome}${r.proficiente ? " ★" : ""}${vd}: d20 → ${r.valor}${r.mod ? ` + ${r.mod}` : ""} = ${r.total} vs ${r.dc} · ${r.critico ? "SUCESSO CRÍTICO" : r.desastre ? "FALHA CRÍTICA" : r.passou ? "resistiu" : "não resistiu"}`;
}

export function envelopeDaSalvaguarda(r, { oQue = "o perigo", efeito = "", meia = false, danoCheio = 0, danoFinal = 0 } = {}) {
  if (!r) return "";
  const cabeca = `[SALVAGUARDA — ROLADA PELO SISTEMA] ${oQue} veio contra mim e o sistema rolou a minha salvaguarda de ${r.nome}: d20 ${r.valor}${r.mod ? ` + ${r.mod}` : ""} = ${r.total} contra dificuldade ${r.dc}. Eu ${r.passou ? "RESISTI" : "NÃO RESISTI"}.`;
  const regraBase = `REGRA DESTE ENVELOPE (obrigatória): a salvaguarda é do SISTEMA. Você não a pede, não a rola, não a repete e não a discute — nem para ser generoso, nem para ser cruel. Eu também não a peço: ela acontece comigo.`;
  if (meia) {
    return `${cabeca} O perigo era de área, então passar não anula: corta pela metade. Dano cheio ${danoCheio}, dano sofrido ${danoFinal} — JÁ aplicado pelo sistema, NÃO envie vida.
${regraBase} Narre ${r.passou ? "o corpo que reagiu a tempo e o estrago que ainda assim passou" : "o golpe inteiro me acertando"}, em duas ou três frases, e me devolva a palavra.`;
  }
  if (r.passou) {
    return `${cabeca}
${regraBase} NÃO aplique ${efeito || "o efeito"}, nem uma versão suave dele, nem "por pouco tempo". Narre o perigo passando raspando — o corpo que aguentou, a vontade que não dobrou — e siga.`;
  }
  return `${cabeca}
${regraBase} O efeito JÁ está aplicado pelo sistema${efeito ? ` (${efeito})` : ""} — não recalcule, não invente outro e não mande condição. Narre isso como fato consumado${r.desastre ? ", e como foi falha crítica, narre-o feio" : ""}.`;
}

/* Curto de propósito. A regra "você nunca rola" já está inteira no bloco de
   DESAFIOS, que sobe sempre; repeti-la aqui por extenso seria pagar duas
   vezes pelo mesmo aviso — e este bloco só sobe em luta e em masmorra. */
export const SALVAGUARDAS_PROMPT = `SALVAGUARDAS — A ROLAGEM QUE NINGUÉM PEDE (v9.60):
- É a segunda das três rolagens, e a única que nasce do MUNDO contra o herói: veneno no sangue, dardo já disparado, voz que manda ajoelhar. O teste de perícia é vontade dele; esta é vontade sua, e ele só reage.
- O jogador não pode pedir uma. VOCÊ não pode rolar uma, não pode exigir uma e não pode repeti-la: quando o perigo aparece, o SISTEMA já rolou e mandou o envelope.
- São seis, uma por atributo: Vigor (veneno, doença, frio), Destreza (armadilha, explosão, queda), Força (agarrão, empurrão), Intelecto (ilusão, invasão da mente), Presença (encanto, medo, comando), Percepção (o que engana os sentidos).
- PASSAR NÃO É SEMPRE ANULAR: contra veneno e encanto, anula; contra o que é de área e já envolveu o herói, corta o dano pela metade — e o sistema já fez a conta.
- Se o envelope disser que ele RESISTIU, não aplique o efeito de forma nenhuma: nem suavizado, nem "por um instante", nem como descrição. Resistir é uma resposta inteira.
- Você NUNCA envia condição, dano ou vida vindos de uma salvaguarda.`;
