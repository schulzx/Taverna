/* ============================================================
   O TERMÔMETRO (v9.202) — ler o jogador, não só a posição

   Quarto órgão do diretor de histórias, e o coração do AI Director na
   versão desta casa. O compasso sabe ONDE a onda está; o Termômetro sabe
   COMO o jogador chega nela. Ele não decide nada sozinho e NÃO muda a
   ordem da onda — muda o FÔLEGO: alonga o respiro de quem sangra,
   apressa a subida de quem passeia.

   ---------------- NÃO É A TEMPERATURA DA MESA ----------------

   `mestria.js` já tem uma temperatura, e é outra coisa: uma leitura
   TÁTICA de cinco turnos (houve dado? perigo? luta?) que governa se o
   mestre concede um teste. O Termômetro é de escala de CAMPANHA: trinta
   e seis sinais sobre o estado do jogador — corpo, bolso, laço, mundo,
   glória — que dizem se ele está afogando ou passeando. As duas convivem
   sem se tocar: uma cuida do dado do turno, a outra do fôlego do arco.

   ---------------- A LEI ----------------

   O Termômetro lê FATOS, nunca a sorte futura. Não existe "deixar errar
   de propósito" nem dado viciado: a dificuldade continua honesta
   (dificuldade.js segue sendo o juiz). O que muda é O QUE O MUNDO PÕE NA
   MESA — o fôlego da onda, o tempero do assunto —, nunca o resultado do
   que o jogador tenta.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova. O módulo recebe um SNAPSHOT de dados simples (o App o
   monta dos refs) e devolve a leitura e o fôlego. Assim as trinta e seis
   contas se provam em Node com estados sintéticos, sem precisar do jogo.
   ============================================================ */

/* ---------------- OS 36 SINAIS, EM OITO EIXOS ----------------
   Cada sinal lê um campo do snapshot e tem um POLO: −1 puxa para o
   afogado (o mundo devia aliviar), +1 para o folgado (o mundo pode
   apertar), 0 é de rumo ou de mesa — informa o Encalhe e o tempero, não
   o fôlego. O peso diz quanto ele pesa na conta. */
const S = (id, eixo, peso, polo, quando, diz) => ({ id, eixo, peso, polo, quando, diz });

export const SINAIS = [
  /* ---- FORTUNA: a maré de vitória e derrota (6) ---- */
  S("vitorias_limpas", "fortuna", 2, +1, (s) => (s.vitoriasSeguidas || 0) >= 3, "vitórias seguidas sem ferida grave"),
  S("derrotas_seguidas", "fortuna", 3, -1, (s) => (s.derrotasSeguidas || 0) >= 2, "derrotas ou fugas seguidas"),
  S("falha_repetida", "fortuna", 2, -1, (s) => (s.falhasNoMesmo || 0) >= 3, "falhas repetidas no mesmo obstáculo"),
  S("critico_decisivo", "fortuna", 1, +1, (s) => !!s.criticoRecente, "um crítico decisivo há pouco"),
  S("morte_por_um_fio", "fortuna", 2, -1, (s) => !!s.mortePorUmFio, "morte evitada por um fio"),
  S("tombou", "fortuna", 3, -1, (s) => !!s.tombamentoRecente, "tombamento recente"),

  /* ---- CORPO (5) ---- */
  S("pv_baixo", "corpo", 3, -1, (s) => (s.fracaoPV != null && s.fracaoPV <= 0.35), "o herói no vermelho"),
  S("grupo_ferido", "corpo", 2, -1, (s) => (s.fracaoGrupo != null && s.fracaoGrupo <= 0.5), "o grupo em mau estado"),
  S("sem_cura", "corpo", 2, -1, (s) => (s.curasRestantes != null && s.curasRestantes === 0), "sem poção nem cura na bolsa"),
  S("exausto", "corpo", 1, -1, (s) => (s.exaustao || 0) >= 2, "exaustão acumulada"),
  S("sem_descanso", "corpo", 1, -1, (s) => (s.diasSemDescanso || 0) >= 4, "dias sem descanso longo"),

  /* ---- BOLSO (4) ---- */
  S("bolso_vazio", "bolso", 2, -1, (s) => !!s.bolsoApertado, "moedas abaixo do custo de vida do patamar"),
  S("dividido", "bolso", 2, -1, (s) => !!s.dividaAtiva, "dívida ativa com o cobrador"),
  S("sem_ganho", "bolso", 1, -1, (s) => (s.diasSemGanho || 0) >= 5, "dias sem ganho nenhum"),
  S("tesouro_novo", "bolso", 1, +1, (s) => !!s.tesouroRecente, "um tesouro grande recém-obtido"),

  /* ---- LAÇO: o que dói e o que aquece (6) ---- */
  S("comp_grave", "laco", 2, -1, (s) => !!s.companheiroGrave, "companheiro em estado grave"),
  S("comp_morto", "laco", 3, -1, (s) => !!s.companheiroMortoRecente, "companheiro morto há pouco"),
  S("laco_ameacado", "laco", 2, -1, (s) => !!s.vinculoAltoAmeacado, "vínculo alto sob ameaça"),
  S("npc_morto", "laco", 1, -1, (s) => !!s.npcConhecidoMorto, "um NPC conhecido morto"),
  S("lar_em_guerra", "laco", 2, -1, (s) => !!s.cidadeOrigemEmGuerra, "a cidade de origem em guerra ou tomada"),
  S("traido", "laco", 3, -1, (s) => !!s.traicaoRecente, "traição sofrida há pouco"),

  /* ---- RUMO: alimenta também o Encalhe (5) — polo 0 no fôlego ---- */
  S("principal_parada", "rumo", 0, 0, (s) => (s.diasSemPrincipal || 0) >= 5, "dias sem tocar a missão principal"),
  S("missoes_demais", "rumo", 0, 0, (s) => (s.missoesAbertas || 0) > (s.tetoMissoes || 6), "missões abertas acima do teto"),
  S("longe_do_marco", "rumo", 0, 0, (s) => (s.marcosAteProximo || 0) >= 3, "longe do próximo marco da saga"),
  S("parado_na_cidade", "rumo", 0, 0, (s) => (s.diasNaMesmaCidade || 0) >= 4, "muitos dias na mesma cidade, sem ação nova"),
  S("vespera_ignorada", "rumo", 0, 0, (s) => (s.vesperasIgnoradas || 0) >= 2, "vésperas ignoradas seguidas"),

  /* ---- MUNDO: a pressão externa (5) ---- */
  S("relogio_quase", "mundo", 2, -1, (s) => (s.relogioMaisAlto != null && s.relogioMaisAlto >= 0.66), "um relógio além de dois terços"),
  S("guerra", "mundo", 2, -1, (s) => !!s.guerraAtiva, "guerra ativa envolvendo o jogador"),
  S("vilao_avancado", "mundo", 1, -1, (s) => (s.faseVilao || 0) >= 3, "o vilão fundo no plano dele"),
  S("evento_global", "mundo", 1, -1, (s) => !!s.eventoGlobal, "um evento global em curso"),
  S("estacao_dura", "mundo", 1, -1, (s) => !!s.estacaoDura, "estação dura — inverno, seca"),

  /* ---- GLÓRIA (3) ---- */
  S("subiu_fama", "gloria", 2, +1, (s) => !!s.famaSubiuPatamar, "a fama subiu um patamar há pouco"),
  S("titulo_novo", "gloria", 1, +1, (s) => !!s.tituloNovo, "um título novo diante de gente"),
  S("primeira_conquista", "gloria", 2, +1, (s) => !!s.primeiraConquista, "a primeira conquista de cidade ou domínio"),

  /* ---- MESA: metajogo, leve (2) — polo 0 ---- */
  S("sessoes_curtas", "mesa", 0, 0, (s) => (s.sessoesCurtasSeguidas || 0) >= 2, "sessões curtas seguidas"),
  S("voltou_de_pausa", "mesa", 0, 0, (s) => !!s.voltouDeResumo, "voltou de uma pausa longa, com resumo"),
];

export const EIXOS = ["fortuna", "corpo", "bolso", "laco", "rumo", "mundo", "gloria", "mesa"];
export const sinalPorId = (id) => SINAIS.find((x) => x.id === id) || null;
export const sinaisDoEixo = (eixo) => SINAIS.filter((x) => x.eixo === eixo);

/* ---------------- AS CINCO LEITURAS ----------------
   Da conta ponderada dos sinais ativos sai um escore: muito negativo é
   Afogando; muito positivo é Passeando; o meio saudável é Firme. As
   faixas são fixas e a ordem é o conteúdo, como toda tabela desta casa. */
export const LEITURAS = [
  { id: "afogando", nome: "Afogando", de: -99, ate: -5, diz: "maré contra, corpo no limite, laço ferido",
    folego: { respiro: +3, subida: +1, climax: 0 }, tempero: "mao_estendida",
    aoMundo: "o respiro alonga e o clímax espera (nunca some); a semente da onda vira mão estendida — ajuda com preço, não esmola; nenhum relógio novo nasce" },
  { id: "sangrando", nome: "Sangrando", de: -5, ate: -2, diz: "ferido, mas de pé",
    folego: { respiro: +1, subida: 0, climax: 0 }, tempero: "vespera_forte",
    aoMundo: "a véspera ganha ênfase — COMO chegar importa mais que nunca; a dificuldade avisa e a pauta reforça rotas alternativas" },
  { id: "firme", nome: "Firme", de: -2, ate: 3, diz: "o meio saudável do jogo",
    folego: { respiro: 0, subida: 0, climax: 0 }, tempero: "",
    aoMundo: "a onda corre no passo de tabela — firmeza não é sinal para mexer" },
  { id: "folgado", nome: "Folgado", de: 3, ate: 6, diz: "vencendo com sobra",
    folego: { respiro: 0, subida: -1, climax: 0 }, tempero: "preco_cobra",
    aoMundo: "a subida encurta e o preço da onda cobra de verdade; o vilão aproveita, e o avanço dele fica visível na pauta" },
  { id: "passeando", nome: "Passeando", de: 6, ate: 99, diz: "sem risco, sem custo, há dias",
    folego: { respiro: -1, subida: -1, climax: 0 }, tempero: "prateleira_pesada",
    aoMundo: "a próxima onda nasce um degrau acima e o assunto sorteia da prateleira pesada; um relógio novo com rosto pode nascer — com causa, aviso e saída" },
];
export const leituraPorId = (id) => LEITURAS.find((l) => l.id === id) || null;

/* ---------------- A LEITURA ----------------
   Soma peso×polo dos sinais ativos. Devolve a leitura, o escore e a lista
   do que pesou — os três, sempre, porque um rótulo sem a conta é número
   mágico, e o autor precisa saber por que o mundo afrouxou. */
export function lerTermometro(snapshot) {
  const s = snapshot && typeof snapshot === "object" ? snapshot : {};
  let escore = 0;
  const ativos = [];
  for (const sin of SINAIS) {
    let liga = false;
    try { liga = !!sin.quando(s); } catch { liga = false; }
    if (!liga) continue;
    ativos.push({ id: sin.id, eixo: sin.eixo, polo: sin.polo, peso: sin.peso, diz: sin.diz });
    escore += sin.peso * sin.polo;
  }
  const leitura = LEITURAS.find((l) => escore >= l.de && escore < l.ate) || leituraPorId("firme");
  return { leitura: leitura.id, nome: leitura.nome, escore, folego: leitura.folego, tempero: leitura.tempero, aoMundo: leitura.aoMundo, ativos };
}

/* ---------------- O FÔLEGO PARA O COMPASSO ----------------
   O mapa de ajuste por movimento que `avancarCompasso` aplica à duração.
   Alonga o respiro de quem afoga, encurta a subida de quem passeia — e
   NUNCA mexe na ordem dos movimentos, só em quantos turnos cada um dura. */
export function folegoDaLeitura(leituraId) {
  const l = leituraPorId(leituraId);
  return l ? { ...l.folego } : { respiro: 0, subida: 0, climax: 0 };
}

/* ---------------- PARA O CONSOLE DE AUTOR ---------------- */
export function resumoDoTermometro(snapshot) {
  const r = lerTermometro(snapshot);
  return { leitura: r.leitura, escore: r.escore, sinais: r.ativos.length };
}
