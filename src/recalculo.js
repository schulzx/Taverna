/* ============================================================
   O RECÁLCULO — Taverna

   Até aqui, o save que voltava "atrás da lenda" era consertado
   PEDINDO À IA os números do herói: o `recalibrarLenda` do App
   mandava o registro da campanha ao modelo e recebia de volta
   nível e atributos propostos. É a lei da casa invertida — o
   Mestre é código, e a IA só narra. Nível, PV, PM e proficiência
   são tabela; nunca foram opinião.

   Este módulo é o substituto, e nasce com uma promessa maior que
   a remoção:

     "desde que não mude os dados do player sem que ele saiba e
      principalmente sem que seja necessário — cada vez que o
      player abrir o game o sistema recalcula e ele fica com
      status diferente em cada gameplay, seria inaceitável."

   Daí as três propriedades que este arquivo existe para cumprir:

   1. IDEMPOTENTE. Recalcular n vezes dá o mesmo que recalcular
      uma. Abrir o jogo dez vezes não move um ponto.
   2. MUDO QUANDO NÃO É PRECISO. Sem divergência, `ficha` é o
      MESMO objeto que entrou (identidade referencial, não cópia).
      É assim que "save já certo sai byte a byte igual" fica
      provado em vez de prometido — e é por isso que nada aqui
      escreve mensagem, log ou efeito.
   3. DERIVA DAS TABELAS. Cada um dos quatro números sai de uma
      tabela nomeada que a suíte lê de volta; nenhum sai daqui.

   ---------------- O QUE ELE NÃO FAZ ----------------

   Ele governa QUATRO campos (CAMPOS_DO_RECALCULO) e nada mais.
   Atributos são do jogador — foram gastos à mão, na tela, com a
   moeda da criação; o recálculo não os toca, e era justamente
   isso que a recalibração por IA fazia. `vida`/`mana` correntes
   também ficam de fora: se o teto cai, quem apara o corrente é
   quem aplica a mudança na tela, com o veredito antes do clique.

   E ele NÃO sobe de nível pelo XP. O motor que sobe é
   `aplicarNivel` (regras-jogo.js), dono único da conta, e ele
   roda a cada ganho de XP — por isso o `xp` do save é RESTO para
   o próximo degrau, nunca acumulado, e uma ficha bem formada tem
   sempre `xp < custo(nivel)`. Repetir a subida aqui teria um
   preço que mata a razão do módulo: para subir o nível é preciso
   GASTAR o XP, o `xp` não está entre os campos governados, e um
   nível movido sem o XP gasto sobe de novo na leitura seguinte.
   Medido: nível 1 com xp 100000 vira 12 no primeiro passe e 16
   no segundo — o "status diferente em cada gameplay" que a
   pessoa proibiu, escrito com a nossa própria mão. O nível aqui
   é SANEADO (inteiro, dentro da tabela) e serve de entrada para
   os outros três.
   ============================================================ */
import { CLASSES, classePorNome } from "./classes.js";
import { ANTECEDENTES } from "./antecedentes.js";
import { bonusProficiencia, XP_ACUMULADO } from "./regras.js";
import { PV_POR_NIVEL, PM_POR_NIVEL } from "./regras-jogo.js";

/* ---------------- OS CAMPOS GOVERNADOS ----------------
   A tabela que diz o alcance do recálculo. Fora dela, nada é
   tocado — nunca. Congelada de propósito: é contrato, não
   rascunho. */
export const CAMPOS_DO_RECALCULO = Object.freeze(["nivel", "vidaMax", "manaMax", "proficiencia"]);

/* O teto do nível sai da própria curva de XP (regras.js): a
   tabela do Player's Handbook tem 20 degraus, e se ela crescer
   um dia, o teto cresce junto em vez de ficar um 20 para trás. */
const NIVEL_MIN = 1;
const NIVEL_MAX = XP_ACUMULADO.length;

/* O QUE O CORPO VALE QUANDO NÃO HÁ TABELA. São os MESMOS valores
   por omissão que a tela de criação (App.jsx) e o montador dos
   prontos já usavam — ficha sem classe reconhecida vale 10/8,
   antecedente sem bônus de corpo vale 0/0. Não é regra nova: é o
   default de sempre, agora com nome. */
const CORPO_SEM_TABELA = { vidaBase: 10, manaBase: 8, pv: 0, pm: 0 };

/* Quanto cada ponto de atributo vale de corpo. Era o `* 2` solto
   em três lugares (criação, prontos, recalibração). */
const CORPO_POR_ATRIBUTO = { vigorParaPV: 2, intelectoParaPM: 2 };

const semAcento = (s) =>
  String(s == null ? "" : s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* A ficha guarda o NOME da classe ("Guerreiro"); o montador dos
   prontos também. Aceitamos o objeto pronto, o nome exato e o
   nome sem acento/caixa — e devolvemos null quando não há, em
   vez de chutar. */
function classeDe(ref) {
  if (ref && typeof ref === "object") return ref;
  const direto = classePorNome(ref);
  if (direto) return direto;
  const chave = semAcento(ref);
  if (!chave) return null;
  return CLASSES.find((c) => semAcento(c.nome) === chave) || null;
}

/* Antecedente tem DUAS portas por necessidade: o save guarda o
   nome ("Soldado Reformado") desde a criação, e os prontos
   guardam o id ("soldado").

   Não passa por `antecedentePorId` de propósito: aquele leitor
   cai no primeiro da lista quando não acha — o que serve à
   criação, que precisa sempre de um antecedente, e aqui daria o
   bônus do Órfão a qualquer nome escrito errado. Quem pergunta
   pelo corpo quer a verdade ou o silêncio, nunca um palpite. */
function antecedenteDe(ref) {
  if (ref && typeof ref === "object") return ref;
  const chave = semAcento(ref);
  if (!chave) return null;
  return (
    ANTECEDENTES.find((a) => a.id === ref) ||
    ANTECEDENTES.find((a) => semAcento(a.id) === chave || semAcento(a.nome) === chave) ||
    null
  );
}

/* Nível saneado: inteiro, dentro da tabela. `Math.floor` e não
   `round` porque arredondar para cima daria meio degrau de graça
   — e degrau de graça é dado de jogador mudado sem necessidade.
   Lixo (null, "", NaN, negativo) cai no mínimo. */
function nivelSaneado(n) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return NIVEL_MIN;
  return Math.max(NIVEL_MIN, Math.min(NIVEL_MAX, v));
}

/* ---------------- O DONO ÚNICO DO CORPO ----------------
   PV e PM de uma ficha, da criação ao nível 20. A conta é a que
   a tela de criação sempre fez (vidaBase da classe + vigor×2, no
   nível 1) mais o degrau de `aplicarNivel` (PV_POR_NIVEL /
   PM_POR_NIVEL) por nível acima do primeiro, mais o bônus de
   corpo do antecedente.

   Era essa a fórmula que vivia inline em `prontos.js`, e é ela
   que passa a valer para o recálculo — em vez do
   `pvEsperadoJogador` de combate.js, que é a RÉGUA do
   balanceamento (estimativa de classe média) e nunca foi a ficha
   de ninguém.

   `= {}` no destructuring não cobre `null`: por isso o `|| {}`
   explícito, aqui e no `atributos`. */
export function corpoDaFicha(entrada) {
  const { classe, antecedente, atributos, nivel } = entrada || {};
  const cObj = classeDe(classe);
  const antObj = antecedenteDe(antecedente);
  const attr = atributos || {};
  const vigor = Number(attr.vigor) || 0;
  const intelecto = Number(attr.intelecto) || 0;
  const cresce = nivelSaneado(nivel) - 1;
  const vidaMax =
    ((cObj && cObj.vidaBase) || CORPO_SEM_TABELA.vidaBase) +
    vigor * CORPO_POR_ATRIBUTO.vigorParaPV +
    ((antObj && antObj.pv) || CORPO_SEM_TABELA.pv) +
    cresce * PV_POR_NIVEL;
  const manaMax =
    ((cObj && cObj.manaBase) || CORPO_SEM_TABELA.manaBase) +
    intelecto * CORPO_POR_ATRIBUTO.intelectoParaPM +
    ((antObj && antObj.pm) || CORPO_SEM_TABELA.pm) +
    cresce * PM_POR_NIVEL;
  return { vidaMax, manaMax };
}

/* ---------------- O QUE DISCORDA ----------------
   Devolve `{ campo, de, para }` só dos campos governados que a
   ficha CARREGA e que discordam da tabela. Array vazio = a ficha
   já está certa.

   Campo ausente (`null`/`undefined`) não discorda: ausência não é
   valor errado, é campo que aquela ficha nunca teve. É o que
   separa "consertar" de "escrever por cima" — e é o que faz toda
   ficha de hoje, que deriva a proficiência na hora de ler em vez
   de guardá-la, sair daqui intocada. Uma que a guarde e a guarde
   errada, essa é corrigida.

   O nível entra primeiro, e os outros três derivam do nível já
   saneado — não do que estava escrito. Sem isso, consertar o
   nível num passe deixaria o corpo velho para o passe seguinte
   consertar, e a idempotência morria na primeira ficha torta. */
export function diferencasDaFicha(pers) {
  if (!pers || typeof pers !== "object") return [];
  const nivel = nivelSaneado(pers.nivel);
  const corpo = corpoDaFicha({
    classe: pers.classe,
    antecedente: pers.antecedente,
    atributos: pers.atributos,
    nivel,
  });
  const daTabela = {
    nivel,
    vidaMax: corpo.vidaMax,
    manaMax: corpo.manaMax,
    proficiencia: bonusProficiencia(nivel),
  };
  const saida = [];
  for (const campo of CAMPOS_DO_RECALCULO) {
    const de = pers[campo];
    if (de == null) continue;
    if (de === daTabela[campo]) continue;
    saida.push({ campo, de, para: daTabela[campo] });
  }
  return saida;
}

/* ---------------- O RECÁLCULO ----------------
   Sem divergência: a MESMA ficha volta (`resultado.ficha ===
   pers`), `mudou` falso, e nada é escrito. Com divergência:
   ficha NOVA, com os campos governados substituídos e todo o
   resto copiado — estado é substituído, nunca mutado. */
export function recalcularFicha(pers) {
  const diferencas = diferencasDaFicha(pers);
  if (!diferencas.length) return { ficha: pers, mudou: false, diferencas };
  const ficha = { ...pers };
  for (const d of diferencas) ficha[d.campo] = d.para;
  return { ficha, mudou: true, diferencas };
}
