/* ============================================================
   A ESPINHA (v9.129) — a história nasce com o mundo

   O mundo já nascia inteiro e determinístico da semente: regiões, cidades,
   fações, masmorras, esconderijos, segredos, gente, chefes. A HISTÓRIA não.
   Ela era o que o Narrador improvisava mais os sorteios de `tramas.js` — e
   era por isso que ela era a única coisa da mesa que ninguém conseguia
   conferir. Onde não há decisão tomada antes, quem decide é quem está
   falando na hora.

   `historia.js` já tinha a FORMA: as estruturas dramáticas, os marcos que
   pesam, o custo que cada momento cobra para virar. O que faltava era o
   CONTEÚDO — quais marcos, onde, com quem, e o que muda quando cada um
   acontece. É isso que este arquivo estende, uma vez só, na criação do
   mundo.

   ---------------- TRÊS REGRAS QUE SUSTENTAM O RESTO ----------------

   1) A ESPINHA SÓ APONTA PARA O QUE EXISTE. Cidade que está no mapa, gente
      que está na base, bicho que vive naquela região, chefe que o mundo já
      criou. Nada de nome inventado aqui: um marco que aponte para alguém
      que não existe é a caçada dos três lobos de novo, agora em escala de
      campanha.

   2) TODA CONDIÇÃO É DO VOCABULÁRIO QUE JÁ SE CONFERE. As etapas de
      `missoes.js` têm `ver()` que lê o estado do jogo. A espinha não
      inventa um segundo jeito de dizer "cumprido" — ela usa o que o motor
      já sabe olhar.

   3) O ATO É DIMENSIONADO PELA CONTA DO PRÓPRIO ARCO. `custoDaEtapa` já
      diz quanto peso cada momento precisa para virar. A espinha põe marcos
      até somar esse peso — nem um a mais. Assim o arco vira exatamente
      quando os marcos do ato acabam, em vez de virar por acúmulo de coisas
      que aconteceram por acaso.

   ---------------- O QUE ELA NÃO É ----------------

   Não é roteiro de falas, e não fecha caminho. Ela diz O QUE precisa
   acontecer para a história andar; o jogador decide em que ordem, por onde,
   e a que custo — e o Narrador decide COMO aquilo é contado. Três campanhas
   com a mesma espinha terminam diferentes porque nenhuma delas é contada
   duas vezes igual, e porque o que o jogador faz entre um marco e outro é
   dele.
   ============================================================ */
import { rngDe } from "./geografia.js";
import { estruturaPorId, custoDaEtapa, pesoDe } from "./historia.js";
import { locaisDaCidade, genteDoLocal, criaturasDaRegiao, chefesDoMundo } from "./mundo-base.js";
import { kmEntre } from "./coordenadas.js";

const entre = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- OS FEITIOS DE MARCO ----------------
   Cada feitio sabe três coisas: que peso ele tem para o arco (o mesmo
   vocabulário de `PESO_MARCO`), que condição do motor o cumpre, e o que
   muda no mundo quando ele acontece. Um feitio sem consequência seria um
   marco que a história não sente — e a história é justamente o que sobra
   depois que as coisas acontecem. */
export const FEITIOS = {
  procurar: {
    id: "procurar", icone: "🔎", peso: "missao",
    titulo: (m) => `Encontrar ${m.quem}`,
    condicao: (m) => ({ tipo: "falar_com", alvo: m.quem }),
    consequencia: "conhece",
  },
  enfrentar: {
    id: "enfrentar", icone: "⚔", peso: "missao_forcada",
    titulo: (m) => `Acabar com ${m.alvo}`,
    condicao: (m) => ({ tipo: "derrotar", alvo: m.alvo, quantos: m.quantos || 1 }),
    consequencia: "abre_caminho",
  },
  descobrir: {
    id: "descobrir", icone: "🗝", peso: "missao",
    titulo: (m) => `O que ${m.onde} esconde`,
    /* `revelar`, e não `ir_a`: passar pela porta não é descobrir. A etapa
       nasceu nesta versão justamente porque a primeira sonda estendeu uma
       espinha inteira que se cumpria andando. */
    condicao: (m) => ({ tipo: "revelar", alvo: m.onde }),
    consequencia: "revela",
  },
  /* NÃO EXISTE AQUI UM FEITIO DE ENTREGA, e a ausência é decisão: `levar_a`
     confere se o item está na bolsa, e nada no jogo entrega ao herói "o
     fardo pesado demais para um só". A primeira sonda estendeu justamente
     esse marco como abertura da campanha — um marco impossível de cumprir,
     bem no lugar onde a história começa. Volta no dia em que a espinha
     souber pôr o objeto na mão de alguém. */
  /* NÃO EXISTE AQUI UM FEITIO DE MASMORRA, e é a mesma ausência do de
     entrega. "Descer em X" só se cumpriria por `ir_a` — chegar à boca da
     mina —, e chegar não é descer. A masmorra sabe quais salas foram
     resolvidas, mas não publica um sinal de CONCLUÍDA que as etapas saibam
     ler. Volta no dia em que publicar. */
  confronto: {
    id: "confronto", icone: "☠", peso: "nemesis",
    titulo: (m) => `${m.alvo}`,
    condicao: (m) => ({ tipo: "derrotar", alvo: m.alvo, quantos: 1 }),
    consequencia: "desfecho",
  },
};
export function feitioDe(id) { return FEITIOS[id] || FEITIOS.procurar; }

/* ---------------- A CATRACA ---------------- */
export function garantirEspinha(e) {
  const o = e && typeof e === "object" ? e : {};
  const atos = Array.isArray(o.atos) ? o.atos : [];
  return {
    estrutura: estruturaPorId(o.estrutura).id,
    semente: String(o.semente || ""),
    atos: atos.map((a, i) => ({
      ato: Number.isFinite(a && a.ato) ? a.ato : i,
      marcos: (Array.isArray(a && a.marcos) ? a.marcos : []).map((m) => ({
        id: String((m && m.id) || ""),
        feitio: FEITIOS[m && m.feitio] ? m.feitio : "procurar",
        titulo: String((m && m.titulo) || "").slice(0, 70),
        quem: String((m && m.quem) || "").slice(0, 40),
        alvo: String((m && m.alvo) || "").slice(0, 40),
        item: String((m && m.item) || "").slice(0, 40),
        onde: String((m && m.onde) || "").slice(0, 50),
        regiao: String((m && m.regiao) || "").slice(0, 40),
        ehLugar: !!(m && m.ehLugar),
        quantos: Math.max(1, Number(m && m.quantos) || 1),
        condicao: (m && m.condicao) || null,
        feito: !!(m && m.feito),
      })),
    })),
  };
}

/* ---------------- ESTENDER A ESPINHA ----------------
   Uma vez só, na criação do mundo. Determinística: a mesma semente estende
   a mesma espinha, sempre — é o que permite dizer que a história ESTAVA ali
   antes de o jogador perguntar. */
export function estenderEspinha({ semente = "", mapa = null, genero = "Fantasia medieval", molde = null, lex = null, estrutura = "jornada", cidadeInicial = "" } = {}) {
  const est = estruturaPorId(estrutura);
  const cidades = (mapa && mapa.cidades) || [];
  const regioes = (mapa && mapa.regioes) || [];
  if (!cidades.length) return garantirEspinha({ estrutura: est.id, semente, atos: [] });

  const rnd = rngDe(`${semente}|espinha`);
  const chefes = chefesDoMundo(semente, mapa, genero, lex);
  const principal = chefes.find((c) => c.linha === "principal") || chefes[0] || null;
  const secundarios = chefes.filter((c) => c !== principal);

  /* A ESPINHA CAMINHA PARA FORA. O primeiro ato acontece à mão, perto de
     onde o herói acorda; o último, no ponto mais longe que o mundo tem. Não
     é enfeite: é o que faz a viagem significar alguma coisa, e sai de graça
     porque as coordenadas já existem. */
  const partida = cidades.find((c) => norm(c.nome) === norm(cidadeInicial)) || cidades[0];
  const porDistancia = [...cidades].sort((a, b) => kmEntre(partida, a) - kmEntre(partida, b));

  const usados = new Set();     // nada de dois marcos seguidos na mesma peça
  const marcarUso = (k) => { if (k) usados.add(norm(k)); };
  const livre = (k) => k && !usados.has(norm(k));

  const cidadeDoAto = (i, n) => {
    /* uma fatia da lista ordenada por distância, deslizando do perto ao longe */
    const faixa = Math.max(1, Math.floor(porDistancia.length / Math.max(1, n)));
    const ini = Math.min(porDistancia.length - 1, i * faixa);
    const fim = Math.min(porDistancia.length, ini + faixa + 1);
    const fatia = porDistancia.slice(ini, fim).filter((c) => livre(c.nome));
    return fatia.length ? pick(rnd, fatia) : porDistancia[Math.min(ini, porDistancia.length - 1)];
  };

  const genteDaCidade = (cidade) => {
    const locais = locaisDaCidade(semente, cidade, genero, molde, lex);
    const out = [];
    for (const l of locais) out.push(...genteDoLocal(semente, l, genero, molde, lex));
    return out;
  };

  const atos = [];
  const n = est.etapas.length;
  for (let i = 0; i < n; i++) {
    const ultimo = i === n - 1;
    const custo = custoDaEtapa(est, i);
    const marcos = [];
    let peso = 0;
    let tentativas = 0;

    /* O DESFECHO NÃO É SORTEADO, e ele vai por ÚLTIMO. `historia.js` já se
       recusa a entrar no momento final sem antagonista; a espinha fecha a
       outra ponta, prometendo desde a criação do mundo quem está no fim
       dela. A primeira sonda o pôs em primeiro lugar no ato e o resto do
       ato ficou acontecendo depois do clímax — o peso dele entra na conta
       agora, mas o marco só é empilhado no fim. */
    let fecho = null;
    if (ultimo && principal) {
      fecho = {
        id: `espinha|${i}|z`, feitio: "confronto",
        alvo: principal.nome,
        onde: principal.covil || (porDistancia[porDistancia.length - 1] || partida).nome,
        regiao: principal.regiao || "",
      };
      fecho.titulo = feitioDe(fecho.feitio).titulo(fecho);
      /* a condição casa pelo nome CURTO, que é como o motor registra quem
         caiu; o título leva o nome inteiro, que é como o mundo o chama */
      fecho.condicao = { tipo: "derrotar", alvo: principal.nomeCurto || principal.nome, quantos: 1 };
      peso += pesoDe(feitioDe(fecho.feitio).peso);
      marcarUso(principal.nomeCurto || principal.nome);
    }

    while (peso < custo && tentativas < 24) {
      tentativas += 1;
      const cidade = cidadeDoAto(i, n);
      const regiao = regioes.find((r) => r.nome === cidade.regiao) || (regioes.length ? pick(rnd, regioes) : null);
      const m = { id: `espinha|${i}|${marcos.length}`, onde: cidade.nome, regiao: cidade.regiao || (regiao ? regiao.nome : "") };

      /* o sorteio do feitio é enviesado pelo momento: os primeiros atos
         apresentam gente e lugares, os do meio cobram briga, e o penúltimo
         empurra para baixo da terra */
      const cedo = i <= 0;
      const meio = i > 0 && i < n - 2;
      const roleta = cedo
        ? ["procurar", "descobrir", "descobrir", "procurar"]
        : meio
          ? ["enfrentar", "procurar", "descobrir", "enfrentar"]
          : ["enfrentar", "descobrir", "enfrentar", "procurar"];
      /* NUNCA DOIS IGUAIS SEGUIDOS. A primeira sonda abriu a campanha com
         três "encontrar fulano" em fila, e três vezes a mesma cena não é
         um começo, é uma lista de chamada. */
      const anterior = marcos.length ? marcos[marcos.length - 1].feitio : "";
      const opcoes = roleta.filter((x) => x !== anterior);
      m.feitio = pick(rnd, opcoes.length ? opcoes : roleta);

      if (m.feitio === "procurar") {
        const gente = genteDaCidade(cidade).filter((p) => livre(p.nome));
        if (!gente.length) continue;
        const p = pick(rnd, gente);
        m.quem = p.nome; m.onde = p.local || cidade.nome; m.ehLugar = !!p.local;
        marcarUso(p.nome);
      } else if (m.feitio === "enfrentar") {
        const chefe = secundarios.filter((c) => livre(c.nomeCurto || c.nome))[0];
        const bichos = regiao ? criaturasDaRegiao(semente, regiao, genero, lex).filter((c) => livre(c.nome)) : [];
        if (chefe && rnd() < 0.4) {
          m.alvo = chefe.nomeCurto || chefe.nome; m.onde = chefe.covil || cidade.nome; m.regiao = chefe.regiao || m.regiao;
        } else if (bichos.length) {
          const b = pick(rnd, bichos);
          m.alvo = b.nome;
          /* QUANTOS SAI DA AMEAÇA. A sonda mandou "acabar com Lich (×3)":
             três liches não é um marco, é um fim de campanha por engano.
             Bicho grande vem sozinho; matilha é coisa de bicho pequeno. */
          m.quantos = (b.ameaca === "lendario" || b.ameaca === "elite") ? 1 : entre(rnd, 1, 3);
        } else continue;
        marcarUso(m.alvo);
      }

      if (m.feitio === "descobrir") {
        const locais = locaisDaCidade(semente, cidade, genero, molde, lex).filter((l) => livre(l.nome));
        if (!locais.length) continue;
        const l = pick(rnd, locais);
        m.onde = l.nome; m.ehLugar = true;
        marcarUso(l.nome);
      } else if (m.feitio === "levar") {
        const destino = porDistancia.find((c) => livre(c.nome) && c.nome !== cidade.nome);
        if (!destino) continue;
        m.item = pick(rnd, ["a encomenda lacrada", "a carta que ninguém quis levar", "o fardo pesado demais para um só", "a caixa que não se abre"]);
        m.onde = destino.nome; m.ehLugar = false;
        marcarUso(destino.nome);
      }

      m.titulo = feitioDe(m.feitio).titulo(m);
      m.condicao = feitioDe(m.feitio).condicao(m);
      marcos.push(m);
      peso += pesoDe(feitioDe(m.feitio).peso);
      marcarUso(m.onde);
    }

    if (fecho) marcos.push(fecho);
    atos.push({ ato: i, marcos });
  }

  return garantirEspinha({ estrutura: est.id, semente, atos });
}

/* ---------------- ONDE ESTAMOS ----------------
   O Narrador nunca escolhe o próximo passo; ele recebe qual é. */
export function marcosDoAto(espinha, ato) {
  const e = garantirEspinha(espinha);
  const a = e.atos.find((x) => x.ato === ato);
  return a ? a.marcos : [];
}

export function marcoAtual(espinha, ato) {
  return marcosDoAto(espinha, ato).find((m) => !m.feito) || null;
}

/* NAO HA `marcarFeito` avulso nem `atoCumprido`: quem marca e `conferirEspinha`,
   pelo fato, e quem decide se o arco vira e `historia.js`, pelo peso. Duas
   portas para a mesma decisao seriam duas versoes de quando a historia anda. */

export function progressoDoAto(espinha, ato) {
  const ms = marcosDoAto(espinha, ato);
  return { feitos: ms.filter((m) => m.feito).length, total: ms.length };
}

/* ---------------- O QUE O MARCO CUMPRE ----------------
   A condição já é do vocabulário de `missoes.js`, então conferir um marco é
   a mesma pergunta que conferir uma etapa — e é de propósito: dois jeitos
   de dizer "cumprido" seriam dois jeitos de discordar. */
export function conferirEspinha(espinha, mundo, verEtapa) {
  const e = garantirEspinha(espinha);
  const cumpridos = [];
  let mudou = false;
  const atos = e.atos.map((a) => ({
    ...a,
    marcos: a.marcos.map((m) => {
      if (m.feito || !m.condicao) return m;
      let ok = false;
      try { ok = !!verEtapa(m.condicao, mundo); } catch { ok = false; }
      if (!ok) return m;
      mudou = true;
      cumpridos.push(m);
      return { ...m, feito: true };
    }),
  }));
  return { espinha: mudou ? { ...e, atos } : e, cumpridos };
}

/* ---------------- O QUE VAI À PAUTA ---------------- */
export function linhaDoMarco(m) {
  if (!m) return "";
  const f = feitioDe(m.feitio);
  return `${f.icone} ${m.titulo}${m.onde ? ` — ${m.onde}` : ""}`;
}

export function envelopeDaEspinha(espinha, ato, est) {
  const m = marcoAtual(espinha, ato);
  if (!m) return "";
  const p = progressoDoAto(espinha, ato);
  const nome = ((est && est.etapas && est.etapas[ato]) || {}).nome || "";
  return `ESPINHA — ${nome ? `${nome}, ` : ""}marco ${p.feitos + 1} de ${p.total}: ${linhaDoMarco(m)}. Isto foi decidido na criação do mundo e não é sugestão sua: puxe a cena para esse rumo sem anunciá-lo, e NUNCA diga ao jogador que existe uma estrutura. Ele não é obrigado a ir agora — se ele for para outro lado, o mundo espera e o marco continua de pé.`;
}

/* NAO HA resumo de progresso exportado, e a ausencia e a propria regra do
   modulo: uma barra dizendo "12 de 29 marcos" conta ao jogador que existe uma
   estrutura, e saber que faltam dezessete e saber que a historia nao acaba
   agora. O que ele pode ver e o que ja viveu — isso a cronica ja guarda.

   E nao ha SAGA_PROMPT: a instrucao ao Narrador vai junto do marco, na secao
   `momento` da Pauta, onde ela chega com o fato ao lado. Um bloco fixo no
   prompt repetiria a mesma frase em todo turno, inclusive nos turnos em que
   a espinha nao tem nada a dizer. */
