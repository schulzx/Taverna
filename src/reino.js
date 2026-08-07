/* Taverna v6.5 — REINO PROFUNDO (tudo em código, zero tokens).
   Cada domínio do jogador tem POPULAÇÃO e FELICIDADE vivas: a felicidade
   deriva aos poucos para o equilíbrio, sofre com eventos e modula a renda.
   Eventos de reino saem por tabela a cada dia passado — a IA só narra o
   envelope com o resultado já rolado. */

const POP_BASE = { vila: 300, cidade: 1200, capital: 4000, fortaleza: 500, porto: 900, aldeia: 150 };

export function garantirReino(reino, mapa) {
  const dominios = ((mapa && mapa.cidades) || []).filter((c) => c.relacao === "jogador");
  let r = reino && typeof reino === "object" ? { ...reino } : {};
  let tocou = false;
  for (const c of dominios) {
    if (!r[c.nome]) {
      const base = POP_BASE[(c.tipo || "cidade").toLowerCase()] || 800;
      r[c.nome] = { populacao: Math.round(base * (0.8 + Math.random() * 0.5)), felicidade: 55 + Math.floor(Math.random() * 15) };
      tocou = true;
    }
  }
  /* domínios perdidos saem do registro */
  for (const nome of Object.keys(r)) {
    if (!dominios.some((c) => c.nome === nome)) { delete r[nome]; tocou = true; }
  }
  return tocou ? r : reino || {};
}

/* Multiplicador de renda pela felicidade: povo feliz produz mais. */
export const fatorFelicidade = (fel) => Math.round((0.5 + Math.max(0, Math.min(100, fel)) / 100) * 100) / 100;

export function fatorMedioReino(reino) {
  const vals = Object.values(reino || {});
  if (!vals.length) return 1;
  const media = vals.reduce((s, v) => s + (v.felicidade || 0), 0) / vals.length;
  return fatorFelicidade(media);
}

export const EVENTOS_REINO = [
  { id: "colheita", titulo: "Colheita farta", peso: 16, fel: +8, cofre: (pop) => Math.round(pop / 40), txt: (c) => `Os campos de ${c} deram mais do que se esperava. Os celeiros enchem e o povo sorri.` },
  { id: "caravana", titulo: "Caravana mercante", peso: 14, fel: +3, cofre: (pop) => Math.round(pop / 60), txt: (c) => `Uma caravana carregada escolheu ${c} como parada. Taxas e comércio aquecido.` },
  { id: "festival", titulo: "Festival espontâneo", peso: 10, fel: +10, cofre: () => 0, txt: (c) => `Músicos e barracas tomaram as ruas de ${c} — o povo celebra a vida sob o seu domínio.` },
  { id: "nascimentos", titulo: "Leva de nascimentos", peso: 10, fel: +4, pop: (pop) => Math.round(pop * 0.03) + 5, cofre: () => 0, txt: (c) => `As parteiras de ${c} mal dormiram: muitas crianças novas choram nas manhãs.` },
  { id: "peregrinos", titulo: "Peregrinos de passagem", peso: 8, fel: +2, cofre: (pop) => Math.round(pop / 80), txt: (c) => `Peregrinos atravessam ${c} deixando moedas em estalagens e capelas.` },
  { id: "crime", titulo: "Onda de furtos", peso: 10, fel: -8, cofre: () => 0, txt: (c) => `Uma quadrilha anda agindo à noite em ${c}. O povo reclama da falta de vigilância.` },
  { id: "praga", titulo: "Praga nos celeiros", peso: 7, fel: -12, pop: (pop) => -Math.round(pop * 0.02) - 3, cofre: () => 0, txt: (c) => `Ratos e mofo atacaram os celeiros de ${c}. O pão ficou caro e o humor, azedo.` },
  { id: "incendio", titulo: "Incêndio acidental", peso: 5, fel: -10, cofre: (pop) => -Math.round(pop / 50), txt: (c) => `Um incêndio destruiu casas em ${c}. Reconstruir vai custar — e o povo quer respostas.` },
  { id: "boato", titulo: "Boato de ameaça", peso: 8, fel: -6, cofre: () => 0, txt: (c) => `Corre em ${c} um boato de guerra no horizonte. Ninguém sabe de onde veio, mas todos repetem.` },
  { id: "disputa", titulo: "Disputa entre guildas locais", peso: 6, fel: -5, cofre: () => 0, txt: (c) => `Comerciantes rivais de ${c} se acusam de sabotagem e o mercado amanheceu tenso.` },
  { id: "rebeliao", titulo: "Murmúrios de revolta", peso: 99, fel: -15, soSeInfeliz: true, cofre: () => 0, txt: (c) => `Em ${c} o descontentamento virou cochicho aberto contra o seu governo. Se nada mudar, pode virar chama.` },
];

/* Rola UM evento de reino (ou nenhum). Retorna { cidade, evento, pop, fel, cofreDelta } ou null. */
export function rolarEventoReino(reino, mapa) {
  const dominios = ((mapa && mapa.cidades) || []).filter((c) => c.relacao === "jogador");
  if (!dominios.length || Math.random() > 0.45) return null;
  const cidade = dominios[Math.floor(Math.random() * dominios.length)];
  const felAtual = (reino[cidade.nome] && reino[cidade.nome].felicidade) || 60;
  const pool = EVENTOS_REINO.filter((e) => (e.soSeInfeliz ? felAtual < 40 : true));
  const total = pool.reduce((s, e) => s + (e.peso > 90 && e.soSeInfeliz ? 0 : e.peso), 0);
  let r = Math.random() * total;
  let ev = pool[0];
  for (const e of pool) { r -= e.peso; if (r <= 0) { ev = e; break; } }
  const pop = (reino[cidade.nome] && reino[cidade.nome].populacao) || 800;
  return { cidade: cidade.nome, evento: ev, cofreDelta: ev.cofre ? ev.cofre(pop) : 0, popDelta: ev.pop ? ev.pop(pop) : 0, felDelta: ev.fel || 0 };
}

/* Avança um dia no reino: deriva da felicidade + evento por tabela.
   Retorna { reino, evento } — o evento já vem com números prontos para narrar. */
export function processarDiaReino(reinoAtual, mapa, alvosFelicidade) {
  let reino = garantirReino(reinoAtual, mapa) || {};
  /* deriva: felicidade tende ao equilíbrio 55 (povo esquece glórias e perdoa desgraças).
     TEMPLOS (v8.9): onde há para onde rezar, o equilíbrio é mais alto — um povo
     com fé aguenta mais desgraça antes de virar murmúrio de revolta. */
  reino = Object.fromEntries(Object.entries(reino).map(([nome, v]) => {
    const alvo = (alvosFelicidade && alvosFelicidade[nome]) || 55;
    const d = v.felicidade < alvo ? 1 : v.felicidade > alvo ? -1 : 0;
    return [nome, { ...v, felicidade: Math.max(0, Math.min(100, v.felicidade + d)) }];
  }));
  const ev = rolarEventoReino(reino, mapa);
  if (ev) {
    const v = reino[ev.cidade] || { populacao: 800, felicidade: 60 };
    reino = { ...reino, [ev.cidade]: { populacao: Math.max(30, v.populacao + (ev.popDelta || 0)), felicidade: Math.max(0, Math.min(100, v.felicidade + (ev.felDelta || 0))) } };
  }
  return { reino, evento: ev };
}
