/* ============================================================
   A FICHA DE ATOR (o Narrador ator, etapa 1 · 03/11/2026) — src/motor/ficha-de-ator.js

   A pessoa decidiu em 03/11 (mente/plano-narrador-ator.md): *"o narrador é
   só a boca, ele só fala… tudo entra pelo sistema e é devolvido pelo
   sistema."* O Mestre é código e já decide o turno — a pauta
   (`aPautaDoTurno`) diz onde, quem, o que se perguntou, o rumo e o fecho —,
   mas escreve-o como ORDEM a um Mestre ("não narre", "termine em", "é fato:
   entra nesta resposta"). O diagnóstico da voz (mente/narrador-ator-voz.md,
   §1.7 e §2) mediu o preço: o ator lê a ordem e repete-a, e a prosa explica
   o sistema. Esta peça traduz o que o sistema já decidiu numa FICHA: cada
   linha da pauta vira um FATO de cena ou uma VONTADE de alguém presente,
   nunca uma ordem, uma razão ou um rótulo.

   A FICHA TEM SETE PARTES (o contrato que a etapa 2, o ator, lê):

     CENA              o lugar, a hora dita em palavras, o tempo, o que se vê
     ACONTECEU         a frase do herói e o que o sistema já resolveu
     QUEM ESTÁ         cada pessoa: o que é; a SUA voz (o tique, só se o tem;
                       o registo de fala; como trata o herói); o que faz e o
                       que quer agora; o que sabe e o que não sabe
     O QUE SE DIZ      o conteúdo que o sistema decidiu (o pedido, a ameaça,
                       o boato, a chegada) — ou «livre», e o ator põe a cor
     A ÚLTIMA PALAVRA  de quem é e de que forma acaba, sem o «ou»
     O TOM             o peso da cena, quando a cena o tem
     AS FRONTEIRAS     quem pode falar, os nomes à mão, os lugares, o que
                       não existe

   O QUE CAI, E PORQUÊ. Nem toda linha da pauta é para um ator: o que o lugar
   comporta é regra que o código aplica antes da fala; «reaja primeiro» é
   ofício (vai uma vez no pedido do ator, não em toda ficha); o veto do
   gesto («sem cuspe, braços cruzados») só semeia o tique (voz, §2). Cada
   linha deixa RASTRO (`rastro`): para onde foi, ou o motivo de ter caído,
   de uma lista fechada (MOTIVOS_DO_CORTE). «sem tradução» é o único motivo
   que é defeito — uma linha que a tabela ainda não sabe dizer.

   A VOZ NUNCA É A PRIMEIRA A CAIR. Na pauta de hoje, `linhaQuemE` (nucleo.js)
   larga a voz do Dunstan para guardar o querer nos 130 caracteres (voz, §3:
   0 de 12 falas soaram a mar). Aqui a voz sai do núcleo inteira, e o corte
   (ORDEM_DO_CORTE) tira tudo o resto antes dela. O modo `mestre` não muda um
   byte: nada daqui é lido pelo pedido de hoje.

   A ENTRADA é o que o sistema sabe no turno, sem nada novo:
     aFichaDeAtor({ nota, frase, estado, rolagem })
       nota:    a pauta + os envelopes do turno (o texto que o pedido de hoje
                põe à cabeça da mensagem, antes das REGRAS DA CENA ABERTA)
       frase:   a frase do jogador
       estado:  o estado do instante (o do fim da montagem): personagem,
                npcs, nucleoCache, cidadeAtual, lugar, minuto, mundo,
                mensagens
       rolagem: opcional — o que o dado deu quando a pauta trouxe A APOSTA
                ("passa" | "falha" | "fio"); sem ela, a aposta fica como o
                que está em jogo
     → { texto, partes, pessoas, falam, rastro, cobertura, trocas }

   Sem sorte: o que se escolhe (o exemplo do registo) sai do hash do nome —
   a mesma pessoa fala sempre do mesmo jeito, em qualquer máquina.
   O VERIFICADOR (`verificarAFicha`) é a catraca: nenhum rótulo de sistema,
   nenhuma ordem, nenhuma razão, nenhum número que não se diz em voz alta.
   ============================================================ */
import { SECOES } from "../pauta.js";
import { hashSemente } from "../semente.js";

const ehObj = (x) => x != null && typeof x === "object" && !Array.isArray(x);
const arr = (x) => (Array.isArray(x) ? x : []);
const str = (x) => (typeof x === "string" ? x : x == null ? "" : String(x));
const sem = (x) => str(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const limpo = (x) => str(x).replace(/\s+/g, " ").trim();
const ponto = (x) => { const t = limpo(x).replace(/[;,:\s—-]+$/, ""); return t && !/[.!?»"”]$/.test(t) ? t + "." : t; };
const maiuscula = (x) => { const t = limpo(x); return t ? t[0].toUpperCase() + t.slice(1) : t; };

/* ---------------- a forma da ficha ---------------- */
/* as partes, na ordem em que o ator as lê, e os tetos. `teto` é o da
   ficha inteira (a meta do plano: ~1–2 mil caracteres); passou dele, corta
   pela ORDEM_DO_CORTE. `pessoasMax` é quem ganha bloco próprio; o resto da
   gente presente vai numa linha («Também aqui»). */
export const FICHA_DE_ATOR = Object.freeze({
  partes: Object.freeze(["CENA", "ACONTECEU", "QUEM ESTÁ", "O QUE SE DIZ", "A ÚLTIMA PALAVRA", "O TOM", "AS FRONTEIRAS"]),
  teto: 2000,
  pessoasMax: 4,
  fraseMax: 320,
  linhaMax: 260,
  livre: "livre",
  trocas: 2,
  trocaMax: 1500,
});

/* POR QUE UMA LINHA CAI — a lista é fechada; a suíte recusa outro motivo.
   Só «sem tradução» é defeito: o resto é a separação que o plano pediu
   entre o que o código aplica e o que o ator diz. */
export const MOTIVOS_DO_CORTE = Object.freeze({
  moldura: "o cabeçalho da pauta e das notas: não diz nada da cena",
  oficio: "como dizer, igual em todo turno: vai uma vez no ofício do ator, não na ficha",
  regra: "o que o lugar ou a luta comporta: o código aplica antes da fala, e o ator não decide ação",
  gesto: "o veto do gesto gasto: só o semeia (diagnóstico da voz, §2)",
  contagem: "contagem do jogo (o endereço no mapa, a camada, as salas vistas): ninguém a diz em voz alta",
  pergunta: "a pergunta dramática da batida: quem a responde é o jogo, não a fala",
  mecanismo: "o tipo do lugar entre parênteses («aqui isto é um ruína selada»): o ator vê a coisa, não a categoria",
  ordem: "a instrução ao Mestre colada ao fato («Narre…», «Isto é FATO. Use…»): o fato fica, a ordem cai",
  semTraducao: "sem tradução: a tabela ainda não sabe dizer esta linha como fato",
});

/* ---------------- os números que se dizem ---------------- */
/* o corpo, pela fração da vida (a pauta da luta diz «6/12») */
export const CORPO_FALADO = Object.freeze([
  { desde: 1, o: "sem um arranhão" },
  { desde: 0.5, o: "com sangue à vista" },
  { desde: 0.25, o: "mal, a sangrar" },
  { desde: 0.0001, o: "por um fio" },
  { desde: 0, o: "no chão" },
]);
/* a distância, em metros, como alguém a diria */
export const DISTANCIA_FALADA = Object.freeze([
  { ate: 2, o: "colado" },
  { ate: 6, o: "a poucos passos" },
  { ate: 15, o: "a uma corrida curta" },
  { ate: Infinity, o: "longe" },
]);
/* a hora, em minutos do dia, como se diz */
export const PERIODO_DO_DIA = Object.freeze([
  { ate: 300, o: "de madrugada" },
  { ate: 420, o: "ao romper do dia" },
  { ate: 720, o: "de manhã" },
  { ate: 840, o: "por volta do meio-dia" },
  { ate: 1080, o: "à tarde" },
  { ate: 1260, o: "ao cair da noite" },
  { ate: 1440, o: "de noite" },
]);
const NUMEROS = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez"];
const porExtenso = (n) => (Number.isInteger(n) && n >= 0 && n < NUMEROS.length ? NUMEROS[n] : String(n));

const corpo = (v, m) => { const r = m > 0 ? v / m : 1; return (CORPO_FALADO.find((c) => r >= c.desde) || CORPO_FALADO[CORPO_FALADO.length - 1]).o; };
const distancia = (m) => DISTANCIA_FALADA.find((d) => m <= d.ate).o;
const periodo = (min) => { const m = ((Number(min) % 1440) + 1440) % 1440; return PERIODO_DO_DIA.find((p) => m < p.ate).o; };

/* ---------------- a voz: o registo e o trato ---------------- */
/* O REGISTO DE FALA — o jeito de falar do ofício, para quem não tem tique
   (e também para quem o tem: o tique é um traço, o registo é a música). Lê
   o papel, a profissão, o conceito, a classe e as notas da pessoa; a
   primeira linha que bate ganha. O exemplo vai DENTRO da fala, e escolhe-se
   pelo hash do nome (sempre o mesmo para a mesma pessoa). */
export const REGISTOS_DE_FALA = Object.freeze([
  { id: "fera", de: /\b(lobo|ogro|urso|vibora|aranha|rato|besta|fera|criatura|javali|serpente|morto-vivo|esqueleto|zumbi|goblin|troll|warg)\b/, o: "não fala: rosna, bufa, investe", exemplos: [] },
  { id: "mar", de: /\b(marinheir|pescador|barqueir|capitao de navio|pirata|estivador|marujo)/, o: "fala de marinheiro: o tempo, o vento e a amarra", exemplos: ["\"Amarre isso, que vem vento.\"", "\"Mar calmo não faz marinheiro.\""] },
  { id: "venda", de: /\b(taverneir|mercador|vendedor|negociante|atendente|estalajadeir|comerciante|lojista|boticari|ferreir|armeir|cambista|encomendante|organiza as lutas|apostador)/, o: "frase de negociante: curta, sempre com um preço por trás", exemplos: ["\"Isso sai caro. Tudo sai.\"", "\"De graça, só o conselho.\""] },
  { id: "ordem", de: /\b(guarda|capita|soldado|sentinela|carcereir|meirinho|recruta|cavaleir|sargento|patrulh)/, o: "fala de quem manda parar: ordens curtas, nunca explica", exemplos: ["\"Alto. Nome e ofício.\"", "\"Aqui não. Ande.\""] },
  { id: "rua", de: /\b(ladr|batedor de carteiras|contrabandist|mendig|vigarist|prisioneir|bandid|assassin)/, o: "fala de rua: meias palavras, olho na porta", exemplos: ["\"Não fui eu, e não vi quem foi.\"", "\"Isso custa. Silêncio custa mais.\""] },
  { id: "pulpito", de: /\b(sacerdot|clerig|monge|frei|freira|sacristao|profeta|devot|paladin|templo)/, o: "fala de púlpito: devagar, com a mão no peito", exemplos: ["\"Que os deuses vejam o que eu vejo.\"", "\"Há perdão. Não há esquecimento.\""] },
  { id: "livro", de: /\b(sabio|escriba|arquivist|bibliotecari|erudit|mago|feiticeir|alquimist|curandeir|herbalista|vendedor de ervas)/, o: "fala de quem lê: palavras compridas, cita quem escreveu", exemplos: ["\"Está escrito, e mal escrito.\"", "\"Há três hipóteses. Duas são tolas.\""] },
  { id: "mato", de: /\b(cacador|batedor|rastreador|guia|patrulheir|lenhador|pastor|druida)/, o: "fala de mato: pouca palavra, olho no chão", exemplos: ["\"Rasto fresco. Dois.\"", "\"Choveu ontem. Passaram depois.\""] },
  { id: "corte", de: /\b(nobre|conde|condessa|baro|duque|senhor de|senhora de|conselheir|embaixador|regente|rei|rainha|principe|princesa)/, o: "fala de corte: cortês, e a cortesia corta", exemplos: ["\"Que encantador. Saia.\"", "\"Sou toda ouvidos, por um momento.\""] },
  { id: "campo", de: /\b(campones|lavrador|moleir|serviçal|servical|aprendiz|criad|aldea|carroceir)/, o: "fala da roça: simples, com o tempo e a colheita na boca", exemplos: ["\"Se Deus quiser e a chuva deixar.\"", "\"Isso é coisa de gente da cidade.\""] },
]);

/* COMO TRATA O HERÓI — da relação que o sistema guarda. O grupo tem o
   vínculo (vinculos.js: 25 Confiança, 50 Amizade, 75 Lealdade); o registo
   tem `relacao`. A primeira que bate ganha; `{H}` é o nome do herói. */
export const TRATO_DO_HEROI = Object.freeze([
  { id: "procurado", quando: (p) => p.procurado, o: "como a quem tem a cabeça a prémio: de longe, e sem lhe dar as costas" },
  { id: "inimigo", quando: (p) => /inimig|rival|odio/.test(sem(p.relacao)), o: "com frieza, à espera do primeiro erro de {H}" },
  { id: "familia", quando: (p) => /famil|irma|irmao|pai|mae|filh|conjuge|romance/.test(sem(p.relacao)), o: "pelo nome, como quem conhece {H} desde sempre" },
  { id: "lealdade", quando: (p) => p.vinculo != null && p.vinculo >= 75, o: "pelo nome, de igual para igual: discorda à vontade e arrisca a pele" },
  { id: "amizade", quando: (p) => p.vinculo != null && p.vinculo >= 50, o: "pelo nome, com intimidade: puxa assunto pessoal" },
  { id: "confianca", quando: (p) => p.vinculo != null && p.vinculo >= 25, o: "pelo nome, com confiança, sem confidências" },
  { id: "estrada", quando: (p) => p.vinculo != null, o: "pelo nome, sem intimidade ainda: ninguém se confessa a quem conhece há pouco" },
  { id: "aliado", quando: (p) => /aliad|amig|companheir/.test(sem(p.relacao)), o: "pelo nome, com boa vontade" },
  { id: "forasteiro", quando: () => true, o: "como a forasteiro: cortesia pouca, e só a que custa nada" },
]);

/* O QUE CAI PRIMEIRO quando a ficha passa do teto — a voz (o tique, o
   registo e o trato) não está na lista: nunca cai. */
export const ORDEM_DO_CORTE = Object.freeze(["teme", "cenaExtra", "tambem", "agora", "sabe", "quer"]);

/* ---------------- o verificador ---------------- */
/* O QUE NENHUMA LINHA DA FICHA PODE TER. `onde: "fora"` só olha o que está
   fora das aspas (a fala decidida pelo sistema é citada, e uma ameaça
   citada pode estar no imperativo). As linhas que são o próprio cabeçalho
   da ficha (FICHA_DE_ATOR.partes) não se medem. */
export const ROTULOS_PROIBIDOS = Object.freeze([
  { id: "caixaAlta", rx: /(^|[^\p{L}])\p{Lu}{3,}(?=[^\p{L}]|$)/u, o: "palavra em caixa alta: rótulo de sistema ou grito de Mestre (NÃO PODE, RUMO, PAUTA…)", onde: "fora" },
  { id: "sistema", rx: /\bsistema\b|\bpauta\b|\benvelope\b|\bc[aâ]non(e)?\b|\bo c[oó]digo\b|\bdecidid[oa] pel[oa]\b|\bregistrad[oa] pel[oa]\b/iu, o: "fala do mecanismo" },
  { id: "narrador", rx: /\bnarr(e|ar|ação|ativa|ador)\b|\bjogador\b|\bnesta resposta\b|\bé fato\b|\btermine em\b|\bpressagiar\b|\bvoz só d/iu, o: "fala ao narrador, não da cena", onde: "fora" },
  { id: "mestre", rx: /\bMestre\b/u, o: "fala do Mestre (o «mestre de guilda» passa: é minúsculo)", onde: "fora" },
  { id: "razao", rx: /\bporque o (jogo|mundo|motor)\b|\bpor causa d[oa] (regra|motor)\b/iu, o: "dá a razão do Mestre" },
  { id: "ordem", rx: /(^|[.;:!?—]\s*)(n[aã]o |nunca )?(narre|fa[cç]a|ofere[cç]a|entregue|deixe|use|diga|mostre|ligue|costure|termine|responda|reaja|invente|prenda|d[eê] o|trate|apresente|obede[cç]a)\b/iu, o: "ordem de Mestre", onde: "fora" },
  { id: "fracao", rx: /\d+\s*\/\s*\d+/u, o: "fração de jogo (vida, vínculo)" },
  { id: "endereco", rx: /⌖|◉/u, o: "glifo de interface" },
  { id: "metro", rx: /\b\d+(?:[.,]\d+)?\s*m\b/u, o: "metros: ninguém os conta em voz alta" },
  { id: "porcento", rx: /\d+\s*%/u, o: "porcentagem" },
  { id: "nivel", rx: /\bn[ií]vel \d+|\b(batida|camada) \d+ de \d+/iu, o: "contagem de jogo" },
  { id: "emoji", rx: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, o: "ícone de interface" },
]);

const foraDasAspas = (l) => str(l).replace(/«[^»]*»/g, "«»").replace(/"[^"]*"/g, "\"\"").replace(/“[^”]*”/g, "“”");

/* a catraca: cada linha da ficha contra a tabela → [{ linha, id, o, trecho }] */
export function verificarAFicha(texto) {
  const out = [];
  const cab = new Set(FICHA_DE_ATOR.partes);
  str(texto).split("\n").forEach((linha, i) => {
    const l = linha.trim();
    if (!l || cab.has(l)) return;
    for (const r of ROTULOS_PROIBIDOS) {
      const alvo = r.onde === "fora" ? foraDasAspas(l) : l;
      const m = alvo.match(r.rx);
      if (m) out.push({ linha: i + 1, id: r.id, o: r.o, trecho: m[0].trim() });
    }
  });
  return out;
}

/* ---------------- ler a nota ---------------- */
const ROTULOS = [...new Set(SECOES.map((s) => s.rotulo))].sort((a, b) => b.length - a.length);
/* a nota em secções ({ rotulo, linhas }) e envelopes ({ tipo, texto }) */
function lerANota(nota) {
  const secoes = [], envelopes = [];
  let cur = null;
  for (const bruta of str(nota).split("\n")) {
    const l = bruta.replace(/\s+$/, "");
    if (!l.trim()) { cur = null; continue; }
    const t = l.trim();
    const r = ROTULOS.find((x) => t.startsWith(x + " ") || t.startsWith(x + ":"));
    /* o rótulo repetido («QUEM CARREGA QUEM CARREGA: …», a linha do coração
       que já traz o próprio rótulo) conta uma vez */
    if (r && (l === t || t.startsWith(r + ":"))) { let o = t.slice(r.length).replace(/^[:\s]+/, ""); if (o.startsWith(r + ":")) o = o.slice(r.length + 1).trim(); cur = { rotulo: r, linhas: [o] }; secoes.push(cur); continue; }
    const e = t.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (e) { cur = null; envelopes.push({ tipo: e[1].split("—")[0].trim(), texto: e[2] || "" }); continue; }
    if (cur && /^\s{4,}\S/.test(l)) { cur.linhas.push(t); continue; }
    if (envelopes.length && !cur) { const u = envelopes[envelopes.length - 1]; u.texto = limpo(u.texto + " " + t); continue; }
    if (cur) cur.linhas.push(t);
  }
  return { secoes, envelopes };
}

/* ---------------- o crivo: o fato fica, a ordem cai ---------------- */
/* Muitas linhas da pauta (e quase todos os envelopes) trazem o fato e,
   colada a ele, a instrução ao Mestre: «Baixo da Fonte é sua… Isto é FATO.
   Use na cena… não invente imposto». A frase que é ordem cai inteira (com
   o motivo «ordem»); a caixa alta de ênfase volta a minúscula; a fração
   de jogo entre parênteses sai. */
export const CRIVO_DA_ORDEM = Object.freeze({
  frase: /^(?:e |mas )?(?:n[aã]o |nunca )?(?:narre|fa[cç]a|ofere[cç]a|entregue|deixe|use|diga|mostre|ligue|costure|termine|responda|reaja|invente|prenda|trate|apresente|obede[cç]a|e nesta|j[aá] aplicado|isto (?:n[aã]o )?[eé])\b/iu,
  cauda: /\s+(?:—|:)\s+(?:e |mas )?(?:n[aã]o |nunca )(?:invente|narre|diga|explique|deixe|fa[cç]a)\b.*$/iu,
  fracao: /\s*\(\d+\s*\/\s*\d+\)/gu,
  porcento: /\s*\(\d+% [^)]*\)/gu,
});
function crivo(t) {
  let cortes = 0;
  const fica = [];
  for (const f0 of str(t).split(/(?<=[.!?])\s+/)) {
    const f = f0.replace(CRIVO_DA_ORDEM.fracao, "").replace(CRIVO_DA_ORDEM.porcento, "");
    if (!f.trim()) continue;
    if (CRIVO_DA_ORDEM.frase.test(f.trim())) { cortes++; continue; }
    const sc = f.replace(CRIVO_DA_ORDEM.cauda, "");
    if (sc !== f) cortes++;
    fica.push(sc.replace(/(^|[^\p{L}])(\p{Lu}{3,})(?=[^\p{L}]|$)/gu, (_, a, w) => a + w.toLowerCase()));
  }
  return { o: limpo(fica.join(" ")), cortes };
}

/* ---------------- a frase do jogador e o que o jogo resolveu nela ---------------- */
/* Na luta o App junta à frase o que o sistema já resolveu — o golpe dos
   inimigos com o dano e o «[narre como: …]», o que os companheiros
   fizeram, a fuga. É o resultado mecânico do turno: vai ao ACONTECEU dito
   em palavras (o corpo, nunca a fração), e a frase do herói fica só com o
   que ele disse. */
export const FRASE_DO_SISTEMA = Object.freeze({
  corte: /\s*(?:Turno dos inimigos \(|Meus companheiros agiram:|\[[\p{Lu}][\p{Lu} ]{2,})/u,
  inimigos: /Turno dos inimigos \([^)]*\):\s*/u,
  companheiros: /Meus companheiros agiram:\s*/u,
  golpe: /([^:→.;·]+?) \(([^)]+)\)→([^:]+): \d+ de dano = ([^(,[\]]+?)(?: \([^)]*\))?(?:, (?:de pé com (\d+)\/(\d+)|CAIU))?(?: \[narre como: ([^\];]+)[^\]]*\])?(?=[.;]|$)/gu,
  usou: /(\S[^:]*?) usou ([^:]+): \S+→([^:]+): \d+ de dano = ([^,[\]]+?)(?:, CAIU)?(?: \[narre como: ([^\];]+)[^\]]*\])?(?: — mas foi poupado: ([^.]+))?(?=\.|$)/gu,
  ergueu: /(\S[^—]*?) ergueu ([^—]+) — ([^.]+)\./gu,
  envelope: /\[(\p{Lu}[\p{Lu} ]{2,}[^\]]*)\]\s*((?:[^[]|\[(?!\p{Lu}[\p{Lu} ]{2,}))*)/gu,
});
function aFraseDoTurno(frase) {
  const t = limpo(frase);
  const i = t.search(FRASE_DO_SISTEMA.corte);
  const fala = i < 0 ? t : t.slice(0, i).trim();
  const resto = i < 0 ? "" : t.slice(i);
  const fatos = [], envelopes = [];
  if (!resto) return { fala, fatos, envelopes };
  const [ini, comp = ""] = resto.split(FRASE_DO_SISTEMA.companheiros);
  if (FRASE_DO_SISTEMA.inimigos.test(ini)) {
    for (const m of ini.replace(FRASE_DO_SISTEMA.inimigos, "").matchAll(FRASE_DO_SISTEMA.golpe)) {
      const fica = m[5] ? `; ${m[3].trim()} fica ${corpo(Number(m[5]), Number(m[6]))}` : "";
      fatos.push(`${m[1].trim()} acerta ${m[3].trim()} (${m[2].toLowerCase()}): ${m[4].trim()}${m[7] ? ` — ${m[7].trim()}` : ""}${fica}.`);
    }
  }
  for (const m of comp.matchAll(FRASE_DO_SISTEMA.usou)) fatos.push(`${m[1].trim()} usa ${m[2].trim()} contra ${m[3].trim()}: ${m[4].trim()}${m[5] ? ` — ${m[5].trim()}` : ""}${m[6] ? `; mas poupa-o: ${m[6].trim()}` : ""}.`);
  for (const m of comp.matchAll(FRASE_DO_SISTEMA.ergueu)) fatos.push(`${m[1].trim()} ergue ${m[2].trim()} — ${m[3].trim()}.`);
  for (const m of resto.matchAll(FRASE_DO_SISTEMA.envelope)) envelopes.push({ tipo: m[1].split("—")[0].trim(), texto: m[2].trim() });
  return { fala, fatos, envelopes };
}

/* ---------------- a primeira pessoa da pauta, dita do herói ---------------- */
/* a pauta fala na voz do jogador («fala comigo», «a minha cabeça»); a
   ficha fala do herói pelo nome */
const EU_DO_HEROI = [
  [/\bespera eu\b/g, "espera {H}"], [/\bcomigo\b/g, "com {H}"], [/\bde mim\b/g, "de {H}"], [/\ba mim\b/g, "a {H}"],
  [/\bpara mim\b/g, "para {H}"], [/\bme mostra\b/g, "mostra a {H}"], [/\bme trata\b/g, "trata {H}"], [/\bme dá\b/g, "dá a {H}"],
  [/\bfaz-me\b/g, "faz a {H}"], [/\bpõe-me\b/g, "põe a {H}"], [/\bminha\b/g, "de {H}"], [/\bmeu\b/g, "de {H}"],
  [/\bque eu fiz\b/g, "que {H} fez"], [/\bdo que eu fiz\b/g, "do que {H} fez"], [/\beu\b/g, "{H}"], [/\bme\b/g, "a {H}"],
];
/* a pauta também diz «o herói» na terceira pessoa: na ficha, o nome */
const oHeroiPeloNome = (t, H) => str(t).replace(/\bdo herói\b/g, `de ${H}`).replace(/\bao herói\b/g, `a ${H}`).replace(/\bpelo herói\b/g, `por ${H}`).replace(/\bo herói\b/g, H);
const doHeroi = (t, H) => { let s = str(t); for (const [de, para] of EU_DO_HEROI) s = s.replace(de, para); return s.replace(/\{H\}/g, H).replace(/\bde a minha\b/g, "de"); };

/* ---------------- as traduções, secção a secção ---------------- */
/* Cada regra: `de` (a linha da pauta), e ou `cai` (o motivo) ou `vai` (o
   destino) com `como(m, ctx)` → o texto do fato, ou um objeto para a
   pessoa ({ quem, campo, o }). A primeira que bate ganha; nenhuma bate →
   «sem tradução». */
const FECHO_GESTO = /[;,]\s*(sem cuspe|nunca o cheiro).*$/;
/* o tipo do lugar entre parênteses («aqui isto é um ruína selada»): o ator
   vê a ruína, não a categoria (diagnóstico da voz, §4) */
const MECANISMO_NO_LUGAR = /\s*·?\s*\(aqui isto é [^)]*\)/u;
export const TRADUCAO_DA_PAUTA = Object.freeze({
  "ONDE": [
    { de: /^comporta:/, cai: "regra" },
    { de: /^⌖/, cai: "contagem" },
    { de: /^(.*?)\. Eu NÃO estou na cidade.*$/, vai: "cena", como: (m, c) => `${maiuscula(m[1])}. ${c.H} está aqui, e daqui não sai nesta cena.` },
    { de: /^(.*?)\.?\s*Não faça abundar.*$/, vai: "cena", como: (m) => ponto(m[1]), extra: true },
    { de: /^fora de qualquer lugar registrado$/, vai: "cena", como: () => "Em campo aberto, longe de qualquer povoado." },
    { de: /^(.+)$/, vai: "cena", como: (m) => ponto(maiuscula(m[1].replace(MECANISMO_NO_LUGAR, "").replace(/\s·\s([^·]+)$/, ", com $1").replace(/\s·\s/g, ". "))) },
  ],
  "MASMORRA": [
    { de: /^camada \d+ de \d+.*?(\d+) tochas? na mão/, vai: "cena", como: (m) => (Number(m[1]) > 0 ? `Há tocha na mão (${porExtenso(Number(m[1]))} ao todo).` : "Ninguém leva tocha.") },
    { de: /^camada/, cai: "contagem" },
    { de: /^passagens: não dá para ver daqui$/, vai: "cena", como: () => "Daqui não se veem as passagens." },
    { de: /^passagens: (.+)$/, vai: "cena", como: (m) => `Daqui: ${ponto(m[1].replace(/ · /g, "; ").replace(/de volta: /, "para trás, "))}` },
    { de: /^o portão do fundo: (.+?)( — .*)?$/, vai: "cena", como: (m) => `O portão do fundo: ${ponto(m[1])}` },
    { de: /^a boca: (.+)$/, vai: "cena", como: (m) => `A boca: ${ponto(m[1])}` },
    { de: /^a luta aqui já acabou — caídos aqui: (.+)$/, vai: "aconteceu", como: (m) => `A luta aqui já acabou; caídos: ${ponto(m[1])}` },
  ],
  "EM CENA": [ { de: /^(.*)$/, vai: "pessoa", como: (m) => ({ emCena: m[1] }) } ],
  "QUEM É": [ { de: /^(.*)$/, vai: "pessoa", como: (m) => ({ quemE: m[1] }) } ],
  "A GENTE": [ { de: /^(.*)$/, vai: "pessoa", como: (m) => ({ agora: m[1] }) } ],
  "QUEM CARREGA": [
    { de: /^(.+?) decide ficar, e diz porquê\.?$/, vai: "diz", como: (m) => ({ quem: m[1], o: "decide ficar, e diz porquê" }) },
    { de: /^(.+?) \((.*?)(?:; é fato:[^)]*)?\): PEDE ao herói: (".*")$/, vai: "diz", como: (m) => ({ quem: m[1], oque: m[2], chega: true, o: `pede: ${m[3]}` }) },
    { de: /^(Um servo d[oa] .+?) \(é fato:[^)]*\): diz ao herói (".*")$/, vai: "diz", como: (m) => ({ quem: m[1], chega: true, o: `traz a mensagem: ${m[2]}`, semNome: true }) },
    { de: /^(.+?) \((.*?)\): (.*)$/, vai: "diz", como: (m) => ({ quem: m[1], o: m[3].replace(/^PEDE/, "pede") }) },
  ],
  "PERGUNTOU": [ { de: /^(.+)$/, vai: "pessoa", como: (m) => ({ sabe: m[1] }) } ],
  "NÃO PODE": [
    { de: /^o lugar não comporta:/, cai: "regra" },
    { de: /^(.+?) está em (.+?), a (\d+) dias? daqui — .*$/, vai: "fronteira", como: (m) => `${m[1]} está longe, em ${m[2]}, a ${porExtenso(Number(m[3]))} dia${m[3] === "1" ? "" : "s"} daqui.` },
    { de: /^Não entregue (a|o) (.+?) que a bolsa não pagou\.?$/, vai: "aconteceu", como: (m) => `${maiuscula(m[1])} ${m[2]} não foi pag${m[1]}: continua com quem a vende.` },
    { de: /^narrar a luta a começar/, vai: "aconteceu", como: () => "Ninguém trocou golpe: a luta não começou." },
    { de: /^Não deixe o herói sair pela porta da frente\.?$/, vai: "cena", como: () => "A porta da frente está fechada a quem quer sair." },
    { de: /^os golpes desta rodada foram (.+?) — .*$/, vai: "aconteceu", como: (m) => `Nesta rodada, o golpe foi este — ${ponto(m[1])}` },
    { de: /^(.+?): continua aqui — .*$/, vai: "aconteceu", como: (m) => { const q = m[1].split(/,\s+/).map((x) => x.replace(/ a (\d+(?:[.,]\d+)?) m\b/g, (_, d) => `, ${distancia(Number(String(d).replace(",", ".")))}`)); return `Continua${q.length > 1 ? "m" : ""} aqui: ${q.join("; ")}.`; } },
    { de: /^quem está no chão \((.+?)\) .*$/, vai: "pessoa", como: (m) => ({ quem: m[1], estado: "no chão, sem sentidos: não fala nem se move" }) },
    { de: /^O (.+?) não se levanta\.?$/, vai: "aconteceu", como: (m) => `O ${m[1]} não se levanta.` },
    { de: /^sou procurad([oa]) em (.+?) \((.+?)\): há (\d+) moedas pela minha cabeça.*$/, vai: "aconteceu", como: (m, c) => { c.procurado = true; return `Há ${m[4]} moedas pela cabeça de ${c.H} em ${m[2]} (${doHeroi(m[3], c.H).replace(/^ataquei\b/, "atacou")}): ninguém trata ${c.H} como forasteiro qualquer, nem lhe dá pouso.`; } },
    { de: /^CENA DE PESO \((.+?)\)/, vai: "tom", como: () => "Ninguém fala de negócio agora; quem tem laço com isto está aqui." },
    { de: /^ninguém oferece trabalho avulso ao herói nesta cena$/, vai: "cena", como: () => "Aqui ninguém tem trabalho avulso para oferecer." },
    { de: /^O (.+?) cobra (\d+) moedas, não \d+\.?$/, vai: "pessoa", como: (m) => ({ papel: m[1], sabe: `o preço é ${m[2]} moedas` }) },
  ],
  "O RUMO": [ { de: /^(.*)$/, vai: "rumo", como: (m) => m[1] } ],
  "O FECHO": [
    { de: /^termine em alguém em cena faz-me uma pergunta direta/, vai: "ultima", como: () => ({ forma: "uma pergunta direta a {H}, uma só, e acaba nela" }) },
    { de: /^termine em alguém em cena deixa uma fala a meio/, vai: "ultima", como: () => ({ forma: "uma fala que fica a meio, e acaba nela" }) },
    { de: /^termine em um corte seco/, vai: "ultima", como: () => ({ forma: "um corte seco: um fato ou um gesto, numa frase curta", ninguem: true }) },
    { de: /^termine em a consequência do que eu fiz/, vai: "ultima", como: () => ({ forma: "a consequência do que {H} fez, à vista", ninguem: true }) },
    { de: /^termine em a ficção põe-me nas mãos duas coisas que não cabem juntas/, vai: "ultima", como: () => ({ forma: "{H} fica com duas coisas nas mãos que não cabem juntas, e as duas custam", ninguem: true }) },
  ],
  "MOMENTO": [
    { de: /^ESPINHA — [^:]*: (?:\S+ )?(.+?)\. EM JOGO: (.+?)(?: A PERGUNTA: .*)?$/, vai: "cena", como: (m) => `${ponto(maiuscula(m[1].replace(/, (n[oa]s? |à guarda )/, " está $1")))} O que está em jogo: ${ponto(m[2])}` },
    { de: /^(?:A|O|UM|UMA) [\p{Lu} ]+ DEL[EA] \([^)]*\): (.+)$/u, vai: "aconteceu", como: (m) => `Já aconteceu: ${ponto(m[1])}` },
    { de: /^A PERGUNTA/, cai: "pergunta" },
    { de: /^(?!\p{Lu}{2,})(.+)$/u, vai: "cena", como: (m) => ponto(m[1]) },
  ],
  "O PESO": [ { de: /^Esta cena tem PESO: (\S+) — (.+?)\.\s*Quem tem la[cç]o.*$/, vai: "tom", como: (m) => `${maiuscula(m[1])}: ${ponto(m[2])}` } ],
  "DESFECHO": [ { de: /^(.+)$/, vai: "aconteceu", como: (m) => ponto(m[1]) } ],
  "ACABOU DE": [ { de: /^(?:\[[^\]]+\]\s*)?(.+)$/, vai: "aconteceu", como: (m) => ponto(m[1]) } ],
  "QUEM": [ { de: /^na luta agora — (.+)$/, vai: "luta", como: (m) => m[1] } ],
  "CONTRA": [ { de: /^(.+?): (.+?)(?: — em (.+?))?(?: \(mudou agora\))?$/, vai: "pessoa", como: (m) => ({ quem: m[1], quer: m[2] + (m[3] ? `; vai em ${m[3]}` : ""), fera: true }) } ],
  "A LUZ": [ { de: /^(.+)$/, vai: "cena", como: (m, c) => ponto(doHeroi(m[1], c.H).replace(/não levo luz/, `${c.H} não leva luz`)) } ],
  "A CIDADE": [ { de: /^língua: (.+)$/, vai: "cena", como: (m) => `A língua: ${ponto(m[1])}`, extra: true }, { de: /^(.+)$/, vai: "cena", como: (m) => ponto(maiuscula(m[1])), extra: true } ],
  "O PREÇO": [ { de: /^na rua, em moedas: (.+)$/, vai: "cena", como: (m) => `Na rua, em moedas: ${ponto(m[1].replace(/◉\s*/g, ""))}`, extra: true } ],
  "ANTES": [ { de: /^(.+)$/, vai: "aconteceu", como: (m) => `Já aconteceu aqui: ${ponto(m[1])}` } ],
  "O MUNDO": [ { de: /^(.+)$/, vai: "aconteceu", como: (m) => ponto(maiuscula(m[1])) } ],
  "ENTRETANTO": [ { de: /^(.+)$/, vai: "aconteceu", como: (m) => ponto(maiuscula(m[1])) } ],
  "O QUE VOLTA": [
    { de: /^(".+?") \((.+?)\) volta agora: (.+)$/, vai: "diz", como: (m) => ({ quem: m[2], o: `cumpre agora o que disse — ${m[1]}` }) },
    { de: /^(".+?") volta agora: (.+)$/, vai: "aconteceu", como: (m) => `${m[1]}: o objeto mostra agora o que é.` },
  ],
  "A APOSTA": [ { de: /^Se (passa por um fio|passa|falha): (.+?)(?: — .*| A moeda é .*)?$/, vai: "aposta", como: (m) => ({ ramo: m[1], o: m[2] }) } ],
  "A FALA": [ { de: /^(.+?) disse: (".+?")\.? Estas falas/, vai: "aconteceu", como: (m) => `${m[1]} já disse, com estas palavras: ${m[2]}` } ],
  "NOMES À MÃO": [ { de: /^(.+)$/, vai: "fronteira", como: (m) => ({ nomes: m[1] }) } ],
  "DAQUI": [ { de: /^(.+)$/, vai: "cena", como: (m) => `Daqui se alcança: ${ponto(m[1])}`, extra: true } ],
  "O BOATO": [ { de: /^(.+)$/, vai: "diz", como: (m) => ({ o: `corre um boato: ${m[1]}` }) } ],
  /* as três que nenhum dos 434 casos trouxe: o fato cru, com o herói pelo
     nome e o crivo à porta (se um dia chegarem com ordem, o crivo corta-a
     e a suíte acusa o que sobrar) */
  "FORMA": [ { de: /^(.+)$/, vai: "cena", como: (m, c) => ponto(maiuscula(doHeroi(m[1], c.H))) } ],
  "O ALIADO": [ { de: /^(.+)$/, vai: "cena", como: (m, c) => ponto(maiuscula(doHeroi(m[1], c.H))) } ],
  "O VILÃO": [ { de: /^(.+)$/, vai: "aconteceu", como: (m, c) => ponto(maiuscula(doHeroi(m[1], c.H))) } ],
});

/* as cláusulas do RUMO (juntas por «; » na pauta) */
const RUMO = [
  { de: /^reaja primeiro ao que eu fiz/, cai: "oficio" },
  { de: /^responda primeiro ao que perguntei/, cai: "oficio" },
  { de: /^o que ninguém aqui sabe, quem responde diz que não sabe$/, vai: "naoSabe" },
  { de: /^depois, e por dentro da resposta, uma coisa só aponta para: (.+)$/, vai: "aponta" },
  { de: /^e o mundo dá um sinal, aqui e agora: (?:.*?, )?(quem passa fala baixo d.+?|um viajante conta .+?) — é fato.*$/, vai: "sinal" },
  { de: /^e alguém vem até mim, aqui e agora: (.+?) vem ter com o herói .*?, vindo d[oa] (.+?): (.+?) — é fato.*$/, vai: "chega" },
  { de: /^e alguém vem até mim, com motivo próprio, por causa de (.+?): (.+)$/, vai: "motivo" },
];

/* os envelopes que vêm depois da pauta */
export const TRADUCAO_DOS_ENVELOPES = Object.freeze([
  { tipo: /^(PAUTA DO TURNO|NOTA DE ANTES)/, cai: "moldura" },
  { tipo: /^ABERTURA DA CAMPANHA/, cai: "oficio" },
  { tipo: /^OFICINA/, vai: "aconteceu", como: (t, c) => `Já feito por ${c.H}: «${ponto(t)}»` },
  { tipo: /^(AGORA|O MUNDO SE MEXE|EVENTO GLOBAL)/, vai: "aconteceu", como: (t) => ponto(t) },
  { tipo: /^A FORMA DESTA CENA/, vai: "cena", como: (t) => ponto(t.split(/\.\s+E nesta:/)[0].replace(/^A cena pede (um|uma) /, "Há $1 ")) },
  { tipo: /^(FUGA|CRIME|PROPÓSITO CUMPRIDO)/, vai: "aconteceu", como: (t) => ponto(t.replace(/\bdo herói\b/g, "de {H}").replace(/\bo herói\b/g, "{H}")) },
  { tipo: /^QUEST GERADA/, vai: "diz", como: (t) => ({ o: `chega agora: ${t}` }) },
  { tipo: /^RUMOR/, vai: "diz", como: (t) => ({ o: `corre um boato: ${t}` }) },
  { tipo: /^TRABALHO PREGADO NO MURAL/, vai: "cena", como: (t) => `No mural: ${ponto(t)}` },
  { tipo: /^O MUNDO LEMBROU/, vai: "aconteceu", como: (t) => { const m = t.match(/alguém ainda comenta — por (".+?"), (.+?)\. Isto/); return m ? `No lugar onde aconteceu, alguém ainda comenta ${m[1]} (${m[2]}).` : ponto(t.split(". Isto não")[0]); } },
  { tipo: /^A LUTA VIROU/, vai: "aconteceu", como: (t) => ponto(t.split(". Mostre")[0]) },
  { tipo: /^O COMPANHEIRO FOI EMBORA/, vai: "aconteceu", como: (t) => ponto(t.split(". Narre")[0]) },
  { tipo: /^MOVIMENTO/, vai: "aconteceu", como: (t, c) => { const m = t.match(/AGORA estou (n[ao]s? .+?)\./); return m ? `${c.H} chegou: está agora ${m[1]}.` : `${c.H} mudou de lugar.`; } },
]);

/* ---------------- quem está ---------------- */
const SEP_NOME = /\s*·\s*/;
function lerEmCena(t) {
  const [antes, semNome] = str(t).split(/;?\s*a quem não tem nome:\s*/);
  const pessoas = [], venda = [];
  for (const parte of str(antes).split(/;\s*/)) {
    if (/^à venda/.test(parte)) { venda.push(parte.replace(/◉\s*/g, "").replace(/^à venda, em moedas: /, "")); continue; }
    for (const it of parte.split(SEP_NOME)) { const m = it.match(/^(.+?)\s*\((.+?)\)$/); if (m) pessoas.push({ nome: m[1].trim(), papel: m[2].trim() }); else if (it.trim()) pessoas.push({ nome: it.trim(), papel: "" }); }
  }
  const nomes = str(semNome).split(SEP_NOME).map((x) => x.replace(/\s*\((ele|ela)\)$/, "").trim()).filter(Boolean);
  return { pessoas, venda, nomes };
}
function lerQuemE(t) {
  const m = str(t).match(/^(.+?) \(voz só d[aoe]s? .+?: (.+?)\): (.+)$/);
  if (!m) return null;
  const quer = (m[3].match(/\bquer (.+?)(?:;|\.$|$)/) || [])[1] || "";
  const teme = (m[3].match(/\bteme (.+?)(?:;|\.$|$)/) || [])[1] || "";
  return { nome: m[1], voz: m[2], quer, teme };
}

/* o registo de fala: o primeiro que bate nos textos da pessoa */
function registoDe(p) {
  const alvo = sem([p.papel, p.profissao, p.conceito, p.classe, p.oque, p.notas, p.raca].filter(Boolean).join(" "));
  const r = REGISTOS_DE_FALA.find((x) => x.de.test(alvo));
  if (!r) return null;
  const ex = r.exemplos.length ? r.exemplos[hashSemente("registo|" + p.nome) % r.exemplos.length] : "";
  return ex ? `${r.o} (${ex})` : r.o;
}
const tratoDe = (p, H) => (TRATO_DO_HEROI.find((t) => t.quando(p)) || TRATO_DO_HEROI[TRATO_DO_HEROI.length - 1]).o.replace(/\{H\}/g, H);

/* a pessoa por nome, do grupo, do registo e do núcleo */
function aGente(estado) {
  const e = ehObj(estado) ? estado : {};
  const pers = ehObj(e.personagem) ? e.personagem : {};
  const grupo = arr(pers.grupo).filter((g) => ehObj(g) && g.nome && !g.invocada);
  const npcs = ehObj(e.npcs) ? e.npcs : {};
  const nc = ehObj(e.nucleoCache) && ehObj(e.nucleoCache.nucleo) ? e.nucleoCache.nucleo : null;
  const nucleo = arr(nc && nc.pessoas).filter((p) => ehObj(p) && p.nome);
  return { pers, grupo, npcs, nucleo };
}
/* a mesma pessoa: o nome inteiro, ou o nome antes da vírgula do epíteto
   («Osric, o que…»). O primeiro nome sozinho NÃO basta: «Godfrey» e
   «Godfrey da Foz» são duas pessoas do registo (s10). */
const mesmo = (a, b) => { const x = sem(a).trim(), y = sem(b).trim(); if (!x || !y) return false; return x === y || x.split(",")[0].trim() === y.split(",")[0].trim(); };

/* ---------------- a ficha ---------------- */
export function aFichaDeAtor(entrada) {
  const ent = ehObj(entrada) ? entrada : {};
  const estado = ehObj(ent.estado) ? ent.estado : {};
  const G = aGente(estado);
  const H = limpo(G.pers.nome) || "o herói";
  const c = { H, procurado: false };
  const daFrase = aFraseDoTurno(ent.frase);
  const frase = daFrase.fala;
  const { secoes, envelopes: envNota } = lerANota(ent.nota);
  const envelopes = [...daFrase.envelopes, ...envNota];
  const rastro = [];
  const cena = [], cenaExtra = [], aconteceu = [], diz = [], tom = [], fronteira = [], longe = [];
  const pessoas = new Map();
  let ultima = null, naoSabe = false, aponta = "", nomesAMao = [], venda = [], aposta = [];
  const pessoa = (nome, base = {}) => {
    const n = limpo(nome);
    if (!n) return null;
    for (const [k, p] of pessoas) if (mesmo(k, n)) { Object.assign(p, Object.fromEntries(Object.entries(base).filter(([, v]) => v != null && v !== ""))); return p; }
    const p = { nome: n, agora: [], sabe: [], diz: [], ...base };
    pessoas.set(n, p);
    return p;
  };
  const marca = (rotulo, linha, vai, motivo) => rastro.push(motivo ? { rotulo, linha, cai: motivo } : { rotulo, linha, vai });

  /* o grupo está sempre onde o herói está */
  for (const g of G.grupo) pessoa(g.nome, { comVoce: true, vinculo: Number.isFinite(Number(g.vinculo)) ? Number(g.vinculo) : null, classe: g.classe, raca: g.raca, conceito: g.conceito });

  aconteceu.push(...daFrase.fatos);
  for (const f of daFrase.fatos) marca("a frase", f, "aconteceu");
  /* o fato que a regra traduziu ainda passa no crivo (a ordem colada cai) */
  const crivado = (rotulo, v) => {
    if (typeof v !== "string") return v;
    const k = crivo(oHeroiPeloNome(v.replace(/\{H\}/g, H), H));
    for (let i = 0; i < k.cortes; i++) marca(rotulo, v, null, "ordem");
    return k.o;
  };
  const sabes = [];
  for (const s0 of secoes) {
    /* uma linha que começa por outro rótulo («QUEM CARREGA: …» debaixo do
       PERGUNTOU) é dessa secção */
    const s = { rotulo: s0.rotulo, linhas: [] }, extras = [];
    for (const l of s0.linhas) { const r2 = ROTULOS.find((x) => x !== s0.rotulo && l.startsWith(x + ":")); if (r2) extras.push({ rotulo: r2, linhas: [l.slice(r2.length + 1).trim()] }); else s.linhas.push(l); }
    if (extras.length) secoes.splice(secoes.indexOf(s0) + 1, 0, ...extras);
    const regras = TRADUCAO_DA_PAUTA[s.rotulo];
    for (const linha0 of s.linhas) {
      const linha = linha0.replace(FECHO_GESTO, "");
      if (!regras) { marca(s.rotulo, linha0, null, "semTraducao"); continue; }
      const r = regras.find((x) => x.de.test(linha));
      if (!r) { marca(s.rotulo, linha0, null, "semTraducao"); continue; }
      if (r.cai) { marca(s.rotulo, linha0, null, r.cai); continue; }
      const m = linha.match(r.de);
      const v = r.como(m, c);
      if (r.vai === "rumo") {
        for (const cl of str(v).split(/;\s+(?=reaja|responda|o que ninguém|depois,|e o mundo|e alguém)/)) {
          const q = RUMO.find((x) => x.de.test(cl.trim()));
          if (!q) { marca("O RUMO", cl, null, "semTraducao"); continue; }
          if (q.cai) { marca("O RUMO", cl, null, q.cai); continue; }
          const mm = cl.trim().match(q.de);
          if (q.vai === "naoSabe") naoSabe = true;
          else if (q.vai === "aponta") aponta = mm[1];
          else if (q.vai === "sinal") diz.push({ o: `${maiuscula(doHeroi(mm[1], H)).replace(/\bpelo herói\b/g, `por ${H}`)}` });
          else if (q.vai === "chega") { pessoa(mm[1], { chega: `chega agora, vinda do ${mm[2]}`.replace(/vinda do (a|o) /, "vinda d$1 ") }); diz.push({ quem: mm[1], o: mm[3].replace(/\bo herói\b/g, H) }); }
          else if (q.vai === "motivo") diz.push({ o: `chega alguém, por causa de ${mm[1]}: ${mm[2].replace(/\bo herói\b/g, H).replace(/\bum NPC\b/g, "alguém")}` });
          marca("O RUMO", cl, q.vai);
        }
        continue;
      }
      marca(s.rotulo, linha0, r.vai);
      if (s.rotulo === "ONDE" && MECANISMO_NO_LUGAR.test(linha)) marca(s.rotulo, linha0, null, "mecanismo");
      if (r.vai === "cena") (r.extra ? cenaExtra : cena).push(crivado(s.rotulo, v));
      else if (r.vai === "aconteceu") aconteceu.push(crivado(s.rotulo, v));
      else if (r.vai === "tom") tom.push(crivado(s.rotulo, v));
      else if (r.vai === "fronteira") { if (ehObj(v)) nomesAMao.push(...v.nomes.split(/\s*[·,]\s*/)); else longe.push(v); }
      else if (r.vai === "ultima") ultima = v;
      else if (r.vai === "aposta") aposta.push(v);
      else if (r.vai === "luta") {
        for (const grupoTxt of str(v).split(/\s·\s/)) {
          const chao = /^no chão:/.test(grupoTxt);
          for (const it of grupoTxt.replace(/^(de pé|no chão):\s*/, "").split(/;\s*/)) {
            const mm = it.match(/^(.+?)\s+\(?(\d+)\/(\d+)\)?(?:,\s*a (\d+(?:[.,]\d+)?) m de mim)?$/);
            if (!mm) continue;
            const est = chao ? "no chão" : corpo(Number(mm[2]), Number(mm[3]));
            if (mm[1] === "eu") aconteceu.push(`${H} está ${est}.`);
            else pessoa(mm[1], { estado: est + (mm[4] ? `, ${distancia(Number(mm[4].replace(",", ".")))} de ${H}` : "") });
          }
        }
      } else if (r.vai === "diz") { if (v.quem && !v.semNome) pessoa(v.quem, { oque: v.oque ? doHeroi(v.oque, H).replace(/\bdo herói\b/g, `de ${H}`) : undefined, chega: v.chega ? "chega agora" : undefined }); diz.push({ quem: v.semNome ? "" : v.quem, o: (v.semNome ? `${v.quem} chega e ` : "") + v.o }); }
      else if (r.vai === "pessoa") {
        if (v.emCena != null) { const ec = lerEmCena(v.emCena); for (const p of ec.pessoas) pessoa(p.nome, p.papel === "com você" ? { comVoce: true } : { oque: p.papel }); nomesAMao.push(...ec.nomes); venda.push(...ec.venda); }
        else if (v.quemE != null) { const q = lerQuemE(v.quemE); if (q) pessoa(q.nome, { quer: q.quer, teme: q.teme, vozDaPauta: q.voz }); }
        else if (v.agora != null) {
          const t = doHeroi(v.agora, H);
          const conhecidos = [...pessoas.keys(), ...Object.keys(G.npcs), ...G.nucleo.map((p) => p.nome)].sort((a, b) => b.length - a.length);
          let quem = conhecidos.find((n) => t.startsWith(n + " "));
          if (!quem) quem = (t.match(/^((?:\p{Lu}[\p{L}'-]*)(?: (?:d[aeo]s?|o|a|\p{Lu}[\p{L}'-]*))*?) (?=\p{Ll})/u) || [])[1];
          if (quem) pessoa(quem).agora.push(t.slice(quem.length).trim()); else aconteceu.push(ponto(maiuscula(t)));
        }
        else if (v.sabe != null) sabes.push({ o: v.sabe.replace(/◉\s*/g, ""), papel: v.papel });
        else if (v.quem) { const p = pessoa(v.quem, { estado: v.estado }); if (v.quer) { p.quer = v.quer; p.fera = !!v.fera; } }
      }
    }
  }
  for (const e of envelopes) {
    const r = TRADUCAO_DOS_ENVELOPES.find((x) => x.tipo.test(e.tipo));
    if (!r) { marca(`[${e.tipo}]`, e.texto, null, "semTraducao"); continue; }
    if (r.cai) { marca(`[${e.tipo}]`, e.texto, null, r.cai); continue; }
    const v = r.como(limpo(e.texto), c);
    marca(`[${e.tipo}]`, e.texto, r.vai);
    if (r.vai === "cena") cena.push(crivado(`[${e.tipo}]`, v)); else if (r.vai === "aconteceu") aconteceu.push(crivado(`[${e.tipo}]`, v)); else if (r.vai === "diz") diz.push(v);
  }

  /* a aposta: o ramo que o dado deu, ou o que está em jogo */
  if (aposta.length) {
    const qual = { passa: "passa", falha: "falha", fio: "passa por um fio" }[str(ent.rolagem)];
    const ramo = qual && aposta.find((a) => a.ramo === qual);
    if (ramo) aconteceu.push(`O dado decidiu: ${ponto(ramo.o)}`);
    else aconteceu.push(`Em jogo, numa tentativa: ${aposta.map((a) => `se ${a.ramo}, ${a.o.replace(/[.\s]+$/, "")}`).join("; ")}.`);
  }

  /* cada pessoa com o que o sistema sabe dela */
  for (const p of pessoas.values()) {
    const n = Object.keys(G.npcs).find((k) => mesmo(k, p.nome));
    const reg = n ? G.npcs[n] : null;
    const nu = G.nucleo.find((x) => mesmo(x.nome, p.nome));
    if (reg) { p.papel = p.papel || reg.papel; p.relacao = reg.relacao; p.notas = reg.notas; p.profissao = reg.profissao; if (!p.oque && reg.papel) p.oque = reg.papel; }
    if (nu) {
      const f = ehObj(nu.ficha) ? nu.ficha : {};
      if (f.fala && f.fala.o) p.tique = `${f.fala.o}${f.fala.exemplo ? ` (${f.fala.exemplo})` : ""}`;
      if (!p.quer && f.quer && f.quer.o) p.quer = f.quer.o;
      if (!p.teme && f.teme && f.teme.o) p.teme = f.teme.o;
      if (!p.oque && nu.papel && !p.comVoce) p.oque = nu.papel;
      p.nucleoPapel = nu.papel;
    }
    if (!p.tique && p.vozDaPauta) p.tique = p.vozDaPauta;
    if (p.comVoce && !p.oque) p.oque = [p.raca, p.classe].filter(Boolean).join(", ").toLowerCase();
    if (c.procurado && !p.comVoce) p.procurado = true;
    if (p.fera) p.registo = REGISTOS_DE_FALA[0].o;
    else p.registo = registoDe(p);
    p.trato = p.fera ? "" : tratoDe(p, H);
  }

  /* o PERGUNTOU vai a quem responde: quem a frase chama, senão quem está
     e não é do grupo, senão o companheiro */
  const lista = [...pessoas.values()].filter((p) => !p.fera && !/no chão/.test(str(p.estado)));
  const chamado = lista.find((p) => !p.comVoce && sem(frase).includes(sem(p.nome).split(/[ ,]/)[0])) || lista.find((p) => sem(frase).includes(sem(p.nome).split(/[ ,]/)[0]));
  const responde = chamado || lista.find((p) => !p.comVoce) || lista[0] || null;
  for (const s of sabes) {
    const porPapel = s.papel && lista.find((p) => sem(p.oque).includes(sem(s.papel)));
    const alvo = porPapel || responde;
    if (alvo) alvo.sabe.push(s.o); else cena.push(`Sabe-se aqui: ${ponto(s.o)}`);
  }
  if (naoSabe) {
    /* as perguntas: as que acabam em «?» e as indiretas («pergunto ao
       taverneiro quanto custa um prato quente») */
    const diretas = (frase.match(/[^.?!]*\?/g) || []).map((q) => limpo(q.replace(/^(e|mas)\s+/i, "").replace(/^.*?:\s*/, "")));
    const indiretas = [...frase.matchAll(/\bpergunt[oa]\s+(?:(?:a|ao|à|aos|às)\s+[^,.?]+?\s+)?((?:quanto|quem|onde|como|qual|quais|quando|o que|se|por que)\b[^.?!]*)(?=[.!]|$)/giu)].map((m) => limpo(m[1]));
    const perguntas = [...diretas, ...indiretas].filter(Boolean);
    const chaves = (t) => sem(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 5);
    const ditos = chaves(sabes.map((s) => s.o).join(" "));
    const faltam = perguntas.filter((q) => !chaves(q).some((w) => ditos.includes(w)));
    const quem = responde || null;
    const o = faltam.length ? `não sabe responder a: ${faltam.map((q) => `«${q}»`).join(" ")}` : sabes.length ? `do que ${H} perguntou, não sabe mais do que isto` : `do que ${H} perguntou, não sabe a resposta`;
    if (o) { if (quem) quem.naoSabe = o; else cena.push(`Aqui ninguém sabe ${o.replace(/^não sabe /, "")}.`); }
  }
  if (aponta) {
    const comp = lista.find((p) => p.comVoce) || responde;
    const t = `${aponta.charAt(0).toLowerCase()}${aponta.slice(1)}`;
    if (comp) comp.queroAgora = t; else cena.push(`Há um rasto à frente: ${ponto(t)}`);
  }
  if (venda.length) cenaExtra.push(`À venda à vista: ${ponto(venda.join("; "))}`);
  /* quem a frase chama e não está aqui: o registo sabe onde a pessoa vive
     (s10 #35: «Pergunto a Helga…», e a Helga não estava na cena) */
  for (const [nome, reg] of Object.entries(G.npcs)) {
    if (!ehObj(reg) || [...pessoas.keys()].some((k) => mesmo(k, nome))) continue;
    const prim = sem(nome).split(/[ ,]/)[0];
    if (prim.length >= 3 && new RegExp(`(^|[^a-z])${prim}([^a-z]|$)`).test(sem(frase))) longe.push(`${nome} não está aqui${reg.local ? `: vive em ${reg.local}, fora desta cena` : ""}.`);
  }

  /* a última palavra: de quem é */
  let ultimaTxt = "";
  if (ultima) {
    const dono = ultima.ninguem ? null : (diz.find((d) => d.quem) && pessoas.get([...pessoas.keys()].find((k) => mesmo(k, diz.find((d) => d.quem).quem)))) || responde;
    const forma = ultima.forma.replace(/\{H\}/g, H);
    ultimaTxt = dono ? `É de ${dono.nome}: ${forma}.` : `${maiuscula(forma)}.`;
  }

  /* ---------------- o texto ---------------- */
  const eL = estado.lugar && ehObj(estado.lugar) ? estado.lugar : {};
  const quando = Number.isFinite(Number(estado.minuto)) ? `${maiuscula(periodo(estado.minuto))}.` : "";
  const cabCena = [cena.length ? "" : [eL.nome, estado.cidadeAtual].filter(Boolean).join(", ")].filter(Boolean).map(ponto);
  const falam = [...pessoas.values()].filter((p) => !p.fera && !/no chão/.test(str(p.estado))).map((p) => p.nome);

  const montar = (corta) => {
    const L = [];
    const tira = (k) => corta.includes(k);
    L.push("CENA", ...[...cabCena, ...cena.map(ponto), quando, ...(tira("cenaExtra") ? [] : cenaExtra.map(ponto))].filter(Boolean).map((x) => x.slice(0, FICHA_DE_ATOR.linhaMax)));
    L.push("ACONTECEU");
    if (frase) L.push(`${H}: «${frase.length > FICHA_DE_ATOR.fraseMax ? frase.slice(0, FICHA_DE_ATOR.fraseMax).replace(/\s+\S*$/, "") + "…" : frase}»`);
    L.push(...aconteceu.map(ponto));
    L.push("QUEM ESTÁ");
    const todos = [...pessoas.values()];
    const bloco = todos.slice(0, FICHA_DE_ATOR.pessoasMax), resto = todos.slice(FICHA_DE_ATOR.pessoasMax);
    if (!todos.length) L.push(`Só ${H}.`);
    for (const p of bloco) {
      L.push(`${p.nome} — ${[p.oque, p.comVoce ? `anda com ${H}` : "", p.chega, p.estado].filter(Boolean).join("; ") || "está aqui"}.`);
      const voz = [p.tique ? `${p.tique}` : "", p.registo || ""].filter(Boolean).join("; ");
      if (voz || p.trato) L.push(`  Fala: ${[voz, p.trato ? `trata ${H} ${p.trato}` : ""].filter(Boolean).join("; ")}.`);
      if (!tira("agora") && p.agora.length) L.push(`  Agora: ${ponto(p.agora.join("; "))}`);
      if (!tira("sabe") && p.sabe.length) L.push(`  Sabe: ${ponto(p.sabe.join("; "))}`);
      if (p.naoSabe) L.push(`  ${maiuscula(ponto(p.naoSabe))}`);
      const quer = [p.queroAgora, tira("quer") ? "" : p.quer].filter(Boolean);
      if (quer.length) L.push(`  Quer: ${ponto(quer.join("; e "))}`);
      if (!tira("teme") && p.teme) L.push(`  Teme, e não o diz: ${ponto(p.teme)}`);
    }
    if (resto.length && !tira("tambem")) L.push(`Também aqui: ${ponto(resto.map((p) => p.oque ? `${p.nome} (${p.oque})` : p.nome).join(", "))}`);
    L.push("O QUE SE DIZ");
    if (diz.length) for (const d of diz) L.push(ponto(d.quem ? `${d.quem}: ${d.o}` : maiuscula(d.o)));
    else L.push(`${maiuscula(FICHA_DE_ATOR.livre)}: nada que mude o mundo; a conversa é de quem está.`);
    if (ultimaTxt) L.push("A ÚLTIMA PALAVRA", ultimaTxt);
    if (tom.length) L.push("O TOM", ...tom.map(ponto));
    L.push("AS FRONTEIRAS");
    L.push(falam.length ? `Falam só: ${falam.join(", ")}.` : `Ninguém fala além de ${H}.`);
    const nm = [...new Set(nomesAMao.map(limpo).filter(Boolean))];
    if (nm.length) L.push(`À mão, para quem ainda não tem nome: ${nm.join(", ")}.`);
    L.push(...longe.map(ponto));
    L.push("Não há mais ninguém com nome, nem outro lugar, item ou moeda além dos que aqui estão.");
    return L.map((x) => oHeroiPeloNome(x, H).replace(/\s+$/, "")).join("\n");
  };
  let corta = [], texto = montar(corta);
  for (const k of ORDEM_DO_CORTE) { if (texto.length <= FICHA_DE_ATOR.teto) break; corta = [...corta, k]; texto = montar(corta); }

  const fatos = rastro.filter((r) => !r.cai || r.cai === "semTraducao");
  const caidos = {};
  for (const r of rastro) if (r.cai) caidos[r.cai] = (caidos[r.cai] || 0) + 1;
  const cobertura = { linhas: rastro.length, fatos: fatos.length, levados: fatos.filter((r) => r.vai).length, caidos, cortados: corta };
  const partes = Object.fromEntries(FICHA_DE_ATOR.partes.map((p) => [p, ""]));
  let cur = null;
  for (const l of texto.split("\n")) { if (FICHA_DE_ATOR.partes.includes(l)) { cur = l; continue; } if (cur) partes[cur] += (partes[cur] ? "\n" : "") + l; }
  return { texto, partes, pessoas: [...pessoas.values()].map((p) => ({ ...p })), falam, rastro, cobertura, trocas: asUltimasTrocas(estado) };
}

/* AS DUAS ÚLTIMAS TROCAS, tal qual (a continuidade do ator: o plano, §4).
   Do relato do save (`mensagens`: { autor, texto }), as duas últimas
   frases do jogador com a resposta que veio depois de cada uma. */
function asUltimasTrocas(estado) {
  const ms = arr(ehObj(estado) ? estado.mensagens : null).filter((m) => ehObj(m) && (m.autor === "jogador" || m.autor === "mestre") && typeof m.texto === "string");
  const out = [];
  for (let i = ms.length - 1; i >= 0 && out.length < FICHA_DE_ATOR.trocas; i--) {
    if (ms[i].autor !== "jogador") continue;
    const resp = ms.slice(i + 1).find((m) => m.autor === "mestre");
    out.unshift({ jogador: ms[i].texto.slice(0, FICHA_DE_ATOR.trocaMax), mestre: resp ? resp.texto.slice(0, FICHA_DE_ATOR.trocaMax) : "" });
  }
  return out;
}
