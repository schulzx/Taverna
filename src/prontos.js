/* ============================================================
   O ROSTER DOS OITO (v9.214) — os prontos das duas mesas

   Oito personagens fechados, um por papel. Servem às três mesas do
   documento As Duas Mesas: elenco da Partida Rápida (o jogador leva
   um), chave do Torneio (a casa pilota os outros sete) e métrica do
   Duelo justo (mesmo nível, mesmo orçamento).

   ---------------- SÓ PEÇAS QUE EXISTEM ----------------

   Um pronto é DADO PURO montado com o vocabulário real do jogo: classe
   e subclasse de classes.js, antecedente de antecedentes.js, arma e
   armadura do catálogo de itens.js (equipadas SEM penalidade — a suíte
   confere peça a peça com avaliarEquipar), índole e propósito de
   indole.js, sementes pessoais do Livro. Nada aqui inventa mecânica:
   o montador produz a MESMA ficha que a tela de criação produziria,
   campo a campo — inclusive o dom de raça, pelo mesmo comDom.

   ---------------- O ORÇAMENTO IDÊNTICO ----------------

   Equilíbrio começa na fundação: os oito têm o mesmo nível (1), os
   mesmos 6 pontos de atributo da criação, o mesmo bolso (MOEDAS_DO_
   PRONTO, fixo — o bônus de moedas do antecedente NÃO entra, senão o
   nobre nasceria mais rico que o órfão) e uma arma+armadura de banca
   comum. O que varia é o FEITIO, nunca o tamanho. A prova final do
   equilíbrio não mora aqui: mora no round-robin da arena (M3), que
   trava a taxa de vitória de todo pronto entre 35% e 65%.
   ============================================================ */

import { classePorNome, racaPorNome, habilidadesDisponiveis, PROFISSOES } from "./classes.js";
import { antecedentePorId } from "./antecedentes.js";
import { periciasIniciais } from "./pericias.js";
import { comDom } from "./tracos.js";
import { MOEDAS_INICIAIS } from "./constantes.js";
import { corpoDaFicha } from "./recalculo.js";
import { aoTrocarDeCenario } from "./cenario.js";

/* o bolso de todo pronto — o mesmo para os oito, por desenho */
export const MOEDAS_DO_PRONTO = MOEDAS_INICIAIS + 10;
export const NIVEL_DO_PRONTO = 3;

/* ---------------- OS OITO ----------------
   T4-B (28/10, 6.ª fatia): os oito moram no cenário (`prontos`,
   cenario-padrao.js), porque a raça e o ofício de cada um são do mundo — e
   noutro mundo o montador devolvia null (o Goliath da Muralha não existe na
   estação). `linha` é a frase de venda (vai à tela de escolha). `indole` é
   a persona do rival quando a casa pilota: traços e propósito REAIS de
   indole.js. `sementes` são 2 formas do Livro — o passado que pode brotar
   até numa noite só. `export let`: a ligação viva do ESM faz quem importou
   ver o roster do mundo em uso. */
export let PRONTOS = [];
aoTrocarDeCenario((c) => { PRONTOS = c.prontos; });

export const prontoPorId = (id) => PRONTOS.find((p) => p.id === id) || null;

/* a defesa de cada armadura do roster — os MESMOS números da tabela de
   loot.js (Gibão 1, Couro Batido 1, Brigantina 1, Cota de Malha 2, Manto 1):
   um pronto veste peça de banca comum, nem melhor nem pior. Fica aqui em
   espelho porque a tabela de loot é interna àquele módulo; a suíte compara
   as duas para o espelho nunca envelhecer calado. */
export const DEFESA_DA_ARMADURA = {
  "Gibão de Couro": 1, "Couro Batido": 1, "Brigantina": 1,
  "Cota de Malha": 2, "Manto Encantado": 1,
  /* escudos, do mesmo balde de loot */
  "Escudo Torre": 2, "Escudo de Placas": 2,
};

/* ---------------- O MONTADOR ----------------
   Devolve a MESMA ficha que a tela de criação devolve, campo a campo —
   com o dom de raça pelo mesmo comDom. `nomeDe` deixa a partida batizar
   (ou fica o nome de guerra). A arma e a armadura nascem EQUIPADAS:
   um pronto existe para lutar no minuto um. */
export function montarPronto(id, { nome = "" } = {}) {
  const p = prontoPorId(id);
  if (!p) return null;
  const cObj = classePorNome(p.classe);
  const rObj = racaPorNome(p.raca);
  const antObj = antecedentePorId(p.antecedente);
  if (!cObj || !rObj || !antObj) return null;
  const attrFinais = Object.fromEntries(Object.entries(p.atributos).map(([k, v]) => [k, v + ((rObj.bonus || {})[k] || 0)]));
  /* nivel fixo 3, pela conta REAL de subir de nivel: a criacao da classe
     (vidaBase + vigor*2) mais PV_POR_NIVEL/PM_POR_NIVEL por degrau — o
     mesmo que o botao de nivel soma na campanha. Preserva a identidade da
     classe (o tanque de vidaBase 14 chega mais alto que o mago de 8), e o
     duelo deixa de ser loteria de um golpe.

     v9.272: a conta em si nao mora mais aqui. Ela era escrita inline
     nestas duas linhas E dentro da tela de criacao E, torta, na
     recalibracao por IA — tres donos para uma formula so, e a
     recalibracao ja tinha divergido dos outros dois. Agora o dono e
     `corpoDaFicha` (recalculo.js): os numeros sao os MESMOS, byte a byte,
     para os oito prontos; o que mudou foi haver um lugar onde consertar. */
  const { vidaMax, manaMax } = corpoDaFicha({
    classe: cObj, antecedente: antObj, atributos: attrFinais, nivel: NIVEL_DO_PRONTO,
  });
  const nomeInteiro = String(nome || "").trim() || p.nome;
  const arma = { nome: p.arma, tipo: "arma" };
  const armadura = { nome: p.armadura, tipo: "armadura", atributos: { defesa: DEFESA_DA_ARMADURA[p.armadura] || 1 } };
  const escudo = p.escudo ? { nome: p.escudo, tipo: "escudo", atributos: { defesa: DEFESA_DA_ARMADURA[p.escudo] || 1 } } : null;
  return comDom({
    genero: p.sexo, feicoesFixas: true,
    nome: nomeInteiro, primeiroNome: nomeInteiro, sobrenome: "",
    conceito: p.conceito, historia: p.linha,
    raca: p.raca, classe: p.classe, subclasse: p.subclasse, profissao: p.profissao,
    antecedente: antObj.nome, antecedenteGancho: antObj.gancho,
    /* determinística por pronto: a mesma escolha dá o mesmo herói */
    semente: `pronto|${p.id}|${nomeInteiro}`,
    atributos: attrFinais, vida: vidaMax, vidaMax, mana: manaMax, manaMax,
    baseAtributos: { ...attrFinais }, pontosAtr: 0, atributosVersao: 1,
    nivel: NIVEL_DO_PRONTO, xp: 0, moedas: MOEDAS_DO_PRONTO, nivelPendentes: 0,
    /* a bolsa de banca: DUAS pocoes de cura pequenas, iguais para os oito
       (orcamento identico) — o cerebro de companheiro decide quando beber. */
    inventario: [...(antObj.item ? [antObj.item] : []), "Poção de Cura Pequena", "Poção de Cura Pequena"],
    /* nivel 3 conhece o kit ate o nivel 3 — o catalogo da classe, dedupado
       por nome. E o mesmo criterio para os oito; a catraca da arena e quem
       diz se a mao ficou justa. */
    habilidades: [...new Map(habilidadesDisponiveis(p.classe, NIVEL_DO_PRONTO, []).map((h) => [h.nome, h])).values()], grupo: [],
    efeitos: [], condicoes: [], equipamento: [],
    equipados: escudo ? { arma, armadura, escudo } : { arma, armadura },
    pericias: periciasIniciais({ classe: p.classe, antecedente: antObj.nome }), periciasVersao: 1,
    /* a marca do roster: de onde este herói veio (a conversão para
       campanha e o duelo justo leem daqui) */
    pronto: p.id,
  });
}

/* válido para o montador? — a suíte usa, e a tela de escolha também */
export function profissaoValida(nome) {
  return PROFISSOES.some((x) => x.nome === nome);
}
