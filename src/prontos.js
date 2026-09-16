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

/* o bolso de todo pronto — o mesmo para os oito, por desenho */
export const MOEDAS_DO_PRONTO = MOEDAS_INICIAIS + 10;
export const NIVEL_DO_PRONTO = 3;

/* ---------------- OS OITO ----------------
   `linha` é a frase de venda (vai à tela de escolha). `indole` é a
   persona do rival quando a casa pilota: traços e propósito REAIS de
   indole.js. `sementes` são 2 formas do Livro — o passado que pode
   brotar até numa noite só. */
const P = (o) => o;

export const PRONTOS = [
  P({
    id: "muralha", nome: "A Muralha", papel: "tanque",
    linha: "Fica na porta. Sempre ficou em alguma porta.",
    sexo: "mulher", raca: "Goliath", classe: "Guerreiro", subclasse: "Cavaleiro",
    profissao: "Ferreiro", antecedente: "soldado",
    atributos: { forca: 2, destreza: 1, vigor: 3, intelecto: 0, presenca: 0, percepcao: 0 },
    arma: "Espada Longa", armadura: "Cota de Malha", escudo: "Escudo Torre",
    indole: { tracos: ["fiel", "teimoso"], proposito: "proteger" },
    sementes: ["nome_na_lamina", "cova_sem_nome"],
    conceito: "a que segura a linha quando todo mundo recua",
  }),
  P({
    id: "sombra", nome: "A Sombra", papel: "furtivo",
    linha: "Você não a contratou. Ela decidiu vir.",
    sexo: "mulher", raca: "Elfo", classe: "Ladino", subclasse: "Assassino",
    profissao: "Cartógrafo", antecedente: "ladrao",
    atributos: { forca: 1, destreza: 2, vigor: 1, intelecto: 0, presenca: 0, percepcao: 2 },
    arma: "Adaga", armadura: "Gibão de Couro",
    indole: { tracos: ["calado", "desconfiado"], proposito: "vender_o_que_sabe" },
    sementes: ["chave_sem_porta", "janela_as_pressas"],
    conceito: "a que entra sem convite e sai sem despedida",
  }),
  P({
    id: "chama", nome: "A Chama", papel: "conjurador",
    linha: "Leu o livro errado até o fim.",
    sexo: "mulher", raca: "Tiefling", classe: "Mago", subclasse: "Elementalista",
    profissao: "Escriba", antecedente: "erudito",
    atributos: { forca: 0, destreza: 2, vigor: 2, intelecto: 2, presenca: 0, percepcao: 0 },
    arma: "Cajado de Carvalho", armadura: "Manto Encantado",
    indole: { tracos: ["curioso", "orgulhoso"], proposito: "provar_ao_pai" },
    sementes: ["margem_anotada", "duas_cronicas"],
    conceito: "a que faz o fogo obedecer, quase sempre",
  }),
  P({
    id: "remendo", nome: "O Remendo", papel: "curandeiro",
    linha: "Já costurou gente demais para ter medo de sangue.",
    sexo: "homem", raca: "Humano", classe: "Clérigo", subclasse: "Sacerdote",
    profissao: "Médico de Campo", antecedente: "acolito",
    atributos: { forca: 0, destreza: 0, vigor: 1, intelecto: 2, presenca: 1, percepcao: 2 },
    arma: "Lança", armadura: "Brigantina",
    indole: { tracos: ["compassivo", "pratico"], proposito: "redimir" },
    sementes: ["santo_sem_festa", "negacao_nao_pedida"],
    conceito: "o que remenda o corpo e cala o resto",
  }),
  P({
    id: "voz", nome: "A Voz", papel: "social",
    linha: "Conhece três saídas de toda conversa.",
    sexo: "mulher", raca: "Halfling", classe: "Bardo", subclasse: "Encantador",
    profissao: "Mercador", antecedente: "artista",
    atributos: { forca: 0, destreza: 1, vigor: 1, intelecto: 0, presenca: 3, percepcao: 1 },
    arma: "Rapieira", armadura: "Gibão de Couro",
    indole: { tracos: ["tagarela", "vaidoso"], proposito: "nao_ser_esquecido" },
    sementes: ["elogio_que_vigia", "moeda_estrangeira"],
    conceito: "a que ganha a plateia antes de sacar a lâmina",
  }),
  P({
    id: "flecha", nome: "A Flecha", papel: "distância",
    linha: "Conta os passos entre ela e tudo.",
    sexo: "mulher", raca: "Humano", classe: "Caçador", subclasse: "Arqueiro",
    profissao: "Caçador de Recompensas", antecedente: "cacador",
    atributos: { forca: 0, destreza: 2, vigor: 1, intelecto: 0, presenca: 0, percepcao: 3 },
    arma: "Arco Curto", armadura: "Couro Batido",
    indole: { tracos: ["frio", "rancoroso"], proposito: "divida_de_sangue" },
    sementes: ["mao_que_treme", "posto_sem_guarda"],
    conceito: "a que erra uma vez por década, e lembra de cada uma",
  }),
  P({
    id: "punho", nome: "O Punho", papel: "fúria",
    linha: "Briga desde antes de ter nome de briga.",
    sexo: "homem", raca: "Anão", classe: "Guerreiro", subclasse: "Gladiador",
    profissao: "Minerador", antecedente: "orfao",
    atributos: { forca: 2, destreza: 2, vigor: 2, intelecto: 0, presenca: 0, percepcao: 0 },
    arma: "Machado de Guerra", armadura: "Couro Batido", escudo: "Escudo de Placas",
    indole: { tracos: ["corajoso", "brincalhao"], proposito: "desafiar" },
    sementes: ["promessa_pequena", "sino_fora_de_hora"],
    conceito: "o que sorri no primeiro soco e gargalha no segundo",
  }),
  P({
    id: "voto", nome: "O Voto", papel: "juramento",
    linha: "Jurou uma coisa só. Cumpre há vinte anos.",
    sexo: "homem", raca: "Draconato", classe: "Clérigo", subclasse: "Paladino",
    profissao: "Curtidor", antecedente: "ex_cultista",
    atributos: { forca: 1, destreza: 0, vigor: 2, intelecto: 1, presenca: 2, percepcao: 0 },
    arma: "Machadinha", armadura: "Cota de Malha",
    indole: { tracos: ["humilde", "supersticioso"], proposito: "morrer_com_honra" },
    sementes: ["brasao_limado", "presente_cedo"],
    conceito: "o que carrega a culpa velha como quem carrega escudo",
  }),
];

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
