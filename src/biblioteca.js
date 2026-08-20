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

import { ESCOLAS, JOGADAS, GESTOS, escolaPorId, jogadaPorId, gestoPorId } from "./estante.js";

/* Reexportados porque o acervo e a consulta são a mesma ferramenta vista
   de dois lados: quem importa "a biblioteca" quer os dois, e obrigar o
   chamador a saber que os dados moram noutro arquivo é vazar arrumação
   interna para fora. */
export { ESCOLAS, JOGADAS, GESTOS, escolaPorId, jogadaPorId, gestoPorId };

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
    /* v9.87: e a trava ficou mais fina. "Passado" era grosso demais — a
       forma que pede uma FRASE já dita, a que pede um OBJETO que apareceu
       e a que pede um LUGAR onde estive são três memórias diferentes, e um
       herói com três cicatrizes e nenhum quilômetro rodado tem passado sem
       ter lugar nenhum de que se lembrar. */
    temFalaAnterior: b("temFalaAnterior"),
    /* ---------------- O QUE O JOGADOR ACABOU DE FAZER (v9.88) --------
       A memória cobria o que o SISTEMA mandou e era cega para o outro
       lado da mesa: um jogador que passa três turnos conversando recebia
       formas de conversa sem que nada percebesse a redundância — o gesto
       nunca se repetia e a cena se repetia mesmo assim, porque metade
       dela vinha dele.

       `pilarDoTexto` já lê o texto do jogador e já alimenta a mesa desde
       a v9.72. Faltava a estante olhar para esse sinal. */
    pilarRecente: t("pilarRecente"),
    temObjetos: b("temObjetos"),
    temLugarVisitado: b("temLugarVisitado"),
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

/* ---------------- E A MEMÓRIA DO GESTO (v9.87) ----------------
   Não bastava lembrar da FORMA. `mensageiro`, `rosto_conhecido`,
   `pela_crianca`, `procurador`, `ordem_de_longe` e `quem_ficou` são seis
   entradas distintas e uma única cena — alguém chega e fala comigo. Três
   delas seguidas passavam pela memória sem alarme nenhum, e o jogador lia
   a mesma coisa três vezes com nomes diferentes do lado de cá.

   A janela do gesto é CURTA de propósito, e muito mais curta que a da
   forma: gesto é categoria grossa, e proibir "alguém chega e fala" por oito
   turnos proibiria metade do que uma cena de cidade pode ser. Três é o
   bastante para quebrar a sequência sem estreitar o mundo. */
export const NAO_REPETIR_GESTO = 3;

export function garantirEstante(e) {
  const o = e && typeof e === "object" ? e : {};
  const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
  return {
    usadas: (Array.isArray(o.usadas) ? o.usadas : []).slice(-16),
    gestos: (Array.isArray(o.gestos) ? o.gestos : []).slice(-8),
    /* turnos desde a última forma dada a uma cena comum */
    desdeCena: n(o.desdeCena),
  };
}

export function marcarJogada(estante, id, gesto = "") {
  const e = garantirEstante(estante);
  const k = String(id || "");
  if (!k) return e;
  const g = String(gesto || (jogadaPorId(k) || {}).gesto || "");
  return {
    ...e,
    usadas: [...e.usadas, k].slice(-16),
    gestos: g ? [...e.gestos, g].slice(-8) : e.gestos,
  };
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
    /* v9.87: era um casamento de TEXTO da forma, e por isso frágil ao
       ponto de sumir sozinho: bastava reescrever uma frase para o veto
       parar de cortar sem que nada quebrasse. Agora lê estrutura. */
    corta: (j) => j.gesto === "respira",
    porque: "no meio de uma luta ou de um perigo em curso, uma cena calma não é respiro: é o sistema atrapalhando a melhor coisa que o jogador tem na mão",
  },
  {
    id: "sem_vilao_sem_oferta",
    quando: (s) => s.ordemDaFase < 0,
    /* só o gesto do antagonista, e NÃO `oferece`: quem oferece também é o
       aldeão que dá uma recompensa torta, e essa não tem vilão nenhum
       atrás. Na prática este veto é rede de segurança — toda forma do
       outro lado já exige `ordemDaFase >= 1` no próprio `quando`, e sem
       vilão a fase é -1 —, mas ele protege a próxima que alguém escrever
       esquecendo dessa guarda. */
    corta: (j) => j.gesto === "mostra_o_outro",
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
    /* v9.87: por gesto, e agora corta a família INTEIRA em vez das quatro
       formas cujo texto eu tinha lembrado de listar. */
    corta: (j) => j.gesto === "planta" || j.gesto === "mostra_mundo",
    porque: "plantar exige atenção sobrando, e no meio da luta a atenção do jogador está inteira em outro lugar; o que se planta ali não é plantio, é ruído",
  },
];

/* ============================================================
   AS EXIGÊNCIAS — que memória cada forma precisa que exista

   Uma linha por espécie de lembrança, e é tabela em vez de um veto por
   valor pela razão de sempre nesta casa: assim o acervo pode inventar uma
   exigência nova e a suíte cobra a linha correspondente aqui, em vez de a
   forma abrir sempre porque nenhum veto a conhecia.

   Até a v9.86 eram duas — "gente" e "passado" — e "passado" era grosso
   demais. A forma que pede uma FRASE já dita, a que pede um OBJETO que
   apareceu e a que pede um LUGAR onde estive são três memórias
   diferentes: um herói com três cicatrizes e nenhum quilômetro rodado tem
   passado de sobra e nenhum lugar de que se lembrar.
   ============================================================ */
export const EXIGENCIAS = [
  { precisa: "gente", campo: "temGenteConhecida", porque: "não há ninguém registrado nesta campanha, e mandar usar quem já apareceu sem que ninguém tenha aparecido é um pedido de invenção com outro nome" },
  { precisa: "passado", campo: "temPassado", porque: "colher exige ter plantado: numa campanha que mal começou, 'traga de volta uma coisa desta campanha' só pode ser respondido inventando a coisa que voltaria" },
  { precisa: "fala", campo: "temFalaAnterior", porque: "repetir uma frase que já foi dita exige que se tenha conversado o bastante para haver frase — e o eco de uma campanha de dois diálogos é a IA escrevendo a frase original agora" },
  { precisa: "objeto", campo: "temObjetos", porque: "um objeto desta campanha só reaparece em outras mãos se ele existir; sem inventário nenhum, quem inventa o objeto que volta é quem narra" },
  { precisa: "lugar", campo: "temLugarVisitado", porque: "lembrar de um lugar exige ter ido a mais de um: no primeiro, toda semelhança com 'outro onde estive' é um lugar novo nascendo" },
];
export function exigenciaDe(precisa) { return EXIGENCIAS.find((x) => x.precisa === precisa) || null; }

/* Um veto só, montado da tabela. Uma forma que declare uma exigência que
   esta tabela não conhece é CORTADA, e não liberada: o lado seguro de uma
   lacuna é o silêncio, nunca a permissão — foi assim que `seguraOTeste`
   quase deixou passar meio catálogo na v9.71. */
VETOS.push({
  id: "sem_memoria_sem_forma",
  quando: () => true,
  corta: (j, s) => {
    if (!j.precisa) return false;
    const x = exigenciaDe(j.precisa);
    /* sem tabela OU sem situação, corta: nos dois casos o sistema não tem
       como afirmar que a memória existe, e afirmar sem saber é justamente
       o que manda a IA inventar a lembrança */
    return x && s ? !s[x.campo] : true;
  },
  porque: "toda forma que depende de haver histórico é trancada pelo sistema, que sabe se ele existe — nunca pela IA, que na falta dele inventaria a lembrança",
});

/* ============================================================
   AS AFINIDADES — o quanto ESTA forma serve a ESTA cena

   O `quando` é binário: abre ou não abre. E isso bastava enquanto o
   acervo era pequeno, porque quase tudo que abria servia. Com cento e
   noventa e uma formas abertas ao mesmo tempo, `dentes_em_outro` pesava
   o mesmo no começo da campanha e no clímax, e `colhe` competia de
   igual com `planta` num mundo onde ainda não havia nada plantado.

   A alternativa óbvia — uma função `cabe` em cada entrada — seria cento
   e noventa e uma regras para manter, quase todas repetindo a mesma
   ideia. Aqui são NOVE regras gerais aplicadas ao acervo inteiro, pela
   razão de sempre nesta casa: a tabela é o conteúdo, e uma regra escrita
   uma vez não pode ficar desatualizada em cento e noventa lugares.

   Cada linha devolve um MULTIPLICADOR. Acima de 1 aproxima, abaixo de 1
   afasta, e nenhuma zera: afinidade não é veto, e uma forma que o
   `quando` abriu continua possível mesmo quando não é a mais indicada —
   é dela que vem a surpresa que uma régua fina mataria.
   ============================================================ */
export const PISO_AFINIDADE = 0.2;
export const TETO_AFINIDADE = 6;

export const AFINIDADES = [
  {
    id: "holofote",
    diz: "o pilar que está passando fome vale o dobro",
    vale: (j, s, alvo) => (alvo && j.serve === alvo ? 2 : 1),
    porque: "é o giro do holofote, e ele dobra em vez de obrigar: forçar o pilar faminto todo turno faria o holofote girar por dever, e girar por dever aparece",
  },
  {
    id: "o_que_eu_acabei_de_fazer",
    diz: "o pilar que o próprio jogador acabou de jogar vale menos",
    vale: (j, s) => (s.pilarRecente && j.serve === s.pilarRecente ? 0.5 : 1),
    porque: "metade da cena vem do jogador: três turnos dele de conversa mais uma forma de conversa é a mesma cena quatro vezes, e o gesto sozinho não pega isso porque o gesto só lembra do que o sistema mandou",
  },
  {
    id: "plantar_e_cedo",
    diz: "plantar vale mais no começo do arco e menos no fim",
    vale: (j, s) => (j.gesto === "planta" ? (s.momento < 0.4 ? 1.8 : s.momento > 0.7 ? 0.4 : 1) : 1),
    porque: "o que se planta no último momento não tem quando germinar — plantio é uma promessa ao futuro, e no fim não há futuro sobrando",
  },
  {
    id: "colher_e_tarde",
    diz: "colher vale mais no fim do arco e quase nada no começo",
    vale: (j, s) => (j.gesto === "colhe" ? (s.momento > 0.55 ? 2 : s.momento < 0.3 ? 0.4 : 1) : 1),
    porque: "o outro lado da mesma moeda: colher cedo é colher o que mal foi plantado, e a colheita rala ensina que o passado desta campanha é raso",
  },
  {
    id: "o_vilao_no_meio",
    diz: "o antagonista rende mais entre a mão e a guerra",
    vale: (j, s) => ((j.gesto === "mostra_o_outro" || j.gesto === "oferece") && s.ordemDaFase >= 2 && s.ordemDaFase <= 4 ? 1.6 : 1),
    porque: "é a faixa em que ele já tem presença e ainda não é o clímax; antes disso ele é clima, e depois disso a cena dele é a luta",
  },
  {
    id: "mesa_fria_quer_acontecimento",
    diz: "numa mesa morta, o que faz alguma coisa acontecer vale mais — e o respiro vale menos",
    vale: (j, s) => {
      if (s.temperatura !== "fria") return 1;
      if (j.gesto === "respira") return 0.3;
      return ["chega_gente", "chega_coisa", "mostra_dentes", "bifurca", "aperta", "cheguei_tarde"].includes(j.gesto) ? 1.8 : 1;
    },
    porque: "contra a intuição, e é o ponto: mesa fria são cinco turnos sem dado, sem perigo e sem nada ganho — mais uma cena calma sobre uma cena morta é a morte confirmada, não o socorro",
  },
  {
    id: "mesa_quente_quer_ar",
    diz: "numa mesa que já rolou dado demais, o respiro e a gente valem mais",
    vale: (j, s) => (s.temperatura === "quente" && ["respira", "fala", "me_ve", "vinculo"].includes(j.gesto) ? 1.8 : 1),
    porque: "é onde o novato cansa a mesa: continua empilhando pressão porque cada pedaço, sozinho, era defensável",
  },
  {
    id: "onde_eu_estou",
    diz: "o espaço rende onde ele é o assunto, e a gente rende onde há gente",
    vale: (j, s) => {
      if (j.gesto === "mostra_lugar") return (s.emMasmorra || s.emViagem) ? 1.8 : 0.6;
      if (j.gesto === "fala" || j.gesto === "vinculo") return s.pessoaNaCena ? 1.5 : 0.5;
      if (j.gesto === "mostra_mundo") return s.emCidade ? 1.4 : 0.7;
      return 1;
    },
    porque: "uma forma de fala numa cena sem ninguém é um pedido para a IA inventar quem fala, e uma forma de espaço numa taverna é descrição no lugar de cena",
  },
  {
    id: "o_corpo_quando_doi",
    diz: "o corpo entra quando há o que mostrar",
    vale: (j, s) => (j.gesto === "mostra_corpo" ? (s.pvBaixo || s.temCicatriz ? 1.8 : 0.6) : 1),
    porque: "o cansaço e a marca dizem alguma coisa num herói ferido, e num herói inteiro são só adjetivo",
  },
];
export function afinidadePorId(id) { return AFINIDADES.find((a) => a.id === id) || null; }

/* O produto das linhas, aparado nas duas pontas. O teto existe porque
   uma pilha de multiplicadores pode fazer uma forma engolir o sorteio; o
   piso, porque afinidade NÃO é veto — o que o `quando` abriu continua
   possível, e é dessa cauda que vem a cena que ninguém esperava. */
export function aderenciaDe(jogada, situacao, alvo = null) {
  const s = garantirSituacao(situacao);
  let m = 1;
  for (const a of AFINIDADES) {
    let v = 1;
    try { v = Number(a.vale(jogada, s, alvo)); } catch { v = 1; }
    if (!Number.isFinite(v) || v <= 0) v = 1;
    m *= v;
  }
  return Math.min(TETO_AFINIDADE, Math.max(PISO_AFINIDADE, m));
}

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
    /* UM VETO QUEBRADO CORTA, e não passa. A primeira versão fazia o
       contrário — engolia a exceção e deixava a forma aberta — e isso é a
       classe de bug que esta casa mais repete, na sua forma mais cara: uma
       lacuna virando permissão. Um veto com defeito que corta demais
       aparece na hora (a estante encolhe); um que libera demais só aparece
       quando a IA já narrou o que não devia. */
    for (const v of vetos) {
      let cortou = true;
      try { cortou = !!v.corta(j, s); } catch { cortou = true; }
      if (cortou) return false;
    }
    return true;
  });
  if (!abertas.length) return null;

  /* as recém-usadas saem — a não ser que sair deixe a estante vazia, e aí
     repetir é melhor que não ter forma nenhuma */
  const recentes = new Set(e.usadas.slice(-NAO_REPETIR));
  const frescas = abertas.filter((j) => !recentes.has(j.id));
  if (frescas.length) abertas = frescas;

  /* e o GESTO recém-feito também sai. A ordem importa: a forma primeiro,
     o gesto depois, e os dois com a mesma escapatória — se filtrar por
     gesto esvaziar a estante, o gesto repetido é melhor que forma
     nenhuma. Uma cena repetida é um defeito; uma cena sem forma é o
     comportamento de antes, que não era defeito. */
  const gestosRecentes = new Set(e.gestos.slice(-NAO_REPETIR_GESTO));
  const outroGesto = abertas.filter((j) => !gestosRecentes.has(j.gesto));
  if (outroGesto.length) abertas = outroGesto;

  /* o holofote deixou de ser um caso especial aqui e virou a primeira
     linha de AFINIDADES: todo o peso da decisão passou a morar num lugar
     só, que é o que impede a próxima regra de nascer solta no meio do
     sorteio como esta estava */
  const alvo = preferir || s.pilarFaminto || null;
  const peso = (j) => Math.max(1, j.peso) * aderenciaDe(j, s, alvo);
  const total = abertas.reduce((n, j) => n + peso(j), 0);
  let corte = sorte() * total;
  const j = abertas.find((x) => (corte -= peso(x)) <= 0) || abertas[0];
  return {
    id: j.id, gesto: j.gesto, escola: j.escola, serve: j.serve,
    forma: j.forma, evite: j.evite, sozinha: !!j.sozinha,
    /* a aderência sobe junto para quem for depurar: sem ela, "por que saiu
       esta?" só se responde relendo nove funções à mão */
    aderencia: Math.round(aderenciaDe(j, s, alvo) * 100) / 100,
  };
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
/* ---------------- E ELA RESPONDE À MESA (v9.87) ----------------
   A cadência era um número fixo, e um número fixo trata igual duas mesas
   opostas. Numa mesa FRIA — cinco turnos sem dado, sem perigo e sem nada
   ganho — a forma é a coisa que mais ajuda, e fazê-la esperar três turnos
   é deixar a cena morrer mais um pouco antes de socorrê-la. Numa mesa
   QUENTE já há voz demais, e mais uma instrução é mais uma voz.

   `cada: 0` é nunca, e a tabela diz por quê em vez de o código saber de
   cor — a ordem e os motivos são o conteúdo, como em toda tabela desta
   casa. */
export const CADENCIA_DA_CENA = 3;
export const CADENCIAS = [
  { temperatura: "fria", cada: 2, porque: "a cena morreu e ninguém percebeu: aqui a forma é o socorro, não o enfeite" },
  { temperatura: "morna", cada: 3, porque: "o passo normal da mesa, que é o estado da maioria dos turnos" },
  { temperatura: "quente", cada: 6, porque: "já houve dado demais nos últimos turnos, e uma instrução a mais é só mais uma voz" },
  { temperatura: "brasa", cada: 0, porque: "a cena já tem forma, e ela é do jogador" },
];
export function cadenciaDe(temperatura) {
  return CADENCIAS.find((c) => c.temperatura === temperatura) || CADENCIAS[1];
}

export function podeFormaDeCena(situacao, estante) {
  const s = garantirSituacao(situacao);
  const e = garantirEstante(estante);
  if (s.emCombate) return { pode: false, porque: "o turno de luta já vem cheio de voz de sistema" };
  const c = cadenciaDe(s.temperatura);
  if (!c.cada) return { pode: false, porque: c.porque };
  if (e.desdeCena < c.cada) return { pode: false, porque: `faltam ${c.cada - e.desdeCena} turnos para a próxima (mesa ${s.temperatura}: ${c.porque})` };
  return { pode: true, porque: c.porque };
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
