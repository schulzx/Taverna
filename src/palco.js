/* ============================================================
   O PALCO (v9.157) — a cena ganha corpo — Taverna

   O jogo sabia onde o herói está com uma precisão que nenhum concorrente
   tem: a cidade, o local dentro dela, o bioma, a hora, o clima, o andar
   da masmorra, o trecho de estrada. E a tela não dizia nada disso.

   O lugar vivia só dentro da prosa. Quem entrasse numa sessão no meio
   não sabia onde estava sem ler três parágrafos para trás — e a mesma
   informação estava na barra de baixo, em letra mono de dez pixels, ao
   lado de PV e XP, do jeito que se mostra um número de versão.

   ---------------- O QUE ISTO FAZ, EM UMA LINHA ----------------

   Transforma "chat com painéis" em "lugar". Um cabeçalho que responde
   ONDE e QUANDO antes da primeira palavra da narração, e um TOM que
   muda com o bioma e a hora — a mesma cripta é uma coisa ao meio-dia e
   outra às três da manhã, e o jogo já sabia disso sem nunca ter mostrado.

   ---------------- O QUE ELE NÃO FAZ ----------------

   Não inventa nada. Cada campo aqui vem de um sistema que já decidiu:
   o Geógrafo diz o lugar, o calendário diz a hora, `encontros.js` diz o
   clima, `masmorras.js` diz a sala. Se um deles não sabe, a linha
   simplesmente não aparece — cabeçalho que preenche buraco com adjetivo
   seria o Narrador de novo, e num lugar onde ele não foi convidado.
   ============================================================ */

/* ---------------- OS SEIS MOMENTOS DO DIA ----------------
   Não são as vinte e quatro horas: são os seis estados em que a luz
   muda o que um lugar É. Um pátio ao meio-dia e o mesmo pátio na
   madrugada não são o mesmo cenário, e é essa diferença que a tela
   precisa carregar — não o relógio, que já está na barra. */
export const MOMENTOS = [
  { id: "madrugada", de: 0, ate: 5, rotulo: "madrugada", icone: "🌑", luz: 0.15 },
  { id: "amanhecer", de: 5, ate: 8, rotulo: "amanhecer", icone: "🌅", luz: 0.55 },
  { id: "manha", de: 8, ate: 12, rotulo: "manhã", icone: "🌤", luz: 1 },
  { id: "tarde", de: 12, ate: 17, rotulo: "tarde", icone: "☀", luz: 1 },
  { id: "entardecer", de: 17, ate: 20, rotulo: "entardecer", icone: "🌇", luz: 0.5 },
  { id: "noite", de: 20, ate: 24, rotulo: "noite", icone: "🌙", luz: 0.2 },
];

export function momentoDoDia(minuto) {
  const h = Math.floor((Math.max(0, Number(minuto) || 0) % 1440) / 60);
  return MOMENTOS.find((m) => h >= m.de && h < m.ate) || MOMENTOS[0];
}

/* ---------------- A COR DE CADA CHÃO ----------------
   Uma cor por bioma, e ela é a MESMA família da casa — âmbar sobre
   violeta escuro. Nada aqui é verde-floresta nem azul-mar: um cabeçalho
   que muda de paleta a cada bioma faria o jogo parecer sete jogos.

   O que muda é o DESVIO, pequeno e reconhecível: a floresta puxa para o
   verde-musgo dentro do violeta, o deserto para o ocre, o gelo para o
   azul frio. Quem joga não vai saber nomear a diferença, e vai sentir
   que mudou de lugar. */
export const TONS = {
  planicie: { cor: "#8C7A4A", diz: "campo aberto" },
  floresta: { cor: "#4A7A5C", diz: "mata fechada" },
  colina: { cor: "#7A6B4A", diz: "encosta" },
  montanha: { cor: "#6B7080", diz: "altura e pedra" },
  deserto: { cor: "#A88A4A", diz: "areia e sol" },
  pantano: { cor: "#5A6B4A", diz: "água parada" },
  costa: { cor: "#4A7080", diz: "maresia" },
  gelo: { cor: "#6A88A0", diz: "frio que corta" },
};
export const TOM_PADRAO = { cor: "#6B5F8C", diz: "" };
export const TOM_SUBTERRANEO = { cor: "#5C4A6B", diz: "sob a terra" };

/* A luz do momento escurece ou acende o desvio. É o que faz a mesma
   floresta ser outra coisa na madrugada — e é uma conta, não uma
   segunda tabela: manter duas listas de cor por hora seria manter duas
   verdades sobre o mesmo lugar. */
export function tomDaCena({ bioma = "", minuto = 0, subterraneo = false } = {}) {
  const base = subterraneo ? TOM_SUBTERRANEO : (TONS[String(bioma || "")] || TOM_PADRAO);
  const m = momentoDoDia(minuto);
  /* subterrâneo não tem hora: lá embaixo é sempre a mesma escuridão, e
     fingir que o sol chega seria mentir sobre o único lugar do jogo em
     que a tocha é um recurso */
  const luz = subterraneo ? 0.25 : m.luz;
  return { cor: base.cor, diz: base.diz, luz, momento: m };
}

/* ---------------- O CABEÇALHO ----------------
   Três campos, e cada um só aparece se alguém souber a resposta:

     TÍTULO  o nome do lugar — a cripta, a cidade, o trecho de estrada
     ONDE    o que fica em volta — a cidade-mãe, a região, o bioma
     QUANDO  o momento do dia e o clima

   A ordem é a de quem chega: primeiro o nome, depois o entorno, depois
   as condições. */
/* Lido do objeto, e não desestruturado na assinatura: `= {}` cobre
   `undefined` e NÃO cobre `null`. É a mesma armadilha que a suíte pegou
   em `sessoes.js` na v9.149 — e pela mesma razão de fundo: o que se passa
   aqui é estado de jogo, que é exatamente o tipo de coisa que chega nula
   no dia em que um save vem pela metade. */
export function cabecalhoDaCena(dados) {
  const d = dados && typeof dados === "object" ? dados : {};
  const cidade = d.cidade || "", regiao = d.regiao || "", bioma = d.bioma || "";
  const lugar = d.lugar, masmorra = d.masmorra, jornada = d.jornada;
  const minuto = d.minuto || 0, clima = d.clima;
  const m = momentoDoDia(minuto);
  let titulo = "", icone = "", onde = [], subterraneo = false;

  if (masmorra && masmorra.nome) {
    /* a masmorra manda mais que tudo: estar dentro dela é o estado mais
       forte do jogo, e a cidade lá fora deixa de importar */
    subterraneo = true;
    titulo = masmorra.nome;
    icone = "🕳";
    const sala = (masmorra.salas || []).find((s) => s && s.id === masmorra.atual);
    if (sala && sala.camada != null) onde.push(`camada ${sala.camada}`);
    if (masmorra.tochas != null) onde.push(`${masmorra.tochas} tocha${masmorra.tochas === 1 ? "" : "s"}`);
  } else if (jornada && (jornada.destino || jornada.para)) {
    titulo = `a caminho de ${jornada.destino || jornada.para}`;
    icone = "🧭";
    if (jornada.de) onde.push(`saiu de ${jornada.de}`);
    if (bioma && TONS[bioma]) onde.push(TONS[bioma].diz);
  } else if (lugar && lugar.nome) {
    titulo = lugar.nome;
    icone = "📍";
    if (lugar.cidade) onde.push(`arredores de ${lugar.cidade}`);
    if (bioma && TONS[bioma]) onde.push(TONS[bioma].diz);
  } else if (cidade) {
    titulo = cidade;
    icone = "🏘";
    if (regiao) onde.push(regiao);
    if (bioma && TONS[bioma]) onde.push(TONS[bioma].diz);
  } else {
    /* NADA SABIDO É NADA MOSTRADO. Um cabeçalho que inventa "algum
       lugar" é pior do que cabeçalho nenhum: ele ensina que a linha não
       quer dizer nada, e a partir daí ninguém a lê mais. */
    return null;
  }

  const quando = [`${m.icone} ${m.rotulo}`];
  if (clima && clima.rotulo) quando.push(`${clima.icone || ""} ${clima.rotulo}`.trim());

  return {
    titulo, icone,
    onde: onde.filter(Boolean).join(" · "),
    quando: quando.join(" · "),
    tom: tomDaCena({ bioma, minuto, subterraneo }),
    subterraneo,
  };
}
