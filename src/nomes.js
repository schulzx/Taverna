/* ============================================================
   BANCO DE NOMES — Taverna
   Gerado por código: sortear nomes NÃO consome tokens de IA.
   Usado para cidades e NPCs do mundo. O jogador escolhe o
   próprio nome e o da campanha; o sorteio é opcional para ele.
   ============================================================ */

/* utilitário de sorteio determinístico opcional ou aleatório */
export function sortear(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function sortearVarios(arr, n) {
  const copia = [...arr]; const out = [];
  for (let i = 0; i < n && copia.length; i++) out.push(copia.splice(Math.floor(Math.random() * copia.length), 1)[0]);
  return out;
}

/* Combinador: gera nomes compostos a partir de partes (variedade enorme
   com poucas listas — dezenas de milhares de combinações possíveis). */
export function combinar(pre, suf, { junta = "" } = {}) {
  return `${sortear(pre)}${junta}${sortear(suf)}`;
}

/* ---------------- FANTASIA MEDIEVAL ---------------- */
const FANTASIA = {
  cidadePre: ["Pedra", "Corvo", "Fenda", "Vale", "Alto", "Porto", "Foz", "Torre", "Ponte", "Cinza", "Ferro", "Ouro", "Espinho", "Névoa", "Lobo", "Águia", "Trovão", "Sombra", "Luz", "Sal", "Carvalho", "Salgueiro", "Junco", "Brasa", "Gelo", "Muralha", "Serra", "Rio", "Lago", "Duna", "Areia", "Bruma", "Rocha", "Cravo", "Urze", "Fonte"],
  cidadeSuf: ["vale", "monte", "forte", "burgo", "gard", "held", "mar", "fonte", "porto", "ponte", "guarda", "haven", "reduto", "campo", "ermo", "cova", "passo", "vau", "clareira", "confim", "âncora", "abismo", "cume", "portal", "faina", "recanto", "brenha", "torreão"],
  cidadeUnica: ["Valdoravem", "Silverwyn", "Grão-Corvo", "Thornhaven", "Mistral", "Ravensholm", "Aldebrand", "Fimbulvargr", "Ísgard", "Torrecinza", "Bruxelgard", "Marfilheira", "Colinégra", "Doiravém", "Frostmere", "Ashkarr", "Vindolâna", "Elderwyn", "Grimhollow", "Solmyr", "Kaervon", "Duncrag", "Wyrmpost", "Belhaven", "Thaloria", "Ysolde", "Karnak-Dûr", "Ravenmoor", "Silvergate", "Blackfen"],
  taverna: ["O Javali Cambaleante", "A Coroa Rachada", "O Dragão Sonolento", "A Âncora Enferrujada", "O Corvo & a Taça", "As Três Velas", "O Punhal Torto", "A Sereia Bêbada", "O Machado Dourado", "A Última Lua", "O Cavalo Manco", "A Rosa Negra", "O Grifo Faminto", "A Bota Furada", "O Escudo Partido", "A Cabra Dançante", "O Lobo & a Lua", "A Espada Quebrada", "O Barril Sem Fundo", "A Pena do Corvo", "O Ogro Risonho", "A Chama Azul", "O Trovão Distante", "A Moeda de Cobre", "O Cálice Vazio"],
  masc: ["Aldric", "Brannoc", "Cedric", "Doran", "Edric", "Fendrel", "Gareth", "Halvard", "Ivarr", "Joric", "Kael", "Loras", "Magnus", "Neirin", "Osric", "Perrin", "Quorin", "Rhogar", "Sethric", "Torvald", "Ulric", "Varek", "Wystan", "Yorick", "Alaric", "Bjorn", "Corwin", "Dagon", "Eamon", "Falk", "Godfrey", "Hakon", "Isen", "Jarl", "Kolvar", "Lucan", "Merek", "Nolan", "Orin", "Piotr"],
  fem: ["Aelith", "Bryna", "Ceridwen", "Dahlia", "Elowen", "Fenna", "Gwynn", "Hilda", "Isolde", "Jora", "Kaelith", "Lysa", "Morgane", "Nyla", "Ondine", "Petra", "Quilla", "Rowena", "Sable", "Thalia", "Ursa", "Vionna", "Wren", "Ylva", "Astrid", "Brigid", "Cora", "Dagny", "Eira", "Freya", "Greta", "Helga", "Ingrid", "Sigrun", "Runa", "Mabel", "Nesa", "Orla", "Perrine", "Saoirse"],
  sobrenome: ["Coração-de-Ferro", "Punho-de-Pedra", "Olho-de-Corvo", "Mata-Lobos", "Sombravinda", "Ventoforte", "Filho da Névoa", "da Foz", "o Manco", "Barba-Ruiva", "Lâmina-Rápida", "Pé-Leve", "Sem-Medo", "o Andarilho", "da Torre", "Rompe-Escudos", "Voz-Grave", "Mão-Torta", "o Exilado", "Cinza-Antiga", "Guarda-Portão", "Queima-Campos", "o Silencioso", "Passo-de-Gato", "da Urze"],
};

/* ---------------- FICÇÃO CIENTÍFICA ---------------- */
const SCIFI = {
  cidadePre: ["Nova", "Neo", "Porto", "Estação", "Colônia", "Setor", "Domo", "Orbital", "Cratera", "Alta", "Bio", "Cryo", "Helio", "Ferro", "Titânio", "Vega", "Sirius", "Aurora", "Ápex", "Zênite", "Núcleo", "Perímetro", "Ecos", "Vácuo", "Prisma"],
  cidadeSuf: ["-9", "Prime", "Central", "-Alfa", "-Beta", "Station", "Point", "Reach", "Spire", "Haven", "Vault", "Nexus", "Terminal", "Bastion", "Cradle", "Gate", "Rift", "Verge", "Hub", "Descent", "Ascent", "-VII", "-Zero", "Anchorage"],
  cidadeUnica: ["Aethel-9", "Cinzas de Kepler", "Novaróvia", "Terminus Prime", "Solaris Vault", "Cratera Vermelha", "Elysium-4", "Baluarte Órion", "Ízaro Station", "Perdição de Vega", "Novo Bizâncio", "Halcyon Reach", "Umbra Deep", "Cindervale Orbital", "Argos Prime", "Tycho Descent", "Meridian-0", "Vantablack", "Porto Hélio", "Cradle-VII", "Sombra de Titã", "Última Órbita", "Icarus Fell", "Zênite Pálido", "Quietus"],
  taverna: ["O Reator Frio", "Bar Gravidade Zero", "A Órbita Baixa", "O Vácuo & Grelha", "Neon Sujo", "A Escotilha", "Terminal 7", "A Estrela Morta", "O Módulo Perdido", "Combustível & Sonhos", "A Antena Quebrada", "Docas do Éter", "O Buraco Negro", "Sinal Fraco", "A Cápsula", "Recarga Rápida", "O Satélite Caído", "Ferrugem Estelar", "O Último Posto", "Anomalia"],
  masc: ["Ky", "Zane", "Rael", "Cass", "Orin", "Dax", "Vex", "Kato", "Silas", "Jarek", "Corvin", "Nyx", "Thane", "Ezio", "Ravi", "Soren", "Kael", "Bishop", "Cyrus", "Dane", "Enzo", "Fenn", "Gideon", "Halston", "Ivo", "Joaquim", "Kir", "Lux", "Marlow", "Niko"],
  fem: ["Nyx", "Zara", "Echo", "Vesper", "Lyra", "Cira", "Juno", "Rhea", "Sol", "Ada", "Kaja", "Nova", "Ondina", "Perla", "Quíntia", "Riven", "Sable", "Tessa", "Ume", "Vala", "Wren", "Xara", "Yuki", "Zephyr", "Astra", "Briar", "Calla", "Dita", "Elara", "Freyja"],
  sobrenome: ["Vex", "Cross", "Halloway", "Okonkwo", "Petrov", "Nakamura", "Reyes", "Voss", "Kane", "Sol-9", "Ferro", "Kestrel", "Marchetti", "Osei", "Ravenna", "Sato", "Thorne", "Ustinov", "Valdez", "Wraith", "Xu", "Yamada", "Zoric", "Adeyemi", "Blackwood"],
};

/* ---------------- CYBERPUNK ---------------- */
const CYBER = {
  cidadePre: ["Neo", "Setor", "Bloco", "Zona", "Distrito", "Baixa", "Alta", "Sub", "Meta", "Ciber", "Cromo", "Neon", "Vidro", "Aço", "Ácido", "Pixel", "Data", "Fluxo", "Ruído", "Sinal"],
  cidadeSuf: ["City", "Sprawl", "-Sul", "-Norte", "Zero", "Prime", "Underground", "Heights", "Slums", "Grid", "Node", "Loop", "Wire", "Deck", "Zone", "-13", "Central", "Fringe", "Verge", "Core"],
  cidadeUnica: ["Neonhaven", "Cromo City", "Setor Cinza", "Baixa Ácida", "Distrito Vidro", "Néon-13", "Vórtex Sprawl", "Aço & Sombra", "Pixelburgo", "Data-Fim", "Ruído Central", "Meta-Sul", "Ferro Fundido", "Zona Morta", "Cabo Solto", "Circuito Aberto", "Vidro Quebrado", "Nêon Pálido", "Subúrbio Zero", "Cinza Elétrica"],
  taverna: ["O Chip Queimado", "Neon Noir", "Bar Sinapse", "A Injeção", "Curto-Circuito", "O Byte Podre", "Ruído Branco", "A Firewall", "Overdose de Dados", "O Cabo Vivo", "Static", "A Dose", "Cromo Sujo", "O Glitch", "Sinal Perdido", "A Tomada", "Kernel Panic", "O Fusível", "Neon Sangue", "Latência"],
  masc: ["Rez", "Jax", "Kilo", "Neo", "Vye", "Dash", "Cipher", "Ryu", "Zeke", "Nox", "Blade", "Kane", "Wire", "Ghost", "Ivo", "Sly", "Cade", "Dex", "Enzo", "Fang", "Griff", "Haze", "Idris", "Juke", "Kaz"],
  fem: ["Rune", "Vex", "Neon", "Kira", "Zev", "Trace", "Cyra", "Nyx", "Echo", "Vina", "Glitch", "Mira", "Onyx", "Pixel", "Quim", "Raze", "Syn", "Tibi", "Umbra", "Vega", "Wisp", "Xen", "Yara", "Zola", "Ada"],
  sobrenome: ["Wire", "Cross", "Volt", "Zero", "Kade", "Nyx", "Chrome", "Steel", "Vega", "Kill", "Static", "Rook", "Sable", "Tox", "Umbra", "Vice", "Wraith", "Xero", "Yakuza", "Zane", "Byte", "Cinder", "Dusk", "Edge", "Flux"],
};

/* ---------------- HORROR CÓSMICO ---------------- */
const HORROR = {
  cidadePre: ["Vale", "Névoa", "Corvo", "Cinza", "Salgado", "Velho", "Baixo", "Fundo", "Pântano", "Bruma", "Sombra", "Silêncio", "Musgo", "Pó", "Ossos", "Sino", "Cripta", "Sal", "Maré", "Junco"],
  cidadeSuf: ["field", "moor", "wick", "hollow", "marsh", "haven", "port", "crest", "vale", "mouth", "barrow", "end", "reach", "fen", "grave", "mire", "shade", "cove", "ness", "gloom"],
  cidadeUnica: ["Innsvale", "Corvos-Fundos", "Névoa Salgada", "Baixa-do-Sino", "Pântano Cinza", "Ossário", "Marévem", "Silêncio", "Cripta-do-Sal", "Bruma Antiga", "Vale-Sussurro", "Musgo-Fundo", "Pó & Cinzas", "A Enseada", "Fim-do-Junco", "Sombravale", "Maré-Morta", "Sino Rachado", "Barrowick", "Gloomfen"],
  taverna: ["A Vela Trêmula", "O Peixe Cego", "A Âncora Afundada", "O Sino Rachado", "A Última Ceia", "O Corvo Mudo", "A Rede Vazia", "O Farol Apagado", "Maré Baixa", "A Ostra Podre", "O Sussurro", "A Gaivota Morta", "Névoa & Sal", "O Anzol", "A Cripta", "Silêncio Salgado", "O Bote Vazio", "Água Parada", "A Concha", "Fim da Doca"],
  masc: ["Ezra", "Silas", "Josiah", "Amos", "Cornelius", "Ebenezer", "Thaddeus", "Obed", "Hiram", "Zebediah", "Barnabas", "Increase", "Elias", "Jedediah", "Nathaniel", "Ichabod", "Mordecai", "Phineas", "Reuben", "Zadok", "Caleb", "Enoch", "Gideon", "Levi", "Absalom"],
  fem: ["Prudence", "Mercy", "Abigail", "Constance", "Temperance", "Verity", "Charity", "Patience", "Hepzibah", "Keziah", "Tabitha", "Dorcas", "Lavinia", "Ophelia", "Cordelia", "Winifred", "Eudora", "Marguerite", "Selah", "Thomasine", "Bathsheba", "Damaris", "Eunice", "Jerusha", "Zipporah"],
  sobrenome: ["Marsh", "Whateley", "Gilman", "Pickman", "Corvo", "Blackwood", "Ashby", "Deverell", "Ottoline", "Sallow", "Thorne", "Vane", "Crane", "Fenwick", "Grimshaw", "Holloway", "Mordaunt", "Nightingale", "Orlok", "Peabody", "Quintus", "Ravenscroft", "Sowerby", "Trevelyan", "Usher"],
};

/* ---------------- PÓS-APOCALÍPTICO ---------------- */
const POSAPOC = {
  cidadePre: ["Posto", "Refúgio", "Ruína", "Cinza", "Ferro", "Sucata", "Poço", "Cruz", "Muro", "Cova", "Sal", "Rádio", "Pó", "Ossos", "Última", "Nova", "Baixa", "Alta", "Vale", "Cratera"],
  cidadeSuf: ["-Zero", "Alta", "Baixa", "-7", "Nova", "Velha", "do Sul", "do Norte", "Central", "Fim", "Reduto", "Abrigo", "Cova", "Passagem", "Fronteira", "Ermo", "Poço", "Muro", "Cruz", "Vau"],
  cidadeUnica: ["Refúgio-7", "Cova de Ferro", "Sucata Alta", "Cruz do Sul", "Poço Cinza", "Última Cidade", "Muro-Zero", "Ossário", "Nova Esperança", "Radioburgo", "Sal & Pó", "Baixa Enferrujada", "Cratera Verde", "Fim da Estrada", "Reduto", "Passagem Morta", "Vale Seco", "Posto Cinza", "Ferro-Velho", "A Fronteira"],
  taverna: ["O Barril de Chumbo", "Água & Ferrugem", "O Posto", "Última Dose", "O Gerador", "Sucata Bar", "O Bunker", "Ração Quente", "O Poço", "Sombra & Pó", "O Contador Geiger", "Fim de Linha", "O Tanque", "Combustível", "A Antena", "Cinza Bar", "O Abrigo", "Radiação", "O Muro", "Seca"],
  masc: ["Ruck", "Dust", "Cole", "Hatchet", "Rem", "Boone", "Kade", "Slate", "Ash", "Diesel", "Gunnar", "Hawk", "Iron", "Jonah", "Krow", "Levi", "Mace", "Nash", "Ozzy", "Pike", "Quill", "Rook", "Stray", "Tank", "Vulture"],
  fem: ["Rust", "Sage", "Wren", "Ash", "Piper", "Rune", "Cinder", "Dove", "Ember", "Fawn", "Grit", "Hazel", "Iris", "June", "Kestrel", "Lark", "Mica", "Nova", "Onyx", "Prairie", "Quinn", "Raven", "Scout", "Thistle", "Vera"],
  sobrenome: ["Ferro", "Cinza", "do Poço", "Sucateiro", "Sem-Terra", "Rádio", "o Marcado", "Mão-Seca", "da Cratera", "Corvo", "Pé-de-Chumbo", "a Nômade", "do Muro", "Queima-Tudo", "Osso", "Ferrugem", "Sal", "o Errante", "da Cova", "Pólvora", "Vidro", "Grão", "Chuva-Ácida", "Fenda", "Últim"],
};

/* ---------------- STEAMPUNK ---------------- */
const STEAM = {
  cidadePre: ["Alto", "Ferro", "Vapor", "Cobre", "Bronze", "Engrenagem", "Fumaça", "Torre", "Ponte", "Porto", "Baixo", "Novo", "Grão", "Rio", "Fábrica", "Relógio", "Câmbio", "Mola", "Pistão", "Carvão"],
  cidadeSuf: ["burgo", "vapor", "forja", "ford", "haven", "gate", "spire", "works", "port", "cross", "field", "borough", "steam", "cog", "brass", "shire", "hollow", "reach", "end", "haven"],
  cidadeUnica: ["Cobrevale", "Altavapor", "Engrenópolis", "Ferro & Fumaça", "Torre-Relógio", "Bronzeburgo", "Câmbio Alto", "Pistão Central", "Novo Carvão", "Fábrica Velha", "Rio Fuligem", "Molafield", "Grão-Bronze", "Ponte-Vapor", "Baixa Fumaça", "Cogsworth", "Latão-Reach", "Vaporgard", "Fuligem", "Brassholt"],
  taverna: ["A Válvula de Escape", "O Pistão Emperrado", "Vapor & Malte", "A Engrenagem Dourada", "O Barômetro", "Fuligem & Cerveja", "A Caldeira", "O Relógio Parado", "Latão Polido", "A Manivela", "O Fole", "Pressão Alta", "A Bússola Torta", "Óleo & Ferro", "O Dirigível", "Câmbio Bar", "A Mola Solta", "Vapor Quente", "O Regulador", "Fumaça Doce"],
  masc: ["Ambrose", "Bartholomew", "Cornelius", "Desmond", "Edmund", "Fitzgerald", "Gideon", "Horace", "Ignatius", "Jasper", "Klaus", "Leopold", "Montgomery", "Nathaniel", "Octavius", "Percival", "Quentin", "Reginald", "Sebastian", "Thaddeus", "Ulysses", "Vincent", "Wallace", "Xavier", "Zephaniah"],
  fem: ["Arabella", "Beatrix", "Cordelia", "Dorothea", "Evangeline", "Florence", "Genevieve", "Henrietta", "Isadora", "Josephine", "Katharine", "Lavinia", "Millicent", "Nadine", "Ottilie", "Prudence", "Rosalind", "Seraphina", "Theodora", "Ursula", "Vivienne", "Wilhelmina", "Xanthe", "Yolanda", "Zelda"],
  sobrenome: ["Copperwright", "Ironmonger", "Steamwell", "Brasswick", "Cogsworth", "Fairweather", "Gearhart", "Ashcombe", "Blackwood", "Cranborne", "Featherstone", "Goldwyn", "Hartley", "Ironside", "Kettering", "Leadbetter", "Merriweather", "Pennington", "Quill", "Rothschild", "Sootheby", "Thornbury", "Underwood", "Vandermere", "Whitlock"],
};

const BANCO = { "Fantasia medieval": FANTASIA, "Ficção científica": SCIFI, "Cyberpunk": CYBER, "Horror cósmico": HORROR, "Pós-apocalíptico": POSAPOC, "Steampunk": STEAM };

function bancoDe(genero) { return BANCO[genero] || FANTASIA; }

/* API pública: gera nomes por gênero. Metade das cidades usa nome único
   da lista, metade combina prefixo+sufixo (variedade quase infinita). */
export function nomeCidade(genero) {
  const b = bancoDe(genero);
  if (Math.random() < 0.45 && b.cidadeUnica) return sortear(b.cidadeUnica);
  return combinar(b.cidadePre, b.cidadeSuf);
}
export function nomeTaverna(genero) { return sortear(bancoDe(genero).taverna); }
export function nomePessoa(genero, sexo) {
  const b = bancoDe(genero);
  const primeiro = sexo === "fem" ? sortear(b.fem) : sexo === "masc" ? sortear(b.masc) : sortear(Math.random() < 0.5 ? b.masc : b.fem);
  const comSobrenome = Math.random() < 0.6;
  return comSobrenome ? `${primeiro} ${sortear(b.sobrenome)}` : primeiro;
}
export function generosDisponiveis() { return Object.keys(BANCO); }
