/* ============================================================
   TOPONÍMIA (v9.58) — o nome do lugar por combinação

   O relato foi este: "em três das criações tive os mesmos nomes, o
   Javali Cambaleante etc."

   Não era azar nem viés do sorteio — medi, e a distribuição era
   uniforme. Era o TAMANHO do banco. As tavernas tinham 25 nomes
   escritos à mão; o mercado, cinco; a forja, quatro; a arena, três.
   Um mundo nasce com catorze assentamentos, e todos têm mercado.

   Sortear cinco nomes para catorze lugares não é sortear: é repetir
   com uma etapa a mais. A conta do aniversário diz que a chance de
   dois mercados saírem com o mesmo nome NO MESMO MUNDO era de
   praticamente 100%, e foi por isso que a "Feira Baixa" apareceu duas
   vezes na mesma planta. Entre mundos diferentes, uma taverna em cada
   quatro criações repetia — e três criações bastaram para o jogador
   notar.

   A saída não é embaralhar melhor. É ter mais vocabulário.

   COMO FUNCIONA: nomes nascem de PARTES combinadas, não de uma lista.
   Um substantivo com gênero, um adjetivo que concorda com ele, um
   complemento já preposicionado. Três padrões sobre bancos de algumas
   dezenas de palavras dão milhares de nomes por tipo de lugar — e os
   nomes escritos à mão continuam saindo, porque as palavras deles
   estão nos bancos.

   O QUE ISTO NÃO PROMETE: unicidade. Nada aqui olha as outras cidades
   — `locaisDaCidade` é chamado uma cidade por vez, de dentro do painel
   do mapa inclusive, e uma função determinística que precisasse do
   mundo inteiro para nomear uma forja seria pior que o problema.
   O que se compra é probabilidade: de "quase certo que repete" para
   "raro o bastante para não denunciar o gerador". A sonda mede.
   ============================================================ */

/* Um substantivo é "Palavra|g", em que g é m, f, mp ou fp — o p é o
   plural, e ele existe porque "A Termas do Rio Baixo" saiu da primeira
   passada. Um adjetivo é "masc|fem"; sem a barra, não flexiona
   ("Cambaleante", "Sem Fundo"). O plural do adjetivo é o do português:
   acrescenta -s, e -es depois de consoante. */
const sub = (s) => { const [n, g] = s.split("|"); const gg = g || "m"; return { n, g: gg[0] === "f" ? "f" : "m", pl: gg.length > 1 }; };
const adj = (s) => { const [m, f] = s.split("|"); return { m, f: f || m }; };
/* O plural do adjetivo. Curto porque os bancos são escolhidos para caber
   nestas quatro regras — um adjetivo em -il ("frágil" → "frágeis") pede uma
   quinta que só serviria a ele, e é mais barato não ter esse adjetivo. */
const plural = (w) => {
  if (/[aeiouãõ]$/i.test(w)) return w + "s";        // rosa → rosas, órfã → órfãs
  if (/[rz]$/i.test(w)) return w + "es";            // estelar → estelares
  if (/l$/i.test(w)) return w.slice(0, -1) + "is";  // azul → azuis, fatal → fatais
  if (/m$/i.test(w)) return w.slice(0, -1) + "ns";  // comum → comuns
  return w;                                          // -s invariável: simples, grátis
};
/* Locução não é adjetivo e não flexiona: "as águas sem fundo", não "sem
   fundos". A régua é o espaço — o que tem mais de uma palavra é frase. */
const comNumero = (forma, pl) => (pl && !/\s/.test(forma) ? plural(forma) : forma);
const art = (n) => (n.pl ? (n.g === "f" ? "As" : "Os") : n.g === "f" ? "A" : "O");
const artMin = (n) => (n.pl ? (n.g === "f" ? "as" : "os") : n.g === "f" ? "a" : "o");
const de = (n) => (n.pl ? (n.g === "f" ? "das" : "dos") : n.g === "f" ? "da" : "do");

const FANTASIA = {
  subst: [
    "Javali|m", "Corvo|m", "Dragão|m", "Âncora|f", "Coroa|f", "Taça|f", "Punhal|m", "Sereia|f",
    "Machado|m", "Lua|f", "Cavalo|m", "Rosa|f", "Grifo|m", "Bota|f", "Escudo|m", "Cabra|f",
    "Lobo|m", "Espada|f", "Barril|m", "Pena|f", "Ogro|m", "Chama|f", "Trovão|m", "Moeda|f",
    "Cálice|m", "Ferradura|f", "Foice|f", "Elmo|m", "Sino|m", "Ponte|f", "Bigorna|f", "Lança|f",
    "Urso|m", "Falcão|m", "Serpente|f", "Raposa|f", "Texugo|m", "Garça|f", "Touro|m", "Cervo|m",
    "Âmbar|m", "Carvalho|m", "Salgueiro|m", "Espinho|m", "Cardo|m", "Urze|f", "Hera|f", "Trigo|m",
    "Martelo|m", "Roda|f", "Vela|f", "Lanterna|f", "Candeia|f", "Fivela|f", "Corda|f", "Rede|f",
    "Peregrino|m", "Andarilho|m", "Viúva|f", "Rainha|f", "Bruxa|f", "Monge|m", "Arqueiro|m", "Ceifeiro|m",
  ],
  adj: [
    "Cambaleante", "Rachado|Rachada", "Sonolento|Sonolenta", "Enferrujado|Enferrujada", "Torto|Torta",
    "Bêbado|Bêbada", "Dourado|Dourada", "Último|Última", "Manco|Manca", "Negro|Negra",
    "Faminto|Faminta", "Furado|Furada", "Partido|Partida", "Dançante", "Quebrado|Quebrada",
    "Sem Fundo", "Risonho|Risonha", "Azul", "Distante", "Vazio|Vazia",
    "Alegre", "Calado|Calada", "Cego|Cega", "Coxo|Coxa", "Errante",
    "Faiscante", "Devoto|Devota", "Gordo|Gorda", "Honesto|Honesta", "Ingrato|Ingrata",
    "Lento|Lenta", "Magro|Magra", "Mudo|Muda", "Pálido|Pálida", "Paciente",
    "Perdido|Perdida", "Rouco|Rouca", "Sábio|Sábia", "Solitário|Solitária", "Teimoso|Teimosa",
    "Tortuoso|Tortuosa", "Trêmulo|Trêmula", "Velho|Velha", "Vermelho|Vermelha", "Sedento|Sedenta",
  ],
  compl: [
    "das Cinzas", "do Norte", "de Ferro", "de Prata", "do Rei", "da Rainha", "do Vale", "da Foz",
    "de Pedra", "do Sal", "das Três Luas", "do Vento", "da Névoa", "do Ocaso", "da Aurora",
    "do Peregrino", "do Enforcado", "da Viúva", "do Carvoeiro", "do Barqueiro", "das Estradas",
    "do Juramento", "da Promessa", "do Silêncio", "das Sete Portas", "do Corvo", "da Bruma",
    "de Prata Velha", "do Fim do Mundo", "da Última Noite", "dos Andarilhos", "dos Afogados",
    "dos Esquecidos", "das Moedas Falsas", "do Passo Alto", "da Colina", "do Rio Baixo",
    "da Muralha", "do Portão", "da Feira", "do Poço", "da Ponte Torta", "das Velas", "do Trigo",
  ],
};

const SCIFI = {
  subst: [
    "Reator|m", "Órbita|f", "Escotilha|f", "Estrela|f", "Módulo|m", "Antena|f", "Cápsula|f",
    "Satélite|m", "Sonda|f", "Hélice|f", "Doca|f", "Rota|f", "Bússola|f", "Deriva|f", "Câmara|f",
    "Vácuo|m", "Terminal|m", "Núcleo|m", "Prisma|m", "Espectro|m", "Pulsar|m", "Quasar|m",
    "Casco|m", "Turbina|f", "Válvula|f", "Bateria|f", "Chave|f", "Trilho|m", "Elevador|m",
    "Piloto|m", "Náufrago|m", "Colono|m", "Andarilha|f", "Sentinela|f", "Errante|m", "Carga|f",
    "Cinza|f", "Poeira|f", "Silêncio|m", "Sinal|m", "Eco|m", "Ruído|m", "Sombra|f", "Aurora|f",
  ],
  adj: [
    "Frio|Fria", "Baixo|Baixa", "Morto|Morta", "Perdido|Perdida", "Rápido|Rápida", "Quebrado|Quebrada",
    "Fraco|Fraca", "Caído|Caída", "Estelar", "Último|Última", "Aberto|Aberta", "Selado|Selada",
    "Longo|Longa", "Distante", "Mudo|Muda", "Fantasma", "Órfão|Órfã", "Trincado|Trincada", "Denso|Densa",
    "Oco|Oca", "Girante", "Vazio|Vazia", "Pálido|Pálida", "Preso|Presa", "Solto|Solta",
    "Enferrujado|Enferrujada", "Sujo|Suja", "Novo|Nova", "Cego|Cega", "Torto|Torta",
  ],
  compl: [
    "de Vega", "de Órion", "de Kepler", "do Éter", "do Vácuo", "de Titã", "da Cratera",
    "do Perímetro", "do Setor 9", "da Borda", "de Trânsito", "sem Retorno", "do Turno da Noite",
    "dos Fuzileiros", "dos Mineradores", "da Quarentena", "do Cais Longo", "do Anel",
    "da Última Órbita", "de Emergência", "do Cinturão", "da Estação Alta", "dos Náufragos",
    "do Silêncio", "de Carga", "da Escuta", "do Salto", "da Deriva", "do Zênite", "do Nadir",
  ],
};

const CYBER = {
  subst: [
    "Chip|m", "Cabo|m", "Fusível|m", "Tomada|f", "Dose|f", "Injeção|f", "Firewall|m", "Glitch|m",
    "Sinapse|f", "Estática|f", "Latência|f", "Agulha|f", "Máscara|f", "Lente|f", "Placa|f",
    "Corrente|f", "Faísca|f", "Vitrine|f", "Neon|m", "Cromo|m", "Vidro|m", "Aço|m", "Ácido|m",
    "Pixel|m", "Ruído|m", "Fluxo|m", "Nó|m", "Beco|m", "Grade|f", "Torre|f", "Antena|f",
    "Bailarina|f", "Mensageiro|m", "Fantasma|m", "Corvo|m", "Rato|m", "Gata|f", "Vigia|m",
  ],
  adj: [
    "Queimado|Queimada", "Vivo|Viva", "Podre", "Sujo|Suja", "Branco|Branca", "Solto|Solta",
    "Perdido|Perdida", "Frito|Frita", "Curto|Curta", "Aberto|Aberta", "Falso|Falsa", "Barato|Barata",
    "Fatal", "Elétrico|Elétrica", "Pálido|Pálida", "Rachado|Rachada", "Sangrento|Sangrenta",
    "Frio|Fria", "Rápido|Rápida", "Mudo|Muda", "Cego|Cega", "Novo|Nova", "Velho|Velha",
    "Pirata", "Clonado|Clonada", "Alugado|Alugada", "Sem Registro", "Fora do Grid",
  ],
  compl: [
    "do Bloco 7", "da Zona Morta", "do Subsolo", "da Baixa", "do Terceiro Turno", "sem Licença",
    "de Neon", "de Cromo", "do Fio Terra", "da Sarjeta", "dos Sem-Nome", "do Mercado Cinza",
    "da Torre Sul", "do Beco Longo", "das Antenas", "de Segunda Mão", "do Contrabando",
    "do Sinal Fraco", "da Chuva Ácida", "dos Insones", "do Fim da Linha", "do Andar 40",
    "da Grade", "do Firewall", "dos Cabos", "do Corte", "da Overdose", "do Silêncio",
  ],
};

const HORROR = {
  subst: [
    "Vela|f", "Peixe|m", "Âncora|f", "Sino|m", "Ceia|f", "Corvo|m", "Rede|f", "Farol|m",
    "Maré|f", "Ostra|f", "Sussurro|m", "Gaivota|f", "Anzol|m", "Cripta|f", "Bote|m", "Concha|f",
    "Doca|f", "Névoa|f", "Sal|m", "Junco|m", "Musgo|m", "Osso|m", "Pó|m", "Lâmpada|f",
    "Escada|f", "Porta|f", "Janela|f", "Fenda|f", "Poço|m", "Alçapão|m", "Retrato|m", "Espelho|m",
    "Pastor|m", "Viúva|f", "Órfã|f", "Afogado|m", "Sonâmbulo|m", "Fiel|m", "Peregrina|f",
  ],
  adj: [
    "Trêmulo|Trêmula", "Cego|Cega", "Afundado|Afundada", "Rachado|Rachada", "Último|Última",
    "Mudo|Muda", "Vazio|Vazia", "Apagado|Apagada", "Baixo|Baixa", "Podre", "Morto|Morta",
    "Parado|Parada", "Salgado|Salgada", "Antigo|Antiga", "Pálido|Pálida", "Torto|Torta",
    "Úmido|Úmida", "Fechado|Fechada", "Aberto|Aberta", "Esquecido|Esquecida", "Sem Nome",
    "Que Espera", "Que Range", "Que Não Fecha", "Manso|Mansa", "Fundo|Funda", "Frio|Fria",
  ],
  compl: [
    "de Sal", "da Névoa", "do Afogado", "dos Ausentes", "da Maré Morta", "do Sino Rachado",
    "de Baixo", "do Fundo", "sem Nome", "da Vigília", "dos Que Voltaram", "da Nona Hora",
    "do Pântano", "dos Ossos", "da Enseada", "do Farol", "da Casa Vazia", "dos Sonhos",
    "do Sussurro", "da Última Rede", "dos Peixes Cegos", "do Juramento", "da Cripta",
    "do Silêncio", "da Bruma", "das Águas Paradas", "do Que Dorme", "dos Sinos",
  ],
};

const POSAPOC = {
  subst: [
    "Barril|m", "Água|f", "Posto|m", "Dose|f", "Gerador|m", "Sucata|f", "Bunker|m", "Ração|f",
    "Poço|m", "Pó|m", "Contador|m", "Tanque|m", "Antena|f", "Abrigo|m", "Muro|m", "Seca|f",
    "Lata|f", "Corda|f", "Bomba|f", "Filtro|m", "Máscara|f", "Bota|f", "Roda|f", "Cerca|f",
    "Cinza|f", "Ferrugem|f", "Faísca|f", "Chuva|f", "Cruz|f", "Fome|f", "Estrada|f", "Trilho|m",
    "Sobrevivente|m", "Nômade|m", "Carniceiro|m", "Ceifeira|f", "Vigia|m", "Corvo|m", "Rato|m",
  ],
  adj: [
    "de Chumbo", "Quente", "Último|Última", "Enferrujado|Enferrujada", "Seco|Seca", "Ácido|Ácida",
    "Rachado|Rachada", "Vazio|Vazia", "Fundo|Funda", "Torto|Torta", "Quebrado|Quebrada",
    "Marcado|Marcada", "Cego|Cega", "Faminto|Faminta", "Verde", "Cinzento|Cinzenta",
    "Longo|Longa", "Solto|Solta", "Barato|Barata", "Roubado|Roubada", "Sem Dono",
    "Que Sobrou", "Novo|Nova", "Velho|Velha", "Amargo|Amarga", "Salgado|Salgada",
  ],
  compl: [
    "do Poço", "da Cratera", "do Muro", "da Estrada", "do Fim", "dos Sem-Terra", "de Chumbo",
    "do Contador", "da Cerca Viva", "dos Últimos", "do Combustível", "da Ração", "sem Dono",
    "da Zona Verde", "do Filtro", "dos Nômades", "da Chuva Ácida", "do Rádio", "da Antena",
    "dos Que Ficaram", "do Sul Seco", "do Norte Frio", "da Ferrugem", "do Silêncio",
    "das Latas", "do Gerador", "da Última Água", "dos Cães", "do Passo",
  ],
};

const STEAM = {
  subst: [
    "Engrenagem|f", "Caldeira|f", "Válvula|f", "Manômetro|m", "Pistão|m", "Fuligem|f", "Bússola|f",
    "Hélice|f", "Zepelim|m", "Trilho|m", "Chaminé|f", "Corrente|f", "Roldana|f", "Bigorna|f",
    "Latão|m", "Cobre|m", "Vapor|m", "Carvão|m", "Óleo|m", "Fumaça|f", "Faísca|f", "Lente|f",
    "Relógio|m", "Pêndulo|m", "Autômato|m", "Chave|f", "Mola|f", "Âncora|f", "Sino|m", "Farol|m",
    "Aeronauta|m", "Maquinista|m", "Duquesa|f", "Inventor|m", "Corvo|m", "Andarilha|f",
  ],
  adj: [
    "Torto|Torta", "Emperrado|Emperrada", "Dourado|Dourada", "Rangente", "Fumegante",
    "Rachado|Rachada", "Preciso|Precisa", "Atrasado|Atrasada", "Adiantado|Adiantada",
    "Enferrujado|Enferrujada", "Polido|Polida", "Silencioso|Silenciosa", "Girante",
    "Quebrado|Quebrada", "Último|Última", "Novo|Nova", "Velho|Velha", "Faiscante",
    "Barulhento|Barulhenta", "Manso|Mansa", "Solto|Solta", "Fechado|Fechada", "Sem Ponteiros",
  ],
  compl: [
    "de Latão", "de Cobre", "a Vapor", "do Aeronauta", "da Companhia", "do Relojoeiro",
    "das Doze Horas", "do Trilho Alto", "da Chaminé Norte", "dos Maquinistas", "da Exposição",
    "do Zepelim", "sem Ponteiros", "do Carvoeiro", "da Ponte de Ferro", "do Clube",
    "dos Inventores", "da Válvula Presa", "do Meridiano", "da Estação", "do Porão",
    "da Fuligem", "do Terceiro Turno", "das Engrenagens", "do Vapor", "do Contrato",
  ],
};

const BANCO = {
  "Fantasia medieval": FANTASIA, "Ficção científica": SCIFI, "Cyberpunk": CYBER,
  "Horror cósmico": HORROR, "Pós-apocalíptico": POSAPOC, "Steampunk": STEAM,
};
const bancoDe = (g) => BANCO[g] || FANTASIA;

/* Os sinônimos de cada tipo de lugar. É o que impede "A Praça Cambaleante"
   de virar um templo: o substantivo diz de que prédio se trata, e o resto
   do nome só o qualifica. */
const SINONIMOS = {
  /* o mercado leva mais sinônimos do que os outros de propósito: TODA cidade
     tem um, e num mundo de catorze assentamentos ele é o tipo que mais se
     repete. A sonda mostrou 31 das 43 colisões concentradas aqui. */
  mercado: ["Praça|f", "Mercado|m", "Feira|f", "Pátio|m", "Largo|m", "Terreiro|m", "Alpendre|m", "Bazar|m", "Rossio|m", "Arcada|f", "Ribeira|f", "Alfândega|f", "Balança|f", "Pregão|m", "Armazém|m", "Entreposto|m"],
  templo: ["Templo|m", "Santuário|m", "Capela|f", "Altar|m", "Casa|f", "Oratório|m", "Nave|f", "Adro|m", "Ermida|f", "Basílica|f"],
  forja: ["Forja|f", "Bigorna|f", "Fole|m", "Fornalha|f", "Ferraria|f", "Casa do Martelo|f", "Tenda|f", "Oficina|f", "Malho|m", "Têmpera|f"],
  quartel: ["Quartel|m", "Guarnição|f", "Posto|m", "Torre|f", "Casa da Guarda|f", "Baluarte|m", "Bastião|m", "Vigia|f", "Praça de Armas|f", "Reduto|m"],
  cadeia: ["Cárcere|m", "Cadeia|f", "Fossa|f", "Torre|f", "Celas|fp", "Masmorra|f", "Enxovia|f", "Casa de Ferros|f", "Poço|m", "Silo|m"],
  biblioteca: ["Biblioteca|f", "Arquivo|m", "Casa dos Papéis|f", "Escritório|m", "Sala das Cópias|f", "Gabinete|m", "Cartório|m", "Livraria|f", "Estante|f", "Depósito|m"],
  docas: ["Cais|m", "Ancoradouro|m", "Docas|fp", "Píer|m", "Embarcadouro|m", "Molhe|m", "Estaleiro|m", "Trapiche|m", "Enseada|f", "Marina|f"],
  arena: ["Arena|f", "Círculo|m", "Fosso|m", "Coliseu|m", "Ringue|m", "Areia|f", "Rinha|f", "Palanque|m", "Cova|f", "Terreiro|m"],
  "cemitério": ["Campo|m", "Jazigo|m", "Colina|f", "Terra|f", "Ossário|m", "Necrópole|f", "Adro|m", "Cemitério|m", "Sepultura|f", "Vala|f"],
  guilda: ["Salão|m", "Casa|f", "Guilda|f", "Mesa|f", "Loja|f", "Sede|f", "Confraria|f", "Câmara|f", "Companhia|f", "Ordem|f"],
  "casa de banhos": ["Águas|fp", "Casa de Vapor|f", "Fonte|f", "Termas|fp", "Banho|m", "Cisterna|f", "Piscina|f", "Bica|f", "Poça|f", "Vapor|m"],
};

/* Três padrões, e a escolha entre eles também é sorteada. Padrões dão
   nomes que soam feitos à mão porque é assim que nomes de taverna são
   feitos: um bicho e um defeito, dois bichos, ou um bicho e um dono. */
function porPadrao(rnd, nucleo, banco) {
  const s = sub(nucleo);
  const p = rnd();
  if (p < 0.4) {
    const a = adj(banco.adj[Math.floor(rnd() * banco.adj.length)]);
    return `${art(s)} ${s.n} ${comNumero(s.g === "f" ? a.f : a.m, s.pl)}`;
  }
  if (p < 0.75) {
    return `${art(s)} ${s.n} ${banco.compl[Math.floor(rnd() * banco.compl.length)]}`;
  }
  const o = sub(banco.subst[Math.floor(rnd() * banco.subst.length)]);
  if (o.n === s.n) {
    const a = adj(banco.adj[Math.floor(rnd() * banco.adj.length)]);
    return `${art(s)} ${s.n} ${comNumero(s.g === "f" ? a.f : a.m, s.pl)}`;
  }
  return `${art(s)} ${s.n} & ${artMin(o)} ${o.n}`;
}

/* O nome de uma taverna, estalagem, bar — o coração do banco, porque é o
   lugar em que o jogador entra primeiro e o nome que ele lê mais vezes. */
export function nomeDeTaverna(genero, rnd = Math.random) {
  const b = bancoDe(genero);
  return porPadrao(rnd, b.subst[Math.floor(rnd() * b.subst.length)], b);
}

/* O nome de qualquer outro local da cidade. O tipo escolhe o substantivo;
   os bancos do gênero fazem o resto. Tipo desconhecido devolve "" — quem
   chama decide o que fazer, e inventar aqui seria pior. */
export function nomeDeLocal(tipo, genero, rnd = Math.random) {
  if (tipo === "taverna") return nomeDeTaverna(genero, rnd);
  const sins = SINONIMOS[tipo];
  if (!sins) return "";
  const b = bancoDe(genero);
  const s = sub(sins[Math.floor(rnd() * sins.length)]);
  const p = rnd();
  if (p < 0.38) {
    const a = adj(b.adj[Math.floor(rnd() * b.adj.length)]);
    return `${art(s)} ${s.n} ${comNumero(s.g === "f" ? a.f : a.m, s.pl)}`;
  }
  if (p < 0.72) return `${art(s)} ${s.n} ${b.compl[Math.floor(rnd() * b.compl.length)]}`;
  const o = sub(b.subst[Math.floor(rnd() * b.subst.length)]);
  return `${art(s)} ${s.n} ${de(o)} ${o.n}`;
}

/* Quantos nomes distintos este banco sabe produzir para um tipo. Existe
   para a sonda poder AFIRMAR o tamanho em vez de eu acreditar nele. */
export function tamanhoDoBanco(tipo, genero) {
  const b = bancoDe(genero);
  const nucleos = tipo === "taverna" ? b.subst.length : (SINONIMOS[tipo] || []).length;
  if (!nucleos) return 0;
  return nucleos * (b.adj.length + b.compl.length + b.subst.length);
}

export function tiposComNome() { return ["taverna", ...Object.keys(SINONIMOS)]; }
export function generosDaToponimia() { return Object.keys(BANCO); }
