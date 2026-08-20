/* ============================================================
   O BIBLIOTECÁRIO (v9.86) — a consulta

   "E se criarmos um sistema treinado em histórias? Ele seria expert em
   grandes histórias, e é uma base de consulta do mestre — quando o
   mestre estiver pensando o que pode fazer para enviar a IA narrar, ele
   pode consultar o bibliotecário."

   O QUE FALTAVA, e não era o que parecia. O mestre já escolhe bem QUAL
   fio puxar: o relógio quase cheio, a promessa aberta, o nome deixado
   para trás, o vilão que deu um passo. Essa decisão está resolvida desde
   a v9.61 e é boa.

   O que ele nunca teve é a segunda metade da decisão, que é a FORMA. Um
   relógio quase cheio pode entrar numa cena de vinte maneiras — por um
   mensageiro que traz notícia pior que o recado, por uma ausência que se
   nota, por um objeto no chão, por alguém que já está reagindo, pela
   cortesia de quem devia estar furioso. E o envelope pedia sempre a
   mesma coisa: "traga isto à cena em duas ou três frases".

   Um pedido igual todo turno recebe uma resposta igual todo turno. A
   repetição do narrador nunca foi falta de temperatura — foi falta de
   repertório do lado de cá. Subir a temperatura fez a IA variar as
   PALAVRAS; o que se repetia era a JOGADA.

   O ACERVO mora em estante.js, e é grande de propósito: com trinta e
   sete formas e uma janela de seis, a nona cena já era uma repetição
   inevitável — o repertório pequeno repete por aritmética, não por
   descuido.

   ---------------- O QUE ELE NÃO É ----------------

   Não é um gerador de trama, e a linha da casa continua exatamente onde
   estava: aqui não nasce nenhum acontecimento. Toda entrada da estante
   descreve um MOVIMENTO — o formato de como uma coisa que já existe
   chega à mesa. O conteúdo continua vindo do jogo (do relógio, da
   promessa, do vilão) e a ficção continua sendo escrita pela IA, que é a
   única coisa que ela faz melhor que qualquer tabela.

   E não é um bloco de prompt. Este arquivo custa ZERO token por turno em
   sistema: ele só fala dentro de um envelope, e engorda esse envelope em
   duas linhas.
   ============================================================ */

import { ESCOLAS, JOGADAS, escolaPorId, jogadaPorId } from "./estante.js";

/* Reexportados porque o acervo e a consulta são a mesma ferramenta vista
   de dois lados: quem importa "a biblioteca" quer os dois, e obrigar o
   chamador a saber que os dados moram noutro arquivo é vazar arrumação
   interna para fora. */
export { ESCOLAS, JOGADAS, escolaPorId, jogadaPorId };

/* ============================================================
   A SITUAÇÃO — o que o mestre leva à consulta

   Tudo já é sabido em outro lugar do jogo. Nada aqui é novo estado: é a
   mesa, o arco, o vilão e a cena reduzidos ao que uma jogada precisa
   perguntar. Normalizar num lugar só existe pela razão de sempre — um
   `quando` que lê um campo que o chamador não manda é uma regra escrita
   sem código atrás, e essa é a classe de bug que esta casa mais repete.
   ============================================================ */
export function garantirSituacao(s) {
  const o = s && typeof s === "object" ? s : {};
  const b = (k) => !!o[k];
  const n = (k, d) => (Number.isFinite(Number(o[k])) ? Number(o[k]) : d);
  const t = (k) => (typeof o[k] === "string" && o[k] ? o[k] : null);
  return {
    /* o vilão: -1 quando ainda não há nenhum, e é o caso da maior parte
       das campanhas jovens */
    ordemDaFase: n("ordemDaFase", -1),
    vilaoConhecido: b("vilaoConhecido"),
    /* o arco como FRAÇÃO, nunca como nome: 0 é o começo, 1 é o último
       momento. O nome da etapa não entra neste arquivo em lugar nenhum,
       pela mesma razão que ele não entra no prompt (v9.84) */
    momento: Math.max(0, Math.min(1, n("momento", 0))),
    temperatura: t("temperatura") || "morna",
    pilarFaminto: t("pilarFaminto"),
    /* qual fio o mestre já escolheu — a forma tem de servir ao conteúdo */
    fio: t("fio") || "",
    pessoaNaCena: b("pessoaNaCena"),
    emCidade: b("emCidade"),
    emMasmorra: b("emMasmorra"),
    emCombate: b("emCombate"),
    emViagem: b("emViagem"),
    noite: b("noite"),
    temGrupo: b("temGrupo"),
    temPromessa: b("temPromessa"),
    temCicatriz: b("temCicatriz"),
    temDerrotado: b("temDerrotado"),
    temLugarAbandonado: b("temLugarAbandonado"),
    temRelogio: b("temRelogio"),
    /* ---------------- O HISTÓRICO SAI DAS MÃOS DA IA (v9.86) ----------
       Três formas dependem de haver passado nesta campanha — trazer de
       volta um rosto conhecido, dizer uma verdade sobre o que eu fiz,
       repetir uma frase que já foi dita. Até aqui quem decidia se havia
       passado era a IA: o `evite` mandava escolher outra forma se não
       houvesse.

       Delegar essa pergunta é exatamente o que esta casa não faz. Quem
       sabe se há gente conhecida e se há campanha vivida é o SISTEMA — o
       registro de pessoas e a crônica estão do lado de cá. A IA que
       recebe "traga alguém que você já conhece" numa campanha de dois
       dias faz a única coisa que pode: inventa a pessoa. */
    temGenteConhecida: b("temGenteConhecida"),
    temPassado: b("temPassado"),
    pvBaixo: b("pvBaixo"),
    nivel: n("nivel", 1),
    fama: n("fama", 0),
  };
}

/* ============================================================
   A MEMÓRIA DA ESTANTE

   Pelo motivo de sempre nesta casa: uma forma repetida duas vezes
   seguidas vira tique, e tique é pior que a monotonia que ele veio
   curar. Doze de memória, e as oito últimas ficam de fora do sorteio —
   a janela cresceu junto com o acervo, porque com quase duzentas formas
   ela pode crescer sem risco de esvaziar o sorteio.
   ============================================================ */
export const NAO_REPETIR = 8;

export function garantirEstante(e) {
  const o = e && typeof e === "object" ? e : {};
  const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
  return {
    usadas: (Array.isArray(o.usadas) ? o.usadas : []).slice(-16),
    /* turnos desde a última forma dada a uma cena comum */
    desdeCena: n(o.desdeCena),
  };
}

export function marcarJogada(estante, id) {
  const e = garantirEstante(estante);
  const k = String(id || "");
  if (!k) return e;
  return { ...e, usadas: [...e.usadas, k].slice(-16) };
}

/* ============================================================
   OS VETOS — onde uma forma boa é a forma errada

   A estante diz quando cada jogada CABE. Esta tabela diz quando ela não
   cabe de jeito nenhum, e é separada de propósito: um veto vale para o
   acervo inteiro e escrevê-lo em cada entrada seria criar um lugar novo
   para esquecer dele a cada entrada nova.
   ============================================================ */
export const VETOS = [
  {
    id: "brasa_nao_respira",
    quando: (s) => s.temperatura === "brasa",
    corta: (j) => /respiro|calma, de verdade calma|ter graça|silêncio confortável|ninguém aqui tem pressa/i.test(j.forma),
    porque: "no meio de uma luta ou de um perigo em curso, uma cena calma não é respiro: é o sistema atrapalhando a melhor coisa que o jogador tem na mão",
  },
  {
    id: "sem_vilao_sem_oferta",
    quando: (s) => s.ordemDaFase < 0,
    corta: (j) => /outro lado|quem age contra mim|me ofereça|me elogia|me manda um PRESENTE/i.test(j.forma),
    porque: "sem antagonista não existe outro lado, e pedir a forma do inimigo quando não há inimigo é pedir à IA que invente um — que é exatamente o que o vilão veio impedir",
  },
  {
    id: "antes_do_rosto_nao_conversa",
    quando: (s) => !s.vilaoConhecido,
    corta: (j) => j.id === "espelho" || j.id === "poupar" || j.id === "elogio" || j.id === "porta_aberta",
    porque: "as quatro exigem que eu esteja diante DELE, e antes da revelação ele não aparece — quem apareceu foi a mão dele",
  },
  {
    id: "combate_nao_planta",
    quando: (s) => s.emCombate,
    corta: (j) => /* a família inteira do plantio, mais o mundo de fundo */
      /Dê a UM detalhe|Faça um NOME ser dito|de passagem, e nenhuma função|PODERIA ter tomado|NÃO tem relação comigo/i.test(j.forma),
    porque: "plantar exige atenção sobrando, e no meio da luta a atenção do jogador está inteira em outro lugar; o que se planta ali não é plantio, é ruído",
  },
  {
    id: "sem_gente_sem_rosto",
    quando: (s) => !s.temGenteConhecida,
    corta: (j) => j.precisa === "gente",
    porque: "não há ninguém registrado nesta campanha ainda, e uma forma que manda usar quem já apareceu, sem que ninguém tenha aparecido, é um pedido de invenção com outro nome",
  },
  {
    id: "sem_passado_sem_colheita",
    quando: (s) => !s.temPassado,
    corta: (j) => j.precisa === "passado",
    porque: "colher exige ter plantado: numa campanha que mal começou, 'traga de volta uma coisa desta campanha' só pode ser respondido inventando a coisa que voltaria",
  },
];

/* ============================================================
   A CONSULTA

   O mestre chega com a situação e sai com UMA forma. Não com três para
   escolher, não com uma lista: uma. O mestre é quem decide, e um mestre
   que devolve opções ao narrador devolveu junto a decisão.

   `preferir` existe para o holofote: quando um pilar está passando fome,
   a jogada que serve esse pilar entra com peso dobrado — não obrigada,
   dobrada. A diferença importa: forçar o pilar faminto todo turno faria
   o holofote girar por dever, e girar por dever aparece.

   `soSozinhas` é o canal do turno comum, e está explicado adiante.
   ============================================================ */
export function consultarBiblioteca(situacao, { sorte = Math.random, estante = null, preferir = null, soSozinhas = false } = {}) {
  const s = garantirSituacao(situacao);
  const e = garantirEstante(estante);
  const vetos = VETOS.filter((v) => { try { return !!v.quando(s); } catch { return false; } });

  let abertas = JOGADAS.filter((j) => {
    if (soSozinhas && !j.sozinha) return false;
    try { if (!j.quando(s)) return false; } catch { return false; }
    for (const v of vetos) { try { if (v.corta(j)) return false; } catch { /* veto quebrado não veta */ } }
    return true;
  });
  if (!abertas.length) return null;

  /* as recém-usadas saem — a não ser que sair deixe a estante vazia, e aí
     repetir é melhor que não ter forma nenhuma */
  const recentes = new Set(e.usadas.slice(-NAO_REPETIR));
  const frescas = abertas.filter((j) => !recentes.has(j.id));
  if (frescas.length) abertas = frescas;

  const alvo = preferir || s.pilarFaminto || null;
  const peso = (j) => Math.max(1, j.peso) * (alvo && j.serve === alvo ? 2 : 1);
  const total = abertas.reduce((n, j) => n + peso(j), 0);
  let corte = sorte() * total;
  const j = abertas.find((x) => (corte -= peso(x)) <= 0) || abertas[0];
  return { id: j.id, escola: j.escola, serve: j.serve, forma: j.forma, evite: j.evite, sozinha: !!j.sozinha };
}

/* ============================================================
   A CENA COMUM (v9.86)

   O Bibliotecário nasceu falando só nos três envelopes de iniciativa —
   o fio da memória, o mundo se mexendo, o passo do vilão. Só que esses
   três são raros de propósito: a cadência do mundo é larga porque um
   mundo que interrompe toda hora é barulhento, não vivo.

   Quer dizer que a forma chegava a um turno em cada dez, e os outros
   nove — a maior parte do jogo — continuavam exatamente como antes. E é
   justamente neles que a repetição aparece, porque são eles que se
   repetem.

   O QUE MUDA AQUI, e é pouco de propósito: num turno comum não há nada
   chegando, então só entram as formas marcadas `sozinha` — as que moldam
   a CENA em vez de moldar a entrega de outra coisa. "Termine com duas
   portas abertas" funciona sem fio nenhum atrás; "faça isto chegar por
   um mensageiro" não funciona sem o isto.

   E entra com CADÊNCIA. Uma forma a cada três turnos, e nunca em
   combate: o turno de luta já vem cheio de voz de sistema, e dizer à IA
   como compor a cena enquanto o sistema resolve iniciativa, dano e
   posição é atropelar a única parte que ainda era dela.
   ============================================================ */
export const CADENCIA_DA_CENA = 3;

export function podeFormaDeCena(situacao, estante) {
  const s = garantirSituacao(situacao);
  const e = garantirEstante(estante);
  if (s.emCombate) return { pode: false, porque: "o turno de luta já vem cheio de voz de sistema" };
  if (s.temperatura === "brasa") return { pode: false, porque: "em brasa a cena já tem forma, e ela é do jogador" };
  if (e.desdeCena < CADENCIA_DA_CENA) return { pode: false, porque: `faltam ${CADENCIA_DA_CENA - e.desdeCena} turnos para a próxima` };
  return { pode: true, porque: "" };
}

export function contarTurnoDeCena(estante) {
  const e = garantirEstante(estante);
  return { ...e, desdeCena: e.desdeCena + 1 };
}

export function zerarCadenciaDaCena(estante) {
  return { ...garantirEstante(estante), desdeCena: 0 };
}

/* O envelope do turno comum é mais leve que os outros de propósito. Os
   envelopes de iniciativa carregam um FATO ("o relógio andou", "ele pôs
   a mão em alguém") e por isso podem mandar. Este não carrega fato
   nenhum: ele só molda. Então ele pede, diz o que não fazer, e sai. */
export function envelopeDaCena(j) {
  if (!j || !j.forma) return "";
  return `[A FORMA DESTA CENA — ESCOLHIDA PELO SISTEMA] ${j.forma}
E nesta: ${j.evite}.
Isto NÃO é um acontecimento: é o formato da cena que você já ia narrar. NÃO abra trama nova, NÃO invente missão, item, moeda nem nome de gente que o jogo não tenha, e NÃO mencione que houve uma escolha de forma. Depois devolva a palavra para mim.`;
}

/* ============================================================
   O QUE SOBE AO PROMPT

   Duas linhas, dentro de um envelope que já ia ser enviado. E é aqui
   que a regra da casa aparece pela última vez neste arquivo: o nome da
   jogada NÃO viaja. A IA recebe a forma, não a etiqueta — porque uma IA
   que sabe que está fazendo "o mensageiro" escreve o mensageiro genérico
   que ela já viu mil vezes, e o que a gente quer é a cena.

   É a mesma razão pela qual o nome da etapa do arco parou de subir na
   v9.84. O vazamento nunca é dizer o nome: é escrever a etiqueta em vez
   da cena.
   ============================================================ */
export function trechoDaJogada(j) {
  if (!j || !j.forma) return "";
  return `\nA FORMA (escolhida pelo sistema, obrigatória): ${j.forma}\nE nesta: ${j.evite}.`;
}

/* O jogador não vê nada. Está aqui por simetria com os outros módulos —
   e para que a próxima pessoa que procurar "onde isto aparece na tela"
   encontre a resposta escrita, em vez de concluir que faltou fazer. */
export function linhaDaJogada() { return ""; }
