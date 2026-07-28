/* ============================================================
   ESTRUTURA DE HISTÓRIA E MISSÕES — Taverna
   O app guarda o ARCO (estrutura escolhida + ato atual) e o
   DIÁRIO de missões. Ambos vão no prompt a cada turno: o Mestre
   ganha um norte dramático e o jogador nunca fica perdido.
   Direção por código; criatividade contextual pela IA.
   ============================================================ */

export const ESTRUTURAS = [
  {
    id: "jornada",
    nome: "Jornada do Herói",
    desc: "Um arco clássico: o chamado, as provações, o abismo e o retorno transformado. Ideal para uma epopeia pessoal.",
    etapas: [
      { nome: "O Chamado", instrucao: "Estabeleça o mundo comum do herói e faça surgir UM chamado claro à aventura (a missão principal). Semeie o que estará em jogo. Cenas de apresentação, vínculos e o incidente que muda tudo." },
      { nome: "A Travessia", instrucao: "O herói deixa o mundo conhecido. Apresente aliados, rivais e as regras do mundo novo. Missões secundárias apresentam facções e lugares. A ameaça principal se mostra à distância." },
      { nome: "Provações", instrucao: "Desafios crescentes testam o herói e o grupo. Vitórias parciais e custos reais. Aprofunde vínculos com companheiros. O antagonista se torna pessoal." },
      { nome: "O Abismo", instrucao: "O momento mais escuro: uma derrota, perda ou revelação que abala o herói. Tudo parece perdido. Prepare AQUI as sementes da virada — nada de resgate fácil." },
      { nome: "A Transformação", instrucao: "O herói se reergue diferente: nova compreensão, aliança inesperada ou poder conquistado com custo. O caminho para o confronto final se abre." },
      { nome: "O Retorno", instrucao: "Clímax e desfecho: o confronto decisivo com o que foi construído a campanha inteira, e as consequências. Feche os fios abertos. Depois do fim, ofereça um epílogo em paz — e pergunte se o jogador deseja um novo arco." },
    ],
  },
  {
    id: "arquipelago",
    nome: "Arquipélago",
    desc: "Focos múltiplos: várias histórias semi-independentes (ilhas) que o jogador navega, e que aos poucos se entrelaçam.",
    etapas: [
      { nome: "As Ilhas", instrucao: "Estabeleça 2-3 arcos INDEPENDENTES (lugares, facções ou personagens com dramas próprios), cada um com sua missão. O jogador escolhe livremente qual visitar; nenhum é 'o principal' ainda. Deixe cada ilha com identidade forte." },
      { nome: "Correntes", instrucao: "Sinais de que as ilhas se tocam: um nome que aparece em dois lugares, um objeto que viaja, um interesse comum. Não force a conexão — deixe o jogador percebê-la. Aprofunde o arco que ele mais frequenta." },
      { nome: "Convergência", instrucao: "As histórias se entrelaçam de verdade: os arcos revelam ser partes de um quadro maior (sem invalidar o que cada um era). As escolhas do jogador em cada ilha agora pesam nas outras." },
      { nome: "A Maré", instrucao: "Clímax que reúne os fios: o desfecho depende do que o jogador construiu em cada arco. Amarre as pontas e mostre como cada ilha termina. Depois, epílogo e convite a um novo mar." },
    ],
  },
  {
    id: "reinado",
    nome: "Ascensão do Reino",
    desc: "Gestão, território e poder: fundar, expandir e defender um domínio. Para quem quer governar de verdade.",
    etapas: [
      { nome: "Fundação", instrucao: "O jogador conquista ou herda sua primeira base (cidade, guilda ou fortaleza). Missões de estabelecimento: recursos, primeiros aliados, um lugar no mapa. Gestão é conteúdo nobre: colheitas, obras, nomeações." },
      { nome: "Expansão", instrucao: "Crescimento: novas cidades, rotas de comércio, alianças e vassalos. Gere dilemas de governo (impostos, disputas, festivais, embaixadas). Rivais observam — inveja e diplomacia antes de guerra." },
      { nome: "Rivalidades", instrucao: "Um poder rival contesta a ascensão: guerra fria, sabotagem, disputa por territórios. Batalhas quando o jogador escolher lutar; política quando escolher negociar. As cidades e facções do mapa são o tabuleiro." },
      { nome: "Hegemonia", instrucao: "O confronto decisivo pelo domínio da região — militar, político ou econômico, conforme o estilo do jogador. Vitória estabelece a era do seu reinado; derrota abre reconstrução. Depois, governe em paz: o jogo continua como gestão viva." },
    ],
  },
  {
    id: "misterio",
    nome: "Mistério em Camadas",
    desc: "Uma investigação: pistas espalhadas, falsas respostas e uma revelação que recontextualiza tudo. Para quem gosta de descobrir.",
    etapas: [
      { nome: "O Fio Solto", instrucao: "Um acontecimento estranho abre a investigação (a missão principal). Estabeleça o cenário, os envolvidos e a primeira pista. Plante DESDE JÁ, discretamente, elementos da revelação final." },
      { nome: "Pistas", instrucao: "A investigação avança por camadas: cada pista responde algo e abre outra pergunta. Testemunhas com versões conflitantes, lugares que escondem segredos. Recompense a atenção do jogador." },
      { nome: "A Falsa Resposta", instrucao: "Uma explicação convincente se apresenta — e está errada (ou incompleta). Deixe o jogador agir sobre ela e descobrir a rachadura. A verdade dói mais que a mentira." },
      { nome: "Revelação", instrucao: "A verdade vem à tona recontextualizando pistas que o jogador JÁ viu (nada de fato novo tirado do bolso). O responsável, o porquê, o custo. Momento de impacto máximo." },
      { nome: "Acerto de Contas", instrucao: "As consequências da verdade: justiça, vingança, perdão ou encobrimento — escolha do jogador. Feche os destinos de cada envolvido. Epílogo e convite a um novo caso." },
    ],
  },
];

export function estruturaPorId(id) { return ESTRUTURAS.find((e) => e.id === id) || ESTRUTURAS[0]; }

/* Texto do arco para o prompt */
export function resumoHistoria(h) {
  if (!h || !h.estrutura) return "";
  const est = estruturaPorId(h.estrutura);
  const et = est.etapas[Math.min(h.etapa || 0, est.etapas.length - 1)];
  const prox = (h.etapa || 0) < est.etapas.length - 1;
  return `Arco: ${est.nome} · Momento atual: "${et.nome}" (${(h.etapa || 0) + 1}/${est.etapas.length}). DIREÇÃO DESTE MOMENTO: ${et.instrucao}${prox ? ` Quando o objetivo dramático deste momento se cumprir de forma satisfatória, envie "historia_avancar": true no JSON para avançar o arco (não tenha pressa — cada momento merece várias cenas).` : " Este é o momento FINAL do arco — conduza ao desfecho com peso."}`;
}

/* Texto das missões para o prompt */
export function resumoQuests(quests) {
  const ativas = (quests || []).filter((q) => q.status === "ativa");
  if (!ativas.length) return "Nenhuma missão ativa — crie a missão principal deste momento via \"quest_nova\".";
  return ativas.map((q) => `• [${q.tipo === "principal" ? "PRINCIPAL" : "secundária"}] ${q.titulo}${q.descricao ? ` — ${q.descricao}` : ""}${q.nota ? ` (última novidade: ${q.nota})` : ""}`).join("\n");
}
