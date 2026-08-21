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
    desc: "Uma epopeia pessoal: um herói, um mundo que muda com ele, e um preço que ninguém escapa de pagar. Do tamanho de uma vida.",
    etapas: [
      { nome: "O Chamado", instrucao: "Estabeleça o mundo comum do herói e faça surgir UM chamado claro à aventura (a missão principal). Semeie o que estará em jogo. Cenas de apresentação, vínculos e o incidente que muda tudo." },
      { nome: "A Travessia", instrucao: "O herói deixa o mundo conhecido. Apresente aliados, rivais e as regras do mundo novo. Missões secundárias apresentam facções e lugares. A ameaça principal se mostra à distância." },
      { nome: "Provações", instrucao: "Desafios crescentes testam o herói e o grupo. Vitórias parciais e custos reais. Aprofunde vínculos com companheiros. O antagonista se torna pessoal." },
      { nome: "O Abismo", instrucao: "O momento mais escuro: uma derrota, perda ou revelação que abala o herói. Tudo parece perdido. Prepare AQUI as sementes da virada — nada de resgate fácil." },
      { nome: "A Transformação", instrucao: "O herói se reergue diferente: nova compreensão, aliança inesperada ou poder conquistado com custo. O caminho para o confronto final se abre." },
      { nome: "O Retorno", instrucao: "Clímax e desfecho: o confronto decisivo com o que foi construído a campanha inteira, e as consequências. Feche os fios abertos. Depois do fim, um epílogo em paz — e pare aí: o silêncio depois do fim é parte do fim, e quem decide se há outro capítulo é o jogador, não você." },
    ],
  },
  {
    id: "arquipelago",
    nome: "Arquipélago",
    desc: "Muitas histórias ao mesmo tempo, cada uma com gente e dramas próprios. Você escolhe onde estar, e o que deixa para trás continua acontecendo.",
    etapas: [
      { nome: "As Ilhas", instrucao: "Estabeleça 2-3 arcos INDEPENDENTES (lugares, facções ou personagens com dramas próprios), cada um com sua missão. O jogador escolhe livremente qual visitar; nenhum é 'o principal' ainda. Deixe cada ilha com identidade forte." },
      { nome: "Correntes", instrucao: "Sinais de que as ilhas se tocam: um nome que aparece em dois lugares, um objeto que viaja, um interesse comum. Não force a conexão — deixe o jogador percebê-la. Aprofunde o arco que ele mais frequenta." },
      { nome: "Convergência", instrucao: "As histórias se entrelaçam de verdade: os arcos revelam ser partes de um quadro maior (sem invalidar o que cada um era). As escolhas do jogador em cada ilha agora pesam nas outras." },
      { nome: "A Maré", instrucao: "Clímax que reúne os fios: o desfecho depende do que o jogador construiu em cada arco. Amarre as pontas e mostre como cada ilha termina. Depois, epílogo — e pare aí: não convide para um novo mar, não é sua a decisão." },
    ],
  },
  {
    id: "reinado",
    nome: "Ascensão do Reino",
    desc: "Terra, gente e poder. Para quem prefere a mesa de mapas à estrada — e descobre que governar cobra mais que lutar.",
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
    desc: "Alguma coisa aconteceu, e a explicação não fecha. Para quem prefere entender a vencer — e aguenta descobrir que estava enganado.",
    etapas: [
      { nome: "O Fio Solto", instrucao: "Um acontecimento estranho abre a investigação (a missão principal). Estabeleça o cenário, os envolvidos e a primeira pista. Plante DESDE JÁ, discretamente, elementos da revelação final." },
      { nome: "Pistas", instrucao: "A investigação avança por camadas: cada pista responde algo e abre outra pergunta. Testemunhas com versões conflitantes, lugares que escondem segredos. Recompense a atenção do jogador." },
      { nome: "A Falsa Resposta", instrucao: "Uma explicação convincente se apresenta — e está errada (ou incompleta). Deixe o jogador agir sobre ela e descobrir a rachadura. A verdade dói mais que a mentira." },
      { nome: "Revelação", instrucao: "A verdade vem à tona recontextualizando pistas que o jogador JÁ viu (nada de fato novo tirado do bolso). O responsável, o porquê, o custo. Momento de impacto máximo." },
      { nome: "Acerto de Contas", instrucao: "As consequências da verdade: justiça, vingança, perdão ou encobrimento — escolha do jogador. Feche os destinos de cada envolvido. Epílogo — e pare aí: não ofereça um novo caso, quem decide se há outro é o jogador." },
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
    /* v9.84: O CAPÍTULO. O arco de um vilão tem começo, meio e fim — e o
       fim dele é o fim de um capítulo, não da campanha. Guardar o número e
       a lista dos que já fecharam é a porta que o sistema de capítulos vai
       usar: começar de novo no mesmo mundo, anos depois, antes, ou durante. */
    capitulo: Math.max(1, Number(o.capitulo) || 1),
    capitulos: Array.isArray(o.capitulos) ? o.capitulos.slice(-12) : [],
  };
}

/* ============================================================
   O ARCO ANDA COM O VILÃO (v9.84)

   Até aqui o arco andava por CONTAGEM: cada missão concluída, relógio
   cheio ou ameaça abatida somava marcos, e a cada tanto de marcos o
   momento virava. Funcionava como termômetro de atividade — e é
   exatamente isso que ele era: um jogador que fizesse vinte favores
   pequenos chegava ao Abismo sem nunca ter tido contra quem.

   O arco de uma história não anda porque o herói andou. Anda porque o
   ANTAGONISTA andou. As duas peças passam a ser uma só: a fase do vilão
   é o momento do arco.

   E os marcos não somem: eles continuam contando enquanto NÃO HÁ vilão,
   porque o começo de uma campanha é mesmo feito de andar. O que eles não
   podem mais é levar a história ao desfecho sozinhos — daí o teto.
   ============================================================ */

/* Sem antagonista, o arco não passa da metade. A regra 2 do arquivo já
   dizia isso do último momento; agora vale para a segunda metade
   inteira, porque "O Abismo" sem ninguém do outro lado é tão vazio
   quanto "O Retorno". */
export function tetoSemVilao(est) {
  /* O piso de 1 existe porque o começo de uma campanha É mesmo feito de
     andar: sem ele, uma estrutura de quatro momentos travava no primeiro
     até o vilão nascer — e o vilão só nasce depois de a fama crescer. */
  return Math.max(1, Math.ceil((est.etapas.length - 1) / 2) - 1);
}

/* A fase do vilão vira o momento do arco. Seis fases, N momentos: a
   conta é proporcional, e o arco NUNCA anda para trás — se os marcos já
   tinham levado a história adiante, ela fica onde estava. */
export function etapaDoVilao(est, ordemDaFase) {
  const n = est.etapas.length;
  return Math.max(0, Math.min(n - 1, Math.round((Number(ordemDaFase) || 0) / 5 * (n - 1))));
}

export function casarComVilao(h, ordemDaFase) {
  const hh = garantirHistoria(h);
  const est = estruturaPorId(hh.estrutura);
  const alvo = etapaDoVilao(est, ordemDaFase);
  if (alvo <= hh.etapa) return { historia: hh, virou: false };
  return {
    historia: { ...hh, etapa: alvo, marcos: 0, feitos: [] },
    virou: true,
    de: est.etapas[hh.etapa],
    para: est.etapas[alvo],
    causas: hh.feitos.slice(),
    porVilao: true,
  };
}

/* ============================================================
   O FIM DO CAPÍTULO

   "O sistema de vilão deve ser tão bem elaborado que o fim do arco dele
   será o fim do capítulo."

   O capítulo fecha quando as duas coisas se encontram: o vilão caiu E o
   arco chegou ao último momento. Uma sem a outra não fecha nada — matar
   o vilão no meio não existe (o sistema não deixa), e chegar ao último
   momento sem derrubá-lo é o clímax por acontecer.
   ============================================================ */
export function capituloFechado(h, vilaoCaiu) {
  const hh = garantirHistoria(h);
  const est = estruturaPorId(hh.estrutura);
  return !!vilaoCaiu && hh.etapa >= est.etapas.length - 1;
}

export function fecharCapitulo(h, { vilao = null, dia = 0, causa = "" } = {}) {
  const hh = garantirHistoria(h);
  const est = estruturaPorId(hh.estrutura);
  const registro = {
    n: hh.capitulo,
    estrutura: est.id,
    vilao: (vilao && vilao.nome) || "",
    titulo: (vilao && vilao.titulo) || "",
    fechadoEm: dia,
    causa: String(causa || "").slice(0, 120),
    feitos: hh.feitos.slice(),
  };
  return {
    historia: { ...hh, capitulos: [...hh.capitulos, registro].slice(-12), fechado: true },
    registro,
  };
}

/* A porta: começar o próximo. O MUNDO fica — cidades, gente, mapa,
   cânone. O que reinicia é a espinha dramática, e o herói pode ser o
   mesmo ou outro, anos depois, antes, ou durante. */
/* ============================================================
   AS TRÊS FORMAS DE COMEÇAR DE NOVO (v9.90)

   "O player pode recomeçar a campanha começando um novo capítulo, tipo as
   campanhas de Vox Machina — pode tanto começar um novo capítulo quanto
   criar uma nova campanha no mesmo mundo, anos depois ou antes, ou até
   durante."

   As três guardam a MESMA coisa e mudam quem olha para ela: o mundo fica.
   Cidades, gente, mapa, cânone, o que foi descoberto e o que foi
   destruído — nada disso se apaga, porque é exatamente isso que separa um
   capítulo novo de uma campanha nova.

   `quem` diz se o herói continua ou se outro assume. `tempo` diz para
   onde o relógio anda. E `canoneTravado` é a única das três que mexe na
   regra do jogo: numa história que acontece ANTES do fim da anterior, o
   desfecho já está escrito, e nada do que o jogador fizer pode impedi-lo.
   É a regra do prólogo, e é o que a torna interessante em vez de confusa.
   ============================================================ */
export const FORMAS_DE_CAPITULO = [
  {
    id: "depois", rotulo: "Anos depois", quem: "mesmo", tempo: "adiante",
    anosPadrao: 5, canoneTravado: false,
    diz: "o mesmo herói, mais velho, num mundo que andou sem ele",
    porque: "é a forma mais simples e a que mais rende: o jogador volta com a mesma ficha, as mesmas cicatrizes e as mesmas dívidas, e encontra as consequências do que fez esperando por ele",
  },
  {
    id: "outro", rotulo: "Outra pessoa", quem: "novo", tempo: "agora",
    anosPadrao: 0, canoneTravado: false,
    diz: "alguém que vivia neste mundo o tempo todo, e cuja história começa onde a outra terminou",
    porque: "o herói anterior vira lenda de taverna, e nada é mais poderoso num mundo do que descobrir de fora quem foi a pessoa que você era",
  },
  {
    id: "durante", rotulo: "Antes do fim", quem: "novo", tempo: "atras",
    anosPadrao: 0, canoneTravado: true,
    diz: "uma história que aconteceu enquanto a outra acontecia — e cujo desfecho você já conhece",
    porque: "a graça do prólogo é saber o fim: cada vitória tem gosto de adiamento e cada aviso chega tarde, e isso só funciona porque o sistema NÃO deixa o passado ser reescrito",
  },
];
export function formaDeCapitulo(id) { return FORMAS_DE_CAPITULO.find((f) => f.id === id) || FORMAS_DE_CAPITULO[0]; }

/* Quantos dias o relógio anda. Para trás, ele volta a um ponto ANTES do
   fim do capítulo que acabou — nunca antes do começo dele, ou a história
   nova não teria como cruzar com a que já foi contada. */
export function diaDoCapitulo(reg, forma, { dia = 0, anos = 0 } = {}) {
  const f = formaDeCapitulo(forma);
  const fim = Math.max(1, Number((reg && reg.fechadoEm) || dia) || 1);
  if (f.tempo === "adiante") return fim + Math.max(1, Math.round((Number(anos) || f.anosPadrao) * 360));
  if (f.tempo === "atras") return Math.max(1, Math.round(fim * 0.55));
  return fim;
}

export function abrirCapitulo(h, { estrutura = null, forma = "depois", dia = 0, anos = 0 } = {}) {
  const hh = garantirHistoria(h);
  const f = formaDeCapitulo(forma);
  const reg = hh.capitulos[hh.capitulos.length - 1] || null;
  return {
    ...hh,
    estrutura: estrutura ? estruturaPorId(estrutura).id : hh.estrutura,
    etapa: 0, marcos: 0, feitos: [],
    capitulo: hh.capitulo + 1,
    fechado: false,
    /* o capítulo lembra de COMO nasceu: é o que permite ao prompt tratar
       um prólogo como prólogo pelo resto dele, e não só na primeira cena */
    forma: f.id,
    canoneTravado: !!f.canoneTravado,
    dia: diaDoCapitulo(reg, f.id, { dia, anos }),
  };
}

/* O que o Mestre recebe ao ABRIR — o irmão do envelope que fecha. Ele é
   longo por uma razão: é a única fala do sistema em toda a campanha que
   precisa reconstruir o chão inteiro debaixo do jogador. */
export function envelopeDoNovoCapitulo(reg, forma, { anos = 0, heroiAnterior = "", cidade = "" } = {}) {
  const f = formaDeCapitulo(forma);
  const antes = reg && reg.vilao ? `${reg.vilao}${reg.titulo ? `, ${reg.titulo}` : ""}` : "a ameaça anterior";
  const onde = cidade ? ` Estou em ${cidade}.` : "";

  if (f.id === "depois") {
    const n = Math.max(1, Number(anos) || f.anosPadrao);
    return `[UM TEMPO DEPOIS — ABERTURA DO SISTEMA] Passaram-se ${n} ${n === 1 ? "ano" : "anos"} desde que ${antes} caiu. Sou o mesmo, mais velho.${onde}
REGRA DESTE ENVELOPE (obrigatória): abra com o MUNDO, não comigo. Mostre em duas ou três frases o que ${n} ${n === 1 ? "ano" : "anos"} fizeram com este lugar — o que cresceu, o que ruiu, quem morreu de velho, o que virou rotina. Só então me ponha na cena, e me ponha fazendo alguma coisa comum.
NÃO resuma o capítulo anterior, NÃO me faça lembrar em voz alta e NÃO abra ameaça nova nesta cena: o que vem por aí é do sistema, e ele ainda não disse nada. Termine com a palavra comigo.`;
  }
  if (f.id === "outro") {
    return `[OUTRA PESSOA, NESTE MESMO MUNDO — ABERTURA DO SISTEMA] Não sou mais quem eu era: sou outra pessoa, e este mundo é o mesmo.${onde}${heroiAnterior ? ` ${heroiAnterior} existiu de verdade aqui, e o que ${heroiAnterior} fez é história — eu posso ter ouvido falar, e provavelmente ouvi a versão errada.` : ""}
REGRA DESTE ENVELOPE (obrigatória): trate o herói anterior como LENDA, não como conhecido: gente comenta, exagera, discorda e erra o nome. Eu não o conheço pessoalmente e não tenho nada dele. Abra pequeno — o meu dia, o meu ofício, o meu problema —, e deixe o mundo grande do lado de fora.
NÃO me dê o passado dele, NÃO me faça herdeiro de nada e NÃO comece com uma missão. Termine com a palavra comigo.`;
  }
  return `[ANTES DO FIM — ABERTURA DO SISTEMA] Esta história acontece ENQUANTO a outra acontecia, e eu sou outra pessoa.${onde} O que já está escrito não muda: ${antes} ${reg && reg.causa ? `cai no fim desta linha do tempo — ${reg.causa}` : "ainda vai cair, no fim desta linha do tempo"}, e nada do que eu fizer aqui pode impedir isso.
REGRA DESTE ENVELOPE (obrigatória, e esta é a regra do prólogo): o desfecho é FATO. Eu posso vencer batalhas, salvar gente e mudar tudo o que o registro não escreveu — mas nada do que eu conquistar pode desfazer o que já foi contado. Se a minha ação for na direção de impedir o inevitável, ela custa caro e chega tarde: mostre o preço, não o milagre.
NÃO me deixe matar quem já morreu depois, NÃO me deixe salvar quem já se perdeu, e NÃO diga que estou num prólogo — para mim isto é o presente. Termine com a palavra comigo.`;
}

export function linhaDoNovoCapitulo(n, forma) {
  const f = formaDeCapitulo(forma);
  return `📖 Capítulo ${n} — ${f.rotulo.toLowerCase()}.`;
}

export function linhaDoCapitulo(reg) {
  if (!reg) return "";
  return `📖 Fim do capítulo ${reg.n}.`;
}

export function envelopeDoCapitulo(reg, est) {
  if (!reg) return "";
  return `[FIM DE CAPÍTULO — RECONHECIDO PELO SISTEMA] O que começou com ${reg.vilao ? `a sombra de ${reg.vilao}` : "a primeira ameaça desta história"} terminou${reg.causa ? ` — ${reg.causa}` : ""}. Este foi o capítulo ${reg.n} desta campanha.
REGRA DESTE ENVELOPE (obrigatória): narre um EPÍLOGO, não um resumo. Duas ou três cenas curtas do que ficou: quem respira aliviado, o que não volta ao que era, o que o herói faz na primeira manhã em que não há ninguém atrás dele. Feche os fios que este capítulo abriu.
NÃO anuncie um novo vilão, NÃO plante uma ameaça nova e NÃO diga a palavra "capítulo": para o jogador isto é a história respirando, não uma estrutura. E NÃO pergunte o que ele quer fazer agora — o silêncio depois do fim é parte do fim.`;
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
  /* v9.84: A REGRA 2 VALE PARA A SEGUNDA METADE INTEIRA. Ela já protegia o
     último momento — "O Retorno" sem ninguém do outro lado não é desfecho.
     Mas "O Abismo" sem antagonista é igualmente vazio, e um jogador que
     fizesse vinte favores pequenos chegava lá pela contagem, sem nunca ter
     tido contra quem. Daqui para cima, quem move o arco é o VILÃO. */
  if (i + 1 > tetoSemVilao(est) && !temAntagonista(motor)) {
    return { pode: false, motivo: "a segunda metade da história não tem contra quem acontecer — nenhum vilão em curso, nenhum evento global" };
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
  /* v9.84: O NOME DA ETAPA NÃO SOBE MAIS. Ele ia como `momento interno
     "O Abismo"` — e uma IA que sabe que está no Abismo escreve como quem
     sabe: anuncia o tom, antecipa a queda, escolhe as palavras do rótulo.
     A proibição de contar ao jogador já existia e não bastava, porque o
     vazamento não é dizer o nome: é escrever a etiqueta em vez da cena.
     Vai só a DIREÇÃO, que é o que ela precisa para narrar. */
  return `ARCO DA CAMPANHA: ${est.nome}${ultima ? " — e este é o momento final" : ""}.
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
