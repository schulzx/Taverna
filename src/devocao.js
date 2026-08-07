/* ============================================================
   DEVOÇÃO (v8.9) — a fé ancorada na GEOGRAFIA — Taverna

   Até aqui "fiéis" era um número solto: o herói tinha 40.000
   devotos e ninguém sabia ONDE. Agora a fé tem endereço.

   Cada cidade do mapa carrega uma devoção de 0 a 100 ao herói.
   Dela deriva TUDO — e quase nada precisa ser guardado:

     · fiéis do herói   = Σ (população da cidade × devoção/100)
     · patrono da cidade = sorteado pelo NOME (determinístico)
     · fervor do patrono = sorteado pelo nome + porte
     · heresia          = fervor do rival − devoção ao herói
     · renda e felicidade do domínio = modulados pela devoção

   O que o save guarda é só o que ACUMULA: devoção e templo por
   cidade. O resto é conta. A IA nunca inventa nenhum número
   disto: ela no máximo aponta ONDE algo aconteceu, e o código
   mede a população daquele lugar e faz o cálculo.
   ============================================================ */

import { grauDe } from "./divindades.js";

/* ---------------- RNG determinístico (mesmo nome → mesmo resultado) ----------------
   O mesmo truque das sementes de retrato: a cidade nunca "muda de religião"
   entre um carregamento e outro porque nada disso é sorteado em tempo real. */
function rngDe(semente) {
  let h = 2166136261;
  const s = String(semente || "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
}

/* ---------------- TEMPLOS: a fé vira construção ----------------
   O único jeito de a devoção CRESCER sozinha num lugar. Erguer custa
   do cofre da guilda, exige domínio sobre a cidade e um grau mínimo —
   ninguém constrói catedral para um herói que o cosmos ainda ignora. */
export const TEMPLOS = [
  null,
  { nivel: 1, nome: "Santuário", icone: "🕯", custo: 150,  feDia: 0.6, pf: 1, gd: 0, felicidade: 2, desc: "Uma pedra, um nome gravado e velas que ninguém apaga." },
  { nivel: 2, nome: "Templo",    icone: "⛪", custo: 500,  feDia: 1.2, pf: 2, gd: 1, felicidade: 4, desc: "Portas abertas, sacerdócio próprio e ofícios diários." },
  { nivel: 3, nome: "Catedral",  icone: "🏛", custo: 1500, feDia: 2.0, pf: 4, gd: 2, felicidade: 7, desc: "A cidade inteira ouve os sinos — e sabe de quem são." },
];
export const TEMPLO_MAX = 3;
export function temploDe(nivel) { return TEMPLOS[Math.max(0, Math.min(TEMPLO_MAX, nivel || 0))] || null; }
export function proximoTemplo(nivelAtual) { return TEMPLOS[(nivelAtual || 0) + 1] || null; }

/* ---------------- ESTADO DA CIDADE (registro mínimo) ---------------- */
function entradaVazia() { return { fe: 0, templo: 0, desde: 0 }; }
/* 4 casas: numa metrópole de 300 mil almas, 0,0001% ainda é gente de
   verdade — arredondar grosso faria fiéis sumirem no depósito. */
const arred = (x) => Math.round(x * 10000) / 10000;

export function feDaCidade(dev, nome) {
  const e = (dev && dev.cidades && dev.cidades[nome]) || null;
  return e ? Math.max(0, Math.min(100, e.fe || 0)) : 0;
}
export function temploDaCidade(dev, nome) {
  const e = (dev && dev.cidades && dev.cidades[nome]) || null;
  return e ? Math.max(0, Math.min(TEMPLO_MAX, e.templo || 0)) : 0;
}

/* ---------------- PATRONO E FERVOR (calculados, nunca salvos) ----------------
   Cada lugar já rezava para alguém antes de o herói existir. Quem é esse
   alguém sai do nome da cidade contra o panteão conhecido; o quanto o povo
   é fervoroso sai do nome + porte (capital tem catedral; fortaleza, quartel). */
export function patronoDaCidade(cidade, panteao) {
  const lista = (panteao || []).filter((d) => d && d.nome);
  if (!lista.length || !cidade) return null;
  const rnd = rngDe(`patrono|${cidade.nome}`);
  return lista[Math.floor(rnd() * lista.length)] || lista[0];
}
export function fervorDaCidade(cidade) {
  if (!cidade) return 0;
  const rnd = rngDe(`fervor|${cidade.nome}`);
  const porte = cidade.porte || cidade.tipo || "cidade";
  const ajuste = porte === "capital" || porte === "metropole" ? 12
    : porte === "cidade" ? 4
    : porte === "fortaleza" ? -12
    : porte === "ruina" ? -30 : 0;
  return Math.max(0, Math.min(90, Math.round(28 + rnd() * 40 + ajuste)));
}

/* Heresia: o quanto o culto RIVAL ainda manda naquele lugar. É pura
   subtração — devoção ao herói contra o fervor de quem já estava lá. */
export function heresiaDaCidade(cidade, dev) {
  return Math.max(0, fervorDaCidade(cidade) - feDaCidade(dev, cidade.nome));
}

/* ---------------- COMO O HERÓI É RECEBIDO ----------------
   O rótulo que o mapa pinta e que o Mestre lê. Nada aqui é opinião:
   é a devoção medida contra o fervor de quem disputa o mesmo altar. */
export const ESTADOS_FE = {
  santa:       { chave: "santa",       rotulo: "Cidade Santa",  cor: "#F5C878", icone: "🌟", recepcao: "recebem o herói com hinos, procissão e joelhos no chão" },
  devota:      { chave: "devota",      rotulo: "Devota",        cor: "#E8A33D", icone: "🙏", recepcao: "há preces em seu nome nas casas e uma multidão que o reconhece na rua" },
  simpatica:   { chave: "simpatica",   rotulo: "Simpática",     cor: "#7BC98F", icone: "🕯", recepcao: "alguns já rezam para o herói, a maioria só ouviu falar" },
  indiferente: { chave: "indiferente", rotulo: "Indiferente",   cor: "#9A93A6", icone: "·",  recepcao: "o nome do herói não significa nada aqui" },
  herege:      { chave: "herege",      rotulo: "Herege",        cor: "#D86A5B", icone: "⚠",  recepcao: "o culto local trata o herói como falso profeta — sermões contra, portas fechadas" },
  hostil:      { chave: "hostil",      rotulo: "Terra Hostil",  cor: "#C0504D", icone: "🔥", recepcao: "pregar o nome do herói aqui é blasfêmia punível — pedras, denúncia e fogueira" },
};
export function estadoFe(cidade, dev) {
  const fe = feDaCidade(dev, cidade.nome);
  const her = heresiaDaCidade(cidade, dev);
  if (fe >= 60) return ESTADOS_FE.santa;
  if (fe >= 35) return ESTADOS_FE.devota;
  if (fe >= 15) return ESTADOS_FE.simpatica;
  if (her >= 55) return ESTADOS_FE.hostil;
  if (her >= 35) return ESTADOS_FE.herege;
  return ESTADOS_FE.indiferente;
}

/* ---------------- A CONTA QUE SUBSTITUI O NÚMERO SOLTO ----------------
   Fiéis deixam de ser um contador: são gente que mora em algum lugar. */
export function fieisDaCidade(cidade, dev) {
  return Math.round((cidade.populacao || 0) * feDaCidade(dev, cidade.nome) / 100);
}
export function fieisTotais(mapa, dev) {
  const cidades = (mapa && mapa.cidades) || [];
  const emCidades = cidades.reduce((s, c) => s + fieisDaCidade(c, dev), 0);
  return emCidades + Math.max(0, Math.round((dev && dev.andarilhos) || 0));
}
export function resumoNumerico(mapa, dev) {
  const cidades = (mapa && mapa.cidades) || [];
  const comFe = cidades.filter((c) => feDaCidade(dev, c.nome) > 0);
  return {
    fieis: fieisTotais(mapa, dev),
    andarilhos: Math.max(0, Math.round((dev && dev.andarilhos) || 0)),
    lugares: comFe.length,
    santas: cidades.filter((c) => estadoFe(c, dev).chave === "santa").length,
    heregias: cidades.filter((c) => ["herege", "hostil"].includes(estadoFe(c, dev).chave)).length,
    templos: cidades.reduce((s, c) => s + (temploDaCidade(dev, c.nome) > 0 ? 1 : 0), 0),
    feDia: cidades.reduce((s, c) => s + ((temploDe(temploDaCidade(dev, c.nome)) || {}).pf || 0), 0),
  };
}

/* ---------------- MIGRAÇÃO: ancorar a fé que já existia ----------------
   Um save veterano tem 40.000 fiéis e nenhum endereço. Em vez de zerar
   (roubo) ou ignorar (mentira), a fé antiga é DISTRIBUÍDA pelo mapa
   proporcionalmente à população — o herói acorda com os mesmos fiéis,
   agora sabendo onde eles moram. O que não couber vira andarilho. */
export function garantirDevocao(dev, mapa, divindade) {
  const cidades = (mapa && mapa.cidades) || [];
  const base = dev && typeof dev === "object" && dev.cidades && typeof dev.cidades === "object"
    ? { cidades: { ...dev.cidades }, andarilhos: Math.max(0, Math.round(dev.andarilhos || 0)) }
    : null;

  if (base) {
    /* já existe: só garante entrada para cidades novas e sanidade dos valores */
    for (const c of cidades) {
      const e = base.cidades[c.nome];
      base.cidades[c.nome] = e && typeof e === "object"
        ? { fe: Math.max(0, Math.min(100, Number(e.fe) || 0)), templo: Math.max(0, Math.min(TEMPLO_MAX, Number(e.templo) || 0)), desde: Number(e.desde) || 0 }
        : entradaVazia();
    }
    return base;
  }

  const novo = { cidades: {}, andarilhos: 0 };
  for (const c of cidades) novo.cidades[c.nome] = entradaVazia();

  const fieisAntigos = Math.max(0, Math.round((divindade && divindade.fieis) || 0));
  if (!fieisAntigos) return novo;
  return espalharFieis(novo, mapa, fieisAntigos);
}

/* ---------------- ESPALHAR PELO MUNDO ----------------
   Fé que chega SEM um lugar só seu: a herança de um save antigo, o culto
   de um deus morto no deicídio, uma recalibração que lê a lenda inteira.
   Cai proporcional à população, com teto por cidade — fé difusa não faz
   cidade santa de graça — e o que não couber vira andarilho. */
export function espalharFieis(dev, mapa, fieis, tetoPct = 55) {
  const total = Math.max(0, Math.round(fieis || 0));
  if (!total) return dev;
  const cidades = (mapa && mapa.cidades) || [];
  const popTotal = cidades.reduce((s, c) => s + (c.populacao || 0), 0);
  if (!cidades.length || popTotal <= 0) return { ...dev, andarilhos: (dev.andarilhos || 0) + total };

  const d = { cidades: { ...(dev.cidades || {}) }, andarilhos: dev.andarilhos || 0 };
  let colocados = 0;
  for (const c of cidades) {
    const pop = c.populacao || 0;
    if (!pop) continue;
    const e = d.cidades[c.nome] || entradaVazia();
    const feAtual = e.fe || 0;
    const cota = total * (pop / popTotal);
    const teto = Math.max(tetoPct, feAtual);                 // nunca reduz o que já havia
    const feNovo = Math.min(teto, feAtual + (cota / pop) * 100);
    d.cidades[c.nome] = { ...e, fe: arred(feNovo) };
    colocados += Math.round(pop * (feNovo - feAtual) / 100);
  }
  d.andarilhos = Math.max(0, d.andarilhos + (total - colocados));
  return d;
}

/* ---------------- MOVER A AGULHA ----------------
   Toda mudança de fé passa por aqui. `pontos` são pontos de devoção
   (0-100) na cidade; quem chama traduz o que quiser para isso. */
export function ganharDevocao(dev, nomeCidade, pontos, dia) {
  const d = { cidades: { ...(dev.cidades || {}) }, andarilhos: dev.andarilhos || 0 };
  const atual = d.cidades[nomeCidade] || entradaVazia();
  const fe = Math.max(0, Math.min(100, (atual.fe || 0) + pontos));
  d.cidades[nomeCidade] = { ...atual, fe: arred(fe), desde: atual.desde || dia || 0 };
  return d;
}

/* Converte uma quantidade de FIÉIS num lugar para pontos de devoção.
   É o que amarra a tabela de fé antiga (que fala em pessoas) à
   geografia nova (que fala em porcentagem de uma população real). */
export function fieisParaPontos(cidade, fieis) {
  const pop = (cidade && cidade.populacao) || 0;
  if (!pop) return 0;
  return Math.max(0, (fieis / pop) * 100);
}

/* Deposita fiéis no mundo: na cidade citada, se ela existe no mapa;
   nos andarilhos (estradas, ermos, gente sem endereço), se não.
   Uma aldeia de 300 almas não absorve 5.000 devotos: o que passa de 100%
   TRANSBORDA para os andarilhos em vez de sumir — o número prometido ao
   jogador é sempre o número que ele recebe. */
export function depositarFieis(dev, mapa, nomeLocal, fieis, dia) {
  const total = Math.max(0, Math.round(fieis || 0));
  const alvo = acharCidade((mapa && mapa.cidades) || [], nomeLocal);
  if (!alvo || !alvo.populacao) {
    return { devocao: { ...dev, andarilhos: Math.max(0, (dev.andarilhos || 0) + total) }, cidade: null, pontos: 0, sobra: total, estadoAntes: null, estadoDepois: null };
  }
  const antes = feDaCidade(dev, alvo.nome);
  const estadoAntes = estadoFe(alvo, dev);
  const depois = Math.min(100, antes + fieisParaPontos(alvo, total));
  const absorvidos = Math.round(alvo.populacao * (depois - antes) / 100);
  const sobra = Math.max(0, total - absorvidos);
  let d = ganharDevocao(dev, alvo.nome, depois - antes, dia);
  if (sobra) d = { ...d, andarilhos: (d.andarilhos || 0) + sobra };
  return { devocao: d, cidade: alvo, pontos: Math.round((depois - antes) * 10) / 10, sobra, estadoAntes, estadoDepois: estadoFe(alvo, d) };
}

/* Tirar fé do mundo (deicídio malsucedido, maldição, abandono súbito):
   somem primeiro os andarilhos — gente sem raiz é a primeira a debandar —
   e só depois as cidades, proporcionalmente ao que cada uma devia. */
export function perderFieis(dev, mapa, quantidade) {
  let falta = Math.max(0, Math.round(quantidade || 0));
  if (!falta) return dev;
  const d = { cidades: { ...(dev.cidades || {}) }, andarilhos: dev.andarilhos || 0 };
  const doAndarilho = Math.min(d.andarilhos, falta);
  d.andarilhos -= doAndarilho; falta -= doAndarilho;
  if (!falta) return d;
  const cidades = (mapa && mapa.cidades) || [];
  const total = cidades.reduce((s, c) => s + fieisDaCidade(c, d), 0);
  if (total <= 0) return d;
  const fator = Math.max(0, 1 - falta / total);
  for (const c of cidades) {
    const e = d.cidades[c.nome];
    if (!e || !e.fe) continue;
    d.cidades[c.nome] = { ...e, fe: arred(e.fe * fator) };
  }
  return d;
}

export function acharCidade(cidades, nome) {
  if (!nome) return null;
  const alvo = String(nome).toLowerCase().trim();
  const cs = cidades || [];
  return cs.find((c) => (c.nome || "").toLowerCase() === alvo)
    || cs.find((c) => alvo.includes((c.nome || "").toLowerCase()) || (c.nome || "").toLowerCase().includes(alvo))
    || null;
}

/* ---------------- CONSTRUIR ----------------
   Regra clara para a interface e para o código não divergirem. */
export function podeErguerTemplo({ cidade, devocao, divindade, cofre }) {
  if (!cidade) return { pode: false, motivo: "cidade desconhecida" };
  if (!divindade || !divindade.despertar) return { pode: false, motivo: "o cosmos ainda não te enxerga" };
  if (cidade.relacao !== "jogador") return { pode: false, motivo: "só em domínios seus" };
  const nivel = temploDaCidade(devocao, cidade.nome);
  const alvo = proximoTemplo(nivel);
  if (!alvo) return { pode: false, motivo: "já há uma catedral aqui", alvo: null };
  const gd = grauDe(divindade);
  if (gd < alvo.gd) return { pode: false, motivo: `${alvo.nome} exige GD ${alvo.gd}`, alvo };
  if ((cofre || 0) < alvo.custo) return { pode: false, motivo: `faltam ◉ ${alvo.custo - (cofre || 0)} no cofre`, alvo };
  return { pode: true, motivo: "", alvo };
}

export function erguerTemplo(dev, nomeCidade, dia) {
  const d = { cidades: { ...(dev.cidades || {}) }, andarilhos: dev.andarilhos || 0 };
  const atual = d.cidades[nomeCidade] || entradaVazia();
  const nivel = Math.min(TEMPLO_MAX, (atual.templo || 0) + 1);
  const t = temploDe(nivel);
  /* a inauguração já converte uma parte da cidade — a obra é o milagre */
  const salto = nivel === 1 ? 6 : nivel === 2 ? 10 : 15;
  d.cidades[nomeCidade] = {
    ...atual,
    templo: nivel,
    fe: Math.max(0, Math.min(100, (atual.fe || 0) + salto)),
    desde: atual.desde || dia || 0,
  };
  return { devocao: d, templo: t, salto };
}

/* ---------------- ECONOMIA: fé rende ----------------
   Povo devoto dizima, peregrina e gasta na cidade. Teto baixo de
   propósito: é tempero na renda do reino, não uma segunda economia. */
export function bonusRendaDevocao(fe) { return 1 + Math.max(0, Math.min(100, fe || 0)) / 400; }  // até +25%
/* Um templo eleva o ponto de equilíbrio da felicidade do domínio:
   um povo com para onde rezar aguenta mais desgraça sem revoltar. */
export function alvoFelicidadeComTemplo(nivelTemplo) {
  const t = temploDe(nivelTemplo);
  return 55 + (t ? t.felicidade : 0);
}
export function alvosFelicidade(mapa, dev) {
  const alvos = {};
  for (const c of (mapa && mapa.cidades) || []) {
    const n = temploDaCidade(dev, c.nome);
    if (n > 0) alvos[c.nome] = alvoFelicidadeComTemplo(n);
  }
  return alvos;
}

/* ---------------- O DIA DA FÉ ----------------
   Um dia inteiro de devoção resolvido por código, na ordem em que a
   fé se move de verdade no mundo:
     1. templos pregam        (cresce onde há sacerdócio)
     2. o herói está presente (cresce onde ele pisa)
     3. a fé viaja pelas ROTAS(contágio: peregrinos levam a notícia)
     4. o esquecimento come o resto (míngua onde não há nada disso)
     5. o culto rival empurra de volta (heresia resiste)
   Devolve devoção nova, PF gerado pelos templos e os marcos do dia. */
export const CRESCIMENTO_PRESENCA = 0.4;
export const CONTAGIO_ROTA = 0.14;
export const TETO_CONTAGIO = 45;   // boca a boca leva até aqui; o resto exige templo ou presença
export const MINGUA_BASE = 0.12;
export const PRESSAO_RIVAL = 0.004;

export function processarDiaFe({ mapa, devocao, divindade, dia, cidadeAtual }) {
  const cidades = (mapa && mapa.cidades) || [];
  const rotas = (mapa && mapa.rotas) || [];
  if (!divindade || !divindade.despertar) return { devocao, pf: 0, marcos: [] };
  /* andarilhos não têm templo nem vizinho: a fé sem endereço se dispersa sempre */
  const semRaiz = Math.max(0, (devocao.andarilhos || 0) - Math.ceil((devocao.andarilhos || 0) * 0.01));
  if (!cidades.length) return { devocao: { ...devocao, andarilhos: semRaiz }, pf: 0, marcos: [] };

  const gd = grauDe(divindade);
  const antes = {};
  for (const c of cidades) antes[c.nome] = feDaCidade(devocao, c.nome);

  const vizinhos = (nome) => rotas
    .filter((r) => r.de === nome || r.para === nome)
    .map((r) => (r.de === nome ? r.para : r.de));

  let d = { cidades: { ...(devocao.cidades || {}) }, andarilhos: semRaiz };
  let pf = 0;
  const aqui = cidadeAtual ? String(cidadeAtual).toLowerCase() : "";
  /* Templo trabalha na ausência do herói — mas não para sempre. Passados
     dois meses sem nenhum sinal dele, o próprio clero começa a pregar com
     menos convicção: a devoção continua rendendo, só que cada vez menos.
     É o que substitui o antigo decaimento global por sumiço. */
  const semSinal = Math.max(0, (dia || 0) - (divindade.ultimoFeitoDia || 0));
  const fervorClero = semSinal <= 60 ? 1 : Math.max(0.25, 1 - (semSinal - 60) / 240);

  for (const c of cidades) {
    const feAtual = antes[c.nome];
    const nivelT = temploDaCidade(d, c.nome);
    const t = temploDe(nivelT);
    const espaco = 1 - feAtual / 100;          // quanto ainda dá para converter
    let delta = 0;

    if (t) { delta += t.feDia * espaco * fervorClero; pf += t.pf; }
    if (aqui && c.nome.toLowerCase() === aqui) delta += CRESCIMENTO_PRESENCA * espaco;

    /* Contágio pelas rotas: a fé anda por estrada, não por teletransporte.
       Só escorre LADEIRA ABAIXO (de quem crê mais para quem crê menos) e
       só até TETO_CONTAGIO — notícia de milagre converte a primeira leva,
       nunca uma cidade inteira. Sem isso a fé subiria sozinha para sempre. */
    if (feAtual < TETO_CONTAGIO) {
      const folga = 1 - feAtual / TETO_CONTAGIO;
      for (const vz of vizinhos(c.nome)) {
        const feVz = antes[vz] || 0;
        if (feVz >= 40 && feVz > feAtual + 10) delta += CONTAGIO_ROTA * (feVz / 100) * folga;
      }
    }

    /* esquecimento e pressão do culto local — quem já é divindade resiste melhor */
    const protegido = !!t || (aqui && c.nome.toLowerCase() === aqui);
    if (!protegido && feAtual > 0) delta -= MINGUA_BASE * (1 - gd * 0.15);
    const her = Math.max(0, fervorDaCidade(c) - feAtual);
    if (her > 0 && feAtual > 0) delta -= PRESSAO_RIVAL * her * (1 - gd * 0.15);

    if (delta !== 0) d = ganharDevocao(d, c.nome, delta, dia);
  }

  /* MARCOS: só o que mudou de PATAMAR vira notícia — o resto é maré. */
  const marcos = [];
  for (const c of cidades) {
    const de = antes[c.nome], para = feDaCidade(d, c.nome);
    const eDe = estadoFe(c, { cidades: { [c.nome]: { fe: de } } });
    const ePara = estadoFe(c, { cidades: { [c.nome]: { fe: para } } });
    if (eDe.chave === ePara.chave) continue;
    /* "virou indiferente" não é notícia: é o estado neutro, e sair da
       heresia por acúmulo lento não merece anúncio no chat do jogador. */
    if (ePara.chave === "indiferente") continue;
    const subiu = para > de;
    marcos.push({
      cidade: c.nome, de: eDe, para: ePara, subiu, fe: Math.round(para),
      texto: subiu
        ? `${ePara.icone} ${c.nome} agora é ${ePara.rotulo.toLowerCase()} — ${ePara.recepcao}.`
        : `${ePara.icone} A fé em ${c.nome} recuou: virou ${ePara.rotulo.toLowerCase()}.`,
    });
  }
  return { devocao: d, pf, marcos };
}

/* ---------------- O QUE O MESTRE PRECISA SABER ----------------
   Compacto de propósito: só lugares onde a fé importa (devoção ou
   heresia relevantes), no máximo 12 linhas. O resto ele nem vê. */
export function resumoFePrompt(mapa, dev, divindade) {
  if (!divindade || !divindade.despertar) return "";
  const cidades = (mapa && mapa.cidades) || [];
  if (!cidades.length) return "";
  const num = resumoNumerico(mapa, dev);
  const panteao = divindade.panteao || [];

  const relevantes = cidades
    .map((c) => ({ c, fe: feDaCidade(dev, c.nome), est: estadoFe(c, dev), her: heresiaDaCidade(c, dev) }))
    .filter((o) => o.fe >= 8 || o.est.chave === "herege" || o.est.chave === "hostil")
    .sort((a, b) => (b.fe - a.fe) || (b.her - a.her))
    .slice(0, 12);

  if (!relevantes.length) return `FÉ NA GEOGRAFIA: o nome do herói ainda não é rezado em nenhuma cidade do mapa (${num.andarilhos} devotos avulsos pelas estradas). Devoção só nasce de feitos testemunhados e de templos erguidos.`;

  const linhas = relevantes.map(({ c, fe, est, her }) => {
    const nivelT = temploDaCidade(dev, c.nome);
    const t = temploDe(nivelT);
    const patrono = patronoDaCidade(c, panteao);
    const rival = her >= 25 && patrono ? ` · culto rival de ${patrono.nome} ainda domina (${her}%)` : "";
    return `• ${c.nome} — ${est.rotulo.toUpperCase()}: ${Math.round(fe)}% devotos (≈${fieisDaCidade(c, dev).toLocaleString("pt-BR")} fiéis)${t ? ` · ${t.nome} erguido` : ""}${rival}. Aqui ${est.recepcao}.`;
  });

  return [
    `FÉ NA GEOGRAFIA (fato do sistema — a devoção tem endereço; NÃO invente adoração nem hostilidade fora desta lista):`,
    ...linhas,
    `Total: ${num.fieis.toLocaleString("pt-BR")} fiéis em ${num.lugares} lugar(es)${num.andarilhos ? ` + ${num.andarilhos.toLocaleString("pt-BR")} andarilhos sem cidade` : ""} · ${num.templos} templo(s) · ${num.santas} cidade(s) santa(s) · ${num.heregias} onde o herói é herege.`,
  ].join("\n");
}

export const DEVOCAO_PROMPT = `FÉ ANCORADA NA GEOGRAFIA (v8.9 — o sistema calcula, você narra):
- A devoção ao herói existe POR CIDADE (0 a 100%), nunca no ar. Cidade santa recebe com hinos; cidade herege prega contra ele. A lista de FÉ NA GEOGRAFIA é FATO: use-a para decidir como o povo de CADA lugar trata o herói ao chegar — e nunca contradiga o rótulo dela.
- Cada cidade já tinha o SEU deus antes do herói (patrono e fervor definidos pelo sistema). Conquistar fé num lugar é DISPUTAR altar: o culto local resiste, os sacerdotes rivais reagem, e é isso que gera cena.
- Você NÃO envia números de fé. Quando algo digno de devoção acontecer, use a seção "fe" com "acontecimento": {"tipo": "...", "local": "NOME DA CIDADE"} — o local é obrigatório e precisa ser uma cidade do mapa. O sistema mede a população dali e converte em devoção daquela cidade. Sem local, a fé vira "andarilhos" e rende muito menos.
- TEMPLOS são construção do jogador (santuário, templo, catedral), pagos do cofre da guilda em domínios dele. Onde há templo, a fé cresce todo dia e gera Pontos de Fé; onde não há, a fé míngua. Se um templo for erguido, narre a obra e o clero que nasce com ela.
- A fé viaja por ESTRADA: cidades ligadas por rota a um lugar devoto começam a ouvir falar — mas boca a boca sozinho nunca converte uma cidade inteira. Peregrinos, romarias e notícias de milagre são a ficção desse contágio; use-os, e deixe as grandes conversões para o que o herói faz em pessoa.
- Sumir cobra preço: sem templo e sem o herói por perto, a devoção de um lugar míngua todo dia, e depois de dois meses sem nenhum sinal dele até o clero dos templos esfria. Se a fé recuar num lugar, mostre por quê — sacerdote rival ganhando espaço, promessa não cumprida, gente que cansou de esperar.
- Heresia é oportunidade, não punição: numa cidade hostil o herói é hereseiado, expulso, denunciado — e é exatamente ali que uma conversão vale mais.`;
