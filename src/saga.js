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
import { locaisDaCidade, genteDoLocal, criaturasDaRegiao, chefesDoMundo, idDoLocal } from "./mundo-base.js";
import { kmEntre } from "./coordenadas.js";
import { contrair } from "./lugar.js";
import { marcarBatidas, antecedenteDe, relogioDoFio, marcaDaEtapa, depoisDaEtapa } from "./batidas.js";
import { FASE_DO_PASSO, FASES } from "./vilao.js";

const entre = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/* ---------------- A CHAVE DE UM CHEFE (nexo, 11/10) ----------------
   O chefe sem nome próprio ("Quimera o Colecionador") tinha por nome curto
   a ESPÉCIE, e a etapa `derrotar` casa por pedaço do nome de quem caiu
   (missoes.js): o fim da campanha fechava ao matar QUALQUER quimera — o
   bicho do mato, ou o chefe secundário da mesma espécie. Em 12 campanhas
   lidas como roteiro, o principal não tinha nome próprio em 6, e 10 tinham
   dois chefes da mesma espécie. Quem tem nome
   próprio casa pelo nome (é como o mundo o regista); quem não tem, pelo
   nome inteiro, que só ele usa. */
const chaveDoChefe = (c) => (c.nomeCurto && norm(c.nomeCurto) !== norm(c.especie) ? c.nomeCurto : c.nome);

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
    /* 30/09 (MM13): e a CHAVE, o id que a base grava quando o lugar entra
       em cena (`Cidade|tipo`). O nome sozinho nunca casava com ele, e todo
       marco "descobrir" ficava de pe para sempre (ver `revelar` em
       missoes.js). So viaja quando existe: espinha antiga fica igual. */
    condicao: (m) => ({ tipo: "revelar", alvo: m.onde, ...(m.chave ? { chave: m.chave } : {}) }),
    consequencia: "revela",
  },
  /* NÃO EXISTE AQUI UM FEITIO DE ENTREGA, e a ausência é decisão: `levar_a`
     confere se o item está na bolsa, e nada no jogo entrega ao herói "o
     fardo pesado demais para um só". A primeira sonda estendeu justamente
     esse marco como abertura da campanha — um marco impossível de cumprir,
     bem no lugar onde a história começa. Volta no dia em que a espinha
     souber pôr o objeto na mão de alguém. */
  /* O FEITIO DE MASMORRA (MM17 C1, 06/10). Até aqui não existia, e a
     ausência era a mesma do de entrega: "descer em X" só se cumpriria por
     `ir_a` — chegar à boca da mina —, e chegar não é descer. Agora a
     masmorra PUBLICA o fim: quando o chefe do fundo cai, o App grava o
     lugar em `base.concluidas` (`concluirLugar`, mundo-base.js), e a etapa
     `concluir_masmorra` (missoes.js) lê isso. O feitio NÃO entra na roleta
     de `estenderEspinha` — o continente sai daqui igual, marco a marco; só
     a amarração da região (`espinhaNaRegiao`, regiao.js) o põe nos lugares
     do meio e do clímax, onde cada ato da história mora. */
  descer: {
    id: "descer", icone: "🕳", peso: "missao_forcada",
    titulo: () => "Chegar ao fundo",
    condicao: (m) => ({ tipo: "concluir_masmorra", alvo: m.onde }),
    consequencia: "abre_caminho",
  },
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
  const f = o.fio && typeof o.fio === "object" ? o.fio : null;
  return {
    estrutura: estruturaPorId(o.estrutura).id,
    semente: String(o.semente || ""),
    /* O FIO (nexo, 11/10): quem está no fim da espinha e o que quer. Campo
       NOVO no save, e só aditivo — a versão antiga ignora-o, e a espinha
       antiga, sem ele, tira o antagonista do próprio confronto (`sombraDe`). */
    ...(f && f.antagonista ? { fio: {
      antagonista: String(f.antagonista || "").slice(0, 60),
      titulo: String(f.titulo || "").slice(0, 40),
      especie: String(f.especie || "").slice(0, 40),
      motivo: String(f.motivo || "").slice(0, 80),
      /* MM (a campanha que prende): o passado do herói, de onde sai o que
         está em jogo em cada batida (batidas.js). Só aditivo. */
      ...(antecedenteDe(f.antecedente) ? { antecedente: antecedenteDe(f.antecedente) } : {}),
      /* o relógio do antagonista (batidas.js): o dia em que a espinha nasceu
         e o bilhete sem palavras que ele deixa */
      ...(Number.isFinite(f.inicio) ? { inicio: f.inicio } : {}),
      ...(f.assinatura ? { assinatura: String(f.assinatura).slice(0, 60) } : {}),
    } } : {}),
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
        /* nexo (11/10): a CIDADE do marco, quando o onde é um local dela ("Rua
           dos Retalhos" não diz em que terra fica). Campo novo, só aditivo:
           a espinha antiga não o tem e continua como era. */
        ...(m && m.cidade ? { cidade: String(m.cidade).slice(0, 50) } : {}),
        regiao: String((m && m.regiao) || "").slice(0, 40),
        ehLugar: !!(m && m.ehLugar),
        quantos: Math.max(1, Number(m && m.quantos) || 1),
        condicao: (m && m.condicao) || null,
        feito: !!(m && m.feito),
        /* MM (a campanha que prende): a BATIDA — a cena, o que está em jogo,
           a pergunta (batidas.js). Campo novo, só aditivo: a espinha antiga
           não o tem e o envelope dela continua o de sempre. */
        ...(m && m.batida && typeof m.batida === "object" && m.batida.cena ? { batida: {
          cena: String(m.batida.cena).slice(0, 140),
          emJogo: String(m.batida.emJogo || "").slice(0, 240),
          pergunta: String(m.batida.pergunta || "").slice(0, 160),
          fecho: !!m.batida.fecho,
        } } : {}),
        /* o SEGREDO de um "descobrir" (o que o lugar guarda e o que prova) e
           a REVIRAVOLTA do fecho do primeiro ato — batidas.js; só aditivos */
        ...(m && m.segredo && typeof m.segredo === "object" && m.segredo.coisa && m.segredo.diz ? { segredo: {
          coisa: String(m.segredo.coisa).slice(0, 80),
          diz: String(m.segredo.diz).slice(0, 280),
          acha: String(m.segredo.acha || "percepcao").slice(0, 20),
          dc: Math.max(5, Math.min(30, Number(m.segredo.dc) || 15)),
          escondido: !!m.segredo.escondido,
        } } : {}),
        ...(m && m.reviravolta && typeof m.reviravolta === "string" ? { reviravolta: m.reviravolta.slice(0, 320) } : {}),
        /* a etapa do relógio do antagonista que mira este fecho, e o dia em
           que o marco se cumpriu (conferirEspinha) — só aditivos */
        ...(m && m.relogio && typeof m.relogio === "object" && Number.isFinite(m.relogio.passo) ? { relogio: {
          passo: Math.max(0, Math.min(8, Math.round(m.relogio.passo))),
          gente: String(m.relogio.gente || "").slice(0, 60),
          cidade: String(m.relogio.cidade || "").slice(0, 60),
        } } : {}),
        ...(m && Number.isFinite(m.dia) ? { dia: m.dia } : {}),
      })),
    })),
  };
}

/* ---------------- ESTENDER A ESPINHA ----------------
   Uma vez só, na criação do mundo. Determinística: a mesma semente estende
   a mesma espinha, sempre — é o que permite dizer que a história ESTAVA ali
   antes de o jogador perguntar. */
export function estenderEspinha({ semente = "", mapa = null, genero = "Fantasia medieval", molde = null, lex = null, estrutura = "jornada", cidadeInicial = "", antecedente = "", dia = null } = {}) {
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
      fecho.condicao = { tipo: "derrotar", alvo: chaveDoChefe(principal), quantos: 1 };
      peso += pesoDe(feitioDe(fecho.feitio).peso);
      marcarUso(principal.nomeCurto || principal.nome); marcarUso(chaveDoChefe(principal));
    }

    while (peso < custo && tentativas < 24) {
      tentativas += 1;
      const cidade = cidadeDoAto(i, n);
      const regiao = regioes.find((r) => r.nome === cidade.regiao) || (regioes.length ? pick(rnd, regioes) : null);
      const m = { id: `espinha|${i}|${marcos.length}`, onde: cidade.nome, cidade: cidade.nome, regiao: cidade.regiao || (regiao ? regiao.nome : "") };

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
          m.alvo = chaveDoChefe(chefe); marcarUso(chefe.nomeCurto || chefe.nome); m.onde = chefe.covil || cidade.nome; m.cidade = chefe.covil || cidade.nome; m.regiao = chefe.regiao || m.regiao;
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
        m.chave = idDoLocal(cidade.nome, l);
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

  /* O FIO: quem espera no fim, e o que quer — dito do chefe que o mundo já
     criou (o título e o motivo são dele, `chefesDoMundo`), nunca inventado */
  const fio = principal ? {
    antagonista: principal.nome,
    titulo: principal.nome.includes(", ") ? principal.nome.split(", ").slice(1).join(", ") : principal.nome.slice(String(principal.especie || "").length).trim(),
    especie: principal.especie || "",
    motivo: principal.motivo || "",
    /* o dia em que a história começa a correr: o relógio do antagonista
       conta daqui (batidas.js) */
    ...(Number.isFinite(dia) ? { inicio: dia } : {}),
  } : null;
  /* AS BATIDAS (batidas.js): no máximo cinco cenas por ato, cada uma com o
     que está em jogo para ESTE herói e a pergunta que responde. Os marcos
     não mudam — a mesma semente estende a mesma espinha de antes; o que
     nasce é a leitura deles. */
  return garantirEspinha(marcarBatidas({ estrutura: est.id, semente, atos, fio }, { semente, mapa, genero, molde, lex, antecedente }));
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
      /* MM14 (30/09): "Encontrar Delfina — A Porta Aberta" caiu no turno 4
         da sessão de prova com a Delfina a 146 km. A condição do marco
         "procurar" é só o nome (`FEITIOS.procurar.condicao`), e o marco
         sabe ONDE a pessoa está — o `onde` que a linha do marco mostra.
         Encontrar é estar lá (`estaCom`, missoes.js): o marco empresta a
         morada à condição, aqui, sem mudar o que a espinha gravou. */
      /* 11/10: e a CIDADE, quando o marco a guarda (v9.379) — é ela que diz
         se a conversa vista pelo Cronista (`falouCom`, missoes.js) foi no
         sítio certo. `estaCom` não a lê; só a conversa. */
      const cond = m.condicao.tipo === "falar_com" && !m.condicao.onde && m.onde
        ? { ...m.condicao, onde: m.onde, ...(m.cidade ? { cidade: m.cidade } : {}) } : m.condicao;
      let ok = false;
      try { ok = !!verEtapa(cond, mundo); } catch { ok = false; }
      if (!ok) return m;
      mudou = true;
      cumpridos.push(m);
      /* o dia em que se cumpriu: é por ele que o relógio do antagonista
         sabe se o herói chegou antes (batidas.js, relogioDoFio) */
      const dia = mundo && Number.isFinite(mundo.dia) ? mundo.dia : null;
      return { ...m, feito: true, ...(dia != null ? { dia } : {}) };
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

/* ============================================================
   O FIO (nexo, 11/10) — cada peça sabe por que está ali

   A pessoa: *"temos que ver também se essa espinha que criamos tem nexo,
   pois as vezes as coisas sem sentido podem estar vindo dela."* Vinham.
   Lida como um editor lê um roteiro, a espinha de 12 campanhas novas era
   uma lista de chamada: "Encontrar Sigrun", "O que o Mercado da Bota
   esconde", "Acabar com Lobo" — 280 marcos, e NENHUM dizia por que
   importava, o que a pessoa sabia, o que o lugar escondia, nem o que tinha
   a ver com o antagonista do fim, que só aparecia no último marco. O
   Narrador recebia "puxe a cena para esse rumo" e tinha de inventar o
   rumo: a razão de procurar Sigrun, o segredo da taverna, a ligação com o
   resto. Inventava uma por turno, e as invenções não casavam.

   O fio é a verdade que faltava, e sai do que a espinha JÁ é — ninguém
   sorteia nada novo:
     · cada peça aponta para a SEGUINTE (a pista que leva à próxima, a
       estrutura de uma investigação): a pessoa SABE o caminho para ela, o
       lugar GUARDA o que aponta para ela, o bicho GUARDA o caminho, o fundo
       da masmorra TEM o que aponta para ela;
     · e o fio inteiro, puxado até ao fim, leva ao antagonista do confronto
       — que se vê aos poucos: no primeiro ato é "alguém que {motivo}", no
       meio tem o título que o mundo lhe dá, no fim tem o nome.
   Só o momento vai ao Narrador: a peça de agora, o que ela dá, e a sombra
   no tamanho deste ato. O resto ele não precisa de saber para narrar.
   ============================================================ */
export const FIO = {
  /* o que a peça de agora dá, pela consequência do feitio */
  da: {
    conhece: "{quem} sabe o caminho para {leva}",
    revela: "{onde} guarda {objeto}, e é isso que aponta para {leva}",
    abre_caminho: "{alvo} guarda o caminho para {leva}; enquanto estiver de pé, ninguém passa",
    fundo: "no fundo de {onde} está o que aponta para {leva}",
    desfecho: "é aqui que o fio acaba: {sombra} espera em {onde}",
  },
  /* como se diz a peça seguinte, do ponto de vista de quem aponta */
  leva: {
    procurar: "{quem}, em {onde}{naCidade}",
    descobrir: "o que {onde} esconde{naCidade}",
    enfrentar: "{alvo}, em {onde}",
    descer: "{onde}",
    confronto: "{sombra}, em {onde}",
  },
  /* o que um lugar guarda: concreto, para o Narrador não ter de eleger o
     segredo (é o que `segredo-guardado.js` lhe proíbe) — escolhido pela
     semente do marco, sempre o mesmo */
  objetos: [
    "uma carta que nunca foi entregue",
    "um livro de contas com uma página arrancada",
    "um selo partido de quem não devia ter estado ali",
    "um mapa riscado à mão",
    "um nome escrito onde ninguém olha",
    "uma coisa que não é desta terra",
  ],
  /* a sombra, no tamanho do ato: o herói vai sabendo quem é */
  sombra: {
    inicio: "alguém que {motivo}",
    meio: "{titulo}, que {motivo}",
    fim: "{nome}, que {motivo}",
  },
  /* a espinha antiga não guardou o motivo: a sombra diz-se sem ele */
  semMotivo: { inicio: "quem está por trás de tudo", meio: "{titulo}", fim: "{nome}" },
  /* o nome curto da sombra, quando é a peça seguinte */
  curta: { inicio: "quem está por trás de tudo", meio: "{titulo}", fim: "{nome}" },
  diz: "O FIO (do sistema — é a verdade desta peça): {da}; e o fio inteiro, puxado até ao fim, leva a {sombra}. O que a peça sabe ou guarda só se diz quando o herói chega a ela, e não há outra razão para ela estar aqui — não invente uma.",
  /* a mesma regra em metade do tamanho, para a espinha com batidas: o que a
     batida acrescenta (a cena, o que está em jogo, a pergunta) paga-se com
     o que esta frase tinha de repetido — a pauta tem teto (TETO_DA_PAUTA) */
  dizCurto: "O FIO (do sistema — a verdade desta peça): {da}; puxado até ao fim, leva a {sombra}. Só se diz quando o herói chega; não invente outra razão.",
  /* o que um lugar guarda quando a espinha nasceu com o segredo dele: a
     coisa, o que ela prova, e o teste — que decide o preço, não se se acha:
     uma pista central que o dado esconde é uma história que pára */
  segredo: "guarda-se aqui {coisa}: {diz} (procurando: {acha} CD {dc}; falhar custa tempo, não o segredo)",
  /* a reviravolta do ato 0 é a verdade da peça — o que ela dá */
  reviravolta: "a REVIRAVOLTA do ato, que esta cena entrega inteira: {rev}",
};

const encherFio = (tpl, v) => String(tpl || "").replace(/\{(\w+)\}/g, (_, k) => (v[k] == null ? "" : String(v[k])));

/* quem está no fim: o fio gravado na criação, ou — espinha antiga — o
   próprio confronto (nome e título, sem motivo) */
function sombraDe(e) {
  if (e.fio && e.fio.antagonista) return { nome: e.fio.antagonista, titulo: e.fio.titulo || e.fio.antagonista, motivo: e.fio.motivo || "" };
  const f = e.atos.flatMap((a) => a.marcos).filter((m) => m.feitio === "confronto").pop();
  if (!f || !f.alvo) return null;
  const nome = f.alvo;
  return { nome, titulo: nome.includes(", ") ? nome.split(", ").slice(1).join(", ") : nome, motivo: "" };
}

/* A linha do fio para o marco `m` (o atual do ato `ato`). "" sem sombra. */
function linhaDoFio(e, m, ato, { curto = false } = {}) {
  const p = pecasDoFio(e, m, ato, { curto });
  return p ? contrair(encherFio(curto ? FIO.dizCurto : FIO.diz, p)) : "";
}

/* as peças da linha do fio: o que esta peça dá, a sombra, e a peça seguinte */
function pecasDoFio(e, m, ato, { curto = false } = {}) {
  const s = sombraDe(e);
  if (!s) return "";
  const ultimo = e.atos.length - 1;
  const fase = ato <= 0 ? "inicio" : ato >= ultimo ? "fim" : "meio";
  const sombra = encherFio((s.motivo ? FIO.sombra : FIO.semMotivo)[fase], s);
  const curta = encherFio(FIO.curta[fase], s);
  /* a peça seguinte: a primeira de pé depois desta, na ordem da espinha */
  const ordem = e.atos.flatMap((a) => a.marcos);
  const i = ordem.findIndex((x) => x.id === m.id);
  const prox = ordem.slice(i + 1).find((x) => !x.feito) || null;
  /* a cidade da peça seguinte, quando o onde é um local dela */
  const naCidade = prox && prox.cidade && norm(prox.cidade) !== norm(prox.onde) ? `, em ${prox.cidade}` : "";
  const leva = prox ? encherFio(FIO.leva[prox.feitio] || FIO.leva.descer, { ...prox, sombra: curta, naCidade }) : curta;
  let da;
  if (m.feitio === "confronto") da = encherFio(FIO.da.desfecho, { sombra: curta, onde: m.onde });
  else if (m.feitio === "descer") da = encherFio(FIO.da.fundo, { onde: m.onde, leva });
  else if (curto && m.reviravolta) da = encherFio(FIO.reviravolta, { rev: encherFio(m.reviravolta, { sombra: curta, leva }) });
  else if (curto && m.segredo) da = encherFio(FIO.segredo, { ...m.segredo, diz: encherFio(m.segredo.diz, { sombra: curta, leva }) });
  else {
    const c = feitioDe(m.feitio).consequencia;
    const r = rngDe(`${e.semente}|fio|${m.id}`);
    const objeto = FIO.objetos[Math.floor(r() * FIO.objetos.length)];
    da = encherFio(FIO.da[c] || FIO.da.conhece, { ...m, leva, objeto });
  }
  return { da, sombra, curta, leva };
}

/* a sombra curta no tamanho do ato — o que enche o {sombra} das batidas */
function sombraCurta(e, ato) {
  const s = sombraDe(e);
  if (!s) return "quem está por trás de tudo";
  const ultimo = e.atos.length - 1;
  return encherFio(FIO.curta[ato <= 0 ? "inicio" : ato >= ultimo ? "fim" : "meio"], s);
}

/* ---------------- O ENVELOPE DA ESPINHA COM BATIDAS ----------------
   A batida diz a cena, o que está em jogo e a pergunta; o caminho (o bicho,
   o fundo) diz para que batida leva. A regra de não anunciar a estrutura é
   a mesma, dita uma vez e curta. */
const maiuscula = (x) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x);
export const ENVELOPE_DAS_BATIDAS = {
  fecho: "Fecho do ato: acabe numa escolha com preço, não num presságio.",
  regra: "Puxe para aí sem anunciar; NUNCA diga ao jogador que existe uma estrutura. Se ele for a outro lado, isto espera.",
};
function envelopeDasBatidas(e, m, ato, nome) {
  const ms = marcosDoAto(e, ato);
  const bats = ms.filter((x) => x.batida);
  const i = bats.findIndex((x) => x.id === m.id);
  const curta = sombraCurta(e, ato);
  const enche = (x) => encherFio(x, { sombra: curta });
  const partes = [];
  if (m.batida) {
    /* a cena já diz quem e onde; o título ("Encontrar X") seria a mesma
       coisa duas vezes */
    partes.push(`ESPINHA — ${nome ? `${nome}, ` : ""}batida ${i + 1} de ${bats.length}: ${feitioDe(m.feitio).icone} ${enche(m.batida.cena)}.`);
    /* na batida da reviravolta, ela é o que está em jogo (diz-se no fio) */
    partes.push(`${m.reviravolta ? "" : `EM JOGO: ${enche(m.batida.emJogo)}. `}A PERGUNTA: ${maiuscula(enche(m.batida.pergunta))}`);
  } else {
    /* o caminho leva à batida seguinte — a deste ato, ou, depois do fecho,
       a primeira do ato que vem */
    const ordem = e.atos.flatMap((a) => a.marcos);
    const alvo = ordem.slice(ordem.findIndex((x) => x.id === m.id) + 1).find((x) => x.batida && !x.feito) || null;
    partes.push(`ESPINHA — ${nome ? `${nome}, ` : ""}a caminho${alvo ? ` de ${encherFio(alvo.batida.cena, { sombra: curta })}` : ""}: ${linhaDoMarco(m)}.`);
  }
  let fio = "";
  try { fio = linhaDoFio(e, m, ato, { curto: true }); } catch { fio = ""; }
  if (fio) partes.push(fio);
  if (m.batida && m.batida.fecho) partes.push(ENVELOPE_DAS_BATIDAS.fecho);
  partes.push(ENVELOPE_DAS_BATIDAS.regra);
  return contrair(partes.join(" "));
}

export function envelopeDaEspinha(espinha, ato, est) {
  const e = garantirEspinha(espinha);
  const m = marcoAtual(e, ato);
  if (!m) return "";
  const nome = ((est && est.etapas && est.etapas[ato]) || {}).nome || "";
  /* a espinha que nasceu com batidas fala por elas; a de um save antigo,
     como sempre falou */
  if (e.atos.some((a) => a.marcos.some((x) => x.batida))) return envelopeDasBatidas(e, m, ato, nome);
  const p = progressoDoAto(e, ato);
  let fio = "";
  try { fio = linhaDoFio(e, m, ato); } catch { fio = ""; }
  return `ESPINHA — ${nome ? `${nome}, ` : ""}marco ${p.feitos + 1} de ${p.total}: ${linhaDoMarco(m)}.${fio ? ` ${fio}` : ""} Isto foi decidido na criação do mundo e não é sugestão sua: puxe a cena para esse rumo sem anunciá-lo, e NUNCA diga ao jogador que existe uma estrutura. Ele não é obrigado a ir agora — se ele for para outro lado, o mundo espera e o marco continua de pé.`;
}

/* ============================================================
   O MOMENTO DO FIO — o que o mundo já mudou, numa linha à parte

   Duas coisas que não cabem no envelope da batida (o teto da pauta é um
   só, e a batida já o enche), e que por isso vão em linhas próprias na
   mesma secção `momento` — cada uma corta sozinha se faltar espaço:

     · JÁ SE SABE — o segredo ou a reviravolta da peça que acabou de cair.
       O marco "descobrir" fecha por o herói estar no lugar; se a cena não
       chegou a mostrar o que lá estava, o Narrador mostra-o agora, e o
       jogador fica a saber o que o sistema sabe. Uma vez: só enquanto a
       peça seguinte está de pé.
     · A MARCA DO ANTAGONISTA — a etapa do relógio do ato de agora
       (batidas.js): a corrida, se o herói ainda pode chegar antes; a
       perda, se chegaram primeiro. E no começo do ato seguinte, o que o
       mundo lembra de quem chegou a tempo.

   `dia` é o dia de agora (sem ele, o último que a espinha conhece).
   `vilao`: a nêmesis que já nasceu DO FIO fala pelos envelopes dela
   (`vilao.js`) — aí o relógio cala-se, para o antagonista não andar duas
   vezes. Devolve as linhas (0 a 3); `porNaPauta` aceita a lista.
   ============================================================ */
export function momentoDoFio(espinha, ato, { dia, vilao } = {}) {
  const e = garantirEspinha(espinha);
  if (!e.atos.some((a) => a.marcos.some((x) => x.batida))) return [];
  const m = marcoAtual(e, ato);
  if (!m) return [];
  const out = [];
  const ordem = e.atos.flatMap((a) => a.marcos.map((x) => ({ x, k: a.ato })));
  const i = ordem.findIndex((y) => y.x.id === m.id);
  const ant = i > 0 ? ordem[i - 1] : null;
  if (ant && ant.x.feito && (ant.x.reviravolta || ant.x.segredo)) {
    let leva = "";
    try { leva = (pecasDoFio(e, ant.x, ant.k, { curto: true }) || {}).leva || ""; } catch { leva = ""; }
    const txt = encherFio(ant.x.reviravolta || ant.x.segredo.diz, { sombra: sombraCurta(e, ant.k), leva });
    out.push(contrair(`JÁ SE SABE (do sistema — o herói achou-o em ${ant.x.onde}; se a cena ainda não o mostrou, mostre-o agora): ${txt}.`));
  }
  const vivo = vilao && typeof vilao === "object" && vilao.daEspinha && vilao.status !== "derrotada";
  if (!vivo) {
    const etapas = relogioDoFio(e, { dia });
    const et = etapas.find((x) => x.ato === ato);
    const assin = (e.fio && e.fio.assinatura) || "";
    const primeiro = e.atos.find((a) => a.ato === ato);
    const noComeco = primeiro && primeiro.marcos.length && primeiro.marcos[0].id === m.id;
    const antes = etapas.find((x) => x.ato === ato - 1);
    if (noComeco && antes && antes.como === "travada") out.push(contrair(maiuscula(depoisDaEtapa(antes)) + "."));
    if (et) out.push(contrair(marcaDaEtapa(et, assin)));
  }
  return out;
}

/* NAO HA resumo de progresso exportado, e a ausencia e a propria regra do
   modulo: uma barra dizendo "12 de 29 marcos" conta ao jogador que existe uma
   estrutura, e saber que faltam dezessete e saber que a historia nao acaba
   agora. O que ele pode ver e o que ja viveu — isso a cronica ja guarda.

   E nao ha SAGA_PROMPT: a instrucao ao Narrador vai junto do marco, na secao
   `momento` da Pauta, onde ela chega com o fato ao lado. Um bloco fixo no
   prompt repetiria a mesma frase em todo turno, inclusive nos turnos em que
   a espinha nao tem nada a dizer. */

/* ============================================================
   A NÊMESIS É QUEM ESTÁ NO FIM (11/10, a auditoria de coerência)

   A fama fazia nascer uma nêmesis com um nome NOVO (`tentarSurgirNemesis`,
   App), e a espinha já tinha o seu antagonista desde a criação do mundo (o
   fio). Toda campanha corria com dois: um que caçava o herói pelos passos do
   plano (`vilao.js`) e outro que esperava no fim do fio — e o Narrador
   recebia os dois no mesmo prompt, sem nada que os ligasse.

   Agora quem jura o fim do herói é o próprio antagonista do fio. O vilão
   continua a ser o de `vilao.js` (o arquétipo, o corpo, o plano, as fases);
   só a identidade vem do fio: o nome pelo qual o mundo o regista, o título
   que o fio lhe dá e o que ele quer.

   O nome é o que a espinha casa (`chaveDoChefe`): quem tem nome próprio é
   ele ("Kael Vento", de "Kael Vento, o Devorador"), e o título vai à parte;
   quem não tem é o nome inteiro ("Quimera do Poço Seco") — o bicho da mesma
   espécie não é ele —, e aí o título do arquétipo fica, para não dizer o
   epíteto duas vezes.

   Fica o de hoje (o vilão como veio) quando: a espinha não tem fio (save
   antigo), o confronto final já se cumpriu, ou o antagonista já caiu. */
export function vilaoDoFio(vilao, espinha, { derrotados = [], dia } = {}) {
  if (!vilao || typeof vilao !== "object") return vilao;
  const e = garantirEspinha(espinha);
  const f = e.fio;
  if (!f || !f.antagonista) return vilao;
  const fim = e.atos.flatMap((a) => a.marcos).filter((m) => m.feitio === "confronto").pop();
  if (fim && fim.feito) return vilao;
  const partes = String(f.antagonista).split(", ");
  const humanoide = partes.length > 1 && !!partes[0].trim();
  const nome = humanoide ? partes[0].trim() : String(f.antagonista).trim();
  if (!nome) return vilao;
  if ((Array.isArray(derrotados) ? derrotados : []).some((d) => norm(d).includes(norm(nome)))) return vilao;
  /* O MESMO RELÓGIO. O antagonista do fio anda desde o primeiro dia
     (batidas.js, relogioDoFio). Se a fama o faz nascer como nêmesis depois de
     ele já ter dado passos, ela nasce no passo onde ele está — o plano não
     volta ao rumor —, e dali anda pelo relógio dela (vilao.js). */
  let plano = {};
  try {
    const caidas = relogioDoFio(e, { dia }).filter((x) => x.como);
    const ult = caidas[caidas.length - 1];
    if (ult && ult.passo > (Number(vilao.passo) || 0)) {
      const fase = (FASES[FASE_DO_PASSO[ult.passo]] || FASES[0]).id;
      plano = { passo: ult.passo, fase, status: ult.passo >= 2 ? "ativa" : vilao.status, ...(ult.caiu != null ? { ultimoPasso: ult.caiu } : {}) };
    }
  } catch { plano = {}; }
  return {
    ...vilao,
    ...plano,
    nome,
    titulo: humanoide && f.titulo ? f.titulo : vilao.titulo,
    ...(f.motivo ? { motivo: f.motivo } : {}),
    /* campo NOVO no save, só aditivo: a versão antiga ignora-o */
    daEspinha: true,
  };
}

/* O ROSTO ESPERA O FIM. A espinha diz o antagonista por camadas — "alguém
   que…" no primeiro ato, o título no meio, o nome só no último (`FIO.sombra`)
   — e o plano do vilão chega ao rosto (a revelação do nome) pelo próprio
   relógio, no quinto passo de nove. Para a nêmesis que nasceu do fio, a
   revelação espera o último ato: o passo que a traria fica por dar, e o plano
   tenta de novo no dia seguinte. A nêmesis que não veio do fio anda como
   sempre andou. */
export function oRostoEspera(espinha, ato, avanco) {
  if (!avanco || !avanco.revelacao || !avanco.vilao || !avanco.vilao.daEspinha) return false;
  const e = garantirEspinha(espinha);
  if (!e.fio || !e.atos.length) return false;
  return (Number(ato) || 0) < e.atos.length - 1;
}

/* A QUEDA DE VERDADE. O vilão não cai antes da hora (`podeCair`, vilao.js):
   a narração que o mata cedo recebe "ele escapa". Mas a nêmesis do fio é o
   chefe do confronto final, e quando ELE cai em combate quem decidiu foi o
   dado, não a narração — o confronto da espinha fecha pelo mesmo nome
   (`derrotar`). Dizer "ele escapa" nesse instante seria a contradição que
   esta etapa veio tirar. Só a morte em combate conta (`derrotados`); a dita
   pela narração continua a passar pela porta de sempre. */
export function caiuOFio(vilao, derrotados = []) {
  if (!vilao || !vilao.daEspinha || !vilao.nome) return false;
  return (Array.isArray(derrotados) ? derrotados : []).some((d) => norm(d).includes(norm(vilao.nome)));
}
