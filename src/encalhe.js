/* ============================================================
   O ENCALHE (v9.205) — o sábio percebe o aluno perdido

   Sétimo e último órgão do diretor de histórias. Conduzir pelo caminho
   certo exige notar quando o jogador está parado, perdido ou evitando. A
   resposta NUNCA é dica de IA — é o mundo ir buscá-lo com um motivo
   verdadeiro, que o tramas.js já sabe encenar. Quatro degraus, do
   sussurro à consequência, e cada intervenção respeita a ficção.

   ---------------- A LEI ----------------

   Explorar livremente NÃO é encalhe: os sinais medem REPETIÇÃO VAZIA,
   nunca curiosidade. A escada sobe um degrau por vez, com dias entre
   eles, e desce ao primeiro movimento do jogador. E o degrau 4 nunca
   pune: só cobra o que os relógios e as ofertas já prometiam em tela.

   ---------------- SEPARADO DO DESENHO ----------------

   Conta se prova. O módulo lê um snapshot e diz se há encalhe e qual
   intervenção cabe; o App monta o snapshot, sobe a escada no ritmo dos
   dias e encena a intervenção. Vários sinais são os mesmos do eixo RUMO
   do Termômetro — a mesma leitura serve aos dois, cada um a seu fim.
   ============================================================ */

/* ---------------- OS 18 SINAIS DE ENCALHE ----------------
   Cada um lê repetição ou vazio — nunca exploração. */
const S = (id, quando, diz) => ({ id, quando, diz });

export const SINAIS = [
  S("principal_parada", (s) => (s.diasSemPrincipal || 0) >= 5, "a missão principal, intocada há dias"),
  S("mesma_cidade", (s) => (s.diasNaMesmaCidade || 0) >= 4, "a mesma cidade, sem ação nova, há dias"),
  S("missoes_demais", (s) => (s.missoesAbertas || 0) > (s.tetoMissoes || 6), "missões abertas acima do teto"),
  S("so_descanso", (s) => (s.turnosSoDescanso || 0) >= 3, "só descanso e passagem de tempo"),
  S("conversa_em_circulo", (s) => (s.conversaEmCirculo || 0) >= 3, "conversa em círculo com o mesmo NPC"),
  S("impossivel_ignorado", (s) => (s.impossivelIgnorado || 0) >= 2, "um veredito Impossível ignorado duas vezes"),
  S("vai_e_volta", (s) => !!s.vaiEVoltaSemChegar, "vai-e-volta geográfico sem chegar"),
  S("relogio_sem_reacao", (s) => !!s.relogioQuaseSemReacao, "um relógio quase cheio, sem reação"),
  S("diario_parado", (s) => (s.diasSemDiario || 0) >= 5, "o diário sem entrada nova há dias"),
  S("falha_repetida", (s) => (s.falhasNoMesmo || 0) >= 3, "três falhas no mesmo obstáculo"),
  S("ganchos_recusados", (s) => (s.ganchosRecusados || 0) >= 3, "três ganchos recusados seguidos"),
  S("ouro_parado", (s) => !!s.ouroAltoParado, "ouro alto parado, sem gasto"),
  S("bolsa_lotada", (s) => !!s.inventarioLotadoSemMercado, "inventário lotado sem visitar mercado"),
  S("sem_marco", (s) => (s.sessoesSemMarco || 0) >= 3, "nenhum marco da saga em várias sessões"),
  S("sem_cura_na_masmorra", (s) => !!s.grupoSemCuraDianteDaMasmorra, "grupo sem cura diante de uma masmorra"),
  S("carta_sem_resposta", (s) => !!s.cartaSemResposta, "uma carta do correio sem resposta"),
  S("vespera_ignorada", (s) => (s.vesperasIgnoradas || 0) >= 1, "uma véspera ignorada (o clímax evitado)"),
  S("sistema_intocado", (s) => (s.sistemasNuncaTocados || 0) >= 1, "um sistema inteiro nunca tocado"),
];
export const sinalPorId = (id) => SINAIS.find((x) => x.id === id) || null;

/* ---------------- OS QUATRO DEGRAUS E AS 22 INTERVENÇÕES ----------------
   A escada sobe um degrau por vez. Cada degrau tem suas formas; a
   intervenção é escolhida do degrau atual, e sempre com motivo verdadeiro.
   O degrau 4 só cobra o que já estava prometido em tela. */
export const DEGRAUS = [
  { n: 1, id: "sussurro", diz: "informação nova, custo zero" },
  { n: 2, id: "convite", diz: "alguém chama, com motivo próprio" },
  { n: 3, id: "empurrao", diz: "o mundo se mexe e muda as opções" },
  { n: 4, id: "consequencia", diz: "esperar também é decidir, e o mundo cobra" },
];
export const degrauPorN = (n) => DEGRAUS.find((d) => d.n === n) || null;

const I = (id, degrau, diz) => ({ id, degrau, diz });
export const INTERVENCOES = [
  /* ---- 1 · SUSSURRO (5) ---- */
  I("rumor_na_taverna", 1, "uma conversa ouvida aponta, com detalhe concreto, o próximo passo da principal"),
  I("oraculo_de_sinal", 1, "um presságio gratuito — clima, ave, sonho — na direção certa"),
  I("marcacao_de_terceiro", 1, "o mapa ganha um X que outra mão fez — quem?"),
  I("preco_que_muda", 1, "a pousada encarece, o mercado seca: a economia empurra sem falar"),
  I("cancao_errada", 1, "o bardo canta um feito do herói com o final trocado — corrigir exige fazer"),

  /* ---- 2 · CONVITE (7) ---- */
  I("carta_com_adiantamento", 2, "o correio traz proposta com moedas dentro — recusar exige devolver"),
  I("quem_vem_buscar", 2, "um NPC procura o herói na taverna com pedido ligado à principal"),
  I("testemunha_com_medo", 2, "alguém viu algo e só confia no herói — proteção com prazo"),
  I("trabalho_que_cruza", 2, "a guilda oferece contrato cujo caminho passa pelo marco parado"),
  I("guia_disponivel", 2, "aparece quem conhece o caminho travado — por preço justo"),
  I("mercador_do_excesso", 2, "comprador certo para o inventário lotado — e ele comenta o que ouviu na estrada"),
  I("plano_do_companheiro", 2, "quem tem índole de estrategista propõe, em fala, um passo concreto"),

  /* ---- 3 · EMPURRÃO (6) ---- */
  I("rival_em_publico", 3, "provocação diante de gente — a honra pede resposta, e a resposta é movimento"),
  I("estrada_que_fecha", 3, "desabamento, enchente, bloqueio: sobram os caminhos que importam"),
  I("prazo_que_aparece", 3, "oportunidade com data explícita — feira, maré, lua; perder é escolher"),
  I("festival_que_desloca", 3, "a cidade inteira vai para perto do objetivo; ficar é ficar sozinho"),
  I("crianca_que_pede", 3, "pedido pequeno e impossível de recusar, ligado ao fio principal"),
  I("vilao_visivel", 3, "o plano do vilão avança um passo com testemunhas — o custo de esperar fica concreto"),

  /* ---- 4 · CONSEQUÊNCIA (4) — só cobra o que já estava prometido ---- */
  I("relogio_cobra", 4, "a barra estoura no pedaço: a consequência anunciada acontece — a menor primeiro"),
  I("aliado_leva_credito", 4, "outro herói resolve o marco parado; a fama e a recompensa vão com ele"),
  I("fama_esfria", 4, "o patamar cai um degrau na região: dizem que se aposentou"),
  I("oferta_expira", 4, "o contrato some da pauta e a crônica registra a porta fechada"),
];
export const intervencoesDoDegrau = (n) => INTERVENCOES.filter((x) => x.degrau === n);

/* ---------------- A LEITURA DO ENCALHE ----------------
   Conta os sinais ativos. Um só sinal é vida normal; o encalhe é a
   REPETIÇÃO — por isso o piso é dois. Devolve se está encalhado e a lista
   do que pesou, para o autor ver por que o mundo foi buscar o jogador. */
export const MINIMO_DE_SINAIS = 2;
export function lerEncalhe(snapshot) {
  const s = snapshot && typeof snapshot === "object" ? snapshot : {};
  const ativos = [];
  for (const sin of SINAIS) {
    let liga = false;
    try { liga = !!sin.quando(s); } catch { liga = false; }
    if (liga) ativos.push({ id: sin.id, diz: sin.diz });
  }
  return { encalhado: ativos.length >= MINIMO_DE_SINAIS, sinais: ativos, quantos: ativos.length };
}

/* ---------------- A INTERVENÇÃO DO DEGRAU ----------------
   Escolhe uma forma do degrau atual, determinística pela semente que o
   App passar (o dia, por exemplo) — para não repetir a mesma toda vez. */
export function intervencaoDoDegrau(n, semente = 0) {
  const lista = intervencoesDoDegrau(n);
  if (!lista.length) return null;
  const i = Math.abs(Math.floor(Number(semente) || 0)) % lista.length;
  return lista[i];
}

/* ---------------- A ESCADA ----------------
   Sobe um degrau por vez, com DIAS_ENTRE_DEGRAUS entre eles, enquanto o
   encalhe durar; desce a zero ao primeiro movimento (quando não há mais
   encalhe). Devolve o estado novo e a intervenção a encenar, se subiu. */
export const DIAS_ENTRE_DEGRAUS = 2;
export const DEGRAU_MAX = 4;
export function garantirEscada(e) {
  const o = e && typeof e === "object" ? e : {};
  const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
  return { degrau: Math.max(0, Math.min(DEGRAU_MAX, n(o.degrau, 0))), mexeuEm: Math.max(0, n(o.mexeuEm, 0)) };
}

export function subirEscada(escada, snapshot, { dia = 0 } = {}) {
  const e = garantirEscada(escada);
  const r = lerEncalhe(snapshot);
  /* movimento: sem encalhe, a escada desce a zero — o jogador se soltou */
  if (!r.encalhado) return { escada: { degrau: 0, mexeuEm: dia }, intervencao: null, encalhado: false };
  /* encalhado, mas ainda não é hora de subir outro degrau */
  if (e.degrau > 0 && dia - e.mexeuEm < DIAS_ENTRE_DEGRAUS) return { escada: e, intervencao: null, encalhado: true };
  const degrau = Math.min(DEGRAU_MAX, e.degrau + 1);
  return { escada: { degrau, mexeuEm: dia }, intervencao: intervencaoDoDegrau(degrau, dia), encalhado: true };
}

/* ---------------- PARA O CONSOLE DE AUTOR ---------------- */
export function resumoDoEncalhe(snapshot) {
  const r = lerEncalhe(snapshot);
  return { encalhado: r.encalhado, sinais: r.quantos };
}
