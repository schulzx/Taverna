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

import { progressoDaViagem } from "./viagem.js";
/* MM16 nº 2: a masmorra do mundo como destino — onde fica a boca, quanto
   custa lá chegar e o que se lê antes de entrar (boca.js); e a peneira da
   casa, para que "dizer que vai" não seja ir (lugar.js, peneira.js) */
import { masmorrasConhecidas, masmorraDaBoca, rotaAteAMasmorra, linhaDaIda, vereditoDaMasmorra } from "./boca.js";
import { soODeclarado } from "./peneira.js";
import { NAO_E_IDA, comDe } from "./lugar.js";
/* MM17 nº 3 (v9.364): na região, a hora da ida é a da conta única */
import { caminhoNaRegiao, origemDoHeroi, rotaDoCaminho, linhaDoCaminho } from "./marcha.js";

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
/* ---------------- SEGUIR VIAGEM (v9.56) ----------------
   O comentário de baixo dizia "já está na estrada: quem cuida é o módulo",
   e era verdade enquanto a chegada vinha do calendário: bastava o tempo
   passar. Com a viagem contando ESTRADA PERCORRIDA isso deixou de bastar —
   e o buraco era sério: uma vez na estrada, NADA avançava a estrada. O
   herói ficaria a 7% do caminho para sempre.

   A régua é a mesma do resto desta casa: escreva o que você faz. "Sigo
   viagem", "continuo", "toco em frente", "retomo a estrada". Exige verbo
   de seguir, e por isso "sigo conversando com o Bram" não anda um metro —
   o objeto do verbo é uma conversa, não um caminho. */
const SEGUIR = /\b(sigo|seguimos|continuo|continuamos|prossigo|prosseguimos|retomo|retomamos|avanço|avancamos|avanco|toco em frente|sigo em frente|pé na estrada|pe na estrada|marcho|marchamos|caminho mais|ando mais|volto à estrada|volto a estrada)\b/;
/* o que o verbo de seguir precisa estar seguindo para valer como estrada */
const COISA_DE_ESTRADA = /\b(viagem|viajando|estrada|caminho|jornada|rota|marcha|trecho|em frente|adiante|rumo|destino|para o norte|para o sul|para o leste|para o oeste)\b/;
/* e o que o desqualifica: seguir uma pessoa, uma conversa, uma pista */
const SEGUIR_OUTRA_COISA = /\b(conversa|conversando|falando|discurso|rastro|pegada|pista|cheiro|sangue|instru|ordem|conselho|receita|ritual|liturgia|leitura|estudo)\b/;

export function detectarSeguirViagem(acao, ctx = {}) {
  if (!ctx.emViagem) return null;
  if (ctx.emCombate || ctx.acampado || ctx.emMasmorra) return null;
  const txt = String(acao || "");
  if (!txt.trim() || txt.trimStart().startsWith("[")) return null;   // envelope do sistema não é pedido meu
  for (const o of oracoes(txt)) {
    const n = norm(o);
    if (!SEGUIR.test(n) || SEGUIR_OUTRA_COISA.test(n)) continue;
    if (COISA_DE_ESTRADA.test(n) || /^\s*(sigo|continuo|seguimos|prossigo|avanco|marcho)\s*[.!]?\s*$/.test(n)) {
      return { motivo: "o jogador escreveu que segue caminho" };
    }
  }
  return null;
}

export function detectarPartida(acao, ctx = {}) {
  const gate = podeAbrirModulo(ctx);
  if (!gate.pode) return null;
  if (ctx.emViagem) return null; // já está na estrada: quem avança é `detectarSeguirViagem`
  const txt = String(acao || "");
  if (!txt.trim()) return null;
  /* MM16 nº 2: UMA FRASE, UM DESTINO. "Vou à Nave de Ferro, pela estrada do
     poente" tem a direção ("pela estrada") e tem o lugar; a direção abria
     uma estrada para lugar nenhum. Quando a frase nomeia uma masmorra que o
     herói conhece, quem responde é `idaAMasmorra`, e esta porta cala. */
  if (idaAMasmorra(txt, ctx)) return null;
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
  for (const o0 of oracoes(txt)) {
    /* MM14: sem acento, pela mesma fronteira de ASCII que abria a masmorra
       da lâmina (ver `detectarEntradaEmMasmorra`) */
    const o = norm(o0);
    if (!PARTIDA.test(o) || SO_INTENCAO.test(o)) continue;
    const destino = nomeDeCidade(o) || nomeDeCidade(norm(txt));
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

/* ---------------- A LÂMINA NÃO É UMA MINA (30/09, MM14 · o lugar) ----------------
   As DUAS masmorras da sessão de prova nasceram da faca da heroína.
   "Entro no galpão devagar, com a lâmina à frente" (T21) e "Desço ao
   salão com a lâmina à cintura" (T47): as regex corriam sobre o texto
   CRU, e em JavaScript o `\b` é de ASCII — o "â" não é letra para ele, e
   por isso há uma fronteira de palavra dentro de "lâ|mina". "mina" é
   covil. Verbo de entrada mais covil na mesma oração: masmorra aberta,
   no galpão do cais e no salão da taverna.

   A cura é a de toda a casa: ler o texto SEM ACENTO (as listas já têm as
   duas grafias). E a regra de mesa que faltava vem logo abaixo, em
   `portaDaMasmorra`: um cômodo de um prédio é o prédio, nunca uma
   masmorra. */
export function detectarEntradaEmMasmorra(acao, ctx = {}) {
  const gate = podeAbrirModulo(ctx);
  if (!gate.pode) return null;
  const txt = String(acao || "");
  if (!txt.trim()) return null;
  for (const o of oracoes(txt)) {
    const n = norm(o);
    if (SO_INTENCAO.test(n) || !ENTRADA.test(n)) continue;
    /* o covil é a palavra (a cripta, a mina) — OU a masmorra do mundo pelo
       nome dela, ou por ser o lugar onde o herói está: "O que sobrou de
       Sal" não tem palavra de covil nenhuma e é uma mina de nove salas */
    const porta = portaDaMasmorra({ texto: o, nome: nomeDoCovil(o) }, ctx);
    if (!COVIL.test(n) && !porta.doMundo) continue;
    if (!porta.ok) return null;
    return { nome: porta.nome, motivo: porta.doMundo ? "verbo de entrada e uma masmorra do mundo" : "verbo de entrada e covil na mesma oração" };
  }
  return null;
}

/* ---------------- A PORTA DA MASMORRA (30/09, MM14 · o lugar) ----------------
   Por onde uma masmorra pode abrir — pela frase do jogador
   (`detectarEntradaEmMasmorra`) ou pelo sinal do Narrador
   (`masmorra:<nome>`, que até aqui abria sem pergunta nenhuma).

     1) um lugar que É masmorra no mundo (`ctx.masmorras`, a lista de
        `masmorrasDoMundo`) abre À BOCA DELA — por ser o lugar onde o herói
        está; e abre com o nome DELE. Pelo nome dito, de longe, NÃO abre
        (MM16 nº 2): devolve `longe`, e a frase vira ida até à boca
        (`idaAMasmorra`), onde o veredito se lê antes da porta. Sem nada que
        diga onde o herói está (nem lugar, nem cidade, nem estrada), abre
        como sempre abriu;
     2) dentro de um prédio (um local da cidade ou um cômodo, `distancia:
        "dentro"`) não abre: o salão, o porão e o quarto de cima da
        taverna são a taverna;
     3) dentro dos muros, sem lugar (a rua), só abre o que é do mundo —
        quando quem pergunta traz a lista do mundo;
     4) fora dos muros, o covil que o gerador improvisa continua a abrir,
        como sempre.
   Sem `ctx.lugar` nem `ctx.masmorras`, a resposta é a de antes: sim. */
export function portaDaMasmorra({ texto = "", nome = "" } = {}, ctx = {}) {
  const o = ctx && typeof ctx === "object" ? ctx : {};
  const semArt = (s) => norm(s).trim().replace(/^(o|a|os|as)\s+/, "").trim();
  const t = ` ${norm(`${texto || ""} ${nome || ""}`).replace(/[^a-z0-9]+/g, " ")} `;
  const doMundo = (Array.isArray(o.masmorras) ? o.masmorras : []).filter((m) => m && m.nome);
  const lugar = o.lugar && typeof o.lugar === "object" ? o.lugar : null;
  const dita = doMundo.find((m) => { const k = semArt(m.nome).replace(/[^a-z0-9]+/g, " ").trim(); return k.length > 3 && t.includes(` ${k} `); }) || null;
  const daBoca = masmorraDaBoca(lugar, doMundo);
  /* MM16 nº 2: A PORTA NÃO ABRE DE LONGE. Na sessão de prova (J11) "entro
     na Nave de Ferro" abriu-a do posto da estrada, e o veredito chegou com
     a porta já aberta. Pelo nome, só se abre a masmorra a cuja boca se está. */
  if (dita && (!daBoca || daBoca !== dita) && (lugar || o.cidadeAtual || o.emViagem)) {
    return { ok: false, longe: true, doMundo: true, nome: String(dita.nome).slice(0, 50), motivo: `a entrada ${comDe(dita.nome)} não é aqui — é preciso ir até ela` };
  }
  const achada = dita || daBoca;
  if (achada) return { ok: true, nome: String(achada.nome).slice(0, 50), doMundo: true };
  if (lugar && (lugar.distancia === "dentro" || lugar.dentroDe)) {
    return { ok: false, motivo: `${lugar.nome} é um lugar ${lugar.dentroDe ? "do prédio" : "da cidade"}, não uma masmorra` };
  }
  if (!lugar && o.cidadeAtual && !o.emViagem && Array.isArray(o.masmorras)) {
    return { ok: false, motivo: "dentro dos muros só abre a masmorra que o mundo tem" };
  }
  return { ok: true, nome: String(nome || "").slice(0, 50), doMundo: false };
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
   onde ele mais ficava invisível.

   v9.118: E AGORA ELE É O PONTO CERTO. A fração era 0.5 cravada, com o
   comentário honesto de que "mostrá-lo no meio é a leitura honesta de
   'estou indo'" — e era, enquanto ninguém media a estrada. Desde a v9.56
   a jornada conta minutos andados de minutos totais, e `progressoDaViagem`
   devolve a fração de verdade. O marcador ficava parado no meio de uma
   viagem de treze avanços: no primeiro ele já estava na metade, no
   décimo segundo ainda estava. A tela mentia com um número que o próprio
   sistema tinha certo do lado.

   O LUGAR também entra. O herói que sai da cidade para a fazenda continuava
   desenhado na cidade, porque ninguém perguntava ao `lugar` onde ele era. */
export function pontoDoHeroi({ cidadeAtual = "", jornada = null, mapa = null, lugar = null, masmorra = null } = {}) {
  const cidades = (mapa && mapa.cidades) || [];
  const acha = (nome) => cidades.find((c) => norm(c.nome) === norm(nome)) || null;
  if (jornada) {
    /* MM16 nº 2: a jornada até à boca de uma masmorra guarda o ponto de
       partida e o da boca (`jornada.alvo`, boca.js) — nenhum dos dois é
       cidade, e sem eles o herói ficava cravado na cidade de onde saiu */
    const alvo = jornada.alvo && typeof jornada.alvo === "object" ? jornada.alvo : null;
    const pt = (c, nome) => (c && Number.isFinite(Number(c.x)) && Number.isFinite(Number(c.y)) ? { nome: nome || "", x: Number(c.x), y: Number(c.y) } : null);
    const a = (alvo && pt(alvo.origem, jornada.de)) || acha(jornada.de);
    const b = acha(jornada.para) || (alvo && pt(alvo.coord, alvo.nome));
    const p = progressoDaViagem(jornada);
    const f = p ? Math.max(0, Math.min(1, p.fracao)) : 0.5;
    /* MM17 nº 3 (v9.364): o caminho com escalas (`jornada.percurso`, a conta
       única de marcha.js) — o herói anda de ponto em ponto, pela hora a que
       chega a cada um, e não em linha reta por cima da serra que contornou */
    const per = Array.isArray(jornada.percurso) ? jornada.percurso.filter((q) => q && Number.isFinite(Number(q.x)) && Number.isFinite(Number(q.y)) && Number.isFinite(Number(q.h))) : [];
    if (per.length >= 2 && Number(per[per.length - 1].h) > 0) {
      const t = f * Number(per[per.length - 1].h);
      let i = 1;
      while (i < per.length - 1 && Number(per[i].h) < t) i++;
      const q0 = per[i - 1], q1 = per[i];
      const dh = Number(q1.h) - Number(q0.h);
      const g = dh > 0 ? Math.max(0, Math.min(1, (t - Number(q0.h)) / dh)) : 1;
      const ponta = (q) => ({ nome: String(q.nome || ""), x: Number(q.x), y: Number(q.y) });
      return { x: Number(q0.x) + (Number(q1.x) - Number(q0.x)) * g, y: Number(q0.y) + (Number(q1.y) - Number(q0.y)) * g, naEstrada: true, de: ponta(per[0]), para: ponta(per[per.length - 1]), fracao: f };
    }
    if (a && b) return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, naEstrada: true, de: a, para: b, fracao: f };
    if (a) return { x: a.x, y: a.y, naEstrada: true, de: a, para: null, fracao: f };
    return null;
  }
  /* dentro do covil, o ponto é o da boca por onde se entrou — registrada
     na abertura, porque é a única hora em que alguém sabe onde ela é */
  if (masmorra && masmorra.coord && Number.isFinite(Number(masmorra.coord.x))) {
    return { x: Number(masmorra.coord.x), y: Number(masmorra.coord.y), naEstrada: false, de: null, para: null, coord: masmorra.coord, noCovil: true };
  }
  if (lugar && lugar.coord && Number.isFinite(Number(lugar.coord.x))) {
    return { x: Number(lugar.coord.x), y: Number(lugar.coord.y), naEstrada: false, de: null, para: null, coord: lugar.coord, noLugar: lugar.nome };
  }
  const c = acha(cidadeAtual);
  return c ? { x: c.x, y: c.y, naEstrada: false, de: null, para: null, coord: { x: c.x, y: c.y, z: c.z || 0, mx: 0, my: 0 } } : null;
}

/* ============================================================
   IR À MASMORRA (MM16 nº 2) — "vou à Nave" leva à Nave

   A frase da sessão de prova: "Saio da Viela da Fome e vou à Nave de
   Ferro, pela estrada do poente". Nenhum leitor desta casa a entendia: a
   masmorra só se ABRIA (verbo de entrada + covil), a partida só conhecia
   CIDADES e DIREÇÕES, e o passo só os lugares a pé da cidade. Ficou a
   direção, e a direção abriu estrada para lugar nenhum.

   Aqui a masmorra do mundo é destino. A régua é a mesma do resto do
   arquivo — o verbo e o nome na MESMA oração, a intenção não é movimento,
   e só o que o herói declarou conta (a peneira tira a fala, a pergunta, o
   plano e o futuro) — com três cuidados que só este caso pede:

     · SÓ A QUE ELE CONHECE: as masmorras que a cidade aponta
       (`masmorrasConhecidas`, a régua do prompt), mais a da boca onde está
       e a do fim da estrada em que vai. Nome de outra região não move.
     · O NOME INTEIRO, OU O NÚCLEO COM MAIÚSCULA: "a Nave de Ferro", "Nave
       de Ferro", e "a Nave" quando escrita como nome próprio (com a
       maiúscula, sozinha — "a Nave de Sal" é outro nome —, e só se nenhuma
       outra masmorra conhecida nem cidade começa pela mesma palavra).
       "vou à nave da igreja" não vai.
     · DE ONDE SE SAI NÃO É PARA ONDE SE VAI: "saio da Nave", "deixo a
       Nave", "venho da Nave" são a origem (a lição de MM15 no `lugar.js`).
       E se a oração nomeia uma CIDADE antes da masmorra, o destino é a
       cidade ("vou a Rio do Sul, perto da Nave").

   De longe, o verbo de ENTRADA também é ida: "entro na Nave de Ferro" a
   cento e tal quilómetros vira "vou até à boca" — a porta não abre
   (`portaDaMasmorra`), e o segundo "entro", à boca, é que a abre.

   `ctx`: o do rastro (`cidadeAtual`, `cidades`, `emCombate`, `acampado`,
   `emMasmorra`, `emViagem`, `lugar`, `masmorras`) mais `mapa` (a cidade,
   a região e o ponto), `jornada` (para seguir ou largar a estrada) e,
   opcional, `pers` (o veredito na partida) e `origem` (o ponto, se quem
   chama já o tiver). Devolve null, ou:

     { acao: "partir" | "seguir" | "ficar", nome, masmorra, rota, origem,
       deixaEstrada, linhas, veredito, motivo }

   "partir" abre a ida (rota.modo "estrada": jornada; "a_pe": caminhada);
   "seguir" é avançar na estrada que já vai para lá; "ficar" é estar já à
   boca — nada a mover. `linhas` é o que vai à tela, como SISTEMA.
   ============================================================ */
const IDA_VERBO = /\b(parto|partimos|sigo|seguimos|vou|vamos|viajo|viajamos|rumo|marcho|marchamos|caminho|caminhamos|ando|andamos|cavalgo|cavalgamos|galopo|volto|voltamos|regresso|regressamos|me dirijo|dirijo-?me|nos dirigimos|me encaminho|encaminho-?me|me ponho a caminho|tomo a estrada|pego a estrada|chego|chegamos|entro|entramos|adentro|desco|descemos|invado|penetro|me embrenho)\b/;
/* à boca, estes são entrar — e quem abre é `detectarEntradaEmMasmorra` */
const SO_ENTRADA = /\b(entro|entramos|adentro|desco|descemos|invado|penetro|me embrenho)\b/;
const DE_ONDE_SE_SAI = /\b(saio|saimos|sair|saindo|deixo|deixamos|largo|largamos|abandono|abandonamos|fujo|fugimos|venho|vimos|vindo|vinda|volto|voltamos|regresso|regressamos|retorno)\s+(de|da|do|das|dos)\s*$|\b(deixo|deixamos|largo|largamos|abandono|abandonamos)\s+(a|o|as|os)\s*$|\bdesde\s+((a|o|as|os)\s+)?$/;
const PALAVRAS_DO_NOME = (s) => norm(s).trim().replace(/^(o|a|os|as)\s+/, "").split(/[^a-z0-9]+/).filter(Boolean);
const rxDoNome = (palavras) => new RegExp(`(^|[^a-z0-9])${palavras.join("[^a-z0-9]+")}(?![a-z0-9])`);
/* as orações com a posição de cada uma no texto (a peneira devolve o texto
   com o mesmo tamanho, e a posição é o que liga a oração à maiúscula) */
function oracoesComPosicao(s) {
  const out = [];
  const rx = /[.!?;\n]+|\s+(?:e|mas|porem|entao|depois|antes|enquanto|ou)\s+/g;
  let ini = 0, m;
  while ((m = rx.exec(s))) { out.push({ ini, txt: s.slice(ini, m.index) }); ini = m.index + m[0].length; }
  out.push({ ini, txt: s.slice(ini) });
  return out.filter((o) => o.txt.trim());
}

export function idaAMasmorra(acao, ctx = {}) {
  const o = ctx && typeof ctx === "object" ? ctx : {};
  if (!podeAbrirModulo(o).pode) return null;
  const cru = String(acao || "");
  if (!cru.trim() || cru.trimStart().startsWith("[")) return null;   // envelope do sistema não é pedido meu
  const todas = (Array.isArray(o.masmorras) ? o.masmorras : []).filter((m) => m && m.nome);
  if (!todas.length) return null;
  const mapa = o.mapa && typeof o.mapa === "object" ? o.mapa : null;
  const cidades = (mapa && Array.isArray(mapa.cidades)) ? mapa.cidades : [];
  const aqui = norm(o.cidadeAtual);
  const cidade = cidades.find((c) => c && norm(c.nome) === aqui) || (o.cidadeAtual ? { nome: String(o.cidadeAtual) } : null);
  const jornada = o.jornada && typeof o.jornada === "object" ? o.jornada : null;
  const lugar = o.lugar && typeof o.lugar === "object" ? o.lugar : null;
  const daBoca = masmorraDaBoca(lugar, todas);
  const doFim = jornada && jornada.alvo && jornada.alvo.nome ? masmorraDaBoca({ nome: jornada.alvo.nome }, todas) : null;
  /* MM17 C1: na região, a base conhece todos os lugares, e a ida anda pelo
     chão (boca.js); sem `mapa.regiao` as duas chamadas são as de sempre */
  const regiao = mapa && mapa.regiao && typeof mapa.regiao === "object" ? mapa.regiao : null;
  const conhecidas = [...new Set([...masmorrasConhecidas(todas, cidade, regiao ? { regiao } : null), daBoca, doFim].filter(Boolean))];
  if (!conhecidas.length) return null;

  /* o que o herói declarou, sem acento e do mesmo tamanho do texto */
  const decl = soODeclarado(cru, NAO_E_IDA);
  const mesmoTamanho = norm(cru).length === decl.length;
  const maiuscula = (pos, palavra) => {
    if (mesmoTamanho) { const ch = cru[pos] || ""; return ch !== ch.toLowerCase(); }
    return new RegExp(`(^|[^\\p{L}])${palavra[0].toUpperCase()}${palavra.slice(1)}(?![\\p{L}])`, "u").test(cru.normalize("NFD").replace(/[̀-ͯ]/g, ""));
  };
  /* as palavras de abertura de cada nome — o núcleo só vale se for único */
  const cabeca = (nome) => { const p = PALAVRAS_DO_NOME(nome); return p.length > 1 && p[0].length >= 4 ? p[0] : ""; };
  const cabecas = conhecidas.map((m) => cabeca(m.nome));
  const cabecasDeCidade = new Set(cidades.map((c) => PALAVRAS_DO_NOME(c && c.nome)[0]).filter(Boolean));
  const nomesDeCidade = cidades.map((c) => c && c.nome).filter((n) => n && norm(n) !== aqui).map((n) => PALAVRAS_DO_NOME(n)).filter((p) => p.length && p.join("").length > 3);

  for (const or of oracoesComPosicao(decl)) {
    const n = or.txt;
    if (SO_INTENCAO.test(n) || !IDA_VERBO.test(n)) continue;
    let melhor = null;
    conhecidas.forEach((m, i) => {
      const inteiro = PALAVRAS_DO_NOME(m.nome);
      if (!inteiro.length || inteiro.join("").length <= 3) return;
      const formas = [inteiro];
      const cab = cabecas[i];
      if (cab && cabecas.filter((c) => c === cab).length === 1 && !cabecasDeCidade.has(cab)) formas.push([cab]);
      for (const f of formas) {
        const rx = new RegExp(rxDoNome(f).source, "g");
        let mm;
        while ((mm = rx.exec(n))) {
          const ini = mm.index + mm[1].length;
          if (f.length === 1 && !maiuscula(or.ini + ini, f[0])) continue;   // o núcleo só como nome próprio
          /* e só sozinho: "a Nave de Sal" e "a Gruta Corvos" são outros nomes,
             não o núcleo da "Nave de Pedra Torta" nem da "Gruta Raízes"
             (achados na varredura, nos andares da Torre) */
          if (f.length === 1) {
            const fim = mm.index + mm[0].length;
            if (/^\s+(de|da|do|das|dos)\s+[a-z0-9]/.test(n.slice(fim))) continue;
            if (mesmoTamanho && /^\s+\p{Lu}/u.test(cru.slice(or.ini + fim))) continue;
          }
          if (DE_ONDE_SE_SAI.test(n.slice(0, ini))) continue;               // a origem não é o destino
          if (!melhor || ini < melhor.ini) melhor = { m, ini };
          break;
        }
      }
    });
    if (!melhor) continue;
    /* uma CIDADE dita antes, e não como origem, é o destino desta oração */
    const cidadeAntes = nomesDeCidade.some((p) => {
      const mm = rxDoNome(p).exec(n);
      if (!mm) return false;
      const ini = mm.index + mm[1].length;
      return ini < melhor.ini && !DE_ONDE_SE_SAI.test(n.slice(0, ini));
    });
    if (cidadeAntes) continue;
    const m = melhor.m;
    if (daBoca && daBoca === m) {
      if (SO_ENTRADA.test(n)) return null;   // à boca, entrar é entrar
      return { acao: "ficar", nome: m.nome, masmorra: m, rota: null, origem: null, deixaEstrada: false, linhas: [], veredito: null, motivo: "o herói já está à boca dela" };
    }
    const veredito = o.pers ? vereditoDaMasmorra(m, o.pers) : null;
    if (doFim && doFim === m && (o.emViagem || jornada)) {
      return { acao: "seguir", nome: m.nome, masmorra: m, rota: null, origem: null, deixaEstrada: false, linhas: [], veredito, motivo: "a estrada em que vai já acaba nela" };
    }
    const ponto = o.origem || pontoDoHeroi({ cidadeAtual: o.cidadeAtual, jornada, mapa, lugar });
    /* na região, o chão de onde se sai: a boca onde está, ou a cidade */
    const chao = regiao ? ((daBoca && daBoca.bioma) || (cidade && cidade.bioma) || "") : "";
    const origem = ponto && Number.isFinite(Number(ponto.x)) ? { x: Number(ponto.x), y: Number(ponto.y), ...(chao ? { bioma: chao } : {}) } : null;
    let rota = rotaAteAMasmorra(m, origem, regiao ? { de: (lugar && lugar.nome) || o.cidadeAtual || "", regiao } : { de: (lugar && lugar.nome) || o.cidadeAtual || "" });
    if (!rota) return null;   // sem ponto, sem conta — e sem palpite
    /* MM17 nº 3 (v9.364): A MARCHA ÚNICA. Na região de agora, a ida que passa
       de um dia procura o caminho pelas povoações (`caminhoNaRegiao`,
       marcha.js); se o achar mais curto, é ele que se anda, e a linha de
       antes de partir diz os dois. A ida direta dentro do dia fica a rota de
       cima, byte a byte; fora da região, `caminho` é null. */
    let linhaDoDesvio = "";
    if (regiao) {
      let c = null;
      try { c = caminhoNaRegiao(mapa, origemDoHeroi(mapa, { cidadeAtual: o.cidadeAtual, lugar, jornada, ponto: origem }), m.id || m.nome); } catch { c = null; }
      if (c && c.desvio) { rota = { ...rotaDoCaminho(c, { de: rota.de }), para: rota.para }; }
      if (c) linhaDoDesvio = linhaDoCaminho(c);
    }
    const linhas = [linhaDoDesvio || linhaDaIda(rota), rota.modo === "estrada" && veredito ? veredito.linha : ""].filter(Boolean);
    return {
      acao: "partir", nome: m.nome, masmorra: m, rota, origem,
      deixaEstrada: !!(o.emViagem || jornada), linhas, veredito,
      motivo: SO_ENTRADA.test(n) ? "entrar de longe é ir até à boca" : "a masmorra nomeada é o destino",
    };
  }
  return null;
}

/* ============================================================
   UMA FRASE, UMA RESPOSTA (MM16 nº 2)

   Na sessão de prova um toque deu DUAS respostas do Mestre, duas vezes. O
   mecanismo era o mesmo: o rastro armava um sinal; a frase do jogador ia
   ao Mestre (resposta um); depois o sinal disparava a viagem ou a masmorra,
   que escrevia uma fala NA BOCA DO HERÓI ("Sigo viagem pela estrada.",
   "Encontrei uma entrada: …. Vou explorar.") e chamava o Mestre outra vez
   (resposta dois). A segunda contradizia a primeira, o portão acusava o
   Mestre do que o sistema fez, e o relógio andava duas vezes.

   A regra: o jogador escreve uma vez, o Mestre responde uma vez, e o
   sistema fala só em linhas de tela (SISTEMA) — NUNCA em nome do herói.
   Quantas chamadas a ação do sistema faz depende de quem a pediu:

     · "frase" — a frase do jogador pediu (o rastro leu a ida, a entrada,
       o seguir). O efeito roda ANTES de a frase ir ao Mestre, e o envelope
       do sistema vai NA MESMA chamada da frase. Zero chamadas próprias.
     · "sinal" — o Mestre pediu, na resposta que já deu. O efeito roda
       depois, e o envelope espera na nota pela próxima frase do jogador.
       Zero chamadas próprias: a resposta já foi dada.
     · "toque" — um botão. O toque É a ação do jogador, e não há frase
       dele a quem colar o envelope: uma chamada, a do sistema.

   `vozDoHeroi` é falso nas três, e está na tabela para que a suíte o leia
   e para que ninguém o ligue sem ter de apagar esta frase primeiro.
   ============================================================ */
export const QUEM_RESPONDE = {
  frase: { id: "frase", vozDoHeroi: false, chamadas: 0, envelope: "junto", porque: "a frase do jogador é a ação; o sistema age antes e o Mestre responde UMA vez, à frase, com o envelope junto" },
  sinal: { id: "sinal", vozDoHeroi: false, chamadas: 0, envelope: "proximo", porque: "o Mestre já respondeu; o que o sistema rolou espera na nota pela próxima frase do jogador" },
  toque: { id: "toque", vozDoHeroi: false, chamadas: 1, envelope: "proprio", porque: "o botão é a ação do jogador e não tem frase onde colar o envelope: uma chamada, a do sistema" },
};
export function quemResponde(origem) {
  return QUEM_RESPONDE[origem] || QUEM_RESPONDE.sinal;
}

/* ---------------- OS ENVELOPES ---------------- */
export function envelopeDePartida(destino, de) {
  return `[VIAGEM ABERTA PELO SISTEMA — eu saí de ${de || "onde estava"}] Eu pus o pé na estrada${destino ? ` rumo a ${destino}` : ""}. O sistema assumiu a jornada: clima, encontros, terreno, ritmo de marcha e passagem de tempo são dele, e ele já os rolou. Eu NÃO estou mais em ${de || "cidade nenhuma"} — não me devolva para lá, não descreva ruas, tavernas nem gente da cidade. A cena acontece no caminho. E não me faça chegar ao destino agora: a chegada é do sistema, e ele avisa quando for.`;
}

export function envelopeDeMasmorra(nome) {
  return `[MASMORRA ABERTA PELO SISTEMA] Eu entrei${nome ? ` em ${nome}` : " no covil"}. O sistema gerou a planta inteira — câmaras, passagens, segredos, chave e chefe — e conduz sala a sala. NÃO invente o que há lá dentro, não descreva salas que eu ainda não abri e não resolva a exploração numa narração corrida: descreva só a entrada e o que os meus olhos alcançam daqui.`;
}
