/* ============================================================
   BANCO DE NOMES — Taverna
   Gerado por código: sortear nomes NÃO consome tokens de IA.
   Usado para cidades e NPCs do mundo. O jogador escolhe o
   próprio nome e o da campanha; o sorteio é opcional para ele.

   T4-B (28/10, o cenário como arquivo, 4.ª fatia): os NOMES moram no
   cenário (cenario-padrao.js `gente`) — os bancos de cada gênero, os
   povos e os ofícios do elenco, os traços. Aqui fica o que é REGRA: como se
   combina um nome, quanto sai com sobrenome, o ofício no gênero de quem o
   tem, os nomes à mão. Ninguém de fora lê as tabelas — o motor
   (motor/fim-do-turno.js) e os quinze que importam este módulo chamam
   funções —, e por isso um mundo novo chega a todos sem tocar em nenhum.
   ============================================================ */

import { sorteDaCasa } from "./semente.js";
import { nomeDeTaverna } from "./toponimia.js";
/* v9.101: o LEXICO entra antes do genero nos bancos de gente. Devolve
   null quando o mundo nao tem um, e ai a linha e a de sempre. */
import { povosDo, oficiosDo, nomesDo } from "./lexico.js";
/* E1 (12/10): os NOMES À MÃO saem semeados pelo dia e pela cidade */
import { rngDe } from "./geografia.js";
import { aoTrocarDeCenario } from "./cenario.js";

/* O OFÍCIO NO GÉNERO DE QUEM O TEM (nexo, 11/10). A base escreve o papel
   neutro ("taverneiro(a)", "dono(a) da casa") ou no masculino ("músico"), e
   a abertura copiava-o: "Inocência Bordão, músico", e o Narrador seguiu com
   "ele" para a mulher do alaúde (4.ª sessão). A pessoa tem `genero_pessoa`
   na base; o ofício concorda com ele. Só a PRIMEIRA palavra flexiona ("dona
   da casa", "empresária da arena") — a locução que vem depois não concorda. */
export const OFICIO_NO_GENERO = {
  /* o neutro "(a)": a mulher fica com o "a" ("dono(a)" -> "dona"), o homem sem nada */
  neutro: { mulher: [["ão(ã)", "ã"], ["e(isa)", "isa"], ["o(a)", "a"], ["(a)", "a"]], homem: [["(ã)", ""], ["(isa)", ""], ["(a)", ""]] },
  /* sem neutro, a primeira palavra no feminino, pelo fim dela */
  fimFeminino: [["ão", "ã"], ["or", "ora"], ["o", "a"]],
};
export function oficioNoGenero(papel, generoPessoa) {
  const p = String(papel == null ? "" : papel);
  const g = String(generoPessoa || "");
  const neutro = OFICIO_NO_GENERO.neutro[g];
  if (!neutro || !p) return p;
  if (/\((a|ã|isa)\)/.test(p)) return neutro.reduce((s, [de, por]) => s.split(de).join(por), p);
  if (g !== "mulher") return p;
  const [primeira, ...resto] = p.split(" ");
  const r = OFICIO_NO_GENERO.fimFeminino.find(([de]) => primeira.endsWith(de));
  return r ? [primeira.slice(0, -r[0].length) + r[1], ...resto].join(" ") : p;
}

/* utilitário de sorteio determinístico opcional ou aleatório */
/* `rnd` opcional (v9.8): passando um gerador semeado, o mesmo mundo produz
   sempre os mesmos nomes. Sem ele, continua aleatório como antes. */
export function sortear(arr, rnd = sorteDaCasa) { return arr[Math.floor(rnd() * arr.length)]; }
export function sortearVarios(arr, n, rnd = sorteDaCasa) {
  const copia = [...arr]; const out = [];
  for (let i = 0; i < n && copia.length; i++) out.push(copia.splice(Math.floor(rnd() * copia.length), 1)[0]);
  return out;
}

/* Combinador: gera nomes compostos a partir de partes (variedade enorme
   com poucas listas — dezenas de milhares de combinações possíveis). */
export function combinar(pre, suf, { junta = "", rnd = sorteDaCasa } = {}) {
  return `${sortear(pre, rnd)}${junta}${sortear(suf, rnd)}`;
}

/* ---------------- OS BANCOS (do cenário) ----------------
   Eram seis objetos escritos aqui (FANTASIA, SCIFI, CYBER, HORROR,
   POSAPOC, STEAM) e um mapa que os ligava ao rótulo do gênero; agora são
   `gente.bancos` do cenário, pela mesma chave. O gênero que não tem banco
   cai no de `generos.padrao` (era `|| FANTASIA` literal, e o padrão do
   cenário é esse mesmo), e o cenário recusa o mundo cujo padrão não tem
   banco. As declarações ficam ANTES da assinatura: `aoTrocarDeCenario`
   chama já, com o mundo em uso. */
let BANCO = {};
let PADRAO = "";
let TRACOS_PESSOA = [];
aoTrocarDeCenario((c) => { BANCO = c.gente.bancos; PADRAO = c.generos.padrao; TRACOS_PESSOA = c.gente.tracos; });

/* só o banco que o gênero TEM: `BANCO["toString"]` não é banco nenhum */
function bancoDe(genero) { return Object.hasOwn(BANCO, String(genero)) ? BANCO[genero] : BANCO[PADRAO]; }

/* API pública: gera nomes por gênero. Metade das cidades usa nome único
   da lista, metade combina prefixo+sufixo (variedade quase infinita). */
export function nomeCidade(genero, rnd = sorteDaCasa) {
  const b = bancoDe(genero);
  /* a lista pronta pode vir vazia no cenário: o dado é rolado na mesma, para
     que a sorte que vem a seguir seja a de sempre */
  if (rnd() < 0.45 && b.cidadeUnica.length) return sortear(b.cidadeUnica, rnd);
  return combinar(b.cidadePre, b.cidadeSuf, { rnd });
}
/* v9.58: passa a delegar. As 25 tavernas escritas à mão continuam neste
   arquivo como referência do TOM que o gerador tem de acertar, mas quem
   sorteia é a toponímia — 25 nomes para um mundo de catorze cidades
   repetiam entre criações, e o jogador notou em três. */
export function nomeTaverna(genero, rnd = sorteDaCasa) { return nomeDeTaverna(genero, rnd); }
/* T4-B (4.ª fatia): o TOM, separado dos bancos. Não foi para o cenário
   porque o motor não o lê (o cenário recusa o campo que não acontece);
   quem nomeia tavernas e locais é toponimia.js, com os bancos dela. */
const TOM_DAS_TAVERNAS = {
  "Fantasia medieval": ["O Javali Cambaleante", "A Coroa Rachada", "O Dragão Sonolento", "A Âncora Enferrujada", "O Corvo & a Taça", "As Três Velas", "O Punhal Torto", "A Sereia Bêbada", "O Machado Dourado", "A Última Lua", "O Cavalo Manco", "A Rosa Negra", "O Grifo Faminto", "A Bota Furada", "O Escudo Partido", "A Cabra Dançante", "O Lobo & a Lua", "A Espada Quebrada", "O Barril Sem Fundo", "A Pena do Corvo", "O Ogro Risonho", "A Chama Azul", "O Trovão Distante", "A Moeda de Cobre", "O Cálice Vazio"],
  "Ficção científica": ["O Reator Frio", "Bar Gravidade Zero", "A Órbita Baixa", "O Vácuo & Grelha", "Neon Sujo", "A Escotilha", "Terminal 7", "A Estrela Morta", "O Módulo Perdido", "Combustível & Sonhos", "A Antena Quebrada", "Docas do Éter", "O Buraco Negro", "Sinal Fraco", "A Cápsula", "Recarga Rápida", "O Satélite Caído", "Ferrugem Estelar", "O Último Posto", "Anomalia"],
  "Cyberpunk": ["O Chip Queimado", "Neon Noir", "Bar Sinapse", "A Injeção", "Curto-Circuito", "O Byte Podre", "Ruído Branco", "A Firewall", "Overdose de Dados", "O Cabo Vivo", "Static", "A Dose", "Cromo Sujo", "O Glitch", "Sinal Perdido", "A Tomada", "Kernel Panic", "O Fusível", "Neon Sangue", "Latência"],
  "Horror cósmico": ["A Vela Trêmula", "O Peixe Cego", "A Âncora Afundada", "O Sino Rachado", "A Última Ceia", "O Corvo Mudo", "A Rede Vazia", "O Farol Apagado", "Maré Baixa", "A Ostra Podre", "O Sussurro", "A Gaivota Morta", "Névoa & Sal", "O Anzol", "A Cripta", "Silêncio Salgado", "O Bote Vazio", "Água Parada", "A Concha", "Fim da Doca"],
  "Pós-apocalíptico": ["O Barril de Chumbo", "Água & Ferrugem", "O Posto", "Última Dose", "O Gerador", "Sucata Bar", "O Bunker", "Ração Quente", "O Poço", "Sombra & Pó", "O Contador Geiger", "Fim de Linha", "O Tanque", "Combustível", "A Antena", "Cinza Bar", "O Abrigo", "Radiação", "O Muro", "Seca"],
  "Steampunk": ["A Válvula de Escape", "O Pistão Emperrado", "Vapor & Malte", "A Engrenagem Dourada", "O Barômetro", "Fuligem & Cerveja", "A Caldeira", "O Relógio Parado", "Latão Polido", "A Manivela", "O Fole", "Pressão Alta", "A Bússola Torta", "Óleo & Ferro", "O Dirigível", "Câmbio Bar", "A Mola Solta", "Vapor Quente", "O Regulador", "Fumaça Doce"],
};
/* v9.102: e o LÉXICO manda no nome próprio, quando o mundo tem um. É o
   campo mais seguro de todos — nada no sistema consulta "Aldric" para
   decidir coisa nenhuma —, e era o mais visível dos que faltavam: um
   "Alaric Punho-de-Pedra" desmente, sozinho, a linha ao lado que diz que
   ele é vendedor de equipamento de caçada. */
export function nomePessoa(genero, sexo, rnd = sorteDaCasa, lex = null) {
  const b = nomesDo(lex) || bancoDe(genero);
  const primeiro = sexo === "fem" ? sortear(b.fem, rnd) : sexo === "masc" ? sortear(b.masc, rnd) : sortear(rnd() < 0.5 ? b.masc : b.fem, rnd);
  const comSobrenome = rnd() < 0.6;
  return comSobrenome ? `${primeiro} ${sortear(b.sobrenome, rnd)}` : primeiro;
}
export function generosDisponiveis() { return Object.keys(BANCO); }

/* O SEXO DE UM PRIMEIRO NOME (MM-C · C2, 11/10). Quem nasce do elenco traz
   `genero_pessoa`; o vilão do fio não traz — o chefe humanoide recebe um
   nome destes bancos, e é por ele que se sabe. Devolve "masc", "fem" ou ""
   (o nome que está nos dois bancos, como "Wren" ou "Sable", e o que não
   está em nenhum, como "Golem"). Lido pelo núcleo (`generoDaPessoa`). */
export function sexoDoNome(nome) {
  const p = String(nome == null ? "" : nome).trim().split(/[\s,]+/)[0].toLowerCase();
  if (!p) return "";
  let m = false, f = false;
  for (const b of Object.values(BANCO)) {
    if ((b.masc || []).some((x) => x.toLowerCase() === p)) m = true;
    if ((b.fem || []).some((x) => x.toLowerCase() === p)) f = true;
  }
  return m && !f ? "masc" : f && !m ? "fem" : "";
}

/* ---------------- ELENCO DIVERSO ----------------
   Gera pessoas prontas com variedade real (gênero equilibrado, raças
   variadas, traços), para o Mestre POVOAR o mundo sem cair em monotonia
   (ex.: só homens humanos). O app sorteia; a IA usa. */

/* Os povos (`povos`), os ofícios (`oficios`) e os traços (`gente.tracos`)
   moram no cenário, banco a banco (T4-B, 4.ª fatia). */

/* Uma pessoa completa e variada.

   v9.101: `lex` é o LÉXICO DO MUNDO, e ele entra ANTES do gênero na
   mesma linha que sempre existiu:

     OCUPACOES[g] || OCUPACOES["Fantasia medieval"]

   vira

     oficiosDo(lex) || OCUPACOES[g] || OCUPACOES[padrão]

   Nada mais muda. Num mundo de caçadores, o povoador para de sortear
   ferreiro e escriba porque o primeiro termo passou a existir; num mundo
   sem léxico, `oficiosDo` devolve null e a linha é a de antes, caractere
   por caractere. */
export function pessoaDiversa(genero, rnd = sorteDaCasa, lex = null) {
  const g = genero || PADRAO;
  const sexo = rnd() < 0.5 ? "masc" : "fem";
  /* T4-B: `OCUPACOES[g] || OCUPACOES[padrão]` é agora o banco do gênero (ou o
     do padrão), que traz os povos e os ofícios juntos dos nomes */
  const racas = povosDo(lex) || bancoDe(g).povos;
  const ocupacoes = oficiosDo(lex) || bancoDe(g).oficios;
  return {
    /* v9.102: o `lex` também no NOME. Sem esta linha, a base nascia com
       povo e ofício deste mundo e nome do banco medieval — que é a pior
       das três combinações, porque a incoerência fica dentro da mesma
       linha da ficha: "Aldric, caçador desperto, corretor de essência". */
    nome: nomePessoa(g, sexo, rnd, lex),
    genero_pessoa: sexo === "masc" ? "homem" : "mulher",
    raca: sortear(racas, rnd),
    ocupacao: sortear(ocupacoes, rnd),
    traco: sortear(TRACOS_PESSOA, rnd),
  };
}
export { TRACOS_PESSOA };

/* Um elenco pronto de N pessoas variadas, com gênero equilibrado */
export function elencoDiverso(genero, n = 6, lex = null) {
  const g = genero || PADRAO;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = pessoaDiversa(g, sorteDaCasa, lex);
    /* força alternância de gênero para garantir equilíbrio real.

       v9.102: e o SEGUNDO sorteio também precisa do léxico. Sem isto, o
       nome nascia deste mundo em `pessoaDiversa` e era sobrescrito aqui
       por um do banco do gênero — e o elenco do prompt saía com "Ursa
       Pé-Leve, motorista de resgate", que é a incoerência inteira dentro
       de uma linha só. A regra morava em dois caminhos e um deles não
       sabia dela. */
    if (i % 2 === 0) { p.genero_pessoa = "mulher"; p.nome = nomePessoa(g, "fem", sorteDaCasa, lex); }
    else { p.genero_pessoa = "homem"; p.nome = nomePessoa(g, "masc", sorteDaCasa, lex); }
    out.push(p);
  }
  return out;
}

/* ============================================================
   NOMES À MÃO (o Narrador só narra · E1, 12/10)

   Da 7.ª sessão, os figurantes mais vivos foram os que o Narrador batizou
   sozinho: Ambrósio, o velho do Peixe Cego ("quem era o velho que ensinava
   lá?", M7), Pregado, o barqueiro ("pergunto ao homem magro o nome dele",
   M12), Dário, o morto da canção ("quem era o homem que me deu a canção",
   M24). Nenhum vinha do sistema, e o Dário foi registado como VIVO. Uma
   regra seca ("não invente nomes") faria deles "um velho" sem nome — o
   risco 1 do relatório. A saída é a do Mestre de mesa: uma lista de nomes
   prontos na ponta da mesa, da cultura do lugar.

   `nomesAMao` dá DOIS nomes livres (um de homem, um de mulher) do banco do
   mundo (o léxico primeiro, como `nomePessoa`), que ninguém do registo nem
   do elenco usa. Determinístico pelo dia e pela cidade: o Narrador vê os
   mesmos dois o dia inteiro, e o que ele usar entra no registo e sai da
   lista (o próximo toma-lhe o lugar). `nomesAMaoNaProsa` diz quais dos
   oferecidos a narração usou — e se a frase os pôs mortos ("se chamava",
   "morreu", "enterrado"), para o registo não guardar um morto como vivo.
   ============================================================ */
export const NOMES_A_MAO = {
  quantos: { masc: 1, fem: 1 },
  /* quantos sorteios tenta antes de desistir de um nome livre */
  tentativas: 24,
  /* a frase que põe a pessoa morta, lida sem acento, na mesma oração do nome */
  morto: /\b(se chamava|chamava-se|morreu|morto|morta|mortos|enterrad[oa]|falecid[oa]|que descanse|defunt[oa]|matara?m)\b/,
};

const semAcentoN = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const primeiroDe = (n) => semAcentoN(n).trim().split(/\s+/)[0] || "";

/* `usados`: os nomes do registo (npcs), do elenco e do grupo — qualquer
   forma (texto ou objeto com `nome`). Compara-se o PRIMEIRO nome: dois
   "Ambrósio" na mesma campanha são a confusão que esta lista existe para
   evitar. Devolve [{ nome, genero: "ele"|"ela" }]. */
export function nomesAMao(opcoes) {
  /* `= {}` não cobre `null`: o objeto vem tratado à mão */
  const { semente = "", dia = 0, cidade = "", genero = "", lex = null, usados = [] } = opcoes && typeof opcoes === "object" ? opcoes : {};
  const ja = new Set((Array.isArray(usados) ? usados : []).map((u) => primeiroDe(u && typeof u === "object" ? u.nome : u)).filter(Boolean));
  const rnd = rngDe(`${semente}|nomesAMao|${Number(dia) || 0}|${semAcentoN(cidade)}`);
  const out = [];
  for (const [sexo, quantos] of Object.entries(NOMES_A_MAO.quantos)) {
    for (let k = 0; k < quantos; k++) {
      for (let i = 0; i < NOMES_A_MAO.tentativas; i++) {
        const nome = nomePessoa(genero || PADRAO, sexo, rnd, lex);
        const p = primeiroDe(nome);
        if (!p || ja.has(p)) continue;
        ja.add(p);
        out.push({ nome, genero: sexo === "masc" ? "ele" : "ela" });
        break;
      }
    }
  }
  return out;
}

/* A linha da pauta (secção NOMES À MÃO): curta, e diz para que servem.
   E2 (12/10): "a quem não tem nome:" (era "para quem ainda não tem nome:",
   9 a mais) — cada caractere desta linha é o que a faz caber num turno de
   batida (pauta.js, a secção). O "a quem" fica: sem ele, dois nomes soltos
   sob a etiqueta leem-se como gente em cena. */
export function linhaDosNomesAMao(nomes) {
  const ns = (Array.isArray(nomes) ? nomes : []).filter((n) => n && n.nome);
  if (!ns.length) return "";
  return `a quem não tem nome: ${ns.map((n) => `${n.nome} (${n.genero})`).join(" · ")}`;
}

/* Quais dos oferecidos a narração usou. Pelo primeiro nome, palavra
   inteira; `morto` quando a oração do nome o põe morto. */
export function nomesAMaoNaProsa(narrativa, oferecidos) {
  const txt = String(narrativa == null ? "" : narrativa);
  if (!txt.trim()) return [];
  const oracoes = semAcentoN(txt).split(/(?<=[.!?…\n])/);
  const out = [];
  for (const o of Array.isArray(oferecidos) ? oferecidos : []) {
    if (!o || !o.nome) continue;
    const p = primeiroDe(o.nome);
    if (p.length < 2) continue;
    const rx = new RegExp(`(^|[^a-z])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`);
    const onde = oracoes.filter((x) => rx.test(x));
    if (!onde.length) continue;
    out.push({ nome: o.nome, genero: o.genero || "", morto: onde.some((x) => NOMES_A_MAO.morto.test(x)) });
  }
  return out;
}
