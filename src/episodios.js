/* ============================================================
   OS EPISÓDIOS (v9.207) — as subestruturas que o momento aciona

   A correção de rota do jogador, virada motor: o menu de estruturas
   enxuga para quatro ESPINHAS de vida inteira (jornada, arquipélago,
   reinado, mistério), e as quatro formas de ACONTECIMENTO — a escalada,
   a vingança, o cerco, a herança — descem um andar. Viram EPISÓDIOS:
   arcos de três a quatro marcos que o sistema ABRE quando os fatos
   maduram, nunca que o jogador escolhe. Mais quatro novos, para oito.

   ---------------- AS TRÊS CAMADAS ----------------

   Espinha (o jogador escolhe, uma, a campanha inteira) > Episódio (o
   sistema aciona, um por vez, um arco) > Postura (o sistema deriva,
   contínua, dias). O episódio é o meio que faltava: a mesma Jornada
   vive um cerco quando há uma cidade amada e um relógio enchendo — sem
   que ninguém tenha escolhido "modo cerco" num menu.

   ---------------- AS REGRAS ----------------

   · ACIONADO, nunca escolhido: abre quando a condição (fatos reais)
     madura. O jogador vive um cerco, não o seleciona.
   · SEMEIA antes de abrir: planta 1-2 sementes no Livro ANTES — o
     terreno preparado e então plantada a quest, a filosofia da casa.
   · UM POR VEZ: como o peso, dois episódios simultâneos viram nenhum.
   · ANINHA NO ATO: ao fechar, registra um marco no arco (registrarMarco)
     — o episódio é capítulo da espinha, não desvio dela.
   · AFINIDADE, não exclusividade: qualquer espinha hospeda qualquer
     episódio; a afinidade só muda a preferência quando dois competem.

   Conta se prova. O módulo cataloga, decide o que abre e devolve o marco
   a narrar; o App monta o snapshot, planta as sementes e fecha no arco.
   ============================================================ */

/* ---------------- OS OITO EPISÓDIOS ----------------
   `deOnde`: a estrutura de que desceu (ou "novo"). `condicao(s)`: os
   fatos que o abrem. `sementes`: formas do Livro plantadas antes. `afim`:
   as espinhas que o favorecem. `marcos`: os beats comprimidos (3-4), cada
   um com a instrução que vai ao Narrador. `fecha`: o peso do marco que
   ele registra no arco ao terminar. */
const E = (id, nome, deOnde, afim, condicao, sementes, marcos) =>
  ({ id, nome, deOnde, afim, condicao, sementes, marcos, fecha: "missao_forcada" });

export const EPISODIOS = [
  E("linha_escura", "A Linha Escura", "cerco", ["reinado", "jornada"],
    (s) => !!s.temLugarAmado && !!s.relogioRegionalAlto,
    ["preco_estranho", "posto_sem_guarda"],
    [
      { nome: "Os Sinais", instrucao: "Estabeleça o lugar a defender e a coisa que avança (praga, horda, inverno). Os primeiros sinais chegam pequenos e mal lidos. Apresente quem vive aqui — é por essas pessoas que a linha vale algo." },
      { nome: "O Aperto", instrucao: "A ameaça fecha por todos os lados e os recursos minguam. Cada decisão fecha uma porta: o que se defende, o que se abandona. Relógios e prazos são o tabuleiro. Quem está por trás do avanço se mostra." },
      { nome: "A Escolha Impossível", instrucao: "Não dá para salvar tudo. Ponha na mesa duas perdas e nenhuma saída limpa — a escolha é do jogador, e ela define o final do episódio." },
      { nome: "O Amanhecer", instrucao: "O confronto que decide se a linha segura, com as forças que sobraram. Vitória ou derrota, mostre o custo em cada rosto salvo e em cada ausência." },
    ]),

  E("a_cobranca", "A Cobrança", "divida", ["jornada", "arquipelago"],
    (s) => !!s.vinculoMortoPorAlguem || !!s.antecedenteDivida,
    ["nome_na_lamina", "mao_que_treme"],
    [
      { nome: "A Ferida", instrucao: "Estabeleça a perda e o culpado — um nome, um símbolo, um rastro. A primeira pista aponta a direção, não o endereço." },
      { nome: "O Rastro", instrucao: "A perseguição por camadas: capangas, cúmplices, quem lucrou calado. Cada um sabe um pedaço e cobra algo para falar. O culpado sente a aproximação e reage." },
      { nome: "O Ajuste", instrucao: "O confronto com o culpado, no terreno dele. A escolha é do jogador: sangue, justiça, perdão. Cada saída tem preço, e nenhuma devolve o que foi tirado." },
    ]),

  E("a_heranca", "A Herança", "heranca", ["reinado", "misterio"],
    (s) => !!s.herdouAlgo || !!s.itemMisteriosoDesperto,
    ["selo_refeito", "pagina_arrancada"],
    [
      { nome: "O Inventário", instrucao: "Estabeleça o que foi herdado (um lugar, um posto, um mapa, um nome) e de quem. Junto do presente, as primeiras contas. Algo no espólio não fecha — mostre, não explique." },
      { nome: "As Contas Abertas", instrucao: "As dívidas do morto vêm cobrar. Cada credor conta uma versão de quem ele foi, e as versões brigam entre si." },
      { nome: "O Nome do Morto", instrucao: "A verdade sobre o morto muda o valor do que ele deixou. A escolha do jogador: honrar, romper ou reescrever o nome que passou a carregar." },
    ]),

  E("a_subida", "A Subida", "escalada", ["reinado", "jornada"],
    (s) => !!s.temDegraus,
    ["conserto_invisivel", "moeda_estrangeira"],
    [
      { nome: "O Primeiro Degrau", instrucao: "Estabeleça de onde o herói parte e o que SUBIR significa aqui (andares, patentes, ranks). A primeira conquista chega rápido e dá gosto. Mostre quem ficou embaixo, olhando." },
      { nome: "O Platô", instrucao: "A subida trava: um obstáculo que esforço não resolve — um guardião, uma regra, um preço inaceitável. Plante AQUI o motivo verdadeiro de subir, ou de parar." },
      { nome: "O Degrau Proibido", instrucao: "O caminho para o alto passa por onde ninguém deveria passar. O antagonista se interpõe: o degrau é DELE. Perder aqui é cair de verdade." },
    ]),

  E("a_peregrinacao", "A Peregrinação", "novo", ["misterio", "jornada"],
    (s) => !!s.devocaoDesperta && !!s.votoFeito,
    ["santo_sem_festa", "duas_cronicas"],
    [
      { nome: "O Voto", instrucao: "Estabeleça o voto e o destino da peregrinação. O mundo comum vira caminho — cada passo é escolha entre a pressa e a fé." },
      { nome: "Os Falsos Santuários", instrucao: "Lugares que prometem ser o fim e não são. Cada um cobra algo e ensina algo. A tentação de parar antes do fim é o verdadeiro teste." },
      { nome: "A Chegada", instrucao: "O destino — que NÃO é o que prometia. A escolha do jogador diante do que realmente há lá muda o sentido de toda a caminhada." },
    ]),

  E("a_mascara_da_paz", "A Máscara da Paz", "novo", ["misterio", "reinado"],
    (s) => !!s.posGuerra || !!s.aliancaFria,
    ["negacao_nao_pedida", "loja_fechada"],
    [
      { nome: "Os Sorrisos", instrucao: "Uma paz recém-selada, cortês demais. Apresente as casas em jogo e o que cada uma finge não querer. Quase sem combate — tudo é conversa e olhar." },
      { nome: "O Primeiro Corpo", instrucao: "Alguém morre, e a paz depende de fingir que foi acidente. As versões se multiplicam; tomar partido tem preço em todas as mesas." },
      { nome: "O Jogo das Casas", instrucao: "As alianças se recompõem à luz do corpo. Cada favor tem contrapartida, cada segredo é moeda. O jogador tece ou é tecido." },
      { nome: "A Máscara Cai", instrucao: "A verdade por trás da paz se revela — e a escolha do jogador decide se a guerra volta, se a paz sobrevive corrompida, ou se algo novo nasce." },
    ]),

  E("a_cacada_invertida", "A Caçada Invertida", "novo", ["jornada", "arquipelago"],
    (s) => !!s.cacandoAlguem,
    ["elogio_que_vigia", "margem_anotada"],
    [
      { nome: "O Contrato", instrucao: "O herói aceita caçar alguém grande. Estabeleça o alvo, quem paga e por quê. A primeira pista parece fácil demais." },
      { nome: "A Inversão", instrucao: "No meio da caçada, o herói descobre que TAMBÉM é caçado — pelo alvo, por quem contratou, ou pelos dois. O caçador vira caça." },
      { nome: "O Covil", instrucao: "O confronto no terreno do alvo, que preparou a chegada do herói. A verdade sobre quem caçava quem muda o que é vitória aqui." },
    ]),

  E("a_queda_reconstrucao", "A Queda e a Reconstrução", "novo", ["reinado", "jornada"],
    (s) => s.pesoRecente === "queda" || !!s.dominioPerdido,
    ["cova_sem_nome", "janela_as_pressas"],
    [
      { nome: "As Cinzas", instrucao: "O que dava nome ao herói se perdeu — um domínio, um título, uma base. Mostre o tamanho do vazio, sem pressa de consolar." },
      { nome: "Os Que Ficaram", instrucao: "Quem permaneceu ao lado do herói na queda. É com eles, e por eles, que a reconstrução começa — pequena, do chão." },
      { nome: "A Segunda Fundação", instrucao: "O reerguer, diferente do primeiro: o que a queda ensinou vira alicerce. A escolha do jogador: reconstruir o mesmo, ou algo novo." },
    ]),
];

export const episodioPorId = (id) => EPISODIOS.find((e) => e.id === id) || null;

/* ---------------- O ESTADO SALVO ---------------- */
export function garantirEpisodio(e) {
  if (!e || typeof e !== "object") return null;
  const ep = episodioPorId(e.id);
  if (!ep) return null;
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  return {
    id: e.id,
    marco: Math.max(0, Math.min(ep.marcos.length - 1, n(e.marco, 0))),
    aberto: e.aberto !== false,
    desde: Math.max(0, n(e.desde, 0)),
    avancouEm: Math.max(0, n(e.avancouEm, 0)),
  };
}

/* ---------------- O QUE ABRE ----------------
   Um por vez: se já há episódio aberto, nada abre. Senão, entre os que a
   condição acende, ganha o de maior afinidade com a espinha atual —
   afinidade é preferência, não exclusividade, então um sem afinidade
   ainda abre se for o único. Empate: a ordem do catálogo. */
export function episodioQueAbre(snapshot, { ativo = null, espinha = "" } = {}) {
  if (ativo) return null;
  const s = snapshot && typeof snapshot === "object" ? snapshot : {};
  const candidatos = EPISODIOS.filter((e) => { try { return !!e.condicao(s); } catch { return false; } });
  if (!candidatos.length) return null;
  const comAfim = candidatos.filter((e) => e.afim.includes(espinha));
  return (comAfim[0] || candidatos[0]).id;
}

/* ---------------- SEMENTES E MARCOS ---------------- */
export function sementesDoEpisodio(id, { alvo = "", ato = 0, dia = 0 } = {}) {
  const ep = episodioPorId(id);
  if (!ep) return [];
  return ep.sementes.map((forma) => ({ forma, dona: "episodio", peso: "leve", alvo: alvo || id, ato, dia }));
}
export function marcoDoEpisodio(estado) {
  const e = garantirEpisodio(estado);
  if (!e) return null;
  const ep = episodioPorId(e.id);
  return ep.marcos[e.marco] || null;
}
export function envelopeDoEpisodio(estado) {
  const m = marcoDoEpisodio(estado);
  if (!m) return "";
  return `[EPISÓDIO EM CURSO — ${m.nome}] ${m.instrucao}`;
}

/* ---------------- AVANÇAR E FECHAR ----------------
   Avança um marco por vez, com dias entre eles (o episódio respira como o
   arco). Quando passa do último, fecha — e quem chama registra o marco no
   arco. Devolve o estado novo e se fechou. */
export const DIAS_ENTRE_MARCOS = 3;
export function avancarEpisodio(estado, { dia = 0 } = {}) {
  const e = garantirEpisodio(estado);
  if (!e || !e.aberto) return { episodio: e, fechou: false, avancou: false };
  if (dia - e.avancouEm < DIAS_ENTRE_MARCOS) return { episodio: e, fechou: false, avancou: false };
  const ep = episodioPorId(e.id);
  if (e.marco >= ep.marcos.length - 1) {
    return { episodio: { ...e, aberto: false }, fechou: true, avancou: false, pesoNoArco: ep.fecha };
  }
  return { episodio: { ...e, marco: e.marco + 1, avancouEm: dia }, fechou: false, avancou: true };
}

/* ---------------- PARA O CONSOLE DE AUTOR ---------------- */
export function resumoDoEpisodio(estado) {
  const e = garantirEpisodio(estado);
  if (!e) return { episodio: null, marco: null };
  const ep = episodioPorId(e.id);
  return { episodio: e.id, marco: (ep.marcos[e.marco] || {}).nome || "", aberto: e.aberto };
}
