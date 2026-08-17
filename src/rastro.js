/* ============================================================
   RASTRO (v9.29) — o sistema sabe onde o herói está e abre o
   módulo sozinho

   Viagem e masmorra são dois dos sistemas mais completos do jogo:
   a estrada tem clima, encontros, ritmo de marcha, navegação,
   suprimentos e exaustão; a masmorra tem planta gerada, tochas,
   percepção passiva, segredos e chefe. E os dois só abriam se o
   MESTRE lembrasse de mandar o sinal "viagem:<destino>" ou
   "masmorra:<nome>".

   Ele esquecia. E quando esquecia, o jogador dizia "sigo para Rio
   do Sul" e chegava lá no parágrafo seguinte — sem estrada, sem
   clima, sem um dia sequer no calendário. Ou dizia "desço na
   cripta" e a cripta virava três frases de improviso em vez das
   catorze câmaras que o gerador tinha pronto para ele. Metade do
   jogo dependia de a IA se lembrar de que o jogo existia.

   Este arquivo tira isso da memória dela. É um LEITOR DE INTENÇÃO:
   funções puras sobre o texto da ação e o estado do mundo, rodadas
   antes de qualquer chamada, custo zero. Se o herói pôs o pé fora
   da cidade, a viagem abre. Se entrou num lugar que é masmorra, a
   masmorra abre. O sinal do Mestre continua valendo — agora ele é
   a segunda porta, não a única.

   O PERIGO AQUI É O FALSO POSITIVO, e ele é caro dos dois lados:
   abrir viagem porque alguém disse "pergunto o caminho para Rio do
   Sul" tira o jogador da cena à força e queima um dia de calendário
   que ele não gastou. Por isso a regra é a mesma do portão:

   1) INTENÇÃO NÃO É MOVIMENTO. "penso em ir", "quero ir", "pergunto
      como se chega", "digo que vou" — nada disso é partir.
   2) DESTINO DENTRO DA CIDADE NÃO É VIAGEM. "vou até a taverna",
      "subo para o quarto", "atravesso a praça" é andar, não viajar.
   3) SÓ ABRE COM DESTINO OU DIREÇÃO EXPLÍCITA. Sair "por aí" não
      abre estrada: sem para onde, o módulo não teria o que fazer.
   4) O NOME NÃO BASTA PARA A MASMORRA. "ouço falar da cripta" não
      é descer nela; é preciso um verbo de entrada apontando para o
      lugar na MESMA frase.
   ============================================================ */

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* ---------------- O QUE DESLIGA TUDO ----------------
   Estados em que sair da cena por conta própria seria atropelo. */
export function podeAbrirModulo(ctx = {}) {
  if (ctx.emCombate) return { pode: false, motivo: "no meio de um combate" };
  if (ctx.acampado) return { pode: false, motivo: "acampado" };
  if (ctx.emMasmorra) return { pode: false, motivo: "dentro de uma masmorra" };
  return { pode: true };
}

/* ---------------- REGRA 1: INTENÇÃO NÃO É MOVIMENTO ----------------
   O verbo de deslocamento existe, mas está subordinado a outro que o
   transforma em plano, pergunta ou fala. É o mesmo problema de "está
   sendo mencionado, é diferente" que o portão já resolvia para gente. */
const SO_INTENCAO = /\b(penso|pretendo|quero|queria|pretendia|planejo|considero|cogito|talvez|pergunto|perguntar|questiono|indago|digo que|falo que|conto que|aviso que|combino|prometo|sugiro|proponho|decidir se|se eu|caso eu|antes de|preciso saber|quanto tempo|como chego|como se chega|onde fica|qual o caminho|vale a pena|ouco falar|ouço falar|ouvi falar|dizem que|contam que|soube de|falam d[eoa]|boato)\b/i;

/* ---------------- ORAÇÕES, NÃO FRASES ----------------
   "Ouço falar da cripta e entro na taverna" é uma frase só, e nela o verbo
   de entrada e o covil convivem sem ter nada a ver um com o outro. Testar o
   período inteiro daria a masmorra errada; testar por ORAÇÃO (cortando
   também nas conjunções) põe cada verbo junto do complemento que é dele.
   É a mesma ideia do escopo por sentença que o portão usa para gente. */
function oracoes(txt) {
  return String(txt || "")
    .split(/[.!?;\n]+|\s+(?:e|mas|porem|porém|entao|então|depois|antes|enquanto|ou)\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* Verbo de partida de verdade — sair daqui rumo a outro lugar. */
const PARTIDA = /\b(parto|partir|saio|sair|sigo|seguir|vou|ir|viajo|viajar|rumo|marcho|marchar|cavalgo|cavalgar|galopo|voo|voar|embarco|embarcar|zarpo|zarpar|navego|navegar|atravesso|atravessar|tomo a estrada|pego a estrada|caio na estrada|ponho o pe na estrada|deixo a cidade|deixo a vila|abandono a cidade|me ponho a caminho|retomo a viagem|continuo a viagem|sigo viagem)\b/i;

/* Direção sem destino nomeado ainda abre estrada: "sigo para o sul",
   "estrada afora", "para fora dos portões". */
const DIRECAO = /(\bestrada afora\b|\b(pela|para a|na) estrada\b|\bpara fora d[aeo]s?\s+(cidade|vila|muralhas?|port[õo]es?|port[ãa]o|povoado|muros?|aldeia)|\bport[õo]es? afora\b|\bcruzo (os |as |o |a )?(port[õo]es?|muralhas?)|\brumo a[oso]{0,2}\s+(norte|sul|leste|oeste|nascente|poente)|\bpara o (norte|sul|leste|oeste)\b|\bao (norte|sul|leste|oeste)\b|\bmar afora\b|\brio (abaixo|acima)\b|\bmontanha acima\b)/i;

/* REGRA 2: destino que é um lugar DENTRO do assentamento. Andar até a
   forja não é uma viagem, e tratar como tal seria roubar o dia do jogador. */
const LUGAR_INTERNO = /\b(taverna|estalagem|hospedaria|quarto|mercado|feira|forja|ferreiro|armeiro|templo|igreja|capela|guilda|cofre|banco|praca|praça|rua|beco|porto|doca|muralha|portao|portão|torre de guarda|guarda|prefeitura|palacio|palácio|castelo|masmorra da cidade|cadeia|estabulo|estábulo|biblioteca|academia|bordel|casa de|loja|armazem|armazém|alquimista|curandeiro|boticario|boticário|cemiterio|cemitério|bairro|distrito)\b/i;

/* ---------------- A PARTIDA ----------------
   `ctx.cidades` é a lista de nomes conhecidos do mapa: se o jogador
   nomeia uma cidade que não é a de agora, o destino é fato, não
   palpite. */
export function detectarPartida(acao, ctx = {}) {
  const gate = podeAbrirModulo(ctx);
  if (!gate.pode) return null;
  if (ctx.emViagem) return null; // já está na estrada: quem cuida é o módulo
  const txt = String(acao || "");
  if (!txt.trim()) return null;
  const aqui = norm(ctx.cidadeAtual);
  const nomeDeCidade = (t) => {
    for (const nome of ctx.cidades || []) {
      const n = norm(nome);
      if (!n || n.length < 3 || n === aqui) continue;
      if (t.includes(n)) return nome;
    }
    return "";
  };
  /* a oração que contém o verbo de partida é a que manda: "pergunto o
     caminho e sigo para Rio do Sul" parte de verdade, e o exame por período
     inteiro dizia que não. */
  for (const o of oracoes(txt)) {
    if (!PARTIDA.test(o) || SO_INTENCAO.test(o)) continue;
    const destino = nomeDeCidade(norm(o)) || nomeDeCidade(norm(txt));
    if (destino) return { destino, motivo: "destino nomeado no mapa" };
    /* sem cidade nomeada, só a direção explícita serve. E ela ganha do lugar
       interno: "sigo para fora dos portões" é sair, mesmo com "portão" na
       lista de lugares da cidade. */
    if (DIRECAO.test(o)) return { destino: "", motivo: "direção explícita para fora" };
  }
  /* houve verbo de partida, mas sem para onde: a REGRA 3 manda não abrir —
     estrada sem destino não teria o que rolar. */
  return null;
}

/* ---------------- A MASMORRA ----------------
   REGRA 4: o verbo de entrada e o substantivo de covil precisam estar
   na MESMA frase. "Ouço falar da cripta sob o templo e entro na
   taverna" não é descer na cripta. */
const ENTRADA = /\b(entro|entrar|adentro|adentrar|desco|descer|desço|invado|invadir|exploro|explorar|penetro|penetrar|me embrenho|avanco para dentro|avanço para dentro|atravesso a entrada|cruzo o portal|abro a porta e entro|vasculho|vasculhar|sondo)\b/i;

/* O que conta como covil. Deliberadamente ligado ao gerador: tudo aqui
   vira um lugar que masmorras.js sabe povoar com salas, chave e chefe. */
const COVIL = /\b(masmorra|calabouco|calabouço|cripta|catacumba|catacumbas|tumba|tumulo|túmulo|mausoleu|mausoléu|covil|toca|caverna|gruta|caverna|mina|minas|ruina|ruína|ruinas|ruínas|labirinto|subterraneo|subterrâneo|esgoto|esgotos|cova|fosso|torre abandonada|torre em ruinas|fortaleza abandonada|forte abandonado|templo soterrado|templo abandonado|santuario perdido|santuário perdido|necropole|necrópole|ossario|ossário|antro|cavernas|galeria|poco antigo|poço antigo)\b/i;

export function detectarEntradaEmMasmorra(acao, ctx = {}) {
  const gate = podeAbrirModulo(ctx);
  if (!gate.pode) return null;
  const txt = String(acao || "");
  if (!txt.trim()) return null;
  for (const o of oracoes(txt)) {
    if (SO_INTENCAO.test(o)) continue;
    if (!ENTRADA.test(o) || !COVIL.test(o)) continue;
    return { nome: nomeDoCovil(o), motivo: "verbo de entrada e covil na mesma oração" };
  }
  return null;
}

/* Tenta pescar o nome próprio do lugar ("desço na Cripta de Malgar") para
   a masmorra não nascer chamada "Masmorra". Se não achar, o gerador nomeia. */
export function nomeDoCovil(frase) {
  const m = String(frase || "").match(/\b((?:a|o|as|os|na|no|nas|nos|da|do|em|à|ao)\s+)?((?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ'-]*)(?:\s+(?:de|da|do|das|dos|d')?\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ'-]*)*)/);
  const bruto = (m && m[2] || "").trim();
  /* uma palavra maiúscula solta costuma ser o começo da frase, não um nome */
  if (!bruto || bruto.split(/\s+/).length < 2) return "";
  return bruto.slice(0, 50);
}

/* ---------------- A JORNADA ÓRFÃ ----------------
   Durante uma viagem, a cidade atual continua sendo a de onde se saiu: é
   `jornada.de` que diz de onde, e só a CHEGADA muda `cidadeAtual`. Se os dois
   discordam, o herói chegou a algum lugar e a chegada nunca foi registrada —
   o que sobrou é resto de save, não viagem em curso.

   Isso ficava invisível enquanto o mapa não desenhava o herói. Agora um save
   antigo o mostraria eternamente "na estrada" enquanto ele bebe numa taverna,
   e a viagem seguinte partiria do lugar errado. */
export function jornadaValida(jornada, cidadeAtual) {
  if (!jornada || typeof jornada !== "object" || !jornada.de) return null;
  const de = norm(jornada.de), aqui = norm(cidadeAtual);
  if (aqui && de && aqui !== de) return null;
  /* v9.56: uma jornada de antes do registro não tem estrada percorrida. Dar
     zero a ela seria mandar o herói recomeçar a viagem no meio dela; o
     honesto é assumir metade do caminho — ele partiu, andou alguma coisa, e
     o sistema não tem como saber quanto. */
  if (jornada.totalMin == null) {
    const dias = Number(jornada.dias) || 3;
    const totalMin = Math.max(60, Math.round(dias * 8 * 60));
    return { ...jornada, dias, totalMin, andadoMin: Math.round(totalMin / 2), estado: "em_curso", km: Number(jornada.km) || 0 };
  }
  return jornada;
}

/* ---------------- ONDE O HERÓI ESTÁ ----------------
   Um lugar só para responder "onde estou?", porque três telas
   perguntavam isso e cada uma respondia de um jeito. */
export function ondeEstou({ cidadeAtual = "", jornada = null, masmorra = null, mapa = null } = {}) {
  if (masmorra && masmorra.nome) {
    return { tipo: "masmorra", rotulo: masmorra.nome, detalhe: `câmara ${masmorra.atual != null ? masmorra.atual : "?"}` };
  }
  if (jornada) {
    const de = jornada.de || "a última parada";
    const para = jornada.para || "";
    return {
      tipo: "estrada",
      rotulo: para ? `a caminho de ${para}` : "na estrada",
      detalhe: `saiu de ${de}${jornada.meio ? ` · de ${jornada.meio}` : ""}`,
      de, para,
    };
  }
  if (cidadeAtual) {
    const c = ((mapa && mapa.cidades) || []).find((x) => norm(x.nome) === norm(cidadeAtual));
    return { tipo: "cidade", rotulo: cidadeAtual, detalhe: c ? [c.regiao, c.faccao].filter(Boolean).join(" · ") : "", cidade: c || null };
  }
  return { tipo: "nenhum", rotulo: "lugar nenhum registrado", detalhe: "" };
}

/* Ponto no mapa (0-100) do herói — inclusive no meio da estrada, que é
   onde ele mais ficava invisível. Fração 0.5: a viagem é um trecho, não
   um ponto, e mostrá-lo no meio é a leitura honesta de "estou indo". */
export function pontoDoHeroi({ cidadeAtual = "", jornada = null, mapa = null } = {}) {
  const cidades = (mapa && mapa.cidades) || [];
  const acha = (nome) => cidades.find((c) => norm(c.nome) === norm(nome)) || null;
  if (jornada) {
    const a = acha(jornada.de);
    const b = acha(jornada.para);
    if (a && b) return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, naEstrada: true, de: a, para: b };
    if (a) return { x: a.x, y: a.y, naEstrada: true, de: a, para: null };
    return null;
  }
  const c = acha(cidadeAtual);
  return c ? { x: c.x, y: c.y, naEstrada: false, de: null, para: null } : null;
}

/* ---------------- OS ENVELOPES ---------------- */
export function envelopeDePartida(destino, de) {
  return `[VIAGEM ABERTA PELO SISTEMA — eu saí de ${de || "onde estava"}] Eu pus o pé na estrada${destino ? ` rumo a ${destino}` : ""}. O sistema assumiu a jornada: clima, encontros, terreno, ritmo de marcha e passagem de tempo são dele, e ele já os rolou. Eu NÃO estou mais em ${de || "cidade nenhuma"} — não me devolva para lá, não descreva ruas, tavernas nem gente da cidade. A cena acontece no caminho. E não me faça chegar ao destino agora: a chegada é do sistema, e ele avisa quando for.`;
}

export function envelopeDeMasmorra(nome) {
  return `[MASMORRA ABERTA PELO SISTEMA] Eu entrei${nome ? ` em ${nome}` : " no covil"}. O sistema gerou a planta inteira — câmaras, passagens, segredos, chave e chefe — e conduz sala a sala. NÃO invente o que há lá dentro, não descreva salas que eu ainda não abri e não resolva a exploração numa narração corrida: descreva só a entrada e o que os meus olhos alcançam daqui.`;
}
