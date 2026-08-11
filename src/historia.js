/* ============================================================
   ARCO DA CAMPANHA (v9.28) — a espinha dramática casada com o motor

   O ARCO existia desde cedo e envelheceu mal. Ele guardava uma
   estrutura ("Jornada do Herói") e um índice de etapa, e quem
   mexia nesse índice era o MESTRE, mandando "historia_avancar" no
   JSON quando achava que o momento tinha se cumprido.

   O estrago disso só ficou visível depois que o mundo ganhou motor
   (missões com etapas conferidas por código, relógios, nêmesis,
   eventos globais). O arco corria por opinião e o motor corria por
   fato — e os dois descolavam. O jogador estava em "O Abismo",
   com o Mestre instruído a narrar a derrota mais escura da
   campanha, enquanto o motor mostrava um mundo em que nada tinha
   acontecido ainda: primeira missão aberta, nenhum relógio, nêmesis
   inexistente. O Mestre então inventava o abismo do nada, e a
   história saía sem saber que rumo tomava.

   A cura é a mesma que curou as quests: TIRAR A DECISÃO DA IA.

   1) O ARCO ANDA POR MARCO, E MARCO É FATO. Missão concluída,
      relógio que encheu, evento global encerrado, nêmesis abatida.
      Coisas que o código já enxerga sozinho e que o jogador já
      viveu. O Mestre não avança arco — nem pede, nem sugere.

   2) NÃO SE ENTRA NO DESFECHO SEM ANTAGONISTA. A última etapa de
      toda estrutura manda conduzir ao confronto decisivo. Se não há
      nêmesis viva nem evento global em curso, essa instrução não
      tem objeto — e o Mestre inventa um. O arco segura na etapa
      anterior até o motor pôr alguém na mesa.

   3) A DIREÇÃO CITA AS PEÇAS QUE EXISTEM. O texto que vai ao Mestre
      não diz só "agora são as provações": diz com o que essas
      provações se fazem — a nêmesis que já caça, o relógio que já
      corre, a missão que o mundo já impôs. Assim o momento do arco
      e o estado do motor são a mesma frase.

   E O SPOILER. O nome da etapa nunca chega ao jogador. Saber que
   está em "Provações" é saber que ainda vem "O Abismo" — ele passa
   a esperar a derrota em vez de vivê-la. O jogador escolhe e vê o
   ARCO (a promessa: epopeia, investigação, reinado); o momento
   dentro dele é bastidor, e bastidor não vai para a tela.
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

/* ---------------- O QUE VALE COMO MARCO ----------------
   O peso mede quanto aquilo virou a história, não quanto trabalho deu.
   Uma missão de favor é uma tarde; a nêmesis morta é um capítulo. */
export const PESO_MARCO = {
  missao: 1,          // uma missão comum concluída
  missao_forcada: 3,  // principal, caçada, global, divina — o que o mundo impôs
  relogio: 2,         // um relógio chegou ao fim e a consequência caiu
  global: 4,          // o evento global se resolveu
  nemesis: 4,         // a nêmesis foi abatida
};
export function pesoDe(tipo) { return PESO_MARCO[tipo] || 0; }

/* O custo cresce: o primeiro momento de um arco vira com dois acontecimentos
   grandes; o penúltimo exige uma campanha inteira empurrando. Arco que anda
   rápido demais é o mesmo defeito de antes, só com outro juiz. */
export function custoDaEtapa(est, i) {
  const n = ((est && est.etapas) || []).length || 4;
  return 4 + Math.min(i, n - 2) * 2;
}

export function garantirHistoria(h) {
  const o = h && typeof h === "object" ? h : {};
  const est = estruturaPorId(o.estrutura);
  return {
    estrutura: est.id,
    etapa: Math.max(0, Math.min(Number(o.etapa) || 0, est.etapas.length - 1)),
    marcos: Math.max(0, Number(o.marcos) || 0),
    /* os últimos acontecimentos que empurraram o arco — é isso que o envelope
       da virada cita, para que a mudança de momento tenha causa visível */
    feitos: Array.isArray(o.feitos) ? o.feitos.slice(-6).map((x) => String(x).slice(0, 80)) : [],
  };
}

/* ---------------- O MOTOR VISTO PELO ARCO ----------------
   Um retrato pequeno do estado do mundo. O arco só precisa saber se há
   alguém contra quem terminar e o que está em jogo agora. */
export function temAntagonista(motor) {
  const m = motor || {};
  return !!(m.nemesis || m.global);
}

export function registrarMarco(h, tipo, rotulo = "") {
  const hh = garantirHistoria(h);
  const p = pesoDe(tipo);
  if (!p) return { historia: hh, ganhou: 0 };
  return {
    historia: { ...hh, marcos: hh.marcos + p, feitos: [...hh.feitos, rotulo || tipo].slice(-6) },
    ganhou: p,
  };
}

/* Pode virar de momento? Devolve o motivo quando não pode — o motivo não vai
   para a tela, mas vale para teste e para o modo criativo. */
export function podeVirar(h, motor = {}) {
  const hh = garantirHistoria(h);
  const est = estruturaPorId(hh.estrutura);
  const i = hh.etapa;
  const ultima = est.etapas.length - 1;
  if (i >= ultima) return { pode: false, motivo: "este já é o momento final do arco" };
  const custo = custoDaEtapa(est, i);
  if (hh.marcos < custo) return { pode: false, motivo: `faltam ${custo - hh.marcos} marcos`, falta: custo - hh.marcos };
  /* a regra 2: o desfecho precisa de alguém do outro lado */
  if (i + 1 >= ultima && !temAntagonista(motor)) {
    return { pode: false, motivo: "o desfecho não tem contra quem acontecer — nenhuma nêmesis viva, nenhum evento global em curso" };
  }
  return { pode: true, custo };
}

export function virarEtapa(h, motor = {}) {
  const hh = garantirHistoria(h);
  const est = estruturaPorId(hh.estrutura);
  const chk = podeVirar(hh, motor);
  if (!chk.pode) return { historia: hh, virou: false, motivo: chk.motivo };
  const etapa = hh.etapa + 1;
  /* o excedente atravessa: quem fecha três missões de uma vez não perde o
     empurrão da terceira só porque a segunda já tinha virado o momento */
  return {
    historia: { ...hh, etapa, marcos: Math.max(0, hh.marcos - chk.custo), feitos: [] },
    virou: true,
    de: est.etapas[hh.etapa],
    para: est.etapas[etapa],
    causas: hh.feitos.slice(),
  };
}

/* ---------------- O QUE O MESTRE RECEBE ----------------
   Direção do momento + as peças reais do motor, numa frase só. E a proibição
   dupla: não avançar o arco, e não contar ao jogador em que momento ele está. */
export function resumoHistoria(h, motor = {}) {
  const hh = garantirHistoria(h);
  const est = estruturaPorId(hh.estrutura);
  const i = hh.etapa;
  const et = est.etapas[i];
  const ultima = i >= est.etapas.length - 1;
  const pecas = [];
  if (motor.nemesis) pecas.push(`a nêmesis ${motor.nemesis}, que já caça o herói`);
  if (motor.global) pecas.push(`o evento global "${motor.global}", que engole a região`);
  if ((motor.impostas || []).length) pecas.push(`o que o mundo impôs: ${motor.impostas.join(", ")}`);
  if ((motor.relogios || []).length) pecas.push(`relógios correndo: ${motor.relogios.join(", ")}`);
  return `ARCO DA CAMPANHA: ${est.nome} · momento interno "${et.nome}"${ultima ? " — o último" : ""}.
DIREÇÃO DESTE MOMENTO: ${et.instrucao}
${pecas.length
    ? `AS PEÇAS QUE JÁ ESTÃO NA MESA — é COM ELAS que este momento se cumpre, não com material novo: ${pecas.join("; ")}. Puxe daqui antes de inventar.`
    : "NÃO HÁ PEÇA GRANDE NA MESA AINDA: use este momento para plantar uma (ofereça trabalho, apresente gente, deixe uma ameaça se insinuar). Não anuncie clímax nem catástrofe que não tenha contra quem acontecer."}
DUAS PROIBIÇÕES: (1) você NÃO avança o arco e não pede para avançá-lo — quem move o momento é o SISTEMA, quando as missões, relógios e ameaças acima se resolverem de fato; (2) NUNCA diga ao jogador em que momento do arco ele está, nem pelo nome ("as provações começaram"), nem por sinônimo ("é a hora mais escura", "o último ato"). Isso é bastidor: para ele existe só a história acontecendo.`;
}

export function envelopeDeVirada(r) {
  if (!r || !r.virou) return "";
  const causas = (r.causas || []).filter(Boolean).slice(-4);
  return `[A HISTÓRIA VIROU — RECONHECIDO PELO SISTEMA] O arco saiu de "${r.de.nome}" e entrou em "${r.para.nome}". Isso não foi decisão sua nem minha: o sistema contou o que EU já resolvi${causas.length ? ` (${causas.join("; ")})` : ""} e o peso disso mudou o momento da campanha.
A DIREÇÃO A PARTIR DE AGORA: ${r.para.instrucao}
Mude o tom aos poucos, a partir da cena atual — sem recomeço, sem resumo do que passou, sem anúncio. E NÃO me diga que a história mudou de momento nem como esse momento se chama: eu devo sentir isso pelo que acontece, não ler o nome.`;
}

/* Texto das missões antigas para o prompt (era "quest"; sobrevive só para os
   saves anteriores ao sistema de etapas — quem manda hoje é missoes.js). */
export function resumoQuests(quests) {
  const ativas = (quests || []).filter((q) => q.status === "ativa");
  if (!ativas.length) return "";
  return `MISSÕES ANTIGAS (de antes do sistema de etapas — só o jogador as encerra; não as conclua nem as pague):
${ativas.map((q) => `• [${q.tipo === "principal" ? "PRINCIPAL" : "secundária"}] ${q.titulo}${q.descricao ? ` — ${q.descricao}` : ""}${q.nota ? ` (última novidade: ${q.nota})` : ""}`).join("\n")}`;
}
